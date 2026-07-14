/**
 * Auth Service — Complete authentication business logic.
 *
 * Uses Phase 0 foundation:
 *   - Argon2id password hashing (core/auth/password.ts)
 *   - JWT access tokens (core/auth/jwt.ts)
 *   - Refresh token rotation (core/auth/session.ts)
 *   - Workflow Engine for user lifecycle
 *   - Audit Service for every auth event
 *   - Event Bus for domain events
 *   - Notification Engine for emails
 */

import { randomUUID } from 'node:crypto'
import {
  userRepository, userRoleRepository, loginHistoryRepository,
  passwordHistoryRepository, deviceRepository,
  invitationRepository, passwordResetRepository,
  refreshTokenRepository, hashToken,
} from '../repository'
import '@/modules/auth/workflow'
import { workflowRegistry } from '@/core/workflow'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { hashPassword, verifyPassword, checkPasswordStrength } from '@/core/auth/password'
import { signAccessToken, generateRefreshToken, hashRefreshToken, type JwtScopeClaims } from '@/core/auth/jwt'
import { PermissionChecker } from '@/core/permissions'
import { getRequestContext } from '@/core/context'
import { env } from '@/config/env'
import {
  AuthenticationError, BusinessRuleError, NotFoundError,
  ConflictError, AuthorizationError, ValidationError,
} from '@/core/errors'
import { logger } from '@/core/logging'

// ─── Config ─────────────────────────────────────────────────────────────────

const MAX_FAILED_LOGINS = 5
const LOCK_DURATION_MIN = 30
const PASSWORD_HISTORY_COUNT = 10

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LoginResult {
  accessToken: string
  refreshToken: string
  accessExpiresAt: number
  refreshExpiresAt: number
  user: {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
    roles: string[]
    permissions: string[]
    tenantId: string
    defaultCompanyId: string | null
    defaultPlantId: string | null
  }
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function getContext() {
  const ctx = getRequestContext()
  return {
    tenantId: ctx?.tenantId ?? null,
    userId: ctx?.userId ?? null,
    correlationId: ctx?.correlationId ?? 'no-correlation',
    ip: ctx?.ip ?? null,
    userAgent: ctx?.userAgent ?? null,
    ctx,
  }
}

function resolvePermissions(roles: string[]): string[] {
  return PermissionChecker.resolvePermissions(roles)
}

function buildUserResponse(user: Record<string, unknown>, roles: string[]) {
  return {
    id: String(user['id']),
    email: String(user['email']),
    username: String(user['username']),
    firstName: String(user['first_name']),
    lastName: String(user['last_name']),
    roles,
    permissions: resolvePermissions(roles),
    tenantId: String(user['tenant_id']),
    defaultCompanyId: user['default_company_id'] as string | null,
    defaultPlantId: user['default_plant_id'] as string | null,
  }
}

// ─── Auth Service ───────────────────────────────────────────────────────────

export const authService = {
  // ═══ LOGIN ═══════════════════════════════════════════════════════════════

  async login(params: {
    email: string
    password: string
    tenantId?: string
    deviceFingerprint?: string
    deviceName?: string
  }): Promise<LoginResult> {
    const { correlationId, ip, userAgent } = getContext()
    const email = params.email.toLowerCase().trim()

    // ─── Find user ──────────────────────────────────────────────────────────
    let user: Record<string, unknown> | null = null
    let tenantId = params.tenantId

    if (tenantId) {
      user = await userRepository.findByEmail(tenantId, email)
    } else {
      // If no tenant specified, try to find user across tenants (for login)
      // In production, tenant would come from subdomain or login form
      const result = await query(`SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1`, [email])
      user = result.rows[0] ?? null
      if (user) tenantId = String(user['tenant_id'])
    }

    // ─── Record login attempt (even if user not found) ──────────────────────
    const recordLogin = (success: boolean, failureReason?: string) =>
      loginHistoryRepository.record({
        tenantId: tenantId ?? '00000000-0000-0000-0000-000000000000',
        userId: user ? String(user['id']) : null,
        email,
        success,
        failureReason,
        ipAddress: ip,
        userAgent,
        deviceFingerprint: params.deviceFingerprint ?? null,
        correlationId,
      })

    if (!user) {
      await recordLogin(false, 'USER_NOT_FOUND')
      throw new AuthenticationError('Invalid email or password', 'AUTH.INVALID_CREDENTIALS')
    }

    tenantId = String(user['tenant_id'])
    const userId = String(user['id'])
    const status = String(user['status'])

    // ─── Check account status ───────────────────────────────────────────────
    if (status === 'LOCKED') {
      const lockedUntil = user['locked_until'] as string | null
      if (lockedUntil && new Date(lockedUntil) > new Date()) {
        await recordLogin(false, 'ACCOUNT_LOCKED')
        throw new AuthenticationError('Account is locked. Try again later or contact admin.', 'AUTH.ACCOUNT_LOCKED')
      }
      // Lock expired — auto-unlock
      await userRepository.unlockUser(userId!)
      user = await userRepository.findById(tenantId!, userId!)
    }

    if (status === 'DISABLED' || status === 'ARCHIVED') {
      await recordLogin(false, 'ACCOUNT_DISABLED')
      throw new AuthenticationError('Account is disabled. Contact admin.', 'AUTH.ACCOUNT_DISABLED')
    }

    if (status === 'INVITED') {
      await recordLogin(false, 'ACCOUNT_NOT_ACTIVATED')
      throw new AuthenticationError('Account not yet activated. Check your email for invitation.', 'AUTH.ACCOUNT_LOCKED')
    }

    // ─── Verify password ────────────────────────────────────────────────────
    const passwordHash = String(user!['password_hash'])
    const valid = await verifyPassword(params.password, passwordHash)

    if (!valid) {
      const failedAttempts = await userRepository.incrementFailedLogin(userId)

      if (failedAttempts >= MAX_FAILED_LOGINS) {
        await userRepository.lockUser(userId, LOCK_DURATION_MIN)
        await userRepository.updateStatus(userId, 'LOCKED')
        await recordLogin(false, 'ACCOUNT_LOCKED')

        await auditService.log({
          tenantId, correlationId,
          actorType: 'SYSTEM',
          action: 'TRANSITION',
          entityType: 'User',
          entityId: userId,
          severity: 'WARN',
          reason: `Auto-locked after ${failedAttempts} failed login attempts`,
        })

        // Publish event for notification
        await eventBus.writeToOutbox({
          eventName: 'UserLocked',
          payload: { userId, email, reason: 'MAX_FAILED_LOGINS' },
          tenantId,
        })

        throw new AuthenticationError('Account locked due to too many failed attempts.', 'AUTH.ACCOUNT_LOCKED')
      }

      await recordLogin(false, 'INVALID_CREDENTIALS')
      throw new AuthenticationError('Invalid email or password', 'AUTH.INVALID_CREDENTIALS')
    }

    // ─── Login successful ───────────────────────────────────────────────────
    await userRepository.updateLastLogin(userId, ip, userAgent)

    // Record device
    if (params.deviceFingerprint) {
      await deviceRepository.findOrCreate(tenantId, userId, params.deviceFingerprint, {
        deviceName: params.deviceName,
        ipAddress: ip ?? undefined,
        userAgent: userAgent ?? undefined,
      })
    }

    // Get roles
    const roles = await userRoleRepository.getRoles(userId)

    // Phase 1.6: Load data-scope claims for this user
    const scope = await loadUserScopeClaims(tenantId!, userId!, user!)

    // Generate tokens — include scope claims in access token
    const { token: accessToken, expiresAt: accessExpiresAt, jti } = signAccessToken({
      userId,
      tenantId,
      email: String(user!['email']),
      roles,
      permissions: resolvePermissions(roles),
      scope,
    })

    const { raw: rawRefresh, hash: refreshHash } = generateRefreshToken()
    const refreshExpiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000)

    await refreshTokenRepository.create({
      tenantId, userId, tokenHash: refreshHash,
      deviceFingerprint: params.deviceFingerprint,
      deviceName: params.deviceName,
      ipAddress: ip ?? undefined,
      userAgent: userAgent ?? undefined,
      expiresAt: refreshExpiresAt,
    })

    await recordLogin(true)

    await auditService.log({
      tenantId, correlationId,
      actorType: 'USER', actorId: userId, actorName: email,
      action: 'LOGIN', entityType: 'User', entityId: userId,
      ipAddress: ip, userAgent,
    })

    await eventBus.writeToOutbox({
      eventName: 'UserLoggedIn',
      payload: { userId, email, tenantId },
      tenantId,
    })

    return {
      accessToken,
      refreshToken: rawRefresh,
      accessExpiresAt,
      refreshExpiresAt: Math.floor(refreshExpiresAt.getTime() / 1000),
      user: buildUserResponse(user!, roles),
    }
  },

  // ═══ LOGOUT ══════════════════════════════════════════════════════════════

  async logout(refreshToken: string): Promise<void> {
    const { correlationId } = getContext()
    const tokenHash = hashRefreshToken(refreshToken)
    await refreshTokenRepository.revoke(tokenHash, 'User logout')

    const ctx = getRequestContext()
    if (ctx?.userId) {
      // Phase 1.6: Block the current access token's JTI so it can't be reused
      // The JTI is extracted from the request's JWT by the auth middleware and
      // is not directly available here, but we can block via the context if set.
      // For now, the access token will expire naturally (15 min).
      // A full implementation would extract the JTI from the request and call blockJti().

      await auditService.log({
        tenantId: ctx.tenantId!,
        correlationId,
        actorType: 'USER', actorId: ctx.userId, actorName: ctx.userEmail,
        action: 'LOGOUT', entityType: 'User', entityId: ctx.userId,
      })
    }
  },

  // ═══ REFRESH ═════════════════════════════════════════════════════════════

  async refresh(rawRefreshToken: string, params: { ipAddress?: string; userAgent?: string }): Promise<LoginResult> {
    const { correlationId } = getContext()
    const tokenHash = hashRefreshToken(rawRefreshToken)

    const existing = await refreshTokenRepository.findByTokenHash(tokenHash)
    if (!existing) {
      throw new AuthenticationError('Invalid refresh token', 'AUTH.REFRESH_TOKEN_INVALID')
    }

    // ─── Replay detection ───────────────────────────────────────────────────
    if (existing['revoked_at']) {
      // REPLAY ATTACK — revoke all sessions
      await refreshTokenRepository.revokeAllForUser(String(existing['user_id']), 'Refresh token replay detected')
      await auditService.log({
        tenantId: String(existing['tenant_id']), correlationId,
        actorType: 'SYSTEM',
        action: 'LOGOUT', entityType: 'User', entityId: String(existing['user_id']),
        severity: 'CRITICAL',
        reason: 'Refresh token replay — all sessions revoked',
      })
      throw new AuthenticationError('Refresh token replay detected. All sessions revoked.', 'AUTH.REFRESH_TOKEN_REPLAY')
    }

    if (new Date(String(existing['expires_at'])) < new Date()) {
      throw new AuthenticationError('Refresh token expired', 'AUTH.REFRESH_TOKEN_EXPIRED')
    }

    // ─── Rotate token ───────────────────────────────────────────────────────
    const userId = String(existing['user_id'])
    const tenantId = String(existing['tenant_id'])

    await refreshTokenRepository.revoke(tokenHash, 'Rotated')

    const user = await userRepository.findByIdGlobal(userId)
    if (!user) throw new AuthenticationError('User not found', 'AUTH.INVALID_CREDENTIALS')

    const roles = await userRoleRepository.getRoles(userId)

    // Phase 1.6: Reload scope claims on refresh (prevents scope loss after token rotation)
    const scope = await loadUserScopeClaims(tenantId, userId, user)

    const { token: accessToken, expiresAt: accessExpiresAt } = signAccessToken({
      userId, tenantId, email: String(user['email']), roles,
      permissions: resolvePermissions(roles),
      scope,
    })

    const { raw: newRaw, hash: newHash } = generateRefreshToken()
    const refreshExpiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000)

    await refreshTokenRepository.create({
      tenantId, userId, tokenHash: newHash,
      deviceFingerprint: existing['device_fingerprint'] as string | undefined,
      deviceName: existing['device_name'] as string | undefined,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      expiresAt: refreshExpiresAt,
    })

    return {
      accessToken,
      refreshToken: newRaw,
      accessExpiresAt,
      refreshExpiresAt: Math.floor(refreshExpiresAt.getTime() / 1000),
      user: buildUserResponse(user, roles),
    }
  },

  // ═══ CHANGE PASSWORD ══════════════════════════════════════════════════════

  async changePassword(params: {
    userId: string
    currentPassword: string
    newPassword: string
  }): Promise<void> {
    const { correlationId, ctx } = getContext()

    const user = await userRepository.findByIdGlobal(params.userId)
    if (!user) throw new NotFoundError('User', params.userId)

    // Verify current password
    const valid = await verifyPassword(params.currentPassword, String(user['password_hash']))
    if (!valid) {
      throw new AuthenticationError('Current password is incorrect', 'AUTH.INVALID_CREDENTIALS')
    }

    // Check password strength
    const strength = checkPasswordStrength(params.newPassword)
    if (!strength.valid) {
      throw new ValidationError('Password does not meet requirements', strength.issues.map((issue) => ({
        field: 'newPassword',
        code: 'WEAK_PASSWORD',
        message: issue,
      })))
    }

    // Check password history (reuse prevention)
    const history = await passwordHistoryRepository.getRecent(params.userId, PASSWORD_HISTORY_COUNT)
    for (const oldHash of history) {
      if (await verifyPassword(params.newPassword, oldHash)) {
        throw new BusinessRuleError('Cannot reuse a recent password', { code: 'AUTH.PASSWORD_REUSE' })
      }
    }

    // Hash new password
    const newHash = await hashPassword(params.newPassword)

    // Save old hash to history
    await passwordHistoryRepository.add(params.userId, String(user['password_hash']), ctx?.userId ?? undefined)

    // Update password
    await userRepository.updatePassword(params.userId, newHash, ctx?.userId ?? undefined)

    // Revoke all sessions (force re-login)
    await refreshTokenRepository.revokeAllForUser(params.userId, 'Password changed')

    await auditService.log({
      tenantId: String(user['tenant_id']), correlationId,
      actorType: 'USER', actorId: ctx?.userId, actorName: ctx?.userEmail,
      action: 'UPDATE', entityType: 'User', entityId: params.userId,
      reason: 'Password changed',
    })

    await eventBus.writeToOutbox({
      eventName: 'PasswordChanged',
      payload: { userId: params.userId, email: user['email'] },
      tenantId: String(user['tenant_id']),
    })
  },

  // ═══ FORGOT PASSWORD ══════════════════════════════════════════════════════

  async forgotPassword(email: string): Promise<{ tokenSent: boolean }> {
    const { correlationId, ip } = getContext()
    const normalizedEmail = email.toLowerCase().trim()

    // Find user (don't reveal whether user exists)
    const result = await query(`SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1`, [normalizedEmail])
    const user = result.rows[0]

    if (!user) {
      // Don't reveal that user doesn't exist
      return { tokenSent: false }
    }

    const userId = String(user['id'])
    const tenantId = String(user['tenant_id'])
    const status = String(user['status'])

    if (status === 'LOCKED' || status === 'DISABLED' || status === 'ARCHIVED') {
      return { tokenSent: false }
    }

    // Generate reset token
    const { rawToken, tokenHash: _tokenHash } = await passwordResetRepository.create(userId, tenantId, undefined, ip ?? undefined)

    await auditService.log({
      tenantId, correlationId,
      actorType: 'SYSTEM',
      action: 'UPDATE', entityType: 'User', entityId: userId,
      reason: 'Password reset requested',
    })

    // In production, send email with reset link
    logger.info('Password reset token generated', {
      userId,
      email: normalizedEmail,
      resetToken: rawToken, // In production, this would be an email link
    })

    return { tokenSent: true }
  },

  // ═══ RESET PASSWORD ═══════════════════════════════════════════════════════

  async resetPassword(params: {
    token: string
    newPassword: string
  }): Promise<void> {
    const { correlationId } = getContext()
    const tokenHash = hashToken(params.token)

    const resetToken = await passwordResetRepository.findByTokenHash(tokenHash)
    if (!resetToken) {
      throw new AuthenticationError('Invalid or expired reset token', 'AUTH.TOKEN_INVALID')
    }

    // Check password strength
    const strength = checkPasswordStrength(params.newPassword)
    if (!strength.valid) {
      throw new ValidationError('Password does not meet requirements', strength.issues.map(issue => ({
        field: 'newPassword',
        code: 'WEAK_PASSWORD',
        message: issue,
      })))
    }

    const userId = String(resetToken['user_id'])
    const tenantId = String(resetToken['tenant_id'])

    // Check password history
    const history = await passwordHistoryRepository.getRecent(userId, PASSWORD_HISTORY_COUNT)
    for (const oldHash of history) {
      if (await verifyPassword(params.newPassword, oldHash)) {
        throw new BusinessRuleError('Cannot reuse a recent password', { code: 'AUTH.PASSWORD_REUSE' })
      }
    }

    // Hash and update
    const newHash = await hashPassword(params.newPassword)
    await passwordHistoryRepository.add(userId, newHash, undefined)
    await userRepository.updatePassword(userId, newHash)

    // Mark token as used
    await passwordResetRepository.markUsed(String(resetToken['id']))

    // Revoke all sessions
    await refreshTokenRepository.revokeAllForUser(userId, 'Password reset')

    await auditService.log({
      tenantId, correlationId,
      actorType: 'USER', actorId: userId,
      action: 'UPDATE', entityType: 'User', entityId: userId,
      reason: 'Password reset via token',
    })
  },

  // ═══ INVITE USER ══════════════════════════════════════════════════════════

  async inviteUser(params: {
    email: string
    firstName?: string
    lastName?: string
    designation?: string
    roles: string[]
    defaultCompanyId?: string
    defaultPlantId?: string
    message?: string
  }): Promise<{ invitationId: string; token: string }> {
    const { tenantId, userId, correlationId, ctx } = getContext()
    if (!tenantId || !userId) throw new AuthorizationError('Authentication required')

    const email = params.email.toLowerCase().trim()

    // Check if user already exists
    const existing = await userRepository.findByEmail(tenantId, email)
    if (existing) {
      throw new ConflictError(`User with email '${email}' already exists`)
    }

    // Generate invitation token
    const rawToken = randomUUID() + randomUUID()
    const tokenHash = hashToken(rawToken)

    const invitationId = await invitationRepository.create({
      tenantId,
      email,
      invitedBy: userId,
      tokenHash,
      roles: params.roles,
      firstName: params.firstName,
      lastName: params.lastName,
      designation: params.designation,
      defaultCompanyId: params.defaultCompanyId,
      defaultPlantId: params.defaultPlantId,
      message: params.message,
    })

    await auditService.log({
      tenantId, correlationId,
      actorType: 'USER', actorId: userId, actorName: ctx?.userEmail,
      action: 'CREATE', entityType: 'UserInvitation', entityId: invitationId,
      entityCode: email,
      metadata: { roles: params.roles, email },
    })

    logger.info('User invitation created', { invitationId, email, token: rawToken })

    return { invitationId, token: rawToken }
  },

  // ═══ ACCEPT INVITATION ═════════════════════════════════════════════════════

  async acceptInvitation(params: {
    token: string
    username: string
    password: string
    firstName?: string
    lastName?: string
  }): Promise<LoginResult> {
    const { correlationId } = getContext()
    const tokenHash = hashToken(params.token)

    const invitation = await invitationRepository.findByTokenHash(tokenHash)
    if (!invitation) {
      throw new AuthenticationError('Invalid or expired invitation', 'AUTH.TOKEN_INVALID')
    }

    const tenantId = String(invitation['tenant_id'])
    const email = String(invitation['email'])

    // Check password strength
    const strength = checkPasswordStrength(params.password)
    if (!strength.valid) {
      throw new ValidationError('Password does not meet requirements', strength.issues.map(issue => ({
        field: 'password',
        code: 'WEAK_PASSWORD',
        message: issue,
      })))
    }

    // Create user
    const passwordHash = await hashPassword(params.password)
    const firstName = params.firstName || (invitation['first_name'] as string) || 'New'
    const lastName = params.lastName || (invitation['last_name'] as string) || 'User'

    const user = await userRepository.create({
      tenantId,
      username: params.username,
      email,
      passwordHash,
      firstName,
      lastName,
      designation: invitation['designation'] as string | undefined,
      status: 'ACTIVATED',
      invitedBy: invitation['invited_by'] as string,
      defaultCompanyId: invitation['default_company_id'] as string | undefined,
      defaultPlantId: invitation['default_plant_id'] as string | undefined,
    })

    if (!user) throw new Error('Failed to create user')

    const userId = String(user['id'])

    // Assign roles
    const roles = invitation['roles'] as string[]
    for (const role of roles) {
      await userRoleRepository.assignRole(tenantId, userId, role, invitation['invited_by'] as string)
    }

    // Mark invitation as accepted
    await invitationRepository.markAccepted(String(invitation['id']), userId)

    // Transition user to ACTIVE
    await userRepository.updateStatus(userId, 'ACTIVE')

    // Record password in history
    await passwordHistoryRepository.add(userId, passwordHash)

    await auditService.log({
      tenantId, correlationId,
      actorType: 'USER', actorId: userId, actorName: email,
      action: 'CREATE', entityType: 'User', entityId: userId,
      entityCode: email,
      reason: 'User accepted invitation',
    })

    await eventBus.writeToOutbox({
      eventName: 'UserRegistered',
      payload: { userId, email, tenantId },
      tenantId,
    })

    // Auto-login
    return this.login({
      email,
      password: params.password,
      tenantId,
    })
  },

  // ═══ GET CURRENT USER ═════════════════════════════════════════════════════

  async getCurrentUser(): Promise<{
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
    roles: string[]
    permissions: string[]
    tenantId: string
    defaultCompanyId: string | null
    defaultPlantId: string | null
    designation: string | null
    timezone: string
    locale: string
    lastLoginAt: string | null
    emailVerified: boolean
    mfaEnabled: boolean
  }> {
    const ctx = getRequestContext()
    if (!ctx?.userId) throw new AuthorizationError('Authentication required')

    const user = await userRepository.findByIdGlobal(ctx.userId)
    if (!user) throw new NotFoundError('User', ctx.userId)

    const roles = await userRoleRepository.getRoles(ctx.userId)

    return {
      id: String(user['id']),
      email: String(user['email']),
      username: String(user['username']),
      firstName: String(user['first_name']),
      lastName: String(user['last_name']),
      roles,
      permissions: resolvePermissions(roles),
      tenantId: String(user['tenant_id']),
      defaultCompanyId: user['default_company_id'] as string | null,
      defaultPlantId: user['default_plant_id'] as string | null,
      designation: user['designation'] as string | null,
      timezone: String(user['timezone']),
      locale: String(user['locale']),
      lastLoginAt: user['last_login_at'] as string | null,
      emailVerified: user['email_verified'] as boolean,
      mfaEnabled: user['mfa_enabled'] as boolean,
    }
  },

  // ═══ LIST SESSIONS ════════════════════════════════════════════════════════

  async listSessions(): Promise<unknown[]> {
    const ctx = getRequestContext()
    if (!ctx?.userId) throw new AuthorizationError('Authentication required')
    return refreshTokenRepository.listActiveForUser(ctx.userId)
  },

  // ═══ REVOKE SESSION ═══════════════════════════════════════════════════════

  async revokeSession(tokenHash: string): Promise<void> {
    const ctx = getRequestContext()
    if (!ctx?.userId) throw new AuthorizationError('Authentication required')
    await refreshTokenRepository.revoke(tokenHash, 'Revoked by user')

    await auditService.log({
      tenantId: ctx.tenantId!,
      correlationId: ctx.correlationId,
      actorType: 'USER', actorId: ctx.userId, actorName: ctx.userEmail,
      action: 'LOGOUT', entityType: 'Session', entityId: tokenHash,
      reason: 'Session revoked by user',
    })
  },

  // ═══ LIST DEVICES ═════════════════════════════════════════════════════════

  async listDevices(): Promise<unknown[]> {
    const ctx = getRequestContext()
    if (!ctx?.userId) throw new AuthorizationError('Authentication required')
    return deviceRepository.listForUser(ctx.userId)
  },

  // ═══ LOCK / UNLOCK (admin) ════════════════════════════════════════════════

  async lockUser(targetUserId: string): Promise<void> {
    const { tenantId, userId, correlationId, ctx } = getContext()
    if (!userId) throw new AuthorizationError('Authentication required')

    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('UserLifecycle')
    const user = await userRepository.findByIdGlobal(targetUserId)
    if (!user) throw new NotFoundError('User', targetUserId)

    const check = await machine.canTransition({ id: targetUserId, status: String(user['status']), version: Number(user['version']) }, 'LOCKED', {
      userId, tenantId: tenantId!, correlationId,
    })
    if (!check.allowed) {
      throw new BusinessRuleError(`Cannot lock user: ${check.reason}`, { code: 'AUTH.TRANSITION_DENIED' })
    }

    await userRepository.lockUser(targetUserId, LOCK_DURATION_MIN)
    await userRepository.updateStatus(targetUserId, 'LOCKED', userId)
    await refreshTokenRepository.revokeAllForUser(targetUserId, 'Account locked by admin')

    await auditService.log({
      tenantId: tenantId!, correlationId,
      actorType: 'USER', actorId: userId, actorName: ctx?.userEmail,
      action: 'TRANSITION', entityType: 'User', entityId: targetUserId,
      severity: 'WARN', reason: 'Account locked by admin',
    })
  },

  async unlockUser(targetUserId: string): Promise<void> {
    const { tenantId, userId, correlationId, ctx } = getContext()
    if (!userId) throw new AuthorizationError('Authentication required')

    await userRepository.unlockUser(targetUserId)

    await auditService.log({
      tenantId: tenantId!, correlationId,
      actorType: 'USER', actorId: userId, actorName: ctx?.userEmail,
      action: 'TRANSITION', entityType: 'User', entityId: targetUserId,
      reason: 'Account unlocked by admin',
    })
  },
}

// ─── Import query for cross-tenant lookup ───────────────────────────────────

import { query } from '@/core/db/pglite'

// ─── Phase 1.6: User Scope Loader ───────────────────────────────────────────

/**
 * Load a user's data-scope assignments from the database.
 *
 * This reads the user's default company/plant/department from the Users table
 * and looks up any user_assignments table (if present) for additional warehouse/plant
 * assignments. If the user_assignments table doesn't exist, falls back to using
 * just the default company/plant from the user profile.
 */
async function loadUserScopeClaims(
  tenantId: string,
  userId: string,
  user: Record<string, unknown>
): Promise<JwtScopeClaims> {
  const scope: JwtScopeClaims = {}

  // Company scope — from user's default_company_id
  const defaultCompanyId = user['default_company_id'] as string | null
  if (defaultCompanyId) {
    scope.companyIds = [defaultCompanyId]
  }

  // Plant scope — from user's default_plant_id
  const defaultPlantId = user['default_plant_id'] as string | null
  if (defaultPlantId) {
    scope.plantIds = [defaultPlantId]
  }

  // Department scope — from user's department_id
  const departmentId = user['department_id'] as string | null
  if (departmentId) {
    scope.departmentIds = [departmentId]
  }

  // Try to load additional warehouse/plant assignments from user_assignments table
  // (if it exists). This allows a user to be assigned to multiple warehouses.
  try {
    const assignments = await query<{
      warehouse_id: string | null
      plant_id: string | null
      company_id: string | null
      department_id: string | null
    }>(
      `SELECT warehouse_id, plant_id, company_id, department_id
       FROM user_assignments
       WHERE tenant_id = $1 AND user_id = $2 AND status = 'ACTIVE' AND deleted_at IS NULL`,
      [tenantId, userId]
    )

    if (assignments.rows.length > 0) {
      const warehouseIds = new Set<string>(scope.warehouseIds ?? [])
      const plantIds = new Set<string>(scope.plantIds ?? [])
      const companyIds = new Set<string>(scope.companyIds ?? [])
      const departmentIds = new Set<string>(scope.departmentIds ?? [])

      for (const row of assignments.rows) {
        if (row.warehouse_id) warehouseIds.add(row.warehouse_id)
        if (row.plant_id) plantIds.add(row.plant_id)
        if (row.company_id) companyIds.add(row.company_id)
        if (row.department_id) departmentIds.add(row.department_id)
      }

      if (warehouseIds.size > 0) scope.warehouseIds = Array.from(warehouseIds)
      if (plantIds.size > 0) scope.plantIds = Array.from(plantIds)
      if (companyIds.size > 0) scope.companyIds = Array.from(companyIds)
      if (departmentIds.size > 0) scope.departmentIds = Array.from(departmentIds)
    }
  } catch {
    // user_assignments table may not exist yet — fall back to defaults only
    // (already set above from user profile)
  }

  return scope
}

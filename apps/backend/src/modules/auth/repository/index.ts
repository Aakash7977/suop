/**
 * Auth Repository — Database operations for authentication entities.
 * Uses PGlite directly. Production will use Prisma client.
 */

import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'
import { createHash } from 'node:crypto'

// ─── Hash Helper ────────────────────────────────────────────────────────────

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// ─── User Repository ────────────────────────────────────────────────────────

export const userRepository = {
  async findByEmail(tenantId: string, email: string) {
    const result = await query(`SELECT * FROM users WHERE tenant_id = $1 AND email = $2 AND deleted_at IS NULL`, [tenantId, email])
    return result.rows[0] ?? null
  },

  async findByUsername(tenantId: string, username: string) {
    const result = await query(`SELECT * FROM users WHERE tenant_id = $1 AND username = $2 AND deleted_at IS NULL`, [tenantId, username])
    return result.rows[0] ?? null
  },

  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM users WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },

  async findByIdGlobal(id: string) {
    const result = await query(`SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`, [id])
    return result.rows[0] ?? null
  },

  async create(data: {
    tenantId: string
    username: string
    email: string
    passwordHash: string
    firstName: string
    lastName: string
    designation?: string
    status?: string
    invitedBy?: string
    defaultCompanyId?: string
    defaultPlantId?: string
  }) {
    const id = randomUUID()
    await query(
      `INSERT INTO users (id, tenant_id, username, email, email_verified, password_hash, password_algorithm,
        status, first_name, last_name, designation, invited_by, invited_at,
        default_company_id, default_plant_id, version, created_at, updated_at)
       VALUES ($1,$2,$3,$4,false,$5,'ARGON2ID',$6,$7,$8,$9,$10,NOW(),$11,$12,0,NOW(),NOW())`,
      [id, data.tenantId, data.username, data.email, data.passwordHash,
       data.status || 'INVITED', data.firstName, data.lastName, data.designation ?? null,
       data.invitedBy ?? null, data.defaultCompanyId ?? null, data.defaultPlantId ?? null]
    )
    return this.findById(data.tenantId, id)
  },

  async updatePassword(userId: string, passwordHash: string, updatedBy?: string) {
    await query(
      `UPDATE users SET password_hash = $2, password_changed_at = NOW(), version = version + 1, updated_at = NOW(), updated_by = $3
       WHERE id = $1`,
      [userId, passwordHash, updatedBy ?? null]
    )
  },

  async updateStatus(userId: string, status: string, updatedBy?: string) {
    const result = await query(
      `UPDATE users SET status = $2, version = version + 1, updated_at = NOW(), updated_by = $3
       WHERE id = $1 RETURNING *`,
      [userId, status, updatedBy ?? null]
    )
    return result.rows[0] ?? null
  },

  async updateLastLogin(userId: string, ip: string | null, userAgent: string | null) {
    await query(
      `UPDATE users SET last_login_at = NOW(), last_login_ip = $2, last_login_user_agent = $3, failed_login_attempts = 0, version = version + 1, updated_at = NOW()
       WHERE id = $1`,
      [userId, ip, userAgent]
    )
  },

  async incrementFailedLogin(userId: string) {
    const result = await query(
      `UPDATE users SET failed_login_attempts = failed_login_attempts + 1, version = version + 1, updated_at = NOW()
       WHERE id = $1 RETURNING failed_login_attempts`,
      [userId]
    )
    return result.rows[0]?.['failed_login_attempts'] as number ?? 0
  },

  async lockUser(userId: string, lockDurationMin: number) {
    await query(
      `UPDATE users SET status = 'LOCKED', locked_until = NOW() + INTERVAL '${lockDurationMin} minutes', version = version + 1, updated_at = NOW()
       WHERE id = $1`,
      [userId]
    )
  },

  async unlockUser(userId: string) {
    await query(
      `UPDATE users SET status = 'ACTIVE', failed_login_attempts = 0, locked_until = NULL, version = version + 1, updated_at = NOW()
       WHERE id = $1`,
      [userId]
    )
  },

  async getEmailVerified(userId: string) {
    const result = await query(`SELECT email_verified FROM users WHERE id = $1`, [userId])
    return result.rows[0]?.['email_verified'] as boolean ?? false
  },

  async setEmailVerified(userId: string) {
    await query(`UPDATE users SET email_verified = true, version = version + 1, updated_at = NOW() WHERE id = $1`, [userId])
  },
}

// ─── User Roles Repository ──────────────────────────────────────────────────

export const userRoleRepository = {
  async getRoles(userId: string): Promise<string[]> {
    const result = await query(`SELECT role_name FROM user_roles WHERE user_id = $1 AND revoked_at IS NULL`, [userId])
    return result.rows.map((r: Record<string, unknown>) => String(r['role_name']))
  },

  async assignRole(tenantId: string, userId: string, roleName: string, assignedBy?: string) {
    await query(
      `INSERT INTO user_roles (id, tenant_id, user_id, role_name, assigned_by, assigned_at, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (tenant_id, user_id, role_name) DO UPDATE SET revoked_at = NULL, assigned_at = NOW()`,
      [randomUUID(), tenantId, userId, roleName, assignedBy ?? null]
    )
  },

  async revokeRole(userId: string, roleName: string) {
    await query(`UPDATE user_roles SET revoked_at = NOW() WHERE user_id = $1 AND role_name = $2 AND revoked_at IS NULL`, [userId, roleName])
  },
}

// ─── Login History Repository ───────────────────────────────────────────────

export const loginHistoryRepository = {
  async record(data: {
    tenantId: string
    userId?: string | null
    email: string
    success: boolean
    failureReason?: string
    ipAddress?: string | null
    userAgent?: string | null
    deviceFingerprint?: string | null
    correlationId: string
  }) {
    await query(
      `INSERT INTO login_history (id, tenant_id, user_id, email, login_method, success, failure_reason, ip_address, user_agent, device_fingerprint, correlation_id, timestamp)
       VALUES ($1, $2, $3, $4, 'PASSWORD', $5, $6, $7, $8, $9, $10, NOW())`,
      [randomUUID(), data.tenantId, data.userId ?? null, data.email, data.success,
       data.failureReason ?? null, data.ipAddress ?? null, data.userAgent ?? null,
       data.deviceFingerprint ?? null, data.correlationId]
    )
  },

  async getRecentFailures(email: string, withinMin: number = 15): Promise<number> {
    const result = await query(
      `SELECT COUNT(*) as cnt FROM login_history WHERE email = $1 AND success = false AND timestamp > NOW() - INTERVAL '${withinMin} minutes'`,
      [email]
    )
    return Number(result.rows[0]?.['cnt'] ?? 0)
  },

  async listForUser(userId: string, limit: number = 20) {
    const result = await query(
      `SELECT * FROM login_history WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2`,
      [userId, limit]
    )
    return result.rows
  },
}

// ─── Password History Repository ────────────────────────────────────────────

export const passwordHistoryRepository = {
  async add(userId: string, passwordHash: string, changedBy?: string) {
    await query(
      `INSERT INTO password_history (id, tenant_id, user_id, password_hash, password_algorithm, changed_at, changed_by)
       SELECT $1, tenant_id, $2, $3, 'ARGON2ID', NOW(), $4 FROM users WHERE id = $2`,
      [randomUUID(), userId, passwordHash, changedBy ?? null]
    )
  },

  async getRecent(userId: string, count: number = 10): Promise<string[]> {
    const result = await query(
      `SELECT password_hash FROM password_history WHERE user_id = $1 ORDER BY changed_at DESC LIMIT $2`,
      [userId, count]
    )
    return result.rows.map((r: Record<string, unknown>) => String(r['password_hash']))
  },
}

// ─── Device Registry Repository ─────────────────────────────────────────────

export const deviceRepository = {
  async findOrCreate(tenantId: string, userId: string, fingerprint: string, data: {
    deviceName?: string
    deviceType?: string
    operatingSystem?: string
    browser?: string
    ipAddress?: string
    userAgent?: string
  }): Promise<Record<string, unknown> | undefined> {
    const existing = await query(
      `SELECT * FROM device_registry WHERE tenant_id = $1 AND user_id = $2 AND device_fingerprint = $3`,
      [tenantId, userId, fingerprint]
    )
    if (existing.rows.length > 0) {
      await query(
        `UPDATE device_registry SET last_seen_at = NOW(), ip_address = $4, user_agent = $5, updated_at = NOW()
         WHERE tenant_id = $1 AND user_id = $2 AND device_fingerprint = $3`,
        [tenantId, userId, fingerprint, data.ipAddress ?? null, data.userAgent ?? null]
      )
      return existing.rows[0]
    }
    const id = randomUUID()
    await query(
      `INSERT INTO device_registry (id, tenant_id, user_id, device_fingerprint, device_name, device_type, operating_system, browser, ip_address, user_agent, first_seen_at, last_seen_at, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW(),NOW(),NOW())`,
      [id, tenantId, userId, fingerprint, data.deviceName ?? null, data.deviceType ?? null,
       data.operatingSystem ?? null, data.browser ?? null, data.ipAddress ?? null, data.userAgent ?? null]
    )
    return this.findOrCreate(tenantId, userId, fingerprint, data)
  },

  async listForUser(userId: string) {
    const result = await query(`SELECT * FROM device_registry WHERE user_id = $1 ORDER BY last_seen_at DESC`, [userId])
    return result.rows
  },
}

// ─── Invitation Repository ──────────────────────────────────────────────────

export const invitationRepository = {
  async create(data: {
    tenantId: string
    email: string
    invitedBy: string
    tokenHash: string
    roles: string[]
    firstName?: string
    lastName?: string
    designation?: string
    defaultCompanyId?: string
    defaultPlantId?: string
    message?: string
  }) {
    const id = randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await query(
      `INSERT INTO user_invitations (id, tenant_id, email, invited_by, token_hash, roles, first_name, last_name, designation, default_company_id, default_plant_id, message, status, expires_at, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'PENDING',$13,NOW(),NOW())`,
      [id, data.tenantId, data.email, data.invitedBy, data.tokenHash, data.roles,
       data.firstName ?? null, data.lastName ?? null, data.designation ?? null,
       data.defaultCompanyId ?? null, data.defaultPlantId ?? null, data.message ?? null, expiresAt]
    )
    return id
  },

  async findByTokenHash(tokenHash: string) {
    const result = await query(`SELECT * FROM user_invitations WHERE token_hash = $1 AND status = 'PENDING'`, [tokenHash])
    return result.rows[0] ?? null
  },

  async markAccepted(id: string, userId: string) {
    await query(
      `UPDATE user_invitations SET status = 'ACCEPTED', accepted_at = NOW(), accepted_by_user_id = $2, updated_at = NOW() WHERE id = $1`,
      [id, userId]
    )
  },

  async listPending(tenantId: string) {
    const result = await query(
      `SELECT * FROM user_invitations WHERE tenant_id = $1 AND status = 'PENDING' AND expires_at > NOW() ORDER BY created_at DESC`,
      [tenantId]
    )
    return result.rows
  },
}

// ─── Password Reset Token Repository ────────────────────────────────────────

export const passwordResetRepository = {
  async create(userId: string, tenantId: string, requestedBy?: string, requestedIp?: string) {
    const id = randomUUID()
    const rawToken = randomUUID() + randomUUID()
    const tokenHash = hashToken(rawToken)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    await query(
      `INSERT INTO password_reset_tokens (id, tenant_id, user_id, token_hash, status, requested_by, requested_ip, expires_at, created_at)
       VALUES ($1,$2,$3,$4,'PENDING',$5,$6,$7,NOW())`,
      [id, tenantId, userId, tokenHash, requestedBy ?? null, requestedIp ?? null, expiresAt]
    )
    return { rawToken, tokenHash, expiresAt }
  },

  async findByTokenHash(tokenHash: string) {
    const result = await query(`SELECT * FROM password_reset_tokens WHERE token_hash = $1 AND status = 'PENDING' AND expires_at > NOW()`, [tokenHash])
    return result.rows[0] ?? null
  },

  async markUsed(id: string) {
    await query(`UPDATE password_reset_tokens SET status = 'USED', used_at = NOW() WHERE id = $1`, [id])
  },
}

// ─── Refresh Token Repository (extends Phase 0) ─────────────────────────────

export const refreshTokenRepository = {
  async create(data: {
    tenantId: string
    userId: string
    tokenHash: string
    deviceFingerprint?: string
    deviceName?: string
    ipAddress?: string
    userAgent?: string
    expiresAt: Date
    previousTokenHash?: string
  }) {
    const id = randomUUID()
    await query(
      `INSERT INTO refresh_tokens (id, tenant_id, user_id, token_hash, device_fingerprint, device_name, ip_address, user_agent, issued_at, expires_at, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),$9,NOW())`,
      [id, data.tenantId, data.userId, data.tokenHash, data.deviceFingerprint ?? null,
       data.deviceName ?? null, data.ipAddress ?? null, data.userAgent ?? null, data.expiresAt]
    )
    return id
  },

  async findByTokenHash(tokenHash: string) {
    const result = await query(`SELECT * FROM refresh_tokens WHERE token_hash = $1`, [tokenHash])
    return result.rows[0] ?? null
  },

  async revoke(tokenHash: string, reason: string) {
    await query(`UPDATE refresh_tokens SET revoked_at = NOW(), revoked_reason = $2 WHERE token_hash = $1 AND revoked_at IS NULL`, [tokenHash, reason])
  },

  async revokeAllForUser(userId: string, reason: string) {
    await query(`UPDATE refresh_tokens SET revoked_at = NOW(), revoked_reason = $2 WHERE user_id = $1 AND revoked_at IS NULL`, [userId, reason])
  },

  async listActiveForUser(userId: string) {
    const result = await query(
      `SELECT * FROM refresh_tokens WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW() ORDER BY issued_at DESC`,
      [userId]
    )
    return result.rows
  },
}

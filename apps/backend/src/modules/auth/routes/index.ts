/**
 * Auth API Routes
 *
 * POST   /login               — Login with email + password
 * POST   /logout              — Logout (revoke refresh token)
 * POST   /refresh             — Refresh access token
 * POST   /forgot-password     — Request password reset
 * POST   /reset-password      — Reset password with token
 * POST   /change-password     — Change password (authenticated)
 * GET    /me                  — Get current user
 * GET    /sessions            — List active sessions
 * POST   /sessions/:id/revoke — Revoke a session
 * GET    /devices             — List registered devices
 * POST   /invite              — Invite a user (admin)
 * POST   /accept-invitation   — Accept invitation + create account
 */

import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { authService } from '../service'
import { getRequestContext } from '@/core/context'
import { verifyAccessToken } from '@/core/auth/jwt'
import { blockJti } from '@/core/security/jwt-security'
import { loginRateLimit, passwordResetRateLimit } from '@/middleware/security/rate-limit'

export const authRoutes = new Hono()

// ─── Schemas ────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantId: z.string().uuid().optional(),
  deviceFingerprint: z.string().optional(),
  deviceName: z.string().optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12),
})

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(12),
})

const inviteSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  designation: z.string().optional(),
  roles: z.array(z.string()).min(1),
  defaultCompanyId: z.string().uuid().optional(),
  defaultPlantId: z.string().uuid().optional(),
  message: z.string().optional(),
})

const acceptInvitationSchema = z.object({
  token: z.string().min(1),
  username: z.string().min(3).max(50),
  password: z.string().min(12),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

// ─── Routes ─────────────────────────────────────────────────────────────────

// Login (public) — Phase 1.6: login rate limit applied (5 attempts per 5 min per IP)
authRoutes.post('/login', loginRateLimit, zValidator('json', loginSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof loginSchema>
  const result = await authService.login(body)
  return c.json(success(result, { message: 'Login successful' }))
})

// Logout (authenticated)
authRoutes.post('/logout', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  if (body.refreshToken) {
    await authService.logout(body.refreshToken)
  }

  // Phase 1.6: Block the current access token's JTI so it can't be reused
  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7)
      const payload = verifyAccessToken(token)
      if (payload.jti && payload.exp) {
        await blockJti(payload.jti, payload.exp)
      }
    } catch {
      // Token verification failure is acceptable on logout — the token may already be expired
    }
  }

  return c.json(success({ loggedOut: true }, { message: 'Logout successful' }))
})

// Refresh (public — uses refresh token, not access token)
authRoutes.post('/refresh', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  if (!body.refreshToken) {
    return c.json({ success: false, error: { code: 'AUTH.TOKEN_MISSING', message: 'Refresh token required' } }, 400)
  }
  const ctx = getRequestContext()
  const result = await authService.refresh(body.refreshToken, {
    ipAddress: ctx?.ip ?? undefined,
    userAgent: ctx?.userAgent ?? undefined,
  })
  return c.json(success(result, { message: 'Token refreshed' }))
})

// Forgot password (public)
authRoutes.post('/forgot-password', passwordResetRateLimit, zValidator('json', forgotPasswordSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof forgotPasswordSchema>
  const result = await authService.forgotPassword(body.email)
  return c.json(success(result, { message: 'If the email exists, a reset link has been sent' }))
})

// Reset password (public — uses reset token)
authRoutes.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof resetPasswordSchema>
  await authService.resetPassword(body)
  return c.json(success({ reset: true }, { message: 'Password reset successful. Please login with your new password.' }))
})

// Change password (authenticated)
authRoutes.post('/change-password', zValidator('json', changePasswordSchema), async (c) => {
  const ctx = getRequestContext()
  if (!ctx?.userId) {
    return c.json({ success: false, error: { code: 'AUTH.TOKEN_MISSING', message: 'Authentication required' } }, 401)
  }
  const body = c.req.valid('json' as never) as z.infer<typeof changePasswordSchema>
  await authService.changePassword({
    userId: ctx.userId,
    currentPassword: body.currentPassword,
    newPassword: body.newPassword,
  })
  return c.json(success({ changed: true }, { message: 'Password changed. All sessions have been revoked.' }))
})

// Get current user (authenticated) — Phase 1.6: includes scope context for frontend
authRoutes.get('/me', async (c) => {
  const ctx = getRequestContext()
  if (!ctx?.userId) {
    return c.json({ success: false, error: { code: 'AUTH.TOKEN_MISSING', message: 'Authentication required' } }, 401)
  }
  const user = await authService.getCurrentUser()
  // Phase 1.6: Return scope context for frontend RBAC
  const { getScopeContextForFrontend } = await import('@/middleware/scope-context')
  const scope = getScopeContextForFrontend()
  return c.json(success({ ...user, scope }))
})

// List sessions (authenticated)
authRoutes.get('/sessions', async (c) => {
  const ctx = getRequestContext()
  if (!ctx?.userId) {
    return c.json({ success: false, error: { code: 'AUTH.TOKEN_MISSING', message: 'Authentication required' } }, 401)
  }
  const sessions = await authService.listSessions()
  return c.json(success(sessions))
})

// Revoke session (authenticated)
authRoutes.post('/sessions/:id/revoke', async (c) => {
  const ctx = getRequestContext()
  if (!ctx?.userId) {
    return c.json({ success: false, error: { code: 'AUTH.TOKEN_MISSING', message: 'Authentication required' } }, 401)
  }
  const tokenHash = c.req.param('id')!
  await authService.revokeSession(tokenHash)
  return c.json(success({ revoked: true }, { message: 'Session revoked' }))
})

// List devices (authenticated)
authRoutes.get('/devices', async (c) => {
  const ctx = getRequestContext()
  if (!ctx?.userId) {
    return c.json({ success: false, error: { code: 'AUTH.TOKEN_MISSING', message: 'Authentication required' } }, 401)
  }
  const devices = await authService.listDevices()
  return c.json(success(devices))
})

// Invite user (admin only)
authRoutes.post('/invite', requirePermission(Permission.AUTH_MANAGE_USERS), zValidator('json', inviteSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof inviteSchema>
  const result = await authService.inviteUser(body)
  return c.json(success(result, { message: 'Invitation sent' }), 201)
})

// Accept invitation (public)
authRoutes.post('/accept-invitation', zValidator('json', acceptInvitationSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof acceptInvitationSchema>
  const result = await authService.acceptInvitation(body)
  return c.json(success(result, { message: 'Account activated successfully' }), 201)
})

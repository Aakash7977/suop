/**
 * Break Glass Service
 * Manages emergency access sessions — time-limited, read + configure only,
 * fully audited, rate-limited, auto-revoked.
 */

import { query } from '@/core/db/pglite'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { BusinessRuleError, AuthorizationError } from '@/core/errors'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx }
}

const MAX_DURATION_HOURS = 4
const MAX_ACTIVATIONS_PER_24H = 2
const SECURITY_OFFICER_ROLE = 'tenant_admin'  // Configurable

export const breakGlassService = {
  /**
   * Activate break glass emergency access.
   * Creates a session with mandatory reason, time limit, and CRITICAL audit.
   */
  async activate(reason: string): Promise<{ sessionId: string; expiresAt: string }> {
    const { tenantId, userId, userEmail, ctx } = getContext()

    if (!reason || reason.trim().length < 10) {
      throw new BusinessRuleError('Reason must be at least 10 characters', { code: 'BREAK_GLASS.REASON_REQUIRED' })
    }

    // Rate limit: max 2 activations per 24 hours
    const recentActivations = await query(
      `SELECT COUNT(*) as cnt FROM break_glass_sessions WHERE tenant_id = $1 AND user_id = $2 AND activated_at > NOW() - INTERVAL '24 hours'`,
      [tenantId, userId]
    )
    const recentCount = Number(recentActivations.rows[0]?.['cnt'] ?? 0)
    if (recentCount >= MAX_ACTIVATIONS_PER_24H) {
      throw new BusinessRuleError(`Rate limit exceeded: maximum ${MAX_ACTIVATIONS_PER_24H} break glass activations per 24 hours`, { code: 'BREAK_GLASS.RATE_LIMIT' })
    }

    // Check for existing active session
    const existing = await query(
      `SELECT id FROM break_glass_sessions WHERE tenant_id = $1 AND user_id = $2 AND status = 'ACTIVE' AND revoked_at IS NULL AND expires_at > NOW()`,
      [tenantId, userId]
    )
    if (existing.rows.length > 0) {
      throw new BusinessRuleError('Active break glass session already exists — revoke it first', { code: 'BREAK_GLASS.ALREADY_ACTIVE' })
    }

    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + MAX_DURATION_HOURS * 60 * 60 * 1000).toISOString()

    await query(
      `INSERT INTO break_glass_sessions (id, tenant_id, user_id, user_name, reason, activated_at, expires_at, status, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, 'ACTIVE', $7, $8)`,
      [sessionId, tenantId, userId, userEmail, reason, expiresAt, ctx.ipAddress ?? null, ctx.userAgent ?? null]
    )

    // CRITICAL severity audit log
    await auditService.log({
      tenantId,
      correlationId: ctx.correlationId,
      actorType: 'USER',
      actorId: userId,
      actorName: userEmail,
      action: 'BREAK_GLASS_ACTIVATED',
      entityType: 'BreakGlassSession',
      entityId: sessionId,
      severity: 'CRITICAL',
      reason,
      metadata: { expiresAt, ipAddress: ctx.ipAddress, userAgent: ctx.userAgent },
    })

    // Emit event for security officer notification
    await eventBus.writeToOutbox({
      eventName: 'BreakGlassActivated',
      payload: { sessionId, userId, userName: userEmail, reason, expiresAt, tenantId },
      tenantId,
    })

    return { sessionId, expiresAt }
  },

  /**
   * Deactivate break glass session (manual revocation).
   */
  async deactivate(sessionId: string): Promise<void> {
    const { tenantId, userId, userEmail, ctx } = getContext()

    const existing = await query(
      `SELECT * FROM break_glass_sessions WHERE id = $1 AND tenant_id = $2 AND status = 'ACTIVE'`,
      [sessionId, tenantId]
    )
    if (!existing.rows[0]) throw new BusinessRuleError('Break glass session not found or already inactive', { code: 'BREAK_GLASS.NOT_FOUND' })

    await query(
      `UPDATE break_glass_sessions SET status = 'REVOKED', revoked_at = NOW(), revoked_by = $1, updated_at = NOW() WHERE id = $2`,
      [userId, sessionId]
    )

    await auditService.log({
      tenantId,
      correlationId: ctx.correlationId,
      actorType: 'USER',
      actorId: userId,
      actorName: userEmail,
      action: 'BREAK_GLASS_DEACTIVATED',
      entityType: 'BreakGlassSession',
      entityId: sessionId,
      severity: 'CRITICAL',
    })
  },

  /**
   * Check if user currently has an active break glass session.
   */
  async isActive(userId: string): Promise<boolean> {
    const { tenantId } = getContext()
    const r = await query(
      `SELECT id FROM break_glass_sessions WHERE tenant_id = $1 AND user_id = $2 AND status = 'ACTIVE' AND expires_at > NOW()`,
      [tenantId, userId]
    )
    return r.rows.length > 0
  },

  /**
   * Auto-revoke expired sessions.
   * Called by a cron job every 5 minutes.
   */
  async revokeExpiredSessions(): Promise<number> {
    const r = await query(
      `UPDATE break_glass_sessions SET status = 'EXPIRED', revoked_at = NOW(), updated_at = NOW() WHERE status = 'ACTIVE' AND expires_at < NOW()`
    )

    if (r.rowCount && r.rowCount > 0) {
      // Log auto-revocation
      const { tenantId } = getContext()
      await auditService.log({
        tenantId,
        correlationId: 'system',
        actorType: 'SYSTEM',
        actorId: 'system',
        actorName: 'System',
        action: 'BREAK_GLASS_AUTO_EXPIRED',
        entityType: 'BreakGlassSession',
        severity: 'WARN',
        metadata: { count: r.rowCount },
      })
    }

    return r.rowCount ?? 0
  },

  /**
   * List break glass sessions (for security officer review).
   */
  async list(params: { page?: number; pageSize?: number; status?: string; userId?: string } = {}): Promise<{ rows: unknown[]; total: number; page: number; pageSize: number }> {
    const { tenantId } = getContext()
    const pg = params.page ?? 1
    const ps = params.pageSize ?? 25
    const off = (pg - 1) * ps

    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sp: unknown[] = [tenantId]
    let i = 2

    if (params.status) { where += ` AND status = $${i++}`; sp.push(params.status) }
    if (params.userId) { where += ` AND user_id = $${i++}`; sp.push(params.userId) }

    const c = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM break_glass_sessions WHERE ${where}`, sp)
    const r = await query(`SELECT * FROM break_glass_sessions WHERE ${where} ORDER BY activated_at DESC LIMIT $${i} OFFSET $${i + 1}`, [...sp, ps, off])
    return { rows: r.rows, total: Number(c.rows[0]!.cnt), page: pg, pageSize: ps }
  },
}

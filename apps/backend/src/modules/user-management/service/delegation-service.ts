/**
 * Delegation Service
 * Manages approval authority delegation between users.
 * Supports: SO, PR, PO, GL, Leave, Attendance approvals.
 */

import { query } from '@/core/db/pglite'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { BusinessRuleError, AuthorizationError, NotFoundError } from '@/core/errors'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx }
}

export const delegationService = {
  /**
   * Create a delegation — delegator grants approval authority to delegate.
   */
  async create(data: {
    delegateId: string
    delegateName: string
    domain: string  // e.g., 'so', 'pr', 'po', 'gl', 'leave', 'attendance'
    startsAt: string
    endsAt: string
    reason?: string
  }) {
    const { tenantId, userId, userEmail, ctx } = getContext()

    // Validate: max 30 days
    const start = new Date(data.startsAt)
    const end = new Date(data.endsAt)
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays > 30) throw new BusinessRuleError('Delegation cannot exceed 30 days', { code: 'DELEGATION.MAX_DURATION' })
    if (diffDays <= 0) throw new BusinessRuleError('End date must be after start date', { code: 'DELEGATION.INVALID_DATES' })

    // Validate: cannot delegate to self
    if (data.delegateId === userId) throw new BusinessRuleError('Cannot delegate to self', { code: 'DELEGATION.SELF_DELEGATION' })

    // Check for overlapping delegation for same domain
    const overlapping = await query(
      `SELECT id FROM delegations WHERE tenant_id = $1 AND delegator_id = $2 AND domain = $3 AND status = 'ACTIVE' AND ends_at > $4`,
      [tenantId, userId, data.domain, data.startsAt]
    )
    if (overlapping.rows.length > 0) throw new BusinessRuleError('Active delegation already exists for this domain', { code: 'DELEGATION.OVERLAP' })

    const id = crypto.randomUUID()
    await query(
      `INSERT INTO delegations (id, tenant_id, delegator_id, delegator_name, delegate_id, delegate_name, domain, starts_at, ends_at, reason, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'ACTIVE', NOW(), NOW())`,
      [id, tenantId, userId, userEmail, data.delegateId, data.delegateName, data.domain, data.startsAt, data.endsAt, data.reason || null]
    )

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: userEmail, action: 'DELEGATION_CREATED', entityType: 'Delegation', entityId: id, after: { domain: data.domain, delegateId: data.delegateId, startsAt: data.startsAt, endsAt: data.endsAt } })
    await eventBus.writeToOutbox({ eventName: 'DelegationCreated', payload: { delegationId: id, delegatorId: userId, delegateId: data.delegateId, domain: data.domain }, tenantId })

    return { id, ...data, status: 'ACTIVE' }
  },

  /**
   * List delegations — either created by user (as delegator) or assigned to user (as delegate).
   */
  async list(params: { page?: number; pageSize?: number; role?: 'delegator' | 'delegate'; status?: string } = {}) {
    const { tenantId, userId } = getContext()
    const pg = params.page ?? 1
    const ps = params.pageSize ?? 25
    const off = (pg - 1) * ps

    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sp: unknown[] = [tenantId]
    let i = 2

    if (params.role === 'delegator') { where += ` AND delegator_id = $${i++}`; sp.push(userId) }
    if (params.role === 'delegate') { where += ` AND delegate_id = $${i++}`; sp.push(userId) }
    if (params.status) { where += ` AND status = $${i++}`; sp.push(params.status) }

    const c = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM delegations WHERE ${where}`, sp)
    const r = await query(`SELECT * FROM delegations WHERE ${where} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`, [...sp, ps, off])
    return { rows: r.rows, total: Number(c.rows[0]!.cnt), page: pg, pageSize: ps }
  },

  /**
   * Revoke a delegation — only the delegator can revoke.
   */
  async revoke(id: string) {
    const { tenantId, userId, userEmail, ctx } = getContext()
    const existing = await query(`SELECT * FROM delegations WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL`, [id, tenantId])
    if (!existing.rows[0]) throw new NotFoundError('Delegation', id)

    const delegation = existing.rows[0]
    if (delegation['delegator_id'] !== userId) throw new AuthorizationError('Only the delegator can revoke')

    await query(`UPDATE delegations SET status = 'REVOKED', revoked_at = NOW(), revoked_by = $1, updated_at = NOW() WHERE id = $2`, [userId, id])
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: userEmail, action: 'DELEGATION_REVOKED', entityType: 'Delegation', entityId: id })
    await eventBus.writeToOutbox({ eventName: 'DelegationRevoked', payload: { delegationId: id, delegatorId: userId }, tenantId })
  },

  /**
   * Check if a user has active delegation for a domain.
   * Returns the delegation record if active, null otherwise.
   */
  async getActiveDelegation(delegatorId: string, delegateId: string, domain: string): Promise<Record<string, unknown> | null> {
    const { tenantId } = getContext()
    const r = await query(
      `SELECT * FROM delegations WHERE tenant_id = $1 AND delegator_id = $2 AND delegate_id = $3 AND domain = $4 AND status = 'ACTIVE' AND starts_at <= NOW() AND ends_at >= NOW() AND deleted_at IS NULL`,
      [tenantId, delegatorId, delegateId, domain]
    )
    return r.rows[0] ?? null
  },

  /**
   * Auto-expire delegations that have passed their end date.
   * Called by a cron job.
   */
  async expirePastDelegations(): Promise<number> {
    const r = await query(`UPDATE delegations SET status = 'EXPIRED', updated_at = NOW() WHERE status = 'ACTIVE' AND ends_at < NOW()`)
    return r.rowCount ?? 0
  },
}

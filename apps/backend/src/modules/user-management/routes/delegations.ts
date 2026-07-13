/**
 * Delegation Routes
 * API endpoints for managing approval authority delegation.
 */

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions/registry'
import { delegationService } from '../service/delegation-service'
import { success, paginated } from '@/core/response'

const delegationRoutes = new Hono()

const delegationSchema = z.object({
  delegateId: z.string().uuid(),
  delegateName: z.string().min(1).max(200),
  domain: z.enum(['so', 'pr', 'po', 'gl', 'leave', 'attendance']),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  reason: z.string().max(500).optional(),
})

// List delegations
delegationRoutes.get('/', requirePermission(Permission.USER_READ), async (c) => {
  const role = c.req.query('role') as 'delegator' | 'delegate' | undefined
  const status = c.req.query('status') ?? undefined
  const result = await delegationService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), role, status })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

// Create delegation
delegationRoutes.post('/', requirePermission(Permission.USER_UPDATE), zValidator('json', delegationSchema), async (c) => {
  const data = c.req.valid('json')
  const result = await delegationService.create(data)
  return c.json(success(result))
})

// Revoke delegation
delegationRoutes.post('/:id/revoke', requirePermission(Permission.USER_UPDATE), async (c) => {
  await delegationService.revoke(c.req.param('id')!)
  return c.json(success({ revoked: true }))
})

export { delegationRoutes }

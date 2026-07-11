import { Hono } from 'hono'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { BiFoundationService } from '../service'
export const BiFoundationRoutes = new Hono()
const CR = Permission.AUDIT_READ
BiFoundationRoutes.get('/', requirePermission(CR), async (c) => {
  const r = await BiFoundationService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined })
  return c.json(paginated(r.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: r.page, pageSize: r.pageSize, total: r.total }))
})
BiFoundationRoutes.get('/:id', requirePermission(CR), async (c) => {
  const item = await BiFoundationService.getById(c.req.param('id')!)
  return c.json(success(item))
})

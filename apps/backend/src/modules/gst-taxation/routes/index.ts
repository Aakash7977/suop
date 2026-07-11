import { Hono } from 'hono'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { GstTaxationService } from '../service'
export const GstTaxationRoutes = new Hono()
const FR = Permission.AUDIT_READ
GstTaxationRoutes.get('/', requirePermission(FR), async (c) => {
  const r = await GstTaxationService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined })
  return c.json(paginated(r.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: r.page, pageSize: r.pageSize, total: r.total }))
})
GstTaxationRoutes.get('/:id', requirePermission(FR), async (c) => {
  const item = await GstTaxationService.getById(c.req.param('id')!)
  return c.json(success(item))
})

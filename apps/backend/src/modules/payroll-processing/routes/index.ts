import { Hono } from 'hono'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { PayrollProcessingService } from '../service'
export const PayrollProcessingRoutes = new Hono()
const CR = Permission.CUSTOMER_READ
PayrollProcessingRoutes.get('/', requirePermission(CR), async (c) => {
  const r = await PayrollProcessingService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined })
  return c.json(paginated(r.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: r.page, pageSize: r.pageSize, total: r.total }))
})
PayrollProcessingRoutes.get('/:id', requirePermission(CR), async (c) => {
  const item = await PayrollProcessingService.getById(c.req.param('id')!)
  return c.json(success(item))
})

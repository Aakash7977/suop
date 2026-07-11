import { Hono } from 'hono'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { AccountsReceivableService } from '../service'
export const AccountsReceivableRoutes = new Hono()
const FR = Permission.AUDIT_READ
AccountsReceivableRoutes.get('/', requirePermission(FR), async (c) => {
  const r = await AccountsReceivableService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined })
  return c.json(paginated(r.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: r.page, pageSize: r.pageSize, total: r.total }))
})
AccountsReceivableRoutes.get('/:id', requirePermission(FR), async (c) => {
  const item = await AccountsReceivableService.getById(c.req.param('id')!)
  return c.json(success(item))
})

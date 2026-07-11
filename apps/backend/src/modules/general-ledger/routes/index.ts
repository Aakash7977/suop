import { Hono } from 'hono'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { GeneralLedgerService } from '../service'
export const GeneralLedgerRoutes = new Hono()
const FR = Permission.AUDIT_READ
GeneralLedgerRoutes.get('/', requirePermission(FR), async (c) => {
  const r = await GeneralLedgerService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined })
  return c.json(paginated(r.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: r.page, pageSize: r.pageSize, total: r.total }))
})
GeneralLedgerRoutes.get('/:id', requirePermission(FR), async (c) => {
  const item = await GeneralLedgerService.getById(c.req.param('id')!)
  return c.json(success(item))
})

import { Hono } from 'hono'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { LeadOpportunityService } from '../service'
export const LeadOpportunityRoutes = new Hono()
const CR = Permission.CUSTOMER_READ
LeadOpportunityRoutes.get('/', requirePermission(CR), async (c) => {
  const r = await LeadOpportunityService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined })
  return c.json(paginated(r.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: r.page, pageSize: r.pageSize, total: r.total }))
})
LeadOpportunityRoutes.get('/:id', requirePermission(CR), async (c) => {
  const item = await LeadOpportunityService.getById(c.req.param('id')!)
  return c.json(success(item))
})

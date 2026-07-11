/** Production Planning API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { productionPlanningService } from '../service'

export const productionPlanningRoutes = new Hono()

const planLineSchema = z.object({
  productId: z.string().uuid(), productSku: z.string().optional(), productName: z.string().optional(),
  plannedQty: z.number().positive(), uomId: z.string().uuid().optional(), uomCode: z.string().optional(),
  plannedStartDate: z.string().optional(), plannedEndDate: z.string().optional(),
  workCenterId: z.string().uuid().optional(), productionLineId: z.string().uuid().optional(),
  recipeId: z.string().uuid().optional(), bomId: z.string().uuid().optional(), routingId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'), remarks: z.string().optional(),
})

const planSchema = z.object({
  planName: z.string().min(1), planType: z.string().default('MPS'), planHorizon: z.string().default('MONTHLY'),
  startDate: z.string(), endDate: z.string(), description: z.string().optional(),
  lines: z.array(planLineSchema).min(1),
})

productionPlanningRoutes.get('/plans', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const result = await productionPlanningService.listPlans({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
productionPlanningRoutes.get('/plans/:id', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const plan = await productionPlanningService.getPlan(c.req.param('id')!)
  return c.json(success(plan))
})
productionPlanningRoutes.post('/plans', requirePermission(Permission.PRODUCT_CREATE), zValidator('json', planSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof planSchema>
  const plan = await productionPlanningService.createPlan(body)
  return c.json(success(plan, { message: 'Production plan created' }), 201)
})

productionPlanningRoutes.post('/plan-lines/:id/check-materials', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const result = await productionPlanningService.checkMaterialAvailability(c.req.param('id')!)
  return c.json(success(result))
})

productionPlanningRoutes.post('/plan-lines/:id/schedule', requirePermission(Permission.PRODUCT_CREATE), async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const schedule = await productionPlanningService.schedulePlanLine(c.req.param('id')!, body.schedulingType ?? 'FINITE')
  return c.json(success(schedule, { message: 'Plan line scheduled' }), 201)
})

productionPlanningRoutes.get('/schedules', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const result = await productionPlanningService.listSchedules({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined, workCenterId: c.req.query('workCenterId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

/** Production Order API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { productionOrderService } from '../service'

export const productionOrderRoutes = new Hono()

const poSchema = z.object({
  productId: z.string().uuid(), productSku: z.string().optional(), productName: z.string().optional(),
  plannedQty: z.number().positive(), uomId: z.string().uuid(), uomCode: z.string().min(1),
  recipeId: z.string().uuid().optional(), recipeCode: z.string().optional(),
  bomId: z.string().uuid().optional(), bomCode: z.string().optional(),
  routingId: z.string().uuid().optional(), routingCode: z.string().optional(),
  workCenterId: z.string().uuid().optional(), workCenterCode: z.string().optional(),
  productionLineId: z.string().uuid().optional(), machineId: z.string().uuid().optional(),
  plantId: z.string().uuid().optional(), plantName: z.string().optional(),
  plannedStart: z.string().datetime().optional(), plannedEnd: z.string().datetime().optional(),
  plannedCost: z.number().nonnegative().optional(), priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  remarks: z.string().optional(),
})

const transitionSchema = z.object({
  targetStatus: z.enum(['DRAFT', 'RELEASED', 'MATERIAL_RESERVED', 'MATERIAL_ISSUED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'FGQC_PENDING', 'RELEASED_TO_INVENTORY', 'CLOSED', 'REJECTED', 'CANCELLED']),
  version: z.number().int().min(0),
})

const materialIssueSchema = z.object({
  warehouseId: z.string().uuid(), warehouseName: z.string().min(1),
  lines: z.array(z.object({
    productId: z.string().uuid(), productSku: z.string().optional(), productName: z.string().optional(),
    uomId: z.string().uuid(), uomCode: z.string().min(1),
    plannedQty: z.number().nonnegative().optional(), issuedQty: z.number().positive(),
    consumptionStrategy: z.enum(['FEFO', 'FIFO']).default('FEFO'),
  })).min(1),
})

const confirmationSchema = z.object({
  confirmedQty: z.number().positive(), rejectedQty: z.number().nonnegative().default(0),
  scrapQty: z.number().nonnegative().default(0), reworkQty: z.number().nonnegative().default(0),
  uomId: z.string().uuid(), uomCode: z.string().min(1),
  operationId: z.string().uuid().optional(), shiftId: z.string().uuid().optional(),
  machineId: z.string().uuid().optional(), machineCode: z.string().optional(),
  confirmationType: z.enum(['PARTIAL', 'FINAL']).default('PARTIAL'), remarks: z.string().optional(),
})

const scrapSchema = z.object({
  scrapQty: z.number().positive(), scrapReason: z.string().min(1),
  scrapType: z.string().optional(), disposition: z.enum(['DISPOSE', 'REWORK', 'RETURN']).default('DISPOSE'),
  productId: z.string().uuid().optional(), productSku: z.string().optional(),
  uomId: z.string().uuid().optional(), uomCode: z.string().optional(),
  operationId: z.string().uuid().optional(), remarks: z.string().optional(),
})

const reworkSchema = z.object({
  reworkQty: z.number().positive(), reworkReason: z.string().min(1),
  reworkType: z.string().optional(), reworkOperationId: z.string().uuid().optional(),
  reworkCost: z.number().nonnegative().default(0),
  productId: z.string().uuid().optional(), productSku: z.string().optional(),
  uomId: z.string().uuid().optional(), uomCode: z.string().optional(),
  operationId: z.string().uuid().optional(), remarks: z.string().optional(),
})

productionOrderRoutes.get('/orders', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const result = await productionOrderService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined, productId: c.req.query('productId') ?? undefined, search: c.req.query('search') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
productionOrderRoutes.get('/orders/:id', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const po = await productionOrderService.getById(c.req.param('id')!)
  return c.json(success(po))
})
productionOrderRoutes.post('/orders', requirePermission(Permission.PRODUCT_CREATE), zValidator('json', poSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof poSchema>
  const po = await productionOrderService.create(body)
  return c.json(success(po, { message: 'Production order created' }), 201)
})
productionOrderRoutes.post('/orders/:id/transition', requirePermission(Permission.PRODUCT_UPDATE), zValidator('json', transitionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof transitionSchema>
  const updated = await productionOrderService.transition(c.req.param('id')!, body.targetStatus, body.version)
  return c.json(success(updated, { message: `PO transitioned to ${body.targetStatus}` }))
})
productionOrderRoutes.post('/orders/:id/material-issue', requirePermission(Permission.INVENTORY_POST), zValidator('json', materialIssueSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof materialIssueSchema>
  const result = await productionOrderService.issueMaterials(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Materials issued' }), 201)
})
productionOrderRoutes.post('/orders/:id/confirm', requirePermission(Permission.PRODUCT_UPDATE), zValidator('json', confirmationSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof confirmationSchema>
  const result = await productionOrderService.confirmProduction(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Production confirmed' }), 201)
})
productionOrderRoutes.post('/orders/:id/scrap', requirePermission(Permission.PRODUCT_UPDATE), zValidator('json', scrapSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof scrapSchema>
  const result = await productionOrderService.recordScrap(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Scrap recorded' }), 201)
})
productionOrderRoutes.post('/orders/:id/rework', requirePermission(Permission.PRODUCT_UPDATE), zValidator('json', reworkSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof reworkSchema>
  const result = await productionOrderService.recordRework(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Rework recorded' }), 201)
})
productionOrderRoutes.get('/orders/:id/analytics', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const analytics = await productionOrderService.getProductionAnalytics(c.req.param('id')!)
  return c.json(success(analytics))
})

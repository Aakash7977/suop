/** Batch Manufacturing API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { batchManufacturingService } from '../service'

export const batchManufacturingRoutes = new Hono()

const batchSchema = z.object({
  productionOrderId: z.string().uuid().optional(), productionOrderNumber: z.string().optional(),
  productId: z.string().uuid(), productSku: z.string().optional(), productName: z.string().optional(),
  parentBatchId: z.string().uuid().optional(), parentBatchNumber: z.string().optional(),
  quantity: z.number().positive(), uomId: z.string().uuid(), uomCode: z.string().min(1),
  expiryDate: z.string().datetime().optional(), shelfLifeDays: z.number().int().positive().optional(),
  warehouseId: z.string().uuid().optional(), warehouseName: z.string().optional(),
  remarks: z.string().optional(),
})

const batchTransitionSchema = z.object({
  targetStatus: z.enum(['IN_PRODUCTION', 'PRODUCED', 'FGQC_PENDING', 'PASSED', 'CONDITIONAL_PASS', 'REJECTED', 'ARCHIVED']),
  version: z.number().int().min(0),
})

const splitSchema = z.object({
  splitReason: z.string().min(1),
  splits: z.array(z.object({
    quantity: z.number().positive(), warehouseId: z.string().uuid().optional(), warehouseName: z.string().optional(),
  })).min(2),
})

const mergeSchema = z.object({
  sourceBatchIds: z.array(z.string().uuid()).min(2),
  mergeReason: z.string().min(1),
  warehouseId: z.string().uuid().optional(), warehouseName: z.string().optional(),
})

batchManufacturingRoutes.get('/batches', requirePermission(Permission.BATCH_READ), async (c) => {
  const result = await batchManufacturingService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), productId: c.req.query('productId') ?? undefined, status: c.req.query('status') ?? undefined, search: c.req.query('search') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
batchManufacturingRoutes.get('/batches/:id', requirePermission(Permission.BATCH_READ), async (c) => {
  const batch = await batchManufacturingService.getById(c.req.param('id')!)
  return c.json(success(batch))
})
batchManufacturingRoutes.post('/batches', requirePermission(Permission.BATCH_CREATE), zValidator('json', batchSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof batchSchema>
  const batch = await batchManufacturingService.createBatch(body)
  return c.json(success(batch, { message: 'Production batch created' }), 201)
})
batchManufacturingRoutes.post('/batches/:id/transition', requirePermission(Permission.BATCH_TRANSITION), zValidator('json', batchTransitionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof batchTransitionSchema>
  const updated = await batchManufacturingService.transition(c.req.param('id')!, body.targetStatus, body.version)
  return c.json(success(updated, { message: `Batch transitioned to ${body.targetStatus}` }))
})
batchManufacturingRoutes.post('/batches/:id/split', requirePermission(Permission.BATCH_TRANSITION), zValidator('json', splitSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof splitSchema>
  const result = await batchManufacturingService.splitBatch(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Batch split completed' }), 201)
})
batchManufacturingRoutes.post('/batches/merge', requirePermission(Permission.BATCH_TRANSITION), zValidator('json', mergeSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof mergeSchema>
  const result = await batchManufacturingService.mergeBatches(body)
  return c.json(success(result, { message: 'Batch merge completed' }), 201)
})
batchManufacturingRoutes.get('/batches/:id/backward-traceability', requirePermission(Permission.BATCH_READ), async (c) => {
  const result = await batchManufacturingService.backwardTraceability(c.req.param('id')!)
  return c.json(success(result))
})
batchManufacturingRoutes.get('/batches/:id/forward-traceability', requirePermission(Permission.BATCH_READ), async (c) => {
  const result = await batchManufacturingService.forwardTraceability(c.req.param('id')!)
  return c.json(success(result))
})
batchManufacturingRoutes.get('/batches/:id/genealogy', requirePermission(Permission.BATCH_READ), async (c) => {
  const result = await batchManufacturingService.getGenealogy(c.req.param('id')!)
  return c.json(success(result))
})

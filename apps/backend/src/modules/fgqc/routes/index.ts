/** FGQC API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { fgqcService } from '../service'

export const fgqcRoutes = new Hono()

const lotSchema = z.object({
  productionBatchId: z.string().uuid().optional(), productionBatchNumber: z.string().optional(),
  productionOrderId: z.string().uuid().optional(), productionOrderNumber: z.string().optional(),
  productId: z.string().uuid(), productSku: z.string().optional(), productName: z.string().optional(),
  batchQuantity: z.number().positive(), sampleSize: z.number().int().positive(),
  uomId: z.string().uuid().optional(), uomCode: z.string().optional(),
  inspectionPlanId: z.string().uuid().optional(), inspectionPlanCode: z.string().optional(),
  shelfLifeDays: z.number().int().positive().optional(), remarks: z.string().optional(),
})

const lotTransitionSchema = z.object({
  targetStatus: z.enum(['PENDING', 'IN_PROGRESS', 'PASSED', 'CONDITIONAL_PASS', 'FAILED', 'ON_HOLD']),
  version: z.number().int().min(0),
})

const testResultSchema = z.object({
  testCategory: z.enum(['MICROBIOLOGY', 'CHEMICAL', 'PHYSICAL', 'PACKAGING', 'VISUAL', 'OTHER']),
  testCode: z.string().optional(), testName: z.string().min(1), testType: z.string().optional(),
  specification: z.string().optional(), minValue: z.string().optional(), maxValue: z.string().optional(), targetValue: z.string().optional(),
  actualValue: z.string().min(1), unit: z.string().optional(),
  result: z.enum(['PASS', 'FAIL', 'CONDITIONAL']),
  method: z.string().optional(), equipment: z.string().optional(), remarks: z.string().optional(),
})

const releaseSchema = z.object({
  decision: z.enum(['RELEASE', 'CONDITIONAL_RELEASE', 'REJECT']),
  notes: z.string().optional(), rejectReason: z.string().optional(), version: z.number().int().min(0),
})

const coaSchema = z.object({
  inspectionLotId: z.string().uuid().optional(), productionBatchId: z.string().uuid().optional(), productionBatchNumber: z.string().optional(),
  productId: z.string().uuid(), productSku: z.string().optional(), productName: z.string().optional(),
  batchNumber: z.string().optional(), manufactureDate: z.string().datetime().optional(), expiryDate: z.string().datetime().optional(),
  quantity: z.number().positive().optional(), uomCode: z.string().optional(),
  customerId: z.string().uuid().optional(), customerName: z.string().optional(), remarks: z.string().optional(),
})

const shelfLifeSchema = z.object({
  productId: z.string().uuid(), productSku: z.string().optional(), productName: z.string().optional(),
  productionBatchId: z.string().uuid().optional(), productionBatchNumber: z.string().optional(),
  manufactureDate: z.string().datetime().optional(), originalExpiryDate: z.string().datetime().optional(),
  adjustedExpiryDate: z.string().datetime(), shelfLifeDays: z.number().int().positive().optional(),
  adjustmentReason: z.string().min(1), remarks: z.string().optional(),
})

// FGQC Lots
fgqcRoutes.get('/lots', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const result = await fgqcService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined, productionBatchId: c.req.query('productionBatchId') ?? undefined, search: c.req.query('search') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
fgqcRoutes.get('/lots/:id', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const lot = await fgqcService.getById(c.req.param('id')!)
  return c.json(success(lot))
})
fgqcRoutes.post('/lots', requirePermission(Permission.IQC_APPROVE), zValidator('json', lotSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof lotSchema>
  const lot = await fgqcService.createInspectionLot(body)
  return c.json(success(lot, { message: 'FGQC inspection lot created' }), 201)
})
fgqcRoutes.post('/lots/:id/results', requirePermission(Permission.IQC_INSPECT), zValidator('json', testResultSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof testResultSchema>
  const result = await fgqcService.recordTestResult(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Test result recorded' }), 201)
})
fgqcRoutes.post('/lots/:id/transition', requirePermission(Permission.IQC_APPROVE), zValidator('json', lotTransitionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof lotTransitionSchema>
  const updated = await fgqcService.transition(c.req.param('id')!, body.targetStatus, body.version)
  return c.json(success(updated, { message: `Lot transitioned to ${body.targetStatus}` }))
})
fgqcRoutes.post('/lots/:id/release', requirePermission(Permission.IQC_APPROVE), zValidator('json', releaseSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof releaseSchema>
  const updated = await fgqcService.releaseDecision(c.req.param('id')!, body)
  return c.json(success(updated, { message: `Release decision: ${body.decision}` }))
})

// COA
fgqcRoutes.get('/coas', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const result = await fgqcService.listCoas({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined, productId: c.req.query('productId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
fgqcRoutes.post('/coas', requirePermission(Permission.COA_SIGN), zValidator('json', coaSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof coaSchema>
  const coa = await fgqcService.createCoa(body)
  return c.json(success(coa, { message: 'COA created' }), 201)
})
fgqcRoutes.post('/coas/:id/sign', requirePermission(Permission.COA_SIGN), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  const updated = await fgqcService.signCoa(c.req.param('id')!, version)
  return c.json(success(updated, { message: 'COA signed' }))
})

// Shelf Life
fgqcRoutes.get('/shelf-life', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const result = await fgqcService.listShelfLife({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), productId: c.req.query('productId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
fgqcRoutes.post('/shelf-life', requirePermission(Permission.IQC_APPROVE), zValidator('json', shelfLifeSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof shelfLifeSchema>
  const result = await fgqcService.adjustShelfLife(body)
  return c.json(success(result, { message: 'Shelf life adjusted' }), 201)
})

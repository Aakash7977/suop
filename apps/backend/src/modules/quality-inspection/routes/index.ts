/** Quality Inspection API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { qualityInspectionService } from '../service'

export const qualityInspectionRoutes = new Hono()

// ─── Inspection Plans ───────────────────────────────────────────────────────

const planSchema = z.object({
  planCode: z.string().min(1), planName: z.string().min(1),
  productId: z.string().uuid().optional(), productCategoryId: z.string().uuid().optional(),
  inspectionType: z.string().default('IQC'), samplingPlanId: z.string().uuid().optional(),
  aqlLevel: z.string().default('2.5'), inspectionCritical: z.string().default('NORMAL'),
  description: z.string().optional(),
})

qualityInspectionRoutes.get('/plans', requirePermission(Permission.QUALITY_INSPECT), async (c) => {
  const result = await qualityInspectionService.listPlans({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

qualityInspectionRoutes.get('/plans/:id', requirePermission(Permission.QUALITY_INSPECT), async (c) => {
  const plan = await qualityInspectionService.getPlan(c.req.param('id')!)
  return c.json(success(plan))
})

qualityInspectionRoutes.post('/plans', requirePermission(Permission.QUALITY_APPROVE), zValidator('json', planSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof planSchema>
  const result = await qualityInspectionService.createPlan(body)
  return c.json(success(result, { message: 'Inspection plan created' }), 201)
})

// ─── Sampling Plans ─────────────────────────────────────────────────────────

const samplingPlanSchema = z.object({
  planCode: z.string().min(1), planName: z.string().min(1),
  lotSizeMin: z.number().int().positive(), lotSizeMax: z.number().int().positive(),
  sampleSize: z.number().int().positive(), acceptNumber: z.number().int().nonnegative().default(0),
  rejectNumber: z.number().int().positive().default(1), aqlLevel: z.string().default('2.5'),
  inspectionLevel: z.string().default('II'), description: z.string().optional(),
})

qualityInspectionRoutes.get('/sampling-plans', requirePermission(Permission.QUALITY_INSPECT), async (c) => {
  const plans = await qualityInspectionService.listSamplingPlans()
  return c.json(success(plans))
})

qualityInspectionRoutes.post('/sampling-plans', requirePermission(Permission.QUALITY_APPROVE), zValidator('json', samplingPlanSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof samplingPlanSchema>
  const result = await qualityInspectionService.createSamplingPlan(body)
  return c.json(success(result, { message: 'Sampling plan created' }), 201)
})

// ─── Inspection Lots ────────────────────────────────────────────────────────

const lotCreateSchema = z.object({
  grnId: z.string().uuid(), grnLineId: z.string().uuid(),
  productId: z.string().uuid(), productSku: z.string().min(1), productName: z.string().min(1),
  batchNumber: z.string().optional(), lotQuantity: z.number().positive(),
  planId: z.string().uuid().optional(), remarks: z.string().optional(),
})

const lotTransitionSchema = z.object({
  targetStatus: z.enum(['PENDING', 'IN_PROGRESS', 'PASSED', 'CONDITIONAL_PASS', 'FAILED', 'ON_HOLD']),
  version: z.number().int().min(0),
  startedAt: z.string().datetime().optional(),
  acceptQty: z.number().nonnegative().optional(),
  rejectQty: z.number().nonnegative().optional(),
  disposition: z.string().optional(),
  ncrReason: z.string().optional(),
  remarks: z.string().optional(),
})

const resultSchema = z.object({
  parameterId: z.string().uuid().optional(),
  parameterCode: z.string().optional(),
  parameterName: z.string().optional(),
  expectedValue: z.string().optional(),
  actualValue: z.string().min(1),
  result: z.enum(['PASS', 'FAIL', 'CONDITIONAL']),
  remarks: z.string().optional(),
})

qualityInspectionRoutes.get('/lots', requirePermission(Permission.QUALITY_INSPECT), async (c) => {
  const result = await qualityInspectionService.listInspectionLots({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, status: c.req.query('status') ?? undefined, grnId: c.req.query('grnId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

qualityInspectionRoutes.get('/lots/:id', requirePermission(Permission.QUALITY_INSPECT), async (c) => {
  const lot = await qualityInspectionService.getInspectionLot(c.req.param('id')!)
  return c.json(success(lot))
})

qualityInspectionRoutes.post('/lots', requirePermission(Permission.QUALITY_INSPECT), zValidator('json', lotCreateSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof lotCreateSchema>
  const lot = await qualityInspectionService.createInspectionLot(body)
  return c.json(success(lot, { message: 'Inspection lot created' }), 201)
})

qualityInspectionRoutes.post('/lots/:id/start', requirePermission(Permission.QUALITY_INSPECT), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  const updated = await qualityInspectionService.startInspection(c.req.param('id')!, version)
  return c.json(success(updated, { message: 'Inspection started' }))
})

qualityInspectionRoutes.post('/lots/:id/results', requirePermission(Permission.QUALITY_INSPECT), zValidator('json', resultSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof resultSchema>
  const result = await qualityInspectionService.recordResult(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Result recorded' }), 201)
})

qualityInspectionRoutes.post('/lots/:id/transition', requirePermission(Permission.QUALITY_APPROVE), zValidator('json', lotTransitionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof lotTransitionSchema>
  const updated = await qualityInspectionService.transitionInspection(c.req.param('id')!, body.targetStatus, body.version, { startedAt: body.startedAt, acceptQty: body.acceptQty, rejectQty: body.rejectQty, disposition: body.disposition, ncrReason: body.ncrReason, remarks: body.remarks })
  return c.json(success(updated, { message: `Inspection lot transitioned to ${body.targetStatus}` }))
})

// ─── Quality Holds ──────────────────────────────────────────────────────────

const holdSchema = z.object({
  sourceId: z.string().uuid().optional(), sourceType: z.string().optional(),
  productId: z.string().uuid(), productSku: z.string().min(1),
  batchNumber: z.string().optional(), lotNumber: z.string().optional(),
  heldQty: z.number().positive(), holdReason: z.string().min(1), holdLocation: z.string().optional(),
})

const holdReleaseSchema = z.object({ releaseReason: z.string().min(1), disposition: z.string().min(1) })

qualityInspectionRoutes.get('/holds', requirePermission(Permission.QUALITY_INSPECT), async (c) => {
  const result = await qualityInspectionService.listQualityHolds({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

qualityInspectionRoutes.post('/holds', requirePermission(Permission.QUALITY_APPROVE), zValidator('json', holdSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof holdSchema>
  const result = await qualityInspectionService.createQualityHold(body)
  return c.json(success(result, { message: 'Quality hold created' }), 201)
})

qualityInspectionRoutes.post('/holds/:id/release', requirePermission(Permission.QUALITY_APPROVE), zValidator('json', holdReleaseSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof holdReleaseSchema>
  const released = await qualityInspectionService.releaseQualityHold(c.req.param('id')!, body.releaseReason, body.disposition)
  return c.json(success(released, { message: 'Quality hold released' }))
})

// ─── NCRs ───────────────────────────────────────────────────────────────────

const ncrSchema = z.object({
  sourceId: z.string().uuid().optional(), sourceType: z.string().optional(),
  productId: z.string().uuid(), productSku: z.string().min(1), productName: z.string().min(1),
  batchNumber: z.string().optional(), lotNumber: z.string().optional(),
  supplierId: z.string().uuid().optional(), supplierName: z.string().optional(),
  grnId: z.string().uuid().optional(), grnNumber: z.string().optional(),
  nonConformance: z.string().min(1), nonConformanceType: z.string().optional(),
  severity: z.enum(['MINOR', 'MAJOR', 'CRITICAL']).default('MAJOR'),
  defectQty: z.number().nonnegative().optional(), disposition: z.string().optional(),
})

const ncrTransitionSchema = z.object({
  targetStatus: z.enum(['OPEN', 'UNDER_INVESTIGATION', 'CAPA_INITIATED', 'RESOLVED', 'CLOSED']),
  version: z.number().int().min(0),
  rootCause: z.string().optional(), closureNotes: z.string().optional(), capaId: z.string().uuid().optional(),
})

qualityInspectionRoutes.get('/ncrs', requirePermission(Permission.QUALITY_INSPECT), async (c) => {
  const result = await qualityInspectionService.listNcrs({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, status: c.req.query('status') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

qualityInspectionRoutes.get('/ncrs/:id', requirePermission(Permission.QUALITY_INSPECT), async (c) => {
  const ncr = await qualityInspectionService.getNcr(c.req.param('id')!)
  return c.json(success(ncr))
})

qualityInspectionRoutes.post('/ncrs', requirePermission(Permission.NCR_CREATE), zValidator('json', ncrSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof ncrSchema>
  const ncr = await qualityInspectionService.createNcr(body)
  return c.json(success(ncr, { message: 'NCR created' }), 201)
})

qualityInspectionRoutes.post('/ncrs/:id/transition', requirePermission(Permission.NCR_APPROVE), zValidator('json', ncrTransitionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof ncrTransitionSchema>
  const updated = await qualityInspectionService.transitionNcr(c.req.param('id')!, body.targetStatus, body.version, { rootCause: body.rootCause, closureNotes: body.closureNotes, capaId: body.capaId })
  return c.json(success(updated, { message: `NCR transitioned to ${body.targetStatus}` }))
})

// ─── CAPA ───────────────────────────────────────────────────────────────────

const capaSchema = z.object({
  ncrId: z.string().uuid().optional(), ncrNumber: z.string().optional(),
  correctiveAction: z.string().min(1), preventiveAction: z.string().min(1),
  actionOwner: z.string().uuid().optional(), actionOwnerName: z.string().optional(),
  targetDate: z.string().datetime().optional(),
})

qualityInspectionRoutes.get('/capas', requirePermission(Permission.QUALITY_INSPECT), async (c) => {
  const result = await qualityInspectionService.listCapas({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

qualityInspectionRoutes.post('/capas', requirePermission(Permission.NCR_APPROVE), zValidator('json', capaSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof capaSchema>
  const capa = await qualityInspectionService.createCapa(body)
  return c.json(success(capa, { message: 'CAPA created' }), 201)
})

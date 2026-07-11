/** NCR Management API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { ncrManagementService } from '../service'

export const ncrManagementRoutes = new Hono()

const rootCauseSchema = z.object({
  rootCauseCategory: z.string().min(1), rootCauseDescription: z.string().min(1),
  analysisMethod: z.enum(['5WHY', 'FISHBONE', 'FTA', 'FMEA']).default('5WHY'),
  fishboneCategory: z.string().optional(), remarks: z.string().optional(),
})

const containmentSchema = z.object({
  containmentAction: z.string().min(1), containmentType: z.enum(['IMMEDIATE', 'TEMPORARY', 'PERMANENT']).default('IMMEDIATE'),
  affectedQty: z.number().nonnegative().optional(), affectedLocation: z.string().optional(), remarks: z.string().optional(),
})

const dispositionSchema = z.object({
  dispositionType: z.enum(['USE_AS_IS', 'REWORK', 'REPAIR', 'SCRAP', 'RETURN_TO_SUPPLIER', 'REJECT']),
  dispositionReason: z.string().min(1), dispositionQty: z.number().nonnegative().optional(), remarks: z.string().optional(),
})

const materialHoldSchema = z.object({
  holdType: z.string().default('NCR'), sourceId: z.string().uuid().optional(), sourceType: z.string().optional(), sourceNumber: z.string().optional(),
  productId: z.string().uuid(), productSku: z.string().min(1), productName: z.string().optional(),
  batchId: z.string().uuid().optional(), batchNumber: z.string().optional(), lotId: z.string().uuid().optional(), lotNumber: z.string().optional(),
  warehouseId: z.string().uuid().optional(), warehouseName: z.string().optional(),
  heldQty: z.number().positive(), uomId: z.string().uuid().optional(), uomCode: z.string().optional(),
  holdReason: z.string().min(1), holdLocation: z.string().optional(), remarks: z.string().optional(),
})

const releaseSchema = z.object({ releaseReason: z.string().min(1), disposition: z.string().min(1) })

const qualityCostSchema = z.object({
  costCategory: z.enum(['PREVENTION', 'APPRAISAL', 'INTERNAL_FAILURE', 'EXTERNAL_FAILURE']),
  costType: z.string().min(1), ncrId: z.string().uuid().optional(), capaId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(), productSku: z.string().optional(),
  amount: z.number().positive(), currency: z.string().default('INR'), description: z.string().optional(),
})

const ncrTransitionSchema = z.object({
  targetStatus: z.enum(['OPEN', 'CONTAINED', 'ROOT_CAUSE_IDENTIFIED', 'UNDER_INVESTIGATION', 'CAPA_INITIATED', 'DISPOSITIONED', 'RESOLVED', 'CLOSED']),
  version: z.number().int().min(0),
})

ncrManagementRoutes.post('/ncrs/:id/transition', requirePermission(Permission.NCR_APPROVE), zValidator('json', ncrTransitionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof ncrTransitionSchema>
  const updated = await ncrManagementService.transitionNcr(c.req.param('id')!, body.targetStatus, body.version)
  return c.json(success(updated, { message: `NCR transitioned to ${body.targetStatus}` }))
})

ncrManagementRoutes.get('/ncrs/:id/root-causes', requirePermission(Permission.NCR_CREATE), async (c) => {
  const result = await ncrManagementService.listRootCauses(c.req.param('id')!)
  return c.json(success(result))
})
ncrManagementRoutes.post('/ncrs/:id/root-causes', requirePermission(Permission.NCR_CREATE), zValidator('json', rootCauseSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof rootCauseSchema>
  const result = await ncrManagementService.addRootCause(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Root cause added' }), 201)
})

ncrManagementRoutes.get('/ncrs/:id/containments', requirePermission(Permission.NCR_CREATE), async (c) => {
  const result = await ncrManagementService.listContainments(c.req.param('id')!)
  return c.json(success(result))
})
ncrManagementRoutes.post('/ncrs/:id/containments', requirePermission(Permission.NCR_CREATE), zValidator('json', containmentSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof containmentSchema>
  const result = await ncrManagementService.addContainment(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Containment added' }), 201)
})

ncrManagementRoutes.get('/ncrs/:id/dispositions', requirePermission(Permission.NCR_CREATE), async (c) => {
  const result = await ncrManagementService.listDispositions(c.req.param('id')!)
  return c.json(success(result))
})
ncrManagementRoutes.post('/ncrs/:id/dispositions', requirePermission(Permission.NCR_APPROVE), zValidator('json', dispositionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof dispositionSchema>
  const result = await ncrManagementService.addDisposition(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Disposition added' }), 201)
})

ncrManagementRoutes.get('/material-holds', requirePermission(Permission.NCR_CREATE), async (c) => {
  const result = await ncrManagementService.listMaterialHolds({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined, productId: c.req.query('productId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
ncrManagementRoutes.post('/material-holds', requirePermission(Permission.NCR_APPROVE), zValidator('json', materialHoldSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof materialHoldSchema>
  const hold = await ncrManagementService.createMaterialHold(body)
  return c.json(success(hold, { message: 'Material hold created' }), 201)
})
ncrManagementRoutes.post('/material-holds/:id/release', requirePermission(Permission.NCR_APPROVE), zValidator('json', releaseSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof releaseSchema>
  const released = await ncrManagementService.releaseMaterialHold(c.req.param('id')!, body.releaseReason, body.disposition)
  return c.json(success(released, { message: 'Material hold released' }))
})

ncrManagementRoutes.get('/quality-costs', requirePermission(Permission.NCR_CREATE), async (c) => {
  const result = await ncrManagementService.listQualityCosts({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), costCategory: c.req.query('costCategory') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
ncrManagementRoutes.post('/quality-costs', requirePermission(Permission.NCR_CREATE), zValidator('json', qualityCostSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof qualityCostSchema>
  const result = await ncrManagementService.recordQualityCost(body)
  return c.json(success(result, { message: 'Quality cost recorded' }), 201)
})

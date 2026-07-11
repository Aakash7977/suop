/** RFQ API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { rfqService } from '../service'

export const rfqRoutes = new Hono()

const rfqLineSchema = z.object({
  productId: z.string().uuid(), productSku: z.string().min(1), productName: z.string().min(1),
  requestedQty: z.number().positive(), uomId: z.string().uuid(), uomCode: z.string().min(1),
  targetDeliveryDate: z.string().datetime().optional(), remarks: z.string().optional(),
})
const rfqSupplierSchema = z.object({
  supplierId: z.string().uuid(), supplierCode: z.string().min(1), supplierName: z.string().min(1), isPreferred: z.boolean().default(false),
})
const rfqSchema = z.object({
  prId: z.string().uuid().optional(), companyId: z.string().uuid(), plantId: z.string().uuid().optional(), warehouseId: z.string().uuid().optional(),
  rfqType: z.enum(['SINGLE_SUPPLIER', 'MULTI_SUPPLIER', 'OPEN']).default('MULTI_SUPPLIER'),
  closingDate: z.string().datetime(), currency: z.string().default('INR'), paymentTerms: z.string().default('NET30'),
  deliveryTerms: z.string().optional(), incoterms: z.string().optional(), targetDeliveryDate: z.string().datetime().optional(),
  remarks: z.string().optional(), internalNotes: z.string().optional(),
  lines: z.array(rfqLineSchema).min(1), suppliers: z.array(rfqSupplierSchema).optional(),
})
const transitionSchema = z.object({ targetStatus: z.enum(['DRAFT', 'SUBMITTED', 'SENT', 'SUPPLIER_RESPONSE', 'EVALUATION', 'AWARDED', 'CLOSED', 'CANCELLED']), version: z.number().int().min(0) })
const inviteSupplierSchema = z.object({ supplierId: z.string().uuid(), supplierCode: z.string().min(1), supplierName: z.string().min(1), isPreferred: z.boolean().default(false) })

const RFQ_READ = Permission.PO_READ
const RFQ_CREATE = Permission.PO_CREATE
const RFQ_APPROVE = Permission.PO_APPROVE

rfqRoutes.get('/rfqs', requirePermission(RFQ_READ), async (c) => {
  const result = await rfqService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, status: c.req.query('status') ?? undefined, buyerId: c.req.query('buyerId') ?? undefined, prId: c.req.query('prId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

rfqRoutes.get('/rfqs/:id', requirePermission(RFQ_READ), async (c) => {
  const rfq = await rfqService.getById(c.req.param('id')!)
  return c.json(success(rfq))
})

rfqRoutes.post('/rfqs', requirePermission(RFQ_CREATE), zValidator('json', rfqSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof rfqSchema>
  const rfq = await rfqService.create(body)
  return c.json(success(rfq, { message: 'RFQ created' }), 201)
})

rfqRoutes.patch('/rfqs/:id', requirePermission(RFQ_CREATE), async (c) => {
  const id = c.req.param('id')!; const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json()
  const updated = await rfqService.update(id, body, version)
  return c.json(success(updated, { message: 'RFQ updated' }))
})

rfqRoutes.delete('/rfqs/:id', requirePermission(RFQ_CREATE), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  await rfqService.delete(c.req.param('id')!, version)
  return c.json(success({ deleted: true }, { message: 'RFQ deleted' }))
})

rfqRoutes.post('/rfqs/:id/transition', requirePermission(RFQ_APPROVE), zValidator('json', transitionSchema), async (c) => {
  const id = c.req.param('id')!; const body = c.req.valid('json' as never) as z.infer<typeof transitionSchema>
  const updated = await rfqService.transition(id, body.targetStatus, body.version)
  return c.json(success(updated, { message: `RFQ transitioned to ${body.targetStatus}` }))
})

rfqRoutes.post('/rfqs/:id/suppliers', requirePermission(RFQ_CREATE), zValidator('json', inviteSupplierSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof inviteSupplierSchema>
  const id = await rfqService.inviteSupplier(c.req.param('id')!, body)
  return c.json(success({ id }, { message: 'Supplier invited' }), 201)
})

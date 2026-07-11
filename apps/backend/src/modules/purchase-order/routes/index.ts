/** Purchase Order API Routes — 17 endpoints */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { purchaseOrderService } from '../service'

export const purchaseOrderRoutes = new Hono()

// ─── Schemas ────────────────────────────────────────────────────────────────

const poLineSchema = z.object({
  productId: z.string().uuid(),
  productSku: z.string().min(1),
  productName: z.string().min(1),
  productDescription: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  categoryName: z.string().optional(),
  uomId: z.string().uuid(),
  uomCode: z.string().min(1),
  orderedQty: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  basePrice: z.number().optional(),
  discountPercent: z.number().nonnegative().optional(),
  taxPercent: z.number().nonnegative().optional(),
  currency: z.string().default('INR'),
  expectedDeliveryDate: z.string().datetime().optional(),
  leadTimeDays: z.number().int().positive().optional(),
  deliveryLocation: z.string().optional(),
  minOrderQty: z.number().nonnegative().optional(),
  maxOrderQty: z.number().nonnegative().optional(),
  rfqLineId: z.string().uuid().optional(),
  quotationLineId: z.string().uuid().optional(),
  prLineId: z.string().uuid().optional(),
  remarks: z.string().optional(),
})

const poCreateSchema = z.object({
  poType: z.enum(['STANDARD', 'BLANKET', 'CONTRACT', 'SERVICE', 'SUBCONTRACTING', 'EMERGENCY', 'CONSIGNMENT', 'CAPITAL']).default('STANDARD'),
  supplierId: z.string().uuid(),
  supplierCode: z.string().min(1),
  supplierName: z.string().min(1),
  supplierGstin: z.string().optional(),
  companyId: z.string().uuid(),
  companyName: z.string().min(1),
  plantId: z.string().uuid(),
  plantName: z.string().min(1),
  warehouseId: z.string().uuid().optional(),
  warehouseName: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  costCenterId: z.string().uuid().optional(),
  buyerId: z.string().uuid().optional(),
  buyerName: z.string().optional(),
  rfqId: z.string().uuid().optional(),
  rfqNumber: z.string().optional(),
  quotationId: z.string().uuid().optional(),
  quotationNumber: z.string().optional(),
  prId: z.string().uuid().optional(),
  prNumber: z.string().optional(),
  expectedDeliveryDate: z.string().datetime().optional(),
  deliveryTerms: z.string().optional(),
  deliveryLocation: z.string().optional(),
  shippingAddress: z.string().optional(),
  billingAddress: z.string().optional(),
  currency: z.string().default('INR'),
  exchangeRate: z.number().positive().optional(),
  discountPercent: z.number().nonnegative().optional(),
  freightAmount: z.number().nonnegative().optional(),
  insuranceAmount: z.number().nonnegative().optional(),
  otherCharges: z.number().nonnegative().optional(),
  paymentTerms: z.string().default('NET30'),
  paymentTermsDays: z.number().int().positive().optional(),
  creditPeriodDays: z.number().int().positive().optional(),
  advancePercent: z.number().nonnegative().optional(),
  validityDate: z.string().datetime().optional(),
  remarks: z.string().optional(),
  internalNotes: z.string().optional(),
  supplierNotes: z.string().optional(),
  lines: z.array(poLineSchema).min(1),
})

const transitionSchema = z.object({
  targetStatus: z.enum([
    'DRAFT', 'SUBMITTED', 'DEPT_APPROVAL', 'FINANCE_APPROVAL', 'MANAGEMENT_APPROVAL',
    'APPROVED', 'ISSUED', 'SUPPLIER_ACCEPTED', 'PARTIALLY_RECEIVED', 'FULLY_RECEIVED',
    'CLOSED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'REVISION_REQUESTED',
  ]),
  version: z.number().int().min(0),
  approvalLevel: z.enum(['DEPARTMENT', 'FINANCE', 'MANAGEMENT']).optional(),
  approvalNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  cancelReason: z.string().optional(),
  revisionReason: z.string().optional(),
})

const supplierAckSchema = z.object({
  ackStatus: z.enum(['ACCEPTED', 'REJECTED', 'COUNTER_OFFER', 'DATE_CHANGE_REQUESTED', 'QTY_CHANGE_REQUESTED']),
  version: z.number().int().min(0),
  notes: z.string().optional(),
  counterTotal: z.number().nonnegative().optional(),
})
void supplierAckSchema // schema retained for documentation/type reference

const createFromQuotationSchema = z.object({
  quotationId: z.string().uuid(),
  companyId: z.string().uuid(),
  companyName: z.string().min(1),
  plantId: z.string().uuid(),
  plantName: z.string().min(1),
  warehouseId: z.string().uuid().optional(),
  warehouseName: z.string().optional(),
  buyerId: z.string().uuid().optional(),
  buyerName: z.string().optional(),
  expectedDeliveryDate: z.string().datetime().optional(),
  shippingAddress: z.string().optional(),
  billingAddress: z.string().optional(),
  paymentTerms: z.string().optional(),
})

// ─── Endpoints ──────────────────────────────────────────────────────────────

// 1. List POs (paginated, searchable, filterable, sortable)
purchaseOrderRoutes.get('/pos', requirePermission(Permission.PO_READ), async (c) => {
  const result = await purchaseOrderService.list({
    page: Number(c.req.query('page') ?? 1),
    pageSize: Number(c.req.query('pageSize') ?? 25),
    search: c.req.query('search') ?? undefined,
    status: c.req.query('status') ?? undefined,
    poType: c.req.query('poType') ?? undefined,
    supplierId: c.req.query('supplierId') ?? undefined,
    plantId: c.req.query('plantId') ?? undefined,
    sortBy: c.req.query('sortBy') ?? undefined,
    sortOrder: (c.req.query('sortOrder') as 'ASC' | 'DESC') ?? undefined,
  })
  return c.json(paginated(result.rows, {
    correlationId: c.req.header('X-Request-Id') ?? '',
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  }))
})

// 2. Get PO by ID (with lines, taxes, charges, approvals, revisions, history)
purchaseOrderRoutes.get('/pos/:id', requirePermission(Permission.PO_READ), async (c) => {
  const po = await purchaseOrderService.getById(c.req.param('id')!)
  return c.json(success(po))
})

// 3. Create PO
purchaseOrderRoutes.post('/pos', requirePermission(Permission.PO_CREATE), zValidator('json', poCreateSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof poCreateSchema>
  const po = await purchaseOrderService.create(body)
  return c.json(success(po, { message: 'Purchase Order created' }), 201)
})

// 4. Update PO (DRAFT or REVISION_REQUESTED only)
purchaseOrderRoutes.patch('/pos/:id', requirePermission(Permission.PO_UPDATE), async (c) => {
  const id = c.req.param('id')!
  const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json()
  const updated = await purchaseOrderService.update(id, body, version)
  return c.json(success(updated, { message: 'Purchase Order updated' }))
})

// 5. Delete PO (DRAFT only)
purchaseOrderRoutes.delete('/pos/:id', requirePermission(Permission.PO_DELETE), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  await purchaseOrderService.delete(c.req.param('id')!, version)
  return c.json(success({ deleted: true }, { message: 'Purchase Order deleted' }))
})

// 6. Transition (submit, approve, reject, issue, cancel, close, etc.)
purchaseOrderRoutes.post('/pos/:id/transition', requirePermission(Permission.PO_APPROVE), zValidator('json', transitionSchema), async (c) => {
  const id = c.req.param('id')!
  const body = c.req.valid('json' as never) as z.infer<typeof transitionSchema>
  const updated = await purchaseOrderService.transition(id, body.targetStatus, body.version, {
    approvalLevel: body.approvalLevel,
    approvalNotes: body.approvalNotes,
    rejectionReason: body.rejectionReason,
    cancelReason: body.cancelReason,
    revisionReason: body.revisionReason,
  })
  return c.json(success(updated, { message: `PO transitioned to ${body.targetStatus}` }))
})

// 7. Issue PO (shortcut for transition to ISSUED)
purchaseOrderRoutes.post('/pos/:id/issue', requirePermission(Permission.PO_ISSUE), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  const updated = await purchaseOrderService.transition(c.req.param('id')!, 'ISSUED', version)
  return c.json(success(updated, { message: 'PO issued to supplier' }))
})

// 8. Cancel PO
purchaseOrderRoutes.post('/pos/:id/cancel', requirePermission(Permission.PO_APPROVE), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json().catch(() => ({}))
  const updated = await purchaseOrderService.transition(c.req.param('id')!, 'CANCELLED', version, {
    cancelReason: body.cancelReason,
  })
  return c.json(success(updated, { message: 'PO cancelled' }))
})

// 9. Close PO
purchaseOrderRoutes.post('/pos/:id/close', requirePermission(Permission.PO_CLOSE), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  const updated = await purchaseOrderService.transition(c.req.param('id')!, 'CLOSED', version)
  return c.json(success(updated, { message: 'PO closed' }))
})

// 10. Supplier Accept
purchaseOrderRoutes.post('/pos/:id/supplier-accept', requirePermission(Permission.PO_APPROVE), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json().catch(() => ({}))
  const updated = await purchaseOrderService.supplierAcknowledge(c.req.param('id')!, 'ACCEPTED', version, {
    notes: body.notes,
  })
  return c.json(success(updated, { message: 'Supplier accepted PO' }))
})

// 11. Supplier Reject
purchaseOrderRoutes.post('/pos/:id/supplier-reject', requirePermission(Permission.PO_APPROVE), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json().catch(() => ({}))
  const updated = await purchaseOrderService.supplierAcknowledge(c.req.param('id')!, 'REJECTED', version, {
    notes: body.notes,
  })
  return c.json(success(updated, { message: 'Supplier rejected PO' }))
})

// 12. Supplier Counter Offer
purchaseOrderRoutes.post('/pos/:id/supplier-counter', requirePermission(Permission.PO_APPROVE), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json().catch(() => ({}))
  const updated = await purchaseOrderService.supplierAcknowledge(c.req.param('id')!, 'COUNTER_OFFER', version, {
    notes: body.notes,
    counterTotal: body.counterTotal,
  })
  return c.json(success(updated, { message: 'Supplier counter offer recorded' }))
})

// 13. Revision Request
purchaseOrderRoutes.post('/pos/:id/revision', requirePermission(Permission.PO_UPDATE), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json().catch(() => ({}))
  const updated = await purchaseOrderService.transition(c.req.param('id')!, 'REVISION_REQUESTED', version, {
    revisionReason: body.revisionReason,
  })
  return c.json(success(updated, { message: 'Revision requested' }))
})

// 14. Create PO from Quotation (Comparison Engine)
purchaseOrderRoutes.post('/pos/from-quotation', requirePermission(Permission.PO_CREATE), zValidator('json', createFromQuotationSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof createFromQuotationSchema>
  const po = await purchaseOrderService.createFromQuotation(body.quotationId, {
    companyId: body.companyId,
    companyName: body.companyName,
    plantId: body.plantId,
    plantName: body.plantName,
    warehouseId: body.warehouseId,
    warehouseName: body.warehouseName,
    buyerId: body.buyerId,
    buyerName: body.buyerName,
    expectedDeliveryDate: body.expectedDeliveryDate,
    shippingAddress: body.shippingAddress,
    billingAddress: body.billingAddress,
    paymentTerms: body.paymentTerms,
  })
  return c.json(success(po, { message: 'PO created from quotation' }), 201)
})

// 15. Print PDF (returns structured PDF data)
purchaseOrderRoutes.get('/pos/:id/pdf', requirePermission(Permission.PO_EXPORT), async (c) => {
  const pdfData = await purchaseOrderService.generatePdf(c.req.param('id')!)
  return c.json(success(pdfData, { message: 'PO PDF data generated' }))
})

// 16. Export PDF (same as print, but sets content-disposition header)
purchaseOrderRoutes.get('/pos/:id/export-pdf', requirePermission(Permission.PO_EXPORT), async (c) => {
  const pdfData = await purchaseOrderService.generatePdf(c.req.param('id')!)
  return c.json(success(pdfData, { message: 'PO PDF export ready' }))
})

// 17. Search POs (advanced search with multiple filters)
purchaseOrderRoutes.post('/pos/search', requirePermission(Permission.PO_READ), async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const result = await purchaseOrderService.list({
    page: Number(body.page ?? 1),
    pageSize: Number(body.pageSize ?? 25),
    search: body.search,
    status: body.status,
    poType: body.poType,
    supplierId: body.supplierId,
    plantId: body.plantId,
    sortBy: body.sortBy,
    sortOrder: body.sortOrder,
  })
  return c.json(paginated(result.rows, {
    correlationId: c.req.header('X-Request-Id') ?? '',
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  }))
})

/** Quotation API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { quotationService } from '../service'

export const quotationRoutes = new Hono()

const quotLineSchema = z.object({
  productId: z.string().uuid(), productSku: z.string().min(1), productName: z.string().min(1),
  rfqLineId: z.string().uuid().optional(), quotedQty: z.number().positive(),
  uomId: z.string().uuid(), uomCode: z.string().min(1), unitPrice: z.number().nonnegative(),
  currency: z.string().default('INR'), moq: z.number().nonnegative().optional(),
  leadTimeDays: z.number().int().positive().optional(), discountPercent: z.number().nonnegative().optional(), remarks: z.string().optional(),
})

const quotSchema = z.object({
  rfqId: z.string().uuid(), rfqNumber: z.string().min(1),
  supplierId: z.string().uuid(), supplierCode: z.string().min(1), supplierName: z.string().min(1),
  validityDate: z.string().datetime(), currency: z.string().default('INR'),
  paymentTerms: z.string().default('NET30'), deliveryTerms: z.string().optional(),
  leadTimeDays: z.number().int().positive().optional(), taxPercent: z.number().nonnegative().optional(),
  discountPercent: z.number().nonnegative().optional(), freightAmount: z.number().nonnegative().optional(),
  insuranceAmount: z.number().nonnegative().optional(), warrantyTerms: z.string().optional(),
  remarks: z.string().optional(), lines: z.array(quotLineSchema).min(1),
})

const transitionSchema = z.object({
  targetStatus: z.enum(['DRAFT', 'SUBMITTED', 'TECHNICAL_REVIEW', 'COMMERCIAL_REVIEW', 'RECOMMENDED', 'AWARDED', 'REJECTED', 'ARCHIVED']),
  version: z.number().int().min(0),
  technicalScore: z.number().min(0).max(100).optional(),
  commercialScore: z.number().min(0).max(100).optional(),
  overallScore: z.number().min(0).max(100).optional(),
  rank: z.number().int().positive().optional(),
  recommendationNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
})

const QUOT_READ = Permission.PO_READ
const QUOT_CREATE = Permission.PO_CREATE
const QUOT_APPROVE = Permission.PO_APPROVE

// List
quotationRoutes.get('/quotations', requirePermission(QUOT_READ), async (c) => {
  const result = await quotationService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, status: c.req.query('status') ?? undefined, rfqId: c.req.query('rfqId') ?? undefined, supplierId: c.req.query('supplierId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

// Get by ID
quotationRoutes.get('/quotations/:id', requirePermission(QUOT_READ), async (c) => {
  const quot = await quotationService.getById(c.req.param('id')!)
  return c.json(success(quot))
})

// Create
quotationRoutes.post('/quotations', requirePermission(QUOT_CREATE), zValidator('json', quotSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof quotSchema>
  const quot = await quotationService.create(body)
  return c.json(success(quot, { message: 'Quotation created' }), 201)
})

// Update
quotationRoutes.patch('/quotations/:id', requirePermission(QUOT_CREATE), async (c) => {
  const id = c.req.param('id')!; const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json()
  const updated = await quotationService.update(id, body, version)
  return c.json(success(updated, { message: 'Quotation updated' }))
})

// Delete
quotationRoutes.delete('/quotations/:id', requirePermission(QUOT_CREATE), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  await quotationService.delete(c.req.param('id')!, version)
  return c.json(success({ deleted: true }, { message: 'Quotation deleted' }))
})

// Transition (submit, review, recommend, award, reject)
quotationRoutes.post('/quotations/:id/transition', requirePermission(QUOT_APPROVE), zValidator('json', transitionSchema), async (c) => {
  const id = c.req.param('id')!; const body = c.req.valid('json' as never) as z.infer<typeof transitionSchema>
  const updated = await quotationService.transition(id, body.targetStatus, body.version, { technicalScore: body.technicalScore, commercialScore: body.commercialScore, overallScore: body.overallScore, rank: body.rank, recommendationNotes: body.recommendationNotes, rejectionReason: body.rejectionReason })
  return c.json(success(updated, { message: `Quotation transitioned to ${body.targetStatus}` }))
})

// Comparison Engine
quotationRoutes.get('/quotations/compare/:rfqId', requirePermission(QUOT_READ), async (c) => {
  const comparison = await quotationService.compareQuotations(c.req.param('rfqId')!)
  return c.json(success(comparison))
})

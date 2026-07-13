/** Goods Receipt API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { goodsReceiptService } from '../service'

export const goodsReceiptRoutes = new Hono()

const grnLineSchema = z.object({
  poLineId: z.string().uuid().optional(),
  productId: z.string().uuid(),
  productSku: z.string().min(1),
  productName: z.string().min(1),
  uomId: z.string().uuid(),
  uomCode: z.string().min(1),
  orderedQty: z.number().nonnegative().optional(),
  receivedQty: z.number().positive(),
  damagedQty: z.number().nonnegative().optional(),
  unitPrice: z.number().nonnegative(),
  batchNumber: z.string().optional(),
  lotNumber: z.string().optional(),
  manufactureDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  warehouseId: z.string().uuid().optional(),
  warehouseName: z.string().optional(),
  remarks: z.string().optional(),
})

const grnCreateSchema = z.object({
  poId: z.string().uuid().optional(),
  poNumber: z.string().optional(),
  supplierId: z.string().uuid(),
  supplierCode: z.string().min(1),
  supplierName: z.string().min(1),
  supplierInvoiceNumber: z.string().optional(),
  supplierInvoiceDate: z.string().datetime().optional(),
  supplierInvoiceAmount: z.number().nonnegative().optional(),
  deliveryChallanNumber: z.string().optional(),
  deliveryChallanDate: z.string().datetime().optional(),
  companyId: z.string().uuid(),
  companyName: z.string().min(1),
  plantId: z.string().uuid(),
  plantName: z.string().min(1),
  warehouseId: z.string().uuid().optional(),
  warehouseName: z.string().optional(),
  vehicleNumber: z.string().optional(),
  transportName: z.string().optional(),
  transportLorryNo: z.string().optional(),
  transportLrNumber: z.string().optional(),
  transportLrDate: z.string().datetime().optional(),
  transportMode: z.string().optional(),
  ewayBillNumber: z.string().optional(),
  ewayBillDate: z.string().datetime().optional(),
  remarks: z.string().optional(),
  internalNotes: z.string().optional(),
  lines: z.array(grnLineSchema).min(1),
})

const transitionSchema = z.object({
  targetStatus: z.enum(['DRAFT', 'VERIFIED', 'UNDER_INSPECTION', 'PARTIALLY_ACCEPTED', 'ACCEPTED', 'REJECTED', 'CLOSED', 'CANCELLED']),
  version: z.number().int().min(0),
  verificationNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
})

const damageSchema = z.object({
  grnLineId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  productSku: z.string().optional(),
  damageType: z.string().min(1),
  damagedQty: z.number().positive(),
  damageReason: z.string().min(1),
  damageSeverity: z.enum(['MINOR', 'MAJOR', 'CRITICAL']).default('MINOR'),
  actionTaken: z.string().optional(),
  photoUrl: z.string().optional(),
  remarks: z.string().optional(),
})

goodsReceiptRoutes.get('/grns', requirePermission(Permission.GRN_READ), async (c) => {
  const result = await goodsReceiptService.list({
    page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25),
    search: c.req.query('search') ?? undefined, status: c.req.query('status') ?? undefined,
    supplierId: c.req.query('supplierId') ?? undefined, poId: c.req.query('poId') ?? undefined,
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

goodsReceiptRoutes.get('/grns/:id', requirePermission(Permission.GRN_READ), async (c) => {
  const grn = await goodsReceiptService.getById(c.req.param('id')!)
  return c.json(success(grn))
})

goodsReceiptRoutes.post('/grns', requirePermission(Permission.GRN_CREATE), zValidator('json', grnCreateSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof grnCreateSchema>
  const grn = await goodsReceiptService.create(body)
  return c.json(success(grn, { message: 'Goods Receipt created' }), 201)
})

goodsReceiptRoutes.patch('/grns/:id', requirePermission(Permission.GRN_POST), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json()
  const updated = await goodsReceiptService.update(c.req.param('id')!, body, version)
  return c.json(success(updated, { message: 'Goods Receipt updated' }))
})

goodsReceiptRoutes.delete('/grns/:id', requirePermission(Permission.GRN_POST), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  await goodsReceiptService.delete(c.req.param('id')!, version)
  return c.json(success({ deleted: true }, { message: 'Goods Receipt deleted' }))
})

goodsReceiptRoutes.post('/grns/:id/transition', requirePermission(Permission.GRN_POST), zValidator('json', transitionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof transitionSchema>
  const updated = await goodsReceiptService.transition(c.req.param('id')!, body.targetStatus, body.version, { verificationNotes: body.verificationNotes, rejectionReason: body.rejectionReason })
  return c.json(success(updated, { message: `GRN transitioned to ${body.targetStatus}` }))
})

goodsReceiptRoutes.post('/grns/:id/damage', requirePermission(Permission.GRN_CREATE), zValidator('json', damageSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof damageSchema>
  const result = await goodsReceiptService.addDamage(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Damage recorded' }), 201)
})

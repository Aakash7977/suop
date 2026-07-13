/** Sales Order API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { salesOrderService } from '../service'

export const salesOrderRoutes = new Hono()

const CUSTOMER_READ = Permission.SO_READ
const CUSTOMER_CREATE = Permission.SO_CREATE
const CUSTOMER_UPDATE = Permission.SO_CREATE

const lineSchema = z.object({
  productId: z.string().uuid(), productSku: z.string().min(1), productName: z.string().min(1),
  uomId: z.string().uuid(), uomCode: z.string().min(1),
  orderedQty: z.number().positive(), unitPrice: z.number().nonnegative(),
  discountPercent: z.number().nonnegative().default(0), taxPercent: z.number().nonnegative().default(0),
  expectedDeliveryDate: z.string().datetime().optional(), remarks: z.string().optional(),
})

const soSchema = z.object({
  soType: z.string().default('STANDARD'),
  customerId: z.string().uuid(), customerCode: z.string().min(1), customerName: z.string().min(1), customerGstin: z.string().optional(),
  customerPoNumber: z.string().optional(), customerPoDate: z.string().optional(),
  companyId: z.string().uuid(), companyName: z.string().min(1), plantId: z.string().uuid().optional(), plantName: z.string().optional(),
  warehouseId: z.string().uuid().optional(), warehouseName: z.string().optional(),
  salespersonId: z.string().uuid().optional(), salespersonName: z.string().optional(),
  deliveryAddress: z.string().optional(), billingAddress: z.string().optional(),
  expectedDeliveryDate: z.string().datetime().optional(), deliveryTerms: z.string().optional(),
  paymentTerms: z.string().default('NET30'), creditDays: z.number().int().positive().default(30),
  currency: z.string().default('INR'), exchangeRate: z.number().positive().default(1),
  discountAmount: z.number().nonnegative().optional(), freightAmount: z.number().nonnegative().optional(),
  otherCharges: z.number().nonnegative().optional(), remarks: z.string().optional(), internalNotes: z.string().optional(),
  lines: z.array(lineSchema).min(1),
})

const transitionSchema = z.object({
  targetStatus: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'RESERVED', 'WAVE_PLANNED', 'PICKING', 'PICKED', 'PACKING', 'PACKED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED']),
  version: z.number().int().min(0),
})

const holdSchema = z.object({ holdType: z.string().min(1), holdReason: z.string().min(1) })
const releaseHoldSchema = z.object({ releaseReason: z.string().min(1) })

salesOrderRoutes.get('/orders', requirePermission(Permission.SO_READ), async (c) => {
  const result = await salesOrderService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, status: c.req.query('status') ?? undefined, customerId: c.req.query('customerId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
salesOrderRoutes.get('/orders/:id', requirePermission(Permission.SO_READ), async (c) => {
  const so = await salesOrderService.getById(c.req.param('id')!)
  return c.json(success(so))
})
salesOrderRoutes.post('/orders', requirePermission(Permission.SO_CREATE), zValidator('json', soSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof soSchema>
  const so = await salesOrderService.create(body)
  return c.json(success(so, { message: 'Sales order created' }), 201)
})
salesOrderRoutes.post('/orders/:id/transition', requirePermission(Permission.SO_UPDATE), zValidator('json', transitionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof transitionSchema>
  const updated = await salesOrderService.transition(c.req.param('id')!, body.targetStatus, body.version)
  return c.json(success(updated, { message: `SO transitioned to ${body.targetStatus}` }))
})
salesOrderRoutes.post('/orders/:id/hold', requirePermission(Permission.SO_UPDATE), zValidator('json', holdSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof holdSchema>
  const result = await salesOrderService.addHold(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Hold placed' }), 201)
})
salesOrderRoutes.post('/orders/:id/release-hold', requirePermission(Permission.SO_UPDATE), zValidator('json', releaseHoldSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof releaseHoldSchema>
  const result = await salesOrderService.releaseHold(c.req.param('id')!, body.releaseReason)
  return c.json(success(result, { message: 'Hold released' }))
})

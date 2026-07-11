/** Inventory API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { inventoryService } from '../service'

export const inventoryRoutes = new Hono()

const stockInSchema = z.object({
  grnId: z.string().uuid(), grnNumber: z.string().min(1),
  inspectionLotId: z.string().uuid(),
  productId: z.string().uuid(), productSku: z.string().min(1), productName: z.string().min(1),
  warehouseId: z.string().uuid(), warehouseName: z.string().min(1),
  binId: z.string().uuid().optional(), binCode: z.string().optional(),
  batchNumber: z.string().optional(), lotNumber: z.string().optional(),
  manufactureDate: z.string().datetime().optional(), expiryDate: z.string().datetime().optional(),
  quantity: z.number().positive(), unitCost: z.number().nonnegative(),
  uomId: z.string().uuid(), uomCode: z.string().min(1), currency: z.string().optional(),
})

const stockOutSchema = z.object({
  productId: z.string().uuid(), productSku: z.string().min(1), productName: z.string().min(1),
  warehouseId: z.string().uuid(), warehouseName: z.string().min(1),
  quantity: z.number().positive(), uomId: z.string().uuid(), uomCode: z.string().min(1),
  strategy: z.enum(['FEFO', 'FIFO']).default('FEFO'),
  referenceType: z.string().optional(), referenceId: z.string().uuid().optional(), referenceNumber: z.string().optional(),
  reason: z.string().min(1),
})

const reserveSchema = z.object({
  productId: z.string().uuid(), productSku: z.string().min(1),
  warehouseId: z.string().uuid(), reservedQty: z.number().positive(),
  uomId: z.string().uuid(), uomCode: z.string().min(1),
  reservationType: z.string().optional(), referenceType: z.string().optional(),
  referenceId: z.string().uuid().optional(), referenceNumber: z.string().optional(),
  reservedFor: z.string().optional(), expiresAt: z.string().datetime().optional(),
})

const blockSchema = z.object({
  productId: z.string().uuid(), productSku: z.string().min(1), warehouseId: z.string().uuid(),
  blockedQty: z.number().positive(), uomId: z.string().uuid(), uomCode: z.string().min(1),
  blockType: z.string().optional(), blockReason: z.string().min(1),
  sourceType: z.string().optional(), sourceId: z.string().uuid().optional(), sourceNumber: z.string().optional(),
})

// Inventory
inventoryRoutes.get('/inventory', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const result = await inventoryService.list({
    page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25),
    productId: c.req.query('productId') ?? undefined, warehouseId: c.req.query('warehouseId') ?? undefined,
    batchId: c.req.query('batchId') ?? undefined, expired: c.req.query('expired') === 'true',
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

inventoryRoutes.get('/inventory/:id', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const inv = await inventoryService.getById(c.req.param('id')!)
  return c.json(success(inv))
})

// Stock In
inventoryRoutes.post('/inventory/stock-in', requirePermission(Permission.INVENTORY_POST), zValidator('json', stockInSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof stockInSchema>
  const result = await inventoryService.stockIn(body)
  return c.json(success(result, { message: 'Stock added to inventory' }), 201)
})

// Stock Out
inventoryRoutes.post('/inventory/stock-out', requirePermission(Permission.INVENTORY_POST), zValidator('json', stockOutSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof stockOutSchema>
  const result = await inventoryService.stockOut(body)
  return c.json(success(result, { message: 'Stock issued from inventory' }))
})

// Ledger (IMMUTABLE)
inventoryRoutes.get('/ledger', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const result = await inventoryService.listLedger({
    page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25),
    productId: c.req.query('productId') ?? undefined, warehouseId: c.req.query('warehouseId') ?? undefined,
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

// Transactions
inventoryRoutes.get('/transactions', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const result = await inventoryService.listTransactions({
    page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25),
    productId: c.req.query('productId') ?? undefined, warehouseId: c.req.query('warehouseId') ?? undefined,
    movementType: c.req.query('movementType') ?? undefined,
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

// Reservations
inventoryRoutes.get('/reservations', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const result = await inventoryService.listReservations({
    page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25),
    status: c.req.query('status') ?? undefined, productId: c.req.query('productId') ?? undefined,
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

inventoryRoutes.post('/reservations', requirePermission(Permission.INVENTORY_POST), zValidator('json', reserveSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof reserveSchema>
  const result = await inventoryService.reserveStock(body)
  return c.json(success(result, { message: 'Stock reserved' }), 201)
})

inventoryRoutes.post('/reservations/:id/release', requirePermission(Permission.INVENTORY_POST), async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const released = await inventoryService.releaseReservation(c.req.param('id')!, body.reason ?? 'Released')
  return c.json(success(released, { message: 'Reservation released' }))
})

// Blocks
inventoryRoutes.get('/blocks', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const result = await inventoryService.listBlocks({
    page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25),
    status: c.req.query('status') ?? undefined,
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

inventoryRoutes.post('/blocks', requirePermission(Permission.INVENTORY_ADJUST), zValidator('json', blockSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof blockSchema>
  const result = await inventoryService.blockStock(body)
  return c.json(success(result, { message: 'Stock blocked' }), 201)
})

// Expiry tracking
inventoryRoutes.get('/expiry', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const days = Number(c.req.query('days') ?? 30)
  const result = await inventoryService.getExpiringStock(days)
  return c.json(success(result))
})

inventoryRoutes.post('/expiry/mark-expired', requirePermission(Permission.INVENTORY_ADJUST), async (c) => {
  const result = await inventoryService.markExpired()
  return c.json(success(result, { message: `${result.expiredCount} stock items marked expired` }))
})

// Batches
inventoryRoutes.get('/batches', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const result = await inventoryService.listBatches({
    page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25),
    productId: c.req.query('productId') ?? undefined, search: c.req.query('search') ?? undefined,
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

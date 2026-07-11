/** Warehouse API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { warehouseService } from '../service'

export const warehouseRoutes = new Hono()

// ─── Zones ──────────────────────────────────────────────────────────────────

const zoneSchema = z.object({
  warehouseId: z.string().uuid(), zoneCode: z.string().min(1), zoneName: z.string().min(1),
  zoneType: z.string().default('STORAGE'), capacity: z.number().nonnegative().optional(), description: z.string().optional(),
})

warehouseRoutes.get('/zones', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const zones = await warehouseService.listZones(c.req.query('warehouseId')!)
  return c.json(success(zones))
})

warehouseRoutes.post('/zones', requirePermission(Permission.INVENTORY_POST), zValidator('json', zoneSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof zoneSchema>
  const zone = await warehouseService.createZone(body)
  return c.json(success(zone, { message: 'Zone created' }), 201)
})

// ─── Aisles ─────────────────────────────────────────────────────────────────

const aisleSchema = z.object({
  warehouseId: z.string().uuid(), zoneId: z.string().uuid().optional(),
  aisleCode: z.string().min(1), aisleName: z.string().min(1),
  capacity: z.number().nonnegative().optional(), description: z.string().optional(),
})

warehouseRoutes.get('/aisles', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const aisles = await warehouseService.listAisles(c.req.query('warehouseId')!)
  return c.json(success(aisles))
})

warehouseRoutes.post('/aisles', requirePermission(Permission.INVENTORY_POST), zValidator('json', aisleSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof aisleSchema>
  const aisle = await warehouseService.createAisle(body)
  return c.json(success(aisle, { message: 'Aisle created' }), 201)
})

// ─── Racks ──────────────────────────────────────────────────────────────────

const rackSchema = z.object({
  warehouseId: z.string().uuid(), zoneId: z.string().uuid().optional(), aisleId: z.string().uuid().optional(),
  rackCode: z.string().min(1), rackName: z.string().min(1),
  rackType: z.string().default('STANDARD'), levels: z.number().int().positive().default(1),
  capacityPerLevel: z.number().nonnegative().optional(), description: z.string().optional(),
})

warehouseRoutes.get('/racks', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const racks = await warehouseService.listRacks(c.req.query('warehouseId')!)
  return c.json(success(racks))
})

warehouseRoutes.post('/racks', requirePermission(Permission.INVENTORY_POST), zValidator('json', rackSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof rackSchema>
  const rack = await warehouseService.createRack(body)
  return c.json(success(rack, { message: 'Rack created' }), 201)
})

// ─── Bins ───────────────────────────────────────────────────────────────────

const binSchema = z.object({
  warehouseId: z.string().uuid(), zoneId: z.string().uuid().optional(),
  aisleId: z.string().uuid().optional(), rackId: z.string().uuid().optional(),
  binCode: z.string().min(1), binName: z.string().min(1),
  binType: z.string().default('STORAGE'), level: z.number().int().positive().default(1),
  position: z.string().optional(), capacity: z.number().nonnegative().optional(), description: z.string().optional(),
})

warehouseRoutes.get('/bins', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const bins = await warehouseService.listBins(c.req.query('warehouseId')!, {
    zoneId: c.req.query('zoneId') ?? undefined,
    aisleId: c.req.query('aisleId') ?? undefined,
    rackId: c.req.query('rackId') ?? undefined,
  })
  return c.json(success(bins))
})

warehouseRoutes.post('/bins', requirePermission(Permission.INVENTORY_POST), zValidator('json', binSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof binSchema>
  const bin = await warehouseService.createBin(body)
  return c.json(success(bin, { message: 'Bin created' }), 201)
})

// ─── Putaway Tasks ──────────────────────────────────────────────────────────

const putawaySchema = z.object({
  grnId: z.string().uuid().optional(), grnNumber: z.string().optional(), grnLineId: z.string().uuid().optional(),
  inspectionLotId: z.string().uuid(),
  productId: z.string().uuid(), productSku: z.string().min(1), productName: z.string().min(1),
  batchId: z.string().uuid().optional(), batchNumber: z.string().optional(),
  lotId: z.string().uuid().optional(), lotNumber: z.string().optional(),
  quantity: z.number().positive(), uomId: z.string().uuid(), uomCode: z.string().min(1),
  warehouseId: z.string().uuid(), warehouseName: z.string().min(1),
  targetBinId: z.string().uuid().optional(), targetBinCode: z.string().optional(),
  assignedTo: z.string().uuid().optional(), assignedToName: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'), remarks: z.string().optional(),
})

warehouseRoutes.get('/putaway-tasks', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const result = await warehouseService.listPutawayTasks({
    page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25),
    status: c.req.query('status') ?? undefined, warehouseId: c.req.query('warehouseId') ?? undefined,
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

warehouseRoutes.post('/putaway-tasks', requirePermission(Permission.INVENTORY_POST), zValidator('json', putawaySchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof putawaySchema>
  const task = await warehouseService.createPutawayTask(body)
  return c.json(success(task, { message: 'Putaway task created' }), 201)
})

warehouseRoutes.post('/putaway-tasks/:id/complete', requirePermission(Permission.INVENTORY_POST), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  const updated = await warehouseService.completePutaway(c.req.param('id')!, version)
  return c.json(success(updated, { message: 'Putaway task completed' }))
})

// ─── Barcodes ───────────────────────────────────────────────────────────────

const barcodeSchema = z.object({
  labelType: z.enum(['PRODUCT', 'BATCH', 'LOT', 'BIN', 'GRN', 'PALLET', 'GS1', 'QR']),
  productId: z.string().uuid().optional(), productSku: z.string().optional(), productName: z.string().optional(),
  batchId: z.string().uuid().optional(), batchNumber: z.string().optional(),
  lotId: z.string().uuid().optional(), lotNumber: z.string().optional(),
  warehouseId: z.string().uuid().optional(), binId: z.string().uuid().optional(), binCode: z.string().optional(),
  grnId: z.string().uuid().optional(), grnNumber: z.string().optional(),
  quantity: z.number().optional(), uomCode: z.string().optional(),
  manufactureDate: z.string().datetime().optional(), expiryDate: z.string().datetime().optional(),
  gs1Gtin: z.string().optional(),
})

const scanSchema = z.object({
  barcode: z.string().min(1), scanType: z.string().min(1), scanContext: z.string().optional(),
  deviceId: z.string().optional(), location: z.string().optional(),
})

warehouseRoutes.get('/barcodes', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const result = await warehouseService.listBarcodes({
    page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25),
    labelType: c.req.query('labelType') ?? undefined, productId: c.req.query('productId') ?? undefined,
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

warehouseRoutes.post('/barcodes', requirePermission(Permission.INVENTORY_POST), zValidator('json', barcodeSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof barcodeSchema>
  const label = await warehouseService.createBarcode(body)
  return c.json(success(label, { message: 'Barcode label created' }), 201)
})

warehouseRoutes.post('/barcodes/:id/print', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const label = await warehouseService.printBarcode(c.req.param('id')!)
  return c.json(success(label, { message: 'Barcode marked as printed' }))
})

// ─── Scanner API ────────────────────────────────────────────────────────────

warehouseRoutes.post('/scan', requirePermission(Permission.INVENTORY_READ), zValidator('json', scanSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof scanSchema>
  const label = await warehouseService.scanBarcode(body)
  return c.json(success(label, { message: 'Barcode scanned successfully' }))
})

warehouseRoutes.get('/scan-logs', requirePermission(Permission.INVENTORY_READ), async (c) => {
  const result = await warehouseService.listScanLogs({
    page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25),
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

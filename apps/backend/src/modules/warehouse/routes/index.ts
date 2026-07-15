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

warehouseRoutes.get('/zones', requirePermission(Permission.WAREHOUSE_READ), async (c) => {
  const zones = await warehouseService.listZones(c.req.query('warehouseId')!)
  return c.json(success(zones))
})

warehouseRoutes.post('/zones', requirePermission(Permission.WAREHOUSE_CREATE), zValidator('json', zoneSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof zoneSchema>
  const zone = await warehouseService.createZone(body)
  return c.json(success(zone, { message: 'Zone created' }), 201)
})

const zoneUpdateSchema = z.object({
  zoneName: z.string().min(1).optional(), zoneType: z.string().optional(),
  capacity: z.number().nonnegative().optional(), isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(), description: z.string().optional(),
})

warehouseRoutes.patch('/zones/:id', requirePermission(Permission.WAREHOUSE_UPDATE), zValidator('json', zoneUpdateSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof zoneUpdateSchema>
  const zone = await warehouseService.updateZone(c.req.param('id')!, body)
  return c.json(success(zone, { message: 'Zone updated' }))
})

warehouseRoutes.delete('/zones/:id', requirePermission(Permission.WAREHOUSE_ARCHIVE), async (c) => {
  await warehouseService.deleteZone(c.req.param('id')!)
  return c.json(success({ deleted: true }, { message: 'Zone deleted' }))
})

// ─── Aisles ─────────────────────────────────────────────────────────────────

const aisleSchema = z.object({
  warehouseId: z.string().uuid(), zoneId: z.string().uuid().optional(),
  aisleCode: z.string().min(1), aisleName: z.string().min(1),
  capacity: z.number().nonnegative().optional(), description: z.string().optional(),
})

warehouseRoutes.get('/aisles', requirePermission(Permission.WAREHOUSE_READ), async (c) => {
  const aisles = await warehouseService.listAisles(c.req.query('warehouseId')!)
  return c.json(success(aisles))
})

warehouseRoutes.post('/aisles', requirePermission(Permission.WAREHOUSE_CREATE), zValidator('json', aisleSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof aisleSchema>
  const aisle = await warehouseService.createAisle(body)
  return c.json(success(aisle, { message: 'Aisle created' }), 201)
})

const aisleUpdateSchema = z.object({
  aisleName: z.string().min(1).optional(), capacity: z.number().nonnegative().optional(),
  isActive: z.boolean().optional(), sortOrder: z.number().int().optional(), description: z.string().optional(),
})

warehouseRoutes.patch('/aisles/:id', requirePermission(Permission.WAREHOUSE_UPDATE), zValidator('json', aisleUpdateSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof aisleUpdateSchema>
  const aisle = await warehouseService.updateAisle(c.req.param('id')!, body)
  return c.json(success(aisle, { message: 'Aisle updated' }))
})

warehouseRoutes.delete('/aisles/:id', requirePermission(Permission.WAREHOUSE_ARCHIVE), async (c) => {
  await warehouseService.deleteAisle(c.req.param('id')!)
  return c.json(success({ deleted: true }, { message: 'Aisle deleted' }))
})

// ─── Racks ──────────────────────────────────────────────────────────────────

const rackSchema = z.object({
  warehouseId: z.string().uuid(), zoneId: z.string().uuid().optional(), aisleId: z.string().uuid().optional(),
  rackCode: z.string().min(1), rackName: z.string().min(1),
  rackType: z.string().default('STANDARD'), levels: z.number().int().positive().default(1),
  capacityPerLevel: z.number().nonnegative().optional(), description: z.string().optional(),
})

warehouseRoutes.get('/racks', requirePermission(Permission.WAREHOUSE_READ), async (c) => {
  const racks = await warehouseService.listRacks(c.req.query('warehouseId')!)
  return c.json(success(racks))
})

warehouseRoutes.post('/racks', requirePermission(Permission.WAREHOUSE_CREATE), zValidator('json', rackSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof rackSchema>
  const rack = await warehouseService.createRack(body)
  return c.json(success(rack, { message: 'Rack created' }), 201)
})

const rackUpdateSchema = z.object({
  rackName: z.string().min(1).optional(), rackType: z.string().optional(),
  levels: z.number().int().positive().optional(), capacityPerLevel: z.number().nonnegative().optional(),
  capacity: z.number().nonnegative().optional(), isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(), description: z.string().optional(),
})

warehouseRoutes.patch('/racks/:id', requirePermission(Permission.WAREHOUSE_UPDATE), zValidator('json', rackUpdateSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof rackUpdateSchema>
  const rack = await warehouseService.updateRack(c.req.param('id')!, body)
  return c.json(success(rack, { message: 'Rack updated' }))
})

warehouseRoutes.delete('/racks/:id', requirePermission(Permission.WAREHOUSE_ARCHIVE), async (c) => {
  await warehouseService.deleteRack(c.req.param('id')!)
  return c.json(success({ deleted: true }, { message: 'Rack deleted' }))
})

// ─── Bins ───────────────────────────────────────────────────────────────────

const binSchema = z.object({
  warehouseId: z.string().uuid(), zoneId: z.string().uuid().optional(),
  aisleId: z.string().uuid().optional(), rackId: z.string().uuid().optional(),
  binCode: z.string().min(1), binName: z.string().min(1),
  binType: z.string().default('STORAGE'), level: z.number().int().positive().default(1),
  position: z.string().optional(), capacity: z.number().nonnegative().optional(), description: z.string().optional(),
})

warehouseRoutes.get('/bins', requirePermission(Permission.WAREHOUSE_READ), async (c) => {
  const bins = await warehouseService.listBins(c.req.query('warehouseId')!, {
    zoneId: c.req.query('zoneId') ?? undefined,
    aisleId: c.req.query('aisleId') ?? undefined,
    rackId: c.req.query('rackId') ?? undefined,
  })
  return c.json(success(bins))
})

warehouseRoutes.post('/bins', requirePermission(Permission.WAREHOUSE_CREATE), zValidator('json', binSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof binSchema>
  const bin = await warehouseService.createBin(body)
  return c.json(success(bin, { message: 'Bin created' }), 201)
})

const binUpdateSchema = z.object({
  binName: z.string().min(1).optional(), binType: z.string().optional(),
  capacity: z.number().nonnegative().optional(), isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(), description: z.string().optional(),
})

warehouseRoutes.patch('/bins/:id', requirePermission(Permission.WAREHOUSE_UPDATE), zValidator('json', binUpdateSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof binUpdateSchema>
  const bin = await warehouseService.updateBin(c.req.param('id')!, body)
  return c.json(success(bin, { message: 'Bin updated' }))
})

warehouseRoutes.delete('/bins/:id', requirePermission(Permission.WAREHOUSE_ARCHIVE), async (c) => {
  await warehouseService.deleteBin(c.req.param('id')!)
  return c.json(success({ deleted: true }, { message: 'Bin deleted' }))
})

warehouseRoutes.post('/bins/:id/block', requirePermission(Permission.WAREHOUSE_UPDATE), zValidator('json', z.object({ blockReason: z.string().min(3) })), async (c) => {
  const body = c.req.valid('json' as never) as { blockReason: string }
  const bin = await warehouseService.blockBin(c.req.param('id')!, body.blockReason)
  return c.json(success(bin, { message: 'Bin blocked' }))
})

warehouseRoutes.post('/bins/:id/unblock', requirePermission(Permission.WAREHOUSE_UPDATE), async (c) => {
  const bin = await warehouseService.unblockBin(c.req.param('id')!)
  return c.json(success(bin, { message: 'Bin unblocked' }))
})

warehouseRoutes.get('/bins/empty', requirePermission(Permission.WAREHOUSE_READ), async (c) => {
  const bins = await warehouseService.findEmptyBins(c.req.query('warehouseId')!)
  return c.json(success(bins))
})

warehouseRoutes.get('/bins/export', requirePermission(Permission.WAREHOUSE_READ), async (c) => {
  const rows = await warehouseService.exportBins(c.req.query('warehouseId')!, {
    zoneId: c.req.query('zoneId') ?? undefined,
    isBlocked: c.req.query('isBlocked') === 'true' ? true : c.req.query('isBlocked') === 'false' ? false : undefined,
    emptyOnly: c.req.query('emptyOnly') === 'true',
  })
  return c.json(success(rows, { message: `${rows.length} bins exported` }))
})

warehouseRoutes.post('/bins/bulk-block', requirePermission(Permission.WAREHOUSE_UPDATE), zValidator('json', z.object({ binIds: z.array(z.string().uuid()), blockReason: z.string().min(3) })), async (c) => {
  const body = c.req.valid('json' as never) as { binIds: string[]; blockReason: string }
  const result = await warehouseService.bulkBlockBins(body.binIds, body.blockReason)
  return c.json(success(result, { message: `Blocked ${result.blockedCount} of ${result.totalBins} bins` }))
})

warehouseRoutes.post('/bins/bulk-unblock', requirePermission(Permission.WAREHOUSE_UPDATE), zValidator('json', z.object({ binIds: z.array(z.string().uuid()) })), async (c) => {
  const body = c.req.valid('json' as never) as { binIds: string[] }
  const result = await warehouseService.bulkUnblockBins(body.binIds)
  return c.json(success(result, { message: `Unblocked ${result.unblockedCount} of ${result.totalBins} bins` }))
})

warehouseRoutes.get('/dashboard', requirePermission(Permission.WAREHOUSE_READ), async (c) => {
  const dashboard = await warehouseService.getWarehouseDashboard(c.req.query('warehouseId')!)
  return c.json(success(dashboard))
})

warehouseRoutes.get('/occupancy', requirePermission(Permission.WAREHOUSE_READ), async (c) => {
  const stats = await warehouseService.getBinOccupancyStats(c.req.query('warehouseId')!)
  return c.json(success(stats))
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

warehouseRoutes.get('/putaway-tasks', requirePermission(Permission.WAREHOUSE_READ), async (c) => {
  const result = await warehouseService.listPutawayTasks({
    page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25),
    status: c.req.query('status') ?? undefined, warehouseId: c.req.query('warehouseId') ?? undefined,
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

warehouseRoutes.post('/putaway-tasks', requirePermission(Permission.WAREHOUSE_CREATE), zValidator('json', putawaySchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof putawaySchema>
  const task = await warehouseService.createPutawayTask(body)
  return c.json(success(task, { message: 'Putaway task created' }), 201)
})

warehouseRoutes.post('/putaway-tasks/:id/complete', requirePermission(Permission.WAREHOUSE_CREATE), async (c) => {
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

warehouseRoutes.get('/barcodes', requirePermission(Permission.WAREHOUSE_READ), async (c) => {
  const result = await warehouseService.listBarcodes({
    page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25),
    labelType: c.req.query('labelType') ?? undefined, productId: c.req.query('productId') ?? undefined,
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

warehouseRoutes.post('/barcodes', requirePermission(Permission.WAREHOUSE_CREATE), zValidator('json', barcodeSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof barcodeSchema>
  const label = await warehouseService.createBarcode(body)
  return c.json(success(label, { message: 'Barcode label created' }), 201)
})

warehouseRoutes.post('/barcodes/:id/print', requirePermission(Permission.WAREHOUSE_READ), async (c) => {
  const label = await warehouseService.printBarcode(c.req.param('id')!)
  return c.json(success(label, { message: 'Barcode marked as printed' }))
})

// ─── Scanner API ────────────────────────────────────────────────────────────

warehouseRoutes.post('/scan', requirePermission(Permission.WAREHOUSE_READ), zValidator('json', scanSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof scanSchema>
  const label = await warehouseService.scanBarcode(body)
  return c.json(success(label, { message: 'Barcode scanned successfully' }))
})

warehouseRoutes.get('/scan-logs', requirePermission(Permission.WAREHOUSE_READ), async (c) => {
  const result = await warehouseService.listScanLogs({
    page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25),
  })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

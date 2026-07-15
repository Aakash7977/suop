/** Warehouse Service — Zones, Aisles, Racks, Bins, Putaway Engine, Barcode Engine
 *
 * Business Rules:
 * - Warehouse capacity validation (bin capacity cannot be exceeded)
 * - Put-away validation (target bin must exist, be active, not blocked, have capacity)
 * - Barcode unique
 * - GS1 label format support
 * - QR code data generation
 */
import {
  zoneRepository, aisleRepository, rackRepository, binRepository,
  putawayTaskRepository, barcodeRepository, scanLogRepository,
} from '../repository'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { BusinessRuleError, NotFoundError, AuthorizationError, ConcurrencyError } from '@/core/errors'
import { enforceNotBreakGlass, enforceTenantIsolation } from '@/core/security/sod-enforcement'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail, ctx }
}

export const warehouseService = {
  // ═══ Zones ════════════════════════════════════════════════════════════════

  async createZone(data: { warehouseId: string; zoneCode: string; zoneName: string; zoneType?: string; capacity?: number; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const zone = await zoneRepository.create({
      tenantId, warehouseId: data.warehouseId, zoneCode: data.zoneCode, zoneName: data.zoneName,
      zoneType: data.zoneType ?? 'STORAGE', capacity: data.capacity ?? 0, usedCapacity: 0, isActive: true, description: data.description,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'WarehouseZone', entityId: String(zone!['id']), entityCode: data.zoneCode, after: data })
    return zone
  },

  async listZones(warehouseId: string, params: { page?: number; pageSize?: number; search?: string; zoneType?: string } = {}) {
    const { tenantId } = getContext()
    return zoneRepository.list(tenantId, warehouseId, params)
  },

  async updateZone(id: string, data: { zoneName?: string; zoneType?: string; capacity?: number; isActive?: boolean; sortOrder?: number; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await zoneRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('WarehouseZone', id)
    const updated = await zoneRepository.update(tenantId, id, data)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'WarehouseZone', entityId: id, before: existing, after: data })
    return updated
  },

  async deleteZone(id: string) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await zoneRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('WarehouseZone', id)
    await zoneRepository.softDelete(tenantId, id, userId)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'DELETE', entityType: 'WarehouseZone', entityId: id })
  },

  // ═══ Aisles ═══════════════════════════════════════════════════════════════

  async createAisle(data: { warehouseId: string; zoneId?: string; aisleCode: string; aisleName: string; capacity?: number; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const aisle = await aisleRepository.create({
      tenantId, warehouseId: data.warehouseId, zoneId: data.zoneId, aisleCode: data.aisleCode, aisleName: data.aisleName,
      capacity: data.capacity ?? 0, usedCapacity: 0, isActive: true, description: data.description,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'WarehouseAisle', entityId: String(aisle!['id']), entityCode: data.aisleCode, after: data })
    return aisle
  },

  async listAisles(warehouseId: string, params: { page?: number; pageSize?: number; search?: string; zoneId?: string } = {}) {
    const { tenantId } = getContext()
    return aisleRepository.list(tenantId, warehouseId, params)
  },

  async updateAisle(id: string, data: { aisleName?: string; capacity?: number; isActive?: boolean; sortOrder?: number; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await aisleRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('WarehouseAisle', id)
    const updated = await aisleRepository.update(tenantId, id, data)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'WarehouseAisle', entityId: id, before: existing, after: data })
    return updated
  },

  async deleteAisle(id: string) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await aisleRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('WarehouseAisle', id)
    await aisleRepository.softDelete(tenantId, id, userId)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'DELETE', entityType: 'WarehouseAisle', entityId: id })
  },

  // ═══ Racks ════════════════════════════════════════════════════════════════

  async createRack(data: { warehouseId: string; zoneId?: string; aisleId?: string; rackCode: string; rackName: string; rackType?: string; levels?: number; capacityPerLevel?: number; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const levels = data.levels ?? 1
    const capacityPerLevel = data.capacityPerLevel ?? 0
    const totalCapacity = capacityPerLevel * levels
    const rack = await rackRepository.create({
      tenantId, warehouseId: data.warehouseId, zoneId: data.zoneId, aisleId: data.aisleId,
      rackCode: data.rackCode, rackName: data.rackName, rackType: data.rackType ?? 'STANDARD',
      levels, capacityPerLevel, capacity: totalCapacity, usedCapacity: 0, isActive: true, description: data.description,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'WarehouseRack', entityId: String(rack!['id']), entityCode: data.rackCode, after: data })
    return rack
  },

  async listRacks(warehouseId: string, params: { page?: number; pageSize?: number; search?: string; zoneId?: string; aisleId?: string } = {}) {
    const { tenantId } = getContext()
    return rackRepository.list(tenantId, warehouseId, params)
  },

  async updateRack(id: string, data: { rackName?: string; rackType?: string; levels?: number; capacityPerLevel?: number; capacity?: number; isActive?: boolean; sortOrder?: number; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await rackRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('WarehouseRack', id)
    const updated = await rackRepository.update(tenantId, id, data)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'WarehouseRack', entityId: id, before: existing, after: data })
    return updated
  },

  async deleteRack(id: string) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await rackRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('WarehouseRack', id)
    await rackRepository.softDelete(tenantId, id, userId)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'DELETE', entityType: 'WarehouseRack', entityId: id })
  },

  // ═══ Bins ═════════════════════════════════════════════════════════════════

  async createBin(data: { warehouseId: string; zoneId?: string; aisleId?: string; rackId?: string; binCode: string; binName: string; binType?: string; level?: number; position?: string; capacity?: number; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const bin = await binRepository.create({
      tenantId, warehouseId: data.warehouseId, zoneId: data.zoneId, aisleId: data.aisleId, rackId: data.rackId,
      binCode: data.binCode, binName: data.binName, binType: data.binType ?? 'STORAGE',
      level: data.level ?? 1, position: data.position, capacity: data.capacity ?? 0, usedCapacity: 0,
      isActive: true, isBlocked: false, description: data.description,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'WarehouseBin', entityId: String(bin!['id']), entityCode: data.binCode, after: data })
    return bin
  },

  async listBins(warehouseId: string, params: { page?: number; pageSize?: number; zoneId?: string; aisleId?: string; rackId?: string; search?: string; isBlocked?: boolean; isActive?: boolean; emptyOnly?: boolean } = {}) {
    const { tenantId } = getContext()
    return binRepository.list(tenantId, warehouseId, params)
  },

  async updateBin(id: string, data: { binName?: string; binType?: string; capacity?: number; isActive?: boolean; sortOrder?: number; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await binRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('WarehouseBin', id)
    const updated = await binRepository.update(tenantId, id, data)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'WarehouseBin', entityId: id, before: existing, after: data })
    return updated
  },

  async deleteBin(id: string) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await binRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('WarehouseBin', id)
    // Business rule: cannot delete bin with stock
    if (Number(existing['used_capacity']) > 0) {
      throw new BusinessRuleError('Cannot delete bin with used capacity > 0', { code: 'WH.BIN_NOT_EMPTY' })
    }
    await binRepository.softDelete(tenantId, id, userId)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'DELETE', entityType: 'WarehouseBin', entityId: id })
  },

  async blockBin(id: string, blockReason: string) {
    const { tenantId, userId, ctx } = getContext()
    enforceNotBreakGlass('blockBin')
    if (!blockReason || blockReason.trim().length < 3) {
      throw new BusinessRuleError('Block reason must be at least 3 characters', { code: 'WH.BLOCK_REASON_REQUIRED' })
    }
    const existing = await binRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('WarehouseBin', id)
    if (existing['is_blocked']) throw new BusinessRuleError('Bin is already blocked', { code: 'WH.BIN_ALREADY_BLOCKED' })
    const updated = await binRepository.block(tenantId, id, blockReason, userId)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'BIN_BLOCKED', entityType: 'WarehouseBin', entityId: id, after: { blockReason, blockedBy: userId } })
    await eventBus.writeToOutbox({ eventName: 'BinBlocked', payload: { binId: id, blockReason }, tenantId })
    return updated
  },

  async unblockBin(id: string) {
    const { tenantId, userId, ctx } = getContext()
    enforceNotBreakGlass('unblockBin')
    const existing = await binRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('WarehouseBin', id)
    if (!existing['is_blocked']) throw new BusinessRuleError('Bin is not blocked', { code: 'WH.BIN_NOT_BLOCKED' })
    const updated = await binRepository.unblock(tenantId, id)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'BIN_UNBLOCKED', entityType: 'WarehouseBin', entityId: id })
    await eventBus.writeToOutbox({ eventName: 'BinUnblocked', payload: { binId: id }, tenantId })
    return updated
  },

  async findEmptyBins(warehouseId: string) {
    const { tenantId } = getContext()
    return binRepository.findEmptyBins(tenantId, warehouseId)
  },

  async getBinOccupancyStats(warehouseId: string) {
    const { tenantId } = getContext()
    return binRepository.getBinOccupancyStats(tenantId, warehouseId)
  },

  async exportBins(warehouseId: string, params: { zoneId?: string; isBlocked?: boolean; emptyOnly?: boolean } = {}) {
    const { tenantId } = getContext()
    const result = await binRepository.list(tenantId, warehouseId, { ...params, page: 1, pageSize: 10000 })
    return result.rows
  },

  async bulkBlockBins(binIds: string[], blockReason: string) {
    const { tenantId, userId, ctx } = getContext()
    enforceNotBreakGlass('bulkBlockBins')
    if (!binIds || binIds.length === 0) throw new BusinessRuleError('No bins to block', { code: 'WH.BULK_EMPTY' })
    if (!blockReason || blockReason.trim().length < 3) throw new BusinessRuleError('Block reason required', { code: 'WH.BLOCK_REASON_REQUIRED' })
    let blockedCount = 0
    const errors: Array<{ binId: string; error: string }> = []
    for (const binId of binIds) {
      try {
        const existing = await binRepository.findById(tenantId, binId)
        if (!existing || existing['is_blocked']) continue
        await binRepository.block(tenantId, binId, blockReason, userId)
        blockedCount++
      } catch (err) {
        errors.push({ binId, error: (err as Error).message })
      }
    }
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'BULK_BIN_BLOCK', entityType: 'WarehouseBin', entityId: 'bulk', after: { totalBins: binIds.length, blockedCount, errors } })
    return { totalBins: binIds.length, blockedCount, errors }
  },

  async bulkUnblockBins(binIds: string[]) {
    const { tenantId, userId, ctx } = getContext()
    enforceNotBreakGlass('bulkUnblockBins')
    if (!binIds || binIds.length === 0) throw new BusinessRuleError('No bins to unblock', { code: 'WH.BULK_EMPTY' })
    let unblockedCount = 0
    const errors: Array<{ binId: string; error: string }> = []
    for (const binId of binIds) {
      try {
        const existing = await binRepository.findById(tenantId, binId)
        if (!existing || !existing['is_blocked']) continue
        await binRepository.unblock(tenantId, binId)
        unblockedCount++
      } catch (err) {
        errors.push({ binId, error: (err as Error).message })
      }
    }
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'BULK_BIN_UNBLOCK', entityType: 'WarehouseBin', entityId: 'bulk', after: { totalBins: binIds.length, unblockedCount, errors } })
    return { totalBins: binIds.length, unblockedCount, errors }
  },

  async getWarehouseDashboard(warehouseId: string) {
    const { tenantId } = getContext()
    const binStats = await binRepository.getBinOccupancyStats(tenantId, warehouseId)
    const zones = await zoneRepository.list(tenantId, warehouseId)
    const putawayTasks = await putawayTaskRepository.list(tenantId, { warehouseId, page: 1, pageSize: 1 })
    return {
      binStats,
      totalZones: zones.length,
      totalPutawayTasks: putawayTasks.total,
      pendingPutawayTasks: 0, // Would be filtered query in production
    }
  },

  // ═══ Put-away Engine ══════════════════════════════════════════════════════

  async createPutawayTask(data: {
    grnId?: string; grnNumber?: string; grnLineId?: string
    inspectionLotId: string
    productId: string; productSku: string; productName: string
    batchId?: string; batchNumber?: string; lotId?: string; lotNumber?: string
    quantity: number; uomId: string; uomCode: string
    warehouseId: string; warehouseName: string
    targetBinId?: string; targetBinCode?: string
    assignedTo?: string; assignedToName?: string
    priority?: string; remarks?: string
  }) {
    const { tenantId, userId, ctx } = getContext()

    if (data.quantity <= 0) throw new BusinessRuleError('Quantity must be positive', { code: 'WH.INVALID_QTY' })

    // Put-away validation: if target bin specified, validate it
    let targetBinId = data.targetBinId
    let targetBinCode = data.targetBinCode
    if (!targetBinId) {
      // Auto-allocate bin using capacity validation
      const bin = await binRepository.findAvailableBin(tenantId, data.warehouseId, data.quantity)
      if (!bin) {
        throw new BusinessRuleError('No available bin with sufficient capacity', { code: 'WH.NO_AVAILABLE_BIN' })
      }
      targetBinId = String(bin['id'])
      targetBinCode = String(bin['bin_code'])
    } else {
      // Validate specified bin
      const bin = await binRepository.findById(tenantId, targetBinId)
      if (!bin) throw new BusinessRuleError('Target bin not found', { code: 'WH.BIN_NOT_FOUND' })
      if (!bin['is_active']) throw new BusinessRuleError('Target bin is not active', { code: 'WH.BIN_INACTIVE' })
      if (bin['is_blocked']) throw new BusinessRuleError(`Target bin is blocked: ${bin['block_reason'] ?? 'N/A'}`, { code: 'WH.BIN_BLOCKED' })
      // Capacity validation
      const capacity = Number(bin['capacity'])
      const usedCapacity = Number(bin['used_capacity'])
      if (capacity > 0 && (usedCapacity + data.quantity) > capacity) {
        throw new BusinessRuleError(`Bin capacity exceeded. Available: ${capacity - usedCapacity}, Required: ${data.quantity}`, { code: 'WH.CAPACITY_EXCEEDED' })
      }
    }

    const taskNumber = await putawayTaskRepository.generateTaskNumber(tenantId)
    const task = await putawayTaskRepository.create({
      tenantId, taskNumber,
      grnId: data.grnId, grnNumber: data.grnNumber, grnLineId: data.grnLineId,
      inspectionLotId: data.inspectionLotId,
      productId: data.productId, productSku: data.productSku, productName: data.productName,
      batchId: data.batchId, batchNumber: data.batchNumber, lotId: data.lotId, lotNumber: data.lotNumber,
      quantity: data.quantity, uomId: data.uomId, uomCode: data.uomCode,
      warehouseId: data.warehouseId, warehouseName: data.warehouseName,
      targetBinId, targetBinCode,
      assignedTo: data.assignedTo, assignedToName: data.assignedToName,
      status: 'PENDING', priority: data.priority ?? 'NORMAL', remarks: data.remarks,
    })

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'PUTAWAY_CREATED', entityType: 'PutawayTask', entityId: String(task!['id']), entityCode: taskNumber,
      after: { ...data, targetBinId, targetBinCode },
    })
    await eventBus.writeToOutbox({
      eventName: 'PutawayTaskCreated', payload: { taskId: String(task!['id']), taskNumber, targetBinId, targetBinCode }, tenantId,
    })

    return task
  },

  async listPutawayTasks(params: { page?: number; pageSize?: number; status?: string; warehouseId?: string } = {}) {
    const { tenantId } = getContext()
    return putawayTaskRepository.list(tenantId, params)
  },

  async completePutaway(id: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await putawayTaskRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('PutawayTask', id)
    if (String(existing['status']) !== 'IN_PROGRESS' && String(existing['status']) !== 'PENDING') {
      throw new BusinessRuleError(`Cannot complete task in ${existing['status']} status`, { code: 'WH.NOT_COMPLETABLE' })
    }

    const updated = await putawayTaskRepository.update(tenantId, id, {
      status: 'COMPLETED', completedAt: new Date().toISOString(),
    }, version, userId)
    if (!updated) throw new BusinessRuleError('Task was modified by another transaction', { code: 'WH.CONCURRENCY' })

    // Update bin used capacity
    if (existing['target_bin_id']) {
      const bin = await binRepository.findById(tenantId, String(existing['target_bin_id']))
      if (bin) {
        const newUsed = Number(bin['used_capacity']) + Number(existing['quantity'])
        await binRepository.updateUsedCapacity(tenantId, String(bin['id']), newUsed)
      }
    }

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'PUTAWAY_COMPLETED', entityType: 'PutawayTask', entityId: id, entityCode: String(existing['task_number']),
    })
    await eventBus.writeToOutbox({
      eventName: 'PutawayCompleted', payload: { taskId: id, taskNumber: String(existing['task_number']), binId: String(existing['target_bin_id']) }, tenantId,
    })

    return updated
  },

  // ═══ Barcode Engine ═══════════════════════════════════════════════════════

  async createBarcode(data: {
    labelType: 'PRODUCT' | 'BATCH' | 'LOT' | 'BIN' | 'GRN' | 'PALLET' | 'GS1' | 'QR'
    productId?: string; productSku?: string; productName?: string
    batchId?: string; batchNumber?: string; lotId?: string; lotNumber?: string
    warehouseId?: string; binId?: string; binCode?: string
    grnId?: string; grnNumber?: string
    quantity?: number; uomCode?: string
    manufactureDate?: string; expiryDate?: string
    gs1Gtin?: string
  }) {
    const { tenantId, userId, ctx } = getContext()

    // Generate unique barcode
    const barcode = await barcodeRepository.generateBarcode(tenantId, data.labelType)

    // Build GS1 data if applicable
    let gs1Gtin = data.gs1Gtin
    let gs1Batch = data.batchNumber
    let gs1Expiry: string | undefined
    if (data.labelType === 'GS1' && data.expiryDate) {
      const d = new Date(data.expiryDate)
      gs1Expiry = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    }

    // Build QR data
    const qrData = JSON.stringify({
      bc: barcode, lt: data.labelType,
      p: data.productSku, b: data.batchNumber, l: data.lotNumber,
      q: data.quantity, u: data.uomCode,
      exp: data.expiryDate?.split('T')[0],
      w: data.binCode,
    })

    const label = await barcodeRepository.create({
      tenantId, barcode, barcodeType: data.labelType === 'QR' ? 'QR' : data.labelType === 'GS1' ? 'GS1_128' : 'CODE128',
      labelType: data.labelType,
      productId: data.productId, productSku: data.productSku, productName: data.productName,
      batchId: data.batchId, batchNumber: data.batchNumber, lotId: data.lotId, lotNumber: data.lotNumber,
      warehouseId: data.warehouseId, binId: data.binId, binCode: data.binCode,
      grnId: data.grnId, grnNumber: data.grnNumber,
      quantity: data.quantity, uomCode: data.uomCode,
      manufactureDate: data.manufactureDate, expiryDate: data.expiryDate,
      gs1Gtin, gs1Batch, gs1Expiry, qrData,
      isPrinted: false, status: 'ACTIVE',
    })

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'BARCODE_CREATED', entityType: 'BarcodeLabel', entityId: String(label!['id']), entityCode: barcode, after: data,
    })

    return label
  },

  async listBarcodes(params: { page?: number; pageSize?: number; labelType?: string; productId?: string } = {}) {
    const { tenantId } = getContext()
    return barcodeRepository.list(tenantId, params)
  },

  async printBarcode(id: string) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await barcodeRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('BarcodeLabel', id)
    const updated = await barcodeRepository.markPrinted(tenantId, id)
    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'BARCODE_PRINTED', entityType: 'BarcodeLabel', entityId: id, entityCode: String(existing['barcode']),
    })
    return updated
  },

  /** Scanner API: Scan a barcode and return the associated entity */
  async scanBarcode(data: { barcode: string; scanType: string; scanContext?: string; deviceId?: string; location?: string }) {
    const { tenantId, userId, ctx } = getContext()

    const label = await barcodeRepository.findByBarcode(tenantId, data.barcode)
    if (!label) {
      // Log failed scan
      await scanLogRepository.create({
        tenantId, barcode: data.barcode, scanType: data.scanType, scanContext: data.scanContext,
        scannedBy: userId, scannedByName: ctx.userEmail, deviceId: data.deviceId, location: data.location,
        result: 'NOT_FOUND',
      })
      throw new NotFoundError('Barcode', data.barcode)
    }

    // Mark as scanned
    await barcodeRepository.markScanned(tenantId, String(label['id']))

    // Log scan
    await scanLogRepository.create({
      tenantId, barcode: data.barcode, scanType: data.scanType, scanContext: data.scanContext,
      scannedBy: userId, scannedByName: ctx.userEmail, deviceId: data.deviceId, location: data.location,
      result: 'SUCCESS', metadata: { labelType: label['label_type'], productId: label['product_id'] },
    })

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'BARCODE_SCANNED', entityType: 'BarcodeLabel', entityId: String(label['id']), entityCode: data.barcode,
    })

    return label
  },

  async listScanLogs(params: { page?: number; pageSize?: number } = {}) {
    const { tenantId } = getContext()
    return scanLogRepository.list(tenantId, params)
  },
}

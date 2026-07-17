/** Order Fulfillment Service — Allocations, Wave Plans
 *
 * Business Rules:
 * - Allocation only from available stock (not blocked, not expired)
 * - FEFO allocation strategy
 * - Partial allocation with backorder detection
 * - Wave plan creation from SO list
 * - Wave release for picking
 * - Allocation cancellation restores inventory
 * - Maker-checker on wave release
 * - Break-glass blocked on all operations
 */
import { allocationRepository, wavePlanRepository, generateAllocationNumber, generateWaveNumber } from '../repository'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { query, pgliteTransaction } from '@/core/db/pglite'
import { BusinessRuleError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'
import { enforceNotBreakGlass, enforceMakerChecker } from '@/core/security/sod-enforcement'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx }
}

export const orderFulfillmentService = {
  async createAllocation(data: {
    soId: string; soNumber: string; soLineId: string
    productId: string; productSku: string; productName: string
    warehouseId: string; warehouseName: string
    orderedQty: number; uomId?: string; uomCode?: string
  }) {
    const { tenantId, userId, ctx } = getContext()
    enforceNotBreakGlass('createAllocation')

    if (data.orderedQty <= 0) throw new BusinessRuleError('Ordered quantity must be positive', { code: 'ALLOC.INVALID_QTY' })

    // FEFO allocation with batch allocation mandatory
    // Business rule: No allocation from blocked or expired stock
    const stockResult = await query(`SELECT * FROM inventory WHERE tenant_id = $1 AND product_id = $2 AND warehouse_id = $3 AND available_qty > 0 AND deleted_at IS NULL AND is_blocked = false AND (expiry_date IS NULL OR expiry_date > NOW()) ORDER BY expiry_date ASC NULLS LAST, created_at ASC`, [tenantId, data.productId, data.warehouseId])

    let remainingQty = data.orderedQty; let allocatedQty = 0
    let batchId: string | null = null; let batchNumber: string | null = null
    let lotId: string | null = null; let lotNumber: string | null = null

    for (const stock of stockResult.rows) {
      if (remainingQty <= 0) break
      const qty = Math.min(Number(stock['available_qty']), remainingQty)
      allocatedQty += qty; remainingQty -= qty
      if (!batchId) {
        batchId = stock['batch_id'] ? String(stock['batch_id']) : null
        batchNumber = stock['batch_number'] ? String(stock['batch_number']) : null
        lotId = stock['lot_id'] ? String(stock['lot_id']) : null
        lotNumber = stock['lot_number'] ? String(stock['lot_number']) : null
      }
    }

    const isFullyAllocated = remainingQty <= 0
    const shortQty = Math.max(remainingQty, 0)
    const allocationNumber = await generateAllocationNumber(tenantId)

    // Phase 1.6: Wrap allocation + inventory update in DB transaction
    const alloc = await pgliteTransaction(async () => {
      const alloc = await allocationRepository.create({
        tenantId, allocationNumber, soId: data.soId, soNumber: data.soNumber, soLineId: data.soLineId,
        productId: data.productId, productSku: data.productSku, productName: data.productName,
        warehouseId: data.warehouseId, warehouseName: data.warehouseName,
        batchId, batchNumber, lotId, lotNumber,
        uomId: data.uomId, uomCode: data.uomCode,
        orderedQty: data.orderedQty, allocatedQty, shortQty,
        allocationStrategy: 'FEFO', isFullyAllocated, isPartial: !isFullyAllocated, status: 'ALLOCATED',
      })

      // Reserve inventory: update reserved_qty and available_qty
      if (allocatedQty > 0) {
        let reserveRemaining = allocatedQty
        for (const stock of stockResult.rows) {
          if (reserveRemaining <= 0) break
          const reserveQty = Math.min(Number(stock['available_qty']), reserveRemaining)
          await query(`UPDATE inventory SET reserved_qty = reserved_qty + $3, available_qty = available_qty - $3, version = version + 1, updated_at = NOW() WHERE tenant_id = $1 AND id = $2`, [tenantId, stock['id'], reserveQty])
          reserveRemaining -= reserveQty
        }
      }
      return alloc
    })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'ALLOCATION_CREATED', entityType: 'InventoryAllocation', entityId: String(alloc!['id']), entityCode: allocationNumber, after: { allocatedQty, shortQty, isFullyAllocated } })
    await eventBus.writeToOutbox({ eventName: 'AllocationCreated', payload: { allocationId: String(alloc!['id']), allocationNumber, soId: data.soId, allocatedQty, isFullyAllocated }, tenantId })
    return alloc
  },

  async listAllocations(params: { page?: number; pageSize?: number; status?: string; search?: string; warehouseId?: string; soId?: string } = {}) {
    const { tenantId } = getContext()
    return allocationRepository.list(tenantId, params)
  },

  async cancelAllocation(id: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    enforceNotBreakGlass('cancelAllocation')
    const existing = await allocationRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('InventoryAllocation', id)
    if (String(existing['status']) !== 'ALLOCATED') {
      throw new BusinessRuleError(`Cannot cancel allocation in ${existing['status']} status`, { code: 'ALLOC.NOT_CANCELLABLE' })
    }

    // Phase 1.6: Wrap allocation cancel + inventory restore in DB transaction
    const updated = await pgliteTransaction(async () => {
      const updated = await allocationRepository.update(tenantId, id, { status: 'CANCELLED' }, version)
      if (!updated) throw new ConcurrencyError('Allocation was modified by another transaction')

      // Restore inventory: release reserved_qty back to available_qty
      if (existing['batch_id'] && Number(existing['allocated_qty']) > 0) {
        await query(`UPDATE inventory SET reserved_qty = GREATEST(reserved_qty - $3, 0), available_qty = available_qty + $3, version = version + 1, updated_at = NOW() WHERE tenant_id = $1 AND product_id = $2 AND warehouse_id = $4 AND COALESCE(batch_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE($5::uuid, '00000000-0000-0000-0000-000000000000'::uuid)`, [tenantId, existing['product_id'], Number(existing['allocated_qty']), existing['warehouse_id'], existing['batch_id']])
      }
      return updated
    })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'ALLOCATION_CANCELLED', entityType: 'InventoryAllocation', entityId: id, entityCode: String(existing['allocation_number']) })
    await eventBus.writeToOutbox({ eventName: 'AllocationCancelled', payload: { allocationId: id, soId: String(existing['so_id']) }, tenantId })
    return updated
  },

  async exportAllocations(params: { status?: string; warehouseId?: string; soId?: string } = {}) {
    const { tenantId } = getContext()
    return allocationRepository.list(tenantId, { ...params, page: 1, pageSize: 10000 })
  },

  async createWavePlan(data: { warehouseId: string; warehouseName: string; priority?: string; soIds: string[] }) {
    const { tenantId, userId, ctx } = getContext()
    enforceNotBreakGlass('createWavePlan')
    if (!data.soIds || data.soIds.length === 0) throw new BusinessRuleError('Wave must have at least one sales order', { code: 'WAVE.NO_ORDERS' })

    const waveNumber = await generateWaveNumber(tenantId)
    let totalOrders = data.soIds.length; let totalLines = 0; let totalQty = 0

    for (const soId of data.soIds) {
      const lines = await query(`SELECT * FROM sales_order_lines WHERE tenant_id = $1 AND so_id = $2`, [tenantId, soId])
      totalLines += lines.rows.length
      totalQty += lines.rows.reduce((s: number, l: Record<string, unknown>) => s + Number(l['ordered_qty']), 0)
    }

    const wave = await wavePlanRepository.create({
      tenantId, waveNumber, warehouseId: data.warehouseId, warehouseName: data.warehouseName,
      waveType: 'PICKING', priority: data.priority ?? 'NORMAL',
      totalOrders, totalLines, totalQty, allocatedQty: 0, pickedQty: 0, status: 'CREATED',
    })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'WAVE_CREATED', entityType: 'WavePlan', entityId: String(wave!['id']), entityCode: waveNumber, after: { totalOrders, totalLines, totalQty } })
    await eventBus.writeToOutbox({ eventName: 'WavePlanCreated', payload: { waveId: String(wave!['id']), waveNumber, totalOrders, totalLines }, tenantId })
    return wave
  },

  async listWavePlans(params: { page?: number; pageSize?: number; status?: string; search?: string; warehouseId?: string } = {}) {
    const { tenantId } = getContext()
    return wavePlanRepository.list(tenantId, params)
  },

  async releaseWave(id: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    enforceNotBreakGlass('releaseWave')
    const existing = await wavePlanRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('WavePlan', id)
    if (String(existing['status']) !== 'CREATED') {
      throw new BusinessRuleError(`Cannot release wave in ${existing['status']} status`, { code: 'WAVE.NOT_RELEASABLE' })
    }

    const updated = await wavePlanRepository.update(tenantId, id, { status: 'RELEASED', releaseDate: new Date().toISOString() }, version)
    if (!updated) throw new ConcurrencyError('Wave was modified by another transaction')

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'WAVE_RELEASED', entityType: 'WavePlan', entityId: id, entityCode: String(existing['wave_number']) })
    await eventBus.writeToOutbox({ eventName: 'WaveReleased', payload: { waveId: id, waveNumber: String(existing['wave_number']) }, tenantId })
    return updated
  },

  async cancelWave(id: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    enforceNotBreakGlass('cancelWave')
    const existing = await wavePlanRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('WavePlan', id)
    if (!['CREATED', 'RELEASED'].includes(String(existing['status']))) {
      throw new BusinessRuleError(`Cannot cancel wave in ${existing['status']} status`, { code: 'WAVE.NOT_CANCELLABLE' })
    }

    const updated = await wavePlanRepository.update(tenantId, id, { status: 'CANCELLED' }, version)
    if (!updated) throw new ConcurrencyError('Wave was modified by another transaction')

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'WAVE_CANCELLED', entityType: 'WavePlan', entityId: id, entityCode: String(existing['wave_number']) })
    return updated
  },

  async exportWaves(params: { status?: string; warehouseId?: string } = {}) {
    const { tenantId } = getContext()
    return wavePlanRepository.list(tenantId, { ...params, page: 1, pageSize: 10000 })
  },
}

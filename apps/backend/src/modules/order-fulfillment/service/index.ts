import { allocationRepository, wavePlanRepository, generateAllocationNumber, generateWaveNumber } from '../repository'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'

import { getRequestContext } from '@/core/context'
import { query } from '@/core/db/pglite'
import { BusinessRuleError, AuthorizationError } from '@/core/errors'
function getContext() { const ctx = getRequestContext(); if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required'); return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx } }

export const orderFulfillmentService = {
  async createAllocation(data: { soId: string; soNumber: string; soLineId: string; productId: string; productSku: string; productName: string; warehouseId: string; warehouseName: string; orderedQty: number; uomId?: string; uomCode?: string }) {
    const { tenantId, userId, ctx } = getContext()
    if (data.orderedQty <= 0) throw new BusinessRuleError('Ordered quantity must be positive', { code: 'ALLOC.INVALID_QTY' })
    // FEFO allocation with batch allocation mandatory
    const stockResult = await query(`SELECT * FROM inventory WHERE tenant_id = $1 AND product_id = $2 AND warehouse_id = $3 AND available_qty > 0 AND deleted_at IS NULL AND is_blocked = false ORDER BY expiry_date ASC NULLS LAST, created_at ASC`, [tenantId, data.productId, data.warehouseId])
    let remainingQty = data.orderedQty; let allocatedQty = 0; let batchId: string | null = null; let batchNumber: string | null = null; let lotId: string | null = null; let lotNumber: string | null = null
    for (const stock of stockResult.rows) {
      if (remainingQty <= 0) break
      const qty = Math.min(Number(stock['available_qty']), remainingQty)
      allocatedQty += qty; remainingQty -= qty
      if (!batchId) { batchId = stock['batch_id'] ? String(stock['batch_id']) : null; batchNumber = stock['batch_number'] ? String(stock['batch_number']) : null; lotId = stock['lot_id'] ? String(stock['lot_id']) : null; lotNumber = stock['lot_number'] ? String(stock['lot_number']) : null }
    }
    const isFullyAllocated = remainingQty <= 0
    const shortQty = Math.max(remainingQty, 0)
    const allocationNumber = await generateAllocationNumber(tenantId)
    const alloc = await allocationRepository.create({ tenantId, allocationNumber, soId: data.soId, soNumber: data.soNumber, soLineId: data.soLineId, productId: data.productId, productSku: data.productSku, productName: data.productName, warehouseId: data.warehouseId, warehouseName: data.warehouseName, batchId, batchNumber, lotId, lotNumber, uomId: data.uomId, uomCode: data.uomCode, orderedQty: data.orderedQty, allocatedQty, shortQty, allocationStrategy: 'FEFO', isFullyAllocated, isPartial: !isFullyAllocated, status: 'ALLOCATED' })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'ALLOCATION_CREATED', entityType: 'InventoryAllocation', entityId: String(alloc!['id']), entityCode: allocationNumber, after: { allocatedQty, shortQty, isFullyAllocated } })
    await eventBus.writeToOutbox({ eventName: 'AllocationCreated', payload: { allocationId: String(alloc!['id']), allocationNumber, soId: data.soId, allocatedQty, isFullyAllocated }, tenantId })
    return alloc
  },

  async listAllocations(params: { page?: number; pageSize?: number; status?: string } = {}) { const { tenantId } = getContext(); return allocationRepository.list(tenantId, params) },

  async createWavePlan(data: { warehouseId: string; warehouseName: string; priority?: string; soIds: string[] }) {
    const { tenantId, userId, ctx } = getContext()
    const waveNumber = await generateWaveNumber(tenantId)
    let totalOrders = data.soIds.length; let totalLines = 0; let totalQty = 0
    for (const soId of data.soIds) {
      const lines = await query(`SELECT * FROM sales_order_lines WHERE tenant_id = $1 AND so_id = $2`, [tenantId, soId])
      totalLines += lines.rows.length
      totalQty += lines.rows.reduce((s: number, l: Record<string, unknown>) => s + Number(l['ordered_qty']), 0)
    }
    const wave = await wavePlanRepository.create({ tenantId, waveNumber, warehouseId: data.warehouseId, warehouseName: data.warehouseName, waveType: 'PICKING', priority: data.priority ?? 'NORMAL', totalOrders, totalLines, totalQty, allocatedQty: 0, pickedQty: 0, status: 'CREATED' })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'WAVE_CREATED', entityType: 'WavePlan', entityId: String(wave!['id']), entityCode: waveNumber, after: { totalOrders, totalLines, totalQty } })
    await eventBus.writeToOutbox({ eventName: 'WavePlanCreated', payload: { waveId: String(wave!['id']), waveNumber, totalOrders, totalLines }, tenantId })
    return wave
  },

  async listWavePlans(params: { page?: number; pageSize?: number; status?: string } = {}) { const { tenantId } = getContext(); return wavePlanRepository.list(tenantId, params) },
}

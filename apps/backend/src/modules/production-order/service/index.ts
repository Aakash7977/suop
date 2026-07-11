/** Production Order Service — Business logic, material issue, yield, scrap, rework, analytics */
import '@/modules/production-order/workflow'
import {
  productionOrderRepository, productionOrderOperationRepository,
  materialIssueRepository, materialIssueLineRepository,
  productionConfirmationRepository, scrapRecordRepository, reworkRecordRepository,
} from '../repository'
import { workflowRegistry } from '@/core/workflow'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { query } from '@/core/db/pglite'
import { BusinessRuleError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx }
}

export const productionOrderService = {
  async create(data: {
    productId: string; productSku?: string; productName?: string
    plannedQty: number; uomId: string; uomCode: string
    recipeId?: string; recipeCode?: string; bomId?: string; bomCode?: string
    routingId?: string; routingCode?: string
    workCenterId?: string; workCenterCode?: string
    productionLineId?: string; machineId?: string
    plantId?: string; plantName?: string
    plannedStart?: string; plannedEnd?: string
    plannedCost?: number; priority?: string; remarks?: string
  }) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: quantity must be positive
    if (data.plannedQty <= 0) {
      throw new BusinessRuleError('Planned quantity must be positive', { code: 'MPO.INVALID_QTY' })
    }

    // Business rule: No production without approved BOM (if BOM specified, it must be APPROVED)
    if (data.bomId) {
      const bomResult = await query(`SELECT status FROM bom_headers WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, data.bomId])
      if (bomResult.rows.length === 0) {
        throw new BusinessRuleError('BOM not found', { code: 'MPO.BOM_NOT_FOUND' })
      }
      const bomStatus = String(bomResult.rows[0]!['status'])
      if (bomStatus !== 'APPROVED') {
        throw new BusinessRuleError(`BOM must be APPROVED (current: ${bomStatus})`, { code: 'MPO.BOM_NOT_APPROVED' })
      }
    }

    // Business rule: No production without approved recipe (if recipe specified)
    if (data.recipeId) {
      const recipeResult = await query(`SELECT status FROM recipes WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, data.recipeId])
      if (recipeResult.rows.length === 0) {
        throw new BusinessRuleError('Recipe not found', { code: 'MPO.RECIPE_NOT_FOUND' })
      }
      const recipeStatus = String(recipeResult.rows[0]!['status'])
      if (recipeStatus !== 'APPROVED') {
        throw new BusinessRuleError(`Recipe must be APPROVED (current: ${recipeStatus})`, { code: 'MPO.RECIPE_NOT_APPROVED' })
      }
    }

    // Business rule: Machine capacity validation
    if (data.machineId) {
      const machineResult = await query(`SELECT max_capacity, current_status FROM machines WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, data.machineId])
      if (machineResult.rows.length === 0) {
        throw new BusinessRuleError('Machine not found', { code: 'MPO.MACHINE_NOT_FOUND' })
      }
      const machineStatus = String(machineResult.rows[0]!['current_status'])
      if (machineStatus === 'BREAKDOWN') {
        throw new BusinessRuleError('Machine is in BREAKDOWN status', { code: 'MPO.MACHINE_BREAKDOWN' })
      }
    }

    const poNumber = await productionOrderRepository.generatePoNumber(tenantId)

    const po = await productionOrderRepository.create({
      tenantId, poNumber, poType: 'STANDARD',
      productId: data.productId, productSku: data.productSku, productName: data.productName,
      plannedQty: data.plannedQty, uomId: data.uomId, uomCode: data.uomCode,
      recipeId: data.recipeId, recipeCode: data.recipeCode,
      bomId: data.bomId, bomCode: data.bomCode,
      routingId: data.routingId, routingCode: data.routingCode,
      workCenterId: data.workCenterId, workCenterCode: data.workCenterCode,
      productionLineId: data.productionLineId, machineId: data.machineId,
      plantId: data.plantId, plantName: data.plantName,
      plannedStart: data.plannedStart, plannedEnd: data.plannedEnd,
      plannedCost: data.plannedCost ?? 0, priority: data.priority ?? 'NORMAL',
      status: 'DRAFT', remarks: data.remarks,
    })

    // Create operations from routing if provided
    if (data.routingId) {
      const routingOpsResult = await query(`SELECT * FROM routing_operations WHERE tenant_id = $1 AND routing_id = $2 ORDER BY operation_no`, [tenantId, data.routingId])
      for (const op of routingOpsResult.rows) {
        await productionOrderOperationRepository.create({
          tenantId, productionOrderId: po!['id'],
          operationNo: op['operation_no'], operationName: op['operation_name'],
          operationDescription: op['operation_description'],
          routingOperationId: op['id'],
          workCenterId: op['work_center_id'], workCenterCode: op['work_center_code'],
          machineId: op['machine_id'], machineCode: op['machine_code'],
          setupTimeMinutes: op['setup_time_minutes'], runTimeMinutes: op['run_time_minutes'],
          status: 'PENDING',
        })
      }
    }

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'ProductionOrder', entityId: String(po!['id']), entityCode: poNumber, after: data })
    await eventBus.writeToOutbox({ eventName: 'ProductionOrderCreated', payload: { poId: String(po!['id']), poNumber, productId: data.productId }, tenantId })

    return po
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const po = await productionOrderRepository.findById(tenantId, id)
    if (!po) throw new NotFoundError('ProductionOrder', id)
    const [operations, confirmations] = await Promise.all([
      productionOrderOperationRepository.listForOrder(tenantId, id),
      productionConfirmationRepository.list(tenantId, { productionOrderId: id, pageSize: 100 }),
    ])
    return { ...po, operations: operations, confirmations: confirmations.rows }
  },

  async list(params: { page?: number; pageSize?: number; status?: string; productId?: string; search?: string } = {}) {
    const { tenantId } = getContext()
    return productionOrderRepository.list(tenantId, params)
  },

  async transition(id: string, targetStatus: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await productionOrderRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('ProductionOrder', id)

    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('ProductionOrderLifecycle')
    const check = await machine.canTransition({ id, status: String(existing['status']), version: Number(existing['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'MPO.TRANSITION_DENIED' })

    const updateData: Record<string, unknown> = { status: targetStatus }
    if (targetStatus === 'IN_PROGRESS') updateData.actualStart = new Date().toISOString()
    if (targetStatus === 'COMPLETED') updateData.actualEnd = new Date().toISOString()

    const updated = await productionOrderRepository.update(tenantId, id, updateData, version, userId)
    if (!updated) throw new ConcurrencyError('Production order was modified by another transaction')

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'TRANSITION', entityType: 'ProductionOrder', entityId: id, entityCode: String(existing['po_number']), before: { status: existing['status'] }, after: { status: targetStatus } })

    const eventMap: Record<string, string> = {
      RELEASED: 'ProductionOrderReleased', IN_PROGRESS: 'ProductionStarted',
      COMPLETED: 'ProductionCompleted', FGQC_PENDING: 'ProductionFGQCPending',
      RELEASED_TO_INVENTORY: 'ProductionReleasedToInventory', CLOSED: 'ProductionOrderClosed',
    }
    if (eventMap[targetStatus]) {
      await eventBus.writeToOutbox({ eventName: eventMap[targetStatus], payload: { poId: id, poNumber: String(existing['po_number']), status: targetStatus }, tenantId })
    }

    return updated
  },

  /** Material Issue from warehouse — FIFO/FEFO consumption, real inventory deduction */
  async issueMaterials(id: string, data: { warehouseId: string; warehouseName: string; lines: Array<Record<string, unknown>> }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await productionOrderRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('ProductionOrder', id)

    // Business rule: No material issue without inventory
    for (const line of data.lines) {
      const productId = String(line['productId'])
      const requiredQty = Number(line['issuedQty'])
      const invResult = await query<{ total: string }>(`SELECT COALESCE(SUM(available_qty), 0) as total FROM inventory WHERE tenant_id = $1 AND product_id = $2 AND warehouse_id = $3 AND deleted_at IS NULL AND is_blocked = false`, [tenantId, productId, data.warehouseId])
      const availableQty = Number(invResult.rows[0]!.total)
      if (availableQty < requiredQty) {
        throw new BusinessRuleError(`Insufficient stock for product ${line['productSku']}. Available: ${availableQty}, Required: ${requiredQty}`, { code: 'MPO.INSUFFICIENT_STOCK' })
      }
    }

    const issueNumber = await materialIssueRepository.generateIssueNumber(tenantId)
    const issueId = await materialIssueRepository.create({
      tenantId, issueNumber, productionOrderId: id, productionOrderNumber: String(existing['po_number']),
      warehouseId: data.warehouseId, warehouseName: data.warehouseName,
      issuedBy: userId, issuedByName: ctx.userEmail, status: 'COMPLETED',
    })

    // Create lines and deduct inventory
    let lineNo = 1
    for (const line of data.lines) {
      const plannedQty = Number(line['plannedQty'] ?? 0)
      const issuedQty = Number(line['issuedQty'])
      const varianceQty = issuedQty - plannedQty
      const variancePercent = plannedQty > 0 ? (varianceQty / plannedQty) * 100 : 0

      // Get stock using FEFO (default) or FIFO
      const strategy = String(line['consumptionStrategy'] ?? 'FEFO')
      const stockResult = strategy === 'FIFO'
        ? await query(`SELECT * FROM inventory WHERE tenant_id = $1 AND product_id = $2 AND warehouse_id = $3 AND available_qty > 0 AND deleted_at IS NULL AND is_blocked = false ORDER BY created_at ASC`, [tenantId, String(line['productId']), data.warehouseId])
        : await query(`SELECT * FROM inventory WHERE tenant_id = $1 AND product_id = $2 AND warehouse_id = $3 AND available_qty > 0 AND deleted_at IS NULL AND is_blocked = false ORDER BY expiry_date ASC NULLS LAST, created_at ASC`, [tenantId, String(line['productId']), data.warehouseId])

      let remainingQty = issuedQty
      let lineTotal = 0
      for (const stock of stockResult.rows) {
        if (remainingQty <= 0) break
        const issueFromStock = Math.min(Number(stock['available_qty']), remainingQty)
        const unitCost = Number(stock['unit_cost'])
        lineTotal += issueFromStock * unitCost

        await materialIssueLineRepository.create({
          tenantId, issueId, lineNo,
          productId: line['productId'], productSku: line['productSku'], productName: line['productName'],
          uomId: line['uomId'], uomCode: line['uomCode'],
          plannedQty, issuedQty: issueFromStock, varianceQty: issueFromStock - plannedQty, variancePercent,
          batchId: stock['batch_id'], batchNumber: stock['batch_number'],
          lotId: stock['lot_id'], lotNumber: stock['lot_number'],
          consumptionStrategy: strategy,
          unitCost, lineTotal: issueFromStock * unitCost,
        })

        // Deduct inventory
        await query(`UPDATE inventory SET quantity = quantity - $3, available_qty = available_qty - $3, total_value = total_value - ($3 * unit_cost), version = version + 1, updated_at = NOW(), last_movement_at = NOW(), last_movement_type = 'PRODUCTION_ISSUE' WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, stock['id'], issueFromStock])

        remainingQty -= issueFromStock
        lineNo++
      }
    }

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'MATERIAL_ISSUED', entityType: 'ProductionOrder', entityId: id, entityCode: String(existing['po_number']), after: { issueNumber, lines: data.lines.length } })
    await eventBus.writeToOutbox({ eventName: 'MaterialsIssued', payload: { poId: id, issueNumber }, tenantId })

    return { issueId, issueNumber }
  },

  /** Production Confirmation — record actual production, yield, scrap */
  async confirmProduction(id: string, data: { confirmedQty: number; rejectedQty?: number; scrapQty?: number; reworkQty?: number; uomId: string; uomCode: string; operationId?: string; shiftId?: string; machineId?: string; machineCode?: string; confirmationType?: string; remarks?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await productionOrderRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('ProductionOrder', id)

    if (data.confirmedQty <= 0) throw new BusinessRuleError('Confirmed quantity must be positive', { code: 'MPO.INVALID_QTY' })

    const confirmationNumber = await productionConfirmationRepository.generateConfirmationNumber(tenantId)
    const confirmationId = await productionConfirmationRepository.create({
      tenantId, confirmationNumber, productionOrderId: id, productionOrderNumber: String(existing['po_number']),
      operationId: data.operationId,
      confirmedQty: data.confirmedQty, rejectedQty: data.rejectedQty ?? 0,
      scrapQty: data.scrapQty ?? 0, reworkQty: data.reworkQty ?? 0,
      uomId: data.uomId, uomCode: data.uomCode,
      operatorId: userId, operatorName: ctx.userEmail,
      shiftId: data.shiftId, machineId: data.machineId, machineCode: data.machineCode,
      confirmationType: data.confirmationType ?? 'PARTIAL', remarks: data.remarks,
    })

    // Update production order totals
    const newProduced = Number(existing['produced_qty']) + data.confirmedQty
    const newRejected = Number(existing['rejected_qty']) + (data.rejectedQty ?? 0)
    const newScrap = Number(existing['scrap_qty']) + (data.scrapQty ?? 0)
    const plannedQty = Number(existing['planned_qty'])
    const yieldPercent = plannedQty > 0 ? (newProduced / plannedQty) * 100 : 0
    const wastagePercent = plannedQty > 0 ? ((newRejected + newScrap) / plannedQty) * 100 : 0

    await productionOrderRepository.update(tenantId, id, {
      producedQty: newProduced, rejectedQty: newRejected, scrapQty: newScrap,
      yieldPercent: Math.round(yieldPercent * 100) / 100,
      wastagePercent: Math.round(wastagePercent * 100) / 100,
    }, Number(existing['version']), userId)

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'PRODUCTION_CONFIRMED', entityType: 'ProductionOrder', entityId: id, entityCode: String(existing['po_number']), after: { confirmationNumber, confirmedQty: data.confirmedQty, yieldPercent } })
    await eventBus.writeToOutbox({ eventName: 'ProductionConfirmed', payload: { poId: id, confirmationNumber, confirmedQty: data.confirmedQty, yieldPercent }, tenantId })

    return { confirmationId, confirmationNumber, yieldPercent }
  },

  async recordScrap(id: string, data: { scrapQty: number; scrapReason: string; scrapType?: string; disposition?: string; productId?: string; productSku?: string; uomId?: string; uomCode?: string; operationId?: string; remarks?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await productionOrderRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('ProductionOrder', id)
    if (data.scrapQty <= 0) throw new BusinessRuleError('Scrap quantity must be positive', { code: 'MPO.INVALID_SCRAP_QTY' })

    const scrapNumber = await scrapRecordRepository.generateScrapNumber(tenantId)
    const scrapId = await scrapRecordRepository.create({
      tenantId, scrapNumber, productionOrderId: id, productionOrderNumber: String(existing['po_number']),
      operationId: data.operationId, productId: data.productId ?? existing['product_id'], productSku: data.productSku ?? existing['product_sku'],
      scrapQty: data.scrapQty, uomId: data.uomId ?? existing['uom_id'], uomCode: data.uomCode ?? existing['uom_code'],
      scrapReason: data.scrapReason, scrapType: data.scrapType, disposition: data.disposition ?? 'DISPOSE',
      recordedBy: userId, recordedByName: ctx.userEmail, remarks: data.remarks,
    })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'SCRAP_RECORDED', entityType: 'ProductionOrder', entityId: id, entityCode: String(existing['po_number']), after: { scrapNumber, scrapQty: data.scrapQty } })

    return { scrapId, scrapNumber }
  },

  async recordRework(id: string, data: { reworkQty: number; reworkReason: string; reworkType?: string; reworkOperationId?: string; reworkCost?: number; productId?: string; productSku?: string; uomId?: string; uomCode?: string; operationId?: string; remarks?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await productionOrderRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('ProductionOrder', id)
    if (data.reworkQty <= 0) throw new BusinessRuleError('Rework quantity must be positive', { code: 'MPO.INVALID_REWORK_QTY' })

    const reworkNumber = await reworkRecordRepository.generateReworkNumber(tenantId)
    const reworkId = await reworkRecordRepository.create({
      tenantId, reworkNumber, productionOrderId: id, productionOrderNumber: String(existing['po_number']),
      operationId: data.operationId, productId: data.productId ?? existing['product_id'], productSku: data.productSku ?? existing['product_sku'],
      reworkQty: data.reworkQty, uomId: data.uomId ?? existing['uom_id'], uomCode: data.uomCode ?? existing['uom_code'],
      reworkReason: data.reworkReason, reworkType: data.reworkType,
      reworkOperationId: data.reworkOperationId, reworkCost: data.reworkCost ?? 0,
      status: 'PENDING', recordedBy: userId, recordedByName: ctx.userEmail, remarks: data.remarks,
    })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'REWORK_RECORDED', entityType: 'ProductionOrder', entityId: id, entityCode: String(existing['po_number']), after: { reworkNumber, reworkQty: data.reworkQty } })

    return { reworkId, reworkNumber }
  },

  // ═══ Analytics ════════════════════════════════════════════════════════════

  async getProductionAnalytics(poId: string) {
    const { tenantId } = getContext()
    const po = await productionOrderRepository.findById(tenantId, poId)
    if (!po) throw new NotFoundError('ProductionOrder', poId)

    const plannedQty = Number(po['planned_qty'])
    const producedQty = Number(po['produced_qty'])
    const rejectedQty = Number(po['rejected_qty'])
    const scrapQty = Number(po['scrap_qty'])
    const goodQty = producedQty - rejectedQty

    const yieldPercent = plannedQty > 0 ? (producedQty / plannedQty) * 100 : 0
    const qualityPercent = producedQty > 0 ? (goodQty / producedQty) * 100 : 0
    const scrapPercent = plannedQty > 0 ? (scrapQty / plannedQty) * 100 : 0
    const plannedCost = Number(po['planned_cost'])
    const actualCost = Number(po['actual_cost'])
    const costVariance = plannedCost - actualCost

    // Material variance
    const materialIssues = await materialIssueRepository.list(tenantId, { productionOrderId: poId, pageSize: 1000 })
    let plannedMaterialCost = 0
    let actualMaterialCost = 0
    for (const issue of materialIssues.rows) {
      const lines = await materialIssueLineRepository.listForIssue(tenantId, String(issue['id']))
      for (const line of lines) {
        actualMaterialCost += Number(line['line_total'])
        plannedMaterialCost += Number(line['planned_qty']) * Number(line['unit_cost'])
      }
    }

    return {
      poId, poNumber: String(po['po_number']),
      plannedQty, producedQty, goodQty, rejectedQty, scrapQty,
      yieldPercent: Math.round(yieldPercent * 100) / 100,
      qualityPercent: Math.round(qualityPercent * 100) / 100,
      scrapPercent: Math.round(scrapPercent * 100) / 100,
      plannedCost, actualCost, costVariance: Math.round(costVariance * 100) / 100,
      materialVariance: { planned: plannedMaterialCost, actual: actualMaterialCost, variance: Math.round((plannedMaterialCost - actualMaterialCost) * 100) / 100 },
    }
  },
}

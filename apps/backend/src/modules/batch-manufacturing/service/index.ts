/** Batch Manufacturing Service — Batch creation, split, merge, genealogy, traceability engine */
import '@/modules/batch-manufacturing/workflow'
import { productionBatchRepository, batchGenealogyRepository, batchSplitRepository, batchMergeRepository, traceabilityLogRepository } from '../repository'
import { workflowRegistry } from '@/core/workflow'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { BusinessRuleError, NotFoundError, AuthorizationError } from '@/core/errors'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx }
}

export const batchManufacturingService = {
  async createBatch(data: {
    productionOrderId?: string; productionOrderNumber?: string
    productId: string; productSku?: string; productName?: string
    parentBatchId?: string; parentBatchNumber?: string
    quantity: number; uomId: string; uomCode: string
    expiryDate?: string; shelfLifeDays?: number
    warehouseId?: string; warehouseName?: string
    remarks?: string
  }) {
    const { tenantId, userId, ctx } = getContext()

    if (data.quantity <= 0) throw new BusinessRuleError('Batch quantity must be positive', { code: 'BATCH.INVALID_QTY' })

    const batchNumber = await productionBatchRepository.generateBatchNumber(tenantId)
    const batch = await productionBatchRepository.create({
      tenantId, batchNumber,
      productionOrderId: data.productionOrderId, productionOrderNumber: data.productionOrderNumber,
      productId: data.productId, productSku: data.productSku, productName: data.productName,
      parentBatchId: data.parentBatchId, parentBatchNumber: data.parentBatchNumber,
      batchType: data.parentBatchId ? 'CHILD' : 'PRODUCTION',
      quantity: data.quantity, uomId: data.uomId, uomCode: data.uomCode,
      expiryDate: data.expiryDate, shelfLifeDays: data.shelfLifeDays,
      status: 'IN_PRODUCTION',
      warehouseId: data.warehouseId, warehouseName: data.warehouseName,
      remarks: data.remarks,
    })

    // Record genealogy if parent batch exists
    if (data.parentBatchId) {
      await batchGenealogyRepository.create({
        tenantId, childBatchId: String(batch!['id']), childBatchNumber: batchNumber,
        parentBatchId: data.parentBatchId, parentBatchNumber: data.parentBatchNumber,
        parentType: 'PRODUCTION_BATCH',
      })
    }

    // Record immutable traceability log
    await traceabilityLogRepository.create({
      tenantId, traceType: 'BATCH_CREATED', batchId: String(batch!['id']), batchNumber,
      productId: data.productId, productSku: data.productSku,
      direction: 'SELF', description: `Batch ${batchNumber} created`,
    })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'BATCH_CREATED', entityType: 'ProductionBatch', entityId: String(batch!['id']), entityCode: batchNumber, after: data })
    await eventBus.writeToOutbox({ eventName: 'BatchCreated', payload: { batchId: String(batch!['id']), batchNumber, productId: data.productId }, tenantId })

    return batch
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const batch = await productionBatchRepository.findById(tenantId, id)
    if (!batch) throw new NotFoundError('ProductionBatch', id)
    return batch
  },

  async list(params: { page?: number; pageSize?: number; productId?: string; status?: string; search?: string } = {}) {
    const { tenantId } = getContext()
    return productionBatchRepository.list(tenantId, params)
  },

  async transition(id: string, targetStatus: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await productionBatchRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('ProductionBatch', id)

    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('ProductionBatchLifecycle')
    const check = await machine.canTransition({ id, status: String(existing['status']), version: Number(existing['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'BATCH.TRANSITION_DENIED' })

    const updated = await productionBatchRepository.update(tenantId, id, { status: targetStatus }, version)
    if (!updated) throw new BusinessRuleError('Batch was modified by another transaction', { code: 'BATCH.CONCURRENCY' })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'BATCH_TRANSITION', entityType: 'ProductionBatch', entityId: id, entityCode: String(existing['batch_number']), before: { status: existing['status'] }, after: { status: targetStatus } })

    return updated
  },

  /** Batch Split — divide one batch into multiple child batches */
  async splitBatch(id: string, data: { splitReason: string; splits: Array<{ quantity: number; warehouseId?: string; warehouseName?: string }> }) {
    const { tenantId, userId, ctx } = getContext()
    const source = await productionBatchRepository.findById(tenantId, id)
    if (!source) throw new NotFoundError('ProductionBatch', id)

    const sourceQty = Number(source['quantity'])
    const totalSplitQty = data.splits.reduce((sum, s) => sum + s.quantity, 0)

    // Business rule: total split quantity must equal source quantity
    if (Math.abs(totalSplitQty - sourceQty) > 0.001) {
      throw new BusinessRuleError(`Total split quantity (${totalSplitQty}) must equal source quantity (${sourceQty})`, { code: 'BATCH.SPLIT_QTY_MISMATCH' })
    }

    if (data.splits.length < 2) {
      throw new BusinessRuleError('Split must produce at least 2 child batches', { code: 'BATCH.INVALID_SPLIT' })
    }

    const splitNumber = await batchSplitRepository.generateSplitNumber(tenantId)
    const childBatchIds: string[] = []

    for (const split of data.splits) {
      const childBatchNumber = await productionBatchRepository.generateBatchNumber(tenantId)
      const child = await productionBatchRepository.create({
        tenantId, batchNumber: childBatchNumber,
        productionOrderId: source['production_order_id'], productionOrderNumber: source['production_order_number'],
        productId: source['product_id'], productSku: source['product_sku'], productName: source['product_name'],
        parentBatchId: id, parentBatchNumber: source['batch_number'],
        batchType: 'CHILD', quantity: split.quantity, uomId: source['uom_id'], uomCode: source['uom_code'],
        manufactureDate: source['manufacture_date'], expiryDate: source['expiry_date'], shelfLifeDays: source['shelf_life_days'],
        status: 'IN_PRODUCTION', isSplit: false,
        warehouseId: split.warehouseId ?? source['warehouse_id'], warehouseName: split.warehouseName ?? source['warehouse_name'],
      })
      childBatchIds.push(String(child!['id']))

      // Record genealogy (IMMUTABLE)
      await batchGenealogyRepository.create({
        tenantId, childBatchId: String(child!['id']), childBatchNumber,
        parentBatchId: id, parentBatchNumber: String(source['batch_number']),
        parentType: 'PARENT_BATCH', consumedQty: split.quantity, uomCode: String(source['uom_code']),
      })

      // Record traceability
      await traceabilityLogRepository.create({
        tenantId, traceType: 'BATCH_SPLIT', batchId: String(child!['id']), batchNumber: childBatchNumber,
        productId: source['product_id'], productSku: source['product_sku'],
        direction: 'BACKWARD', relatedBatchId: id, relatedBatchNumber: String(source['batch_number']),
        relatedType: 'PARENT_BATCH', quantity: split.quantity, uomCode: String(source['uom_code']),
        description: `Split from parent batch ${source['batch_number']}`,
      })
    }

    // Mark source batch as split
    await productionBatchRepository.update(tenantId, id, { isSplit: true, status: 'ARCHIVED' }, Number(source['version']))

    await batchSplitRepository.create({
      tenantId, splitNumber, sourceBatchId: id, sourceBatchNumber: source['batch_number'],
      splitReason: data.splitReason, totalQty: sourceQty,
      childBatchIds, splitCount: data.splits.length,
      performedBy: userId, performedByName: ctx.userEmail,
    })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'BATCH_SPLIT', entityType: 'ProductionBatch', entityId: id, entityCode: String(source['batch_number']), after: { splitNumber, childCount: data.splits.length } })
    await eventBus.writeToOutbox({ eventName: 'BatchSplit', payload: { sourceBatchId: id, splitNumber, childBatchIds }, tenantId })

    return { splitNumber, childBatchIds }
  },

  /** Batch Merge — combine multiple batches into one */
  async mergeBatches(data: { sourceBatchIds: string[]; mergeReason: string; targetBatchNumber?: string; warehouseId?: string; warehouseName?: string }) {
    const { tenantId, userId, ctx } = getContext()

    if (data.sourceBatchIds.length < 2) {
      throw new BusinessRuleError('Merge requires at least 2 source batches', { code: 'BATCH.INVALID_MERGE' })
    }

    // Load all source batches and validate they have the same product
    const sourceBatches: Array<Record<string, unknown>> = []
    let totalQty = 0
    let productId: string | null = null
    for (const sourceId of data.sourceBatchIds) {
      const batch = await productionBatchRepository.findById(tenantId, sourceId)
      if (!batch) throw new NotFoundError('ProductionBatch', sourceId)
      if (productId === null) productId = String(batch['product_id'])
      else if (String(batch['product_id']) !== productId) {
        throw new BusinessRuleError('All source batches must have the same product', { code: 'BATCH.PRODUCT_MISMATCH' })
      }
      sourceBatches.push(batch)
      totalQty += Number(batch['quantity'])
    }

    // Create target batch
    const firstBatch = sourceBatches[0]!
    const targetBatchNumber = await productionBatchRepository.generateBatchNumber(tenantId)
    const target = await productionBatchRepository.create({
      tenantId, batchNumber: targetBatchNumber,
      productId: firstBatch['product_id'], productSku: firstBatch['product_sku'], productName: firstBatch['product_name'],
      batchType: 'MERGED', quantity: totalQty, uomId: firstBatch['uom_id'], uomCode: firstBatch['uom_code'],
      status: 'IN_PRODUCTION', isMerged: true,
      warehouseId: data.warehouseId ?? firstBatch['warehouse_id'], warehouseName: data.warehouseName ?? firstBatch['warehouse_name'],
    })

    // Record genealogy for each source batch (IMMUTABLE)
    for (const source of sourceBatches) {
      await batchGenealogyRepository.create({
        tenantId, childBatchId: String(target!['id']), childBatchNumber: targetBatchNumber,
        parentBatchId: String(source['id']), parentBatchNumber: String(source['batch_number']),
        parentType: 'SOURCE_BATCH', consumedQty: Number(source['quantity']), uomCode: String(source['uom_code']),
      })

      // Mark source as merged
      await productionBatchRepository.update(tenantId, String(source['id']), { isMerged: true, status: 'ARCHIVED' }, Number(source['version']))

      // Record traceability
      await traceabilityLogRepository.create({
        tenantId, traceType: 'BATCH_MERGE', batchId: String(target!['id']), batchNumber: targetBatchNumber,
        productId: firstBatch['product_id'], productSku: firstBatch['product_sku'],
        direction: 'BACKWARD', relatedBatchId: String(source['id']), relatedBatchNumber: String(source['batch_number']),
        relatedType: 'SOURCE_BATCH', quantity: Number(source['quantity']), uomCode: String(source['uom_code']),
        description: `Merged from source batch ${source['batch_number']}`,
      })
    }

    const mergeNumber = await batchMergeRepository.generateMergeNumber(tenantId)
    await batchMergeRepository.create({
      tenantId, mergeNumber, targetBatchId: String(target!['id']), targetBatchNumber,
      mergeReason: data.mergeReason, totalQty: totalQty,
      sourceBatchIds: data.sourceBatchIds, mergeCount: data.sourceBatchIds.length,
      performedBy: userId, performedByName: ctx.userEmail,
    })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'BATCH_MERGED', entityType: 'ProductionBatch', entityId: String(target!['id']), entityCode: targetBatchNumber, after: { mergeNumber, sourceCount: data.sourceBatchIds.length, totalQty } })
    await eventBus.writeToOutbox({ eventName: 'BatchMerged', payload: { targetBatchId: String(target!['id']), targetBatchNumber, mergeNumber, sourceCount: data.sourceBatchIds.length }, tenantId })

    return { mergeNumber, targetBatchId: String(target!['id']), targetBatchNumber }
  },

  // ═══ Traceability Engine ══════════════════════════════════════════════════

  /** Backward Traceability — find all parent/ancestor batches (what went into this batch) */
  async backwardTraceability(batchId: string) {
    const { tenantId } = getContext()
    const batch = await productionBatchRepository.findById(tenantId, batchId)
    if (!batch) throw new NotFoundError('ProductionBatch', batchId)
    const ancestors = await batchGenealogyRepository.findAncestors(tenantId, batchId)
    return { batchId, batchNumber: String(batch['batch_number']), direction: 'BACKWARD', ancestors }
  },

  /** Forward Traceability — find all child/descendant batches (where did this batch go) */
  async forwardTraceability(batchId: string) {
    const { tenantId } = getContext()
    const batch = await productionBatchRepository.findById(tenantId, batchId)
    if (!batch) throw new NotFoundError('ProductionBatch', batchId)
    const descendants = await batchGenealogyRepository.findDescendants(tenantId, batchId)
    return { batchId, batchNumber: String(batch['batch_number']), direction: 'FORWARD', descendants }
  },

  /** Get full genealogy tree for a batch */
  async getGenealogy(batchId: string) {
    const { tenantId } = getContext()
    const batch = await productionBatchRepository.findById(tenantId, batchId)
    if (!batch) throw new NotFoundError('ProductionBatch', batchId)
    const [ancestors, descendants] = await Promise.all([
      batchGenealogyRepository.findAncestors(tenantId, batchId),
      batchGenealogyRepository.findDescendants(tenantId, batchId),
    ])
    return { batchId, batchNumber: String(batch['batch_number']), ancestors, descendants }
  },
}

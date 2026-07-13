/** Recall Management Service — Recall wizard, traceability, affected items/customers, communications, effectiveness */
import '@/modules/recall-management/workflow'
import { recallRepository, recallAffectedItemRepository, recallAffectedCustomerRepository, recallCommunicationRepository, recallEffectivenessRepository } from '../repository'
import { workflowRegistry } from '@/core/workflow'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { query } from '@/core/db/pglite'
import { BusinessRuleError, NotFoundError, AuthorizationError } from '@/core/errors'
import { enforceNotBreakGlass, enforceTenantIsolation } from '@/core/security/sod-enforcement'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx }
}

export const recallManagementService = {
  // ═══ Recall Wizard ════════════════════════════════════════════════════════

  async createRecall(data: {
    recallType?: string; recallClass?: string; recallReason: string
    productId?: string; productSku?: string; productName?: string
    batchId?: string; batchNumber?: string
    productionBatchId?: string; productionBatchNumber?: string
    priority?: string; regulatoryNotification?: boolean; remarks?: string
  }) {
    const { tenantId, userId, userEmail, ctx } = getContext()

    const recallNumber = await recallRepository.generateRecallNumber(tenantId)
    const recall = await recallRepository.create({
      tenantId, recallNumber, recallType: data.recallType ?? 'VOLUNTARY',
      recallClass: data.recallClass ?? 'CLASS_III', recallReason: data.recallReason,
      productId: data.productId, productSku: data.productSku, productName: data.productName,
      batchId: data.batchId, batchNumber: data.batchNumber,
      productionBatchId: data.productionBatchId, productionBatchNumber: data.productionBatchNumber,
      initiatedBy: userId, initiatedByName: userEmail,
      status: 'INITIATED', priority: data.priority ?? 'HIGH',
      regulatoryNotification: data.regulatoryNotification ?? false, remarks: data.remarks,
    })

    // Auto-identify affected inventory using backward traceability (immutable batch genealogy)
    if (data.productionBatchId) {
      await this.identifyAffectedItems(tenantId, String(recall!['id']), data.productionBatchId, userId, userEmail, ctx.correlationId)
    }

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: userEmail, action: 'RECALL_INITIATED', entityType: 'Recall', entityId: String(recall!['id']), entityCode: recallNumber, after: data })
    await eventBus.writeToOutbox({ eventName: 'RecallInitiated', payload: { recallId: String(recall!['id']), recallNumber, batchId: data.batchId }, tenantId })

    return recall
  },

  /** Identify affected inventory using immutable batch genealogy (backward traceability) */
  async identifyAffectedItems(tenantId: string, recallId: string, batchId: string, userId: string, userName: string, correlationId: string) {
    // Use recursive query on batch_genealogy to find all affected batches
    const genealogyResult = await query(`
      WITH RECURSIVE affected AS (
        SELECT $2::uuid as batch_id
        UNION
        SELECT bg.child_batch_id FROM batch_genealogy bg JOIN affected a ON bg.parent_batch_id = a.batch_id WHERE bg.tenant_id = $1 AND bg.is_immutable = true
      )
      SELECT pb.* FROM production_batches pb JOIN affected a ON pb.id = a.batch_id WHERE pb.tenant_id = $1 AND pb.deleted_at IS NULL
    `, [tenantId, batchId])

    let totalAffectedQty = 0
    for (const batch of genealogyResult.rows) {
      // Check inventory for this batch
      const invResult = await query(`SELECT * FROM inventory WHERE tenant_id = $1 AND batch_id = $2 AND quantity > 0 AND deleted_at IS NULL`, [tenantId, batch['id']])
      for (const inv of invResult.rows) {
        await recallAffectedItemRepository.create({
          tenantId, recallId, itemType: 'INVENTORY',
          batchId: batch['id'], batchNumber: batch['batch_number'],
          productId: batch['product_id'], productSku: batch['product_sku'], productName: batch['product_name'],
          quantity: inv['quantity'], uomCode: inv['uom_code'],
          warehouseId: inv['warehouse_id'], warehouseName: inv['warehouse_name'],
          status: 'IDENTIFIED',
        })
        totalAffectedQty += Number(inv['quantity'])
      }
    }

    // Update recall affected qty
    await query(`UPDATE recalls SET affected_qty = $3, updated_at = NOW() WHERE tenant_id = $1 AND id = $2`, [tenantId, recallId, totalAffectedQty])

    await auditService.log({ tenantId, correlationId, actorType: 'SYSTEM', actorId: userId, actorName: userName, action: 'AFFECTED_ITEMS_IDENTIFIED', entityType: 'Recall', entityId: recallId, after: { batchCount: genealogyResult.rows.length, totalAffectedQty } })
  },

  /** Identify affected customers using forward traceability */
  async identifyAffectedCustomers(recallId: string) {
    const { tenantId, userId, userEmail, ctx } = getContext()
    const recall = await recallRepository.findById(tenantId, recallId)
    if (!recall) throw new NotFoundError('Recall', recallId)

    // Find all shipments of the affected product/batch
    if (recall['product_id']) {
      const shipmentResult = await query(`
        SELECT * FROM inventory_transactions
        WHERE tenant_id = $1 AND product_id = $2 AND movement_type = 'STOCK_OUT'
        AND transaction_date >= (SELECT manufacture_date FROM production_batches WHERE id = $3)
        ORDER BY transaction_date DESC
      `, [tenantId, recall['product_id'], recall['batch_id']])

      for (const ship of shipmentResult.rows) {
        // In a real system, we'd link to customer orders; here we just record the shipment
        await recallAffectedCustomerRepository.create({
          tenantId, recallId,
          shippedQty: ship['quantity'], shippedDate: ship['transaction_date'],
          invoiceNumber: ship['reference_number'],
          notified: false, status: 'IDENTIFIED',
        })
      }
    }

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: userEmail, action: 'AFFECTED_CUSTOMERS_IDENTIFIED', entityType: 'Recall', entityId: recallId })
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const recall = await recallRepository.findById(tenantId, id)
    if (!recall) throw new NotFoundError('Recall', id)
    const [affectedItems, affectedCustomers, communications, effectiveness] = await Promise.all([
      recallAffectedItemRepository.listForRecall(tenantId, id),
      recallAffectedCustomerRepository.listForRecall(tenantId, id),
      recallCommunicationRepository.listForRecall(tenantId, id),
      recallEffectivenessRepository.listForRecall(tenantId, id),
    ])
    return { ...recall, affectedItems, affectedCustomers, communications, effectiveness }
  },

  async list(params: { page?: number; pageSize?: number; status?: string; productId?: string } = {}) {
    const { tenantId } = getContext()
    return recallRepository.list(tenantId, params)
  },

  async transition(id: string, targetStatus: string, version: number) {
    // Phase 1: Security enforcement
    enforceNotBreakGlass('transition')

    const { tenantId, userId, userEmail, ctx } = getContext()
    const existing = await recallRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Recall', id)

    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('RecallLifecycle')
    const check = await machine.canTransition({ id, status: String(existing['status']), version: Number(existing['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'RECALL.TRANSITION_DENIED' })

    const updateData: Record<string, unknown> = { status: targetStatus }
    if (targetStatus === 'APPROVED') {
      updateData.approvedBy = userId
      updateData.approvedByName = userEmail
      updateData.approvedAt = new Date().toISOString()
    }
    if (targetStatus === 'CLOSED') {
      updateData.closedBy = userId
      updateData.closedByName = userEmail
      updateData.closedAt = new Date().toISOString()
    }

    const updated = await recallRepository.update(tenantId, id, updateData, version)
    if (!updated) throw new BusinessRuleError('Recall was modified by another transaction', { code: 'RECALL.CONCURRENCY' })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: userEmail, action: 'RECALL_TRANSITION', entityType: 'Recall', entityId: id, entityCode: String(existing['recall_number']), before: { status: existing['status'] }, after: { status: targetStatus } })

    if (targetStatus === 'CLOSED') {
      await eventBus.writeToOutbox({ eventName: 'RecallClosed', payload: { recallId: id, recallNumber: String(existing['recall_number']) }, tenantId })
    }

    return updated
  },

  async addCommunication(recallId: string, data: { communicationType: string; channel?: string; recipient?: string; recipientName?: string; subject?: string; message: string; remarks?: string }) {
    const { tenantId, userId, userEmail, ctx } = getContext()
    const id = await recallCommunicationRepository.create({
      tenantId, recallId, communicationType: data.communicationType, channel: data.channel ?? 'EMAIL',
      recipient: data.recipient, recipientName: data.recipientName, subject: data.subject, message: data.message,
      sentBy: userId, sentByName: userEmail, remarks: data.remarks,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: userEmail, action: 'RECALL_COMMUNICATION_SENT', entityType: 'Recall', entityId: recallId, after: { communicationId: id, type: data.communicationType } })
    return { id }
  },

  async listCommunications(recallId: string) {
    const { tenantId } = getContext()
    return recallCommunicationRepository.listForRecall(tenantId, recallId)
  },

  async addEffectivenessReview(recallId: string, data: { totalAffectedQty: number; totalRecoveredQty: number; totalAffectedCustomers: number; customersNotified: number; customersResponded: number; effectivenessRating?: string; isEffective: boolean; remarks?: string }) {
    const { tenantId, userId, userEmail, ctx } = getContext()
    const recoveryPercent = data.totalAffectedQty > 0 ? Math.round((data.totalRecoveredQty / data.totalAffectedQty) * 10000) / 100 : 0
    const id = await recallEffectivenessRepository.create({
      tenantId, recallId, totalAffectedQty: data.totalAffectedQty, totalRecoveredQty: data.totalRecoveredQty,
      recoveryPercent, totalAffectedCustomers: data.totalAffectedCustomers,
      customersNotified: data.customersNotified, customersResponded: data.customersResponded,
      effectivenessRating: data.effectivenessRating, isEffective: data.isEffective,
      reviewedBy: userId, reviewedByName: userEmail, remarks: data.remarks,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: userEmail, action: 'RECALL_EFFECTIVENESS_REVIEW', entityType: 'Recall', entityId: recallId, after: { reviewId: id, recoveryPercent, isEffective: data.isEffective } })
    return { id, recoveryPercent }
  },

  async listEffectivenessReviews(recallId: string) {
    const { tenantId } = getContext()
    return recallEffectivenessRepository.listForRecall(tenantId, recallId)
  },

  async listAffectedItems(recallId: string) {
    const { tenantId } = getContext()
    return recallAffectedItemRepository.listForRecall(tenantId, recallId)
  },

  async listAffectedCustomers(recallId: string) {
    const { tenantId } = getContext()
    return recallAffectedCustomerRepository.listForRecall(tenantId, recallId)
  },
}

/** Procurement Service — Business logic for Purchase Requisitions */
import { prRepository, prLineRepository, prApprovalRepository } from '../repository'
import '@/modules/procurement/workflow'
import { workflowRegistry } from '@/core/workflow'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { BusinessRuleError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail, ctx }
}

export const procurementService = {
  async create(data: { companyId: string; businessUnitId?: string; plantId?: string; warehouseId?: string; departmentId?: string; requisitionType?: string; priority?: string; requiredDate: string; expectedDeliveryDate?: string; budgetId?: string; budgetAmount?: number; currency?: string; remarks?: string; internalNotes?: string; lines: Array<Record<string, unknown>> }) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: must have at least one line
    if (!data.lines || data.lines.length === 0) throw new BusinessRuleError('Purchase requisition must have at least one line item', { code: 'PR.NO_LINES' })

    // Business rule: required date must be in the future
    if (new Date(data.requiredDate) < new Date()) throw new BusinessRuleError('Required date cannot be in the past', { code: 'PR.PAST_REQUIRED_DATE' })

    // Generate PR number
    const prNumber = await prRepository.generatePrNumber(tenantId)

    // Calculate estimated total
    let estimatedTotal = 0
    for (const line of data.lines) {
      const qty = Number(line['requestedQty'] ?? 0)
      const price = Number(line['expectedPrice'] ?? 0)
      const lineTotal = qty * price
      line['expectedTotal'] = lineTotal
      estimatedTotal += lineTotal
    }

    const pr = await prRepository.create({
      tenantId, prNumber, companyId: data.companyId, businessUnitId: data.businessUnitId,
      plantId: data.plantId, warehouseId: data.warehouseId, departmentId: data.departmentId,
      requesterId: userId, requesterName: ctx.userEmail ?? 'Unknown',
      requisitionType: data.requisitionType ?? 'MANUAL', priority: data.priority ?? 'NORMAL',
      requiredDate: data.requiredDate, expectedDeliveryDate: data.expectedDeliveryDate,
      budgetId: data.budgetId, budgetAmount: data.budgetAmount, estimatedTotal, currency: data.currency ?? 'INR',
      remarks: data.remarks, internalNotes: data.internalNotes,
    })
    if (!pr) throw new Error('Failed to create purchase requisition')

    // Create lines
    let lineNo = 1
    for (const line of data.lines) {
      await prLineRepository.create({ ...line, tenantId, prId: pr['id'], lineNo, requiredDate: line['requiredDate'] ?? data.requiredDate })
      lineNo++
    }

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'PurchaseRequisition', entityId: String(pr['id']), entityCode: prNumber, after: pr })
    await eventBus.writeToOutbox({ eventName: 'PurchaseRequisitionCreated', payload: { prId: String(pr['id']), prNumber, lines: data.lines.length }, tenantId })

    return pr
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const pr = await prRepository.findById(tenantId, id)
    if (!pr) throw new NotFoundError('PurchaseRequisition', id)
    const [lines, approvals] = await Promise.all([
      prLineRepository.listForPr(tenantId, id),
      prApprovalRepository.listForPr(tenantId, id),
    ])
    return { ...pr, lines, approvals }
  },

  async list(params: { page?: number; pageSize?: number; search?: string; status?: string; priority?: string; requesterId?: string; plantId?: string; departmentId?: string } = {}) {
    const { tenantId } = getContext()
    return prRepository.list(tenantId, params)
  },

  async update(id: string, data: Record<string, unknown>, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await prRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('PurchaseRequisition', id)
    // Business rule: can only modify DRAFT or REJECTED
    if (!['DRAFT', 'REJECTED'].includes(String(existing['status']))) {
      throw new BusinessRuleError('Cannot modify a submitted requisition', { code: 'PR.NOT_EDITABLE' })
    }
    const updated = await prRepository.update(tenantId, id, data, version, userId)
    if (!updated) throw new ConcurrencyError('PR was modified by another transaction')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'PurchaseRequisition', entityId: id, entityCode: String(existing['pr_number']), before: existing, after: updated })
    return updated
  },

  async delete(id: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await prRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('PurchaseRequisition', id)
    // Business rule: can only delete DRAFT
    if (String(existing['status']) !== 'DRAFT') throw new BusinessRuleError('Can only delete draft requisitions', { code: 'PR.NOT_DRAFT' })
    const deleted = await prRepository.softDelete(tenantId, id, version)
    if (!deleted) throw new ConcurrencyError('PR was modified by another transaction')
    await prLineRepository.deleteForPr(id)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'DELETE', entityType: 'PurchaseRequisition', entityId: id, entityCode: String(existing['pr_number']) })
  },

  async transition(id: string, targetStatus: string, version: number, approvalData?: { comments?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await prRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('PurchaseRequisition', id)

    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('PurchaseRequisitionLifecycle')
    const check = await machine.canTransition({ id, status: String(existing['status']), version: Number(existing['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'PR.TRANSITION_DENIED' })

    // Budget validation for budget approval
    if (targetStatus === 'BUDGET_APPROVAL' && existing['budget_amount']) {
      if (Number(existing['estimated_total']) > Number(existing['budget_amount'])) {
        throw new BusinessRuleError('Estimated total exceeds budget', { code: 'PR.BUDGET_EXCEEDED' })
      }
    }

    const updated = await prRepository.update(tenantId, id, { status: targetStatus, rejectionReason: targetStatus === 'REJECTED' ? approvalData?.comments : undefined }, version, userId)
    if (!updated) throw new ConcurrencyError('PR was modified by another transaction')

    // Record approval if applicable
    if (['APPROVED', 'REJECTED'].includes(targetStatus) && approvalData) {
      await prApprovalRepository.create({
        tenantId, prId: id, approvalLevel: Number(existing['approval_level'] ?? 0) + 1,
        approverId: userId, approverName: ctx.userEmail ?? 'Unknown',
        approverRole: 'PROCUREMENT_MANAGER', action: targetStatus === 'APPROVED' ? 'APPROVED' : 'REJECTED',
        comments: approvalData.comments,
      })
    }

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'TRANSITION', entityType: 'PurchaseRequisition', entityId: id, entityCode: String(existing['pr_number']), before: { status: existing['status'] }, after: { status: targetStatus } })

    // Publish events
    const eventMap: Record<string, string> = { SUBMITTED: 'PurchaseRequisitionSubmitted', APPROVED: 'PurchaseRequisitionApproved', REJECTED: 'PurchaseRequisitionRejected', CANCELLED: 'PurchaseRequisitionCancelled' }
    if (eventMap[targetStatus]) {
      await eventBus.writeToOutbox({ eventName: eventMap[targetStatus], payload: { prId: id, prNumber: String(existing['pr_number']) }, tenantId })
    }

    return updated
  },
}

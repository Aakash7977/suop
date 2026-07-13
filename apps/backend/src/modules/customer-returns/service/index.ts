import '@/modules/customer-returns/workflow'
import { rmaRepository, rmaLineRepository, returnInspectionRepository, refundRepository, genRmaNumber, genRefundNumber } from '../repository'
import { workflowRegistry } from '@/core/workflow'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { query } from '@/core/db/pglite'
import { BusinessRuleError, NotFoundError, AuthorizationError } from '@/core/errors'
import { enforceNotBreakGlass, enforceTenantIsolation } from '@/core/security/sod-enforcement'
function getContext() { const ctx = getRequestContext(); if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required'); return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx } }

export const customerReturnsService = {
  async createRma(data: { soId?: string; soNumber?: string; deliveryOrderId?: string; deliveryNumber?: string; customerId: string; customerCode?: string; customerName: string; returnType?: string; returnReason: string; returnReasonDetail?: string; lines: Array<Record<string, unknown>> }) {
    const { tenantId, userId, ctx } = getContext()
    if (!data.lines || data.lines.length === 0) throw new BusinessRuleError('RMA must have at least one line', { code: 'RMA.NO_LINES' })
    const rmaNumber = await genRmaNumber(tenantId)
    let totalQty = 0; let totalValue = 0
    for (const line of data.lines) { totalQty += Number(line['returnedQty'] ?? 0); totalValue += Number(line['returnedQty'] ?? 0) * Number(line['unitPrice'] ?? 0) }
    const rma = await rmaRepository.create({ tenantId, rmaNumber, soId: data.soId, soNumber: data.soNumber, deliveryOrderId: data.deliveryOrderId, deliveryNumber: data.deliveryNumber, customerId: data.customerId, customerCode: data.customerCode, customerName: data.customerName, returnType: data.returnType ?? 'DAMAGE', returnReason: data.returnReason, returnReasonDetail: data.returnReasonDetail, totalQty, totalValue, currency: 'INR', isApproved: false, status: 'REQUESTED' })
    let lineNo = 1
    for (const line of data.lines) { await rmaLineRepository.create({ ...line, tenantId, rmaId: rma!['id'], lineNo, inspectionStatus: 'PENDING' }); lineNo++ }
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'RMA_CREATED', entityType: 'RMA', entityId: String(rma!['id']), entityCode: rmaNumber, after: data })
    await eventBus.writeToOutbox({ eventName: 'RMACreated', payload: { rmaId: String(rma!['id']), rmaNumber, customerId: data.customerId }, tenantId })
    return rma
  },
  async getById(id: string) { const { tenantId } = getContext(); const rma = await rmaRepository.findById(tenantId, id); if (!rma) throw new NotFoundError('RMA', id); return rma },
  async list(params: { page?: number; pageSize?: number; status?: string } = {}) { const { tenantId } = getContext(); return rmaRepository.list(tenantId, params) },
  async transition(id: string, targetStatus: string, version: number) {
    // Phase 1: Security enforcement
    enforceNotBreakGlass('transition')

    const { tenantId, userId, ctx } = getContext()
    const existing = await rmaRepository.findById(tenantId, id); if (!existing) throw new NotFoundError('RMA', id)
    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('RMALifecycle')
    const check = await machine.canTransition({ id, status: String(existing['status']), version: Number(existing['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'RMA.TRANSITION_DENIED' })
    // Business rule: Quality inspection required for returned goods
    if (targetStatus === 'RESOLVED') {
      const inspResult = await query(`SELECT id FROM return_inspections WHERE tenant_id = $1 AND rma_id = $2`, [tenantId, id])
      if (inspResult.rows.length === 0) throw new BusinessRuleError('Quality inspection required before resolution', { code: 'RMA.INSPECTION_REQUIRED' })
    }
    const updateData: Record<string, unknown> = { status: targetStatus }
    if (targetStatus === 'APPROVED') { updateData.isApproved = true; updateData.approvedBy = userId; updateData.approvedByName = ctx.userEmail; updateData.approvedAt = new Date().toISOString() }
    const result = await query(`UPDATE rma_requests SET status = $3, is_approved = $4, approved_by = $5, approved_by_name = $6, approved_at = $7, version = version + 1, updated_at = NOW() WHERE tenant_id = $1 AND id = $2 AND version = $8 AND deleted_at IS NULL RETURNING *`, [tenantId, id, targetStatus, updateData.isApproved ?? false, updateData.approvedBy ?? null, updateData.approvedByName ?? null, updateData.approvedAt ?? null, version])
    if (result.rows.length === 0) throw new BusinessRuleError('RMA was modified by another transaction', { code: 'RMA.CONCURRENCY' })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'RMA_TRANSITION', entityType: 'RMA', entityId: id, entityCode: String(existing['rma_number']), before: { status: existing['status'] }, after: { status: targetStatus } })
    if (targetStatus === 'CLOSED') await eventBus.writeToOutbox({ eventName: 'RMAClosed', payload: { rmaId: id, rmaNumber: String(existing['rma_number']) }, tenantId })
    return result.rows[0]
  },
  async createInspection(rmaId: string, data: { rmaLineId?: string; receivedQty: number; acceptedQty?: number; rejectedQty?: number; scrapQty?: number; repairQty?: number; inspectionResult?: string; disposition?: string; qualityHold?: boolean; holdReason?: string; remarks?: string }) {
    const { tenantId, userId, ctx } = getContext()
    if (data.receivedQty <= 0) throw new BusinessRuleError('Received quantity must be positive', { code: 'RI.INVALID_QTY' })
    const rma = await rmaRepository.findById(tenantId, rmaId); if (!rma) throw new NotFoundError('RMA', rmaId)
    const insp = await returnInspectionRepository.create({ tenantId, rmaId, rmaNumber: rma['rma_number'], rmaLineId: data.rmaLineId, inspectorId: userId, inspectorName: ctx.userEmail, receivedQty: data.receivedQty, acceptedQty: data.acceptedQty ?? 0, rejectedQty: data.rejectedQty ?? 0, scrapQty: data.scrapQty ?? 0, repairQty: data.repairQty ?? 0, inspectionResult: data.inspectionResult ?? 'ACCEPTED', disposition: data.disposition ?? 'RETURN_TO_STOCK', qualityHold: data.qualityHold ?? false, holdReason: data.holdReason, remarks: data.remarks })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'RETURN_INSPECTION', entityType: 'RMA', entityId: rmaId, after: { inspectionId: String(insp!['id']), receivedQty: data.receivedQty, disposition: data.disposition } })
    return insp
  },
  async listInspections(rmaId: string) { const { tenantId } = getContext(); const r = await returnInspectionRepository.list(tenantId, {}); return r.rows.filter((row: Record<string, unknown>) => row['rma_id'] === rmaId) },
  async createRefund(data: { rmaId: string; rmaNumber?: string; customerId?: string; customerName?: string; originalInvoiceNumber?: string; refundAmount: number; currency?: string; refundType: string; refundMethod?: string; remarks?: string }) {
    const { tenantId, userId, ctx } = getContext()
    if (data.refundAmount <= 0) throw new BusinessRuleError('Refund amount must be positive', { code: 'REF.INVALID_AMOUNT' })
    const refundNumber = await genRefundNumber(tenantId)
    const refund = await refundRepository.create({ tenantId, refundNumber, rmaId: data.rmaId, rmaNumber: data.rmaNumber, customerId: data.customerId, customerName: data.customerName, originalInvoiceNumber: data.originalInvoiceNumber, refundAmount: data.refundAmount, currency: data.currency ?? 'INR', refundType: data.refundType, refundMethod: data.refundMethod, status: 'PENDING', approvedBy: userId, approvedByName: ctx.userEmail, approvedAt: new Date().toISOString() })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'REFUND_CREATED', entityType: 'Refund', entityId: String(refund!['id']), entityCode: refundNumber, after: { refundAmount: data.refundAmount, refundType: data.refundType } })
    return refund
  },
  async listRefunds(params: { page?: number; pageSize?: number; status?: string } = {}) { const { tenantId } = getContext(); return refundRepository.list(tenantId, params) },
}

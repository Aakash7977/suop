/** RFQ Service — Business logic for Request for Quotation */
import { rfqRepository, rfqLineRepository, rfqSupplierRepository } from '../repository'
import '@/modules/rfq/workflow'
import { workflowRegistry } from '@/core/workflow'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { query } from '@/core/db/pglite'
import { BusinessRuleError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail, ctx }
}

export const rfqService = {
  async create(data: { prId?: string; companyId: string; plantId?: string; warehouseId?: string; rfqType?: string; closingDate: string; currency?: string; paymentTerms?: string; deliveryTerms?: string; incoterms?: string; targetDeliveryDate?: string; remarks?: string; internalNotes?: string; lines: Array<Record<string, unknown>>; suppliers?: Array<Record<string, unknown>> }) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: must have at least one line
    if (!data.lines || data.lines.length === 0) throw new BusinessRuleError('RFQ must have at least one line item', { code: 'RFQ.NO_LINES' })

    // Business rule: must have at least one supplier (unless OPEN)
    if (data.rfqType !== 'OPEN' && (!data.suppliers || data.suppliers.length === 0)) {
      throw new BusinessRuleError('RFQ must invite at least one supplier', { code: 'RFQ.NO_SUPPLIERS' })
    }

    // Business rule: closing date must be in the future
    if (new Date(data.closingDate) < new Date()) throw new BusinessRuleError('Closing date cannot be in the past', { code: 'RFQ.PAST_CLOSING_DATE' })

    // Business rule: if PR is linked, it must be APPROVED
    if (data.prId) {
      const prResult = await query(`SELECT status FROM purchase_requisitions WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, data.prId])
      if (prResult.rows.length === 0) throw new BusinessRuleError('Linked purchase requisition not found', { code: 'RFQ.PR_NOT_FOUND' })
      if (prResult.rows[0]!['status'] !== 'APPROVED' && prResult.rows[0]!['status'] !== 'CONVERTED_TO_RFQ') {
        throw new BusinessRuleError('Purchase requisition must be APPROVED before creating RFQ', { code: 'RFQ.PR_NOT_APPROVED' })
      }
      // Update PR status to CONVERTED_TO_RFQ
      await query(`UPDATE purchase_requisitions SET status = 'CONVERTED_TO_RFQ', updated_at = NOW() WHERE id = $1`, [data.prId])
    }

    // Business rule: validate suppliers are not blacklisted
    const suppliers = data.suppliers ?? []
    for (const supplier of suppliers) {
      const suppResult = await query(`SELECT status FROM suppliers WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, String(supplier["supplierId"])])
      if (suppResult.rows.length === 0) throw new BusinessRuleError(`Supplier not found: ${String(supplier['supplierCode'])}`, { code: 'RFQ.SUPPLIER_NOT_FOUND' })
      if (suppResult.rows[0]!['status'] === 'BLACKLISTED') throw new BusinessRuleError(`Supplier ${String(supplier['supplierCode'])} is blacklisted`, { code: 'RFQ.SUPPLIER_BLACKLISTED' })
    }

    // Generate RFQ number
    const rfqNumber = await rfqRepository.generateRfqNumber(tenantId)

    // Get PR number if linked
    let prNumber: string | undefined
    if (data.prId) {
      const prResult = await query(`SELECT pr_number FROM purchase_requisitions WHERE id = $1`, [data.prId])
      prNumber = prResult.rows[0]?.['pr_number'] as string | undefined
    }

    const rfq = await rfqRepository.create({
      tenantId, rfqNumber, prId: data.prId, prNumber,
      companyId: data.companyId, plantId: data.plantId, warehouseId: data.warehouseId,
      buyerId: userId, buyerName: ctx.userEmail ?? 'Unknown',
      rfqType: data.rfqType ?? 'MULTI_SUPPLIER', closingDate: data.closingDate,
      currency: data.currency ?? 'INR', paymentTerms: data.paymentTerms ?? 'NET30',
      deliveryTerms: data.deliveryTerms, incoterms: data.incoterms,
      targetDeliveryDate: data.targetDeliveryDate, remarks: data.remarks, internalNotes: data.internalNotes,
    })
    if (!rfq) throw new Error('Failed to create RFQ')

    // Create lines
    let lineNo = 1
    for (const line of data.lines) {
      await rfqLineRepository.create({ ...line, tenantId, rfqId: String(rfq['id']), lineNo })
      lineNo++
    }

    // Invite suppliers
    for (const supplier of suppliers) {
      await rfqSupplierRepository.create({ tenantId, rfqId: String(rfq['id']), supplierId: String(supplier["supplierId"]), supplierCode: String(supplier["supplierCode"]), supplierName: String(supplier["supplierName"]), invitedBy: userId, isPreferred: Boolean(supplier["isPreferred"] ?? false) })
    }

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'Rfq', entityId: String(rfq['id']), entityCode: rfqNumber, after: rfq })
    await eventBus.writeToOutbox({ eventName: 'RFQCreated', payload: { rfqId: String(rfq['id']), rfqNumber, suppliers: suppliers.length }, tenantId })

    return rfq
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const rfq = await rfqRepository.findById(tenantId, id)
    if (!rfq) throw new NotFoundError('Rfq', id)
    const [lines, suppliers] = await Promise.all([
      rfqLineRepository.listForRfq(tenantId, id),
      rfqSupplierRepository.listForRfq(tenantId, id),
    ])
    return { ...rfq, lines, suppliers }
  },

  async list(params: { page?: number; pageSize?: number; search?: string; status?: string; buyerId?: string; prId?: string } = {}) {
    const { tenantId } = getContext()
    return rfqRepository.list(tenantId, params)
  },

  async update(id: string, data: Record<string, unknown>, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await rfqRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Rfq', id)
    if (!['DRAFT'].includes(String(existing['status']))) throw new BusinessRuleError('Can only modify draft RFQs', { code: 'RFQ.NOT_EDITABLE' })
    const updated = await rfqRepository.update(tenantId, id, data, version, userId)
    if (!updated) throw new ConcurrencyError('RFQ was modified by another transaction')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'Rfq', entityId: id, entityCode: String(existing['rfq_number']), before: existing, after: updated })
    return updated
  },

  async delete(id: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await rfqRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Rfq', id)
    if (String(existing['status']) !== 'DRAFT') throw new BusinessRuleError('Can only delete draft RFQs', { code: 'RFQ.NOT_DRAFT' })
    const deleted = await rfqRepository.softDelete(tenantId, id, version)
    if (!deleted) throw new ConcurrencyError('RFQ was modified by another transaction')
    await rfqLineRepository.deleteForRfq(id)
    await rfqSupplierRepository.deleteForRfq(id)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'DELETE', entityType: 'Rfq', entityId: id, entityCode: String(existing['rfq_number']) })
  },

  async transition(id: string, targetStatus: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await rfqRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('Rfq', id)
    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('RfqLifecycle')
    const check = await machine.canTransition({ id, status: String(existing['status']), version: Number(existing['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'RFQ.TRANSITION_DENIED' })
    const updated = await rfqRepository.update(tenantId, id, { status: targetStatus }, version, userId)
    if (!updated) throw new ConcurrencyError('RFQ was modified by another transaction')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'TRANSITION', entityType: 'Rfq', entityId: id, entityCode: String(existing['rfq_number']), before: { status: existing['status'] }, after: { status: targetStatus } })

    const eventMap: Record<string, string> = { SUBMITTED: 'RFQSubmitted', SENT: 'RFQSent', CLOSED: 'RFQClosed', CANCELLED: 'RFQCancelled' }
    if (eventMap[targetStatus]) await eventBus.writeToOutbox({ eventName: eventMap[targetStatus], payload: { rfqId: id, rfqNumber: String(existing['rfq_number']) }, tenantId })

    return updated
  },

  async inviteSupplier(rfqId: string, data: { supplierId: string; supplierCode: string; supplierName: string; isPreferred?: boolean }) {
    const { tenantId, userId, ctx } = getContext()
    const rfq = await rfqRepository.findById(tenantId, rfqId)
    if (!rfq) throw new NotFoundError('Rfq', rfqId)
    // Business rule: can only invite suppliers when RFQ is DRAFT or SUBMITTED
    if (!['DRAFT', 'SUBMITTED'].includes(String(rfq['status']))) throw new BusinessRuleError('Can only invite suppliers to draft or submitted RFQs', { code: 'RFQ.NOT_INVITABLE' })
    // Business rule: supplier must not be blacklisted
    const suppResult = await query(`SELECT status FROM suppliers WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, data.supplierId])
    if (suppResult.rows.length === 0) throw new BusinessRuleError('Supplier not found', { code: 'RFQ.SUPPLIER_NOT_FOUND' })
    if (suppResult.rows[0]!['status'] === 'BLACKLISTED') throw new BusinessRuleError('Supplier is blacklisted', { code: 'RFQ.SUPPLIER_BLACKLISTED' })

    const id = await rfqSupplierRepository.create({ tenantId, rfqId, ...data, invitedBy: userId })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'RfqSupplier', entityId: id, reason: `Supplier ${data.supplierCode} invited to RFQ ${rfq['rfq_number']}` })
    await eventBus.writeToOutbox({ eventName: 'SupplierInvited', payload: { rfqId, supplierId: data.supplierId, supplierCode: data.supplierCode }, tenantId })
    return id
  },
}

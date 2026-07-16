/** Goods Receipt Service — Business logic for GRN */
import '@/modules/goods-receipt/workflow'
import { grnRepository, grnLineRepository, grnAttachmentRepository, grnDamageRepository } from '../repository'
import { workflowRegistry } from '@/core/workflow'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { query, pgliteTransaction } from '@/core/db/pglite'
import { BusinessRuleError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'
import { enforceNotBreakGlass, enforceTenantIsolation, enforceMakerChecker } from '@/core/security/sod-enforcement'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail, ctx }
}

export const goodsReceiptService = {
  async create(data: {
    poId?: string; poNumber?: string
    supplierId: string; supplierCode: string; supplierName: string
    supplierInvoiceNumber?: string; supplierInvoiceDate?: string; supplierInvoiceAmount?: number
    deliveryChallanNumber?: string; deliveryChallanDate?: string
    companyId: string; companyName: string; plantId: string; plantName: string
    warehouseId?: string; warehouseName?: string
    vehicleNumber?: string; transportName?: string; transportLorryNo?: string
    transportLrNumber?: string; transportLrDate?: string; transportMode?: string
    ewayBillNumber?: string; ewayBillDate?: string
    remarks?: string; internalNotes?: string
    lines: Array<Record<string, unknown>>
  }) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: must have at least one line
    if (!data.lines || data.lines.length === 0) {
      throw new BusinessRuleError('GRN must have at least one line item', { code: 'GRN.NO_LINES' })
    }

    // Business rule: if PO is referenced, it must be in ISSUED/SUPPLIER_ACCEPTED/PARTIALLY_RECEIVED status
    if (data.poId) {
      const poResult = await query(`SELECT status, supplier_id FROM purchase_orders WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, data.poId])
      if (poResult.rows.length === 0) throw new BusinessRuleError('PO not found', { code: 'GRN.PO_NOT_FOUND' })
      const poStatus = String(poResult.rows[0]!['status'])
      if (!['ISSUED', 'SUPPLIER_ACCEPTED', 'PARTIALLY_RECEIVED'].includes(poStatus)) {
        throw new BusinessRuleError(`Cannot create GRN for PO in ${poStatus} status`, { code: 'GRN.PO_NOT_RECEIVABLE' })
      }
      // Business rule: supplier must match PO supplier
      if (String(poResult.rows[0]!['supplier_id']) !== data.supplierId) {
        throw new BusinessRuleError('GRN supplier does not match PO supplier', { code: 'GRN.SUPPLIER_MISMATCH' })
      }
    }

    // Business rule: supplier must be ACTIVE
    const suppResult = await query(`SELECT status FROM suppliers WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, data.supplierId])
    if (suppResult.rows.length === 0) throw new BusinessRuleError('Supplier not found', { code: 'GRN.SUPPLIER_NOT_FOUND' })
    const suppStatus = String(suppResult.rows[0]!['status'])
    if (!['ACTIVE', 'PROBATION'].includes(suppStatus)) {
      throw new BusinessRuleError(`Supplier must be ACTIVE (current: ${suppStatus})`, { code: 'GRN.SUPPLIER_NOT_ACTIVE' })
    }

    // Calculate totals + detect short/over/partial receipt
    let totalQty = 0, totalAccepted = 0, totalRejected = 0, totalDamaged = 0, totalShort = 0, totalOver = 0
    let isPartial = false, isShortReceipt = false, isOverReceipt = false

    for (const line of data.lines) {
      const orderedQty = Number(line['orderedQty'] ?? 0)
      const receivedQty = Number(line['receivedQty'] ?? 0)
      const damagedQty = Number(line['damagedQty'] ?? 0)
      if (receivedQty <= 0) throw new BusinessRuleError('Received quantity must be positive', { code: 'GRN.INVALID_QTY' })

      totalQty += receivedQty

      // Short receipt: received < ordered
      if (orderedQty > 0 && receivedQty < orderedQty) {
        const shortQty = orderedQty - receivedQty
        line['shortQty'] = shortQty
        totalShort += shortQty
        isShortReceipt = true
      }
      // Over receipt: received > ordered (allow up to 10% tolerance)
      if (orderedQty > 0 && receivedQty > orderedQty * 1.1) {
        const overQty = receivedQty - orderedQty
        line['overQty'] = overQty
        totalOver += overQty
        isOverReceipt = true
      }
      // Damaged quantity
      if (damagedQty > 0) {
        totalDamaged += damagedQty
      }
      // Accepted = received - damaged
      const acceptedQty = receivedQty - damagedQty
      line['acceptedQty'] = acceptedQty
      totalAccepted += acceptedQty

      // Line total
      const unitPrice = Number(line['unitPrice'] ?? 0)
      line['lineTotal'] = receivedQty * unitPrice
    }

    // Partial receipt: if any line has short qty
    if (totalShort > 0) isPartial = true

    const grnNumber = await grnRepository.generateGrnNumber(tenantId)

    // Phase 1.6: Wrap multi-step writes in DB transaction for atomicity
    const grn = await pgliteTransaction(async () => {
      const grn = await grnRepository.create({
        tenantId, grnNumber,
        poId: data.poId, poNumber: data.poNumber,
        supplierId: data.supplierId, supplierCode: data.supplierCode, supplierName: data.supplierName,
        supplierInvoiceNumber: data.supplierInvoiceNumber, supplierInvoiceDate: data.supplierInvoiceDate, supplierInvoiceAmount: data.supplierInvoiceAmount,
        deliveryChallanNumber: data.deliveryChallanNumber, deliveryChallanDate: data.deliveryChallanDate,
        companyId: data.companyId, companyName: data.companyName, plantId: data.plantId, plantName: data.plantName,
        warehouseId: data.warehouseId, warehouseName: data.warehouseName,
        vehicleNumber: data.vehicleNumber, transportName: data.transportName,
        transportLorryNo: data.transportLorryNo, transportLrNumber: data.transportLrNumber, transportLrDate: data.transportLrDate, transportMode: data.transportMode,
        ewayBillNumber: data.ewayBillNumber, ewayBillDate: data.ewayBillDate,
        totalQty, totalAcceptedQty: totalAccepted, totalRejectedQty: totalRejected, totalDamagedQty: totalDamaged, totalShortQty: totalShort, totalOverQty: totalOver,
        isPartial, isShortReceipt, isOverReceipt,
        remarks: data.remarks, internalNotes: data.internalNotes,
        status: 'DRAFT',
      })
      if (!grn) throw new Error('Failed to create GRN')

      // Create lines
      let lineNo = 1
      for (const line of data.lines) {
        await grnLineRepository.create({
          ...line,
          tenantId, grnId: grn['id'], lineNo,
          inspectionStatus: 'PENDING',
        })
        lineNo++
      }
      return grn
    })

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'CREATE', entityType: 'GoodsReceipt', entityId: String(grn['id']), entityCode: grnNumber, after: grn,
    })
    await eventBus.writeToOutbox({
      eventName: 'GoodsReceiptCreated', payload: { grnId: String(grn['id']), grnNumber, poId: data.poId, supplierId: data.supplierId }, tenantId,
    })

    return grn
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const grn = await grnRepository.findById(tenantId, id)
    if (!grn) throw new NotFoundError('GoodsReceipt', id)
    const [lines, attachments, damages] = await Promise.all([
      grnLineRepository.listForGrn(tenantId, id),
      grnAttachmentRepository.listForGrn(tenantId, id),
      grnDamageRepository.listForGrn(tenantId, id),
    ])
    return { ...grn, lines, attachments, damages }
  },

  async list(params: { page?: number; pageSize?: number; search?: string; status?: string; supplierId?: string; poId?: string } = {}) {
    const { tenantId } = getContext()
    return grnRepository.list(tenantId, params)
  },

  async update(id: string, data: Record<string, unknown>, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await grnRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('GoodsReceipt', id)
    // Phase 1.6: Removed dead `targetStatus` reference — maker-checker is enforced
    // in the transition() method where targetStatus is actually defined.

    if (String(existing['status']) !== 'DRAFT') {
      throw new BusinessRuleError('Can only modify draft GRNs', { code: 'GRN.NOT_DRAFT' })
    }
    const updated = await grnRepository.update(tenantId, id, data, version, userId)
    if (!updated) throw new ConcurrencyError('GRN was modified by another transaction')
    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'UPDATE', entityType: 'GoodsReceipt', entityId: id, entityCode: String(existing['grn_number']), before: existing, after: updated,
    })
    return updated
  },

  async delete(id: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await grnRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('GoodsReceipt', id)
    if (String(existing['status']) !== 'DRAFT') {
      throw new BusinessRuleError('Can only delete draft GRNs', { code: 'GRN.NOT_DRAFT' })
    }
    const deleted = await grnRepository.softDelete(tenantId, id, version)
    if (!deleted) throw new ConcurrencyError('GRN was modified by another transaction')
    await grnLineRepository.deleteForGrn(id)
    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'DELETE', entityType: 'GoodsReceipt', entityId: id, entityCode: String(existing['grn_number']),
    })
  },

  async transition(id: string, targetStatus: string, version: number, options?: { verificationNotes?: string; rejectionReason?: string }) {
    // Phase 1: Security enforcement
    enforceNotBreakGlass('transition')

    const { tenantId, userId, ctx } = getContext()
    const existing = await grnRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('GoodsReceipt', id)

    // Maker-checker: creator cannot accept/reject their own GRN
    if (targetStatus === 'ACCEPTED' || targetStatus === 'REJECTED') {
      enforceMakerChecker(existing['received_by'] as string | null, targetStatus.toLowerCase(), 'GoodsReceipt')
    }

    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('GoodsReceiptLifecycle')
    const check = await machine.canTransition({ id, status: String(existing['status']), version: Number(existing['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'GRN.TRANSITION_DENIED' })

    const updateData: Record<string, unknown> = { status: targetStatus }
    if (targetStatus === 'VERIFIED') {
      updateData.verifiedBy = userId
      updateData.verifiedByName = ctx.userEmail
      updateData.verifiedAt = new Date().toISOString()
    }
    if (targetStatus === 'REJECTED' && options?.rejectionReason) {
      updateData.rejectionReason = options.rejectionReason
    }

    // Phase 1.6: Wrap transition + PO balance update in DB transaction for atomicity
    const updated = await pgliteTransaction(async () => {
      const updated = await grnRepository.update(tenantId, id, updateData, version, userId)
      if (!updated) throw new ConcurrencyError('GRN was modified by another transaction')

      // Business rule: Accepted GRN updates PO balance
      if (targetStatus === 'ACCEPTED' && existing['po_id']) {
        await query(
          `UPDATE purchase_orders SET
            received_qty = COALESCE(received_qty, 0) + $2,
            pending_qty = GREATEST(COALESCE(pending_qty, 0) - $2, 0),
            is_partially_received = (GREATEST(COALESCE(pending_qty, 0) - $2, 0) > 0),
            is_fully_received = (GREATEST(COALESCE(pending_qty, 0) - $2, 0) <= 0),
            last_receipt_date = NOW(),
            version = version + 1,
            updated_at = NOW()
           WHERE tenant_id = $1 AND id = $3 AND deleted_at IS NULL`,
          [tenantId, Number(existing['total_accepted_qty']), String(existing['po_id'])],
        )
      }
      return updated
    })

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'TRANSITION', entityType: 'GoodsReceipt', entityId: id, entityCode: String(existing['grn_number']),
      before: { status: existing['status'] }, after: { status: targetStatus },
    })

    const eventMap: Record<string, string> = {
      VERIFIED: 'GoodsReceiptVerified',
      ACCEPTED: 'GoodsReceiptAccepted',
      REJECTED: 'GoodsReceiptRejected',
      CLOSED: 'GoodsReceiptClosed',
    }
    if (eventMap[targetStatus]) {
      await eventBus.writeToOutbox({
        eventName: eventMap[targetStatus], payload: { grnId: id, grnNumber: String(existing['grn_number']), status: targetStatus }, tenantId,
      })
    }

    return updated
  },

  /** Update PO received quantity and balance when GRN is accepted */
  async updatePoBalance(poId: string, acceptedQty: number) {
    const { tenantId } = getContext()
    await query(
      `UPDATE purchase_orders SET
        received_qty = COALESCE(received_qty, 0) + $2,
        pending_qty = GREATEST(COALESCE(pending_qty, 0) - $2, 0),
        is_partially_received = (pending_qty - $2 > 0),
        is_fully_received = (pending_qty - $2 <= 0),
        last_receipt_date = NOW(),
        version = version + 1,
        updated_at = NOW()
       WHERE tenant_id = $1 AND id = $3 AND deleted_at IS NULL`,
      [tenantId, acceptedQty, poId],
    )
  },

  async addDamage(id: string, data: { grnLineId?: string; productId?: string; productSku?: string; damageType: string; damagedQty: number; damageReason: string; damageSeverity?: string; actionTaken?: string; photoUrl?: string; remarks?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await grnRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('GoodsReceipt', id)
    if (data.damagedQty <= 0) throw new BusinessRuleError('Damaged quantity must be positive', { code: 'GRN.INVALID_DAMAGE_QTY' })

    const damageId = await grnDamageRepository.create({
      tenantId, grnId: id, grnLineId: data.grnLineId, productId: data.productId, productSku: data.productSku,
      damageType: data.damageType, damagedQty: data.damagedQty, damageReason: data.damageReason,
      damageSeverity: data.damageSeverity, actionTaken: data.actionTaken, photoUrl: data.photoUrl, remarks: data.remarks,
      recordedBy: userId, recordedByName: ctx.userEmail,
    })
    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'DAMAGE_RECORDED', entityType: 'GoodsReceipt', entityId: id, entityCode: String(existing['grn_number']),
      after: { damageId, damagedQty: data.damagedQty },
    })
    return { damageId }
  },

  async exportGrns(params: { status?: string; supplierId?: string; poId?: string } = {}) {
    const { tenantId } = getContext()
    const result = await grnRepository.list(tenantId, { ...params, page: 1, pageSize: 10000 })
    return result.rows
  },
}

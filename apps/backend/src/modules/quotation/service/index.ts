/** Quotation Service — Business logic + Comparison Engine */
import { quotationRepository, quotationLineRepository } from '../repository'
import '@/modules/quotation/workflow'
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

export const quotationService = {
  async create(data: { rfqId: string; rfqNumber: string; supplierId: string; supplierCode: string; supplierName: string; validityDate: string; currency?: string; paymentTerms?: string; deliveryTerms?: string; leadTimeDays?: number; taxPercent?: number; discountPercent?: number; freightAmount?: number; insuranceAmount?: number; warrantyTerms?: string; remarks?: string; lines: Array<Record<string, unknown>> }) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: must have at least one line
    if (!data.lines || data.lines.length === 0) throw new BusinessRuleError('Quotation must have at least one line item', { code: 'QUOT.NO_LINES' })

    // Business rule: validity date must be in the future
    if (new Date(data.validityDate) < new Date()) throw new BusinessRuleError('Validity date cannot be in the past', { code: 'QUOT.PAST_VALIDITY' })

    // Business rule: RFQ must exist and be in SENT/SUPPLIER_RESPONSE/EVALUATION status
    const rfqResult = await query(`SELECT status, closing_date FROM rfqs WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, data.rfqId])
    if (rfqResult.rows.length === 0) throw new BusinessRuleError('RFQ not found', { code: 'QUOT.RFQ_NOT_FOUND' })
    const rfqStatus = rfqResult.rows[0]!['status']
    if (!['SENT', 'SUPPLIER_RESPONSE', 'EVALUATION'].includes(String(rfqStatus))) {
      throw new BusinessRuleError(`Cannot create quotation for RFQ in ${rfqStatus} status`, { code: 'QUOT.RFQ_NOT_ACCEPTING' })
    }

    // Business rule: supplier must not be blacklisted
    const suppResult = await query(`SELECT status FROM suppliers WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, data.supplierId])
    if (suppResult.rows.length === 0) throw new BusinessRuleError('Supplier not found', { code: 'QUOT.SUPPLIER_NOT_FOUND' })
    if (suppResult.rows[0]!['status'] === 'BLACKLISTED') throw new BusinessRuleError('Supplier is blacklisted', { code: 'QUOT.SUPPLIER_BLACKLISTED' })

    // Business rule: duplicate quotation prevention (same supplier + same RFQ)
    const existingResult = await query(`SELECT id FROM supplier_quotations WHERE tenant_id = $1 AND rfq_id = $2 AND supplier_id = $3 AND deleted_at IS NULL AND status NOT IN ('REJECTED', 'ARCHIVED')`, [tenantId, data.rfqId, data.supplierId])
    if (existingResult.rows.length > 0) throw new BusinessRuleError('Supplier already has an active quotation for this RFQ', { code: 'QUOT.DUPLICATE' })

    // Generate quotation number
    const quotationNumber = await quotationRepository.generateQuotationNumber(tenantId)

    // Calculate totals
    let subtotal = 0
    for (const line of data.lines) {
      const qty = Number(line['quotedQty'] ?? 0)
      const price = Number(line['unitPrice'] ?? 0)
      const lineTotal = qty * price
      line['lineTotal'] = lineTotal
      subtotal += lineTotal
    }

    const taxAmount = subtotal * (Number(data.taxPercent ?? 0) / 100)
    const discountAmount = subtotal * (Number(data.discountPercent ?? 0) / 100)
    const grandTotal = subtotal + taxAmount - discountAmount + Number(data.freightAmount ?? 0) + Number(data.insuranceAmount ?? 0)

    const quotation = await quotationRepository.create({
      tenantId, quotationNumber, rfqId: data.rfqId, rfqNumber: data.rfqNumber,
      supplierId: data.supplierId, supplierCode: data.supplierCode, supplierName: data.supplierName,
      validityDate: data.validityDate, currency: data.currency ?? 'INR',
      paymentTerms: data.paymentTerms ?? 'NET30', deliveryTerms: data.deliveryTerms,
      leadTimeDays: data.leadTimeDays, taxPercent: data.taxPercent, discountPercent: data.discountPercent,
      freightAmount: data.freightAmount, insuranceAmount: data.insuranceAmount, warrantyTerms: data.warrantyTerms,
      subtotal, taxAmount, discountAmount, grandTotal, remarks: data.remarks,
    })
    if (!quotation) throw new Error('Failed to create quotation')

    // Create lines
    let lineNo = 1
    for (const line of data.lines) {
      await quotationLineRepository.create({ ...line, tenantId, quotationId: quotation['id'], lineNo })
      lineNo++
    }

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'SupplierQuotation', entityId: String(quotation['id']), entityCode: quotationNumber, after: quotation })
    await eventBus.writeToOutbox({ eventName: 'QuotationSubmitted', payload: { quotationId: String(quotation['id']), quotationNumber, rfqId: data.rfqId, supplierId: data.supplierId }, tenantId })

    return quotation
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const quotation = await quotationRepository.findById(tenantId, id)
    if (!quotation) throw new NotFoundError('SupplierQuotation', id)
    const lines = await quotationLineRepository.listForQuotation(tenantId, id)
    return { ...quotation, lines }
  },

  async list(params: { page?: number; pageSize?: number; search?: string; status?: string; rfqId?: string; supplierId?: string } = {}) {
    const { tenantId } = getContext()
    return quotationRepository.list(tenantId, params)
  },

  async update(id: string, data: Record<string, unknown>, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await quotationRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('SupplierQuotation', id)
    if (!['DRAFT'].includes(String(existing['status']))) throw new BusinessRuleError('Can only modify draft quotations', { code: 'QUOT.NOT_EDITABLE' })
    const updated = await quotationRepository.update(tenantId, id, data, version, userId)
    if (!updated) throw new ConcurrencyError('Quotation was modified by another transaction')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'UPDATE', entityType: 'SupplierQuotation', entityId: id, entityCode: String(existing['quotation_number']), before: existing, after: updated })
    return updated
  },

  async delete(id: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await quotationRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('SupplierQuotation', id)
    if (String(existing['status']) !== 'DRAFT') throw new BusinessRuleError('Can only delete draft quotations', { code: 'QUOT.NOT_DRAFT' })
    const deleted = await quotationRepository.softDelete(tenantId, id, version)
    if (!deleted) throw new ConcurrencyError('Quotation was modified by another transaction')
    await quotationLineRepository.deleteForQuotation(id)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'DELETE', entityType: 'SupplierQuotation', entityId: id, entityCode: String(existing['quotation_number']) })
  },

  async transition(id: string, targetStatus: string, version: number, transitionData?: { technicalScore?: number; commercialScore?: number; overallScore?: number; rank?: number; recommendationNotes?: string; rejectionReason?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await quotationRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('SupplierQuotation', id)
    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('QuotationLifecycle')
    const check = await machine.canTransition({ id, status: String(existing['status']), version: Number(existing['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'QUOT.TRANSITION_DENIED' })

    // Business rule: only one quotation can be AWARDED per RFQ
    if (targetStatus === 'AWARDED') {
      const awardedResult = await query(`SELECT id FROM supplier_quotations WHERE tenant_id = $1 AND rfq_id = $2 AND status = 'AWARDED' AND id != $3`, [tenantId, existing['rfq_id'], id])
      if (awardedResult.rows.length > 0) throw new BusinessRuleError('Another quotation for this RFQ has already been awarded', { code: 'QUOT.ALREADY_AWARDED' })
    }

    const updateData: Record<string, unknown> = { status: targetStatus }
    if (transitionData?.technicalScore !== undefined) updateData.technicalScore = transitionData.technicalScore
    if (transitionData?.commercialScore !== undefined) updateData.commercialScore = transitionData.commercialScore
    if (transitionData?.overallScore !== undefined) updateData.overallScore = transitionData.overallScore
    if (transitionData?.rank !== undefined) updateData.rank = transitionData.rank
    if (transitionData?.recommendationNotes !== undefined) updateData.recommendationNotes = transitionData.recommendationNotes
    if (targetStatus === 'REJECTED' && transitionData?.rejectionReason) updateData.rejectionReason = transitionData.rejectionReason

    const updated = await quotationRepository.update(tenantId, id, updateData, version, userId)
    if (!updated) throw new ConcurrencyError('Quotation was modified by another transaction')
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'TRANSITION', entityType: 'SupplierQuotation', entityId: id, entityCode: String(existing['quotation_number']), before: { status: existing['status'] }, after: { status: targetStatus } })

    const eventMap: Record<string, string> = { RECOMMENDED: 'QuotationRecommended', AWARDED: 'QuotationAwarded', REJECTED: 'QuotationRejected' }
    if (eventMap[targetStatus]) await eventBus.writeToOutbox({ eventName: eventMap[targetStatus], payload: { quotationId: id, quotationNumber: String(existing['quotation_number']), rfqId: String(existing['rfq_id']) }, tenantId })

    if (targetStatus === 'AWARDED') await eventBus.writeToOutbox({ eventName: 'SupplierAwarded', payload: { quotationId: id, supplierId: String(existing['supplier_id']), rfqId: String(existing['rfq_id']) }, tenantId })

    return updated
  },

  // ═══ COMPARISON ENGINE ════════════════════════════════════════════════════

  async compareQuotations(rfqId: string) {
    const { tenantId } = getContext()
    const quotations = await quotationRepository.listForRfq(tenantId, rfqId)
    if (quotations.length === 0) throw new NotFoundError('Quotations for RFQ', rfqId)

    // Get supplier performance data
    const supplierIds = quotations.map(q => String(q['supplier_id']))
    const supplierData = await query(`SELECT id, quality_rating, delivery_rating, price_rating, overall_rating, risk_level, is_preferred, on_time_delivery_pct FROM suppliers WHERE tenant_id = $1 AND id = ANY($2::uuid[])`, [tenantId, supplierIds])

    const supplierMap = new Map<string, Record<string, unknown>>()
    for (const s of supplierData.rows) { supplierMap.set(String(s['id']), s as Record<string, unknown>) }

    // Build comparison
    const comparisons = quotations.map((quot, index) => {
      const supplier = supplierMap.get(String(quot['supplier_id'])) ?? {}
      const grandTotal = Number(quot['grand_total'])
      const leadTime = Number(quot['lead_time_days'] ?? 0)

      return {
        quotationId: String(quot['id']),
        quotationNumber: String(quot['quotation_number']),
        supplierId: String(quot['supplier_id']),
        supplierCode: String(quot['supplier_code']),
        supplierName: String(quot['supplier_name']),
        grandTotal,
        currency: String(quot['currency']),
        leadTimeDays: leadTime,
        paymentTerms: String(quot['payment_terms']),
        taxPercent: Number(quot['tax_percent'] ?? 0),
        discountPercent: Number(quot['discount_percent'] ?? 0),
        freightAmount: Number(quot['freight_amount'] ?? 0),
        insuranceAmount: Number(quot['insurance_amount'] ?? 0),
        warrantyTerms: quot['warranty_terms'],
        validityDate: quot['validity_date'],
        status: String(quot['status']),
        technicalScore: quot['technical_score'] ? Number(quot['technical_score']) : null,
        commercialScore: quot['commercial_score'] ? Number(quot['commercial_score']) : null,
        overallScore: quot['overall_score'] ? Number(quot['overall_score']) : null,
        rank: quot['rank'] ? Number(quot['rank']) : null,
        // Supplier performance
        supplierQualityRating: supplier['quality_rating'] ? Number(supplier['quality_rating']) : null,
        supplierDeliveryRating: supplier['delivery_rating'] ? Number(supplier['delivery_rating']) : null,
        supplierPriceRating: supplier['price_rating'] ? Number(supplier['price_rating']) : null,
        supplierOverallRating: supplier['overall_rating'] ? Number(supplier['overall_rating']) : null,
        supplierRiskLevel: String(supplier['risk_level'] ?? 'MEDIUM'),
        isPreferredSupplier: Boolean(supplier['is_preferred'] ?? false),
        onTimeDeliveryPct: supplier['on_time_delivery_pct'] ? Number(supplier['on_time_delivery_pct']) : null,
        // Computed
        isLowestPrice: index === 0, // quotations are ordered by grand_total ASC
        isBestValue: false, // computed below
      }
    })

    // Mark lowest price
    if (comparisons.length > 0) {
      comparisons[0]!.isLowestPrice = true

      // Calculate best value (weighted score: 50% price, 30% quality, 20% delivery)
      const minPrice = comparisons[0]!.grandTotal
      for (const c of comparisons) {
        const priceScore = minPrice > 0 ? (minPrice / c.grandTotal) * 100 : 100
        const qualityScore = (c.supplierQualityRating ?? 3) * 20 // 0-5 → 0-100
        const deliveryScore = c.onTimeDeliveryPct ?? 75
        c.commercialScore = c.commercialScore ?? Math.round(priceScore * 100) / 100
        c.technicalScore = c.technicalScore ?? Math.round(qualityScore * 100) / 100
        c.overallScore = c.overallScore ?? Math.round((priceScore * 0.5 + qualityScore * 0.3 + deliveryScore * 0.2) * 100) / 100
      }

      // Find best value (highest overall score)
      let bestIdx = 0
      for (let i = 1; i < comparisons.length; i++) {
        if ((comparisons[i]!.overallScore ?? 0) > (comparisons[bestIdx]!.overallScore ?? 0)) bestIdx = i
      }
      comparisons[bestIdx]!.isBestValue = true

      // Assign ranks
      const sorted = [...comparisons].sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0))
      sorted.forEach((c, i) => { c.rank = i + 1 })
    }

    return {
      rfqId,
      quotationCount: comparisons.length,
      lowestPriceQuotation: comparisons.find(c => c.isLowestPrice)?.quotationNumber ?? null,
      bestValueQuotation: comparisons.find(c => c.isBestValue)?.quotationNumber ?? null,
      comparisons,
    }
  },
}

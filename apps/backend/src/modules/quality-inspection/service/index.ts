/** Quality Inspection Service — Business logic for IQC, NCR, CAPA, Quality Holds */
import '@/modules/quality-inspection/workflow'
import '@/modules/quality-inspection/workflow/ncr'
import {
  inspectionPlanRepository, samplingPlanRepository, inspectionLotRepository,
  inspectionResultRepository, qualityHoldRepository, ncrRepository, capaRepository,
} from '../repository'
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

export const qualityInspectionService = {
  // ═══ Inspection Plans ═════════════════════════════════════════════════════

  async createPlan(data: { planCode: string; planName: string; productId?: string; productCategoryId?: string; inspectionType?: string; samplingPlanId?: string; aqlLevel?: string; inspectionCritical?: string; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const id = await inspectionPlanRepository.create({ tenantId, ...data, isActive: true })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'InspectionPlan', entityId: id, entityCode: data.planCode, after: data })
    return { id }
  },

  async getPlan(id: string) {
    const { tenantId } = getContext()
    const plan = await inspectionPlanRepository.findById(tenantId, id)
    if (!plan) throw new NotFoundError('InspectionPlan', id)
    return plan
  },

  async listPlans(params: { page?: number; pageSize?: number; search?: string } = {}) {
    const { tenantId } = getContext()
    return inspectionPlanRepository.list(tenantId, params)
  },

  // ═══ Sampling Plans ══════════════════════════════════════════════════════

  async createSamplingPlan(data: { planCode: string; planName: string; lotSizeMin: number; lotSizeMax: number; sampleSize: number; acceptNumber?: number; rejectNumber?: number; aqlLevel?: string; inspectionLevel?: string; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    // Business rule: lot_size_max must be > lot_size_min
    if (data.lotSizeMax <= data.lotSizeMin) {
      throw new BusinessRuleError('Lot size max must be greater than lot size min', { code: 'IQC.INVALID_LOT_RANGE' })
    }
    // Business rule: accept_number must be < reject_number
    if ((data.acceptNumber ?? 0) >= (data.rejectNumber ?? 1)) {
      throw new BusinessRuleError('Accept number must be less than reject number', { code: 'IQC.INVALID_ACCEPT_REJECT' })
    }
    const id = await samplingPlanRepository.create({ tenantId, ...data, isActive: true })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'SamplingPlan', entityId: id, entityCode: data.planCode, after: data })
    return { id }
  },

  async listSamplingPlans() {
    const { tenantId } = getContext()
    return samplingPlanRepository.list(tenantId)
  },

  /** Determine sample size using AQL sampling plan */
  async determineSampleSize(tenantId: string, lotQuantity: number): Promise<{ sampleSize: number; samplingPlan: Record<string, unknown> | null }> {
    const plan = await samplingPlanRepository.findForLotSize(tenantId, Math.ceil(lotQuantity))
    if (!plan) {
      // Default: 100% inspection for small lots, 10% for large
      const sampleSize = lotQuantity <= 10 ? Math.ceil(lotQuantity) : Math.ceil(lotQuantity * 0.1)
      return { sampleSize, samplingPlan: null }
    }
    return { sampleSize: Number(plan['sample_size']), samplingPlan: plan }
  },

  // ═══ Inspection Lots ═════════════════════════════════════════════════════

  async createInspectionLot(data: { grnId: string; grnLineId: string; productId: string; productSku: string; productName: string; batchNumber?: string; lotQuantity: number; planId?: string; remarks?: string }) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: lot quantity must be positive
    if (data.lotQuantity <= 0) {
      throw new BusinessRuleError('Lot quantity must be positive', { code: 'IQC.INVALID_LOT_QTY' })
    }

    // Determine sample size using AQL
    const { sampleSize, samplingPlan } = await this.determineSampleSize(tenantId, data.lotQuantity)

    // Get plan details if provided
    let planCode: string | undefined, aqlLevel: string | undefined
    if (data.planId) {
      const plan = await inspectionPlanRepository.findById(tenantId, data.planId)
      if (plan) {
        planCode = String(plan['plan_code'])
        aqlLevel = String(plan['aql_level'] ?? '2.5')
      }
    }
    if (!aqlLevel && samplingPlan) {
      aqlLevel = String(samplingPlan['aql_level'] ?? '2.5')
    }

    const lotNumber = await inspectionLotRepository.generateLotNumber(tenantId)

    const lot = await inspectionLotRepository.create({
      tenantId, lotNumber, grnId: data.grnId, grnLineId: data.grnLineId,
      productId: data.productId, productSku: data.productSku, productName: data.productName,
      batchNumber: data.batchNumber, lotQuantity: data.lotQuantity, sampleSize,
      planId: data.planId, planCode, aqlLevel,
      inspectionStatus: 'PENDING', inspectionType: 'IQC',
      remarks: data.remarks,
    })

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'CREATE', entityType: 'InspectionLot', entityId: String(lot!['id']), entityCode: lotNumber,
      after: { lotQuantity: data.lotQuantity, sampleSize, aqlLevel },
    })
    await eventBus.writeToOutbox({
      eventName: 'InspectionLotCreated', payload: { lotId: String(lot!['id']), lotNumber, grnId: data.grnId, sampleSize }, tenantId,
    })

    return lot
  },

  async getInspectionLot(id: string) {
    const { tenantId } = getContext()
    const lot = await inspectionLotRepository.findById(tenantId, id)
    if (!lot) throw new NotFoundError('InspectionLot', id)
    const results = await inspectionResultRepository.listForLot(tenantId, id)
    return { ...lot, results }
  },

  async listInspectionLots(params: { page?: number; pageSize?: number; search?: string; status?: string; grnId?: string } = {}) {
    const { tenantId } = getContext()
    return inspectionLotRepository.list(tenantId, params)
  },

  async startInspection(id: string, version: number) {
    return this.transitionInspection(id, 'IN_PROGRESS', version, { startedAt: new Date().toISOString() })
  },

  async recordResult(id: string, data: { parameterId?: string; parameterCode?: string; parameterName?: string; expectedValue?: string; actualValue: string; result: 'PASS' | 'FAIL' | 'CONDITIONAL'; remarks?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const lot = await inspectionLotRepository.findById(tenantId, id)
    if (!lot) throw new NotFoundError('InspectionLot', id)
    if (!['IN_PROGRESS', 'PENDING'].includes(String(lot['inspection_status']))) {
      throw new BusinessRuleError('Can only record results for PENDING or IN_PROGRESS lots', { code: 'IQC.NOT_IN_PROGRESS' })
    }

    const resultId = await inspectionResultRepository.create({
      tenantId, inspectionLotId: id, parameterId: data.parameterId, parameterCode: data.parameterCode,
      parameterName: data.parameterName, expectedValue: data.expectedValue, actualValue: data.actualValue,
      result: data.result, remarks: data.remarks, recordedBy: userId, recordedByName: ctx.userEmail,
    })

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'RESULT_RECORDED', entityType: 'InspectionLot', entityId: id, entityCode: String(lot['lot_number']),
      after: { resultId, result: data.result, actualValue: data.actualValue },
    })

    return { resultId }
  },

  async transitionInspection(id: string, targetStatus: string, version: number, options?: { startedAt?: string; results?: Array<{ pass: boolean; conditional?: boolean }>; rejectQty?: number; acceptQty?: number; disposition?: string; ncrReason?: string; remarks?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await inspectionLotRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('InspectionLot', id)

    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('InspectionLotLifecycle')
    const check = await machine.canTransition({ id, status: String(existing['inspection_status']), version: Number(existing['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'IQC.TRANSITION_DENIED' })

    const updateData: Record<string, unknown> = { inspectionStatus: targetStatus }
    if (options?.startedAt) {
      updateData.inspectorId = userId
      updateData.inspectorName = ctx.userEmail
      updateData.inspectionStartedAt = options.startedAt
    }
    if (['PASSED', 'CONDITIONAL_PASS', 'FAILED'].includes(targetStatus)) {
      updateData.inspectionCompletedAt = new Date().toISOString()
      updateData.result = targetStatus === 'PASSED' ? 'PASS' : targetStatus === 'FAILED' ? 'FAIL' : 'CONDITIONAL'
      updateData.disposition = options?.disposition ?? (targetStatus === 'PASSED' ? 'ACCEPT' : targetStatus === 'FAILED' ? 'REJECT' : 'USE_AS_IS')
      updateData.acceptQty = options?.acceptQty ?? Number(existing['lot_quantity'])
      updateData.rejectQty = options?.rejectQty ?? 0
    }
    if (options?.remarks) updateData.remarks = options.remarks

    const updated = await inspectionLotRepository.update(tenantId, id, updateData, version, userId)
    if (!updated) throw new ConcurrencyError('Inspection lot was modified by another transaction')

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'TRANSITION', entityType: 'InspectionLot', entityId: id, entityCode: String(existing['lot_number']),
      before: { status: existing['inspection_status'] }, after: { status: targetStatus },
    })

    // Fire events
    const eventMap: Record<string, string> = {
      PASSED: 'InspectionPassed',
      CONDITIONAL_PASS: 'InspectionConditionalPass',
      FAILED: 'InspectionFailed',
      ON_HOLD: 'InspectionOnHold',
    }
    if (eventMap[targetStatus]) {
      await eventBus.writeToOutbox({
        eventName: eventMap[targetStatus], payload: { lotId: id, lotNumber: String(existing['lot_number']), status: targetStatus, grnId: String(existing['grn_id']) }, tenantId,
      })
    }

    // If failed, auto-create NCR + Quality Hold
    if (targetStatus === 'FAILED') {
      await this.createQualityHold({
        sourceId: id, sourceType: 'INSPECTION_LOT',
        productId: String(existing['product_id']), productSku: String(existing['product_sku']),
        batchNumber: existing['batch_number'] ? String(existing['batch_number']) : undefined,
        heldQty: Number(existing['lot_quantity']),
        holdReason: options?.ncrReason ?? 'Inspection failed',
        holdLocation: 'IQC_HOLD_AREA',
      })

      await this.createNcr({
        sourceId: id, sourceType: 'INSPECTION_LOT',
        productId: String(existing['product_id']), productSku: String(existing['product_sku']), productName: String(existing['product_name']),
        batchNumber: existing['batch_number'] ? String(existing['batch_number']) : undefined,
        grnId: String(existing['grn_id']),
        nonConformance: options?.ncrReason ?? 'Material failed incoming quality inspection',
        nonConformanceType: 'QUALITY',
        severity: 'MAJOR',
        defectQty: Number(existing['lot_quantity']),
        disposition: 'RETURN_TO_SUPPLIER',
      })
    }

    return updated
  },

  // ═══ Quality Holds ═══════════════════════════════════════════════════════

  async createQualityHold(data: { sourceId?: string; sourceType?: string; productId: string; productSku: string; batchNumber?: string; lotNumber?: string; heldQty: number; holdReason: string; holdLocation?: string }) {
    const { tenantId, userId, ctx } = getContext()
    if (data.heldQty <= 0) throw new BusinessRuleError('Held quantity must be positive', { code: 'QH.INVALID_QTY' })

    const holdNumber = await qualityHoldRepository.generateHoldNumber(tenantId)
    const id = await qualityHoldRepository.create({
      tenantId, holdNumber, holdType: 'IQC', sourceId: data.sourceId, sourceType: data.sourceType,
      productId: data.productId, productSku: data.productSku, batchNumber: data.batchNumber, lotNumber: data.lotNumber,
      heldQty: data.heldQty, holdReason: data.holdReason, holdLocation: data.holdLocation ?? 'QUALITY_HOLD',
      heldBy: userId, heldByName: ctx.userEmail, status: 'ACTIVE',
    })

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'QUALITY_HOLD', entityType: 'QualityHold', entityId: id, entityCode: holdNumber, after: data,
    })
    await eventBus.writeToOutbox({
      eventName: 'QualityHoldCreated', payload: { holdId: id, holdNumber, productId: data.productId, heldQty: data.heldQty }, tenantId,
    })

    return { id, holdNumber }
  },

  async listQualityHolds(params: { page?: number; pageSize?: number; status?: string } = {}) {
    const { tenantId } = getContext()
    return qualityHoldRepository.list(tenantId, params)
  },

  async releaseQualityHold(id: string, releaseReason: string, disposition: string) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await qualityHoldRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('QualityHold', id)
    const released = await qualityHoldRepository.release(tenantId, id, userId, ctx.userEmail ?? '', releaseReason, disposition)
    if (!released) throw new BusinessRuleError('Hold is not active or already released', { code: 'QH.NOT_ACTIVE' })
    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'QUALITY_HOLD_RELEASED', entityType: 'QualityHold', entityId: id, entityCode: String(existing['hold_number']),
      after: { releaseReason, disposition },
    })
    await eventBus.writeToOutbox({
      eventName: 'QualityHoldReleased', payload: { holdId: id, disposition }, tenantId,
    })
    return released
  },

  // ═══ NCR ═════════════════════════════════════════════════════════════════

  async createNcr(data: {
    sourceId?: string; sourceType?: string
    productId: string; productSku: string; productName: string
    batchNumber?: string; lotNumber?: string
    supplierId?: string; supplierName?: string
    grnId?: string; grnNumber?: string
    nonConformance: string; nonConformanceType?: string
    severity?: string; defectQty?: number; disposition?: string
  }) {
    const { tenantId, userId, ctx } = getContext()
    const ncrNumber = await ncrRepository.generateNcrNumber(tenantId)
    const ncr = await ncrRepository.create({
      tenantId, ncrNumber, ncrType: 'IQC', sourceId: data.sourceId, sourceType: data.sourceType,
      productId: data.productId, productSku: data.productSku, productName: data.productName,
      batchNumber: data.batchNumber, lotNumber: data.lotNumber,
      supplierId: data.supplierId, supplierName: data.supplierName,
      grnId: data.grnId, grnNumber: data.grnNumber,
      nonConformance: data.nonConformance, nonConformanceType: data.nonConformanceType ?? 'QUALITY',
      severity: data.severity ?? 'MAJOR', defectQty: data.defectQty ?? 0,
      disposition: data.disposition ?? 'RETURN_TO_SUPPLIER',
      status: 'OPEN', raisedBy: userId, raisedByName: ctx.userEmail,
    })

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'NCR_CREATED', entityType: 'NCR', entityId: String(ncr!['id']), entityCode: ncrNumber, after: data,
    })
    await eventBus.writeToOutbox({
      eventName: 'NCR_CREATED', payload: { ncrId: String(ncr!['id']), ncrNumber, productId: data.productId }, tenantId,
    })

    return ncr
  },

  async getNcr(id: string) {
    const { tenantId } = getContext()
    const ncr = await ncrRepository.findById(tenantId, id)
    if (!ncr) throw new NotFoundError('NCR', id)
    return ncr
  },

  async listNcrs(params: { page?: number; pageSize?: number; search?: string; status?: string } = {}) {
    const { tenantId } = getContext()
    return ncrRepository.list(tenantId, params)
  },

  async transitionNcr(id: string, targetStatus: string, version: number, options?: { rootCause?: string; closureNotes?: string; capaId?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await ncrRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('NCR', id)

    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('NCRLifecycle')
    const check = await machine.canTransition({ id, status: String(existing['status']), version: Number(existing['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'NCR.TRANSITION_DENIED' })

    const updateData: Record<string, unknown> = { status: targetStatus }
    if (options?.rootCause) updateData.rootCause = options.rootCause
    if (options?.closureNotes) {
      updateData.closureNotes = options.closureNotes
      updateData.closedBy = userId
      updateData.closedByName = ctx.userEmail
      updateData.closedAt = new Date().toISOString()
    }
    if (options?.capaId) updateData.capaId = options.capaId

    const updated = await ncrRepository.update(tenantId, id, updateData, version, userId)
    if (!updated) throw new ConcurrencyError('NCR was modified by another transaction')

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'NCR_TRANSITION', entityType: 'NCR', entityId: id, entityCode: String(existing['ncr_number']),
      before: { status: existing['status'] }, after: { status: targetStatus },
    })

    if (targetStatus === 'CLOSED') {
      await eventBus.writeToOutbox({
        eventName: 'NCR_CLOSED', payload: { ncrId: id, ncrNumber: String(existing['ncr_number']) }, tenantId,
      })
    }

    return updated
  },

  // ═══ CAPA ════════════════════════════════════════════════════════════════

  async createCapa(data: { ncrId?: string; ncrNumber?: string; correctiveAction: string; preventiveAction: string; actionOwner?: string; actionOwnerName?: string; targetDate?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const capaNumber = await capaRepository.generateCapaNumber(tenantId)
    const capa = await capaRepository.create({
      tenantId, capaNumber, ncrId: data.ncrId, ncrNumber: data.ncrNumber,
      correctiveAction: data.correctiveAction, preventiveAction: data.preventiveAction,
      actionOwner: data.actionOwner, actionOwnerName: data.actionOwnerName, targetDate: data.targetDate,
      status: 'OPEN',
    })

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'CAPA_CREATED', entityType: 'CAPA', entityId: String(capa!['id']), entityCode: capaNumber, after: data,
    })

    return capa
  },

  async listCapas(params: { page?: number; pageSize?: number; status?: string } = {}) {
    const { tenantId } = getContext()
    return capaRepository.list(tenantId, params)
  },
}

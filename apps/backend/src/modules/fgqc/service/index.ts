/** FGQC Service — Finished goods QC, release decision, COA, shelf life */
import '@/modules/fgqc/workflow'
import { fgqcLotRepository, fgqcTestResultRepository, fgqcHoldRepository, coaRepository, shelfLifeRepository } from '../repository'
import { workflowRegistry } from '@/core/workflow'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { BusinessRuleError, NotFoundError, AuthorizationError } from '@/core/errors'
import { enforceNotBreakGlass, enforceTenantIsolation } from '@/core/security/sod-enforcement'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx }
}

export const fgqcService = {
  async createInspectionLot(data: {
    productionBatchId?: string; productionBatchNumber?: string
    productionOrderId?: string; productionOrderNumber?: string
    productId: string; productSku?: string; productName?: string
    batchQuantity: number; sampleSize: number
    uomId?: string; uomCode?: string
    inspectionPlanId?: string; inspectionPlanCode?: string
    shelfLifeDays?: number; remarks?: string
  }) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: sample size must be ≤ batch quantity
    if (data.sampleSize > data.batchQuantity) {
      throw new BusinessRuleError('Sample size cannot exceed batch quantity', { code: 'FGQC.INVALID_SAMPLE_SIZE' })
    }

    // Business rule: sample size must be positive
    if (data.sampleSize <= 0) {
      throw new BusinessRuleError('Sample size must be positive', { code: 'FGQC.INVALID_SAMPLE_SIZE' })
    }

    const lotNumber = await fgqcLotRepository.generateLotNumber(tenantId)

    // Calculate expiry date from shelf life days
    let expiryDate: string | undefined
    if (data.shelfLifeDays) {
      const exp = new Date()
      exp.setDate(exp.getDate() + data.shelfLifeDays)
      expiryDate = exp.toISOString()
    }

    const lot = await fgqcLotRepository.create({
      tenantId, lotNumber,
      productionBatchId: data.productionBatchId, productionBatchNumber: data.productionBatchNumber,
      productionOrderId: data.productionOrderId, productionOrderNumber: data.productionOrderNumber,
      productId: data.productId, productSku: data.productSku, productName: data.productName,
      batchQuantity: data.batchQuantity, sampleSize: data.sampleSize,
      uomId: data.uomId, uomCode: data.uomCode,
      inspectionPlanId: data.inspectionPlanId, inspectionPlanCode: data.inspectionPlanCode,
      inspectionStatus: 'PENDING',
      shelfLifeDays: data.shelfLifeDays, expiryDate,
      remarks: data.remarks,
    })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'FGQC_LOT_CREATED', entityType: 'FGQCInspectionLot', entityId: String(lot!['id']), entityCode: lotNumber, after: data })
    await eventBus.writeToOutbox({ eventName: 'FGQCLotCreated', payload: { lotId: String(lot!['id']), lotNumber, productId: data.productId }, tenantId })

    return lot
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const lot = await fgqcLotRepository.findById(tenantId, id)
    if (!lot) throw new NotFoundError('FGQCInspectionLot', id)
    const testResults = await fgqcTestResultRepository.listForLot(tenantId, id)
    return { ...lot, testResults }
  },

  async list(params: { page?: number; pageSize?: number; status?: string; productionBatchId?: string; search?: string } = {}) {
    const { tenantId } = getContext()
    return fgqcLotRepository.list(tenantId, params)
  },

  async recordTestResult(id: string, data: { testCategory: string; testCode?: string; testName: string; testType?: string; specification?: string; minValue?: string; maxValue?: string; targetValue?: string; actualValue: string; unit?: string; result: 'PASS' | 'FAIL' | 'CONDITIONAL'; method?: string; equipment?: string; remarks?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await fgqcLotRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('FGQCInspectionLot', id)
    if (!['IN_PROGRESS', 'PENDING'].includes(String(existing['inspection_status']))) {
      throw new BusinessRuleError('Can only record results for PENDING or IN_PROGRESS lots', { code: 'FGQC.NOT_IN_PROGRESS' })
    }

    const resultId = await fgqcTestResultRepository.create({
      tenantId, inspectionLotId: id,
      testCategory: data.testCategory, testCode: data.testCode, testName: data.testName, testType: data.testType,
      specification: data.specification, minValue: data.minValue, maxValue: data.maxValue, targetValue: data.targetValue,
      actualValue: data.actualValue, unit: data.unit, result: data.result,
      method: data.method, equipment: data.equipment,
      testedBy: userId, testedByName: ctx.userEmail,
      remarks: data.remarks,
    })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'FGQC_RESULT_RECORDED', entityType: 'FGQCInspectionLot', entityId: id, entityCode: String(existing['lot_number']), after: { testCategory: data.testCategory, result: data.result } })

    return { resultId }
  },

  async transition(id: string, targetStatus: string, version: number) {
    // Phase 1: Security enforcement
    enforceNotBreakGlass('transition')

    const { tenantId, userId, ctx } = getContext()
    const existing = await fgqcLotRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('FGQCInspectionLot', id)

    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('FGQCLifecycle')
    const check = await machine.canTransition({ id, status: String(existing['inspection_status']), version: Number(existing['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'FGQC.TRANSITION_DENIED' })

    const updateData: Record<string, unknown> = { inspectionStatus: targetStatus }
    if (targetStatus === 'IN_PROGRESS') {
      updateData.inspectorId = userId
      updateData.inspectorName = ctx.userEmail
      updateData.inspectionStartedAt = new Date().toISOString()
    }
    if (['PASSED', 'CONDITIONAL_PASS', 'FAILED'].includes(targetStatus)) {
      updateData.inspectionCompletedAt = new Date().toISOString()
      updateData.result = targetStatus === 'PASSED' ? 'PASS' : targetStatus === 'FAILED' ? 'FAIL' : 'CONDITIONAL'
      updateData.disposition = targetStatus === 'PASSED' ? 'ACCEPT' : targetStatus === 'FAILED' ? 'REJECT' : 'USE_AS_IS'
    }

    const updated = await fgqcLotRepository.update(tenantId, id, updateData, version)
    if (!updated) throw new BusinessRuleError('Lot was modified by another transaction', { code: 'FGQC.CONCURRENCY' })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'FGQC_TRANSITION', entityType: 'FGQCInspectionLot', entityId: id, entityCode: String(existing['lot_number']), before: { status: existing['inspection_status'] }, after: { status: targetStatus } })

    const eventMap: Record<string, string> = {
      PASSED: 'FGQCPassed', CONDITIONAL_PASS: 'FGQCConditionalPass',
      FAILED: 'FGQCFailed', ON_HOLD: 'FGQCHold',
    }
    if (eventMap[targetStatus]) {
      await eventBus.writeToOutbox({ eventName: eventMap[targetStatus], payload: { lotId: id, lotNumber: String(existing['lot_number']), status: targetStatus }, tenantId })
    }

    // Business rule: If FAILED, create FGQC hold + prevent inventory release
    if (targetStatus === 'FAILED') {
      const holdNumber = await fgqcHoldRepository.generateHoldNumber(tenantId)
      await fgqcHoldRepository.create({
        tenantId, holdNumber, inspectionLotId: id,
        productionBatchId: existing['production_batch_id'], productionBatchNumber: existing['production_batch_number'],
        productId: existing['product_id'], productSku: existing['product_sku'],
        heldQty: Number(existing['batch_quantity']),
        holdReason: 'FGQC inspection failed', holdType: 'FGQC',
        heldBy: userId, heldByName: ctx.userEmail, status: 'ACTIVE',
      })
      await eventBus.writeToOutbox({ eventName: 'FGQCHoldCreated', payload: { holdNumber, lotId: id, reason: 'FGQC failed' }, tenantId })
    }

    return updated
  },

  /** Release Decision — accept, conditional release, or reject finished goods */
  async releaseDecision(id: string, data: { decision: 'RELEASE' | 'CONDITIONAL_RELEASE' | 'REJECT'; notes?: string; rejectReason?: string; version: number }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await fgqcLotRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('FGQCInspectionLot', id)

    // Business rule: Finished goods cannot enter inventory until FGQC release
    if (!['PASSED', 'CONDITIONAL_PASS'].includes(String(existing['inspection_status']))) {
      throw new BusinessRuleError('Can only release lots that have PASSED or CONDITIONAL_PASS status', { code: 'FGQC.NOT_PASSED' })
    }

    const updateData: Record<string, unknown> = {
      releaseDecision: data.decision,
      releaseNotes: data.notes,
      releasedBy: userId, releasedByName: ctx.userEmail, releasedAt: new Date().toISOString(),
    }
    if (data.decision === 'REJECT') {
      updateData.rejectReason = data.rejectReason
      updateData.inspectionStatus = 'FAILED'
    }

    const updated = await fgqcLotRepository.update(tenantId, id, updateData, data.version)
    if (!updated) throw new BusinessRuleError('Lot was modified by another transaction', { code: 'FGQC.CONCURRENCY' })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'FGQC_RELEASE_DECISION', entityType: 'FGQCInspectionLot', entityId: id, entityCode: String(existing['lot_number']), after: data })

    const eventName = data.decision === 'RELEASE' ? 'FGQCReleased' : data.decision === 'CONDITIONAL_RELEASE' ? 'FGQCConditionalRelease' : 'FGQCRejected'
    await eventBus.writeToOutbox({ eventName, payload: { lotId: id, lotNumber: String(existing['lot_number']), decision: data.decision, productionBatchId: String(existing['production_batch_id'] ?? '') }, tenantId })

    return updated
  },

  // ═══ COA (Certificate of Analysis) ════════════════════════════════════════

  async createCoa(data: {
    inspectionLotId?: string; productionBatchId?: string; productionBatchNumber?: string
    productId: string; productSku?: string; productName?: string
    batchNumber?: string; manufactureDate?: string; expiryDate?: string
    quantity?: number; uomCode?: string
    customerId?: string; customerName?: string
    remarks?: string
  }) {
    const { tenantId, userId, ctx } = getContext()
    const coaNumber = await coaRepository.generateCoaNumber(tenantId)

    // Build test summary from FGQC test results if lot is provided
    let testSummary: Record<string, unknown> | undefined
    let overallResult = 'PASS'
    if (data.inspectionLotId) {
      const testResults = await fgqcTestResultRepository.listForLot(tenantId, data.inspectionLotId)
      testSummary = { results: testResults }
      overallResult = testResults.some((t: Record<string, unknown>) => t['result'] === 'FAIL') ? 'FAIL' : 'PASS'
    }

    const coa = await coaRepository.create({
      tenantId, coaNumber,
      inspectionLotId: data.inspectionLotId, productionBatchId: data.productionBatchId, productionBatchNumber: data.productionBatchNumber,
      productId: data.productId, productSku: data.productSku, productName: data.productName,
      batchNumber: data.batchNumber, manufactureDate: data.manufactureDate, expiryDate: data.expiryDate,
      quantity: data.quantity, uomCode: data.uomCode,
      customerId: data.customerId, customerName: data.customerName,
      testSummary: testSummary ? JSON.stringify(testSummary) : null, overallResult,
      status: 'DRAFT',
      preparedBy: userId, preparedByName: ctx.userEmail,
      remarks: data.remarks,
    })

    // Link COA to FGQC lot
    if (data.inspectionLotId) {
      await fgqcLotRepository.update(tenantId, data.inspectionLotId, { coaId: String(coa!['id']), coaNumber }, 0)
    }

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'COA_CREATED', entityType: 'COA', entityId: String(coa!['id']), entityCode: coaNumber, after: data })
    await eventBus.writeToOutbox({ eventName: 'COACreated', payload: { coaId: String(coa!['id']), coaNumber, productId: data.productId }, tenantId })

    return coa
  },

  async listCoas(params: { page?: number; pageSize?: number; status?: string; productId?: string } = {}) {
    const { tenantId } = getContext()
    return coaRepository.list(tenantId, params)
  },

  async signCoa(id: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await coaRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('COA', id)
    if (String(existing['status']) === 'SIGNED') {
      throw new BusinessRuleError('COA is already signed', { code: 'FGQC.COA_ALREADY_SIGNED' })
    }
    const updated = await coaRepository.update(tenantId, id, {
      status: 'SIGNED', signedBy: userId, signedByName: ctx.userEmail, signedAt: new Date().toISOString(),
    }, version)
    if (!updated) throw new BusinessRuleError('COA was modified by another transaction', { code: 'FGQC.COA_CONCURRENCY' })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'COA_SIGNED', entityType: 'COA', entityId: id, entityCode: String(existing['coa_number']) })
    return updated
  },

  // ═══ Shelf Life ═══════════════════════════════════════════════════════════

  async adjustShelfLife(data: {
    productId: string; productSku?: string; productName?: string
    productionBatchId?: string; productionBatchNumber?: string
    manufactureDate?: string; originalExpiryDate?: string
    adjustedExpiryDate: string; shelfLifeDays?: number; adjustmentReason: string
    remarks?: string
  }) {
    const { tenantId, userId, ctx } = getContext()
    const id = await shelfLifeRepository.create({
      tenantId, ...data,
      adjustedBy: userId, adjustedByName: ctx.userEmail,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'SHELF_LIFE_ADJUSTED', entityType: 'ShelfLifeRecord', entityId: id, after: data })
    return { id }
  },

  async listShelfLife(params: { page?: number; pageSize?: number; productId?: string } = {}) {
    const { tenantId } = getContext()
    return shelfLifeRepository.list(tenantId, params)
  },
}

/** COA Management Service — Templates, lab results, approvals, digital signature, QR verification, versioning */
import '@/modules/coa-management/workflow'
import { coaTemplateRepository, coaLabResultRepository, coaApprovalRepository, coaVersionRepository } from '../repository'
import { workflowRegistry } from '@/core/workflow'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'
import { BusinessRuleError, NotFoundError, AuthorizationError } from '@/core/errors'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx }
}

export const coaManagementService = {
  // ═══ COA Templates ════════════════════════════════════════════════════════

  async createTemplate(data: { templateCode: string; templateName: string; productId?: string; productSku?: string; productName?: string; templateType?: string; headerText?: string; footerText?: string; includesMicrobiology?: boolean; includesChemical?: boolean; includesPhysical?: boolean; description?: string; layoutConfig?: Record<string, unknown> }) {
    const { tenantId, userId, ctx } = getContext()
    const template = await coaTemplateRepository.create({ tenantId, ...data, isActive: true })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'COA_TEMPLATE_CREATED', entityType: 'COATemplate', entityId: String(template!['id']), entityCode: data.templateCode, after: data })
    return template
  },

  async listTemplates(params: { page?: number; pageSize?: number; productId?: string } = {}) {
    const { tenantId } = getContext()
    return coaTemplateRepository.list(tenantId, params)
  },

  // ═══ COA Transition ═══════════════════════════════════════════════════════

  async transitionCoa(id: string, targetStatus: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await query(`SELECT * FROM coa_records WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    if (existing.rows.length === 0) throw new NotFoundError('COA', id)
    const coa = existing.rows[0]!

    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('COALifecycle')
    const check = await machine.canTransition({ id, status: String(coa['status']), version: Number(coa['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'COA.TRANSITION_DENIED' })

    // Business rule: No COA generation until FGQC release
    if (targetStatus === 'PENDING_APPROVAL') {
      const fgqcResult = await query(`SELECT inspection_status FROM fgqc_inspection_lots WHERE tenant_id = $1 AND coa_id = $2 AND deleted_at IS NULL`, [tenantId, id])
      if (fgqcResult.rows.length > 0) {
        const fgqcStatus = String(fgqcResult.rows[0]!['inspection_status'])
        if (!['PASSED', 'CONDITIONAL_PASS'].includes(fgqcStatus)) {
          throw new BusinessRuleError(`Cannot generate COA: FGQC status is ${fgqcStatus} (must be PASSED)`, { code: 'COA.FGQC_NOT_PASSED' })
        }
      }
    }

    const result = await query(`UPDATE coa_records SET status = $3, version = version + 1, updated_at = NOW(), updated_by = $4 WHERE tenant_id = $1 AND id = $2 AND version = $5 AND deleted_at IS NULL RETURNING *`, [tenantId, id, targetStatus, userId, version])
    if (result.rows.length === 0) throw new BusinessRuleError('COA was modified by another transaction', { code: 'COA.CONCURRENCY' })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'COA_TRANSITION', entityType: 'COA', entityId: id, entityCode: String(coa['coa_number']), before: { status: coa['status'] }, after: { status: targetStatus } })

    if (targetStatus === 'SIGNED') {
      await eventBus.writeToOutbox({ eventName: 'COASigned', payload: { coaId: id, coaNumber: String(coa['coa_number']) }, tenantId })
    }

    return result.rows[0]
  },

  // ═══ Lab Results ══════════════════════════════════════════════════════════

  async addLabResult(coaId: string, data: { testCategory: string; parameterName: string; specification?: string; actualValue: string; minValue?: string; maxValue?: string; targetValue?: string; unit?: string; result?: string; testMethod?: string; equipment?: string; remarks?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const id = await coaLabResultRepository.create({
      tenantId, coaId, testCategory: data.testCategory, parameterName: data.parameterName,
      specification: data.specification, actualValue: data.actualValue,
      minValue: data.minValue, maxValue: data.maxValue, targetValue: data.targetValue,
      unit: data.unit, result: data.result ?? 'PASS', testMethod: data.testMethod, equipment: data.equipment,
      testedBy: userId, testedByName: ctx.userEmail, remarks: data.remarks,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'COA_LAB_RESULT_ADDED', entityType: 'COA', entityId: coaId, after: { labResultId: id, testCategory: data.testCategory, result: data.result } })
    return { id }
  },

  async listLabResults(coaId: string) {
    const { tenantId } = getContext()
    return coaLabResultRepository.listForCoa(tenantId, coaId)
  },

  // ═══ Approvals (Digital Signature + QR Verification) ══════════════════════

  async addApproval(coaId: string, data: { approvalLevel: string; approverRole?: string; approvalStatus: string; approvalNotes?: string }) {
    const { tenantId, userId, ctx } = getContext()

    // Generate QR verification code
    const qrCode = `QR-COA-${coaId}-${Date.now()}-${randomUUID().slice(0, 8)}`
    // Generate digital signature placeholder
    const digitalSignature = `SIG-${userId}-${Date.now()}`

    const id = await coaApprovalRepository.create({
      tenantId, coaId, approvalLevel: data.approvalLevel,
      approverId: userId, approverName: ctx.userEmail, approverRole: data.approverRole,
      approvalStatus: data.approvalStatus, approvalDate: new Date().toISOString(),
      approvalNotes: data.approvalNotes, digitalSignature, qrVerificationCode: qrCode,
    })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'COA_APPROVAL', entityType: 'COA', entityId: coaId, after: { approvalId: id, approvalLevel: data.approvalLevel, status: data.approvalStatus } })

    return { id, qrVerificationCode: qrCode, digitalSignature }
  },

  async listApprovals(coaId: string) {
    const { tenantId } = getContext()
    return coaApprovalRepository.listForCoa(tenantId, coaId)
  },

  /** QR Verification — verify a COA by its QR code */
  async verifyByQr(qrCode: string) {
    const { tenantId } = getContext()
    const result = await query(`SELECT ca.*, cr.coa_number, cr.product_name, cr.batch_number, cr.overall_result FROM coa_approvals ca JOIN coa_records cr ON ca.coa_id = cr.id WHERE ca.tenant_id = $1 AND ca.qr_verification_code = $2 AND cr.deleted_at IS NULL`, [tenantId, qrCode])
    if (result.rows.length === 0) throw new NotFoundError('COA QR Verification', qrCode)
    return result.rows[0]
  },

  // ═══ Versioning ═══════════════════════════════════════════════════════════

  async createVersion(coaId: string, data: { versionReason: string }) {
    const { tenantId, userId, ctx } = getContext()

    // Get current COA with all related data
    const coaResult = await query(`SELECT * FROM coa_records WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, coaId])
    if (coaResult.rows.length === 0) throw new NotFoundError('COA', coaId)
    const coa = coaResult.rows[0]!

    const labResults = await coaLabResultRepository.listForCoa(tenantId, coaId)
    const approvals = await coaApprovalRepository.listForCoa(tenantId, coaId)

    // Get current max version number
    const versionsResult = await query<{ max_ver: string }>(`SELECT COALESCE(MAX(version_number), 0) as max_ver FROM coa_versions WHERE tenant_id = $1 AND coa_id = $2`, [tenantId, coaId])
    const newVersionNumber = Number(versionsResult.rows[0]!.max_ver) + 1

    const snapshot = { coa, labResults, approvals }

    const id = await coaVersionRepository.create({
      tenantId, coaId, versionNumber: newVersionNumber, versionReason: data.versionReason,
      snapshot, createdBy: userId, createdByName: ctx.userEmail,
    })

    // Mark current COA as superseded
    await query(`UPDATE coa_records SET status = 'SUPERSEDED', updated_at = NOW() WHERE tenant_id = $1 AND id = $2`, [tenantId, coaId])

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'COA_VERSIONED', entityType: 'COA', entityId: coaId, entityCode: String(coa['coa_number']), after: { versionNumber: newVersionNumber, versionId: id } })

    return { id, versionNumber: newVersionNumber }
  },

  async listVersions(coaId: string) {
    const { tenantId } = getContext()
    return coaVersionRepository.listForCoa(tenantId, coaId)
  },

  /** Generate COA PDF data (structured for PDF rendering) */
  async generatePdf(id: string) {
    const { tenantId } = getContext()
    const coaResult = await query(`SELECT * FROM coa_records WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    if (coaResult.rows.length === 0) throw new NotFoundError('COA', id)
    const coa = coaResult.rows[0]!

    const [labResults, approvals] = await Promise.all([
      coaLabResultRepository.listForCoa(tenantId, id),
      coaApprovalRepository.listForCoa(tenantId, id),
    ])

    return {
      documentType: 'CERTIFICATE_OF_ANALYSIS',
      coaNumber: String(coa['coa_number']),
      coaDate: String(coa['coa_date']),
      product: { id: coa['product_id'], sku: coa['product_sku'], name: coa['product_name'] },
      batch: { number: coa['batch_number'], manufactureDate: coa['manufacture_date'], expiryDate: coa['expiry_date'] },
      quantity: coa['quantity'], uomCode: coa['uom_code'],
      customer: { id: coa['customer_id'], name: coa['customer_name'] },
      overallResult: coa['overall_result'],
      labResults: labResults.map((r: Record<string, unknown>) => ({
        category: r['test_category'], parameter: r['parameter_name'],
        specification: r['specification'], actual: r['actual_value'],
        unit: r['unit'], result: r['result'],
      })),
      approvals: approvals.map((a: Record<string, unknown>) => ({
        level: a['approval_level'], approver: a['approver_name'],
        status: a['approval_status'], date: a['approval_date'],
        digitalSignature: a['digital_signature'],
      })),
      qrVerificationCode: approvals[0]?.['qr_verification_code'] ?? null,
      signaturePlaceholder: true,
      generatedAt: new Date().toISOString(),
    }
  },
}

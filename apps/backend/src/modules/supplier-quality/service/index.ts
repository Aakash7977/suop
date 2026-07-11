/** Supplier Quality Service — Audits, scorecards (auto-update), complaints, certifications, risk rating */
import { supplierAuditRepository, supplierScorecardRepository, supplierComplaintRepository, supplierCertificationRepository, supplierRiskAssessmentRepository } from '../repository'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { query } from '@/core/db/pglite'
import { NotFoundError, AuthorizationError } from '@/core/errors'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx }
}

export const supplierQualityService = {
  // ═══ Audits ═══════════════════════════════════════════════════════════════

  async createAudit(data: {
    supplierId: string; supplierCode: string; supplierName: string
    auditType?: string; auditScope?: string; leadAuditor?: string; leadAuditorName?: string
    auditStartDate?: string; auditEndDate?: string
    overallScore?: number; maxScore?: number; auditResult?: string
    findingsCount?: number; criticalFindings?: number; majorFindings?: number; minorFindings?: number
    status?: string; reportUrl?: string; remarks?: string
  }) {
    const { tenantId, userId, ctx } = getContext()
    const auditNumber = await supplierAuditRepository.generateAuditNumber(tenantId)
    const audit = await supplierAuditRepository.create({
      tenantId, auditNumber, ...data, status: data.status ?? 'PLANNED', maxScore: data.maxScore ?? 100,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'SUPPLIER_AUDIT_CREATED', entityType: 'SupplierAudit', entityId: String(audit!['id']), entityCode: auditNumber, after: data })
    return audit
  },

  async listAudits(params: { page?: number; pageSize?: number; supplierId?: string; status?: string } = {}) {
    const { tenantId } = getContext()
    return supplierAuditRepository.list(tenantId, params)
  },

  // ═══ Scorecards (auto-update from IQC and NCR data) ════════════════════════

  async autoUpdateScorecard(supplierId: string, period: string) {
    const { tenantId, userId, ctx } = getContext()

    // Get supplier details
    const suppResult = await query(`SELECT id, supplier_code, supplier_name, quality_rating, delivery_rating, price_rating, overall_rating, on_time_delivery_pct FROM suppliers WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, supplierId])
    if (suppResult.rows.length === 0) throw new NotFoundError('Supplier', supplierId)
    const supp = suppResult.rows[0]!

    // Calculate IQC pass rate from inspection lots linked to this supplier's GRNs
    const iqcResult = await query<{ total: string; passed: string }>(`SELECT COUNT(*) as total, COUNT(CASE WHEN il.inspection_status = 'PASSED' THEN 1 END) as passed FROM inspection_lots il JOIN goods_receipts gr ON il.grn_id = gr.id WHERE gr.tenant_id = $1 AND gr.supplier_id = $2 AND il.deleted_at IS NULL AND il.lot_date >= DATE_TRUNC('month', NOW())`, [tenantId, supplierId])
    const iqcTotal = Number(iqcResult.rows[0]?.['total'] ?? 0)
    const iqcPassed = Number(iqcResult.rows[0]?.['passed'] ?? 0)
    const iqcPassRate = iqcTotal > 0 ? Math.round((iqcPassed / iqcTotal) * 10000) / 100 : 100

    // Count NCRs for this supplier
    const ncrResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM ncrs WHERE tenant_id = $1 AND supplier_id = $2 AND deleted_at IS NULL AND ncr_date >= DATE_TRUNC('month', NOW())`, [tenantId, supplierId])
    const ncrCount = Number(ncrResult.rows[0]?.['cnt'] ?? 0)

    // Calculate ratings (0-5 scale)
    const qualityRating = Math.max(0, 5 - (ncrCount * 0.5))
    const deliveryRating = Number(supp['on_time_delivery_pct'] ?? 75) / 20 // 0-100 → 0-5
    const priceRating = Number(supp['price_rating'] ?? 3)
    const serviceRating = Number(supp['overall_rating'] ?? 3)
    const overallRating = Math.round(((qualityRating + deliveryRating + priceRating + serviceRating) / 4) * 100) / 100

    // Determine grade
    let overallGrade = 'C'
    if (overallRating >= 4.5) overallGrade = 'A+'
    else if (overallRating >= 4.0) overallGrade = 'A'
    else if (overallRating >= 3.5) overallGrade = 'B+'
    else if (overallRating >= 3.0) overallGrade = 'B'
    else if (overallRating >= 2.0) overallGrade = 'C'
    else overallGrade = 'D'

    // Determine risk level
    let riskLevel = 'MEDIUM'
    if (overallRating >= 4.0 && ncrCount <= 1) riskLevel = 'LOW'
    else if (overallRating < 2.0 || ncrCount >= 5) riskLevel = 'HIGH'

    // Defect rate in PPM (simplified: NCRs per 1000 units)
    const defectRatePpm = iqcTotal > 0 ? Math.round((ncrCount / iqcTotal) * 1000000) : 0

    const periodStart = new Date(); periodStart.setDate(1)
    const periodEnd = new Date()

    await supplierScorecardRepository.upsert({
      tenantId, supplierId, supplierCode: supp['supplier_code'], supplierName: supp['supplier_name'],
      period, periodStart: periodStart.toISOString().split('T')[0], periodEnd: periodEnd.toISOString().split('T')[0],
      qualityRating: Math.round(qualityRating * 100) / 100,
      deliveryRating: Math.round(deliveryRating * 100) / 100,
      priceRating, serviceRating,
      overallRating, overallGrade,
      iqcPassRate, ncrCount,
      onTimeDeliveryPct: Number(supp['on_time_delivery_pct'] ?? 75),
      defectRatePpm, riskLevel,
      trend: overallRating >= 3.5 ? 'UP' : 'DOWN',
    })

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'SYSTEM', actorId: userId, actorName: ctx.userEmail, action: 'SUPPLIER_SCORECARD_UPDATED', entityType: 'SupplierScorecard', entityId: supplierId, after: { period, overallRating, overallGrade, riskLevel, iqcPassRate, ncrCount } })
    await eventBus.writeToOutbox({ eventName: 'SupplierScorecardUpdated', payload: { supplierId, period, overallRating, riskLevel }, tenantId })

    return { overallRating, overallGrade, riskLevel, iqcPassRate, ncrCount }
  },

  async listScorecards(params: { page?: number; pageSize?: number; supplierId?: string; period?: string } = {}) {
    const { tenantId } = getContext()
    return supplierScorecardRepository.list(tenantId, params)
  },

  // ═══ Complaints ═══════════════════════════════════════════════════════════

  async createComplaint(data: {
    supplierId: string; supplierCode: string; supplierName: string
    productId?: string; productSku?: string; productName?: string; batchNumber?: string; grnNumber?: string
    complaintType: string; severity?: string; description: string
    ncrId?: string; capaId?: string; remarks?: string
  }) {
    const { tenantId, userId, ctx } = getContext()
    const complaintNumber = await supplierComplaintRepository.generateComplaintNumber(tenantId)
    const complaint = await supplierComplaintRepository.create({
      tenantId, complaintNumber, ...data, severity: data.severity ?? 'MAJOR', status: 'OPEN',
      raisedBy: userId, raisedByName: ctx.userEmail,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'SUPPLIER_COMPLAINT_CREATED', entityType: 'SupplierComplaint', entityId: String(complaint!['id']), entityCode: complaintNumber, after: data })
    await eventBus.writeToOutbox({ eventName: 'SupplierComplaintCreated', payload: { complaintId: String(complaint!['id']), complaintNumber, supplierId: data.supplierId }, tenantId })
    return complaint
  },

  async listComplaints(params: { page?: number; pageSize?: number; supplierId?: string; status?: string } = {}) {
    const { tenantId } = getContext()
    return supplierComplaintRepository.list(tenantId, params)
  },

  // ═══ Certifications ═══════════════════════════════════════════════════════

  async createCertification(data: {
    supplierId: string; supplierCode?: string; supplierName?: string
    certType: string; certName: string; certNumber?: string; issuingBody?: string
    issueDate?: string; expiryDate?: string; documentUrl?: string; remarks?: string
  }) {
    const { tenantId, userId, ctx } = getContext()
    const id = await supplierCertificationRepository.create({ tenantId, ...data, isActive: true })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'SUPPLIER_CERTIFICATION_ADDED', entityType: 'SupplierCertification', entityId: id, after: data })
    return { id }
  },

  async listCertifications(params: { page?: number; pageSize?: number; supplierId?: string } = {}) {
    const { tenantId } = getContext()
    return supplierCertificationRepository.list(tenantId, params)
  },

  /** Get certifications expiring within N days */
  async getExpiringCertifications(daysAhead: number = 90) {
    const { tenantId } = getContext()
    return supplierCertificationRepository.getExpiring(tenantId, daysAhead)
  },

  // ═══ Risk Assessments ═════════════════════════════════════════════════════

  async createRiskAssessment(data: {
    supplierId: string; supplierCode?: string; supplierName?: string
    riskCategory: string; riskScore: number; riskLevel?: string; mitigationPlan?: string
    assessmentFactors?: Record<string, unknown>; nextReviewDate?: string; remarks?: string
  }) {
    const { tenantId, userId, ctx } = getContext()

    // Auto-determine risk level from score if not provided
    let riskLevel = data.riskLevel ?? 'MEDIUM'
    if (!data.riskLevel) {
      if (data.riskScore >= 80) riskLevel = 'CRITICAL'
      else if (data.riskScore >= 60) riskLevel = 'HIGH'
      else if (data.riskScore >= 30) riskLevel = 'MEDIUM'
      else riskLevel = 'LOW'
    }

    const id = await supplierRiskAssessmentRepository.create({
      tenantId, ...data, riskLevel, assessedBy: userId, assessedByName: ctx.userEmail,
    })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'SUPPLIER_RISK_ASSESSED', entityType: 'SupplierRiskAssessment', entityId: id, after: { ...data, riskLevel } })
    return { id, riskLevel }
  },

  async listRiskAssessments(params: { page?: number; pageSize?: number; supplierId?: string } = {}) {
    const { tenantId } = getContext()
    return supplierRiskAssessmentRepository.list(tenantId, params)
  },
}

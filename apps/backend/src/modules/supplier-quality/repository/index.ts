/** Supplier Quality Repository — Audits, scorecards, complaints, certifications, risk assessments */
import { query } from '@/core/db/pglite'
import { scopedQuery, scopedCount } from '@/core/security/scoped-query'
import { enforceScopeOnWrite } from '@/core/security/data-scope'
import { randomUUID } from 'node:crypto'

export const supplierAuditRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', auditNumber: 'audit_number', supplierId: 'supplier_id', supplierCode: 'supplier_code', supplierName: 'supplier_name',
      auditType: 'audit_type', auditScope: 'audit_scope', leadAuditor: 'lead_auditor', leadAuditorName: 'lead_auditor_name',
      auditStartDate: 'audit_start_date', auditEndDate: 'audit_end_date', overallScore: 'overall_score', maxScore: 'max_score',
      auditResult: 'audit_result', findingsCount: 'findings_count', criticalFindings: 'critical_findings', majorFindings: 'major_findings', minorFindings: 'minor_findings',
      status: 'status', reportUrl: 'report_url', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO supplier_audits (${cols.join(', ')}, audit_date, version, created_at, updated_at) VALUES (${ph}, NOW(), 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM supplier_audits WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'supplier_audits' })
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; supplierId?: string; status?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.supplierId) { where += ` AND supplier_id = $${idx++}`; sqlParams.push(params.supplierId) }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    const total = await scopedCount('supplier_audits', 'supplier_audits', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM supplier_audits WHERE ${where} ORDER BY audit_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'supplier_audits' })
    return { rows: result.rows, total, page, pageSize }
  },
  async generateAuditNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM supplier_audits WHERE tenant_id = $1 AND audit_number LIKE 'SAUD-${year}-%'`, [tenantId])
    return `SAUD-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const supplierScorecardRepository = {
  async upsert(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO supplier_scorecards (id, tenant_id, supplier_id, supplier_code, supplier_name, period, period_start, period_end, quality_rating, delivery_rating, price_rating, service_rating, overall_rating, overall_grade, iqc_pass_rate, ncr_count, on_time_delivery_pct, defect_rate_ppm, risk_level, trend, remarks, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,NOW(),NOW()) ON CONFLICT (tenant_id, supplier_id, period) DO UPDATE SET quality_rating = EXCLUDED.quality_rating, delivery_rating = EXCLUDED.delivery_rating, price_rating = EXCLUDED.price_rating, service_rating = EXCLUDED.service_rating, overall_rating = EXCLUDED.overall_rating, overall_grade = EXCLUDED.overall_grade, iqc_pass_rate = EXCLUDED.iqc_pass_rate, ncr_count = EXCLUDED.ncr_count, on_time_delivery_pct = EXCLUDED.on_time_delivery_pct, defect_rate_ppm = EXCLUDED.defect_rate_ppm, risk_level = EXCLUDED.risk_level, trend = EXCLUDED.trend, updated_at = NOW()`, [id, data['tenantId'], data['supplierId'], data['supplierCode'] ?? null, data['supplierName'] ?? null, data['period'], data['periodStart'] ?? null, data['periodEnd'] ?? null, data['qualityRating'] ?? 0, data['deliveryRating'] ?? 0, data['priceRating'] ?? 0, data['serviceRating'] ?? 0, data['overallRating'] ?? 0, data['overallGrade'] ?? 'C', data['iqcPassRate'] ?? 0, data['ncrCount'] ?? 0, data['onTimeDeliveryPct'] ?? 0, data['defectRatePpm'] ?? 0, data['riskLevel'] ?? 'MEDIUM', data['trend'] ?? 'STABLE', data['remarks'] ?? null])
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; supplierId?: string; period?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.supplierId) { where += ` AND supplier_id = $${idx++}`; sqlParams.push(params.supplierId) }
    if (params.period) { where += ` AND period = $${idx++}`; sqlParams.push(params.period) }
    const total = await scopedCount('supplier_scorecards', 'supplier_scorecards', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM supplier_scorecards WHERE ${where} ORDER BY period DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'supplier_scorecards' })
    return { rows: result.rows, total, page, pageSize }
  },
}

export const supplierComplaintRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', complaintNumber: 'complaint_number', supplierId: 'supplier_id', supplierCode: 'supplier_code', supplierName: 'supplier_name',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name', batchNumber: 'batch_number', grnNumber: 'grn_number',
      complaintType: 'complaint_type', severity: 'severity', description: 'description', ncrId: 'ncr_id', capaId: 'capa_id', status: 'status',
      raisedBy: 'raised_by', raisedByName: 'raised_by_name', supplierResponse: 'supplier_response', supplierResponseDate: 'supplier_response_date',
      resolution: 'resolution', resolvedBy: 'resolved_by', resolvedByName: 'resolved_by_name', resolvedAt: 'resolved_at', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO supplier_complaints (${cols.join(', ')}, complaint_date, version, created_at, updated_at) VALUES (${ph}, NOW(), 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM supplier_complaints WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'supplier_complaints' })
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; supplierId?: string; status?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.supplierId) { where += ` AND supplier_id = $${idx++}`; sqlParams.push(params.supplierId) }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    const total = await scopedCount('supplier_complaints', 'supplier_complaints', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM supplier_complaints WHERE ${where} ORDER BY complaint_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'supplier_complaints' })
    return { rows: result.rows, total, page, pageSize }
  },
  async generateComplaintNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM supplier_complaints WHERE tenant_id = $1 AND complaint_number LIKE 'SCOMP-${year}-%'`, [tenantId])
    return `SCOMP-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const supplierCertificationRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO supplier_certifications (id, tenant_id, supplier_id, supplier_code, supplier_name, cert_type, cert_name, cert_number, issuing_body, issue_date, expiry_date, is_active, document_url, remarks, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),NOW())`, [id, data['tenantId'], data['supplierId'], data['supplierCode'] ?? null, data['supplierName'] ?? null, data['certType'], data['certName'], data['certNumber'] ?? null, data['issuingBody'] ?? null, data['issueDate'] ?? null, data['expiryDate'] ?? null, data['isActive'] ?? true, data['documentUrl'] ?? null, data['remarks'] ?? null])
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; supplierId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.supplierId) { where += ` AND supplier_id = $${idx++}`; sqlParams.push(params.supplierId) }
    const total = await scopedCount('supplier_certifications', 'supplier_certifications', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM supplier_certifications WHERE ${where} ORDER BY expiry_date ASC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'supplier_certifications' })
    return { rows: result.rows, total, page, pageSize }
  },
  /** Get expiring certifications */
  async getExpiring(tenantId: string, daysAhead: number = 90) {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() + daysAhead)
    const result = await scopedQuery(`SELECT * FROM supplier_certifications WHERE tenant_id = $1 AND deleted_at IS NULL AND is_active = true AND expiry_date IS NOT NULL AND expiry_date <= $2 ORDER BY expiry_date ASC`, [tenantId, cutoff.toISOString()], { tableAlias: 'supplier_certifications' })
    return result.rows
  },
}

export const supplierRiskAssessmentRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO supplier_risk_assessments (id, tenant_id, supplier_id, supplier_code, supplier_name, assessment_date, risk_category, risk_score, risk_level, mitigation_plan, assessment_factors, assessed_by, assessed_by_name, next_review_date, remarks, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,NOW(),$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),NOW())`, [id, data['tenantId'], data['supplierId'], data['supplierCode'] ?? null, data['supplierName'] ?? null, data['riskCategory'], data['riskScore'], data['riskLevel'] ?? 'MEDIUM', data['mitigationPlan'] ?? null, data['assessmentFactors'] ? JSON.stringify(data['assessmentFactors']) : null, data['assessedBy'] ?? null, data['assessedByName'] ?? null, data['nextReviewDate'] ?? null, data['remarks'] ?? null])
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; supplierId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.supplierId) { where += ` AND supplier_id = $${idx++}`; sqlParams.push(params.supplierId) }
    const total = await scopedCount('supplier_risk_assessments', 'supplier_risk_assessments', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM supplier_risk_assessments WHERE ${where} ORDER BY assessment_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'supplier_risk_assessments' })
    return { rows: result.rows, total, page, pageSize }
  },
}

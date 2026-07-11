/** COA Management Repository */
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

export const coaTemplateRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', templateCode: 'template_code', templateName: 'template_name',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      templateType: 'template_type', headerText: 'header_text', footerText: 'footer_text',
      includesMicrobiology: 'includes_microbiology', includesChemical: 'includes_chemical', includesPhysical: 'includes_physical',
      isActive: 'is_active', description: 'description', layoutConfig: 'layout_config',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key] instanceof Object ? JSON.stringify(data[key]) : data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO coa_templates (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM coa_templates WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; productId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM coa_templates WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM coa_templates WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
}

export const coaLabResultRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO coa_lab_results (id, tenant_id, coa_id, fgqc_lot_id, test_category, parameter_name, specification, actual_value, min_value, max_value, target_value, unit, result, test_method, equipment, tested_by, tested_by_name, tested_at, remarks, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW(),$18,NOW())`, [id, data['tenantId'], data['coaId'] ?? null, data['fgqcLotId'] ?? null, data['testCategory'], data['parameterName'], data['specification'] ?? null, data['actualValue'], data['minValue'] ?? null, data['maxValue'] ?? null, data['targetValue'] ?? null, data['unit'] ?? null, data['result'] ?? 'PASS', data['testMethod'] ?? null, data['equipment'] ?? null, data['testedBy'] ?? null, data['testedByName'] ?? null, data['remarks'] ?? null])
    return id
  },
  async listForCoa(tenantId: string, coaId: string) {
    const result = await query(`SELECT * FROM coa_lab_results WHERE tenant_id = $1 AND coa_id = $2 ORDER BY test_category, created_at`, [tenantId, coaId])
    return result.rows
  },
}

export const coaApprovalRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO coa_approvals (id, tenant_id, coa_id, approval_level, approver_id, approver_name, approver_role, approval_status, approval_date, approval_notes, digital_signature, qr_verification_code, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())`, [id, data['tenantId'], data['coaId'], data['approvalLevel'], data['approverId'] ?? null, data['approverName'] ?? null, data['approverRole'] ?? null, data['approvalStatus'] ?? 'PENDING', data['approvalDate'] ?? null, data['approvalNotes'] ?? null, data['digitalSignature'] ?? null, data['qrVerificationCode'] ?? null])
    return id
  },
  async listForCoa(tenantId: string, coaId: string) {
    const result = await query(`SELECT * FROM coa_approvals WHERE tenant_id = $1 AND coa_id = $2 ORDER BY created_at`, [tenantId, coaId])
    return result.rows
  },
}

export const coaVersionRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO coa_versions (id, tenant_id, coa_id, version_number, version_reason, previous_version_id, snapshot, created_by, created_by_name, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`, [id, data['tenantId'], data['coaId'], data['versionNumber'], data['versionReason'], data['previousVersionId'] ?? null, JSON.stringify(data['snapshot']), data['createdBy'] ?? null, data['createdByName'] ?? null])
    return id
  },
  async listForCoa(tenantId: string, coaId: string) {
    const result = await query(`SELECT * FROM coa_versions WHERE tenant_id = $1 AND coa_id = $2 ORDER BY version_number DESC`, [tenantId, coaId])
    return result.rows
  },
}

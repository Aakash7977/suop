/** Quality Foundation Repository */
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

function genericRepo(tableName: string, fields: Record<string, string>) {
  return {
    async create(data: Record<string, unknown>) {
      const id = randomUUID()
      const cols: string[] = ['id']; const vals: unknown[] = [id]
      for (const [key, col] of Object.entries(fields)) {
        if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
      }
      const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
      await query(`INSERT INTO ${tableName} (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
      return this.findById(String(data['tenantId']), id)
    },
    async findById(tenantId: string, id: string) {
      const result = await query(`SELECT * FROM ${tableName} WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
      return result.rows[0] ?? null
    },
    async list(tenantId: string, params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
      const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
      let where = 'tenant_id = $1 AND deleted_at IS NULL'
      const sqlParams: unknown[] = [tenantId]; let idx = 2
      if (params.search) { where += ` AND (standard_code ILIKE $${idx} OR standard_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
      if (params.isActive !== undefined) { where += ` AND is_active = $${idx++}`; sqlParams.push(params.isActive) }
      const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM ${tableName} WHERE ${where}`, sqlParams)
      const total = Number(countResult.rows[0]!.cnt)
      const result = await query(`SELECT * FROM ${tableName} WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
      return { rows: result.rows, total, page, pageSize }
    },
  }
}

export const qualityStandardRepository = genericRepo('quality_standards', {
  tenantId: 'tenant_id', standardCode: 'standard_code', standardName: 'standard_name',
  standardType: 'standard_type', version: 'version', issuingBody: 'issuing_body',
  effectiveDate: 'effective_date', expiryDate: 'expiry_date', isActive: 'is_active', description: 'description',
})

export const inspectionTypeRepository = genericRepo('inspection_types', {
  tenantId: 'tenant_id', typeCode: 'type_code', typeName: 'type_name',
  inspectionCategory: 'inspection_category', isActive: 'is_active', description: 'description', sortOrder: 'sort_order',
})

export const qualitySpecRepository = genericRepo('quality_specifications', {
  tenantId: 'tenant_id', specCode: 'spec_code', specName: 'spec_name',
  productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
  specType: 'spec_type', version: 'version', isActive: 'is_active', description: 'description',
})

export const testMethodRepository = genericRepo('test_methods', {
  tenantId: 'tenant_id', methodCode: 'method_code', methodName: 'method_name',
  methodType: 'method_type', standardReference: 'standard_reference',
  equipmentRequired: 'equipment_required', durationHours: 'duration_hours',
  isActive: 'is_active', description: 'description',
})

export const testParameterRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO test_parameters (id, tenant_id, spec_id, method_id, parameter_code, parameter_name, parameter_type, target_value, min_value, max_value, unit, tolerance_percent, is_mandatory, is_critical, sort_order, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())`, [id, data['tenantId'], data['specId'] ?? null, data['methodId'] ?? null, data['parameterCode'], data['parameterName'], data['parameterType'] ?? 'NUMERIC', data['targetValue'] ?? null, data['minValue'] ?? null, data['maxValue'] ?? null, data['unit'] ?? null, data['tolerancePercent'] ?? null, data['isMandatory'] ?? true, data['isCritical'] ?? false, data['sortOrder'] ?? 0])
    return id
  },
  async listForSpec(tenantId: string, specId: string) {
    const result = await query(`SELECT * FROM test_parameters WHERE tenant_id = $1 AND spec_id = $2 ORDER BY sort_order`, [tenantId, specId])
    return result.rows
  },
}

export const inspectionTemplateRepository = genericRepo('inspection_templates', {
  tenantId: 'tenant_id', templateCode: 'template_code', templateName: 'template_name',
  inspectionTypeId: 'inspection_type_id', productId: 'product_id', productCategoryId: 'product_category_id',
  specId: 'spec_id', isActive: 'is_active', description: 'description',
})

export const qualityKpiRepository = {
  async list(tenantId: string, params: { page?: number; pageSize?: number; period?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.period) { where += ` AND period = $${idx++}`; sqlParams.push(params.period) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM quality_kpis WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM quality_kpis WHERE ${where} ORDER BY period DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async upsert(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO quality_kpis (id, tenant_id, kpi_code, kpi_name, kpi_type, kpi_value, kpi_target, kpi_unit, period, period_start, period_end, trend, status, description, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),NOW()) ON CONFLICT (tenant_id, kpi_code, period) DO UPDATE SET kpi_value = EXCLUDED.kpi_value, kpi_target = EXCLUDED.kpi_target, trend = EXCLUDED.trend, status = EXCLUDED.status, updated_at = NOW()`, [id, data['tenantId'], data['kpiCode'], data['kpiName'], data['kpiType'] ?? null, data['kpiValue'] ?? 0, data['kpiTarget'] ?? 0, data['kpiUnit'] ?? null, data['period'], data['periodStart'] ?? null, data['periodEnd'] ?? null, data['trend'] ?? 'STABLE', data['status'] ?? 'ON_TARGET', data['description'] ?? null])
    return id
  },
}

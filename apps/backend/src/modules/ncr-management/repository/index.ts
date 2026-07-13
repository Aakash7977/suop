/** NCR Management Repository — Root causes, containments, dispositions, material holds, quality costs */
import { query } from '@/core/db/pglite'
import { scopedQuery, scopedCount } from '@/core/security/scoped-query'
import { enforceScopeOnWrite } from '@/core/security/data-scope'
import { randomUUID } from 'node:crypto'

export const ncrRootCauseRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO ncr_root_causes (id, tenant_id, ncr_id, root_cause_category, root_cause_description, analysis_method, fishbone_category, identified_by, identified_by_name, identified_at, is_verified, verified_by, verified_by_name, verified_at, remarks, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),$10,$11,$12,$13,$14,NOW(),NOW())`, [id, data['tenantId'], data['ncrId'], data['rootCauseCategory'], data['rootCauseDescription'], data['analysisMethod'] ?? '5WHY', data['fishboneCategory'] ?? null, data['identifiedBy'] ?? null, data['identifiedByName'] ?? null, data['isVerified'] ?? false, data['verifiedBy'] ?? null, data['verifiedByName'] ?? null, data['verifiedAt'] ?? null, data['remarks'] ?? null])
    return id
  },
  async listForNcr(tenantId: string, ncrId: string) {
    const result = await scopedQuery(`SELECT * FROM ncr_root_causes WHERE tenant_id = $1 AND ncr_id = $2 ORDER BY identified_at DESC`, [tenantId, ncrId], { tableAlias: 'ncr_root_causes' })
    return result.rows
  },
}

export const ncrContainmentRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO ncr_containments (id, tenant_id, ncr_id, containment_action, containment_type, affected_qty, affected_location, implemented_by, implemented_by_name, implemented_at, is_effective, verified_by, verified_by_name, verified_at, remarks, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),$10,$11,$12,$13,$14,NOW(),NOW())`, [id, data['tenantId'], data['ncrId'], data['containmentAction'], data['containmentType'] ?? 'IMMEDIATE', data['affectedQty'] ?? null, data['affectedLocation'] ?? null, data['implementedBy'] ?? null, data['implementedByName'] ?? null, data['isEffective'] ?? false, data['verifiedBy'] ?? null, data['verifiedByName'] ?? null, data['verifiedAt'] ?? null, data['remarks'] ?? null])
    return id
  },
  async listForNcr(tenantId: string, ncrId: string) {
    const result = await scopedQuery(`SELECT * FROM ncr_containments WHERE tenant_id = $1 AND ncr_id = $2 ORDER BY implemented_at DESC`, [tenantId, ncrId], { tableAlias: 'ncr_containments' })
    return result.rows
  },
}

export const ncrDispositionRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO ncr_dispositions (id, tenant_id, ncr_id, disposition_type, disposition_reason, disposition_qty, approved_by, approved_by_name, approved_at, status, remarks, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW())`, [id, data['tenantId'], data['ncrId'], data['dispositionType'], data['dispositionReason'], data['dispositionQty'] ?? null, data['approvedBy'] ?? null, data['approvedByName'] ?? null, data['approvedAt'] ?? null, data['status'] ?? 'PENDING', data['remarks'] ?? null])
    return id
  },
  async listForNcr(tenantId: string, ncrId: string) {
    const result = await scopedQuery(`SELECT * FROM ncr_dispositions WHERE tenant_id = $1 AND ncr_id = $2 ORDER BY created_at DESC`, [tenantId, ncrId], { tableAlias: 'ncr_dispositions' })
    return result.rows
  },
}

export const materialHoldRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', holdNumber: 'hold_number', holdType: 'hold_type',
      sourceId: 'source_id', sourceType: 'source_type', sourceNumber: 'source_number',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      batchId: 'batch_id', batchNumber: 'batch_number', lotId: 'lot_id', lotNumber: 'lot_number',
      warehouseId: 'warehouse_id', warehouseName: 'warehouse_name',
      heldQty: 'held_qty', uomId: 'uom_id', uomCode: 'uom_code',
      holdReason: 'hold_reason', holdLocation: 'hold_location',
      heldBy: 'held_by', heldByName: 'held_by_name',
      scrapQty: 'scrap_qty', reworkQty: 'rework_qty', status: 'status', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO material_holds (${cols.join(', ')}, hold_date, created_at, updated_at) VALUES (${ph}, NOW(), NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM material_holds WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'material_holds' })
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string; productId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    const total = await scopedCount('material_holds', 'material_holds', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM material_holds WHERE ${where} ORDER BY hold_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'material_holds' })
    return { rows: result.rows, total, page, pageSize }
  },
  async release(tenantId: string, id: string, releasedBy: string, releasedByName: string, releaseReason: string, disposition: string) {
    const result = await query(`UPDATE material_holds SET status = 'RELEASED', released_by = $3, released_by_name = $4, released_at = NOW(), release_reason = $5, release_disposition = $6, updated_at = NOW() WHERE tenant_id = $1 AND id = $2 AND status = 'ACTIVE' AND deleted_at IS NULL RETURNING *`, [tenantId, id, releasedBy, releasedByName, releaseReason, disposition])
    return result.rows[0] ?? null
  },
  async generateHoldNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM material_holds WHERE tenant_id = $1 AND hold_number LIKE 'MH-${year}-%'`, [tenantId])
    return `MH-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const qualityCostRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO quality_costs (id, tenant_id, cost_date, cost_category, cost_type, ncr_id, capa_id, product_id, product_sku, amount, currency, description, recorded_by, recorded_by_name, created_at) VALUES ($1,$2,NOW(),$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())`, [id, data['tenantId'], data['costCategory'], data['costType'], data['ncrId'] ?? null, data['capaId'] ?? null, data['productId'] ?? null, data['productSku'] ?? null, data['amount'], data['currency'] ?? 'INR', data['description'] ?? null, data['recordedBy'] ?? null, data['recordedByName'] ?? null])
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; costCategory?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.costCategory) { where += ` AND cost_category = $${idx++}`; sqlParams.push(params.costCategory) }
    const total = await scopedCount('quality_costs', 'quality_costs', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM quality_costs WHERE ${where} ORDER BY cost_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'quality_costs' })
    return { rows: result.rows, total, page, pageSize }
  },
}

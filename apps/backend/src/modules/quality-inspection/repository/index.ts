/** Quality Inspection Repository */
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

export const inspectionPlanRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO inspection_plans (id, tenant_id, plan_code, plan_name, product_id, product_category_id, inspection_type, sampling_plan_id, aql_level, inspection_critical, is_active, description, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())`, [id, data['tenantId'], data['planCode'], data['planName'], data['productId'] ?? null, data['productCategoryId'] ?? null, data['inspectionType'] ?? 'IQC', data['samplingPlanId'] ?? null, data['aqlLevel'] ?? '2.5', data['inspectionCritical'] ?? 'NORMAL', data['isActive'] ?? true, data['description'] ?? null])
    return id
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM inspection_plans WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; search?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.search) { where += ` AND (plan_code ILIKE $${idx} OR plan_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM inspection_plans WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM inspection_plans WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
}

export const samplingPlanRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO sampling_plans (id, tenant_id, plan_code, plan_name, lot_size_min, lot_size_max, sample_size, accept_number, reject_number, aql_level, inspection_level, is_active, description, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW())`, [id, data['tenantId'], data['planCode'], data['planName'], data['lotSizeMin'], data['lotSizeMax'], data['sampleSize'], data['acceptNumber'] ?? 0, data['rejectNumber'] ?? 1, data['aqlLevel'] ?? '2.5', data['inspectionLevel'] ?? 'II', data['isActive'] ?? true, data['description'] ?? null])
    return id
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM sampling_plans WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async list(tenantId: string) {
    const result = await query(`SELECT * FROM sampling_plans WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY lot_size_min`, [tenantId])
    return result.rows
  },
  /** Find appropriate sampling plan for a given lot size */
  async findForLotSize(tenantId: string, lotSize: number) {
    const result = await query(`SELECT * FROM sampling_plans WHERE tenant_id = $1 AND deleted_at IS NULL AND is_active = true AND $2 BETWEEN lot_size_min AND lot_size_max ORDER BY lot_size_min LIMIT 1`, [tenantId, lotSize])
    return result.rows[0] ?? null
  },
}

export const inspectionLotRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', lotNumber: 'lot_number', grnId: 'grn_id', grnLineId: 'grn_line_id',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      batchNumber: 'batch_number', lotQuantity: 'lot_quantity', sampleSize: 'sample_size',
      planId: 'plan_id', planCode: 'plan_code', aqlLevel: 'aql_level',
      inspectionStatus: 'inspection_status', inspectionType: 'inspection_type',
      inspectorId: 'inspector_id', inspectorName: 'inspector_name',
      result: 'result', disposition: 'disposition', acceptQty: 'accept_qty', rejectQty: 'reject_qty',
      ncrId: 'ncr_id', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO inspection_lots (${cols.join(', ')}, version, created_at, updated_at) VALUES (${ph}, 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM inspection_lots WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; search?: string; status?: string; grnId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.search) { where += ` AND (lot_number ILIKE $${idx} OR product_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.status) { where += ` AND inspection_status = $${idx++}`; sqlParams.push(params.status) }
    if (params.grnId) { where += ` AND grn_id = $${idx++}`; sqlParams.push(params.grnId) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM inspection_lots WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM inspection_lots WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number, updatedBy?: string) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      inspectionStatus: 'inspection_status', inspectorId: 'inspector_id', inspectorName: 'inspector_name',
      inspectionStartedAt: 'inspection_started_at', inspectionCompletedAt: 'inspection_completed_at',
      result: 'result', disposition: 'disposition', acceptQty: 'accept_qty', rejectQty: 'reject_qty',
      ncrId: 'ncr_id', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(updatedBy ?? null, version)
    const result = await query(`UPDATE inspection_lots SET ${setParts.join(', ')}, updated_by = $${idx - 1} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
  async generateLotNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM inspection_lots WHERE tenant_id = $1 AND lot_number LIKE 'IQL-${year}-%'`, [tenantId])
    const seq = Number(countResult.rows[0]!.cnt) + 1
    return `IQL-${year}-${String(seq).padStart(6, '0')}`
  },
}

export const inspectionResultRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO inspection_results (id, tenant_id, inspection_lot_id, parameter_id, parameter_code, parameter_name, expected_value, actual_value, result, remarks, recorded_by, recorded_by_name, recorded_at, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())`, [id, data['tenantId'], data['inspectionLotId'], data['parameterId'] ?? null, data['parameterCode'] ?? null, data['parameterName'] ?? null, data['expectedValue'] ?? null, data['actualValue'], data['result'] ?? 'PASS', data['remarks'] ?? null, data['recordedBy'] ?? null, data['recordedByName'] ?? null])
    return id
  },
  async listForLot(tenantId: string, lotId: string) {
    const result = await query(`SELECT * FROM inspection_results WHERE tenant_id = $1 AND inspection_lot_id = $2 ORDER BY recorded_at`, [tenantId, lotId])
    return result.rows
  },
}

export const qualityHoldRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', holdNumber: 'hold_number', holdType: 'hold_type', sourceId: 'source_id', sourceType: 'source_type',
      productId: 'product_id', productSku: 'product_sku', batchNumber: 'batch_number', lotNumber: 'lot_number',
      heldQty: 'held_qty', holdReason: 'hold_reason', holdLocation: 'hold_location',
      heldBy: 'held_by', heldByName: 'held_by_name',
      status: 'status', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO quality_holds (${cols.join(', ')}, held_at, created_at, updated_at) VALUES (${ph}, NOW(), NOW(), NOW())`, vals)
    return id
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM quality_holds WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM quality_holds WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM quality_holds WHERE ${where} ORDER BY held_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async release(tenantId: string, id: string, releasedBy: string, releasedByName: string, releaseReason: string, disposition: string) {
    const result = await query(`UPDATE quality_holds SET status = 'RELEASED', released_by = $3, released_by_name = $4, released_at = NOW(), release_reason = $5, disposition = $6, updated_at = NOW() WHERE tenant_id = $1 AND id = $2 AND status = 'ACTIVE' AND deleted_at IS NULL RETURNING *`, [tenantId, id, releasedBy, releasedByName, releaseReason, disposition])
    return result.rows[0] ?? null
  },
  async generateHoldNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM quality_holds WHERE tenant_id = $1 AND hold_number LIKE 'QH-${year}-%'`, [tenantId])
    const seq = Number(countResult.rows[0]!.cnt) + 1
    return `QH-${year}-${String(seq).padStart(6, '0')}`
  },
}

export const ncrRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', ncrNumber: 'ncr_number', ncrType: 'ncr_type', sourceId: 'source_id', sourceType: 'source_type',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      batchNumber: 'batch_number', lotNumber: 'lot_number', supplierId: 'supplier_id', supplierName: 'supplier_name',
      grnId: 'grn_id', grnNumber: 'grn_number', nonConformance: 'non_conformance', nonConformanceType: 'non_conformance_type',
      severity: 'severity', defectQty: 'defect_qty', disposition: 'disposition', rootCause: 'root_cause', capaId: 'capa_id',
      status: 'status', raisedBy: 'raised_by', raisedByName: 'raised_by_name', closureNotes: 'closure_notes',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO ncrs (${cols.join(', ')}, ncr_date, version, created_at, updated_at) VALUES (${ph}, NOW(), 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM ncrs WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; search?: string; status?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.search) { where += ` AND (ncr_number ILIKE $${idx} OR product_name ILIKE $${idx} OR non_conformance ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM ncrs WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM ncrs WHERE ${where} ORDER BY ncr_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number, updatedBy?: string) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      status: 'status', disposition: 'disposition', rootCause: 'root_cause', capaId: 'capa_id',
      closedBy: 'closed_by', closedByName: 'closed_by_name', closedAt: 'closed_at', closureNotes: 'closure_notes',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(updatedBy ?? null, version)
    const result = await query(`UPDATE ncrs SET ${setParts.join(', ')}, updated_by = $${idx - 1} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
  async generateNcrNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM ncrs WHERE tenant_id = $1 AND ncr_number LIKE 'NCR-${year}-%'`, [tenantId])
    const seq = Number(countResult.rows[0]!.cnt) + 1
    return `NCR-${year}-${String(seq).padStart(6, '0')}`
  },
}

export const capaRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', capaNumber: 'capa_number', ncrId: 'ncr_id', ncrNumber: 'ncr_number',
      correctiveAction: 'corrective_action', preventiveAction: 'preventive_action',
      actionOwner: 'action_owner', actionOwnerName: 'action_owner_name', targetDate: 'target_date',
      completedDate: 'completed_date', effectiveness: 'effectiveness', status: 'status',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO capa_records (${cols.join(', ')}, capa_date, version, created_at, updated_at) VALUES (${ph}, NOW(), 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM capa_records WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM capa_records WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM capa_records WHERE ${where} ORDER BY capa_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async generateCapaNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM capa_records WHERE tenant_id = $1 AND capa_number LIKE 'CAPA-${year}-%'`, [tenantId])
    const seq = Number(countResult.rows[0]!.cnt) + 1
    return `CAPA-${year}-${String(seq).padStart(6, '0')}`
  },
}

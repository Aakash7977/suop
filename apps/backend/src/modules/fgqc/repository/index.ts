/** FGQC Repository — Inspection lots, test results, holds, COA, shelf life */
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

export const fgqcLotRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', lotNumber: 'lot_number',
      productionBatchId: 'production_batch_id', productionBatchNumber: 'production_batch_number',
      productionOrderId: 'production_order_id', productionOrderNumber: 'production_order_number',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      batchQuantity: 'batch_quantity', sampleSize: 'sample_size',
      uomId: 'uom_id', uomCode: 'uom_code',
      inspectionPlanId: 'inspection_plan_id', inspectionPlanCode: 'inspection_plan_code',
      inspectionStatus: 'inspection_status', inspectorId: 'inspector_id', inspectorName: 'inspector_name',
      result: 'result', disposition: 'disposition',
      releaseDecision: 'release_decision', releaseNotes: 'release_notes',
      releasedBy: 'released_by', releasedByName: 'released_by_name', releasedAt: 'released_at',
      rejectReason: 'reject_reason',
      coaId: 'coa_id', coaNumber: 'coa_number',
      shelfLifeDays: 'shelf_life_days', expiryDate: 'expiry_date',
      remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO fgqc_inspection_lots (${cols.join(', ')}, lot_date, version, created_at, updated_at) VALUES (${ph}, NOW(), 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM fgqc_inspection_lots WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string; productionBatchId?: string; search?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.status) { where += ` AND inspection_status = $${idx++}`; sqlParams.push(params.status) }
    if (params.productionBatchId) { where += ` AND production_batch_id = $${idx++}`; sqlParams.push(params.productionBatchId) }
    if (params.search) { where += ` AND (lot_number ILIKE $${idx} OR product_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM fgqc_inspection_lots WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM fgqc_inspection_lots WHERE ${where} ORDER BY lot_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      inspectionStatus: 'inspection_status', inspectorId: 'inspector_id', inspectorName: 'inspector_name',
      inspectionStartedAt: 'inspection_started_at', inspectionCompletedAt: 'inspection_completed_at',
      result: 'result', disposition: 'disposition',
      releaseDecision: 'release_decision', releaseNotes: 'release_notes',
      releasedBy: 'released_by', releasedByName: 'released_by_name', releasedAt: 'released_at',
      rejectReason: 'reject_reason', coaId: 'coa_id', coaNumber: 'coa_number',
      shelfLifeDays: 'shelf_life_days', expiryDate: 'expiry_date',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(version)
    const result = await query(`UPDATE fgqc_inspection_lots SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
  async generateLotNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM fgqc_inspection_lots WHERE tenant_id = $1 AND lot_number LIKE 'FGQC-${year}-%'`, [tenantId])
    return `FGQC-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const fgqcTestResultRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO fgqc_test_results (id, tenant_id, inspection_lot_id, test_category, test_code, test_name, test_type, specification, min_value, max_value, target_value, actual_value, unit, result, method, equipment, tested_by, tested_by_name, tested_at, remarks, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW(),$19,NOW())`, [id, data['tenantId'], data['inspectionLotId'], data['testCategory'], data['testCode'] ?? null, data['testName'], data['testType'] ?? null, data['specification'] ?? null, data['minValue'] ?? null, data['maxValue'] ?? null, data['targetValue'] ?? null, data['actualValue'], data['unit'] ?? null, data['result'] ?? 'PASS', data['method'] ?? null, data['equipment'] ?? null, data['testedBy'] ?? null, data['testedByName'] ?? null, data['remarks'] ?? null])
    return id
  },
  async listForLot(tenantId: string, lotId: string) {
    const result = await query(`SELECT * FROM fgqc_test_results WHERE tenant_id = $1 AND inspection_lot_id = $2 ORDER BY tested_at`, [tenantId, lotId])
    return result.rows
  },
}

export const fgqcHoldRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', holdNumber: 'hold_number',
      inspectionLotId: 'inspection_lot_id', productionBatchId: 'production_batch_id', productionBatchNumber: 'production_batch_number',
      productId: 'product_id', productSku: 'product_sku', heldQty: 'held_qty',
      holdReason: 'hold_reason', holdType: 'hold_type',
      heldBy: 'held_by', heldByName: 'held_by_name',
      status: 'status', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO fgqc_holds (${cols.join(', ')}, hold_date, created_at, updated_at) VALUES (${ph}, NOW(), NOW(), NOW())`, vals)
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM fgqc_holds WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM fgqc_holds WHERE ${where} ORDER BY hold_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async generateHoldNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM fgqc_holds WHERE tenant_id = $1 AND hold_number LIKE 'FGH-${year}-%'`, [tenantId])
    return `FGH-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const coaRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', coaNumber: 'coa_number',
      inspectionLotId: 'inspection_lot_id', productionBatchId: 'production_batch_id', productionBatchNumber: 'production_batch_number',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      batchNumber: 'batch_number', manufactureDate: 'manufacture_date', expiryDate: 'expiry_date',
      quantity: 'quantity', uomCode: 'uom_code',
      customerId: 'customer_id', customerName: 'customer_name',
      testSummary: 'test_summary', overallResult: 'overall_result', status: 'status',
      preparedBy: 'prepared_by', preparedByName: 'prepared_by_name',
      reviewedBy: 'reviewed_by', reviewedByName: 'reviewed_by_name', reviewedAt: 'reviewed_at',
      signedBy: 'signed_by', signedByName: 'signed_by_name', signedAt: 'signed_at',
      remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO coa_records (${cols.join(', ')}, coa_date, version, created_at, updated_at) VALUES (${ph}, NOW(), 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM coa_records WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string; productId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM coa_records WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM coa_records WHERE ${where} ORDER BY coa_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async generateCoaNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM coa_records WHERE tenant_id = $1 AND coa_number LIKE 'COA-${year}-%'`, [tenantId])
    return `COA-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      status: 'status', overallResult: 'overall_result', testSummary: 'test_summary',
      reviewedBy: 'reviewed_by', reviewedByName: 'reviewed_by_name', reviewedAt: 'reviewed_at',
      signedBy: 'signed_by', signedByName: 'signed_by_name', signedAt: 'signed_at',
      remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(version)
    const result = await query(`UPDATE coa_records SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
}

export const shelfLifeRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO shelf_life_records (id, tenant_id, product_id, product_sku, product_name, batch_id, batch_number, production_batch_id, production_batch_number, manufacture_date, original_expiry_date, adjusted_expiry_date, shelf_life_days, adjustment_reason, adjusted_by, adjusted_by_name, adjusted_at, remarks, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW(),$17,NOW())`, [id, data['tenantId'], data['productId'], data['productSku'] ?? null, data['productName'] ?? null, data['batchId'] ?? null, data['batchNumber'] ?? null, data['productionBatchId'] ?? null, data['productionBatchNumber'] ?? null, data['manufactureDate'] ?? null, data['originalExpiryDate'] ?? null, data['adjustedExpiryDate'] ?? null, data['shelfLifeDays'] ?? null, data['adjustmentReason'] ?? null, data['adjustedBy'] ?? null, data['adjustedByName'] ?? null, data['remarks'] ?? null])
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; productId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM shelf_life_records WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM shelf_life_records WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
}

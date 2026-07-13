/** Production Order Repository */
import { query } from '@/core/db/pglite'
import { scopedQuery, scopedCount } from '@/core/security/scoped-query'
import { enforceScopeOnWrite } from '@/core/security/data-scope'
import { randomUUID } from 'node:crypto'

export const productionOrderRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', poNumber: 'po_number', poType: 'po_type',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      plannedQty: 'planned_qty', uomId: 'uom_id', uomCode: 'uom_code',
      recipeId: 'recipe_id', recipeCode: 'recipe_code', bomId: 'bom_id', bomCode: 'bom_code',
      routingId: 'routing_id', routingCode: 'routing_code',
      workCenterId: 'work_center_id', workCenterCode: 'work_center_code',
      productionLineId: 'production_line_id', machineId: 'machine_id',
      plantId: 'plant_id', plantName: 'plant_name',
      plannedStart: 'planned_start', plannedEnd: 'planned_end',
      plannedCost: 'planned_cost', priority: 'priority',
      status: 'status', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO production_orders (${cols.join(', ')}, po_date, version, created_at, updated_at) VALUES (${ph}, NOW(), 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM production_orders WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'production_orders' })
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string; productId?: string; search?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    if (params.search) { where += ` AND (po_number ILIKE $${idx} OR product_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    const total = await scopedCount('production_orders', 'production_orders', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM production_orders WHERE ${where} ORDER BY po_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'production_orders' })
    return { rows: result.rows, total, page, pageSize }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number, updatedBy?: string) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      status: 'status', actualStart: 'actual_start', actualEnd: 'actual_end',
      producedQty: 'produced_qty', rejectedQty: 'rejected_qty', scrapQty: 'scrap_qty', reworkQty: 'rework_qty',
      yieldPercent: 'yield_percent', wastagePercent: 'wastage_percent',
      actualCost: 'actual_cost', costVariance: 'cost_variance',
      rejectionReason: 'rejection_reason', cancelReason: 'cancel_reason',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(updatedBy ?? null, version)
    const result = await query(`UPDATE production_orders SET ${setParts.join(', ')}, updated_by = $${idx - 1} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
  async generatePoNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM production_orders WHERE tenant_id = $1 AND po_number LIKE 'MPO-${year}-%'`, [tenantId])
    return `MPO-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const productionOrderOperationRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO production_order_operations (id, tenant_id, production_order_id, operation_no, operation_name, operation_description, routing_operation_id, work_center_id, work_center_code, machine_id, machine_code, setup_time_minutes, run_time_minutes, planned_start, planned_end, status, operator_id, operator_name, remarks, version, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,0,NOW(),NOW())`, [id, data['tenantId'], data['productionOrderId'], data['operationNo'], data['operationName'], data['operationDescription'] ?? null, data['routingOperationId'] ?? null, data['workCenterId'] ?? null, data['workCenterCode'] ?? null, data['machineId'] ?? null, data['machineCode'] ?? null, data['setupTimeMinutes'] ?? 0, data['runTimeMinutes'] ?? 0, data['plannedStart'] ?? null, data['plannedEnd'] ?? null, data['status'] ?? 'PENDING', data['operatorId'] ?? null, data['operatorName'] ?? null, data['remarks'] ?? null])
    return id
  },
  async listForOrder(tenantId: string, orderId: string) {
    const result = await scopedQuery(`SELECT * FROM production_order_operations WHERE tenant_id = $1 AND production_order_id = $2 ORDER BY operation_no`, [tenantId, orderId], { tableAlias: 'production_order_operations' })
    return result.rows
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      status: 'status', actualStart: 'actual_start', actualEnd: 'actual_end',
      operatorId: 'operator_id', operatorName: 'operator_name',
      producedQty: 'produced_qty', rejectedQty: 'rejected_qty',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(version)
    const result = await query(`UPDATE production_order_operations SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} RETURNING *`, vals)
    return result.rows[0] ?? null
  },
}

export const materialIssueRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO material_issues (id, tenant_id, issue_number, issue_date, production_order_id, production_order_number, operation_id, warehouse_id, warehouse_name, issued_by, issued_by_name, status, remarks, version, created_at, updated_at) VALUES ($1,$2,$3,NOW(),$4,$5,$6,$7,$8,$9,$10,$11,$12,0,NOW(),NOW())`, [id, data['tenantId'], data['issueNumber'], data['productionOrderId'], data['productionOrderNumber'] ?? null, data['operationId'] ?? null, data['warehouseId'] ?? null, data['warehouseName'] ?? null, data['issuedBy'] ?? null, data['issuedByName'] ?? null, data['status'] ?? 'COMPLETED', data['remarks'] ?? null])
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; productionOrderId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.productionOrderId) { where += ` AND production_order_id = $${idx++}`; sqlParams.push(params.productionOrderId) }
    const total = await scopedCount('material_issues', 'material_issues', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM material_issues WHERE ${where} ORDER BY issue_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'material_issues' })
    return { rows: result.rows, total, page, pageSize }
  },
  async generateIssueNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM material_issues WHERE tenant_id = $1 AND issue_number LIKE 'MI-${year}-%'`, [tenantId])
    return `MI-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const materialIssueLineRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO material_issue_lines (id, tenant_id, issue_id, line_no, product_id, product_sku, product_name, uom_id, uom_code, planned_qty, issued_qty, variance_qty, variance_percent, batch_id, batch_number, lot_id, lot_number, consumption_strategy, unit_cost, line_total, remarks, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,NOW())`, [id, data['tenantId'], data['issueId'], data['lineNo'], data['productId'], data['productSku'] ?? null, data['productName'] ?? null, data['uomId'] ?? null, data['uomCode'] ?? null, data['plannedQty'] ?? 0, data['issuedQty'], data['varianceQty'] ?? 0, data['variancePercent'] ?? 0, data['batchId'] ?? null, data['batchNumber'] ?? null, data['lotId'] ?? null, data['lotNumber'] ?? null, data['consumptionStrategy'] ?? 'FEFO', data['unitCost'] ?? 0, data['lineTotal'] ?? 0, data['remarks'] ?? null])
    return id
  },
  async listForIssue(tenantId: string, issueId: string) {
    const result = await scopedQuery(`SELECT * FROM material_issue_lines WHERE tenant_id = $1 AND issue_id = $2 ORDER BY line_no`, [tenantId, issueId], { tableAlias: 'material_issue_lines' })
    return result.rows
  },
}

export const productionConfirmationRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO production_confirmations (id, tenant_id, confirmation_number, confirmation_date, production_order_id, production_order_number, operation_id, confirmed_qty, rejected_qty, scrap_qty, rework_qty, uom_id, uom_code, operator_id, operator_name, shift_id, machine_id, machine_code, confirmation_type, remarks, created_at) VALUES ($1,$2,$3,NOW(),$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,NOW())`, [id, data['tenantId'], data['confirmationNumber'], data['productionOrderId'], data['productionOrderNumber'] ?? null, data['operationId'] ?? null, data['confirmedQty'], data['rejectedQty'] ?? 0, data['scrapQty'] ?? 0, data['reworkQty'] ?? 0, data['uomId'] ?? null, data['uomCode'] ?? null, data['operatorId'] ?? null, data['operatorName'] ?? null, data['shiftId'] ?? null, data['machineId'] ?? null, data['machineCode'] ?? null, data['confirmationType'] ?? 'PARTIAL', data['remarks'] ?? null])
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; productionOrderId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.productionOrderId) { where += ` AND production_order_id = $${idx++}`; sqlParams.push(params.productionOrderId) }
    const total = await scopedCount('production_confirmations', 'production_confirmations', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM production_confirmations WHERE ${where} ORDER BY confirmation_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'production_confirmations' })
    return { rows: result.rows, total, page, pageSize }
  },
  async generateConfirmationNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM production_confirmations WHERE tenant_id = $1 AND confirmation_number LIKE 'PC-${year}-%'`, [tenantId])
    return `PC-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const scrapRecordRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO scrap_records (id, tenant_id, scrap_number, scrap_date, production_order_id, production_order_number, operation_id, product_id, product_sku, scrap_qty, uom_id, uom_code, scrap_reason, scrap_type, disposition, recorded_by, recorded_by_name, remarks, created_at) VALUES ($1,$2,$3,NOW(),$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW())`, [id, data['tenantId'], data['scrapNumber'], data['productionOrderId'] ?? null, data['productionOrderNumber'] ?? null, data['operationId'] ?? null, data['productId'] ?? null, data['productSku'] ?? null, data['scrapQty'], data['uomId'] ?? null, data['uomCode'] ?? null, data['scrapReason'], data['scrapType'] ?? null, data['disposition'] ?? 'DISPOSE', data['recordedBy'] ?? null, data['recordedByName'] ?? null, data['remarks'] ?? null])
    return id
  },
  async generateScrapNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM scrap_records WHERE tenant_id = $1 AND scrap_number LIKE 'SCRAP-${year}-%'`, [tenantId])
    return `SCRAP-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const reworkRecordRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO rework_records (id, tenant_id, rework_number, rework_date, production_order_id, production_order_number, operation_id, product_id, product_sku, rework_qty, uom_id, uom_code, rework_reason, rework_type, rework_operation_id, rework_cost, status, recorded_by, recorded_by_name, remarks, created_at, updated_at) VALUES ($1,$2,$3,NOW(),$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,NOW(),NOW())`, [id, data['tenantId'], data['reworkNumber'], data['productionOrderId'] ?? null, data['productionOrderNumber'] ?? null, data['operationId'] ?? null, data['productId'] ?? null, data['productSku'] ?? null, data['reworkQty'], data['uomId'] ?? null, data['uomCode'] ?? null, data['reworkReason'], data['reworkType'] ?? null, data['reworkOperationId'] ?? null, data['reworkCost'] ?? 0, data['status'] ?? 'PENDING', data['recordedBy'] ?? null, data['recordedByName'] ?? null, data['remarks'] ?? null])
    return id
  },
  async generateReworkNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM rework_records WHERE tenant_id = $1 AND rework_number LIKE 'RW-${year}-%'`, [tenantId])
    return `RW-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

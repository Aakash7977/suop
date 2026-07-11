/** Batch Manufacturing Repository — Production batches, genealogy, splits, merges, traceability */
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

export const productionBatchRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', batchNumber: 'batch_number',
      productionOrderId: 'production_order_id', productionOrderNumber: 'production_order_number',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      parentBatchId: 'parent_batch_id', parentBatchNumber: 'parent_batch_number',
      batchType: 'batch_type', quantity: 'quantity', uomId: 'uom_id', uomCode: 'uom_code',
      manufactureDate: 'manufacture_date', expiryDate: 'expiry_date', shelfLifeDays: 'shelf_life_days',
      status: 'status', isSplit: 'is_split', isMerged: 'is_merged',
      splitFromId: 'split_from_id', warehouseId: 'warehouse_id', warehouseName: 'warehouse_name', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO production_batches (${cols.join(', ')}, version, created_at, updated_at) VALUES (${ph}, 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM production_batches WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async findByNumber(tenantId: string, batchNumber: string) {
    const result = await query(`SELECT * FROM production_batches WHERE tenant_id = $1 AND batch_number = $2 AND deleted_at IS NULL`, [tenantId, batchNumber])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; productId?: string; status?: string; search?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.search) { where += ` AND (batch_number ILIKE $${idx} OR product_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM production_batches WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM production_batches WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      status: 'status', quantity: 'quantity', expiryDate: 'expiry_date', shelfLifeDays: 'shelf_life_days',
      isSplit: 'is_split', isMerged: 'is_merged',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(version)
    const result = await query(`UPDATE production_batches SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
  async generateBatchNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM production_batches WHERE tenant_id = $1 AND batch_number LIKE 'PB-${year}-%'`, [tenantId])
    return `PB-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const batchGenealogyRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO batch_genealogy (id, tenant_id, child_batch_id, child_batch_number, parent_batch_id, parent_batch_number, parent_type, parent_product_id, parent_product_sku, consumed_qty, uom_code, consumption_date, material_issue_id, material_issue_number, is_immutable, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),$12,$13,true,NOW())`, [id, data['tenantId'], data['childBatchId'], data['childBatchNumber'], data['parentBatchId'] ?? null, data['parentBatchNumber'] ?? null, data['parentType'], data['parentProductId'] ?? null, data['parentProductSku'] ?? null, data['consumedQty'] ?? null, data['uomCode'] ?? null, data['materialIssueId'] ?? null, data['materialIssueNumber'] ?? null])
    return id
  },
  async findAncestors(tenantId: string, batchId: string): Promise<Array<Record<string, unknown>>> {
    // Recursive query to find all parent batches (backward traceability)
    const result = await query(`WITH RECURSIVE ancestors AS (SELECT bg.* FROM batch_genealogy bg WHERE bg.tenant_id = $1 AND bg.child_batch_id = $2 AND bg.is_immutable = true UNION ALL SELECT bg2.* FROM batch_genealogy bg2 JOIN ancestors a ON bg2.child_batch_id = a.parent_batch_id WHERE bg2.tenant_id = $1 AND bg2.is_immutable = true) SELECT DISTINCT * FROM ancestors`, [tenantId, batchId])
    return result.rows
  },
  async findDescendants(tenantId: string, batchId: string): Promise<Array<Record<string, unknown>>> {
    // Recursive query to find all child batches (forward traceability)
    const result = await query(`WITH RECURSIVE descendants AS (SELECT bg.* FROM batch_genealogy bg WHERE bg.tenant_id = $1 AND bg.parent_batch_id = $2 AND bg.is_immutable = true UNION ALL SELECT bg2.* FROM batch_genealogy bg2 JOIN descendants d ON bg2.parent_batch_id = d.child_batch_id WHERE bg2.tenant_id = $1 AND bg2.is_immutable = true) SELECT DISTINCT * FROM descendants`, [tenantId, batchId])
    return result.rows
  },
}

export const batchSplitRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO batch_splits (id, tenant_id, split_number, split_date, source_batch_id, source_batch_number, split_reason, total_qty, child_batch_ids, split_count, performed_by, performed_by_name, remarks, created_at) VALUES ($1,$2,$3,NOW(),$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())`, [id, data['tenantId'], data['splitNumber'], data['sourceBatchId'], data['sourceBatchNumber'], data['splitReason'], data['totalQty'], data['childBatchIds'] ?? [], data['splitCount'], data['performedBy'] ?? null, data['performedByName'] ?? null, data['remarks'] ?? null])
    return id
  },
  async generateSplitNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM batch_splits WHERE tenant_id = $1 AND split_number LIKE 'BS-${year}-%'`, [tenantId])
    return `BS-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const batchMergeRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO batch_merges (id, tenant_id, merge_number, merge_date, target_batch_id, target_batch_number, merge_reason, total_qty, source_batch_ids, merge_count, performed_by, performed_by_name, remarks, created_at) VALUES ($1,$2,$3,NOW(),$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())`, [id, data['tenantId'], data['mergeNumber'], data['targetBatchId'], data['targetBatchNumber'], data['mergeReason'], data['totalQty'], data['sourceBatchIds'] ?? [], data['mergeCount'], data['performedBy'] ?? null, data['performedByName'] ?? null, data['remarks'] ?? null])
    return id
  },
  async generateMergeNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM batch_merges WHERE tenant_id = $1 AND merge_number LIKE 'BM-${year}-%'`, [tenantId])
    return `BM-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const traceabilityLogRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO traceability_logs (id, tenant_id, trace_type, batch_id, batch_number, product_id, product_sku, direction, related_batch_id, related_batch_number, related_product_id, related_product_sku, related_type, quantity, uom_code, reference_type, reference_id, reference_number, event_date, description, is_immutable, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW(),$19,true,NOW())`, [id, data['tenantId'], data['traceType'], data['batchId'] ?? null, data['batchNumber'] ?? null, data['productId'] ?? null, data['productSku'] ?? null, data['direction'], data['relatedBatchId'] ?? null, data['relatedBatchNumber'] ?? null, data['relatedProductId'] ?? null, data['relatedProductSku'] ?? null, data['relatedType'] ?? null, data['quantity'] ?? null, data['uomCode'] ?? null, data['referenceType'] ?? null, data['referenceId'] ?? null, data['referenceNumber'] ?? null, data['description'] ?? null])
    return id
  },
  async listForBatch(tenantId: string, batchId: string) {
    const result = await query(`SELECT * FROM traceability_logs WHERE tenant_id = $1 AND (batch_id = $2 OR related_batch_id = $2) AND is_immutable = true ORDER BY event_date DESC`, [tenantId, batchId])
    return result.rows
  },
}

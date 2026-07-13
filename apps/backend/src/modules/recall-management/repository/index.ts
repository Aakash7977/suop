/** Recall Management Repository */
import { query } from '@/core/db/pglite'
import { scopedQuery, scopedCount } from '@/core/security/scoped-query'
import { enforceScopeOnWrite } from '@/core/security/data-scope'
import { randomUUID } from 'node:crypto'

export const recallRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', recallNumber: 'recall_number', recallType: 'recall_type', recallClass: 'recall_class',
      recallReason: 'recall_reason', productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      batchId: 'batch_id', batchNumber: 'batch_number',
      productionBatchId: 'production_batch_id', productionBatchNumber: 'production_batch_number',
      affectedQty: 'affected_qty', affectedValue: 'affected_value',
      initiatedBy: 'initiated_by', initiatedByName: 'initiated_by_name',
      status: 'status', priority: 'priority', regulatoryNotification: 'regulatory_notification', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO recalls (${cols.join(', ')}, recall_date, version, created_at, updated_at) VALUES (${ph}, NOW(), 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM recalls WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'recalls' })
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string; productId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    const total = await scopedCount('recalls', 'recalls', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM recalls WHERE ${where} ORDER BY recall_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'recalls' })
    return { rows: result.rows, total, page, pageSize }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      status: 'status', approvedBy: 'approved_by', approvedByName: 'approved_by_name', approvedAt: 'approved_at',
      closedBy: 'closed_by', closedByName: 'closed_by_name', closedAt: 'closed_at', closureNotes: 'closure_notes',
      regulatoryNotifiedAt: 'regulatory_notified_at',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(version)
    const result = await query(`UPDATE recalls SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
  async generateRecallNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM recalls WHERE tenant_id = $1 AND recall_number LIKE 'REC-${year}-%'`, [tenantId])
    return `REC-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

export const recallAffectedItemRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO recall_affected_items (id, tenant_id, recall_id, item_type, batch_id, batch_number, product_id, product_sku, product_name, quantity, uom_code, warehouse_id, warehouse_name, location, status, recovered_qty, destroyed_qty, returned_qty, remarks, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,NOW(),NOW())`, [id, data['tenantId'], data['recallId'], data['itemType'], data['batchId'] ?? null, data['batchNumber'] ?? null, data['productId'] ?? null, data['productSku'] ?? null, data['productName'] ?? null, data['quantity'] ?? null, data['uomCode'] ?? null, data['warehouseId'] ?? null, data['warehouseName'] ?? null, data['location'] ?? null, data['status'] ?? 'IDENTIFIED', data['recoveredQty'] ?? 0, data['destroyedQty'] ?? 0, data['returnedQty'] ?? 0, data['remarks'] ?? null])
    return id
  },
  async listForRecall(tenantId: string, recallId: string) {
    const result = await scopedQuery(`SELECT * FROM recall_affected_items WHERE tenant_id = $1 AND recall_id = $2`, [tenantId, recallId], { tableAlias: 'recall_affected_items' })
    return result.rows
  },
}

export const recallAffectedCustomerRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO recall_affected_customers (id, tenant_id, recall_id, customer_id, customer_name, customer_code, shipped_qty, shipped_date, invoice_number, notified, notified_at, notified_by, notified_by_name, response_received, response_date, returned_qty, status, remarks, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,NOW(),NOW())`, [id, data['tenantId'], data['recallId'], data['customerId'] ?? null, data['customerName'] ?? null, data['customerCode'] ?? null, data['shippedQty'] ?? 0, data['shippedDate'] ?? null, data['invoiceNumber'] ?? null, data['notified'] ?? false, data['notifiedAt'] ?? null, data['notifiedBy'] ?? null, data['notifiedByName'] ?? null, data['responseReceived'] ?? false, data['responseDate'] ?? null, data['returnedQty'] ?? 0, data['status'] ?? 'IDENTIFIED', data['remarks'] ?? null])
    return id
  },
  async listForRecall(tenantId: string, recallId: string) {
    const result = await scopedQuery(`SELECT * FROM recall_affected_customers WHERE tenant_id = $1 AND recall_id = $2`, [tenantId, recallId], { tableAlias: 'recall_affected_customers' })
    return result.rows
  },
}

export const recallCommunicationRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO recall_communications (id, tenant_id, recall_id, communication_type, channel, recipient, recipient_name, subject, message, sent_by, sent_by_name, sent_at, acknowledged_at, remarks, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),$12,$13,NOW())`, [id, data['tenantId'], data['recallId'], data['communicationType'], data['channel'] ?? 'EMAIL', data['recipient'] ?? null, data['recipientName'] ?? null, data['subject'] ?? null, data['message'], data['sentBy'] ?? null, data['sentByName'] ?? null, data['acknowledgedAt'] ?? null, data['remarks'] ?? null])
    return id
  },
  async listForRecall(tenantId: string, recallId: string) {
    const result = await scopedQuery(`SELECT * FROM recall_communications WHERE tenant_id = $1 AND recall_id = $2 ORDER BY sent_at DESC`, [tenantId, recallId], { tableAlias: 'recall_communications' })
    return result.rows
  },
}

export const recallEffectivenessRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO recall_effectiveness (id, tenant_id, recall_id, review_date, total_affected_qty, total_recovered_qty, recovery_percent, total_affected_customers, customers_notified, customers_responded, effectiveness_rating, is_effective, reviewed_by, reviewed_by_name, remarks, created_at) VALUES ($1,$2,$3,NOW(),$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())`, [id, data['tenantId'], data['recallId'], data['totalAffectedQty'] ?? 0, data['totalRecoveredQty'] ?? 0, data['recoveryPercent'] ?? 0, data['totalAffectedCustomers'] ?? 0, data['customersNotified'] ?? 0, data['customersResponded'] ?? 0, data['effectivenessRating'] ?? null, data['isEffective'] ?? false, data['reviewedBy'] ?? null, data['reviewedByName'] ?? null, data['remarks'] ?? null])
    return id
  },
  async listForRecall(tenantId: string, recallId: string) {
    const result = await scopedQuery(`SELECT * FROM recall_effectiveness WHERE tenant_id = $1 AND recall_id = $2 ORDER BY review_date DESC`, [tenantId, recallId], { tableAlias: 'recall_effectiveness' })
    return result.rows
  },
}

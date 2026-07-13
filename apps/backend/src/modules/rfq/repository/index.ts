/** RFQ Repository — Database operations for RFQ Management */
import { query } from '@/core/db/pglite'
import { scopedQuery, scopedCount } from '@/core/security/scoped-query'
import { enforceScopeOnWrite } from '@/core/security/data-scope'
import { randomUUID } from 'node:crypto'

export const rfqRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', rfqNumber: 'rfq_number', prId: 'pr_id', prNumber: 'pr_number',
      companyId: 'company_id', plantId: 'plant_id', warehouseId: 'warehouse_id',
      buyerId: 'buyer_id', buyerName: 'buyer_name', rfqType: 'rfq_type',
      rfqDate: 'rfq_date', closingDate: 'closing_date', currency: 'currency',
      paymentTerms: 'payment_terms', deliveryTerms: 'delivery_terms', incoterms: 'incoterms',
      targetDeliveryDate: 'target_delivery_date', remarks: 'remarks', internalNotes: 'internal_notes',
      attachments: 'attachments',
    }
    const cols: string[] = ['id']
    const vals: unknown[] = [id]
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO rfqs (${cols.join(', ')}, status, revision_no, version, created_at, updated_at) VALUES (${ph}, 'DRAFT', 0, 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },

  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM rfqs WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'rfqs' })
    return result.rows[0] ?? null
  },

  async findByRfqNumber(tenantId: string, rfqNumber: string) {
    const result = await scopedQuery(`SELECT * FROM rfqs WHERE tenant_id = $1 AND rfq_number = $2 AND deleted_at IS NULL`, [tenantId, rfqNumber], { tableAlias: 'rfqs' })
    return result.rows[0] ?? null
  },

  async list(tenantId: string, params: { page?: number; pageSize?: number; search?: string; status?: string; buyerId?: string; prId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.search) { where += ` AND (rfq_number ILIKE $${idx} OR remarks ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.buyerId) { where += ` AND buyer_id = $${idx++}`; sqlParams.push(params.buyerId) }
    if (params.prId) { where += ` AND pr_id = $${idx++}`; sqlParams.push(params.prId) }
    const total = await scopedCount('rfqs', 'rfqs', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM rfqs WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'rfqs' })
    return { rows: result.rows, total, page, pageSize }
  },

  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number, updatedBy?: string) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      closingDate: 'closing_date', currency: 'currency', paymentTerms: 'payment_terms',
      deliveryTerms: 'delivery_terms', incoterms: 'incoterms', targetDeliveryDate: 'target_delivery_date',
      remarks: 'remarks', internalNotes: 'internal_notes', status: 'status', cancelReason: 'cancel_reason',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(updatedBy ?? null, version)
    const result = await query(`UPDATE rfqs SET ${setParts.join(', ')}, updated_by = $${idx - 1} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },

  async softDelete(tenantId: string, id: string, version: number) {
    const result = await query(`UPDATE rfqs SET deleted_at = NOW(), version = version + 1 WHERE tenant_id = $1 AND id = $2 AND version = $3 AND deleted_at IS NULL RETURNING id`, [tenantId, id, version])
    return result.rows.length > 0
  },

  async generateRfqNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM rfqs WHERE tenant_id = $1 AND rfq_number LIKE 'RFQ-${year}-%'`, [tenantId])
    const seq = Number(countResult.rows[0]!.cnt) + 1
    return `RFQ-${year}-${String(seq).padStart(6, '0')}`
  },
}

export const rfqLineRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', rfqId: 'rfq_id', lineNo: 'line_no',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      requestedQty: 'requested_qty', uomId: 'uom_id', uomCode: 'uom_code',
      targetDeliveryDate: 'target_delivery_date', remarks: 'remarks',
    }
    const cols: string[] = ['id']
    const vals: unknown[] = [id]
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO rfq_lines (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
    return id
  },

  async listForRfq(tenantId: string, rfqId: string) {
    const result = await scopedQuery(`SELECT * FROM rfq_lines WHERE tenant_id = $1 AND rfq_id = $2 ORDER BY line_no`, [tenantId, rfqId], { tableAlias: 'rfq_lines' })
    return result.rows
  },

  async deleteForRfq(rfqId: string) {
    await query(`DELETE FROM rfq_lines WHERE rfq_id = $1`, [rfqId])
  },
}

export const rfqSupplierRepository = {
  async create(data: { tenantId: string; rfqId: string; supplierId: string; supplierCode: string; supplierName: string; invitedBy?: string; isPreferred?: boolean }) {
    const id = randomUUID()
    await query(`INSERT INTO rfq_suppliers (id, tenant_id, rfq_id, supplier_id, supplier_code, supplier_name, invited_at, invited_by, is_preferred, response_status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,NOW(),$7,$8,'PENDING',NOW(),NOW())`, [id, data.tenantId, data.rfqId, data.supplierId, data.supplierCode, data.supplierName, data.invitedBy ?? null, data.isPreferred ?? false])
    return id
  },

  async listForRfq(tenantId: string, rfqId: string) {
    const result = await scopedQuery(`SELECT * FROM rfq_suppliers WHERE tenant_id = $1 AND rfq_id = $2 ORDER BY is_preferred DESC, invited_at ASC`, [tenantId, rfqId], { tableAlias: 'rfq_suppliers' })
    return result.rows
  },

  async updateResponse(tenantId: string, rfqId: string, supplierId: string, responseStatus: string, declineReason?: string) {
    await query(`UPDATE rfq_suppliers SET response_status = $4, responded_at = NOW(), decline_reason = $5, updated_at = NOW() WHERE tenant_id = $1 AND rfq_id = $2 AND supplier_id = $3`, [tenantId, rfqId, supplierId, responseStatus, declineReason ?? null])
  },

  async deleteForRfq(rfqId: string) {
    await query(`DELETE FROM rfq_suppliers WHERE rfq_id = $1`, [rfqId])
  },
}

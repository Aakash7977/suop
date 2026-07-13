/** Quotation Repository — Database operations for Supplier Quotations */
import { query } from '@/core/db/pglite'
import { scopedQuery, scopedCount } from '@/core/security/scoped-query'
import { enforceScopeOnWrite } from '@/core/security/data-scope'
import { randomUUID } from 'node:crypto'

export const quotationRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', quotationNumber: 'quotation_number',
      rfqId: 'rfq_id', rfqNumber: 'rfq_number',
      supplierId: 'supplier_id', supplierCode: 'supplier_code', supplierName: 'supplier_name',
      quotationDate: 'quotation_date', validityDate: 'validity_date',
      currency: 'currency', paymentTerms: 'payment_terms', deliveryTerms: 'delivery_terms',
      leadTimeDays: 'lead_time_days', taxPercent: 'tax_percent', discountPercent: 'discount_percent',
      freightAmount: 'freight_amount', insuranceAmount: 'insurance_amount', warrantyTerms: 'warranty_terms',
      subtotal: 'subtotal', taxAmount: 'tax_amount', discountAmount: 'discount_amount', grandTotal: 'grand_total',
      remarks: 'remarks', attachments: 'attachments',
    }
    const cols: string[] = ['id']
    const vals: unknown[] = [id]
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO supplier_quotations (${cols.join(', ')}, status, revision_no, version, created_at, updated_at) VALUES (${ph}, 'DRAFT', 0, 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },

  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM supplier_quotations WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'supplier_quotations' })
    return result.rows[0] ?? null
  },

  async findByNumber(tenantId: string, quotationNumber: string) {
    const result = await scopedQuery(`SELECT * FROM supplier_quotations WHERE tenant_id = $1 AND quotation_number = $2 AND deleted_at IS NULL`, [tenantId, quotationNumber], { tableAlias: 'supplier_quotations' })
    return result.rows[0] ?? null
  },

  async list(tenantId: string, params: { page?: number; pageSize?: number; search?: string; status?: string; rfqId?: string; supplierId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.search) { where += ` AND (quotation_number ILIKE $${idx} OR supplier_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.rfqId) { where += ` AND rfq_id = $${idx++}`; sqlParams.push(params.rfqId) }
    if (params.supplierId) { where += ` AND supplier_id = $${idx++}`; sqlParams.push(params.supplierId) }
    const total = await scopedCount('supplier_quotations', 'supplier_quotations', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM supplier_quotations WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'supplier_quotations' })
    return { rows: result.rows, total, page, pageSize }
  },

  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number, updatedBy?: string) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      validityDate: 'validity_date', paymentTerms: 'payment_terms', deliveryTerms: 'delivery_terms',
      leadTimeDays: 'lead_time_days', taxPercent: 'tax_percent', discountPercent: 'discount_percent',
      freightAmount: 'freight_amount', insuranceAmount: 'insurance_amount', warrantyTerms: 'warranty_terms',
      subtotal: 'subtotal', taxAmount: 'tax_amount', discountAmount: 'discount_amount', grandTotal: 'grand_total',
      technicalScore: 'technical_score', commercialScore: 'commercial_score', overallScore: 'overall_score',
      rank: 'rank', isLowestPrice: 'is_lowest_price', isBestValue: 'is_best_value',
      recommendationNotes: 'recommendation_notes', remarks: 'remarks',
      status: 'status', rejectionReason: 'rejection_reason',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(updatedBy ?? null, version)
    const result = await query(`UPDATE supplier_quotations SET ${setParts.join(', ')}, updated_by = $${idx - 1} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },

  async softDelete(tenantId: string, id: string, version: number) {
    const result = await query(`UPDATE supplier_quotations SET deleted_at = NOW(), version = version + 1 WHERE tenant_id = $1 AND id = $2 AND version = $3 AND deleted_at IS NULL RETURNING id`, [tenantId, id, version])
    return result.rows.length > 0
  },

  async generateQuotationNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM supplier_quotations WHERE tenant_id = $1 AND quotation_number LIKE 'QUOT-${year}-%'`, [tenantId])
    const seq = Number(countResult.rows[0]!.cnt) + 1
    return `QUOT-${year}-${String(seq).padStart(6, '0')}`
  },

  async listForRfq(tenantId: string, rfqId: string) {
    const result = await scopedQuery(`SELECT * FROM supplier_quotations WHERE tenant_id = $1 AND rfq_id = $2 AND deleted_at IS NULL AND status IN ('SUBMITTED','TECHNICAL_REVIEW','COMMERCIAL_REVIEW','RECOMMENDED','AWARDED') ORDER BY grand_total ASC`, [tenantId, rfqId], { tableAlias: 'supplier_quotations' })
    return result.rows
  },
}

export const quotationLineRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', quotationId: 'quotation_id', lineNo: 'line_no',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      rfqLineId: 'rfq_line_id', quotedQty: 'quoted_qty', uomId: 'uom_id', uomCode: 'uom_code',
      unitPrice: 'unit_price', lineTotal: 'line_total', currency: 'currency',
      moq: 'moq', leadTimeDays: 'lead_time_days', discountPercent: 'discount_percent', remarks: 'remarks',
    }
    const cols: string[] = ['id']
    const vals: unknown[] = [id]
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO supplier_quotation_lines (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
    return id
  },

  async listForQuotation(tenantId: string, quotationId: string) {
    const result = await scopedQuery(`SELECT * FROM supplier_quotation_lines WHERE tenant_id = $1 AND quotation_id = $2 ORDER BY line_no`, [tenantId, quotationId], { tableAlias: 'supplier_quotation_lines' })
    return result.rows
  },

  async deleteForQuotation(quotationId: string) {
    await query(`DELETE FROM supplier_quotation_lines WHERE quotation_id = $1`, [quotationId])
  },
}

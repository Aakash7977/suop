/** Goods Receipt Repository */
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

const GRN_FIELDS: Record<string, string> = {
  tenantId: 'tenant_id', grnNumber: 'grn_number', grnDate: 'grn_date',
  poId: 'po_id', poNumber: 'po_number',
  supplierId: 'supplier_id', supplierCode: 'supplier_code', supplierName: 'supplier_name',
  supplierInvoiceNumber: 'supplier_invoice_number', supplierInvoiceDate: 'supplier_invoice_date', supplierInvoiceAmount: 'supplier_invoice_amount',
  deliveryChallanNumber: 'delivery_challan_number', deliveryChallanDate: 'delivery_challan_date',
  companyId: 'company_id', companyName: 'company_name', plantId: 'plant_id', plantName: 'plant_name',
  warehouseId: 'warehouse_id', warehouseName: 'warehouse_name',
  receivedBy: 'received_by', receivedByName: 'received_by_name', receivedAt: 'received_at',
  verifiedBy: 'verified_by', verifiedByName: 'verified_by_name', verifiedAt: 'verified_at',
  vehicleNumber: 'vehicle_number', transportName: 'transport_name',
  transportLorryNo: 'transport_lorry_no', transportLrNumber: 'transport_lr_number', transportLrDate: 'transport_lr_date', transportMode: 'transport_mode',
  ewayBillNumber: 'eway_bill_number', ewayBillDate: 'eway_bill_date',
  totalQty: 'total_qty', totalAcceptedQty: 'total_accepted_qty', totalRejectedQty: 'total_rejected_qty',
  totalDamagedQty: 'total_damaged_qty', totalShortQty: 'total_short_qty', totalOverQty: 'total_over_qty',
  isPartial: 'is_partial', isShortReceipt: 'is_short_receipt', isOverReceipt: 'is_over_receipt', isFullyReceived: 'is_fully_received',
  poBalanceQty: 'po_balance_qty',
  remarks: 'remarks', internalNotes: 'internal_notes',
  status: 'status', rejectionReason: 'rejection_reason',
}

export const grnRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']
    const vals: unknown[] = [id]
    for (const [key, col] of Object.entries(GRN_FIELDS)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO goods_receipts (${cols.join(', ')}, version, created_at, updated_at) VALUES (${ph}, 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM goods_receipts WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async findByNumber(tenantId: string, grnNumber: string) {
    const result = await query(`SELECT * FROM goods_receipts WHERE tenant_id = $1 AND grn_number = $2 AND deleted_at IS NULL`, [tenantId, grnNumber])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; search?: string; status?: string; supplierId?: string; poId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.search) { where += ` AND (grn_number ILIKE $${idx} OR supplier_name ILIKE $${idx} OR po_number ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.supplierId) { where += ` AND supplier_id = $${idx++}`; sqlParams.push(params.supplierId) }
    if (params.poId) { where += ` AND po_id = $${idx++}`; sqlParams.push(params.poId) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM goods_receipts WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM goods_receipts WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number, updatedBy?: string) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    for (const [key, col] of Object.entries(GRN_FIELDS)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(updatedBy ?? null, version)
    const result = await query(`UPDATE goods_receipts SET ${setParts.join(', ')}, updated_by = $${idx - 1} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
  async softDelete(tenantId: string, id: string, version: number) {
    const result = await query(`UPDATE goods_receipts SET deleted_at = NOW(), version = version + 1 WHERE tenant_id = $1 AND id = $2 AND version = $3 AND deleted_at IS NULL RETURNING id`, [tenantId, id, version])
    return result.rows.length > 0
  },
  async generateGrnNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM goods_receipts WHERE tenant_id = $1 AND grn_number LIKE 'GRN-${year}-%'`, [tenantId])
    const seq = Number(countResult.rows[0]!.cnt) + 1
    return `GRN-${year}-${String(seq).padStart(6, '0')}`
  },
}

const LINE_FIELDS: Record<string, string> = {
  tenantId: 'tenant_id', grnId: 'grn_id', lineNo: 'line_no', poLineId: 'po_line_id',
  productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
  uomId: 'uom_id', uomCode: 'uom_code',
  orderedQty: 'ordered_qty', receivedQty: 'received_qty', acceptedQty: 'accepted_qty', rejectedQty: 'rejected_qty',
  damagedQty: 'damaged_qty', shortQty: 'short_qty', overQty: 'over_qty',
  unitPrice: 'unit_price', lineTotal: 'line_total',
  batchNumber: 'batch_number', lotNumber: 'lot_number',
  manufactureDate: 'manufacture_date', expiryDate: 'expiry_date',
  inspectionStatus: 'inspection_status', inspectionLotId: 'inspection_lot_id',
  warehouseId: 'warehouse_id', warehouseName: 'warehouse_name', remarks: 'remarks',
}

export const grnLineRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']
    const vals: unknown[] = [id]
    for (const [key, col] of Object.entries(LINE_FIELDS)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO goods_receipt_lines (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
    return id
  },
  async listForGrn(tenantId: string, grnId: string) {
    const result = await query(`SELECT * FROM goods_receipt_lines WHERE tenant_id = $1 AND grn_id = $2 ORDER BY line_no`, [tenantId, grnId])
    return result.rows
  },
  async deleteForGrn(grnId: string) {
    await query(`DELETE FROM goods_receipt_lines WHERE grn_id = $1`, [grnId])
  },
}

export const grnAttachmentRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO grn_attachments (id, tenant_id, grn_id, file_name, file_type, file_size, file_url, category, uploaded_by, uploaded_by_name, remarks, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())`, [id, data['tenantId'], data['grnId'], data['fileName'], data['fileType'], data['fileSize'], data['fileUrl'], data['category'] ?? 'GENERAL', data['uploadedBy'] ?? null, data['uploadedByName'] ?? null, data['remarks'] ?? null])
    return id
  },
  async listForGrn(tenantId: string, grnId: string) {
    const result = await query(`SELECT * FROM grn_attachments WHERE tenant_id = $1 AND grn_id = $2 ORDER BY created_at DESC`, [tenantId, grnId])
    return result.rows
  },
}

export const grnDamageRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO grn_damage_records (id, tenant_id, grn_id, grn_line_id, product_id, product_sku, damage_type, damaged_qty, damage_reason, damage_severity, action_taken, recorded_by, recorded_by_name, photo_url, remarks, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())`, [id, data['tenantId'], data['grnId'], data['grnLineId'] ?? null, data['productId'] ?? null, data['productSku'] ?? null, data['damageType'], data['damagedQty'], data['damageReason'], data['damageSeverity'] ?? 'MINOR', data['actionTaken'] ?? null, data['recordedBy'] ?? null, data['recordedByName'] ?? null, data['photoUrl'] ?? null, data['remarks'] ?? null])
    return id
  },
  async listForGrn(tenantId: string, grnId: string) {
    const result = await query(`SELECT * FROM grn_damage_records WHERE tenant_id = $1 AND grn_id = $2 ORDER BY created_at DESC`, [tenantId, grnId])
    return result.rows
  },
}

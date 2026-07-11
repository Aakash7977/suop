/** Sales Order Repository */
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

const SO_FIELDS: Record<string, string> = {
  tenantId: 'tenant_id', soNumber: 'so_number', soDate: 'so_date', soType: 'so_type',
  customerId: 'customer_id', customerCode: 'customer_code', customerName: 'customer_name', customerGstin: 'customer_gstin',
  customerPoNumber: 'customer_po_number', customerPoDate: 'customer_po_date',
  companyId: 'company_id', companyName: 'company_name', plantId: 'plant_id', plantName: 'plant_name',
  warehouseId: 'warehouse_id', warehouseName: 'warehouse_name',
  salespersonId: 'salesperson_id', salespersonName: 'salesperson_name',
  deliveryAddress: 'delivery_address', billingAddress: 'billing_address',
  expectedDeliveryDate: 'expected_delivery_date', deliveryTerms: 'delivery_terms',
  paymentTerms: 'payment_terms', creditDays: 'credit_days',
  currency: 'currency', exchangeRate: 'exchange_rate',
  subtotal: 'subtotal', discountAmount: 'discount_amount', taxAmount: 'tax_amount',
  freightAmount: 'freight_amount', otherCharges: 'other_charges', roundOff: 'round_off', grandTotal: 'grand_total',
  creditStatus: 'credit_status', creditApprovedBy: 'credit_approved_by', creditApprovedAt: 'credit_approved_at',
  creditLimit: 'credit_limit', creditUsed: 'credit_used', creditAvailable: 'credit_available',
  isOnHold: 'is_on_hold', holdReason: 'hold_reason',
  reservedQty: 'reserved_qty', pickedQty: 'picked_qty', packedQty: 'packed_qty',
  dispatchedQty: 'dispatched_qty', deliveredQty: 'delivered_qty', invoicedQty: 'invoiced_qty', returnedQty: 'returned_qty',
  isBackorder: 'is_backorder', isPartial: 'is_partial',
  status: 'status', rejectionReason: 'rejection_reason', cancelReason: 'cancel_reason', amendmentReason: 'amendment_reason',
  revisionNo: 'revision_no', parentSoId: 'parent_so_id', remarks: 'remarks', internalNotes: 'internal_notes',
}

export const salesOrderRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    for (const [key, col] of Object.entries(SO_FIELDS)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO sales_orders (${cols.join(', ')}, version, created_at, updated_at) VALUES (${ph}, 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM sales_orders WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async findByNumber(tenantId: string, soNumber: string) {
    const result = await query(`SELECT * FROM sales_orders WHERE tenant_id = $1 AND so_number = $2 AND deleted_at IS NULL`, [tenantId, soNumber])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; search?: string; status?: string; customerId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.search) { where += ` AND (so_number ILIKE $${idx} OR customer_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.customerId) { where += ` AND customer_id = $${idx++}`; sqlParams.push(params.customerId) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM sales_orders WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM sales_orders WHERE ${where} ORDER BY so_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number, updatedBy?: string) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    for (const [key, col] of Object.entries(SO_FIELDS)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(updatedBy ?? null, version)
    const result = await query(`UPDATE sales_orders SET ${setParts.join(', ')}, updated_by = $${idx - 1} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
  async generateSoNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM sales_orders WHERE tenant_id = $1 AND so_number LIKE 'SO-${year}-%'`, [tenantId])
    return `SO-${year}-${String(Number(countResult.rows[0]!.cnt) + 1).padStart(6, '0')}`
  },
}

const SOL_FIELDS: Record<string, string> = {
  tenantId: 'tenant_id', soId: 'so_id', lineNo: 'line_no',
  productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
  uomId: 'uom_id', uomCode: 'uom_code',
  orderedQty: 'ordered_qty', reservedQty: 'reserved_qty', pickedQty: 'picked_qty', packedQty: 'packed_qty',
  dispatchedQty: 'dispatched_qty', deliveredQty: 'delivered_qty', invoicedQty: 'invoiced_qty', returnedQty: 'returned_qty',
  unitPrice: 'unit_price', basePrice: 'base_price', discountPercent: 'discount_percent', discountAmount: 'discount_amount',
  taxPercent: 'tax_percent', taxAmount: 'tax_amount', lineTotal: 'line_total', currency: 'currency',
  batchId: 'batch_id', batchNumber: 'batch_number', lotId: 'lot_id', lotNumber: 'lot_number',
  expectedDeliveryDate: 'expected_delivery_date', allocationStrategy: 'allocation_strategy',
  isBackorder: 'is_backorder', isSubstituted: 'is_substituted', substitutedForProductId: 'substituted_for_product_id', remarks: 'remarks',
}

export const salesOrderLineRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    for (const [key, col] of Object.entries(SOL_FIELDS)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO sales_order_lines (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
    return id
  },
  async listForSo(tenantId: string, soId: string) {
    const result = await query(`SELECT * FROM sales_order_lines WHERE tenant_id = $1 AND so_id = $2 ORDER BY line_no`, [tenantId, soId])
    return result.rows
  },
  async deleteForSo(soId: string) {
    await query(`DELETE FROM sales_order_lines WHERE so_id = $1`, [soId])
  },
}

export const salesOrderAmendmentRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO sales_order_amendments (id, tenant_id, so_id, amendment_no, amendment_reason, previous_snapshot, new_snapshot, changed_fields, amended_by, amended_by_name, amended_at, approval_required, approved_by, approved_at, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),$11,$12,$13,NOW())`, [id, data['tenantId'], data['soId'], data['amendmentNo'], data['amendmentReason'], JSON.stringify(data['previousSnapshot']), data['newSnapshot'] ? JSON.stringify(data['newSnapshot']) : null, data['changedFields'] ?? [], data['amendedBy'] ?? null, data['amendedByName'] ?? null, data['approvalRequired'] ?? true, data['approvedBy'] ?? null, data['approvedAt'] ?? null])
    return id
  },
  async listForSo(tenantId: string, soId: string) {
    const result = await query(`SELECT * FROM sales_order_amendments WHERE tenant_id = $1 AND so_id = $2 ORDER BY amendment_no DESC`, [tenantId, soId])
    return result.rows
  },
}

export const salesOrderHoldRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO sales_order_holds (id, tenant_id, so_id, hold_type, hold_reason, held_by, held_by_name, held_at, released_by, released_by_name, released_at, release_reason, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),$8,$9,$10,$11,$12,NOW(),NOW())`, [id, data['tenantId'], data['soId'], data['holdType'], data['holdReason'], data['heldBy'] ?? null, data['heldByName'] ?? null, data['releasedBy'] ?? null, data['releasedByName'] ?? null, data['releasedAt'] ?? null, data['releaseReason'] ?? null, data['status'] ?? 'ACTIVE'])
    return id
  },
  async listForSo(tenantId: string, soId: string) {
    const result = await query(`SELECT * FROM sales_order_holds WHERE tenant_id = $1 AND so_id = $2 ORDER BY held_at DESC`, [tenantId, soId])
    return result.rows
  },
}

export const salesOrderApprovalRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO sales_order_approvals (id, tenant_id, so_id, approval_level, approver_id, approver_name, approver_role, approval_status, approval_date, approval_notes, rejection_reason, is_current, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())`, [id, data['tenantId'], data['soId'], data['approvalLevel'], data['approverId'] ?? null, data['approverName'] ?? null, data['approverRole'] ?? null, data['approvalStatus'] ?? 'PENDING', data['approvalDate'] ?? null, data['approvalNotes'] ?? null, data['rejectionReason'] ?? null, data['isCurrent'] ?? true])
    return id
  },
  async listForSo(tenantId: string, soId: string) {
    const result = await query(`SELECT * FROM sales_order_approvals WHERE tenant_id = $1 AND so_id = $2 ORDER BY created_at`, [tenantId, soId])
    return result.rows
  },
}

export const salesOrderHistoryRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO sales_order_history (id, tenant_id, so_id, action, from_status, to_status, action_by, action_by_name, action_date, action_notes, metadata, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),$9,$10,NOW())`, [id, data['tenantId'], data['soId'], data['action'], data['fromStatus'] ?? null, data['toStatus'] ?? null, data['actionBy'] ?? null, data['actionByName'] ?? null, data['actionNotes'] ?? null, data['metadata'] ? JSON.stringify(data['metadata']) : null])
    return id
  },
  async listForSo(tenantId: string, soId: string) {
    const result = await query(`SELECT * FROM sales_order_history WHERE tenant_id = $1 AND so_id = $2 ORDER BY action_date DESC`, [tenantId, soId])
    return result.rows
  },
}

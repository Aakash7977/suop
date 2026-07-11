/** Purchase Order Repository — Database operations for all 12 PO entities */
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

// ════════════════════════════════════════════════════════════════════════════
// PURCHASE ORDER HEADER
// ════════════════════════════════════════════════════════════════════════════

const HEADER_FIELDS: Record<string, string> = {
  tenantId: 'tenant_id', poNumber: 'po_number', poType: 'po_type', poDate: 'po_date',
  revisionNo: 'revision_no',
  rfqId: 'rfq_id', rfqNumber: 'rfq_number', quotationId: 'quotation_id', quotationNumber: 'quotation_number',
  prId: 'pr_id', prNumber: 'pr_number',
  supplierId: 'supplier_id', supplierCode: 'supplier_code', supplierName: 'supplier_name', supplierGstin: 'supplier_gstin',
  companyId: 'company_id', companyName: 'company_name',
  plantId: 'plant_id', plantName: 'plant_name',
  warehouseId: 'warehouse_id', warehouseName: 'warehouse_name',
  departmentId: 'department_id', costCenterId: 'cost_center_id',
  buyerId: 'buyer_id', buyerName: 'buyer_name',
  expectedDeliveryDate: 'expected_delivery_date', deliveryTerms: 'delivery_terms',
  deliveryLocation: 'delivery_location', shippingAddress: 'shipping_address', billingAddress: 'billing_address',
  currency: 'currency', exchangeRate: 'exchange_rate',
  subtotal: 'subtotal', discountPercent: 'discount_percent', discountAmount: 'discount_amount',
  taxAmount: 'tax_amount', freightAmount: 'freight_amount', insuranceAmount: 'insurance_amount',
  otherCharges: 'other_charges', roundOff: 'round_off', grandTotal: 'grand_total',
  paymentTerms: 'payment_terms', paymentTermsDays: 'payment_terms_days',
  creditPeriodDays: 'credit_period_days', advancePercent: 'advance_percent', creditDays: 'credit_days',
  supplierAckStatus: 'supplier_ack_status', supplierAckDate: 'supplier_ack_date',
  supplierAckNotes: 'supplier_ack_notes', supplierAckCounterTotal: 'supplier_ack_counter_total',
  receivedQty: 'received_qty', receivedAmount: 'received_amount', pendingQty: 'pending_qty', pendingAmount: 'pending_amount',
  isPartiallyReceived: 'is_partially_received', isFullyReceived: 'is_fully_received', lastReceiptDate: 'last_receipt_date',
  validityDate: 'validity_date', expiryDate: 'expiry_date',
  status: 'status', rejectionReason: 'rejection_reason', cancelReason: 'cancel_reason',
  revisionReason: 'revision_reason', approvalNotes: 'approval_notes',
  remarks: 'remarks', internalNotes: 'internal_notes', supplierNotes: 'supplier_notes',
  attachmentCount: 'attachment_count',
}

export const poRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']
    const vals: unknown[] = [id]
    for (const [key, col] of Object.entries(HEADER_FIELDS)) {
      if (data[key] !== undefined && data[key] !== null) {
        cols.push(col)
        vals.push(data[key])
      }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(
      `INSERT INTO purchase_orders (${cols.join(', ')}, version, created_at, updated_at) VALUES (${ph}, 0, NOW(), NOW())`,
      vals,
    )
    return this.findById(String(data['tenantId']), id)
  },

  async findById(tenantId: string, id: string) {
    const result = await query(
      `SELECT * FROM purchase_orders WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`,
      [tenantId, id],
    )
    return result.rows[0] ?? null
  },

  async findByNumber(tenantId: string, poNumber: string) {
    const result = await query(
      `SELECT * FROM purchase_orders WHERE tenant_id = $1 AND po_number = $2 AND deleted_at IS NULL`,
      [tenantId, poNumber],
    )
    return result.rows[0] ?? null
  },

  async list(
    tenantId: string,
    params: {
      page?: number
      pageSize?: number
      search?: string
      status?: string
      poType?: string
      supplierId?: string
      plantId?: string
      sortBy?: string
      sortOrder?: 'ASC' | 'DESC'
    } = {},
  ) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 25
    const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]
    let idx = 2

    if (params.search) {
      where += ` AND (po_number ILIKE $${idx} OR supplier_name ILIKE $${idx} OR supplier_code ILIKE $${idx})`
      sqlParams.push(`%${params.search}%`)
      idx++
    }
    if (params.status) {
      where += ` AND status = $${idx++}`
      sqlParams.push(params.status)
    }
    if (params.poType) {
      where += ` AND po_type = $${idx++}`
      sqlParams.push(params.poType)
    }
    if (params.supplierId) {
      where += ` AND supplier_id = $${idx++}`
      sqlParams.push(params.supplierId)
    }
    if (params.plantId) {
      where += ` AND plant_id = $${idx++}`
      sqlParams.push(params.plantId)
    }

    const sortCol = params.sortBy ?? 'created_at'
    const sortDir = params.sortOrder ?? 'DESC'
    const allowedSorts = new Set([
      'created_at',
      'updated_at',
      'po_date',
      'expected_delivery_date',
      'grand_total',
      'po_number',
      'supplier_name',
      'status',
    ])
    const safeSort = allowedSorts.has(sortCol) ? sortCol : 'created_at'
    const safeDir = sortDir === 'ASC' ? 'ASC' : 'DESC'

    const countResult = await query<{ cnt: string }>(
      `SELECT COUNT(*) as cnt FROM purchase_orders WHERE ${where}`,
      sqlParams,
    )
    const total = Number(countResult.rows[0]!.cnt)

    const result = await query(
      `SELECT * FROM purchase_orders WHERE ${where} ORDER BY ${safeSort} ${safeDir} LIMIT $${idx} OFFSET $${idx + 1}`,
      [...sqlParams, pageSize, offset],
    )
    return { rows: result.rows, total, page, pageSize }
  },

  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number, updatedBy?: string) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]
    let idx = 3
    for (const [key, col] of Object.entries(HEADER_FIELDS)) {
      if (data[key] !== undefined) {
        setParts.push(`${col} = $${idx++}`)
        vals.push(data[key])
      }
    }
    vals.push(updatedBy ?? null, version)
    const result = await query(
      `UPDATE purchase_orders SET ${setParts.join(', ')}, updated_by = $${idx - 1} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`,
      vals,
    )
    return result.rows[0] ?? null
  },

  async softDelete(tenantId: string, id: string, version: number) {
    const result = await query(
      `UPDATE purchase_orders SET deleted_at = NOW(), version = version + 1 WHERE tenant_id = $1 AND id = $2 AND version = $3 AND deleted_at IS NULL RETURNING id`,
      [tenantId, id, version],
    )
    return result.rows.length > 0
  },

  async generatePoNumber(tenantId: string, poType: string = 'STANDARD'): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = poType === 'EMERGENCY' ? 'EMPO' : 'PO'
    const countResult = await query<{ cnt: string }>(
      `SELECT COUNT(*) as cnt FROM purchase_orders WHERE tenant_id = $1 AND po_number LIKE '${prefix}-${year}-%'`,
      [tenantId],
    )
    const seq = Number(countResult.rows[0]!.cnt) + 1
    return `${prefix}-${year}-${String(seq).padStart(6, '0')}`
  },
}

// ════════════════════════════════════════════════════════════════════════════
// PURCHASE ORDER LINES
// ════════════════════════════════════════════════════════════════════════════

const LINE_FIELDS: Record<string, string> = {
  tenantId: 'tenant_id', poId: 'po_id', lineNo: 'line_no',
  productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
  productDescription: 'product_description', categoryId: 'category_id', categoryName: 'category_name',
  uomId: 'uom_id', uomCode: 'uom_code',
  orderedQty: 'ordered_qty', receivedQty: 'received_qty', pendingQty: 'pending_qty', rejectedQty: 'rejected_qty',
  unitPrice: 'unit_price', basePrice: 'base_price',
  discountPercent: 'discount_percent', discountAmount: 'discount_amount',
  taxPercent: 'tax_percent', taxAmount: 'tax_amount', lineTotal: 'line_total', currency: 'currency',
  expectedDeliveryDate: 'expected_delivery_date', leadTimeDays: 'lead_time_days', deliveryLocation: 'delivery_location',
  minOrderQty: 'min_order_qty', maxOrderQty: 'max_order_qty', moqViolated: 'moq_violated',
  rfqLineId: 'rfq_line_id', quotationLineId: 'quotation_line_id', prLineId: 'pr_line_id',
  isRevised: 'is_revised', revisionNotes: 'revision_notes', remarks: 'remarks',
}

export const poLineRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']
    const vals: unknown[] = [id]
    for (const [key, col] of Object.entries(LINE_FIELDS)) {
      if (data[key] !== undefined && data[key] !== null) {
        cols.push(col)
        vals.push(data[key])
      }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(
      `INSERT INTO purchase_order_lines (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`,
      vals,
    )
    return id
  },

  async listForPo(tenantId: string, poId: string) {
    const result = await query(
      `SELECT * FROM purchase_order_lines WHERE tenant_id = $1 AND po_id = $2 ORDER BY line_no`,
      [tenantId, poId],
    )
    return result.rows
  },

  async deleteForPo(poId: string) {
    await query(`DELETE FROM purchase_order_lines WHERE po_id = $1`, [poId])
  },
}

// ════════════════════════════════════════════════════════════════════════════
// SUPPORTING ENTITIES (Taxes, Charges, Attachments, Terms, Approvals, etc.)
// ════════════════════════════════════════════════════════════════════════════

export const poTaxRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(
      `INSERT INTO purchase_order_taxes (id, tenant_id, po_id, po_line_id, tax_type, tax_name, tax_percent, taxable_amount, tax_amount, is_recoverable, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [
        id,
        data['tenantId'],
        data['poId'],
        data['poLineId'] ?? null,
        data['taxType'],
        data['taxName'],
        data['taxPercent'],
        data['taxableAmount'],
        data['taxAmount'],
        data['isRecoverable'] ?? true,
      ],
    )
    return id
  },
  async listForPo(tenantId: string, poId: string) {
    const result = await query(`SELECT * FROM purchase_order_taxes WHERE tenant_id = $1 AND po_id = $2`, [tenantId, poId])
    return result.rows
  },
  async deleteForPo(poId: string) {
    await query(`DELETE FROM purchase_order_taxes WHERE po_id = $1`, [poId])
  },
}

export const poChargeRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(
      `INSERT INTO purchase_order_charges (id, tenant_id, po_id, charge_type, charge_name, amount, percent, is_taxable, tax_percent, tax_amount, gl_account, remarks, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
      [
        id,
        data['tenantId'],
        data['poId'],
        data['chargeType'],
        data['chargeName'],
        data['amount'],
        data['percent'] ?? null,
        data['isTaxable'] ?? false,
        data['taxPercent'] ?? 0,
        data['taxAmount'] ?? 0,
        data['glAccount'] ?? null,
        data['remarks'] ?? null,
      ],
    )
    return id
  },
  async listForPo(tenantId: string, poId: string) {
    const result = await query(`SELECT * FROM purchase_order_charges WHERE tenant_id = $1 AND po_id = $2`, [tenantId, poId])
    return result.rows
  },
  async deleteForPo(poId: string) {
    await query(`DELETE FROM purchase_order_charges WHERE po_id = $1`, [poId])
  },
}

export const poAttachmentRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(
      `INSERT INTO purchase_order_attachments (id, tenant_id, po_id, file_name, file_type, file_size, file_url, category, uploaded_by, uploaded_by_name, is_signed, signed_by, signed_at, remarks, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())`,
      [
        id,
        data['tenantId'],
        data['poId'],
        data['fileName'],
        data['fileType'],
        data['fileSize'],
        data['fileUrl'],
        data['category'] ?? 'GENERAL',
        data['uploadedBy'] ?? null,
        data['uploadedByName'] ?? null,
        data['isSigned'] ?? false,
        data['signedBy'] ?? null,
        data['signedAt'] ?? null,
        data['remarks'] ?? null,
      ],
    )
    return id
  },
  async listForPo(tenantId: string, poId: string) {
    const result = await query(
      `SELECT * FROM purchase_order_attachments WHERE tenant_id = $1 AND po_id = $2 ORDER BY created_at DESC`,
      [tenantId, poId],
    )
    return result.rows
  },
}

export const poTermsRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(
      `INSERT INTO purchase_order_terms (id, tenant_id, po_id, term_type, term_name, term_description, term_value, is_standard, sort_order, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        id,
        data['tenantId'],
        data['poId'],
        data['termType'],
        data['termName'],
        data['termDescription'],
        data['termValue'] ?? null,
        data['isStandard'] ?? true,
        data['sortOrder'] ?? 0,
      ],
    )
    return id
  },
  async listForPo(tenantId: string, poId: string) {
    const result = await query(
      `SELECT * FROM purchase_order_terms WHERE tenant_id = $1 AND po_id = $2 ORDER BY sort_order`,
      [tenantId, poId],
    )
    return result.rows
  },
}

export const poApprovalRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(
      `INSERT INTO purchase_order_approvals (id, tenant_id, po_id, approval_level, approval_sequence, approver_id, approver_name, approver_role, approval_status, approval_date, approval_notes, rejection_reason, approved_amount, is_current, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())`,
      [
        id,
        data['tenantId'],
        data['poId'],
        data['approvalLevel'],
        data['approvalSequence'] ?? 1,
        data['approverId'] ?? null,
        data['approverName'] ?? null,
        data['approverRole'] ?? null,
        data['approvalStatus'],
        data['approvalDate'] ?? null,
        data['approvalNotes'] ?? null,
        data['rejectionReason'] ?? null,
        data['approvedAmount'] ?? null,
        data['isCurrent'] ?? true,
      ],
    )
    return id
  },
  async listForPo(tenantId: string, poId: string) {
    const result = await query(
      `SELECT * FROM purchase_order_approvals WHERE tenant_id = $1 AND po_id = $2 ORDER BY approval_sequence`,
      [tenantId, poId],
    )
    return result.rows
  },
}

export const poRevisionRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(
      `INSERT INTO purchase_order_revisions (id, tenant_id, po_id, revision_no, revision_reason, previous_snapshot, new_snapshot, changed_fields, revised_by, revised_by_name, revision_date, approval_required, approved_by, approved_at, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11, $12, $13, NOW())`,
      [
        id,
        data['tenantId'],
        data['poId'],
        data['revisionNo'],
        data['revisionReason'],
        JSON.stringify(data['previousSnapshot']),
        data['newSnapshot'] ? JSON.stringify(data['newSnapshot']) : null,
        data['changedFields'] ?? [],
        data['revisedBy'] ?? null,
        data['revisedByName'] ?? null,
        data['approvalRequired'] ?? true,
        data['approvedBy'] ?? null,
        data['approvedAt'] ?? null,
      ],
    )
    return id
  },
  async listForPo(tenantId: string, poId: string) {
    const result = await query(
      `SELECT * FROM purchase_order_revisions WHERE tenant_id = $1 AND po_id = $2 ORDER BY revision_no DESC`,
      [tenantId, poId],
    )
    return result.rows
  },
}

export const poHistoryRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(
      `INSERT INTO purchase_order_history (id, tenant_id, po_id, action, from_status, to_status, action_by, action_by_name, action_date, action_notes, metadata, ip_address, user_agent, correlation_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, $11, $12, $13)`,
      [
        id,
        data['tenantId'],
        data['poId'],
        data['action'],
        data['fromStatus'] ?? null,
        data['toStatus'] ?? null,
        data['actionBy'] ?? null,
        data['actionByName'] ?? null,
        data['actionNotes'] ?? null,
        data['metadata'] ? JSON.stringify(data['metadata']) : null,
        data['ipAddress'] ?? null,
        data['userAgent'] ?? null,
        data['correlationId'] ?? null,
      ],
    )
    return id
  },
  async listForPo(tenantId: string, poId: string) {
    const result = await query(
      `SELECT * FROM purchase_order_history WHERE tenant_id = $1 AND po_id = $2 ORDER BY action_date DESC`,
      [tenantId, poId],
    )
    return result.rows
  },
}

export const poDeliveryScheduleRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(
      `INSERT INTO purchase_order_delivery_schedules (id, tenant_id, po_id, po_line_id, delivery_no, scheduled_date, scheduled_qty, received_qty, warehouse_id, warehouse_name, delivery_status, actual_date, remarks, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
      [
        id,
        data['tenantId'],
        data['poId'],
        data['poLineId'],
        data['deliveryNo'] ?? 1,
        data['scheduledDate'],
        data['scheduledQty'],
        data['receivedQty'] ?? 0,
        data['warehouseId'] ?? null,
        data['warehouseName'] ?? null,
        data['deliveryStatus'] ?? 'PENDING',
        data['actualDate'] ?? null,
        data['remarks'] ?? null,
      ],
    )
    return id
  },
  async listForPo(tenantId: string, poId: string) {
    const result = await query(
      `SELECT * FROM purchase_order_delivery_schedules WHERE tenant_id = $1 AND po_id = $2 ORDER BY scheduled_date`,
      [tenantId, poId],
    )
    return result.rows
  },
}

export const poMilestoneRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(
      `INSERT INTO purchase_order_milestones (id, tenant_id, po_id, milestone_no, milestone_name, milestone_description, milestone_date, milestone_amount, milestone_status, completed_date, completed_by, completion_notes, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
      [
        id,
        data['tenantId'],
        data['poId'],
        data['milestoneNo'],
        data['milestoneName'],
        data['milestoneDescription'] ?? null,
        data['milestoneDate'] ?? null,
        data['milestoneAmount'] ?? null,
        data['milestoneStatus'] ?? 'PENDING',
        data['completedDate'] ?? null,
        data['completedBy'] ?? null,
        data['completionNotes'] ?? null,
        data['sortOrder'] ?? 0,
      ],
    )
    return id
  },
  async listForPo(tenantId: string, poId: string) {
    const result = await query(
      `SELECT * FROM purchase_order_milestones WHERE tenant_id = $1 AND po_id = $2 ORDER BY milestone_no`,
      [tenantId, poId],
    )
    return result.rows
  },
}

export const poCommunicationRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(
      `INSERT INTO purchase_order_communications (id, tenant_id, po_id, direction, channel, from_address, to_address, subject, message, communication_type, is_important, sent_by, sent_by_name, sent_date, attachments, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), $14, NOW())`,
      [
        id,
        data['tenantId'],
        data['poId'],
        data['direction'],
        data['channel'],
        data['fromAddress'] ?? null,
        data['toAddress'] ?? null,
        data['subject'] ?? null,
        data['message'],
        data['communicationType'] ?? null,
        data['isImportant'] ?? false,
        data['sentBy'] ?? null,
        data['sentByName'] ?? null,
        data['attachments'] ?? [],
      ],
    )
    return id
  },
  async listForPo(tenantId: string, poId: string) {
    const result = await query(
      `SELECT * FROM purchase_order_communications WHERE tenant_id = $1 AND po_id = $2 ORDER BY sent_date DESC`,
      [tenantId, poId],
    )
    return result.rows
  },
}

/** Procurement Repository — Database operations for Purchase Requisitions */
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

export const prRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', prNumber: 'pr_number', companyId: 'company_id', businessUnitId: 'business_unit_id',
      plantId: 'plant_id', warehouseId: 'warehouse_id', departmentId: 'department_id',
      requesterId: 'requester_id', requesterName: 'requester_name', requesterDept: 'requester_dept',
      requisitionType: 'requisition_type', priority: 'priority',
      requiredDate: 'required_date', expectedDeliveryDate: 'expected_delivery_date',
      budgetId: 'budget_id', budgetAmount: 'budget_amount', estimatedTotal: 'estimated_total', currency: 'currency',
      remarks: 'remarks', internalNotes: 'internal_notes',
    }
    const cols: string[] = ['id']
    const vals: unknown[] = [id]
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO purchase_requisitions (${cols.join(', ')}, status, version, created_at, updated_at) VALUES (${ph}, 'DRAFT', 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },

  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM purchase_requisitions WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },

  async findByPrNumber(tenantId: string, prNumber: string) {
    const result = await query(`SELECT * FROM purchase_requisitions WHERE tenant_id = $1 AND pr_number = $2 AND deleted_at IS NULL`, [tenantId, prNumber])
    return result.rows[0] ?? null
  },

  async list(tenantId: string, params: { page?: number; pageSize?: number; search?: string; status?: string; priority?: string; requesterId?: string; plantId?: string; departmentId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.search) { where += ` AND (pr_number ILIKE $${idx} OR remarks ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.priority) { where += ` AND priority = $${idx++}`; sqlParams.push(params.priority) }
    if (params.requesterId) { where += ` AND requester_id = $${idx++}`; sqlParams.push(params.requesterId) }
    if (params.plantId) { where += ` AND plant_id = $${idx++}`; sqlParams.push(params.plantId) }
    if (params.departmentId) { where += ` AND department_id = $${idx++}`; sqlParams.push(params.departmentId) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM purchase_requisitions WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM purchase_requisitions WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },

  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number, updatedBy?: string) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      priority: 'priority', requiredDate: 'required_date', expectedDeliveryDate: 'expected_delivery_date',
      budgetAmount: 'budget_amount', estimatedTotal: 'estimated_total',
      remarks: 'remarks', internalNotes: 'internal_notes',
      currentApproverId: 'current_approver_id', currentApproverName: 'current_approver_name', approvalLevel: 'approval_level',
      status: 'status', rejectionReason: 'rejection_reason', cancelledReason: 'cancelled_reason',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(updatedBy ?? null, version)
    const result = await query(`UPDATE purchase_requisitions SET ${setParts.join(', ')}, updated_by = $${idx - 1} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },

  async softDelete(tenantId: string, id: string, version: number) {
    const result = await query(`UPDATE purchase_requisitions SET deleted_at = NOW(), version = version + 1 WHERE tenant_id = $1 AND id = $2 AND version = $3 AND deleted_at IS NULL RETURNING id`, [tenantId, id, version])
    return result.rows.length > 0
  },

  async generatePrNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM purchase_requisitions WHERE tenant_id = $1 AND pr_number LIKE 'PR-${year}-%'`, [tenantId])
    const seq = Number(countResult.rows[0]!.cnt) + 1
    return `PR-${year}-${String(seq).padStart(6, '0')}`
  },
}

export const prLineRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', prId: 'pr_id', lineNo: 'line_no',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      requestedQty: 'requested_qty', uomId: 'uom_id', uomCode: 'uom_code',
      expectedPrice: 'expected_price', expectedTotal: 'expected_total', currency: 'currency',
      preferredSupplierId: 'preferred_supplier_id', preferredSupplierCode: 'preferred_supplier_code',
      requiredDate: 'required_date', remarks: 'remarks',
    }
    const cols: string[] = ['id']
    const vals: unknown[] = [id]
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO purchase_requisition_lines (${cols.join(', ')}, status, created_at, updated_at) VALUES (${ph}, 'OPEN', NOW(), NOW())`, vals)
    return id
  },

  async listForPr(tenantId: string, prId: string) {
    const result = await query(`SELECT * FROM purchase_requisition_lines WHERE tenant_id = $1 AND pr_id = $2 ORDER BY line_no`, [tenantId, prId])
    return result.rows
  },

  async deleteForPr(prId: string) {
    await query(`DELETE FROM purchase_requisition_lines WHERE pr_id = $1`, [prId])
  },
}

export const prApprovalRepository = {
  async create(data: { tenantId: string; prId: string; approvalLevel: number; approverId: string; approverName: string; approverRole: string; action: string; comments?: string }) {
    const id = randomUUID()
    await query(`INSERT INTO purchase_requisition_approvals (id, tenant_id, pr_id, approval_level, approver_id, approver_name, approver_role, action, comments, approved_at, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())`, [id, data.tenantId, data.prId, data.approvalLevel, data.approverId, data.approverName, data.approverRole, data.action, data.comments ?? null])
    return id
  },

  async listForPr(tenantId: string, prId: string) {
    const result = await query(`SELECT * FROM purchase_requisition_approvals WHERE tenant_id = $1 AND pr_id = $2 ORDER BY approval_level, approved_at`, [tenantId, prId])
    return result.rows
  },
}

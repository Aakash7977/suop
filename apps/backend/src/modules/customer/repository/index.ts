/** Customer Repository — Database operations for Customer Master */
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

export const customerRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', customerCode: 'customer_code', customerType: 'customer_type',
      legalName: 'legal_name', tradeName: 'trade_name', shortName: 'short_name', description: 'description',
      groupId: 'group_id', territory: 'territory', salesRepId: 'sales_rep_id', loyaltyCategory: 'loyalty_category',
      gstin: 'gstin', pan: 'pan', tan: 'tan', fssaiLicense: 'fssai_license',
      primaryEmail: 'primary_email', secondaryEmail: 'secondary_email', phone: 'phone', mobile: 'mobile', fax: 'fax', website: 'website',
      bankName: 'bank_name', accountNumber: 'account_number', ifscCode: 'ifsc_code',
      paymentTerms: 'payment_terms', creditLimit: 'credit_limit', creditDays: 'credit_days', currency: 'currency',
      riskRating: 'risk_rating', tags: 'tags',
    }
    const cols: string[] = ['id']
    const vals: unknown[] = [id]
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO customers (${cols.join(', ')}, status, outstanding_balance, credit_hold, version, created_at, updated_at) VALUES (${ph}, 'LEAD', 0, false, 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },

  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM customers WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },

  async findByCode(tenantId: string, code: string) {
    const result = await query(`SELECT * FROM customers WHERE tenant_id = $1 AND customer_code = $2 AND deleted_at IS NULL`, [tenantId, code])
    return result.rows[0] ?? null
  },

  async findByGstin(gstin: string) {
    const result = await query(`SELECT * FROM customers WHERE gstin = $1 AND deleted_at IS NULL LIMIT 1`, [gstin])
    return result.rows[0] ?? null
  },

  async list(tenantId: string, params: { page?: number; pageSize?: number; search?: string; status?: string; customerType?: string; groupId?: string; creditHold?: boolean } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.search) { where += ` AND (customer_code ILIKE $${idx} OR trade_name ILIKE $${idx} OR legal_name ILIKE $${idx} OR gstin ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.customerType) { where += ` AND customer_type = $${idx++}`; sqlParams.push(params.customerType) }
    if (params.groupId) { where += ` AND group_id = $${idx++}`; sqlParams.push(params.groupId) }
    if (params.creditHold !== undefined) { where += ` AND credit_hold = $${idx++}`; sqlParams.push(params.creditHold) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM customers WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM customers WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },

  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number, updatedBy?: string) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      legalName: 'legal_name', tradeName: 'trade_name', shortName: 'short_name', description: 'description',
      groupId: 'group_id', territory: 'territory', gstin: 'gstin', pan: 'pan',
      primaryEmail: 'primary_email', phone: 'phone', mobile: 'mobile', website: 'website',
      bankName: 'bank_name', accountNumber: 'account_number', ifscCode: 'ifsc_code',
      paymentTerms: 'payment_terms', creditLimit: 'credit_limit', creditDays: 'credit_days',
      riskRating: 'risk_rating', creditHold: 'credit_hold', outstandingBalance: 'outstanding_balance',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(updatedBy ?? null, version)
    const result = await query(`UPDATE customers SET ${setParts.join(', ')}, updated_by = $${idx - 1} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },

  async softDelete(tenantId: string, id: string, version: number) {
    const result = await query(`UPDATE customers SET deleted_at = NOW(), status = 'ARCHIVED', version = version + 1 WHERE tenant_id = $1 AND id = $2 AND version = $3 AND deleted_at IS NULL RETURNING id`, [tenantId, id, version])
    return result.rows.length > 0
  },

  async updateStatus(tenantId: string, id: string, status: string, version: number, updatedBy?: string) {
    const result = await query(`UPDATE customers SET status = $3, version = version + 1, updated_at = NOW(), updated_by = $4 WHERE tenant_id = $1 AND id = $2 AND version = $5 AND deleted_at IS NULL RETURNING *`, [tenantId, id, status, updatedBy ?? null, version])
    return result.rows[0] ?? null
  },
}

export const customerContactRepository = {
  async create(data: { tenantId: string; customerId: string; name: string; designation?: string; email?: string; phone?: string; mobile?: string; isPrimary?: boolean }) {
    const id = randomUUID()
    await query(`INSERT INTO customer_contacts (id, tenant_id, customer_id, name, designation, email, phone, mobile, is_primary, is_active, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,NOW(),NOW())`, [id, data.tenantId, data.customerId, data.name, data.designation ?? null, data.email ?? null, data.phone ?? null, data.mobile ?? null, data.isPrimary ?? false])
    return id
  },
  async listForCustomer(tenantId: string, customerId: string) {
    const result = await query(`SELECT * FROM customer_contacts WHERE tenant_id = $1 AND customer_id = $2 AND is_active = true ORDER BY is_primary DESC`, [tenantId, customerId])
    return result.rows
  },
}

export const customerAddressRepository = {
  async create(data: { tenantId: string; customerId: string; addressType: string; addressLine1: string; city: string; state?: string; country?: string; postalCode?: string; isPrimary?: boolean }) {
    const id = randomUUID()
    await query(`INSERT INTO customer_addresses (id, tenant_id, customer_id, address_type, address_line_1, city, state, country, postal_code, is_primary, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())`, [id, data.tenantId, data.customerId, data.addressType, data.addressLine1, data.city, data.state ?? null, data.country ?? 'India', data.postalCode ?? null, data.isPrimary ?? false])
    return id
  },
  async listForCustomer(tenantId: string, customerId: string) {
    const result = await query(`SELECT * FROM customer_addresses WHERE tenant_id = $1 AND customer_id = $2 ORDER BY is_primary DESC`, [tenantId, customerId])
    return result.rows
  },
}

export const customerGroupRepository = {
  async list(tenantId: string) {
    const result = await query(`SELECT * FROM customer_groups WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY name`, [tenantId])
    return result.rows
  },
  async create(data: { tenantId: string; code: string; name: string; description?: string }) {
    const id = randomUUID()
    await query(`INSERT INTO customer_groups (id, tenant_id, code, name, description, is_active, version, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,true,0,NOW(),NOW())`, [id, data.tenantId, data.code, data.name, data.description ?? null])
    return id
  },
}

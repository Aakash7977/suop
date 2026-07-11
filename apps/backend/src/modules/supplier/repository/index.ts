/** Supplier Repository — Database operations for Supplier Master */
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

export const supplierRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', vendorCode: 'vendor_code', legalName: 'legal_name', tradeName: 'trade_name',
      shortName: 'short_name', description: 'description', categoryId: 'category_id',
      supplierType: 'supplier_type', vendorType: 'vendor_type',
      gstin: 'gstin', pan: 'pan', cin: 'cin', tan: 'tan', fssaiLicense: 'fssai_license',
      msmeRegNo: 'msme_reg_no', msmeType: 'msme_type', iecCode: 'iec_code',
      primaryEmail: 'primary_email', secondaryEmail: 'secondary_email', phone: 'phone', fax: 'fax', website: 'website',
      bankName: 'bank_name', bankBranch: 'bank_branch', accountNumber: 'account_number', ifscCode: 'ifsc_code',
      accountType: 'account_type', upiId: 'upi_id',
      paymentTerms: 'payment_terms', creditLimit: 'credit_limit', creditDays: 'credit_days', currency: 'currency',
      paymentMethod: 'payment_method',
      riskLevel: 'risk_level', isPreferred: 'is_preferred', isStrategic: 'is_strategic',
    }
    const cols: string[] = ['id']
    const vals: unknown[] = [id]
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO suppliers (${cols.join(', ')}, status, version, created_at, updated_at) VALUES (${ph}, 'DRAFT', 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },

  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM suppliers WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },

  async findByVendorCode(tenantId: string, vendorCode: string) {
    const result = await query(`SELECT * FROM suppliers WHERE tenant_id = $1 AND vendor_code = $2 AND deleted_at IS NULL`, [tenantId, vendorCode])
    return result.rows[0] ?? null
  },

  async findByGstin(gstin: string) {
    const result = await query(`SELECT * FROM suppliers WHERE gstin = $1 AND deleted_at IS NULL LIMIT 1`, [gstin])
    return result.rows[0] ?? null
  },

  async list(tenantId: string, params: { page?: number; pageSize?: number; search?: string; status?: string; vendorType?: string; categoryId?: string; isPreferred?: boolean } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.search) { where += ` AND (vendor_code ILIKE $${idx} OR legal_name ILIKE $${idx} OR trade_name ILIKE $${idx} OR gstin ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.vendorType) { where += ` AND vendor_type = $${idx++}`; sqlParams.push(params.vendorType) }
    if (params.categoryId) { where += ` AND category_id = $${idx++}`; sqlParams.push(params.categoryId) }
    if (params.isPreferred !== undefined) { where += ` AND is_preferred = $${idx++}`; sqlParams.push(params.isPreferred) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM suppliers WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM suppliers WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },

  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number, updatedBy?: string) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      legalName: 'legal_name', tradeName: 'trade_name', shortName: 'short_name', description: 'description',
      categoryId: 'category_id', gstin: 'gstin', pan: 'pan', fssaiLicense: 'fssai_license',
      primaryEmail: 'primary_email', phone: 'phone', website: 'website',
      bankName: 'bank_name', accountNumber: 'account_number', ifscCode: 'ifsc_code',
      paymentTerms: 'payment_terms', creditLimit: 'credit_limit', creditDays: 'credit_days',
      riskLevel: 'risk_level', isPreferred: 'is_preferred', isStrategic: 'is_strategic',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(updatedBy ?? null, version)
    const result = await query(`UPDATE suppliers SET ${setParts.join(', ')}, updated_by = $${idx - 1} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },

  async softDelete(tenantId: string, id: string, version: number) {
    const result = await query(`UPDATE suppliers SET deleted_at = NOW(), status = 'ARCHIVED', version = version + 1 WHERE tenant_id = $1 AND id = $2 AND version = $3 AND deleted_at IS NULL RETURNING id`, [tenantId, id, version])
    return result.rows.length > 0
  },

  async updateStatus(tenantId: string, id: string, status: string, version: number, updatedBy?: string) {
    const result = await query(`UPDATE suppliers SET status = $3, version = version + 1, updated_at = NOW(), updated_by = $4 WHERE tenant_id = $1 AND id = $2 AND version = $5 AND deleted_at IS NULL RETURNING *`, [tenantId, id, status, updatedBy ?? null, version])
    return result.rows[0] ?? null
  },

  async blacklist(tenantId: string, id: string, reason: string, blacklistedBy: string) {
    await query(`UPDATE suppliers SET status = 'BLACKLISTED', blacklist_reason = $3, blacklisted_at = NOW(), blacklisted_by = $4, version = version + 1, updated_at = NOW() WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id, reason, blacklistedBy])
  },
}

export const supplierContactRepository = {
  async create(data: { tenantId: string; supplierId: string; name: string; designation?: string; email?: string; phone?: string; mobile?: string; isPrimary?: boolean }) {
    const id = randomUUID()
    await query(`INSERT INTO supplier_contacts (id, tenant_id, supplier_id, name, designation, email, phone, mobile, is_primary, is_active, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,NOW(),NOW())`, [id, data.tenantId, data.supplierId, data.name, data.designation ?? null, data.email ?? null, data.phone ?? null, data.mobile ?? null, data.isPrimary ?? false])
    return id
  },
  async listForSupplier(tenantId: string, supplierId: string) {
    const result = await query(`SELECT * FROM supplier_contacts WHERE tenant_id = $1 AND supplier_id = $2 AND is_active = true ORDER BY is_primary DESC`, [tenantId, supplierId])
    return result.rows
  },
}

export const supplierAddressRepository = {
  async create(data: { tenantId: string; supplierId: string; addressType: string; addressLine1: string; city: string; state?: string; country?: string; postalCode?: string; isPrimary?: boolean }) {
    const id = randomUUID()
    await query(`INSERT INTO supplier_addresses (id, tenant_id, supplier_id, address_type, address_line_1, city, state, country, postal_code, is_primary, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())`, [id, data.tenantId, data.supplierId, data.addressType, data.addressLine1, data.city, data.state ?? null, data.country ?? 'India', data.postalCode ?? null, data.isPrimary ?? false])
    return id
  },
  async listForSupplier(tenantId: string, supplierId: string) {
    const result = await query(`SELECT * FROM supplier_addresses WHERE tenant_id = $1 AND supplier_id = $2 ORDER BY is_primary DESC`, [tenantId, supplierId])
    return result.rows
  },
}

export const supplierComplianceRepository = {
  async create(data: { tenantId: string; supplierId: string; complianceType: string; licenseNumber?: string; issuingAuthority?: string; issuedDate?: string; expiryDate?: string; documentUrl?: string; notes?: string }) {
    const id = randomUUID()
    await query(`INSERT INTO supplier_compliances (id, tenant_id, supplier_id, compliance_type, license_number, issuing_authority, issued_date, expiry_date, document_url, status, notes, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'ACTIVE',$10,NOW(),NOW())`, [id, data.tenantId, data.supplierId, data.complianceType, data.licenseNumber ?? null, data.issuingAuthority ?? null, data.issuedDate ?? null, data.expiryDate ?? null, data.documentUrl ?? null, data.notes ?? null])
    return id
  },
  async listForSupplier(tenantId: string, supplierId: string) {
    const result = await query(`SELECT * FROM supplier_compliances WHERE tenant_id = $1 AND supplier_id = $2 ORDER BY expiry_date ASC`, [tenantId, supplierId])
    return result.rows
  },
  async findExpiring(tenantId: string, withinDays: number = 30) {
    const result = await query(`SELECT * FROM supplier_compliances WHERE tenant_id = $1 AND status = 'ACTIVE' AND expiry_date IS NOT NULL AND expiry_date <= NOW() + INTERVAL '${withinDays} days' AND expiry_date > NOW()`, [tenantId])
    return result.rows
  },
  async updateStatus(id: string, status: string) {
    await query(`UPDATE supplier_compliances SET status = $2, updated_at = NOW() WHERE id = $1`, [id, status])
  },
}

export const supplierProductMappingRepository = {
  async create(data: { tenantId: string; supplierId: string; productId: string; supplierSku?: string; unitPrice?: number; moq?: number; leadTimeDays?: number; isPreferred?: boolean }) {
    const id = randomUUID()
    await query(`INSERT INTO supplier_product_mappings (id, tenant_id, supplier_id, product_id, supplier_sku, unit_price, moq, lead_time_days, is_preferred, status, effective_from, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'ACTIVE',NOW(),NOW(),NOW())`, [id, data.tenantId, data.supplierId, data.productId, data.supplierSku ?? null, data.unitPrice ?? null, data.moq ?? null, data.leadTimeDays ?? null, data.isPreferred ?? false])
    return id
  },
  async listForSupplier(tenantId: string, supplierId: string) {
    const result = await query(`SELECT spm.*, p.sku, p.name FROM supplier_product_mappings spm JOIN products p ON spm.product_id = p.id WHERE spm.tenant_id = $1 AND spm.supplier_id = $2 AND spm.status = 'ACTIVE'`, [tenantId, supplierId])
    return result.rows
  },
  async listForProduct(tenantId: string, productId: string) {
    const result = await query(`SELECT spm.*, s.vendor_code, s.legal_name FROM supplier_product_mappings spm JOIN suppliers s ON spm.supplier_id = s.id WHERE spm.tenant_id = $1 AND spm.product_id = $2 AND spm.status = 'ACTIVE'`, [tenantId, productId])
    return result.rows
  },
  async revoke(id: string) {
    await query(`UPDATE supplier_product_mappings SET status = 'INACTIVE', updated_at = NOW() WHERE id = $1`, [id])
  },
}

export const supplierCategoryRepository = {
  async list(tenantId: string) {
    const result = await query(`SELECT * FROM supplier_categories WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY name`, [tenantId])
    return result.rows
  },
  async create(data: { tenantId: string; code: string; name: string; description?: string; supplierType?: string; vendorType?: string }) {
    const id = randomUUID()
    await query(`INSERT INTO supplier_categories (id, tenant_id, code, name, description, supplier_type, vendor_type, is_active, version, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,true,0,NOW(),NOW())`, [id, data.tenantId, data.code, data.name, data.description ?? null, data.supplierType ?? 'DOMESTIC', data.vendorType ?? 'MANUFACTURER'])
    return id
  },
}

import type { CompanyInput, BusinessUnitInput, PlantInput, WarehouseInput, DepartmentInput, CostCenterInput, FinancialYearInput, ListParams } from "../types"
/**
 * Organization Repository — Database operations for Organization entities.
 *
 * Uses PGlite directly (acceptance gate). In production, swap to Prisma client.
 * Every method includes tenant_id scoping for multi-tenancy.
 */

import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

// ─── Helper: Build WHERE clause from filter ─────────────────────────────────


// ─── Company ────────────────────────────────────────────────────────────────

export const companyRepository = {
  async create(tenantId: string, input: CompanyInput, createdBy?: string) {
    const id = randomUUID()
    await query(
      `INSERT INTO companies (
        id, tenant_id, code, name, legal_name, description, parent_id,
        gstin, pan, cin, email, phone, website,
        address_line_1, address_line_2, city, state, country, postal_code,
        default_timezone, default_currency, status, version, created_at, updated_at, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,'DRAFT',0,NOW(),NOW(),$22)`,
      [id, tenantId, input.code, input.name, input.legalName ?? null, input.description ?? null,
       input.parentId ?? null, input.gstin ?? null, input.pan ?? null, input.cin ?? null,
       input.email ?? null, input.phone ?? null, input.website ?? null,
       input.addressLine1 ?? null, input.addressLine2 ?? null, input.city ?? null,
       input.state ?? null, input.country ?? 'India', input.postalCode ?? null,
       input.defaultTimezone ?? null, input.defaultCurrency ?? null, createdBy ?? null]
    )
    return this.findById(tenantId, id)
  },

  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM companies WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },

  async findByCode(tenantId: string, code: string) {
    const result = await query(`SELECT * FROM companies WHERE tenant_id = $1 AND code = $2 AND deleted_at IS NULL`, [tenantId, code])
    return result.rows[0] ?? null
  },

  async list(tenantId: string, params: ListParams = {}) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 25
    const offset = (page - 1) * pageSize
    const sortBy = params.sortBy ?? 'created_at'
    const sortDir = params.sortDir ?? 'desc'

    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]
    let idx = 2

    if (params.search) {
      where += ` AND (code ILIKE $${idx} OR name ILIKE $${idx})`
      sqlParams.push(`%${params.search}%`)
      idx++
    }

    if (params.filter) {
      for (const [key, value] of Object.entries(params.filter)) {
        if (value !== undefined && value !== null) {
          where += ` AND ${key} = $${idx++}`
          sqlParams.push(value)
        }
      }
    }

    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM companies WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)

    const result = await query(
      `SELECT * FROM companies WHERE ${where} ORDER BY ${sortBy} ${sortDir} LIMIT $${idx} OFFSET $${idx + 1}`,
      [...sqlParams, pageSize, offset]
    )

    return { rows: result.rows, total, page, pageSize }
  },

  async update(tenantId: string, id: string, input: Partial<CompanyInput>, version: number, updatedBy?: string) {
    const result = await query(
      `UPDATE companies SET
        name = COALESCE($3, name),
        legal_name = COALESCE($4, legal_name),
        description = COALESCE($5, description),
        gstin = COALESCE($6, gstin),
        email = COALESCE($7, email),
        phone = COALESCE($8, phone),
        address_line_1 = COALESCE($9, address_line_1),
        city = COALESCE($10, city),
        state = COALESCE($11, state),
        status = COALESCE($12, status),
        version = version + 1,
        updated_at = NOW(),
        updated_by = $13
       WHERE tenant_id = $1 AND id = $2 AND version = $14 AND deleted_at IS NULL
       RETURNING *`,
      [tenantId, id, input.name ?? null, input.legalName ?? null, input.description ?? null,
       input.gstin ?? null, input.email ?? null, input.phone ?? null,
       input.addressLine1 ?? null, input.city ?? null, input.state ?? null,
       (input as Record<string, unknown>).status ?? null, updatedBy ?? null, version]
    )
    return result.rows[0] ?? null
  },

  async softDelete(tenantId: string, id: string, version: number, deletedBy?: string) {
    const result = await query(
      `UPDATE companies SET deleted_at = NOW(), version = version + 1
       WHERE tenant_id = $1 AND id = $2 AND version = $3 AND deleted_at IS NULL
       RETURNING id`,
      [tenantId, id, version, deletedBy ?? null]
    )
    return result.rows.length > 0
  },

  async updateStatus(tenantId: string, id: string, status: string, version: number, updatedBy?: string) {
    const result = await query(
      `UPDATE companies SET status = $3, version = version + 1, updated_at = NOW(), updated_by = $4
       WHERE tenant_id = $1 AND id = $2 AND version = $5 AND deleted_at IS NULL
       RETURNING *`,
      [tenantId, id, status, updatedBy ?? null, version]
    )
    return result.rows[0] ?? null
  },


  async restore(tenantId: string, id: string) {
    const result = await query(
      `UPDATE companies SET deleted_at = NULL, deleted_by = NULL, version = version + 1 WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NOT NULL RETURNING *`,
      [tenantId, id]
    )
    return result.rows[0] ?? null
  },

  async hardDelete(tenantId: string, id: string) {
    await query(`DELETE FROM companies WHERE tenant_id = $1 AND id = $2`, [tenantId, id])
  },

  async getChildren(tenantId: string, parentId: string) {
    const result = await query(`SELECT * FROM companies WHERE tenant_id = $1 AND parent_id = $2 AND deleted_at IS NULL`, [tenantId, parentId])
    return result.rows
  },
}

// ─── Business Unit ──────────────────────────────────────────────────────────

export const businessUnitRepository = {
  async create(tenantId: string, input: BusinessUnitInput, createdBy?: string) {
    const id = randomUUID()
    await query(
      `INSERT INTO business_units (id, tenant_id, company_id, code, name, description, parent_id, status, version, created_at, updated_at, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'DRAFT',0,NOW(),NOW(),$8)`,
      [id, tenantId, input.companyId, input.code, input.name, input.description ?? null, input.parentId ?? null, createdBy ?? null]
    )
    return this.findById(tenantId, id)
  },

  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM business_units WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },

  async list(tenantId: string, params: ListParams = {}) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 25
    const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]
    let idx = 2
    if (params.search) {
      where += ` AND (code ILIKE $${idx} OR name ILIKE $${idx})`
      sqlParams.push(`%${params.search}%`)
      idx++
    }
    if (params.filter?.companyId) {
      where += ` AND company_id = $${idx++}`
      sqlParams.push(params.filter.companyId)
    }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM business_units WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM business_units WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },

  async update(tenantId: string, id: string, input: Partial<BusinessUnitInput>, version: number, updatedBy?: string) {
    const result = await query(
      `UPDATE business_units SET name = COALESCE($3, name), description = COALESCE($4, description), version = version + 1, updated_at = NOW(), updated_by = $5
       WHERE tenant_id = $1 AND id = $2 AND version = $6 AND deleted_at IS NULL RETURNING *`,
      [tenantId, id, input.name ?? null, input.description ?? null, updatedBy ?? null, version]
    )
    return result.rows[0] ?? null
  },

  async softDelete(tenantId: string, id: string, version: number, deletedBy?: string) {
    const result = await query(`UPDATE business_units SET deleted_at = NOW(), deleted_by = $4, version = version + 1 WHERE tenant_id = $1 AND id = $2 AND version = $3 AND deleted_at IS NULL RETURNING id`, [tenantId, id, version, deletedBy ?? null])
    return result.rows.length > 0
  },

  async updateStatus(tenantId: string, id: string, status: string, version: number, updatedBy?: string) {
    const result = await query(`UPDATE business_units SET status = $3, version = version + 1, updated_at = NOW(), updated_by = $4 WHERE tenant_id = $1 AND id = $2 AND version = $5 AND deleted_at IS NULL RETURNING *`, [tenantId, id, status, updatedBy ?? null, version])
    return result.rows[0] ?? null
  },
}

// ─── Plant ──────────────────────────────────────────────────────────────────

export const plantRepository = {
  async create(tenantId: string, input: PlantInput, createdBy?: string) {
    const id = randomUUID()
    await query(
      `INSERT INTO plants (id, tenant_id, region_id, code, name, description, plant_type, address_line_1, address_line_2, city, state, country, postal_code, timezone, currency, email, phone, status, version, created_at, updated_at, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'DRAFT',0,NOW(),NOW(),$18)`,
      [id, tenantId, input.regionId, input.code, input.name, input.description ?? null,
       input.plantType ?? 'MANUFACTURING', input.addressLine1 ?? null, input.addressLine2 ?? null,
       input.city ?? null, input.state ?? null, input.country ?? 'India', input.postalCode ?? null,
       input.timezone ?? 'Asia/Kolkata', input.currency ?? 'INR', input.email ?? null, input.phone ?? null, createdBy ?? null]
    )
    return this.findById(tenantId, id)
  },

  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM plants WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },

  async list(tenantId: string, params: ListParams = {}) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 25
    const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]
    let idx = 2
    if (params.search) {
      where += ` AND (code ILIKE $${idx} OR name ILIKE $${idx})`
      sqlParams.push(`%${params.search}%`)
      idx++
    }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM plants WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM plants WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },

  async update(tenantId: string, id: string, input: Partial<PlantInput>, version: number, updatedBy?: string) {
    const result = await query(
      `UPDATE plants SET name = COALESCE($3, name), description = COALESCE($4, description), email = COALESCE($5, email), phone = COALESCE($6, phone), version = version + 1, updated_at = NOW(), updated_by = $7
       WHERE tenant_id = $1 AND id = $2 AND version = $8 AND deleted_at IS NULL RETURNING *`,
      [tenantId, id, input.name ?? null, input.description ?? null, input.email ?? null, input.phone ?? null, updatedBy ?? null, version]
    )
    return result.rows[0] ?? null
  },

  async softDelete(tenantId: string, id: string, version: number, deletedBy?: string) {
    const result = await query(`UPDATE plants SET deleted_at = NOW(), deleted_by = $4, version = version + 1 WHERE tenant_id = $1 AND id = $2 AND version = $3 AND deleted_at IS NULL RETURNING id`, [tenantId, id, version, deletedBy ?? null])
    return result.rows.length > 0
  },

  async updateStatus(tenantId: string, id: string, status: string, version: number, updatedBy?: string) {
    const result = await query(`UPDATE plants SET status = $3, version = version + 1, updated_at = NOW(), updated_by = $4 WHERE tenant_id = $1 AND id = $2 AND version = $5 AND deleted_at IS NULL RETURNING *`, [tenantId, id, status, updatedBy ?? null, version])
    return result.rows[0] ?? null
  },
}

// ─── Warehouse ──────────────────────────────────────────────────────────────

export const warehouseRepository = {
  async create(tenantId: string, input: WarehouseInput, createdBy?: string) {
    const id = randomUUID()
    await query(
      `INSERT INTO warehouses (id, tenant_id, plant_id, code, name, description, warehouse_type, address_line_1, city, state, country, timezone, is_default, total_area_sqft, status, version, created_at, updated_at, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'DRAFT',0,NOW(),NOW(),$15)`,
      [id, tenantId, input.plantId, input.code, input.name, input.description ?? null,
       input.warehouseType ?? 'DISTRIBUTION', input.addressLine1 ?? null, input.city ?? null,
       input.state ?? null, input.country ?? 'India', input.timezone ?? 'Asia/Kolkata',
       input.isDefault ?? false, input.totalAreaSqft ?? null, createdBy ?? null]
    )
    return this.findById(tenantId, id)
  },

  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM warehouses WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },

  async list(tenantId: string, params: ListParams = {}) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 25
    const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]
    let idx = 2
    if (params.search) {
      where += ` AND (code ILIKE $${idx} OR name ILIKE $${idx})`
      sqlParams.push(`%${params.search}%`)
      idx++
    }
    if (params.filter?.plantId) {
      where += ` AND plant_id = $${idx++}`
      sqlParams.push(params.filter.plantId)
    }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM warehouses WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM warehouses WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },

  async update(tenantId: string, id: string, input: Partial<WarehouseInput>, version: number, updatedBy?: string) {
    const result = await query(
      `UPDATE warehouses SET name = COALESCE($3, name), description = COALESCE($4, description), version = version + 1, updated_at = NOW(), updated_by = $5
       WHERE tenant_id = $1 AND id = $2 AND version = $6 AND deleted_at IS NULL RETURNING *`,
      [tenantId, id, input.name ?? null, input.description ?? null, updatedBy ?? null, version]
    )
    return result.rows[0] ?? null
  },

  async softDelete(tenantId: string, id: string, version: number, deletedBy?: string) {
    const result = await query(`UPDATE warehouses SET deleted_at = NOW(), deleted_by = $4, version = version + 1 WHERE tenant_id = $1 AND id = $2 AND version = $3 AND deleted_at IS NULL RETURNING id`, [tenantId, id, version, deletedBy ?? null])
    return result.rows.length > 0
  },

  async updateStatus(tenantId: string, id: string, status: string, version: number, updatedBy?: string) {
    const result = await query(`UPDATE warehouses SET status = $3, version = version + 1, updated_at = NOW(), updated_by = $4 WHERE tenant_id = $1 AND id = $2 AND version = $5 AND deleted_at IS NULL RETURNING *`, [tenantId, id, status, updatedBy ?? null, version])
    return result.rows[0] ?? null
  },
}

// ─── Department ─────────────────────────────────────────────────────────────

export const departmentRepository = {
  async create(tenantId: string, input: DepartmentInput, createdBy?: string) {
    const id = randomUUID()
    await query(
      `INSERT INTO departments (id, tenant_id, code, name, description, company_id, business_unit_id, plant_id, parent_id, status, version, created_at, updated_at, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'ACTIVE',0,NOW(),NOW(),$10)`,
      [id, tenantId, input.code, input.name, input.description ?? null, input.companyId ?? null, input.businessUnitId ?? null, input.plantId ?? null, input.parentId ?? null, createdBy ?? null]
    )
    return this.findById(tenantId, id)
  },

  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM departments WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },

  async list(tenantId: string, params: ListParams = {}) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 25
    const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]
    let idx = 2
    if (params.search) {
      where += ` AND (code ILIKE $${idx} OR name ILIKE $${idx})`
      sqlParams.push(`%${params.search}%`)
      idx++
    }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM departments WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM departments WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },

  async softDelete(tenantId: string, id: string, version: number, deletedBy?: string) {
    const result = await query(`UPDATE departments SET deleted_at = NOW(), deleted_by = $4, version = version + 1 WHERE tenant_id = $1 AND id = $2 AND version = $3 AND deleted_at IS NULL RETURNING id`, [tenantId, id, version, deletedBy ?? null])
    return result.rows.length > 0
  },
}

// ─── Cost Center ────────────────────────────────────────────────────────────

export const costCenterRepository = {
  async create(tenantId: string, input: CostCenterInput, createdBy?: string) {
    const id = randomUUID()
    await query(
      `INSERT INTO cost_centers (id, tenant_id, code, name, description, plant_id, department_id, cost_center_type, status, version, created_at, updated_at, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'ACTIVE',0,NOW(),NOW(),$9)`,
      [id, tenantId, input.code, input.name, input.description ?? null, input.plantId ?? null, input.departmentId ?? null, input.costCenterType ?? 'PRODUCTION', createdBy ?? null]
    )
    return this.findById(tenantId, id)
  },

  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM cost_centers WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },

  async list(tenantId: string, params: ListParams = {}) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 25
    const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]
    let idx = 2
    if (params.search) {
      where += ` AND (code ILIKE $${idx} OR name ILIKE $${idx})`
      sqlParams.push(`%${params.search}%`)
      idx++
    }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM cost_centers WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM cost_centers WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },

  async softDelete(tenantId: string, id: string, version: number, deletedBy?: string) {
    const result = await query(`UPDATE cost_centers SET deleted_at = NOW(), deleted_by = $4, version = version + 1 WHERE tenant_id = $1 AND id = $2 AND version = $3 AND deleted_at IS NULL RETURNING id`, [tenantId, id, version, deletedBy ?? null])
    return result.rows.length > 0
  },
}

// ─── Financial Year ─────────────────────────────────────────────────────────

export const financialYearRepository = {
  async create(tenantId: string, input: FinancialYearInput, createdBy?: string) {
    const id = randomUUID()
    await query(
      `INSERT INTO financial_years (id, tenant_id, code, name, start_date, end_date, status, is_current, version, created_at, updated_at, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,'ACTIVE',$7,0,NOW(),NOW(),$8)`,
      [id, tenantId, input.code, input.name, input.startDate, input.endDate, input.isCurrent ?? false, createdBy ?? null]
    )
    // If is_current, unset others
    if (input.isCurrent) {
      await query(`UPDATE financial_years SET is_current = false WHERE tenant_id = $1 AND id != $2`, [tenantId, id])
    }
    return this.findById(tenantId, id)
  },

  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM financial_years WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },

  async list(tenantId: string, params: ListParams = {}) {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 25
    const offset = (page - 1) * pageSize
    const where = 'tenant_id = $1 AND deleted_at IS NULL'
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM financial_years WHERE ${where}`, [tenantId])
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM financial_years WHERE ${where} ORDER BY start_date DESC LIMIT $2 OFFSET $3`, [tenantId, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },

  async findCurrent(tenantId: string) {
    const result = await query(`SELECT * FROM financial_years WHERE tenant_id = $1 AND is_current = true AND deleted_at IS NULL`, [tenantId])
    return result.rows[0] ?? null
  },
}

// ─── Hierarchy ──────────────────────────────────────────────────────────────

export const hierarchyRepository = {
  async getFullTree(tenantId: string) {
    // Fetch all entities
    const [companies, bus, divisions, regions, plants, warehouses] = await Promise.all([
      query(`SELECT id, code, name, status, parent_id FROM companies WHERE tenant_id = $1 AND deleted_at IS NULL`, [tenantId]),
      query(`SELECT id, code, name, status, company_id, parent_id FROM business_units WHERE tenant_id = $1 AND deleted_at IS NULL`, [tenantId]),
      query(`SELECT id, code, name, status, business_unit_id, parent_id FROM divisions WHERE tenant_id = $1 AND deleted_at IS NULL`, [tenantId]),
      query(`SELECT id, code, name, status, division_id FROM regions WHERE tenant_id = $1 AND deleted_at IS NULL`, [tenantId]),
      query(`SELECT id, code, name, status, region_id, plant_type FROM plants WHERE tenant_id = $1 AND deleted_at IS NULL`, [tenantId]),
      query(`SELECT id, code, name, status, plant_id, warehouse_type FROM warehouses WHERE tenant_id = $1 AND deleted_at IS NULL`, [tenantId]),
    ])

    // Build tree
    const buildCompanyNode = (company: Record<string, unknown>): unknown => {
      const childBus = bus.rows.filter((bu) => bu['company_id'] === company['id'])
      return {
        id: company['id'],
        code: company['code'],
        name: company['name'],
        type: 'Company',
        status: company['status'],
        children: childBus.map((bu) => {
          const childDivs = divisions.rows.filter((d) => d['business_unit_id'] === bu['id'])
          return {
            id: bu['id'],
            code: bu['code'],
            name: bu['name'],
            type: 'BusinessUnit',
            status: bu['status'],
            children: childDivs.map((div) => {
              const childRegions = regions.rows.filter((r) => r['division_id'] === div['id'])
              return {
                id: div['id'],
                code: div['code'],
                name: div['name'],
                type: 'Division',
                status: div['status'],
                children: childRegions.map((reg) => {
                  const childPlants = plants.rows.filter((p) => p['region_id'] === reg['id'])
                  return {
                    id: reg['id'],
                    code: reg['code'],
                    name: reg['name'],
                    type: 'Region',
                    status: reg['status'],
                    children: childPlants.map((plt) => {
                      const childWhs = warehouses.rows.filter((w) => w['plant_id'] === plt['id'])
                      return {
                        id: plt['id'],
                        code: plt['code'],
                        name: plt['name'],
                        type: 'Plant',
                        status: plt['status'],
                        children: childWhs.map((w) => ({
                          id: w['id'],
                          code: w['code'],
                          name: w['name'],
                          type: 'Warehouse',
                          status: w['status'],
                        })),
                      }
                    }),
                  }
                }),
              }
            }),
          }
        }),
      }
    }

    // Root companies (no parent)
    const rootCompanies = companies.rows.filter((c) => !c['parent_id'])
    return rootCompanies.map(buildCompanyNode)
  },
}

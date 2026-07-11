/** Recipe & BOM Repository */
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

export const recipeRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', recipeCode: 'recipe_code', recipeName: 'recipe_name',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      version: 'version', isActive: 'is_active', isDefault: 'is_default', alternateForId: 'alternate_for_id',
      yieldPercent: 'yield_percent', expectedLossPercent: 'expected_loss_percent',
      batchSize: 'batch_size', batchUomId: 'batch_uom_id', batchUomCode: 'batch_uom_code',
      productionTimeHours: 'production_time_hours', recipeCost: 'recipe_cost',
      status: 'status', approvalNotes: 'approval_notes', description: 'description',
      approvedBy: 'approved_by', approvedByName: 'approved_by_name', approvedAt: 'approved_at',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO recipes (${cols.join(', ')}, version_no, created_at, updated_at) VALUES (${ph}, 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM recipes WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async findByCode(tenantId: string, recipeCode: string, version: string) {
    const result = await query(`SELECT * FROM recipes WHERE tenant_id = $1 AND recipe_code = $2 AND version = $3 AND deleted_at IS NULL`, [tenantId, recipeCode, version])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; productId?: string; status?: string; search?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.search) { where += ` AND (recipe_code ILIKE $${idx} OR recipe_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM recipes WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM recipes WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, versionNo: number) {
    const setParts: string[] = ['version_no = version_no + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      status: 'status', isDefault: 'is_default', isActive: 'is_active',
      yieldPercent: 'yield_percent', expectedLossPercent: 'expected_loss_percent',
      recipeCost: 'recipe_cost', approvalNotes: 'approval_notes',
      approvedBy: 'approved_by', approvedByName: 'approved_by_name', approvedAt: 'approved_at',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(versionNo)
    const result = await query(`UPDATE recipes SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 AND version_no = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
}

export const recipeItemRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO recipe_items (id, tenant_id, recipe_id, line_no, item_type, product_id, product_sku, product_name, uom_id, uom_code, quantity, scrap_percent, is_critical, sort_order, remarks, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW())`, [id, data['tenantId'], data['recipeId'], data['lineNo'], data['itemType'] ?? 'RAW_MATERIAL', data['productId'], data['productSku'], data['productName'], data['uomId'] ?? null, data['uomCode'] ?? null, data['quantity'], data['scrapPercent'] ?? 0, data['isCritical'] ?? false, data['sortOrder'] ?? 0, data['remarks'] ?? null])
    return id
  },
  async listForRecipe(tenantId: string, recipeId: string) {
    const result = await query(`SELECT * FROM recipe_items WHERE tenant_id = $1 AND recipe_id = $2 ORDER BY line_no`, [tenantId, recipeId])
    return result.rows
  },
  async deleteForRecipe(recipeId: string) {
    await query(`DELETE FROM recipe_items WHERE recipe_id = $1`, [recipeId])
  },
}

export const recipeByproductRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO recipe_byproducts (id, tenant_id, recipe_id, product_id, product_sku, product_name, quantity, uom_id, uom_code, byproduct_type, remarks, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())`, [id, data['tenantId'], data['recipeId'], data['productId'], data['productSku'], data['productName'], data['quantity'], data['uomId'] ?? null, data['uomCode'] ?? null, data['byproductType'] ?? 'BY_PRODUCT', data['remarks'] ?? null])
    return id
  },
  async listForRecipe(tenantId: string, recipeId: string) {
    const result = await query(`SELECT * FROM recipe_byproducts WHERE tenant_id = $1 AND recipe_id = $2`, [tenantId, recipeId])
    return result.rows
  },
}

export const bomHeaderRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', bomCode: 'bom_code', bomName: 'bom_name',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      bomType: 'bom_type', isActive: 'is_active', isDefault: 'is_default', alternateForId: 'alternate_for_id',
      status: 'status', approvalNotes: 'approval_notes', description: 'description',
      approvedBy: 'approved_by', approvedByName: 'approved_by_name', approvedAt: 'approved_at',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO bom_headers (${cols.join(', ')}, version, created_at, updated_at) VALUES (${ph}, 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM bom_headers WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async findByCode(tenantId: string, bomCode: string) {
    const result = await query(`SELECT * FROM bom_headers WHERE tenant_id = $1 AND bom_code = $2 AND deleted_at IS NULL`, [tenantId, bomCode])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; productId?: string; status?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM bom_headers WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM bom_headers WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      status: 'status', isDefault: 'is_default', isActive: 'is_active',
      approvalNotes: 'approval_notes', approvedBy: 'approved_by', approvedByName: 'approved_by_name', approvedAt: 'approved_at',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(version)
    const result = await query(`UPDATE bom_headers SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
}

export const bomLineRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO bom_lines (id, tenant_id, bom_id, parent_bom_line_id, line_no, level, product_id, product_sku, product_name, uom_id, uom_code, quantity, scrap_percent, is_phantom, is_critical, lead_time_offset_days, remarks, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW())`, [id, data['tenantId'], data['bomId'], data['parentBomLineId'] ?? null, data['lineNo'], data['level'] ?? 1, data['productId'], data['productSku'], data['productName'], data['uomId'] ?? null, data['uomCode'] ?? null, data['quantity'], data['scrapPercent'] ?? 0, data['isPhantom'] ?? false, data['isCritical'] ?? false, data['leadTimeOffsetDays'] ?? 0, data['remarks'] ?? null])
    return id
  },
  async listForBom(tenantId: string, bomId: string) {
    const result = await query(`SELECT * FROM bom_lines WHERE tenant_id = $1 AND bom_id = $2 ORDER BY line_no`, [tenantId, bomId])
    return result.rows
  },
  async deleteForBom(bomId: string) {
    await query(`DELETE FROM bom_lines WHERE bom_id = $1`, [bomId])
  },
}

export const routingRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', routingCode: 'routing_code', routingName: 'routing_name',
      productId: 'product_id', bomId: 'bom_id', isActive: 'is_active', description: 'description',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO bom_routings (${cols.join(', ')}, version, created_at, updated_at) VALUES (${ph}, 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM bom_routings WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; productId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM bom_routings WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM bom_routings WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
}

export const routingOperationRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO routing_operations (id, tenant_id, routing_id, operation_no, operation_name, operation_description, work_center_id, work_center_code, machine_id, machine_code, setup_time_minutes, run_time_minutes, queue_time_minutes, move_time_minutes, labor_required, skill_level, is_outside_operation, outside_supplier_id, remarks, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,NOW())`, [id, data['tenantId'], data['routingId'], data['operationNo'], data['operationName'], data['operationDescription'] ?? null, data['workCenterId'] ?? null, data['workCenterCode'] ?? null, data['machineId'] ?? null, data['machineCode'] ?? null, data['setupTimeMinutes'] ?? 0, data['runTimeMinutes'] ?? 0, data['queueTimeMinutes'] ?? 0, data['moveTimeMinutes'] ?? 0, data['laborRequired'] ?? true, data['skillLevel'] ?? null, data['isOutsideOperation'] ?? false, data['outsideSupplierId'] ?? null, data['remarks'] ?? null])
    return id
  },
  async listForRouting(tenantId: string, routingId: string) {
    const result = await query(`SELECT * FROM routing_operations WHERE tenant_id = $1 AND routing_id = $2 ORDER BY operation_no`, [tenantId, routingId])
    return result.rows
  },
}

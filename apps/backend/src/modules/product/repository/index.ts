/** Product Repository — Database operations for Product Master */
import { query } from '@/core/db/pglite'
import { scopedQuery, scopedCount } from '@/core/security/scoped-query'
import { enforceScopeOnWrite } from '@/core/security/data-scope'
import { randomUUID } from 'node:crypto'

export const productRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols = ['id', 'tenant_id', 'sku', 'name', 'product_type', 'base_uom_id', 'status', 'version', 'created_at', 'updated_at']
    const vals: unknown[] = [id, data['tenantId'], data['sku'], data['name'], data['productType'] ?? 'FINISHED_GOOD', data['baseUomId'], 'DRAFT', 0, 'NOW()', 'NOW()']
    // Add optional fields
    const optionalFields: Record<string, string> = {
      itemCode: 'item_code', shortName: 'short_name', description: 'description', longDescription: 'long_description',
      categoryId: 'category_id', brandId: 'brand_id', altUomId: 'alt_uom_id',
      hsnCode: 'hsn_code', sacCode: 'sac_code', gstRate: 'gst_rate',
      weight: 'weight', weightUom: 'weight_uom', volume: 'volume', volumeUom: 'volume_uom',
      storageCondition: 'storage_condition', minTemp: 'min_temp', maxTemp: 'max_temp', minHumidity: 'min_humidity', maxHumidity: 'max_humidity',
      shelfLifeDays: 'shelf_life_days', batchRequired: 'batch_required', serialRequired: 'serial_required', expiryTracking: 'expiry_tracking', fifoStrategy: 'fifo_strategy',
      inspectionRequired: 'inspection_required', defaultWarehouseId: 'default_warehouse_id', defaultStorageLocation: 'default_storage_location',
      costingMethod: 'costing_method', standardCost: 'standard_cost', mrp: 'mrp', listPrice: 'list_price',
      abcClass: 'abc_class', xyzClass: 'xyz_class', fsnClass: 'fsn_class', isCritical: 'is_critical',
      procurementType: 'procurement_type', leadTimeDays: 'lead_time_days', minOrderQty: 'min_order_qty', maxOrderQty: 'max_order_qty', reorderLevel: 'reorder_level', reorderQty: 'reorder_qty', safetyStock: 'safety_stock',
      manufacturingType: 'manufacturing_type', yieldPercent: 'yield_percent', imageUrl: 'image_url', upi: 'upi',
    }
    for (const [key, col] of Object.entries(optionalFields)) {
      if (data[key] !== undefined && data[key] !== null) {
        cols.push(col)
        vals.push(data[key])
      }
    }
    // Fix: use NOW() without placeholder
    const actualCols = cols.filter(c => c !== 'created_at' && c !== 'updated_at')
    const actualVals = vals.filter(v => v !== 'NOW()')
    const ph = actualVals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(
      `INSERT INTO products (${actualCols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`,
      actualVals
    )
    return this.findById(String(data['tenantId']), id)
  },

  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM products WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'products' })
    return result.rows[0] ?? null
  },

  async findBySku(tenantId: string, sku: string) {
    const result = await scopedQuery(`SELECT * FROM products WHERE tenant_id = $1 AND sku = $2 AND deleted_at IS NULL`, [tenantId, sku], { tableAlias: 'products' })
    return result.rows[0] ?? null
  },

  async findByBarcode(barcode: string) {
    const result = await query(
      `SELECT p.* FROM products p JOIN product_barcodes pb ON p.id = pb.product_id WHERE pb.\"barcodeValue\" = $1 AND p.deleted_at IS NULL LIMIT 1`,
      [barcode]
    )
    return result.rows[0] ?? null
  },

  async list(tenantId: string, params: { page?: number; pageSize?: number; search?: string; productType?: string; status?: string; categoryId?: string; brandId?: string; abcClass?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.search) { where += ` AND (sku ILIKE $${idx} OR name ILIKE $${idx} OR item_code ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.productType) { where += ` AND product_type = $${idx++}`; sqlParams.push(params.productType) }
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.categoryId) { where += ` AND category_id = $${idx++}`; sqlParams.push(params.categoryId) }
    if (params.brandId) { where += ` AND brand_id = $${idx++}`; sqlParams.push(params.brandId) }
    if (params.abcClass) { where += ` AND abc_class = $${idx++}`; sqlParams.push(params.abcClass) }
    const total = await scopedCount('products', 'products', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM products WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'products' })
    return { rows: result.rows, total, page, pageSize }
  },

  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number, updatedBy?: string) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]
    let idx = 3
    const fieldMap: Record<string, string> = {
      name: 'name', shortName: 'short_name', description: 'description', longDescription: 'long_description',
      categoryId: 'category_id', brandId: 'brand_id', hsnCode: 'hsn_code', gstRate: 'gst_rate',
      mrp: 'mrp', standardCost: 'standard_cost', listPrice: 'list_price',
      shelfLifeDays: 'shelf_life_days', batchRequired: 'batch_required', expiryTracking: 'expiry_tracking',
      fifoStrategy: 'fifo_strategy', inspectionRequired: 'inspection_required',
      abcClass: 'abc_class', xyzClass: 'xyz_class', fsnClass: 'fsn_class', isCritical: 'is_critical',
      procurementType: 'procurement_type', leadTimeDays: 'lead_time_days',
      reorderLevel: 'reorder_level', reorderQty: 'reorder_qty', safetyStock: 'safety_stock',
      storageCondition: 'storage_condition', minTemp: 'min_temp', maxTemp: 'max_temp',
      imageUrl: 'image_url', status: 'status',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        setParts.push(`${col} = $${idx++}`)
        vals.push(data[key])
      }
    }
    vals.push(updatedBy ?? null, version)
    const setClause = setParts.join(', ')
    const result = await query(
      `UPDATE products SET ${setClause}, updated_by = $${idx - 1} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`,
      vals
    )
    return result.rows[0] ?? null
  },

  async softDelete(tenantId: string, id: string, version: number) {
    const result = await query(`UPDATE products SET deleted_at = NOW(), status = 'ARCHIVED', version = version + 1 WHERE tenant_id = $1 AND id = $2 AND version = $3 AND deleted_at IS NULL RETURNING id`, [tenantId, id, version])
    return result.rows.length > 0
  },

  async updateStatus(tenantId: string, id: string, status: string, version: number, updatedBy?: string) {
    const result = await query(`UPDATE products SET status = $3, version = version + 1, updated_at = NOW(), updated_by = $4 WHERE tenant_id = $1 AND id = $2 AND version = $5 AND deleted_at IS NULL RETURNING *`, [tenantId, id, status, updatedBy ?? null, version])
    return result.rows[0] ?? null
  },
}

export const categoryRepository = {
  async create(data: { tenantId: string; code: string; name: string; description?: string; productType?: string; parentId?: string; createdBy?: string }) {
    const id = randomUUID()
    await query(
      `INSERT INTO product_categories (id, tenant_id, code, name, description, parent_id, product_type, is_active, level, path, version, created_at, updated_at, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,true,0,$3,0,NOW(),NOW(),$8)`,
      [id, data.tenantId, data.code, data.name, data.description ?? null, data.parentId ?? null, data.productType ?? null, data.createdBy ?? null]
    )
    return this.findById(data.tenantId, id)
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM product_categories WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'product_categories' })
    return result.rows[0] ?? null
  },
  async list(tenantId: string) {
    const result = await scopedQuery(`SELECT * FROM product_categories WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY name`, [tenantId], { tableAlias: 'product_categories' })
    return result.rows
  },
}

export const brandRepository = {
  async create(data: { tenantId: string; code: string; name: string; description?: string; manufacturer?: string; createdBy?: string }) {
    const id = randomUUID()
    await query(`INSERT INTO product_brands (id, tenant_id, code, name, description, manufacturer, is_active, version, created_at, updated_at, created_by) VALUES ($1,$2,$3,$4,$5,$6,true,0,NOW(),NOW(),$7)`, [id, data.tenantId, data.code, data.name, data.description ?? null, data.manufacturer ?? null, data.createdBy ?? null])
    return this.findById(data.tenantId, id)
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM product_brands WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'product_brands' })
    return result.rows[0] ?? null
  },
  async list(tenantId: string) {
    const result = await scopedQuery(`SELECT * FROM product_brands WHERE tenant_id = $1 AND deleted_at IS NULL ORDER BY name`, [tenantId], { tableAlias: 'product_brands' })
    return result.rows
  },
}

export const uomRepository = {
  async list(tenantId: string) {
    const result = await scopedQuery(`SELECT * FROM product_uoms WHERE tenant_id = $1 ORDER BY uom_type, name`, [tenantId], { tableAlias: 'product_uoms' })
    return result.rows
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM product_uoms WHERE tenant_id = $1 AND id = $2`, [tenantId, id], { tableAlias: 'product_uoms' })
    return result.rows[0] ?? null
  },
}

export const barcodeRepository = {
  async create(data: { tenantId: string; productId: string; barcodeType: string; barcodeValue: string; isPrimary?: boolean }) {
    const id = randomUUID()
    await query(`INSERT INTO product_barcodes (id, tenant_id, product_id, barcode_type, \"barcodeValue\", is_primary, is_active, created_at) VALUES ($1,$2,$3,$4,$5,$6,true,NOW())`, [id, data.tenantId, data.productId, data.barcodeType, data.barcodeValue, data.isPrimary ?? false])
    return id
  },
  async listForProduct(tenantId: string, productId: string) {
    const result = await scopedQuery(`SELECT * FROM product_barcodes WHERE tenant_id = $1 AND product_id = $2`, [tenantId, productId], { tableAlias: 'product_barcodes' })
    return result.rows
  },
  async findByValue(barcode: string) {
    const result = await scopedQuery(`SELECT * FROM product_barcodes WHERE \"barcodeValue\" = $1`, [barcode], { tableAlias: 'product_barcodes' })
    return result.rows[0] ?? null
  },
  async softDelete(id: string) {
    await query(`DELETE FROM product_barcodes WHERE id = $1`, [id])
  },
}

/** Warehouse Repository — Zones, Aisles, Racks, Bins, Putaway Tasks, Barcodes
 *
 * Phase 1.6: Extended with update/delete/block/unblock/search/export/bulk operations.
 */
import { query } from '@/core/db/pglite'
import { scopedQuery, scopedCount } from '@/core/security/scoped-query'
import { enforceScopeOnWrite } from '@/core/security/data-scope'
import { randomUUID } from 'node:crypto'

// ═══ Zones ═════════════════════════════════════════════════════════════════

export const zoneRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', warehouseId: 'warehouse_id', zoneCode: 'zone_code', zoneName: 'zone_name',
      zoneType: 'zone_type', capacity: 'capacity', usedCapacity: 'used_capacity', isActive: 'is_active',
      sortOrder: 'sort_order', description: 'description',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO warehouse_zones (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM warehouse_zones WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'warehouse_zones' })
    return result.rows[0] ?? null
  },
  async list(tenantId: string, warehouseId: string, params: { page?: number; pageSize?: number; search?: string; zoneType?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'warehouse_zones.tenant_id = $1 AND warehouse_zones.warehouse_id = $2 AND warehouse_zones.deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId, warehouseId]; let idx = 3
    if (params.search) { where += ` AND (warehouse_zones.zone_code ILIKE $${idx} OR warehouse_zones.zone_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.zoneType) { where += ` AND warehouse_zones.zone_type = $${idx++}`; sqlParams.push(params.zoneType) }
    const total = await scopedCount('warehouse_zones', 'warehouse_zones', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM warehouse_zones WHERE ${where} ORDER BY sort_order, zone_code LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'warehouse_zones' })
    return { rows: result.rows, total, page, pageSize }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>) {
    const setParts: string[] = ['updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = { zoneName: 'zone_name', zoneType: 'zone_type', capacity: 'capacity', isActive: 'is_active', sortOrder: 'sort_order', description: 'description' }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    const result = await query(`UPDATE warehouse_zones SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
  async softDelete(tenantId: string, id: string, deletedBy: string) {
    await query(`UPDATE warehouse_zones SET deleted_at = NOW(), deleted_by = $3, is_active = false, updated_at = NOW() WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id, deletedBy])
  },
}

// ═══ Aisles ════════════════════════════════════════════════════════════════

export const aisleRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', warehouseId: 'warehouse_id', zoneId: 'zone_id', aisleCode: 'aisle_code', aisleName: 'aisle_name',
      capacity: 'capacity', usedCapacity: 'used_capacity', isActive: 'is_active', sortOrder: 'sort_order', description: 'description',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO warehouse_aisles (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM warehouse_aisles WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'warehouse_aisles' })
    return result.rows[0] ?? null
  },
  async list(tenantId: string, warehouseId: string, params: { page?: number; pageSize?: number; search?: string; zoneId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'warehouse_aisles.tenant_id = $1 AND warehouse_aisles.warehouse_id = $2 AND warehouse_aisles.deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId, warehouseId]; let idx = 3
    if (params.search) { where += ` AND (warehouse_aisles.aisle_code ILIKE $${idx} OR warehouse_aisles.aisle_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.zoneId) { where += ` AND warehouse_aisles.zone_id = $${idx++}`; sqlParams.push(params.zoneId) }
    const total = await scopedCount('warehouse_aisles', 'warehouse_aisles', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM warehouse_aisles WHERE ${where} ORDER BY sort_order, aisle_code LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'warehouse_aisles' })
    return { rows: result.rows, total, page, pageSize }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>) {
    const setParts: string[] = ['updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = { aisleName: 'aisle_name', capacity: 'capacity', isActive: 'is_active', sortOrder: 'sort_order', description: 'description' }
    for (const [key, col] of Object.entries(fieldMap)) { if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) } }
    const result = await query(`UPDATE warehouse_aisles SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
  async softDelete(tenantId: string, id: string, deletedBy: string) {
    await query(`UPDATE warehouse_aisles SET deleted_at = NOW(), deleted_by = $3, is_active = false, updated_at = NOW() WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id, deletedBy])
  },
}

// ═══ Racks ═════════════════════════════════════════════════════════════════

export const rackRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', warehouseId: 'warehouse_id', zoneId: 'zone_id', aisleId: 'aisle_id',
      rackCode: 'rack_code', rackName: 'rack_name', rackType: 'rack_type', levels: 'levels',
      capacityPerLevel: 'capacity_per_level', capacity: 'capacity', usedCapacity: 'used_capacity',
      isActive: 'is_active', sortOrder: 'sort_order', description: 'description',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO warehouse_racks (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM warehouse_racks WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'warehouse_racks' })
    return result.rows[0] ?? null
  },
  async list(tenantId: string, warehouseId: string, params: { page?: number; pageSize?: number; search?: string; zoneId?: string; aisleId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'warehouse_racks.tenant_id = $1 AND warehouse_racks.warehouse_id = $2 AND warehouse_racks.deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId, warehouseId]; let idx = 3
    if (params.search) { where += ` AND (warehouse_racks.rack_code ILIKE $${idx} OR warehouse_racks.rack_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.zoneId) { where += ` AND warehouse_racks.zone_id = $${idx++}`; sqlParams.push(params.zoneId) }
    if (params.aisleId) { where += ` AND warehouse_racks.aisle_id = $${idx++}`; sqlParams.push(params.aisleId) }
    const total = await scopedCount('warehouse_racks', 'warehouse_racks', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM warehouse_racks WHERE ${where} ORDER BY sort_order, rack_code LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'warehouse_racks' })
    return { rows: result.rows, total, page, pageSize }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>) {
    const setParts: string[] = ['updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = { rackName: 'rack_name', rackType: 'rack_type', levels: 'levels', capacityPerLevel: 'capacity_per_level', capacity: 'capacity', isActive: 'is_active', sortOrder: 'sort_order', description: 'description' }
    for (const [key, col] of Object.entries(fieldMap)) { if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) } }
    const result = await query(`UPDATE warehouse_racks SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
  async softDelete(tenantId: string, id: string, deletedBy: string) {
    await query(`UPDATE warehouse_racks SET deleted_at = NOW(), deleted_by = $3, is_active = false, updated_at = NOW() WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id, deletedBy])
  },
}

// ═══ Bins ══════════════════════════════════════════════════════════════════

export const binRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', warehouseId: 'warehouse_id', zoneId: 'zone_id', aisleId: 'aisle_id', rackId: 'rack_id',
      binCode: 'bin_code', binName: 'bin_name', binType: 'bin_type', level: 'level', position: 'position',
      capacity: 'capacity', usedCapacity: 'used_capacity', isActive: 'is_active', isBlocked: 'is_blocked',
      blockReason: 'block_reason', sortOrder: 'sort_order', description: 'description',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO warehouse_bins (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM warehouse_bins WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'warehouse_bins' })
    return result.rows[0] ?? null
  },
  async findByCode(tenantId: string, warehouseId: string, binCode: string) {
    const result = await scopedQuery(`SELECT * FROM warehouse_bins WHERE tenant_id = $1 AND warehouse_id = $2 AND bin_code = $3 AND deleted_at IS NULL`, [tenantId, warehouseId, binCode], { tableAlias: 'warehouse_bins' })
    return result.rows[0] ?? null
  },
  async list(tenantId: string, warehouseId: string, params: { page?: number; pageSize?: number; zoneId?: string; aisleId?: string; rackId?: string; search?: string; isBlocked?: boolean; isActive?: boolean; emptyOnly?: boolean } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'warehouse_bins.tenant_id = $1 AND warehouse_bins.warehouse_id = $2 AND warehouse_bins.deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId, warehouseId]; let idx = 3
    if (params.zoneId) { where += ` AND warehouse_bins.zone_id = $${idx++}`; sqlParams.push(params.zoneId) }
    if (params.aisleId) { where += ` AND warehouse_bins.aisle_id = $${idx++}`; sqlParams.push(params.aisleId) }
    if (params.rackId) { where += ` AND warehouse_bins.rack_id = $${idx++}`; sqlParams.push(params.rackId) }
    if (params.search) { where += ` AND (warehouse_bins.bin_code ILIKE $${idx} OR warehouse_bins.bin_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    if (params.isBlocked !== undefined) { where += ` AND warehouse_bins.is_blocked = $${idx++}`; sqlParams.push(params.isBlocked) }
    if (params.isActive !== undefined) { where += ` AND warehouse_bins.is_active = $${idx++}`; sqlParams.push(params.isActive) }
    if (params.emptyOnly) { where += ` AND warehouse_bins.used_capacity = 0` }
    const total = await scopedCount('warehouse_bins', 'warehouse_bins', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM warehouse_bins WHERE ${where} ORDER BY sort_order, bin_code LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'warehouse_bins' })
    return { rows: result.rows, total, page, pageSize }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>) {
    const setParts: string[] = ['updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = { binName: 'bin_name', binType: 'bin_type', capacity: 'capacity', isActive: 'is_active', sortOrder: 'sort_order', description: 'description' }
    for (const [key, col] of Object.entries(fieldMap)) { if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) } }
    const result = await query(`UPDATE warehouse_bins SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
  async softDelete(tenantId: string, id: string, deletedBy: string) {
    await query(`UPDATE warehouse_bins SET deleted_at = NOW(), deleted_by = $3, is_active = false, updated_at = NOW() WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id, deletedBy])
  },
  async block(tenantId: string, id: string, blockReason: string, blockedBy: string) {
    const result = await query(`UPDATE warehouse_bins SET is_blocked = true, block_reason = $3, blocked_by = $4, blocked_at = NOW(), updated_at = NOW() WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL RETURNING *`, [tenantId, id, blockReason, blockedBy])
    return result.rows[0] ?? null
  },
  async unblock(tenantId: string, id: string) {
    const result = await query(`UPDATE warehouse_bins SET is_blocked = false, block_reason = NULL, blocked_by = NULL, blocked_at = NULL, updated_at = NOW() WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL RETURNING *`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async updateUsedCapacity(tenantId: string, id: string, usedCapacity: number) {
    await query(`UPDATE warehouse_bins SET used_capacity = $3, updated_at = NOW() WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id, usedCapacity])
  },
  /** Find available bin for putaway (capacity validation) */
  async findAvailableBin(tenantId: string, warehouseId: string, requiredCapacity: number) {
    const result = await scopedQuery(`SELECT * FROM warehouse_bins WHERE tenant_id = $1 AND warehouse_id = $2 AND deleted_at IS NULL AND is_active = true AND is_blocked = false AND (capacity = 0 OR (capacity - used_capacity) >= $3) ORDER BY used_capacity ASC, bin_code ASC LIMIT 1`, [tenantId, warehouseId, requiredCapacity], { tableAlias: 'warehouse_bins' })
    return result.rows[0] ?? null
  },
  /** Find empty bins (used_capacity = 0) */
  async findEmptyBins(tenantId: string, warehouseId: string) {
    const result = await scopedQuery(`SELECT * FROM warehouse_bins WHERE tenant_id = $1 AND warehouse_id = $2 AND deleted_at IS NULL AND is_active = true AND is_blocked = false AND used_capacity = 0 ORDER BY bin_code`, [tenantId, warehouseId], { tableAlias: 'warehouse_bins' })
    return result.rows
  },
  /** Get bin occupancy stats for a warehouse */
  async getBinOccupancyStats(tenantId: string, warehouseId: string) {
    const result = await query<{
      total_bins: string; active_bins: string; blocked_bins: string; empty_bins: string
      full_bins: string; total_capacity: string; total_used: string
    }>(`SELECT
      COUNT(*) as total_bins,
      COUNT(CASE WHEN is_active = true THEN 1 END) as active_bins,
      COUNT(CASE WHEN is_blocked = true THEN 1 END) as blocked_bins,
      COUNT(CASE WHEN used_capacity = 0 AND is_active = true AND is_blocked = false THEN 1 END) as empty_bins,
      COUNT(CASE WHEN capacity > 0 AND used_capacity >= capacity THEN 1 END) as full_bins,
      COALESCE(SUM(capacity), 0) as total_capacity,
      COALESCE(SUM(used_capacity), 0) as total_used
    FROM warehouse_bins WHERE tenant_id = $1 AND warehouse_id = $2 AND deleted_at IS NULL`, [tenantId, warehouseId])
    const r = result.rows[0]!
    return {
      totalBins: Number(r.total_bins),
      activeBins: Number(r.active_bins),
      blockedBins: Number(r.blocked_bins),
      emptyBins: Number(r.empty_bins),
      fullBins: Number(r.full_bins),
      totalCapacity: Number(r.total_capacity),
      totalUsed: Number(r.total_used),
      utilizationPercent: Number(r.total_capacity) > 0 ? (Number(r.total_used) / Number(r.total_capacity)) * 100 : 0,
    }
  },
}

// ═══ Putaway Tasks ═════════════════════════════════════════════════════════

export const putawayTaskRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', taskNumber: 'task_number', grnId: 'grn_id', grnNumber: 'grn_number', grnLineId: 'grn_line_id',
      inspectionLotId: 'inspection_lot_id', productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      batchId: 'batch_id', batchNumber: 'batch_number', lotId: 'lot_id', lotNumber: 'lot_number',
      quantity: 'quantity', uomId: 'uom_id', uomCode: 'uom_code', warehouseId: 'warehouse_id', warehouseName: 'warehouse_name',
      sourceBinId: 'source_bin_id', sourceBinCode: 'source_bin_code', targetBinId: 'target_bin_id', targetBinCode: 'target_bin_code',
      assignedTo: 'assigned_to', assignedToName: 'assigned_to_name', startedAt: 'started_at', completedAt: 'completed_at',
      status: 'status', priority: 'priority', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO putaway_tasks (${cols.join(', ')}, task_date, version, created_at, updated_at) VALUES (${ph}, NOW(), 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM putaway_tasks WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'putaway_tasks' })
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string; warehouseId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.warehouseId) { where += ` AND warehouse_id = $${idx++}`; sqlParams.push(params.warehouseId) }
    const total = await scopedCount('putaway_tasks', 'putaway_tasks', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM putaway_tasks WHERE ${where} ORDER BY task_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'putaway_tasks' })
    return { rows: result.rows, total, page, pageSize }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number, updatedBy?: string) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      status: 'status', targetBinId: 'target_bin_id', targetBinCode: 'target_bin_code',
      assignedTo: 'assigned_to', assignedToName: 'assigned_to_name', startedAt: 'started_at', completedAt: 'completed_at', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(updatedBy ?? null, version)
    const result = await query(`UPDATE putaway_tasks SET ${setParts.join(', ')}, updated_by = $${idx - 1} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
  async generateTaskNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM putaway_tasks WHERE tenant_id = $1 AND task_number LIKE 'PT-${year}-%'`, [tenantId])
    const seq = Number(countResult.rows[0]!.cnt) + 1
    return `PT-${year}-${String(seq).padStart(6, '0')}`
  },
}

// ═══ Barcode Labels ════════════════════════════════════════════════════════

export const barcodeRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', barcode: 'barcode', barcodeType: 'barcode_type', labelType: 'label_type',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      batchId: 'batch_id', batchNumber: 'batch_number', lotId: 'lot_id', lotNumber: 'lot_number',
      warehouseId: 'warehouse_id', binId: 'bin_id', binCode: 'bin_code', grnId: 'grn_id', grnNumber: 'grn_number',
      quantity: 'quantity', uomCode: 'uom_code', manufactureDate: 'manufacture_date', expiryDate: 'expiry_date',
      gs1Gtin: 'gs1_gtin', gs1Batch: 'gs1_batch', gs1Expiry: 'gs1_expiry', qrData: 'qr_data',
      isPrinted: 'is_printed', status: 'status', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO barcode_labels (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await scopedQuery(`SELECT * FROM barcode_labels WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'barcode_labels' })
    return result.rows[0] ?? null
  },
  async findByBarcode(tenantId: string, barcode: string) {
    const result = await scopedQuery(`SELECT * FROM barcode_labels WHERE tenant_id = $1 AND barcode = $2 AND deleted_at IS NULL`, [tenantId, barcode], { tableAlias: 'barcode_labels' })
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; labelType?: string; productId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.labelType) { where += ` AND label_type = $${idx++}`; sqlParams.push(params.labelType) }
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    const total = await scopedCount('barcode_labels', 'barcode_labels', where, sqlParams)
    const result = await scopedQuery(`SELECT * FROM barcode_labels WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset], { tableAlias: 'barcode_labels' })
    return { rows: result.rows, total, page, pageSize }
  },
  async markPrinted(tenantId: string, id: string) {
    const result = await query(`UPDATE barcode_labels SET is_printed = true, print_count = print_count + 1, last_printed_at = NOW(), updated_at = NOW() WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL RETURNING *`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async markScanned(tenantId: string, id: string) {
    const result = await query(`UPDATE barcode_labels SET is_scanned = true, scanned_at = NOW(), updated_at = NOW() WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL RETURNING *`, [tenantId, id])
    return result.rows[0] ?? null
  },
  /** Generate unique barcode */
  async generateBarcode(tenantId: string, labelType: string): Promise<string> {
    const prefix = labelType === 'GS1' ? 'GTIN' : labelType === 'QR' ? 'QR' : 'BC'
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM barcode_labels WHERE tenant_id = $1 AND barcode LIKE '${prefix}-${year}-%'`, [tenantId])
    const seq = Number(countResult.rows[0]!.cnt) + 1
    return `${prefix}-${year}-${String(seq).padStart(8, '0')}`
  },
}

// ═══ Scan Logs ═════════════════════════════════════════════════════════════

export const scanLogRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    await query(`INSERT INTO scan_logs (id, tenant_id, barcode, scan_type, scan_context, scanned_by, scanned_by_name, device_id, location, result, metadata, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())`, [id, data['tenantId'], data['barcode'], data['scanType'], data['scanContext'] ?? null, data['scannedBy'] ?? null, data['scannedByName'] ?? null, data['deviceId'] ?? null, data['location'] ?? null, data['result'] ?? 'SUCCESS', data['metadata'] ? JSON.stringify(data['metadata']) : null])
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM scan_logs WHERE tenant_id = $1`, [tenantId])
    const total = Number(countResult.rows[0]!.cnt)
    const result = await scopedQuery(`SELECT * FROM scan_logs WHERE tenant_id = $1 ORDER BY scanned_at DESC LIMIT $2 OFFSET $3`, [tenantId, pageSize, offset], { tableAlias: 'scan_logs' })
    return { rows: result.rows, total, page, pageSize }
  },
}

/** Warehouse Repository — Zones, Aisles, Racks, Bins, Putaway Tasks, Barcodes */
import { query } from '@/core/db/pglite'
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
    const result = await query(`SELECT * FROM warehouse_zones WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, warehouseId: string) {
    const result = await query(`SELECT * FROM warehouse_zones WHERE tenant_id = $1 AND warehouse_id = $2 AND deleted_at IS NULL ORDER BY sort_order, zone_code`, [tenantId, warehouseId])
    return result.rows
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
    const result = await query(`SELECT * FROM warehouse_aisles WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, warehouseId: string) {
    const result = await query(`SELECT * FROM warehouse_aisles WHERE tenant_id = $1 AND warehouse_id = $2 AND deleted_at IS NULL ORDER BY sort_order, aisle_code`, [tenantId, warehouseId])
    return result.rows
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
    const result = await query(`SELECT * FROM warehouse_racks WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, warehouseId: string) {
    const result = await query(`SELECT * FROM warehouse_racks WHERE tenant_id = $1 AND warehouse_id = $2 AND deleted_at IS NULL ORDER BY sort_order, rack_code`, [tenantId, warehouseId])
    return result.rows
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
    const result = await query(`SELECT * FROM warehouse_bins WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async findByCode(tenantId: string, warehouseId: string, binCode: string) {
    const result = await query(`SELECT * FROM warehouse_bins WHERE tenant_id = $1 AND warehouse_id = $2 AND bin_code = $3 AND deleted_at IS NULL`, [tenantId, warehouseId, binCode])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, warehouseId: string, params: { zoneId?: string; aisleId?: string; rackId?: string } = {}) {
    let where = 'tenant_id = $1 AND warehouse_id = $2 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId, warehouseId]; let idx = 3
    if (params.zoneId) { where += ` AND zone_id = $${idx++}`; sqlParams.push(params.zoneId) }
    if (params.aisleId) { where += ` AND aisle_id = $${idx++}`; sqlParams.push(params.aisleId) }
    if (params.rackId) { where += ` AND rack_id = $${idx++}`; sqlParams.push(params.rackId) }
    const result = await query(`SELECT * FROM warehouse_bins WHERE ${where} ORDER BY sort_order, bin_code`, sqlParams)
    return result.rows
  },
  async updateUsedCapacity(tenantId: string, id: string, usedCapacity: number) {
    await query(`UPDATE warehouse_bins SET used_capacity = $3, updated_at = NOW() WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id, usedCapacity])
  },
  /** Find available bin for putaway (capacity validation) */
  async findAvailableBin(tenantId: string, warehouseId: string, requiredCapacity: number) {
    const result = await query(`SELECT * FROM warehouse_bins WHERE tenant_id = $1 AND warehouse_id = $2 AND deleted_at IS NULL AND is_active = true AND is_blocked = false AND (capacity = 0 OR (capacity - used_capacity) >= $3) ORDER BY used_capacity ASC, bin_code ASC LIMIT 1`, [tenantId, warehouseId, requiredCapacity])
    return result.rows[0] ?? null
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
    const result = await query(`SELECT * FROM putaway_tasks WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string; warehouseId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.warehouseId) { where += ` AND warehouse_id = $${idx++}`; sqlParams.push(params.warehouseId) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM putaway_tasks WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM putaway_tasks WHERE ${where} ORDER BY task_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
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
    const result = await query(`SELECT * FROM barcode_labels WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async findByBarcode(tenantId: string, barcode: string) {
    const result = await query(`SELECT * FROM barcode_labels WHERE tenant_id = $1 AND barcode = $2 AND deleted_at IS NULL`, [tenantId, barcode])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; labelType?: string; productId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.labelType) { where += ` AND label_type = $${idx++}`; sqlParams.push(params.labelType) }
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM barcode_labels WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM barcode_labels WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
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
    const result = await query(`SELECT * FROM scan_logs WHERE tenant_id = $1 ORDER BY scanned_at DESC LIMIT $2 OFFSET $3`, [tenantId, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
}

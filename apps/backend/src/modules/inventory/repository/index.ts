/** Inventory Repository — Stock, Batches, Lots, Transactions, Ledger, Reservations, Blocks */
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

// ═══ Batches ═══════════════════════════════════════════════════════════════

export const batchRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', batchNumber: 'batch_number', productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      manufactureDate: 'manufacture_date', expiryDate: 'expiry_date',
      supplierId: 'supplier_id', supplierName: 'supplier_name', grnId: 'grn_id', grnNumber: 'grn_number',
      isBlocked: 'is_blocked', blockReason: 'block_reason', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO batches (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM batches WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async findByNumber(tenantId: string, batchNumber: string, productId: string) {
    const result = await query(`SELECT * FROM batches WHERE tenant_id = $1 AND batch_number = $2 AND product_id = $3 AND deleted_at IS NULL`, [tenantId, batchNumber, productId])
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; productId?: string; search?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    if (params.search) { where += ` AND (batch_number ILIKE $${idx} OR product_name ILIKE $${idx})`; sqlParams.push(`%${params.search}%`); idx++ }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM batches WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM batches WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
}

// ═══ Lots ══════════════════════════════════════════════════════════════════

export const lotRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', lotNumber: 'lot_number', batchId: 'batch_id', batchNumber: 'batch_number',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      manufactureDate: 'manufacture_date', expiryDate: 'expiry_date',
      supplierId: 'supplier_id', supplierName: 'supplier_name', grnId: 'grn_id', grnNumber: 'grn_number',
      isBlocked: 'is_blocked', blockReason: 'block_reason', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO lots (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM lots WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async findByNumber(tenantId: string, lotNumber: string, productId: string) {
    const result = await query(`SELECT * FROM lots WHERE tenant_id = $1 AND lot_number = $2 AND product_id = $3 AND deleted_at IS NULL`, [tenantId, lotNumber, productId])
    return result.rows[0] ?? null
  },
}

// ═══ Inventory (current stock levels) ══════════════════════════════════════

export const inventoryRepository = {
  async findById(tenantId: string, id: string) {
    const result = await query(`SELECT * FROM inventory WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
    return result.rows[0] ?? null
  },
  async findByKey(tenantId: string, productId: string, warehouseId: string, batchId: string | null, lotId: string | null, binId: string | null) {
    const result = await query(`SELECT * FROM inventory WHERE tenant_id = $1 AND product_id = $2 AND warehouse_id = $3 AND COALESCE(batch_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE($4::uuid, '00000000-0000-0000-0000-000000000000'::uuid) AND COALESCE(lot_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE($5::uuid, '00000000-0000-0000-0000-000000000000'::uuid) AND COALESCE(bin_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE($6::uuid, '00000000-0000-0000-0000-000000000000'::uuid) AND deleted_at IS NULL`, [tenantId, productId, warehouseId, batchId, lotId, binId])
    return result.rows[0] ?? null
  },
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      warehouseId: 'warehouse_id', warehouseName: 'warehouse_name', binId: 'bin_id', binCode: 'bin_code',
      batchId: 'batch_id', batchNumber: 'batch_number', lotId: 'lot_id', lotNumber: 'lot_number',
      uomId: 'uom_id', uomCode: 'uom_code', quantity: 'quantity', reservedQty: 'reserved_qty', blockedQty: 'blocked_qty',
      availableQty: 'available_qty', unitCost: 'unit_cost', movingAvgCost: 'moving_avg_cost', totalValue: 'total_value',
      currency: 'currency', manufactureDate: 'manufacture_date', expiryDate: 'expiry_date',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO inventory (${cols.join(', ')}, version, created_at, updated_at) VALUES (${ph}, 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']
    const vals: unknown[] = [tenantId, id]; let idx = 3
    const fieldMap: Record<string, string> = {
      quantity: 'quantity', reservedQty: 'reserved_qty', blockedQty: 'blocked_qty', availableQty: 'available_qty',
      unitCost: 'unit_cost', movingAvgCost: 'moving_avg_cost', totalValue: 'total_value',
      isExpired: 'is_expired', isBlocked: 'is_blocked', blockReason: 'block_reason',
      lastMovementAt: 'last_movement_at', lastMovementType: 'last_movement_type',
      binId: 'bin_id', binCode: 'bin_code',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) { setParts.push(`${col} = $${idx++}`); vals.push(data[key]) }
    }
    vals.push(version)
    const result = await query(`UPDATE inventory SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return result.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; productId?: string; warehouseId?: string; batchId?: string; expired?: boolean } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL AND quantity > 0'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    if (params.warehouseId) { where += ` AND warehouse_id = $${idx++}`; sqlParams.push(params.warehouseId) }
    if (params.batchId) { where += ` AND batch_id = $${idx++}`; sqlParams.push(params.batchId) }
    if (params.expired) { where += ` AND expiry_date < NOW()` }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM inventory WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM inventory WHERE ${where} ORDER BY updated_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  /** FEFO: Get stock ordered by expiry date ascending (First Expiry First Out) */
  async listFefo(tenantId: string, productId: string, warehouseId: string, _qtyNeeded: number) {
    const result = await query(`SELECT * FROM inventory WHERE tenant_id = $1 AND product_id = $2 AND warehouse_id = $3 AND available_qty > 0 AND deleted_at IS NULL AND is_blocked = false ORDER BY expiry_date ASC, created_at ASC`, [tenantId, productId, warehouseId])
    return result.rows
  },
  /** FIFO: Get stock ordered by creation date ascending (First In First Out) */
  async listFifo(tenantId: string, productId: string, warehouseId: string, _qtyNeeded: number) {
    void _qtyNeeded
    const result = await query(`SELECT * FROM inventory WHERE tenant_id = $1 AND product_id = $2 AND warehouse_id = $3 AND available_qty > 0 AND deleted_at IS NULL AND is_blocked = false ORDER BY created_at ASC`, [tenantId, productId, warehouseId])
    return result.rows
  },
}

// ═══ Inventory Transactions ════════════════════════════════════════════════

export const inventoryTransactionRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', transactionNumber: 'transaction_number', transactionType: 'transaction_type', movementType: 'movement_type',
      productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
      warehouseId: 'warehouse_id', warehouseName: 'warehouse_name', binId: 'bin_id', binCode: 'bin_code',
      batchId: 'batch_id', batchNumber: 'batch_number', lotId: 'lot_id', lotNumber: 'lot_number',
      uomId: 'uom_id', uomCode: 'uom_code', quantity: 'quantity', unitCost: 'unit_cost', totalValue: 'total_value',
      currency: 'currency', balanceAfter: 'balance_after',
      referenceType: 'reference_type', referenceId: 'reference_id', referenceNumber: 'reference_number',
      reason: 'reason', remarks: 'remarks', performedBy: 'performed_by', performedByName: 'performed_by_name', correlationId: 'correlation_id',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO inventory_transactions (${cols.join(', ')}, transaction_date, created_at) VALUES (${ph}, NOW(), NOW())`, vals)
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; productId?: string; warehouseId?: string; movementType?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    if (params.warehouseId) { where += ` AND warehouse_id = $${idx++}`; sqlParams.push(params.warehouseId) }
    if (params.movementType) { where += ` AND movement_type = $${idx++}`; sqlParams.push(params.movementType) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM inventory_transactions WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM inventory_transactions WHERE ${where} ORDER BY transaction_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async generateTransactionNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM inventory_transactions WHERE tenant_id = $1 AND transaction_number LIKE 'IVT-${year}-%'`, [tenantId])
    const seq = Number(countResult.rows[0]!.cnt) + 1
    return `IVT-${year}-${String(seq).padStart(8, '0')}`
  },
}

// ═══ Inventory Ledger (IMMUTABLE) ═══════════════════════════════════════════

export const inventoryLedgerRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', entryNumber: 'entry_number', transactionId: 'transaction_id', transactionNumber: 'transaction_number',
      productId: 'product_id', productSku: 'product_sku', warehouseId: 'warehouse_id',
      batchId: 'batch_id', batchNumber: 'batch_number', lotId: 'lot_id', lotNumber: 'lot_number',
      movementType: 'movement_type', inQty: 'in_qty', outQty: 'out_qty', balanceQty: 'balance_qty',
      unitCost: 'unit_cost', totalValue: 'total_value', balanceValue: 'balance_value',
      referenceType: 'reference_type', referenceId: 'reference_id', referenceNumber: 'reference_number',
      reason: 'reason', performedBy: 'performed_by', performedByName: 'performed_by_name', correlationId: 'correlation_id',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    // IMMUTABLE: is_immutable = true, no UPDATE/DELETE ever
    await query(`INSERT INTO inventory_ledger (${cols.join(', ')}, entry_date, is_immutable, created_at) VALUES (${ph}, NOW(), true, NOW())`, vals)
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; productId?: string; warehouseId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    if (params.warehouseId) { where += ` AND warehouse_id = $${idx++}`; sqlParams.push(params.warehouseId) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM inventory_ledger WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM inventory_ledger WHERE ${where} ORDER BY entry_date DESC, entry_number DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async generateEntryNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM inventory_ledger WHERE tenant_id = $1 AND entry_number LIKE 'IVL-${year}-%'`, [tenantId])
    const seq = Number(countResult.rows[0]!.cnt) + 1
    return `IVL-${year}-${String(seq).padStart(8, '0')}`
  },
  /** Get the latest balance for a product+warehouse combination */
  async getLatestBalance(tenantId: string, productId: string, warehouseId: string): Promise<{ balanceQty: number; balanceValue: number }> {
    const result = await query<{ balance_qty: string; balance_value: string }>(`SELECT balance_qty, balance_value FROM inventory_ledger WHERE tenant_id = $1 AND product_id = $2 AND warehouse_id = $3 ORDER BY entry_date DESC, entry_number DESC LIMIT 1`, [tenantId, productId, warehouseId])
    if (result.rows.length === 0) return { balanceQty: 0, balanceValue: 0 }
    return { balanceQty: Number(result.rows[0]!.balance_qty), balanceValue: Number(result.rows[0]!.balance_value) }
  },
}

// ═══ Stock Reservations ════════════════════════════════════════════════════

export const stockReservationRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', reservationNumber: 'reservation_number', productId: 'product_id', productSku: 'product_sku',
      warehouseId: 'warehouse_id', batchId: 'batch_id', lotId: 'lot_id', reservedQty: 'reserved_qty',
      uomId: 'uom_id', uomCode: 'uom_code', reservationType: 'reservation_type',
      referenceType: 'reference_type', referenceId: 'reference_id', referenceNumber: 'reference_number',
      reservedBy: 'reserved_by', reservedBy_Name: 'reserved_by_name', reservedFor: 'reserved_for', expiresAt: 'expires_at',
      status: 'status', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO stock_reservations (${cols.join(', ')}, reservation_date, created_at, updated_at) VALUES (${ph}, NOW(), NOW(), NOW())`, vals)
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string; productId?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    if (params.productId) { where += ` AND product_id = $${idx++}`; sqlParams.push(params.productId) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM stock_reservations WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM stock_reservations WHERE ${where} ORDER BY reservation_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async release(tenantId: string, id: string, releasedBy: string, releasedReason: string) {
    const result = await query(`UPDATE stock_reservations SET status = 'RELEASED', released_at = NOW(), released_by = $3, released_reason = $4, updated_at = NOW() WHERE tenant_id = $1 AND id = $2 AND status = 'ACTIVE' AND deleted_at IS NULL RETURNING *`, [tenantId, id, releasedBy, releasedReason])
    return result.rows[0] ?? null
  },
  async generateReservationNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM stock_reservations WHERE tenant_id = $1 AND reservation_number LIKE 'SR-${year}-%'`, [tenantId])
    const seq = Number(countResult.rows[0]!.cnt) + 1
    return `SR-${year}-${String(seq).padStart(6, '0')}`
  },
}

// ═══ Stock Blocks ══════════════════════════════════════════════════════════

export const stockBlockRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    const fieldMap: Record<string, string> = {
      tenantId: 'tenant_id', blockNumber: 'block_number', productId: 'product_id', productSku: 'product_sku',
      warehouseId: 'warehouse_id', batchId: 'batch_id', lotId: 'lot_id', blockedQty: 'blocked_qty',
      uomId: 'uom_id', uomCode: 'uom_code', blockType: 'block_type', blockReason: 'block_reason',
      sourceType: 'source_type', sourceId: 'source_id', sourceNumber: 'source_number',
      blockedBy: 'blocked_by', blockedBy_Name: 'blocked_by_name', status: 'status', remarks: 'remarks',
    }
    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined && data[key] !== null) { cols.push(col); vals.push(data[key]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO stock_blocks (${cols.join(', ')}, block_date, created_at, updated_at) VALUES (${ph}, NOW(), NOW(), NOW())`, vals)
    return id
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string } = {}) {
    const page = params.page ?? 1; const pageSize = params.pageSize ?? 25; const offset = (page - 1) * pageSize
    let where = 'tenant_id = $1 AND deleted_at IS NULL'
    const sqlParams: unknown[] = [tenantId]; let idx = 2
    if (params.status) { where += ` AND status = $${idx++}`; sqlParams.push(params.status) }
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM stock_blocks WHERE ${where}`, sqlParams)
    const total = Number(countResult.rows[0]!.cnt)
    const result = await query(`SELECT * FROM stock_blocks WHERE ${where} ORDER BY block_date DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...sqlParams, pageSize, offset])
    return { rows: result.rows, total, page, pageSize }
  },
  async generateBlockNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear()
    const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM stock_blocks WHERE tenant_id = $1 AND block_number LIKE 'SB-${year}-%'`, [tenantId])
    const seq = Number(countResult.rows[0]!.cnt) + 1
    return `SB-${year}-${String(seq).padStart(6, '0')}`
  },
}

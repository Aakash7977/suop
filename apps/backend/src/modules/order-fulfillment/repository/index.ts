/** Order Fulfillment Repository — Allocations, Wave Plans
 *
 * Phase 1.6: Extended with scopedQuery, softDelete, search, cancel, release.
 */
import { query } from '@/core/db/pglite'
import { scopedQuery, scopedCount } from '@/core/security/scoped-query'
import { randomUUID } from 'node:crypto'

const ALLOC_FIELDS: Record<string, string> = {
  tenantId: 'tenant_id', allocationNumber: 'allocation_number', soId: 'so_id', soNumber: 'so_number', soLineId: 'so_line_id',
  productId: 'product_id', productSku: 'product_sku', productName: 'product_name',
  warehouseId: 'warehouse_id', warehouseName: 'warehouse_name',
  batchId: 'batch_id', batchNumber: 'batch_number', lotId: 'lot_id', lotNumber: 'lot_number',
  uomId: 'uom_id', uomCode: 'uom_code', orderedQty: 'ordered_qty', allocatedQty: 'allocated_qty', shortQty: 'short_qty',
  allocationStrategy: 'allocation_strategy', isFullyAllocated: 'is_fully_allocated', isPartial: 'is_partial', status: 'status',
}

const WAVE_FIELDS: Record<string, string> = {
  tenantId: 'tenant_id', waveNumber: 'wave_number', warehouseId: 'warehouse_id', warehouseName: 'warehouse_name',
  waveType: 'wave_type', priority: 'priority', totalOrders: 'total_orders', totalLines: 'total_lines',
  totalQty: 'total_qty', allocatedQty: 'allocated_qty', pickedQty: 'picked_qty',
  status: 'status', releaseDate: 'release_date', completionDate: 'completion_date', remarks: 'remarks',
}

export const allocationRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    for (const [k, c] of Object.entries(ALLOC_FIELDS)) {
      if (data[k] !== undefined && data[k] !== null) { cols.push(c); vals.push(data[k]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO inventory_allocations (${cols.join(', ')}, version, created_at, updated_at) VALUES (${ph}, 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const r = await scopedQuery(`SELECT * FROM inventory_allocations WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'inventory_allocations' })
    return r.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string; search?: string; warehouseId?: string; soId?: string } = {}) {
    const pg = params.page ?? 1; const ps = params.pageSize ?? 25; const off = (pg - 1) * ps
    let w = 'inventory_allocations.tenant_id = $1 AND inventory_allocations.deleted_at IS NULL'
    const sp: unknown[] = [tenantId]; let i = 2
    if (params.status) { w += ` AND inventory_allocations.status = $${i++}`; sp.push(params.status) }
    if (params.warehouseId) { w += ` AND inventory_allocations.warehouse_id = $${i++}`; sp.push(params.warehouseId) }
    if (params.soId) { w += ` AND inventory_allocations.so_id = $${i++}`; sp.push(params.soId) }
    if (params.search) { w += ` AND (inventory_allocations.allocation_number ILIKE $${i} OR inventory_allocations.so_number ILIKE $${i} OR inventory_allocations.product_name ILIKE $${i})`; sp.push(`%${params.search}%`); i++ }
    const total = await scopedCount('inventory_allocations', 'inventory_allocations', w, sp)
    const r = await scopedQuery(`SELECT * FROM inventory_allocations WHERE ${w} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`, [...sp, ps, off], { tableAlias: 'inventory_allocations' })
    return { rows: r.rows, total, page: pg, pageSize: ps }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']; const vals: unknown[] = [tenantId, id]; let idx = 3
    for (const [k, c] of Object.entries(ALLOC_FIELDS)) { if (data[k] !== undefined) { setParts.push(`${c} = $${idx++}`); vals.push(data[k]) } }
    vals.push(version)
    const r = await query(`UPDATE inventory_allocations SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return r.rows[0] ?? null
  },
  async softDelete(tenantId: string, id: string) {
    await query(`UPDATE inventory_allocations SET deleted_at = NOW(), status = 'CANCELLED' WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
  },
}

export const wavePlanRepository = {
  async create(data: Record<string, unknown>) {
    const id = randomUUID()
    const cols: string[] = ['id']; const vals: unknown[] = [id]
    for (const [k, c] of Object.entries(WAVE_FIELDS)) {
      if (data[k] !== undefined && data[k] !== null) { cols.push(c); vals.push(data[k]) }
    }
    const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
    await query(`INSERT INTO wave_plans (${cols.join(', ')}, version, created_at, updated_at) VALUES (${ph}, 0, NOW(), NOW())`, vals)
    return this.findById(String(data['tenantId']), id)
  },
  async findById(tenantId: string, id: string) {
    const r = await scopedQuery(`SELECT * FROM wave_plans WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id], { tableAlias: 'wave_plans' })
    return r.rows[0] ?? null
  },
  async list(tenantId: string, params: { page?: number; pageSize?: number; status?: string; search?: string; warehouseId?: string } = {}) {
    const pg = params.page ?? 1; const ps = params.pageSize ?? 25; const off = (pg - 1) * ps
    let w = 'wave_plans.tenant_id = $1 AND wave_plans.deleted_at IS NULL'
    const sp: unknown[] = [tenantId]; let i = 2
    if (params.status) { w += ` AND wave_plans.status = $${i++}`; sp.push(params.status) }
    if (params.warehouseId) { w += ` AND wave_plans.warehouse_id = $${i++}`; sp.push(params.warehouseId) }
    if (params.search) { w += ` AND (wave_plans.wave_number ILIKE $${i})`; sp.push(`%${params.search}%`); i++ }
    const total = await scopedCount('wave_plans', 'wave_plans', w, sp)
    const r = await scopedQuery(`SELECT * FROM wave_plans WHERE ${w} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`, [...sp, ps, off], { tableAlias: 'wave_plans' })
    return { rows: r.rows, total, page: pg, pageSize: ps }
  },
  async update(tenantId: string, id: string, data: Record<string, unknown>, version: number) {
    const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']; const vals: unknown[] = [tenantId, id]; let idx = 3
    for (const [k, c] of Object.entries(WAVE_FIELDS)) { if (data[k] !== undefined) { setParts.push(`${c} = $${idx++}`); vals.push(data[k]) } }
    vals.push(version)
    const r = await query(`UPDATE wave_plans SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
    return r.rows[0] ?? null
  },
  async softDelete(tenantId: string, id: string) {
    await query(`UPDATE wave_plans SET deleted_at = NOW(), status = 'CANCELLED' WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, id])
  },
}

export async function generateAllocationNumber(t: string): Promise<string> {
  const y = new Date().getFullYear()
  const c = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM inventory_allocations WHERE tenant_id = $1 AND allocation_number LIKE 'ALLOC-${y}-%'`, [t])
  return `ALLOC-${y}-${String(Number(c.rows[0]!.cnt) + 1).padStart(6, '0')}`
}

export async function generateWaveNumber(t: string): Promise<string> {
  const y = new Date().getFullYear()
  const c = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM wave_plans WHERE tenant_id = $1 AND wave_number LIKE 'WAVE-${y}-%'`, [t])
  return `WAVE-${y}-${String(Number(c.rows[0]!.cnt) + 1).padStart(6, '0')}`
}

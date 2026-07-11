import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'
function genRepo(table: string, fields: Record<string, string>) {
  return {
    async create(data: Record<string, unknown>) {
      const id = randomUUID(); const cols = ['id']; const vals: unknown[] = [id]
      for (const [k, c] of Object.entries(fields)) { if (data[k] !== undefined && data[k] !== null) { cols.push(c); vals.push(data[k]) } }
      const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
      await query(`INSERT INTO ${table} (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
      const r = await query(`SELECT * FROM ${table} WHERE id = $1`, [id]); return r.rows[0] ?? null
    },
    async findById(t: string, id: string) { const r = await query(`SELECT * FROM ${table} WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [t, id]); return r.rows[0] ?? null },
    async list(t: string, p: { page?: number; pageSize?: number; status?: string } = {}) {
      const pg = p.page ?? 1; const ps = p.pageSize ?? 25; const off = (pg - 1) * ps
      let w = 'tenant_id = $1 AND deleted_at IS NULL'; const sp: unknown[] = [t]; let i = 2
      if (p.status) { w += ` AND status = $${i++}`; sp.push(p.status) }
      const c = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM ${table} WHERE ${w}`, sp)
      const r = await query(`SELECT * FROM ${table} WHERE ${w} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`, [...sp, ps, off])
      return { rows: r.rows, total: Number(c.rows[0]!.cnt), page: pg, pageSize: ps }
    },
    async update(t: string, id: string, data: Record<string, unknown>, version: number) {
      const setParts: string[] = ['version = version + 1', 'updated_at = NOW()']; const vals: unknown[] = [t, id]; let idx = 3
      for (const [k, c] of Object.entries(fields)) { if (data[k] !== undefined) { setParts.push(`${c} = $${idx++}`); vals.push(data[k]) } }
      vals.push(version)
      const r = await query(`UPDATE ${table} SET ${setParts.join(', ')} WHERE tenant_id = $1 AND id = $2 AND version = $${idx} AND deleted_at IS NULL RETURNING *`, vals)
      return r.rows[0] ?? null
    },
  }
}
export const allocationRepository = genRepo('inventory_allocations', { tenantId: 'tenant_id', allocationNumber: 'allocation_number', soId: 'so_id', soNumber: 'so_number', soLineId: 'so_line_id', productId: 'product_id', productSku: 'product_sku', productName: 'product_name', warehouseId: 'warehouse_id', warehouseName: 'warehouse_name', batchId: 'batch_id', batchNumber: 'batch_number', lotId: 'lot_id', lotNumber: 'lot_number', uomId: 'uom_id', uomCode: 'uom_code', orderedQty: 'ordered_qty', allocatedQty: 'allocated_qty', shortQty: 'short_qty', allocationStrategy: 'allocation_strategy', isFullyAllocated: 'is_fully_allocated', isPartial: 'is_partial', status: 'status' })
export const wavePlanRepository = genRepo('wave_plans', { tenantId: 'tenant_id', waveNumber: 'wave_number', warehouseId: 'warehouse_id', warehouseName: 'warehouse_name', waveType: 'wave_type', priority: 'priority', totalOrders: 'total_orders', totalLines: 'total_lines', totalQty: 'total_qty', allocatedQty: 'allocated_qty', pickedQty: 'picked_qty', status: 'status', releaseDate: 'release_date', completionDate: 'completion_date', remarks: 'remarks' })
export async function generateAllocationNumber(t: string): Promise<string> { const y = new Date().getFullYear(); const c = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM inventory_allocations WHERE tenant_id = $1 AND allocation_number LIKE 'ALLOC-${y}-%'`, [t]); return `ALLOC-${y}-${String(Number(c.rows[0]!.cnt) + 1).padStart(6, '0')}` }
export async function generateWaveNumber(t: string): Promise<string> { const y = new Date().getFullYear(); const c = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM wave_plans WHERE tenant_id = $1 AND wave_number LIKE 'WAVE-${y}-%'`, [t]); return `WAVE-${y}-${String(Number(c.rows[0]!.cnt) + 1).padStart(6, '0')}` }

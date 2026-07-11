import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'
export function genRepo(tableName: string) {
  return {
    async create(data: Record<string, unknown>) { const id = randomUUID(); const cols = ['id']; const vals: unknown[] = [id]; for (const [k, c] of Object.entries(data)) { if (k !== 'id' && c !== undefined && c !== null) { cols.push(k); vals.push(c) } } const ph = vals.map((_, i) => '$' + (i + 1)).join(', '); await query('INSERT INTO ' + tableName + ' (' + cols.join(', ') + ', created_at, updated_at) VALUES (' + ph + ', NOW(), NOW())', vals); const r = await query('SELECT * FROM ' + tableName + ' WHERE id = $1', [id]); return r.rows[0] ?? null },
    async findById(t: string, id: string) { const r = await query('SELECT * FROM ' + tableName + ' WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL', [t, id]); return r.rows[0] ?? null },
    async list(t: string, p: { page?: number; pageSize?: number; status?: string } = {}) { const pg = p.page ?? 1; const ps = p.pageSize ?? 25; const off = (pg - 1) * ps; let w = 'tenant_id = $1 AND deleted_at IS NULL'; const sp: unknown[] = [t]; let i = 2; if (p.status) { w += ' AND status = $' + i++; sp.push(p.status) } const c = await query<{ cnt: string }>('SELECT COUNT(*) as cnt FROM ' + tableName + ' WHERE ' + w, sp); const r = await query('SELECT * FROM ' + tableName + ' WHERE ' + w + ' ORDER BY created_at DESC LIMIT $' + i + ' OFFSET $' + (i + 1), [...sp, ps, off]); return { rows: r.rows, total: Number(c.rows[0]!.cnt), page: pg, pageSize: ps } },
  }
}

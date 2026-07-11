/** Pricing Engine Repository */
import { query } from '@/core/db/pglite'
import { randomUUID } from 'node:crypto'

function genRepo(table: string, fields: Record<string, string>) {
  return {
    async create(data: Record<string, unknown>) {
      const id = randomUUID()
      const cols = ['id']; const vals: unknown[] = [id]
      for (const [k, c] of Object.entries(fields)) { if (data[k] !== undefined && data[k] !== null) { cols.push(c); vals.push(data[k]) } }
      const ph = vals.map((_, i) => `\$${i + 1}`).join(', ')
      await query(`INSERT INTO ${table} (${cols.join(', ')}, created_at, updated_at) VALUES (${ph}, NOW(), NOW())`, vals)
      const r = await query(`SELECT * FROM ${table} WHERE id = $1`, [id])
      return r.rows[0] ?? null
    },
    async findById(t: string, id: string) { const r = await query(`SELECT * FROM ${table} WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [t, id]); return r.rows[0] ?? null },
    async list(t: string, p: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
      const pg = p.page ?? 1; const ps = p.pageSize ?? 25; const off = (pg - 1) * ps
      let w = 'tenant_id = $1 AND deleted_at IS NULL'; const sp: unknown[] = [t]; let i = 2
      if (p.search) { w += ` AND (list_code ILIKE $${i} OR list_name ILIKE $${i})`; sp.push(`%${p.search}%`); i++ }
      if (p.isActive !== undefined) { w += ` AND is_active = $${i++}`; sp.push(p.isActive) }
      const c = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM ${table} WHERE ${w}`, sp)
      const total = Number(c.rows[0]!.cnt)
      const r = await query(`SELECT * FROM ${table} WHERE ${w} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`, [...sp, ps, off])
      return { rows: r.rows, total, page: pg, pageSize: ps }
    },
  }
}

export const priceListRepository = genRepo('price_lists', { tenantId: 'tenant_id', listCode: 'list_code', listName: 'list_name', listType: 'list_type', channel: 'channel', currency: 'currency', effectiveFrom: 'effective_from', effectiveTo: 'effective_to', isActive: 'is_active', description: 'description' })
export const promotionRepository = genRepo('promotions', { tenantId: 'tenant_id', promoCode: 'promo_code', promoName: 'promo_name', promoType: 'promo_type', scope: 'scope', productId: 'product_id', productCategoryId: 'product_category_id', customerId: 'customer_id', customerGroupId: 'customer_group_id', discountType: 'discount_type', discountValue: 'discount_value', minQty: 'min_qty', maxQty: 'max_qty', minOrderValue: 'min_order_value', maxDiscountAmount: 'max_discount_amount', buyQty: 'buy_qty', getQty: 'get_qty', startDate: 'start_date', endDate: 'end_date', isActive: 'is_active', usageLimit: 'usage_limit', usageCount: 'usage_count', description: 'description', termsConditions: 'terms_conditions' })
export const couponRepository = genRepo('coupons', { tenantId: 'tenant_id', couponCode: 'coupon_code', couponName: 'coupon_name', couponType: 'coupon_type', discountType: 'discount_type', discountValue: 'discount_value', minOrderValue: 'min_order_value', maxDiscountAmount: 'max_discount_amount', startDate: 'start_date', endDate: 'end_date', usageLimit: 'usage_limit', usageCount: 'usage_count', perCustomerLimit: 'per_customer_limit', isActive: 'is_active', description: 'description' })
export const taxConfigRepository = genRepo('tax_configurations', { tenantId: 'tenant_id', taxCode: 'tax_code', taxName: 'tax_name', taxType: 'tax_type', taxPercent: 'tax_percent', hsnCode: 'hsn_code', sacCode: 'sac_code', isReverseCharge: 'is_reverse_charge', isActive: 'is_active', description: 'description' })

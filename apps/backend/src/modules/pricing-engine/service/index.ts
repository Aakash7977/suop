/** Pricing Engine Service — Price lists, promotions, coupons, scheme engine, tax calculation */
import { priceListRepository, promotionRepository, couponRepository, taxConfigRepository } from '../repository'
import { auditService } from '@/core/audit'

import { getRequestContext } from '@/core/context'
import { query } from '@/core/db/pglite'
import { BusinessRuleError, AuthorizationError } from '@/core/errors'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx }
}

export const pricingEngineService = {
  async createPriceList(data: { listCode: string; listName: string; listType?: string; channel?: string; currency?: string; effectiveFrom: string; effectiveTo?: string; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const pl = await priceListRepository.create({ tenantId, ...data, isActive: true })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'PriceList', entityId: String(pl!['id']), entityCode: data.listCode, after: data })
    return pl
  },

  async listPriceLists(params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
    const { tenantId } = getContext()
    return priceListRepository.list(tenantId, params)
  },

  async createPromotion(data: { promoCode: string; promoName: string; promoType: string; scope?: string; productId?: string; productCategoryId?: string; customerId?: string; customerGroupId?: string; discountType: string; discountValue: number; minQty?: number; maxQty?: number; minOrderValue?: number; maxDiscountAmount?: number; buyQty?: number; getQty?: number; startDate: string; endDate: string; usageLimit?: number; description?: string; termsConditions?: string }) {
    const { tenantId, userId, ctx } = getContext()
    if (new Date(data.endDate) < new Date(data.startDate)) throw new BusinessRuleError('End date must be after start date', { code: 'PROMO.INVALID_DATES' })
    const promo = await promotionRepository.create({ tenantId, ...data, isActive: true, usageCount: 0 })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'Promotion', entityId: String(promo!['id']), entityCode: data.promoCode, after: data })
    return promo
  },

  async listPromotions(params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
    const { tenantId } = getContext()
    return promotionRepository.list(tenantId, params)
  },

  async createCoupon(data: { couponCode: string; couponName: string; couponType: string; discountType: string; discountValue: number; minOrderValue?: number; maxDiscountAmount?: number; startDate: string; endDate: string; usageLimit?: number; perCustomerLimit?: number; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    if (new Date(data.endDate) < new Date(data.startDate)) throw new BusinessRuleError('End date must be after start date', { code: 'COUPON.INVALID_DATES' })
    const coupon = await couponRepository.create({ tenantId, ...data, isActive: true, usageCount: 0 })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'Coupon', entityId: String(coupon!['id']), entityCode: data.couponCode, after: data })
    return coupon
  },

  async listCoupons(params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
    const { tenantId } = getContext()
    return couponRepository.list(tenantId, params)
  },

  /** Scheme Engine — calculate best price for a product given customer, channel, quantity */
  async calculatePrice(data: { productId: string; customerId?: string; channel?: string; quantity: number; uomCode: string; couponCode?: string }) {
    const { tenantId } = getContext()

    // 1. Get base price from active price list
    let basePrice = 0
    let listPrice = 0
    const plResult = await query(`SELECT pli.* FROM price_list_items pli JOIN price_lists pl ON pli.price_list_id = pl.id WHERE pl.tenant_id = $1 AND pl.is_active = true AND pli.product_id = $2 AND pli.is_active = true AND (pl.channel IS NULL OR pl.channel = $3) ORDER BY pl.effective_from DESC LIMIT 1`, [tenantId, data.productId, data.channel ?? null])
    if (plResult.rows.length > 0) {
      basePrice = Number(plResult.rows[0]!['list_price'])
      listPrice = basePrice
    } else {
      // Fallback to product standard price
      const prodResult = await query<{ price: string }>(`SELECT price FROM products WHERE tenant_id = $1 AND id = $2`, [tenantId, data.productId])
      basePrice = Number(prodResult.rows[0]?.['price'] ?? 0)
      listPrice = basePrice
    }

    // 2. Apply customer-specific discount if agreement exists
    let customerDiscountPercent = 0
    if (data.customerId) {
      const cpaResult = await query<{ discount_percent: string }>(`SELECT discount_percent FROM customer_price_agreements WHERE tenant_id = $1 AND customer_id = $2 AND is_active = true AND (effective_to IS NULL OR effective_to >= CURRENT_DATE) LIMIT 1`, [tenantId, data.customerId])
      if (cpaResult.rows.length > 0) customerDiscountPercent = Number(cpaResult.rows[0]!['discount_percent'])
    }

    // 3. Check for applicable promotions
    let promoDiscountAmount = 0
    let appliedPromo: string | null = null
    const promoResult = await query(`SELECT * FROM promotions WHERE tenant_id = $1 AND is_active = true AND CURRENT_DATE BETWEEN start_date AND end_date AND (product_id = $2 OR product_id IS NULL) AND (customer_id = $3 OR customer_id IS NULL) AND (min_qty IS NULL OR min_qty <= $4) ORDER BY discount_value DESC LIMIT 1`, [tenantId, data.productId, data.customerId ?? null, data.quantity])
    if (promoResult.rows.length > 0) {
      const promo = promoResult.rows[0]!
      appliedPromo = String(promo['promo_code'])
      if (promo['discount_type'] === 'PERCENT') {
        promoDiscountAmount = listPrice * data.quantity * (Number(promo['discount_value']) / 100)
      } else {
        promoDiscountAmount = Number(promo['discount_value']) * data.quantity
      }
    }

    // 4. Apply coupon if provided
    let couponDiscountAmount = 0
    let appliedCoupon: string | null = null
    if (data.couponCode) {
      const couponResult = await query(`SELECT * FROM coupons WHERE tenant_id = $1 AND coupon_code = $2 AND is_active = true AND CURRENT_DATE BETWEEN start_date AND end_date AND usage_count < usage_limit`, [tenantId, data.couponCode])
      if (couponResult.rows.length > 0) {
        const coupon = couponResult.rows[0]!
        const orderValue = listPrice * data.quantity
        if (!coupon['min_order_value'] || orderValue >= Number(coupon['min_order_value'])) {
          appliedCoupon = String(coupon['coupon_code'])
          if (coupon['discount_type'] === 'PERCENT') {
            couponDiscountAmount = orderValue * (Number(coupon['discount_value']) / 100)
          } else {
            couponDiscountAmount = Number(coupon['discount_value'])
          }
          if (coupon['max_discount_amount']) {
            couponDiscountAmount = Math.min(couponDiscountAmount, Number(coupon['max_discount_amount']))
          }
        }
      }
    }

    // 5. Calculate totals
    const customerDiscountAmount = listPrice * data.quantity * (customerDiscountPercent / 100)
    const totalDiscount = customerDiscountAmount + promoDiscountAmount + couponDiscountAmount
    const subtotal = listPrice * data.quantity
    const afterDiscount = subtotal - totalDiscount

    // 6. Tax calculation
    const taxResult = await query<{ tax_percent: string }>(`SELECT tax_percent FROM tax_configurations WHERE tenant_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1`, [tenantId])
    const taxPercent = Number(taxResult.rows[0]?.['tax_percent'] ?? 18)
    const taxAmount = afterDiscount * (taxPercent / 100)
    const grandTotal = afterDiscount + taxAmount

    return {
      productId: data.productId, quantity: data.quantity,
      basePrice, listPrice,
      customerDiscountPercent, customerDiscountAmount,
      appliedPromo, promoDiscountAmount,
      appliedCoupon, couponDiscountAmount,
      subtotal, totalDiscount, afterDiscount,
      taxPercent, taxAmount, grandTotal,
    }
  },

  async createTaxConfig(data: { taxCode: string; taxName: string; taxType: string; taxPercent: number; hsnCode?: string; sacCode?: string; isReverseCharge?: boolean; description?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const tax = await taxConfigRepository.create({ tenantId, ...data, isActive: true })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'TaxConfig', entityId: String(tax!['id']), entityCode: data.taxCode, after: data })
    return tax
  },

  async listTaxConfigs(params: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
    const { tenantId } = getContext()
    return taxConfigRepository.list(tenantId, params)
  },
}

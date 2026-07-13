/**
 * Section 03 — Master Data Management
 * Unified API Service Layer
 *
 * Re-exports existing API clients from src/modules/{product,customer,...}/api/client.ts
 * and adds Section-03-specific helpers (toast, optimistic concurrency, cached lookups).
 *
 * Every method here calls the real backend (no mock data).
 */

import { productApi, type Product, type Category, type Brand, type UOM } from '@/modules/product/api/client'
import { customerApi, type Customer, type CustomerGroup } from '@/modules/customer/api/client'
import { supplierApi, type Supplier, type SupplierCategory } from '@/modules/supplier/api/client'
import {
  companyApi, plantApi, warehouseApi as orgWarehouseApi, departmentApi, costCenterApi,
  financialYearApi, hierarchyApi,
  type Company, type Plant, type Warehouse as OrgWarehouse,
  type Department, type CostCenter, type FinancialYear, type HierarchyNode,
} from '@/modules/organization/api/client'
import { warehouseApi, type WarehouseBin } from '@/modules/warehouse/api/client'
import { inventoryApi, type Inventory } from '@/modules/inventory/api/client'

// ─── Re-exports for convenience ─────────────────────────────────────────────
export {
  productApi, customerApi, supplierApi,
  companyApi, plantApi, orgWarehouseApi, departmentApi, costCenterApi,
  financialYearApi, hierarchyApi,
  warehouseApi, inventoryApi,
}

export type {
  Product, Category, Brand, UOM,
  Customer, CustomerGroup,
  Supplier, SupplierCategory,
  Company, Plant, OrgWarehouse, Department, CostCenter, FinancialYear, HierarchyNode,
  WarehouseBin, Inventory,
}

// ─── Common types ────────────────────────────────────────────────────────────

export interface PaginatedMeta {
  total: number
  page: number
  pageSize: number
  totalPages?: number
  hasNext?: boolean
  hasPrev?: boolean
}

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  [key: string]: string | number | undefined
}

// ─── Pricing Engine API (no existing client — built here) ───────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

async function pricingFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('suop_access_token') : null
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.error?.message || `HTTP ${res.status}`)
  return json as T
}

export interface PriceList {
  id: string
  code: string
  name: string
  price_list_type?: string
  currency: string
  valid_from: string
  valid_to?: string
  priority: number
  status: string
  tax_mode?: string
  version: number
}

export interface Promotion {
  id: string
  code: string
  name: string
  promotion_type: string
  offer_type?: string
  discount_value?: string
  start_date: string
  end_date: string
  status: string
  usage_limit?: number
  used_count?: number
  version: number
}

export interface Coupon {
  id: string
  coupon_code: string
  coupon_name: string
  coupon_type: string
  discount_type: string
  discount_value: string
  status: string
  usage_limit?: number
  used_count?: number
  version: number
}

export interface TaxConfig {
  id: string
  code: string
  name: string
  tax_type: string
  rate: string
  status: string
  version: number
}

export const pricingApi = {
  listPriceLists: (params?: ListParams) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.search) qs.set('search', params.search)
    return pricingFetch<{ success: true; data: PriceList[]; meta: PaginatedMeta }>(`/api/v1/sales/pricing/price-lists?${qs}`)
  },
  createPriceList: (data: Record<string, unknown>) =>
    pricingFetch(`/api/v1/sales/pricing/price-lists`, { method: 'POST', body: JSON.stringify(data) }),
  listPromotions: (params?: ListParams) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.search) qs.set('search', params.search)
    return pricingFetch<{ success: true; data: Promotion[]; meta: PaginatedMeta }>(`/api/v1/sales/pricing/promotions?${qs}`)
  },
  createPromotion: (data: Record<string, unknown>) =>
    pricingFetch(`/api/v1/sales/pricing/promotions`, { method: 'POST', body: JSON.stringify(data) }),
  listCoupons: (params?: ListParams) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return pricingFetch<{ success: true; data: Coupon[]; meta: PaginatedMeta }>(`/api/v1/sales/pricing/coupons?${qs}`)
  },
  createCoupon: (data: Record<string, unknown>) =>
    pricingFetch(`/api/v1/sales/pricing/coupons`, { method: 'POST', body: JSON.stringify(data) }),
  listTaxConfigs: (params?: ListParams) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return pricingFetch<{ success: true; data: TaxConfig[]; meta: PaginatedMeta }>(`/api/v1/sales/pricing/tax-configs?${qs}`)
  },
  createTaxConfig: (data: Record<string, unknown>) =>
    pricingFetch(`/api/v1/sales/pricing/tax-configs`, { method: 'POST', body: JSON.stringify(data) }),
  calculate: (data: Record<string, unknown>) =>
    pricingFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/sales/pricing/calculate`, { method: 'POST', body: JSON.stringify(data) }),
}

// ─── GST / HSN API (uses finance/gst endpoints; some endpoints may 500 until backend is fixed) ───

export interface GstConfig {
  id: string
  code: string
  name: string
  tax_rate?: string
  status: string
  version: number
}

export const gstApi = {
  list: (params?: ListParams) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.search) qs.set('search', params.search)
    return pricingFetch<{ success: true; data: GstConfig[]; meta: PaginatedMeta }>(`/api/v1/finance/gst?${qs}`)
  },
  get: (id: string) =>
    pricingFetch<{ success: true; data: GstConfig }>(`/api/v1/finance/gst/${id}`),
}

// ─── Financial Foundation API (currency, exchange rates, fiscal years) ──────

export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  decimal_places: number
  status: string
}

export interface ExchangeRate {
  id: string
  from_currency: string
  to_currency: string
  rate: string
  effective_date: string
  status: string
}

export const financeApi = {
  listCurrencies: (params?: ListParams) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return pricingFetch<{ success: true; data: Currency[]; meta: PaginatedMeta }>(`/api/v1/finance/foundation/currencies?${qs}`)
  },
  createCurrency: (data: Record<string, unknown>) =>
    pricingFetch(`/api/v1/finance/foundation/currencies`, { method: 'POST', body: JSON.stringify(data) }),
  listExchangeRates: (params?: ListParams) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return pricingFetch<{ success: true; data: ExchangeRate[]; meta: PaginatedMeta }>(`/api/v1/finance/foundation/exchange-rates?${qs}`)
  },
  createExchangeRate: (data: Record<string, unknown>) =>
    pricingFetch(`/api/v1/finance/foundation/exchange-rates`, { method: 'POST', body: JSON.stringify(data) }),
}

export { useAuthStore } from '@/stores/auth-store'

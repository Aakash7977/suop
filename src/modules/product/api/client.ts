/** Product Frontend API Client — real backend calls */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('suop_access_token') : null
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...((options.headers as Record<string, string>) || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.error?.message || `HTTP ${res.status}`)
  return json as T
}

export interface Product {
  id: string; sku: string; item_code: string | null; name: string; short_name: string | null; description: string | null
  product_type: string; category_id: string | null; brand_id: string | null; base_uom_id: string
  hsn_code: string | null; gst_rate: string | null; mrp: string | null; standard_cost: string | null
  shelf_life_days: number | null; batch_required: boolean; serial_required: boolean; expiry_tracking: boolean
  fifo_strategy: string; inspection_required: boolean; costing_method: string
  abc_class: string | null; xyz_class: string | null; fsn_class: string | null; is_critical: boolean
  procurement_type: string; status: string; version: number; created_at: string
  barcodes?: Array<{ id: string; barcode_type: string; barcodeValue: string; is_primary: boolean }>
}
export interface Category { id: string; code: string; name: string; product_type: string | null }
export interface Brand { id: string; code: string; name: string }
export interface UOM { id: string; code: string; name: string; symbol: string; uom_type: string }

export const productApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; productType?: string; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    if (params?.search) qs.set('search', params.search)
    if (params?.productType) qs.set('productType', params.productType)
    if (params?.status) qs.set('status', params.status)
    return apiFetch<{ success: true; data: Product[]; meta: { total: number; page: number; pageSize: number } }>(`/api/v1/catalog/products?${qs}`)
  },
  get: (id: string) => apiFetch<{ success: true; data: Product }>(`/api/v1/catalog/products/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/catalog/products`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>, version: number) => apiFetch(`/api/v1/catalog/products/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/catalog/products/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/catalog/products/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
  lookupBarcode: (barcode: string) => apiFetch<{ success: true; data: Product }>(`/api/v1/catalog/products/barcode/${barcode}`),
  listCategories: () => apiFetch<{ success: true; data: Category[] }>(`/api/v1/catalog/categories`),
  createCategory: (data: Record<string, unknown>) => apiFetch(`/api/v1/catalog/categories`, { method: 'POST', body: JSON.stringify(data) }),
  listBrands: () => apiFetch<{ success: true; data: Brand[] }>(`/api/v1/catalog/brands`),
  createBrand: (data: Record<string, unknown>) => apiFetch(`/api/v1/catalog/brands`, { method: 'POST', body: JSON.stringify(data) }),
  listUOMs: () => apiFetch<{ success: true; data: UOM[] }>(`/api/v1/catalog/uoms`),
  listBarcodes: (productId: string) => apiFetch<{ success: true; data: Array<{ id: string; barcode_type: string; barcode_value: string; is_primary: boolean }> }>(`/api/v1/catalog/products/${productId}/barcodes`),
  addBarcode: (productId: string, data: { barcodeType?: string; barcodeValue: string; isPrimary?: boolean }) => apiFetch(`/api/v1/catalog/products/${productId}/barcodes`, { method: 'POST', body: JSON.stringify(data) }),
}

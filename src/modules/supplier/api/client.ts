/** Supplier Frontend API Client */
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
export interface Supplier { id: string; vendor_code: string; legal_name: string; trade_name: string; gstin: string | null; pan: string | null; primary_email: string | null; phone: string | null; vendor_type: string; supplier_type: string; status: string; risk_level: string; is_preferred: boolean; credit_limit: string | null; payment_terms: string; version: number }
export interface SupplierCategory { id: string; code: string; name: string; supplier_type: string; vendor_type: string }
export const supplierApi = {
  list: (params?: { page?: number; search?: string; status?: string; vendorType?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.search) qs.set('search', params.search)
    if (params?.status) qs.set('status', params.status)
    if (params?.vendorType) qs.set('vendorType', params.vendorType)
    return apiFetch<{ success: true; data: Supplier[]; meta: { total: number; page: number; pageSize: number } }>(`/api/v1/procurement/suppliers?${qs}`)
  },
  get: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/suppliers/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/suppliers`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>, version: number) => apiFetch(`/api/v1/procurement/suppliers/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/procurement/suppliers/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/procurement/suppliers/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
  blacklist: (id: string, reason: string) => apiFetch(`/api/v1/procurement/suppliers/${id}/blacklist`, { method: 'POST', body: JSON.stringify({ reason }) }),
  listCategories: () => apiFetch<{ success: true; data: SupplierCategory[] }>(`/api/v1/procurement/supplier-categories`),
}

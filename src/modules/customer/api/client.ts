/** Customer Frontend API Client */
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
export interface Customer { id: string; customer_code: string; customer_type: string; trade_name: string; legal_name: string | null; gstin: string | null; primary_email: string | null; phone: string | null; status: string; risk_rating: string; credit_limit: string | null; outstanding_balance: string; credit_hold: boolean; version: number }
export interface CustomerGroup { id: string; code: string; name: string }
export const customerApi = {
  list: (params?: { page?: number; search?: string; status?: string; customerType?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.search) qs.set('search', params.search)
    if (params?.status) qs.set('status', params.status)
    if (params?.customerType) qs.set('customerType', params.customerType)
    return apiFetch<{ success: true; data: Customer[]; meta: { total: number; page: number; pageSize: number } }>(`/api/v1/sales/customers?${qs}`)
  },
  get: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/sales/customers/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/customers`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>, version: number) => apiFetch(`/api/v1/sales/customers/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/sales/customers/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/sales/customers/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
  getCredit: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/sales/customers/${id}/credit`),
  listGroups: () => apiFetch<{ success: true; data: CustomerGroup[] }>(`/api/v1/sales/customer-groups`),
  createGroup: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/customer-groups`, { method: 'POST', body: JSON.stringify(data) }),
  lookupByGstin: (gstin: string) => apiFetch<{ success: true; data: Customer }>(`/api/v1/sales/customers/gst/${gstin}`),
  addContact: (id: string, data: { name: string; designation?: string; email?: string; phone?: string; mobile?: string; isPrimary?: boolean }) => apiFetch(`/api/v1/sales/customers/${id}/contacts`, { method: 'POST', body: JSON.stringify(data) }),
  addAddress: (id: string, data: { addressType?: string; addressLine1: string; city: string; state?: string; country?: string; postalCode?: string; isPrimary?: boolean }) => apiFetch(`/api/v1/sales/customers/${id}/addresses`, { method: 'POST', body: JSON.stringify(data) }),
}

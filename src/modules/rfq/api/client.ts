/** RFQ Frontend API Client */
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
export interface Rfq { id: string; rfq_number: string; rfq_type: string; rfq_date: string; closing_date: string; status: string; buyer_name: string; pr_number: string | null; remarks: string | null; version: number }
export const rfqApi = {
  list: (params?: { page?: number; search?: string; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.search) qs.set('search', params.search)
    if (params?.status) qs.set('status', params.status)
    return apiFetch<{ success: true; data: Rfq[]; meta: { total: number; page: number; pageSize: number } }>(`/api/v1/procurement/rfqs/rfqs?${qs}`)
  },
  get: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/rfqs/rfqs/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/rfqs/rfqs`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>, version: number) => apiFetch(`/api/v1/procurement/rfqs/rfqs/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/procurement/rfqs/rfqs/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/procurement/rfqs/rfqs/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
  inviteSupplier: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/rfqs/rfqs/${id}/suppliers`, { method: 'POST', body: JSON.stringify(data) }),
}

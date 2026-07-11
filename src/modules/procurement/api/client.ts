/** Procurement Frontend API Client */
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
export interface PurchaseRequisition { id: string; pr_number: string; requisition_type: string; priority: string; required_date: string; estimated_total: string; currency: string; status: string; requester_name: string; remarks: string | null; version: number }
export const procurementApi = {
  list: (params?: { page?: number; search?: string; status?: string; priority?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.search) qs.set('search', params.search)
    if (params?.status) qs.set('status', params.status)
    if (params?.priority) qs.set('priority', params.priority)
    return apiFetch<{ success: true; data: PurchaseRequisition[]; meta: { total: number; page: number; pageSize: number } }>(`/api/v1/procurement/requisitions/requisitions?${qs}`)
  },
  get: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/requisitions/requisitions/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/requisitions/requisitions`, { method: 'POST', body: JSON.stringify(data) }),
  transition: (id: string, targetStatus: string, version: number, comments?: string) => apiFetch(`/api/v1/procurement/requisitions/requisitions/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version, comments }) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/procurement/requisitions/requisitions/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
}

/** Quality Inspection Frontend API Client */
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

export interface InspectionLot {
  id: string
  lot_number: string
  product_sku: string
  product_name: string
  lot_quantity: number
  sample_size: number
  inspection_status: string
  result: string | null
  grn_id: string
  version: number
}

export const qualityInspectionApi = {
  listLots: (params?: { page?: number; pageSize?: number; search?: string; status?: string; grnId?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    if (params?.search) qs.set('search', params.search)
    if (params?.status) qs.set('status', params.status)
    if (params?.grnId) qs.set('grnId', params.grnId)
    return apiFetch<{ success: true; data: InspectionLot[]; meta: { total: number; page: number; pageSize: number } }>(`/api/v1/quality/lots?${qs}`)
  },
  getLot: (id: string) => apiFetch<{ success: true; data: InspectionLot & { results: unknown[] } }>(`/api/v1/quality/lots/${id}`),
  createLot: (data: Record<string, unknown>) => apiFetch(`/api/v1/quality/lots`, { method: 'POST', body: JSON.stringify(data) }),
  startInspection: (id: string, version: number) => apiFetch(`/api/v1/quality/lots/${id}/start`, { method: 'POST', headers: { 'If-Match': String(version) } }),
  recordResult: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/quality/lots/${id}/results`, { method: 'POST', body: JSON.stringify(data) }),
  transitionLot: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/quality/lots/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
  listNcrs: (params?: { page?: number; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.status) qs.set('status', params.status)
    return apiFetch<{ success: true; data: unknown[]; meta: { total: number } }>(`/api/v1/quality/ncrs?${qs}`)
  },
  listHolds: (params?: { page?: number; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.status) qs.set('status', params.status)
    return apiFetch<{ success: true; data: unknown[]; meta: { total: number } }>(`/api/v1/quality/holds?${qs}`)
  },
}

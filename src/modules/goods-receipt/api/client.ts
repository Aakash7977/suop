/** Goods Receipt Frontend API Client */
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

export interface GoodsReceipt {
  id: string
  grn_number: string
  grn_date: string
  po_number: string | null
  supplier_name: string
  supplier_code: string
  total_qty: number
  total_accepted_qty: number
  status: string
  version: number
}

export const goodsReceiptApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; status?: string; supplierId?: string; poId?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    if (params?.search) qs.set('search', params.search)
    if (params?.status) qs.set('status', params.status)
    if (params?.supplierId) qs.set('supplierId', params.supplierId)
    if (params?.poId) qs.set('poId', params.poId)
    return apiFetch<{ success: true; data: GoodsReceipt[]; meta: { total: number; page: number; pageSize: number } }>(`/api/v1/warehouse/grns/grns?${qs}`)
  },
  get: (id: string) => apiFetch<{ success: true; data: GoodsReceipt & { lines: unknown[]; attachments: unknown[]; damages: unknown[] } }>(`/api/v1/warehouse/grns/grns/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/grns/grns`, { method: 'POST', body: JSON.stringify(data) }),
  transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/warehouse/grns/grns/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
}

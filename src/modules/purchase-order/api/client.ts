/** Purchase Order Frontend API Client */
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

export interface PurchaseOrder {
  id: string
  po_number: string
  po_type: string
  po_date: string
  revision_no: number
  supplier_id: string
  supplier_code: string
  supplier_name: string
  supplier_gstin?: string
  company_name: string
  plant_name: string
  warehouse_name?: string
  currency: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  freight_amount?: number
  insurance_amount?: number
  grand_total: number
  payment_terms: string
  expected_delivery_date?: string
  supplier_ack_status?: string
  status: string
  version: number
  lines?: Array<Record<string, unknown>>
  taxes?: Array<Record<string, unknown>>
  charges?: Array<Record<string, unknown>>
  approvals?: Array<Record<string, unknown>>
  revisions?: Array<Record<string, unknown>>
  history?: Array<Record<string, unknown>>
}

export const purchaseOrderApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; status?: string; poType?: string; supplierId?: string; plantId?: string; sortBy?: string; sortOrder?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    if (params?.search) qs.set('search', params.search)
    if (params?.status) qs.set('status', params.status)
    if (params?.poType) qs.set('poType', params.poType)
    if (params?.supplierId) qs.set('supplierId', params.supplierId)
    if (params?.plantId) qs.set('plantId', params.plantId)
    if (params?.sortBy) qs.set('sortBy', params.sortBy)
    if (params?.sortOrder) qs.set('sortOrder', params.sortOrder)
    return apiFetch<{ success: true; data: PurchaseOrder[]; meta: { total: number; page: number; pageSize: number } }>(`/api/v1/procurement/purchase-orders/pos?${qs}`)
  },
  get: (id: string) => apiFetch<{ success: true; data: PurchaseOrder }>(`/api/v1/procurement/purchase-orders/pos/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/purchase-orders/pos`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>, version: number) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  transition: (id: string, targetStatus: string, version: number, extra?: Record<string, unknown>) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version, ...extra }) }),
  issue: (id: string, version: number) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/issue`, { method: 'POST', headers: { 'If-Match': String(version) } }),
  cancel: (id: string, version: number, reason?: string) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/cancel`, { method: 'POST', headers: { 'If-Match': String(version) }, body: JSON.stringify({ cancelReason: reason }) }),
  close: (id: string, version: number) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/close`, { method: 'POST', headers: { 'If-Match': String(version) } }),
  supplierAccept: (id: string, version: number, notes?: string) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/supplier-accept`, { method: 'POST', headers: { 'If-Match': String(version) }, body: JSON.stringify({ notes }) }),
  supplierReject: (id: string, version: number, notes?: string) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/supplier-reject`, { method: 'POST', headers: { 'If-Match': String(version) }, body: JSON.stringify({ notes }) }),
  supplierCounter: (id: string, version: number, counterTotal: number, notes?: string) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/supplier-counter`, { method: 'POST', headers: { 'If-Match': String(version) }, body: JSON.stringify({ counterTotal, notes }) }),
  revision: (id: string, version: number, reason: string) => apiFetch(`/api/v1/procurement/purchase-orders/pos/${id}/revision`, { method: 'POST', headers: { 'If-Match': String(version) }, body: JSON.stringify({ revisionReason: reason }) }),
  fromQuotation: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/purchase-orders/pos/from-quotation`, { method: 'POST', body: JSON.stringify(data) }),
  pdf: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/purchase-orders/pos/${id}/pdf`),
  exportPdf: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/purchase-orders/pos/${id}/export-pdf`),
  search: (criteria: Record<string, unknown>) => apiFetch(`/api/v1/procurement/purchase-orders/pos/search`, { method: 'POST', body: JSON.stringify(criteria) }),
}

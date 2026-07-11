/** Inventory Frontend API Client */
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

export interface Inventory {
  id: string
  product_sku: string
  product_name: string
  warehouse_name: string
  bin_code: string | null
  batch_number: string | null
  lot_number: string | null
  quantity: number
  available_qty: number
  reserved_qty: number
  blocked_qty: number
  unit_cost: number
  moving_avg_cost: number
  expiry_date: string | null
  is_expired: boolean
  is_blocked: boolean
}

export const inventoryApi = {
  list: (params?: { page?: number; pageSize?: number; productId?: string; warehouseId?: string; expired?: boolean }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize))
    if (params?.productId) qs.set('productId', params.productId)
    if (params?.warehouseId) qs.set('warehouseId', params.warehouseId)
    if (params?.expired) qs.set('expired', 'true')
    return apiFetch<{ success: true; data: Inventory[]; meta: { total: number; page: number; pageSize: number } }>(`/api/v1/inventory/inventory?${qs}`)
  },
  get: (id: string) => apiFetch<{ success: true; data: Inventory }>(`/api/v1/inventory/inventory/${id}`),
  stockIn: (data: Record<string, unknown>) => apiFetch(`/api/v1/inventory/inventory/stock-in`, { method: 'POST', body: JSON.stringify(data) }),
  stockOut: (data: Record<string, unknown>) => apiFetch(`/api/v1/inventory/inventory/stock-out`, { method: 'POST', body: JSON.stringify(data) }),
  listLedger: (params?: { page?: number; productId?: string; warehouseId?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.productId) qs.set('productId', params.productId)
    if (params?.warehouseId) qs.set('warehouseId', params.warehouseId)
    return apiFetch<{ success: true; data: unknown[]; meta: { total: number } }>(`/api/v1/inventory/ledger?${qs}`)
  },
  listTransactions: (params?: { page?: number; movementType?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.movementType) qs.set('movementType', params.movementType)
    return apiFetch<{ success: true; data: unknown[]; meta: { total: number } }>(`/api/v1/inventory/transactions?${qs}`)
  },
  reserve: (data: Record<string, unknown>) => apiFetch(`/api/v1/inventory/reservations`, { method: 'POST', body: JSON.stringify(data) }),
  block: (data: Record<string, unknown>) => apiFetch(`/api/v1/inventory/blocks`, { method: 'POST', body: JSON.stringify(data) }),
  getExpiring: (days?: number) => apiFetch<{ success: true; data: Inventory[] }>(`/api/v1/inventory/expiry?days=${days ?? 30}`),
}

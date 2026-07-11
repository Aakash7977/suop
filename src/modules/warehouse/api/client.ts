/** Warehouse Frontend API Client */
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

export interface WarehouseBin {
  id: string
  bin_code: string
  bin_name: string
  bin_type: string
  level: number
  capacity: number
  used_capacity: number
  is_active: boolean
  is_blocked: boolean
}

export const warehouseApi = {
  listZones: (warehouseId: string) => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/zones?warehouseId=${warehouseId}`),
  listAisles: (warehouseId: string) => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/aisles?warehouseId=${warehouseId}`),
  listRacks: (warehouseId: string) => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/racks?warehouseId=${warehouseId}`),
  listBins: (warehouseId: string, params?: { zoneId?: string; aisleId?: string; rackId?: string }) => {
    const qs = new URLSearchParams({ warehouseId })
    if (params?.zoneId) qs.set('zoneId', params.zoneId)
    if (params?.aisleId) qs.set('aisleId', params.aisleId)
    if (params?.rackId) qs.set('rackId', params.rackId)
    return apiFetch<{ success: true; data: WarehouseBin[] }>(`/api/v1/warehouse/bins?${qs}`)
  },
  createBin: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/bins`, { method: 'POST', body: JSON.stringify(data) }),
  listPutawayTasks: (params?: { page?: number; status?: string; warehouseId?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.status) qs.set('status', params.status)
    if (params?.warehouseId) qs.set('warehouseId', params.warehouseId)
    return apiFetch<{ success: true; data: unknown[]; meta: { total: number } }>(`/api/v1/warehouse/putaway-tasks?${qs}`)
  },
  createPutawayTask: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/putaway-tasks`, { method: 'POST', body: JSON.stringify(data) }),
  completePutaway: (id: string, version: number) => apiFetch(`/api/v1/warehouse/putaway-tasks/${id}/complete`, { method: 'POST', headers: { 'If-Match': String(version) } }),
  createBarcode: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/barcodes`, { method: 'POST', body: JSON.stringify(data) }),
  printBarcode: (id: string) => apiFetch(`/api/v1/warehouse/barcodes/${id}/print`, { method: 'POST' }),
  scan: (barcode: string, scanType: string) => apiFetch(`/api/v1/warehouse/scan`, { method: 'POST', body: JSON.stringify({ barcode, scanType }) }),
}

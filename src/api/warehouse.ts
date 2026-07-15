/**
 * Warehouse Domain — Zones, Aisles, Racks, Bins, Putaway, Barcodes, Scan, Goods Receipt
 * warehouseApi: ONE client for all warehouse operations.
 * goodsReceiptApi: Separate aggregate (own lifecycle) in same domain file.
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'
import type { WarehouseBin, GoodsReceipt } from '@/types'

export const warehouseApi = {
  listZones: (warehouseId: string, params?: { page?: number; search?: string; zoneType?: string }) =>
    apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/zones?${buildQueryString({ warehouseId, ...params })}`),
  createZone: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/zones`, { method: 'POST', body: JSON.stringify(data) }),
  updateZone: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/zones/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteZone: (id: string) => apiFetch(`/api/v1/warehouse/zones/${id}`, { method: 'DELETE' }),
  listAisles: (warehouseId: string, params?: { page?: number; search?: string; zoneId?: string }) =>
    apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/aisles?${buildQueryString({ warehouseId, ...params })}`),
  createAisle: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/aisles`, { method: 'POST', body: JSON.stringify(data) }),
  updateAisle: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/aisles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAisle: (id: string) => apiFetch(`/api/v1/warehouse/aisles/${id}`, { method: 'DELETE' }),
  listRacks: (warehouseId: string, params?: { page?: number; search?: string; zoneId?: string; aisleId?: string }) =>
    apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/racks?${buildQueryString({ warehouseId, ...params })}`),
  createRack: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/racks`, { method: 'POST', body: JSON.stringify(data) }),
  updateRack: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/racks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRack: (id: string) => apiFetch(`/api/v1/warehouse/racks/${id}`, { method: 'DELETE' }),
  listBins: (warehouseId: string, params?: { zoneId?: string; aisleId?: string; rackId?: string; search?: string; isBlocked?: boolean; emptyOnly?: boolean; page?: number }) =>
    apiFetch<{ success: true; data: WarehouseBin[] }>(`/api/v1/warehouse/bins?${buildQueryString({ warehouseId, ...params })}`),
  createBin: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/bins`, { method: 'POST', body: JSON.stringify(data) }),
  updateBin: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/bins/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBin: (id: string) => apiFetch(`/api/v1/warehouse/bins/${id}`, { method: 'DELETE' }),
  blockBin: (id: string, blockReason: string) => apiFetch(`/api/v1/warehouse/bins/${id}/block`, { method: 'POST', body: JSON.stringify({ blockReason }) }),
  unblockBin: (id: string) => apiFetch(`/api/v1/warehouse/bins/${id}/unblock`, { method: 'POST' }),
  findEmptyBins: (warehouseId: string) => apiFetch<{ success: true; data: WarehouseBin[] }>(`/api/v1/warehouse/bins/empty?warehouseId=${warehouseId}`),
  exportBins: (warehouseId: string, params?: { zoneId?: string; isBlocked?: boolean; emptyOnly?: boolean }) =>
    apiFetch<{ success: true; data: WarehouseBin[] }>(`/api/v1/warehouse/bins/export?${buildQueryString({ warehouseId, ...params })}`),
  bulkBlockBins: (binIds: string[], blockReason: string) => apiFetch(`/api/v1/warehouse/bins/bulk-block`, { method: 'POST', body: JSON.stringify({ binIds, blockReason }) }),
  bulkUnblockBins: (binIds: string[]) => apiFetch(`/api/v1/warehouse/bins/bulk-unblock`, { method: 'POST', body: JSON.stringify({ binIds }) }),
  getDashboard: (warehouseId: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/warehouse/dashboard?warehouseId=${warehouseId}`),
  getOccupancy: (warehouseId: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/warehouse/occupancy?warehouseId=${warehouseId}`),
  listPutawayTasks: (params?: { page?: number; status?: string; warehouseId?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/warehouse/putaway-tasks?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createPutawayTask: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/putaway-tasks`, { method: 'POST', body: JSON.stringify(data) }),
  completePutaway: (id: string, version: number) => apiFetch(`/api/v1/warehouse/putaway-tasks/${id}/complete`, { method: 'POST', headers: { 'If-Match': String(version) } }),
  createBarcode: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/barcodes`, { method: 'POST', body: JSON.stringify(data) }),
  printBarcode: (id: string) => apiFetch(`/api/v1/warehouse/barcodes/${id}/print`, { method: 'POST' }),
  scan: (barcode: string, scanType: string) => apiFetch(`/api/v1/warehouse/scan`, { method: 'POST', body: JSON.stringify({ barcode, scanType }) }),
  listScanLogs: (params?: { page?: number; warehouseId?: string }) =>
    apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/scan-logs?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  listBarcodes: (params?: { labelType?: string; productId?: string }) =>
    apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/barcodes?${buildQueryString(params as Record<string, string | number | undefined>)}`),
}

export const goodsReceiptApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; status?: string; supplierId?: string; poId?: string }) =>
    apiFetch<PaginatedResponse<GoodsReceipt>>(`/api/v1/warehouse/grns/grns?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: GoodsReceipt & { lines: unknown[]; attachments: unknown[]; damages: unknown[] } }>(`/api/v1/warehouse/grns/grns/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/grns/grns`, { method: 'POST', body: JSON.stringify(data) }),
  transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/warehouse/grns/grns/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
}

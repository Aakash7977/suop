/**
 * Warehouse Domain — Zones, Aisles, Racks, Bins, Putaway, Barcodes, Scan, Goods Receipt
 * warehouseApi: ONE client for all warehouse operations.
 * goodsReceiptApi: Separate aggregate (own lifecycle) in same domain file.
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'
import type { WarehouseBin, GoodsReceipt } from '@/types'

export const warehouseApi = {
  listZones: (warehouseId: string) => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/zones?warehouseId=${warehouseId}`),
  listAisles: (warehouseId: string) => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/aisles?warehouseId=${warehouseId}`),
  listRacks: (warehouseId: string) => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/warehouse/racks?warehouseId=${warehouseId}`),
  listBins: (warehouseId: string, params?: { zoneId?: string; aisleId?: string; rackId?: string }) =>
    apiFetch<{ success: true; data: WarehouseBin[] }>(`/api/v1/warehouse/bins?${buildQueryString({ warehouseId, ...params })}`),
  createBin: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/bins`, { method: 'POST', body: JSON.stringify(data) }),
  createZone: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/zones`, { method: 'POST', body: JSON.stringify(data) }),
  createAisle: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/aisles`, { method: 'POST', body: JSON.stringify(data) }),
  createRack: (data: Record<string, unknown>) => apiFetch(`/api/v1/warehouse/racks`, { method: 'POST', body: JSON.stringify(data) }),
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

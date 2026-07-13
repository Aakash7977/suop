/**
 * Inventory Domain — Stock, Ledger, Transactions, Reservations, Blocks, Batches, Expiry
 * ONE client with ALL inventory operations.
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'
import type { Inventory } from '@/types'

export const inventoryApi = {
  list: (params?: { page?: number; pageSize?: number; productId?: string; warehouseId?: string; expired?: boolean }) =>
    apiFetch<PaginatedResponse<Inventory>>(`/api/v1/inventory/inventory?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: Inventory }>(`/api/v1/inventory/inventory/${id}`),
  stockIn: (data: Record<string, unknown>) => apiFetch(`/api/v1/inventory/inventory/stock-in`, { method: 'POST', body: JSON.stringify(data) }),
  stockOut: (data: Record<string, unknown>) => apiFetch(`/api/v1/inventory/inventory/stock-out`, { method: 'POST', body: JSON.stringify(data) }),
  listLedger: (params?: { page?: number; productId?: string; warehouseId?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/inventory/ledger?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  listTransactions: (params?: { page?: number; movementType?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/inventory/transactions?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  reserve: (data: Record<string, unknown>) => apiFetch(`/api/v1/inventory/reservations`, { method: 'POST', body: JSON.stringify(data) }),
  block: (data: Record<string, unknown>) => apiFetch(`/api/v1/inventory/blocks`, { method: 'POST', body: JSON.stringify(data) }),
  getExpiring: (days?: number) => apiFetch<{ success: true; data: Inventory[] }>(`/api/v1/inventory/expiry?days=${days ?? 30}`),
  listBatches: (params?: { page?: number; productId?: string; search?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/inventory/batches?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  markExpired: () => apiFetch(`/api/v1/inventory/expiry/mark-expired`, { method: 'POST' }),
  listReservations: (params?: { page?: number; status?: string; productId?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/inventory/reservations?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  listBlocks: (params?: { page?: number; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/inventory/blocks?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  releaseReservation: (id: string, reason?: string) => apiFetch(`/api/v1/inventory/reservations/${id}/release`, { method: 'POST', body: JSON.stringify({ reason }) }),
}

/**
 * Section 04 — Operations API Clients
 * Created for modules that have existing backend but no frontend client.
 * All use the shared apiFetch pattern from @/lib/api.
 */

import { apiFetch, type PaginatedResponse } from '@/lib/api'

// ─── Costing API (backend: /api/v1/finance/costing) ──────────────────────────

export interface ProductCost {
  id: string
  cost_id: string
  status: string
  version: number
  created_at: string
}

export const costingApi = {
  list: (params?: { page?: number; search?: string; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.search) qs.set('search', params.search)
    if (params?.status) qs.set('status', params.status)
    return apiFetch<PaginatedResponse<ProductCost>>(`/api/v1/finance/costing?${qs}`)
  },
  get: (id: string) => apiFetch<{ success: true; data: ProductCost }>(`/api/v1/finance/costing/${id}`),
  create: (data: Record<string, unknown>) =>
    apiFetch(`/api/v1/finance/costing`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/api/v1/finance/costing/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch(`/api/v1/finance/costing/${id}`, { method: 'DELETE' }),
  transition: (id: string, targetState: string, reason?: string) =>
    apiFetch(`/api/v1/finance/costing/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
}

// ─── Fulfillment API (backend: /api/v1/sales/fulfillment) ────────────────────

export interface Allocation { id: string; allocation_number: string; status: string; version: number }
export interface WavePlan { id: string; wave_number: string; status: string; version: number }

export const fulfillmentApi = {
  listAllocations: (params?: { page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return apiFetch<PaginatedResponse<Allocation>>(`/api/v1/sales/fulfillment/allocations?${qs}`)
  },
  createAllocation: (data: Record<string, unknown>) =>
    apiFetch(`/api/v1/sales/fulfillment/allocations`, { method: 'POST', body: JSON.stringify(data) }),
  listWaves: (params?: { page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return apiFetch<PaginatedResponse<WavePlan>>(`/api/v1/sales/fulfillment/waves?${qs}`)
  },
  createWave: (data: Record<string, unknown>) =>
    apiFetch(`/api/v1/sales/fulfillment/waves`, { method: 'POST', body: JSON.stringify(data) }),
}

// ─── Pick-Pack-Dispatch API (backend: /api/v1/sales/pick-pack-dispatch) ──────

export interface PickList { id: string; pick_list_number: string; status: string; version: number }
export interface PackingList { id: string; packing_list_number: string; status: string; version: number }
export interface Shipment { id: string; shipment_number: string; status: string; version: number }

export const pickPackDispatchApi = {
  listPickLists: (params?: { page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return apiFetch<PaginatedResponse<PickList>>(`/api/v1/sales/pick-pack-dispatch/pick-lists?${qs}`)
  },
  createPickList: (data: Record<string, unknown>) =>
    apiFetch(`/api/v1/sales/pick-pack-dispatch/pick-lists`, { method: 'POST', body: JSON.stringify(data) }),
  listPackingLists: (params?: { page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return apiFetch<PaginatedResponse<PackingList>>(`/api/v1/sales/pick-pack-dispatch/packing-lists?${qs}`)
  },
  createPackingList: (data: Record<string, unknown>) =>
    apiFetch(`/api/v1/sales/pick-pack-dispatch/packing-lists`, { method: 'POST', body: JSON.stringify(data) }),
  listShipments: (params?: { page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return apiFetch<PaginatedResponse<Shipment>>(`/api/v1/sales/pick-pack-dispatch/shipments?${qs}`)
  },
  createShipment: (data: Record<string, unknown>) =>
    apiFetch(`/api/v1/sales/pick-pack-dispatch/shipments`, { method: 'POST', body: JSON.stringify(data) }),
}

// ─── Delivery Management API (backend: /api/v1/sales/delivery) ───────────────

export interface DeliveryOrder { id: string; delivery_number: string; status: string; version: number }

export const deliveryApi = {
  listDeliveryOrders: (params?: { page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return apiFetch<PaginatedResponse<DeliveryOrder>>(`/api/v1/sales/delivery/delivery-orders?${qs}`)
  },
  createDeliveryOrder: (data: Record<string, unknown>) =>
    apiFetch(`/api/v1/sales/delivery/delivery-orders`, { method: 'POST', body: JSON.stringify(data) }),
  listPods: (params?: { page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return apiFetch<PaginatedResponse<unknown>>(`/api/v1/sales/delivery/pods?${qs}`)
  },
  createPod: (data: Record<string, unknown>) =>
    apiFetch(`/api/v1/sales/delivery/pods`, { method: 'POST', body: JSON.stringify(data) }),
  listExceptions: (params?: { page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return apiFetch<PaginatedResponse<unknown>>(`/api/v1/sales/delivery/exceptions?${qs}`)
  },
  createException: (data: Record<string, unknown>) =>
    apiFetch(`/api/v1/sales/delivery/exceptions`, { method: 'POST', body: JSON.stringify(data) }),
}

// ─── Attendance/Workforce API (backend: /api/v1/hrms/attendance) ─────────────

export interface AttendanceRecord { id: string; attendance_id: string; status: string; version: number }

export const workforceApi = {
  listAttendance: (params?: { page?: number; search?: string; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.search) qs.set('search', params.search)
    if (params?.status) qs.set('status', params.status)
    return apiFetch<PaginatedResponse<AttendanceRecord>>(`/api/v1/hrms/attendance?${qs}`)
  },
  getAttendance: (id: string) => apiFetch<{ success: true; data: AttendanceRecord }>(`/api/v1/hrms/attendance/${id}`),
  createAttendance: (data: Record<string, unknown>) =>
    apiFetch(`/api/v1/hrms/attendance`, { method: 'POST', body: JSON.stringify(data) }),
  updateAttendance: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/api/v1/hrms/attendance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAttendance: (id: string) =>
    apiFetch(`/api/v1/hrms/attendance/${id}`, { method: 'DELETE' }),
  transitionAttendance: (id: string, targetState: string, reason?: string) =>
    apiFetch(`/api/v1/hrms/attendance/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
}

// ─── Sales Order API (backend: /api/v1/sales/orders) ─────────────────────────

export interface SalesOrder { id: string; order_number: string; status: string; version: number }

export const salesOrderApi = {
  list: (params?: { page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return apiFetch<PaginatedResponse<SalesOrder>>(`/api/v1/sales/orders/orders?${qs}`)
  },
  get: (id: string) => apiFetch<{ success: true; data: SalesOrder }>(`/api/v1/sales/orders/orders/${id}`),
  create: (data: Record<string, unknown>) =>
    apiFetch(`/api/v1/sales/orders/orders`, { method: 'POST', body: JSON.stringify(data) }),
  transition: (id: string, targetStatus: string, version: number) =>
    apiFetch(`/api/v1/sales/orders/orders/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
  hold: (id: string) =>
    apiFetch(`/api/v1/sales/orders/orders/${id}/hold`, { method: 'POST' }),
  releaseHold: (id: string) =>
    apiFetch(`/api/v1/sales/orders/orders/${id}/release-hold`, { method: 'POST' }),
}

// ─── Batch Manufacturing API (backend: /api/v1/manufacturing/batches) ───────

export const batchMfgApi = {
  list: (params?: { page?: number }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    return apiFetch<PaginatedResponse<unknown>>(`/api/v1/manufacturing/batches/batches?${qs}`)
  },
  get: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/batches/batches/${id}`),
  create: (data: Record<string, unknown>) =>
    apiFetch(`/api/v1/manufacturing/batches/batches`, { method: 'POST', body: JSON.stringify(data) }),
  transition: (id: string, targetStatus: string) =>
    apiFetch(`/api/v1/manufacturing/batches/batches/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus }) }),
  split: (id: string, data: Record<string, unknown>) =>
    apiFetch(`/api/v1/manufacturing/batches/batches/${id}/split`, { method: 'POST', body: JSON.stringify(data) }),
  merge: (data: Record<string, unknown>) =>
    apiFetch(`/api/v1/manufacturing/batches/batches/merge`, { method: 'POST', body: JSON.stringify(data) }),
  getGenealogy: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/batches/batches/${id}/genealogy`),
  getForwardTrace: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/batches/batches/${id}/forward-traceability`),
  getBackwardTrace: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/batches/batches/${id}/backward-traceability`),
}

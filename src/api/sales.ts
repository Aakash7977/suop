/**
 * Sales Domain — Orders, Fulfillment, Pick-Pack, Delivery, Returns, Pricing
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'
import type { SalesOrder, Allocation, WavePlan, PickList, PackingList, Shipment, DeliveryOrder, PriceList, Promotion, Coupon, TaxConfig } from '@/types'

export const salesOrderApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; status?: string; customerId?: string }) =>
    apiFetch<PaginatedResponse<SalesOrder>>(`/api/v1/sales/orders/orders?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: SalesOrder }>(`/api/v1/sales/orders/orders/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/orders/orders`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>, version: number) => apiFetch(`/api/v1/sales/orders/orders/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/sales/orders/orders/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/sales/orders/orders/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
  hold: (id: string, holdType: string, holdReason: string) => apiFetch(`/api/v1/sales/orders/orders/${id}/hold`, { method: 'POST', body: JSON.stringify({ holdType, holdReason }) }),
  releaseHold: (id: string, releaseReason: string) => apiFetch(`/api/v1/sales/orders/orders/${id}/release-hold`, { method: 'POST', body: JSON.stringify({ releaseReason }) }),
  export: (params?: { status?: string; customerId?: string }) =>
    apiFetch<{ success: true; data: SalesOrder[] }>(`/api/v1/sales/orders/orders/export?${buildQueryString(params as Record<string, string | number | undefined>)}`),
}

export const fulfillmentApi = {
  listAllocations: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<Allocation>>(`/api/v1/sales/fulfillment/allocations?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createAllocation: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/fulfillment/allocations`, { method: 'POST', body: JSON.stringify(data) }),
  listWaves: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<WavePlan>>(`/api/v1/sales/fulfillment/waves?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createWave: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/fulfillment/waves`, { method: 'POST', body: JSON.stringify(data) }),
}

export const pickPackApi = {
  listPickLists: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<PickList>>(`/api/v1/sales/pick-pack-dispatch/pick-lists?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createPickList: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/pick-pack-dispatch/pick-lists`, { method: 'POST', body: JSON.stringify(data) }),
  listPackingLists: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<PackingList>>(`/api/v1/sales/pick-pack-dispatch/packing-lists?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createPackingList: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/pick-pack-dispatch/packing-lists`, { method: 'POST', body: JSON.stringify(data) }),
  listShipments: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<Shipment>>(`/api/v1/sales/pick-pack-dispatch/shipments?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createShipment: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/pick-pack-dispatch/shipments`, { method: 'POST', body: JSON.stringify(data) }),
}

// Backward compat
export const pickPackDispatchApi = pickPackApi

export const deliveryApi = {
  listDeliveryOrders: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<DeliveryOrder>>(`/api/v1/sales/delivery/delivery-orders?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createDeliveryOrder: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/delivery/delivery-orders`, { method: 'POST', body: JSON.stringify(data) }),
  listPods: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/sales/delivery/pods?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createPod: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/delivery/pods`, { method: 'POST', body: JSON.stringify(data) }),
  listExceptions: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/sales/delivery/exceptions?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createException: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/delivery/exceptions`, { method: 'POST', body: JSON.stringify(data) }),
}

export const returnsApi = {
  listRmas: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/sales/returns/rmas?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getRma: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/sales/returns/rmas/${id}`),
  createRma: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/returns/rmas`, { method: 'POST', body: JSON.stringify(data) }),
  transitionRma: (id: string, targetStatus: string) => apiFetch(`/api/v1/sales/returns/rmas/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus }) }),
  listInspections: (rmaId: string) => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/sales/returns/rmas/${rmaId}/inspections`),
  createInspection: (rmaId: string, data: Record<string, unknown>) => apiFetch(`/api/v1/sales/returns/rmas/${rmaId}/inspections`, { method: 'POST', body: JSON.stringify(data) }),
  listRefunds: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/sales/returns/refunds?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createRefund: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/returns/refunds`, { method: 'POST', body: JSON.stringify(data) }),
}

export const pricingApi = {
  listPriceLists: (params?: { page?: number; search?: string; isActive?: boolean }) =>
    apiFetch<PaginatedResponse<PriceList>>(`/api/v1/sales/pricing/price-lists?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createPriceList: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/pricing/price-lists`, { method: 'POST', body: JSON.stringify(data) }),
  listPromotions: (params?: { page?: number; search?: string }) =>
    apiFetch<PaginatedResponse<Promotion>>(`/api/v1/sales/pricing/promotions?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createPromotion: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/pricing/promotions`, { method: 'POST', body: JSON.stringify(data) }),
  listCoupons: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<Coupon>>(`/api/v1/sales/pricing/coupons?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createCoupon: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/pricing/coupons`, { method: 'POST', body: JSON.stringify(data) }),
  listTaxConfigs: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<TaxConfig>>(`/api/v1/sales/pricing/tax-configs?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createTaxConfig: (data: Record<string, unknown>) => apiFetch(`/api/v1/sales/pricing/tax-configs`, { method: 'POST', body: JSON.stringify(data) }),
  calculate: (data: Record<string, unknown>) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/sales/pricing/calculate`, { method: 'POST', body: JSON.stringify(data) }),
}

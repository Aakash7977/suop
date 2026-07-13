/**
 * Procurement Domain — Requisitions, Purchase Orders, Quotations, RFQs
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'

export const procurementApi = {
  list: (params?: { page?: number; search?: string; status?: string; priority?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/procurement/requisitions/requisitions?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/requisitions/requisitions/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/requisitions/requisitions`, { method: 'POST', body: JSON.stringify(data) }),
  transition: (id: string, targetStatus: string, version: number, comments?: string) => apiFetch(`/api/v1/procurement/requisitions/requisitions/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version, comments }) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/procurement/requisitions/requisitions/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
}

export const purchaseOrderApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; status?: string; poType?: string; supplierId?: string; plantId?: string; sortBy?: string; sortOrder?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/procurement/purchase-orders/pos?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/purchase-orders/pos/${id}`),
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

export const quotationApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; status?: string; rfqId?: string; supplierId?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/procurement/quotations/quotations?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/quotations/quotations/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/quotations/quotations`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>, version: number) => apiFetch(`/api/v1/procurement/quotations/quotations/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/procurement/quotations/quotations/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  transition: (id: string, targetStatus: string, version: number, extra?: Record<string, unknown>) => apiFetch(`/api/v1/procurement/quotations/quotations/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version, ...extra }) }),
}

export const rfqApi = {
  list: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/procurement/rfqs/rfqs?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/procurement/rfqs/rfqs/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/procurement/rfqs/rfqs`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>, version: number) => apiFetch(`/api/v1/procurement/rfqs/rfqs/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  delete: (id: string, version: number) => apiFetch(`/api/v1/procurement/rfqs/rfqs/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  transition: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/procurement/rfqs/rfqs/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
}

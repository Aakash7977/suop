/**
 * Finance Domain — Costing, GST, Financial Foundation, General Ledger
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'
import type { ProductCost, GstConfig, Currency, ExchangeRate } from '@/types'

export const costingApi = {
  list: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<ProductCost>>(`/api/v1/finance/costing?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: ProductCost }>(`/api/v1/finance/costing/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/costing`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/finance/costing/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/v1/finance/costing/${id}`, { method: 'DELETE' }),
  transition: (id: string, targetState: string, reason?: string) => apiFetch(`/api/v1/finance/costing/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
}

export const gstApi = {
  list: (params?: { page?: number; search?: string }) =>
    apiFetch<PaginatedResponse<GstConfig>>(`/api/v1/finance/gst?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: GstConfig }>(`/api/v1/finance/gst/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/gst`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/finance/gst/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/v1/finance/gst/${id}`, { method: 'DELETE' }),
  transition: (id: string, targetState: string, reason?: string) => apiFetch(`/api/v1/finance/gst/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
}

export const financeFoundationApi = {
  listAccounts: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/finance/foundation/accounts?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createAccount: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/foundation/accounts`, { method: 'POST', body: JSON.stringify(data) }),
  listFiscalYears: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/finance/foundation/fiscal-years?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createFiscalYear: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/foundation/fiscal-years`, { method: 'POST', body: JSON.stringify(data) }),
  listCurrencies: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<Currency>>(`/api/v1/finance/foundation/currencies?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createCurrency: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/foundation/currencies`, { method: 'POST', body: JSON.stringify(data) }),
  listExchangeRates: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<ExchangeRate>>(`/api/v1/finance/foundation/exchange-rates?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createExchangeRate: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/foundation/exchange-rates`, { method: 'POST', body: JSON.stringify(data) }),
  listCostCenters: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/finance/foundation/cost-centers?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createCostCenter: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/foundation/cost-centers`, { method: 'POST', body: JSON.stringify(data) }),
  listProfitCenters: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/finance/foundation/profit-centers?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createProfitCenter: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/foundation/profit-centers`, { method: 'POST', body: JSON.stringify(data) }),
  closeFiscalPeriod: (id: string) => apiFetch(`/api/v1/finance/foundation/fiscal-periods/${id}/close`, { method: 'POST' }),
}

// Backward compat
export const financeApi = financeFoundationApi

export const glApi = {
  list: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/finance/gl?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/finance/gl/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/finance/gl`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/finance/gl/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/v1/finance/gl/${id}`, { method: 'DELETE' }),
  transition: (id: string, targetState: string, reason?: string) => apiFetch(`/api/v1/finance/gl/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
}

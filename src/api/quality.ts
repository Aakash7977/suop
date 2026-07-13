/**
 * Quality Domain — Inspection, NCR, CAPA, COA, Holds
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'

export const qualityApi = {
  listLots: (params?: { page?: number; pageSize?: number; search?: string; status?: string; grnId?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/quality/lots?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getLot: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/quality/lots/${id}`),
  createLot: (data: Record<string, unknown>) => apiFetch(`/api/v1/quality/lots`, { method: 'POST', body: JSON.stringify(data) }),
  startInspection: (id: string, version: number) => apiFetch(`/api/v1/quality/lots/${id}/start`, { method: 'POST', headers: { 'If-Match': String(version) } }),
  recordResult: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/quality/lots/${id}/results`, { method: 'POST', body: JSON.stringify(data) }),
  transitionLot: (id: string, targetStatus: string, version: number) => apiFetch(`/api/v1/quality/lots/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus, version }) }),
  listNcrs: (params?: { page?: number; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/quality/ncrs?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getNcr: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/quality/ncrs/${id}`),
  createNcr: (data: Record<string, unknown>) => apiFetch(`/api/v1/quality/ncrs`, { method: 'POST', body: JSON.stringify(data) }),
  transitionNcr: (id: string, targetStatus: string) => apiFetch(`/api/v1/quality/ncrs/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus }) }),
  listHolds: (params?: { page?: number; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/quality/holds?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createHold: (data: Record<string, unknown>) => apiFetch(`/api/v1/quality/holds`, { method: 'POST', body: JSON.stringify(data) }),
  releaseHold: (id: string) => apiFetch(`/api/v1/quality/holds/${id}/release`, { method: 'POST' }),
  listCapas: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/quality/capas?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  createCapa: (data: Record<string, unknown>) => apiFetch(`/api/v1/quality/capas`, { method: 'POST', body: JSON.stringify(data) }),
  listPlans: () => apiFetch<PaginatedResponse<unknown>>(`/api/v1/quality/plans?page=1`),
  getPlan: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/quality/plans/${id}`),
  createPlan: (data: Record<string, unknown>) => apiFetch(`/api/v1/quality/plans`, { method: 'POST', body: JSON.stringify(data) }),
  listSamplingPlans: () => apiFetch<PaginatedResponse<unknown>>(`/api/v1/quality/sampling-plans?page=1`),
  createSamplingPlan: (data: Record<string, unknown>) => apiFetch(`/api/v1/quality/sampling-plans`, { method: 'POST', body: JSON.stringify(data) }),
}

// Backward compat
export const qualityInspectionApi = qualityApi

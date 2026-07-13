/**
 * Manufacturing Domain — Batches, Recipes, MES
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'

export const batchApi = {
  list: (params?: { page?: number }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/manufacturing/batches/batches?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/batches/batches/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/manufacturing/batches/batches`, { method: 'POST', body: JSON.stringify(data) }),
  transition: (id: string, targetStatus: string) => apiFetch(`/api/v1/manufacturing/batches/batches/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus }) }),
  split: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/manufacturing/batches/batches/${id}/split`, { method: 'POST', body: JSON.stringify(data) }),
  merge: (data: Record<string, unknown>) => apiFetch(`/api/v1/manufacturing/batches/batches/merge`, { method: 'POST', body: JSON.stringify(data) }),
  getGenealogy: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/batches/batches/${id}/genealogy`),
  getForwardTrace: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/batches/batches/${id}/forward-traceability`),
  getBackwardTrace: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/batches/batches/${id}/backward-traceability`),
}

// Backward compat
export const batchMfgApi = batchApi

export const recipeApi = {
  list: (params?: { page?: number; productId?: string; status?: string; search?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/manufacturing/recipes/recipes?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/recipes/recipes/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/manufacturing/recipes/recipes`, { method: 'POST', body: JSON.stringify(data) }),
  transition: (id: string, targetStatus: string) => apiFetch(`/api/v1/manufacturing/recipes/recipes/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus }) }),
  listBoms: (params?: { page?: number; productId?: string; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/manufacturing/recipes/boms?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getBom: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/recipes/boms/${id}`),
  createBom: (data: Record<string, unknown>) => apiFetch(`/api/v1/manufacturing/recipes/boms`, { method: 'POST', body: JSON.stringify(data) }),
  transitionBom: (id: string, targetStatus: string) => apiFetch(`/api/v1/manufacturing/recipes/boms/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetStatus }) }),
  explodeBom: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/recipes/boms/${id}/explode`),
  listRoutings: (params?: { page?: number; productId?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/manufacturing/recipes/routings?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getRouting: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/manufacturing/recipes/routings/${id}`),
  createRouting: (data: Record<string, unknown>) => apiFetch(`/api/v1/manufacturing/recipes/routings`, { method: 'POST', body: JSON.stringify(data) }),
}

export const mesApi = {
  listMachines: () => apiFetch<PaginatedResponse<unknown>>(`/api/v1/mes/machines?page=1`),
  listWorkCenters: () => apiFetch<PaginatedResponse<unknown>>(`/api/v1/mes/work-centers?page=1`),
  listShifts: () => apiFetch<PaginatedResponse<unknown>>(`/api/v1/mes/shifts?page=1`),
  listDowntime: () => apiFetch<PaginatedResponse<unknown>>(`/api/v1/mes/downtime?page=1`),
  listEvents: () => apiFetch<PaginatedResponse<unknown>>(`/api/v1/mes/events?page=1`),
  getDashboard: () => apiFetch<{ success: true; data: unknown }>(`/api/v1/mes/dashboard`),
  getOee: (machineId: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/mes/analytics/oee/${machineId}`),
  createMachine: (data: Record<string, unknown>) => apiFetch(`/api/v1/mes/machines`, { method: 'POST', body: JSON.stringify(data) }),
  updateMachineStatus: (id: string, status: string) => apiFetch(`/api/v1/mes/machines/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  recordDowntime: (data: Record<string, unknown>) => apiFetch(`/api/v1/mes/downtime`, { method: 'POST', body: JSON.stringify(data) }),
}

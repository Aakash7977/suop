/**
 * BI Domain — Alerts, KPIs
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'

export const alertsApi = {
  list: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/bi/alerts?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/bi/alerts/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/bi/alerts`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/bi/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/v1/bi/alerts/${id}`, { method: 'DELETE' }),
  transition: (id: string, targetState: string, reason?: string) => apiFetch(`/api/v1/bi/alerts/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
  count: (params?: { status?: string }) => apiFetch<{ success: true; data: { count: number } }>(`/api/v1/bi/alerts/count?${buildQueryString(params as Record<string, string | number | undefined>)}`),
}

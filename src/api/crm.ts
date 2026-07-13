/**
 * CRM Domain — Activities, Leads, Opportunities, Complaints
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'

export const crmApi = {
  listActivities: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<unknown>>(`/api/v1/crm/foundation?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getActivity: (id: string) => apiFetch<{ success: true; data: unknown }>(`/api/v1/crm/foundation/${id}`),
  createActivity: (data: Record<string, unknown>) => apiFetch(`/api/v1/crm/foundation`, { method: 'POST', body: JSON.stringify(data) }),
  updateActivity: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/crm/foundation/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteActivity: (id: string) => apiFetch(`/api/v1/crm/foundation/${id}`, { method: 'DELETE' }),
  transitionActivity: (id: string, targetState: string, reason?: string) => apiFetch(`/api/v1/crm/foundation/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
}

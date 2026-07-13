/**
 * HR Domain — Attendance, Performance
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'
import type { AttendanceRecord, PerformanceCycle } from '@/types'

export const attendanceApi = {
  list: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<AttendanceRecord>>(`/api/v1/hrms/attendance?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: AttendanceRecord }>(`/api/v1/hrms/attendance/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/hrms/attendance`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/hrms/attendance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/v1/hrms/attendance/${id}`, { method: 'DELETE' }),
  transition: (id: string, targetState: string, reason?: string) => apiFetch(`/api/v1/hrms/attendance/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
}

// Backward compat
export const workforceApi = attendanceApi

export const performanceApi = {
  list: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<PerformanceCycle>>(`/api/v1/hrms/performance?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  get: (id: string) => apiFetch<{ success: true; data: PerformanceCycle }>(`/api/v1/hrms/performance/${id}`),
  create: (data: Record<string, unknown>) => apiFetch(`/api/v1/hrms/performance`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/hrms/performance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/api/v1/hrms/performance/${id}`, { method: 'DELETE' }),
  transition: (id: string, targetState: string, reason?: string) => apiFetch(`/api/v1/hrms/performance/${id}/transition`, { method: 'POST', body: JSON.stringify({ targetState, reason }) }),
}

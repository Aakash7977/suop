/**
 * Administration Domain — Authentication + User Management
 */
import { apiFetch, buildQueryString, type PaginatedResponse } from '@/api/core'
import type { LoginResponse, CurrentUser, UserListItem, RoleItem, PermissionItem } from '@/types'

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ success: true; data: LoginResponse }>(`/api/v1/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: (refreshToken: string) =>
    apiFetch(`/api/v1/auth/logout`, { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  refresh: (refreshToken: string) =>
    apiFetch<{ success: true; data: { accessToken: string } }>(`/api/v1/auth/refresh`, { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  getCurrentUser: () => apiFetch<{ success: true; data: CurrentUser }>(`/api/v1/auth/me`),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch(`/api/v1/auth/change-password`, { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
  forgotPassword: (email: string) =>
    apiFetch(`/api/v1/auth/forgot-password`, { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, newPassword: string) =>
    apiFetch(`/api/v1/auth/reset-password`, { method: 'POST', body: JSON.stringify({ token, newPassword }) }),
  listSessions: () => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/auth/sessions`),
  revokeSession: (tokenHash: string) =>
    apiFetch(`/api/v1/auth/sessions/${tokenHash}/revoke`, { method: 'POST' }),
  listDevices: () => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/auth/devices`),
  inviteUser: (params: Record<string, unknown>) =>
    apiFetch(`/api/v1/auth/invite`, { method: 'POST', body: JSON.stringify(params) }),
  acceptInvitation: (params: Record<string, unknown>) =>
    apiFetch(`/api/v1/auth/accept-invitation`, { method: 'POST', body: JSON.stringify(params) }),
}

export const userApi = {
  listUsers: (params?: { page?: number; search?: string; status?: string }) =>
    apiFetch<PaginatedResponse<UserListItem>>(`/api/v1/admin/users?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getUser: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/admin/users/${id}`),
  lockUser: (id: string) => apiFetch(`/api/v1/admin/users/${id}/lock`, { method: 'POST' }),
  unlockUser: (id: string) => apiFetch(`/api/v1/admin/users/${id}/unlock`, { method: 'POST' }),
  getUserSessions: (id: string) => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/admin/users/${id}/sessions`),
  revokeAllSessions: (id: string) => apiFetch(`/api/v1/admin/users/${id}/sessions/revoke-all`, { method: 'POST' }),
  getUserLoginHistory: (id: string) => apiFetch<{ success: true; data: unknown[] }>(`/api/v1/admin/users/${id}/login-history`),
  listRoles: (params?: { page?: number; search?: string; category?: string; status?: string }) =>
    apiFetch<PaginatedResponse<RoleItem>>(`/api/v1/admin/roles?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  getRole: (id: string) => apiFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/admin/roles/${id}`),
  createRole: (data: Record<string, unknown>) => apiFetch(`/api/v1/admin/roles`, { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/admin/roles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRole: (id: string) => apiFetch(`/api/v1/admin/roles/${id}`, { method: 'DELETE' }),
  cloneRole: (id: string, data: Record<string, unknown>) => apiFetch(`/api/v1/admin/roles/${id}/clone`, { method: 'POST', body: JSON.stringify(data) }),
  assignPermission: (roleId: string, permissionId: string) => apiFetch(`/api/v1/admin/roles/${roleId}/permissions`, { method: 'POST', body: JSON.stringify({ permissionId }) }),
  revokePermission: (roleId: string, permissionId: string) => apiFetch(`/api/v1/admin/roles/${roleId}/permissions/${permissionId}`, { method: 'DELETE' }),
  listPermissions: (params?: { module?: string; group?: string; search?: string }) =>
    apiFetch<{ success: true; data: PermissionItem[] }>(`/api/v1/admin/permissions?${buildQueryString(params as Record<string, string | number | undefined>)}`),
  listPermissionModules: () => apiFetch<{ success: true; data: string[] }>(`/api/v1/admin/permissions/modules`),
  listPermissionGroups: () => apiFetch<{ success: true; data: string[] }>(`/api/v1/admin/permissions/groups`),
}

// Backward compat
export const authClient = authApi
export const userMgmtApi = userApi

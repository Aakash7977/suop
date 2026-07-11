/**
 * User Management Frontend API Client — real backend calls
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('suop_access_token') : null
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...((options.headers as Record<string, string>) || {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.error?.message || `HTTP ${res.status}`)
  return json as T
}

export interface UserListItem { id: string; username: string; email: string; status: string; first_name: string; last_name: string; designation: string | null; last_login_at: string | null; mfa_enabled: boolean }
export interface RoleItem { id: string; name: string; display_name: string; description: string | null; category: string; is_system: boolean; status: string }
export interface PermissionItem { id: string; module: string; feature: string; action: string; code: string; display_name: string; permission_group: string | null }

export const userMgmtApi = {
  // Users
  listUsers: (params?: { page?: number; search?: string; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.search) qs.set('search', params.search)
    if (params?.status) qs.set('status', params.status)
    return adminFetch<{ success: true; data: UserListItem[]; meta: { total: number; page: number; pageSize: number } }>(`/api/v1/admin/users?${qs}`)
  },
  getUser: (id: string) => adminFetch<{ success: true; data: Record<string, unknown> }>(`/api/v1/admin/users/${id}`),
  lockUser: (id: string) => adminFetch(`/api/v1/admin/users/${id}/lock`, { method: 'POST' }),
  unlockUser: (id: string) => adminFetch(`/api/v1/admin/users/${id}/unlock`, { method: 'POST' }),
  assignRole: (userId: string, roleName: string) => adminFetch(`/api/v1/admin/users/${userId}/roles/${roleName}`, { method: 'POST' }),
  revokeRole: (userId: string, roleName: string) => adminFetch(`/api/v1/admin/users/${userId}/roles/${roleName}`, { method: 'DELETE' }),
  getUserSessions: (id: string) => adminFetch<{ success: true; data: unknown[] }>(`/api/v1/admin/users/${id}/sessions`),
  revokeAllSessions: (id: string) => adminFetch(`/api/v1/admin/users/${id}/sessions/revoke-all`, { method: 'POST' }),
  getUserLoginHistory: (id: string) => adminFetch<{ success: true; data: unknown[] }>(`/api/v1/admin/users/${id}/login-history`),

  // Roles
  listRoles: (params?: { page?: number; search?: string; category?: string; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.search) qs.set('search', params.search)
    if (params?.category) qs.set('category', params.category)
    if (params?.status) qs.set('status', params.status)
    return adminFetch<{ success: true; data: RoleItem[]; meta: { total: number; page: number; pageSize: number } }>(`/api/v1/admin/roles?${qs}`)
  },
  getRole: (id: string) => adminFetch<{ success: true; data: RoleItem & { permissions: PermissionItem[] } }>(`/api/v1/admin/roles/${id}`),
  createRole: (data: { name: string; displayName: string; description?: string; permissionCodes?: string[] }) =>
    adminFetch(`/api/v1/admin/roles`, { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id: string, data: { displayName?: string; description?: string; status?: string }, version: number) =>
    adminFetch(`/api/v1/admin/roles/${id}`, { method: 'PATCH', headers: { 'If-Match': String(version) }, body: JSON.stringify(data) }),
  deleteRole: (id: string, version: number) =>
    adminFetch(`/api/v1/admin/roles/${id}`, { method: 'DELETE', headers: { 'If-Match': String(version) } }),
  cloneRole: (id: string, newName: string, newDisplayName: string) =>
    adminFetch(`/api/v1/admin/roles/${id}/clone`, { method: 'POST', body: JSON.stringify({ newName, newDisplayName }) }),
  assignPermission: (roleId: string, permissionCode: string) =>
    adminFetch(`/api/v1/admin/roles/${roleId}/permissions/${permissionCode}`, { method: 'POST' }),
  revokePermission: (roleId: string, permissionCode: string) =>
    adminFetch(`/api/v1/admin/roles/${roleId}/permissions/${permissionCode}`, { method: 'DELETE' }),

  // Permissions
  listPermissions: (params?: { module?: string; group?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.module) qs.set('module', params.module)
    if (params?.group) qs.set('group', params.group)
    if (params?.search) qs.set('search', params.search)
    return adminFetch<{ success: true; data: PermissionItem[] }>(`/api/v1/admin/permissions?${qs}`)
  },
  listPermissionModules: () => adminFetch<{ success: true; data: string[] }>(`/api/v1/admin/permissions/modules`),
  listPermissionGroups: () => adminFetch<{ success: true; data: string[] }>(`/api/v1/admin/permissions/groups`),

  // Delegations
  listDelegations: (params?: { page?: number; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.status) qs.set('status', params.status)
    return adminFetch<{ success: true; data: unknown[]; meta: { total: number } }>(`/api/v1/admin/delegations?${qs}`)
  },
}

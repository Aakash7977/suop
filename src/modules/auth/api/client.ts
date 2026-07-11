/**
 * SUOP Frontend — Auth API Client
 *
 * Connects to the real backend authentication service.
 * No mock data — all responses from real PostgreSQL via backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  accessExpiresAt: number
  refreshExpiresAt: number
  user: {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
    roles: string[]
    permissions: string[]
    tenantId: string
    defaultCompanyId: string | null
    defaultPlantId: string | null
  }
}

export interface CurrentUser {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  roles: string[]
  permissions: string[]
  tenantId: string
  designation: string | null
  timezone: string
  locale: string
  lastLoginAt: string | null
  emailVerified: boolean
  mfaEnabled: boolean
}

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('suop_access_token') : null
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || `HTTP ${res.status}`)
  }
  return json.data as T
}

export const authClient = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(json.error?.message || 'Login failed')
    return json.data as LoginResponse
  },

  async logout(refreshToken: string): Promise<void> {
    try { await fetch(`${API_BASE}/api/v1/auth/logout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }) }) } catch {}
  },

  async refresh(refreshToken: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }) })
    const json = await res.json()
    if (!res.ok || !json.success) throw new Error(json.error?.message || 'Token refresh failed')
    return json.data as LoginResponse
  },

  async getCurrentUser(): Promise<CurrentUser> { return authFetch<CurrentUser>('/api/v1/auth/me') },
  async changePassword(currentPassword: string, newPassword: string): Promise<void> { await authFetch('/api/v1/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }) },
  async forgotPassword(email: string): Promise<void> { await fetch(`${API_BASE}/api/v1/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }) },
  async resetPassword(token: string, newPassword: string): Promise<void> { const res = await fetch(`${API_BASE}/api/v1/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, newPassword }) }); const json = await res.json(); if (!res.ok || !json.success) throw new Error(json.error?.message || 'Password reset failed') },
  async listSessions(): Promise<unknown[]> { return authFetch<unknown[]>('/api/v1/auth/sessions') },
  async revokeSession(tokenHash: string): Promise<void> { await authFetch(`/api/v1/auth/sessions/${tokenHash}/revoke`, { method: 'POST' }) },
  async listDevices(): Promise<unknown[]> { return authFetch<unknown[]>('/api/v1/auth/devices') },
  async inviteUser(params: { email: string; roles: string[]; firstName?: string; lastName?: string; designation?: string }): Promise<{ invitationId: string; token: string }> { return authFetch('/api/v1/auth/invite', { method: 'POST', body: JSON.stringify(params) }) },
  async acceptInvitation(params: { token: string; username: string; password: string; firstName?: string; lastName?: string }): Promise<LoginResponse> { const res = await fetch(`${API_BASE}/api/v1/auth/accept-invitation`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) }); const json = await res.json(); if (!res.ok || !json.success) throw new Error(json.error?.message || 'Invitation acceptance failed'); return json.data as LoginResponse },
}

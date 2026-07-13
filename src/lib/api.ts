/**
 * Shared API fetch helper — reused across ALL API client modules.
 * Eliminates the 14+ inline copies of this pattern.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

export function getApiBase(): string {
  return API_BASE
}

export function getAuthToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem('suop_access_token')
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.error?.message || `HTTP ${res.status}`)
  return json as T
}

// ─── Shared Types ───────────────────────────────────────────────────────────

export interface PaginatedMeta {
  total: number
  page: number
  pageSize: number
  totalPages?: number
  hasNext?: boolean
  hasPrev?: boolean
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: PaginatedMeta
}

export interface SingleResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Array<{ field: string; code: string; message: string }>
  }
}

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  [key: string]: string | number | undefined
}

// ─── Helper to build query strings ──────────────────────────────────────────

export function buildQueryString(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value))
    }
  }
  return qs.toString()
}

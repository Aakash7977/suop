/**
 * Core HTTP client — used by ALL domain API clients.
 * Handles: base URL, auth token injection, JSON parsing, error extraction.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

export function getApiBase(): string {
  return API_BASE
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { getAuthToken } = await import('./auth')
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const json = await res.json()
  if (!res.ok || !json.success) {
    const { ApiError } = await import('./errors')
    throw new ApiError(
      json.error?.message || `HTTP ${res.status}`,
      res.status,
      json.error?.code || 'UNKNOWN',
      json.error?.details
    )
  }
  return json as T
}

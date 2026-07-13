/**
 * Core HTTP client — used by ALL domain API clients.
 * Handles: base URL, auth token injection, org-context headers, JSON parsing, error extraction.
 *
 * Phase 1.6: Propagates organization context (company/plant/warehouse/department)
 * from the frontend org-context-store to the backend via X-Company-Id, X-Plant-Id,
 * X-Warehouse-Id, X-Department-Id headers. The backend uses these to override
 * the JWT-resolved scope when the user explicitly selects a different context
 * in the UI (e.g., a manager switching between plants).
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

  // Phase 1.6: Inject org-context headers from the org-context-store
  // This allows the frontend to override the JWT-resolved scope when the user
  // explicitly selects a different company/plant/warehouse in the UI.
  try {
    const { useOrgContextStore } = await import('@/stores/org-context-store')
    const state = useOrgContextStore.getState()
    if (state.companyId) headers['X-Company-Id'] = state.companyId
    if (state.plantId) headers['X-Plant-Id'] = state.plantId
    if (state.warehouseId) headers['X-Warehouse-Id'] = state.warehouseId
    if (state.departmentId) headers['X-Department-Id'] = state.departmentId
  } catch {
    // org-context-store not available (e.g., during SSR) — skip headers
  }

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

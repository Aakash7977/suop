// Backward compat shim — core API moved to @/api/core
export { apiFetch, getApiBase, getAuthToken, setAuthToken, buildQueryString } from '@/api/core'
export type { PaginatedResponse, SingleResponse, ErrorResponse, ListParams, PaginatedMeta, PaginationParams } from '@/api/core'

/**
 * API Core — Shared HTTP infrastructure
 * Used by ALL domain API clients. No client may define its own fetch logic.
 */

export { apiFetch, getApiBase } from './api-fetch'
export { getAuthToken, setAuthToken, clearAuthToken, getRefreshToken } from './auth'
export type { RequestInterceptor, ResponseInterceptor } from './interceptors'
export { registerRequestInterceptor, registerResponseInterceptor } from './interceptors'
export { ApiError, ConflictError, NotFoundError, ValidationError, BusinessRuleError, UnauthorizedError, ForbiddenError } from './errors'
export type { PaginatedMeta, PaginatedResponse, SingleResponse, ErrorResponse, ListParams, PaginationParams } from './pagination'
export { buildQueryString } from './query-builder'
export { uploadFile, uploadFiles } from './upload'
export { withRetry } from './retry'

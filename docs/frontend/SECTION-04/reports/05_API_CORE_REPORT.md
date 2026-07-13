# 05 — API Core Report

**Date**: 2026-07-13
**Status**: ✅ COMPLETE

## src/api/core/ (9 files)

| File | Exports | Purpose |
|---|---|---|
| api-fetch.ts | apiFetch, getApiBase | Core HTTP client with auth token injection |
| auth.ts | getAuthToken, setAuthToken, clearAuthToken, getRefreshToken | Token management |
| interceptors.ts | registerRequestInterceptor, registerResponseInterceptor | Request/response hooks |
| errors.ts | ApiError, ConflictError, NotFoundError, ValidationError, BusinessRuleError, UnauthorizedError, ForbiddenError | Typed error classes |
| pagination.ts | PaginatedMeta, PaginatedResponse, SingleResponse, ErrorResponse, ListParams, PaginationParams | Pagination types |
| query-builder.ts | buildQueryString | URL query string construction |
| upload.ts | uploadFile, uploadFiles | Multipart file upload |
| retry.ts | withRetry | Retry logic for transient failures |
| index.ts | barrel | Re-exports all core utilities |

## Technical Debt Removed
- 12 inline apiFetch copies → 1 shared apiFetch in @/api/core
- 12 inline token management → 1 shared auth module
- 12 inline query string builders → 1 shared buildQueryString

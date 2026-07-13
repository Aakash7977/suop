# 04 — API Core Architecture

**Date**: 2026-07-13
**Status**: FINAL

---

## 1. Purpose

`src/api/core/` is the shared API foundation. Every domain client (`inventoryApi`, `warehouseApi`, etc.) MUST reuse these utilities. No client may define its own `fetch`, its own auth logic, or its own error handling.

## 2. File Structure

```
src/api/core/
├── api-fetch.ts       ← Core HTTP client
├── auth.ts            ← Token management
├── interceptors.ts    ← Request/response interceptors
├── errors.ts          ← Typed error classes
├── pagination.ts      ← Pagination types
├── query-builder.ts   ← Query string construction
├── upload.ts          ← File upload helpers
├── retry.ts           ← Retry logic for transient failures
└── index.ts           ← Barrel
```

## 3. File Specifications

### api-fetch.ts

```typescript
/**
 * Core HTTP client — used by ALL domain API clients.
 * Handles: auth token injection, JSON parsing, error extraction, base URL.
 * Does NOT handle: retries (use withRetry), interceptors (registered separately).
 */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T>
```

**Business Justification**: SAP's RFC layer, Oracle's ADF bindings, and Dynamics' OData client all have a single HTTP foundation. SUOP currently has 12 inline copies of this function.

**Technical Justification**: One function = one place to update auth token logic, one place to add request logging, one place to handle 401 refresh.

**Performance Impact**: Negligible — function is called per-request, not per-render.

### auth.ts

```typescript
export function getAuthToken(): string | null
export function setAuthToken(token: string): void
export function clearAuthToken(): void
export function getRefreshToken(): string | null
```

**Business Justification**: Token management is cross-cutting — every API call needs it. Separating it from `apiFetch` allows the auth store to manage tokens independently.

**Backward Compatibility**: `getAuthToken()` reads from `localStorage['suop_access_token']` — same key all existing clients use.

### interceptors.ts

```typescript
export interface RequestInterceptor { (req: RequestInit): RequestInit | Promise<RequestInit> }
export interface ResponseInterceptor { (res: Response, req: RequestInit): Response | Promise<Response> }

export function registerRequestInterceptor(fn: RequestInterceptor): () => void
export function registerResponseInterceptor(fn: ResponseInterceptor): () => void
```

**Business Justification**: Enterprise ERPs need request logging (audit), response caching (performance), and 401 auto-refresh (UX). Interceptors provide hooks without modifying `apiFetch`.

**Future Scalability**: Third-party integrations (analytics, error tracking) can register interceptors without touching API client code.

### errors.ts

```typescript
export class ApiError extends Error { status: number; code: string; details?: unknown[] }
export class ConflictError extends ApiError {}        // 409
export class NotFoundError extends ApiError {}         // 404
export class ValidationError extends ApiError { fields: Array<{ field: string; message: string }> }  // 422
export class BusinessRuleError extends ApiError { rule: string }  // 400 with business rule code
export class UnauthorizedError extends ApiError {}     // 401
export class ForbiddenError extends ApiError {}        // 403
```

**Business Justification**: Components need to handle different error types differently. `ValidationError` shows field-level errors. `ConflictError` shows "record already exists". `BusinessRuleError` shows the specific rule violated.

**Enterprise Comparison**: SAP uses `BAPIRET2` with message types (E, W, I, A). Oracle uses `OAException` with severity. SUOP uses typed error classes — same concept, TypeScript-native.

### pagination.ts

```typescript
export interface PaginatedMeta { total: number; page: number; pageSize: number; totalPages?: number }
export interface PaginatedResponse<T> { success: boolean; data: T[]; meta: PaginatedMeta }
export interface PaginationParams { page?: number; pageSize?: number }
```

**Business Justification**: Every list endpoint returns the same pagination shape. Standardizing the type eliminates per-client type definitions.

### query-builder.ts

```typescript
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string
```

**Business Justification**: Every client builds query strings. Current pattern: inline `new URLSearchParams()` in each method. Shared function eliminates ~100 lines of duplicate code.

### upload.ts

```typescript
export async function uploadFile(path: string, file: File, fieldName?: string): Promise<unknown>
export async function uploadFiles(path: string, files: File[], fieldName?: string): Promise<unknown>
```

**Business Justification**: Import wizards, attachment uploads, and document management need multipart form-data uploads. Currently NO upload capability exists in any client.

**Future Scalability**: Product images, compliance documents, GRN attachments all need file upload.

### retry.ts

```typescript
export async function withRetry<T>(fn: () => Promise<T>, options?: { maxRetries?: number; delayMs?: number; retryOn?: number[] }): Promise<T>
```

**Business Justification**: Network is unreliable. Transient failures (502, 503, network timeout) should be retried automatically. Non-transient errors (400, 404, 409) should NOT be retried.

**Performance Impact**: Retries add ~1-3 seconds on transient failures. Acceptable for ERP operations.

## 4. Dependency Impact

- `apiFetch` depends on `auth.ts` (for token) and `errors.ts` (for error parsing)
- All domain clients depend on `apiFetch` + `pagination.ts` + `query-builder.ts`
- `interceptors.ts` is optional — clients work without it, but logging/caching/register there
- `upload.ts` is independent — only used by clients with file upload
- `retry.ts` wraps any async function — independent of `apiFetch`

## 5. Migration Path

1. Create `src/api/core/` with all 8 files
2. Move existing `src/lib/api.ts` content into `src/api/core/api-fetch.ts` (and split into proper files)
3. Update `src/lib/api.ts` to re-export from `src/api/core/` (backward compat)
4. All new domain clients import from `@/api/core`
5. Old `src/lib/api.ts` can be deleted after all consumers migrated

---

**END OF API CORE ARCHITECTURE**

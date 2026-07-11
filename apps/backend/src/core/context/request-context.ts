/**
 * @suop/backend — Request Context
 *
 * Per Phase 0 Architecture §8.4: AsyncLocalStorage carries request-scoped
 * data (correlationId, userId, tenantId, IP, userAgent) through the
 * entire call stack without explicit parameter passing.
 *
 * This is consumed by:
 *   - Logging framework (auto-includes correlationId, userId, tenantId in every log)
 *   - Audit framework (records who performed the action)
 *   - Tenant extension (auto-scopes Prisma queries by tenantId)
 *   - Permission middleware (checks user's permissions)
 */

import { AsyncLocalStorage } from 'node:async_hooks'
import { randomUUID } from 'node:crypto'

export interface RequestContext {
  /** Unique ID for this request (UUID v7 or v4) — propagated to logs and responses */
  correlationId: string

  /** Authenticated user ID (null for unauthenticated requests) */
  userId: string | null

  /** User's email (for audit logs) */
  userEmail: string | null

  /** Tenant ID (null for unauthenticated or cross-tenant system requests) */
  tenantId: string | null

  /** User's roles (for RBAC checks) */
  roles: string[]

  /** User's permissions (flattened from roles) */
  permissions: string[]

  /** Client IP address */
  ip: string | null

  /** Client User-Agent */
  userAgent: string | null

  /** Request method */
  method: string

  /** Request path */
  path: string

  /** Timestamp when request started */
  startedAt: number

  /** Optional: DB transaction client (set when inside a transaction) */
  tx?: unknown
}

// ─── AsyncLocalStorage Instance ─────────────────────────────────────────────

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>()

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Run a function within a request context. All code inside `fn` (including
 * async descendants) can access the context via `getRequestContext()`.
 */
export function runInContext<T>(ctx: RequestContext, fn: () => Promise<T>): Promise<T> {
  return asyncLocalStorage.run(ctx, fn)
}

/**
 * Get the current request context, or null if not inside a request.
 */
export function getRequestContext(): RequestContext | null {
  return asyncLocalStorage.getStore() ?? null
}

/**
 * Get the current request context or throw if none exists.
 * Use this in code paths that must run inside a request.
 */
export function requireRequestContext(): RequestContext {
  const ctx = asyncLocalStorage.getStore()
  if (!ctx) {
    throw new Error('No request context available. This code must run within a request.')
  }
  return ctx
}

/**
 * Update the current request context (e.g., after authentication).
 * Creates a new context object and runs the continuation with it.
 * Returns the original context for restoration if needed.
 */
export function updateContext(updates: Partial<RequestContext>): void {
  const current = asyncLocalStorage.getStore()
  if (current) {
    Object.assign(current, updates)
  }
}

// ─── Factory ────────────────────────────────────────────────────────────────

/**
 * Create a new RequestContext for an incoming HTTP request.
 */
export function createRequestContext(params: {
  method: string
  path: string
  correlationId?: string
  ip?: string | null
  userAgent?: string | null
}): RequestContext {
  return {
    correlationId: params.correlationId ?? randomUUID(),
    userId: null,
    userEmail: null,
    tenantId: null,
    roles: [],
    permissions: [],
    ip: params.ip ?? null,
    userAgent: params.userAgent ?? null,
    method: params.method,
    path: params.path,
    startedAt: Date.now(),
  }
}

// ─── Test Utilities ─────────────────────────────────────────────────────────

/**
 * FOR TESTING ONLY — run a function within a synthetic request context.
 */
export function _runInTestContext<T>(
  overrides: Partial<RequestContext>,
  fn: () => Promise<T>
): Promise<T> {
  const ctx: RequestContext = {
    correlationId: 'test-correlation-id',
    userId: null,
    userEmail: null,
    tenantId: null,
    roles: [],
    permissions: [],
    ip: '127.0.0.1',
    userAgent: 'test-agent',
    method: 'GET',
    path: '/test',
    startedAt: Date.now(),
    ...overrides,
  }
  return asyncLocalStorage.run(ctx, fn)
}

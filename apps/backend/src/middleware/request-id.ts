/**
 * Request ID Middleware
 *
 * Assigns a UUID v7 correlation ID to every request.
 * Uses enterWith() instead of run() to avoid interfering with Hono's
 * error propagation in the middleware chain.
 */

import type { Context, Next } from 'hono'
import { randomUUID } from 'node:crypto'
import { createRequestContext, asyncLocalStorage } from '@/core/context'

export async function requestIdMiddleware(c: Context, next: Next) {
  const incomingId = c.req.header('X-Request-Id')
  const correlationId = incomingId || randomUUID()

  const ctx = createRequestContext({
    method: c.req.method,
    path: c.req.path,
    correlationId,
    ip: c.req.header('x-forwarded-for') ?? null,
    userAgent: c.req.header('user-agent') ?? null,
  })

  // Use enterWith to set context for the current async execution
  // This allows errors to propagate normally through Hono's middleware chain
  asyncLocalStorage.enterWith(ctx)

  c.header('X-Request-Id', correlationId)

  await next()
}

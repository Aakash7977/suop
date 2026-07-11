/**
 * Logging Middleware
 *
 * Logs request start + end with method, path, status, duration.
 * Uses structured JSON logging with correlation ID from request context.
 */

import type { Context, Next } from 'hono'
import { logger } from '@/core/logging'
import { getRequestContext } from '@/core/context'

export async function loggingMiddleware(c: Context, next: Next) {
  const ctx = getRequestContext()
  const startedAt = Date.now()

  logger.info('Request started', {
    method: c.req.method,
    path: c.req.path,
    correlationId: ctx?.correlationId,
  })

  await next()

  const durationMs = Date.now() - startedAt
  const status = c.res.status

  if (status >= 500) {
    logger.error('Request completed', { method: c.req.method, path: c.req.path, status, durationMs })
  } else if (status >= 400) {
    logger.warn('Request completed', { method: c.req.method, path: c.req.path, status, durationMs })
  } else {
    logger.info('Request completed', { method: c.req.method, path: c.req.path, status, durationMs })
  }
}

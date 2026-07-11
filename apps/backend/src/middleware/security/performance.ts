/**
 * @suop/backend — Performance Monitoring Middleware
 *
 * RC1 Fix Pack 2 §B-4: Records API metrics for every request.
 *
 * Captures:
 *   - Method, path, status code
 *   - Request duration (high-resolution)
 *   - User ID, tenant ID (from request context)
 *   - Response size (approximate)
 *
 * Forwards to:
 *   - In-memory ring buffer (for dashboard)
 *   - Slow request log (requests > 2s)
 *   - Security monitoring (for abuse detection)
 */

import type { Context, Next } from 'hono'
import { performance } from 'node:perf_hooks'
import { recordApiMetric } from '@/core/observability/metrics'
import { recordApiUsage } from '@/core/security/security-monitoring'
import { getRequestContext } from '@/core/context'

/**
 * Performance monitoring middleware.
 *
 * Apply early (after requestId, before auth) so we capture timing for
 * all requests including auth failures.
 */
export async function performanceMiddleware(c: Context, next: Next) {
  const start = performance.now()

  await next()

  const durationMs = performance.now() - start
  const ctx = getRequestContext()
  const method = c.req.method
  const path = normalizePath(c.req.path)
  const statusCode = c.res.status

  // Record metric for the dashboard
  recordApiMetric({
    method,
    path,
    statusCode,
    durationMs,
    userId: ctx?.userId ?? undefined,
    tenantId: ctx?.tenantId ?? undefined,
  })

  // Record for security monitoring (abuse detection)
  recordApiUsage({
    userId: ctx?.userId ?? undefined,
    tenantId: ctx?.tenantId ?? undefined,
    ipAddress: ctx?.ip ?? c.req.header('X-Forwarded-For')?.split(',')[0]?.trim() ?? 'unknown',
    endpoint: path,
    statusCode,
    responseTimeMs: durationMs,
  })
}

/**
 * Normalize paths for metric grouping.
 *
 * Converts `/api/v1/users/123e4567-e89b-12d3-a456-426614174000` to
 * `/api/v1/users/:id` so we can aggregate by endpoint, not by ID.
 */
function normalizePath(path: string): string {
  return path
    // Replace UUIDs with :id
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id')
    // Replace numeric IDs with :id
    .replace(/\/\d+/g, '/:id')
}

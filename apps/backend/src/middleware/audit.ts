/**
 * Audit Middleware
 *
 * Records audit log entries for mutating requests (POST, PUT, PATCH, DELETE).
 * Reads from request context (set by auth middleware).
 */

import type { Context, Next } from 'hono'
import { auditService } from '@/core/audit'
import { getRequestContext } from '@/core/context'

export async function auditMiddleware(c: Context, next: Next) {
  await next()

  // Only audit mutating requests
  const method = c.req.method
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return
  }

  // Skip audit for system endpoints (root-level + internal)
  if (
    c.req.path.startsWith('/api/v1/_internal') ||
    c.req.path === '/health' ||
    c.req.path === '/ready' ||
    c.req.path === '/live'
  ) {
    return
  }

  const ctx = getRequestContext()
  if (!ctx || !ctx.tenantId) {
    return
  }

  // Write audit log (fire-and-forget)
  await auditService.log({
    tenantId: ctx.tenantId,
    actorType: ctx.userId ? 'USER' : 'SYSTEM',
    actorId: ctx.userId,
    actorName: ctx.userEmail,
    actorRole: ctx.roles.join(',') || null,
    ipAddress: ctx.ip,
    userAgent: ctx.userAgent,
    correlationId: ctx.correlationId,
    action: method.toUpperCase(),
    entityType: 'API_REQUEST',
    entityId: null,
    metadata: {
      method,
      path: c.req.path,
      status: c.res.status,
    },
  })
}

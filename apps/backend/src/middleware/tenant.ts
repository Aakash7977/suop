/**
 * Tenant Middleware
 *
 * Verifies tenant context is present for authenticated requests.
 * Cross-tenant access requires system:tenant:cross permission.
 */

import type { Context, Next } from 'hono'
import { AuthorizationError } from '@/core/errors'
import { getRequestContext } from '@/core/context'

export async function tenantMiddleware(_c: Context, next: Next) {
  const ctx = getRequestContext()

  if (ctx?.userId && !ctx.tenantId) {
    throw new AuthorizationError('Authenticated user has no tenant context')
  }

  await next()
}

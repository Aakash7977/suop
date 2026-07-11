/**
 * RBAC Middleware Factory
 *
 * Usage:
 *   app.post('/api/v1/products', requirePermission(Permission.PRODUCT_CREATE), handler)
 */

import type { Context, Next } from 'hono'
import { AuthorizationError } from '@/core/errors'
import { PermissionChecker, type Permission } from '@/core/permissions'
import { getRequestContext } from '@/core/context'

export function requirePermission(permission: Permission) {
  return async (_c: Context, next: Next) => {
    const ctx = getRequestContext()

    if (!ctx || !ctx.userId) {
      throw new AuthorizationError('Authentication required')
    }

    if (!PermissionChecker.hasPermission(ctx.roles, permission)) {
      throw new AuthorizationError(`Permission denied: requires '${permission}'`)
    }

    await next()
  }
}

export function requireAnyPermission(permissions: Permission[]) {
  return async (_c: Context, next: Next) => {
    const ctx = getRequestContext()

    if (!ctx || !ctx.userId) {
      throw new AuthorizationError('Authentication required')
    }

    if (!PermissionChecker.hasAnyPermission(ctx.roles, permissions)) {
      throw new AuthorizationError(
        `Permission denied: requires one of [${permissions.join(', ')}]`
      )
    }

    await next()
  }
}

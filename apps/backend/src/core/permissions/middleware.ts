/**
 * @suop/backend — Permission Middleware
 *
 * Per API Standards §13 and Security Architecture §4.3:
 *   - Route-level: requirePermission('po:create') blocks unauthorized users
 *   - Row-level: service checks (e.g., PO assigned to user)
 *   - Field-level: response shaping (strip fields)
 *
 * Usage:
 *   const handler = requirePermission('po:create', poController.create)
 */

import { AuthorizationError } from '@/core/errors'
import { PermissionChecker, type Permission } from './registry'

type Handler<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>

export function requirePermission<TArgs extends unknown[], TResult>(
  permission: Permission,
  handler: Handler<TArgs, TResult>
): Handler<TArgs, TResult> {
  return async (...args: TArgs) => {
    // In a real implementation, the request context would be available
    // via AsyncLocalStorage (set by AuthMiddleware).
    // For Phase 0, we check the context via the request-context module.
    const { getRequestContext } = await import('@/core/context')
    const ctx = getRequestContext()

    if (!ctx) {
      throw new AuthorizationError('No request context for permission check')
    }

    if (!ctx.userId) {
      throw new AuthorizationError('Authentication required')
    }

    if (!PermissionChecker.hasPermission(ctx.roles, permission)) {
      throw new AuthorizationError(
        `Permission denied: requires '${permission}'`
      )
    }

    return handler(...args)
  }
}

export function requireAnyPermission<TArgs extends unknown[], TResult>(
  permissions: Permission[],
  handler: Handler<TArgs, TResult>
): Handler<TArgs, TResult> {
  return async (...args: TArgs) => {
    const { getRequestContext } = await import('@/core/context')
    const ctx = getRequestContext()

    if (!ctx || !ctx.userId) {
      throw new AuthorizationError('Authentication required')
    }

    if (!PermissionChecker.hasAnyPermission(ctx.roles, permissions)) {
      throw new AuthorizationError(
        `Permission denied: requires one of [${permissions.join(', ')}]`
      )
    }

    return handler(...args)
  }
}

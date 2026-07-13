/**
 * SoD Enforcement Utility
 *
 * Provides maker-checker validation for service-layer operations.
 * Every approve/post/reverse operation must verify that the actor
 * is NOT the same user who created the record.
 */

import { getRequestContext } from '@/core/context'
import { BusinessRuleError } from '@/core/errors'

/**
 * Verify that the current user is NOT the creator of the record.
 * This enforces the Maker-Checker principle (SoD-01 through SoD-27).
 *
 * @param createdBy - The userId of the record creator
 * @param operation - The operation being performed (e.g., 'approve', 'post', 'reverse')
 * @param entityType - The type of entity (e.g., 'PurchaseOrder', 'JournalEntry')
 * @throws BusinessRuleError if the actor is the creator
 */
export function enforceMakerChecker(
  createdBy: string | null | undefined,
  operation: string,
  entityType: string
): void {
  const ctx = getRequestContext()
  if (!ctx?.userId) return // System-level operation (no user context)

  if (createdBy && createdBy === ctx.userId) {
    throw new BusinessRuleError(
      `Cannot ${operation} own ${entityType} — Maker-Checker violation (SoD)`,
      { code: `SOD.MAKER_CHECKER_VIOLATION`, details: { actorId: ctx.userId, createdBy, operation, entityType } }
    )
  }
}

/**
 * Verify that the current user has the required permission.
 * This is a service-level check (in addition to route-level requirePermission).
 *
 * @param requiredPermission - The permission string to check
 * @param roles - The user's roles
 * @throws BusinessRuleError if the user lacks the permission
 */
export function enforcePermission(
  requiredPermission: string,
  roles: string[]
): void {
  const { PermissionChecker, Permission } = require('@/core/permissions/registry')
  const perm = requiredPermission as unknown as typeof Permission[keyof typeof Permission]
  if (!PermissionChecker.hasPermission(roles, perm)) {
    throw new BusinessRuleError(
      `Insufficient permissions: ${requiredPermission} required`,
      { code: 'AUTH.INSUFFICIENT_PERMISSIONS', details: { requiredPermission, roles } }
    )
  }
}

/**
 * Verify that the current user is NOT operating under break-glass for destructive operations.
 * Break glass users can only read and configure — not post, approve, delete, or override.
 *
 * @param operation - The operation being performed
 * @throws BusinessRuleError if break-glass user attempts restricted operation
 */
export function enforceNotBreakGlass(operation: string): void {
  const ctx = getRequestContext()
  if (!ctx?.userId) return

  // Check if user has break_glass role (would be in JWT claims)
  const roles = (ctx as any).roles || []
  if (roles.includes('break_glass')) {
    throw new BusinessRuleError(
      `Break-glass users cannot perform: ${operation} — Emergency access is read-only + configure only`,
      { code: 'SOD.BREAK_GLASS_RESTRICTED', details: { operation, userId: ctx.userId } }
    )
  }
}

/**
 * Verify tenant isolation — ensure the record belongs to the current tenant.
 *
 * @param recordTenantId - The tenant ID of the record
 * @throws BusinessRuleError if tenant mismatch
 */
export function enforceTenantIsolation(recordTenantId: string): void {
  const ctx = getRequestContext()
  if (!ctx?.tenantId) return

  if (recordTenantId !== ctx.tenantId) {
    throw new BusinessRuleError(
      'Tenant isolation violation — cannot access records from another tenant',
      { code: 'TENANT.ISOLATION_VIOLATION', details: { recordTenantId, userTenantId: ctx.tenantId } }
    )
  }
}

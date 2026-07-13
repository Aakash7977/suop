/**
 * @suop/backend — Service-Layer Scope Enforcement Helpers
 *
 * Provides drop-in enforcement helpers for service methods to validate
 * that operations respect the current user's data scope.
 *
 * Usage in service files:
 *
 *   import { enforceScopeOnRead, enforceScopeOnWrite, requireScope } from '@/core/security/scope-enforcement'
 *
 *   async getPurchaseOrder(tenantId: string, id: string) {
 *     const po = await poRepository.findById(tenantId, id)
 *     if (!po) throw new NotFoundError('PurchaseOrder', id)
 *     enforceScopeOnRead(po, 'PurchaseOrder')        // ← Phase 1 RBAC
 *     return po
 *   }
 *
 *   async updatePurchaseOrder(tenantId: string, id: string, data: UpdateDto) {
 *     const existing = await poRepository.findById(tenantId, id)
 *     if (!existing) throw new NotFoundError('PurchaseOrder', id)
 *     enforceScopeOnWrite(existing, 'PurchaseOrder', 'update')  // ← Phase 1 RBAC
 *     // ... proceed with update
 *   }
 */

import { enforceScope, enforceScopeOnWrite, getCurrentDataScope } from './data-scope'
import { getRequestContext } from '@/core/context'

/**
 * Enforce scope on a record being READ.
 * Throws AuthorizationError if the record is out of scope.
 */
export function enforceScopeOnRead(
  record: Record<string, unknown> | null,
  entityType: string
): void {
  enforceScope(record, entityType)
}

/**
 * Enforce scope on a record being WRITTEN (update/delete/transition).
 * Throws AuthorizationError if the record is out of scope.
 *
 * Also enforces that break-glass users cannot perform write operations.
 */
export function enforceScopeForWrite(
  record: Record<string, unknown> | null,
  entityType: string,
  operation: string
): void {
  const ctx = getRequestContext()
  if (ctx?.roles?.includes('break_glass')) {
    throw new Error(`Break-glass users cannot perform write operation: ${operation} on ${entityType}`)
  }
  enforceScopeOnWrite(record, entityType, operation)
}

/**
 * Require that the current user has at least the given scope level.
 * Useful for dashboard endpoints that aggregate across scope.
 */
export function requireMinScope(minScope: string): void {
  const current = getCurrentDataScope()
  const ranks: Record<string, number> = {
    own: 1, dept: 2, wh: 3, plant: 4, company: 5, bu: 6, region: 7, global: 8,
  }
  if ((ranks[current] ?? 0) < (ranks[minScope] ?? 99)) {
    throw new Error(`Insufficient scope: requires ${minScope}, current is ${current}`)
  }
}

/**
 * Convenience: re-export for backward compat.
 */
export { enforceScope, enforceScopeOnWrite } from './data-scope'

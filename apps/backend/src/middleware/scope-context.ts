/**
 * @suop/backend — Scope Context Middleware
 *
 * Populates the request context with data scope information immediately
 * after authentication. MUST run after the auth middleware.
 *
 * This is the integration point that connects the JWT claims (which carry
 * warehouse/plant/company assignments) to the runtime scope context.
 *
 * Flow:
 *   1. AuthMiddleware → verifies JWT, sets userId, tenantId, roles, AND
 *      scope claims (warehouseIds, plantIds, etc.) on RequestContext
 *   2. ScopeContextMiddleware → resolves dataScope from roles + caches it
 *   3. Repository queries → use buildScopeFilter() to auto-filter by scope
 *   4. Service operations → use enforceScope() to validate scope on writes
 *
 * Phase 1.6: The auth middleware already populates warehouseIds/plantIds/etc.
 * from the JWT `scope` claim. This middleware resolves the dataScope string
 * (own/dept/wh/plant/company/bu/region/global) from the user's roles and
 * caches it on the context.
 */

import type { Context, Next } from 'hono'
import { getRequestContext } from '@/core/context'
import { populateScopeContext, getCurrentDataScope, requireScopeContext } from '@/core/security/data-scope'

/**
 * Hono middleware that resolves and caches the data scope for authenticated requests.
 *
 * The auth middleware already populated warehouseIds/plantIds/etc. from the JWT
 * `scope` claim. This middleware:
 *   1. Reads the already-populated scope IDs from RequestContext
 *   2. Resolves the dataScope string from the user's roles
 *   3. Caches it on RequestContext via populateScopeContext()
 */
export async function scopeContextMiddleware(c: Context, next: Next): Promise<Response | void> {
  const ctx = getRequestContext()
  if (ctx?.userId) {
    // Auth middleware already populated warehouseIds/plantIds/etc. from JWT scope claim.
    // Re-pass them through populateScopeContext() to resolve and cache the dataScope string.
    populateScopeContext({
      warehouseIds: ctx.warehouseIds,
      plantIds: ctx.plantIds,
      companyIds: ctx.companyIds,
      departmentIds: ctx.departmentIds,
      businessUnitIds: ctx.businessUnitIds,
      regionIds: ctx.regionIds,
    })

    // Phase 1.6: Allow frontend to override scope via X-Company-Id / X-Plant-Id /
    // X-Warehouse-Id / X-Department-Id headers. This lets a manager switch between
    // plants/warehouses in the UI. The override is only applied if the user has
    // GLOBAL or COMPANY scope (managers/admins) — scoped users (warehouse_operator)
    // cannot override their assigned warehouse.
    const overrideCompanyId = c.req.header('X-Company-Id')
    const overridePlantId = c.req.header('X-Plant-Id')
    const overrideWarehouseId = c.req.header('X-Warehouse-Id')
    const overrideDepartmentId = c.req.header('X-Department-Id')

    if (overrideCompanyId || overridePlantId || overrideWarehouseId || overrideDepartmentId) {
      const currentScope = getCurrentDataScope()
      // Only allow override for global/company/bu/region scope users (managers/admins)
      const canOverride =
        currentScope === 'global' ||
        currentScope === 'company' ||
        currentScope === 'bu' ||
        currentScope === 'region'

      if (canOverride) {
        // Apply override — narrow the scope to the selected context
        const overrides: Record<string, string[] | undefined> = {}
        if (overrideWarehouseId) overrides.warehouseIds = [overrideWarehouseId]
        if (overridePlantId) overrides.plantIds = [overridePlantId]
        if (overrideCompanyId) overrides.companyIds = [overrideCompanyId]
        if (overrideDepartmentId) overrides.departmentIds = [overrideDepartmentId]
        populateScopeContext(overrides)
      }
      // If user can't override, silently ignore (use JWT-resolved scope)
    }

    // For non-global scope, verify context is populated (fail-closed)
    // Don't throw here — some endpoints (like /auth/me) don't need scope.
    // Service-layer code that needs scope will call requireScopeContext() explicitly.
    const _scope = getCurrentDataScope()
    void _scope
  }

  await next()
}

/**
 * Hono middleware that REQUIRES scope context (fails the request if not populated).
 * Use on endpoints that absolutely need scope (dashboards, reports, exports).
 */
export async function requireScopeContextMiddleware(c: Context, next: Next): Promise<Response | void> {
  try {
    requireScopeContext()
  } catch (err: any) {
    return c.json({ success: false, error: { code: err.code ?? 'SCOPE.CONTEXT_MISSING', message: err.message } }, 403)
  }
  await next()
}

/**
 * Helper for routes that need to attach scope info to responses
 * (for frontend context propagation).
 */
export function getScopeContextForFrontend(): {
  dataScope: string
  warehouseIds: string[]
  plantIds: string[]
  companyIds: string[]
  departmentIds: string[]
} {
  const ctx = getRequestContext()
  return {
    dataScope: getCurrentDataScope(),
    warehouseIds: ctx?.warehouseIds ?? [],
    plantIds: ctx?.plantIds ?? [],
    companyIds: ctx?.companyIds ?? [],
    departmentIds: ctx?.departmentIds ?? [],
  }
}

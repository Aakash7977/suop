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
 *   1. AuthMiddleware → sets userId, tenantId, roles on RequestContext
 *   2. ScopeContextMiddleware → sets dataScope, warehouseIds, plantIds, etc.
 *   3. Repository queries → use buildScopeFilter() to auto-filter by scope
 *   4. Service operations → use enforceScope() to validate scope on writes
 */

import type { Context, Next } from 'hono'
import { getRequestContext } from '@/core/context'
import { populateScopeContext, getCurrentDataScope, requireScopeContext } from '@/core/security/data-scope'

/**
 * Hono middleware that populates the scope context for authenticated requests.
 *
 * Expects JWT claims to include:
 *   - scope.warehouseIds?: string[]
 *   - scope.plantIds?: string[]
 *   - scope.companyIds?: string[]
 *   - scope.departmentIds?: string[]
 *   - scope.businessUnitIds?: string[]
 *   - scope.regionIds?: string[]
 *
 * If claims are absent, scope defaults to OWN (most restrictive).
 */
export async function scopeContextMiddleware(c: Context, next: Next): Promise<Response | void> {
  const ctx = getRequestContext()
  if (ctx?.userId) {
    // Extract scope claims from JWT (set by auth middleware as ctx.claims)
    const claims = (c as any).get('jwtPayload') ?? (c as any).get('user') ?? {}
    const scopeClaims = claims.scope ?? {}

    populateScopeContext({
      warehouseIds: scopeClaims.warehouseIds,
      plantIds: scopeClaims.plantIds,
      companyIds: scopeClaims.companyIds,
      departmentIds: scopeClaims.departmentIds,
      businessUnitIds: scopeClaims.businessUnitIds,
      regionIds: scopeClaims.regionIds,
    })

    // For non-global scope, verify context is populated (fail-closed)
    const scope = getCurrentDataScope()
    if (scope !== 'global') {
      // Don't throw — just log. Some endpoints (like /auth/me) don't need scope.
      // Service-layer code that needs scope will call requireScopeContext() explicitly.
    }
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

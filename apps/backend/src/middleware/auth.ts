/**
 * Auth Middleware
 *
 * Validates JWT access token from Authorization header.
 * Populates request context with user info.
 * Public routes bypass this middleware.
 *
 * Phase 1.6 Hardening:
 *   - JTI blocklist check (Redis-backed with in-memory fallback)
 *   - Scope claims propagation (warehouseIds, plantIds, companyIds, etc.)
 *   - Key rotation support (tries current + previous keys)
 */

import type { Context, Next } from 'hono'
import { verifyAccessToken, isTokenBlockedAsync, type JwtPayload } from '@/core/auth'
import { AuthenticationError } from '@/core/errors'
import { updateContext } from '@/core/context'
import { logger } from '@/core/logging'

// Routes that don't require authentication
const PUBLIC_ROUTES = new Set([
  '/health',
  '/ready',
  '/live',
  '/openapi.json',
  '/swagger',
  '/swagger/',
  '/redoc',
  '/redoc/',
  '/api-info',
  '/api/v1/_internal/health',
  '/api/v1/_internal/live',
  '/api/v1/_internal/ready',
  '/api/v1/_internal/version',
  '/api/v1/_internal/metrics',
  '/api/v1/_internal/security',
  '/api/v1/_internal/cache',
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/accept-invitation',
  '/api/v1/reference',
])

export async function authMiddleware(c: Context, next: Next) {
  // Skip auth for public routes (root-level health + internal + reference + docs)
  if (
    PUBLIC_ROUTES.has(c.req.path) ||
    c.req.path.startsWith('/api/v1/_internal') ||
    c.req.path.startsWith('/api/v1/reference/')
  ) {
    return next()
  }

  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    throw new AuthenticationError('Authorization header required', 'AUTH.TOKEN_MISSING')
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Authorization header must use Bearer scheme', 'AUTH.TOKEN_INVALID')
  }

  const token = authHeader.slice(7)
  const payload = verifyAccessToken(token)

  // Phase 1.6: JTI blocklist check — reject revoked tokens immediately
  if (payload.jti) {
    try {
      const blocked = await isTokenBlockedAsync(payload.jti)
      if (blocked) {
        throw new AuthenticationError('Token has been revoked', 'AUTH.TOKEN_REVOKED')
      }
    } catch (err) {
      // Re-throw AuthenticationError, log other errors (Redis unavailable)
      if (err instanceof AuthenticationError) throw err
      logger.warn('JTI blocklist check failed — allowing request (fail-open)', {
        jti: payload.jti,
        error: (err as Error).message,
      })
    }
  }

  // Populate request context with user info + Phase 1.6 scope claims
  updateContext({
    userId: payload.sub,
    userEmail: payload.email,
    tenantId: payload.tenantId,
    roles: payload.roles,
    permissions: payload.permissions,
    // Phase 1.6: Propagate scope claims from JWT
    warehouseIds: payload.scope?.warehouseIds,
    plantIds: payload.scope?.plantIds,
    companyIds: payload.scope?.companyIds,
    departmentIds: payload.scope?.departmentIds,
    businessUnitIds: payload.scope?.businessUnitIds,
    regionIds: payload.scope?.regionIds,
  })

  await next()
}

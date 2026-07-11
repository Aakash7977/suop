/**
 * Auth Middleware
 *
 * Validates JWT access token from Authorization header.
 * Populates request context with user info.
 * Public routes bypass this middleware.
 */

import type { Context, Next } from 'hono'
import { verifyAccessToken, type JwtPayload } from '@/core/auth'
import { AuthenticationError } from '@/core/errors'
import { updateContext } from '@/core/context'

// Routes that don't require authentication
const PUBLIC_ROUTES = new Set([
  '/health',
  '/ready',
  '/live',
  '/api/v1/_internal/health',
  '/api/v1/_internal/live',
  '/api/v1/_internal/ready',
  '/api/v1/_internal/version',
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/accept-invitation',
  '/api/v1/reference',
])

export async function authMiddleware(c: Context, next: Next) {
  // Skip auth for public routes (root-level health + internal + reference)
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
  let payload: JwtPayload
  try {
    payload = verifyAccessToken(token)
  } catch (err) {
    throw err
  }

  // Populate request context with user info
  updateContext({
    userId: payload.sub,
    userEmail: payload.email,
    tenantId: payload.tenantId,
    roles: payload.roles,
    permissions: payload.permissions,
  })

  await next()
}

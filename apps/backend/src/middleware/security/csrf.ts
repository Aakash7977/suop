/**
 * @suop/backend — CSRF Protection Middleware (Double Submit Cookie)
 *
 * RC1 Fix Pack 2 §A-4: CSRF protection for cookie-based auth.
 *
 * Strategy: Double Submit Cookie
 *   1. On every response, set a CSRF cookie with a random token
 *   2. On every mutating request, expect the same token in X-CSRF-Token header
 *   3. If header != cookie, reject with 403
 *
 * Why double submit? It's stateless (no Redis lookup required) and works
 * with horizontal scaling. The token is tied to the cookie, not the session.
 *
 * API Exceptions:
 *   - Requests with `Authorization: Bearer ...` header are exempt (JWT in
 *     header is not vulnerable to CSRF — browser doesn't auto-send it)
 *   - GET/HEAD/OPTIONS requests are exempt (CSRF only matters for mutations)
 *   - Health endpoints are exempt (no mutations)
 *
 * The JWT-only auth model means CSRF is largely a defense-in-depth measure
 * for future cookie-based auth (e.g., session cookies for browser sessions).
 */

import type { Context, Next } from 'hono'
import { randomBytes } from 'node:crypto'
import { isProduction } from '@/config/env'

// ─── Token Generation ───────────────────────────────────────────────────────

/**
 * Generate a cryptographically random CSRF token (32 bytes, base64url).
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('base64url')
}

// ─── Cookie Name ────────────────────────────────────────────────────────────

const CSRF_COOKIE_NAME = '_csrf'
const CSRF_HEADER_NAME = 'X-CSRF-Token'

// ─── Exempt Paths ───────────────────────────────────────────────────────────

const EXEMPT_PATHS = new Set([
  '/health',
  '/ready',
  '/live',
  '/api/v1/_internal/health',
  '/api/v1/_internal/live',
  '/api/v1/_internal/ready',
  '/api/v1/_internal/version',
])

// ─── Middleware ─────────────────────────────────────────────────────────────

/**
 * CSRF protection middleware.
 *
 * For non-mutating requests (GET, HEAD, OPTIONS):
 *   - Set the CSRF cookie on the response
 *   - Pass through to the next handler
 *
 * For mutating requests (POST, PUT, PATCH, DELETE):
 *   - If Authorization header is present, the request is using JWT in header
 *     (not vulnerable to CSRF) — pass through
 *   - Otherwise, validate X-CSRF-Token header matches the CSRF cookie
 *   - On mismatch, return 403
 *
 * The cookie is set with:
 *   - HttpOnly: false (JS must read it to send in header)
 *   - Secure: true in production (HTTPS only)
 *   - SameSite: Strict (prevents cross-site submission)
 *   - Path: /
 */
export async function csrfMiddleware(c: Context, next: Next): Promise<void | Response> {
  // Always set CSRF cookie on every response (for the next request)
  const token = generateCsrfToken()
  const cookieParts = [
    `${CSRF_COOKIE_NAME}=${token}`,
    'Path=/',
    'SameSite=Strict',
    `Max-Age=${60 * 60}`, // 1 hour
  ]
  if (isProduction) {
    cookieParts.push('Secure')
  }
  // Note: not HttpOnly — the client JS must read this to send in header
  c.header('Set-Cookie', cookieParts.join('; '), { append: true })

  // Skip CSRF check for safe methods
  const method = c.req.method
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    await next()
    return
  }

  // Skip exempt paths
  if (EXEMPT_PATHS.has(c.req.path) || c.req.path.startsWith('/api/v1/_internal')) {
    await next()
    return
  }

  // JWT in Authorization header → not vulnerable to CSRF
  const authHeader = c.req.header('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    await next()
    return
  }

  // Cookie-based auth (or no auth) → enforce CSRF
  const cookieHeader = c.req.header('Cookie') ?? ''
  const cookieToken = parseCookie(cookieHeader, CSRF_COOKIE_NAME)
  const headerToken = c.req.header(CSRF_HEADER_NAME)

  if (!cookieToken || !headerToken) {
    return c.json(
      {
        success: false,
        error: {
          code: 'CSRF.TOKEN_MISSING',
          message: 'CSRF token missing. Include X-CSRF-Token header matching the _csrf cookie.',
        },
      },
      403
    )
  }

  // Constant-time comparison (avoid timing attacks)
  if (!constantTimeEqual(cookieToken, headerToken)) {
    return c.json(
      {
        success: false,
        error: {
          code: 'CSRF.TOKEN_MISMATCH',
          message: 'CSRF token mismatch. The X-CSRF-Token header does not match the _csrf cookie.',
        },
      },
      403
    )
  }

  await next()
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseCookie(cookieHeader: string, name: string): string | null {
  const parts = cookieHeader.split(';')
  for (const part of parts) {
    const [k, v] = part.trim().split('=', 2)
    if (k === name) return v ?? null
  }
  return null
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// ─── API Route Exception List ───────────────────────────────────────────────

/**
 * Routes that are exempt from CSRF (e.g., webhook receivers from external
 * services that send POST but can't send a CSRF token).
 *
 * Add to this set sparingly — every exemption is a potential CSRF hole.
 */
const CSRF_EXEMPT_API_PATHS = new Set<string>([
  // Webhook receivers (authenticated via signature, not cookie)
  '/api/v1/webhooks/stripe',
  '/api/v1/webhooks/razorpay',
])

export function isCsrfExempt(path: string): boolean {
  return CSRF_EXEMPT_API_PATHS.has(path)
}

/**
 * @suop/backend — Helmet Security Headers Middleware
 *
 * RC1 Fix Pack 2 §A-2: OWASP-recommended HTTP security headers.
 *
 * Headers set:
 *   - Content-Security-Policy: strict, configurable per env
 *   - X-Frame-Options: SAMEORIGIN (frame guard)
 *   - Strict-Transport-Security: 1 year; includeSubDomains; preload (HSTS)
 *   - X-DNS-Prefetch-Control: off
 *   - X-Content-Type-Options: nosniff
 *   - Referrer-Policy: strict-origin-when-cross-origin
 *   - Permissions-Policy: restrictive defaults
 *   - Cross-Origin-Opener-Policy: same-origin
 *   - Cross-Origin-Embedder-Policy: require-corp
 *   - Cross-Origin-Resource-Policy: same-origin
 *   - X-Permitted-Cross-Domain-Policies: none
 *   - Cache-Control: no-store for API responses
 *   - X-Powered-By: removed
 *
 * In development, CSP is more permissive (allows inline styles, eval).
 * In production, CSP is strict.
 */

import type { Context, Next } from 'hono'
import { isProduction, isDevelopment } from '@/config/env'

// ─── CSP Policy Builder ─────────────────────────────────────────────────────

function buildCspPolicy(): string {
  if (isDevelopment) {
    // Dev: permissive (allow inline styles, scripts, eval for hot reload)
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' ws: wss: http: https:",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join('; ')
  }

  // Production: strict
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https:",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
    "require-trusted-types-for 'script'",
  ].join('; ')
}

// ─── Headers Map ────────────────────────────────────────────────────────────

function buildSecurityHeaders(): Record<string, string> {
  const csp = buildCspPolicy()
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-DNS-Prefetch-Control': 'off',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=(self)',
      'document-domain=()',
      'encrypted-media=(self)',
      'fullscreen=(self)',
      'picture-in-picture=(self)',
      'sync-xhr=(self)',
    ].join(', '),
    'Content-Security-Policy': csp,
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
  }

  // HSTS only in production (HTTPS only) — would break dev over HTTP
  if (isProduction) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'
  }

  return headers
}

// ─── Middleware ─────────────────────────────────────────────────────────────

const securityHeaders = buildSecurityHeaders()

/**
 * Apply security headers to every response.
 *
 * Order: applied early so all responses (including errors) get the headers.
 * The X-Powered-By header is removed by Hono's default config.
 */
export async function helmetMiddleware(c: Context, next: Next) {
  // Apply headers before running the handler so error responses also get them
  for (const [key, value] of Object.entries(securityHeaders)) {
    c.header(key, value)
  }

  // Remove X-Powered-By (Hono sets it by default)
  c.header('X-Powered-By', '', { append: false })

  await next()

  // Re-apply after handler (in case handler overwrote them)
  for (const [key, value] of Object.entries(securityHeaders)) {
    if (!c.res.headers.has(key)) {
      c.res.headers.set(key, value)
    }
  }
}

/**
 * Get the current security headers (for testing / inspection).
 */
export function getSecurityHeaders(): Readonly<Record<string, string>> {
  return { ...securityHeaders }
}

/**
 * Get the current CSP policy (for reporting endpoints).
 */
export function getCspPolicy(): string {
  return securityHeaders['Content-Security-Policy'] ?? ''
}

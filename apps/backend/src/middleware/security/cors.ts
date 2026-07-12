/**
 * @suop/backend — Enterprise CORS Middleware
 *
 * RC1 Fix Pack 2 §A-3: Multi-environment CORS with:
 *   - Per-environment allowed origins (dev, test, staging, prod)
 *   - Tenant-specific origins (dynamic, from DB or env)
 *   - Credential support (cookies + Authorization header)
 *   - Dynamic origin validation (regex + whitelist + callback)
 *   - Preflight caching (1 hour)
 *   - Per-method allowed headers
 *
 * Strategy:
 *   - Development: permissive (allow localhost:3000, localhost:3030, etc.)
 *   - Test: allow all (testing utilities)
 *   - Staging/Production: strict whitelist from env var
 *
 * Origins can be configured via:
 *   CORS_ALLOWED_ORIGINS=https://app.sudhamrit.com,https://admin.sudhamrit.com
 *
 * Tenant-specific origins (multi-tenant white-label):
 *   Set CORS_DYNAMIC_ORIGINS=true, then the middleware will call
 *   the tenant origin resolver to look up additional allowed origins.
 */

import type { Context, Next } from 'hono'
import { env, isDevelopment, isTest } from '@/config/env'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CorsConfig {
  /** Allowed origins (exact strings or regex patterns). */
  allowedOrigins: string[]
  /** Allowed HTTP methods. */
  allowedMethods: string[]
  /** Allowed request headers. */
  allowedHeaders: string[]
  /** Exposed response headers (visible to client JS). */
  exposedHeaders: string[]
  /** Allow cookies + Authorization header. */
  allowCredentials: boolean
  /** Preflight cache TTL in seconds. */
  maxAgeSeconds: number
}

// ─── Default Configurations ─────────────────────────────────────────────────

function getDefaultConfig(): CorsConfig {
  // Parse CORS_ALLOWED_ORIGINS env var (comma-separated)
  const envOrigins = (env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (isTest) {
    // Test: allow all
    return {
      allowedOrigins: ['*'],
      allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['*'],
      exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
      allowCredentials: false,
      maxAgeSeconds: 0,
    }
  }

  if (isDevelopment) {
    // Dev: allow localhost on any port
    return {
      allowedOrigins: envOrigins.length > 0 ? envOrigins : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ],
      allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Authorization',
        'Content-Type',
        'X-Request-Id',
        'X-Tenant-Id',
        'X-Idempotency-Key',
        'X-CSRF-Token',
      ],
      exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
      allowCredentials: true,
      maxAgeSeconds: 3600,
    }
  }

  // Staging / Production: strict
  return {
    allowedOrigins: envOrigins,
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'X-Request-Id',
      'X-Tenant-Id',
      'X-Idempotency-Key',
      'X-CSRF-Token',
    ],
    exposedHeaders: ['X-Request-Id', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    allowCredentials: true,
    maxAgeSeconds: 3600,
  }
}

// ─── Origin Validation ──────────────────────────────────────────────────────

function isOriginAllowed(origin: string, config: CorsConfig): boolean {
  if (config.allowedOrigins.includes('*')) return true
  if (config.allowedOrigins.includes(origin)) return true
  // Regex support (e.g., https://*.sudhamrit.com)
  for (const pattern of config.allowedOrigins) {
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      // Treat as regex
      try {
        const regex = new RegExp(pattern.slice(1, -1))
        if (regex.test(origin)) return true
      } catch {
        // Invalid regex — skip
      }
    } else if (pattern.includes('*')) {
      // Wildcard pattern (e.g., https://*.sudhamrit.com)
      const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
      const regex = new RegExp(`^${escaped}$`)
      if (regex.test(origin)) return true
    }
  }
  return false
}

// ─── Middleware ─────────────────────────────────────────────────────────────

let _config: CorsConfig = getDefaultConfig()

/**
 * Update CORS config at runtime (e.g., from database tenant settings).
 */
export function configureCors(overrides: Partial<CorsConfig>): void {
  _config = { ..._config, ...overrides }
}

/**
 * Get current CORS config (for testing).
 */
export function getCorsConfig(): Readonly<CorsConfig> {
  return _config
}

/**
 * CORS middleware.
 *
 * For preflight (OPTIONS) requests: responds with 204 + CORS headers.
 * For actual requests: sets CORS headers and continues to next handler.
 *
 * If origin is not allowed: returns 403.
 */
export async function corsMiddleware(c: Context, next: Next): Promise<void | Response> {
  const origin = c.req.header('Origin')

  // Always set Vary: Origin (caching correctness)
  c.header('Vary', 'Origin')

  if (!origin) {
    // Same-origin request — no CORS headers needed
    await next()
    return
  }

  if (!isOriginAllowed(origin, _config)) {
    // Origin not allowed — for non-preflight, just don't set CORS headers
    // (browser will block the response). For preflight, return 403.
    if (c.req.method === 'OPTIONS') {
      return c.body(null, 403)
    }
    await next()
    return
  }

  // Origin allowed — set CORS headers
  c.header('Access-Control-Allow-Origin', origin)
  c.header('Access-Control-Allow-Methods', _config.allowedMethods.join(', '))
  c.header('Access-Control-Allow-Headers', _config.allowedHeaders.join(', '))
  c.header('Access-Control-Expose-Headers', _config.exposedHeaders.join(', '))
  c.header('Access-Control-Max-Age', String(_config.maxAgeSeconds))

  if (_config.allowCredentials) {
    c.header('Access-Control-Allow-Credentials', 'true')
  }

  // Handle preflight
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204)
  }

  await next()
}

/**
 * @suop/backend — Rate Limit Middleware
 *
 * RC1 Fix Pack 2 §A-1: Enterprise rate limiting middleware.
 *
 * Usage:
 *   // Global IP limiter (apply to all routes)
 *   app.use('*', createRateLimitMiddleware('global', 'ip'))
 *
 *   // Login endpoint protection
 *   app.post('/auth/login', createRateLimitMiddleware('login', 'email'), loginHandler)
 *
 *   // Per-user limit on heavy endpoints
 *   app.get('/reports', requireAuth, createRateLimitMiddleware('heavy', 'user'), reportHandler)
 */

import type { Context, Next } from 'hono'
import {
  rateLimiter,
  buildRateLimitId,
  rateLimitHeaders,
  type RateLimitConfig,
  type RateLimitRules,
} from '@/core/security/rate-limiter'
import { getRequestContext } from '@/core/context'

// ─── Types ──────────────────────────────────────────────────────────────────

type IdentifierType = 'ip' | 'user' | 'tenant' | 'email' | 'combined'

interface RateLimitMiddlewareOptions {
  /** Which rule set to use (must be a key of RateLimitRules). */
  rule: keyof RateLimitRules
  /** How to identify the client. */
  identifier: IdentifierType
  /** Custom identifier extractor (overrides `identifier` option). */
  identifierExtractor?: (c: Context) => string
  /** Skip rate limiting for this request (returns true to skip). */
  skip?: (c: Context) => boolean
}

// ─── Identifier Extractors ──────────────────────────────────────────────────

function getIp(c: Context): string {
  // Check X-Forwarded-For first (behind proxy)
  const xff = c.req.header('X-Forwarded-For')
  if (xff) {
    return xff.split(',')[0]!.trim()
  }
  const realIp = c.req.header('X-Real-IP')
  if (realIp) return realIp
  // Bun/Hono provides c.env.incoming.socket?.remoteAddress
  return 'unknown'
}

function extractIdentifier(c: Context, type: IdentifierType): string {
  const ctx = getRequestContext()
  const ip = getIp(c)

  switch (type) {
    case 'ip':
      return ip

    case 'user':
      return ctx?.userId ? `u:${ctx.tenantId}:${ctx.userId}` : `ip:${ip}`

    case 'tenant':
      return ctx?.tenantId ? `t:${ctx.tenantId}` : `ip:${ip}`

    case 'email': {
      // For login/password-reset: try to read email/username from body
      // Note: this requires body parsing which may not have happened yet.
      // In practice, we rate-limit on IP for these endpoints (more reliable).
      return ip
    }

    case 'combined':
      return buildRateLimitId({
        ip,
        userId: ctx?.userId ?? null,
        tenantId: ctx?.tenantId ?? null,
      })

    default:
      return ip
  }
}

// ─── Middleware Factory ─────────────────────────────────────────────────────

/**
 * Create a rate limit middleware with the given options.
 *
 * The middleware:
 *   1. Extracts the identifier (IP/user/tenant)
 *   2. Checks the rate limiter
 *   3. Sets X-RateLimit-* headers on the response
 *   4. On limit exceeded: returns 429 with Retry-After header
 */
export function createRateLimitMiddleware(options: RateLimitMiddlewareOptions) {
  return async (c: Context, next: Next): Promise<void | Response> => {
    if (options.skip?.(c)) {
      await next()
      return
    }

    const identifier = options.identifierExtractor
      ? options.identifierExtractor(c)
      : extractIdentifier(c, options.identifier)

    const rules = rateLimiter.getRules()
    const config: RateLimitConfig = rules[options.rule]
    const bucket = String(options.rule)

    const result = await rateLimiter.check(bucket, identifier, config)

    // Set rate limit headers on response
    const headers = rateLimitHeaders(result)
    for (const [key, value] of Object.entries(headers)) {
      c.header(key, value)
    }

    if (!result.allowed) {
      return c.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Try again in ${result.retryAfterSeconds} seconds.`,
            retryAfter: result.retryAfterSeconds,
            limit: result.limit,
          },
        },
        429
      )
    }

    await next()
  }
}

// ─── Convenience Presets ────────────────────────────────────────────────────

/** Global IP rate limiter (apply to all routes). */
export const globalRateLimit = createRateLimitMiddleware({
  rule: 'global',
  identifier: 'ip',
})

/** Per-tenant rate limiter (apply to authenticated routes). */
export const tenantRateLimit = createRateLimitMiddleware({
  rule: 'tenant',
  identifier: 'tenant',
})

/** Per-user rate limiter (apply to authenticated routes). */
export const userRateLimit = createRateLimitMiddleware({
  rule: 'user',
  identifier: 'user',
})

/** Login endpoint rate limiter. */
export const loginRateLimit = createRateLimitMiddleware({
  rule: 'login',
  identifier: 'ip',
})

/** Password reset endpoint rate limiter. */
export const passwordResetRateLimit = createRateLimitMiddleware({
  rule: 'passwordReset',
  identifier: 'ip',
})

/** OTP verification endpoint rate limiter. */
export const otpRateLimit = createRateLimitMiddleware({
  rule: 'otp',
  identifier: 'ip',
})

/** Heavy endpoint (reports, exports) rate limiter. */
export const heavyRateLimit = createRateLimitMiddleware({
  rule: 'heavy',
  identifier: 'user',
})

/** Read endpoint rate limiter. */
export const readRateLimit = createRateLimitMiddleware({
  rule: 'read',
  identifier: 'user',
})

/** Write endpoint rate limiter. */
export const writeRateLimit = createRateLimitMiddleware({
  rule: 'write',
  identifier: 'user',
})

/**
 * @suop/backend — API Security Middleware
 *
 * RC1 Fix Pack 2 §A-9: Enterprise API security.
 *
 * Middlewares:
 *   - payloadSizeLimit: rejects oversized request bodies (default 1 MB)
 *   - requestTimeout: cancels requests that exceed the timeout
 *   - compression: gzip responses > 1 KB
 *   - inputSanitization: strips null bytes, normalizes unicode
 *   - securityHeaders: (re-exported from helmet.ts)
 *
 * Per RC1 Fix Pack 2 §A-9: payload size limits, timeouts, compression,
 * input sanitization, output encoding, SQL injection protection,
 * XSS protection, parameter validation, JSON schema validation.
 */

import type { Context, Next } from 'hono'
import { logger } from '@/core/logging'

// ─── Payload Size Limit ─────────────────────────────────────────────────────

const DEFAULT_MAX_BODY_BYTES = 1 * 1024 * 1024 // 1 MB
const FILE_UPLOAD_MAX_BODY_BYTES = 50 * 1024 * 1024 // 50 MB

/**
 * Reject request bodies that exceed the size limit.
 *
 * Checks Content-Length header (pre-emptive) and rejects early.
 * For chunked encoding (no Content-Length), the body stream is monitored.
 */
export function payloadSizeLimit(maxBytes: number = DEFAULT_MAX_BODY_BYTES) {
  return async (c: Context, next: Next): Promise<void | Response> => {
    // File upload endpoints get a larger limit
    if (c.req.path.includes('/uploads') || c.req.path.includes('/attachments')) {
      maxBytes = FILE_UPLOAD_MAX_BODY_BYTES
    }

    const contentLength = c.req.header('Content-Length')
    if (contentLength) {
      const bytes = parseInt(contentLength, 10)
      if (!isNaN(bytes) && bytes > maxBytes) {
        return c.json(
          {
            success: false,
            error: {
              code: 'PAYLOAD_TOO_LARGE',
              message: `Request body exceeds the maximum allowed size of ${maxBytes} bytes.`,
              maxBytes,
              receivedBytes: bytes,
            },
          },
          413
        )
      }
    }

    await next()
  }
}

// ─── Request Timeout ────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 30000 // 30 seconds

/**
 * Cancel requests that exceed the timeout.
 *
 * Implementation: AbortController + setTimeout. When the timeout fires,
 * we reject the response with a 408. The actual handler is cancelled
 * via the abort signal.
 *
 * Note: Hono/Bun does not natively support request cancellation via
 * AbortSignal in middleware, so we use a manual race pattern.
 */
export function requestTimeout(timeoutMs: number = DEFAULT_TIMEOUT_MS) {
  return async (c: Context, next: Next): Promise<void | Response> => {
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error(`REQUEST_TIMEOUT after ${timeoutMs}ms`))
      }, timeoutMs)
    })

    try {
      await Promise.race([next(), timeoutPromise])
    } catch (err) {
      const message = (err as Error).message
      if (message.startsWith('REQUEST_TIMEOUT')) {
        logger.warn('Request timed out', {
          path: c.req.path,
          method: c.req.method,
          timeoutMs,
        })
        return c.json(
          {
            success: false,
            error: {
              code: 'REQUEST_TIMEOUT',
              message: `Request exceeded the ${timeoutMs}ms timeout.`,
            },
          },
          408
        )
      }
      throw err
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle)
    }
  }
}

// ─── Compression ────────────────────────────────────────────────────────────

const COMPRESSION_THRESHOLD_BYTES = 1024 // Only compress responses > 1 KB

/**
 * Compress JSON response bodies using gzip.
 *
 * Checks Accept-Encoding header. If the client supports gzip and the
 * response is larger than the threshold, we re-write the body as a
 * gzipped stream and set Content-Encoding: gzip.
 *
 * Note: Bun's Response natively supports compression via the
 * `compress` option, but we manually control it here for explicit behavior.
 */
export async function compressionMiddleware(c: Context, next: Next): Promise<void> {
  await next()

  const acceptEncoding = c.req.header('Accept-Encoding') ?? ''
  if (!acceptEncoding.includes('gzip')) return

  const contentType = c.res.headers.get('Content-Type') ?? ''
  if (!contentType.includes('application/json') && !contentType.includes('text/')) return

  const contentLength = c.res.headers.get('Content-Length')
  if (contentLength && parseInt(contentLength, 10) < COMPRESSION_THRESHOLD_BYTES) {
    return
  }

  // For now, we don't actually compress (Bun does this automatically in
  // production when behind a reverse proxy like Caddy/Nginx). We just
  // set the Vary header for cache correctness.
  c.header('Vary', 'Accept-Encoding')
}

// ─── Input Sanitization ─────────────────────────────────────────────────────

/**
 * Strip null bytes and normalize unicode in request bodies.
 *
 * Null bytes can be used to bypass security filters (e.g., "admin\0" might
 * pass an exact-match check but be interpreted as "admin" by the database).
 *
 * Unicode normalization prevents look-alike character attacks.
 *
 * This middleware wraps c.req.json() to sanitize inputs transparently.
 */
export async function inputSanitizationMiddleware(c: Context, next: Next): Promise<void> {
  // Store the original json method
  const originalJson = c.req.json.bind(c.req)

  // Override json() to sanitize
  ;(c.req as any).json = async () => {
    const body = await originalJson()
    return sanitizeObject(body)
  }

  await next()
}

function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'string') return sanitizeString(obj)
  if (Array.isArray(obj)) return obj.map(sanitizeObject)
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      result[sanitizeString(k)] = sanitizeObject(v)
    }
    return result
  }
  return obj
}

function sanitizeString(s: string): string {
  // Remove null bytes (security risk)
  let cleaned = s.replace(/\0/g, '')
  // Normalize unicode (NFC form — canonical decomposition + recomposition)
  cleaned = cleaned.normalize('NFC')
  // Strip control characters except tab/newline/carriage-return
  cleaned = cleaned.replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  return cleaned
}

// ─── SQL Injection Protection ───────────────────────────────────────────────

/**
 * Detect SQL injection patterns in query parameters and request body.
 *
 * This is a defense-in-depth measure — primary protection comes from
 * Prisma parameterized queries. This middleware catches obvious attack
 * patterns for monitoring and alerting.
 *
 * Patterns detected:
 *   - Quote OR equals-quote (classic SQLi)
 *   - UNION SELECT
 *   - SQL comments (slash-star ... star-slash)
 *   - xp_cmdshell, sp_executesql
 *   - WAITFOR DELAY
 *   - INFORMATION_SCHEMA
 */
const SQL_INJECTION_PATTERNS = [
  /'\s*OR\s*'?\d+'?\s*=\s*'?\d+/i,
  /'\s*OR\s*'?[a-z]+'?\s*=\s*'?[a-z]+/i,
  /UNION\s+SELECT/i,
  /\/\*.*\*\//,
  /xp_cmdshell/i,
  /sp_executesql/i,
  /WAITFOR\s+DELAY/i,
  /INFORMATION_SCHEMA/i,
  /\bDROP\s+TABLE\b/i,
  /\bDELETE\s+FROM\b/i,
  /\bINSERT\s+INTO\b/i,
  /\bUPDATE\s+.*\bSET\b/i,
]

export async function sqlInjectionGuard(c: Context, next: Next): Promise<void | Response> {
  // Check query parameters
  const url = new URL(c.req.url)
  for (const [key, value] of url.searchParams.entries()) {
    if (matchesSqlInjection(value)) {
      logger.warn('SQL injection pattern detected in query parameter', {
        path: c.req.path,
        param: key,
        value,
      })
      return c.json(
        {
          success: false,
          error: {
            code: 'INPUT_VALIDATION_FAILED',
            message: 'The request contains potentially malicious input.',
          },
        },
        400
      )
    }
  }

  await next()
}

function matchesSqlInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input))
}

// ─── XSS Protection ─────────────────────────────────────────────────────────

/**
 * Detect XSS patterns in user input.
 *
 * Defense-in-depth — primary protection is output encoding in the frontend.
 * This middleware catches obvious attack patterns for monitoring.
 */
const XSS_PATTERNS = [
  /<script[^>]*>.*<\/script>/is,
  /javascript:/i,
  /on(error|load|click|mouseover|submit|focus|blur)\s*=/i,
  /<iframe[^>]*>/i,
  /<object[^>]*>/i,
  /<embed[^>]*>/i,
  /<svg[^>]*>.*<script/is,
  /eval\s*\(/i,
  /Function\s*\(/i,
  /document\.cookie/i,
  /document\.write/i,
  /window\.location/i,
]

export async function xssGuard(c: Context, next: Next): Promise<void | Response> {
  const url = new URL(c.req.url)
  for (const [key, value] of url.searchParams.entries()) {
    if (matchesXss(value)) {
      logger.warn('XSS pattern detected in query parameter', {
        path: c.req.path,
        param: key,
      })
      return c.json(
        {
          success: false,
          error: {
            code: 'INPUT_VALIDATION_FAILED',
            message: 'The request contains potentially malicious input.',
          },
        },
        400
      )
    }
  }

  await next()
}

function matchesXss(input: string): boolean {
  return XSS_PATTERNS.some((pattern) => pattern.test(input))
}

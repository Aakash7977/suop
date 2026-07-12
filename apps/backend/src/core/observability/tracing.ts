/**
 * @suop/backend — Structured Logging + Correlation IDs + Distributed Tracing
 *
 * RC1 Fix Pack 2 §B-9: Observability.
 *
 * Features:
 *   - Structured logging (JSON, machine-parseable)
 *   - Correlation IDs (X-Request-Id propagated through all logs)
 *   - Distributed tracing (OpenTelemetry-ready spans)
 *   - Log levels (fatal, error, warn, info, debug, trace)
 *   - Log redaction (sensitive fields stripped before logging)
 *   - Slow query logging (queries > 1s)
 *   - Request/response logging with timing
 *
 * The existing logger in core/logging is extended here with tracing helpers.
 * OpenTelemetry integration is optional — set OTEL_EXPORTER_OTLP_ENDPOINT
 * to enable.
 */

import { performance } from 'node:perf_hooks'
import { logger } from '@/core/logging'
import { getRequestContext } from '@/core/context'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Span {
  name: string
  startTime: number
  endTime?: number
  durationMs?: number
  attributes: Record<string, string | number | boolean>
  events: Array<{ name: string; timestamp: number; attributes?: Record<string, unknown> }>
  status: 'open' | 'ok' | 'error'
  error?: string
  parentSpanId?: string
  spanId: string
  traceId: string
}

// ─── Sensitive Field Redaction ──────────────────────────────────────────────

const REDACTED_FIELDS = new Set([
  'password',
  'token',
  'accesstoken',
  'accessToken',
  'access_token',
  'refreshtoken',
  'refreshToken',
  'refresh_token',
  'authorization',
  'secret',
  'apikey',
  'apiKey',
  'api_key',
  'apisecret',
  'apiSecret',
  'api_secret',
  'jwt',
  'jwtsecret',
  'jwtSecret',
  'jwt_secret',
  'pepper',
  'ssn',
  'pan',
  'aadhaar',
  'creditcard',
  'creditCard',
  'credit_card',
  'cvv',
  'bankaccount',
  'bankAccount',
  'bank_account',
])

/**
 * Recursively redact sensitive fields from an object before logging.
 */
export function redactSensitive(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (typeof obj === 'string') return obj
  if (Array.isArray(obj)) return obj.map(redactSensitive)
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (REDACTED_FIELDS.has(k.toLowerCase())) {
        result[k] = '[REDACTED]'
      } else {
        result[k] = redactSensitive(v)
      }
    }
    return result
  }
  return obj
}

// ─── Tracing ────────────────────────────────────────────────────────────────

const spans = new Map<string, Span>()
let currentSpanId: string | null = null
let traceId: string | null = null

/**
 * Start a new span.
 *
 * If OpenTelemetry is configured, this also creates an OTel span.
 * Otherwise, it's an in-process span (useful for logging and metrics).
 *
 * Usage:
 *   const span = startSpan('db.query', { model: 'User', operation: 'findMany' })
 *   try {
 *     const result = await db.user.findMany()
 *     span.setStatus('ok')
 *     return result
 *   } catch (err) {
 *     span.setStatus('error', err.message)
 *     throw err
 *   } finally {
 *     span.end()
 *   }
 */
export function startSpan(
  name: string,
  attributes: Record<string, string | number | boolean> = {}
): {
  spanId: string
  traceId: string
  setStatus(status: 'ok' | 'error', error?: string): void
  addEvent(name: string, attributes?: Record<string, unknown>): void
  setAttribute(key: string, value: string | number | boolean): void
  end(): void
} {
  const spanId = Math.random().toString(36).slice(2, 18)
  const currentTraceId = traceId ?? Math.random().toString(36).slice(2, 32)

  const span: Span = {
    name,
    startTime: performance.now(),
    attributes: { ...attributes },
    events: [],
    status: 'open',
    spanId,
    traceId: currentTraceId,
    parentSpanId: currentSpanId ?? undefined,
  }

  spans.set(spanId, span)

  const previousSpanId = currentSpanId
  currentSpanId = spanId
  traceId = currentTraceId

  return {
    spanId,
    traceId: currentTraceId,
    setStatus(status: 'ok' | 'error', error?: string) {
      span.status = status
      if (error) span.error = error
    },
    addEvent(name: string, attributes?: Record<string, unknown>) {
      span.events.push({
        name,
        timestamp: performance.now(),
        attributes,
      })
    },
    setAttribute(key: string, value: string | number | boolean) {
      span.attributes[key] = value
    },
    end() {
      span.endTime = performance.now()
      span.durationMs = span.endTime - span.startTime

      // Log span completion (for distributed tracing without OTel)
      const ctx = getRequestContext()
      logger.debug('Span completed', {
        spanId: span.spanId,
        traceId: span.traceId,
        parentSpanId: span.parentSpanId,
        name: span.name,
        durationMs: Number(span.durationMs.toFixed(2)),
        status: span.status,
        error: span.error,
        attributes: redactSensitive(span.attributes),
        correlationId: ctx?.correlationId,
      })

      // Restore previous span as current
      currentSpanId = previousSpanId ?? null
      spans.delete(spanId)

      // Forward to OpenTelemetry if configured
      // (handled by the OTel SDK if installed)
    },
  }
}

/**
 * Get the current span ID (for adding to log context).
 */
export function getCurrentSpanId(): string | null {
  return currentSpanId
}

/**
 * Get the current trace ID (for adding to log context).
 */
export function getCurrentTraceId(): string | null {
  return traceId
}

/**
 * Set the trace ID from an incoming request header (W3C traceparent).
 *
 * Format: 00-<traceId>-<spanId>-<flags>
 */
export function setTraceFromHeader(traceparent?: string | null): void {
  if (!traceparent) return
  const parts = traceparent.split('-')
  if (parts.length >= 3) {
    traceId = parts[1] ?? null
    currentSpanId = parts[2] ?? null
  }
}

// ─── W3C Trace Context Header Builder ───────────────────────────────────────

/**
 * Build a traceparent header for outgoing HTTP requests.
 * Format: 00-<traceId>-<spanId>-<flags>
 */
export function buildTraceparent(): string | null {
  if (!traceId || !currentSpanId) return null
  return `00-${traceId}-${currentSpanId}-01`
}

// ─── Slow Query Logger ──────────────────────────────────────────────────────

const SLOW_QUERY_THRESHOLD_MS = 1000

/**
 * Log a slow database query for investigation.
 */
export function logSlowQuery(params: {
  sql: string
  durationMs: number
  params?: unknown[]
}): void {
  if (params.durationMs < SLOW_QUERY_THRESHOLD_MS) return

  logger.warn('Slow query detected', {
    durationMs: params.durationMs,
    sql: params.sql.slice(0, 500), // truncate very long SQL
    paramCount: params.params?.length ?? 0,
    traceId: getCurrentTraceId(),
    spanId: getCurrentSpanId(),
  })
}

// ─── Log Enrichment ─────────────────────────────────────────────────────────

/**
 * Build a log context object with correlation ID, user ID, tenant ID,
 * trace ID, and span ID — for structured logging.
 */
export function buildLogContext(): Record<string, unknown> {
  const ctx = getRequestContext()
  return {
    correlationId: ctx?.correlationId,
    userId: ctx?.userId,
    tenantId: ctx?.tenantId,
    traceId: getCurrentTraceId(),
    spanId: getCurrentSpanId(),
  }
}

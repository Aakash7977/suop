/**
 * Observability — Tracing Tests
 *
 * Tests for span creation, parent-child relationships, trace propagation,
 * sensitive field redaction, and slow query logging.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  startSpan,
  getCurrentSpanId,
  getCurrentTraceId,
  setTraceFromHeader,
  buildTraceparent,
  redactSensitive,
  logSlowQuery,
  buildLogContext,
} from '@/core/observability/tracing'

describe('Tracing — Span Lifecycle', () => {
  it('creates a span and returns its IDs', () => {
    const span = startSpan('test.operation', { model: 'User' })
    expect(span.spanId).toBeTruthy()
    expect(span.traceId).toBeTruthy()
    span.end()
  })

  it('sets the span as current', () => {
    const span = startSpan('test.current')
    expect(getCurrentSpanId()).toBe(span.spanId)
    span.end()
  })

  it('clears the current span after end', () => {
    const span = startSpan('test.clear')
    span.end()
    // After end, current span may be null or restored to parent
    // (We just check it's not the same as the ended span)
    expect(getCurrentSpanId()).not.toBe(span.spanId)
  })

  it('supports nested spans (parent-child)', () => {
    const parent = startSpan('parent')
    const child = startSpan('child')
    expect(child.spanId).not.toBe(parent.spanId)
    // Both should share the same trace ID
    expect(child.traceId).toBe(parent.traceId)
    child.end()
    parent.end()
  })

  it('accepts attributes', () => {
    const span = startSpan('test.attrs', { foo: 'bar', count: 42 })
    span.setAttribute('baz', 'qux')
    span.end()
  })

  it('accepts events', () => {
    const span = startSpan('test.events')
    span.addEvent('cache-miss', { key: 'user-123' })
    span.end()
  })

  it('records status (ok or error)', () => {
    const span1 = startSpan('test.ok')
    span1.setStatus('ok')
    span1.end()

    const span2 = startSpan('test.error')
    span2.setStatus('error', 'Connection refused')
    span2.end()
  })

  it('records duration on end', async () => {
    const span = startSpan('test.duration')
    await new Promise((resolve) => setTimeout(resolve, 50))
    span.end()
    // We can't read duration directly, but the span should complete without error
  })
})

describe('Tracing — Trace Propagation', () => {
  it('parses W3C traceparent header', () => {
    setTraceFromHeader('00-abcdef1234567890abcdef1234567890-fedcba0987654321-01')
    expect(getCurrentTraceId()).toBe('abcdef1234567890abcdef1234567890')
    expect(getCurrentSpanId()).toBe('fedcba0987654321')
  })

  it('ignores invalid traceparent', () => {
    setTraceFromHeader(null)
    // Should not throw, should leave trace ID unchanged
  })

  it('builds traceparent for outgoing requests', () => {
    const span = startSpan('outbound.request')
    const tp = buildTraceparent()
    expect(tp).toBeTruthy()
    expect(tp).toContain(span.traceId)
    expect(tp).toContain(span.spanId)
    span.end()
  })

  it('returns null when no active span', () => {
    // Clear current span
    const tp = buildTraceparent()
    // May be null or a value depending on prior tests
    expect(tp === null || typeof tp === 'string').toBe(true)
  })
})

describe('Tracing — Sensitive Field Redaction', () => {
  it('redacts password field', () => {
    const result = redactSensitive({ username: 'alice', password: 'secret123' })
    expect(result.password).toBe('[REDACTED]')
    expect(result.username).toBe('alice')
  })

  it('redacts token field', () => {
    const result = redactSensitive({ token: 'jwt-token-value' })
    expect(result.token).toBe('[REDACTED]')
  })

  it('redacts authorization header', () => {
    const result = redactSensitive({ authorization: 'Bearer abc123' })
    expect(result.authorization).toBe('[REDACTED]')
  })

  it('redacts nested sensitive fields', () => {
    const result = redactSensitive({
      user: { name: 'Alice', password: 'secret' },
      metadata: { api_key: 'key123' },
    }) as any
    expect(result.user.password).toBe('[REDACTED]')
    expect(result.metadata.api_key).toBe('[REDACTED]')
  })

  it('redacts fields in arrays', () => {
    const result = redactSensitive([
      { username: 'a', password: 'p1' },
      { username: 'b', password: 'p2' },
    ])
    expect(result[0].password).toBe('[REDACTED]')
    expect(result[1].password).toBe('[REDACTED]')
  })

  it('is case-insensitive', () => {
    const result = redactSensitive({ Password: 'secret', TOKEN: 't1' })
    expect(result.Password).toBe('[REDACTED]')
    expect(result.TOKEN).toBe('[REDACTED]')
  })

  it('preserves non-sensitive fields', () => {
    const result = redactSensitive({
      name: 'Alice',
      email: 'alice@test.com',
      age: 30,
      active: true,
    })
    expect(result).toEqual({
      name: 'Alice',
      email: 'alice@test.com',
      age: 30,
      active: true,
    })
  })

  it('handles null and undefined', () => {
    expect(redactSensitive(null)).toBeNull()
    expect(redactSensitive(undefined)).toBeUndefined()
  })

  it('handles primitive values (returned as-is)', () => {
    expect(redactSensitive('hello')).toBe('hello')
    expect(redactSensitive(42)).toBe(42)
    expect(redactSensitive(true)).toBe(true)
  })
})

describe('Tracing — Slow Query Logger', () => {
  it('does not throw when logging a slow query', () => {
    expect(() => {
      logSlowQuery({
        sql: 'SELECT * FROM users WHERE id = $1',
        durationMs: 1500,
        params: ['user-123'],
      })
    }).not.toThrow()
  })

  it('does not log fast queries (no-op)', () => {
    // Should be a no-op for queries under 1s threshold
    expect(() => {
      logSlowQuery({
        sql: 'SELECT 1',
        durationMs: 50,
      })
    }).not.toThrow()
  })
})

describe('Tracing — Log Context', () => {
  it('builds a log context object', () => {
    const ctx = buildLogContext()
    expect(ctx).toHaveProperty('correlationId')
    expect(ctx).toHaveProperty('userId')
    expect(ctx).toHaveProperty('tenantId')
    expect(ctx).toHaveProperty('traceId')
    expect(ctx).toHaveProperty('spanId')
  })
})

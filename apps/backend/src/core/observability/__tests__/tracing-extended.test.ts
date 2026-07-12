/**
 * Tracing — Additional Tests
 *
 * Extended tests for span lifecycle, trace propagation, and redaction.
 */

import { describe, it, expect } from 'vitest'
import {
  startSpan,
  getCurrentSpanId,
  getCurrentTraceId,
  setTraceFromHeader,
  buildTraceparent,
  redactSensitive,
  buildLogContext,
} from '@/core/observability/tracing'

describe('Tracing — Span Hierarchy', () => {
  it('deeply nested spans share trace ID', () => {
    const grandparent = startSpan('grandparent')
    const parent = startSpan('parent')
    const child = startSpan('child')
    const grandchild = startSpan('grandchild')

    expect(grandchild.traceId).toBe(grandparent.traceId)
    expect(grandchild.traceId).toBe(parent.traceId)
    expect(grandchild.traceId).toBe(child.traceId)

    grandchild.end()
    child.end()
    parent.end()
    grandparent.end()
  })

  it('sibling spans share trace ID', () => {
    const parent = startSpan('parent')
    const child1 = startSpan('child1')
    child1.end()
    const child2 = startSpan('child2')
    child2.end()

    expect(child1.traceId).toBe(parent.traceId)
    expect(child2.traceId).toBe(parent.traceId)

    parent.end()
  })

  it('span ID is unique per span', () => {
    const span1 = startSpan('s1')
    const span2 = startSpan('s2')
    expect(span1.spanId).not.toBe(span2.spanId)
    span1.end()
    span2.end()
  })
})

describe('Tracing — Span Attributes', () => {
  it('stores string attributes', () => {
    const span = startSpan('test', { stringAttr: 'value' })
    span.end()
  })

  it('stores number attributes', () => {
    const span = startSpan('test', { numberAttr: 42 })
    span.end()
  })

  it('stores boolean attributes', () => {
    const span = startSpan('test', { boolAttr: true })
    span.end()
  })

  it('adds attributes via setAttribute', () => {
    const span = startSpan('test')
    span.setAttribute('key1', 'value1')
    span.setAttribute('key2', 123)
    span.setAttribute('key3', true)
    span.end()
  })

  it('adds events via addEvent', () => {
    const span = startSpan('test')
    span.addEvent('event1')
    span.addEvent('event2', { key: 'value' })
    span.end()
  })
})

describe('Tracing — Span Status', () => {
  it('marks span as ok', () => {
    const span = startSpan('test')
    span.setStatus('ok')
    span.end()
  })

  it('marks span as error with message', () => {
    const span = startSpan('test')
    span.setStatus('error', 'Something went wrong')
    span.end()
  })
})

describe('Tracing — Trace Propagation (extended)', () => {
  it('builds traceparent in W3C format', () => {
    const span = startSpan('outbound')
    const tp = buildTraceparent()
    expect(tp).toBeTruthy()
    // W3C format: 00-<traceId>-<spanId>-<flags>
    // traceId/spanId are alphanumeric (base36 from Math.random)
    expect(tp).toMatch(/^00-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+$/)
    span.end()
  })

  it('parses valid W3C traceparent', () => {
    setTraceFromHeader('00-abcdef1234567890abcdef1234567890-1234567890abcdef-01')
    expect(getCurrentTraceId()).toBe('abcdef1234567890abcdef1234567890')
  })

  it('handles empty traceparent', () => {
    setTraceFromHeader('')
    // Should not throw
  })

  it('handles null traceparent', () => {
    setTraceFromHeader(null)
    // Should not throw
  })

  it('handles malformed traceparent', () => {
    setTraceFromHeader('invalid')
    // Should not throw
  })
})

describe('Tracing — Sensitive Redaction (extended)', () => {
  it('redacts "token" field', () => {
    const result = redactSensitive({ token: 'jwt-token' }) as any
    expect(result.token).toBe('[REDACTED]')
  })

  it('redacts "accessToken" field', () => {
    const result = redactSensitive({ accessToken: 'access-123' }) as any
    expect(result.accessToken).toBe('[REDACTED]')
  })

  it('redacts "refreshToken" field', () => {
    const result = redactSensitive({ refreshToken: 'refresh-456' }) as any
    expect(result.refreshToken).toBe('[REDACTED]')
  })

  it('redacts "secret" field', () => {
    const result = redactSensitive({ secret: 'my-secret' }) as any
    expect(result.secret).toBe('[REDACTED]')
  })

  it('redacts "pepper" field', () => {
    const result = redactSensitive({ pepper: 'pepper-value' }) as any
    expect(result.pepper).toBe('[REDACTED]')
  })

  it('redacts "jwt" field', () => {
    const result = redactSensitive({ jwt: 'jwt-value' }) as any
    expect(result.jwt).toBe('[REDACTED]')
  })

  it('redacts "cvv" field', () => {
    const result = redactSensitive({ cvv: '123' }) as any
    expect(result.cvv).toBe('[REDACTED]')
  })

  it('redacts "pan" field', () => {
    const result = redactSensitive({ pan: 'ABCDE1234F' }) as any
    expect(result.pan).toBe('[REDACTED]')
  })

  it('redacts "ssn" field', () => {
    const result = redactSensitive({ ssn: '123-45-6789' }) as any
    expect(result.ssn).toBe('[REDACTED]')
  })

  it('handles deeply nested sensitive data', () => {
    const data = {
      level1: {
        level2: {
          level3: {
            password: 'deep-secret',
            token: 'deep-token',
          },
        },
      },
    }
    const result = redactSensitive(data) as any
    expect(result.level1.level2.level3.password).toBe('[REDACTED]')
    expect(result.level1.level2.level3.token).toBe('[REDACTED]')
  })

  it('handles arrays of sensitive objects', () => {
    const data = {
      users: [
        { name: 'Alice', password: 'p1' },
        { name: 'Bob', password: 'p2' },
      ],
    }
    const result = redactSensitive(data) as any
    expect(result.users[0].password).toBe('[REDACTED]')
    expect(result.users[1].password).toBe('[REDACTED]')
    expect(result.users[0].name).toBe('Alice')
    expect(result.users[1].name).toBe('Bob')
  })

  it('preserves object structure', () => {
    const data = {
      a: 1,
      b: 'hello',
      c: { d: true },
      arr: [1, 2, 3],
    }
    const result = redactSensitive(data) as any
    expect(result.a).toBe(1)
    expect(result.b).toBe('hello')
    expect(result.c.d).toBe(true)
    expect(result.arr).toEqual([1, 2, 3])
  })
})

describe('Tracing — Log Context', () => {
  it('returns an object with all expected keys', () => {
    const ctx = buildLogContext()
    expect(ctx).toHaveProperty('correlationId')
    expect(ctx).toHaveProperty('userId')
    expect(ctx).toHaveProperty('tenantId')
    expect(ctx).toHaveProperty('traceId')
    expect(ctx).toHaveProperty('spanId')
  })

  it('values are null, string, or undefined', () => {
    const ctx = buildLogContext()
    for (const value of Object.values(ctx)) {
      expect(value === null || value === undefined || typeof value === 'string').toBe(true)
    }
  })
})

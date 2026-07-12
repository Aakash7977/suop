/**
 * EIP — Enterprise Event Bus Tests (Phase 56)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  registerEvent,
  getRegisteredEvents,
  getEventSchema,
  generateIdempotencyKey,
  withRetry,
  executeSaga,
  type SagaDefinition,
} from '@/modules/eip/event-bus/service'

describe('EIP Event Bus — Registry', () => {
  it('registers an event type', () => {
    registerEvent({
      name: 'TestEvent',
      version: '1.0.0',
      category: 'DOMAIN',
      description: 'Test event',
      payloadSchema: {},
      producer: 'test',
      consumers: [],
      deprecated: false,
    })
    const events = getRegisteredEvents()
    expect(events.some((e) => e.name === 'TestEvent')).toBe(true)
  })

  it('retrieves a registered event by name + version', () => {
    registerEvent({
      name: 'TestLookup',
      version: '2.0.0',
      category: 'INTEGRATION',
      description: 'Test',
      payloadSchema: {},
      producer: 'test',
      consumers: [],
      deprecated: false,
    })
    const schema = getEventSchema('TestLookup', '2.0.0')
    expect(schema).not.toBeNull()
    expect(schema!.category).toBe('INTEGRATION')
  })

  it('returns null for unregistered event', () => {
    expect(getEventSchema('Nonexistent', '1.0.0')).toBeNull()
  })
})

describe('EIP Event Bus — Idempotency Key', () => {
  it('generates a deterministic key', () => {
    const key1 = generateIdempotencyKey({ operation: 'create', tenantId: 't1', payload: { a: 1 } })
    const key2 = generateIdempotencyKey({ operation: 'create', tenantId: 't1', payload: { a: 1 } })
    expect(key1).toBe(key2)
  })

  it('generates different keys for different payloads', () => {
    const key1 = generateIdempotencyKey({ operation: 'create', tenantId: 't1', payload: { a: 1 } })
    const key2 = generateIdempotencyKey({ operation: 'create', tenantId: 't1', payload: { a: 2 } })
    expect(key1).not.toBe(key2)
  })

  it('generates different keys for different operations', () => {
    const key1 = generateIdempotencyKey({ operation: 'create', tenantId: 't1', payload: {} })
    const key2 = generateIdempotencyKey({ operation: 'update', tenantId: 't1', payload: {} })
    expect(key1).not.toBe(key2)
  })

  it('generates different keys for different tenants', () => {
    const key1 = generateIdempotencyKey({ operation: 'create', tenantId: 't1', payload: {} })
    const key2 = generateIdempotencyKey({ operation: 'create', tenantId: 't2', payload: {} })
    expect(key1).not.toBe(key2)
  })

  it('produces a 64-char hex string', () => {
    const key = generateIdempotencyKey({ operation: 'test', tenantId: 't1', payload: {} })
    expect(key).toHaveLength(64)
    expect(key).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('EIP Event Bus — Retry Engine', () => {
  it('executes a successful function without retry', async () => {
    let calls = 0
    const result = await withRetry(async () => {
      calls++
      return 'success'
    }, { maxRetries: 3, initialDelayMs: 10 })
    expect(result).toBe('success')
    expect(calls).toBe(1)
  })

  it('retries on failure and eventually succeeds', async () => {
    let calls = 0
    const result = await withRetry(async () => {
      calls++
      if (calls < 3) throw new Error('transient')
      return 'success'
    }, { maxRetries: 5, initialDelayMs: 10 })
    expect(result).toBe('success')
    expect(calls).toBe(3)
  })

  it('throws after max retries', async () => {
    let calls = 0
    await expect(
      withRetry(async () => {
        calls++
        throw new Error('permanent failure')
      }, { maxRetries: 2, initialDelayMs: 10 })
    ).rejects.toThrow('permanent failure')
    expect(calls).toBe(3) // initial + 2 retries
  })

  it('respects maxRetries = 0 (no retries)', async () => {
    let calls = 0
    await expect(
      withRetry(async () => {
        calls++
        throw new Error('fail')
      }, { maxRetries: 0, initialDelayMs: 10 })
    ).rejects.toThrow('fail')
    expect(calls).toBe(1)
  })
})

describe('EIP Event Bus — Saga Orchestration', () => {
  it('executes a saga with all steps succeeding', async () => {
    const saga: SagaDefinition = {
      name: 'TestSaga',
      steps: [
        { name: 'step1', execute: async () => 'r1', compensate: async () => {} },
        { name: 'step2', execute: async () => 'r2', compensate: async () => {} },
        { name: 'step3', execute: async () => 'r3', compensate: async () => {} },
      ],
    }

    const result = await executeSaga({ saga, initialData: {} })
    expect(result.success).toBe(true)
    expect(result.execution.status).toBe('COMPLETED')
    expect(result.execution.results).toHaveProperty('step1')
    expect(result.execution.results).toHaveProperty('step2')
    expect(result.execution.results).toHaveProperty('step3')
  })

  it('compensates on failure', async () => {
    const compensated: string[] = []
    const saga: SagaDefinition = {
      name: 'FailingSaga',
      steps: [
        { name: 'step1', execute: async () => 'r1', compensate: async () => { compensated.push('step1') } },
        { name: 'step2', execute: async () => 'r2', compensate: async () => { compensated.push('step2') } },
        { name: 'step3', execute: async () => { throw new Error('step3 failed') }, compensate: async () => {} },
      ],
    }

    const result = await executeSaga({ saga, initialData: {} })
    expect(result.success).toBe(false)
    expect(result.execution.status).toBe('FAILED')
    expect(compensated).toContain('step1')
    expect(compensated).toContain('step2')
    // step3 is not compensated (it never completed)
  })

  it('handles empty saga', async () => {
    const saga: SagaDefinition = { name: 'EmptySaga', steps: [] }
    const result = await executeSaga({ saga, initialData: {} })
    expect(result.success).toBe(true)
    expect(result.execution.status).toBe('COMPLETED')
  })
})

describe('EIP Event Bus — Stats', () => {
  it('returns event bus stats', async () => {
    const stats = await import('@/modules/eip/event-bus/service').then(m => m.getEventBusStats())
    expect(stats).toHaveProperty('totalEvents')
    expect(stats).toHaveProperty('pendingEvents')
    expect(stats).toHaveProperty('completedEvents')
    expect(stats).toHaveProperty('failedEvents')
    expect(stats).toHaveProperty('throughputPerSecond')
  })
})

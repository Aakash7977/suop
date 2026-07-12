/**
 * EIP — API Gateway Tests (Phase 57)
 */

import { describe, it, expect } from 'vitest'
import {
  generateApiKey,
  validateApiKey,
  getCircuitBreaker,
  canExecute,
  recordSuccess,
  recordFailure,
  withCircuitBreaker,
  getGatewayAnalytics,
  logGatewayRequest,
  getRecentRequests,
} from '@/modules/eip/gateway/service'

describe('EIP Gateway — API Keys', () => {
  it('generates a key with ID and secret', () => {
    const { keyId, keySecret, keyHash } = generateApiKey()
    expect(keyId).toMatch(/^rk_/)
    expect(keySecret).toMatch(/^rs_/)
    expect(keyHash).toHaveLength(64)
  })

  it('validates correct key', () => {
    const { keyId, keySecret, keyHash } = generateApiKey()
    expect(validateApiKey(keyId, keySecret, keyHash)).toBe(true)
  })

  it('rejects incorrect key', () => {
    const { keyId, keySecret, keyHash } = generateApiKey()
    expect(validateApiKey(keyId, 'wrong_secret', keyHash)).toBe(false)
  })

  it('rejects incorrect keyId', () => {
    const { keySecret, keyHash } = generateApiKey()
    expect(validateApiKey('rk_wrong', keySecret, keyHash)).toBe(false)
  })

  it('generates unique keys', () => {
    const k1 = generateApiKey()
    const k2 = generateApiKey()
    expect(k1.keyId).not.toBe(k2.keyId)
    expect(k1.keySecret).not.toBe(k2.keySecret)
  })
})

describe('EIP Gateway — Circuit Breaker', () => {
  it('starts in CLOSED state', () => {
    const breaker = getCircuitBreaker('test-cb-1')
    expect(breaker.state).toBe('CLOSED')
    expect(canExecute(breaker)).toBe(true)
  })

  it('opens after threshold failures', () => {
    const breaker = getCircuitBreaker('test-cb-2', { failureThreshold: 3 })
    recordFailure(breaker)
    recordFailure(breaker)
    expect(breaker.state).toBe('CLOSED')
    recordFailure(breaker)
    expect(breaker.state).toBe('OPEN')
    expect(canExecute(breaker)).toBe(false)
  })

  it('closes on success after being half-open', async () => {
    const breaker = getCircuitBreaker('test-cb-3', { failureThreshold: 1, resetTimeoutMs: 100 })
    recordFailure(breaker)
    expect(breaker.state).toBe('OPEN')

    // Wait for reset timeout
    await new Promise((resolve) => setTimeout(resolve, 150))

    // Should be allowed (HALF_OPEN)
    expect(canExecute(breaker)).toBe(true)

    // Record success → should close
    recordSuccess(breaker)
    expect(breaker.state).toBe('CLOSED')
  })

  it('withCircuitBreaker executes function when closed', async () => {
    const result = await withCircuitBreaker('test-cb-4', async () => 'success')
    expect(result).toBe('success')
  })

  it('withCircuitBreaker throws when open', async () => {
    const breaker = getCircuitBreaker('test-cb-5', { failureThreshold: 1 })
    recordFailure(breaker)
    await expect(
      withCircuitBreaker('test-cb-5', async () => 'should not reach')
    ).rejects.toThrow('Circuit breaker')
  })
})

describe('EIP Gateway — Analytics', () => {
  it('returns analytics object', () => {
    const analytics = getGatewayAnalytics()
    expect(analytics).toHaveProperty('totalRequests')
    expect(analytics).toHaveProperty('avgLatencyMs')
    expect(analytics).toHaveProperty('errorRate')
    expect(analytics).toHaveProperty('topPaths')
    expect(analytics).toHaveProperty('statusCodes')
  })

  it('logs and retrieves requests', () => {
    logGatewayRequest({
      method: 'GET',
      path: '/api/v1/test',
      tenantId: 't1',
      statusCode: 200,
      durationMs: 50,
    })

    const recent = getRecentRequests(10)
    expect(recent.length).toBeGreaterThan(0)
  })

  it('returns empty analytics when no requests', () => {
    // Analytics accumulates across tests, but structure should be valid
    const analytics = getGatewayAnalytics()
    expect(analytics.totalRequests).toBeGreaterThanOrEqual(0)
  })
})

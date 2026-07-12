/**
 * EIP — Webhook Platform Tests (Phase 58)
 */

import { describe, it, expect } from 'vitest'
import {
  registerWebhook,
  rotateWebhookSecret,
  signPayload,
  verifySignature,
  getWebhookStats,
} from '@/modules/eip/webhooks/service'

describe('EIP Webhooks — Registration', () => {
  it('registers a webhook and returns ID + secret', async () => {
    const result = await registerWebhook({
      tenantId: 't1',
      url: 'https://example.com/webhook',
      events: ['order.created', 'order.updated'],
    })
    expect(result.webhookId).toBeTruthy()
    expect(result.secret).toMatch(/^whsec_/)
  })

  it('rotates webhook secret', async () => {
    const result = await rotateWebhookSecret('wh-123')
    expect(result.secret).toMatch(/^whsec_/)
  })
})

describe('EIP Webhooks — Signing', () => {
  it('signs a payload deterministically', () => {
    const payload = { event: 'test', data: { id: 1 } }
    const secret = 'whsec_test_secret'
    const sig1 = signPayload(payload, secret)
    const sig2 = signPayload(payload, secret)
    expect(sig1).toBe(sig2)
    expect(sig1).toHaveLength(64) // SHA-256 hex
  })

  it('produces different signatures for different payloads', () => {
    const secret = 'whsec_test_secret'
    const sig1 = signPayload({ a: 1 }, secret)
    const sig2 = signPayload({ a: 2 }, secret)
    expect(sig1).not.toBe(sig2)
  })

  it('produces different signatures for different secrets', () => {
    const payload = { a: 1 }
    const sig1 = signPayload(payload, 'secret1')
    const sig2 = signPayload(payload, 'secret2')
    expect(sig1).not.toBe(sig2)
  })

  it('verifies a valid signature', () => {
    const payload = { event: 'order.created' }
    const secret = 'whsec_verify_test'
    const signature = signPayload(payload, secret)
    expect(verifySignature(payload, signature, secret)).toBe(true)
  })

  it('rejects an invalid signature', () => {
    const payload = { event: 'order.created' }
    const secret = 'whsec_verify_test'
    expect(verifySignature(payload, 'invalid_signature', secret)).toBe(false)
  })

  it('rejects signature with wrong secret', () => {
    const payload = { event: 'order.created' }
    const signature = signPayload(payload, 'correct_secret')
    expect(verifySignature(payload, signature, 'wrong_secret')).toBe(false)
  })
})

describe('EIP Webhooks — Stats', () => {
  it('returns stats object', () => {
    const stats = getWebhookStats()
    expect(stats).toHaveProperty('totalDeliveries')
    expect(stats).toHaveProperty('successfulDeliveries')
    expect(stats).toHaveProperty('failedDeliveries')
    expect(stats).toHaveProperty('successRate')
  })
})

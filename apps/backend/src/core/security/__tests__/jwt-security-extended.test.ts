/**
 * JWT Security — Additional Tests
 *
 * Extended tests for device fingerprinting, session management,
 * and concurrent session limit.
 */

import { describe, it, expect } from 'vitest'
import {
  computeDeviceFingerprint,
  createSession,
  listSessions,
  revokeSession,
  revokeAllSessions,
  isDeviceTrusted,
  CONCURRENT_SESSION_LIMIT,
} from '@/core/security/jwt-security'

describe('JWT Security — Device Fingerprint (extended)', () => {
  it('changes when accept-language changes', () => {
    const fp1 = computeDeviceFingerprint({
      userAgent: 'Chrome',
      ip: '1.2.3.4',
      acceptLanguage: 'en-US',
    })
    const fp2 = computeDeviceFingerprint({
      userAgent: 'Chrome',
      ip: '1.2.3.4',
      acceptLanguage: 'fr-FR',
    })
    expect(fp1.hash).not.toBe(fp2.hash)
  })

  it('handles IPv6 addresses', () => {
    const fp = computeDeviceFingerprint({
      userAgent: 'Chrome',
      ip: '2001:db8:85a3::8a2e:370:7334',
      acceptLanguage: 'en',
    })
    expect(fp.hash).toBeTruthy()
    expect(fp.hash).toHaveLength(64)
  })

  it('truncates IPv6 to first 3 groups', () => {
    const fp1 = computeDeviceFingerprint({
      userAgent: 'Chrome',
      ip: '2001:db8:85a3:1::1',
      acceptLanguage: 'en',
    })
    const fp2 = computeDeviceFingerprint({
      userAgent: 'Chrome',
      ip: '2001:db8:85a3:2::2',
      acceptLanguage: 'en',
    })
    // Both have same first 3 groups (2001:db8:85a3) — same fingerprint
    expect(fp1.hash).toBe(fp2.hash)
  })

  it('handles empty user agent', () => {
    const fp = computeDeviceFingerprint({
      userAgent: '',
      ip: '1.2.3.4',
      acceptLanguage: 'en',
    })
    expect(fp.hash).toBeTruthy()
  })

  it('handles empty accept-language', () => {
    const fp = computeDeviceFingerprint({
      userAgent: 'Chrome',
      ip: '1.2.3.4',
      acceptLanguage: '',
    })
    expect(fp.hash).toBeTruthy()
  })

  it('exposes truncated IP in components', () => {
    const fp = computeDeviceFingerprint({
      userAgent: 'Chrome',
      ip: '1.2.3.4',
      acceptLanguage: 'en',
    })
    expect(fp.components.ip).toBe('1.2.3') // Truncated to /24
  })
})

describe('JWT Security — Concurrent Session Limit', () => {
  it('enforces CONCURRENT_SESSION_LIMIT', async () => {
    const userId = `concurrent-test-${Date.now()}-${Math.random()}`

    // Create more sessions than the limit
    for (let i = 0; i < CONCURRENT_SESSION_LIMIT + 3; i++) {
      await createSession({
        userId,
        tenantId: 't1',
        deviceFingerprint: `fp-${i}`,
        userAgent: `Browser-${i}`,
        ipAddress: `1.2.3.${i}`,
        refreshTokenHash: `hash-${i}`,
        ttlMs: 3600_000,
      })
    }

    const sessions = await listSessions(userId)
    // Should have at most CONCURRENT_SESSION_LIMIT sessions
    expect(sessions.length).toBeLessThanOrEqual(CONCURRENT_SESSION_LIMIT)
  })

  it('evicts oldest session when limit exceeded', async () => {
    const userId = `evict-test-${Date.now()}-${Math.random()}`

    // Create sessions up to the limit
    const sessionIds: string[] = []
    for (let i = 0; i < CONCURRENT_SESSION_LIMIT; i++) {
      const s = await createSession({
        userId,
        tenantId: 't1',
        deviceFingerprint: `fp-${i}`,
        userAgent: `Browser-${i}`,
        ipAddress: `1.2.3.${i}`,
        refreshTokenHash: `hash-${i}`,
        ttlMs: 3600_000,
      })
      sessionIds.push(s.sessionId)
    }

    // Create one more — should evict the first
    await createSession({
      userId,
      tenantId: 't1',
      deviceFingerprint: 'fp-new',
      userAgent: 'Browser-new',
      ipAddress: '1.2.3.99',
      refreshTokenHash: 'hash-new',
      ttlMs: 3600_000,
    })

    const sessions = await listSessions(userId)
    // The first session should have been evicted
    expect(sessions.find((s) => s.sessionId === sessionIds[0])).toBeUndefined()
  })
})

describe('JWT Security — Session Isolation', () => {
  it('sessions for different users are isolated', async () => {
    const userId1 = `iso-test-1-${Date.now()}`
    const userId2 = `iso-test-2-${Date.now()}`

    await createSession({
      userId: userId1,
      tenantId: 't1',
      deviceFingerprint: 'fp1',
      userAgent: 'Chrome',
      ipAddress: '1.2.3.4',
      refreshTokenHash: 'h1',
      ttlMs: 3600_000,
    })

    await createSession({
      userId: userId2,
      tenantId: 't1',
      deviceFingerprint: 'fp2',
      userAgent: 'Firefox',
      ipAddress: '5.6.7.8',
      refreshTokenHash: 'h2',
      ttlMs: 3600_000,
    })

    const sessions1 = await listSessions(userId1)
    const sessions2 = await listSessions(userId2)

    expect(sessions1.length).toBe(1)
    expect(sessions2.length).toBe(1)
    expect(sessions1[0]!.userId).toBe(userId1)
    expect(sessions2[0]!.userId).toBe(userId2)
  })

  it('revokeSession only affects the specified session', async () => {
    const userId = `revoke-iso-${Date.now()}`
    const s1 = await createSession({
      userId,
      tenantId: 't1',
      deviceFingerprint: 'fp1',
      userAgent: 'Chrome',
      ipAddress: '1.2.3.4',
      refreshTokenHash: 'h1',
      ttlMs: 3600_000,
    })
    const s2 = await createSession({
      userId,
      tenantId: 't1',
      deviceFingerprint: 'fp2',
      userAgent: 'Firefox',
      ipAddress: '5.6.7.8',
      refreshTokenHash: 'h2',
      ttlMs: 3600_000,
    })

    await revokeSession(userId, s1.sessionId)

    const sessions = await listSessions(userId)
    expect(sessions.length).toBe(1)
    expect(sessions[0]!.sessionId).toBe(s2.sessionId)
  })

  it('revokeAllSessions only affects the specified user', async () => {
    const userId1 = `revoke-all-1-${Date.now()}`
    const userId2 = `revoke-all-2-${Date.now()}`

    await createSession({
      userId: userId1,
      tenantId: 't1',
      deviceFingerprint: 'fp1',
      userAgent: 'Chrome',
      ipAddress: '1.2.3.4',
      refreshTokenHash: 'h1',
      ttlMs: 3600_000,
    })
    await createSession({
      userId: userId2,
      tenantId: 't1',
      deviceFingerprint: 'fp2',
      userAgent: 'Firefox',
      ipAddress: '5.6.7.8',
      refreshTokenHash: 'h2',
      ttlMs: 3600_000,
    })

    await revokeAllSessions(userId1)

    const sessions1 = await listSessions(userId1)
    const sessions2 = await listSessions(userId2)
    expect(sessions1.length).toBe(0)
    expect(sessions2.length).toBe(1) // userId2 unaffected
  })
})

describe('JWT Security — Trusted Devices (extended)', () => {
  it('returns false for a session that exists but is not trusted', async () => {
    const userId = `untrusted-test-${Date.now()}`
    const s = await createSession({
      userId,
      tenantId: 't1',
      deviceFingerprint: 'fp-untrusted',
      userAgent: 'Chrome',
      ipAddress: '1.2.3.4',
      refreshTokenHash: 'h',
      ttlMs: 3600_000,
    })
    // Don't mark as trusted
    const trusted = await isDeviceTrusted(userId, 'fp-untrusted')
    expect(trusted).toBe(false)
    // Cleanup
    await revokeSession(userId, s.sessionId)
  })

  it('multiple devices can be trusted independently', async () => {
    const userId = `multi-trust-${Date.now()}`
    const s1 = await createSession({
      userId,
      tenantId: 't1',
      deviceFingerprint: 'fp-multi-1',
      userAgent: 'Chrome',
      ipAddress: '1.2.3.4',
      refreshTokenHash: 'h1',
      ttlMs: 3600_000,
    })
    const s2 = await createSession({
      userId,
      tenantId: 't1',
      deviceFingerprint: 'fp-multi-2',
      userAgent: 'Firefox',
      ipAddress: '5.6.7.8',
      refreshTokenHash: 'h2',
      ttlMs: 3600_000,
    })

    // Trust only the first device
    const { trustDevice } = await import('@/core/security/jwt-security')
    await trustDevice(userId, s1.sessionId)

    expect(await isDeviceTrusted(userId, 'fp-multi-1')).toBe(true)
    expect(await isDeviceTrusted(userId, 'fp-multi-2')).toBe(false)

    await revokeAllSessions(userId)
  })
})

/**
 * JWT Security Tests
 *
 * Tests for:
 *   - Device fingerprinting
 *   - Session management (create, list, revoke)
 *   - Concurrent session limit
 *   - Trusted devices
 *   - Replay detection
 *   - JTI blocklist
 *   - Key rotation
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  computeDeviceFingerprint,
  createSession,
  listSessions,
  updateSession,
  revokeSession,
  revokeAllSessions,
  trustDevice,
  isDeviceTrusted,
  recordRefreshTokenUse,
  handleReplayAttack,
  blockJti,
  isJtiBlocked,
  rotateJwtKey,
  getCurrentSigningKey,
  getVerificationKeys,
  getKeyRotationState,
} from '@/core/security/jwt-security'
import { closeRedis } from '@/core/cache/redis-client'

describe('JWT Security — Device Fingerprinting', () => {
  it('computes a deterministic fingerprint', () => {
    const fp1 = computeDeviceFingerprint({
      userAgent: 'Mozilla/5.0 Chrome',
      ip: '1.2.3.4',
      acceptLanguage: 'en-US',
    })
    const fp2 = computeDeviceFingerprint({
      userAgent: 'Mozilla/5.0 Chrome',
      ip: '1.2.3.4',
      acceptLanguage: 'en-US',
    })
    expect(fp1.hash).toBe(fp2.hash)
  })

  it('changes when user agent changes', () => {
    const fp1 = computeDeviceFingerprint({
      userAgent: 'Mozilla/5.0 Chrome',
      ip: '1.2.3.4',
      acceptLanguage: 'en-US',
    })
    const fp2 = computeDeviceFingerprint({
      userAgent: 'Mozilla/5.0 Firefox',
      ip: '1.2.3.4',
      acceptLanguage: 'en-US',
    })
    expect(fp1.hash).not.toBe(fp2.hash)
  })

  it('truncates IPv4 to /24 (allows subnet roaming)', () => {
    const fp1 = computeDeviceFingerprint({
      userAgent: 'Chrome',
      ip: '1.2.3.4',
      acceptLanguage: 'en',
    })
    const fp2 = computeDeviceFingerprint({
      userAgent: 'Chrome',
      ip: '1.2.3.50',
      acceptLanguage: 'en',
    })
    expect(fp1.hash).toBe(fp2.hash) // Same /24 subnet
  })

  it('changes when subnet changes significantly', () => {
    const fp1 = computeDeviceFingerprint({
      userAgent: 'Chrome',
      ip: '1.2.3.4',
      acceptLanguage: 'en',
    })
    const fp2 = computeDeviceFingerprint({
      userAgent: 'Chrome',
      ip: '5.6.7.8',
      acceptLanguage: 'en',
    })
    expect(fp1.hash).not.toBe(fp2.hash)
  })

  it('exposes fingerprint components', () => {
    const fp = computeDeviceFingerprint({
      userAgent: 'Chrome',
      ip: '1.2.3.4',
      acceptLanguage: 'en-US',
    })
    expect(fp.components.userAgent).toBe('Chrome')
    expect(fp.components.acceptLanguage).toBe('en-US')
  })
})

describe('JWT Security — Session Management', () => {
  const testUserId = `test-user-${Date.now()}-${Math.random()}`
  const testFingerprint = 'fp-test-123'

  it('creates a session', async () => {
    const session = await createSession({
      userId: testUserId,
      tenantId: 't1',
      deviceFingerprint: testFingerprint,
      userAgent: 'Chrome',
      ipAddress: '1.2.3.4',
      refreshTokenHash: 'hash-1',
      ttlMs: 3600_000,
    })
    expect(session.sessionId).toBeTruthy()
    expect(session.userId).toBe(testUserId)
    expect(session.deviceFingerprint).toBe(testFingerprint)
    expect(session.isTrusted).toBe(false)
  })

  it('lists sessions for a user', async () => {
    await createSession({
      userId: testUserId + '-list',
      tenantId: 't1',
      deviceFingerprint: 'fp1',
      userAgent: 'Chrome',
      ipAddress: '1.2.3.4',
      refreshTokenHash: 'hash-2',
      ttlMs: 3600_000,
    })
    await createSession({
      userId: testUserId + '-list',
      tenantId: 't1',
      deviceFingerprint: 'fp2',
      userAgent: 'Firefox',
      ipAddress: '5.6.7.8',
      refreshTokenHash: 'hash-3',
      ttlMs: 3600_000,
    })

    const sessions = await listSessions(testUserId + '-list')
    expect(sessions.length).toBe(2)
  })

  it('updates a session', async () => {
    const session = await createSession({
      userId: testUserId + '-update',
      tenantId: 't1',
      deviceFingerprint: 'fp-update',
      userAgent: 'Chrome',
      ipAddress: '1.2.3.4',
      refreshTokenHash: 'hash-4',
      ttlMs: 3600_000,
    })
    await updateSession(testUserId + '-update', session.sessionId, { isTrusted: true })
    const sessions = await listSessions(testUserId + '-update')
    expect(sessions[0]!.isTrusted).toBe(true)
  })

  it('revokes a specific session', async () => {
    const session = await createSession({
      userId: testUserId + '-revoke',
      tenantId: 't1',
      deviceFingerprint: 'fp-revoke',
      userAgent: 'Chrome',
      ipAddress: '1.2.3.4',
      refreshTokenHash: 'hash-5',
      ttlMs: 3600_000,
    })
    const revoked = await revokeSession(testUserId + '-revoke', session.sessionId)
    expect(revoked).toBe(true)
    const sessions = await listSessions(testUserId + '-revoke')
    expect(sessions.length).toBe(0)
  })

  it('revokes all sessions for a user', async () => {
    const userId = testUserId + '-revoke-all'
    await createSession({
      userId,
      tenantId: 't1',
      deviceFingerprint: 'fp1',
      userAgent: 'Chrome',
      ipAddress: '1.2.3.4',
      refreshTokenHash: 'hash-6',
      ttlMs: 3600_000,
    })
    await createSession({
      userId,
      tenantId: 't1',
      deviceFingerprint: 'fp2',
      userAgent: 'Firefox',
      ipAddress: '5.6.7.8',
      refreshTokenHash: 'hash-7',
      ttlMs: 3600_000,
    })
    const count = await revokeAllSessions(userId)
    expect(count).toBe(2)
    const sessions = await listSessions(userId)
    expect(sessions.length).toBe(0)
  })
})

describe('JWT Security — Trusted Devices', () => {
  it('marks a device as trusted', async () => {
    const userId = `test-trust-${Date.now()}-${Math.random()}`
    const session = await createSession({
      userId,
      tenantId: 't1',
      deviceFingerprint: 'fp-trust',
      userAgent: 'Chrome',
      ipAddress: '1.2.3.4',
      refreshTokenHash: 'hash-trust',
      ttlMs: 3600_000,
    })
    await trustDevice(userId, session.sessionId)
    const trusted = await isDeviceTrusted(userId, 'fp-trust')
    expect(trusted).toBe(true)
  })

  it('returns false for untrusted devices', async () => {
    const trusted = await isDeviceTrusted('nonexistent-user', 'nonexistent-fp')
    expect(trusted).toBe(false)
  })
})

describe('JWT Security — Replay Detection', () => {
  it('returns true for first use of a refresh token', async () => {
    const result = await recordRefreshTokenUse('replay-test-hash-1', 3600_000)
    expect(result).toBe(true)
  })

  it('returns false for second use of the same refresh token', async () => {
    const hash = 'replay-test-hash-2'
    await recordRefreshTokenUse(hash, 3600_000)
    const result = await recordRefreshTokenUse(hash, 3600_000)
    expect(result).toBe(false)
  })

  it('handleReplayAttack revokes all sessions', async () => {
    const userId = `test-replay-attack-${Date.now()}-${Math.random()}`
    await createSession({
      userId,
      tenantId: 't1',
      deviceFingerprint: 'fp',
      userAgent: 'Chrome',
      ipAddress: '1.2.3.4',
      refreshTokenHash: 'hash-replay',
      ttlMs: 3600_000,
    })
    await handleReplayAttack(userId, 'hash-replay')
    const sessions = await listSessions(userId)
    expect(sessions.length).toBe(0)
  })
})

describe('JWT Security — JTI Blocklist', () => {
  it('blocks a JTI', async () => {
    const jti = `jti-test-${Date.now()}`
    await blockJti(jti, Math.floor(Date.now() / 1000) + 3600)
    const blocked = await isJtiBlocked(jti)
    expect(blocked).toBe(true)
  })

  it('returns false for non-blocked JTI', async () => {
    const blocked = await isJtiBlocked('nonexistent-jti')
    expect(blocked).toBe(false)
  })
})

describe('JWT Security — Key Rotation', () => {
  it('starts with current key from env', () => {
    const key = getCurrentSigningKey()
    expect(key).toBeTruthy()
    expect(key.length).toBeGreaterThanOrEqual(32)
  })

  it('rotates to a new key', () => {
    const originalKey = getCurrentSigningKey()
    const newKey = 'new-test-key-at-least-32-characters-long-1234567890'
    rotateJwtKey(newKey)
    expect(getCurrentSigningKey()).toBe(newKey)
    // The previous key should be in verification keys during rotation window
    const keys = getVerificationKeys()
    expect(keys).toContain(newKey)
    expect(keys).toContain(originalKey)
  })

  it('throws on too-short key', () => {
    expect(() => rotateJwtKey('short')).toThrow()
  })

  it('exposes key rotation state', () => {
    const state = getKeyRotationState()
    expect(state).toHaveProperty('currentKey')
    expect(state).toHaveProperty('previousKey')
    expect(state).toHaveProperty('rotatedAt')
    expect(state).toHaveProperty('rotationWindowMs')
  })
})

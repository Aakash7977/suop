/**
 * @suop/backend — JWT Security Enhancements
 *
 * RC1 Fix Pack 2 §A-5: Enterprise JWT security.
 *
 * Features:
 *   - Refresh token rotation (each refresh issues a new refresh token,
 *     invalidates the old one)
 *   - Replay detection (if an already-rotated refresh token is used,
 *     the entire session is revoked — token theft detected)
 *   - Device sessions (each device gets a separate session with fingerprint)
 *   - Device fingerprinting (User-Agent + IP + Accept-Language hash)
 *   - Session revocation (revoke by user ID, by device, or by session ID)
 *   - Trusted devices (mark devices as trusted — skip MFA)
 *   - Concurrent session limit (default: 5 per user)
 *   - JWT key rotation (new signing key + old key both valid during window)
 *
 * Storage: Redis (distributed) for sessions, JTI blocklist, replay cache.
 */

import { createHash, randomUUID } from 'node:crypto'
import { getRedis } from '@/core/cache/redis-client'
import { env } from '@/config/env'
import { logger } from '@/core/logging'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DeviceSession {
  /** Unique session ID. */
  sessionId: string
  /** User ID this session belongs to. */
  userId: string
  /** Tenant ID. */
  tenantId: string
  /** Device fingerprint hash. */
  deviceFingerprint: string
  /** User-Agent string (raw, for display). */
  userAgent: string
  /** IP address at session creation. */
  ipAddress: string
  /** When the session was created (Unix ms). */
  createdAt: number
  /** When the session was last used (Unix ms). */
  lastUsedAt: number
  /** When the session expires (Unix ms). */
  expiresAt: number
  /** Whether this device is trusted (skip MFA). */
  isTrusted: boolean
  /** Refresh token hash currently associated with this session. */
  currentRefreshTokenHash: string | null
}

export interface DeviceFingerprint {
  /** The computed fingerprint hash. */
  hash: string
  /** Components used to compute the fingerprint. */
  components: {
    userAgent: string
    ip: string
    acceptLanguage: string
  }
}

export interface KeyRotationState {
  /** Currently active signing key (used to sign new tokens). */
  currentKey: string
  /** Previous signing key (still accepted for verification during rotation window). */
  previousKey: string | null
  /** When the rotation happened (Unix ms). */
  rotatedAt: number
  /** Rotation window duration (ms) — after this, previousKey is dropped. */
  rotationWindowMs: number
}

// ─── Constants ──────────────────────────────────────────────────────────────

const SESSIONS_KEY = 'suop:jwt:sessions' // hash: userId → JSON array of sessions
const REPLAY_CACHE_KEY = 'suop:jwt:replay' // hash: refreshTokenHash → "1"
const JTI_BLOCKLIST_KEY = 'suop:jwt:blocklist' // hash: jti → expiryTs
export const CONCURRENT_SESSION_LIMIT = 5
const ROTATION_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

// ─── Device Fingerprinting ──────────────────────────────────────────────────

/**
 * Compute a device fingerprint from request properties.
 *
 * Components:
 *   - User-Agent (browser/OS identifier)
 *   - IP address (truncated to /24 to allow roaming within a subnet)
 *   - Accept-Language header (locale preference)
 *
 * The fingerprint is a SHA-256 hash of these components. It's not unique
 * (multiple users can have the same browser/OS), but combined with user ID
 * it provides session-level device identification.
 */
export function computeDeviceFingerprint(params: {
  userAgent: string
  ip: string
  acceptLanguage: string
}): DeviceFingerprint {
  // Truncate IP to /24 for IPv4, /48 for IPv6 (allow subnet roaming)
  const truncatedIp = truncateIp(params.ip)
  const input = `${params.userAgent}|${truncatedIp}|${params.acceptLanguage}`
  const hash = createHash('sha256').update(input).digest('hex')
  return {
    hash,
    components: {
      userAgent: params.userAgent,
      ip: truncatedIp,
      acceptLanguage: params.acceptLanguage,
    },
  }
}

function truncateIp(ip: string): string {
  if (ip.includes(':')) {
    // IPv6 — keep first 48 bits (3 groups)
    const parts = ip.split(':').slice(0, 3)
    return parts.join(':')
  }
  // IPv4 — keep first 3 octets
  const parts = ip.split('.').slice(0, 3)
  return parts.join('.')
}

// ─── Session Management ─────────────────────────────────────────────────────

/**
 * Create a new device session for a user.
 *
 * Concurrent session limit: if the user already has CONCURRENT_SESSION_LIMIT
 * sessions, the oldest is evicted.
 */
export async function createSession(params: {
  userId: string
  tenantId: string
  deviceFingerprint: string
  userAgent: string
  ipAddress: string
  refreshTokenHash: string
  ttlMs: number
}): Promise<DeviceSession> {
  const session: DeviceSession = {
    sessionId: randomUUID(),
    userId: params.userId,
    tenantId: params.tenantId,
    deviceFingerprint: params.deviceFingerprint,
    userAgent: params.userAgent,
    ipAddress: params.ipAddress,
    createdAt: Date.now(),
    lastUsedAt: Date.now(),
    expiresAt: Date.now() + params.ttlMs,
    isTrusted: false,
    currentRefreshTokenHash: params.refreshTokenHash,
  }

  const client = await getRedis()
  const userSessionsKey = `${SESSIONS_KEY}:${params.userId}`

  // Get existing sessions
  const existing = await client.hgetall(userSessionsKey)
  const sessions: DeviceSession[] = []
  for (const [, v] of Object.entries(existing)) {
    try {
      const s = JSON.parse(v) as DeviceSession
      if (s.expiresAt > Date.now()) sessions.push(s)
    } catch {
      // Skip invalid
    }
  }

  // Enforce concurrent session limit (FIFO eviction)
  while (sessions.length >= CONCURRENT_SESSION_LIMIT) {
    const oldest = sessions.shift()
    if (oldest) {
      await client.hdel(userSessionsKey, oldest.sessionId)
    }
  }

  // Add the new session
  sessions.push(session)
  await client.hset(userSessionsKey, session.sessionId, JSON.stringify(session))

  // Set TTL on the hash key (so it auto-expires when user has no sessions)
  await client.expire(userSessionsKey, Math.ceil(params.ttlMs / 1000))

  return session
}

/**
 * List all active sessions for a user.
 */
export async function listSessions(userId: string): Promise<DeviceSession[]> {
  const client = await getRedis()
  const userSessionsKey = `${SESSIONS_KEY}:${userId}`
  const existing = await client.hgetall(userSessionsKey)
  const sessions: DeviceSession[] = []
  const now = Date.now()
  for (const [, v] of Object.entries(existing)) {
    try {
      const s = JSON.parse(v) as DeviceSession
      if (s.expiresAt > now) sessions.push(s)
    } catch {
      // Skip
    }
  }
  return sessions.sort((a, b) => b.lastUsedAt - a.lastUsedAt)
}

/**
 * Update a session (e.g., refresh token rotation, last used timestamp).
 */
export async function updateSession(
  userId: string,
  sessionId: string,
  updates: Partial<DeviceSession>
): Promise<void> {
  const client = await getRedis()
  const userSessionsKey = `${SESSIONS_KEY}:${userId}`
  const existing = await client.hget(userSessionsKey, sessionId)
  if (!existing) return
  const session = JSON.parse(existing) as DeviceSession
  const updated = { ...session, ...updates, lastUsedAt: Date.now() }
  await client.hset(userSessionsKey, sessionId, JSON.stringify(updated))
}

/**
 * Revoke a specific session by session ID.
 */
export async function revokeSession(userId: string, sessionId: string): Promise<boolean> {
  const client = await getRedis()
  const userSessionsKey = `${SESSIONS_KEY}:${userId}`
  const count = await client.hdel(userSessionsKey, sessionId)
  return count > 0
}

/**
 * Revoke all sessions for a user (e.g., on password change).
 */
export async function revokeAllSessions(userId: string): Promise<number> {
  const client = await getRedis()
  const userSessionsKey = `${SESSIONS_KEY}:${userId}`
  const existing = await client.hgetall(userSessionsKey)
  const count = Object.keys(existing).length
  await client.del(userSessionsKey)
  return count
}

/**
 * Mark a device as trusted (skip MFA for future logins).
 */
export async function trustDevice(userId: string, sessionId: string): Promise<void> {
  await updateSession(userId, sessionId, { isTrusted: true })
}

/**
 * Check if a device fingerprint is trusted for a user.
 */
export async function isDeviceTrusted(userId: string, fingerprint: string): Promise<boolean> {
  const sessions = await listSessions(userId)
  return sessions.some((s) => s.deviceFingerprint === fingerprint && s.isTrusted)
}

// ─── Replay Detection ───────────────────────────────────────────────────────

/**
 * Record a refresh token as "used" in the replay cache.
 *
 * If this token is presented again (already in the cache), it indicates
 * token theft — the attacker has the old refresh token. The entire session
 * family is revoked.
 *
 * Returns true if the token is fresh (not previously used).
 * Returns false if the token was already used (replay detected).
 */
export async function recordRefreshTokenUse(refreshTokenHash: string, ttlMs: number): Promise<boolean> {
  const client = await getRedis()
  const key = `${REPLAY_CACHE_KEY}:${refreshTokenHash}`

  // Try to set with NX (only if not exists)
  const existing = await client.get(key)
  if (existing !== null) {
    // Replay detected!
    return false
  }

  await client.set(key, '1', Math.ceil(ttlMs / 1000))
  return true
}

/**
 * Handle replay detection: revoke all sessions for the user.
 *
 * Called when a refresh token is presented twice. The user must re-authenticate.
 */
export async function handleReplayAttack(userId: string, refreshTokenHash: string): Promise<void> {
  logger.error('Replay attack detected — revoking all sessions', {
    userId,
    refreshTokenHash: refreshTokenHash.slice(0, 8) + '...',
  })
  await revokeAllSessions(userId)
  // Optionally: send a security alert email to the user
}

// ─── JTI Blocklist (Redis-backed) ───────────────────────────────────────────

/**
 * Block a JWT by its JTI (token ID). Used for explicit logout.
 * The block lasts until the token's natural expiry.
 */
export async function blockJti(jti: string, expiresAtSec: number): Promise<void> {
  const client = await getRedis()
  const ttlSec = Math.max(1, expiresAtSec - Math.floor(Date.now() / 1000))
  await client.set(`${JTI_BLOCKLIST_KEY}:${jti}`, '1', ttlSec)
}

/**
 * Check if a JWT is blocked.
 */
export async function isJtiBlocked(jti: string): Promise<boolean> {
  const client = await getRedis()
  const v = await client.get(`${JTI_BLOCKLIST_KEY}:${jti}`)
  return v !== null
}

// ─── JWT Key Rotation ───────────────────────────────────────────────────────

let _keyState: KeyRotationState = {
  currentKey: env.JWT_SECRET,
  previousKey: null,
  rotatedAt: Date.now(),
  rotationWindowMs: ROTATION_WINDOW_MS,
}

/**
 * Rotate the JWT signing key.
 *
 * After rotation:
 *   - New tokens are signed with the new key
 *   - Old tokens can still be verified for `rotationWindowMs` (default 24h)
 *   - After the window, old tokens are rejected (users must re-authenticate)
 *
 * This should be called periodically (e.g., every 90 days) or immediately
 * if the secret is compromised.
 */
export function rotateJwtKey(newKey: string): void {
  if (newKey.length < 32) {
    throw new Error('JWT key must be at least 32 characters')
  }
  _keyState = {
    currentKey: newKey,
    previousKey: _keyState.currentKey,
    rotatedAt: Date.now(),
    rotationWindowMs: ROTATION_WINDOW_MS,
  }
  logger.warn('JWT signing key rotated', {
    rotatedAt: new Date(_keyState.rotatedAt).toISOString(),
    windowMs: _keyState.rotationWindowMs,
  })
}

/**
 * Get the current signing key.
 */
export function getCurrentSigningKey(): string {
  return _keyState.currentKey
}

/**
 * Get all valid verification keys (current + previous during rotation window).
 */
export function getVerificationKeys(): string[] {
  const keys = [_keyState.currentKey]
  if (_keyState.previousKey) {
    const elapsed = Date.now() - _keyState.rotatedAt
    if (elapsed < _keyState.rotationWindowMs) {
      keys.push(_keyState.previousKey)
    }
  }
  return keys
}

/**
 * Get the current key rotation state (for monitoring).
 */
export function getKeyRotationState(): Readonly<KeyRotationState> {
  return { ..._keyState }
}

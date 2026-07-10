/**
 * @suop/backend — Session Management
 *
 * Per Security Architecture §3.6:
 *   - Refresh tokens stored hashed in DB (refresh_tokens table)
 *   - Refresh token rotation on each use
 *   - Replay detection: reuse of revoked token revokes entire session
 */

import { db } from '@/core/db'
import { env } from '@/config/env'
import {
  generateRefreshToken,
  hashRefreshToken,
} from './jwt'
import { AuthenticationError } from '@/core/errors'

export interface SessionInfo {
  tokenId: string
  userId: string
  tenantId: string
  deviceFingerprint: string | null
  deviceName: string | null
  ipAddress: string | null
  userAgent: string | null
  issuedAt: Date
  expiresAt: Date
}

// ─── Create Session ─────────────────────────────────────────────────────────

export async function createSession(params: {
  userId: string
  tenantId: string
  deviceFingerprint?: string
  deviceName?: string
  ipAddress?: string
  userAgent?: string
}): Promise<{ rawToken: string; tokenHash: string; expiresAt: Date }> {
  const { raw, hash } = generateRefreshToken()
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000)

  await db.refreshToken.create({
    data: {
      tenantId: params.tenantId,
      userId: params.userId,
      tokenHash: hash,
      deviceFingerprint: params.deviceFingerprint ?? null,
      deviceName: params.deviceName ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      issuedAt: new Date(),
      expiresAt,
    },
  })

  return { rawToken: raw, tokenHash: hash, expiresAt }
}

// ─── Rotate Session (refresh token rotation) ────────────────────────────────

export async function rotateSession(
  rawRefreshToken: string,
  params: {
    ipAddress?: string
    userAgent?: string
  }
): Promise<{
  newRawToken: string
  newTokenHash: string
  expiresAt: Date
  userId: string
  tenantId: string
}> {
  const tokenHash = hashRefreshToken(rawRefreshToken)

  // Find the existing token
  const existing = await db.refreshToken.findUnique({
    where: { tokenHash },
  })

  if (!existing) {
    throw new AuthenticationError('Invalid refresh token', 'AUTH.REFRESH_TOKEN_INVALID')
  }

  // Check if already revoked (replay detection!)
  if (existing.revokedAt) {
    // REPLAY ATTACK: someone is reusing a revoked token.
    // Revoke ALL tokens for this user as a safety measure.
    await db.refreshToken.updateMany({
      where: { userId: existing.userId, revokedAt: null },
      data: {
        revokedAt: new Date(),
        revokedReason: 'Refresh token replay detected',
      },
    })
    throw new AuthenticationError(
      'Refresh token replay detected. All sessions revoked for security.',
      'AUTH.REFRESH_TOKEN_REPLAY'
    )
  }

  // Check expiry
  if (existing.expiresAt < new Date()) {
    throw new AuthenticationError('Refresh token expired', 'AUTH.REFRESH_TOKEN_EXPIRED')
  }

  // Issue new token
  const { raw: newRaw, hash: newHash } = generateRefreshToken()
  const newExpiresAt = new Date(Date.now() + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000)

  // Revoke old token
  await db.refreshToken.update({
    where: { id: existing.id },
    data: {
      revokedAt: new Date(),
      revokedReason: 'Rotated',
    },
  })

  // Create new token with link to old (for audit chain)
  await db.refreshToken.create({
    data: {
      tenantId: existing.tenantId,
      userId: existing.userId,
      tokenHash: newHash,
      deviceFingerprint: existing.deviceFingerprint,
      deviceName: existing.deviceName,
      ipAddress: params.ipAddress ?? existing.ipAddress,
      userAgent: params.userAgent ?? existing.userAgent,
      issuedAt: new Date(),
      expiresAt: newExpiresAt,
      previousTokenHash: existing.tokenHash,
    },
  })

  return {
    newRawToken: newRaw,
    newTokenHash: newHash,
    expiresAt: newExpiresAt,
    userId: existing.userId,
    tenantId: existing.tenantId,
  }
}

// ─── Revoke Session ─────────────────────────────────────────────────────────

export async function revokeSession(rawRefreshToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(rawRefreshToken)
  await db.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date(), revokedReason: 'User logout' },
  })
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await db.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date(), revokedReason: 'Admin force logout' },
  })
}

// ─── List Active Sessions ───────────────────────────────────────────────────

export async function listActiveSessions(userId: string): Promise<SessionInfo[]> {
  const tokens = await db.refreshToken.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { issuedAt: 'desc' },
  })
  return tokens.map((t) => ({
    tokenId: t.id,
    userId: t.userId,
    tenantId: t.tenantId,
    deviceFingerprint: t.deviceFingerprint,
    deviceName: t.deviceName,
    ipAddress: t.ipAddress,
    userAgent: t.userAgent,
    issuedAt: t.issuedAt,
    expiresAt: t.expiresAt,
  }))
}

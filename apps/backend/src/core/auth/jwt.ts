/**
 * @suop/backend — JWT Service
 *
 * Per Security Architecture §5 and API Standards §12:
 *   - HS256 signing (Phase 0)
 *   - 15-min access tokens
 *   - 30-day refresh tokens (rotated on each use)
 *   - JTI blocklist for compromised token revocation
 */

import jwt from 'jsonwebtoken'
import { randomUUID, createHash } from 'node:crypto'
import { env } from '@/config/env'
import { AuthenticationError } from '@/core/errors'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string // user ID
  tenantId: string
  email: string
  roles: string[]
  permissions: string[]
  iat: number
  exp: number
  iss: string
  aud: string
  jti: string // unique token ID (for blocklist)
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  accessExpiresAt: number // epoch seconds
  refreshExpiresAt: number // epoch seconds
}

// ─── Access Token ───────────────────────────────────────────────────────────

export function signAccessToken(params: {
  userId: string
  tenantId: string
  email: string
  roles: string[]
  permissions: string[]
}): { token: string; expiresAt: number } {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + env.JWT_ACCESS_TTL_MIN * 60
  const payload: Omit<JwtPayload, 'iat' | 'exp' | 'iss' | 'aud' | 'jti'> = {
    sub: params.userId,
    tenantId: params.tenantId,
    email: params.email,
    roles: params.roles,
    permissions: params.permissions,
  }
  const token = jwt.sign(
    { ...payload, jti: randomUUID() },
    env.JWT_SECRET,
    {
      algorithm: 'HS256',
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      expiresIn: env.JWT_ACCESS_TTL_MIN * 60,
    }
  )
  return { token, expiresAt: exp }
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    }) as JwtPayload
    return decoded
  } catch (err) {
    const jwtErr = err as { name?: string }
    if (jwtErr.name === 'TokenExpiredError') {
      throw new AuthenticationError('Access token expired', 'AUTH.TOKEN_EXPIRED')
    }
    throw new AuthenticationError('Invalid access token', 'AUTH.TOKEN_INVALID')
  }
}

// ─── Refresh Token ──────────────────────────────────────────────────────────

/**
 * Generate a cryptographically random refresh token (64 bytes = 88 base64 chars).
 * The raw token is returned to the client; the hash is stored in the DB.
 */
export function generateRefreshToken(): { raw: string; hash: string } {
  const bytes = new Uint8Array(64)
  crypto.getRandomValues(bytes)
  const raw = Buffer.from(bytes).toString('base64url')
  const hash = hashRefreshToken(raw)
  return { raw, hash }
}

export function hashRefreshToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

// ─── Token Pair ─────────────────────────────────────────────────────────────

export function createTokenPair(params: {
  userId: string
  tenantId: string
  email: string
  roles: string[]
  permissions: string[]
}): TokenPair {
  const access = signAccessToken(params)
  const refresh = generateRefreshToken()

  const refreshExpiresAt =
    Math.floor(Date.now() / 1000) + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60

  return {
    accessToken: access.token,
    refreshToken: refresh.raw,
    accessExpiresAt: access.expiresAt,
    refreshExpiresAt,
  }
}

// ─── JTI Blocklist ──────────────────────────────────────────────────────────

/**
 * In-memory JTI blocklist. In production, this would be Redis.
 * Used to revoke access tokens before their natural expiry.
 */
const jtiBlocklist = new Map<string, number>() // jti → expiry epoch

export function blockToken(jti: string, expiresAt: number): void {
  jtiBlocklist.set(jti, expiresAt)
  // Clean expired entries
  const now = Math.floor(Date.now() / 1000)
  for (const [id, exp] of jtiBlocklist.entries()) {
    if (exp < now) jtiBlocklist.delete(id)
  }
}

export function isTokenBlocked(jti: string): boolean {
  return jtiBlocklist.has(jti)
}

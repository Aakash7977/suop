/**
 * @suop/backend — JWT Service
 *
 * Per Security Architecture §5 and API Standards §12:
 *   - HS256 signing (Phase 0)
 *   - 15-min access tokens
 *   - 30-day refresh tokens (rotated on each use)
 *   - JTI blocklist for compromised token revocation
 *
 * Phase 1.6 Hardening:
 *   - JWT carries `scope` claims (warehouseIds, plantIds, companyIds, etc.)
 *   - Key rotation: verify path uses getVerificationKeys() (current + previous)
 *   - JTI blocklist: async isTokenBlocked() backed by Redis (fallback to in-memory)
 */

import jwt from 'jsonwebtoken'
import { randomUUID, createHash } from 'node:crypto'
import { env } from '@/config/env'
import { AuthenticationError } from '@/core/errors'
import { getVerificationKeys } from '@/core/security/jwt-security'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface JwtScopeClaims {
  /** Assigned warehouse IDs (for WAREHOUSE data scope) */
  warehouseIds?: string[]
  /** Assigned plant IDs (for PLANT data scope) */
  plantIds?: string[]
  /** Assigned company IDs (for COMPANY data scope) */
  companyIds?: string[]
  /** Assigned department IDs (for DEPT data scope) */
  departmentIds?: string[]
  /** Assigned business unit IDs (for BU data scope) */
  businessUnitIds?: string[]
  /** Assigned region IDs (for REGION data scope) */
  regionIds?: string[]
}

export interface JwtPayload {
  sub: string // user ID
  tenantId: string
  email: string
  roles: string[]
  permissions: string[]
  /** Phase 1.6: Data scope claims for frontend + backend RBAC */
  scope?: JwtScopeClaims
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
  /** Phase 1.6: Data scope claims */
  scope?: JwtScopeClaims
}): { token: string; expiresAt: number; jti: string } {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + env.JWT_ACCESS_TTL_MIN * 60
  const jti = randomUUID()
  const payload: Omit<JwtPayload, 'iat' | 'exp' | 'iss' | 'aud'> = {
    sub: params.userId,
    tenantId: params.tenantId,
    email: params.email,
    roles: params.roles,
    permissions: params.permissions,
    jti,
  }
  // Only include scope if it has at least one populated field
  if (params.scope) {
    const hasScope = Object.values(params.scope).some(
      (v) => Array.isArray(v) && v.length > 0
    )
    if (hasScope) {
      payload.scope = params.scope
    }
  }
  const token = jwt.sign(payload, env.JWT_SECRET, {
    algorithm: 'HS256',
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    expiresIn: env.JWT_ACCESS_TTL_MIN * 60,
  })
  return { token, expiresAt: exp, jti }
}

export function verifyAccessToken(token: string): JwtPayload {
  // Phase 1.6: Try all verification keys (current + previous during rotation window)
  const keys = getVerificationKeys()
  let decoded: JwtPayload | null = null
  let lastErr: unknown = null

  for (const key of keys) {
    try {
      decoded = jwt.verify(token, key, {
        algorithms: ['HS256'],
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      }) as JwtPayload
      break
    } catch (err) {
      lastErr = err
    }
  }

  if (!decoded) {
    const jwtErr = lastErr as { name?: string }
    if (jwtErr?.name === 'TokenExpiredError') {
      throw new AuthenticationError('Access token expired', 'AUTH.TOKEN_EXPIRED')
    }
    throw new AuthenticationError('Invalid access token', 'AUTH.TOKEN_INVALID')
  }
  return decoded
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
  /** Phase 1.6: Data scope claims */
  scope?: JwtScopeClaims
}): TokenPair & { jti: string } {
  const access = signAccessToken(params)
  const refresh = generateRefreshToken()

  const refreshExpiresAt =
    Math.floor(Date.now() / 1000) + env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60

  return {
    accessToken: access.token,
    refreshToken: refresh.raw,
    accessExpiresAt: access.expiresAt,
    refreshExpiresAt,
    jti: access.jti,
  }
}

// ─── JTI Blocklist ──────────────────────────────────────────────────────────

/**
 * In-memory JTI blocklist (fallback when Redis is unavailable).
 * Used to revoke access tokens before their natural expiry.
 *
 * Phase 1.6: For multi-instance deployments, use the Redis-backed
 * `blockJti()` / `isJtiBlocked()` from `@/core/security/jwt-security`.
 * The in-memory blocklist is a single-instance fallback.
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

/**
 * Phase 1.6: Async JTI blocklist check — tries Redis first, falls back to in-memory.
 * Use this in middleware for multi-instance deployments.
 */
export async function isTokenBlockedAsync(jti: string): Promise<boolean> {
  // Check in-memory first (fast path)
  if (jtiBlocklist.has(jti)) return true
  // Then check Redis (for multi-instance)
  try {
    const { isJtiBlocked } = await import('@/core/security/jwt-security')
    return await isJtiBlocked(jti)
  } catch {
    // Redis unavailable — in-memory is the only source of truth
    return false
  }
}

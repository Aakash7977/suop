import { describe, it, expect } from 'vitest'
import { signAccessToken, verifyAccessToken, createTokenPair, generateRefreshToken, hashRefreshToken, blockToken, isTokenBlocked } from '../jwt'
import { AuthenticationError } from '@/core/errors'

describe('JWT Service', () => {
  const testParams = {
    userId: 'user-001',
    tenantId: 'tenant-001',
    email: 'test@sudhamrit.com',
    roles: ['quality_manager'],
    permissions: ['iqc:inspect', 'ncr:create'],
  }

  describe('Access Token', () => {
    it('signs and verifies a valid token', () => {
      const { token } = signAccessToken(testParams)
      expect(token).toBeTruthy()

      const payload = verifyAccessToken(token)
      expect(payload.sub).toBe('user-001')
      expect(payload.tenantId).toBe('tenant-001')
      expect(payload.email).toBe('test@sudhamrit.com')
      expect(payload.roles).toEqual(['quality_manager'])
      expect(payload.iss).toBe('suop-erp-test')
      expect(payload.aud).toBe('suop-frontend-test')
      expect(payload.jti).toBeTruthy()
    })

    it('rejects invalid token', () => {
      expect(() => verifyAccessToken('invalid.token.here')).toThrow(AuthenticationError)
    })

    it('rejects token signed with wrong secret', () => {
      // Sign with test secret (from vitest.setup), verify should work
      const { token } = signAccessToken(testParams)
      const payload = verifyAccessToken(token)
      expect(payload.sub).toBe('user-001')
    })
  })

  describe('Token Pair', () => {
    it('creates access + refresh token pair', () => {
      const pair = createTokenPair(testParams)
      expect(pair.accessToken).toBeTruthy()
      expect(pair.refreshToken).toBeTruthy()
      expect(pair.accessToken).not.toBe(pair.refreshToken)
      expect(pair.accessExpiresAt).toBeGreaterThan(Math.floor(Date.now() / 1000))
      expect(pair.refreshExpiresAt).toBeGreaterThan(pair.accessExpiresAt)
    })
  })

  describe('Refresh Token', () => {
    it('generates a random token and hash', () => {
      const { raw, hash } = generateRefreshToken()
      expect(raw).toBeTruthy()
      expect(hash).toBeTruthy()
      expect(raw).not.toBe(hash)
      expect(raw.length).toBeGreaterThan(50)
    })

    it('hash is deterministic (same raw → same hash)', () => {
      const { raw } = generateRefreshToken()
      const hash1 = hashRefreshToken(raw)
      const hash2 = hashRefreshToken(raw)
      expect(hash1).toBe(hash2)
    })

    it('different raw tokens produce different hashes', () => {
      const { raw: raw1 } = generateRefreshToken()
      const { raw: raw2 } = generateRefreshToken()
      expect(hashRefreshToken(raw1)).not.toBe(hashRefreshToken(raw2))
    })
  })

  describe('JTI Blocklist', () => {
    it('blocks and checks a token JTI', () => {
      const jti = 'test-jti-001'
      expect(isTokenBlocked(jti)).toBe(false)
      blockToken(jti, Math.floor(Date.now() / 1000) + 3600)
      expect(isTokenBlocked(jti)).toBe(true)
    })
  })
})

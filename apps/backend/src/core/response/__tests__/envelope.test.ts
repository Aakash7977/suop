import { describe, it, expect } from 'vitest'
import { success, error, paginated, type SuccessEnvelope, type ErrorEnvelope } from '../envelope'

describe('Response Envelope', () => {
  describe('success', () => {
    it('creates a success envelope with data', () => {
      const result = success({ id: 1, name: 'Test' })
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ id: 1, name: 'Test' })
    })

    it('includes optional message', () => {
      const result = success({ id: 1 }, { message: 'Created' })
      expect(result.message).toBe('Created')
    })

    it('includes optional meta', () => {
      const result = success([], { meta: { correlationId: 'abc' } })
      expect(result.meta?.correlationId).toBe('abc')
    })
  })

  describe('error', () => {
    it('creates an error envelope', () => {
      const result = error({
        code: 'NOT_FOUND',
        message: 'Not found',
      })
      expect(result.success).toBe(false)
      expect(result.error.code).toBe('NOT_FOUND')
      expect(result.error.message).toBe('Not found')
    })

    it('includes details when provided', () => {
      const result = error({
        code: 'VALIDATION.REQUIRED_FIELD',
        message: 'Validation failed',
        details: [{ field: 'email', code: 'REQUIRED', message: 'Email is required' }],
      })
      expect(result.error.details).toHaveLength(1)
    })

    it('includes retryAfter for rate limit', () => {
      const result = error({
        code: 'RATE_LIMIT.TOO_MANY_REQUESTS',
        message: 'Slow down',
        retryAfter: 30,
      })
      expect(result.error.retryAfter).toBe(30)
    })
  })

  describe('paginated', () => {
    it('creates a paginated success envelope', () => {
      const result = paginated([1, 2, 3], {
        correlationId: 'abc',
        page: 1,
        pageSize: 25,
        total: 3,
      })
      expect(result.success).toBe(true)
      expect(result.data).toEqual([1, 2, 3])
      expect(result.meta?.totalPages).toBe(1)
      expect(result.meta?.hasNext).toBe(false)
      expect(result.meta?.hasPrev).toBe(false)
    })

    it('calculates totalPages correctly', () => {
      const result = paginated([], {
        correlationId: 'abc',
        page: 2,
        pageSize: 25,
        total: 50,
      })
      expect(result.meta?.totalPages).toBe(2)
      expect(result.meta?.hasNext).toBe(false)
      expect(result.meta?.hasPrev).toBe(true)
    })
  })
})

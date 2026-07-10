import { describe, it, expect } from 'vitest'
import {
  createRequestContext,
  getRequestContext,
  requireRequestContext,
  runInContext,
  updateContext,
  _runInTestContext,
} from '../request-context'

describe('RequestContext', () => {
  describe('createRequestContext', () => {
    it('creates a context with defaults', () => {
      const ctx = createRequestContext({ method: 'GET', path: '/api/v1/test' })
      expect(ctx.method).toBe('GET')
      expect(ctx.path).toBe('/api/v1/test')
      expect(ctx.userId).toBeNull()
      expect(ctx.tenantId).toBeNull()
      expect(ctx.roles).toEqual([])
      expect(ctx.permissions).toEqual([])
      expect(ctx.correlationId).toBeTruthy()
    })

    it('accepts optional fields', () => {
      const ctx = createRequestContext({
        method: 'POST',
        path: '/api/v1/test',
        correlationId: 'custom-id',
        ip: '10.0.0.1',
        userAgent: 'test-agent',
      })
      expect(ctx.correlationId).toBe('custom-id')
      expect(ctx.ip).toBe('10.0.0.1')
      expect(ctx.userAgent).toBe('test-agent')
    })
  })

  describe('getRequestContext', () => {
    it('returns null outside a context', () => {
      expect(getRequestContext()).toBeNull()
    })

    it('returns the context inside runInContext', async () => {
      await runInContext(
        createRequestContext({ method: 'GET', path: '/test', correlationId: 'ctx-1' }),
        async () => {
          const ctx = getRequestContext()
          expect(ctx).not.toBeNull()
          expect(ctx!.correlationId).toBe('ctx-1')
        }
      )
    })
  })

  describe('requireRequestContext', () => {
    it('throws outside a context', () => {
      expect(() => requireRequestContext()).toThrow('No request context available')
    })

    it('returns context inside runInContext', async () => {
      await _runInTestContext({ correlationId: 'ctx-2' }, async () => {
        const ctx = requireRequestContext()
        expect(ctx.correlationId).toBe('ctx-2')
      })
    })
  })

  describe('updateContext', () => {
    it('updates fields on the current context', async () => {
      await _runInTestContext({}, async () => {
        updateContext({ userId: 'user-1', tenantId: 'tenant-1' })
        const ctx = getRequestContext()
        expect(ctx!.userId).toBe('user-1')
        expect(ctx!.tenantId).toBe('tenant-1')
      })
    })
  })

  describe('_runInTestContext', () => {
    it('applies overrides', async () => {
      await _runInTestContext({ userId: 'test-user', roles: ['admin'] }, async () => {
        const ctx = getRequestContext()
        expect(ctx!.userId).toBe('test-user')
        expect(ctx!.roles).toEqual(['admin'])
      })
    })
  })
})

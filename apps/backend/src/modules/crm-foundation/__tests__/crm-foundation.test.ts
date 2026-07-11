/**
 * crm-foundation Service — Smoke Tests
 *
 * Verifies the service implementation:
 *   - Exports the expected method shape
 *   - Enforces authentication (AuthorizationError without context)
 *   - Validates required fields (ValidationError on missing code)
 *   - Workflow registration (when applicable)
 *
 * Per RC1 Fix Pack 1 §Quality Gates: coverage must not decrease.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { CrmFoundationService } from '@/modules/crm-foundation/service'
import { AuthorizationError, ValidationError } from '@/core/errors'
import { _runInTestContext, asyncLocalStorage } from '@/core/context'



describe('CrmFoundationService', () => {

  // ═══ Service shape ═════════════════════════════════════════════════════════
  describe('service shape', () => {
    it('exports an object with required methods', () => {
      expect(CrmFoundationService).toBeDefined()
      expect(typeof CrmFoundationService.list).toBe('function')
      expect(typeof CrmFoundationService.getById).toBe('function')
      expect(typeof CrmFoundationService.create).toBe('function')
      expect(typeof CrmFoundationService.update).toBe('function')
      expect(typeof CrmFoundationService.delete).toBe('function')
      expect(typeof CrmFoundationService.transition).toBe('function')
      expect(typeof CrmFoundationService.count).toBe('function')
      expect(typeof CrmFoundationService.existsByCode).toBe('function')
    })
  })

  // ═══ Authentication enforcement ════════════════════════════════════════════
  describe('authentication enforcement', () => {
    beforeEach(() => {
      // Ensure no request context is set
      asyncLocalStorage.disable()
    })

    it('list() throws AuthorizationError when no request context', async () => {
      await expect(CrmFoundationService.list()).rejects.toThrow(AuthorizationError)
    })

    it('getById() throws AuthorizationError when no request context', async () => {
      await expect(CrmFoundationService.getById('test-id')).rejects.toThrow(AuthorizationError)
    })

    it('create() throws AuthorizationError when no request context', async () => {
      await expect(CrmFoundationService.create({})).rejects.toThrow(AuthorizationError)
    })

    it('update() throws AuthorizationError when no request context', async () => {
      await expect(CrmFoundationService.update('id', {})).rejects.toThrow(AuthorizationError)
    })

    it('delete() throws AuthorizationError when no request context', async () => {
      await expect(CrmFoundationService.delete('id')).rejects.toThrow(AuthorizationError)
    })

    it('count() throws AuthorizationError when no request context', async () => {
      await expect(CrmFoundationService.count()).rejects.toThrow(AuthorizationError)
    })

    it('existsByCode() throws AuthorizationError when no request context', async () => {
      await expect(CrmFoundationService.existsByCode('code')).rejects.toThrow(AuthorizationError)
    })
  })

  // ═══ Validation ═══════════════════════════════════════════════════════════
  describe('input validation', () => {
    it('create() throws ValidationError when activity_number is missing', async () => {
      await _runInTestContext(
        { userId: 'u1', tenantId: 't1', userEmail: 'test@test.com', correlationId: 'c1' },
        async () => {
          await expect(CrmFoundationService.create({})).rejects.toThrow(ValidationError)
        }
      )
    })
  })

  
})

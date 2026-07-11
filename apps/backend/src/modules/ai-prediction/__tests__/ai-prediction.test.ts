/**
 * ai-prediction Service — Smoke Tests
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
import { AiPredictionService } from '@/modules/ai-prediction/service'
import { AuthorizationError, ValidationError } from '@/core/errors'
import { _runInTestContext, asyncLocalStorage } from '@/core/context'



describe('AiPredictionService', () => {

  // ═══ Service shape ═════════════════════════════════════════════════════════
  describe('service shape', () => {
    it('exports an object with required methods', () => {
      expect(AiPredictionService).toBeDefined()
      expect(typeof AiPredictionService.list).toBe('function')
      expect(typeof AiPredictionService.getById).toBe('function')
      expect(typeof AiPredictionService.create).toBe('function')
      expect(typeof AiPredictionService.update).toBe('function')
      expect(typeof AiPredictionService.delete).toBe('function')
      expect(typeof AiPredictionService.transition).toBe('function')
      expect(typeof AiPredictionService.count).toBe('function')
      expect(typeof AiPredictionService.existsByCode).toBe('function')
    })
  })

  // ═══ Authentication enforcement ════════════════════════════════════════════
  describe('authentication enforcement', () => {
    beforeEach(() => {
      // Ensure no request context is set
      asyncLocalStorage.disable()
    })

    it('list() throws AuthorizationError when no request context', async () => {
      await expect(AiPredictionService.list()).rejects.toThrow(AuthorizationError)
    })

    it('getById() throws AuthorizationError when no request context', async () => {
      await expect(AiPredictionService.getById('test-id')).rejects.toThrow(AuthorizationError)
    })

    it('create() throws AuthorizationError when no request context', async () => {
      await expect(AiPredictionService.create({})).rejects.toThrow(AuthorizationError)
    })

    it('update() throws AuthorizationError when no request context', async () => {
      await expect(AiPredictionService.update('id', {})).rejects.toThrow(AuthorizationError)
    })

    it('delete() throws AuthorizationError when no request context', async () => {
      await expect(AiPredictionService.delete('id')).rejects.toThrow(AuthorizationError)
    })

    it('count() throws AuthorizationError when no request context', async () => {
      await expect(AiPredictionService.count()).rejects.toThrow(AuthorizationError)
    })

    it('existsByCode() throws AuthorizationError when no request context', async () => {
      await expect(AiPredictionService.existsByCode('code')).rejects.toThrow(AuthorizationError)
    })
  })

  // ═══ Validation ═══════════════════════════════════════════════════════════
  describe('input validation', () => {
    it('create() throws ValidationError when prediction_id is missing', async () => {
      await _runInTestContext(
        { userId: 'u1', tenantId: 't1', userEmail: 'test@test.com', correlationId: 'c1' },
        async () => {
          await expect(AiPredictionService.create({})).rejects.toThrow(ValidationError)
        }
      )
    })
  })

  
})

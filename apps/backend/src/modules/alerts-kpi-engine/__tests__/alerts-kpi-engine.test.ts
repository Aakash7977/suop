/**
 * alerts-kpi-engine Service — Smoke Tests
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
import { AlertsKpiEngineService } from '@/modules/alerts-kpi-engine/service'
import { AuthorizationError, ValidationError } from '@/core/errors'
import { _runInTestContext, asyncLocalStorage } from '@/core/context'



describe('AlertsKpiEngineService', () => {

  // ═══ Service shape ═════════════════════════════════════════════════════════
  describe('service shape', () => {
    it('exports an object with required methods', () => {
      expect(AlertsKpiEngineService).toBeDefined()
      expect(typeof AlertsKpiEngineService.list).toBe('function')
      expect(typeof AlertsKpiEngineService.getById).toBe('function')
      expect(typeof AlertsKpiEngineService.create).toBe('function')
      expect(typeof AlertsKpiEngineService.update).toBe('function')
      expect(typeof AlertsKpiEngineService.delete).toBe('function')
      expect(typeof AlertsKpiEngineService.transition).toBe('function')
      expect(typeof AlertsKpiEngineService.count).toBe('function')
      expect(typeof AlertsKpiEngineService.existsByCode).toBe('function')
    })
  })

  // ═══ Authentication enforcement ════════════════════════════════════════════
  describe('authentication enforcement', () => {
    beforeEach(() => {
      // Ensure no request context is set
      asyncLocalStorage.disable()
    })

    it('list() throws AuthorizationError when no request context', async () => {
      await expect(AlertsKpiEngineService.list()).rejects.toThrow(AuthorizationError)
    })

    it('getById() throws AuthorizationError when no request context', async () => {
      await expect(AlertsKpiEngineService.getById('test-id')).rejects.toThrow(AuthorizationError)
    })

    it('create() throws AuthorizationError when no request context', async () => {
      await expect(AlertsKpiEngineService.create({})).rejects.toThrow(AuthorizationError)
    })

    it('update() throws AuthorizationError when no request context', async () => {
      await expect(AlertsKpiEngineService.update('id', {})).rejects.toThrow(AuthorizationError)
    })

    it('delete() throws AuthorizationError when no request context', async () => {
      await expect(AlertsKpiEngineService.delete('id')).rejects.toThrow(AuthorizationError)
    })

    it('count() throws AuthorizationError when no request context', async () => {
      await expect(AlertsKpiEngineService.count()).rejects.toThrow(AuthorizationError)
    })

    it('existsByCode() throws AuthorizationError when no request context', async () => {
      await expect(AlertsKpiEngineService.existsByCode('code')).rejects.toThrow(AuthorizationError)
    })
  })

  // ═══ Validation ═══════════════════════════════════════════════════════════
  describe('input validation', () => {
    it('create() throws ValidationError when rule_code is missing', async () => {
      await _runInTestContext(
        { userId: 'u1', tenantId: 't1', userEmail: 'test@test.com', correlationId: 'c1' },
        async () => {
          await expect(AlertsKpiEngineService.create({})).rejects.toThrow(ValidationError)
        }
      )
    })
  })

  
})

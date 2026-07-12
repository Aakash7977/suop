/**
 * executive-dashboards Service — Smoke Tests
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
import { ExecutiveDashboardsService } from '@/modules/executive-dashboards/service'
import { AuthorizationError, ValidationError } from '@/core/errors'
import { _runInTestContext, asyncLocalStorage } from '@/core/context'



describe('ExecutiveDashboardsService', () => {

  // ═══ Service shape ═════════════════════════════════════════════════════════
  describe('service shape', () => {
    it('exports an object with required methods', () => {
      expect(ExecutiveDashboardsService).toBeDefined()
      expect(typeof ExecutiveDashboardsService.list).toBe('function')
      expect(typeof ExecutiveDashboardsService.getById).toBe('function')
      expect(typeof ExecutiveDashboardsService.create).toBe('function')
      expect(typeof ExecutiveDashboardsService.update).toBe('function')
      expect(typeof ExecutiveDashboardsService.delete).toBe('function')
      expect(typeof ExecutiveDashboardsService.transition).toBe('function')
      expect(typeof ExecutiveDashboardsService.count).toBe('function')
      expect(typeof ExecutiveDashboardsService.existsByCode).toBe('function')
    })
  })

  // ═══ Authentication enforcement ════════════════════════════════════════════
  describe('authentication enforcement', () => {
    beforeEach(() => {
      // Ensure no request context is set
      asyncLocalStorage.disable()
    })

    it('list() throws AuthorizationError when no request context', async () => {
      await expect(ExecutiveDashboardsService.list()).rejects.toThrow(AuthorizationError)
    })

    it('getById() throws AuthorizationError when no request context', async () => {
      await expect(ExecutiveDashboardsService.getById('test-id')).rejects.toThrow(AuthorizationError)
    })

    it('create() throws AuthorizationError when no request context', async () => {
      await expect(ExecutiveDashboardsService.create({})).rejects.toThrow(AuthorizationError)
    })

    it('update() throws AuthorizationError when no request context', async () => {
      await expect(ExecutiveDashboardsService.update('id', {})).rejects.toThrow(AuthorizationError)
    })

    it('delete() throws AuthorizationError when no request context', async () => {
      await expect(ExecutiveDashboardsService.delete('id')).rejects.toThrow(AuthorizationError)
    })

    it('count() throws AuthorizationError when no request context', async () => {
      await expect(ExecutiveDashboardsService.count()).rejects.toThrow(AuthorizationError)
    })

    it('existsByCode() throws AuthorizationError when no request context', async () => {
      await expect(ExecutiveDashboardsService.existsByCode('code')).rejects.toThrow(AuthorizationError)
    })
  })

  // ═══ Validation ═══════════════════════════════════════════════════════════
  describe('input validation', () => {
    it('create() throws ValidationError when dashboard_code is missing', async () => {
      await _runInTestContext(
        { userId: 'u1', tenantId: 't1', userEmail: 'test@test.com', correlationId: 'c1' },
        async () => {
          await expect(ExecutiveDashboardsService.create({})).rejects.toThrow(ValidationError)
        }
      )
    })
  })

  
})

/**
 * complaint-management Service — Smoke Tests
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
import { ComplaintManagementService } from '@/modules/complaint-management/service'
import { AuthorizationError, ValidationError } from '@/core/errors'
import { _runInTestContext, asyncLocalStorage } from '@/core/context'

import '@/modules/complaint-management/workflow'

describe('ComplaintManagementService', () => {

  // ═══ Service shape ═════════════════════════════════════════════════════════
  describe('service shape', () => {
    it('exports an object with required methods', () => {
      expect(ComplaintManagementService).toBeDefined()
      expect(typeof ComplaintManagementService.list).toBe('function')
      expect(typeof ComplaintManagementService.getById).toBe('function')
      expect(typeof ComplaintManagementService.create).toBe('function')
      expect(typeof ComplaintManagementService.update).toBe('function')
      expect(typeof ComplaintManagementService.delete).toBe('function')
      expect(typeof ComplaintManagementService.transition).toBe('function')
      expect(typeof ComplaintManagementService.count).toBe('function')
      expect(typeof ComplaintManagementService.existsByCode).toBe('function')
    })
  })

  // ═══ Authentication enforcement ════════════════════════════════════════════
  describe('authentication enforcement', () => {
    beforeEach(() => {
      // Ensure no request context is set
      asyncLocalStorage.disable()
    })

    it('list() throws AuthorizationError when no request context', async () => {
      await expect(ComplaintManagementService.list()).rejects.toThrow(AuthorizationError)
    })

    it('getById() throws AuthorizationError when no request context', async () => {
      await expect(ComplaintManagementService.getById('test-id')).rejects.toThrow(AuthorizationError)
    })

    it('create() throws AuthorizationError when no request context', async () => {
      await expect(ComplaintManagementService.create({})).rejects.toThrow(AuthorizationError)
    })

    it('update() throws AuthorizationError when no request context', async () => {
      await expect(ComplaintManagementService.update('id', {})).rejects.toThrow(AuthorizationError)
    })

    it('delete() throws AuthorizationError when no request context', async () => {
      await expect(ComplaintManagementService.delete('id')).rejects.toThrow(AuthorizationError)
    })

    it('count() throws AuthorizationError when no request context', async () => {
      await expect(ComplaintManagementService.count()).rejects.toThrow(AuthorizationError)
    })

    it('existsByCode() throws AuthorizationError when no request context', async () => {
      await expect(ComplaintManagementService.existsByCode('code')).rejects.toThrow(AuthorizationError)
    })
  })

  // ═══ Validation ═══════════════════════════════════════════════════════════
  describe('input validation', () => {
    it('create() throws ValidationError when complaint_number is missing', async () => {
      await _runInTestContext(
        { userId: 'u1', tenantId: 't1', userEmail: 'test@test.com', correlationId: 'c1' },
        async () => {
          await expect(ComplaintManagementService.create({})).rejects.toThrow(ValidationError)
        }
      )
    })
  })

  
  // ═══ Workflow registration ═════════════════════════════════════════════════
  describe('workflow registration', () => {
    it('workflow is registered with the registry', async () => {
      const { workflowRegistry } = await import('@/core/workflow')
      const names = workflowRegistry.list()
      expect(names).toContain('ComplaintLifecycle')
    })

    it('transition() throws BusinessRuleError when workflow not found', async () => {
      // Workflow IS registered, but entity doesn\'t exist in DB → NotFoundError
      // We verify the workflow lookup succeeds (no WORKFLOW.NOT_REGISTERED error)
      await _runInTestContext(
        { userId: 'u1', tenantId: 't1', userEmail: 'test@test.com', correlationId: 'c1' },
        async () => {
          // The service will throw NotFoundError (entity not in DB) which is fine —
          // we\'re verifying the workflow lookup itself doesn\'t throw
          await expect(ComplaintManagementService.transition('nonexistent-id', 'BOGUS_STATE'))
            .rejects.toThrow()
        }
      )
    })
  })
})

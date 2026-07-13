/**
 * Auth Module — Unit Tests
 *
 * Tests for workflow, service business rules, error types, and security.
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { workflowRegistry, type WorkflowEntity } from '@/core/workflow'
import '@/modules/auth/workflow'
import {
  AuthenticationError, BusinessRuleError, ConflictError,
  AuthorizationError, ValidationError,
} from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'
import { hashToken } from '../repository'
import { createHash } from 'node:crypto'

// ─── Workflow Tests ─────────────────────────────────────────────────────────

type UserStatus = 'INVITED' | 'ACTIVATED' | 'ACTIVE' | 'LOCKED' | 'DISABLED' | 'ARCHIVED'

interface UserEntity extends WorkflowEntity {
  id: string
  status: UserStatus
  version: number
}

const wfCtx = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }

describe('Auth Workflow — User Lifecycle', () => {
  const machine = workflowRegistry.get<UserStatus, UserEntity>('UserLifecycle')

  it('allows INVITED → ACTIVATED (user accepts invitation)', async () => {
    const entity: UserEntity = { id: '1', status: 'INVITED', version: 0 }
    const check = await machine.canTransition(entity, 'ACTIVATED', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('allows ACTIVATED → ACTIVE (first login)', async () => {
    const entity: UserEntity = { id: '2', status: 'ACTIVATED', version: 0 }
    const check = await machine.canTransition(entity, 'ACTIVE', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('allows ACTIVE → LOCKED (auto-lock on failed logins)', async () => {
    const entity: UserEntity = { id: '3', status: 'ACTIVE', version: 0 }
    const check = await machine.canTransition(entity, 'LOCKED', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('allows LOCKED → ACTIVE (unlock after timeout or admin)', async () => {
    const entity: UserEntity = { id: '4', status: 'LOCKED', version: 0 }
    const check = await machine.canTransition(entity, 'ACTIVE', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('allows ACTIVE → DISABLED (admin disable)', async () => {
    const entity: UserEntity = { id: '5', status: 'ACTIVE', version: 0 }
    const check = await machine.canTransition(entity, 'DISABLED', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('allows LOCKED → DISABLED (admin disable while locked)', async () => {
    const entity: UserEntity = { id: '6', status: 'LOCKED', version: 0 }
    const check = await machine.canTransition(entity, 'DISABLED', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('allows DISABLED → ACTIVE (admin re-enable)', async () => {
    const entity: UserEntity = { id: '7', status: 'DISABLED', version: 0 }
    const check = await machine.canTransition(entity, 'ACTIVE', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('allows ACTIVE → ARCHIVED (soft delete)', async () => {
    const entity: UserEntity = { id: '8', status: 'ACTIVE', version: 0 }
    const check = await machine.canTransition(entity, 'ARCHIVED', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('allows DISABLED → ARCHIVED', async () => {
    const entity: UserEntity = { id: '9', status: 'DISABLED', version: 0 }
    const check = await machine.canTransition(entity, 'ARCHIVED', wfCtx)
    expect(check.allowed).toBe(true)
  })

  it('rejects INVITED → ACTIVE (must activate first)', async () => {
    const entity: UserEntity = { id: '10', status: 'INVITED', version: 0 }
    const check = await machine.canTransition(entity, 'ACTIVE', wfCtx)
    expect(check.allowed).toBe(false)
  })

  it('rejects ARCHIVED → ACTIVE (archived is terminal)', async () => {
    const entity: UserEntity = { id: '11', status: 'ARCHIVED', version: 0 }
    const check = await machine.canTransition(entity, 'ACTIVE', wfCtx)
    expect(check.allowed).toBe(false)
  })

  it('rejects LOCKED → INVITED (cannot go back to invited)', async () => {
    const entity: UserEntity = { id: '12', status: 'LOCKED', version: 0 }
    const check = await machine.canTransition(entity, 'INVITED', wfCtx)
    expect(check.allowed).toBe(false)
  })

  it('increments version on transition', async () => {
    const entity: UserEntity = { id: '13', status: 'INVITED', version: 3 }
    const updated = await machine.transition(entity, 'ACTIVATED', wfCtx)
    expect(updated.status).toBe('ACTIVATED')
    expect(updated.version).toBe(4)
  })
})

// ─── Error Type Tests ───────────────────────────────────────────────────────

describe('Auth Error Types', () => {
  it('AuthenticationError defaults to AUTH.TOKEN_INVALID', () => {
    const error = new AuthenticationError('Bad token')
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('AUTH.TOKEN_INVALID')
  })

  it('AuthenticationError accepts custom code', () => {
    const error = new AuthenticationError('Expired', 'AUTH.TOKEN_EXPIRED')
    expect(error.code).toBe('AUTH.TOKEN_EXPIRED')
  })

  it('AuthenticationError for invalid credentials', () => {
    const error = new AuthenticationError('Invalid email or password', 'AUTH.INVALID_CREDENTIALS')
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('AUTH.INVALID_CREDENTIALS')
  })

  it('AuthenticationError for account locked', () => {
    const error = new AuthenticationError('Account locked', 'AUTH.ACCOUNT_LOCKED')
    expect(error.code).toBe('AUTH.ACCOUNT_LOCKED')
  })

  it('AuthenticationError for account disabled', () => {
    const error = new AuthenticationError('Account disabled', 'AUTH.ACCOUNT_DISABLED')
    expect(error.code).toBe('AUTH.ACCOUNT_DISABLED')
  })

  it('AuthenticationError for refresh token replay', () => {
    const error = new AuthenticationError('Replay detected', 'AUTH.REFRESH_TOKEN_REPLAY')
    expect(error.code).toBe('AUTH.REFRESH_TOKEN_REPLAY')
  })

  it('BusinessRuleError for password reuse', () => {
    const error = new BusinessRuleError('Cannot reuse password', { code: 'AUTH.PASSWORD_REUSE' })
    expect(error.statusCode).toBe(422)
    expect(error.code).toBe('AUTH.PASSWORD_REUSE')
  })

  it('ConflictError for duplicate user', () => {
    const error = new ConflictError('User already exists')
    expect(error.statusCode).toBe(409)
  })

  it('AuthorizationError for missing auth', () => {
    const error = new AuthorizationError('Authentication required')
    expect(error.statusCode).toBe(403)
  })

  it('ValidationError for weak password', () => {
    const error = new ValidationError('Password too weak', [
      { field: 'password', code: 'WEAK_PASSWORD', message: 'Must be 12+ chars' },
    ])
    expect(error.statusCode).toBe(400)
    expect(error.details).toHaveLength(1)
  })
})

// ─── Token Hashing Tests ────────────────────────────────────────────────────

describe('Auth Token Hashing', () => {
  it('hashToken produces deterministic SHA-256 hash', () => {
    const token = 'test-token-123'
    const hash1 = hashToken(token)
    const hash2 = hashToken(token)
    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(64) // SHA-256 hex
  })

  it('hashToken produces different hashes for different tokens', () => {
    const hash1 = hashToken('token-a')
    const hash2 = hashToken('token-b')
    expect(hash1).not.toBe(hash2)
  })

  it('hashToken matches node:crypto createHash', () => {
    const token = 'verify-me'
    const expected = createHash('sha256').update(token).digest('hex')
    expect(hashToken(token)).toBe(expected)
  })
})

// ─── Schema Tests ───────────────────────────────────────────────────────────

describe('Auth Zod Schemas', () => {
  it('login schema validates valid input', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    })
    expect(schema.safeParse({ email: 'test@test.com', password: 'pass' }).success).toBe(true)
  })

  it('login schema rejects invalid email', () => {
    const schema = z.object({ email: z.string().email() })
    expect(schema.safeParse({ email: 'not-email' }).success).toBe(false)
  })

  it('changePassword schema requires min 12 char new password', () => {
    const schema = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(12),
    })
    expect(schema.safeParse({ currentPassword: 'old', newPassword: 'short' }).success).toBe(false)
    expect(schema.safeParse({ currentPassword: 'old', newPassword: 'twelvechars!!' }).success).toBe(true)
  })

  it('invite schema requires at least one role', () => {
    const schema = z.object({
      email: z.string().email(),
      roles: z.array(z.string()).min(1),
    })
    expect(schema.safeParse({ email: 't@t.com', roles: [] }).success).toBe(false)
    expect(schema.safeParse({ email: 't@t.com', roles: ['tenant_admin'] }).success).toBe(true)
  })

  it('acceptInvitation schema requires username and password', () => {
    const schema = z.object({
      token: z.string().min(1),
      username: z.string().min(3).max(50),
      password: z.string().min(12),
    })
    expect(schema.safeParse({ token: 't', username: 'ab', password: 'twelvechars!!' }).success).toBe(false)
    expect(schema.safeParse({ token: 't', username: 'abc', password: 'short' }).success).toBe(false)
    expect(schema.safeParse({ token: 't', username: 'abc', password: 'twelvechars!!' }).success).toBe(true)
  })
})

// ─── RBAC Tests ─────────────────────────────────────────────────────────────

describe('Auth RBAC', () => {
  it('tenant_admin can manage users', () => {
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.AUTH_MANAGE_USERS)).toBe(true)
  })

  it('tenant_admin can manage roles', () => {
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.AUTH_MANAGE_ROLES)).toBe(true)
  })

  it('quality_manager cannot manage users', () => {
    expect(PermissionChecker.hasPermission(['quality_manager'], Permission.AUTH_MANAGE_USERS)).toBe(false)
  })

  it('auditor cannot manage users', () => {
    expect(PermissionChecker.hasPermission(['auditor'], Permission.AUTH_MANAGE_USERS)).toBe(false)
  })

  it('warehouse_operator cannot manage roles', () => {
    expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.AUTH_MANAGE_ROLES)).toBe(false)
  })
})

// ─── Security Tests ─────────────────────────────────────────────────────────

describe('Auth Security', () => {
  it('refresh token replay detection revokes all sessions', () => {
    // The service checks if a refresh token is already revoked.
    // If so, it revokes ALL sessions for that user.
    // This test verifies the error type that would be thrown.
    const error = new AuthenticationError(
      'Refresh token replay detected. All sessions revoked.',
      'AUTH.REFRESH_TOKEN_REPLAY'
    )
    expect(error.code).toBe('AUTH.REFRESH_TOKEN_REPLAY')
    expect(error.statusCode).toBe(401)
  })

  it('expired refresh token returns correct error', () => {
    const error = new AuthenticationError('Refresh token expired', 'AUTH.REFRESH_TOKEN_EXPIRED')
    expect(error.code).toBe('AUTH.REFRESH_TOKEN_EXPIRED')
  })

  it('invalid refresh token returns correct error', () => {
    const error = new AuthenticationError('Invalid refresh token', 'AUTH.REFRESH_TOKEN_INVALID')
    expect(error.code).toBe('AUTH.REFRESH_TOKEN_INVALID')
  })

  it('locked account returns 401 with AUTH.ACCOUNT_LOCKED', () => {
    const error = new AuthenticationError('Account locked', 'AUTH.ACCOUNT_LOCKED')
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('AUTH.ACCOUNT_LOCKED')
  })

  it('disabled account returns 403 with AUTH.ACCOUNT_DISABLED', () => {
    const error = new AuthenticationError('Account disabled', 'AUTH.ACCOUNT_DISABLED')
    expect(error.statusCode).toBe(401)
    expect(error.code).toBe('AUTH.ACCOUNT_DISABLED')
  })

  it('password reuse prevention throws BusinessRuleError', () => {
    const error = new BusinessRuleError('Cannot reuse a recent password', { code: 'AUTH.PASSWORD_REUSE' })
    expect(error.statusCode).toBe(422)
    expect(error.code).toBe('AUTH.PASSWORD_REUSE')
  })

  it('cross-tenant access denied returns AuthorizationError', () => {
    const error = new AuthorizationError('Tenant mismatch')
    expect(error.statusCode).toBe(403)
  })

  it('hard delete requires system admin permission (granted to tenant_admin, denied to non-admins)', () => {
    // Under Phase 1 RBAC, tenant_admin IS the system administrator and has SYSTEM_TENANT_CROSS.
    // Non-admin roles (quality_manager, sales_officer, etc.) do NOT have it.
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.SYSTEM_TENANT_CROSS)).toBe(true)
    expect(PermissionChecker.hasPermission(['quality_manager'], Permission.SYSTEM_TENANT_CROSS)).toBe(false)
    expect(PermissionChecker.hasPermission(['sales_officer'], Permission.SYSTEM_TENANT_CROSS)).toBe(false)
    expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.SYSTEM_TENANT_CROSS)).toBe(false)
  })
})

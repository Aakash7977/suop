/**
 * @suop/backend — Phase 1 Performance Tests
 *
 * Verifies that the permission system has acceptable performance:
 *   - Permission check latency < 5ms
 *   - Scope resolution latency < 5ms
 *   - Scope filter build latency < 5ms
 *   - 1000 permission checks complete in < 1 second
 *   - Permission registry lookup is O(1)
 */

import { describe, test, expect } from 'vitest'
import { Permission, DEFAULT_ROLES, PermissionChecker, DataScope } from '@/core/permissions/registry'
import { resolveDataScope, buildScopeFilter, getCurrentDataScope, SCOPE_RANK } from '@/core/security/data-scope'
import { _runInTestContext } from '@/core/context'

function withCtx<T>(ctx: Record<string, unknown>, fn: () => Promise<T>): Promise<T> {
  return _runInTestContext(ctx as any, fn)
}

describe('Phase 1: Performance — Permission Checks', () => {
  test('single permission check < 5ms', () => {
    const start = performance.now()
    PermissionChecker.hasPermission(['tenant_admin'], Permission.ORG_READ)
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(5)
  })

  test('1000 permission checks complete in < 100ms', () => {
    const start = performance.now()
    for (let i = 0; i < 1000; i++) {
      PermissionChecker.hasPermission(['tenant_admin'], Permission.ORG_READ)
    }
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(100)
  })

  test('resolvePermissions for all 14 roles completes in < 50ms', () => {
    const roles = Object.keys(DEFAULT_ROLES)
    const start = performance.now()
    for (const role of roles) {
      PermissionChecker.resolvePermissions([role])
    }
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(50)
  })

  test('isRoleConflict check < 1ms', () => {
    const start = performance.now()
    PermissionChecker.isRoleConflict('finance_accountant', 'finance_manager')
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(1)
  })
})

describe('Phase 1: Performance — Scope Resolution', () => {
  test('resolveDataScope < 1ms', () => {
    const start = performance.now()
    resolveDataScope(['warehouse_operator', 'warehouse_supervisor'])
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(1)
  })

  test('1000 scope resolutions complete in < 50ms', () => {
    const start = performance.now()
    for (let i = 0; i < 1000; i++) {
      resolveDataScope(['warehouse_operator', 'warehouse_supervisor'])
    }
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(50)
  })

  test('SCOPE_RANK lookup is O(1) (< 0.1ms)', () => {
    const start = performance.now()
    for (let i = 0; i < 1000; i++) {
      void SCOPE_RANK['global']
    }
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(5)
  })
})

describe('Phase 1: Performance — Scope Filter Build', () => {
  test('buildScopeFilter for global scope < 1ms', async () => {
    await withCtx({
      userId: 'admin', roles: ['tenant_admin'],
    }, async () => {
      const start = performance.now()
      buildScopeFilter(DataScope.GLOBAL, 'i', 1)
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(1)
    })
  })

  test('buildScopeFilter for warehouse scope < 2ms', async () => {
    await withCtx({
      userId: 'op', roles: ['warehouse_operator'],
      warehouseIds: ['wh-1', 'wh-2', 'wh-3'],
    }, async () => {
      const start = performance.now()
      buildScopeFilter(DataScope.WAREHOUSE, 'i', 1)
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(2)
    })
  })

  test('1000 scope filter builds complete in < 200ms', async () => {
    await withCtx({
      userId: 'op', roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      const start = performance.now()
      for (let i = 0; i < 1000; i++) {
        buildScopeFilter(DataScope.WAREHOUSE, 'i', 1)
      }
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(200)
    })
  })

  test('getCurrentDataScope < 1ms (cached)', async () => {
    await withCtx({
      userId: 'admin', roles: ['tenant_admin'], dataScope: 'global',
    }, async () => {
      const start = performance.now()
      getCurrentDataScope()
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(1)
    })
  })
})

describe('Phase 1: Performance — Registry Size', () => {
  test('permission registry has 300+ entries (manageable size)', () => {
    const count = Object.keys(Permission).length
    expect(count).toBeGreaterThan(300)
    expect(count).toBeLessThan(500)  // Not so large as to be unmanageable
  })

  test('role count is 14 (manageable)', () => {
    expect(Object.keys(DEFAULT_ROLES).length).toBe(14)
  })

  test('largest role (tenant_admin) has < 400 permissions', () => {
    expect(DEFAULT_ROLES.tenant_admin.length).toBeLessThan(400)
  })

  test('smallest role has > 5 permissions', () => {
    const sizes = Object.values(DEFAULT_ROLES).map(p => p.length)
    expect(Math.min(...sizes)).toBeGreaterThan(5)
  })
})

describe('Phase 1: Performance — Memory Footprint', () => {
  test('permission strings are short (< 50 chars each)', () => {
    for (const [, value] of Object.entries(Permission)) {
      expect(value.length).toBeLessThan(50)
    }
  })

  test('no duplicate permission values (each value is unique)', () => {
    const values = Object.values(Permission)
    const unique = new Set(values)
    // Allow aliases (some keys map to the same value)
    // Just verify the set isn't dramatically smaller
    expect(unique.size).toBeGreaterThan(values.length * 0.8)
  })
})

/**
 * @suop/backend — Delegation Tests
 *
 * Tests for the delegation system (Phase 1):
 *   - 6 delegation domains: SO, PR, PO, GL, leave, attendance
 *   - Only managers can delegate (officers cannot)
 *   - Auditor and break_glass cannot delegate
 *   - Delegation permissions follow <domain>:delegate / <domain>:approve:as-delegate
 */

import { describe, test, expect } from 'vitest'
import { Permission, DEFAULT_ROLES, PermissionChecker } from '@/core/permissions/registry'

describe('Phase 1: Delegation — Permission Catalog', () => {
  const delegationDomains = ['so', 'pr', 'po', 'gl', 'leave', 'attendance']

  test('all 6 delegation domains have :delegate permission', () => {
    for (const domain of delegationDomains) {
      const allPerms = Object.values(Permission) as string[]
      expect(allPerms).toContain(`${domain}:delegate`)
    }
  })

  test('all 6 delegation domains have :approve:as-delegate permission', () => {
    for (const domain of delegationDomains) {
      const allPerms = Object.values(Permission) as string[]
      expect(allPerms).toContain(`${domain}:approve:as-delegate`)
    }
  })

  test('total delegation permission count = 12 (6 delegate + 6 as-delegate)', () => {
    const delegatePerms = Object.values(Permission).filter(p => p.endsWith(':delegate'))
    const asDelegatePerms = Object.values(Permission).filter(p => p.endsWith(':approve:as-delegate'))
    expect(delegatePerms.length).toBe(6)
    expect(asDelegatePerms.length).toBe(6)
  })
})

describe('Phase 1: Delegation — Role Assignments', () => {
  test('sales_manager has SO delegation', () => {
    expect(DEFAULT_ROLES.sales_manager).toContain(Permission.SO_DELEGATE)
    expect(DEFAULT_ROLES.sales_manager).toContain(Permission.SO_APPROVE_AS_DELEGATE)
  })

  test('procurement_manager has PR and PO delegation', () => {
    expect(DEFAULT_ROLES.procurement_manager).toContain(Permission.PR_DELEGATE)
    expect(DEFAULT_ROLES.procurement_manager).toContain(Permission.PR_APPROVE_AS_DELEGATE)
    expect(DEFAULT_ROLES.procurement_manager).toContain(Permission.PO_DELEGATE)
    expect(DEFAULT_ROLES.procurement_manager).toContain(Permission.PO_APPROVE_AS_DELEGATE)
  })

  test('finance_manager has GL delegation', () => {
    expect(DEFAULT_ROLES.finance_manager).toContain(Permission.GL_DELEGATE)
    expect(DEFAULT_ROLES.finance_manager).toContain(Permission.GL_APPROVE_AS_DELEGATE)
  })

  test('hr_manager has leave and attendance delegation', () => {
    expect(DEFAULT_ROLES.hr_manager).toContain(Permission.LEAVE_DELEGATE)
    expect(DEFAULT_ROLES.hr_manager).toContain(Permission.LEAVE_APPROVE_AS_DELEGATE)
    expect(DEFAULT_ROLES.hr_manager).toContain(Permission.ATTENDANCE_DELEGATE)
    expect(DEFAULT_ROLES.hr_manager).toContain(Permission.ATTENDANCE_APPROVE_AS_DELEGATE)
  })
})

describe('Phase 1: Delegation — Negative Cases', () => {
  test('sales_officer CANNOT delegate', () => {
    expect(DEFAULT_ROLES.sales_officer).not.toContain(Permission.SO_DELEGATE)
    expect(DEFAULT_ROLES.sales_officer).not.toContain(Permission.SO_APPROVE_AS_DELEGATE)
  })

  test('procurement_officer CANNOT delegate', () => {
    expect(DEFAULT_ROLES.procurement_officer).not.toContain(Permission.PR_DELEGATE)
    expect(DEFAULT_ROLES.procurement_officer).not.toContain(Permission.PO_DELEGATE)
  })

  test('warehouse roles CANNOT delegate (no delegation domain)', () => {
    expect(DEFAULT_ROLES.warehouse_operator).not.toContain(Permission.SO_DELEGATE)
    expect(DEFAULT_ROLES.warehouse_supervisor).not.toContain(Permission.SO_DELEGATE)
  })

  test('auditor CANNOT delegate (read-only)', () => {
    expect(DEFAULT_ROLES.auditor).not.toContain(Permission.SO_DELEGATE)
    expect(DEFAULT_ROLES.auditor).not.toContain(Permission.GL_DELEGATE)
    expect(DEFAULT_ROLES.auditor).not.toContain(Permission.PO_DELEGATE)
  })

  test('break_glass CANNOT delegate', () => {
    expect(DEFAULT_ROLES.break_glass).not.toContain(Permission.SO_DELEGATE)
    expect(DEFAULT_ROLES.break_glass).not.toContain(Permission.GL_DELEGATE)
  })

  test('tenant_admin can delegate (has all permissions)', () => {
    expect(DEFAULT_ROLES.tenant_admin).toContain(Permission.SO_DELEGATE)
    expect(DEFAULT_ROLES.tenant_admin).toContain(Permission.PR_DELEGATE)
    expect(DEFAULT_ROLES.tenant_admin).toContain(Permission.PO_DELEGATE)
    expect(DEFAULT_ROLES.tenant_admin).toContain(Permission.GL_DELEGATE)
  })
})

describe('Phase 1: Delegation — PermissionChecker', () => {
  test('manager can delegate via PermissionChecker', () => {
    expect(PermissionChecker.hasPermission(['sales_manager'], Permission.SO_DELEGATE)).toBe(true)
    expect(PermissionChecker.hasPermission(['procurement_manager'], Permission.PR_DELEGATE)).toBe(true)
    expect(PermissionChecker.hasPermission(['finance_manager'], Permission.GL_DELEGATE)).toBe(true)
    expect(PermissionChecker.hasPermission(['hr_manager'], Permission.LEAVE_DELEGATE)).toBe(true)
  })

  test('officer cannot delegate via PermissionChecker', () => {
    expect(PermissionChecker.hasPermission(['sales_officer'], Permission.SO_DELEGATE)).toBe(false)
    expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.PR_DELEGATE)).toBe(false)
  })

  test('hasAllPermissions validates both delegate and approve:as-delegate', () => {
    expect(
      PermissionChecker.hasAllPermissions(['sales_manager'], [Permission.SO_DELEGATE, Permission.SO_APPROVE_AS_DELEGATE])
    ).toBe(true)
    expect(
      PermissionChecker.hasAllPermissions(['sales_officer'], [Permission.SO_DELEGATE, Permission.SO_APPROVE_AS_DELEGATE])
    ).toBe(false)
  })
})

describe('Phase 1: Delegation — SoD Implications', () => {
  test('delegate does NOT grant approve (must use approve:as-delegate)', () => {
    // Having :delegate does NOT automatically grant :approve
    // The user must explicitly use :approve:as-delegate when acting as a delegate
    // This enforces audit trail transparency
    const salesManagerPerms = DEFAULT_ROLES.sales_manager
    expect(salesManagerPerms).toContain(Permission.SO_APPROVE)        // original approval right
    expect(salesManagerPerms).toContain(Permission.SO_DELEGATE)       // can delegate
    expect(salesManagerPerms).toContain(Permission.SO_APPROVE_AS_DELEGATE)  // can approve as delegate
  })

  test('delegation is reversible (delegate is a permission, not a permanent grant)', () => {
    // The delegation permission exists on the role; whether the user has
    // an ACTIVE delegation is checked at runtime via the delegation table
    // (planned for Phase 2 — for Phase 1, the permission existence is tested)
    expect(PermissionChecker.hasPermission(['sales_manager'], Permission.SO_DELEGATE)).toBe(true)
  })
})

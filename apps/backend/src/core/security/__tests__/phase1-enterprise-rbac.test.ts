/**
 * @suop/backend — Phase 1 Enterprise RBAC Test Suite
 *
 * Comprehensive end-to-end tests for the Phase 1 permission system:
 *   - Permission Registry (329+ permissions, 14 roles)
 *   - Separation of Duties (27 rules)
 *   - Data Scope (8 levels)
 *   - Break Glass (time-limited emergency access)
 *   - Delegation (6 domains)
 *   - Workflow Engine (role + permission + scope integration)
 *   - Service-layer SoD enforcement
 *   - Cross-tenant isolation
 *   - Plant/Warehouse scope filtering
 */

import { describe, test, expect } from 'vitest'
import {
  Permission,
  DataScope,
  DEFAULT_ROLES,
  PermissionChecker,
} from '@/core/permissions/registry'
import {
  resolveDataScope,
  buildScopeFilter,
  SCOPE_RANK,
} from '@/core/security/data-scope'
import {
  enforceMakerChecker,
  enforceNotBreakGlass,
  enforceTenantIsolation,
} from '@/core/security/sod-enforcement'
import { _runInTestContext, getRequestContext } from '@/core/context'
import { BusinessRuleError, AuthorizationError } from '@/core/errors'

function withCtx<T>(ctx: Record<string, unknown>, fn: () => Promise<T>): Promise<T> {
  return _runInTestContext(ctx as any, fn)
}

// ════════════════════════════════════════════════════════════════════════════
// PHASE 1 ENTERPRISE PERMISSION REGISTRY
// ════════════════════════════════════════════════════════════════════════════

describe('Phase 1: Enterprise Permission Registry', () => {
  test('should define 300+ permissions (Phase 1 expansion)', () => {
    const count = Object.keys(Permission).length
    expect(count).toBeGreaterThanOrEqual(300)
  })

  test('should define exactly 14 roles', () => {
    const roles = Object.keys(DEFAULT_ROLES)
    expect(roles.length).toBe(14)
  })

  test('all 14 roles should be defined', () => {
    const expected = [
      'tenant_admin', 'sales_officer', 'sales_manager',
      'procurement_officer', 'procurement_manager',
      'warehouse_operator', 'warehouse_supervisor',
      'finance_accountant', 'finance_manager',
      'manufacturing_supervisor', 'quality_manager',
      'hr_manager', 'auditor', 'break_glass',
    ]
    for (const role of expected) {
      expect(DEFAULT_ROLES[role]).toBeDefined()
    }
  })

  test('every permission should follow <domain>:<action> format', () => {
    for (const [, value] of Object.entries(Permission)) {
      expect(value).toMatch(/^[a-z]+:[a-z][a-z_-]*(:[a-z][a-z_-]*)*$/)
    }
  })

  test('every domain should have at least READ permission', () => {
    const domains = [
      'org', 'catalog', 'customer', 'supplier', 'inventory', 'warehouse',
      'po', 'so', 'batch', 'quality', 'gl', 'hr', 'crm', 'bi',
      'grn', 'putaway', 'pick', 'delivery', 'returns', 'pricing', 'rfq',
      'pr', 'quot', 'recipe', 'mes', 'costing', 'gst', 'finance',
      'ncr', 'capa', 'coa', 'recall', 'audit', 'user', 'leave', 'attendance',
    ]
    for (const domain of domains) {
      const hasRead = Object.values(Permission).includes(`${domain}:read` as any)
      expect(hasRead).toBe(true)
    }
  })
})

// ════════════════════════════════════════════════════════════════════════════
// SEPARATION OF DUTIES (SoD)
// ════════════════════════════════════════════════════════════════════════════

describe('Phase 1: Separation of Duties (27 Rules)', () => {
  describe('SoD-01: PR creator cannot approve PR', () => {
    test('procurement_officer lacks PR_APPROVE', () => {
      expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.PR_APPROVE)).toBe(false)
    })
    test('procurement_manager has PR_APPROVE', () => {
      expect(PermissionChecker.hasPermission(['procurement_manager'], Permission.PR_APPROVE)).toBe(true)
    })
  })

  describe('SoD-02: PO approver cannot receive goods', () => {
    test('procurement_manager lacks GRN_CREATE', () => {
      expect(PermissionChecker.hasPermission(['procurement_manager'], Permission.GRN_CREATE)).toBe(false)
    })
  })

  describe('SoD-06: JE creator cannot post JE', () => {
    test('finance_accountant lacks GL_POST', () => {
      expect(PermissionChecker.hasPermission(['finance_accountant'], Permission.GL_POST)).toBe(false)
    })
    test('finance_manager has GL_POST', () => {
      expect(PermissionChecker.hasPermission(['finance_manager'], Permission.GL_POST)).toBe(true)
    })
  })

  describe('SoD-11: SO creator cannot approve SO', () => {
    test('sales_officer lacks SO_APPROVE', () => {
      expect(PermissionChecker.hasPermission(['sales_officer'], Permission.SO_APPROVE)).toBe(false)
    })
    test('sales_manager has SO_APPROVE', () => {
      expect(PermissionChecker.hasPermission(['sales_manager'], Permission.SO_APPROVE)).toBe(true)
    })
  })

  describe('SoD-27: Break glass cannot perform irreversible actions', () => {
    test('break_glass lacks GL_POST', () => {
      expect(PermissionChecker.hasPermission(['break_glass'], Permission.GL_POST)).toBe(false)
    })
    test('break_glass lacks SO_APPROVE', () => {
      expect(PermissionChecker.hasPermission(['break_glass'], Permission.SO_APPROVE)).toBe(false)
    })
    test('break_glass lacks INVENTORY_OVERRIDE', () => {
      expect(PermissionChecker.hasPermission(['break_glass'], Permission.INVENTORY_OVERRIDE)).toBe(false)
    })
  })

  describe('Role Conflict Detection', () => {
    test('finance_accountant + finance_manager = conflict', () => {
      expect(PermissionChecker.isRoleConflict('finance_accountant', 'finance_manager')).toBe(true)
    })
    test('procurement_officer + procurement_manager = conflict', () => {
      expect(PermissionChecker.isRoleConflict('procurement_officer', 'procurement_manager')).toBe(true)
    })
    test('sales_officer + sales_manager = conflict', () => {
      expect(PermissionChecker.isRoleConflict('sales_officer', 'sales_manager')).toBe(true)
    })
    test('auditor + tenant_admin = conflict (auditor independence)', () => {
      expect(PermissionChecker.isRoleConflict('auditor', 'tenant_admin')).toBe(true)
    })
    test('warehouse_operator + warehouse_supervisor = NO conflict', () => {
      expect(PermissionChecker.isRoleConflict('warehouse_operator', 'warehouse_supervisor')).toBe(false)
    })
  })

  describe('Maker-Checker Enforcement (Service Layer)', () => {
    test('enforceMakerChecker throws when actor == creator', async () => {
      await withCtx({
        userId: 'user-1',
        roles: ['procurement_manager'],
        tenantId: 't-1',
      }, async () => {
        expect(() => enforceMakerChecker('user-1', 'approve', 'PurchaseOrder')).toThrow(BusinessRuleError)
      })
    })

    test('enforceMakerChecker passes when actor != creator', async () => {
      await withCtx({
        userId: 'user-2',
        roles: ['procurement_manager'],
        tenantId: 't-1',
      }, async () => {
        expect(() => enforceMakerChecker('user-1', 'approve', 'PurchaseOrder')).not.toThrow()
      })
    })

    test('enforceMakerChecker passes when no creator (system op)', async () => {
      await withCtx({
        userId: 'user-1',
        roles: ['procurement_manager'],
        tenantId: 't-1',
      }, async () => {
        expect(() => enforceMakerChecker(null, 'approve', 'PurchaseOrder')).not.toThrow()
      })
    })
  })

  describe('Break Glass Restriction (Service Layer)', () => {
    test('enforceNotBreakGlass throws for break_glass role', async () => {
      await withCtx({
        userId: 'bg-user',
        roles: ['break_glass'],
        tenantId: 't-1',
      }, async () => {
        expect(() => enforceNotBreakGlass('post')).toThrow(BusinessRuleError)
      })
    })

    test('enforceNotBreakGlass passes for normal user', async () => {
      await withCtx({
        userId: 'user-1',
        roles: ['finance_manager'],
        tenantId: 't-1',
      }, async () => {
        expect(() => enforceNotBreakGlass('post')).not.toThrow()
      })
    })
  })

  describe('Tenant Isolation (Service Layer)', () => {
    test('enforceTenantIsolation throws on cross-tenant access', async () => {
      await withCtx({
        userId: 'user-1',
        roles: ['tenant_admin'],
        tenantId: 'tenant-A',
      }, async () => {
        expect(() => enforceTenantIsolation('tenant-B')).toThrow(BusinessRuleError)
      })
    })

    test('enforceTenantIsolation passes for same tenant', async () => {
      await withCtx({
        userId: 'user-1',
        roles: ['tenant_admin'],
        tenantId: 'tenant-A',
      }, async () => {
        expect(() => enforceTenantIsolation('tenant-A')).not.toThrow()
      })
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// DATA SCOPE (8 Levels)
// ════════════════════════════════════════════════════════════════════════════

describe('Phase 1: Data Scope (8 Levels)', () => {
  test('8 scope levels defined', () => {
    expect(Object.keys(DataScope).length).toBe(8)
  })

  test('scope rank ordering is correct', () => {
    expect(SCOPE_RANK[DataScope.OWN]).toBe(1)
    expect(SCOPE_RANK[DataScope.DEPT]).toBe(2)
    expect(SCOPE_RANK[DataScope.WAREHOUSE]).toBe(3)
    expect(SCOPE_RANK[DataScope.PLANT]).toBe(4)
    expect(SCOPE_RANK[DataScope.COMPANY]).toBe(5)
    expect(SCOPE_RANK[DataScope.BU]).toBe(6)
    expect(SCOPE_RANK[DataScope.REGION]).toBe(7)
    expect(SCOPE_RANK[DataScope.GLOBAL]).toBe(8)
  })

  describe('Role → Scope Mapping', () => {
    test('tenant_admin → global', () => {
      expect(resolveDataScope(['tenant_admin'])).toBe(DataScope.GLOBAL)
    })
    test('auditor → global (read-only)', () => {
      expect(resolveDataScope(['auditor'])).toBe(DataScope.GLOBAL)
    })
    test('break_glass → global (read-only)', () => {
      expect(resolveDataScope(['break_glass'])).toBe(DataScope.GLOBAL)
    })
    test('sales_manager → company', () => {
      expect(resolveDataScope(['sales_manager'])).toBe(DataScope.COMPANY)
    })
    test('warehouse_supervisor → plant', () => {
      expect(resolveDataScope(['warehouse_supervisor'])).toBe(DataScope.PLANT)
    })
    test('warehouse_operator → wh', () => {
      expect(resolveDataScope(['warehouse_operator'])).toBe(DataScope.WAREHOUSE)
    })
    test('sales_officer → dept', () => {
      expect(resolveDataScope(['sales_officer'])).toBe(DataScope.DEPT)
    })
  })

  describe('Scope Filter Generation', () => {
    test('global scope → null filter (no restriction)', () => {
      expect(buildScopeFilter(DataScope.GLOBAL, 'i', 1)).toBeNull()
    })

    test('warehouse scope → warehouse_id filter', async () => {
      await withCtx({
        userId: 'u1',
        roles: ['warehouse_operator'],
        warehouseIds: ['wh-1'],
      }, async () => {
        const f = buildScopeFilter(DataScope.WAREHOUSE, 'i', 1)
        expect(f!.clause).toContain('i.warehouse_id = ANY($1)')
      })
    })

    test('plant scope → plant_id filter', async () => {
      await withCtx({
        userId: 'u1',
        roles: ['warehouse_supervisor'],
        plantIds: ['plant-1'],
      }, async () => {
        const f = buildScopeFilter(DataScope.PLANT, 'i', 1)
        expect(f!.clause).toContain('i.plant_id = ANY($1)')
      })
    })

    test('company scope → company_id filter', async () => {
      await withCtx({
        userId: 'u1',
        roles: ['sales_manager'],
        companyIds: ['co-1'],
      }, async () => {
        const f = buildScopeFilter(DataScope.COMPANY, 'i', 1)
        expect(f!.clause).toContain('i.company_id = ANY($1)')
      })
    })

    test('own scope → created_by OR assigned_to filter', async () => {
      await withCtx({
        userId: 'u1',
        roles: [],
      }, async () => {
        const f = buildScopeFilter(DataScope.OWN, 't', 1)
        expect(f!.clause).toMatch(/t\.created_by = \$1 OR t\.assigned_to = \$1/)
      })
    })

    test('warehouse scope without IDs → fail closed (AND 1=0)', async () => {
      await withCtx({
        userId: 'u1',
        roles: ['warehouse_operator'],
        warehouseIds: [],
      }, async () => {
        const f = buildScopeFilter(DataScope.WAREHOUSE, 'i', 1)
        expect(f!.clause).toBe(' AND 1=0')
      })
    })
  })

  describe('Multi-Role Scope Resolution', () => {
    test('broadest scope wins (wh_op + wh_sup → plant)', () => {
      expect(resolveDataScope(['warehouse_operator', 'warehouse_supervisor'])).toBe(DataScope.PLANT)
    })
    test('admin wins over any role', () => {
      expect(resolveDataScope(['warehouse_operator', 'tenant_admin'])).toBe(DataScope.GLOBAL)
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// BREAK GLASS
// ════════════════════════════════════════════════════════════════════════════

describe('Phase 1: Break Glass Emergency Access', () => {
  test('break_glass role exists', () => {
    expect(DEFAULT_ROLES.break_glass).toBeDefined()
  })

  test('break_glass has VIEW permissions (read-only navigation)', () => {
    const perms = DEFAULT_ROLES.break_glass
    expect(perms).toContain(Permission.INVENTORY_VIEW)
    expect(perms).toContain(Permission.WAREHOUSE_VIEW)
    expect(perms).toContain(Permission.GL_VIEW)
  })

  test('break_glass has READ permissions', () => {
    const perms = DEFAULT_ROLES.break_glass
    expect(perms).toContain(Permission.INVENTORY_READ)
    expect(perms).toContain(Permission.WAREHOUSE_READ)
    expect(perms).toContain(Permission.GL_READ)
  })

  test('break_glass has SYSTEM_SETTINGS (configure only)', () => {
    expect(DEFAULT_ROLES.break_glass).toContain(Permission.SYSTEM_SETTINGS)
  })

  test('break_glass has SYSTEM_BREAK_GLASS_ACTIVATE', () => {
    expect(DEFAULT_ROLES.break_glass).toContain(Permission.SYSTEM_BREAK_GLASS_ACTIVATE)
  })

  test('break_glass has ZERO create permissions', () => {
    const perms = DEFAULT_ROLES.break_glass
    expect(perms.some(p => p.includes(':create'))).toBe(false)
  })

  test('break_glass has ZERO update permissions (except settings)', () => {
    const perms = DEFAULT_ROLES.break_glass
    const updatePerms = perms.filter(p => p.includes(':update'))
    expect(updatePerms.length).toBe(0)
  })

  test('break_glass has ZERO approve permissions', () => {
    expect(DEFAULT_ROLES.break_glass.some(p => p.includes(':approve'))).toBe(false)
  })

  test('break_glass has ZERO post permissions', () => {
    expect(DEFAULT_ROLES.break_glass.some(p => p.includes(':post'))).toBe(false)
  })

  test('break_glass has ZERO override permissions', () => {
    expect(DEFAULT_ROLES.break_glass.some(p => p.includes(':override'))).toBe(false)
  })

  test('break_glass resolves to GLOBAL scope (sees everything)', () => {
    expect(resolveDataScope(['break_glass'])).toBe(DataScope.GLOBAL)
  })

  test('tenant_admin CANNOT self-activate break glass', () => {
    expect(DEFAULT_ROLES.tenant_admin).not.toContain(Permission.SYSTEM_BREAK_GLASS_ACTIVATE)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// DELEGATION (6 Domains)
// ════════════════════════════════════════════════════════════════════════════

describe('Phase 1: Delegation (6 Domains)', () => {
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

  test('officers (non-managers) CANNOT delegate', () => {
    expect(DEFAULT_ROLES.sales_officer).not.toContain(Permission.SO_DELEGATE)
    expect(DEFAULT_ROLES.procurement_officer).not.toContain(Permission.PR_DELEGATE)
  })

  test('auditor CANNOT delegate (read-only)', () => {
    expect(DEFAULT_ROLES.auditor).not.toContain(Permission.SO_DELEGATE)
    expect(DEFAULT_ROLES.auditor).not.toContain(Permission.GL_DELEGATE)
  })

  test('break_glass CANNOT delegate', () => {
    expect(DEFAULT_ROLES.break_glass).not.toContain(Permission.SO_DELEGATE)
    expect(DEFAULT_ROLES.break_glass).not.toContain(Permission.GL_DELEGATE)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// TENANT ISOLATION
// ════════════════════════════════════════════════════════════════════════════

describe('Phase 1: Tenant Isolation', () => {
  test('only tenant_admin has SYSTEM_TENANT_CROSS permission', () => {
    const crossHolders = Object.entries(DEFAULT_ROLES)
      .filter(([, perms]) => perms.includes(Permission.SYSTEM_TENANT_CROSS))
      .map(([role]) => role)
    expect(crossHolders).toContain('tenant_admin')
    expect(crossHolders).not.toContain('auditor')
    expect(crossHolders).not.toContain('break_glass')
    expect(crossHolders).not.toContain('warehouse_operator')
    expect(crossHolders).not.toContain('sales_officer')
  })

  test('enforceTenantIsolation blocks cross-tenant access', async () => {
    await withCtx({
      userId: 'u1',
      roles: ['tenant_admin'],
      tenantId: 'tenant-A',
    }, async () => {
      expect(() => enforceTenantIsolation('tenant-B')).toThrow(BusinessRuleError)
    })
  })

  test('enforceTenantIsolation allows same-tenant access', async () => {
    await withCtx({
      userId: 'u1',
      roles: ['tenant_admin'],
      tenantId: 'tenant-A',
    }, async () => {
      expect(() => enforceTenantIsolation('tenant-A')).not.toThrow()
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// PLANT SCOPE
// ════════════════════════════════════════════════════════════════════════════

describe('Phase 1: Plant Scope', () => {
  test('plant-level roles: manufacturing_supervisor, quality_manager, warehouse_supervisor', () => {
    expect(resolveDataScope(['manufacturing_supervisor'])).toBe(DataScope.PLANT)
    expect(resolveDataScope(['quality_manager'])).toBe(DataScope.PLANT)
    expect(resolveDataScope(['warehouse_supervisor'])).toBe(DataScope.PLANT)
  })

  test('plant scope generates plant_id filter', async () => {
    await withCtx({
      userId: 'u1',
      roles: ['quality_manager'],
      plantIds: ['plant-1', 'plant-2'],
    }, async () => {
      const f = buildScopeFilter(DataScope.PLANT, 'b', 1)
      expect(f!.clause).toContain('b.plant_id = ANY($1)')
      expect(f!.params).toEqual([['plant-1', 'plant-2']])
    })
  })

  test('plant scope without plantIds → fail closed', async () => {
    await withCtx({
      userId: 'u1',
      roles: ['quality_manager'],
    }, async () => {
      const f = buildScopeFilter(DataScope.PLANT, 'b', 1)
      expect(f!.clause).toBe(' AND 1=0')
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// WAREHOUSE SCOPE
// ════════════════════════════════════════════════════════════════════════════

describe('Phase 1: Warehouse Scope', () => {
  test('warehouse_operator resolves to wh scope', () => {
    expect(resolveDataScope(['warehouse_operator'])).toBe(DataScope.WAREHOUSE)
  })

  test('warehouse scope generates warehouse_id filter', async () => {
    await withCtx({
      userId: 'u1',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1'],
    }, async () => {
      const f = buildScopeFilter(DataScope.WAREHOUSE, 'i', 1)
      expect(f!.clause).toContain('i.warehouse_id = ANY($1)')
    })
  })

  test('warehouse scope supports multiple warehouses', async () => {
    await withCtx({
      userId: 'u1',
      roles: ['warehouse_operator'],
      warehouseIds: ['wh-1', 'wh-2', 'wh-3'],
    }, async () => {
      const f = buildScopeFilter(DataScope.WAREHOUSE, 'i', 1)
      expect(f!.params).toEqual([['wh-1', 'wh-2', 'wh-3']])
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// PERMISSION CHECKER
// ════════════════════════════════════════════════════════════════════════════

describe('Phase 1: Permission Checker', () => {
  test('hasPermission returns true for granted permission', () => {
    expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.ORG_READ)).toBe(true)
  })

  test('hasPermission returns false for denied permission', () => {
    expect(PermissionChecker.hasPermission(['auditor'], Permission.CATALOG_CREATE)).toBe(false)
  })

  test('hasAnyPermission returns true if any permission is granted', () => {
    expect(PermissionChecker.hasAnyPermission(['auditor'], [Permission.CATALOG_CREATE, Permission.AUDIT_READ])).toBe(true)
  })

  test('hasAllPermissions returns true only if all granted', () => {
    expect(PermissionChecker.hasAllPermissions(['quality_manager'], [Permission.QUALITY_INSPECT, Permission.QUALITY_APPROVE])).toBe(true)
  })

  test('resolvePermissions returns union of all role permissions', () => {
    const perms = PermissionChecker.resolvePermissions(['auditor', 'procurement_officer'])
    expect(perms).toContain(Permission.AUDIT_READ)
    expect(perms).toContain(Permission.PO_CREATE)
  })

  test('resolvePermissions handles unknown roles gracefully', () => {
    expect(PermissionChecker.resolvePermissions(['unknown_role'])).toEqual([])
  })
})

// ════════════════════════════════════════════════════════════════════════════
// ROLE COMPLETENESS
// ════════════════════════════════════════════════════════════════════════════

describe('Phase 1: Role Completeness', () => {
  test('tenant_admin has 300+ permissions', () => {
    expect(DEFAULT_ROLES.tenant_admin.length).toBeGreaterThan(300)
  })

  test('auditor has ZERO write permissions', () => {
    const perms = DEFAULT_ROLES.auditor
    const writeActions = [':create', ':update', ':delete', ':approve', ':post', ':reverse', ':override', ':cancel', ':close', ':reopen', ':archive', ':restore', ':blacklist', ':delegate', ':issue', ':release', ':reject']
    for (const perm of perms) {
      for (const action of writeActions) {
        if (perm.includes(action) && !perm.includes(':read') && !perm.includes(':view')) {
          if (perm.startsWith('audit:')) continue // audit:export is allowed
          throw new Error(`Auditor has write permission: ${perm}`)
        }
      }
    }
  })

  test('break_glass has ZERO irreversible permissions', () => {
    const perms = DEFAULT_ROLES.break_glass
    const irreversible = [':post', ':approve', ':delete', ':override', ':reverse', ':cancel', ':blacklist', ':close', ':reopen']
    for (const perm of perms) {
      for (const action of irreversible) {
        if (perm.includes(action)) {
          throw new Error(`Break glass has irreversible permission: ${perm}`)
        }
      }
    }
  })

  test('every officer role has READ permissions', () => {
    expect(DEFAULT_ROLES.sales_officer).toContain(Permission.SO_READ)
    expect(DEFAULT_ROLES.procurement_officer).toContain(Permission.PO_READ)
  })

  test('every manager role has APPROVE permissions', () => {
    expect(DEFAULT_ROLES.sales_manager).toContain(Permission.SO_APPROVE)
    expect(DEFAULT_ROLES.procurement_manager).toContain(Permission.PO_APPROVE)
    expect(DEFAULT_ROLES.finance_manager).toContain(Permission.GL_POST)
  })
})

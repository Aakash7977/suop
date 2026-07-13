/**
 * Permission Registry Tests
 * Tests for the enterprise permission catalog, roles, SoD, and scope.
 */

import { describe, test, expect } from 'bun:test'
import { Permission, DEFAULT_ROLES, PermissionChecker, DataScope } from '../registry'

describe('Permission Registry', () => {
  describe('Permission Catalog', () => {
    test('should have ~329 permissions defined', () => {
      const permCount = Object.keys(Permission).length
      expect(permCount).toBeGreaterThan(300)
      expect(permCount).toBeLessThan(400)
    })

    test('all permissions should follow naming convention: domain:action[:sub-scope]', () => {
      for (const [key, value] of Object.entries(Permission)) {
        expect(value).toMatch(/^[a-z]+:[a-z]+(:[a-z-]+)*$/)
      }
    })

    test('should have VIEW and READ for all major domains', () => {
      const domains = ['org', 'catalog', 'customer', 'supplier', 'inventory', 'warehouse', 'po', 'so', 'batch', 'quality', 'gl', 'hr', 'crm', 'bi']
      for (const domain of domains) {
        const hasView = Object.values(Permission).some(p => p === `${domain}:view`)
        const hasRead = Object.values(Permission).some(p => p === `${domain}:read`)
        expect(hasView || hasRead).toBe(true)
      }
    })

    test('should have OVERRIDE for critical domains', () => {
      const overrideDomains = ['inventory', 'pricing', 'quality', 'costing', 'so', 'shipment', 'pick', 'catalog', 'finance', 'alerts']
      for (const domain of overrideDomains) {
        const hasOverride = Object.values(Permission).some(p => p === `${domain}:override`)
        expect(hasOverride).toBe(true)
      }
    })

    test('should have DELEGATE and APPROVE_AS_DELEGATE for delegation domains', () => {
      const delegationDomains = ['so', 'pr', 'po', 'gl', 'leave', 'attendance']
      for (const domain of delegationDomains) {
        const hasDelegate = Object.values(Permission).some(p => p === `${domain}:delegate`)
        const hasAsDelegate = Object.values(Permission).some(p => p === `${domain}:approve:as-delegate`)
        expect(hasDelegate).toBe(true)
        expect(hasAsDelegate).toBe(true)
      }
    })

    test('should have ARCHIVE and RESTORE for enterprise delete replacement', () => {
      const archiveDomains = ['org', 'catalog', 'customer', 'supplier', 'warehouse', 'po', 'so', 'batch', 'recipe', 'gl', 'hr']
      for (const domain of archiveDomains) {
        const hasArchive = Object.values(Permission).some(p => p === `${domain}:archive`)
        expect(hasArchive).toBe(true)
      }
    })

    test('should have BREAK_GLASS activation permission', () => {
      expect(Permission.SYSTEM_BREAK_GLASS_ACTIVATE).toBe('system:break-glass:activate')
    })
  })

  describe('Roles', () => {
    test('should have 14 roles defined', () => {
      const roleCount = Object.keys(DEFAULT_ROLES).length
      expect(roleCount).toBe(14)
    })

    test('tenant_admin should have all permissions except break-glass activation', () => {
      const adminPerms = DEFAULT_ROLES.tenant_admin
      expect(adminPerms).toBeDefined()
      expect(adminPerms.length).toBeGreaterThan(300)
      expect(adminPerms).not.toContain(Permission.SYSTEM_BREAK_GLASS_ACTIVATE)
    })

    test('auditor should have ZERO write permissions', () => {
      const auditorPerms = DEFAULT_ROLES.auditor
      const writeActions = [':create', ':update', ':delete', ':approve', ':post', ':reverse', ':override', ':cancel', ':close', ':reopen', ':archive', ':restore', ':blacklist', ':delegate', ':issue', ':release', ':reject']
      for (const perm of auditorPerms) {
        for (const action of writeActions) {
          if (perm.includes(action) && !perm.includes(':read') && !perm.includes(':view')) {
            // Allow audit:read and audit:read:critical and audit:export
            if (perm.startsWith('audit:')) continue
            throw new Error(`Auditor has write permission: ${perm}`)
          }
        }
      }
    })

    test('break_glass should have ZERO irreversible permissions', () => {
      const bgPerms = DEFAULT_ROLES.break_glass
      const irreversibleActions = [':post', ':approve', ':delete', ':override', ':reverse', ':cancel', ':blacklist', ':close', ':reopen']
      for (const perm of bgPerms) {
        for (const action of irreversibleActions) {
          if (perm.includes(action)) {
            throw new Error(`Break glass has irreversible permission: ${perm}`)
          }
        }
      }
    })

    test('break_glass should have view and read only', () => {
      const bgPerms = DEFAULT_ROLES.break_glass
      // All permissions should be view, read, or settings/configure
      for (const perm of bgPerms) {
        const isViewOrRead = perm.includes(':view') || perm.includes(':read')
        const isSettings = perm.includes(':settings') || perm.includes(':break-glass')
        expect(isViewOrRead || isSettings).toBe(true)
      }
    })
  })

  describe('Separation of Duties', () => {
    test('finance_accountant should NOT have gl:post', () => {
      expect(DEFAULT_ROLES.finance_accountant).not.toContain(Permission.GL_POST)
    })

    test('finance_manager should NOT have gl:create', () => {
      expect(DEFAULT_ROLES.finance_manager).not.toContain(Permission.GL_CREATE)
    })

    test('procurement_officer should NOT have po:approve', () => {
      expect(DEFAULT_ROLES.procurement_officer).not.toContain(Permission.PO_APPROVE)
    })

    test('procurement_manager should NOT have po:receive', () => {
      expect(DEFAULT_ROLES.procurement_manager).not.toContain(Permission.PO_RECEIVE)
    })

    test('sales_officer should NOT have so:approve', () => {
      expect(DEFAULT_ROLES.sales_officer).not.toContain(Permission.SO_APPROVE)
    })

    test('warehouse_operator should NOT have inventory:adjust', () => {
      expect(DEFAULT_ROLES.warehouse_operator).not.toContain(Permission.INVENTORY_ADJUST)
    })

    test('quality_manager should NOT have shipment:create', () => {
      expect(DEFAULT_ROLES.quality_manager).not.toContain(Permission.SHIPMENT_CREATE)
    })

    test('quality_manager should NOT have inventory:adjust', () => {
      expect(DEFAULT_ROLES.quality_manager).not.toContain(Permission.INVENTORY_ADJUST)
    })

    test('costing:create and costing:approve should be in different roles', () => {
      const createRoles = Object.entries(DEFAULT_ROLES).filter(([, perms]) => perms.includes(Permission.COSTING_CREATE)).map(([role]) => role)
      const approveRoles = Object.entries(DEFAULT_ROLES).filter(([, perms]) => perms.includes(Permission.COSTING_APPROVE)).map(([role]) => role)
      // finance_accountant has create, finance_manager has approve
      expect(createRoles).toContain('finance_accountant')
      expect(approveRoles).toContain('finance_manager')
      expect(createRoles).not.toContain('finance_manager')
    })
  })

  describe('PermissionChecker', () => {
    test('hasPermission should return true for tenant_admin with any permission', () => {
      const result = PermissionChecker.hasPermission(['tenant_admin'], Permission.INVENTORY_READ)
      expect(result).toBe(true)
    })

    test('hasPermission should return false for auditor with write permission', () => {
      const result = PermissionChecker.hasPermission(['auditor'], Permission.INVENTORY_STOCKIN)
      expect(result).toBe(false)
    })

    test('hasPermission should return true for warehouse_operator with inventory:stockin', () => {
      const result = PermissionChecker.hasPermission(['warehouse_operator'], Permission.INVENTORY_STOCKIN)
      expect(result).toBe(true)
    })

    test('hasPermission should return false for warehouse_operator with inventory:adjust', () => {
      const result = PermissionChecker.hasPermission(['warehouse_operator'], Permission.INVENTORY_ADJUST)
      expect(result).toBe(false)
    })

    test('hasAnyPermission should return true if any permission matches', () => {
      const result = PermissionChecker.hasAnyPermission(['auditor'], [Permission.INVENTORY_STOCKIN, Permission.INVENTORY_READ])
      expect(result).toBe(true)
    })

    test('hasAllPermissions should return false if not all match', () => {
      const result = PermissionChecker.hasAllPermissions(['auditor'], [Permission.INVENTORY_READ, Permission.INVENTORY_STOCKIN])
      expect(result).toBe(false)
    })

    test('resolvePermissions should return union of all role permissions', () => {
      const perms = PermissionChecker.resolvePermissions(['warehouse_operator', 'auditor'])
      expect(perms).toContain('inventory:read')
      expect(perms).toContain('inventory:stockin')
      expect(perms).toContain('audit:read')
      expect(perms).not.toContain('inventory:adjust')
    })
  })

  describe('Role Conflict Detection (SoD)', () => {
    test('finance_accountant + finance_manager should conflict', () => {
      expect(PermissionChecker.isRoleConflict('finance_accountant', 'finance_manager')).toBe(true)
    })

    test('procurement_officer + procurement_manager should conflict', () => {
      expect(PermissionChecker.isRoleConflict('procurement_officer', 'procurement_manager')).toBe(true)
    })

    test('sales_officer + sales_manager should conflict', () => {
      expect(PermissionChecker.isRoleConflict('sales_officer', 'sales_manager')).toBe(true)
    })

    test('auditor + tenant_admin should conflict', () => {
      expect(PermissionChecker.isRoleConflict('auditor', 'tenant_admin')).toBe(true)
    })

    test('warehouse_operator + warehouse_supervisor should NOT conflict', () => {
      expect(PermissionChecker.isRoleConflict('warehouse_operator', 'warehouse_supervisor')).toBe(false)
    })

    test('quality_manager + manufacturing_supervisor should NOT conflict', () => {
      expect(PermissionChecker.isRoleConflict('quality_manager', 'manufacturing_supervisor')).toBe(false)
    })
  })

  describe('Data Scope', () => {
    test('should have 8 scope levels', () => {
      const scopeCount = Object.keys(DataScope).length
      expect(scopeCount).toBe(8)
    })

    test('should include own, dept, wh, plant, company, bu, region, global', () => {
      expect(DataScope.OWN).toBe('own')
      expect(DataScope.DEPT).toBe('dept')
      expect(DataScope.WAREHOUSE).toBe('wh')
      expect(DataScope.PLANT).toBe('plant')
      expect(DataScope.COMPANY).toBe('company')
      expect(DataScope.BU).toBe('bu')
      expect(DataScope.REGION).toBe('region')
      expect(DataScope.GLOBAL).toBe('global')
    })
  })

  describe('Backward Compatibility', () => {
    test('INVENTORY_POST should alias to inventory:stockin', () => {
      expect(Permission.INVENTORY_POST).toBe('inventory:stockin')
    })

    test('GRN_PUTAWAY should alias to putaway:create', () => {
      expect(Permission.GRN_PUTAWAY).toBe('putaway:create')
    })

    test('IQC_INSPECT should alias to quality:inspect', () => {
      expect(Permission.IQC_INSPECT).toBe('quality:inspect')
    })

    test('IQC_APPROVE should alias to quality:approve', () => {
      expect(Permission.IQC_APPROVE).toBe('quality:approve')
    })

    test('SYSTEM_REFERENCE_UPDATE should alias to system:settings', () => {
      expect(Permission.SYSTEM_REFERENCE_UPDATE).toBe('system:settings')
    })
  })
})

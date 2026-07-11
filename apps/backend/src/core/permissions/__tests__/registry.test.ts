import { describe, it, expect } from 'vitest'
import { Permission, PermissionChecker, DEFAULT_ROLES } from '../registry'

describe('Permission Registry', () => {
  describe('Permission constants', () => {
    it('defines org permissions', () => {
      expect(Permission.ORG_READ).toBe('org:read')
      expect(Permission.ORG_CREATE).toBe('org:create')
    })

    it('defines PO permissions with scopes', () => {
      expect(Permission.PO_APPROVE).toBe('po:approve')
      expect(Permission.PO_APPROVE_ANY).toBe('po:approve:any')
    })

    it('defines system permissions', () => {
      expect(Permission.SYSTEM_TENANT_CROSS).toBe('system:tenant:cross')
    })
  })

  describe('Default Roles', () => {
    it('tenant_admin has all permissions', () => {
      const perms = DEFAULT_ROLES['tenant_admin']
      expect(perms).toContain(Permission.ORG_READ)
      expect(perms).toContain(Permission.PRODUCT_CREATE)
      expect(perms).toContain(Permission.AUDIT_READ_CRITICAL)
    })

    it('quality_manager has quality permissions but not org create', () => {
      const perms = DEFAULT_ROLES['quality_manager']
      expect(perms).toContain(Permission.IQC_INSPECT)
      expect(perms).toContain(Permission.COA_SIGN)
      expect(perms).not.toContain(Permission.ORG_CREATE)
    })

    it('auditor is read-only', () => {
      const perms = DEFAULT_ROLES['auditor']
      expect(perms).toContain(Permission.AUDIT_READ)
      expect(perms).toContain(Permission.AUDIT_READ_CRITICAL)
      expect(perms).not.toContain(Permission.PRODUCT_CREATE)
    })
  })

  describe('PermissionChecker', () => {
    it('hasPermission returns true when role grants permission', () => {
      expect(PermissionChecker.hasPermission(['quality_manager'], Permission.IQC_INSPECT)).toBe(true)
    })

    it('hasPermission returns false when role does not grant permission', () => {
      expect(PermissionChecker.hasPermission(['auditor'], Permission.PRODUCT_CREATE)).toBe(false)
    })

    it('hasPermission checks all roles (union)', () => {
      expect(
        PermissionChecker.hasPermission(['auditor', 'procurement_officer'], Permission.PO_CREATE)
      ).toBe(true)
    })

    it('hasAnyPermission returns true if any permission is granted', () => {
      expect(
        PermissionChecker.hasAnyPermission(['auditor'], [Permission.PRODUCT_CREATE, Permission.AUDIT_READ])
      ).toBe(true)
    })

    it('hasAnyPermission returns false if none granted', () => {
      expect(
        PermissionChecker.hasAnyPermission(['auditor'], [Permission.PRODUCT_CREATE, Permission.PO_CREATE])
      ).toBe(false)
    })

    it('hasAllPermissions returns true only if all granted', () => {
      expect(
        PermissionChecker.hasAllPermissions(['quality_manager'], [Permission.IQC_INSPECT, Permission.COA_SIGN])
      ).toBe(true)
      expect(
        PermissionChecker.hasAllPermissions(['quality_manager'], [Permission.IQC_INSPECT, Permission.PRODUCT_CREATE])
      ).toBe(false)
    })

    it('resolvePermissions returns union of all role permissions', () => {
      const perms = PermissionChecker.resolvePermissions(['auditor', 'quality_manager'])
      expect(perms).toContain(Permission.AUDIT_READ)
      expect(perms).toContain(Permission.IQC_INSPECT)
      expect(perms).toContain(Permission.COA_SIGN)
    })

    it('resolvePermissions handles unknown roles gracefully', () => {
      const perms = PermissionChecker.resolvePermissions(['unknown_role'])
      expect(perms).toEqual([])
    })
  })
})

/**
 * @suop/backend — Permission Registry
 *
 * Per API Standards §13 and Security Architecture §4:
 *   - All permissions catalogued here
 *   - Format: <resource>:<action> or <resource>:<action>:<scope>
 */

export const Permission = {
  // Organization
  ORG_READ: 'org:read',
  ORG_CREATE: 'org:create',
  ORG_UPDATE: 'org:update',
  ORG_DELETE: 'org:delete',

  // Auth & RBAC
  AUTH_MANAGE_USERS: 'auth:manage_users',
  AUTH_MANAGE_ROLES: 'auth:manage_roles',
  AUTH_RESET_PASSWORD: 'auth:reset_password',

  // Product
  PRODUCT_READ: 'product:read',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_UPDATE: 'product:update',
  PRODUCT_DELETE: 'product:delete',

  // Supplier
  SUPPLIER_READ: 'supplier:read',
  SUPPLIER_CREATE: 'supplier:create',
  SUPPLIER_UPDATE: 'supplier:update',
  SUPPLIER_DELETE: 'supplier:delete',
  SUPPLIER_BLACKLIST: 'supplier:blacklist',

  // Purchase Order
  PO_READ: 'po:read',
  PO_CREATE: 'po:create',
  PO_APPROVE: 'po:approve',
  PO_APPROVE_ANY: 'po:approve:any',
  PO_CANCEL: 'po:cancel',
  PO_RECEIVE: 'po:receive',

  // Goods Receipt
  GRN_READ: 'grn:read',
  GRN_CREATE: 'grn:create',
  GRN_POST: 'grn:post',
  GRN_PUTAWAY: 'grn:putaway',

  // Quality
  IQC_INSPECT: 'iqc:inspect',
  IQC_APPROVE: 'iqc:approve',
  NCR_CREATE: 'ncr:create',
  NCR_APPROVE: 'ncr:approve',
  COA_SIGN: 'coa:sign',
  RECALL_INITIATE: 'recall:initiate',

  // Inventory
  INVENTORY_READ: 'inventory:read',
  INVENTORY_POST: 'inventory:post',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_REVERSE: 'inventory:reverse',

  // Audit
  AUDIT_READ: 'audit:read',
  AUDIT_READ_CRITICAL: 'audit:read:critical',

  // System
  SYSTEM_TENANT_CROSS: 'system:tenant:cross',
  SYSTEM_REFERENCE_UPDATE: 'system:reference:update',
} as const

export type Permission = (typeof Permission)[keyof typeof Permission]

// ─── Default Roles ──────────────────────────────────────────────────────────

export const DEFAULT_ROLES: Record<string, Permission[]> = {
  tenant_admin: [
    Permission.ORG_READ, Permission.ORG_CREATE, Permission.ORG_UPDATE, Permission.ORG_DELETE,
    Permission.AUTH_MANAGE_USERS, Permission.AUTH_MANAGE_ROLES, Permission.AUTH_RESET_PASSWORD,
    Permission.PRODUCT_READ, Permission.PRODUCT_CREATE, Permission.PRODUCT_UPDATE, Permission.PRODUCT_DELETE,
    Permission.SUPPLIER_READ, Permission.SUPPLIER_CREATE, Permission.SUPPLIER_UPDATE, Permission.SUPPLIER_DELETE,
    Permission.PO_READ, Permission.PO_CREATE, Permission.PO_APPROVE, Permission.PO_APPROVE_ANY, Permission.PO_CANCEL, Permission.PO_RECEIVE,
    Permission.GRN_READ, Permission.GRN_CREATE, Permission.GRN_POST, Permission.GRN_PUTAWAY,
    Permission.IQC_INSPECT, Permission.IQC_APPROVE,
    Permission.NCR_CREATE, Permission.NCR_APPROVE,
    Permission.COA_SIGN,
    Permission.INVENTORY_READ, Permission.INVENTORY_POST, Permission.INVENTORY_ADJUST, Permission.INVENTORY_REVERSE,
    Permission.AUDIT_READ, Permission.AUDIT_READ_CRITICAL,
  ],
  quality_manager: [
    Permission.PRODUCT_READ,
    Permission.SUPPLIER_READ,
    Permission.IQC_INSPECT, Permission.IQC_APPROVE,
    Permission.NCR_CREATE, Permission.NCR_APPROVE,
    Permission.COA_SIGN,
    Permission.INVENTORY_READ,
    Permission.AUDIT_READ,
  ],
  procurement_officer: [
    Permission.PRODUCT_READ,
    Permission.SUPPLIER_READ, Permission.SUPPLIER_CREATE, Permission.SUPPLIER_UPDATE,
    Permission.PO_READ, Permission.PO_CREATE,
    Permission.GRN_READ,
    Permission.INVENTORY_READ,
  ],
  procurement_manager: [
    Permission.PRODUCT_READ,
    Permission.SUPPLIER_READ, Permission.SUPPLIER_CREATE, Permission.SUPPLIER_UPDATE, Permission.SUPPLIER_BLACKLIST,
    Permission.PO_READ, Permission.PO_CREATE, Permission.PO_APPROVE, Permission.PO_CANCEL,
    Permission.GRN_READ, Permission.GRN_CREATE,
    Permission.INVENTORY_READ,
  ],
  warehouse_operator: [
    Permission.INVENTORY_READ,
    Permission.GRN_READ, Permission.GRN_POST, Permission.GRN_PUTAWAY,
    Permission.PRODUCT_READ,
  ],
  auditor: [
    Permission.PRODUCT_READ,
    Permission.SUPPLIER_READ,
    Permission.PO_READ,
    Permission.GRN_READ,
    Permission.INVENTORY_READ,
    Permission.AUDIT_READ, Permission.AUDIT_READ_CRITICAL,
  ],
}

// ─── Permission Checker ─────────────────────────────────────────────────────

export class PermissionChecker {
  /**
   * Check if a set of roles grants a specific permission.
   */
  static hasPermission(roles: string[], permission: Permission): boolean {
    for (const role of roles) {
      const rolePermissions = DEFAULT_ROLES[role]
      if (rolePermissions?.includes(permission)) return true
    }
    return false
  }

  /**
   * Check if user has ANY of the given permissions.
   */
  static hasAnyPermission(roles: string[], permissions: Permission[]): boolean {
    return permissions.some((p) => this.hasPermission(roles, p))
  }

  /**
   * Check if user has ALL of the given permissions.
   */
  static hasAllPermissions(roles: string[], permissions: Permission[]): boolean {
    return permissions.every((p) => this.hasPermission(roles, p))
  }

  /**
   * Resolve all permissions for a set of roles (union).
   */
  static resolvePermissions(roles: string[]): string[] {
    const result = new Set<string>()
    for (const role of roles) {
      const perms = DEFAULT_ROLES[role]
      if (perms) perms.forEach((p) => result.add(p))
    }
    return Array.from(result)
  }
}

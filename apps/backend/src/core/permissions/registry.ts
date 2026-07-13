/**
 * @suop/backend — Enterprise Permission Registry (FINAL)
 *
 * Architecture: FROZEN — do not redesign.
 *
 * Format: <domain>:<action>[:<sub-scope>]
 * Standard Actions: view, read, create, update, delete, close, archive, restore,
 *   approve, reject, release, post, cancel, reopen, reverse, override,
 *   export, import, print, delegate, approve:as-delegate, audit
 * Configuration Actions: settings, workflow, master, templates, numbering,
 *   notifications, approval-rules
 *
 * Data Scope: Applied via role assignment (own/dept/wh/plant/company/bu/region/global)
 *
 * SoD: 27 rules enforced through role design (see 03_SEPARATION_OF_DUTIES.md)
 *
 * Break Glass: Emergency access role (read + configure only, time-limited, audited)
 */

export const Permission = {
  // ─── Organization ──────────────────────────────────────────────
  ORG_VIEW: 'org:view',
  ORG_READ: 'org:read',
  ORG_CREATE: 'org:create',
  ORG_UPDATE: 'org:update',
  ORG_ARCHIVE: 'org:archive',
  ORG_RESTORE: 'org:restore',
  ORG_SETTINGS: 'org:settings',
  DEPT_READ: 'dept:read',
  DEPT_CREATE: 'dept:create',
  DEPT_UPDATE: 'dept:update',
  DEPT_ARCHIVE: 'dept:archive',
  COSTCENTER_READ: 'costcenter:read',
  COSTCENTER_CREATE: 'costcenter:create',
  COSTCENTER_UPDATE: 'costcenter:update',
  FY_READ: 'fy:read',
  FY_CREATE: 'fy:create',
  FY_CLOSE: 'fy:close',
  FY_REOPEN: 'fy:reopen',

  // ─── Catalog ───────────────────────────────────────────────────
  CATALOG_VIEW: 'catalog:view',
  CATALOG_READ: 'catalog:read',
  CATALOG_CREATE: 'catalog:create',
  CATALOG_UPDATE: 'catalog:update',
  CATALOG_ARCHIVE: 'catalog:archive',
  CATALOG_RESTORE: 'catalog:restore',
  CATALOG_APPROVE: 'catalog:approve',
  CATALOG_OVERRIDE: 'catalog:override',
  CATALOG_EXPORT: 'catalog:export',
  CATALOG_IMPORT: 'catalog:import',
  CATEGORY_READ: 'category:read',
  CATEGORY_CREATE: 'category:create',
  CATEGORY_UPDATE: 'category:update',
  BRAND_READ: 'brand:read',
  BRAND_CREATE: 'brand:create',
  UOM_READ: 'uom:read',

  // ─── Partners (Customers + Suppliers) ──────────────────────────
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_READ: 'customer:read',
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_UPDATE: 'customer:update',
  CUSTOMER_ARCHIVE: 'customer:archive',
  CUSTOMER_RESTORE: 'customer:restore',
  CUSTOMER_APPROVE: 'customer:approve',
  CUSTOMER_CREDIT_READ: 'customer:credit:read',
  CUSTOMER_CREDIT_UPDATE: 'customer:credit:update',
  CUSTOMER_CREDIT_OVERRIDE: 'customer:credit:override',
  SUPPLIER_VIEW: 'supplier:view',
  SUPPLIER_READ: 'supplier:read',
  SUPPLIER_CREATE: 'supplier:create',
  SUPPLIER_UPDATE: 'supplier:update',
  SUPPLIER_ARCHIVE: 'supplier:archive',
  SUPPLIER_APPROVE: 'supplier:approve',
  SUPPLIER_BLACKLIST: 'supplier:blacklist',
  SUPPLIER_COMPLIANCE_READ: 'supplier:compliance:read',
  SUPPLIER_COMPLIANCE_CREATE: 'supplier:compliance:create',
  SUPPLIER_PRODUCT_ASSIGN: 'supplier:product:assign',
  SUPPLIER_CATEGORY_READ: 'supplier:category:read',
  SUPPLIER_CATEGORY_CREATE: 'supplier:category:create',

  // ─── Inventory ─────────────────────────────────────────────────
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_READ: 'inventory:read',
  INVENTORY_STOCKIN: 'inventory:stockin',
  INVENTORY_STOCKOUT: 'inventory:stockout',
  INVENTORY_TRANSFER: 'inventory:transfer',
  INVENTORY_TRANSFER_APPROVE: 'inventory:transfer:approve',
  INVENTORY_ADJUST: 'inventory:adjust',
  INVENTORY_ADJUST_APPROVE: 'inventory:adjust:approve',
  INVENTORY_RESERVE: 'inventory:reserve',
  INVENTORY_RESERVE_RELEASE: 'inventory:reserve:release',
  INVENTORY_BLOCK: 'inventory:block',
  INVENTORY_BLOCK_RELEASE: 'inventory:block:release',
  INVENTORY_EXPIRY_MARK: 'inventory:expiry:mark',
  INVENTORY_REVERSE: 'inventory:reverse',
  INVENTORY_OVERRIDE: 'inventory:override',
  INVENTORY_EXPORT: 'inventory:export',
  INVENTORY_IMPORT: 'inventory:import',
  LEDGER_READ: 'ledger:read',
  LEDGER_REVERSE: 'ledger:reverse',

  // ─── Warehouse ────────────────────────────────────────────────
  WAREHOUSE_VIEW: 'warehouse:view',
  WAREHOUSE_READ: 'warehouse:read',
  WAREHOUSE_CREATE: 'warehouse:create',
  WAREHOUSE_UPDATE: 'warehouse:update',
  WAREHOUSE_ARCHIVE: 'warehouse:archive',
  WAREHOUSE_RESTORE: 'warehouse:restore',
  WAREHOUSE_SETTINGS: 'warehouse:settings',
  WAREHOUSE_NUMBERING: 'warehouse:numbering',
  PUTAWAY_VIEW: 'putaway:view',
  PUTAWAY_READ: 'putaway:read',
  PUTAWAY_CREATE: 'putaway:create',
  PUTAWAY_COMPLETE: 'putaway:complete',
  PUTAWAY_REASSIGN: 'putaway:reassign',
  PUTAWAY_OVERRIDE: 'putaway:override',
  BARCODE_READ: 'barcode:read',
  BARCODE_CREATE: 'barcode:create',
  BARCODE_PRINT: 'barcode:print',
  SCAN_EXECUTE: 'scan:execute',
  SCAN_READ: 'scan:read',
  GRN_VIEW: 'grn:view',
  GRN_READ: 'grn:read',
  GRN_CREATE: 'grn:create',
  GRN_POST: 'grn:post',
  GRN_CLOSE: 'grn:close',

  // ─── Procurement ──────────────────────────────────────────────
  PR_VIEW: 'pr:view',
  PR_READ: 'pr:read',
  PR_CREATE: 'pr:create',
  PR_UPDATE: 'pr:update',
  PR_DELETE: 'pr:delete',
  PR_APPROVE: 'pr:approve',
  PR_REJECT: 'pr:reject',
  PR_DELEGATE: 'pr:delegate',
  PR_APPROVE_AS_DELEGATE: 'pr:approve:as-delegate',
  PO_VIEW: 'po:view',
  PO_READ: 'po:read',
  PO_CREATE: 'po:create',
  PO_UPDATE: 'po:update',
  PO_ARCHIVE: 'po:archive',
  PO_APPROVE: 'po:approve',
  PO_REJECT: 'po:reject',
  PO_RELEASE: 'po:release',
  PO_ISSUE: 'po:issue',
  PO_CANCEL: 'po:cancel',
  PO_CLOSE: 'po:close',
  PO_REOPEN: 'po:reopen',
  PO_RECEIVE: 'po:receive',
  PO_EXPORT: 'po:export',
  PO_DELEGATE: 'po:delegate',
  PO_APPROVE_AS_DELEGATE: 'po:approve:as-delegate',
  PO_OVERRIDE: 'po:override',
  QUOT_READ: 'quot:read',
  QUOT_CREATE: 'quot:create',
  QUOT_APPROVE: 'quot:approve',
  RFQ_READ: 'rfq:read',
  RFQ_CREATE: 'rfq:create',

  // ─── Sales ────────────────────────────────────────────────────
  SO_VIEW: 'so:view',
  SO_READ: 'so:read',
  SO_CREATE: 'so:create',
  SO_UPDATE: 'so:update',
  SO_ARCHIVE: 'so:archive',
  SO_APPROVE: 'so:approve',
  SO_REJECT: 'so:reject',
  SO_HOLD: 'so:hold',
  SO_RELEASE: 'so:release',
  SO_CANCEL: 'so:cancel',
  SO_CLOSE: 'so:close',
  SO_REOPEN: 'so:reopen',
  SO_DELEGATE: 'so:delegate',
  SO_APPROVE_AS_DELEGATE: 'so:approve:as-delegate',
  SO_OVERRIDE: 'so:override',
  ALLOCATION_VIEW: 'allocation:view',
  ALLOCATION_READ: 'allocation:read',
  ALLOCATION_CREATE: 'allocation:create',
  ALLOCATION_CANCEL: 'allocation:cancel',
  WAVE_VIEW: 'wave:view',
  WAVE_READ: 'wave:read',
  WAVE_CREATE: 'wave:create',
  WAVE_RELEASE: 'wave:release',
  WAVE_CANCEL: 'wave:cancel',
  PICK_VIEW: 'pick:view',
  PICK_READ: 'pick:read',
  PICK_CREATE: 'pick:create',
  PICK_COMPLETE: 'pick:complete',
  PICK_OVERRIDE: 'pick:override',
  PACK_READ: 'pack:read',
  PACK_CREATE: 'pack:create',
  PACK_COMPLETE: 'pack:complete',
  SHIPMENT_READ: 'shipment:read',
  SHIPMENT_CREATE: 'shipment:create',
  SHIPMENT_OVERRIDE: 'shipment:override',
  DELIVERY_READ: 'delivery:read',
  DELIVERY_CREATE: 'delivery:create',
  DELIVERY_POD: 'delivery:pod',
  DELIVERY_CANCEL: 'delivery:cancel',
  RETURNS_READ: 'returns:read',
  RETURNS_CREATE: 'returns:create',
  RETURNS_APPROVE: 'returns:approve',
  PRICING_READ: 'pricing:read',
  PRICING_CREATE: 'pricing:create',
  PRICING_OVERRIDE: 'pricing:override',
  PRICING_CALCULATE: 'pricing:calculate',
  PRICING_APPROVAL_RULES: 'pricing:approval-rules',

  // ─── Manufacturing ────────────────────────────────────────────
  BATCH_VIEW: 'batch:view',
  BATCH_READ: 'batch:read',
  BATCH_CREATE: 'batch:create',
  BATCH_UPDATE: 'batch:update',
  BATCH_APPROVE: 'batch:approve',
  BATCH_RELEASE: 'batch:release',
  BATCH_TRANSITION: 'batch:transition',
  BATCH_SPLIT: 'batch:split',
  BATCH_MERGE: 'batch:merge',
  BATCH_TRACE: 'batch:trace',
  BATCH_ARCHIVE: 'batch:archive',
  RECIPE_READ: 'recipe:read',
  RECIPE_CREATE: 'recipe:create',
  RECIPE_UPDATE: 'recipe:update',
  RECIPE_APPROVE: 'recipe:approve',
  RECIPE_ARCHIVE: 'recipe:archive',
  PRODUCTION_READ: 'production:read',
  PRODUCTION_CREATE: 'production:create',
  PRODUCTION_APPROVE: 'production:approve',
  PRODUCTION_RELEASE: 'production:release',
  PRODUCTION_START: 'production:start',
  PRODUCTION_COMPLETE: 'production:complete',
  PRODUCTION_CLOSE: 'production:close',
  MES_READ: 'mes:read',

  // ─── Quality ──────────────────────────────────────────────────
  QUALITY_VIEW: 'quality:view',
  QUALITY_READ: 'quality:read',
  QUALITY_INSPECT: 'quality:inspect',
  QUALITY_APPROVE: 'quality:approve',
  QUALITY_REJECT: 'quality:reject',
  QUALITY_HOLD: 'quality:hold',
  QUALITY_HOLD_RELEASE: 'quality:hold:release',
  QUALITY_OVERRIDE: 'quality:override',
  NCR_READ: 'ncr:read',
  NCR_CREATE: 'ncr:create',
  NCR_APPROVE: 'ncr:approve',
  NCR_REJECT: 'ncr:reject',
  CAPA_READ: 'capa:read',
  CAPA_CREATE: 'capa:create',
  CAPA_APPROVE: 'capa:approve',
  COA_READ: 'coa:read',
  COA_SIGN: 'coa:sign',
  RECALL_READ: 'recall:read',
  RECALL_INITIATE: 'recall:initiate',
  RECALL_APPROVE: 'recall:approve',
  RECALL_CLOSE: 'recall:close',
  QUALITY_APPROVAL_RULES: 'quality:approval-rules',

  // ─── Finance ──────────────────────────────────────────────────
  GL_VIEW: 'gl:view',
  GL_READ: 'gl:read',
  GL_CREATE: 'gl:create',
  GL_UPDATE: 'gl:update',
  GL_APPROVE: 'gl:approve',
  GL_POST: 'gl:post',
  GL_REVERSE: 'gl:reverse',
  GL_ARCHIVE: 'gl:archive',
  GL_DELEGATE: 'gl:delegate',
  GL_APPROVE_AS_DELEGATE: 'gl:approve:as-delegate',
  COSTING_READ: 'costing:read',
  COSTING_CREATE: 'costing:create',
  COSTING_UPDATE: 'costing:update',
  COSTING_APPROVE: 'costing:approve',
  COSTING_OVERRIDE: 'costing:override',
  GST_READ: 'gst:read',
  GST_CREATE: 'gst:create',
  GST_UPDATE: 'gst:update',
  GST_EXPORT: 'gst:export',
  FINANCE_READ: 'finance:read',
  FINANCE_CREATE: 'finance:create',
  FINANCE_UPDATE: 'finance:update',
  FINANCE_PERIOD_CLOSE: 'finance:period:close',
  FINANCE_PERIOD_REOPEN: 'finance:period:reopen',
  FINANCE_APPROVAL_RULES: 'finance:approval-rules',
  FINANCE_OVERRIDE: 'finance:override',
  AP_READ: 'ap:read',
  AR_READ: 'ar:read',
  PAYMENT_CREATE: 'payment:create',
  PAYMENT_APPROVE: 'payment:approve',

  // ─── HR ───────────────────────────────────────────────────────
  HR_VIEW: 'hr:view',
  HR_READ: 'hr:read',
  HR_CREATE: 'hr:create',
  HR_UPDATE: 'hr:update',
  HR_ARCHIVE: 'hr:archive',
  ATTENDANCE_READ: 'attendance:read',
  ATTENDANCE_CREATE: 'attendance:create',
  ATTENDANCE_UPDATE: 'attendance:update',
  ATTENDANCE_APPROVE: 'attendance:approve',
  ATTENDANCE_DELEGATE: 'attendance:delegate',
  ATTENDANCE_APPROVE_AS_DELEGATE: 'attendance:approve:as-delegate',
  LEAVE_READ: 'leave:read',
  LEAVE_CREATE: 'leave:create',
  LEAVE_APPROVE: 'leave:approve',
  LEAVE_DELEGATE: 'leave:delegate',
  LEAVE_APPROVE_AS_DELEGATE: 'leave:approve:as-delegate',
  LEAVE_CANCEL: 'leave:cancel',
  PERFORMANCE_READ: 'performance:read',
  PERFORMANCE_CONFIGURE: 'performance:configure',
  PERFORMANCE_APPRAISE: 'performance:appraise',
  PERFORMANCE_APPROVE: 'performance:approve',
  PAYROLL_READ: 'payroll:read',
  PAYROLL_APPROVE: 'payroll:approve',

  // ─── CRM ──────────────────────────────────────────────────────
  CRM_VIEW: 'crm:view',
  CRM_READ: 'crm:read',
  CRM_CREATE: 'crm:create',
  CRM_UPDATE: 'crm:update',
  COMPLAINT_READ: 'complaint:read',
  COMPLAINT_CREATE: 'complaint:create',
  COMPLAINT_APPROVE: 'complaint:approve',
  COMPLAINT_RESOLVE: 'complaint:resolve',
  SERVICE_READ: 'service:read',
  SERVICE_CREATE: 'service:create',
  SERVICE_CLOSE: 'service:close',
  LEAD_READ: 'lead:read',

  // ─── BI & Administration ──────────────────────────────────────
  BI_VIEW: 'bi:view',
  BI_READ: 'bi:read',
  BI_SETTINGS: 'bi:settings',
  BI_TEMPLATES: 'bi:templates',
  ALERTS_READ: 'alerts:read',
  ALERTS_SETTINGS: 'alerts:settings',
  ALERTS_ADMIN: 'alerts:admin',
  ALERTS_OVERRIDE: 'alerts:override',
  USER_VIEW: 'user:view',
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_ARCHIVE: 'user:archive',
  ROLE_MANAGE: 'role:manage',
  AUDIT_READ: 'audit:read',
  AUDIT_READ_CRITICAL: 'audit:read:critical',
  AUDIT_EXPORT: 'audit:export',
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_TENANT_CROSS: 'system:tenant:cross',
  SYSTEM_BREAK_GLASS_ACTIVATE: 'system:break-glass:activate',

  // ─── Auth ─────────────────────────────────────────────────────
  AUTH_MANAGE_USERS: 'auth:manage_users',
  AUTH_MANAGE_ROLES: 'auth:manage_roles',
  AUTH_RESET_PASSWORD: 'auth:reset_password',

  // ─── Future Modules (placeholders — activated when built) ─────
  RECEIVING_VIEW: 'receiving:view',
  RECEIVING_READ: 'receiving:read',
  RECEIVING_CREATE: 'receiving:create',
  RECEIVING_APPROVE: 'receiving:approve',
  YARD_VIEW: 'yard:view',
  YARD_READ: 'yard:read',
  YARD_CHECKIN: 'yard:checkin',
  YARD_CHECKOUT: 'yard:checkout',
  EAM_VIEW: 'eam:view',
  EAM_READ: 'eam:read',
  EAM_CREATE: 'eam:create',
  EAM_UPDATE: 'eam:update',
  EAM_MAINTENANCE: 'eam:maintenance',
  CYCLECOUNT_READ: 'cyclecount:read',
  CYCLECOUNT_EXECUTE: 'cyclecount:execute',
  CYCLECOUNT_APPROVE: 'cyclecount:approve',
  MISSIONCONTROL_READ: 'missioncontrol:read',
  CONTROLTOWER_READ: 'controltower:read',

  // ─── Backward Compatibility Aliases (to be removed after all routes updated) ───
  INVENTORY_POST: 'inventory:stockin',
  INVENTORY_ADJUST_OLD: 'inventory:adjust',
  IQC_INSPECT: 'quality:inspect',
  IQC_APPROVE: 'quality:approve',
  NCR_CREATE: 'ncr:create',
  NCR_APPROVE: 'ncr:approve',
  COA_SIGN_ALIAS: 'coa:sign',
  RECALL_INITIATE: 'recall:initiate',
  GRN_PUTAWAY: 'putaway:create',
  SYSTEM_REFERENCE_UPDATE: 'system:settings',
} as const

export type Permission = (typeof Permission)[keyof typeof Permission]

// ─── Data Scope ─────────────────────────────────────────────────
export const DataScope = {
  OWN: 'own',
  DEPT: 'dept',
  WAREHOUSE: 'wh',
  PLANT: 'plant',
  COMPANY: 'company',
  BU: 'bu',
  REGION: 'region',
  GLOBAL: 'global',
} as const

export type DataScope = (typeof DataScope)[keyof typeof DataScope]

// ─── Default Roles ──────────────────────────────────────────────

export const DEFAULT_ROLES: Record<string, Permission[]> = {
  // System Administrator — Global scope, all permissions
  // SoD Note: Should NOT perform day-to-day operations. Only configures system, manages users, resolves escalations.
  tenant_admin: Object.values(Permission).filter(
    (p) => !p.includes('break-glass') // Cannot self-activate break glass
  ) as Permission[],

  // Sales Officer — Dept scope
  // SoD: Cannot approve SOs (so:approve belongs to sales_manager)
  sales_officer: [
    Permission.SO_VIEW, Permission.SO_READ, Permission.SO_CREATE, Permission.SO_UPDATE,
    Permission.CUSTOMER_VIEW, Permission.CUSTOMER_READ, Permission.CUSTOMER_CREATE, Permission.CUSTOMER_UPDATE,
    Permission.PRICING_READ, Permission.PRICING_CALCULATE,
    Permission.ALLOCATION_READ,
    Permission.INVENTORY_VIEW, Permission.INVENTORY_READ,
    Permission.CATALOG_VIEW, Permission.CATALOG_READ,
    Permission.ORG_VIEW, Permission.ORG_READ,
    Permission.DELIVERY_READ,
  ],

  // Sales Manager — Company scope
  // SoD: Cannot post to GL (gl:post belongs to finance_manager)
  sales_manager: [
    Permission.SO_VIEW, Permission.SO_READ, Permission.SO_CREATE, Permission.SO_UPDATE, Permission.SO_ARCHIVE,
    Permission.SO_APPROVE, Permission.SO_REJECT, Permission.SO_HOLD, Permission.SO_RELEASE, Permission.SO_CANCEL,
    Permission.SO_CLOSE, Permission.SO_REOPEN, Permission.SO_DELEGATE, Permission.SO_APPROVE_AS_DELEGATE, Permission.SO_OVERRIDE,
    Permission.CUSTOMER_VIEW, Permission.CUSTOMER_READ, Permission.CUSTOMER_CREATE, Permission.CUSTOMER_UPDATE, Permission.CUSTOMER_ARCHIVE, Permission.CUSTOMER_APPROVE,
    Permission.CUSTOMER_CREDIT_READ, Permission.CUSTOMER_CREDIT_OVERRIDE,
    Permission.PRICING_READ, Permission.PRICING_CREATE, Permission.PRICING_OVERRIDE, Permission.PRICING_CALCULATE, Permission.PRICING_APPROVAL_RULES,
    Permission.ALLOCATION_VIEW, Permission.ALLOCATION_READ, Permission.ALLOCATION_CREATE, Permission.ALLOCATION_CANCEL,
    Permission.WAVE_VIEW, Permission.WAVE_READ,
    Permission.SHIPMENT_READ, Permission.DELIVERY_READ, Permission.RETURNS_READ, Permission.RETURNS_CREATE, Permission.RETURNS_APPROVE,
    Permission.INVENTORY_VIEW, Permission.INVENTORY_READ,
    Permission.CATALOG_VIEW, Permission.CATALOG_READ,
    Permission.ORG_VIEW, Permission.ORG_READ,
    Permission.BI_VIEW, Permission.BI_READ,
  ],

  // Procurement Officer — Dept scope
  // SoD: Cannot approve PRs or POs; cannot receive goods
  procurement_officer: [
    Permission.PR_VIEW, Permission.PR_READ, Permission.PR_CREATE, Permission.PR_UPDATE, Permission.PR_DELETE,
    Permission.PO_VIEW, Permission.PO_READ, Permission.PO_CREATE, Permission.PO_UPDATE,
    Permission.QUOT_READ, Permission.QUOT_CREATE,
    Permission.RFQ_READ, Permission.RFQ_CREATE,
    Permission.SUPPLIER_VIEW, Permission.SUPPLIER_READ, Permission.SUPPLIER_CREATE, Permission.SUPPLIER_UPDATE,
    Permission.SUPPLIER_COMPLIANCE_READ,
    Permission.CATALOG_VIEW, Permission.CATALOG_READ,
    Permission.INVENTORY_VIEW, Permission.INVENTORY_READ,
    Permission.ORG_VIEW, Permission.ORG_READ,
  ],

  // Procurement Manager — Company scope
  // SoD: Cannot receive goods (po:receive belongs to warehouse); cannot approve payments
  procurement_manager: [
    Permission.PR_VIEW, Permission.PR_READ, Permission.PR_CREATE, Permission.PR_UPDATE,
    Permission.PR_APPROVE, Permission.PR_REJECT, Permission.PR_DELEGATE, Permission.PR_APPROVE_AS_DELEGATE,
    Permission.PO_VIEW, Permission.PO_READ, Permission.PO_CREATE, Permission.PO_UPDATE, Permission.PO_ARCHIVE,
    Permission.PO_APPROVE, Permission.PO_REJECT, Permission.PO_RELEASE, Permission.PO_ISSUE, Permission.PO_CANCEL,
    Permission.PO_CLOSE, Permission.PO_REOPEN, Permission.PO_EXPORT, Permission.PO_DELEGATE, Permission.PO_APPROVE_AS_DELEGATE,
    Permission.PO_OVERRIDE,
    Permission.QUOT_READ, Permission.QUOT_CREATE, Permission.QUOT_APPROVE,
    Permission.RFQ_READ, Permission.RFQ_CREATE,
    Permission.SUPPLIER_VIEW, Permission.SUPPLIER_READ, Permission.SUPPLIER_CREATE, Permission.SUPPLIER_UPDATE,
    Permission.SUPPLIER_ARCHIVE, Permission.SUPPLIER_APPROVE, Permission.SUPPLIER_BLACKLIST,
    Permission.SUPPLIER_COMPLIANCE_READ, Permission.SUPPLIER_COMPLIANCE_CREATE, Permission.SUPPLIER_PRODUCT_ASSIGN,
    Permission.SUPPLIER_CATEGORY_READ, Permission.SUPPLIER_CATEGORY_CREATE,
    Permission.CATALOG_VIEW, Permission.CATALOG_READ,
    Permission.INVENTORY_VIEW, Permission.INVENTORY_READ,
    Permission.GRN_VIEW, Permission.GRN_READ,
    Permission.ORG_VIEW, Permission.ORG_READ,
    Permission.BI_VIEW, Permission.BI_READ,
  ],

  // Warehouse Operator — Wh scope
  // SoD: Cannot adjust inventory (inventory:adjust belongs to warehouse_supervisor)
  warehouse_operator: [
    Permission.WAREHOUSE_VIEW, Permission.WAREHOUSE_READ,
    Permission.PUTAWAY_VIEW, Permission.PUTAWAY_READ, Permission.PUTAWAY_CREATE, Permission.PUTAWAY_COMPLETE,
    Permission.SCAN_EXECUTE,
    Permission.BARCODE_READ, Permission.BARCODE_PRINT,
    Permission.GRN_VIEW, Permission.GRN_READ,
    Permission.INVENTORY_VIEW, Permission.INVENTORY_READ,
    Permission.INVENTORY_STOCKIN, Permission.INVENTORY_STOCKOUT,
    Permission.INVENTORY_BLOCK, Permission.INVENTORY_EXPIRY_MARK,
    Permission.INVENTORY_RESERVE, Permission.INVENTORY_RESERVE_RELEASE,
    Permission.CATALOG_VIEW, Permission.CATALOG_READ,
    Permission.CUSTOMER_VIEW, Permission.CUSTOMER_READ,
    Permission.ORG_VIEW, Permission.ORG_READ,
  ],

  // Warehouse Supervisor — Wh + Plant scope
  // SoD: Cannot approve inventory adjustments (requires tenant_admin)
  warehouse_supervisor: [
    Permission.WAREHOUSE_VIEW, Permission.WAREHOUSE_READ, Permission.WAREHOUSE_CREATE, Permission.WAREHOUSE_UPDATE,
    Permission.WAREHOUSE_ARCHIVE, Permission.WAREHOUSE_RESTORE, Permission.WAREHOUSE_SETTINGS, Permission.WAREHOUSE_NUMBERING,
    Permission.PUTAWAY_VIEW, Permission.PUTAWAY_READ, Permission.PUTAWAY_CREATE, Permission.PUTAWAY_COMPLETE,
    Permission.PUTAWAY_REASSIGN, Permission.PUTAWAY_OVERRIDE,
    Permission.BARCODE_READ, Permission.BARCODE_CREATE, Permission.BARCODE_PRINT,
    Permission.SCAN_EXECUTE, Permission.SCAN_READ,
    Permission.GRN_VIEW, Permission.GRN_READ, Permission.GRN_CREATE, Permission.GRN_POST, Permission.GRN_CLOSE,
    Permission.INVENTORY_VIEW, Permission.INVENTORY_READ,
    Permission.INVENTORY_STOCKIN, Permission.INVENTORY_STOCKOUT, Permission.INVENTORY_TRANSFER, Permission.INVENTORY_ADJUST,
    Permission.INVENTORY_RESERVE, Permission.INVENTORY_RESERVE_RELEASE,
    Permission.INVENTORY_BLOCK, Permission.INVENTORY_BLOCK_RELEASE, Permission.INVENTORY_EXPIRY_MARK,
    Permission.INVENTORY_REVERSE, Permission.INVENTORY_EXPORT,
    Permission.LEDGER_READ,
    Permission.WAVE_VIEW, Permission.WAVE_READ, Permission.WAVE_CREATE, Permission.WAVE_RELEASE, Permission.WAVE_CANCEL,
    Permission.PICK_VIEW, Permission.PICK_READ, Permission.PICK_CREATE, Permission.PICK_COMPLETE, Permission.PICK_OVERRIDE,
    Permission.PACK_READ, Permission.PACK_CREATE, Permission.PACK_COMPLETE,
    Permission.SHIPMENT_READ, Permission.SHIPMENT_CREATE,
    Permission.CATALOG_VIEW, Permission.CATALOG_READ,
    Permission.ORG_VIEW, Permission.ORG_READ,
    Permission.BI_VIEW, Permission.BI_READ,
  ],

  // Finance Accountant — Company scope
  // SoD: Cannot post GL (gl:post belongs to finance_manager); cannot approve cost revaluations
  finance_accountant: [
    Permission.GL_VIEW, Permission.GL_READ, Permission.GL_CREATE, Permission.GL_UPDATE,
    Permission.COSTING_READ, Permission.COSTING_CREATE, Permission.COSTING_UPDATE,
    Permission.GST_READ, Permission.GST_CREATE, Permission.GST_UPDATE, Permission.GST_EXPORT,
    Permission.FINANCE_READ, Permission.FINANCE_CREATE, Permission.FINANCE_UPDATE,
    Permission.AP_READ, Permission.AR_READ,
    Permission.PAYMENT_CREATE,
    Permission.AUDIT_READ,
    Permission.CATALOG_VIEW, Permission.CATALOG_READ,
    Permission.ORG_VIEW, Permission.ORG_READ,
    Permission.BI_VIEW, Permission.BI_READ,
  ],

  // Finance Manager — Company scope
  // SoD: Cannot create GL entries (gl:create belongs to finance_accountant) — maker-checker
  finance_manager: [
    Permission.GL_VIEW, Permission.GL_READ, Permission.GL_APPROVE, Permission.GL_POST, Permission.GL_REVERSE,
    Permission.GL_ARCHIVE, Permission.GL_DELEGATE, Permission.GL_APPROVE_AS_DELEGATE,
    Permission.COSTING_READ, Permission.COSTING_APPROVE, Permission.COSTING_OVERRIDE,
    Permission.GST_READ, Permission.GST_EXPORT,
    Permission.FINANCE_READ, Permission.FINANCE_PERIOD_CLOSE, Permission.FINANCE_PERIOD_REOPEN,
    Permission.FINANCE_APPROVAL_RULES, Permission.FINANCE_OVERRIDE,
    Permission.AP_READ, Permission.AR_READ,
    Permission.PAYMENT_CREATE, Permission.PAYMENT_APPROVE,
    Permission.AUDIT_READ, Permission.AUDIT_READ_CRITICAL,
    Permission.CATALOG_VIEW, Permission.CATALOG_READ,
    Permission.ORG_VIEW, Permission.ORG_READ,
    Permission.BI_VIEW, Permission.BI_READ,
  ],

  // Manufacturing Supervisor — Plant scope
  // SoD: Cannot approve supplier invoices or payments; cannot modify GL
  manufacturing_supervisor: [
    Permission.BATCH_VIEW, Permission.BATCH_READ, Permission.BATCH_CREATE, Permission.BATCH_UPDATE,
    Permission.BATCH_APPROVE, Permission.BATCH_RELEASE, Permission.BATCH_TRANSITION, Permission.BATCH_SPLIT,
    Permission.BATCH_MERGE, Permission.BATCH_TRACE, Permission.BATCH_ARCHIVE,
    Permission.RECIPE_READ, Permission.RECIPE_CREATE, Permission.RECIPE_UPDATE, Permission.RECIPE_APPROVE, Permission.RECIPE_ARCHIVE,
    Permission.PRODUCTION_READ, Permission.PRODUCTION_CREATE, Permission.PRODUCTION_APPROVE, Permission.PRODUCTION_RELEASE,
    Permission.PRODUCTION_START, Permission.PRODUCTION_COMPLETE, Permission.PRODUCTION_CLOSE,
    Permission.MES_READ,
    Permission.INVENTORY_VIEW, Permission.INVENTORY_READ, Permission.INVENTORY_STOCKIN, Permission.INVENTORY_STOCKOUT,
    Permission.QUALITY_VIEW, Permission.QUALITY_READ, Permission.BATCH_TRACE,
    Permission.CATALOG_VIEW, Permission.CATALOG_READ,
    Permission.ORG_VIEW, Permission.ORG_READ,
    Permission.BI_VIEW, Permission.BI_READ,
  ],

  // Quality Manager — Plant scope
  // SoD: Cannot dispatch goods; cannot modify inventory quantities; can only CREATE holds not release critical ones without manager approval
  quality_manager: [
    Permission.QUALITY_VIEW, Permission.QUALITY_READ, Permission.QUALITY_INSPECT, Permission.QUALITY_APPROVE,
    Permission.QUALITY_REJECT, Permission.QUALITY_HOLD, Permission.QUALITY_HOLD_RELEASE, Permission.QUALITY_OVERRIDE,
    Permission.NCR_READ, Permission.NCR_CREATE, Permission.NCR_APPROVE, Permission.NCR_REJECT,
    Permission.CAPA_READ, Permission.CAPA_CREATE, Permission.CAPA_APPROVE,
    Permission.COA_READ, Permission.COA_SIGN,
    Permission.RECALL_READ, Permission.RECALL_INITIATE, Permission.RECALL_APPROVE, Permission.RECALL_CLOSE,
    Permission.QUALITY_APPROVAL_RULES,
    Permission.BATCH_READ, Permission.BATCH_TRACE,
    Permission.SUPPLIER_COMPLIANCE_READ,
    Permission.INVENTORY_VIEW, Permission.INVENTORY_READ,
    Permission.GRN_VIEW, Permission.GRN_READ,
    Permission.CATALOG_VIEW, Permission.CATALOG_READ,
    Permission.ORG_VIEW, Permission.ORG_READ,
    Permission.AUDIT_READ,
    Permission.BI_VIEW, Permission.BI_READ,
  ],

  // HR Manager — Company scope
  hr_manager: [
    Permission.HR_VIEW, Permission.HR_READ, Permission.HR_CREATE, Permission.HR_UPDATE, Permission.HR_ARCHIVE,
    Permission.ATTENDANCE_READ, Permission.ATTENDANCE_APPROVE, Permission.ATTENDANCE_DELEGATE, Permission.ATTENDANCE_APPROVE_AS_DELEGATE,
    Permission.LEAVE_READ, Permission.LEAVE_APPROVE, Permission.LEAVE_DELEGATE, Permission.LEAVE_APPROVE_AS_DELEGATE, Permission.LEAVE_CANCEL,
    Permission.PERFORMANCE_READ, Permission.PERFORMANCE_CONFIGURE, Permission.PERFORMANCE_APPRAISE, Permission.PERFORMANCE_APPROVE,
    Permission.PAYROLL_READ, Permission.PAYROLL_APPROVE,
    Permission.ORG_VIEW, Permission.ORG_READ,
    Permission.BI_VIEW, Permission.BI_READ,
  ],

  // Auditor — Global scope, READ-ONLY
  // SoD: ZERO write permissions. Cannot create, update, delete, approve, post, or override ANYTHING.
  auditor: [
    Permission.ORG_VIEW, Permission.ORG_READ,
    Permission.CATALOG_VIEW, Permission.CATALOG_READ,
    Permission.CUSTOMER_VIEW, Permission.CUSTOMER_READ,
    Permission.SUPPLIER_VIEW, Permission.SUPPLIER_READ,
    Permission.INVENTORY_VIEW, Permission.INVENTORY_READ,
    Permission.LEDGER_READ,
    Permission.WAREHOUSE_VIEW, Permission.WAREHOUSE_READ,
    Permission.PUTAWAY_VIEW, Permission.PUTAWAY_READ,
    Permission.GRN_VIEW, Permission.GRN_READ,
    Permission.PR_VIEW, Permission.PR_READ,
    Permission.PO_VIEW, Permission.PO_READ,
    Permission.QUOT_READ, Permission.RFQ_READ,
    Permission.SO_VIEW, Permission.SO_READ,
    Permission.ALLOCATION_VIEW, Permission.ALLOCATION_READ,
    Permission.WAVE_VIEW, Permission.WAVE_READ,
    Permission.PICK_VIEW, Permission.PICK_READ,
    Permission.PACK_READ,
    Permission.SHIPMENT_READ,
    Permission.DELIVERY_READ,
    Permission.RETURNS_READ,
    Permission.PRICING_READ,
    Permission.BATCH_VIEW, Permission.BATCH_READ, Permission.BATCH_TRACE,
    Permission.RECIPE_READ,
    Permission.PRODUCTION_READ,
    Permission.MES_READ,
    Permission.QUALITY_VIEW, Permission.QUALITY_READ,
    Permission.NCR_READ, Permission.CAPA_READ, Permission.COA_READ, Permission.RECALL_READ,
    Permission.GL_VIEW, Permission.GL_READ,
    Permission.COSTING_READ,
    Permission.GST_READ,
    Permission.FINANCE_READ,
    Permission.AP_READ, Permission.AR_READ,
    Permission.HR_VIEW, Permission.HR_READ,
    Permission.ATTENDANCE_READ,
    Permission.LEAVE_READ,
    Permission.PERFORMANCE_READ,
    Permission.PAYROLL_READ,
    Permission.CRM_VIEW, Permission.CRM_READ,
    Permission.COMPLAINT_READ, Permission.SERVICE_READ,
    Permission.BI_VIEW, Permission.BI_READ,
    Permission.ALERTS_READ,
    Permission.USER_VIEW, Permission.USER_READ,
    Permission.AUDIT_READ, Permission.AUDIT_READ_CRITICAL, Permission.AUDIT_EXPORT,
    Permission.SCAN_READ,
    Permission.BARCODE_READ,
  ],

  // Break Glass — Global scope, TIME-LIMITED, READ + CONFIGURE ONLY
  // SoD: NO post, approve, delete, override, or payment. Auto-revoked after 4 hours.
  break_glass: [
    // VIEW + READ only across all domains
    Permission.ORG_VIEW, Permission.ORG_READ,
    Permission.CATALOG_VIEW, Permission.CATALOG_READ,
    Permission.CUSTOMER_VIEW, Permission.CUSTOMER_READ,
    Permission.SUPPLIER_VIEW, Permission.SUPPLIER_READ,
    Permission.INVENTORY_VIEW, Permission.INVENTORY_READ,
    Permission.LEDGER_READ,
    Permission.WAREHOUSE_VIEW, Permission.WAREHOUSE_READ,
    Permission.PUTAWAY_VIEW, Permission.PUTAWAY_READ,
    Permission.GRN_VIEW, Permission.GRN_READ,
    Permission.PR_VIEW, Permission.PR_READ,
    Permission.PO_VIEW, Permission.PO_READ,
    Permission.SO_VIEW, Permission.SO_READ,
    Permission.BATCH_VIEW, Permission.BATCH_READ, Permission.BATCH_TRACE,
    Permission.QUALITY_VIEW, Permission.QUALITY_READ,
    Permission.NCR_READ, Permission.CAPA_READ,
    Permission.GL_VIEW, Permission.GL_READ,
    Permission.COSTING_READ, Permission.GST_READ, Permission.FINANCE_READ,
    Permission.HR_VIEW, Permission.HR_READ,
    Permission.BI_VIEW, Permission.BI_READ,
    Permission.AUDIT_READ, Permission.AUDIT_READ_CRITICAL,
    // CONFIGURE only (no create/update/delete)
    Permission.SYSTEM_SETTINGS,
    Permission.SYSTEM_BREAK_GLASS_ACTIVATE,
  ],
}

// ─── Permission Checker ─────────────────────────────────────────

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

  /**
   * Check if two roles conflict (SoD violation).
   * Returns true if assigning both roles to the same user would violate SoD.
   */
  static isRoleConflict(roleA: string, roleB: string): boolean {
    const CONFLICTING_PAIRS: Array<[string, string]> = [
      ['finance_accountant', 'finance_manager'],     // SoD-06: JE creator cannot post
      ['procurement_officer', 'procurement_manager'], // SoD-01: PR creator cannot approve
      ['sales_officer', 'sales_manager'],             // SoD-11: SO creator cannot approve
      ['auditor', 'tenant_admin'],                    // Auditor must be read-only
    ]
    for (const [a, b] of CONFLICTING_PAIRS) {
      if ((roleA === a && roleB === b) || (roleA === b && roleB === a)) return true
    }
    return false
  }
}

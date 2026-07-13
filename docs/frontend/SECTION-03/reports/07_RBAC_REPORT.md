# 07 — RBAC Report

**Section**: 03 — Master Data Management
**Date**: 2026-07-13
**Permission Registry**: `apps/backend/src/core/permissions/registry.ts`

---

## 1. Permission Literals (30 total relevant to Section 03)

| Permission | Literal | Used By |
|---|---|---|
| `ORG_READ` | `org:read` | organization |
| `ORG_CREATE` | `org:create` | organization |
| `ORG_UPDATE` | `org:update` | organization |
| `ORG_DELETE` | `org:delete` | organization |
| `PRODUCT_READ` | `product:read` | product, recipe-bom |
| `PRODUCT_CREATE` | `product:create` | product, recipe-bom |
| `PRODUCT_UPDATE` | `product:update` | product, recipe-bom |
| `PRODUCT_DELETE` | `product:delete` | product |
| `SUPPLIER_READ` | `supplier:read` | supplier |
| `SUPPLIER_CREATE` | `supplier:create` | supplier |
| `SUPPLIER_UPDATE` | `supplier:update` | supplier |
| `SUPPLIER_DELETE` | `supplier:delete` | supplier |
| `SUPPLIER_BLACKLIST` | `supplier:blacklist` | supplier |
| `CUSTOMER_READ` | `customer:read` | customer (FIXED — was using ORG_* proxy) |
| `CUSTOMER_CREATE` | `customer:create` | customer (FIXED) |
| `CUSTOMER_UPDATE` | `customer:update` | customer (FIXED) |
| `CUSTOMER_DELETE` | `customer:delete` | customer (FIXED) |
| `INVENTORY_READ` | `inventory:read` | inventory, warehouse |
| `INVENTORY_POST` | `inventory:post` | inventory, warehouse |
| `INVENTORY_ADJUST` | `inventory:adjust` | inventory |
| `AUDIT_READ` | `audit:read` | gst, product-costing, general-ledger (read) |
| `AUDIT_READ_CRITICAL` | `audit:read:critical` | gst, product-costing, general-ledger (write — FIXED) |
| `SYSTEM_TENANT_CROSS` | `system:tenant:cross` | organization hard-delete |
| `SYSTEM_REFERENCE_UPDATE` | `system:reference:update` | (defined, unused) |
| `AUTH_MANAGE_USERS` | `auth:manage_users` | user-management |
| `AUTH_MANAGE_ROLES` | `auth:manage_roles` | user-management |
| `AUTH_RESET_PASSWORD` | `auth:reset_password` | user-management |
| `IQC_INSPECT` | `iqc:inspect` | quality-foundation |
| `IQC_APPROVE` | `iqc:approve` | quality-foundation |
| `INVENTORY_REVERSE` | `inventory:reverse` | (defined, unused in Section 03) |

## 2. Default Roles (6)

| Role | Permissions | Used By Section 03 |
|---|---|---|
| `tenant_admin` | ALL permissions | Full access to all Section 03 |
| `quality_manager` | IQC_INSPECT, IQC_APPROVE, product:read | Quality tabs, product view |
| `procurement_officer` | supplier:read, supplier:create, supplier:update | Supplier management |
| `procurement_manager` | supplier:*, product:* | Full supplier + product |
| `warehouse_operator` | inventory:read, inventory:post | Warehouse operations |
| `auditor` | audit:read, org:read, product:read, supplier:read, customer:read | Read-only audit |

## 3. Frontend Permission Gating

### Implemented (✅)
| Module | Button | Permission | Implementation |
|---|---|---|---|
| ProductMaster | "New Product" | `product:create` | `{hasPermission('product:create') && <Button>}` |
| ProductMaster | Transition dropdown | `product:update` | `{hasPermission('product:update') && <select>}` |
| ProductMaster | Delete button | `product:delete` | `{hasPermission('product:delete') && p.status !== 'ACTIVE' && <Button>}` |
| PlantMaster | "New Plant" | `org:create` | `{hasPermission('org:create') && <Button>}` |
| OrganizationModule | "Add Entity" | `org:create` | `{hasPermission('org:create') && <Button>}` (Section 01) |

### Not Yet Implemented (❌)
| Module | Button | Permission Needed |
|---|---|---|
| CommercialEngine | "New Price List" | `customer:update` (proxy — should be `pricing:create`) |
| CommercialEngine | "New Tax Group" | `customer:update` (proxy) |
| CommercialEngine | "New Promotion" | `customer:update` (proxy) |
| BusinessPartner | "New Partner" | `customer:create` or `supplier:create` |
| BusinessPartner | "New Contact" | `customer:update` or `supplier:update` |
| BusinessPartner | "New Address" | `customer:update` or `supplier:update` |
| BusinessPartner | "Add Compliance" | `supplier:update` |
| Identification | "Generate Barcode" | `product:update` |
| Warehouse | "New Zone/Aisle/Rack/Bin" | `inventory:post` (should be `warehouse:create`) |

## 4. Backend Permission Fixes Applied

### Fix 1: Customer Routes — Proxy Permission Bug
**Before**: `customer/routes/index.ts` lines 51-54 used `ORG_*` as proxy for `CUSTOMER_*`
**After**: Changed to use actual `CUSTOMER_*` permissions
```typescript
// BEFORE
const CUSTOMER_READ = Permission.ORG_READ
const CUSTOMER_CREATE = Permission.ORG_CREATE

// AFTER
const CUSTOMER_READ = Permission.CUSTOMER_READ
const CUSTOMER_CREATE = Permission.CUSTOMER_CREATE
```

### Fix 2: Finance Module Write Permission Gap
**Before**: `gst-taxation`, `product-costing`, `general-ledger` routes used `AUDIT_READ` for both read AND write
**After**: Changed `WRITE_PERM` to `AUDIT_READ_CRITICAL`
```typescript
// BEFORE
const WRITE_PERM = AUDIT_READ

// AFTER
const WRITE_PERM = AUDIT_READ_CRITICAL
```

## 5. Permission Check Flow

```
User login → useAuthStore.login(email, password)
  → POST /api/v1/auth/login
  → Returns { user, session } with user.permissions[]
  → Store persists to localStorage['suop_auth']

Component render → useAuthStore().hasPermission('product:create')
  → Returns true if:
    - isDemoMode === true, OR
    - user.roles.includes('SUPER_ADMIN'), OR
    - user.permissions.includes('product:create')

Backend request → Authorization: Bearer <token>
  → Middleware extracts user from JWT
  → requirePermission(PERMISSION) guard checks user.permissions
  → If missing → 403 Forbidden
```

---

**END OF RBAC REPORT**

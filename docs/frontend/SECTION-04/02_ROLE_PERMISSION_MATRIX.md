# 02 — Role Permission Matrix

**Date**: 2026-07-13
**Status**: FINAL

---

## Enterprise Roles (12 roles)

### Current Roles (6 — to be revised)
1. `tenant_admin` — System administrator (all permissions)
2. `quality_manager` — Quality assurance manager
3. `procurement_officer` — Procurement requester/buyer
4. `procurement_manager` — Procurement approver/manager
5. `warehouse_operator` — Warehouse floor operator
6. `auditor` — Read-only compliance auditor

### New Roles (6 — to be added)
7. `sales_officer` — Sales order creator
8. `sales_manager` — Sales approver/manager
9. `warehouse_supervisor` — Warehouse shift supervisor
10. `finance_accountant` — GL accountant
11. `finance_manager` — Finance approver
12. `manufacturing_supervisor` — Production supervisor

---

## Permission Matrix

Legend: ✅ Allow | ❌ Deny | 🔶 Conditional (requires approval workflow)

### 1. Organization & Catalog

| Permission | tenant_admin | sales_officer | sales_manager | procurement_officer | procurement_manager | warehouse_operator | warehouse_supervisor | quality_manager | finance_accountant | finance_manager | manufacturing_supervisor | auditor |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `org:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `org:create` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `org:update` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `org:delete` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `dept:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `costcenter:read` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `catalog:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `catalog:create` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `catalog:update` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `catalog:approve` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 2. Partners (Customers & Suppliers)

| Permission | tenant_admin | sales_officer | sales_manager | procurement_officer | procurement_manager | warehouse_operator | warehouse_supervisor | quality_manager | finance_accountant | finance_manager | manufacturing_supervisor | auditor |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `customer:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `customer:create` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `customer:update` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `customer:approve` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `customer:credit:read` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| `customer:credit:update` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `supplier:read` | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `supplier:create` | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `supplier:update` | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `supplier:blacklist` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `supplier:approve` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 3. Inventory & Warehouse

| Permission | tenant_admin | sales_officer | sales_manager | procurement_officer | procurement_manager | warehouse_operator | warehouse_supervisor | quality_manager | finance_accountant | finance_manager | manufacturing_supervisor | auditor |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `inventory:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `inventory:stockin` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `inventory:stockout` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `inventory:transfer` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `inventory:adjust` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `inventory:adjust:approve` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `inventory:reserve` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `inventory:block` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `inventory:reverse` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `warehouse:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `warehouse:create` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `putaway:read` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `putaway:complete` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `scan:execute` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `grn:read` | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| `grn:create` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `grn:post` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 4. Procurement

| Permission | tenant_admin | procurement_officer | procurement_manager | warehouse_supervisor | auditor |
|---|---|---|---|---|---|
| `pr:read` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `pr:create` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `pr:approve` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `po:read` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `po:create` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `po:update` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `po:approve` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `po:issue` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `po:cancel` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `po:receive` | ✅ | ❌ | ❌ | ✅ | ❌ |
| `quot:read` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `rfq:read` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `rfq:create` | ✅ | ✅ | ✅ | ❌ | ❌ |

### 5. Sales

| Permission | tenant_admin | sales_officer | sales_manager | warehouse_operator | warehouse_supervisor | finance_accountant | auditor |
|---|---|---|---|---|---|---|---|
| `so:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `so:create` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `so:update` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `so:approve` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `so:hold` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `allocation:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `wave:read` | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| `wave:create` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `wave:release` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `pick:read` | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| `pick:complete` | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `pack:read` | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| `pack:complete` | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `shipment:read` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `shipment:create` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `delivery:read` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| `delivery:pod` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `pricing:read` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| `pricing:create` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `pricing:calculate` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### 6. Manufacturing & Quality

| Permission | tenant_admin | manufacturing_supervisor | quality_manager | warehouse_supervisor | auditor |
|---|---|---|---|---|---|
| `batch:read` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `batch:create` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `batch:transition` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `batch:split` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `batch:merge` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `batch:trace` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `recipe:read` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `recipe:create` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `recipe:approve` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `mes:read` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `quality:read` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `quality:inspect` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `quality:approve` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `quality:hold` | ✅ | ❌ | ✅ | ✅ | ❌ |
| `quality:hold:release` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `ncr:read` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `ncr:create` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `ncr:approve` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `capa:read` | ✅ | ✅ | ✅ | ❌ | ✅ |
| `coa:sign` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `recall:initiate` | ✅ | ❌ | ✅ | ❌ | ❌ |

### 7. Finance

| Permission | tenant_admin | finance_accountant | finance_manager | procurement_manager | sales_manager | auditor |
|---|---|---|---|---|---|---|
| `gl:read` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `gl:create` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `gl:post` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `gl:reverse` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `costing:read` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `costing:create` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `costing:approve` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `gst:read` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `gst:create` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `finance:read` | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| `finance:period:close` | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `audit:read` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `audit:read:critical` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 8. HR & Administration

| Permission | tenant_admin | hr_officer | hr_manager | auditor |
|---|---|---|---|---|
| `hr:read` | ✅ | ✅ | ✅ | ✅ |
| `hr:create` | ✅ | ✅ | ✅ | ❌ |
| `attendance:read` | ✅ | ✅ | ✅ | ✅ |
| `attendance:create` | ✅ | ✅ | ✅ | ❌ |
| `attendance:approve` | ✅ | ❌ | ✅ | ❌ |
| `leave:approve` | ✅ | ❌ | ✅ | ❌ |
| `user:read` | ✅ | ✅ | ✅ | ✅ |
| `user:create` | ✅ | ❌ | ✅ | ❌ |
| `user:update` | ✅ | ❌ | ✅ | ❌ |
| `role:manage` | ✅ | ❌ | ❌ | ❌ |
| `system:configure` | ✅ | ❌ | ❌ | ❌ |

---

## Existing Role Revisions

### Roles to Revise

| Role | Current Issue | Fix |
|---|---|---|
| `quality_manager` | Has `CUSTOMER_CREATE/UPDATE/DELETE` (shouldn't) | Remove customer write permissions |
| `procurement_officer` | Has `CUSTOMER_CREATE/UPDATE/DELETE` (shouldn't) | Remove customer write permissions |
| `procurement_manager` | Has `CUSTOMER_CREATE/UPDATE/DELETE` (shouldn't) | Remove customer write permissions |
| `warehouse_operator` | Has `CUSTOMER_READ` (acceptable for shipping labels) | Keep |
| `auditor` | Correct (read-only) | No change needed |

### Roles to Add

| Role | Purpose | Key Permissions |
|---|---|---|
| `sales_officer` | Create/edit sales orders | so:read/create/update, customer:read/create/update, pricing:calculate |
| `sales_manager` | Approve sales, manage pricing | All sales_officer + so:approve/hold, pricing:create |
| `warehouse_supervisor` | Supervise warehouse operations | All warehouse_operator + inventory:transfer/adjust, wave:create/release, putaway:reassign |
| `finance_accountant` | Create GL entries, costing | gl:read/create, costing:read/create, gst:read/create, finance:read |
| `finance_manager` | Post GL, approve costing, close periods | All finance_accountant + gl:post/reverse, costing:approve, finance:period:close |
| `manufacturing_supervisor` | Manage production, batches | batch:*, recipe:*, production:*, mes:read, inventory:stockin/stockout |

---

**END OF ROLE PERMISSION MATRIX**

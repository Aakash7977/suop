# 02 — Role Permission Matrix (FINAL)

**Date**: 2026-07-13
**Status**: FINAL — PERMANENT SECURITY FOUNDATION

---

## Enterprise Roles (14 roles)

### Existing Roles (6 — revised)
1. `tenant_admin` — System administrator (global scope)
2. `quality_manager` — Quality assurance manager (plant scope)
3. `procurement_officer` — Procurement requester (dept scope)
4. `procurement_manager` — Procurement approver (company scope)
5. `warehouse_operator` — Warehouse floor operator (wh scope)
6. `auditor` — Read-only compliance auditor (global read-only)

### New Roles (6)
7. `sales_officer` — Sales order creator (dept scope)
8. `sales_manager` — Sales approver (company scope)
9. `warehouse_supervisor` — Warehouse shift supervisor (wh + plant scope)
10. `finance_accountant` — GL accountant (company scope)
11. `finance_manager` — Finance approver (company scope)
12. `manufacturing_supervisor` — Production supervisor (plant scope)

### Emergency Role (1)
13. `break_glass` — Emergency access (global, time-limited, read + configure only, NO post/approve/delete/override)

### Future Role (1)
14. `hr_manager` — HR manager (company scope)

---

## Data Scope Summary by Role

| Role | Default Scope | Can View | Can Create | Can Approve | Can Post |
|---|---|---|---|---|---|
| tenant_admin | global | Everything | Everything | Everything | Everything |
| sales_officer | dept | Dept SOs | Dept SOs | ❌ | ❌ |
| sales_manager | company | Company SOs | Company SOs | Company SOs | ❌ |
| procurement_officer | dept | Dept PRs | Dept PRs | ❌ | ❌ |
| procurement_manager | company | Company POs | Company POs | Company POs | ❌ |
| warehouse_operator | wh | Wh inventory | Wh transactions | ❌ | ❌ |
| warehouse_supervisor | wh+plant | Plant warehouse | Plant operations | Wh adjustments | ❌ |
| finance_accountant | company | Company GL | Company JE | ❌ | ❌ |
| finance_manager | company | Company finance | Company finance | Company JE | Company GL |
| manufacturing_supervisor | plant | Plant production | Plant batches | Plant batches | ❌ |
| quality_manager | plant | Plant quality | Plant inspections | Plant quality | ❌ |
| auditor | global (read-only) | Everything (read) | ❌ | ❌ | ❌ |
| break_glass | global (time-limited) | Everything (read) | ❌ | ❌ | ❌ |
| hr_manager | company | Company HR | Company HR | Company leave/attendance | ❌ |

---

## Key Role Definitions (Most Critical)

### tenant_admin (Global, All Permissions)
- **Scope**: global
- **SoD Note**: Has all permissions BUT should NOT perform day-to-day operations (maker role). Only configures system, manages users, and resolves escalations.
- **Permissions**: ALL ~329 permissions

### auditor (Global, Read-Only)
- **Scope**: global (read-only)
- **SoD Note**: ZERO write permissions. Cannot create, update, delete, approve, post, or override ANYTHING.
- **Permissions**: All `*:view`, `*:read`, `audit:read`, `audit:read:critical`, `audit:export`, `ledger:read`

### break_glass (Global, Time-Limited, Restricted)
- **Scope**: global (4-hour max, auto-revoked)
- **SoD Note**: READ + CONFIGURE only. NO post, approve, delete, override, or payment.
- **Permissions**: All `*:view`, `*:read`, `*:settings`, `system:break-glass:activate`
- **Restrictions**: Mandatory reason, CRITICAL audit logging, rate-limited (2x/24h), reviewed within 24h

### sales_officer (Dept Scope)
- **Permissions**: so:view/read/create/update, customer:view/read/create/update, pricing:read/calculate, allocation:read, inventory:read:dept
- **SoD Note**: Cannot approve SOs (so:approve belongs to sales_manager)

### sales_manager (Company Scope)
- **All sales_officer permissions PLUS**: so:approve/reject/hold/release/cancel/close/reopen, so:delegate, so:approve:as-delegate, so:override, pricing:create, pricing:override, pricing:approval-rules
- **SoD Note**: Cannot post to GL (gl:post belongs to finance_manager)

### warehouse_operator (Wh Scope)
- **Permissions**: warehouse:view/read, putaway:view/read/create/complete, scan:execute, barcode:read/print, grn:view/read, inventory:view/read/stockin/stockout:wh, inventory:block, inventory:expiry:mark, catalog:view/read
- **SoD Note**: Cannot adjust inventory (inventory:adjust belongs to warehouse_supervisor)

### warehouse_supervisor (Wh + Plant Scope)
- **All warehouse_operator permissions PLUS**: warehouse:create/update/archive/restore, putaway:reassign/override, inventory:transfer, inventory:adjust, inventory:reserve, inventory:reserve:release, inventory:block:release, inventory:reverse, inventory:export, wave:read/create/release/cancel, pick:read/create/complete/override, grn:create/post/close, scan:read, warehouse:settings, warehouse:numbering
- **SoD Note**: Cannot approve inventory adjustments (inventory:adjust:approve requires warehouse_manager or tenant_admin)

### finance_accountant (Company Scope)
- **Permissions**: gl:view/read/create/update, costing:read/create/update, gst:read/create/update, finance:read/create/update, ap:read, ar:read, audit:read
- **SoD Note**: Cannot post GL entries (gl:post belongs to finance_manager). Cannot approve cost revaluations (costing:approve belongs to finance_manager).

### finance_manager (Company Scope)
- **All finance_accountant permissions PLUS**: gl:approve/post/reverse/archive, gl:delegate, gl:approve:as-delegate, costing:approve, costing:override, finance:period:close/reopen, finance:approval-rules, finance:override, payment:create/approve, audit:read:critical
- **SoD Note**: Cannot create GL entries (gl:create belongs to finance_accountant). Maker-checker enforced.

### manufacturing_supervisor (Plant Scope)
- **Permissions**: batch:view/read/create/update/approve/release/transition/split/merge/trace/archive, recipe:read/create/update/approve/archive, production:read/create/approve/release/start/complete/close, mes:read, inventory:read:plant, inventory:stockin/stockout:plant, quality:read, batch:trace
- **SoD Note**: Cannot approve supplier invoices or payments. Cannot modify GL.

### quality_manager (Plant Scope)
- **Permissions**: quality:view/read/inspect/approve/reject/hold/hold:release/override, ncr:read/create/approve/reject, capa:read/create/approve, coa:read/sign, recall:read/initiate/approve/close, quality:approval-rules, batch:read/trace, supplier:compliance:read, inventory:read:plant
- **SoD Note**: Cannot dispatch goods (no shipment:*). Cannot modify inventory quantities (no inventory:adjust). Can only CREATE quality holds, not release them without manager approval for critical holds.

### procurement_officer (Dept Scope)
- **Permissions**: pr:view/read/create/update/delete, po:view/read/create/update, quot:read/create, rfq:read/create, supplier:view/read/create/update, catalog:view/read, inventory:read:dept
- **SoD Note**: Cannot approve PRs or POs (pr:approve/po:approve belong to procurement_manager). Cannot receive goods (po:receive belongs to warehouse).

### procurement_manager (Company Scope)
- **All procurement_officer permissions PLUS**: pr:approve/reject/delegate/approve:as-delegate, po:approve/reject/release/issue/cancel/close/reopen/export/delegate/approve:as-delegate/override, supplier:blacklist/approve, quot:approve
- **SoD Note**: Cannot receive goods (po:receive belongs to warehouse). Cannot approve payments (payment:approve belongs to finance_manager).

---

## Role Assignment Rules

1. **One primary role**: Each user has ONE primary role that defines their main job function
2. **Secondary roles**: Users may have secondary roles for delegation coverage (e.g., sales_manager as secondary for sales_officer)
3. **Conflict check**: System must prevent assignment of conflicting roles (e.g., finance_accountant + finance_manager violates maker-checker for GL)
4. **Break glass**: Cannot be a permanent role — activated on-demand with time limit

---

## Conflict Detection Matrix

| Role A | Role B | Conflict? | Reason |
|---|---|---|---|
| finance_accountant | finance_manager | ✅ YES | Maker-checker: JE creator cannot post |
| procurement_officer | procurement_manager | ✅ YES | Maker-checker: PR creator cannot approve |
| sales_officer | sales_manager | ✅ YES | Maker-checker: SO creator cannot approve |
| warehouse_operator | warehouse_supervisor | ❌ NO | Supervisor can override but maker-checker enforced for adjustments |
| quality_manager | manufacturing_supervisor | ⚠️ CONDITIONAL | Quality should be independent from production |
| auditor | Any write role | ✅ YES | Auditor must be read-only |
| break_glass | Any role (simultaneous) | ✅ YES | Break glass is exclusive during activation |

---

**END OF ROLE PERMISSION MATRIX (FINAL)**

# 06 — Phase 1 Implementation Plan

**Date**: 2026-07-13
**Status**: FINAL (pending approval)

---

## 1. Objective

Implement the approved enterprise permission architecture:
- Replace 38 permissions (many proxy) with ~215 domain-specific permissions
- Add 6 new roles (total 12)
- Update ~30 route files to use new permissions
- Remove all proxy permissions (AUDIT_READ, ORG_*, CUSTOMER_*, PRODUCT_* as proxies)
- Enforce Separation of Duties through role design

## 2. Implementation Steps

### Step 1: Rewrite Permission Registry (2 hours)
**File**: `apps/backend/src/core/permissions/registry.ts`

1. Replace the `Permission` enum with ~215 domain-specific permissions organized by domain
2. Add backward compatibility aliases for renamed permissions
3. Define 12 roles (6 revised + 6 new)
4. Keep `PermissionChecker` class unchanged
5. Add SoD validation comment block

### Step 2: Update Route Files (10 hours)

**Priority order** (by business criticality):

| # | Module | File | Old Permissions | New Permissions | Effort |
|---|---|---|---|---|---|
| 1 | inventory | `routes/index.ts` | INVENTORY_READ, INVENTORY_POST, INVENTORY_ADJUST | inventory:read, inventory:stockin, inventory:stockout, inventory:reserve, inventory:block, inventory:expiry:mark | 0.5h |
| 2 | warehouse | `routes/index.ts` | INVENTORY_READ, INVENTORY_POST | warehouse:read, warehouse:create, putaway:read, putaway:create, putaway:complete, barcode:read, barcode:create, barcode:print, scan:execute, scan:read | 0.5h |
| 3 | goods-receipt | `routes/index.ts` | GRN_READ, GRN_CREATE, GRN_POST | grn:read, grn:create, grn:post | 0.25h |
| 4 | product-costing | `routes/index.ts` | AUDIT_READ, AUDIT_READ_CRITICAL | costing:read, costing:create, costing:update, costing:delete, costing:approve | 0.25h |
| 5 | general-ledger | `routes/index.ts` | AUDIT_READ, AUDIT_READ_CRITICAL | gl:read, gl:create, gl:update, gl:delete, gl:post | 0.25h |
| 6 | gst-taxation | `routes/index.ts` | AUDIT_READ, AUDIT_READ_CRITICAL | gst:read, gst:create, gst:update, gst:delete | 0.25h |
| 7 | financial-foundation | `routes/index.ts` | AUDIT_READ, AUDIT_READ_CRITICAL | finance:read, finance:create, finance:period:close | 0.25h |
| 8 | sales-order | `routes/index.ts` | CUSTOMER_READ, CUSTOMER_UPDATE | so:read, so:create, so:update, so:approve, so:hold, so:release | 0.5h |
| 9 | order-fulfillment | `routes/index.ts` | CUSTOMER_READ, CUSTOMER_UPDATE | allocation:read, allocation:create, wave:read, wave:create | 0.25h |
| 10 | pick-pack-dispatch | `routes/index.ts` | CUSTOMER_READ, CUSTOMER_UPDATE | pick:read, pick:create, pick:complete, pack:read, pack:create, pack:complete, shipment:read, shipment:create | 0.5h |
| 11 | delivery-management | `routes/index.ts` | CUSTOMER_READ, CUSTOMER_UPDATE | delivery:read, delivery:create, delivery:pod | 0.25h |
| 12 | customer-returns | `routes/index.ts` | CUSTOMER_READ, CUSTOMER_UPDATE | returns:read, returns:create, returns:approve | 0.25h |
| 13 | pricing-engine | `routes/index.ts` | CUSTOMER_READ, CUSTOMER_UPDATE | pricing:read, pricing:create, pricing:calculate | 0.25h |
| 14 | batch-manufacturing | `routes/index.ts` | PRODUCT_READ, PRODUCT_CREATE, PRODUCT_UPDATE | batch:read, batch:create, batch:transition, batch:split, batch:merge, batch:trace | 0.25h |
| 15 | mes | `routes/index.ts` | PRODUCT_READ, PRODUCT_CREATE, PRODUCT_UPDATE | mes:read, mes:create (machine status) | 0.25h |
| 16 | recipe-bom | `routes/index.ts` | PRODUCT_READ, PRODUCT_CREATE, PRODUCT_UPDATE | recipe:read, recipe:create, recipe:approve | 0.25h |
| 17 | quality-inspection | `routes/index.ts` | IQC_INSPECT, IQC_APPROVE, NCR_CREATE, NCR_APPROVE, GRN_READ | quality:read, quality:inspect, quality:approve, quality:hold, quality:hold:release, ncr:read, ncr:create, ncr:approve, capa:read, capa:create | 0.5h |
| 18 | attendance-shift | `routes/index.ts` | AUDIT_READ, AUDIT_READ_CRITICAL | attendance:read, attendance:create, attendance:update, attendance:approve | 0.25h |
| 19 | performance-management | `routes/index.ts` | AUDIT_READ, AUDIT_READ_CRITICAL | performance:read, performance:configure | 0.25h |
| 20 | alerts-kpi-engine | `routes/index.ts` | AUDIT_READ, AUDIT_READ_CRITICAL | alerts:read, alerts:configure, alerts:admin | 0.25h |
| 21 | procurement | `routes/index.ts` | PO_READ, PO_CREATE, PO_UPDATE, PO_DELETE | pr:read, pr:create, pr:update, pr:approve | 0.25h |
| 22 | customer | `routes/index.ts` | CUSTOMER_READ, CUSTOMER_CREATE, CUSTOMER_UPDATE, CUSTOMER_DELETE (currently ORG_*) | customer:read, customer:create, customer:update, customer:delete, customer:approve, customer:credit:read | 0.25h |
| 23-30 | Remaining modules (AP, AR, CRM, etc.) | Various | Various proxies | Domain-specific | 2h |

### Step 3: Update Default Roles (1 hour)
**File**: `apps/backend/src/core/permissions/registry.ts`

Revise existing 6 roles:
- `tenant_admin` — all permissions (unchanged scope, new permission names)
- `quality_manager` — remove customer write, add quality domain permissions
- `procurement_officer` — remove customer write, add procurement domain permissions
- `procurement_manager` — remove customer write, add procurement domain permissions
- `warehouse_operator` — add warehouse domain permissions, keep INVENTORY_ADJUST (now `inventory:adjust`)
- `auditor` — read-only across all domains

Add 6 new roles:
- `sales_officer` — SO create/update, customer create/update, pricing calculate
- `sales_manager` — All sales_officer + SO approve/hold, pricing create
- `warehouse_supervisor` — All warehouse_operator + inventory transfer/adjust, wave create/release
- `finance_accountant` — GL create, costing create, GST read/create, finance read
- `finance_manager` — All finance_accountant + GL post/reverse, costing approve, period close
- `manufacturing_supervisor` — Batch/recipe/production/MES permissions

### Step 4: Verify Builds (1 hour)
1. Backend build: `cd apps/backend && bun run build`
2. Frontend build: `npx next build`
3. Run backend tests: `cd apps/backend && bun test`
4. Verify no route uses proxy permissions: `grep -r "AUDIT_READ\|ORG_READ.*proxy\|CUSTOMER_READ.*proxy" apps/backend/src/modules/*/routes/`

### Step 5: Generate Phase 1 Report (30 min)

---

## 3. Quality Gates

| Gate | Criteria | Verification |
|---|---|---|
| No proxy permissions | Zero uses of AUDIT_READ/ORG_*/CUSTOMER_*/PRODUCT_* as proxy for non-domain modules | `grep` across all route files |
| All permissions in registry | Every permission used in a route file exists in `Permission` enum | TypeScript compilation |
| All roles have valid permissions | Every permission in DEFAULT_ROLES exists in `Permission` enum | TypeScript compilation |
| SoD enforced | No role has both create+approve for same entity | Manual review of role definitions |
| Backend build passes | `bun run build` succeeds | Build command |
| Frontend build passes | `npx next build` succeeds | Build command |
| Backend tests pass | All existing tests pass | `bun test` |
| No broken imports | All `Permission.*` references resolve | TypeScript compilation |

---

## 4. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Route file uses permission not in registry | Medium | Build fails | TypeScript catches at compile time |
| Role missing critical permission | Medium | User can't perform job function | Test each role's core workflow |
| SoD violation introduced | Low | Security risk | Manual review of role definitions |
| Frontend `hasPermission()` calls break | Low | UI doesn't show/hide correctly | Frontend uses string literals — no enum dependency |

---

**END OF PHASE 1 IMPLEMENTATION PLAN**

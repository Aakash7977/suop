# SECTION 04 — Architecture Review

**Date**: 2026-07-13
**Review Type**: Architecture Verification (NO code changes)
**Scope**: All API clients, module ownership, shared infrastructure
**Status**: REVIEW COMPLETE — issues identified, recommendations provided

---

## 1. New API Clients Created

During Section 04 Phase 2, **7 new API clients** were created in `src/sections/04-operations/api/clients.ts`:

| # | Client | Backend Module | Mount Prefix | Methods | Current Location |
|---|---|---|---|---|---|
| 1 | `costingApi` | `product-costing/` | `/api/v1/finance/costing` | 6 | `src/sections/04-operations/api/clients.ts` |
| 2 | `fulfillmentApi` | `order-fulfillment/` | `/api/v1/sales/fulfillment` | 4 | `src/sections/04-operations/api/clients.ts` |
| 3 | `pickPackDispatchApi` | `pick-pack-dispatch/` | `/api/v1/sales/pick-pack-dispatch` | 6 | `src/sections/04-operations/api/clients.ts` |
| 4 | `deliveryApi` | `delivery-management/` | `/api/v1/sales/delivery` | 6 | `src/sections/04-operations/api/clients.ts` |
| 5 | `workforceApi` | `attendance-shift/` | `/api/v1/hrms/attendance` | 6 | `src/sections/04-operations/api/clients.ts` |
| 6 | `salesOrderApi` | `sales-order/` | `/api/v1/sales/orders` | 6 | `src/sections/04-operations/api/clients.ts` |
| 7 | `batchMfgApi` | `batch-manufacturing/` | `/api/v1/manufacturing/batches` | 9 | `src/sections/04-operations/api/clients.ts` |

---

## 2. Should Keep / Should Merge / Should Move

### Verdict for Each Client

| # | Client | Verdict | Target Location | Reason |
|---|---|---|---|---|
| 1 | `costingApi` | **MOVE** | `src/modules/product-costing/api/client.ts` | Backend module `product-costing/` exists. Client must co-locate with its backend module. All 14 existing clients follow this pattern. Section-local placement violates SSOT — other sections cannot import it. |
| 2 | `fulfillmentApi` | **MOVE** | `src/modules/order-fulfillment/api/client.ts` | Backend module `order-fulfillment/` exists. Same reason as above. |
| 3 | `pickPackDispatchApi` | **MOVE** | `src/modules/pick-pack-dispatch/api/client.ts` | Backend module `pick-pack-dispatch/` exists. Same reason. |
| 4 | `deliveryApi` | **MOVE** | `src/modules/delivery-management/api/client.ts` | Backend module `delivery-management/` exists. Same reason. |
| 5 | `workforceApi` | **MOVE** | `src/modules/attendance-shift/api/client.ts` | Backend module `attendance-shift/` exists. Same reason. |
| 6 | `salesOrderApi` | **MOVE** | `src/modules/sales-order/api/client.ts` | Backend module `sales-order/` exists. Same reason. |
| 7 | `batchMfgApi` | **MOVE** | `src/modules/batch-manufacturing/api/client.ts` | Backend module `batch-manufacturing/` exists. Same reason. |

### Alternative: Domain-Level Merge (SAP SD Pattern)

Clients #2, #3, #4, #6 all call `/api/v1/sales/*` endpoints. In SAP, SD (Sales & Distribution) is ONE module with sub-components. These 4 clients COULD be merged into a single `salesApi`:

```
src/modules/sales/api/client.ts
├── salesApi.orders (list, get, create, transition, hold, releaseHold)
├── salesApi.fulfillment (listAllocations, createAllocation, listWaves, createWave)
├── salesApi.pickPackDispatch (listPickLists, createPickList, ...)
└── salesApi.delivery (listDeliveryOrders, createDeliveryOrder, ...)
```

**However**: The backend has 4 SEPARATE route files (`sales-order/routes`, `order-fulfillment/routes`, `pick-pack-dispatch/routes`, `delivery-management/routes`). The frontend should mirror the backend module structure. Creating a `src/modules/sales/` directory when no `sales/` backend module exists would create confusion.

**Recommendation**: MOVE each client to its respective backend module directory (not merge). This maintains 1:1 correspondence between backend modules and frontend clients.

### Section 03 Has the Same Issue (Pre-Existing Technical Debt)

Section 03 created 3 clients in `src/sections/03-master-data/api/clients.ts` that also violate SSOT:

| Client | Should Be At | Current Location |
|---|---|---|
| `pricingApi` | `src/modules/pricing-engine/api/client.ts` | `src/sections/03-master-data/api/clients.ts` |
| `gstApi` | `src/modules/gst-taxation/api/client.ts` | `src/sections/03-master-data/api/clients.ts` |
| `financeApi` | `src/modules/financial-foundation/api/client.ts` | `src/sections/03-master-data/api/clients.ts` |

**These should also be moved** but are outside Section 04 scope.

---

## 3. SSOT Violation Analysis

### Violation 1: Section-Local API Clients
- **What**: 7 API clients created in `src/sections/04-operations/api/clients.ts` instead of their backend module directories
- **Impact**: Other sections (05, 06, ...) cannot import these clients without importing from a Section 04 path
- **Fix**: Move each client to `src/modules/<backend-module>/api/client.ts`
- **Severity**: HIGH — violates the established pattern used by all 14 existing clients

### Violation 2: Inline `apiFetch` Duplication (Pre-Existing)
- **What**: 12 existing API clients each define their own inline `apiFetch` function
- **Evidence**: `grep -c "async function apiFetch" src/modules/*/api/client.ts` shows 12 copies
- **Shared alternative**: `src/lib/api.ts` exports `apiFetch` (created in Section 03 R2)
- **Impact**: Token management logic is duplicated 12 times; if auth token logic changes, 12 files must be updated
- **Fix**: Replace each inline `apiFetch` with `import { apiFetch } from '@/lib/api'`
- **Severity**: MEDIUM — works correctly but is maintenance hazard
- **Note**: The 7 new Section 04 clients CORRECTLY use the shared `apiFetch` from `@/lib/api` — this is the right pattern

### Violation 3: `s28PriorityBadge` Not Shared
- **What**: `s28PriorityBadge` is defined in `src/sections/04-operations/utils/helpers.ts` (Section-04-private)
- **Impact**: Future sections that need priority badges will duplicate this function
- **Fix**: Promote to `src/lib/badges.ts` alongside `badgeForStatus`
- **Severity**: LOW — only 5 entries, minimal duplication risk

### Violation 4: Mock Data Constants in Shared Utils
- **What**: `S28_WAREHOUSES` and `S28_ZONES` are hardcoded mock data arrays in `src/sections/04-operations/utils/helpers.ts`
- **Impact**: These are mock data that should be deleted when modules are wired to live API; keeping them in "utils" implies they are permanent
- **Fix**: Delete when WavePlanning and other Sprint 28+ modules are wired to `orgWarehouseApi.list()`
- **Severity**: LOW — temporary, will be removed during API wiring

---

## 4. Dependency Graph

```
Section 04 Frontend Modules (38)
├── Wired to existing API clients (3)
│   ├── InventoryModule → inventoryApi (src/modules/inventory/api/client.ts) ✅
│   ├── GoodsReceiptModule → goodsReceiptApi (src/modules/goods-receipt/api/client.ts) ✅
│   └── PutawayModule → warehouseApi (src/modules/warehouse/api/client.ts) ✅
│
├── Wired to NEW Section 04-local clients (8)
│   ├── StockIssueModule → inventoryApi (existing, reused) ✅
│   ├── ReservationModule → inventoryApi (existing, reused) ✅
│   ├── BatchExpiryModule → inventoryApi (existing, reused) ✅
│   ├── CostingModule → costingApi (NEW, WRONG LOCATION) ❌
│   ├── FulfillmentModule → pickPackDispatchApi (NEW, WRONG LOCATION) ❌
│   ├── DispatchModule → deliveryApi (NEW, WRONG LOCATION) ❌
│   ├── WavePlanningModule → fulfillmentApi (NEW, WRONG LOCATION) ❌
│   └── WorkforceModule → workforceApi (NEW, WRONG LOCATION) ❌
│
├── Not wired — backend exists but no client (4)
│   ├── (salesOrderApi created but not yet imported by any module)
│   ├── (batchMfgApi created but not yet imported by any module)
│   ├── performance-management (NO client at all)
│   ├── alerts-kpi-engine (NO client at all)
│   ├── mes (NO client at all)
│   └── customer-returns (NO client at all)
│
└── Not wired — NO backend (27 modules)
    └── EmptyState ready (imports added)
```

---

## 5. Owner Module Map

Verifies: One Business Entity = One Owner Module = One API Client Location

| Business Entity | Backend Module | Frontend Client Location | SSOT Compliant? |
|---|---|---|---|
| Inventory | `inventory/` | `src/modules/inventory/api/client.ts` | ✅ Yes |
| Goods Receipt | `goods-receipt/` | `src/modules/goods-receipt/api/client.ts` | ✅ Yes |
| Warehouse (operational) | `warehouse/` | `src/modules/warehouse/api/client.ts` | ✅ Yes |
| Product Costing | `product-costing/` | `src/sections/04-operations/api/clients.ts` | ❌ NO — should be `src/modules/product-costing/api/client.ts` |
| Order Fulfillment | `order-fulfillment/` | `src/sections/04-operations/api/clients.ts` | ❌ NO — should be `src/modules/order-fulfillment/api/client.ts` |
| Pick-Pack-Dispatch | `pick-pack-dispatch/` | `src/sections/04-operations/api/clients.ts` | ❌ NO — should be `src/modules/pick-pack-dispatch/api/client.ts` |
| Delivery Management | `delivery-management/` | `src/sections/04-operations/api/clients.ts` | ❌ NO — should be `src/modules/delivery-management/api/client.ts` |
| Attendance/Workforce | `attendance-shift/` | `src/sections/04-operations/api/clients.ts` | ❌ NO — should be `src/modules/attendance-shift/api/client.ts` |
| Sales Order | `sales-order/` | `src/sections/04-operations/api/clients.ts` | ❌ NO — should be `src/modules/sales-order/api/client.ts` |
| Batch Manufacturing | `batch-manufacturing/` | `src/sections/04-operations/api/clients.ts` | ❌ NO — should be `src/modules/batch-manufacturing/api/client.ts` |
| Pricing Engine | `pricing-engine/` | `src/sections/03-master-data/api/clients.ts` | ❌ NO — should be `src/modules/pricing-engine/api/client.ts` (Section 03 debt) |
| GST Taxation | `gst-taxation/` | `src/sections/03-master-data/api/clients.ts` | ❌ NO — should be `src/modules/gst-taxation/api/client.ts` (Section 03 debt) |
| Financial Foundation | `financial-foundation/` | `src/sections/03-master-data/api/clients.ts` | ❌ NO — should be `src/modules/financial-foundation/api/client.ts` (Section 03 debt) |
| Performance Management | `performance-management/` | (NO client exists) | ❌ Missing entirely |
| Alerts/KPI Engine | `alerts-kpi-engine/` | (NO client exists) | ❌ Missing entirely |
| MES | `mes/` | (NO client exists) | ❌ Missing entirely |
| Customer Returns | `customer-returns/` | (NO client exists) | ❌ Missing entirely |

**Summary**: 3 compliant, 10 non-compliant (7 from Section 04, 3 from Section 03), 4 missing entirely.

---

## 6. Shared Component Map

Verifies: All shared infrastructure is reused, nothing duplicated.

| Shared Artifact | Location | Used by Section 04? | Duplicated? |
|---|---|---|---|
| `toast()` | `@/hooks/use-toast` | ✅ Yes (imported in all 38 modules) | ❌ No duplication |
| `useList` | `@/hooks/use-list` | ❌ Not yet (manual useState+useEffect used instead) | ⚠️ Pattern duplicated inline |
| `useRecord` | `@/hooks/use-record` | ❌ Not yet | — |
| `useMutation` | `@/hooks/use-mutation` | ❌ Not yet | ⚠️ Pattern duplicated inline |
| `useDebouncedSearch` | `@/hooks/use-debounced-search` | ❌ Not yet | ⚠️ Pattern duplicated inline |
| `useDropdown` | `@/hooks/use-dropdown` | ❌ Not yet | — |
| `<LoadingState>` | `@/components/shared/loading-state` | ✅ Imported in all 38 modules | ❌ No duplication |
| `<ErrorState>` | `@/components/shared/error-state` | ✅ Imported in all 38 modules | ❌ No duplication |
| `<EmptyState>` | `@/components/shared/empty-state` | ✅ Imported in all 38 modules | ❌ No duplication |
| `<ConfirmDialog>` | `@/components/shared/confirm-dialog` | ❌ Not yet imported | — |
| `formatINR` | `@/lib/format` | ❌ Not yet imported (some modules have inline) | ⚠️ ReservationModule has inline `formatINR` |
| `formatDate` | `@/lib/format` | ❌ Not yet imported | — |
| `exportToCSV` | `@/lib/csv` | ✅ Imported in all 38 modules | ❌ No duplication |
| `badgeForStatus` | `@/lib/badges` | ✅ Via re-export from `utils/helpers.ts` | ❌ No duplication |
| `validateGSTIN` | `@/lib/validate` | ❌ Not yet imported | — |
| `apiFetch` | `@/lib/api` | ✅ Used by 7 new Section 04 clients | ❌ No duplication (but 12 existing clients DON'T use it) |
| `cn` | `@/lib/utils` | ✅ Used by all 38 modules | ❌ No duplication |
| `useAuthStore` | `@/stores/auth-store` | ✅ Imported in all 38 modules | ❌ No duplication |
| `useOrgContextStore` | `@/stores/org-context-store` | ❌ Not yet used | — |

### Section 04 Local Utilities

| Artifact | Location | Should Be Promoted? | Reason |
|---|---|---|---|
| `s28PriorityBadge` | `src/sections/04-operations/utils/helpers.ts` | ✅ YES → `@/lib/badges.ts` | Future sections need priority badges |
| `S28_WAREHOUSES` | `src/sections/04-operations/utils/helpers.ts` | ❌ NO — DELETE | Mock data, should be replaced by `orgWarehouseApi.list()` |
| `S28_ZONES` | `src/sections/04-operations/utils/helpers.ts` | ❌ NO — DELETE | Mock data, should be replaced by `warehouseApi.listZones()` |
| `s28BadgeForStatus` re-export | `src/sections/04-operations/utils/helpers.ts` | ✅ Already promoted | Re-export from `@/lib/badges` — correct pattern |

---

## 7. Technical Debt Identified

| # | Debt Item | Severity | Source | Fix |
|---|---|---|---|---|
| 1 | 7 API clients in section-local file instead of module directories | HIGH | Section 04 Phase 2 | Move each to `src/modules/<module>/api/client.ts` |
| 2 | 3 API clients in Section 03 section-local file | HIGH | Section 03 R2 | Move each to `src/modules/<module>/api/client.ts` (out of Section 04 scope) |
| 3 | 12 existing clients have inline `apiFetch` (duplicates `@/lib/api`) | MEDIUM | Pre-existing | Replace with `import { apiFetch } from '@/lib/api'` |
| 4 | `s28PriorityBadge` not promoted to shared lib | LOW | Section 04 | Promote to `@/lib/badges.ts` |
| 5 | `S28_WAREHOUSES` / `S28_ZONES` mock data in utils | LOW | Section 04 | Delete when modules wired to live API |
| 6 | 4 backend modules have NO frontend client at all | MEDIUM | Pre-existing | Create clients for `mes`, `customer-returns`, `performance-management`, `alerts-kpi-engine` |
| 7 | Section 04 modules use manual `useState+useEffect` instead of `useList` hook | MEDIUM | Section 04 | Replace with `useList` from `@/hooks/use-list` |
| 8 | `ReservationModule` has inline `formatINR` | LOW | Pre-existing page.tsx code | Replace with `import { formatINR } from '@/lib/format'` |
| 9 | `useOrgContextStore` not used by any Section 04 module | MEDIUM | Section 04 | Add org context scoping to all list queries |
| 10 | `useDebouncedSearch` not used (manual search state instead) | LOW | Section 04 | Replace with `useDebouncedSearch` from `@/hooks/use-debounced-search` |

---

## 8. Recommendations

### Immediate (Before Phase 3)

**R1: Move all 7 API clients to their module directories**
- `costingApi` → `src/modules/product-costing/api/client.ts`
- `fulfillmentApi` → `src/modules/order-fulfillment/api/client.ts`
- `pickPackDispatchApi` → `src/modules/pick-pack-dispatch/api/client.ts`
- `deliveryApi` → `src/modules/delivery-management/api/client.ts`
- `workforceApi` → `src/modules/attendance-shift/api/client.ts`
- `salesOrderApi` → `src/modules/sales-order/api/client.ts`
- `batchMfgApi` → `src/modules/batch-manufacturing/api/client.ts`
- Update all imports in Section 04 components to point to new locations
- Delete `src/sections/04-operations/api/clients.ts`
- **Effort**: 1 hour

**R2: Promote `s28PriorityBadge` to `@/lib/badges.ts`**
- Move function from `src/sections/04-operations/utils/helpers.ts` to `src/lib/badges.ts`
- Update import in `utils/helpers.ts` to re-export
- **Effort**: 5 minutes

### Short-Term (During Phase 4-7)

**R3: Use shared hooks instead of manual state**
- Replace manual `useState + useEffect` patterns with `useList` from `@/hooks/use-list`
- Replace manual search state with `useDebouncedSearch` from `@/hooks/use-debounced-search`
- Replace manual mutation handlers with `useMutation` from `@/hooks/use-mutation`
- **Effort**: 2 hours across all 38 modules

**R4: Add `useOrgContextStore` scoping**
- Every list query should pass `warehouseId` / `plantId` from the org context store
- **Effort**: 1 hour

**R5: Delete mock data constants**
- Delete `S28_WAREHOUSES` and `S28_ZONES` when modules are wired to live API
- **Effort**: 5 minutes (done incrementally as each module is wired)

### Long-Term (Technical Debt Cleanup)

**R6: Replace 12 inline `apiFetch` with shared import**
- Each of the 12 existing API clients has its own inline `apiFetch` function
- Replace with `import { apiFetch } from '@/lib/api'`
- **Effort**: 1 hour (but affects Section 01-03 code — coordinate carefully)

**R7: Move Section 03's 3 clients to module directories**
- `pricingApi` → `src/modules/pricing-engine/api/client.ts`
- `gstApi` → `src/modules/gst-taxation/api/client.ts`
- `financeApi` → `src/modules/financial-foundation/api/client.ts`
- **Effort**: 30 minutes (but affects Section 03 code)

**R8: Create missing clients for 4 backend modules**
- `mesApi` → `src/modules/mes/api/client.ts`
- `customerReturnsApi` → `src/modules/customer-returns/api/client.ts`
- `performanceApi` → `src/modules/performance-management/api/client.ts`
- `alertsKpiApi` → `src/modules/alerts-kpi-engine/api/client.ts`
- **Effort**: 1 hour

---

## 9. Enterprise Architecture Alignment

### How SAP Would Structure This

In SAP S/4HANA:
- **MM (Materials Management)**: One module covering PO, GRN, Inventory, Warehouse
- **SD (Sales & Distribution)**: One module covering Sales Orders, Deliveries, Shipments, Billing
- **PP (Production Planning)**: One module covering BOM, Routing, Production Orders, Batch Manufacturing
- **FI (Financial Accounting)**: One module covering GL, AR, AP, Cost Centers
- **CO (Controlling)**: One module covering Cost Centers, Profit Centers, Costing
- **HR/HCM**: One module covering Attendance, Payroll, Performance
- **QM (Quality Management)**: One module covering Inspection, NCR, CAPA, COA

### Current SUOP Structure vs SAP

| SAP Module | SUOP Backend Modules | SUOP Frontend Clients | Alignment |
|---|---|---|---|
| MM | inventory, warehouse, goods-receipt, procurement, purchase-order | inventoryApi, warehouseApi, goodsReceiptApi, procurementApi, purchaseOrderApi | ✅ Aligned (5 clients for 5 backend modules) |
| SD | sales-order, order-fulfillment, pick-pack-dispatch, delivery-management, customer-returns | salesOrderApi, fulfillmentApi, pickPackDispatchApi, deliveryApi (NO client for returns) | ⚠️ 4 clients for 4 backend modules — correct count, wrong location |
| PP | batch-manufacturing, recipe-bom, mes, production-order, production-planning | batchMfgApi (NO clients for others) | ⚠️ Only 1 of 5 backend modules has a client |
| FI/CO | product-costing, financial-foundation, general-ledger, gst-taxation | costingApi, gstApi, financeApi (all in wrong location) | ⚠️ 3 clients for 4 backend modules, all section-local |
| HR | attendance-shift, performance-management, payroll-processing, recruitment-onboarding, leave-management | workforceApi (NO client for others) | ⚠️ Only 1 of 5 backend modules has a client |
| QM | quality-inspection, quality-foundation, capa-management, coa-management | qualityInspectionApi | ✅ Aligned (1 client, but only 1 backend module with routes) |

### Verdict

The NUMBER of clients is correct (one per backend module). The LOCATION is wrong (section-local instead of module-local). The fix is straightforward: move each client to its module directory.

---

## 10. Summary

| Category | Count | Status |
|---|---|---|
| New API clients created | 7 | ❌ All in wrong location (section-local) |
| New API clients using shared `apiFetch` | 7 | ✅ Correct pattern |
| Existing clients with inline `apiFetch` | 12 | ⚠️ Pre-existing duplication |
| Section 03 clients in wrong location | 3 | ⚠️ Pre-existing debt |
| Backend modules with NO frontend client | 4 | ❌ Missing |
| Shared hooks used by Section 04 | 0 of 5 | ❌ Manual patterns used instead |
| Shared components used by Section 04 | 4 of 5 | ✅ Good (toast, LoadingState, ErrorState, EmptyState) |
| Shared utilities used by Section 04 | 3 of 6 | ⚠️ Partial (exportToCSV, badgeForStatus, cn — missing formatINR, formatDate, validators) |
| Mock data in shared utils | 2 | ❌ S28_WAREHOUSES, S28_ZONES (should be deleted) |
| Duplicate business logic | 0 | ✅ No duplication |
| Duplicate components | 0 | ✅ No duplication |

### Overall Assessment

The Section 04 implementation has **correct architecture decisions** (using shared `apiFetch`, shared components, correct module extraction) but has **one significant placement error**: all 7 new API clients are in a section-local file instead of their respective backend module directories. This violates the SSOT principle established by all 14 existing clients and makes the clients non-reusable by future sections.

The fix is straightforward (move 7 files, update imports) and should be done before proceeding to Phase 3.

---

**END OF ARCHITECTURE REVIEW — NO CODE MODIFIED — AWAITING APPROVAL**

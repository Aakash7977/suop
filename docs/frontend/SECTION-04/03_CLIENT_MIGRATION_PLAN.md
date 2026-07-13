# 03 — Client Migration Plan

**Date**: 2026-07-13
**Status**: MIGRATION PLAN (pending approval)
**Rule**: KEEP / MERGE / MOVE / DELETE for every client

---

## Migration Decisions

### Existing Clients in `src/modules/*/api/client.ts` (14 clients)

| # | Current Client | Current Location | Decision | Target Location | Reason |
|---|---|---|---|---|---|
| 1 | `authClient` | `src/modules/auth/api/client.ts` | **MOVE** | `src/api/administration/auth.ts` | Frontend client must be in frontend API layer |
| 2 | `userMgmtApi` | `src/modules/user-management/api/client.ts` | **MOVE** | `src/api/administration/users.ts` | Same |
| 3 | `productApi` | `src/modules/product/api/client.ts` | **MOVE** | `src/api/catalog/products.ts` | Same |
| 4 | `customerApi` | `src/modules/customer/api/client.ts` | **MOVE** | `src/api/partners/customers.ts` | Same |
| 5 | `supplierApi` | `src/modules/supplier/api/client.ts` | **MOVE** | `src/api/partners/suppliers.ts` | Same |
| 6 | `inventoryApi` | `src/modules/inventory/api/client.ts` | **MOVE + SPLIT** | `src/api/inventory/*.ts` (7 files) | Monolith with 14 methods — split by entity |
| 7 | `goodsReceiptApi` | `src/modules/goods-receipt/api/client.ts` | **MOVE** | `src/api/warehouse/goods-receipt.ts` | Same |
| 8 | `warehouseApi` | `src/modules/warehouse/api/client.ts` | **MOVE + SPLIT** | `src/api/warehouse/*.ts` (7 files) | Monolith with 15 methods — split by entity |
| 9 | `organizationApi` (7 sub-clients) | `src/modules/organization/api/client.ts` | **MOVE + SPLIT** | `src/api/organization/*.ts` (7 files) | Already has 7 separate exports — split into 7 files |
| 10 | `procurementApi` | `src/modules/procurement/api/client.ts` | **MOVE** | `src/api/procurement/requisitions.ts` | Same |
| 11 | `purchaseOrderApi` | `src/modules/purchase-order/api/client.ts` | **MOVE** | `src/api/procurement/purchase-orders.ts` | Same |
| 12 | `qualityInspectionApi` | `src/modules/quality-inspection/api/client.ts` | **MOVE** | `src/api/quality/inspection.ts` | Same |
| 13 | `quotationApi` | `src/modules/quotation/api/client.ts` | **MOVE** | `src/api/procurement/quotations.ts` | Same |
| 14 | `rfqApi` | `src/modules/rfq/api/client.ts` | **MOVE** | `src/api/procurement/rfqs.ts` | Same |

### Section 03 Local Clients (3 clients)

| # | Current Client | Current Location | Decision | Target Location | Reason |
|---|---|---|---|---|---|
| 15 | `pricingApi` | `src/sections/03-master-data/api/clients.ts` | **MOVE** | `src/api/sales/pricing.ts` | Section-local clients violate SSOT |
| 16 | `gstApi` | `src/sections/03-master-data/api/clients.ts` | **MOVE** | `src/api/finance/gst.ts` | Same |
| 17 | `financeApi` | `src/sections/03-master-data/api/clients.ts` | **MOVE** | `src/api/finance/foundation.ts` | Same |

### Section 04 Local Clients (7 clients)

| # | Current Client | Current Location | Decision | Target Location | Reason |
|---|---|---|---|---|---|
| 18 | `costingApi` | `src/sections/04-operations/api/clients.ts` | **MOVE** | `src/api/finance/costing.ts` | Section-local clients violate SSOT |
| 19 | `fulfillmentApi` | `src/sections/04-operations/api/clients.ts` | **MOVE** | `src/api/sales/fulfillment.ts` | Same |
| 20 | `pickPackDispatchApi` | `src/sections/04-operations/api/clients.ts` | **MOVE** | `src/api/sales/pick-pack.ts` | Same |
| 21 | `deliveryApi` | `src/sections/04-operations/api/clients.ts` | **MOVE** | `src/api/sales/delivery.ts` | Same |
| 22 | `workforceApi` | `src/sections/04-operations/api/clients.ts` | **MOVE + RENAME** | `src/api/hr/attendance.ts` → rename to `attendanceApi` | "workforceApi" is misleading — it only calls attendance endpoints |
| 23 | `salesOrderApi` | `src/sections/04-operations/api/clients.ts` | **MOVE** | `src/api/sales/orders.ts` | Same |
| 24 | `batchMfgApi` | `src/sections/04-operations/api/clients.ts` | **MOVE + RENAME** | `src/api/manufacturing/batches.ts` → rename to `batchApi` | "batchMfgApi" is redundant — it's in the manufacturing domain |

### New Clients to Create (6 clients)

| # | Client | Target Location | Backend Module | Reason |
|---|---|---|---|---|
| 25 | `recipeApi` | `src/api/manufacturing/recipes.ts` | recipe-bom | Backend exists with 12 endpoints — no frontend client |
| 26 | `mesApi` | `src/api/manufacturing/mes.ts` | mes | Backend exists with 13 endpoints — no frontend client |
| 27 | `productionOrderApi` | `src/api/manufacturing/production-orders.ts` | production-order | Backend exists — no frontend client |
| 28 | `returnsApi` | `src/api/sales/returns.ts` | customer-returns | Backend exists with 8 endpoints — no frontend client |
| 29 | `glApi` | `src/api/finance/gl.ts` | general-ledger | Backend exists with 8 endpoints — no frontend client |
| 30 | `alertsApi` | `src/api/bi/alerts.ts` | alerts-kpi-engine | Backend exists with 7 endpoints — no frontend client |

### Files to DELETE After Migration

| File | Reason |
|---|---| 
| `src/sections/03-master-data/api/clients.ts` | All 3 clients moved to `src/api/finance/` and `src/api/sales/` |
| `src/sections/04-operations/api/clients.ts` | All 7 clients moved to their domain directories |
| `src/modules/auth/api/client.ts` | Moved to `src/api/administration/auth.ts` |
| `src/modules/customer/api/client.ts` | Moved to `src/api/partners/customers.ts` |
| `src/modules/goods-receipt/api/client.ts` | Moved to `src/api/warehouse/goods-receipt.ts` |
| `src/modules/inventory/api/client.ts` | Moved to `src/api/inventory/*.ts` |
| `src/modules/organization/api/client.ts` | Moved to `src/api/organization/*.ts` |
| `src/modules/procurement/api/client.ts` | Moved to `src/api/procurement/requisitions.ts` |
| `src/modules/product/api/client.ts` | Moved to `src/api/catalog/products.ts` |
| `src/modules/purchase-order/api/client.ts` | Moved to `src/api/procurement/purchase-orders.ts` |
| `src/modules/quality-inspection/api/client.ts` | Moved to `src/api/quality/inspection.ts` |
| `src/modules/quotation/api/client.ts` | Moved to `src/api/procurement/quotations.ts` |
| `src/modules/rfq/api/client.ts` | Moved to `src/api/procurement/rfqs.ts` |
| `src/modules/supplier/api/client.ts` | Moved to `src/api/partners/suppliers.ts` |
| `src/modules/user-management/api/client.ts` | Moved to `src/api/administration/users.ts` |
| `src/modules/warehouse/api/client.ts` | Moved to `src/api/warehouse/*.ts` |

**Note**: The `src/modules/` directory itself is NOT deleted — only the `api/client.ts` files within it. The `src/modules/*/components/` files remain untouched (they are React components, not API clients).

---

## Migration Order

Execute in this order to minimize broken imports:

### Step 1: Create `src/api/` directory structure (all 14 domain directories)
### Step 2: Move existing clients one domain at a time
1. `src/api/administration/` (auth, users) — 2 clients
2. `src/api/catalog/` (products) — 1 client
3. `src/api/partners/` (customers, suppliers) — 2 clients
4. `src/api/organization/` (7 sub-clients split into 7 files) — 7 clients
5. `src/api/inventory/` (split monolith into 7 files) — 7 clients
6. `src/api/warehouse/` (split monolith + add GRN) — 9 clients
7. `src/api/procurement/` (requisitions, POs, quotations, RFQs) — 4 clients
8. `src/api/quality/` (inspection) — 1 client
9. `src/api/finance/` (costing, gst, foundation, gl) — 4 clients
10. `src/api/sales/` (orders, fulfillment, pick-pack, delivery, pricing, returns) — 6 clients
11. `src/api/manufacturing/` (batches, recipes, mes, production-orders) — 4 clients
12. `src/api/hr/` (attendance, performance) — 2 clients
13. `src/api/bi/` (alerts) — 1 client

### Step 3: Create barrel `index.ts` for each domain
### Step 4: Update ALL imports across the codebase
- `src/app/page.tsx`
- `src/sections/03-master-data/**/*.tsx`
- `src/sections/04-operations/**/*.tsx`
- `src/stores/auth-store.ts`
- `src/modules/*/components/*.tsx`

### Step 5: Delete old client files
### Step 6: Verify build passes

**Estimated effort**: 4-6 hours

---

## Backward Compatibility

During migration, each domain `index.ts` will export BOTH the new split clients AND the old combined client for backward compatibility:

```typescript
// src/api/inventory/index.ts
export { inventoryApi } from './inventory'  // new split file
export { reservationApi } from './reservations'
export { batchApi } from './batches'
// ... etc.

// Backward compat: also export as combined inventoryApi
import { inventoryApi as _inv } from './inventory'
import { reservationApi as _res } from './reservations'
export const inventoryApi = { ..._inv, ..._res }  // combined for old imports
```

This allows gradual import migration without breaking the build.

---

**END OF CLIENT MIGRATION PLAN**

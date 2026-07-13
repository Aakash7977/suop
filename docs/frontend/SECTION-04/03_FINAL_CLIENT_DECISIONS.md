# 03 — Final Client Decisions

**Date**: 2026-07-13
**Status**: FINAL

---

## Decision Matrix

### Existing Clients (14 in src/modules/)

| # | Current Client | Current Location | Decision | Target | Justification |
|---|---|---|---|---|---|
| 1 | `authClient` | `src/modules/auth/api/client.ts` | **MOVE + RENAME** | `src/api/administration.ts` → rename to `authApi` | "authClient" → "authApi" for naming consistency with all other `*Api` clients. Auth is part of Administration domain. |
| 2 | `userMgmtApi` | `src/modules/user-management/api/client.ts` | **MOVE + RENAME** | `src/api/administration.ts` → rename to `userApi` | "userMgmtApi" → "userApi" — shorter, consistent. User management is part of Administration domain. |
| 3 | `productApi` | `src/modules/product/api/client.ts` | **MOVE + RENAME** | `src/api/catalog.ts` → rename to `catalogApi` | Product is the catalog domain. `catalogApi` encompasses products + categories + brands + UOMs + barcodes — all mount under `/api/v1/catalog`. |
| 4 | `customerApi` | `src/modules/customer/api/client.ts` | **MOVE** | `src/api/partners.ts` | Customer is a business partner. Co-located with `supplierApi` in same file (they share addContact, addAddress, lookupByGstin patterns). |
| 5 | `supplierApi` | `src/modules/supplier/api/client.ts` | **MOVE** | `src/api/partners.ts` | Same as above. Two clients, one file. |
| 6 | `inventoryApi` | `src/modules/inventory/api/client.ts` | **MOVE** (keep as ONE client) | `src/api/inventory.ts` | KEEP as single monolith — stock, ledger, transactions, reservations, blocks, batches, expiry are ALL sub-entities of Inventory aggregate. NOT split. |
| 7 | `goodsReceiptApi` | `src/modules/goods-receipt/api/client.ts` | **MOVE** | `src/api/warehouse.ts` | GRN is a warehouse operation. Co-located with `warehouseApi` (two clients, one file). GRN has its own lifecycle but lives in the Warehouse domain. |
| 8 | `warehouseApi` | `src/modules/warehouse/api/client.ts` | **MOVE** (keep as ONE client) | `src/api/warehouse.ts` | KEEP as single monolith — zones, aisles, racks, bins, putaway, barcodes, scan are ALL sub-entities of Warehouse operations aggregate. NOT split. |
| 9 | `companyApi` + 6 others | `src/modules/organization/api/client.ts` | **MOVE + MERGE** | `src/api/organization.ts` → merge into ONE `organizationApi` | Currently 7 separate exports (companyApi, plantApi, warehouseApi, departmentApi, costCenterApi, financialYearApi, hierarchyApi). MERGE into ONE `organizationApi` with sub-namespaces: `organizationApi.companies.list()`, `organizationApi.plants.list()`, etc. This follows SAP's single MM/PP/SD module pattern. |
| 10 | `procurementApi` | `src/modules/procurement/api/client.ts` | **MOVE** | `src/api/procurement.ts` | Procurement domain. Co-located with PO, quotation, RFQ clients. |
| 11 | `purchaseOrderApi` | `src/modules/purchase-order/api/client.ts` | **MOVE** | `src/api/procurement.ts` | Same file as procurementApi — they form the procurement process. |
| 12 | `qualityInspectionApi` | `src/modules/quality-inspection/api/client.ts` | **MOVE + RENAME** | `src/api/quality.ts` → rename to `qualityApi` | "qualityInspectionApi" → "qualityApi" — encompasses inspection, NCR, CAPA, COA, holds (not just inspection). |
| 13 | `quotationApi` | `src/modules/quotation/api/client.ts` | **MOVE** | `src/api/procurement.ts` | Same file as procurementApi. |
| 14 | `rfqApi` | `src/modules/rfq/api/client.ts` | **MOVE** | `src/api/procurement.ts` | Same file as procurementApi. |

### Section 03 Local Clients (3 in src/sections/03-master-data/api/clients.ts)

| # | Current Client | Current Location | Decision | Target | Justification |
|---|---|---|---|---|---|
| 15 | `pricingApi` | `src/sections/03-master-data/api/clients.ts` | **MOVE** | `src/api/sales.ts` | Pricing is part of the Sales domain (mount: `/api/v1/sales/pricing`). Co-located with salesOrderApi, fulfillmentApi, etc. |
| 16 | `gstApi` | `src/sections/03-master-data/api/clients.ts` | **MOVE + RENAME** | `src/api/finance.ts` → rename to `gstApi` (keep name) | GST is part of Finance domain. |
| 17 | `financeApi` | `src/sections/03-master-data/api/clients.ts` | **MOVE + RENAME** | `src/api/finance.ts` → rename to `financeFoundationApi` | "financeApi" is too generic — renamed to `financeFoundationApi` to match backend module name. Co-located with costingApi, gstApi, glApi. |

### Section 04 Local Clients (7 in src/sections/04-operations/api/clients.ts)

| # | Current Client | Current Location | Decision | Target | Justification |
|---|---|---|---|---|---|
| 18 | `costingApi` | `src/sections/04-operations/api/clients.ts` | **MOVE** | `src/api/finance.ts` | Costing is part of Finance domain. Co-located with gstApi, financeFoundationApi, glApi. |
| 19 | `fulfillmentApi` | `src/sections/04-operations/api/clients.ts` | **MOVE** | `src/api/sales.ts` | Fulfillment is part of Sales domain. |
| 20 | `pickPackDispatchApi` | `src/sections/04-operations/api/clients.ts` | **MOVE + RENAME** | `src/api/sales.ts` → rename to `pickPackApi` | Shorter name. Part of Sales domain. |
| 21 | `deliveryApi` | `src/sections/04-operations/api/clients.ts` | **MOVE + RENAME** | `src/api/sales.ts` → rename to `deliveryApi` (keep) | Part of Sales domain. |
| 22 | `workforceApi` | `src/sections/04-operations/api/clients.ts` | **MOVE + RENAME** | `src/api/hr.ts` → rename to `attendanceApi` | "workforceApi" is misleading — it only calls attendance endpoints. Renamed to `attendanceApi`. |
| 23 | `salesOrderApi` | `src/sections/04-operations/api/clients.ts` | **MOVE** | `src/api/sales.ts` | Part of Sales domain. |
| 24 | `batchMfgApi` | `src/sections/04-operations/api/clients.ts` | **MOVE + RENAME** | `src/api/manufacturing.ts` → rename to `batchApi` | "batchMfgApi" → "batchApi" — shorter. Part of Manufacturing domain. |

### New Clients to Create (5)

| # | Client | Target Location | Backend Module | Justification |
|---|---|---|---|---|
| 25 | `recipeApi` | `src/api/manufacturing.ts` | recipe-bom | Backend has 12 endpoints — no frontend client exists. Part of Manufacturing domain. |
| 26 | `mesApi` | `src/api/manufacturing.ts` | mes | Backend has 13 endpoints — no frontend client exists. Part of Manufacturing domain. |
| 27 | `returnsApi` | `src/api/sales.ts` | customer-returns | Backend has 8 endpoints — no frontend client exists. Part of Sales domain. |
| 28 | `glApi` | `src/api/finance.ts` | general-ledger | Backend has 8 endpoints — no frontend client exists. Part of Finance domain. |
| 29 | `alertsApi` | `src/api/bi.ts` | alerts-kpi-engine | Backend has 7 endpoints — no frontend client exists. Part of BI domain. |

### Summary of Decisions

| Decision | Count |
|---|---|
| MOVE (location change only) | 14 |
| MOVE + RENAME | 9 |
| MOVE + MERGE (7 org clients → 1) | 1 (merging 7 into 1) |
| CREATE (new) | 5 |
| DELETE (old files after migration) | 16 old `api/client.ts` files |
| **Total client objects after migration** | **~25** |

### Key Architectural Decisions

1. **organizationApi MERGE**: 7 separate exports (companyApi, plantApi, etc.) → 1 client with sub-namespaces. SAP has ONE MM module, not 7. `organizationApi.companies.list()`, `organizationApi.plants.list()`, etc.

2. **inventoryApi NOT SPLIT**: 14 methods in one client. All are sub-entities of Inventory aggregate. `inventoryApi.list()`, `inventoryApi.stockIn()`, `inventoryApi.listLedger()`, etc.

3. **warehouseApi NOT SPLIT**: 15 methods in one client. All are sub-entities of Warehouse operations. `warehouseApi.listBins()`, `warehouseApi.createPutawayTask()`, etc.

4. **partners.ts has TWO clients**: `customerApi` and `supplierApi` stay separate (different aggregates, different lifecycles) but share one file (same business domain, same patterns).

5. **procurement.ts has FOUR clients**: `procurementApi`, `purchaseOrderApi`, `quotationApi`, `rfqApi` stay separate (different aggregates, different workflows) but share one file.

6. **sales.ts has SIX clients**: `salesOrderApi`, `fulfillmentApi`, `pickPackApi`, `deliveryApi`, `returnsApi`, `pricingApi` stay separate but share one file.

---

**END OF FINAL CLIENT DECISIONS**

# 01 — Final Frontend API Architecture

**Date**: 2026-07-13
**Status**: FINAL ARCHITECTURE (pending approval)
**Principle**: ONE API CLIENT PER BUSINESS AGGREGATE — not per endpoint, not per entity.

---

## 1. Architecture Principle

The frontend API layer is the **SINGLE SOURCE OF TRUTH** for all HTTP communication. It lives in `src/api/` and is organized by **business aggregate** (not by backend module, not by section, not by entity).

```
src/
├── api/                        ← ALL frontend API clients
│   ├── core/                   ← Shared API infrastructure
│   ├── organization.ts         ← organizationApi (companies, plants, warehouses, departments, cost centers, financial years, hierarchy)
│   ├── catalog.ts              ← catalogApi (products, categories, brands, UOMs, barcodes)
│   ├── partners.ts             ← customerApi + supplierApi (two clients, one file — they share patterns)
│   ├── inventory.ts            ← inventoryApi (stock, ledger, transactions, reservations, blocks, batches, expiry)
│   ├── warehouse.ts            ← warehouseApi (zones, aisles, racks, bins, putaway, barcodes, scan, GRN)
│   ├── procurement.ts          ← procurementApi + purchaseOrderApi + quotationApi + rfqApi
│   ├── sales.ts                ← salesOrderApi + fulfillmentApi + deliveryApi + returnsApi
│   ├── manufacturing.ts        ← batchApi + recipeApi + mesApi
│   ├── quality.ts              ← qualityApi (inspection, NCR, CAPA, COA, holds)
│   ├── finance.ts              ← costingApi + gstApi + financeApi + glApi
│   ├── hr.ts                   ← attendanceApi + performanceApi
│   ├── crm.ts                  ← crmApi (leads, opportunities, complaints, service)
│   ├── administration.ts       ← authApi + userApi
│   ├── bi.ts                   ← alertsApi + dashboardsApi
│   └── index.ts                ← master barrel
├── types/                      ← Shared TypeScript interfaces
├── components/shared/          ← Shared UI components
├── hooks/                      ← Shared hooks
├── lib/                        ← Shared utilities
├── stores/                     ← Zustand stores
└── sections/                   ← Section-specific UI (NO API clients here)
```

## 2. Aggregate Design Rules

### Rule 1: One Client Per Business Aggregate
An "aggregate" is a cluster of entities that are treated as a unit for business operations.

**GOOD** (aggregate-level):
- `inventoryApi` — owns stock, ledger, transactions, reservations, blocks, batches, expiry (all are sub-entities of Inventory)
- `warehouseApi` — owns zones, aisles, racks, bins, putaway, barcodes, scan, GRN (all are sub-entities of Warehouse operations)
- `organizationApi` — owns companies, plants, warehouses, departments, cost centers, financial years, hierarchy (all are org structure)

**BAD** (entity-level — over-split):
- ❌ `zoneApi`, `aisleApi`, `rackApi`, `binApi` — these are sub-entities of Warehouse, not separate aggregates
- ❌ `ledgerApi`, `transactionApi` — these are sub-entities of Inventory
- ❌ `departmentApi`, `costCenterApi` — these are sub-entities of Organization

### Rule 2: Domain File Contains Multiple Aggregates When Closely Related
- `procurement.ts` contains `procurementApi` (requisitions), `purchaseOrderApi`, `quotationApi`, `rfqApi` — 4 clients in one file because they form the procurement business process
- `sales.ts` contains `salesOrderApi`, `fulfillmentApi`, `deliveryApi`, `returnsApi` — 4 clients for the sales-to-delivery process

### Rule 3: Types Are NOT in API Files
API files import types from `src/types/`. API files contain only the client objects and their method implementations.

## 3. Enterprise Comparison

| Principle | SAP S/4HANA | Oracle Fusion | Dynamics 365 | SUOP (Proposed) |
|---|---|---|---|---|
| API organization | By module (MM, SD, PP, FI, CO, HR) | By product family (SCM, Financials, HCM) | By solution area | By business domain |
| Client granularity | BAPI per module (not per table) | SOAP/REST service per module | OData entity set per module | One client per aggregate (not per entity) |
| Type management | DDIC data elements | ADF Business Components | Common Data Model | `src/types/` per domain |
| Shared infrastructure | RFC layer | ADF bindings | OData client | `src/api/core/` |

## 4. Advantages
1. **Minimal client count** — ~20 clients vs ~50 if over-split
2. **Clear ownership** — each business domain has exactly one file
3. **Cross-section reuse** — Section 03 and 04 import from the same `@/api/inventory`
4. **Future scalability** — new sections (05, 06) import from `@/api/` without touching other sections
5. **Maintainability** — adding a method to inventoryApi means editing one file, not searching across sections

## 5. Risks & Mitigation
| Risk | Mitigation |
|---|---|
| Large files (inventoryApi may have 15+ methods) | Methods are simple one-liners; file stays under 200 lines |
| Naming collisions (two `list` methods in same file) | Each client is a separate `const` — `inventoryApi.list()` vs `warehouseApi.listBins()` |
| Import changes break existing code | Barrel exports provide backward compat aliases during migration |

## 6. Backward Compatibility
During migration, `src/api/index.ts` will re-export all clients with their EXISTING names. Old import paths (`@/modules/inventory/api/client`) will be replaced by a single-line re-export shim that will be deleted after all consumers are updated.

---

**END OF FINAL FRONTEND API ARCHITECTURE**

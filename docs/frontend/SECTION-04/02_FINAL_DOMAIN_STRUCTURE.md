# 02 — Final Domain Structure

**Date**: 2026-07-13
**Status**: FINAL

---

## Complete Domain → File → Client Mapping

### src/api/core/ (Shared API Infrastructure)

| File | Exports | Purpose |
|---|---|---|
| `api-fetch.ts` | `apiFetch<T>` | Core HTTP client with auth token injection, JSON parsing, error handling |
| `auth.ts` | `getAuthToken`, `setAuthToken`, `clearAuthToken` | Token management (reads from localStorage) |
| `interceptors.ts` | `registerInterceptor`, `requestInterceptor`, `responseInterceptor` | Request/response interceptors (logging, 401 refresh, tenant header injection) |
| `errors.ts` | `ApiError`, `ConflictError`, `NotFoundError`, `ValidationError`, `BusinessRuleError` | Typed error classes for different HTTP failure modes |
| `pagination.ts` | `PaginatedResponse<T>`, `PaginatedMeta`, `PaginationParams` | Pagination types and helpers |
| `query-builder.ts` | `buildQueryString` | URL query string construction from params object |
| `upload.ts` | `uploadFile`, `uploadFiles` | Multipart/form-data file upload helpers |
| `retry.ts` | `withRetry` | Retry wrapper for transient failures (network, 502, 503) |
| `index.ts` | barrel | Re-exports all core utilities |

### src/api/ (Business Domain Clients — ONE FILE PER DOMAIN)

| File | Clients Exported | Backend Module(s) | Mount Prefix(es) | Methods (total) |
|---|---|---|---|---|
| `organization.ts` | `organizationApi` (companies, plants, warehouses, departments, cost centers, financial years, hierarchy — all merged into ONE client with sub-namespaces) | organization | `/api/v1/organization` | ~20 |
| `catalog.ts` | `catalogApi` (products, categories, brands, UOMs, barcodes — ONE client) | product | `/api/v1/catalog` | ~14 |
| `partners.ts` | `customerApi` + `supplierApi` (TWO clients in ONE file — they share patterns but are different aggregates) | customer, supplier | `/api/v1/sales/customers`, `/api/v1/procurement/suppliers` | ~26 |
| `inventory.ts` | `inventoryApi` (stock-in, stock-out, list, get, ledger, transactions, reservations, blocks, batches, expiry — ONE client) | inventory | `/api/v1/inventory` | ~14 |
| `warehouse.ts` | `warehouseApi` (zones, aisles, racks, bins, putaway, barcodes, scan, scan-logs — ONE client) + `goodsReceiptApi` (GRN is a separate aggregate — it has its own lifecycle) | warehouse, goods-receipt | `/api/v1/warehouse`, `/api/v1/warehouse/grns` | ~21 |
| `procurement.ts` | `procurementApi` + `purchaseOrderApi` + `quotationApi` + `rfqApi` (FOUR clients — each has its own workflow) | procurement, purchase-order, quotation, rfq | `/api/v1/procurement/*` | ~25 |
| `sales.ts` | `salesOrderApi` + `fulfillmentApi` + `pickPackDispatchApi` + `deliveryApi` + `returnsApi` + `pricingApi` (SIX clients — each has its own workflow) | sales-order, order-fulfillment, pick-pack-dispatch, delivery-management, customer-returns, pricing-engine | `/api/v1/sales/*` | ~35 |
| `manufacturing.ts` | `batchMfgApi` + `recipeApi` + `mesApi` (THREE clients — batches, recipes, MES are separate aggregates) | batch-manufacturing, recipe-bom, mes | `/api/v1/manufacturing/*`, `/api/v1/mes` | ~25 |
| `quality.ts` | `qualityApi` (inspection lots, NCRs, CAPAs, COAs, holds — ONE client) | quality-inspection | `/api/v1/quality` | ~15 |
| `finance.ts` | `costingApi` + `gstApi` + `financeApi` + `glApi` (FOUR clients — costing, GST, foundation, GL are separate aggregates) | product-costing, gst-taxation, financial-foundation, general-ledger | `/api/v1/finance/*` | ~25 |
| `hr.ts` | `attendanceApi` + `performanceApi` (TWO clients — attendance and performance are separate aggregates) | attendance-shift, performance-management | `/api/v1/hrms/*` | ~14 |
| `crm.ts` | `crmApi` (leads, opportunities, complaints, service — ONE client) | crm-foundation, lead-opportunity, customer-service, complaint-management | `/api/v1/crm/*` | ~10 |
| `administration.ts` | `authApi` + `userApi` (TWO clients — auth and user management are separate aggregates) | auth, user-management | `/api/v1/auth`, `/api/v1/admin` | ~18 |
| `bi.ts` | `alertsApi` (alert rules — ONE client) | alerts-kpi-engine | `/api/v1/bi/alerts` | ~7 |
| `index.ts` | barrel — re-exports ALL clients from ALL domain files | — | — | — |

### src/types/ (Shared TypeScript Interfaces)

| File | Types | Used By |
|---|---|---|
| `organization.ts` | `Company`, `Plant`, `Warehouse`, `Department`, `CostCenter`, `FinancialYear`, `HierarchyNode` | `@/api/organization`, Section 01, Section 03 |
| `catalog.ts` | `Product`, `Category`, `Brand`, `UOM` | `@/api/catalog`, Section 03 |
| `partners.ts` | `Customer`, `CustomerGroup`, `Supplier`, `SupplierCategory` | `@/api/partners`, Section 03 |
| `inventory.ts` | `Inventory`, `InventoryTransaction`, `InventoryLedger`, `StockReservation`, `StockBlock`, `Batch` | `@/api/inventory`, Section 04 |
| `warehouse.ts` | `WarehouseZone`, `WarehouseAisle`, `WarehouseRack`, `WarehouseBin`, `PutawayTask`, `BarcodeLabel`, `ScanLog`, `GoodsReceipt` | `@/api/warehouse`, Section 03, Section 04 |
| `procurement.ts` | `PurchaseRequisition`, `PurchaseOrder`, `Quotation`, `Rfq` | `@/api/procurement` |
| `sales.ts` | `SalesOrder`, `Allocation`, `WavePlan`, `PickList`, `PackingList`, `Shipment`, `DeliveryOrder`, `PriceList`, `Promotion`, `Coupon`, `TaxConfig` | `@/api/sales`, Section 03, Section 04 |
| `manufacturing.ts` | `Batch`, `Recipe`, `Bom`, `Routing`, `WorkCenter`, `Machine`, `Shift` | `@/api/manufacturing` |
| `quality.ts` | `InspectionLot`, `Ncr`, `Capa`, `Coa`, `QualityHold` | `@/api/quality` |
| `finance.ts` | `ProductCost`, `GstConfig`, `Currency`, `ExchangeRate`, `JournalEntry`, `ChartOfAccount`, `FiscalYear`, `FiscalPeriod` | `@/api/finance`, Section 03 |
| `hr.ts` | `AttendanceRecord`, `PerformanceCycle` | `@/api/hr`, Section 04 |
| `crm.ts` | `CrmActivity`, `Lead`, `Opportunity`, `Complaint` | `@/api/crm` |
| `administration.ts` | `LoginResponse`, `CurrentUser`, `UserListItem`, `RoleItem`, `PermissionItem` | `@/api/administration`, Section 02 |
| `common.ts` | `PaginatedResponse<T>`, `SingleResponse<T>`, `ErrorResponse`, `ListParams`, `OptimisticConcurrency` | ALL API files |
| `index.ts` | barrel | ALL consumers |

## Summary

| Category | Count |
|---|---|
| Domain files in `src/api/` | 14 (+ 1 core/ + 1 index.ts) |
| Core infrastructure files | 9 |
| Type files in `src/types/` | 15 |
| Total API client objects | ~25 |
| Total methods | ~280 |

---

**END OF FINAL DOMAIN STRUCTURE**

# Section 03 — Master Data Management

## Complete Enterprise Discovery & Analysis Report

**Date**: 2026-07-13
**Source**: `src/app/page.tsx` (38,131 lines) + backend modules across `apps/backend/src/modules/`
**Backend route mounts**: 12 modules, 117 endpoints
**Frontend line ranges**: 666–919 (Organization), 1833–4378 (Master Super Modules), 8410–9392 (Warehouse & Locations), 16342–16439 (Plant Master)
**Prisma schema**: ~100+ master-data models
**Overall Production Readiness Score**: **3.2 / 10** (current state)

> This document is the master discovery report for Section 03. After approval, implementation will follow in two phases: (1) code extraction into `src/sections/03-master-data/` (pure copy, zero visual change), then (2) wire-up of every component to live backend APIs. No UI redesign, no removal, no color/layout change.

---

## 1. Executive Summary

Section 03 — Master Data Management is the **data backbone** of the entire SUOP ERP. Every transaction (sales order, purchase order, invoice, journal entry, manufacturing batch, quality inspection, shipment) references master data created here. If master data is wrong, every downstream module propagates the error.

The frontend currently consolidates 19 conceptual master sub-domains into **6 large super modules** under the sidebar group `"Master Data (Sprint 6-11) — PART 2 COMPLETE"`, plus **3 related modules** in other sidebar sections (Organization tree, Warehouse + Locations, Plant Master). The 6 super modules are tab-based UIs holding Product Master, PIM Platform, Commercial Engine, Business Partner Platform, Identification & Traceability, and Data Governance.

**Critical finding**: Only **1 of 9** master-related modules is wired to a real backend API (`OrganizationModule`). The other 8 use hardcoded inline mock data arrays containing ~250 fake records. Backend API clients exist for product, customer, supplier, warehouse, organization, and inventory (in `src/modules/*/api/client.ts`) but **NONE are imported into page.tsx**. The modular React components in `src/modules/*/components/*.tsx` (ProductModule, CustomerModule, SupplierModule, WarehouseModule, OrganizationModule) are also **NOT imported** — they exist as orphan code.

On the backend, **117 endpoints are deployed across 12 modules**, with **audit logging on create/update/delete/transition**, **6 functional workflows** (Product, Customer, Supplier, Organization, Recipe, BOM), and **24 distinct permission literals**. However, **5 modules have RBAC gaps** (using audit:read or org:* as proxies), **3 modules have broken workflow registrations**, and **2 modules reference Prisma models that don't exist in the schema**. There are **~80 missing endpoints** that the frontend UI implies but the backend does not yet expose (UOM conversions, HSN/SAC master, product variants, business partner scorecards, BU/Division/Region CRUD, warehouse temperature zones, identification CRUD, data governance CRUD, payment terms/shipping terms/incoterms masters).

**Estimated implementation effort**: 180–220 hours across 4 phases (extraction → wire-up → backend gap remediation → polish). See §22.

---

## 2. Business Purpose

### Why This Section Exists

Master Data Management is the **single source of truth** for every business entity the ERP tracks. Without clean, validated, deduplicated master data, every downstream process — quoting, ordering, manufacturing, invoicing, shipping, paying — corrupts. SAP S/4HANA, Oracle Fusion, Microsoft Dynamics 365, Infor CloudSuite, and Aptean all treat master data as a first-class platform layer with its own governance, approval workflows, audit trails, and quality metrics. SUOP follows the same model.

### Who Uses It

| Persona | Department | Primary Modules Used |
|---|---|---|
| Master Data Steward | Master Data Management | Product Master, PIM, Data Governance, Reference Masters |
| Procurement Officer | Procurement | Supplier Master, Brand, UOM, HSN, Payment Terms |
| Sales Manager | Sales | Customer Master, Price Lists, Currency, Payment Terms |
| Plant Manager | Manufacturing | Plant Master, Warehouse Master, Storage Locations, Cost Center |
| Warehouse Supervisor | Operations | Warehouse Master, Storage Bins, Aisles, Racks |
| Tax Accountant | Finance | HSN/SAC, Tax Master, GST Configurations |
| Compliance Officer | Quality | Brand compliance, Supplier compliance, FSSAI/HACCP certs |
| Finance Controller | Finance | Cost Center, Department, Currency, Exchange Rates, Financial Year |
| System Administrator | IT | Reference Masters, Feature Flags, Validation Rules |

### Business Problems Solved

1. **Single Source of Truth** — Every product, customer, supplier, plant, warehouse exists exactly once with a unique code, validated against duplicates.
2. **Hierarchy Management** — Company → BU → Division → Region → Plant → Warehouse → Storage Bin → Bin, with parent-child rules enforced.
3. **Compliance Tracking** — FSSAI, HACCP, ISO, GST, PAN, MSME, IEC certifications with expiry alerts.
4. **Pricing & Tax Configuration** — Price lists, discount rules, promotions, GST slabs, HSN/SAC mappings — all governed.
5. **Identification & Traceability** — Barcodes (EAN/UPC/GS1-128), QR codes, batch/lot/serial tracking, full forward/backward traceability.
6. **Data Governance** — Lifecycle states, approval workflows, import/export jobs, validation rules, duplicate detection, audit trail, data quality metrics, change history with rollback.
7. **Multi-currency, Multi-plant, Multi-warehouse** — Currency master with exchange rates, plant-specific costing, warehouse zones with temperature control.

### Downstream Dependencies

Every other ERP module depends on Section 03:
- **Procurement** (PO, RFQ, Quotation, Goods Receipt) → Supplier Master, Product Master, UOM, HSN, Payment Terms
- **Sales** (Sales Order, Delivery, Invoice) → Customer Master, Product Master, Price Lists, Tax Master
- **Inventory** (Stock, Ledger, Reservations, Blocks) → Product Master, Warehouse Master, Storage Locations
- **Manufacturing** (BOM, Recipe, Routing, Production Order) → Product Master, Plant Master, UOM
- **Quality** (IQC, OQC, NCR, CAPA) → Product Master, Supplier Master, Batch/Lot
- **Finance** (GL, AP, AR, Costing) → Cost Center, Department, Currency, Tax Master
- **CRM** (Lead, Opportunity) → Customer Master, Price Lists

---

## 3. Modules Included in Section 03

| # | Module | Conceptual Sub-Domain | UI Location | Backend Mount |
|---|---|---|---|---|
| 1 | Product Master | Product | page.tsx:1833-1903 | `/api/v1/catalog` |
| 2 | Product Categories | Category | (no standalone UI — folded into PIM) | `/api/v1/catalog/categories` |
| 3 | Brand Master | Brand | (no standalone UI) | `/api/v1/catalog/brands` |
| 4 | UOM Master | UOM | (no standalone UI) | `/api/v1/catalog/uoms` |
| 5 | HSN / SAC | HSN/SAC | (no standalone UI — folded into Tax engine) | (no endpoints — gap) |
| 6 | Tax Master | Tax/GST | Commercial Engine → Tax tab (page.tsx:2149-2193) | `/api/v1/finance/gst` |
| 7 | Customer Master | Customer | Business Partner Platform (page.tsx:2616-3154) | `/api/v1/sales/customers` |
| 8 | Supplier Master | Supplier | Business Partner Platform (page.tsx:2616-3154) | `/api/v1/procurement/suppliers` |
| 9 | Company Master | Company | Organization Module (page.tsx:666-919) | `/api/v1/organization/companies` |
| 10 | Plant Master | Plant | PlantMasterModule (page.tsx:16342-16439) | `/api/v1/organization/plants` |
| 11 | Warehouse Master | Warehouse | WarehouseModule (page.tsx:8410-8890) | `/api/v1/organization/warehouses` |
| 12 | Storage Location | Bin/Aisle/Rack | WarehouseLocationModule (page.tsx:8891-9392) | `/api/v1/warehouse/bins` |
| 13 | Cost Center | Cost Center | (no standalone UI — API client ready) | `/api/v1/organization/cost-centers` + `/api/v1/finance/foundation/cost-centers` |
| 14 | Department | Department | (no standalone UI) | `/api/v1/organization/departments` |
| 15 | Currency | Currency | (no standalone UI — mentioned in Price Lists) | `/api/v1/finance/foundation/currencies` |
| 16 | Payment Terms | Payment Terms | (no standalone UI — mentioned in Customer/Supplier) | (no endpoints — gap) |
| 17 | Shipping Terms | Incoterms | (no standalone UI) | (no endpoints — gap) |
| 18 | Price Lists | PriceList | Commercial Engine → Price Lists tab (page.tsx:2098-2147) | `/api/v1/sales/pricing/price-lists` |
| 19 | Reference Masters | Lookup tables | (no standalone UI) | (no endpoints — gap) |

**Plus 3 cross-cutting super modules** that overlay all of Section 03:
- **PIM Platform** (page.tsx:1906-1986) — product information management
- **Identification & Traceability** (page.tsx:3159-3808) — barcodes, QR, batches, lots, serials, GS1
- **Data Governance** (page.tsx:3813-4378) — lifecycle, approvals, import/export, validation, duplicates, audit, quality, history

---

## 4. Current Components (Frontend)

### 4.1 Component Inventory

| Component | Line Range | Sub-tabs | State hooks | API calls | Permission checks | Score |
|---|---|---|---|---|---|---|
| `OrganizationModule()` | 666-919 | — | 9 + 1 nested | 4 real | 2 (`org:create`) | 7.5/10 |
| `ProductMasterModule()` | 1833-1903 | — | 1 | 0 | 0 | 2/10 |
| `PIMModule()` | 1906-1986 | — | 0 | 0 | 0 | 2/10 |
| `CommercialEngineModule()` | 1991-2611 | 10 | 1 + 5 (Resolution) | 1 (mini-service) | 0 | 3/10 |
| `BusinessPartnerModule()` | 2616-3154 | 10 | 1 | 0 | 0 | 2.5/10 |
| `IdentificationModule()` | 3159-3808 | 10 | 1 + 4 (Trace) | 1 (mini-service) | 0 | 3/10 |
| `GovernanceModule()` | 3813-4378 | 10 | 1 | 0 | 0 | 2/10 |
| `WarehouseModule()` | 8410-8890 | 5 | 1 | 0 | 0 | 2/10 |
| `WarehouseLocationModule()` | 8891-9392 | 5 | 1 | 0 | 0 | 2/10 |
| `PlantMasterModule()` | 16342-16439 | — | 1 | 0 | 0 | 2.5/10 |
| **TOTAL** | — | **50 sub-tabs** | **27 useState + 2 useEffect** | **6 (4 real + 2 mini-service)** | **2** | **3.2/10** |

### 4.2 Component-by-Component Detail

#### 4.2.1 `OrganizationModule()` — lines 666-919 ✅ WIRED

The only fully functional master module. Renders Company → BU → Division → Region → Plant → Warehouse as a recursive tree.

- **State**: `selectedNode`, `tree`, `loading`, `error`, `nodeDetail`, `detailLoading`, `showCreate`, `createLoading`, `createError`, `searchQuery` (+ nested `exp` in `TreeItem`)
- **useEffect**: 2 (load tree at line 695, load node detail at line 723)
- **Functions**: `handleCreate(data)` line 747, `filterTree(nodes, query)` line 771, `countByType(nodes, type)` line 785, `TreeItem({ node, depth })` line 818
- **Endpoints used**: 4 real (`GET /api/v1/organization/hierarchy`, `GET /api/v1/organization/companies/{id}`, `POST /api/v1/organization/companies`, reload hierarchy)
- **Token**: `localStorage.getItem('suop_access_token')` (line 701)
- **Fallback**: `demoTree` with 1 enterprise, 1 company, 2 BUs, 3 plants (line 681)
- **Form fields** (Create Company dialog, line 892): `code*`, `name*`, `gstin` (15-char), `pan` (10-char), `email`, `phone`, `city`, `state` — 2-column grid
- **Tree node types supported**: ENTERPRISE, COMPANY, BU, BusinessUnit, DIVISION, REGION, BRANCH, Plant, PLANT, Warehouse, WAREHOUSE (icon map at line 800)
- **Stats**: enterprises, companies, plants, warehouses — computed live from tree via `countByType()`
- **Permission checks**: `hasPermission('org:create')` at lines 859, 887 (gates "Add Entity" button + Create dialog)
- **Gaps**: No edit form. No delete confirmation. No status transition UI. No create for Plant/Warehouse/BU (only Company). Token bypasses `getAuthToken()` helper.

#### 4.2.2 `ProductMasterModule()` — lines 1833-1903 ❌ MOCK

- **State**: 1 (`search`)
- **Mock data**: `products` array (line 1834) — 6 items: Kaju Katli 250g/500g, Badam Pista Roll, Chocolate Wafer, Raw Sugar 50kg, Gift Box 250g. Fields: `upi, code, sku, name, type, status, brand, mrp, stock`
- **Stats**: 4 cards hardcoded (Total=12, Active=10, Types=11, With UPI=12) — DO NOT match the 6 mock items
- **Table columns**: UPI, Product, SKU, Brand, MRP, Stock, Status
- **Search**: filters by name/SKU/UPI/code
- **Buttons (3 dead)**: "Import" (line 1873), "Export" (line 1874), "New Product" (line 1875) — no onClick
- **API**: zero calls
- **Gaps**: No create/edit/detail. No pagination. No loading/error. No permission check. The richer `src/modules/product/components/ProductModule.tsx` (221 lines, fully wired to `productApi`) exists but is NOT imported.

#### 4.2.3 `PIMModule()` — lines 1906-1986 ❌ MOCK

- **State**: 0
- **Mock data**: `families` (4: Indian Sweets, Namkeen, Bakery, Beverages), `compliance` (3 FSSAI/HACCP records), `approvals` (3 pending items)
- **Stats**: 4 cards hardcoded (Families=6, Collections=5, Pending=2, Compliance=6) — DO NOT match mock
- **UI**: Product Families card grid, Compliance list, Approval Queue list, Product Usage Matrix (3 hardcoded rows)
- **Buttons**: none (view-only)
- **API**: zero calls

#### 4.2.4 `CommercialEngineModule()` — lines 1991-2611 ⚠️ PARTIAL

10 sub-tabs (`CommercialTab`):
| Tab | Function | Lines | Mock Array | Items | Notes |
|---|---|---|---|---|---|
| overview | `CommercialOverviewTab` | 2048-2096 | `stats` | 8 cards | Hardcoded numbers |
| priceLists | `PriceListsTab` | 2098-2147 | `lists` | 6 | Fields: code, name, type (RETAIL/WHOLESALE/RESTAURANT/CORPORATE/FESTIVAL/EXPORT), currency (INR/USD), validFrom, priority, status, taxMode (INCLUSIVE/EXCLUSIVE), items |
| tax | `TaxTab` | 2149-2193 | `groups` | 6 | GST-0/5/12/18/28 + CESS-5. Fields: code, name, type (EXEMPT/GST/CESS), rates [{c,r}], status |
| discounts | `DiscountsTab` | 2195-2238 | `discounts` | 5 | Types: PERCENTAGE, FLAT, VOLUME, CUSTOMER, COUPON. Fields: code, name, type, value, kind, max, stackable, status |
| promotions | `PromotionsTab` | 2240-2280 | `promos` | 5 | Types: AUTOMATIC/COUPON. Offer: PERCENT_OFF/FLAT_OFF/BUY_X_GET_Y. Fields: code, name, type, offer, value, channels[], validFrom, validTo, used, max, priority, status |
| futurePrices | `FuturePricesTab` | 2282-2319 | `prices` | 4 | Fields: product, current, future, change, effective, auto, status |
| approvals | `ApprovalsTab` | 2321-2367 | `approvals` | 5 | Stages: DRAFT → PRICING_TEAM → FINANCE → MANAGEMENT → APPROVED → PUBLISHED. SLA tracking |
| cost | `CostMarginTab` | 2369-2411 | `profiles` | 4 | Methods: FIFO/WEIGHTED_AVERAGE/STANDARD/LAST_PURCHASE. Tracks purchase/average/fifo/weighted/standard/last/total/selling/margin% |
| rules | `RulesTab` | 2413-2450 | `rules` | 5 | Enforcement: HARD_BLOCK, OVERRIDE_WITH_REASON, WARN |
| resolution | `ResolutionTab` | 2452-2611 | `mockChain` | live | 1 real API call to `/api/commercial/resolve-price` (mini-service, NOT /api/v1) |

- **State (ResolutionTab)**: `productId`, `quantity`, `channel` (RETAIL_POS/RESTAURANT_POS/ERP/ECOMMERCE/CUSTOMER_PORTAL), `customerId`, `result`, `loading`
- **ResolutionTab.resolve()** (line 2460): POSTs to `http://localhost:3030/api/commercial/resolve-price` (mini-service, NOT `/api/v1/...`, no auth token)
- **Fallback**: simulated response with `resolutionTrace` audit trail (lines 2476-2500) + note: *"Backend offline — showing simulated resolution. Start backend: cd mini-services/suop-backend && bun run index.ts"*
- **Dead buttons**: "New Price List" (2119), "New Tax Group" (2164), "New Discount" (2213), "New Promotion" (2253), "Schedule Price Change" (2294), "Advance Stage" (2357), "New Rule" (2429)
- **API**: 1 real (mini-service), 0 main API

#### 4.2.5 `BusinessPartnerModule()` — lines 2616-3154 ❌ MOCK

10 sub-tabs (`BPTab`). Consolidates Customer + Supplier + Transporter + Franchisee + Corporate + Delivery Partner + Service Provider into a single unified "Business Partner" entity (SAP-style approach explicitly described at lines 2722-2744).

| Tab | Function | Lines | Mock Array | Items |
|---|---|---|---|---|
| overview | `BPOverviewTab` | 2673-2747 | `stats`, `roleBreakdown` | 8 stats + 10 roles |
| partners | `BPPartnersTab` | 2749-2810 | `partners` | 10 |
| addresses | `BPAddressesTab` | 2812-2847 | `addresses` | 8 |
| contacts | `BPContactsTab` | 2849-2889 | `contacts` | 7 |
| financial | `BPFinancialTab` | 2891-2935 | `profiles` | 10 |
| compliance | `BPComplianceTab` | 2937-2981 | `compliance` | 9 |
| groups | `BPGroupsTab` | 2983-3024 | `groups` | 10 |
| banking | `BPBankingTab` | 3026-3068 | `accounts` | 8 |
| relationships | `BPRelationshipsTab` | 3070-3106 | `relationships` | 5 |
| scorecards | `BPScorecardsTab` | 3108-3154 | `scorecards` | 6 |

**Partners mock** (line 2750): 10 partners across 10 roles — Tata Consumer Products (CUSTOMER+CORPORATE, ₹50L credit), Konkan Cashew Processors (SUPPLIER+MANUFACTURER), Sri Balaji Sugar (SUPPLIER), Blue Dart Express (TRANSPORTER+DELIVERY_PARTNER), Reliance Retail (CUSTOMER+DISTRIBUTOR+RETAIL_OUTLET), Sudhamrit Franchise Andheri (FRANCHISE+RETAIL_OUTLET), Amul (SUPPLIER+DISTRIBUTOR), Infosys (CUSTOMER+CORPORATE+SERVICE_PROVIDER), Mumbai Packaging Solutions (SUPPLIER), Zomato (DELIVERY_PARTNER+SERVICE_PROVIDER).

Each partner: `id, code, name, type, roles[], gst, credit, risk, riskScore, status`.

**Addresses**: 9 types (REGISTERED_OFFICE, BILLING, SHIPPING, FACTORY, WAREHOUSE, BRANCH, RESTAURANT, PICKUP, RETURN).

**Financial**: 10 partners with `creditLimit, outstanding, available, creditDays, currency (all INR), paymentMode (CREDIT), paymentTerms (NET_15/30/45/60, CASH, ADVANCE), taxCategory (REGISTERED/COMPOSITION), risk`.

**Compliance**: 9 records. 8 types: GST, PAN, MSME, FSSAI, IEC, ISO, Agreements, Insurance.

**Groups**: 10 groups (5 customer: Retail/Wholesale/Corporate/VIP/Export; 5 supplier: Raw Material/Packaging/Transport/Maintenance/Utility).

**Banking**: 8 accounts. Account numbers masked (**** **** **** 4521). `verified` flag.

**Relationships**: 5 types — CUSTOMER_OF, SUBSIDIARY, PREFERRED_SUPPLIER, STRATEGIC_PARTNER, FRANCHISE.

**Scorecards**: 6 quarterly — `onTime, accuracy, quality, complaints, payment, response, overall, grade (A+/A/B/C/D), orders, value`.

**Dead buttons (8)**: "New Partner" (2778), "New Address" (2828), "New Contact" (2864), "Add Compliance" (2955), "New Group" (3001), "Add Bank Account" (3042), "New Relationship" (3083), "New Scorecard" (3123).

**Critical**: Backend has separate `/api/v1/sales/customers` and `/api/v1/procurement/suppliers` endpoints, NOT a unified `/api/v1/business-partners`. The unified UI requires an adapter or a new backend endpoint. Backend Prisma defines `BusinessPartner` model but the routes use raw SQL against `customers`/`suppliers` tables — schema mismatch.

#### 4.2.6 `IdentificationModule()` — lines 3159-3808 ⚠️ PARTIAL

10 sub-tabs (`IDTab`):
| Tab | Function | Lines | Mock Array | Items |
|---|---|---|---|---|
| overview | `IDOverviewTab` | 3216-3274 | `stats` | 8 stats + alerts |
| barcodes | `IDBarcodesTab` | 3276-3322 | `barcodes` | 8 |
| qrcodes | `IDQRCodesTab` | 3324-3366 | `qrcodes` | 6 |
| batches | `IDBatchesTab` | 3368-3430 | `batches` | 8 |
| lots | `IDLotsTab` | 3432-3481 | `lots` | 7 |
| serials | `IDSerialsTab` | 3483-3537 | `serials` | 5 |
| gs1 | `IDGS1Tab` | 3539-3578 | `gs1` | 6 |
| labels | `IDLabelsTab` | 3581-3630 | `templates` | 8 |
| print | `IDPrintTab` | 3632-3678 | `jobs` | 6 |
| traceability | `IDTraceabilityTab` | 3680-3808 | `mockChain` | live |

**Barcodes**: 9 types (EAN_13, EAN_8, UPC_A, UPC_E, CODE_128, CODE_39, GS1_128, ITF_14, INTERNAL). 8 barcodes shown for Kaju Katli 250g/500g, Soan Cake, Mixed Namkeen, Gulab Jamun.

**QR Codes**: 7 purposes (PRODUCT, BATCH, WAREHOUSE, LOCATION, ASSET, INVOICE, ORDER). Tracks `scans` count + `lastScan` timestamp.

**Batches**: 8 batches. 7 statuses (PLANNED, PRODUCED, RELEASED, QUARANTINED, BLOCKED, CONSUMED, EXPIRED). Quality grades A/B/C/REJECT.

**Lots**: 7 lots. 5 types (SUPPLIER_LOT, PRODUCTION_LOT, WAREHOUSE_LOT, RETURN_LOT, INSPECTION_LOT). Quality: PASSED/FAILED/PENDING/QUARANTINED.

**Serials**: 5 serials for machines/equipment/electronics. Tracks warranty + service history.

**GS1**: 6 IDs (GTIN, GLN, SSCC, GS1-128). Company prefix `8901234` hardcoded.

**Labels**: 8 templates. 8 types (Product, Shelf, Pallet, Batch, Location, Shipping, QR, Barcode). 5 formats (A4, Thermal, Zebra, Brother, PDF).

**Print Jobs**: 6 jobs. 5 modes (Single, Bulk, Auto, Scheduled, Reprint). 5 printer types (Thermal, Laser, Inkjet, Bluetooth, Network).

**Traceability Tab** (lines 3680-3808):
- State: `batchNumber` (default 'KK-2607-01'), `direction` ('forward' | 'backward'), `result`, `loading`
- `trace()` (line 3703): POSTs to `http://localhost:3030/api/identification/trace` (mini-service, no auth)
- Fallback note (line 3715): *"Backend offline — showing simulated trace. Start backend: cd mini-services/suop-backend && bun run index.ts"*

**Dead buttons (8)**: "Generate Barcode" (3299), "Generate QR" (3343), "New Batch" (3391), "New Lot" (3453), "Assign Serial" (3498), "New GS1 ID" (3554), "New Template" (3604), "New Print Job" (3647).

#### 4.2.7 `GovernanceModule()` — lines 3813-4378 ❌ MOCK

10 sub-tabs (`GovTab`):
| Tab | Function | Lines | Mock Array | Items |
|---|---|---|---|---|
| overview | `GovOverviewTab` | 3870-3934 | `stats` | 8 stats + data quality score 91.6 |
| lifecycle | `GovLifecycleTab` | 3936-3995 | `lifecycles` | 8 |
| approvals | `GovApprovalsTab` | 3997-4050 | `workflows` | 5 |
| import | `GovImportTab` | 4052-4097 | `jobs` | 5 |
| export | `GovExportTab` | 4099-4140 | `jobs` | 4 |
| validation | `GovValidationTab` | 4142-4190 | `rules` | 10 |
| duplicates | `GovDuplicatesTab` | 4192-4245 | `duplicates` | 6 |
| audit | `GovAuditTab` | 4247-4288 | `audit` | 8 |
| quality | `GovQualityTab` | 4290-4334 | `metrics` | 12 |
| history | `GovHistoryTab` | 4336-4378 | `history` | 6 |

**Lifecycle**: 8 states enforced (DRAFT → UNDER_REVIEW → APPROVED → PUBLISHED → ACTIVE → INACTIVE → DISCONTINUED → ARCHIVED).

**Approvals**: 6-stage workflow (CREATOR → REVIEWER → QA → COMPLIANCE → FINANCE → PUBLISHER → COMPLETED). 3 workflow types: STANDARD, PARALLEL, CONDITIONAL.

**Import jobs**: 5 jobs with rollback support. Statuses: COMPLETED, PREVIEWING, QUEUED, ROLLBACK, FAILED.

**Validation Rules**: 10 rules across 6 types (REQUIRED, UNIQUE, RANGE, REGEX, BUSINESS_RULE, CROSS_REFERENCE) and 3 enforcement modes (BLOCK, WARN, LOG). Notable: HSN regex (line 4148), UOM required (line 4153).

**Duplicates**: 6 detection rules (Name, SKU, Barcode, HSN, Brand, Similar Names). 4 statuses (PENDING, MERGED, IGNORED, FALSE_POSITIVE).

**Audit**: 8 entries with action types (CREATE, UPDATE, ARCHIVE, MERGE). Tracks `user, role, ip, time, fields[], reason`.

**Quality metrics**: 12 metrics across PRODUCT + BUSINESS_PARTNER entities. Overall score: 91.6 (Grade A).

**Dead buttons (7)**: "Transition" (3959), "New Workflow" (4012), "New Import" (4066), "New Export" (4112), "New Rule" (4162), "Scan Duplicates" (4207), "Merge/Mark False Positive/Ignore" (4235-4237), "Rollback" (4371).

**Critical**: This module is supposed to be the **governance layer over all master data** but it doesn't actually interact with any of the other master modules. All 10 tabs are 100% mock with no API.

#### 4.2.8 `WarehouseModule()` — lines 8410-8890 ❌ MOCK

5 sub-tabs (WarehouseTab):
| Tab | Function | Lines | Mock Array | Items |
|---|---|---|---|---|
| overview | `WarehouseOverviewTab` | 8455-8556 | `stats` | 8 cards + 8-level hierarchy diagram + celebration banner |
| warehouses | `WarehouseWarehousesTab` | 8557-8605 | `WHM_WAREHOUSES` | 6 |
| zones | `WarehouseZonesTab` | 8607-8654 | `WHM_ZONES` | 10 |
| temperature | `WarehouseTemperatureTab` | 8656-8720 | `WHM_TEMP_ZONES` | 4 (2 with active alerts) |
| rules | `WarehouseRulesTab` | 8722-8771 | `WHM_RULES` | 5 |

**Warehouse fields**: `id, code, name, type, company, branch, manager, city, volumeM3, weightKg, pallets, bins, hours, status, workingDays`. 11 types (RAW_MATERIAL, PACKAGING, FINISHED_GOODS, COLD_STORAGE, DEEP_FREEZE, RETURNS, TRANSIT, QUARANTINE, SCRAP, DISTRIBUTION_CENTER, DARK_STORE).

**Zones**: `id, code, name, type, warehouse, parentZone, tempZone, volumeM3, weightKg, pallets, bins, restricted, status`. 10 zones shown.

**Temperature zones**: `id, code, name, type, warehouse, minTemp, maxTemp, targetTemp, minHum, maxHum, lastReading, lastReadingAt, alert, monitoring`. 2 alerts active (CHL, HUM).

**Rules**: `id, code, name, type, value, unit, enforcement, warehouse, desc`. 5 rules — MAX_BIN_WEIGHT, FEFO_ENABLED, BARCODE_MANDATORY, QUALITY_INSPECTION_REQUIRED, MAX_STACK_HEIGHT.

**Dead buttons**: All "New" buttons missing or no-op (the module is read-only display).

**Available but unused API**: `src/modules/organization/api/client.ts` has `warehouseApi.list/get/create` for Warehouse Master. `src/modules/warehouse/api/client.ts` has `warehouseApi.listZones/listAisles/listRacks/listBins/createBin/...` for WMS operations. Neither imported.

#### 4.2.9 `WarehouseLocationModule()` — lines 8891-9392 ❌ MOCK

5 sub-tabs (WhLocTab):
| Tab | Function | Lines | Mock Array | Items |
|---|---|---|---|---|
| overview | `WhLocOverviewTab` | 8935-9039 | `stats` | 8 stats + 7-level hierarchy + 4-step scanner workflow |
| bins | `WhLocBinsTab` | 9040-9112 | `WH_LOC_BINS` | ~15 |
| aisles | `WhLocAislesTab` | 9113-9161 | `WH_LOC_AISLES` | 6 |
| racks | `WhLocRacksTab` | 9162-9214 | `WH_LOC_RACKS` | 8 |
| capacity | `WhLocCapacityTab` | 9215-9392 | alerts dashboard | 4 alert types |

**Bin fields**: `id, warehouseCode, zoneCode, aisleCode, rackCode, shelfCode, binCode, barcode, qrCode, maxWeightKg, maxVolumeM3, currentWeightKg, currentVolumeM3, utilizationPercent, temperatureZone, binType, status, statusReason, currentItemTypes`.

**Color maps** (defined at lines 8776-8856): TRAFFIC_DIRECTION_COLORS (4), PICKING_LEVEL_COLORS (4), ACCESSIBILITY_COLORS (4), BIN_TYPE_COLORS (5), BIN_STATUS_COLORS (7), BIN_TEMP_ZONE_COLORS (5), ALERT_TYPE_COLORS (4).

**Hierarchy**: Warehouse → Zone → Aisle → Rack → Shelf → Bin → Inventory (7 levels).

**Bin naming convention**: A-05-03-12 (Aisle 05, Rack 03, Shelf 12).

**Dead buttons**: All "New" actions missing.

#### 4.2.10 `PlantMasterModule()` — lines 16342-16439 ❌ MOCK

- **State**: 1 (`showCreate`)
- **Mock data**: `plants` (line 16344) — 5 plants:
  - P1 PLANT-THANE-01 (SWEET_MANUFACTURING, 2500 kg/day)
  - P2 PLANT-THANE-02 (NAMKEEN_MANUFACTURING, 1800 kg/day)
  - P3 PLANT-BLR-01 (BATTER_PRODUCTION, 1200 kg/day)
  - P4 PLANT-MUM-01 (CENTRAL_KITCHEN, 800 kg/day)
  - P5 PLANT-PUN-01 (PACKAGING_PLANT, 3000 kg/day, MAINTENANCE status)
- **Fields**: `id, code, name, type, manager, city, state, capacity, operatingStart, operatingEnd, status, departments, lines, resources`
- **Stats**: 6 cards (Total Plants, Active, Maintenance, Total Capacity kg/day, Total Departments, Total Lines) — **computed live** from `plants` array via `.length`, `.filter`, `.reduce` (one of the few places this is done correctly)
- **Create form** (lines 16388-16403): `showCreate` toggles a form with fields: Plant Code, Plant Name, Plant Type (5 options), Manager, City, Daily Capacity (kg), Operating Start (time), Operating End (time). **"Create Plant" button has NO onClick** — purely decorative.
- **Hierarchy diagram** (lines 16375-16386): Company → Plant → Building → Department → Line → Work Center.
- **Available but unused API**: `plantApi.list/get/create/transition` in `src/modules/organization/api/client.ts` (lines 240-263).

---

## 5. Current Forms

| # | Form | Module | Line | Fields | Submit Handler | API Call |
|---|---|---|---|---|---|---|
| 1 | Create Company dialog | OrganizationModule | 892 | code*, name*, gstin, pan, email, phone, city, state (8 fields) | `handleCreate(data)` line 747 | ✅ POST `/api/v1/organization/companies` |
| 2 | Price Resolution form | CommercialEngineModule → ResolutionTab | 2519 | productId, quantity, channel, customerId (4 fields) | `resolve()` line 2460 | ⚠️ POST `/api/commercial/resolve-price` (mini-service) |
| 3 | Traceability form | IdentificationModule → IDTraceabilityTab | 3745 | batchNumber, direction (2 fields + button) | `trace()` line 3703 | ⚠️ POST `/api/identification/trace` (mini-service) |
| 4 | Create Plant inline form | PlantMasterModule | 16388 | code, name, type, manager, city, capacity, operatingStart, operatingEnd (8 fields) | ❌ NONE | ❌ NONE |

**Total forms**: 4 (2 with real API, 1 with mini-service, 1 with no handler).

**Missing forms** (must be built during implementation):
- Product Master create/edit (28 fields per `productSchema`)
- Customer Master create/edit (24 fields per `customerSchema`)
- Supplier Master create/edit (24 fields per `supplierSchema`)
- Plant Master create/edit (14 fields per `plantSchema`) + actual submit handler
- Warehouse Master create (12 fields per `warehouseSchema`)
- Department create (7 fields per `departmentSchema`)
- Cost Center create (6 fields per `costCenterSchema`)
- Financial Year create (5 fields per `financialYearSchema`)
- Product Category create (5 fields per `categorySchema`)
- Brand create (4 fields per `brandSchema`)
- UOM create (no endpoint — gap)
- HSN/SAC create (no endpoint — gap)
- Price List create (no DTO exposed — gap)
- Tax Group create (no endpoint — gap)
- Discount create (no endpoint — gap)
- Promotion create (no endpoint — gap)
- Customer Contact create (6 fields per `contactSchema`)
- Customer Address create (7 fields per `addressSchema`)
- Supplier Contact create (6 fields)
- Supplier Address create (7 fields)
- Supplier Compliance create (7 fields per `complianceSchema`)
- Supplier Product Mapping create (6 fields per `productMappingSchema`)
- Customer Group create (no DTO — gap)
- Supplier Category create (5 fields per `categorySchema`)
- Barcode create (3 fields per `barcodeSchema`)
- Warehouse Bin create (10 fields per `WarehouseBin` type)
- Warehouse Zone create (no endpoint — gap)
- Warehouse Aisle create (no endpoint — gap)
- Warehouse Rack create (no endpoint — gap)
- Warehouse Temperature Zone create (no endpoint — gap)
- Warehouse Rule create (no endpoint — gap)

---

## 6. Current Tables

| # | Table | Module | Line | Columns | Rows | Data Source | Pagination |
|---|---|---|---|---|---|---|---|
| 1 | Products | ProductMaster | 1881 | UPI, Product, SKU, Brand, MRP, Stock, Status | 6 | Mock `products` | ❌ |
| 2 | Price Lists | PriceListsTab | 2119 | Code, Name, Type, Currency, ValidFrom, Priority, Status, TaxMode, Items | 6 | Mock `lists` | ❌ |
| 3 | Discounts | DiscountsTab | 2213 | Code, Name, Type, Value, Kind, Max, Stackable, Status | 5 | Mock `discounts` | ❌ |
| 4 | Cost Profiles | CostMarginTab | 2370 | Product, Method, Purchase, Average, FIFO, Weighted, Standard, Last, Total, Margin, Selling | 4 | Mock `profiles` | ❌ |
| 5 | Partners | BPPartnersTab | 2778 | Code, Name, Type, Roles, GST, Credit, Risk, Status | 10 | Mock `partners` | ❌ |
| 6 | Contacts | BPContactsTab | 2864 | Partner, Name, Designation, Email, Mobile, Primary | 7 | Mock `contacts` | ❌ |
| 7 | Financial Profiles | BPFinancialTab | 2892 | Partner, CreditLimit, Outstanding, Available, CreditDays, Currency, PaymentMode, PaymentTerms, TaxCategory, Risk | 10 | Mock `profiles` | ❌ |
| 8 | Compliance | BPComplianceTab | 2955 | Partner, Type, Number, Authority, IssueDate, Expiry, Status | 9 | Mock `compliance` | ❌ |
| 9 | Barcodes | IDBarcodesTab | 3299 | ID, Barcode, Type, Product, Primary, Status | 8 | Mock `barcodes` | ❌ |
| 10 | Batches | IDBatchesTab | 3391 | ID, Batch, Product, Mfg, Exp, Produced, Remaining, Status, Grade, Lots, Reason | 8 | Mock `batches` | ❌ |
| 11 | Lots | IDLotsTab | 3453 | ID, Lot, Type, Product, Supplier, Invoice, Batch, Qty, Remaining, Quality | 7 | Mock `lots` | ❌ |
| 12 | GS1 IDs | IDGS1Tab | 3554 | ID, Type, Identifier, Entity, EntityType, Prefix, Check | 6 | Mock `gs1` | ❌ |
| 13 | Lifecycles | GovLifecycleTab | 3959 | ID, Product, State, Prev, Submitted, Approved, Published, Activated, Reason, Transitions | 8 | Mock `lifecycles` | ❌ |
| 14 | Validation Rules | GovValidationTab | 4162 | Code, Name, Entity, Field, Type, Severity, Enforcement, Status | 10 | Mock `rules` | ❌ |
| 15 | Export Jobs | GovExportTab | 4112 | ID, Code, Entity, Format, File, Total, Exported, Size, Status, Initiated, Completed | 4 | Mock `jobs` | ❌ |
| 16 | Warehouses | WarehouseWarehousesTab | 8557 | ID, Code, Name, Type, Company, Branch, Manager, City, VolumeM3, WeightKg, Pallets, Bins, Hours, Status, WorkingDays | 6 | Mock `WHM_WAREHOUSES` | ❌ |
| 17 | Bins | WhLocBinsTab | 9040 | ID, WarehouseCode, ZoneCode, AisleCode, RackCode, ShelfCode, BinCode, Barcode, QRCode, MaxWeightKg, MaxVolumeM3, CurrentWeightKg, CurrentVolumeM3, UtilizationPercent, TemperatureZone, BinType, Status, StatusReason, CurrentItemTypes | ~15 | Mock `WH_LOC_BINS` | ❌ |

**Total tables**: 17 (all read-only, all mock, none paginated).

---

## 7. Current Buttons

### 7.1 Dead Buttons (no onClick handler) — 40 total

| Module | Button | Line |
|---|---|---|
| ProductMaster | "Import" | 1873 |
| ProductMaster | "Export" | 1874 |
| ProductMaster | "New Product" | 1875 |
| PriceListsTab | "New Price List" | 2119 |
| TaxTab | "New Tax Group" | 2164 |
| DiscountsTab | "New Discount" | 2213 |
| PromotionsTab | "New Promotion" | 2253 |
| FuturePricesTab | "Schedule Price Change" | 2294 |
| ApprovalsTab | "Advance Stage" | 2357 |
| RulesTab | "New Rule" | 2429 |
| BPPartnersTab | "New Partner" | 2778 |
| BPAddressesTab | "New Address" | 2828 |
| BPContactsTab | "New Contact" | 2864 |
| BPComplianceTab | "Add Compliance" | 2955 |
| BPGroupsTab | "New Group" | 3001 |
| BPBankingTab | "Add Bank Account" | 3042 |
| BPRelationshipsTab | "New Relationship" | 3083 |
| BPScorecardsTab | "New Scorecard" | 3123 |
| IDBarcodesTab | "Generate Barcode" | 3299 |
| IDQRCodesTab | "Generate QR" | 3343 |
| IDBatchesTab | "New Batch" | 3391 |
| IDLotsTab | "New Lot" | 3453 |
| IDSerialsTab | "Assign Serial" | 3498 |
| IDGS1Tab | "New GS1 ID" | 3554 |
| IDLabelsTab | "New Template" | 3604 |
| IDPrintTab | "New Print Job" | 3647 |
| GovLifecycleTab | "Transition" | 3959 |
| GovApprovalsTab | "New Workflow" | 4012 |
| GovImportTab | "New Import" | 4066 |
| GovExportTab | "New Export" | 4112 |
| GovValidationTab | "New Rule" | 4162 |
| GovDuplicatesTab | "Scan Duplicates" | 4207 |
| GovDuplicatesTab | "Merge" / "Mark False Positive" / "Ignore" | 4235-4237 |
| GovHistoryTab | "Rollback" | 4371 |
| PlantMaster | "Create Plant" | 16400 |

### 7.2 Live Buttons (working onClick) — 4 total

| Module | Button | Line | Action |
|---|---|---|---|
| OrganizationModule | "Add Entity" | 859 | Opens Create Company dialog (gated by `org:create`) |
| OrganizationModule | "Cancel" (in dialog) | 895 | Closes dialog |
| OrganizationModule | "Create" (in dialog) | 899 | Submits POST `/api/v1/organization/companies` |
| ResolutionTab | "Resolve Price" | 2525 | POST `/api/commercial/resolve-price` (mini-service) |
| IDTraceabilityTab | "Trace" | 3747 | POST `/api/identification/trace` (mini-service) |
| PlantMaster | "Add Plant" (toggles form) | 16362 | Opens inline form (but submit button is dead) |

---

## 8. Current Dialogs

| # | Dialog | Module | Line | Type | Wired? |
|---|---|---|---|---|---|
| 1 | Create Company | OrganizationModule | 888-919 | Inline modal (`fixed inset-0 bg-black/50 z-50`) | ✅ Yes |
| 2 | (none else) | — | — | — | — |

**Drawers / Sheets**: NONE. The codebase imports `Sheet` and `Drawer` from `@/components/ui/...` but Section 03 doesn't use them. Only inline modals are used.

---

## 9. Business Rules

### 9.1 Product Business Rules (enforced in `productService`)

1. SKU must be unique per tenant — `ConflictError` on duplicate.
2. `baseUomId` must reference an existing UOM.
3. `categoryId` (if specified) must reference an existing category.
4. Cannot delete `ACTIVE` products — must discontinue first (`BusinessRuleError` `PRODUCT.ACTIVE_DELETE`).
5. Lifecycle transitions validated by `ProductLifecycle` workflow.
6. Default values: `productType=FINISHED_GOOD`, `fifoStrategy=FEFO`, `costingMethod=WEIGHTED_AVG`, `procurementType=MAKE`, `batchRequired=false`, `serialRequired=false`, `expiryTracking=false`, `inspectionRequired=false`, `isCritical=false`.

### 9.2 Customer Business Rules (enforced in `customerService`)

1. `customerCode` unique per tenant.
2. `gstin` (if provided) must match GSTIN regex `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`.
3. `pan` (if provided) must match PAN regex `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`.
4. Default `status='LEAD'`, `outstanding_balance=0`, `credit_hold=false`.
5. Lifecycle: LEAD → PROSPECT → APPROVED → ACTIVE → BLOCKED → INACTIVE → ARCHIVED.
6. Credit hold auto-set when `outstanding_balance > credit_limit`.
7. Risk rating drives approval workflow: HIGH/CRITICAL requires dual approval.

### 9.3 Supplier Business Rules (enforced in `supplierService`)

1. `vendorCode` unique per tenant.
2. `gstin` unique globally (across all tenants).
3. GSTIN + PAN format validated (same regex as customer).
4. Cannot modify `BLACKLISTED` supplier.
5. Cannot delete `ACTIVE` supplier (must block/archive first).
6. Blacklisting is **CRITICAL severity audit log** entry.
7. Preferred supplier assignment revokes previous preferred mappings for same product.
8. Compliance records auto-flag 30 days before expiry (via `findExpiring(tenantId, withinDays=30)`).
9. Lifecycle: DRAFT → VERIFICATION → APPROVED → ACTIVE → PROBATION → BLOCKED → BLACKLISTED → ARCHIVED.

### 9.4 Organization Business Rules (enforced in `organizationService`)

1. Company code unique per tenant.
2. Parent company must exist if `parentId` specified.
3. Cannot delete company with child companies (`ORG.HAS_CHILDREN`).
4. Hard delete requires `system:tenant:cross` permission (system admin only).
5. Only one default warehouse per plant (`ORG.DEFAULT_WAREHOUSE_EXISTS`).
6. Financial year end date must be after start date.
7. No overlapping financial years.
8. Lifecycle: DRAFT → CONFIGURED → ACTIVE → SUSPENDED → ARCHIVED.

### 9.5 Warehouse Business Rules (enforced in `warehouseService`)

1. Bin code unique per warehouse.
2. Bin `currentWeightKg` cannot exceed `maxWeightKg` (validation on stock-in).
3. Bin `currentVolumeM3` cannot exceed `maxVolumeM3`.
4. Blocked bins cannot receive putaway.
5. Quarantine bins require quality inspection release.
6. FEFO/FIFO strategy enforced at putaway time (per product's `fifoStrategy`).
7. Barcode must be unique per warehouse.

### 9.6 Pricing Business Rules (enforced in `pricingEngineService`)

1. Price list code unique per tenant.
2. Overlapping price lists resolved by `priority` (lower number = higher priority).
3. Customer-specific price overrides product-specific price.
4. Promotions apply only within `startDate`/`endDate` window.
5. Coupon usage cannot exceed `usageLimit`.
6. Stackable discounts can combine; non-stackable override.
7. Tax mode INCLUSIVE vs EXCLUSIVE affects final price computation.
8. Margin rule: selling price must be ≥ cost price + minimum margin (configurable per commercial rule, enforcement HARD_BLOCK/OVERRIDE_WITH_REASON/WARN).

### 9.7 Identification Business Rules

1. Barcode value unique per type per tenant.
2. Primary barcode: only one per product.
3. Batch number unique per product per production date.
4. Lot number unique per supplier per invoice.
5. Serial number globally unique.
6. GS1 check digit validation (mod-10 algorithm).
7. Traceability chain: every step must reference an existing entity (forward and backward).

### 9.8 Governance Business Rules

1. Lifecycle transitions validated by entity-specific workflow (Product uses `ProductLifecycle`, etc.).
2. Import jobs support rollback within 24 hours of completion.
3. Validation rules enforce at write time (create/update) per `enforcement` mode.
4. Duplicate detection runs on create + on demand (Scan Duplicates button).
5. Merge operation is irreversible (audit logged as CRITICAL).
6. Change history supports rollback to any prior version (with audit log of who rolled back + reason).

---

## 10. Workflow Mapping

| Workflow Name | Module | States | Trigger | Frontend Exposure |
|---|---|---|---|---|
| `ProductLifecycle` | product | DRAFT, REVIEW, APPROVED, ACTIVE, DISCONTINUED, ARCHIVED | POST `/api/v1/catalog/products/:id/transition` | ❌ No UI |
| `CustomerLifecycle` | customer | LEAD, PROSPECT, APPROVED, ACTIVE, BLOCKED, INACTIVE, ARCHIVED | POST `/api/v1/sales/customers/:id/transition` | ❌ No UI |
| `SupplierLifecycle` | supplier | DRAFT, VERIFICATION, APPROVED, ACTIVE, PROBATION, BLOCKED, BLACKLISTED, ARCHIVED | POST `/api/v1/procurement/suppliers/:id/transition` | ❌ No UI |
| `OrganizationLifecycle` | organization | DRAFT, CONFIGURED, ACTIVE, SUSPENDED, ARCHIVED | POST `/api/v1/organization/companies/:id/transition` | ❌ No UI (only create is wired) |
| `PlantLifecycle` | organization | (uses OrganizationLifecycle) | POST `/api/v1/organization/plants/:id/transition` | ❌ No UI |
| `RecipeLifecycle` | recipe-bom | DRAFT, APPROVED, ACTIVE, DEPRECATED, ARCHIVED | POST `/api/v1/manufacturing/recipes/recipes/:id/transition` | ❌ No UI |
| `BomLifecycle` | recipe-bom | (manual status, no workflow registry) | POST `/api/v1/manufacturing/recipes/boms/:id/transition` | ❌ No UI |
| `TaxReturnLifecycle` | gst-taxation | (registered but service calls `GstConfigurationLifecycle` — **BROKEN**) | POST `/api/v1/finance/gst/:id/transition` | ❌ No UI |
| `ProductCostLifecycle` | product-costing | (referenced but **NOT REGISTERED** — broken) | POST `/api/v1/finance/costing/:id/transition` | ❌ No UI |
| `GeneralLedgerLifecycle` | general-ledger | (referenced but file content not verified — likely broken) | POST `/api/v1/finance/gl/:id/transition` | ❌ No UI |

**Workflow gaps**: 3 modules have broken workflow registrations (`gst-taxation`, `product-costing`, `general-ledger`). These need backend fixes before frontend can wire transitions.

---

## 11. API Mapping (Frontend → Backend)

### 11.1 Currently Wired (6 endpoints)

| Frontend Module | Method | Endpoint | Auth | Status |
|---|---|---|---|---|
| OrganizationModule | GET | `/api/v1/organization/hierarchy` | Bearer | ✅ Working |
| OrganizationModule | GET | `/api/v1/organization/companies/:id` | Bearer | ✅ Working |
| OrganizationModule | POST | `/api/v1/organization/companies` | Bearer | ✅ Working |
| ResolutionTab | POST | `/api/commercial/resolve-price` | ❌ No auth | ⚠️ Mini-service |
| IDTraceabilityTab | POST | `/api/identification/trace` | ❌ No auth | ⚠️ Mini-service |

### 11.2 Available but NOT Wired (109 endpoints)

#### Product Module (14 endpoints) — mount `/api/v1/catalog`
| Method | Path | Permission |
|---|---|---|
| GET | `/api/v1/catalog/products` | `product:read` |
| GET | `/api/v1/catalog/products/:id` | `product:read` |
| POST | `/api/v1/catalog/products` | `product:create` |
| PATCH | `/api/v1/catalog/products/:id` | `product:update` |
| DELETE | `/api/v1/catalog/products/:id` | `product:delete` |
| POST | `/api/v1/catalog/products/:id/transition` | `product:update` |
| GET | `/api/v1/catalog/products/barcode/:barcode` | `product:read` |
| GET | `/api/v1/catalog/products/:id/barcodes` | `product:read` |
| POST | `/api/v1/catalog/products/:id/barcodes` | `product:update` |
| GET | `/api/v1/catalog/categories` | `product:read` |
| POST | `/api/v1/catalog/categories` | `product:create` |
| GET | `/api/v1/catalog/brands` | `product:read` |
| POST | `/api/v1/catalog/brands` | `product:create` |
| GET | `/api/v1/catalog/uoms` | `product:read` |

#### Customer Module (12 endpoints) — mount `/api/v1/sales`
| Method | Path | Permission (effective) |
|---|---|---|
| GET | `/api/v1/sales/customers` | `org:read` ⚠️ |
| GET | `/api/v1/sales/customers/:id` | `org:read` ⚠️ |
| POST | `/api/v1/sales/customers` | `org:create` ⚠️ |
| PATCH | `/api/v1/sales/customers/:id` | `org:update` ⚠️ |
| DELETE | `/api/v1/sales/customers/:id` | `org:delete` ⚠️ |
| POST | `/api/v1/sales/customers/:id/transition` | `org:update` ⚠️ |
| GET | `/api/v1/sales/customers/:id/credit` | `org:read` ⚠️ |
| GET | `/api/v1/sales/customers/gst/:gstin` | `org:read` ⚠️ |
| POST | `/api/v1/sales/customers/:id/contacts` | `org:update` ⚠️ |
| POST | `/api/v1/sales/customers/:id/addresses` | `org:update` ⚠️ |
| GET | `/api/v1/sales/customer-groups` | `org:read` ⚠️ |
| POST | `/api/v1/sales/customer-groups` | `org:create` ⚠️ |

> ⚠️ Customer module uses `org:*` permissions as proxy. Fix needed in `customer/routes/index.ts` lines 49–54.

#### Supplier Module (15 endpoints) — mount `/api/v1/procurement`
| Method | Path | Permission |
|---|---|---|
| GET | `/api/v1/procurement/suppliers` | `supplier:read` |
| GET | `/api/v1/procurement/suppliers/:id` | `supplier:read` |
| POST | `/api/v1/procurement/suppliers` | `supplier:create` |
| PATCH | `/api/v1/procurement/suppliers/:id` | `supplier:update` |
| DELETE | `/api/v1/procurement/suppliers/:id` | `supplier:delete` |
| POST | `/api/v1/procurement/suppliers/:id/transition` | `supplier:update` |
| POST | `/api/v1/procurement/suppliers/:id/blacklist` | `supplier:blacklist` |
| GET | `/api/v1/procurement/suppliers/gst/:gstin` | `supplier:read` |
| GET | `/api/v1/procurement/suppliers/:id/contacts` | `supplier:read` |
| POST | `/api/v1/procurement/suppliers/:id/contacts` | `supplier:update` |
| POST | `/api/v1/procurement/suppliers/:id/addresses` | `supplier:update` |
| POST | `/api/v1/procurement/suppliers/:id/compliances` | `supplier:update` |
| POST | `/api/v1/procurement/suppliers/:id/products` | `supplier:update` |
| GET | `/api/v1/procurement/supplier-categories` | `supplier:read` |
| POST | `/api/v1/procurement/supplier-categories` | `supplier:create` |

#### Organization Module (17 endpoints) — mount `/api/v1/organization`
| Method | Path | Permission |
|---|---|---|
| GET | `/api/v1/organization/companies` | `org:read` |
| GET | `/api/v1/organization/companies/:id` | `org:read` |
| POST | `/api/v1/organization/companies` | `org:create` |
| PATCH | `/api/v1/organization/companies/:id` | `org:update` |
| DELETE | `/api/v1/organization/companies/:id` | `org:delete` |
| POST | `/api/v1/organization/companies/:id/transition` | `org:update` |
| POST | `/api/v1/organization/companies/:id/restore` | `org:update` |
| DELETE | `/api/v1/organization/companies/:id/hard` | `org:delete` (+ `system:tenant:cross`) |
| GET | `/api/v1/organization/plants` | `org:read` |
| GET | `/api/v1/organization/plants/:id` | `org:read` |
| POST | `/api/v1/organization/plants` | `org:create` |
| POST | `/api/v1/organization/plants/:id/transition` | `org:update` |
| GET | `/api/v1/organization/warehouses` | `org:read` |
| GET | `/api/v1/organization/warehouses/:id` | `org:read` |
| POST | `/api/v1/organization/warehouses` | `org:create` |
| GET | `/api/v1/organization/departments` | `org:read` |
| POST | `/api/v1/organization/departments` | `org:create` |
| GET | `/api/v1/organization/cost-centers` | `org:read` |
| POST | `/api/v1/organization/cost-centers` | `org:create` |
| GET | `/api/v1/organization/financial-years` | `org:read` |
| GET | `/api/v1/organization/financial-years/current` | `org:read` |
| POST | `/api/v1/organization/financial-years` | `org:create` |
| GET | `/api/v1/organization/hierarchy` | `org:read` |

#### Warehouse Module (15 endpoints) — mount `/api/v1/warehouse`
| Method | Path | Permission (effective) |
|---|---|---|
| GET | `/api/v1/warehouse/zones` | `inventory:read` ⚠️ |
| POST | `/api/v1/warehouse/zones` | `inventory:post` ⚠️ |
| GET | `/api/v1/warehouse/aisles` | `inventory:read` ⚠️ |
| POST | `/api/v1/warehouse/aisles` | `inventory:post` ⚠️ |
| GET | `/api/v1/warehouse/racks` | `inventory:read` ⚠️ |
| POST | `/api/v1/warehouse/racks` | `inventory:post` ⚠️ |
| GET | `/api/v1/warehouse/bins` | `inventory:read` ⚠️ |
| POST | `/api/v1/warehouse/bins` | `inventory:post` ⚠️ |
| GET | `/api/v1/warehouse/putaway-tasks` | `inventory:read` ⚠️ |
| POST | `/api/v1/warehouse/putaway-tasks` | `inventory:post` ⚠️ |
| POST | `/api/v1/warehouse/putaway-tasks/:id/complete` | `inventory:post` ⚠️ |
| GET | `/api/v1/warehouse/barcodes` | `inventory:read` ⚠️ |
| POST | `/api/v1/warehouse/barcodes` | `inventory:post` ⚠️ |
| POST | `/api/v1/warehouse/barcodes/:id/print` | `inventory:post` ⚠️ |
| POST | `/api/v1/warehouse/scan` | `inventory:read` ⚠️ |
| GET | `/api/v1/warehouse/scan-logs` | `inventory:read` ⚠️ |

#### Inventory Module (14 endpoints) — mount `/api/v1/inventory`
| Method | Path | Permission |
|---|---|---|
| GET | `/api/v1/inventory/inventory` | `inventory:read` |
| GET | `/api/v1/inventory/inventory/:id` | `inventory:read` |
| POST | `/api/v1/inventory/inventory/stock-in` | `inventory:post` |
| POST | `/api/v1/inventory/inventory/stock-out` | `inventory:post` |
| GET | `/api/v1/inventory/ledger` | `inventory:read` |
| GET | `/api/v1/inventory/transactions` | `inventory:read` |
| GET | `/api/v1/inventory/reservations` | `inventory:read` |
| POST | `/api/v1/inventory/reservations` | `inventory:post` |
| POST | `/api/v1/inventory/reservations/:id/release` | `inventory:post` |
| GET | `/api/v1/inventory/blocks` | `inventory:read` |
| POST | `/api/v1/inventory/blocks` | `inventory:adjust` |
| GET | `/api/v1/inventory/batches` | `inventory:read` |
| GET | `/api/v1/inventory/expiry` | `inventory:read` |
| POST | `/api/v1/inventory/expiry/mark-expired` | `inventory:adjust` |

#### Pricing Engine Module (9 endpoints) — mount `/api/v1/sales/pricing`
| Method | Path | Permission (effective) |
|---|---|---|
| GET | `/api/v1/sales/pricing/price-lists` | `customer:read` ⚠️ |
| POST | `/api/v1/sales/pricing/price-lists` | `customer:read` ⚠️ (should be write) |
| GET | `/api/v1/sales/pricing/promotions` | `customer:read` ⚠️ |
| POST | `/api/v1/sales/pricing/promotions` | `customer:read` ⚠️ |
| GET | `/api/v1/sales/pricing/coupons` | `customer:read` ⚠️ |
| POST | `/api/v1/sales/pricing/coupons` | `customer:read` ⚠️ |
| GET | `/api/v1/sales/pricing/tax-configs` | `customer:read` ⚠️ |
| POST | `/api/v1/sales/pricing/tax-configs` | `customer:read` ⚠️ |
| POST | `/api/v1/sales/pricing/calculate` | `customer:read` ⚠️ |

#### GST Taxation Module (8 endpoints) — mount `/api/v1/finance/gst`
| Method | Path | Permission (effective) |
|---|---|---|
| GET | `/api/v1/finance/gst` | `audit:read` ⚠️ |
| GET | `/api/v1/finance/gst/:id` | `audit:read` ⚠️ |
| GET | `/api/v1/finance/gst/count` | `audit:read` ⚠️ |
| GET | `/api/v1/finance/gst/exists/:code` | `audit:read` ⚠️ |
| POST | `/api/v1/finance/gst` | `audit:read` ⚠️ (should be write) |
| PUT | `/api/v1/finance/gst/:id` | `audit:read` ⚠️ |
| DELETE | `/api/v1/finance/gst/:id` | `audit:read` ⚠️ |
| POST | `/api/v1/finance/gst/:id/transition` | `audit:read` ⚠️ (workflow BROKEN) |

#### Recipe-BOM Module (9 endpoints) — mount `/api/v1/manufacturing/recipes`
| Method | Path | Permission |
|---|---|---|
| GET | `/api/v1/manufacturing/recipes/recipes` | `product:read` |
| GET | `/api/v1/manufacturing/recipes/recipes/:id` | `product:read` |
| POST | `/api/v1/manufacturing/recipes/recipes` | `product:create` |
| POST | `/api/v1/manufacturing/recipes/recipes/:id/transition` | `product:update` |
| GET | `/api/v1/manufacturing/recipes/boms` | `product:read` |
| GET | `/api/v1/manufacturing/recipes/boms/:id` | `product:read` |
| POST | `/api/v1/manufacturing/recipes/boms` | `product:create` |
| GET | `/api/v1/manufacturing/recipes/boms/:id/explode` | `product:read` |
| POST | `/api/v1/manufacturing/recipes/boms/:id/transition` | `product:update` |
| GET | `/api/v1/manufacturing/recipes/routings` | `product:read` |
| GET | `/api/v1/manufacturing/recipes/routings/:id` | `product:read` |
| POST | `/api/v1/manufacturing/recipes/routings` | `product:create` |

#### Product Costing Module (7 endpoints) — mount `/api/v1/finance/costing`
| Method | Path | Permission (effective) |
|---|---|---|
| GET | `/api/v1/finance/costing` | `audit:read` ⚠️ |
| GET | `/api/v1/finance/costing/:id` | `audit:read` ⚠️ |
| GET | `/api/v1/finance/costing/count` | `audit:read` ⚠️ |
| GET | `/api/v1/finance/costing/exists/:code` | `audit:read` ⚠️ |
| POST | `/api/v1/finance/costing` | `audit:read` ⚠️ (Prisma model MISSING) |
| PUT | `/api/v1/finance/costing/:id` | `audit:read` ⚠️ |
| DELETE | `/api/v1/finance/costing/:id` | `audit:read` ⚠️ |
| POST | `/api/v1/finance/costing/:id/transition` | `audit:read` ⚠️ (workflow BROKEN) |

#### Financial Foundation Module (14 endpoints) — mount `/api/v1/finance/foundation`
| Method | Path | Permission (effective) |
|---|---|---|
| GET | `/api/v1/finance/foundation/accounts` | `audit:read` |
| POST | `/api/v1/finance/foundation/accounts` | `audit:read:critical` ⚠️ |
| GET | `/api/v1/finance/foundation/fiscal-years` | `audit:read` |
| POST | `/api/v1/finance/foundation/fiscal-years` | `audit:read:critical` ⚠️ |
| GET | `/api/v1/finance/foundation/fiscal-periods` | `audit:read` |
| POST | `/api/v1/finance/foundation/fiscal-periods/close` | `audit:read:critical` ⚠️ |
| GET | `/api/v1/finance/foundation/currencies` | `audit:read` |
| POST | `/api/v1/finance/foundation/currencies` | `audit:read:critical` ⚠️ |
| GET | `/api/v1/finance/foundation/exchange-rates` | `audit:read` |
| POST | `/api/v1/finance/foundation/exchange-rates` | `audit:read:critical` ⚠️ |
| GET | `/api/v1/finance/foundation/cost-centers` | `audit:read` |
| POST | `/api/v1/finance/foundation/cost-centers` | `audit:read:critical` ⚠️ |
| GET | `/api/v1/finance/foundation/profit-centers` | `audit:read` |
| POST | `/api/v1/finance/foundation/profit-centers` | `audit:read:critical` ⚠️ |

#### General Ledger Module (8 endpoints) — mount `/api/v1/finance/gl`
| Method | Path | Permission (effective) |
|---|---|---|
| GET | `/api/v1/finance/gl` | `audit:read` ⚠️ |
| GET | `/api/v1/finance/gl/:id` | `audit:read` ⚠️ |
| GET | `/api/v1/finance/gl/count` | `audit:read` ⚠️ |
| GET | `/api/v1/finance/gl/exists/:code` | `audit:read` ⚠️ |
| POST | `/api/v1/finance/gl` | `audit:read` ⚠️ |
| PUT | `/api/v1/finance/gl/:id` | `audit:read` ⚠️ |
| DELETE | `/api/v1/finance/gl/:id` | `audit:read` ⚠️ |
| POST | `/api/v1/finance/gl/:id/transition` | `audit:read` ⚠️ (workflow BROKEN) |

### 11.3 Existing API Clients in Frontend (Unused)

| Client File | Exports | Lines | Imported into page.tsx? |
|---|---|---|---|
| `src/modules/product/api/client.ts` | `productApi` (9 methods) + types `Product`, `Category`, `Brand`, `UOM` | 46 | ❌ No |
| `src/modules/customer/api/client.ts` | `customerApi` (8 methods) + types `Customer`, `CustomerGroup` | 30 | ❌ No |
| `src/modules/supplier/api/client.ts` | `supplierApi` (8 methods) + types `Supplier`, `SupplierCategory` | 30 | ❌ No |
| `src/modules/warehouse/api/client.ts` | `warehouseApi` (11 methods) + type `WarehouseBin` | 50 | ❌ No |
| `src/modules/organization/api/client.ts` | `companyApi`, `plantApi`, `warehouseApi`, `departmentApi`, `costCenterApi`, `financialYearApi`, `hierarchyApi` + 7 type families | 358 | ❌ No (page.tsx uses inline fetch instead) |
| `src/modules/inventory/api/client.ts` | `inventoryApi` (8 methods) + type `Inventory` | 62 | ❌ No |

### 11.4 Existing Modular React Components (Unused)

| Component File | Lines | Wired to API? | Imported into page.tsx? |
|---|---|---|---|
| `src/modules/product/components/ProductModule.tsx` | 221 | ✅ Yes (productApi) | ❌ No |
| `src/modules/customer/components/CustomerModule.tsx` | 171 | ✅ Yes (customerApi) | ❌ No |
| `src/modules/supplier/components/SupplierModule.tsx` | 177 | ✅ Yes (supplierApi) | ❌ No |
| `src/modules/warehouse/components/WarehouseModule.tsx` | 37 | Placeholder | ❌ No |
| `src/modules/organization/components/OrganizationModule.tsx` | 749 | ✅ Yes | ❌ No (page.tsx reimplements inline) |

---

## 12. Database Mapping

### 12.1 Prisma Models (selected, ~100+ master data models)

| Domain | Models |
|---|---|
| Product | `Product`, `ProductCategory`, `ProductBrand`, `ProductUom`, `UomConversion`, `ProductBarcode`, `ProductVariant`, `ProductAttribute`, `ProductAttributeValue`, `ProductImage`, `ProductDocument`, `ProductPrice`, `ProductCost`, `ProductCompliance` |
| Business Partner | `BusinessPartner`, `BusinessPartnerRole`, `BusinessPartnerAddress`, `BusinessPartnerContact`, `BusinessPartnerBankAccount`, `BusinessPartnerCompliance`, `BusinessPartnerScorecard`, `BusinessPartnerRelationship`, `BusinessPartnerGroup`, `BusinessPartnerGroupMember` |
| Customer | `Customer`, `CustomerGroup`, `CustomerContact`, `CustomerAddress`, `CustomerCreditProfile` (raw SQL `customers` table also used) |
| Supplier | `Supplier`, `SupplierCategory`, `SupplierContact`, `SupplierAddress`, `SupplierCompliance`, `SupplierProductMapping`, `SupplierPerformance` (raw SQL `suppliers` table also used) |
| Organization | `Company`, `BusinessUnit`, `Division`, `Region`, `Plant`, `Warehouse`, `Department`, `CostCenter`, `FinancialYear`, `FinancialPeriod` |
| Warehouse | `WarehouseMaster`, `WarehouseZone`, `WarehouseAisle`, `WarehouseRack`, `WarehouseShelf`, `WarehouseBin`, `WarehouseTemperatureZone`, `WarehouseRule`, `WarehousePutawayTask`, `WarehouseBarcode`, `WarehouseScanLog` |
| Inventory | `StockBalance`, `StockLedger`, `InventoryTransaction`, `InventoryJournalEntry`, `InventoryBatch`, `InventoryReservation`, `InventoryBlock`, `InventoryExpiryAlert` |
| Pricing | `PriceList`, `PriceListItem`, `Discount`, `DiscountRule`, `Promotion`, `Coupon`, `TaxConfiguration`, `PriceResolution` |
| Identification | `BarcodeType`, `BarcodeAssignment`, `QrCode`, `Batch`, `Lot`, `SerialNumber`, `Gs1Identifier`, `LabelTemplate`, `LabelPrintJob`, `TraceabilityLog` |
| Governance | `MasterDataLifecycle`, `ApprovalWorkflow`, `ApprovalStep`, `ImportJob`, `ImportError`, `ExportJob`, `ValidationRule`, `ValidationResult`, `DuplicateCandidate`, `MergeHistory`, `MasterDataAudit`, `DataQualityMetric`, `ChangeHistory` |
| Finance | `ChartOfAccount`, `FiscalYear`, `FiscalPeriod`, `CostCenter` (finance-level), `ProfitCenter`, `Currency`, `ExchangeRate` |
| GST | `GstConfiguration` ⚠️ (referenced in code but NOT in schema), `GstRate`, `HsnCode`, `SacCode`, `GstReturn` |
| Reference | `ReferenceMaster`, `ReferenceMasterValue` (proposed — not yet in schema) |

### 12.2 Database Tables Actually Touched (raw SQL modules)

| Module | Raw SQL Tables |
|---|---|
| product | `products`, `product_categories`, `product_brands`, `product_uoms`, `product_barcodes` |
| customer | `customers`, `customer_contacts`, `customer_addresses`, `customer_groups` |
| supplier | `suppliers`, `supplier_contacts`, `supplier_addresses`, `supplier_compliances`, `supplier_product_mappings`, `supplier_categories` |
| organization | `companies`, `business_units`, `divisions`, `regions`, `plants`, `warehouses`, `departments`, `cost_centers`, `financial_years` |
| warehouse | `warehouse_zones`, `warehouse_aisles`, `warehouse_racks`, `warehouse_bins`, `warehouse_putaway_tasks`, `warehouse_barcodes`, `warehouse_scan_logs` |
| inventory | `inventory`, `inventory_transactions`, `inventory_ledger`, `inventory_reservations`, `inventory_blocks`, `inventory_batches`, `inventory_expiry_alerts` |
| recipe-bom | `recipes`, `boms`, `bom_lines`, `routings`, `routing_operations` |
| pricing-engine | `price_lists`, `price_list_items`, `promotions`, `coupons`, `tax_configurations` |
| financial-foundation | `chart_of_accounts`, `fiscal_years`, `fiscal_periods`, `cost_centers` (finance), `profit_centers`, `currencies`, `exchange_rates` |
| gst-taxation | (uses Prisma `GstConfigurations` — model NOT DEFINED in schema) ⚠️ |
| product-costing | (uses Prisma `ProductCosts` — model NOT DEFINED in schema) ⚠️ |
| general-ledger | (uses Prisma — model verification needed) |

### 12.3 Schema Mismatches (Critical)

1. **Customer/Supplier raw SQL vs Prisma `BusinessPartner`** — Prisma defines unified model, backend uses split tables. Migration needed.
2. **Two `cost_centers` concepts** — org module (with `cost_center_type: PRODUCTION/SERVICE/ADMIN/SALES`) vs financial-foundation (with `parent_cc_id, company_id, plant_id`). Schema conflict.
3. **`GstConfigurations` and `ProductCosts` Prisma models referenced but not defined** — runtime errors expected.
4. **Inventory raw SQL vs Prisma** — `inventory` vs `StockBalance`, `inventory_transactions` vs `InventoryTransaction`, etc. Schema mismatch.
5. **Warehouse raw SQL vs Prisma** — `warehouse_zones` vs `WarehouseZone`, etc. Schema mismatch.
6. **Three persistence patterns coexist** — raw SQL via `query()`, Prisma client via `(db as any).ModelName`, repository pattern abstracting both. Standardization needed.

---

## 13. RBAC Mapping

### 13.1 Permission Registry (Section 03 relevant)

| Symbol | Permission Literal | Used By |
|---|---|---|
| `ORG_READ` | `org:read` | organization, customer (proxy), pricing (proxy) |
| `ORG_CREATE` | `org:create` | organization, customer (proxy) |
| `ORG_UPDATE` | `org:update` | organization, customer (proxy) |
| `ORG_DELETE` | `org:delete` | organization, customer (proxy) |
| `PRODUCT_READ` | `product:read` | product, recipe-bom |
| `PRODUCT_CREATE` | `product:create` | product, recipe-bom |
| `PRODUCT_UPDATE` | `product:update` | product, recipe-bom |
| `PRODUCT_DELETE` | `product:delete` | product |
| `SUPPLIER_READ` | `supplier:read` | supplier |
| `SUPPLIER_CREATE` | `supplier:create` | supplier |
| `SUPPLIER_UPDATE` | `supplier:update` | supplier |
| `SUPPLIER_DELETE` | `supplier:delete` | supplier |
| `SUPPLIER_BLACKLIST` | `supplier:blacklist` | supplier |
| `CUSTOMER_READ` | `customer:read` | (defined but NOT USED by customer module — uses org:* instead) |
| `CUSTOMER_CREATE` | `customer:create` | (defined but NOT USED) |
| `CUSTOMER_UPDATE` | `customer:update` | (defined but NOT USED) |
| `CUSTOMER_DELETE` | `customer:delete` | (defined but NOT USED) |
| `INVENTORY_READ` | `inventory:read` | inventory, warehouse |
| `INVENTORY_POST` | `inventory:post` | inventory, warehouse |
| `INVENTORY_ADJUST` | `inventory:adjust` | inventory |
| `INVENTORY_REVERSE` | `inventory:reverse` | (defined, unused in Section 03) |
| `AUDIT_READ` | `audit:read` | gst-taxation, product-costing, general-ledger (proxy for read AND write) |
| `AUDIT_READ_CRITICAL` | `audit:read:critical` | financial-foundation (proxy for write) |
| `SYSTEM_REFERENCE_UPDATE` | `system:reference:update` | (defined, unused) |

### 13.2 RBAC Gaps (Critical Security Issues)

1. **Customer module uses `org:*` as proxy** instead of `customer:*` — fix at `customer/routes/index.ts` lines 49–54.
2. **Pricing-engine uses `customer:*` as proxy** for pricing operations — no dedicated pricing permissions exist.
3. **gst-taxation, product-costing, general-ledger use `audit:read` for BOTH read and write** — anyone with audit:read can mutate master data.
4. **financial-foundation uses `audit:read:critical` for write proxy** — still incorrect.
5. **Warehouse uses `inventory:*` for warehouse master ops** — too coarse; needs `warehouse:read|create|update|delete`.
6. **Recipe-BOM uses `product:*` instead of dedicated `recipe:*`, `bom:*`, `routing:*`** permissions.

### 13.3 Frontend Permission Usage (Section 03)

| Module | Permission Used | Lines | Purpose |
|---|---|---|---|
| OrganizationModule | `org:create` | 859, 887 | Gates "Add Entity" button + Create dialog |
| (all other 8 modules) | NONE | — | Zero `hasPermission` calls |

**Critical**: 40+ create/edit/delete buttons across Section 03 have NO permission gating. Any logged-in user can see and click them (though they currently do nothing because there's no onClick).

### 13.4 Recommended Permissions to Add (Backend)

| Permission | Module | Purpose |
|---|---|---|
| `pricing:read`, `pricing:create`, `pricing:update`, `pricing:delete`, `pricing:calculate` | pricing-engine | Replace customer:* proxy |
| `finance:gst:read`, `finance:gst:write` | gst-taxation | Replace audit:read proxy |
| `finance:costing:read`, `finance:costing:write` | product-costing | Replace audit:read proxy |
| `finance:gl:read`, `finance:gl:write` | general-ledger | Replace audit:read proxy |
| `finance:accounts:write`, `finance:fiscal:write`, `finance:currency:write`, `finance:cost-center:write`, `finance:profit-center:write`, `finance:exchange-rate:write` | financial-foundation | Replace audit:read:critical proxy |
| `warehouse:read`, `warehouse:create`, `warehouse:update`, `warehouse:delete` | warehouse | Replace inventory:* proxy |
| `recipe:read`, `recipe:create`, `recipe:update`, `recipe:delete` | recipe-bom | Recipe-specific |
| `bom:read`, `bom:create`, `bom:update`, `bom:delete` | recipe-bom | BOM-specific |
| `routing:read`, `routing:create`, `routing:update`, `routing:delete` | recipe-bom | Routing-specific |
| `master:category:read|create|update|delete` | product | Category CRUD |
| `master:brand:read|create|update|delete` | product | Brand CRUD |
| `master:uom:read|create|update|delete` | product | UOM CRUD |
| `master:hsn:read|create|update|delete` | gst-taxation | HSN CRUD |
| `master:cost-center:read|create|update|delete` | organization | Cost Center CRUD |
| `master:department:read|create|update|delete` | organization | Department CRUD |
| `master:currency:read|create|update|delete` | financial-foundation | Currency CRUD |
| `master:payment-terms:read|create|update|delete` | (new module) | Payment Terms CRUD |
| `master:shipping-terms:read|create|update|delete` | (new module) | Shipping Terms CRUD |
| `master:reference:read|create|update|delete` | (new module) | Reference Master CRUD |
| `governance:import|export|validate|merge|rollback` | (new module) | Data Governance ops |

---

## 14. Validation Rules

### 14.1 Backend Zod Schemas

| Module | Schema | Required Fields | Optional Fields |
|---|---|---|---|
| product | `productSchema` | `sku`, `name`, `baseUomId` | 30+ fields (see §3.3 of backend findings) |
| product | `categorySchema` | `code`, `name` | `description`, `productType`, `parentId` |
| product | `brandSchema` | `code`, `name` | `description`, `manufacturer` |
| product | `barcodeSchema` | `barcodeValue` | `barcodeType` (default EAN13), `isPrimary` |
| product | `transitionSchema` | `targetStatus`, `version` | — |
| customer | `customerSchema` | `customerCode`, `tradeName` | 22 fields |
| customer | `contactSchema` | `name` | `designation`, `email`, `phone`, `mobile`, `isPrimary` |
| customer | `addressSchema` | `addressLine1`, `city` | `addressType`, `state`, `country`, `postalCode`, `isPrimary` |
| supplier | `supplierSchema` | `vendorCode`, `legalName`, `tradeName` | 21 fields |
| supplier | `blacklistSchema` | `reason` (1–500 chars) | — |
| supplier | `complianceSchema` | `complianceType` | 6 fields |
| supplier | `productMappingSchema` | `productId` | 5 fields |
| organization | `companySchema` | `code`, `name` | 16 fields |
| organization | `plantSchema` | `regionId`, `code`, `name` | 11 fields |
| organization | `warehouseSchema` | `plantId`, `code`, `name` | 10 fields |
| organization | `departmentSchema` | `code`, `name` | 5 fields |
| organization | `costCenterSchema` | `code`, `name` | 4 fields |
| organization | `financialYearSchema` | `code`, `name`, `startDate`, `endDate` | `isCurrent` |
| warehouse | (zod schema for bin create — 10 fields per `WarehouseBin` type) | — | — |
| pricing | (priceListSchema, promotionSchema, couponSchema — 12+ fields each) | — | — |
| gst-taxation | (NO zod validator — accepts arbitrary JSON) ⚠️ | — | — |
| product-costing | (NO zod validator — accepts arbitrary JSON) ⚠️ | — | — |
| general-ledger | (NO zod validator — accepts arbitrary JSON) ⚠️ | — | — |

### 14.2 Frontend Validation (Current State)

**NONE.** All 4 forms in Section 03 (Create Company, Price Resolution, Traceability, Create Plant) submit without client-side validation. The Create Company form relies entirely on backend validation. The Price Resolution and Traceability forms have no validation at all.

### 14.3 Validation Gaps

1. **No client-side validation** on any form (no required field check, no regex check, no range check).
2. **GSTIN regex** `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$` enforced backend-side only — should be frontend too.
3. **PAN regex** `^[A-Z]{5}[0-9]{4}[A-Z]{1}$` enforced backend-side only.
4. **PIN code regex** (6 digits) — not enforced anywhere.
5. **Email format** — not enforced client-side.
6. **Phone format** (10 digits) — not enforced client-side.
7. **Date ranges** (start < end for financial years, promotions, price lists) — backend only.
8. **Numeric ranges** (credit limit ≥ 0, MRP ≥ 0, etc.) — backend only.
9. **3 backend modules have no zod validator** at all (gst-taxation, product-costing, general-ledger) — accept arbitrary JSON.

---

## 15. Current Problems

### 15.1 Critical Problems (Production Blockers)

1. **8 of 9 master modules use 100% hardcoded mock data** — refreshing the page shows the same data forever; creating a "New Product" does nothing.
2. **40+ dead buttons** — every "New X" / "Create X" / "Generate X" button across Section 03 has no onClick handler.
3. **Zero permission gating** on 8 of 9 modules — any logged-in user can see all master data and click all buttons (though they do nothing).
4. **2 mini-service endpoints** (Commercial resolve-price, Identification trace) bypass `/api/v1/...` REST API and have no auth token.
5. **Backend API clients exist but unused** — 6 client files with ~50 methods ready, zero imported.
6. **Modular React components exist but unused** — 5 component files, fully wired to API, zero imported.
7. **3 backend modules have broken workflows** (gst-taxation, product-costing, general-ledger) — transition endpoints will throw `WORKFLOW.NOT_REGISTERED`.
8. **2 backend modules reference missing Prisma models** (`GstConfigurations`, `ProductCosts`) — runtime errors expected.
9. **5 backend modules have RBAC gaps** — using audit:read or org:* as proxies for write operations.
10. **Stats hardcoded** — most stat cards show numbers that don't match mock data (e.g., ProductMaster shows Total=12 but `products` array has 6).
11. **No pagination** anywhere — all tables render full mock array.
12. **No loading/error states** in 8 of 9 modules — synchronous render from inline consts.
13. **No edit/delete/transition UI** anywhere — only OrganizationModule has Create; no module has Edit, Delete, or status transition.

### 15.2 High-Priority Problems

1. **Customer/Supplier unified as Business Partner** — backend has separate endpoints; UI consolidates. Adapter or new unified endpoint needed.
2. **No drawers/sheets** for detail views — only inline modals (OrganizationModule pattern).
3. **No search/filter** on most tables (only ProductMaster and OrganizationModule have search).
4. **No bulk actions** (bulk delete, bulk archive, bulk approve).
5. **No export** to CSV/Excel/PDF.
6. **No import** with preview/rollback.
7. **No audit log UI** for master data changes (GovernanceModule.audit tab is mock).
8. **No duplicate detection UI** (GovernanceModule.duplicates tab is mock).
9. **No lifecycle transition UI** for any entity.
10. **No compliance expiry alerts** UI.

### 15.3 Medium-Priority Problems

1. **Two backend service layers confused** — mini-services vs main API.
2. **Inconsistent optimistic concurrency** — `If-Match` header in some modules, `version` in body in others, none in pricing/financial-foundation.
3. **Inconsistent pagination response shape** — `paginated()` helper vs direct `{ rows, total, page, pageSize }`.
4. **Schema mismatches** between raw SQL and Prisma models.
5. **No responsive tables** — tables overflow on mobile.
6. **No keyboard navigation**.
7. **No empty states** — when array is empty, table shows blank.
8. **No column sorting**.
9. **No column visibility toggle**.
10. **No saved views / filters**.

---

## 16. Missing Features

### 16.1 Missing UI Modules (No UI at All)

| Module | Backend API | Status |
|---|---|---|
| Product Categories | ✅ `/api/v1/catalog/categories` | API ready, UI missing |
| Brand Master | ✅ `/api/v1/catalog/brands` | API ready, UI missing |
| UOM Master | ✅ `/api/v1/catalog/uoms` (read-only) | API ready (no create), UI missing |
| HSN / SAC | ❌ No endpoints | API missing, UI missing |
| Cost Center | ✅ `/api/v1/organization/cost-centers` + `/api/v1/finance/foundation/cost-centers` | API ready (two sources conflict), UI missing |
| Department | ✅ `/api/v1/organization/departments` | API ready, UI missing |
| Currency | ✅ `/api/v1/finance/foundation/currencies` | API ready, UI missing |
| Payment Terms | ❌ No endpoints (referenced as enum in customer/supplier) | API missing, UI missing |
| Shipping Terms / Incoterms | ❌ No endpoints | API missing, UI missing |
| Reference Masters | ❌ No endpoints | API missing, UI missing |

### 16.2 Missing UI Features (in existing modules)

| Feature | Module | Priority |
|---|---|---|
| Product create/edit dialog (28 fields) | ProductMaster | High |
| Product detail drawer with barcodes | ProductMaster | High |
| Product lifecycle transition UI | ProductMaster | High |
| Product search/filter/pagination | ProductMaster | High |
| Category tree view | Product Categories (new) | High |
| Brand master CRUD | Brand Master (new) | High |
| UOM master + conversions | UOM Master (new) | High |
| HSN/SAC master CRUD | HSN/SAC (new) | High |
| Tax group CRUD | CommercialEngine → Tax tab | High |
| Price list CRUD + items | CommercialEngine → Price Lists tab | High |
| Discount CRUD | CommercialEngine → Discounts tab | High |
| Promotion CRUD | CommercialEngine → Promotions tab | High |
| Customer create/edit (24 fields) | BusinessPartner → Partners tab | High |
| Customer detail drawer (contacts, addresses, credit, compliance) | BusinessPartner | High |
| Customer lifecycle transition UI | BusinessPartner | High |
| Supplier create/edit (24 fields) | BusinessPartner → Partners tab | High |
| Supplier detail drawer (contacts, addresses, compliances, product mappings) | BusinessPartner | High |
| Supplier lifecycle transition UI | BusinessPartner | High |
| Supplier blacklist flow | BusinessPartner | High |
| Plant create/edit (14 fields) + actual submit | PlantMaster | High |
| Plant lifecycle transition UI | PlantMaster | High |
| Warehouse create (12 fields) | WarehouseModule | High |
| Warehouse Zone CRUD | WarehouseModule | High |
| Warehouse Aisle CRUD | WarehouseLocationModule | High |
| Warehouse Rack CRUD | WarehouseLocationModule | High |
| Warehouse Bin CRUD (10 fields) | WarehouseLocationModule | High |
| Warehouse Temperature Zone CRUD | WarehouseModule | High |
| Warehouse Rule CRUD | WarehouseModule | High |
| Cost Center CRUD | (new module) | Medium |
| Department CRUD | (new module) | Medium |
| Currency CRUD + Exchange Rates | (new module) | Medium |
| Financial Year CRUD | (new module or Organization extension) | Medium |
| Barcode generation | IdentificationModule → Barcodes tab | Medium |
| QR code generation | IdentificationModule → QR Codes tab | Medium |
| Batch CRUD | IdentificationModule → Batches tab | Medium |
| Lot CRUD | IdentificationModule → Lots tab | Medium |
| Serial assignment | IdentificationModule → Serials tab | Medium |
| GS1 ID CRUD | IdentificationModule → GS1 tab | Medium |
| Label template CRUD | IdentificationModule → Labels tab | Medium |
| Print job CRUD | IdentificationModule → Print tab | Medium |
| Lifecycle transition UI | GovernanceModule → Lifecycle tab | Medium |
| Approval workflow CRUD | GovernanceModule → Approvals tab | Medium |
| Import job with preview/rollback | GovernanceModule → Import tab | Medium |
| Export job | GovernanceModule → Export tab | Medium |
| Validation rule CRUD | GovernanceModule → Validation tab | Medium |
| Duplicate scan + merge | GovernanceModule → Duplicates tab | Medium |
| Audit log viewer | GovernanceModule → Audit tab | Medium |
| Data quality dashboard | GovernanceModule → Quality tab | Medium |
| Change history with rollback | GovernanceModule → History tab | Medium |
| Permission gating on all buttons | All modules | High |
| Loading skeletons | All modules | High |
| Error states with retry | All modules | High |
| Empty states | All modules | Medium |
| Pagination | All modules | High |
| Column sorting | All modules | Low |
| Column visibility toggle | All modules | Low |
| Bulk actions | All modules | Medium |
| Export to CSV/Excel | All modules | Medium |
| Search/filter | All modules | High |
| Responsive tables | All modules | Low |

### 16.3 Missing Backend Endpoints (~80 endpoints)

| Domain | Missing Endpoints |
|---|---|
| Product | UOM conversions CRUD, product variants CRUD, product images CRUD, product documents CRUD, product attributes CRUD, HSN/SAC master CRUD |
| Business Partner | Unified `/api/v1/business-partners` endpoint, bank account CRUD, scorecard CRUD, relationship CRUD |
| Organization | BU CRUD, Division CRUD, Region CRUD, plant update/delete, warehouse update/delete, department update/delete, cost center update/delete, financial year update/delete/close |
| Warehouse | Warehouse master CRUD (under `/api/v1/warehouse` not `/api/v1/organization`), temperature zone CRUD, rule CRUD, shelf CRUD |
| Inventory | Adjustments, transfers, physical counts, cycle counts, ABC analysis |
| Pricing | Price list item CRUD, discount rule CRUD, tax rate CRUD, tax group CRUD |
| GST | HSN code CRUD, SAC code CRUD, GST rate CRUD (currently broken — Prisma model missing) |
| Recipe-BOM | BOM line update/delete, routing operation update/delete, formula CRUD, yield rule CRUD |
| Financial Foundation | Account update/delete, fiscal year update/delete, fiscal period open/reopen, cost center update/delete, profit center update/delete, currency update/delete, exchange rate update/delete |
| Identification | Barcode type CRUD, barcode assignment CRUD, QR code CRUD, GS1 identifier CRUD, label template CRUD, label print job CRUD, traceability log query |
| Governance | Import job CRUD, export job CRUD, validation rule CRUD, duplicate candidate review, merge history, master data audit query, data quality metrics |
| Reference | Payment terms CRUD, shipping terms CRUD, Incoterms CRUD, reference master CRUD |

---

## 17. Critical Issues

### 17.1 Top 10 Critical Issues (Must Fix Before Production)

1. **8 of 9 modules are non-functional** (mock only) — users cannot create, edit, or view real master data.
2. **40+ dead buttons** — clicking does nothing; users will lose trust immediately.
3. **3 backend modules have broken workflows** — transition endpoints throw errors.
4. **2 backend modules reference missing Prisma models** — create endpoints will fail at runtime.
5. **5 backend modules have RBAC gaps** — security vulnerability; any user with audit:read can mutate master data.
6. **Customer module uses wrong permissions** — `org:*` instead of `customer:*` (1-line fix per route).
7. **2 mini-service endpoints bypass auth** — Commercial and Identification hit `/api/...` without Bearer token.
8. **Schema mismatches** between raw SQL and Prisma — migration path needed.
9. **No edit/delete/transition UI** anywhere — only Create in OrganizationModule.
10. **No loading/error/empty states** in 8 of 9 modules — silent failures.

### 17.2 Top 10 High-Priority Issues

1. **Backend API clients unused** — 6 ready-to-use clients, zero imported.
2. **Modular React components unused** — 5 fully-wired components, zero imported.
3. **Stats hardcoded** — misleading even in demo mode.
4. **No pagination** — tables will break with real data volumes.
5. **No search/filter** on most tables.
6. **No permission gating** on 8 of 9 modules.
7. **No audit log UI** for master data changes.
8. **No duplicate detection UI**.
9. **No compliance expiry alerts**.
10. **No import/export** functionality.

---

## 18. Production Readiness Scorecard

| Module | Current Score | Target Score | Gap |
|---|---|---|---|
| OrganizationModule | 7.5/10 | 9.5/10 | Add edit/delete/transition, fix token source, add other entity creates |
| ProductMasterModule | 2.0/10 | 9.5/10 | Full rewrite — wire to productApi, add create/edit/detail/transition/search/pagination |
| PIMModule | 2.0/10 | 8.5/10 | Wire to productApi (categories, families), add approval flow |
| CommercialEngineModule | 3.0/10 | 9.0/10 | Wire 9 tabs to pricingApi, fix mini-service endpoint, add CRUD for all entities |
| BusinessPartnerModule | 2.5/10 | 9.5/10 | Wire to customerApi + supplierApi (adapter needed), add all CRUD + lifecycle + blacklist |
| IdentificationModule | 3.0/10 | 8.5/10 | Wire 9 tabs to identification endpoints (mostly missing — backend gaps), fix mini-service |
| GovernanceModule | 2.0/10 | 9.0/10 | Wire 10 tabs to governance endpoints (all missing — backend gaps) |
| WarehouseModule | 2.0/10 | 9.0/10 | Wire to warehouseApi (org) + warehouseApi (WMS), add CRUD for all entities |
| WarehouseLocationModule | 2.0/10 | 9.0/10 | Wire to warehouseApi (bins/aisles/racks), add CRUD |
| PlantMasterModule | 2.5/10 | 9.0/10 | Wire to plantApi, add actual submit handler, add edit/delete/transition |
| **Section 03 overall** | **3.2/10** | **9.2/10** | **~6 points gap** |

---

## 19. Implementation Plan (High-Level)

> Detailed in SECTION_03_IMPLEMENTATION_REPORT.md after approval.

### Phase 1: Code Extraction (15–20 hours)
- Create `src/sections/03-master-data/` with subdirectories (components, forms, tables, dialogs, drawers, hooks, api, types, utils, constants, index.ts)
- Copy (NOT rewrite) each of the 10 components from page.tsx into the new structure
- Update page.tsx to import from the new location
- Verify pixel-perfect identical UI (zero visual change)

### Phase 2: Wire Up Existing Backend (80–100 hours)
- Import existing API clients (`productApi`, `customerApi`, `supplierApi`, `warehouseApi`, `companyApi`, `plantApi`, `departmentApi`, `costCenterApi`, `financialYearApi`, `hierarchyApi`, `inventoryApi`)
- Replace all 45 mock data arrays with live API calls
- Add loading skeletons, error states, empty states (copy OrganizationModule pattern)
- Add pagination to all 17 tables
- Add search/filter to all tables
- Wire all 40+ dead buttons to create/edit dialogs
- Add edit/delete/transition flows (row-click detail drawer + action menu)
- Add permission gating on all create/edit/delete buttons
- Compute stats from live data
- Reconcile mini-service endpoints with main `/api/v1/...` REST API

### Phase 3: Backend Gap Remediation (40–60 hours)
- Fix customer module RBAC (1-line per route)
- Fix gst-taxation workflow registration
- Fix product-costing workflow registration + add missing Prisma models
- Fix general-ledger workflow registration
- Add missing permissions to registry (pricing:*, finance:gst:*, warehouse:*, etc.)
- Build missing endpoints (~80): HSN/SAC, UOM conversions, product variants, BU/Division/Region CRUD, warehouse temperature zones, payment terms, shipping terms, reference masters, identification CRUD, governance CRUD

### Phase 4: Polish & Enterprise Features (30–40 hours)
- Add audit log viewer for master data changes
- Add duplicate detection UI
- Add compliance expiry alerts
- Add import/export with preview/rollback
- Add bulk actions
- Add column sorting/visibility
- Add saved views/filters
- Add responsive tables
- Add keyboard navigation
- Performance optimization (memoization, virtualization for large tables)

**Total estimated effort**: 165–220 hours.

---

## 20. Estimated Work Breakdown

| Work Item | Hours | Phase |
|---|---|---|
| Code extraction (10 components → src/sections/03-master-data/) | 18 | 1 |
| Pixel-perfect verification | 4 | 1 |
| Product Master wire-up (CRUD + lifecycle + barcodes + search + pagination) | 12 | 2 |
| PIM Platform wire-up (families, compliance, approvals) | 8 | 2 |
| Commercial Engine wire-up (10 tabs to pricingApi) | 16 | 2 |
| Business Partner wire-up (10 tabs, adapter for customer+supplier) | 20 | 2 |
| Identification wire-up (9 tabs + fix mini-service) | 14 | 2 |
| Governance wire-up (10 tabs — backend gaps block most) | 8 | 2 |
| Warehouse Master wire-up (5 tabs to warehouseApi org + WMS) | 10 | 2 |
| Warehouse Locations wire-up (5 tabs to warehouseApi WMS) | 8 | 2 |
| Plant Master wire-up (CRUD + lifecycle + actual submit) | 6 | 2 |
| Organization Module enhancements (edit/delete/transition, other entity creates) | 8 | 2 |
| Loading/error/empty states across all modules | 6 | 2 |
| Permission gating on all buttons | 4 | 2 |
| Stats computation from live data | 3 | 2 |
| Reconcile mini-service endpoints | 4 | 2 |
| Backend: Fix customer RBAC | 1 | 3 |
| Backend: Fix gst-taxation workflow | 4 | 3 |
| Backend: Fix product-costing workflow + Prisma model | 8 | 3 |
| Backend: Fix general-ledger workflow | 4 | 3 |
| Backend: Add missing permissions to registry | 4 | 3 |
| Backend: Build HSN/SAC CRUD | 6 | 3 |
| Backend: Build UOM conversions CRUD | 4 | 3 |
| Backend: Build BU/Division/Region CRUD | 8 | 3 |
| Backend: Build warehouse temperature zones CRUD | 6 | 3 |
| Backend: Build payment terms / shipping terms / incoterms masters | 8 | 3 |
| Backend: Build reference masters | 6 | 3 |
| Backend: Build identification CRUD (barcodes, QR, batches, lots, serials, GS1, labels, print) | 16 | 3 |
| Backend: Build governance CRUD (import, export, validation, duplicates, audit, quality, history) | 16 | 3 |
| Polish: Audit log viewer | 4 | 4 |
| Polish: Duplicate detection UI | 4 | 4 |
| Polish: Compliance expiry alerts | 3 | 4 |
| Polish: Import/export with preview/rollback | 6 | 4 |
| Polish: Bulk actions | 4 | 4 |
| Polish: Column sorting/visibility | 3 | 4 |
| Polish: Responsive tables | 4 | 4 |
| Polish: Keyboard navigation | 2 | 4 |
| Polish: Performance optimization | 4 | 4 |
| Testing (unit + integration + e2e) | 12 | 4 |
| **TOTAL** | **~245** | — |

> Range: 180–220 hours if some backend gaps are deferred; up to 260 hours if all backend gaps are addressed in this section.

---

## 21. Approval Gates

**This document is STEP 4 — the SUMMARY. Implementation will NOT start until explicit user approval.**

After approval, the implementation will follow this order:
1. **Phase 1** (Extraction) → verify pixel-perfect UI → request Phase 2 approval
2. **Phase 2** (Wire-up) → verify all existing endpoints working → request Phase 3 approval
3. **Phase 3** (Backend gaps) → verify all new endpoints working → request Phase 4 approval
4. **Phase 4** (Polish) → final production readiness check → STOP, wait for Section 04 approval

**STOP. WAIT FOR APPROVAL.**

---

## 22. References

- Frontend exploration findings: `/home/z/my-project/docs/frontend/SECTION-03/_exploration_findings.md` (937 lines)
- Backend exploration findings: `/home/z/my-project/docs/frontend/SECTION-03/_backend_findings.md` (2,232 lines)
- Section 01 implementation: `docs/frontend/` (Organization + Dashboard + Login)
- Section 02 implementation: `docs/frontend/SECTION-02/SECTION_02_SUMMARY.md` + `SECTION_02_IMPLEMENTATION_REPORT.md`
- Source file: `/home/z/my-project/src/app/page.tsx` (38,131 lines)
- Backend root: `/home/z/my-project/apps/backend/src/modules/`
- Prisma schema: `/home/z/my-project/prisma/schema.prisma` (18,068 lines, ~400+ models)
- Route mounting: `/home/z/my-project/apps/backend/src/app/app.ts` (lines 177–236)
- Permission registry: `/home/z/my-project/apps/backend/src/core/permissions/registry.ts`

---

**END OF SECTION 03 SUMMARY — AWAITING APPROVAL**

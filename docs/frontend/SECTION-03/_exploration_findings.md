# Section 03 — Master Data Management Frontend Exploration Findings

**Task ID**: SECTION03-FE-EXPLORE
**Date**: 2026-07-12
**Source file**: `/home/z/my-project/src/app/page.tsx` (38,131 lines)
**Explorer agent**: Section 03 Frontend Explore

---

## 1. Executive Summary

Section 03 — Master Data Management in the SUOP frontend is implemented as **6 large "super modules"** under the sidebar group `"Master Data (Sprint 6-11) — PART 2 COMPLETE"`, plus **3 related modules** in other sidebar sections that hold master entities (Organization tree, Warehouse + Locations, Plant Master). The 6 super modules consolidate **19 conceptual master sub-domains** (Product, Categories, Brand, UOM, HSN/SAC, Tax, Customer, Supplier, Company, Plant, Warehouse, Storage Location, Cost Center, Department, Currency, Payment Terms, Shipping Terms, Price Lists, Reference Masters) into a tab-based UI.

**Critical finding**: Only **1 of 9** master-related modules is wired to a real backend API (OrganizationModule). The other 8 use **hardcoded inline mock data arrays**. Backend API clients exist for product, customer, supplier, warehouse, organization, inventory (in `/src/modules/*/api/client.ts`) but **NONE are imported into page.tsx**. The modular React components in `/src/modules/*/components/*.tsx` (ProductModule.tsx, CustomerModule.tsx, SupplierModule.tsx, WarehouseModule.tsx, OrganizationModule.tsx) are also **NOT imported into page.tsx** — they exist as dead/orphan code.

**Overall Section 03 Production Readiness Score**: **3.2 / 10**
- Organization Module: 7.5/10 (only one with real API + create flow)
- Product Master: 2/10 (mock only, no create, no detail)
- PIM: 2/10 (mock only)
- Commercial Engine (incl. Price Lists, Tax, Discounts, Promotions): 3/10 (mock + 1 mini-service endpoint)
- Business Partner (incl. Customer, Supplier, Groups, Banking, Compliance, Scorecards): 2.5/10 (mock only)
- Identification (incl. Barcodes, QR, Batches, Lots, Serials, GS1, Labels, Print, Traceability): 3/10 (mock + 1 mini-service endpoint)
- Data Governance: 2/10 (mock only)
- Warehouse: 2/10 (mock only, large `WHM_*` const arrays)
- Warehouse Locations & Bins: 2/10 (mock only, large `WH_LOC_*` const arrays)
- Plant Master: 2.5/10 (mock + create form state but no API call)

**Section 03 total line range in page.tsx**:
- Primary block: **lines 1833 – 4378** (2,546 lines, the 6 master super modules)
- Related master modules elsewhere:
  - Warehouse Master + Locations: **lines 8410 – 9392** (983 lines, Sprint 22/23 Part 4 WMS)
  - Plant Master: **lines 16342 – 16439** (98 lines, Part 5 Manufacturing)
  - Organization Module (Company + Plant + Warehouse + Department + Cost Center unified hierarchy): **lines 666 – 919** (254 lines, Section 01)

---

## 2. Sidebar Navigation — Master Data Items

`SIDEBAR_SECTIONS` is defined starting at **line 151**.

### Master Data sidebar group (lines 159-167)
```ts
section: 'Master Data (Sprint 6-11) — PART 2 COMPLETE'
items: [
  { name: 'Product Master',           module: 'products',        icon: Package },
  { name: 'PIM Platform',             module: 'pim',             icon: Layers },
  { name: 'Commercial Engine',        module: 'commercial',      icon: IndianRupee },
  { name: 'Business Partners',        module: 'partners',        icon: Users2 },
  { name: 'Identification & Traceability', module: 'identification', icon: ScanLine },
  { name: 'Data Governance',          module: 'governance',      icon: ShieldCheck },
]
```

### Platform sidebar group (lines 170-176) — also masters
- `organization` → `OrganizationModule` (Company + Plant + Warehouse tree)
- `rbac` → `RBACModule` (Section 02)
- `settings` → `SettingsModule`

### Operations sidebar group (lines 178-222) — masters for warehouse/storage
- `warehouse` → `WarehouseModule` (Warehouse Master + Zones + Temp Zones + Rules)
- `whlocations` → `WarehouseLocationModule` (Storage Bins + Aisles + Racks)

### Manufacturing sidebar group (lines 250-294) — Plant Master
- `plantmaster` → `PlantMasterModule`

### Module dispatch (lines 36528-36762)
```tsx
{activeModule === 'organization'    && <OrganizationModule />}    // line 36528
{activeModule === 'products'        && <ProductMasterModule />}   // line 36530
{activeModule === 'pim'             && <PIMModule />}             // line 36531
{activeModule === 'commercial'      && <CommercialEngineModule />}// line 36532
{activeModule === 'partners'        && <BusinessPartnerModule />}// line 36533
{activeModule === 'identification'  && <IdentificationModule />}  // line 36534
{activeModule === 'governance'      && <GovernanceModule />}      // line 36535
{activeModule === 'warehouse'       && <WarehouseModule />}       // line 36546
{activeModule === 'whlocations'     && <WarehouseLocationModule />}// line 36547
{activeModule === 'plantmaster'     && <PlantMasterModule />}     // line 36592
```

---

## 3. Module-by-Module Breakdown

### 3.1 Product Master — `ProductMasterModule()`

| Attribute | Value |
|---|---|
| Line range | **1833 – 1903** |
| Sidebar item | "Product Master" → module `products` |
| State hooks | `useState` × 1 (`search`) |
| useEffect | 0 |
| API calls | **0** (pure mock) |
| Permission checks | **0** (no `hasPermission` calls) |
| Backend wiring | ❌ NONE |
| Production readiness | **2/10** |

**Mock data arrays** (hardcoded inline):
- `products` (line 1834) — 6 items: Kaju Katli 250g/500g, Badam Pista Roll, Chocolate Wafer, Raw Sugar 50kg, Gift Box 250g. Fields: `upi, code, sku, name, type, status, brand, mrp, stock`.

**Functions**: 0 named functions inside (just one filter expression `filtered`).

**Form fields / validation**: NONE — no create/edit form. The "New Product" button (line 1875) has no `onClick`.

**Table columns** (line 1881): UPI, Product, SKU, Brand, MRP, Stock, Status.

**UI elements**:
- 4 stat cards (Total Products=12, Active=10, Product Types=11, With UPI=12) — hardcoded values, not from `products.length`
- Search input (`search` state)
- Import button (no handler), Export button (no handler), New Product button (no handler)
- 1 read-only table

**Critical issues**:
- 100% mock data, no API
- No create/edit/detail flow — completely non-functional
- Stats hardcoded (12, 10, 11, 12) — not derived from data
- The richer `src/modules/product/components/ProductModule.tsx` (221 lines) with real API calls exists but is **not imported** into page.tsx

---

### 3.2 PIM Platform — `PIMModule()`

| Attribute | Value |
|---|---|
| Line range | **1906 – 1986** |
| Sidebar item | "PIM Platform" → module `pim` |
| State hooks | 0 |
| API calls | **0** |
| Backend wiring | ❌ NONE |
| Production readiness | **2/10** |

**Mock data arrays**:
- `families` (line 1907) — 4 product families (Indian Sweets, Namkeen, Bakery, Beverages)
- `compliance` (line 1913) — 3 compliance records (FSSAI/HACCP for Kaju Katli + Chocolate Wafer)
- `approvals` (line 1918) — 3 approval queue items

**Functions**: 0.

**UI elements**:
- 4 stat cards (Families=6, Collections=5, Pending Approvals=2, Compliance Records=6) — hardcoded
- Product Families card grid (4 items)
- Compliance list (3 items)
- Approval Queue list (3 items)
- Product Usage Matrix table (3 hardcoded rows: Kaju Katli 250g, Sugar 50kg, Gift Box)

**Critical issues**: 100% mock, no API, no create flows.

---

### 3.3 Commercial Engine — `CommercialEngineModule()` + 10 sub-tabs

| Attribute | Value |
|---|---|
| Line range | **1991 – 2611** (sub-tabs span 2048-2611) |
| Sidebar item | "Commercial Engine" → module `commercial` |
| Tab type | `CommercialTab = 'overview' \| 'priceLists' \| 'tax' \| 'discounts' \| 'promotions' \| 'futurePrices' \| 'approvals' \| 'cost' \| 'rules' \| 'resolution'` (line 1989) |
| State hooks | 1 in shell + 5 in `ResolutionTab` |
| API calls | **1 real** (POST `http://localhost:3030/api/commercial/resolve-price` from `ResolutionTab.resolve()` at line 2463) |
| Backend wiring | ⚠️ PARTIAL — 1 mini-service endpoint (NOT `/api/v1/...`) |
| Production readiness | **3/10** |

**Tab components**:

| Tab | Function | Lines | Mock array | Items |
|---|---|---|---|---|
| overview | `CommercialOverviewTab` | 2048-2096 | `stats` | 8 stat cards |
| priceLists | `PriceListsTab` | 2098-2147 | `lists` | 6 price lists |
| tax | `TaxTab` | 2149-2193 | `groups` | 6 GST groups |
| discounts | `DiscountsTab` | 2195-2238 | `discounts` | 5 discounts |
| promotions | `PromotionsTab` | 2240-2280 | `promos` | 5 promotions |
| futurePrices | `FuturePricesTab` | 2282-2319 | `prices` | 4 future prices |
| approvals | `ApprovalsTab` | 2321-2367 | `approvals` | 5 approval workflows |
| cost | `CostMarginTab` | 2369-2411 | `profiles` | 4 cost profiles |
| rules | `RulesTab` | 2413-2450 | `rules` | 5 commercial rules |
| resolution | `ResolutionTab` | 2452-2611 | (live API + fallback `mockChain`) | live |

**Price Lists mock data fields** (`lists` line 2099):
- code, name, type (RETAIL/WHOLESALE/RESTAURANT/CORPORATE/FESTIVAL/EXPORT), currency (INR/USD), validFrom, priority, status, taxMode (INCLUSIVE/EXCLUSIVE), items (count)

**Tax mock data fields** (`groups` line 2150):
- code (GST-0, GST-5, GST-12, GST-18, GST-28, CESS-5), name, type (EXEMPT/GST/CESS), rates [{c, r}], status
- Hardcoded GST slabs: 0/5/12/18/28% + 5% Cess

**Discounts mock** (`discounts` line 2196): 5 types — PERCENTAGE, FLAT, VOLUME, CUSTOMER (+ COUPON supported but not shown). Fields: code, name, type, value, kind, max, stackable, status.

**Promotions mock** (`promos` line 2241): 5 promos. Fields: code, name, type (AUTOMATIC/COUPON), offer (PERCENT_OFF/FLAT_OFF/BUY_X_GET_Y), value, channels, validFrom, validTo, used, max, priority, status.

**Approvals mock** (`approvals` line 2322): 5 workflows with stages DRAFT → PRICING_TEAM → FINANCE → MANAGEMENT → APPROVED → PUBLISHED. SLA tracking.

**Cost & Margin mock** (`profiles` line 2370): 4 products × 4 costing methods (FIFO/WEIGHTED_AVERAGE/STANDARD/LAST_PURCHASE). Tracks purchase/average/fifo/weighted/standard/last/total/selling/margin%.

**Rules mock** (`rules` line 2414): 5 rules. Enforcement types: HARD_BLOCK, OVERRIDE_WITH_REASON, WARN.

**Resolution Tab** (lines 2452-2611):
- State: `productId`, `quantity`, `channel` (RETAIL_POS/RESTAURANT_POS/ERP/ECOMMERCE/CUSTOMER_PORTAL), `customerId`, `result`, `loading`
- `resolve()` function (line 2460) POSTs to `http://localhost:3030/api/commercial/resolve-price` (NOT `/api/v1/...` — this is the mini-service endpoint)
- Try/catch falls back to a fully simulated response object with `resolutionTrace` audit trail (lines 2476-2500). The fallback note explicitly says: `'Backend offline — showing simulated resolution. Start backend: cd mini-services/suop-backend && bun run index.ts'`

**Critical issues**:
- 9 of 10 tabs are 100% mock
- The 1 real API call hits `/api/commercial/resolve-price` (mini-service, NOT the main `/api/v1/...` REST API)
- Hardcoded fallback logic that fabricates a plausible response with mock discount/promo codes (DISC-5PCT, PROMO-WEEKEND)
- The buttons "New Price List", "New Tax Group", "New Discount", "New Promotion", "Schedule Price Change", "New Rule" have **no onClick handlers** — purely decorative

---

### 3.4 Business Partner Platform — `BusinessPartnerModule()` + 10 sub-tabs

| Attribute | Value |
|---|---|
| Line range | **2616 – 3154** |
| Sidebar item | "Business Partners" → module `partners` |
| Tab type | `BPTab = 'overview' \| 'partners' \| 'addresses' \| 'contacts' \| 'financial' \| 'compliance' \| 'groups' \| 'banking' \| 'relationships' \| 'scorecards'` (line 2614) |
| State hooks | 1 in shell |
| API calls | **0** |
| Backend wiring | ❌ NONE |
| Production readiness | **2.5/10** |

**IMPORTANT**: This module consolidates Customer Master + Supplier Master + Transporter + Franchisee + Corporate + Delivery Partner + Service Provider into a single unified "Business Partner" entity (the SAP-style approach explicitly described at lines 2722-2744). There is **NO separate Customer Master or Supplier Master** in page.tsx.

**Tab components**:

| Tab | Function | Lines | Mock array | Items |
|---|---|---|---|---|
| overview | `BPOverviewTab` | 2673-2747 | `stats`, `roleBreakdown` | 8 stats + 10 roles |
| partners | `BPPartnersTab` | 2749-2810 | `partners` | 10 partners |
| addresses | `BPAddressesTab` | 2812-2847 | `addresses` | 8 addresses |
| contacts | `BPContactsTab` | 2849-2889 | `contacts` | 7 contacts |
| financial | `BPFinancialTab` | 2891-2935 | `profiles` | 10 financial profiles |
| compliance | `BPComplianceTab` | 2937-2981 | `compliance` | 9 compliance records |
| groups | `BPGroupsTab` | 2983-3024 | `groups` | 10 groups |
| banking | `BPBankingTab` | 3026-3068 | `accounts` | 8 bank accounts |
| relationships | `BPRelationshipsTab` | 3070-3106 | `relationships` | 5 relationships |
| scorecards | `BPScorecardsTab` | 3108-3154 | `scorecards` | 6 scorecards |

**Partners mock data** (`partners` line 2750) — 10 partners across 10 roles:
- Tata Consumer Products (CUSTOMER + CORPORATE, ₹50L credit, LOW risk 12.5)
- Konkan Cashew Processors (SUPPLIER + MANUFACTURER, ₹10L credit, LOW risk 18)
- Sri Balaji Sugar (SUPPLIER, ₹25L credit, MEDIUM risk 35)
- Blue Dart Express (TRANSPORTER + DELIVERY_PARTNER, ₹5L credit, LOW risk 15)
- Reliance Retail (CUSTOMER + DISTRIBUTOR + RETAIL_OUTLET, ₹80L credit, LOW risk 8)
- Sudhamrit Franchise Andheri (FRANCHISE + RETAIL_OUTLET, ₹5L credit, MEDIUM risk 28)
- Amul (SUPPLIER + DISTRIBUTOR, ₹30L credit, LOW risk 10)
- Infosys (CUSTOMER + CORPORATE + SERVICE_PROVIDER, ₹20L credit, LOW risk 5)
- Mumbai Packaging Solutions (SUPPLIER, ₹8L credit, MEDIUM risk 32)
- Zomato (DELIVERY_PARTNER + SERVICE_PROVIDER, ₹3L credit, LOW risk 20)

Each partner has: `id, code, name, type, roles[], gst, credit, risk, riskScore, status`

**Addresses mock** (line 2813): 9 address types supported (REGISTERED_OFFICE, BILLING, SHIPPING, FACTORY, WAREHOUSE, BRANCH, RESTAURANT, PICKUP, RETURN). 8 addresses shown.

**Contacts mock** (line 2850): 7 contacts. Fields: partner, name, designation, email, mobile, primary.

**Financial Profiles mock** (line 2892): 10 partners with creditLimit, outstanding, available, creditDays, currency (all INR), paymentMode (CREDIT), paymentTerms (NET_15/30/45/60, CASH, ADVANCE), taxCategory (REGISTERED/COMPOSITION), risk.

**Compliance mock** (line 2938): 9 records. 8 compliance types: GST, PAN, MSME, FSSAI, IEC, ISO, Agreements, Insurance.

**Groups mock** (line 2984): 10 groups (5 customer groups: Retail/Wholesale/Corporate/VIP/Export, 5 supplier groups: Raw Material/Packaging/Transport/Maintenance/Utility).

**Banking mock** (line 3027): 8 bank accounts. Account numbers masked (**** **** **** 4521). Verified flag.

**Relationships mock** (line 3071): 5 relationships (CUSTOMER_OF, SUBSIDIARY, PREFERRED_SUPPLIER, STRATEGIC_PARTNER, FRANCHISE).

**Scorecards mock** (line 3109): 6 quarterly scorecards with onTime, accuracy, quality, complaints, payment, response metrics + composite overall + letter grade (A+/A/B/C/D).

**Critical issues**:
- 100% mock data, no API
- No create/edit/detail flow — buttons "New Partner", "New Address", "New Contact", "Add Compliance", "New Group", "Add Bank Account", "New Relationship", "New Scorecard" all have no onClick handlers
- No permission checks (`hasPermission` never called)
- Backend has `customerApi` and `supplierApi` clients ready, but unused
- The richer `src/modules/customer/components/CustomerModule.tsx` (171 lines) and `src/modules/supplier/components/SupplierModule.tsx` (177 lines) exist but are **not imported** into page.tsx

---

### 3.5 Identification & Traceability — `IdentificationModule()` + 10 sub-tabs

| Attribute | Value |
|---|---|
| Line range | **3159 – 3808** |
| Sidebar item | "Identification & Traceability" → module `identification` |
| Tab type | `IDTab = 'overview' \| 'barcodes' \| 'qrcodes' \| 'batches' \| 'lots' \| 'serials' \| 'gs1' \| 'labels' \| 'print' \| 'traceability'` (line 3157) |
| State hooks | 1 in shell + 4 in `IDTraceabilityTab` |
| API calls | **1 real** (POST `http://localhost:3030/api/identification/trace` from `IDTraceabilityTab.trace()` at line 3706) |
| Backend wiring | ⚠️ PARTIAL — 1 mini-service endpoint |
| Production readiness | **3/10** |

**Tab components**:

| Tab | Function | Lines | Mock array | Items |
|---|---|---|---|---|
| overview | `IDOverviewTab` | 3216-3274 | `stats` | 8 stats + alerts |
| barcodes | `IDBarcodesTab` | 3276-3322 | `barcodes` | 8 barcodes |
| qrcodes | `IDQRCodesTab` | 3324-3366 | `qrcodes` | 6 QR codes |
| batches | `IDBatchesTab` | 3368-3430 | `batches` | 8 batches |
| lots | `IDLotsTab` | 3432-3481 | `lots` | 7 lots |
| serials | `IDSerialsTab` | 3483-3537 | `serials` | 5 serials |
| gs1 | `IDGS1Tab` | 3539-3578 | `gs1` | 6 GS1 IDs |
| labels | `IDLabelsTab` | 3581-3630 | `templates` | 8 label templates |
| print | `IDPrintTab` | 3632-3678 | `jobs` | 6 print jobs |
| traceability | `IDTraceabilityTab` | 3680-3808 | (live API + fallback `mockChain`) | live |

**Barcodes mock** (line 3277): 9 supported types (EAN_13, EAN_8, UPC_A, UPC_E, CODE_128, CODE_39, GS1_128, ITF_14, INTERNAL). 8 barcodes shown for Kaju Katli 250g/500g, Soan Cake, Mixed Namkeen, Gulab Jamun.

**QR Codes mock** (line 3325): 7 purposes (PRODUCT, BATCH, WAREHOUSE, LOCATION, ASSET, INVOICE, ORDER). 6 QR codes shown. Tracks scan count + last scan timestamp.

**Batches mock** (line 3369): 8 batches. 7 statuses: PLANNED, PRODUCED, RELEASED, QUARANTINED, BLOCKED, CONSUMED, EXPIRED. Quality grades A/B/C/REJECT.

**Lots mock** (line 3433): 7 lots. 5 lot types: SUPPLIER_LOT, PRODUCTION_LOT, WAREHOUSE_LOT, RETURN_LOT, INSPECTION_LOT. Quality: PASSED/FAILED/PENDING/QUARANTINED.

**Serials mock** (line 3484): 5 serials for machines/equipment/electronics. Tracks warranty + service history.

**GS1 mock** (line 3540): 6 GS1 IDs (GTIN, GLN, SSCC, GS1-128). Company prefix `8901234` hardcoded.

**Labels mock** (line 3582): 8 label templates. 8 types (Product, Shelf, Pallet, Batch, Location, Shipping, QR, Barcode). 5 formats (A4, Thermal, Zebra, Brother, PDF).

**Print Jobs mock** (line 3633): 6 print jobs. 5 modes (Single, Bulk, Auto, Scheduled, Reprint). 5 printer types (Thermal, Laser, Inkjet, Bluetooth, Network).

**Traceability Tab** (lines 3680-3808):
- State: `batchNumber` (default 'KK-2607-01'), `direction` ('forward' | 'backward'), `result`, `loading`
- `trace()` function (line 3703) POSTs to `http://localhost:3030/api/identification/trace`
- `mockChain` (lines 3686-3701) — hardcoded forward/backward trace chains
- Fallback note (line 3715): `'Backend offline — showing simulated trace. Start backend: cd mini-services/suop-backend && bun run index.ts'`

**Critical issues**:
- 9 of 10 tabs 100% mock
- The 1 real API call hits `/api/identification/trace` (mini-service)
- No create/edit/detail flows — buttons "Generate Barcode", "Generate QR", "New Batch", "New Lot", "Assign Serial", "New GS1 ID", "New Template", "New Print Job" have no onClick handlers
- No permission checks

---

### 3.6 Data Governance — `GovernanceModule()` + 10 sub-tabs

| Attribute | Value |
|---|---|
| Line range | **3813 – 4378** |
| Sidebar item | "Data Governance" → module `governance` |
| Tab type | `GovTab = 'overview' \| 'lifecycle' \| 'approvals' \| 'import' \| 'export' \| 'validation' \| 'duplicates' \| 'audit' \| 'quality' \| 'history'` (line 3811) |
| State hooks | 1 in shell |
| API calls | **0** |
| Backend wiring | ❌ NONE |
| Production readiness | **2/10** |

**Tab components**:

| Tab | Function | Lines | Mock array | Items |
|---|---|---|---|---|
| overview | `GovOverviewTab` | 3870-3934 | `stats` | 8 stats + data quality score 91.6 |
| lifecycle | `GovLifecycleTab` | 3936-3995 | `lifecycles` | 8 product lifecycles |
| approvals | `GovApprovalsTab` | 3997-4050 | `workflows` | 5 approval workflows |
| import | `GovImportTab` | 4052-4097 | `jobs` | 5 import jobs |
| export | `GovExportTab` | 4099-4140 | `jobs` | 4 export jobs |
| validation | `GovValidationTab` | 4142-4190 | `rules` | 10 validation rules |
| duplicates | `GovDuplicatesTab` | 4192-4245 | `duplicates` | 6 duplicates |
| audit | `GovAuditTab` | 4247-4288 | `audit` | 8 audit entries |
| quality | `GovQualityTab` | 4290-4334 | `metrics` | 12 quality metrics |
| history | `GovHistoryTab` | 4336-4378 | `history` | 6 change history entries |

**Lifecycle mock** (line 3937): 8 lifecycle states enforced (DRAFT → UNDER_REVIEW → APPROVED → PUBLISHED → ACTIVE → INACTIVE → DISCONTINUED → ARCHIVED).

**Approvals mock** (line 3998): 6-stage workflow (CREATOR → REVIEWER → QA → COMPLIANCE → FINANCE → PUBLISHER → COMPLETED). 3 workflow types: STANDARD, PARALLEL, CONDITIONAL.

**Import jobs mock** (line 4053): 5 jobs with rollback support. Statuses: COMPLETED, PREVIEWING, QUEUED, ROLLBACK, FAILED. One rollback case shown.

**Validation Rules mock** (line 4143): 10 rules across 6 types (REQUIRED, UNIQUE, RANGE, REGEX, BUSINESS_RULE, CROSS_REFERENCE) and 3 enforcement modes (BLOCK, WARN, LOG). Notable rules reference HSN regex (line 4148) and UOM required (line 4153).

**Duplicates mock** (line 4193): 6 detection rules (Name, SKU, Barcode, HSN, Brand, Similar Names). 4 statuses (PENDING, MERGED, IGNORED, FALSE_POSITIVE).

**Audit mock** (line 4248): 8 audit entries with action types (CREATE, UPDATE, ARCHIVE, MERGE). Tracks user, role, IP, time, fields changed, reason.

**Quality metrics mock** (line 4291): 12 metrics across PRODUCT + BUSINESS_PARTNER entities. Overall score: 91.6 (Grade A).

**Critical issues**:
- 100% mock, no API
- All buttons (Transition, New Workflow, New Import, New Export, New Rule, Scan Duplicates, Rollback) have no onClick handlers
- This module is supposed to be the **governance layer over all master data** but it doesn't actually interact with any of the other master modules

---

### 3.7 Organization Module (Company + Plant + Warehouse + Department + Cost Center hierarchy) — `OrganizationModule()`

| Attribute | Value |
|---|---|
| Line range | **666 – 919** |
| Sidebar item | "Organization" → module `organization` (under Platform section) |
| State hooks | 9 (`selectedNode`, `tree`, `loading`, `error`, `nodeDetail`, `detailLoading`, `showCreate`, `createLoading`, `createError`, `searchQuery`) + nested `exp` in `TreeItem` |
| useEffect | 2 (load tree at line 695, load node detail at line 723) |
| API calls | **4 real** (GET hierarchy, GET company detail, POST create company, GET hierarchy reload) |
| Permission checks | **2** (`hasPermission('org:create')` at lines 859, 887) |
| Backend wiring | ✅ REAL — `http://localhost:3030/api/v1/organization/hierarchy` + `/api/v1/organization/companies` |
| Production readiness | **7.5/10** (the only fully-wired master module) |

**Functions**:
- `handleCreate(data)` (line 747) — POSTs to `/api/v1/organization/companies` with code, name, gstin, pan, email, phone, city, state
- `filterTree(nodes, query)` (line 771) — recursive tree search by name or code
- `countByType(nodes, type)` (line 785) — recursive counter for stats
- `TreeItem({ node, depth })` (line 818) — recursive tree renderer

**API base**: `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'`

**Endpoints used**:
1. `GET /api/v1/organization/hierarchy` (line 704) — fetch org tree
2. `GET /api/v1/organization/companies/{id}` (line 732) — fetch company detail
3. `POST /api/v1/organization/companies` (line 753) — create company
4. `GET /api/v1/organization/hierarchy` (line 760) — reload tree after create

**Demo fallback tree** (line 681): `demoTree` with 1 enterprise, 1 company, 2 BUs, 3 plants.

**Form fields** (Create Company dialog, line 892):
- code* (text), name* (text), gstin (15-char), pan (10-char), email, phone, city, state
- 2-column grid layout

**Stats displayed**: enterprises, companies, plants (counted as `Plant` type), warehouses (counted as `Warehouse` type) — derived live from tree.

**Tree node types** supported: ENTERPRISE, COMPANY, BU, BusinessUnit, DIVISION, REGION, BRANCH, Plant, PLANT, Warehouse, WAREHOUSE (each with icon mapping at line 800).

**Critical issues**:
- Only company create flow — no edit, no delete, no create for other entity types (Plant, Warehouse, BU, etc.)
- Token sourced from `localStorage.getItem('suop_access_token')` (line 701) — works but bypasses the `getAuthToken()` helper in `src/modules/organization/api/client.ts`
- The richer `src/modules/organization/components/OrganizationModule.tsx` (749 lines) and `src/modules/organization/api/client.ts` (358 lines) with `companyApi`, `plantApi`, `warehouseApi`, `departmentApi`, `costCenterApi`, `financialYearApi`, `hierarchyApi` all exist but are **not imported** into page.tsx
- The Cost Center, Department, Financial Year masters are **only available via the unused API client** — they have no UI in page.tsx

---

### 3.8 Warehouse Master — `WarehouseModule()` + 5 sub-tabs

| Attribute | Value |
|---|---|
| Line range | **8410 – 8890** (incl. mock data consts at 8340-8399) |
| Sidebar item | "Warehouse" → module `warehouse` (under Operations section) |
| Tab type | `WarehouseTab = 'overview' \| 'warehouses' \| 'zones' \| 'temperature' \| 'rules'` (inferred, not explicitly typed) |
| State hooks | 1 (`tab`) |
| API calls | **0** |
| Backend wiring | ❌ NONE |
| Production readiness | **2/10** |

**Mock data const arrays** (defined at top of module, lines 8340-8399):

| Array | Line | Items | Purpose |
|---|---|---|---|
| `ZONE_TYPE_COLORS` | (above 8340) | 10 types | Color map |
| `TEMP_ZONE_COLORS` | 8343 | 5 types | Color map |
| `WAREHOUSE_STATUS_COLORS` | 8351 | 4 statuses | Color map |
| `ENFORCEMENT_COLORS` | 8358 | 3 modes | Color map |
| `WHM_WAREHOUSES` | 8364 | **6 warehouses** | WH-RM-MUM, WH-PKG-MUM, WH-FG-MUM, WH-QUA-MUM, WH-RET-MUM-DC, WH-SCR-MUM-DC |
| `WHM_ZONES` | 8373 | **10 zones** | Z-RM-01..04, Z-FG-01..03, Z-QU-01..02, Z-RT-01 |
| `WHM_TEMP_ZONES` | 8386 | **4 temp zones** | TZ-AMB-01, TZ-CHL-01 (alert active), TZ-FRZ-01, TZ-HUM-01 (alert active) |
| `WHM_RULES` | 8393 | **5 rules** | MAX_BIN_WEIGHT, FEFO_ENABLED, BARCODE_MANDATORY, QUALITY_INSPECTION_REQUIRED, MAX_STACK_HEIGHT |

**Tab components**:

| Tab | Function | Lines | Description |
|---|---|---|---|
| overview | `WarehouseOverviewTab` | 8455-8556 | Stats (8 cards) + 8-level hierarchy diagram + PART 4 BEGUN celebration banner |
| warehouses | `WarehouseWarehousesTab` | 8557-8605 | Table of 6 warehouses from `WHM_WAREHOUSES` |
| zones | `WarehouseZonesTab` | 8607-8654 | Grid of 10 zones from `WHM_ZONES` |
| temperature | `WarehouseTemperatureTab` | 8656-8720 | 4 temp zones with sensor readings + alerts |
| rules | `WarehouseRulesTab` | 8722-8771 | 5 operating rules with enforcement modes |

**Warehouse fields**: `id, code, name, type, company, branch, manager, city, volumeM3, weightKg, pallets, bins, hours, status, workingDays`. 11 supported types (RAW_MATERIAL, PACKAGING, FINISHED_GOODS, COLD_STORAGE, DEEP_FREEZE, RETURNS, TRANSIT, QUARANTINE, SCRAP, DISTRIBUTION_CENTER, DARK_STORE).

**Critical issues**:
- 100% mock, no API
- No create/edit flow for warehouses, zones, temp zones, or rules
- The richer `src/modules/warehouse/components/WarehouseModule.tsx` (37 lines, just imports) and `src/modules/warehouse/api/client.ts` (51 lines with `warehouseApi.listZones/listAisles/listRacks/listBins/createBin/...`) exist but are **not imported** into page.tsx
- 1 warehouse (`WH-SCR-MUM-DC`) is in `MAINTENANCE` status — shows status handling works

---

### 3.9 Warehouse Location & Bins — `WarehouseLocationModule()` + 5 sub-tabs

| Attribute | Value |
|---|---|
| Line range | **8891 – 9392** (incl. mock data consts at 8776-8856+) |
| Sidebar item | "Locations & Bins" → module `whlocations` (under Operations section) |
| Tab type | `WhLocTab = 'overview' \| 'bins' \| 'aisles' \| 'racks' \| 'capacity'` (line 8774) |
| State hooks | 1 (`tab`) |
| API calls | **0** |
| Backend wiring | ❌ NONE |
| Production readiness | **2/10** |

**Mock data const arrays**:

| Array | Line | Items |
|---|---|---|
| `TRAFFIC_DIRECTION_COLORS` | 8776 | 4 (ONE_WAY, TWO_WAY, FORKLIFT_ONLY, WALKING_ONLY) |
| `PICKING_LEVEL_COLORS` | 8783 | 4 (GROUND, MID, HIGH, TOP) |
| `ACCESSIBILITY_COLORS` | 8790 | 4 (EASY, MODERATE, DIFFICULT, LADDER_REQUIRED) |
| `BIN_TYPE_COLORS` | 8797 | 5 (STANDARD, BULK, PICK_FACE, CROSS_DOCK, QUARANTINE) |
| `BIN_STATUS_COLORS` | 8805 | 7 (AVAILABLE, OCCUPIED, RESERVED, BLOCKED, MAINTENANCE, CLEANING, DISABLED) |
| `BIN_TEMP_ZONE_COLORS` | 8815 | 5 (AMBIENT, CHILLED, FROZEN, DEEP_FREEZE, HUMIDITY_CONTROLLED) |
| `ALERT_TYPE_COLORS` | 8823 | 4 (FULL, OVERLOADED, UNDERUTILIZED, NEAR_FULL) |
| `WH_LOC_AISLES` | 8830 | **6 aisles** (A-F) |
| `WH_LOC_RACKS` | 8839 | **8 racks** (R-01..R-08) |
| `WH_LOC_BINS` | 8850 | **~15 bins** (bin-001..bin-015ish) with full hierarchy Warehouse→Zone→Aisle→Rack→Shelf→Bin |

**Bin fields**: `id, warehouseCode, zoneCode, aisleCode, rackCode, shelfCode, binCode, barcode, qrCode, maxWeightKg, maxVolumeM3, currentWeightKg, currentVolumeM3, utilizationPercent, temperatureZone, binType, status, statusReason, currentItemTypes`

**Tab components**:

| Tab | Function | Lines | Description |
|---|---|---|---|
| overview | `WhLocOverviewTab` | 8935-9039 | 8 stats + 7-level hierarchy (Warehouse→Zone→Aisle→Rack→Shelf→Bin→Inventory) + bin naming convention (A-05-03-12) + 4-step scanner workflow |
| bins | `WhLocBinsTab` | 9040-9112 | Table of bins from `WH_LOC_BINS` with utilization bars + status badges |
| aisles | `WhLocAislesTab` | 9113-9161 | Grid of 6 aisles with traffic direction |
| racks | `WhLocRacksTab` | 9162-9214 | Grid of 8 racks with fire zones + max weight |
| capacity | `WhLocCapacityTab` | 9215-9392 | Capacity alerts dashboard with 4 alert types |

**Critical issues**:
- 100% mock, no API
- No create/edit flow for bins, aisles, racks
- The `warehouseApi.listBins/createBin` etc. are available but unused

---

### 3.10 Plant Master — `PlantMasterModule()`

| Attribute | Value |
|---|---|
| Line range | **16342 – 16439** |
| Sidebar item | "Plant Master" → module `plantmaster` (under Part 5 Manufacturing section) |
| State hooks | 1 (`showCreate`) |
| API calls | **0** |
| Permission checks | 0 |
| Backend wiring | ❌ NONE |
| Production readiness | **2.5/10** |

**Mock data**: `plants` (line 16344) — 5 plants:
- P1 PLANT-THANE-01 (SWEET_MANUFACTURING, 2500 kg/day capacity)
- P2 PLANT-THANE-02 (NAMKEEN_MANUFACTURING, 1800 kg/day)
- P3 PLANT-BLR-01 (BATTER_PRODUCTION, 1200 kg/day)
- P4 PLANT-MUM-01 (CENTRAL_KITCHEN, 800 kg/day)
- P5 PLANT-PUN-01 (PACKAGING_PLANT, 3000 kg/day, MAINTENANCE status)

**Fields**: `id, code, name, type, manager, city, state, capacity, operatingStart, operatingEnd, status, departments, lines, resources`

**Functions**: 0 (uses helper `s28BadgeForStatus` defined at line 11575).

**Stats computed live**: 6 stats (Total Plants, Active, Maintenance, Total Capacity kg/day, Total Departments, Total Lines) derived from `plants` array via `.length`, `.filter`, `.reduce` — this is one of the few places where stats are computed from data.

**Create form** (lines 16388-16403): `showCreate` toggles a form with fields: Plant Code, Plant Name, Plant Type (select with 5 options), Manager, City, Daily Capacity (kg), Operating Start (time), Operating End (time). **"Create Plant" button has no `onClick` handler** — the form is decorative.

**Hierarchy diagram** (lines 16375-16386): Company → Plant → Building → Department → Line → Work Center.

**Critical issues**:
- 100% mock, no API
- Create form has no submit handler — purely visual
- The `plantApi` client in `src/modules/organization/api/client.ts` (lines 240-263) with `list`, `get`, `create`, `transition` methods exists but is **not imported** into page.tsx
- No edit/delete/transition flows

---

## 4. Modules from Task Description That Are NOT in page.tsx

The task description listed 19 conceptual master modules. The following **have no UI in page.tsx**:

| Module | Status | Backend API available? | Notes |
|---|---|---|---|
| Product Categories | ❌ No UI | ✅ `productApi.listCategories()` | Only mentioned as "Product Families" in PIM (4 families) + Validation Rule PROD-CAT-XREF |
| Brand Master | ❌ No UI | ✅ `productApi.listBrands()` | Only mentioned as Product.brand field + discount type + duplicate detection rule |
| UOM Master | ❌ No UI | ✅ `productApi.listUOMs()` | Only mentioned in Validation Rule PROD-UOM-REQ + Cycle Count varianceType WRONG_UOM |
| HSN / SAC | ❌ No UI | (not in productApi) | Only mentioned in Tax engine description + Validation Rule PROD-HSN-REGEX + duplicate detection |
| Customer Master (standalone) | ❌ No UI (consolidated) | ✅ `customerApi.list/get/create/...` | Consolidated into Business Partner Module; the dedicated `src/modules/customer/components/CustomerModule.tsx` exists but is NOT imported |
| Supplier Master (standalone) | ❌ No UI (consolidated) | ✅ `supplierApi.list/get/create/...` | Consolidated into Business Partner Module; the dedicated `src/modules/supplier/components/SupplierModule.tsx` exists but is NOT imported |
| Cost Center | ❌ No UI | ✅ `costCenterApi.list/create` | Only available in unused `organization/api/client.ts` |
| Department | ❌ No UI (as master) | ✅ `departmentApi.list/create` | Production Departments exist (line 16442 `ProductionDepartmentsModule`) but that's manufacturing-specific, not the org-wide Department master |
| Currency | ❌ No UI | (not in any client) | Only mentioned as Price Lists currency field (INR, USD hardcoded) |
| Payment Terms | ❌ No UI | (not in any client) | Only mentioned in BPFinancialTab as paymentTerms column (NET_15/30/45/60, CASH, ADVANCE) |
| Shipping Terms / Incoterms | ❌ No UI | (not in any client) | Completely absent from page.tsx |
| Reference Masters | ❌ No UI | (not in any client) | Completely absent from page.tsx |

---

## 5. Existing API Clients (Status Audit)

All located under `/home/z/my-project/src/modules/*/api/client.ts`. **NONE are imported by page.tsx.**

### 5.1 `src/modules/product/api/client.ts` (46 lines)
Exports: `productApi` with methods:
- `list({ page, search, productType, status })` → GET `/api/v1/catalog/products`
- `get(id)` → GET `/api/v1/catalog/products/{id}`
- `create(data)` → POST `/api/v1/catalog/products`
- `update(id, data, version)` → PATCH with `If-Match` header
- `delete(id, version)` → DELETE with `If-Match`
- `transition(id, targetStatus, version)` → POST `.../transition`
- `lookupBarcode(barcode)` → GET `.../barcode/{barcode}`
- `listCategories()` → GET `/api/v1/catalog/categories`
- `listBrands()` → GET `/api/v1/catalog/brands`
- `listUOMs()` → GET `/api/v1/catalog/uoms`

Types: `Product` (23 fields), `Category`, `Brand`, `UOM`.

### 5.2 `src/modules/customer/api/client.ts` (30 lines)
Exports: `customerApi` with methods:
- `list({ page, search, status, customerType })` → GET `/api/v1/sales/customers`
- `get(id)` → GET `/api/v1/sales/customers/{id}`
- `create(data)` → POST
- `update(id, data, version)` → PATCH
- `delete(id, version)` → DELETE
- `transition(id, targetStatus, version)` → POST `.../transition`
- `getCredit(id)` → GET `.../{id}/credit`
- `listGroups()` → GET `/api/v1/sales/customer-groups`

Types: `Customer` (15 fields), `CustomerGroup`.

### 5.3 `src/modules/supplier/api/client.ts` (30 lines)
Exports: `supplierApi` with methods:
- `list({ page, search, status, vendorType })` → GET `/api/v1/procurement/suppliers`
- `get(id)` → GET `/api/v1/procurement/suppliers/{id}`
- `create(data)` → POST
- `update(id, data, version)` → PATCH
- `delete(id, version)` → DELETE
- `transition(id, targetStatus, version)` → POST `.../transition`
- `blacklist(id, reason)` → POST `.../{id}/blacklist`
- `listCategories()` → GET `/api/v1/procurement/supplier-categories`

Types: `Supplier` (16 fields), `SupplierCategory`.

### 5.4 `src/modules/warehouse/api/client.ts` (50 lines)
Exports: `warehouseApi` with methods:
- `listZones(warehouseId)` → GET `/api/v1/warehouse/zones?warehouseId=`
- `listAisles(warehouseId)` → GET `/api/v1/warehouse/aisles?warehouseId=`
- `listRacks(warehouseId)` → GET `/api/v1/warehouse/racks?warehouseId=`
- `listBins(warehouseId, { zoneId, aisleId, rackId })` → GET `/api/v1/warehouse/bins`
- `createBin(data)` → POST `/api/v1/warehouse/bins`
- `listPutawayTasks({ page, status, warehouseId })` → GET `/api/v1/warehouse/putaway-tasks`
- `createPutawayTask(data)` → POST
- `completePutaway(id, version)` → POST `.../{id}/complete`
- `createBarcode(data)` → POST `/api/v1/warehouse/barcodes`
- `printBarcode(id)` → POST `.../barcodes/{id}/print`
- `scan(barcode, scanType)` → POST `/api/v1/warehouse/scan`

Types: `WarehouseBin` (10 fields).

⚠️ Note: This client only covers WMS operations (zones, aisles, racks, bins, putaway, barcodes, scan) — **does NOT cover the Warehouse Master itself** (create/update/delete a warehouse). For Warehouse Master CRUD you'd need to use `src/modules/organization/api/client.ts` → `warehouseApi.list/get/create`.

### 5.5 `src/modules/organization/api/client.ts` (358 lines) — THE RICHEST
Exports 7 API objects:
- `companyApi` — list/get/create/update/delete/transition → `/api/v1/organization/companies`
- `plantApi` — list/get/create/transition → `/api/v1/organization/plants`
- `warehouseApi` — list/get/create → `/api/v1/organization/warehouses`
- `departmentApi` — list/create → `/api/v1/organization/departments`
- `costCenterApi` — list/create → `/api/v1/organization/cost-centers`
- `financialYearApi` — list/getCurrent/create → `/api/v1/organization/financial-years`
- `hierarchyApi.getTree()` → `/api/v1/organization/hierarchy`

Types: `Company` (19 fields), `Plant` (14 fields), `Warehouse` (10 fields), `Department` (8 fields), `CostCenter` (8 fields), `FinancialYear` (8 fields), `HierarchyNode`.

Token management: `setAuthToken`, `getAuthToken` (reads from `localStorage.suop_auth` JSON).

### 5.6 `src/modules/inventory/api/client.ts` (62 lines)
Exports: `inventoryApi` with methods for inventory, ledger, transactions, reservations, blocks, expiry. Types: `Inventory` (12 fields).

---

## 6. Backend Endpoints Actually Used by page.tsx (Section 03)

Only 2 mini-service endpoints + 4 organization REST endpoints:

| Module | Endpoint | Method | Purpose |
|---|---|---|---|
| Organization | `/api/v1/organization/hierarchy` | GET | Fetch org tree |
| Organization | `/api/v1/organization/companies/{id}` | GET | Fetch company detail |
| Organization | `/api/v1/organization/companies` | POST | Create company |
| Commercial | `/api/commercial/resolve-price` | POST | Price resolution (mini-service, NOT /api/v1) |
| Identification | `/api/identification/trace` | POST | Traceability (mini-service, NOT /api/v1) |

**Notable**: The Commercial + Identification endpoints hit the mini-service directly (no `/api/v1` prefix, no auth token). The 4 organization endpoints use `/api/v1/...` with Bearer token from `localStorage.suop_access_token`.

---

## 7. State Hooks Catalog (Section 03 Modules Only)

| Module | useState count | useEffect count |
|---|---|---|
| OrganizationModule (666-919) | 9 + 1 nested | 2 |
| ProductMasterModule (1833-1903) | 1 | 0 |
| PIMModule (1906-1986) | 0 | 0 |
| CommercialEngineModule shell (1991-2046) | 1 | 0 |
| ResolutionTab (2452-2611) | 5 | 0 |
| BusinessPartnerModule shell (2616-2671) | 1 | 0 |
| IdentificationModule shell (3159-3214) | 1 | 0 |
| IDTraceabilityTab (3680-3808) | 4 | 0 |
| GovernanceModule shell (3813-3868) | 1 | 0 |
| WarehouseModule shell (8410-8453) | 1 | 0 |
| WarehouseLocationModule shell (8891-8933) | 1 | 0 |
| PlantMasterModule (16342-16439) | 1 | 0 |
| **TOTAL Section 03** | **27 useState + 2 useEffect** | |

---

## 8. Mock Data Arrays Catalog (Section 03)

| Array name | Line | Module | Items | Schema |
|---|---|---|---|---|
| `products` | 1834 | ProductMaster | 6 | upi, code, sku, name, type, status, brand, mrp, stock |
| `families` | 1907 | PIM | 4 | code, name, products |
| `compliance` (PIM) | 1913 | PIM | 3 | product, type, cert, status, expiry |
| `approvals` (PIM) | 1918 | PIM | 3 | req, product, stage, status |
| `stats` (CommercialOverview) | 2049 | Commercial | 8 | label, value, sub, icon |
| `lists` (PriceLists) | 2099 | Commercial | 6 | code, name, type, currency, validFrom, priority, status, taxMode, items |
| `groups` (Tax) | 2150 | Commercial | 6 | code, name, type, rates[], status |
| `discounts` | 2196 | Commercial | 5 | code, name, type, value, kind, max, stackable, status |
| `promos` | 2241 | Commercial | 5 | code, name, type, offer, value, channels[], validFrom, validTo, used, max, priority, status |
| `prices` (FuturePrices) | 2283 | Commercial | 4 | product, current, future, change, effective, auto, status |
| `approvals` (Approvals) | 2322 | Commercial | 5 | id, type, name, stage, status, sla, breached |
| `profiles` (CostMargin) | 2370 | Commercial | 4 | product, method, purchase, average, fifo, weighted, standard, last, total, margin, selling |
| `rules` | 2414 | Commercial | 5 | code, name, type, enforcement, desc |
| `mockChain` | 3686 | IDTraceability | 5 forward + 6 backward | step, stage, entity, ... |
| `partners` | 2750 | BusinessPartner | 10 | id, code, name, type, roles[], gst, credit, risk, riskScore, status |
| `addresses` | 2813 | BusinessPartner | 8 | partner, type, line1, city, state, pincode, isDefault |
| `contacts` | 2849 | BusinessPartner | 7 | partner, name, designation, email, mobile, primary |
| `profiles` (Financial) | 2892 | BusinessPartner | 10 | partner, creditLimit, outstanding, available, creditDays, currency, paymentMode, paymentTerms, taxCategory, risk |
| `compliance` (BP) | 2938 | BusinessPartner | 9 | partner, type, number, authority, issueDate, expiry, status |
| `groups` (BP) | 2984 | BusinessPartner | 10 | code, name, type, discount, terms, members |
| `accounts` (Banking) | 3027 | BusinessPartner | 8 | partner, accountName, accountNumber, bank, branch, ifsc, type, isDefault, verified |
| `relationships` | 3071 | BusinessPartner | 5 | from, to, type, validFrom, status |
| `scorecards` | 3109 | BusinessPartner | 6 | partner, period, onTime, accuracy, quality, complaints, payment, response, overall, grade, orders, value |
| `barcodes` | 3277 | Identification | 8 | id, barcode, type, product, primary, status |
| `qrcodes` | 3325 | Identification | 6 | id, code, purpose, entity, scans, lastScan, encrypted, status |
| `batches` | 3369 | Identification | 8 | id, batch, product, mfg, exp, produced, remaining, status, grade, lots, reason? |
| `lots` | 3433 | Identification | 7 | id, lot, type, product, supplier, invoice, batch, qty, remaining, quality |
| `serials` | 3484 | Identification | 5 | id, serial, product, type, warrantyStart, warrantyEnd, status, location, lastService, nextService |
| `gs1` | 3540 | Identification | 6 | id, type, identifier, entity, entityType, prefix, check |
| `templates` (Labels) | 3582 | Identification | 8 | id, code, name, type, format, w, h, status, version, fields |
| `jobs` (Print) | 3633 | Identification | 6 | id, template, mode, entityType, printerType, printer, total, printed, status, requestedAt, completedAt, scheduledAt? |
| `lifecycles` | 3937 | Governance | 8 | id, product, state, prev, submitted, approved, published, activated, reason, transitions |
| `workflows` (Approvals) | 3998 | Governance | 5 | id, product, type, stage, status, sla, breached, steps, completed |
| `jobs` (Import) | 4053 | Governance | 5 | id, code, entity, file, format, total, success, errors, duplicates, status, initiated, completed, rollbackReason? |
| `jobs` (Export) | 4100 | Governance | 4 | id, code, entity, format, file, total, exported, size, status, initiated, completed |
| `rules` (Validation) | 4143 | Governance | 10 | code, name, entity, field, type, severity, enforcement, status |
| `duplicates` | 4193 | Governance | 6 | id, primary, duplicate, rule, score, matched[], status, action?, notes? |
| `audit` | 4248 | Governance | 8 | id, entity, type, action, module, user, role, fields[], reason, ip, time |
| `metrics` (Quality) | 4291 | Governance | 12 | entity, name, value, unit, score, desc |
| `history` | 4337 | Governance | 6 | id, product, version, type, fields[], editor, reason, time, rollback |
| `WHM_WAREHOUSES` | 8364 | Warehouse | 6 | id, code, name, type, company, branch, manager, city, volumeM3, weightKg, pallets, bins, hours, status, workingDays |
| `WHM_ZONES` | 8373 | Warehouse | 10 | id, code, name, type, warehouse, parentZone, tempZone, volumeM3, weightKg, pallets, bins, restricted, status |
| `WHM_TEMP_ZONES` | 8386 | Warehouse | 4 | id, code, name, type, warehouse, minTemp, maxTemp, targetTemp, minHum, maxHum, lastReading, lastReadingAt, alert, monitoring |
| `WHM_RULES` | 8393 | Warehouse | 5 | id, code, name, type, value, unit, enforcement, warehouse, desc |
| `WH_LOC_AISLES` | 8830 | Warehouse Locations | 6 | id, warehouseCode, warehouseName, zoneCode, zoneName, aisleCode, aisleName, description, lengthM, widthM, trafficDirection, status, rackCount, shelfCount, binCount |
| `WH_LOC_RACKS` | 8839 | Warehouse Locations | 8 | id, warehouseCode, aisleCode, rackCode, rackName, description, heightM, widthM, depthM, maxWeightKg, shelfCount, fireZone, status |
| `WH_LOC_BINS` | 8850 | Warehouse Locations | ~15 | id, warehouseCode, zoneCode, aisleCode, rackCode, shelfCode, binCode, barcode, qrCode, maxWeightKg, maxVolumeM3, currentWeightKg, currentVolumeM3, utilizationPercent, temperatureZone, binType, status, statusReason, currentItemTypes |
| `plants` | 16344 | Plant Master | 5 | id, code, name, type, manager, city, state, capacity, operatingStart, operatingEnd, status, departments, lines, resources |

**TOTAL**: ~45 distinct mock data arrays containing **~250 hardcoded records** across Section 03.

---

## 9. UI Elements Catalog Per Module

### 9.1 Buttons Without onClick Handlers (Dead Buttons)

The following primary action buttons across Section 03 have **NO onClick handler** (purely decorative):

| Module | Button | Line |
|---|---|---|
| ProductMaster | "New Product" | 1875 |
| ProductMaster | "Import" | 1873 |
| ProductMaster | "Export" | 1874 |
| PIM | (no add buttons — view-only) | — |
| PriceListsTab | "New Price List" | 2119 |
| TaxTab | "New Tax Group" | 2164 |
| DiscountsTab | "New Discount" | 2213 |
| PromotionsTab | "New Promotion" | 2253 |
| FuturePricesTab | "Schedule Price Change" | 2294 |
| ApprovalsTab | "Advance Stage" | 2357 |
| CostMarginTab | (no add) | — |
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
| GovHistoryTab | "Rollback" | 4237 / 4371 |
| PlantMaster | "Create Plant" | 16400 |

**Total dead buttons**: ~40 across Section 03.

### 9.2 Tables (Read-Only)
1. ProductMaster — products table (6 rows)
2. PriceListsTab — price lists table (6 rows)
3. DiscountsTab — discounts table (5 rows)
4. CostMarginTab — cost profiles table (4 rows)
5. BPPartnersTab — partners table (10 rows)
6. BPContactsTab — contacts table (7 rows)
7. BPFinancialTab — financial profiles table (10 rows)
8. BPComplianceTab — compliance table (9 rows)
9. IDBarcodesTab — barcodes table (8 rows)
10. IDBatchesTab — batches table (8 rows)
11. IDLotsTab — lots table (7 rows)
12. IDGS1Tab — GS1 IDs table (6 rows)
13. GovLifecycleTab — lifecycles table (8 rows)
14. GovValidationTab — validation rules table (10 rows)
15. GovExportTab — export jobs table (4 rows)
16. WarehouseWarehousesTab — warehouses table (6 rows)
17. WhLocBinsTab — bins table (~15 rows)

### 9.3 Forms (with state)
1. OrganizationModule Create Company dialog (line 892) — 8 fields, **real POST**
2. ResolutionTab price resolution form (line 2519) — 4 fields, **real POST** to mini-service
3. IDTraceabilityTab trace form (line 3745) — 2 fields + button, **real POST** to mini-service
4. PlantMaster Create Plant inline form (line 16388) — 8 fields, **NO submit handler**

### 9.4 Drawers / Sheets
**NONE**. The codebase imports `Sheet` and `Drawer` from `@/components/ui/...` but Section 03 doesn't use them. Only inline modals (Organization's `<div className="fixed inset-0 bg-black/50 z-50">` pattern at line 888) are used.

### 9.5 Search/Filter Inputs
1. ProductMaster search (line 1871) — `search` state, filters by name/SKU/UPI/code
2. OrganizationModule search (line 857) — `searchQuery` state, filters tree by name/code
3. PriceListsTab — NO search (table is small)
4. BPPartnersTab — NO search (despite text suggesting "Filter by role or type")
5. IDTraceabilityTab — Batch number input is the search key

---

## 10. Permission Checks (Section 03)

Only **1 permission** is checked across all of Section 03:

| Module | Permission | Lines | Use |
|---|---|---|---|
| OrganizationModule | `org:create` | 859, 887 | Gates "Add Entity" button + Create dialog |

The other 8 Section 03 modules have **zero** `hasPermission` calls. The `useAuthStore` hook is only imported in `OrganizationModule` (line 667), `DashboardModule` (line 547), and `RBACModule` (line 923).

---

## 11. Critical Issues Summary

### Issue 1: 8 of 9 modules use 100% hardcoded mock data
Only OrganizationModule is wired to a real backend. All other modules (`ProductMasterModule`, `PIMModule`, `CommercialEngineModule`, `BusinessPartnerModule`, `IdentificationModule`, `GovernanceModule`, `WarehouseModule`, `WarehouseLocationModule`, `PlantMasterModule`) use inline `const X = [...]` arrays. Refreshing the page shows the same data forever; creating a "New Product" does nothing.

### Issue 2: Backend API clients exist but are unused
- `src/modules/product/api/client.ts` — 9 methods ready, 0 imported
- `src/modules/customer/api/client.ts` — 8 methods ready, 0 imported
- `src/modules/supplier/api/client.ts` — 8 methods ready, 0 imported
- `src/modules/warehouse/api/client.ts` — 11 methods ready, 0 imported
- `src/modules/organization/api/client.ts` — 7 API objects + 35 types ready, only hierarchy/company endpoints used (via inline fetch, not via the client)
- `src/modules/inventory/api/client.ts` — 8 methods ready, 0 imported

### Issue 3: Modular React components exist but are unused
- `src/modules/product/components/ProductModule.tsx` (221 lines, fully wired to productApi)
- `src/modules/customer/components/CustomerModule.tsx` (171 lines, fully wired to customerApi)
- `src/modules/supplier/components/SupplierModule.tsx` (177 lines, fully wired to supplierApi)
- `src/modules/warehouse/components/WarehouseModule.tsx` (37 lines, currently a placeholder import)
- `src/modules/organization/components/OrganizationModule.tsx` (749 lines, fully wired)

Page.tsx does NOT import any of these. It defines its own monolithic versions inline.

### Issue 4: Two backend service layers confused
The `CommercialEngineModule`'s `ResolutionTab` and `IdentificationModule`'s `IDTraceabilityTab` make direct fetch calls to `http://localhost:3030/api/commercial/resolve-price` and `http://localhost:3030/api/identification/trace`. These are **mini-service endpoints** (no `/api/v1/` prefix, no auth token, defined in `mini-services/suop-backend/index.ts` at lines 3443 and 3905). The other modules should be hitting `/api/v1/catalog/...`, `/api/v1/sales/...`, `/api/v1/procurement/...`, `/api/v1/organization/...` etc. (the main backend API).

### Issue 5: 40+ dead buttons
~40 "New X" / "Create X" / "Generate X" buttons across Section 03 have no onClick handlers — they exist purely as visual scaffolding. Users will click them and nothing happens.

### Issue 6: Stats are hardcoded (not computed from data)
Most stat cards show hardcoded numbers that don't match the mock data. E.g. ProductMasterModule shows "Total Products: 12" but the `products` array has only 6 items. PIM shows "Families: 6" but `families` array has 4. This is misleading even in demo mode.

### Issue 7: Customer/Supplier unified as Business Partner
The task asks for separate Customer Master and Supplier Master modules. The current architecture consolidates them into a single Business Partner Platform (SAP-style). This is architecturally sound BUT it means:
- The `customerApi` and `supplierApi` clients (which call `/api/v1/sales/customers` and `/api/v1/procurement/suppliers`) cannot be directly wired to the BusinessPartnerModule without an adapter
- The backend likely has BOTH a Business Partner master AND separate Customer/Supplier views (since the API endpoints exist) — this needs reconciliation

### Issue 8: No edit/delete/transition UI
Even OrganizationModule (the most complete) only has Create. There's no edit form, no delete confirmation, no status transition UI (e.g. DRAFT → ACTIVE → INACTIVE for products, BLACKLIST for suppliers). The API clients support these (PATCH, DELETE, POST /transition) but the UI doesn't expose them.

### Issue 9: No pagination
All tables render the full mock array. Even when `ProductModule.tsx` (the unused modular version) implements pagination with `page` state and Previous/Next buttons, the inline `ProductMasterModule` doesn't.

### Issue 10: No loading/error states
Of 9 Section 03 modules, only OrganizationModule has loading skeletons and error retry. The other 8 render synchronously from inline consts — there's no `loading`, `error`, or `EmptyState` handling.

---

## 12. Production Readiness Scorecard (1-10)

| Module | Score | Rationale |
|---|---|---|
| OrganizationModule | **7.5** | Real API, real create, has loading/error/permission gating. Missing edit/delete/transition. |
| PlantMasterModule | **2.5** | Mock + create form state but no submit. |
| CommercialEngineModule | **3.0** | Mock + 1 mini-service endpoint for price resolution. |
| IdentificationModule | **3.0** | Mock + 1 mini-service endpoint for traceability. |
| ProductMasterModule | **2.0** | 100% mock, no create, no detail. |
| PIMModule | **2.0** | 100% mock, no create, no detail. |
| BusinessPartnerModule | **2.5** | 100% mock but 10 well-structured tabs covering full partner lifecycle. |
| GovernanceModule | **2.0** | 100% mock, 10 tabs covering governance (should be the master overlay). |
| WarehouseModule | **2.0** | 100% mock, 5 tabs, no create. |
| WarehouseLocationModule | **2.0** | 100% mock, 5 tabs, no create. |

**Section 03 overall: 3.2 / 10** — visually rich demo, but functionally a prototype. Major rewrite needed to wire to backend.

---

## 13. Recommended Next Actions

1. **Import the existing modular components into page.tsx** (or migrate page.tsx modules to use the API clients). Specifically:
   - Replace `ProductMasterModule()` (line 1833) with the imported `<ProductModule />` from `src/modules/product/components/ProductModule.tsx` — this alone adds real product CRUD
   - Wire `BusinessPartnerModule` tabs to use `customerApi.list()` + `supplierApi.list()` (likely needs an adapter since the UI uses unified `partners[]` but APIs are split)
   - Wire `WarehouseModule` to use `warehouseApi.list()` from `src/modules/organization/api/client.ts` (Warehouse Master CRUD) and `warehouseApi.listZones/Aisles/Racks/Bins` from `src/modules/warehouse/api/client.ts` (WMS operations)
   - Wire `PlantMasterModule` to `plantApi.list/create` from organization client
   - Replace `OrganizationModule`'s inline fetches with the `companyApi` / `hierarchyApi` from the organization client (consistency)

2. **Add onClick handlers to all 40+ dead buttons** — each should open a dialog/drawer with a form that POSTs to the appropriate API.

3. **Add edit/delete/transition flows** — at minimum, a row-click detail drawer and an action menu per row.

4. **Reconcile the Commercial + Identification mini-service endpoints** with the main `/api/v1/...` REST API. The mini-service is for prototyping; the production endpoints should be under `/api/v1/commercial/resolve-price` and `/api/v1/identification/trace`.

5. **Add missing master modules** (currently NO UI): Product Categories, Brand Master, UOM Master, HSN/SAC Master, Cost Center, Department (org-wide), Currency, Payment Terms, Shipping Terms (Incoterms), Reference Masters. Backend APIs exist for some (categories, brands, uoms via `productApi.list*`; cost center, department via `costCenterApi`/`departmentApi`). Others need new API clients.

6. **Add pagination, loading skeletons, error retry** to all modules (copy the pattern from OrganizationModule).

7. **Add permission checks** — at minimum `master_data:product:create`, `master_data:customer:create`, etc. for every create/edit/delete button.

8. **Compute stats from data** instead of hardcoding them.

---

**End of Findings File**

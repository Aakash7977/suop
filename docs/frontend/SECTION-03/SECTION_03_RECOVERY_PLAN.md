# SECTION 03 — Recovery Plan

**Date**: 2026-07-13
**Status**: Section 03 is IN PROGRESS — not complete
**Objective**: Reach 9.5+/10 production readiness through VERIFIED, REUSE-FIRST implementation

> **Acknowledgment**: The previous implementation moved too fast. It created duplicate code (custom toast system, status color maps, hooks private to Section 03) and made unverified claims ("~80 missing endpoints"). This recovery plan corrects those mistakes with a reuse-first, proof-based approach.

---

## 1. What Went Wrong (Honest Assessment)

### 1.1 False Claims
- **Claim**: "~80 missing backend endpoints" → **Reality**: 186 endpoints exist; only 18 genuinely missing
- **Claim**: "Production readiness 6.5/10" → **Reality**: 4-5/10 because the toast system is broken (40+ buttons emit invisible toasts), 4 of 9 components still use 100% mock data, and zero edit/delete/transition/detail-drawer flows exist

### 1.2 Duplicate Code Created
1. **Custom toast pub/sub** (`src/sections/03-master-data/api/clients.ts:221-238`) — reinvented the existing `toast()` from `@/hooks/use-toast`. AND it's broken: `subscribeToasts` is never called, so 40+ `pushToast()` calls fire into a void.
2. **Section-03-private hooks** (`useList`, `useRecord`, `useMutation`, `useDebouncedSearch`, `useDropdown`) — should be in `src/hooks/` so other sections can reuse them.
3. **Section-03-private utilities** (`formatINR`, `s28BadgeForStatus`, `exportToCSV`, validators) — should be in `src/lib/`.
4. **Section-03-private constants** (`STATUS_COLORS`, lifecycle maps) — should be in `src/lib/`.
5. **Inline CSV export** in `product-master.tsx:252-263` — duplicates `exportToCSV` in `utils/helpers.ts`.
6. **13+ duplicate status color maps** across modules — should consolidate to one `s28BadgeForStatus`.

### 1.3 Placeholder/Toast Strategies (FORBIDDEN by new policy)
- 40+ dead buttons now emit `pushToast('info', 'Create X — backend endpoint ready')` — these are placeholders, NOT real functionality
- Per new policy: "Do NOT use Toast / Coming Soon / Temporary Placeholder / Future Feature. If backend exists, connect it. If backend does not exist, document it."

### 1.4 What Was Done Right
- Code extraction from page.tsx to `src/sections/03-master-data/` (3,800 lines → 13 files) — UI is pixel-identical
- 2 modules (ProductMaster, PlantMaster) have real Create flows with working API calls
- 5 modules have live List APIs (ProductMaster, PIM, PlantMaster, BusinessPartner, Warehouse)
- Permission gating on 2 create buttons (product:create, org:create)
- Build passes

---

## 2. Recovery Principles (Non-Negotiable)

### Principle 1: REUSE FIRST
Before writing ANY new code, search the entire project. If it exists, reuse it.

### Principle 2: NO PLACEHOLDERS
- If backend exists → connect it (real CRUD, real dialog, real form)
- If backend does not exist → document in `MISSING_BACKEND_ITEMS.md`, do NOT fake it with a toast
- Remove all existing `pushToast('info', '...')` placeholder calls

### Principle 3: NO DUPLICATES
- Use `toast()` from `@/hooks/use-toast` (NOT custom `pushToast`)
- Use shadcn `<Table>`, `<Tabs>`, `<Select>`, `<Dialog>`, `<Form>`, `<Pagination>`, `<Skeleton>` (NOT manual implementations)
- Use shared utilities from `src/lib/` (promote Section 03 utils there first)
- Use shared hooks from `src/hooks/` (promote Section 03 hooks there first)

### Principle 4: PROVE, DON'T ASSUME
- Every "missing" claim must cite the search performed and the result
- Every "reuse" decision must cite the source file:line

### Principle 5: COMPLETE BEFORE MOVING ON
- Section 03 must reach 9.5/10 before Section 04 starts
- "Complete" means: every existing backend capability is reused, every CRUD flow works, every button does something real

---

## 3. Recovery Phases

### Phase R1: Fix the Broken Toast System (CRITICAL — 1 hour)

**Problem**: 40+ `pushToast()` calls in Section 03 are invisible because `subscribeToasts` is never called.

**Action**:
1. Delete `pushToast`, `subscribeToasts`, `ToastKind`, `ToastEntry` from `src/sections/03-master-data/api/clients.ts` (lines 221-238)
2. In every Section 03 component, replace `import { pushToast } from '../api/clients'` with `import { toast } from '@/hooks/use-toast'`
3. Replace every `pushToast('success', msg)` with `toast({ title: msg, variant: 'default' })`
4. Replace every `pushToast('error', msg)` with `toast({ title: msg, variant: 'destructive' })`
5. Replace every `pushToast('info', msg)` — REMOVE these entirely (per no-placeholder policy). Instead, wire the button to real functionality or document it as missing.

**Files affected**:
- `src/sections/03-master-data/api/clients.ts` (delete pub/sub)
- `src/sections/03-master-data/components/product-master.tsx`
- `src/sections/03-master-data/components/pim.tsx`
- `src/sections/03-master-data/components/commercial-engine.tsx`
- `src/sections/03-master-data/components/business-partner.tsx`
- `src/sections/03-master-data/components/identification.tsx`
- `src/sections/03-master-data/components/governance.tsx`
- `src/sections/03-master-data/components/warehouse.tsx`
- `src/sections/03-master-data/components/warehouse-locations.tsx`
- `src/sections/03-master-data/components/plant-master.tsx`
- `src/sections/03-master-data/hooks/use-master-data.ts` (useMutation hook calls pushToast)

**Verification**: After this phase, every button click either does something real OR is removed/disabled with a tooltip explaining what backend capability is missing.

---

### Phase R2: Promote Section 03 Shared Code to `src/lib/` and `src/hooks/` (4 hours)

**Problem**: Section 03's hooks and utilities are private — other sections can't reuse them, and Section 03 itself has internal duplication.

**Action**:

#### R2.1 Promote Utilities to `src/lib/`
Create these files by MOVING (not copying) from `src/sections/03-master-data/utils/helpers.ts`:

| New File | Content | Source |
|---|---|---|
| `src/lib/format.ts` | `formatINR`, `formatNumber`, `formatDate`, `formatDateTime`, `relativeTime` | helpers.ts:85-130 |
| `src/lib/badges.ts` | `s28BadgeForStatus` (70-entry map) | helpers.ts:12-80 |
| `src/lib/csv.ts` | `exportToCSV` | helpers.ts:135-148 |
| `src/lib/validate.ts` | `validateGSTIN`, `validatePAN`, `validateEmail`, `validatePhone`, `validatePincode` | helpers.ts:150-168 |
| `src/lib/api.ts` | `apiFetch<T>(path, options)` shared helper (extract from 14 inline copies in API clients) | (new — extract pattern) |

Update all Section 03 components to import from `@/lib/*` instead of `../utils/helpers`.
Delete `src/sections/03-master-data/utils/helpers.ts` (or make it a re-export barrel for backward compat).

#### R2.2 Promote Hooks to `src/hooks/`
Create these files by MOVING from `src/sections/03-master-data/hooks/use-master-data.ts`:

| New File | Content | Source |
|---|---|---|
| `src/hooks/use-list.ts` | `useList<T>` | use-master-data.ts:36 |
| `src/hooks/use-record.ts` | `useRecord<T>` | use-master-data.ts:96 |
| `src/hooks/use-mutation.ts` | `useMutation` (update to use `toast()` from `@/hooks/use-toast`) | use-master-data.ts:138 |
| `src/hooks/use-debounced-search.ts` | `useDebouncedSearch` | use-master-data.ts:168 |
| `src/hooks/use-dropdown.ts` | `useDropdown<T>` | use-master-data.ts:186 |

Update all Section 03 components to import from `@/hooks/*`.
Delete `src/sections/03-master-data/hooks/use-master-data.ts`.

#### R2.3 Promote Constants to `src/lib/master-data-constants.ts`
Move `src/sections/03-master-data/constants/master-data.ts` → `src/lib/master-data-constants.ts`.
Update all imports.

**Verification**: `grep -r "from '../utils/helpers'" src/sections/03-master-data/` returns 0 results. `grep -r "from '../hooks/use-master-data'" src/sections/03-master-data/` returns 0 results.

---

### Phase R3: Adopt shadcn Primitives (Replace Manual Implementations) (8 hours)

**Problem**: Section 03 uses raw `<table>`, `<select>`, manual tab bars, manual pagination, `<div className="animate-pulse">` — all of which have shadcn equivalents that are never used.

**Action**:

#### R3.1 Replace Manual Tab Bars with `<Tabs>`
Affected files (9 components with tabs):
- `commercial-engine.tsx` (10 tabs)
- `business-partner.tsx` (10 tabs)
- `identification.tsx` (10 tabs)
- `governance.tsx` (10 tabs)
- `warehouse.tsx` (5 tabs)
- `warehouse-locations.tsx` (5 tabs)

Replace pattern:
```tsx
// BEFORE
<div className="flex flex-wrap gap-2 border-b pb-3">
  {tabs.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={cn(...)}>{t.icon}{t.label}</button>)}
</div>
{tab === 'overview' && <OverviewTab />}
{tab === 'partners' && <PartnersTab />}

// AFTER
<Tabs value={tab} onValueChange={(v) => setTab(v as TabType)}>
  <TabsList className="flex flex-wrap">
    {tabs.map(t => <TabsTrigger key={t.key} value={t.key} className="flex items-center gap-2">{t.icon}{t.label}</TabsTrigger>)}
  </TabsList>
  <TabsContent value="overview"><OverviewTab /></TabsContent>
  <TabsContent value="partners"><PartnersTab /></TabsContent>
</Tabs>
```

#### R3.2 Replace Raw `<table>` with shadcn `<Table>`
Affected files: every component with a table (14+ tables across Section 03).

#### R3.3 Replace Raw `<select>` with shadcn `<Select>`
Affected files: every component with dropdowns (ProductMaster create dialog has 8 selects, PlantMaster has 1, etc.)

#### R3.4 Replace Manual Pagination with shadcn `<Pagination>`
Affected files: `product-master.tsx` (only component with pagination currently)

#### R3.5 Replace `<div className="animate-pulse">` with `<Skeleton>`
Affected files: every component with loading states

#### R3.6 Replace `<div className="fixed inset-0">` with shadcn `<Dialog>`
Affected files: `product-master.tsx` (CreateProductDialog)

#### R3.7 Replace FormData with shadcn `<Form>` + react-hook-form + zod
Affected files: `product-master.tsx` (28-field form), `plant-master.tsx` (8-field form)

**Verification**: `grep -r "<table className" src/sections/03-master-data/` returns 0. `grep -r "<select className" src/sections/03-master-data/` returns 0.

---

### Phase R4: Wire Every Existing Backend Endpoint (20 hours)

**Problem**: 5 of 9 components have live API data. 4 still use 100% mock data. 27 client methods need adding.

**Action**:

#### R4.1 Add 27 Missing Client Methods (Section D of MISSING_BACKEND_ITEMS.md)
Add these methods to EXISTING client files (no new files):

**`src/modules/product/api/client.ts`**:
- `addBarcode(productId, data)` → POST `/api/v1/catalog/products/:id/barcodes`
- `createCategory(data)` → POST `/api/v1/catalog/categories`
- `createBrand(data)` → POST `/api/v1/catalog/brands`

**`src/modules/customer/api/client.ts`**:
- `lookupByGstin(gstin)` → GET `/api/v1/sales/customers/gst/:gstin`
- `addContact(id, data)` → POST `/api/v1/sales/customers/:id/contacts`
- `addAddress(id, data)` → POST `/api/v1/sales/customers/:id/addresses`
- `createGroup(data)` → POST `/api/v1/sales/customer-groups`

**`src/modules/supplier/api/client.ts`**:
- `lookupByGstin(gstin)` → GET `/api/v1/procurement/suppliers/gst/:gstin`
- `listContacts(id)` → GET `/api/v1/procurement/suppliers/:id/contacts`
- `addContact(id, data)` → POST `/api/v1/procurement/suppliers/:id/contacts`
- `addAddress(id, data)` → POST `/api/v1/procurement/suppliers/:id/addresses`
- `addCompliance(id, data)` → POST `/api/v1/procurement/suppliers/:id/compliances`
- `assignProduct(id, data)` → POST `/api/v1/procurement/suppliers/:id/products`
- `createCategory(data)` → POST `/api/v1/procurement/supplier-categories`

**`src/modules/warehouse/api/client.ts`**:
- `listZones(warehouseId)` → already exists ✅
- `createZone(data)` → POST `/api/v1/warehouse/zones`
- `listAisles(warehouseId)` → already exists ✅
- `createAisle(data)` → POST `/api/v1/warehouse/aisles`
- `listRacks(warehouseId)` → already exists ✅
- `createRack(data)` → POST `/api/v1/warehouse/racks`
- `listScanLogs(query)` → GET `/api/v1/warehouse/scan-logs`

**`src/modules/inventory/api/client.ts`**:
- `listBatches(query)` → GET `/api/v1/inventory/batches`
- `releaseReservation(id, reason)` → POST `/api/v1/inventory/reservations/:id/release`
- `markExpired()` → POST `/api/v1/inventory/expiry/mark-expired`

**`src/sections/03-master-data/api/clients.ts`** (gstApi + financeApi):
- `gstApi.create/update/delete` → POST/PUT/DELETE `/api/v1/finance/gst`
- `financeApi.listAccounts/createAccount` → GET/POST `/api/v1/finance/foundation/accounts`
- `financeApi.listFiscalYears/createFiscalYear` → GET/POST `/api/v1/finance/foundation/fiscal-years`
- `financeApi.listCostCenters/createCostCenter` → GET/POST `/api/v1/finance/foundation/cost-centers`
- `financeApi.listProfitCenters/createProfitCenter` → GET/POST `/api/v1/finance/foundation/profit-centers`
- `financeApi.closeFiscalPeriod(id)` → POST `/api/v1/finance/foundation/fiscal-periods/close`

#### R4.2 Wire 4 Remaining Mock-Only Components

**`commercial-engine.tsx`** — Wire 9 mock tabs to live APIs:
1. **PriceListsTab** → `pricingApi.listPriceLists()` + `createPriceList()` (create dialog)
2. **TaxTab** → `pricingApi.listTaxConfigs()` + `createTaxConfig()` (create dialog)
3. **DiscountsTab** → NO BACKEND EXISTS (document as missing — remove mock data, show empty state with "Backend endpoint pending" message)
4. **PromotionsTab** → `pricingApi.listPromotions()` + `createPromotion()` (create dialog)
5. **FuturePricesTab** → NO BACKEND EXISTS (document as missing)
6. **ApprovalsTab** → NO BACKEND EXISTS (document as missing)
7. **CostMarginTab** → `GET /api/v1/finance/costing` (productCosting — but transition is BROKEN; list should work)
8. **RulesTab** → NO BACKEND EXISTS (document as missing)
9. **ResolutionTab** → ✅ Already wired to `pricingApi.calculate`

**`business-partner.tsx`** — Wire 9 remaining mock tabs:
1. **BPAddressesTab** → Use `customerApi.addAddress` / `supplierApi.addAddress` (exists). For LIST, need to call `customerApi.get(id)` which returns addresses — OR document as missing if no list-by-address endpoint.
2. **BPContactsTab** → Same pattern — `customerApi.addContact` / `supplierApi.addContact` exists. List via `get(id)`.
3. **BPFinancialTab** → `customerApi.getCredit(id)` exists. Supplier credit needs supplier detail (`supplierApi.get(id)` returns credit fields).
4. **BPComplianceTab** → `supplierApi.addCompliance` exists. List via `supplierApi.get(id)`.
5. **BPGroupsTab** → `customerApi.listGroups()` + `createGroup()` exist. Supplier categories: `supplierApi.listCategories()` + `createCategory()`.
6. **BPBankingTab** → NO BACKEND EXISTS (document as missing)
7. **BPRelationshipsTab** → NO BACKEND EXISTS (document as missing)
8. **BPScorecardsTab** → NO BACKEND EXISTS (document as missing)
9. **BPPartnersTab** → ✅ Already wired

**`identification.tsx`** — Wire 9 mock tabs:
1. **IDBarcodesTab** → `productApi.lookupBarcode()` + `productApi.addBarcode()` exist. List via `productApi.get(id).barcodes`.
2. **IDQRCodesTab** → NO BACKEND EXISTS (document as missing)
3. **IDBatchesTab** → `inventoryApi.listBatches()` exists
4. **IDLotsTab** → NO list endpoint (lots are internal to inventory). Document as missing.
5. **IDSerialsTab** → NO BACKEND EXISTS (document as missing)
6. **IDGS1Tab** → NO BACKEND EXISTS (document as missing)
7. **IDLabelsTab** → NO BACKEND EXISTS (document as missing)
8. **IDPrintTab** → NO BACKEND EXISTS (document as missing)
9. **IDTraceabilityTab** → ✅ Already wired (uses inventory batches)

**`governance.tsx`** — Wire 10 mock tabs:
1. **GovLifecycleTab** → NO BACKEND (lifecycle is per-entity, not a standalone master). Document as missing.
2. **GovApprovalsTab** → NO BACKEND EXISTS. Document as missing.
3. **GovImportTab** → NO BACKEND EXISTS. Document as missing.
4. **GovExportTab** → NO BACKEND EXISTS. Document as missing.
5. **GovValidationTab** → NO BACKEND EXISTS. Document as missing.
6. **GovDuplicatesTab** → NO BACKEND EXISTS. Document as missing.
7. **GovAuditTab** → `auditService.query()` EXISTS internally — need REST endpoint (see MISSING_BACKEND_ITEMS [A16]). Until then, document as "Backend service exists, REST endpoint pending".
8. **GovQualityTab** → NO BACKEND EXISTS. Document as missing.
9. **GovHistoryTab** → Audit log provides change history. Use `auditService.query({ entityType: 'Product' })` once REST endpoint is added.
10. **GovOverviewTab** → Compute from other tabs' data.

#### R4.3 Wire Warehouse Locations Component

**`warehouse-locations.tsx`** — Wire 5 tabs to `warehouseApi` (operational):
1. **WhLocBinsTab** → `warehouseApi.listBins(warehouseId)` exists ✅ + `createBin(data)` exists
2. **WhLocAislesTab** → `warehouseApi.listAisles(warehouseId)` exists + `createAisle(data)` (add to client)
3. **WhLocRacksTab** → `warehouseApi.listRacks(warehouseId)` exists + `createRack(data)` (add to client)
4. **WhLocCapacityTab** → Compute from bins data (utilization %)
5. **WhLocOverviewTab** → Compute from bins/aisles/racks counts

#### R4.4 Add Edit / Delete / Transition / Detail Flows

For each module that has Create wired, add:
- **Edit**: Click row → open dialog pre-filled → PATCH endpoint
- **Delete**: Click delete button → AlertDialog confirmation → DELETE endpoint
- **Transition**: Click transition button → show allowed transitions → POST transition endpoint
- **Detail Drawer**: Click row → open Sheet/Drawer with full record + related data

Modules needing these flows:
1. **ProductMaster** — Edit (PATCH), Delete (DELETE), Transition (6 states), Detail Drawer (with barcodes, category, brand, UOM)
2. **PlantMaster** — Transition (5 states), Detail Card (already shows detail). Edit/Delete need backend (MISSING [A5]).
3. **BusinessPartner** (BPPartnersTab) — Edit (PATCH customer/supplier), Delete (DELETE), Transition (7 customer states / 8 supplier states), Detail Drawer (with contacts, addresses, credit, compliances)
4. **Warehouse** (WarehouseWarehousesTab) — Detail Card (already shows). Edit/Delete/Transition need backend (MISSING [A6]).

---

### Phase R5: Fix Backend Bugs (4 hours)

**Problem**: 3 broken workflows + 2 permission proxy bugs.

**Action**:

#### R5.1 Fix GST Taxation Workflow Name Mismatch
File: `apps/backend/src/modules/gst-taxation/workflow/index.ts`
Change: Rename registered workflow from `TaxReturnLifecycle` to `GstConfigurationLifecycle`
(OR change service line 337 to look up `TaxReturnLifecycle`)
Effort: 1 line

#### R5.2 Create Product Costing Workflow
File: `apps/backend/src/modules/product-costing/workflow/index.ts` (NEW — copy pattern from gst-taxation)
Register: `ProductCostLifecycle` with states DRAFT, CALCULATED, APPROVED, POSTED, ARCHIVED
Effort: ~20 lines

#### R5.3 Create CRM Foundation Workflow
File: `apps/backend/src/modules/crm-foundation/workflow/index.ts` (NEW)
Register: `CrmActivityLifecycle` with states DRAFT, IN_PROGRESS, COMPLETED, CANCELLED
Effort: ~20 lines

#### R5.4 Fix Customer Route Permissions
File: `apps/backend/src/modules/customer/routes/index.ts` lines 51-54
Change: `CUSTOMER_READ = Permission.ORG_READ` → `CUSTOMER_READ = Permission.CUSTOMER_READ` (4 lines)
Effort: 4 lines

#### R5.5 Fix Finance Module Write Permissions
Files: `gst-taxation/routes/index.ts`, `product-costing/routes/index.ts`, `general-ledger/routes/index.ts` line 25-26
Change: `WRITE_PERM = AUDIT_READ` → `WRITE_PERM = AUDIT_READ_CRITICAL`
Effort: 3 lines (1 per module)

---

### Phase R6: Remove All Placeholder Buttons (4 hours)

**Problem**: 30+ buttons emit `pushToast('info', '...')` which is a placeholder strategy forbidden by the new policy.

**Action**:

For each placeholder button:
1. **If backend exists** → Wire to real functionality (create dialog, edit dialog, transition menu, etc.)
2. **If backend does not exist** → Either:
   - Remove the button entirely, OR
   - Disable the button with `disabled` prop + `<Tooltip>` explaining "Requires backend endpoint: POST /api/v1/..."

**Buttons to wire to real functionality** (backend exists):
- "New Price List" → Create dialog using `pricingApi.createPriceList()`
- "New Tax Group" → Create dialog using `pricingApi.createTaxConfig()`
- "New Promotion" → Create dialog using `pricingApi.createPromotion()`
- "Generate Barcode" → Dialog using `productApi.addBarcode()`
- "New Contact" (BP) → Dialog using `customerApi.addContact()` or `supplierApi.addContact()`
- "New Address" (BP) → Dialog using `customerApi.addAddress()` or `supplierApi.addAddress()`
- "Add Compliance" (BP) → Dialog using `supplierApi.addCompliance()`
- "New Group" (BP) → Dialog using `customerApi.createGroup()` or `supplierApi.createCategory()`
- "Advance Stage" (Commercial approvals) → Transition menu (but NO backend for approval workflow — disable + tooltip)
- "Transition" (Governance lifecycle) → Per-entity transition (use respective entity's transition endpoint)

**Buttons to disable + document** (backend missing):
- "New Discount" → NO backend (documented in MISSING_BACKEND_ITEMS)
- "Schedule Price Change" → NO backend
- "New Rule" (Commercial) → NO backend
- "Generate QR" → NO backend
- "New Batch" → Backend exists (inventory stock-in creates batches) — redirect to inventory module
- "New Lot" → NO backend
- "Assign Serial" → NO backend
- "New GS1 ID" → NO backend
- "New Template" (Labels) → NO backend
- "New Print Job" → NO backend
- "New Workflow" (Governance) → NO backend
- "New Import" → NO backend
- "New Export" → NO backend
- "New Rule" (Governance validation) → NO backend
- "Scan Duplicates" → NO backend
- "Merge" → NO backend
- "Rollback" → NO backend
- "Add Bank Account" → NO backend
- "New Relationship" → NO backend
- "New Scorecard" → NO backend

---

### Phase R7: Add Missing Enterprise Features (30 hours)

#### R7.1 Detail Drawers (using shadcn `<Sheet>`)
For every list view, add a detail drawer that opens on row click:
- ProductMaster: Show product detail + barcodes + category + brand + UOM + lifecycle history
- PlantMaster: Show plant detail + departments + lines (already partially done)
- BusinessPartner: Show partner detail + contacts + addresses + credit + compliances + groups + scorecard
- Warehouse: Show warehouse detail + zones + bins summary

#### R7.2 Edit Dialogs
For every entity with a Create dialog, add an Edit dialog (same form, pre-filled, PATCH instead of POST):
- ProductMaster: Edit product (28 fields)
- PlantMaster: Edit plant (8 fields) — needs backend [A5]
- BusinessPartner: Edit customer (22 fields) / Edit supplier (23 fields)

#### R7.3 Delete with Confirmation (using shadcn `<AlertDialog>`)
For every entity, add delete with confirmation:
- ProductMaster: Delete product (cannot delete ACTIVE — show warning)
- BusinessPartner: Delete customer (cannot delete ACTIVE or with outstanding balance) / Delete supplier (cannot delete ACTIVE)
- Company (OrganizationModule): Delete company (cannot delete with children)

#### R7.4 Lifecycle Transition Menu
For every entity with a workflow, add a transition dropdown:
- ProductMaster: DRAFT → REVIEW → APPROVED → ACTIVE → DISCONTINUED → ARCHIVED
- BusinessPartner (Customer): LEAD → PROSPECT → APPROVED → ACTIVE → BLOCKED → INACTIVE → ARCHIVED
- BusinessPartner (Supplier): DRAFT → VERIFICATION → APPROVED → ACTIVE → PROBATION → BLOCKED → BLACKLISTED → ARCHIVED
- PlantMaster: DRAFT → CONFIGURED → ACTIVE → SUSPENDED → ARCHIVED

#### R7.5 Search + Filter + Pagination on Every List
- Debounced search (use `useDebouncedSearch` from `@/hooks/`)
- Status filter (dropdown)
- Type filter (dropdown)
- Pagination (shadcn `<Pagination>`)
- Page size selector

#### R7.6 Export to CSV
- Use shared `exportToCSV` from `@/lib/csv`
- Add export button to every list view

#### R7.7 Permission Gating on Every Button
- Use `useAuthStore().hasPermission(perm)` from `@/stores/auth-store`
- Gate every Create/Edit/Delete/Transition button
- Hide buttons user doesn't have permission for (NOT just disable)

#### R7.8 Loading / Error / Empty States
- Use shared components (to be created in `src/components/states.tsx`):
  - `<LoadingState />` — skeleton placeholders
  - `<ErrorState msg onRetry />` — error banner with retry
  - `<EmptyState icon title description action />` — empty state with CTA

#### R7.9 Audit Log Viewer (when REST endpoint is added)
- GovernanceModule.Audit tab → call `GET /api/v1/audit?entityType=Product&action=CREATE&page=1`
- Show timeline of changes with before/after diff

---

### Phase R8: Testing (10 hours)

#### R8.1 Frontend Unit Tests
- Test `src/lib/format.ts` (formatINR, formatDate, etc.)
- Test `src/lib/validate.ts` (GSTIN, PAN, email, phone, pincode)
- Test `src/lib/csv.ts` (exportToCSV)
- Test `src/hooks/use-list.ts` (pagination, search, error handling)
- Test `src/hooks/use-mutation.ts` (success/error toasts)

#### R8.2 Component Tests
- Test ProductMaster create flow (fill form → submit → verify API call)
- Test PlantMaster create flow
- Test BusinessPartner list (verify customer + supplier merge)
- Test permission gating (render with/without permission)

#### R8.3 Integration Tests
- Test full CRUD lifecycle: Create product → Edit → Transition → Delete
- Test supplier blacklist flow
- Test customer credit status lookup

---

## 4. Effort Summary

| Phase | Description | Hours | Running Total |
|---|---|---|---|
| R1 | Fix broken toast system | 1 | 1 |
| R2 | Promote shared code to src/lib and src/hooks | 4 | 5 |
| R3 | Adopt shadcn primitives (replace manual impls) | 8 | 13 |
| R4 | Wire every existing backend endpoint | 20 | 33 |
| R5 | Fix backend bugs (3 workflows + 2 permissions) | 4 | 37 |
| R6 | Remove all placeholder buttons | 4 | 41 |
| R7 | Add missing enterprise features (drawers, edit, delete, transition, etc.) | 30 | 71 |
| R8 | Testing | 10 | 81 |
| **TOTAL** | | **81 hours** | |

> Compare to prior estimate of 180-220 hours. The reduction comes from:
> - Reusing 186 existing endpoints (NOT building 80 new ones)
> - Reusing shadcn primitives (NOT building custom components)
> - Reusing existing hooks/utils (promoted to shared, NOT rewritten)
> - Fixing 5 backend bugs (NOT building new backend modules)

---

## 5. Production Readiness Scorecard (Target)

| Module | Current | Target After Recovery | How |
|---|---|---|---|
| ProductMaster | 7.5 | **9.5** | Add edit/delete/transition/detail drawer, real form validation |
| PIM | 5.5 | **8.5** | Wire compliance + approvals (document as missing), live families |
| CommercialEngine | 4.0 | **8.0** | Wire 4 tabs with backend, 5 tabs documented as missing |
| BusinessPartner | 5.5 | **9.0** | Wire 6 tabs with backend, 3 tabs documented as missing, add CRUD + transition |
| Identification | 3.5 | **7.0** | Wire 2 tabs with backend, 7 tabs documented as missing |
| Governance | 3.5 | **7.0** | 1 tab wired (audit — pending REST endpoint), 9 tabs documented as missing |
| Warehouse | 4.5 | **8.5** | Wire 4 tabs, add bin/zone/aisle/rack CRUD |
| WarehouseLocation | 2.0 | **8.5** | Wire all 5 tabs to warehouseApi |
| PlantMaster | 7.5 | **8.5** | Add transition (edit/delete pending backend [A5]) |
| **Overall** | **6.5** | **8.5** | (Limited to 8.5 because some backend gaps remain) |

> **Note**: Overall target is 8.5, not 9.5, because 18 genuinely missing backend endpoints (Section A of MISSING_BACKEND_ITEMS) cannot be worked around. To reach 9.5+, those endpoints must be built (additional ~40 hours of backend work).

---

## 6. Approval Gates

This recovery plan has 8 phases. After each phase, verify the build passes and report progress:

1. **Phase R1 complete** → verify toasts visible → report
2. **Phase R2 complete** → verify no `../utils/helpers` or `../hooks/use-master-data` imports remain → report
3. **Phase R3 complete** → verify no raw `<table>`, `<select>`, manual tab bars remain → report
4. **Phase R4 complete** → verify all 27 client methods added, all wireable tabs wired → report
5. **Phase R5 complete** → verify backend bugs fixed (run transition endpoints) → report
6. **Phase R6 complete** → verify zero `pushToast('info', ...)` calls remain → report
7. **Phase R7 complete** → verify all CRUD/transition/detail flows work → report
8. **Phase R8 complete** → verify test coverage → report

**STOP after each phase for approval. Do NOT proceed to the next phase without explicit approval.**

---

## 7. What Will NOT Be Done in This Recovery

1. **NO Section 04 work** — Section 03 must reach target first
2. **NO new backend endpoints** — only fix the 5 broken ones (Phase R5). The 18 genuinely missing endpoints (Section A of MISSING_BACKEND_ITEMS) are documented but NOT built in this recovery. They require separate approval.
3. **NO redesign** — UI remains pixel-identical; only shadcn primitives replace manual implementations
4. **NO new modules** — work within the existing 9 Section 03 components

---

**END OF RECOVERY PLAN — AWAITING APPROVAL TO BEGIN PHASE R1**

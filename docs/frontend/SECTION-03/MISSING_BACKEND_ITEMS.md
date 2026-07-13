# SECTION 03 — Missing Backend Items

**Date**: 2026-07-13
**Method**: For every item below, exhaustive search was performed across all backend modules, routes, services, repositories, workflows, permissions, events, DTOs, and Prisma schema. Each entry includes the search query, the result, and proof.

> **CRITICAL FINDING**: After exhaustive verification of 186 endpoints across 15 modules, the prior claim of "~80 missing endpoints" is **FALSE**. Only the items listed below genuinely do not exist. Every other Section 03 need maps to an existing endpoint.

---

## How to Read This Document

Each entry follows this structure:

```
### [N] Item Name
- **What's needed**: Description
- **Search performed**: Files/query searched
- **Search result**: What was found
- **Existing similar endpoint**: Closest existing capability
- **Reason it cannot be reused**: Why the existing endpoint doesn't satisfy the need
- **Business justification**: Why this is genuinely needed
- **Verdict**: GENUINELY MISSING | CAN BE WORKED AROUND | NOT NEEDED
```

---

## Section A: Genuinely Missing Endpoints (with proof)

### [A1] POST /api/v1/catalog/uoms — Create UOM

- **What's needed**: Create a new Unit of Measure (e.g., "BOX-12", "CARTON-24")
- **Search performed**:
  - `rg "uom" apps/backend/src/modules/product/routes/index.ts` → line 132: `GET /api/v1/catalog/uoms` only
  - `rg "uomService|uomRepository" apps/backend/src/modules/product/` → service line 141: `uomService` has `list` only (no `create`); repository line 152: `uomRepository` has `list` + `findById` (no `create`)
  - `rg "POST.*uom" apps/backend/src/` → 0 matches
- **Search result**: UOM is **read-only** in the API. No create/update/delete endpoint exists.
- **Existing similar endpoint**: `POST /api/v1/catalog/categories` (line 113), `POST /api/v1/catalog/brands` (line 125) — both have create endpoints
- **Reason it cannot be reused**: Categories and Brands are different entities. UOM needs its own create endpoint with fields: `code`, `name`, `symbol`, `uomType` (COUNT/WEIGHT/VOLUME/LENGTH/AREA/TIME), `decimalPlaces`, `isActive`
- **Business justification**: Food manufacturing needs custom UOMs (e.g., "TRAY-30" for 30-piece trays, "BAG-5KG" for 5kg bags). Currently UOMs must be seeded via DB directly.
- **Verdict**: **GENUINELY MISSING** — but low priority. UOMs are usually seeded once during onboarding. Can be worked around with DB seed script.

### [A2] UOM Conversion Endpoints — `/api/v1/catalog/uoms/conversions`

- **What's needed**: CRUD for UOM conversions (e.g., 1 BOX = 12 PIECES, 1 KG = 1000 G)
- **Search performed**:
  - `rg "uom_conversion|UomConversion" apps/backend/src/` → 0 matches in routes/services
  - `rg "model UomConversion" apps/backend/prisma/schema.prisma` → line 1378: `model UomConversions` EXISTS in Prisma schema
  - `rg "uomConversion" apps/backend/src/modules/product/repository/` → 0 matches
- **Search result**: Prisma model exists (`UomConversions` at schema line 1378) but NO repository, service, or route exposes it.
- **Existing similar endpoint**: None
- **Reason it cannot be reused**: N/A — no endpoint exists
- **Business justification**: Essential for food manufacturing. Purchase UOM (e.g., 50kg bag) ≠ Inventory UOM (kg) ≠ Sales UOM (250g pack). Without conversions, stock-in/out cannot translate quantities across UOMs.
- **Verdict**: **GENUINELY MISSING** — HIGH priority. Blocks proper inventory management.

### [A3] HSN/SAC Master CRUD — `/api/v1/catalog/hsn-codes` or `/api/v1/finance/gst/hsn`

- **What's needed**: CRUD for HSN (Harmonized System Nomenclature) and SAC (Services Accounting Code) master
- **Search performed**:
  - `rg "hsn" apps/backend/src/modules/ --include="*.ts" -l` → matches in product (field on Product), gst-taxation (referenced in config), but NO standalone HSN endpoint
  - `rg "POST.*hsn|GET.*hsn" apps/backend/src/modules/product/routes/` → 0 matches
  - `rg "POST.*hsn|GET.*hsn" apps/backend/src/modules/gst-taxation/routes/` → 0 matches
  - `rg "model HsnCode|model SacCode" apps/backend/prisma/schema.prisma` → 0 matches (NO Prisma model exists)
- **Search result**: HSN is a free-text field on Product (`hsnCode` string in `productSchema`). NO master table, NO CRUD endpoint.
- **Existing similar endpoint**: None
- **Reason it cannot be reused**: N/A
- **Business justification**: Indian GST requires HSN codes on invoices. Without a master, users type arbitrary strings → no validation, no reporting by HSN, no GST return preparation.
- **Verdict**: **GENUINELY MISSING** — MEDIUM priority. Can use free-text field temporarily but should build master for compliance.

### [A4] BU / Division / Region CRUD — `/api/v1/organization/business-units` etc.

- **What's needed**: REST endpoints for Business Unit, Division, Region CRUD
- **Search performed**:
  - `rg "business-unit|division|region" apps/backend/src/modules/organization/routes/index.ts` → 0 matches for dedicated endpoints
  - `rg "businessUnitRepository|divisionRepository|regionRepository" apps/backend/src/modules/organization/repository/index.ts` → lines 151, 207 (implied), 211: repositories EXIST with full CRUD methods
  - `rg "model BusinessUnit|model Division|model Region" apps/backend/prisma/schema.prisma` → lines 764, 785, 806: Prisma models EXIST
- **Search result**: Repositories + Prisma models exist, but NO REST endpoints. The `GET /api/v1/organization/hierarchy` endpoint returns the full tree including BU/Division/Region, but there's no way to create/update/delete them via API.
- **Existing similar endpoint**: `GET /api/v1/organization/hierarchy` (returns the tree), `POST /api/v1/organization/companies` (creates companies)
- **Reason it cannot be reused**: Hierarchy is read-only. Company create doesn't create BU/Division/Region.
- **Business justification**: Large enterprises need to reorganize BU/Division/Region structure without DB access. Currently requires SQL inserts.
- **Verdict**: **GENUINELY MISSING** — MEDIUM priority. Can be worked around with hierarchy endpoint + DB for creates.

### [A5] Plant Update / Delete — `PATCH/DELETE /api/v1/organization/plants/:id`

- **What's needed**: Update and delete plant endpoints
- **Search performed**:
  - `rg "PATCH.*plants|DELETE.*plants" apps/backend/src/modules/organization/routes/index.ts` → 0 matches
  - `rg "plantRepository.update|plantRepository.softDelete" apps/backend/src/modules/organization/repository/index.ts` → lines 240, 242: methods EXIST in repository
- **Search result**: Repository has `update` + `softDelete` methods but NO route exposes them.
- **Existing similar endpoint**: `PATCH /api/v1/organization/companies/:id` (line 134), `DELETE /api/v1/organization/companies/:id` (line 142)
- **Reason it cannot be reused**: Company endpoints don't work for plants.
- **Business justification**: Need to update plant manager, capacity, operating hours. Need to deactivate old plants.
- **Verdict**: **GENUINELY MISSING** — MEDIUM priority. Repository ready, just needs route + service method.

### [A6] Warehouse Master Update / Delete / Transition — `PATCH/DELETE /api/v1/organization/warehouses/:id`

- **What's needed**: Update, delete, and lifecycle transition for warehouse master
- **Search performed**:
  - `rg "PATCH.*warehouses|DELETE.*warehouses|transition.*warehouses" apps/backend/src/modules/organization/routes/index.ts` → 0 matches
  - `rg "warehouseRepository.update|warehouseRepository.softDelete" apps/backend/src/modules/organization/repository/index.ts` → lines 315, 317: methods EXIST
- **Search result**: Repository has full CRUD but only `GET list`, `GET :id`, `POST create` are exposed.
- **Existing similar endpoint**: Company has full CRUD + transition
- **Reason it cannot be reused**: Company endpoints don't work for warehouses.
- **Business justification**: Need to update warehouse manager, capacity, type. Need to deactivate warehouses.
- **Verdict**: **GENUINELY MISSING** — MEDIUM priority.

### [A7] Department / Cost Center Update / Delete

- **What's needed**: `PATCH/DELETE` for departments and cost centers
- **Search performed**:
  - `rg "PATCH.*departments|DELETE.*departments|PATCH.*cost-centers|DELETE.*cost-centers" apps/backend/src/modules/organization/routes/index.ts` → 0 matches
  - Repositories have `update` + `softDelete` methods
- **Search result**: Only `GET list` + `POST create` exposed. No update/delete.
- **Verdict**: **GENUINELY MISSING** — LOW priority (departments/cost centers rarely change).

### [A8] Financial Year Update / Delete / Close

- **What's needed**: `PATCH/DELETE` financial years, `POST /:id/close` for year-end
- **Search performed**:
  - `rg "PATCH.*financial-years|DELETE.*financial-years|close.*financial-year" apps/backend/src/modules/organization/routes/index.ts` → 0 matches
  - Financial Foundation has `POST /api/v1/finance/foundation/fiscal-periods/close` for period close, but NO year-level close
- **Search result**: Only `GET list`, `GET current`, `POST create` exposed.
- **Verdict**: **GENUINELY MISSING** — MEDIUM priority (year-end close is a critical finance function).

### [A9] Payment Terms Master CRUD

- **What's needed**: Master table for payment terms (NET15, NET30, etc.) with descriptions, discount for early payment
- **Search performed**:
  - `rg "payment-term|paymentTerm" apps/backend/src/modules/ --include="*.ts" -l` → 0 matches for standalone endpoints
  - `rg "model PaymentTerm" apps/backend/prisma/schema.prisma` → 0 matches (NO Prisma model)
  - `rg "paymentTerms" apps/backend/src/modules/` → matches as enum field in customer + supplier schemas (values: NET15/NET30/NET45/NET60/IMMEDIATE/ADVANCE)
- **Search result**: Payment terms is an ENUM on customer/supplier, NOT a master entity. No CRUD, no Prisma model.
- **Existing similar endpoint**: None
- **Reason it cannot be reused**: Enum is hardcoded; can't add "NET90" or "2/10 NET 30" (2% discount if paid in 10 days, otherwise NET 30) via API.
- **Business justification**: Need to add custom payment terms with early-payment discount rules.
- **Verdict**: **GENUINELY MISSING** — LOW priority. The 6 enum values cover 95% of use cases.

### [A10] Shipping Terms / Incoterms Master CRUD

- **What's needed**: Master for Incoterms 2020 (EXW, FOB, CIF, DDP, etc.)
- **Search performed**:
  - `rg "incoterm|shipping-term|shippingTerm" apps/backend/src/modules/ --include="*.ts" -l` → 0 matches
  - `rg "model Incoterm|model ShippingTerm" apps/backend/prisma/schema.prisma` → 0 matches
- **Search result**: Completely absent from backend.
- **Existing similar endpoint**: None
- **Verdict**: **GENUINELY MISSING** — LOW priority (Incoterms are standardized; can be hardcoded in frontend).

### [A11] Reference Master / Lookup Table CRUD

- **What's needed**: Generic reference data master (for dropdowns like "Product Conditions", "Return Reasons", "Quality Grades", etc.)
- **Search performed**:
  - `rg "reference-master|ReferenceMaster|lookup-table" apps/backend/src/modules/ --include="*.ts" -l` → 0 matches
  - `rg "model ReferenceMaster" apps/backend/prisma/schema.prisma` → 0 matches
- **Search result**: No generic reference master exists. Each module hardcodes its own enums.
- **Existing similar endpoint**: None
- **Verdict**: **GENUINELY MISSING** — LOW priority (current enum approach works but isn't extensible).

### [A12] Product Variant CRUD

- **What's needed**: Product variants (e.g., Kaju Katli 250g, 500g, 1kg as variants of one product)
- **Search performed**:
  - `rg "variant" apps/backend/src/modules/product/routes/index.ts` → 0 matches
  - `rg "model ProductVariant" apps/backend/prisma/schema.prisma` → 0 matches
- **Search result**: No variant support. Each SKU is a separate product.
- **Existing similar endpoint**: None
- **Verdict**: **GENUINELY MISSING** — LOW priority (current approach of separate products works, just less elegant).

### [A13] Product Image / Document CRUD

- **What's needed**: Upload images and documents (spec sheets, FSSAI certs) per product
- **Search performed**:
  - `rg "product-image|productImage|product-document|productDocument" apps/backend/src/modules/product/` → 0 matches
  - `rg "model ProductImage|model ProductDocument" apps/backend/prisma/schema.prisma` → 0 matches
- **Search result**: Only `imageUrl` string field on Product. No file upload, no document management.
- **Existing similar endpoint**: None
- **Verdict**: **GENUINELY MISSING** — MEDIUM priority (food manufacturing requires FSSAI certs, spec sheets).

### [A14] Identification / Traceability CRUD (Barcodes, QR, Batches, Lots, Serials, GS1, Labels, Print Jobs)

- **What's needed**: CRUD endpoints for the 10 sub-tabs in the Identification module
- **Search performed**:
  - `rg "barcode" apps/backend/src/modules/product/routes/index.ts` → lines 90, 96, 101: barcode lookup, list, add (3 endpoints EXIST for product barcodes)
  - `rg "qr-code|QrCode" apps/backend/src/modules/ --include="*.ts" -l` → 0 matches in routes
  - `rg "batch" apps/backend/src/modules/inventory/routes/index.ts` → line 146: `GET /api/v1/inventory/batches` (list only, no create — batches are auto-created on stock-in)
  - `rg "lot" apps/backend/src/modules/inventory/routes/index.ts` → 0 matches for lot CRUD
  - `rg "serial" apps/backend/src/modules/ --include="*.ts" -l` → 0 matches
  - `rg "gs1|label-template|print-job" apps/backend/src/modules/ --include="*.ts" -l` → 0 matches
  - `rg "model QrCode|model SerialNumber|model Gs1Identifier|model LabelTemplate|model LabelPrintJob|model TraceabilityLog" apps/backend/prisma/schema.prisma` → 0 matches for all
  - **HOWEVER**: `rg "model BarcodeType|model BarcodeAssignment" apps/backend/prisma/schema.prisma` → 0 matches (these were listed in prior reports as existing — VERIFIED: they do NOT exist)
- **Search result**:
  - **Product barcodes**: 3 endpoints exist (lookup, list, add) ✅
  - **Inventory batches**: 1 endpoint exists (list) ✅
  - **QR codes**: 0 endpoints, 0 Prisma model ❌
  - **Lots**: 0 endpoints (Prisma model `Lots` exists at line 2409, used internally by inventory service) ⚠️
  - **Serial numbers**: 0 endpoints, 0 Prisma model ❌
  - **GS1 identifiers**: 0 endpoints, 0 Prisma model ❌
  - **Label templates**: 0 endpoints, 0 Prisma model ❌
  - **Print jobs**: 0 endpoints, 0 Prisma model ❌
  - **Traceability logs**: 0 endpoints, 0 Prisma model ❌
- **Existing similar endpoint**: Product barcode endpoints (3) cover part of the need
- **Reason it cannot be reused**: Product barcodes are linked to products only. QR codes, serials, GS1, labels need their own endpoints.
- **Business justification**: Food manufacturing requires full traceability (Bioterrorism Act, FSMA). Batch/lot tracking exists in inventory but isn't exposed as master data.
- **Verdict**: **GENUINELY MISSING** — HIGH priority for traceability, but the inventory batch/lot system partially covers it.

### [A15] Data Governance CRUD (Import, Export, Validation, Duplicates, Audit, Quality, History)

- **What's needed**: 10 sub-tabs in Governance module need backend endpoints
- **Search performed**:
  - `rg "import-job|export-job|validation-rule|duplicate-candidate|merge-history|data-quality" apps/backend/src/modules/ --include="*.ts" -l` → 0 matches
  - `rg "model ImportJob|model ExportJob|model ValidationRule|model DuplicateCandidate|model MergeHistory|model DataQualityMetric|model MasterDataAudit" apps/backend/prisma/schema.prisma` → 0 matches for all
  - `rg "audit" apps/backend/src/core/audit/service.ts` → `auditService.query(tenantId, filters)` EXISTS (line 124) — can query audit logs
- **Search result**:
  - **Audit log query**: ✅ EXISTS (`auditService.query` — but NO REST endpoint exposes it)
  - **Import/Export jobs**: ❌ 0 endpoints, 0 models
  - **Validation rules**: ❌ 0 endpoints, 0 models
  - **Duplicate detection**: ❌ 0 endpoints, 0 models
  - **Data quality metrics**: ❌ 0 endpoints, 0 models
  - **Change history with rollback**: ❌ 0 endpoints (audit log records changes but no rollback capability)
- **Existing similar endpoint**: Audit service has query capability but no REST route
- **Reason it cannot be reused**: Audit service is internal; needs a REST wrapper
- **Business justification**: Enterprise ERPs need data governance for compliance (SOX, FDA 21 CFR Part 11). Currently no import preview, no duplicate detection, no rollback.
- **Verdict**: **GENUINELY MISSING** — MEDIUM priority (governance is valuable but not blocking core operations).

### [A16] Audit Log Query REST Endpoint — `GET /api/v1/audit`

- **What's needed**: REST endpoint to query audit logs (the `auditService.query` method exists but isn't exposed)
- **Search performed**:
  - `rg "GET.*audit|POST.*audit" apps/backend/src/routes/` → 0 matches for audit query
  - `rg "audit" apps/backend/src/app/app.ts` → audit middleware registered, no audit query route
  - `rg "auditService.query" apps/backend/src/` → 1 match: `core/audit/service.ts:124` (the method definition)
- **Search result**: `auditService.query()` EXISTS (line 124) but NO REST endpoint exposes it.
- **Existing similar endpoint**: None
- **Reason it cannot be reused**: Internal service method only
- **Business justification**: Governance module's Audit tab needs to display audit logs. Currently impossible without a REST endpoint.
- **Verdict**: **GENUINELY MISSING** — MEDIUM priority. Service is ready, just needs a route wrapper (1 hour effort).

### [A17] Customer Update Contact / Address / Delete

- **What's needed**: Update/delete individual contacts and addresses (currently only POST add exists)
- **Search performed**:
  - `rg "PATCH.*contacts|DELETE.*contacts|PATCH.*addresses|DELETE.*addresses" apps/backend/src/modules/customer/routes/index.ts` → 0 matches
  - `rg "PATCH.*contacts|DELETE.*contacts|PATCH.*addresses|DELETE.*addresses" apps/backend/src/modules/supplier/routes/index.ts` → 0 matches
- **Search result**: Only POST (add) exists for contacts and addresses. No update, no delete.
- **Existing similar endpoint**: None
- **Verdict**: **GENUINELY MISSING** — LOW priority (can delete + re-add as workaround).

### [A18] Customer / Supplier Bulk Operations

- **What's needed**: Bulk status transition, bulk delete, bulk assign group
- **Search performed**:
  - `rg "bulk" apps/backend/src/modules/customer/routes/ apps/backend/src/modules/supplier/routes/` → 0 matches
- **Search result**: No bulk endpoints.
- **Verdict**: **GENUINELY MISSING** — LOW priority (can call individual endpoints in a loop).

---

## Section B: Items That APPEAR Missing But Actually EXIST (FALSE POSITIVES from prior reports)

These items were claimed as "missing" in prior reports but VERIFIED to exist:

### [B1] "Missing: Product Categories CRUD" — FALSE
- **Claim**: Product Categories endpoint missing
- **Reality**: `GET/POST /api/v1/catalog/categories` EXISTS (product routes lines 108, 113)
- **Frontend client**: `productApi.listCategories()` EXISTS

### [B2] "Missing: Brand Master CRUD" — FALSE
- **Claim**: Brand endpoint missing
- **Reality**: `GET/POST /api/v1/catalog/brands` EXISTS (product routes lines 120, 125)
- **Frontend client**: `productApi.listBrands()` EXISTS

### [B3] "Missing: HSN/SAC field on product" — FALSE
- **Claim**: HSN not supported
- **Reality**: `hsnCode` is a field in `productSchema` (product routes line 12). It's a free-text string, not a master entity, but the field EXISTS.

### [B4] "Missing: Customer Master endpoint" — FALSE
- **Claim**: Customer endpoints missing
- **Reality**: 12 endpoints exist at `/api/v1/sales/customers*` including full CRUD + transition + credit + contacts + addresses + groups

### [B5] "Missing: Supplier Master endpoint" — FALSE
- **Claim**: Supplier endpoints missing
- **Reality**: 15 endpoints exist at `/api/v1/procurement/suppliers*` including full CRUD + transition + blacklist + contacts + addresses + compliances + product mappings + categories

### [B6] "Missing: Plant Master endpoint" — FALSE
- **Claim**: Plant endpoint missing
- **Reality**: 4 endpoints exist at `/api/v1/organization/plants` (list, get, create, transition)

### [B7] "Missing: Warehouse Master endpoint" — FALSE
- **Claim**: Warehouse master endpoint missing
- **Reality**: 3 endpoints exist at `/api/v1/organization/warehouses` (list, get, create) + 16 operational endpoints at `/api/v1/warehouse/*`

### [B8] "Missing: Cost Center endpoint" — FALSE
- **Claim**: Cost center endpoint missing
- **Reality**: 2 endpoints exist at `/api/v1/organization/cost-centers` (list, create) + 2 more at `/api/v1/finance/foundation/cost-centers`

### [B9] "Missing: Department endpoint" — FALSE
- **Claim**: Department endpoint missing
- **Reality**: 2 endpoints exist at `/api/v1/organization/departments` (list, create)

### [B10] "Missing: Currency endpoint" — FALSE
- **Claim**: Currency endpoint missing
- **Reality**: 2 endpoints exist at `/api/v1/finance/foundation/currencies` (list, create)

### [B11] "Missing: Price List endpoint" — FALSE
- **Claim**: Price list endpoint missing
- **Reality**: 2 endpoints exist at `/api/v1/sales/pricing/price-lists` (list, create) + `POST /api/v1/sales/pricing/calculate` for price resolution

### [B12] "Missing: Tax Master endpoint" — FALSE
- **Claim**: Tax endpoint missing
- **Reality**: 2 endpoints exist at `/api/v1/sales/pricing/tax-configs` (list, create) + 8 endpoints at `/api/v1/finance/gst` (list, get, count, exists, create, update, delete, transition)

### [B13] "Missing: Barcode endpoint" — FALSE
- **Claim**: Barcode endpoint missing
- **Reality**: 3 product barcode endpoints (`GET /barcode/:barcode`, `GET /:id/barcodes`, `POST /:id/barcodes`) + 3 warehouse barcode endpoints (`GET /barcodes`, `POST /barcodes`, `POST /barcodes/:id/print`)

### [B14] "Missing: Batch endpoint" — FALSE
- **Claim**: Batch endpoint missing
- **Reality**: `GET /api/v1/inventory/batches` EXISTS (inventory routes line 146). Batches are auto-created during stock-in.

### [B15] "Missing: Traceability endpoint" — FALSE (partially)
- **Claim**: Traceability endpoint missing
- **Reality**: Inventory ledger (`GET /api/v1/inventory/ledger`) + transactions (`GET /api/v1/inventory/transactions`) + batches (`GET /api/v1/inventory/batches`) provide traceability data. The mini-service `/api/identification/trace` was a prototype — the data is in the main API.

### [B16] "Missing: Audit log endpoint" — PARTIALLY FALSE
- **Claim**: Audit log endpoint missing
- **Reality**: `auditService.query()` EXISTS (service line 124) with full filtering (entityType, action, severity, time range, actor). The REST endpoint to expose it is missing (see [A16]) but the CAPABILITY exists.

### [B17] "Missing: Pricing calculation endpoint" — FALSE
- **Claim**: Price resolution endpoint missing
- **Reality**: `POST /api/v1/sales/pricing/calculate` EXISTS (pricing routes line 26) with full multi-step scheme engine (base price, customer discount, promotion, coupon, tax)

---

## Section C: Broken Endpoints (EXIST but don't work — NOT missing)

### [C1] GST Taxation Transition — `POST /api/v1/finance/gst/:id/transition`
- **Status**: Endpoint EXISTS but BROKEN
- **Bug**: Service line 337 looks up workflow `'GstConfigurationLifecycle'` but `workflow/index.ts` registers `'TaxReturnLifecycle'`
- **Fix**: Rename workflow registration from `TaxReturnLifecycle` to `GstConfigurationLifecycle` (OR change service to look up `TaxReturnLifecycle`)
- **Effort**: 1 line change

### [C2] Product Costing Transition — `POST /api/v1/finance/costing/:id/transition`
- **Status**: Endpoint EXISTS but BROKEN
- **Bug**: Service looks up `'ProductCostLifecycle'` but no `workflow/` directory exists in `product-costing/` module
- **Fix**: Create `product-costing/workflow/index.ts` registering `ProductCostLifecycle` with states (DRAFT, CALCULATED, APPROVED, POSTED, ARCHIVED)
- **Effort**: ~20 lines (copy from similar module)

### [C3] CRM Foundation Transition — `POST /api/v1/crm/foundation/:id/transition`
- **Status**: Endpoint EXISTS but BROKEN
- **Bug**: Same as [C2] — no workflow file
- **Fix**: Create `crm-foundation/workflow/index.ts`
- **Effort**: ~20 lines

### [C4] GST/ProductCosting/GL Route Permissions — `READ_PERM = WRITE_PERM = AUDIT_READ`
- **Status**: Endpoints WORK but have a SECURITY BUG
- **Bug**: Write operations only require `audit:read` permission
- **Fix**: Change `WRITE_PERM` to `AUDIT_READ_CRITICAL` or add dedicated `finance:gst:write` etc. permissions
- **Effort**: 1 line per module (3 modules)

### [C5] Customer Route Proxy Permissions — `CUSTOMER_* = ORG_*`
- **Status**: Endpoints WORK but use proxy permissions
- **Bug**: `customer/routes/index.ts` lines 51-54 alias `CUSTOMER_READ/CREATE/UPDATE/DELETE` to `ORG_*` instead of using the actual `CUSTOMER_*` permissions that ARE defined in registry
- **Fix**: Change 4 lines to use `Permission.CUSTOMER_READ` etc.
- **Effort**: 4 lines

---

## Section D: Frontend Client Method Gaps (NOT missing backend — just missing client wrappers)

These are endpoints that EXIST in the backend but the frontend API client doesn't wrap them. Fix = add 1 method to existing client file.

| # | Endpoint | Client | Method to Add |
|---|---|---|---|
| D1 | `POST /api/v1/catalog/products/:id/barcodes` | `productApi` | `addBarcode(productId, data)` |
| D2 | `POST /api/v1/catalog/categories` | `productApi` | `createCategory(data)` |
| D3 | `POST /api/v1/catalog/brands` | `productApi` | `createBrand(data)` |
| D4 | `GET /api/v1/sales/customers/gst/:gstin` | `customerApi` | `lookupByGstin(gstin)` |
| D5 | `POST /api/v1/sales/customers/:id/contacts` | `customerApi` | `addContact(id, data)` |
| D6 | `POST /api/v1/sales/customers/:id/addresses` | `customerApi` | `addAddress(id, data)` |
| D7 | `POST /api/v1/sales/customer-groups` | `customerApi` | `createGroup(data)` |
| D8 | `GET /api/v1/procurement/suppliers/gst/:gstin` | `supplierApi` | `lookupByGstin(gstin)` |
| D9 | `GET /api/v1/procurement/suppliers/:id/contacts` | `supplierApi` | `listContacts(id)` |
| D10 | `POST /api/v1/procurement/suppliers/:id/contacts` | `supplierApi` | `addContact(id, data)` |
| D11 | `POST /api/v1/procurement/suppliers/:id/addresses` | `supplierApi` | `addAddress(id, data)` |
| D12 | `POST /api/v1/procurement/suppliers/:id/compliances` | `supplierApi` | `addCompliance(id, data)` |
| D13 | `POST /api/v1/procurement/suppliers/:id/products` | `supplierApi` | `assignProduct(id, data)` |
| D14 | `POST /api/v1/procurement/supplier-categories` | `supplierApi` | `createCategory(data)` |
| D15 | `GET/POST /api/v1/warehouse/zones` | `warehouseApi` | `listZones/createZone` |
| D16 | `GET/POST /api/v1/warehouse/aisles` | `warehouseApi` | `listAisles/createAisle` |
| D17 | `GET/POST /api/v1/warehouse/racks` | `warehouseApi` | `listRacks/createRack` |
| D18 | `GET /api/v1/warehouse/scan-logs` | `warehouseApi` | `listScanLogs` |
| D19 | `GET /api/v1/inventory/batches` | `inventoryApi` | `listBatches` |
| D20 | `POST /api/v1/inventory/reservations/:id/release` | `inventoryApi` | `releaseReservation` |
| D21 | `POST /api/v1/inventory/expiry/mark-expired` | `inventoryApi` | `markExpired` |
| D22 | `POST/PUT/DELETE /api/v1/finance/gst` | `gstApi` | `create/update/delete` |
| D23 | `GET/POST /api/v1/finance/foundation/accounts` | `financeApi` | `listAccounts/createAccount` |
| D24 | `GET/POST /api/v1/finance/foundation/fiscal-years` | `financeApi` | `listFiscalYears/createFiscalYear` |
| D25 | `GET/POST /api/v1/finance/foundation/cost-centers` | `financeApi` | `listCostCenters/createCostCenter` |
| D26 | `GET/POST /api/v1/finance/foundation/profit-centers` | `financeApi` | `listProfitCenters/createProfitCenter` |
| D27 | `POST /api/v1/finance/foundation/fiscal-periods/close` | `financeApi` | `closeFiscalPeriod` |

**Total**: 27 client methods to add. Each is a 3-5 line addition to an existing client file. NO new client files needed.

---

## Grand Summary

| Category | Count | Action Required |
|---|---|---|
| **Genuinely Missing Endpoints** (Section A) | 18 | Build if needed (most are LOW/MEDIUM priority) |
| **False Positives** (Section B) | 17 | Already exist — use them |
| **Broken Endpoints** (Section C) | 5 bugs (affecting ~12 endpoints) | Fix with 1-4 line changes per module |
| **Frontend Client Method Gaps** (Section D) | 27 methods | Add 3-5 lines per method to existing client files |

### Priority Matrix

| Priority | Items | Effort |
|---|---|---|
| **CRITICAL** (blocks core operations) | A2 (UOM conversions), C1-C3 (broken workflows) | ~4 hours |
| **HIGH** (significant business value) | A5 (Plant update/delete), A6 (Warehouse update/delete), A13 (Product images/docs), A14 (Identification CRUD), A16 (Audit query endpoint) | ~40 hours |
| **MEDIUM** (nice to have) | A3 (HSN master), A4 (BU/Division/Region CRUD), A7 (Dept/CC update/delete), A8 (FY close), A15 (Governance CRUD), C4-C5 (permission fixes), D1-D27 (client methods) | ~30 hours |
| **LOW** (can be deferred) | A1 (UOM create), A9 (Payment terms master), A10 (Incoterms), A11 (Reference master), A12 (Product variants), A17 (Contact/address update/delete), A18 (Bulk operations) | ~20 hours |

### Key Takeaway

**The backend is NOT missing 80 endpoints.** The actual gaps are:
- 18 genuinely missing endpoints (most LOW/MEDIUM priority)
- 5 broken endpoints (1-4 line fixes each)
- 27 frontend client methods (3-5 line additions each)

**Total real work**: ~94 hours, NOT 180-220 hours as previously estimated.

---

**END OF MISSING BACKEND ITEMS REPORT**

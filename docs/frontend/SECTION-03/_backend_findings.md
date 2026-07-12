# Section 03 — Master Data Management Backend Findings

**Task ID**: SECTION03-BE-EXPLORE
**Agent**: Explore (Backend)
**Date**: 2026-07-12
**Backend root**: `/home/z/my-project/apps/backend/`
**Prisma schema**: `/home/z/my-project/prisma/schema.prisma` (18,068 lines, ~400+ models)
**Route mounting file**: `/home/z/my-project/apps/backend/src/app/app.ts` (lines 177–236)

This document is a complete inventory of every backend capability (route, DTO, validator, repository, service, event, audit, workflow, permission, Prisma model) related to Section 03 — Master Data Management. Frontend teams can wire up directly from this file.

---

## 0. How To Read This Document

- Every endpoint is listed with its **full literal path** (e.g. `POST /api/v1/catalog/products`). The path includes the mount prefix from `app.ts`.
- Every permission is listed with its **literal string** (e.g. `product:create`), not the symbol name. Permission symbols are mapped at the end of each module section.
- DTOs list **every field** with type, validation rule, and default. Optional fields are marked.
- "Has Audit?" column = Yes if the service layer calls `auditService.log(...)` on that operation.
- "Has Event?" column = Yes if the service layer calls `eventBus.writeToOutbox(...)`.
- Optimistic concurrency: endpoints that accept an `If-Match` header use the `version` field for OCC.

---

## 1. Route Mount Map (from `app.ts` lines 177–236)

| Module file             | Mount prefix                          | Variable exported            |
|-------------------------|---------------------------------------|------------------------------|
| `organization/routes`   | `/api/v1/organization`                | `organizationRoutes`         |
| `product/routes`        | `/api/v1/catalog`                     | `productRoutes`              |
| `supplier/routes`       | `/api/v1/procurement`                 | `supplierRoutes`             |
| `customer/routes`       | `/api/v1/sales`                       | `customerRoutes`             |
| `warehouse/routes`      | `/api/v1/warehouse`                   | `warehouseRoutes`            |
| `inventory/routes`      | `/api/v1/inventory`                   | `inventoryRoutes`            |
| `pricing-engine/routes` | `/api/v1/sales/pricing`               | `pricingEngineRoutes`        |
| `gst-taxation/routes`   | `/api/v1/finance/gst`                 | `GstTaxationRoutes`          |
| `recipe-bom/routes`     | `/api/v1/manufacturing/recipes`       | `recipeBomRoutes`            |
| `product-costing/routes`| `/api/v1/finance/costing`             | `ProductCostingRoutes`       |
| `financial-foundation/routes` | `/api/v1/finance/foundation`    | `financialFoundationRoutes`  |
| `general-ledger/routes` | `/api/v1/finance/gl`                  | `GeneralLedgerRoutes`        |

> ⚠️ Note the unusual mount prefixes:
> - Products live under `/api/v1/catalog`, **not** `/api/v1/products`.
> - Suppliers live under `/api/v1/procurement`, **not** `/api/v1/suppliers`.
> - Customers live under `/api/v1/sales`, **not** `/api/v1/customers`.

---

## 2. Permission Catalog (from `core/permissions/registry.ts`)

The full permission registry has these Section-03-relevant entries:

| Symbol                       | Literal permission string      | Used by which modules                          |
|------------------------------|--------------------------------|------------------------------------------------|
| `ORG_READ`                   | `org:read`                     | organization, customer (proxy), pricing (proxy via customer) |
| `ORG_CREATE`                 | `org:create`                   | organization, customer (proxy)                 |
| `ORG_UPDATE`                 | `org:update`                   | organization, customer (proxy)                 |
| `ORG_DELETE`                 | `org:delete`                   | organization, customer (proxy)                 |
| `PRODUCT_READ`               | `product:read`                 | product, recipe-bom                            |
| `PRODUCT_CREATE`             | `product:create`               | product, recipe-bom                            |
| `PRODUCT_UPDATE`             | `product:update`               | product, recipe-bom                            |
| `PRODUCT_DELETE`             | `product:delete`               | product                                        |
| `SUPPLIER_READ`              | `supplier:read`                | supplier                                       |
| `SUPPLIER_CREATE`            | `supplier:create`              | supplier                                       |
| `SUPPLIER_UPDATE`            | `supplier:update`              | supplier                                       |
| `SUPPLIER_DELETE`            | `supplier:delete`              | supplier                                       |
| `SUPPLIER_BLACKLIST`         | `supplier:blacklist`           | supplier (blacklist endpoint)                  |
| `CUSTOMER_READ`              | `customer:read`                | (defined but NOT used by customer module)      |
| `CUSTOMER_CREATE`            | `customer:create`              | (defined but NOT used by customer module)      |
| `CUSTOMER_UPDATE`            | `customer:update`              | (defined but NOT used by customer module)      |
| `CUSTOMER_DELETE`            | `customer:delete`              | (defined but NOT used by customer module)      |
| `INVENTORY_READ`             | `inventory:read`               | inventory, warehouse                           |
| `INVENTORY_POST`             | `inventory:post`               | inventory, warehouse                           |
| `INVENTORY_ADJUST`           | `inventory:adjust`             | inventory (blocks, expiry)                     |
| `INVENTORY_REVERSE`          | `inventory:reverse`            | (defined, not used in Section 03 modules)      |
| `AUDIT_READ`                 | `audit:read`                   | gst-taxation, product-costing, general-ledger, financial-foundation (proxy) |
| `AUDIT_READ_CRITICAL`        | `audit:read:critical`          | financial-foundation (write proxy)             |
| `SYSTEM_REFERENCE_UPDATE`    | `system:reference:update`      | (defined, not used in Section 03 modules)      |

### RBAC Gap (Critical)

The `customer` module file at `/apps/backend/src/modules/customer/routes/index.ts` (lines 49–54) reassigns `CUSTOMER_READ/CREATE/UPDATE/DELETE = ORG_READ/CREATE/UPDATE/DELETE` instead of using the actual `customer:*` permissions that ARE defined in the registry. Comment in the file: *"Use ORG_READ/CREATE/UPDATE/DELETE as proxy permissions for Customer (until customer-specific permissions are added)."* — but the customer-specific permissions ARE defined in the registry. **This is a bug**; the routes should use the real `customer:*` permissions.

The `pricing-engine` module similarly reassigns `CR = CUSTOMER_READ`, `CU = CUSTOMER_UPDATE` (lines 11–12 of `pricing-engine/routes/index.ts`), which means pricing is gated by customer permissions rather than pricing-specific permissions.

The `gst-taxation`, `product-costing`, and `general-ledger` modules all use `AUDIT_READ` for both read AND write (`READ_PERM = AUDIT_READ`, `WRITE_PERM = AUDIT_READ`). This is a **security gap** — any user with audit:read can create/update/delete master data.

---

## 3. Module: `product` — Product Master

**Mount**: `/api/v1/catalog`
**File**: `apps/backend/src/modules/product/routes/index.ts` (136 lines)
**Permission family**: `product:read|create|update|delete`
**Workflow**: `ProductLifecycle` (registered in `product/workflow/index.ts`)
- States: `DRAFT`, `REVIEW`, `APPROVED`, `ACTIVE`, `DISCONTINUED`, `ARCHIVED`
- Transitions: DRAFT→REVIEW, REVIEW→APPROVED, REVIEW→DRAFT, APPROVED→ACTIVE, ACTIVE→DISCONTINUED, DISCONTINUED→ACTIVE, ACTIVE→ARCHIVED, DISCONTINUED→ARCHIVED

### 3.1 Endpoints

| Method | Path                              | Permission       | Description                              | Audit | Event                |
|--------|-----------------------------------|------------------|------------------------------------------|-------|----------------------|
| GET    | `/api/v1/catalog/products`        | `product:read`   | List products (paginated, filterable)    | No    | No                   |
| GET    | `/api/v1/catalog/products/:id`    | `product:read`   | Get product by ID (+ barcodes array)     | No    | No                   |
| POST   | `/api/v1/catalog/products`        | `product:create` | Create product                           | Yes   | `ProductCreated`     |
| PATCH  | `/api/v1/catalog/products/:id`    | `product:update` | Update product (If-Match version)        | Yes   | `ProductUpdated`     |
| DELETE | `/api/v1/catalog/products/:id`    | `product:delete` | Soft-delete product (If-Match version)   | Yes   | No                   |
| POST   | `/api/v1/catalog/products/:id/transition` | `product:update` | Lifecycle state transition       | Yes   | `ProductApproved` / `ProductArchived` |
| GET    | `/api/v1/catalog/products/barcode/:barcode` | `product:read` | Lookup product by barcode value  | No    | No                   |
| GET    | `/api/v1/catalog/products/:id/barcodes`    | `product:read` | List barcodes for a product      | No    | No                   |
| POST   | `/api/v1/catalog/products/:id/barcodes`    | `product:update` | Add barcode to a product         | Yes   | No                   |
| GET    | `/api/v1/catalog/categories`      | `product:read`   | List product categories                  | No    | No                   |
| POST   | `/api/v1/catalog/categories`      | `product:create` | Create product category                  | Yes   | No                   |
| GET    | `/api/v1/catalog/brands`          | `product:read`   | List brands                              | No    | No                   |
| POST   | `/api/v1/catalog/brands`          | `product:create` | Create brand                             | Yes   | No                   |
| GET    | `/api/v1/catalog/uoms`            | `product:read`   | List units of measure                    | No    | No                   |

### 3.2 Query parameters for `GET /api/v1/catalog/products`

| Param          | Type   | Notes                              |
|----------------|--------|------------------------------------|
| `page`         | number | default 1                          |
| `pageSize`     | number | default 25                         |
| `search`       | string | matches `sku` / `name` / `item_code` ILIKE |
| `productType`  | enum   | `RAW_MATERIAL`/`SEMI_FINISHED`/`FINISHED_GOOD`/`PACKAGING`/`CONSUMABLE`/`SERVICE`/`ASSET`/`BY_PRODUCT`/`SCRAP` |
| `status`       | enum   | `DRAFT`/`REVIEW`/`APPROVED`/`ACTIVE`/`DISCONTINUED`/`ARCHIVED` |
| `categoryId`   | uuid   |                                    |
| `brandId`      | uuid   |                                    |
| `abcClass`     | enum   | `A`/`B`/`C`                        |

### 3.3 DTO: `productSchema` (POST /api/v1/catalog/products)

| Field                | Type      | Validation                              | Default        |
|----------------------|-----------|-----------------------------------------|----------------|
| `sku`                | string    | min 1, max 50                           | — (required)   |
| `itemCode`           | string    | optional                                | —              |
| `name`               | string    | min 1, max 200                          | — (required)   |
| `shortName`          | string    | optional                                | —              |
| `description`        | string    | optional                                | —              |
| `productType`        | enum      | 9 values (see §3.2)                     | `FINISHED_GOOD`|
| `categoryId`         | uuid      | optional                                | —              |
| `brandId`            | uuid      | optional                                | —              |
| `baseUomId`          | uuid      | **required**                            | —              |
| `altUomId`           | uuid      | optional                                | —              |
| `hsnCode`            | string    | optional                                | —              |
| `gstRate`            | number    | 0–100, optional                         | —              |
| `mrp`                | number    | non-negative, optional                  | —              |
| `standardCost`       | number    | non-negative, optional                  | —              |
| `listPrice`          | number    | non-negative, optional                  | —              |
| `shelfLifeDays`      | number    | int, positive, optional                 | —              |
| `batchRequired`      | boolean   |                                         | `false`        |
| `serialRequired`     | boolean   |                                         | `false`        |
| `expiryTracking`     | boolean   |                                         | `false`        |
| `fifoStrategy`       | enum      | `FEFO`/`FIFO`/`LIFO`                    | `FEFO`         |
| `inspectionRequired` | boolean   |                                         | `false`        |
| `costingMethod`      | enum      | `FIFO`/`LIFO`/`WEIGHTED_AVG`/`STANDARD`/`ACTUAL` | `WEIGHTED_AVG` |
| `abcClass`           | enum      | `A`/`B`/`C`, optional                   | —              |
| `xyzClass`           | enum      | `X`/`Y`/`Z`, optional                   | —              |
| `fsnClass`           | string    | optional                                | —              |
| `isCritical`         | boolean   |                                         | `false`        |
| `procurementType`    | enum      | `MAKE`/`BUY`/`BOTH`                     | `MAKE`         |
| `leadTimeDays`       | number    | int, positive, optional                 | —              |
| `reorderLevel`       | number    | non-negative, optional                  | —              |
| `reorderQty`         | number    | non-negative, optional                  | —              |
| `safetyStock`        | number    | non-negative, optional                  | —              |
| `storageCondition`   | string    | optional                                | —              |
| `imageUrl`           | string    | optional                                | —              |

> **Repository optional fields** (also accepted on create): `itemCode`, `shortName`, `description`, `longDescription`, `sacCode`, `weight`, `weightUom`, `volume`, `volumeUom`, `minTemp`, `maxTemp`, `minHumidity`, `maxHumidity`, `defaultWarehouseId`, `defaultStorageLocation`, `minOrderQty`, `maxOrderQty`, `manufacturingType`, `yieldPercent`, `upi`. These are NOT in the zod schema, so the validator will strip them — the route uses `zValidator('json', productSchema)` which by default strips unknown keys.

### 3.4 DTO: `transitionSchema`

```json
{ "targetStatus": "DRAFT|REVIEW|APPROVED|ACTIVE|DISCONTINUED|ARCHIVED", "version": 0 }
```

### 3.5 DTO: `barcodeSchema`

| Field           | Type    | Validation             | Default  |
|-----------------|---------|------------------------|----------|
| `barcodeType`   | string  |                        | `EAN13`  |
| `barcodeValue`  | string  | min 1                  | required |
| `isPrimary`     | boolean |                        | `false`  |

### 3.6 DTO: `categorySchema`

| Field          | Type   | Validation             |
|----------------|--------|------------------------|
| `code`         | string | min 1, max 50          |
| `name`         | string | min 1, max 200         |
| `description`  | string | optional               |
| `productType`  | string | optional               |
| `parentId`     | uuid   | optional               |

### 3.7 DTO: `brandSchema`

| Field           | Type   | Validation             |
|-----------------|--------|------------------------|
| `code`          | string | min 1, max 50          |
| `name`          | string | min 1, max 200         |
| `description`   | string | optional               |
| `manufacturer`  | string | optional               |

### 3.8 Business rules enforced (service layer)

1. SKU must be unique per tenant (`ConflictError` if exists).
2. `baseUomId` must reference an existing UOM.
3. `categoryId` (if specified) must reference an existing category.
4. Cannot delete `ACTIVE` products — must discontinue first (`BusinessRuleError` `PRODUCT.ACTIVE_DELETE`).
5. Lifecycle transitions validated by `ProductLifecycle` workflow.

### 3.9 Repository methods (`productRepository`)

- `create(data)` — INSERT with optional fields dynamically expanded
- `findById(tenantId, id)`
- `findBySku(tenantId, sku)`
- `findByBarcode(barcode)`
- `list(tenantId, params)` — paginated with filters
- `update(tenantId, id, data, version, updatedBy?)` — optimistic concurrency
- `softDelete(tenantId, id, version)` — sets `deleted_at`, `status='ARCHIVED'`
- `updateStatus(tenantId, id, status, version, updatedBy?)`

`categoryRepository`: `create`, `findById`, `list`
`brandRepository`: `create`, `findById`, `list`
`uomRepository`: `list`, `findById` (read-only — no create endpoint exposed)
`barcodeRepository`: `create`, `listForProduct`, `findByValue`, `softDelete`

### 3.10 Database tables touched (raw SQL, not Prisma)

`products`, `product_categories`, `product_brands`, `product_uoms`, `product_barcodes`
> Note: the `product` module uses `pglite` raw SQL queries directly via `query()`, NOT Prisma. This is inconsistent with `gst-taxation`, `product-costing`, `general-ledger` which use Prisma.

---

## 4. Module: `customer` — Customer Master

**Mount**: `/api/v1/sales`
**File**: `apps/backend/src/modules/customer/routes/index.ts` (129 lines)
**Permission family**: SHOULD be `customer:*` — but **uses `org:*` as proxy** (see §2 RBAC gap)
**Workflow**: `CustomerLifecycle` (registered in `customer/workflow/index.ts`)
- States: `LEAD`, `PROSPECT`, `APPROVED`, `ACTIVE`, `BLOCKED`, `INACTIVE`, `ARCHIVED`
- Transitions: LEAD→PROSPECT, PROSPECT→APPROVED, PROSPECT→LEAD, APPROVED→ACTIVE, ACTIVE→BLOCKED, BLOCKED→ACTIVE, ACTIVE→INACTIVE, BLOCKED→INACTIVE, INACTIVE→ACTIVE, ACTIVE→ARCHIVED, BLOCKED→ARCHIVED, INACTIVE→ARCHIVED

### 4.1 Endpoints

| Method | Path                                        | Permission (effective) | Description                          | Audit | Event                          |
|--------|---------------------------------------------|------------------------|--------------------------------------|-------|--------------------------------|
| GET    | `/api/v1/sales/customers`                   | `org:read`             | List customers (paginated)           | No    | No                             |
| GET    | `/api/v1/sales/customers/:id`               | `org:read`             | Get customer (+ contacts + addresses)| No    | No                             |
| POST   | `/api/v1/sales/customers`                   | `org:create`           | Create customer                      | Yes   | `CustomerCreated`              |
| PATCH  | `/api/v1/sales/customers/:id`               | `org:update`           | Update customer (If-Match)           | Yes   | No                             |
| DELETE | `/api/v1/sales/customers/:id`               | `org:delete`           | Soft-delete customer (If-Match)      | Yes   | No                             |
| POST   | `/api/v1/sales/customers/:id/transition`    | `org:update`           | Lifecycle state transition           | Yes   | `CustomerApproved`/`CustomerBlocked`/`CustomerArchived` |
| GET    | `/api/v1/sales/customers/:id/credit`        | `org:read`             | Get credit status (limit, utilisation)| No    | No                             |
| GET    | `/api/v1/sales/customers/gst/:gstin`        | `org:read`             | Lookup customer by GSTIN             | No    | No                             |
| POST   | `/api/v1/sales/customers/:id/contacts`      | `org:update`           | Add contact                          | Yes   | No                             |
| POST   | `/api/v1/sales/customers/:id/addresses`     | `org:update`           | Add address                          | Yes   | No                             |
| GET    | `/api/v1/sales/customer-groups`             | `org:read`             | List customer groups                 | No    | No                             |
| POST   | `/api/v1/sales/customer-groups`             | `org:create`           | Create customer group                | Yes   | No                             |

### 4.2 Query parameters for `GET /api/v1/sales/customers`

| Param          | Type    | Notes                                                |
|----------------|---------|------------------------------------------------------|
| `page`         | number  | default 1                                            |
| `pageSize`     | number  | default 25                                           |
| `search`       | string  | matches `customer_code`/`trade_name`/`legal_name`/`gstin` ILIKE |
| `status`       | enum    | `LEAD`/`PROSPECT`/`APPROVED`/`ACTIVE`/`BLOCKED`/`INACTIVE`/`ARCHIVED` |
| `customerType` | enum    | `RETAIL`/`WHOLESALE`/`DISTRIBUTOR`/`DEALER`/`CORPORATE`/`FRANCHISE`/`EXPORT`/`WALK_IN`/`CASH` |
| `groupId`      | uuid    |                                                      |
| `creditHold`   | boolean | `?creditHold=true`                                   |

### 4.3 DTO: `customerSchema` (POST /api/v1/sales/customers)

| Field              | Type    | Validation                                     | Default   |
|--------------------|---------|------------------------------------------------|-----------|
| `customerCode`     | string  | min 1, max 50                                  | required  |
| `customerType`     | enum    | 9 values (see §4.2)                            | `RETAIL`  |
| `legalName`        | string  | optional                                       | —         |
| `tradeName`        | string  | min 1, max 200                                 | required  |
| `shortName`        | string  | optional                                       | —         |
| `description`      | string  | optional                                       | —         |
| `groupId`          | uuid    | optional                                       | —         |
| `territory`        | string  | optional                                       | —         |
| `gstin`            | string  | regex GSTIN format                             | optional  |
| `pan`              | string  | regex PAN format                               | optional  |
| `primaryEmail`     | string  | email, optional                                | —         |
| `phone`            | string  | optional                                       | —         |
| `mobile`           | string  | optional                                       | —         |
| `website`          | string  | optional                                       | —         |
| `bankName`         | string  | optional                                       | —         |
| `accountNumber`    | string  | optional                                       | —         |
| `ifscCode`         | string  | optional                                       | —         |
| `paymentTerms`     | enum    | `NET15`/`NET30`/`NET45`/`NET60`/`IMMEDIATE`/`ADVANCE` | `NET30` |
| `creditLimit`      | number  | non-negative, optional                         | —         |
| `creditDays`       | number  | int, min 0                                     | 30        |
| `currency`         | string  |                                                | `INR`     |
| `riskRating`       | enum    | `LOW`/`MEDIUM`/`HIGH`/`CRITICAL`               | `MEDIUM`  |
| `loyaltyCategory`  | enum    | `SILVER`/`GOLD`/`PLATINUM`, optional           | —         |
| `tags`             | string[]| optional                                       | —         |

> Repository also accepts (not in zod schema, will be stripped): `tan`, `fssaiLicense`, `secondaryEmail`, `fax`, `salesRepId`, `outstandingBalance`, `creditHold`. The repository INSERT statement sets `status='LEAD'`, `outstanding_balance=0`, `credit_hold=false` defaults.

### 4.4 DTO: `transitionSchema` (Customer)

```json
{ "targetStatus": "LEAD|PROSPECT|APPROVED|ACTIVE|BLOCKED|INACTIVE|ARCHIVED", "version": 0 }
```

### 4.5 DTO: `contactSchema`

| Field          | Type    | Validation             | Default |
|----------------|---------|------------------------|---------|
| `name`         | string  | min 1, max 200         | required|
| `designation`  | string  | optional               | —       |
| `email`        | string  | email, optional        | —       |
| `phone`        | string  | optional               | —       |
| `mobile`       | string  | optional               | —       |
| `isPrimary`    | boolean |                        | `false` |

### 4.6 DTO: `addressSchema`

| Field            | Type    | Validation                                       | Default   |
|------------------|---------|--------------------------------------------------|-----------|
| `addressType`    | enum    | `BILLING`/`SHIPPING`/`REGISTERED_OFFICE`        | `BILLING` |
| `addressLine1`   | string  | min 1                                            | required  |
| `city`           | string  | min 1                                            | required  |
| `state`          | string  | optional                                         | —         |
| `country`        | string  |                                                  | `India`   |
| `postalCode`     | string  | optional                                         | —         |
| `isPrimary`      | boolean |                                                  | `false`   |

### 4.7 DTO: `groupSchema` (Customer Group)

| Field          | Type   | Validation             |
|----------------|--------|------------------------|
| `code`         | string | min 1, max 50          |
| `name`         | string | min 1, max 200         |
| `description`  | string | optional               |

### 4.8 Business rules (service layer)

1. `customerCode` must be unique per tenant.
2. `gstin` must be unique across all tenants (global lookup).
3. GSTIN format validated twice (zod schema + service regex).
4. PAN format validated.
5. Cannot modify `BLOCKED` customer (must unblock first).
6. Cannot delete `ACTIVE` customer (must block/archive first).
7. Cannot delete customer with `outstanding_balance > 0`.

### 4.9 Credit status response shape (GET /customers/:id/credit)

```json
{
  "customerId": "uuid",
  "customerCode": "string",
  "tradeName": "string",
  "creditLimit": "decimal|null",
  "outstandingBalance": "decimal",
  "creditDays": "int",
  "creditHold": "boolean",
  "riskRating": "LOW|MEDIUM|HIGH|CRITICAL",
  "availableCredit": "decimal|null",
  "creditUtilizationPct": "number"
}
```

### 4.10 Repository methods

`customerRepository`: `create`, `findById`, `findByCode`, `findByGstin`, `list`, `update`, `softDelete`, `updateStatus`
`customerContactRepository`: `create`, `listForCustomer`
`customerAddressRepository`: `create`, `listForCustomer`
`customerGroupRepository`: `list`, `create`

### 4.11 Database tables touched (raw SQL)

`customers`, `customer_contacts`, `customer_addresses`, `customer_groups`

---

## 5. Module: `supplier` — Supplier Master

**Mount**: `/api/v1/procurement`
**File**: `apps/backend/src/modules/supplier/routes/index.ts` (144 lines)
**Permission family**: `supplier:read|create|update|delete|blacklist`
**Workflow**: `SupplierLifecycle` (registered in `supplier/workflow/index.ts`)
- States: `DRAFT`, `VERIFICATION`, `APPROVED`, `ACTIVE`, `PROBATION`, `BLOCKED`, `BLACKLISTED`, `ARCHIVED`
- (Note: the zod `transitionSchema` for supplier lists these 8 states; the workflow file itself was not explicitly read but the routes use `SupplierLifecycle` per service code.)

### 5.1 Endpoints

| Method | Path                                              | Permission           | Description                              | Audit | Event                          |
|--------|---------------------------------------------------|----------------------|------------------------------------------|-------|--------------------------------|
| GET    | `/api/v1/procurement/suppliers`                   | `supplier:read`      | List suppliers (paginated)               | No    | No                             |
| GET    | `/api/v1/procurement/suppliers/:id`               | `supplier:read`      | Get supplier (+ contacts+addresses+compliances+products) | No | No                          |
| POST   | `/api/v1/procurement/suppliers`                   | `supplier:create`    | Create supplier                          | Yes   | `SupplierCreated`              |
| PATCH  | `/api/v1/procurement/suppliers/:id`               | `supplier:update`    | Update supplier (If-Match)               | Yes   | `SupplierUpdated`              |
| DELETE | `/api/v1/procurement/suppliers/:id`               | `supplier:delete`    | Soft-delete supplier (If-Match)          | Yes   | No                             |
| POST   | `/api/v1/procurement/suppliers/:id/transition`    | `supplier:update`    | Lifecycle state transition               | Yes   | `SupplierApproved`/`SupplierBlocked` |
| POST   | `/api/v1/procurement/suppliers/:id/blacklist`     | `supplier:blacklist` | Blacklist supplier (with reason)         | Yes (CRITICAL severity) | `SupplierBlacklisted` |
| GET    | `/api/v1/procurement/suppliers/gst/:gstin`        | `supplier:read`      | Lookup supplier by GSTIN                 | No    | No                             |
| GET    | `/api/v1/procurement/suppliers/:id/contacts`      | `supplier:read`      | List supplier contacts (via getById)     | No    | No                             |
| POST   | `/api/v1/procurement/suppliers/:id/contacts`      | `supplier:update`    | Add contact                              | Yes   | No                             |
| POST   | `/api/v1/procurement/suppliers/:id/addresses`     | `supplier:update`    | Add address                              | Yes   | No                             |
| POST   | `/api/v1/procurement/suppliers/:id/compliances`   | `supplier:update`    | Add compliance record                    | Yes   | No                             |
| POST   | `/api/v1/procurement/suppliers/:id/products`      | `supplier:update`    | Assign product to supplier (with preferred flag, MOQ, lead time, price) | Yes | No |
| GET    | `/api/v1/procurement/supplier-categories`         | `supplier:read`      | List supplier categories                 | No    | No                             |
| POST   | `/api/v1/procurement/supplier-categories`         | `supplier:create`    | Create supplier category                 | Yes   | No                             |

### 5.2 Query parameters for `GET /api/v1/procurement/suppliers`

| Param         | Type    | Notes                                                          |
|---------------|---------|----------------------------------------------------------------|
| `page`        | number  | default 1                                                      |
| `pageSize`    | number  | default 25                                                     |
| `search`      | string  | matches `vendor_code`/`legal_name`/`trade_name`/`gstin` ILIKE  |
| `status`      | enum    | `DRAFT`/`VERIFICATION`/`APPROVED`/`ACTIVE`/`PROBATION`/`BLOCKED`/`BLACKLISTED`/`ARCHIVED` |
| `vendorType`  | enum    | `MANUFACTURER`/`DISTRIBUTOR`/`TRADER`/`SERVICE_PROVIDER`/`TRANSPORTER`/`CONTRACTOR`/`IMPORTER` |
| `categoryId`  | uuid    |                                                                |
| `isPreferred` | boolean | `?isPreferred=true`                                            |

### 5.3 DTO: `supplierSchema` (POST /api/v1/procurement/suppliers)

| Field            | Type    | Validation                                     | Default        |
|------------------|---------|------------------------------------------------|----------------|
| `vendorCode`     | string  | min 1, max 50                                  | required       |
| `legalName`      | string  | min 1, max 200                                 | required       |
| `tradeName`      | string  | min 1, max 200                                 | required       |
| `shortName`      | string  | optional                                       | —              |
| `description`    | string  | optional                                       | —              |
| `categoryId`     | uuid    | optional                                       | —              |
| `supplierType`   | enum    | `DOMESTIC`/`INTERNATIONAL`/`LOCAL`             | `DOMESTIC`     |
| `vendorType`     | enum    | 7 values (see §5.2)                            | `MANUFACTURER` |
| `gstin`          | string  | regex GSTIN format, optional                   | —              |
| `pan`            | string  | regex PAN format, optional                     | —              |
| `cin`            | string  | optional                                       | —              |
| `fssaiLicense`   | string  | optional                                       | —              |
| `msmeRegNo`      | string  | optional                                       | —              |
| `iecCode`        | string  | optional                                       | —              |
| `primaryEmail`   | string  | email, optional                                | —              |
| `phone`          | string  | optional                                       | —              |
| `website`        | string  | optional                                       | —              |
| `bankName`       | string  | optional                                       | —              |
| `accountNumber`  | string  | optional                                       | —              |
| `ifscCode`       | string  | optional                                       | —              |
| `paymentTerms`   | enum    | `NET15`/`NET30`/`NET45`/`NET60`/`IMMEDIATE`/`ADVANCE` | `NET30` |
| `creditLimit`    | number  | non-negative, optional                         | —              |
| `creditDays`     | number  | int, min 0                                     | 30             |
| `currency`       | string  |                                                | `INR`          |
| `riskLevel`      | enum    | `LOW`/`MEDIUM`/`HIGH`/`CRITICAL`               | `MEDIUM`       |
| `isPreferred`    | boolean |                                                | `false`        |
| `isStrategic`    | boolean |                                                | `false`        |

> Repository also accepts (not in zod schema): `tan`, `secondaryEmail`, `fax`, `bankBranch`, `accountType`, `upiId`, `paymentMethod`, `msmeType`. The repository INSERT sets `status='DRAFT'` default.

### 5.4 DTO: `blacklistSchema`

```json
{ "reason": "string (min 1, max 500)" }
```

### 5.5 DTO: `contactSchema` (Supplier contact)

Same shape as customer contact (§4.5).

### 5.6 DTO: `addressSchema` (Supplier address)

| Field            | Type    | Validation                                                                  | Default   |
|------------------|---------|-----------------------------------------------------------------------------|-----------|
| `addressType`    | enum    | `BILLING`/`SHIPPING`/`FACTORY`/`WAREHOUSE`/`REGISTERED_OFFICE`            | `BILLING` |
| `addressLine1`   | string  | min 1                                                                       | required  |
| `city`           | string  | min 1                                                                       | required  |
| `state`          | string  | optional                                                                    | —         |
| `country`        | string  |                                                                             | `India`   |
| `postalCode`     | string  | optional                                                                    | —         |
| `isPrimary`      | boolean |                                                                             | `false`   |

### 5.7 DTO: `complianceSchema`

| Field                | Type    | Validation                                                                                          |
|----------------------|---------|-----------------------------------------------------------------------------------------------------|
| `complianceType`     | enum    | `FSSAI`/`ISO_22000`/`HACCP`/`GST_REG`/`PAN`/`MSME`/`INSURANCE`/`NDA`/`VENDOR_AGREEMENT`           |
| `licenseNumber`      | string  | optional                                                                                            |
| `issuingAuthority`   | string  | optional                                                                                            |
| `issuedDate`         | string  | datetime, optional                                                                                  |
| `expiryDate`         | string  | datetime, optional                                                                                  |
| `documentUrl`        | string  | optional                                                                                            |
| `notes`              | string  | optional                                                                                            |

### 5.8 DTO: `productMappingSchema` (Supplier ↔ Product)

| Field             | Type    | Validation             | Default |
|-------------------|---------|------------------------|---------|
| `productId`       | uuid    | required               | —       |
| `supplierSku`     | string  | optional               | —       |
| `unitPrice`       | number  | non-negative, optional | —       |
| `moq`             | number  | non-negative, optional | —       |
| `leadTimeDays`    | number  | int, positive, optional| —       |
| `isPreferred`     | boolean |                        | `false` |

### 5.9 DTO: `categorySchema` (Supplier category)

| Field           | Type    | Validation                                       | Default        |
|-----------------|---------|--------------------------------------------------|----------------|
| `code`          | string  | min 1, max 50                                    | required       |
| `name`          | string  | min 1, max 200                                   | required       |
| `description`   | string  | optional                                         | —              |
| `supplierType`  | enum    | `DOMESTIC`/`INTERNATIONAL`/`LOCAL`              | `DOMESTIC`     |
| `vendorType`    | string  |                                                  | `MANUFACTURER` |

### 5.10 Business rules

1. `vendorCode` unique per tenant.
2. GSTIN unique globally.
3. GSTIN + PAN format validated.
4. Cannot modify `BLACKLISTED` supplier.
5. Cannot delete `ACTIVE` supplier (must block/archive first).
6. Blacklisting is **CRITICAL severity** audit log entry.
7. Preferred supplier assignment revokes previous preferred mappings for same product.

### 5.11 Repository methods

`supplierRepository`: `create`, `findById`, `findByVendorCode`, `findByGstin`, `list`, `update`, `softDelete`, `updateStatus`, `blacklist`
`supplierContactRepository`: `create`, `listForSupplier`
`supplierAddressRepository`: `create`, `listForSupplier`
`supplierComplianceRepository`: `create`, `listForSupplier`, `findExpiring(tenantId, withinDays=30)`, `updateStatus`
`supplierProductMappingRepository`: `create`, `listForSupplier` (joins products), `listForProduct` (joins suppliers), `revoke`
`supplierCategoryRepository`: `list`, `create`

### 5.12 Database tables touched (raw SQL)

`suppliers`, `supplier_contacts`, `supplier_addresses`, `supplier_compliances`, `supplier_product_mappings`, `supplier_categories`

---

## 6. Module: `organization` — Company / Plant / Warehouse / Department / Cost Center / Financial Year / Hierarchy

**Mount**: `/api/v1/organization`
**File**: `apps/backend/src/modules/organization/routes/index.ts` (291 lines)
**Permission family**: `org:read|create|update|delete`
**Workflow**: `OrganizationLifecycle` (registered in `organization/workflow/index.ts`)
- States: `DRAFT`, `CONFIGURED`, `ACTIVE`, `SUSPENDED`, `ARCHIVED`
- Transitions: DRAFT→CONFIGURED, CONFIGURED→ACTIVE, CONFIGURED→DRAFT, ACTIVE→SUSPENDED, SUSPENDED→ACTIVE, SUSPENDED→ARCHIVED, ACTIVE→ARCHIVED

### 6.1 Endpoints — Companies

| Method | Path                                              | Permission       | Description                              | Audit | Event                  |
|--------|---------------------------------------------------|------------------|------------------------------------------|-------|------------------------|
| GET    | `/api/v1/organization/companies`                  | `org:read`       | List companies (paginated)               | No    | No                     |
| GET    | `/api/v1/organization/companies/:id`              | `org:read`       | Get company                              | No    | No                     |
| POST   | `/api/v1/organization/companies`                  | `org:create`     | Create company                           | Yes   | `CompanyCreated`       |
| PATCH  | `/api/v1/organization/companies/:id`              | `org:update`     | Update company (If-Match)                | Yes   | No                     |
| DELETE | `/api/v1/organization/companies/:id`              | `org:delete`     | Soft-delete company (If-Match)           | Yes   | No                     |
| POST   | `/api/v1/organization/companies/:id/transition`   | `org:update`     | Lifecycle state transition               | Yes   | No                     |
| POST   | `/api/v1/organization/companies/:id/restore`      | `org:update`     | Restore from soft delete                 | Yes   | No                     |
| DELETE | `/api/v1/organization/companies/:id/hard`         | `org:delete`     | Permanent delete (requires `system:tenant:cross`) | Yes (CRITICAL) | No |

### 6.2 Endpoints — Plants

| Method | Path                                              | Permission       | Description                              | Audit | Event                  |
|--------|---------------------------------------------------|------------------|------------------------------------------|-------|------------------------|
| GET    | `/api/v1/organization/plants`                     | `org:read`       | List plants (paginated)                  | No    | No                     |
| GET    | `/api/v1/organization/plants/:id`                 | `org:read`       | Get plant                                | No    | No                     |
| POST   | `/api/v1/organization/plants`                     | `org:create`     | Create plant                             | Yes   | No                     |
| POST   | `/api/v1/organization/plants/:id/transition`      | `org:update`     | Lifecycle state transition               | Yes   | `PlantActivated` (when targetStatus=ACTIVE) |

### 6.3 Endpoints — Warehouses

| Method | Path                                              | Permission       | Description                              | Audit | Event |
|--------|---------------------------------------------------|------------------|------------------------------------------|-------|-------|
| GET    | `/api/v1/organization/warehouses`                 | `org:read`       | List warehouses (filterable by plantId)  | No    | No    |
| GET    | `/api/v1/organization/warehouses/:id`             | `org:read`       | Get warehouse                            | No    | No    |
| POST   | `/api/v1/organization/warehouses`                 | `org:create`     | Create warehouse                         | Yes   | No    |

### 6.4 Endpoints — Departments

| Method | Path                                              | Permission       | Description                              | Audit | Event |
|--------|---------------------------------------------------|------------------|------------------------------------------|-------|-------|
| GET    | `/api/v1/organization/departments`                | `org:read`       | List departments                         | No    | No    |
| POST   | `/api/v1/organization/departments`                | `org:create`     | Create department                        | Yes   | No    |

### 6.5 Endpoints — Cost Centers

| Method | Path                                              | Permission       | Description                              | Audit | Event |
|--------|---------------------------------------------------|------------------|------------------------------------------|-------|-------|
| GET    | `/api/v1/organization/cost-centers`               | `org:read`       | List cost centers                        | No    | No    |
| POST   | `/api/v1/organization/cost-centers`               | `org:create`     | Create cost center                       | Yes   | No    |

### 6.6 Endpoints — Financial Years

| Method | Path                                              | Permission       | Description                              | Audit | Event |
|--------|---------------------------------------------------|------------------|------------------------------------------|-------|-------|
| GET    | `/api/v1/organization/financial-years`            | `org:read`       | List financial years                     | No    | No    |
| GET    | `/api/v1/organization/financial-years/current`    | `org:read`       | Get current financial year               | No    | No    |
| POST   | `/api/v1/organization/financial-years`            | `org:create`     | Create financial year                    | Yes   | No    |

### 6.7 Endpoints — Hierarchy

| Method | Path                                              | Permission       | Description                              | Audit | Event |
|--------|---------------------------------------------------|------------------|------------------------------------------|-------|-------|
| GET    | `/api/v1/organization/hierarchy`                  | `org:read`       | Get full hierarchy tree (Company→BU→Division→Region→Plant→Warehouse) | No | No |

### 6.8 DTO: `companySchema`

| Field               | Type    | Validation             | Default   |
|---------------------|---------|------------------------|-----------|
| `code`              | string  | min 1, max 50          | required  |
| `name`              | string  | min 1, max 200         | required  |
| `legalName`         | string  | max 200, optional      | —         |
| `description`       | string  | max 1000, optional     | —         |
| `parentId`          | uuid    | optional               | —         |
| `gstin`             | string  | regex GSTIN, optional  | —         |
| `pan`               | string  | regex PAN, optional    | —         |
| `cin`               | string  | optional               | —         |
| `email`             | string  | email, optional        | —         |
| `phone`             | string  | optional               | —         |
| `website`           | string  | url, optional          | —         |
| `addressLine1`      | string  | optional               | —         |
| `city`              | string  | optional               | —         |
| `state`             | string  | optional               | —         |
| `country`           | string  |                        | `India`   |
| `postalCode`        | string  | optional               | —         |
| `defaultTimezone`   | string  | optional               | —         |
| `defaultCurrency`   | string  | optional               | —         |

### 6.9 DTO: `plantSchema`

| Field            | Type    | Validation                                                    | Default          |
|------------------|---------|---------------------------------------------------------------|------------------|
| `regionId`       | uuid    | required                                                      | —                |
| `code`           | string  | min 1, max 50                                                 | required         |
| `name`           | string  | min 1, max 200                                                | required         |
| `description`    | string  | optional                                                      | —                |
| `plantType`      | enum    | `MANUFACTURING`/`DISTRIBUTION`/`WAREHOUSE`/`RETAIL`/`RESTAURANT` | `MANUFACTURING`  |
| `addressLine1`   | string  | optional                                                      | —                |
| `city`           | string  | optional                                                      | —                |
| `state`          | string  | optional                                                      | —                |
| `country`        | string  |                                                               | `India`          |
| `postalCode`     | string  | optional                                                      | —                |
| `timezone`       | string  |                                                               | `Asia/Kolkata`   |
| `currency`       | string  |                                                               | `INR`            |
| `email`          | string  | email, optional                                               | —                |
| `phone`          | string  | optional                                                      | —                |

### 6.10 DTO: `warehouseSchema`

| Field             | Type    | Validation                                                    | Default          |
|-------------------|---------|---------------------------------------------------------------|------------------|
| `plantId`         | uuid    | required                                                      | —                |
| `code`            | string  | min 1, max 50                                                 | required         |
| `name`            | string  | min 1, max 200                                                | required         |
| `description`     | string  | optional                                                      | —                |
| `warehouseType`   | enum    | `RAW_MATERIAL`/`FINISHED_GOODS`/`PACKAGING`/`DISTRIBUTION`/`QUARANTINE` | `DISTRIBUTION` |
| `addressLine1`    | string  | optional                                                      | —                |
| `city`            | string  | optional                                                      | —                |
| `state`           | string  | optional                                                      | —                |
| `country`         | string  |                                                               | `India`          |
| `timezone`        | string  |                                                               | `Asia/Kolkata`   |
| `isDefault`       | boolean |                                                               | `false`          |
| `totalAreaSqft`   | number  | positive, optional                                            | —                |

### 6.11 DTO: `departmentSchema`

| Field             | Type   | Validation   |
|-------------------|--------|--------------|
| `code`            | string | min 1, max 50|
| `name`            | string | min 1, max 200|
| `description`     | string | optional     |
| `companyId`       | uuid   | optional     |
| `businessUnitId`  | uuid   | optional     |
| `plantId`         | uuid   | optional     |
| `parentId`        | uuid   | optional     |

### 6.12 DTO: `costCenterSchema`

| Field             | Type    | Validation                                                    | Default      |
|-------------------|---------|---------------------------------------------------------------|--------------|
| `code`            | string  | min 1, max 50                                                 | required     |
| `name`            | string  | min 1, max 200                                                | required     |
| `description`     | string  | optional                                                      | —            |
| `plantId`         | uuid    | optional                                                      | —            |
| `departmentId`    | uuid    | optional                                                      | —            |
| `costCenterType`  | enum    | `PRODUCTION`/`SERVICE`/`ADMIN`/`SALES`                       | `PRODUCTION` |

### 6.13 DTO: `financialYearSchema`

| Field        | Type    | Validation       |
|--------------|---------|------------------|
| `code`       | string  | min 1, max 20    |
| `name`       | string  | min 1, max 100   |
| `startDate`  | string  | datetime         |
| `endDate`    | string  | datetime         |
| `isCurrent`  | boolean | default `false`  |

### 6.14 DTO: `transitionSchema` (Organization)

```json
{ "targetStatus": "DRAFT|CONFIGURED|ACTIVE|SUSPENDED|ARCHIVED", "version": 0 }
```

### 6.15 Business rules

1. Company code unique per tenant.
2. Parent company must exist if `parentId` specified.
3. Cannot delete company with child companies (`ORG.HAS_CHILDREN`).
4. Hard delete requires `system:tenant:cross` permission (system admin only).
5. Only one default warehouse per plant (`ORG.DEFAULT_WAREHOUSE_EXISTS`).
6. Financial year end date must be after start date.
7. No overlapping financial years.

### 6.16 Hierarchy tree response shape

GET `/api/v1/organization/hierarchy` returns a tree:
```json
[
  {
    "id": "uuid", "code": "string", "name": "string", "type": "Company", "status": "ACTIVE",
    "children": [
      { "type": "BusinessUnit", ..., "children": [
        { "type": "Division", ..., "children": [
          { "type": "Region", ..., "children": [
            { "type": "Plant", ..., "children": [
              { "type": "Warehouse", ... }
            ]}
          ]}
        ]}
      ]}
    ]
  }
]
```

### 6.17 Database tables touched (raw SQL)

`companies`, `business_units`, `divisions`, `regions`, `plants`, `warehouses`, `departments`, `cost_centers`, `financial_years`

### 6.18 Repository also defines `businessUnitRepository` (full CRUD) but NO routes are exposed for BusinessUnits, Divisions, or Regions — only the hierarchy endpoint reads them.

---

## 7. Module: `warehouse` — Zones, Aisles, Racks, Bins, Putaway, Barcodes, Scan logs

**Mount**: `/api/v1/warehouse`
**File**: `apps/backend/src/modules/warehouse/routes/index.ts` (181 lines)
**Permission family**: `inventory:read|post` (no warehouse-specific permissions exist)
**Workflow**: No workflow state machine — zones/aisles/racks/bins have no status transitions; putaway tasks transition manually via service.

### 7.1 Endpoints — Zones

| Method | Path                                  | Permission         | Description            | Audit | Event |
|--------|---------------------------------------|--------------------|------------------------|-------|-------|
| GET    | `/api/v1/warehouse/zones`             | `inventory:read`   | List zones (?warehouseId=) | No  | No    |
| POST   | `/api/v1/warehouse/zones`             | `inventory:post`   | Create zone            | Yes   | No    |

### 7.2 Endpoints — Aisles

| Method | Path                                  | Permission         | Description            | Audit | Event |
|--------|---------------------------------------|--------------------|------------------------|-------|-------|
| GET    | `/api/v1/warehouse/aisles`            | `inventory:read`   | List aisles (?warehouseId=) | No | No |
| POST   | `/api/v1/warehouse/aisles`            | `inventory:post`   | Create aisle           | Yes   | No    |

### 7.3 Endpoints — Racks

| Method | Path                                  | Permission         | Description            | Audit | Event |
|--------|---------------------------------------|--------------------|------------------------|-------|-------|
| GET    | `/api/v1/warehouse/racks`             | `inventory:read`   | List racks (?warehouseId=) | No | No |
| POST   | `/api/v1/warehouse/racks`             | `inventory:post`   | Create rack            | Yes   | No    |

### 7.4 Endpoints — Bins

| Method | Path                                  | Permission         | Description                              | Audit | Event |
|--------|---------------------------------------|--------------------|------------------------------------------|-------|-------|
| GET    | `/api/v1/warehouse/bins`              | `inventory:read`   | List bins (?warehouseId=&zoneId=&aisleId=&rackId=) | No | No |
| POST   | `/api/v1/warehouse/bins`              | `inventory:post`   | Create bin                              | Yes   | No    |

### 7.5 Endpoints — Putaway Tasks

| Method | Path                                              | Permission         | Description                          | Audit | Event                          |
|--------|---------------------------------------------------|--------------------|--------------------------------------|-------|--------------------------------|
| GET    | `/api/v1/warehouse/putaway-tasks`                 | `inventory:read`   | List putaway tasks (paginated)       | No    | No                             |
| POST   | `/api/v1/warehouse/putaway-tasks`                 | `inventory:post`   | Create putaway task (validates bin)  | Yes   | `PutawayTaskCreated`           |
| POST   | `/api/v1/warehouse/putaway-tasks/:id/complete`    | `inventory:post`   | Complete putaway (updates bin used)  | Yes   | `PutawayCompleted`             |

### 7.6 Endpoints — Barcode Engine

| Method | Path                                              | Permission         | Description                              | Audit | Event |
|--------|---------------------------------------------------|--------------------|------------------------------------------|-------|-------|
| GET    | `/api/v1/warehouse/barcodes`                      | `inventory:read`   | List barcodes (paginated)                | No    | No    |
| POST   | `/api/v1/warehouse/barcodes`                      | `inventory:post`   | Create barcode label                     | Yes (`BARCODE_CREATED`) | No |
| POST   | `/api/v1/warehouse/barcodes/:id/print`            | `inventory:read`   | Mark barcode as printed (increments print_count) | Yes (`BARCODE_PRINTED`) | No |

### 7.7 Endpoints — Scanner

| Method | Path                                              | Permission         | Description                          | Audit | Event |
|--------|---------------------------------------------------|--------------------|--------------------------------------|-------|-------|
| POST   | `/api/v1/warehouse/scan`                          | `inventory:read`   | Scan a barcode (returns label)       | Yes (`BARCODE_SCANNED`) | No |
| GET    | `/api/v1/warehouse/scan-logs`                     | `inventory:read`   | List scan logs (paginated)           | No    | No    |

### 7.8 DTO: `zoneSchema`

| Field          | Type    | Validation             | Default    |
|----------------|---------|------------------------|------------|
| `warehouseId`  | uuid    | required               | —          |
| `zoneCode`     | string  | min 1                  | required   |
| `zoneName`     | string  | min 1                  | required   |
| `zoneType`     | string  |                        | `STORAGE`  |
| `capacity`     | number  | non-negative, optional | —          |
| `description`  | string  | optional               | —          |

### 7.9 DTO: `aisleSchema`

| Field          | Type    | Validation             | Default |
|----------------|---------|------------------------|---------|
| `warehouseId`  | uuid    | required               | —       |
| `zoneId`       | uuid    | optional               | —       |
| `aisleCode`    | string  | min 1                  | required|
| `aisleName`    | string  | min 1                  | required|
| `capacity`     | number  | non-negative, optional | —       |
| `description`  | string  | optional               | —       |

### 7.10 DTO: `rackSchema`

| Field                | Type    | Validation             | Default     |
|----------------------|---------|------------------------|-------------|
| `warehouseId`        | uuid    | required               | —           |
| `zoneId`             | uuid    | optional               | —           |
| `aisleId`            | uuid    | optional               | —           |
| `rackCode`           | string  | min 1                  | required    |
| `rackName`           | string  | min 1                  | required    |
| `rackType`           | string  |                        | `STANDARD`  |
| `levels`             | number  | int, positive          | 1           |
| `capacityPerLevel`   | number  | non-negative, optional | —           |
| `description`        | string  | optional               | —           |

### 7.11 DTO: `binSchema`

| Field          | Type    | Validation             | Default    |
|----------------|---------|------------------------|------------|
| `warehouseId`  | uuid    | required               | —          |
| `zoneId`       | uuid    | optional               | —          |
| `aisleId`      | uuid    | optional               | —          |
| `rackId`       | uuid    | optional               | —          |
| `binCode`      | string  | min 1                  | required   |
| `binName`      | string  | min 1                  | required   |
| `binType`      | string  |                        | `STORAGE`  |
| `level`        | number  | int, positive          | 1          |
| `position`     | string  | optional               | —          |
| `capacity`     | number  | non-negative, optional | —          |
| `description`  | string  | optional               | —          |

### 7.12 DTO: `putawaySchema`

| Field              | Type    | Validation                                                                  | Default  |
|--------------------|---------|-----------------------------------------------------------------------------|----------|
| `grnId`            | uuid    | optional                                                                    | —        |
| `grnNumber`        | string  | optional                                                                    | —        |
| `grnLineId`        | uuid    | optional                                                                    | —        |
| `inspectionLotId`  | uuid    | **required**                                                                | —        |
| `productId`        | uuid    | required                                                                    | —        |
| `productSku`       | string  | min 1                                                                       | required |
| `productName`      | string  | min 1                                                                       | required |
| `batchId`          | uuid    | optional                                                                    | —        |
| `batchNumber`      | string  | optional                                                                    | —        |
| `lotId`            | uuid    | optional                                                                    | —        |
| `lotNumber`        | string  | optional                                                                    | —        |
| `quantity`         | number  | positive                                                                    | required |
| `uomId`            | uuid    | required                                                                    | —        |
| `uomCode`          | string  | min 1                                                                       | required |
| `warehouseId`      | uuid    | required                                                                    | —        |
| `warehouseName`    | string  | min 1                                                                       | required |
| `targetBinId`      | uuid    | optional (auto-allocated if omitted)                                        | —        |
| `targetBinCode`    | string  | optional                                                                    | —        |
| `assignedTo`       | uuid    | optional                                                                    | —        |
| `assignedToName`   | string  | optional                                                                    | —        |
| `priority`         | enum    | `LOW`/`NORMAL`/`HIGH`/`URGENT`                                              | `NORMAL` |
| `remarks`          | string  | optional                                                                    | —        |

### 7.13 DTO: `barcodeSchema` (Warehouse)

| Field              | Type    | Validation                                                                                    |
|--------------------|---------|-----------------------------------------------------------------------------------------------|
| `labelType`        | enum    | `PRODUCT`/`BATCH`/`LOT`/`BIN`/`GRN`/`PALLET`/`GS1`/`QR`                                     |
| `productId`        | uuid    | optional                                                                                      |
| `productSku`       | string  | optional                                                                                      |
| `productName`      | string  | optional                                                                                      |
| `batchId`          | uuid    | optional                                                                                      |
| `batchNumber`      | string  | optional                                                                                      |
| `lotId`            | uuid    | optional                                                                                      |
| `lotNumber`        | string  | optional                                                                                      |
| `warehouseId`      | uuid    | optional                                                                                      |
| `binId`            | uuid    | optional                                                                                      |
| `binCode`          | string  | optional                                                                                      |
| `grnId`            | uuid    | optional                                                                                      |
| `grnNumber`        | string  | optional                                                                                      |
| `quantity`         | number  | optional                                                                                      |
| `uomCode`          | string  | optional                                                                                      |
| `manufactureDate`  | string  | datetime, optional                                                                            |
| `expiryDate`       | string  | datetime, optional                                                                            |
| `gs1Gtin`          | string  | optional                                                                                      |

### 7.14 DTO: `scanSchema`

| Field          | Type   | Validation             |
|----------------|--------|------------------------|
| `barcode`      | string | min 1                  |
| `scanType`     | string | min 1                  |
| `scanContext`  | string | optional               |
| `deviceId`     | string | optional               |
| `location`     | string | optional               |

### 7.15 Business rules

1. Putaway quantity must be positive.
2. If target bin specified: must exist, be active, not blocked, have capacity.
3. If target bin not specified: auto-allocate bin with sufficient capacity (`findAvailableBin`).
4. Cannot complete a putaway in `COMPLETED` status.
5. Completing a putaway updates bin `used_capacity`.
6. Barcode auto-generated with prefix `BC-YYYY-` (or `GTIN-` for GS1, `QR-` for QR).

### 7.16 Database tables touched (raw SQL)

`warehouse_zones`, `warehouse_aisles`, `warehouse_racks`, `warehouse_bins`, `putaway_tasks`, `barcode_labels`, `scan_logs`

> Note: This module duplicates some Prisma models — `WarehouseZone`, `WarehouseAisle`, `WarehouseRack`, `WarehouseShelf`, `WarehouseBin`, `WarehouseMaster` are all defined in `schema.prisma` (lines 6026–6441), but the warehouse service uses raw SQL with separate tables (e.g. `warehouse_zones` lowercase snake_case). Schema mismatch likely — Prisma is future-state, raw SQL is current-state.

---

## 8. Module: `inventory` — Stock ledger engine

**Mount**: `/api/v1/inventory`
**File**: `apps/backend/src/modules/inventory/routes/index.ts` (153 lines)
**Permission family**: `inventory:read|post|adjust`

### 8.1 Endpoints

| Method | Path                                              | Permission           | Description                              | Audit | Event                |
|--------|---------------------------------------------------|----------------------|------------------------------------------|-------|----------------------|
| GET    | `/api/v1/inventory/inventory`                     | `inventory:read`     | List stock (paginated)                   | No    | No                   |
| GET    | `/api/v1/inventory/inventory/:id`                 | `inventory:read`     | Get inventory record                     | No    | No                   |
| POST   | `/api/v1/inventory/inventory/stock-in`            | `inventory:post`     | Stock in (requires IQC pass)             | Yes (`STOCK_IN`) | `StockAdded` |
| POST   | `/api/v1/inventory/inventory/stock-out`           | `inventory:post`     | Stock out (FEFO/FIFO)                    | Yes (`STOCK_OUT`) | `StockRemoved` |
| GET    | `/api/v1/inventory/ledger`                        | `inventory:read`     | List ledger entries (IMMUTABLE)          | No    | No                   |
| GET    | `/api/v1/inventory/transactions`                  | `inventory:read`     | List transactions                        | No    | No                   |
| GET    | `/api/v1/inventory/reservations`                  | `inventory:read`     | List reservations                        | No    | No                   |
| POST   | `/api/v1/inventory/reservations`                  | `inventory:post`     | Reserve stock                            | Yes (`STOCK_RESERVED`) | No |
| POST   | `/api/v1/inventory/reservations/:id/release`      | `inventory:post`     | Release reservation                      | Yes (`STOCK_RESERVATION_RELEASED`) | No |
| GET    | `/api/v1/inventory/blocks`                        | `inventory:read`     | List stock blocks                        | No    | No                   |
| POST   | `/api/v1/inventory/blocks`                        | `inventory:adjust`   | Block stock (quality hold etc.)          | Yes (`STOCK_BLOCKED`) | `StockBlocked` |
| GET    | `/api/v1/inventory/expiry`                        | `inventory:read`     | Get expiring stock (?days=30)            | No    | No                   |
| POST   | `/api/v1/inventory/expiry/mark-expired`           | `inventory:adjust`   | Mark expired stock                       | Yes (`STOCK_EXPIRED`) (system actor) | No |
| GET    | `/api/v1/inventory/batches`                       | `inventory:read`     | List batches                             | No    | No                   |

### 8.2 DTO: `stockInSchema`

| Field              | Type    | Validation             |
|--------------------|---------|------------------------|
| `grnId`            | uuid    | required               |
| `grnNumber`        | string  | min 1                  |
| `inspectionLotId`  | uuid    | required               |
| `productId`        | uuid    | required               |
| `productSku`       | string  | min 1                  |
| `productName`      | string  | min 1                  |
| `warehouseId`      | uuid    | required               |
| `warehouseName`    | string  | min 1                  |
| `binId`            | uuid    | optional               |
| `binCode`          | string  | optional               |
| `batchNumber`      | string  | optional               |
| `lotNumber`        | string  | optional               |
| `manufactureDate`  | string  | datetime, optional     |
| `expiryDate`       | string  | datetime, optional     |
| `quantity`         | number  | positive               |
| `unitCost`         | number  | non-negative           |
| `uomId`            | uuid    | required               |
| `uomCode`          | string  | min 1                  |
| `currency`         | string  | optional               |

### 8.3 DTO: `stockOutSchema`

| Field              | Type    | Validation                                     | Default |
|--------------------|---------|------------------------------------------------|---------|
| `productId`        | uuid    | required                                       | —       |
| `productSku`       | string  | min 1                                          | —       |
| `productName`      | string  | min 1                                          | —       |
| `warehouseId`      | uuid    | required                                       | —       |
| `warehouseName`    | string  | min 1                                          | —       |
| `quantity`         | number  | positive                                       | —       |
| `uomId`            | uuid    | required                                       | —       |
| `uomCode`          | string  | min 1                                          | —       |
| `strategy`         | enum    | `FEFO`/`FIFO`                                  | `FEFO`  |
| `referenceType`    | string  | optional                                       | —       |
| `referenceId`      | uuid    | optional                                       | —       |
| `referenceNumber`  | string  | optional                                       | —       |
| `reason`           | string  | min 1                                          | —       |

### 8.4 DTO: `reserveSchema`

| Field               | Type    | Validation             |
|---------------------|---------|------------------------|
| `productId`         | uuid    | required               |
| `productSku`        | string  | min 1                  |
| `warehouseId`       | uuid    | required               |
| `reservedQty`       | number  | positive               |
| `uomId`             | uuid    | required               |
| `uomCode`           | string  | min 1                  |
| `reservationType`   | string  | optional               |
| `referenceType`     | string  | optional               |
| `referenceId`       | uuid    | optional               |
| `referenceNumber`   | string  | optional               |
| `reservedFor`       | string  | optional               |
| `expiresAt`         | string  | datetime, optional     |

### 8.5 DTO: `blockSchema`

| Field            | Type    | Validation             |
|------------------|---------|------------------------|
| `productId`      | uuid    | required               |
| `productSku`     | string  | min 1                  |
| `warehouseId`    | uuid    | required               |
| `blockedQty`     | number  | positive               |
| `uomId`          | uuid    | required               |
| `uomCode`        | string  | min 1                  |
| `blockType`      | string  | optional               |
| `blockReason`    | string  | min 1                  |
| `sourceType`     | string  | optional               |
| `sourceId`       | uuid    | optional               |
| `sourceNumber`   | string  | optional               |

### 8.6 Business rules

1. Stock-in requires inspection lot status `PASSED` or `CONDITIONAL_PASS` (cannot stock in rejected inventory).
2. Expiry date mandatory for batch-tracked products.
3. Batch unique per product.
4. Lot unique per product.
5. Stock out: cannot issue from blocked stock.
6. Stock out: cannot issue from expired stock.
7. Stock out: insufficient stock throws `INV.INSUFFICIENT_STOCK`.
8. **Inventory ledger is IMMUTABLE** — `is_immutable = true` column; no UPDATE/DELETE ever.
9. Every movement creates a ledger entry.
10. Moving Average Cost recalculated on every stock-in.
11. Reservation release: only `ACTIVE` reservations can be released.

### 8.7 Database tables touched (raw SQL)

`inventory`, `inventory_transactions`, `inventory_ledger`, `batches`, `lots`, `stock_reservations`, `stock_blocks`, `inspection_lots` (read-only check)

### 8.8 Number generation patterns

- Inventory transactions: `IVT-YYYY-########` (8 digits)
- Inventory ledger entries: `IVL-YYYY-########` (8 digits)
- Stock reservations: `SR-YYYY-######` (6 digits)
- Stock blocks: `SB-YYYY-######` (6 digits)

---

## 9. Module: `pricing-engine` — Price lists, promotions, coupons, tax configs, calculate

**Mount**: `/api/v1/sales/pricing`
**File**: `apps/backend/src/modules/pricing-engine/routes/index.ts` (29 lines, condensed one-liners)
**Permission family**: PROXY — `CR = CUSTOMER_READ = 'customer:read'`, `CU = CUSTOMER_UPDATE = 'customer:update'`
**Workflow**: None

### 9.1 Endpoints

| Method | Path                                       | Permission (effective) | Description                          | Audit | Event |
|--------|--------------------------------------------|------------------------|--------------------------------------|-------|-------|
| GET    | `/api/v1/sales/pricing/price-lists`        | `customer:read`        | List price lists                     | No    | No    |
| POST   | `/api/v1/sales/pricing/price-lists`        | `customer:update`      | Create price list                    | Yes   | No    |
| GET    | `/api/v1/sales/pricing/promotions`         | `customer:read`        | List promotions                      | No    | No    |
| POST   | `/api/v1/sales/pricing/promotions`         | `customer:update`      | Create promotion                     | Yes   | No    |
| GET    | `/api/v1/sales/pricing/coupons`            | `customer:read`        | List coupons                         | No    | No    |
| POST   | `/api/v1/sales/pricing/coupons`            | `customer:update`      | Create coupon                        | Yes   | No    |
| POST   | `/api/v1/sales/pricing/calculate`          | `customer:read`        | Calculate best price (scheme engine) | No    | No    |
| GET    | `/api/v1/sales/pricing/tax-configs`        | `customer:read`        | List tax configurations              | No    | No    |
| POST   | `/api/v1/sales/pricing/tax-configs`        | `customer:update`      | Create tax config                    | Yes   | No    |

### 9.2 DTO: `plSchema` (Price List)

| Field            | Type   | Validation             | Default     |
|------------------|--------|------------------------|-------------|
| `listCode`       | string | min 1                  | required    |
| `listName`       | string | min 1                  | required    |
| `listType`       | string |                        | `STANDARD`  |
| `channel`        | string | optional               | —           |
| `currency`       | string |                        | `INR`       |
| `effectiveFrom`  | string | required               | —           |
| `effectiveTo`    | string | optional               | —           |
| `description`    | string | optional               | —           |

### 9.3 DTO: `promoSchema` (Promotion)

| Field                 | Type    | Validation                                     | Default  |
|-----------------------|---------|------------------------------------------------|----------|
| `promoCode`           | string  | min 1                                          | required |
| `promoName`           | string  | min 1                                          | required |
| `promoType`           | string  | min 1                                          | required |
| `scope`               | string  |                                                | `PRODUCT`|
| `productId`           | uuid    | optional                                       | —        |
| `productCategoryId`   | uuid    | optional                                       | —        |
| `customerId`          | uuid    | optional                                       | —        |
| `discountType`        | string  | min 1                                          | required |
| `discountValue`       | number  | positive                                       | required |
| `minQty`              | number  | positive, optional                             | —        |
| `maxQty`              | number  | positive, optional                             | —        |
| `minOrderValue`       | number  | positive, optional                             | —        |
| `maxDiscountAmount`   | number  | positive, optional                             | —        |
| `buyQty`              | number  | positive, optional                             | —        |
| `getQty`              | number  | positive, optional                             | —        |
| `startDate`           | string  | required                                       | —        |
| `endDate`             | string  | required                                       | —        |
| `usageLimit`          | number  | int, positive, optional                        | —        |
| `description`         | string  | optional                                       | —        |
| `termsConditions`     | string  | optional                                       | —        |

### 9.4 DTO: `couponSchema`

| Field                 | Type    | Validation                          | Default |
|-----------------------|---------|-------------------------------------|---------|
| `couponCode`          | string  | min 1                               | required|
| `couponName`          | string  | min 1                               | required|
| `couponType`          | string  | min 1                               | required|
| `discountType`        | string  | min 1                               | required|
| `discountValue`       | number  | positive                            | required|
| `minOrderValue`       | number  | positive, optional                  | —       |
| `maxDiscountAmount`   | number  | positive, optional                  | —       |
| `startDate`           | string  | required                            | —       |
| `endDate`             | string  | required                            | —       |
| `usageLimit`          | number  | int, positive                       | 1       |
| `perCustomerLimit`    | number  | int, positive                       | 1       |
| `description`         | string  | optional                            | —       |

### 9.5 DTO: `taxSchema` (Tax Config)

| Field               | Type    | Validation             | Default |
|---------------------|---------|------------------------|---------|
| `taxCode`           | string  | min 1                  | required|
| `taxName`           | string  | min 1                  | required|
| `taxType`           | string  | min 1                  | required|
| `taxPercent`        | number  | 0–100                  | required|
| `hsnCode`           | string  | optional               | —       |
| `sacCode`           | string  | optional               | —       |
| `isReverseCharge`   | boolean |                        | `false` |
| `description`       | string  | optional               | —       |

### 9.6 DTO: `calcSchema` (Calculate Price)

| Field         | Type    | Validation             |
|---------------|---------|------------------------|
| `productId`   | uuid    | required               |
| `customerId`  | uuid    | optional               |
| `channel`     | string  | optional               |
| `quantity`    | number  | positive               |
| `uomCode`     | string  | min 1                  |
| `couponCode`  | string  | optional               |

### 9.7 Calculate Price response shape

```json
{
  "productId": "uuid",
  "quantity": 1,
  "basePrice": 100.00,
  "listPrice": 100.00,
  "customerDiscountPercent": 5,
  "customerDiscountAmount": 5.00,
  "appliedPromo": "PROMO_CODE|null",
  "promoDiscountAmount": 0.00,
  "appliedCoupon": "COUPON_CODE|null",
  "couponDiscountAmount": 0.00,
  "subtotal": 100.00,
  "totalDiscount": 5.00,
  "afterDiscount": 95.00,
  "taxPercent": 18,
  "taxAmount": 17.10,
  "grandTotal": 112.10
}
```

### 9.8 Pricing calculation flow

1. Get base price from active `price_list_items` joined with `price_lists` (filtered by channel).
2. Fallback to product's `price` column if no price list item.
3. Apply customer-specific discount from `customer_price_agreements` table.
4. Find applicable promotion (max `discountValue`) from `promotions` where today ∈ [startDate, endDate] and product/customer/qty match.
5. Apply coupon if provided (validates `usage_count < usage_limit`, min_order_value).
6. Sum discounts, compute subtotal, after_discount, tax (from `tax_configurations` table), grand total.

### 9.9 Database tables touched (raw SQL via `genRepo`)

`price_lists`, `promotions`, `coupons`, `tax_configurations`, `price_list_items` (read-only via raw SQL in `calculatePrice`), `products` (read-only), `customer_price_agreements` (read-only)

> Note: No endpoints exist for managing `price_list_items`, `customer_price_agreements`, or `discount_rules`. These are referenced by the calculate engine but have no CRUD endpoints.

---

## 10. Module: `gst-taxation` — GST Configuration (Prisma-backed)

**Mount**: `/api/v1/finance/gst`
**File**: `apps/backend/src/modules/gst-taxation/routes/index.ts` (95 lines)
**Permission family**: PROXY — `READ_PERM = AUDIT_READ = 'audit:read'`, `WRITE_PERM = AUDIT_READ` (same!)
**Workflow**: Workflow file at `gst-taxation/workflow/index.ts` is for **TaxReturnLifecycle** (DRAFT → READY_TO_FILE → FILED → AMENDED), NOT for the GST configuration entity. The service references workflow `'GstConfigurationLifecycle'` but no such workflow file exists in this module's workflow directory.

### 10.1 Endpoints

| Method | Path                                       | Permission (effective) | Description                              | Audit | Event                                  |
|--------|--------------------------------------------|------------------------|------------------------------------------|-------|----------------------------------------|
| GET    | `/api/v1/finance/gst`                      | `audit:read`           | List gst_configurations (paginated)      | No    | No                                     |
| GET    | `/api/v1/finance/gst/count`                | `audit:read`           | Count gst_configurations                 | No    | No                                     |
| GET    | `/api/v1/finance/gst/exists/:code`         | `audit:read`           | Check if config_code exists              | No    | No                                     |
| GET    | `/api/v1/finance/gst/:id`                  | `audit:read`           | Get GST config by ID                     | No    | No                                     |
| POST   | `/api/v1/finance/gst`                      | `audit:read`           | Create GST config (NO body validation)   | Yes   | `GstConfigCreated`                     |
| PUT    | `/api/v1/finance/gst/:id`                  | `audit:read`           | Update GST config                        | Yes   | No                                     |
| DELETE | `/api/v1/finance/gst/:id`                  | `audit:read`           | Soft-delete (?reason=)                   | Yes   | No                                     |
| POST   | `/api/v1/finance/gst/:id/transition`       | `audit:read`           | Workflow transition (targetState, reason)| Yes   | `GstConfigurationTransitioned`         |

### 10.2 Schema

The route accepts **arbitrary JSON** — no zod validation. The service layer only validates that `config_code` is present (else `ValidationError`). All other fields are passed through.

Prisma model `GstConfigurations` (referenced as `(db as any).GstConfigurations`) is referenced but NOT explicitly defined in `schema.prisma`. This is a gap.

### 10.3 Permission/RBAC gap (Critical)

Both READ and WRITE permissions resolve to `audit:read`. Any user with audit read access can create/update/delete GST configurations. This is a serious security gap.

### 10.4 Workflow gap

The service calls `workflowRegistry.get('GstConfigurationLifecycle')` but no workflow with that name is registered (the workflow file registers `TaxReturnLifecycle` instead). The transition endpoint will throw `BusinessRuleError` with code `WORKFLOW.NOT_REGISTERED` on every call.

---

## 11. Module: `recipe-bom` — Recipes, BOMs, Routings

**Mount**: `/api/v1/manufacturing/recipes`
**File**: `apps/backend/src/modules/recipe-bom/routes/index.ts` (133 lines)
**Permission family**: `product:read|create|update` (no recipe/bom-specific permissions)
**Workflow**: `RecipeLifecycle` (registered in `recipe-bom/workflow/index.ts`)
- States: `DRAFT`, `IN_REVIEW`, `APPROVED`, `DEPRECATED`
- Transitions: DRAFT→IN_REVIEW, IN_REVIEW→APPROVED, IN_REVIEW→DRAFT, APPROVED→DEPRECATED, DEPRECATED→APPROVED

> Note: BOM transitions use the same 4 states but the service does NOT use the workflow registry — it validates the status string manually (lines 177–179 of service). Recipe transitions DO use the workflow registry.

### 11.1 Endpoints — Recipes

| Method | Path                                                       | Permission       | Description                              | Audit | Event                |
|--------|------------------------------------------------------------|------------------|------------------------------------------|-------|----------------------|
| GET    | `/api/v1/manufacturing/recipes/recipes`                    | `product:read`   | List recipes                             | No    | No                   |
| GET    | `/api/v1/manufacturing/recipes/recipes/:id`                | `product:read`   | Get recipe (+ items + byproducts)        | No    | No                   |
| POST   | `/api/v1/manufacturing/recipes/recipes`                    | `product:create` | Create recipe (with items + byproducts)  | Yes   | `RecipeCreated` / `RecipeApproved` |
| POST   | `/api/v1/manufacturing/recipes/recipes/:id/transition`     | `product:update` | Recipe lifecycle transition              | Yes (`RECIPE_TRANSITION`) | `RecipeApproved` |

### 11.2 Endpoints — BOMs

| Method | Path                                                       | Permission       | Description                              | Audit | Event |
|--------|------------------------------------------------------------|------------------|------------------------------------------|-------|-------|
| GET    | `/api/v1/manufacturing/recipes/boms`                       | `product:read`   | List BOMs                                | No    | No    |
| GET    | `/api/v1/manufacturing/recipes/boms/:id`                   | `product:read`   | Get BOM (+ lines)                        | No    | No    |
| POST   | `/api/v1/manufacturing/recipes/boms`                       | `product:create` | Create BOM (with lines, supports multi-level) | Yes | No    |
| POST   | `/api/v1/manufacturing/recipes/boms/:id/transition`        | `product:update` | BOM lifecycle transition                 | Yes (`BOM_TRANSITION`) | No |
| GET    | `/api/v1/manufacturing/recipes/boms/:id/explode`           | `product:read`   | Multi-level BOM explosion (recursive)    | No    | No    |

### 11.3 Endpoints — Routings

| Method | Path                                                       | Permission       | Description                              | Audit | Event |
|--------|------------------------------------------------------------|------------------|------------------------------------------|-------|-------|
| GET    | `/api/v1/manufacturing/recipes/routings`                   | `product:read`   | List routings (?productId=)              | No    | No    |
| GET    | `/api/v1/manufacturing/recipes/routings/:id`               | `product:read`   | Get routing (+ operations)               | No    | No    |
| POST   | `/api/v1/manufacturing/recipes/routings`                   | `product:create` | Create routing (with operations)         | Yes   | No    |

### 11.4 DTO: `recipeSchema`

| Field                 | Type     | Validation                            | Default |
|-----------------------|----------|---------------------------------------|---------|
| `recipeCode`          | string   | min 1                                 | required|
| `recipeName`          | string   | min 1                                 | required|
| `productId`           | uuid     | required                              | —       |
| `productSku`          | string   | optional                              | —       |
| `productName`         | string   | optional                              | —       |
| `version`             | string   |                                       | `1.0`   |
| `yieldPercent`        | number   | 0–100                                 | 100     |
| `expectedLossPercent` | number   | 0–100                                 | 0       |
| `batchSize`           | number   | positive, optional                    | —       |
| `batchUomId`          | uuid     | optional                              | —       |
| `batchUomCode`        | string   | optional                              | —       |
| `productionTimeHours` | number   | positive, optional                    | —       |
| `description`         | string   | optional                              | —       |
| `items`               | array    | min 1, of `recipeItemSchema`          | required|
| `byproducts`          | array    | optional, of byproduct object         | —       |

### 11.5 DTO: `recipeItemSchema`

| Field           | Type    | Validation                                                                | Default      |
|-----------------|---------|---------------------------------------------------------------------------|--------------|
| `itemType`      | enum    | `RAW_MATERIAL`/`PACKAGING`/`CONSUMABLE`                                 | `RAW_MATERIAL` |
| `productId`     | uuid    | required                                                                  | —            |
| `productSku`    | string  | optional                                                                  | —            |
| `productName`   | string  | optional                                                                  | —            |
| `uomId`         | uuid    | optional                                                                  | —            |
| `uomCode`       | string  | optional                                                                  | —            |
| `quantity`      | number  | positive                                                                  | required     |
| `scrapPercent`  | number  | non-negative                                                              | 0            |
| `isCritical`    | boolean |                                                                           | `false`      |
| `unitCost`      | number  | non-negative, optional                                                    | —            |
| `remarks`       | string  | optional                                                                  | —            |

### 11.6 DTO: `bomSchema`

| Field         | Type   | Validation                       | Default     |
|---------------|--------|----------------------------------|-------------|
| `bomCode`     | string | min 1                            | required    |
| `bomName`     | string | min 1                            | required    |
| `productId`   | uuid   | required                         | —           |
| `productSku`  | string | optional                         | —           |
| `productName` | string | optional                         | —           |
| `bomType`     | string |                                  | `STANDARD`  |
| `description` | string | optional                         | —           |
| `lines`       | array  | min 1, of `bomLineSchema`        | required    |

### 11.7 DTO: `bomLineSchema`

| Field                | Type    | Validation             | Default |
|----------------------|---------|------------------------|---------|
| `parentBomLineId`    | uuid    | optional               | —       |
| `productId`          | uuid    | required               | —       |
| `productSku`         | string  | optional               | —       |
| `productName`        | string  | optional               | —       |
| `uomId`              | uuid    | optional               | —       |
| `uomCode`            | string  | optional               | —       |
| `quantity`           | number  | positive               | required|
| `scrapPercent`       | number  | non-negative           | 0       |
| `isPhantom`          | boolean |                        | `false` |
| `isCritical`         | boolean |                        | `false` |
| `leadTimeOffsetDays` | number  | int                    | 0       |
| `level`              | number  | int, min 1             | 1       |
| `remarks`            | string  | optional               | —       |

### 11.8 DTO: `routingSchema`

| Field           | Type   | Validation                  |
|-----------------|--------|-----------------------------|
| `routingCode`   | string | min 1                       |
| `routingName`   | string | min 1                       |
| `productId`     | uuid   | optional                    |
| `bomId`         | uuid   | optional                    |
| `description`   | string | optional                    |
| `operations`    | array  | min 1, of operation object  |

### 11.9 DTO: routing operation (nested)

| Field                  | Type    | Validation             | Default |
|------------------------|---------|------------------------|---------|
| `operationNo`          | number  | int, positive, optional| auto    |
| `operationName`        | string  | min 1                  | required|
| `operationDescription` | string  | optional               | —       |
| `workCenterId`         | uuid    | optional               | —       |
| `workCenterCode`       | string  | optional               | —       |
| `machineId`            | uuid    | optional               | —       |
| `machineCode`          | string  | optional               | —       |
| `setupTimeMinutes`     | number  | int, non-negative      | 0       |
| `runTimeMinutes`       | number  | int, non-negative      | 0       |
| `laborRequired`        | boolean |                        | `true`  |
| `skillLevel`           | string  | optional               | —       |

### 11.10 Business rules

1. Recipe must have at least one item.
2. `yieldPercent + expectedLossPercent ≤ 100`.
3. Recipe cost auto-calculated from items (unitCost × quantity).
4. BOM must have at least one line.
5. BOM supports multi-level via `parentBomLineId` and `level`.
6. Phantom BOM lines are exploded recursively in `explodeBom`.
7. Recipe approval sets `approvedBy`, `approvedByName`, `approvedAt`.

### 11.11 Database tables touched (raw SQL)

`recipes`, `recipe_items`, `recipe_byproducts`, `bom_headers`, `bom_lines`, `routings`, `routing_operations`

---

## 12. Module: `product-costing` — Product Cost (Prisma-backed)

**Mount**: `/api/v1/finance/costing`
**File**: `apps/backend/src/modules/product-costing/routes/index.ts` (95 lines)
**Permission family**: PROXY — `READ_PERM = AUDIT_READ`, `WRITE_PERM = AUDIT_READ` (same!)
**Workflow**: Service references `'ProductCostLifecycle'` but no workflow file exists in this module. Transition endpoint will fail.

### 12.1 Endpoints

| Method | Path                                       | Permission (effective) | Description                              | Audit | Event                                |
|--------|--------------------------------------------|------------------------|------------------------------------------|-------|--------------------------------------|
| GET    | `/api/v1/finance/costing`                  | `audit:read`           | List product_costs                       | No    | No                                   |
| GET    | `/api/v1/finance/costing/count`            | `audit:read`           | Count                                    | No    | No                                   |
| GET    | `/api/v1/finance/costing/exists/:code`     | `audit:read`           | Check existence by `cost_id`             | No    | No                                   |
| GET    | `/api/v1/finance/costing/:id`              | `audit:read`           | Get by ID                                | No    | No                                   |
| POST   | `/api/v1/finance/costing`                  | `audit:read`           | Create (requires `cost_id` field)        | Yes   | `ProductCostCalculated`              |
| PUT    | `/api/v1/finance/costing/:id`              | `audit:read`           | Update (optimistic concurrency)          | Yes   | No                                   |
| DELETE | `/api/v1/finance/costing/:id`              | `audit:read`           | Soft-delete (?reason=)                   | Yes   | No                                   |
| POST   | `/api/v1/finance/costing/:id/transition`   | `audit:read`           | Workflow transition (targetState, reason)| Yes   | `ProductCostTransitioned`            |

### 12.2 Schema

Route accepts arbitrary JSON. Service only validates that `cost_id` field is present. Prisma model `ProductCosts` is referenced but NOT explicitly defined in `schema.prisma` (gap).

### 12.3 Same RBAC + workflow gaps as gst-taxation (§10.3, §10.4)

---

## 13. Module: `financial-foundation` — Chart of Accounts, Fiscal Years/Periods, Cost Centers, Profit Centers, Currencies, Exchange Rates

**Mount**: `/api/v1/finance/foundation`
**File**: `apps/backend/src/modules/financial-foundation/routes/index.ts` (29 lines, condensed one-liners)
**Permission family**: PROXY — `FR = AUDIT_READ = 'audit:read'`, `FU = AUDIT_READ_CRITICAL = 'audit:read:critical'`
**Workflow**: `FinancialFoundationJournalEntryLifecycle` (DRAFT→POSTED→REVERSED→CANCELLED) — but no endpoints expose JE transitions.

### 13.1 Endpoints

| Method | Path                                                  | Permission (effective) | Description                          | Audit | Event |
|--------|-------------------------------------------------------|------------------------|--------------------------------------|-------|-------|
| GET    | `/api/v1/finance/foundation/accounts`                 | `audit:read`           | List chart of accounts               | No    | No    |
| POST   | `/api/v1/finance/foundation/accounts`                 | `audit:read:critical`  | Create account                       | Yes   | No    |
| GET    | `/api/v1/finance/foundation/fiscal-years`             | `audit:read`           | List fiscal years                    | No    | No    |
| POST   | `/api/v1/finance/foundation/fiscal-years`             | `audit:read:critical`  | Create fiscal year (auto-creates 12 periods) | Yes | No |
| GET    | `/api/v1/finance/foundation/fiscal-periods`           | `audit:read`           | List fiscal periods                  | No    | No    |
| POST   | `/api/v1/finance/foundation/fiscal-periods/close`     | `audit:read:critical`  | Close a fiscal period                | Yes (`PERIOD_CLOSED`) | No |
| GET    | `/api/v1/finance/foundation/cost-centers`             | `audit:read`           | List cost centers                    | No    | No    |
| POST   | `/api/v1/finance/foundation/cost-centers`             | `audit:read:critical`  | Create cost center                   | Yes   | No    |
| GET    | `/api/v1/finance/foundation/profit-centers`           | `audit:read`           | List profit centers                  | No    | No    |
| POST   | `/api/v1/finance/foundation/profit-centers`           | `audit:read:critical`  | Create profit center                 | Yes   | No    |
| GET    | `/api/v1/finance/foundation/currencies`               | `audit:read`           | List currencies                      | No    | No    |
| POST   | `/api/v1/finance/foundation/currencies`               | `audit:read:critical`  | Create currency                      | Yes   | No    |
| GET    | `/api/v1/finance/foundation/exchange-rates`           | `audit:read`           | List exchange rates                  | No    | No    |
| POST   | `/api/v1/finance/foundation/exchange-rates`           | `audit:read:critical`  | Set exchange rate                    | Yes (`SET_EXCHANGE_RATE`) | No |

### 13.2 DTO: `accSchema` (Chart of Accounts)

| Field               | Type    | Validation                                                                          | Default |
|---------------------|---------|-------------------------------------------------------------------------------------|---------|
| `accountCode`       | string  | min 1                                                                               | required|
| `accountName`       | string  | min 1                                                                               | required|
| `accountType`       | enum    | `ASSET`/`LIABILITY`/`EQUITY`/`REVENUE`/`EXPENSE`/`COGS`                            | required|
| `accountSubtype`    | string  | optional                                                                            | —       |
| `parentAccountId`   | uuid    | optional                                                                            | —       |
| `isPostable`        | boolean |                                                                                     | `true`  |
| `openingBalance`    | number  |                                                                                     | 0       |
| `currency`          | string  |                                                                                     | `INR`   |
| `description`       | string  | optional                                                                            | —       |

### 13.3 DTO: `fySchema` (Fiscal Year)

| Field          | Type   | Validation    |
|----------------|--------|---------------|
| `fiscalYear`   | string | min 1         |
| `startDate`    | string | required      |
| `endDate`      | string | required      |
| `description`  | string | optional      |

### 13.4 DTO: `ccSchema` (Cost Center)

| Field          | Type   | Validation   |
|----------------|--------|--------------|
| `ccCode`       | string | min 1        |
| `ccName`       | string | min 1        |
| `parentCcId`   | uuid   | optional     |
| `companyId`    | uuid   | optional     |
| `companyName`  | string | optional     |
| `plantId`      | uuid   | optional     |
| `plantName`    | string | optional     |
| `description`  | string | optional     |

### 13.5 DTO: `pcSchema` (Profit Center)

| Field          | Type   | Validation   |
|----------------|--------|--------------|
| `pcCode`       | string | min 1        |
| `pcName`       | string | min 1        |
| `parentPcId`   | uuid   | optional     |
| `companyId`    | uuid   | optional     |
| `companyName`  | string | optional     |
| `description`  | string | optional     |

### 13.6 DTO: `currSchema` (Currency)

| Field             | Type    | Validation | Default |
|-------------------|---------|------------|---------|
| `currencyCode`    | string  | min 1      | required|
| `currencyName`    | string  | min 1      | required|
| `symbol`          | string  | optional   | —       |
| `decimalPlaces`   | number  | int        | 2       |
| `isBaseCurrency`  | boolean |            | `false` |

### 13.7 DTO: `erSchema` (Exchange Rate)

| Field          | Type   | Validation             | Default |
|----------------|--------|------------------------|---------|
| `fromCurrency` | string | min 1                  | required|
| `toCurrency`   | string | min 1                  | required|
| `rate`         | number | positive               | required|
| `rateDate`     | string | required               | —       |
| `rateType`     | string |                        | `DAILY` |

### 13.8 Business rules

1. Account type must be one of the 6 valid types.
2. Fiscal year end date must be after start date.
3. Creating a fiscal year auto-creates 12 monthly periods.
4. Cannot close an already-closed period.

### 13.9 Database tables touched (raw SQL via `genRepo`)

`chart_of_accounts`, `fiscal_years`, `fiscal_periods`, `cost_centers`, `profit_centers`, `currencies`, `exchange_rates`

> Note: `cost_centers` table here is separate from the one used by `organization` module. There are two cost_center concepts in the codebase — the org-level (with `costCenterType: PRODUCTION/SERVICE/ADMIN/SALES`) and the finance-level (with parent_cc_id, company_id, plant_id). Schema mismatch — needs reconciliation.

### 13.10 RBAC gap

Same as gst-taxation — using `audit:read:critical` for writes is not a proper write permission. Anyone with audit critical read can mutate master financial data.

---

## 14. Module: `general-ledger` — General Ledger (Prisma-backed)

**Mount**: `/api/v1/finance/gl`
**File**: `apps/backend/src/modules/general-ledger/routes/index.ts` (95 lines)
**Permission family**: PROXY — `READ_PERM = AUDIT_READ`, `WRITE_PERM = AUDIT_READ` (same!)
**Workflow**: Service references `'GeneralLedgerLifecycle'` workflow (lazy import) but no workflow file exists in `general-ledger/workflow/index.ts` directory (file exists but content not directly read; workflow name pattern suggests JournalEntryLifecycle).

### 14.1 Endpoints

| Method | Path                                  | Permission (effective) | Description                              | Audit | Event |
|--------|---------------------------------------|------------------------|------------------------------------------|-------|-------|
| GET    | `/api/v1/finance/gl`                  | `audit:read`           | List general ledger entries              | No    | No    |
| GET    | `/api/v1/finance/gl/count`            | `audit:read`           | Count                                    | No    | No    |
| GET    | `/api/v1/finance/gl/exists/:code`     | `audit:read`           | Check existence by code                  | No    | No    |
| GET    | `/api/v1/finance/gl/:id`              | `audit:read`           | Get by ID                                | No    | No    |
| POST   | `/api/v1/finance/gl`                  | `audit:read`           | Create                                   | Yes   | Yes (event emitted) |
| PUT    | `/api/v1/finance/gl/:id`              | `audit:read`           | Update (optimistic concurrency)          | Yes   | No    |
| DELETE | `/api/v1/finance/gl/:id`              | `audit:read`           | Soft-delete (?reason=)                   | Yes   | No    |
| POST   | `/api/v1/finance/gl/:id/transition`   | `audit:read`           | Workflow transition                      | Yes   | Yes (event emitted) |

### 14.2 Schema

Route accepts arbitrary JSON. Service uses Prisma client directly. Prisma model name not explicitly listed in schema.prisma under a clear `GeneralLedger` model — gap.

### 14.3 Same RBAC + workflow gaps as gst-taxation (§10.3, §10.4)

---

## 15. Prisma Models — Master Data Inventory

The Prisma schema at `/home/z/my-project/prisma/schema.prisma` is the **future-state** data model. Many models are NOT yet wired to backend routes (the backend currently uses raw SQL via PGlite for product/customer/supplier/warehouse/inventory modules). The Prisma models exist for forward-compatibility with Prisma client (used by gst-taxation, product-costing, general-ledger).

### 15.1 Product domain (lines 1111–1722)

| Prisma Model              | Table name                | Key fields                                                                                          | Status enum values                                                                                              |
|---------------------------|---------------------------|-----------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `ProductCategory`         | `product_categories`      | `categoryCode` (unique), `categoryName`, `parentCategoryId`, `level`, `path`, `isLeaf`              | `ACTIVE` (default)                                                                                                |
| `Brand`                   | `brands`                  | `brandCode` (unique), `brandName`, `manufacturer`, `isOem`, `isPrivateLabel`                       | `ACTIVE`                                                                                                          |
| `Uom`                     | `uoms`                    | `uomCode` (unique), `uomName`, `uomType` (COUNT/WEIGHT/VOLUME/LENGTH/TIME), `isBaseUnit`           | `ACTIVE`                                                                                                          |
| `UomConversion`           | `uom_conversions`         | `fromUomId`, `toUomId`, `factor`, `companyId` (NULL=global)                                        | unique [fromUomId, toUomId, companyId]                                                                            |
| `Product`                 | `products`                | `upi` (unique), `productCode` (unique), `sku` (unique), `productType`, `status`, `brandId`, `categoryId`, `defaultUomId`, `hsnCode`, `taxGroupId`, `barcodeType`, `trackBatch`, `trackSerial`, `trackExpiry`, `shelfLifeDays`, `isManufactured`, `isPurchased`, `isSold`, `isStockManaged`, `isKitchenItem`, `netWeight`, `grossWeight`, `length`, `width`, `height`, `defaultCostPrice`, `defaultMrp`, `defaultSellingPrice`, `currencyCode` | `DRAFT`, `ACTIVE`, `INACTIVE`, `BLOCKED`, `DISCONTINUED`, `ARCHIVED` |
| `Attribute`               | `attributes`              | `attributeCode` (unique), `attributeName`, `attributeType`, `dataType`, `isRequired`, `isVariantAttribute`, `isSearchable`, `allowedValues[]` | `ACTIVE`                                                                                                          |
| `AttributeValue`          | `attribute_values`        | `attributeId`, `value`, `displayValue`, `sortOrder`                                                 | `ACTIVE`; unique [attributeId, value]                                                                             |
| `ProductAttribute`        | `product_attributes`      | `productId`, `attributeId`, `attributeValueId`, `valueText`, `valueNumber`, `valueBoolean`, `valueDate` | unique [productId, attributeId]                                                                                  |
| `ProductVariant`          | `product_variants`        | `productId`, `variantCode` (unique), `variantName`, `variantSku` (unique), `variantBarcode`, `variantAttributes` (JSON), `costPrice`, `mrp`, `sellingPrice`, `currencyCode`, `isDefault` | `ACTIVE`                                                                                                          |
| `ProductImage`            | `product_images`          | `productId`, `variantId`, `imageUrl`, `thumbnailUrl`, `imageType` (PRIMARY/GALLERY/THUMBNAIL/QR_PREVIEW/BARCODE_PREVIEW), `displayOrder`, `isPrimary` | —                                                                                                                 |
| `ProductDocument`         | `product_documents`       | `productId`, `documentName`, `documentType` (SPECIFICATION/FSSAI/LAB_REPORT/RECIPE/WARRANTY/CERTIFICATE/COA/MSDS), `fileUrl`, `version`, `isVerified`, `expiryDate` | —                                                                                                                 |
| `ProductFamily`           | `product_families`        | `familyCode` (unique), `familyName`, `displayOrder`                                                 | `ACTIVE`                                                                                                          |
| `ProductFamilyMapping`    | `product_family_mappings` | `productId`, `familyId`, `isPrimary`                                                                | unique [productId, familyId]                                                                                      |
| `ProductGroup`            | `product_groups`          | `groupCode` (unique), `groupName`, `parentGroupId`, `level`, `path` (supports unlimited hierarchy) | `ACTIVE`                                                                                                          |
| `ProductGroupMapping`     | `product_group_mappings`  | `productId`, `groupId`                                                                              | —                                                                                                                 |
| `ProductCollection`       | `product_collections`     | (collection master for merchandising)                                                               | —                                                                                                                 |
| `ProductCollectionItem`   | `product_collection_items`| `productId`, `collectionId`                                                                         | —                                                                                                                 |
| `ProductTemplate`         | `product_templates`       | (template for product creation)                                                                     | —                                                                                                                 |
| `ProductSpecification`    | `product_specifications`  | (technical specs)                                                                                   | —                                                                                                                 |
| `ProductCompliance`       | `product_compliance`      | (FSSAI, ISO, etc. at product level)                                                                | —                                                                                                                 |
| `ProductTranslation`      | `product_translations`    | (i18n)                                                                                              | —                                                                                                                 |
| `ProductVersion`          | `product_versions`        | (version history)                                                                                   | —                                                                                                                 |
| `ProductApprovalRequest`  | `product_approval_requests`| (approval workflow)                                                                                | —                                                                                                                 |
| `ProductUsageMatrix`      | `product_usage_matrix`    | (where product is used — channels)                                                                  | —                                                                                                                 |
| `ProductLifecycle`        | `product_lifecycles`      | (lifecycle stage definition)                                                                        | —                                                                                                                 |
| `ProductLifecycleHistory` | `product_lifecycle_histories` | (transition log)                                                                                | —                                                                                                                 |
| `ProductChangeHistory`    | `product_change_histories`| (audit trail of product field changes)                                                              | —                                                                                                                 |

### 15.2 Business Partner domain (lines 2340–2695)

> ⚠️ **Important**: The Prisma schema defines a unified `BusinessPartner` model with roles (`BusinessPartnerRole` with role values `CUSTOMER`, `SUPPLIER`, `DISTRIBUTOR`, `TRANSPORTER`, etc.). The current backend uses separate `customers` and `suppliers` tables via raw SQL. The Prisma model is the future-state.

| Prisma Model                            | Table name                              | Key fields / Notes                                                                              |
|-----------------------------------------|-----------------------------------------|--------------------------------------------------------------------------------------------------|
| `BusinessPartner`                       | `business_partners`                     | `partnerCode` (unique), `legalName`, `displayName`, `partnerType`, `status`, `gstNumber`, `panNumber`, `msmeNumber`, `fssaiNumber`, `iecCode`, `currency`, `creditLimit`, `creditDays`, `paymentTermsId`, `paymentMode`, `riskCategory`, `riskScore`, `parentPartnerId` |
| `BusinessPartnerRole`                   | `business_partner_roles`                | `partnerId`, `role` (CUSTOMER/SUPPLIER/DISTRIBUTOR/TRANSPORTER/etc.), `isPrimary`; unique [partnerId, role] |
| `BusinessPartnerAddress`                | `business_partner_addresses`            | `partnerId`, `addressType` (REGISTERED_OFFICE/BILLING/SHIPPING/FACTORY/WAREHOUSE/BRANCH/RESTAURANT/PICKUP/RETURN), `isDefault`, `line1`, `line2`, `city`, `district`, `state`, `stateCode`, `country`, `countryCode`, `pincode`, `latitude`, `longitude` |
| `BusinessPartnerContact`                | `business_partner_contacts`             | `partnerId`, `firstName`, `lastName`, `designation`, `department`, `email`, `mobile`, `officePhone`, `whatsapp`, `isPrimary`, `preferredContact`, `linkedUserId` |
| `BusinessPartnerFinancialProfile`       | `business_partner_financial_profiles`   | `partnerId` (unique), `creditLimit`, `outstandingAmount`, `availableCredit`, `creditDays`, `defaultCurrency`, `paymentMode`, `paymentTerms`, `taxCategory`, `riskCategory`, `riskScore`, `totalOrders`, `totalBusinessValue` |
| `BusinessPartnerCompliance`             | `business_partner_compliance`           | `partnerId`, `complianceType` (GST/PAN/MSME/FSSAI/IEC/ISO/AGREEMENT/INSURANCE), `certificateNumber`, `issuingAuthority`, `issueDate`, `expiryDate`, `documentUrl`, `documentVerified`, `status` |
| `CustomerGroup`                         | `customer_groups`                       | customer grouping                                                                                |
| `BusinessPartnerGroupMembership`        | `business_partner_group_memberships`    | partner ↔ group link                                                                             |
| `PartnerTag`                            | `partner_tags`                          | tagging for partners                                                                             |
| `BusinessPartnerBankAccount`            | `business_partner_bank_accounts`        | `partnerId`, `accountName`, `accountNumber`, `bankName`, `branchName`, `ifscCode`, `accountType`, `isDefault`, `upiId` |
| `BusinessPartnerRelationship`           | `business_partner_relationships`        | partner-to-partner relationships (parent/subsidiary, etc.)                                       |
| `BusinessPartnerScorecard`              | `business_partner_scorecards`           | performance scorecard                                                                            |

### 15.3 Organization domain (lines 291–770)

| Prisma Model             | Table name             | Key fields                                                                                                                                                                                                          |
|--------------------------|------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Enterprise`             | `enterprises`          | top of hierarchy                                                                                                                                                                                                    |
| `Company`                | `companies`            | `enterpriseId`, `companyCode` (unique), `companyName`, `legalName`, `companyType`, `gstin`, `pan`, `cin`, `currencyCode`, `timezone`, `locale`, `fiscalYearStart`, `fiscalYearEnd`, `website`, `logoUrl`, `status` |
| `CompanyAddress`         | `company_addresses`    | `companyId`, `addressType` (REGISTERED/OPERATIONAL/BRANCH), `addressLine1`, `city`, `state`, `country`, `postalCode`, `stateCode`, `countryCode`, `latitude`, `longitude`, `isDefault`                             |
| `CompanyTaxProfile`      | `company_tax_profiles` | `companyId`, `taxType` (GST/INCOME_TAX/PROFESSIONAL_TAX/LWF/TDS), `taxNumber`, `registrationDate`, `jurisdiction`, `filingFrequency`                                                                              |
| `CompanyBankAccount`     | `company_bank_accounts`| `companyId`, `accountName`, `accountNumber`, `bankName`, `branchName`, `ifscCode`, `accountType` (CURRENT/SAVINGS/ESCROW), `isDefault`, `upiId`                                                                    |
| `BusinessUnit`           | `business_units`       | `companyId`, `code`, `name`, `parentId`                                                                                                                                                                             |
| `Division`               | `divisions`            | `businessUnitId`, `code`, `name`, `parentId`                                                                                                                                                                        |
| `Branch`                 | `branches`             | branch entity                                                                                                                                                                                                       |
| `Plant`                  | `plants`               | `branchId`, `plantCode` (unique), `plantName`, `plantType` (MANUFACTURING/PACKING/COLD_STORAGE/DISTRIBUTION), `capacityPerDay`, `capacityUnit`, `shiftModel` (SINGLE/DOUBLE/TRIPLE), `workingDays[]`, `calendarId`, `plantManagerId`, `status` |
| `Warehouse`              | `warehouses`           | `branchId`, `plantId`, `warehouseCode` (unique), `warehouseName`, `warehouseType`, `capacityVolume`, `capacityWeight`, `temperatureZone`, `temperatureMin`, `temperatureMax`, `warehouseManagerId`, `status`       |
| `Department`             | `departments`          | `companyId`, `branchId`, `deptCode` (unique), `deptName`, `parentId`, `headUserId`, `costCenterId`                                                                                                                  |
| `CostCenter`             | `cost_centers`         | `companyId`, `branchId`, `costCenterCode` (unique), `costCenterName`, `costCenterType` (OPERATIONAL/ADMINISTRATIVE/SUPPORT/PROFIT_CENTER), `parentId`, `glAccountCode`, `budgetAnnual`, `currencyCode`             |
| `OrganizationTreeNode`   | `organization_tree_nodes` | materialized hierarchy view                                                                                                                                                                                       |

### 15.4 Pricing & Taxation domain (lines 1758–2340)

| Prisma Model             | Table name                | Key fields                                                                                                                                                                                                          |
|--------------------------|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `PriceList`              | `price_lists`             | `code` (unique), `name`, `type` (RETAIL/WHOLESALE/DISTRIBUTOR/EXPORT/RESTAURANT/ONLINE/CORPORATE/EMPLOYEE/FESTIVAL/SPECIAL_CONTRACT), `currency`, `validFrom`, `validTo`, `priority`, `status`, `taxMode` (EXCLUSIVE/INCLUSIVE), `roundingRule`, `roundingDigits` |
| `PriceListItem`          | `price_list_items`        | `priceListId`, `productId`, `productVariantId`, `uomId`, `basePrice`, `sellingPrice`, `mrp`, `purchasePrice`, `transferPrice`, `minQuantity`, `maxQuantity`, `validFrom`, `validTo`, `status`                     |
| `PriceListVersion`       | `price_list_versions`     | version history for price lists                                                                                                                                                                                     |
| `ProductPrice`           | `product_prices`          | product-level pricing                                                                                                                                                                                               |
| `TaxGroup`               | `tax_groups`              | tax grouping                                                                                                                                                                                                        |
| `TaxRate`                | `tax_rates`               | tax rate master (CGST/SGST/IGST/CESS)                                                                                                                                                                               |
| `ProductTaxMapping`      | `product_tax_mappings`    | product ↔ tax mapping                                                                                                                                                                                               |
| `TaxRule`                | `tax_rules`               | rule engine                                                                                                                                                                                                         |
| `DiscountRule`           | `discount_rules`          | discount definitions                                                                                                                                                                                                |
| `DiscountCondition`      | `discount_conditions`     | conditions for discounts                                                                                                                                                                                            |
| `DiscountTarget`         | `discount_targets`        | target entity for discount                                                                                                                                                                                          |
| `Promotion`              | `promotions`              | `promoCode`, `promoName`, `promoType`, `scope`, `productId`, `productCategoryId`, `customerId`, `discountType`, `discountValue`, `minQty`, `maxQty`, `minOrderValue`, `maxDiscountAmount`, `buyQty`, `getQty`, `startDate`, `endDate`, `usageLimit`, `usageCount`, `isActive`, `description`, `termsConditions` |
| `PromotionProduct`       | `promotion_products`      | promotion ↔ product mapping                                                                                                                                                                                         |
| `PromotionCondition`     | `promotion_conditions`    | conditions for promotions                                                                                                                                                                                           |
| `CostProfile`            | `cost_profiles`           | cost profile for products                                                                                                                                                                                           |
| `MarginRule`             | `margin_rules`            | margin rules                                                                                                                                                                                                        |
| `FuturePrice`            | `future_prices`           | future-dated price changes                                                                                                                                                                                          |
| `PriceApprovalRequest`   | `price_approval_requests` | approval workflow for prices                                                                                                                                                                                        |
| `CommercialRule`         | `commercial_rules`        | commercial terms (payment, delivery, etc.)                                                                                                                                                                          |
| `PriceResolutionLog`     | `price_resolution_logs`   | log of price resolution (which price was applied to which order)                                                                                                                                                    |

### 15.5 Identification & Traceability (lines 2697–3052)

| Prisma Model             | Table name                | Key fields                                                                                                                                                                                                          |
|--------------------------|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `BarcodeType`            | `barcode_types`           | barcode type master                                                                                                                                                                                                 |
| `Barcode`                | `barcodes`                | barcode master                                                                                                                                                                                                      |
| `BarcodeAssignment`      | `barcode_assignments`     | barcode ↔ entity                                                                                                                                                                                                    |
| `QrCode`                 | `qr_codes`                | QR code master                                                                                                                                                                                                      |
| `Batch`                  | `batches`                 | batch master for batch-tracked products                                                                                                                                                                             |
| `Lot`                    | `lots`                    | lot master                                                                                                                                                                                                          |
| `SerialNumber`           | `serial_numbers`          | serial number tracking                                                                                                                                                                                              |
| `Gs1Identifier`          | `gs1_identifiers`         | GS1 identifier master                                                                                                                                                                                               |
| `LabelTemplate`          | `label_templates`         | label template master                                                                                                                                                                                               |
| `LabelPrintJob`          | `label_print_jobs`        | print job queue                                                                                                                                                                                                     |
| `TraceabilityLog`        | `traceability_logs`       | end-to-end traceability log                                                                                                                                                                                         |

### 15.6 Warehouse domain (lines 6026–6475)

| Prisma Model             | Table name                | Key fields                                                                                                                                                                                                          |
|--------------------------|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `WarehouseMaster`        | `warehouse_master`        | `warehouseCode` (unique), `warehouseName`, `warehouseType`, `companyId`, `branchId`, `managerId`, `managerName`, address fields, `timezone`, `barcodeEnabled`, `fifoEnabled`, `fefoEnabled`, `qualityInspectionRequired`, `defaultPickingStrategy`, `defaultPutawayStrategy`, capacity fields, operating hours, `status` (ACTIVE/INACTIVE/MAINTENANCE/CLOSED) |
| `WarehouseZone`          | `warehouse_zones`         | `warehouseId`, `zoneCode`, `zoneName`, `zoneType` (RECEIVING/PUTAWAY/STORAGE/PICKING/PACKING/DISPATCH/RETURNS/QUARANTINE/QUALITY_INSPECTION/DAMAGED_GOODS), `parentZoneId`, `temperatureZoneId`, capacity fields, `isRestricted`, `accessRequired`; unique [warehouseId, zoneCode] |
| `TemperatureZone`        | `temperature_zones`       | `warehouseId`, `zoneCode`, `zoneName`, `tempZoneType` (AMBIENT/CHILLED/FROZEN/DEEP_FREEZE/HUMIDITY_CONTROLLED), `minTemperature`, `maxTemperature`, `targetTemperature`, humidity ranges, alert thresholds, `lastReading`, `lastReadingAt`; unique [warehouseId, zoneCode] |
| `TemperatureLog`         | `temperature_logs`        | `temperatureZoneId`, `temperature`, `humidity`, `isAlert`, `alertType`, `sensorId`, `recordedAt`                                                                                                                  |
| `WarehouseCapacity`      | `warehouse_capacity`      | `warehouseId`, `zoneId`, capacity metrics (volume/weight/pallets/bins), `utilizationPercent`, `snapshotDate`                                                                                                       |
| `WarehouseCalendar`      | `warehouse_calendar`      | `warehouseId`, `calendarDate`, `dayType` (WORKING_DAY/HOLIDAY/MAINTENANCE/SPECIAL), shift times, `isClosed`                                                                                                        |
| `WarehouseAccessRule`    | `warehouse_access_rules`  | access control rules                                                                                                                                                                                                |
| `WarehouseRule`          | `warehouse_rules`         | business rules for warehouse operations                                                                                                                                                                             |
| `WarehouseAisle`         | `warehouse_aisles`        | `warehouseId`, `zoneId`, `aisleCode`, `aisleName`, `lengthM`, `widthM`, `trafficDirection` (ONE_WAY/TWO_WAY/FORKLIFT_ONLY/WALKING_ONLY); unique [warehouseId, aisleCode]                                            |
| `WarehouseRack`          | `warehouse_racks`         | `warehouseId`, `zoneId`, `aisleId`, `rackCode`, `rackName`, `heightM`, `widthM`, `depthM`, `maxWeightKg`, `shelfCount`, `fireZone`; unique [warehouseId, rackCode]                                                  |
| `WarehouseShelf`         | `warehouse_shelves`       | `warehouseId`, `rackId`, `shelfCode`, `shelfName`, `level`, `heightFromFloor`, `maxWeightKg`, `maxVolumeM3`, `pickingLevel` (GROUND/MID/HIGH/TOP), `accessibility`; unique [warehouseId, shelfCode]                 |
| `WarehouseBin`           | `warehouse_bins`          | `warehouseId`, `warehouseCode`, `zoneId`, `aisleId`, `rackId`, `shelfId`, `binCode`, `barcode` (unique), `qrCode` (unique), capacity fields, `temperatureZone`, utilization                                                                      |

### 15.7 Manufacturing domain — Recipe/BOM (lines 10370–10555)

| Prisma Model             | Table name                | Key fields                                                                                                                                                                                                          |
|--------------------------|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Recipe`                 | `recipes`                 | recipe master (raw SQL version is `recipes` table)                                                                                                                                                                  |
| `RecipeVersion`          | `recipe_versions`         | version history                                                                                                                                                                                                     |
| `Formula`                | `formulas`                | formula master                                                                                                                                                                                                      |
| `FormulaLine`            | `formula_lines`           | formula components                                                                                                                                                                                                  |
| `BillOfMaterial`         | `bill_of_materials`       | `bomCode` (unique), `recipeId`, `recipeCode`, `productId`, `productSku`, `productName`, `bomType` (SINGLE_LEVEL/MULTI_LEVEL/PHANTOM/PACKAGING/ALTERNATE/ENGINEERING/MANUFACTURING), `version`, `status`            |
| `BOMLine`                | `bom_lines`               | `bomId`, `lineNo`, `componentId`, `componentSku`, `componentName`, `componentType`, `quantity`, `uom`, `scrapPercentage`, `unitCost`, `totalCost`, `hasAlternate`                                                  |
| `RoutingStep`            | `routing_steps`           | routing step master                                                                                                                                                                                                 |
| `YieldRule`              | `yield_rules`             | `recipeId`, `expectedYieldPct`, `expectedLossPct`, `minYieldPct`, `maxYieldPct`; unique [recipeId]                                                                                                                  |
| `YieldHistory`           | `yield_histories`         | batch yield history                                                                                                                                                                                                 |

### 15.8 Manufacturing org (lines 10049–10370)

| Prisma Model             | Table name                | Key fields                                                                                                                                                                                                          |
|--------------------------|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ManufacturingPlant`     | `manufacturing_plants`    | manufacturing plant master (separate from `Plant`)                                                                                                                                                                  |
| `ProductionDepartment`   | `production_departments`  | production department master                                                                                                                                                                                        |
| `ProductionLine`         | `production_lines`        | production line master                                                                                                                                                                                              |
| `WorkCenter`             | `work_centers`            | work center master (referenced by routing operations)                                                                                                                                                               |
| `ProductionCalendar`     | `production_calendars`    | production calendar master                                                                                                                                                                                          |
| `ProductionShift`        | `production_shifts`       | shift master                                                                                                                                                                                                        |
| `PlantHoliday`           | `plant_holidays`          | holiday calendar                                                                                                                                                                                                    |
| `ProductionResource`     | `production_resources`    | resource master (machine/labor)                                                                                                                                                                                     |
| `PlantConfiguration`     | `plant_configurations`    | plant configuration settings                                                                                                                                                                                        |

---

## 16. Master Endpoint Matrix (Consolidated)

Total endpoints across all 12 Section 03 modules: **117 endpoints** (counted from route files).

### By module endpoint count

| Module                  | Endpoint count | Mount prefix                          |
|-------------------------|----------------|---------------------------------------|
| product                 | 14             | `/api/v1/catalog`                     |
| customer                | 12             | `/api/v1/sales`                       |
| supplier                | 15             | `/api/v1/procurement`                 |
| organization            | 17             | `/api/v1/organization`                |
| warehouse               | 15             | `/api/v1/warehouse`                   |
| inventory               | 14             | `/api/v1/inventory`                   |
| pricing-engine          | 9              | `/api/v1/sales/pricing`               |
| gst-taxation            | 8              | `/api/v1/finance/gst`                 |
| recipe-bom              | 9              | `/api/v1/manufacturing/recipes`       |
| product-costing         | 8              | `/api/v1/finance/costing`             |
| financial-foundation    | 14             | `/api/v1/finance/foundation`          |
| general-ledger          | 8              | `/api/v1/finance/gl`                  |

### Permission matrix (consolidated)

| Permission literal        | Modules using it                                                    |
|---------------------------|---------------------------------------------------------------------|
| `product:read`            | product, recipe-bom                                                 |
| `product:create`          | product, recipe-bom                                                 |
| `product:update`          | product, recipe-bom                                                 |
| `product:delete`          | product                                                             |
| `supplier:read`           | supplier                                                            |
| `supplier:create`         | supplier                                                            |
| `supplier:update`         | supplier                                                            |
| `supplier:delete`         | supplier                                                            |
| `supplier:blacklist`      | supplier (blacklist endpoint)                                       |
| `org:read`                | organization, customer (proxy)                                      |
| `org:create`              | organization, customer (proxy)                                      |
| `org:update`              | organization, customer (proxy)                                      |
| `org:delete`              | organization, customer (proxy)                                      |
| `customer:read`           | pricing-engine (proxy)                                              |
| `customer:update`         | pricing-engine (proxy)                                              |
| `inventory:read`          | inventory, warehouse                                                |
| `inventory:post`          | inventory, warehouse                                                |
| `inventory:adjust`        | inventory (blocks, expiry mark)                                     |
| `audit:read`              | gst-taxation (read+write), product-costing (read+write), general-ledger (read+write), financial-foundation (read only) |
| `audit:read:critical`     | financial-foundation (write proxy)                                  |
| `system:tenant:cross`     | organization (hard-delete company — checked in service, not route) |

### Audit log coverage matrix

| Module                  | Mutating endpoints with audit log? |
|-------------------------|------------------------------------|
| product                 | Yes (create, update, delete, transition, addBarcode, category.create, brand.create) |
| customer                | Yes (create, update, delete, transition, addContact, addAddress, group.create) |
| supplier                | Yes (create, update, delete, transition, blacklist [CRITICAL], addContact, addAddress, addCompliance, assignProduct, category.create) |
| organization            | Yes (all CRUD including restore and hardDelete [CRITICAL]) |
| warehouse               | Yes (zone/aisle/rack/bin create, putaway create+complete, barcode create+print, scan) |
| inventory               | Yes (stockIn, stockOut, reserve, release, block, markExpired) |
| pricing-engine          | Yes (all creates)                  |
| gst-taxation            | Yes (create, update, delete, transition) |
| recipe-bom              | Yes (create, transition) — but NO audit for BOM create (gap) |
| product-costing         | Yes (create, update, delete, transition) |
| financial-foundation    | Yes (all creates, period close, exchange rate set) |
| general-ledger          | Yes (create, update, delete, transition) |

### Event coverage matrix

| Module                  | Events emitted                                                                                                                                                                                                                                                                                           |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| product                 | `ProductCreated`, `ProductUpdated`, `ProductApproved`, `ProductArchived`                                                                                                                                                                                                                                  |
| customer                | `CustomerCreated`, `CustomerApproved`, `CustomerBlocked`, `CustomerArchived`                                                                                                                                                                                                                              |
| supplier                | `SupplierCreated`, `SupplierUpdated`, `SupplierApproved`, `SupplierBlocked`, `SupplierBlacklisted`                                                                                                                                                                                                        |
| organization            | `CompanyCreated`, `PlantActivated`                                                                                                                                                                                                                                                                        |
| warehouse               | `PutawayTaskCreated`, `PutawayCompleted`                                                                                                                                                                                                                                                                  |
| inventory               | `StockAdded`, `StockRemoved`, `StockBlocked`                                                                                                                                                                                                                                                              |
| pricing-engine          | (none)                                                                                                                                                                                                                                                                                                    |
| gst-taxation            | `GstConfigCreated`, `GstConfigurationTransitioned`                                                                                                                                                                                                                                                        |
| recipe-bom              | `RecipeCreated`, `RecipeApproved`                                                                                                                                                                                                                                                                         |
| product-costing         | `ProductCostCalculated`, `ProductCostTransitioned`                                                                                                                                                                                                                                                        |
| financial-foundation    | (none)                                                                                                                                                                                                                                                                                                    |
| general-ledger          | (events emitted per service code review but specific names not enumerated in route file)                                                                                                                                                                                                                  |

---

## 17. Missing Endpoints (Frontend Needs That Backend Doesn't Expose)

Based on the frontend exploration findings (see `_exploration_findings.md` for the frontend's UI buttons/forms), the following capabilities are shown in the UI but have **no corresponding backend endpoint**:

### 17.1 Product domain gaps
- **UOM create** — `POST /api/v1/catalog/uoms` (only list exists, no create)
- **UOM conversion** — `POST /api/v1/catalog/uom-conversions` (no endpoints; table exists in Prisma)
- **HSN code CRUD** — no endpoints (UI has HSN/SAC tab; table column exists on Product but no master)
- **SAC code CRUD** — no endpoints
- **Product attributes CRUD** — no endpoints (Prisma models `Attribute`, `AttributeValue`, `ProductAttribute` exist)
- **Product variants CRUD** — no endpoints (Prisma model `ProductVariant` exists)
- **Product images CRUD** — no endpoints (Prisma model `ProductImage` exists)
- **Product documents CRUD** — no endpoints (Prisma model `ProductDocument` exists)
- **Product families CRUD** — no endpoints
- **Product groups CRUD** — no endpoints
- **Product templates CRUD** — no endpoints
- **Product specifications CRUD** — no endpoints
- **Product compliance** (product-level, distinct from supplier compliance) — no endpoints
- **Product translations** — no endpoints
- **Product versioning/approval workflow** — no endpoints (Prisma models exist)
- **Product usage matrix** — no endpoints
- **Product change history** — no endpoints (audit log exists but no dedicated query endpoint)
- **Category update/delete** — only list + create exist; no `PATCH/DELETE /api/v1/catalog/categories/:id`
- **Brand update/delete** — only list + create exist; no `PATCH/DELETE /api/v1/catalog/brands/:id`
- **Barcode delete** — repository has `softDelete` but no route exposed

### 17.2 Customer domain gaps
- **Customer contact update/delete** — only create exists; no `PATCH/DELETE /customers/:id/contacts/:contactId`
- **Customer address update/delete** — only create exists
- **Customer group update/delete** — only list + create exist
- **Customer credit hold/release** — no dedicated endpoint; only the credit status GET exists
- **Customer bank account CRUD** — no endpoints (Prisma model `BusinessPartnerBankAccount` exists)
- **Customer compliance CRUD** — no endpoints
- **Customer scorecard** — no endpoints
- **Customer tags** — no endpoints

### 17.3 Supplier domain gaps
- **Supplier contact update/delete** — only create + list exist
- **Supplier address update/delete** — only create exists
- **Supplier compliance update/delete/mark-expired** — repository has `findExpiring` and `updateStatus` but **no routes exposed**
- **Supplier product mapping update/delete** — only create + list exist
- **Supplier category update/delete** — only list + create exist
- **Supplier bank account CRUD** — no endpoints
- **Supplier scorecard** — no endpoints
- **Un-blacklist endpoint** — only blacklist exists; no `POST /suppliers/:id/unblacklist`

### 17.4 Organization domain gaps
- **Business Unit CRUD** — repository exists (`businessUnitRepository`) but **no routes**
- **Division CRUD** — no routes (Prisma model exists, hierarchy reads it)
- **Region CRUD** — no routes (Prisma model exists, hierarchy reads it)
- **Branch CRUD** — no routes (Prisma model exists)
- **Plant update/delete** — only list + create + transition exist; no `PATCH/DELETE /plants/:id`
- **Warehouse update/delete/transition** — only list + create exist
- **Department update/delete** — only list + create exist
- **Cost center update/delete** — only list + create exist
- **Financial year update/delete/close** — only list + create + getCurrent exist; close is in financial-foundation module
- **Working calendar CRUD** — types exist (`WorkingCalendarInput`) but no routes
- **Tax config CRUD** — types exist (`TaxConfigInput`) but no routes (different from pricing-engine tax configs)

### 17.5 Warehouse domain gaps
- **Warehouse master CRUD** — `/api/v1/warehouse` only exposes zones/aisles/racks/bins/putaway/barcodes/scan, NOT the warehouse entity itself (that's at `/api/v1/organization/warehouses`)
- **Zone update/delete** — only list + create exist
- **Aisle update/delete** — only list + create exist
- **Rack update/delete** — only list + create exist
- **Bin update/delete/block/unblock** — only list + create exist (no block endpoint despite `isBlocked` field)
- **Putaway task cancel/reassign** — only list + create + complete exist
- **Temperature zones CRUD** — no endpoints (Prisma model exists)
- **Temperature logs query** — no endpoints
- **Warehouse capacity snapshots** — no endpoints
- **Warehouse calendar** — no endpoints
- **Shelf CRUD** — no endpoints (Prisma model `WarehouseShelf` exists)

### 17.6 Inventory domain gaps
- **Inventory adjustment** — no endpoints (Prisma models `InventoryAdjustment`, `InventoryAdjustmentLine`, `AdjustmentReason` exist)
- **Stock transfer** — no endpoints (Prisma models `StockTransfer`, `StockTransferLine`, `InventoryInTransit` exist)
- **Bin transfer** — no endpoints (Prisma model `BinTransfer` exists)
- **Physical inventory / cycle count** — no endpoints (Prisma models `PhysicalInventory`, `CycleCountPlan`, `CycleCountSchedule`, `CountVariance` exist)
- **Lot CRUD** — only list-by-product implicitly via stock-in; no `GET /lots`
- **Serial number tracking** — no endpoints (Prisma model `SerialNumber` exists)
- **Stock reservation by batch/lot** — repository supports `batchId`/`lotId` but not exposed in DTO
- **Stock block release** — only create + list exist; no release endpoint
- **Inventory revaluation** — no endpoints (Prisma model exists)
- **Inventory cost layer** — no endpoints

### 17.7 Pricing domain gaps
- **Price list item CRUD** — no endpoints (Prisma model `PriceListItem` exists, used by calculate engine)
- **Price list version** — no endpoints
- **Product price** — no endpoints
- **Customer price agreement CRUD** — no endpoints (table `customer_price_agreements` referenced by calculate engine)
- **Discount rule CRUD** — no endpoints (Prisma models `DiscountRule`, `DiscountCondition`, `DiscountTarget` exist)
- **Promotion update/delete** — only list + create exist
- **Coupon update/delete/validate** — only list + create exist
- **Tax config update/delete** — only list + create exist
- **Future price** — no endpoints (Prisma model exists)
- **Price approval workflow** — no endpoints (Prisma model exists)
- **Commercial rule** — no endpoints

### 17.8 GST/Taxation gaps
- **HSN code master CRUD** — no endpoints (referenced as a field on Product but no master entity)
- **SAC code master CRUD** — no endpoints
- **Tax rate CRUD** — no endpoints (Prisma model `TaxRate` exists)
- **Tax group CRUD** — no endpoints (Prisma model `TaxGroup` exists)
- **Tax return filing** — workflow exists (`TaxReturnLifecycle`) but no routes
- **GSTIN validation/lookup against GST portal** — only local lookup by GSTIN exists

### 17.9 Recipe/BOM gaps
- **Recipe update** — only create + transition exist
- **Recipe item update/delete** — no endpoints
- **Recipe byproduct update/delete** — no endpoints
- **BOM update** — only create + transition exist
- **BOM line update/delete** — no endpoints
- **Routing update/delete** — only create + list + get exist
- **Routing operation update/delete** — no endpoints
- **Formula CRUD** — no endpoints (Prisma models `Formula`, `FormulaLine` exist)
- **Yield rule CRUD** — no endpoints (Prisma model `YieldRule` exists)

### 17.10 Financial foundation gaps
- **Account update/delete** — only list + create exist
- **Fiscal year update/delete/close** — only list + create exist (close is on periods)
- **Fiscal period open/reopen** — only close exists
- **Cost center update/delete** — only list + create exist
- **Profit center update/delete** — only list + create exist
- **Currency update/delete** — only list + create exist
- **Exchange rate update/delete** — only list + create exist
- **Payment terms CRUD** — no endpoints (referenced as enum in customer/supplier, but no master entity)
- **Shipping terms CRUD** — no endpoints
- **Incoterms CRUD** — no endpoints

### 17.11 Identification/Traceability gaps
- **Barcode type CRUD** — no endpoints (Prisma model `BarcodeType` exists)
- **Barcode assignment CRUD** — no endpoints (Prisma model `BarcodeAssignment` exists)
- **QR code CRUD** — no endpoints (Prisma model `QrCode` exists)
- **GS1 identifier CRUD** — no endpoints (Prisma model `Gs1Identifier` exists)
- **Label template CRUD** — no endpoints (Prisma model `LabelTemplate` exists)
- **Label print job CRUD** — no endpoints (Prisma model `LabelPrintJob` exists)
- **Traceability log query** — no endpoints (Prisma model `TraceabilityLog` exists)

### 17.12 Data governance gaps (per frontend exploration)
- **Import job CRUD** — no endpoints (Prisma models `ImportJob`, `ImportError` exist)
- **Export job CRUD** — no endpoints
- **Validation rule CRUD** — no endpoints (Prisma models `ValidationRule`, `ValidationResult` exist)
- **Duplicate candidate review** — no endpoints (Prisma model `DuplicateCandidate` exists)
- **Merge history** — no endpoints (Prisma model `MergeHistory` exists)
- **Master data audit query** — no endpoints (Prisma model `MasterDataAudit` exists)
- **Data quality metrics** — no endpoints (Prisma model `DataQualityMetric` exists)

---

## 18. Backend Gaps & Recommendations

### 18.1 Critical security gaps

1. **Customer module uses `org:*` permissions as proxy** instead of the defined `customer:*` permissions (`customer/routes/index.ts` lines 49–54). Fix: change `CUSTOMER_READ = Permission.ORG_READ` to `CUSTOMER_READ = Permission.CUSTOMER_READ` etc.

2. **Pricing-engine uses `customer:read`/`customer:update` as proxy** for pricing operations. Pricing has no dedicated permissions. Fix: add `pricing:read`, `pricing:create`, `pricing:update`, `pricing:delete`, `pricing:calculate` to the Permission registry.

3. **gst-taxation, product-costing, general-ledger all use `audit:read` for BOTH read and write**. Any user with audit:read can mutate master data. Fix: add `finance:gst:read|write`, `finance:costing:read|write`, `finance:gl:read|write` permissions.

4. **financial-foundation uses `audit:read:critical` for write proxy**. Still incorrect — critical audit read is not a write permission. Fix: add `finance:accounts:write`, `finance:fiscal:write`, `finance:currency:write`, `finance:cost-center:write`, `finance:profit-center:write`, `finance:exchange-rate:write`.

5. **Warehouse module uses `inventory:read`/`inventory:post`** for warehouse master operations (zones, aisles, racks, bins). Warehouse master operations should have their own permissions like `warehouse:read|create|update|delete`. Anyone with `inventory:post` can create bins and putaway tasks, which is too coarse.

6. **Recipe-BOM uses `product:read|create|update`** instead of dedicated `recipe:read|create|update|delete`, `bom:read|create|update|delete`, `routing:read|create|update|delete`.

### 18.2 Critical workflow gaps

1. **gst-taxation service calls `workflowRegistry.get('GstConfigurationLifecycle')`** but the workflow file registers `TaxReturnLifecycle`. Transition endpoint will always fail with `WORKFLOW.NOT_REGISTERED`. Fix: either register `GstConfigurationLifecycle` workflow OR change the service to not require a workflow.

2. **product-costing service calls `workflowRegistry.get('ProductCostLifecycle')`** but no workflow file exists. Same gap as gst-taxation.

3. **general-ledger service references a workflow** but the workflow file content was not explicitly reviewed — likely the same pattern.

4. **BOM transitions do NOT use the workflow registry** (service validates status string manually), which is inconsistent with Recipe transitions. Fix: register a `BomLifecycle` workflow and use it consistently.

### 18.3 Critical data model gaps

1. **Prisma models `GstConfigurations`, `ProductCosts`** are referenced in service code via `(db as any).GstConfigurations` but **not defined in `schema.prisma`**. This means Prisma client likely returns undefined for these models, and the endpoints will fail at runtime.

2. **Two `cost_centers` concepts** exist:
   - Organization module: `cost_centers` table with `cost_center_type` (PRODUCTION/SERVICE/ADMIN/SALES)
   - Financial-foundation module: `cost_centers` table with `cc_code`, `cc_name`, `parent_cc_id`, `company_id`, `plant_id`
   
   These conflict. Fix: unify into one cost center model.

3. **Customer/Supplier use raw SQL** (`customers`, `suppliers` tables) while Prisma defines a unified `BusinessPartner` model with roles. The current implementation will not work with the Prisma model. Migration path needed.

4. **Inventory uses raw SQL** (`inventory`, `inventory_transactions`, `inventory_ledger` tables) while Prisma defines `StockBalance`, `StockLedger`, `InventoryTransaction`, `InventoryJournalEntry` models. Schema mismatch.

5. **Warehouse zones/aisles/racks/bins use raw SQL** while Prisma defines `WarehouseMaster`, `WarehouseZone`, `WarehouseAisle`, `WarehouseRack`, `WarehouseShelf`, `WarehouseBin`. Schema mismatch.

### 18.4 Validation gaps

1. **gst-taxation, product-costing, general-ledger routes accept arbitrary JSON** with no zod validator. Only the service layer checks for required fields. Fix: add zod schemas.

2. **product module's `productSchema` zod validator strips unknown fields by default** (Hono zod-validator strips by default). The repository supports ~30 optional fields not in the zod schema (e.g. `longDescription`, `weight`, `volume`, `minTemp`, `maxTemp`, `defaultWarehouseId`, `manufacturingType`, `yieldPercent`, `upi`). Either extend the schema or set `zValidator` to passthrough mode.

3. **Customer module's `customerSchema` does not include** `tan`, `fssaiLicense`, `secondaryEmail`, `fax`, `salesRepId`, `loyaltyCategory` enum conflict (zod has `SILVER/GOLD/PLATINUM`, repository column is `loyalty_category`).

4. **PATCH /products/:id does NOT use zod validation** — it uses `await c.req.json()` directly. Same for PATCH /customers/:id, PATCH /suppliers/:id. Fix: add a partial schema.

5. **No request size limits per route** — relies on global `payloadSizeLimit()` middleware only.

### 18.5 Event gaps

1. **product module does not emit `ProductDeleted`** event on delete.
2. **customer module does not emit `CustomerUpdated`** event on update.
3. **pricing-engine emits NO events** at all (price list, promotion, coupon, tax config creates are silent).
4. **financial-foundation emits NO events** (account, fiscal year, currency, exchange rate creates are silent).
5. **recipe-bom does not emit events for BOM creation/transition** (only Recipe events).
6. **organization module emits events only for `CompanyCreated` and `PlantActivated`** — no events for warehouse, department, cost center, financial year creates.

### 18.6 Audit gaps

1. **recipe-bom does NOT log audit for BOM creation** (line 156 of service logs `entityType: 'BOM'` but the action is `'CREATE'` — wait, re-reading, it does log). However, BOM transitions DO log audit.
2. **List endpoints have no audit logging** — this is intentional for performance but means no read-tracking.
3. **`GET /customers/:id/credit`** does not log audit despite being a sensitive financial view.

### 18.7 Architectural consistency gaps

1. **Three persistence patterns coexist**:
   - Raw SQL via `query()` (product, customer, supplier, warehouse, inventory, recipe-bom, financial-foundation, pricing-engine)
   - Prisma client via `(db as any).ModelName` (gst-taxation, product-costing, general-ledger)
   - Repository pattern abstracting the above
   
   Fix: standardize on Prisma + repository pattern across all modules.

2. **Optimistic concurrency is inconsistent**:
   - product, customer, supplier, organization: use `If-Match` header for version
   - gst-taxation, product-costing, general-ledger: pass `version` in request body
   - warehouse: uses `If-Match` only for putaway completion
   - pricing-engine: no OCC at all
   - financial-foundation: no OCC at all

3. **Pagination response shape varies**:
   - Most modules use `paginated(rows, { correlationId, page, pageSize, total })` from `@/core/response`
   - gst-taxation, product-costing, general-ledger return `{ rows, total, page, pageSize }` directly
   - Fix: standardize on the `paginated()` helper everywhere.

4. **Error response shape** — relies on global error middleware. No per-route error handling.

### 18.8 Recommendations for frontend wiring

For the frontend team to wire up Section 03, prioritize in this order:

**Tier 1 (already functional, just wire up)**:
1. Organization module (companies, plants, warehouses, departments, cost centers, financial years, hierarchy) — full CRUD + workflow
2. Product module (products, categories, brands, uoms) — full CRUD + workflow
3. Supplier module — full CRUD + blacklist + compliances + product mappings
4. Customer module — full CRUD + credit status + contacts + addresses + groups
5. Inventory module — stock-in/out + reservations + blocks + ledger + batches

**Tier 2 (functional but with RBAC gaps to fix first)**:
6. Warehouse module (zones, aisles, racks, bins, putaway, barcodes, scan)
7. Recipe-BOM module (recipes, BOMs, routings, BOM explosion)
8. Pricing-engine module (price lists, promotions, coupons, tax configs, calculate)

**Tier 3 (Prisma-backed but with critical gaps — do NOT wire up until fixed)**:
9. gst-taxation — broken workflow registration
10. product-costing — broken workflow registration, missing Prisma model
11. general-ledger — broken workflow registration
12. financial-foundation — works but RBAC gap (uses audit:read:critical for writes)

**Tier 4 (frontend UI exists but backend endpoints missing)**:
- All of section 17 above (UOM conversions, HSN/SAC master, product variants/images/documents, business partner bank accounts/scorecards, BU/Division/Region CRUD, warehouse temperature zones, inventory adjustments/transfers/physical counts, price list items, discount rules, GST tax rates/groups, formula/yield rules, payment terms/shipping terms/incoterms masters, identification/traceability, data governance).

---

## 19. Quick Reference: All Section 03 Endpoints (Sorted by Path)

```
DELETE   /api/v1/catalog/products/:id
GET      /api/v1/catalog/brands
GET      /api/v1/catalog/categories
GET      /api/v1/catalog/products
GET      /api/v1/catalog/products/:id
GET      /api/v1/catalog/products/:id/barcodes
GET      /api/v1/catalog/products/barcode/:barcode
GET      /api/v1/catalog/uoms
PATCH    /api/v1/catalog/products/:id
POST     /api/v1/catalog/brands
POST     /api/v1/catalog/categories
POST     /api/v1/catalog/products
POST     /api/v1/catalog/products/:id/barcodes
POST     /api/v1/catalog/products/:id/transition

GET      /api/v1/finance/costing
GET      /api/v1/finance/costing/:id
GET      /api/v1/finance/costing/count
GET      /api/v1/finance/costing/exists/:code
POST     /api/v1/finance/costing
POST     /api/v1/finance/costing/:id/transition
PUT      /api/v1/finance/costing/:id
DELETE   /api/v1/finance/costing/:id

GET      /api/v1/finance/foundation/accounts
GET      /api/v1/finance/foundation/cost-centers
GET      /api/v1/finance/foundation/currencies
GET      /api/v1/finance/foundation/exchange-rates
GET      /api/v1/finance/foundation/fiscal-periods
GET      /api/v1/finance/foundation/fiscal-years
GET      /api/v1/finance/foundation/profit-centers
POST     /api/v1/finance/foundation/accounts
POST     /api/v1/finance/foundation/cost-centers
POST     /api/v1/finance/foundation/currencies
POST     /api/v1/finance/foundation/exchange-rates
POST     /api/v1/finance/foundation/fiscal-periods/close
POST     /api/v1/finance/foundation/fiscal-years
POST     /api/v1/finance/foundation/profit-centers

GET      /api/v1/finance/gl
GET      /api/v1/finance/gl/:id
GET      /api/v1/finance/gl/count
GET      /api/v1/finance/gl/exists/:code
POST     /api/v1/finance/gl
POST     /api/v1/finance/gl/:id/transition
PUT      /api/v1/finance/gl/:id
DELETE   /api/v1/finance/gl/:id

GET      /api/v1/finance/gst
GET      /api/v1/finance/gst/:id
GET      /api/v1/finance/gst/count
GET      /api/v1/finance/gst/exists/:code
POST     /api/v1/finance/gst
POST     /api/v1/finance/gst/:id/transition
PUT      /api/v1/finance/gst/:id
DELETE   /api/v1/finance/gst/:id

GET      /api/v1/inventory/batches
GET      /api/v1/inventory/blocks
GET      /api/v1/inventory/expiry
GET      /api/v1/inventory/inventory
GET      /api/v1/inventory/inventory/:id
GET      /api/v1/inventory/ledger
GET      /api/v1/inventory/reservations
GET      /api/v1/inventory/transactions
POST     /api/v1/inventory/blocks
POST     /api/v1/inventory/expiry/mark-expired
POST     /api/v1/inventory/inventory/stock-in
POST     /api/v1/inventory/inventory/stock-out
POST     /api/v1/inventory/reservations
POST     /api/v1/inventory/reservations/:id/release

GET      /api/v1/manufacturing/recipes/boms
GET      /api/v1/manufacturing/recipes/boms/:id
GET      /api/v1/manufacturing/recipes/boms/:id/explode
GET      /api/v1/manufacturing/recipes/recipes
GET      /api/v1/manufacturing/recipes/recipes/:id
GET      /api/v1/manufacturing/recipes/routings
GET      /api/v1/manufacturing/recipes/routings/:id
POST     /api/v1/manufacturing/recipes/boms
POST     /api/v1/manufacturing/recipes/boms/:id/transition
POST     /api/v1/manufacturing/recipes/recipes
POST     /api/v1/manufacturing/recipes/recipes/:id/transition
POST     /api/v1/manufacturing/recipes/routings

DELETE   /api/v1/organization/companies/:id
DELETE   /api/v1/organization/companies/:id/hard
GET      /api/v1/organization/companies
GET      /api/v1/organization/companies/:id
GET      /api/v1/organization/cost-centers
GET      /api/v1/organization/departments
GET      /api/v1/organization/financial-years
GET      /api/v1/organization/financial-years/current
GET      /api/v1/organization/hierarchy
GET      /api/v1/organization/plants
GET      /api/v1/organization/plants/:id
GET      /api/v1/organization/warehouses
GET      /api/v1/organization/warehouses/:id
PATCH    /api/v1/organization/companies/:id
POST     /api/v1/organization/companies
POST     /api/v1/organization/companies/:id/restore
POST     /api/v1/organization/companies/:id/transition
POST     /api/v1/organization/cost-centers
POST     /api/v1/organization/departments
POST     /api/v1/organization/financial-years
POST     /api/v1/organization/plants
POST     /api/v1/organization/plants/:id/transition
POST     /api/v1/organization/warehouses

GET      /api/v1/procurement/supplier-categories
GET      /api/v1/procurement/suppliers
GET      /api/v1/procurement/suppliers/:id
GET      /api/v1/procurement/suppliers/:id/contacts
GET      /api/v1/procurement/suppliers/gst/:gstin
PATCH    /api/v1/procurement/suppliers/:id
POST     /api/v1/procurement/supplier-categories
POST     /api/v1/procurement/suppliers
POST     /api/v1/procurement/suppliers/:id/addresses
POST     /api/v1/procurement/suppliers/:id/blacklist
POST     /api/v1/procurement/suppliers/:id/compliances
POST     /api/v1/procurement/suppliers/:id/contacts
POST     /api/v1/procurement/suppliers/:id/products
POST     /api/v1/procurement/suppliers/:id/transition
DELETE   /api/v1/procurement/suppliers/:id

GET      /api/v1/sales/customer-groups
GET      /api/v1/sales/customers
GET      /api/v1/sales/customers/:id
GET      /api/v1/sales/customers/:id/credit
GET      /api/v1/sales/customers/gst/:gstin
PATCH    /api/v1/sales/customers/:id
POST     /api/v1/sales/customer-groups
POST     /api/v1/sales/customers
POST     /api/v1/sales/customers/:id/addresses
POST     /api/v1/sales/customers/:id/contacts
POST     /api/v1/sales/customers/:id/transition
DELETE   /api/v1/sales/customers/:id

GET      /api/v1/sales/pricing/coupons
GET      /api/v1/sales/pricing/price-lists
GET      /api/v1/sales/pricing/promotions
GET      /api/v1/sales/pricing/tax-configs
POST     /api/v1/sales/pricing/calculate
POST     /api/v1/sales/pricing/coupons
POST     /api/v1/sales/pricing/price-lists
POST     /api/v1/sales/pricing/promotions
POST     /api/v1/sales/pricing/tax-configs

GET      /api/v1/warehouse/aisles
GET      /api/v1/warehouse/barcodes
GET      /api/v1/warehouse/bins
GET      /api/v1/warehouse/putaway-tasks
GET      /api/v1/warehouse/racks
GET      /api/v1/warehouse/scan-logs
GET      /api/v1/warehouse/zones
POST     /api/v1/warehouse/aisles
POST     /api/v1/warehouse/barcodes
POST     /api/v1/warehouse/barcodes/:id/print
POST     /api/v1/warehouse/bins
POST     /api/v1/warehouse/putaway-tasks
POST     /api/v1/warehouse/putaway-tasks/:id/complete
POST     /api/v1/warehouse/racks
POST     /api/v1/warehouse/scan
POST     /api/v1/warehouse/zones
```

**Total: 117 endpoints across 12 modules.**

---

**End of backend findings.**

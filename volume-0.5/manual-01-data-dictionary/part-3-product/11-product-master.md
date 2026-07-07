# Manual 1 · Part 3 · Entity 11 — Product Master

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 3 — Product Master Domain |
| Entity | Product Master (011) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## 1. Business Purpose

The `Product Master` is the **single source of truth for every item managed within SUOP**. It is the most-referenced master entity in the entire platform — Inventory, Warehouse, Manufacturing, Retail, Restaurant, Procurement, Quality, and Reporting all depend on it.

A Product may represent:
- **Raw Material** — sugar, ghee, dry fruits, flour (inputs to manufacturing)
- **Packaging Material** — boxes, wrappers, labels, films
- **Semi-Finished Product** — intermediate products in multi-stage manufacturing
- **Finished Goods** — final products ready for sale
- **Trading Item** — third-party FMCG products resold without transformation (beverages, chocolates, grocery)
- **Consumable** — cleaning supplies, lubricants, office supplies
- **Service** — non-physical services (e.g., contract labor services)
- **Asset Spare** — spare parts for machines (per Ch 17 §17.3)
- **Chemical** — production chemicals
- **Cleaning Material** — hygiene and sanitation products

**Critical architectural principle**: One product = one SKU. Variants (different sizes, flavors, packaging) are **separate Product records** linked via `product_family_id`. This enables independent batch tracking, pricing, barcode, and lifecycle management per variant while maintaining family-level reporting and forecasting.

Per Volume 0 Chapter 7 §7.6, the Product Specification (a sub-entity of Product) is one of the 6 versioned master data types — changes to critical product attributes (composition, allergens, shelf-life) create new versions, preserving historical traceability.

---

## 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Product Management Head |
| Data Owner | Product Management Head |
| Technical Owner | Backend Lead — Product Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

---

## 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `products` |
| Prisma Model | `Product` |
| File Location | `prisma/schema/master/product/product.prisma` |
| Partitioning | None (medium volume — thousands of SKUs, but reads > writes; partitioning not needed until > 100k SKUs) |
| Lifecycle | Master Data Lifecycle (Volume 0 Ch 7 §7.5) |
| Versioned Sub-Entity | `product_specifications` (per Ch 7 §7.6) |

---

## 4. Field Dictionary

### 4.1 Universal Base Fields (per Part 1 §3)

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | `uuid_generate_v7()` | PK, immutable | Internal primary key |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `PRD-` | Product code (e.g., `PRD-000123`) — **immutable after activation** |
| `company_id` | UUID | Yes | — | FK to `companies.id` | Owning company |
| `facility_id` | UUID | No | NULL | — | **Exception**: NULL — Product is company-wide (facility-specific data lives in `product_facility_overrides`) |
| `status` | ENUM | Yes | `DRAFT` | 8-stage master lifecycle (DRAFT, SUBMITTED, REVIEWED, APPROVED, PUBLISHED, ACTIVE, INACTIVE, ARCHIVED) | Master data lifecycle |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation timestamp (UTC) |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto-update | Last modification (UTC) |
| `created_by` | UUID | Yes | — | FK to `user_accounts.id` | Creator |
| `updated_by` | UUID | Yes | — | FK to `user_accounts.id` | Last modifier |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft-delete timestamp (per Ch 4 §4.10) |
| `version` | INTEGER | Yes | `1` | Optimistic concurrency | Increments on each update |

### 4.2 Product Identity Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `sku` | VARCHAR(50) | Yes | — | Unique globally (not just per company), format `^[A-Z0-9\-]{4,50}$` | Stock Keeping Unit — human-readable product identifier (e.g., `SDS-KJU-KTL-500G`) | Public | Demand forecast |
| `product_name` | VARCHAR(250) | Yes | — | Min 3, max 250 chars | Full product name (e.g., "Kaju Katli 500g Premium Pack") | Public | — |
| `short_name` | VARCHAR(80) | No | NULL | Min 2, max 80 | Short display name (e.g., "Kaju Katli 500g") | Public | — |
| `scientific_name` | VARCHAR(250) | No | NULL | — | Scientific name (for botanical ingredients, e.g., "Anacardium occidentale" for cashew) | Internal | — |
| `description` | TEXT | No | NULL | — | Detailed marketing/operational description | Internal | — |
| `description_short` | VARCHAR(500) | No | NULL | — | Short description for catalogs/POS | Public | — |

### 4.3 Classification Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `brand_id` | UUID | Yes | — | FK to `brands.id` | Brand this product belongs to | Public |
| `category_id` | UUID | Yes | — | FK to `product_categories.id` | Parent category | Internal |
| `sub_category_id` | UUID | Yes | — | FK to `product_sub_categories.id` | Parent sub-category | Internal |
| `product_family_id` | UUID | No | NULL | FK to `product_families.id` | Product family (NULL = standalone product, no variants) | Internal |
| `product_line` | ENUM | No | NULL | SWEETS, NAMEKEEN, BAKERY, SNACKS, RTE, FROZEN, PACKAGING, TRADING, OTHER | Product line (per Ch 2 §2.2) | Internal |

### 4.4 Product Type & Inventory Type

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `product_type` | ENUM | Yes | — | RAW_MATERIAL, PACKAGING, SEMI_FINISHED, FINISHED_GOODS, TRADING_ITEM, CONSUMABLE, SERVICE, ASSET_SPARE, CHEMICAL, CLEANING_MATERIAL | Product type (immutable after transactions exist) | Internal |
| `inventory_type` | ENUM | Yes | `STOCK_ITEM` | STOCK_ITEM, NON_STOCK, SERVICE, DIGITAL, CAPITAL_ASSET | Inventory tracking type | Internal |

### 4.5 Measurement Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `base_uom_id` | UUID | Yes | — | FK to `uoms.id` | Base UOM (all inventory stored in base UOM) | Internal |
| `purchase_uom_id` | UUID | No | NULL | FK to `uoms.id`; NULL = same as base | Default purchase UOM | Internal |
| `sale_uom_id` | UUID | No | NULL | FK to `uoms.id`; NULL = same as base | Default sale UOM | Internal |
| `production_uom_id` | UUID | No | NULL | FK to `uoms.id`; NULL = same as base | Default production UOM | Internal |
| `weight_per_unit_g` | DECIMAL(10,4) | No | NULL | > 0 | Weight of one base unit in grams (for shipping calculations) | Internal |
| `volume_per_unit_ml` | DECIMAL(10,4) | No | NULL | > 0 | Volume of one base unit in milliliters | Internal |
| `length_cm` | DECIMAL(8,2) | No | NULL | > 0 | Product length (cm) — for packaging | Internal |
| `width_cm` | DECIMAL(8,2) | No | NULL | > 0 | Product width (cm) | Internal |
| `height_cm` | DECIMAL(8,2) | No | NULL | > 0 | Product height (cm) | Internal |

### 4.6 Tracking Configuration

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `barcode_required` | BOOLEAN | Yes | `true` | — | Whether product requires barcode assignment | Internal |
| `batch_required` | BOOLEAN | Yes | `true` | — | Whether product requires batch tracking | Internal |
| `expiry_required` | BOOLEAN | Yes | `true` | — | Whether product requires expiry date tracking | Internal |
| `serial_tracking` | BOOLEAN | Yes | `false` | — | Whether product requires serial number tracking (rare for food) | Internal |
| `qc_required` | BOOLEAN | Yes | `true` | — | Whether product requires QC inspection | Internal |
| `qc_inspection_type` | ENUM | No | `INCOMING` | NONE, INCOMING, IN_PROCESS, FINAL, ALL | QC inspection stages required | Internal |
| `shelf_life_days` | INTEGER | No | NULL | > 0; NULL = inherit from category | Shelf life in days (per Ch 8 §8.3) | Internal |
| `shelf_life_opened_days` | INTEGER | No | NULL | > 0 | Shelf life after opening (for refrigerated items) | Internal |
| `requires_cold_chain` | BOOLEAN | Yes | `false` | — | Whether product requires cold chain storage | Internal |
| `cold_chain_temp_min_c` | DECIMAL(5,2) | No | NULL | Required if requires_cold_chain=true | Min cold chain temperature | Internal |
| `cold_chain_temp_max_c` | DECIMAL(5,2) | No | NULL | Required if requires_cold_chain=true | Max cold chain temperature | Internal |
| `allergens` | TEXT[] | No | `ARRAY[]::TEXT[]` | Subset of FSSAI allergens | Allergen tags (FSSAI labeling requirement per Ch 18 §18.7) | Public |

### 4.7 Procurement Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `default_supplier_id` | UUID | No | NULL | FK to `vendors.id` | Preferred supplier | Confidential |
| `lead_time_days` | INTEGER | No | NULL | ≥ 0 | Standard lead time from supplier | Internal |
| `min_order_qty` | DECIMAL(18,4) | No | NULL | > 0 | Minimum order quantity | Internal |
| `max_order_qty` | DECIMAL(18,4) | No | NULL | > 0 | Maximum order quantity | Internal |
| `order_multiple_qty` | DECIMAL(18,4) | No | NULL | > 0 | Order must be multiple of this | Internal |
| `purchase_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Standard purchase cost (per base UOM) | Confidential |
| `purchase_currency` | CHAR(3) | No | `INR` | ISO 4217 | Purchase currency | Internal |

### 4.8 Pricing Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `list_price` | DECIMAL(18,4) | No | NULL | ≥ 0 | List price (MRP) per base UOM | Confidential |
| `list_price_currency` | CHAR(3) | No | `INR` | ISO 4217 | Price currency | Internal |
| `wholesale_price` | DECIMAL(18,4) | No | NULL | ≥ 0, ≤ list_price | Wholesale price | Confidential |
| `distributor_price` | DECIMAL(18,4) | No | NULL | ≥ 0, ≤ wholesale_price | Distributor price | Confidential |
| `retail_price` | DECIMAL(18,4) | No | NULL | ≥ 0, ≤ list_price | Retail price | Confidential |
| `cost_price` | DECIMAL(18,4) | No | NULL | ≥ 0 | Standard cost (for margin calculation) | Confidential |
| `margin_pct` | DECIMAL(5,2) | No | — | Generated: `((list_price - cost_price) / list_price) * 100` | Margin percentage | Confidential |
| `tax_code` | VARCHAR(20) | No | NULL | FK to `tax_codes.code`; NULL = inherit from category | Tax code | Internal |

### 4.9 Inventory Management Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `reorder_point` | INTEGER | No | NULL | ≥ 0; NULL = inherit from category | Reorder point (per Q10) | Internal |
| `safety_stock` | INTEGER | No | NULL | ≥ 0; NULL = inherit from category | Safety stock | Internal |
| `max_stock_level` | INTEGER | No | NULL | ≥ reorder_point | Maximum stock level | Internal |
| `abc_class` | ENUM | No | NULL | A, B, C; NULL = inherit from category | ABC classification (per Q9 cycle counting) | Internal |
| `cycle_count_frequency` | ENUM | No | NULL | DAILY, WEEKLY, MONTHLY, QUARTERLY; NULL = inherit from warehouse | Cycle count frequency | Internal |
| `fefo_enabled` | BOOLEAN | Yes | `true` | — | First-Expiry-First-Out picking (per Ch 5 §5.16) | Internal |
| `negative_stock_allowed` | BOOLEAN | Yes | `false` | — | Whether negative stock is allowed (rare, per Ch 15 §15.10) | Internal |
| `valuation_method` | ENUM | Yes | `FIFO` | FIFO, LIFO, WEIGHTED_AVG, STANDARD_COST, SPECIFIC | Inventory valuation method (per Ch 15 §15.4 Financial Reports) | Confidential |

### 4.10 Manufacturing Fields (for FINISHED_GOODS, SEMI_FINISHED)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `default_recipe_id` | UUID | No | NULL | FK to `recipes.id` | Default recipe for this product | Internal |
| `default_bom_id` | UUID | No | NULL | FK to `boms.id` | Default BOM | Internal |
| `production_yield_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Expected yield percentage | Internal |
| `default_batch_size` | DECIMAL(18,4) | No | NULL | > 0 | Default production batch size | Internal |
| `production_lead_time_hours` | INTEGER | No | NULL | > 0 | Standard production time per batch | Internal |

### 4.11 POS Integration Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `pos_item_code` | VARCHAR(50) | No | NULL | Unique per company if set | POS system item code | Confidential |
| `pos_department` | VARCHAR(50) | No | NULL | — | POS department/category | Internal |
| `is_pos_sync_enabled` | BOOLEAN | Yes | `true` | — | Whether product syncs to POS | Internal |
| `hsn_code` | VARCHAR(10) | No | NULL | Format `^[0-9]{4,8}$` | HSN code for GST (India) | Internal |
| `is_returnable` | BOOLEAN | Yes | `true` | — | Whether product can be returned at POS | Internal |
| `return_window_days` | INTEGER | No | NULL | > 0 | Return window (days from purchase) | Internal |

### 4.12 Compliance Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `fssai_category_code` | VARCHAR(20) | No | NULL | — | FSSAI product category code | Confidential |
| `is_veg` | BOOLEAN | Yes | `true` | — | Veg/Non-veg indicator (FSSAI labeling) | Public |
| `ingredients` | TEXT | No | NULL | — | Ingredients list (FSSAI labeling) | Public |
| `nutritional_info` | JSONB | No | NULL | — | Nutritional information per 100g (FSSAI) | Public |
| `storage_instructions` | TEXT | No | NULL | — | Storage instructions (FSSAI labeling) | Public |
| `usage_instructions` | TEXT | No | NULL | — | Usage instructions | Public |
| `country_of_origin` | CHAR(2) | Yes | `IN` | ISO 3166-1 alpha-2 | Country of origin (FSSAI labeling) | Public |
| `manufacturer_name` | VARCHAR(200) | No | NULL | — | Manufacturer name (FSSAI labeling) | Public |
| `manufacturer_address` | TEXT | No | NULL | — | Manufacturer address | Public |
| `packer_name` | VARCHAR(200) | No | NULL | — | Packer name (if different from manufacturer) | Public |
| `packer_address` | TEXT | No | NULL | — | Packer address | Public |
| `marketing_company` | VARCHAR(200) | No | NULL | — | Marketing company name | Public |
| `best_before_text` | VARCHAR(100) | No | NULL | — | "Best before" text (FSSAI) | Public |
| `fssai_license_no` | VARCHAR(17) | No | NULL | — | FSSAI license number of manufacturer | Confidential |
| `is_organic_certified` | BOOLEAN | Yes | `false` | — | Organic certification | Public |
| `organic_certification_body` | VARCHAR(100) | No | NULL | — | Certification body name | Internal |

### 4.13 Status & Lifecycle Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `active` | BOOLEAN | Yes | `true` | — | Active flag (false = INACTIVE) | Public |
| `is_archived` | BOOLEAN | Yes | `false` | — | Archived flag | Internal |
| `launch_date` | DATE | No | NULL | — | Product launch date | Internal |
| `discontinue_date` | DATE | No | NULL | Must be > launch_date if set | Planned discontinuation date | Internal |
| `replacement_product_id` | UUID | No | NULL | FK to `products.id` | Replacement product (when this is discontinued) | Internal |

### 4.14 Image & Media Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `primary_image_file_id` | UUID | No | NULL | FK to `file_attachments.id` | Primary product image | Public |
| `image_library_id` | UUID | No | NULL | FK to `product_image_libraries.id` | Image library reference | Internal |

### 4.15 Custom Fields & Annotations

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `custom_fields` | JSONB | No | `{}'::JSONB` | — | Custom fields for product-specific attributes | Internal |
| `remarks` | TEXT | No | NULL | — | Free-text annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Filterable annotations | Internal |

---

## 5. Relationships

### 5.1 Inbound Relationships (Product as Parent)

| Relationship | Cardinality | Direction | FK Field | Cascade | Delete Rule |
|---|---|---|---|---|---|
| Product → Company | N : 1 | inbound | `company_id` → `companies.id` | RESTRICT | Cannot delete company with active products |
| Product → Brand | N : 1 | inbound | `brand_id` → `brands.id` | RESTRICT | Cannot delete brand with active products |
| Product → Category | N : 1 | inbound | `category_id` → `product_categories.id` | RESTRICT | Cannot delete category with active products |
| Product → SubCategory | N : 1 | inbound | `sub_category_id` → `product_sub_categories.id` | RESTRICT | Cannot delete sub-category with active products |
| Product → ProductFamily | N : 1 | inbound | `product_family_id` → `product_families.id` | SET NULL | Family reference cleared |
| Product → UOM (base) | N : 1 | inbound | `base_uom_id` → `uoms.id` | RESTRICT | Cannot delete UOM used as base |
| Product → UOM (purchase) | N : 1 | inbound | `purchase_uom_id` → `uoms.id` | SET NULL | Purchase UOM cleared |
| Product → UOM (sale) | N : 1 | inbound | `sale_uom_id` → `uoms.id` | SET NULL | Sale UOM cleared |
| Product → UOM (production) | N : 1 | inbound | `production_uom_id` → `uoms.id` | SET NULL | Production UOM cleared |
| Product → Vendor (default supplier) | N : 1 | inbound | `default_supplier_id` → `vendors.id` | SET NULL | Default supplier cleared |
| Product → Recipe (default) | N : 1 | inbound | `default_recipe_id` → `recipes.id` | SET NULL | Default recipe cleared |
| Product → BOM (default) | N : 1 | inbound | `default_bom_id` → `boms.id` | SET NULL | Default BOM cleared |
| Product → TaxCode | N : 1 | inbound | `tax_code` → `tax_codes.code` | SET NULL | Tax code cleared |
| Product → Product (replacement) | N : 1 | self-ref | `replacement_product_id` → `products.id` | SET NULL | Replacement reference cleared |
| Product → FileAttachment (image) | N : 1 | inbound | `primary_image_file_id` → `file_attachments.id` | SET NULL | Image cleared |

### 5.2 Outbound Relationships (Product as Parent)

| Relationship | Cardinality | Direction | FK Field | Cascade | Delete Rule |
|---|---|---|---|---|---|
| Product → ProductSpecification | 1 : N | outbound | `product_specifications.product_id` | CASCADE | Specs deleted with product |
| Product → ProductFacilityOverride | 1 : N | outbound | `product_facility_overrides.product_id` | CASCADE | Overrides deleted with product |
| Product → Barcode | 1 : N | outbound | `barcodes.product_id` | CASCADE | Barcodes deleted with product |
| Product → PackagingMaster | 1 : N | outbound | `packaging_master.product_id` | CASCADE | Packaging deleted with product |
| Product → StockSummary | 1 : N | outbound | `stock_summary.product_id` | RESTRICT | Cannot delete product with stock |
| Product → InventoryLedger | 1 : N | outbound | `inventory_ledger.product_id` | RESTRICT | Cannot delete product with ledger entries |
| Product → Batch | 1 : N | outbound | `batches.product_id` | RESTRICT | Cannot delete product with batches |
| Product → PurchaseOrderLine | 1 : N | outbound | `purchase_order_lines.product_id` | RESTRICT | Cannot delete product with PO lines |
| Product → RecipeLine (as ingredient) | 1 : N | outbound | `recipe_lines.ingredient_product_id` | RESTRICT | Cannot delete product used in recipes |
| Product → ProductionOrderLine | 1 : N | outbound | `production_order_lines.product_id` | RESTRICT | Cannot delete product with production orders |
| Product → QCInspection | 1 : N | outbound | `qc_inspections.product_id` | RESTRICT | Cannot delete product with QC records |
| Product → POSSyncLog | 1 : N | outbound | `pos_sync_logs.product_id` | SET NULL | Sync logs retain product_id for audit |

---

## 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_products` | PRIMARY KEY | `id` | Default PK |
| `uq_products_code_company` | UNIQUE | `company_id, code` | Code uniqueness per company |
| `uq_products_sku` | UNIQUE | `sku` | Global SKU uniqueness |
| `uq_products_pos_code` | UNIQUE PARTIAL | `company_id, pos_item_code WHERE pos_item_code IS NOT NULL AND deleted_at IS NULL` | POS code uniqueness per company |
| `idx_products_status` | B-TREE | `status, deleted_at, is_archived` | Default query filter |
| `idx_products_brand` | B-TREE | `brand_id, status` | Filter by brand |
| `idx_products_category` | B-TREE | `category_id, sub_category_id, status` | Filter by classification |
| `idx_products_family` | B-TREE | `product_family_id WHERE product_family_id IS NOT NULL` | Family lookup |
| `idx_products_type` | B-TREE | `company_id, product_type, status` | Filter by type |
| `idx_products_supplier` | B-TREE | `default_supplier_id WHERE default_supplier_id IS NOT NULL` | Find products by supplier |
| `idx_products_recipe` | B-TREE | `default_recipe_id WHERE default_recipe_id IS NOT NULL` | Find products by recipe |
| `idx_products_hsn` | B-TREE | `hsn_code WHERE hsn_code IS NOT NULL` | GST filing lookup |
| `idx_products_search` | GIN | `to_tsvector('english', product_name || ' ' || short_name || ' ' || sku || ' ' || code)` | Full-text search (per Ch 7 §7.15) |
| `idx_products_active` | PARTIAL | `company_id, product_type WHERE status = 'ACTIVE' AND deleted_at IS NULL` | Fast active product lookup |
| `idx_products_cold_chain` | PARTIAL | `company_id WHERE requires_cold_chain = true AND status = 'ACTIVE'` | Cold chain product lookup |
| `idx_products_tags` | GIN | `tags` | Tag-based filtering |
| `idx_products_allergens` | GIN | `allergens` | Allergen filtering (compliance) |
| `idx_products_updated_at` | B-TREE | `updated_at DESC` | Recent changes / sync |

---

## 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `code` must be unique per company | DB + App | Unique constraint |
| 2 | `sku` must be globally unique | DB + App | Unique constraint |
| 3 | `product_name` must be at least 3 chars | App | Zod schema |
| 4 | `code` is **immutable** after `status = ACTIVE` | App | Service-layer + audit |
| 5 | `product_type` is **immutable** after transactions exist | App | Referential integrity check |
| 6 | `sku` is **immutable** after activation | App | Service-layer + audit |
| 7 | `base_uom_id.uom_class` must match `purchase_uom_id.uom_class`, `sale_uom_id.uom_class`, `production_uom_id.uom_class` | App | Service-layer validation |
| 8 | `weight_per_unit_g`, `volume_per_unit_ml`, dimensions > 0 if set | DB | CHECK constraint |
| 9 | `shelf_life_days` > 0 if set | DB | CHECK constraint |
| 10 | `cold_chain_temp_max_c` > `cold_chain_temp_min_c` if both set | DB | CHECK constraint |
| 11 | If `requires_cold_chain = true`, `cold_chain_temp_min_c` and `cold_chain_temp_max_c` required | DB | CHECK constraint |
| 12 | `list_price` ≥ `wholesale_price` ≥ `distributor_price` ≥ `cost_price` (if all set) | App | Service-layer validation |
| 13 | `reorder_point` ≤ `max_stock_level` (if both set) | App | Service-layer validation |
| 14 | `default_recipe_id` only allowed for FINISHED_GOODS or SEMI_FINISHED products | App | Service-layer validation |
| 15 | `default_bom_id` only allowed for FINISHED_GOODS or SEMI_FINISHED | App | Service-layer validation |
| 16 | `allergens` must be subset of FSSAI allergen list | App | Zod enum validation |
| 17 | `hsn_code` format validation `^[0-9]{4,8}$` | App | Zod schema |
| 18 | `fssai_license_no` format `^[0-9]{14}$` | App | Zod schema |
| 19 | State transition DRAFT → SUBMITTED requires: `product_name`, `sku`, `code`, `brand_id`, `category_id`, `sub_category_id`, `product_type`, `base_uom_id` | App | Master Data Quality Validator |
| 20 | State transition SUBMITTED → APPROVED requires L2 approval (Product Management Head) | App | Approval Engine integration |
| 21 | State transition APPROVED → PUBLISHED requires Product Specification version approved | App | Spec version check |
| 22 | Cannot delete product with `status = ACTIVE` (must deactivate first) | App | Service-layer enforcement |
| 23 | Cannot delete product with stock, ledger entries, batches, POs, production orders, QC records | App | Referential integrity check |
| 24 | Inactive products remain available in historical records | App | Soft-delete preserves references |
| 25 | `discontinue_date` must be > `launch_date` if both set | DB | CHECK constraint |

---

## 8. API Mapping

| Endpoint | Method | Capability | Permission | Notes |
|---|---|---|---|---|
| `/api/v1/products` | GET | List products | `PRODUCT:VIEW` | Paginated, filtered by status/brand/category/type/family |
| `/api/v1/products/:id` | GET | Get product details | `PRODUCT:VIEW` | Includes spec, packaging, barcodes |
| `/api/v1/products` | POST | Create product (DRAFT) | `PRODUCT:CREATE` | Triggers approval workflow |
| `/api/v1/products/:id` | PATCH | Update product | `PRODUCT:EDIT` | Critical fields require approval |
| `/api/v1/products/:id/submit` | POST | Submit for approval | `PRODUCT:EDIT` | DRAFT → SUBMITTED |
| `/api/v1/products/:id/approve` | POST | Approve product | `PRODUCT:APPROVE` | L2 approval |
| `/api/v1/products/:id/publish` | POST | Publish product | `PRODUCT:APPROVE` | APPROVED → PUBLISHED |
| `/api/v1/products/:id/activate` | POST | Activate product | `PRODUCT:APPROVE` | PUBLISHED → ACTIVE |
| `/api/v1/products/:id/deactivate` | POST | Deactivate product | `PRODUCT:APPROVE` | ACTIVE → INACTIVE |
| `/api/v1/products/:id/archive` | POST | Archive product | `PRODUCT:APPROVE` | INACTIVE → ARCHIVED |
| `/api/v1/products/search` | GET | Search products | `PRODUCT:VIEW` | Full-text search (< 500ms per Ch 12 §12.8) |
| `/api/v1/products/barcode/:barcode` | GET | Lookup by barcode | `PRODUCT:VIEW` | < 200ms per Ch 20 §20.10 |
| `/api/v1/products/:id/specifications` | GET | Get spec versions | `PRODUCT:VIEW` | Versioned specs |
| `/api/v1/products/:id/packaging` | GET | Get packaging | `PRODUCT:VIEW` | Packaging hierarchy |
| `/api/v1/products/:id/barcodes` | GET | Get barcodes | `PRODUCT:VIEW` | All barcodes for product |
| `/api/v1/products/:id/inventory` | GET | Get inventory summary | `PRODUCT:VIEW` | Across all facilities |
| `/api/v1/products/:id/suppliers` | GET | Get suppliers | `PRODUCT:VIEW` | Approved suppliers |
| `/api/v1/products/:id/history` | GET | Get audit history | `PRODUCT:AUDIT_VIEW` | All changes |
| `/api/v1/products/:id/recall-check` | POST | Check recall impact | `PRODUCT:VIEW` | Traceability check |
| `/api/v1/products/:id/clone` | POST | Clone product | `PRODUCT:CREATE` | New SKU, copies attributes |

---

## 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Product List | AG Grid with multi-filter (brand, category, type, status) | `/products` |
| Product Detail | Tabbed: Overview, Spec, Packaging, Barcodes, Inventory, Recipes, Suppliers, Pricing, Compliance, Audit | `/products/:id` |
| Product Create Form | Multi-section wizard: Identity, Classification, Measurement, Tracking, Procurement, Pricing, Inventory, Manufacturing, POS, Compliance, Images | `/products/new` |
| Product Edit Form | Same as Create, with versioning for critical fields | `/products/:id/edit` |
| Product Approval Queue | Approval cards for pending products | `/products/approvals` |
| Product Search | Global search with barcode, SKU, name, category filters | `/products/search` |
| Product Comparison | Side-by-side comparison of 2-4 products | `/products/compare` |
| Product Family View | All variants of a family | `/products/families/:id/variants` |
| Cold Chain Products | Filtered list of cold-chain products | `/products/cold-chain` |
| Expiring Products | Products near expiry (cross-facility) | `/products/expiring` |

---

## 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| Product barcode scan | Lookup product by barcode (< 200ms) |
| Product search | Mobile product search |
| Product info card | Display: image, name, SKU, price, stock, batch info |
| Product image capture | QC inspection photos (linked to product) |
| Product allergen check | Restaurant/retail staff check allergens |
| Product cold chain check | Verify cold chain requirements during putaway |
| Product spec view | QC inspectors view specifications on mobile |
| Product reorder | L3+ trigger reorder from mobile |

---

## 11. Reports

| Report | Use of Product Master |
|---|---|
| Product Master Report | Complete product list with all attributes |
| Category Analysis | Product count, sales, inventory by category |
| Inactive Products Report | Products with no movement in N days |
| Barcode Report | Products with/without barcodes |
| Packaging Report | Packaging hierarchy per product |
| Variant Report | All variants per family |
| Cold Chain Products Report | All cold chain products with storage requirements |
| Allergen Report | Products by allergen (compliance) |
| HSN/GST Report | Products grouped by HSN code for GST filing |
| Product Profitability | Margin analysis per product |
| Slow-Moving Products | Products with low movement velocity |
| Fast-Moving Products | Top products by sales volume |
| Near-Expiry Products | Products with batches near expiry |
| Discontinued Products | Products planned for discontinuation |
| New Products | Products launched in last N days |

---

## 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE | Yes | Optional | Permanent |
| UPDATE (non-critical) | Yes | Optional | Permanent |
| UPDATE (critical: code, sku, product_type, base_uom_id, allergens, ingredients, shelf_life_days, requires_cold_chain, hsn_code, tax_code, fssai_license_no) | Yes | **Mandatory** | Permanent |
| UPDATE (pricing: list_price, cost_price, margin_pct) | Yes | **Mandatory** | Permanent |
| STATUS CHANGE | Yes | **Mandatory** | Permanent |
| ACTIVATE / DEACTIVATE | Yes | **Mandatory** | Permanent |
| ARCHIVE | Yes | **Mandatory** | Permanent |
| DELETE (soft — only if no transactions) | Yes | **Mandatory** | Permanent |
| BARCODE CHANGE | Yes | **Mandatory** | Permanent |
| PACKAGING CHANGE | Yes | **Mandatory** | Permanent |
| CATEGORY CHANGE | Yes | **Mandatory** | Permanent |
| VARIANT CREATION | Yes | Optional | Permanent |
| EXPORT | Yes | **Mandatory** | 7 years |

**Audit Level**: Full (all field changes captured with old/new values)

---

## 13. Security Classification

| Field Category | Classification | Access |
|---|---|---|
| `product_name`, `short_name`, `description_short`, `brand_id`, `primary_image_file_id`, `is_veg`, `ingredients`, `nutritional_info`, `storage_instructions`, `country_of_origin`, `manufacturer_*`, `packer_*`, `best_before_text`, `is_organic_certified`, `active` | Public | All authenticated users |
| `code`, `sku`, `category_id`, `sub_category_id`, `product_family_id`, `product_line`, `product_type`, `inventory_type`, `base_uom_id`, dimensions, `barcode_required`, `batch_required`, `expiry_required`, `qc_required`, `shelf_life_days`, `requires_cold_chain`, `allergens`, `hsn_code`, `pos_item_code` | Internal | L2+ Product, Operations |
| `default_supplier_id`, `lead_time_days`, `min_order_qty`, `max_order_qty`, `purchase_cost`, `purchase_currency` | Confidential | L2+ Procurement, Finance |
| `list_price`, `wholesale_price`, `distributor_price`, `retail_price`, `cost_price`, `margin_pct`, `valuation_method` | Confidential | L2+ Finance, Product |
| `reorder_point`, `safety_stock`, `max_stock_level`, `abc_class`, `cycle_count_frequency` | Internal | L2+ Warehouse, Inventory |
| `default_recipe_id`, `default_bom_id`, `production_yield_pct`, `default_batch_size` | Internal | L2+ Manufacturing |
| `fssai_category_code`, `fssai_license_no` | Confidential | L2+ Quality, Compliance |
| `replacement_product_id`, `discontinue_date` | Internal | L2+ Product |
| `custom_fields` | Internal | L2+ Product (per field) |

---

## 14. AI Relevance

The Product Master is the **highest-value AI entity** in the platform. Almost every AI capability depends on it.

| AI Capability | Usage |
|---|---|
| **Demand Forecast AI** | Per-product (and per-family) demand forecasting |
| **Procurement Planning AI** | Uses `default_supplier_id`, `lead_time_days`, `reorder_point` |
| **Inventory Optimization AI** | Per-product reorder point optimization |
| **Warehouse Slotting AI** | Uses dimensions, weight, ABC class for bin assignment |
| **Recipe Optimization AI** | Uses `default_recipe_id` for ingredient analysis |
| **Sales Forecast AI** | Per-product sales prediction |
| **Expiry Prediction AI** | Uses `shelf_life_days`, `requires_cold_chain` |
| **Waste Analysis AI** | Identifies high-waste products |
| **Recommendation Engine** | Product recommendations for retail/restaurant |
| **Price Optimization AI** | Uses pricing fields for dynamic pricing |
| **Cold Chain Compliance AI** | Monitors cold chain products |
| **Allergen Cross-Contamination AI** | Uses `allergens` field for production planning |
| **Substitute Product AI** | Recommends substitutes when product is out of stock |
| **New Product Introduction AI** | Predicts success of new products based on category/family performance |
| **Discontinuation AI** | Recommends products to discontinue based on performance |

---

## 15. Performance Notes

| Consideration | Guidance |
|---|---|
| Row count | Thousands (max ~10,000 SKUs) |
| Cache strategy | Redis cache, TTL 1 hour, invalidated on update; barcode lookup cached separately with 4-hour TTL |
| Query patterns | By `company_id + code`, `sku` (global), `barcode`, `category_id + sub_category_id`, `brand_id`, `product_family_id`, `id` (FK) |
| Full-text search | GIN index on `to_tsvector` of name + SKU + code (per Ch 7 §7.15) |
| Barcode lookup | Dedicated index on `barcodes.barcode_value` joined to products — < 200ms SLA (per Ch 20 §20.10) |
| Joins | Almost every transactional query joins to `products` — keep table cached |
| N+1 prevention | Use Prisma `include` to eager-load `brand`, `category`, `family`, `base_uom` when needed |
| Aggregation | Family-level aggregations use materialized view refreshed hourly |
| Partitioning | Not needed until > 100k SKUs (future) |

---

## 16. Example Records

### Example 1: Kaju Katli 500g (Finished Goods — Premium Sweet)

```json
{
  "id": "01928f7a-...-prod-kaju-katli-500",
  "code": "PRD-000123",
  "sku": "SDS-KJU-KTL-500G",
  "product_name": "Kaju Katli 500g Premium Pack",
  "short_name": "Kaju Katli 500g",
  "description": "Premium Kaju Katli made from finest cashew nuts and pure ghee. Traditional Indian sweet for festivals and special occasions.",
  "description_short": "Premium cashew fudge 500g",
  "company_id": "01928f7a-...-company",
  "brand_id": "01928f7a-...-brand-sds",
  "category_id": "01928f7a-...-cat-swt",
  "sub_category_id": "01928f7a-...-scat-swt-df",
  "product_family_id": "01928f7a-...-fam-kaju-katli",
  "product_line": "SWEETS",
  "product_type": "FINISHED_GOODS",
  "inventory_type": "STOCK_ITEM",
  "base_uom_id": "01928f7a-...-uom-kg",
  "purchase_uom_id": null,
  "sale_uom_id": "01928f7a-...-uom-pack",
  "production_uom_id": "01928f7a-...-uom-kg",
  "weight_per_unit_g": 500.0000,
  "length_cm": 20.00,
  "width_cm": 15.00,
  "height_cm": 3.00,
  "barcode_required": true,
  "batch_required": true,
  "expiry_required": true,
  "serial_tracking": false,
  "qc_required": true,
  "qc_inspection_type": "FINAL",
  "shelf_life_days": 21,
  "shelf_life_opened_days": 7,
  "requires_cold_chain": false,
  "allergens": ["TREE_NUTS", "MILK"],
  "default_supplier_id": null,
  "default_recipe_id": "01928f7a-...-recipe-kaju-katli-v3",
  "default_bom_id": "01928f7a-...-bom-kaju-katli-v2",
  "production_yield_pct": 96.50,
  "default_batch_size": 50.0000,
  "production_lead_time_hours": 8,
  "pos_item_code": "SDS001",
  "hsn_code": "17049000",
  "list_price": 850.0000,
  "list_price_currency": "INR",
  "wholesale_price": 720.0000,
  "distributor_price": 650.0000,
  "retail_price": 800.0000,
  "cost_price": 580.0000,
  "margin_pct": 31.76,
  "tax_code": "GST-05",
  "reorder_point": 50,
  "safety_stock": 20,
  "max_stock_level": 500,
  "abc_class": "A",
  "cycle_count_frequency": "WEEKLY",
  "fefo_enabled": true,
  "negative_stock_allowed": false,
  "valuation_method": "FIFO",
  "is_veg": true,
  "ingredients": "Cashew nuts, sugar, ghee, silver foil, cardamom",
  "nutritional_info": {
    "per_100g": {
      "energy_kcal": 480,
      "protein_g": 8,
      "carbohydrates_g": 65,
      "fat_g": 22,
      "sugar_g": 55,
      "sodium_mg": 20
    }
  },
  "storage_instructions": "Store in cool, dry place. Refrigerate after opening.",
  "country_of_origin": "IN",
  "manufacturer_name": "Sudhastar Foods Private Limited",
  "manufacturer_address": "Plot 7, MIDC Phase 2, Pune, Maharashtra 411026",
  "best_before_text": "Best before 21 days from manufacturing",
  "fssai_license_no": "10020065000123",
  "active": true,
  "is_archived": false,
  "launch_date": "2024-10-15",
  "status": "ACTIVE",
  "version": 5,
  "tags": ["premium", "festive", "best-seller", "dry-fruit"]
}
```

### Example 2: Sugar (Raw Material)

```json
{
  "id": "01928f7a-...-prod-sugar",
  "code": "PRD-000001",
  "sku": "RMT-SUGAR-REFINED",
  "product_name": "Refined Sugar (Raw Material)",
  "short_name": "Sugar",
  "company_id": "01928f7a-...-company",
  "brand_id": "01928f7a-...-brand-sdm",
  "category_id": "01928f7a-...-cat-rm",
  "sub_category_id": "01928f7a-...-scat-rm-sugar",
  "product_line": "OTHER",
  "product_type": "RAW_MATERIAL",
  "inventory_type": "STOCK_ITEM",
  "base_uom_id": "01928f7a-...-uom-kg",
  "weight_per_unit_g": 1000.0000,
  "barcode_required": true,
  "batch_required": true,
  "expiry_required": true,
  "qc_required": true,
  "qc_inspection_type": "INCOMING",
  "shelf_life_days": 730,
  "requires_cold_chain": false,
  "allergens": [],
  "default_supplier_id": "01928f7a-...-vendor-mursaleen",
  "lead_time_days": 7,
  "min_order_qty": 100.0000,
  "max_order_qty": 5000.0000,
  "purchase_cost": 45.0000,
  "purchase_currency": "INR",
  "reorder_point": 500,
  "safety_stock": 200,
  "abc_class": "A",
  "cycle_count_frequency": "MONTHLY",
  "valuation_method": "WEIGHTED_AVG",
  "hsn_code": "17019900",
  "active": true,
  "status": "ACTIVE",
  "version": 1
}
```

### Example 3: Cardboard Box 200x150x50mm (Packaging Material)

```json
{
  "id": "01928f7a-...-prod-box-200",
  "code": "PRD-002001",
  "sku": "PKG-BOX-200x150x50",
  "product_name": "Cardboard Box 200x150x50mm",
  "short_name": "Box 200x150",
  "company_id": "01928f7a-...-company",
  "brand_id": "01928f7a-...-brand-sdm",
  "category_id": "01928f7a-...-cat-pkg",
  "sub_category_id": "01928f7a-...-scat-pkg-box",
  "product_line": "PACKAGING",
  "product_type": "PACKAGING",
  "inventory_type": "STOCK_ITEM",
  "base_uom_id": "01928f7a-...-uom-ea",
  "weight_per_unit_g": 85.0000,
  "length_cm": 20.00,
  "width_cm": 15.00,
  "height_cm": 5.00,
  "barcode_required": true,
  "batch_required": false,
  "expiry_required": false,
  "qc_required": false,
  "shelf_life_days": 730,
  "requires_cold_chain": false,
  "default_supplier_id": "01928f7a-...-vendor-packaging-co",
  "lead_time_days": 14,
  "min_order_qty": 500.0000,
  "purchase_cost": 4.5000,
  "reorder_point": 1000,
  "safety_stock": 500,
  "abc_class": "C",
  "cycle_count_frequency": "QUARTERLY",
  "valuation_method": "STANDARD_COST",
  "hsn_code": "48191000",
  "active": true,
  "status": "ACTIVE",
  "version": 1
}
```

### Example 4: Bisleri Water 1L (Trading Item — Third-Party FMCG)

```json
{
  "id": "01928f7a-...-prod-bisleri-1l",
  "code": "PRD-003001",
  "sku": "TRD-BISLERI-WATER-1L",
  "product_name": "Bisleri Mineral Water 1L",
  "short_name": "Bisleri 1L",
  "company_id": "01928f7a-...-company",
  "brand_id": "01928f7a-...-brand-sdr",
  "category_id": "01928f7a-...-cat-bev",
  "sub_category_id": "01928f7a-...-scat-bev-water",
  "product_line": "TRADING",
  "product_type": "TRADING_ITEM",
  "inventory_type": "STOCK_ITEM",
  "base_uom_id": "01928f7a-...-uom-ea",
  "weight_per_unit_g": 1050.0000,
  "volume_per_unit_ml": 1000.0000,
  "barcode_required": true,
  "batch_required": true,
  "expiry_required": true,
  "qc_required": false,
  "shelf_life_days": 180,
  "requires_cold_chain": false,
  "default_supplier_id": "01928f7a-...-vendor-bisleri-distributor",
  "lead_time_days": 3,
  "purchase_cost": 14.0000,
  "list_price": 20.0000,
  "retail_price": 20.0000,
  "margin_pct": 30.00,
  "pos_item_code": "BEV001",
  "hsn_code": "22019020",
  "is_veg": true,
  "active": true,
  "status": "ACTIVE",
  "version": 1,
  "tags": ["beverage", "third-party", "fast-moving"]
}
```

### Example 5: Semi-Finished Sweet Base (Semi-Finished Product)

```json
{
  "id": "01928f7a-...-prod-sweet-base",
  "code": "PRD-004001",
  "sku": "SFM-SWEET-BASE-GENERIC",
  "product_name": "Sweet Base (Semi-Finished)",
  "short_name": "Sweet Base",
  "company_id": "01928f7a-...-company",
  "brand_id": "01928f7a-...-brand-sds",
  "category_id": "01928f7a-...-cat-swt",
  "sub_category_id": "01928f7a-...-scat-swt-base",
  "product_line": "SWEETS",
  "product_type": "SEMI_FINISHED",
  "inventory_type": "STOCK_ITEM",
  "base_uom_id": "01928f7a-...-uom-kg",
  "barcode_required": true,
  "batch_required": true,
  "expiry_required": true,
  "qc_required": true,
  "qc_inspection_type": "IN_PROCESS",
  "shelf_life_days": 3,
  "requires_cold_chain": true,
  "cold_chain_temp_min_c": 2.00,
  "cold_chain_temp_max_c": 8.00,
  "default_recipe_id": "01928f7a-...-recipe-sweet-base-v1",
  "default_bom_id": "01928f7a-...-bom-sweet-base-v1",
  "production_yield_pct": 95.00,
  "default_batch_size": 100.0000,
  "valuation_method": "WEIGHTED_AVG",
  "active": true,
  "status": "ACTIVE",
  "version": 1,
  "tags": ["semi-finished", "perishable", "cold-chain"]
}
```

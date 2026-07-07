# Manual 1 · Part 3 · Entities 12-14 — Classification Hierarchy (Category, Sub Category, Product Family)

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 3 — Product Master Domain |
| Entities | Product Category (012), Product Sub Category (013), Product Family (014) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## Overview — Classification Hierarchy Pattern

The Classification Hierarchy organizes products into a **3-level taxonomy**:

```
Category (top level — broad classification)
  └── Sub Category (mid level — finer classification)
       └── Product Family (bottom level — groups variants of same product)
            └── Product (concrete SKU, defined in Entity 011)
```

### Why 3 Levels?

| Level | Purpose | Example |
|---|---|---|
| **Category** | Broad functional grouping | "Sweets" |
| **Sub Category** | Finer product-type classification | "Milk Based", "Dry Fruit", "Sugar Free" |
| **Product Family** | Groups variants of the same conceptual product | "Kaju Katli" (contains 250g, 500g, 1kg variants) |

This 3-level structure:
- Enables roll-up reporting (sales by category, sub-category, family)
- Supports putaway rules (products in same family stored together)
- Enables demand forecasting at family level (more accurate than per-SKU)
- Allows category-level pricing and promotion rules
- Avoids "duplicate product" problem (all Kaju Katli variants belong to one family)

### Shared Architectural Decisions

| Decision | Value |
|---|---|
| Storage | Three separate tables: `product_categories`, `product_sub_categories`, `product_families` |
| Hierarchy | Each child references its parent via FK |
| Hierarchy depth | Fixed 3 levels (no arbitrary depth — keeps taxonomy disciplined) |
| Lifecycle | 8-stage Master Data Lifecycle per Ch 7 §7.5 |
| Seeding | Categories seeded at deployment (Sweets, Namkeen, Bakery, Snacks, RTE, Frozen, Packaging, Raw Material, Chemicals, Cleaning, Beverages, Trading, Consumables) |
| Deletion | Soft delete only; cannot delete category with active products |

---

## Entity 012 — Product Category

### 1. Business Purpose

The `ProductCategory` entity represents the **top-level classification** of products — the broadest functional grouping. Per Volume 0 Chapter 2 §2.2, Sudhastar's product categories include Sweets, Namkeen, Bakery, Snacks, Ready-to-Eat, Frozen Foods, plus operational categories like Packaging, Raw Material, Chemicals, Cleaning, Beverages, and Trading Items.

Categories are the primary dimension for:
- **Roll-up reporting** — sales, inventory valuation, production output by category
- **Warehouse zone assignment** — categories map to storage zones (e.g., Sweets → Cold Storage)
- **Tax classification** — categories may have default tax codes (e.g., food vs. non-food)
- **Demand forecasting** — forecasting often runs at category level first, then disaggregated
- **UI navigation** — users browse products by category

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Product Management Head |
| Data Owner | Product Management Head |
| Technical Owner | Backend Lead — Product Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `product_categories` |
| Prisma Model | `ProductCategory` |
| File Location | `prisma/schema/master/product/product_category.prisma` |
| Partitioning | None (low volume — max ~30 categories) |
| Lifecycle | Master Data Lifecycle (Volume 0 Ch 7 §7.5) |

### 4. Field Dictionary

#### 4.1 Universal Base Fields (per Part 1 §3)

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | `uuid_generate_v7()` | PK, immutable | Internal primary key |
| `code` | VARCHAR(20) | Yes | — | Unique per company, Number Series `CAT-` | Category code (e.g., `SWT`, `NMK`, `BAK`) |
| `company_id` | UUID | Yes | — | FK to `companies.id` | Owning company |
| `facility_id` | UUID | No | NULL | — | **Exception**: NULL — Category is company-wide |
| `status` | ENUM | Yes | `DRAFT` | 8-stage master lifecycle | Master data lifecycle |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation timestamp (UTC) |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto-update | Last modification (UTC) |
| `created_by` | UUID | Yes | — | FK to `user_accounts.id` | Creator |
| `updated_by` | UUID | Yes | — | FK to `user_accounts.id` | Last modifier |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft-delete timestamp |
| `version` | INTEGER | Yes | `1` | Optimistic concurrency | Increments on each update |

#### 4.2 Category-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `name` | VARCHAR(100) | Yes | — | Min 2, max 100, unique per company | Category display name (e.g., "Sweets") | Public | Demand forecast |
| `name_short` | VARCHAR(30) | Yes | — | Min 2, max 30 | Short name (e.g., "SWT") | Public | — |
| `description` | TEXT | No | NULL | — | Detailed description | Internal | — |
| `category_type` | ENUM | Yes | — | FINISHED_GOODS, RAW_MATERIAL, PACKAGING, TRADING, CONSUMABLE, CHEMICAL, CLEANING, BEVERAGE, SERVICE, ASSET_SPARE | Category type (functional classification) | Internal | — |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order in UI (lower = higher) | Internal | — |
| `color_code` | VARCHAR(7) | No | NULL | Hex color `^#[0-9A-Fa-f]{6}$` | UI color for category badges/charts | Public | — |
| `icon_name` | VARCHAR(50) | No | NULL | — | Icon identifier (from packages/icons) | Public | — |
| `default_uom_class` | ENUM | No | NULL | WEIGHT, COUNT, VOLUME, LENGTH | Default UOM class for products in this category | Internal | — |
| `default_tax_code` | VARCHAR(20) | No | NULL | FK to `tax_codes.code` | Default tax code (e.g., 5% GST for food, 18% for non-food) | Internal | — |
| `default_shelf_life_days` | INTEGER | No | NULL | > 0 | Default shelf life (overridden per product) | Internal | Expiry prediction |
| `default_storage_zone_type` | ENUM | No | NULL | RAW_MATERIAL, PACKAGING, FINISHED_GOODS, COLD_STORAGE, BLAST_CHILLER, GENERAL | Default warehouse zone type for this category's products | Internal | Putaway AI |
| `default_reorder_point` | INTEGER | No | NULL | ≥ 0 | Default reorder point (overridden per product per facility) | Internal | Reorder AI |
| `default_safety_stock` | INTEGER | No | NULL | ≥ 0 | Default safety stock | Internal | Reorder AI |
| `default_abc_class` | ENUM | No | NULL | A, B, C | Default ABC classification (A=high-value fast-moving) | Internal | Cycle count AI |
| `requires_cold_chain` | BOOLEAN | Yes | `false` | — | If true, products in this category require cold storage | Internal | Cold chain AI |
| `requires_batch_tracking` | BOOLEAN | Yes | `true` | — | If true, products require batch tracking | Internal | — |
| `requires_expiry_tracking` | BOOLEAN | Yes | `true` | — | If true, products require expiry date tracking | Internal | Expiry AI |
| `requires_qc_inspection` | BOOLEAN | Yes | `true` | — | If true, products require QC inspection on receipt | Internal | — |
| `is_seed_category` | BOOLEAN | Yes | `false` | — | If true, seeded at deployment (cannot be deleted) | Internal | — |
| `is_customer_facing` | BOOLEAN | Yes | `true` | — | If true, category visible in retail/restaurant POS | Public | — |
| `allowed_product_types` | TEXT[] | No | NULL | Subset of product types | Restricts which product types can be assigned (e.g., RAW_MATERIAL category only allows RAW_MATERIAL products) | Internal | — |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Filterable annotations | Internal | — |

### 5. Relationships

| Relationship | Cardinality | Direction | FK Field | Cascade | Delete Rule |
|---|---|---|---|---|---|
| Category → Company | N : 1 | inbound | `product_categories.company_id` → `companies.id` | RESTRICT | Cannot delete company with active categories |
| Category → SubCategory | 1 : N | outbound | `product_sub_categories.category_id` | RESTRICT | Cannot delete category with active sub-categories |
| Category → Product | 1 : N | outbound | `products.category_id` | RESTRICT | Cannot delete category with active products |
| Category → TaxCode | N : 1 | inbound | `product_categories.default_tax_code` → `tax_codes.code` | SET NULL | Default tax code cleared |
| Category → ProductFamily | 1 : N | outbound | `product_families.category_id` | SET NULL | Families lose category reference |

### 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_product_categories` | PRIMARY KEY | `id` | Default PK |
| `uq_categories_code_company` | UNIQUE | `company_id, code` | Code uniqueness per company |
| `uq_categories_name_company` | UNIQUE PARTIAL | `company_id, name WHERE deleted_at IS NULL` | Name uniqueness (active) |
| `idx_categories_status` | B-TREE | `status, deleted_at` | Default query filter |
| `idx_categories_type` | B-TREE | `company_id, category_type` | Filter by type |
| `idx_categories_display_order` | B-TREE | `company_id, display_order` | UI display ordering |
| `idx_categories_cold_chain` | PARTIAL | `company_id WHERE requires_cold_chain = true` | Cold chain product lookup |

### 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `code` must be unique per company | DB + App | Unique constraint |
| 2 | `name` must be unique per company (among active) | DB + App | Unique partial constraint |
| 3 | `default_tax_code` must reference active tax code | DB | FK constraint |
| 4 | `default_shelf_life_days` > 0 if set | DB | CHECK constraint |
| 5 | `default_reorder_point` and `default_safety_stock` ≥ 0 | DB | CHECK constraint |
| 6 | `color_code` must be valid hex | App | Zod schema |
| 7 | `display_order` must be > 0 | DB | CHECK constraint |
| 8 | `is_seed_category = true` categories cannot be deleted (only deactivated) | App | Service-layer enforcement |
| 9 | `category_type` is immutable for seed categories | App | Service-layer + audit |
| 10 | State transition DRAFT → SUBMITTED requires `name`, `category_type`, `default_uom_class` | App | Master Data Quality Validator |
| 11 | Once ACTIVE, `code` is immutable | App | Service-layer + audit |
| 12 | `allowed_product_types` if set must be valid product type enum values | App | Zod schema |

### 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/product-categories` | GET | List categories | `PRODUCT:VIEW` |
| `/api/v1/product-categories/:id` | GET | Get category details | `PRODUCT:VIEW` |
| `/api/v1/product-categories` | POST | Create category (DRAFT) | `PRODUCT:CREATE` |
| `/api/v1/product-categories/:id` | PATCH | Update category | `PRODUCT:EDIT` |
| `/api/v1/product-categories/:id/submit` | POST | Submit for approval | `PRODUCT:EDIT` |
| `/api/v1/product-categories/:id/approve` | POST | Approve category | `PRODUCT:APPROVE` |
| `/api/v1/product-categories/:id/activate` | POST | Activate category | `PRODUCT:APPROVE` |
| `/api/v1/product-categories/:id/sub-categories` | GET | List sub-categories | `PRODUCT:VIEW` |
| `/api/v1/product-categories/:id/products` | GET | List products in category | `PRODUCT:VIEW` |
| `/api/v1/product-categories/:id/families` | GET | List product families | `PRODUCT:VIEW` |

### 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Category List | AG Grid list with type filter | `/products/categories` |
| Category Detail | Tabbed: Overview, Sub-Categories, Products, Families, Audit | `/products/categories/:id` |
| Category Create Form | Fields: name, type, defaults, color, icon | `/products/categories/new` |
| Category Tree | Visual tree of category → sub-category → family → products | `/products/categories/tree` |

### 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| Category filter on product search | Mobile product lookup by category |
| Category badge on product | Visual identification |
| Category-scoped cycle count | Count all products in a category |

### 11. Reports

| Report | Use of Category |
|---|---|
| Category Performance Report | Sales, margin, volume per category |
| Category Inventory Report | Stock value, aging per category |
| Category Production Report | Output, yield per category |
| Cold Chain Compliance Report | Categories requiring cold chain |
| Category-wise Reorder Report | Reorder suggestions by category |

### 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE | Yes | Optional | Permanent |
| UPDATE (non-critical) | Yes | Optional | Permanent |
| UPDATE (critical: code, category_type, default_tax_code, requires_cold_chain) | Yes | **Mandatory** | Permanent |
| STATUS CHANGE | Yes | **Mandatory** | Permanent |
| DELETE (soft) | Yes | **Mandatory** | Permanent |

**Audit Level**: Full

### 13. Security Classification

| Field Category | Classification | Access |
|---|---|---|
| `name`, `name_short`, `color_code`, `icon_name`, `is_customer_facing` | Public | All authenticated users |
| `description`, `category_type`, `display_order`, `default_*` | Internal | L2+ Product Mgmt, Admin |
| `default_tax_code` | Confidential | L2+ Finance, Product Mgmt |
| `is_seed_category`, `allowed_product_types` | Internal | L2+ IT, Product Mgmt |

### 14. AI Relevance

| AI Capability | Usage |
|---|---|
| Demand Forecast AI | Per-category forecasting (more stable than per-SKU) |
| Inventory Optimization AI | Per-category reorder point optimization |
| Putaway AI | Uses `default_storage_zone_type` for putaway suggestions |
| Cold Chain Compliance AI | Uses `requires_cold_chain` for compliance monitoring |
| Expiry Prediction AI | Uses `default_shelf_life_days` |
| Cycle Count AI | Uses `default_abc_class` for ABC-based cycle counting |
| Sales Forecast AI | Per-category sales prediction |

### 15. Performance Notes

| Consideration | Guidance |
|---|---|
| Row count | < 30 per company |
| Cache strategy | Redis cache, TTL 1 hour, invalidated on update |
| Query patterns | Queried by `company_id + code`, `id` (FK), `category_type` |
| Joins | Frequently joined with Product, SubCategory |
| N+1 prevention | Eager-load sub-categories when listing categories |

### 16. Example Records

#### Example 1: Sweets Category

```json
{
  "id": "01928f7a-...-cat-swt",
  "code": "SWT",
  "company_id": "01928f7a-...-company",
  "name": "Sweets",
  "name_short": "SWT",
  "description": "Traditional Indian sweets — Kaju Katli, Gulab Jamun, Barfi, Laddu, and more",
  "category_type": "FINISHED_GOODS",
  "display_order": 10,
  "color_code": "#DC2626",
  "icon_name": "cake",
  "default_uom_class": "WEIGHT",
  "default_tax_code": "GST-05",
  "default_shelf_life_days": 15,
  "default_storage_zone_type": "COLD_STORAGE",
  "default_reorder_point": 50,
  "default_safety_stock": 20,
  "default_abc_class": "A",
  "requires_cold_chain": true,
  "requires_batch_tracking": true,
  "requires_expiry_tracking": true,
  "requires_qc_inspection": true,
  "is_seed_category": true,
  "is_customer_facing": true,
  "allowed_product_types": ["FINISHED_GOODS", "SEMI_FINISHED"],
  "status": "ACTIVE",
  "version": 2
}
```

#### Example 2: Raw Material Category

```json
{
  "id": "01928f7a-...-cat-rm",
  "code": "RMT",
  "company_id": "01928f7a-...-company",
  "name": "Raw Material",
  "name_short": "RMT",
  "description": "Raw ingredients for manufacturing — sugar, ghee, dry fruits, flour, etc.",
  "category_type": "RAW_MATERIAL",
  "display_order": 50,
  "color_code": "#10B981",
  "icon_name": "package",
  "default_uom_class": "WEIGHT",
  "default_tax_code": "GST-05",
  "default_shelf_life_days": 180,
  "default_storage_zone_type": "RAW_MATERIAL",
  "default_reorder_point": 100,
  "default_safety_stock": 50,
  "default_abc_class": "B",
  "requires_cold_chain": false,
  "requires_batch_tracking": true,
  "requires_expiry_tracking": true,
  "requires_qc_inspection": true,
  "is_seed_category": true,
  "is_customer_facing": false,
  "allowed_product_types": ["RAW_MATERIAL"],
  "status": "ACTIVE",
  "version": 1
}
```

#### Example 3: Packaging Category

```json
{
  "id": "01928f7a-...-cat-pkg",
  "code": "PKG",
  "company_id": "01928f7a-...-company",
  "name": "Packaging Material",
  "name_short": "PKG",
  "description": "Packaging materials — boxes, wrappers, labels, films, tapes",
  "category_type": "PACKAGING",
  "display_order": 60,
  "color_code": "#6366F1",
  "icon_name": "box",
  "default_uom_class": "COUNT",
  "default_tax_code": "GST-18",
  "default_shelf_life_days": 730,
  "default_storage_zone_type": "PACKAGING",
  "default_reorder_point": 500,
  "default_safety_stock": 200,
  "default_abc_class": "C",
  "requires_cold_chain": false,
  "requires_batch_tracking": false,
  "requires_expiry_tracking": false,
  "requires_qc_inspection": false,
  "is_seed_category": true,
  "is_customer_facing": false,
  "allowed_product_types": ["PACKAGING"],
  "status": "ACTIVE",
  "version": 1
}
```

---

## Entity 013 — Product Sub Category

### 1. Business Purpose

The `ProductSubCategory` entity represents the **mid-level classification** — a finer grouping within a Category. For example, the "Sweets" category contains sub-categories like "Milk Based", "Dry Fruit", "Chocolate", "Bengali", "Festival", and "Sugar Free".

Sub-categories enable:
- **Finer reporting granularity** — sales by sub-category within a category
- **Targeted promotions** — promote "Sugar Free" sweets specifically
- **Storage optimization** — sub-categories may have specific storage requirements
- **Demand pattern analysis** — different sub-categories have different demand patterns (e.g., festival sweets vs. daily sweets)
- **Recipe grouping** — recipes often organized by sub-category

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Product Management Head |
| Data Owner | Product Management Head |
| Technical Owner | Backend Lead — Product Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `product_sub_categories` |
| Prisma Model | `ProductSubCategory` |
| File Location | `prisma/schema/master/product/product_sub_category.prisma` |
| Partitioning | None (low volume — max ~100 sub-categories) |

### 4. Field Dictionary

#### 4.1 Universal Base Fields (per Part 1 §3)

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(20) | Yes | — | Unique per company, Number Series `SCAT-` | Sub-category code (e.g., `SWT-MLK`) |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | No | NULL | — | NULL — Sub-category is company-wide |
| `status` | ENUM | Yes | `DRAFT` | 8-stage master lifecycle | Master data lifecycle |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard fields |

#### 4.2 Sub-Category-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `name` | VARCHAR(100) | Yes | — | Min 2, max 100, unique per company+category | Sub-category name (e.g., "Milk Based") | Public | Demand forecast |
| `name_short` | VARCHAR(30) | Yes | — | Min 2, max 30 | Short name | Public | — |
| `description` | TEXT | No | NULL | — | Description | Internal | — |
| `category_id` | UUID | Yes | — | FK to `product_categories.id` | Parent category | Internal | — |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order within category | Internal | — |
| `color_code` | VARCHAR(7) | No | NULL | Hex color | UI color | Public | — |
| `icon_name` | VARCHAR(50) | No | NULL | — | Icon identifier | Public | — |
| `default_uom_class` | ENUM | No | NULL | WEIGHT, COUNT, VOLUME, LENGTH; NULL = inherit from category | Default UOM class override | Internal | — |
| `default_tax_code` | VARCHAR(20) | No | NULL | FK to `tax_codes.code`; NULL = inherit from category | Default tax code override | Internal | — |
| `default_shelf_life_days` | INTEGER | No | NULL | > 0; NULL = inherit from category | Default shelf life override | Internal | Expiry AI |
| `default_storage_zone_type` | ENUM | No | NULL | NULL = inherit from category | Default zone override | Internal | Putaway AI |
| `default_reorder_point` | INTEGER | No | NULL | ≥ 0; NULL = inherit | Default reorder override | Internal | Reorder AI |
| `default_safety_stock` | INTEGER | No | NULL | ≥ 0; NULL = inherit | Default safety stock override | Internal | Reorder AI |
| `requires_cold_chain` | BOOLEAN | No | NULL | NULL = inherit from category | Cold chain requirement override | Internal | Cold chain AI |
| `is_customer_facing` | BOOLEAN | Yes | `true` | — | Visible in retail/restaurant POS | Public | — |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal | — |

### 5. Relationships

| Relationship | Cardinality | Direction | FK Field | Cascade | Delete Rule |
|---|---|---|---|---|---|
| SubCategory → Company | N : 1 | inbound | `company_id` | RESTRICT | — |
| SubCategory → Category | N : 1 | inbound | `category_id` → `product_categories.id` | RESTRICT | Cannot delete category with active sub-categories |
| SubCategory → Product | 1 : N | outbound | `products.sub_category_id` | RESTRICT | Cannot delete sub-category with active products |
| SubCategory → ProductFamily | 1 : N | outbound | `product_families.sub_category_id` | SET NULL | Families lose sub-category reference |
| SubCategory → TaxCode | N : 1 | inbound | `default_tax_code` → `tax_codes.code` | SET NULL | Default tax cleared |

### 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_product_sub_categories` | PRIMARY KEY | `id` | Default PK |
| `uq_sub_cat_code_company` | UNIQUE | `company_id, code` | Code uniqueness per company |
| `uq_sub_cat_name_cat` | UNIQUE PARTIAL | `category_id, name WHERE deleted_at IS NULL` | Name uniqueness per category |
| `idx_sub_cat_status` | B-TREE | `status, deleted_at` | Default query filter |
| `idx_sub_cat_category` | B-TREE | `category_id, display_order` | List sub-categories within category |

### 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `code` unique per company | DB | Unique constraint |
| 2 | `name` unique per category (active) | DB | Unique partial constraint |
| 3 | `category_id` required | DB | NOT NULL |
| 4 | `display_order` > 0 | DB | CHECK constraint |
| 5 | `color_code` valid hex | App | Zod |
| 6 | `default_shelf_life_days` > 0 if set | DB | CHECK |
| 7 | `default_reorder_point`, `default_safety_stock` ≥ 0 | DB | CHECK |
| 8 | State transition DRAFT → SUBMITTED requires `name`, `category_id` | App | Master Data Quality Validator |
| 9 | Once ACTIVE, `code` and `category_id` are immutable | App | Service-layer + audit |

### 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/product-sub-categories` | GET | List sub-categories | `PRODUCT:VIEW` |
| `/api/v1/product-sub-categories/:id` | GET | Get sub-category | `PRODUCT:VIEW` |
| `/api/v1/product-sub-categories` | POST | Create sub-category | `PRODUCT:CREATE` |
| `/api/v1/product-sub-categories/:id` | PATCH | Update sub-category | `PRODUCT:EDIT` |
| `/api/v1/product-sub-categories/:id/submit` | POST | Submit for approval | `PRODUCT:EDIT` |
| `/api/v1/product-sub-categories/:id/approve` | POST | Approve | `PRODUCT:APPROVE` |
| `/api/v1/product-sub-categories/:id/products` | GET | List products | `PRODUCT:VIEW` |
| `/api/v1/product-sub-categories/:id/families` | GET | List families | `PRODUCT:VIEW` |

### 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Sub-Category List | AG Grid within category detail | `/products/sub-categories` |
| Sub-Category Detail | Tabbed: Overview, Products, Families, Audit | `/products/sub-categories/:id` |
| Sub-Category Create Form | Fields: name, category, defaults | `/products/sub-categories/new` |

### 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| Sub-category filter on product search | Finer filtering |
| Sub-category badge on product | Visual identification |

### 11. Reports

| Report | Use |
|---|---|
| Sub-Category Performance | Sales, margin per sub-category |
| Sub-Category Inventory | Stock by sub-category |
| Sub-Category Comparison | Cross sub-category analysis |

### 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE | Yes | Optional | Permanent |
| UPDATE (critical: code, category_id, default_tax_code) | Yes | **Mandatory** | Permanent |
| STATUS CHANGE | Yes | **Mandatory** | Permanent |
| DELETE (soft) | Yes | **Mandatory** | Permanent |

**Audit Level**: Full

### 13. Security Classification

| Fields | Classification |
|---|---|
| `name`, `name_short`, `color_code`, `icon_name`, `is_customer_facing` | Public |
| `description`, `category_id`, `display_order`, `default_*` | Internal |
| `default_tax_code` | Confidential |

### 14. AI Relevance

| AI Capability | Usage |
|---|---|
| Demand Forecast AI | Per-sub-category forecasting |
| Inventory Optimization AI | Per-sub-category reorder optimization |
| Promotion AI | Sub-category-specific promotions |
| Recipe Optimization AI | Sub-category recipe analysis |

### 15. Performance Notes

| Consideration | Guidance |
|---|---|
| Row count | < 100 per company |
| Cache | Redis, TTL 1 hour |
| Query patterns | By `category_id + display_order`, `id` (FK), `company_id + code` |

### 16. Example Records

#### Example 1: Milk Based Sweets

```json
{
  "id": "01928f7a-...-scat-swt-mlk",
  "code": "SWT-MLK",
  "company_id": "01928f7a-...-company",
  "name": "Milk Based Sweets",
  "name_short": "Milk",
  "description": "Sweets made from milk/mawa — Gulab Jamun, Rasgulla, Kalakand, Rasmalai",
  "category_id": "01928f7a-...-cat-swt",
  "display_order": 10,
  "color_code": "#F59E0B",
  "default_shelf_life_days": 7,
  "default_storage_zone_type": "COLD_STORAGE",
  "requires_cold_chain": true,
  "is_customer_facing": true,
  "status": "ACTIVE",
  "version": 1
}
```

#### Example 2: Dry Fruit Sweets

```json
{
  "id": "01928f7a-...-scat-swt-df",
  "code": "SWT-DF",
  "company_id": "01928f7a-...-company",
  "name": "Dry Fruit Sweets",
  "name_short": "Dry Fruit",
  "description": "Sweets made from dry fruits — Kaju Katli, Anjeer Roll, Almond Barfi",
  "category_id": "01928f7a-...-cat-swt",
  "display_order": 20,
  "color_code": "#92400E",
  "default_shelf_life_days": 21,
  "default_storage_zone_type": "FINISHED_GOODS",
  "requires_cold_chain": false,
  "is_customer_facing": true,
  "status": "ACTIVE",
  "version": 1
}
```

#### Example 3: Sugar Free Sweets

```json
{
  "id": "01928f7a-...-scat-swt-sf",
  "code": "SWT-SF",
  "company_id": "01928f7a-...-company",
  "name": "Sugar Free Sweets",
  "name_short": "Sugar Free",
  "description": "Diabetic-friendly sweets with sugar substitutes",
  "category_id": "01928f7a-...-cat-swt",
  "display_order": 60,
  "color_code": "#10B981",
  "default_shelf_life_days": 15,
  "default_storage_zone_type": "COLD_STORAGE",
  "requires_cold_chain": true,
  "is_customer_facing": true,
  "status": "ACTIVE",
  "version": 1,
  "tags": ["health-conscious", "diabetic-friendly"]
}
```

---

## Entity 014 — Product Family

### 1. Business Purpose

The `ProductFamily` entity represents the **bottom-level classification** — a grouping of product variants that are conceptually the same product but differ in size, packaging, or other variant attributes. For example, "Kaju Katli" is a product family containing 250g, 500g, and 1kg variants.

Without product families, ERPs face the "duplicate product" problem: Kaju Katli 250g, Kaju Katli 500g, and Kaju Katli 1kg are created as three unrelated products, making:
- Demand forecasting impossible at the conceptual product level
- Reporting fragmented across "variants" of the same product
- Recipe management confusing (which recipe applies to which variant?)
- Customer communication difficult ("we sell Kaju Katli in 3 sizes")

The Product Family solves this by grouping all variants under one family. Each variant is a separate Product (with its own SKU, barcode, batch tracking), but all share a `product_family_id`.

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Product Management Head |
| Data Owner | Product Management Head |
| Technical Owner | Backend Lead — Product Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `product_families` |
| Prisma Model | `ProductFamily` |
| File Location | `prisma/schema/master/product/product_family.prisma` |
| Partitioning | None (medium volume — max ~500 families) |

### 4. Field Dictionary

#### 4.1 Universal Base Fields

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `FAM-` | Family code (e.g., `FAM-KAJU-KATLI`) |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | No | NULL | — | NULL — Family is company-wide |
| `status` | ENUM | Yes | `DRAFT` | 8-stage master lifecycle | Master data lifecycle |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard fields |

#### 4.2 Family-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `name` | VARCHAR(200) | Yes | — | Min 2, max 200, unique per company | Family name (e.g., "Kaju Katli") | Public | Demand forecast |
| `name_short` | VARCHAR(50) | Yes | — | Min 2, max 50 | Short name | Public | — |
| `description` | TEXT | No | NULL | — | Detailed description | Internal | — |
| `category_id` | UUID | Yes | — | FK to `product_categories.id` | Parent category | Internal | — |
| `sub_category_id` | UUID | No | NULL | FK to `product_sub_categories.id` | Parent sub-category | Internal | — |
| `brand_id` | UUID | Yes | — | FK to `brands.id` | Brand this family belongs to | Internal | — |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order | Internal | — |
| `color_code` | VARCHAR(7) | No | NULL | Hex color | UI color | Public | — |
| `default_recipe_id` | UUID | No | NULL | FK to `recipes.id` | Default recipe for this family | Internal | Recipe AI |
| `default_packaging_id` | UUID | No | NULL | FK to `packaging_master.id` | Default packaging | Internal | — |
| `default_uom_class` | ENUM | No | NULL | WEIGHT, COUNT, VOLUME; NULL = inherit | Default UOM class | Internal | — |
| `default_tax_code` | VARCHAR(20) | No | NULL | FK to `tax_codes.code`; NULL = inherit | Default tax code | Internal | — |
| `default_shelf_life_days` | INTEGER | No | NULL | > 0; NULL = inherit | Default shelf life | Internal | Expiry AI |
| `default_reorder_point` | INTEGER | No | NULL | ≥ 0 | Default reorder | Internal | Reorder AI |
| `default_safety_stock` | INTEGER | No | NULL | ≥ 0 | Default safety stock | Internal | Reorder AI |
| `default_image_file_id` | UUID | No | NULL | FK to `file_attachments.id` | Default product image | Public | — |
| `is_customer_facing` | BOOLEAN | Yes | `true` | — | Visible to customers | Public | — |
| `is_seasonal` | BOOLEAN | Yes | `false` | — | If true, family has seasonal demand | Internal | Demand AI |
| `season_start_month` | SMALLINT | No | NULL | 1–12; required if is_seasonal=true | Season start month | Internal | — |
| `season_end_month` | SMALLINT | No | NULL | 1–12; required if is_seasonal=true | Season end month | Internal | — |
| `default_price` | DECIMAL(18,4) | No | NULL | ≥ 0 | Default base price (per base UOM) | Confidential | Pricing AI |
| `default_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Default standard cost | Confidential | Cost AI |
| `margin_pct` | DECIMAL(5,2) | No | NULL | Generated: `((price - cost) / price) * 100` | Margin percentage | Confidential | — |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal | — |

### 5. Relationships

| Relationship | Cardinality | Direction | FK Field | Cascade | Delete Rule |
|---|---|---|---|---|---|
| Family → Company | N : 1 | inbound | `company_id` | RESTRICT | — |
| Family → Category | N : 1 | inbound | `category_id` | RESTRICT | Cannot delete category with active families |
| Family → SubCategory | N : 1 | inbound | `sub_category_id` | SET NULL | Family loses sub-category |
| Family → Brand | N : 1 | inbound | `brand_id` | RESTRICT | Cannot delete brand with active families |
| Family → Recipe | N : 1 | inbound | `default_recipe_id` | SET NULL | Default recipe cleared |
| Family → Packaging | N : 1 | inbound | `default_packaging_id` | SET NULL | Default packaging cleared |
| Family → Product | 1 : N | outbound | `products.product_family_id` | RESTRICT | Cannot delete family with active products |
| Family → FileAttachment | N : 1 | inbound | `default_image_file_id` | SET NULL | Image cleared |

### 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_product_families` | PRIMARY KEY | `id` | Default PK |
| `uq_families_code_company` | UNIQUE | `company_id, code` | Code uniqueness |
| `uq_families_name_company` | UNIQUE PARTIAL | `company_id, name WHERE deleted_at IS NULL` | Name uniqueness |
| `idx_families_status` | B-TREE | `status, deleted_at` | Default filter |
| `idx_families_category` | B-TREE | `category_id, sub_category_id` | Filter by classification |
| `idx_families_brand` | B-TREE | `brand_id` | Filter by brand |
| `idx_families_seasonal` | PARTIAL | `company_id WHERE is_seasonal = true` | Seasonal product lookup |

### 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `code` unique per company | DB | Unique constraint |
| 2 | `name` unique per company (active) | DB | Unique partial |
| 3 | `category_id` required | DB | NOT NULL |
| 4 | `brand_id` required | DB | NOT NULL |
| 5 | `display_order` > 0 | DB | CHECK |
| 6 | `default_shelf_life_days` > 0 if set | DB | CHECK |
| 7 | `default_reorder_point`, `default_safety_stock` ≥ 0 | DB | CHECK |
| 8 | `default_price`, `default_cost` ≥ 0 if set | DB | CHECK |
| 9 | If `is_seasonal = true`, both `season_start_month` and `season_end_month` required | DB | CHECK |
| 10 | `season_end_month` can be < `season_start_month` (crosses year-end) | App | Logic |
| 11 | State transition DRAFT → SUBMITTED requires `name`, `category_id`, `brand_id` | App | Master Data Quality Validator |
| 12 | Once ACTIVE, `code`, `category_id`, `brand_id` are immutable | App | Service-layer + audit |

### 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/product-families` | GET | List families | `PRODUCT:VIEW` |
| `/api/v1/product-families/:id` | GET | Get family details | `PRODUCT:VIEW` |
| `/api/v1/product-families` | POST | Create family | `PRODUCT:CREATE` |
| `/api/v1/product-families/:id` | PATCH | Update family | `PRODUCT:EDIT` |
| `/api/v1/product-families/:id/submit` | POST | Submit for approval | `PRODUCT:EDIT` |
| `/api/v1/product-families/:id/approve` | POST | Approve | `PRODUCT:APPROVE` |
| `/api/v1/product-families/:id/products` | GET | List variant products | `PRODUCT:VIEW` |
| `/api/v1/product-families/:id/demand-forecast` | GET | Get family-level demand forecast | `PRODUCT:VIEW` |

### 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Family List | AG Grid with category/brand filter | `/products/families` |
| Family Detail | Tabbed: Overview, Variants, Recipe, Pricing, Audit | `/products/families/:id` |
| Family Create Form | Multi-section: Classification, Defaults, Pricing, Seasonality | `/products/families/new` |
| Family Comparison | Compare multiple families side-by-side | `/products/families/compare` |

### 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| Family lookup | View all variants of a family |
| Family badge on product | Visual identification |
| Family demand forecast | L2+ view family-level trends |

### 11. Reports

| Report | Use |
|---|---|
| Family Performance Report | Sales, margin per family (aggregates all variants) |
| Family Demand Forecast | AI-generated forecast at family level |
| Family Inventory Report | Stock across all variants |
| Seasonal Family Analysis | Sales pattern for seasonal families |
| Variant Comparison | Compare variant performance within family |

### 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE | Yes | Optional | Permanent |
| UPDATE (critical: code, category_id, brand_id, default_recipe_id, default_price) | Yes | **Mandatory** | Permanent |
| STATUS CHANGE | Yes | **Mandatory** | Permanent |
| DELETE (soft) | Yes | **Mandatory** | Permanent |

**Audit Level**: Full

### 13. Security Classification

| Fields | Classification |
|---|---|
| `name`, `name_short`, `color_code`, `default_image_file_id`, `is_customer_facing` | Public |
| `description`, `category_id`, `sub_category_id`, `brand_id`, `default_recipe_id`, `default_packaging_id`, `display_order` | Internal |
| `default_price`, `default_cost`, `margin_pct`, `default_tax_code` | Confidential |
| `is_seasonal`, `season_*` | Internal |

### 14. AI Relevance

| AI Capability | Usage |
|---|---|
| Demand Forecast AI | **Primary use** — family-level forecasting (more stable than per-SKU) |
| Inventory Optimization AI | Family-level reorder optimization |
| Pricing AI | Family pricing strategies |
| Recipe Optimization AI | Uses `default_recipe_id` |
| Seasonal Demand AI | Uses `is_seasonal`, `season_*` for seasonal forecasting |
| Variant Recommendation AI | Recommends new variants based on family performance |

### 15. Performance Notes

| Consideration | Guidance |
|---|---|
| Row count | < 500 per company |
| Cache | Redis, TTL 1 hour |
| Query patterns | By `company_id + code`, `category_id + sub_category_id`, `brand_id`, `id` (FK) |
| Aggregation | Family-level sales/inventory computed by aggregating variant Products — pre-computed in materialized view for performance |

### 16. Example Records

#### Example 1: Kaju Katli Family

```json
{
  "id": "01928f7a-...-fam-kaju-katli",
  "code": "FAM-KAJU-KATLI",
  "company_id": "01928f7a-...-company",
  "name": "Kaju Katli",
  "name_short": "Kaju Katli",
  "description": "Traditional cashew fudge — premium sweet made from cashew nuts and sugar",
  "category_id": "01928f7a-...-cat-swt",
  "sub_category_id": "01928f7a-...-scat-swt-df",
  "brand_id": "01928f7a-...-brand-sds",
  "display_order": 10,
  "color_code": "#F59E0B",
  "default_recipe_id": "01928f7a-...-recipe-kaju-katli-v3",
  "default_packaging_id": "01928f7a-...-pkg-kaju-katli",
  "default_uom_class": "WEIGHT",
  "default_tax_code": "GST-05",
  "default_shelf_life_days": 21,
  "default_reorder_point": 50,
  "default_safety_stock": 20,
  "is_customer_facing": true,
  "is_seasonal": true,
  "season_start_month": 10,
  "season_end_month": 12,
  "default_price": 850.0000,
  "default_cost": 580.0000,
  "margin_pct": 31.76,
  "status": "ACTIVE",
  "version": 3,
  "tags": ["premium", "festive", "best-seller"]
}
```

#### Example 2: Bhujia Family

```json
{
  "id": "01928f7a-...-fam-bhujia",
  "code": "FAM-BHUJIA",
  "company_id": "01928f7a-...-company",
  "name": "Bhujia",
  "name_short": "Bhujia",
  "description": "Crispy gram flour namkeen — Bikaneri style",
  "category_id": "01928f7a-...-cat-nmk",
  "sub_category_id": "01928f7a-...-scat-nmk-trad",
  "brand_id": "01928f7a-...-brand-sdn",
  "display_order": 5,
  "color_code": "#EA580C",
  "default_uom_class": "WEIGHT",
  "default_tax_code": "GST-12",
  "default_shelf_life_days": 90,
  "default_reorder_point": 100,
  "default_safety_stock": 40,
  "is_customer_facing": true,
  "is_seasonal": false,
  "default_price": 280.0000,
  "default_cost": 175.0000,
  "margin_pct": 37.50,
  "status": "ACTIVE",
  "version": 1
}
```

#### Example 3: Gulab Jamun (Seasonal + Festival)

```json
{
  "id": "01928f7a-...-fam-gulab-jamun",
  "code": "FAM-GULAB-JAMUN",
  "company_id": "01928f7a-...-company",
  "name": "Gulab Jamun",
  "name_short": "Gulab Jamun",
  "description": "Soft milk-solid dumplings soaked in rose-flavored sugar syrup",
  "category_id": "01928f7a-...-cat-swt",
  "sub_category_id": "01928f7a-...-scat-swt-mlk",
  "brand_id": "01928f7a-...-brand-sds",
  "display_order": 15,
  "color_code": "#7C2D12",
  "default_uom_class": "WEIGHT",
  "default_shelf_life_days": 7,
  "is_customer_facing": true,
  "is_seasonal": true,
  "season_start_month": 8,
  "season_end_month": 11,
  "default_price": 480.0000,
  "default_cost": 290.0000,
  "margin_pct": 39.58,
  "status": "ACTIVE",
  "version": 2,
  "tags": ["perishable", "cold-chain-required", "festive"]
}
```

# Manual 1 · Part 3 · Entities 16-17 — Measurement Foundation (UOM Master, UOM Conversion)

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 3 — Product Master Domain |
| Entities | Unit of Measure (016), UOM Conversion (017) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## Overview — Measurement Foundation Pattern

The Unit of Measure (UOM) system is the **measurement backbone** of the entire platform. Every quantity in SUOP — inventory, recipes, purchase orders, production, sales — is stored in a specific UOM. The UOM system enables:

- **Consistent measurement** — "5 KG" means the same thing across all modules
- **Unit conversion** — purchase in KG, store in GRAM, sell in PACK (with auto-conversion)
- **Base unit standardization** — each product has one base UOM; all quantities stored in base UOM
- **Packaging hierarchy** — 1 carton = 20 boxes = 200 packs = 2000 pieces (defined via UOM conversion + packaging)

### Architectural Decisions (Locked)

| Decision | Value |
|---|---|
| **Base UOM per product** | Every product has exactly one `base_uom_id` — all inventory stored in base UOM |
| **Multiple transaction UOMs** | Products can be purchased, sold, produced in different UOMs (auto-converted to base) |
| **Conversion types** | Fixed (1 KG = 1000 G always), Product-specific (1 BOX = 12 PIECE for Product A, 1 BOX = 24 PIECE for Product B) |
| **Decimal precision** | 4 decimal places for quantities (per Ch 10 §10.4) — supports both bulk (1.5000 KG) and piece (12.0000 EA) |
| **UOM class** | UOMs grouped by class (WEIGHT, COUNT, VOLUME, LENGTH) — conversions only within same class |

---

## Entity 016 — Unit of Measure (UOM) Master

### 1. Business Purpose

The `Uom` entity represents a **standardized unit of measurement** used across the platform. SUOP supports multiple UOM classes:

- **WEIGHT**: KG, GRAM, MILLIGRAM, TON
- **COUNT**: PIECE, BOX, PACK, TRAY, BAG, CARTON, PALLET, DOZEN
- **VOLUME**: LITER, MILLILITER, GALLON
- **LENGTH**: METER, CENTIMETER, FOOT, INCH
- **AREA**: SQUARE_METER, SQUARE_FOOT
- **TIME**: SECOND, MINUTE, HOUR (for production time tracking)

UOMs are **seeded at deployment** and rarely added. Each UOM has a unique code (ISO-standardized where applicable) and belongs to a UOM class. Conversions between UOMs within the same class are defined in the UOM Conversion entity.

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
| Table Name | `uoms` |
| Prisma Model | `Uom` |
| File Location | `prisma/schema/master/product/uom.prisma` |
| Partitioning | None (very low volume — max ~50 UOMs) |

### 4. Field Dictionary

#### 4.1 Universal Base Fields (per Part 1 §3)

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(20) | Yes | — | Unique globally (ISO standard codes), Number Series not used (ISO codes are the codes) | UOM code (e.g., `KG`, `EA`, `L`) |
| `company_id` | UUID | No | NULL | NULL — UOMs are global (not company-scoped) | **Exception**: NULL — UOMs are platform-wide reference data |
| `facility_id` | UUID | No | NULL | — | NULL — UOMs are global |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ARCHIVED | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard fields |

#### 4.2 UOM-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `name` | VARCHAR(50) | Yes | — | Min 2, max 50, unique globally | UOM display name (e.g., "Kilogram") | Public | — |
| `name_short` | VARCHAR(10) | Yes | — | Min 1, max 10, unique globally | Short symbol (e.g., "kg", "ea", "L") | Public | — |
| `description` | TEXT | No | NULL | — | Description | Internal | — |
| `uom_class` | ENUM | Yes | — | WEIGHT, COUNT, VOLUME, LENGTH, AREA, TIME | UOM class (conversions only within same class) | Internal | — |
| `iso_code` | VARCHAR(10) | No | NULL | ISO code if available (e.g., "KGM" for kilogram per ISO 80000) | ISO standardized code | Internal | — |
| `symbol` | VARCHAR(10) | Yes | — | Min 1, max 10 | Display symbol (e.g., "kg", "pc") | Public | — |
| `is_base_unit` | BOOLEAN | Yes | `false` | — | If true, this is the base unit for its class (e.g., KG is base for WEIGHT) | Internal | — |
| `is_decimal_allowed` | BOOLEAN | Yes | `true` | — | If true, decimal quantities allowed (e.g., 1.5 KG); false for count units (1.5 BOX not allowed) | Internal | — |
| `decimal_precision` | SMALLINT | Yes | `4` | 0–6 | Number of decimal places for display | Internal | — |
| `is_seed_uom` | BOOLEAN | Yes | `false` | — | If true, seeded at deployment (cannot be deleted) | Internal | — |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order | Internal | — |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal | — |

### 5. Relationships

| Relationship | Cardinality | Direction | FK Field | Cascade | Delete Rule |
|---|---|---|---|---|---|
| UOM → Product (base_uom) | 1 : N | outbound | `products.base_uom_id` | RESTRICT | Cannot delete UOM used as base by products |
| UOM → Product (purchase_uom) | 1 : N | outbound | `products.purchase_uom_id` | SET NULL | Purchase UOM cleared |
| UOM → Product (sale_uom) | 1 : N | outbound | `products.sale_uom_id` | SET NULL | Sale UOM cleared |
| UOM → UOM Conversion (from) | 1 : N | outbound | `uom_conversions.from_uom_id` | RESTRICT | Cannot delete UOM with conversions |
| UOM → UOM Conversion (to) | 1 : N | outbound | `uom_conversions.to_uom_id` | RESTRICT | — |
| UOM → InventoryLedger | 1 : N | outbound | `inventory_ledger.uom_id` | RESTRICT | Cannot delete UOM with ledger entries |
| UOM → PurchaseOrderLine | 1 : N | outbound | `purchase_order_lines.uom_id` | RESTRICT | — |
| UOM → RecipeLine | 1 : N | outbound | `recipe_lines.uom_id` | RESTRICT | — |

### 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_uoms` | PRIMARY KEY | `id` | Default PK |
| `uq_uoms_code` | UNIQUE | `code` | Global code uniqueness |
| `uq_uoms_name` | UNIQUE | `name` | Name uniqueness |
| `uq_uoms_symbol` | UNIQUE | `symbol` | Symbol uniqueness |
| `idx_uoms_class` | B-TREE | `uom_class, display_order` | Filter by class |
| `idx_uoms_base_unit` | PARTIAL | `uom_class WHERE is_base_unit = true` | Find base unit per class |

### 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `code` unique globally | DB | Unique constraint |
| 2 | `name` unique globally | DB | Unique constraint |
| 3 | `symbol` unique globally | DB | Unique constraint |
| 4 | `uom_class` required | DB | NOT NULL |
| 5 | Only one `is_base_unit = true` per `uom_class` | App | Service-layer validation |
| 6 | `decimal_precision` 0–6 | DB | CHECK constraint |
| 7 | `is_seed_uom = true` UOMs cannot be deleted (only deactivated) | App | Service-layer |
| 8 | `uom_class` is immutable for seed UOMs | App | Service-layer + audit |
| 9 | Cannot change `is_decimal_allowed` once transactions exist | App | Referential integrity check |
| 10 | `display_order` > 0 | DB | CHECK constraint |

### 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/uoms` | GET | List UOMs | `PRODUCT:VIEW` |
| `/api/v1/uoms/:id` | GET | Get UOM details | `PRODUCT:VIEW` |
| `/api/v1/uoms` | POST | Create UOM (rare — usually seeded) | `PRODUCT:CREATE` |
| `/api/v1/uoms/:id` | PATCH | Update UOM | `PRODUCT:EDIT` |
| `/api/v1/uoms/by-class/:class` | GET | List UOMs by class | `PRODUCT:VIEW` |
| `/api/v1/uoms/convert` | POST | Convert quantity between UOMs | `PRODUCT:VIEW` |
| `/api/v1/uoms/:id/conversions` | GET | List conversions for UOM | `PRODUCT:VIEW` |

### 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| UOM List | AG Grid list with class filter | `/products/uoms` |
| UOM Detail | Tabbed: Overview, Conversions, Usage | `/products/uoms/:id` |
| UOM Conversion Matrix | Grid showing all conversions | `/products/uoms/conversions` |

### 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| UOM selector in forms | Choose UOM when entering quantities |
| UOM conversion calculator | Quick conversion on mobile |

### 11. Reports

| Report | Use |
|---|---|
| UOM Master Report | Complete UOM list with classes |
| UOM Conversion Report | All conversion factors |
| UOM Usage Report | Which products use which UOMs |

### 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE | Yes | Optional | Permanent |
| UPDATE (critical: code, uom_class, is_base_unit, is_decimal_allowed) | Yes | **Mandatory** | Permanent |
| STATUS CHANGE | Yes | **Mandatory** | Permanent |
| DELETE (soft — only if no transactions) | Yes | **Mandatory** | Permanent |

**Audit Level**: Full

### 13. Security Classification

| Fields | Classification |
|---|---|
| All fields (`code`, `name`, `symbol`, `uom_class`, etc.) | Public — UOMs are reference data visible to all |

### 14. AI Relevance

| AI Capability | Usage |
|---|---|
| Quantity Validation AI | Validates quantities make sense for UOM class (no 1.5 BOX) |
| Unit-aware Demand Forecast | Forecasting respects UOM conversions |
| Recipe Optimization AI | Converts ingredient quantities between UOMs |

### 15. Performance Notes

| Consideration | Guidance |
|---|---|
| Row count | < 50 (seeded) |
| Cache | Redis, TTL 24 hours (rarely change) |
| Query patterns | By `code` (lookup), `uom_class`, `id` (FK) |
| Hot path | UOM lookup is on every inventory/transaction query — must be cached |

### 16. Example Records (Seeded UOMs)

#### Weight Class

```json
[
  {
    "id": "01928f7a-...-uom-kg",
    "code": "KG",
    "name": "Kilogram",
    "name_short": "kg",
    "uom_class": "WEIGHT",
    "iso_code": "KGM",
    "symbol": "kg",
    "is_base_unit": true,
    "is_decimal_allowed": true,
    "decimal_precision": 4,
    "is_seed_uom": true,
    "display_order": 10,
    "status": "ACTIVE"
  },
  {
    "id": "01928f7a-...-uom-g",
    "code": "G",
    "name": "Gram",
    "name_short": "g",
    "uom_class": "WEIGHT",
    "iso_code": "GRM",
    "symbol": "g",
    "is_base_unit": false,
    "is_decimal_allowed": true,
    "decimal_precision": 4,
    "is_seed_uom": true,
    "display_order": 20,
    "status": "ACTIVE"
  },
  {
    "id": "01928f7a-...-uom-mg",
    "code": "MG",
    "name": "Milligram",
    "name_short": "mg",
    "uom_class": "WEIGHT",
    "iso_code": "MGM",
    "symbol": "mg",
    "is_base_unit": false,
    "is_decimal_allowed": true,
    "decimal_precision": 4,
    "is_seed_uom": true,
    "display_order": 30,
    "status": "ACTIVE"
  },
  {
    "id": "01928f7a-...-uom-ton",
    "code": "TON",
    "name": "Metric Ton",
    "name_short": "ton",
    "uom_class": "WEIGHT",
    "iso_code": "TNE",
    "symbol": "ton",
    "is_base_unit": false,
    "is_decimal_allowed": true,
    "decimal_precision": 4,
    "is_seed_uom": true,
    "display_order": 40,
    "status": "ACTIVE"
  }
]
```

#### Count Class

```json
[
  {
    "id": "01928f7a-...-uom-ea",
    "code": "EA",
    "name": "Each (Piece)",
    "name_short": "ea",
    "uom_class": "COUNT",
    "iso_code": "EA",
    "symbol": "pc",
    "is_base_unit": true,
    "is_decimal_allowed": false,
    "decimal_precision": 0,
    "is_seed_uom": true,
    "display_order": 10,
    "status": "ACTIVE"
  },
  {
    "id": "01928f7a-...-uom-dzn",
    "code": "DZN",
    "name": "Dozen",
    "name_short": "dzn",
    "uom_class": "COUNT",
    "iso_code": "DZN",
    "symbol": "dzn",
    "is_base_unit": false,
    "is_decimal_allowed": true,
    "decimal_precision": 2,
    "is_seed_uom": true,
    "display_order": 20,
    "status": "ACTIVE"
  },
  {
    "id": "01928f7a-...-uom-box",
    "code": "BOX",
    "name": "Box",
    "name_short": "box",
    "uom_class": "COUNT",
    "symbol": "box",
    "is_base_unit": false,
    "is_decimal_allowed": true,
    "decimal_precision": 2,
    "is_seed_uom": true,
    "display_order": 30,
    "status": "ACTIVE"
  },
  {
    "id": "01928f7a-...-uom-pack",
    "code": "PACK",
    "name": "Pack",
    "name_short": "pack",
    "uom_class": "COUNT",
    "symbol": "pack",
    "is_base_unit": false,
    "is_decimal_allowed": true,
    "decimal_precision": 2,
    "is_seed_uom": true,
    "display_order": 40,
    "status": "ACTIVE"
  },
  {
    "id": "01928f7a-...-uom-ctn",
    "code": "CTN",
    "name": "Carton",
    "name_short": "ctn",
    "uom_class": "COUNT",
    "symbol": "ctn",
    "is_base_unit": false,
    "is_decimal_allowed": true,
    "decimal_precision": 2,
    "is_seed_uom": true,
    "display_order": 50,
    "status": "ACTIVE"
  },
  {
    "id": "01928f7a-...-uom-plt",
    "code": "PLT",
    "name": "Pallet",
    "name_short": "plt",
    "uom_class": "COUNT",
    "symbol": "plt",
    "is_base_unit": false,
    "is_decimal_allowed": true,
    "decimal_precision": 2,
    "is_seed_uom": true,
    "display_order": 60,
    "status": "ACTIVE"
  }
]
```

#### Volume Class

```json
[
  {
    "id": "01928f7a-...-uom-l",
    "code": "L",
    "name": "Liter",
    "name_short": "L",
    "uom_class": "VOLUME",
    "iso_code": "LTR",
    "symbol": "L",
    "is_base_unit": true,
    "is_decimal_allowed": true,
    "decimal_precision": 4,
    "is_seed_uom": true,
    "display_order": 10,
    "status": "ACTIVE"
  },
  {
    "id": "01928f7a-...-uom-ml",
    "code": "ML",
    "name": "Milliliter",
    "name_short": "ml",
    "uom_class": "VOLUME",
    "iso_code": "MLT",
    "symbol": "ml",
    "is_base_unit": false,
    "is_decimal_allowed": true,
    "decimal_precision": 4,
    "is_seed_uom": true,
    "display_order": 20,
    "status": "ACTIVE"
  }
]
```

---

## Entity 017 — UOM Conversion

### 1. Business Purpose

The `UomConversion` entity defines **conversion factors between UOMs** within the same UOM class. This enables:

- **Purchase in KG, store in GRAM** — auto-conversion on goods receipt
- **Recipe in GRAM, issue in KG** — auto-conversion on production issue
- **Packaging hierarchy** — 1 CARTON = 20 BOX = 240 PACK = 2400 PIECE (via chain of conversions)
- **Multi-UOM transactions** — buy by KG, sell by PACK, all reconciled via base UOM

Two types of conversions:
1. **Global (standard) conversions** — Fixed factors (1 KG = 1000 G, 1 L = 1000 ML) — apply to all products
2. **Product-specific conversions** — Variable factors (1 BOX = 12 PIECE for Product A, 1 BOX = 24 PIECE for Product B)

Both types are stored in the same table; product-specific conversions have a non-null `product_id`.

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
| Table Name | `uom_conversions` |
| Prisma Model | `UomConversion` |
| File Location | `prisma/schema/master/product/uom_conversion.prisma` |
| Partitioning | None (low volume — max ~500 conversions) |

### 4. Field Dictionary

#### 4.1 Universal Base Fields

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Auto-generated: `CONV-{from}-TO-{to}` | Conversion code |
| `company_id` | UUID | No | NULL | NULL for global conversions; FK for company-specific | NULL = global; set = company-specific |
| `facility_id` | UUID | No | NULL | — | NULL — Conversions are company or global |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ARCHIVED | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |

#### 4.2 Conversion-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `from_uom_id` | UUID | Yes | — | FK to `uoms.id` | Source UOM | Internal | — |
| `to_uom_id` | UUID | Yes | — | FK to `uoms.id` | Target UOM | Internal | — |
| `product_id` | UUID | No | NULL | FK to `products.id`; NULL = global conversion | Product-specific conversion (NULL = global) | Internal | — |
| `conversion_factor` | DECIMAL(18,6) | Yes | — | > 0 | Multiplier: `to_qty = from_qty * conversion_factor` | Internal | — |
| `inverse_factor` | DECIMAL(18,6) | No | — | Generated: `1 / conversion_factor` | Inverse multiplier (for reverse conversion) | Internal | — |
| `is_rounded` | BOOLEAN | Yes | `false` | — | If true, result rounded to UOM's decimal_precision | Internal | — |
| `rounding_method` | ENUM | No | `ROUND_HALF_UP` | ROUND_UP, ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_DOWN, ROUND_HALF_EVEN; required if is_rounded=true | Rounding method | Internal | — |
| `precision_decimal` | SMALLINT | No | NULL | 0–6 | Override precision (NULL = use to_uom's decimal_precision) | Internal | — |
| `conversion_type` | ENUM | Yes | `STANDARD` | STANDARD (global, fixed), PRODUCT_SPECIFIC (varies by product), PACKAGING (linked to packaging) | Conversion type | Internal | — |
| `effective_from` | DATE | No | NULL | — | Effective dating | Internal | — |
| `effective_to` | DATE | No | NULL | Must be > effective_from | Effective dating end | Internal | — |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal | — |

### 5. Relationships

| Relationship | Cardinality | Direction | FK Field | Cascade | Delete Rule |
|---|---|---|---|---|---|
| UomConversion → UOM (from) | N : 1 | inbound | `from_uom_id` → `uoms.id` | RESTRICT | Cannot delete UOM with conversions |
| UomConversion → UOM (to) | N : 1 | inbound | `to_uom_id` → `uoms.id` | RESTRICT | — |
| UomConversion → Product | N : 1 | inbound | `product_id` → `products.id` | CASCADE | Product-specific conversions deleted with product |
| UomConversion → Company | N : 1 | inbound | `company_id` → `companies.id` | RESTRICT | — |

### 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_uom_conversions` | PRIMARY KEY | `id` | Default PK |
| `uq_conversions_from_to_product` | UNIQUE | `from_uom_id, to_uom_id, COALESCE(product_id, '00000000-0000-0000-0000-000000000000')` | One conversion per from→to per product (or global) |
| `idx_conversions_from` | B-TREE | `from_uom_id` | Find conversions from a UOM |
| `idx_conversions_to` | B-TREE | `to_uom_id` | Find conversions to a UOM |
| `idx_conversions_product` | B-TREE | `product_id WHERE product_id IS NOT NULL` | Find product-specific conversions |
| `idx_conversions_global` | PARTIAL | `from_uom_id, to_uom_id WHERE product_id IS NULL` | Global conversions lookup |

### 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `from_uom_id` ≠ `to_uom_id` | DB | CHECK constraint |
| 2 | `from_uom.uom_class` must equal `to_uom.uom_class` (no cross-class conversions) | App | Service-layer validation |
| 3 | `conversion_factor` > 0 | DB | CHECK constraint |
| 4 | Only one conversion per (from, to, product) combination | DB | Unique constraint |
| 5 | If `is_rounded = true`, `rounding_method` required | DB | CHECK constraint |
| 6 | `effective_to` > `effective_from` if both set | DB | CHECK constraint |
| 7 | If `product_id` is set, both UOMs must be referenced by the product (as base, purchase, sale, or production UOM) | App | Service-layer validation |
| 8 | Cannot create circular conversion chain (A→B, B→A both defined) — inverse is auto-computed | App | Service-layer check |
| 9 | Product-specific conversion overrides global conversion for that product | App | Resolution logic — product-specific wins |

### 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/uom-conversions` | GET | List conversions | `PRODUCT:VIEW` |
| `/api/v1/uom-conversions/:id` | GET | Get conversion | `PRODUCT:VIEW` |
| `/api/v1/uom-conversions` | POST | Create conversion | `PRODUCT:CREATE` |
| `/api/v1/uom-conversions/:id` | PATCH | Update conversion | `PRODUCT:EDIT` |
| `/api/v1/uom-conversions/convert` | POST | Convert quantity | `PRODUCT:VIEW` |
| `/api/v1/uom-conversions/matrix` | GET | Get conversion matrix | `PRODUCT:VIEW` |
| `/api/v1/uom-conversions/by-product/:productId` | GET | Get product-specific conversions | `PRODUCT:VIEW` |

### 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Conversion List | AG Grid with product filter | `/products/uom-conversions` |
| Conversion Matrix | Grid: rows=from UOM, cols=to UOM, cells=factor | `/products/uom-conversions/matrix` |
| Conversion Create Form | Fields: from, to, factor, product (optional) | `/products/uom-conversions/new` |
| Product Conversion View | Per-product conversion list | `/products/:id/conversions` |

### 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| UOM converter tool | Quick conversion on mobile |
| Auto-conversion on transactions | Display alternative UOM quantities |

### 11. Reports

| Report | Use |
|---|---|
| Conversion Master Report | All conversions |
| Product-specific Conversion Report | Conversions by product |
| Conversion Audit Report | Changes to conversion factors |

### 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE | Yes | Optional | Permanent |
| UPDATE (critical: conversion_factor) | Yes | **Mandatory** | Permanent |
| STATUS CHANGE | Yes | **Mandatory** | Permanent |
| DELETE (soft) | Yes | **Mandatory** | Permanent |

**Audit Level**: Full — conversion factor changes are critical (affect all historical calculations if not versioned)

### 13. Security Classification

| Fields | Classification |
|---|---|
| All fields | Internal — operational reference data |

### 14. AI Relevance

| AI Capability | Usage |
|---|---|
| Quantity Validation AI | Validates conversions are sensible |
| Recipe Optimization AI | Converts ingredient quantities |
| Inventory Optimization AI | Reorder point calculations across UOMs |
| Price Comparison AI | Normalizes prices to base UOM for comparison |

### 15. Performance Notes

| Consideration | Guidance |
|---|---|
| Row count | < 500 (mostly global conversions) |
| Cache | Redis, TTL 24 hours (rarely change) |
| Query patterns | By `from_uom_id + to_uom_id + product_id` (hot path on every transaction) |
| Hot path | Conversion lookup is on every transaction — must be cached |
| Inverse computation | Inverse factor computed once and cached (don't divide on every query) |

### 16. Example Records

#### Global Standard Conversions

```json
[
  {
    "id": "01928f7a-...-conv-kg-to-g",
    "code": "CONV-KG-TO-G",
    "company_id": null,
    "from_uom_id": "01928f7a-...-uom-kg",
    "to_uom_id": "01928f7a-...-uom-g",
    "product_id": null,
    "conversion_factor": 1000.000000,
    "inverse_factor": 0.001000,
    "is_rounded": false,
    "conversion_type": "STANDARD",
    "status": "ACTIVE",
    "version": 1
  },
  {
    "id": "01928f7a-...-conv-g-to-mg",
    "code": "CONV-G-TO-MG",
    "from_uom_id": "01928f7a-...-uom-g",
    "to_uom_id": "01928f7a-...-uom-mg",
    "product_id": null,
    "conversion_factor": 1000.000000,
    "inverse_factor": 0.001000,
    "conversion_type": "STANDARD",
    "status": "ACTIVE"
  },
  {
    "id": "01928f7a-...-conv-ton-to-kg",
    "code": "CONV-TON-TO-KG",
    "from_uom_id": "01928f7a-...-uom-ton",
    "to_uom_id": "01928f7a-...-uom-kg",
    "product_id": null,
    "conversion_factor": 1000.000000,
    "inverse_factor": 0.001000,
    "conversion_type": "STANDARD",
    "status": "ACTIVE"
  },
  {
    "id": "01928f7a-...-conv-l-to-ml",
    "code": "CONV-L-TO-ML",
    "from_uom_id": "01928f7a-...-uom-l",
    "to_uom_id": "01928f7a-...-uom-ml",
    "product_id": null,
    "conversion_factor": 1000.000000,
    "inverse_factor": 0.001000,
    "conversion_type": "STANDARD",
    "status": "ACTIVE"
  },
  {
    "id": "01928f7a-...-conv-dzn-to-ea",
    "code": "CONV-DZN-TO-EA",
    "from_uom_id": "01928f7a-...-uom-dzn",
    "to_uom_id": "01928f7a-...-uom-ea",
    "product_id": null,
    "conversion_factor": 12.000000,
    "inverse_factor": 0.083333,
    "is_rounded": true,
    "rounding_method": "ROUND_HALF_UP",
    "conversion_type": "STANDARD",
    "status": "ACTIVE"
  }
]
```

#### Product-Specific Conversions

```json
[
  {
    "id": "01928f7a-...-conv-kaju-box-ea",
    "code": "CONV-BOX-TO-EA-KAJU-500",
    "company_id": "01928f7a-...-company",
    "from_uom_id": "01928f7a-...-uom-box",
    "to_uom_id": "01928f7a-...-uom-ea",
    "product_id": "01928f7a-...-prod-kaju-katli-500",
    "conversion_factor": 24.000000,
    "inverse_factor": 0.041667,
    "is_rounded": true,
    "rounding_method": "ROUND_HALF_UP",
    "conversion_type": "PRODUCT_SPECIFIC",
    "remarks": "Kaju Katli 500g: 1 box = 24 pieces",
    "status": "ACTIVE"
  },
  {
    "id": "01928f7a-...-conv-bhujia-box-ea",
    "code": "CONV-BOX-TO-EA-BHUJIA-200",
    "company_id": "01928f7a-...-company",
    "from_uom_id": "01928f7a-...-uom-box",
    "to_uom_id": "01928f7a-...-uom-ea",
    "product_id": "01928f7a-...-prod-bhujia-200",
    "conversion_factor": 48.000000,
    "inverse_factor": 0.020833,
    "conversion_type": "PRODUCT_SPECIFIC",
    "remarks": "Bhujia 200g: 1 box = 48 pieces",
    "status": "ACTIVE"
  },
  {
    "id": "01928f7a-...-conv-kaju-ctn-box",
    "code": "CONV-CTN-TO-BOX-KAJU-500",
    "company_id": "01928f7a-...-company",
    "from_uom_id": "01928f7a-...-uom-ctn",
    "to_uom_id": "01928f7a-...-uom-box",
    "product_id": "01928f7a-...-prod-kaju-katli-500",
    "conversion_factor": 20.000000,
    "inverse_factor": 0.050000,
    "conversion_type": "PACKAGING",
    "remarks": "Kaju Katli 500g: 1 carton = 20 boxes",
    "status": "ACTIVE"
  }
]
```

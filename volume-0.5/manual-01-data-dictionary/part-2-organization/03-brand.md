# Manual 1 · Part 2 · Entity 3 — Brand

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 2 — Organization Domain |
| Entity | Brand |
| Entity Code | A.3 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## 1. Business Purpose

The `Brand` entity represents a **customer-facing brand identity** under which products are sold, stores operate, or restaurants function. Per Volume 0 Chapter 1 §2.3, Sudhastar operates under a multi-brand model with three tiers (confirmed in Q2):

1. **Corporate Parent Brand** — Sudhastar Group (umbrella identity)
2. **Product-Line Brands** — Sudhamrit Sweets, Sudhamrit Namkeen, Sudhamrit Bakery, Sudhamrit Snacks, Sudhamrit RTE, Sudhamrit Frozen
3. **Future Independent Retail Brands** — Potential future standalone brand identities

The Brand entity is **hierarchical** (a brand can have sub-brands) and is referenced by Products, Facilities (retail stores/restaurants carry a primary brand), and transactional records. It enables brand-scoped reporting, brand-specific pricing, and brand-level compliance tracking.

Every customer-facing artifact (product, store, outlet, invoice, receipt) carries a `brand_id` that determines its visual identity, pricing rules, and reporting grouping.

---

## 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Marketing Head / MD |
| Data Owner | Product Management Head |
| Technical Owner | Backend Lead — Organization Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

---

## 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `brands` |
| Prisma Model | `Brand` |
| File Location | `prisma/schema/master/organization/brand.prisma` |
| Partitioning | None (low volume — max ~30 brands) |
| Lifecycle | Master Data Lifecycle (Volume 0 Ch 7 §7.5) |

---

## 4. Field Dictionary

### 4.1 Universal Base Fields (per Part 1 §3)

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | `uuid_generate_v7()` | PK, immutable | Internal primary key |
| `code` | VARCHAR(20) | Yes | — | Unique per company, format `^[A-Z]{2,10}$`, Number Series `BRD-` | Brand code (e.g., `SDS` for Sudhamrit Sweets) |
| `company_id` | UUID | Yes | — | FK to `companies.id` | Owning company |
| `facility_id` | UUID | No | NULL | — | **Exception**: NULL for Brand — Brand spans facilities |
| `status` | ENUM | Yes | `DRAFT` | 8-stage master lifecycle | Master data lifecycle |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation timestamp (UTC) |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto-update | Last modification (UTC) |
| `created_by` | UUID | Yes | — | FK to `user_accounts.id` | Creator |
| `updated_by` | UUID | Yes | — | FK to `user_accounts.id` | Last modifier |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft-delete timestamp |
| `version` | INTEGER | Yes | `1` | Optimistic concurrency | Increments on each update |

### 4.2 Brand-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `name` | VARCHAR(100) | Yes | — | Min 2, max 100 chars | Brand display name (e.g., "Sudhamrit Sweets") | Public | — |
| `name_short` | VARCHAR(30) | Yes | — | Min 2, max 30 chars | Short name (e.g., "SDS") | Public | — |
| `description` | TEXT | No | NULL | — | Brand description / positioning | Internal | — |
| `parent_brand_id` | UUID | No | NULL | FK self-ref, no cycles | Parent brand for hierarchical structure (corporate → product-line → sub-brand) | Internal | — |
| `brand_tier` | ENUM | Yes | `PRODUCT_LINE` | CORPORATE, PRODUCT_LINE, SUB_BRAND, INDEPENDENT | Brand hierarchy tier (per Q2 lock-in) | Internal | — |
| `brand_category` | ENUM | Yes | — | SWEETS, NAMEKEEN, BAKERY, SNACKS, RTE, FROZEN, PACKAGING, RETAIL, RESTAURANT, GENERAL | Product/service category the brand represents | Internal | — |
| `logo_file_id` | UUID | No | NULL | FK to `file_attachments.id` | Brand logo | Public | — |
| `color_primary` | VARCHAR(7) | No | NULL | Hex color `^#[0-9A-Fa-f]{6}$` | Brand primary color (for UI theming) | Public | — |
| `color_secondary` | VARCHAR(7) | No | NULL | Hex color | Brand secondary color | Public | — |
| `tagline` | VARCHAR(200) | No | NULL | — | Brand tagline | Public | — |
| `default_uom_class` | VARCHAR(20) | No | NULL | — | Default UOM class for this brand's products (e.g., WEIGHT for sweets, COUNT for retail) | Internal | — |
| `default_tax_code` | VARCHAR(20) | No | NULL | FK to `tax_codes.code` | Default tax code for brand's products | Internal | — |
| `default_shelf_life_days` | INTEGER | No | NULL | > 0 | Default shelf life for brand's products (per Ch 8 §8.3) | Internal | Expiry prediction |
| `default_reorder_point` | INTEGER | No | NULL | ≥ 0 | Default reorder point (per Q10) | Internal | Reorder AI |
| `default_safety_stock` | INTEGER | No | NULL | ≥ 0 | Default safety stock | Internal | Reorder AI |
| `fssai_brand_code` | VARCHAR(20) | No | NULL | — | FSSAI brand registration code (if separate from company license) | Confidential | Compliance |
| `is_customer_facing` | BOOLEAN | Yes | `true` | — | If true, brand appears on customer-facing materials | Internal | — |
| `allows_third_party_products` | BOOLEAN | Yes | `false` | — | If true, this brand can include third-party FMCG products (e.g., retail brand sells beverages) | Internal | — |
| `effective_from` | DATE | No | NULL | — | Effective dating (per Ch 7 §7.11) | Internal | — |
| `effective_to` | DATE | No | NULL | Must be > effective_from if set | Effective dating end | Internal | — |
| `remarks` | TEXT | No | NULL | — | Free-text annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Filterable annotations | Internal | — |

---

## 5. Relationships

| Relationship | Cardinality | Direction | FK Field | Cascade | Delete Rule |
|---|---|---|---|---|---|
| Brand → Company | N : 1 | inbound | `brands.company_id` → `companies.id` | RESTRICT | Cannot delete company with active brands |
| Brand → Brand (parent) | N : 1 | self-ref | `brands.parent_brand_id` | SET NULL | Sub-brand becomes standalone if parent deleted |
| Brand → Product | 1 : N | outbound | `products.brand_id` | RESTRICT | Cannot delete brand with active products |
| Brand → Facility | 1 : N | outbound | `facilities.primary_brand_id` | SET NULL | Facilities lose primary brand |
| Brand → FileAttachment (logo) | N : 1 | inbound | `brands.logo_file_id` → `file_attachments.id` | SET NULL | Logo file removal sets brand logo to NULL |
| Brand → TaxCode | N : 1 | inbound | `brands.default_tax_code` → `tax_codes.code` | SET NULL | Default tax code cleared |

---

## 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_brands` | PRIMARY KEY | `id` | Default PK |
| `uq_brands_code_company` | UNIQUE | `company_id, code` | Code uniqueness per company |
| `uq_brands_name_company` | UNIQUE PARTIAL | `company_id, name WHERE deleted_at IS NULL` | Name uniqueness per company (active) |
| `idx_brands_status` | B-TREE | `status, deleted_at` | Default query filter |
| `idx_brands_parent` | B-TREE | `parent_brand_id` | Hierarchy traversal |
| `idx_brands_tier` | B-TREE | `company_id, brand_tier` | Filter by tier (corporate/product-line/sub-brand) |
| `idx_brands_category` | B-TREE | `brand_category` | Filter by product category |

---

## 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `code` must be unique per company | DB + App | Unique constraint |
| 2 | `name` must be unique per company (among active brands) | DB + App | Unique partial constraint |
| 3 | `parent_brand_id` cannot reference self | App | Service-layer check |
| 4 | `parent_brand_id` cannot create cycle | App | Recursive CTE check |
| 5 | `parent_brand_id` must belong to same company | App | Service-layer validation |
| 6 | Brand tier hierarchy: CORPORATE → PRODUCT_LINE → SUB_BRAND → INDEPENDENT (parent must be higher tier) | App | Service-layer validation |
| 7 | `brand_tier = CORPORATE` implies `parent_brand_id IS NULL` | App + DB | CHECK constraint |
| 8 | `brand_tier = SUB_BRAND` implies `parent_brand_id IS NOT NULL` | App + DB | CHECK constraint |
| 9 | `default_shelf_life_days` must be > 0 if set | DB | CHECK constraint |
| 10 | `default_reorder_point` and `default_safety_stock` must be ≥ 0 | DB | CHECK constraint |
| 11 | State transition DRAFT → SUBMITTED requires `name`, `brand_tier`, `brand_category` | App | Master Data Quality Validator |
| 12 | Once ACTIVE, `code` and `brand_tier` are immutable | App | Service-layer + audit |
| 13 | `color_primary` and `color_secondary` must be valid hex colors | App | Zod schema |

---

## 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/brands` | GET | List brands | `ORGANIZATION:VIEW` |
| `/api/v1/brands/:id` | GET | Get brand details | `ORGANIZATION:VIEW` |
| `/api/v1/brands` | POST | Create brand (DRAFT) | `ORGANIZATION:CREATE` |
| `/api/v1/brands/:id` | PATCH | Update brand | `ORGANIZATION:EDIT` |
| `/api/v1/brands/:id/submit` | POST | Submit for approval | `ORGANIZATION:EDIT` |
| `/api/v1/brands/:id/approve` | POST | Approve brand | `ORGANIZATION:APPROVE` |
| `/api/v1/brands/:id/activate` | POST | Activate brand | `ORGANIZATION:APPROVE` |
| `/api/v1/brands/:id/deactivate` | POST | Deactivate brand | `ORGANIZATION:APPROVE` |
| `/api/v1/brands/:id/products` | GET | List products under brand | `ORGANIZATION:VIEW` |
| `/api/v1/brands/:id/children` | GET | List sub-brands | `ORGANIZATION:VIEW` |
| `/api/v1/brands/:id/hierarchy` | GET | Get brand hierarchy tree | `ORGANIZATION:VIEW` |

---

## 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Brand List | AG Grid list with tier/category filter | `/organization/brands` |
| Brand Detail | Tabbed: Overview, Products, Sub-brands, Audit | `/organization/brands/:id` |
| Brand Create Form | Fields: name, tier, category, parent, colors, logo | `/organization/brands/new` |
| Brand Hierarchy Tree | Visual tree of brand parent-child relationships | `/organization/brands/hierarchy` |

---

## 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| View-only brand info | Users see which brand they're working with |
| Brand filter on dashboards | L2+ filter KPIs by brand |
| Brand badge on products | Mobile product lookup shows brand badge |

---

## 11. Reports

| Report | Use of Brand |
|---|---|
| Brand Performance Report | Revenue, margin, volume per brand |
| Brand-wise Sales | POS sales grouped by brand |
| Brand Inventory Valuation | Stock value grouped by brand |
| Brand Compliance Report | FSSAI compliance per brand |
| Brand Comparison | Cross-brand performance comparison |

---

## 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE | Yes | Optional | Permanent |
| UPDATE (non-critical) | Yes | Optional | Permanent |
| UPDATE (critical: code, brand_tier, brand_category, fssai_brand_code) | Yes | **Mandatory** | Permanent |
| STATUS CHANGE | Yes | **Mandatory** | Permanent |
| DELETE (soft) | Yes | **Mandatory** | Permanent |

**Audit Level**: Full

---

## 13. Security Classification

| Field Category | Classification | Access |
|---|---|---|
| `name`, `name_short`, `tagline`, `logo_file_id`, `color_*` | Public | All authenticated users |
| `description`, `brand_tier`, `brand_category`, `parent_brand_id` | Internal | L2+ Marketing, Admin |
| `default_tax_code`, `default_shelf_life_days`, `default_reorder_point` | Internal | L2+ Product Mgmt, Finance |
| `fssai_brand_code` | Confidential | L2+ Quality, Compliance |
| `allows_third_party_products` | Internal | L2+ Product Mgmt |

---

## 14. AI Relevance

| AI Capability | Usage |
|---|---|
| Demand Forecast AI | Per-brand forecasting (Sweets vs Namkeen have different demand patterns) |
| Pricing AI | Brand-specific pricing strategies |
| Inventory Optimization AI | Per-brand reorder point optimization |
| Expiry Prediction AI | Uses `default_shelf_life_days` for brand-level expiry alerts |
| Brand Performance AI | Recommends brand portfolio adjustments |

---

## 15. Performance Notes

| Consideration | Guidance |
|---|---|
| Row count | < 30 rows per company |
| Cache strategy | Redis cache, TTL 1 hour, invalidated on update |
| Query patterns | Queried by `company_id + code`, `id` (FK), or `parent_brand_id` (hierarchy) |
| Joins | Frequently joined with Product, Facility |
| Hierarchy traversal | Recursive CTE for brand tree; max depth 4 (corporate → product-line → sub-brand → independent) |

---

## 16. Example Records

### Example 1: Sudhamrit (Corporate Parent Brand)

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7eb1",
  "code": "SDM",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Sudhamrit",
  "name_short": "SDM",
  "description": "Sudhamrit corporate parent brand — umbrella identity for all product lines",
  "parent_brand_id": null,
  "brand_tier": "CORPORATE",
  "brand_category": "GENERAL",
  "color_primary": "#0F766E",
  "color_secondary": "#14B8A6",
  "tagline": "Taste of Tradition",
  "is_customer_facing": true,
  "allows_third_party_products": false,
  "status": "ACTIVE",
  "version": 1
}
```

### Example 2: Sudhamrit Sweets (Product-Line Brand)

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7eb2",
  "code": "SDS",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Sudhamrit Sweets",
  "name_short": "SDS",
  "description": "Traditional Indian sweets — Kaju Katli, Gulab Jamun, Barfi, and more",
  "parent_brand_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7eb1",
  "brand_tier": "PRODUCT_LINE",
  "brand_category": "SWEETS",
  "color_primary": "#DC2626",
  "color_secondary": "#FCA5A5",
  "tagline": "Sweet Moments, Pure Joy",
  "default_uom_class": "WEIGHT",
  "default_shelf_life_days": 15,
  "default_reorder_point": 50,
  "default_safety_stock": 20,
  "is_customer_facing": true,
  "allows_third_party_products": false,
  "status": "ACTIVE",
  "version": 2
}
```

### Example 3: Sudhamrit Namkeen (Product-Line Brand)

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7eb3",
  "code": "SDN",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Sudhamrit Namkeen",
  "name_short": "SDN",
  "description": "Savory snacks — Bhujia, Sev, Mixture, and regional namkeen varieties",
  "parent_brand_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7eb1",
  "brand_tier": "PRODUCT_LINE",
  "brand_category": "NAMEKEEN",
  "color_primary": "#EA580C",
  "color_secondary": "#FDBA74",
  "tagline": "Crunch in Every Bite",
  "default_uom_class": "WEIGHT",
  "default_shelf_life_days": 90,
  "default_reorder_point": 100,
  "default_safety_stock": 40,
  "is_customer_facing": true,
  "allows_third_party_products": false,
  "status": "ACTIVE",
  "version": 1
}
```

### Example 4: Sudhamrit Retail (Retail Brand — with third-party products)

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7eb4",
  "code": "SDR",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Sudhamrit Retail",
  "name_short": "SDR",
  "description": "Retail store brand — sells own products plus third-party FMCG, beverages, grocery",
  "parent_brand_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7eb1",
  "brand_tier": "PRODUCT_LINE",
  "brand_category": "RETAIL",
  "color_primary": "#2563EB",
  "color_secondary": "#93C5FD",
  "tagline": "Everything Fresh, Everything Local",
  "is_customer_facing": true,
  "allows_third_party_products": true,
  "status": "ACTIVE",
  "version": 1
}
```

### Example 5: Sudhamrit Food Joint (Restaurant Brand)

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7eb5",
  "code": "SFJ",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Sudhamrit Food Joint",
  "name_short": "SFJ",
  "description": "Quick-service restaurant chain — fresh sweets, snacks, meals",
  "parent_brand_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7eb1",
  "brand_tier": "PRODUCT_LINE",
  "brand_category": "RESTAURANT",
  "color_primary": "#7C3AED",
  "color_secondary": "#C4B5FD",
  "tagline": "Fresh Food, Fast Service",
  "is_customer_facing": true,
  "allows_third_party_products": false,
  "status": "ACTIVE",
  "version": 1
}
```

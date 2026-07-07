# Manual 1 · Part 7 · Section 2 · Entities 61-63 — Recipe Core Triad (Recipe Master, Recipe Version, Formula Master)

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 7 — Manufacturing Domain |
| Section | 2 — Recipe, Formula & BOM Management |
| Entities | Recipe Master (061), Recipe Version (062), Formula Master (063) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 4 §4.11, Ch 7 §7.6, Ch 18 §18.5, Part 7 §2 |
| Last Updated | 2026-07-07 |

---

## Overview — Recipe Core Triad Architecture

The Recipe Core Triad is the **manufacturing knowledge foundation** — how to make a product:

```
RECIPE MASTER (061)
  │ — What product this recipe is for
  │ — Which version is active
  ├── RECIPE VERSION (062)
  │    — Specific approved revision (IMMUTABLE after release)
  │    — Effective dating (per Ch 7 §7.11)
  └── FORMULA MASTER (063)
       — Ingredient composition for a specific version
       — Quantities, UOMs, tolerances, critical ingredients
```

### Versioning Pattern (per Ch 4 §4.11, Ch 7 §7.6)

Recipe is one of the **6 versioned master data types**:
- `Recipe` (parent, mutable) → `RecipeVersion[]` (immutable children)
- Active version pointer: `recipe.default_version_id`
- Historical Production Orders reference the **specific version** active at execution time — never the active pointer
- Editing a recipe creates a NEW version; old versions are **immutable** (per Part 7 §3: "Immutable approved versions")

### Recipe vs. Formula vs. BOM Distinction

| Entity | Purpose | Granularity |
|---|---|---|
| **Recipe Master** | Parent entity — identifies which product, which type, active version | One per product |
| **Recipe Version** | Specific approved revision — effective dates, approval, status | Multiple per recipe (v1, v2, v3...) |
| **Formula Master** | Ingredient composition — what goes in, how much, in what order | One per recipe version |
| **BOM (064)** | Complete material requirements — ingredients + packaging + labels + consumables | One per recipe version |

**Formula = "what ingredients"**; **BOM = "all materials including packaging"**; **Process Steps (067) = "how to make it"**.

---

## Entity 061 — Recipe Master

### 1. Business Purpose

The `Recipe` entity is the **parent recipe definition** for a finished or semi-finished product. Per Volume 0 Chapter 7 §7.6, Recipe is one of the 6 versioned master data types. Per Part 7 §1:

> *"A Recipe is not just an ingredient list. A Recipe defines: Ingredients, Quantities, UOM, Process, Temperature, Mixing Time, Cooking Time, Cooling Time, Packaging, Quality Standards, Yield, Wastage, Cost, Nutrition, Allergens."*

Recipe Master is the **container** — it holds the product reference, recipe type, and a pointer to the active version. The actual formula, BOM, process steps, and parameters live in Recipe Version (Entity 062) and its children.

Per Part 7 §3: *"Recipe Code immutable. One default version per recipe. Historical recipes preserved."*

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Manufacturing Head |
| Data Owner | Manufacturing Head + Quality Head (recipe accuracy is a food safety concern) |
| Technical Owner | Backend Lead — Manufacturing Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `recipes` |
| Prisma Model | `Recipe` |
| File Location | `prisma/schema/master/manufacturing/recipe.prisma` |
| Partitioning | None (low-medium volume — max ~2,000 recipes) |
| Lifecycle | 8-stage master data lifecycle (per Ch 7 §7.5) |
| Versioned Sub-Entity | `recipe_versions` (Entity 062, per Ch 7 §7.6) |

### 4. Field Dictionary

#### 4.1 Universal Base Fields (per Part 1 §3)

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | `uuid_generate_v7()` | PK, immutable | Internal primary key |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `REC-` | Recipe code (e.g., `REC-000001`) — **immutable after activation** (per Part 7 §3) |
| `company_id` | UUID | Yes | — | FK to `companies.id` | Owning company |
| `facility_id` | UUID | No | NULL | — | NULL — Recipe can be company-wide or facility-specific |
| `status` | ENUM | Yes | `DRAFT` | 8-stage master lifecycle (DRAFT → SUBMITTED → REVIEWED → APPROVED → PUBLISHED → ACTIVE → INACTIVE → ARCHIVED) | Master data lifecycle |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto-update | Last modification |
| `created_by` | UUID | Yes | — | FK to `user_accounts.id` | Creator |
| `updated_by` | UUID | Yes | — | FK to `user_accounts.id` | Last modifier |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft-delete timestamp |
| `version` | INTEGER | Yes | `1` | Optimistic concurrency (per Ch 4 §4.4) | Increments on each update |

#### 4.2 Recipe Identity Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `recipe_name` | VARCHAR(250) | Yes | — | Min 3, max 250 | Recipe display name (e.g., "Kaju Katli Premium Recipe") | Public | — |
| `recipe_name_short` | VARCHAR(80) | Yes | — | Min 2, max 80 | Short name | Public | — |
| `description` | TEXT | No | NULL | — | Detailed recipe description | Internal | — |
| `recipe_type` | ENUM | Yes | — | FINISHED_PRODUCT, SEMI_FINISHED, INTERMEDIATE, PACKAGING, TRIAL, R_AND_D | Recipe type (per Part 7) | Internal | — |
| `product_id` | UUID | Yes | — | FK to `products.id` (FINISHED_GOODS or SEMI_FINISHED) | Product this recipe produces | Internal | — |
| `product_family_id` | UUID | No | NULL | FK to `product_families.id`; auto-derived from product | Product family | Internal | — |
| `brand_id` | UUID | No | NULL | FK to `brands.id`; auto-derived | Brand | Public | — |

#### 4.3 Version Management Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `active_version_id` | UUID | No | NULL | FK to `recipe_versions.id` | Pointer to active version (per Ch 4 §4.11 versioning pattern) | Internal |
| `default_version_id` | UUID | No | NULL | FK to `recipe_versions.id`; same as active | Default version (alias for active) | Internal |
| `latest_version_number` | INTEGER | Yes | `0` | ≥ 0 | Latest version number (denormalized) | Internal |
| `total_versions` | INTEGER | Yes | `0` | ≥ 0 | Total versions created (denormalized) | Internal |
| `revision_number` | INTEGER | Yes | `0` | ≥ 0 | Current revision count (per Part 7 fields) | Internal |

#### 4.4 Manufacturing Configuration Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `standard_batch_size` | DECIMAL(18,4) | Yes | — | > 0 | Standard batch size (in base UOM) | Internal | — |
| `standard_yield_pct` | DECIMAL(5,2) | Yes | `95.00` | 0–100 | Expected yield % | Internal | Yield AI |
| `standard_wastage_pct` | DECIMAL(5,2) | Yes | `5.00` | 0–100 | Expected wastage % | Internal | Waste AI |
| `standard_production_time_hours` | DECIMAL(8,2) | Yes | — | > 0 | Standard production time per batch | Internal | — |
| `production_line_id` | UUID | No | NULL | FK to `production_lines.id` | Preferred production line | Internal | — |
| `work_center_id` | UUID | No | NULL | FK to `work_centers.id` | Preferred work center | Internal | — |
| `machine_id` | UUID | No | NULL | FK to `machines.id` | Preferred machine | Internal | — |
| `uom_id` | UUID | Yes | — | FK to `uoms.id`; must match product.base_uom_id | Base UOM for recipe | Internal | — |

#### 4.5 Quality & Compliance Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `qc_specification_id` | UUID | No | NULL | FK to `qc_specifications.id` | QC specification for this recipe | Confidential |
| `requires_cold_chain` | BOOLEAN | Yes | `false` | — | Finished product requires cold chain | Internal |
| `shelf_life_days` | INTEGER | No | NULL | > 0 | Expected shelf life (per Ch 8 §8.3) | Internal |
| `is_fssai_compliant` | BOOLEAN | Yes | `true` | — | FSSAI compliance verified | Confidential |
| `is_haccp_certified` | BOOLEAN | Yes | `false` | — | HACCP critical control points defined | Confidential |

#### 4.6 Recipe Simulation Engine Fields (Per Enhancement)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `is_simulation_capable` | BOOLEAN | Yes | `true` | — | Recipe can be simulated (per Recipe Simulation Engine enhancement) | Internal | Simulation AI |
| `last_simulated_at` | TIMESTAMPTZ | No | NULL | — | Last simulation run | Internal | — |
| `last_simulation_id` | UUID | No | NULL | FK to `recipe_simulations.id` (future) | Last simulation reference | Internal | — |
| `simulation_parameters` | JSONB | No | NULL | — | Default simulation parameters (batch size, yield, cost scenarios) | Internal | Simulation AI |

#### 4.7 Status & Approval Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `approved_by` | UUID | No | NULL | FK to `user_accounts.id` | Recipe approver (L2+ Manufacturing Head + QA) | Internal |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `qa_approved_by` | UUID | No | NULL | FK to `user_accounts.id` | QA approval (food safety) | Confidential |
| `qa_approved_at` | TIMESTAMPTZ | No | NULL | — | QA approval timestamp | Confidential |

#### 4.8 Custom Fields & Annotations

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `custom_fields` | JSONB | No | `'{}'::JSONB` | — | Custom fields for recipe-specific attributes | Internal |
| `remarks` | TEXT | No | NULL | — | Free-text annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Filterable annotations | Internal |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| Recipe → Company | N : 1 | `company_id` | RESTRICT |
| Recipe → Product | N : 1 | `product_id` | RESTRICT (cannot delete product with recipes) |
| Recipe → ProductFamily | N : 1 | `product_family_id` | SET NULL |
| Recipe → Brand | N : 1 | `brand_id` | SET NULL |
| Recipe → UOM | N : 1 | `uom_id` | RESTRICT |
| Recipe → ProductionLine | N : 1 | `production_line_id` | SET NULL |
| Recipe → WorkCenter | N : 1 | `work_center_id` | SET NULL |
| Recipe → Machine | N : 1 | `machine_id` | SET NULL |
| Recipe → QCSpecification | N : 1 | `qc_specification_id` | SET NULL |
| Recipe → RecipeVersion (active) | N : 1 | `active_version_id` | SET NULL |
| Recipe → RecipeVersion (all versions) | 1 : N | `recipe_versions.recipe_id` | RESTRICT (cannot delete recipe with versions) |
| Recipe → ProductionOrder | 1 : N | `production_orders.recipe_id` | RESTRICT (cannot delete recipe used in production) |
| Recipe → UserAccount (approver, QA approver) | N : 1 each | various | SET NULL |

### 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_recipes` | PRIMARY KEY | `id` | Default PK |
| `uq_recipes_code_company` | UNIQUE | `company_id, code` | Code uniqueness per company |
| `uq_recipes_product` | UNIQUE PARTIAL | `company_id, product_id WHERE deleted_at IS NULL AND status = 'ACTIVE'` | One active recipe per product |
| `idx_recipes_status` | B-TREE | `status, deleted_at` | Default query filter |
| `idx_recipes_type` | B-TREE | `company_id, recipe_type, status` | Filter by type |
| `idx_recipes_product_family` | B-TREE | `product_family_id` | Family-level recipe lookup |
| `idx_recipes_brand` | B-TREE | `brand_id` | Brand recipe lookup |
| `idx_recipes_active_version` | B-TREE | `active_version_id WHERE active_version_id IS NOT NULL` | Active version lookup |
| `idx_recipes_search` | GIN | `to_tsvector('english', recipe_name \|\| ' ' \|\| code \|\| ' ' \|\| description)` | Full-text search (per Ch 7 §7.15) |
| `idx_recipes_tags` | GIN | `tags` | Tag-based filtering |

### 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `code` unique per company | DB | Unique constraint |
| 2 | `code` **immutable after activation** (per Part 7 §3: "Recipe Code immutable") | App | Service-layer + audit |
| 3 | One active recipe per product (per Part 7) | DB | Unique partial constraint |
| 4 | `product_id` must be FINISHED_GOODS or SEMI_FINISHED | App | Service-layer validation |
| 5 | `uom_id` must equal `product.base_uom_id` | App | Service-layer validation |
| 6 | `standard_batch_size` > 0 | DB | CHECK constraint |
| 7 | `standard_yield_pct` + `standard_wastage_pct` ≤ 100 | DB | CHECK constraint |
| 8 | State transition DRAFT → SUBMITTED requires `recipe_name`, `recipe_type`, `product_id`, `standard_batch_size`, `standard_yield_pct` | App | Master Data Quality Validator |
| 9 | State transition APPROVED → PUBLISHED requires at least one Recipe Version in RELEASED status | App | Cross-entity validation |
| 10 | `active_version_id` must point to a RELEASED version | App | Service-layer validation |
| 11 | Cannot delete recipe with versions (per Part 7: "Historical recipes preserved") | App | Referential integrity check |
| 12 | Cannot delete recipe used in Production Orders | App | Referential integrity check |
| 13 | Recipe approval requires two-person (Manufacturing Head + QA) per Q38 | App | Approval Engine |
| 14 | `qa_approved_by` required for recipes where `is_fssai_compliant = true` | App | Service-layer validation |

### 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/recipes` | GET | List recipes | `MANUFACTURING:VIEW` |
| `/api/v1/recipes/:id` | GET | Get recipe details | `MANUFACTURING:VIEW` |
| `/api/v1/recipes` | POST | Create recipe (DRAFT) | `MANUFACTURING:CREATE` |
| `/api/v1/recipes/:id` | PATCH | Update recipe | `MANUFACTURING:EDIT` |
| `/api/v1/recipes/:id/submit` | POST | Submit for approval | `MANUFACTURING:EDIT` |
| `/api/v1/recipes/:id/approve` | POST | Approve recipe (two-person) | `MANUFACTURING:APPROVE` + `QUALITY:APPROVE` |
| `/api/v1/recipes/:id/activate` | POST | Activate recipe | `MANUFACTURING:APPROVE` |
| `/api/v1/recipes/:id/deactivate` | POST | Deactivate recipe | `MANUFACTURING:APPROVE` |
| `/api/v1/recipes/:id/versions` | GET | List all versions | `MANUFACTURING:VIEW` |
| `/api/v1/recipes/:id/active-version` | GET | Get active version | `MANUFACTURING:VIEW` |
| `/api/v1/recipes/:id/create-version` | POST | Create new version | `MANUFACTURING:CREATE` + `QUALITY:APPROVE` |
| `/api/v1/recipes/:id/activate-version/:versionId` | POST | Activate specific version | `MANUFACTURING:APPROVE` + Sensitive Operation (per Ch 6 §6.13) |
| `/api/v1/recipes/by-product/:productId` | GET | Get recipe for a product | `MANUFACTURING:VIEW` |
| `/api/v1/recipes/:id/simulate` | POST | Run recipe simulation | `MANUFACTURING:VIEW` |
| `/api/v1/recipes/:id/genealogy` | GET | Get recipe genealogy | `MANUFACTURING:VIEW` |

### 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Recipe List | AG Grid with multi-filter (type, product, brand, status) | `/manufacturing/recipes` |
| Recipe Detail | Tabbed: Overview, Versions, Formula, BOM, Process, Costs, Nutrition, Allergens, Genealogy | `/manufacturing/recipes/:id` |
| Recipe Create Form | Multi-section: Identity, Product, Manufacturing Config, Quality | `/manufacturing/recipes/new` |
| Recipe Version Manager | Version list with status, effective dates, activate/deactivate | `/manufacturing/recipes/:id/versions` |
| Recipe Comparison | Side-by-side comparison of two versions | `/manufacturing/recipes/:id/compare` |
| Recipe Simulation Console | What-if analysis (per Enhancement) | `/manufacturing/recipes/:id/simulate` |

### 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| Recipe lookup | View recipe on mobile during production |
| Version verification | Verify correct recipe version at production start |
| BOM verification | Scan ingredients to verify against BOM |
| Operator guidance | View process steps on mobile |
| Recipe approval | L2+ approve recipe on mobile |

### 11. Reports

| Report | Use of Recipe |
|---|---|
| Recipe Master Report | Complete recipe list with versions |
| Recipe Revision History | All versions with change reasons |
| BOM Explosion | Full BOM expansion per recipe |
| Ingredient Usage Report | Which recipes use which ingredients |
| Recipe Costing Report | Standard vs actual cost per recipe |
| Nutrition Report | Nutritional info per recipe |
| Allergen Report | Allergens per recipe (FSSAI compliance) |
| Formula Comparison | Compare formulas across versions |
| Yield Analysis | Planned vs actual yield per recipe |
| Recipe Genealogy | Recipe → Version → Formula → BOM → Ingredients chain |

### 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE | Yes | Optional | Permanent |
| UPDATE (non-critical) | Yes | Optional | Permanent |
| UPDATE (critical: code, recipe_type, product_id, standard_yield_pct) | Yes | **Mandatory** | Permanent |
| VERSION CHANGE (activate new version) | Yes | **Mandatory** (per Ch 6 §6.13 Sensitive Operation) | Permanent |
| STATUS CHANGE | Yes | **Mandatory** | Permanent |
| DELETE (soft — rare, only if no versions and no production) | Yes | **Mandatory** | Permanent |

**Audit Level**: Full

### 13. Security Classification

| Field Category | Classification | Access |
|---|---|---|
| `recipe_name`, `recipe_name_short`, `recipe_type`, `product_id`, `brand_id` | Public | All manufacturing-scoped users |
| `code`, `description`, `standard_*`, `production_line_id`, `work_center_id`, `machine_id` | Internal | L2+ Manufacturing |
| `qc_specification_id`, `is_fssai_compliant`, `is_haccp_certified`, `qa_approved_*` | Confidential | L2+ Quality, Compliance |
| `standard_yield_pct`, `standard_wastage_pct`, `standard_production_time_hours` | Internal | L2+ Manufacturing |
| `is_simulation_capable`, `simulation_parameters` | Internal | L2+ Manufacturing, R&D |

### 14. AI Relevance

| AI Capability | Usage |
|---|---|
| **Recipe Optimization AI** | Recommends recipe improvements based on yield/wastage data |
| **Yield Prediction AI** | Uses `standard_yield_pct` + historical batch data |
| **Cost Optimization AI** | Analyzes recipe costs for optimization |
| **Ingredient Recommendation AI** | Recommends alternative ingredients |
| **Substitution Recommendation AI** | Suggests substitutions based on availability + cost |
| **Nutrition Optimization AI** | Optimizes nutritional profile |
| **Waste Reduction AI** | Identifies high-waste recipe stages |
| **Manufacturing Simulation AI** | Simulates production scenarios (per Enhancement) |
| **Recipe Genealogy AI** | Traces recipe evolution over time |

### 15. Performance Notes

| Consideration | Guidance |
|---|---|
| Row count | < 2,000 per company |
| Cache strategy | Redis cache, TTL 1 hour; active version cached separately with 4-hour TTL |
| Query patterns | By `company_id + code`, `product_id` (one active recipe per product), `product_family_id`, `brand_id` |
| Hot path: production order create | Recipe lookup by `product_id` — cached |
| N+1 prevention | Eager-load `active_version`, `product`, `brand` when listing |

### 16. Example Records

```json
{
  "id": "01928f7a-...-recipe-001",
  "code": "REC-000001",
  "company_id": "01928f7a-...-company",
  "facility_id": null,
  "recipe_name": "Kaju Katli Premium Recipe",
  "recipe_name_short": "Kaju Katli",
  "description": "Premium Kaju Katli recipe using finest cashew nuts, pure ghee, and silver foil. Standard batch size 50kg.",
  "recipe_type": "FINISHED_PRODUCT",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "product_family_id": "01928f7a-...-fam-kaju-katli",
  "brand_id": "01928f7a-...-brand-sds",
  "active_version_id": "01928f7a-...-recipe-kaju-katli-v3",
  "default_version_id": "01928f7a-...-recipe-kaju-katli-v3",
  "latest_version_number": 3,
  "total_versions": 3,
  "revision_number": 2,
  "standard_batch_size": 50.0000,
  "standard_yield_pct": 96.50,
  "standard_wastage_pct": 3.50,
  "standard_production_time_hours": 8.00,
  "production_line_id": "01928f7a-...-pl-01",
  "work_center_id": "01928f7a-...-wc-sweets-01",
  "machine_id": "01928f7a-...-mac-01",
  "uom_id": "01928f7a-...-uom-kg",
  "qc_specification_id": "01928f7a-...-qcspec-kaju-katli",
  "requires_cold_chain": false,
  "shelf_life_days": 21,
  "is_fssai_compliant": true,
  "is_haccp_certified": true,
  "is_simulation_capable": true,
  "last_simulated_at": "2026-06-15T10:00:00Z",
  "simulation_parameters": {
    "default_batch_size": 50.0,
    "scenarios": ["price_increase_10pct", "yield_drop_3pct", "batch_double"]
  },
  "approved_by": "01928f7a-...-user-mfg-head",
  "approved_at": "2026-03-15T10:00:00Z",
  "qa_approved_by": "01928f7a-...-user-qa-head",
  "qa_approved_at": "2026-03-15T12:00:00Z",
  "status": "ACTIVE",
  "version": 5,
  "tags": ["premium", "festive", "fssai-compliant", "haccp"]
}
```

---

## Entity 062 — Recipe Version

### 1. Business Purpose

The `RecipeVersion` entity stores **every approved revision of a recipe** as an **immutable record**. Per Volume 0 Chapter 4 §4.11 (versioning pattern) and Part 7 §3 ("Immutable approved versions"):

- Each recipe edit creates a NEW version (never edits the old one)
- RELEASED versions are **immutable** — cannot be modified (per Part 7 §3: "Released versions cannot be modified")
- Production Orders reference a **specific version** (not the active pointer) — ensuring historical traceability
- Version genealogy preserved permanently (per Part 7 §3: "Historical recipes preserved")

### Recipe Version Lifecycle (per Part 7 §2)

```
DRAFT → REVIEW → LAB_VALIDATION → PRODUCTION_TRIAL → QA_APPROVAL → RELEASED → RETIRED
```

Each stage gates the next:
- **DRAFT** — Being created
- **REVIEW** — Under peer review
- **LAB_VALIDATION** — Lab testing (small batch)
- **PRODUCTION_TRIAL** — Production floor trial (full batch)
- **QA_APPROVAL** — Quality Assurance sign-off
- **RELEASED** — Approved for production (IMMUTABLE)
- **RETIRED** — No longer used for new production (historical preserved)

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Manufacturing Head + Quality Head |
| Data Owner | Quality Head (recipe version = food safety document) |
| Technical Owner | Backend Lead — Manufacturing Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `recipe_versions` |
| Prisma Model | `RecipeVersion` |
| File Location | `prisma/schema/master/manufacturing/recipe_version.prisma` |
| Immutability | **Immutable after RELEASED status** (per Part 7 §3) — enforced by DB trigger + service-layer |

### 4. Field Dictionary

#### 4.1 Universal Base + Version Identity Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Auto-generated: `{recipe_code}-V{version_number}` | Version code (e.g., `REC-000001-V3`) | Public | — |
| `company_id` | UUID | Yes | — | FK to companies | Owning company | Internal | — |
| `recipe_id` | UUID | Yes | — | FK to `recipes.id` | Parent recipe | Internal | — |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, REVIEW, LAB_VALIDATION, PRODUCTION_TRIAL, QA_APPROVAL, RELEASED, RETIRED | Version lifecycle (per Part 7 §2) | Internal | — |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `version_number` | INTEGER | Yes | — | > 0, unique per recipe | Version sequence (1, 2, 3...) | Public | — |
| `version_label` | VARCHAR(50) | No | NULL | — | Display label (e.g., "v3 - Festive Recipe", "v2.1 - Sugar Reduction") | Public | — |
| `change_summary` | TEXT | Yes | — | Min 10 chars | Summary of changes from previous version | Internal | — |
| `change_reason` | TEXT | Yes | — | Min 10 chars (per Part 7 fields: "Reason for Revision") | Detailed reason for revision | Internal | — |
| `parent_version_id` | UUID | No | NULL | FK self-ref | Previous version (for diff) | Internal | — |
| `revision_type` | ENUM | Yes | `MINOR` | MAJOR, MINOR, PATCH | Revision type (per Ch 4 §4.11) | Internal | — |

#### 4.2 Effective Dating (per Ch 7 §7.11)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `effective_from` | DATE | Yes | — | — | Effective date (when version becomes active) | Internal |
| `effective_to` | DATE | No | NULL | Must be > effective_from if set | Effective end (auto-set when superseded, per Q39) | Internal |
| `approval_date` | DATE | No | NULL | — | Approval date (per Part 7 fields) | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts.id` | Who approved | Internal |
| `qa_approval_date` | DATE | No | NULL | — | QA approval date | Confidential |
| `qa_approved_by` | UUID | No | NULL | FK to `user_accounts.id` | QA approver | Confidential |

#### 4.3 Manufacturing Configuration (Snapshot of Recipe at This Version)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `standard_batch_size` | DECIMAL(18,4) | Yes | — | > 0 | Batch size for this version | Internal |
| `standard_yield_pct` | DECIMAL(5,2) | Yes | — | 0–100 | Expected yield | Internal |
| `standard_wastage_pct` | DECIMAL(5,2) | Yes | — | 0–100 | Expected wastage | Internal |
| `standard_production_time_hours` | DECIMAL(8,2) | Yes | — | > 0 | Production time | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | Base UOM | Internal |

#### 4.4 Validation & Trial Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `lab_validation_status` | ENUM | No | NULL | PENDING, IN_PROGRESS, PASSED, FAILED | Lab validation result | Confidential |
| `lab_validation_date` | DATE | No | NULL | — | Lab validation date | Internal |
| `lab_validation_report_id` | UUID | No | NULL | FK to `file_attachments.id` | Lab validation report | Confidential |
| `production_trial_status` | ENUM | No | NULL | PENDING, IN_PROGRESS, PASSED, FAILED | Production trial result | Confidential |
| `production_trial_date` | DATE | No | NULL | — | Production trial date | Internal |
| `production_trial_batch_id` | UUID | No | NULL | FK to `manufacturing_batches.id` | Trial batch reference | Internal |
| `production_trial_report_id` | UUID | No | NULL | FK to `file_attachments.id` | Trial report | Confidential |
| `trial_yield_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Actual yield during trial | Internal |
| `trial_wastage_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Actual wastage during trial | Internal |

#### 4.5 Formula & BOM References

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `formula_id` | UUID | No | NULL | FK to `formulas.id` (Entity 063) | Formula for this version | Internal |
| `bom_id` | UUID | No | NULL | FK to `boms.id` (Entity 064) | BOM for this version | Internal |
| `bom_version_id` | UUID | No | NULL | FK to `bom_versions.id` | BOM version | Internal |
| `nutrition_profile_id` | UUID | No | NULL | FK to `nutrition_profiles.id` (Entity 070) | Nutrition & allergen profile | Confidential |

#### 4.6 Process References

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `has_process_steps` | BOOLEAN | Yes | `true` | — | Whether process steps defined | Internal |
| `process_step_count` | INTEGER | Yes | `0` | ≥ 0 | Number of process steps | Internal |
| `is_haccp_compliant` | BOOLEAN | Yes | `false` | — | HACCP CCPs defined | Confidential |

#### 4.7 Cost Reference

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `recipe_costing_id` | UUID | No | NULL | FK to `recipe_costings.id` (Entity 069) | Cost calculation | Confidential |
| `standard_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Standard cost per unit | Confidential |

#### 4.8 Retirement

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `retired_at` | TIMESTAMPTZ | No | NULL | — | Retirement timestamp | Internal |
| `retired_by` | UUID | No | NULL | FK to `user_accounts.id` | Who retired | Internal |
| `retirement_reason` | TEXT | No | NULL | Required if status = RETIRED | Retirement reason | Internal |
| `superseded_by_version_id` | UUID | No | NULL | FK self-ref | New version that superseded this | Internal |

#### 4.9 Custom Fields & Annotations

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `custom_fields` | JSONB | No | `'{}'::JSONB` | — | Custom fields | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| RecipeVersion → Company, Recipe, UOM | N : 1 each | various | RESTRICT |
| RecipeVersion → Formula, BOM, BomVersion, NutritionProfile, RecipeCosting | N : 1 each | various | SET NULL |
| RecipeVersion → RecipeVersion (parent, superseded_by) | N : 1 each | self-ref | SET NULL |
| RecipeVersion → UserAccount (approved_by, qa_approved_by, retired_by) | N : 1 each | various | SET NULL |
| RecipeVersion → FileAttachment (lab report, trial report) | N : 1 each | various | SET NULL |
| RecipeVersion → ManufacturingBatch (trial batch) | N : 1 | `production_trial_batch_id` | SET NULL |
| RecipeVersion → ProductionOrder | 1 : N | `production_orders.recipe_version_id` | RESTRICT (cannot delete version used in production — per Part 7: "Production Orders always reference a specific version") |
| RecipeVersion → ProductionStage | 1 : N | `production_stages.recipe_version_id` | CASCADE |
| RecipeVersion → ProcessParameter | 1 : N | `process_parameters.recipe_version_id` | CASCADE |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_recipe_versions` | PK | `id` |
| `uq_rv_code_company` | UNIQUE | `company_id, code` |
| `uq_rv_recipe_version` | UNIQUE | `recipe_id, version_number` |
| `idx_rv_status` | B-TREE | `status, effective_from` |
| `idx_rv_recipe` | B-TREE | `recipe_id, version_number DESC` |
| `idx_rv_effective` | B-TREE | `effective_from, effective_to` |
| `idx_rv_released` | PARTIAL | `recipe_id WHERE status = 'RELEASED'` |
| `idx_rv_parent` | B-TREE | `parent_version_id WHERE parent_version_id IS NOT NULL` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `version_number` unique per recipe | DB |
| 2 | `change_reason` min 10 chars | App |
| 3 | `effective_to` > `effective_from` if set | DB CHECK |
| 4 | **Immutable after RELEASED** (per Part 7 §3) — enforced by DB trigger | DB + App |
| 5 | State transitions: DRAFT → REVIEW → LAB_VALIDATION → PRODUCTION_TRIAL → QA_APPROVAL → RELEASED → RETIRED | App |
| 6 | Cannot skip stages (per Part 7 lifecycle) | App |
| 7 | QA_APPROVAL requires `qa_approved_by` + `qa_approval_date` | DB CHECK |
| 8 | RELEASED requires `formula_id` + `bom_id` + QA approval | App |
| 9 | Cannot delete version used in Production Orders | App |
| 10 | `superseded_by_version_id` auto-set when new version activated | App |
| 11 | `effective_to` auto-set when superseded (per Q39 — auto-close previous version's effective_to to one day before new version's effective_from) | App |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/recipe-versions` (GET, POST), `/api/v1/recipe-versions/:id` (GET), `/api/v1/recipes/:recipeId/versions` (GET), `/api/v1/recipe-versions/:id/review` (POST), `/api/v1/recipe-versions/:id/lab-validation` (POST), `/api/v1/recipe-versions/:id/production-trial` (POST), `/api/v1/recipe-versions/:id/qa-approval` (POST), `/api/v1/recipe-versions/:id/release` (POST), `/api/v1/recipe-versions/:id/retire` (POST), `/api/v1/recipe-versions/:id/diff/:otherVersionId` (GET — version comparison) |
| **UI** | Version List per recipe, Version Detail (tabbed: Overview, Formula, BOM, Process, Costs, Nutrition, Trial Reports), Version Comparison (diff view), Lifecycle Timeline, Lab Validation Report Viewer |
| **Mobile** | Version verification (scan to verify correct version at production start), version status check |
| **Reports** | Recipe Revision History (per Part 7 Reports), Version Comparison Report, Trial Performance Report, Version Lifecycle Report |
| **Audit** | Full; **RELEASED versions immutable** (per Part 7); mandatory reason for retirement, version change; all version transitions audited |

### 13-16. Security / AI / Performance / Example

**Security**: `version_number`, `version_label`, `change_summary` = Public; `change_reason`, manufacturing config = Internal; `qa_*`, `lab_*`, `production_trial_*` = Confidential; `standard_cost` = Confidential.

**AI**: Recipe Optimization AI (analyzes version improvements), Yield Prediction AI (per version), Cost Optimization AI (per version), Manufacturing Simulation AI (per version).

**Performance**: < 10 versions per recipe; Redis cache TTL 1 hour.

```json
{
  "id": "01928f7a-...-recipe-kaju-katli-v3",
  "code": "REC-000001-V3",
  "company_id": "01928f7a-...-company",
  "recipe_id": "01928f7a-...-recipe-001",
  "version_number": 3,
  "version_label": "v3 - Optimized Yield + Festive Recipe",
  "change_summary": "Increased cashew ratio by 5%, reduced sugar by 3%, optimized mixing temperature to 85°C. Yield improved from 94% to 96.5%.",
  "change_reason": "Customer feedback indicated premium texture desired. Lab tests confirmed higher cashew ratio improves texture while maintaining shelf life. Trial batch achieved 96.5% yield vs 94% in v2.",
  "parent_version_id": "01928f7a-...-recipe-kaju-katli-v2",
  "revision_type": "MAJOR",
  "effective_from": "2026-03-15",
  "effective_to": null,
  "approval_date": "2026-03-15",
  "approved_by": "01928f7a-...-user-mfg-head",
  "qa_approval_date": "2026-03-15",
  "qa_approved_by": "01928f7a-...-user-qa-head",
  "standard_batch_size": 50.0000,
  "standard_yield_pct": 96.50,
  "standard_wastage_pct": 3.50,
  "standard_production_time_hours": 8.00,
  "uom_id": "01928f7a-...-uom-kg",
  "lab_validation_status": "PASSED",
  "lab_validation_date": "2026-03-01",
  "lab_validation_report_id": "01928f7a-...-file-lab-001",
  "production_trial_status": "PASSED",
  "production_trial_date": "2026-03-10",
  "production_trial_batch_id": "01928f7a-...-mb-trial-001",
  "production_trial_report_id": "01928f7a-...-file-trial-001",
  "trial_yield_pct": 96.50,
  "trial_wastage_pct": 3.50,
  "formula_id": "01928f7a-...-formula-001",
  "bom_id": "01928f7a-...-bom-001",
  "bom_version_id": "01928f7a-...-bom-kaju-katli-v2",
  "nutrition_profile_id": "01928f7a-...-nutrition-001",
  "has_process_steps": true,
  "process_step_count": 10,
  "is_haccp_compliant": true,
  "recipe_costing_id": "01928f7a-...-costing-001",
  "standard_cost": 644.0000,
  "status": "RELEASED",
  "version": 1,
  "tags": ["major-revision", "yield-improved", "festive"]
}
```

---

## Entity 063 — Formula Master

### 1. Business Purpose

The `Formula` entity defines the **ingredient composition** for a specific Recipe Version — what ingredients go in, in what quantities, in what UOM, with what tolerances, and in what sequence. Per Part 7 §1:

> *"A Recipe defines: Ingredients, Quantities, UOM..."*

Per Part 7, formulas support:
- **Percentage-based formulas** — each ingredient is a % of total
- **Weight-based formulas** — each ingredient is a specific weight
- **Volume-based formulas** — each ingredient is a specific volume

**Formula vs. BOM distinction** (per Part 7 §2):
- **Formula** = "what food ingredients go in" (raw materials only)
- **BOM (064)** = "all materials needed" (raw materials + packaging + labels + consumables)

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Manufacturing Head + Quality Head |
| Data Owner | Quality Head (formula = food safety document) |
| Technical Owner | Backend Lead — Manufacturing Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `formulas` (header) + `formula_lines` (ingredients) |
| Prisma Models | `Formula`, `FormulaLine` |
| Pattern | Header-line |
| Immutability | Immutable after Recipe Version is RELEASED |

### 4. Field Dictionary

#### 4.1 Formula Header

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `FMA-` | Formula code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `recipe_version_id` | UUID | Yes | — | FK to `recipe_versions.id` | Parent recipe version |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, ACTIVE, INACTIVE | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `formula_name` | VARCHAR(200) | Yes | — | Min 3 | Formula display name | Public |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `formula_type` | ENUM | Yes | `WEIGHT_BASED` | PERCENTAGE_BASED, WEIGHT_BASED, VOLUME_BASED | Formula type (per Part 7) | Internal |
| `total_lines` | INTEGER | Yes | `0` | ≥ 0 | Number of ingredients | Internal |
| `total_quantity` | DECIMAL(18,4) | Yes | `0` | > 0 | Total formula quantity | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | Base UOM | Internal |
| `batch_size` | DECIMAL(18,4) | Yes | — | > 0 | Batch size (matches recipe version) | Internal |
| `total_percentage` | DECIMAL(5,2) | No | — | Generated: SUM of line percentages; must = 100.00 for percentage-based | Total % (validation) | Internal | — |
| `is_balanced` | BOOLEAN | Yes | `false` | Generated: `total_percentage = 100.00` | Whether formula balances | Internal | — |
| `approved_by` | UUID | No | NULL | FK to `user_accounts.id` | Approver | Internal |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

#### 4.2 Formula Lines (Ingredients)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `formula_id` | UUID | Yes | — | FK to `formulas.id` | Parent formula |
| `line_number` | INTEGER | Yes | — | > 0, unique per formula | Sequence number (per Part 7: "Sequence") | Internal |
| `ingredient_product_id` | UUID | Yes | — | FK to `products.id` (RAW_MATERIAL) | Ingredient (references Product Master) | Internal | — |
| `ingredient_name` | VARCHAR(250) | No | NULL | Denormalized | Ingredient name | Public | — |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM for this ingredient | Internal | — |
| `quantity` | DECIMAL(18,4) | Yes | — | > 0 | Quantity (weight/volume/count) | Internal | — |
| `percentage` | DECIMAL(8,4) | No | NULL | 0–100; required if formula_type = PERCENTAGE_BASED | Percentage of total (per Part 7) | Internal | — |
| `tolerance_pct` | DECIMAL(5,2) | Yes | `0.00` | 0–100 | Tolerance % (per Part 7: "Tolerance") — allowed variance | Internal | — |
| `min_quantity` | DECIMAL(18,4) | No | NULL | ≥ 0; Generated: `quantity * (1 - tolerance_pct/100)` | Minimum allowed quantity | Internal | — |
| `max_quantity` | DECIMAL(18,4) | No | NULL | Generated: `quantity * (1 + tolerance_pct/100)` | Maximum allowed quantity | Internal | — |
| `is_critical_ingredient` | BOOLEAN | Yes | `false` | — | Critical ingredient (per Part 7: "Critical Ingredient") — affects taste/quality/safety | Confidential | — |
| `is_optional` | BOOLEAN | Yes | `false` | — | Optional ingredient (per Part 7: "Optional Ingredient") | Internal | — |
| `substitution_allowed` | BOOLEAN | Yes | `false` | — | Whether substitution allowed | Internal | Substitution AI |
| `substitution_group_id` | UUID | No | NULL | FK to `ingredient_substitutions.id` (Entity 066) | Substitution group | Internal | — |
| `addition_sequence` | ENUM | Yes | `MIXING` | PRE_MIX, MIXING, COOKING, POST_COOK, COOLING, PACKAGING | When to add this ingredient | Internal | — |
| `addition_stage_id` | UUID | No | NULL | FK to `production_stages.id` | Specific production stage | Internal | — |
| `allergen_flag` | BOOLEAN | Yes | `false` | — | Contains allergen | Confidential | — |
| `allergen_types` | TEXT[] | No | `ARRAY[]::TEXT[]` | Subset: MILK, NUTS, SOY, GLUTEN, SESAME, MUSTARD, PEANUT, EGG, FISH, SHELLFISH | Allergen types (per Part 7 §70) | Confidential | — |
| `handling_instructions` | TEXT | No | NULL | — | Special handling (e.g., "Refrigerate before use") | Internal | — |
| `cost_per_unit` | DECIMAL(18,4) | No | NULL | ≥ 0 | Cost per unit | Confidential | Cost AI |
| `total_cost` | DECIMAL(18,4) | No | NULL | Generated: `quantity * cost_per_unit` | Total ingredient cost | Confidential | — |
| `line_remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| Formula → Company, RecipeVersion, UOM | N : 1 each | various | RESTRICT |
| Formula → FormulaLine | 1 : N | `formula_lines.formula_id` | CASCADE |
| Formula → UserAccount (approver) | N : 1 | `approved_by` | SET NULL |
| FormulaLine → Product (ingredient), UOM, IngredientSubstitution, ProductionStage | N : 1 each | various | SET NULL |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_formulas` | PK | `id` |
| `uq_formulas_code_company` | UNIQUE | `company_id, code` |
| `idx_formulas_recipe_version` | B-TREE | `recipe_version_id` |
| `idx_formulas_status` | B-TREE | `status` |
| `pk_formula_lines` | PK | `id` |
| `idx_fl_formula` | B-TREE | `formula_id, line_number` |
| `idx_fl_ingredient` | B-TREE | `ingredient_product_id` |
| `idx_fl_critical` | PARTIAL | `formula_id WHERE is_critical_ingredient = true` |
| `idx_fl_allergen` | PARTIAL | `formula_id WHERE allergen_flag = true` |
| `idx_fl_substitution` | PARTIAL | `formula_id WHERE substitution_allowed = true` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `code` unique per company | DB |
| 2 | One formula per recipe version | App |
| 3 | `quantity` > 0 on each line | DB CHECK |
| 4 | For PERCENTAGE_BASED: SUM(percentage) = 100.00 | App |
| 5 | `tolerance_pct` 0–100 | DB CHECK |
| 6 | `min_quantity` ≤ `quantity` ≤ `max_quantity` | DB CHECK |
| 7 | `line_number` unique per formula | DB |
| 8 | Immutable after Recipe Version is RELEASED | DB trigger + App |
| 9 | `allergen_flag` must be true if `allergen_types` is non-empty | DB CHECK |
| 10 | At least 1 line before ACTIVE | App |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/formulas` (GET, POST), `/api/v1/formulas/:id` (GET, PATCH), `/api/v1/formulas/:id/lines` (GET, POST), `/api/v1/recipe-versions/:versionId/formula` (GET), `/api/v1/formulas/:id/validate` (POST — validate totals/tolerances), `/api/v1/formulas/:id/calculate-cost` (POST) |
| **UI** | Formula Editor (line-by-line with tolerance visualization), Formula Comparison (across versions), Allergen Matrix, Critical Ingredient Highlight, Formula Balance Checker |
| **Mobile** | Formula lookup, ingredient verification (scan to verify against formula line) |
| **Reports** | Formula Report (per Part 7 Reports), Formula Comparison, Ingredient Usage, Allergen Report, Tolerance Report, Critical Ingredient Report |
| **Audit** | Full; **immutable after RELEASED**; mandatory reason for formula change; all allergen changes audited |

### 13-16. Security / AI / Performance / Example

**Security**: `formula_name`, `ingredient_name` = Public; quantities, tolerances = Internal; `is_critical_ingredient`, `allergen_*` = Confidential; `cost_per_unit`, `total_cost` = Confidential.

**AI**: Recipe Optimization AI, Ingredient Recommendation AI, Substitution AI, Nutrition Optimization AI, Cost Optimization AI, Allergen Management AI.

**Performance**: < 5,000 formulas; < 20 lines per formula; Redis cache TTL 1 hour.

```json
{
  "header": {
    "id": "01928f7a-...-formula-001",
    "code": "FMA-000001",
    "company_id": "01928f7a-...-company",
    "recipe_version_id": "01928f7a-...-recipe-kaju-katli-v3",
    "formula_name": "Kaju Katli Premium Formula v3",
    "description": "Premium Kaju Katli formula with optimized cashew ratio",
    "formula_type": "WEIGHT_BASED",
    "total_lines": 6,
    "total_quantity": 51.8135,
    "uom_id": "01928f7a-...-uom-kg",
    "batch_size": 50.0000,
    "is_balanced": true,
    "approved_by": "01928f7a-...-user-mfg-head",
    "approved_at": "2026-03-15T10:00:00Z",
    "status": "ACTIVE",
    "version": 1
  },
  "lines": [
    {
      "id": "01928f7a-...-fl-001",
      "formula_id": "01928f7a-...-formula-001",
      "line_number": 1,
      "ingredient_product_id": "01928f7a-...-prod-cashew",
      "ingredient_name": "Premium Cashew Nuts",
      "uom_id": "01928f7a-...-uom-kg",
      "quantity": 28.0000,
      "tolerance_pct": 2.00,
      "min_quantity": 27.4400,
      "max_quantity": 28.5600,
      "is_critical_ingredient": true,
      "is_optional": false,
      "substitution_allowed": false,
      "addition_sequence": "MIXING",
      "allergen_flag": true,
      "allergen_types": ["NUTS"],
      "handling_instructions": "Store in cool, dry place. Grind fresh before use.",
      "cost_per_unit": 950.0000,
      "total_cost": 26600.0000
    },
    {
      "id": "01928f7a-...-fl-002",
      "formula_id": "01928f7a-...-formula-001",
      "line_number": 2,
      "ingredient_product_id": "01928f7a-...-prod-sugar",
      "ingredient_name": "Refined Sugar",
      "uom_id": "01928f7a-...-uom-kg",
      "quantity": 18.0000,
      "tolerance_pct": 1.00,
      "min_quantity": 17.8200,
      "max_quantity": 18.1800,
      "is_critical_ingredient": true,
      "is_optional": false,
      "substitution_allowed": true,
      "substitution_group_id": "01928f7a-...-subgrp-sugar",
      "addition_sequence": "PRE_MIX",
      "allergen_flag": false,
      "cost_per_unit": 45.0000,
      "total_cost": 810.0000
    },
    {
      "id": "01928f7a-...-fl-003",
      "formula_id": "01928f7a-...-formula-001",
      "line_number": 3,
      "ingredient_product_id": "01928f7a-...-prod-ghee",
      "ingredient_name": "Pure Cow Ghee",
      "uom_id": "01928f7a-...-uom-kg",
      "quantity": 4.5000,
      "tolerance_pct": 3.00,
      "is_critical_ingredient": true,
      "addition_sequence": "COOKING",
      "allergen_flag": true,
      "allergen_types": ["MILK"],
      "cost_per_unit": 520.0000,
      "total_cost": 2340.0000
    },
    {
      "id": "01928f7a-...-fl-004",
      "formula_id": "01928f7a-...-formula-001",
      "line_number": 4,
      "ingredient_product_id": "01928f7a-...-prod-cardamom",
      "ingredient_name": "Cardamom Powder",
      "uom_id": "01928f7a-...-uom-g",
      "quantity": 0.0500,
      "tolerance_pct": 5.00,
      "is_critical_ingredient": false,
      "is_optional": false,
      "addition_sequence": "POST_COOK",
      "allergen_flag": false,
      "cost_per_unit": 2000.0000,
      "total_cost": 100.0000
    },
    {
      "id": "01928f7a-...-fl-005",
      "formula_id": "01928f7a-...-formula-001",
      "line_number": 5,
      "ingredient_product_id": "01928f7a-...-prod-silver-foil",
      "ingredient_name": "Silver Foil (Vark)",
      "uom_id": "01928f7a-...-uom-ea",
      "quantity": 1.0000,
      "tolerance_pct": 0.00,
      "is_critical_ingredient": false,
      "is_optional": true,
      "addition_sequence": "PACKAGING",
      "allergen_flag": false,
      "cost_per_unit": 250.0000,
      "total_cost": 250.0000
    },
    {
      "id": "01928f7a-...-fl-006",
      "formula_id": "01928f7a-...-formula-001",
      "line_number": 6,
      "ingredient_product_id": "01928f7a-...-prod-water",
      "ingredient_name": "Filtered Water",
      "uom_id": "01928f7a-...-uom-l",
      "quantity": 1.2635,
      "tolerance_pct": 5.00,
      "is_critical_ingredient": false,
      "addition_sequence": "PRE_MIX",
      "allergen_flag": false,
      "cost_per_unit": 0.5000,
      "total_cost": 0.6318
    }
  ]
}
```

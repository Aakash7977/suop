# Manual 1 · Part 7 · Section 2 · Entities 64-70 — Materials, Process, Costing, Nutrition + Recipe Simulation Engine

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 7 — Manufacturing Domain |
| Section | 2 — Recipe, Formula & BOM Management |
| Entities | BOM (064), Ingredient Master (065), Ingredient Substitution (066), Process Step (067), Process Parameter (068), Recipe Costing (069), Nutrition & Allergen Profile (070) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## Entity 064 — Bill of Materials (BOM)

### 1. Business Purpose

The `BOM` entity defines **complete material requirements** for a recipe version — all materials needed beyond just food ingredients (which are in Formula, Entity 063). Per Part 7 §2:

> *"Recipe Version → Formula → BOM → Ingredients + Packaging + Labels + Finished Goods"*

BOM includes:
- **Raw Materials** (also in Formula, but BOM has the full view)
- **Packaging** — boxes, wrappers, films
- **Labels** — product labels, batch labels
- **Cartons** — outer cartons for shipping
- **Consumables** — gloves, cleaning supplies used during production
- **Chemicals** — production chemicals
- **Semi-Finished** — intermediate products from other production lines

BOM is **versioned** (per Ch 7 §7.6 — BOM is one of the 6 versioned master types).

### 2-4. Owner / Schema / Fields

| Owner | L2 — Manufacturing Head |
|---|---|
| Schema | `master` |
| Tables | `boms` (header) + `bom_versions` (versioned) + `bom_lines` (components) |
| Pattern | Parent → Version → Lines (per Ch 4 §4.11 versioning pattern) |

#### BOM Header Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `BOM-` | BOM code (e.g., `BOM-000001`) — immutable after activation |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `recipe_version_id` | UUID | Yes | — | FK to `recipe_versions.id` | Parent recipe version |
| `status` | ENUM | Yes | `DRAFT` | 8-stage master lifecycle | Lifecycle |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `bom_name` | VARCHAR(200) | Yes | — | Min 3 | BOM display name | Public |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `active_version_id` | UUID | No | NULL | FK to `bom_versions.id` | Active version pointer | Internal |
| `latest_version_number` | INTEGER | Yes | `0` | ≥ 0 | Latest version | Internal |
| `total_versions` | INTEGER | Yes | `0` | ≥ 0 | Total versions | Internal |
| `batch_size` | DECIMAL(18,4) | Yes | — | > 0 | Batch size (matches recipe) | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | Base UOM | Internal |
| `total_lines` | INTEGER | Yes | `0` | ≥ 0 | Total components | Internal |
| `total_material_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total material cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

#### BOM Version Fields

| Field | Type | Required | Description | Security Class |
|---|---|---|---|---|
| `id` | UUID v7 | Yes | PK | — |
| `bom_id` | UUID | Yes | FK to boms | Internal |
| `version_number` | INTEGER | Yes | Version sequence (unique per BOM) | Public |
| `version_label` | VARCHAR(50) | No | Display label | Public |
| `change_reason` | TEXT | Yes | Reason for revision | Internal |
| `effective_from` | DATE | Yes | Effective date | Internal |
| `effective_to` | DATE | No | Effective end (auto-set when superseded) | Internal |
| `status` | ENUM | Yes | DRAFT, REVIEW, APPROVED, RELEASED, RETIRED | Internal |
| `approved_by` | UUID | No | FK to user_accounts | Internal |
| `approved_at` | TIMESTAMPTZ | No | Approval timestamp | Internal |
| `is_released` | BOOLEAN | Yes | Immutable after release (per Part 7) | Internal |

#### BOM Line Fields (per Part 7)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `bom_version_id` | UUID | Yes | — | FK to `bom_versions.id` | Parent BOM version |
| `line_number` | INTEGER | Yes | — | > 0, unique per BOM | Line number (per Part 7: "Sequence") | Internal |
| `component_product_id` | UUID | Yes | — | FK to `products.id` | Component product | Internal | — |
| `component_name` | VARCHAR(250) | No | NULL | Denormalized | Component name | Public | — |
| `component_type` | ENUM | Yes | — | RAW_MATERIAL, PACKAGING, LABEL, CARTON, CONSUMABLE, CHEMICAL, SEMI_FINISHED | Component type (per Part 7) | Internal | — |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal | — |
| `required_quantity` | DECIMAL(18,4) | Yes | — | > 0 | Required quantity per batch (per Part 7: "Required Quantity") | Internal | — |
| `scrap_pct` | DECIMAL(5,2) | Yes | `0.00` | 0–100 | Scrap % (per Part 7: "Scrap %") — expected loss | Internal | Waste AI |
| `yield_pct` | DECIMAL(5,2) | Yes | `100.00` | 0–100 | Yield % (per Part 7: "Yield %") | Internal | — |
| `net_quantity` | DECIMAL(18,4) | No | — | Generated: `required_quantity * (1 + scrap_pct/100)` | Net quantity (including scrap) | Internal | — |
| `unit_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Unit cost | Confidential | Cost AI |
| `total_cost` | DECIMAL(18,4) | No | — | Generated: `net_quantity * unit_cost` | Total cost | Confidential | — |
| `is_phantom` | BOOLEAN | Yes | `false` | — | Phantom component (not physical — grouping only) | Internal | — |
| `is_critical` | BOOLEAN | Yes | `false` | — | Critical component (shortage stops production) | Internal | — |
| `substitution_allowed` | BOOLEAN | Yes | `false` | — | Substitution allowed | Internal | Substitution AI |
| `lead_time_days` | INTEGER | No | NULL | ≥ 0 | Component lead time | Internal | — |
| `line_remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | BOM → Company, RecipeVersion, UOM; BomVersion → BOM, UserAccount; BomLine → BomVersion, Product (component), UOM |
| **Index** | `uq_boms_code_company`, `idx_boms_recipe_version`, `idx_bom_versions_bom`, `idx_bom_lines_version`, `idx_bom_lines_component` |
| **Validation** | `code` immutable after activation, BOM version immutable after RELEASED, `required_quantity` > 0, `scrap_pct` 0–100, `yield_pct` 0–100, at least 1 line before RELEASED, component_type must match product.product_type |

### 8-16. API/UI/Mobile/Reports/Audit/Security/AI/Performance/Example

| Section | Summary |
|---|---|
| **API** | `/api/v1/boms` (GET, POST), `/api/v1/boms/:id` (GET, PATCH), `/api/v1/boms/:id/versions` (GET, POST), `/api/v1/bom-versions/:id/lines` (GET, POST), `/api/v1/boms/explosion` (POST — multi-level BOM explosion), `/api/v1/boms/:id/calculate-cost` (POST) |
| **UI** | BOM List, BOM Detail (with versions + lines), BOM Explosion Tree (multi-level), Cost Analysis, Component Comparison |
| **Mobile** | BOM verification (scan components against BOM lines during material issue) |
| **Reports** | BOM Explosion Report (per Part 7), BOM Cost Report, Component Usage, Scrap Analysis |
| **Audit** | Full; RELEASED versions immutable; mandatory reason for version change |
| **Security** | `bom_name`, `component_name` = Public; quantities = Internal; `unit_cost`, `total_cost`, `total_material_cost` = Confidential |
| **AI** | Cost Optimization AI, Scrap Reduction AI, BOM Optimization AI, Substitution AI |
| **Performance** | < 3,000 BOMs; < 30 lines per BOM; Redis cache TTL 1 hour |

```json
{
  "header": {
    "id": "01928f7a-...-bom-001",
    "code": "BOM-000001",
    "bom_name": "Kaju Katli 500g BOM",
    "recipe_version_id": "01928f7a-...-recipe-kaju-katli-v3",
    "active_version_id": "01928f7a-...-bom-kaju-katli-v2",
    "latest_version_number": 2,
    "batch_size": 50.0000,
    "uom_id": "01928f7a-...-uom-kg",
    "total_lines": 12,
    "total_material_cost": 31850.0000,
    "currency_code": "INR",
    "status": "ACTIVE",
    "version": 2
  },
  "lines_example": [
    { "line_number": 1, "component_type": "RAW_MATERIAL", "component_name": "Premium Cashew Nuts", "required_quantity": 28.0000, "uom": "KG", "scrap_pct": 1.00, "unit_cost": 950.00, "total_cost": 26600.00 },
    { "line_number": 2, "component_type": "RAW_MATERIAL", "component_name": "Refined Sugar", "required_quantity": 18.0000, "uom": "KG", "scrap_pct": 0.50, "unit_cost": 45.00, "total_cost": 810.00 },
    { "line_number": 7, "component_type": "PACKAGING", "component_name": "Kaju Katli Box 500g", "required_quantity": 100.0000, "uom": "EA", "scrap_pct": 2.00, "unit_cost": 12.50, "total_cost": 1250.00 },
    { "line_number": 8, "component_type": "LABEL", "component_name": "Product Label 500g", "required_quantity": 100.0000, "uom": "EA", "scrap_pct": 1.00, "unit_cost": 0.50, "total_cost": 50.00 },
    { "line_number": 9, "component_type": "CARTON", "component_name": "Shipping Carton (20 boxes)", "required_quantity": 5.0000, "uom": "EA", "scrap_pct": 0.00, "unit_cost": 45.00, "total_cost": 225.00 }
  ]
}
```

---

## Entity 065 — Ingredient Master

### 1. Business Purpose

The `Ingredient` entity extends the Product Master (Entity 011) with **food-specific ingredient attributes** — allergen flags, nutrition data, storage conditions, default suppliers. Per Part 7 §65, it "Represents recipe ingredients" with food safety metadata.

**Note**: Ingredient Master is NOT a separate physical table — it's an **extension** of the Product Master (Entity 011) for products with `product_type = RAW_MATERIAL` or `SEMI_FINISHED`. The `Ingredient` fields are added to the Product entity as a JSONB extension or separate `ingredient_profiles` table linked 1:1 to Product.

### 2-4. Owner / Schema / Fields (Summary)

| Owner | L2 — Quality Head + Product Management Head |
|---|---|
| Schema | `master` |
| Table | `ingredient_profiles` (1:1 with `products` where product_type IN (RAW_MATERIAL, SEMI_FINISHED)) |

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `product_id` | UUID | Yes | — | FK to `products.id`, UNIQUE | Linked product | Internal |
| `ingredient_code` | VARCHAR(30) | Yes | — | Unique per company | Ingredient code | Public |
| `ingredient_name` | VARCHAR(250) | Yes | — | — | Display name | Public |
| `default_supplier_id` | UUID | No | NULL | FK to `suppliers.id` | Default supplier | Confidential |
| `approved_suppliers` | UUID[] | No | `ARRAY[]::UUID[]` | FK array | Approved supplier list | Confidential |
| `allergen_flag` | BOOLEAN | Yes | `false` | — | Contains allergen | Confidential |
| `allergen_types` | TEXT[] | No | `ARRAY[]::TEXT[]` | Subset of FSSAI allergens | Allergen types | Confidential |
| `nutrition_data` | JSONB | No | NULL | — | Per-100g nutrition: `{ "calories": X, "protein_g": Y, ... }` | Public |
| `storage_condition` | TEXT | No | NULL | — | Storage requirements | Internal |
| `storage_temp_min_c` | DECIMAL(5,2) | No | NULL | — | Min storage temp | Internal |
| `storage_temp_max_c` | DECIMAL(5,2) | No | NULL | — | Max storage temp | Internal |
| `shelf_life_days` | INTEGER | No | NULL | > 0 | Shelf life | Internal |
| `hsn_code` | VARCHAR(10) | No | NULL | — | HSN code | Internal |
| `is_food_grade` | BOOLEAN | Yes | `true` | — | Food grade | Confidential |
| `is_organic` | BOOLEAN | Yes | `false` | — | Organic certified | Public |
| `country_of_origin` | CHAR(2) | Yes | `IN` | ISO 3166-1 | Country of origin | Public |
| `handling_instructions` | TEXT | No | NULL | — | Special handling | Internal |
| `msds_file_id` | UUID | No | NULL | FK to `file_attachments.id` | MSDS (for chemicals) | Confidential |
| `specification_file_id` | UUID | No | NULL | FK to `file_attachments.id` | Technical specification | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

### 5-16. Standard Pattern

```json
{
  "id": "01928f7a-...-ing-001",
  "product_id": "01928f7a-...-prod-cashew",
  "ingredient_code": "ING-CASHW-001",
  "ingredient_name": "Premium Cashew Nuts",
  "default_supplier_id": "01928f7a-...-sup-002",
  "approved_suppliers": ["01928f7a-...-sup-002", "01928f7a-...-sup-005"],
  "allergen_flag": true,
  "allergen_types": ["NUTS"],
  "nutrition_data": {
    "per_100g": { "calories": 553, "protein_g": 18, "carbohydrates_g": 30, "fat_g": 44, "fiber_g": 3 }
  },
  "storage_condition": "Cool, dry place. Below 15°C for long storage.",
  "storage_temp_min_c": 5.00,
  "storage_temp_max_c": 15.00,
  "shelf_life_days": 180,
  "is_food_grade": true,
  "is_organic": false,
  "country_of_origin": "IN",
  "handling_instructions": "Inspect for foreign matter before use. Grind fresh.",
  "status": "ACTIVE"
}
```

---

## Entity 066 — Ingredient Substitution

### 1. Business Purpose

The `IngredientSubstitution` entity defines **approved alternative ingredients** that can replace a primary ingredient in a recipe. Per Part 7 §66: *"Allows approved alternatives"* and *"Only QA-approved substitutions allowed. Every substitution audited."*

Example:
```
Ingredient A (Sugar) → Substitute A1 (Jaggery Powder) — max 30% replacement
Ingredient A (Sugar) → Substitute A2 (Stevia Blend) — max 100% replacement (sugar-free)
```

### 2-4. Owner / Schema / Fields

| Owner | L2 — Quality Head + Manufacturing Head |
|---|---|
| Schema | `master` |
| Table | `ingredient_substitutions` (header) + `ingredient_substitution_alternatives` (alternatives) |

#### Substitution Header

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `SUB-` | Substitution code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `substitution_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Public |
| `primary_ingredient_id` | UUID | Yes | — | FK to `products.id` | Primary ingredient (per Part 7) | Internal |
| `primary_ingredient_name` | VARCHAR(250) | No | NULL | Denormalized | Name | Public |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `qa_approved` | BOOLEAN | Yes | `false` | — | QA approved (per Part 7: "Only QA-approved substitutions allowed") | Confidential |
| `qa_approved_by` | UUID | No | NULL | FK to `user_accounts.id` | QA approver | Confidential |
| `qa_approved_at` | TIMESTAMPTZ | No | NULL | — | QA approval timestamp | Confidential |
| `effective_from` | DATE | No | NULL | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | — | Effective to | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |

#### Substitution Alternatives

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `substitution_id` | UUID | Yes | — | FK to `ingredient_substitutions.id` | Parent substitution | — |
| `alternative_ingredient_id` | UUID | Yes | — | FK to `products.id` | Alternative ingredient (per Part 7) | Internal | Substitution AI |
| `alternative_ingredient_name` | VARCHAR(250) | No | NULL | Denormalized | Name | Public | — |
| `max_replacement_pct` | DECIMAL(5,2) | Yes | `100.00` | 0–100 | Maximum % of primary that can be replaced | Internal | — |
| `min_replacement_pct` | DECIMAL(5,2) | Yes | `0.00` | 0–100, ≤ max_replacement_pct | Minimum % | Internal | — |
| `taste_impact` | ENUM | Yes | `NONE` | NONE, MINOR, MODERATE, SIGNIFICANT | Taste impact assessment | Internal | — |
| `texture_impact` | ENUM | Yes | `NONE` | NONE, MINOR, MODERATE, SIGNIFICANT | Texture impact | Internal | — |
| `shelf_life_impact_days` | INTEGER | Yes | `0` | Can be negative | Shelf life change (days) | Internal | — |
| `cost_impact_pct` | DECIMAL(5,2) | No | NULL | — | Cost change % | Confidential | Cost AI |
| `yield_impact_pct` | DECIMAL(5,2) | No | NULL | — | Yield change % | Internal | — |
| `allergen_change` | TEXT | No | NULL | — | Allergen change description | Confidential | — |
| `approval_required` | BOOLEAN | Yes | `true` | — | Approval required per use (per Part 7: "Approval Required") | Internal | — |
| `auto_apply` | BOOLEAN | Yes | `false` | — | Auto-apply when primary unavailable | Internal | Substitution AI |
| `priority` | INTEGER | Yes | `100` | > 0 | Priority (lower = preferred) | Internal | — |
| `effective_from` | DATE | No | NULL | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | — | Effective to | Internal |
| `reason` | TEXT | Yes | — | Min 10 chars (per Part 7: "Reason") | Reason for substitution | Internal |

### 5-16. Standard Pattern

```json
{
  "header": {
    "id": "01928f7a-...-sub-001",
    "code": "SUB-000001",
    "substitution_name": "Sugar Substitution Group",
    "primary_ingredient_id": "01928f7a-...-prod-sugar",
    "primary_ingredient_name": "Refined Sugar",
    "qa_approved": true,
    "qa_approved_by": "01928f7a-...-user-qa-head",
    "qa_approved_at": "2026-01-15T10:00:00Z",
    "effective_from": "2026-01-15",
    "status": "ACTIVE"
  },
  "alternatives": [
    {
      "alternative_ingredient_id": "01928f7a-...-prod-jaggery",
      "alternative_ingredient_name": "Organic Jaggery Powder",
      "max_replacement_pct": 30.00,
      "min_replacement_pct": 0.00,
      "taste_impact": "MINOR",
      "texture_impact": "NONE",
      "shelf_life_impact_days": -3,
      "cost_impact_pct": 15.00,
      "yield_impact_pct": -1.00,
      "approval_required": true,
      "priority": 1,
      "reason": "Health-conscious customers prefer jaggery. Max 30% to maintain taste profile."
    },
    {
      "alternative_ingredient_id": "01928f7a-...-prod-stevia",
      "alternative_ingredient_name": "Stevia Blend (Sugar-Free)",
      "max_replacement_pct": 100.00,
      "min_replacement_pct": 0.00,
      "taste_impact": "MODERATE",
      "texture_impact": "MINOR",
      "shelf_life_impact_days": 0,
      "cost_impact_pct": 45.00,
      "yield_impact_pct": -2.00,
      "approval_required": true,
      "priority": 2,
      "reason": "Sugar-free option for diabetic customers. 100% replacement creates sugar-free variant.",
      "allergen_change": "None"
    }
  ]
}
```

---

## Entity 067 — Process Step

### 1. Business Purpose

The `ProcessStep` entity (distinct from Entity 055 Production Stage) defines **recipe-level manufacturing operations** — the detailed step-by-step instructions for making a product. While Production Stage (055) tracks execution per batch, Process Step (067) is the **template** defined per recipe version.

Per Part 7 §67:
```
Material Verification → Weighing → Mixing → Cooking → Cooling → Packing → Labeling → QC
```

### 2-4. Owner / Schema / Fields (Summary)

| Owner | L2 — Manufacturing Head |
|---|---|
| Schema | `master` |
| Table | `process_steps` |

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `PST-` | Process step code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `recipe_version_id` | UUID | Yes | — | FK to `recipe_versions.id` | Parent recipe version |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `step_number` | INTEGER | Yes | — | > 0, unique per recipe version (per Part 7: "Step Number") | Execution order | Internal |
| `step_name` | VARCHAR(100) | Yes | — | Min 3 (per Part 7: "Name") | Step name | Public |
| `description` | TEXT | Yes | — | Min 10 | Detailed instructions | Internal |
| `step_type` | ENUM | Yes | — | VERIFICATION, WEIGHING, MIXING, COOKING, COOLING, CUTTING, FORMING, FILLING, PACKING, LABELING, QC, STORAGE, OTHER | Step type | Internal |
| `expected_duration_min` | INTEGER | Yes | — | > 0 (per Part 7: "Expected Duration") | Expected duration | Internal |
| `temperature_required_c` | DECIMAL(5,2) | No | NULL | — | Required temperature (per Part 7: "Temperature") | Internal |
| `pressure_required` | DECIMAL(10,2) | No | NULL | — | Required pressure (per Part 7: "Pressure") | Internal |
| `humidity_required_pct` | DECIMAL(5,2) | No | NULL | — | Required humidity (per Part 7: "Humidity") | Internal |
| `machine_required` | BOOLEAN | Yes | `false` | — | Machine required (per Part 7) | Internal |
| `machine_type` | VARCHAR(50) | No | NULL | — | Machine type needed | Internal |
| `operator_skill` | ENUM | No | NULL | TRAINEE, JUNIOR, SENIOR, EXPERT (per Part 7: "Operator Skill") | Required skill | Internal |
| `qc_required` | BOOLEAN | Yes | `false` | — | QC required after step (per Part 7: "QC Required") | Internal |
| `qc_specification_id` | UUID | No | NULL | FK to `qc_specifications.id` | QC spec | Confidential |
| `is_critical_control_point` | BOOLEAN | Yes | `false` | — | HACCP CCP | Confidential |
| `ccp_critical_limits` | JSONB | No | NULL | — | CCP limits | Confidential |
| `ccp_monitoring_method` | TEXT | No | NULL | — | Monitoring method | Confidential |
| `ccp_corrective_action` | TEXT | No | NULL | — | Corrective action | Confidential |
| `barcode_scan_required` | BOOLEAN | Yes | `false` | — | Barcode scan required at this step | Internal |
| `ingredient_addition` | BOOLEAN | Yes | `false` | — | Ingredients added at this step | Internal |
| `ingredient_line_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Formula lines added at this step | Internal |
| `is_optional` | BOOLEAN | Yes | `false` | — | Step can be skipped | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5-16. Standard Pattern (similar to Entity 055 Production Stage)

```json
{
  "id": "01928f7a-...-pst-001",
  "code": "PST-000003",
  "recipe_version_id": "01928f7a-...-recipe-kaju-katli-v3",
  "step_number": 3,
  "step_name": "Mixing",
  "description": "Mix sugar syrup with ground cashew paste at 85°C in industrial mixer. Mix for 30-40 minutes until uniform consistency achieved.",
  "step_type": "MIXING",
  "expected_duration_min": 45,
  "temperature_required_c": 85.00,
  "machine_required": true,
  "machine_type": "Industrial Mixer",
  "operator_skill": "SENIOR",
  "qc_required": false,
  "is_critical_control_point": true,
  "ccp_critical_limits": { "temp_min": 80, "temp_max": 90, "duration_min": 30 },
  "ccp_monitoring_method": "Continuous temperature logging every 5 minutes",
  "ccp_corrective_action": "Adjust burner if temperature outside range. Extend mixing if duration < 30 min.",
  "barcode_scan_required": true,
  "ingredient_addition": true,
  "ingredient_line_ids": ["01928f7a-...-fl-001", "01928f7a-...-fl-002"],
  "status": "ACTIVE"
}
```

---

## Entity 068 — Process Parameter

### 1. Business Purpose

The `ProcessParameter` entity defines **measurable parameters for each process step** — mixing speed, temperature, pressure, cooking time, pH, moisture, viscosity, etc. Per Part 7 §68: *"Supports tolerance validation."*

Parameters have **target values + tolerances** — if actual readings fall outside tolerance, an Exception is triggered (per Ch 5 §5.15 Exception Engine).

### 2-4. Owner / Schema / Fields

| Owner | L2 — Manufacturing Head + Quality Head |
|---|---|
| Schema | `master` |
| Table | `process_parameters` |

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company | Parameter code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `process_step_id` | UUID | Yes | — | FK to `process_steps.id` | Parent step |
| `recipe_version_id` | UUID | Yes | — | FK to `recipe_versions.id` | Parent recipe version |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `parameter_name` | VARCHAR(100) | Yes | — | Min 3 | Parameter name (e.g., "Mixing Speed", "Cooking Temperature") | Internal |
| `parameter_code` | VARCHAR(30) | Yes | — | Unique per step | Short code (e.g., `MIX_SPEED`, `COOK_TEMP`) | Internal |
| `parameter_type` | ENUM | Yes | — | TEMPERATURE, PRESSURE, TIME, SPEED, HUMIDITY, PH, MOISTURE, VISCOSITY, WEIGHT, VOLUME, RPM, OTHER | Parameter type (per Part 7) | Internal |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | UOM (e.g., "°C", "RPM", "min", "pH") | Internal |
| `target_value` | DECIMAL(18,4) | Yes | — | — | Target value | Internal |
| `min_value` | DECIMAL(18,4) | Yes | — | ≤ target_value | Minimum acceptable | Internal |
| `max_value` | DECIMAL(18,4) | Yes | — | ≥ target_value | Maximum acceptable | Internal |
| `tolerance_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Tolerance % (auto-computes min/max if not set) | Internal |
| `is_critical` | BOOLEAN | Yes | `false` | — | Critical parameter (deviation = CCP failure) | Confidential |
| `monitoring_frequency` | ENUM | Yes | `CONTINUOUS` | CONTINUOUS, EVERY_5_MIN, EVERY_15_MIN, HOURLY, PER_BATCH, ON_DEMAND | Monitoring frequency | Internal |
| `recording_method` | ENUM | Yes | `MANUAL` | MANUAL, AUTOMATIC, IOT_SENSOR, SEMI_AUTOMATIC | How parameter is recorded | Internal |
| `iot_sensor_id` | VARCHAR(50) | No | NULL | — | IoT sensor ID (if automatic, per Ch 24 §24.4) | Internal |
| `corrective_action` | TEXT | No | NULL | — | Corrective action if outside tolerance | Confidential |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5-16. Standard Pattern

```json
[
  {
    "id": "01928f7a-...-pp-001",
    "parameter_name": "Mixing Temperature",
    "parameter_code": "MIX_TEMP",
    "parameter_type": "TEMPERATURE",
    "unit_of_measure": "°C",
    "target_value": 85.0000,
    "min_value": 80.0000,
    "max_value": 90.0000,
    "tolerance_pct": 5.88,
    "is_critical": true,
    "monitoring_frequency": "EVERY_5_MIN",
    "recording_method": "AUTOMATIC",
    "iot_sensor_id": "SENSOR-TEMP-001",
    "corrective_action": "Adjust burner if temperature outside 80-90°C range. Log deviation."
  },
  {
    "id": "01928f7a-...-pp-002",
    "parameter_name": "Mixing Speed",
    "parameter_code": "MIX_SPEED",
    "parameter_type": "RPM",
    "unit_of_measure": "RPM",
    "target_value": 60.0000,
    "min_value": 55.0000,
    "max_value": 65.0000,
    "tolerance_pct": 8.33,
    "is_critical": false,
    "monitoring_frequency": "CONTINUOUS",
    "recording_method": "AUTOMATIC"
  },
  {
    "id": "01928f7a-...-pp-003",
    "parameter_name": "Mixing Duration",
    "parameter_code": "MIX_TIME",
    "parameter_type": "TIME",
    "unit_of_measure": "min",
    "target_value": 40.0000,
    "min_value": 30.0000,
    "max_value": 50.0000,
    "tolerance_pct": 25.00,
    "is_critical": true,
    "monitoring_frequency": "CONTINUOUS",
    "recording_method": "AUTOMATIC"
  }
]
```

---

## Entity 069 — Recipe Costing

### 1. Business Purpose

The `RecipeCosting` entity calculates **standard manufacturing cost** for a recipe version. Per Part 7 §69, cost components include:
- Raw Material cost
- Packaging cost
- Labor cost
- Machine cost
- Utility cost
- Overhead cost
- Waste cost
- Transportation cost

Recipe Costing is recalculated when ingredient prices change, recipe versions change, or on schedule (monthly). It feeds the Production Order's estimated cost (Entity 053) and the Inventory Valuation (Entity 029).

### 2-4. Owner / Schema / Fields

| Owner | L2 — Finance Head + Manufacturing Head |
|---|---|
| Schema | `master` |
| Table | `recipe_costings` |
| Lifecycle | Versioned (recalculated on changes) |

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `COST-` | Costing code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `recipe_version_id` | UUID | Yes | — | FK to `recipe_versions.id` | Recipe version | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, ARCHIVED | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `costing_number` | VARCHAR(50) | Yes | — | Display number | Public |
| `costing_date` | DATE | Yes | `CURRENT_DATE` | — | Cost calculation date | Internal |
| `batch_size` | DECIMAL(18,4) | Yes | — | > 0 | Batch size | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal |
| `raw_material_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Raw material cost (per Part 7) | Confidential | Cost AI |
| `packaging_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Packaging cost (per Part 7) | Confidential | — |
| `labor_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Labor cost (per Part 7) | Confidential | — |
| `machine_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Machine cost (per Part 7) | Confidential | — |
| `utility_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Utility cost (per Part 7) | Confidential | — |
| `overhead_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Overhead cost (per Part 7) | Confidential | — |
| `waste_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Waste cost (per Part 7) | Confidential | Waste AI |
| `transportation_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Transportation cost (per Part 7) | Confidential | — |
| `standard_cost` | DECIMAL(18,4) | Yes | `0` | Generated: SUM of all cost components | Total standard cost | Confidential | Cost AI |
| `unit_cost` | DECIMAL(18,4) | Yes | `0` | Generated: `standard_cost / batch_size` | Cost per unit | Confidential | — |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `actual_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Actual production cost (from Manufacturing Batch) | Confidential | — |
| `cost_variance` | DECIMAL(18,4) | No | NULL | — | Generated: `actual_cost - standard_cost` | Confidential | — |
| `cost_variance_pct` | DECIMAL(5,2) | No | NULL | — | Variance % | Confidential | — |
| `last_calculated_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Last calculation timestamp (per Part 7: "Last Calculated") | Internal |
| `cost_breakdown` | JSONB | No | NULL | — | Detailed per-ingredient, per-component breakdown | Confidential | — |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5-16. Standard Pattern

```json
{
  "id": "01928f7a-...-cost-001",
  "code": "COST-000001",
  "recipe_version_id": "01928f7a-...-recipe-kaju-katli-v3",
  "costing_number": "COST-000001",
  "costing_date": "2026-07-01",
  "batch_size": 50.0000,
  "uom_id": "01928f7a-...-uom-kg",
  "raw_material_cost": 29900.0000,
  "packaging_cost": 1525.0000,
  "labor_cost": 3000.0000,
  "machine_cost": 800.0000,
  "utility_cost": 500.0000,
  "overhead_cost": 1200.0000,
  "waste_cost": 1046.5000,
  "transportation_cost": 300.0000,
  "standard_cost": 38271.5000,
  "unit_cost": 765.4300,
  "currency_code": "INR",
  "actual_cost": 32200.0000,
  "cost_variance": -6071.5000,
  "cost_variance_pct": -15.87,
  "last_calculated_at": "2026-07-01T02:00:00Z",
  "cost_breakdown": {
    "raw_materials": [
      { "ingredient": "Cashew Nuts", "qty": 28.0, "unit_cost": 950.0, "total": 26600.0 },
      { "ingredient": "Sugar", "qty": 18.0, "unit_cost": 45.0, "total": 810.0 },
      { "ingredient": "Ghee", "qty": 4.5, "unit_cost": 520.0, "total": 2340.0 }
    ],
    "packaging": [
      { "component": "Box 500g", "qty": 100, "unit_cost": 12.5, "total": 1250.0 },
      { "component": "Label", "qty": 100, "unit_cost": 0.5, "total": 50.0 }
    ]
  }
}
```

---

## Entity 070 — Nutrition & Allergen Profile

### 1. Business Purpose

The `NutritionProfile` entity stores **regulatory food information** for a recipe version — nutritional values and allergen declarations required by FSSAI (India), FDA (future export), and other food safety authorities. Per Part 7 §70:

**Nutrition**: Calories, Protein, Fat, Carbohydrates, Sugar, Sodium, Fiber
**Allergens**: Milk, Nuts, Soy, Gluten, Sesame, Mustard, Peanut, Egg
**Compliance**: FSSAI, FDA, Export

This entity is critical for:
- **FSSAI labeling compliance** (per Ch 18 §18.7) — mandatory nutritional info on packaging
- **Allergen cross-contamination prevention** (per Ch 1 §2 — food safety)
- **Customer transparency** — nutritional info available at retail/restaurant POS
- **Export compliance** — FDA, EU standards for international markets

### 2-4. Owner / Schema / Fields

| Owner | L2 — Quality Head + Compliance Officer |
|---|---|
| Schema | `master` |
| Table | `nutrition_profiles` |
| Immutability | Immutable after Recipe Version RELEASED |

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company | Profile code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `recipe_version_id` | UUID | Yes | — | FK to `recipe_versions.id` | Recipe version | Internal |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, ARCHIVED | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `profile_name` | VARCHAR(200) | Yes | — | Min 3 | Profile name | Public |
| `serving_size` | DECIMAL(18,4) | Yes | — | > 0 | Serving size | Public |
| `serving_size_uom` | VARCHAR(20) | Yes | — | — | Serving UOM (e.g., "g", "piece") | Public |
| `servings_per_package` | DECIMAL(8,2) | Yes | — | > 0 | Servings per package | Public |
| **Nutritional Values (per serving)** | | | | | | |
| `calories_kcal` | DECIMAL(8,2) | Yes | — | ≥ 0 (per Part 7: "Calories") | Calories | Public |
| `protein_g` | DECIMAL(8,2) | Yes | — | ≥ 0 (per Part 7: "Protein") | Protein (g) | Public |
| `fat_total_g` | DECIMAL(8,2) | Yes | — | ≥ 0 (per Part 7: "Fat") | Total fat (g) | Public |
| `fat_saturated_g` | DECIMAL(8,2) | No | NULL | ≥ 0 | Saturated fat (g) | Public |
| `fat_trans_g` | DECIMAL(8,2) | No | NULL | ≥ 0 | Trans fat (g) | Public |
| `carbohydrates_g` | DECIMAL(8,2) | Yes | — | ≥ 0 (per Part 7: "Carbohydrates") | Carbohydrates (g) | Public |
| `sugar_g` | DECIMAL(8,2) | Yes | — | ≥ 0 (per Part 7: "Sugar") | Sugar (g) | Public |
| `sodium_mg` | DECIMAL(8,2) | Yes | — | ≥ 0 (per Part 7: "Sodium") | Sodium (mg) | Public |
| `fiber_g` | DECIMAL(8,2) | Yes | — | ≥ 0 (per Part 7: "Fiber") | Fiber (g) | Public |
| `calcium_mg` | DECIMAL(8,2) | No | NULL | ≥ 0 | Calcium (mg) | Public |
| `iron_mg` | DECIMAL(8,2) | No | NULL | ≥ 0 | Iron (mg) | Public |
| `potassium_mg` | DECIMAL(8,2) | No | NULL | ≥ 0 | Potassium (mg) | Public |
| `vitamin_a_mcg` | DECIMAL(8,2) | No | NULL | ≥ 0 | Vitamin A (mcg) | Public |
| `vitamin_c_mg` | DECIMAL(8,2) | No | NULL | ≥ 0 | Vitamin C (mg) | Public |
| `cholesterol_mg` | DECIMAL(8,2) | No | NULL | ≥ 0 | Cholesterol (mg) | Public |
| **Allergen Declaration** | | | | | | |
| `contains_milk` | BOOLEAN | Yes | `false` (per Part 7: "Milk") | — | Contains milk | Confidential |
| `contains_nuts` | BOOLEAN | Yes | `false` (per Part 7: "Nuts") | — | Contains tree nuts | Confidential |
| `contains_peanut` | BOOLEAN | Yes | `false` (per Part 7: "Peanut") | — | Contains peanut | Confidential |
| `contains_soy` | BOOLEAN | Yes | `false` (per Part 7: "Soy") | — | Contains soy | Confidential |
| `contains_gluten` | BOOLEAN | Yes | `false` (per Part 7: "Gluten") | — | Contains gluten | Confidential |
| `contains_sesame` | BOOLEAN | Yes | `false` (per Part 7: "Sesame") | — | Contains sesame | Confidential |
| `contains_mustard` | BOOLEAN | Yes | `false` (per Part 7: "Mustard") | — | Contains mustard | Confidential |
| `contains_egg` | BOOLEAN | Yes | `false` (per Part 7: "Egg") | — | Contains egg | Confidential |
| `contains_fish` | BOOLEAN | Yes | `false` | — | Contains fish | Confidential |
| `contains_shellfish` | BOOLEAN | Yes | `false` | — | Contains shellfish | Confidential |
| `may_contain` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | May contain (cross-contamination) | Confidential |
| `is_veg` | BOOLEAN | Yes | `true` | — | Vegetarian (FSSAI veg/non-veg mark) | Public |
| **Compliance** | | | | | | |
| `fssai_compliant` | BOOLEAN | Yes | `true` (per Part 7: "FSSAI") | — | FSSAI compliant | Confidential |
| `fda_compliant` | BOOLEAN | Yes | `false` (per Part 7: "FDA") | — | FDA compliant (export) | Confidential |
| `export_compliant` | BOOLEAN | Yes | `false` (per Part 7: "Export") | — | Export compliant | Confidential |
| `compliance_certifications` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | List of compliance certifications | Confidential |
| `lab_verified` | BOOLEAN | Yes | `false` | — | Lab-verified nutritional data | Confidential |
| `lab_verification_date` | DATE | No | NULL | — | Lab verification date | Internal |
| `lab_report_file_id` | UUID | No | NULL | FK to `file_attachments.id` | Lab report | Confidential |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5-16. Standard Pattern

```json
{
  "id": "01928f7a-...-nutrition-001",
  "code": "NUTR-000001",
  "recipe_version_id": "01928f7a-...-recipe-kaju-katli-v3",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "profile_name": "Kaju Katli 500g Nutrition Profile",
  "serving_size": 100.0000,
  "serving_size_uom": "g",
  "servings_per_package": 5.00,
  "calories_kcal": 480.00,
  "protein_g": 8.00,
  "fat_total_g": 22.00,
  "fat_saturated_g": 8.00,
  "fat_trans_g": 0.00,
  "carbohydrates_g": 65.00,
  "sugar_g": 55.00,
  "sodium_mg": 20.00,
  "fiber_g": 2.00,
  "calcium_mg": 30.00,
  "iron_mg": 2.50,
  "cholesterol_mg": 10.00,
  "contains_milk": true,
  "contains_nuts": true,
  "contains_peanut": false,
  "contains_soy": false,
  "contains_gluten": false,
  "contains_sesame": false,
  "contains_mustard": false,
  "contains_egg": false,
  "contains_fish": false,
  "contains_shellfish": false,
  "may_contain": ["PEANUT"],
  "is_veg": true,
  "fssai_compliant": true,
  "fda_compliant": false,
  "export_compliant": false,
  "lab_verified": true,
  "lab_verification_date": "2026-03-05",
  "lab_report_file_id": "01928f7a-...-file-lab-nutrition-001",
  "status": "ACTIVE"
}
```

---

## Recipe Simulation Engine (Enterprise Architect Enhancement — Integrated)

### Architecture

The Recipe Simulation Engine is **fully schema-ready** via fields on Recipe Master (Entity 061) and Recipe Version (Entity 062):

| Simulation Capability | Schema Support | Activation |
|---|---|---|
| **What-if ingredient price increase** | `recipe_costings` (Entity 069) + `formula_lines.cost_per_unit` — recalculable with scenario prices | Phase 2 (AI) |
| **What-if substitute ingredient used** | `ingredient_substitutions` (Entity 066) + `formula_lines.substitution_group_id` | Phase 2 (AI) |
| **What-if batch size doubles** | `recipe.standard_batch_size` + `formula.batch_size` + `bom.batch_size` — all parameterized | Phase 2 (AI) |
| **What-if yield drops by 3%** | `recipe.standard_yield_pct` + `recipe_version.standard_yield_pct` — scenario parameter | Phase 2 (AI) |
| **What-if different packaging** | `bom_lines` (Entity 064) — packaging components swappable | Phase 2 (AI) |

### Future Simulation Entity (Reserved)

```prisma
model RecipeSimulation {
  id                  String   @id @default(uuid()) @db.Uuid
  code                String   @unique  // SIM-2026-000001
  recipe_version_id   String   @db.Uuid  // FK to recipe_versions
  simulation_name     String
  simulation_type     String   // PRICE_SCENARIO, SUBSTITUTION, BATCH_SIZE, YIELD_SCENARIO, PACKAGING_SCENARIO
  parameters          Json     // { batch_size, yield_pct, ingredient_prices, substitutions, packaging_config }
  projected_material_cost  Decimal? @db.Decimal(18,4)
  projected_labor_cost     Decimal? @db.Decimal(18,4)
  projected_total_cost     Decimal? @db.Decimal(18,4)
  projected_yield_pct      Decimal? @db.Decimal(5,2)
  projected_wastage_pct    Decimal? @db.Decimal(5,2)
  projected_machine_hours  Decimal? @db.Decimal(8,2)
  projected_labor_hours    Decimal? @db.Decimal(8,2)
  projected_waste_qty      Decimal? @db.Decimal(18,4)
  ai_model_id              String?  @db.Uuid  // FK to ai_models
  confidence_score         Decimal? @db.Decimal(5,2)
  created_by               String   @db.Uuid
  created_at               DateTime @default(now())
  status                   String   @default("COMPLETED")  // DRAFT, IN_PROGRESS, COMPLETED, ARCHIVED
}
```

**All fields nullable, feature-flag-gated** (per Ch 8 §8.6 `FEATURE_RECIPE_SIMULATION` default OFF). Activated in Phase 2 without schema migration.

---

## Part 7 Section 2 Completion Summary

**All 10 Recipe, Formula & BOM entities are now defined** at full enterprise-grade depth:

| Entity | File | Status |
|---|---|---|
| 061 Recipe Master | `61-62-63-recipe-core-triad.md` | ✅ Complete (versioned parent, two-person approval) |
| 062 Recipe Version | `61-62-63-recipe-core-triad.md` | ✅ Complete (immutable after RELEASED, 7-stage lifecycle) |
| 063 Formula Master | `61-62-63-recipe-core-triad.md` | ✅ Complete (ingredient composition, tolerances, allergens) |
| 064 BOM | `64-70-materials-process-costing-nutrition.md` | ✅ Complete (versioned, multi-component types) |
| 065 Ingredient Master | `64-70-materials-process-costing-nutrition.md` | ✅ Complete (extends Product, allergen + nutrition) |
| 066 Ingredient Substitution | `64-70-materials-process-costing-nutrition.md` | ✅ Complete (QA-approved, max %, impact assessment) |
| 067 Process Step | `64-70-materials-process-costing-nutrition.md` | ✅ Complete (CCP/HACCP, parameters) |
| 068 Process Parameter | `64-70-materials-process-costing-nutrition.md` | ✅ Complete (tolerance validation, IoT ready) |
| 069 Recipe Costing | `64-70-materials-process-costing-nutrition.md` | ✅ Complete (8 cost components, variance) |
| 070 Nutrition & Allergen | `64-70-materials-process-costing-nutrition.md` | ✅ Complete (FSSAI/FDA, 10 allergens, lab-verified) |

### Key Architectural Decisions in Part 7 Section 2

1. **Version-controlled recipes** — Recipe → RecipeVersion (immutable after RELEASED, per Part 7 §3)
2. **Two-person approval** — Manufacturing Head + QA Head (per Q38, food safety)
3. **Formula vs BOM separation** — Formula = food ingredients; BOM = all materials (per Part 7 §2)
4. **Immutable released versions** — DB trigger enforces (per Part 7 §3)
5. **Production Orders reference specific version** — Not active pointer (per Part 7: "Production Orders always reference a specific version")
6. **Effective dating** — Auto-close previous version's effective_to when new version activates (per Q39)
7. **Controlled ingredient substitution** — QA-approved, max %, impact assessment, audited
8. **HACCP CCP support** — Process Step + Process Parameter with critical limits, monitoring, corrective actions (per Ch 18 §18.7)
9. **IoT-ready process parameters** — `iot_sensor_id` field for automatic monitoring (per Ch 24 §24.4)
10. **8-component recipe costing** — Raw material, packaging, labor, machine, utility, overhead, waste, transportation
11. **10 allergen declarations** — Milk, nuts, peanut, soy, gluten, sesame, mustard, egg, fish, shellfish (per Part 7 §70)
12. **FSSAI + FDA + Export compliance** — Multi-jurisdiction ready
13. **Lab-verified nutrition** — Lab report attachment + verification date
14. **Recipe Simulation Engine** — Fully schema-ready, feature-flag-gated, no migration needed (per Enhancement)
15. **Full recipe genealogy** — Recipe → Version → Formula → BOM → Ingredients → Suppliers chain (traceability)

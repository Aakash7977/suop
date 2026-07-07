# Manual 1 · Part 7 · Entities 53, 54 — Execution Core (Production Order, Manufacturing Batch)

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 7 — Manufacturing Foundation & Production Planning |
| Section | 1 — Manufacturing Foundation & Production Planning |
| Entities | Production Order (053), Manufacturing Batch (054) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 5 §5.4, Ch 10 §10.6, Ch 18 §18.5 |
| Last Updated | 2026-07-07 |

---

## Overview — Execution Core Architecture

The Execution Core is where **planning becomes reality** — the Production Order authorizes manufacturing, and the Manufacturing Batch is the physical production run:

```
PRODUCTION SCHEDULE (052) — Approved schedule
        ↓ Generate
PRODUCTION ORDER (053) — Authorized manufacturing job
        ↓ Start
MANUFACTURING BATCH (054) — Physical production run
        ↓ Write to
PRODUCTION LEDGER (per Ch 10 §10.6) — Immutable record
        ↓ Creates
BATCH (Part 4, Entity 023) — Traceable batch in inventory
```

### Critical Architectural Rules (Locked)

| Rule | Enforcement |
|---|---|
| **Production Order lifecycle** | 11-stage: DRAFT → REVIEW → APPROVED → MATERIAL_RESERVED → MATERIAL_ISSUED → PRODUCTION_STARTED → PAUSED → COMPLETED → QC → CLOSED (per Part 7) |
| **Recipe version immutable after approval** | Per Part 7 business rules — approved orders cannot change recipe version |
| **Every order generates inventory reservations** | Per Part 7 — raw materials reserved before production |
| **Manufacturing Batch links to Inventory Batch** | Entity 054 creates Entity 023 (Batch Master) on completion |
| **Full genealogy** | Finished product → Batch → Recipe → Raw material batches → Supplier (per Part 7 §1) |
| **Production Ledger entry on batch completion** | Per Ch 10 §10.6 ledger-first architecture |

---

## Entity 053 — Production Order

### 1. Business Purpose

The `ProductionOrder` entity represents an **authorized manufacturing job** — the formal instruction to produce a specific quantity of a product using a specific recipe version, on a specific production line, within a specific timeframe. Per Volume 0 Chapter 5 §5.4 (Stock-to-Production), the Production Order is the central execution document:

```
Production Plan → Production Schedule → PRODUCTION ORDER → Material Issue → Production → Finished Goods → QC → Warehouse
```

The Production Order is:
- **Authorized** — requires approval before execution
- **Recipe-locked** — recipe version immutable after approval (per Part 7 business rules)
- **Material-reserving** — generates inventory reservations for raw materials (per Part 7)
- **Traceable** — every batch produced links back to its production order
- **Yield-tracking** — planned vs actual yield recorded
- **Stage-driven** — progresses through production stages (Entity 055)

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Manufacturing Head |
| Data Owner | Manufacturing Head |
| Technical Owner | Backend Lead — Manufacturing Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `production_orders` (header) + `production_order_lines` (output products) + `production_order_materials` (input materials/BOM) |
| Prisma Models | `ProductionOrder`, `ProductionOrderLine`, `ProductionOrderMaterial` |
| Partitioning | Monthly by `order_date` (high volume — ~100 orders/day at scale) |
| Lifecycle | **11-stage**: DRAFT → REVIEW → APPROVED → MATERIAL_RESERVED → MATERIAL_ISSUED → PRODUCTION_STARTED → PAUSED → COMPLETED → QC → CLOSED (per Part 7) |

### 4. Field Dictionary

#### 4.1 Universal Base Fields

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | `uuid_generate_v7()` | PK, immutable | Internal primary key |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `WO-` (Work Order) | Order code (e.g., `WO-2026-000001`) — **immutable** |
| `company_id` | UUID | Yes | — | FK to `companies.id` | Owning company |
| `facility_id` | UUID | Yes | — | FK to `facilities.id` (PLANT) | Manufacturing facility |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, REVIEW, APPROVED, MATERIAL_RESERVED, MATERIAL_ISSUED, PRODUCTION_STARTED, PAUSED, COMPLETED, QC, CLOSED, CANCELLED | 11-stage lifecycle |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto-update | Last modification |
| `created_by` | UUID | Yes | — | FK to `user_accounts.id` | Creator |
| `updated_by` | UUID | Yes | — | FK to `user_accounts.id` | Last modifier |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft-delete (rare) |
| `version` | INTEGER | Yes | `1` | Optimistic concurrency | Increments on each update |

#### 4.2 Order Identity Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `order_number` | VARCHAR(50) | Yes | — | Unique per company, format `WO-{YEAR}-{SEQ}` | Display number (e.g., `WO-2026-000001`) | Public | — |
| `order_date` | DATE | Yes | `CURRENT_DATE` | — | Order creation date | Internal | — |
| `order_type` | ENUM | Yes | `STANDARD` | STANDARD, REWORK, TRIAL, SAMPLE, CONTRACT, CO_PACKING | Order type | Internal | — |
| `order_origin` | ENUM | Yes | `FROM_SCHEDULE` | MANUAL, FROM_SCHEDULE, FROM_PLAN, FROM_DEMAND, AUTO_GENERATED | How order was created | Internal | — |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT, CRITICAL | Priority | Internal | — |

#### 4.3 Source References

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `production_plan_id` | UUID | No | NULL | FK to `production_plans.id` | Source plan | Internal |
| `plan_number` | VARCHAR(50) | No | NULL | Denormalized | Plan number | Internal |
| `schedule_id` | UUID | No | NULL | FK to `production_schedules.id` | Source schedule | Internal |
| `schedule_number` | VARCHAR(50) | No | NULL | Denormalized | Schedule number | Internal |
| `schedule_line_id` | UUID | No | NULL | FK to `production_schedule_lines.id` | Source schedule line | Internal |
| `demand_id` | UUID | No | NULL | FK to `manufacturing_demands.id` | Source demand | Internal |

#### 4.4 Product & Recipe

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `product_id` | UUID | Yes | — | FK to `products.id` (FINISHED_GOODS or SEMI_FINISHED) | Product to manufacture | Internal | — |
| `product_name` | VARCHAR(250) | No | NULL | Denormalized | Product name | Public | — |
| `product_family_id` | UUID | No | NULL | FK to `product_families.id` | Product family | Internal | — |
| `brand_id` | UUID | No | NULL | FK to `brands.id` | Brand | Public | — |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | Base UOM | Internal | — |
| `recipe_id` | UUID | Yes | — | FK to `recipes.id` | Recipe | Internal | — |
| `recipe_version_id` | UUID | Yes | — | FK to `recipe_versions.id` | **Recipe version (immutable after APPROVED per Part 7)** | Internal | Recipe AI |
| `recipe_version_number` | VARCHAR(20) | No | NULL | Denormalized | Version number | Internal | — |
| `bom_id` | UUID | Yes | — | FK to `boms.id` | Bill of Materials | Internal | — |
| `bom_version_id` | UUID | Yes | — | FK to `bom_versions.id` | BOM version | Internal | — |

#### 4.5 Quantity & Yield

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `planned_quantity` | DECIMAL(18,4) | Yes | — | > 0 | Planned production quantity | Internal | — |
| `actual_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Actual produced quantity | Internal | Yield AI |
| `planned_yield_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Expected yield % | Internal | — |
| `actual_yield_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Actual yield % | Internal | Yield AI |
| `yield_variance_pct` | DECIMAL(5,2) | No | NULL | — | Generated: `actual_yield_pct - planned_yield_pct` | Internal | Yield AI |
| `wastage_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Wastage quantity | Internal | Waste AI |
| `wastage_pct` | DECIMAL(5,2) | No | NULL | — | Wastage % | Internal | Waste AI |
| `wastage_reason` | TEXT | No | NULL | Required if `wastage_quantity > 0` | Wastage reason | Internal | — |
| `batch_size` | DECIMAL(18,4) | No | NULL | > 0 | Batch size (from recipe) | Internal | — |
| `expected_batches` | INTEGER | No | NULL | ≥ 1 | Generated: `CEIL(planned_quantity / batch_size)` | Internal | — |
| `actual_batches` | INTEGER | Yes | `0` | ≥ 0 | Actual batches produced | Internal | — |

#### 4.6 Scheduling & Execution

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `production_line_id` | UUID | Yes | — | FK to `production_lines.id` | Production line | Internal |
| `work_center_id` | UUID | No | NULL | FK to `work_centers.id` | Work center | Internal |
| `machine_id` | UUID | No | NULL | FK to `machines.id` | Primary machine | Internal |
| `shift_id` | UUID | No | NULL | FK to `shifts.id` | Shift | Internal |
| `supervisor_user_id` | UUID | Yes | — | FK to `user_accounts.id` | Production supervisor | Internal |
| `operator_user_id` | UUID | No | NULL | FK to `user_accounts.id` | Primary operator | Internal |
| `expected_start_datetime` | TIMESTAMPTZ | Yes | — | — | Expected start | Internal |
| `expected_end_datetime` | TIMESTAMPTZ | Yes | — | > expected_start_datetime | Expected end | Internal |
| `expected_duration_hours` | DECIMAL(8,2) | Yes | — | > 0 | Expected duration | Internal |
| `actual_start_datetime` | TIMESTAMPTZ | No | NULL | — | Actual start | Internal |
| `actual_end_datetime` | TIMESTAMPTZ | No | NULL | — | Actual end | Internal |
| `actual_duration_hours` | DECIMAL(8,2) | No | NULL | ≥ 0 | Actual duration | Internal |
| `duration_variance_pct` | DECIMAL(5,2) | No | NULL | — | Duration variance | Internal |
| `is_paused` | BOOLEAN | Yes | `false` | — | Currently paused | Internal |
| `pause_reason` | VARCHAR(200) | No | NULL | Required if `is_paused = true` | Pause reason | Internal |
| `total_pause_duration_min` | INTEGER | Yes | `0` | ≥ 0 | Total pause time | Internal |
| `pause_count` | INTEGER | Yes | `0` | ≥ 0 | Number of pauses | Internal |

#### 4.7 Material Status

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `material_reservation_status` | ENUM | Yes | `PENDING` | PENDING, PARTIALLY_RESERVED, FULLY_RESERVED, PARTIALLY_ISSUED, FULLY_ISSUED, SHORTAGE | Material status | Internal |
| `reservation_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Stock reservation IDs | Internal |
| `material_shortage` | BOOLEAN | Yes | `false` | — | Material shortage flag | Internal |
| `shortage_details` | JSONB | No | NULL | — | Array of `{ product_id, required_qty, available_qty, shortage_qty }` | Internal |
| `material_issued_at` | TIMESTAMPTZ | No | NULL | — | When materials fully issued | Internal |
| `material_issued_by` | UUID | No | NULL | FK to `user_accounts.id` | Who issued materials | Internal |

#### 4.8 Approval Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `approved_by` | UUID | No | NULL | FK to `user_accounts.id` | Approver | Internal |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `approval_comments` | TEXT | No | NULL | — | Comments | Internal |
| `rejected_reason` | TEXT | No | NULL | Required if status = CANCELLED during REVIEW | Rejection reason | Internal |

#### 4.9 QC Integration

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `requires_qc` | BOOLEAN | Yes | `true` | — | QC required | Internal |
| `qc_inspection_type` | ENUM | No | `FINAL` | IN_PROCESS, FINAL, BOTH | QC type | Internal |
| `qc_specification_id` | UUID | No | NULL | FK to `qc_specifications.id` | QC spec | Confidential |
| `qc_inspection_id` | UUID | No | NULL | FK to `qc_inspections.id` | QC inspection | Confidential |
| `qc_status` | ENUM | No | NULL | PENDING, IN_PROGRESS, PASSED, FAILED, CONDITIONAL | QC status | Confidential |
| `qc_completed_at` | TIMESTAMPTZ | No | NULL | — | QC completion | Internal |

#### 4.10 Cost & Financial

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `estimated_material_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Estimated material cost | Confidential |
| `estimated_labor_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Estimated labor cost | Confidential |
| `estimated_overhead_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Estimated overhead | Confidential |
| `estimated_total_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Total estimated cost | Confidential |
| `actual_material_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Actual material cost | Confidential |
| `actual_labor_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Actual labor cost | Confidential |
| `actual_overhead_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Actual overhead | Confidential |
| `actual_total_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Total actual cost | Confidential |
| `cost_variance_pct` | DECIMAL(5,2) | No | NULL | — | Cost variance | Confidential |
| `unit_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Actual unit cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `cost_center_id` | UUID | No | NULL | FK to `cost_centers.id` | Cost center | Confidential |

#### 4.11 Batch References

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `manufacturing_batch_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Manufacturing batches produced | Internal |
| `batch_count` | INTEGER | Yes | `0` | ≥ 0 | Number of batches | Internal |
| `inventory_batch_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Inventory batches created | Internal |

#### 4.12 Closure

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `closed_at` | TIMESTAMPTZ | No | NULL | — | Closure timestamp | Internal |
| `closed_by` | UUID | No | NULL | FK to `user_accounts.id` | Who closed | Internal |
| `closure_reason` | VARCHAR(200) | No | NULL | — | Closure reason | Internal |
| `cancel_reason` | VARCHAR(200) | No | NULL | Required if status = CANCELLED | Cancellation reason | Internal |
| `cancelled_by` | UUID | No | NULL | FK to `user_accounts.id` | Who cancelled | Internal |
| `cancelled_at` | TIMESTAMPTZ | No | NULL | — | Cancellation timestamp | Internal |

#### 4.13 Custom Fields & Annotations

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `custom_fields` | JSONB | No | `'{}'::JSONB` | — | Custom fields | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

#### 4.14 Production Order Materials (BOM Lines — input materials)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `production_order_id` | UUID | Yes | — | FK to `production_orders.id` | Parent order |
| `line_number` | INTEGER | Yes | — | > 0, unique per order | Line number |
| `product_id` | UUID | Yes | — | FK to `products.id` (RAW_MATERIAL or PACKAGING) | Input material |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM |
| `bom_line_id` | UUID | No | NULL | FK to `bom_lines.id` | Source BOM line |
| `recipe_line_id` | UUID | No | NULL | FK to `recipe_lines.id` | Source recipe line |
| `quantity_required` | DECIMAL(18,4) | Yes | — | > 0 | Required quantity (from BOM × planned_quantity) |
| `quantity_reserved` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Reserved quantity |
| `quantity_issued` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Issued quantity |
| `quantity_consumed` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Actually consumed quantity |
| `quantity_variance` | DECIMAL(18,4) | No | — | Generated: `quantity_consumed - quantity_required` | Variance |
| `unit_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Unit cost | Confidential |
| `total_cost` | DECIMAL(18,4) | No | — | Generated: `quantity_consumed * unit_cost` | Total cost | Confidential |
| `reservation_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Stock reservation IDs | Internal |
| `issue_status` | ENUM | Yes | `PENDING` | PENDING, RESERVED, PARTIALLY_ISSUED, FULLY_ISSUED, SHORTAGE | Material status | Internal |
| `batch_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Batches consumed (for genealogy) | Internal |
| `line_remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| ProductionOrder → Company, Facility, Product, ProductFamily, Brand, UOM, Recipe, RecipeVersion, BOM, BomVersion, ProductionLine, WorkCenter, Machine, Shift, UserAccount (supervisor, operator, approver), ProductionPlan, ProductionSchedule, ScheduleLine, ManufacturingDemand, QCSpecification, QCInspection, CostCenter | N : 1 each | various | RESTRICT/SET NULL |
| ProductionOrder → ProductionOrderMaterial | 1 : N | `production_order_materials.production_order_id` | CASCADE |
| ProductionOrder → ManufacturingBatch | 1 : N | `manufacturing_batches.production_order_id` | RESTRICT |
| ProductionOrder → Batch (inventory) | 1 : N | `batches.production_order_id` | SET NULL |
| ProductionOrder → StockReservation | 1 : N | (via `reservation_ids` array) | SET NULL |
| ProductionOrder → ProductionLedger | 1 : N | (via source_document) | — |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_production_orders` | PK | `id` |
| `uq_po_code_company` | UNIQUE | `company_id, code` |
| `uq_po_number_company` | UNIQUE | `company_id, order_number` |
| `idx_po_date` | B-TREE | `order_date DESC` (partition) |
| `idx_po_status` | B-TREE | `status, order_date DESC` |
| `idx_po_product` | B-TREE | `product_id, order_date DESC` |
| `idx_po_line` | B-TREE | `production_line_id, expected_start_datetime` |
| `idx_po_supervisor` | B-TREE | `supervisor_user_id, status` |
| `idx_po_priority` | B-TREE | `priority, expected_start_datetime WHERE status IN ('APPROVED', 'MATERIAL_RESERVED', 'MATERIAL_ISSUED', 'PRODUCTION_STARTED')` |
| `idx_po_recipe` | B-TREE | `recipe_version_id` |
| `idx_po_plan` | B-TREE | `production_plan_id` |
| `idx_po_schedule` | B-TREE | `schedule_id` |
| `idx_po_material_pending` | PARTIAL | `order_date WHERE material_reservation_status IN ('PENDING', 'PARTIALLY_RESERVED')` |
| `idx_po_in_production` | PARTIAL | `production_line_id WHERE status = 'PRODUCTION_STARTED'` |
| `idx_po_qc_pending` | PARTIAL | `order_date WHERE status = 'QC'` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `code` and `order_number` unique per company | DB |
| 2 | `code` immutable after creation | App |
| 3 | `recipe_version_id` **immutable after APPROVED** (per Part 7 business rules) | App |
| 4 | `planned_quantity` > 0 | DB CHECK |
| 5 | `product_id` must be FINISHED_GOODS or SEMI_FINISHED | App |
| 6 | `expected_end_datetime` > `expected_start_datetime` | DB CHECK |
| 7 | Approval required before MATERIAL_RESERVED | App |
| 8 | Material reservation required before MATERIAL_ISSUED | App |
| 9 | Material issue required before PRODUCTION_STARTED | App |
| 10 | Cannot pause if status ≠ PRODUCTION_STARTED | App |
| 11 | `wastage_reason` required if `wastage_quantity > 0` | DB CHECK |
| 12 | `cancel_reason` required if status = CANCELLED | DB CHECK |
| 13 | QC required before CLOSED (if `requires_qc = true`) | App |
| 14 | On COMPLETED: write PRODUCTION_IN entry to Production Ledger + Inventory Ledger | App |
| 15 | On COMPLETED: create Batch (Entity 023) in inventory | App |
| 16 | `actual_yield_pct` auto-computed: `(actual_quantity / planned_quantity) * 100` | App |
| 17 | State transitions follow 11-stage lifecycle | App |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/production-orders` (GET, POST), `/api/v1/production-orders/:id` (GET, PATCH), `/api/v1/production-orders/:id/materials` (GET), `/api/v1/production-orders/:id/submit` (POST), `/api/v1/production-orders/:id/approve` (POST), `/api/v1/production-orders/:id/reserve-materials` (POST), `/api/v1/production-orders/:id/issue-materials` (POST), `/api/v1/production-orders/:id/start` (POST), `/api/v1/production-orders/:id/pause` (POST), `/api/v1/production-orders/:id/resume` (POST), `/api/v1/production-orders/:id/complete` (POST), `/api/v1/production-orders/:id/start-qc` (POST), `/api/v1/production-orders/:id/complete-qc` (POST), `/api/v1/production-orders/:id/close` (POST), `/api/v1/production-orders/:id/cancel` (POST), `/api/v1/production-orders/:id/genealogy` (GET), `/api/v1/production-orders/:id/batches` (GET), `/api/v1/production-orders/:id/stages` (GET), `/api/v1/production-orders/by-status/:status` (GET), `/api/v1/production-orders/in-production` (GET) |
| **UI** | Order List, Order Detail (tabbed: Overview, Materials, Batches, Stages, QC, Costs, Genealogy), Order Create Wizard, Material Reservation Board, Production Dashboard (live), Yield Analysis, Cost Analysis, Genealogy Tree |
| **Mobile** | **Production Start** (scan to start), **Production Pause**, **Material Verification** (scan ingredients), **Batch Scan**, **Stage Completion** (scan to complete stage), **Production Completion** (enter actual qty + yield), Operator login, Machine assignment |
| **Reports** | Open Orders, Production Timeline, Daily Manufacturing, Yield Report, Wastage Report, Cost Variance, Batch History, Production vs Plan, Line Utilization, Operator Productivity |
| **Audit** | Full; **immutable recipe version after approval**; mandatory reason for pause, cancellation, yield variance > threshold; ledger entries hash-chained |

### 13-16. Security / AI / Performance / Example

**Security**: `order_number`, `order_date`, `product_name`, `brand_id` = Public; costs, financial = Confidential; `recipe_version_id` = Internal (traceability).

**AI**: Production Planning AI, Yield Prediction AI, Wastage Prediction AI, Cost Optimization AI, Production Sequencing AI, Recipe Optimization AI.

**Performance**: Monthly partitioned; < 30k/year; Redis cache TTL 1 hour.

```json
{
  "id": "01928f7a-...-po-001",
  "code": "WO-2026-000001",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "order_number": "WO-2026-000001",
  "order_date": "2026-07-07",
  "order_type": "STANDARD",
  "order_origin": "FROM_SCHEDULE",
  "priority": "HIGH",
  "production_plan_id": "01928f7a-...-pp-001",
  "schedule_id": "01928f7a-...-sch-001",
  "schedule_line_id": "01928f7a-...-schl-001",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "product_name": "Kaju Katli 500g Premium Pack",
  "product_family_id": "01928f7a-...-fam-kaju-katli",
  "brand_id": "01928f7a-...-brand-sds",
  "uom_id": "01928f7a-...-uom-kg",
  "recipe_id": "01928f7a-...-recipe-kaju-katli",
  "recipe_version_id": "01928f7a-...-recipe-kaju-katli-v3",
  "recipe_version_number": "v3",
  "bom_id": "01928f7a-...-bom-kaju-katli",
  "bom_version_id": "01928f7a-...-bom-kaju-katli-v2",
  "planned_quantity": 50.0000,
  "actual_quantity": 0.0000,
  "planned_yield_pct": 96.50,
  "batch_size": 50.0000,
  "expected_batches": 1,
  "actual_batches": 0,
  "production_line_id": "01928f7a-...-pl-01",
  "work_center_id": "01928f7a-...-wc-sweets-01",
  "machine_id": "01928f7a-...-mac-01",
  "shift_id": "01928f7a-...-shift-a",
  "supervisor_user_id": "01928f7a-...-user-supervisor-01",
  "expected_start_datetime": "2026-07-07T08:00:00Z",
  "expected_end_datetime": "2026-07-07T16:00:00Z",
  "expected_duration_hours": 8.00,
  "material_reservation_status": "FULLY_RESERVED",
  "requires_qc": true,
  "qc_inspection_type": "FINAL",
  "qc_specification_id": "01928f7a-...-qcspec-kaju-katli",
  "estimated_material_cost": 28000.0000,
  "estimated_labor_cost": 3000.0000,
  "estimated_overhead_cost": 2000.0000,
  "estimated_total_cost": 33000.0000,
  "currency_code": "INR",
  "cost_center_id": "01928f7a-...-cc-mfg-swt",
  "approved_by": "01928f7a-...-user-mfg-head",
  "approved_at": "2026-07-06T16:00:00Z",
  "status": "MATERIAL_RESERVED",
  "version": 3,
  "tags": ["premium", "festive-stock", "fefo"]
}
```

---

## Entity 054 — Manufacturing Batch

### 1. Business Purpose

The `ManufacturingBatch` entity represents a **unique production run** — the physical batch of product manufactured during one execution of a Production Order. Per Part 7 §1:

> *"Every production transaction must be traceable from: Finished Product → Production Batch → Recipe Version → Raw Material Batch → Supplier → Purchase Order"*

The Manufacturing Batch:
- Is created when a Production Order starts production
- Links to a **Recipe Version** (immutable — per Part 7)
- Links to **ingredient batches** (raw material batches consumed — for genealogy)
- Creates an **Inventory Batch** (Entity 023) on completion
- Writes to the **Production Ledger** (per Ch 10 §10.6)
- Enables **5-minute recall** (per Ch 1 §2.8) via genealogy chain

### Critical: Manufacturing Batch vs. Inventory Batch

| Manufacturing Batch (054) | Inventory Batch (023) |
|---|---|
| Production-side concept | Inventory-side concept |
| Tracks production execution (stages, yield, operators) | Tracks stock, expiry, QC status |
| Created at production start | Created at production completion (when FG received) |
| 1 Manufacturing Batch → 1 Inventory Batch | Referenced by all inventory movements |

**They are linked**: Manufacturing Batch creates Inventory Batch on completion. Both share the same batch number and genealogy.

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Manufacturing Head |
| Data Owner | Manufacturing Head + Quality Head |
| Technical Owner | Backend Lead — Manufacturing Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `manufacturing_batches` |
| Prisma Model | `ManufacturingBatch` |
| Partitioning | Monthly by `manufacturing_date` |

### 4. Field Dictionary

#### 4.1 Universal Base + Identity Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `MB-` | Manufacturing batch code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | Yes | — | FK to facilities (PLANT) | Plant |
| `status` | ENUM | Yes | `CREATED` | CREATED, IN_PRODUCTION, PAUSED, COMPLETED, QC_PENDING, QC_PASSED, QC_FAILED, REJECTED, CLOSED, CANCELLED | Lifecycle |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `batch_number` | VARCHAR(50) | Yes | — | Unique per company+product | Batch number (e.g., `SDS-2026-000001`) | Public | Recall AI |
| `barcode_value` | VARCHAR(100) | Yes | — | Generated | Batch barcode | Public | — |
| `production_order_id` | UUID | Yes | — | FK to `production_orders.id` | Parent production order | Internal |
| `order_number` | VARCHAR(50) | No | NULL | Denormalized | Order number | Internal |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product manufactured | Internal |
| `product_family_id` | UUID | No | NULL | FK to `product_families.id` | Family | Internal |
| `brand_id` | UUID | No | NULL | FK to `brands.id` | Brand | Public |
| `recipe_version_id` | UUID | Yes | — | FK to `recipe_versions.id` | **Recipe version (immutable)** | Internal | Recipe AI |
| `bom_version_id` | UUID | Yes | — | FK to `bom_versions.id` | BOM version | Internal |

#### 4.2 Dates

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `manufacturing_date` | DATE | Yes | — | — | Manufacturing date | Public | Expiry AI |
| `manufacturing_start_time` | TIMESTAMPTZ | Yes | — | — | Production start | Internal | — |
| `manufacturing_end_time` | TIMESTAMPTZ | No | NULL | — | Production end | Internal | — |
| `production_duration_hours` | DECIMAL(8,2) | No | NULL | ≥ 0 | Duration | Internal | — |
| `expiry_date` | DATE | Yes | — | > manufacturing_date | Expiry date | Public | Expiry AI |
| `best_before_date` | DATE | No | NULL | ≤ expiry_date | Best before | Public | — |
| `shelf_life_days` | INTEGER | Yes | — | > 0 | Shelf life | Internal | — |

#### 4.3 Quantities & Yield

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `planned_quantity` | DECIMAL(18,4) | Yes | — | > 0 | Planned quantity | Internal | — |
| `actual_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Actual produced | Internal | Yield AI |
| `planned_yield_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Planned yield | Internal | — |
| `actual_yield_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Actual yield | Internal | Yield AI |
| `yield_variance_pct` | DECIMAL(5,2) | No | NULL | — | Variance | Internal | Yield AI |
| `wastage_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Wastage | Internal | Waste AI |
| `wastage_pct` | DECIMAL(5,2) | No | NULL | — | Wastage % | Internal | Waste AI |
| `wastage_reason` | TEXT | No | NULL | — | Wastage reason | Internal | — |
| `rejected_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | QC rejected | Internal | — |
| `net_quantity` | DECIMAL(18,4) | No | — | Generated: `actual_quantity - rejected_quantity` | Net good quantity | Internal | — |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM | Internal |

#### 4.4 Execution Details

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `production_line_id` | UUID | Yes | — | FK to `production_lines.id` | Production line | Internal |
| `work_center_id` | UUID | No | NULL | FK to `work_centers.id` | Work center | Internal |
| `machine_id` | UUID | No | NULL | FK to `machines.id` | Primary machine | Internal |
| `shift_id` | UUID | No | NULL | FK to `shifts.id` | Shift | Internal |
| `supervisor_user_id` | UUID | Yes | — | FK to `user_accounts.id` | Supervisor | Internal |
| `operator_user_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Operators on this batch | Internal |
| `current_stage_id` | UUID | No | NULL | FK to `production_stages.id` | Current production stage | Internal |
| `current_stage_name` | VARCHAR(100) | No | NULL | Denormalized | Stage name | Internal |
| `stage_progress_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Stage progress | Internal |
| `is_paused` | BOOLEAN | Yes | `false` | — | Currently paused | Internal |
| `pause_reason` | VARCHAR(200) | No | NULL | Required if `is_paused = true` | Pause reason | Internal |

#### 4.5 Genealogy (Traceability)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `ingredient_batch_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Raw material batches consumed | Internal | Recall AI |
| `ingredient_lot_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Supplier lots consumed | Internal | — |
| `genealogy_path` | TEXT | Yes | — | Materialized path | Full genealogy chain | Internal | Recall AI |
| `parent_batch_id` | UUID | No | NULL | FK self-ref | Parent batch (for rework) | Internal |
| `inventory_batch_id` | UUID | No | NULL | FK to `batches.id` (Entity 023) | Created inventory batch | Internal |
| `forward_trace_count` | INTEGER | No | `0` | ≥ 0 | Downstream products | Internal | — |
| `backward_trace_count` | INTEGER | No | `0` | ≥ 0 | Upstream ingredients | Internal | — |

#### 4.6 QC Status

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `qc_status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, PASSED, CONDITIONAL, FAILED, REJECTED | QC status | Confidential |
| `qc_inspection_id` | UUID | No | NULL | FK to `qc_inspections.id` | QC inspection | Confidential |
| `qc_completed_at` | TIMESTAMPTZ | No | NULL | — | QC completion | Internal |
| `qc_passed_by` | UUID | No | NULL | FK to `user_accounts.id` | QC inspector | Internal |
| `qc_failure_reason` | TEXT | No | NULL | Required if `qc_status` IN (FAILED, REJECTED) | Failure reason | Confidential |
| `recall_status` | ENUM | Yes | `NOT_RECALLED` | NOT_RECALLED, RECALLED | Recall status | Confidential |

#### 4.7 Cost

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `material_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Material cost | Confidential |
| `labor_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Labor cost | Confidential |
| `overhead_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Overhead cost | Confidential |
| `total_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Total cost | Confidential |
| `unit_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Per-unit cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |

#### 4.8 Ledger & Closure

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `production_ledger_entry_id` | UUID | No | NULL | FK to `production_ledger.id` | Ledger entry | Internal |
| `is_ledger_written` | BOOLEAN | Yes | `false` | — | Ledger entry written | Internal |
| `closed_at` | TIMESTAMPTZ | No | NULL | — | Closure timestamp | Internal |
| `closed_by` | UUID | No | NULL | FK to `user_accounts.id` | Who closed | Internal |
| `closure_reason` | VARCHAR(200) | No | NULL | — | Closure reason | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | ManufacturingBatch → Company, Facility, ProductionOrder, Product, ProductFamily, Brand, RecipeVersion, BomVersion, ProductionLine, WorkCenter, Machine, Shift, UserAccount, ProductionStage, QCInspection, Batch (inventory), ProductionLedger |
| **Index** | `uq_mb_code_company`, `uq_mb_barcode`, `idx_mb_status`, `idx_mb_product`, `idx_mb_order`, `idx_mb_date` (partition), `idx_mb_genealogy` (GIN on genealogy_path), `idx_mb_ingredient_batches` (GIN on ingredient_batch_ids), `idx_mb_qc_status`, `idx_mb_recall` |
| **Validation** | `batch_number` unique per company+product, `recipe_version_id` immutable, `expiry_date` > `manufacturing_date`, `actual_yield_pct` auto-computed, `wastage_reason` required if `wastage > 0`, on COMPLETED: write to Production Ledger + create Inventory Batch, `genealogy_path` auto-generated |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/manufacturing-batches` (GET, POST), `/api/v1/manufacturing-batches/:id` (GET, PATCH), `/api/v1/manufacturing-batches/:id/start` (POST), `/api/v1/manufacturing-batches/:id/pause` (POST), `/api/v1/manufacturing-batches/:id/resume` (POST), `/api/v1/manufacturing-batches/:id/complete` (POST — enter actual qty, yield, wastage), `/api/v1/manufacturing-batches/:id/start-qc` (POST), `/api/v1/manufacturing-batches/:id/complete-qc` (POST), `/api/v1/manufacturing-batches/:id/close` (POST), `/api/v1/manufacturing-batches/:id/genealogy` (GET), `/api/v1/manufacturing-batches/:id/stages` (GET), `/api/v1/manufacturing-batches/:id/ingredients` (GET), `/api/v1/manufacturing-batches/:id/recall-check` (POST), `/api/v1/manufacturing-batches/by-order/:orderId` (GET) |
| **UI** | Batch List, Batch Detail (tabbed: Overview, Stages, Genealogy, QC, Costs, Ledger), Batch Genealogy Tree, Batch Timeline, Yield Analysis, Wastage Analysis, Recall Console |
| **Mobile** | **Batch Scan** (start production), **Stage Completion** (scan to complete stage), **Material Verification** (scan ingredients), **Production Completion** (enter actual qty), Batch genealogy viewer, Batch QC entry |
| **Reports** | Batch History, Batch Yield Report, Batch Wastage Report, Batch Genealogy Report, Batch Cost Report, Batch Timeline, Recall Report, Batch Comparison |
| **Audit** | Full; **recipe version immutable**; mandatory reason for pause, wastage, QC failure; ledger entries hash-chained; genealogy path permanently retained |

### 13-16. Security / AI / Performance / Example

**Security**: `batch_number`, `barcode_value`, `manufacturing_date`, `expiry_date`, `product_id`, `brand_id` = Public; costs = Confidential; `qc_status`, `recall_status` = Confidential; genealogy = Internal.

**AI**: Yield Prediction AI, Wastage Prediction AI, Recipe Optimization AI, Recall AI (genealogy traversal), Expiry Prediction AI, Batch Quality AI.

**Performance**: Monthly partitioned; < 20k/year; Redis cache TTL 1 hour; genealogy lookup < 5 sec (per Ch 18 Q108).

```json
{
  "id": "01928f7a-...-mb-001",
  "code": "MB-2026-000001",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "batch_number": "SDS-2026-000001",
  "barcode_value": "SDH-PLT-01-MB-2026-000001",
  "production_order_id": "01928f7a-...-po-001",
  "order_number": "WO-2026-000001",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "product_family_id": "01928f7a-...-fam-kaju-katli",
  "brand_id": "01928f7a-...-brand-sds",
  "recipe_version_id": "01928f7a-...-recipe-kaju-katli-v3",
  "bom_version_id": "01928f7a-...-bom-kaju-katli-v2",
  "manufacturing_date": "2026-07-07",
  "manufacturing_start_time": "2026-07-07T08:30:00Z",
  "manufacturing_end_time": "2026-07-07T11:30:00Z",
  "production_duration_hours": 3.00,
  "expiry_date": "2026-07-28",
  "best_before_date": "2026-07-25",
  "shelf_life_days": 21,
  "planned_quantity": 50.0000,
  "actual_quantity": 48.2500,
  "planned_yield_pct": 96.50,
  "actual_yield_pct": 96.50,
  "yield_variance_pct": 0.00,
  "wastage_quantity": 1.7500,
  "wastage_pct": 3.50,
  "wastage_reason": "Normal production loss during cutting and packaging",
  "rejected_quantity": 0.0000,
  "net_quantity": 48.2500,
  "uom_id": "01928f7a-...-uom-kg",
  "production_line_id": "01928f7a-...-pl-01",
  "work_center_id": "01928f7a-...-wc-sweets-01",
  "machine_id": "01928f7a-...-mac-01",
  "shift_id": "01928f7a-...-shift-a",
  "supervisor_user_id": "01928f7a-...-user-supervisor-01",
  "operator_user_ids": ["01928f7a-...-user-op-01", "01928f7a-...-user-op-02"],
  "ingredient_batch_ids": [
    "01928f7a-...-batch-002",
    "01928f7a-...-batch-sugar-001",
    "01928f7a-...-batch-ghee-001"
  ],
  "genealogy_path": "SUP-MUR-2026-042 → PO-2026-001 → GRN-2026-001 → BAT-SUGAR-042 + BAT-KAJU-018 + BAT-GHEE-007 → MB-2026-000001",
  "inventory_batch_id": "01928f7a-...-batch-001",
  "qc_status": "PASSED",
  "qc_inspection_id": "01928f7a-...-qc-001",
  "qc_completed_at": "2026-07-07T14:00:00Z",
  "qc_passed_by": "01928f7a-...-user-qc-inspector",
  "recall_status": "NOT_RECALLED",
  "material_cost": 27500.0000,
  "labor_cost": 2800.0000,
  "overhead_cost": 1900.0000,
  "total_cost": 32200.0000,
  "unit_cost": 667.3554,
  "currency_code": "INR",
  "is_ledger_written": true,
  "production_ledger_entry_id": "01928f7a-...-pledger-001",
  "status": "QC_PASSED",
  "version": 5,
  "tags": ["premium", "festive-stock", "passed-qc"]
}
```

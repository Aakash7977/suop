# Manual 1 · Part 7 · Entities 51, 59 — Planning Layer (Production Plan, Manufacturing Demand)

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 7 — Manufacturing Foundation & Production Planning |
| Section | 1 — Manufacturing Foundation & Production Planning |
| Entities | Production Plan (051), Manufacturing Demand (059) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 1 §2.2, Ch 5 §5.4, Ch 14 §14.3 |
| Last Updated | 2026-07-07 |

---

## Overview — Planning Layer Architecture

The Planning Layer is the **top of the manufacturing pyramid** — strategic and tactical planning that drives operational execution:

```
MANUFACTURING DEMAND (059)
  │ — Where demand comes from (retail, restaurant, sales, forecast, AI)
  ↓
PRODUCTION PLAN (051)
  │ — Long-term plan (daily/weekly/monthly/seasonal)
  ↓
PRODUCTION SCHEDULE (052) [Batch 2]
  │ — Convert plan to executable schedule
  ↓
CAPACITY PLAN (058) [Batch 2]
  │ — Verify capacity exists
  ↓
PRODUCTION ORDER (053) [Batch 3]
  │ — Authorized manufacturing job
  ↓
MANUFACTURING BATCH (054) [Batch 3]
       — Actual production
```

### Architectural Decisions (Locked)

| Decision | Value |
|---|---|
| **Demand-driven planning** | No production without demand (per Part 7 principles) |
| **Multi-source demand** | Retail, Restaurant, Sales, Forecast, Subscriptions, Seasonal, AI |
| **Plan immutability after approval** | Historical plans immutable (per Part 7 business rules) |
| **AI-assisted planning** | Demand forecast AI feeds planning (per Ch 14 §14.3) |
| **Multi-horizon planning** | Daily, Weekly, Monthly, Seasonal, Festival, Campaign |

---

## Entity 051 — Production Plan

### 1. Business Purpose

The `ProductionPlan` entity represents **long-term manufacturing planning** — the strategic decision of what to produce, in what quantity, and over what time horizon. Per Volume 0 Chapter 5 §5.4 (Stock-to-Production), the Production Plan sits at the top of the manufacturing execution chain:

```
Production Plan → Production Schedule → Production Order → Manufacturing Batch
```

Production Plans can be:
- **Daily** — next-day production plan (most common, operational)
- **Weekly** — week-ahead plan (tactical)
- **Monthly** — month-ahead plan (strategic)
- **Seasonal** — pre-festival season buildup (e.g., Diwali sweets production 2 months ahead)
- **Festival** — specific festival campaign (e.g., Ganesh Chaturthi modak production)
- **Campaign** — long production run for a single product family (efficiency optimization)

Plans are **approved by L2 Manufacturing Head** and generate Production Schedules (Entity 052) upon approval. Approved plans are immutable — changes require a new plan version (per Part 7 business rules).

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
| Table Name | `production_plans` (header) + `production_plan_lines` (line items) |
| Prisma Models | `ProductionPlan`, `ProductionPlanLine` |
| File Location | `prisma/schema/transactional/manufacturing/production_plan.prisma` |
| Partitioning | None initially (medium volume — ~500 plans/year); future monthly partitioning |
| Lifecycle | 8-stage master data lifecycle (DRAFT → SUBMITTED → REVIEWED → APPROVED → PUBLISHED → ACTIVE → INACTIVE → ARCHIVED) |

### 4. Field Dictionary

#### 4.1 Universal Base Fields (per Part 1 §3)

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | `uuid_generate_v7()` | PK, immutable | Internal primary key |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `PP-` | Plan code (e.g., `PP-2026-000001`) |
| `company_id` | UUID | Yes | — | FK to `companies.id` | Owning company |
| `facility_id` | UUID | Yes | — | FK to `facilities.id` (PLANT type) | Manufacturing facility |
| `status` | ENUM | Yes | `DRAFT` | 8-stage master lifecycle | Plan lifecycle |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto-update | Last modification |
| `created_by` | UUID | Yes | — | FK to `user_accounts.id` | Creator (planner) |
| `updated_by` | UUID | Yes | — | FK to `user_accounts.id` | Last modifier |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft-delete timestamp |
| `version` | INTEGER | Yes | `1` | Optimistic concurrency | Increments on each update |

#### 4.2 Plan Identity Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `plan_number` | VARCHAR(50) | Yes | — | Unique per company, format `PP-{YEAR}-{SEQ}` | Display number (e.g., `PP-2026-000001`) | Public | — |
| `plan_date` | DATE | Yes | `CURRENT_DATE` | — | Plan creation date | Internal | — |
| `plan_type` | ENUM | Yes | — | DAILY, WEEKLY, MONTHLY, SEASONAL, FESTIVAL, CAMPAIGN, ADHOC | Plan type (per Part 7) | Internal | — |
| `plan_name` | VARCHAR(200) | Yes | — | Min 5, max 200 | Plan descriptive name | Public | — |
| `description` | TEXT | No | NULL | — | Detailed plan description | Internal | — |
| `planning_horizon` | ENUM | Yes | — | DAILY, WEEKLY, MONTHLY, QUARTERLY, HALF_YEARLY, ANNUAL | Planning horizon | Internal | — |
| `plan_start_date` | DATE | Yes | — | ≥ plan_date | Plan period start | Internal | — |
| `plan_end_date` | DATE | Yes | — | > plan_start_date | Plan period end | Internal | — |
| `plan_duration_days` | INTEGER | No | — | Generated: `plan_end_date - plan_start_date` | Duration in days | Internal | — |

#### 4.3 Planner & Approval Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `planner_user_id` | UUID | Yes | — | FK to `user_accounts.id` | Production planner | Internal |
| `planner_name` | VARCHAR(150) | No | NULL | Denormalized | Planner name | Internal |
| `department_id` | UUID | Yes | — | FK to `departments.id` | Manufacturing department | Internal |
| `business_unit_id` | UUID | No | NULL | FK to `business_units.id` | Manufacturing BU | Internal |
| `brand_id` | UUID | No | NULL | FK to `brands.id`; NULL = multi-brand plan | Brand scope | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts.id`; L2+ required | Approver | Internal |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `approval_comments` | TEXT | No | NULL | — | Approval comments | Internal |
| `rejected_reason` | TEXT | No | NULL | Required if status = REJECTED | Rejection reason | Internal |
| `rejected_by` | UUID | No | NULL | FK to `user_accounts.id` | Who rejected | Internal |

#### 4.4 Demand Source Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `demand_source` | ENUM | Yes | `MANUAL` | MANUAL, SALES_FORECAST, RETAIL_DEMAND, RESTAURANT_DEMAND, SUBSCRIPTION, SEASONAL_PLANNING, AI_PREDICTION, MRP_RUN, COMBINED | Demand source (per Part 7) | Internal | Demand AI |
| `demand_source_id` | UUID | No | NULL | FK to source | Source document ID | Internal | — |
| `demand_source_name` | VARCHAR(200) | No | NULL | — | Source description | Internal | — |
| `forecast_confidence_pct` | DECIMAL(5,2) | No | NULL | 0–100 | AI forecast confidence | Confidential | Demand AI |
| `is_ai_generated` | BOOLEAN | Yes | `false` | — | Whether AI generated this plan | Internal | — |
| `ai_model_id` | UUID | No | NULL | FK to `ai_models.id` | AI model used (per Ch 10 §10.16) | Internal | — |
| `ai_prediction_id` | UUID | No | NULL | FK to `ai_predictions.id` | AI prediction reference | Internal | — |

#### 4.5 Summary Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `total_lines` | INTEGER | Yes | `0` | ≥ 0 | Number of plan lines (products) | Internal |
| `total_planned_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total planned quantity across all lines | Internal |
| `total_planned_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total planned value | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Currency | Internal |
| `total_estimated_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total estimated production cost | Confidential |
| `estimated_margin_pct` | DECIMAL(5,2) | No | NULL | — | Estimated margin % | Confidential |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT, CRITICAL | Plan priority | Internal |

#### 4.6 Execution Tracking Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `schedule_id` | UUID | No | NULL | FK to `production_schedules.id` | Generated schedule | Internal |
| `schedule_generated_at` | TIMESTAMPTZ | No | NULL | — | When schedule generated | Internal |
| `total_orders_generated` | INTEGER | Yes | `0` | ≥ 0 | Production orders generated | Internal |
| `total_quantity_produced` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Actual quantity produced (denormalized) | Internal |
| `production_completion_pct` | DECIMAL(5,2) | No | — | Generated: `(total_quantity_produced / total_planned_quantity) * 100` | Completion % | Internal |
| `is_fully_executed` | BOOLEAN | Yes | `false` | — | Fully executed flag | Internal |
| `closed_at` | TIMESTAMPTZ | No | NULL | — | Closure timestamp | Internal |
| `closure_reason` | VARCHAR(200) | No | NULL | Required if status = CLOSED | Closure reason | Internal |

#### 4.7 Seasonal/Campaign Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `season_name` | VARCHAR(100) | No | NULL | — | Season name (e.g., "Diwali 2026") | Internal |
| `festival_name` | VARCHAR(100) | No | NULL | — | Festival name | Internal |
| `campaign_name` | VARCHAR(100) | No | NULL | — | Campaign name | Internal |
| `expected_demand_spike_pct` | DECIMAL(5,2) | No | NULL | — | Expected demand spike % vs normal | Internal |
| `pre_build_days` | INTEGER | No | NULL | ≥ 0 | Pre-build days before peak | Internal |

#### 4.8 Custom Fields & Annotations

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `custom_fields` | JSONB | No | `'{}'::JSONB` | — | Custom fields | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Filterable annotations | Internal |

#### 4.9 Plan Line Items (production_plan_lines)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `plan_id` | UUID | Yes | — | FK to `production_plans.id` | Parent plan |
| `line_number` | INTEGER | Yes | — | > 0, unique per plan | Line number |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product to manufacture |
| `product_family_id` | UUID | No | NULL | FK to `product_families.id` | Product family |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM |
| `planned_quantity` | DECIMAL(18,4) | Yes | — | > 0 | Planned quantity |
| `estimated_unit_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Estimated unit cost |
| `estimated_line_value` | DECIMAL(18,4) | No | — | Generated: `planned_quantity * estimated_unit_cost` | Estimated value |
| `required_by_date` | DATE | Yes | — | Within plan period | Required completion date |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT | Line priority |
| `production_line_id` | UUID | No | NULL | FK to `production_lines.id` | Suggested production line |
| `recipe_id` | UUID | No | NULL | FK to `recipes.id` | Suggested recipe |
| `shift_pattern` | ENUM | No | NULL | SINGLE, DOUBLE, TRIPLE | Suggested shift |
| `demand_source` | ENUM | No | NULL | Same as header demand_source | Line-specific demand source |
| `demand_quantity` | DECIMAL(18,4) | No | NULL | ≥ 0 | Demand driving this line |
| `current_stock` | DECIMAL(18,4) | No | NULL | ≥ 0 | Current stock at planning time |
| `net_requirement` | DECIMAL(18,4) | No | — | Generated: `demand_quantity - current_stock` | Net production requirement |
| `quantity_scheduled` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Quantity scheduled (denormalized) |
| `quantity_produced` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Quantity actually produced |
| `line_status` | ENUM | Yes | `DRAFT` | DRAFT, APPROVED, SCHEDULED, IN_PRODUCTION, COMPLETED, PARTIALLY_COMPLETED, CANCELLED | Line status |
| `line_remarks` | TEXT | No | NULL | — | Line annotation |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| ProductionPlan → Company, Facility, Department, BusinessUnit, Brand, UserAccount (planner, approver) | N : 1 each | various | RESTRICT |
| ProductionPlan → ProductionSchedule | 1 : 1 | `schedule_id` | SET NULL |
| ProductionPlan → ProductionPlanLine | 1 : N | `production_plan_lines.plan_id` | CASCADE |
| ProductionPlan → AiModel, AiPrediction | N : 1 each | various | SET NULL |
| ProductionPlanLine → Product, ProductFamily, UOM, ProductionLine, Recipe | N : 1 each | various | SET NULL |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_production_plans` | PK | `id` |
| `uq_pp_code_company` | UNIQUE | `company_id, code` |
| `uq_pp_number_company` | UNIQUE | `company_id, plan_number` |
| `idx_pp_status` | B-TREE | `status, plan_date DESC` |
| `idx_pp_facility` | B-TREE | `facility_id, plan_start_date` |
| `idx_pp_planner` | B-TREE | `planner_user_id, plan_date DESC` |
| `idx_pp_type` | B-TREE | `plan_type, plan_start_date` |
| `idx_pp_period` | B-TREE | `plan_start_date, plan_end_date` |
| `idx_pp_seasonal` | PARTIAL | `company_id WHERE plan_type IN ('SEASONAL', 'FESTIVAL', 'CAMPAIGN')` |
| `idx_pp_ai_generated` | PARTIAL | `company_id WHERE is_ai_generated = true` |
| `pk_production_plan_lines` | PK | `id` |
| `idx_ppl_plan` | B-TREE | `plan_id, line_number` |
| `idx_ppl_product` | B-TREE | `product_id` |
| `idx_ppl_status` | B-TREE | `line_status` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `code` unique per company | DB |
| 2 | `plan_number` unique per company | DB |
| 3 | `plan_end_date` > `plan_start_date` | DB CHECK |
| 4 | At least 1 line item before SUBMITTED | App |
| 5 | `planned_quantity` > 0 on each line | DB CHECK |
| 6 | `required_by_date` within plan period | App |
| 7 | Approval required (L2+) before ACTIVE | App |
| 8 | **Approved plans immutable** — changes require new plan version (per Part 7 business rules) | App |
| 9 | Approved plans generate Production Schedule | App |
| 10 | `facility_id` must be PLANT type | App |
| 11 | `net_requirement` must equal `demand_quantity - current_stock` | App |
| 12 | `production_completion_pct` auto-computed | App |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/production-plans` (GET, POST), `/api/v1/production-plans/:id` (GET, PATCH), `/api/v1/production-plans/:id/lines` (GET, POST), `/api/v1/production-plans/:id/submit` (POST), `/api/v1/production-plans/:id/approve` (POST), `/api/v1/production-plans/:id/reject` (POST), `/api/v1/production-plans/:id/generate-schedule` (POST), `/api/v1/production-plans/:id/close` (POST), `/api/v1/production-plans/by-period` (GET), `/api/v1/production-plans/seasonal` (GET), `/api/v1/production-plans/ai-generated` (GET) |
| **UI** | Plan List, Plan Detail (with lines + schedule + execution), Plan Create Wizard (multi-line), Approval Queue, Seasonal Planning Dashboard, AI-Generated Plans Review, Plan vs Actual Dashboard |
| **Mobile** | Plan approval (L2+), plan status tracking, urgent plan alerts |
| **Reports** | Production Plan Report, Plan vs Actual, Seasonal Plan Performance, Plan Completion Rate, AI Plan Accuracy, Campaign Performance |
| **Audit** | Full; **approved plans immutable** (per Part 7); mandatory reason for rejection, closure |

### 13-16. Security / AI / Performance / Example

**Security**: `plan_number`, `plan_date`, `plan_type`, `plan_name` = Public; `total_planned_value`, `estimated_*` = Confidential; `is_ai_generated`, `ai_model_id` = Internal.

**AI**: Demand Forecast AI (generates plans), Capacity Optimization AI, Production Sequencing AI, Seasonal Demand AI, Campaign Optimization AI.

**Performance**: < 500/year; Redis cache TTL 1 hour.

```json
{
  "header": {
    "id": "01928f7a-...-pp-001",
    "code": "PP-2026-000001",
    "company_id": "01928f7a-...-company",
    "facility_id": "01928f7a-...-plt-01",
    "plan_number": "PP-2026-000001",
    "plan_date": "2026-07-01",
    "plan_type": "WEEKLY",
    "plan_name": "Week 28 Production Plan - Sweets & Namkeen",
    "description": "Weekly production plan for July 7-13, 2026. Covers regular demand plus pre-Diwali buildup for Kaju Katli.",
    "planning_horizon": "WEEKLY",
    "plan_start_date": "2026-07-07",
    "plan_end_date": "2026-07-13",
    "plan_duration_days": 7,
    "planner_user_id": "01928f7a-...-user-planner",
    "planner_name": "Anita Desai",
    "department_id": "01928f7a-...-dept-mfg-pune",
    "business_unit_id": "01928f7a-...-bu-mfg",
    "brand_id": null,
    "demand_source": "COMBINED",
    "forecast_confidence_pct": 87.50,
    "is_ai_generated": true,
    "ai_model_id": "01928f7a-...-ai-demand-forecast-v1",
    "ai_prediction_id": "01928f7a-...-ai-pred-001",
    "total_lines": 5,
    "total_planned_quantity": 1250.0000,
    "total_planned_value": 850000.0000,
    "currency_code": "INR",
    "total_estimated_cost": 595000.0000,
    "estimated_margin_pct": 30.00,
    "priority": "HIGH",
    "approved_by": "01928f7a-...-user-mfg-head",
    "approved_at": "2026-07-01T16:00:00Z",
    "total_orders_generated": 5,
    "total_quantity_produced": 0.0000,
    "production_completion_pct": 0.00,
    "is_fully_executed": false,
    "status": "ACTIVE",
    "version": 2,
    "tags": ["ai-generated", "weekly", "pre-diwali"]
  },
  "lines": [
    {
      "id": "01928f7a-...-ppl-001",
      "plan_id": "01928f7a-...-pp-001",
      "line_number": 1,
      "product_id": "01928f7a-...-prod-kaju-katli-500",
      "product_family_id": "01928f7a-...-fam-kaju-katli",
      "uom_id": "01928f7a-...-uom-kg",
      "planned_quantity": 300.0000,
      "estimated_unit_cost": 580.0000,
      "estimated_line_value": 174000.0000,
      "required_by_date": "2026-07-10",
      "priority": "HIGH",
      "recipe_id": "01928f7a-...-recipe-kaju-katli-v3",
      "shift_pattern": "DOUBLE",
      "demand_source": "RETAIL_DEMAND",
      "demand_quantity": 350.0000,
      "current_stock": 42.5000,
      "net_requirement": 307.5000,
      "quantity_scheduled": 300.0000,
      "quantity_produced": 0.0000,
      "line_status": "SCHEDULED"
    }
  ]
}
```

---

## Entity 059 — Manufacturing Demand

### 1. Business Purpose

The `ManufacturingDemand` entity represents **demand for manufactured products** — the signal that triggers production planning. Per Part 7 §2 (Enterprise Manufacturing Architecture), demand flows from multiple sources:

```
Retail Demand → Manufacturing Demand
Restaurant Demand → Manufacturing Demand
Sales Forecast → Manufacturing Demand
Subscriptions → Manufacturing Demand
Seasonal Planning → Manufacturing Demand
AI Prediction → Manufacturing Demand
```

Manufacturing Demand aggregates all these sources into a **unified demand signal** that feeds Production Planning (Entity 051). Without this aggregation, planners would need to manually check multiple systems — leading to overproduction or stockouts.

### Demand Sources

| Source | Description | Example |
|---|---|---|
| **RETAIL_DEMAND** | Replenishment requests from Sudhamrit stores | Store 4 needs 50kg Kaju Katli |
| **RESTAURANT_DEMAND** | Kitchen consumption forecasts from Food Joints | Outlet 2 needs 20kg Gulab Jamun batter |
| **SALES_FORECAST** | AI-predicted sales based on historical data | Demand forecast: 500kg Kaju Katli next week |
| **SUBSCRIPTION** | Recurring subscription orders | Monthly sweet box subscription: 100 boxes |
| **SEASONAL_PLANNING** | Pre-festival/season buildup | Diwali: 2000kg Kaju Katli over 2 months |
| **AI_PREDICTION** | AI demand prediction (per Ch 14 §14.3) | AI predicts 12% demand spike this weekend |
| **MRP_RUN** | Material Requirements Planning output | MRP calculates net requirement after subtracting stock |
| **MANUAL** | Planner-created demand | Planner adds ad-hoc demand for new product launch |

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
| Table Name | `manufacturing_demands` (header) + `manufacturing_demand_lines` (line items) |
| Prisma Models | `ManufacturingDemand`, `ManufacturingDemandLine` |
| Partitioning | Monthly by `demand_date` (high volume — daily demand from multiple sources) |

### 4. Field Dictionary

#### 4.1 Universal Base + Demand Header Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `MD-` | Demand code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | Yes | — | FK to facilities (PLANT) | Manufacturing facility |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, CONSUMED, PARTIALLY_CONSUMED, EXPIRED, CANCELLED | Demand lifecycle |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `demand_number` | VARCHAR(50) | Yes | — | Display number | Public |
| `demand_date` | DATE | Yes | `CURRENT_DATE` | — | Demand date (for partitioning) | Internal |
| `demand_type` | ENUM | Yes | — | RETAIL_DEMAND, RESTAURANT_DEMAND, SALES_FORECAST, SUBSCRIPTION, SEASONAL_PLANNING, AI_PREDICTION, MRP_RUN, MANUAL, COMBINED | Demand source type (per Part 7) | Internal | Demand AI |
| `demand_name` | VARCHAR(200) | Yes | — | Min 5 | Descriptive name | Public |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `planning_horizon` | ENUM | Yes | `WEEKLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY | Demand horizon | Internal |
| `demand_start_date` | DATE | Yes | — | — | Demand period start | Internal |
| `demand_end_date` | DATE | Yes | — | > demand_start_date | Demand period end | Internal |
| `source_system` | VARCHAR(50) | No | NULL | — | Source system (POS, MRP, AI, etc.) | Internal |
| `source_document_type` | VARCHAR(30) | No | NULL | — | Source document type | Internal |
| `source_document_id` | UUID | No | NULL | FK to source | Source document ID | Internal |
| `source_document_number` | VARCHAR(50) | No | NULL | — | Source document number | Internal |
| `is_ai_generated` | BOOLEAN | Yes | `false` | — | AI-generated demand | Internal | Demand AI |
| `ai_model_id` | UUID | No | NULL | FK to `ai_models.id` | AI model | Internal | — |
| `ai_prediction_id` | UUID | No | NULL | FK to `ai_predictions.id` | AI prediction | Internal | — |
| `forecast_confidence_pct` | DECIMAL(5,2) | No | NULL | 0–100 | AI confidence | Confidential | Demand AI |
| `total_lines` | INTEGER | Yes | `0` | ≥ 0 | Number of demand lines | Internal |
| `total_demand_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total demand | Internal |
| `total_demand_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total demand value | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `consumed_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Quantity consumed by production plans | Internal |
| `remaining_quantity` | DECIMAL(18,4) | No | — | Generated: `total_demand_quantity - consumed_quantity` | Remaining demand | Internal |
| `consumption_pct` | DECIMAL(5,2) | No | — | Generated | Consumption % | Internal |
| `production_plan_id` | UUID | No | NULL | FK to `production_plans.id` | Generated production plan | Internal |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT, CRITICAL | Demand priority | Internal |
| `expires_at` | TIMESTAMPTZ | No | NULL | — | Demand expiry | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

#### 4.2 Demand Lines

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `demand_id` | UUID | Yes | — | FK to `manufacturing_demands.id` | Parent demand |
| `line_number` | INTEGER | Yes | — | > 0, unique per demand | Line number |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product demanded |
| `product_family_id` | UUID | No | NULL | FK to `product_families.id` | Family |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM |
| `demand_quantity` | DECIMAL(18,4) | Yes | — | > 0 | Demand quantity |
| `current_stock` | DECIMAL(18,4) | No | NULL | ≥ 0 | Current stock |
| `net_requirement` | DECIMAL(18,4) | No | — | Generated: `demand_quantity - current_stock` | Net requirement |
| `required_by_date` | DATE | Yes | — | Within demand period | Required date |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT | Line priority |
| `source_facility_id` | UUID | No | NULL | FK to `facilities.id` | Source facility (e.g., retail store) |
| `consumed_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Consumed by plan |
| `line_status` | ENUM | Yes | `ACTIVE` | ACTIVE, PARTIALLY_CONSUMED, FULLY_CONSUMED, EXPIRED, CANCELLED | Line status |
| `line_remarks` | TEXT | No | NULL | — | Annotation |

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | ManufacturingDemand → Company, Facility, ProductionPlan, AiModel, AiPrediction; DemandLine → Demand, Product, ProductFamily, UOM, Facility |
| **Index** | `uq_md_code_company`, `idx_md_date` (partition), `idx_md_type`, `idx_md_status`, `idx_md_source`, `idx_md_ai_generated`, `idx_md_expiring`, `idx_mdl_demand`, `idx_mdl_product` |
| **Validation** | `demand_end_date` > `demand_start_date`, `demand_quantity` > 0, `net_requirement` = `demand_quantity - current_stock`, `consumed_quantity` ≤ `demand_quantity` |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/manufacturing-demands` (GET, POST), `/api/v1/manufacturing-demands/:id` (GET, PATCH), `/api/v1/manufacturing-demands/:id/lines` (GET), `/api/v1/manufacturing-demands/by-source/:source` (GET), `/api/v1/manufacturing-demands/by-period` (GET), `/api/v1/manufacturing-demands/ai-generated` (GET), `/api/v1/manufacturing-demands/convert-to-plan` (POST), `/api/v1/manufacturing-demands/aggregate` (POST — aggregate multiple demands) |
| **UI** | Demand List, Demand Detail (with lines), Demand Aggregation Dashboard, AI Demand Forecast View, Demand vs Plan Comparison, Demand Source Analysis |
| **Mobile** | Demand alerts (L2+), urgent demand notifications |
| **Reports** | Demand Forecast Accuracy, Demand by Source, Demand Trends, Seasonal Demand Patterns, AI vs Actual Demand, Demand Consumption Rate |
| **Audit** | Full; AI-generated demands tracked with model version |

### 13-16. Security / AI / Performance / Example

**Security**: `demand_number`, `demand_date`, `demand_type` = Public; `total_demand_value`, `forecast_confidence_pct` = Confidential.

**AI**: Demand Prediction AI (primary — per Ch 14 §14.3), Seasonal Demand AI, Demand Aggregation AI, Demand Accuracy AI (compares forecast vs actual).

**Performance**: < 5k/year; monthly partitioned; Redis cache TTL 1 hour.

```json
{
  "header": {
    "id": "01928f7a-...-md-001",
    "code": "MD-2026-000001",
    "company_id": "01928f7a-...-company",
    "facility_id": "01928f7a-...-plt-01",
    "demand_number": "MD-2026-000001",
    "demand_date": "2026-07-01",
    "demand_type": "AI_PREDICTION",
    "demand_name": "AI Demand Forecast - Week 28",
    "description": "AI-predicted demand for July 7-13, 2026 based on historical sales, seasonality, and festival calendar",
    "planning_horizon": "WEEKLY",
    "demand_start_date": "2026-07-07",
    "demand_end_date": "2026-07-13",
    "source_system": "AI_DEMAND_FORECAST_V1",
    "is_ai_generated": true,
    "ai_model_id": "01928f7a-...-ai-demand-forecast-v1",
    "ai_prediction_id": "01928f7a-...-ai-pred-001",
    "forecast_confidence_pct": 87.50,
    "total_lines": 5,
    "total_demand_quantity": 1450.0000,
    "total_demand_value": 985000.0000,
    "currency_code": "INR",
    "consumed_quantity": 1250.0000,
    "remaining_quantity": 200.0000,
    "consumption_pct": 86.21,
    "production_plan_id": "01928f7a-...-pp-001",
    "priority": "HIGH",
    "status": "PARTIALLY_CONSUMED",
    "version": 3
  },
  "lines": [
    {
      "id": "01928f7a-...-mdl-001",
      "demand_id": "01928f7a-...-md-001",
      "line_number": 1,
      "product_id": "01928f7a-...-prod-kaju-katli-500",
      "product_family_id": "01928f7a-...-fam-kaju-katli",
      "uom_id": "01928f7a-...-uom-kg",
      "demand_quantity": 350.0000,
      "current_stock": 42.5000,
      "net_requirement": 307.5000,
      "required_by_date": "2026-07-10",
      "priority": "HIGH",
      "consumed_quantity": 300.0000,
      "line_status": "PARTIALLY_CONSUMED"
    }
  ]
}
```

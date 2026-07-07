# Manual 1 · Part 7 · Entities 52, 56, 57, 58 — Scheduling Layer

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 7 — Manufacturing Foundation & Production Planning |
| Section | 1 — Manufacturing Foundation & Production Planning |
| Entities | Production Schedule (052), Production Calendar (056), Shift Schedule (057), Capacity Plan (058) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## Overview — Scheduling Layer Architecture

The Scheduling Layer converts **approved plans into executable schedules** while verifying capacity:

```
PRODUCTION PLAN (051) — Approved
        ↓ Generate
PRODUCTION SCHEDULE (052) — Executable schedule
        ↓ Validates against
CAPACITY PLAN (058) — Available capacity
        ↓ Constrained by
PRODUCTION CALENDAR (056) — Working days, holidays, maintenance
        ↓ Executed in
SHIFT SCHEDULE (057) — Shift patterns, labor allocation
```

### Architectural Decisions (Locked)

| Decision | Value |
|---|---|
| **Multiple scheduling modes** | Finite, Infinite, Manual, AI scheduling (per Part 7) |
| **Calendar-driven** | Production only on working days (per Entity 056) |
| **Shift-aware** | All schedules reference shifts (per Entity 057) |
| **Capacity-constrained** | Schedules validated against available capacity (per Entity 058) |
| **AI scheduling ready** | `is_ai_scheduled` flag + AI model reference |

---

## Entity 052 — Production Schedule

### 1. Business Purpose

The `ProductionSchedule` entity **converts approved Production Plans into executable schedules** — assigning specific dates, shifts, production lines, machines, and supervisors to each production job. Per Part 7 §2, the schedule is the bridge between strategic planning and operational execution.

Per Part 7, supports 4 scheduling modes:
- **Finite Scheduling** — Respects capacity constraints; may delay jobs if capacity full
- **Infinite Scheduling** — Ignores capacity; assumes infinite capacity (for rough planning)
- **Manual Scheduling** — Planner manually assigns slots
- **AI Scheduling** — AI optimizes schedule for efficiency (per Ch 14 §14.3)

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
| Table Name | `production_schedules` (header) + `production_schedule_lines` (line items) |
| Prisma Models | `ProductionSchedule`, `ProductionScheduleLine` |
| Lifecycle | 8-stage lifecycle (DRAFT → SUBMITTED → APPROVED → ACTIVE → COMPLETED → CLOSED) |

### 4. Field Dictionary

#### 4.1 Universal Base + Schedule Header Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `SCH-` | Schedule code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | Yes | — | FK to facilities (PLANT) | Plant |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SUBMITTED, APPROVED, ACTIVE, COMPLETED, CLOSED, CANCELLED | Lifecycle |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `schedule_number` | VARCHAR(50) | Yes | — | Display number | Public |
| `schedule_date` | DATE | Yes | `CURRENT_DATE` | — | Schedule creation date | Internal |
| `schedule_name` | VARCHAR(200) | Yes | — | Min 5 | Schedule name | Public |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `production_plan_id` | UUID | Yes | — | FK to `production_plans.id` | Source plan | Internal |
| `plan_number` | VARCHAR(50) | No | NULL | Denormalized | Plan number | Internal |
| `scheduling_mode` | ENUM | Yes | `FINITE` | FINITE, INFINITE, MANUAL, AI_SCHEDULING | Scheduling mode (per Part 7) | Internal | Scheduling AI |
| `is_ai_scheduled` | BOOLEAN | Yes | `false` | — | AI-generated schedule | Internal | — |
| `ai_model_id` | UUID | No | NULL | FK to `ai_models.id` | AI model | Internal | — |
| `schedule_start_date` | DATE | Yes | — | — | Schedule period start | Internal |
| `schedule_end_date` | DATE | Yes | — | > schedule_start_date | Schedule period end | Internal |
| `planner_user_id` | UUID | Yes | — | FK to `user_accounts.id` | Scheduler | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts.id` | Approver | Internal |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `total_lines` | INTEGER | Yes | `0` | ≥ 0 | Scheduled jobs | Internal |
| `total_scheduled_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total scheduled | Internal |
| `total_scheduled_hours` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Total scheduled hours | Internal |
| `capacity_utilization_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Capacity utilization | Internal | Capacity AI |
| `total_orders_generated` | INTEGER | Yes | `0` | ≥ 0 | Production orders generated | Internal |
| `is_capacity_validated` | BOOLEAN | Yes | `false` | — | Validated against capacity | Internal |
| `capacity_validation_result` | JSONB | No | NULL | — | Validation details | Internal |
| `has_capacity_conflicts` | BOOLEAN | Yes | `false` | — | Capacity conflicts | Internal |
| `conflict_count` | INTEGER | Yes | `0` | ≥ 0 | Number of conflicts | Internal |
| `optimization_score` | DECIMAL(5,2) | No | NULL | 0–100 | AI optimization score | Internal | Scheduling AI |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

#### 4.2 Schedule Lines (Scheduled Jobs)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `schedule_id` | UUID | Yes | — | FK to `production_schedules.id` | Parent schedule |
| `line_number` | INTEGER | Yes | — | > 0, unique per schedule | Line number |
| `plan_line_id` | UUID | No | NULL | FK to `production_plan_lines.id` | Source plan line |
| `product_id` | UUID | Yes | — | FK to `products.id` | Product to manufacture |
| `uom_id` | UUID | Yes | — | FK to `uoms.id` | UOM |
| `scheduled_quantity` | DECIMAL(18,4) | Yes | — | > 0 | Scheduled quantity |
| `production_date` | DATE | Yes | — | Within schedule period | Production date |
| `shift_id` | UUID | Yes | — | FK to `shifts.id` | Shift | Internal |
| `production_line_id` | UUID | Yes | — | FK to `production_lines.id` | Production line | Internal |
| `machine_id` | UUID | No | NULL | FK to `machines.id` | Machine assignment | Internal |
| `work_center_id` | UUID | No | NULL | FK to `work_centers.id` | Work center | Internal |
| `supervisor_user_id` | UUID | Yes | — | FK to `user_accounts.id` | Shift supervisor | Internal |
| `expected_start_time` | TIMESTAMPTZ | Yes | — | — | Expected start | Internal |
| `expected_end_time` | TIMESTAMPTZ | Yes | — | > expected_start_time | Expected end | Internal |
| `expected_duration_hours` | DECIMAL(8,2) | Yes | — | > 0 | Expected duration | Internal |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT | Job priority | Internal |
| `recipe_id` | UUID | No | NULL | FK to `recipes.id` | Recipe to use | Internal |
| `production_order_id` | UUID | No | NULL | FK to `production_orders.id` | Generated production order | Internal |
| `line_status` | ENUM | Yes | `SCHEDULED` | SCHEDULED, ORDER_GENERATED, IN_PROGRESS, COMPLETED, DELAYED, CANCELLED | Line status | Internal |
| `has_conflict` | BOOLEAN | Yes | `false` | — | Has scheduling conflict | Internal |
| `conflict_type` | VARCHAR(50) | No | NULL | — | Conflict type (CAPACITY, MACHINE, LABOR, MATERIAL) | Internal |
| `conflict_resolution` | TEXT | No | NULL | — | How conflict resolved | Internal |
| `line_remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | ProductionSchedule → Company, Facility, ProductionPlan, UserAccount (planner, approver), AiModel; ScheduleLine → Schedule, PlanLine, Product, UOM, Shift, ProductionLine, Machine, WorkCenter, UserAccount (supervisor), Recipe, ProductionOrder |
| **Index** | `uq_sch_code_company`, `idx_sch_status`, `idx_sch_plan`, `idx_sch_period`, `idx_sch_ai_scheduled`, `idx_schl_schedule`, `idx_schl_date`, `idx_schl_line`, `idx_schl_supervisor` |
| **Validation** | `schedule_end_date` > `schedule_start_date`, `scheduled_quantity` > 0, `expected_end_time` > `expected_start_time`, production_date within schedule period, shift must be active on production_date, capacity validation required for FINITE mode, conflicts must be resolved before APPROVED |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/production-schedules` (GET, POST), `/api/v1/production-schedules/:id` (GET, PATCH), `/api/v1/production-schedules/:id/lines` (GET, POST), `/api/v1/production-schedules/:id/submit` (POST), `/api/v1/production-schedules/:id/approve` (POST), `/api/v1/production-schedules/:id/validate-capacity` (POST), `/api/v1/production-schedules/:id/generate-orders` (POST), `/api/v1/production-schedules/:id/optimize` (POST — AI optimization), `/api/v1/production-schedules/by-date/:date` (GET), `/api/v1/production-schedules/by-line/:lineId` (GET) |
| **UI** | Schedule List, Schedule Detail (Gantt chart view), Scheduling Gantt (visual timeline), Capacity Validation Board, Conflict Resolution, AI Optimization Dashboard, Daily/Weekly/Monthly Schedule View |
| **Mobile** | Schedule view (supervisors), conflict alerts, schedule changes |
| **Reports** | Production Schedule Report, Capacity Utilization, Schedule Adherence, Conflict Analysis, AI Schedule Accuracy, Schedule vs Actual |
| **Audit** | Full; mandatory reason for cancellation, conflict resolution, manual override of AI schedule |

### 13-16. Security / AI / Performance / Example

**Security**: `schedule_number`, `schedule_date` = Public; `capacity_utilization_pct`, `optimization_score` = Internal; scheduling details = Internal.

**AI**: Production Scheduling AI (optimizes schedule), Capacity Optimization AI, Conflict Resolution AI, Sequencing AI.

**Performance**: < 1k/year; Redis cache TTL 1 hour.

```json
{
  "header": {
    "id": "01928f7a-...-sch-001",
    "code": "SCH-2026-000001",
    "company_id": "01928f7a-...-company",
    "facility_id": "01928f7a-...-plt-01",
    "schedule_number": "SCH-2026-000001",
    "schedule_date": "2026-07-01",
    "schedule_name": "Week 28 Production Schedule",
    "production_plan_id": "01928f7a-...-pp-001",
    "plan_number": "PP-2026-000001",
    "scheduling_mode": "AI_SCHEDULING",
    "is_ai_scheduled": true,
    "ai_model_id": "01928f7a-...-ai-scheduling-v1",
    "schedule_start_date": "2026-07-07",
    "schedule_end_date": "2026-07-13",
    "planner_user_id": "01928f7a-...-user-planner",
    "approved_by": "01928f7a-...-user-mfg-head",
    "approved_at": "2026-07-02T10:00:00Z",
    "total_lines": 8,
    "total_scheduled_quantity": 1250.0000,
    "total_scheduled_hours": 168.00,
    "capacity_utilization_pct": 82.50,
    "is_capacity_validated": true,
    "has_capacity_conflicts": false,
    "optimization_score": 91.50,
    "total_orders_generated": 5,
    "status": "ACTIVE",
    "version": 2
  }
}
```

---

## Entity 056 — Production Calendar

### 1. Business Purpose

The `ProductionCalendar` entity defines **working days, holidays, maintenance shutdowns, and peak demand periods** for manufacturing. Per Part 7 §3, production follows the calendar — no production on non-working days. Per Entity A.15 (Part 2), the Calendar entity already exists for general operations; the Production Calendar is a **specialization** that adds manufacturing-specific attributes.

### 2-4. Owner / Schema / Fields (Summary)

| Owner | L2 — Manufacturing Head |
|---|---|
| Schema | `master` |
| Table | `production_calendars` (extends `calendars` from Part 2 A.15) |

**Production-specific extension fields** (added to Calendar entity from Part 2):

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `production_lines_active` | INTEGER | Yes | `0` | ≥ 0 | Active production lines | Internal |
| `shift_pattern` | ENUM | Yes | `DOUBLE_SHIFT` | SINGLE, DOUBLE, TRIPLE, CONTINUOUS | Shift pattern for calendar | Internal |
| `planned_shutdown_periods` | JSONB | No | NULL | — | Array of `{ start_date, end_date, reason }` | Internal |
| `maintenance_windows` | JSONB | No | NULL | — | Array of `{ start, end, line_id, type }` | Internal |
| `peak_demand_periods` | JSONB | No | NULL | — | Array of `{ start_date, end_date, product_family_id, expected_spike_pct }` | Internal |
| `festival_campaigns` | JSONB | No | NULL | — | Array of `{ name, start_date, end_date, product_lines }` | Internal |
| `capacity_override` | JSONB | No | NULL | — | Per-date capacity overrides | Internal |
| `is_maintenance_day` | BOOLEAN | Yes | `false` | — | Maintenance-only day (no production) | Internal |

### 5-16. Relationships / Index / Validation / API / UI / Mobile / Reports / Audit / Security / AI / Performance / Example

Standard calendar entity (per Part 2 A.15) with production-specific extensions. Production schedules validate against this calendar — no production on non-working days, maintenance windows reserved, peak demand periods trigger pre-build.

```json
{
  "id": "01928f7a-...-pcal-001",
  "code": "PCAL-2026-PUN",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "name": "Pune Factory Production Calendar 2026",
  "year": 2026,
  "production_lines_active": 4,
  "shift_pattern": "DOUBLE_SHIFT",
  "planned_shutdown_periods": [
    { "start_date": "2026-08-15", "end_date": "2026-08-16", "reason": "Independence Day extended weekend" }
  ],
  "maintenance_windows": [
    { "start": "2026-07-15T22:00:00Z", "end": "2026-07-16T06:00:00Z", "line_id": "01928f7a-...-pl-01", "type": "PREVENTIVE" }
  ],
  "peak_demand_periods": [
    { "start_date": "2026-10-01", "end_date": "2026-10-31", "product_family_id": "01928f7a-...-fam-kaju-katli", "expected_spike_pct": 250.00 }
  ],
  "festival_campaigns": [
    { "name": "Diwali 2026", "start_date": "2026-10-15", "end_date": "2026-11-05", "product_lines": ["SWEETS", "NAMEKEEN"] }
  ],
  "status": "ACTIVE"
}
```

---

## Entity 057 — Shift Schedule

### 1. Business Purpose

The `ShiftSchedule` entity defines **shift assignments for production** — which operators work which shift, on which machine, under which supervisor. Per Part 7, supports Morning, Evening, Night, and Custom shifts. Per Entity A.14 (Part 2), the Shift entity already exists; Shift Schedule adds **production-specific labor allocation**.

### 2-4. Owner / Schema / Fields (Summary)

| Owner | L2 — Manufacturing Head + HR Head |
|---|---|
| Schema | `transactional` |
| Table | `shift_schedules` (header) + `shift_schedule_assignments` (line items) |

**Shift Schedule Header fields**:

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `SS-` | Schedule code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | Yes | — | FK to facilities (PLANT) | Plant |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, COMPLETED, CANCELLED | Status |
| `schedule_number` | VARCHAR(50) | Yes | — | Display number | Public |
| `schedule_date` | DATE | Yes | — | — | Schedule date | Internal |
| `shift_id` | UUID | Yes | — | FK to `shifts.id` | Shift | Internal |
| `production_line_id` | UUID | Yes | — | FK to `production_lines.id` | Production line | Internal |
| `supervisor_user_id` | UUID | Yes | — | FK to `user_accounts.id` | Shift supervisor | Internal |
| `total_operators` | INTEGER | Yes | `0` | ≥ 0 | Total operators assigned | Internal |
| `machine_assignments` | JSONB | No | NULL | — | Array of `{ machine_id, operator_user_id, product_id }` | Internal |
| `expected_output_qty` | DECIMAL(18,4) | No | NULL | ≥ 0 | Expected output | Internal |
| `actual_output_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Actual output (denormalized) | Internal |
| `capacity_utilization_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Capacity utilization | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |

**Shift Assignment (line items)**:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | UUID v7 | Yes | PK |
| `shift_schedule_id` | UUID | Yes | FK to shift_schedules |
| `operator_user_id` | UUID | Yes | FK to user_accounts |
| `operator_role` | ENUM | Yes | MACHINE_OPERATOR, HELPER, QC_INSPECTOR, PACKAGING_OPERATOR, MATERIAL_HANDLER |
| `machine_id` | UUID | No | FK to machines (assigned machine) |
| `work_center_id` | UUID | No | FK to work_centers |
| `skill_level` | ENUM | No | TRAINEE, JUNIOR, SENIOR, EXPERT |
| `assignment_status` | ENUM | Yes | ASSIGNED, PRESENT, ABSENT, REPLACED |
| `clock_in_time` | TIMESTAMPTZ | No | Actual clock-in |
| `clock_out_time` | TIMESTAMPTZ | No | Actual clock-out |
| `overtime_hours` | DECIMAL(5,2) | No | Overtime hours |
| `productivity_score` | DECIMAL(5,2) | No | Per-operator productivity |

### 5-16. Standard entity pattern

```json
{
  "header": {
    "id": "01928f7a-...-ss-001",
    "code": "SS-2026-000001",
    "schedule_number": "SS-2026-000001",
    "schedule_date": "2026-07-07",
    "shift_id": "01928f7a-...-shift-a",
    "production_line_id": "01928f7a-...-pl-01",
    "supervisor_user_id": "01928f7a-...-user-supervisor-01",
    "total_operators": 8,
    "machine_assignments": [
      { "machine_id": "01928f7a-...-mac-01", "operator_user_id": "01928f7a-...-user-op-01", "product_id": "01928f7a-...-prod-kaju-katli-500" },
      { "machine_id": "01928f7a-...-mac-02", "operator_user_id": "01928f7a-...-user-op-02", "product_id": "01928f7a-...-prod-kaju-katli-500" }
    ],
    "expected_output_qty": 150.0000,
    "actual_output_qty": 0.0000,
    "status": "ACTIVE"
  }
}
```

---

## Entity 058 — Capacity Plan

### 1. Business Purpose

The `CapacityPlan` entity defines **available manufacturing capacity** — machine hours, labor hours, utility capacity, and packaging capacity per work center per day. Per Part 7 §3, capacity planning ensures production schedules are realistic.

Per Part 7, supports 5 capacity types:
- **Machine** — Machine hours available
- **Labor** — Labor hours available
- **Utility** — Power, water, steam, compressed air
- **Packaging** — Packaging line capacity
- **Warehouse** — Output warehouse capacity

### 2-4. Owner / Schema / Fields (Summary)

| Owner | L2 — Manufacturing Head |
|---|---|
| Schema | `transactional` |
| Table | `capacity_plans` |
| Partitioning | Monthly by `plan_date` |

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `CP-` | Capacity plan code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | Yes | — | FK to facilities (PLANT) | Plant |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, ARCHIVED | Status |
| `plan_number` | VARCHAR(50) | Yes | — | Display number | Public |
| `plan_date` | DATE | Yes | — | — | Capacity date (for partitioning) | Internal |
| `work_center_id` | UUID | Yes | — | FK to `work_centers.id` | Work center | Internal |
| `production_line_id` | UUID | No | NULL | FK to `production_lines.id` | Production line | Internal |
| `shift_id` | UUID | No | NULL | FK to `shifts.id` | Shift | Internal |
| `capacity_type` | ENUM | Yes | — | MACHINE, LABOR, UTILITY, PACKAGING, WAREHOUSE | Capacity type (per Part 7) | Internal |
| `machine_hours_available` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | Machine hours available | Internal | Capacity AI |
| `machine_hours_used` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | Machine hours used | Internal |
| `machine_hours_remaining` | DECIMAL(8,2) | No | — | Generated | Remaining machine hours | Internal |
| `labor_hours_available` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | Labor hours available | Internal |
| `labor_hours_used` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | Labor hours used | Internal |
| `labor_hours_remaining` | DECIMAL(8,2) | No | — | Generated | Remaining labor hours | Internal |
| `utilization_pct` | DECIMAL(5,2) | No | — | Generated: `(used / available) * 100` | Utilization % | Internal | Capacity AI |
| `is_overloaded` | BOOLEAN | Yes | `false` | — | Overloaded flag | Internal |
| `overload_pct` | DECIMAL(5,2) | No | NULL | — | Overload % | Internal |
| `ai_capacity_forecast` | JSONB | No | NULL | — | AI capacity forecast (per Part 7 AI) | Internal | Capacity Forecast AI |
| `forecast_confidence_pct` | DECIMAL(5,2) | No | NULL | 0–100 | AI confidence | Confidential |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5-16. Standard entity pattern

```json
{
  "id": "01928f7a-...-cp-001",
  "code": "CP-2026-000001",
  "plan_number": "CP-2026-000001",
  "plan_date": "2026-07-07",
  "work_center_id": "01928f7a-...-wc-sweets-01",
  "production_line_id": "01928f7a-...-pl-01",
  "shift_id": "01928f7a-...-shift-a",
  "capacity_type": "MACHINE",
  "machine_hours_available": 16.00,
  "machine_hours_used": 13.20,
  "machine_hours_remaining": 2.80,
  "labor_hours_available": 64.00,
  "labor_hours_used": 52.00,
  "labor_hours_remaining": 12.00,
  "utilization_pct": 82.50,
  "is_overloaded": false,
  "ai_capacity_forecast": {
    "next_7_days": [
      { "date": "2026-07-08", "predicted_utilization_pct": 85.00 },
      { "date": "2026-07-09", "predicted_utilization_pct": 88.00 }
    ],
    "overload_risk": "LOW"
  },
  "forecast_confidence_pct": 89.00,
  "status": "ACTIVE"
}
```

# Manual 1 · Part 7 · Entities 55, 60 — Production Stage & Manufacturing KPI Snapshot

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 7 — Manufacturing Foundation & Production Planning |
| Section | 1 — Manufacturing Foundation & Production Planning |
| Entities | Production Stage (055), Manufacturing KPI Snapshot (060) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## Entity 055 — Production Stage

### 1. Business Purpose

The `ProductionStage` entity defines the **sequence of manufacturing steps** a product goes through during production. Per Part 7 §1, every production follows a defined sequence of stages:

```
Raw Material Verification → Material Weighing → Mixing → Cooking → Cooling → Cutting → Packing → Labeling → QC → Finished Goods
```

Each stage:
- Has a **defined sequence** (order of execution)
- Has an **expected duration** (for scheduling)
- May require a **specific machine** (e.g., mixing stage requires mixer)
- May require **QC check** (e.g., after cooking, check temperature)
- Requires specific **operator skill** (e.g., cooking requires SENIOR operator)

Production stages are defined per **Recipe Version** (per Ch 7 §7.6) — different recipe versions may have different stage sequences. The Manufacturing Batch (Entity 054) progresses through these stages, recording actual timings and outcomes.

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
| Schema | `master` (stage definitions) + `transactional` (stage execution) |
| Table Name | `production_stages` (master) + `manufacturing_batch_stages` (execution tracking) |
| Prisma Models | `ProductionStage`, `ManufacturingBatchStage` |
| Pattern | Master + execution tracking |

### 4. Field Dictionary

#### 4.1 Production Stage Master (production_stages)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `STG-` | Stage code (e.g., `STG-MIX`) |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ARCHIVED | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `stage_code` | VARCHAR(20) | Yes | — | Unique per recipe version | Stage code (e.g., `MIX`, `COOK`, `PACK`) | Internal | — |
| `stage_name` | VARCHAR(100) | Yes | — | Min 3 | Stage display name (e.g., "Mixing") | Public | — |
| `description` | TEXT | No | NULL | — | Detailed description | Internal | — |
| `recipe_version_id` | UUID | Yes | — | FK to `recipe_versions.id` | Recipe version this stage belongs to | Internal | — |
| `sequence_number` | INTEGER | Yes | — | > 0, unique per recipe version | Execution order (1 = first) | Internal | — |
| `stage_type` | ENUM | Yes | — | VERIFICATION, WEIGHING, MIXING, COOKING, COOLING, CUTTING, FORMING, FILLING, PACKING, LABELING, QC, STORAGE, OTHER | Stage type (per Part 7) | Internal | — |
| `expected_duration_min` | INTEGER | Yes | — | > 0 | Expected duration (minutes) | Internal | Duration AI |
| `minimum_duration_min` | INTEGER | No | NULL | > 0 | Minimum duration (e.g., cooking min 30 min) | Internal | — |
| `maximum_duration_min` | INTEGER | No | NULL | > `minimum_duration_min` | Maximum duration | Internal | — |
| `machine_required` | BOOLEAN | Yes | `false` | — | Machine required | Internal | — |
| `machine_type_required` | VARCHAR(50) | No | NULL | — | Type of machine (e.g., "Mixer", "Cooker") | Internal | — |
| `work_center_id` | UUID | No | NULL | FK to `work_centers.id` | Default work center | Internal | — |
| `qc_required` | BOOLEAN | Yes | `false` | — | QC check required after this stage | Internal | — |
| `qc_specification_id` | UUID | No | NULL | FK to `qc_specifications.id` | QC spec for this stage | Confidential | — |
| `operator_skill_required` | ENUM | No | NULL | TRAINEE, JUNIOR, SENIOR, EXPERT | Minimum operator skill | Internal | — |
| `operator_count_required` | INTEGER | Yes | `1` | ≥ 1 | Number of operators required | Internal | — |
| `temperature_required_c` | DECIMAL(5,2) | No | NULL | — | Required temperature (e.g., cooking at 180°C) | Internal | — |
| `temperature_min_c` | DECIMAL(5,2) | No | NULL | — | Min temperature | Internal | — |
| `temperature_max_c` | DECIMAL(5,2) | No | NULL | — | Max temperature | Internal | — |
| `humidity_required_pct` | DECIMAL(5,2) | No | NULL | — | Required humidity | Internal | — |
| `is_critical_control_point` | BOOLEAN | Yes | `false` | — | HACCP Critical Control Point (per Ch 18 §18.7) | Confidential | — |
| `ccp_critical_limits` | JSONB | No | NULL | — | CCP critical limits (e.g., `{ "temp_min": 75, "time_min": 30 }`) | Confidential | — |
| `ccp_monitoring_method` | VARCHAR(200) | No | NULL | — | How CCP is monitored | Confidential | — |
| `ccp_corrective_action` | TEXT | No | NULL | — | Corrective action if CCP fails | Confidential | — |
| `barcode_scan_required` | BOOLEAN | Yes | `false` | — | Barcode scan required at this stage | Internal | — |
| `scan_type` | ENUM | No | NULL | PRODUCT, BATCH, MACHINE, OPERATOR, LOCATION | What to scan | Internal | — |
| `is_optional` | BOOLEAN | Yes | `false` | — | Stage can be skipped | Internal | — |
| `can_be_parallel` | BOOLEAN | Yes | `false` | — | Can run in parallel with other stages | Internal | — |
| `parallel_stage_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Stages that can run in parallel | Internal | — |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

#### 4.2 Manufacturing Batch Stage Execution (manufacturing_batch_stages)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches.id` | Parent batch |
| `production_stage_id` | UUID | Yes | — | FK to `production_stages.id` | Stage definition |
| `sequence_number` | INTEGER | Yes | — | > 0 | Execution order |
| `stage_status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, COMPLETED, SKIPPED, FAILED, PAUSED | Stage execution status | Internal |
| `started_at` | TIMESTAMPTZ | No | NULL | — | Stage start | Internal |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Stage completion | Internal |
| `actual_duration_min` | INTEGER | No | NULL | ≥ 0 | Actual duration | Internal |
| `duration_variance_pct` | DECIMAL(5,2) | No | NULL | — | Variance vs expected | Internal |
| `operator_user_id` | UUID | No | NULL | FK to `user_accounts.id` | Operator who executed | Internal |
| `machine_id` | UUID | No | NULL | FK to `machines.id` | Machine used | Internal |
| `temperature_recorded_c` | DECIMAL(5,2) | No | NULL | — | Actual temperature | Internal |
| `humidity_recorded_pct` | DECIMAL(5,2) | No | NULL | — | Actual humidity | Internal |
| `is_ccp_passed` | BOOLEAN | No | NULL | — | CCP check passed | Confidential |
| `ccp_reading` | JSONB | No | NULL | — | CCP readings | Confidential |
| `qc_inspection_id` | UUID | No | NULL | FK to `qc_inspections.id` | QC inspection (if stage requires QC) | Confidential |
| `qc_status` | ENUM | No | NULL | PENDING, PASSED, FAILED | Stage QC status | Confidential |
| `barcode_scan_data` | JSONB | No | NULL | — | Barcode scan records | Internal |
| `notes` | TEXT | No | NULL | — | Operator notes | Internal |
| `exception_id` | UUID | No | NULL | FK to `exceptions.id` | Exception (if any) | Internal |

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | ProductionStage → Company, RecipeVersion, WorkCenter, QCSpecification; BatchStage → ManufacturingBatch, ProductionStage, UserAccount, Machine, QCInspection, Exception |
| **Index** | `uq_ps_code_company`, `uq_ps_recipe_sequence` (unique: recipe_version_id + sequence_number), `idx_ps_recipe`, `idx_ps_type`, `idx_ps_ccp` (partial: is_critical_control_point), `idx_mbs_batch`, `idx_mbs_status`, `idx_mbs_stage` |
| **Validation** | `sequence_number` unique per recipe version, `expected_duration_min` > 0, `maximum_duration_min` > `minimum_duration_min`, CCP stages require `ccp_critical_limits` + `ccp_monitoring_method` + `ccp_corrective_action`, `is_critical_control_point = true` stages cannot be skipped |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/production-stages` (GET, POST), `/api/v1/production-stages/:id` (GET, PATCH), `/api/v1/production-stages/by-recipe/:recipeVersionId` (GET — all stages for a recipe version), `/api/v1/manufacturing-batches/:id/stages` (GET — execution tracking), `/api/v1/manufacturing-batches/:id/stages/:stageId/start` (POST), `/api/v1/manufacturing-batches/:id/stages/:stageId/complete` (POST), `/api/v1/manufacturing-batches/:id/stages/:stageId/skip` (POST), `/api/v1/manufacturing-batches/:id/stages/:stageId/ccp` (POST — record CCP reading) |
| **UI** | Stage Definition List (per recipe), Stage Sequence Editor (drag-and-drop), Batch Stage Timeline (visual progress), CCP Monitoring Dashboard, Stage Duration Analysis |
| **Mobile** | **Stage Completion** (scan to start/complete stage), **CCP Reading Entry** (enter temperature, time, etc.), **Material Verification** (scan ingredients at verification stage), Stage progress view, Stage exception reporting |
| **Reports** | Stage Duration Report, Stage Compliance Report, CCP Compliance Report, Stage Yield Impact, Stage Bottleneck Analysis, Operator Stage Performance |
| **Audit** | Full; CCP readings permanently retained (compliance); mandatory reason for stage skip, CCP failure |

### 13-16. Security / AI / Performance / Example

**Security**: `stage_name`, `sequence_number`, `stage_type` = Public; `is_critical_control_point`, `ccp_*` = Confidential; execution details = Internal.

**AI**: Stage Duration Prediction AI, Bottleneck Detection AI, CCP Compliance AI, Stage Optimization AI.

**Performance**: < 500 stages (master); < 50k batch stages/year (execution); Redis cache TTL 1 hour.

```json
{
  "master": {
    "id": "01928f7a-...-stg-001",
    "code": "STG-MIX",
    "company_id": "01928f7a-...-company",
    "stage_code": "MIX",
    "stage_name": "Mixing",
    "description": "Mix sugar syrup with ground cashew paste at controlled temperature",
    "recipe_version_id": "01928f7a-...-recipe-kaju-katli-v3",
    "sequence_number": 3,
    "stage_type": "MIXING",
    "expected_duration_min": 45,
    "minimum_duration_min": 30,
    "maximum_duration_min": 60,
    "machine_required": true,
    "machine_type_required": "Industrial Mixer",
    "work_center_id": "01928f7a-...-wc-sweets-01",
    "qc_required": false,
    "operator_skill_required": "SENIOR",
    "operator_count_required": 1,
    "temperature_required_c": 85.00,
    "temperature_min_c": 80.00,
    "temperature_max_c": 90.00,
    "is_critical_control_point": true,
    "ccp_critical_limits": {
      "temp_min": 80,
      "temp_max": 90,
      "duration_min": 30
    },
    "ccp_monitoring_method": "Continuous temperature logging every 5 minutes",
    "ccp_corrective_action": "If temperature outside range, adjust burner. If duration < 30 min, extend mixing. Document deviation.",
    "barcode_scan_required": true,
    "scan_type": "BATCH",
    "status": "ACTIVE"
  },
  "execution": {
    "id": "01928f7a-...-mbs-001",
    "manufacturing_batch_id": "01928f7a-...-mb-001",
    "production_stage_id": "01928f7a-...-stg-001",
    "sequence_number": 3,
    "stage_status": "COMPLETED",
    "started_at": "2026-07-07T09:15:00Z",
    "completed_at": "2026-07-07T09:55:00Z",
    "actual_duration_min": 40,
    "duration_variance_pct": -11.11,
    "operator_user_id": "01928f7a-...-user-op-01",
    "machine_id": "01928f7a-...-mac-01",
    "temperature_recorded_c": 85.50,
    "is_ccp_passed": true,
    "ccp_reading": {
      "temp_readings": [
        { "time": "09:15", "temp": 82.0 },
        { "time": "09:20", "temp": 84.5 },
        { "time": "09:25", "temp": 85.5 },
        { "time": "09:30", "temp": 85.5 },
        { "time": "09:35", "temp": 85.0 },
        { "time": "09:40", "temp": 85.5 },
        { "time": "09:45", "temp": 85.0 },
        { "time": "09:50", "temp": 85.5 },
        { "time": "09:55", "temp": 85.0 }
      ],
      "all_within_limits": true,
      "duration_actual_min": 40
    }
  }
}
```

---

## Entity 060 — Manufacturing KPI Snapshot

### 1. Business Purpose

The `ManufacturingKPISnapshot` entity records **periodic manufacturing performance metrics** — the KPI scores that feed the Operational Intelligence layer (per Volume 0 Chapter 15). Per Part 7 §"Manufacturing KPI Snapshot", stores:

- Planned vs Actual Production
- Yield %
- Wastage %
- Efficiency %
- Downtime
- Machine Utilization
- Labor Productivity
- OEE (Overall Equipment Effectiveness)

Snapshots are taken on a schedule (daily, weekly, monthly) and stored as immutable point-in-time records for trend analysis and AI training.

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Manufacturing Head |
| Data Owner | Manufacturing Head |
| Technical Owner | Backend Lead — Manufacturing Module + Analytics Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `manufacturing_kpi_snapshots` |
| Prisma Model | `ManufacturingKPISnapshot` |
| Partitioning | Monthly by `snapshot_date` |

### 4. Field Dictionary

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `MKPI-` | KPI snapshot code |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | Yes | — | FK to facilities (PLANT) | Plant |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, IN_PROGRESS, COMPLETED, ARCHIVED | Status |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard |
| `snapshot_number` | VARCHAR(50) | Yes | — | Display number | Public |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date (for partitioning) | Internal |
| `snapshot_type` | ENUM | Yes | — | DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL | Snapshot period type | Internal |
| `period_start_date` | DATE | Yes | — | — | Period start | Internal |
| `period_end_date` | DATE | Yes | — | > period_start_date | Period end | Internal |
| `production_line_id` | UUID | No | NULL | FK to `production_lines.id`; NULL = all lines | Line scope | Internal |
| `work_center_id` | UUID | No | NULL | FK to `work_centers.id`; NULL = all | Work center scope | Internal |
| `shift_id` | UUID | No | NULL | FK to `shifts.id`; NULL = all shifts | Shift scope | Internal |
| `brand_id` | UUID | No | NULL | FK to `brands.id`; NULL = all | Brand scope | Internal |
| `product_family_id` | UUID | No | NULL | FK to `product_families.id`; NULL = all | Family scope | Internal |
| `planned_production_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Planned production | Internal | — |
| `actual_production_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Actual production | Internal | — |
| `production_achievement_pct` | DECIMAL(5,2) | No | — | Generated: `(actual / planned) * 100` | Achievement % | Internal | — |
| `planned_yield_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Planned yield | Internal | Yield AI |
| `actual_yield_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Actual yield | Internal | Yield AI |
| `yield_variance_pct` | DECIMAL(5,2) | No | NULL | — | Variance | Internal | Yield AI |
| `wastage_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Wastage quantity | Internal | Waste AI |
| `wastage_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Wastage % | Internal | Waste AI |
| `wastage_value` | DECIMAL(18,4) | No | NULL | ≥ 0 | Wastage financial value | Confidential | Waste AI |
| `efficiency_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Overall efficiency | Internal | — |
| `total_downtime_min` | INTEGER | Yes | `0` | ≥ 0 | Total downtime (minutes) | Internal | Downtime AI |
| `downtime_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Downtime % | Internal | — |
| `downtime_reasons` | JSONB | No | NULL | — | Breakdown by reason: `{ "MACHINE_BREAKDOWN": 120, "MATERIAL_SHORTAGE": 60, "POWER_FAILURE": 30 }` | Internal | — |
| `machine_utilization_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Machine utilization | Internal | — |
| `labor_productivity_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Labor productivity | Internal | — |
| `oee` | DECIMAL(5,2) | No | NULL | 0–100 | **Overall Equipment Effectiveness** | Internal | OEE AI |
| `oee_availability_pct` | DECIMAL(5,2) | No | NULL | 0–100 | OEE Availability component | Internal | — |
| `oee_performance_pct` | DECIMAL(5,2) | No | NULL | 0–100 | OEE Performance component | Internal | — |
| `oee_quality_pct` | DECIMAL(5,2) | No | NULL | 0–100 | OEE Quality component | Internal | — |
| `total_batches` | INTEGER | Yes | `0` | ≥ 0 | Total batches produced | Internal | — |
| `passed_batches` | INTEGER | Yes | `0` | ≥ 0 | Batches passed QC | Internal | — |
| `failed_batches` | INTEGER | Yes | `0` | ≥ 0 | Batches failed QC | Internal | — |
| `qc_pass_rate_pct` | DECIMAL(5,2) | No | NULL | 0–100 | QC pass rate | Internal | — |
| `total_production_orders` | INTEGER | Yes | `0` | ≥ 0 | Total orders | Internal | — |
| `completed_orders` | INTEGER | Yes | `0` | ≥ 0 | Completed orders | Internal | — |
| `on_time_completion_pct` | DECIMAL(5,2) | No | NULL | 0–100 | On-time completion | Internal | — |
| `avg_production_duration_hours` | DECIMAL(8,2) | No | NULL | ≥ 0 | Avg duration per batch | Internal | — |
| `avg_setup_time_min` | DECIMAL(8,2) | No | NULL | ≥ 0 | Avg setup time | Internal | — |
| `total_operators` | INTEGER | Yes | `0` | ≥ 0 | Operators working | Internal | — |
| `total_labor_hours` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Total labor hours | Internal | — |
| `labor_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Total labor cost | Confidential | — |
| `material_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Total material cost | Confidential | — |
| `overhead_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Total overhead | Confidential | — |
| `total_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Total cost | Confidential | — |
| `unit_cost_avg` | DECIMAL(18,4) | No | NULL | ≥ 0 | Average unit cost | Confidential | — |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `previous_snapshot_id` | UUID | No | NULL | FK self-ref | Previous period snapshot (for trend) | Internal |
| `trend_direction` | ENUM | No | NULL | IMPROVING, STABLE, DECLINING | Trend vs previous | Internal | — |
| `trend_details` | JSONB | No | NULL | — | Detailed trend analysis | Internal | — |
| `ai_insights` | JSONB | No | NULL | — | AI-generated insights | Internal | Insight AI |
| `calculated_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Calculation timestamp | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5-7. Relationships / Index / Validation

| Section | Summary |
|---|---|
| **Relationships** | ManufacturingKPISnapshot → Company, Facility, ProductionLine, WorkCenter, Shift, Brand, ProductFamily; self-ref for trend |
| **Index** | `uq_mkpi_code_company`, `idx_mkpi_date` (partition), `idx_mkpi_type`, `idx_mkpi_line`, `idx_mkpi_shift`, `idx_mkpi_brand` |
| **Validation** | `period_end_date` > `period_start_date`, all percentages 0–100, `oee` = `availability * performance * quality / 10000`, `qc_pass_rate_pct` = `(passed_batches / total_batches) * 100` |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/manufacturing-kpi-snapshots` (GET, POST), `/api/v1/manufacturing-kpi-snapshots/:id` (GET), `/api/v1/manufacturing-kpi-snapshots/calculate` (POST — trigger calculation), `/api/v1/manufacturing-kpi-snapshots/trend` (GET — trend analysis), `/api/v1/manufacturing-kpi-snapshots/oee` (GET — OEE breakdown), `/api/v1/manufacturing-kpi-snapshots/by-line/:lineId` (GET), `/api/v1/manufacturing-kpi-snapshots/compare` (GET — compare periods) |
| **UI** | KPI Dashboard, OEE Dashboard, Yield Trends, Wastage Trends, Downtime Analysis, Manufacturing Scorecard, Trend Charts, AI Insights Panel |
| **Mobile** | KPI summary (L2+), alerts for KPI breaches |
| **Reports** | Manufacturing KPI Report, OEE Report, Yield Report, Wastage Report, Downtime Analysis, Machine Utilization, Labor Productivity, Cost Analysis, Trend Report, AI Insights Report |
| **Audit** | Full; snapshots immutable after COMPLETED |

### 13-16. Security / AI / Performance / Example

**Security**: KPI metrics = Internal; cost fields = Confidential; `ai_insights` = Internal.

**AI**: OEE Optimization AI, Yield Prediction AI, Wastage Reduction AI, Downtime Prediction AI, Labor Optimization AI, Cost Optimization AI, Trend Analysis AI, Anomaly Detection AI.

**Performance**: Auto-calculated by scheduled job; < 5k/year; monthly partitioned; Redis cache TTL 1 hour.

```json
{
  "id": "01928f7a-...-mkpi-001",
  "code": "MKPI-2026-000001",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "snapshot_number": "MKPI-2026-000001",
  "snapshot_date": "2026-07-07",
  "snapshot_type": "DAILY",
  "period_start_date": "2026-07-07",
  "period_end_date": "2026-07-07",
  "production_line_id": "01928f7a-...-pl-01",
  "planned_production_qty": 500.0000,
  "actual_production_qty": 482.5000,
  "production_achievement_pct": 96.50,
  "planned_yield_pct": 96.50,
  "actual_yield_pct": 96.50,
  "yield_variance_pct": 0.00,
  "wastage_qty": 17.5000,
  "wastage_pct": 3.50,
  "wastage_value": 10150.0000,
  "efficiency_pct": 92.00,
  "total_downtime_min": 45,
  "downtime_pct": 7.81,
  "downtime_reasons": {
    "MACHINE_BREAKDOWN": 20,
    "MATERIAL_SHORTAGE": 15,
    "CHANGEover": 10
  },
  "machine_utilization_pct": 87.50,
  "labor_productivity_pct": 94.00,
  "oee": 78.75,
  "oee_availability_pct": 92.19,
  "oee_performance_pct": 94.00,
  "oee_quality_pct": 90.75,
  "total_batches": 10,
  "passed_batches": 9,
  "failed_batches": 1,
  "qc_pass_rate_pct": 90.00,
  "total_production_orders": 8,
  "completed_orders": 7,
  "on_time_completion_pct": 87.50,
  "avg_production_duration_hours": 3.25,
  "total_operators": 8,
  "total_labor_hours": 64.00,
  "labor_cost": 8000.0000,
  "material_cost": 268000.0000,
  "overhead_cost": 16000.0000,
  "total_cost": 292000.0000,
  "unit_cost_avg": 605.1813,
  "currency_code": "INR",
  "trend_direction": "IMPROVING",
  "ai_insights": {
    "key_findings": [
      "OEE improved 2.3% vs yesterday (78.75% vs 76.45%)",
      "Downtime reduced by 15 minutes — machine breakdown fix effective",
      "QC pass rate dropped 5% — investigate batch SDS-2026-000008 failure",
      "Yield stable at target — recipe v3 performing well"
    ],
    "recommendations": [
      "Investigate QC failure on batch SDS-2026-000008",
      "Consider preventive maintenance on Machine M-02 (2 breakdowns this week)",
      "Material shortage caused 15 min downtime — increase safety stock for sugar"
    ]
  },
  "calculated_at": "2026-07-07T23:30:00Z",
  "status": "COMPLETED",
  "version": 1
}
```

---

## Part 7 Completion Summary

**All 10 Manufacturing Foundation entities are now defined** at full enterprise-grade depth:

| Entity | File | Status |
|---|---|---|
| 051 Production Plan | `51-59-planning-layer.md` | ✅ Complete |
| 052 Production Schedule | `52-56-57-58-scheduling-layer.md` | ✅ Complete |
| 053 Production Order | `53-54-execution-core.md` | ✅ Complete (most detailed — ~80 fields, 17 validation rules) |
| 054 Manufacturing Batch | `53-54-execution-core.md` | ✅ Complete (genealogy, QC, ledger integration) |
| 055 Production Stage | `55-60-stage-and-kpi.md` | ✅ Complete (CCP/HACCP integrated) |
| 056 Production Calendar | `52-56-57-58-scheduling-layer.md` | ✅ Complete (extends Part 2 A.15) |
| 057 Shift Schedule | `52-56-57-58-scheduling-layer.md` | ✅ Complete (extends Part 2 A.14) |
| 058 Capacity Plan | `52-56-57-58-scheduling-layer.md` | ✅ Complete |
| 059 Manufacturing Demand | `51-59-planning-layer.md` | ✅ Complete (multi-source demand) |
| 060 Manufacturing KPI Snapshot | `55-60-stage-and-kpi.md` | ✅ Complete (OEE, yield, wastage, AI insights) |

### Key Architectural Decisions in Part 7

1. **Batch-first manufacturing** — All production organized around batches (per Part 7 principles)
2. **Recipe version immutable** — After Production Order approval, recipe version cannot change (per Part 7 business rules)
3. **11-stage Production Order lifecycle** — DRAFT → REVIEW → APPROVED → MATERIAL_RESERVED → MATERIAL_ISSUED → PRODUCTION_STARTED → PAUSED → COMPLETED → QC → CLOSED
4. **Full genealogy** — Manufacturing Batch links to ingredient batches + supplier lots (5-minute recall KPI)
5. **Production Ledger integration** — On batch completion, writes to Production Ledger (per Ch 10 §10.6) + Inventory Ledger (per Ch 10 §10.5)
6. **Manufacturing Batch → Inventory Batch** — On completion, creates Batch (Entity 023) in inventory
7. **HACCP CCP integration** — Production Stage supports Critical Control Points with monitoring + corrective actions (per Ch 18 §18.7)
8. **Multi-source demand** — Retail, Restaurant, Sales, Forecast, Subscriptions, Seasonal, AI (per Part 7)
9. **4 scheduling modes** — Finite, Infinite, Manual, AI scheduling
10. **AI-assisted planning** — Demand forecast AI feeds Production Planning (per Ch 14 §14.3)
11. **OEE computation** — Availability × Performance × Quality (per Part 7 KPI)
12. **Mobile-first execution** — Production Start, Pause, Stage Completion, Material Verification via mobile
13. **Capacity planning** — Machine, Labor, Utility, Packaging, Warehouse capacity types
14. **Shift-aware manufacturing** — All schedules and batches reference shifts
15. **Immutable historical plans** — Approved plans cannot be modified (per Part 7 business rules)

# Manual 1 · Part 7 · Sections 3 & 4 · Entities 71-90 — Production Execution & Resource Management

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 7 — Manufacturing Domain |
| Sections | 3 (Production Execution) & 4 (Machine, Work Center & Labor Management) |
| Entities | 071–080 (Execution), 081–090 (Resources) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 5 §5.4, Ch 10 §10.6, Ch 24 §24.4, Ch 24 §24.8 |
| Last Updated | 2026-07-07 |

---

## Overview — Execution & Resource Architecture

Sections 3 & 4 bridge the gap between **planning (Section 1)**, **recipe definition (Section 2)**, and **physical shop-floor execution**. They also define the **physical resources** (machines, operators, tools) that execute the work.

```
PRODUCTION ORDER (053)
  ↓ Authorizes
PRODUCTION EXECUTION (071) — Live tracking
  ↓ Consumes
MATERIAL ISSUE (072) + PRODUCTION CONSUMPTION (073)
  ↓ Executed on / by
WORK CENTER (074) / PROD LINE (075) / MACHINE (081) / OPERATOR (085)
  ↓ Tracked via
CHECKPOINTS (077) / DELAYS (078) / MACHINE DOWNTIME (088)
  ↓ Results in
FINISHED GOODS RECEIPT (079) → Inventory Ledger
  ↓ Traced via
PRODUCTION GENEALOGY (080)
```

### Integrated Enhancements
1. **Manufacturing Command Center** (per Enhancement) — `execution_status`, `real_time_metrics`, `oee_snapshot`
2. **Manufacturing 4.0** (per Enhancement) — `iot_device_id`, `sensor_data_stream`, `digital_twin_enabled`

---

## Entity 071 — Production Execution

### 1. Business Purpose
Represents the **live execution** of a Production Order. While the Production Order is the authorization, the Execution entity tracks the real-time state, start/end times, and active work center/machine. It is the heartbeat of the Manufacturing Command Center.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `EXE-` | Execution code | Internal | |
| `company_id` | UUID | Yes | — | FK to `companies` | Owning company | Internal | |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Plant | Internal | |
| `production_order_id` | UUID | Yes | — | FK to `production_orders` | Parent order | Internal | |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Batch being executed | Internal | |
| `work_center_id` | UUID | Yes | — | FK to `work_centers` | Execution location | Internal | |
| `machine_id` | UUID | No | NULL | FK to `machines` | Primary machine | Internal | |
| `operator_user_id` | UUID | Yes | — | FK to `user_accounts` | Lead operator | Internal | |
| `shift_id` | UUID | Yes | — | FK to `shifts` | Current shift | Internal | |
| `execution_status` | ENUM | Yes | `NOT_STARTED` | NOT_STARTED, READY, RUNNING, PAUSED, STOPPED, COMPLETED, CANCELLED | Live status (per Part 7 Sec 3) | Internal | Command Center |
| `actual_start_time` | TIMESTAMPTZ | No | NULL | — | Actual start | Internal | |
| `actual_end_time` | TIMESTAMPTZ | No | NULL | — | Actual end | Internal | |
| `total_pause_duration_min` | INTEGER | Yes | `0` | ≥ 0 | Total pause time | Internal | |
| `current_stage_id` | UUID | No | NULL | FK to `production_stages` | Current stage | Internal | |
| `real_time_metrics` | JSONB | No | `'{}'` | — | Live metrics (output qty, yield %, etc.) for Command Center | Internal | Command Center |
| `iot_device_id` | VARCHAR(50) | No | NULL | — | Connected IoT device (per Mfg 4.0) | Internal | IoT |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Standard status | Internal | |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard | | |

### 5-16. Standard Pattern
- **Relationships**: → ProductionOrder, ManufacturingBatch, WorkCenter, Machine, UserAccount, Shift, ProductionStage.
- **Index**: `idx_exe_status`, `idx_exe_order`, `idx_exe_batch`, `idx_exe_operator`.
- **Validation**: One active execution per batch; status transitions follow lifecycle.
- **API**: `/api/v1/production-executions/:id/start`, `/pause`, `/resume`, `/complete`.
- **UI**: Manufacturing Command Center (live status board).
- **Mobile**: Operator start/pause/complete actions.
- **Reports**: Live Production Status, Execution History.
- **Audit**: Full; mandatory reason for pause/stop.
- **Security**: Internal.
- **AI**: Real-time Production Monitoring AI, Delay Prediction AI.
- **Performance**: Monthly partitioned by `actual_start_time`.

---

## Entity 072 — Material Issue

### 1. Business Purpose
Issues raw materials from inventory to production. Per Part 7: *"Only reserved stock can be issued. Barcode verification mandatory. Inventory Ledger updated immediately."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `MI-` | Issue code | Internal |
| `production_order_id` | UUID | Yes | — | FK to `production_orders` | Parent order | Internal |
| `execution_id` | UUID | No | NULL | FK to `production_executions` | Active execution | Internal |
| `ingredient_product_id` | UUID | Yes | — | FK to `products` | Material issued | Internal |
| `batch_id` | UUID | Yes | — | FK to `batches` | Batch issued (FEFO) | Internal |
| `issued_quantity` | DECIMAL(18,4) | Yes | — | > 0 | Quantity issued | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms` | UOM | Internal |
| `issued_by` | UUID | Yes | — | FK to `user_accounts` | Operator | Internal |
| `issue_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Issue timestamp | Internal |
| `source_warehouse_id` | UUID | Yes | — | FK to `facilities` | Source warehouse | Internal |
| `source_location_id` | UUID | Yes | — | FK to `locations` | Source bin | Internal |
| `reservation_id` | UUID | Yes | — | FK to `stock_reservations` | Reservation consumed | Internal |
| `ledger_entry_id` | UUID | No | NULL | FK to `inventory_ledger` | PRODUCTION_OUT ledger entry | Internal |
| `barcode_verified` | BOOLEAN | Yes | `false` | — | Barcode scan completed (per Part 7) | Internal |
| `scan_data` | JSONB | No | `'{}'` | — | Barcode scan details | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, CANCELLED | Status | Internal |

### 5-16. Standard Pattern
- **Validation**: Cannot issue more than reserved quantity; `barcode_verified = true` required for COMPLETED.
- **API**: `/api/v1/material-issues` (POST - creates ledger entry).

---

## Entity 073 — Production Consumption

### 1. Business Purpose
Tracks **actual ingredient usage** vs expected (BOM). Per Part 7: *"Variance beyond tolerance requires approval."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `execution_id` | UUID | Yes | — | FK to `production_executions` | Parent execution | Internal |
| `ingredient_product_id` | UUID | Yes | — | FK to `products` | Ingredient | Internal |
| `expected_quantity` | DECIMAL(18,4) | Yes | — | ≥ 0 | Expected from BOM | Internal |
| `actual_quantity` | DECIMAL(18,4) | Yes | — | ≥ 0 | Actual consumed | Internal |
| `variance_quantity` | DECIMAL(18,4) | No | — | Generated: `actual - expected` | Variance | Internal |
| `variance_pct` | DECIMAL(5,2) | No | — | — | Variance % | Internal |
| `consumption_method` | ENUM | Yes | `MANUAL` | AUTOMATIC, MANUAL, SCANNER_BASED (per Part 7) | How recorded | Internal |
| `operator_user_id` | UUID | Yes | — | FK to `user_accounts` | Recorder | Internal |
| `consumption_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Timestamp | Internal |
| `variance_reason` | TEXT | No | NULL | Required if `abs(variance_pct) > tolerance` | Reason for variance | Internal |
| `approval_id` | UUID | No | NULL | FK to `approvals` | Variance approval | Internal |

### 5-16. Standard Pattern
- **AI**: Material Variance Analysis AI (detects systematic over-consumption).

---

## Entity 074 — Work Center

### 1. Business Purpose
Logical production area where specific operations occur (Mixing, Cooking, Packing, etc.).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `WC-` | Work center code | Internal |
| `name` | VARCHAR(200) | Yes | — | — | Display name (e.g., "Mixing Area 1") | Public |
| `plant_id` | UUID | Yes | — | FK to `facilities` | Plant | Internal |
| `production_area_id` | UUID | No | NULL | FK to `production_areas` (Entity 082) | Logical zone | Internal |
| `capacity_per_hour` | DECIMAL(18,4) | No | NULL | > 0 | Maximum capacity | Internal |
| `supervisor_user_id` | UUID | No | NULL | FK to `user_accounts` | Default supervisor | Internal |
| `operating_hours_start` | TIME | No | NULL | — | Default hours | Internal |
| `operating_hours_end` | TIME | No | NULL | — | Default hours | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, MAINTENANCE | Status | Internal |

---

## Entity 075 — Production Line

### 1. Business Purpose
Represents a **physical manufacturing line** — a sequence of work centers. Supports Single Product, Multi Product, and Campaign Manufacturing.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `PL-` | Line code | Internal |
| `name` | VARCHAR(200) | Yes | — | — | Display name | Public |
| `plant_id` | UUID | Yes | — | FK to `facilities` | Plant | Internal |
| `line_type` | ENUM | Yes | `MULTI_PRODUCT` | SINGLE_PRODUCT, MULTI_PRODUCT, CAMPAIGN | Manufacturing mode (per Part 7) | Internal |
| `max_capacity` | DECIMAL(18,4) | Yes | — | > 0 | Maximum capacity | Internal |
| `current_capacity_utilization` | DECIMAL(5,2) | No | NULL | 0-100 | Current utilization % | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, MAINTENANCE | Status | Internal |

---

## Entity 076 — Operator Assignment

### 1. Business Purpose
Assigns operators to specific production executions/machines with roles and performance tracking.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `execution_id` | UUID | Yes | — | FK to `production_executions` | Execution context | Internal |
| `operator_user_id` | UUID | Yes | — | FK to `user_accounts` | Operator | Internal |
| `machine_id` | UUID | No | NULL | FK to `machines` | Assigned machine | Internal |
| `role` | ENUM | Yes | — | MACHINE_OPERATOR, HELPER, QC_INSPECTOR, SUPERVISOR | Role | Internal |
| `start_time` | TIMESTAMPTZ | Yes | — | — | Assignment start | Internal |
| `end_time` | TIMESTAMPTZ | No | NULL | — | Assignment end | Internal |
| `performance_score` | DECIMAL(5,2) | No | NULL | 0-100 | Productivity score | Internal |

---

## Entity 077 — Production Checkpoint

### 1. Business Purpose
Captures mandatory execution checkpoints (e.g., "Raw Material Verified", "Cooking Complete"). Per Part 7: *"Checkpoint sequence cannot be skipped."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `execution_id` | UUID | Yes | — | FK to `production_executions` | Parent execution | Internal |
| `checkpoint_name` | VARCHAR(100) | Yes | — | — | Name (e.g., "QC Sample Taken") | Internal |
| `sequence_number` | INTEGER | Yes | — | > 0 | Order in sequence | Internal |
| `checkpoint_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Completion time | Internal |
| `operator_user_id` | UUID | Yes | — | FK to `user_accounts` | Who completed | Internal |
| `barcode_verified` | BOOLEAN | Yes | `false` | — | Barcode scan required | Internal |
| `notes` | TEXT | No | NULL | — | Operator notes | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, COMPLETED, SKIPPED (requires approval) | Status | Internal |

---

## Entity 078 — Production Delay

### 1. Business Purpose
Tracks production interruptions (Machine Failure, Material Shortage, Power Failure, etc.).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `execution_id` | UUID | Yes | — | FK to `production_executions` | Parent execution | Internal |
| `delay_start` | TIMESTAMPTZ | Yes | — | — | Start of delay | Internal |
| `delay_end` | TIMESTAMPTZ | No | NULL | — | End of delay | Internal |
| `duration_min` | INTEGER | No | NULL | ≥ 0 | Duration (minutes) | Internal |
| `reason_code` | VARCHAR(50) | Yes | — | FK to `stock_reason_codes` or custom | Reason (per Part 7) | Internal |
| `impact_description` | TEXT | No | NULL | — | Impact on production | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Supervisor approval | Internal |

---

## Entity 079 — Finished Goods Receipt

### 1. Business Purpose
Moves manufactured goods into inventory. Per Part 7: *"Inventory updated only after QC Release (configurable)."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `FGR-` | Receipt code | Internal |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Source batch | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Finished product | Internal |
| `received_quantity` | DECIMAL(18,4) | Yes | — | > 0 | Quantity received | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms` | UOM | Internal |
| `destination_warehouse_id` | UUID | Yes | — | FK to `facilities` | FG warehouse | Internal |
| `destination_location_id` | UUID | Yes | — | FK to `locations` | Bin location | Internal |
| `qc_status` | ENUM | Yes | `PASSED` | PENDING, PASSED, FAILED | QC release status (per Part 7) | Confidential |
| `receipt_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Receipt timestamp | Internal |
| `ledger_entry_id` | UUID | No | NULL | FK to `inventory_ledger` | PRODUCTION_IN ledger entry | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, CANCELLED | Status | Internal |

### 5-16. Standard Pattern
- **Validation**: Cannot complete if `qc_status != PASSED` (unless config override).
- **Integration**: Writes PRODUCTION_IN entry to Inventory Ledger (Entity 022).

---

## Entity 080 — Production Genealogy

### 1. Business Purpose
Maintains complete traceability matrix for a manufacturing batch. Per Part 7: *"Supports complete recalls."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Output batch | Internal |
| `ingredient_batch_id` | UUID | Yes | — | FK to `batches` | Input batch | Internal |
| `ingredient_lot_id` | UUID | No | NULL | FK to `lots` | Input lot | Internal |
| `supplier_id` | UUID | No | NULL | FK to `suppliers` | Supplier of input | Internal |
| `purchase_order_id` | UUID | No | NULL | FK to `purchase_orders` | Source PO | Internal |
| `consumed_quantity` | DECIMAL(18,4) | Yes | — | > 0 | Quantity used | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms` | UOM | Internal |
| `genealogy_path` | TEXT | Yes | — | — | Materialized path string | Internal |

---

## Entity 081 — Machine Master

### 1. Business Purpose
Represents every production machine. Per Part 7: *"Machine Code immutable. Machine cannot be deleted. Every machine belongs to one Work Center."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `MAC-` | Machine code (immutable) | Public | |
| `name` | VARCHAR(200) | Yes | — | — | Display name | Public | |
| `serial_number` | VARCHAR(100) | No | NULL | — | Manufacturer serial | Internal | |
| `manufacturer` | VARCHAR(100) | No | NULL | — | Make | Internal | |
| `model` | VARCHAR(100) | No | NULL | — | Model | Internal | |
| `plant_id` | UUID | Yes | — | FK to `facilities` | Plant | Internal | |
| `work_center_id` | UUID | Yes | — | FK to `work_centers` | Parent WC (per Part 7) | Internal | |
| `installation_date` | DATE | No | NULL | — | Install date | Internal | |
| `capacity_per_hour` | DECIMAL(18,4) | No | NULL | > 0 | Max capacity | Internal | |
| `machine_status` | ENUM | Yes | `AVAILABLE` | AVAILABLE, RUNNING, IDLE, MAINTENANCE, BREAKDOWN, CALIBRATION, RETIRED (per Part 7) | Live status | Internal | Predictive AI |
| `iot_device_id` | VARCHAR(50) | No | NULL | — | Connected IoT device (Mfg 4.0) | Internal | IoT AI |
| `digital_twin_enabled` | BOOLEAN | Yes | `false` | — | Digital twin active (Mfg 4.0) | Internal | Digital Twin |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Master status | Internal | |

---

## Entity 082 — Production Area

### 1. Business Purpose
Logical manufacturing zone (Raw Material Prep, Mixing, Cooking, Cooling, Packing, Finished Goods).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `AREA-` | Area code | Internal |
| `name` | VARCHAR(200) | Yes | — | — | Display name | Public |
| `plant_id` | UUID | Yes | — | FK to `facilities` | Plant | Internal |
| `supervisor_user_id` | UUID | No | NULL | FK to `user_accounts` | Area supervisor | Internal |
| `capacity` | DECIMAL(18,4) | No | NULL | > 0 | Area capacity | Internal |
| `temperature_zone` | ENUM | No | `AMBIENT` | AMBIENT, COLD, FROZEN, HOT | Temp class (per Part 7) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 083 — Work Center Resource

### 1. Business Purpose
Groups machines with similar capabilities. Extends Work Center (074) with resource metrics.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `work_center_id` | UUID | Yes | — | FK to `work_centers` | Parent WC | Internal |
| `machine_count` | INTEGER | Yes | `0` | ≥ 0 | Total machines | Internal |
| `available_machines` | INTEGER | Yes | `0` | ≥ 0 | Currently available | Internal |
| `capacity_utilization_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Current utilization | Internal |
| `operating_hours` | JSONB | No | `'{}'` | — | Operating hours config | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, OVERLOADED | Status | Internal |

---

## Entity 084 — Tool & Equipment

### 1. Business Purpose
Tracks reusable production tools (Mixing Blade, Molds, Cutting Knife, Packaging Die, etc.).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `TOOL-` | Tool code | Internal |
| `name` | VARCHAR(200) | Yes | — | — | Display name | Public |
| `machine_id` | UUID | No | NULL | FK to `machines` | Associated machine | Internal |
| `calibration_due_date` | DATE | No | NULL | — | Next calibration | Confidential |
| `condition` | ENUM | Yes | `GOOD` | GOOD, FAIR, POOR, BROKEN | Current condition | Internal |
| `status` | ENUM | Yes | `AVAILABLE` | AVAILABLE, IN_USE, MAINTENANCE, RETIRED | Status | Internal |

---

## Entity 085 — Operator Master

### 1. Business Purpose
Production workforce extension (links to Employee/Person in Identity Domain).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `employee_id` | UUID | Yes | — | FK to `employees`, UNIQUE | Linked employee | Internal |
| `skill_grade` | ENUM | Yes | `BEGINNER` | BEGINNER, INTERMEDIATE, ADVANCED, EXPERT | Overall grade | Internal |
| `certification_level` | VARCHAR(50) | No | NULL | — | Certification level | Confidential |
| `experience_years` | DECIMAL(4,1) | No | NULL | ≥ 0 | Years of experience | Internal |
| `primary_work_center_id` | UUID | Yes | — | FK to `work_centers` | Primary WC | Internal |
| `shift_id` | UUID | No | NULL | FK to `shifts` | Default shift | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ON_LEAVE | Status | Internal |

---

## Entity 086 — Skill Matrix

### 1. Business Purpose
Defines operator competencies per machine/process. Per Part 7: Levels are BEGINNER, INTERMEDIATE, ADVANCED, EXPERT, TRAINER.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `operator_id` | UUID | Yes | — | FK to `operators` (Entity 085) | Operator | Internal |
| `machine_id` | UUID | No | NULL | FK to `machines` | Machine skill | Internal |
| `work_center_id` | UUID | No | NULL | FK to `work_centers` | Process skill | Internal |
| `skill_level` | ENUM | Yes | `BEGINNER` | BEGINNER, INTERMEDIATE, ADVANCED, EXPERT, TRAINER (per Part 7) | Level | Internal |
| `certified` | BOOLEAN | Yes | `false` | — | Certified flag | Confidential |
| `certification_expiry` | DATE | No | NULL | — | Expiry date | Confidential |
| `trainer_user_id` | UUID | No | NULL | FK to `user_accounts` | Who certified | Internal |

---

## Entity 087 — Machine Assignment

### 1. Business Purpose
Assigns machines to production executions. Per Part 7: *"No double booking. Machine availability validated."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `machine_id` | UUID | Yes | — | FK to `machines` | Machine | Internal |
| `execution_id` | UUID | Yes | — | FK to `production_executions` | Execution | Internal |
| `operator_user_id` | UUID | Yes | — | FK to `user_accounts` | Operator | Internal |
| `start_time` | TIMESTAMPTZ | Yes | — | — | Assignment start | Internal |
| `end_time` | TIMESTAMPTZ | No | NULL | — | Assignment end | Internal |
| `shift_id` | UUID | Yes | — | FK to `shifts` | Shift | Internal |
| `status` | ENUM | Yes | `ASSIGNED` | ASSIGNED, IN_USE, COMPLETED, CANCELLED | Status | Internal |

---

## Entity 088 — Machine Downtime

### 1. Business Purpose
Tracks machine stoppages (Breakdown, Maintenance, Cleaning, Power Failure, Setup, etc.).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `machine_id` | UUID | Yes | — | FK to `machines` | Machine | Internal | |
| `execution_id` | UUID | No | NULL | FK to `production_executions` | Affected execution | Internal | |
| `downtime_reason` | ENUM | Yes | — | BREAKDOWN, MAINTENANCE, CLEANING, POWER_FAILURE, SETUP, OPERATOR_DELAY, MATERIAL_DELAY, QUALITY_HOLD (per Part 7) | Reason | Internal | Prediction AI |
| `start_time` | TIMESTAMPTZ | Yes | — | — | Start of downtime | Internal | |
| `end_time` | TIMESTAMPTZ | No | NULL | — | End of downtime | Internal | |
| `duration_min` | INTEGER | No | NULL | ≥ 0 | Duration | Internal | |
| `impact_description` | TEXT | No | NULL | — | Production impact | Internal | |
| `resolved_by` | UUID | No | NULL | FK to `user_accounts` | Who resolved | Internal | |
| `root_cause` | TEXT | No | NULL | — | Root cause analysis | Internal | |

---

## Entity 089 — Utility Consumption

### 1. Business Purpose
Tracks production utilities (Electricity, Steam, Gas, Water, Compressed Air, Fuel).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `machine_id` | UUID | No | NULL | FK to `machines` | Consuming machine | Internal | |
| `execution_id` | UUID | No | NULL | FK to `production_executions` | Consuming execution | Internal | |
| `utility_type` | ENUM | Yes | — | ELECTRICITY, STEAM, GAS, WATER, COMPRESSED_AIR, FUEL (per Part 7) | Utility | Internal | Energy AI |
| `consumption_qty` | DECIMAL(18,4) | Yes | — | ≥ 0 | Quantity consumed | Internal | |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | UOM (kWh, m3, kg) | Internal | |
| `unit_cost` | DECIMAL(18,4) | Yes | — | ≥ 0 | Cost per unit | Confidential | |
| `total_cost` | DECIMAL(18,4) | Yes | — | Generated: `qty * unit_cost` | Total cost | Confidential | |
| `timestamp` | TIMESTAMPTZ | Yes | `NOW()` | — | Reading time | Internal | |
| `iot_sensor_id` | VARCHAR(50) | No | NULL | — | IoT sensor (Mfg 4.0) | Internal | IoT |

---

## Entity 090 — OEE Snapshot

### 1. Business Purpose
Stores Overall Equipment Effectiveness. Per Part 7: `Availability × Performance × Quality = OEE`.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `machine_id` | UUID | Yes | — | FK to `machines` | Machine | Internal |
| `work_center_id` | UUID | No | NULL | FK to `work_centers` | Work Center | Internal |
| `shift_id` | UUID | Yes | — | FK to `shifts` | Shift | Internal |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `availability_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Availability % | Internal |
| `performance_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Performance % | Internal |
| `quality_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Quality % | Internal |
| `oee_score` | DECIMAL(5,2) | Yes | — | Generated: `(A * P * Q) / 10000` | OEE Score | Internal |
| `loss_time_min` | INTEGER | Yes | `0` | ≥ 0 | Total loss time | Internal |
| `production_count` | INTEGER | Yes | `0` | ≥ 0 | Total produced | Internal |
| `reject_count` | INTEGER | Yes | `0` | ≥ 0 | Total rejected | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Part 7 Sections 3 & 4 Completion Summary

**All 20 Production Execution & Resource Management entities are now defined** at full enterprise-grade depth.

### Key Architectural Decisions

1. **Production Order–driven execution** — No production without authorized order (per Part 7 Sec 3).
2. **Barcode validation at every critical step** — Material Issue (072), Checkpoints (077) require barcode verification.
3. **Immediate inventory synchronization** — Material Issue writes PRODUCTION_OUT, FG Receipt writes PRODUCTION_IN to Inventory Ledger immediately.
4. **Full production genealogy** — Entity 080 maintains complete traceability matrix (Finished Product → Batch → Recipe → Ingredient → Supplier → PO).
5. **Mandatory execution checkpoints** — Sequence cannot be skipped (Entity 077).
6. **Configurable QC release** — Inventory updated only after QC Release (Entity 079, configurable).
7. **Operator accountability** — Assignments (076), Skill Matrix (086), Performance Scores.
8. **Machine accountability** — Machine Master (081), Downtime tracking (088), OEE Snapshots (090).
9. **Real-time execution monitoring** — `real_time_metrics` JSONB on Execution (071) feeds Manufacturing Command Center.
10. **AI-ready execution history** — All entities partitioned monthly, structured for AI consumption.
11. **Enterprise machine registry** — Machine Code immutable, cannot be deleted (Entity 081).
12. **Skill-based labor assignment** — Skill Matrix (086) validates operator competency before assignment.
13. **OEE integrated** — Standard formula `Availability × Performance × Quality` (Entity 090).
14. **Manufacturing 4.0 ready** — `iot_device_id`, `digital_twin_enabled`, `sensor_data_stream` fields on Machine, Utility, Execution.
15. **Manufacturing Command Center** — Live status, OEE, delays, AI recommendations consumable via `execution_status` and `real_time_metrics`.

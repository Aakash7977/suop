# Manual 1 · Part 13 · Sections 1-3 · Entities 511-540 — Asset Foundation, Hierarchy & Preventive Maintenance

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 13 — Enterprise Asset & Maintenance Management (EAM) |
| Sections | 1 (Enterprise Asset Foundation & Asset Lifecycle), 2 (Asset Master, Classification & Asset Hierarchy), 3 (Preventive Maintenance, Maintenance Planning & Work Orders) |
| Entities | 511–540 |
| Version | 1.0.0 |
| Status | ACTIVE — LOCKED |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 9 §9.8, Part 13 §1-3 |
| Last Updated | 2026-07-08 |

---

## Overview — Enterprise Asset & Maintenance Management Architecture

Part 13 covers the **last major business module** before platform services and AI. EAM integrates directly with Manufacturing, Warehouse, Procurement, Finance, and HR — closing the loop between asset ownership, operational availability, and financial accountability.

```
ASSET FOUNDATION (Sec 1: 511-520)
  Asset Master → Category → Lifecycle → Ownership → Health → Warranty → Location → Cost → History → Dashboard
  ↓ Structured by
ASSET HIERARCHY (Sec 2: 521-530)
  Enterprise → Company → Plant → Building → Floor → Line → Machine → Sub-Assembly → Component
  + Classification → Criticality → Grouping → QR/Barcode → Documentation → Spare Mapping → Utility Consumption
  ↓ Maintained via
PREVENTIVE MAINTENANCE (Sec 3: 531-540)
  Maintenance Plan → Schedule → Work Order → Tasks → Checklist → Technician Assignment → History → Calendar → SLA → Dashboard
```

### Integrated Enhancement: Enterprise Maintenance Execution Engine (Architectural Lock Q174)

Per Chief Enterprise Architect recommendation, a dedicated **Enterprise Maintenance Execution Engine** is hereby locked as **Foundation Service #31** (shared platform service). This engine orchestrates the closed-loop maintenance process:

```
IoT Sensors ─┐
Machine Runtime ─┤
Maintenance Plans ─┤
Inspection Results ─┴──► Maintenance Execution Engine ──► PM Scheduling
                          (orchestration, closed-loop)        ├─► Work Orders
                                                              ├─► Technician Assignment
                                                              ├─► Inventory Reservation
                                                              ├─► Accounting Event
                                                              └─► Maintenance Analytics
```

**Engine Integrations (Locked)**:
- **Manufacturing** (Part 7): Machine downtime and production impact
- **Warehouse** (Part 6): Spare parts inventory reservation
- **Procurement** (Part 5): Automatic spare replenishment triggers
- **Finance** (Part 11): Maintenance cost posting via Accounting Event Engine
- **Workforce Management** (Part 12): Technician scheduling and skills matching

**Design Principle**: Closed-loop maintenance process — not an isolated maintenance module. Every maintenance event triggers downstream effects across inventory, procurement, finance, and workforce modules.

---

# SECTION 1: Enterprise Asset Foundation & Asset Lifecycle (Entities 511-520)

## Entity 511 — Asset Master

### 1. Business Purpose
Per Part 13 §1: Central register of all enterprise assets. Asset Code, Asset Name, Asset Type, Category, Manufacturer, Model, Serial Number, Purchase Date, Commission Date, Warranty Expiry, Current Status.

### 2. Architectural Role
Master entity — single source of truth for all enterprise assets. Each asset has a unique identity tracked through its entire lifecycle from planning to disposal.

### 3. Business Rules
- Asset Code is unique per company (governance-controlled numbering scheme)
- One asset = one physical asset (no consolidation); sub-assemblies are separate assets linked via hierarchy
- Critical assets (per Criticality Matrix, Entity 524) cannot be deleted — only retired
- Status transitions are governed by Asset Lifecycle state machine (Entity 513)
- All financial data flows to Finance via Accounting Event Engine
- Asset identity immutable once commissioned (only metadata editable)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_code` | VARCHAR(30) | Yes | — | Unique per company | Asset Code (per Part 13) | Internal |
| `asset_name` | VARCHAR(200) | Yes | — | Min 3 | Asset Name (per Part 13) | Internal |
| `asset_type` | ENUM | Yes | — | MANUFACTURING_MACHINE, BOILER, CHILLER, MIXER, PACKING_MACHINE, CONVEYOR, WAREHOUSE_EQUIPMENT, FORKLIFT, RETAIL_EQUIPMENT, RESTAURANT_KITCHEN_EQUIPMENT, VEHICLE, IT_EQUIPMENT, BUILDING, UTILITY_EQUIPMENT, OTHER | Asset Type (per Part 13) | Internal |
| `category_id` | UUID | Yes | — | FK to `asset_categories` (Entity 512) | Category (per Part 13) | Internal |
| `manufacturer` | VARCHAR(200) | No | NULL | — | Manufacturer (per Part 13) | Internal |
| `model` | VARCHAR(200) | No | NULL | — | Model (per Part 13) | Internal |
| `serial_number` | VARCHAR(100) | No | NULL | — | Serial Number (per Part 13) | Confidential |
| `asset_tag_number` | VARCHAR(50) | No | NULL | — | Physical tag number | Internal |
| `barcode_value` | VARCHAR(100) | No | NULL | — | Barcode (per Part 13) | Internal |
| `qr_code_value` | VARCHAR(100) | No | NULL | — | QR code | Internal |
| `rfid_tag` | VARCHAR(100) | No | NULL | — | RFID tag | Confidential |
| `nfc_tag` | VARCHAR(100) | No | NULL | — | NFC tag | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Owning company | Internal |
| `purchase_date` | DATE | Yes | — | — | Purchase Date (per Part 13) | Internal |
| `commission_date` | DATE | No | NULL | ≥ purchase_date | Commission Date (per Part 13) | Internal |
| `installation_date` | DATE | No | NULL | — | Installation date | Internal |
| `warranty_expiry_date` | DATE | No | NULL | > commission_date | Warranty Expiry (per Part 13) | Internal |
| `amc_expiry_date` | DATE | No | NULL | — | AMC expiry | Internal |
| `current_status` | ENUM | Yes | `PLANNED` | PLANNED, ORDERED, INSTALLED, ACTIVE, UNDER_MAINTENANCE, IDLE, TRANSFERRED, RETIRED, DISPOSED | Current Status (per Part 13) | Internal |
| `lifecycle_state_id` | UUID | Yes | — | FK to `asset_lifecycle` (Entity 513) | Lifecycle state | Internal |
| `ownership_id` | UUID | Yes | — | FK to `asset_ownership` (Entity 514) | Ownership | Internal |
| `location_id` | UUID | Yes | — | FK to `asset_locations` (Entity 517) | Location | Internal |
| `health_id` | UUID | No | NULL | FK to `asset_health` (Entity 515) | Health | Confidential |
| `cost_id` | UUID | Yes | — | FK to `asset_cost` (Entity 518) | Cost | Confidential |
| `parent_asset_id` | UUID | No | NULL | FK to `asset_master` (self) | Parent asset | Internal |
| `hierarchy_node_id` | UUID | No | NULL | FK to `asset_hierarchy` (Entity 521) | Hierarchy node | Internal |
| `criticality_level` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW | Criticality (per Entity 524) | Internal |
| `is_iot_enabled` | BOOLEAN | Yes | `false` | — | IoT sensors attached | Internal |
| `iot_device_id` | VARCHAR(100) | No | NULL | — | IoT device identifier | Confidential |
| `image_attachment_id` | UUID | No | NULL | FK to `attachments` | Asset image | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `custom_attributes` | JSONB | Yes | `'{}'` | — | Type-specific attributes | Internal |
| `retirement_date` | DATE | No | NULL | — | Retirement date | Internal |
| `disposal_date` | DATE | No | NULL | ≥ retirement_date | Disposal date | Internal |
| `disposal_method` | ENUM | No | NULL | SALE, SCRAP, DONATION, TRADE_IN, WRITE_OFF | Disposal method | Internal |
| `disposal_value` | DECIMAL(18,4) | No | NULL | ≥ 0 | Disposal proceeds | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, RETIRED, DISPOSED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Category (512) | Many-to-One | N:1 | Category |
| Asset Lifecycle (513) | Many-to-One | N:1 | Current lifecycle state |
| Asset Ownership (514) | One-to-One | 1:1 | Ownership record |
| Asset Health (515) | One-to-One | 1:1 | Health record |
| Asset Warranty (516) | One-to-One | 1:1 | Warranty |
| Asset Location (517) | One-to-One | 1:1 | Location |
| Asset Cost (518) | One-to-One | 1:1 | Cost record |
| Asset History (519) | One-to-Many | 1:N | History events |
| Asset Hierarchy (521) | Many-to-One | N:1 | Hierarchy node |
| Parent Asset (511) | Self-reference | N:1 | Parent in hierarchy |

### 6. Indexes
- UNIQUE (`asset_code`)
- UNIQUE (`serial_number`) WHERE `serial_number IS NOT NULL`
- INDEX (`company_id`, `current_status`)
- INDEX (`asset_type`, `category_id`)
- INDEX (`criticality_level`, `current_status`)
- INDEX (`parent_asset_id`)
- INDEX (`warranty_expiry_date`)
- INDEX (`qr_code_value`) WHERE `qr_code_value IS NOT NULL`

### 7. Security Classification
**Internal** — serial numbers, RFID, NFC, and IoT device IDs are **Confidential**.

### 8. Integration Points
- **Manufacturing** (Part 7): Asset = machine in production line
- **Warehouse** (Part 6): Asset = warehouse equipment (forklifts, conveyors)
- **Retail** (Part 9): Asset = POS, refrigeration
- **Restaurant** (Part 10): Asset = kitchen equipment
- **Finance** (Part 11): Fixed Asset Register, depreciation
- **HR** (Part 12): Asset assignment to employees (Entity 425 in onboarding)
- **Procurement** (Part 5): Asset purchase from supplier
- **Maintenance Execution Engine** (Q174): All maintenance activities

### 9. Sample Data
```json
{
  "asset_code": "MFG-MUM-L1-MIX-001", "asset_name": "Industrial Mixer - Line 1",
  "asset_type": "MIXER", "category_id": "cat-mixer",
  "manufacturer": "Hindustan Engineers", "model": "HM-2000-L",
  "serial_number": "HE-2024-001234", "barcode_value": "BC-MIX-001",
  "qr_code_value": "QR-MFG-MUM-L1-MIX-001", "company_id": "cmp-001",
  "purchase_date": "2024-03-15", "commission_date": "2024-04-01",
  "warranty_expiry_date": "2026-04-01", "current_status": "ACTIVE",
  "criticality_level": "HIGH", "is_iot_enabled": true,
  "iot_device_id": "IOT-MIX-001", "status": "ACTIVE"
}
```

### 10. Audit Events
`ASSET_CREATED`, `ASSET_COMMISSIONED`, `ASSET_TRANSFERRED`, `ASSET_RETIRED`, `ASSET_DISPOSED`, `ASSET_STATUS_CHANGED`, `ASSET_IOT_REGISTERED`

---

## Entity 512 — Asset Category

### 1. Business Purpose
Per Part 13 §1: Examples include Manufacturing Machine, Warehouse Equipment, Restaurant Equipment, Retail Equipment, Building, Vehicle, IT Equipment, Utility Equipment.

### 2. Architectural Role
Master entity — classification of assets by type. Drives default attributes, depreciation rules, and maintenance templates.

### 3. Business Rules
- Categories are hierarchical (parent-child relationship)
- Each category has default depreciation profile (Finance integration)
- Categories drive maintenance plan templates
- Critical categories (manufacturing, utility) require stricter compliance
- Categories cannot be deleted if assets exist — only deactivated

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `category_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `category_name` | VARCHAR(100) | Yes | — | Min 3 | Display name (per Part 13) | Internal |
| `parent_category_id` | UUID | No | NULL | FK to `asset_categories` (self) | Parent category | Internal |
| `category_type` | ENUM | Yes | — | MANUFACTURING_MACHINE, WAREHOUSE_EQUIPMENT, RESTAURANT_EQUIPMENT, RETAIL_EQUIPMENT, BUILDING, VEHICLE, IT_EQUIPMENT, UTILITY_EQUIPMENT, OTHER | Type (per Part 13) | Internal |
| `default_depreciation_method` | ENUM | Yes | `STRAIGHT_LINE` | STRAIGHT_LINE, DECLINING_BALANCE, UNITS_OF_PRODUCTION, NONE | Depreciation | Confidential |
| `default_useful_life_years` | INTEGER | No | NULL | > 0 | Default useful life | Internal |
| `default_criticality` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW | Default criticality | Internal |
| `default_maintenance_template_id` | UUID | No | NULL | FK to `maintenance_plans` (Entity 531) | Default PM plan | Internal |
| `default_warranty_months` | INTEGER | No | NULL | > 0 | Default warranty period | Internal |
| `requires_iot_monitoring` | BOOLEAN | Yes | `false` | — | IoT monitoring default | Internal |
| `requires_calibration` | BOOLEAN | Yes | `false` | — | Calibration required | Internal |
| `requires_statutory_inspection` | BOOLEAN | Yes | `false` | — | Statutory inspection | Internal |
| `gl_asset_account_code` | VARCHAR(30) | No | NULL | FK to `gl_accounts` | Fixed asset GL | Confidential |
| `gl_depreciation_account_code` | VARCHAR(30) | No | NULL | FK to `gl_accounts` | Depreciation GL | Confidential |
| `gl_maintenance_account_code` | VARCHAR(30) | No | NULL | FK to `gl_accounts` | Maintenance expense GL | Confidential |
| `insurance_required` | BOOLEAN | Yes | `false` | — | Insurance mandatory | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `hierarchy_level` | INTEGER | Yes | `1` | ≥ 1 | Level in hierarchy | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | One-to-Many | 1:N | Assets in this category |
| Parent Category (512) | Self-reference | N:1 | Parent |
| Maintenance Plan (531) | Many-to-One | N:1 | Default PM template |
| GL Accounts (Part 11) | Many-to-One | N:1 | Financial postings |

### 6. Indexes
- UNIQUE (`category_code`)
- INDEX (`parent_category_id`)
- INDEX (`category_type`, `status`)

### 7. Security Classification
**Internal** — GL account mappings are **Confidential**.

### 8. Integration Points
- **Finance** (Part 11): Depreciation, GL postings
- **Maintenance Execution Engine** (Q174): Default PM templates
- **Asset Master** (E511): Category defaults applied at creation

### 9. Sample Data
```json
{
  "category_code": "CAT-MIXER", "category_name": "Industrial Mixers",
  "category_type": "MANUFACTURING_MACHINE",
  "default_depreciation_method": "STRAIGHT_LINE", "default_useful_life_years": 10,
  "default_criticality": "HIGH", "requires_iot_monitoring": true,
  "requires_calibration": true, "requires_statutory_inspection": false,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`ASSET_CATEGORY_CREATED`, `ASSET_CATEGORY_UPDATED`, `ASSET_CATEGORY_INACTIVATED`, `ASSET_CATEGORY_GL_CHANGED`

---

## Entity 513 — Asset Lifecycle

### 1. Business Purpose
Per Part 13 §1: Tracks Planned, Ordered, Installed, Active, Under Maintenance, Idle, Transferred, Retired, Disposed. State machine governing asset status transitions.

### 2. Architectural Role
State machine entity — defines valid transitions and triggers for each state change. Every transition creates an immutable history record.

### 3. Business Rules
- State machine: PLANNED → ORDERED → INSTALLED → ACTIVE → (UNDER_MAINTENANCE ↔ ACTIVE) → IDLE → TRANSFERRED → RETIRED → DISPOSED
- Each transition has rules (e.g., cannot dispose an ACTIVE asset — must RETIRE first)
- Transitions trigger workflows (e.g., ACTIVE → UNDER_MAINTENANCE creates work order link)
- RETIRED assets retain history but cannot be reactivated (must create new asset)
- DISPOSED assets trigger Finance disposal accounting event

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `current_state` | ENUM | Yes | — | PLANNED, ORDERED, INSTALLED, ACTIVE, UNDER_MAINTENANCE, IDLE, TRANSFERRED, RETIRED, DISPOSED | Current state (per Part 13) | Internal |
| `previous_state` | ENUM | No | NULL | — | Previous state | Internal |
| `state_entered_at` | TIMESTAMPTZ | Yes | `now()` | — | State entry timestamp | Internal |
| `state_exited_at` | TIMESTAMPTZ | No | NULL | — | State exit timestamp | Internal |
| `transition_trigger` | ENUM | Yes | — | MANUAL, AUTOMATIC, WORKFLOW, IoT_ALERT, INSPECTION, TIME_BASED, EXTERNAL | Trigger | Internal |
| `transition_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `triggered_by` | UUID | No | NULL | FK to `workforce_master` | User | Confidential |
| `triggered_by_system` | VARCHAR(50) | No | NULL | — | System module | Internal |
| `transition_metadata` | JSONB | No | NULL | — | Additional context | Confidential |
| `work_order_id` | UUID | No | NULL | FK to `work_orders` (Entity 533) | Linked work order (if maintenance) | Internal |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Finance impact (e.g., disposal) | Confidential |
| `duration_in_state_days` | DECIMAL(10,2) | No | NULL | ≥ 0 | Duration in previous state | Internal |
| `is_active_state` | BOOLEAN | Yes | `true` | — | Currently active | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, HISTORICAL | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-One | N:1 | Asset |
| Work Order (533) | Many-to-One | N:1 | Linked maintenance |
| Accounting Event | One-to-One | 1:1 | Financial impact |

### 6. Indexes
- INDEX (`asset_id`, `state_entered_at`)
- INDEX (`current_state`, `is_active_state`)
- INDEX (`transition_trigger`)

### 7. Security Classification
**Internal** — transition reasons are **Confidential**.

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): State transitions
- **Accounting Event Engine** (Part 11): Disposal/retirement postings
- **Workflow Engine**: Transition workflows
- **Notification Service**: State change alerts

### 9. Sample Data
```json
{
  "asset_id": "wf-001", "current_state": "ACTIVE", "previous_state": "UNDER_MAINTENANCE",
  "state_entered_at": "2026-07-08T10:00:00Z", "transition_trigger": "WORKFLOW",
  "transition_reason": "PM completed; asset returned to active service",
  "triggered_by": "wf-tech-001", "triggered_by_system": "MAINTENANCE_ENGINE",
  "work_order_id": "wo-001", "duration_in_state_days": 0.50,
  "is_active_state": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`ASSET_LIFECYCLE_TRANSITION`, `ASSET_STATE_ENTERED`, `ASSET_STATE_EXITED`, `ASSET_RETIRED`, `ASSET_DISPOSED`

---

## Entity 514 — Asset Ownership

### 1. Business Purpose
Per Part 13 §1: Stores Company, Plant, Warehouse, Department, Cost Center, Responsible Manager. Asset accountability and cost attribution.

### 2. Architectural Role
Assignment entity — links asset to organizational ownership. Drives cost center allocation and maintenance responsibility.

### 3. Business Rules
- One asset has one current ownership record (history retained)
- Ownership changes require approval workflow
- Cost center drives GL posting for maintenance expenses
- Responsible Manager receives notifications for maintenance, downtime
- Inter-company transfers require Finance approval (cross-company asset transfer)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company (per Part 13) | Internal |
| `plant_id` | UUID | No | NULL | FK to `facilities` (type=PLANT) | Plant | Internal |
| `warehouse_id` | UUID | No | NULL | FK to `facilities` (type=WAREHOUSE) | Warehouse | Internal |
| `store_id` | UUID | No | NULL | FK to `facilities` (type=STORE) | Retail store | Internal |
| `restaurant_id` | UUID | No | NULL | FK to `facilities` (type=RESTAURANT) | Restaurant | Internal |
| `department_id` | UUID | No | NULL | FK to `departments` | Department (per Part 13) | Internal |
| `cost_center_id` | UUID | Yes | — | FK to `cost_centers` | Cost Center (per Part 13) | Confidential |
| `responsible_manager_id` | UUID | Yes | — | FK to `workforce_master` | Responsible Manager (per Part 13) | Confidential |
| `responsible_department_id` | UUID | No | NULL | FK to `departments` | Responsible department | Internal |
| `ownership_type` | ENUM | Yes | `OWNED` | OWNED, LEASED, RENTED, FINANCED, BORROWED | Ownership type | Internal |
| `ownership_pct` | DECIMAL(5,2) | Yes | `100.00` | 0-100 | Ownership percentage (shared assets) | Confidential |
| `lease_start_date` | DATE | No | NULL | — | Lease start (if LEASED) | Internal |
| `lease_end_date` | DATE | No | NULL | — | Lease end | Internal |
| `lease_vendor_id` | UUID | No | NULL | FK to `vendors` | Lease vendor | Internal |
| `monthly_lease_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Lease payment | Confidential |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `transfer_reason` | TEXT | No | NULL | — | Reason for transfer | Confidential |
| `is_current` | BOOLEAN | Yes | `true` | — | Current ownership | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, HISTORICAL | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | One-to-One | 1:1 | Current ownership |
| Company | Many-to-One | N:1 | Owner company |
| Facility | Many-to-One | N:1 | Physical location |
| Department | Many-to-One | N:1 | Owning department |
| Cost Center (Part 11) | Many-to-One | N:1 | Cost attribution |
| Workforce Master (381) | Many-to-One | N:1 | Responsible manager |
| Vendor (Part 5) | Many-to-One | N:1 | Lease vendor |

### 6. Indexes
- INDEX (`asset_id`, `is_current`)
- INDEX (`company_id`, `cost_center_id`)
- INDEX (`responsible_manager_id`)
- INDEX (`effective_from`, `effective_to`)

### 7. Security Classification
**Confidential** — cost center and lease details.

### 8. Integration Points
- **Finance** (Part 11): Cost center for maintenance expense
- **HR** (Part 12): Responsible manager notifications
- **Procurement** (Part 5): Lease vendor management
- **Notification Service**: Manager alerts

### 9. Sample Data
```json
{
  "asset_id": "asset-001", "company_id": "cmp-001",
  "plant_id": "fac-mum", "department_id": "dept-mfg",
  "cost_center_id": "cc-mfg-mum-001", "responsible_manager_id": "wf-100",
  "ownership_type": "OWNED", "ownership_pct": 100.00,
  "effective_from": "2024-04-01", "is_current": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`ASSET_OWNERSHIP_ASSIGNED`, `ASSET_OWNERSHIP_TRANSFERRED`, `ASSET_OWNERSHIP_UPDATED`, `ASSET_LEASE_REGISTERED`

---

## Entity 515 — Asset Health

### 1. Business Purpose
Per Part 13 §1: Measures Health Score, Running Hours, Downtime, Failure Count, Last Service, Next Service. Real-time asset health monitoring.

### 2. Architectural Role
Computed + IoT-fed entity — health score is algorithmically derived from multiple signals (running hours, failures, vibration, temperature, etc.). Drives predictive maintenance.

### 3. Business Rules
- Health Score: 0-100 (100 = excellent, < 50 = critical)
- Score computed by AI model based on: running hours, failure history, vibration patterns, temperature, oil quality, last service age
- Real-time update via IoT sensors (every 5 min typical)
- Manual update on inspection
- Health < threshold triggers auto-work-order for inspection
- Downtime tracked for OEE calculation (Manufacturing integration)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `health_score` | DECIMAL(5,2) | Yes | — | 0-100 | Health Score (per Part 13) | Confidential |
| `health_category` | ENUM | Yes | — | EXCELLENT, GOOD, FAIR, POOR, CRITICAL | Category | Confidential |
| `health_trend_30d` | JSONB | Yes | `'[]'` | — | 30-day trend | Confidential |
| `running_hours_total` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Total running hours (per Part 13) | Internal |
| `running_hours_since_last_service` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Hours since last service | Internal |
| `running_hours_today` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Hours today | Internal |
| `downtime_hours_total` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Total downtime (per Part 13) | Internal |
| `downtime_hours_today` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Downtime today | Internal |
| `downtime_pct_30d` | DECIMAL(5,2) | Yes | `0` | 0-100 | 30-day downtime % | Internal |
| `failure_count_total` | INTEGER | Yes | `0` | ≥ 0 | Total failures (per Part 13) | Internal |
| `failure_count_30d` | INTEGER | Yes | `0` | ≥ 0 | Failures in 30 days | Internal |
| `mtbf_hours` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Mean Time Between Failures | Confidential |
| `mttr_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Mean Time To Repair | Confidential |
| `last_service_date` | DATE | No | NULL | — | Last Service (per Part 13) | Internal |
| `last_service_work_order_id` | UUID | No | NULL | FK to `work_orders` (Entity 533) | Last service WO | Internal |
| `next_service_due_date` | DATE | No | NULL | — | Next Service (per Part 13) | Internal |
| `next_service_work_order_id` | UUID | No | NULL | FK to `work_orders` (Entity 533) | Scheduled WO | Internal |
| `next_service_due_hours` | DECIMAL(10,2) | No | NULL | ≥ 0 | Next service (meter-based) | Internal |
| `iot_sensor_readings` | JSONB | No | NULL | — | Latest IoT readings { vibration, temperature, pressure, ... } | Confidential |
| `iot_last_reading_at` | TIMESTAMPTZ | No | NULL | — | Last IoT reading | Internal |
| `ai_predicted_failure_date` | DATE | No | NULL | — | AI: predicted failure | Restricted |
| `ai_remaining_useful_life_days` | INTEGER | No | NULL | ≥ 0 | AI: RUL | Restricted |
| `ai_risk_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI: failure risk | Restricted |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model version | Internal |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `last_updated_at` | TIMESTAMPTZ | Yes | `now()` | — | Last update | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | One-to-One | 1:1 | Asset |
| Work Order (533) | Many-to-One | N:1 | Last/next service |
| IoT Service | External | — | Real-time sensor data |
| AI/ML Service | External | — | Predictive insights |

### 6. Indexes
- UNIQUE (`asset_id`) WHERE `status = 'ACTIVE'`
- INDEX (`health_category`)
- INDEX (`next_service_due_date`)
- INDEX (`ai_risk_score`)
- INDEX (`last_updated_at`)

### 7. Security Classification
**Confidential** — AI predictions are **Restricted**.

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): Triggers PM based on health
- **Manufacturing MES** (Part 7): Downtime for OEE
- **IoT Service**: Sensor data ingestion
- **AI/ML Service**: Predictive analytics
- **HR Mission Control** (Part 12): Workforce impact

### 9. Sample Data
```json
{
  "asset_id": "asset-001", "health_score": 82.50, "health_category": "GOOD",
  "running_hours_total": 15840.50, "running_hours_since_last_service": 480.25,
  "downtime_hours_total": 320.50, "downtime_pct_30d": 2.50,
  "failure_count_total": 5, "failure_count_30d": 0, "mtbf_hours": 3168.10,
  "mttr_hours": 4.50, "last_service_date": "2026-05-15",
  "next_service_due_date": "2026-08-15",
  "ai_predicted_failure_date": "2027-02-15", "ai_remaining_useful_life_days": 220,
  "ai_risk_score": 25.00, "ai_model_version": "v1.5.0",
  "last_updated_at": "2026-07-08T10:00:00Z", "status": "ACTIVE"
}
```

### 10. Audit Events
`ASSET_HEALTH_UPDATED`, `ASSET_HEALTH_DEGRADED`, `ASSET_HEALTH_CRITICAL`, `ASSET_IOT_READING_RECEIVED`, `ASSET_AI_PREDICTION_UPDATED`, `ASSET_FAILURE_PREDICTION_ALERT`

---

## Entity 516 — Asset Warranty

### 1. Business Purpose
Per Part 13 §1: Stores Warranty Provider, Start Date, End Date, Coverage, AMC. Warranty and Annual Maintenance Contract management.

### 2. Architectural Role
Compliance entity — tracks warranty validity and AMC coverage. Drives cost decisions (in-warranty vs chargeable maintenance).

### 3. Business Rules
- Warranty period: typically 12-24 months from commissioning
- AMC (Annual Maintenance Contract): renewable yearly; covers preventive + breakdown
- Coverage scope: PARTS_ONLY, LABOR_ONLY, PARTS_AND_LABOR, COMPREHENSIVE
- Exclusions: explicitly listed items not covered
- Claim process: notification to vendor → inspection → repair/replacement → closure
- Auto-alert 60 days before warranty/AMC expiry

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `warranty_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `warranty_type` | ENUM | Yes | — | MANUFACTURER_WARRANTY, EXTENDED_WARRANTY, AMC, CMC | Type | Internal |
| `warranty_provider` | VARCHAR(200) | Yes | — | Min 3 | Warranty Provider (per Part 13) | Internal |
| `provider_vendor_id` | UUID | No | NULL | FK to `vendors` | Vendor | Internal |
| `provider_contact` | JSONB | Yes | `'{}'` | — | Contact info | Confidential |
| `start_date` | DATE | Yes | — | — | Start Date (per Part 13) | Internal |
| `end_date` | DATE | Yes | — | > start_date | End Date (per Part 13) | Internal |
| `duration_months` | INTEGER | Yes | — | > 0 | Duration in months | Internal |
| `coverage_type` | ENUM | Yes | `PARTS_AND_LABOR` | PARTS_ONLY, LABOR_ONLY, PARTS_AND_LABOR, COMPREHENSIVE | Coverage (per Part 13) | Internal |
| `coverage_scope` | JSONB | Yes | `'[]'` | — | Covered components | Internal |
| `exclusions` | JSONB | Yes | `'[]'` | — | Excluded items | Internal |
| `annual_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | AMC annual cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `contract_document_id` | UUID | No | NULL | FK to `attachments` | Contract document | Confidential |
| `renewal_required` | BOOLEAN | Yes | `true` | — | Renewal needed | Internal |
| `renewal_notice_days` | INTEGER | Yes | `60` | ≥ 30 | Notice period | Internal |
| `claims_count` | INTEGER | Yes | `0` | ≥ 0 | Total claims | Internal |
| `claims_amount_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total claims amount | Confidential |
| `is_active` | BOOLEAN | Yes | `true` | — | Currently active | Internal |
| `expired_at` | TIMESTAMPTZ | No | NULL | — | Expiry timestamp | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, EXPIRED, CANCELLED, RENEWED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | One-to-One | 1:1 | Asset |
| Vendor (Part 5) | Many-to-One | N:1 | Provider |
| Warranty Claim | One-to-Many | 1:N | Claims |

### 6. Indexes
- UNIQUE (`warranty_code`)
- INDEX (`asset_id`, `is_active`)
- INDEX (`end_date`, `status`)
- INDEX (`provider_vendor_id`)

### 7. Security Classification
**Confidential** — contract and cost details.

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): In-warranty check before billing
- **Procurement** (Part 5): AMC renewal PO
- **Finance** (Part 11): AMC expense posting
- **Notification Service**: Expiry alerts

### 9. Sample Data
```json
{
  "warranty_code": "WAR-MIX-001", "asset_id": "asset-001",
  "warranty_type": "MANUFACTURER_WARRANTY", "warranty_provider": "Hindustan Engineers",
  "provider_vendor_id": "vnd-001", "start_date": "2024-04-01", "end_date": "2026-04-01",
  "duration_months": 24, "coverage_type": "COMPREHENSIVE",
  "coverage_scope": ["Motor", "Gearbox", "Control Panel"],
  "exclusions": ["Wear parts: seals, gaskets"],
  "renewal_required": false, "claims_count": 1, "claims_amount_total": 5000.0000,
  "is_active": false, "expired_at": "2026-04-01T00:00:00Z", "status": "EXPIRED"
}
```

### 10. Audit Events
`WARRANTY_REGISTERED`, `WARRANTY_CLAIM_FILED`, `WARRANTY_EXPIRED`, `WARRANTY_RENEWED`, `WARRANTY_CANCELLED`

---

## Entity 517 — Asset Location

### 1. Business Purpose
Per Part 13 §1: Supports Plant, Floor, Line, Warehouse, Store, Restaurant, Office. Physical location tracking of assets.

### 2. Architectural Role
Location entity — links asset to physical facility. Critical for asset tracking, maintenance dispatch, and inventory reconciliation.

### 3. Business Rules
- One asset has one current location (history retained)
- Location granularity: Plant → Building → Floor → Line → Workstation
- Special location types: WAREHOUSE, STORE, RESTAURANT, OFFICE
- GPS coordinates for mobile assets (vehicles, forklifts)
- Indoor positioning for fixed assets (BLE beacons)
- Location change = Asset Transfer workflow (per Entity 513)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `location_type` | ENUM | Yes | — | PLANT, WAREHOUSE, STORE, RESTAURANT, OFFICE, VEHICLE_DEPOT, FIELD | Type (per Part 13) | Internal |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Facility | Internal |
| `building` | VARCHAR(50) | No | NULL | — | Building | Internal |
| `floor` | VARCHAR(20) | No | NULL | — | Floor (per Part 13) | Internal |
| `line` | VARCHAR(50) | No | NULL | — | Production line (per Part 13) | Internal |
| `workstation` | VARCHAR(50) | No | NULL | — | Workstation | Internal |
| `section` | VARCHAR(50) | No | NULL | — | Section/zone | Internal |
| `room` | VARCHAR(50) | No | NULL | — | Room | Internal |
| `gps_latitude` | DECIMAL(10,7) | No | NULL | -90 to 90 | GPS lat (mobile assets) | Confidential |
| `gps_longitude` | DECIMAL(10,7) | No | NULL | -180 to 180 | GPS lon | Confidential |
| `indoor_position_beacon_id` | VARCHAR(100) | No | NULL | — | BLE beacon | Confidential |
| `qr_code_at_location` | VARCHAR(100) | No | NULL | — | Location QR | Internal |
| `location_description` | TEXT | No | NULL | — | Description | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `transfer_reason` | TEXT | No | NULL | — | Reason for transfer | Confidential |
| `is_current` | BOOLEAN | Yes | `true` | — | Current location | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, HISTORICAL | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | One-to-One | 1:1 | Current location |
| Facility | Many-to-One | N:1 | Facility |

### 6. Indexes
- INDEX (`asset_id`, `is_current`)
- INDEX (`facility_id`, `location_type`)
- INDEX (`effective_from`, `effective_to`)

### 7. Security Classification
**Confidential** — GPS coordinates for mobile assets.

### 8. Integration Points
- **Manufacturing** (Part 7): Production line positioning
- **Warehouse** (Part 6): Bin location for warehouse assets
- **IoT Service**: Real-time positioning
- **Asset Transfer Workflow**: Location change

### 9. Sample Data
```json
{
  "asset_id": "asset-001", "location_type": "PLANT", "facility_id": "fac-mum",
  "building": "B-1", "floor": "Ground", "line": "Line-1", "workstation": "WS-005",
  "section": "Mixing Section", "qr_code_at_location": "QR-LOC-MUM-B1-G-L1-WS5",
  "effective_from": "2024-04-01", "is_current": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`ASSET_LOCATION_ASSIGNED`, `ASSET_LOCATION_CHANGED`, `ASSET_TRANSFERRED_INTER_FACILITY`

---

## Entity 518 — Asset Cost

### 1. Business Purpose
Per Part 13 §1: Tracks Purchase Cost, Maintenance Cost, Running Cost, Utility Cost, Total Ownership Cost. Total Cost of Ownership (TCO) tracking.

### 2. Architectural Role
Financial entity — aggregates all costs associated with an asset over its lifetime. Feeds Finance for depreciation, impairment, and disposal accounting.

### 3. Business Rules
- Purchase cost: capitalized as fixed asset
- Maintenance cost: expensed (except major overhauls — capitalized)
- Running cost: consumables (lubricants, filters) — expensed
- Utility cost: allocated based on meter readings
- TCO = Purchase + Maintenance + Running + Utility + Disposal
- Depreciation: per depreciation method (SLM, WDV, UoP)
- All costs flow to Finance via Accounting Event Engine

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `purchase_cost` | DECIMAL(18,4) | Yes | — | > 0 | Purchase Cost (per Part 13) | Confidential |
| `installation_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Installation | Confidential |
| `transportation_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Transportation | Confidential |
| `customs_duty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Customs (imported) | Confidential |
| `capitalized_cost` | DECIMAL(18,4) | Yes | — | = sum of above | Capitalized amount | Confidential |
| `accumulated_depreciation` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Accumulated depreciation | Confidential |
| `book_value` | DECIMAL(18,4) | Yes | — | = capitalized − accumulated depreciation | Current book value | Confidential |
| `depreciation_method` | ENUM | Yes | `STRAIGHT_LINE` | STRAIGHT_LINE, DECLINING_BALANCE, UNITS_OF_PRODUCTION | Method | Confidential |
| `useful_life_years` | INTEGER | Yes | — | > 0 | Useful life | Internal |
| `annual_depreciation` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Annual depreciation | Confidential |
| `monthly_depreciation` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Monthly depreciation | Confidential |
| `maintenance_cost_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Maintenance Cost YTD (per Part 13) | Confidential |
| `maintenance_cost_lifetime` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Lifetime maintenance | Confidential |
| `running_cost_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Running Cost YTD (per Part 13) | Confidential |
| `running_cost_lifetime` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Lifetime running | Confidential |
| `utility_cost_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Utility Cost YTD (per Part 13) | Confidential |
| `utility_cost_lifetime` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Lifetime utility | Confidential |
| `tco_lifetime` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total Ownership Cost (per Part 13) | Confidential |
| `disposal_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Disposal cost | Confidential |
| `disposal_proceeds` | DECIMAL(18,4) | No | NULL | ≥ 0 | Disposal proceeds | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `last_depreciation_posted_date` | DATE | No | NULL | — | Last depreciation posting | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, DISPOSED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | One-to-One | 1:1 | Asset |
| Accounting Event | One-to-Many | 1:N | All cost postings |
| GL Account (Part 11) | Many-to-One | N:1 | Fixed asset GL |

### 6. Indexes
- UNIQUE (`asset_id`) WHERE `status = 'ACTIVE'`
- INDEX (`book_value`)
- INDEX (`depreciation_method`)

### 7. Security Classification
**Confidential** — financial data throughout.

### 8. Integration Points
- **Finance** (Part 11): Fixed Asset Register, depreciation, GL postings
- **Accounting Event Engine**: All cost events
- **Procurement** (Part 5): Purchase cost source
- **Maintenance Execution Engine** (Q174): Maintenance cost accumulation
- **Utility Service**: Utility cost allocation

### 9. Sample Data
```json
{
  "asset_id": "asset-001", "purchase_cost": 1500000.0000,
  "installation_cost": 50000.0000, "transportation_cost": 25000.0000,
  "capitalized_cost": 1575000.0000, "accumulated_depreciation": 315000.0000,
  "book_value": 1260000.0000, "depreciation_method": "STRAIGHT_LINE",
  "useful_life_years": 10, "annual_depreciation": 157500.0000,
  "monthly_depreciation": 13125.0000,
  "maintenance_cost_ytd": 25000.0000, "maintenance_cost_lifetime": 75000.0000,
  "running_cost_ytd": 8000.0000, "utility_cost_ytd": 45000.0000,
  "tco_lifetime": 1703000.0000, "currency_code": "INR",
  "status": "ACTIVE"
}
```

### 10. Audit Events
`ASSET_COST_INITIALIZED`, `ASSET_DEPRECIATION_POSTED`, `ASSET_MAINTENANCE_COST_ADDED`, `ASSET_UTILITY_COST_ADDED`, `ASSET_DISPOSAL_ACCOUNTED`, `ASSET_TCO_RECALCULATED`

---

## Entity 519 — Asset History

### 1. Business Purpose
Per Part 13 §1: Stores Transfers, Repairs, Calibration, Breakdowns, Upgrades. Append-only audit log for asset events.

### 2. Architectural Role
Immutable audit ledger — every asset event creates an append-only record. Source of truth for compliance and dispute resolution.

### 3. Business Rules
- Append-only — never updated or deleted
- Captures all asset events: transfers, repairs, calibration, breakdowns, upgrades, ownership changes
- Tamper-evident: hash chain across consecutive records per asset
- Retention: lifetime of asset + 7 years post-disposal
- Exportable for audits

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `history_code` | VARCHAR(40) | Yes | — | Unique | Sequential code | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `event_type` | ENUM | Yes | — | TRANSFER, REPAIR, CALIBRATION, BREAKDOWN, UPGRADE, INSTALLATION, COMMISSIONING, INSPECTION, MODIFICATION, DISPOSAL, OTHER | Event type (per Part 13) | Internal |
| `event_category` | ENUM | Yes | — | LIFECYCLE, MAINTENANCE, FINANCIAL, OPERATIONAL, COMPLIANCE | Category | Internal |
| `event_date` | DATE | Yes | — | — | Event date | Internal |
| `event_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Event timestamp | Internal |
| `description` | TEXT | Yes | — | Min 10 | Description | Internal |
| `performed_by` | UUID | No | NULL | FK to `workforce_master` | Performed by | Confidential |
| `performed_by_vendor_id` | UUID | No | NULL | FK to `vendors` | External vendor | Internal |
| `work_order_id` | UUID | No | NULL | FK to `work_orders` (Entity 533) | Linked WO | Internal |
| `lifecycle_transition_id` | UUID | No | NULL | FK to `asset_lifecycle` (Entity 513) | Lifecycle link | Internal |
| `cost_impact` | DECIMAL(18,4) | Yes | `0` | — | Cost impact (+/-) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `downtime_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Downtime caused | Internal |
| `before_state` | JSONB | No | NULL | — | State before event | Confidential |
| `after_state` | JSONB | No | NULL | — | State after event | Confidential |
| `attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Documents/photos | Confidential |
| `location_at_event` | UUID | No | NULL | FK to `asset_locations` | Location | Internal |
| `actor_type` | ENUM | Yes | — | EMPLOYEE, VENDOR, SYSTEM, IoT, AUTOMATION | Actor | Internal |
| `ip_address` | INET | No | NULL | — | Source IP | Confidential |
| `correlation_id` | UUID | No | NULL | — | Cross-service correlation | Internal |
| `previous_hash` | VARCHAR(64) | Yes | — | — | Hash of previous record (per asset) | Internal |
| `record_hash` | VARCHAR(64) | Yes | — | SHA-256 | Hash of this record | Internal |
| `retention_until` | DATE | Yes | — | — | Retention expiry | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, EXPORTED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-One | N:1 | Asset |
| Workforce Master (381) | Many-to-One | N:1 | Performed by |
| Work Order (533) | Many-to-One | N:1 | Linked WO |
| Vendor (Part 5) | Many-to-One | N:1 | External vendor |

### 6. Indexes
- UNIQUE (`history_code`)
- INDEX (`asset_id`, `event_timestamp`)
- INDEX (`event_type`, `event_date`)
- INDEX (`work_order_id`)
- INDEX (`retention_until`)

### 7. Security Classification
**Confidential** — contains operational and financial data.

### 8. Integration Points
- **Audit Service** (Foundation Service): Centralized audit pipeline
- **Compliance Reports**: Asset audit reports
- **BI/Analytics**: Asset reliability analytics
- **Legal Hold**: Litigation hold service

### 9. Sample Data
```json
{
  "history_code": "AH-2026-001234", "asset_id": "asset-001",
  "event_type": "REPAIR", "event_category": "MAINTENANCE",
  "event_date": "2026-07-08", "event_timestamp": "2026-07-08T10:30:00Z",
  "description": "Replaced motor bearing — abnormal vibration detected",
  "performed_by": "wf-tech-001", "work_order_id": "wo-001",
  "cost_impact": 8500.0000, "downtime_hours": 4.50,
  "actor_type": "EMPLOYEE", "status": "RECORDED"
}
```

### 10. Audit Events
(Meta-recursive: this entity IS the audit trail)

---

## Entity 520 — Asset Dashboard

### 1. Business Purpose
Per Part 13 §1: Displays Active Assets, Asset Health, Downtime, Upcoming Maintenance, Warranty Expiry, Asset Value. Aggregated view for asset management.

### 2. Architectural Role
Aggregated view entity — computed from underlying transactions. Powers Maintenance Mission Control and executive dashboards.

### 3. Business Rules
- Snapshot-based: refreshed every 15 minutes for operational dashboards
- Multi-grain: per-asset, per-facility, per-company
- AI insights refreshed daily (overnight batch)
- Real-time KPIs: active assets, downtime, health

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `snapshot_type` | ENUM | Yes | — | ASSET, FACILITY, COMPANY | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity reference | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `active_assets_count` | INTEGER | Yes | `0` | ≥ 0 | Active Assets (per Part 13) | Internal |
| `total_assets_count` | INTEGER | Yes | `0` | ≥ 0 | Total assets | Internal |
| `assets_by_type` | JSONB | Yes | `'{}'` | — | Count by type | Internal |
| `assets_by_criticality` | JSONB | Yes | `'{}'` | — | Count by criticality | Internal |
| `average_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Asset Health (per Part 13) | Confidential |
| `health_distribution` | JSONB | Yes | `'{}'` | — | { EXCELLENT, GOOD, FAIR, POOR, CRITICAL } | Confidential |
| `downtime_hours_today` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Downtime today (per Part 13) | Internal |
| `downtime_hours_mtd` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Downtime MTD | Internal |
| `downtime_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Downtime cost | Confidential |
| `upcoming_maintenance_count` | INTEGER | Yes | `0` | ≥ 0 | Upcoming Maintenance (per Part 13) — next 7 days | Internal |
| `overdue_maintenance_count` | INTEGER | Yes | `0` | ≥ 0 | Overdue PM | Internal |
| `warranty_expiring_count` | INTEGER | Yes | `0` | ≥ 0 | Warranty Expiry (per Part 13) — next 60 days | Internal |
| `warranty_expired_count` | INTEGER | Yes | `0` | ≥ 0 | Already expired | Internal |
| `total_asset_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Asset Value (per Part 13) — book value total | Confidential |
| `asset_value_by_type` | JSONB | Yes | `'{}'` | — | Value by type | Confidential |
| `maintenance_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Maintenance cost MTD | Confidential |
| `maintenance_cost_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | YTD | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI insights | Confidential |
| `ai_failure_predictions` | JSONB | No | NULL | — | AI: failure predictions | Restricted |
| `ai_maintenance_optimization` | JSONB | No | NULL | — | AI: PM optimization | Restricted |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model version | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Asset Master (511) | Many-to-One | N:1 | Asset (for ASSET grain) |

### 6. Indexes
- UNIQUE (`snapshot_date`, `snapshot_type`, `entity_id`)
- INDEX (`company_id`, `snapshot_date`)
- INDEX (`ai_insights_generated_at`)

### 7. Security Classification
**Confidential** — financial and AI predictions are **Restricted**.

### 8. Integration Points
- **BI Service**: Asset dashboards
- **AI/ML Service**: Predictive insights
- **Maintenance Mission Control**: Operational dashboard
- **Executive Scorecard**: C-suite view

### 9. Sample Data
```json
{
  "snapshot_date": "2026-07-08", "snapshot_type": "FACILITY",
  "entity_id": "fac-mum", "company_id": "cmp-001",
  "active_assets_count": 145, "total_assets_count": 150,
  "average_health_score": 82.50,
  "health_distribution": { "EXCELLENT": 45, "GOOD": 70, "FAIR": 25, "POOR": 8, "CRITICAL": 2 },
  "downtime_hours_today": 4.50, "downtime_hours_mtd": 85.25,
  "upcoming_maintenance_count": 12, "overdue_maintenance_count": 3,
  "warranty_expiring_count": 5, "total_asset_value": 25000000.0000,
  "maintenance_cost_mtd": 125000.0000, "status": "COMPLETED"
}
```

### 10. Audit Events
`ASSET_DASHBOARD_SNAPSHOT_CREATED`, `ASSET_DASHBOARD_AI_REFRESHED`, `ASSET_DASHBOARD_STALE_DETECTED`, `ASSET_DASHBOARD_FAILURE_ALERT`

---

# SECTION 2: Asset Master, Classification & Asset Hierarchy (Entities 521-530)

## Entity 521 — Asset Hierarchy

### 1. Business Purpose
Per Part 13 §2: Supports unlimited levels. Enterprise → Company → Plant → Building → Floor → Line → Machine → Sub-Assembly → Component.

### 2. Architectural Role
Hierarchy tree entity — represents the physical/functional structure of assets. Enables roll-up analytics and parent-child maintenance dependencies.

### 3. Business Rules
- Unlimited depth (typical: 8-10 levels)
- Each node has one parent (except root — Enterprise level)
- Asset can be linked to any non-root node
- Parent downtime cascades to children (for OEE calculation)
- Hierarchy changes require approval (structural change)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `node_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `node_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `node_type` | ENUM | Yes | — | ENTERPRISE, COMPANY, PLANT, BUILDING, FLOOR, LINE, MACHINE, SUB_ASSEMBLY, COMPONENT | Type | Internal |
| `parent_node_id` | UUID | No | NULL | FK to `asset_hierarchy` (self) | Parent (NULL = root) | Internal |
| `hierarchy_level` | INTEGER | Yes | — | ≥ 1 | Level (1 = root) | Internal |
| `hierarchy_path` | VARCHAR(1000) | Yes | — | — | Materialized path (e.g., `/ENT/CMP/PLANT/B1/G/L1/`) | Internal |
| `company_id` | UUID | No | NULL | FK to `companies` | Company (if node_type=COMPANY or below) | Internal |
| `facility_id` | UUID | No | NULL | FK to `facilities` | Facility (if PLANT/WAREHOUSE/etc.) | Internal |
| `asset_id` | UUID | No | NULL | FK to `asset_master` (Entity 511) | Linked asset (if MACHINE/SUB_ASSEMBLY/COMPONENT) | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `children_count` | INTEGER | Yes | `0` | ≥ 0 | Direct children count | Internal |
| `descendant_assets_count` | INTEGER | Yes | `0` | ≥ 0 | All descendant assets | Internal |
| `is_critical_path` | BOOLEAN | Yes | `false` | — | On critical production path | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | One-to-One | 1:1 | Linked asset |
| Parent Node (521) | Self-reference | N:1 | Parent |
| Child Nodes (521) | Self-reference | 1:N | Children |
| Company | Many-to-One | N:1 | Company |
| Facility | Many-to-One | N:1 | Facility |

### 6. Indexes
- UNIQUE (`node_code`)
- INDEX (`parent_node_id`)
- INDEX (`hierarchy_level`, `node_type`)
- INDEX (`hierarchy_path`) — GIST for path operations
- INDEX (`asset_id`)

### 7. Security Classification
**Internal**

### 8. Integration Points
- **Manufacturing MES** (Part 7): Production line hierarchy
- **Maintenance Execution Engine** (Q174): Roll-up maintenance
- **BI Service**: Hierarchy-based analytics
- **Asset Dashboard** (E520): Hierarchy views

### 9. Sample Data
```json
{
  "node_code": "MUM-B1-G-L1-MIX-001", "node_name": "Mixer 001 - Line 1",
  "node_type": "MACHINE", "parent_node_id": "node-l1",
  "hierarchy_level": 7, "hierarchy_path": "/ENT/CMP001/PLANT_MUM/B1/G/L1/MIX001",
  "company_id": "cmp-001", "facility_id": "fac-mum", "asset_id": "asset-001",
  "is_critical_path": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`HIERARCHY_NODE_CREATED`, `HIERARCHY_NODE_RESTRUCTURED`, `HIERARCHY_NODE_INACTIVATED`, `HIERARCHY_ASSET_LINKED`

---

## Entity 522 — Parent Asset

### 1. Business Purpose
Per Part 13 §2: Links Machine → Motor → Bearing → Sensor. Parent-child asset relationships for sub-assembly tracking.

### 2. Architectural Role
Relationship entity — explicit parent-child link between asset records. Distinct from hierarchy (which is structural); this is functional/physical composition.

### 3. Business Rules
- One child asset has one parent asset (functional)
- Component-level assets (bearings, sensors) are typically low-value but high-criticality
- Parent failure → all children affected
- Child replacement does NOT require parent decommission
- Spare parts mapping (Entity 528) linked at component level

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `parent_asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Parent (e.g., Machine) | Internal |
| `child_asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Child (e.g., Motor) | Internal |
| `relationship_type` | ENUM | Yes | — | PHYSICAL_COMPONENT, FUNCTIONAL_UNIT, SUB_SYSTEM, ATTACHMENT, SENSOR | Type | Internal |
| `child_role` | VARCHAR(100) | Yes | — | — | Role (e.g., "Main Drive Motor") | Internal |
| `position_in_parent` | VARCHAR(50) | No | NULL | — | Position (e.g., "Left side, bay 2") | Internal |
| `is_critical_for_parent` | BOOLEAN | Yes | `true` | — | Parent fails if child fails | Internal |
| `is_replaceable_independently` | BOOLEAN | Yes | `true` | — | Can replace without parent shutdown | Internal |
| `installation_date` | DATE | No | NULL | — | When installed in parent | Internal |
| `expected_life_months` | INTEGER | No | NULL | > 0 | Expected life | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to (if removed) | Internal |
| `removal_reason` | TEXT | No | NULL | — | Why removed | Confidential |
| `is_current` | BOOLEAN | Yes | `true` | — | Currently linked | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, HISTORICAL | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Self-reference | 1:N | Parent → children |

### 6. Indexes
- UNIQUE (`child_asset_id`, `is_current`) — one active parent per child
- INDEX (`parent_asset_id`, `is_current`)
- INDEX (`relationship_type`)

### 7. Security Classification
**Internal**

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): Component-level maintenance
- **Spare Parts Mapping** (E528): Component-specific spares
- **Asset Health** (E515): Parent health from children

### 9. Sample Data
```json
{
  "parent_asset_id": "asset-mix-001", "child_asset_id": "asset-motor-001",
  "relationship_type": "PHYSICAL_COMPONENT", "child_role": "Main Drive Motor",
  "position_in_parent": "Right side, drive bay", "is_critical_for_parent": true,
  "is_replaceable_independently": true, "installation_date": "2024-04-01",
  "expected_life_months": 60, "is_current": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`PARENT_CHILD_LINKED`, `PARENT_CHILD_UNLINKED`, `CHILD_REPLACED`, `CHILD_REMOVED`

---

## Entity 523 — Asset Classification

### 1. Business Purpose
Per Part 13 §2: Supports Critical, Non-Critical, Production, Utility, Safety, Infrastructure. Multi-dimensional asset classification.

### 2. Architectural Role
Classification entity — tags assets across multiple dimensions (criticality, function, safety). Drives maintenance priority and compliance.

### 3. Business Rules
- Multi-dimensional: an asset can be CRITICAL + PRODUCTION + SAFETY simultaneously
- Criticality drives maintenance priority (Critical = 24h SLA, Low = 30d SLA)
- Safety classification triggers statutory inspection requirements
- Production classification integrates with Manufacturing OEE
- Utility classification (boilers, compressors) — downtime affects all production

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `classification_dimension` | ENUM | Yes | — | CRITICALITY, FUNCTION, SAFETY, INFRASTRUCTURE, COMPLIANCE | Dimension | Internal |
| `classification_value` | ENUM | Yes | — | CRITICAL, NON_CRITICAL, PRODUCTION, UTILITY, SAFETY, INFRASTRUCTURE | Value (per Part 13) | Internal |
| `is_primary` | BOOLEAN | Yes | `false` | — | Primary classification | Internal |
| `justification` | TEXT | No | NULL | — | Why this classification | Confidential |
| `classified_by` | UUID | No | NULL | FK to `workforce_master` | Classifier | Confidential |
| `classified_at` | TIMESTAMPTZ | Yes | `now()` | — | Classification time | Internal |
| `review_due_date` | DATE | No | NULL | — | Next review | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-One | N:1 | Asset |

### 6. Indexes
- INDEX (`asset_id`, `classification_dimension`, `status`)
- INDEX (`classification_value`, `status`)

### 7. Security Classification
**Internal**

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): Priority based on criticality
- **Manufacturing** (Part 7): Production assets in OEE
- **Compliance Engine**: Safety classification triggers inspections
- **Asset Dashboard** (E520): Classification breakdowns

### 9. Sample Data
```json
{
  "asset_id": "asset-001", "classification_dimension": "CRITICALITY",
  "classification_value": "CRITICAL", "is_primary": true,
  "justification": "Single point of failure for Line 1 production",
  "classified_by": "wf-eng-001", "review_due_date": "2027-07-08",
  "status": "ACTIVE"
}
```

### 10. Audit Events
`ASSET_CLASSIFIED`, `ASSET_RECLASSIFIED`, `ASSET_CLASSIFICATION_REVIEWED`

---

## Entity 524 — Criticality Matrix

### 1. Business Purpose
Per Part 13 §2: Levels — Critical, High, Medium, Low. Defines criticality levels and their maintenance/operational implications.

### 2. Architectural Role
Configuration entity — master definition of criticality levels. Drives SLA, maintenance priority, and escalation rules.

### 3. Business Rules
- 4 levels: CRITICAL (single point of failure), HIGH (major impact), MEDIUM (moderate impact), LOW (minimal impact)
- Each level has: SLA, escalation matrix, spare parts stocking policy, monitoring frequency
- Critical assets: real-time monitoring, 24h SLA, redundant spares
- Low assets: monthly monitoring, 30d SLA, on-demand spares

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `criticality_code` | VARCHAR(20) | Yes | — | Unique per company | Code | Internal |
| `criticality_name` | VARCHAR(50) | Yes | — | — | Display name | Internal |
| `criticality_level` | ENUM | Yes | — | CRITICAL, HIGH, MEDIUM, LOW | Level (per Part 13) | Internal |
| `level_rank` | INTEGER | Yes | — | 1-4 | Rank (1=most critical) | Internal |
| `sla_response_hours` | DECIMAL(7,2) | Yes | — | > 0 | Response SLA | Internal |
| `sla_repair_hours` | DECIMAL(7,2) | Yes | — | > 0 | Repair SLA | Internal |
| `monitoring_frequency` | ENUM | Yes | — | REAL_TIME, HOURLY, DAILY, WEEKLY, MONTHLY | Monitoring | Internal |
| `spare_stocking_policy` | ENUM | Yes | — | REDUNDANT, MIN_STOCK, ON_DEMAND | Spare policy | Internal |
| `escalation_matrix` | JSONB | Yes | `'[]'` | — | Escalation chain | Confidential |
| `requires_redundancy` | BOOLEAN | Yes | `false` | — | Redundant asset required | Internal |
| `requires_backup_power` | BOOLEAN | Yes | `false` | — | Backup power needed | Internal |
| `production_impact_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Production impact if down | Confidential |
| `financial_impact_per_hour` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost per hour downtime | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | One-to-Many | 1:N | Assets with this criticality |

### 6. Indexes
- UNIQUE (`criticality_code`)
- INDEX (`criticality_level`, `status`)
- INDEX (`level_rank`)

### 7. Security Classification
**Internal** — escalation and financial impact are **Confidential**.

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): SLA and escalation
- **Warehouse** (Part 6): Spare stocking policy
- **Manufacturing** (Part 7): Production impact
- **Notification Service**: Escalation chain

### 9. Sample Data
```json
{
  "criticality_code": "CRIT-L1", "criticality_name": "Critical",
  "criticality_level": "CRITICAL", "level_rank": 1,
  "sla_response_hours": 1.00, "sla_repair_hours": 8.00,
  "monitoring_frequency": "REAL_TIME", "spare_stocking_policy": "REDUNDANT",
  "requires_redundancy": true, "production_impact_pct": 100.00,
  "financial_impact_per_hour": 50000.0000, "status": "ACTIVE"
}
```

### 10. Audit Events
`CRITICALITY_MATRIX_CREATED`, `CRITICALITY_MATRIX_UPDATED`, `CRITICALITY_SLA_CHANGED`

---

## Entity 525 — Asset Group

### 1. Business Purpose
Per Part 13 §2: Examples — Packaging, Mixing, Boilers, Compressors, Cold Storage, Forklifts. Logical grouping of similar assets for management efficiency.

### 2. Architectural Role
Grouping entity — logical grouping (distinct from physical hierarchy). Enables group-level maintenance templates and analytics.

### 3. Business Rules
- Group = collection of similar assets across hierarchy
- One asset can belong to multiple groups
- Group-level maintenance plan templates
- Group-level analytics (e.g., all forklifts across facilities)
- Group-level spare parts pooling

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `group_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `group_name` | VARCHAR(100) | Yes | — | Min 3 | Display name (per Part 13) | Internal |
| `group_type` | ENUM | Yes | — | PACKAGING, MIXING, BOILERS, COMPRESSORS, COLD_STORAGE, FORKLIFTS, CONVEYORS, IT_EQUIPMENT, VEHICLES, HVAC, OTHER | Type | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `default_maintenance_plan_id` | UUID | No | NULL | FK to `maintenance_plans` (Entity 531) | Default PM plan | Internal |
| `default_criticality_level` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW | Default criticality | Internal |
| `default_spares_kit_id` | UUID | No | NULL | FK to `spare_kits` | Default spares kit | Internal |
| `assets_count` | INTEGER | Yes | `0` | ≥ 0 | Members | Internal |
| `group_manager_id` | UUID | No | NULL | FK to `workforce_master` | Group manager | Confidential |
| `applicable_facilities` | UUID[] | No | `ARRAY[]::UUID[]` | — | Applicable facilities | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-Many | N:N | Via asset_group_mapping |
| Maintenance Plan (531) | Many-to-One | N:1 | Default plan |

### 6. Indexes
- UNIQUE (`group_code`)
- INDEX (`group_type`, `status`)
- GIN INDEX (`applicable_facilities`)

### 7. Security Classification
**Internal**

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): Group-level PM templates
- **Warehouse** (Part 6): Group-level spare pooling
- **BI Service**: Group analytics

### 9. Sample Data
```json
{
  "group_code": "GRP-FORKLIFT", "group_name": "Forklift Fleet",
  "group_type": "FORKLIFTS", "default_criticality_level": "HIGH",
  "assets_count": 12, "group_manager_id": "wf-100",
  "status": "ACTIVE"
}
```

### 10. Audit Events
`ASSET_GROUP_CREATED`, `ASSET_GROUP_UPDATED`, `ASSET_ADDED_TO_GROUP`, `ASSET_REMOVED_FROM_GROUP`

---

## Entity 526 — Asset QR Code

### 1. Business Purpose
Per Part 13 §2: Stores QR, Barcode, RFID, NFC. Asset identification tags for mobile scanning.

### 2. Architectural Role
Identification entity — multiple identification methods per asset for scanning flexibility.

### 3. Business Rules
- One asset can have multiple identification tags (QR + Barcode + RFID + NFC)
- QR code: printed label, scanned by mobile app
- Barcode: 1D code, scanned by handheld scanners
- RFID: passive/active tags for gate-based tracking
- NFC: tap-to-scan for close proximity
- All identifications resolve to the same asset_id

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `tag_type` | ENUM | Yes | — | QR, BARCODE, RFID, NFC | Type (per Part 13) | Internal |
| `tag_value` | VARCHAR(200) | Yes | — | — | Encoded value | Confidential |
| `tag_format` | VARCHAR(50) | No | NULL | — | Format (e.g., CODE_128, EPC) | Internal |
| `tag_print_data` | JSONB | No | NULL | — | Print payload | Internal |
| `printed_attachment_id` | UUID | No | NULL | FK to `attachments` | Printed label image | Internal |
| `physical_location_on_asset` | VARCHAR(100) | No | NULL | — | Where on asset | Internal |
| `is_primary` | BOOLEAN | Yes | `false` | — | Primary identification | Internal |
| `is_active` | BOOLEAN | Yes | `true` | — | Currently active | Internal |
| `issued_at` | TIMESTAMPTZ | Yes | `now()` | — | Issue timestamp | Internal |
| `issued_by` | UUID | Yes | — | FK to `workforce_master` | Issuer | Confidential |
| `last_scanned_at` | TIMESTAMPTZ | No | NULL | — | Last scan | Internal |
| `last_scanned_by` | UUID | No | NULL | FK to `workforce_master` | Last scanner | Confidential |
| `scan_count` | INTEGER | Yes | `0` | ≥ 0 | Total scans | Internal |
| `damaged_at` | TIMESTAMPTZ | No | NULL | — | If damaged | Internal |
| `replacement_issued` | BOOLEAN | Yes | `false` | — | Replacement issued | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, DAMAGED, REPLACED, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-One | N:1 | Asset |

### 6. Indexes
- UNIQUE (`tag_type`, `tag_value`)
- INDEX (`asset_id`, `is_active`)
- INDEX (`tag_type`, `is_primary`)

### 7. Security Classification
**Confidential** — tag values can be spoofed.

### 8. Integration Points
- **Mobile App**: QR/Barcode scanning
- **RFID Gates**: Asset tracking
- **NFC Readers**: Tap identification
- **Maintenance Execution Engine** (Q174): Scan-to-pull-asset-info

### 9. Sample Data
```json
{
  "asset_id": "asset-001", "tag_type": "QR",
  "tag_value": "SUOP|MFG|MUM|L1|MIX|001",
  "physical_location_on_asset": "Front panel, top right",
  "is_primary": true, "is_active": true,
  "issued_at": "2024-04-01T10:00:00Z", "scan_count": 1250,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`ASSET_TAG_ISSUED`, `ASSET_TAG_SCANNED`, `ASSET_TAG_DAMAGED`, `ASSET_TAG_REPLACED`

---

## Entity 527 — Asset Documentation

### 1. Business Purpose
Per Part 13 §2: Stores Manuals, Drawings, Warranty, Certificates, Maintenance SOP. Asset document repository.

### 2. Architectural Role
Document entity — links assets to all related documents. Critical for maintenance, compliance, and troubleshooting.

### 3. Business Rules
- Document types: MANUAL (OEM manual), DRAWING (engineering), WARRANTY, CERTIFICATE (compliance), MAINTENANCE_SOP, INSPECTION_REPORT, REPAIR_HISTORY, MODIFICATION_RECORD
- Versioning: documents have versions; latest version is current
- Access control: based on user role and document classification
- Multi-language: documents can have translations
- Searchable: OCR-indexed for full-text search

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `document_type` | ENUM | Yes | — | MANUAL, DRAWING, WARRANTY, CERTIFICATE, MAINTENANCE_SOP, INSPECTION_REPORT, REPAIR_HISTORY, MODIFICATION_RECORD, OTHER | Type (per Part 13) | Internal |
| `document_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `document_description` | TEXT | No | NULL | — | Description | Internal |
| `attachment_id` | UUID | Yes | — | FK to `attachments` | Document file | Confidential |
| `file_format` | VARCHAR(20) | Yes | — | — | PDF, DOCX, DWG, etc. | Internal |
| `file_size_bytes` | BIGINT | Yes | — | > 0 | Size | Internal |
| `page_count` | INTEGER | No | NULL | ≥ 1 | Pages | Internal |
| `language` | VARCHAR(10) | Yes | `en` | — | Language | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Document version | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `asset_documentation` (self) | Previous version | Internal |
| `published_date` | DATE | Yes | — | — | Publication date | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `classification` | ENUM | Yes | `INTERNAL` | PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED | Classification | Internal |
| `access_roles` | UUID[] | No | `ARRAY[]::UUID[]` | — | Roles with access | Confidential |
| `ocr_extracted_text` | TEXT | No | NULL | — | OCR text (searchable) | Confidential |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Search tags | Internal |
| `uploaded_by` | UUID | Yes | — | FK to `workforce_master` | Uploader | Confidential |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `download_count` | INTEGER | Yes | `0` | ≥ 0 | Downloads | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, SUPERSEDED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-One | N:1 | Asset |
| Previous Version (527) | Self-reference | N:1 | Previous version |

### 6. Indexes
- INDEX (`asset_id`, `document_type`, `is_latest_version`)
- INDEX (`document_type`, `status`)
- GIN INDEX (`tags`)
- INDEX (`classification`)

### 7. Security Classification
**Confidential** — classification varies per document.

### 8. Integration Points
- **Document Service** (Foundation Service): File storage
- **OCR Service**: Text extraction
- **Maintenance Execution Engine** (Q174): SOP access during work orders
- **ESS/MSS Portals** (Part 12): Document access

### 9. Sample Data
```json
{
  "asset_id": "asset-001", "document_type": "MAINTENANCE_SOP",
  "document_name": "Mixer 001 - Monthly PM SOP",
  "attachment_id": "att-001", "file_format": "PDF", "file_size_bytes": 2500000,
  "page_count": 15, "language": "en", "version": "2.0", "is_latest_version": true,
  "published_date": "2026-01-15", "effective_from": "2026-02-01",
  "classification": "INTERNAL", "tags": ["PM", "Mixer", "Monthly"],
  "status": "ACTIVE"
}
```

### 10. Audit Events
`ASSET_DOCUMENT_UPLOADED`, `ASSET_DOCUMENT_VERSION_PUBLISHED`, `ASSET_DOCUMENT_SUPERSEDED`, `ASSET_DOCUMENT_DOWNLOADED`, `ASSET_DOCUMENT_APPROVED`

---

## Entity 528 — Spare Parts Mapping

### 1. Business Purpose
Per Part 13 §2: Links Machine → Required Spare Parts. Mapping of assets to their required spare parts.

### 2. Architectural Role
Mapping entity — defines which spare parts are needed for each asset. Drives inventory planning and maintenance execution.

### 3. Business Rules
- One asset maps to multiple spare parts (BOM-style)
- Spare parts have criticality: ESSENTIAL (cannot operate without), RECOMMENDED, OPTIONAL
- Min stock levels defined per asset-spare combination
- Auto-replenishment when stock falls below min
- Spare parts linked to Inventory (Part 4) and Procurement (Part 5)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset (per Part 13: "Machine") | Internal |
| `spare_part_id` | UUID | Yes | — | FK to `products` (Part 3, type=SPARE_PART) | Spare part | Internal |
| `spare_criticality` | ENUM | Yes | — | ESSENTIAL, RECOMMENDED, OPTIONAL | Criticality | Internal |
| `quantity_per_asset` | DECIMAL(10,2) | Yes | — | > 0 | Qty installed | Internal |
| `min_stock_level` | DECIMAL(10,2) | Yes | — | ≥ 0 | Min stock | Internal |
| `max_stock_level` | DECIMAL(10,2) | Yes | — | ≥ min_stock | Max stock | Internal |
| `reorder_level` | DECIMAL(10,2) | Yes | — | ≥ min_stock, ≤ max_stock | Reorder point | Internal |
| `reorder_qty` | DECIMAL(10,2) | Yes | — | > 0 | Reorder quantity | Internal |
| `lead_time_days` | INTEGER | Yes | — | ≥ 0 | Procurement lead time | Internal |
| `preferred_vendor_id` | UUID | No | NULL | FK to `vendors` | Preferred vendor | Internal |
| `alternative_vendor_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Alternatives | Internal |
| `standard_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Standard cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `installation_position` | VARCHAR(100) | No | NULL | — | Where installed | Internal |
| `replacement_frequency_months` | INTEGER | No | NULL | > 0 | Expected replacement cycle | Internal |
| `last_replaced_date` | DATE | No | NULL | — | Last replacement | Internal |
| `next_replacement_due` | DATE | No | NULL | — | Next due | Internal |
| `auto_replenish` | BOOLEAN | Yes | `true` | — | Auto-replenish when low | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-One | N:1 | Asset |
| Product (Part 3) | Many-to-One | N:1 | Spare part |
| Vendor (Part 5) | Many-to-One | N:1 | Preferred vendor |
| Work Order (533) | Many-to-Many | N:N | Spares used in WOs |

### 6. Indexes
- UNIQUE (`asset_id`, `spare_part_id`)
- INDEX (`spare_part_id`, `status`)
- INDEX (`spare_criticality`, `auto_replenish`)
- INDEX (`next_replacement_due`)

### 7. Security Classification
**Confidential** — cost and vendor info.

### 8. Integration Points
- **Inventory** (Part 4): Stock levels
- **Procurement** (Part 5): Auto-replenishment
- **Maintenance Execution Engine** (Q174): Spares reservation for WOs
- **Warehouse** (Part 6): Spare parts warehouse

### 9. Sample Data
```json
{
  "asset_id": "asset-001", "spare_part_id": "prod-bearing-001",
  "spare_criticality": "ESSENTIAL", "quantity_per_asset": 4.00,
  "min_stock_level": 2.00, "max_stock_level": 10.00, "reorder_level": 4.00,
  "reorder_qty": 8.00, "lead_time_days": 14, "preferred_vendor_id": "vnd-001",
  "standard_cost": 2500.0000, "replacement_frequency_months": 12,
  "last_replaced_date": "2026-01-15", "next_replacement_due": "2027-01-15",
  "auto_replenish": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`SPARE_MAPPING_CREATED`, `SPARE_MAPPING_UPDATED`, `SPARE_REPLENISHMENT_TRIGGERED`, `SPARE_REPLACED`

---

## Entity 529 — Utility Consumption

### 1. Business Purpose
Per Part 13 §2: Measures Power, Water, Steam, Gas, Compressed Air. Utility consumption tracking per asset.

### 2. Architectural Role
Metering entity — per-asset utility consumption. Drives cost allocation and sustainability reporting.

### 3. Business Rules
- Utility types: POWER (kWh), WATER (liters), STEAM (kg), GAS (m³), COMPRESSED_AIR (m³), DIESEL (liters)
- Meter readings: manual or IoT (smart meters)
- Consumption = Current reading − Previous reading
- Cost allocation: based on consumption × tariff
- Sustainability: CO2 emissions calculated from consumption

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `utility_type` | ENUM | Yes | — | POWER, WATER, STEAM, GAS, COMPRESSED_AIR, DIESEL, OTHER | Type (per Part 13) | Internal |
| `meter_id` | VARCHAR(50) | No | NULL | — | Meter identifier | Internal |
| `meter_type` | ENUM | Yes | `MANUAL` | MANUAL, IOT_SMART, BILLED | Meter type | Internal |
| `reading_date` | DATE | Yes | — | — | Reading date | Internal |
| `reading_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Reading timestamp | Internal |
| `previous_reading` | DECIMAL(15,3) | Yes | `0` | ≥ 0 | Previous reading | Internal |
| `current_reading` | DECIMAL(15,3) | Yes | — | ≥ previous_reading | Current reading | Internal |
| `consumption` | DECIMAL(15,3) | Yes | — | ≥ 0 | Consumption = current − previous | Internal |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | UoM (kWh, liters, m³, kg) | Internal |
| `tariff_per_unit` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Tariff rate | Confidential |
| `consumption_cost` | DECIMAL(18,4) | Yes | — | ≥ 0 | Cost = consumption × tariff | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `co2_emission_kg` | DECIMAL(15,3) | No | NULL | ≥ 0 | CO2 emissions | Internal |
| `co2_emission_factor` | DECIMAL(10,6) | No | NULL | — | Emission factor | Internal |
| `peak_demand_kw` | DECIMAL(10,2) | No | NULL | — | Peak demand (POWER) | Internal |
| `power_factor` | DECIMAL(4,2) | No | NULL | 0-1 | Power factor | Internal |
| `is_estimated` | BOOLEAN | Yes | `false` | — | Estimated reading | Internal |
| `estimation_method` | VARCHAR(50) | No | NULL | — | Method | Internal |
| `read_by` | UUID | No | NULL | FK to `workforce_master` | Reader (manual) | Confidential |
| `iot_device_id` | VARCHAR(100) | No | NULL | — | IoT device (smart) | Confidential |
| `bill_reference` | VARCHAR(100) | No | NULL | — | Utility bill reference | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, ADJUSTED, BILLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-One | N:1 | Asset |

### 6. Indexes
- INDEX (`asset_id`, `utility_type`, `reading_date`)
- INDEX (`utility_type`, `reading_date`)
- INDEX (`meter_id`, `reading_date`)

### 7. Security Classification
**Confidential** — tariff and cost data.

### 8. Integration Points
- **Finance** (Part 11): Utility cost posting
- **Asset Cost** (E518): Lifetime utility cost accumulation
- **Sustainability Reporting**: CO2 tracking
- **IoT Service**: Smart meter readings
- **Procurement** (Part 5): Utility bill processing

### 9. Sample Data
```json
{
  "asset_id": "asset-001", "utility_type": "POWER",
  "meter_id": "MTR-PWR-001", "meter_type": "IOT_SMART",
  "reading_date": "2026-07-08", "previous_reading": 125000.000,
  "current_reading": 127500.000, "consumption": 2500.000,
  "unit_of_measure": "kWh", "tariff_per_unit": 8.5000,
  "consumption_cost": 21250.0000, "currency_code": "INR",
  "co2_emission_kg": 2000.000, "co2_emission_factor": 0.800000,
  "peak_demand_kw": 125.50, "power_factor": 0.92,
  "iot_device_id": "IOT-MTR-001", "status": "RECORDED"
}
```

### 10. Audit Events
`UTILITY_READING_RECORDED`, `UTILITY_READING_ADJUSTED`, `UTILITY_COST_POSTED`, `UTILITY_METER_REGISTERED`

---

## Entity 530 — Asset Hierarchy Dashboard

### 1. Business Purpose
Per Part 13 §2: Displays Hierarchy, Critical Assets, Utility Usage, Machine Groups. Hierarchy-aware operational dashboard.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `hierarchy_node_id` | UUID | No | NULL | FK to `asset_hierarchy` (Entity 521) | Hierarchy node | Internal |
| `hierarchy_view_config` | JSONB | Yes | `'{}'` | — | View config (expanded nodes) | Internal |
| `hierarchy_summary` | JSONB | Yes | `'{}'` | — | Hierarchy summary (per Part 13: "Hierarchy") | Internal |
| `critical_assets_count` | INTEGER | Yes | `0` | ≥ 0 | Critical Assets (per Part 13) | Internal |
| `critical_assets_list` | JSONB | Yes | `'[]'` | — | Critical assets | Confidential |
| `utility_usage_summary` | JSONB | Yes | `'{}'` | — | Utility Usage (per Part 13) — by type | Confidential |
| `utility_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Utility cost MTD | Confidential |
| `machine_groups_summary` | JSONB | Yes | `'[]'` | — | Machine Groups (per Part 13) | Internal |
| `assets_by_hierarchy_level` | JSONB | Yes | `'{}'` | — | Count by level | Internal |
| `health_by_hierarchy` | JSONB | Yes | `'{}'` | — | Health rollup | Confidential |
| `downtime_by_hierarchy` | JSONB | Yes | `'{}'` | — | Downtime rollup | Internal |
| `maintenance_load_by_hierarchy` | JSONB | Yes | `'{}'` | — | Maintenance load | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI hierarchy insights | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 3: Preventive Maintenance, Maintenance Planning & Work Orders (Entities 531-540)

## Entity 531 — Maintenance Plan

### 1. Business Purpose
Per Part 13 §3: Supports Daily, Weekly, Monthly, Quarterly, Half-Yearly, Annual, Running Hours, Meter Based. PM plan templates per asset/category/group.

### 2. Architectural Role
Configuration entity — defines the PM strategy. The Maintenance Execution Engine (Q174) consumes these to auto-generate schedules.

### 3. Business Rules
- Plan types: TIME_BASED (Daily/Weekly/Monthly/etc.), METER_BASED (Running Hours/Units Produced), CONDITION_BASED (IoT trigger), INSPECTION_ONLY
- One plan can apply to: single asset, asset group, or category
- Plan contains: checklist, required spares, estimated hours, technician skills
- Plans can be inherited (category → asset override)
- Effective period: plan active from-to dates

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `plan_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `plan_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `plan_type` | ENUM | Yes | — | TIME_BASED, METER_BASED, CONDITION_BASED, INSPECTION_ONLY | Type | Internal |
| `frequency` | ENUM | Yes | — | DAILY, WEEKLY, MONTHLY, QUARTERLY, HALF_YEARLY, ANNUAL, BIENNIAL, CUSTOM | Frequency (per Part 13) | Internal |
| `frequency_value` | INTEGER | No | NULL | > 0 | Custom frequency value | Internal |
| `frequency_unit` | ENUM | No | NULL | DAYS, WEEKS, MONTHS, RUNNING_HOURS, UNITS_PRODUCED | Unit | Internal |
| `meter_trigger_value` | DECIMAL(15,2) | No | NULL | > 0 | Meter trigger (per Part 13: "Meter Based") | Internal |
| `condition_trigger` | JSONB | No | NULL | — | IoT condition (per Part 13: "Running Hours") | Confidential |
| `applicability_type` | ENUM | Yes | — | SINGLE_ASSET, ASSET_GROUP, CATEGORY, ALL_ASSETS | Applicability | Internal |
| `applicable_asset_id` | UUID | No | NULL | FK to `asset_master` | Single asset | Internal |
| `applicable_group_id` | UUID | No | NULL | FK to `asset_groups` (Entity 525) | Group | Internal |
| `applicable_category_id` | UUID | No | NULL | FK to `asset_categories` (Entity 512) | Category | Internal |
| `maintenance_type` | ENUM | Yes | — | INSPECTION, LUBRICATION, CLEANING, CALIBRATION, REPLACEMENT, OVERHAUL, TESTING | Type | Internal |
| `checklist_id` | UUID | Yes | — | FK to `maintenance_checklists` (Entity 535) | Checklist | Internal |
| `required_spares` | JSONB | Yes | `'[]'` | — | [{ spare_part_id, qty }] | Confidential |
| `required_tools` | JSONB | Yes | `'[]'` | — | Tool list | Internal |
| `required_skills` | JSONB | Yes | `'[]'` | — | [{ skill, level }] | Internal |
| `estimated_duration_hours` | DECIMAL(5,2) | Yes | — | > 0 | Estimated duration | Internal |
| `estimated_labor_hours` | DECIMAL(5,2) | Yes | — | > 0 | Labor hours | Internal |
| `estimated_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Estimated cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `safety_requirements` | JSONB | Yes | `'[]'` | — | Safety requirements | Confidential |
| `requires_asset_shutdown` | BOOLEAN | Yes | `false` | — | Asset must be stopped | Internal |
| `shutdown_duration_hours` | DECIMAL(5,2) | No | NULL | ≥ 0 | Required shutdown | Internal |
| `priority` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW | Priority | Internal |
| `sop_document_id` | UUID | No | NULL | FK to `asset_documentation` (Entity 527) | SOP | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-One | N:1 | Single asset scope |
| Asset Group (525) | Many-to-One | N:1 | Group scope |
| Maintenance Checklist (535) | Many-to-One | N:1 | Checklist |
| Maintenance Schedule (532) | One-to-Many | 1:N | Generated schedules |

### 6. Indexes
- UNIQUE (`plan_code`)
- INDEX (`plan_type`, `frequency`, `status`)
- INDEX (`applicability_type`, `status`)
- INDEX (`priority`, `status`)

### 7. Security Classification
**Confidential** — cost and safety requirements.

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): Schedule generation
- **Work Order Engine**: WO creation from schedule
- **Inventory** (Part 4): Spare parts reservation
- **HR** (Part 12): Technician skills matching
- **Manufacturing** (Part 7): Shutdown planning

### 9. Sample Data
```json
{
  "plan_code": "PM-MIX-MONTHLY", "plan_name": "Mixer Monthly PM",
  "plan_type": "TIME_BASED", "frequency": "MONTHLY",
  "applicability_type": "CATEGORY", "applicable_category_id": "cat-mixer",
  "maintenance_type": "INSPECTION", "checklist_id": "chk-001",
  "estimated_duration_hours": 4.00, "estimated_labor_hours": 3.00,
  "estimated_cost": 5000.0000, "requires_asset_shutdown": true,
  "shutdown_duration_hours": 4.00, "priority": "HIGH",
  "status": "ACTIVE"
}
```

### 10. Audit Events
`MAINTENANCE_PLAN_CREATED`, `MAINTENANCE_PLAN_UPDATED`, `MAINTENANCE_PLAN_ACTIVATED`, `MAINTENANCE_PLAN_INACTIVATED`

---

## Entity 532 — Maintenance Schedule

### 1. Business Purpose
Per Part 13 §3: Stores Asset, Frequency, Due Date, Priority, Status. Auto-generated schedule instances from maintenance plans.

### 2. Architectural Role
Schedule entity — concrete instances of PM plans. Each schedule either becomes a Work Order or is rescheduled.

### 3. Business Rules
- Auto-generated by Maintenance Execution Engine based on plan frequency
- Lead time: WO created N days before due date (configurable)
- Auto-reschedule if asset is under maintenance
- Conflict detection: avoid scheduling multiple WOs on same asset
- Overdue triggers escalation
- Schedule can be manually adjusted

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `schedule_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `maintenance_plan_id` | UUID | Yes | — | FK to `maintenance_plans` (Entity 531) | Source plan | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset (per Part 13) | Internal |
| `frequency` | ENUM | Yes | — | DAILY, WEEKLY, MONTHLY, QUARTERLY, HALF_YEARLY, ANNUAL, METER_BASED, CUSTOM | Frequency (per Part 13) | Internal |
| `scheduled_due_date` | DATE | Yes | — | — | Due Date (per Part 13) | Internal |
| `scheduled_start_date` | DATE | Yes | — | ≤ due_date | Start date | Internal |
| `scheduled_end_date` | DATE | Yes | — | ≥ due_date | End date | Internal |
| `priority` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW | Priority (per Part 13) | Internal |
| `lead_time_days` | INTEGER | Yes | `7` | ≥ 0 | Lead time for WO creation | Internal |
| `work_order_id` | UUID | No | NULL | FK to `work_orders` (Entity 533) | Generated WO | Internal |
| `work_order_created_at` | TIMESTAMPTZ | No | NULL | — | WO creation timestamp | Internal |
| `last_executed_date` | DATE | No | NULL | — | Last execution | Internal |
| `last_work_order_id` | UUID | No | NULL | FK to `work_orders` | Last WO | Internal |
| `next_due_date` | DATE | Yes | — | — | Next due (calculated) | Internal |
| `meter_reading_at_schedule` | DECIMAL(15,2) | No | NULL | — | Meter reading when scheduled | Internal |
| `reschedule_count` | INTEGER | Yes | `0` | ≥ 0 | Times rescheduled | Internal |
| `reschedule_reason` | TEXT | No | NULL | — | Last reason | Confidential |
| `is_overdue` | BOOLEAN | Yes | `false` | — | Past due | Internal |
| `overdue_days` | INTEGER | Yes | `0` | ≥ 0 | Days overdue | Internal |
| `status` | ENUM | Yes | `SCHEDULED` | SCHEDULED, WO_CREATED, COMPLETED, RESCHEDULED, CANCELLED, OVERDUE | Status (per Part 13) | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Maintenance Plan (531) | Many-to-One | N:1 | Source plan |
| Asset Master (511) | Many-to-One | N:1 | Asset |
| Work Order (533) | One-to-One | 1:1 | Generated WO |

### 6. Indexes
- UNIQUE (`schedule_code`)
- INDEX (`asset_id`, `scheduled_due_date`)
- INDEX (`status`, `scheduled_due_date`)
- INDEX (`is_overdue`, `overdue_days`)

### 7. Security Classification
**Internal**

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): Schedule generation
- **Work Order Engine**: WO creation
- **Notification Service**: Due date reminders
- **Calendar Service**: Schedule calendar

### 9. Sample Data
```json
{
  "schedule_code": "SCH-2026-01234", "maintenance_plan_id": "plan-001",
  "asset_id": "asset-001", "frequency": "MONTHLY",
  "scheduled_due_date": "2026-08-15", "scheduled_start_date": "2026-08-13",
  "priority": "HIGH", "lead_time_days": 7,
  "next_due_date": "2026-09-15", "status": "SCHEDULED"
}
```

### 10. Audit Events
`MAINTENANCE_SCHEDULE_CREATED`, `MAINTENANCE_SCHEDULE_WO_CREATED`, `MAINTENANCE_SCHEDULE_COMPLETED`, `MAINTENANCE_SCHEDULE_RESCHEDULED`, `MAINTENANCE_SCHEDULE_OVERDUE`

---

## Entity 533 — Work Order

### 1. Business Purpose
Per Part 13 §3: Stores Number, Asset, Problem, Priority, Technician, Status, Start, End, Cost. The core maintenance execution entity.

### 2. Architectural Role
Transaction entity — single maintenance job. Drives technician dispatch, spare reservation, downtime tracking, and cost accumulation.

### 3. Business Rules
- WO types: PREVENTIVE (from schedule), CORRECTIVE (breakdown), CALIBRATION, INSPECTION, MODIFICATION, INSTALLATION
- WO lifecycle: CREATED → ASSIGNED → IN_PROGRESS → INSPECTION → COMPLETED → CLOSED
- All maintenance logic executed by Maintenance Execution Engine (Q174)
- Spare reservation at WO creation; consumption at completion
- Downtime tracked from asset stoppage to restoration
- Cost = labor + spares + utilities + overhead

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `work_order_number` | VARCHAR(30) | Yes | — | Unique per company | Number (per Part 13) | Internal |
| `wo_type` | ENUM | Yes | — | PREVENTIVE, CORRECTIVE, CALIBRATION, INSPECTION, MODIFICATION, INSTALLATION, EMERGENCY | Type | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset (per Part 13) | Internal |
| `maintenance_plan_id` | UUID | No | NULL | FK to `maintenance_plans` (Entity 531) | Source plan (if PM) | Internal |
| `maintenance_schedule_id` | UUID | No | NULL | FK to `maintenance_schedules` (Entity 532) | Source schedule | Internal |
| `problem_description` | TEXT | Yes | — | Min 10 | Problem (per Part 13) | Confidential |
| `reported_by` | UUID | Yes | — | FK to `workforce_master` | Reporter | Confidential |
| `reported_at` | TIMESTAMPTZ | Yes | `now()` | — | Report time | Internal |
| `reported_source` | ENUM | Yes | — | OPERATOR, IoT_ALERT, INSPECTION, SCHEDULED, MANAGER, EXTERNAL | Source | Internal |
| `priority` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW | Priority (per Part 13) | Internal |
| `criticality_level` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW | Asset criticality | Internal |
| `assigned_technician_id` | UUID | No | NULL | FK to `workforce_master` | Technician (per Part 13) | Confidential |
| `assigned_team_id` | UUID | No | NULL | FK to `teams` | Maintenance team | Internal |
| `assigned_at` | TIMESTAMPTZ | No | NULL | — | Assignment time | Internal |
| `scheduled_start` | TIMESTAMPTZ | Yes | — | — | Scheduled Start (per Part 13) | Internal |
| `scheduled_end` | TIMESTAMPTZ | Yes | — | > scheduled_start | Scheduled End (per Part 13) | Internal |
| `actual_start` | TIMESTAMPTZ | No | NULL | — | Actual start | Internal |
| `actual_end` | TIMESTAMPTZ | No | NULL | — | Actual end (per Part 13) | Internal |
| `asset_downtime_start` | TIMESTAMPTZ | No | NULL | — | Asset stopped | Internal |
| `asset_downtime_end` | TIMESTAMPTZ | No | NULL | — | Asset restored | Internal |
| `downtime_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Downtime | Internal |
| `labor_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Labor hours | Internal |
| `checklist_id` | UUID | No | NULL | FK to `maintenance_checklists` (Entity 535) | Checklist | Internal |
| `spares_reserved` | JSONB | Yes | `'[]'` | — | Spares reserved | Confidential |
| `spares_consumed` | JSONB | Yes | `'[]'` | — | Spares consumed | Confidential |
| `labor_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Labor cost | Confidential |
| `spares_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Spares cost | Confidential |
| `utility_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Utility cost | Confidential |
| `overhead_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Overhead | Confidential |
| `total_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost (per Part 13) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `safety_permit_required` | BOOLEAN | Yes | `false` | — | Safety permit | Internal |
| `safety_permit_id` | UUID | No | NULL | FK to `safety_permits` | Safety permit | Confidential |
| `quality_inspection_required` | BOOLEAN | Yes | `false` | — | Quality inspection | Internal |
| `quality_inspection_passed` | BOOLEAN | No | NULL | — | Inspection result | Internal |
| `attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Photos/documents | Confidential |
| `completion_notes` | TEXT | No | NULL | — | Completion notes | Confidential |
| `root_cause_analysis` | TEXT | No | NULL | — | RCA (for breakdown) | Confidential |
| `corrective_action` | TEXT | No | NULL | — | Corrective action | Confidential |
| `preventive_action` | TEXT | No | NULL | — | Preventive action | Confidential |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Cost posting | Confidential |
| `production_impact_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Production lost | Confidential |
| `production_impact_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Production cost impact | Confidential |
| `completed_by` | UUID | No | NULL | FK to `workforce_master` | Completer | Confidential |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Completion time | Internal |
| `verified_by` | UUID | No | NULL | FK to `workforce_master` | Verifier | Confidential |
| `verified_at` | TIMESTAMPTZ | No | NULL | — | Verification time | Internal |
| `status` | ENUM | Yes | `CREATED` | CREATED, ASSIGNED, IN_PROGRESS, ON_HOLD, INSPECTION, COMPLETED, VERIFIED, CLOSED, CANCELLED | Status (per Part 13) | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-One | N:1 | Asset |
| Maintenance Plan (531) | Many-to-One | N:1 | Source (if PM) |
| Maintenance Schedule (532) | Many-to-One | N:1 | Source schedule |
| Workforce Master (381) | Many-to-One | N:1 | Technician |
| Work Order Task (534) | One-to-Many | 1:N | Tasks |
| Accounting Event | One-to-One | 1:1 | Cost posting |
| Maintenance History (537) | One-to-One | 1:1 | History record |

### 6. Indexes
- UNIQUE (`work_order_number`)
- INDEX (`asset_id`, `status`)
- INDEX (`assigned_technician_id`, `status`)
- INDEX (`priority`, `scheduled_start`)
- INDEX (`wo_type`, `status`)
- INDEX (`reported_at`, `status`)

### 7. Security Classification
**Confidential** — cost and RCA are **Restricted**.

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): WO orchestration
- **Manufacturing MES** (Part 7): Downtime tracking, production impact
- **Warehouse** (Part 6): Spare parts picking
- **Inventory** (Part 4): Spare parts consumption
- **HR** (Part 12): Technician assignment
- **Accounting Event Engine** (Part 11): Cost posting
- **Notification Service**: Status alerts

### 9. Sample Data
```json
{
  "work_order_number": "WO-2026-00123", "wo_type": "PREVENTIVE",
  "asset_id": "asset-001", "problem_description": "Scheduled monthly PM",
  "reported_by": "wf-mgr-001", "reported_source": "SCHEDULED",
  "priority": "HIGH", "criticality_level": "HIGH",
  "assigned_technician_id": "wf-tech-001",
  "scheduled_start": "2026-08-15T09:00:00Z", "scheduled_end": "2026-08-15T13:00:00Z",
  "labor_hours": 3.50, "labor_cost": 1750.0000, "spares_cost": 3200.0000,
  "total_cost": 5000.0000, "status": "COMPLETED"
}
```

### 10. Audit Events
`WORK_ORDER_CREATED`, `WORK_ORDER_ASSIGNED`, `WORK_ORDER_STARTED`, `WORK_ORDER_COMPLETED`, `WORK_ORDER_VERIFIED`, `WORK_ORDER_CLOSED`, `WORK_ORDER_CANCELLED`, `WORK_ORDER_PUT_ON_HOLD`

---

## Entity 534 — Work Order Task

### 1. Business Purpose
Per Part 13 §3: Stores Checklist, Safety, Tools, Instructions, Completion. Per-task breakdown within a work order.

### 2. Architectural Role
Sub-task entity — decomposes a WO into actionable tasks. Each task has its own completion status and verification.

### 3. Business Rules
- One WO has multiple tasks (typically 5-20)
- Task types: INSPECTION, LUBRICATION, CLEANING, REPLACEMENT, TESTING, CALIBRATION, DOCUMENTATION
- Tasks can be sequential (dependency) or parallel
- Each task has estimated vs actual duration
- Safety tasks (LOTO, PPE check) are mandatory prerequisites
- Photo evidence required for critical tasks

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `work_order_id` | UUID | Yes | — | FK to `work_orders` (Entity 533) | Parent WO | Internal |
| `task_sequence` | INTEGER | Yes | — | ≥ 1 | Sequence | Internal |
| `task_name` | VARCHAR(200) | Yes | — | Min 3 | Task name | Internal |
| `task_type` | ENUM | Yes | — | INSPECTION, LUBRICATION, CLEANING, REPLACEMENT, TESTING, CALIBRATION, DOCUMENTATION, SAFETY_CHECK, OTHER | Type | Internal |
| `description` | TEXT | Yes | — | Min 10 | Instructions (per Part 13) | Internal |
| `checklist_items` | JSONB | Yes | `'[]'` | — | Checklist (per Part 13) — [{ item, expected, actual, status }] | Confidential |
| `safety_requirements` | JSONB | Yes | `'[]'` | — | Safety (per Part 13) — [{ requirement, verified }] | Confidential |
| `required_tools` | JSONB | Yes | `'[]'` | — | Tools (per Part 13) | Internal |
| `required_spares` | JSONB | Yes | `'[]'` | — | Spares needed | Confidential |
| `required_skills` | JSONB | Yes | `'[]'` | — | Skills needed | Internal |
| `estimated_duration_minutes` | INTEGER | Yes | — | > 0 | Estimated | Internal |
| `actual_duration_minutes` | INTEGER | No | NULL | ≥ 0 | Actual | Internal |
| `assigned_to` | UUID | No | NULL | FK to `workforce_master` | Assignee | Confidential |
| `started_at` | TIMESTAMPTZ | No | NULL | — | Start | Internal |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Completion (per Part 13) | Internal |
| `photo_evidence` | UUID[] | No | `ARRAY[]::UUID[]` | — | Photo attachments | Confidential |
| `completion_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `completion_status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, COMPLETED, SKIPPED, FAILED | Status | Internal |
| `verified_by` | UUID | No | NULL | FK to `workforce_master` | Verifier | Confidential |
| `verified_at` | TIMESTAMPTZ | No | NULL | — | Verification | Internal |
| `dependency_task_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Dependencies | Internal |
| `is_mandatory` | BOOLEAN | Yes | `true` | — | Cannot skip | Internal |
| `is_safety_critical` | BOOLEAN | Yes | `false` | — | Safety critical | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, COMPLETED, SKIPPED, FAILED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Work Order (533) | Many-to-One | N:1 | Parent WO |
| Workforce Master (381) | Many-to-One | N:1 | Assignee |
| Self (534) | Self-reference | N:N | Dependencies |

### 6. Indexes
- INDEX (`work_order_id`, `task_sequence`)
- INDEX (`assigned_to`, `status`)
- INDEX (`task_type`, `status`)

### 7. Security Classification
**Confidential**

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): Task orchestration
- **Mobile App**: Task execution UI
- **Notification Service**: Task reminders

### 9. Sample Data
```json
{
  "work_order_id": "wo-001", "task_sequence": 1,
  "task_name": "Safety Lockout-Tagout", "task_type": "SAFETY_CHECK",
  "description": "Apply LOTO before starting maintenance",
  "safety_requirements": [{ "requirement": "LOTO Applied", "verified": true }],
  "estimated_duration_minutes": 15, "actual_duration_minutes": 12,
  "is_mandatory": true, "is_safety_critical": true,
  "completion_status": "COMPLETED", "status": "COMPLETED"
}
```

### 10. Audit Events
`WO_TASK_STARTED`, `WO_TASK_COMPLETED`, `WO_TASK_SKIPPED`, `WO_TASK_FAILED`, `WO_TASK_VERIFIED`

---

## Entity 535 — Maintenance Checklist

### 1. Business Purpose
Per Part 13 §3: Supports Inspection, Lubrication, Cleaning, Calibration, Replacement, Testing. Reusable checklist templates.

### 2. Architectural Role
Template entity — defines checklists that can be reused across maintenance plans. Ensures standardization.

### 3. Business Rules
- Checklist type drives the question pattern
- Inspection: yes/no/N-A questions with optional comments
- Lubrication: type + quantity + location
- Cleaning: method + solvent + area
- Calibration: standard + before + after + instrument
- Replacement: old part + new part + serial numbers
- Testing: test parameters + expected + actual + pass/fail
- Checklists are versioned

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `checklist_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `checklist_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `checklist_type` | ENUM | Yes | — | INSPECTION, LUBRICATION, CLEANING, CALIBRATION, REPLACEMENT, TESTING, COMPREHENSIVE | Type (per Part 13) | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `items` | JSONB | Yes | `'[]'` | — | Checklist items [{ seq, category, item, type, expected, mandatory, photo_required }] | Internal |
| `total_items` | INTEGER | Yes | `0` | ≥ 0 | Item count | Internal |
| `mandatory_items_count` | INTEGER | Yes | `0` | ≥ 0 | Mandatory count | Internal |
| `applicable_asset_types` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Asset types | Internal |
| `applicable_categories` | UUID[] | No | `ARRAY[]::UUID[]` | — | Asset categories | Internal |
| `estimated_duration_minutes` | INTEGER | Yes | — | > 0 | Estimated | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `maintenance_checklists` (self) | Previous | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE, SUPERSEDED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Maintenance Plan (531) | One-to-Many | 1:N | Plans using this checklist |
| Self (535) | Self-reference | N:1 | Previous version |

### 6. Indexes
- UNIQUE (`checklist_code`)
- INDEX (`checklist_type`, `status`)
- GIN INDEX (`applicable_asset_types`)

### 7. Security Classification
**Internal**

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): Checklist rendering
- **Mobile App**: Checklist execution
- **Quality** (Part 8): Compliance reporting

### 9. Sample Data
```json
{
  "checklist_code": "CHK-MIX-PM-001", "checklist_name": "Mixer Monthly PM Checklist",
  "checklist_type": "COMPREHENSIVE", "total_items": 25, "mandatory_items_count": 18,
  "items": [
    { "seq": 1, "category": "SAFETY", "item": "LOTO Applied", "type": "YES_NO", "mandatory": true },
    { "seq": 2, "category": "INSPECTION", "item": "Check motor temperature", "type": "READING", "expected": "< 65°C", "mandatory": true }
  ],
  "version": "2.0", "is_latest_version": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`CHECKLIST_CREATED`, `CHECKLIST_UPDATED`, `CHECKLIST_VERSION_PUBLISHED`, `CHECKLIST_APPROVED`, `CHECKLIST_SUPERSEDED`

---

## Entity 536 — Technician Assignment

### 1. Business Purpose
Per Part 13 §3: Stores Technician, Skills, Shift, Estimated Hours. Workforce-to-WO assignment with skill matching.

### 2. Architectural Role
Assignment entity — links maintenance work orders to qualified technicians. Uses HR Skills Matrix (Entity 473) for matching.

### 3. Business Rules
- Skill matching: technician must have required skills at required level
- Availability check: technician's shift, leave, existing assignments
- Workload balancing: don't overload one technician
- Multi-technician: complex WOs may need multiple technicians
- Auto-assignment: AI-based for routine WOs; manual for complex

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `assignment_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `work_order_id` | UUID | Yes | — | FK to `work_orders` (Entity 533) | WO | Internal |
| `technician_id` | UUID | Yes | — | FK to `workforce_master` | Technician (per Part 13) | Confidential |
| `technician_role` | ENUM | Yes | `PRIMARY` | PRIMARY, SECONDARY, ASSISTANT, SUPERVISOR | Role | Internal |
| `assigned_skills` | JSONB | Yes | `'[]'` | — | Skills (per Part 13) — matched skills | Internal |
| `skill_match_score` | DECIMAL(5,2) | Yes | — | 0-100 | Match score | Confidential |
| `shift_id` | UUID | Yes | — | FK to `shift_master` (Entity 433) | Shift (per Part 13) | Internal |
| `assignment_start` | TIMESTAMPTZ | Yes | — | — | Assignment start | Internal |
| `assignment_end` | TIMESTAMPTZ | Yes | — | > start | Assignment end | Internal |
| `estimated_hours` | DECIMAL(5,2) | Yes | — | > 0 | Estimated Hours (per Part 13) | Internal |
| `actual_hours` | DECIMAL(5,2) | No | NULL | ≥ 0 | Actual hours | Internal |
| `assignment_type` | ENUM | Yes | — | DEDICATED, SHARED, ON_CALL | Type | Internal |
| `priority` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW | Priority | Internal |
| `assignment_method` | ENUM | Yes | — | MANUAL, AUTO_ASSIGNMENT, AI_RECOMMENDATION | Method | Internal |
| `ai_recommendation_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI score | Confidential |
| `alternative_technician_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Alternates | Internal |
| `assignment_status` | ENUM | Yes | `ASSIGNED` | ASSIGNED, ACCEPTED, REJECTED, IN_PROGRESS, COMPLETED, CANCELLED | Status | Internal |
| `accepted_at` | TIMESTAMPTZ | No | NULL | — | Acceptance | Internal |
| `rejected_reason` | TEXT | No | NULL | — | Rejection reason | Confidential |
| `started_at` | TIMESTAMPTZ | No | NULL | — | Start | Internal |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Completion | Internal |
| `status` | ENUM | Yes | `ASSIGNED` | ASSIGNED, ACCEPTED, IN_PROGRESS, COMPLETED, REJECTED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Work Order (533) | Many-to-One | N:1 | WO |
| Workforce Master (381) | Many-to-One | N:1 | Technician |
| Shift Master (433) | Many-to-One | N:1 | Shift |
| Skills Matrix (473) | Many-to-Many | N:N | Skill match |

### 6. Indexes
- UNIQUE (`assignment_code`)
- INDEX (`work_order_id`, `assignment_status`)
- INDEX (`technician_id`, `assignment_status`)
- INDEX (`shift_id`, `assignment_start`)

### 7. Security Classification
**Confidential**

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): Assignment orchestration
- **HR** (Part 12): Skills Matrix for matching
- **Workforce Scheduling Engine** (FS-20): Availability check
- **Notification Service**: Assignment notifications

### 9. Sample Data
```json
{
  "assignment_code": "TA-2026-00456", "work_order_id": "wo-001",
  "technician_id": "wf-tech-001", "technician_role": "PRIMARY",
  "skill_match_score": 92.50, "shift_id": "shift-morning",
  "assignment_start": "2026-08-15T09:00:00Z", "assignment_end": "2026-08-15T13:00:00Z",
  "estimated_hours": 4.00, "assignment_method": "AI_RECOMMENDATION",
  "ai_recommendation_score": 88.50, "assignment_status": "ACCEPTED",
  "status": "ACCEPTED"
}
```

### 10. Audit Events
`TECHNICIAN_ASSIGNED`, `TECHNICIAN_ACCEPTED`, `TECHNICIAN_REJECTED`, `TECHNICIAN_STARTED`, `TECHNICIAN_COMPLETED`, `TECHNICIAN_REASSIGNED`

---

## Entity 537 — Maintenance History

### 1. Business Purpose
Per Part 13 §3: Stores Previous Work, Parts Used, Downtime, Labor Hours, Cost. Append-only record of all maintenance events per asset.

### 2. Architectural Role
Immutable history entity — append-only record linked to Asset History (E519). Source for reliability analytics.

### 3. Business Rules
- Append-only — never updated or deleted
- One record per WO completion
- Links to WO, asset, parts, technician
- Retention: lifetime of asset + 7 years
- Source for MTBF, MTTR, failure pattern analysis

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `history_code` | VARCHAR(40) | Yes | — | Unique | Code | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `work_order_id` | UUID | Yes | — | FK to `work_orders` (Entity 533) | WO | Internal |
| `work_order_number` | VARCHAR(30) | Yes | — | — | WO number (denormalized) | Internal |
| `maintenance_type` | ENUM | Yes | — | PREVENTIVE, CORRECTIVE, CALIBRATION, INSPECTION, MODIFICATION | Type | Internal |
| `event_date` | DATE | Yes | — | — | Event date | Internal |
| `event_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Event timestamp | Internal |
| `previous_work_summary` | TEXT | Yes | — | — | Previous Work (per Part 13) | Confidential |
| `parts_used` | JSONB | Yes | `'[]'` | — | Parts Used (per Part 13) — [{ part_id, qty, cost }] | Confidential |
| `parts_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Parts cost | Confidential |
| `downtime_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Downtime (per Part 13) | Internal |
| `labor_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Labor Hours (per Part 13) | Internal |
| `labor_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Labor cost | Confidential |
| `total_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost (per Part 13) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `performed_by` | UUID | Yes | — | FK to `workforce_master` | Technician | Confidential |
| `performed_by_vendor_id` | UUID | No | NULL | FK to `vendors` | External vendor | Internal |
| `root_cause` | TEXT | No | NULL | — | Root cause (if breakdown) | Confidential |
| `corrective_action` | TEXT | No | NULL | — | Action taken | Confidential |
| `preventive_action` | TEXT | No | NULL | — | Preventive action | Confidential |
| `quality_inspection_passed` | BOOLEAN | No | NULL | — | Quality check | Internal |
| `asset_health_before` | DECIMAL(5,2) | No | NULL | 0-100 | Health before | Confidential |
| `asset_health_after` | DECIMAL(5,2) | No | NULL | 0-100 | Health after | Confidential |
| `attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Photos/docs | Confidential |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Cost posting | Confidential |
| `retention_until` | DATE | Yes | — | — | Retention expiry | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-One | N:1 | Asset |
| Work Order (533) | One-to-One | 1:1 | WO |
| Workforce Master (381) | Many-to-One | N:1 | Technician |

### 6. Indexes
- UNIQUE (`history_code`)
- INDEX (`asset_id`, `event_date`)
- INDEX (`maintenance_type`, `event_date`)
- INDEX (`work_order_id`)

### 7. Security Classification
**Confidential**

### 8. Integration Points
- **Audit Service**: Centralized audit
- **AI/ML Service**: Reliability analytics
- **Asset Health** (E515): Updates health
- **Finance** (Part 11): Cost analytics

### 9. Sample Data
```json
{
  "history_code": "MH-2026-00567", "asset_id": "asset-001",
  "work_order_id": "wo-001", "work_order_number": "WO-2026-00123",
  "maintenance_type": "PREVENTIVE", "event_date": "2026-07-08",
  "previous_work_summary": "Monthly PM completed — inspected motor, gearbox, control panel",
  "parts_used": [{ "part_id": "prod-bearing-001", "qty": 4, "cost": 10000 }],
  "parts_cost_total": 10000.0000, "downtime_hours": 4.00,
  "labor_hours": 3.50, "labor_cost": 1750.0000,
  "total_cost": 11750.0000, "performed_by": "wf-tech-001",
  "asset_health_before": 75.00, "asset_health_after": 88.00,
  "status": "RECORDED"
}
```

### 10. Audit Events
`MAINTENANCE_HISTORY_RECORDED`, `MAINTENANCE_HISTORY_ARCHIVED`

---

## Entity 538 — Maintenance Calendar

### 1. Business Purpose
Per Part 13 §3: Displays Daily, Weekly, Monthly, Upcoming PM. Calendar view of maintenance activities.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `facility_id` | UUID | No | NULL | FK to `facilities` | Facility | Internal |
| `view_type` | ENUM | Yes | `MONTHLY` | DAILY, WEEKLY, MONTHLY (per Part 13) | View | Internal |
| `view_start_date` | DATE | Yes | — | — | View start | Internal |
| `view_end_date` | DATE | Yes | — | > start | View end | Internal |
| `scheduled_maintenance` | JSONB | Yes | `'[]'` | — | Scheduled PM in view | Internal |
| `upcoming_pm_count` | INTEGER | Yes | `0` | ≥ 0 | Upcoming PM (per Part 13) | Internal |
| `upcoming_pm_7d` | INTEGER | Yes | `0` | ≥ 0 | Next 7 days | Internal |
| `upcoming_pm_30d` | INTEGER | Yes | `0` | ≥ 0 | Next 30 days | Internal |
| `overdue_pm_count` | INTEGER | Yes | `0` | ≥ 0 | Overdue | Internal |
| `breakdown_wo_count` | INTEGER | Yes | `0` | ≥ 0 | Active breakdown WOs | Internal |
| `technician_workload` | JSONB | Yes | `'[]'` | — | Per-technician workload | Confidential |
| `asset_downtime_scheduled` | JSONB | Yes | `'[]'` | — | Scheduled downtime | Internal |
| `capacity_utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Tech capacity used | Internal |
| `conflicts_detected` | JSONB | Yes | `'[]'` | — | Scheduling conflicts | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 539 — SLA Monitoring

### 1. Business Purpose
Per Part 13 §3: Tracks Response Time, Repair Time, Completion Time, Compliance. SLA monitoring for maintenance operations.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `sla_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `work_order_id` | UUID | Yes | — | FK to `work_orders` (Entity 533) | WO | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `criticality_level` | ENUM | Yes | — | CRITICAL, HIGH, MEDIUM, LOW | Asset criticality | Internal |
| `sla_response_target_hours` | DECIMAL(7,2) | Yes | — | > 0 | Response target | Internal |
| `sla_repair_target_hours` | DECIMAL(7,2) | Yes | — | > 0 | Repair target | Internal |
| `sla_completion_target_hours` | DECIMAL(7,2) | Yes | — | > 0 | Completion target | Internal |
| `actual_response_hours` | DECIMAL(7,2) | No | NULL | ≥ 0 | Response Time (per Part 13) | Internal |
| `actual_repair_hours` | DECIMAL(7,2) | No | NULL | ≥ 0 | Repair Time (per Part 13) | Internal |
| `actual_completion_hours` | DECIMAL(7,2) | No | NULL | ≥ 0 | Completion Time (per Part 13) | Internal |
| `response_compliance` | BOOLEAN | Yes | `false` | — | Response met | Internal |
| `repair_compliance` | BOOLEAN | Yes | `false` | — | Repair met | Internal |
| `completion_compliance` | BOOLEAN | Yes | `false` | — | Completion met | Internal |
| `overall_compliance` | BOOLEAN | Yes | `false` | — | Compliance (per Part 13) — all met | Internal |
| `sla_breach_count` | INTEGER | Yes | `0` | ≥ 0 | Breaches | Internal |
| `breach_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `escalation_triggered` | BOOLEAN | Yes | `false` | — | Escalated | Internal |
| `escalation_level` | INTEGER | Yes | `0` | ≥ 0 | Level reached | Internal |
| `escalation_chain` | JSONB | Yes | `'[]'` | — | Chain | Confidential |
| `compensation_payable` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | SLA penalty (if AMC) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, COMPLETED, BREACHED, ESCALATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 540 — Maintenance Dashboard

### 1. Business Purpose
Per Part 13 §3: Displays Open Work Orders, Overdue PM, Machine Downtime, Technician Utilization, Maintenance Cost, Asset Availability. AI: PM Optimization, Failure Prediction, Spare Parts Forecast, Technician Assignment, Downtime Prediction, RUL.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | FACILITY, COMPANY | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `open_work_orders_count` | INTEGER | Yes | `0` | ≥ 0 | Open WOs (per Part 13) | Internal |
| `open_wo_by_priority` | JSONB | Yes | `'{}'` | — | By priority | Internal |
| `open_wo_by_type` | JSONB | Yes | `'{}'` | — | By type | Internal |
| `overdue_pm_count` | INTEGER | Yes | `0` | ≥ 0 | Overdue PM (per Part 13) | Internal |
| `overdue_pm_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost of overdue | Confidential |
| `machine_downtime_hours_today` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Downtime today (per Part 13) | Internal |
| `machine_downtime_hours_mtd` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Downtime MTD | Internal |
| `downtime_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Downtime cost | Confidential |
| `technician_utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Tech Utilization (per Part 13) | Internal |
| `technician_workload` | JSONB | Yes | `'[]'` | — | Per-technician | Confidential |
| `maintenance_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Maintenance Cost MTD (per Part 13) | Confidential |
| `maintenance_cost_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | YTD | Confidential |
| `maintenance_cost_by_type` | JSONB | Yes | `'{}'` | — | By type | Confidential |
| `asset_availability_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Asset Availability (per Part 13) | Internal |
| `pm_compliance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | PM compliance | Internal |
| `mtbf_hours` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Mean time between failures | Confidential |
| `mttr_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Mean time to repair | Confidential |
| `sla_compliance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | SLA compliance | Internal |
| `ai_pm_optimization` | JSONB | No | NULL | — | AI: PM optimization | Restricted |
| `ai_failure_prediction` | JSONB | No | NULL | — | AI: failure prediction (per Part 13 AI) | Restricted |
| `ai_spare_parts_forecast` | JSONB | No | NULL | — | AI: spare parts forecast (per Part 13 AI) | Confidential |
| `ai_technician_assignment` | JSONB | No | NULL | — | AI: technician assignment (per Part 13 AI) | Confidential |
| `ai_downtime_prediction` | JSONB | No | NULL | — | AI: downtime prediction (per Part 13 AI) | Restricted |
| `ai_remaining_useful_life` | JSONB | No | NULL | — | AI: RUL (per Part 13 AI) | Restricted |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# Part 13 Batch 1 Completion Summary

**All 30 Asset Foundation, Hierarchy & PM entities are now defined** at full enterprise-grade depth.

## Architectural Decisions Locked

1. **Enterprise Asset Register** — Single source of truth for all enterprise assets
2. **Complete Lifecycle Management** — State machine from PLANNED to DISPOSED
3. **Asset Cost Tracking** — TCO accumulation across asset lifetime
4. **Health Monitoring** — Real-time + AI-driven predictive health scoring
5. **QR/Barcode Support** — Multi-modal asset identification (QR/Barcode/RFID/NFC)
6. **Multi-Level Asset Hierarchy** — Unlimited depth, materialized path
7. **Criticality Matrix** — 4-level with SLA, escalation, spare stocking policies
8. **Digital Asset Library** — Versioned documentation with OCR search
9. **Spare Parts Mapping** — Auto-replenishment integration with Procurement
10. **Utility Tracking** — Multi-utility (Power/Water/Steam/Gas/Air) with CO2 tracking
11. **Enterprise Maintenance Execution Engine (Q174, FS-31)** — NEW platform service
12. **Closed-Loop Maintenance** — Integration with Manufacturing, Warehouse, Procurement, Finance, HR
13. **PM Plans** — Time-based, Meter-based, Condition-based triggers
14. **Work Order Lifecycle** — Full WO state machine with task decomposition
15. **Maintenance Checklists** — Reusable, versioned templates
16. **Technician Assignment** — AI-recommended with skill matching
17. **Maintenance History** — Append-only immutable ledger
18. **SLA Monitoring** — Per-criticality SLA with escalation
19. **AI Insights** — PM optimization, failure prediction, RUL, downtime prediction
20. **Mobile Operations** — Scan QR, execute WO, upload photos, offline mode

## New Foundation Service Locked

### Enterprise Maintenance Execution Engine — Foundation Service #31

| Attribute | Value |
|---|---|
| Service ID | FS-31 |
| Architectural Decision | Q174 |
| Status | LOCKED |
| Owner | Enterprise Architect |
| Consumers | All EAM entities (511-540+), Manufacturing, Warehouse, Procurement, Finance, HR |
| Capabilities | PM scheduling, WO orchestration, technician assignment, inventory reservation, accounting events, maintenance analytics |
| Design Principle | Closed-loop maintenance — not isolated module |
| Integrations | Manufacturing (downtime), Warehouse (spares), Procurement (replenishment), Finance (cost posting), HR (technician scheduling) |

## Cross-Module Integration Matrix

### EAM → Other Modules
| Target Module | Integration |
|---|---|
| Manufacturing (Part 7) | Machine downtime, production impact, OEE |
| Warehouse (Part 6) | Spare parts inventory, picking |
| Procurement (Part 5) | Spare replenishment, AMC renewal |
| Finance (Part 11) | Asset capitalization, depreciation, maintenance cost |
| HR (Part 12) | Technician assignment, skills matching |
| Quality (Part 8) | Calibration, inspection compliance |
| Inventory (Part 4) | Spare parts consumption |

### Other Modules → EAM
| Source Module | Integration |
|---|---|
| Manufacturing (Part 7) | Machine runtime, meter readings |
| IoT Service | Sensor data, anomaly alerts |
| Procurement (Part 5) | New asset registration from PO |
| Finance (Part 11) | Asset capitalization triggers |

## Part 13 Progress Tracker

| Batch | Sections | Entities | Status |
|---|---|---|---|
| **Batch 1** | **1-3 (Foundation, Hierarchy, PM)** | **511-540** | **✅ COMPLETE (LOCKED)** |
| Batch 2 | 4-6 (Breakdown, Spares, Calibration) | 541-570 | ⏳ PENDING |
| Batch 3 | 7-9 (Predictive, IoT, Analytics) | 571-600 | ⏳ PENDING |

## Cumulative Status

- **Manual 1 cumulative**: 545 entities (Parts 1-13 Batch 1)
- **Foundation Services**: 31 (FS-1 through FS-31)
- **Architectural Decisions**: 174 (Q1-Q174)

---

*End of Manual 1 Part 13 Sections 1-3. Next batch: Sections 4-6 (Breakdown Maintenance, Spare Parts Inventory, Calibration & Compliance).*

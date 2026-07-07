# Manual 1 · Part 8 Sec 6 (161-170) + Part 9 Sec 1 (171-180) — Quality Intelligence & Retail Foundation

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Parts | 8 §6 (Quality Intelligence) + 9 §1 (Retail Foundation) |
| Entities | 161–170 (Quality Intelligence) + 171–180 (Retail Foundation) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 14 §14.11, Ch 15 §15.6, Ch 24 §24.5, Part 8 §6, Part 9 §1 |
| Last Updated | 2026-07-07 |

---

# PART 8 SECTION 6 — Quality Intelligence, KPIs, Dashboards & AI (Entities 161-170)

## Overview

Section 6 completes the QMS domain by adding the **intelligence layer** — transforming quality data into actionable insights via KPIs, dashboards, predictive analytics, benchmarking, knowledge management, and Mission Control.

```
QUALITY DATA (Sections 1-5)
  ↓ Aggregated into
QUALITY KPI (161) + DASHBOARD (162) + ALERTS (163)
  ↓ Analyzed by
RISK ASSESSMENT (164) + PREDICTIVE QUALITY (165) + BENCHMARK (166)
  ↓ Governed by
REGULATORY AUDIT (167) + SCORECARD (168)
  ↓ Consumed by
KNOWLEDGE BASE (169) + MISSION CONTROL (170)
```

---

## Entity 161 — Quality KPI

### 1. Business Purpose
Stores enterprise quality metrics. Per Part 8: FPY, RFT, Incoming Acceptance %, Supplier Defect Rate, Internal Rejection %, Customer Complaint Rate, Recall Rate, CAPA Closure %, Inspection Compliance %, Audit Compliance %.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `kpi_code` | VARCHAR(30) | Yes | — | Unique per company | KPI code (e.g., `QKPI_FPY`) | Internal |
| `kpi_name` | VARCHAR(100) | Yes | — | — | Display name (per Part 8) | Public |
| `kpi_category` | ENUM | Yes | — | YIELD, DEFECT, COMPLIANCE, SUPPLIER, CUSTOMER, RECALL, CAPA, AUDIT, INSPECTION, MICROBIOLOGY, COST | Category | Internal |
| `formula` | TEXT | Yes | — | — | Calculation formula | Internal |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | UOM (%, count, days) | Internal |
| `target_value` | DECIMAL(18,4) | Yes | — | — | Target | Internal |
| `current_value` | DECIMAL(18,4) | No | NULL | — | Latest value | Internal |
| `previous_value` | DECIMAL(18,4) | No | NULL | — | Previous period | Internal |
| `trend_direction` | ENUM | No | NULL | IMPROVING, STABLE, DECLINING | Trend | Internal |
| `facility_id` | UUID | No | NULL | FK to `facilities` | Scope (NULL = company) | Internal |
| `department_id` | UUID | No | NULL | FK to `departments` | Scope | Internal |
| `snapshot_date` | DATE | Yes | — | — | Measurement date | Internal |
| `is_critical_kpi` | BOOLEAN | Yes | `false` | — | Critical KPI (feeds Mission Control) | Confidential |

---

## Entity 162 — Quality Dashboard

### 1. Business Purpose
Live operational dashboard. Per Part 8: Pending Inspections, Open CAPAs, Failed Batches, Quarantine Inventory, Laboratory Queue, Today's Pass %, Complaint Trend, Supplier Ranking, Quality Risk.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `dashboard_name` | VARCHAR(100) | Yes | — | — | Display name | Public |
| `facility_id` | UUID | No | NULL | FK to `facilities` | Scope | Internal |
| `widget_configuration` | JSONB | Yes | `'{}'` | — | Widget layout (per Part 8) | Internal |
| `refresh_interval_sec` | INTEGER | Yes | `30` | > 0 | Refresh rate | Internal |
| `target_audience` | ENUM | Yes | `QA_MANAGER` | QA_INSPECTOR, QA_MANAGER, PLANT_HEAD, EXECUTIVE | Audience | Internal |
| `is_mission_control_enabled` | BOOLEAN | Yes | `false` | — | Shows on Mission Control | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 163 — Quality Alert

### 1. Business Purpose
Enterprise quality alerts. Per Part 8: Critical NCR, CCP Failure, Microbiology Failure, Calibration Expired, Supplier Risk, Complaint Spike, Recall Initiated, Audit Failure. Priority: Critical, High, Medium, Low.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `alert_code` | VARCHAR(30) | Yes | — | Unique | Alert code | Internal |
| `alert_type` | ENUM | Yes | — | CRITICAL_NCR, CCP_FAILURE, MICROBIOLOGY_FAILURE, CALIBRATION_EXPIRED, SUPPLIER_RISK, COMPLAINT_SPIKE, RECALL_INITIATED, AUDIT_FAILURE (per Part 8) | Type | Confidential |
| `severity` | ENUM | Yes | `HIGH` | CRITICAL, HIGH, MEDIUM, LOW (per Part 8) | Priority | Internal |
| `source_entity_type` | VARCHAR(30) | Yes | — | — | Source entity | Internal |
| `source_entity_id` | UUID | Yes | — | — | Source ID | Internal |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Facility | Internal |
| `message` | TEXT | Yes | — | — | Alert message | Internal |
| `action_required` | TEXT | No | NULL | — | Recommended action | Internal |
| `is_acknowledged` | BOOLEAN | Yes | `false` | — | Ack flag | Internal |
| `acknowledged_by` | UUID | No | NULL | FK to `user_accounts` | Ack'd by | Internal |
| `resolved_at` | TIMESTAMPTZ | No | NULL | — | Resolution time | Internal |
| `status` | ENUM | Yes | `OPEN` | OPEN, ACKNOWLEDGED, RESOLVED, CLOSED | Status | Internal |

---

## Entity 164 — Quality Risk Assessment

### 1. Business Purpose
Calculates enterprise quality risk. Per Part 8 inputs: Supplier Quality, Machine Stability, Operator Skill, Inspection History, Complaint History, Batch History, Environmental Conditions. Outputs: Risk Score, Risk Category, Recommended Action.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `assessment_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Confidential |
| `assessment_date` | DATE | Yes | — | — | Assessment date | Internal |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Facility | Internal |
| `entity_type` | VARCHAR(30) | Yes | — | SUPPLIER, PRODUCT, BATCH, MACHINE, PROCESS | Assessed entity | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ID | Internal |
| `risk_inputs` | JSONB | Yes | `'{}'` | — | Input factors (per Part 8): `{ supplier_quality, machine_stability, operator_skill, ... }` | Confidential |
| `risk_score` | DECIMAL(5,2) | Yes | — | 0-100 | Overall risk score (per Part 8) | Confidential |
| `risk_category` | ENUM | Yes | — | LOW, MEDIUM, HIGH, CRITICAL (per Part 8) | Category | Confidential |
| `recommended_action` | TEXT | Yes | — | Min 10 chars | Action (per Part 8) | Internal |
| `ai_model_id` | UUID | No | NULL | FK to `ai_models` | AI model used | Internal |
| `confidence_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI confidence | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

---

## Entity 165 — Predictive Quality

### 1. Business Purpose
AI prediction engine. Per Part 8: Batch Failure, Complaint Probability, Supplier Risk, Inspection Failure, Microbiology Risk, Recall Probability, CAPA Success.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `prediction_type` | ENUM | Yes | — | BATCH_FAILURE, COMPLAINT_PROBABILITY, SUPPLIER_RISK, INSPECTION_FAILURE, MICROBIOLOGY_RISK, RECALL_PROBABILITY, CAPA_SUCCESS (per Part 8) | Type | Confidential |
| `target_entity_type` | VARCHAR(30) | Yes | — | — | Predicted entity | Internal |
| `target_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `prediction_date` | DATE | Yes | — | — | Date of prediction | Internal |
| `predicted_value` | DECIMAL(18,4) | Yes | — | — | Predicted value | Confidential |
| `probability_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Probability | Confidential |
| `confidence_lower` | DECIMAL(18,4) | No | NULL | — | Lower bound | Internal |
| `confidence_upper` | DECIMAL(18,4) | No | NULL | — | Upper bound | Internal |
| `ai_model_id` | UUID | Yes | — | FK to `ai_models` | Model used | Internal |
| `accuracy_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Model accuracy | Internal |
| `recommended_actions` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | AI recommendations | Internal |
| `actual_outcome` | DECIMAL(18,4) | No | NULL | — | Actual (for model training) | Internal |
| `outcome_recorded_at` | TIMESTAMPTZ | No | NULL | — | When actual recorded | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, VERIFIED, EXPIRED | Status | Internal |

---

## Entity 166 — Quality Benchmark

### 1. Business Purpose
Compare performance. Per Part 8: Plant vs Plant, Shift vs Shift, Product vs Product, Supplier vs Supplier, Machine vs Machine, Inspector vs Inspector.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `benchmark_name` | VARCHAR(200) | Yes | — | — | Name | Internal |
| `benchmark_type` | ENUM | Yes | — | PLANT_VS_PLANT, SHIFT_VS_SHIFT, PRODUCT_VS_PRODUCT, SUPPLIER_VS_SUPPLIER, MACHINE_VS_MACHINE, INSPECTOR_VS_INSPECTOR (per Part 8) | Type | Internal |
| `metric_code` | VARCHAR(30) | Yes | — | FK to `quality_kpis` (Entity 161) | Compared metric | Internal |
| `period_start` | DATE | Yes | — | — | Period start | Internal |
| `period_end` | DATE | Yes | — | > period_start | Period end | Internal |
| `entity_ids` | UUID[] | Yes | — | — | Entities compared | Internal |
| `results` | JSONB | Yes | `'{}'` | — | Comparison results: `[{ entity_id, value, rank }]` | Internal |
| `best_entity_id` | UUID | No | NULL | — | Top performer | Internal |
| `worst_entity_id` | UUID | No | NULL | — | Bottom performer | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Entity 167 — Regulatory Audit

### 1. Business Purpose
Tracks audits. Per Part 8: Internal, External, FSSAI, FDA, ISO, HACCP, BRCGS, Customer Audit.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `audit_number` | VARCHAR(50) | Yes | — | Unique per company | Display (per Part 8) | Public |
| `audit_type` | ENUM | Yes | — | INTERNAL, EXTERNAL, FSSAI, FDA, ISO_22000, HACCP, BRCGS, CUSTOMER_AUDIT (per Part 8) | Type | Confidential |
| `audit_scope` | TEXT | Yes | — | Min 10 chars | Scope (per Part 8) | Internal |
| `audited_facility_id` | UUID | Yes | — | FK to `facilities` | Audited facility | Internal |
| `auditor_name` | VARCHAR(200) | Yes | — | — | Auditor (per Part 8) | Internal |
| `auditor_organization` | VARCHAR(200) | No | NULL | — | Audit firm | Internal |
| `audit_start_date` | DATE | Yes | — | — | Start | Internal |
| `audit_end_date` | DATE | No | NULL | ≥ start | End | Internal |
| `findings` | JSONB | Yes | `'[]'` | — | Array of `{ severity, description, capA_required }` (per Part 8) | Confidential |
| `total_findings` | INTEGER | Yes | `0` | ≥ 0 | Total findings | Confidential |
| `critical_findings` | INTEGER | Yes | `0` | ≥ 0 | Critical count | Confidential |
| `audit_score` | DECIMAL(5,2) | Yes | — | 0-100 | Score (per Part 8) | Confidential |
| `capa_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Triggered CAPAs (per Part 8) | Confidential |
| `closure_status` | ENUM | Yes | `OPEN` | OPEN, PARTIALLY_CLOSED, FULLY_CLOSED | Closure (per Part 8) | Internal |
| `certificate_file_id` | UUID | No | NULL | FK to `file_attachments` | Audit certificate | Confidential |
| `status` | ENUM | Yes | `SCHEDULED` | SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED | Status | Internal |

---

## Entity 168 — Enterprise Quality Scorecard

### 1. Business Purpose
Comprehensive scorecard. Per Part 8: Supplier Quality, Production Quality, Warehouse Quality, Retail Quality, Restaurant Quality, Laboratory Quality, Customer Satisfaction, Compliance.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `scorecard_date` | DATE | Yes | — | — | Date | Internal |
| `facility_id` | UUID | No | NULL | FK to `facilities` | Scope (NULL = company) | Internal |
| `scorecard_type` | ENUM | Yes | `MONTHLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL | Period | Internal |
| `supplier_quality_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Supplier quality (per Part 8) | Confidential |
| `production_quality_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Production quality (per Part 8) | Confidential |
| `warehouse_quality_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Warehouse quality (per Part 8) | Internal |
| `retail_quality_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Retail quality (per Part 8) | Internal |
| `restaurant_quality_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Restaurant quality (per Part 8) | Internal |
| `laboratory_quality_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Lab quality (per Part 8) | Internal |
| `customer_satisfaction_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | CSAT (per Part 8) | Internal |
| `compliance_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Compliance (per Part 8) | Confidential |
| `overall_quality_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Weighted total | Confidential |
| `overall_grade` | ENUM | Yes | — | A, B, C, D, F | Letter grade | Internal |
| `previous_score` | DECIMAL(5,2) | No | NULL | — | Previous period | Internal |
| `trend_direction` | ENUM | No | NULL | IMPROVING, STABLE, DECLINING | Trend | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Entity 169 — Quality Knowledge Base

### 1. Business Purpose
Enterprise learning repository. Per Part 8: NCR, CAPA, Complaints, Recalls, Lessons Learned, Best Practices, Corrective Templates, Training Material. Supports semantic AI search.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `kb_code` | VARCHAR(30) | Yes | — | Unique per company | KB article code | Internal |
| `title` | VARCHAR(200) | Yes | — | Min 5 | Article title | Public |
| `article_type` | ENUM | Yes | — | NCR_CASE, CAPA_CASE, COMPLAINT_CASE, RECALL_CASE, LESSON_LEARNED, BEST_PRACTICE, CORRECTIVE_TEMPLATE, TRAINING_MATERIAL (per Part 8) | Type | Internal |
| `source_entity_type` | VARCHAR(30) | No | NULL | — | Source entity (NCR, CAPA, etc.) | Internal |
| `source_entity_id` | UUID | No | NULL | — | Source ID | Internal |
| `content` | TEXT | Yes | — | Min 50 chars | Article content | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Searchable tags | Internal |
| `semantic_embedding` | JSONB | No | NULL | — | AI semantic vector for search (per Part 8: "semantic AI search") | Internal |
| `view_count` | INTEGER | Yes | `0` | ≥ 0 | Times viewed | Internal |
| `useful_count` | INTEGER | Yes | `0` | ≥ 0 | "Found useful" count | Internal |
| `ai_generated` | BOOLEAN | Yes | `false` | — | AI-generated article | Internal |
| `ai_model_id` | UUID | No | NULL | FK to `ai_models` | AI model | Internal |
| `created_by` | UUID | Yes | — | FK to `user_accounts` | Author | Internal |
| `published_at` | TIMESTAMPTZ | No | NULL | — | Publication date | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, PUBLISHED, ARCHIVED | Status | Internal |

---

## Entity 170 — Quality Mission Control

### 1. Business Purpose
Executive command center. Per Part 8: Live Quality Score, Open Holds, Failed Batches, Pending Releases, Laboratory Queue, Supplier Risks, Recall Status, CAPA Status, AI Recommendations, Compliance Health.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `control_room_name` | VARCHAR(100) | Yes | — | — | Display name | Public |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Monitored facility (NULL = all) | Internal |
| `view_configuration` | JSONB | Yes | `'{}'` | — | Widget layout (per Part 8) | Internal |
| `display_duration_sec` | INTEGER | Yes | `30` | > 0 | Rotation interval | Internal |
| `is_live` | BOOLEAN | Yes | `true` | — | Real-time data | Internal |
| `websocket_endpoint` | VARCHAR(200) | No | NULL | — | Live data endpoint | Internal |
| `live_quality_score` | DECIMAL(5,2) | No | NULL | 0-100 | Current score | Internal |
| `open_holds` | INTEGER | No | NULL | ≥ 0 | Current holds | Internal |
| `failed_batches_today` | INTEGER | No | NULL | ≥ 0 | Failed today | Confidential |
| `pending_releases` | INTEGER | No | NULL | ≥ 0 | Pending QA releases | Internal |
| `lab_queue_count` | INTEGER | No | NULL | ≥ 0 | Lab samples in queue | Internal |
| `active_recalls` | INTEGER | No | NULL | ≥ 0 | Active recalls | Confidential |
| `open_capas` | INTEGER | No | NULL | ≥ 0 | Open CAPAs | Internal |
| `compliance_health_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Compliance % | Confidential |
| `ai_recommendations` | JSONB | No | NULL | — | Live AI recommendations (per Part 8) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

# PART 9 SECTION 1 — Retail Foundation, Store Master & Store Architecture (Entities 171-180)

## Overview

Section 1 of the Retail Operations domain establishes the **digital store model** — physical stores, departments, layouts, shelves, planograms, shelf positions, audits, zones, electronic shelf labels, and dashboards.

```
STORE MASTER (171)
  ├── STORE DEPARTMENT (172)
  ├── STORE LAYOUT (173)
  ├── STORE ZONE (178)
  ├── SHELF MASTER (174)
  │    ├── PLANOGRAM (175)
  │    │    └── SHELF POSITION (176)
  │    ├── SHELF AUDIT (177)
  │    └── ELECTRONIC SHELF LABEL (179)
  └── RETAIL DASHBOARD (180)
```

### Integrated Enhancement: Retail 2.0 Smart Store
- **AI-powered shelf cameras** — `ai_vision_enabled`, `camera_device_id`
- **Computer vision planogram compliance** — `vision_compliance_score`
- **Customer heat maps** — `heatmap_data`
- **Smart shopping carts** — `smart_cart_enabled`
- **RFID inventory** — `rfid_enabled`
- **Store Digital Twin** — `digital_twin_enabled`, `twin_model_file_id`
- **Self-checkout** — `self_checkout_count`

---

## Entity 171 — Store Master

### 1. Business Purpose
Represents a physical retail outlet. Per Part 9: *"Store Code immutable. Store cannot be deleted."* Formats: Flagship, Supermarket, Express, Kiosk, Franchise, Wholesale.

### 2-4. Owner / Schema / Fields

| Owner | L2 — Retail Head |
|---|---|
| Schema | `master` |
| Table | `stores` (extends `facilities` where facility_type = STORE) |

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `STR-` | Store code (immutable per Part 9) | Public | |
| `company_id` | UUID | Yes | — | FK to `companies` | Owning company | Internal | |
| `facility_id` | UUID | Yes | — | FK to `facilities` (STORE type) | Linked facility | Internal | |
| `store_name` | VARCHAR(200) | Yes | — | Min 3 | Display name (per Part 9) | Public | |
| `cluster_id` | UUID | No | NULL | FK to `store_clusters` | Retail cluster | Internal | |
| `region_id` | UUID | No | NULL | FK to `regions` | Retail region | Internal | |
| `manager_user_id` | UUID | Yes | — | FK to `user_accounts` | Store manager (per Part 9) | Internal | |
| `store_format` | ENUM | Yes | — | FLAGSHIP, SUPERMARKET, EXPRESS, KIOSK, FRANCHISE, WHOLESALE (per Part 9) | Format | Internal | |
| `opening_date` | DATE | Yes | — | — | Opening date (per Part 9) | Internal | |
| `trading_hours` | JSONB | Yes | `'{}'` | — | Trading hours: `[{ day, open, close, is_closed }]` (per Part 9) | Public | |
| `total_area_sqm` | DECIMAL(12,2) | No | NULL | > 0 | Total area | Internal | |
| `sales_floor_area_sqm` | DECIMAL(12,2) | No | NULL | > 0 | Sales floor | Internal | |
| `shelf_count` | INTEGER | Yes | `0` | ≥ 0 | Total shelves | Internal | |
| `pos_terminal_count` | INTEGER | Yes | `0` | ≥ 0 | POS terminals | Internal | |
| `self_checkout_count` | INTEGER | Yes | `0` | ≥ 0 | Self-checkout (per Retail 2.0) | Internal | |
| `digital_twin_enabled` | BOOLEAN | Yes | `false` | — | Digital Twin active (per Retail 2.0) | Internal | Digital Twin |
| `twin_model_file_id` | UUID | No | NULL | FK to `file_attachments` | 3D store model | Internal | |
| `ai_vision_enabled` | BOOLEAN | Yes | `false` | — | AI shelf cameras (per Retail 2.0) | Internal | Vision AI |
| `rfid_enabled` | BOOLEAN | Yes | `false` | — | RFID inventory (per Retail 2.0) | Internal | |
| `smart_cart_enabled` | BOOLEAN | Yes | `false` | — | Smart shopping carts (per Retail 2.0) | Internal | |
| `heatmap_data` | JSONB | No | NULL | — | Customer heat map (per Retail 2.0) | Internal | Heatmap AI |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, RENOVATION, CLOSED | Status | Internal | |
| Universal base fields | — | Yes | — | — | Standard | | |

### 5-16. Standard Pattern
- **Relationships**: → Company, Facility, UserAccount, StoreCluster, Region; → StoreDepartment, StoreLayout, Shelf, StoreZone (1:N each)
- **Index**: `uq_stores_code_company`, `idx_stores_cluster`, `idx_stores_format`, `idx_stores_status`
- **Validation**: `code` immutable; `facility_id` must be STORE type; cannot delete store with transactions
- **AI**: Shelf Optimization, Store Heatmaps, Customer Flow, Demand Forecast, Store Performance

```json
{
  "id": "01928f7a-...-store-001",
  "code": "STR-04",
  "store_name": "Sudhamrit Store - Kothrud",
  "store_format": "SUPERMARKET",
  "manager_user_id": "01928f7a-...-user-store-mgr",
  "opening_date": "2024-10-15",
  "trading_hours": [
    { "day": "MON", "open": "09:00", "close": "21:00", "is_closed": false },
    { "day": "SUN", "open": "09:00", "close": "21:00", "is_closed": false }
  ],
  "total_area_sqm": 120.00,
  "sales_floor_area_sqm": 90.00,
  "shelf_count": 48,
  "pos_terminal_count": 2,
  "self_checkout_count": 1,
  "digital_twin_enabled": true,
  "ai_vision_enabled": true,
  "rfid_enabled": false,
  "status": "ACTIVE"
}
```

---

## Entity 172 — Store Department

### 1. Business Purpose
Logical departments inside store. Per Part 9: Sweets, Namkeen, Bakery, Beverages, Frozen, Dairy, Cash Counter, Warehouse, Returns.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `store_id` | UUID | Yes | — | FK to `stores` | Parent store | Internal |
| `department_code` | VARCHAR(20) | Yes | — | Unique per store | Dept code | Internal |
| `department_name` | VARCHAR(100) | Yes | — | Min 2 | Display name (per Part 9) | Public |
| `category_id` | UUID | No | NULL | FK to `product_categories` | Linked product category | Internal |
| `manager_user_id` | UUID | No | NULL | FK to `user_accounts` | Dept manager | Internal |
| `area_sqm` | DECIMAL(12,2) | No | NULL | > 0 | Department area | Internal |
| `shelf_count` | INTEGER | Yes | `0` | ≥ 0 | Shelves in dept | Internal |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 173 — Store Layout

### 1. Business Purpose
Digital representation of store. Per Part 9: Entrance, Checkout, Departments, Aisles, Shelves, End Caps, Promotional Areas, Storage Room, Exit. Supports future digital twin.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `store_id` | UUID | Yes | — | FK to `stores` | Parent store | Internal |
| `layout_name` | VARCHAR(200) | Yes | — | Min 3 | Layout name | Public |
| `layout_version` | VARCHAR(20) | Yes | `v1` | — | Version | Internal |
| `layout_data` | JSONB | Yes | `'{}'` | — | Full layout: `{ zones: [{ type, coordinates, area }], aisles: [...] }` (per Part 9) | Internal |
| `layout_file_id` | UUID | No | NULL | FK to `file_attachments` | 2D/3D layout file | Internal |
| `is_active` | BOOLEAN | Yes | `true` | — | Active layout | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 174 — Shelf Master

### 1. Business Purpose
Physical shelf. Per Part 9: Supports Smart Shelf, Weight Sensors, Electronic Shelf Labels.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `store_id` | UUID | Yes | — | FK to `stores` | Parent store | Internal | |
| `shelf_code` | VARCHAR(20) | Yes | — | Unique per store | Shelf code (per Part 9) | Public | |
| `department_id` | UUID | Yes | — | FK to `store_departments` | Department | Internal | |
| `zone_id` | UUID | No | NULL | FK to `store_zones` | Zone | Internal | |
| `shelf_type` | ENUM | Yes | `STANDARD` | STANDARD, END_CAP, PROMOTIONAL, GONDOLA, WALL, ISLAND | Type | Internal | |
| `height_cm` | DECIMAL(8,2) | Yes | — | > 0 | Height (per Part 9) | Internal | |
| `width_cm` | DECIMAL(8,2) | Yes | — | > 0 | Width (per Part 9) | Internal | |
| `depth_cm` | DECIMAL(8,2) | No | NULL | > 0 | Depth | Internal | |
| `shelf_levels` | INTEGER | Yes | `5` | > 0 | Number of levels | Internal | |
| `capacity` | DECIMAL(18,4) | No | NULL | > 0 | Total capacity | Internal | |
| `barcode_value` | VARCHAR(100) | Yes | — | Generated | Shelf barcode (per Part 9) | Public | |
| `is_smart_shelf` | BOOLEAN | Yes | `false` | — | Smart shelf (per Part 9) | Internal | |
| `has_weight_sensor` | BOOLEAN | Yes | `false` | — | Weight sensor (per Part 9) | Internal | |
| `has_esl` | BOOLEAN | Yes | `false` | — | Electronic shelf label (per Part 9) | Internal | |
| `ai_vision_camera_id` | VARCHAR(50) | No | NULL | — | AI shelf camera (per Retail 2.0) | Internal | Vision AI |
| `current_utilization_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Current utilization (event-updated) | Internal | Slotting AI |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, MAINTENANCE | Status | Internal | |

---

## Entity 175 — Planogram

### 1. Business Purpose
Defines shelf layout. Per Part 9: *"Version controlled. Store-specific."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `PGM-` | Planogram code | Internal |
| `planogram_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Public |
| `store_id` | UUID | Yes | — | FK to `stores` | Store-specific (per Part 9) | Internal |
| `shelf_id` | UUID | Yes | — | FK to `shelf_masters` | Target shelf | Internal |
| `version_number` | INTEGER | Yes | `1` | > 0, unique per store+shelf | Version (per Part 9: "Version controlled") | Internal |
| `effective_from` | DATE | Yes | — | — | Effective date | Internal |
| `effective_to` | DATE | No | NULL | Auto-set when superseded | Effective end | Internal |
| `is_active` | BOOLEAN | Yes | `true` | — | Active version | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Approver | Internal |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval time | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, APPROVED, ACTIVE, INACTIVE | Status | Internal |

---

## Entity 176 — Shelf Position

### 1. Business Purpose
Exact product placement. Per Part 9: Shelf, Row, Column, Facing, Sequence, Product, Status.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `planogram_id` | UUID | Yes | — | FK to `planograms` | Parent planogram | Internal |
| `shelf_id` | UUID | Yes | — | FK to `shelf_masters` | Physical shelf | Internal |
| `row_number` | INTEGER | Yes | — | > 0 | Row (per Part 9) | Internal |
| `column_number` | INTEGER | Yes | — | > 0 | Column (per Part 9) | Internal |
| `facing_count` | INTEGER | Yes | — | > 0 | Facings (per Part 9) | Internal |
| `sequence_number` | INTEGER | Yes | — | > 0 | Display sequence (per Part 9) | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Product placed | Internal |
| `display_type` | ENUM | No | `STANDARD` | STANDARD, HANGING, STACKED, BIN, END_CAP | Display type (per Part 9) | Internal |
| `minimum_quantity` | INTEGER | Yes | — | ≥ 0 | Min qty (per Part 9) | Internal |
| `maximum_quantity` | INTEGER | Yes | — | ≥ minimum | Max qty (per Part 9) | Internal |
| `priority` | ENUM | Yes | `MEDIUM` | HIGH, MEDIUM, LOW | Placement priority | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 177 — Shelf Audit

### 1. Business Purpose
Verifies shelf compliance. Per Part 9: Correct Product, Correct Facing, Stock Available, Pricing Correct, Label Correct, Cleanliness, Damage. Supports Photo Evidence, Barcode Validation.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `audit_code` | VARCHAR(30) | Yes | — | Unique per company, `SAUD-` | Audit code | Internal | |
| `store_id` | UUID | Yes | — | FK to `stores` | Audited store | Internal | |
| `shelf_id` | UUID | Yes | — | FK to `shelf_masters` | Audited shelf | Internal | |
| `planogram_id` | UUID | Yes | — | FK to `planograms` | Expected planogram | Internal | |
| `auditor_user_id` | UUID | Yes | — | FK to `user_accounts` | Auditor | Internal | |
| `audit_date` | DATE | Yes | `CURRENT_DATE` | — | Audit date | Internal | |
| `compliance_score` | DECIMAL(5,2) | Yes | — | 0-100 | Overall compliance % | Internal | |
| `correct_product` | BOOLEAN | Yes | `false` | — | Correct product (per Part 9) | Internal | |
| `correct_facing` | BOOLEAN | Yes | `false` | — | Correct facing (per Part 9) | Internal | |
| `stock_available` | BOOLEAN | Yes | `false` | — | Stock present (per Part 9) | Internal | |
| `pricing_correct` | BOOLEAN | Yes | `false` | — | Price correct (per Part 9) | Internal | |
| `label_correct` | BOOLEAN | Yes | `false` | — | Label correct (per Part 9) | Internal | |
| `cleanliness_score` | DECIMAL(5,2) | No | NULL | 0-100 | Cleanliness (per Part 9) | Internal | |
| `damage_found` | BOOLEAN | Yes | `false` | — | Damage (per Part 9) | Internal | |
| `barcode_verified` | BOOLEAN | Yes | `false` | — | Barcode scan validation (per Part 9) | Internal | |
| `photo_file_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Evidence photos (per Part 9) | Internal | |
| `vision_compliance_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI Vision compliance (per Retail 2.0) | Internal | Vision AI |
| `vision_anomalies` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | AI-detected issues | Internal | |
| `corrective_action` | TEXT | No | NULL | — | Action needed | Internal | |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, IN_PROGRESS, COMPLETED | Status | Internal | |

---

## Entity 178 — Store Zone

### 1. Business Purpose
Operational areas. Per Part 9: Receiving, Back Store, Sales Floor, Checkout, Returns, Promotion Zone, Warehouse.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `store_id` | UUID | Yes | — | FK to `stores` | Parent store | Internal |
| `zone_code` | VARCHAR(20) | Yes | — | Unique per store | Zone code | Internal |
| `zone_name` | VARCHAR(100) | Yes | — | Min 2 | Display name (per Part 9) | Public |
| `zone_type` | ENUM | Yes | — | RECEIVING, BACK_STORE, SALES_FLOOR, CHECKOUT, RETURNS, PROMOTION_ZONE, WAREHOUSE (per Part 9) | Type | Internal |
| `area_sqm` | DECIMAL(12,2) | No | NULL | > 0 | Zone area | Internal |
| `temperature_controlled` | BOOLEAN | Yes | `false` | — | Cold zone | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 179 — Electronic Shelf Label (ESL)

### 1. Business Purpose
Digital pricing. Per Part 9: Supports automatic updates. Fields: Shelf, Product, Displayed Price, Current Price, Promotion, Battery, Status.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `esl_code` | VARCHAR(30) | Yes | — | Unique per store | ESL identifier | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal |
| `shelf_id` | UUID | Yes | — | FK to `shelf_masters` | Physical shelf (per Part 9) | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Displayed product (per Part 9) | Internal |
| `displayed_price` | DECIMAL(18,4) | Yes | — | ≥ 0 | Currently displayed (per Part 9) | Public |
| `current_price` | DECIMAL(18,4) | Yes | — | ≥ 0 | System price (per Part 9) | Confidential |
| `is_price_matched` | BOOLEAN | Yes | `false` | Generated: `displayed_price = current_price` | Sync status | Internal |
| `promotion_id` | UUID | No | NULL | FK to `promotions` | Active promotion (per Part 9) | Internal |
| `battery_level_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Battery (per Part 9) | Internal |
| `last_synced_at` | TIMESTAMPTZ | No | NULL | — | Last price sync | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, OFFLINE, LOW_BATTERY, ERROR | Status (per Part 9) | Internal |

---

## Entity 180 — Retail Dashboard

### 1. Business Purpose
Store-level dashboard snapshot. Per Part 9: Sales Today, Footfall, Average Basket, Shelf Compliance, Promotion Success, Inventory Health, Out of Stock, Cash, Returns.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `store_id` | UUID | Yes | — | FK to `stores` | Store | Internal |
| `sales_today` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Sales (per Part 9) | Confidential |
| `footfall_today` | INTEGER | Yes | `0` | ≥ 0 | Footfall (per Part 9) | Internal |
| `avg_basket_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Avg basket (per Part 9) | Confidential |
| `shelf_compliance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Compliance (per Part 9) | Internal |
| `promotion_success_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Promo success (per Part 9) | Internal |
| `inventory_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Inv health (per Part 9) | Internal |
| `out_of_stock_count` | INTEGER | Yes | `0` | ≥ 0 | OOS items (per Part 9) | Internal |
| `cash_in_drawer` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cash (per Part 9) | Confidential |
| `returns_today` | INTEGER | Yes | `0` | ≥ 0 | Returns (per Part 9) | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI retail insights | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Completion Summary

### Part 8 Section 6 (Quality Intelligence) — COMPLETE

**All 10 Quality Intelligence entities defined:**

| Entity | Status |
|---|---|
| 161 Quality KPI | ✅ Complete |
| 162 Quality Dashboard | ✅ Complete |
| 163 Quality Alert | ✅ Complete |
| 164 Quality Risk Assessment | ✅ Complete |
| 165 Predictive Quality | ✅ Complete |
| 166 Quality Benchmark | ✅ Complete |
| 167 Regulatory Audit | ✅ Complete |
| 168 Enterprise Quality Scorecard | ✅ Complete |
| 169 Quality Knowledge Base | ✅ Complete |
| 170 Quality Mission Control | ✅ Complete |

### Part 9 Section 1 (Retail Foundation) — COMPLETE

**All 10 Retail Foundation entities defined:**

| Entity | Status |
|---|---|
| 171 Store Master | ✅ Complete |
| 172 Store Department | ✅ Complete |
| 173 Store Layout | ✅ Complete |
| 174 Shelf Master | ✅ Complete |
| 175 Planogram | ✅ Complete |
| 176 Shelf Position | ✅ Complete |
| 177 Shelf Audit | ✅ Complete |
| 178 Store Zone | ✅ Complete |
| 179 Electronic Shelf Label | ✅ Complete |
| 180 Retail Dashboard | ✅ Complete |

### Key Architectural Decisions

**Quality Intelligence (Part 8 Sec 6):**
1. Enterprise Quality Intelligence Layer — AI consumes all quality data
2. AI Quality Engine — Predictive quality, risk assessment, root cause suggestions
3. Quality Knowledge Base — Semantic AI search, lessons learned, CAPA templates
4. Quality Mission Control — Executive command center with live AI recommendations
5. Regulatory Audit Framework — Multi-jurisdiction audit tracking
6. Enterprise Scorecards — Cross-domain quality measurement

**Retail Foundation (Part 9 Sec 1):**
1. Digital Store Model — Complete digital representation of physical store
2. Version-controlled Planograms — Immutable after activation, store-specific
3. Barcode-enabled Shelves — Every shelf has barcode for mobile scan
4. Shelf Compliance Engine — Audit with photo evidence + barcode validation
5. Electronic Shelf Labels — Digital pricing with auto-sync
6. Store Digital Twin Ready — `digital_twin_enabled`, `twin_model_file_id`
7. AI Shelf Optimization — `ai_vision_enabled`, `vision_compliance_score`
8. Retail 2.0 Smart Store — RFID, smart carts, self-checkout, heat maps, AI cameras
9. Mobile-first Retail Execution — Shelf audit, price verification, planogram check on mobile
10. Enterprise Audit Trail — All shelf changes, planogram updates, price changes audited

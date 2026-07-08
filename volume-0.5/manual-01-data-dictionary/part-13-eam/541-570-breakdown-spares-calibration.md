# Manual 1 · Part 13 · Sections 4-6 · Entities 541-570 — Breakdown Maintenance, Spare Parts & Calibration/Compliance

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 13 — Enterprise Asset & Maintenance Management (EAM) |
| Sections | 4 (Breakdown Maintenance, Corrective Maintenance & Emergency Response), 5 (Spare Parts Inventory & Maintenance Stores), 6 (Calibration, Compliance & Asset Safety) |
| Entities | 541–570 |
| Version | 1.0.0 |
| Status | ACTIVE — LOCKED |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 9 §9.8, Part 13 §4-6 |
| Last Updated | 2026-07-08 |

---

## Overview — Operational Maintenance Layer

Sections 4-6 complete the **operational maintenance layer** of EAM:

```
BREAKDOWN MAINTENANCE (Sec 4: 541-550)
  Breakdown Ticket → Emergency WO → Failure Code → RCA → Downtime Register → Tech Dispatch → LOTO → Incident → Cost → Dashboard
  ↓ Sustained by
SPARE PARTS INVENTORY (Sec 5: 551-560)
  Spare Master → Category → BOM → Store → Reservation → Issue → Return → Consumption → Forecast → Dashboard
  ↓ Verified by
CALIBRATION & COMPLIANCE (Sec 6: 561-570)
  Calibration Master → Schedule → Certificate → History → Compliance Register → Safety Inspection → Checklist → AMC → Audit → Dashboard
```

### Integrated Enhancement: Reliability Engineering Engine (Architectural Lock Q175)

Per Chief Enterprise Architect recommendation, a dedicated **Reliability Engineering Engine** is hereby locked as **Foundation Service #32** (shared platform service). This elevates SUOP from a traditional maintenance module to a **Reliability-Centered Maintenance (RCM)** platform suitable for large manufacturing enterprises.

```
IoT Sensors ─┐
PLC / SCADA ─┤
Machine Runtime ─┤
Maintenance History ─┤
Failure Records ─┴──► Reliability Engine ──► MTBF
                      (RCM analytics)         ├─► MTTR
                                              ├─► Asset Availability
                                              ├─► Asset Reliability
                                              ├─► Failure Rate
                                              ├─► Maintenance Effectiveness
                                              ├─► Cost per Operating Hour
                                              ├─► OEE Integration
                                              ├─► Remaining Useful Life
                                              └─► Predictive Maintenance → Planning
```

**Engine Integrations (Locked)**:
- **Manufacturing** (Part 7): Production losses and OEE
- **Warehouse** (Part 6): Spare inventory availability
- **Procurement** (Part 5): Automatic spare purchasing
- **Finance** (Part 11): Maintenance cost accounting
- **Workforce Management** (Part 12): Technician skills and scheduling
- **Mission Control**: Enterprise maintenance KPIs

**Design Principle**: Reliability-Centered Maintenance (RCM) — proactive failure prevention, not just reactive repair.

---

# SECTION 4: Breakdown Maintenance, Corrective Maintenance & Emergency Response (Entities 541-550)

## Entity 541 — Breakdown Ticket

### 1. Business Purpose
Per Part 13 §4: Stores Ticket Number, Asset, Reported By, Report Time, Severity, Description, Status. The entry point for all unplanned maintenance events.

### 2. Architectural Role
Transaction entity — first artifact in breakdown workflow. Auto-creates Emergency Work Order (E542) and triggers technician dispatch (E546).

### 3. Business Rules
- Sources: OPERATOR (manual), IoT_ALERT (auto), INSPECTION (found during PM), EXTERNAL (vendor-reported)
- Severity: CRITICAL (production stopped), HIGH (degraded but running), MEDIUM (needs attention), LOW (cosmetic)
- SLA: Critical = 15 min response, High = 1 hr, Medium = 4 hr, Low = 24 hr
- Auto-escalation if SLA breached
- All tickets create Emergency Work Order (E542) automatically
- Production impact captured immediately for cost analysis

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ticket_number` | VARCHAR(30) | Yes | — | Unique per company | Ticket Number (per Part 13) | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset (per Part 13) | Internal |
| `asset_criticality` | ENUM | Yes | — | CRITICAL, HIGH, MEDIUM, LOW | Asset criticality | Internal |
| `reported_by` | UUID | Yes | — | FK to `workforce_master` (Entity 381) | Reported By (per Part 13) | Confidential |
| `reported_by_name` | VARCHAR(200) | Yes | — | — | Denormalized name | Internal |
| `reported_at` | TIMESTAMPTZ | Yes | `now()` | — | Report Time (per Part 13) | Internal |
| `reported_source` | ENUM | Yes | — | OPERATOR, IoT_ALERT, INSPECTION, MANAGER, EXTERNAL_VENDOR, SAFETY_SYSTEM | Source | Internal |
| `iot_alert_id` | UUID | No | NULL | FK to `iot_alerts` | IoT source (if any) | Confidential |
| `severity` | ENUM | Yes | — | CRITICAL, HIGH, MEDIUM, LOW | Severity (per Part 13) | Internal |
| `priority` | ENUM | Yes | — | CRITICAL, HIGH, MEDIUM, LOW | Computed priority | Internal |
| `description` | TEXT | Yes | — | Min 10 | Description (per Part 13) | Confidential |
| `symptom_category` | ENUM | No | NULL | VIBRATION, NOISE, TEMPERATURE, LEAK, ELECTRICAL, MECHANICAL, PERFORMANCE, QUALITY, SAFETY, OTHER | Symptom | Internal |
| `asset_status_at_report` | ENUM | Yes | — | RUNNING, STOPPED, DEGRADED, FAILED | Asset state | Internal |
| `production_impact` | ENUM | Yes | `NONE` | NONE, REDUCED_OUTPUT, LINE_STOPPED, PLANT_STOPPED | Impact | Internal |
| `production_loss_estimate` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Estimated loss | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `safety_risk` | ENUM | Yes | `NONE` | NONE, LOW, MEDIUM, HIGH, CRITICAL | Safety risk | Confidential |
| `safety_risk_description` | TEXT | No | NULL | — | Risk details | Confidential |
| `photo_attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Photos | Confidential |
| `video_attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Videos | Confidential |
| `emergency_work_order_id` | UUID | No | NULL | FK to `emergency_work_orders` (Entity 542) | Linked EWO | Internal |
| `assigned_technician_id` | UUID | No | NULL | FK to `workforce_master` | Assigned technician | Confidential |
| `assigned_at` | TIMESTAMPTZ | No | NULL | — | Assignment time | Internal |
| `response_at` | TIMESTAMPTZ | No | NULL | — | First response | Internal |
| `resolved_at` | TIMESTAMPTZ | No | NULL | — | Resolution time | Internal |
| `closed_at` | TIMESTAMPTZ | No | NULL | — | Closure time | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA deadline | Internal |
| `sla_breached` | BOOLEAN | Yes | `false` | — | SLA breach | Internal |
| `downtime_register_id` | UUID | No | NULL | FK to `downtime_register` (Entity 545) | Downtime record | Internal |
| `incident_report_id` | UUID | No | NULL | FK to `incident_reports` (Entity 548) | Linked incident | Confidential |
| `rca_id` | UUID | No | NULL | FK to `rca` (Entity 544) | RCA (if required) | Confidential |
| `status` | ENUM | Yes | `OPEN` | OPEN, ACKNOWLEDGED, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED, CANCELLED, DUPLICATE | Status (per Part 13) | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-One | N:1 | Asset |
| Emergency Work Order (542) | One-to-One | 1:1 | EWO |
| Workforce Master (381) | Many-to-One | N:1 | Reporter/Technician |
| Downtime Register (545) | One-to-One | 1:1 | Downtime |
| Incident Report (548) | One-to-One | 1:1 | Incident (if safety) |
| RCA (544) | One-to-One | 1:1 | RCA (if required) |

### 6. Indexes
- UNIQUE (`ticket_number`)
- INDEX (`asset_id`, `status`)
- INDEX (`severity`, `status`, `sla_due_at`)
- INDEX (`assigned_technician_id`, `status`)
- INDEX (`reported_at`, `status`)
- INDEX (`reported_source`)

### 7. Security Classification
**Confidential** — safety risk and incident data is **Restricted**.

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): Auto-creates EWO
- **Manufacturing MES** (Part 7): Production line status
- **IoT Service**: Auto-ticket from sensor alerts
- **Notification Service**: Alert technicians & managers
- **HR** (Part 12): Technician dispatch
- **Reliability Engine** (Q175): Failure data feed

### 9. Sample Data
```json
{
  "ticket_number": "BT-2026-00456", "asset_id": "asset-001",
  "asset_criticality": "HIGH", "reported_by": "wf-operator-050",
  "reported_by_name": "Suresh Kumar", "reported_at": "2026-07-08T10:15:00Z",
  "reported_source": "OPERATOR", "severity": "HIGH", "priority": "HIGH",
  "description": "Mixer making abnormal grinding noise from gearbox area, temperature rising",
  "symptom_category": "NOISE", "asset_status_at_report": "DEGRADED",
  "production_impact": "REDUCED_OUTPUT", "production_loss_estimate": 25000.0000,
  "safety_risk": "MEDIUM", "status": "ASSIGNED"
}
```

### 10. Audit Events
`BREAKDOWN_TICKET_CREATED`, `BREAKDOWN_TICKET_ACKNOWLEDGED`, `BREAKDOWN_TICKET_ASSIGNED`, `BREAKDOWN_TICKET_RESOLVED`, `BREAKDOWN_TICKET_CLOSED`, `BREAKDOWN_TICKET_ESCALATED`, `BREAKDOWN_TICKET_CANCELLED`

---

## Entity 542 — Emergency Work Order

### 1. Business Purpose
Per Part 13 §4: Supports Critical, High, Medium, Low priority emergency work orders. Specialized WO type for breakdown response.

### 2. Architectural Role
Specialized Work Order (extends Entity 533) — distinct workflow with emergency SLAs, mandatory LOTO, and immediate technician dispatch.

### 3. Business Rules
- Auto-created from Breakdown Ticket (E541)
- Overrides scheduled PM (resource conflict resolution)
- Mandatory LOTO before any work (safety first)
- Real-time status updates required (every 30 min for Critical)
- Auto-escalation at 50%, 75%, 100% of SLA
- Production release requires Quality + Production Manager sign-off

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ewo_number` | VARCHAR(30) | Yes | — | Unique per company | EWO number | Internal |
| `breakdown_ticket_id` | UUID | Yes | — | FK to `breakdown_tickets` (Entity 541) | Source ticket | Internal |
| `parent_work_order_id` | UUID | No | NULL | FK to `work_orders` (Entity 533) | Linked WO | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `priority` | ENUM | Yes | — | CRITICAL, HIGH, MEDIUM, LOW (per Part 13) | Priority | Internal |
| `emergency_type` | ENUM | Yes | — | MECHANICAL_BREAKDOWN, ELECTRICAL_FAILURE, UTILITY_FAILURE, SAFETY_INCIDENT, STRUCTURAL, CONTROL_SYSTEM, HYDRAULIC, PNEUMATIC | Type | Internal |
| `description` | TEXT | Yes | — | Min 10 | Description | Confidential |
| `failure_code_id` | UUID | No | NULL | FK to `failure_codes` (Entity 543) | Failure code | Internal |
| `safety_permit_required` | BOOLEAN | Yes | `true` | — | Mandatory LOTO | Internal |
| `loto_id` | UUID | No | NULL | FK to `loto` (Entity 547) | LOTO record | Confidential |
| `production_release_required` | BOOLEAN | Yes | `true` | — | Production sign-off needed | Internal |
| `assigned_technician_id` | UUID | No | NULL | FK to `workforce_master` | Primary technician | Confidential |
| `secondary_technician_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Additional techs | Confidential |
| `assigned_at` | TIMESTAMPTZ | No | NULL | — | Assignment time | Internal |
| `dispatched_at` | TIMESTAMPTZ | No | NULL | — | Dispatch time | Internal |
| `arrived_at` | TIMESTAMPTZ | No | NULL | — | Tech arrival | Internal |
| `diagnosis_started_at` | TIMESTAMPTZ | No | NULL | — | Diagnosis start | Internal |
| `diagnosis_completed_at` | TIMESTAMPTZ | No | NULL | — | Diagnosis end | Internal |
| `repair_started_at` | TIMESTAMPTZ | No | NULL | — | Repair start | Internal |
| `repair_completed_at` | TIMESTAMPTZ | No | NULL | — | Repair end | Internal |
| `testing_started_at` | TIMESTAMPTZ | No | NULL | — | Testing start | Internal |
| `testing_completed_at` | TIMESTAMPTZ | No | NULL | — | Testing end | Internal |
| `production_released_at` | TIMESTAMPTZ | No | NULL | — | Production release | Internal |
| `closed_at` | TIMESTAMPTZ | No | NULL | — | Closure | Internal |
| `sla_response_target_minutes` | INTEGER | Yes | — | > 0 | Response SLA | Internal |
| `sla_repair_target_hours` | DECIMAL(7,2) | Yes | — | > 0 | Repair SLA | Internal |
| `sla_response_actual_minutes` | INTEGER | No | NULL | ≥ 0 | Actual response | Internal |
| `sla_repair_actual_hours` | DECIMAL(7,2) | No | NULL | ≥ 0 | Actual repair | Internal |
| `sla_breached` | BOOLEAN | Yes | `false` | — | Breach | Internal |
| `escalation_level` | INTEGER | Yes | `0` | ≥ 0 | Current escalation | Internal |
| `escalation_history` | JSONB | Yes | `'[]'` | — | Escalation events | Confidential |
| `diagnosis_notes` | TEXT | No | NULL | — | Diagnosis | Confidential |
| `repair_actions_taken` | TEXT | No | NULL | — | Actions | Confidential |
| `parts_used` | JSONB | Yes | `'[]'` | — | Spares used | Confidential |
| `external_vendor_id` | UUID | No | NULL | FK to `vendors` | External vendor | Internal |
| `vendor_response_time_hours` | DECIMAL(7,2) | No | NULL | ≥ 0 | Vendor response | Internal |
| `downtime_register_id` | UUID | No | NULL | FK to `downtime_register` (Entity 545) | Downtime | Internal |
| `breakdown_cost_id` | UUID | No | NULL | FK to `breakdown_costs` (Entity 549) | Cost | Confidential |
| `production_release_by` | UUID | No | NULL | FK to `workforce_master` | Release auth | Confidential |
| `quality_inspection_passed` | BOOLEAN | No | NULL | — | Quality check | Internal |
| `status` | ENUM | Yes | `CREATED` | CREATED, DISPATCHED, ARRIVED, DIAGNOSING, REPAIRING, TESTING, READY_FOR_RELEASE, RELEASED, CLOSED, CANCELLED, FAILED_REPAIR | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Breakdown Ticket (541) | Many-to-One | N:1 | Source |
| Failure Code (543) | Many-to-One | N:1 | Failure classification |
| LOTO (547) | One-to-One | 1:1 | Safety permit |
| Downtime Register (545) | One-to-One | 1:1 | Downtime |
| Breakdown Cost (549) | One-to-One | 1:1 | Cost |
| Workforce Master (381) | Many-to-One | N:1 | Technician |

### 6. Indexes
- UNIQUE (`ewo_number`)
- INDEX (`breakdown_ticket_id`)
- INDEX (`priority`, `status`, `sla_response_target_minutes`)
- INDEX (`assigned_technician_id`, `status`)
- INDEX (`emergency_type`, `status`)

### 7. Security Classification
**Confidential** — diagnosis and cost data is **Restricted**.

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): WO orchestration
- **Reliability Engine** (Q175): Failure data
- **Manufacturing MES** (Part 7): Production release
- **HR** (Part 12): Technician dispatch
- **Warehouse** (Part 6): Spare parts
- **Notification Service**: Real-time alerts

### 9. Sample Data
```json
{
  "ewo_number": "EWO-2026-00078", "breakdown_ticket_id": "bt-001",
  "asset_id": "asset-001", "priority": "HIGH",
  "emergency_type": "MECHANICAL_BREAKDOWN",
  "description": "Gearbox bearing failure — abnormal noise and temperature",
  "safety_permit_required": true, "production_release_required": true,
  "assigned_technician_id": "wf-tech-001", "priority": "HIGH",
  "sla_response_target_minutes": 60, "sla_repair_target_hours": 4.00,
  "status": "DIAGNOSING"
}
```

### 10. Audit Events
`EWO_CREATED`, `EWO_DISPATCHED`, `EWO_TECH_ARRIVED`, `EWO_DIAGNOSIS_COMPLETED`, `EWO_REPAIR_COMPLETED`, `EWO_TESTING_PASSED`, `EWO_PRODUCTION_RELEASED`, `EWO_CLOSED`, `EWO_ESCALATED`, `EWO_FAILED_REPAIR`

---

## Entity 543 — Failure Code

### 1. Business Purpose
Per Part 13 §4: Examples — Electrical, Mechanical, Hydraulic, Pneumatic, Software, Operator Error, Utility Failure. Standardized failure classification.

### 2. Architectural Role
Master entity — taxonomy of failure types. Enables pattern analysis and reliability analytics.

### 3. Business Rules
- Hierarchical: Category → Sub-category → Specific code
- Each failure code has typical root causes and recommended actions
- Linked to spare parts typically needed
- Used for MTBF/MTTR analysis by failure type
- AI uses failure codes for pattern recognition

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `failure_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `failure_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `failure_category` | ENUM | Yes | — | ELECTRICAL, MECHANICAL, HYDRAULIC, PNEUMATIC, SOFTWARE, OPERATOR_ERROR, UTILITY_FAILURE, STRUCTURAL, INSTRUMENTATION, CONTROL_SYSTEM, OTHER | Category (per Part 13) | Internal |
| `failure_subcategory` | VARCHAR(100) | No | NULL | — | Sub-category (e.g., "Bearing Failure") | Internal |
| `parent_failure_code_id` | UUID | No | NULL | FK to `failure_codes` (self) | Parent | Internal |
| `description` | TEXT | Yes | — | Min 20 | Description | Internal |
| `typical_root_causes` | JSONB | Yes | `'[]'` | — | Common causes | Internal |
| `typical_symptoms` | JSONB | Yes | `'[]'` | — | Common symptoms | Internal |
| `recommended_actions` | JSONB | Yes | `'[]'` | — | Standard fixes | Internal |
| `typical_spares_needed` | UUID[] | No | `ARRAY[]::UUID[]` | — | Spare part IDs | Internal |
| `typical_repair_time_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Typical repair | Internal |
| `severity_default` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW | Default severity | Internal |
| `production_impact_default` | ENUM | Yes | `REDUCED_OUTPUT` | NONE, REDUCED_OUTPUT, LINE_STOPPED, PLANT_STOPPED | Default impact | Internal |
| `requires_rca` | BOOLEAN | Yes | `false` | — | RCA mandatory | Internal |
| `requires_safety_review` | BOOLEAN | Yes | `false` | — | Safety review | Internal |
| `applicable_asset_types` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Applicable asset types | Internal |
| `applicable_asset_categories` | UUID[] | No | `ARRAY[]::UUID[]` | — | Asset categories | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Emergency Work Order (542) | One-to-Many | 1:N | WOs with this code |
| Maintenance History (537) | One-to-Many | 1:N | History events |
| Self (543) | Self-reference | N:1 | Parent code |

### 6. Indexes
- UNIQUE (`failure_code`)
- INDEX (`failure_category`, `status`)
- INDEX (`parent_failure_code_id`)
- GIN INDEX (`applicable_asset_types`)

### 7. Security Classification
**Internal**

### 8. Integration Points
- **Reliability Engine** (Q175): Failure pattern analysis
- **Maintenance Execution Engine** (Q174): Failure classification
- **AI/ML Service**: Failure prediction training data

### 9. Sample Data
```json
{
  "failure_code": "MECH-BRG-001", "failure_name": "Bearing Failure",
  "failure_category": "MECHANICAL", "failure_subcategory": "Bearing Failure",
  "description": "Failure of rolling element bearing due to wear, contamination, or lubrication failure",
  "typical_root_causes": ["Lubrication failure", "Contamination", "Overload", "Misalignment"],
  "typical_symptoms": ["Abnormal noise", "Vibration", "Temperature rise", "Grease leak"],
  "typical_repair_time_hours": 4.00, "severity_default": "HIGH",
  "production_impact_default": "LINE_STOPPED", "requires_rca": true,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`FAILURE_CODE_CREATED`, `FAILURE_CODE_UPDATED`, `FAILURE_CODE_INACTIVATED`

---

## Entity 544 — Root Cause Analysis (RCA)

### 1. Business Purpose
Per Part 13 §4: Methods — 5 Why, Fishbone, FMEA, CAPA Link. Structured analysis to prevent recurrence.

### 2. Architectural Role
Quality/improvement entity — formal analysis artifact. Links to CAPA (Corrective and Preventive Action) for closure.

### 3. Business Rules
- Mandatory for: Critical/High severity failures, safety incidents, repeated failures (3+ in 30 days)
- Methods: 5_WHY (iterative questioning), FISHBONE (Ishikawa diagram), FMEA (Failure Mode Effects Analysis), FAULT_TREE, CAPA_LINK
- Multi-disciplinary team: Maintenance + Production + Quality + Engineering
- RCA must identify root cause, not symptom
- CAPA: corrective (immediate) + preventive (systemic) actions
- Closure requires action implementation + effectiveness verification

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `rca_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `breakdown_ticket_id` | UUID | Yes | — | FK to `breakdown_tickets` (Entity 541) | Source | Internal |
| `emergency_work_order_id` | UUID | No | NULL | FK to `emergency_work_orders` (Entity 542) | EWO | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `failure_code_id` | UUID | Yes | — | FK to `failure_codes` (Entity 543) | Failure code | Internal |
| `rca_method` | ENUM | Yes | — | FIVE_WHY, FISHBONE, FMEA, FAULT_TREE, CAPA_LINK, BOW_TIE, MULTI_VARI | Method (per Part 13) | Internal |
| `analysis_lead_id` | UUID | Yes | — | FK to `workforce_master` | Lead analyst | Confidential |
| `team_members` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Team member IDs | Confidential |
| `analysis_start_date` | DATE | Yes | — | — | Start | Internal |
| `analysis_completed_date` | DATE | No | NULL | — | Completion | Internal |
| `problem_statement` | TEXT | Yes | — | Min 50 | Problem | Confidential |
| `timeline_of_events` | JSONB | Yes | `'[]'` | — | Event timeline | Confidential |
| `immediate_cause` | TEXT | Yes | — | Min 20 | Immediate cause | Confidential |
| `contributing_causes` | JSONB | Yes | `'[]'` | — | Contributing factors | Confidential |
| `root_cause` | TEXT | Yes | — | Min 30 | Root cause | Confidential |
| `five_whys_analysis` | JSONB | No | NULL | — | [{ why, answer }] | Confidential |
| `fishbone_categories` | JSONB | No | NULL | — | { people, process, equipment, materials, environment, management } | Confidential |
| `fMEA_worksheet` | JSONB | No | NULL | — | FMEA data | Confidential |
| `corrective_actions` | JSONB | Yes | `'[]'` | — | [{ action, owner, due_date, status }] | Confidential |
| `preventive_actions` | JSONB | Yes | `'[]'` | — | [{ action, owner, due_date, status }] | Confidential |
| `capa_link_id` | UUID | No | NULL | FK to `capa` | CAPA link | Internal |
| `effectiveness_verification_method` | TEXT | No | NULL | — | How to verify | Internal |
| `effectiveness_verification_date` | DATE | No | NULL | — | Verification date | Internal |
| `effectiveness_verified` | BOOLEAN | Yes | `false` | — | Verified | Internal |
| `effectiveness_verified_by` | UUID | No | NULL | FK to `workforce_master` | Verifier | Confidential |
| `lessons_learned` | TEXT | No | NULL | — | Lessons | Confidential |
| `knowledge_base_article_id` | UUID | No | NULL | FK to `kb_articles` | KB article | Internal |
| `attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Photos/docs | Confidential |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `status` | ENUM | Yes | `OPEN` | OPEN, IN_ANALYSIS, ACTIONS_PENDING, ACTIONS_COMPLETED, VERIFIED, CLOSED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Breakdown Ticket (541) | Many-to-One | N:1 | Source |
| Failure Code (543) | Many-to-One | N:1 | Failure |
| CAPA | One-to-One | 1:1 | Linked CAPA |
| Knowledge Base | One-to-One | 1:1 | KB article |

### 6. Indexes
- UNIQUE (`rca_code`)
- INDEX (`breakdown_ticket_id`)
- INDEX (`asset_id`, `analysis_start_date`)
- INDEX (`failure_code_id`, `status`)
- INDEX (`status`)

### 7. Security Classification
**Confidential** — analysis findings and root causes.

### 8. Integration Points
- **Quality QMS** (Part 8): CAPA integration
- **Reliability Engine** (Q175): Failure pattern data
- **Knowledge Base**: Lessons learned
- **Maintenance Execution Engine** (Q174): PM plan updates from RCA

### 9. Sample Data
```json
{
  "rca_code": "RCA-2026-00045", "breakdown_ticket_id": "bt-001",
  "asset_id": "asset-001", "failure_code_id": "fc-001",
  "rca_method": "FIVE_WHY",
  "problem_statement": "Mixer Line 1 main drive motor bearing failed causing 4-hour production stoppage",
  "immediate_cause": "Bearing inner race fracture due to fatigue",
  "root_cause": "Lubrication interval extended beyond OEM spec due to undocumented schedule change",
  "corrective_actions": [{ "action": "Replace bearing", "owner": "wf-tech-001", "status": "COMPLETED" }],
  "preventive_actions": [{ "action": "Update PM plan to OEM lubrication interval", "owner": "wf-eng-001", "due_date": "2026-07-15", "status": "IN_PROGRESS" }],
  "status": "ACTIONS_PENDING"
}
```

### 10. Audit Events
`RCA_INITIATED`, `RCA_ANALYSIS_COMPLETED`, `RCA_ACTIONS_ASSIGNED`, `RCA_ACTIONS_COMPLETED`, `RCA_EFFECTIVENESS_VERIFIED`, `RCA_CLOSED`

---

## Entity 545 — Downtime Register

### 1. Business Purpose
Per Part 13 §4: Stores Start Time, End Time, Duration, Production Loss, Downtime Cost. Authoritative downtime ledger.

### 2. Architectural Role
**Ledger-style entity** — every asset downtime event creates an immutable record. Source of truth for OEE, availability, and cost analytics.

### 3. Business Rules
- Downtime types: BREAKDOWN, MAINTENANCE (PM), CHANGEOVER, SETUP, LACK_OF_INPUT, LACK_OF_OPERATOR, QUALITY_HOLD, UTILITY_FAILURE, SCHEDULED_IDLE
- Duration = end_time − start_time
- Production loss = (theoretical_output_per_hour) × (duration_hours) × (utilization_factor)
- Downtime cost = production_loss_value + labor_cost + opportunity_cost
- Only planned maintenance can be excluded from OEE calculation
- All entries append-only (corrected via new entry with reference)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `downtime_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `asset_criticality` | ENUM | Yes | — | CRITICAL, HIGH, MEDIUM, LOW | Criticality | Internal |
| `downtime_type` | ENUM | Yes | — | BREAKDOWN, MAINTENANCE, CHANGEOVER, SETUP, LACK_OF_INPUT, LACK_OF_OPERATOR, QUALITY_HOLD, UTILITY_FAILURE, SCHEDULED_IDLE, EXTERNAL_POWER | Type | Internal |
| `downtime_category` | ENUM | Yes | — | EQUIPMENT, OPERATIONAL, EXTERNAL, SCHEDULED | Category | Internal |
| `breakdown_ticket_id` | UUID | No | NULL | FK to `breakdown_tickets` (Entity 541) | Source (if breakdown) | Internal |
| `work_order_id` | UUID | No | NULL | FK to `work_orders` (Entity 533) | Linked WO | Internal |
| `production_line_id` | UUID | No | NULL | FK to `production_lines` | Affected line | Internal |
| `start_time` | TIMESTAMPTZ | Yes | — | — | Start Time (per Part 13) | Internal |
| `end_time` | TIMESTAMPTZ | No | NULL | > start_time | End Time (per Part 13) | Internal |
| `duration_minutes` | INTEGER | Yes | `0` | ≥ 0 | Duration in minutes | Internal |
| `duration_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Duration (per Part 13) in hours | Internal |
| `is_partial_downtime` | BOOLEAN | Yes | `false` | — | Partial (reduced speed) | Internal |
| `capacity_utilization_pct` | DECIMAL(5,2) | No | NULL | 0-100 | % capacity during partial | Internal |
| `theoretical_output_per_hour` | DECIMAL(15,2) | Yes | `0` | ≥ 0 | Theoretical output | Internal |
| `actual_output_during_downtime` | DECIMAL(15,2) | Yes | `0` | ≥ 0 | Actual output | Internal |
| `production_loss_units` | DECIMAL(15,2) | Yes | `0` | ≥ 0 | Lost units | Confidential |
| `production_loss_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Production Loss (per Part 13) | Confidential |
| `labor_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Maintenance labor | Confidential |
| `spares_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Spares | Confidential |
| `opportunity_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Opportunity cost | Confidential |
| `total_downtime_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Downtime Cost (per Part 13) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `reason` | TEXT | Yes | — | Min 10 | Reason | Confidential |
| `root_cause_id` | UUID | No | NULL | FK to `rca` (Entity 544) | RCA | Confidential |
| `affects_oee` | BOOLEAN | Yes | `true` | — | Included in OEE | Internal |
| `oee_exclusion_reason` | TEXT | No | NULL | — | If excluded | Internal |
| `shift_id` | UUID | No | NULL | FK to `shift_master` (Entity 433) | Shift | Internal |
| `production_order_id` | UUID | No | NULL | FK to `production_orders` | Affected order | Internal |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Cost posting | Confidential |
| `verified_by_production` | UUID | No | NULL | FK to `workforce_master` | Prod verify | Confidential |
| `verified_by_maintenance` | UUID | No | NULL | FK to `workforce_master` | Maint verify | Confidential |
| `status` | ENUM | Yes | `OPEN` | OPEN, IN_PROGRESS, RESOLVED, CLOSED, DISPUTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-One | N:1 | Asset |
| Breakdown Ticket (541) | Many-to-One | N:1 | Source |
| Work Order (533) | Many-to-One | N:1 | Linked WO |
| Production Line | Many-to-One | N:1 | Affected line |
| RCA (544) | One-to-One | 1:1 | RCA |

### 6. Indexes
- UNIQUE (`downtime_code`)
- INDEX (`asset_id`, `start_time`)
- INDEX (`downtime_type`, `start_time`)
- INDEX (`production_line_id`, `start_time`)
- INDEX (`affects_oee`, `start_time`)
- INDEX (`status`)

### 7. Security Classification
**Confidential** — cost data is **Restricted**.

### 8. Integration Points
- **Manufacturing MES** (Part 7): OEE calculation
- **Reliability Engine** (Q175): Availability metric
- **Finance** (Part 11): Cost posting
- **Accounting Event Engine**: Journal entry
- **BI Service**: Downtime analytics

### 9. Sample Data
```json
{
  "downtime_code": "DT-2026-01234", "asset_id": "asset-001",
  "asset_criticality": "HIGH", "downtime_type": "BREAKDOWN",
  "downtime_category": "EQUIPMENT", "breakdown_ticket_id": "bt-001",
  "start_time": "2026-07-08T10:15:00Z", "end_time": "2026-07-08T14:45:00Z",
  "duration_minutes": 270, "duration_hours": 4.50,
  "theoretical_output_per_hour": 500.00, "actual_output_during_downtime": 0,
  "production_loss_units": 2250.00, "production_loss_value": 112500.0000,
  "labor_cost": 5000.0000, "spares_cost": 8500.0000,
  "total_downtime_cost": 126000.0000, "affects_oee": true,
  "status": "CLOSED"
}
```

### 10. Audit Events
`DOWNTIME_REGISTERED`, `DOWNTIME_RESOLVED`, `DOWNTIME_CLOSED`, `DOWNTIME_DISPUTED`, `DOWNTIME_COST_POSTED`

---

## Entity 546 — Technician Dispatch

### 1. Business Purpose
Per Part 13 §4: Stores Technician, ETA, Response Time, Travel Time, Completion Time. Technician dispatch tracking.

### 2. Architectural Role
Dispatch entity — tracks technician journey from assignment to completion. Used for response time analytics.

### 3. Business Rules
- Dispatch types: ON_SITE (tech travels to asset), REMOTE (phone/video support), VENDOR (external)
- ETA based on: distance, shift, current workload, traffic
- Response time = arrived_at − dispatched_at
- Multi-technician dispatch for complex jobs
- Auto-dispatch for Critical priority (closest qualified tech)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `dispatch_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `work_order_id` | UUID | Yes | — | FK to `work_orders` (Entity 533) | WO | Internal |
| `breakdown_ticket_id` | UUID | No | NULL | FK to `breakdown_tickets` (Entity 541) | Ticket | Internal |
| `technician_id` | UUID | Yes | — | FK to `workforce_master` | Technician (per Part 13) | Confidential |
| `technician_role` | ENUM | Yes | `PRIMARY` | PRIMARY, SECONDARY, SUPERVISOR, VENDOR | Role | Internal |
| `dispatch_type` | ENUM | Yes | `ON_SITE` | ON_SITE, REMOTE, VENDOR, ESCALATION | Type | Internal |
| `dispatch_method` | ENUM | Yes | — | MANUAL, AUTO_DISPATCH, AI_RECOMMENDATION, ESCALATION | Method | Internal |
| `dispatched_at` | TIMESTAMPTZ | Yes | `now()` | — | Dispatch time | Internal |
| `acknowledged_at` | TIMESTAMPTZ | No | NULL | — | Tech acknowledge | Internal |
| `started_travel_at` | TIMESTAMPTZ | No | NULL | — | Travel start | Internal |
| `arrived_at` | TIMESTAMPTZ | No | NULL | — | Arrival (per Part 13: "Response Time") | Internal |
| `work_started_at` | TIMESTAMPTZ | No | NULL | — | Work start | Internal |
| `work_completed_at` | TIMESTAMPTZ | No | NULL | — | Completion (per Part 13) | Internal |
| `returned_at` | TIMESTAMPTZ | No | NULL | — | Return to base | Internal |
| `eta_minutes` | INTEGER | Yes | — | > 0 | ETA (per Part 13) | Internal |
| `actual_response_time_minutes` | INTEGER | No | NULL | ≥ 0 | Response time | Internal |
| `travel_time_minutes` | INTEGER | No | NULL | ≥ 0 | Travel Time (per Part 13) | Internal |
| `work_time_minutes` | INTEGER | No | NULL | ≥ 0 | Work time | Internal |
| `total_time_minutes` | INTEGER | No | NULL | ≥ 0 | Total time | Internal |
| `dispatch_location_lat` | DECIMAL(10,7) | No | NULL | — | Tech start location | Confidential |
| `dispatch_location_lon` | DECIMAL(10,7) | No | NULL | — | Tech start location | Confidential |
| `asset_location_lat` | DECIMAL(10,7) | No | NULL | — | Asset location | Confidential |
| `asset_location_lon` | DECIMAL(10,7) | No | NULL | — | Asset location | Confidential |
| `distance_km` | DECIMAL(7,2) | No | NULL | ≥ 0 | Distance | Internal |
| `sla_response_target_minutes` | INTEGER | Yes | — | > 0 | SLA target | Internal |
| `sla_breached` | BOOLEAN | Yes | `false` | — | Breach | Internal |
| `dispatch_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `rejection_reason` | TEXT | No | NULL | — | If rejected | Confidential |
| `reassigned_to` | UUID | No | NULL | FK to `workforce_master` | Reassigned | Confidential |
| `reassignment_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `status` | ENUM | Yes | `DISPATCHED` | DISPATCHED, ACKNOWLEDGED, EN_ROUTE, ARRIVED, WORKING, COMPLETED, REJECTED, REASSIGNED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Work Order (533) | Many-to-One | N:1 | WO |
| Breakdown Ticket (541) | Many-to-One | N:1 | Ticket |
| Workforce Master (381) | Many-to-One | N:1 | Technician |

### 6. Indexes
- UNIQUE (`dispatch_code`)
- INDEX (`work_order_id`, `status`)
- INDEX (`technician_id`, `dispatched_at`)
- INDEX (`status`, `dispatched_at`)

### 7. Security Classification
**Confidential** — location data is sensitive.

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): Dispatch orchestration
- **HR** (Part 12): Technician availability
- **Mobile App**: Tech dispatch & status
- **Notification Service**: Tech alerts
- **Maps Service**: Route optimization

### 9. Sample Data
```json
{
  "dispatch_code": "DSP-2026-00345", "work_order_id": "wo-001",
  "breakdown_ticket_id": "bt-001", "technician_id": "wf-tech-001",
  "technician_role": "PRIMARY", "dispatch_type": "ON_SITE",
  "dispatch_method": "AI_RECOMMENDATION",
  "dispatched_at": "2026-07-08T10:20:00Z", "acknowledged_at": "2026-07-08T10:22:00Z",
  "arrived_at": "2026-07-08T10:45:00Z", "eta_minutes": 30,
  "actual_response_time_minutes": 25, "travel_time_minutes": 23,
  "sla_response_target_minutes": 60, "sla_breached": false,
  "status": "ARRIVED"
}
```

### 10. Audit Events
`TECH_DISPATCHED`, `TECH_ACKNOWLEDGED`, `TECH_EN_ROUTE`, `TECH_ARRIVED`, `TECH_WORKING`, `TECH_COMPLETED`, `TECH_REJECTED`, `TECH_REASSIGNED`

---

## Entity 547 — Lockout / Tagout (LOTO)

### 1. Business Purpose
Per Part 13 §4: Supports Energy Isolation, Electrical Lock, Mechanical Lock, Safety Verification, Release Authorization. Critical safety procedure.

### 2. Architectural Role
Safety compliance entity — mandatory before any maintenance on energized equipment. Legal compliance requirement (OSHA-equivalent in India: Factory Act).

### 3. Business Rules
- LOTO mandatory for: any maintenance on energized equipment, electrical work, confined space, high-voltage
- Energy types: ELECTRICAL, MECHANICAL, HYDRAULIC, PNEUMATIC, THERMAL, CHEMICAL, GRAVITY, STORED_ENERGY
- Multi-energy isolation: each energy source isolated separately
- Authorized personnel only: LOTO Certified (per HR Skills Matrix E473)
- Verification: try-start test before work begins
- Release: only by person who applied lock (or supervisor with documented reason)
- Group LOTO: for multi-person work crews

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `loto_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `work_order_id` | UUID | Yes | — | FK to `work_orders` (Entity 533) | WO | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `loto_type` | ENUM | Yes | — | ELECTRICAL_LOCK, MECHANICAL_LOCK, GROUP_LOTO, MULTI_ENERGY | Type (per Part 13) | Internal |
| `energy_sources` | JSONB | Yes | `'[]'` | — | [{ source_type, isolation_point, lock_id, tag_id }] | Confidential |
| `energy_types_isolated` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | ELECTRICAL, MECHANICAL, HYDRAULIC, PNEUMATIC, THERMAL, CHEMICAL, GRAVITY, STORED_ENERGY | Energy types | Internal |
| `authorized_person_id` | UUID | Yes | — | FK to `workforce_master` | Authorized (per Part 13) | Confidential |
| `authorized_person_certification` | VARCHAR(50) | Yes | — | — | Cert number | Confidential |
| `applied_by` | UUID | Yes | — | FK to `workforce_master` | Applied by | Confidential |
| `applied_at` | TIMESTAMPTZ | Yes | `now()` | — | Application time | Internal |
| `application_verified_by` | UUID | Yes | — | FK to `workforce_master` | Verifier (per Part 13: "Safety Verification") | Confidential |
| `verification_method` | ENUM | Yes | `TRY_START` | TRY_START, VOLTAGE_TEST, VISUAL_INSPECTION, MULTI_METHOD | Method | Internal |
| `verification_result` | ENUM | Yes | `VERIFIED` | VERIFIED, FAILED, RETEST_REQUIRED | Result | Internal |
| `verification_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `group_members` | UUID[] | No | `ARRAY[]::UUID[]` | — | Group LOTO members | Confidential |
| `individual_locks` | JSONB | Yes | `'[]'` | — | [{ member_id, lock_id, tag_id }] | Confidential |
| `work_duration_estimate_hours` | DECIMAL(5,2) | Yes | — | > 0 | Estimated | Internal |
| `actual_work_duration_hours` | DECIMAL(7,2) | No | NULL | ≥ 0 | Actual | Internal |
| `extension_count` | INTEGER | Yes | `0` | ≥ 0 | Extensions | Internal |
| `extension_reason` | TEXT | No | NULL | — | Last reason | Confidential |
| `release_authorized_by` | UUID | Yes | — | FK to `workforce_master` | Release auth (per Part 13) | Confidential |
| `release_authorized_at` | TIMESTAMPTZ | No | NULL | — | Auth time | Internal |
| `released_by` | UUID | No | NULL | FK to `workforce_master` | Released by | Confidential |
| `released_at` | TIMESTAMPTZ | No | NULL | — | Release time | Internal |
| `release_verification_done` | BOOLEAN | Yes | `false` | — | Post-release verify | Internal |
| `release_verification_by` | UUID | No | NULL | FK to `workforce_master` | Verifier | Confidential |
| `release_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `safety_incident_occurred` | BOOLEAN | Yes | `false` | — | Incident | Confidential |
| `incident_report_id` | UUID | No | NULL | FK to `incident_reports` (Entity 548) | Incident | Confidential |
| `attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Photos | Confidential |
| `status` | ENUM | Yes | `APPLIED` | REQUESTED, APPLIED, VERIFIED, ACTIVE, EXTENDED, RELEASE_AUTHORIZED, RELEASED, CANCELLED, VIOLATION | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Work Order (533) | Many-to-One | N:1 | WO |
| Asset Master (511) | Many-to-One | N:1 | Asset |
| Workforce Master (381) | Many-to-One | N:1 | Authorized person |
| Incident Report (548) | One-to-One | 1:1 | If incident |

### 6. Indexes
- UNIQUE (`loto_code`)
- INDEX (`work_order_id`, `status`)
- INDEX (`asset_id`, `applied_at`)
- INDEX (`authorized_person_id`, `status`)
- INDEX (`status`, `applied_at`)

### 7. Security Classification
**Confidential** — safety-critical data; violations are **Restricted**.

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): WO prerequisite
- **HR** (Part 12): LOTO certification verification
- **Safety/Compliance Service**: Regulatory reporting
- **Notification Service**: LOTO expiry alerts
- **Manufacturing MES** (Part 7): Asset cannot start while LOTO active

### 9. Sample Data
```json
{
  "loto_code": "LOTO-2026-00123", "work_order_id": "wo-001",
  "asset_id": "asset-001", "loto_type": "MULTI_ENERGY",
  "energy_sources": [
    { "source_type": "ELECTRICAL", "isolation_point": "Main breaker panel", "lock_id": "L-001", "tag_id": "T-001" },
    { "source_type": "MECHANICAL", "isolation_point": "Drive coupling", "lock_id": "L-002", "tag_id": "T-002" }
  ],
  "authorized_person_id": "wf-tech-001", "applied_by": "wf-tech-001",
  "applied_at": "2026-07-08T10:50:00Z",
  "verification_method": "TRY_START", "verification_result": "VERIFIED",
  "work_duration_estimate_hours": 4.00, "status": "ACTIVE"
}
```

### 10. Audit Events
`LOTO_REQUESTED`, `LOTO_APPLIED`, `LOTO_VERIFIED`, `LOTO_EXTENDED`, `LOTO_RELEASE_AUTHORIZED`, `LOTO_RELEASED`, `LOTO_VIOLATION_DETECTED`

---

## Entity 548 — Incident Report

### 1. Business Purpose
Per Part 13 §4: Stores Incident, Injury, Safety, Near Miss, Equipment Damage. Safety incident reporting.

### 2. Architectural Role
Compliance entity — formal incident report for safety, regulatory, and insurance purposes. Mandatory per Factory Act.

### 3. Business Rules
- Incident types: INJURY (worker injured), SAFETY (safety violation), NEAR_MISS (no injury but could have), EQUIPMENT_DAMAGE (asset damaged), ENVIRONMENTAL (spill, emission), FIRE, SECURITY
- Severity: FATAL, MAJOR (lost time injury), MINOR (first aid), NEAR_MISS
- Mandatory reporting: 24 hours for Major, immediate for Fatal
- Regulatory: Form 16 (Factory Act) for major injuries in India
- Investigation: mandatory for Major/Fatal; RCA required
- Insurance: notify insurance for property damage > threshold

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `incident_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `incident_type` | ENUM | Yes | — | INJURY, SAFETY, NEAR_MISS, EQUIPMENT_DAMAGE, ENVIRONMENTAL, FIRE, SECURITY | Type (per Part 13) | Confidential |
| `severity` | ENUM | Yes | — | FATAL, MAJOR, MINOR, NEAR_MISS | Severity | Restricted |
| `asset_id` | UUID | No | NULL | FK to `asset_master` (Entity 511) | Asset (if any) | Internal |
| `work_order_id` | UUID | No | NULL | FK to `work_orders` (Entity 533) | Linked WO | Internal |
| `loto_id` | UUID | No | NULL | FK to `loto` (Entity 547) | LOTO (if any) | Confidential |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Facility | Internal |
| `location_details` | TEXT | Yes | — | Min 10 | Specific location | Internal |
| `incident_date` | DATE | Yes | — | — | Incident date | Internal |
| `incident_time` | TIMESTAMPTZ | Yes | — | — | Incident time | Internal |
| `reported_by` | UUID | Yes | — | FK to `workforce_master` | Reporter | Confidential |
| `reported_at` | TIMESTAMPTZ | Yes | `now()` | — | Report time | Internal |
| `description` | TEXT | Yes | — | Min 50 | Description | Confidential |
| `immediate_actions_taken` | TEXT | Yes | — | Min 20 | Immediate actions | Confidential |
| `persons_involved` | JSONB | Yes | `'[]'` | — | [{ person_id, role, injury_severity }] | Restricted |
| `injuries_count` | INTEGER | Yes | `0` | ≥ 0 | Injuries | Restricted |
| `fatalities_count` | INTEGER | Yes | `0` | ≥ 0 | Fatalities | Restricted |
| `first_aid_rendered` | BOOLEAN | Yes | `false` | — | First aid | Internal |
| `medical_treatment_required` | BOOLEAN | Yes | `false` | — | Medical | Internal |
| `hospitalization_required` | BOOLEAN | Yes | `false` | — | Hospital | Internal |
| `lost_time_injury` | BOOLEAN | Yes | `false` | — | LTI | Internal |
| `lost_time_days` | INTEGER | Yes | `0` | ≥ 0 | LTI days | Internal |
| `property_damage_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Damage value | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `environmental_impact` | ENUM | Yes | `NONE` | NONE, MINOR, MODERATE, SIGNIFICANT, MAJOR | Env impact | Internal |
| `regulatory_reportable` | BOOLEAN | Yes | `false` | — | Regulatory | Internal |
| `regulatory_report_submitted` | BOOLEAN | Yes | `false` | — | Submitted | Internal |
| `regulatory_report_reference` | VARCHAR(100) | No | NULL | — | Reference | Confidential |
| `regulatory_submission_date` | DATE | No | NULL | — | Submission date | Internal |
| `insurance_claim_required` | BOOLEAN | Yes | `false` | — | Insurance | Internal |
| `insurance_claim_id` | UUID | No | NULL | FK to `insurance_claims` | Claim | Confidential |
| `root_cause_analysis_id` | UUID | No | NULL | FK to `rca` (Entity 544) | RCA | Confidential |
| `corrective_actions` | JSONB | Yes | `'[]'` | — | Actions | Confidential |
| `preventive_actions` | JSONB | Yes | `'[]'` | — | Preventive | Confidential |
| `investigation_lead_id` | UUID | No | NULL | FK to `workforce_master` | Investigator | Confidential |
| `investigation_started_at` | TIMESTAMPTZ | No | NULL | — | Start | Internal |
| `investigation_completed_at` | TIMESTAMPTZ | No | NULL | — | Completion | Internal |
| `photos_attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Photos | Confidential |
| `witness_statements` | JSONB | No | NULL | — | Witness statements | Restricted |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `status` | ENUM | Yes | `REPORTED` | REPORTED, UNDER_INVESTIGATION, RCA_PENDING, ACTIONS_PENDING, ACTIONS_COMPLETED, CLOSED, ESCALATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-One | N:1 | Asset |
| Work Order (533) | Many-to-One | N:1 | WO |
| LOTO (547) | Many-to-One | N:1 | LOTO |
| RCA (544) | One-to-One | 1:1 | RCA |
| Insurance Claim | One-to-One | 1:1 | Claim |

### 6. Indexes
- UNIQUE (`incident_code`)
- INDEX (`incident_type`, `severity`, `incident_date`)
- INDEX (`facility_id`, `incident_date`)
- INDEX (`regulatory_reportable`, `regulatory_report_submitted`)
- INDEX (`status`)

### 7. Security Classification
**Restricted** — personnel injury data is highly sensitive.

### 8. Integration Points
- **Safety/Compliance Service**: Regulatory reporting
- **HR** (Part 12): Worker injury records
- **Insurance Service**: Claim processing
- **Quality QMS** (Part 8): CAPA integration
- **Reliability Engine** (Q175): Safety failure patterns
- **Notification Service**: Management escalation

### 9. Sample Data
```json
{
  "incident_code": "INC-2026-00034", "incident_type": "INJURY",
  "severity": "MINOR", "asset_id": "asset-001", "facility_id": "fac-mum",
  "location_details": "Line 1 — Mixer area, ground floor",
  "incident_date": "2026-07-08", "incident_time": "2026-07-08T11:30:00Z",
  "reported_by": "wf-mgr-001", "reported_at": "2026-07-08T11:45:00Z",
  "description": "Operator sustained minor hand abrasion while cleaning mixer during maintenance",
  "immediate_actions_taken": "First aid administered on-site; operator returned to light duty",
  "injuries_count": 1, "first_aid_rendered": true, "medical_treatment_required": false,
  "lost_time_injury": false, "regulatory_reportable": false,
  "status": "UNDER_INVESTIGATION"
}
```

### 10. Audit Events
`INCIDENT_REPORTED`, `INCIDENT_INVESTIGATION_STARTED`, `INCIDENT_INVESTIGATION_COMPLETED`, `INCIDENT_RCA_INITIATED`, `INCIDENT_REGULATORY_REPORTED`, `INCIDENT_INSURANCE_CLAIMED`, `INCIDENT_CLOSED`

---

## Entity 549 — Breakdown Cost

### 1. Business Purpose
Per Part 13 §4: Calculates Labor, Parts, Downtime, External Vendor, Utilities, Total Cost. Comprehensive breakdown cost aggregation.

### 2. Architectural Role
Cost aggregation entity — links all cost components for breakdown events. Feeds Finance and reliability analytics.

### 3. Business Rules
- Cost components: LABOR (technician time), PARTS (spares consumed), DOWNTIME (production loss), EXTERNAL_VENDOR (vendor charges), UTILITIES (utility waste during downtime), OVERHEAD (allocations)
- Total = sum of all components
- Cost allocation: to asset's cost center (per Asset Ownership E514)
- Insurance claim: if applicable, reduces net cost
- Warrantied repairs: cost recovered from vendor

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `cost_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `breakdown_ticket_id` | UUID | Yes | — | FK to `breakdown_tickets` (Entity 541) | Source | Internal |
| `emergency_work_order_id` | UUID | No | NULL | FK to `emergency_work_orders` (Entity 542) | EWO | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `downtime_register_id` | UUID | No | NULL | FK to `downtime_register` (Entity 545) | Downtime | Internal |
| `labor_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Labor (per Part 13) | Confidential |
| `labor_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Hours | Internal |
| `labor_rate_per_hour` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Rate | Confidential |
| `parts_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Parts (per Part 13) | Confidential |
| `parts_detail` | JSONB | Yes | `'[]'` | — | [{ part_id, qty, unit_cost, total }] | Confidential |
| `downtime_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Downtime (per Part 13) | Confidential |
| `downtime_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Hours | Internal |
| `production_loss_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Production loss | Confidential |
| `external_vendor_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | External Vendor (per Part 13) | Confidential |
| `vendor_id` | UUID | No | NULL | FK to `vendors` | Vendor | Internal |
| `vendor_invoice_reference` | VARCHAR(50) | No | NULL | — | Invoice ref | Confidential |
| `utilities_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Utilities (per Part 13) | Confidential |
| `utilities_detail` | JSONB | Yes | `'[]'` | — | [{ utility_type, qty, cost }] | Confidential |
| `overhead_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Overhead allocation | Confidential |
| `total_gross_cost` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total before recovery | Confidential |
| `insurance_recovery` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Insurance claim | Confidential |
| `warranty_recovery` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Warranty claim | Confidential |
| `vendor_recovery` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Vendor chargeback | Confidential |
| `total_recoveries` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total recoveries | Confidential |
| `net_cost` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total Cost (per Part 13) — net | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `cost_center_id` | UUID | Yes | — | FK to `cost_centers` | Cost center | Confidential |
| `gl_account_code` | VARCHAR(30) | Yes | — | FK to `gl_accounts` | GL account | Confidential |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Posting | Confidential |
| `posted_at` | TIMESTAMPTZ | No | NULL | — | Posting time | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, CALCULATED, POSTED, ADJUSTED, REVERSED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Breakdown Ticket (541) | One-to-One | 1:1 | Source |
| Asset Master (511) | Many-to-One | N:1 | Asset |
| Downtime Register (545) | One-to-One | 1:1 | Downtime |
| Vendor (Part 5) | Many-to-One | N:1 | External vendor |
| Accounting Event | One-to-One | 1:1 | GL posting |

### 6. Indexes
- UNIQUE (`cost_code`)
- INDEX (`breakdown_ticket_id`)
- INDEX (`asset_id`, `posted_at`)
- INDEX (`cost_center_id`, `gl_account_code`)

### 7. Security Classification
**Confidential** — financial data; recoveries are **Restricted**.

### 8. Integration Points
- **Accounting Event Engine** (Part 11): GL posting
- **Finance** (Part 11): Cost analytics
- **Procurement** (Part 5): Vendor charges
- **Insurance Service**: Claim recovery
- **Reliability Engine** (Q175): Cost per operating hour

### 9. Sample Data
```json
{
  "cost_code": "BC-2026-00123", "breakdown_ticket_id": "bt-001",
  "asset_id": "asset-001", "labor_cost": 1750.0000, "labor_hours": 3.50,
  "labor_rate_per_hour": 500.0000, "parts_cost": 8500.0000,
  "downtime_cost": 126000.0000, "downtime_hours": 4.50,
  "production_loss_value": 112500.0000, "external_vendor_cost": 0,
  "utilities_cost": 500.0000, "overhead_cost": 1500.0000,
  "total_gross_cost": 138250.0000, "warranty_recovery": 8500.0000,
  "total_recoveries": 8500.0000, "net_cost": 129750.0000,
  "cost_center_id": "cc-mfg-mum-001", "status": "POSTED"
}
```

### 10. Audit Events
`BREAKDOWN_COST_CALCULATED`, `BREAKDOWN_COST_POSTED`, `BREAKDOWN_COST_ADJUSTED`, `BREAKDOWN_COST_REVERSED`, `BREAKDOWN_COST_RECOVERED`

---

## Entity 550 — Breakdown Dashboard

### 1. Business Purpose
Per Part 13 §4: Displays Open Breakdowns, Critical Machines, Downtime, SLA, Technician Status, MTTR. AI: Failure Pattern, Downtime Prediction, Priority Recommendation, Technician Recommendation.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | FACILITY, COMPANY | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `open_breakdowns_count` | INTEGER | Yes | `0` | ≥ 0 | Open Breakdowns (per Part 13) | Internal |
| `open_breakdowns_by_severity` | JSONB | Yes | `'{}'` | — | { CRITICAL, HIGH, MEDIUM, LOW } | Internal |
| `critical_machines_down_count` | INTEGER | Yes | `0` | ≥ 0 | Critical Machines (per Part 13) | Internal |
| `critical_machines_list` | JSONB | Yes | `'[]'` | — | Down critical machines | Confidential |
| `downtime_hours_today` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Downtime today (per Part 13) | Internal |
| `downtime_hours_mtd` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Downtime MTD | Internal |
| `downtime_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Downtime cost | Confidential |
| `sla_compliance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | SLA (per Part 13) | Internal |
| `sla_breached_count` | INTEGER | Yes | `0` | ≥ 0 | SLA breaches | Internal |
| `technician_status` | JSONB | Yes | `'[]'` | — | Per-technician status (per Part 13) | Confidential |
| `technicians_available_count` | INTEGER | Yes | `0` | ≥ 0 | Available | Internal |
| `technicians_busy_count` | INTEGER | Yes | `0` | ≥ 0 | Busy | Internal |
| `mtbf_hours` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Mean time between failures | Confidential |
| `mttr_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | MTTR (per Part 13) | Confidential |
| `availability_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Asset availability | Internal |
| `breakdown_trend_30d` | JSONB | Yes | `'[]'` | — | 30-day trend | Internal |
| `failure_pattern_analysis` | JSONB | No | NULL | — | AI: Failure Pattern (per Part 13 AI) | Restricted |
| `downtime_prediction` | JSONB | No | NULL | — | AI: Downtime Prediction (per Part 13 AI) | Restricted |
| `priority_recommendation` | JSONB | No | NULL | — | AI: Priority Recommendation (per Part 13 AI) | Confidential |
| `technician_recommendation` | JSONB | No | NULL | — | AI: Technician Recommendation (per Part 13 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 5: Spare Parts Inventory & Maintenance Stores (Entities 551-560)

## Entity 551 — Spare Part Master

### 1. Business Purpose
Per Part 13 §5: Stores Part Code, Name, Manufacturer, OEM Number, Alternative Part, Shelf Life, Criticality. Master record for all spare parts.

### 2. Architectural Role
Master entity — distinct from Product Master (Part 3) which handles finished goods. Spare Part Master focuses on maintenance-specific attributes.

### 3. Business Rules
- Linked to Product Master (Part 3) via product_id — extends with maintenance-specific attributes
- OEM Number critical for direct procurement from OEM
- Alternative parts: interchangeable spares from different manufacturers
- Shelf life: expiry tracking for lubricants, seals, batteries
- Criticality: drives stocking policy (Critical = always in stock)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `spare_part_id` | UUID | Yes | — | FK to `products` (Part 3) | Linked product | Internal |
| `part_code` | VARCHAR(50) | Yes | — | Unique per company | Part Code (per Part 13) | Internal |
| `part_name` | VARCHAR(200) | Yes | — | Min 3 | Name (per Part 13) | Internal |
| `category_id` | UUID | Yes | — | FK to `spare_categories` (Entity 552) | Category | Internal |
| `manufacturer` | VARCHAR(200) | No | NULL | — | Manufacturer (per Part 13) | Internal |
| `manufacturer_part_number` | VARCHAR(100) | No | NULL | — | Mfr part number | Internal |
| `oem_number` | VARCHAR(100) | No | NULL | — | OEM Number (per Part 13) | Internal |
| `alternative_part_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Alternative Part (per Part 13) | Internal |
| `description` | TEXT | Yes | — | Min 20 | Description | Internal |
| `technical_specs` | JSONB | Yes | `'{}'` | — | Specifications | Internal |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | UoM | Internal |
| `shelf_life_months` | INTEGER | No | NULL | > 0 | Shelf Life (per Part 13) | Internal |
| `requires_refrigeration` | BOOLEAN | Yes | `false` | — | Cold storage | Internal |
| `storage_conditions` | JSONB | No | NULL | — | Storage requirements | Internal |
| `hazardous_material` | BOOLEAN | Yes | `false` | — | Hazmat | Confidential |
| `hazard_class` | VARCHAR(50) | No | NULL | — | Hazmat class | Confidential |
| `criticality` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW | Criticality (per Part 13) | Internal |
| `stocking_policy` | ENUM | Yes | `MIN_MAX` | REDUNDANT, MIN_MAX, ON_DEMAND, JIT | Policy | Internal |
| `min_stock_level` | DECIMAL(15,2) | Yes | `0` | ≥ 0 | Min stock | Internal |
| `max_stock_level` | DECIMAL(15,2) | Yes | `0` | ≥ min_stock | Max stock | Internal |
| `reorder_level` | DECIMAL(15,2) | Yes | `0` | ≥ min_stock, ≤ max_stock | Reorder | Internal |
| `reorder_quantity` | DECIMAL(15,2) | Yes | `0` | > 0 | Reorder qty | Internal |
| `lead_time_days` | INTEGER | Yes | `0` | ≥ 0 | Procurement lead | Internal |
| `standard_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Standard cost | Confidential |
| `last_purchase_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Last cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `preferred_vendor_id` | UUID | No | NULL | FK to `vendors` | Preferred vendor | Internal |
| `alternative_vendor_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Alternatives | Internal |
| `image_attachment_id` | UUID | No | NULL | FK to `attachments` | Image | Internal |
| `applicable_asset_categories` | UUID[] | No | `ARRAY[]::UUID[]` | — | Used in asset types | Internal |
| `applicable_asset_groups` | UUID[] | No | `ARRAY[]::UUID[]` | — | Used in asset groups | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, DISCONTINUED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Product (Part 3) | One-to-One | 1:1 | Linked product |
| Spare Category (552) | Many-to-One | N:1 | Category |
| Vendor (Part 5) | Many-to-One | N:1 | Preferred vendor |
| Spare BOM (553) | One-to-Many | 1:N | BOM entries |

### 6. Indexes
- UNIQUE (`part_code`)
- INDEX (`category_id`, `status`)
- INDEX (`oem_number`) WHERE `oem_number IS NOT NULL`
- INDEX (`criticality`, `stocking_policy`)
- GIN INDEX (`applicable_asset_categories`)

### 7. Security Classification
**Confidential** — cost and hazmat data.

### 8. Integration Points
- **Inventory** (Part 4): Stock levels
- **Procurement** (Part 5): Auto-replenishment
- **Maintenance Execution Engine** (Q174): Spares for WOs
- **Warehouse** (Part 6): Storage
- **Finance** (Part 11): Standard cost

### 9. Sample Data
```json
{
  "part_code": "SPR-BRG-6205", "part_name": "Bearings 6205 ZZ",
  "category_id": "scat-bearing", "manufacturer": "SKF",
  "manufacturer_part_number": "6205-2RS", "oem_number": "OEM-MIX-001",
  "unit_of_measure": "PCS", "shelf_life_months": 60,
  "criticality": "CRITICAL", "stocking_policy": "REDUNDANT",
  "min_stock_level": 4.00, "max_stock_level": 20.00,
  "reorder_level": 8.00, "reorder_quantity": 12.00, "lead_time_days": 14,
  "standard_cost": 850.0000, "last_purchase_cost": 875.0000,
  "preferred_vendor_id": "vnd-skf-001", "status": "ACTIVE"
}
```

### 10. Audit Events
`SPARE_PART_CREATED`, `SPARE_PART_UPDATED`, `SPARE_PART_DISCONTINUED`, `SPARE_PART_COST_CHANGED`, `SPARE_PART_VENDOR_CHANGED`

---

## Entity 552 — Spare Category

### 1. Business Purpose
Per Part 13 §5: Examples — Electrical, Mechanical, Bearings, Lubricants, Motors, Belts, Sensors, Tools. Spare part taxonomy.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `category_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `category_name` | VARCHAR(100) | Yes | — | Min 3 | Display name | Internal |
| `parent_category_id` | UUID | No | NULL | FK to `spare_categories` (self) | Parent | Internal |
| `category_type` | ENUM | Yes | — | ELECTRICAL, MECHANICAL, BEARINGS, LUBRICANTS, MOTORS, BELTS, SENSORS, TOOLS, FILTERS, SEALS, GEARBOX, HYDRAULIC, PNEUMATIC, CONSUMABLES, OTHER | Type (per Part 13) | Internal |
| `default_stocking_policy` | ENUM | Yes | `MIN_MAX` | REDUNDANT, MIN_MAX, ON_DEMAND, JIT | Default | Internal |
| `default_criticality` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW | Default | Internal |
| `default_lead_time_days` | INTEGER | Yes | `7` | ≥ 0 | Default | Internal |
| `gl_inventory_account_code` | VARCHAR(30) | No | NULL | FK to `gl_accounts` | Inventory GL | Confidential |
| `gl_expense_account_code` | VARCHAR(30) | No | NULL | FK to `gl_accounts` | Expense GL | Confidential |
| `requires_hazmat_handling` | BOOLEAN | Yes | `false` | — | Hazmat | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `hierarchy_level` | INTEGER | Yes | `1` | ≥ 1 | Level | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 553 — Spare BOM

### 1. Business Purpose
Per Part 13 §5: Maps Machine → Required Spare Parts → Quantity. Bill of Materials for maintenance.

### 2. Architectural Role
BOM entity — distinct from manufacturing BOM (Part 7). Defines maintenance-specific spares per asset.

### 3. Business Rules
- One BOM per asset (or asset category for default)
- BOM items: spare part + quantity + position + criticality
- Variant: BOM may differ by asset configuration
- Used for: planned maintenance spares reservation, emergency spares identification
- Auto-pull: BOM auto-reserves spares when WO created

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `bom_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `bom_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `applicability_type` | ENUM | Yes | — | SINGLE_ASSET, ASSET_CATEGORY, ASSET_GROUP | Scope | Internal |
| `asset_id` | UUID | No | NULL | FK to `asset_master` (Entity 511) | Asset (per Part 13: "Machine") | Internal |
| `asset_category_id` | UUID | No | NULL | FK to `asset_categories` (Entity 512) | Category | Internal |
| `asset_group_id` | UUID | No | NULL | FK to `asset_groups` (Entity 525) | Group | Internal |
| `bom_items` | JSONB | Yes | `'[]'` | — | [{ spare_part_id, part_code, qty, position, criticality, frequency }] | Confidential |
| `total_items_count` | INTEGER | Yes | `0` | ≥ 0 | Items | Internal |
| `critical_items_count` | INTEGER | Yes | `0` | ≥ 0 | Critical | Internal |
| `estimated_full_kit_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Full kit cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `spare_bom` (self) | Previous | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE, SUPERSEDED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-One | N:1 | Asset |
| Spare Part Master (551) | Many-to-Many | N:N | Via bom_items |
| Self (553) | Self-reference | N:1 | Previous version |

### 6. Indexes
- UNIQUE (`bom_code`)
- INDEX (`asset_id`, `is_latest_version`)
- INDEX (`applicability_type`, `status`)

### 7. Security Classification
**Confidential**

### 8. Integration Points
- **Maintenance Execution Engine** (Q174): Auto-reserve spares
- **Inventory** (Part 4): Stock check
- **Procurement** (Part 5): Auto-replenishment
- **Spare Forecast** (E559): Demand source

### 9. Sample Data
```json
{
  "bom_code": "BOM-MIX-001", "bom_name": "Mixer 001 Spare BOM",
  "applicability_type": "SINGLE_ASSET", "asset_id": "asset-001",
  "bom_items": [
    { "spare_part_id": "spr-001", "part_code": "SPR-BRG-6205", "qty": 4, "position": "Motor bearings", "criticality": "CRITICAL", "frequency": "ANNUAL" },
    { "spare_part_id": "spr-002", "part_code": "SPR-OIL-20W50", "qty": 5, "position": "Gearbox oil", "criticality": "HIGH", "frequency": "QUARTERLY" }
  ],
  "total_items_count": 25, "critical_items_count": 8,
  "estimated_full_kit_cost": 45000.0000, "version": "2.0",
  "status": "ACTIVE"
}
```

### 10. Audit Events
`SPARE_BOM_CREATED`, `SPARE_BOM_UPDATED`, `SPARE_BOM_VERSION_PUBLISHED`, `SPARE_BOM_APPROVED`, `SPARE_BOM_SUPERSEDED`

---

## Entity 554 — Maintenance Store

### 1. Business Purpose
Per Part 13 §5: Supports Central Store, Plant Store, Warehouse Store, Service Van. Multi-tier spare parts storage.

### 2. Architectural Role
Location entity — defines spare parts storage locations. Each store has its own inventory and replenishment rules.

### 3. Business Rules
- Store types: CENTRAL (company-wide), PLANT (per facility), WAREHOUSE (raw material warehouse), SERVICE_VAN (mobile tech van)
- Each store has: inventory, replenishment rules, authorized users
- Service van: inventory tracked per technician/vehicle
- Inter-store transfers: documented and cost-tracked
- Cycle count: per-store inventory verification

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `store_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `store_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `store_type` | ENUM | Yes | — | CENTRAL, PLANT, WAREHOUSE, SERVICE_VAN, CONTRACTOR | Type (per Part 13) | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `facility_id` | UUID | No | NULL | FK to `facilities` | Facility | Internal |
| `parent_store_id` | UUID | No | NULL | FK to `maintenance_stores` (self) | Parent store | Internal |
| `store_manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `address` | TEXT | Yes | — | — | Address | Internal |
| `gps_coordinates` | JSONB | No | NULL | — | { lat, lon } (for service van) | Confidential |
| `vehicle_id` | UUID | No | NULL | FK to `asset_master` | Vehicle (if SERVICE_VAN) | Internal |
| `technician_id` | UUID | No | NULL | FK to `workforce_master` | Tech (if SERVICE_VAN) | Confidential |
| `total_skus_count` | INTEGER | Yes | `0` | ≥ 0 | SKUs | Internal |
| `total_inventory_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Inventory value | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `authorized_users` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Authorized | Confidential |
| `replenishment_source_id` | UUID | No | NULL | FK to `maintenance_stores` | Replenishment from | Internal |
| `replenishment_lead_time_days` | INTEGER | Yes | `1` | ≥ 0 | Lead time | Internal |
| `cycle_count_frequency_days` | INTEGER | Yes | `30` | ≥ 1 | Cycle count | Internal |
| `last_cycle_count_date` | DATE | No | NULL | — | Last count | Internal |
| `gl_inventory_account_code` | VARCHAR(30) | No | NULL | FK to `gl_accounts` | Inventory GL | Confidential |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Facility | Many-to-One | N:1 | Facility |
| Self (554) | Self-reference | N:1 | Parent store |
| Asset Master (511) | Many-to-One | N:1 | Vehicle (if service van) |

### 6. Indexes
- UNIQUE (`store_code`)
- INDEX (`store_type`, `status`)
- INDEX (`facility_id`, `store_type`)
- INDEX (`technician_id`) WHERE `store_type = 'SERVICE_VAN'`

### 7. Security Classification
**Confidential** — inventory value and authorized users.

### 8. Integration Points
- **Inventory** (Part 4): Per-store stock levels
- **Warehouse** (Part 6): Storage locations
- **Finance** (Part 11): Inventory valuation
- **Maintenance Execution Engine** (Q174): Spare picking

### 9. Sample Data
```json
{
  "store_code": "MST-MUM-PLT-001", "store_name": "Mumbai Plant Maintenance Store",
  "store_type": "PLANT", "company_id": "cmp-001", "facility_id": "fac-mum",
  "store_manager_id": "wf-mgr-001", "total_skus_count": 450,
  "total_inventory_value": 2500000.0000, "cycle_count_frequency_days": 30,
  "last_cycle_count_date": "2026-06-15", "status": "ACTIVE"
}
```

### 10. Audit Events
`MAINTENANCE_STORE_CREATED`, `MAINTENANCE_STORE_UPDATED`, `MAINTENANCE_STORE_INACTIVATED`, `STORE_CYCLE_COUNT_COMPLETED`

---

## Entity 555 — Spare Reservation

### 1. Business Purpose
Per Part 13 §5: Stores Work Order, Part, Quantity, Reservation Date, Status. Pre-allocation of spares for planned WOs.

### 2. Architectural Role
Reservation entity — locks inventory for upcoming WOs. Prevents stockout during PM execution.

### 3. Business Rules
- Reservation locks stock: cannot be issued to other WOs
- Reservation types: FIRM (locked), SOFT (planned, can be overridden), AUTO (auto-generated from BOM)
- Auto-reservation when WO created from PM plan
- Expiry: reservations expire if WO not started within N days
- Cancellation: releases stock back to available

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `reservation_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `work_order_id` | UUID | Yes | — | FK to `work_orders` (Entity 533) | WO (per Part 13) | Internal |
| `spare_part_id` | UUID | Yes | — | FK to `spare_part_master` (Entity 551) | Part (per Part 13) | Internal |
| `store_id` | UUID | Yes | — | FK to `maintenance_stores` (Entity 554) | Store | Internal |
| `quantity_reserved` | DECIMAL(15,2) | Yes | — | > 0 | Qty (per Part 13) | Internal |
| `quantity_issued` | DECIMAL(15,2) | Yes | `0` | ≥ 0, ≤ quantity_reserved | Issued | Internal |
| `quantity_cancelled` | DECIMAL(15,2) | Yes | `0` | ≥ 0 | Cancelled | Internal |
| `reservation_type` | ENUM | Yes | `FIRM` | FIRM, SOFT, AUTO | Type | Internal |
| `reservation_date` | DATE | Yes | — | — | Reservation Date (per Part 13) | Internal |
| `required_date` | DATE | Yes | — | ≥ reservation_date | Required by | Internal |
| `expiry_date` | DATE | No | NULL | > required_date | Auto-release | Internal |
| `reserved_by` | UUID | Yes | — | FK to `workforce_master` | Reserved by | Confidential |
| `reserved_at` | TIMESTAMPTZ | Yes | `now()` | — | Time | Internal |
| `inventory_batch_id` | UUID | No | NULL | FK to `inventory_batches` | Specific batch | Internal |
| `bin_location_id` | UUID | No | NULL | FK to `bin_locations` | Bin | Internal |
| `reservation_source` | ENUM | Yes | — | MANUAL, AUTO_BOM, PM_PLAN, EMERGENCY_OVERRIDE | Source | Internal |
| `cancellation_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `cancelled_by` | UUID | No | NULL | FK to `workforce_master` | Cancelled by | Confidential |
| `cancelled_at` | TIMESTAMPTZ | No | NULL | — | Time | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, PARTIALLY_ISSUED, FULLY_ISSUED, CANCELLED, EXPIRED | Status (per Part 13) | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Work Order (533) | Many-to-One | N:1 | WO |
| Spare Part Master (551) | Many-to-One | N:1 | Part |
| Maintenance Store (554) | Many-to-One | N:1 | Store |
| Inventory Batch (Part 4) | Many-to-One | N:1 | Batch |

### 6. Indexes
- UNIQUE (`reservation_code`)
- INDEX (`work_order_id`, `status`)
- INDEX (`spare_part_id`, `store_id`, `status`)
- INDEX (`expiry_date`, `status`)

### 7. Security Classification
**Internal**

### 8. Integration Points
- **Inventory** (Part 4): Stock reservation
- **Maintenance Execution Engine** (Q174): Auto-reservation
- **Warehouse** (Part 6): Picking
- **Notification Service**: Expiry alerts

### 9. Sample Data
```json
{
  "reservation_code": "RES-2026-01234", "work_order_id": "wo-001",
  "spare_part_id": "spr-001", "store_id": "mst-001",
  "quantity_reserved": 4.00, "reservation_type": "AUTO",
  "reservation_date": "2026-07-08", "required_date": "2026-08-15",
  "reservation_source": "AUTO_BOM", "status": "ACTIVE"
}
```

### 10. Audit Events
`SPARE_RESERVED`, `SPARE_PARTIALLY_ISSUED`, `SPARE_FULLY_ISSUED`, `SPARE_RESERVATION_CANCELLED`, `SPARE_RESERVATION_EXPIRED`

---

## Entity 556 — Spare Issue

### 1. Business Purpose
Per Part 13 §5: Tracks Issued Quantity, Issued By, Issued To, Returnable, Cost. Issue of spares from store to WO.

### 2. Architectural Role
Transaction entity — inventory exit event. Updates stock levels and posts cost.

### 3. Business Rules
- Issue types: AGAINST_WO (with reservation), AGAINST_WO_DIRECT (no reservation), EMERGENCY (urgent), CONSUMABLE (no WO)
- Returnable: tools, expensive parts (must return after use)
- FIFO issue: oldest batch first (per inventory policy)
- Cost: standard cost or last purchase cost
- Issued By: store keeper; Issued To: technician

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `issue_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `issue_number` | VARCHAR(30) | Yes | — | Unique per store | Display number | Internal |
| `work_order_id` | UUID | No | NULL | FK to `work_orders` (Entity 533) | WO | Internal |
| `reservation_id` | UUID | No | NULL | FK to `spare_reservations` (Entity 555) | Reservation | Internal |
| `spare_part_id` | UUID | Yes | — | FK to `spare_part_master` (Entity 551) | Part | Internal |
| `store_id` | UUID | Yes | — | FK to `maintenance_stores` (Entity 554) | Source store | Internal |
| `inventory_batch_id` | UUID | Yes | — | FK to `inventory_batches` | Batch | Internal |
| `bin_location_id` | UUID | No | NULL | FK to `bin_locations` | Bin | Internal |
| `issued_quantity` | DECIMAL(15,2) | Yes | — | > 0 | Issued Quantity (per Part 13) | Internal |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | UoM | Internal |
| `unit_cost` | DECIMAL(18,4) | Yes | — | > 0 | Unit cost | Confidential |
| `total_cost` | DECIMAL(18,4) | Yes | — | > 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `issue_type` | ENUM | Yes | — | AGAINST_WO, AGAINST_WO_DIRECT, EMERGENCY, CONSUMABLE, TRANSFER | Type | Internal |
| `is_returnable` | BOOLEAN | Yes | `false` | — | Returnable (per Part 13) | Internal |
| `expected_return_date` | DATE | No | NULL | — | If returnable | Internal |
| `issued_by` | UUID | Yes | — | FK to `workforce_master` | Issued By (per Part 13) — storekeeper | Confidential |
| `issued_to` | UUID | Yes | — | FK to `workforce_master` | Issued To (per Part 13) — technician | Confidential |
| `issued_at` | TIMESTAMPTZ | Yes | `now()` | — | Issue time | Internal |
| `asset_id` | UUID | No | NULL | FK to `asset_master` | Asset (if known) | Internal |
| `cost_center_id` | UUID | Yes | — | FK to `cost_centers` | Cost center | Confidential |
| `gl_account_code` | VARCHAR(30) | Yes | — | FK to `gl_accounts` | GL | Confidential |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Posting | Confidential |
| `signature_attachment_id` | UUID | Yes | — | FK to `attachments` | Tech signature | Confidential |
| `notes` | TEXT | No | NULL | — | Notes | Confidential |
| `status` | ENUM | Yes | `ISSUED` | ISSUED, RETURNED, PARTIALLY_RETURNED, LOST, SCRAPPED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Work Order (533) | Many-to-One | N:1 | WO |
| Spare Part Master (551) | Many-to-One | N:1 | Part |
| Maintenance Store (554) | Many-to-One | N:1 | Store |
| Inventory Batch | Many-to-One | N:1 | Batch |
| Spare Return (557) | One-to-Many | 1:N | Returns |

### 6. Indexes
- UNIQUE (`issue_code`)
- INDEX (`work_order_id`, `status`)
- INDEX (`spare_part_id`, `issued_at`)
- INDEX (`store_id`, `issued_at`)
- INDEX (`issued_to`, `issued_at`)

### 7. Security Classification
**Confidential**

### 8. Integration Points
- **Inventory** (Part 4): Stock reduction
- **Accounting Event Engine**: GL posting
- **Maintenance Execution Engine** (Q174): WO cost update
- **Finance** (Part 11): Cost analytics

### 9. Sample Data
```json
{
  "issue_code": "ISS-2026-00567", "issue_number": "ISS-MST-001-00567",
  "work_order_id": "wo-001", "reservation_id": "res-001",
  "spare_part_id": "spr-001", "store_id": "mst-001",
  "issued_quantity": 4.00, "unit_of_measure": "PCS",
  "unit_cost": 875.0000, "total_cost": 3500.0000,
  "issue_type": "AGAINST_WO", "is_returnable": false,
  "issued_by": "wf-store-001", "issued_to": "wf-tech-001",
  "issued_at": "2026-08-15T10:30:00Z", "asset_id": "asset-001",
  "cost_center_id": "cc-mfg-mum-001", "status": "ISSUED"
}
```

### 10. Audit Events
`SPARE_ISSUED`, `SPARE_PARTIALLY_RETURNED`, `SPARE_FULLY_RETURNED`, `SPARE_LOST`, `SPARE_SCRAPPED`

---

## Entity 557 — Spare Return

### 1. Business Purpose
Per Part 13 §5: Supports Unused Parts, Repairable Parts, Scrap Parts, Warranty Return. Return of unused or recoverable spares.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `return_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `spare_issue_id` | UUID | Yes | — | FK to `spare_issues` (Entity 556) | Source issue | Internal |
| `work_order_id` | UUID | Yes | — | FK to `work_orders` (Entity 533) | WO | Internal |
| `spare_part_id` | UUID | Yes | — | FK to `spare_part_master` (Entity 551) | Part | Internal |
| `store_id` | UUID | Yes | — | FK to `maintenance_stores` (Entity 554) | Return to store | Internal |
| `return_type` | ENUM | Yes | — | UNUSED, REPAIRABLE, SCRAP, WARRANTY_RETURN | Type (per Part 13) | Internal |
| `quantity_returned` | DECIMAL(15,2) | Yes | — | > 0 | Qty returned | Internal |
| `quantity_accepted` | DECIMAL(15,2) | Yes | — | ≥ 0, ≤ quantity_returned | Accepted | Internal |
| `quantity_rejected` | DECIMAL(15,2) | Yes | `0` | ≥ 0 | Rejected | Internal |
| `condition_on_return` | ENUM | Yes | — | NEW, GOOD, DAMAGED, DEFECTIVE, UNSERVICEABLE | Condition | Internal |
| `return_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Recovery value | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `return_reason` | TEXT | Yes | — | Min 10 | Reason | Confidential |
| `inspection_notes` | TEXT | No | NULL | — | Inspection | Confidential |
| `inspected_by` | UUID | No | NULL | FK to `workforce_master` | Inspector | Confidential |
| `inspected_at` | TIMESTAMPTZ | No | NULL | — | Inspection | Internal |
| `returned_by` | UUID | Yes | — | FK to `workforce_master` | Returned by | Confidential |
| `returned_at` | TIMESTAMPTZ | Yes | `now()` | — | Return time | Internal |
| `received_by` | UUID | Yes | — | FK to `workforce_master` | Store keeper | Confidential |
| `received_at` | TIMESTAMPTZ | Yes | `now()` | — | Receipt time | Internal |
| `warranty_claim_id` | UUID | No | NULL | FK to `warranty_claims` | Warranty claim | Confidential |
| `vendor_return_id` | UUID | No | NULL | FK to `vendor_returns` | Vendor return | Internal |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Posting | Confidential |
| `photo_attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Photos | Confidential |
| `status` | ENUM | Yes | `RETURNED` | RETURNED, INSPECTED, ACCEPTED, REJECTED, SCRAPPED, WARRANTY_CLAIMED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Spare Issue (556) | Many-to-One | N:1 | Source |
| Spare Part Master (551) | Many-to-One | N:1 | Part |
| Maintenance Store (554) | Many-to-One | N:1 | Store |

### 6. Indexes
- UNIQUE (`return_code`)
- INDEX (`spare_issue_id`)
- INDEX (`return_type`, `status`)
- INDEX (`work_order_id`)

### 7. Security Classification
**Confidential**

### 8. Integration Points
- **Inventory** (Part 4): Stock restoration (if reusable)
- **Procurement** (Part 5): Vendor returns
- **Accounting Event Engine**: Recovery posting
- **Maintenance Execution Engine** (Q174): WO cost adjustment

### 9. Sample Data
```json
{
  "return_code": "RET-2026-00123", "spare_issue_id": "iss-001",
  "work_order_id": "wo-001", "spare_part_id": "spr-001",
  "store_id": "mst-001", "return_type": "UNUSED",
  "quantity_returned": 1.00, "quantity_accepted": 1.00,
  "condition_on_return": "NEW", "return_value": 875.0000,
  "return_reason": "Excess stock issued — only 3 of 4 bearings needed",
  "status": "ACCEPTED"
}
```

### 10. Audit Events
`SPARE_RETURNED`, `SPARE_INSPECTED`, `SPARE_ACCEPTED`, `SPARE_REJECTED`, `SPARE_SCRAPPED`, `SPARE_WARRANTY_CLAIMED`

---

## Entity 558 — Spare Consumption

### 1. Business Purpose
Per Part 13 §5: Measures Consumption, Cost, Machine, Technician, Maintenance Type. Aggregated consumption analytics.

### 2. Architectural Role
Aggregation entity — derives from spare issues. Source for consumption trends and forecasting.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `spare_part_id` | UUID | Yes | — | FK to `spare_part_master` (Entity 551) | Part | Internal |
| `asset_id` | UUID | No | NULL | FK to `asset_master` (Entity 511) | Machine (per Part 13) | Internal |
| `technician_id` | UUID | No | NULL | FK to `workforce_master` | Technician (per Part 13) | Confidential |
| `maintenance_type` | ENUM | Yes | — | PREVENTIVE, CORRECTIVE, CALIBRATION, INSPECTION | Maintenance Type (per Part 13) | Internal |
| `store_id` | UUID | Yes | — | FK to `maintenance_stores` | Store | Internal |
| `consumption_quantity` | DECIMAL(15,2) | Yes | `0` | ≥ 0 | Consumption (per Part 13) | Internal |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | UoM | Internal |
| `consumption_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost (per Part 13) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `work_order_count` | INTEGER | Yes | `0` | ≥ 0 | WOs | Internal |
| `issue_count` | INTEGER | Yes | `0` | ≥ 0 | Issues | Internal |
| `consumption_period` | ENUM | Yes | `MONTHLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY | Period | Internal |
| `period_year` | INTEGER | Yes | — | — | Year | Internal |
| `period_month` | INTEGER | No | NULL | 1-12 | Month | Internal |
| `consumption_trend_3m` | JSONB | Yes | `'[]'` | — | 3-month trend | Internal |
| `consumption_trend_12m` | JSONB | Yes | `'[]'` | — | 12-month trend | Internal |
| `avg_consumption_per_month` | DECIMAL(15,2) | Yes | `0` | ≥ 0 | Average | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 559 — Spare Forecast

### 1. Business Purpose
Per Part 13 §5: Forecasts Demand, Lead Time, Safety Stock, Reorder Point. AI-driven demand forecasting.

### 2. Architectural Role
AI/Analytics entity — predicts future spare parts demand. Drives procurement planning.

### 3. Business Rules
- Forecast horizon: 1/3/6/12 months
- Forecast methods: MOVING_AVERAGE, EXPONENTIAL_SMOOTHING, ARIMA, ML_BASED, HYBRID
- Safety stock: based on demand variability + lead time variability
- Reorder point: (avg_daily_demand × lead_time) + safety_stock
- Confidence interval: 80% / 95% bounds
- Refresh frequency: weekly

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `forecast_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `spare_part_id` | UUID | Yes | — | FK to `spare_part_master` (Entity 551) | Part | Internal |
| `forecast_date` | DATE | Yes | — | — | Forecast date | Internal |
| `forecast_horizon_months` | INTEGER | Yes | — | 1, 3, 6, 12 | Horizon | Internal |
| `forecast_method` | ENUM | Yes | — | MOVING_AVERAGE, EXPONENTIAL_SMOOTHING, ARIMA, ML_BASED, HYBRID | Method | Internal |
| `forecasted_demand` | DECIMAL(15,2) | Yes | — | ≥ 0 | Demand (per Part 13) | Confidential |
| `forecast_confidence_lower` | DECIMAL(15,2) | Yes | — | ≥ 0, ≤ forecasted_demand | Lower bound | Confidential |
| `forecast_confidence_upper` | DECIMAL(15,2) | Yes | — | ≥ forecasted_demand | Upper bound | Confidential |
| `confidence_level_pct` | DECIMAL(5,2) | Yes | `95.00` | 80-99 | Confidence | Internal |
| `current_stock` | DECIMAL(15,2) | Yes | `0` | ≥ 0 | Current | Internal |
| `lead_time_days` | INTEGER | Yes | — | ≥ 0 | Lead Time (per Part 13) | Internal |
| `safety_stock_recommended` | DECIMAL(15,2) | Yes | — | ≥ 0 | Safety Stock (per Part 13) | Confidential |
| `reorder_point_recommended` | DECIMAL(15,2) | Yes | — | ≥ 0 | Reorder Point (per Part 13) | Confidential |
| `reorder_quantity_recommended` | DECIMAL(15,2) | Yes | — | ≥ 0 | Reorder qty | Confidential |
| `stockout_probability_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Stockout risk | Confidential |
| `expected_stockout_date` | DATE | No | NULL | — | Predicted stockout | Confidential |
| `historical_accuracy_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Past accuracy | Internal |
| `model_version` | VARCHAR(20) | Yes | — | — | Model | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI recommendations | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED, SUPERSEDED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Spare Part Master (551) | Many-to-One | N:1 | Part |
| Self (559) | Self-reference | N:1 | Previous forecast |

### 6. Indexes
- UNIQUE (`forecast_code`)
- INDEX (`spare_part_id`, `forecast_date`)
- INDEX (`forecast_horizon_months`, `status`)
- INDEX (`stockout_probability_pct`)

### 7. Security Classification
**Confidential**

### 8. Integration Points
- **Procurement** (Part 5): Auto-PO generation
- **Inventory** (Part 4): Reorder recommendations
- **Maintenance Execution Engine** (Q174): Spare availability check
- **AI/ML Service**: Forecast model

### 9. Sample Data
```json
{
  "forecast_code": "FCT-2026-00456", "spare_part_id": "spr-001",
  "forecast_date": "2026-07-08", "forecast_horizon_months": 3,
  "forecast_method": "ML_BASED", "forecasted_demand": 12.00,
  "forecast_confidence_lower": 9.00, "forecast_confidence_upper": 15.00,
  "current_stock": 8.00, "lead_time_days": 14,
  "safety_stock_recommended": 4.00, "reorder_point_recommended": 6.00,
  "reorder_quantity_recommended": 12.00, "stockout_probability_pct": 25.00,
  "expected_stockout_date": "2026-08-15", "model_version": "v2.1.0",
  "status": "ACTIVE"
}
```

### 10. Audit Events
`SPARE_FORECAST_GENERATED`, `SPARE_FORECAST_UPDATED`, `SPARE_FORECAST_SUPERSEDED`, `SPARE_STOCKOUT_PREDICTED`

---

## Entity 560 — Spare Parts Dashboard

### 1. Business Purpose
Per Part 13 §5: Displays Critical Stock, Reserved Parts, Consumption, Fast Moving, Slow Moving, Stockouts. AI: Demand Forecast, Stock Optimization, OEM Recommendation, Failure-Based Planning.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | STORE, FACILITY, COMPANY | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `total_skus` | INTEGER | Yes | `0` | ≥ 0 | Total SKUs | Internal |
| `total_inventory_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Inventory value | Confidential |
| `critical_stock_count` | INTEGER | Yes | `0` | ≥ 0 | Critical Stock (per Part 13) — below min | Internal |
| `critical_stock_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Value | Confidential |
| `reserved_parts_count` | INTEGER | Yes | `0` | ≥ 0 | Reserved Parts (per Part 13) | Internal |
| `reserved_parts_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Value | Confidential |
| `consumption_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Consumption (per Part 13) MTD | Confidential |
| `consumption_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | YTD | Confidential |
| `fast_moving_skus` | INTEGER | Yes | `0` | ≥ 0 | Fast Moving (per Part 13) | Internal |
| `slow_moving_skus` | INTEGER | Yes | `0` | ≥ 0 | Slow Moving (per Part 13) | Internal |
| `non_moving_skus` | INTEGER | Yes | `0` | ≥ 0 | Non-moving (>180 days) | Internal |
| `stockout_count` | INTEGER | Yes | `0` | ≥ 0 | Stockouts (per Part 13) | Internal |
| `stockout_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Value | Confidential |
| `pending_replenishment_count` | INTEGER | Yes | `0` | ≥ 0 | Pending POs | Internal |
| `pending_replenishment_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Value | Confidential |
| `stockout_risk_count` | INTEGER | Yes | `0` | ≥ 0 | Predicted stockouts | Confidential |
| `inventory_turnover_ratio` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | Turnover | Confidential |
| `days_of_supply` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | Days supply | Internal |
| `ai_demand_forecast` | JSONB | No | NULL | — | AI: Demand Forecast (per Part 13 AI) | Confidential |
| `ai_stock_optimization` | JSONB | No | NULL | — | AI: Stock Optimization (per Part 13 AI) | Confidential |
| `ai_oem_recommendation` | JSONB | No | NULL | — | AI: OEM Recommendation (per Part 13 AI) | Confidential |
| `ai_failure_based_planning` | JSONB | No | NULL | — | AI: Failure-Based Planning (per Part 13 AI) | Restricted |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 6: Calibration, Compliance & Asset Safety (Entities 561-570)

## Entity 561 — Calibration Master

### 1. Business Purpose
Per Part 13 §6: Stores Asset, Frequency, Standard, Tolerance, Method. Calibration plan template per asset/instrument.

### 2. Architectural Role
Configuration entity — defines calibration requirements. Critical for quality, compliance, and safety.

### 3. Business Rules
- Calibration mandatory for: instruments affecting product quality, safety instruments, regulatory compliance
- Standards: NIST (USA), NPL (India), ISO 17025, OEM spec
- Tolerance: acceptable deviation range
- Method: comparison against reference standard
- Frequency: usage-based or time-based

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `calibration_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset (per Part 13) | Internal |
| `instrument_name` | VARCHAR(200) | Yes | — | Min 3 | Instrument | Internal |
| `measured_parameter` | VARCHAR(100) | Yes | — | — | Parameter (e.g., "Temperature") | Internal |
| `measurement_range_min` | DECIMAL(15,3) | Yes | — | — | Range min | Internal |
| `measurement_range_max` | DECIMAL(15,3) | Yes | — | > min | Range max | Internal |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | UoM | Internal |
| `calibration_frequency` | ENUM | Yes | — | DAILY, WEEKLY, MONTHLY, QUARTERLY, HALF_YEARLY, ANNUAL, USAGE_BASED, ON_DEMAND | Frequency (per Part 13) | Internal |
| `frequency_value` | INTEGER | No | NULL | > 0 | Custom | Internal |
| `frequency_unit` | ENUM | No | NULL | DAYS, WEEKS, MONTHS, RUNNING_HOURS, CYCLES | Unit | Internal |
| `reference_standard` | VARCHAR(100) | Yes | — | — | Standard (per Part 13) | Internal |
| `standard_authority` | VARCHAR(200) | No | NULL | — | Authority (NPL/NPL/ISO) | Internal |
| `standard_traceability` | TEXT | No | NULL | — | Traceability | Internal |
| `tolerance_type` | ENUM | Yes | `ABSOLUTE` | ABSOLUTE, PERCENTAGE, RELATIVE | Type | Internal |
| `tolerance_value` | DECIMAL(15,3) | Yes | — | ≥ 0 | Tolerance (per Part 13) | Internal |
| `tolerance_unit` | VARCHAR(20) | No | NULL | — | UoM | Internal |
| `calibration_method` | ENUM | Yes | — | COMPARISON, ZERO_POINT, SPAN, MULTI_POINT, AS_FOUND_AS_LEFT | Method (per Part 13) | Internal |
| `method_description` | TEXT | Yes | — | Min 30 | Method details | Internal |
| `reference_equipment_id` | UUID | No | NULL | FK to `asset_master` | Reference standard | Internal |
| `reference_equipment_calibration_id` | UUID | No | NULL | FK to `calibration_certificates` (Entity 563) | Reference cert | Internal |
| `qualified_technician_skills` | JSONB | Yes | `'[]'` | — | Required skills | Internal |
| `calibration_environment` | JSONB | No | NULL | — | Environmental requirements | Internal |
| `compliance_required` | ENUM | Yes | `MANDATORY` | MANDATORY, RECOMMENDED, OPTIONAL | Compliance | Internal |
| `applicable_regulations` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Regulations | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Asset Master (511) | Many-to-One | N:1 | Asset |
| Calibration Schedule (562) | One-to-Many | 1:N | Schedules |
| Reference Equipment (511) | Many-to-One | N:1 | Reference standard |

### 6. Indexes
- UNIQUE (`calibration_code`)
- INDEX (`asset_id`, `status`)
- INDEX (`calibration_frequency`, `compliance_required`)

### 7. Security Classification
**Internal**

### 8. Integration Points
- **Quality QMS** (Part 8): Quality compliance
- **Maintenance Execution Engine** (Q174): Calibration WOs
- **Compliance Engine**: Regulatory reporting
- **Reliability Engine** (Q175): Calibration-driven health

### 9. Sample Data
```json
{
  "calibration_code": "CAL-MIX-TEMP-001", "asset_id": "asset-001",
  "instrument_name": "Mixer Temperature Sensor PT-100",
  "measured_parameter": "Temperature", "measurement_range_min": 0.000,
  "measurement_range_max": 200.000, "unit_of_measure": "°C",
  "calibration_frequency": "QUARTERLY", "reference_standard": "NPL-India-2024",
  "standard_authority": "NPL India", "tolerance_type": "ABSOLUTE",
  "tolerance_value": 1.000, "tolerance_unit": "°C",
  "calibration_method": "MULTI_POINT", "compliance_required": "MANDATORY",
  "applicable_regulations": ["FSSAI", "HACCP"], "status": "ACTIVE"
}
```

### 10. Audit Events
`CALIBRATION_MASTER_CREATED`, `CALIBRATION_MASTER_UPDATED`, `CALIBRATION_MASTER_INACTIVATED`

---

## Entity 562 — Calibration Schedule

### 1. Business Purpose
Per Part 13 §6: Supports Daily, Weekly, Monthly, Annual, Usage Based. Auto-generated schedule instances from calibration master.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `schedule_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `calibration_master_id` | UUID | Yes | — | FK to `calibration_master` (Entity 561) | Source | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `frequency` | ENUM | Yes | — | DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL, USAGE_BASED (per Part 13) | Frequency | Internal |
| `scheduled_due_date` | DATE | Yes | — | — | Due date | Internal |
| `scheduled_start_date` | DATE | Yes | — | ≤ due_date | Start | Internal |
| `work_order_id` | UUID | No | NULL | FK to `work_orders` (Entity 533) | WO | Internal |
| `last_calibration_date` | DATE | No | NULL | — | Last cal | Internal |
| `last_calibration_passed` | BOOLEAN | No | NULL | — | Last result | Internal |
| `next_due_date` | DATE | Yes | — | — | Next due | Internal |
| `meter_reading_at_schedule` | DECIMAL(15,2) | No | NULL | — | Meter | Internal |
| `is_overdue` | BOOLEAN | Yes | `false` | — | Past due | Internal |
| `overdue_days` | INTEGER | Yes | `0` | ≥ 0 | Days | Internal |
| `status` | ENUM | Yes | `SCHEDULED` | SCHEDULED, WO_CREATED, COMPLETED, RESCHEDULED, OVERDUE, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 563 — Calibration Certificate

### 1. Business Purpose
Per Part 13 §6: Stores Certificate, Issued By, Result, Valid Until. Formal calibration certificate.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `certificate_number` | VARCHAR(50) | Yes | — | Unique | Certificate (per Part 13) | Internal |
| `calibration_master_id` | UUID | Yes | — | FK to `calibration_master` (Entity 561) | Source | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `work_order_id` | UUID | Yes | — | FK to `work_orders` (Entity 533) | WO | Internal |
| `calibration_date` | DATE | Yes | — | — | Cal date | Internal |
| `issued_by` | UUID | Yes | — | FK to `workforce_master` | Issued By (per Part 13) | Confidential |
| `issued_by_organization` | VARCHAR(200) | Yes | — | — | Issuing org | Internal |
| `issued_by_accreditation` | VARCHAR(100) | No | NULL | — | Accreditation (NABL/ISO 17025) | Internal |
| `reference_standard_used` | VARCHAR(200) | Yes | — | — | Reference | Internal |
| `reference_standard_calibration_id` | UUID | Yes | — | FK to `calibration_certificates` | Reference cert | Internal |
| `as_found_readings` | JSONB | Yes | `'[]'` | — | Pre-cal readings | Confidential |
| `as_left_readings` | JSONB | Yes | `'[]'` | — | Post-cal readings | Confidential |
| `deviation_before` | DECIMAL(15,3) | Yes | `0` | — | Pre-cal deviation | Confidential |
| `deviation_after` | DECIMAL(15,3) | Yes | `0` | — | Post-cal deviation | Confidential |
| `adjustment_made` | BOOLEAN | Yes | `false` | — | Adjusted | Internal |
| `adjustment_details` | TEXT | No | NULL | — | Details | Confidential |
| `result` | ENUM | Yes | — | PASS, FAIL, CONDITIONAL_PASS | Result (per Part 13) | Internal |
| `result_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `valid_from` | DATE | Yes | — | — | Valid from | Internal |
| `valid_until` | DATE | Yes | — | > valid_from | Valid Until (per Part 13) | Internal |
| `certificate_attachment_id` | UUID | Yes | — | FK to `attachments` | Certificate doc | Confidential |
| `environmental_conditions` | JSONB | Yes | `'{}'` | — | Temp/humidity | Internal |
| `accreditation_body` | VARCHAR(100) | No | NULL | — | Body | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, EXPIRED, REVOKED, SUPERSEDED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 564 — Calibration History

### 1. Business Purpose
Per Part 13 §6: Stores Previous Results, Deviation, Adjustment, Technician. Append-only calibration history.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `history_code` | VARCHAR(40) | Yes | — | Unique | Code | Internal |
| `asset_id` | UUID | Yes | — | FK to `asset_master` (Entity 511) | Asset | Internal |
| `calibration_master_id` | UUID | Yes | — | FK to `calibration_master` (Entity 561) | Source | Internal |
| `calibration_certificate_id` | UUID | Yes | — | FK to `calibration_certificates` (Entity 563) | Certificate | Internal |
| `work_order_id` | UUID | Yes | — | FK to `work_orders` (Entity 533) | WO | Internal |
| `calibration_date` | DATE | Yes | — | — | Cal date | Internal |
| `previous_results` | JSONB | Yes | `'[]'` | — | Previous Results (per Part 13) | Confidential |
| `current_results` | JSONB | Yes | `'[]'` | — | Current results | Confidential |
| `deviation` | DECIMAL(15,3) | Yes | `0` | — | Deviation (per Part 13) | Confidential |
| `deviation_trend` | JSONB | Yes | `'[]'` | — | Trend | Confidential |
| `adjustment_made` | BOOLEAN | Yes | `false` | — | Adjusted | Internal |
| `adjustment_value` | DECIMAL(15,3) | No | NULL | — | Adjustment | Confidential |
| `technician_id` | UUID | Yes | — | FK to `workforce_master` | Technician (per Part 13) | Confidential |
| `technician_certification` | VARCHAR(50) | No | NULL | — | Tech cert | Confidential |
| `result` | ENUM | Yes | — | PASS, FAIL, CONDITIONAL_PASS | Result | Internal |
| `notes` | TEXT | No | NULL | — | Notes | Confidential |
| `retention_until` | DATE | Yes | — | — | Retention | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 565 — Compliance Register

### 1. Business Purpose
Per Part 13 §6: Tracks FSSAI, ISO, HACCP, GMP, Fire, Pollution, Factory Act, Electrical Safety. Master register of all regulatory compliance requirements.

### 2. Architectural Role
Master entity — defines compliance requirements per regulation. Each requirement has mandatory audits/inspections/certifications.

### 3. Business Rules
- Each compliance type has: applicable scope, mandatory audits, certifications, reporting requirements
- Compliance types: FSSAI (food safety), ISO (9001/14001/45001/22000), HACCP, GMP (Good Manufacturing Practice), FIRE (Fire Safety), POLLUTION (PCB), FACTORY_ACT, ELECTRICAL_SAFETY, PESO (Pressure Equipment)
- Each compliance has designated officer (statutory)
- Non-compliance: legal liability, fines, license revocation
- Audit calendar: mandatory audit frequency per regulation

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `compliance_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `compliance_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `compliance_type` | ENUM | Yes | — | FSSAI, ISO_9001, ISO_14001, ISO_45001, ISO_22000, HACCP, GMP, FIRE, POLLUTION, FACTORY_ACT, ELECTRICAL_SAFETY, PESO, OTHER | Type (per Part 13) | Internal |
| `regulatory_authority` | VARCHAR(200) | Yes | — | — | Authority | Internal |
| `regulation_reference` | VARCHAR(100) | Yes | — | — | Reference | Internal |
| `license_number` | VARCHAR(100) | No | NULL | — | License | Confidential |
| `license_valid_from` | DATE | No | NULL | — | Valid from | Internal |
| `license_valid_until` | DATE | No | NULL | — | Valid until | Internal |
| `applicable_facilities` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Applicable | Internal |
| `applicable_asset_types` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Asset types | Internal |
| `mandatory_audits` | JSONB | Yes | `'[]'` | — | [{ type, frequency, last_audit, next_audit }] | Confidential |
| `mandatory_certifications` | JSONB | Yes | `'[]'` | — | Required certs | Internal |
| `reporting_frequency` | ENUM | Yes | `MONTHLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY, HALF_YEARLY, ANNUAL, ON_INCIDENT | Reporting | Internal |
| `next_report_due` | DATE | Yes | — | — | Next report | Internal |
| `designated_officer_id` | UUID | Yes | — | FK to `workforce_master` | Officer | Confidential |
| `statutory_contact` | JSONB | No | NULL | — | Authority contact | Confidential |
| `compliance_status` | ENUM | Yes | `COMPLIANT` | COMPLIANT, NON_COMPLIANT, AT_RISK, SUSPENDED, REVOKED | Status | Confidential |
| `compliance_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Score | Confidential |
| `last_audit_date` | DATE | No | NULL | — | Last audit | Internal |
| `last_audit_result` | ENUM | No | NULL | PASS, CONDITIONAL_PASS, FAIL | Result | Internal |
| `open_findings_count` | INTEGER | Yes | `0` | ≥ 0 | Open findings | Internal |
| `capa_count` | INTEGER | Yes | `0` | ≥ 0 | CAPAs | Internal |
| `penalty_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Penalties | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, EXPIRED, REVOKED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Facility | Many-to-Many | N:N | Applicable facilities |
| Regulatory Audit (569) | One-to-Many | 1:N | Audits |

### 6. Indexes
- UNIQUE (`compliance_code`)
- INDEX (`compliance_type`, `compliance_status`)
- INDEX (`license_valid_until`)
- GIN INDEX (`applicable_facilities`)

### 7. Security Classification
**Confidential** — license and penalty data is **Restricted**.

### 8. Integration Points
- **Quality QMS** (Part 8): Compliance integration
- **Maintenance Execution Engine** (Q174): Compliance-driven maintenance
- **Notification Service**: Audit reminders
- **Regulatory Portal Integration**: E-filing
- **HR** (Part 12): Designated officer

### 9. Sample Data
```json
{
  "compliance_code": "CMP-FSSAI-001", "compliance_name": "FSSAI Manufacturing License",
  "compliance_type": "FSSAI", "regulatory_authority": "Food Safety and Standards Authority of India",
  "regulation_reference": "FSS Act 2006", "license_number": "FSS-12345678901234",
  "license_valid_from": "2024-04-01", "license_valid_until": "2027-03-31",
  "reporting_frequency": "ANNUAL", "designated_officer_id": "wf-qa-mgr-001",
  "compliance_status": "COMPLIANT", "compliance_score": 92.50,
  "last_audit_date": "2026-03-15", "last_audit_result": "CONDITIONAL_PASS",
  "open_findings_count": 2, "status": "ACTIVE"
}
```

### 10. Audit Events
`COMPLIANCE_REGISTERED`, `COMPLIANCE_AUDIT_COMPLETED`, `COMPLIANCE_FINDING_OPENED`, `COMPLIANCE_FINDING_CLOSED`, `COMPLIANCE_LICENSE_RENEWED`, `COMPLIANCE_NON_COMPLIANCE_DECLARED`

---

## Entity 566 — Safety Inspection

### 1. Business Purpose
Per Part 13 §6: Supports Daily, Weekly, Monthly, Annual. Scheduled safety inspections.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `inspection_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `inspection_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `inspection_type` | ENUM | Yes | — | FIRE_SAFETY, ELECTRICAL_SAFETY, MECHANICAL_SAFETY, CHEMICAL_SAFETY, STRUCTURAL, EMERGENCY_PREPAREDNESS, PPE_COMPLIANCE, ERGONOMIC | Type | Internal |
| `frequency` | ENUM | Yes | — | DAILY, WEEKLY, MONTHLY, QUARTERLY, ANNUAL (per Part 13) | Frequency | Internal |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Facility | Internal |
| `area_inspected` | VARCHAR(200) | Yes | — | — | Area | Internal |
| `asset_id` | UUID | No | NULL | FK to `asset_master` | Asset (if any) | Internal |
| `checklist_id` | UUID | Yes | — | FK to `safety_checklists` (Entity 567) | Checklist | Internal |
| `inspector_id` | UUID | Yes | — | FK to `workforce_master` | Inspector | Confidential |
| `inspection_date` | DATE | Yes | — | — | Inspection date | Internal |
| `inspection_started_at` | TIMESTAMPTZ | Yes | — | — | Start | Internal |
| `inspection_completed_at` | TIMESTAMPTZ | No | NULL | — | Completion | Internal |
| `items_inspected_count` | INTEGER | Yes | `0` | ≥ 0 | Items | Internal |
| `items_passed_count` | INTEGER | Yes | `0` | ≥ 0 | Passed | Internal |
| `items_failed_count` | INTEGER | Yes | `0` | ≥ 0 | Failed | Internal |
| `items_na_count` | INTEGER | Yes | `0` | ≥ 0 | N/A | Internal |
| `findings` | JSONB | Yes | `'[]'` | — | Findings | Confidential |
| `corrective_actions_required` | INTEGER | Yes | `0` | ≥ 0 | Actions | Internal |
| `corrective_actions_completed` | INTEGER | Yes | `0` | ≥ 0 | Completed | Internal |
| `overall_result` | ENUM | Yes | — | PASS, CONDITIONAL_PASS, FAIL | Result | Internal |
| `risk_level` | ENUM | Yes | `LOW` | LOW, MEDIUM, HIGH, CRITICAL | Risk | Confidential |
| `signature_attachment_id` | UUID | Yes | — | FK to `attachments` | Signature | Confidential |
| `photo_attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Photos | Confidential |
| `next_inspection_due` | DATE | Yes | — | — | Next | Internal |
| `status` | ENUM | Yes | `SCHEDULED` | SCHEDULED, IN_PROGRESS, COMPLETED, FAILED, RESCHEDULED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 567 — Safety Checklist

### 1. Business Purpose
Per Part 13 §6: Examples — Emergency Stop, Fire Extinguisher, Guarding, Pressure Relief, Electrical Safety, PPE. Reusable safety checklist templates.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `checklist_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `checklist_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `checklist_type` | ENUM | Yes | — | EMERGENCY_STOP, FIRE_EXTINGUISHER, GUARDING, PRESSURE_RELIEF, ELECTRICAL_SAFETY, PPE, ERGONOMIC, CHEMICAL_SAFETY, STRUCTURAL, COMPREHENSIVE | Type (per Part 13) | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `items` | JSONB | Yes | `'[]'` | — | [{ seq, item, type, expected, mandatory, photo_required }] | Internal |
| `total_items` | INTEGER | Yes | `0` | ≥ 0 | Items | Internal |
| `mandatory_items_count` | INTEGER | Yes | `0` | ≥ 0 | Mandatory | Internal |
| `applicable_inspection_types` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Applicable | Internal |
| `applicable_facility_types` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Facility types | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE, SUPERSEDED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 568 — AMC Management

### 1. Business Purpose
Per Part 13 §6: Stores Vendor, Contract, Coverage, Start Date, End Date, SLA. Annual Maintenance Contract management.

### 2. Architectural Role
Contract entity — distinct from Asset Warranty (E516) which covers manufacturer warranty. AMC is post-warranty vendor contract.

### 3. Business Rules
- AMC types: COMPREHENSIVE (parts+labor), NON_COMPREHENSIVE (labor only), INSPECTION_ONLY, ON_CALL
- Coverage: specific assets or asset groups
- SLA: response time, uptime guarantee
- Penalty: vendor pays if SLA breached (typically % of contract value)
- Renewal: 60-90 days before expiry
- Linked to Spare Part Master (vendor-supplied spares)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `amc_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `amc_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `vendor_id` | UUID | Yes | — | FK to `vendors` (Part 5) | Vendor (per Part 13) | Internal |
| `vendor_contact` | JSONB | Yes | `'{}'` | — | Contact | Confidential |
| `contract_reference` | VARCHAR(100) | Yes | — | — | Contract (per Part 13) | Confidential |
| `contract_document_id` | UUID | Yes | — | FK to `attachments` | Document | Confidential |
| `amc_type` | ENUM | Yes | — | COMPREHENSIVE, NON_COMPREHENSIVE, INSPECTION_ONLY, ON_CALL | Type | Internal |
| `coverage_type` | ENUM | Yes | — | PARTS_AND_LABOR, LABOR_ONLY, INSPECTION_ONLY, PARTS_ONLY | Coverage | Internal |
| `covered_assets` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Covered asset IDs | Internal |
| `covered_asset_categories` | UUID[] | No | `ARRAY[]::UUID[]` | — | Categories | Internal |
| `exclusions` | JSONB | Yes | `'[]'` | — | Excluded | Internal |
| `start_date` | DATE | Yes | — | — | Start Date (per Part 13) | Internal |
| `end_date` | DATE | Yes | — | > start_date | End Date (per Part 13) | Internal |
| `duration_months` | INTEGER | Yes | — | > 0 | Duration | Internal |
| `annual_value` | DECIMAL(18,4) | Yes | — | > 0 | Annual value | Confidential |
| `total_value` | DECIMAL(18,4) | Yes | — | > 0 | Total contract | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `payment_terms` | JSONB | Yes | `'{}'` | — | Terms | Confidential |
| `sla_response_time_hours` | DECIMAL(7,2) | Yes | — | > 0 | SLA (per Part 13) — response | Internal |
| `sla_repair_time_hours` | DECIMAL(7,2) | Yes | — | > 0 | SLA — repair | Internal |
| `uptime_guarantee_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Uptime guarantee | Confidential |
| `penalty_clause` | JSONB | No | NULL | — | Penalty terms | Confidential |
| `visit_frequency` | ENUM | Yes | `MONTHLY` | WEEKLY, MONTHLY, QUARTERLY, HALF_YEARLY, ON_DEMAND | Visit frequency | Internal |
| `visits_included_per_year` | INTEGER | Yes | `0` | ≥ 0 | Free visits | Internal |
| `additional_visit_charge` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Extra visit cost | Confidential |
| `renewal_required` | BOOLEAN | Yes | `true` | — | Renewal | Internal |
| `renewal_notice_days` | INTEGER | Yes | `60` | ≥ 30 | Notice | Internal |
| `renewed_from_amc_id` | UUID | No | NULL | FK to `amc_management` (self) | Previous AMC | Internal |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Cost posting | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, EXPIRED, TERMINATED, RENEWED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Vendor (Part 5) | Many-to-One | N:1 | Vendor |
| Asset Master (511) | Many-to-Many | N:N | Covered assets |
| Self (568) | Self-reference | N:1 | Previous AMC |

### 6. Indexes
- UNIQUE (`amc_code`)
- INDEX (`vendor_id`, `status`)
- INDEX (`end_date`, `status`)
- GIN INDEX (`covered_assets`)

### 7. Security Classification
**Confidential** — contract and pricing.

### 8. Integration Points
- **Procurement** (Part 5): Vendor management
- **Finance** (Part 11): AMC expense posting
- **Maintenance Execution Engine** (Q174): In-AMC WOs routed to vendor
- **Notification Service**: Renewal alerts

### 9. Sample Data
```json
{
  "amc_code": "AMC-MIX-2026", "amc_name": "Mixer AMC 2026-27",
  "vendor_id": "vnd-001", "contract_reference": "AMC-2026-MUM-001",
  "amc_type": "COMPREHENSIVE", "coverage_type": "PARTS_AND_LABOR",
  "covered_assets": ["asset-001", "asset-002"], "start_date": "2026-04-01",
  "end_date": "2027-03-31", "duration_months": 12,
  "annual_value": 150000.0000, "total_value": 150000.0000,
  "sla_response_time_hours": 4.00, "sla_repair_time_hours": 24.00,
  "uptime_guarantee_pct": 98.00, "visit_frequency": "MONTHLY",
  "visits_included_per_year": 12, "status": "ACTIVE"
}
```

### 10. Audit Events
`AMC_CREATED`, `AMC_ACTIVATED`, `AMC_RENEWED`, `AMC_EXPIRED`, `AMC_TERMINATED`, `AMC_PENALTY_LEVIED`

---

## Entity 569 — Regulatory Audit

### 1. Business Purpose
Per Part 13 §6: Tracks Internal Audit, External Audit, Government Inspection, Findings, CAPA. All formal audits across compliance areas.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `audit_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `audit_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `audit_type` | ENUM | Yes | — | INTERNAL_AUDIT, EXTERNAL_AUDIT, GOVERNMENT_INSPECTION, SECOND_PARTY, CERTIFICATION | Type (per Part 13) | Internal |
| `compliance_register_id` | UUID | Yes | — | FK to `compliance_register` (Entity 565) | Compliance | Internal |
| `audit_authority` | VARCHAR(200) | Yes | — | — | Authority | Internal |
| `auditor_organization` | VARCHAR(200) | No | NULL | — | Audit org | Internal |
| `lead_auditor` | VARCHAR(200) | No | NULL | — | Lead auditor | Internal |
| `audit_team_members` | JSONB | No | NULL | — | Team | Internal |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Facility | Internal |
| `audit_scope` | TEXT | Yes | — | Min 30 | Scope | Confidential |
| `audit_objectives` | TEXT | Yes | — | Min 30 | Objectives | Confidential |
| `audit_start_date` | DATE | Yes | — | — | Start | Internal |
| `audit_end_date` | DATE | Yes | — | ≥ start | End | Internal |
| `audit_days` | INTEGER | Yes | — | > 0 | Days | Internal |
| `areas_audited` | JSONB | Yes | `'[]'` | — | Areas | Internal |
| `documents_reviewed` | JSONB | Yes | `'[]'` | — | Documents | Internal |
| `personnel_interviewed` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Interviewed | Confidential |
| `findings` | JSONB | Yes | `'[]'` | — | Findings (per Part 13) — [{ severity, area, finding, recommendation }] | Restricted |
| `findings_critical_count` | INTEGER | Yes | `0` | ≥ 0 | Critical | Internal |
| `findings_major_count` | INTEGER | Yes | `0` | ≥ 0 | Major | Internal |
| `findings_minor_count` | INTEGER | Yes | `0` | ≥ 0 | Minor | Internal |
| `findings_observations_count` | INTEGER | Yes | `0` | ≥ 0 | Observations | Internal |
| `capa_actions` | JSONB | Yes | `'[]'` | — | CAPA (per Part 13) — [{ action, owner, due_date, status }] | Confidential |
| `capa_open_count` | INTEGER | Yes | `0` | ≥ 0 | Open | Internal |
| `capa_closed_count` | INTEGER | Yes | `0` | ≥ 0 | Closed | Internal |
| `audit_report_attachment_id` | UUID | No | NULL | FK to `attachments` | Report | Confidential |
| `audit_result` | ENUM | No | NULL | PASS, CONDITIONAL_PASS, FAIL | Result | Internal |
| `audit_score` | DECIMAL(5,2) | No | NULL | 0-100 | Score | Confidential |
| `follow_up_required` | BOOLEAN | Yes | `false` | — | Follow-up | Internal |
| `follow_up_date` | DATE | No | NULL | — | Follow-up date | Internal |
| `next_audit_due` | DATE | No | NULL | — | Next | Internal |
| `status` | ENUM | Yes | `SCHEDULED` | SCHEDULED, IN_PROGRESS, COMPLETED, FOLLOW_UP_PENDING, CLOSED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Compliance Register (565) | Many-to-One | N:1 | Compliance |
| Workforce Master (381) | Many-to-Many | N:N | Interviewed |
| CAPA | One-to-Many | 1:N | Actions |

### 6. Indexes
- UNIQUE (`audit_code`)
- INDEX (`compliance_register_id`, `audit_start_date`)
- INDEX (`audit_type`, `status`)
- INDEX (`audit_start_date`, `audit_end_date`)

### 7. Security Classification
**Restricted** — audit findings are highly sensitive.

### 8. Integration Points
- **Quality QMS** (Part 8): CAPA workflow
- **Compliance Engine**: Regulatory reporting
- **HR** (Part 12): Personnel interviews
- **Document Service**: Audit evidence
- **Notification Service**: CAPA reminders

### 9. Sample Data
```json
{
  "audit_code": "AUD-2026-00045", "audit_name": "FSSAI Annual Audit 2026",
  "audit_type": "GOVERNMENT_INSPECTION", "compliance_register_id": "cmp-001",
  "audit_authority": "FSSAI Maharashtra", "lead_auditor": "Dr. Sharma",
  "facility_id": "fac-mum", "audit_scope": "Complete food safety system audit",
  "audit_start_date": "2026-06-15", "audit_end_date": "2026-06-17", "audit_days": 3,
  "findings_major_count": 1, "findings_minor_count": 4, "findings_observations_count": 8,
  "capa_open_count": 5, "audit_result": "CONDITIONAL_PASS",
  "audit_score": 78.50, "follow_up_required": true, "follow_up_date": "2026-09-15",
  "status": "FOLLOW_UP_PENDING"
}
```

### 10. Audit Events
`AUDIT_SCHEDULED`, `AUDIT_STARTED`, `AUDIT_COMPLETED`, `AUDIT_FINDING_OPENED`, `AUDIT_FINDING_CLOSED`, `AUDIT_CAPA_ASSIGNED`, `AUDIT_FOLLOW_UP_COMPLETED`

---

## Entity 570 — Compliance Dashboard

### 1. Business Purpose
Per Part 13 §6: Displays Calibration Due, Expired Certificates, Safety Inspections, AMC Status, Compliance Score, Audit Findings. AI: Calibration Prediction, Compliance Risk, Audit Readiness, Machine Health, Safety Risk, Remaining Useful Life.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | FACILITY, COMPANY | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `calibration_due_count` | INTEGER | Yes | `0` | ≥ 0 | Calibration Due (per Part 13) — next 30 days | Internal |
| `calibration_overdue_count` | INTEGER | Yes | `0` | ≥ 0 | Overdue | Internal |
| `expired_certificates_count` | INTEGER | Yes | `0` | ≥ 0 | Expired Certificates (per Part 13) | Internal |
| `expiring_certificates_count` | INTEGER | Yes | `0` | ≥ 0 | Expiring (next 60 days) | Internal |
| `safety_inspections_due_count` | INTEGER | Yes | `0` | ≥ 0 | Safety Inspections (per Part 13) — due | Internal |
| `safety_inspections_overdue_count` | INTEGER | Yes | `0` | ≥ 0 | Overdue | Internal |
| `safety_findings_open_count` | INTEGER | Yes | `0` | ≥ 0 | Open findings | Confidential |
| `amc_active_count` | INTEGER | Yes | `0` | ≥ 0 | AMC Status (per Part 13) — active | Internal |
| `amc_expiring_count` | INTEGER | Yes | `0` | ≥ 0 | Expiring (90 days) | Internal |
| `amc_expired_count` | INTEGER | Yes | `0` | ≥ 0 | Expired | Internal |
| `compliance_register_count` | INTEGER | Yes | `0` | ≥ 0 | Total registers | Internal |
| `compliant_count` | INTEGER | Yes | `0` | ≥ 0 | Compliant | Internal |
| `non_compliant_count` | INTEGER | Yes | `0` | ≥ 0 | Non-compliant | Confidential |
| `at_risk_count` | INTEGER | Yes | `0` | ≥ 0 | At risk | Confidential |
| `overall_compliance_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Compliance Score (per Part 13) | Confidential |
| `audit_findings_open_count` | INTEGER | Yes | `0` | ≥ 0 | Audit Findings (per Part 13) | Confidential |
| `audit_findings_critical_count` | INTEGER | Yes | `0` | ≥ 0 | Critical | Restricted |
| `capa_open_count` | INTEGER | Yes | `0` | ≥ 0 | Open CAPAs | Internal |
| `capa_overdue_count` | INTEGER | Yes | `0` | ≥ 0 | Overdue | Internal |
| `compliance_by_type` | JSONB | Yes | `'{}'` | — | Score by type | Confidential |
| `compliance_trend_6m` | JSONB | Yes | `'[]'` | — | 6-month trend | Internal |
| `ai_calibration_prediction` | JSONB | No | NULL | — | AI: Calibration Prediction (per Part 13 AI) | Confidential |
| `ai_compliance_risk` | JSONB | No | NULL | — | AI: Compliance Risk (per Part 13 AI) | Restricted |
| `ai_audit_readiness` | JSONB | No | NULL | — | AI: Audit Readiness (per Part 13 AI) | Confidential |
| `ai_machine_health` | JSONB | No | NULL | — | AI: Machine Health (per Part 13 AI) | Confidential |
| `ai_safety_risk` | JSONB | No | NULL | — | AI: Safety Risk (per Part 13 AI) | Restricted |
| `ai_remaining_useful_life` | JSONB | No | NULL | — | AI: RUL (per Part 13 AI) | Restricted |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# Part 13 Batch 2 Completion Summary

**All 30 Breakdown Maintenance, Spare Parts & Calibration entities are now defined** at full enterprise-grade depth.

## Architectural Decisions Locked (Part 13 Batch 2)

1. **Emergency Maintenance Architecture** — Specialized workflow for breakdowns
2. **RCA Engine** — 5-Why, Fishbone, FMEA, CAPA integration
3. **LOTO Management** — Mandatory safety compliance
4. **Downtime Analysis** — Immutable ledger for OEE/availability
5. **Cost Tracking** — Comprehensive breakdown cost with recoveries
6. **Spare Parts Management** — Multi-tier stores with BOM-driven reservation
7. **Reservation Engine** — Pre-allocation for planned WOs
8. **Maintenance Stores** — Central, Plant, Warehouse, Service Van
9. **Inventory Integration** — Real-time stock sync with Part 4
10. **Forecast Engine** — AI-driven demand forecasting
11. **Calibration Engine** — Standard-traceable calibration management
12. **Compliance Engine** — Multi-regulation compliance (FSSAI, ISO, HACCP, GMP, etc.)
13. **Safety Management** — Inspections, checklists, incident reporting
14. **AMC Management** — Vendor contract lifecycle
15. **Regulatory Audit** — Internal/External/Government with CAPA
16. **AI Compliance** — Calibration prediction, compliance risk, audit readiness, machine health, safety risk, RUL
17. **Reliability-Centered Maintenance (RCM)** — Q175 architecture
18. **6 AI capabilities locked** for Batch 2: Failure Pattern, Downtime Prediction, Priority Recommendation, Technician Recommendation, Demand Forecast, Stock Optimization, OEM Recommendation, Failure-Based Planning, Calibration Prediction, Compliance Risk, Audit Readiness, Machine Health, Safety Risk, RUL

## New Foundation Service Locked

### Reliability Engineering Engine — Foundation Service #32

| Attribute | Value |
|---|---|
| Service ID | FS-32 |
| Architectural Decision | Q175 |
| Status | LOCKED |
| Owner | Enterprise Architect |
| Consumers | All EAM entities, Manufacturing (OEE), Warehouse (spares), Procurement (auto-PO), Finance (cost), HR (technicians), Mission Control |
| Capabilities | MTBF, MTTR, Availability, Reliability, Failure Rate, Maintenance Effectiveness, Cost per Operating Hour, OEE Integration, RUL, Predictive Maintenance |
| Design Principle | Reliability-Centered Maintenance (RCM) — proactive failure prevention |
| Elevates SUOP to | Large manufacturing enterprise RCM platform |

## Part 13 Progress Tracker

| Batch | Sections | Entities | Status |
|---|---|---|---|
| Batch 1 | 1-3 (Foundation, Hierarchy, PM) | 511-540 | ✅ COMPLETE |
| **Batch 2** | **4-6 (Breakdown, Spares, Calibration)** | **541-570** | **✅ COMPLETE (LOCKED)** |
| Batch 3 | 7-9 (Predictive, IoT, Analytics) | 571-600 | ⏳ PENDING |

## Cumulative Status

- **Manual 1 cumulative**: 575 entities (Parts 1-13 Batch 2)
- **Foundation Services**: 32 (FS-1 through FS-32)
- **Architectural Decisions**: 175 (Q1-Q175)

---

*End of Manual 1 Part 13 Sections 4-6. Next batch: Sections 7-9 (Predictive Maintenance, IoT, Sensors & Condition Monitoring; Maintenance Analytics, AI Copilot & Mission Control; Asset Performance, Reliability Engineering & Executive Dashboards).*

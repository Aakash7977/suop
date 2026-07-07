# Manual 1 · Part 8 · Section 5 · Entities 151-160 — CAPA, NCR, Deviations, Complaints & Recall

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 8 — Enterprise Quality Management (QMS) |
| Section | 5 — CAPA, NCR, Deviations, Customer Complaints & Product Recall |
| Entities | 151–160 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 5 §5.15, Ch 18 §18.6, Ch 18 §18.8, Ch 18 §18.14 |
| Last Updated | 2026-07-07 |

---

## Overview — Quality Improvement Architecture

Section 5 implements the **closed-loop quality improvement system** — detecting non-conformances, investigating root causes, implementing corrective/preventive actions, verifying effectiveness, and managing recalls when needed.

```
QUALITY EVENT (deviation, failure, complaint)
  ↓ Logged as
NCR (151) or DEVIATION (152)
  ↓ Investigated via
ROOT CAUSE ANALYSIS (153)
  ↓ Actions
CORRECTIVE ACTION (154) + PREVENTIVE ACTION (155)
  ↓ Verified
EFFECTIVENESS VERIFICATION (158)
  ↓ Closed → Knowledge Base
  ↓ If customer-reported
CUSTOMER COMPLAINT (156)
  ↓ If safety risk
PRODUCT RECALL (157)
  ↓ Tracked by
REGULATORY COMPLIANCE (159) + DASHBOARD (160)
```

### Integrated Enhancement
**Enterprise Quality Knowledge Engine** (per Enhancement) — `knowledge_base_entry`, `similar_incidents`, `ai_root_cause_suggestion`, `ai_capa_template`

---

## Entity 151 — Non-Conformance Report (NCR)

### 1. Business Purpose
Records products or processes that do not meet specifications. Per Part 8: Sources include Incoming QC, Production, Warehouse, Retail, Restaurant, Customer, Audit, Supplier.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `NCR-` | NCR code | Internal |
| `ncr_number` | VARCHAR(50) | Yes | — | Unique per company | Display number (per Part 8) | Public |
| `company_id` | UUID | Yes | — | FK to `companies` | Owning company | Internal |
| `source` | ENUM | Yes | — | INCOMING_QC, PRODUCTION, WAREHOUSE, RETAIL, RESTAURANT, CUSTOMER, AUDIT, SUPPLIER (per Part 8) | Source | Internal |
| `product_id` | UUID | No | NULL | FK to `products` | Affected product | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches` | Affected batch | Internal |
| `severity` | ENUM | Yes | `MINOR` | CRITICAL, MAJOR, MINOR, OBSERVATION (per Part 8) | Severity | Confidential |
| `description` | TEXT | Yes | — | Min 20 chars | NCR description (per Part 8) | Internal |
| `reported_by` | UUID | Yes | — | FK to `user_accounts` | Reporter (per Part 8) | Internal |
| `reported_date` | TIMESTAMPTZ | Yes | `NOW()` | — | Report date (per Part 8) | Internal |
| `assigned_to` | UUID | No | NULL | FK to `user_accounts` | Assigned investigator | Internal |
| `capa_id` | UUID | No | NULL | FK to `capas` | Linked CAPA | Confidential |
| `root_cause_analysis_id` | UUID | No | NULL | FK to `root_cause_analyses` (Entity 153) | RCA | Confidential |
| `knowledge_base_entry` | BOOLEAN | Yes | `false` | — | Added to Knowledge Base (per Enhancement) | Internal |
| `ai_root_cause_suggestion` | TEXT | No | NULL | — | AI-suggested root cause (per Enhancement) | Internal |
| `similar_incidents` | UUID[] | No | `ARRAY[]::UUID[]` | — | AI-identified similar NCRs (per Enhancement) | Internal |
| `status` | ENUM | Yes | `OPEN` | OPEN, INVESTIGATING, CAPA_PENDING, CAPA_IN_PROGRESS, VERIFIED, CLOSED (per Part 8) | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5-16. Standard Pattern
- **Partitioning**: Monthly by `reported_date` (per Part 8 Performance Strategy)
- **Index**: `uq_ncr_code_company`, `idx_ncr_status`, `idx_ncr_severity`, `idx_ncr_batch`, `idx_ncr_source`
- **Validation**: Critical severity requires CAPA; `description` min 20 chars
- **API**: `/api/v1/ncrs` (GET, POST), `/:id` (GET, PATCH), `/:id/investigate`, `/:id/close`
- **AI**: Root Cause Prediction, Failure Pattern Detection, Similar Incident Recommendation

---

## Entity 152 — Deviation Management

### 1. Business Purpose
Records deviations from approved procedures. Per Part 8: Temperature exceeded, Wrong ingredient, Late calibration, Packaging delay, Unauthorized process change. *"Critical deviations require CAPA."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `DEV-` | Deviation code | Internal |
| `deviation_number` | VARCHAR(50) | Yes | — | Unique per company | Display number (per Part 8) | Public |
| `department_id` | UUID | Yes | — | FK to `departments` | Department (per Part 8) | Internal |
| `production_order_id` | UUID | No | NULL | FK to `production_orders` | Related order (per Part 8) | Internal |
| `manufacturing_batch_id` | UUID | No | NULL | FK to `manufacturing_batches` | Related batch (per Part 8) | Internal |
| `deviation_category` | ENUM | Yes | — | TEMPERATURE, WRONG_INGREDIENT, LATE_CALIBRATION, PACKAGING_DELAY, UNAUTHORIZED_CHANGE, PROCESS_PARAMETER, EQUIPMENT, MATERIAL, OTHER | Category (per Part 8) | Internal |
| `description` | TEXT | Yes | — | Min 20 chars | Details | Internal |
| `impact_assessment` | TEXT | Yes | — | Min 10 chars | Impact (per Part 8) | Confidential |
| `immediate_action` | TEXT | Yes | — | Min 10 chars | Immediate action taken (per Part 8) | Internal |
| `is_critical` | BOOLEAN | Yes | `false` | — | Critical deviation | Confidential |
| `requires_capa` | BOOLEAN | Yes | `false` | Generated: `is_critical = true` | CAPA required | Confidential |
| `capa_id` | UUID | No | NULL | FK to `capas` | Linked CAPA | Confidential |
| `reported_by` | UUID | Yes | — | FK to `user_accounts` | Reporter | Internal |
| `reported_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Report time | Internal |
| `status` | ENUM | Yes | `OPEN` | OPEN, INVESTIGATING, CAPA_PENDING, RESOLVED, CLOSED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 153 — Root Cause Analysis (RCA)

### 1. Business Purpose
Stores investigation findings. Per Part 8 methods: 5 Why, Fishbone Diagram, Fault Tree, Pareto, Failure Mode Analysis.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `RCA-` | RCA code | Internal |
| `investigation_number` | VARCHAR(50) | Yes | — | Unique per company | Display number (per Part 8) | Public |
| `ncr_id` | UUID | Yes | — | FK to `non_conformance_reports` (Entity 151) | Source NCR | Confidential |
| `method_used` | ENUM | Yes | — | FIVE_WHY, FISHBONE, FAULT_TREE, PARETO, FAILURE_MODE (per Part 8) | Method | Internal |
| `lead_investigator_id` | UUID | Yes | — | FK to `user_accounts` | Lead (per Part 8) | Internal |
| `team_members` | UUID[] | No | `ARRAY[]::UUID[]` | FK array | Investigation team | Internal |
| `root_cause` | TEXT | Yes | — | Min 20 chars | Root cause (per Part 8) | Confidential |
| `contributing_factors` | TEXT | No | NULL | — | Contributing factors (per Part 8) | Internal |
| `evidence` | JSONB | No | NULL | — | Evidence: `[{ type, description, file_id }]` (per Part 8) | Internal |
| `conclusion` | TEXT | Yes | — | Min 20 chars | Conclusion (per Part 8) | Confidential |
| `analysis_data` | JSONB | No | NULL | — | Method-specific data (e.g., 5-Why chain, fishbone categories) | Internal |
| `ai_suggested_causes` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | AI-suggested root causes (per Enhancement) | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Approval | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval time | Internal |
| `status` | ENUM | Yes | `IN_PROGRESS` | IN_PROGRESS, COMPLETED, APPROVED, REJECTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 154 — Corrective Action (CA)

### 1. Business Purpose
Immediate correction. Per Part 8: Action Number, Assigned To, Due Date, Completion Date, Status, Verification.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `CA-` | Action code | Internal |
| `action_number` | VARCHAR(50) | Yes | — | Unique per company | Display (per Part 8) | Public |
| `capa_id` | UUID | Yes | — | FK to `capas` | Parent CAPA | Confidential |
| `action_description` | TEXT | Yes | — | Min 20 chars | What needs to be done | Internal |
| `assigned_to` | UUID | Yes | — | FK to `user_accounts` | Assignee (per Part 8) | Internal |
| `due_date` | DATE | Yes | — | — | Due date (per Part 8) | Internal |
| `completion_date` | DATE | No | NULL | — | Completion (per Part 8) | Internal |
| `is_overdue` | BOOLEAN | Yes | `false` | Generated: `due_date < CURRENT_DATE AND completion_date IS NULL` | Overdue flag | Internal |
| `verification_status` | ENUM | Yes | `PENDING` | PENDING, VERIFIED, FAILED | Verification (per Part 8) | Confidential |
| `verified_by` | UUID | No | NULL | FK to `user_accounts` | Verifier | Confidential |
| `verification_date` | DATE | No | NULL | — | Verification date | Internal |
| `evidence_file_id` | UUID | No | NULL | FK to `file_attachments` | Evidence | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, COMPLETED, VERIFIED, FAILED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 155 — Preventive Action (PA)

### 1. Business Purpose
Prevents recurrence. Per Part 8: SOP Update, Training, Machine Upgrade, Supplier Change, Recipe Revision, Inspection Frequency Increase.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `PA-` | Action code | Internal |
| `action_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Public |
| `capa_id` | UUID | Yes | — | FK to `capas` | Parent CAPA | Confidential |
| `action_type` | ENUM | Yes | — | SOP_UPDATE, TRAINING, MACHINE_UPGRADE, SUPPLIER_CHANGE, RECIPE_REVISION, INSPECTION_FREQUENCY_INCREASE, PROCESS_REDESIGN, POLICY_CHANGE (per Part 8) | Type | Internal |
| `action_description` | TEXT | Yes | — | Min 20 chars | Details | Internal |
| `assigned_to` | UUID | Yes | — | FK to `user_accounts` | Assignee | Internal |
| `due_date` | DATE | Yes | — | — | Due date | Internal |
| `completion_date` | DATE | No | NULL | — | Completion | Internal |
| `effectiveness_review_date` | DATE | Yes | — | > completion_date | When to review effectiveness | Internal |
| `ai_capa_template_used` | BOOLEAN | Yes | `false` | — | AI template used (per Enhancement) | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, COMPLETED, VERIFIED, FAILED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 156 — Customer Complaint

### 1. Business Purpose
Tracks customer-reported issues. Per Part 8 categories: Taste, Packaging, Foreign Material, Weight, Leakage, Spoilage, Delivery, Label, Quality. *"Complaint linked to batch genealogy."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `COMP-` | Complaint code | Internal |
| `complaint_number` | VARCHAR(50) | Yes | — | Unique per company | Display (per Part 8) | Public |
| `customer_id` | UUID | Yes | — | FK to `customers` | Complainant (per Part 8) | Confidential |
| `customer_name` | VARCHAR(200) | No | NULL | Denormalized | Name | Internal |
| `customer_contact` | VARCHAR(100) | No | NULL | — | Contact info | Confidential |
| `order_id` | UUID | No | NULL | FK to `sales_orders` | Source order (per Part 8) | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Product (per Part 8) | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches` | Batch (per Part 8) — linked to genealogy | Internal |
| `complaint_category` | ENUM | Yes | — | TASTE, PACKAGING, FOREIGN_MATERIAL, WEIGHT, LEAKAGE, SPOILAGE, DELIVERY, LABEL, QUALITY (per Part 8) | Category | Confidential |
| `severity` | ENUM | Yes | `MAJOR` | CRITICAL, MAJOR, MINOR | Severity | Confidential |
| `description` | TEXT | Yes | — | Min 20 chars | Complaint details | Internal |
| `complaint_date` | DATE | Yes | `CURRENT_DATE` | — | Date received | Internal |
| `investigation_id` | UUID | No | NULL | FK to `root_cause_analyses` | Investigation | Confidential |
| `resolution` | TEXT | No | NULL | — | Resolution (per Part 8) | Internal |
| `resolution_date` | DATE | No | NULL | — | Date resolved | Internal |
| `capa_id` | UUID | No | NULL | FK to `capas` | Triggered CAPA | Confidential |
| `recall_id` | UUID | No | NULL | FK to `product_recalls` (Entity 157) | Triggered recall | Confidential |
| `compensation_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Compensation paid | Confidential |
| `status` | ENUM | Yes | `OPEN` | OPEN, INVESTIGATING, RESOLVED, ESCALATED, CLOSED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 157 — Product Recall

### 1. Business Purpose
Manages market recalls. Per Part 8 types: Voluntary, Regulatory, Supplier, Internal, Market Withdrawal. *"Every recall fully auditable."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `REC-` | Recall code | Confidential |
| `recall_number` | VARCHAR(50) | Yes | — | Unique per company | Display (per Part 8) | Public |
| `product_id` | UUID | Yes | — | FK to `products` | Recalled product (per Part 8) | Internal |
| `affected_batch_ids` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Affected batches (per Part 8) | Internal |
| `reason` | TEXT | Yes | — | Min 20 chars | Recall reason (per Part 8) | Confidential |
| `risk_level` | ENUM | Yes | `HIGH` | LOW, MEDIUM, HIGH, CRITICAL (per Part 8) | Risk | Confidential |
| `recall_type` | ENUM | Yes | — | VOLUNTARY, REGULATORY, SUPPLIER, INTERNAL, MARKET_WITHDRAWAL (per Part 8) | Type | Confidential |
| `recall_scope` | ENUM | Yes | `NATIONAL` | LOCAL, REGIONAL, NATIONAL, INTERNATIONAL (per Part 8) | Scope | Internal |
| `authority` | VARCHAR(100) | No | NULL | — | Regulatory authority (per Part 8) | Confidential |
| `affected_customers_count` | INTEGER | No | `0` | ≥ 0 | Customers affected | Confidential |
| `affected_distributors_count` | INTEGER | No | `0` | ≥ 0 | Distributors affected | Internal |
| `affected_retail_count` | INTEGER | No | `0` | ≥ 0 | Retail stores affected | Internal |
| `recovered_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Quantity recovered | Internal |
| `total_recall_quantity` | DECIMAL(18,4) | Yes | — | > 0 | Total to recall | Internal |
| `recovery_pct` | DECIMAL(5,2) | No | — | Generated: `(recovered / total) * 100` | Recovery % | Internal |
| `initiated_by` | UUID | Yes | — | FK to `user_accounts` | Initiator | Confidential |
| `initiated_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Initiation time | Internal |
| `closed_at` | TIMESTAMPTZ | No | NULL | — | Closure time | Internal |
| `genealogy_traced_at` | TIMESTAMPTZ | No | NULL | — | When genealogy completed (5-min KPI per Ch 1 §2.8) | Internal |
| `recall_impact_simulation` | JSONB | No | NULL | — | AI impact simulation (per Enhancement) | Confidential |
| `status` | ENUM | Yes | `INITIATED` | INITIATED, IN_PROGRESS, RECOVERY_PHASE, COMPLETED, CANCELLED | Status | Confidential |
| Universal base fields | — | Yes | — | — | Standard | |

### 5-16. Standard Pattern
- **Validation**: Critical risk → auto-notify L1 leadership; `affected_batch_ids` non-empty
- **API**: `/api/v1/product-recalls` (GET, POST), `/:id/trace` (POST — 5-min genealogy trace), `/:id/recover` (POST), `/:id/close` (POST)
- **AI**: Recall Risk Scoring, Recall Impact Simulation, Customer Notification AI
- **Audit**: Full; every recall action permanently audited; hash-chained

---

## Entity 158 — Effectiveness Verification

### 1. Business Purpose
Ensures CAPA worked. Per Part 8: *"CAPA cannot close until verified."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `capa_id` | UUID | Yes | — | FK to `capas` | Verified CAPA | Confidential |
| `verification_date` | DATE | Yes | — | — | Verification date (per Part 8) | Internal |
| `verified_by` | UUID | Yes | — | FK to `user_accounts` | Verifier (per Part 8) | Confidential |
| `verification_method` | ENUM | Yes | — | DATA_REVIEW, RE_INSPECTION, AUDIT, MONITORING_PERIOD, STATISTICAL_ANALYSIS | Method | Internal |
| `result` | ENUM | Yes | — | EFFECTIVE, INEFFECTIVE, PARTIALLY_EFFECTIVE | Result (per Part 8) | Confidential |
| `evidence` | TEXT | Yes | — | Min 10 chars | Evidence (per Part 8) | Internal |
| `evidence_file_id` | UUID | No | NULL | FK to `file_attachments` | Evidence document | Internal |
| `monitoring_period_days` | INTEGER | No | NULL | > 0 | Monitoring period | Internal |
| `follow_up_required` | BOOLEAN | Yes | `false` | — | Follow-up needed | Internal |
| `follow_up_date` | DATE | No | NULL | — | Follow-up date | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, IN_PROGRESS, COMPLETED, FAILED | Status | Internal |

---

## Entity 159 — Regulatory Compliance

### 1. Business Purpose
Tracks compliance obligations. Per Part 8: FSSAI, FDA, ISO 22000, HACCP, BRCGS, GMP, Export Regulations. Stores audits, certificates, corrective actions, expiry.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `compliance_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Confidential |
| `regulation_type` | ENUM | Yes | — | FSSAI, FDA, ISO_22000, HACCP, BRCGS, GMP, EXPORT_REG (per Part 8) | Regulation | Confidential |
| `compliance_name` | VARCHAR(200) | Yes | — | Min 3 | Name | Public |
| `facility_id` | UUID | No | NULL | FK to `facilities` | Applicable facility | Internal |
| `audit_type` | ENUM | No | NULL | INTERNAL, EXTERNAL, REGULATORY, CERTIFICATION | Audit type (per Part 8) | Internal |
| `last_audit_date` | DATE | No | NULL | — | Last audit (per Part 8) | Internal |
| `next_audit_due` | DATE | Yes | — | — | Next audit (per Part 8) — feeds Compliance Calendar | Confidential |
| `certificate_number` | VARCHAR(50) | No | NULL | — | Certificate (per Part 8) | Confidential |
| `certificate_file_id` | UUID | No | NULL | FK to `file_attachments` | Certificate doc | Confidential |
| `certificate_expiry` | DATE | No | NULL | — | Expiry (per Part 8) | Confidential |
| `compliance_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Current score | Confidential |
| `open_findings` | INTEGER | Yes | `0` | ≥ 0 | Open findings | Confidential |
| `corrective_actions` | UUID[] | No | `ARRAY[]::UUID[]` | FK array | Linked corrective actions | Internal |
| `ai_risk_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI regulatory risk (per Part 8 AI) | Confidential |
| `status` | ENUM | Yes | `COMPLIANT` | COMPLIANT, NON_COMPLIANT, EXPIRED, PENDING_AUDIT | Status | Confidential |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 160 — Enterprise Quality Improvement Dashboard

### 1. Business Purpose
Snapshot of quality improvement metrics. Per Part 8: Open NCR, Open CAPA, Open Deviations, Customer Complaints, Recall Status, Complaint Trends, Audit Findings, Compliance Score, CAPA Effectiveness.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `open_ncrs` | INTEGER | Yes | `0` | ≥ 0 | Open NCRs (per Part 8) | Confidential |
| `open_capas` | INTEGER | Yes | `0` | ≥ 0 | Open CAPAs (per Part 8) | Confidential |
| `open_deviations` | INTEGER | Yes | `0` | ≥ 0 | Open deviations (per Part 8) | Confidential |
| `customer_complaints_open` | INTEGER | Yes | `0` | ≥ 0 | Open complaints (per Part 8) | Confidential |
| `active_recalls` | INTEGER | Yes | `0` | ≥ 0 | Active recalls (per Part 8) | Confidential |
| `complaint_trend` | JSONB | No | NULL | — | Monthly trend: `[{ month, count }]` (per Part 8) | Internal |
| `audit_findings` | INTEGER | Yes | `0` | ≥ 0 | Open findings (per Part 8) | Confidential |
| `compliance_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Compliance % (per Part 8) | Confidential |
| `capa_effectiveness_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | CAPA effectiveness (per Part 8) | Internal |
| `avg_capa_closure_days` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | Avg closure time | Internal |
| `knowledge_base_entries` | INTEGER | Yes | `0` | ≥ 0 | KB articles from closed cases (per Enhancement) | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI-generated improvement insights (per Enhancement) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Part 8 Sections 4 & 5 Completion Summary

**All 20 Laboratory + CAPA/Recall entities are now defined** at full enterprise-grade depth.

### Key Architectural Decisions

1. **LIMS architecture** — Electronic Laboratory Information Management within SUOP
2. **Barcode-based sample tracking** — Every sample uniquely identified
3. **Chain of custody** — Full custody trail maintained
4. **Instrument traceability** — Every result linked to calibrated instrument
5. **Calibration enforcement** — Expired instruments cannot record results
6. **Digital COA generation** — Version-controlled, QR-verifiable, blockchain-ready
7. **Enterprise CAPA workflow** — NCR → RCA → CA + PA → Verification → Closure
8. **Structured root cause analysis** — 5-Why, Fishbone, Fault Tree, Pareto, FMEA
9. **Batch-linked complaints** — Every complaint traces to batch genealogy
10. **Recall management** — 5-minute genealogy trace, impact simulation, recovery tracking
11. **Effectiveness verification** — CAPA cannot close until verified
12. **Regulatory compliance engine** — FSSAI, FDA, ISO 22000, HACCP, BRCGS, GMP tracking
13. **Quality Knowledge Engine** — Closed cases feed searchable knowledge base (per Enhancement)
14. **AI-assisted quality improvement** — Root cause prediction, CAPA templates, similar incidents
15. **Immutable audit trail** — All quality events permanently recorded + hash-chained

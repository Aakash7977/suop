# Manual 1 · Part 12 · Sections 9-10 · Entities 461-480 — Performance Management & Learning Management

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 12 — Enterprise Workforce Management (EWM) |
| Sections | 9 (Performance Management, KPI, OKRs & Appraisals), 10 (Learning Management, Skills Matrix & Certifications) |
| Entities | 461–480 |
| Version | 1.0.0 |
| Status | ACTIVE — LOCKED |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 9 §9.7, Part 12 §9-10 |
| Last Updated | 2026-07-07 |

---

## Overview — Performance & Learning Architecture

Sections 9-10 close the **talent development loop**: from goal-setting through appraisal to continuous learning.

```
PERFORMANCE MANAGEMENT (Sec 9: 461-470)
  Company Goals → BU Goals → Dept Goals → Employee KPIs → OKRs → Reviews → 360 → Calibration → Promotion → Compensation → Learning
  ↓ Feeds
LEARNING MANAGEMENT (Sec 10: 471-480)
  Course → Program → Skills Matrix → Assessment → Certification → History → AI Recommendations → Successor Planning
```

### Architectural Lock — Enterprise Performance Engine (FS-22)

The Enterprise Performance Engine is hereby locked as **Foundation Service #22**. It unifies KPI/OKR computation, 360 feedback aggregation, calibration curves, and AI talent analytics. All performance-touching modules consume this engine rather than embedding logic.

### Architectural Lock — Enterprise LMS (FS-23)

The Enterprise Learning Management System is locked as **Foundation Service #23**. It manages courses, programs, skills matrix, certifications, and AI-driven learning recommendations. Cross-module consumers include Manufacturing (machine skills), Quality (food safety), Retail (POS training), and Restaurant (F&B certifications).

---

# SECTION 9: Performance Management, KPI, OKRs & Appraisals (Entities 461-470)

## Entity 461 — KPI Library

### 1. Business Purpose
Per Part 12 §9: Stores Sales KPI, Production KPI, Warehouse KPI, Retail KPI, Restaurant KPI, HR KPI, Finance KPI, Quality KPI. Centralized catalog of measurable performance indicators across all enterprise domains.

### 2. Architectural Role
Master entity — defines reusable KPI templates consumed by OKR Master (462), Performance Review (463), and Manager KPI Dashboard (500). Computation logic is delegated to Compensation Rules Engine (Q161) for monetary KPIs and BI Service for operational KPIs.

### 3. Business Rules
- KPIs are global masters but **activation is per-company per-department**
- Each KPI has a formula, unit, target, frequency, and direction (higher-better vs lower-better)
- KPIs may be linked to specific data sources (MES, WMS, POS, Finance GL)
- KPIs may roll up: employee → team → department → BU → company
- KPI deprecation: in-use KPIs cannot be deleted; only deprecated
- AI-assisted target setting: historical data + benchmarks → recommended target

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `kpi_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `kpi_name` | VARCHAR(150) | Yes | — | Min 3 | Display name | Internal |
| `kpi_category` | ENUM | Yes | — | SALES, PRODUCTION, WAREHOUSE, RETAIL, RESTAURANT, HR, FINANCE, QUALITY, SAFETY, COMPLIANCE, OPERATIONAL | Domain (per Part 12) | Internal |
| `kpi_type` | ENUM | Yes | — | QUANTITATIVE, QUALITATIVE, BINARY, COMPOSITE | Type | Internal |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | Unit (e.g., `INR`, `%`, `units`, `hours`, `score`) | Internal |
| `direction` | ENUM | Yes | `HIGHER_BETTER` | HIGHER_BETTER, LOWER_BETTER, TARGET_RANGE | Optimization direction | Internal |
| `calculation_formula` | TEXT | No | NULL | — | BI/Compensation Rules Engine formula | Confidential |
| `data_source` | ENUM | Yes | — | MES, WMS, POS, FINANCE_GL, HRMS, QMS, MANUAL, EXTERNAL_API | Source system | Internal |
| `data_source_query` | TEXT | No | NULL | — | SQL/API query for actual computation | Confidential |
| `default_frequency` | ENUM | Yes | `MONTHLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY, HALF_YEARLY, YEARLY | Default review cycle | Internal |
| `default_target_value` | DECIMAL(18,4) | No | NULL | — | Default target | Internal |
| `default_warning_threshold` | DECIMAL(18,4) | No | NULL | — | Amber threshold | Internal |
| `default_critical_threshold` | DECIMAL(18,4) | No | NULL | — | Red threshold | Internal |
| `is_quantitative` | BOOLEAN | Yes | `true` | — | Numeric KPI | Internal |
| `allows_manual_override` | BOOLEAN | Yes | `false` | — | Manual entry allowed | Internal |
| `rollup_supported` | BOOLEAN | Yes | `true` | — | Supports employee → team → dept rollup | Internal |
| `applicable_roles` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Applicable role codes | Internal |
| `applicable_departments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Restrict to departments | Internal |
| `industry_benchmark` | DECIMAL(18,4) | No | NULL | — | Industry benchmark value | Internal |
| `ai_target_recommendation` | DECIMAL(18,4) | No | NULL | — | AI-recommended target | Confidential |
| `description` | TEXT | No | NULL | — | Detailed description | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| OKR Master (462) | Many-to-Many | N:N | Key Results can be KPI-linked |
| Performance Review (463) | One-to-Many | 1:N | Reviews evaluate against KPIs |
| Manager KPI Dashboard (500) | Many-to-Many | N:N | Dashboard KPIs |
| HR KPI Library (501) | One-to-Many | 1:N | HR-specific KPIs subset |
| BI Service | Service | — | Actual value computation |
| Compensation Rules Engine (Q161) | Service | — | Monetary KPI computation |

### 6. Indexes
- UNIQUE (`kpi_code`)
- INDEX (`kpi_category`, `status`)
- INDEX (`data_source`, `status`)
- GIN INDEX (`applicable_departments`)

### 7. Security Classification
**Internal** — formula and benchmarks are **Confidential**.

### 8. Integration Points
- **BI Service**: Actual value computation
- **Compensation Rules Engine** (Q161): Monetary KPIs feed payroll incentives
- **Performance Engine** (FS-22): KPI actuals drive OKR progress
- **Manufacturing MES** (Part 7): Production KPIs
- **Warehouse WMS** (Part 6): Warehouse KPIs
- **Retail POS** (Part 9): Retail KPIs
- **Restaurant** (Part 10): Restaurant KPIs
- **Finance** (Part 11): Finance KPIs

### 9. Sample Data
```json
{
  "kpi_code": "PROD-OEE", "kpi_name": "Overall Equipment Effectiveness",
  "kpi_category": "PRODUCTION", "kpi_type": "COMPOSITE",
  "unit_of_measure": "%", "direction": "HIGHER_BETTER",
  "calculation_formula": "AVAILABILITY × PERFORMANCE × QUALITY",
  "data_source": "MES", "default_frequency": "MONTHLY",
  "default_target_value": 85.0000, "default_warning_threshold": 75.0000,
  "default_critical_threshold": 65.0000, "industry_benchmark": 82.0000,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`KPI_CREATED`, `KPI_UPDATED`, `KPI_FORMULA_CHANGED`, `KPI_DEPRECATED`, `KPI_REACTIVATED`

---

## Entity 462 — OKR Master

### 1. Business Purpose
Per Part 12 §9: Stores Objective, Key Results, Owner, Due Date, Weightage, Status. The OKR framework connects strategic objectives to measurable key results.

### 2. Architectural Role
Configuration + transaction entity — objectives are configured (master), key results tracked (transaction). Cascades from company → BU → department → employee.

### 3. Business Rules
- OKR cascade: parent OKR's Key Results become child OKRs' Objectives
- Each Objective has 3-5 Key Results (industry best practice)
- Weightage per Key Result: must sum to 100% within an Objective
- Confidence score (0-100): weekly self-assessment by owner
- Stretch goals: target = 70% achievement = success (per Andy Grove model)
- OKR check-ins: weekly minimum, configurable
- OKR scoring: 0.0 to 1.0 (1.0 = 100% of target)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `okr_code` | VARCHAR(30) | Yes | — | Unique per company × cycle | Code | Internal |
| `objective` | TEXT | Yes | — | Min 10 | Objective (per Part 12: "Objective") | Internal |
| `objective_description` | TEXT | No | NULL | — | Detailed description | Internal |
| `okr_type` | ENUM | Yes | — | COMPANY, BUSINESS_UNIT, DEPARTMENT, TEAM, INDIVIDUAL | OKR level | Internal |
| `parent_okr_id` | UUID | No | NULL | FK to `okr_master` | Parent OKR (cascade) | Internal |
| `owner_id` | UUID | Yes | — | FK to `workforce_master` | Owner (per Part 12: "Owner") | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `bu_id` | UUID | No | NULL | FK to `business_units` | Business unit | Internal |
| `department_id` | UUID | No | NULL | FK to `departments` | Department | Internal |
| `cycle_type` | ENUM | Yes | `QUARTERLY` | MONTHLY, QUARTERLY, HALF_YEARLY, YEARLY | OKR cycle | Internal |
| `cycle_period` | VARCHAR(20) | Yes | — | e.g., `Q1-2026` | Cycle identifier | Internal |
| `start_date` | DATE | Yes | — | — | Start date | Internal |
| `due_date` | DATE | Yes | — | > start_date | Due Date (per Part 12: "Due Date") | Internal |
| `key_results` | JSONB | Yes | `'[]'` | Min 1, max 7 | Key Results (per Part 12: "Key Results") — array of `{ kr_id, description, kpi_id, target_value, current_value, weightage_pct, confidence }` | Internal |
| `total_weightage_pct` | DECIMAL(5,2) | Yes | `100` | = 100 | Sum of KR weightages | Internal |
| `overall_progress_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Computed progress | Internal |
| `confidence_score` | DECIMAL(5,2) | No | NULL | 0-100 | Owner confidence | Internal |
| `alignment_okr_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Aligned OKRs (cross-team) | Internal |
| `last_check_in_date` | DATE | No | NULL | — | Last check-in | Internal |
| `last_check_in_notes` | TEXT | No | NULL | — | Latest check-in notes | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, ACTIVE, ON_TRACK, AT_RISK, OFF_TRACK, COMPLETED, CANCELLED | Status (per Part 12: "Status") | Internal |
| `completion_score` | DECIMAL(5,2) | No | NULL | 0-1.0 | Final score | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| KPI Library (461) | Many-to-Many | N:N | Via Key Results |
| Workforce Master (381) | Many-to-One | N:1 | Owner |
| OKR Master (self) | Self-reference | N:1 | Parent OKR cascade |
| Performance Review (463) | One-to-Many | 1:N | OKR progress feeds reviews |
| Performance Engine (FS-22) | Service | — | Progress computation |

### 6. Indexes
- UNIQUE (`okr_code`)
- INDEX (`owner_id`, `cycle_period`, `status`)
- INDEX (`parent_okr_id`)
- INDEX (`okr_type`, `cycle_period`)
- GIN INDEX (`alignment_okr_ids`)

### 7. Security Classification
**Internal** — check-in notes are **Confidential**.

### 8. Integration Points
- **Performance Engine** (FS-22): Progress computation
- **BI Service**: KPI actuals feed Key Results
- **AI HR Copilot** (Entity 505): "What are the company OKRs?"
- **MSS Portal**: Manager OKR visibility for team

### 9. Sample Data
```json
{
  "okr_code": "OKR-MFG-Q1-2026-001",
  "objective": "Reduce production waste by 20% across all manufacturing lines",
  "okr_type": "DEPARTMENT", "owner_id": "wf-100", "department_id": "dept-mfg",
  "cycle_type": "QUARTERLY", "cycle_period": "Q1-2026",
  "start_date": "2026-01-01", "due_date": "2026-03-31",
  "key_results": [
    { "kr_id": "kr-1", "description": "Reduce flour waste by 25%", "kpi_id": "kpi-waste-flour", "target_value": 25, "current_value": 18, "weightage_pct": 40, "confidence": 80 },
    { "kr_id": "kr-2", "description": "Reduce packaging waste by 15%", "kpi_id": "kpi-waste-pkg", "target_value": 15, "current_value": 12, "weightage_pct": 30, "confidence": 75 },
    { "kr_id": "kr-3", "description": "Achieve 95% batch conformance", "kpi_id": "kpi-batch-conf", "target_value": 95, "current_value": 92, "weightage_pct": 30, "confidence": 85 }
  ],
  "total_weightage_pct": 100.00, "overall_progress_pct": 72.50, "status": "ON_TRACK"
}
```

### 10. Audit Events
`OKR_CREATED`, `OKR_ACTIVATED`, `OKR_CHECK_IN_UPDATED`, `OKR_STATUS_CHANGED`, `OKR_COMPLETED`, `OKR_CANCELLED`, `OKR_REALIGNED`

---

## Entity 463 — Performance Review

### 1. Business Purpose
Per Part 12 §9: Types — Monthly, Quarterly, Half-Yearly, Annual, Probation. Periodic evaluation of employee performance against goals, KPIs, and competencies.

### 2. Architectural Role
Transaction entity — one review per employee per cycle. Feeds Appraisal Cycle (465), Promotion Recommendation (466), and Compensation Rules Engine (Q161) for performance-linked pay.

### 3. Business Rules
- Review types per Part 12: MONTHLY, QUARTERLY, HALF_YEARLY, ANNUAL, PROBATION
- Probation review: triggered 15 days before probation end date
- Self-assessment first, then manager assessment, then calibration
- Rating scale: 5-point (1=Below, 5=Exceptional) — configurable per company
- Calibration: manager ratings normalized at department/company level
- Review lock: once calibration complete, no further changes
- Performance history: lifetime retention (7+ years per labor law)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `review_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `reviewer_id` | UUID | Yes | — | FK to `workforce_master` | Reviewer (manager) | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `review_type` | ENUM | Yes | — | MONTHLY, QUARTERLY, HALF_YEARLY, ANNUAL, PROBATION | Type (per Part 12) | Internal |
| `cycle_period` | VARCHAR(20) | Yes | — | e.g., `Q1-2026`, `2026-Annual` | Cycle | Internal |
| `review_period_start` | DATE | Yes | — | — | Period start | Internal |
| `review_period_end` | DATE | Yes | — | > review_period_start | Period end | Internal |
| `self_assessment_json` | JSONB | Yes | `'{}'` | — | Self-assessment (goals, ratings, comments) | Confidential |
| `self_assessment_at` | TIMESTAMPTZ | No | NULL | — | Self-assessment timestamp | Internal |
| `manager_assessment_json` | JSONB | Yes | `'{}'` | — | Manager assessment | Confidential |
| `manager_assessment_at` | TIMESTAMPTZ | No | NULL | — | Manager assessment timestamp | Internal |
| `kpi_assessments` | JSONB | Yes | `'[]'` | — | Per-KPI achievement | Confidential |
| `okr_summary` | JSONB | Yes | `'{}'` | — | OKR progress summary | Confidential |
| `competency_assessments` | JSONB | Yes | `'[]'` | — | Per-competency ratings | Confidential |
| `achievements` | TEXT | No | NULL | — | Key achievements | Confidential |
| `areas_for_improvement` | TEXT | No | NULL | — | Improvement areas | Confidential |
| `goals_next_cycle` | TEXT | No | NULL | — | Goals for next cycle | Confidential |
| `manager_rating` | DECIMAL(3,1) | No | NULL | 1.0-5.0 | Manager rating | Confidential |
| `self_rating` | DECIMAL(3,1) | No | NULL | 1.0-5.0 | Self rating | Confidential |
| `calibrated_rating` | DECIMAL(3,1) | No | NULL | 1.0-5.0 | Post-calibration rating | Confidential |
| `rating_band` | ENUM | No | NULL | EXCEPTIONAL, EXCEEDS, MEETS, PARTIALLY_MEETS, BELOW | Band | Confidential |
| `overall_comments` | TEXT | No | NULL | — | Overall comments | Confidential |
| `acknowledged_by_employee` | BOOLEAN | Yes | `false` | — | Employee acknowledgment | Internal |
| `acknowledged_at` | TIMESTAMPTZ | No | NULL | — | Acknowledgment timestamp | Internal |
| `employee_feedback` | TEXT | No | NULL | — | Employee feedback (free text) | Confidential |
| `calibration_session_id` | UUID | No | NULL | FK to `calibration_sessions` | Calibration session | Confidential |
| `locked` | BOOLEAN | Yes | `false` | — | Locked post-calibration | Internal |
| `locked_at` | TIMESTAMPTZ | No | NULL | — | Lock timestamp | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SELF_ASSESSMENT_PENDING, MANAGER_REVIEW_PENDING, CALIBRATION_PENDING, COMPLETED, DISPUTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Reviewee |
| Workforce Master (381) | Many-to-One | N:1 | Reviewer |
| KPI Library (461) | Many-to-Many | N:N | Via KPI assessments |
| OKR Master (462) | Many-to-Many | N:N | Via OKR summary |
| Competency Matrix (468) | Many-to-Many | N:N | Via competency assessments |
| 360 Feedback (464) | One-to-Many | 1:N | Aggregated feedback |
| Appraisal Cycle (465) | Many-to-One | N:1 | Linked appraisal cycle |
| Promotion Recommendation (466) | One-to-One | 1:1 | Triggers promotion |

### 6. Indexes
- UNIQUE (`review_code`)
- INDEX (`employee_id`, `cycle_period`)
- INDEX (`reviewer_id`, `status`)
- INDEX (`review_type`, `cycle_period`, `status`)

### 7. Security Classification
**Confidential** — performance reviews are highly sensitive.

### 8. Integration Points
- **Performance Engine** (FS-22): Aggregates KPI/OKR/360 inputs
- **Compensation Rules Engine** (Q161): Performance rating → variable pay multiplier
- **Appraisal Cycle** (465): Triggers appraisal workflow
- **Talent Review** (469): High/low performers identified
- **AI HR Copilot** (505): "Who are the top performers in Manufacturing?"
- **ESS Portal**: Employee view of own reviews
- **MSS Portal**: Manager view of team reviews

### 9. Sample Data
```json
{
  "review_code": "PR-2026-Q1-00012", "employee_id": "wf-001", "reviewer_id": "wf-100",
  "review_type": "QUARTERLY", "cycle_period": "Q1-2026",
  "review_period_start": "2026-01-01", "review_period_end": "2026-03-31",
  "manager_rating": 4.2, "self_rating": 4.5, "calibrated_rating": 4.0,
  "rating_band": "EXCEEDS", "acknowledged_by_employee": true,
  "status": "COMPLETED"
}
```

### 10. Audit Events
`PERFORMANCE_REVIEW_INITIATED`, `SELF_ASSESSMENT_SUBMITTED`, `MANAGER_ASSESSMENT_SUBMITTED`, `REVIEW_CALIBRATED`, `REVIEW_ACKNOWLEDGED`, `REVIEW_DISPUTED`, `REVIEW_LOCKED`

---

## Entity 464 — 360 Feedback

### 1. Business Purpose
Per Part 12 §9: Supports Manager, Peer, Self, Subordinate, Customer feedback. Multi-rater feedback for holistic performance assessment.

### 2. Architectural Role
Transaction entity — multiple feedback records per reviewee per cycle. Anonymized aggregation feeds Performance Review (463).

### 3. Business Rules
- Feedback types per Part 12: MANAGER, PEER, SELF, SUBORDINATE, CUSTOMER
- Peer/subordinate feedback is anonymous (identity hidden from reviewee)
- Customer feedback: sourced from external NPS/CSAT surveys
- Min responses per type: 3 (statistical validity)
- Cycle: typically once per year (heavy process); light pulse feedback quarterly
- Confidentiality: ratings visible to manager + HR; comments summarized by AI to preserve anonymity
- Auto-reminder after 7 days of non-response

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `feedback_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `reviewee_id` | UUID | Yes | — | FK to `workforce_master` | Reviewee | Confidential |
| `reviewer_id` | UUID | Yes | — | FK to `workforce_master` | Reviewer (NULL for anonymous customer) | Confidential |
| `review_cycle_id` | UUID | Yes | — | FK to `performance_reviews` (Entity 463) | Linked review | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `feedback_type` | ENUM | Yes | — | MANAGER, PEER, SELF, SUBORDINATE, CUSTOMER | Type (per Part 12) | Internal |
| `is_anonymous` | BOOLEAN | Yes | `true` | — | Anonymous (false for MANAGER, SELF) | Confidential |
| `competency_ratings` | JSONB | Yes | `'[]'` | — | Per-competency ratings | Confidential |
| `strengths` | TEXT | No | NULL | — | Strengths observed | Confidential |
| `development_areas` | TEXT | No | NULL | — | Development areas | Confidential |
| `suggestions` | TEXT | No | NULL | — | Suggestions for improvement | Confidential |
| `overall_rating` | DECIMAL(3,1) | Yes | — | 1.0-5.0 | Overall rating | Confidential |
| `would_work_again` | BOOLEAN | No | NULL | — | Would work with again (eNPS) | Confidential |
| `relationship_duration_months` | INTEGER | No | NULL | > 0 | How long they've worked together | Internal |
| `submitted_at` | TIMESTAMPTZ | No | NULL | — | Submission timestamp | Internal |
| `is_late` | BOOLEAN | Yes | `false` | — | Submitted after deadline | Internal |
| `reminders_sent` | INTEGER | Yes | `0` | ≥ 0 | Reminder count | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, SUBMITTED, DECLINED, EXPIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workforce Master (381) | Many-to-One | N:1 | Reviewee + Reviewer |
| Performance Review (463) | Many-to-One | N:1 | Linked review |
| Competency Matrix (468) | Many-to-Many | N:N | Via competency ratings |

### 6. Indexes
- UNIQUE (`feedback_code`)
- INDEX (`reviewee_id`, `review_cycle_id`, `feedback_type`)
- INDEX (`reviewer_id`, `status`)
- INDEX (`status`, `submitted_at`)

### 7. Security Classification
**Confidential** — anonymous feedback must never be exposed individually.

### 8. Integration Points
- **Performance Engine** (FS-22): Aggregation + AI summarization
- **AI Service**: Anonymous comment summarization
- **Performance Review** (463): Aggregated scores feed review
- **Notification Service**: Reminder emails to reviewers
- **Customer Survey Service**: External NPS/CSAT integration

### 9. Sample Data
```json
{
  "feedback_code": "FB-2026-ANNUAL-00128", "reviewee_id": "wf-001",
  "reviewer_id": "wf-027", "review_cycle_id": "pr-2026-annual-001",
  "feedback_type": "PEER", "is_anonymous": true,
  "overall_rating": 4.3, "would_work_again": true,
  "relationship_duration_months": 18,
  "strengths": "Excellent problem-solving and team collaboration",
  "development_areas": "Could improve delegation and time management",
  "status": "SUBMITTED"
}
```

### 10. Audit Events
`FEEDBACK_REQUESTED`, `FEEDBACK_SUBMITTED`, `FEEDBACK_DECLINED`, `FEEDBACK_EXPIRED`, `FEEDBACK_REMINDER_SENT`, `FEEDBACK_AGGREGATED`

---

## Entity 465 — Appraisal Cycle

### 1. Business Purpose
Per Part 12 §9: Stores Cycle, Rating, Recommendation, Approval, Salary Impact. The master cycle for annual appraisals that drives compensation changes.

### 2. Architectural Role
Master + workflow entity — defines the appraisal cycle for the company; aggregates all Performance Reviews (463); triggers Promotion Recommendations (466) and Compensation Rules Engine (Q161) salary impact.

### 3. Business Rules
- Cycle: typically ANNUAL (April-March in India); mid-year reviews are PULSE not appraisal
- Rating distribution: forced ranking (e.g., 10% exceptional, 20% exceeds, 60% meets, 10% below) — company-configurable
- Calibration: HR-facilitated session with department heads
- Salary impact: rating → hike % (configurable matrix)
- Approval: HR Head → Finance Head → CEO (for budget > threshold)
- Effective date: salary change effective from cycle start of next year (April 1)
- Bonus payout: performance bonus computed and paid in single cycle

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `cycle_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `cycle_name` | VARCHAR(100) | Yes | — | Min 5 | Display name | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `cycle_type` | ENUM | Yes | `ANNUAL` | ANNUAL, HALF_YEARLY, QUARTERLY | Cycle (per Part 12: "Cycle") | Internal |
| `cycle_year` | INTEGER | Yes | — | 1900-9999 | Cycle year | Internal |
| `cycle_period` | VARCHAR(20) | Yes | — | e.g., `2026-ANNUAL` | Period | Internal |
| `performance_period_start` | DATE | Yes | — | — | Performance period | Internal |
| `performance_period_end` | DATE | Yes | — | > performance_period_start | Performance period end | Internal |
| `self_assessment_window_start` | DATE | Yes | — | — | Self-assessment window | Internal |
| `self_assessment_window_end` | DATE | Yes | — | > self_assessment_window_start | Self-assessment end | Internal |
| `manager_review_window_start` | DATE | Yes | — | — | Manager review window | Internal |
| `manager_review_window_end` | DATE | Yes | — | > manager_review_window_start | Manager review end | Internal |
| `calibration_window_start` | DATE | Yes | — | — | Calibration window | Internal |
| `calibration_window_end` | DATE | Yes | — | > calibration_window_start | Calibration end | Internal |
| `effective_date` | DATE | Yes | — | — | Salary change effective date | Internal |
| `rating_distribution_policy` | JSONB | Yes | `'{}'` | — | Forced ranking distribution | Confidential |
| `salary_impact_matrix` | JSONB | Yes | `'{}'` | — | Rating → hike % matrix | Confidential |
| `bonus_impact_matrix` | JSONB | Yes | `'{}'` | — | Rating → bonus % matrix | Confidential |
| `total_employees_in_cycle` | INTEGER | Yes | `0` | ≥ 0 | Employees in cycle | Internal |
| `reviews_completed` | INTEGER | Yes | `0` | ≥ 0 | Reviews completed | Internal |
| `calibration_completed` | BOOLEAN | Yes | `false` | — | Calibration done | Internal |
| `total_salary_impact_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total hike amount | Confidential |
| `total_bonus_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total bonus payout | Confidential |
| `budget_allocated_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Budget cap | Confidential |
| `budget_variance_pct` | DECIMAL(5,2) | Yes | `0` | — | Variance vs budget | Confidential |
| `approval_status` | ENUM | Yes | `DRAFT` | DRAFT, IN_REVIEW, HR_APPROVED, FINANCE_APPROVED, CEO_APPROVED, REJECTED | Approval (per Part 12) | Internal |
| `approved_by_hr` | UUID | No | NULL | FK to `workforce_master` | HR approver | Confidential |
| `approved_by_finance` | UUID | No | NULL | FK to `workforce_master` | Finance approver | Confidential |
| `approved_by_ceo` | UUID | No | NULL | FK to `workforce_master` | CEO approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Final approval timestamp | Internal |
| `payroll_impact_posted` | BOOLEAN | Yes | `false` | — | Salary changes posted to payroll | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, ACTIVE, IN_REVIEW, APPROVED, COMPLETED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Performance Review (463) | One-to-Many | 1:N | Per-employee reviews |
| Promotion Recommendation (466) | One-to-Many | 1:N | Linked promotions |
| Compensation Rules Engine (Q161) | Service | — | Salary impact computation |
| Payroll Master (451) | One-to-Many | 1:N | Effective payroll cycle |

### 6. Indexes
- UNIQUE (`cycle_code`)
- INDEX (`company_id`, `cycle_year`, `cycle_type`)
- INDEX (`approval_status`)
- INDEX (`effective_date`, `status`)

### 7. Security Classification
**Confidential** — salary/bonus matrices are **Restricted**.

### 8. Integration Points
- **Performance Engine** (FS-22): Aggregates reviews
- **Compensation Rules Engine** (Q161): Hike % computation
- **Payroll Engine** (451): Salary structure update
- **Notification Service**: Cycle notifications to employees
- **Finance Cube** (Part 11): Salary impact analytics

### 9. Sample Data
```json
{
  "cycle_code": "APP-2026-ANNUAL", "cycle_name": "Annual Appraisal 2026",
  "company_id": "cmp-001", "cycle_type": "ANNUAL", "cycle_year": 2026,
  "cycle_period": "2026-ANNUAL",
  "performance_period_start": "2025-04-01", "performance_period_end": "2026-03-31",
  "self_assessment_window_start": "2026-04-01", "self_assessment_window_end": "2026-04-15",
  "manager_review_window_start": "2026-04-16", "manager_review_window_end": "2026-04-30",
  "calibration_window_start": "2026-05-01", "calibration_window_end": "2026-05-10",
  "effective_date": "2026-04-01",
  "rating_distribution_policy": { "EXCEPTIONAL": 10, "EXCEEDS": 20, "MEETS": 60, "PARTIALLY_MEETS": 10 },
  "salary_impact_matrix": { "EXCEPTIONAL": 15, "EXCEEDS": 10, "MEETS": 7, "PARTIALLY_MEETS": 3, "BELOW": 0 },
  "total_employees_in_cycle": 250, "reviews_completed": 250,
  "calibration_completed": true, "total_salary_impact_amount": 1250000.0000,
  "approval_status": "CEO_APPROVED", "status": "APPROVED"
}
```

### 10. Audit Events
`APPRAISAL_CYCLE_CREATED`, `APPRAISAL_CYCLE_ACTIVATED`, `APPRAISAL_CYCLE_CALIBRATION_COMPLETED`, `APPRAISAL_CYCLE_APPROVED`, `APPRAISAL_CYCLE_PAYROLL_POSTED`, `APPRAISAL_CYCLE_COMPLETED`

---

## Entity 466 — Promotion Recommendation

### 1. Business Purpose
Per Part 12 §9: Stores Current Position, New Position, Reason, Score, Approval. Workflow-driven promotion proposals from managers.

### 2. Architectural Role
Workflow entity — originates from manager recommendation, routed through multi-level approvals, results in position change + salary revision via Compensation Rules Engine (Q161).

### 3. Business Rules
- Promotion triggers: performance score (≥ 4.0 in 2 consecutive cycles), tenure (min 1 year in current grade), competency assessment
- Promotion types: VERTICAL (grade up), LATERAL (different role same grade), CROSS_FUNCTIONAL
- Promotion budget cap: per-cycle per-department
- Approval chain: Manager → Dept Head → HR → Compensation Committee → CEO (for top grades)
- Cooling period: 12 months between promotions (default)
- Effective date: aligned with appraisal cycle effective date

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `recommendation_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `recommender_id` | UUID | Yes | — | FK to `workforce_master` | Recommender (manager) | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `appraisal_cycle_id` | UUID | Yes | — | FK to `appraisal_cycles` (Entity 465) | Linked cycle | Internal |
| `current_position_id` | UUID | Yes | — | FK to `position_masters` (Entity 393) | Current Position (per Part 12) | Internal |
| `current_grade_id` | UUID | Yes | — | FK to `grades` | Current grade | Internal |
| `new_position_id` | UUID | Yes | — | FK to `position_masters` | New Position (per Part 12) | Internal |
| `new_grade_id` | UUID | Yes | — | FK to `grades` | New grade | Internal |
| `promotion_type` | ENUM | Yes | — | VERTICAL, LATERAL, CROSS_FUNCTIONAL | Type | Internal |
| `reason` | TEXT | Yes | — | Min 20 | Reason (per Part 12) | Confidential |
| `performance_score` | DECIMAL(3,1) | Yes | — | 1.0-5.0 | Performance score (per Part 12: "Score") | Confidential |
| `competency_score` | DECIMAL(3,1) | Yes | — | 1.0-5.0 | Competency score | Confidential |
| `tenure_in_current_grade_months` | INTEGER | Yes | — | ≥ 0 | Tenure | Internal |
| `current_ctc_annual` | DECIMAL(18,4) | Yes | — | > 0 | Current CTC | Confidential |
| `proposed_ctc_annual` | DECIMAL(18,4) | Yes | — | > current_ctc_annual | Proposed CTC | Confidential |
| `hike_pct` | DECIMAL(5,2) | Yes | — | > 0 | Hike percentage | Confidential |
| `effective_date` | DATE | Yes | — | — | Effective date | Internal |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `approvals_chain` | JSONB | Yes | `'[]'` | — | Multi-level approval chain | Confidential |
| `current_approver_id` | UUID | No | NULL | FK to `workforce_master` | Current approver | Confidential |
| `final_approval_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, WITHDRAWN | Final status | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Final approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Final approval timestamp | Internal |
| `rejection_reason` | TEXT | No | NULL | — | Rejection reason | Confidential |
| `position_change_posted` | BOOLEAN | Yes | `false` | — | Position change posted to workforce master | Internal |
| `salary_change_posted` | BOOLEAN | Yes | `false` | — | Salary revision posted to payroll | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SUBMITTED, IN_APPROVAL, APPROVED, REJECTED, WITHDRAWN, IMPLEMENTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Position Master (393) | Many-to-One | N:1 | Current + New position |
| Appraisal Cycle (465) | Many-to-One | N:1 | Source cycle |
| Performance Review (463) | Many-to-One | N:1 | Source review |
| Compensation Rules Engine (Q161) | Service | — | Salary revision |
| Workforce Master (381) | Service | — | Position update |

### 6. Indexes
- UNIQUE (`recommendation_code`)
- INDEX (`employee_id`, `status`)
- INDEX (`appraisal_cycle_id`, `status`)
- INDEX (`current_approver_id`, `final_approval_status`)

### 7. Security Classification
**Confidential** — salary and approval chain data.

### 8. Integration Points
- **Workflow Engine** (Foundation Service): Approval chain
- **Compensation Rules Engine** (Q161): Salary revision computation
- **Workforce Master** (381): Position/grade update
- **Salary Structure** (452): New structure activation
- **Notification Service**: Approval notifications
- **Promotion Approval** (Entity 498): MSS approval portal

### 9. Sample Data
```json
{
  "recommendation_code": "PROM-2026-00008", "employee_id": "wf-001",
  "recommender_id": "wf-100", "appraisal_cycle_id": "app-2026-annual",
  "current_position_id": "pos-eng", "current_grade_id": "grade-m3",
  "new_position_id": "pos-sr-eng", "new_grade_id": "grade-m4",
  "promotion_type": "VERTICAL",
  "reason": "Consistent exceptional performance over 4 cycles, demonstrated leadership in 2 key projects",
  "performance_score": 4.7, "competency_score": 4.5,
  "tenure_in_current_grade_months": 24,
  "current_ctc_annual": 1200000.0000, "proposed_ctc_annual": 1500000.0000,
  "hike_pct": 25.00, "effective_date": "2026-04-01",
  "final_approval_status": "PENDING", "status": "IN_APPROVAL"
}
```

### 10. Audit Events
`PROMOTION_RECOMMENDED`, `PROMOTION_APPROVED`, `PROMOTION_REJECTED`, `PROMOTION_WITHDRAWN`, `PROMOTION_IMPLEMENTED`, `PROMOTION_POSITION_CHANGED`, `PROMOTION_SALARY_REVISED`

---

## Entity 467 — Performance Improvement Plan (PIP)

### 1. Business Purpose
Per Part 12 §9: Stores Issues, Targets, Review Dates, Outcome. Structured plan to help underperforming employees improve.

### 2. Architectural Role
Workflow entity — formal HR process triggered when performance is below expectations. Outcome drives retention, transfer, or separation.

### 3. Business Rules
- PIP duration: typically 30/60/90 days (configurable)
- Triggers: rating ≤ 2.5 in annual review, or 2 consecutive quarterly ratings < 3.0
- Requires written agreement from employee
- Review cadence: weekly check-ins, formal bi-weekly reviews
- Outcomes: SUCCESSFUL (back to normal), EXTENDED (more time), UNSUCCESSFUL (separation/transfer)
- Legal compliance: documented for labor law disputes
- Mentor assignment: senior employee outside reporting line

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `pip_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `mentor_id` | UUID | No | NULL | FK to `workforce_master` | Mentor (outside reporting line) | Confidential |
| `hr_partner_id` | UUID | Yes | — | FK to `workforce_master` | HR partner | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `trigger_source` | ENUM | Yes | — | ANNUAL_REVIEW, QUARTERLY_REVIEW, MANAGER_INITIATED, COMPLAINT, ATTENDANCE_ISSUE | Trigger | Internal |
| `trigger_review_id` | UUID | No | NULL | FK to `performance_reviews` (Entity 463) | Source review | Confidential |
| `issues_identified` | JSONB | Yes | `'[]'` | — | Issues (per Part 12: "Issues") | Confidential |
| `improvement_targets` | JSONB | Yes | `'[]'` | — | Targets (per Part 12: "Targets") — array of `{ target, success_criteria, weightage }` | Confidential |
| `support_provided` | JSONB | Yes | `'[]'` | — | Training, mentoring, resources | Confidential |
| `start_date` | DATE | Yes | — | — | Start date | Internal |
| `end_date` | DATE | Yes | — | > start_date | End date | Internal |
| `duration_days` | INTEGER | Yes | — | 30-180 | PIP duration | Internal |
| `review_dates` | JSONB | Yes | `'[]'` | — | Review Dates (per Part 12) | Internal |
| `weekly_check_ins` | JSONB | Yes | `'[]'` | — | Weekly check-in records | Confidential |
| `mid_pip_review_at` | TIMESTAMPTZ | No | NULL | — | Mid-PIP review | Internal |
| `final_review_at` | TIMESTAMPTZ | No | NULL | — | Final review | Internal |
| `outcome` | ENUM | No | NULL | SUCCESSFUL, EXTENDED, UNSUCCESSFUL, WITHDRAWN, EMPLOYEE_RESIGNED | Outcome (per Part 12) | Confidential |
| `outcome_notes` | TEXT | No | NULL | — | Outcome details | Confidential |
| `employee_acknowledged` | BOOLEAN | Yes | `false` | — | Employee signed | Internal |
| `acknowledged_at` | TIMESTAMPTZ | No | NULL | — | Acknowledgment timestamp | Internal |
| `extension_count` | INTEGER | Yes | `0` | ≥ 0 | Number of extensions | Internal |
| `next_actions` | JSONB | No | NULL | — | Next steps if UNSUCCESSFUL | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, ACTIVE, EXTENDED, COMPLETED, WITHDRAWN, SEPARATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Performance Review (463) | Many-to-One | N:1 | Trigger source |
| Talent Review (469) | One-to-Many | 1:N | PIP outcomes feed talent review |
| Separation Process | One-to-One | 1:1 | If UNSUCCESSFUL |

### 6. Indexes
- UNIQUE (`pip_code`)
- INDEX (`employee_id`, `status`)
- INDEX (`status`, `end_date`)
- INDEX (`outcome`)

### 7. Security Classification
**Confidential** — sensitive HR data, legal implications.

### 8. Integration Points
- **Performance Engine** (FS-22): Tracks target progress
- **Notification Service**: Weekly reminders
- **Workflow Engine**: Approval chain
- **Legal Hold Service**: Document retention for disputes
- **Separation Process**: If UNSUCCESSFUL

### 9. Sample Data
```json
{
  "pip_code": "PIP-2026-00004", "employee_id": "wf-150",
  "manager_id": "wf-100", "hr_partner_id": "wf-200",
  "trigger_source": "ANNUAL_REVIEW", "trigger_review_id": "pr-2026-annual-045",
  "issues_identified": [
    { "area": "Production target achievement", "current": "75%", "expected": "95%" },
    { "area": "Quality compliance", "current": "Frequent deviations", "expected": "Zero deviations" }
  ],
  "improvement_targets": [
    { "target": "Achieve 95% production target", "success_criteria": "3 consecutive months", "weightage": 60 },
    { "target": "Zero quality deviations", "success_criteria": "2 consecutive months", "weightage": 40 }
  ],
  "start_date": "2026-04-01", "end_date": "2026-06-30", "duration_days": 90,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`PIP_INITIATED`, `PIP_ACKNOWLEDGED`, `PIP_CHECK_IN_UPDATED`, `PIP_MID_REVIEW_COMPLETED`, `PIP_EXTENDED`, `PIP_COMPLETED_SUCCESSFUL`, `PIP_COMPLETED_UNSUCCESSFUL`, `PIP_WITHDRAWN`, `PIP_SEPARATION_TRIGGERED`

---

## Entity 468 — Competency Matrix

### 1. Business Purpose
Per Part 12 §9: Measures Technical, Leadership, Communication, Safety, Quality, Innovation. Defines the competency framework for each role.

### 2. Architectural Role
Master + assessment entity — defines expected competencies per role; per-employee assessment feeds Performance Review (463) and Skills Matrix (473).

### 3. Business Rules
- Competency categories per Part 12: TECHNICAL, LEADERSHIP, COMMUNICATION, SAFETY, QUALITY, INNOVATION
- Each role has minimum required competency levels
- Levels: BEGINNER (1), INTERMEDIATE (2), ADVANCED (3), EXPERT (4)
- Assessment frequency: annual (or post-training)
- Gap analysis: required vs actual → training recommendations (via LMS)
- Competencies linked to Position Master (Entity 393)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `competency_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `competency_name` | VARCHAR(150) | Yes | — | Min 3 | Display name | Internal |
| `category` | ENUM | Yes | — | TECHNICAL, LEADERSHIP, COMMUNICATION, SAFETY, QUALITY, INNOVATION | Category (per Part 12) | Internal |
| `description` | TEXT | No | NULL | — | Detailed description | Internal |
| `level_definitions` | JSONB | Yes | `'{}'` | — | Level descriptors (per Part 12: "Measures") | Internal |
| `assessment_method` | ENUM | Yes | `MANAGER` | MANAGER, SELF, EXAMINATION, OBSERVATION, CERTIFICATION, 360 | Assessment method | Internal |
| `is_certification_based` | BOOLEAN | Yes | `false` | — | Requires external certification | Internal |
| `linked_certification_id` | UUID | No | NULL | FK to `certifications` (Entity 474) | Linked certification | Internal |
| `applicable_position_ids` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Applicable positions | Internal |
| `required_level_by_grade` | JSONB | Yes | `'{}'` | — | Required competency level per grade | Internal |
| `linked_kpi_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Linked KPIs for assessment | Internal |
| `training_recommendations` | JSONB | Yes | `'[]'` | — | Course recommendations per gap level | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Position Master (393) | Many-to-Many | N:N | Via applicable_position_ids |
| Certification (474) | Many-to-One | N:1 | Linked certification |
| KPI Library (461) | Many-to-Many | N:N | Via linked_kpi_ids |
| Competency Assessment (475) | One-to-Many | 1:N | Per-employee assessments |
| Performance Review (463) | Many-to-Many | N:N | Via competency_assessments |
| LMS / Skills Matrix (473) | One-to-Many | 1:N | Skills linked to competency |

### 6. Indexes
- UNIQUE (`competency_code`)
- INDEX (`category`, `status`)
- GIN INDEX (`applicable_position_ids`)
- GIN INDEX (`linked_kpi_ids`)

### 7. Security Classification
**Internal**.

### 8. Integration Points
- **Performance Engine** (FS-22): Competency scoring
- **LMS** (FS-23): Gap → training recommendations
- **Skills Matrix** (473): Skills linked to competencies
- **Certification** (474): External certifications fulfill competencies
- **Performance Review** (463): Competency ratings

### 9. Sample Data
```json
{
  "competency_code": "COMP-FOOD-SAFETY", "competency_name": "Food Safety Compliance",
  "category": "SAFETY",
  "level_definitions": {
    "1_BEGINNER": "Aware of food safety basics",
    "2_INTERMEDIATE": "Implements HACCP procedures",
    "3_ADVANCED": "Audits and improves food safety systems",
    "4_EXPERT": "Designs food safety management systems"
  },
  "assessment_method": "CERTIFICATION", "is_certification_based": true,
  "linked_certification_id": "cert-fssai",
  "required_level_by_grade": { "M1": 2, "M2": 2, "M3": 3, "M4": 3, "M5": 4 },
  "status": "ACTIVE"
}
```

### 10. Audit Events
`COMPETENCY_CREATED`, `COMPETENCY_UPDATED`, `COMPETENCY_LEVEL_RECALIBRATED`, `COMPETENCY_INACTIVATED`

---

## Entity 469 — Talent Review

### 1. Business Purpose
Per Part 12 §9: Supports High Performer, Potential, Successor, Retention Risk. Strategic talent assessment for succession planning and retention.

### 2. Architectural Role
Strategic entity — typically annual review session by leadership. Feeds Succession Planning (506), Attrition Prediction (504), and Promotion Recommendations (466).

### 3. Business Rules
- 9-box grid: Performance (X-axis: Low/Med/High) × Potential (Y-axis: Low/Med/High)
- Talent categories: STAR (high performance + high potential), WORKHORSE (high perf + low potential), PROBLEM CHILD (low perf + high potential), UNDERPERFORMER (low/low)
- Retention risk: HIGH/MEDIUM/LOW based on engagement, market demand, tenure
- Successor identification: ready now / ready 1-2 years / ready 3+ years
- Confidentiality: leadership-only data, restricted access
- Annual cadence aligned with appraisal cycle

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `talent_review_code` | VARCHAR(30) | Yes | — | Unique per company × cycle | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Restricted |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `appraisal_cycle_id` | UUID | Yes | — | FK to `appraisal_cycles` (Entity 465) | Source cycle | Internal |
| `review_session_id` | UUID | Yes | — | FK to `talent_review_sessions` | Session | Internal |
| `performance_rating` | DECIMAL(3,1) | Yes | — | 1.0-5.0 | From latest review | Restricted |
| `potential_rating` | DECIMAL(3,1) | Yes | — | 1.0-5.0 | Potential assessment | Restricted |
| `nine_box_quadrant` | ENUM | Yes | — | STAR, HIGH_PERFORMER, HIGH_POTENTIAL, WORKHORSE, CORE_PLAYER, PROBLEM_CHILD, UNDERPERFORMER, RISING_STAR, BLOCKED | 9-box position | Restricted |
| `is_high_performer` | BOOLEAN | Yes | `false` | — | High Performer (per Part 12) | Restricted |
| `is_high_potential` | BOOLEAN | Yes | `false` | — | HiPo flag | Restricted |
| `is_successor_candidate` | BOOLEAN | Yes | `false` | — | Successor (per Part 12) | Restricted |
| `successor_for_roles` | UUID[] | No | `ARRAY[]::UUID[]` | — | Roles they can succeed into | Restricted |
| `successor_readiness` | ENUM | No | NULL | READY_NOW, READY_1_2_YEARS, READY_3_PLUS_YEARS | Readiness | Restricted |
| `retention_risk` | ENUM | Yes | `MEDIUM` | HIGH, MEDIUM, LOW | Retention Risk (per Part 12) | Restricted |
| `retention_risk_reasons` | JSONB | No | `'[]'` | — | Reasons for risk | Restricted |
| `retention_actions` | JSONB | No | `'[]'` | — | Retention action plan | Restricted |
| `career_aspiration` | TEXT | No | NULL | — | Employee career aspiration | Restricted |
| `mobility_willingness` | ENUM | No | NULL | OPEN_TO_RELOCATION, NOT_OPEN, OPEN_NATIONAL, OPEN_INTERNATIONAL | Mobility | Restricted |
| `flight_risk_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI flight risk score | Restricted |
| `key_strengths` | TEXT | No | NULL | — | Strengths | Restricted |
| `development_areas` | TEXT | No | NULL | — | Development needs | Restricted |
| `critical_role_holder` | BOOLEAN | Yes | `false` | — | Holds critical role | Restricted |
| `reviewed_by` | UUID | Yes | — | FK to `workforce_master` | Reviewer (leader) | Restricted |
| `reviewed_at` | TIMESTAMPTZ | Yes | `now()` | — | Review timestamp | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, REVIEWED, FINALIZED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Appraisal Cycle (465) | Many-to-One | N:1 | Source cycle |
| Performance Review (463) | Many-to-One | N:1 | Source review |
| Succession Planning (506) | One-to-Many | 1:N | Successor candidates |
| Attrition Prediction (504) | One-to-One | 1:1 | AI flight risk input |

### 6. Indexes
- UNIQUE (`talent_review_code`)
- INDEX (`employee_id`, `appraisal_cycle_id`)
- INDEX (`is_high_performer`, `is_high_potential`)
- INDEX (`retention_risk`, `successor_readiness`)
- INDEX (`nine_box_quadrant`)

### 7. Security Classification
**Restricted** — leadership-only talent data.

### 8. Integration Points
- **Performance Engine** (FS-22): Talent session aggregation
- **AI HR Copilot** (505): "Who are our high-potential employees?"
- **Succession Planning** (506): Successor identification
- **Attrition Prediction** (504): Retention risk input
- **Promotion Recommendation** (466): HiPo pipeline
- **Workforce Planning** (503): Talent gap analysis

### 9. Sample Data
```json
{
  "talent_review_code": "TR-2026-00045", "employee_id": "wf-001",
  "appraisal_cycle_id": "app-2026-annual",
  "performance_rating": 4.5, "potential_rating": 4.0,
  "nine_box_quadrant": "STAR",
  "is_high_performer": true, "is_high_potential": true,
  "is_successor_candidate": true, "successor_readiness": "READY_1_2_YEARS",
  "retention_risk": "MEDIUM", "flight_risk_score": 35.00,
  "critical_role_holder": true, "status": "FINALIZED"
}
```

### 10. Audit Events
`TALENT_REVIEW_DRAFTED`, `TALENT_REVIEW_FINALIZED`, `TALENT_REVIEW_QUADRANT_CHANGED`, `TALENT_REVIEW_RETENTION_RISK_ESCALATED`, `TALENT_REVIEW_ARCHIVED`

---

## Entity 470 — Performance Dashboard

### 1. Business Purpose
Per Part 12 §9: Displays Top Performers, Low Performers, Average Rating, Promotion Pipeline, Department Ranking. AI: Promotion Prediction, Attrition Risk, Skill Gap, Successor Recommendation, Performance Forecast.

### 2. Architectural Role
Aggregated view entity — powers HR Mission Control, MSS portal, and executive performance views. AI insights refreshed daily.

### 3. Business Rules
- Snapshot-based: refreshed after each review cycle + daily incremental
- Multi-grain: per-employee, per-team, per-department, per-company
- AI insights: promotion prediction, attrition risk, skill gap, successor recommendation, performance forecast
- Access control: managers see only their team; HR sees all
- Anonymity: low-performer lists restricted to HR + leadership

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `snapshot_type` | ENUM | Yes | — | EMPLOYEE, TEAM, DEPARTMENT, COMPANY | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity reference | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `appraisal_cycle_id` | UUID | No | NULL | FK to `appraisal_cycles` | Cycle | Internal |
| `top_performers` | JSONB | Yes | `'[]'` | — | Top Performers (per Part 12) | Restricted |
| `low_performers` | JSONB | Yes | `'[]'` | — | Low Performers (per Part 12) | Restricted |
| `average_rating` | DECIMAL(3,2) | Yes | `0` | 1.0-5.0 | Average Rating (per Part 12) | Confidential |
| `rating_distribution` | JSONB | Yes | `'{}'` | — | Distribution by band | Confidential |
| `promotion_pipeline_count` | INTEGER | Yes | `0` | ≥ 0 | Promotion Pipeline (per Part 12) | Confidential |
| `promotion_pipeline_value` | JSONB | Yes | `'[]'` | — | Pipeline details | Restricted |
| `department_ranking` | JSONB | Yes | `'[]'` | — | Department Ranking (per Part 12) | Confidential |
| `goal_achievement_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | OKR achievement | Internal |
| `feedback_completion_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | 360 feedback completion | Internal |
| `promotion_prediction` | JSONB | No | NULL | — | AI: candidates for promotion (per Part 12 AI) | Restricted |
| `attrition_risk_employees` | JSONB | No | NULL | — | AI: flight risks (per Part 12 AI) | Restricted |
| `skill_gap_analysis` | JSONB | No | NULL | — | AI: skill gaps (per Part 12 AI) | Confidential |
| `successor_recommendations` | JSONB | No | NULL | — | AI: successors (per Part 12 AI) | Restricted |
| `performance_forecast` | JSONB | No | NULL | — | AI: next-cycle forecast (per Part 12 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh timestamp | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model version | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Appraisal Cycle (465) | Many-to-One | N:1 | Cycle |
| Workforce Master (381) | Many-to-One | N:1 | Employee (for EMPLOYEE grain) |

### 6. Indexes
- UNIQUE (`snapshot_date`, `snapshot_type`, `entity_id`)
- INDEX (`company_id`, `snapshot_date`)
- INDEX (`ai_insights_generated_at`)

### 7. Security Classification
**Confidential** — top/low performer lists and AI predictions are **Restricted**.

### 8. Integration Points
- **BI Service**: Dashboard rendering
- **AI/ML Service**: Predictive insights
- **HR Mission Control** (Entity 509): Operational dashboard
- **MSS Portal**: Manager team view
- **Executive Dashboard** (Entity 510): C-suite view

### 9. Sample Data
```json
{
  "snapshot_date": "2026-05-15", "snapshot_type": "DEPARTMENT",
  "entity_id": "dept-mfg", "company_id": "cmp-001",
  "appraisal_cycle_id": "app-2026-annual",
  "average_rating": 3.85, "rating_distribution": { "EXCEPTIONAL": 8, "EXCEEDS": 22, "MEETS": 60, "PARTIALLY_MEETS": 7, "BELOW": 3 },
  "promotion_pipeline_count": 12, "goal_achievement_pct": 78.50,
  "feedback_completion_pct": 92.00,
  "ai_insights_generated_at": "2026-05-15T02:00:00Z",
  "ai_model_version": "v5.1.0", "status": "COMPLETED"
}
```

### 10. Audit Events
`PERF_DASHBOARD_SNAPSHOT_CREATED`, `PERF_DASHBOARD_AI_REFRESHED`, `PERF_DASHBOARD_STALE_DETECTED`

---

# SECTION 10: Learning Management (LMS), Skills Matrix & Certifications (Entities 471-480)

## Entity 471 — Course Master

### 1. Business Purpose
Per Part 12 §10: Supports Internal, External, Video, PDF, Workshop, Practical. Central catalog of all learning content.

### 2. Architectural Role
Master entity — drives Learning Assignment (476), Training Program (472), and AI-driven recommendations. Linked to Competency Matrix (468) for skill-gap closure.

### 3. Business Rules
- Course types per Part 12: INTERNAL, EXTERNAL, VIDEO, PDF, WORKSHOP, PRACTICAL, E_LEARNING, BLENDED
- Each course has prerequisites, duration, difficulty level, and assessment
- Mandatory courses: auto-assigned to applicable roles
- External courses: integrated via LMS API (Coursera, Udemy, LinkedIn Learning)
- Content versioning: latest version is active; previous versions archived
- Multi-language: courses can have translations
- Compliance courses: tracked separately with mandatory renewal cycles

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `course_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `course_title` | VARCHAR(200) | Yes | — | Min 5 | Title | Internal |
| `course_description` | TEXT | Yes | — | Min 30 | Description | Internal |
| `course_type` | ENUM | Yes | — | INTERNAL, EXTERNAL, VIDEO, PDF, WORKSHOP, PRACTICAL, E_LEARNING, BLENDED | Type (per Part 12) | Internal |
| `category` | ENUM | Yes | — | TECHNICAL, COMPLIANCE, SAFETY, SOFT_SKILLS, LEADERSHIP, QUALITY, FOOD_SAFETY, OPERATIONS, IT, INDUCTION | Category | Internal |
| `subcategory` | VARCHAR(50) | No | NULL | — | Sub-category | Internal |
| `difficulty_level` | ENUM | Yes | `BEGINNER` | BEGINNER, INTERMEDIATE, ADVANCED, EXPERT | Level | Internal |
| `duration_hours` | DECIMAL(5,2) | Yes | — | > 0 | Duration in hours | Internal |
| `duration_days` | INTEGER | No | NULL | > 0 | Duration (workshops) | Internal |
| `credits` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Learning credits | Internal |
| `content_path` | VARCHAR(500) | No | NULL | — | Content storage path | Confidential |
| `content_version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `external_course_id` | VARCHAR(100) | No | NULL | — | External LMS course ID | Confidential |
| `external_provider` | ENUM | No | NULL | COURSERA, UDEMY, LINKEDIN_LEARNING, SKILLSHARE, INTERNAL_LMS | External provider | Internal |
| `prerequisite_course_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Prerequisites | Internal |
| `linked_competency_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Competencies addressed | Internal |
| `linked_certification_id` | UUID | No | NULL | FK to `certifications` (Entity 474) | Linked certification | Internal |
| `assessment_required` | BOOLEAN | Yes | `true` | — | Has assessment | Internal |
| `passing_score_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Pass threshold | Internal |
| `max_attempts` | INTEGER | Yes | `3` | > 0 | Max exam attempts | Internal |
| `languages_available` | TEXT[] | Yes | `ARRAY['en']::TEXT[]` | ISO language codes | Languages | Internal |
| `instructor_id` | UUID | No | NULL | FK to `workforce_master` | Internal instructor | Internal |
| `external_instructor` | VARCHAR(200) | No | NULL | — | External instructor | Internal |
| `applicable_roles` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Applicable roles | Internal |
| `applicable_departments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Department scope | Internal |
| `is_mandatory` | BOOLEAN | Yes | `false` | — | Mandatory course | Internal |
| `is_compliance_course` | BOOLEAN | Yes | `false` | — | Compliance course | Internal |
| `renewal_frequency_months` | INTEGER | No | NULL | > 0 | Renewal cycle | Internal |
| `cost_per_employee` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `rating_avg` | DECIMAL(3,2) | Yes | `0` | 0-5 | Avg rating | Internal |
| `enrollment_count` | INTEGER | Yes | `0` | ≥ 0 | Total enrollments | Internal |
| `completion_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Completion rate | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Search tags | Internal |
| `thumbnail_url` | VARCHAR(500) | No | NULL | — | Course thumbnail | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Training Program (472) | Many-to-Many | N:N | Programs include courses |
| Learning Assignment (476) | One-to-Many | 1:N | Assignments |
| Examination (477) | One-to-Many | 1:N | Course exams |
| Competency Matrix (468) | Many-to-Many | N:N | Via linked_competency_ids |
| Certification (474) | Many-to-One | N:1 | Linked certification |
| Workforce Master (381) | Many-to-One | N:1 | Instructor |

### 6. Indexes
- UNIQUE (`course_code`)
- INDEX (`course_type`, `category`, `status`)
- INDEX (`is_mandatory`, `is_compliance_course`)
- GIN INDEX (`applicable_roles`)
- GIN INDEX (`tags`)

### 7. Security Classification
**Internal** — content path is **Confidential**.

### 8. Integration Points
- **LMS Engine** (FS-23): Course delivery
- **External LMS APIs**: Coursera, Udemy, LinkedIn Learning
- **Competency Matrix** (468): Skill-gap driven recommendations
- **AI Service**: Course recommendations
- **ESS Portal**: Course catalog browse
- **MSS Portal**: Manager-assign courses

### 9. Sample Data
```json
{
  "course_code": "CRS-FSSAI-001", "course_title": "FSSAI Food Safety Certification",
  "course_description": "Comprehensive food safety training as per FSSAI guidelines covering hygiene, handling, and compliance.",
  "course_type": "E_LEARNING", "category": "FOOD_SAFETY",
  "difficulty_level": "INTERMEDIATE", "duration_hours": 8.00,
  "credits": 8.00, "assessment_required": true, "passing_score_pct": 70.00,
  "max_attempts": 3, "languages_available": ["en", "hi", "mr"],
  "is_mandatory": true, "is_compliance_course": true,
  "renewal_frequency_months": 12, "cost_per_employee": 1500.0000,
  "linked_certification_id": "cert-fssai", "status": "ACTIVE"
}
```

### 10. Audit Events
`COURSE_CREATED`, `COURSE_UPDATED`, `COURSE_VERSION_PUBLISHED`, `COURSE_ARCHIVED`, `COURSE_REACTIVATED`

---

## Entity 472 — Training Program

### 1. Business Purpose
Per Part 12 §10: Stores Instructor, Schedule, Department, Attendance, Completion. Cohort-based training programs with multiple courses.

### 2. Architectural Role
Scheduling + execution entity — programs are scheduled instances of courses with instructor, venue, and cohort. Tracks attendance and completion.

### 3. Business Rules
- Program = cohort + schedule + instructor + venue + courses
- Capacity: minimum and maximum enrollment
- Schedule conflicts: auto-detect instructor/venue/learner conflicts
- Waitlist: when capacity exceeded
- Attendance: minimum 80% required for completion
- Certificate: issued on successful completion
- Cancellation: 24-hour notice required; auto-reschedule

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `program_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `program_name` | VARCHAR(200) | Yes | — | Min 5 | Name | Internal |
| `program_description` | TEXT | No | NULL | — | Description | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `course_ids` | UUID[] | Yes | `ARRAY[]::UUID[]` | Min 1 | Courses in program | Internal |
| `instructor_id` | UUID | Yes | — | FK to `workforce_master` | Instructor (per Part 12: "Instructor") | Internal |
| `co_instructor_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Co-instructors | Internal |
| `department_id` | UUID | No | NULL | FK to `departments` | Department (per Part 12: "Department") | Internal |
| `target_audience` | ENUM | Yes | — | EMPLOYEES, MANAGERS, NEW_JOINEES, SPECIFIC_DEPT, SPECIFIC_GRADE | Audience | Internal |
| `schedule_start_date` | DATE | Yes | — | — | Schedule (per Part 12: "Schedule") — start | Internal |
| `schedule_end_date` | DATE | Yes | — | > schedule_start_date | Schedule end | Internal |
| `schedule_sessions` | JSONB | Yes | `'[]'` | — | Per-session schedule (date, time, duration, venue) | Internal |
| `total_duration_hours` | DECIMAL(7,2) | Yes | — | > 0 | Total duration | Internal |
| `venue_id` | UUID | No | NULL | FK to `facilities` | Venue | Internal |
| `venue_type` | ENUM | Yes | `CLASSROOM` | CLASSROOM, VIRTUAL, ON_SITE, HYBRID | Venue type | Internal |
| `meeting_link` | VARCHAR(500) | No | NULL | — | Virtual meeting URL | Confidential |
| `min_capacity` | INTEGER | Yes | — | > 0 | Min enrollment | Internal |
| `max_capacity` | INTEGER | Yes | — | ≥ min_capacity | Max enrollment | Internal |
| `enrolled_count` | INTEGER | Yes | `0` | ≥ 0 | Current enrollments | Internal |
| `waitlist_count` | INTEGER | Yes | `0` | ≥ 0 | Waitlist size | Internal |
| `attended_count` | INTEGER | Yes | `0` | ≥ 0 | Attendance (per Part 12) | Internal |
| `completed_count` | INTEGER | Yes | `0` | ≥ 0 | Completion (per Part 12) | Internal |
| `completion_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Completion % | Internal |
| `program_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total cost | Confidential |
| `cost_per_participant` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Per-head cost | Confidential |
| `feedback_score` | DECIMAL(3,2) | No | NULL | 0-5 | Participant feedback | Internal |
| `certificate_issued` | BOOLEAN | Yes | `false` | — | Certificates issued | Internal |
| `cancellation_reason` | TEXT | No | NULL | — | If cancelled | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SCHEDULED, ENROLLMENT_OPEN, IN_PROGRESS, COMPLETED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Course Master (471) | Many-to-Many | N:N | Via course_ids |
| Workforce Master (381) | Many-to-One | N:1 | Instructor |
| Training Attendance (478) | One-to-Many | 1:N | Per-employee attendance |
| Learning Assignment (476) | One-to-Many | 1:N | Assignments |
| Learning History (479) | One-to-Many | 1:N | Completion records |

### 6. Indexes
- UNIQUE (`program_code`)
- INDEX (`instructor_id`, `schedule_start_date`)
- INDEX (`department_id`, `status`)
- INDEX (`schedule_start_date`, `status`)
- GIN INDEX (`course_ids`)

### 7. Security Classification
**Internal** — cost data is **Confidential**.

### 8. Integration Points
- **LMS Engine** (FS-23): Scheduling + enrollment
- **Workforce Scheduling Engine** (FS-20): Conflict detection
- **Notification Service**: Reminders to participants
- **Calendar Service**: Add to employee calendars
- **ESS Portal**: Browse + enroll
- **MSS Portal**: Manager nominate team
- **Vendor Integration**: External trainer coordination

### 9. Sample Data
```json
{
  "program_code": "PRG-FSSAI-2026-04", "program_name": "FSSAI Refresher Training April 2026",
  "course_ids": ["crs-fssai-001", "crs-fssai-002"],
  "instructor_id": "wf-300", "department_id": "dept-mfg",
  "target_audience": "SPECIFIC_DEPT",
  "schedule_start_date": "2026-04-15", "schedule_end_date": "2026-04-16",
  "venue_type": "CLASSROOM", "min_capacity": 10, "max_capacity": 25,
  "enrolled_count": 22, "attended_count": 21, "completed_count": 20,
  "completion_rate_pct": 90.91, "feedback_score": 4.5,
  "status": "COMPLETED"
}
```

### 10. Audit Events
`PROGRAM_DRAFTED`, `PROGRAM_SCHEDULED`, `PROGRAM_ENROLLMENT_OPENED`, `PROGRAM_STARTED`, `PROGRAM_COMPLETED`, `PROGRAM_CANCELLED`, `PROGRAM_CERTIFICATES_ISSUED`

---

## Entity 473 — Skills Matrix

### 1. Business Purpose
Per Part 12 §10: Supports Technical, Soft Skills, Compliance, Leadership, Safety, Machine Skills. Maps employee skills to role requirements.

### 2. Architectural Role
Assessment + gap-analysis entity — per-employee per-skill rating. Drives training recommendations and succession planning.

### 3. Business Rules
- Skill categories per Part 12: TECHNICAL, SOFT_SKILLS, COMPLIANCE, LEADERSHIP, SAFETY, MACHINE_SKILLS
- Each skill has 4 levels: BEGINNER (1), INTERMEDIATE (2), ADVANCED (3), EXPERT (4)
- Required level: defined per role (Position Master)
- Current level: from latest Competency Assessment (475) or Certification (474)
- Gap = required − current (positive gap = development needed)
- AI gap-analysis: bulk skill gap reporting per department
- Successor planning: skill coverage matrix per critical role

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `matrix_code` | VARCHAR(40) | Yes | — | Unique per company × employee × skill | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `skill_id` | UUID | Yes | — | FK to `skill_masters` | Skill | Internal |
| `skill_name` | VARCHAR(200) | Yes | — | — | Denormalized | Internal |
| `skill_category` | ENUM | Yes | — | TECHNICAL, SOFT_SKILLS, COMPLIANCE, LEADERSHIP, SAFETY, MACHINE_SKILLS | Category (per Part 12) | Internal |
| `current_level` | INTEGER | Yes | — | 1-4 | Current level | Confidential |
| `current_level_label` | ENUM | Yes | — | BEGINNER, INTERMEDIATE, ADVANCED, EXPERT | Label | Internal |
| `required_level` | INTEGER | Yes | — | 1-4 | Required for role | Internal |
| `gap_level` | INTEGER | Yes | `0` | -3 to 3 | Required − current | Internal |
| `gap_status` | ENUM | Yes | `MEETS` | EXCEEDS, MEETS, GAP, CRITICAL_GAP | Status | Internal |
| `assessment_method` | ENUM | Yes | `MANAGER` | MANAGER, SELF, EXAMINATION, CERTIFICATION, OBSERVATION | Method | Internal |
| `last_assessment_date` | DATE | No | NULL | — | Last assessment | Internal |
| `last_assessed_by` | UUID | No | NULL | FK to `workforce_master` | Assessor | Confidential |
| `assessment_validity_months` | INTEGER | Yes | `12` | > 0 | Validity period | Internal |
| `expiry_date` | DATE | No | NULL | — | Expiry date | Internal |
| `linked_certification_id` | UUID | No | NULL | FK to `certifications` (Entity 474) | Linked certification | Internal |
| `linked_competency_id` | UUID | No | NULL | FK to `competency_matrix` (Entity 468) | Linked competency | Internal |
| `recommended_courses` | UUID[] | No | `ARRAY[]::UUID[]` | — | AI-recommended courses | Internal |
| `is_successor_critical` | BOOLEAN | Yes | `false` | — | Critical for successor planning | Restricted |
| `machine_id` | UUID | No | NULL | FK to `machines` (Part 13) | Machine (for MACHINE_SKILLS) | Internal |
| `line_id` | UUID | No | NULL | FK to `production_lines` | Production line | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, EXPIRED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Skill Master | Many-to-One | N:1 | Skill definition |
| Certification (474) | Many-to-One | N:1 | Linked certification |
| Competency Matrix (468) | Many-to-One | N:1 | Linked competency |
| Competency Assessment (475) | One-to-Many | 1:N | Assessment history |
| Course Master (471) | Many-to-Many | N:N | Via recommended_courses |

### 6. Indexes
- UNIQUE (`matrix_code`)
- INDEX (`employee_id`, `skill_category`, `status`)
- INDEX (`gap_status`, `skill_category`)
- INDEX (`is_successor_critical`)
- INDEX (`expiry_date`, `status`)

### 7. Security Classification
**Confidential** — skill levels per employee.

### 8. Integration Points
- **LMS Engine** (FS-23): Gap → training recommendations
- **AI Service**: Skill gap analysis, successor coverage
- **Competency Matrix** (468): Skill-to-competency mapping
- **Succession Planning** (506): Critical skill coverage
- **Workforce Scheduling Engine** (FS-20): Skill-based roster
- **MSS Portal**: Team skill matrix view

### 9. Sample Data
```json
{
  "matrix_code": "SM-wf001-forklift", "employee_id": "wf-001",
  "skill_name": "Forklift Operation", "skill_category": "MACHINE_SKILLS",
  "current_level": 3, "current_level_label": "ADVANCED",
  "required_level": 3, "gap_level": 0, "gap_status": "MEETS",
  "assessment_method": "CERTIFICATION",
  "last_assessment_date": "2026-01-15", "assessment_validity_months": 12,
  "expiry_date": "2027-01-14", "linked_certification_id": "cert-forklift",
  "is_successor_critical": false, "status": "ACTIVE"
}
```

### 10. Audit Events
`SKILL_ASSESSED`, `SKILL_LEVEL_UPDATED`, `SKILL_EXPIRED`, `SKILL_GAP_IDENTIFIED`, `SKILL_RECERTIFIED`

---

## Entity 474 — Certification

### 1. Business Purpose
Per Part 12 §10: Stores Certificate, Expiry, Renewal, Authority. External and internal certifications management.

### 2. Architectural Role
Master + per-employee transaction entity — defines cert types (master) and per-employee cert instances (transactions). Drives compliance reporting and renewal alerts.

### 3. Business Rules
- Certifications per Part 12: certificate name, expiry, renewal cycle, certifying authority
- Mandatory certifications: FSSAI, Forklift License, Fire Safety, First Aid, HACCP
- Expiry alerts: 90/60/30/7 days before expiry
- Renewal workflow: auto-assignment of renewal course 90 days before expiry
- Authority: FSSAI, RTO, NSDC, ISO, Internal
- Document storage: certificate PDF + photo
- Verification: HR verifies authenticity (especially external certs)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `certification_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `certification_name` | VARCHAR(200) | Yes | — | Min 5 | Certificate (per Part 12: "Certificate") | Internal |
| `certification_type` | ENUM | Yes | — | STATUTORY, COMPLIANCE, TECHNICAL, SAFETY, QUALITY, PROFESSIONAL, INTERNAL | Type | Internal |
| `category` | ENUM | Yes | — | FOOD_SAFETY, MACHINE_OPERATION, FIRE_SAFETY, FIRST_AID, ISO, PROFESSIONAL, OTHER | Category | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `certifying_authority` | VARCHAR(200) | Yes | — | — | Authority (per Part 12: "Authority") | Internal |
| `authority_type` | ENUM | Yes | — | GOVERNMENT, INDUSTRY_BODY, INTERNAL, EXTERNAL | Authority type | Internal |
| `is_statutory` | BOOLEAN | Yes | `false` | — | Statutory mandate | Internal |
| `is_mandatory_for_roles` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Roles requiring this cert | Internal |
| `validity_months` | INTEGER | Yes | — | > 0 | Validity period | Internal |
| `renewal_required` | BOOLEAN | Yes | `true` | — | Renewal (per Part 12) | Internal |
| `renewal_window_days` | INTEGER | Yes | `90` | > 0 | Renewal window | Internal |
| `renewal_course_id` | UUID | No | NULL | FK to `course_master` (Entity 471) | Renewal course | Internal |
| `passing_score_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Pass threshold | Internal |
| `linked_competency_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Linked competencies | Internal |
| `linked_skill_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Linked skills | Internal |
| `cost_per_certification` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `applicable_countries` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Country applicability | Internal |
| `document_template_id` | UUID | No | NULL | FK to `document_templates` | Certificate template | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee Certification Instance | One-to-Many | 1:N | Per-employee certifications |
| Course Master (471) | Many-to-One | N:1 | Renewal course |
| Competency Matrix (468) | Many-to-Many | N:N | Via linked_competency_ids |
| Skills Matrix (473) | Many-to-Many | N:N | Via linked_skill_ids |
| Certification Authority (Vendor) | Many-to-One | N:1 | Certifying authority |

### 6. Indexes
- UNIQUE (`certification_code`)
- INDEX (`certification_type`, `is_statutory`, `status`)
- INDEX (`certifying_authority`)
- GIN INDEX (`is_mandatory_for_roles`)

### 7. Security Classification
**Internal** — cost is **Confidential**.

### 8. Integration Points
- **LMS Engine** (FS-23): Auto-renewal workflow
- **Notification Service**: Expiry alerts (90/60/30/7 days)
- **Compliance Reports**: Statutory certification reports
- **AI HR Copilot** (505): "Who has expired food safety training?"
- **Workforce Scheduling** (FS-20): Skill-based roster validation
- **ESS Portal**: View own certifications
- **MSS Portal**: Team certification status

### 9. Sample Data
```json
{
  "certification_code": "CERT-FSSAI", "certification_name": "FSSAI Food Safety License",
  "certification_type": "STATUTORY", "category": "FOOD_SAFETY",
  "certifying_authority": "Food Safety and Standards Authority of India",
  "authority_type": "GOVERNMENT", "is_statutory": true,
  "is_mandatory_for_roles": ["chef", "kitchen_helper", "production_operator", "qa_inspector"],
  "validity_months": 12, "renewal_required": true, "renewal_window_days": 90,
  "renewal_course_id": "crs-fssai-001", "passing_score_pct": 70.00,
  "cost_per_certification": 1500.0000, "status": "ACTIVE"
}
```

### 10. Audit Events
`CERTIFICATION_TYPE_CREATED`, `CERTIFICATION_TYPE_UPDATED`, `CERTIFICATION_AUTHORITY_CHANGED`, `CERTIFICATION_RENEWAL_COURSE_LINKED`

---

## Entity 475 — Competency Assessment

### 1. Business Purpose
Per Part 12 §10: Measures Beginner, Intermediate, Advanced, Expert. The actual assessment event for an employee's competency/skill.

### 2. Architectural Role
Transaction entity — creates skill rating that updates Skills Matrix (473). May be triggered by exam, manager review, or certification.

### 3. Business Rules
- Assessment levels per Part 12: BEGINNER (1), INTERMEDIATE (2), ADVANCED (3), EXPERT (4)
- Assessment methods: EXAMINATION, MANAGER_REVIEW, SELF_ASSESSMENT, CERTIFICATION, OBSERVATION, 360_FEEDBACK
- Calibration: manager assessment may differ from self-assessment; calibration resolves
- Validity: per competency (default 12 months)
- Re-assessment triggers: certification renewal, post-training, periodic
- Evidence: supporting documents (certificate, exam score, observation notes)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `assessment_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `assessor_id` | UUID | No | NULL | FK to `workforce_master` | Assessor (NULL for self/exam) | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `competency_id` | UUID | No | NULL | FK to `competency_matrix` (Entity 468) | Competency | Internal |
| `skill_id` | UUID | No | NULL | FK to `skill_masters` | Skill | Internal |
| `assessment_type` | ENUM | Yes | — | EXAMINATION, MANAGER_REVIEW, SELF_ASSESSMENT, CERTIFICATION, OBSERVATION, 360_FEEDBACK, PRACTICAL | Method | Internal |
| `assessment_date` | DATE | Yes | — | — | Assessment date | Internal |
| `previous_level` | INTEGER | No | NULL | 1-4 | Previous (per Part 12: "Measures") | Confidential |
| `assessed_level` | INTEGER | Yes | — | 1-4 | Assessed level | Confidential |
| `assessed_level_label` | ENUM | Yes | — | BEGINNER, INTERMEDIATE, ADVANCED, EXPERT | Label | Internal |
| `self_rated_level` | INTEGER | No | NULL | 1-4 | Self-rating | Confidential |
| `manager_rated_level` | INTEGER | No | NULL | 1-4 | Manager rating | Confidential |
| `calibrated_level` | INTEGER | No | NULL | 1-4 | Calibrated | Confidential |
| `score_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Exam score | Confidential |
| `evidence_attachment_ids` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Evidence documents | Confidential |
| `assessment_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `strengths_demonstrated` | TEXT | No | NULL | — | Strengths | Confidential |
| `development_areas` | TEXT | No | NULL | — | Dev areas | Confidential |
| `linked_examination_id` | UUID | No | NULL | FK to `examinations` (Entity 477) | Linked exam | Internal |
| `linked_certification_id` | UUID | No | NULL | FK to `certifications` (Entity 474) | Linked certification | Internal |
| `linked_course_id` | UUID | No | NULL | FK to `course_master` (Entity 471) | Triggered by course | Internal |
| `validity_months` | INTEGER | Yes | `12` | > 0 | Validity | Internal |
| `expiry_date` | DATE | Yes | — | — | Expiry | Internal |
| `skills_matrix_updated` | BOOLEAN | Yes | `false` | — | Posted to Skills Matrix | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, DISPUTED, SUPERSEDED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Workforce Master (381) | Many-to-One | N:1 | Assessor |
| Competency Matrix (468) | Many-to-One | N:1 | Competency |
| Skills Matrix (473) | One-to-Many | 1:N | Updates skills matrix |
| Examination (477) | Many-to-One | N:1 | Linked exam |
| Certification (474) | Many-to-One | N:1 | Linked certification |
| Course Master (471) | Many-to-One | N:1 | Trigger course |

### 6. Indexes
- UNIQUE (`assessment_code`)
- INDEX (`employee_id`, `assessment_date`)
- INDEX (`competency_id`, `assessed_level`)
- INDEX (`expiry_date`, `status`)

### 7. Security Classification
**Confidential** — assessment data per employee.

### 8. Integration Points
- **LMS Engine** (FS-23): Assessment execution
- **Performance Engine** (FS-22): Assessment feeds performance review
- **Skills Matrix** (473): Level update
- **AI Service**: Skill trend analysis
- **Notification Service**: Assessment result notification

### 9. Sample Data
```json
{
  "assessment_code": "ASMT-2026-00078", "employee_id": "wf-001",
  "assessor_id": "wf-100", "competency_id": "comp-food-safety",
  "assessment_type": "CERTIFICATION", "assessment_date": "2026-01-15",
  "previous_level": 2, "assessed_level": 3, "assessed_level_label": "ADVANCED",
  "score_pct": 85.00, "linked_certification_id": "cert-fssai",
  "validity_months": 12, "expiry_date": "2027-01-14",
  "skills_matrix_updated": true, "status": "COMPLETED"
}
```

### 10. Audit Events
`COMPETENCY_ASSESSED`, `COMPETENCY_LEVEL_UPDATED`, `COMPETENCY_DISPUTED`, `COMPETENCY_RECERTIFIED`, `COMPETENCY_EXPIRED`

---

## Entity 476 — Learning Assignment

### 1. Business Purpose
Per Part 12 §10: Assigns Courses, Training, Assessments, Videos, Reading. Tracks learning assignments to employees.

### 2. Architectural Role
Transaction entity — links employees to learning content. Drives notifications, deadlines, and completion tracking.

### 3. Business Rules
- Assignment sources: MANAGER (manual), SYSTEM (auto from skill gap), COMPLIANCE (mandatory), SELF (employee-initiated)
- Deadline: configurable per assignment
- Reminder cadence: 7/3/1 days before deadline
- Auto-escalation: overdue assignments escalate to manager
- Compliance assignments: cannot be declined; overdue = compliance violation
- Multiple assignments per employee allowed

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `assignment_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `assigner_id` | UUID | No | NULL | FK to `workforce_master` | Assigner (NULL for system) | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `assignment_type` | ENUM | Yes | — | COURSE, TRAINING_PROGRAM, ASSESSMENT, VIDEO, READING, CERTIFICATION, LEARNING_PATH | Type (per Part 12) | Internal |
| `assigned_item_id` | UUID | Yes | — | — | Course/Program/Assessment ID | Internal |
| `assigned_item_name` | VARCHAR(200) | Yes | — | — | Denormalized | Internal |
| `assignment_source` | ENUM | Yes | — | MANAGER, SYSTEM, COMPLIANCE, SELF, SUCCESSION_PLAN, SKILL_GAP | Source | Internal |
| `priority` | ENUM | Yes | `MEDIUM` | LOW, MEDIUM, HIGH, URGENT | Priority | Internal |
| `is_mandatory` | BOOLEAN | Yes | `false` | — | Mandatory | Internal |
| `is_compliance_critical` | BOOLEAN | Yes | `false` | — | Compliance-critical | Internal |
| `assigned_date` | DATE | Yes | `now()` | — | Assignment date | Internal |
| `due_date` | DATE | Yes | — | > assigned_date | Deadline | Internal |
| `started_date` | DATE | No | NULL | — | Started | Internal |
| `completion_date` | DATE | No | NULL | — | Completed | Internal |
| `progress_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Progress | Internal |
| `score_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Score (if assessment) | Confidential |
| `time_spent_minutes` | INTEGER | Yes | `0` | ≥ 0 | Time spent | Internal |
| `reminders_sent` | INTEGER | Yes | `0` | ≥ 0 | Reminder count | Internal |
| `escalated_to_manager` | BOOLEAN | Yes | `false` | — | Escalated | Internal |
| `linked_skill_id` | UUID | No | NULL | FK to `skill_masters` | Linked skill | Internal |
| `linked_competency_id` | UUID | No | NULL | FK to `competency_matrix` (Entity 468) | Linked competency | Internal |
| `linked_gap_id` | UUID | No | NULL | FK to `skills_matrix` (Entity 473) | Source gap | Internal |
| `rejection_reason` | TEXT | No | NULL | — | If employee declined | Confidential |
| `status` | ENUM | Yes | `ASSIGNED` | ASSIGNED, STARTED, IN_PROGRESS, COMPLETED, FAILED, EXPIRED, DECLINED, WITHDRAWN | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Workforce Master (381) | Many-to-One | N:1 | Assigner |
| Course Master (471) | Many-to-One | N:1 | Course assignment |
| Training Program (472) | Many-to-One | N:1 | Program assignment |
| Examination (477) | Many-to-One | N:1 | Assessment assignment |
| Learning History (479) | One-to-One | 1:1 | On completion |

### 6. Indexes
- UNIQUE (`assignment_code`)
- INDEX (`employee_id`, `status`)
- INDEX (`due_date`, `status`)
- INDEX (`is_compliance_critical`, `status`)
- INDEX (`assignment_source`)

### 7. Security Classification
**Confidential** — employee learning data.

### 8. Integration Points
- **LMS Engine** (FS-23): Assignment tracking
- **Notification Service**: Reminders + escalation
- **Workforce Scheduling Engine** (FS-20): Training time allocation in roster
- **ESS Portal**: Employee assignment list
- **MSS Portal**: Manager team assignments
- **Compliance Reports**: Overdue compliance assignments

### 9. Sample Data
```json
{
  "assignment_code": "ASG-2026-00456", "employee_id": "wf-001",
  "assigner_id": "wf-100", "assignment_type": "COURSE",
  "assigned_item_id": "crs-fssai-001", "assigned_item_name": "FSSAI Food Safety Certification",
  "assignment_source": "COMPLIANCE", "priority": "HIGH",
  "is_mandatory": true, "is_compliance_critical": true,
  "assigned_date": "2026-01-01", "due_date": "2026-02-15",
  "started_date": "2026-01-10", "progress_pct": 60.00,
  "reminders_sent": 2, "status": "IN_PROGRESS"
}
```

### 10. Audit Events
`LEARNING_ASSIGNED`, `LEARNING_STARTED`, `LEARNING_PROGRESS_UPDATED`, `LEARNING_COMPLETED`, `LEARNING_FAILED`, `LEARNING_EXPIRED`, `LEARNING_DECLINED`, `LEARNING_ESCALATED`

---

## Entity 477 — Examination

### 1. Business Purpose
Per Part 12 §10: Supports MCQ, Practical, Online, Offline. Examination management for assessments and certifications.

### 2. Architectural Role
Transaction entity — exam instances with question paper, attempt tracking, scoring, and result. Generates certificates on pass.

### 3. Business Rules
- Exam types per Part 12: MCQ, PRACTICAL, ONLINE, OFFLINE, ORAL, PROJECT
- Question bank: per course, with difficulty levels and tags
- Randomization: questions + options shuffled per attempt
- Proctoring: online exams with webcam monitoring (AI proctor)
- Pass criteria: score ≥ passing_score_pct, no negative marking unless configured
- Retake policy: per course (default 3 attempts, 24-hour cooldown)
- Result publication: immediate for MCQ; manual for practical/project

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `examination_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `examination_name` | VARCHAR(200) | Yes | — | Min 5 | Name | Internal |
| `course_id` | UUID | No | NULL | FK to `course_master` (Entity 471) | Linked course | Internal |
| `certification_id` | UUID | No | NULL | FK to `certifications` (Entity 474) | Linked certification | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `exam_type` | ENUM | Yes | — | MCQ, PRACTICAL, ONLINE, OFFLINE, ORAL, PROJECT, BLENDED | Type (per Part 12) | Internal |
| `total_questions` | INTEGER | Yes | — | > 0 | Question count | Internal |
| `total_marks` | DECIMAL(7,2) | Yes | — | > 0 | Total marks | Internal |
| `duration_minutes` | INTEGER | Yes | — | > 0 | Duration | Internal |
| `passing_score_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Pass threshold | Internal |
| `negative_marking_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Negative marking | Internal |
| `max_attempts` | INTEGER | Yes | `3` | > 0 | Max attempts | Internal |
| `cooldown_hours` | INTEGER | Yes | `24` | ≥ 0 | Cooldown between attempts | Internal |
| `question_bank_id` | UUID | No | NULL | FK to `question_banks` | Question bank | Confidential |
| `question_paper_config` | JSONB | Yes | `'{}'` | — | Randomization + selection config | Confidential |
| `proctoring_required` | BOOLEAN | Yes | `false` | — | Online proctoring | Internal |
| `proctoring_type` | ENUM | No | NULL | AI_WEBCAM, HUMAN_REMOTE, IN_PERSON, NONE | Proctor type | Internal |
| `scheduled_start` | TIMESTAMPTZ | No | NULL | — | Scheduled start | Internal |
| `scheduled_end` | TIMESTAMPTZ | No | NULL | > scheduled_start | Scheduled end | Internal |
| `venue_id` | UUID | No | NULL | FK to `facilities` | Venue (offline exams) | Internal |
| `instructor_id` | UUID | No | NULL | FK to `workforce_master` | Invigilator | Internal |
| `attempts_count` | INTEGER | Yes | `0` | ≥ 0 | Total attempts | Internal |
| `passed_count` | INTEGER | Yes | `0` | ≥ 0 | Passed count | Internal |
| `failed_count` | INTEGER | Yes | `0` | ≥ 0 | Failed count | Internal |
| `pass_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Pass rate | Internal |
| `avg_score_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Average score | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SCHEDULED, ACTIVE, COMPLETED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Course Master (471) | Many-to-One | N:1 | Course |
| Certification (474) | Many-to-One | N:1 | Certification |
| Question Bank | Many-to-One | N:1 | Questions |
| Exam Attempt | One-to-Many | 1:N | Per-employee attempts |
| Competency Assessment (475) | One-to-Many | 1:N | Triggers assessment |
| Learning Assignment (476) | One-to-Many | 1:N | Assessment assignments |

### 6. Indexes
- UNIQUE (`examination_code`)
- INDEX (`course_id`, `status`)
- INDEX (`certification_id`, `status`)
- INDEX (`scheduled_start`, `status`)

### 7. Security Classification
**Internal** — question paper config is **Confidential**.

### 8. Integration Points
- **LMS Engine** (FS-23): Exam execution + scoring
- **AI Proctor Service**: Webcam-based proctoring
- **Notification Service**: Exam reminders
- **Certificate Generator**: Auto-issue on pass
- **Competency Assessment** (475): Updates competency level

### 9. Sample Data
```json
{
  "examination_code": "EXAM-FSSAI-2026-04", "examination_name": "FSSAI Certification Exam April 2026",
  "course_id": "crs-fssai-001", "certification_id": "cert-fssai",
  "exam_type": "MCQ", "total_questions": 50, "total_marks": 50.00,
  "duration_minutes": 60, "passing_score_pct": 70.00,
  "max_attempts": 3, "cooldown_hours": 24,
  "proctoring_required": true, "proctoring_type": "AI_WEBCAM",
  "scheduled_start": "2026-04-20T10:00:00Z", "scheduled_end": "2026-04-20T11:00:00Z",
  "attempts_count": 22, "passed_count": 20, "failed_count": 2,
  "pass_rate_pct": 90.91, "avg_score_pct": 82.50,
  "status": "COMPLETED"
}
```

### 10. Audit Events
`EXAM_SCHEDULED`, `EXAM_ATTEMPT_STARTED`, `EXAM_ATTEMPT_SUBMITTED`, `EXAM_PROCTOR_FLAGGED`, `EXAM_RESULT_PUBLISHED`, `EXAM_CERTIFICATE_ISSUED`

---

## Entity 478 — Training Attendance

### 1. Business Purpose
Per Part 12 §10: Tracks Present, Absent, Score, Completion. Per-employee attendance for training programs.

### 2. Architectural Role
Transaction entity — per-employee per-program-session attendance. Drives completion certification and payroll (training time as paid hours).

### 3. Business Rules
- Attendance types per Part 12: PRESENT, ABSENT, LATE, EXCUSED
- Minimum 80% attendance required for completion
- Late: arrival > 15 min late marked as LATE (3 lates = 1 absent)
- Excused: pre-approved absence (work emergency, medical)
- Score: assessment score for the training
- Completion: based on attendance + score
- Payroll: training time is paid time; non-attendance requires regularization

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `attendance_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `training_program_id` | UUID | Yes | — | FK to `training_programs` (Entity 472) | Program | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `enrollment_id` | UUID | No | NULL | FK to `learning_assignments` (Entity 476) | Source enrollment | Internal |
| `sessions_total` | INTEGER | Yes | — | > 0 | Total sessions | Internal |
| `sessions_present` | INTEGER | Yes | `0` | ≥ 0 | Present (per Part 12) | Internal |
| `sessions_absent` | INTEGER | Yes | `0` | ≥ 0 | Absent (per Part 12) | Internal |
| `sessions_late` | INTEGER | Yes | `0` | ≥ 0 | Late count | Internal |
| `sessions_excused` | INTEGER | Yes | `0` | ≥ 0 | Excused count | Internal |
| `attendance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Attendance % | Internal |
| `meets_minimum_attendance` | BOOLEAN | Yes | `false` | — | ≥ 80% | Internal |
| `assessment_score_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Score (per Part 12) | Confidential |
| `passed_assessment` | BOOLEAN | Yes | `false` | — | Assessment passed | Internal |
| `completion_status` | ENUM | Yes | `IN_PROGRESS` | IN_PROGRESS, COMPLETED, FAILED, INCOMPLETE, WITHDRAWN | Completion (per Part 12) | Internal |
| `certificate_issued` | BOOLEAN | Yes | `false` | — | Certificate issued | Internal |
| `certificate_id` | UUID | No | NULL | FK to `employee_certificates` | Certificate | Confidential |
| `feedback_submitted` | BOOLEAN | Yes | `false` | — | Feedback given | Internal |
| `feedback_score` | DECIMAL(3,2) | No | NULL | 0-5 | Feedback rating | Internal |
| `feedback_comments` | TEXT | No | NULL | — | Feedback text | Confidential |
| `payroll_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Paid training hours | Confidential |
| `payroll_posted` | BOOLEAN | Yes | `false` | — | Posted to payroll | Internal |
| `session_attendance_details` | JSONB | Yes | `'[]'` | — | Per-session attendance | Internal |
| `status` | ENUM | Yes | `ENROLLED` | ENROLLED, IN_PROGRESS, COMPLETED, FAILED, WITHDRAWN | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Training Program (472) | Many-to-One | N:1 | Program |
| Employee (381) | Many-to-One | N:1 | Employee |
| Learning Assignment (476) | Many-to-One | N:1 | Enrollment |
| Learning History (479) | One-to-One | 1:1 | History record |
| Payroll Processing (454) | Many-to-One | N:1 | Payroll impact |

### 6. Indexes
- UNIQUE (`attendance_code`)
- INDEX (`training_program_id`, `employee_id`)
- INDEX (`employee_id`, `completion_status`)
- INDEX (`completion_status`, `certificate_issued`)

### 7. Security Classification
**Confidential** — assessment scores per employee.

### 8. Integration Points
- **LMS Engine** (FS-23): Attendance tracking
- **Compensation Rules Engine** (Q161): Training hours → payroll
- **Certificate Generator**: Auto-issue on completion
- **Notification Service**: Attendance reminders
- **ESS Portal**: Employee attendance view
- **MSS Portal**: Manager team attendance

### 9. Sample Data
```json
{
  "attendance_code": "TA-2026-00123", "training_program_id": "prg-fssai-2026-04",
  "employee_id": "wf-001", "sessions_total": 4,
  "sessions_present": 4, "sessions_absent": 0, "sessions_late": 0,
  "attendance_pct": 100.00, "meets_minimum_attendance": true,
  "assessment_score_pct": 85.00, "passed_assessment": true,
  "completion_status": "COMPLETED", "certificate_issued": true,
  "feedback_submitted": true, "feedback_score": 4.50,
  "payroll_hours": 8.00, "status": "COMPLETED"
}
```

### 10. Audit Events
`TRAINING_ATTENDANCE_MARKED`, `TRAINING_ATTENDANCE_UPDATED`, `TRAINING_COMPLETED`, `TRAINING_FAILED`, `TRAINING_CERTIFICATE_ISSUED`, `TRAINING_WITHDRAWN`

---

## Entity 479 — Learning History

### 1. Business Purpose
Per Part 12 §10: Stores Completed, Failed, Expired, Renewed. Lifetime learning record per employee.

### 2. Architectural Role
Append-only historical record — never modified. Source of truth for compliance audits and career progression analysis.

### 3. Business Rules
- Records are append-only (immutable)
- Lifetime retention (7+ years for compliance courses)
- Status: COMPLETED, FAILED, EXPIRED, RENEWED, WITHDRAWN
- Cross-references: links to course, program, exam, certificate
- Analytics: career progression, skill trend, compliance status
- Export: PDF transcript for employee/external

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `history_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `learning_type` | ENUM | Yes | — | COURSE, TRAINING_PROGRAM, ASSESSMENT, CERTIFICATION, WORKSHOP, LEARNING_PATH | Type | Internal |
| `item_id` | UUID | Yes | — | — | Course/Program/etc. ID | Internal |
| `item_code` | VARCHAR(30) | Yes | — | — | Denormalized code | Internal |
| `item_name` | VARCHAR(200) | Yes | — | — | Denormalized name | Internal |
| `category` | VARCHAR(50) | No | NULL | — | Course category | Internal |
| `started_date` | DATE | Yes | — | — | Start date | Internal |
| `completed_date` | DATE | No | NULL | — | Completion date | Internal |
| `duration_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Actual duration | Internal |
| `score_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Score | Confidential |
| `outcome` | ENUM | Yes | — | COMPLETED, FAILED, EXPIRED, RENEWED, WITHDRAWN, IN_PROGRESS | Outcome (per Part 12) | Internal |
| `certificate_issued` | BOOLEAN | Yes | `false` | — | Certificate issued | Internal |
| `certificate_id` | UUID | No | NULL | FK to `employee_certificates` | Certificate reference | Confidential |
| `certificate_expiry_date` | DATE | No | NULL | — | Cert expiry | Internal |
| `credits_earned` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Credits | Internal |
| `cost_incurred` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `renewal_of_history_id` | UUID | No | NULL | FK to `learning_history` | Renewal link | Internal |
| `linked_competency_id` | UUID | No | NULL | FK to `competency_matrix` (Entity 468) | Competency impact | Internal |
| `linked_skill_id` | UUID | No | NULL | FK to `skill_masters` | Skill impact | Internal |
| `source_assignment_id` | UUID | No | NULL | FK to `learning_assignments` (Entity 476) | Source assignment | Internal |
| `source_attendance_id` | UUID | No | NULL | FK to `training_attendance` (Entity 478) | Source attendance | Internal |
| `transcript_included` | BOOLEAN | Yes | `true` | — | Included in transcript | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, ARCHIVED, DISPUTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Course Master (471) | Polymorphic | N:1 | Item reference |
| Training Program (472) | Polymorphic | N:1 | Item reference |
| Learning Assignment (476) | Many-to-One | N:1 | Source |
| Training Attendance (478) | Many-to-One | N:1 | Source |
| Learning History (self) | Self-reference | N:1 | Renewal link |

### 6. Indexes
- UNIQUE (`history_code`)
- INDEX (`employee_id`, `completed_date`)
- INDEX (`outcome`, `category`)
- INDEX (`certificate_expiry_date`, `outcome`)
- INDEX (`learning_type`, `item_id`)

### 7. Security Classification
**Confidential** — lifetime employee learning data.

### 8. Integration Points
- **LMS Engine** (FS-23): History aggregation
- **Compliance Reports**: Audit trail for statutory training
- **AI Service**: Career path analysis, learning forecast
- **ESS Portal**: Employee transcript view
- **MSS Portal**: Manager team history
- **Talent Review** (469): Learning investment per employee

### 9. Sample Data
```json
{
  "history_code": "LH-2026-01234", "employee_id": "wf-001",
  "learning_type": "CERTIFICATION", "item_id": "cert-fssai",
  "item_name": "FSSAI Food Safety License",
  "category": "FOOD_SAFETY",
  "started_date": "2026-01-01", "completed_date": "2026-01-15",
  "duration_hours": 8.00, "score_pct": 85.00,
  "outcome": "COMPLETED", "certificate_issued": true,
  "certificate_expiry_date": "2027-01-14",
  "credits_earned": 8.00, "cost_incurred": 1500.0000,
  "transcript_included": true, "status": "RECORDED"
}
```

### 10. Audit Events
`LEARNING_HISTORY_RECORDED`, `LEARNING_HISTORY_ARCHIVED`, `LEARNING_HISTORY_DISPUTED`, `LEARNING_CERTIFICATE_EXPIRED`, `LEARNING_CERTIFICATE_RENEWED`

---

## Entity 480 — LMS Dashboard

### 1. Business Purpose
Per Part 12 §10: Displays Courses, Completion, Certificates, Skill Gap, Compliance. AI: Skill Recommendation, Training Recommendation, Successor Planning, Career Path, Learning Forecast.

### 2. Architectural Role
Aggregated view entity — powers ESS, MSS, and HR Mission Control LMS views. AI insights refreshed daily.

### 3. Business Rules
- Snapshot-based: refreshed daily + on each completion
- Multi-grain: per-employee, per-team, per-department, per-company
- Compliance view: expiring certifications, overdue mandatory courses
- Skill gap view: per-department critical skill gaps
- AI insights: course recommendations, career path, learning forecast
- Career path: AI-suggested next roles + required learning

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `snapshot_type` | ENUM | Yes | — | EMPLOYEE, TEAM, DEPARTMENT, COMPANY | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity reference | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `total_courses_available` | INTEGER | Yes | `0` | ≥ 0 | Courses (per Part 12) | Internal |
| `total_enrollments` | INTEGER | Yes | `0` | ≥ 0 | Active enrollments | Internal |
| `completion_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Completion (per Part 12) | Internal |
| `active_certificates_count` | INTEGER | Yes | `0` | ≥ 0 | Active certs (per Part 12) | Internal |
| `expiring_certificates_count` | INTEGER | Yes | `0` | ≥ 0 | Expiring in 90 days | Internal |
| `expired_certificates_count` | INTEGER | Yes | `0` | ≥ 0 | Expired | Internal |
| `overdue_mandatory_courses` | INTEGER | Yes | `0` | ≥ 0 | Overdue | Internal |
| `compliance_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Compliance (per Part 12) | Internal |
| `skill_gap_summary` | JSONB | Yes | `'{}'` | — | Skill Gap (per Part 12) | Confidential |
| `critical_skill_gaps` | JSONB | Yes | `'[]'` | — | Critical gaps | Restricted |
| `training_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | YTD training cost | Confidential |
| `training_hours_total` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | YTD training hours | Internal |
| `avg_training_hours_per_employee` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Avg hours | Internal |
| `top_completed_courses` | JSONB | Yes | `'[]'` | — | Popular courses | Internal |
| `skill_recommendation` | JSONB | No | NULL | — | AI: skill recommendations (per Part 12 AI) | Confidential |
| `training_recommendation` | JSONB | No | NULL | — | AI: course recommendations (per Part 12 AI) | Confidential |
| `successor_planning_coverage` | JSONB | No | NULL | — | AI: successor coverage (per Part 12 AI) | Restricted |
| `career_path_suggestions` | JSONB | No | NULL | — | AI: career paths (per Part 12 AI) | Confidential |
| `learning_forecast` | JSONB | No | NULL | — | AI: next-quarter forecast (per Part 12 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh timestamp | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model version | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Workforce Master (381) | Many-to-One | N:1 | Employee (EMPLOYEE grain) |

### 6. Indexes
- UNIQUE (`snapshot_date`, `snapshot_type`, `entity_id`)
- INDEX (`company_id`, `snapshot_date`)
- INDEX (`ai_insights_generated_at`)

### 7. Security Classification
**Confidential** — skill gaps and successor coverage are **Restricted**.

### 8. Integration Points
- **BI Service**: LMS dashboards
- **AI/ML Service**: Recommendations + forecasts
- **HR Mission Control** (509): LMS panel
- **ESS Portal**: Employee learning dashboard
- **MSS Portal**: Team learning view
- **Succession Planning** (506): Coverage analysis
- **Workforce Planning** (503): Skill forecast

### 9. Sample Data
```json
{
  "snapshot_date": "2026-07-07", "snapshot_type": "COMPANY",
  "entity_id": "cmp-001", "company_id": "cmp-001",
  "total_courses_available": 245, "total_enrollments": 580,
  "completion_rate_pct": 78.50, "active_certificates_count": 420,
  "expiring_certificates_count": 28, "expired_certificates_count": 5,
  "overdue_mandatory_courses": 12, "compliance_rate_pct": 96.20,
  "training_cost_total": 850000.0000, "training_hours_total": 4500.00,
  "avg_training_hours_per_employee": 18.00,
  "ai_insights_generated_at": "2026-07-07T02:00:00Z",
  "ai_model_version": "v3.2.0", "status": "COMPLETED"
}
```

### 10. Audit Events
`LMS_DASHBOARD_SNAPSHOT_CREATED`, `LMS_DASHBOARD_AI_REFRESHED`, `LMS_DASHBOARD_STALE_DETECTED`, `LMS_DASHBOARD_COMPLIANCE_ALERT`

---

## Part 12 Sections 9-10 Completion Summary

**All 20 Performance & LMS entities are now defined** at full enterprise-grade depth.

### Architectural Decisions Locked

1. **Enterprise Performance Engine (FS-22)** — Foundation Service for KPI/OKR/360/calibration
2. **Enterprise LMS (FS-23)** — Foundation Service for courses/skills/certifications
3. **KPI Library** — Cross-domain KPI catalog (Sales/Production/Warehouse/Retail/Restaurant/HR/Finance/Quality)
4. **OKR Framework** — Cascading OKRs from company → BU → department → employee
5. **Performance Review** — Multi-type (Monthly/Quarterly/Half-Yearly/Annual/Probation) with calibration
6. **360 Feedback** — Multi-rater (Manager/Peer/Self/Subordinate/Customer) with anonymity
7. **Appraisal Cycle** — Forced ranking + salary impact matrix
8. **Promotion Recommendation** — Multi-level approval workflow
9. **PIP** — Structured 30/60/90-day improvement plan with legal documentation
10. **Competency Matrix** — 6 categories × 4 levels framework
11. **Talent Review** — 9-box grid + retention risk + successor readiness
12. **Performance Dashboard** — AI-powered insights (promotion/attrition/skill/successor/forecast)
13. **Course Master** — Multi-type (Internal/External/Video/PDF/Workshop/Practical)
14. **Training Program** — Cohort-based with scheduling + attendance
15. **Skills Matrix** — 6 categories with gap analysis
16. **Certification** — Statutory + professional with renewal workflow
17. **Competency Assessment** — Multi-method assessment with calibration
18. **Learning Assignment** — Multi-source (Manager/System/Compliance/Self)
19. **Examination** — MCQ/Practical/Online/Offline with AI proctoring
20. **Training Attendance** — 80% minimum + payroll integration
21. **Learning History** — Append-only lifetime transcript
22. **LMS Dashboard** — AI insights (skill/training/successor/career/forecast)

### Foundation Service Count Update

- **Previous**: 21 Foundation Services (FS-1 through FS-21)
- **Added in Part 12 Batch 4 (Sec 9-10)**: FS-22 (Performance Engine), FS-23 (LMS)
- **Current Total**: 23 Foundation Services

---

*End of Manual 1 Part 12 Sections 9-10. Continue with Sections 11-13 (ESS, MSS, HR Analytics) in next file.*

# Manual 1 · Part 12 · Sections 9-13 · Entities 461-510 — Performance, LMS, ESS, MSS & HR Analytics

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 12 — Enterprise Workforce Management (EWM) |
| Sections | 9 (Performance Management), 10 (LMS, Skills Matrix & Certifications), 11 (ESS), 12 (MSS), 13 (HR Analytics, AI HR Copilot & HR Mission Control) |
| Entities | 461–510 |
| Version | 1.0.0 |
| Status | ACTIVE — LOCKED — PART 12 COMPLETE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 9 §9.7, Part 12 §9-13 |
| Last Updated | 2026-07-08 |

---

## Overview — Performance → Learning → Self-Service → Analytics Pipeline

Sections 9-13 complete the **talent development → employee experience → executive intelligence** pipeline:

```
PERFORMANCE (Sec 9: 461-470)
  Company Goals → BU Goals → Dept Goals → Employee KPIs → OKRs → Reviews → 360 → Calibration → Promotion → Compensation
  ↓ Triggers
LEARNING (Sec 10: 471-480)
  Course Master → Training Program → Skills Matrix → Certification → Assessment → Assignment → Exam → Attendance → History
  ↓ Empowered by
SELF-SERVICE (Sec 11: 481-490)
  ESS: Payslip, Leave, Attendance, Expense, Loan, Profile, Documents, Training, Dashboard
  ↓ Managed via
MANAGER SELF-SERVICE (Sec 12: 491-500)
  MSS: Approvals (Attendance/Leave/Expense/Recruitment/Performance/Transfer/Promotion), Analytics, KPI Dashboard
  ↓ Aggregated into
HR ANALYTICS (Sec 13: 501-510)
  HR KPI Library → Dashboard → Workforce Planning → Attrition Prediction → AI HR Copilot → Succession → Heat Map → Cost Analytics → Mission Control → Executive Scorecard
```

### Architectural Lock Summary (Part 12 Complete)

| Architecture Component | Section | Status |
|---|---|---|
| Enterprise Performance Engine | Sec 9 | LOCKED |
| Enterprise LMS | Sec 10 | LOCKED |
| ESS Platform | Sec 11 | LOCKED |
| MSS Platform | Sec 12 | LOCKED |
| Enterprise Workforce Intelligence | Sec 13 | LOCKED |
| AI HR Copilot | Sec 13 | LOCKED |
| Workforce Planning | Sec 13 | LOCKED |
| HR Mission Control | Sec 13 | LOCKED |
| Talent Intelligence | Sec 13 | LOCKED |
| Skills Intelligence | Sec 13 | LOCKED |
| Complete Audit Trail | All | LOCKED |

---

# SECTION 9: Performance Management, KPI, OKRs & Appraisals (Entities 461-470)

## Entity 461 — KPI Library

### 1. Business Purpose
Per Part 12 §9: Centralized library of Key Performance Indicators across all enterprise domains — Sales KPI, Production KPI, Warehouse KPI, Retail KPI, Restaurant KPI, HR KPI, Finance KPI, Quality KPI.

### 2. Architectural Role
Master entity — defines KPI templates that are instantiated per employee/team/department. KPIs cascade from company → BU → department → employee, ensuring strategic alignment.

### 3. Business Rules
- KPI is reusable — one KPI definition can be assigned to many employees
- KPI type categories align with operational modules (Sales, Production, Warehouse, Retail, Restaurant, HR, Finance, Quality)
- Each KPI has a measurement formula (managed by Compensation Rules Engine Q161 for KPIs tied to variable pay)
- KPI frequency: DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
- KPI threshold types: TARGET (single value), RANGE (min-target-max), SLAB (tiered)
- Data source: integrated from operational modules via event bus (e.g., Production KPI pulls from MES, Sales KPI from Retail POS)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `kpi_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `kpi_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `kpi_category` | ENUM | Yes | — | SALES, PRODUCTION, WAREHOUSE, RETAIL, RESTAURANT, HR, FINANCE, QUALITY, SAFETY, COMPLIANCE | Category (per Part 12) | Internal |
| `kpi_subcategory` | VARCHAR(50) | No | NULL | — | Sub-category (e.g., "REVENUE", "OEE") | Internal |
| `description` | TEXT | Yes | — | Min 20 | Detailed description | Internal |
| `measurement_unit` | VARCHAR(20) | Yes | — | — | Unit (e.g., `INR`, `%`, `kg`, `units`, `hours`) | Internal |
| `measurement_direction` | ENUM | Yes | `HIGHER_BETTER` | HIGHER_BETTER, LOWER_BETTER, TARGET_VALUE | Optimization direction | Internal |
| `calculation_formula` | TEXT | No | NULL | — | Compensation Rules Engine formula | Confidential |
| `data_source` | ENUM | Yes | — | MANUAL, MES, POS, WMS, ERP, HRMS, FINANCE, EXTERNAL_API, COMPUTED | Data source | Internal |
| `data_source_config` | JSONB | No | NULL | — | Source configuration (query, API endpoint) | Confidential |
| `frequency` | ENUM | Yes | `MONTHLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY, HALF_YEARLY, YEARLY | Measurement frequency | Internal |
| `threshold_type` | ENUM | Yes | `TARGET` | TARGET, RANGE, SLAB | Threshold type | Internal |
| `target_value` | DECIMAL(18,4) | No | NULL | — | Target value (per Part 12) | Internal |
| `min_value` | DECIMAL(18,4) | No | NULL | — | Minimum acceptable (RANGE) | Internal |
| `max_value` | DECIMAL(18,4) | No | NULL | — | Maximum ceiling (RANGE) | Internal |
| `slab_config` | JSONB | No | NULL | — | Slab configuration (SLAB type) | Confidential |
| `weightage_default` | DECIMAL(5,2) | Yes | `10.00` | 0-100 | Default weightage when assigned | Internal |
| `is_cascadable` | BOOLEAN | Yes | `true` | — | Can cascade from org → employee | Internal |
| `is_linked_to_variable_pay` | BOOLEAN | Yes | `false` | — | KPI achievement drives variable pay | Confidential |
| `applicable_grade_levels` | UUID[] | No | `ARRAY[]::UUID[]` | — | Applicable grades | Internal |
| `applicable_departments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Applicable departments | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| OKR Master (462) | Many-to-Many | N:N | KPIs feed Key Results |
| Performance Review (463) | One-to-Many | 1:N | Reviews against KPIs |
| Employee KPI Assignment | One-to-Many | 1:N | Per-employee instances |
| Compensation Rules Engine (Q161) | Service | — | Formula execution |

### 6. Indexes
- UNIQUE (`kpi_code`)
- INDEX (`kpi_category`, `status`)
- INDEX (`frequency`, `status`)
- GIN INDEX (`applicable_grade_levels`)
- GIN INDEX (`applicable_departments`)

### 7. Security Classification
**Internal** — formulas and slab config are **Confidential**.

### 8. Integration Points
- **Compensation Rules Engine** (Q161): KPI computation for variable pay
- **MES** (Part 7): Production KPI data source
- **POS/WMS** (Parts 9/6): Sales/Warehouse KPI data source
- **Performance Review** (Entity 463): KPI-based evaluation
- **BI Service**: KPI dashboards

### 9. Sample Data
```json
{
  "kpi_code": "PROD-OEE", "kpi_name": "Overall Equipment Effectiveness",
  "kpi_category": "PRODUCTION", "measurement_unit": "%",
  "measurement_direction": "HIGHER_BETTER", "data_source": "MES",
  "frequency": "MONTHLY", "threshold_type": "TARGET",
  "target_value": 85.0000, "weightage_default": 20.00,
  "is_linked_to_variable_pay": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`KPI_LIBRARY_CREATED`, `KPI_LIBRARY_UPDATED`, `KPI_LIBRARY_DEPRECATED`, `KPI_FORMULA_CHANGED`, `KPI_THRESHOLD_CHANGED`

---

## Entity 462 — OKR Master

### 1. Business Purpose
Per Part 12 §9: Stores Objective, Key Results, Owner, Due Date, Weightage, Status. OKRs (Objectives & Key Results) provide qualitative-quantitative goal framework.

### 2. Architectural Role
Goal entity — cascades from company strategy to individual objectives. Each OKR has 3-5 Key Results (KRs) that are measurable outcomes.

### 3. Business Rules
- OKR cascade: Company OKR → BU OKR → Department OKR → Team OKR → Individual OKR
- Each OKR has 3-5 Key Results (industry best practice)
- Key Results are quantitative (0-100% achievement)
- OKR scoring: 0.7 = good (industry standard); 1.0 = stretch achieved
- OKRs are NOT used for performance rating (Google principle — OKRs are aspirational)
- OKR cadence: typically Quarterly; some companies use Monthly
- Alignment: individual OKRs must align with manager OKRs

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `okr_code` | VARCHAR(30) | Yes | — | Unique per company × period | Code | Internal |
| `objective` | TEXT | Yes | — | Min 20 | Objective (per Part 12: "Objective") — qualitative inspirational statement | Internal |
| `objective_type` | ENUM | Yes | — | COMPANY, BUSINESS_UNIT, DEPARTMENT, TEAM, INDIVIDUAL | OKR level | Internal |
| `owner_type` | ENUM | Yes | — | EMPLOYEE, TEAM, DEPARTMENT, COMPANY | Owner type | Internal |
| `owner_id` | UUID | Yes | — | — | Owner ID (employee/team/dept/company) | Confidential |
| `parent_okr_id` | UUID | No | NULL | FK to `okr_master` | Parent OKR (cascade) | Internal |
| `period_year` | INTEGER | Yes | — | 1900-9999 | Year | Internal |
| `period_quarter` | ENUM | No | NULL | Q1, Q2, Q3, Q4 | Quarter (NULL for annual) | Internal |
| `period_type` | ENUM | Yes | `QUARTERLY` | MONTHLY, QUARTERLY, HALF_YEARLY, YEARLY | OKR cadence | Internal |
| `key_results` | JSONB | Yes | `'[]'` | Array length 3-5 | Key Results (per Part 12: "Key Results") — each KR has: description, metric, baseline, target, current, weightage, due_date | Internal |
| `total_weightage` | DECIMAL(5,2) | Yes | `100.00` | = 100 | Total weightage across KRs | Internal |
| `due_date` | DATE | Yes | — | — | Due Date (per Part 12: "Due Date") | Internal |
| `achievement_score` | DECIMAL(4,2) | Yes | `0` | 0-1 | Final score (0.0-1.0); 0.7 = good | Internal |
| `achievement_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Percentage achievement | Internal |
| `alignment_okr_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Cross-team alignment | Internal |
| `is_stretch` | BOOLEAN | Yes | `true` | — | Stretch OKR (7-in-10 difficulty) | Internal |
| `is_committed` | BOOLEAN | Yes | `false` | — | Committed OKR (must achieve) | Internal |
| `self_assessment` | TEXT | No | NULL | — | Self-assessment at end of period | Confidential |
| `manager_assessment` | TEXT | No | NULL | — | Manager assessment | Confidential |
| `mid_quarter_review_done` | BOOLEAN | Yes | `false` | — | Mid-quarter review completed | Internal |
| `mid_quarter_review_notes` | TEXT | No | NULL | — | Mid-quarter notes | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, PUBLISHED, IN_PROGRESS, COMPLETED, EXPIRED, CANCELLED | Status (per Part 12: "Status") | Internal |
| `closure_notes` | TEXT | No | NULL | — | End-of-period closure notes | Confidential |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| KPI Library (461) | Many-to-Many | N:N | KRs reference KPIs |
| Performance Review (463) | One-to-Many | 1:N | Reviews include OKR achievement |
| Parent OKR (462) | Self-reference | N:1 | Cascade |
| Workforce Master (381) | Many-to-One | N:1 | Owner (individual) |

### 6. Indexes
- UNIQUE (`okr_code`)
- INDEX (`owner_type`, `owner_id`, `period_year`, `period_quarter`)
- INDEX (`parent_okr_id`)
- INDEX (`status`, `due_date`)
- GIN INDEX (`alignment_okr_ids`)

### 7. Security Classification
**Internal** — assessments are **Confidential**.

### 8. Integration Points
- **Performance Engine**: OKR achievement feeds Performance Review (E463)
- **Compensation Rules Engine** (Q161): OKR score → variable pay
- **ESS Portal** (E481): Employee OKR view
- **MSS Portal** (E491): Manager team OKR view
- **HR Mission Control** (E509): OKR rollup dashboard

### 9. Sample Data
```json
{
  "okr_code": "OKR-2026Q3-PROD-001", "objective": "Achieve world-class production efficiency at Mumbai plant",
  "objective_type": "DEPARTMENT", "owner_type": "DEPARTMENT", "owner_id": "dept-mfg-mum",
  "period_year": 2026, "period_quarter": "Q3", "period_type": "QUARTERLY",
  "key_results": [
    { "description": "OEE above 85%", "metric": "OEE %", "baseline": 78, "target": 85, "current": 82, "weightage": 30 },
    { "description": "Downtime below 5%", "metric": "Downtime %", "baseline": 8, "target": 5, "current": 6, "weightage": 25 },
    { "description": "First pass yield above 95%", "metric": "FPY %", "baseline": 91, "target": 95, "current": 94, "weightage": 25 },
    { "description": "Zero safety incidents", "metric": "Incident count", "baseline": 2, "target": 0, "current": 1, "weightage": 20 }
  ],
  "due_date": "2026-09-30", "is_stretch": true, "status": "IN_PROGRESS"
}
```

### 10. Audit Events
`OKR_DRAFTED`, `OKR_PUBLISHED`, `OKR_UPDATED`, `OKR_MID_QUARTER_REVIEWED`, `OKR_COMPLETED`, `OKR_EXPIRED`, `OKR_CANCELLED`

---

## Entity 463 — Performance Review

### 1. Business Purpose
Per Part 12 §9: Types — Monthly, Quarterly, Half-Yearly, Annual, Probation. Formal performance evaluation cycle for employees.

### 2. Architectural Role
Transaction entity — one review per employee per cycle. Aggregates KPI achievement, OKR scores, 360 feedback, manager assessment, and produces rating + recommendations.

### 3. Business Rules
- Review types: MONTHLY (continuous), QUARTERLY (OKR-driven), HALF_YEARLY (mid-year), ANNUAL (full-year), PROBATION (end-of-probation)
- Self-assessment → Manager assessment → Skip-level review → Calibration → Final rating
- Rating scale: 5-point (1=Below, 3=Meets, 5=Exceeds) or company-specific
- Calibration: HR + leadership review to ensure rating distribution fairness (typical: 10% exceeds, 70% meets, 20% below)
- Probation review: outcome = CONFIRM / EXTEND / TERMINATE
- Lock-in: once finalized, review cannot be edited — only via appeal

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `review_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` (Entity 381) | Employee | Confidential |
| `reviewer_id` | UUID | Yes | — | FK to `workforce_master` | Reporting manager | Confidential |
| `skip_level_reviewer_id` | UUID | No | NULL | FK to `workforce_master` | Skip-level | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `review_type` | ENUM | Yes | — | MONTHLY, QUARTERLY, HALF_YEARLY, ANNUAL, PROBATION | Type (per Part 12) | Internal |
| `review_period_start` | DATE | Yes | — | — | Period start | Internal |
| `review_period_end` | DATE | Yes | — | > start | Period end | Internal |
| `period_year` | INTEGER | Yes | — | 1900-9999 | Year | Internal |
| `period_quarter` | ENUM | No | NULL | Q1, Q2, Q3, Q4 | Quarter (if applicable) | Internal |
| `kpi_achievements` | JSONB | Yes | `'[]'` | — | Per-KPI score, target, actual, weightage | Confidential |
| `okr_achievements` | JSONB | Yes | `'[]'` | — | Per-OKR score, KRs status | Confidential |
| `kpi_overall_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | KPI weighted score | Confidential |
| `okr_overall_score` | DECIMAL(4,2) | Yes | `0` | 0-1 | OKR score (0.0-1.0) | Confidential |
| `competency_scores` | JSONB | Yes | `'{}'` | — | Per-competency rating (per Entity 468) | Confidential |
| `competency_overall_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Competency score | Confidential |
| `self_assessment` | TEXT | No | NULL | — | Employee self-assessment | Confidential |
| `manager_assessment` | TEXT | No | NULL | — | Manager assessment | Confidential |
| `skip_level_assessment` | TEXT | No | NULL | — | Skip-level review | Confidential |
| `strengths` | TEXT | No | NULL | — | Strengths identified | Confidential |
| `improvement_areas` | TEXT | No | NULL | — | Areas for improvement | Confidential |
| `goals_next_period` | TEXT | No | NULL | — | Goals for next period | Confidential |
| `training_recommendations` | UUID[] | No | `ARRAY[]::UUID[]` | — | Recommended training (FK to Course Master 471) | Internal |
| `final_rating` | DECIMAL(3,1) | No | NULL | 1-5 | Final rating (1-5 scale) | Confidential |
| `rating_label` | ENUM | No | NULL | BELOW_EXPECTATIONS, PARTIALLY_MEETS, MEETS_EXPECTATIONS, EXCEEDS_EXPECTATIONS, OUTSTANDING | Rating label | Confidential |
| `calibration_status` | ENUM | Yes | `PENDING` | PENDING, IN_CALIBRATION, CALIBRATED, APPEALED | Calibration | Internal |
| `calibration_adjustment` | DECIMAL(3,1) | No | NULL | — | Adjustment from calibration | Confidential |
| `recommendation` | ENUM | No | NULL | NO_CHANGE, PROMOTION, INCREMENT, BONUS, PIP, TRANSFER, DEMOTION, TERMINATION | Recommendation | Confidential |
| `probation_outcome` | ENUM | No | NULL | CONFIRM, EXTEND, TERMINATE | Probation outcome (PROBATION type only) | Confidential |
| `extended_probation_months` | INTEGER | No | NULL | 1-6 | Extended probation period | Internal |
| `appeal_status` | ENUM | Yes | `NONE` | NONE, REQUESTED, UNDER_REVIEW, RESOLVED | Appeal status | Internal |
| `appeal_notes` | TEXT | No | NULL | — | Appeal resolution notes | Confidential |
| `workflow_current_step` | VARCHAR(50) | Yes | `SELF_ASSESSMENT` | — | Current workflow step | Internal |
| `locked_at` | TIMESTAMPTZ | No | NULL | — | Lock timestamp | Internal |
| `locked_by` | UUID | No | NULL | FK to `workforce_master` | Locked by (HR) | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SELF_ASSESSMENT, MANAGER_REVIEW, SKIP_LEVEL, CALIBRATION, FINALIZED, APPEALED, LOCKED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Reviewee |
| Reviewer (381) | Many-to-One | N:1 | Manager |
| KPI Library (461) | Many-to-Many | N:N | Via achievements JSON |
| OKR Master (462) | Many-to-Many | N:N | Via achievements JSON |
| 360 Feedback (464) | One-to-Many | 1:N | Aggregated feedback |
| Appraisal Cycle (465) | Many-to-One | N:1 | Cycle |
| Promotion Recommendation (466) | One-to-One | 1:1 | If recommendation=PROMOTION |
| PIP (467) | One-to-One | 1:1 | If recommendation=PIP |

### 6. Indexes
- UNIQUE (`review_code`)
- INDEX (`employee_id`, `review_type`, `period_year`)
- INDEX (`reviewer_id`, `status`)
- INDEX (`review_type`, `status`, `period_year`)
- INDEX (`calibration_status`)

### 7. Security Classification
**Confidential** — performance reviews are sensitive personnel data; ratings are **Restricted**.

### 8. Integration Points
- **Performance Engine**: Workflow orchestration
- **Compensation Rules Engine** (Q161): Rating → variable pay / increment
- **LMS** (Sec 10): Training recommendations
- **Appraisal Cycle** (E465): Salary impact
- **Talent Review** (E469): High performer identification
- **HR Analytics** (Sec 13): Performance distribution analytics

### 9. Sample Data
```json
{
  "review_code": "PR-2026-ANN-00123", "employee_id": "wf-001",
  "reviewer_id": "wf-100", "review_type": "ANNUAL",
  "review_period_start": "2026-01-01", "review_period_end": "2026-12-31",
  "period_year": 2026, "kpi_overall_score": 87.50, "okr_overall_score": 0.78,
  "final_rating": 4.2, "rating_label": "EXCEEDS_EXPECTATIONS",
  "recommendation": "PROMOTION", "status": "CALIBRATION"
}
```

### 10. Audit Events
`PERFORMANCE_REVIEW_INITIATED`, `SELF_ASSESSMENT_SUBMITTED`, `MANAGER_REVIEW_SUBMITTED`, `SKIP_LEVEL_COMPLETED`, `CALIBRATION_STARTED`, `CALIBRATION_COMPLETED`, `REVIEW_FINALIZED`, `REVIEW_LOCKED`, `REVIEW_APPEALED`, `REVIEW_APPEAL_RESOLVED`

---

## Entity 464 — 360 Feedback

### 1. Business Purpose
Per Part 12 §9: Supports Manager, Peer, Self, Subordinate, Customer feedback. Multi-rater feedback for holistic performance assessment.

### 2. Architectural Role
Feedback transaction — anonymous (optional) feedback from multiple stakeholders. Aggregated into Performance Review (E463).

### 3. Business Rules
- Feedback types: MANAGER (reporting manager), PEER (colleagues), SELF (self-assessment), SUBORDINATE (direct reports), CUSTOMER (internal/external customers)
- Anonymity: subordinate & peer feedback typically anonymous to manager
- Min responses per type: PEER (min 3), SUBORDINATE (min 2 if any)
- Question library: 15-25 questions per feedback type
- Rating scale: 1-5 per question; free-text comments per competency
- Feedback window: 2 weeks typical
- Auto-reminder if not submitted within SLA

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `feedback_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `performance_review_id` | UUID | Yes | — | FK to `performance_reviews` (Entity 463) | Source review | Confidential |
| `subject_employee_id` | UUID | Yes | — | FK to `workforce_master` | Feedback subject | Confidential |
| `reviewer_employee_id` | UUID | Yes | — | FK to `workforce_master` | Feedback giver | Confidential |
| `feedback_type` | ENUM | Yes | — | MANAGER, PEER, SELF, SUBORDINATE, CUSTOMER | Type (per Part 12) | Internal |
| `is_anonymous` | BOOLEAN | Yes | `true` | — | Anonymous to subject | Confidential |
| `relationship_duration_months` | INTEGER | No | NULL | ≥ 1 | How long reviewer worked with subject | Internal |
| `question_responses` | JSONB | Yes | `'[]'` | — | Per-question responses | Confidential |
| `competency_ratings` | JSONB | Yes | `'{}'` | — | Per-competency rating (1-5) | Confidential |
| `overall_rating` | DECIMAL(3,1) | No | NULL | 1-5 | Overall rating | Confidential |
| `strengths` | TEXT | No | NULL | — | Strengths observed | Confidential |
| `improvement_areas` | TEXT | No | NULL | — | Areas for improvement | Confidential |
| `free_text_feedback` | TEXT | No | NULL | — | General comments | Confidential |
| `submitted_at` | TIMESTAMPTZ | No | NULL | — | Submission timestamp | Internal |
| `submission_window_end` | TIMESTAMPTZ | Yes | — | — | Submission deadline | Internal |
| `reminder_count` | INTEGER | Yes | `0` | ≥ 0 | Reminders sent | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, SUBMITTED, EXPIRED, DECLINED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Performance Review (463) | Many-to-One | N:1 | Source review |
| Workforce Master (381) | Many-to-One | N:1 | Subject |
| Workforce Master (381) | Many-to-One | N:1 | Reviewer |

### 6. Indexes
- UNIQUE (`feedback_code`)
- INDEX (`performance_review_id`, `feedback_type`)
- INDEX (`reviewer_employee_id`, `status`)
- INDEX (`submission_window_end`, `status`)

### 7. Security Classification
**Confidential** — anonymous feedback must be protected.

### 8. Integration Points
- **Performance Engine**: Aggregates into Performance Review
- **Notification Service**: Reminder emails
- **HR Analytics**: 360 feedback trends

### 9. Sample Data
```json
{
  "feedback_code": "FB-2026-000456", "performance_review_id": "pr-001",
  "subject_employee_id": "wf-001", "reviewer_employee_id": "wf-050",
  "feedback_type": "PEER", "is_anonymous": true,
  "relationship_duration_months": 18, "overall_rating": 4.5,
  "strengths": "Excellent problem-solving and team collaboration",
  "status": "SUBMITTED"
}
```

### 10. Audit Events
`FEEDBACK_REQUESTED`, `FEEDBACK_SUBMITTED`, `FEEDBACK_REMINDER_SENT`, `FEEDBACK_EXPIRED`, `FEEDBACK_DECLINED`

---

## Entity 465 — Appraisal Cycle

### 1. Business Purpose
Per Part 12 §9: Stores Cycle, Rating, Recommendation, Approval, Salary Impact. The master cycle that triggers performance reviews across the organization.

### 2. Architectural Role
Master entity — defines the appraisal cycle (e.g., "Annual Appraisal 2026"). Triggers Performance Review (E463) creation for all eligible employees.

### 3. Business Rules
- Cycle types: MONTHLY, QUARTERLY, HALF_YEARLY, ANNUAL, PROBATION
- Eligibility: employees with ≥ 3 months tenure (typical)
- Salary impact: increment %, variable pay %, bonus amount — driven by rating × company budget
- Approval chain: HR Head → Finance Head → CEO (for senior grades)
- Budget allocation: company-wide increment budget distributed by rating × grade
- Effective date: increment effective from (typically April 1 or July 1)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `cycle_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `cycle_name` | VARCHAR(100) | Yes | — | Min 5 | Display name | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `cycle_type` | ENUM | Yes | — | MONTHLY, QUARTERLY, HALF_YEARLY, ANNUAL, PROBATION | Cycle (per Part 12: "Cycle") | Internal |
| `cycle_year` | INTEGER | Yes | — | 1900-9999 | Year | Internal |
| `cycle_quarter` | ENUM | No | NULL | Q1, Q2, Q3, Q4 | Quarter (if applicable) | Internal |
| `period_start_date` | DATE | Yes | — | — | Period start | Internal |
| `period_end_date` | DATE | Yes | — | > start | Period end | Internal |
| `self_assessment_window_start` | DATE | Yes | — | — | Self-assessment start | Internal |
| `self_assessment_window_end` | DATE | Yes | — | > start | Self-assessment end | Internal |
| `manager_review_window_start` | DATE | Yes | — | — | Manager review start | Internal |
| `manager_review_window_end` | DATE | Yes | — | > start | Manager review end | Internal |
| `calibration_window_start` | DATE | Yes | — | — | Calibration start | Internal |
| `calibration_window_end` | DATE | Yes | — | > start | Calibration end | Internal |
| `effective_date` | DATE | Yes | — | — | Salary impact effective date | Internal |
| `eligible_employees_count` | INTEGER | Yes | `0` | ≥ 0 | Eligible count | Internal |
| `reviews_initiated_count` | INTEGER | Yes | `0` | ≥ 0 | Reviews initiated | Internal |
| `reviews_completed_count` | INTEGER | Yes | `0` | ≥ 0 | Reviews completed | Internal |
| `rating_distribution` | JSONB | Yes | `'{}'` | — | { OUTSTANDING: n, EXCEEDS: n, MEETS: n, ... } | Confidential |
| `increment_budget_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total increment budget | Confidential |
| `increment_budget_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Budget as % of payroll | Confidential |
| `bonus_budget_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Bonus budget | Confidential |
| `variable_pay_budget_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Variable pay budget | Confidential |
| `total_salary_impact` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total salary impact (per Part 12: "Salary Impact") | Confidential |
| `rating_scale_config` | JSONB | Yes | `'{}'` | — | Rating scale (1-5 or 1-4) | Internal |
| `increment_matrix` | JSONB | Yes | `'{}'` | — | Rating × Grade → increment % | Confidential |
| `bonus_matrix` | JSONB | Yes | `'{}'` | — | Rating × Grade → bonus amount | Confidential |
| `approval_status` | ENUM | Yes | `DRAFT` | DRAFT, PENDING_HR, PENDING_FINANCE, PENDING_CEO, APPROVED, REJECTED | Approval (per Part 12: "Approval") | Internal |
| `approved_by_hr` | UUID | No | NULL | FK to `workforce_master` | HR approval | Confidential |
| `approved_by_finance` | UUID | No | NULL | FK to `workforce_master` | Finance approval | Confidential |
| `approved_by_ceo` | UUID | No | NULL | FK to `workforce_master` | CEO approval (senior grades) | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Final approval timestamp | Internal |
| `payroll_impact_posted` | BOOLEAN | Yes | `false` | — | Salary impact posted to payroll | Internal |
| `payroll_master_id` | UUID | No | NULL | FK to `payroll_master` (Entity 451) | Linked payroll period | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, ACTIVE, IN_REVIEW, IN_CALIBRATION, APPROVED, SALARY_IMPACT_POSTED, CLOSED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Performance Review (463) | One-to-Many | 1:N | Reviews triggered |
| Payroll Master (451) | Many-to-One | N:1 | Salary impact |
| Compensation Rules Engine (Q161) | Service | — | Increment/bonus computation |

### 6. Indexes
- UNIQUE (`cycle_code`)
- INDEX (`company_id`, `cycle_type`, `cycle_year`)
- INDEX (`status`, `approval_status`)

### 7. Security Classification
**Confidential** — budgets and matrices are **Restricted**.

### 8. Integration Points
- **Performance Engine**: Triggers review creation
- **Compensation Rules Engine** (Q161): Increment/bonus matrix application
- **Payroll Engine** (E454): Salary structure update
- **Notification Service**: Cycle announcements
- **HR Mission Control** (E509): Cycle progress tracking

### 9. Sample Data
```json
{
  "cycle_code": "APP-2026-ANN", "cycle_name": "Annual Appraisal 2026",
  "company_id": "cmp-001", "cycle_type": "ANNUAL", "cycle_year": 2026,
  "period_start_date": "2026-01-01", "period_end_date": "2026-12-31",
  "effective_date": "2027-04-01", "eligible_employees_count": 245,
  "reviews_completed_count": 230, "increment_budget_pct": 8.00,
  "total_salary_impact": 9500000.0000, "approval_status": "PENDING_CEO",
  "status": "IN_CALIBRATION"
}
```

### 10. Audit Events
`APPRAISAL_CYCLE_CREATED`, `APPRAISAL_CYCLE_ACTIVATED`, `APPRAISAL_CYCLE_CALIBRATION_STARTED`, `APPRAISAL_CYCLE_APPROVED`, `APPRAISAL_CYCLE_SALARY_IMPACT_POSTED`, `APPRAISAL_CYCLE_CLOSED`

---

## Entity 466 — Promotion Recommendation

### 1. Business Purpose
Per Part 12 §9: Stores Current Position, New Position, Reason, Score, Approval. Promotion workflow from recommendation to approval to implementation.

### 2. Architectural Role
Workflow entity — initiated from Performance Review (E463) recommendation. Multi-level approval chain. Triggers position change, salary structure change, and notification.

### 3. Business Rules
- Promotion types: VERTICAL (grade up), LATERAL (same grade, role change), DOUBLE (grade + role), TEMPORARY (acting role)
- Eligibility: min tenure (2 years typical), rating ≥ 4 in last review, no PIP in last 12 months
- Approval chain: Reporting Manager → Dept Head → HR → CEO (for senior grades)
- Salary impact: minimum 15% increment typical (or new grade min, whichever higher)
- Effective date: typically next payroll cycle
- Probation in new role: 3-6 months typical (role-dependent)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `recommendation_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `performance_review_id` | UUID | No | NULL | FK to `performance_reviews` (Entity 463) | Source review | Confidential |
| `promotion_type` | ENUM | Yes | — | VERTICAL, LATERAL, DOUBLE, TEMPORARY | Type | Internal |
| `current_position_id` | UUID | Yes | — | FK to `position_masters` (Entity 393) | Current Position (per Part 12) | Internal |
| `current_grade_id` | UUID | Yes | — | FK to `grades` | Current grade | Internal |
| `current_ctc_annual` | DECIMAL(18,4) | Yes | — | ≥ 0 | Current CTC | Confidential |
| `new_position_id` | UUID | Yes | — | FK to `position_masters` | New Position (per Part 12) | Internal |
| `new_grade_id` | UUID | Yes | — | FK to `grades` | New grade | Internal |
| `new_department_id` | UUID | No | NULL | FK to `departments` | New department (if transfer) | Internal |
| `new_facility_id` | UUID | No | NULL | FK to `facilities` | New facility (if transfer) | Internal |
| `proposed_ctc_annual` | DECIMAL(18,4) | Yes | — | > current_ctc | Proposed CTC | Confidential |
| `increment_pct` | DECIMAL(5,2) | Yes | — | > 0 | Increment % | Confidential |
| `promotion_reason` | TEXT | Yes | — | Min 20 | Reason (per Part 12: "Reason") | Confidential |
| `justification_score` | DECIMAL(5,2) | Yes | — | 0-100 | Score (per Part 12: "Score") — composite of rating + tenure + skills | Confidential |
| `performance_rating` | DECIMAL(3,1) | Yes | — | 1-5 | Latest review rating | Confidential |
| `tenure_years` | DECIMAL(4,2) | Yes | — | ≥ 0 | Tenure in current role | Internal |
| `skill_match_score` | DECIMAL(5,2) | No | NULL | 0-100 | Skill match for new role | Confidential |
| `probation_in_new_role_months` | INTEGER | Yes | `3` | 0-12 | Probation period | Internal |
| `effective_date` | DATE | Yes | — | — | Promotion effective date | Internal |
| `approval_chain` | JSONB | Yes | `'[]'` | — | Multi-level approval chain | Confidential |
| `current_approver_level` | INTEGER | Yes | `1` | ≥ 1 | Current level | Internal |
| `current_approver_id` | UUID | No | NULL | FK to `workforce_master` | Current approver | Confidential |
| `final_approved_by` | UUID | No | NULL | FK to `workforce_master` | Final approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Final approval timestamp | Internal |
| `rejection_reason` | TEXT | No | NULL | — | If rejected | Confidential |
| `salary_structure_updated` | BOOLEAN | Yes | `false` | — | Salary structure updated | Internal |
| `position_assignment_updated` | BOOLEAN | Yes | `false` | — | Position assignment updated | Internal |
| `probation_review_due_date` | DATE | No | NULL | — | Probation review due | Internal |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Salary impact posting | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, PENDING, APPROVED, REJECTED, IMPLEMENTED, ON_HOLD, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Performance Review (463) | Many-to-One | N:1 | Source |
| Position Master (393) | Many-to-One | N:1 | Current/New position |
| Salary Structure (452) | Many-to-One | N:1 | New salary structure |
| Compensation Rules Engine (Q161) | Service | — | Increment computation |

### 6. Indexes
- UNIQUE (`recommendation_code`)
- INDEX (`employee_id`, `status`)
- INDEX (`status`, `current_approver_id`)
- INDEX (`effective_date`, `status`)

### 7. Security Classification
**Confidential** — salary data is **Restricted**.

### 8. Integration Points
- **Workflow Engine**: Approval chain
- **Compensation Rules Engine** (Q161): Increment computation
- **Salary Structure** (E452): Update employee structure
- **Position Master** (E393): Position change
- **Payroll Engine** (E454): Effective next cycle
- **Notification Service**: Promotion announcement

### 9. Sample Data
```json
{
  "recommendation_code": "PROM-2026-00078", "employee_id": "wf-001",
  "promotion_type": "VERTICAL", "current_position_id": "pos-exec",
  "current_grade_id": "grade-m1", "current_ctc_annual": 1200000.0000,
  "new_position_id": "pos-mgr", "new_grade_id": "grade-m2",
  "proposed_ctc_annual": 1500000.0000, "increment_pct": 25.00,
  "promotion_reason": "Consistently exceeded targets, demonstrated leadership in Q3 product launch",
  "justification_score": 88.50, "performance_rating": 4.5,
  "effective_date": "2026-10-01", "status": "PENDING"
}
```

### 10. Audit Events
`PROMOTION_RECOMMENDED`, `PROMOTION_APPROVED_LEVEL_1`, `PROMOTION_APPROVED_LEVEL_2`, `PROMOTION_FINAL_APPROVED`, `PROMOTION_REJECTED`, `PROMOTION_IMPLEMENTED`, `PROMOTION_CANCELLED`

---

## Entity 467 — Performance Improvement Plan (PIP)

### 1. Business Purpose
Per Part 12 §9: Stores Issues, Targets, Review Dates, Outcome. Structured plan to help underperforming employees improve.

### 2. Architectural Role
Workflow entity — formal process initiated when performance is below expectations. Outcome determines retention vs separation.

### 3. Business Rules
- PIP duration: 30/60/90 days typical
- Triggers: rating ≤ 2 in annual review, or repeated quarterly underperformance, or specific incident
- Mandatory components: documented issues, measurable targets, weekly review dates, training resources, mentor assignment
- Outcomes: SUCCESSFUL (continue), EXTENDED (more time), UNSUCCESSFUL (separation)
- Legal compliance: documented process for fair termination (Indian Labor Law)
- Employee can appeal PIP initiation

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `pip_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `performance_review_id` | UUID | No | NULL | FK to `performance_reviews` (Entity 463) | Source review | Confidential |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Reporting manager | Confidential |
| `mentor_id` | UUID | No | NULL | FK to `workforce_master` | Assigned mentor | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `initiation_reason` | ENUM | Yes | — | LOW_RATING, REPEATED_UNDERPERFORMANCE, INCIDENT, SKILL_GAP, BEHAVIORAL, ATTENDANCE, QUALITY_ISSUES | Reason | Confidential |
| `issues_identified` | JSONB | Yes | `'[]'` | — | Issues (per Part 12: "Issues") — array of { issue, severity, evidence } | Confidential |
| `performance_baseline` | JSONB | Yes | `'{}'` | — | Current performance baseline | Confidential |
| `targets` | JSONB | Yes | `'[]'` | — | Targets (per Part 12: "Targets") — array of { target, metric, baseline, goal, weightage } | Confidential |
| `success_criteria` | TEXT | Yes | — | Min 50 | Defined success criteria | Confidential |
| `improvement_plan_actions` | JSONB | Yes | `'[]'` | — | Action items with deadlines | Confidential |
| `training_resources` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Recommended courses (FK to Course Master 471) | Internal |
| `support_resources` | JSONB | No | NULL | — | Mentor sessions, coaching, EAP | Internal |
| `start_date` | DATE | Yes | — | — | PIP start date | Internal |
| `duration_days` | INTEGER | Yes | `60` | 30-180 | PIP duration | Internal |
| `end_date` | DATE | Yes | — | = start + duration | End date | Internal |
| `review_dates` | JSONB | Yes | `'[]'` | — | Review Dates (per Part 12) — array of { date, type } | Internal |
| `review_meetings` | JSONB | Yes | `'[]'` | — | Actual review meeting records | Confidential |
| `weekly_check_ins` | JSONB | Yes | `'[]'` | — | Weekly progress check-ins | Confidential |
| `mid_pip_review_done` | BOOLEAN | Yes | `false` | — | Mid-PIP review | Internal |
| `final_review_done` | BOOLEAN | Yes | `false` | — | Final review | Internal |
| `outcome` | ENUM | No | NULL | SUCCESSFUL, EXTENDED, UNSUCCESSFUL, WITHDRAWN | Outcome (per Part 12: "Outcome") | Confidential |
| `outcome_notes` | TEXT | No | NULL | — | Outcome details | Confidential |
| `extended_pip_end_date` | DATE | No | NULL | > end_date | Extended end date | Internal |
| `separation_initiated` | BOOLEAN | Yes | `false` | — | Separation workflow initiated (if UNSUCCESSFUL) | Confidential |
| `separation_id` | UUID | No | NULL | FK to `separations` | Linked separation | Confidential |
| `appeal_status` | ENUM | Yes | `NONE` | NONE, REQUESTED, UNDER_REVIEW, RESOLVED | Appeal | Internal |
| `hr_reviewer_id` | UUID | No | NULL | FK to `workforce_master` | HR reviewer | Confidential |
| `legal_review_done` | BOOLEAN | Yes | `false` | — | Legal team reviewed (for separation) | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, ACTIVE, IN_REVIEW, COMPLETED, EXTENDED, WITHDRAWN, APPEALED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Performance Review (463) | Many-to-One | N:1 | Source |
| Course Master (471) | Many-to-Many | N:N | Training resources |
| Separation | One-to-One | 1:1 | If unsuccessful |

### 6. Indexes
- UNIQUE (`pip_code`)
- INDEX (`employee_id`, `status`)
- INDEX (`status`, `end_date`)
- INDEX (`outcome`)

### 7. Security Classification
**Confidential** — sensitive personnel data; legal separation context.

### 8. Integration Points
- **Performance Engine**: PIP workflow
- **LMS** (Sec 10): Training assignment
- **Notification Service**: Review reminders
- **HR Mission Control** (E509): PIP tracking
- **Separation Workflow**: If unsuccessful
- **Legal Service**: Documentation for compliance

### 9. Sample Data
```json
{
  "pip_code": "PIP-2026-00012", "employee_id": "wf-075",
  "initiation_reason": "LOW_RATING",
  "issues_identified": [
    { "issue": "Missed production targets for 3 consecutive months", "severity": "HIGH" },
    { "issue": "Quality incidents above threshold", "severity": "MEDIUM" }
  ],
  "targets": [
    { "target": "Achieve 95% production target", "metric": "Production %", "baseline": 82, "goal": 95, "weightage": 50 },
    { "target": "Zero quality incidents", "metric": "Quality incidents", "baseline": 4, "goal": 0, "weightage": 50 }
  ],
  "start_date": "2026-07-15", "duration_days": 60, "end_date": "2026-09-13",
  "status": "ACTIVE"
}
```

### 10. Audit Events
`PIP_INITIATED`, `PIP_REVIEW_COMPLETED`, `PIP_MID_REVIEW_DONE`, `PIP_EXTENDED`, `PIP_SUCCESSFUL`, `PIP_UNSUCCESSFUL`, `PIP_WITHDRAWN`, `PIP_APPEALED`, `PIP_SEPARATION_INITIATED`

---

## Entity 468 — Competency Matrix

### 1. Business Purpose
Per Part 12 §9: Measures Technical, Leadership, Communication, Safety, Quality, Innovation. Defines required vs actual competency levels per role.

### 2. Architectural Role
Master + assessment entity — defines competencies (master) and required levels per position; assessment (transaction) records actual levels per employee.

### 3. Business Rules
- Competency categories: TECHNICAL (job-specific), LEADERSHIP (people mgmt), COMMUNICATION, SAFETY, QUALITY, INNOVATION, BEHAVIORAL
- Levels: BEGINNER (1), INTERMEDIATE (2), ADVANCED (3), EXPERT (4)
- Required levels defined per Position × Competency
- Skill gap = Required − Actual (negative gap = exceeds)
- Competency assessment: via E475 Competency Assessment
- Training triggered for competency gaps > 1 level

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `matrix_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `competency_category` | ENUM | Yes | — | TECHNICAL, LEADERSHIP, COMMUNICATION, SAFETY, QUALITY, INNOVATION, BEHAVIORAL | Category (per Part 12) | Internal |
| `competency_name` | VARCHAR(200) | Yes | — | Min 3 | Competency name | Internal |
| `competency_description` | TEXT | Yes | — | Min 20 | Description | Internal |
| `level_definitions` | JSONB | Yes | `'{}'` | — | Level descriptors: { BEGINNER: "...", INTERMEDIATE: "...", ADVANCED: "...", EXPERT: "..." } | Internal |
| `assessment_method` | ENUM | Yes | `MANAGER` | SELF, MANAGER, ASSESSMENT_CENTER, EXAMINATION, CERTIFICATION, OBSERVATION | Assessment method | Internal |
| `is_certification_based` | BOOLEAN | Yes | `false` | — | Linked to certification (Entity 474) | Internal |
| `linked_certification_id` | UUID | No | NULL | FK to `certifications` (Entity 474) | Certification | Internal |
| `position_requirements` | JSONB | Yes | `'[]'` | — | Per-position required levels: [{ position_id, required_level, criticality }] | Internal |
| `applicable_departments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Departments | Internal |
| `applicable_grades` | UUID[] | No | `ARRAY[]::UUID[]` | — | Grades | Internal |
| `assessment_frequency` | ENUM | Yes | `YEARLY` | QUARTERLY, HALF_YEARLY, YEARLY, ON_DEMAND | Assessment frequency | Internal |
| `training_resources` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Linked courses | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Position Master (393) | Many-to-Many | N:N | Via position_requirements |
| Competency Assessment (475) | One-to-Many | 1:N | Per-employee assessments |
| Certification (474) | Many-to-One | N:1 | Certification-linked |
| Course Master (471) | Many-to-Many | N:N | Training resources |

### 6. Indexes
- UNIQUE (`matrix_code`)
- INDEX (`company_id`, `competency_category`, `status`)
- GIN INDEX (`applicable_departments`)
- GIN INDEX (`applicable_grades`)

### 7. Security Classification
**Internal** — position requirements are **Confidential**.

### 8. Integration Points
- **Competency Assessment** (E475): Level evaluation
- **LMS** (Sec 10): Training for gaps
- **Performance Review** (E463): Competency scoring
- **Talent Review** (E469): Skill gap analysis
- **Succession Planning** (E506): Readiness evaluation

### 9. Sample Data
```json
{
  "matrix_code": "COMP-TECH-FORKLIFT", "competency_category": "TECHNICAL",
  "competency_name": "Forklift Operation",
  "competency_description": "Safe operation of forklift trucks in warehouse environment",
  "level_definitions": {
    "BEGINNER": "Under training, operates under supervision",
    "INTERMEDIATE": "Independent operation on standard routes",
    "ADVANCED": "Operates all forklift types, trains juniors",
    "EXPERT": "Master operator, certified trainer, handles complex loads"
  },
  "assessment_method": "CERTIFICATION", "is_certification_based": true,
  "assessment_frequency": "YEARLY", "status": "ACTIVE"
}
```

### 10. Audit Events
`COMPETENCY_MATRIX_CREATED`, `COMPETENCY_MATRIX_UPDATED`, `COMPETENCY_LEVEL_CHANGED`, `COMPETENCY_INACTIVATED`

---

## Entity 469 — Talent Review

### 1. Business Purpose
Per Part 12 §9: Supports High Performer, Potential, Successor, Retention Risk. Annual talent calibration exercise to identify and develop top talent.

### 2. Architectural Role
Calibration entity — leadership-led review of talent pool. Feeds succession planning, promotion pipeline, and retention strategies.

### 3. Business Rules
- 9-box grid: Performance (X-axis: Low/Medium/High) × Potential (Y-axis: Low/Medium/High)
- Categories: STARS (high perf + high pot), WORKHORSES (high perf + low pot), QUESTION MARKS (low perf + high pot), UNDERPERFORMERS (low + low)
- High performer identification: rating ≥ 4.0 for 2 consecutive years
- Retention risk: HIGH (flight risk), MEDIUM, LOW
- Successor identification: ready now / ready 1-2 years / ready 3-5 years
- Confidential: limited to leadership + HR

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `review_code` | VARCHAR(30) | Yes | — | Unique per company × year | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `review_year` | INTEGER | Yes | — | 1900-9999 | Review year | Internal |
| `review_cycle` | ENUM | Yes | `ANNUAL` | ANNUAL, HALF_YEARLY | Cycle | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `department_id` | UUID | Yes | — | FK to `departments` | Department | Internal |
| `current_position_id` | UUID | Yes | — | FK to `position_masters` | Current position | Internal |
| `current_grade_id` | UUID | Yes | — | FK to `grades` | Current grade | Internal |
| `performance_rating` | DECIMAL(3,1) | Yes | — | 1-5 | Latest rating | Confidential |
| `performance_trend` | JSONB | Yes | `'[]'` | — | 3-year rating trend | Confidential |
| `potential_rating` | DECIMAL(3,1) | Yes | — | 1-5 | Potential (per Part 12: "Potential") | Confidential |
| `nine_box_category` | ENUM | Yes | — | STAR, HIGH_PERFORMER, HIGH_POTENTIAL, CORE_PLAYER, SOLID_PERFORMER, QUESTION_MARK, UNDERPERFORMER, RISK | 9-box position | Confidential |
| `is_high_performer` | BOOLEAN | Yes | `false` | — | High Performer (per Part 12) | Confidential |
| `is_high_potential` | BOOLEAN | Yes | `false` | — | HiPo identification | Confidential |
| `successor_for_positions` | UUID[] | No | `ARRAY[]::UUID[]` | — | Successor (per Part 12) — positions employee can succeed into | Confidential |
| `successor_readiness` | ENUM | No | NULL | READY_NOW, READY_1_2_YEARS, READY_3_5_YEARS, NOT_READY | Readiness | Confidential |
| `retention_risk` | ENUM | Yes | `LOW` | LOW, MEDIUM, HIGH | Retention Risk (per Part 12) | Confidential |
| `retention_risk_factors` | JSONB | No | NULL | — | { compensation_gap, tenure, market_demand, recent_interviews, ... } | Restricted |
| `retention_actions` | JSONB | No | NULL | — | Recommended retention actions | Confidential |
| `career_aspiration` | TEXT | No | NULL | — | Employee career aspiration | Confidential |
| `development_plan` | JSONB | No | NULL | — | Development actions | Confidential |
| `critical_position` | BOOLEAN | Yes | `false` | — | In critical position | Internal |
| `flight_risk_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI flight risk score | Restricted |
| `reviewed_by_manager` | UUID | Yes | — | FK to `workforce_master` | Reviewing manager | Confidential |
| `reviewed_by_hr` | UUID | No | NULL | FK to `workforce_master` | HR reviewer | Confidential |
| `reviewed_by_leadership` | UUID | No | NULL | FK to `workforce_master` | Leadership reviewer | Confidential |
| `review_meeting_date` | DATE | Yes | — | — | Calibration meeting date | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, IN_CALIBRATION, FINALIZED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Position Master (393) | Many-to-One | N:1 | Current position |
| Succession Planning (506) | One-to-Many | 1:N | Feeds succession |
| Promotion Recommendation (466) | One-to-Many | 1:N | Promotion pipeline |
| Attrition Prediction (504) | One-to-One | 1:1 | Flight risk correlation |

### 6. Indexes
- UNIQUE (`review_code`)
- INDEX (`company_id`, `review_year`, `employee_id`)
- INDEX (`is_high_performer`, `is_high_potential`)
- INDEX (`retention_risk`)
- INDEX (`successor_readiness`)

### 7. Security Classification
**Restricted** — talent reviews are highly confidential leadership data.

### 8. Integration Points
- **Succession Planning** (E506): Successor pipeline
- **Attrition Prediction** (E504): Risk correlation
- **Promotion Recommendation** (E466): Promotion pipeline
- **HR Analytics** (Sec 13): Talent analytics
- **Executive Scorecard** (E510): Talent health

### 9. Sample Data
```json
{
  "review_code": "TR-2026-00123", "review_year": 2026, "employee_id": "wf-001",
  "performance_rating": 4.5, "potential_rating": 4.2,
  "nine_box_category": "STAR", "is_high_performer": true, "is_high_potential": true,
  "successor_readiness": "READY_1_2_YEARS", "retention_risk": "MEDIUM",
  "flight_risk_score": 35.00, "status": "FINALIZED"
}
```

### 10. Audit Events
`TALENT_REVIEW_INITIATED`, `TALENT_REVIEW_CALIBRATED`, `TALENT_REVIEW_FINALIZED`, `HIGH_PERFORMER_IDENTIFIED`, `RETENTION_RISK_ESCALATED`, `SUCCESSOR_IDENTIFIED`

---

## Entity 470 — Performance Dashboard

### 1. Business Purpose
Per Part 12 §9: Displays Top Performers, Low Performers, Average Rating, Promotion Pipeline, Department Ranking. AI: Promotion Prediction, Attrition Risk, Skill Gap, Successor Recommendation, Performance Forecast.

### 2. Architectural Role
Aggregated view entity — powers HR Mission Control, executive dashboards, and manager insights.

### 3. Business Rules
- Snapshot-based: refreshed after each review cycle + daily incremental
- Multi-grain: per-employee, per-team, per-department, per-company
- AI insights refreshed weekly (overnight batch)
- Top/Bottom performer lists: top/bottom 10% by rating
- Department ranking: by average rating, normalized for grade mix

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `snapshot_type` | ENUM | Yes | — | EMPLOYEE, TEAM, DEPARTMENT, COMPANY | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity reference | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `appraisal_cycle_id` | UUID | No | NULL | FK to `appraisal_cycles` (Entity 465) | Cycle | Internal |
| `top_performers` | JSONB | Yes | `'[]'` | — | Top Performers (per Part 12) — top 10% by rating | Confidential |
| `low_performers` | JSONB | Yes | `'[]'` | — | Low Performers (per Part 12) — bottom 10% | Restricted |
| `average_rating` | DECIMAL(3,2) | Yes | `0` | 0-5 | Average Rating (per Part 12) | Confidential |
| `rating_distribution` | JSONB | Yes | `'{}'` | — | Distribution by rating | Confidential |
| `promotion_pipeline` | JSONB | Yes | `'[]'` | — | Promotion Pipeline (per Part 12) — pending promotions | Confidential |
| `department_ranking` | JSONB | Yes | `'[]'` | — | Department Ranking (per Part 12) | Confidential |
| `pip_count` | INTEGER | Yes | `0` | ≥ 0 | Active PIPs | Internal |
| `nine_box_distribution` | JSONB | Yes | `'{}'` | — | 9-box distribution | Confidential |
| `goal_achievement_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | OKR achievement % | Internal |
| `feedback_completion_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | 360 feedback completion | Internal |
| `promotion_prediction` | JSONB | No | NULL | — | AI: promotion candidates (per Part 12 AI) | Confidential |
| `attrition_risk` | JSONB | No | NULL | — | AI: attrition risk per employee (per Part 12 AI) | Restricted |
| `skill_gap_analysis` | JSONB | No | NULL | — | AI: skill gaps (per Part 12 AI) | Confidential |
| `successor_recommendation` | JSONB | No | NULL | — | AI: successor suggestions (per Part 12 AI) | Confidential |
| `performance_forecast` | JSONB | No | NULL | — | AI: next-period performance forecast (per Part 12 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh timestamp | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model version | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Appraisal Cycle (465) | Many-to-One | N:1 | Cycle |
| Workforce Master (381) | Many-to-One | N:1 | Employee (EMPLOYEE grain) |

### 6. Indexes
- UNIQUE (`snapshot_date`, `snapshot_type`, `entity_id`)
- INDEX (`company_id`, `snapshot_date`)
- INDEX (`ai_insights_generated_at`)

### 7. Security Classification
**Confidential** — low performers and attrition risk are **Restricted**.

### 8. Integration Points
- **BI Service**: Performance dashboards
- **AI/ML Service**: Predictions and forecasts
- **HR Mission Control** (E509): Operational dashboard
- **MSS Portal** (E491): Manager team view
- **Executive Scorecard** (E510): C-suite view

### 9. Sample Data
```json
{
  "snapshot_date": "2026-07-08", "snapshot_type": "DEPARTMENT",
  "entity_id": "dept-mfg", "company_id": "cmp-001",
  "top_performers": [{ "employee_id": "wf-001", "rating": 4.8 }],
  "average_rating": 3.85, "rating_distribution": { "OUTSTANDING": 5, "EXCEEDS": 25, "MEETS": 60, "BELOW": 10 },
  "promotion_pipeline": [{ "employee_id": "wf-001", "proposed_position": "Manager" }],
  "ai_insights_generated_at": "2026-07-08T02:00:00Z",
  "ai_model_version": "v2.5.0", "status": "COMPLETED"
}
```

### 10. Audit Events
`PERFORMANCE_DASHBOARD_SNAPSHOT_CREATED`, `PERFORMANCE_DASHBOARD_AI_REFRESHED`, `PERFORMANCE_DASHBOARD_STALE_DETECTED`, `PERFORMANCE_DASHBOARD_ATTRITION_ALERT`

---

# SECTION 10: Learning Management (LMS), Skills Matrix & Certifications (Entities 471-480)

## Entity 471 — Course Master

### 1. Business Purpose
Per Part 12 §10: Supports Internal, External, Video, PDF, Workshop, Practical course types. Master catalog of all learning content.

### 2. Architectural Role
Master entity — central course catalog. Drives training programs, learning assignments, and certification paths.

### 3. Business Rules
- Course types: INTERNAL (created in-house), EXTERNAL (vendor), VIDEO, PDF, WORKSHOP, PRACTICAL, ELEARNING, BLENDED
- Content versioning: each course has versions; assignments track which version was completed
- Prerequisites: course can have prerequisite courses
- Duration: in hours; mandatory min completion time (anti-gaming)
- Compliance courses: mandatory + recurring (e.g., Food Safety yearly)
- Cost tracking: external courses have cost per enrollment

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `course_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `course_name` | VARCHAR(200) | Yes | — | Min 5 | Display name | Internal |
| `course_type` | ENUM | Yes | — | INTERNAL, EXTERNAL, VIDEO, PDF, WORKSHOP, PRACTICAL, ELEARNING, BLENDED | Type (per Part 12) | Internal |
| `category` | ENUM | Yes | — | TECHNICAL, SOFT_SKILLS, COMPLIANCE, SAFETY, LEADERSHIP, QUALITY, ONBOARDING, PRODUCT | Category | Internal |
| `description` | TEXT | Yes | — | Min 30 | Detailed description | Internal |
| `learning_objectives` | JSONB | Yes | `'[]'` | — | Array of objectives | Internal |
| `content_url` | VARCHAR(500) | No | NULL | — | Content URL (for VIDEO/PDF/ELEARNING) | Internal |
| `content_attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Attachment references | Internal |
| `duration_hours` | DECIMAL(5,2) | Yes | — | > 0 | Duration in hours | Internal |
| `minimum_completion_hours` | DECIMAL(5,2) | Yes | — | ≤ duration | Min hours to complete | Internal |
| `difficulty_level` | ENUM | Yes | `INTERMEDIATE` | BEGINNER, INTERMEDIATE, ADVANCED, EXPERT | Difficulty | Internal |
| `prerequisite_course_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Prerequisites | Internal |
| `linked_competency_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Linked competencies (Entity 468) | Internal |
| `linked_certification_id` | UUID | No | NULL | FK to `certifications` (Entity 474) | Certification earned | Internal |
| `is_mandatory` | BOOLEAN | Yes | `false` | — | Mandatory course | Internal |
| `is_compliance_course` | BOOLEAN | Yes | `false` | — | Compliance course | Internal |
| `renewal_frequency_months` | INTEGER | No | NULL | > 0 | Renewal cycle (e.g., 12 for yearly) | Internal |
| `passing_score_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Passing score | Internal |
| `max_attempts` | INTEGER | Yes | `3` | ≥ 1 | Max attempts | Internal |
| `external_vendor_id` | UUID | No | NULL | FK to `vendors` | External vendor | Internal |
| `cost_per_enrollment` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `instructor_id` | UUID | No | NULL | FK to `workforce_master` | Internal instructor | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Search tags | Internal |
| `thumbnail_attachment_id` | UUID | No | NULL | FK to `attachments` | Course thumbnail | Internal |
| `rating_average` | DECIMAL(3,2) | Yes | `0` | 0-5 | Average rating | Internal |
| `rating_count` | INTEGER | Yes | `0` | ≥ 0 | Number of ratings | Internal |
| `enrollment_count` | INTEGER | Yes | `0` | ≥ 0 | Total enrollments | Internal |
| `completion_count` | INTEGER | Yes | `0` | ≥ 0 | Total completions | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Course version | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Vendor (Part 5) | Many-to-One | N:1 | External vendor |
| Workforce Master (381) | Many-to-One | N:1 | Instructor |
| Training Program (472) | Many-to-Many | N:N | Program courses |
| Certification (474) | Many-to-One | N:1 | Linked certification |
| Competency Matrix (468) | Many-to-Many | N:N | Linked competencies |
| Learning Assignment (476) | One-to-Many | 1:N | Assignments |

### 6. Indexes
- UNIQUE (`course_code`)
- INDEX (`course_type`, `category`, `status`)
- INDEX (`is_mandatory`, `is_compliance_course`)
- GIN INDEX (`prerequisite_course_ids`)
- GIN INDEX (`tags`)

### 7. Security Classification
**Internal** — cost is **Confidential**.

### 8. Integration Points
- **LMS Engine**: Course delivery
- **Competency Matrix** (E468): Skill gap closure
- **Certification** (E474): Certification path
- **Vendor Integration** (Part 5): External content
- **ESS Portal** (E481): Course catalog browse

### 9. Sample Data
```json
{
  "course_code": "CRS-FS-001", "course_name": "Food Safety Fundamentals",
  "course_type": "ELEARNING", "category": "COMPLIANCE",
  "duration_hours": 4.00, "difficulty_level": "BEGINNER",
  "is_mandatory": true, "is_compliance_course": true,
  "renewal_frequency_months": 12, "passing_score_pct": 80.00,
  "max_attempts": 3, "status": "ACTIVE"
}
```

### 10. Audit Events
`COURSE_CREATED`, `COURSE_UPDATED`, `COURSE_VERSION_PUBLISHED`, `COURSE_DEPRECATED`, `COURSE_RATING_UPDATED`

---

## Entity 472 — Training Program

### 1. Business Purpose
Per Part 12 §10: Stores Instructor, Schedule, Department, Attendance, Completion. Scheduled training events (cohort-based learning).

### 2. Architectural Role
Scheduling entity — instances of courses delivered to specific cohorts at specific times. Tracks attendance and completion.

### 3. Business Rules
- Program = Course × Cohort × Schedule
- Delivery modes: CLASSROOM, VIRTUAL, BLENDED, ON_DEMAND
- Capacity: max enrollments per session
- Waitlist: when capacity exceeded
- Attendance tracking: via E478 Training Attendance
- Completion criteria: attendance ≥ 80% + assessment score ≥ passing
- Cancellation: refund policy for external courses

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `program_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `course_id` | UUID | Yes | — | FK to `course_master` (Entity 471) | Course | Internal |
| `program_name` | VARCHAR(200) | Yes | — | Min 5 | Display name | Internal |
| `instructor_id` | UUID | Yes | — | FK to `workforce_master` | Instructor (per Part 12) | Internal |
| `co_instructor_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Co-instructors | Internal |
| `delivery_mode` | ENUM | Yes | — | CLASSROOM, VIRTUAL, BLENDED, ON_DEMAND | Mode | Internal |
| `department_id` | UUID | No | NULL | FK to `departments` | Department (per Part 12) | Internal |
| `facility_id` | UUID | No | NULL | FK to `facilities` | Facility (for classroom) | Internal |
| `venue_details` | JSONB | No | NULL | — | Venue / virtual meeting link | Internal |
| `schedule_start_date` | DATE | Yes | — | — | Schedule (per Part 12) — start | Internal |
| `schedule_end_date` | DATE | Yes | — | ≥ start | Schedule end | Internal |
| `schedule_sessions` | JSONB | Yes | `'[]'` | — | Per-session schedule (date, start_time, end_time) | Internal |
| `total_duration_hours` | DECIMAL(5,2) | Yes | — | > 0 | Total hours | Internal |
| `max_capacity` | INTEGER | Yes | — | > 0 | Max enrollments | Internal |
| `min_capacity` | INTEGER | Yes | `1` | ≥ 1 | Min for program to run | Internal |
| `enrolled_count` | INTEGER | Yes | `0` | ≥ 0 | Enrolled | Internal |
| `waitlist_count` | INTEGER | Yes | `0` | ≥ 0 | Waitlist | Internal |
| `attended_count` | INTEGER | Yes | `0` | ≥ 0 | Attended (per Part 12: "Attendance") | Internal |
| `completed_count` | INTEGER | Yes | `0` | ≥ 0 | Completed (per Part 12: "Completion") | Internal |
| `completion_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Completion rate | Internal |
| `enrollment_criteria` | JSONB | No | NULL | — | Eligibility criteria | Internal |
| `cost_per_participant` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `total_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total program cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `budget_code` | VARCHAR(30) | No | NULL | — | Training budget code | Internal |
| `external_vendor_id` | UUID | No | NULL | FK to `vendors` | External vendor | Internal |
| `material_attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Training materials | Internal |
| `feedback_survey_id` | UUID | No | NULL | FK to `surveys` | Feedback survey | Internal |
| `average_feedback_score` | DECIMAL(3,2) | Yes | `0` | 0-5 | Feedback score | Internal |
| `cancellation_reason` | TEXT | No | NULL | — | If cancelled | Confidential |
| `cancelled_at` | TIMESTAMPTZ | No | NULL | — | Cancellation timestamp | Internal |
| `status` | ENUM | Yes | `SCHEDULED` | DRAFT, SCHEDULED, ENROLLMENT_OPEN, ENROLLMENT_CLOSED, IN_PROGRESS, COMPLETED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Course Master (471) | Many-to-One | N:1 | Course |
| Instructor (381) | Many-to-One | N:1 | Instructor |
| Department | Many-to-One | N:1 | Department |
| Learning Assignment (476) | One-to-Many | 1:N | Per-employee assignments |
| Training Attendance (478) | One-to-Many | 1:N | Attendance records |

### 6. Indexes
- UNIQUE (`program_code`)
- INDEX (`course_id`, `status`)
- INDEX (`instructor_id`, `schedule_start_date`)
- INDEX (`department_id`, `schedule_start_date`)
- INDEX (`status`, `schedule_start_date`)

### 7. Security Classification
**Internal** — cost fields are **Confidential**.

### 8. Integration Points
- **LMS Engine**: Program scheduling
- **Notification Service**: Enrollment & reminders
- **Calendar Service**: Schedule sync
- **Training Attendance** (E478): Attendance tracking
- **Finance** (Part 11): Cost posting
- **ESS Portal** (E481): Enrollment UI

### 9. Sample Data
```json
{
  "program_code": "TP-2026-FS-001", "course_id": "crs-fs-001",
  "program_name": "Food Safety Fundamentals - July 2026 Batch",
  "instructor_id": "wf-200", "delivery_mode": "BLENDED",
  "department_id": "dept-qa", "facility_id": "fac-mum",
  "schedule_start_date": "2026-07-15", "schedule_end_date": "2026-07-17",
  "total_duration_hours": 4.00, "max_capacity": 25, "enrolled_count": 22,
  "status": "ENROLLMENT_OPEN"
}
```

### 10. Audit Events
`TRAINING_PROGRAM_SCHEDULED`, `ENROLLMENT_OPENED`, `PARTICIPANT_ENROLLED`, `PROGRAM_STARTED`, `PROGRAM_COMPLETED`, `PROGRAM_CANCELLED`

---

## Entity 473 — Skills Matrix

### 1. Business Purpose
Per Part 12 §10: Supports Technical, Soft Skills, Compliance, Leadership, Safety, Machine Skills. Per-employee skill inventory.

### 2. Architectural Role
Assessment entity — per-employee × per-skill rating. Drives skill gap analysis, succession planning, and training recommendations.

### 3. Business Rules
- Skill categories: TECHNICAL (job-specific), SOFT_SKILLS, COMPLIANCE, LEADERSHIP, SAFETY, MACHINE_SKILLS, IT_SKILLS, LANGUAGE
- Rating scale: 0 (None) → 1 (Beginner) → 2 (Intermediate) → 3 (Advanced) → 4 (Expert)
- Required vs actual: gap analysis per Position × Skill
- Source: SELF_ASSESSMENT, MANAGER_ASSESSMENT, CERTIFICATION, EXAMINATION
- Last assessed date: tracks freshness
- Skill expiry: certifications expire → skill downgrades

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `skill_category` | ENUM | Yes | — | TECHNICAL, SOFT_SKILLS, COMPLIANCE, LEADERSHIP, SAFETY, MACHINE_SKILLS, IT_SKILLS, LANGUAGE | Category (per Part 12) | Internal |
| `skill_name` | VARCHAR(200) | Yes | — | Min 3 | Skill name | Internal |
| `competency_matrix_id` | UUID | No | NULL | FK to `competency_matrix` (Entity 468) | Linked competency | Internal |
| `current_rating` | INTEGER | Yes | — | 0-4 | Current rating (0=None, 4=Expert) | Confidential |
| `required_rating` | INTEGER | No | NULL | 0-4 | Required for current position | Confidential |
| `skill_gap` | INTEGER | Yes | `0` | -4 to 4 | required − current (negative = exceeds) | Confidential |
| `years_of_experience` | DECIMAL(4,2) | No | NULL | ≥ 0 | Years of experience | Internal |
| `last_assessed_date` | DATE | Yes | — | — | Last assessment | Internal |
| `next_assessment_due` | DATE | No | NULL | — | Next assessment | Internal |
| `assessment_source` | ENUM | Yes | `MANAGER_ASSESSMENT` | SELF_ASSESSMENT, MANAGER_ASSESSMENT, CERTIFICATION, EXAMINATION, OBSERVATION | Source | Internal |
| `linked_certification_id` | UUID | No | NULL | FK to `certifications` (Entity 474) | Certification-based | Internal |
| `linked_course_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Recommended courses | Internal |
| `assessed_by` | UUID | No | NULL | FK to `workforce_master` | Assessor | Confidential |
| `evidence` | JSONB | No | NULL | — | Evidence (project, certification, etc.) | Confidential |
| `is_expired` | BOOLEAN | Yes | `false` | — | Skill expired (certification-based) | Internal |
| `expiry_date` | DATE | No | NULL | — | Skill expiry | Internal |
| `notes` | TEXT | No | NULL | — | Assessment notes | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, EXPIRED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Competency Matrix (468) | Many-to-One | N:1 | Competency |
| Certification (474) | Many-to-One | N:1 | Certification |
| Course Master (471) | Many-to-Many | N:N | Recommended courses |

### 6. Indexes
- UNIQUE (`employee_id`, `skill_name`)
- INDEX (`company_id`, `skill_category`)
- INDEX (`skill_gap`) — for gap analysis
- INDEX (`expiry_date`, `is_expired`)
- INDEX (`assessed_by`)

### 7. Security Classification
**Confidential** — personnel assessment data.

### 8. Integration Points
- **Competency Engine**: Skill gap analysis
- **Succession Planning** (E506): Skill-based readiness
- **LMS** (Sec 10): Training recommendations
- **Workforce Scheduling Engine** (Sec 6): Skill-based shift assignment
- **HR Analytics** (Sec 13): Skill distribution

### 9. Sample Data
```json
{
  "employee_id": "wf-001", "skill_category": "MACHINE_SKILLS",
  "skill_name": "Forklift Operation", "current_rating": 3, "required_rating": 3,
  "skill_gap": 0, "years_of_experience": 5.50,
  "last_assessed_date": "2026-03-15", "assessment_source": "CERTIFICATION",
  "linked_certification_id": "cert-001", "expiry_date": "2027-03-15",
  "status": "ACTIVE"
}
```

### 10. Audit Events
`SKILL_ASSESSED`, `SKILL_RATING_UPDATED`, `SKILL_EXPIRED`, `SKILL_GAP_IDENTIFIED`, `SKILL_RECERTIFIED`

---

## Entity 474 — Certification

### 1. Business Purpose
Per Part 12 §10: Stores Certificate, Expiry, Renewal, Authority. External and internal certifications earned by employees.

### 2. Architectural Role
Compliance + credential entity — tracks certifications with expiry and renewal. Critical for regulatory compliance (food safety, forklift, ISO, etc.).

### 3. Business Rules
- Certification authority: external (e.g., FSSAI, ISO, Microsoft) or internal
- Expiry: most certifications expire (1-3 years typical)
- Renewal: triggered 90 days before expiry
- Compliance critical: expired certifications may block work assignments (e.g., expired food safety → cannot work in production)
- Verification: document upload + authority verification
- Cost: renewal cost tracking

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `certification_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `certification_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `certification_type` | ENUM | Yes | — | INTERNAL, EXTERNAL, STATUTORY, PROFESSIONAL, TECHNICAL, SAFETY, QUALITY | Type | Internal |
| `issuing_authority` | VARCHAR(200) | Yes | — | Min 3 | Authority (per Part 12: "Authority") — e.g., "FSSAI", "Microsoft", "Internal" | Internal |
| `authority_reference_code` | VARCHAR(50) | No | NULL | — | Authority's reference | Internal |
| `description` | TEXT | Yes | — | Min 20 | Description | Internal |
| `category` | ENUM | Yes | — | FOOD_SAFETY, FORKLIFT, ISO, FIRST_AID, FIRE_SAFETY, IT, PROJECT_MGMT, LEADERSHIP, MACHINE_OP, OTHER | Category | Internal |
| `is_statutory` | BOOLEAN | Yes | `false` | — | Statutory certification | Internal |
| `validity_period_months` | INTEGER | No | NULL | > 0 | Validity (NULL = lifetime) | Internal |
| `requires_renewal` | BOOLEAN | Yes | `true` | — | Requires renewal (per Part 12: "Renewal") | Internal |
| `renewal_lead_time_days` | INTEGER | Yes | `90` | ≥ 30 | Renewal lead time | Internal |
| `renewal_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Renewal cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `linked_competency_id` | UUID | No | NULL | FK to `competency_matrix` (Entity 468) | Linked competency | Internal |
| `linked_course_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Courses that lead to certification | Internal |
| `assessment_required` | BOOLEAN | Yes | `true` | — | Assessment required for renewal | Internal |
| `passing_score_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Passing score | Internal |
| `document_required` | BOOLEAN | Yes | `true` | — | Certificate document | Internal |
| `verification_method` | ENUM | Yes | `DOCUMENT_UPLOAD` | DOCUMENT_UPLOAD, AUTHORITY_API, MANUAL_VERIFY | Verification | Internal |
| `verification_api_config` | JSONB | No | NULL | — | Authority API config | Confidential |
| `blocks_work_if_expired` | BOOLEAN | Yes | `false` | — | Blocks work assignments if expired | Internal |
| `applicable_positions` | UUID[] | No | `ARRAY[]::UUID[]` | — | Required for positions | Internal |
| `applicable_departments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Required for departments | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee Certification | One-to-Many | 1:N | Per-employee instances |
| Competency Matrix (468) | One-to-One | 1:1 | Linked competency |
| Course Master (471) | Many-to-Many | N:N | Certification courses |

### 6. Indexes
- UNIQUE (`certification_code`)
- INDEX (`certification_type`, `category`, `status`)
- INDEX (`is_statutory`, `blocks_work_if_expired`)
- GIN INDEX (`applicable_positions`)
- GIN INDEX (`applicable_departments`)

### 7. Security Classification
**Internal** — renewal cost and API config are **Confidential**.

### 8. Integration Points
- **LMS Engine**: Certification path management
- **Workforce Scheduling Engine** (Sec 6): Blocks assignment if expired
- **Compliance Engine**: Regulatory compliance
- **Notification Service**: Renewal reminders
- **External Authority APIs**: Verification

### 9. Sample Data
```json
{
  "certification_code": "CERT-FSSAI-001", "certification_name": "FSSAI Food Safety Supervisor",
  "certification_type": "STATUTORY", "issuing_authority": "FSSAI",
  "category": "FOOD_SAFETY", "is_statutory": true, "validity_period_months": 36,
  "requires_renewal": true, "renewal_lead_time_days": 90,
  "renewal_cost": 2500.0000, "blocks_work_if_expired": true,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`CERTIFICATION_CREATED`, `CERTIFICATION_UPDATED`, `CERTIFICATION_INACTIVATED`, `CERTIFICATION_AUTHORITY_CHANGED`

---

## Entity 475 — Competency Assessment

### 1. Business Purpose
Per Part 12 §10: Measures Beginner, Intermediate, Advanced, Expert. Formal assessment of employee competency levels.

### 2. Architectural Role
Transaction entity — assessment events that update Skills Matrix (E473). Can be self, manager, or assessment-center based.

### 3. Business Rules
- Assessment types: SELF, MANAGER, ASSESSMENT_CENTER, EXAMINATION, CERTIFICATION, 360
- Levels: BEGINNER (1), INTERMEDIATE (2), ADVANCED (3), EXPERT (4)
- Multiple assessors allowed (averaged or weighted)
- Calibration: HR may calibrate results
- Evidence required: project, certification, observation notes
- Triggers Skills Matrix update

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `assessment_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `competency_matrix_id` | UUID | Yes | — | FK to `competency_matrix` (Entity 468) | Competency | Internal |
| `assessment_type` | ENUM | Yes | — | SELF, MANAGER, ASSESSMENT_CENTER, EXAMINATION, CERTIFICATION, 360 | Type | Internal |
| `assessor_id` | UUID | No | NULL | FK to `workforce_master` | Assessor (NULL for self) | Confidential |
| `assessment_date` | DATE | Yes | — | — | Assessment date | Internal |
| `previous_rating` | INTEGER | No | NULL | 0-4 | Previous rating | Confidential |
| `assessed_rating` | INTEGER | Yes | — | 0-4 | Assessed rating (per Part 12) | Confidential |
| `rating_label` | ENUM | Yes | — | NONE, BEGINNER, INTERMEDIATE, ADVANCED, EXPERT | Label | Internal |
| `assessment_method` | ENUM | Yes | — | OBSERVATION, EXAMINATION, PROJECT_REVIEW, INTERVIEW, CERTIFICATION, 360_FEEDBACK | Method | Internal |
| `evidence` | JSONB | No | NULL | — | Evidence (per Part 12) | Confidential |
| `evidence_attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Document evidence | Confidential |
| `assessment_notes` | TEXT | No | NULL | — | Detailed notes | Confidential |
| `strengths_observed` | TEXT | No | NULL | — | Strengths | Confidential |
| `development_areas` | TEXT | No | NULL | — | Areas for development | Confidential |
| `recommended_courses` | UUID[] | No | `ARRAY[]::UUID[]` | — | Course recommendations | Internal |
| `calibration_applied` | BOOLEAN | Yes | `false` | — | HR calibrated | Internal |
| `calibration_adjustment` | INTEGER | No | NULL | -4 to 4 | Adjustment | Confidential |
| `calibrated_rating` | INTEGER | No | NULL | 0-4 | Final calibrated rating | Confidential |
| `next_assessment_due_date` | DATE | Yes | — | — | Next assessment | Internal |
| `skills_matrix_updated` | BOOLEAN | Yes | `false` | — | Skills Matrix updated | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, IN_PROGRESS, COMPLETED, CALIBRATED, DISPUTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Competency Matrix (468) | Many-to-One | N:1 | Competency |
| Assessor (381) | Many-to-One | N:1 | Assessor |
| Skills Matrix (473) | One-to-One | 1:1 | Updates skill |
| Course Master (471) | Many-to-Many | N:N | Recommendations |

### 6. Indexes
- UNIQUE (`assessment_code`)
- INDEX (`employee_id`, `competency_matrix_id`, `assessment_date`)
- INDEX (`assessor_id`, `assessment_date`)
- INDEX (`assessment_type`, `status`)

### 7. Security Classification
**Confidential** — assessment data is sensitive.

### 8. Integration Points
- **Competency Engine**: Assessment workflow
- **Skills Matrix** (E473): Updates ratings
- **LMS** (Sec 10): Triggers course recommendations
- **Performance Review** (E463): Competency scoring
- **Notification Service**: Results notification

### 9. Sample Data
```json
{
  "assessment_code": "CA-2026-00456", "employee_id": "wf-001",
  "competency_matrix_id": "cm-001", "assessment_type": "MANAGER",
  "assessor_id": "wf-100", "assessment_date": "2026-07-08",
  "assessed_rating": 3, "rating_label": "ADVANCED",
  "assessment_method": "OBSERVATION", "status": "COMPLETED"
}
```

### 10. Audit Events
`COMPETENCY_ASSESSMENT_INITIATED`, `COMPETENCY_ASSESSMENT_COMPLETED`, `COMPETENCY_ASSESSMENT_CALIBRATED`, `COMPETENCY_ASSESSMENT_DISPUTED`

---

## Entity 476 — Learning Assignment

### 1. Business Purpose
Per Part 12 §10: Assigns Courses, Training, Assessments, Videos, Reading. Per-employee learning assignments from various sources.

### 2. Architectural Role
Transaction entity — assignment from manager/LMS/compliance to employee. Tracks progress and completion.

### 3. Business Rules
- Assignment sources: MANAGER, LMS_AUTO (skill gap), COMPLIANCE (mandatory), ONBOARDING, PIP, SELF_NOMINATION
- Priority: CRITICAL (compliance) > HIGH (mandatory) > MEDIUM (recommended) > LOW (optional)
- Due date: based on priority and policy
- Auto-reassign: if not started within X days, escalation
- Compliance assignments cannot be declined
- Self-nomination requires manager approval

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `assignment_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `assigned_by` | UUID | Yes | — | FK to `workforce_master` | Assigner | Confidential |
| `assignment_type` | ENUM | Yes | — | COURSE, TRAINING_PROGRAM, ASSESSMENT, VIDEO, READING, CERTIFICATION_PATH | Type (per Part 12) | Internal |
| `target_entity_id` | UUID | Yes | — | — | Course/Program/Assessment ID | Internal |
| `target_entity_type` | ENUM | Yes | — | COURSE_MASTER, TRAINING_PROGRAM, COMPETENCY_ASSESSMENT, CERTIFICATION | Target type | Internal |
| `assignment_source` | ENUM | Yes | — | MANAGER, LMS_AUTO, COMPLIANCE, ONBOARDING, PIP, SELF_NOMINATION, SUCCESSION_PLAN | Source | Internal |
| `priority` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW | Priority | Internal |
| `is_mandatory` | BOOLEAN | Yes | `false` | — | Mandatory | Internal |
| `is_declinable` | BOOLEAN | Yes | `true` | — | Can decline | Internal |
| `assigned_date` | DATE | Yes | — | — | Assignment date | Internal |
| `due_date` | DATE | Yes | — | > assigned_date | Due date | Internal |
| `start_date` | DATE | No | NULL | — | Actual start | Internal |
| `completion_date` | DATE | No | NULL | — | Completion date | Internal |
| `progress_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Progress | Internal |
| `time_spent_minutes` | INTEGER | Yes | `0` | ≥ 0 | Time spent | Internal |
| `score_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Assessment score | Confidential |
| `passed` | BOOLEAN | No | NULL | — | Pass/fail | Internal |
| `attempts_count` | INTEGER | Yes | `0` | ≥ 0 | Attempts | Internal |
| `decline_reason` | TEXT | No | NULL | — | If declined | Confidential |
| `declined_at` | TIMESTAMPTZ | No | NULL | — | Decline timestamp | Internal |
| `escalation_count` | INTEGER | Yes | `0` | ≥ 0 | Escalations | Internal |
| `last_activity_date` | DATE | No | NULL | — | Last activity | Internal |
| `certificate_earned_id` | UUID | No | NULL | FK to `certifications` (Entity 474) | Certification earned | Internal |
| `skills_matrix_updated` | BOOLEAN | Yes | `false` | — | Skill updated | Internal |
| `linked_performance_review_id` | UUID | No | NULL | FK to `performance_reviews` (Entity 463) | From review | Confidential |
| `linked_pip_id` | UUID | No | NULL | FK to `pip` (Entity 467) | From PIP | Confidential |
| `status` | ENUM | Yes | `ASSIGNED` | ASSIGNED, IN_PROGRESS, COMPLETED, FAILED, DECLINED, EXPIRED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Course Master (471) | Many-to-One | N:1 | Course (if COURSE type) |
| Training Program (472) | Many-to-One | N:1 | Program (if TRAINING type) |
| Certification (474) | Many-to-One | N:1 | Certification path |
| Learning History (479) | One-to-One | 1:1 | History record |

### 6. Indexes
- UNIQUE (`assignment_code`)
- INDEX (`employee_id`, `status`)
- INDEX (`assigned_by`, `status`)
- INDEX (`priority`, `due_date`, `status`)
- INDEX (`assignment_source`)

### 7. Security Classification
**Confidential** — assignment data linked to performance.

### 8. Integration Points
- **LMS Engine**: Assignment tracking
- **Notification Service**: Reminders & escalations
- **ESS Portal** (E481): My Learning
- **Compliance Engine**: Mandatory tracking
- **Worklog**: Tracks learning progress

### 9. Sample Data
```json
{
  "assignment_code": "LA-2026-01234", "employee_id": "wf-001",
  "assigned_by": "wf-100", "assignment_type": "COURSE",
  "target_entity_id": "crs-fs-001", "target_entity_type": "COURSE_MASTER",
  "assignment_source": "COMPLIANCE", "priority": "CRITICAL",
  "is_mandatory": true, "is_declinable": false,
  "assigned_date": "2026-07-01", "due_date": "2026-07-31",
  "progress_pct": 65.00, "time_spent_minutes": 156,
  "status": "IN_PROGRESS"
}
```

### 10. Audit Events
`LEARNING_ASSIGNED`, `LEARNING_STARTED`, `LEARNING_PROGRESS_UPDATED`, `LEARNING_COMPLETED`, `LEARNING_FAILED`, `LEARNING_DECLINED`, `LEARNING_EXPIRED`, `LEARNING_ESCALATED`

---

## Entity 477 — Examination

### 1. Business Purpose
Per Part 12 §10: Supports MCQ, Practical, Online, Offline. Examination management for assessments and certifications.

### 2. Architectural Role
Assessment delivery entity — manages exam scheduling, question banks, delivery, and scoring.

### 3. Business Rules
- Exam types: MCQ (multiple choice), PRACTICAL (hands-on), ONLINE (proctored), OFFLINE (paper-based), ORAL, MIXED
- Question bank: pool of questions randomly selected per attempt
- Proctoring: AI proctoring for online exams (video, audio, screen monitoring)
- Anti-cheating: random question order, tab-switch detection, time limits
- Multiple attempts: per Course Master max_attempts
- Re-examination: after cooling period (7 days typical)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `exam_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `exam_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `course_id` | UUID | No | NULL | FK to `course_master` (Entity 471) | Linked course | Internal |
| `certification_id` | UUID | No | NULL | FK to `certifications` (Entity 474) | Linked certification | Internal |
| `exam_type` | ENUM | Yes | — | MCQ, PRACTICAL, ONLINE, OFFLINE, ORAL, MIXED | Type (per Part 12) | Internal |
| `total_questions` | INTEGER | Yes | — | > 0 | Total questions | Internal |
| `total_marks` | DECIMAL(7,2) | Yes | — | > 0 | Total marks | Internal |
| `passing_marks` | DECIMAL(7,2) | Yes | — | > 0, ≤ total_marks | Passing marks | Internal |
| `passing_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Passing % | Internal |
| `duration_minutes` | INTEGER | Yes | — | > 0 | Exam duration | Internal |
| `question_bank_id` | UUID | No | NULL | FK to `question_banks` | Question bank | Internal |
| `question_distribution` | JSONB | Yes | `'{}'` | — | { category: count } | Internal |
| `random_question_count` | INTEGER | No | NULL | ≤ total_questions | Random selection | Internal |
| `shuffle_questions` | BOOLEAN | Yes | `true` | — | Shuffle order | Internal |
| `shuffle_options` | BOOLEAN | Yes | `true` | — | Shuffle MCQ options | Internal |
| `negative_marking_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Negative marking | Internal |
| `max_attempts` | INTEGER | Yes | `3` | ≥ 1 | Max attempts | Internal |
| `cooling_period_days` | INTEGER | Yes | `7` | ≥ 0 | Days between attempts | Internal |
| `proctoring_required` | BOOLEAN | Yes | `false` | — | Proctoring (online) | Internal |
| `proctoring_config` | JSONB | No | NULL | — | AI proctoring config | Confidential |
| `is_open_book` | BOOLEAN | Yes | `false` | — | Open book | Internal |
| `allowed_materials` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Allowed materials | Internal |
| `schedule_start` | TIMESTAMPTZ | Yes | — | — | Schedule start | Internal |
| `schedule_end` | TIMESTAMPTZ | Yes | — | > start | Schedule end | Internal |
| `attempts_count` | INTEGER | Yes | `0` | ≥ 0 | Total attempts | Internal |
| `passed_count` | INTEGER | Yes | `0` | ≥ 0 | Total passed | Internal |
| `average_score_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Average score | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Course Master (471) | Many-to-One | N:1 | Course |
| Certification (474) | Many-to-One | N:1 | Certification |
| Question Bank | Many-to-One | N:1 | Question pool |
| Exam Attempt | One-to-Many | 1:N | Per-employee attempts |

### 6. Indexes
- UNIQUE (`exam_code`)
- INDEX (`course_id`, `status`)
- INDEX (`certification_id`, `status`)
- INDEX (`schedule_start`, `schedule_end`)

### 7. Security Classification
**Internal** — proctoring config is **Confidential**.

### 8. Integration Points
- **LMS Engine**: Exam delivery
- **AI Proctoring Service**: Online exam monitoring
- **Certification Engine**: Certification awarding
- **Notification Service**: Exam reminders
- **BI Service**: Exam analytics

### 9. Sample Data
```json
{
  "exam_code": "EXAM-FS-001", "exam_name": "Food Safety Fundamentals Exam",
  "course_id": "crs-fs-001", "exam_type": "ONLINE",
  "total_questions": 50, "total_marks": 50.00, "passing_marks": 40.00,
  "passing_pct": 80.00, "duration_minutes": 60,
  "shuffle_questions": true, "max_attempts": 3,
  "proctoring_required": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`EXAM_CREATED`, `EXAM_UPDATED`, `EXAM_SCHEDULED`, `EXAM_ATTEMPT_STARTED`, `EXAM_ATTEMPT_SUBMITTED`, `EXAM_PROCTORING_ALERT`

---

## Entity 478 — Training Attendance

### 1. Business Purpose
Per Part 12 §10: Tracks Present, Absent, Score, Completion. Per-session attendance for training programs.

### 2. Architectural Role
Transaction entity — attendance records per session per employee. Drives completion calculation.

### 3. Business Rules
- Attendance per session (multi-session programs have multiple records)
- Attendance methods: BIOMETRIC, QR_CODE, MANUAL, SELF_CHECK_IN
- Min attendance % for completion: 80% typical
- Late arrival: marked LATE (may affect completion)
- Make-up sessions: missed sessions can be made up

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `training_program_id` | UUID | Yes | — | FK to `training_programs` (Entity 472) | Program | Internal |
| `session_id` | UUID | No | NULL | — | Specific session (if multi-session) | Internal |
| `session_date` | DATE | Yes | — | — | Session date | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `attendance_status` | ENUM | Yes | — | PRESENT, ABSENT, LATE, EXCUSED, PARTIAL | Status | Internal |
| `check_in_time` | TIMESTAMPTZ | No | NULL | — | Check-in time | Internal |
| `check_out_time` | TIMESTAMPTZ | No | NULL | — | Check-out time | Internal |
| `actual_duration_minutes` | INTEGER | No | NULL | ≥ 0 | Actual duration | Internal |
| `attendance_method` | ENUM | Yes | `MANUAL` | BIOMETRIC, QR_CODE, MANUAL, SELF_CHECK_IN | Method | Internal |
| `late_arrival_minutes` | INTEGER | Yes | `0` | ≥ 0 | Late by minutes | Internal |
| `early_leave_minutes` | INTEGER | Yes | `0` | ≥ 0 | Early leave | Internal |
| `score_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Assessment score (per Part 12: "Score") | Confidential |
| `passed` | BOOLEAN | No | NULL | — | Passed | Internal |
| `completion_status` | ENUM | Yes | `IN_PROGRESS` | IN_PROGRESS, COMPLETED, INCOMPLETE, FAILED | Completion (per Part 12: "Completion") | Internal |
| `attendance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Overall attendance % | Internal |
| `feedback_submitted` | BOOLEAN | Yes | `false` | — | Feedback submitted | Internal |
| `feedback_score` | DECIMAL(3,2) | No | NULL | 0-5 | Feedback rating | Internal |
| `marked_by` | UUID | Yes | — | FK to `workforce_master` | Marked by | Confidential |
| `marked_at` | TIMESTAMPTZ | Yes | `now()` | — | Marked timestamp | Internal |
| `notes` | TEXT | No | NULL | — | Notes | Confidential |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, UPDATED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Training Program (472) | Many-to-One | N:1 | Program |
| Employee (381) | Many-to-One | N:1 | Employee |
| Learning History (479) | One-to-One | 1:1 | History record |

### 6. Indexes
- UNIQUE (`training_program_id`, `session_id`, `employee_id`)
- INDEX (`employee_id`, `session_date`)
- INDEX (`attendance_status`, `completion_status`)
- INDEX (`session_date`)

### 7. Security Classification
**Confidential** — employee attendance data.

### 8. Integration Points
- **LMS Engine**: Attendance tracking
- **Learning Assignment** (E476): Updates progress
- **Compensation Rules Engine** (Q161): Training hours for OT calculation
- **BI Service**: Training analytics

### 9. Sample Data
```json
{
  "training_program_id": "tp-001", "session_date": "2026-07-15",
  "employee_id": "wf-001", "attendance_status": "PRESENT",
  "check_in_time": "2026-07-15T09:55:00Z", "check_out_time": "2026-07-15T13:05:00Z",
  "actual_duration_minutes": 190, "attendance_method": "QR_CODE",
  "score_pct": 85.00, "passed": true, "completion_status": "COMPLETED",
  "attendance_pct": 100.00, "status": "RECORDED"
}
```

### 10. Audit Events
`TRAINING_ATTENDANCE_RECORDED`, `TRAINING_ATTENDANCE_UPDATED`, `TRAINING_ATTENDANCE_CANCELLED`, `TRAINING_COMPLETION_MARKED`

---

## Entity 479 — Learning History

### 1. Business Purpose
Per Part 12 §10: Stores Completed, Failed, Expired, Renewed. Permanent learning record per employee.

### 2. Architectural Role
Immutable history entity — append-only record of all learning events. Used for compliance audits and career progression.

### 3. Business Rules
- Append-only: never updated or deleted (only corrected via new record)
- Retention: lifetime of employee + 7 years post-exit
- Records: course completions, exam attempts, certifications, assessments
- Renewal chain: links original certification to renewal
- Compliance audit: source of truth for regulatory inspections

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `history_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `record_type` | ENUM | Yes | — | COURSE_COMPLETION, COURSE_FAILURE, EXAM_ATTEMPT, CERTIFICATION_EARNED, CERTIFICATION_EXPIRED, CERTIFICATION_RENEWED, ASSESSMENT, TRAINING_COMPLETED | Type | Internal |
| `outcome` | ENUM | Yes | — | COMPLETED, FAILED, EXPIRED, RENEWED, WITHDRAWN | Outcome (per Part 12) | Internal |
| `course_id` | UUID | No | NULL | FK to `course_master` (Entity 471) | Course | Internal |
| `training_program_id` | UUID | No | NULL | FK to `training_programs` (Entity 472) | Program | Internal |
| `exam_id` | UUID | No | NULL | FK to `examinations` (Entity 477) | Exam | Internal |
| `certification_id` | UUID | No | NULL | FK to `certifications` (Entity 474) | Certification | Internal |
| `competency_matrix_id` | UUID | No | NULL | FK to `competency_matrix` (Entity 468) | Competency | Internal |
| `learning_assignment_id` | UUID | No | NULL | FK to `learning_assignments` (Entity 476) | Assignment | Internal |
| `event_date` | DATE | Yes | — | — | Event date | Internal |
| `completion_date` | DATE | No | NULL | — | Completion date | Internal |
| `score_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Score | Confidential |
| `passed` | BOOLEAN | No | NULL | — | Pass/fail | Internal |
| `duration_hours` | DECIMAL(5,2) | No | NULL | ≥ 0 | Duration | Internal |
| `certificate_number` | VARCHAR(50) | No | NULL | — | Certificate number | Confidential |
| `certificate_attachment_id` | UUID | No | NULL | FK to `attachments` | Certificate document | Confidential |
| `validity_start_date` | DATE | No | NULL | — | Validity start | Internal |
| `validity_end_date` | DATE | No | NULL | — | Validity end | Internal |
| `renewal_of_history_id` | UUID | No | NULL | FK to `learning_history` | Original record (if renewal) | Internal |
| `vendor_id` | UUID | No | NULL | FK to `vendors` | External vendor | Internal |
| `cost_incurred` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `acquired_skills` | JSONB | No | NULL | — | Skills gained | Internal |
| `event_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Event timestamp | Internal |
| `retention_until` | DATE | Yes | — | — | Retention expiry | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Course Master (471) | Many-to-One | N:1 | Course |
| Training Program (472) | Many-to-One | N:1 | Program |
| Certification (474) | Many-to-One | N:1 | Certification |
| Self (479) | Self-reference | N:1 | Renewal chain |

### 6. Indexes
- UNIQUE (`history_code`)
- INDEX (`employee_id`, `event_date`)
- INDEX (`record_type`, `outcome`)
- INDEX (`certification_id`, `validity_end_date`)
- INDEX (`retention_until`)

### 7. Security Classification
**Confidential** — employee learning data.

### 8. Integration Points
- **Compliance Audit**: Regulatory inspections
- **Skills Matrix** (E473): Updates skills
- **HR Analytics** (Sec 13): Learning analytics
- **ESS Portal** (E481): My Learning History
- **BI Service**: Learning dashboards

### 9. Sample Data
```json
{
  "history_code": "LH-2026-01234", "employee_id": "wf-001",
  "record_type": "CERTIFICATION_EARNED", "outcome": "COMPLETED",
  "certification_id": "cert-001", "event_date": "2026-03-15",
  "score_pct": 85.00, "passed": true, "duration_hours": 4.00,
  "certificate_number": "FSSAI-2026-001234",
  "validity_start_date": "2026-03-15", "validity_end_date": "2029-03-14",
  "status": "RECORDED"
}
```

### 10. Audit Events
`LEARNING_HISTORY_RECORDED`, `LEARNING_HISTORY_ARCHIVED`, `LEARNING_CERTIFICATE_EXPIRED`, `LEARNING_CERTIFICATE_RENEWED`

---

## Entity 480 — LMS Dashboard

### 1. Business Purpose
Per Part 12 §10: Displays Courses, Completion, Certificates, Skill Gap, Compliance. AI: Skill Recommendation, Training Recommendation, Successor Planning, Career Path, Learning Forecast.

### 2. Architectural Role
Aggregated view entity — powers LMS dashboards across ESS, MSS, and HR Mission Control.

### 3. Business Rules
- Snapshot-based: refreshed daily + on completion events
- Multi-grain: per-employee, per-team, per-department, per-company
- Compliance tracking: expiring certifications, mandatory courses pending
- AI insights: skill recommendations, career path, learning forecast

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `snapshot_type` | ENUM | Yes | — | EMPLOYEE, TEAM, DEPARTMENT, COMPANY | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity reference | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `total_courses_assigned` | INTEGER | Yes | `0` | ≥ 0 | Courses (per Part 12) | Internal |
| `total_courses_completed` | INTEGER | Yes | `0` | ≥ 0 | Completed | Internal |
| `completion_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Completion % (per Part 12) | Internal |
| `completion_trend_30d` | JSONB | Yes | `'[]'` | — | 30-day trend | Internal |
| `active_certificates_count` | INTEGER | Yes | `0` | ≥ 0 | Certificates (per Part 12) | Internal |
| `expiring_certificates_count` | INTEGER | Yes | `0` | ≥ 0 | Expiring in 90 days | Internal |
| `expired_certificates_count` | INTEGER | Yes | `0` | ≥ 0 | Expired | Internal |
| `compliance_training_pending` | INTEGER | Yes | `0` | ≥ 0 | Compliance pending | Internal |
| `compliance_completion_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Compliance % (per Part 12) | Internal |
| `skill_gap_count` | INTEGER | Yes | `0` | ≥ 0 | Skill gaps (per Part 12) | Internal |
| `skill_gap_by_category` | JSONB | Yes | `'{}'` | — | Gap by category | Confidential |
| `training_hours_ytd` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Training hours YTD | Internal |
| `training_cost_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Training cost YTD | Confidential |
| `learning_hours_per_employee` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Avg hours | Internal |
| `top_skills` | JSONB | Yes | `'[]'` | — | Top skills | Internal |
| `skill_distribution` | JSONB | Yes | `'{}'` | — | Skill dist | Internal |
| `skill_recommendation` | JSONB | No | NULL | — | AI: skill recommendations (per Part 12 AI) | Confidential |
| `training_recommendation` | JSONB | No | NULL | — | AI: training recommendations (per Part 12 AI) | Confidential |
| `successor_planning` | JSONB | No | NULL | — | AI: successor suggestions (per Part 12 AI) | Confidential |
| `career_path` | JSONB | No | NULL | — | AI: career path (per Part 12 AI) | Confidential |
| `learning_forecast` | JSONB | No | NULL | — | AI: learning forecast (per Part 12 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
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
**Confidential** — skill gaps and AI insights are sensitive.

### 8. Integration Points
- **BI Service**: LMS dashboards
- **AI/ML Service**: Recommendations
- **HR Mission Control** (E509): Operational dashboard
- **ESS Portal** (E481): My Learning
- **MSS Portal** (E491): Team learning
- **Compliance Engine**: Compliance tracking

### 9. Sample Data
```json
{
  "snapshot_date": "2026-07-08", "snapshot_type": "DEPARTMENT",
  "entity_id": "dept-qa", "company_id": "cmp-001",
  "total_courses_assigned": 145, "total_courses_completed": 120,
  "completion_pct": 82.76, "active_certificates_count": 35,
  "expiring_certificates_count": 8, "expired_certificates_count": 2,
  "compliance_completion_pct": 95.00, "skill_gap_count": 12,
  "training_hours_ytd": 480.50, "status": "COMPLETED"
}
```

### 10. Audit Events
`LMS_DASHBOARD_SNAPSHOT_CREATED`, `LMS_DASHBOARD_AI_REFRESHED`, `LMS_DASHBOARD_COMPLIANCE_ALERT`, `LMS_DASHBOARD_CERTIFICATION_EXPIRY_ALERT`

---

# SECTION 11: Employee Self-Service (ESS) (Entities 481-490)

## Entity 481 — Employee Portal

### 1. Business Purpose
Per Part 12 §11: Unified employee portal aggregating all self-service features.

### 2. Architectural Role
Platform entity — single entry point for employees. Provides SSO, role-based widgets, and unified task inbox.

### 3. Business Rules
- Single sign-on (SSO) with Workforce ID
- Role-based dashboard: worker sees attendance/payslip; manager sees approvals
- Task-driven UX: tasks (per Vol 0) appear in inbox
- Multi-device: Mobile App, Tablet, Desktop
- Offline support: offline requests sync when online
- Personalization: configurable widgets

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `portal_session_id` | VARCHAR(100) | Yes | — | Unique | Session ID | Confidential |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `device_type` | ENUM | Yes | — | MOBILE_APP, TABLET, DESKTOP, KIOSK | Device | Internal |
| `platform` | ENUM | Yes | — | WEB, IOS, ANDROID, WINDOWS, MAC | Platform | Internal |
| `app_version` | VARCHAR(20) | Yes | — | — | App version | Internal |
| `login_method` | ENUM | Yes | — | PASSWORD, BIOMETRIC, OTP, SSO, QR | Method | Internal |
| `login_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Login time | Internal |
| `logout_timestamp` | TIMESTAMPTZ | No | NULL | — | Logout time | Internal |
| `session_duration_minutes` | INTEGER | No | NULL | ≥ 0 | Session duration | Internal |
| `last_activity_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Last activity | Internal |
| `widgets_config` | JSONB | Yes | `'{}'` | — | Dashboard widgets config | Internal |
| `task_inbox_count` | INTEGER | Yes | `0` | ≥ 0 | Pending tasks | Internal |
| `notifications_count` | INTEGER | Yes | `0` | ≥ 0 | Unread notifications | Internal |
| `offline_mode_enabled` | BOOLEAN | Yes | `false` | — | Offline mode | Internal |
| `offline_pending_sync_count` | INTEGER | Yes | `0` | ≥ 0 | Pending sync | Internal |
| `language_preference` | VARCHAR(10) | Yes | `en-IN` | — | Language | Internal |
| `theme_preference` | ENUM | Yes | `LIGHT` | LIGHT, DARK, SYSTEM | Theme | Internal |
| `ip_address` | INET | No | NULL | — | Source IP | Confidential |
| `geo_location` | JSONB | No | NULL | — | Geo location (if enabled) | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, LOGGED_OUT, EXPIRED, TERMINATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5-10. (Standard pattern — abbreviated for ESS entities)

**Indexes**: (`employee_id`, `status`), (`login_timestamp`)
**Security**: Confidential — session data is sensitive
**Integration**: SSO Service, Notification Service, Task Engine, Mobile Push Service
**Sample**: `{"employee_id": "wf-001", "device_type": "MOBILE_APP", "platform": "ANDROID", "login_method": "BIOMETRIC"}`
**Audit Events**: `ESS_LOGIN`, `ESS_LOGOUT`, `ESS_SESSION_EXPIRED`, `ESS_OFFLINE_MODE_ENABLED`

---

## Entity 482 — Payslip (ESS)

### 1. Business Purpose
ESS access to payslips — view, download, email.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `payslip_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `payroll_processing_id` | UUID | Yes | — | FK to `payroll_processing` (Entity 454) | Source | Confidential |
| `payroll_period` | VARCHAR(20) | Yes | — | — | Period (e.g., "July 2026") | Internal |
| `pay_date` | DATE | Yes | — | — | Pay date | Internal |
| `gross_earnings` | DECIMAL(18,4) | Yes | — | ≥ 0 | Gross | Confidential |
| `total_deductions` | DECIMAL(18,4) | Yes | — | ≥ 0 | Deductions | Confidential |
| `net_pay` | DECIMAL(18,4) | Yes | — | ≥ 0 | Net pay | Confidential |
| `components_breakup` | JSONB | Yes | `'[]'` | — | Per-component | Confidential |
| `year_to_date` | JSONB | Yes | `'{}'` | — | YTD figures | Confidential |
| `tax_deductions_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | TDS YTD | Confidential |
| `pdf_attachment_id` | UUID | Yes | — | FK to `attachments` | PDF document | Confidential |
| `is_password_protected` | BOOLEAN | Yes | `true` | — | Password protected PDF | Internal |
| `password_hint` | VARCHAR(100) | No | NULL | — | Hint (typically DOB) | Confidential |
| `viewed_by_employee` | BOOLEAN | Yes | `false` | — | Viewed | Internal |
| `viewed_at` | TIMESTAMPTZ | No | NULL | — | View timestamp | Internal |
| `downloaded_at` | TIMESTAMPTZ | No | NULL | — | Download timestamp | Internal |
| `emailed_at` | TIMESTAMPTZ | No | NULL | — | Email timestamp | Internal |
| `status` | ENUM | Yes | `GENERATED` | GENERATED, VIEWED, DOWNLOADED, EMAILED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

**Integration**: Payroll Engine, Document Service, Notification Service, Email Service

---

## Entity 483 — Leave Request (ESS)

### 1. Business Purpose
ESS leave request submission — employee self-service.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ess_request_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `leave_request_id` | UUID | Yes | — | FK to `leave_requests` (Entity 444) | Source | Confidential |
| `submission_source` | ENUM | Yes | `MOBILE_APP` | MOBILE_APP, TABLET, DESKTOP, KIOSK, OFFLINE | Source | Internal |
| `is_offline_submission` | BOOLEAN | Yes | `false` | — | Offline | Internal |
| `synced_at` | TIMESTAMPTZ | No | NULL | — | Sync timestamp (if offline) | Internal |
| `balance_checked` | BOOLEAN | Yes | `true` | — | Balance validated | Internal |
| `balance_at_submission` | DECIMAL(6,2) | Yes | — | ≥ 0 | Balance snapshot | Confidential |
| `predicted_approval` | ENUM | No | NULL | LIKELY, UNCERTAIN, UNLIKELY | AI prediction | Confidential |
| `team_calendar_checked` | BOOLEAN | Yes | `true` | — | Team calendar check | Internal |
| `conflicting_leaves` | JSONB | No | NULL | — | Conflicts | Internal |
| `status` | ENUM | Yes | `SUBMITTED` | DRAFT, SUBMITTED, SYNCED, FAILED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 484 — Attendance View (ESS)

### 1. Business Purpose
ESS attendance view — daily/monthly attendance, punch correction requests.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `view_date` | DATE | Yes | — | — | View date | Internal |
| `attendance_summary` | JSONB | Yes | `'{}'` | — | Daily summary | Confidential |
| `monthly_summary` | JSONB | Yes | `'{}'` | — | Monthly summary | Confidential |
| `punch_records` | JSONB | Yes | `'[]'` | — | Punch in/out records | Confidential |
| `shift_assigned` | JSONB | No | NULL | — | Shift | Internal |
| `overtime_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | OT | Internal |
| `leave_balance_summary` | JSONB | Yes | `'{}'` | — | Leave balances | Confidential |
| `correction_requests_count` | INTEGER | Yes | `0` | ≥ 0 | Pending corrections | Internal |
| `holiday_upcoming` | JSONB | Yes | `'[]'` | — | Upcoming holidays | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 485 — Expense Claim (ESS)

### 1. Business Purpose
ESS expense claim submission — employee reimbursement self-service.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ess_claim_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `reimbursement_id` | UUID | Yes | — | FK to `reimbursements` (Entity 457) | Source | Confidential |
| `submission_source` | ENUM | Yes | `MOBILE_APP` | MOBILE_APP, DESKTOP, OFFLINE | Source | Internal |
| `bills_uploaded_count` | INTEGER | Yes | `0` | ≥ 0 | Bills uploaded | Internal |
| `total_bills_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Bills total | Confidential |
| `ocr_processed` | BOOLEAN | Yes | `false` | — | OCR done | Internal |
| `ocr_extraction` | JSONB | No | NULL | — | OCR extracted data | Confidential |
| `policy_validation` | JSONB | Yes | `'{}'` | — | Policy check results | Internal |
| `policy_violations` | JSONB | No | NULL | — | Violations | Confidential |
| `predicted_approval` | ENUM | No | NULL | LIKELY, UNCERTAIN, UNLIKELY | AI prediction | Confidential |
| `status` | ENUM | Yes | `SUBMITTED` | DRAFT, SUBMITTED, SYNCED, FAILED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 486 — Loan Request (ESS)

### 1. Business Purpose
ESS loan application — employee loan request self-service.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ess_loan_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `loan_type` | ENUM | Yes | — | PERSONAL, VEHICLE, HOUSE, MEDICAL, FESTIVAL, SALARY_ADVANCE | Type | Internal |
| `requested_amount` | DECIMAL(18,4) | Yes | — | > 0 | Requested | Confidential |
| `requested_tenure_months` | INTEGER | Yes | — | 1-360 | Tenure | Internal |
| `purpose` | TEXT | Yes | — | Min 20 | Purpose | Confidential |
| `eligibility_check` | JSONB | Yes | `'{}'` | — | Eligibility | Confidential |
| `eligible_amount_max` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Max eligible | Confidential |
| `existing_loans_outstanding` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Existing | Confidential |
| `proposed_emi` | DECIMAL(18,4) | Yes | — | ≥ 0 | Proposed EMI | Confidential |
| `emi_to_salary_ratio` | DECIMAL(5,2) | Yes | `0` | 0-100 | EMI/Salary % | Confidential |
| `employee_loan_id` | UUID | No | NULL | FK to `employee_loans` (Entity 456) | Approved loan | Confidential |
| `status` | ENUM | Yes | `SUBMITTED` | DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 487 — Profile Update (ESS)

### 1. Business Purpose
ESS profile update — employee self-service for personal data updates.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ess_profile_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `update_category` | ENUM | Yes | — | CONTACT, ADDRESS, FAMILY, BANK, EDUCATION, EMERGENCY_CONTACT, IDENTITY | Category | Internal |
| `field_changes` | JSONB | Yes | `'[]'` | — | Per-field changes [{ field, before, after }] | Confidential |
| `attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Supporting documents | Confidential |
| `requires_verification` | BOOLEAN | Yes | `true` | — | Verification required | Internal |
| `verification_method` | ENUM | Yes | `DOCUMENT` | DOCUMENT, OTP, MANAGER_APPROVAL, HR_VERIFICATION | Method | Internal |
| `approval_required` | BOOLEAN | Yes | `true` | — | Approval required | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval time | Internal |
| `workforce_master_updated` | BOOLEAN | Yes | `false` | — | Master updated | Internal |
| `status` | ENUM | Yes | `SUBMITTED` | DRAFT, SUBMITTED, APPROVED, REJECTED, APPLIED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 488 — Document Download (ESS)

### 1. Business Purpose
ESS document download — payslips, Form 16, experience letters, certificates.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `document_type` | ENUM | Yes | — | PAYSLIP, FORM_16, EXPERIENCE_LETTER, RELIEVING_LETTER, SALARY_CERTIFICATE, BONUS_LETTER, APPOINTMENT_LETTER, CONFIRMATION_LETTER, ID_CARD | Type | Internal |
| `document_reference_id` | UUID | Yes | — | — | Source document | Internal |
| `period_reference` | VARCHAR(50) | No | NULL | — | Period (e.g., "2026-07") | Internal |
| `attachment_id` | UUID | Yes | — | FK to `attachments` | Document | Confidential |
| `is_password_protected` | BOOLEAN | Yes | `true` | — | Protected | Internal |
| `requested_at` | TIMESTAMPTZ | Yes | `now()` | — | Request time | Internal |
| `downloaded_at` | TIMESTAMPTZ | No | NULL | — | Download time | Internal |
| `download_method` | ENUM | Yes | `DOWNLOAD` | DOWNLOAD, EMAIL, WHATSAPP | Method | Internal |
| `ip_address` | INET | Yes | — | — | Source IP | Confidential |
| `status` | ENUM | Yes | `REQUESTED` | REQUESTED, GENERATED, DOWNLOADED, EMAILED, FAILED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 489 — Training Portal (ESS)

### 1. Business Purpose
ESS training portal — browse courses, enroll, complete, view history.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `recommended_courses` | JSONB | Yes | `'[]'` | — | AI recommendations | Confidential |
| `mandatory_courses_pending` | JSONB | Yes | `'[]'` | — | Mandatory pending | Internal |
| `enrolled_courses` | JSONB | Yes | `'[]'` | — | Currently enrolled | Internal |
| `completed_courses_count` | INTEGER | Yes | `0` | ≥ 0 | Completed count | Internal |
| `active_certifications` | JSONB | Yes | `'[]'` | — | Active certs | Internal |
| `expiring_certifications` | JSONB | Yes | `'[]'` | — | Expiring | Internal |
| `learning_history_summary` | JSONB | Yes | `'{}'` | — | History | Confidential |
| `skill_gap_summary` | JSONB | Yes | `'{}'` | — | Skill gaps | Confidential |
| `career_path_suggested` | JSONB | No | NULL | — | AI career path | Confidential |
| `learning_hours_ytd` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Hours YTD | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 490 — ESS Dashboard

### 1. Business Purpose
Per Part 12 §11: Supports Mobile App, Tablet, Desktop, Offline Requests. Unified employee dashboard.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `device_preference` | ENUM | Yes | `MOBILE_APP` | MOBILE_APP, TABLET, DESKTOP | Device (per Part 12) | Internal |
| `widgets_active` | JSONB | Yes | `'[]'` | — | Active widgets | Internal |
| `task_inbox_count` | INTEGER | Yes | `0` | ≥ 0 | Pending tasks | Internal |
| `task_inbox_items` | JSONB | Yes | `'[]'` | — | Task items | Confidential |
| `notifications_unread` | INTEGER | Yes | `0` | ≥ 0 | Unread notifications | Internal |
| `notifications_items` | JSONB | Yes | `'[]'` | — | Notifications | Confidential |
| `leave_balance_summary` | JSONB | Yes | `'{}'` | — | Leave balances | Confidential |
| `attendance_today` | JSONB | Yes | `'{}'` | — | Today's attendance | Confidential |
| `attendance_month_summary` | JSONB | Yes | `'{}'` | — | Month summary | Confidential |
| `payslip_last` | JSONB | Yes | `'{}'` | — | Last payslip summary | Confidential |
| `performance_summary` | JSONB | Yes | `'{}'` | — | Current rating, KPIs | Confidential |
| `learning_summary` | JSONB | Yes | `'{}'` | — | Courses, certifications | Confidential |
| `team_calendar` | JSONB | No | NULL | — | Team leave calendar | Confidential |
| `announcements` | JSONB | Yes | `'[]'` | — | Company announcements | Internal |
| `birthdays_this_month` | JSONB | Yes | `'[]'` | — | Team birthdays | Internal |
| `offline_requests_pending` | INTEGER | Yes | `0` | ≥ 0 | Offline requests (per Part 12) | Internal |
| `offline_requests_synced` | INTEGER | Yes | `0` | ≥ 0 | Synced | Internal |
| `quick_actions` | JSONB | Yes | `'[]'` | — | Quick action shortcuts | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI personalized insights | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 12: Manager Self-Service (MSS) (Entities 491-500)

## Entity 491 — Manager Dashboard

### 1. Business Purpose
Per Part 12 §12: Unified manager dashboard for team management and approvals.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `direct_reports_count` | INTEGER | Yes | `0` | ≥ 0 | Direct reports | Internal |
| `total_team_size` | INTEGER | Yes | `0` | ≥ 0 | Total team (incl. skip-level) | Internal |
| `pending_approvals_count` | INTEGER | Yes | `0` | ≥ 0 | Pending approvals | Internal |
| `pending_approvals_breakup` | JSONB | Yes | `'{}'` | — | By type | Confidential |
| `team_attendance_today` | JSONB | Yes | `'{}'` | — | Attendance summary | Confidential |
| `team_leave_calendar` | JSONB | Yes | `'[]'` | — | 30-day calendar | Confidential |
| `team_performance_summary` | JSONB | Yes | `'{}'` | — | Performance ratings | Confidential |
| `team_okr_summary` | JSONB | Yes | `'{}'` | — | OKR achievement | Confidential |
| `team_learning_summary` | JSONB | Yes | `'{}'` | — | Learning progress | Confidential |
| `team_vacancies` | INTEGER | Yes | `0` | ≥ 0 | Open positions | Internal |
| `team_pip_count` | INTEGER | Yes | `0` | ≥ 0 | Active PIPs | Confidential |
| `team_attrition_risk` | JSONB | No | NULL | — | AI attrition risk | Restricted |
| `alerts` | JSONB | Yes | `'[]'` | — | Manager alerts | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI team insights | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 492 — Attendance Approval (MSS)

### 1. Business Purpose
MSS attendance approval — manager approval for attendance exceptions, regularizations, overtime.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `approval_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `attendance_exception_id` | UUID | Yes | — | FK to `attendance_exceptions` (Entity 438) | Source | Confidential |
| `approval_type` | ENUM | Yes | — | REGULARIZATION, OVERTIME, MISS_PUNCH, MANUAL_PUNCH, SHIFT_CHANGE | Type | Internal |
| `requested_date` | DATE | Yes | — | — | Requested date | Internal |
| `reason` | TEXT | Yes | — | Min 10 | Reason | Confidential |
| `evidence_attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Evidence | Confidential |
| `decision` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED | Decision | Internal |
| `decision_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `decision_at` | TIMESTAMPTZ | No | NULL | — | Decision time | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA deadline | Internal |
| `escalated` | BOOLEAN | Yes | `false` | — | Escalated | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, ESCALATED, EXPIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 493 — Leave Approval (MSS)

### 1. Business Purpose
MSS leave approval — manager approval for team leave requests.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `approval_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `leave_request_id` | UUID | Yes | — | FK to `leave_requests` (Entity 444) | Source | Confidential |
| `leave_approval_id` | UUID | Yes | — | FK to `leave_approvals` (Entity 445) | Approval chain | Confidential |
| `team_impact` | JSONB | Yes | `'{}'` | — | Team impact analysis | Internal |
| `coverage_during_absence` | UUID | No | NULL | FK to `workforce_master` | Coverage assignee | Confidential |
| `conflicting_leaves` | JSONB | No | NULL | — | Conflicting team leaves | Internal |
| `decision` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, DELEGATED | Decision | Internal |
| `decision_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `decision_at` | TIMESTAMPTZ | No | NULL | — | Time | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA | Internal |
| `delegated_to` | UUID | No | NULL | FK to `workforce_master` | Delegated | Confidential |
| `ai_recommendation` | ENUM | No | NULL | APPROVE, REJECT, REVIEW | AI suggestion | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, DELEGATED, ESCALATED, EXPIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 494 — Expense Approval (MSS)

### 1. Business Purpose
MSS expense approval — manager approval for team expense claims.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `approval_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `reimbursement_id` | UUID | Yes | — | FK to `reimbursements` (Entity 457) | Source | Confidential |
| `policy_validation` | JSONB | Yes | `'{}'` | — | Policy check | Internal |
| `policy_violations` | JSONB | No | NULL | — | Violations | Confidential |
| `amount_claimed` | DECIMAL(18,4) | Yes | — | > 0 | Claimed | Confidential |
| `amount_recommended` | DECIMAL(18,4) | Yes | — | > 0 | Recommended | Confidential |
| `bills_verified` | BOOLEAN | Yes | `false` | — | Bills verified | Internal |
| `decision` | ENUM | Yes | `PENDING` | PENDING, APPROVED, PARTIALLY_APPROVED, REJECTED | Decision | Internal |
| `approved_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Approved | Confidential |
| `decision_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `decision_at` | TIMESTAMPTZ | No | NULL | — | Time | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA | Internal |
| `forwarded_to_finance` | BOOLEAN | Yes | `false` | — | Forwarded | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, PARTIALLY_APPROVED, REJECTED, FORWARDED, ESCALATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 495 — Recruitment Approval (MSS)

### 1. Business Purpose
MSS recruitment approval — manager approval for hiring requisitions.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `approval_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `job_requisition_id` | UUID | Yes | — | FK to `job_requisitions` (Entity 411) | Source | Confidential |
| `budget_validation` | JSONB | Yes | `'{}'` | — | Budget check | Confidential |
| `headcount_validation` | JSONB | Yes | `'{}'` | — | Headcount check | Internal |
| `workforce_plan_alignment` | BOOLEAN | Yes | `false` | — | Plan aligned | Internal |
| `decision` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, MODIFIED | Decision | Internal |
| `modified_vacancies` | INTEGER | No | NULL | > 0 | Modified count | Internal |
| `modified_budget` | DECIMAL(18,4) | No | NULL | > 0 | Modified budget | Confidential |
| `decision_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `decision_at` | TIMESTAMPTZ | No | NULL | — | Time | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA | Internal |
| `next_approver_id` | UUID | No | NULL | FK to `workforce_master` | Next (Dept Head) | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, MODIFIED, FORWARDED, ESCALATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 496 — Performance Approval (MSS)

### 1. Business Purpose
MSS performance approval — manager approval for performance reviews.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `approval_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `performance_review_id` | UUID | Yes | — | FK to `performance_reviews` (Entity 463) | Source | Confidential |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `rating_recommended` | DECIMAL(3,1) | Yes | — | 1-5 | Recommended rating | Confidential |
| `rating_justification` | TEXT | Yes | — | Min 50 | Justification | Confidential |
| `promotion_recommended` | BOOLEAN | Yes | `false` | — | Promotion | Confidential |
| `increment_recommended_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Increment % | Confidential |
| `bonus_recommended_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Bonus | Confidential |
| `training_recommendations` | UUID[] | No | `ARRAY[]::UUID[]` | — | Training | Internal |
| `decision` | ENUM | Yes | `PENDING` | PENDING, SUBMITTED, RETURNED_FOR_REVIEW | Decision | Internal |
| `decision_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `decision_at` | TIMESTAMPTZ | No | NULL | — | Time | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA | Internal |
| `calibration_required` | BOOLEAN | Yes | `false` | — | Calibration needed | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, SUBMITTED, RETURNED, CALIBRATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 497 — Transfer Approval (MSS)

### 1. Business Purpose
MSS transfer approval — manager approval for employee transfers.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `approval_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Current manager | Confidential |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `transfer_type` | ENUM | Yes | — | DEPARTMENT, FACILITY, CITY, STATE, PROJECT, TEMPORARY | Type | Internal |
| `current_position_id` | UUID | Yes | — | FK to `position_masters` | Current | Internal |
| `new_position_id` | UUID | Yes | — | FK to `position_masters` | New | Internal |
| `current_department_id` | UUID | Yes | — | FK to `departments` | Current dept | Internal |
| `new_department_id` | UUID | Yes | — | FK to `departments` | New dept | Internal |
| `transfer_reason` | TEXT | Yes | — | Min 20 | Reason | Confidential |
| `effective_date` | DATE | Yes | — | — | Effective | Internal |
| `receiving_manager_id` | UUID | Yes | — | FK to `workforce_master` | Receiving mgr | Confidential |
| `decision` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED | Decision | Internal |
| `decision_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `decision_at` | TIMESTAMPTZ | No | NULL | — | Time | Internal |
| `receiving_manager_decision` | ENUM | Yes | `PENDING` | PENDING, ACCEPTED, REJECTED | Receiving | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, ACCEPTED, COMPLETED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 498 — Promotion Approval (MSS)

### 1. Business Purpose
MSS promotion approval — manager approval for promotion recommendations.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `approval_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `promotion_recommendation_id` | UUID | Yes | — | FK to `promotion_recommendations` (Entity 466) | Source | Confidential |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `current_grade_id` | UUID | Yes | — | FK to `grades` | Current | Internal |
| `new_grade_id` | UUID | Yes | — | FK to `grades` | New | Internal |
| `current_ctc` | DECIMAL(18,4) | Yes | — | ≥ 0 | Current | Confidential |
| `proposed_ctc` | DECIMAL(18,4) | Yes | — | > current_ctc | Proposed | Confidential |
| `increment_pct` | DECIMAL(5,2) | Yes | — | > 0 | Increment | Confidential |
| `promotion_justification` | TEXT | Yes | — | Min 50 | Justification | Confidential |
| `budget_available` | BOOLEAN | Yes | `true` | — | Budget check | Internal |
| `decision` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, MODIFIED | Decision | Internal |
| `modified_ctc` | DECIMAL(18,4) | No | NULL | ≥ 0 | Modified CTC | Confidential |
| `decision_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `decision_at` | TIMESTAMPTZ | No | NULL | — | Time | Internal |
| `next_approver_level` | INTEGER | Yes | `2` | ≥ 2 | Next level | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, MODIFIED, FORWARDED, ESCALATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 499 — Organization Analytics (MSS)

### 1. Business Purpose
MSS organization analytics — team composition, diversity, tenure analysis.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `team_composition` | JSONB | Yes | `'{}'` | — | By grade, gender, age | Confidential |
| `diversity_metrics` | JSONB | Yes | `'{}'` | — | Diversity stats | Confidential |
| `tenure_distribution` | JSONB | Yes | `'{}'` | — | Tenure buckets | Internal |
| `age_distribution` | JSONB | Yes | `'{}'` | — | Age buckets | Confidential |
| `gender_distribution` | JSONB | Yes | `'{}'` | — | Gender | Confidential |
| `education_distribution` | JSONB | Yes | `'{}'` | — | Education | Internal |
| `performance_distribution` | JSONB | Yes | `'{}'` | — | Rating dist | Confidential |
| `attrition_trend` | JSONB | Yes | `'[]'` | — | 12-month attrition | Confidential |
| `headcount_trend` | JSONB | Yes | `'[]'` | — | 12-month headcount | Internal |
| `cost_distribution` | JSONB | Yes | `'{}'` | — | Cost by category | Confidential |
| `span_of_control` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Avg reports per mgr | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 500 — Manager KPI Dashboard

### 1. Business Purpose
Per Part 12 §12: Supports Department, Team, Projects, Budget, Performance. Manager's KPI tracking dashboard.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `dashboard_scope` | ENUM | Yes | — | DEPARTMENT, TEAM, PROJECTS, BUDGET, PERFORMANCE | Scope (per Part 12) | Internal |
| `department_kpis` | JSONB | Yes | `'[]'` | — | Department KPIs | Confidential |
| `team_kpis` | JSONB | Yes | `'[]'` | — | Team KPIs | Confidential |
| `project_kpis` | JSONB | Yes | `'[]'` | — | Project KPIs | Confidential |
| `budget_kpis` | JSONB | Yes | `'[]'` | — | Budget vs actual | Confidential |
| `performance_kpis` | JSONB | Yes | `'[]'` | — | Performance metrics | Confidential |
| `kpi_achievement_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Overall achievement | Confidential |
| `kpi_trend_30d` | JSONB | Yes | `'[]'` | — | 30-day trend | Internal |
| `kpi_trend_90d` | JSONB | Yes | `'[]'` | — | 90-day trend | Internal |
| `alerts` | JSONB | Yes | `'[]'` | — | KPI alerts | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI KPI insights | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 13: HR Analytics, AI HR Copilot & HR Mission Control (Entities 501-510)

## Entity 501 — HR KPI Library

### 1. Business Purpose
Per Part 12 §13: Measures Headcount, Attrition, Hiring, Training, Payroll Cost, Absenteeism, Overtime, Vacancies, Time To Hire, Retention. Enterprise HR KPI definitions.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `kpi_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `kpi_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `kpi_category` | ENUM | Yes | — | HEADCOUNT, ATTRITION, HIRING, TRAINING, PAYROLL_COST, ABSENTEEISM, OVERTIME, VACANCIES, TIME_TO_HIRE, RETENTION, DIVERSITY, ENGAGEMENT, PRODUCTIVITY | Category (per Part 12) | Internal |
| `description` | TEXT | Yes | — | Min 20 | Description | Internal |
| `measurement_unit` | VARCHAR(20) | Yes | — | — | Unit | Internal |
| `calculation_formula` | TEXT | No | NULL | — | Formula | Confidential |
| `data_source` | ENUM | Yes | — | HRMS, PAYROLL, ATS, LMS, ATTENDANCE, MANUAL, COMPUTED | Source | Internal |
| `frequency` | ENUM | Yes | `MONTHLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY | Frequency | Internal |
| `target_value` | DECIMAL(18,4) | No | NULL | — | Target | Internal |
| `benchmark_value` | DECIMAL(18,4) | No | NULL | — | Industry benchmark | Confidential |
| `benchmark_source` | VARCHAR(100) | No | NULL | — | Benchmark source | Internal |
| `alert_threshold_low` | DECIMAL(18,4) | No | NULL | — | Low threshold | Internal |
| `alert_threshold_high` | DECIMAL(18,4) | No | NULL | — | High threshold | Internal |
| `applicable_company_levels` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Company/facility/dept | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 502 — HR Dashboard

### 1. Business Purpose
Per Part 12 §13: Displays Headcount, Attendance, Payroll, Recruitment, Training, Performance, Leave, Vacancies. Unified HR operational dashboard.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `facility_id` | UUID | No | NULL | FK to `facilities` | Facility (NULL = company-wide) | Internal |
| `headcount_total` | INTEGER | Yes | `0` | ≥ 0 | Headcount (per Part 12) | Internal |
| `headcount_active` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `headcount_on_leave_today` | INTEGER | Yes | `0` | ≥ 0 | On leave | Internal |
| `headcount_new_hires_mtd` | INTEGER | Yes | `0` | ≥ 0 | New hires MTD | Internal |
| `headcount_exits_mtd` | INTEGER | Yes | `0` | ≥ 0 | Exits MTD | Internal |
| `attendance_summary` | JSONB | Yes | `'{}'` | — | Today's attendance | Confidential |
| `attendance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Attendance % | Internal |
| `payroll_summary` | JSONB | Yes | `'{}'` | — | Payroll cost | Confidential |
| `payroll_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Payroll cost MTD | Confidential |
| `recruitment_summary` | JSONB | Yes | `'{}'` | — | Recruitment stats | Internal |
| `open_positions_count` | INTEGER | Yes | `0` | ≥ 0 | Vacancies (per Part 12) | Internal |
| `training_summary` | JSONB | Yes | `'{}'` | — | Training stats | Internal |
| `performance_summary` | JSONB | Yes | `'{}'` | — | Performance ratings | Confidential |
| `leave_summary` | JSONB | Yes | `'{}'` | — | Leave stats | Confidential |
| `attrition_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Attrition rate | Confidential |
| `absenteeism_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Absenteeism | Internal |
| `overtime_hours_mtd` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | OT hours MTD | Internal |
| `compliance_summary` | JSONB | Yes | `'{}'` | — | Compliance stats | Internal |
| `alerts` | JSONB | Yes | `'[]'` | — | HR alerts | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI insights | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 503 — Workforce Planning

### 1. Business Purpose
Per Part 12 §13: Forecasts Hiring, Retirement, Growth, Replacement, Contract Workforce. Strategic workforce planning.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `plan_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `plan_year` | INTEGER | Yes | — | 1900-9999 | Plan year | Internal |
| `plan_horizon_years` | INTEGER | Yes | `1` | 1-5 | Horizon | Internal |
| `current_headcount` | INTEGER | Yes | — | ≥ 0 | Current | Internal |
| `planned_growth_pct` | DECIMAL(5,2) | Yes | `0` | — | Growth % (per Part 12) | Internal |
| `planned_hires_count` | INTEGER | Yes | `0` | ≥ 0 | Hiring (per Part 12) | Internal |
| `expected_retirements` | INTEGER | Yes | `0` | ≥ 0 | Retirement (per Part 12) | Internal |
| `expected_attrition` | INTEGER | Yes | `0` | ≥ 0 | Expected attrition | Internal |
| `replacement_hires_needed` | INTEGER | Yes | `0` | ≥ 0 | Replacement (per Part 12) | Internal |
| `contract_workforce_planned` | INTEGER | Yes | `0` | ≥ 0 | Contract workforce (per Part 12) | Internal |
| `projected_headcount_eoy` | INTEGER | Yes | — | ≥ 0 | Projected EOY | Internal |
| `department_wise_plan` | JSONB | Yes | `'[]'` | — | Per-department | Confidential |
| `skill_gap_forecast` | JSONB | Yes | `'[]'` | — | Future skill gaps | Confidential |
| `budget_required` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Budget | Confidential |
| `budget_currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `scenario_analysis` | JSONB | Yes | `'{}'` | — | Best/base/worst case | Confidential |
| `ai_forecast` | JSONB | No | NULL | — | AI workforce forecast | Confidential |
| `approval_status` | ENUM | Yes | `DRAFT` | DRAFT, PENDING, APPROVED, REJECTED | Approval | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Time | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 504 — Attrition Prediction (AI)

### 1. Business Purpose
Per Part 12 §13: AI predicts High Risk Employees, Reasons, Retention Actions. ML-driven attrition risk prediction.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `prediction_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Restricted |
| `prediction_date` | DATE | Yes | — | — | Prediction date | Internal |
| `prediction_horizon_months` | INTEGER | Yes | `6` | 1-24 | Horizon | Internal |
| `flight_risk_score` | DECIMAL(5,2) | Yes | — | 0-100 | Risk score | Restricted |
| `risk_category` | ENUM | Yes | — | LOW, MEDIUM, HIGH, CRITICAL | Category | Restricted |
| `predicted_attrition_probability` | DECIMAL(5,2) | Yes | — | 0-100 | Probability % | Restricted |
| `predicted_timeframe_months` | INTEGER | No | NULL | ≥ 1 | Predicted timeframe | Restricted |
| `risk_factors` | JSONB | Yes | `'[]'` | — | Reasons (per Part 12) — [{ factor, weight, evidence }] | Restricted |
| `compensation_gap_pct` | DECIMAL(5,2) | No | NULL | — | Compensation gap | Confidential |
| `tenure_years` | DECIMAL(4,2) | Yes | `0` | ≥ 0 | Tenure | Internal |
| `time_since_last_promotion_years` | DECIMAL(4,2) | Yes | `0` | ≥ 0 | Since promotion | Internal |
| `performance_rating_trend` | JSONB | Yes | `'[]'` | — | 3-year rating trend | Confidential |
| `engagement_score` | DECIMAL(5,2) | No | NULL | 0-100 | Engagement | Confidential |
| `manager_relationship_score` | DECIMAL(5,2) | No | NULL | 0-100 | Manager rel | Confidential |
| `work_life_balance_score` | DECIMAL(5,2) | No | NULL | 0-100 | WLB | Confidential |
| `market_demand_score` | DECIMAL(5,2) | No | NULL | 0-100 | Market demand | Confidential |
| `recommended_retention_actions` | JSONB | Yes | `'[]'` | — | Retention Actions (per Part 12) | Confidential |
| `predicted_impact_cost` | DECIMAL(18,4) | No | NULL | ≥ 0 | Replacement cost | Confidential |
| `model_version` | VARCHAR(20) | Yes | — | — | AI model version | Internal |
| `model_confidence` | DECIMAL(5,2) | Yes | — | 0-100 | Confidence | Internal |
| `hr_reviewed` | BOOLEAN | Yes | `false` | — | HR reviewed | Internal |
| `hr_reviewed_by` | UUID | No | NULL | FK to `workforce_master` | HR reviewer | Confidential |
| `action_taken` | BOOLEAN | Yes | `false` | — | Action taken | Internal |
| `action_taken_notes` | TEXT | No | NULL | — | Action notes | Confidential |
| `outcome_actual` | ENUM | No | NULL | RETAINED, RESIGNED, PROMOTED, TRANSFERRED | Actual outcome | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, REVIEWED, ACTIONED, EXPIRED, VALIDATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 505 — AI HR Copilot

### 1. Business Purpose
Per Part 12 §13: Natural Language HR assistant. Examples: "Who should be promoted?", "Who is absent today?", "Who needs forklift certification?", "Who has expired food safety training?", "Which warehouse needs more operators?"

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `session_id` | VARCHAR(100) | Yes | — | Unique | Session | Confidential |
| `user_employee_id` | UUID | Yes | — | FK to `workforce_master` | User | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `conversation_context` | JSONB | Yes | `'{}'` | — | Conversation history | Confidential |
| `query_text` | TEXT | Yes | — | Min 1 | User query (per Part 12: "Natural Language") | Confidential |
| `query_intent` | ENUM | Yes | — | HEADCOUNT_QUERY, ATTRITION_QUERY, PROMOTION_QUERY, COMPLIANCE_QUERY, TRAINING_QUERY, PAYROLL_QUERY, PERFORMANCE_QUERY, VACANCY_QUERY, GENERAL_HR, OTHER | Intent | Internal |
| `query_entities` | JSONB | Yes | `'[]'` | — | Extracted entities | Internal |
| `query_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Time | Internal |
| `response_text` | TEXT | No | NULL | — | Response | Confidential |
| `response_data` | JSONB | No | NULL | — | Structured data | Confidential |
| `response_charts` | JSONB | No | NULL | — | Chart specifications | Internal |
| `response_actions` | JSONB | No | NULL | — | Suggested actions | Confidential |
| `response_confidence` | DECIMAL(5,2) | Yes | `0` | 0-100 | Confidence | Internal |
| `data_sources_queried` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Sources accessed | Internal |
| `execution_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Execution time | Internal |
| `model_version` | VARCHAR(20) | Yes | — | — | Model | Internal |
| `user_feedback` | ENUM | No | NULL | POSITIVE, NEGATIVE, NEUTRAL | Feedback | Internal |
| `user_feedback_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | PROCESSING, COMPLETED, FAILED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 506 — Succession Planning

### 1. Business Purpose
Per Part 12 §13: Stores Critical Role, Successor, Readiness, Risk. Succession planning for critical positions.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `plan_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `critical_role_id` | UUID | Yes | — | FK to `position_masters` | Critical Role (per Part 12) | Internal |
| `current_incumbent_id` | UUID | Yes | — | FK to `workforce_master` | Current | Confidential |
| `incumbent_retention_risk` | ENUM | Yes | `LOW` | LOW, MEDIUM, HIGH | Risk | Restricted |
| `incumbent_retirement_years` | DECIMAL(4,2) | No | NULL | ≥ 0 | Years to retirement | Internal |
| `successor_candidates` | JSONB | Yes | `'[]'` | — | Successor (per Part 12) — [{ employee_id, readiness, gap_score, development_plan }] | Restricted |
| `primary_successor_id` | UUID | No | NULL | FK to `workforce_master` | Primary | Confidential |
| `successor_readiness` | ENUM | Yes | `NOT_READY` | READY_NOW, READY_1_2_YEARS, READY_3_5_YEARS, NOT_READY | Readiness (per Part 12) | Confidential |
| `succession_risk` | ENUM | Yes | `MEDIUM` | LOW, MEDIUM, HIGH, CRITICAL | Risk (per Part 12) | Restricted |
| `development_plan` | JSONB | Yes | `'[]'` | — | Successor development | Confidential |
| `gap_analysis` | JSONB | Yes | `'{}'` | — | Skill gaps | Confidential |
| `emergency_replacement_id` | UUID | No | NULL | FK to `workforce_master` | Emergency (interim) | Confidential |
| `last_review_date` | DATE | Yes | — | — | Last review | Internal |
| `next_review_date` | DATE | Yes | — | — | Next review | Internal |
| `reviewed_by` | UUID | Yes | — | FK to `workforce_master` | Reviewer | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 507 — Workforce Heat Map

### 1. Business Purpose
Per Part 12 §13: Displays Skill Distribution, Department Strength, Performance, Attrition Risk. Visual workforce intelligence.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `heat_map_type` | ENUM | Yes | — | SKILL_DISTRIBUTION, DEPARTMENT_STRENGTH, PERFORMANCE, ATTRITION_RISK, COMPOSITE | Type | Internal |
| `department_grain` | ENUM | Yes | `DEPARTMENT` | FACILITY, DEPARTMENT, TEAM, INDIVIDUAL | Grain | Internal |
| `skill_distribution` | JSONB | Yes | `'{}'` | — | Skills heat map (per Part 12) | Confidential |
| `department_strength` | JSONB | Yes | `'{}'` | — | Dept strength (per Part 12) | Internal |
| `performance_distribution` | JSONB | Yes | `'{}'` | — | Performance (per Part 12) | Confidential |
| `attrition_risk_distribution` | JSONB | Yes | `'{}'` | — | Attrition risk (per Part 12) | Restricted |
| `composite_score` | JSONB | Yes | `'{}'` | — | Composite scoring | Confidential |
| `color_coding_config` | JSONB | Yes | `'{}'` | — | Color thresholds | Internal |
| `interactive_filters` | JSONB | Yes | `'{}'` | — | Available filters | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI heat map insights | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 508 — Labor Cost Analytics

### 1. Business Purpose
Per Part 12 §13: Measures Payroll, Overtime, Benefits, Training Cost, Cost Per Employee. Comprehensive labor cost analysis.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `period_year` | INTEGER | Yes | — | — | Year | Internal |
| `period_month` | INTEGER | No | NULL | 1-12 | Month (NULL = annual) | Internal |
| `payroll_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Payroll (per Part 12) | Confidential |
| `payroll_cost_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Payroll YTD | Confidential |
| `overtime_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Overtime (per Part 12) | Confidential |
| `overtime_cost_pct_of_payroll` | DECIMAL(5,2) | Yes | `0` | 0-100 | OT % of payroll | Confidential |
| `benefits_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Benefits (per Part 12) | Confidential |
| `benefits_cost_pct_of_payroll` | DECIMAL(5,2) | Yes | `0` | 0-100 | Benefits % | Confidential |
| `training_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Training Cost (per Part 12) | Confidential |
| `training_cost_pct_of_payroll` | DECIMAL(5,2) | Yes | `0` | 0-100 | Training % | Confidential |
| `statutory_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Statutory (PF/ESIC/Gratuity) | Confidential |
| `total_workforce_cost` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total cost | Confidential |
| `employee_count` | INTEGER | Yes | `0` | ≥ 0 | Headcount | Internal |
| `cost_per_employee` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost Per Employee (per Part 12) | Confidential |
| `cost_per_employee_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | YTD | Confidential |
| `revenue_per_employee` | DECIMAL(18,4) | No | NULL | ≥ 0 | Revenue/employee | Confidential |
| `labor_cost_ratio_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Cost/Revenue % | Confidential |
| `cost_by_department` | JSONB | Yes | `'{}'` | — | Per-department | Confidential |
| `cost_by_grade` | JSONB | Yes | `'{}'` | — | Per-grade | Confidential |
| `cost_by_facility` | JSONB | Yes | `'{}'` | — | Per-facility | Confidential |
| `cost_trend_12m` | JSONB | Yes | `'[]'` | — | 12-month trend | Confidential |
| `benchmark_comparison` | JSONB | No | NULL | — | Industry benchmark | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI cost optimization | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 509 — HR Mission Control

### 1. Business Purpose
Per Part 12 §13: Displays Recruitment, Attendance, Payroll, Performance, Training, Attrition, Compliance, Alerts, AI. Unified HR command center.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `snapshot_type` | ENUM | Yes | `COMPANY` | FACILITY, DEPARTMENT, COMPANY | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `recruitment_status` | JSONB | Yes | `'{}'` | — | Recruitment (per Part 12) | Internal |
| `attendance_status` | JSONB | Yes | `'{}'` | — | Attendance (per Part 12) | Confidential |
| `payroll_status` | JSONB | Yes | `'{}'` | — | Payroll (per Part 12) | Confidential |
| `performance_status` | JSONB | Yes | `'{}'` | — | Performance (per Part 12) | Confidential |
| `training_status` | JSONB | Yes | `'{}'` | — | Training (per Part 12) | Internal |
| `attrition_status` | JSONB | Yes | `'{}'` | — | Attrition (per Part 12) | Restricted |
| `compliance_status` | JSONB | Yes | `'{}'` | — | Compliance (per Part 12) | Internal |
| `alerts_active` | JSONB | Yes | `'[]'` | — | Alerts (per Part 12) | Confidential |
| `alerts_critical_count` | INTEGER | Yes | `0` | ≥ 0 | Critical alerts | Internal |
| `tasks_pending_count` | INTEGER | Yes | `0` | ≥ 0 | Pending HR tasks | Internal |
| `tasks_overdue_count` | INTEGER | Yes | `0` | ≥ 0 | Overdue | Internal |
| `ai_insights` | JSONB | Yes | `'{}'` | — | AI (per Part 12) | Confidential |
| `ai_recommendations` | JSONB | Yes | `'[]'` | — | AI recommendations | Confidential |
| `predictive_alerts` | JSONB | Yes | `'[]'` | — | Predictive alerts | Restricted |
| `real_time_metrics` | JSONB | Yes | `'{}'` | — | Live metrics | Internal |
| `kpi_achievements` | JSONB | Yes | `'{}'` | — | HR KPI status | Confidential |
| `mission_control_view_url` | VARCHAR(500) | Yes | — | — | Live dashboard URL | Internal |
| `last_refreshed_at` | TIMESTAMPTZ | Yes | `now()` | — | Last refresh | Internal |
| `refresh_frequency_seconds` | INTEGER | Yes | `60` | ≥ 10 | Refresh rate | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 510 — Executive Workforce Scorecard

### 1. Business Purpose
Per Part 12 §13: Measures Productivity, Retention, Training, Engagement, Payroll, Hiring, Overall Workforce Health. C-suite workforce scorecard.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `period_year` | INTEGER | Yes | — | — | Year | Internal |
| `period_quarter` | ENUM | No | NULL | Q1, Q2, Q3, Q4 | Quarter | Internal |
| `productivity_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Productivity (per Part 12) | Confidential |
| `productivity_trend` | JSONB | Yes | `'[]'` | — | Trend | Internal |
| `retention_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Retention (per Part 12) | Confidential |
| `retention_trend` | JSONB | Yes | `'[]'` | — | Trend | Internal |
| `training_completion_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Training (per Part 12) | Internal |
| `training_hours_per_employee` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Hours | Internal |
| `engagement_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Engagement (per Part 12) | Confidential |
| `engagement_trend` | JSONB | Yes | `'[]'` | — | Trend | Confidential |
| `payroll_cost_pct_of_revenue` | DECIMAL(5,2) | Yes | `0` | 0-100 | Payroll (per Part 12) | Confidential |
| `payroll_cost_trend` | JSONB | Yes | `'[]'` | — | Trend | Confidential |
| `hiring_efficiency_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Hiring (per Part 12) | Internal |
| `time_to_hire_days_avg` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | TTH | Internal |
| `cost_per_hire` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | CPH | Confidential |
| `overall_workforce_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Overall Health (per Part 12) | Confidential |
| `health_score_trend` | JSONB | Yes | `'[]'` | — | Trend | Confidential |
| `health_score_benchmark` | DECIMAL(5,2) | No | NULL | 0-100 | Industry benchmark | Confidential |
| `strategic_initiatives_progress` | JSONB | Yes | `'[]'` | — | HR initiatives | Confidential |
| `workforce_risks` | JSONB | Yes | `'[]'` | — | Top workforce risks | Restricted |
| `workforce_opportunities` | JSONB | Yes | `'[]'` | — | Top opportunities | Confidential |
| `ai_strategic_insights` | JSONB | No | NULL | — | AI C-suite insights | Confidential |
| `executive_summary` | TEXT | Yes | — | Min 100 | Narrative summary | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, PRESENTED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# Part 12 — COMPLETE — Closeout Summary

## Enterprise Workforce Management (EWM) Module — Final Status

| Attribute | Value |
|---|---|
| Module | Enterprise Workforce Management (EWM) |
| Manual | 1 — Enterprise Data Dictionary |
| Part | 12 |
| Sections | 13 |
| Entities | 381–510 (130 entities) |
| Status | ✅ COMPLETE |
| Implementation Ready | YES |
| Architecture | LOCKED |

## Part 12 Batch Progression

| Batch | Sections | Entities | Status |
|---|---|---|---|
| Batch 1 | 1-3 (Foundation, Org Lifecycle) | 381-410 | ✅ COMPLETE |
| Batch 2 | 4-6 (Recruitment, Onboarding, Attendance) | 411-440 | ✅ COMPLETE |
| Batch 3 | 7-8 (Leave, Payroll) | 441-460 | ✅ COMPLETE |
| **Batch 4 (Final)** | **9-13 (Performance, LMS, ESS, MSS, Analytics)** | **461-510** | **✅ COMPLETE** |
| **TOTAL** | **13 Sections** | **130 Entities** | **✅ COMPLETE** |

## Module Coverage Summary

### 1. Workforce Foundation (Sec 1-3, Entities 381-410)
Workforce Master, Organization Structure, Positions, Grades, Departments, Employee Lifecycle — complete foundation for all HR operations.

### 2. Talent Acquisition (Sec 4, Entities 411-420)
Recruitment, ATS, Interview Management, Offers, Background Verification — full hiring pipeline from requisition to hire.

### 3. Workforce Operations (Sec 5-8, Entities 421-460)
Onboarding, Attendance, Shift Planning, Leave, Payroll, Benefits, Loans, Reimbursements — daily HR operations.

### 4. Talent Development (Sec 9-10, Entities 461-480)
Performance Management, KPIs, OKRs, Appraisals, LMS, Skills Matrix, Certifications, Succession Planning.

### 5. Employee Experience (Sec 11-12, Entities 481-500)
ESS (Employee Self-Service) and MSS (Manager Self-Service) — full self-service capabilities.

### 6. Executive Intelligence (Sec 13, Entities 501-510)
HR Analytics, Workforce Planning, AI HR Copilot, HR Mission Control, Executive Workforce Scorecard.

## Foundation Services Added in Part 12

| Service ID | Service Name | Section | Status |
|---|---|---|---|
| FS-20 | Enterprise Workforce Scheduling Engine | Sec 6 (Batch 2) | LOCKED |
| FS-21 | Compensation Rules Engine | Sec 8 (Batch 3) | LOCKED |
| FS-22 | Enterprise Performance Engine | Sec 9 | LOCKED |
| FS-23 | Enterprise LMS | Sec 10 | LOCKED |
| FS-24 | ESS Platform | Sec 11 | LOCKED |
| FS-25 | MSS Platform | Sec 12 | LOCKED |
| FS-26 | Enterprise Workforce Intelligence | Sec 13 | LOCKED |
| FS-27 | AI HR Copilot | Sec 13 | LOCKED |
| FS-28 | HR Mission Control | Sec 13 | LOCKED |
| FS-29 | Talent Intelligence | Sec 13 | LOCKED |
| FS-30 | Skills Intelligence | Sec 13 | LOCKED |

**Cumulative Foundation Services**: 30 (Vol 0: 20 + Part 12: 10)

## Architectural Decisions Locked (Part 12)

| Decision ID | Decision | Section |
|---|---|---|
| Q161 | Compensation Rules Engine as shared platform service | Sec 8 |
| Q162 | Enterprise Performance Engine | Sec 9 |
| Q163 | OKR cascade pattern (Company → BU → Dept → Individual) | Sec 9 |
| Q164 | 9-box talent calibration grid | Sec 9 |
| Q165 | Enterprise LMS architecture | Sec 10 |
| Q166 | Skills Matrix as source of truth for workforce skills | Sec 10 |
| Q167 | Certification-driven compliance blocking | Sec 10 |
| Q168 | ESS as unified employee entry point with SSO | Sec 11 |
| Q169 | MSS as unified manager command center | Sec 12 |
| Q170 | Enterprise Workforce Intelligence architecture | Sec 13 |
| Q171 | AI HR Copilot as natural-language interface | Sec 13 |
| Q172 | HR Mission Control as real-time operational dashboard | Sec 13 |
| Q173 | Complete Audit Trail across all HR operations | All |

**Cumulative Architectural Decisions**: 173 (Vol 0: 160 + Part 12: 13)

## Cross-Module Integration Matrix

### HR → Other Modules

| HR Function | Target Module | Integration |
|---|---|---|
| Workforce Master (381) | All modules | Employee identity, position, grade |
| Attendance (437) | Manufacturing, Warehouse, Retail, Restaurant | Shift coverage, labor hours |
| Payroll (454) | Finance (Part 11) | Salary postings, statutory liabilities |
| Skills Matrix (473) | Manufacturing, Warehouse | Skill-based assignment, certification blocking |
| Performance Review (463) | Compensation Rules Engine (Q161) | Variable pay calculation |
| Workforce Planning (503) | All operational modules | Demand forecasting |
| HR Mission Control (509) | Enterprise Mission Control | Workforce KPIs in unified view |

### Other Modules → HR

| Source Module | HR Function | Integration |
|---|---|---|
| Manufacturing (Part 7) | Skills Matrix (473) | Machine skills, production KPIs |
| Warehouse (Part 6) | Attendance (437) | Pick/pack labor hours |
| Retail (Part 9) | Attendance (437) | POS login hours, sales KPIs |
| Restaurant (Part 10) | Attendance (437) | Service hours, tips |
| Quality (Part 8) | Training (471) | Quality certifications, compliance training |
| Finance (Part 11) | Payroll (454) | GL postings, cost center allocation |

## Part 12 Final Architecture Lock Summary

| Architecture Component | Status |
|---|---|
| Enterprise Workforce Management | ✅ LOCKED |
| Workforce Foundation | ✅ LOCKED |
| Talent Acquisition | ✅ LOCKED |
| Workforce Operations | ✅ LOCKED |
| Talent Development | ✅ LOCKED |
| Employee Experience (ESS/MSS) | ✅ LOCKED |
| Executive Intelligence | ✅ LOCKED |
| Enterprise Performance Engine | ✅ LOCKED |
| Enterprise LMS | ✅ LOCKED |
| Compensation Rules Engine | ✅ LOCKED |
| Workforce Scheduling Engine | ✅ LOCKED |
| AI HR Copilot | ✅ LOCKED |
| HR Mission Control | ✅ LOCKED |
| Talent Intelligence | ✅ LOCKED |
| Skills Intelligence | ✅ LOCKED |
| Complete Audit Trail | ✅ LOCKED |

---

# Volume 0.5 Manual 1 Progress — Part 12 COMPLETE

## Cumulative Manual 1 Status

| Part | Domain | Entities | Status |
|---|---|---|---|
| Part 1-2 | Foundation & Organization | 15 | ✅ |
| Part 3 | Product Master Data | 10 | ✅ |
| Part 4 | Inventory (Immutable Ledger) | 10 | ✅ |
| Part 5 | Procurement & Suppliers | 10 | ✅ |
| Part 6 | Warehouse (WMS) | 10 | ✅ |
| Part 7 | Manufacturing (MES) | 60 | ✅ |
| Part 8 | Quality (QMS) | 60 | ✅ |
| Part 9 | Retail Operations | 60 | ✅ |
| Part 10 | Restaurant Operations | 50 | ✅ |
| Part 11 | Finance & Accounting | 100 | ✅ |
| **Part 12** | **Enterprise Workforce Management** | **130** | **✅ COMPLETE** |
| Part 13 | Enterprise Asset & Maintenance Management | TBD | ⏳ PENDING |
| Part 14 | Enterprise Platform Services | TBD | ⏳ PENDING |
| Part 15 | AI, Analytics & Mission Control | TBD | ⏳ PENDING |

**Manual 1 Cumulative**: 515 entities defined across 11 completed parts (Parts 1-12).

## Chief Enterprise Architect Final Review — Part 12 ACCEPTED

The Enterprise Workforce Management (EWM) module is **complete and implementation-ready**. All 130 entities across 13 sections are defined at full enterprise-grade depth, with:
- Field Dictionary (Security Classification per field)
- Relationships (with cardinality)
- Indexes (PostgreSQL-optimized)
- Integration Points (cross-module)
- Sample Data
- Audit Events
- Architectural Decisions locked

## 🚀 Volume 1 Development Recommendation — ACCEPTED

Per Chief Enterprise Architect recommendation, **Volume 1: Core Platform development should begin in parallel** with Parts 13-15 documentation. The foundational services (Authentication, RBAC, Organization, Workflow Engine, Notification Engine, Accounting Event Engine, Audit Engine, API Gateway) are stable and unlikely to change.

### Recommended Volume 1 Development Sequence

| Phase | Service | Source Authority |
|---|---|---|
| 1.1 | Authentication & Identity | Vol 0 Ch 4 |
| 1.2 | RBAC (6-layer) | Vol 0 Ch 5 |
| 1.3 | Organization Service | Part 2 |
| 1.4 | Workflow Engine | Vol 0 Ch 8 |
| 1.5 | Notification Engine | Vol 0 Ch 9 |
| 1.6 | Accounting Event Engine | Part 11 |
| 1.7 | Audit Engine | Vol 0 Ch 9 |
| 1.8 | API Gateway | Vol 0 Ch 6 |
| 1.9 | Configuration Engine | Vol 0 Ch 7 |
| 1.10 | Barcoding & Numbering Engine | Vol 0 Ch 9 |

These foundational services can begin immediately while Parts 13-15 documentation proceeds.

---

*End of Manual 1 Part 12. Part 12 is COMPLETE. Volume 1 development may begin in parallel with Parts 13-15 documentation.*

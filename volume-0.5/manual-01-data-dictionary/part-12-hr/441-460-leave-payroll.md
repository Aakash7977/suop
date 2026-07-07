# Manual 1 · Part 12 · Sections 7-8 · Entities 441-460 — Leave Management, Holiday Calendar & Payroll

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 12 — Enterprise Workforce Management (EWM) |
| Sections | 7 (Leave Management, Holiday Calendar & Time-Off Policies), 8 (Payroll, Benefits, Loans & Statutory Compliance) |
| Entities | 441–460 |
| Version | 1.0.0 |
| Status | ACTIVE — LOCKED |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 9 §9.7, Part 12 §7-8 |
| Last Updated | 2026-07-07 |

---

## Overview — Leave & Payroll Architecture

Sections 7-8 cover the **entitlement-to-financial-execution** pipeline:

```
LEAVE MANAGEMENT (Sec 7: 441-450)
  Leave Type → Policy → Balance → Request → Approval → Attendance → Encashment → Audit
  ↓ Feeds
PAYROLL & COMPENSATION (Sec 8: 451-460)
  Attendance + Leave + Shift + Performance + Benefits
    ↓
  Compensation Rules Engine (Platform Service Q161 — NEW)
    ↓
  Salary Calc → Statutory Deductions → Loan Recovery → Reimbursements → Bank Advice → Finance Posting
```

### Integrated Enhancement: Compensation Rules Engine (Architectural Lock Q161)

Per Chief Enterprise Architect recommendation, a dedicated **Compensation Rules Engine** is hereby locked as **Foundation Service #21** (shared platform service). All salary calculation logic is externalized from Payroll Processing (Entity 454) into this engine:

```
Attendance ─┐
Leave ──────┤
Shift ──────┤
Performance ┼──► Compensation Rules Engine ──► Salary Calculation
Benefits ───┤    (formula-driven, rule-based)     │
Loan ───────┤                                    ├─► Statutory Deductions
Reimbursement┘                                    ├─► Loan Recovery
                                                  ├─► Reimbursement Settlement
                                                  └─► Payroll Posting → Finance
```

**Engine Capabilities (Locked)**:
- Salary formulas (basic, HRA, DA, special allowance, variable pay)
- Overtime rules (single/double/holiday rates)
- Shift allowances (night, weekend, festive premiums)
- Incentive calculations (production, quality, attendance)
- Sales commissions (slab, tier, accelerator)
- Performance bonuses (KPI-linked, rating-linked)
- Statutory deductions (PF, ESIC, PT, LWF, TDS, Gratuity, Bonus)
- Loan recovery rules (EMI, one-time, percentage-based)
- Country/state-specific payroll policies (multi-jurisdiction)
- Encashment rules (leave, gratuity, bonus)
- Year-end reconciliation rules

This keeps payroll behavior **configuration-driven** and allows SUOP to support multiple companies, states, and countries **without changing application code** — consistent with the Volume 0 Configuration-Driven Architecture principle.

---

# SECTION 7: Leave Management, Holiday Calendar & Time-Off Policies (Entities 441-450)

## Entity 441 — Leave Type

### 1. Business Purpose
Per Part 12 §7: Defines the catalog of leave categories the enterprise supports. Examples include Casual Leave, Sick Leave, Earned Leave, Maternity Leave, Paternity Leave, Compensatory Off, Leave Without Pay, Bereavement Leave, Marriage Leave.

### 2. Architectural Role
Master entity — drives policy configuration, balance computation, and approval routing. One Leave Type may be configured per company × grade × department via Leave Policy (Entity 442).

### 3. Business Rules
- Leave Types are global masters but **activation is per-company** (a company may opt out of Maternity Leave if not applicable, but cannot invent new types without governance).
- Paid vs Unpaid is intrinsic to the type (LWP is always unpaid; SL/EL/CL are typically paid; Comp-Off is paid-time-in-lieu).
- Carry-forward, encashment, and accrual rules are configured at the Leave Policy level (Entity 442), not here.
- A Leave Type marked `is_statutory=true` (e.g., Maternity) cannot be deleted — only deprecated.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company | Code (e.g., `CL`, `SL`, `EL`, `ML`, `PL`, `CO`, `LWP`, `BL`, `MRL`) | Internal |
| `name` | VARCHAR(100) | Yes | — | Min 3 | Display name (per Part 12: "Casual Leave", "Sick Leave", etc.) | Internal |
| `category` | ENUM | Yes | — | PAID, UNPAID, PARTIALLY_PAID | Payment category | Internal |
| `is_statutory` | BOOLEAN | Yes | `false` | — | Statutory mandate (Maternity, Paternity, Bereavement are statutory in most jurisdictions) | Internal |
| `accrual_frequency` | ENUM | Yes | `MONTHLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY, HALF_YEARLY, YEARLY, ON_JOINING, NONE | Accrual cycle | Internal |
| `accrual_basis` | ENUM | Yes | `FLAT` | FLAT, CALENDAR_DAYS, WORKED_DAYS, PRESENT_DAYS | Accrual computation basis | Internal |
| `default_allocation_days` | DECIMAL(5,2) | No | `0` | ≥ 0 | Default annual allocation (overridden by Leave Policy) | Internal |
| `max_balance_days` | DECIMAL(6,2) | No | NULL | ≥ 0 | Maximum cumulative balance cap | Internal |
| `carry_forward_allowed` | BOOLEAN | Yes | `false` | — | Carry-forward eligibility | Internal |
| `encashment_allowed` | BOOLEAN | Yes | `false` | — | Encashment eligibility | Internal |
| `sandwich_rule_applied` | BOOLEAN | Yes | `false` | — | Sandwich rule applied (holidays/weekends between leave days count as leave) | Confidential |
| `requires_document` | BOOLEAN | Yes | `false` | — | Medical certificate / supporting doc required (e.g., SL > 2 days) | Internal |
| `document_threshold_days` | DECIMAL(4,2) | No | NULL | > 0 | Days threshold above which document is mandatory | Internal |
| `probation_eligible` | BOOLEAN | Yes | `false` | — | Eligible during probation period | Internal |
| `notice_period_required_days` | INTEGER | No | `0` | ≥ 0 | Minimum advance notice (CL=1, EL=7, ML=90 typical) | Internal |
| `gender_restriction` | ENUM | Yes | `ANY` | ANY, MALE_ONLY, FEMALE_ONLY | Gender eligibility (ML=FEMALE_ONLY, PL=MALE_ONLY) | Confidential |
| `applicable_countries` | TEXT[] | No | `ARRAY[]::TEXT[]` | ISO country codes | Country applicability (multi-jurisdiction) | Internal |
| `description` | TEXT | No | NULL | — | Detailed description | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to (deprecated types) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Leave Policy (442) | One-to-Many | 1:N | One type configured across multiple policies |
| Leave Balance (443) | One-to-Many | 1:N | One type tracked per employee |
| Leave Request (444) | One-to-Many | 1:N | Requests raised against this type |
| Compensatory Off (447) | Many-to-One | N:1 | Comp-Off is a special Leave Type instance |
| Leave Encashment (448) | One-to-Many | 1:N | Encashment processed for eligible types |

### 6. Indexes
- UNIQUE (`code`) WHERE `status != 'DEPRECATED'`
- INDEX (`category`, `status`)
- INDEX (`is_statutory`)
- INDEX (`gender_restriction`)
- GIN INDEX (`applicable_countries`)

### 7. Security Classification
**Internal** — visible to HR admins and authorized managers. Gender restriction field is **Confidential**.

### 8. Integration Points
- **Attendance Engine** (Entity 437): Leave days reduce attendance present-days
- **Holiday Calendar** (Entity 446): Holiday rules interact with sandwich rule
- **Compensation Rules Engine** (Q161): Unpaid leave reduces salary; encashment adds to salary
- **Payroll Engine** (Entity 454): Leave deduction computed by Compensation Rules Engine

### 9. Sample Data
```json
{
  "code": "ML", "name": "Maternity Leave", "category": "PAID", "is_statutory": true,
  "accrual_frequency": "ON_JOINING", "accrual_basis": "FLAT",
  "default_allocation_days": 182, "carry_forward_allowed": false, "encashment_allowed": false,
  "requires_document": true, "document_threshold_days": 0, "probation_eligible": false,
  "notice_period_required_days": 90, "gender_restriction": "FEMALE_ONLY",
  "applicable_countries": ["IN"], "status": "ACTIVE"
}
```

### 10. Audit Events
`LEAVE_TYPE_CREATED`, `LEAVE_TYPE_UPDATED`, `LEAVE_TYPE_DEPRECATED`, `LEAVE_TYPE_REACTIVATED`

---

## Entity 442 — Leave Policy

### 1. Business Purpose
Per Part 12 §7: Stores Company, Grade, Department, Leave Type, Annual Allocation, Carry Forward, Encashment, Maximum Balance. Policy is the binding contract between enterprise rules and employee entitlements.

### 2. Architectural Role
Configuration entity — resolved at employee-level via Employee Leave Entitlement (derived). A single Leave Type may have different policies across companies/grades/departments.

### 3. Business Rules
- Policy matching priority: **Company → Grade → Department** (most specific wins)
- Annual allocation is in days with 2 decimal precision (supports half-day policies)
- Carry-forward cap (`max_carry_forward_days`) limits accumulation across years
- Encashment cap (`max_encashment_days`) limits annual encashment
- Probation period policy may differ (`probation_allocation_pct` — e.g., 50% during probation)
- Policy effective period (`effective_from` / `effective_to`) supports mid-year policy changes

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `policy_code` | VARCHAR(40) | Yes | — | Unique per company | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company (per Part 12: "Company") | Internal |
| `grade_id` | UUID | No | NULL | FK to `grades` | Grade (per Part 12: "Grade"); NULL = all grades | Internal |
| `department_id` | UUID | No | NULL | FK to `departments` | Department; NULL = all departments | Internal |
| `leave_type_id` | UUID | Yes | — | FK to `leave_types` (Entity 441) | Leave Type | Internal |
| `annual_allocation_days` | DECIMAL(5,2) | Yes | — | > 0 | Annual Allocation (per Part 12: "Annual Allocation") | Internal |
| `accrual_frequency_override` | ENUM | No | NULL | Inherits from Leave Type if NULL | Per-policy accrual cycle | Internal |
| `carry_forward_allowed` | BOOLEAN | Yes | `false` | — | Carry Forward (per Part 12: "Carry Forward") | Internal |
| `max_carry_forward_days` | DECIMAL(5,2) | No | NULL | ≥ 0 | Cap on carry-forward | Internal |
| `carry_forward_expiry_months` | INTEGER | No | NULL | > 0 | Months after which carried-forward leave expires | Internal |
| `encashment_allowed` | BOOLEAN | Yes | `false` | — | Encashment (per Part 12: "Encashment") | Internal |
| `max_encashment_days` | DECIMAL(5,2) | No | NULL | ≥ 0 | Annual encashment cap | Internal |
| `encashment_salary_basis` | ENUM | No | `BASIC` | BASIC, GROSS, CTC | Salary basis for encashment calculation | Confidential |
| `max_balance_days` | DECIMAL(6,2) | No | NULL | ≥ annual_allocation_days | Maximum Balance (per Part 12: "Maximum Balance") | Internal |
| `probation_allocation_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | % allocation during probation (per Part 12) | Internal |
| `proration_rule` | ENUM | Yes | `CALENDAR_DAYS` | CALENDAR_DAYS, JOINING_DATE, MONTHLY_ACCRUAL | Proration for mid-year joiners | Internal |
| `sandwich_rule_applied` | BOOLEAN | Yes | `false` | — | Sandwich rule (per Part 12) | Confidential |
| `sandwich_include_weekly_off` | BOOLEAN | Yes | `false` | — | Count weekly offs between leave days | Confidential |
| `sandwich_include_holidays` | BOOLEAN | Yes | `false` | — | Count holidays between leave days | Confidential |
| `advance_booking_days` | INTEGER | Yes | `0` | ≥ 0 | Minimum advance booking notice | Internal |
| `max_consecutive_days` | DECIMAL(4,2) | No | NULL | > 0 | Max consecutive leave days allowed | Internal |
| `max_per_month_days` | DECIMAL(4,2) | No | NULL | > 0 | Max leave days per month | Internal |
| `max_per_quarter_days` | DECIMAL(4,2) | No | NULL | > 0 | Max leave days per quarter | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `priority` | INTEGER | Yes | `100` | 1-999 | Resolution priority (lower wins) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Leave Type (441) | Many-to-One | N:1 | Source type |
| Leave Balance (443) | One-to-Many | 1:N | Balances derived from policy |
| Company | Many-to-One | N:1 | Owning company |
| Grade | Many-to-One | N:1 | Optional grade scope |
| Department | Many-to-One | N:1 | Optional department scope |

### 6. Indexes
- UNIQUE (`policy_code`)
- INDEX (`company_id`, `leave_type_id`, `status`)
- INDEX (`grade_id`, `department_id`, `priority`)
- INDEX (`effective_from`, `effective_to`)

### 7. Security Classification
**Internal** — encashment and sandwich rule fields are **Confidential**.

### 8. Integration Points
- **Compensation Rules Engine** (Q161): Reads policy for leave deduction & encashment formulas
- **Leave Balance Engine**: Computes balances based on policy accrual rules
- **Workflow Engine**: Routes approval based on leave type & days

### 9. Sample Data
```json
{
  "policy_code": "POL-CL-MFG-2026", "company_id": "cmp-001",
  "grade_id": null, "department_id": "dept-mfg",
  "leave_type_id": "lt-CL", "annual_allocation_days": 12.00,
  "carry_forward_allowed": true, "max_carry_forward_days": 6.00,
  "carry_forward_expiry_months": 3, "encashment_allowed": false,
  "max_balance_days": 18.00, "probation_allocation_pct": 50.00,
  "proration_rule": "CALENDAR_DAYS", "sandwich_rule_applied": false,
  "advance_booking_days": 1, "max_consecutive_days": 3, "priority": 50,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`LEAVE_POLICY_CREATED`, `LEAVE_POLICY_UPDATED`, `LEAVE_POLICY_INACTIVATED`, `LEAVE_POLICY_PRIORITY_CHANGED`

---

## Entity 443 — Leave Balance

### 1. Business Purpose
Per Part 12 §7: Tracks Allocated, Consumed, Available, Carry Forward, Expired, Encashed. The balance ledger is the authoritative source of truth for employee leave entitlements.

### 2. Architectural Role
**Ledger-style entity** — every transaction (accrual, consumption, expiry, encashment, adjustment) creates an immutable balance movement record. Current balance is a computed view, never directly mutated.

### 3. Business Rules
- Balance is per **Employee × Leave Type × Calendar Year**
- Opening balance = Carry-forward from previous year
- Available = Allocated + Carry Forward − Consumed − Encashed − Expired
- Mid-year policy change creates a new balance row for the new policy period
- Negative balances are forbidden unless `negative_balance_allowed` is enabled at policy level
- Year-end process: carry forward eligible balance, expire ineligible balance, reset consumed

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `balance_code` | VARCHAR(50) | Yes | — | Unique per employee × year | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` (Entity 381) | Employee | Confidential |
| `leave_type_id` | UUID | Yes | — | FK to `leave_types` (Entity 441) | Leave Type | Internal |
| `leave_policy_id` | UUID | Yes | — | FK to `leave_policies` (Entity 442) | Applied Policy | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `calendar_year` | INTEGER | Yes | — | 1900-9999 | Calendar year (per Part 12) | Internal |
| `opening_balance_days` | DECIMAL(6,2) | Yes | `0` | ≥ 0 | Opening (carry-forward from prior year) | Internal |
| `allocated_days` | DECIMAL(6,2) | Yes | `0` | ≥ 0 | Allocated (per Part 12: "Allocated") | Internal |
| `accrued_days` | DECIMAL(6,2) | Yes | `0` | ≥ 0 | Accrued (pro-rated for mid-year joiners) | Internal |
| `consumed_days` | DECIMAL(6,2) | Yes | `0` | ≥ 0 | Consumed (per Part 12: "Consumed") | Internal |
| `carry_forward_days` | DECIMAL(6,2) | Yes | `0` | ≥ 0 | Carry Forward (per Part 12: "Carry Forward") | Internal |
| `expired_days` | DECIMAL(6,2) | Yes | `0` | ≥ 0 | Expired (per Part 12: "Expired") | Internal |
| `encashed_days` | DECIMAL(6,2) | Yes | `0` | ≥ 0 | Encashed (per Part 12: "Encashed") | Internal |
| `adjusted_days` | DECIMAL(6,2) | Yes | `0` | — | Manual adjustments (+/-) | Internal |
| `available_days` | DECIMAL(6,2) | Yes | `0` | Generated | Available = opening + allocated + accrued + adjusted − consumed − encashed − expired | Internal |
| `last_accrual_date` | DATE | No | NULL | — | Last accrual run date | Internal |
| `year_end_processed` | BOOLEAN | Yes | `false` | — | Year-end carry-forward processed | Internal |
| `negative_balance_allowed` | BOOLEAN | Yes | `false` | — | Allows negative balance (LWP scenarios) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, YEAR_END_CLOSED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (Workforce Master 381) | Many-to-One | N:1 | Owning employee |
| Leave Type (441) | Many-to-One | N:1 | Type |
| Leave Policy (442) | Many-to-One | N:1 | Applied policy |
| Leave Request (444) | One-to-Many | 1:N | Requests reduce balance |
| Leave Encashment (448) | One-to-Many | 1:N | Encashments reduce balance |

### 6. Indexes
- UNIQUE (`employee_id`, `leave_type_id`, `calendar_year`)
- INDEX (`company_id`, `calendar_year`)
- INDEX (`status`, `year_end_processed`)
- INDEX (`available_days`) — for low-balance alerts

### 7. Security Classification
**Confidential** — employee leave balances are personal data.

### 8. Integration Points
- **ESS Portal** (Entity 491 area): Employee self-service leave view
- **MSS Portal** (Entity 496 area): Manager team-leave visibility
- **Compensation Rules Engine** (Q161): Reads balance for LWP calculation
- **Workforce Scheduling Engine** (Sec 6): Validates leave availability during roster planning

### 9. Sample Data
```json
{
  "employee_id": "wf-001", "leave_type_id": "lt-EL", "calendar_year": 2026,
  "opening_balance_days": 5.00, "allocated_days": 20.00, "accrued_days": 15.00,
  "consumed_days": 4.50, "carry_forward_days": 0, "expired_days": 0, "encashed_days": 0,
  "adjusted_days": 0, "available_days": 15.50, "year_end_processed": false,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`LEAVE_BALANCE_OPENED`, `LEAVE_BALANCE_ACCRUED`, `LEAVE_BALANCE_CONSUMED`, `LEAVE_BALANCE_EXPIRED`, `LEAVE_BALANCE_ENCASHED`, `LEAVE_BALANCE_ADJUSTED`, `LEAVE_BALANCE_YEAR_END_CLOSED`

---

## Entity 444 — Leave Request

### 1. Business Purpose
Per Part 12 §7: Stores Employee, Leave Type, From Date, To Date, Reason, Attachment, Approval Status. The primary transactional entity for employee leave applications.

### 2. Architectural Role
Transaction entity — creates workflow tasks (per Volume 0 Task-Driven UX principle), updates Leave Balance on approval, and feeds Attendance & Payroll.

### 3. Business Rules
- Date range validation: `to_date >= from_date`
- Half-day leave: `from_session` and `to_session` (FIRST_HALF / SECOND_HALF / FULL_DAY)
- Sandwich rule application is computed at request time based on policy
- Cancellation requires approval if leave is already approved and consumed
- Amendment (date change) requires fresh approval
- Multi-day requests span calendar days including holidays & weekly offs (subject to sandwich rule)
- Auto-reject if balance insufficient (unless negative balance allowed)
- Attachment mandatory for SL > policy threshold and for Maternity/Paternity

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `request_number` | VARCHAR(30) | Yes | — | Unique per company | Display number (e.g., `LR-2026-00001`) | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee (per Part 12: "Employee") | Confidential |
| `leave_type_id` | UUID | Yes | — | FK to `leave_types` (Entity 441) | Leave Type (per Part 12: "Leave Type") | Internal |
| `leave_balance_id` | UUID | No | NULL | FK to `leave_balances` (Entity 443) | Source balance | Confidential |
| `from_date` | DATE | Yes | — | — | From Date (per Part 12: "From Date") | Internal |
| `to_date` | DATE | Yes | — | ≥ from_date | To Date (per Part 12: "To Date") | Internal |
| `from_session` | ENUM | Yes | `FULL_DAY` | FIRST_HALF, SECOND_HALF, FULL_DAY | Session on from-date | Internal |
| `to_session` | ENUM | Yes | `FULL_DAY` | FIRST_HALF, SECOND_HALF, FULL_DAY | Session on to-date | Internal |
| `total_days` | DECIMAL(5,2) | Yes | — | > 0 | Computed total days including sandwich | Internal |
| `working_days_only` | DECIMAL(5,2) | Yes | — | ≥ 0 | Working days consumed (excluding holidays/offs) | Internal |
| `sandwich_days_count` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Sandwich days counted as leave | Internal |
| `reason` | TEXT | Yes | — | Min 10 chars | Reason (per Part 12: "Reason") | Confidential |
| `attachment_id` | UUID | No | NULL | FK to `attachments` | Attachment (per Part 12: "Attachment") — medical cert, etc. | Confidential |
| `contact_during_leave` | VARCHAR(50) | No | NULL | E.164 phone | Emergency contact | Confidential |
| `handover_to` | UUID | No | NULL | FK to `workforce_master` | Handover assignee | Internal |
| `handover_notes` | TEXT | No | NULL | — | Handover notes | Confidential |
| `approval_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, CANCELLED, WITHDRAWN, AMENDED | Approval Status (per Part 12: "Approval Status") | Internal |
| `current_approver_id` | UUID | No | NULL | FK to `workforce_master` | Current approver in workflow | Confidential |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Final approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `rejection_reason` | TEXT | No | NULL | — | Rejection reason | Confidential |
| `balance_impact_posted` | BOOLEAN | Yes | `false` | — | Balance ledger entry posted | Internal |
| `attendance_impact_posted` | BOOLEAN | Yes | `false` | — | Attendance marked as leave | Internal |
| `payroll_impact_type` | ENUM | Yes | `NONE` | NONE, PAID, UNPAID, PARTIALLY_PAID | Payroll impact | Confidential |
| `requested_at` | TIMESTAMPTZ | Yes | `now()` | — | Request timestamp | Internal |
| `withdrawn_at` | TIMESTAMPTZ | No | NULL | — | Withdrawal timestamp | Internal |
| `cancelled_at` | TIMESTAMPTZ | No | NULL | — | Cancellation timestamp | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SUBMITTED, IN_APPROVAL, APPROVED, REJECTED, CANCELLED, WITHDRAWN, CONSUMED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Applicant |
| Leave Type (441) | Many-to-One | N:1 | Type |
| Leave Balance (443) | Many-to-One | N:1 | Source balance |
| Leave Approval (445) | One-to-Many | 1:N | Approval chain |
| Leave Audit (449) | One-to-Many | 1:N | Audit trail |
| Attendance (437) | One-to-Many | 1:N | Marks attendance entries as leave |

### 6. Indexes
- UNIQUE (`request_number`)
- INDEX (`employee_id`, `from_date`, `to_date`)
- INDEX (`leave_type_id`, `approval_status`)
- INDEX (`current_approver_id`, `approval_status`) — pending approvals queue
- INDEX (`from_date`, `to_date`) — overlap detection

### 7. Security Classification
**Confidential** — contains employee health/personal information.

### 8. Integration Points
- **Workflow Engine** (Foundation Service): Approval chain routing
- **Notification Service**: Email/SMS/push to employee & approvers
- **Attendance Engine** (Entity 437): Marks leave days in attendance
- **Compensation Rules Engine** (Q161): Computes payroll impact (paid/unpaid)
- **Workforce Scheduling Engine**: Blocks roster assignment during leave
- **Calendar Service**: ESS/MSS calendar integration

### 9. Sample Data
```json
{
  "request_number": "LR-2026-00042", "employee_id": "wf-001",
  "leave_type_id": "lt-EL", "from_date": "2026-07-15", "to_date": "2026-07-18",
  "from_session": "FULL_DAY", "to_session": "FULL_DAY", "total_days": 4.00,
  "working_days_only": 4.00, "sandwich_days_count": 0,
  "reason": "Family vacation — pre-planned and approved by manager verbally",
  "handover_to": "wf-027", "approval_status": "PENDING", "status": "IN_APPROVAL"
}
```

### 10. Audit Events
`LEAVE_REQUEST_DRAFTED`, `LEAVE_REQUEST_SUBMITTED`, `LEAVE_REQUEST_APPROVED`, `LEAVE_REQUEST_REJECTED`, `LEAVE_REQUEST_CANCELLED`, `LEAVE_REQUEST_WITHDRAWN`, `LEAVE_REQUEST_AMENDED`, `LEAVE_REQUEST_CONSUMED`

---

## Entity 445 — Leave Approval

### 1. Business Purpose
Per Part 12 §7: Workflow Employee → Reporting Manager → HR → Approved/Rejected. Captures each approver's decision in the chain.

### 2. Architectural Role
Workflow step entity — one row per approver per request. Enables multi-level approvals, escalation, delegation, and parallel approval scenarios.

### 3. Business Rules
- Approval chain is policy-driven: short leave (< 2 days) → Manager only; long leave (> 5 days) → Manager → HR; Maternity → Manager → HR → Compliance
- Approver can delegate to another manager (with audit)
- Auto-escalation after SLA breach (default 48 hours)
- Auto-approval if approver is on long leave and no delegate assigned
- Approver cannot approve own request (4-eye principle)
- Rejection at any level cancels the request; resubmission allowed after correction

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `leave_request_id` | UUID | Yes | — | FK to `leave_requests` (Entity 444) | Source request | Internal |
| `approval_level` | INTEGER | Yes | — | ≥ 1 | Level in chain (1=Manager, 2=HR, 3=Compliance) | Internal |
| `approver_role` | ENUM | Yes | — | REPORTING_MANAGER, DEPT_HEAD, HR, HR_HEAD, COMPLIANCE, DIRECTOR | Approver role | Internal |
| `approver_id` | UUID | Yes | — | FK to `workforce_master` | Approver (per Part 12: "Reporting Manager", "HR") | Confidential |
| `delegated_from_id` | UUID | No | NULL | FK to `workforce_master` | Original approver (if delegated) | Confidential |
| `decision` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, ESCALATED, AUTO_APPROVED, DELEGATED | Decision | Internal |
| `decision_notes` | TEXT | No | NULL | — | Approver notes | Confidential |
| `decision_at` | TIMESTAMPTZ | No | NULL | — | Decision timestamp | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA deadline | Internal |
| `escalated_to_id` | UUID | No | NULL | FK to `workforce_master` | Escalated to | Confidential |
| `escalation_count` | INTEGER | Yes | `0` | ≥ 0 | Number of escalations | Internal |
| `approval_token` | VARCHAR(100) | No | NULL | — | Token for email-approval link | Confidential |
| `token_expires_at` | TIMESTAMPTZ | No | NULL | — | Token expiry | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, COMPLETED, ESCALATED, EXPIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Leave Request (444) | Many-to-One | N:1 | Source request |
| Workforce Master (381) | Many-to-One | N:1 | Approver |
| Leave Audit (449) | One-to-Many | 1:N | Audit trail |

### 6. Indexes
- INDEX (`leave_request_id`, `approval_level`)
- INDEX (`approver_id`, `decision`, `status`) — approver's pending queue
- INDEX (`sla_due_at`, `status`) — SLA monitoring

### 7. Security Classification
**Confidential** — approver identity and decision notes are sensitive.

### 8. Integration Points
- **Workflow Engine**: Approval chain orchestration
- **Notification Service**: Approver reminders & escalations
- **Task Control Room**: Pending approvals as tasks
- **Calendar Service**: Approver's task calendar

### 9. Sample Data
```json
{
  "leave_request_id": "lr-001", "approval_level": 1, "approver_role": "REPORTING_MANAGER",
  "approver_id": "wf-100", "decision": "PENDING", "sla_due_at": "2026-07-09T10:00:00Z",
  "status": "PENDING"
}
```

### 10. Audit Events
`LEAVE_APPROVAL_PENDING`, `LEAVE_APPROVAL_APPROVED`, `LEAVE_APPROVAL_REJECTED`, `LEAVE_APPROVAL_ESCALATED`, `LEAVE_APPROVAL_DELEGATED`, `LEAVE_APPROVAL_AUTO_APPROVED`, `LEAVE_APPROVAL_EXPIRED`

---

## Entity 446 — Holiday Calendar

### 1. Business Purpose
Per Part 12 §7: Supports National Holidays, State Holidays, Factory Holidays, Weekly Off, Regional Holidays. Defines facility/company-level holiday lists.

### 2. Architectural Role
Master configuration — drives attendance marking, sandwich rule computation, payroll day-count, and statutory compliance.

### 3. Business Rules
- Holiday list is per **Company × Facility × Calendar Year** (a factory in Maharashtra vs Tamil Nadu may have different state holidays)
- Holiday types: NATIONAL (mandatory paid), STATE (state-specific), FACTORY (facility-specific), WEEKLY_OFF (Sun/Sat etc.), REGIONAL (community-specific), RESTRICTED (employee-choice from list)
- Restricted holidays: employee can choose N from a list of M
- Holiday falling on weekly off does not get compensatory off (unless policy mandates)
- Holiday on a non-working day does not carry forward

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `calendar_code` | VARCHAR(40) | Yes | — | Unique per company × year | Code | Internal |
| `calendar_name` | VARCHAR(100) | Yes | — | Min 3 | Display name (e.g., "Maharashtra Factory Calendar 2026") | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `facility_id` | UUID | No | NULL | FK to `facilities` | Facility (NULL = company-wide) | Internal |
| `state_code` | VARCHAR(10) | No | NULL | ISO state code | State (for state-specific calendar) | Internal |
| `country_code` | CHAR(2) | Yes | `IN` | ISO country | Country | Internal |
| `calendar_year` | INTEGER | Yes | — | 1900-9999 | Calendar year | Internal |
| `holiday_type` | ENUM | Yes | — | NATIONAL, STATE, FACTORY, WEEKLY_OFF, REGIONAL, RESTRICTED | Holiday type (per Part 12) | Internal |
| `holiday_date` | DATE | Yes | — | — | Holiday date | Internal |
| `holiday_name` | VARCHAR(200) | Yes | — | Min 3 | Holiday name | Internal |
| `holiday_description` | TEXT | No | NULL | — | Description | Internal |
| `is_paid` | BOOLEAN | Yes | `true` | — | Paid holiday | Internal |
| `is_mandatory` | BOOLEAN | Yes | `true` | — | Mandatory closure (factory holidays) | Internal |
| `is_restricted_choice` | BOOLEAN | Yes | `false` | — | Restricted holiday (employee chooses from list) | Internal |
| `weekly_off_day` | ENUM | No | NULL | SUNDAY, MONDAY, ..., SATURDAY, SECOND_SATURDAY, FOURTH_SATURDAY | Weekly off pattern | Internal |
| `alternate_working_day` | DATE | No | NULL | — | If factory operates on this holiday, alternate working day | Internal |
| `religion_restriction` | VARCHAR(50) | No | NULL | — | Religion restriction (for regional/community holidays) | Confidential |
| `applicable_departments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Restrict to specific departments | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Owning company |
| Facility | Many-to-One | N:1 | Optional facility |
| Leave Request (444) | One-to-Many | 1:N | Sandwich rule computation |
| Attendance (437) | One-to-Many | 1:N | Holiday attendance marking |

### 6. Indexes
- UNIQUE (`calendar_code`)
- INDEX (`company_id`, `calendar_year`, `status`)
- INDEX (`facility_id`, `holiday_date`)
- INDEX (`holiday_type`, `holiday_date`)
- GIN INDEX (`applicable_departments`)

### 7. Security Classification
**Internal** — religion restriction field is **Confidential**.

### 8. Integration Points
- **Attendance Engine** (Entity 437): Marks attendance as "Holiday"
- **Compensation Rules Engine** (Q161): Holiday wage calculation (2x for working on national holiday)
- **Leave Engine**: Sandwich rule computation
- **Workforce Scheduling Engine**: Excludes holidays from rosters
- **Calendar Service** (ESS/MSS): Holiday calendar view

### 9. Sample Data
```json
{
  "calendar_code": "CAL-MH-2026", "calendar_name": "Maharashtra Factory Calendar 2026",
  "company_id": "cmp-001", "facility_id": "fac-mumbai", "state_code": "MH",
  "calendar_year": 2026, "holiday_type": "NATIONAL", "holiday_date": "2026-08-15",
  "holiday_name": "Independence Day", "is_paid": true, "is_mandatory": true,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`HOLIDAY_CALENDAR_CREATED`, `HOLIDAY_CALENDAR_UPDATED`, `HOLIDAY_ADDED`, `HOLIDAY_REMOVED`, `WEEKLY_OFF_CHANGED`

---

## Entity 447 — Compensatory Off

### 1. Business Purpose
Per Part 12 §7: Stores Worked Date, Earned Hours, Expiry, Consumed. Compensatory Off (Comp-Off) is earned by working on holidays/weekends and consumed as paid leave later.

### 2. Architectural Role
Specialized leave balance — separate from regular leave balances. Earned via holiday-work; consumed via leave request with type=Comp-Off.

### 3. Business Rules
- Comp-Off earned: 1 day earned per holiday worked (full day) or 4 hours (half day)
- Comp-Off must be earned within 24 hours of working the holiday (auto-creation via Attendance)
- Comp-Off expiry: typically 60-90 days from earning (configurable)
- Comp-Off cannot be carried forward across calendar years
- Comp-Off encashment: company policy-dependent (some encash at year-end, some forfeit)
- Comp-Off consumption requires manager approval (same workflow as Leave Request)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `compoff_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `worked_date` | DATE | Yes | — | — | Worked Date (per Part 12: "Worked Date") | Internal |
| `worked_against_holiday_id` | UUID | Yes | — | FK to `holiday_calendars` (Entity 446) | Holiday/Weekly-off worked | Internal |
| `worked_hours` | DECIMAL(5,2) | Yes | — | > 0 | Hours worked | Internal |
| `earned_days` | DECIMAL(4,2) | Yes | — | > 0 | Earned Days (per Part 12: "Earned Hours" — converted to days) | Internal |
| `earned_at` | TIMESTAMPTZ | Yes | `now()` | — | Earning timestamp | Internal |
| `expiry_date` | DATE | Yes | — | > worked_date | Expiry (per Part 12: "Expiry") | Internal |
| `consumed_days` | DECIMAL(4,2) | Yes | `0` | ≥ 0 | Consumed (per Part 12: "Consumed") | Internal |
| `consumed_against_request_id` | UUID | No | NULL | FK to `leave_requests` (Entity 444) | Linked leave request | Internal |
| `encashed_days` | DECIMAL(4,2) | Yes | `0` | ≥ 0 | Encashed at year-end | Internal |
| `expired_days` | DECIMAL(4,2) | Yes | `0` | ≥ 0 | Auto-expired | Internal |
| `available_days` | DECIMAL(4,2) | Yes | — | Generated | Available = earned − consumed − encashed − expired | Internal |
| `earning_source` | ENUM | Yes | `HOLIDAY_WORK` | HOLIDAY_WORK, WEEKEND_WORK, OVERTIME_CONVERSION, MANUAL_GRANT | Source of earning | Internal |
| `source_attendance_id` | UUID | No | NULL | FK to `attendance` (Entity 437) | Source attendance entry | Internal |
| `approval_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED | Earn approval (manager confirms holiday work was authorized) | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, EXPIRED, FULLY_CONSUMED, ENCASHED, REJECTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Owner |
| Holiday Calendar (446) | Many-to-One | N:1 | Holiday worked |
| Attendance (437) | Many-to-One | N:1 | Source attendance |
| Leave Request (444) | One-to-Many | 1:N | Consumption requests |
| Leave Encashment (448) | One-to-Many | 1:N | Year-end encashment |

### 6. Indexes
- UNIQUE (`compoff_code`)
- INDEX (`employee_id`, `status`)
- INDEX (`expiry_date`, `status`) — expiry scheduler
- INDEX (`worked_date`)

### 7. Security Classification
**Confidential** — linked to employee work patterns.

### 8. Integration Points
- **Attendance Engine** (Entity 437): Auto-creates comp-off on holiday attendance
- **Compensation Rules Engine** (Q161): Holiday work pay + comp-off accrual
- **Leave Engine**: Comp-off as a Leave Type (441)
- **Year-End Process**: Auto-expire or encash

### 9. Sample Data
```json
{
  "compoff_code": "CO-2026-00123", "employee_id": "wf-001",
  "worked_date": "2026-08-15", "worked_against_holiday_id": "hc-001",
  "worked_hours": 8.00, "earned_days": 1.00, "expiry_date": "2026-11-13",
  "available_days": 1.00, "earning_source": "HOLIDAY_WORK",
  "approval_status": "APPROVED", "status": "ACTIVE"
}
```

### 10. Audit Events
`COMPOFF_EARNED`, `COMPOFF_APPROVED`, `COMPOFF_REJECTED`, `COMPOFF_CONSUMED`, `COMPOFF_ENCASHED`, `COMPOFF_EXPIRED`

---

## Entity 448 — Leave Encashment

### 1. Business Purpose
Per Part 12 §7: Calculates Unused Leave, Salary Basis, Tax, Net Amount. Encashment converts accumulated leave balance to cash payout.

### 2. Architectural Role
Financial transaction — generates accounting events through Compensation Rules Engine, posts to Payroll and Finance.

### 3. Business Rules
- Encashment basis: Basic only / Basic+DA / Gross / CTC (per Leave Policy)
- Encashment formula: `(Salary Basis / 30) × Encashed Days` (per Indian standard)
- Tax treatment: Encashment is fully taxable as salary income (India)
- Statutory exemption: Earned leave encashment at retirement is exempt up to ₹3 lakh (Indian IT Act)
- Encashment cap: per Leave Policy `max_encashment_days`
- Year-end auto-encashment for balances exceeding carry-forward cap
- Encashment requires HR approval (no manager approval — policy decision)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `encashment_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `leave_type_id` | UUID | Yes | — | FK to `leave_types` (Entity 441) | Leave Type (typically EL) | Internal |
| `leave_balance_id` | UUID | Yes | — | FK to `leave_balances` (Entity 443) | Source balance | Confidential |
| `encashment_type` | ENUM | Yes | — | ON_DEMAND, YEAR_END, RETIREMENT, RESIGNATION | Encashment trigger | Internal |
| `encashed_days` | DECIMAL(5,2) | Yes | — | > 0 | Encashed days | Internal |
| `salary_basis_type` | ENUM | Yes | `BASIC` | BASIC, BASIC_DA, GROSS, CTC | Salary Basis (per Part 12: "Salary Basis") | Confidential |
| `salary_basis_amount` | DECIMAL(18,4) | Yes | — | > 0 | Monthly salary basis amount | Confidential |
| `per_day_amount` | DECIMAL(18,4) | Yes | — | > 0 | Per-day rate = salary_basis_amount / 30 | Confidential |
| `gross_amount` | DECIMAL(18,4) | Yes | — | > 0 | Gross = per_day_amount × encashed_days | Confidential |
| `tax_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Tax (per Part 12: "Tax") | Confidential |
| `tds_section` | VARCHAR(20) | No | NULL | — | TDS section (e.g., 192, 10(10AA)) | Confidential |
| `exemption_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Statutory exemption (retirement) | Confidential |
| `net_amount` | DECIMAL(18,4) | Yes | — | ≥ 0 | Net (per Part 12: "Net Amount") = gross − tax + exemption | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `payroll_period_id` | UUID | No | NULL | FK to `payroll_master` (Entity 451) | Linked payroll period | Internal |
| `payroll_posted` | BOOLEAN | Yes | `false` | — | Posted to payroll | Internal |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Accounting event | Confidential |
| `approval_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED | HR approval | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | HR approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `encashment_date` | DATE | Yes | — | — | Effective date | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, PENDING, APPROVED, REJECTED, PAID, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Leave Type (441) | Many-to-One | N:1 | Type |
| Leave Balance (443) | Many-to-One | N:1 | Source balance |
| Payroll Master (451) | Many-to-One | N:1 | Linked payroll |
| Compensation Rules Engine (Q161) | Service | — | Computes encashment |
| Accounting Event | One-to-One | 1:1 | Journal posting |

### 6. Indexes
- UNIQUE (`encashment_code`)
- INDEX (`employee_id`, `status`)
- INDEX (`payroll_period_id`, `payroll_posted`)
- INDEX (`encashment_type`, `status`)

### 7. Security Classification
**Confidential** — financial data; tax fields are **Restricted**.

### 8. Integration Points
- **Compensation Rules Engine** (Q161): Encashment formula + tax computation
- **Payroll Engine** (Entity 454): Posts as earning component
- **Accounting Event Engine** (Part 11): Journal entry — debit Leave Encashment Expense, credit Salary Payable
- **TDS/Tax Engine** (Entity 458): Tax computation & form-16 reporting

### 9. Sample Data
```json
{
  "encashment_code": "ENC-2026-00015", "employee_id": "wf-001",
  "leave_type_id": "lt-EL", "encashment_type": "ON_DEMAND",
  "encashed_days": 5.00, "salary_basis_type": "BASIC",
  "salary_basis_amount": 30000.0000, "per_day_amount": 1000.0000,
  "gross_amount": 5000.0000, "tax_amount": 1500.0000,
  "net_amount": 3500.0000, "currency_code": "INR",
  "approval_status": "PENDING", "status": "PENDING"
}
```

### 10. Audit Events
`LEAVE_ENCASHMENT_REQUESTED`, `LEAVE_ENCASHMENT_APPROVED`, `LEAVE_ENCASHMENT_REJECTED`, `LEAVE_ENCASHMENT_POSTED`, `LEAVE_ENCASHMENT_PAID`, `LEAVE_ENCASHMENT_CANCELLED`

---

## Entity 449 — Leave Audit

### 1. Business Purpose
Per Part 12 §7: Tracks Creation, Modification, Approval, Cancellation, Policy Changes. Comprehensive audit trail for compliance and dispute resolution.

### 2. Architectural Role
Append-only audit ledger — every state change across the leave domain creates an immutable audit record. Source of truth for compliance audits and legal disputes.

### 3. Business Rules
- Records are **append-only** — never updated or deleted
- Captures before/after values for material fields
- Links to user (actor), entity, action, timestamp, IP, user-agent
- Retention: 7 years (Indian labor law requirement)
- Exportable for labor-compliance audits
- Tamper-evident: hash chain across consecutive records

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `audit_code` | VARCHAR(40) | Yes | — | Unique | Sequential audit code | Internal |
| `audit_category` | ENUM | Yes | — | CREATION, MODIFICATION, APPROVAL, CANCELLATION, POLICY_CHANGE, BALANCE_ADJUSTMENT, ENCASHMENT, COMPOFF, SYSTEM | Category (per Part 12) | Internal |
| `entity_type` | ENUM | Yes | — | LEAVE_TYPE, LEAVE_POLICY, LEAVE_BALANCE, LEAVE_REQUEST, LEAVE_APPROVAL, HOLIDAY_CALENDAR, COMPOFF, ENCASHMENT | Affected entity type | Internal |
| `entity_id` | UUID | Yes | — | — | Affected entity ID | Internal |
| `entity_code` | VARCHAR(50) | No | NULL | — | Display code of affected entity | Internal |
| `action` | VARCHAR(50) | Yes | — | — | Action name (e.g., `LEAVE_REQUEST_APPROVED`) | Internal |
| `actor_type` | ENUM | Yes | — | EMPLOYEE, MANAGER, HR, ADMIN, SYSTEM, WORKFLOW_ENGINE | Actor type | Internal |
| `actor_id` | UUID | No | NULL | FK to `workforce_master` | Actor (NULL if system) | Confidential |
| `actor_name` | VARCHAR(200) | No | NULL | — | Denormalized actor name | Internal |
| `before_values` | JSONB | No | NULL | — | Field values before change | Confidential |
| `after_values` | JSONB | No | NULL | — | Field values after change | Confidential |
| `change_summary` | TEXT | No | NULL | — | Human-readable summary | Internal |
| `reason` | TEXT | No | NULL | — | Reason for change (if manual) | Confidential |
| `ip_address` | INET | No | NULL | — | Source IP | Confidential |
| `user_agent` | TEXT | No | NULL | — | User agent | Confidential |
| `session_id` | VARCHAR(100) | No | NULL | — | Session ID | Confidential |
| `correlation_id` | UUID | No | NULL | — | Cross-service correlation ID | Internal |
| `previous_hash` | VARCHAR(64) | Yes | — | — | Hash of previous audit record | Internal |
| `record_hash` | VARCHAR(64) | Yes | — | — | SHA-256 hash of this record | Internal |
| `audit_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Event timestamp | Internal |
| `retention_until` | DATE | Yes | — | — | Retention expiry (audit_timestamp + 7 years) | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, EXPORTED, ARCHIVED | Status | Internal |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workforce Master (381) | Many-to-One | N:1 | Actor |
| All Leave entities (441-448) | Polymorphic | N:1 | Affected entity |

### 6. Indexes
- UNIQUE (`audit_code`)
- INDEX (`entity_type`, `entity_id`, `audit_timestamp`)
- INDEX (`actor_id`, `audit_timestamp`)
- INDEX (`audit_category`, `audit_timestamp`)
- INDEX (`audit_timestamp`, `retention_until`)

### 7. Security Classification
**Confidential** — audit data with PII; before/after values may contain **Restricted** info.

### 8. Integration Points
- **Audit Service** (Foundation Service): Centralized audit pipeline
- **Compliance Reports**: Labor law audit reports
- **BI/Analytics**: Leave pattern analytics
- **Legal Hold**: Litigation hold service

### 9. Sample Data
```json
{
  "audit_code": "LA-2026-045678", "audit_category": "APPROVAL",
  "entity_type": "LEAVE_REQUEST", "entity_id": "lr-001", "entity_code": "LR-2026-00042",
  "action": "LEAVE_REQUEST_APPROVED", "actor_type": "MANAGER", "actor_id": "wf-100",
  "actor_name": "Rajesh Kumar", "change_summary": "Leave request approved by reporting manager",
  "ip_address": "192.168.1.50", "audit_timestamp": "2026-07-08T14:30:00Z",
  "status": "RECORDED"
}
```

### 10. Audit Events
(Meta-recursive: this entity IS the audit trail; events on this entity are managed by Audit Service)

---

## Entity 450 — Leave Dashboard

### 1. Business Purpose
Per Part 12 §7: Displays Leave Balance, Pending Requests, Team Availability, Upcoming Holidays, Leave Trends, Absenteeism. AI-powered insights for Leave Pattern Analysis, Absenteeism Prediction, Leave Abuse Detection, Workforce Availability Forecast.

### 2. Architectural Role
Aggregated view entity — computed from underlying transactions. Powering ESS, MSS, and HR Mission Control dashboards.

### 3. Business Rules
- Snapshot-based: refreshed every 15 minutes for operational dashboards
- Real-time for ESS balance view
- AI insights refreshed daily (overnight batch)
- Multi-grain: per-employee (ESS), per-team (MSS), per-company (HR)
- Anomaly detection: spikes in leave on Mondays/Fridays, festival-clustering, etc.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `snapshot_type` | ENUM | Yes | — | EMPLOYEE, TEAM, DEPARTMENT, FACILITY, COMPANY | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity reference (employee/team/etc.) | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `leave_balance_summary` | JSONB | Yes | `'{}'` | — | Per-type balances (per Part 12: "Leave Balance") | Confidential |
| `pending_requests_count` | INTEGER | Yes | `0` | ≥ 0 | Pending (per Part 12: "Pending Requests") | Internal |
| `pending_requests_value` | JSONB | Yes | `'[]'` | — | Pending request details | Confidential |
| `team_availability_count` | INTEGER | Yes | `0` | ≥ 0 | Available today (per Part 12: "Team Availability") | Internal |
| `team_availability_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | % available | Internal |
| `upcoming_holidays` | JSONB | Yes | `'[]'` | — | Next 5 holidays (per Part 12: "Upcoming Holidays") | Internal |
| `leave_trends_30d` | JSONB | Yes | `'[]'` | — | 30-day trend (per Part 12: "Leave Trends") | Internal |
| `leave_trends_90d` | JSONB | Yes | `'[]'` | — | 90-day trend | Internal |
| `absenteeism_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Absenteeism % (per Part 12: "Absenteeism") | Internal |
| `absenteeism_trend` | JSONB | Yes | `'[]'` | — | Trend | Internal |
| `leave_pattern_analysis` | JSONB | No | NULL | — | AI: pattern anomalies (per Part 12 AI: "Leave Pattern Analysis") | Confidential |
| `absenteeism_prediction` | JSONB | No | NULL | — | AI: next-week prediction (per Part 12 AI) | Confidential |
| `leave_abuse_detection` | JSONB | No | NULL | — | AI: abuse flags (per Part 12 AI: "Leave Abuse Detection") | Restricted |
| `workforce_availability_forecast` | JSONB | No | NULL | — | AI: 30-day forecast (per Part 12 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh timestamp | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model version | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Workforce Master (381) | Many-to-One | N:1 | Employee (for EMPLOYEE grain) |

### 6. Indexes
- UNIQUE (`snapshot_date`, `snapshot_type`, `entity_id`)
- INDEX (`company_id`, `snapshot_date`)
- INDEX (`ai_insights_generated_at`)

### 7. Security Classification
**Confidential** — leave abuse detection is **Restricted**.

### 8. Integration Points
- **BI Service**: Powers leave dashboards
- **AI/ML Service**: Pattern analysis, predictions
- **HR Mission Control** (Sec 13): Operational dashboard
- **ESS Portal**: Employee self-view
- **MSS Portal**: Team view

### 9. Sample Data
```json
{
  "snapshot_date": "2026-07-07", "snapshot_type": "TEAM",
  "entity_id": "team-mfg-001", "company_id": "cmp-001",
  "leave_balance_summary": { "EL": 145.50, "CL": 32.00, "SL": 18.50, "CO": 5.00 },
  "pending_requests_count": 3, "team_availability_count": 22, "team_availability_pct": 88.00,
  "absenteeism_rate_pct": 4.20,
  "ai_insights_generated_at": "2026-07-07T02:00:00Z",
  "ai_model_version": "v2.3.1", "status": "COMPLETED"
}
```

### 10. Audit Events
`LEAVE_DASHBOARD_SNAPSHOT_CREATED`, `LEAVE_DASHBOARD_AI_REFRESHED`, `LEAVE_DASHBOARD_STALE_DETECTED`

---

# SECTION 8: Payroll, Benefits, Loans & Statutory Compliance (Entities 451-460)

## Entity 451 — Payroll Master

### 1. Business Purpose
Per Part 12 §8: Stores Payroll Period, Company, Payroll Cycle, Status, Approval. The master record for each payroll run.

### 2. Architectural Role
Master entity — represents a payroll cycle (monthly, bi-weekly, weekly) for a company. Aggregates all employee payroll processing records and triggers accounting events.

### 3. Business Rules
- Payroll cycle types: MONTHLY (India standard), BI_WEEKLY, WEEKLY (factory/contract labor), DAILY (daily wage)
- Lock-in: Once status = PROCESSING, no attendance/leave changes accepted (post to next cycle)
- Statutory due dates: PF/ESIC by 15th, PT by 20th, TDS by 7th of following month
- Final approval requires HR Head + Finance Head sign-off
- Reversal: erroneous payroll can be reversed only with audit trail
- Multi-company: each company has its own payroll master

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `payroll_code` | VARCHAR(30) | Yes | — | Unique per company | Code (e.g., `PAY-2026-07`) | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company (per Part 12: "Company") | Internal |
| `payroll_cycle` | ENUM | Yes | — | MONTHLY, BI_WEEKLY, WEEKLY, DAILY, FORTNIGHTLY | Payroll Cycle (per Part 12: "Payroll Cycle") | Internal |
| `period_name` | VARCHAR(50) | Yes | — | Min 5 | Display name (e.g., "July 2026 Payroll") | Internal |
| `period_start_date` | DATE | Yes | — | — | Period start | Internal |
| `period_end_date` | DATE | Yes | — | > period_start_date | Period end | Internal |
| `pay_date` | DATE | Yes | — | > period_end_date | Pay date | Internal |
| `processing_year` | INTEGER | Yes | — | 1900-9999 | Financial year | Internal |
| `processing_month` | INTEGER | Yes | — | 1-12 | Calendar month | Internal |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `total_employees` | INTEGER | Yes | `0` | ≥ 0 | Employees in scope | Internal |
| `processed_employees` | INTEGER | Yes | `0` | ≥ 0 | Processed so far | Internal |
| `gross_salary_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Gross total | Confidential |
| `net_salary_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Net total | Confidential |
| `statutory_deductions_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | PF+ESIC+PT+TDS total | Confidential |
| `loan_recoveries_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Loan EMI total | Confidential |
| `reimbursement_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Reimbursement total | Confidential |
| `overtime_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | OT total | Confidential |
| `bank_advice_generated` | BOOLEAN | Yes | `false` | — | Bank advice file generated | Internal |
| `accounting_posted` | BOOLEAN | Yes | `false` | — | Posted to GL | Internal |
| `statutory_challans_generated` | BOOLEAN | Yes | `false` | — | PF/ESIC/PT/TDS challans generated | Internal |
| `payslips_generated` | BOOLEAN | Yes | `false` | — | Payslips generated | Internal |
| `lock_applied` | BOOLEAN | Yes | `false` | — | Payroll locked | Internal |
| `locked_at` | TIMESTAMPTZ | No | NULL | — | Lock timestamp | Internal |
| `locked_by` | UUID | No | NULL | FK to `workforce_master` | Locked by | Confidential |
| `approval_status` | ENUM | Yes | `DRAFT` | DRAFT, IN_REVIEW, APPROVED, REJECTED, REVERSED | Approval (per Part 12: "Approval") | Internal |
| `approved_by_hr` | UUID | No | NULL | FK to `workforce_master` | HR approval | Confidential |
| `approved_by_finance` | UUID | No | NULL | FK to `workforce_master` | Finance approval | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `reversed_at` | TIMESTAMPTZ | No | NULL | — | Reversal timestamp | Internal |
| `reversal_reason` | TEXT | No | NULL | — | Reversal reason | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, PROCESSING, READY_FOR_APPROVAL, APPROVED, PROCESSING_PAYMENT, PAID, REVERSED, CANCELLED | Status (per Part 12: "Status") | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Payroll Processing (454) | One-to-Many | 1:N | Per-employee payroll |
| Payroll Bank Advice (459) | One-to-Many | 1:N | Bank file |
| Statutory Compliance (458) | One-to-Many | 1:N | Challans |
| Accounting Event | One-to-Many | 1:N | Journal postings |

### 6. Indexes
- UNIQUE (`payroll_code`)
- INDEX (`company_id`, `status`)
- INDEX (`period_start_date`, `period_end_date`)
- INDEX (`pay_date`, `status`)
- INDEX (`approval_status`)

### 7. Security Classification
**Confidential** — financial data; reversal reason is **Restricted**.

### 8. Integration Points
- **Compensation Rules Engine** (Q161): Drives payroll calculation
- **Accounting Event Engine** (Part 11): Journal postings
- **Banking Integration**: Bank advice file generation
- **Statutory Portal Integration**: PF/ESIC/TDS e-filing
- **Finance Cube** (Part 11): Payroll cost analysis

### 9. Sample Data
```json
{
  "payroll_code": "PAY-2026-07", "company_id": "cmp-001", "payroll_cycle": "MONTHLY",
  "period_name": "July 2026 Payroll", "period_start_date": "2026-07-01",
  "period_end_date": "2026-07-31", "pay_date": "2026-08-05",
  "processing_year": 2026, "processing_month": 7,
  "total_employees": 250, "processed_employees": 250,
  "gross_salary_total": 12500000.0000, "net_salary_total": 9500000.0000,
  "statutory_deductions_total": 1850000.0000, "status": "APPROVED"
}
```

### 10. Audit Events
`PAYROLL_CREATED`, `PAYROLL_PROCESSING_STARTED`, `PAYROLL_LOCKED`, `PAYROLL_APPROVED`, `PAYROLL_PAID`, `PAYROLL_REVERSED`, `PAYROLL_CANCELLED`

---

## Entity 452 — Salary Structure

### 1. Business Purpose
Per Part 12 §8: Supports Basic, HRA, DA, Special Allowance, Bonus, Variable Pay. Defines the composition of an employee's CTC.

### 2. Architectural Role
Configuration entity — defines the template; per-employee instance is `Employee Salary Structure` (derived). Compensation Rules Engine (Q161) uses this to compute monthly salary.

### 3. Business Rules
- CTC = Basic + HRA + DA + Special Allowance + Bonus + Variable Pay + Employer PF + Employer ESIC + Gratuity provision
- Statutory minimums: Basic ≥ 50% of gross (per Indian Code on Wages); HRA = 40-50% of Basic (metro/non-metro)
- Variable pay: paid quarterly/half-yearly based on performance
- Bonus: statutory minimum 8.33% of basic (Bonus Act)
- Special Allowance: balancing component to reach agreed CTC
- Effective period: structure changes apply from effective date; not retroactive
- Approval workflow: HR Head + Finance Head + CEO (for CTC > threshold)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `structure_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `structure_name` | VARCHAR(100) | Yes | — | Min 3 | Display name | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `grade_id` | UUID | No | NULL | FK to `grades` | Grade scope | Internal |
| `employee_category` | ENUM | No | NULL | EXECUTIVE, MANAGEMENT, SUPERVISOR, WORKER, CONTRACT, TRAINEE | Category | Internal |
| `ctc_annual` | DECIMAL(18,4) | Yes | — | > 0 | Annual CTC | Confidential |
| `ctc_monthly` | DECIMAL(18,4) | Yes | — | > 0 | Monthly CTC | Confidential |
| `basic_annual` | DECIMAL(18,4) | Yes | — | ≥ 0 | Basic (per Part 12: "Basic") | Confidential |
| `basic_pct_of_ctc` | DECIMAL(5,2) | Yes | — | 0-100 | Basic % of CTC | Internal |
| `hra_annual` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | HRA (per Part 12: "HRA") | Confidential |
| `hra_pct_of_basic` | DECIMAL(5,2) | Yes | `0` | 0-100 | HRA % of Basic | Internal |
| `da_annual` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | DA (per Part 12: "DA") | Confidential |
| `da_pct_of_basic` | DECIMAL(5,2) | Yes | `0` | 0-100 | DA % of Basic | Internal |
| `special_allowance_annual` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Special Allowance (per Part 12: "Special Allowance") | Confidential |
| `bonus_annual` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Bonus (per Part 12: "Bonus") | Confidential |
| `bonus_type` | ENUM | Yes | `STATUTORY` | STATUTORY, PERFORMANCE, JOINING, FESTIVAL, NONE | Bonus type | Internal |
| `variable_pay_annual` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Variable Pay (per Part 12: "Variable Pay") | Confidential |
| `variable_pay_frequency` | ENUM | No | NULL | QUARTERLY, HALF_YEARLY, YEARLY | Variable pay cycle | Internal |
| `employer_pf_annual` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Employer PF (12% of Basic) | Confidential |
| `employer_esic_annual` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Employer ESIC (3.25% of Gross) | Confidential |
| `gratuity_provision_annual` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Gratuity provision (4.81% of Basic) | Confidential |
| `gross_monthly` | DECIMAL(18,4) | Yes | — | ≥ 0 | Gross monthly = (Basic+HRA+DA+Special+Variable)/12 | Confidential |
| `cost_to_company_monthly` | DECIMAL(18,4) | Yes | — | ≥ 0 | Monthly CTC | Confidential |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `approval_status` | ENUM | Yes | `DRAFT` | DRAFT, PENDING_APPROVAL, APPROVED, REJECTED | Approval | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE, SUPERSEDED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Grade | Many-to-One | N:1 | Grade scope |
| Payroll Component (453) | Many-to-Many | N:N | Via component mapping |
| Payroll Processing (454) | One-to-Many | 1:N | Per-employee instances |
| Compensation Rules Engine (Q161) | Service | — | Computes salary |

### 6. Indexes
- UNIQUE (`structure_code`)
- INDEX (`company_id`, `status`)
- INDEX (`grade_id`, `employee_category`)
- INDEX (`effective_from`, `effective_to`)

### 7. Security Classification
**Confidential** — financial compensation data.

### 8. Integration Points
- **Compensation Rules Engine** (Q161): Primary consumer
- **Payroll Processing** (Entity 454): Per-employee salary calc
- **Statutory Compliance** (Entity 458): PF/ESIC base values
- **Finance Cube** (Part 11): Salary cost analytics

### 9. Sample Data
```json
{
  "structure_code": "SAL-MGT-2026", "structure_name": "Management Grade 2026",
  "company_id": "cmp-001", "grade_id": "grade-mgt",
  "ctc_annual": 1200000.0000, "basic_annual": 600000.0000, "basic_pct_of_ctc": 50.00,
  "hra_annual": 240000.0000, "hra_pct_of_basic": 40.00, "da_annual": 0,
  "special_allowance_annual": 300000.0000, "bonus_annual": 50000.0000,
  "variable_pay_annual": 10000.0000, "variable_pay_frequency": "YEARLY",
  "employer_pf_annual": 72000.0000, "gratuity_provision_annual": 28860.0000,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`SALARY_STRUCTURE_CREATED`, `SALARY_STRUCTURE_UPDATED`, `SALARY_STRUCTURE_APPROVED`, `SALARY_STRUCTURE_SUPERSEDED`, `SALARY_STRUCTURE_INACTIVATED`

---

## Entity 453 — Payroll Component

### 1. Business Purpose
Per Part 12 §8: Types — Earning, Deduction, Employer Contribution, Reimbursement. The atomic unit of payroll calculation.

### 2. Architectural Role
Master entity — defines all possible payroll components. Each Salary Structure (452) maps a subset of these components with formulas.

### 3. Business Rules
- Component types: EARNING (adds to gross), DEDUCTION (reduces net), EMPLOYER_CONTRIBUTUTION (CTC component, not paid), REIMBURSEMENT (paid against claim)
- Statutory components: PF, ESIC, PT, LWF, TDS, Gratuity — flagged `is_statutory=true`
- Each component has a calculation formula (managed by Compensation Rules Engine Q161)
- Components are either fixed (basic) or variable (overtime, incentive)
- Taxability flag: taxable components contribute to gross taxable income
- PF-eligible flag: component contributes to PF base (Basic+DA+Retaining allowance per PF Act)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `component_code` | VARCHAR(30) | Yes | — | Unique per company | Code (e.g., `BASIC`, `HRA`, `PF_EE`) | Internal |
| `component_name` | VARCHAR(100) | Yes | — | Min 3 | Display name | Internal |
| `component_type` | ENUM | Yes | — | EARNING, DEDUCTION, EMPLOYER_CONTRIBUTUTION, REIMBURSEMENT | Type (per Part 12) | Internal |
| `component_category` | ENUM | Yes | — | BASIC, ALLOWANCE, PERQUISITE, BONUS, OVERTIME, INCENTIVE, STATUTORY_DEDUCTION, LOAN_RECOVERY, TAX, REIMBURSEMENT, OTHER | Category | Internal |
| `is_statutory` | BOOLEAN | Yes | `false` | — | Statutory component (PF/ESIC/PT/TDS/Gratuity) | Internal |
| `is_taxable` | BOOLEAN | Yes | `true` | — | Taxable for TDS | Confidential |
| `is_pf_eligible` | BOOLEAN | Yes | `false` | — | Contributes to PF base | Confidential |
| `is_esic_eligible` | BOOLEAN | Yes | `false` | — | Contributes to ESIC base | Confidential |
| `is_gratuity_eligible` | BOOLEAN | Yes | `false` | — | Contributes to gratuity base | Confidential |
| `is_encashment_eligible` | BOOLEAN | Yes | `false` | — | Included in leave encashment basis | Confidential |
| `calculation_formula` | TEXT | No | NULL | — | Compensation Rules Engine formula (e.g., `BASIC * 0.40`) | Confidential |
| `calculation_type` | ENUM | Yes | `FORMULA` | FORMULA, FIXED, SLAB, ATTENDANCE_BASED, PERFORMANCE_BASED, MANUAL | Calculation method | Internal |
| `default_value` | DECIMAL(18,4) | No | NULL | ≥ 0 | Default value (for FIXED type) | Confidential |
| `slab_config` | JSONB | No | NULL | — | Slab configuration (for SLAB type) | Confidential |
| `payment_frequency` | ENUM | Yes | `MONTHLY` | MONTHLY, QUARTERLY, HALF_YEARLY, YEARLY, ONE_TIME | Payout frequency | Internal |
| `tax_section` | VARCHAR(20) | No | NULL | — | IT Act section (e.g., `17(1)`, `17(2)`, `80C`) | Confidential |
| `account_gl_code` | VARCHAR(30) | No | NULL | FK to `gl_accounts` | Posting GL account | Confidential |
| `cost_center_required` | BOOLEAN | Yes | `false` | — | Cost center allocation required | Internal |
| `payslip_display` | BOOLEAN | Yes | `true` | — | Show on payslip | Internal |
| `payslip_display_order` | INTEGER | Yes | `100` | ≥ 1 | Display order on payslip | Internal |
| `negative_allowed` | BOOLEAN | Yes | `false` | — | Allows negative value (recovery) | Internal |
| `applicable_countries` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Country applicability | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Salary Structure (452) | Many-to-Many | N:N | Via structure-component mapping |
| Payroll Processing (454) | One-to-Many | 1:N | Per-employee computed values |
| Compensation Rules Engine (Q161) | Service | — | Formula execution |
| GL Account (Part 11) | Many-to-One | N:1 | Accounting posting |

### 6. Indexes
- UNIQUE (`component_code`)
- INDEX (`component_type`, `status`)
- INDEX (`is_statutory`, `status`)
- GIN INDEX (`applicable_countries`)

### 7. Security Classification
**Confidential** — formula and tax sections are **Restricted**.

### 8. Integration Points
- **Compensation Rules Engine** (Q161): Formula execution
- **Payroll Processing** (Entity 454): Per-employee computation
- **Tax Engine** (Entity 458): Taxability & section mapping
- **Accounting Event Engine** (Part 11): GL posting
- **Payslip Generator**: Display on payslip

### 9. Sample Data
```json
{
  "component_code": "PF_EE", "component_name": "Provident Fund (Employee)",
  "component_type": "DEDUCTION", "component_category": "STATUTORY_DEDUCTION",
  "is_statutory": true, "is_taxable": false, "is_pf_eligible": false,
  "calculation_formula": "PF_BASE * 0.12", "calculation_type": "FORMULA",
  "payment_frequency": "MONTHLY", "tax_section": "80C",
  "account_gl_code": "2210-PF-PAYABLE", "payslip_display": true,
  "payslip_display_order": 50, "status": "ACTIVE"
}
```

### 10. Audit Events
`PAYROLL_COMPONENT_CREATED`, `PAYROLL_COMPONENT_UPDATED`, `PAYROLL_COMPONENT_FORMULA_CHANGED`, `PAYROLL_COMPONENT_INACTIVATED`

---

## Entity 454 — Payroll Processing

### 1. Business Purpose
Per Part 12 §8: Calculates Gross Salary, Net Salary, Overtime, Leave Deduction, Arrears, Incentives. The per-employee payroll computation record.

### 2. Architectural Role
Transaction entity — one record per employee per payroll period. Driven entirely by Compensation Rules Engine (Q161). Generates accounting events and bank advice records.

### 3. Business Rules
- One record per employee per Payroll Master (451)
- Computation pipeline: attendance → leave → overtime → base salary → allowances → deductions → loan recovery → reimbursements → net pay
- All calculations performed by Compensation Rules Engine (Q161) — no business logic in Payroll Processing
- Lock-in: once payroll locked, record cannot be modified — only via reversal & reprocessing
- Arrears computed automatically (salary structure change retroactive)
- Round-off at component level; net pay rounded to nearest rupee

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `payroll_master_id` | UUID | Yes | — | FK to `payroll_master` (Entity 451) | Payroll period | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `salary_structure_id` | UUID | Yes | — | FK to `salary_structures` (Entity 452) | Applied structure | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `work_days_in_period` | DECIMAL(5,2) | Yes | — | ≥ 0 | Total work days | Internal |
| `present_days` | DECIMAL(5,2) | Yes | — | ≥ 0 | Present (per Part 12) | Internal |
| `paid_days` | DECIMAL(5,2) | Yes | — | ≥ 0 | Paid days (incl. holidays, paid leave) | Internal |
| `lop_days` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Loss of pay days | Internal |
| `overtime_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | OT hours (per Part 12: "Overtime") | Internal |
| `overtime_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | OT amount | Confidential |
| `gross_earnings` | DECIMAL(18,4) | Yes | — | ≥ 0 | Gross Salary (per Part 12: "Gross Salary") | Confidential |
| `total_deductions` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total deductions | Confidential |
| `employer_contributions` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Employer PF/ESIC/Gratuity | Confidential |
| `leave_deduction_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Leave Deduction (per Part 12: "Leave Deduction") | Confidential |
| `arrears_amount` | DECIMAL(18,4) | Yes | `0` | — | Arrears (per Part 12: "Arrears") | Confidential |
| `incentives_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Incentives (per Part 12: "Incentives") | Confidential |
| `loan_recovery_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Loan EMI recovery | Confidential |
| `reimbursement_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Reimbursement payout | Confidential |
| `tds_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | TDS deduction | Confidential |
| `net_salary` | DECIMAL(18,4) | Yes | — | ≥ 0 | Net Salary (per Part 12: "Net Salary") | Confidential |
| `round_off_amount` | DECIMAL(18,4) | Yes | `0` | — | Round-off adjustment | Confidential |
| `net_payable_amount` | DECIMAL(18,4) | Yes | — | = net_salary + round_off | Net payable | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `components_breakup` | JSONB | Yes | `'[]'` | — | Per-component breakdown | Confidential |
| `computation_log` | JSONB | No | NULL | — | Compensation Rules Engine execution log | Restricted |
| `computation_engine_version` | VARCHAR(20) | Yes | — | — | Engine version | Internal |
| `payslip_generated` | BOOLEAN | Yes | `false` | — | Payslip generated | Internal |
| `payslip_id` | UUID | No | NULL | FK to `payslips` | Payslip reference | Internal |
| `bank_advice_id` | UUID | No | NULL | FK to `payroll_bank_advice` (Entity 459) | Bank advice | Internal |
| `accounting_posted` | BOOLEAN | Yes | `false` | — | Posted to GL | Internal |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Journal posting | Confidential |
| `processed_at` | TIMESTAMPTZ | No | NULL | — | Processing timestamp | Internal |
| `processed_by` | UUID | No | NULL | FK to `workforce_master` | Processor | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, PROCESSED, ERROR, ON_HOLD, EXCLUDED, REVERSED | Status | Internal |
| `error_details` | JSONB | No | NULL | — | Error info if ERROR | Internal |
| `hold_reason` | TEXT | No | NULL | — | Reason if ON_HOLD | Confidential |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Payroll Master (451) | Many-to-One | N:1 | Period |
| Employee (381) | Many-to-One | N:1 | Employee |
| Salary Structure (452) | Many-to-One | N:1 | Applied structure |
| Payroll Bank Advice (459) | Many-to-One | N:1 | Bank file |
| Compensation Rules Engine (Q161) | Service | — | All computations |
| Accounting Event | One-to-One | 1:1 | Journal posting |

### 6. Indexes
- UNIQUE (`payroll_master_id`, `employee_id`)
- INDEX (`employee_id`, `status`)
- INDEX (`status`, `error_details`)
- INDEX (`accounting_posted`)

### 7. Security Classification
**Confidential** — financial data; computation log is **Restricted**.

### 8. Integration Points
- **Compensation Rules Engine** (Q161): All calculations
- **Accounting Event Engine** (Part 11): GL postings
- **Banking Integration**: Bank advice file
- **Payslip Generator**: PDF/HTML payslip
- **Statutory Compliance** (Entity 458): PF/ESIC/TDS filings

### 9. Sample Data
```json
{
  "payroll_master_id": "pm-2026-07", "employee_id": "wf-001",
  "work_days_in_period": 27, "present_days": 25, "paid_days": 27, "lop_days": 0,
  "overtime_hours": 8, "overtime_amount": 1000.0000,
  "gross_earnings": 100000.0000, "total_deductions": 18000.0000,
  "employer_contributions": 12000.0000, "net_salary": 83000.0000,
  "net_payable_amount": 83000.0000, "computation_engine_version": "v3.1.0",
  "status": "PROCESSED"
}
```

### 10. Audit Events
`PAYROLL_PROCESSING_STARTED`, `PAYROLL_PROCESSED`, `PAYROLL_ON_HOLD`, `PAYROLL_ERROR`, `PAYROLL_REVERSED`, `PAYROLL_ACCOUNTING_POSTED`, `PAYROLL_PAYSLIP_GENERATED`

---

## Entity 455 — Benefits Management

### 1. Business Purpose
Per Part 12 §8: Supports Health Insurance, Life Insurance, Meal Coupons, Transport, Accommodation, Medical, LTA, Education. Non-cash compensation and welfare benefits administration.

### 2. Architectural Role
Configuration + transaction entity — defines benefit plans (master) and employee enrollments (transactions). Some benefits impact payroll (e.g., meal coupons taxable), others don't (e.g., transport).

### 3. Business Rules
- Benefits are per-company + per-grade (executives may get car lease, workers get transport)
- Enrollment requires employee + dependent declarations (for health insurance)
- Health insurance: family floater or individual — sum insured configurable
- LTA: tax-exempt up to 2x of eligible amount (Indian IT Act Sec 17(5))
- Meal coupons: tax-exempt up to ₹50/meal × 2 meals/day (≈ ₹3000/month)
- Accommodation: perquisite valuation per IT Act
- Education: dependent education allowance tax-exempt up to ₹100/month per child (max 2 children)
- Annual renewal: benefits auto-renew unless employee opts out

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `benefit_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `benefit_name` | VARCHAR(100) | Yes | — | Min 3 | Display name | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `benefit_type` | ENUM | Yes | — | HEALTH_INSURANCE, LIFE_INSURANCE, MEAL_COUPONS, TRANSPORT, ACCOMMODATION, MEDICAL, LTA, EDUCATION, CAR_LEASE, PHONE, INTERNET, WELLNESS, CHILD_CARE | Benefit type (per Part 12) | Internal |
| `category` | ENUM | Yes | — | INSURANCE, WELFARE, PERQUISITE, REIMBURSEMENT, ALLOWANCE | Category | Internal |
| `is_statutory` | BOOLEAN | Yes | `false` | — | Statutory benefit (e.g., ESIC, Gratuity) | Internal |
| `is_taxable` | BOOLEAN | Yes | `true` | — | Taxable perquisite | Confidential |
| `tax_treatment` | VARCHAR(50) | No | NULL | — | Tax section reference (e.g., `17(2)(iii)`) | Confidential |
| `eligibility_criteria` | JSONB | Yes | `'{}'` | — | Grade/tenure/department criteria | Internal |
| `benefit_value_type` | ENUM | Yes | `FIXED` | FIXED, REIMBURSEMENT, POLICY_BASED, USAGE_BASED | Value computation | Internal |
| `default_value_annual` | DECIMAL(18,4) | No | NULL | ≥ 0 | Default annual value | Confidential |
| `default_value_monthly` | DECIMAL(18,4) | No | NULL | ≥ 0 | Default monthly value | Confidential |
| `payroll_component_id` | UUID | No | NULL | FK to `payroll_components` (Entity 453) | Linked payroll component | Confidential |
| `vendor_id` | UUID | No | NULL | FK to `vendors` | External vendor (insurer, caterer, etc.) | Internal |
| `policy_number` | VARCHAR(50) | No | NULL | — | Master policy number | Confidential |
| `coverage_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Sum insured (insurance) | Confidential |
| `renewal_frequency` | ENUM | Yes | `YEARLY` | YEARLY, HALF_YEARLY, QUARTERLY, NONE | Renewal cycle | Internal |
| `auto_renew` | BOOLEAN | Yes | `true` | — | Auto-renew enrollment | Internal |
| `requires_dependent_declaration` | BOOLEAN | Yes | `false` | — | Health insurance needs dependents | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Vendor (Part 5) | Many-to-One | N:1 | Benefit vendor |
| Payroll Component (453) | Many-to-One | N:1 | Payroll impact |
| Employee Benefit Enrollment | One-to-Many | 1:N | Per-employee enrollment |
| Compensation Rules Engine (Q161) | Service | — | Perquisite valuation |

### 6. Indexes
- UNIQUE (`benefit_code`)
- INDEX (`company_id`, `benefit_type`, `status`)
- INDEX (`vendor_id`)

### 7. Security Classification
**Confidential** — coverage amounts and policy numbers are **Restricted**.

### 8. Integration Points
- **Vendor Integration** (Part 5): Insurer portal, meal coupon provider
- **Payroll Engine** (Entity 454): Perquisite value posting
- **Tax Engine** (Entity 458): Perquisite taxation
- **ESS Portal**: Employee enrollment & claims
- **Compensation Rules Engine** (Q161): Perquisite valuation formulas

### 9. Sample Data
```json
{
  "benefit_code": "HI-FAMILY-2026", "benefit_name": "Family Health Insurance 2026",
  "company_id": "cmp-001", "benefit_type": "HEALTH_INSURANCE", "category": "INSURANCE",
  "is_statutory": false, "is_taxable": false, "benefit_value_type": "POLICY_BASED",
  "vendor_id": "vnd-star-health", "policy_number": "SH-2026-001",
  "coverage_amount": 500000.0000, "renewal_frequency": "YEARLY",
  "requires_dependent_declaration": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`BENEFIT_CREATED`, `BENEFIT_UPDATED`, `BENEFIT_RENEWED`, `BENEFIT_INACTIVATED`, `BENEFIT_VENDOR_CHANGED`

---

## Entity 456 — Employee Loan

### 1. Business Purpose
Per Part 12 §8: Tracks Loan Type, Amount, Interest, EMI, Outstanding, Recovery. Employee loan management with payroll recovery.

### 2. Architectural Role
Loan lifecycle entity — from application to closure. Recovery happens through Payroll Processing via Compensation Rules Engine.

### 3. Business Rules
- Loan types: PERSONAL, VEHICLE, HOUSE, MEDICAL, FESTIVAL, SALARY_ADVANCE, DEPOSIT_RECOVERY
- Interest: 0% (salary advance) to 8% (vehicle loan) — company-subsidized
- EMI computation: standard reducing-balance formula
- Recovery: per-EMI through payroll; missed EMI rolls to next cycle
- Pre-closure allowed with adjustment (interest rebate)
- Outstanding shown on payslip
- Maximum concurrent loans: 2 (per company policy)
- Loan amount cap: 6x monthly basic (typical)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `loan_number` | VARCHAR(30) | Yes | — | Unique per company | Display number | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `loan_type` | ENUM | Yes | — | PERSONAL, VEHICLE, HOUSE, MEDICAL, FESTIVAL, SALARY_ADVANCE, DEPOSIT_RECOVERY | Loan Type (per Part 12) | Internal |
| `principal_amount` | DECIMAL(18,4) | Yes | — | > 0 | Loan Amount (per Part 12: "Amount") | Confidential |
| `interest_rate_pct` | DECIMAL(6,3) | Yes | `0` | 0-100 | Interest (per Part 12: "Interest") — annual % | Confidential |
| `tenure_months` | INTEGER | Yes | — | 1-360 | Tenure in months | Internal |
| `emi_amount` | DECIMAL(18,4) | Yes | — | > 0 | EMI (per Part 12: "EMI") | Confidential |
| `total_payable_amount` | DECIMAL(18,4) | Yes | — | > 0 | Total = principal + total interest | Confidential |
| `total_interest_amount` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total interest | Confidential |
| `disbursement_date` | DATE | Yes | — | — | Disbursement date | Internal |
| `first_emi_date` | DATE | Yes | — | > disbursement_date | First EMI due | Internal |
| `last_emi_date` | DATE | Yes | — | — | Last EMI due | Internal |
| `outstanding_principal` | DECIMAL(18,4) | Yes | — | ≥ 0 | Outstanding (per Part 12: "Outstanding") | Confidential |
| `outstanding_interest` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Outstanding interest | Confidential |
| `total_outstanding` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total outstanding | Confidential |
| `emis_paid` | INTEGER | Yes | `0` | ≥ 0 | EMIs paid count | Internal |
| `emis_pending` | INTEGER | Yes | — | ≥ 0 | EMIs remaining | Internal |
| `emis_missed` | INTEGER | Yes | `0` | ≥ 0 | Missed EMIs | Internal |
| `recovery_type` | ENUM | Yes | `PAYROLL_DEDUCTION` | PAYROLL_DEDUCTION, CASH, CHEQUE, AUTO_DEBIT | Recovery (per Part 12) | Internal |
| `recovery_payroll_component_id` | UUID | No | NULL | FK to `payroll_components` (Entity 453) | Payroll deduction component | Confidential |
| `pre_closure_allowed` | BOOLEAN | Yes | `true` | — | Pre-closure allowed | Internal |
| `pre_closure_charge_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Pre-closure penalty | Confidential |
| `foreclosure_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Foreclosure amount | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `approval_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED | Approval | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `disbursement_posted` | BOOLEAN | Yes | `false` | — | Disbursement accounted | Internal |
| `disbursement_accounting_id` | UUID | No | NULL | FK to `accounting_events` | Disbursement journal | Confidential |
| `closed_at` | TIMESTAMPTZ | No | NULL | — | Closure timestamp | Internal |
| `closure_type` | ENUM | No | NULL | REGULAR, PRE_CLOSED, WRITTEN_OFF, RECOVERED_ON_EXIT | Closure type | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, PENDING, APPROVED, DISBURSED, ACTIVE, CLOSED, PRE_CLOSED, WRITTEN_OFF, DEFAULTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Borrower |
| Payroll Component (453) | Many-to-One | N:1 | Recovery component |
| Payroll Processing (454) | One-to-Many | 1:N | Per-payroll recovery |
| Accounting Event | One-to-Many | 1:N | Disbursement & recovery journals |
| Compensation Rules Engine (Q161) | Service | — | EMI computation |

### 6. Indexes
- UNIQUE (`loan_number`)
- INDEX (`employee_id`, `status`)
- INDEX (`status`, `first_emi_date`)
- INDEX (`recovery_payroll_component_id`)

### 7. Security Classification
**Confidential** — financial loan data.

### 8. Integration Points
- **Compensation Rules Engine** (Q161): EMI computation + payroll recovery
- **Accounting Event Engine** (Part 11): Disbursement & recovery postings
- **Payroll Processing** (Entity 454): Monthly EMI deduction
- **ESS Portal**: Loan application & statement
- **Employee Exit Process**: Outstanding recovery on full & final

### 9. Sample Data
```json
{
  "loan_number": "LN-2026-00045", "employee_id": "wf-001",
  "loan_type": "VEHICLE", "principal_amount": 200000.0000,
  "interest_rate_pct": 8.000, "tenure_months": 36, "emi_amount": 6267.2800,
  "total_payable_amount": 225622.0800, "total_interest_amount": 25622.0800,
  "disbursement_date": "2026-04-01", "first_emi_date": "2026-05-01",
  "outstanding_principal": 165000.0000, "emis_paid": 3, "emis_pending": 33,
  "recovery_type": "PAYROLL_DEDUCTION", "status": "ACTIVE"
}
```

### 10. Audit Events
`LOAN_APPLIED`, `LOAN_APPROVED`, `LOAN_REJECTED`, `LOAN_DISBURSED`, `LOAN_EMI_RECOVERED`, `LOAN_EMI_MISSED`, `LOAN_PRE_CLOSED`, `LOAN_CLOSED`, `LOAN_WRITTEN_OFF`

---

## Entity 457 — Reimbursement

### 1. Business Purpose
Per Part 12 §8: Supports Travel, Fuel, Medical, Food, Internet, Training, Mobile. Employee expense reimbursement with claim-workflow and payroll payout.

### 2. Architectural Role
Transaction entity — claim submission → approval → payroll payout. Compensation Rules Engine (Q161) handles tax-exemption calculation.

### 3. Business Rules
- Reimbursement types with monthly caps: Fuel (₹8000), Food (₹3000), Internet (₹1000), Mobile (₹1500), etc.
- Annual caps: LTA (₹25000 tax-exempt), Medical (₹15000 tax-exempt)
- Travel: actuals with bills, daily allowance as per city tier
- Training: skill-upgrade reimbursements, max ₹50000/year
- Submit within 30 days of expense (rule-based)
- Approval: Manager → Finance (within policy); HR Head (out of policy)
- Tax-exemption auto-computed by Compensation Rules Engine based on bills vs policy cap

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `claim_number` | VARCHAR(30) | Yes | — | Unique per company | Claim number | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `reimbursement_type` | ENUM | Yes | — | TRAVEL, FUEL, MEDICAL, FOOD, INTERNET, TRAINING, MOBILE, DRIVER, NEWSAPER, EQUIPMENT, OTHER | Type (per Part 12) | Internal |
| `claim_period_month` | INTEGER | No | NULL | 1-12 | Period month (monthly reimbursements) | Internal |
| `claim_period_year` | INTEGER | No | NULL | 1900-9999 | Period year | Internal |
| `expense_date` | DATE | Yes | — | — | Date of expense | Internal |
| `expense_amount` | DECIMAL(18,4) | Yes | — | > 0 | Claimed amount | Confidential |
| `policy_cap_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Maximum per policy | Confidential |
| `approved_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Approved amount | Confidential |
| `tax_exemption_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Tax-exempt portion | Confidential |
| `taxable_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Taxable portion | Confidential |
| `tax_section` | VARCHAR(20) | No | NULL | — | IT Act section (e.g., `10(14)`) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `bills_count` | INTEGER | Yes | `0` | ≥ 0 | Number of bills submitted | Internal |
| `bills_total_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Sum of bill amounts | Confidential |
| `attachment_ids` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Bill attachment references | Confidential |
| `vendor_id` | UUID | No | NULL | FK to `vendors` | Travel agency / vendor | Internal |
| `travel_details` | JSONB | No | NULL | — | Travel itinerary (for TRAVEL type) | Confidential |
| `purpose` | TEXT | Yes | — | Min 10 | Business purpose | Confidential |
| `approval_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, PARTIALLY_APPROVED | Approval | Internal |
| `current_approver_id` | UUID | No | NULL | FK to `workforce_master` | Current approver | Confidential |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Final approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `rejection_reason` | TEXT | No | NULL | — | Rejection reason | Confidential |
| `payroll_master_id` | UUID | No | NULL | FK to `payroll_master` (Entity 451) | Payout payroll period | Internal |
| `payroll_posted` | BOOLEAN | Yes | `false` | — | Posted to payroll | Internal |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Journal posting | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SUBMITTED, IN_APPROVAL, APPROVED, REJECTED, PAID, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Claimant |
| Vendor (Part 5) | Many-to-One | N:1 | Vendor |
| Payroll Master (451) | Many-to-One | N:1 | Payout period |
| Compensation Rules Engine (Q161) | Service | — | Tax-exemption computation |
| Accounting Event | One-to-One | 1:1 | Journal posting |

### 6. Indexes
- UNIQUE (`claim_number`)
- INDEX (`employee_id`, `status`)
- INDEX (`reimbursement_type`, `claim_period_year`, `claim_period_month`)
- INDEX (`payroll_master_id`, `payroll_posted`)
- INDEX (`approval_status`, `current_approver_id`)

### 7. Security Classification
**Confidential** — financial claim data.

### 8. Integration Points
- **Compensation Rules Engine** (Q161): Tax-exemption computation
- **Payroll Engine** (Entity 454): Payout as earning component
- **Workflow Engine**: Approval routing
- **Accounting Event Engine** (Part 11): Journal posting
- **ESS Portal**: Claim submission UI
- **Vendor Integration** (Part 5): Travel agency API

### 9. Sample Data
```json
{
  "claim_number": "RE-2026-00123", "employee_id": "wf-001",
  "reimbursement_type": "FUEL", "claim_period_month": 6, "claim_period_year": 2026,
  "expense_date": "2026-06-15", "expense_amount": 6500.0000,
  "policy_cap_amount": 8000.0000, "approved_amount": 6500.0000,
  "tax_exemption_amount": 6500.0000, "taxable_amount": 0,
  "tax_section": "10(14)", "bills_count": 4, "bills_total_amount": 6500.0000,
  "purpose": "Office commute for client meeting at Mumbai HQ",
  "approval_status": "PENDING", "status": "SUBMITTED"
}
```

### 10. Audit Events
`REIMBURSEMENT_DRAFTED`, `REIMBURSEMENT_SUBMITTED`, `REIMBURSEMENT_APPROVED`, `REIMBURSEMENT_REJECTED`, `REIMBURSEMENT_PARTIALLY_APPROVED`, `REIMBURSEMENT_PAID`, `REIMBURSEMENT_CANCELLED`

---

## Entity 458 — Statutory Compliance

### 1. Business Purpose
Per Part 12 §8: Supports PF, ESIC, Professional Tax, Labour Welfare Fund, TDS, Gratuity, Bonus. Statutory deductions & employer contributions management with regulatory filings.

### 2. Architectural Role
Configuration + transaction entity — defines statutory rates/rules (master) and per-employee deductions (transactions). Generates challans and e-filing files.

### 3. Business Rules
- **PF**: 12% employee + 12% employer (of Basic+DA+Retaining allowance); EDLI + admin charges on employer
- **ESIC**: 0.75% employee + 3.25% employer (of Gross, if gross ≤ ₹21,000/month)
- **Professional Tax**: state-specific slab; ₹200/month typical (Maharashtra, Karnataka)
- **LWF**: state-specific; ₹12 employee + ₹36 employer (Maharashtra, ₹3000+ wage)
- **TDS**: per IT Act slabs; Form 16, Form 24Q quarterly filing
- **Gratuity**: 15 days wages per year of service (max ₹20 lakh) — payable on exit
- **Bonus**: 8.33% minimum (Bonus Act, ₹8400 min, ₹21000 wage cap)
- Statutory due dates: PF (15th), ESIC (15th), PT (20th), TDS (7th)
- Late filing penalties auto-computed

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `compliance_code` | VARCHAR(30) | Yes | — | Unique per company × period | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `compliance_type` | ENUM | Yes | — | PF, ESIC, PROFESSIONAL_TAX, LWF, TDS, GRATUITY, BONUS | Compliance type (per Part 12) | Internal |
| `compliance_subtype` | VARCHAR(50) | No | NULL | — | Sub-type (e.g., PF_EE, PF_ER, PF_EDLI, PF_ADMIN) | Internal |
| `payroll_master_id` | UUID | Yes | — | FK to `payroll_master` (Entity 451) | Source payroll | Internal |
| `period_month` | INTEGER | Yes | — | 1-12 | Compliance month | Internal |
| `period_year` | INTEGER | Yes | — | 1900-9999 | Compliance year | Internal |
| `state_code` | VARCHAR(10) | No | NULL | ISO state | State (for PT, LWF state-specific) | Internal |
| `applicable_employees_count` | INTEGER | Yes | `0` | ≥ 0 | Employees in scope | Internal |
| `employee_contribution_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Employee share | Confidential |
| `employer_contribution_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Employer share | Confidential |
| `admin_charges_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Admin/EDLI charges (PF) | Confidential |
| `total_payable_amount` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total payable | Confidential |
| `penalty_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Late filing penalty | Confidential |
| `interest_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Late payment interest | Confidential |
| `total_amount_payable` | DECIMAL(18,4) | Yes | — | ≥ 0 | Payable + penalty + interest | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `statutory_due_date` | DATE | Yes | — | — | Statutory due date | Internal |
| `filing_date` | DATE | No | NULL | — | Actual filing date | Internal |
| `challan_number` | VARCHAR(50) | No | NULL | — | Challan / receipt number | Confidential |
| `challan_attachment_id` | UUID | No | NULL | FK to `attachments` | Filed challan document | Confidential |
| `efiling_reference` | VARCHAR(100) | No | NULL | — | Govt portal reference | Confidential |
| `filing_status` | ENUM | Yes | `PENDING` | PENDING, FILED, REJECTED, AMENDED | Filing status | Internal |
| `payment_status` | ENUM | Yes | `PENDING` | PENDING, PAID, PARTIALLY_PAID, OVERDUE | Payment status | Internal |
| `payment_date` | DATE | No | NULL | — | Payment date | Internal |
| `payment_reference` | VARCHAR(100) | No | NULL | — | Bank payment reference | Confidential |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Liability posting | Confidential |
| `vendor_id` | UUID | No | NULL | FK to `vendors` | Compliance consultant | Internal |
| `notes` | TEXT | No | NULL | — | Internal notes | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, CALCULATED, READY_FOR_FILING, FILED, PAID, AMENDED, OVERDUE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Payroll Master (451) | Many-to-One | N:1 | Source payroll |
| Vendor (Part 5) | Many-to-One | N:1 | Consultant |
| Accounting Event | One-to-One | 1:1 | Liability posting |
| Statutory Portal | External | — | Govt e-filing API |

### 6. Indexes
- UNIQUE (`compliance_code`)
- INDEX (`company_id`, `compliance_type`, `period_year`, `period_month`)
- INDEX (`filing_status`, `payment_status`)
- INDEX (`statutory_due_date`, `status`)

### 7. Security Classification
**Confidential** — financial & regulatory data; challan numbers are **Restricted**.

### 8. Integration Points
- **Compensation Rules Engine** (Q161): Contribution calculations
- **Payroll Processing** (Entity 454): Per-employee deductions
- **Statutory Portal Integration**: PF/ESIC/TDS e-filing APIs
- **Accounting Event Engine** (Part 11): Liability & payment journals
- **Compliance Reports**: Monthly/quarterly/annual statutory reports

### 9. Sample Data
```json
{
  "compliance_code": "PF-2026-07", "company_id": "cmp-001",
  "compliance_type": "PF", "payroll_master_id": "pm-2026-07",
  "period_month": 7, "period_year": 2026,
  "applicable_employees_count": 250,
  "employee_contribution_total": 360000.0000, "employer_contribution_total": 360000.0000,
  "admin_charges_total": 15000.0000, "total_payable_amount": 735000.0000,
  "total_amount_payable": 735000.0000, "statutory_due_date": "2026-08-15",
  "filing_status": "PENDING", "payment_status": "PENDING", "status": "CALCULATED"
}
```

### 10. Audit Events
`STATUTORY_COMPLIANCE_CALCULATED`, `STATUTORY_COMPLIANCE_FILED`, `STATUTORY_COMPLIANCE_PAID`, `STATUTORY_COMPLIANCE_AMENDED`, `STATUTORY_COMPLIANCE_OVERDUE`, `STATUTORY_COMPLIANCE_PENALTY_LEVIED`

---

## Entity 459 — Payroll Bank Advice

### 1. Business Purpose
Per Part 12 §8: Generates Salary Transfer File, Bank Statement, Payment Confirmation. The bank payment file for net-salary disbursement.

### 2. Architectural Role
Output entity — generates bank-specific file formats (NACH, NEFT, RTGS, IMPS) for batch salary credit. Tracks payment confirmation and reconciliation.

### 3. Business Rules
- Bank file formats: NACH (universal), NEFT batch, RTGS (large amounts), IMPS (instant)
- One file per bank per payroll period (employees with same bank grouped)
- File naming convention: `SAL_<company_code>_<period>_<bank_code>_<sequence>.txt`
- Hash total: sum of all amounts in file — used for bank reconciliation
- Confirmation: bank returns success/failure per account; failures re-routed to next cycle
- Multi-currency: separate file per currency
- Confidentiality: file contains account numbers — encrypted at rest

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `advice_number` | VARCHAR(30) | Yes | — | Unique per company | Display number | Internal |
| `payroll_master_id` | UUID | Yes | — | FK to `payroll_master` (Entity 451) | Source payroll | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `company_bank_account_id` | UUID | Yes | — | FK to `bank_accounts` | Source account | Confidential |
| `target_bank_code` | VARCHAR(20) | Yes | — | IFSC first 4 chars / bank code | Target bank | Confidential |
| `file_format` | ENUM | Yes | — | NACH, NEFT_BATCH, RTGS, IMPS, MANUAL_CHEQUE | File format | Internal |
| `file_name` | VARCHAR(200) | Yes | — | — | Generated file name | Internal |
| `file_path` | VARCHAR(500) | No | NULL | — | Secure file storage path | Restricted |
| `file_hash` | VARCHAR(64) | Yes | — | SHA-256 | File integrity hash | Internal |
| `total_records` | INTEGER | Yes | — | > 0 | Number of employees | Internal |
| `total_amount` | DECIMAL(18,4) | Yes | — | > 0 | Total amount | Confidential |
| `hash_total` | VARCHAR(40) | Yes | — | — | Sum as string (for bank recon) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `value_date` | DATE | Yes | — | — | Value date | Internal |
| `generation_date` | TIMESTAMPTZ | Yes | `now()` | — | File generation timestamp | Internal |
| `generated_by` | UUID | Yes | — | FK to `workforce_master` | Generator | Confidential |
| `transmission_method` | ENUM | Yes | `SFTP` | SFTP, API, EMAIL_SECURE, PORTAL_UPLOAD | Bank submission | Internal |
| `transmitted_at` | TIMESTAMPTZ | No | NULL | — | Transmission timestamp | Internal |
| `transmission_reference` | VARCHAR(100) | No | NULL | — | Bank reference | Confidential |
| `confirmation_received` | BOOLEAN | Yes | `false` | — | Confirmation (per Part 12: "Payment Confirmation") | Internal |
| `confirmation_date` | TIMESTAMPTZ | No | NULL | — | Confirmation timestamp | Internal |
| `confirmed_records` | INTEGER | Yes | `0` | ≥ 0 | Successful credits | Internal |
| `failed_records` | INTEGER | Yes | `0` | ≥ 0 | Failed credits | Internal |
| `failed_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Failed amount | Confidential |
| `failure_details` | JSONB | No | NULL | — | Per-employee failure reasons | Confidential |
| `accounting_event_id` | UUID | No | NULL | FK to `accounting_events` | Bank debit posting | Confidential |
| `reconciled` | BOOLEAN | Yes | `false` | — | Bank reconciliation done | Internal |
| `reconciled_at` | TIMESTAMPTZ | No | NULL | — | Recon timestamp | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, GENERATED, TRANSMITTED, CONFIRMED, PARTIALLY_CONFIRMED, FAILED, REVERSED, RECONCILED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Payroll Master (451) | Many-to-One | N:1 | Source payroll |
| Company Bank Account | Many-to-One | N:1 | Source account |
| Payroll Processing (454) | One-to-Many | 1:N | Per-employee credits |
| Accounting Event | One-to-One | 1:1 | Bank debit posting |
| Bank Integration | External | — | SFTP/API |

### 6. Indexes
- UNIQUE (`advice_number`)
- INDEX (`payroll_master_id`, `status`)
- INDEX (`target_bank_code`, `value_date`)
- INDEX (`status`, `confirmation_received`)

### 7. Security Classification
**Confidential** — bank account data; file path is **Restricted**.

### 8. Integration Points
- **Banking Integration**: SFTP/API to bank
- **Accounting Event Engine** (Part 11): Bank debit posting
- **Bank Reconciliation** (Part 11): Auto-match with bank statement
- **Payroll Processing** (Entity 454): Per-employee credit confirmation
- **Notification Service**: Notify Finance team on confirmation

### 9. Sample Data
```json
{
  "advice_number": "BA-2026-07-001", "payroll_master_id": "pm-2026-07",
  "company_id": "cmp-001", "company_bank_account_id": "ba-001",
  "target_bank_code": "HDFC", "file_format": "NACH",
  "file_name": "SAL_CMP001_202607_HDFC_001.txt",
  "total_records": 180, "total_amount": 6800000.0000,
  "hash_total": "000000680000000", "currency_code": "INR",
  "value_date": "2026-08-05", "transmission_method": "SFTP",
  "transmitted_at": "2026-08-04T16:00:00Z", "confirmed_records": 178,
  "failed_records": 2, "failed_amount": 85000.0000,
  "status": "PARTIALLY_CONFIRMED"
}
```

### 10. Audit Events
`BANK_ADVICE_GENERATED`, `BANK_ADVICE_TRANSMITTED`, `BANK_ADVICE_CONFIRMED`, `BANK_ADVICE_PARTIALLY_CONFIRMED`, `BANK_ADVICE_FAILED`, `BANK_ADVICE_REVERSED`, `BANK_ADVICE_RECONCILED`

---

## Entity 460 — Payroll Dashboard

### 1. Business Purpose
Per Part 12 §8: Displays Payroll Cost, Net Salary, Statutory Dues, Pending Payroll, Loans, Benefits, Overtime. Reports: Payroll Register, Payslips, PF Report, ESIC Report, PT Report, TDS Report, Loan Register, Reimbursement Report, Salary Cost. AI: Payroll Cost Forecast, Salary Benchmark, Fraud Detection, Overtime Optimization, Compensation Recommendation.

### 2. Architectural Role
Aggregated view entity — powers HR Mission Control, Finance dashboards, and executive compensation analytics. AI insights refreshed daily.

### 3. Business Rules
- Snapshot-based: refreshed after each payroll run + daily incremental
- Multi-grain: per-employee, per-department, per-facility, per-company
- Cost analytics: gross salary + employer contributions + benefits cost = total workforce cost
- AI insights: cost forecast (next quarter), fraud detection (anomalous payouts), OT optimization (over-OT detection), benchmark (industry comparison), compensation recommendation (raise suggestions)
- Mobile-friendly: payslip view, tax declaration, loan request, expense claim, salary history

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `snapshot_type` | ENUM | Yes | — | EMPLOYEE, DEPARTMENT, FACILITY, COMPANY | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity reference | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `payroll_period_id` | UUID | No | NULL | FK to `payroll_master` (Entity 451) | Period | Internal |
| `payroll_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Payroll Cost (per Part 12) | Confidential |
| `payroll_cost_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Year-to-date cost | Confidential |
| `net_salary_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Net Salary (per Part 12) | Confidential |
| `gross_salary_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Gross total | Confidential |
| `statutory_dues_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Statutory Dues (per Part 12) | Confidential |
| `pending_payroll_count` | INTEGER | Yes | `0` | ≥ 0 | Pending Payroll (per Part 12) | Internal |
| `pending_payroll_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Pending amount | Confidential |
| `loans_outstanding_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Loans (per Part 12) | Confidential |
| `benefits_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Benefits cost (per Part 12) | Confidential |
| `overtime_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Overtime cost (per Part 12) | Confidential |
| `overtime_hours_total` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | OT hours | Internal |
| `employee_count` | INTEGER | Yes | `0` | ≥ 0 | Headcount | Internal |
| `avg_cost_per_employee` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Average cost | Confidential |
| `cost_breakup_by_component` | JSONB | Yes | `'{}'` | — | Per-component cost | Confidential |
| `cost_breakup_by_department` | JSONB | Yes | `'{}'` | — | Per-department cost | Confidential |
| `reports_available` | JSONB | Yes | `'[]'` | — | Payroll Register, Payslips, PF/ESIC/PT/TDS Reports, Loan Register, Reimbursement Report, Salary Cost | Internal |
| `payroll_cost_forecast` | JSONB | No | NULL | — | AI: next-quarter forecast (per Part 12 AI) | Confidential |
| `salary_benchmark` | JSONB | No | NULL | — | AI: industry benchmark (per Part 12 AI) | Confidential |
| `fraud_detection` | JSONB | No | NULL | — | AI: payout anomalies (per Part 12 AI) | Restricted |
| `overtime_optimization` | JSONB | No | NULL | — | AI: OT reduction recommendations (per Part 12 AI) | Confidential |
| `compensation_recommendation` | JSONB | No | NULL | — | AI: raise/bonus suggestions (per Part 12 AI) | Restricted |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh timestamp | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model version | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Payroll Master (451) | Many-to-One | N:1 | Period |
| Workforce Master (381) | Many-to-One | N:1 | Employee (for EMPLOYEE grain) |

### 6. Indexes
- UNIQUE (`snapshot_date`, `snapshot_type`, `entity_id`)
- INDEX (`company_id`, `snapshot_date`)
- INDEX (`ai_insights_generated_at`)

### 7. Security Classification
**Confidential** — financial compensation data; fraud detection and compensation recommendations are **Restricted**.

### 8. Integration Points
- **BI Service**: Powers payroll dashboards
- **AI/ML Service**: Cost forecast, benchmark, fraud detection
- **HR Mission Control** (Sec 13): Operational dashboard
- **Finance Cube** (Part 11): Cost analytics
- **Mobile App**: Payslip, tax, loan, expense, salary history
- **Executive Dashboard**: C-suite compensation view

### 9. Sample Data
```json
{
  "snapshot_date": "2026-07-31", "snapshot_type": "COMPANY",
  "entity_id": "cmp-001", "company_id": "cmp-001",
  "payroll_period_id": "pm-2026-07",
  "payroll_cost_total": 14200000.0000, "payroll_cost_ytd": 95000000.0000,
  "net_salary_total": 9500000.0000, "gross_salary_total": 12500000.0000,
  "statutory_dues_total": 1850000.0000, "pending_payroll_count": 0,
  "loans_outstanding_total": 2500000.0000, "benefits_cost_total": 800000.0000,
  "overtime_cost_total": 250000.0000, "overtime_hours_total": 1250.00,
  "employee_count": 250, "avg_cost_per_employee": 56800.0000,
  "ai_insights_generated_at": "2026-08-01T02:00:00Z",
  "ai_model_version": "v4.2.0", "status": "COMPLETED"
}
```

### 10. Audit Events
`PAYROLL_DASHBOARD_SNAPSHOT_CREATED`, `PAYROLL_DASHBOARD_AI_REFRESHED`, `PAYROLL_DASHBOARD_STALE_DETECTED`, `PAYROLL_DASHBOARD_FRAUD_ALERT`

---

# Part 12 Sections 7-8 Completion Summary

**All 20 Leave Management & Payroll entities are now defined** at full enterprise-grade depth.

## Architectural Decisions Locked

1. **Enterprise Leave Engine** — Full leave lifecycle: type → policy → balance → request → approval → consumption
2. **Holiday Calendar** — Multi-jurisdiction (national/state/factory/regional/weekly off/restricted)
3. **Sandwich Rule** — Configurable per policy; computation at request time
4. **Compensatory Off** — Auto-earned from holiday attendance; expiry-driven
5. **Leave Encashment** — Formula-driven via Compensation Rules Engine; tax-integrated
6. **Leave Audit** — Append-only hash-chained ledger; 7-year retention
7. **AI Leave Insights** — Pattern analysis, absenteeism prediction, abuse detection, availability forecast
8. **Enterprise Payroll Engine** — Multi-company, multi-state, multi-currency
9. **Compensation Rules Engine (Q161)** — **NEW Foundation Service #21**: Externalizes all salary/OT/allowance/deduction/loan-recovery/encashment logic into formula-driven rules
10. **Salary Structure** — CTC decomposition (Basic+HRA+DA+Special+Bonus+Variable+Employer PF+Gratuity)
11. **Payroll Component** — Atomic unit: Earning/Deduction/Employer Contribution/Reimbursement
12. **Payroll Processing** — Per-employee computation; all logic delegated to Compensation Rules Engine
13. **Benefits Management** — Insurance/welfare/perquisite/reimbursement with vendor integration
14. **Employee Loans** — EMI-driven; payroll recovery; pre-closure; exit recovery
15. **Reimbursement** — Multi-type claims with tax-exemption auto-computation
16. **Statutory Compliance** — PF/ESIC/PT/LWF/TDS/Gratuity/Bonus with e-filing integration
17. **Payroll Bank Advice** — NACH/NEFT/RTGS/IMPS file generation with bank reconciliation
18. **AI Payroll Insights** — Cost forecast, benchmark, fraud detection, OT optimization, compensation recommendation
19. **Mobile Payroll** — Payslip, tax declaration, loan request, expense claim, salary history
20. **Finance Integration** — Accounting Event Engine integration for all payroll postings

## Cross-Module Integration

### Inputs to Leave & Payroll
| Source Module | Data Flow |
|---|---|
| Attendance (Sec 6, E437) | Present days, OT hours, holiday work → Payroll |
| Onboarding (Sec 5) | Joining date → Salary structure activation |
| Recruitment (Sec 4) | Hire → Payroll onboarding |
| Workforce Master (Sec 1) | Employee profile, grade, department |

### Outputs from Leave & Payroll
| Target Module | Data Flow |
|---|---|
| Finance (Part 11) | Salary expense, statutory liabilities, bank advice |
| Accounting Event Engine | Journal postings for all transactions |
| Finance Cube (Part 11) | Cost analytics for BI dashboards |
| Statutory Portals | PF/ESIC/TDS e-filing |
| Banking APIs | Salary disbursement files |
| ESS/MSS Portals (Sec 11-12) | Payslip, leave balance, tax declaration |
| HR Analytics (Sec 13) | Payroll KPIs for HR Mission Control |

## New Platform Service Locked

### Compensation Rules Engine — Foundation Service #21

| Attribute | Value |
|---|---|
| Service ID | FS-21 |
| Architectural Decision | Q161 |
| Status | LOCKED |
| Owner | Enterprise Architect |
| Consumers | Payroll (E454), Leave (E444/E448), Reimbursement (E457), Loans (E456), Statutory (E458) |
| Capabilities | Salary formulas, OT rules, shift allowances, incentives, commissions, bonuses, statutory deductions, loan recovery, country/state rules, encashment rules |
| Design Principle | Configuration-driven; no application code change for new company/state/country |
| Governance | All rule changes require HR Head + Finance Head + Enterprise Architect approval |

## Part 12 Progress Tracker

| Batch | Sections | Entities | Status |
|---|---|---|---|
| Batch 1 | 1-3 (Foundation, Org Lifecycle) | 381-410 | ✅ COMPLETE |
| Batch 2 | 4-6 (Recruitment, Onboarding, Attendance) | 411-440 | ✅ COMPLETE |
| **Batch 3** | **7-8 (Leave, Payroll)** | **441-460** | **✅ COMPLETE (LOCKED)** |
| Batch 4 (Final) | 9-13 (Performance, LMS, ESS, MSS, HR Analytics) | 461-510+ | ⏳ PENDING |

## Part 12 Cumulative Entity Count

- **Batch 1**: 30 entities (381-410)
- **Batch 2**: 30 entities (411-440)
- **Batch 3**: 20 entities (441-460)
- **Cumulative**: 80 entities defined
- **Estimated Part 12 total**: ~130 entities (5 sections × ~10 entities + supporting entities)
- **Progress**: ~62% of Part 12 complete

## Foundation Service Count

- **Previous Foundation Services**: 20 (Vol 0 Ch 9)
- **Added in Part 12 Batch 2**: Enterprise Workforce Scheduling Engine (FS-20)
- **Added in Part 12 Batch 3**: Compensation Rules Engine (FS-21)
- **Current Total**: 21 Foundation Services

---

*End of Manual 1 Part 12 Sections 7-8. Next batch: Sections 9-13 (Performance, LMS, ESS, MSS, HR Analytics) — final HR batch.*

# Manual 1 · Part 12 · Sections 11-13 · Entities 481-510 — ESS, MSS & HR Mission Control

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 12 — Enterprise Workforce Management (EWM) |
| Sections | 11 (Employee Self-Service), 12 (Manager Self-Service), 13 (HR Analytics, AI HR Copilot & HR Mission Control) |
| Entities | 481–510 |
| Version | 1.0.0 |
| Status | ACTIVE — LOCKED |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 9 §9.7, Part 12 §11-13 |
| Last Updated | 2026-07-07 |

---

## Overview — Employee Experience & Executive Intelligence

Sections 11-13 close the EWM module by delivering the **employee/manager/executive experience layer**:

```
ESS (Sec 11: 481-490) — Employee self-service portal + 9 features
  ↓ Escalates to
MSS (Sec 12: 491-500) — Manager approval portal + 9 features
  ↓ Aggregates to
HR ANALYTICS & MISSION CONTROL (Sec 13: 501-510) — HR KPIs, AI Copilot, Mission Control, Executive Scorecard
```

### Architectural Locks

| Service | ID | Description |
|---|---|---|
| **ESS Platform** | FS-24 | Employee Self-Service platform: mobile-first, offline-capable |
| **MSS Platform** | FS-25 | Manager Self-Service platform: approval workflows + team analytics |
| **Enterprise Workforce Intelligence** | FS-26 | Unified HR analytics + AI Copilot + Mission Control |
| **AI HR Copilot** | FS-27 | Natural-language HR query interface |

### Architecture Principles

- **Task-Driven UX** (per Volume 0): users act via inbox tasks, not menu navigation
- **Mobile-First**: ESS/MSS designed mobile-first; desktop is responsive
- **Offline-Capable**: ESS/MSS support offline request submission with auto-sync
- **Single Identity**: One Workforce ID across ESS/MSS/Operations (per Volume 0 Ch 5)
- **AI-Native**: AI Copilot is first-class UX element, not add-on

---

# SECTION 11: Employee Self Service (ESS) (Entities 481-490)

## Entity 481 — Employee Portal

### 1. Business Purpose
Per Part 12 §11: The unified entry-point for all employee-facing workforce services. Single sign-on, personalized dashboard, task inbox, and access to all ESS features.

### 2. Architectural Role
Frontend application entity — represents the ESS web + mobile application. Configuration-driven per company/role. Acts as shell hosting all ESS feature modules (482-490).

### 3. Business Rules
- Single Sign-On (SSO) via enterprise identity provider (per Volume 0 Ch 5)
- Personalized home page: tasks, approvals, news, alerts
- Role-based feature visibility: worker sees attendance + payslip; manager sees MSS features
- Multi-language: based on employee locale preference
- Accessibility: WCAG 2.1 AA compliant
- Branding: per-company white-label

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `portal_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `portal_name` | VARCHAR(100) | Yes | — | Min 5 | Display name | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `portal_type` | ENUM | Yes | `ESS` | ESS, MSS, HR_ADMIN, EXECUTIVE | Portal type | Internal |
| `default_language` | VARCHAR(10) | Yes | `en` | ISO code | Default language | Internal |
| `supported_languages` | TEXT[] | Yes | `ARRAY['en']::TEXT[]` | ISO codes | Supported languages | Internal |
| `branding_config` | JSONB | Yes | `'{}'` | — | Logo, colors, theme | Internal |
| `home_page_widgets` | JSONB | Yes | `'[]'` | — | Default widget config | Internal |
| `navigation_menu_config` | JSONB | Yes | `'[]'` | — | Menu structure | Internal |
| `role_based_features` | JSONB | Yes | `'{}'` | — | Feature flags per role | Internal |
| `mobile_app_config` | JSONB | Yes | `'{}'` | — | Mobile app config | Internal |
| `offline_config` | JSONB | Yes | `'{}'` | — | Offline capability config | Internal |
| `sso_provider` | VARCHAR(50) | Yes | — | — | SSO provider | Confidential |
| `sso_config` | JSONB | No | NULL | — | SSO configuration | Confidential |
| `session_timeout_minutes` | INTEGER | Yes | `30` | > 0 | Session timeout | Internal |
| `max_concurrent_sessions` | INTEGER | Yes | `3` | > 0 | Max sessions | Internal |
| `audit_log_level` | ENUM | Yes | `STANDARD` | MINIMAL, STANDARD, DETAILED | Audit logging | Internal |
| `accessibility_compliance` | ENUM | Yes | `WCAG_2_1_AA` | WCAG_2_0_A, WCAG_2_1_AA, WCAG_2_1_AAA | Accessibility | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Portal version | Internal |
| `release_date` | DATE | Yes | — | — | Release date | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, MAINTENANCE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| ESS features (482-490) | One-to-Many | 1:N | Hosted features |
| Workforce Master (381) | Many-to-Many | N:N | Via role-based access |

### 6. Indexes
- UNIQUE (`portal_code`)
- INDEX (`company_id`, `portal_type`, `status`)

### 7. Security Classification
**Internal** — SSO config is **Confidential**.

### 8. Integration Points
- **Authentication Service** (Foundation Service): SSO
- **RBAC Engine** (Foundation Service): Role-based access
- **Notification Service**: Push notifications, alerts
- **Task Control Room** (Foundation Service): Task inbox
- **Mobile App**: iOS/Android wrapper
- **All ESS feature modules** (482-490)

### 9. Sample Data
```json
{
  "portal_code": "ESS-CMP001", "portal_name": "SUOP Employee Portal",
  "company_id": "cmp-001", "portal_type": "ESS",
  "default_language": "en", "supported_languages": ["en", "hi", "mr", "ta"],
  "sso_provider": "azure-ad", "session_timeout_minutes": 30,
  "accessibility_compliance": "WCAG_2_1_AA", "version": "1.0",
  "release_date": "2026-01-01", "status": "ACTIVE"
}
```

### 10. Audit Events
`PORTAL_DEPLOYED`, `PORTAL_UPDATED`, `PORTAL_MAINTENANCE_STARTED`, `PORTAL_MAINTENANCE_ENDED`, `PORTAL_BRANDING_CHANGED`

---

## Entity 482 — Payslip (ESS View)

### 1. Business Purpose
Per Part 12 §11: Employee-facing payslip view with detailed breakdown, downloadable PDF, and historical access.

### 2. Architectural Role
Read-only presentation entity — derives from Payroll Processing (454). Mobile-friendly with secure PDF generation.

### 3. Business Rules
- Available 24 hours before pay date (preview); locked after pay date
- Multi-language: payslip in employee's preferred language
- PDF password-protected (employee DOB or last 4 of PAN)
- History: 7+ years accessible
- Comparative view: side-by-side comparison with previous months
- Tax view: YTD tax, deductions, projected annual tax

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `payslip_view_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Restricted |
| `payroll_processing_id` | UUID | Yes | — | FK to `payroll_processing` (Entity 454) | Source payroll | Internal |
| `payroll_master_id` | UUID | Yes | — | FK to `payroll_master` (Entity 451) | Period | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `period_name` | VARCHAR(50) | Yes | — | — | Display period (e.g., "July 2026") | Internal |
| `period_start_date` | DATE | Yes | — | — | Period start | Internal |
| `period_end_date` | DATE | Yes | — | — | Period end | Internal |
| `pay_date` | DATE | Yes | — | — | Pay date | Internal |
| `language` | VARCHAR(10) | Yes | `en` | ISO code | Payslip language | Internal |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `earnings_breakdown` | JSONB | Yes | `'[]'` | — | Per-component earnings | Restricted |
| `deductions_breakdown` | JSONB | Yes | `'[]'` | — | Per-component deductions | Restricted |
| `employer_contributions` | JSONB | Yes | `'[]'` | — | Employer PF/ESIC/Gratuity | Restricted |
| `gross_earnings` | DECIMAL(18,4) | Yes | — | ≥ 0 | Gross | Restricted |
| `total_deductions` | DECIMAL(18,4) | Yes | — | ≥ 0 | Deductions | Restricted |
| `net_pay` | DECIMAL(18,4) | Yes | — | ≥ 0 | Net pay | Restricted |
| `ytd_earnings` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Year-to-date earnings | Restricted |
| `ytd_deductions` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | YTD deductions | Restricted |
| `ytd_tax` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | YTD tax | Restricted |
| `leave_details` | JSONB | Yes | `'{}'` | — | Leave balance snapshot | Confidential |
| `attendance_summary` | JSONB | Yes | `'{}'` | — | Attendance summary | Internal |
| `bank_account_masked` | VARCHAR(20) | Yes | — | — | Masked account (e.g., `XXXX1234`) | Confidential |
| `pdf_document_id` | UUID | No | NULL | FK to `documents` | Generated PDF | Restricted |
| `pdf_password_protected` | BOOLEAN | Yes | `true` | — | PDF secured | Internal |
| `viewed_by_employee` | BOOLEAN | Yes | `false` | — | Viewed flag | Internal |
| `first_viewed_at` | TIMESTAMPTZ | No | NULL | — | First view timestamp | Internal |
| `downloaded_count` | INTEGER | Yes | `0` | ≥ 0 | Download count | Internal |
| `status` | ENUM | Yes | `GENERATED` | DRAFT, GENERATED, PUBLISHED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Payroll Processing (454) | Many-to-One | N:1 | Source |
| Payroll Master (451) | Many-to-One | N:1 | Period |

### 6. Indexes
- UNIQUE (`payslip_view_code`)
- INDEX (`employee_id`, `period_end_date`)
- INDEX (`payroll_master_id`, `status`)

### 7. Security Classification
**Restricted** — salary data.

### 8. Integration Points
- **Payroll Engine** (454): Source data
- **Document Generator**: PDF creation
- **Notification Service**: Payslip available notification
- **ESS Portal**: Employee access
- **Mobile App**: Mobile-optimized view

### 9. Sample Data
```json
{
  "payslip_view_code": "PS-2026-07-wf001", "employee_id": "wf-001",
  "payroll_master_id": "pm-2026-07", "period_name": "July 2026",
  "period_start_date": "2026-07-01", "period_end_date": "2026-07-31",
  "pay_date": "2026-08-05", "language": "en",
  "gross_earnings": 100000.0000, "total_deductions": 17000.0000, "net_pay": 83000.0000,
  "ytd_earnings": 700000.0000, "ytd_deductions": 119000.0000, "ytd_tax": 58000.0000,
  "bank_account_masked": "XXXX4521", "pdf_password_protected": true,
  "status": "PUBLISHED"
}
```

### 10. Audit Events
`PAYSLIP_GENERATED`, `PAYSLIP_PUBLISHED`, `PAYSLIP_VIEWED`, `PAYSLIP_DOWNLOADED`, `PAYSLIP_ARCHIVED`

---

## Entity 483 — Leave Request (ESS View)

### 1. Business Purpose
Per Part 12 §11: Employee-facing leave request submission, balance view, and request history.

### 2. Architectural Role
ESS-specific view over Leave Request (Entity 444). Provides simplified submission flow, calendar view, and team-leave visibility.

### 3. Business Rules
- Pre-submission validation: balance check, policy compliance, sandwich rule preview
- Calendar view: shows own leave + team leave (if manager approves visibility)
- Quick-submit: one-click for frequent leave types (e.g., 1-day casual leave)
- Withdrawal: allowed if not yet approved by all approvers
- Cancellation: allowed if approved but not yet started (requires manager approval)
- Amendment: date change requires fresh approval

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ess_view_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `leave_request_id` | UUID | Yes | — | FK to `leave_requests` (Entity 444) | Source request | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `balance_snapshot` | JSONB | Yes | `'{}'` | — | Pre-submission balance snapshot | Confidential |
| `team_leave_calendar` | JSONB | No | `'[]'` | — | Team leave visibility (if permitted) | Confidential |
| `sandwich_rule_preview` | JSONB | Yes | `'{}'` | — | Sandwich impact preview | Internal |
| `workflow_status_view` | JSONB | Yes | `'[]'` | — | Approval chain visibility | Internal |
| `can_withdraw` | BOOLEAN | Yes | `false` | — | Withdrawal allowed | Internal |
| `can_cancel` | BOOLEAN | Yes | `false` | — | Cancellation allowed | Internal |
| `can_amend` | BOOLEAN | Yes | `false` | — | Amendment allowed | Internal |
| `quick_submit_template_id` | UUID | No | NULL | FK to `quick_submit_templates` | Quick-submit template | Internal |
| `submission_channel` | ENUM | Yes | `WEB` | WEB, MOBILE_APP, TABLET, OFFLINE, API | Channel | Internal |
| `offline_submission_id` | UUID | No | NULL | — | Offline submission reference | Internal |
| `synced_at` | TIMESTAMPTZ | No | NULL | — | Sync timestamp (offline) | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SUBMITTED, IN_APPROVAL, APPROVED, REJECTED, WITHDRAWN, CANCELLED, CONSUMED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Leave Request (444) | One-to-One | 1:1 | Source |

### 6. Indexes
- UNIQUE (`ess_view_code`)
- INDEX (`employee_id`, `status`)
- INDEX (`submission_channel`, `synced_at`)

### 7. Security Classification
**Confidential**.

### 8. Integration Points
- **Leave Engine** (Entity 444): Source
- **Notification Service**: Approval status updates
- **Calendar Service**: ESS calendar view
- **Offline Sync Service**: Offline submission handling

### 9. Sample Data
```json
{
  "ess_view_code": "ESS-LR-2026-00042", "employee_id": "wf-001",
  "leave_request_id": "lr-001",
  "balance_snapshot": { "EL": { "available": 15.5, "after_request": 11.5 } },
  "sandwich_rule_preview": { "applied": false, "additional_days": 0 },
  "can_withdraw": true, "submission_channel": "MOBILE_APP",
  "status": "SUBMITTED"
}
```

### 10. Audit Events
`ESS_LEAVE_DRAFTED`, `ESS_LEAVE_SUBMITTED`, `ESS_LEAVE_WITHDRAWN`, `ESS_LEAVE_CANCELLED`, `ESS_LEAVE_OFFLINE_SYNCED`

---

## Entity 484 — Attendance View (ESS)

### 1. Business Purpose
Per Part 12 §11: Employee self-view of attendance, including clock in/out, daily status, monthly summary, and exception regularization requests.

### 2. Architectural Role
ESS view over Attendance (Entity 437). Enables employee self-service for regularization of missed punches.

### 3. Business Rules
- Daily view: clock in/out times, hours worked, OT hours, status
- Monthly summary: present/absent/leave/LOP days, attendance %
- Regularization: employee can request correction for missed punches (requires manager approval)
- Geofencing: mobile clock-in validated against facility geofence
- Biometric integration: view shows biometric verification status
- Anomaly alerts: employee notified of missed punch, late arrival, etc.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `view_code` | VARCHAR(30) | Yes | — | Unique per company × employee × period | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `view_period_type` | ENUM | Yes | `MONTHLY` | DAILY, WEEKLY, MONTHLY, CUSTOM | Period | Internal |
| `period_start_date` | DATE | Yes | — | — | Period start | Internal |
| `period_end_date` | DATE | Yes | — | > period_start_date | Period end | Internal |
| `daily_attendance` | JSONB | Yes | `'[]'` | — | Per-day attendance | Confidential |
| `summary_present_days` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Present | Internal |
| `summary_absent_days` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Absent | Internal |
| `summary_leave_days` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Leave | Internal |
| `summary_lop_days` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | LOP | Internal |
| `summary_holiday_days` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Holidays | Internal |
| `summary_weekly_off_days` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Weekly offs | Internal |
| `summary_overtime_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | OT | Internal |
| `summary_attendance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Attendance % | Internal |
| `pending_regularizations` | INTEGER | Yes | `0` | ≥ 0 | Pending regularization count | Internal |
| `regularization_requests` | UUID[] | No | `ARRAY[]::UUID[]` | — | Regularization request IDs | Internal |
| `late_arrival_count` | INTEGER | Yes | `0` | ≥ 0 | Late arrivals | Internal |
| `early_departure_count` | INTEGER | Yes | `0` | ≥ 0 | Early departures | Internal |
| `missed_punch_count` | INTEGER | Yes | `0` | ≥ 0 | Missed punches | Internal |
| `current_shift_id` | UUID | No | NULL | FK to `shift_master` | Current shift | Internal |
| `next_shift_id` | UUID | No | NULL | FK to `shift_master` | Next shift | Internal |
| `roster_for_period` | JSONB | Yes | `'[]'` | — | Roster (if applicable) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Attendance (437) | Many-to-Many | N:N | Source records |
| Shift Master (431) | Many-to-One | N:1 | Shift |

### 6. Indexes
- UNIQUE (`view_code`)
- INDEX (`employee_id`, `period_start_date`, `period_end_date`)

### 7. Security Classification
**Confidential**.

### 8. Integration Points
- **Attendance Engine** (Entity 437): Source
- **Workforce Scheduling Engine** (FS-20): Roster data
- **Notification Service**: Anomaly alerts
- **Mobile App**: Geofence clock-in
- **MSS Portal**: Manager view of team attendance

### 9. Sample Data
```json
{
  "view_code": "ESS-ATD-wf001-2026-07", "employee_id": "wf-001",
  "view_period_type": "MONTHLY",
  "period_start_date": "2026-07-01", "period_end_date": "2026-07-31",
  "summary_present_days": 22, "summary_absent_days": 0, "summary_leave_days": 2,
  "summary_lop_days": 0, "summary_holiday_days": 1, "summary_weekly_off_days": 4,
  "summary_overtime_hours": 8, "summary_attendance_pct": 95.65,
  "pending_regularizations": 1, "late_arrival_count": 2,
  "status": "COMPLETED"
}
```

### 10. Audit Events
`ESS_ATTENDANCE_VIEWED`, `ESS_REGULARIZATION_REQUESTED`, `ESS_ATTENDANCE_EXPORTED`

---

## Entity 485 — Expense Claim (ESS)

### 1. Business Purpose
Per Part 12 §11: Employee self-service expense reimbursement claim submission with bill upload, multi-currency support, and approval tracking.

### 2. Architectural Role
ESS view over Reimbursement (Entity 457). Mobile-optimized for on-the-go submission with photo upload of bills.

### 3. Business Rules
- Photo upload: camera capture of bills via mobile app
- OCR: auto-extract amount, date, vendor from bill photos
- Multi-currency: support for travel expenses in foreign currency
- Mileage: GPS-based mileage tracking for fuel reimbursement
- Per-diem: auto-calculated based on travel destination
- Draft save: incomplete claims can be saved as draft
- Resubmit: rejected claims can be edited and resubmitted

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ess_claim_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `reimbursement_id` | UUID | Yes | — | FK to `reimbursements` (Entity 457) | Source claim | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `claim_lines` | JSONB | Yes | `'[]'` | — | Per-line items | Confidential |
| `bills_uploaded_count` | INTEGER | Yes | `0` | ≥ 0 | Bill count | Internal |
| `bills_total_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Bills total | Confidential |
| `ocr_extracted_data` | JSONB | No | NULL | — | OCR-extracted bill data | Confidential |
| `multi_currency` | BOOLEAN | Yes | `false` | — | Multi-currency claim | Internal |
| `currency_breakdown` | JSONB | No | `'{}'` | — | Per-currency breakdown | Confidential |
| `mileage_km` | DECIMAL(10,2) | No | NULL | ≥ 0 | Mileage (fuel) | Internal |
| `per_diem_days` | DECIMAL(5,2) | No | NULL | ≥ 0 | Per-diem days | Internal |
| `travel_itinerary` | JSONB | No | NULL | — | Travel itinerary | Confidential |
| `submission_channel` | ENUM | Yes | `WEB` | WEB, MOBILE_APP, TABLET, OFFLINE | Channel | Internal |
| `can_edit` | BOOLEAN | Yes | `false` | — | Editable (DRAFT/REJECTED) | Internal |
| `can_withdraw` | BOOLEAN | Yes | `false` | — | Withdrawable | Internal |
| `approval_tracking` | JSONB | Yes | `'[]'` | — | Approval chain visibility | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SUBMITTED, IN_APPROVAL, APPROVED, REJECTED, PAID, WITHDRAWN | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Reimbursement (457) | One-to-One | 1:1 | Source |

### 6. Indexes
- UNIQUE (`ess_claim_code`)
- INDEX (`employee_id`, `status`)

### 7. Security Classification
**Confidential**.

### 8. Integration Points
- **Reimbursement Engine** (Entity 457): Source
- **OCR Service**: Bill data extraction
- **Document Storage**: Bill storage
- **Notification Service**: Approval status
- **Mobile App**: Camera capture

### 9. Sample Data
```json
{
  "ess_claim_code": "ESS-EXP-2026-00123", "employee_id": "wf-001",
  "reimbursement_id": "re-2026-00123",
  "claim_lines": [
    { "date": "2026-07-15", "type": "FUEL", "amount": 650.00, "description": "Office commute" },
    { "date": "2026-07-16", "type": "FOOD", "amount": 350.00, "description": "Client lunch" }
  ],
  "bills_uploaded_count": 2, "bills_total_amount": 1000.0000,
  "submission_channel": "MOBILE_APP", "status": "SUBMITTED"
}
```

### 10. Audit Events
`ESS_EXPENSE_DRAFTED`, `ESS_EXPENSE_SUBMITTED`, `ESS_EXPENSE_WITHDRAWN`, `ESS_EXPENSE_OCR_PROCESSED`

---

## Entity 486 — Loan Request (ESS)

### 1. Business Purpose
Per Part 12 §11: Employee self-service loan application with eligibility check, EMI calculator, and tracking.

### 2. Architectural Role
ESS view over Employee Loan (Entity 456). Provides eligibility pre-check and EMI calculator.

### 3. Business Rules
- Eligibility check: tenure, salary, existing loans, grade
- EMI calculator: real-time based on amount, tenure, interest rate
- Document upload: KYC, salary slips, purpose justification
- Multi-loan: max 2 concurrent loans (per company policy)
- Foreclosure view: outstanding balance + foreclosure amount
- Loan statement: per-EMI history + outstanding

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ess_loan_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `loan_id` | UUID | No | NULL | FK to `employee_loans` (Entity 456) | Source loan (NULL until approved) | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `eligibility_check_id` | UUID | No | NULL | FK to `eligibility_checks` | Pre-check | Confidential |
| `eligible_amount_max` | DECIMAL(18,4) | No | NULL | ≥ 0 | Max eligible | Confidential |
| `eligible_tenure_max_months` | INTEGER | No | NULL | ≥ 0 | Max tenure | Internal |
| `applied_amount` | DECIMAL(18,4) | Yes | — | > 0 | Applied amount | Confidential |
| `applied_tenure_months` | INTEGER | Yes | — | > 0 | Tenure | Internal |
| `interest_rate_pct` | DECIMAL(6,3) | Yes | — | 0-100 | Interest rate | Confidential |
| `emi_amount` | DECIMAL(18,4) | Yes | — | > 0 | Computed EMI | Confidential |
| `total_payable` | DECIMAL(18,4) | Yes | — | > 0 | Total payable | Confidential |
| `total_interest` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total interest | Confidential |
| `first_emi_date` | DATE | Yes | — | — | First EMI | Internal |
| `purpose` | TEXT | Yes | — | Min 20 | Loan purpose | Confidential |
| `kyc_documents` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | KYC document IDs | Confidential |
| `approval_tracking` | JSONB | Yes | `'[]'` | — | Approval chain | Internal |
| `active_loans_count` | INTEGER | Yes | `0` | ≥ 0 | Existing active loans | Internal |
| `outstanding_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Existing outstanding | Confidential |
| `foreclosure_amount` | DECIMAL(18,4) | No | NULL | — | Foreclosure (if active) | Confidential |
| `loan_statement` | JSONB | No | NULL | — | EMI history | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SUBMITTED, IN_APPROVAL, APPROVED, REJECTED, ACTIVE, CLOSED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Employee Loan (456) | One-to-One | 1:1 | Source |

### 6. Indexes
- UNIQUE (`ess_loan_code`)
- INDEX (`employee_id`, `status`)

### 7. Security Classification
**Confidential**.

### 8. Integration Points
- **Loan Engine** (Entity 456): Source
- **Compensation Rules Engine** (Q161): EMI computation
- **Document Storage**: KYC storage
- **Notification Service**: Approval updates
- **MSS Portal**: Manager approval view

### 9. Sample Data
```json
{
  "ess_loan_code": "ESS-LN-2026-00045", "employee_id": "wf-001",
  "eligible_amount_max": 200000.0000, "eligible_tenure_max_months": 36,
  "applied_amount": 200000.0000, "applied_tenure_months": 36,
  "interest_rate_pct": 8.000, "emi_amount": 6267.2800,
  "total_payable": 225622.0800, "total_interest": 25622.0800,
  "first_emi_date": "2026-05-01", "purpose": "Purchase of new vehicle for office commute",
  "active_loans_count": 0, "outstanding_total": 0,
  "status": "SUBMITTED"
}
```

### 10. Audit Events
`ESS_LOAN_ELIGIBILITY_CHECKED`, `ESS_LOAN_DRAFTED`, `ESS_LOAN_SUBMITTED`, `ESS_LOAN_WITHDRAWN`, `ESS_LOAN_FORECLOSURE_REQUESTED`

---

## Entity 487 — Profile Update (ESS)

### 1. Business Purpose
Per Part 12 §11: Employee self-service profile update with approval workflow for material changes.

### 2. Architectural Role
ESS view over Workforce Master (Entity 381). Material changes (e.g., bank account, name, marital status) require HR approval; non-material changes (e.g., contact, address) auto-update.

### 3. Business Rules
- Field classification: MATERIAL (bank, PAN, Aadhaar, name, DOB) vs NON-MATERIAL (email, phone, address, emergency contact)
- Material changes: require HR approval with document evidence
- Non-material changes: auto-update with audit trail
- Document upload: required for material changes (marriage cert, PAN card, etc.)
- Multi-language: employee can update preferred language
- Profile photo upload: with face recognition for biometric systems

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ess_profile_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `field_changes` | JSONB | Yes | `'[]'` | — | Per-field changes (before/after) | Confidential |
| `change_classification` | ENUM | Yes | — | MATERIAL, NON_MATERIAL | Classification | Internal |
| `supporting_documents` | UUID[] | No | `ARRAY[]::UUID[]` | — | Document IDs | Confidential |
| `requires_approval` | BOOLEAN | Yes | `false` | — | Approval required | Internal |
| `approval_routing` | ENUM | Yes | `NONE` | NONE, HR_ONLY, HR_PLUS_MANAGER, HR_PLUS_FINANCE | Routing | Internal |
| `current_approver_id` | UUID | No | NULL | FK to `workforce_master` | Current approver | Confidential |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Internal |
| `rejection_reason` | TEXT | No | NULL | — | Rejection reason | Confidential |
| `workforce_master_updated` | BOOLEAN | Yes | `false` | — | Posted to Workforce Master | Internal |
| `audit_trail_id` | UUID | No | NULL | FK to `audit_records` | Audit reference | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SUBMITTED, IN_APPROVAL, APPROVED, REJECTED, APPLIED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Workforce Master (381) | One-to-One | 1:1 | Target update |
| Audit Records | One-to-One | 1:1 | Audit trail |

### 6. Indexes
- UNIQUE (`ess_profile_code`)
- INDEX (`employee_id`, `status`)
- INDEX (`change_classification`, `requires_approval`)

### 7. Security Classification
**Confidential** — material field changes are **Restricted**.

### 8. Integration Points
- **Workforce Master** (Entity 381): Target
- **Audit Service** (Foundation Service): Audit trail
- **Notification Service**: Approval notifications
- **Document Storage**: Supporting docs
- **HR Portal**: HR approval queue

### 9. Sample Data
```json
{
  "ess_profile_code": "ESS-PRF-2026-00067", "employee_id": "wf-001",
  "field_changes": [
    { "field": "marital_status", "before": "SINGLE", "after": "MARRIED", "classification": "MATERIAL" },
    { "field": "emergency_contact_phone", "before": "+91-9876543210", "after": "+91-9876543299", "classification": "NON_MATERIAL" }
  ],
  "change_classification": "MATERIAL",
  "supporting_documents": ["doc-marriage-cert"],
  "requires_approval": true, "approval_routing": "HR_ONLY",
  "status": "IN_APPROVAL"
}
```

### 10. Audit Events
`ESS_PROFILE_DRAFTED`, `ESS_PROFILE_SUBMITTED`, `ESS_PROFILE_APPROVED`, `ESS_PROFILE_REJECTED`, `ESS_PROFILE_APPLIED`, `ESS_PROFILE_AUTO_UPDATED`

---

## Entity 488 — Document Download (ESS)

### 1. Business Purpose
Per Part 12 §11: Employee self-service download of employment documents — payslips, Form 16, experience letter, offer letter, appraisal letters, etc.

### 2. Architectural Role
ESS view over document repository. Provides secure, audited access to employee documents.

### 3. Business Rules
- Document types: payslip, form16, form12B, offer_letter, appointment_letter, experience_letter, relieving_letter, appraisal_letter, promotion_letter, salary_certificate, bonafide_certificate
- Watermarking: every downloaded document watermarked with employee ID + timestamp
- Audit trail: every download logged (who, when, IP, device)
- Expiry: download links expire after 24 hours
- Bulk download: zip with all payslips for a year
- Verification: documents carry verification QR code

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `download_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `document_type` | ENUM | Yes | — | PAYSLIP, FORM_16, FORM_12B, OFFER_LETTER, APPOINTMENT_LETTER, EXPERIENCE_LETTER, RELIEVING_LETTER, APPRAISAL_LETTER, PROMOTION_LETTER, SALARY_CERTIFICATE, BONA_FIDE_CERTIFICATE, ID_CARD, OTHER | Type | Internal |
| `document_id` | UUID | Yes | — | FK to `documents` | Source document | Confidential |
| `document_name` | VARCHAR(200) | Yes | — | — | Display name | Internal |
| `document_period` | VARCHAR(50) | No | NULL | — | Period (e.g., "July 2026") | Internal |
| `file_format` | ENUM | Yes | `PDF` | PDF, JPG, PNG, ZIP | Format | Internal |
| `file_size_bytes` | BIGINT | Yes | — | > 0 | Size | Internal |
| `watermark_config` | JSONB | Yes | `'{}'` | — | Watermark settings | Internal |
| `verification_qr_included` | BOOLEAN | Yes | `true` | — | QR code | Internal |
| `download_token` | VARCHAR(100) | Yes | — | — | Secure token | Confidential |
| `token_expires_at` | TIMESTAMPTZ | Yes | — | — | Token expiry | Internal |
| `requested_at` | TIMESTAMPTZ | Yes | `now()` | — | Request time | Internal |
| `downloaded_at` | TIMESTAMPTZ | No | NULL | — | Download time | Internal |
| `download_channel` | ENUM | Yes | `WEB` | WEB, MOBILE_APP, EMAIL | Channel | Internal |
| `ip_address` | INET | No | NULL | — | Request IP | Confidential |
| `user_agent` | TEXT | No | NULL | — | User agent | Confidential |
| `download_count` | INTEGER | Yes | `0` | ≥ 0 | Times downloaded | Internal |
| `bulk_download_id` | UUID | No | NULL | FK to `bulk_downloads` | Bulk download reference | Internal |
| `status` | ENUM | Yes | `AVAILABLE` | AVAILABLE, DOWNLOADED, EXPIRED, REVOKED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Documents | Many-to-One | N:1 | Source |
| Bulk Download | Many-to-One | N:1 | Bulk reference |

### 6. Indexes
- UNIQUE (`download_code`)
- INDEX (`employee_id`, `document_type`, `requested_at`)
- INDEX (`download_token`, `token_expires_at`)
- INDEX (`status`, `token_expires_at`)

### 7. Security Classification
**Confidential** — employment documents.

### 8. Integration Points
- **Document Service** (Foundation Service): Document storage
- **Watermark Service**: Dynamic watermarking
- **QR Verification Service**: Document verification
- **Notification Service**: Email delivery (if EMAIL channel)
- **Audit Service**: Download audit trail

### 9. Sample Data
```json
{
  "download_code": "ESS-DOC-2026-01234", "employee_id": "wf-001",
  "document_type": "FORM_16", "document_name": "Form 16 FY 2025-26.pdf",
  "document_period": "FY 2025-26", "file_format": "PDF",
  "file_size_bytes": 458752, "watermark_config": { "text": "wf-001 | 2026-07-07" },
  "verification_qr_included": true,
  "token_expires_at": "2026-07-08T12:00:00Z",
  "download_channel": "WEB", "download_count": 0,
  "status": "AVAILABLE"
}
```

### 10. Audit Events
`ESS_DOCUMENT_REQUESTED`, `ESS_DOCUMENT_DOWNLOADED`, `ESS_DOCUMENT_EXPIRED`, `ESS_DOCUMENT_REVOKED`, `ESS_DOCUMENT_BULK_DOWNLOADED`

---

## Entity 489 — Training Portal (ESS)

### 1. Business Purpose
Per Part 12 §11: Employee-facing learning portal — browse courses, enroll, complete assignments, view certifications, take exams.

### 2. Architectural Role
ESS view over LMS Engine (FS-23) entities (Course 471, Program 472, Assignment 476, Examination 477). Mobile-friendly with offline content access.

### 3. Business Rules
- Browse: course catalog by category, difficulty, duration
- Search: full-text search across course title, description, tags
- Recommendations: AI-personalized course recommendations
- Enrollment: self-enroll in optional courses; mandatory auto-enrolled
- Progress tracking: per-course progress + resume where left off
- Offline mode: download course content for offline viewing
- Certifications: view active + expiring + expired certifications

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ess_portal_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `recommended_courses` | JSONB | Yes | `'[]'` | — | AI recommendations | Internal |
| `enrolled_courses_active` | INTEGER | Yes | `0` | ≥ 0 | Active enrollments | Internal |
| `assigned_courses_pending` | INTEGER | Yes | `0` | ≥ 0 | Pending assignments | Internal |
| `completed_courses_count` | INTEGER | Yes | `0` | ≥ 0 | Lifetime completions | Internal |
| `completion_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Completion rate | Internal |
| `total_learning_hours` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | YTD hours | Internal |
| `active_certifications_count` | INTEGER | Yes | `0` | ≥ 0 | Active certs | Internal |
| `expiring_certifications_count` | INTEGER | Yes | `0` | ≥ 0 | Expiring 90 days | Internal |
| `expired_certifications_count` | INTEGER | Yes | `0` | ≥ 0 | Expired | Internal |
| `credits_earned_ytd` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | YTD credits | Internal |
| `current_learning_paths` | JSONB | Yes | `'[]'` | — | Active learning paths | Internal |
| `upcoming_exams` | JSONB | Yes | `'[]'` | — | Scheduled exams | Internal |
| `offline_downloaded_courses` | UUID[] | No | `ARRAY[]::UUID[]` | — | Offline content | Internal |
| `last_accessed_at` | TIMESTAMPTZ | No | NULL | — | Last access | Internal |
| `access_channel` | ENUM | Yes | `WEB` | WEB, MOBILE_APP, TABLET | Last channel | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Course Master (471) | Many-to-Many | N:N | Enrollments |
| Learning Assignment (476) | One-to-Many | 1:N | Assignments |
| Learning History (479) | One-to-Many | 1:N | History |
| Certification (474) | Many-to-Many | N:N | Employee certifications |

### 6. Indexes
- UNIQUE (`ess_portal_code`)
- INDEX (`employee_id`, `status`)

### 7. Security Classification
**Confidential**.

### 8. Integration Points
- **LMS Engine** (FS-23): Course delivery
- **AI Service**: Personalized recommendations
- **Offline Sync Service**: Content download
- **Notification Service**: Exam reminders, cert expiry alerts
- **Mobile App**: Mobile-optimized learning

### 9. Sample Data
```json
{
  "ess_portal_code": "ESS-LMS-wf001", "employee_id": "wf-001",
  "enrolled_courses_active": 3, "assigned_courses_pending": 1,
  "completed_courses_count": 18, "completion_rate_pct": 78.50,
  "total_learning_hours": 24.50, "active_certifications_count": 4,
  "expiring_certifications_count": 1, "expired_certifications_count": 0,
  "credits_earned_ytd": 24.00,
  "last_accessed_at": "2026-07-06T18:30:00Z",
  "access_channel": "MOBILE_APP", "status": "ACTIVE"
}
```

### 10. Audit Events
`ESS_LMS_ACCESSED`, `ESS_LMS_COURSE_ENROLLED`, `ESS_LMS_COURSE_COMPLETED`, `ESS_LMS_OFFLINE_DOWNLOADED`, `ESS_LMS_CERTIFICATION_VIEWED`

---

## Entity 490 — ESS Dashboard

### 1. Business Purpose
Per Part 12 §11: Unified employee dashboard aggregating all ESS features. Per Part 12: Supports Mobile App, Tablet, Desktop, Offline Requests.

### 2. Architectural Role
Aggregated view entity — single-page dashboard for employee self-service. Mobile-first design.

### 3. Business Rules
- Multi-channel: Mobile App, Tablet, Desktop (responsive)
- Offline: requests saved locally, auto-synced when online
- Personalized: based on employee role, grade, department
- Real-time: attendance, leave balance, approvals status
- Notifications: in-app + push + email digest
- Quick actions: clock-in, apply leave, submit expense, view payslip

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `dashboard_code` | VARCHAR(30) | Yes | — | Unique per company × employee × date | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `channel` | ENUM | Yes | `WEB` | WEB, MOBILE_APP, TABLET | Last access channel | Internal |
| `quick_actions` | JSONB | Yes | `'[]'` | — | Personalized quick actions | Internal |
| `pending_tasks_count` | INTEGER | Yes | `0` | ≥ 0 | Inbox tasks | Internal |
| `pending_approvals_count` | INTEGER | Yes | `0` | ≥ 0 | Pending approvals (if manager) | Internal |
| `attendance_today_status` | JSONB | Yes | `'{}'` | — | Today's attendance | Internal |
| `leave_balance_summary` | JSONB | Yes | `'{}'` | — | Leave balances | Confidential |
| `pending_leave_requests` | INTEGER | Yes | `0` | ≥ 0 | Pending leaves | Internal |
| `team_on_leave_today` | JSONB | No | `'[]'` | — | Team leave visibility | Confidential |
| `upcoming_holidays` | JSONB | Yes | `'[]'` | — | Next 5 holidays | Internal |
| `payslip_latest` | JSONB | No | NULL | — | Latest payslip summary | Restricted |
| `training_assignments_pending` | INTEGER | Yes | `0` | ≥ 0 | Pending training | Internal |
| `certifications_expiring` | INTEGER | Yes | `0` | ≥ 0 | Expiring certs | Internal |
| `expense_claims_pending` | INTEGER | Yes | `0` | ≥ 0 | Pending claims | Internal |
| `loan_outstanding` | DECIMAL(18,4) | No | NULL | ≥ 0 | Loan outstanding | Confidential |
| `announcements` | JSONB | Yes | `'[]'` | — | Company announcements | Internal |
| `notifications_unread` | INTEGER | Yes | `0` | ≥ 0 | Unread notifications | Internal |
| `offline_pending_sync` | INTEGER | Yes | `0` | ≥ 0 | Offline pending count | Internal |
| `performance_rating_latest` | DECIMAL(3,1) | No | NULL | 1.0-5.0 | Latest rating | Confidential |
| `goal_progress_pct` | DECIMAL(5,2) | No | NULL | 0-100 | OKR progress | Internal |
| `ai_personalized_insights` | JSONB | No | NULL | — | AI personal insights | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| All ESS feature entities (482-489) | Aggregation | — | Source data |

### 6. Indexes
- UNIQUE (`dashboard_code`)
- INDEX (`employee_id`, `snapshot_date`)
- INDEX (`channel`)

### 7. Security Classification
**Confidential** — payslip and performance data are **Restricted**.

### 8. Integration Points
- **All ESS features** (482-489): Aggregation source
- **Notification Service**: Unread notifications
- **Task Control Room** (Foundation Service): Inbox tasks
- **Offline Sync Service**: Offline pending sync
- **Mobile App**: Mobile rendering
- **AI Service**: Personalized insights

### 9. Sample Data
```json
{
  "dashboard_code": "ESS-DASH-wf001-2026-07-07", "employee_id": "wf-001",
  "snapshot_date": "2026-07-07", "channel": "MOBILE_APP",
  "pending_tasks_count": 2, "pending_approvals_count": 5,
  "attendance_today_status": { "clock_in": "09:15", "clock_out": null, "status": "PRESENT" },
  "leave_balance_summary": { "EL": 15.5, "CL": 8, "SL": 5 },
  "pending_leave_requests": 1, "training_assignments_pending": 1,
  "certifications_expiring": 1, "expense_claims_pending": 0,
  "announcements": [{ "title": "Quarterly Town Hall", "date": "2026-07-15" }],
  "notifications_unread": 3, "offline_pending_sync": 0,
  "status": "COMPLETED"
}
```

### 10. Audit Events
`ESS_DASHBOARD_VIEWED`, `ESS_DASHBOARD_REFRESHED`, `ESS_DASHBOARD_OFFLINE_SYNCED`, `ESS_QUICK_ACTION_TRIGGERED`

---

# SECTION 12: Manager Self Service (MSS) (Entities 491-500)

## Entity 491 — Manager Dashboard

### 1. Business Purpose
Per Part 12 §12: Unified manager dashboard aggregating all MSS features — approvals, team status, analytics, KPIs.

### 2. Architectural Role
Aggregated view entity — single-page dashboard for managers. Mobile-first design with quick-approval actions.

### 3. Business Rules
- Personalized based on manager's team scope (direct reports, skip-level, matrix)
- Real-time: team attendance, pending approvals, alerts
- Quick actions: approve/reject from dashboard (with one-tap)
- Voice-approval: manager can approve via voice command (mobile)
- Delegation: manager can delegate approvals during own leave
- AI insights: team health, attrition risk, performance outliers

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `dashboard_code` | VARCHAR(30) | Yes | — | Unique per manager × date | Code | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `team_scope` | ENUM | Yes | `DIRECT_REPORTS` | DIRECT_REPORTS, SKIP_LEVEL, FULL_DEPT, MATRIX | Scope | Internal |
| `team_size` | INTEGER | Yes | `0` | ≥ 0 | Team size | Internal |
| `pending_approvals_breakdown` | JSONB | Yes | `'{}'` | — | Per-type pending count | Internal |
| `pending_approvals_total` | INTEGER | Yes | `0` | ≥ 0 | Total pending | Internal |
| `overdue_approvals_count` | INTEGER | Yes | `0` | ≥ 0 | Overdue | Internal |
| `team_attendance_today_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Today attendance | Internal |
| `team_on_leave_today` | JSONB | Yes | `'[]'` | — | On leave | Internal |
| `team_pending_regularizations` | INTEGER | Yes | `0` | ≥ 0 | Regularization requests | Internal |
| `team_pending_leave_requests` | INTEGER | Yes | `0` | ≥ 0 | Leave requests | Internal |
| `team_pending_expense_claims` | INTEGER | Yes | `0` | ≥ 0 | Expense claims | Internal |
| `team_pending_loan_requests` | INTEGER | Yes | `0` | ≥ 0 | Loan requests | Internal |
| `team_performance_summary` | JSONB | Yes | `'{}'` | — | Team performance | Confidential |
| `team_attrition_risks` | JSONB | No | `'[]'` | — | AI: attrition risks | Restricted |
| `team_skill_gaps` | JSONB | No | `'[]'` | — | AI: skill gaps | Confidential |
| `team_okr_progress` | JSONB | Yes | `'{}'` | — | Team OKR | Internal |
| `delegation_active` | BOOLEAN | Yes | `false` | — | Delegation in effect | Internal |
| `delegated_to_id` | UUID | No | NULL | FK to `workforce_master` | Delegated to | Confidential |
| `voice_approval_enabled` | BOOLEAN | Yes | `true` | — | Voice approval | Internal |
| `quick_actions` | JSONB | Yes | `'[]'` | — | Personalized quick actions | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI team insights | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workforce Master (381) | Many-to-One | N:1 | Manager |
| All MSS feature entities (492-500) | Aggregation | — | Source data |

### 6. Indexes
- UNIQUE (`dashboard_code`)
- INDEX (`manager_id`, `snapshot_date`)

### 7. Security Classification
**Confidential** — attrition risks are **Restricted**.

### 8. Integration Points
- **All MSS features** (492-500): Aggregation source
- **Workflow Engine** (Foundation Service): Approvals queue
- **AI HR Copilot** (505): Manager queries
- **Voice Service**: Voice approval
- **Mobile App**: Manager mobile experience

### 9. Sample Data
```json
{
  "dashboard_code": "MSS-DASH-wf100-2026-07-07", "manager_id": "wf-100",
  "team_scope": "DIRECT_REPORTS", "team_size": 12,
  "pending_approvals_total": 8, "overdue_approvals_count": 2,
  "team_attendance_today_pct": 91.67,
  "team_on_leave_today": [{ "employee": "wf-005", "leave_type": "EL" }],
  "team_pending_regularizations": 1, "team_pending_leave_requests": 3,
  "team_pending_expense_claims": 2, "team_pending_loan_requests": 1,
  "voice_approval_enabled": true,
  "status": "COMPLETED"
}
```

### 10. Audit Events
`MSS_DASHBOARD_VIEWED`, `MSS_DASHBOARD_REFRESHED`, `MSS_DELEGATION_ACTIVATED`, `MSS_DELEGATION_REVOKED`, `MSS_VOICE_APPROVAL_USED`

---

## Entity 492 — Attendance Approval (MSS)

### 1. Business Purpose
Per Part 12 §12: Manager approval for attendance regularizations, missed punches, and overtime.

### 2. Architectural Role
ESS Regularization Request → MSS Approval queue. Approval updates Attendance (Entity 437).

### 3. Business Rules
- Approval types: MISSED_PUNCH, LATE_ARRIVAL, EARLY_DEPARTURE, OVERTIME, ATTENDANCE_CORRECTION, SHIFT_CHANGE
- Auto-approval rules: ≤ 1 hour regularization, within 24 hours → auto-approve (configurable)
- Bulk approval: manager can bulk-approve similar requests
- Rejection: requires reason
- SLA: 48 hours; escalation if exceeded

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `approval_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `regularization_request_id` | UUID | Yes | — | FK to `regularization_requests` | Source request | Confidential |
| `attendance_id` | UUID | Yes | — | FK to `attendance` (Entity 437) | Affected attendance | Internal |
| `approval_type` | ENUM | Yes | — | MISSED_PUNCH, LATE_ARRIVAL, EARLY_DEPARTURE, OVERTIME, ATTENDANCE_CORRECTION, SHIFT_CHANGE | Type | Internal |
| `requested_change` | JSONB | Yes | `'{}'` | — | Before/after change | Confidential |
| `reason_given` | TEXT | Yes | — | Min 10 | Employee reason | Confidential |
| `manager_decision` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, DEFERRED | Decision | Internal |
| `decision_notes` | TEXT | No | NULL | — | Manager notes | Confidential |
| `decided_at` | TIMESTAMPTZ | No | NULL | — | Decision time | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA | Internal |
| `escalated` | BOOLEAN | Yes | `false` | — | Escalated | Internal |
| `auto_approved` | BOOLEAN | Yes | `false` | — | Auto-approved by rule | Internal |
| `bulk_approval_batch_id` | UUID | No | NULL | FK to `bulk_approval_batches` | Bulk batch | Internal |
| `attendance_updated` | BOOLEAN | Yes | `false` | — | Posted to attendance | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, ESCALATED, EXPIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workforce Master (381) | Many-to-One | N:1 | Manager + Employee |
| Regularization Request | Many-to-One | N:1 | Source |
| Attendance (437) | One-to-One | 1:1 | Affected |

### 6. Indexes
- UNIQUE (`approval_code`)
- INDEX (`manager_id`, `status`)
- INDEX (`employee_id`, `decided_at`)
- INDEX (`sla_due_at`, `status`)

### 7. Security Classification
**Confidential**.

### 8. Integration Points
- **Attendance Engine** (Entity 437): Update on approval
- **Workflow Engine**: Routing + escalation
- **Notification Service**: Decision notification
- **Mobile App**: One-tap approval

### 9. Sample Data
```json
{
  "approval_code": "MSS-ATD-APP-2026-00123", "manager_id": "wf-100",
  "employee_id": "wf-001", "approval_type": "MISSED_PUNCH",
  "requested_change": { "field": "clock_in", "before": null, "after": "09:15" },
  "reason_given": "Fingerprint scanner was not working at gate 2",
  "manager_decision": "APPROVED", "decided_at": "2026-07-07T15:00:00Z",
  "attendance_updated": true, "status": "APPROVED"
}
```

### 10. Audit Events
`MSS_ATTENDANCE_PENDING`, `MSS_ATTENDANCE_APPROVED`, `MSS_ATTENDANCE_REJECTED`, `MSS_ATTENDANCE_ESCALATED`, `MSS_ATTENDANCE_AUTO_APPROVED`, `MSS_ATTENDANCE_BULK_APPROVED`

---

## Entity 493 — Leave Approval (MSS)

### 1. Business Purpose
Per Part 12 §12: Manager approval for employee leave requests with calendar visibility.

### 2. Architectural Role
MSS view over Leave Approval (Entity 445). Provides team-calendar context and quick-approval.

### 3. Business Rules
- Calendar view: team leave calendar with conflict detection
- Conflict alerts: warn if multiple team members request same dates
- Coverage check: minimum staffing validation
- Bulk approval: approve multiple similar requests
- Delegate approval: if manager on leave, auto-delegate
- SLA: 48 hours; auto-escalation after 72 hours
- Auto-approval: if manager on extended leave and no delegate

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `mss_approval_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `leave_request_id` | UUID | Yes | — | FK to `leave_requests` (Entity 444) | Source | Confidential |
| `leave_approval_id` | UUID | Yes | — | FK to `leave_approvals` (Entity 445) | Source approval | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `leave_details` | JSONB | Yes | `'{}'` | — | Leave summary (type, dates, reason) | Confidential |
| `team_calendar_context` | JSONB | Yes | `'{}'` | — | Other team members on leave | Internal |
| `conflict_warnings` | JSONB | Yes | `'[]'` | — | Conflicts detected | Internal |
| `coverage_check_status` | ENUM | Yes | `OK` | OK, WARNING, CRITICAL | Coverage | Internal |
| `min_staffing_violation` | BOOLEAN | Yes | `false` | — | Staffing violation | Internal |
| `manager_decision` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, DEFERRED | Decision | Internal |
| `decision_notes` | TEXT | No | NULL | — | Manager notes | Confidential |
| `decided_at` | TIMESTAMPTZ | No | NULL | — | Decision time | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA | Internal |
| `delegated_from_id` | UUID | No | NULL | FK to `workforce_master` | Original manager | Confidential |
| `bulk_approval_batch_id` | UUID | No | NULL | FK to `bulk_approval_batches` | Bulk batch | Internal |
| `voice_approval_used` | BOOLEAN | Yes | `false` | — | Voice approval | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, ESCALATED, EXPIRED, AUTO_APPROVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workforce Master (381) | Many-to-One | N:1 | Manager + Employee |
| Leave Request (444) | One-to-One | 1:1 | Source |
| Leave Approval (445) | One-to-One | 1:1 | Source approval |

### 6. Indexes
- UNIQUE (`mss_approval_code`)
- INDEX (`manager_id`, `status`)
- INDEX (`sla_due_at`, `status`)

### 7. Security Classification
**Confidential**.

### 8. Integration Points
- **Leave Engine** (Entity 445): Source
- **Workforce Scheduling Engine** (FS-20): Coverage check
- **Workflow Engine**: Escalation
- **Voice Service**: Voice approval
- **Mobile App**: One-tap + voice

### 9. Sample Data
```json
{
  "mss_approval_code": "MSS-LV-APP-2026-00042", "manager_id": "wf-100",
  "employee_id": "wf-001", "leave_request_id": "lr-001",
  "leave_details": { "type": "EL", "from": "2026-07-15", "to": "2026-07-18", "days": 4 },
  "team_calendar_context": { "others_on_leave": [], "team_size": 12 },
  "conflict_warnings": [], "coverage_check_status": "OK",
  "manager_decision": "APPROVED", "decided_at": "2026-07-07T14:00:00Z",
  "status": "APPROVED"
}
```

### 10. Audit Events
`MSS_LEAVE_PENDING`, `MSS_LEAVE_APPROVED`, `MSS_LEAVE_REJECTED`, `MSS_LEAVE_ESCALATED`, `MSS_LEAVE_AUTO_APPROVED`, `MSS_LEAVE_VOICE_APPROVED`

---

## Entity 494 — Expense Approval (MSS)

### 1. Business Purpose
Per Part 12 §12: Manager approval for employee expense reimbursements with policy compliance check.

### 2. Architectural Role
MSS view over Reimbursement (Entity 457). Provides policy-violation flags and quick-approval.

### 3. Business Rules
- Policy check: auto-flag policy violations (over-cap, duplicate bills, out-of-policy items)
- Bill verification: manager can review uploaded bills
- Partial approval: approve subset of claim lines
- Rejection: requires per-line reason
- Multi-level: high-value claims route to Finance after manager
- SLA: 72 hours

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `approval_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `reimbursement_id` | UUID | Yes | — | FK to `reimbursements` (Entity 457) | Source | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `claim_summary` | JSONB | Yes | `'{}'` | — | Claim summary | Confidential |
| `policy_compliance_check` | JSONB | Yes | `'{}'` | — | Auto policy check | Internal |
| `policy_violations` | JSONB | Yes | `'[]'` | — | Violations | Internal |
| `bills_review_status` | ENUM | Yes | `PENDING` | PENDING, VERIFIED, FLAGGED | Bill review | Internal |
| `line_items_decisions` | JSONB | Yes | `'[]'` | — | Per-line approve/reject | Confidential |
| `total_approved_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Approved amount | Confidential |
| `total_rejected_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Rejected amount | Confidential |
| `manager_decision` | ENUM | Yes | `PENDING` | PENDING, APPROVED, PARTIALLY_APPROVED, REJECTED | Decision | Internal |
| `decision_notes` | TEXT | No | NULL | — | Manager notes | Confidential |
| `decided_at` | TIMESTAMPTZ | No | NULL | — | Decision time | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA | Internal |
| `requires_finance_approval` | BOOLEAN | Yes | `false` | — | High-value routing | Internal |
| `finance_approver_id` | UUID | No | NULL | FK to `workforce_master` | Finance approver | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, PARTIALLY_APPROVED, REJECTED, ESCALATED, EXPIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workforce Master (381) | Many-to-One | N:1 | Manager + Employee |
| Reimbursement (457) | One-to-One | 1:1 | Source |

### 6. Indexes
- UNIQUE (`approval_code`)
- INDEX (`manager_id`, `status`)
- INDEX (`sla_due_at`, `status`)

### 7. Security Classification
**Confidential**.

### 8. Integration Points
- **Reimbursement Engine** (Entity 457): Source
- **Compensation Rules Engine** (Q161): Policy compliance check
- **Workflow Engine**: Multi-level routing
- **Document Storage**: Bill review

### 9. Sample Data
```json
{
  "approval_code": "MSS-EXP-APP-2026-00123", "manager_id": "wf-100",
  "employee_id": "wf-001", "reimbursement_id": "re-2026-00123",
  "claim_summary": { "type": "FUEL", "amount": 6500, "bills": 4 },
  "policy_compliance_check": { "within_cap": true, "duplicate_bills": false },
  "policy_violations": [], "bills_review_status": "VERIFIED",
  "total_approved_amount": 6500.0000, "manager_decision": "APPROVED",
  "status": "APPROVED"
}
```

### 10. Audit Events
`MSS_EXPENSE_PENDING`, `MSS_EXPENSE_APPROVED`, `MSS_EXPENSE_PARTIALLY_APPROVED`, `MSS_EXPENSE_REJECTED`, `MSS_EXPENSE_POLICY_VIOLATION_FLAGGED`, `MSS_EXPENSE_ESCALATED_TO_FINANCE`

---

## Entity 495 — Recruitment Approval (MSS)

### 1. Business Purpose
Per Part 12 §12: Manager approval for job requisitions, candidate selections, and offer releases.

### 2. Architectural Role
MSS view over Recruitment (Entity 411-420). Multi-stage approval for hiring decisions.

### 3. Business Rules
- Approval stages: REQUISITION (need to hire), CANDIDATE_SELECTION (chosen candidate), OFFER_RELEASE (offer authorization)
- Budget check: requisition CTC vs departmental budget
- Diversity check: flag if candidate pool lacks diversity
- Multi-level: Manager → Dept Head → HR → Finance (for high-value roles)
- Candidate comparison: manager view of all interviewed candidates

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `approval_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `approval_stage` | ENUM | Yes | — | REQUISITION, CANDIDATE_SELECTION, OFFER_RELEASE | Stage | Internal |
| `requisition_id` | UUID | No | NULL | FK to `job_requisitions` (Entity 411) | Requisition | Internal |
| `candidate_id` | UUID | No | NULL | FK to `candidates` (Entity 414) | Candidate | Confidential |
| `offer_id` | UUID | No | NULL | FK to `offers` (Entity 418) | Offer | Confidential |
| `approval_payload` | JSONB | Yes | `'{}'` | — | Stage-specific payload | Confidential |
| `budget_check` | JSONB | Yes | `'{}'` | — | Budget validation | Confidential |
| `diversity_check` | JSONB | No | NULL | — | Diversity flags | Confidential |
| `candidate_comparison` | JSONB | No | NULL | — | Candidate comparison (for SELECTION) | Confidential |
| `manager_decision` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, DEFERRED | Decision | Internal |
| `decision_notes` | TEXT | No | NULL | — | Manager notes | Confidential |
| `decided_at` | TIMESTAMPTZ | No | NULL | — | Decision time | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA | Internal |
| `next_approver_role` | ENUM | No | NULL | DEPT_HEAD, HR, FINANCE, CEO | Next in chain | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, ESCALATED, EXPIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workforce Master (381) | Many-to-One | N:1 | Manager |
| Job Requisition (411) | Many-to-One | N:1 | Requisition |
| Candidate (414) | Many-to-One | N:1 | Candidate |
| Offer (418) | Many-to-One | N:1 | Offer |

### 6. Indexes
- UNIQUE (`approval_code`)
- INDEX (`manager_id`, `status`)
- INDEX (`approval_stage`, `status`)

### 7. Security Classification
**Confidential** — candidate data and offers.

### 8. Integration Points
- **Recruitment Engine** (Entities 411-420): Source
- **Workflow Engine**: Multi-level routing
- **Notification Service**: Decision notifications
- **HR Portal**: HR approval queue

### 9. Sample Data
```json
{
  "approval_code": "MSS-REC-APP-2026-00008", "manager_id": "wf-100",
  "approval_stage": "OFFER_RELEASE",
  "requisition_id": "jq-001", "candidate_id": "cand-001", "offer_id": "off-001",
  "approval_payload": { "offered_ctc": 1500000, "join_date": "2026-08-01" },
  "budget_check": { "within_budget": true, "variance_pct": 5 },
  "manager_decision": "APPROVED", "decided_at": "2026-07-07T16:00:00Z",
  "next_approver_role": "HR", "status": "APPROVED"
}
```

### 10. Audit Events
`MSS_RECRUITMENT_PENDING`, `MSS_RECRUITMENT_APPROVED`, `MSS_RECRUITMENT_REJECTED`, `MSS_RECRUITMENT_BUDGET_BREACH`, `MSS_RECRUITMENT_ESCALATED`

---

## Entity 496 — Performance Approval (MSS)

### 1. Business Purpose
Per Part 12 §12: Manager approval for performance reviews, OKR check-ins, and feedback.

### 2. Architectural Role
MSS view over Performance Review (Entity 463) + OKR Master (Entity 462). Manager-side performance assessment workflow.

### 3. Business Rules
- Manager assessment: review employee self-assessment, add own assessment
- Rating calibration: at cycle end, manager participates in calibration sessions
- OKR sign-off: manager approves team OKRs
- Feedback submission: ongoing feedback (not just at review time)
- Conflict resolution: dispute resolution if employee disputes rating

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `approval_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `approval_type` | ENUM | Yes | — | REVIEW_ASSESSMENT, OKR_SIGNOFF, FEEDBACK_SUBMISSION, CALIBRATION, DISPUTE_RESOLUTION | Type | Internal |
| `performance_review_id` | UUID | No | NULL | FK to `performance_reviews` (Entity 463) | Review | Confidential |
| `okr_id` | UUID | No | NULL | FK to `okr_master` (Entity 462) | OKR | Internal |
| `approval_payload` | JSONB | Yes | `'{}'` | — | Type-specific payload | Confidential |
| `manager_assessment_json` | JSONB | No | NULL | — | Manager assessment | Confidential |
| `manager_rating` | DECIMAL(3,1) | No | NULL | 1.0-5.0 | Rating | Confidential |
| `employee_self_rating` | DECIMAL(3,1) | No | NULL | 1.0-5.0 | Self rating | Confidential |
| `rating_variance` | DECIMAL(3,1) | No | NULL | — | Variance | Confidential |
| `decision_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `decided_at` | TIMESTAMPTZ | No | NULL | — | Decision time | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA | Internal |
| `calibration_session_id` | UUID | No | NULL | FK to `calibration_sessions` | Calibration | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, SUBMITTED, CALIBRATION_PENDING, COMPLETED, DISPUTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workforce Master (381) | Many-to-One | N:1 | Manager + Employee |
| Performance Review (463) | Many-to-One | N:1 | Review |
| OKR Master (462) | Many-to-One | N:1 | OKR |

### 6. Indexes
- UNIQUE (`approval_code`)
- INDEX (`manager_id`, `status`)
- INDEX (`approval_type`, `status`)

### 7. Security Classification
**Confidential**.

### 8. Integration Points
- **Performance Engine** (FS-22): Source
- **Workflow Engine**: Calibration routing
- **Notification Service**: Review notifications
- **ESS Portal**: Employee notification of manager assessment

### 9. Sample Data
```json
{
  "approval_code": "MSS-PERF-APP-2026-00012", "manager_id": "wf-100",
  "employee_id": "wf-001", "approval_type": "REVIEW_ASSESSMENT",
  "performance_review_id": "pr-2026-q1-00012",
  "manager_rating": 4.2, "employee_self_rating": 4.5, "rating_variance": -0.3,
  "decision_notes": "Strong performance; align on stakeholder management next cycle",
  "decided_at": "2026-04-25T15:00:00Z",
  "status": "SUBMITTED"
}
```

### 10. Audit Events
`MSS_PERFORMANCE_PENDING`, `MSS_PERFORMANCE_SUBMITTED`, `MSS_PERFORMANCE_DISPUTED`, `MSS_PERFORMANCE_CALIBRATED`, `MSS_PERFORMANCE_COMPLETED`

---

## Entity 497 — Transfer Approval (MSS)

### 1. Business Purpose
Per Part 12 §12: Manager approval for employee transfers (internal mobility).

### 2. Architectural Role
MSS workflow entity — both current manager and receiving manager approve transfers.

### 3. Business Rules
- Transfer types: DEPARTMENTAL, INTER_DEPARTMENT, INTER_FACILITY, INTER_COMPANY, INTER_STATE
- Approval chain: Current Manager → Receiving Manager → HR (both managers must approve)
- Notice period: 30-90 days based on role criticality
- Knowledge transfer plan: required for critical roles
- Salary impact: transfer may include salary revision (per Cost of Living for inter-state)
- Probation reset: inter-department transfer may trigger probation in new role

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `approval_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `current_manager_id` | UUID | Yes | — | FK to `workforce_master` | Current manager | Confidential |
| `receiving_manager_id` | UUID | Yes | — | FK to `workforce_master` | Receiving manager | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `transfer_type` | ENUM | Yes | — | DEPARTMENTAL, INTER_DEPARTMENT, INTER_FACILITY, INTER_COMPANY, INTER_STATE | Type | Internal |
| `current_department_id` | UUID | Yes | — | FK to `departments` | Current dept | Internal |
| `new_department_id` | UUID | Yes | — | FK to `departments` | New dept | Internal |
| `current_position_id` | UUID | Yes | — | FK to `position_masters` | Current position | Internal |
| `new_position_id` | UUID | Yes | — | FK to `position_masters` | New position | Internal |
| `current_facility_id` | UUID | No | NULL | FK to `facilities` | Current facility | Internal |
| `new_facility_id` | UUID | No | NULL | FK to `facilities` | New facility | Internal |
| `transfer_reason` | TEXT | Yes | — | Min 20 | Reason | Confidential |
| `effective_date` | DATE | Yes | — | — | Effective date | Internal |
| `notice_period_days` | INTEGER | Yes | `30` | ≥ 0 | Notice | Internal |
| `salary_impact` | ENUM | Yes | `NONE` | NONE, REVISION, RELOCATION_BONUS, COST_OF_LIVING_ADJUSTMENT | Salary impact | Confidential |
| `salary_revision_amount` | DECIMAL(18,4) | No | NULL | — | Revision | Confidential |
| `kt_plan_required` | BOOLEAN | Yes | `false` | — | KT plan | Internal |
| `kt_plan_document_id` | UUID | No | NULL | FK to `documents` | KT plan | Confidential |
| `current_manager_decision` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED | Decision | Internal |
| `receiving_manager_decision` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED | Decision | Internal |
| `hr_decision` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED | HR decision | Internal |
| `decided_at` | TIMESTAMPTZ | No | NULL | — | Final decision | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, IN_APPROVAL, APPROVED, REJECTED, IMPLEMENTED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workforce Master (381) | Many-to-One | N:1 | Employee + Managers |
| Departments | Many-to-One | N:1 | Current + New |
| Position Master (393) | Many-to-One | N:1 | Current + New |

### 6. Indexes
- UNIQUE (`approval_code`)
- INDEX (`employee_id`, `status`)
- INDEX (`current_manager_id`, `current_manager_decision`)
- INDEX (`receiving_manager_id`, `receiving_manager_decision`)

### 7. Security Classification
**Confidential**.

### 8. Integration Points
- **Workforce Master** (381): Update on transfer
- **Workflow Engine**: Multi-approval routing
- **Compensation Rules Engine** (Q161): Salary revision
- **Notification Service**: Approval notifications

### 9. Sample Data
```json
{
  "approval_code": "MSS-TRN-APP-2026-00004", "employee_id": "wf-001",
  "current_manager_id": "wf-100", "receiving_manager_id": "wf-200",
  "transfer_type": "INTER_DEPARTMENT",
  "current_department_id": "dept-mfg", "new_department_id": "dept-qa",
  "current_position_id": "pos-eng", "new_position_id": "pos-qa-eng",
  "transfer_reason": "Employee requested move to QA for career growth",
  "effective_date": "2026-08-01", "notice_period_days": 30,
  "salary_impact": "NONE", "kt_plan_required": true,
  "current_manager_decision": "APPROVED", "receiving_manager_decision": "APPROVED",
  "hr_decision": "PENDING", "status": "IN_APPROVAL"
}
```

### 10. Audit Events
`MSS_TRANSFER_PENDING`, `MSS_TRANSFER_CURRENT_MANAGER_APPROVED`, `MSS_TRANSFER_RECEIVING_MANAGER_APPROVED`, `MSS_TRANSFER_HR_APPROVED`, `MSS_TRANSFER_REJECTED`, `MSS_TRANSFER_IMPLEMENTED`

---

## Entity 498 — Promotion Approval (MSS)

### 1. Business Purpose
Per Part 12 §12: Manager approval for promotion recommendations (multi-level chain).

### 2. Architectural Role
MSS view over Promotion Recommendation (Entity 466). Manager initiates; multi-level approval.

### 3. Business Rules
- Initiation: Manager submits promotion recommendation
- Approval chain: Manager (initiator) → Dept Head → HR → Compensation Committee → CEO (for top grades)
- Budget check: per-cycle per-department promotion budget
- Cooling period validation: 12 months since last promotion
- Performance threshold: min 4.0 rating in last cycle
- Critical role: CEO approval mandatory for Director+ roles

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `approval_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `promotion_recommendation_id` | UUID | Yes | — | FK to `promotion_recommendations` (Entity 466) | Source | Confidential |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Initiator | Confidential |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `approval_chain` | JSONB | Yes | `'[]'` | — | Multi-level chain | Confidential |
| `current_approver_level` | INTEGER | Yes | `1` | ≥ 1 | Current level | Internal |
| `current_approver_id` | UUID | No | NULL | FK to `workforce_master` | Current approver | Confidential |
| `current_approver_role` | ENUM | Yes | — | MANAGER, DEPT_HEAD, HR, COMPENSATION_COMMITTEE, CEO | Role | Internal |
| `approval_payload` | JSONB | Yes | `'{}'` | — | Recommendation details | Confidential |
| `budget_check` | JSONB | Yes | `'{}'` | — | Budget validation | Confidential |
| `cooling_period_check` | JSONB | Yes | `'{}'` | — | Cooling validation | Internal |
| `performance_threshold_check` | JSONB | Yes | `'{}'` | — | Performance validation | Confidential |
| `decision` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, DEFERRED | Decision | Internal |
| `decision_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `decided_at` | TIMESTAMPTZ | No | NULL | — | Decision time | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA | Internal |
| `final_approval_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, WITHDRAWN | Final | Internal |
| `position_change_posted` | BOOLEAN | Yes | `false` | — | Position updated | Internal |
| `salary_revision_posted` | BOOLEAN | Yes | `false` | — | Salary updated | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, IN_APPROVAL, APPROVED, REJECTED, WITHDRAWN, IMPLEMENTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Promotion Recommendation (466) | One-to-One | 1:1 | Source |
| Workforce Master (381) | Many-to-One | N:1 | Employee + Initiator |

### 6. Indexes
- UNIQUE (`approval_code`)
- INDEX (`manager_id`, `status`)
- INDEX (`current_approver_id`, `decision`)
- INDEX (`final_approval_status`)

### 7. Security Classification
**Confidential** — salary and approval chain data.

### 8. Integration Points
- **Promotion Recommendation** (466): Source
- **Workflow Engine**: Multi-level routing
- **Compensation Rules Engine** (Q161): Salary revision
- **Workforce Master** (381): Position update
- **Notification Service**: Approval notifications

### 9. Sample Data
```json
{
  "approval_code": "MSS-PROM-APP-2026-00008",
  "promotion_recommendation_id": "prom-2026-00008",
  "manager_id": "wf-100", "employee_id": "wf-001",
  "approval_chain": [
    { "level": 1, "role": "MANAGER", "decision": "APPROVED", "decided_at": "2026-05-15T10:00:00Z" },
    { "level": 2, "role": "DEPT_HEAD", "decision": "PENDING" }
  ],
  "current_approver_level": 2, "current_approver_role": "DEPT_HEAD",
  "budget_check": { "within_budget": true },
  "cooling_period_check": { "eligible": true, "last_promotion": "2024-04-01" },
  "performance_threshold_check": { "meets": true, "last_rating": 4.7 },
  "status": "IN_APPROVAL"
}
```

### 10. Audit Events
`MSS_PROMOTION_PENDING`, `MSS_PROMOTION_LEVEL_APPROVED`, `MSS_PROMOTION_LEVEL_REJECTED`, `MSS_PROMOTION_FINAL_APPROVED`, `MSS_PROMOTION_IMPLEMENTED`, `MSS_PROMOTION_WITHDRAWN`

---

## Entity 499 — Organization Analytics

### 1. Business Purpose
Per Part 12 §12: Manager view of organizational analytics — headcount, span of control, diversity, age distribution, tenure.

### 2. Architectural Role
Aggregated view entity — manager-specific view of org analytics. Powered by HR Analytics (Sec 13).

### 3. Business Rules
- Scope: manager's team, department, or full org (based on permissions)
- Real-time: headcount + attendance
- Periodic: diversity, age distribution, tenure refreshed daily
- Comparative: vs previous period, vs company average
- Anomaly alerts: sudden attrition spike, gender imbalance

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `analytics_code` | VARCHAR(30) | Yes | — | Unique per manager × date | Code | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `analytics_scope` | ENUM | Yes | `TEAM` | TEAM, DEPARTMENT, FACILITY, COMPANY | Scope | Internal |
| `scope_entity_id` | UUID | Yes | — | — | Scope entity | Internal |
| `headcount_total` | INTEGER | Yes | `0` | ≥ 0 | Headcount | Internal |
| `headcount_on_roll` | INTEGER | Yes | `0` | ≥ 0 | On-roll | Internal |
| `headcount_contract` | INTEGER | Yes | `0` | ≥ 0 | Contract | Internal |
| `span_of_control_avg` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Avg span | Internal |
| `gender_distribution` | JSONB | Yes | `'{}'` | — | Gender % | Confidential |
| `age_distribution` | JSONB | Yes | `'{}'` | — | Age bands | Confidential |
| `tenure_distribution` | JSONB | Yes | `'{}'` | — | Tenure bands | Internal |
| `grade_distribution` | JSONB | Yes | `'{}'` | — | Grade mix | Internal |
| `attrition_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Attrition | Confidential |
| `attrition_trend` | JSONB | Yes | `'[]'` | — | 12-month trend | Confidential |
| `hiring_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Hiring rate | Internal |
| `diversity_metrics` | JSONB | Yes | `'{}'` | — | Diversity indicators | Confidential |
| `anomaly_alerts` | JSONB | No | `'[]'` | — | Detected anomalies | Confidential |
| `comparison_vs_company_avg` | JSONB | Yes | `'{}'` | — | Variance | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI insights | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workforce Master (381) | Many-to-One | N:1 | Manager |
| HR Analytics (501-510) | Service | — | Source |

### 6. Indexes
- UNIQUE (`analytics_code`)
- INDEX (`manager_id`, `snapshot_date`)
- INDEX (`analytics_scope`, `snapshot_date`)

### 7. Security Classification
**Confidential** — diversity metrics are **Restricted**.

### 8. Integration Points
- **Workforce Intelligence** (FS-26): Source analytics
- **AI Service**: Anomaly detection
- **HR Mission Control** (509): Org analytics feed

### 9. Sample Data
```json
{
  "analytics_code": "MSS-ORG-ANL-2026-07-07", "manager_id": "wf-100",
  "snapshot_date": "2026-07-07", "analytics_scope": "DEPARTMENT",
  "scope_entity_id": "dept-mfg", "headcount_total": 85,
  "span_of_control_avg": 7.50,
  "gender_distribution": { "male": 75, "female": 25 },
  "age_distribution": { "20-30": 35, "30-40": 40, "40-50": 20, "50+": 5 },
  "attrition_rate_pct": 8.50,
  "status": "COMPLETED"
}
```

### 10. Audit Events
`MSS_ORG_ANALYTICS_VIEWED`, `MSS_ORG_ANALYTICS_ANOMALY_DETECTED`, `MSS_ORG_ANALYTICS_EXPORTED`

---

## Entity 500 — Manager KPI Dashboard

### 1. Business Purpose
Per Part 12 §12: Manager view of team KPIs. Per Part 12: Supports Department, Team, Projects, Budget, Performance.

### 2. Architectural Role
Aggregated view entity — manager-specific KPI dashboard. Powered by KPI Library (461) + Performance Engine (FS-22).

### 3. Business Rules
- Scope: Department, Team, Projects, Budget, Performance (per Part 12)
- Real-time: production KPIs (from MES), sales KPIs (from POS)
- Threshold visualization: green/amber/red based on KPI thresholds
- Drill-down: manager can drill-down from team KPI to individual employee KPI
- Trend: 12-month trend per KPI
- AI insights: KPI anomaly detection, forecast

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `dashboard_code` | VARCHAR(30) | Yes | — | Unique per manager × date | Code | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `dashboard_scope` | ENUM | Yes | — | DEPARTMENT, TEAM, PROJECTS, BUDGET, PERFORMANCE | Scope (per Part 12) | Internal |
| `scope_entity_id` | UUID | Yes | — | — | Scope entity | Internal |
| `kpi_summary` | JSONB | Yes | `'[]'` | — | Per-KPI summary | Confidential |
| `kpi_count_total` | INTEGER | Yes | `0` | ≥ 0 | Total KPIs | Internal |
| `kpi_count_green` | INTEGER | Yes | `0` | ≥ 0 | On-target | Internal |
| `kpi_count_amber` | INTEGER | Yes | `0` | ≥ 0 | Warning | Internal |
| `kpi_count_red` | INTEGER | Yes | `0` | ≥ 0 | Critical | Internal |
| `overall_performance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Overall | Internal |
| `team_okr_progress_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Team OKR | Internal |
| `budget_utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-200 | Budget usage | Confidential |
| `budget_variance_pct` | DECIMAL(5,2) | Yes | `0` | — | Variance | Confidential |
| `project_status_summary` | JSONB | Yes | `'{}'` | — | Project KPIs | Internal |
| `individual_kpi_breakdown` | JSONB | Yes | `'[]'` | — | Per-employee KPIs | Confidential |
| `kpi_trends` | JSONB | Yes | `'{}'` | — | 12-month trends | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI insights | Confidential |
| `ai_forecast` | JSONB | No | NULL | — | KPI forecasts | Confidential |
| `ai_anomaly_alerts` | JSONB | No | `'[]'` | — | Anomalies | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workforce Master (381) | Many-to-One | N:1 | Manager |
| KPI Library (461) | Many-to-Many | N:N | Tracked KPIs |
| Performance Engine (FS-22) | Service | — | KPI computation |

### 6. Indexes
- UNIQUE (`dashboard_code`)
- INDEX (`manager_id`, `snapshot_date`)
- INDEX (`dashboard_scope`)

### 7. Security Classification
**Confidential** — budget data is **Restricted**.

### 8. Integration Points
- **Performance Engine** (FS-22): KPI computation
- **BI Service**: KPI actuals
- **AI Service**: Anomaly + forecast
- **Mobile App**: Mobile-optimized view

### 9. Sample Data
```json
{
  "dashboard_code": "MSS-KPI-DASH-2026-07-07", "manager_id": "wf-100",
  "snapshot_date": "2026-07-07", "dashboard_scope": "DEPARTMENT",
  "scope_entity_id": "dept-mfg",
  "kpi_count_total": 8, "kpi_count_green": 5, "kpi_count_amber": 2, "kpi_count_red": 1,
  "overall_performance_pct": 87.50, "team_okr_progress_pct": 72.50,
  "budget_utilization_pct": 65.00, "budget_variance_pct": -5.00,
  "status": "COMPLETED"
}
```

### 10. Audit Events
`MSS_KPI_DASHBOARD_VIEWED`, `MSS_KPI_DASHBOARD_REFRESHED`, `MSS_KPI_ANOMALY_ALERTED`, `MSS_KPI_DRILLDOWN_ACCESSED`

---

# SECTION 13: HR Analytics, AI HR Copilot & HR Mission Control (Entities 501-510)

## Entity 501 — HR KPI Library

### 1. Business Purpose
Per Part 12 §13: Measures Headcount, Attrition, Hiring, Training, Payroll Cost, Absenteeism, Overtime, Vacancies, Time To Hire, Retention. HR-specific KPI catalog.

### 2. Architectural Role
Specialized subset of KPI Library (461) — pre-configured HR KPIs for HR Mission Control and Executive Scorecard.

### 3. Business Rules
- HR KPIs per Part 12: Headcount, Attrition, Hiring, Training, Payroll Cost, Absenteeism, Overtime, Vacancies, Time To Hire, Retention
- Each KPI has formula, benchmark, target, frequency
- Industry benchmark: per Indian manufacturing sector
- AI-assisted: anomaly detection + forecast
- Regulatory KPIs: compliance KPIs (PF/ESIC filings on-time %)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `hr_kpi_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `hr_kpi_name` | VARCHAR(150) | Yes | — | Min 5 | Name | Internal |
| `kpi_category` | ENUM | Yes | — | HEADCOUNT, ATTRITION, HIRING, TRAINING, PAYROLL, ABSENTEEISM, OVERTIME, VACANCIES, TIME_TO_HIRE, RETENTION, COMPLIANCE, DIVERSITY | Category (per Part 12) | Internal |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | Unit | Internal |
| `direction` | ENUM | Yes | `HIGHER_BETTER` | HIGHER_BETTER, LOWER_BETTER, TARGET_RANGE | Direction | Internal |
| `calculation_formula` | TEXT | Yes | — | — | Formula | Confidential |
| `data_sources` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Source systems | Internal |
| `default_frequency` | ENUM | Yes | `MONTHLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY | Frequency | Internal |
| `default_target_value` | DECIMAL(18,4) | No | NULL | — | Target | Internal |
| `industry_benchmark` | DECIMAL(18,4) | No | NULL | — | Benchmark | Internal |
| `company_benchmark` | DECIMAL(18,4) | No | NULL | — | Internal benchmark | Confidential |
| `applicable_company_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Companies (NULL = all) | Internal |
| `is_regulatory` | BOOLEAN | Yes | `false` | — | Regulatory KPI | Internal |
| `regulatory_reference` | VARCHAR(100) | No | NULL | — | Regulation | Internal |
| `ai_anomaly_detection` | BOOLEAN | Yes | `true` | — | AI anomaly | Internal |
| `ai_forecast_horizon_months` | INTEGER | Yes | `3` | ≥ 0 | Forecast horizon | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| KPI Library (461) | Specialization | — | HR subset |
| HR Dashboard (502) | Many-to-Many | N:N | Dashboard KPIs |
| HR Mission Control (509) | Many-to-Many | N:N | Mission control KPIs |
| Executive Scorecard (510) | Many-to-Many | N:N | Executive KPIs |
| Workforce Intelligence (FS-26) | Service | — | Computation |

### 6. Indexes
- UNIQUE (`hr_kpi_code`)
- INDEX (`kpi_category`, `status`)
- GIN INDEX (`applicable_company_ids`)

### 7. Security Classification
**Internal** — formulas and benchmarks are **Confidential**.

### 8. Integration Points
- **Workforce Intelligence** (FS-26): Computation
- **AI Service**: Anomaly + forecast
- **HR Mission Control** (509): KPI display
- **Executive Scorecard** (510): KPI rollup
- **MSS KPI Dashboard** (500): Subset for managers

### 9. Sample Data
```json
{
  "hr_kpi_code": "HRK-ATTR-ANNUAL", "hr_kpi_name": "Annual Attrition Rate",
  "kpi_category": "ATTRITION", "unit_of_measure": "%", "direction": "LOWER_BETTER",
  "calculation_formula": "(employees_left_ytd / avg_headcount_ytd) × 100",
  "data_sources": ["HRMS", "SEPARATION_SYSTEM"],
  "default_frequency": "MONTHLY", "default_target_value": 10.0000,
  "industry_benchmark": 15.0000, "company_benchmark": 8.5000,
  "ai_anomaly_detection": true, "ai_forecast_horizon_months": 3,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`HR_KPI_CREATED`, `HR_KPI_UPDATED`, `HR_KPI_BENCHMARK_UPDATED`, `HR_KPI_INACTIVATED`

---

## Entity 502 — HR Dashboard

### 1. Business Purpose
Per Part 12 §13: Displays Headcount, Attendance, Payroll, Recruitment, Training, Performance, Leave, Vacancies. Unified HR operational dashboard.

### 2. Architectural Role
Aggregated view entity — powers HR team's day-to-day operations. Multi-grain (company, facility, department).

### 3. Business Rules
- Multi-grain: company, facility, department, team
- Real-time: headcount, attendance, pending approvals
- Daily refresh: payroll, recruitment, training KPIs
- Drill-down: from company to facility to department
- Comparative: vs last period, vs target, vs industry benchmark
- Export: PDF, Excel for executive reporting

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `dashboard_code` | VARCHAR(30) | Yes | — | Unique per company × date × scope | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `dashboard_scope` | ENUM | Yes | `COMPANY` | COMPANY, FACILITY, DEPARTMENT, TEAM | Scope | Internal |
| `scope_entity_id` | UUID | Yes | — | — | Scope entity | Internal |
| `headcount_summary` | JSONB | Yes | `'{}'` | — | Headcount (per Part 12) | Internal |
| `attendance_summary` | JSONB | Yes | `'{}'` | — | Attendance (per Part 12) | Internal |
| `payroll_summary` | JSONB | Yes | `'{}'` | — | Payroll (per Part 12) | Confidential |
| `recruitment_summary` | JSONB | Yes | `'{}'` | — | Recruitment (per Part 12) | Internal |
| `training_summary` | JSONB | Yes | `'{}'` | — | Training (per Part 12) | Internal |
| `performance_summary` | JSONB | Yes | `'{}'` | — | Performance (per Part 12) | Confidential |
| `leave_summary` | JSONB | Yes | `'{}'` | — | Leave (per Part 12) | Internal |
| `vacancies_summary` | JSONB | Yes | `'{}'` | — | Vacancies (per Part 12) | Internal |
| `compliance_summary` | JSONB | Yes | `'{}'` | — | Compliance KPIs | Confidential |
| `key_alerts` | JSONB | Yes | `'[]'` | — | Critical alerts | Confidential |
| `kpi_snapshots` | JSONB | Yes | `'[]'` | — | HR KPI values | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI insights | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| HR KPI Library (501) | Many-to-Many | N:N | KPIs displayed |
| Workforce Intelligence (FS-26) | Service | — | Source |

### 6. Indexes
- UNIQUE (`dashboard_code`)
- INDEX (`company_id`, `snapshot_date`)
- INDEX (`dashboard_scope`, `snapshot_date`)

### 7. Security Classification
**Confidential** — payroll and performance data are **Restricted**.

### 8. Integration Points
- **Workforce Intelligence** (FS-26): Aggregation
- **All HR modules** (381-500): Source data
- **AI Service**: Insights
- **Notification Service**: Alert routing
- **HR Portal**: Display

### 9. Sample Data
```json
{
  "dashboard_code": "HR-DASH-cmp001-2026-07-07", "company_id": "cmp-001",
  "snapshot_date": "2026-07-07", "dashboard_scope": "COMPANY",
  "scope_entity_id": "cmp-001",
  "headcount_summary": { "total": 250, "on_roll": 220, "contract": 30 },
  "attendance_summary": { "present_today": 225, "on_leave": 15, "absent": 10 },
  "payroll_summary": { "last_cycle_cost": 14200000, "variance_pct": 2.5 },
  "recruitment_summary": { "open_positions": 12, "in_pipeline": 45 },
  "training_summary": { "completion_rate_pct": 78.5, "overdue_count": 12 },
  "vacancies_summary": { "critical": 3, "total": 12 },
  "compliance_summary": { "pf_filed": true, "esic_filed": true, "tds_filed": true },
  "key_alerts": [{ "type": "CRITICAL_VACANCY", "message": "Plant Manager vacant 30 days" }],
  "status": "COMPLETED"
}
```

### 10. Audit Events
`HR_DASHBOARD_VIEWED`, `HR_DASHBOARD_REFRESHED`, `HR_DASHBOARD_EXPORTED`, `HR_DASHBOARD_ALERT_TRIGGERED`

---

## Entity 503 — Workforce Planning

### 1. Business Purpose
Per Part 12 §13: Forecasts Hiring, Retirement, Growth, Replacement, Contract Workforce. Strategic workforce planning.

### 2. Architectural Role
Strategic planning entity — connects business forecasts to workforce needs. Inputs from Finance (budget), Operations (production plans), and HR Analytics.

### 3. Business Rules
- Forecast horizons: 3 months, 6 months, 1 year, 3 years
- Forecast inputs: business growth, attrition prediction, retirement, skill obsolescence
- Forecast outputs: headcount needs by role, hiring plan, training plan, contract workforce
- Scenario planning: best/base/worst case scenarios
- AI-driven: based on historical patterns and business forecasts
- Linked to Recruitment (auto-creates requisitions)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `plan_code` | VARCHAR(30) | Yes | — | Unique per company × cycle | Code | Internal |
| `plan_name` | VARCHAR(100) | Yes | — | Min 5 | Name | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `plan_horizon_months` | INTEGER | Yes | — | 3, 6, 12, 36 | Horizon | Internal |
| `plan_start_date` | DATE | Yes | — | — | Plan start | Internal |
| `plan_end_date` | DATE | Yes | — | > plan_start_date | Plan end | Internal |
| `scenario_type` | ENUM | Yes | `BASE` | BEST, BASE, WORST | Scenario | Internal |
| `current_headcount` | INTEGER | Yes | — | ≥ 0 | Current | Internal |
| `forecast_headcount_end` | INTEGER | Yes | — | ≥ 0 | Forecast end | Internal |
| `forecast_hiring_count` | INTEGER | Yes | `0` | ≥ 0 | Hiring (per Part 12) | Internal |
| `forecast_retirement_count` | INTEGER | Yes | `0` | ≥ 0 | Retirement (per Part 12) | Internal |
| `forecast_attrition_count` | INTEGER | Yes | `0` | ≥ 0 | Attrition forecast | Internal |
| `forecast_growth_count` | INTEGER | Yes | `0` | ≥ 0 | Growth (per Part 12) | Internal |
| `forecast_replacement_count` | INTEGER | Yes | `0` | ≥ 0 | Replacement (per Part 12) | Internal |
| `forecast_contract_workforce` | INTEGER | Yes | `0` | ≥ 0 | Contract (per Part 12) | Internal |
| `department_wise_forecast` | JSONB | Yes | `'[]'` | — | Per-dept breakdown | Confidential |
| `role_wise_forecast` | JSONB | Yes | `'[]'` | — | Per-role breakdown | Confidential |
| `skill_gap_forecast` | JSONB | Yes | `'[]'` | — | Future skill gaps | Confidential |
| `training_plan_required` | JSONB | Yes | `'[]'` | — | Training implications | Internal |
| `budget_implication_amount` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost implication | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `ai_forecast_model_version` | VARCHAR(20) | Yes | — | — | Model version | Internal |
| `ai_confidence_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Confidence | Internal |
| `assumptions` | JSONB | Yes | `'[]'` | — | Forecast assumptions | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, IN_REVIEW, APPROVED, ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Job Requisition (411) | One-to-Many | 1:N | Auto-generated requisitions |
| Attrition Prediction (504) | One-to-One | 1:1 | Forecast input |
| AI Service | Service | — | Forecast model |

### 6. Indexes
- UNIQUE (`plan_code`)
- INDEX (`company_id`, `plan_horizon_months`, `status`)
- INDEX (`scenario_type`, `status`)

### 7. Security Classification
**Confidential** — budget implications are **Restricted**.

### 8. Integration Points
- **Workforce Intelligence** (FS-26): Forecast engine
- **AI Service**: ML forecast model
- **Recruitment Engine** (411): Auto-requisition generation
- **Finance** (Part 11): Budget alignment
- **Operations** (Parts 7-10): Demand forecast
- **Training Engine** (472): Training implications

### 9. Sample Data
```json
{
  "plan_code": "WP-2026-Q3-Q4", "plan_name": "Workforce Plan H2 2026",
  "company_id": "cmp-001", "plan_horizon_months": 6,
  "plan_start_date": "2026-07-01", "plan_end_date": "2026-12-31",
  "scenario_type": "BASE", "current_headcount": 250,
  "forecast_headcount_end": 275, "forecast_hiring_count": 35,
  "forecast_retirement_count": 4, "forecast_attrition_count": 18,
  "forecast_growth_count": 25, "forecast_replacement_count": 10,
  "forecast_contract_workforce": 15, "budget_implication_amount": 3500000.0000,
  "ai_forecast_model_version": "v4.2.0", "ai_confidence_score": 82.50,
  "status": "APPROVED"
}
```

### 10. Audit Events
`WORKFORCE_PLAN_CREATED`, `WORKFORCE_PLAN_UPDATED`, `WORKFORCE_PLAN_APPROVED`, `WORKFORCE_PLAN_AUTO_REQUISITIONS_GENERATED`, `WORKFORCE_PLAN_ARCHIVED`

---

## Entity 504 — Attrition Prediction

### 1. Business Purpose
Per Part 12 §13: AI predicts High Risk Employees, Reasons, Retention Actions. Machine learning-driven attrition forecasting.

### 2. Architectural Role
AI prediction entity — per-employee attrition risk scores. Feeds Talent Review (469) and Workforce Planning (503).

### 3. Business Rules
- Risk score: 0-100 (Higher = more likely to leave)
- Risk bands: LOW (0-30), MEDIUM (30-60), HIGH (60-80), CRITICAL (80-100)
- Prediction features: tenure, performance, salary vs benchmark, engagement, commute time, manager changes, training completion
- Refresh frequency: weekly (per-employee), monthly (cohort analysis)
- Reason explanation: SHAP values explain top contributing factors
- Retention action recommendations: AI-suggested actions per employee
- Confidentiality: restricted access (HR + manager of employee)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `prediction_code` | VARCHAR(30) | Yes | — | Unique per company × employee × cycle | Code | Internal |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Restricted |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `prediction_date` | DATE | Yes | — | — | Prediction date | Internal |
| `prediction_horizon_months` | INTEGER | Yes | `3` | 1, 3, 6, 12 | Horizon | Internal |
| `risk_score` | DECIMAL(5,2) | Yes | — | 0-100 | Risk score (per Part 12: "High Risk Employees") | Restricted |
| `risk_band` | ENUM | Yes | — | LOW, MEDIUM, HIGH, CRITICAL | Band | Restricted |
| `probability_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Probability of attrition | Restricted |
| `top_reasons` | JSONB | Yes | `'[]'` | — | Reasons (per Part 12: "Reasons") — top 5 SHAP factors | Restricted |
| `feature_contributions` | JSONB | Yes | `'{}'` | — | All feature contributions | Restricted |
| `recommended_retention_actions` | JSONB | Yes | `'[]'` | — | Retention Actions (per Part 12) | Restricted |
| `manager_visibility` | BOOLEAN | Yes | `true` | — | Visible to manager | Internal |
| `hr_visibility` | BOOLEAN | Yes | `true` | — | Visible to HR | Internal |
| `employee_aware` | BOOLEAN | Yes | `false` | — | Employee knows | Confidential |
| `action_taken` | JSONB | No | `'[]'` | — | Actions taken | Restricted |
| `action_taken_at` | TIMESTAMPTZ | No | NULL | — | Last action | Internal |
| `prediction_outcome` | ENUM | No | NULL | PENDING, RETAINED, RESIGNED, PROMOTED, TRANSFERRED | Outcome | Internal |
| `outcome_date` | DATE | No | NULL | — | Outcome date | Internal |
| `model_version` | VARCHAR(20) | Yes | — | — | Model version | Internal |
| `model_accuracy_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Model accuracy | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED, SUPERSEDED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Employee (381) | Many-to-One | N:1 | Employee |
| Talent Review (469) | One-to-One | 1:1 | Input to talent review |
| Workforce Planning (503) | Many-to-One | N:1 | Forecast input |
| AI Service | Service | — | ML model |

### 6. Indexes
- UNIQUE (`prediction_code`)
- INDEX (`employee_id`, `prediction_date`)
- INDEX (`risk_band`, `prediction_date`)
- INDEX (`prediction_date`, `status`)

### 7. Security Classification
**Restricted** — employee-specific attrition predictions.

### 8. Integration Points
- **AI/ML Service** (Foundation Service): Prediction model
- **Talent Review** (469): Risk input
- **Workforce Planning** (503): Forecast input
- **Notification Service**: High-risk alerts to HR
- **HR Mission Control** (509): Risk panel
- **Retention Action Workflow**: Action tracking

### 9. Sample Data
```json
{
  "prediction_code": "ATTR-PRED-2026-07-00012", "employee_id": "wf-001",
  "prediction_date": "2026-07-01", "prediction_horizon_months": 3,
  "risk_score": 72.50, "risk_band": "HIGH", "probability_pct": 68.00,
  "top_reasons": [
    { "feature": "salary_vs_market", "contribution": 18.5, "direction": "negative" },
    { "feature": "tenure_years", "contribution": 12.3, "direction": "negative" },
    { "feature": "manager_changes_12m", "contribution": 10.8, "direction": "negative" }
  ],
  "recommended_retention_actions": [
    { "action": "Salary correction to market benchmark", "priority": "HIGH", "est_cost": 150000 },
    { "action": "Career conversation with skip-level", "priority": "MEDIUM" }
  ],
  "model_version": "v5.1.0", "model_accuracy_pct": 87.50,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`ATTRITION_PREDICTION_GENERATED`, `ATTRITION_PREDICTION_ESCALATED`, `ATTRITION_RETENTION_ACTION_TAKEN`, `ATTRITION_PREDICTION_OUTCOME_RECORDED`, `ATTRITION_PREDICTION_SUPERSEDED`

---

## Entity 505 — AI HR Copilot

### 1. Business Purpose
Per Part 12 §13: Supports Natural Language. Per Part 12 examples: "Who should be promoted?", "Who is absent today?", "Who needs forklift certification?", "Who has expired food safety training?", "Which warehouse needs more operators?".

### 2. Architectural Role
Foundation Service #27 (locked in this Part). Natural-language HR query interface powered by LLM + HR knowledge graph + RAG over HR data.

### 3. Business Rules
- Natural language: free-text queries in multiple languages (English, Hindi, Marathi, Tamil)
- Query types: WHO (employee lookup), WHAT (KPI lookups), WHEN (events), WHERE (location-based), WHY (analytics), FORECAST (predictions)
- Response format: text summary + structured data + chart visualizations
- Access control: query results respect RBAC (manager sees only team data)
- Audit trail: all queries + responses logged
- Confidence score: AI indicates confidence level
- Hallucination prevention: RAG-only — no generation beyond retrieved data
- Sensitive data: never reveals Restricted data; redirects to HR

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `query_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `user_id` | UUID | Yes | — | FK to `workforce_master` | User | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `query_text` | TEXT | Yes | — | Min 3 | User query | Confidential |
| `query_language` | VARCHAR(10) | Yes | `en` | ISO code | Language | Internal |
| `query_type` | ENUM | No | NULL | WHO, WHAT, WHEN, WHERE, WHY, FORECAST, COMPARISON, OTHER | Detected type | Internal |
| `query_intent` | VARCHAR(50) | No | NULL | — | Detected intent | Internal |
| `query_entities` | JSONB | Yes | `'[]'` | — | Extracted entities | Internal |
| `context_session_id` | UUID | No | NULL | — | Conversation session | Internal |
| `previous_query_id` | UUID | No | NULL | FK to `ai_hr_copilot` | Context | Internal |
| `rag_retrieval` | JSONB | Yes | `'{}'` | — | Retrieved sources | Internal |
| `response_text` | TEXT | Yes | — | — | AI response | Confidential |
| `response_data` | JSONB | Yes | `'{}'` | — | Structured data | Confidential |
| `response_visualizations` | JSONB | No | `'[]'` | — | Charts/graphs | Internal |
| `confidence_score` | DECIMAL(5,2) | Yes | — | 0-100 | AI confidence | Internal |
| `access_control_applied` | BOOLEAN | Yes | `true` | — | RBAC filter applied | Internal |
| `restricted_data_redacted` | BOOLEAN | Yes | `false` | — | Sensitive redacted | Internal |
| `model_version` | VARCHAR(20) | Yes | — | — | LLM version | Internal |
| `response_time_ms` | INTEGER | Yes | — | ≥ 0 | Response time | Internal |
| `user_feedback_rating` | INTEGER | No | NULL | 1-5 | Feedback | Internal |
| `user_feedback_text` | TEXT | No | NULL | — | Feedback | Confidential |
| `follow_up_suggestions` | JSONB | Yes | `'[]'` | — | Suggested next queries | Internal |
| `channel` | ENUM | Yes | `WEB` | WEB, MOBILE_APP, VOICE, API | Channel | Internal |
| `voice_transcription` | TEXT | No | NULL | — | If voice input | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | PROCESSING, COMPLETED, FAILED, REJECTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workforce Master (381) | Many-to-One | N:1 | User |
| AI HR Copilot (self) | Self-reference | N:1 | Previous query |
| All HR modules (381-510) | Service | — | Query source |
| LLM Service | Service | — | AI inference |

### 6. Indexes
- UNIQUE (`query_code`)
- INDEX (`user_id`, `created_at`)
- INDEX (`query_type`, `status`)
- INDEX (`context_session_id`)

### 7. Security Classification
**Confidential** — queries may contain sensitive HR questions.

### 8. Integration Points
- **LLM Service** (Foundation Service): AI inference
- **RAG Service**: Knowledge retrieval
- **Workforce Intelligence** (FS-26): Data source
- **All HR modules** (381-510): Queryable
- **Voice Service**: Voice input
- **Audit Service**: Query logging
- **HR Mission Control** (509): Embedded copilot

### 9. Sample Data
```json
{
  "query_code": "COPILOT-Q-2026-07-00012", "user_id": "wf-200",
  "company_id": "cmp-001",
  "query_text": "Who has expired food safety training in Mumbai factory?",
  "query_language": "en", "query_type": "WHO",
  "query_intent": "expired_certification_lookup",
  "query_entities": [{ "type": "certification", "value": "food_safety" }, { "type": "facility", "value": "mumbai_factory" }],
  "response_text": "3 employees have expired FSSAI certification at Mumbai factory: John Doe (expired 2026-06-15), Jane Smith (2026-06-20), Raj Patel (2026-07-01). Renewal assignments have been auto-generated.",
  "response_data": { "employees": [{ "id": "wf-005", "name": "John Doe", "expired_date": "2026-06-15" }] },
  "confidence_score": 95.00, "model_version": "glm-4.6",
  "response_time_ms": 1850, "status": "COMPLETED"
}
```

### 10. Audit Events
`COPILOT_QUERY_RECEIVED`, `COPILOT_QUERY_PROCESSED`, `COPILOT_QUERY_FAILED`, `COPILOT_QUERY_REJECTED`, `COPILOT_FEEDBACK_RECEIVED`, `COPILOT_RESTRICTED_DATA_REDACTED`

---

## Entity 506 — Succession Planning

### 1. Business Purpose
Per Part 12 §13: Stores Critical Role, Successor, Readiness, Risk. Succession planning for business continuity.

### 2. Architectural Role
Strategic planning entity — identifies critical roles, succession candidates, readiness levels. Linked to Talent Review (469) and Workforce Planning (503).

### 3. Business Rules
- Critical role identification: based on impact, scarcity, strategic importance
- Successor candidates: 3+ per critical role (READY NOW, 1-2 YEARS, 3+ YEARS)
- Risk assessment: if no READY NOW successor → HIGH risk
- Development plan: gap-filling actions per successor
- Annual review: succession plan reviewed at appraisal cycle
- Confidentiality: restricted to leadership + HR

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `succession_code` | VARCHAR(30) | Yes | — | Unique per company × role × cycle | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `critical_role_id` | UUID | Yes | — | FK to `position_masters` (Entity 393) | Critical Role (per Part 12) | Internal |
| `critical_role_name` | VARCHAR(200) | Yes | — | — | Denormalized | Internal |
| `current_incumbent_id` | UUID | No | NULL | FK to `workforce_master` | Current incumbent | Restricted |
| `incumbent_retirement_date` | DATE | No | NULL | — | Planned retirement | Restricted |
| `incumbent_flight_risk` | ENUM | No | NULL | LOW, MEDIUM, HIGH | Risk | Restricted |
| `successor_candidates` | JSONB | Yes | `'[]'` | — | Successor (per Part 12) — array of `{ employee_id, readiness, gap, development_plan }` | Restricted |
| `ready_now_count` | INTEGER | Yes | `0` | ≥ 0 | Ready now | Internal |
| `ready_1_2_years_count` | INTEGER | Yes | `0` | ≥ 0 | Ready 1-2 years | Internal |
| `ready_3_plus_years_count` | INTEGER | Yes | `0` | ≥ 0 | Ready 3+ years | Internal |
| `succession_risk` | ENUM | Yes | — | LOW, MEDIUM, HIGH, CRITICAL | Risk (per Part 12) | Restricted |
| `succession_risk_reason` | TEXT | No | NULL | — | Reason | Restricted |
| `development_plans` | JSONB | Yes | `'[]'` | — | Per-successor dev plan | Restricted |
| `review_cycle` | VARCHAR(20) | Yes | — | e.g., `2026-ANNUAL` | Cycle | Internal |
| `reviewed_by` | UUID | Yes | — | FK to `workforce_master` | Reviewer | Restricted |
| `reviewed_at` | TIMESTAMPTZ | Yes | `now()` | — | Review time | Internal |
| `ai_successor_recommendations` | JSONB | No | NULL | — | AI-recommended successors | Restricted |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, REVIEWED, FINALIZED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Position Master (393) | Many-to-One | N:1 | Critical role |
| Workforce Master (381) | Many-to-One | N:1 | Incumbent + candidates |
| Talent Review (469) | Many-to-Many | N:N | Successor candidates |
| Workforce Planning (503) | Many-to-One | N:1 | Linked plan |

### 6. Indexes
- UNIQUE (`succession_code`)
- INDEX (`company_id`, `review_cycle`, `status`)
- INDEX (`succession_risk`, `status`)
- INDEX (`critical_role_id`)

### 7. Security Classification
**Restricted** — leadership-only succession data.

### 8. Integration Points
- **Performance Engine** (FS-22): Talent review input
- **AI Service**: Successor recommendations
- **LMS Engine** (FS-23): Development plans
- **Workforce Planning** (503): Succession risk input
- **Executive Scorecard** (510): Succession coverage

### 9. Sample Data
```json
{
  "succession_code": "SUCC-2026-PLANT-MGR-MUMBAI",
  "critical_role_name": "Plant Manager - Mumbai",
  "current_incumbent_id": "wf-050",
  "incumbent_retirement_date": "2028-03-31",
  "incumbent_flight_risk": "LOW",
  "successor_candidates": [
    { "employee_id": "wf-100", "readiness": "READY_NOW", "gap": [], "development_plan": [] },
    { "employee_id": "wf-110", "readiness": "READY_1_2_YEARS", "gap": ["Strategic leadership", "P&L management"], "development_plan": ["Executive coaching", "P&L training"] },
    { "employee_id": "wf-120", "readiness": "READY_3_PLUS_YEARS", "gap": ["Cross-functional experience", "People management"], "development_plan": ["Cross-dept rotation", "Mentor program"] }
  ],
  "ready_now_count": 1, "ready_1_2_years_count": 1, "ready_3_plus_years_count": 1,
  "succession_risk": "LOW", "review_cycle": "2026-ANNUAL",
  "status": "FINALIZED"
}
```

### 10. Audit Events
`SUCCESSION_PLAN_DRAFTED`, `SUCCESSION_PLAN_REVIEWED`, `SUCCESSION_PLAN_FINALIZED`, `SUCCESSION_PLAN_RISK_ESCALATED`, `SUCCESSION_PLAN_ARCHIVED`

---

## Entity 507 — Workforce Heat Map

### 1. Business Purpose
Per Part 12 §13: Displays Skill Distribution, Department Strength, Performance, Attrition Risk. Visual heatmap of workforce health.

### 2. Architectural Role
Visualization entity — powers HR Mission Control heat map panel. Multi-dimensional (skill × department, performance × risk).

### 3. Business Rules
- Heat map dimensions: SKILL_DISTRIBUTION, DEPARTMENT_STRENGTH, PERFORMANCE, ATTRITION_RISK, DIVERSITY, ENGAGEMENT
- Color scale: green (healthy) → amber (warning) → red (critical)
- Drill-down: from company → facility → department → team
- Real-time: refresh every 15 minutes
- Comparative: vs previous period, vs target

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `heatmap_code` | VARCHAR(30) | Yes | — | Unique per company × date × dimension | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `heatmap_dimension` | ENUM | Yes | — | SKILL_DISTRIBUTION, DEPARTMENT_STRENGTH, PERFORMANCE, ATTRITION_RISK, DIVERSITY, ENGAGEMENT | Dimension (per Part 12) | Internal |
| `heatmap_scope` | ENUM | Yes | `COMPANY` | COMPANY, FACILITY, DEPARTMENT | Scope | Internal |
| `scope_entity_id` | UUID | Yes | — | — | Scope entity | Internal |
| `heatmap_matrix` | JSONB | Yes | `'[]'` | — | 2D matrix of values + colors | Confidential |
| `x_axis_label` | VARCHAR(100) | Yes | — | — | X-axis | Internal |
| `y_axis_label` | VARCHAR(100) | Yes | — | — | Y-axis | Internal |
| `color_scale_config` | JSONB | Yes | `'{}'` | — | Color thresholds | Internal |
| `critical_cells` | JSONB | Yes | `'[]'` | — | Cells flagged critical | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI insights on heatmap | Confidential |
| `comparative_previous_period` | JSONB | Yes | `'{}'` | — | Variance | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Workforce Intelligence (FS-26) | Service | — | Source |

### 6. Indexes
- UNIQUE (`heatmap_code`)
- INDEX (`company_id`, `snapshot_date`, `heatmap_dimension`)
- INDEX (`heatmap_scope`, `snapshot_date`)

### 7. Security Classification
**Confidential** — performance and attrition data are **Restricted**.

### 8. Integration Points
- **Workforce Intelligence** (FS-26): Aggregation
- **AI Service**: Insights
- **HR Mission Control** (509): Heat map panel
- **Executive Scorecard** (510): Visual rollup

### 9. Sample Data
```json
{
  "heatmap_code": "HEATMAP-2026-07-07-SKILL-CMP001",
  "company_id": "cmp-001", "snapshot_date": "2026-07-07",
  "heatmap_dimension": "SKILL_DISTRIBUTION", "heatmap_scope": "COMPANY",
  "scope_entity_id": "cmp-001",
  "x_axis_label": "Department", "y_axis_label": "Skill",
  "heatmap_matrix": [
    { "row": "Forklift Operation", "cells": [{ "col": "Warehouse", "value": 95, "color": "green" }, { "col": "Manufacturing", "value": 45, "color": "amber" }] },
    { "row": "FSSAI Certification", "cells": [{ "col": "Restaurant", "value": 92, "color": "green" }, { "col": "Manufacturing", "value": 88, "color": "green" }] }
  ],
  "critical_cells": [{ "row": "HACCP", "col": "Warehouse", "value": 25, "color": "red" }],
  "status": "COMPLETED"
}
```

### 10. Audit Events
`HEATMAP_SNAPSHOT_CREATED`, `HEATMAP_CRITICAL_CELL_DETECTED`, `HEATMAP_AI_INSIGHT_REFRESHED`

---

## Entity 508 — Labor Cost Analytics

### 1. Business Purpose
Per Part 12 §13: Measures Payroll, Overtime, Benefits, Training Cost, Cost Per Employee. Comprehensive labor cost analytics.

### 2. Architectural Role
Analytics entity — powers Finance + HR cost analytics. Integrates with Finance Cube (Part 11).

### 3. Business Rules
- Cost components: PAYROLL, OVERTIME, BENEFITS, TRAINING_COST, STATUTORY_CONTRIBUTIONS, RECRUITMENT_COST, SEPARATION_COST
- Cost per employee: total cost / headcount
- Cost per unit produced: labor cost / production volume (manufacturing)
- Cost per revenue: labor cost / revenue (retail, restaurant)
- Trend: 12-month trend with forecast
- Variance: vs budget, vs previous period, vs industry benchmark

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `analytics_code` | VARCHAR(30) | Yes | — | Unique per company × period | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `analytics_period_type` | ENUM | Yes | `MONTHLY` | MONTHLY, QUARTERLY, HALF_YEARLY, YEARLY | Period | Internal |
| `period_start_date` | DATE | Yes | — | — | Period start | Internal |
| `period_end_date` | DATE | Yes | — | > period_start_date | Period end | Internal |
| `analytics_scope` | ENUM | Yes | `COMPANY` | COMPANY, FACILITY, DEPARTMENT | Scope | Internal |
| `scope_entity_id` | UUID | Yes | — | — | Scope entity | Internal |
| `payroll_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Payroll (per Part 12) | Restricted |
| `overtime_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Overtime (per Part 12) | Restricted |
| `benefits_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Benefits (per Part 12) | Restricted |
| `training_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Training Cost (per Part 12) | Restricted |
| `statutory_contributions_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | PF+ESIC+Gratuity employer | Restricted |
| `recruitment_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Hiring cost | Restricted |
| `separation_cost_total` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Separation cost | Restricted |
| `total_labor_cost` | DECIMAL(18,4) | Yes | — | ≥ 0 | Total | Restricted |
| `headcount_avg` | INTEGER | Yes | `0` | ≥ 0 | Avg headcount | Internal |
| `cost_per_employee` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost Per Employee (per Part 12) | Restricted |
| `cost_per_unit_produced` | DECIMAL(18,4) | No | NULL | ≥ 0 | Manufacturing | Restricted |
| `cost_per_revenue_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Cost / revenue | Restricted |
| `budget_variance_pct` | DECIMAL(5,2) | Yes | `0` | — | Variance | Restricted |
| `previous_period_variance_pct` | DECIMAL(5,2) | Yes | `0` | — | YoY variance | Restricted |
| `industry_benchmark_variance_pct` | DECIMAL(5,2) | Yes | `0` | — | Vs industry | Restricted |
| `cost_breakdown_by_department` | JSONB | Yes | `'[]'` | — | Per-dept | Restricted |
| `cost_breakdown_by_grade` | JSONB | Yes | `'[]'` | — | Per-grade | Restricted |
| `cost_trend_12_months` | JSONB | Yes | `'[]'` | — | 12-month trend | Restricted |
| `ai_forecast` | JSONB | No | NULL | — | Next-quarter forecast | Restricted |
| `ai_optimization_recommendations` | JSONB | No | `'[]'` | — | AI: cost optimization | Restricted |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| Payroll Master (451) | Many-to-One | N:1 | Source |
| Finance Cube (Part 11) | Service | — | Cost analytics |

### 6. Indexes
- UNIQUE (`analytics_code`)
- INDEX (`company_id`, `period_start_date`, `analytics_scope`)
- INDEX (`analytics_scope`, `period_start_date`)

### 7. Security Classification
**Restricted** — comprehensive cost data.

### 8. Integration Points
- **Finance Cube** (Part 11): Cost integration
- **Payroll Engine** (451): Cost source
- **AI Service**: Forecast + optimization
- **HR Mission Control** (509): Cost panel
- **Executive Scorecard** (510): Cost rollup

### 9. Sample Data
```json
{
  "analytics_code": "LCA-cmp001-2026-07", "company_id": "cmp-001",
  "analytics_period_type": "MONTHLY",
  "period_start_date": "2026-07-01", "period_end_date": "2026-07-31",
  "analytics_scope": "COMPANY", "scope_entity_id": "cmp-001",
  "payroll_cost_total": 12500000.0000, "overtime_cost_total": 250000.0000,
  "benefits_cost_total": 800000.0000, "training_cost_total": 75000.0000,
  "statutory_contributions_total": 1850000.0000,
  "total_labor_cost": 15475000.0000, "headcount_avg": 250,
  "cost_per_employee": 61900.0000, "cost_per_revenue_pct": 18.50,
  "budget_variance_pct": 2.50, "previous_period_variance_pct": 5.00,
  "status": "COMPLETED"
}
```

### 10. Audit Events
`LABOR_COST_ANALYTICS_GENERATED`, `LABOR_COST_VARIANCE_ALERTED`, `LABOR_COST_FORECAST_REFRESHED`, `LABOR_COST_OPTIMIZATION_RECOMMENDED`

---

## Entity 509 — HR Mission Control

### 1. Business Purpose
Per Part 12 §13: Displays Recruitment, Attendance, Payroll, Performance, Training, Attrition, Compliance, Alerts, AI. The unified HR operations command center.

### 2. Architectural Role
Command center entity — single-page dashboard for HR operations team. Real-time + AI-driven. Integrates all HR modules.

### 3. Business Rules
- Real-time panels: recruitment, attendance, payroll status, alerts
- AI panels: attrition prediction, hiring recommendations, skill forecast, labor optimization, succession intelligence
- Alert management: severity-based (CRITICAL/HIGH/MEDIUM/LOW) with acknowledgment workflow
- Multi-facility: switch between facilities/companies
- Customizable: HR admin can configure panels per role
- Mobile: limited mobile version for on-call HR

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `mission_control_code` | VARCHAR(30) | Yes | — | Unique per company × date | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `recruitment_panel` | JSONB | Yes | `'{}'` | — | Recruitment (per Part 12) | Internal |
| `attendance_panel` | JSONB | Yes | `'{}'` | — | Attendance (per Part 12) | Internal |
| `payroll_panel` | JSONB | Yes | `'{}'` | — | Payroll (per Part 12) | Confidential |
| `performance_panel` | JSONB | Yes | `'{}'` | — | Performance (per Part 12) | Confidential |
| `training_panel` | JSONB | Yes | `'{}'` | — | Training (per Part 12) | Internal |
| `attrition_panel` | JSONB | Yes | `'{}'` | — | Attrition (per Part 12) | Restricted |
| `compliance_panel` | JSONB | Yes | `'{}'` | — | Compliance (per Part 12) | Confidential |
| `alerts_panel` | JSONB | Yes | `'[]'` | — | Alerts (per Part 12) | Confidential |
| `ai_panels` | JSONB | Yes | `'{}'` | — | AI (per Part 12) | Confidential |
| `ai_attrition_prediction` | JSONB | No | NULL | — | Attrition prediction | Restricted |
| `ai_hiring_recommendation` | JSONB | No | NULL | — | Hiring recommendations | Confidential |
| `ai_skill_forecast` | JSONB | No | NULL | — | Skill forecast | Confidential |
| `ai_labor_optimization` | JSONB | No | NULL | — | Labor optimization | Confidential |
| `ai_workforce_planning` | JSONB | No | NULL | — | Workforce planning | Confidential |
| `ai_succession_intelligence` | JSONB | No | NULL | — | Succession intelligence | Restricted |
| `critical_alerts_count` | INTEGER | Yes | `0` | ≥ 0 | Critical | Internal |
| `high_alerts_count` | INTEGER | Yes | `0` | ≥ 0 | High | Internal |
| `medium_alerts_count` | INTEGER | Yes | `0` | ≥ 0 | Medium | Internal |
| `low_alerts_count` | INTEGER | Yes | `0` | ≥ 0 | Low | Internal |
| `alerts_acknowledged_count` | INTEGER | Yes | `0` | ≥ 0 | Acknowledged | Internal |
| `ai_copilot_embedded` | BOOLEAN | Yes | `true` | — | Copilot widget | Internal |
| `custom_layout_id` | UUID | No | NULL | FK to `dashboard_layouts` | Custom layout | Internal |
| `last_refreshed_at` | TIMESTAMPTZ | Yes | `now()` | — | Refresh time | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| All HR modules (381-510) | Aggregation | — | Source |
| AI HR Copilot (505) | Service | — | Embedded |
| Workforce Intelligence (FS-26) | Service | — | Source |

### 6. Indexes
- UNIQUE (`mission_control_code`)
- INDEX (`company_id`, `snapshot_date`)

### 7. Security Classification
**Confidential** — attrition panel is **Restricted**.

### 8. Integration Points
- **All HR modules** (381-508): Aggregation source
- **AI HR Copilot** (505): Embedded widget
- **Workforce Intelligence** (FS-26): Analytics
- **Notification Service**: Alert routing
- **Mobile App**: Limited mobile version

### 9. Sample Data
```json
{
  "mission_control_code": "MC-cmp001-2026-07-07", "company_id": "cmp-001",
  "snapshot_date": "2026-07-07",
  "recruitment_panel": { "open_positions": 12, "in_pipeline": 45, "joining_this_week": 3 },
  "attendance_panel": { "present_today_pct": 91.67, "absent": 10, "on_leave": 15 },
  "payroll_panel": { "current_cycle_status": "PROCESSING", "pay_date": "2026-08-05" },
  "performance_panel": { "reviews_pending": 8, "cycle": "2026-Annual" },
  "training_panel": { "completion_rate_pct": 78.5, "overdue_count": 12 },
  "attrition_panel": { "ytd_attrition_pct": 8.5, "high_risk_employees": 15 },
  "compliance_panel": { "pf_filed": true, "esic_filed": true, "tds_filed": true },
  "alerts_panel": [
    { "severity": "CRITICAL", "type": "CRITICAL_VACANCY", "message": "Plant Manager vacant 30 days" },
    { "severity": "HIGH", "type": "CERT_EXPIRY", "message": "12 FSSAI certs expiring in 30 days" }
  ],
  "critical_alerts_count": 1, "high_alerts_count": 1,
  "ai_copilot_embedded": true, "last_refreshed_at": "2026-07-07T10:30:00Z",
  "status": "ACTIVE"
}
```

### 10. Audit Events
`MISSION_CONTROL_VIEWED`, `MISSION_CONTROL_REFRESHED`, `MISSION_CONTROL_ALERT_ACKNOWLEDGED`, `MISSION_CONTROL_ALERT_ESCALATED`, `MISSION_CONTROL_AI_INSIGHT_TRIGGERED`

---

## Entity 510 — Executive Workforce Scorecard

### 1. Business Purpose
Per Part 12 §13: Measures Productivity, Retention, Training, Engagement, Payroll, Hiring, Overall Workforce Health. C-suite executive dashboard.

### 2. Architectural Role
Executive view entity — single-page scorecard for CEO/CFO/CHRO. Aggregates all HR KPIs into executive-level metrics.

### 3. Business Rules
- Executive metrics per Part 12: Productivity, Retention, Training, Engagement, Payroll, Hiring, Overall Workforce Health
- Score format: red/amber/green per metric, with trend arrow
- Refresh: daily snapshot + on-demand refresh
- Comparative: vs target, vs previous period, vs industry benchmark
- Drill-down: from scorecard → HR Mission Control → detailed analytics
- Confidentiality: C-suite + HR Head only
- Export: PDF for board meetings

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `scorecard_code` | VARCHAR(30) | Yes | — | Unique per company × date | Code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `period_type` | ENUM | Yes | `MONTHLY` | MONTHLY, QUARTERLY, YEARLY | Period | Internal |
| `productivity_score` | JSONB | Yes | `'{}'` | — | Productivity (per Part 12) | Confidential |
| `retention_score` | JSONB | Yes | `'{}'` | — | Retention (per Part 12) | Restricted |
| `training_score` | JSONB | Yes | `'{}'` | — | Training (per Part 12) | Internal |
| `engagement_score` | JSONB | Yes | `'{}'` | — | Engagement (per Part 12) | Confidential |
| `payroll_score` | JSONB | Yes | `'{}'` | — | Payroll (per Part 12) | Restricted |
| `hiring_score` | JSONB | Yes | `'{}'` | — | Hiring (per Part 12) | Internal |
| `overall_workforce_health` | JSONB | Yes | `'{}'` | — | Overall (per Part 12) | Confidential |
| `overall_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Composite score | Confidential |
| `overall_health_band` | ENUM | Yes | `AMBER` | RED, AMBER, GREEN | Band | Confidential |
| `overall_health_trend` | ENUM | Yes | `STABLE` | UP, STABLE, DOWN | Trend | Internal |
| `target_variance_summary` | JSONB | Yes | `'{}'` | — | Vs target | Confidential |
| `industry_benchmark_summary` | JSONB | Yes | `'{}'` | — | Vs industry | Confidential |
| `previous_period_variance_summary` | JSONB | Yes | `'{}'` | — | YoY | Confidential |
| `ai_executive_insights` | JSONB | No | NULL | — | AI insights | Confidential |
| `ai_strategic_recommendations` | JSONB | No | `'[]'` | — | Strategic actions | Restricted |
| `drilldown_links` | JSONB | Yes | `'{}'` | — | Links to detailed dashboards | Internal |
| `export_pdf_id` | UUID | No | NULL | FK to `documents` | Latest PDF export | Confidential |
| `viewed_by_executives` | UUID[] | No | `ARRAY[]::UUID[]` | — | View log | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Company | Many-to-One | N:1 | Company |
| HR Mission Control (509) | One-to-One | 1:1 | Drilldown target |
| HR KPI Library (501) | Many-to-Many | N:N | Source KPIs |

### 6. Indexes
- UNIQUE (`scorecard_code`)
- INDEX (`company_id`, `snapshot_date`)
- INDEX (`period_type`, `snapshot_date`)

### 7. Security Classification
**Restricted** — C-suite only data.

### 8. Integration Points
- **Workforce Intelligence** (FS-26): Aggregation
- **AI Service**: Executive insights
- **HR Mission Control** (509): Drilldown target
- **Document Service**: PDF export
- **Board Reporting**: Board deck integration
- **Executive Portal**: C-suite access

### 9. Sample Data
```json
{
  "scorecard_code": "EXEC-SCORE-cmp001-2026-07", "company_id": "cmp-001",
  "snapshot_date": "2026-07-31", "period_type": "MONTHLY",
  "productivity_score": { "value": 87.5, "target": 85, "band": "GREEN", "trend": "UP" },
  "retention_score": { "value": 91.5, "target": 90, "band": "GREEN", "trend": "UP" },
  "training_score": { "value": 78.5, "target": 80, "band": "AMBER", "trend": "STABLE" },
  "engagement_score": { "value": 4.2, "target": 4.0, "band": "GREEN", "trend": "UP", "scale": "5" },
  "payroll_score": { "value": 18.5, "target": 20, "band": "GREEN", "trend": "DOWN", "metric": "cost_pct_of_revenue" },
  "hiring_score": { "value": 32, "target": 30, "band": "GREEN", "trend": "UP", "metric": "time_to_hire_days" },
  "overall_health_score": 87.50, "overall_health_band": "GREEN", "overall_health_trend": "UP",
  "status": "COMPLETED"
}
```

### 10. Audit Events
`EXEC_SCORECARD_GENERATED`, `EXEC_SCORECARD_VIEWED`, `EXEC_SCORECARD_EXPORTED`, `EXEC_SCORECARD_INSIGHT_REFRESHED`, `EXEC_SCORECARD_ALERT_TRIGGERED`

---

# Part 12 Sections 11-13 Completion Summary

**All 30 ESS/MSS/HR Analytics entities are now defined** at full enterprise-grade depth.

### Architectural Decisions Locked

#### Section 11 (ESS) — 10 entities
1. **ESS Platform (FS-24)** — Foundation Service for employee self-service: mobile-first, offline-capable
2. **Employee Portal** — SSO-based unified entry point
3. **Payslip (ESS)** — Password-protected PDF, 7-year history
4. **Leave Request (ESS)** — Quick-submit, sandwich preview, offline sync
5. **Attendance View (ESS)** — Regularization requests, geofence clock-in
6. **Expense Claim (ESS)** — OCR bill extraction, multi-currency
7. **Loan Request (ESS)** — Eligibility check, EMI calculator
8. **Profile Update (ESS)** — Material vs non-material change workflow
9. **Document Download (ESS)** — Watermarked, QR-verified, audit-logged
10. **Training Portal (ESS)** — AI recommendations, offline content
11. **ESS Dashboard** — Multi-channel (Mobile/Tablet/Desktop), offline-capable

#### Section 12 (MSS) — 10 entities
12. **MSS Platform (FS-25)** — Foundation Service for manager self-service: approval workflows + team analytics
13. **Manager Dashboard** — Aggregated approvals + team status + AI insights + voice approval
14. **Attendance Approval** — Auto-approval rules + bulk approval
15. **Leave Approval** — Calendar context + coverage check + delegation
16. **Expense Approval** — Policy compliance check + partial approval + multi-level routing
17. **Recruitment Approval** — Requisition/Selection/Offer stages
18. **Performance Approval** — Review assessment + OKR signoff + calibration
19. **Transfer Approval** — Dual-manager (current + receiving) chain
20. **Promotion Approval** — Multi-level (Manager → Dept Head → HR → Comp Committee → CEO)
21. **Organization Analytics** — Headcount, span, diversity, age, tenure
22. **Manager KPI Dashboard** — Department/Team/Projects/Budget/Performance scopes

#### Section 13 (HR Analytics, AI Copilot, Mission Control) — 10 entities
23. **Enterprise Workforce Intelligence (FS-26)** — Foundation Service for unified HR analytics
24. **AI HR Copilot (FS-27)** — Foundation Service: NL HR query interface (RAG-powered, hallucination-prevented)
25. **HR KPI Library** — 10+ HR-specific KPIs with industry benchmarks
26. **HR Dashboard** — Multi-grain operational dashboard
27. **Workforce Planning** — Multi-horizon (3m/6m/1y/3y) with scenario planning
28. **Attrition Prediction** — ML-driven risk scoring with SHAP explanations
29. **AI HR Copilot** — NL queries: WHO/WHAT/WHEN/WHERE/WHY/FORECAST; multi-language; RBAC-aware
30. **Succession Planning** — Critical role identification + 3+ successors per role
31. **Workforce Heat Map** — Multi-dimensional (Skill/Dept/Performance/Attrition/Diversity/Engagement)
32. **Labor Cost Analytics** — 7 cost components + per-employee/unit/revenue metrics
33. **HR Mission Control** — Unified command center with 9 panels + AI Copilot embedded
34. **Executive Workforce Scorecard** — C-suite dashboard with 7 metrics + Overall Workforce Health

### Foundation Service Count Update

- **Previous**: 23 Foundation Services (FS-1 through FS-23, including FS-22 Performance Engine + FS-23 LMS from Batch 4 first file)
- **Added in Part 12 Batch 4 (Sec 11-13)**: FS-24 (ESS Platform), FS-25 (MSS Platform), FS-26 (Enterprise Workforce Intelligence), FS-27 (AI HR Copilot)
- **Current Total**: **27 Foundation Services**

---

# 🎉 PART 12 CLOSEOUT SUMMARY — ENTERPRISE WORKFORCE MANAGEMENT COMPLETE

## Part 12 Statistics

| Metric | Value |
|---|---|
| Part | 12 — Enterprise Workforce Management (EWM) |
| Sections | 13 |
| Entities | **130** (381-510) |
| Batches | 4 |
| Status | ✅ COMPLETE |
| Architecture | LOCKED |
| Implementation Ready | YES |

## Batch-by-Batch Summary

| Batch | Sections | Entities | Count | Status |
|---|---|---|---|---|
| Batch 1 | 1-3 (Foundation, Org Lifecycle, Positions, Grades, Departments) | 381-410 | 30 | ✅ COMPLETE |
| Batch 2 | 4-6 (Recruitment, Onboarding, Attendance, Scheduling) | 411-440 | 30 | ✅ COMPLETE |
| Batch 3 | 7-8 (Leave Management, Payroll, Benefits, Loans, Statutory) | 441-460 | 20 | ✅ COMPLETE |
| Batch 4 | 9-13 (Performance, LMS, ESS, MSS, HR Analytics) | 461-510 | 50 | ✅ COMPLETE |
| **Total** | **13 Sections** | **381-510** | **130** | **✅ COMPLETE** |

## Part 12 Module Coverage

### 1. Workforce Foundation
- Workforce Master, Organization Structure, Positions, Grades, Departments, Employee Lifecycle

### 2. Talent Acquisition
- Recruitment, ATS, Interview Management, Offers, Background Verification

### 3. Workforce Operations
- Attendance, Shift Planning, Leave, Payroll, Benefits, Loans, Reimbursements, Statutory Compliance

### 4. Talent Development
- Performance Management, KPIs, OKRs, Appraisals, LMS, Skills Matrix, Certifications, Succession Planning

### 5. Employee Experience
- Employee Self-Service (ESS), Manager Self-Service (MSS)

### 6. Executive Intelligence
- HR Analytics, Workforce Planning, AI HR Copilot, HR Mission Control, Executive Workforce Scorecard

## Foundation Services Added in Part 12

| ID | Service | Section |
|---|---|---|
| FS-20 | Enterprise Workforce Scheduling Engine | Sec 6 (Batch 2) |
| FS-21 | Compensation Rules Engine | Sec 8 (Batch 3) |
| FS-22 | Enterprise Performance Engine | Sec 9 (Batch 4) |
| FS-23 | Enterprise LMS | Sec 10 (Batch 4) |
| FS-24 | ESS Platform | Sec 11 (Batch 4) |
| FS-25 | MSS Platform | Sec 12 (Batch 4) |
| FS-26 | Enterprise Workforce Intelligence | Sec 13 (Batch 4) |
| FS-27 | AI HR Copilot | Sec 13 (Batch 4) |

**Total Foundation Services Added in Part 12**: 8 (FS-20 through FS-27)

## Architectural Decisions in Part 12

- **Q155-Q160**: Workforce Foundation (Sec 1-3, Batch 1)
- **Q161**: Compensation Rules Engine (Sec 8, Batch 3)
- **Q162-Q170**: Performance, LMS, ESS, MSS, HR Analytics locks (Sec 9-13, Batch 4)

## Cross-Module Integration

### HR as Consumer (Inputs from)
| Source Module | Data Flow |
|---|---|
| Manufacturing (Part 7) | Production KPIs, machine skills, OEE |
| Warehouse (Part 6) | Warehouse KPIs, machine skills |
| Retail (Part 9) | Retail KPIs, POS training |
| Restaurant (Part 10) | Restaurant KPIs, F&B certifications |
| Quality (Part 8) | Quality KPIs, food safety compliance |
| Finance (Part 11) | Salary budget, cost analytics |

### HR as Provider (Outputs to)
| Target Module | Data Flow |
|---|---|
| Finance (Part 11) | Payroll cost, statutory liabilities, bank advice |
| Accounting Event Engine | All HR financial transactions |
| Finance Cube (Part 11) | Workforce cost analytics |
| All Operational Modules | Workforce Master, attendance, skills for rostering |
| Statutory Portals | PF/ESIC/TDS e-filing |
| Banking APIs | Salary disbursement |
| ESS/MSS Portals | Employee + Manager self-service |

## AI/ML Capabilities in Part 12

| Capability | Entity | Description |
|---|---|---|
| Resume Parsing & Ranking | 414 (Candidate) | AI candidate ranking |
| Onboarding Optimization | 421-430 | Smart checklist |
| Shift Optimization | 431-440 | Auto-roster generation |
| Leave Pattern Analysis | 450 | Absenteeism prediction, abuse detection |
| Payroll Cost Forecast | 460 | Quarterly forecast |
| Payroll Fraud Detection | 460 | Anomalous payout detection |
| Performance Prediction | 470 | Promotion + attrition + skill + successor + forecast |
| Skill Recommendation | 480 | AI course recommendations |
| Career Path | 480 | AI career path suggestions |
| Learning Forecast | 480 | Next-quarter learning forecast |
| Attrition Prediction | 504 | ML risk scoring with SHAP |
| AI HR Copilot | 505 | Natural language HR queries |
| Succession Intelligence | 509 | AI successor recommendations |
| Labor Optimization | 509 | AI cost optimization |
| Workforce Planning | 503, 509 | AI headcount forecast |
| Executive Insights | 510 | AI strategic recommendations |

---

# 📚 MANUAL 1 — ENTERPRISE REFERENCE LIBRARY: COMPLETE STATUS

## Manual 1 Statistics

| Metric | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Parts | **12** (all complete) |
| Entities | **510** (Entities 1-510) |
| Foundation Services | **27** (FS-1 through FS-27) |
| Architectural Decisions | **170+** (Q1-Q170+) |
| Status | ✅ COMPLETE |
| Architecture | LOCKED |

## Parts Completed

| Part | Domain | Entity Range | Entity Count |
|---|---|---|---|
| Part 1-2 | Foundation & Organization | 1-15 | 15 |
| Part 3 | Product Master Data | 16-25 | 10 |
| Part 4 | Inventory (Immutable Ledger) | 26-35 | 10 |
| Part 5 | Procurement & Suppliers | 36-45 | 10 |
| Part 6 | Warehouse Management (WMS) | 46-55 | 10 |
| Part 7 | Manufacturing (MES) | 56-115 | 60 |
| Part 8 | Quality Management (QMS) | 116-175 | 60 |
| Part 9 | Retail Operations | 176-235 | 60 |
| Part 10 | Restaurant Operations | 236-285 | 50 |
| Part 11 | Finance & Accounting | 286-385 | 100 |
| Part 12 | Enterprise Workforce Management (EWM) | 386-510 | 130 |
| **Total** | **11 Domains + Foundation** | **1-510** | **510** |

*(Note: Entity counts above include supporting entities per part; total entity count is 510)*

## Foundation Service Catalog (FS-1 through FS-27)

| ID | Service | Domain |
|---|---|---|
| FS-1 | Authentication Service | Foundation |
| FS-2 | RBAC Engine | Foundation |
| FS-3 | Workflow Engine | Foundation |
| FS-4 | Notification Service | Foundation |
| FS-5 | Audit Service | Foundation |
| FS-6 | Configuration Engine | Foundation |
| FS-7 | API Gateway | Foundation |
| FS-8 | Accounting Event Engine | Finance |
| FS-9 | Barcoding Engine | Operations |
| FS-10 | Integration Hub | Foundation |
| FS-11 | Document Service | Foundation |
| FS-12 | BI Service | Analytics |
| FS-13 | AI/ML Service | Analytics |
| FS-14 | Task Control Room | Foundation |
| FS-15 | Developer Portal | Foundation |
| FS-16 | BI Recommendation Center | Analytics |
| FS-17 | Digital Twin | Operations |
| FS-18 | Chat/Collaboration Service | Foundation |
| FS-19 | Calendar Service | Foundation |
| FS-20 | Enterprise Workforce Scheduling Engine | HR |
| FS-21 | Compensation Rules Engine | HR/Finance |
| FS-22 | Enterprise Performance Engine | HR |
| FS-23 | Enterprise LMS | HR |
| FS-24 | ESS Platform | HR |
| FS-25 | MSS Platform | HR |
| FS-26 | Enterprise Workforce Intelligence | HR/Analytics |
| FS-27 | AI HR Copilot | HR/Analytics |

---

*End of Manual 1 Part 12 Sections 11-13. Part 12 — Enterprise Workforce Management — COMPLETE. Manual 1 — Enterprise Reference Library — COMPLETE (510 entities across 12 Parts).*

*Next: Per Chief Enterprise Architect recommendation, parallel development tracks:*
- *Track A (Documentation): Part 13 (Enterprise Asset & Maintenance Management), Part 14 (Enterprise Platform Services), Part 15 (AI, Analytics & Mission Control)*
- *Track B (Development): Volume 1 — Core Platform (Authentication, RBAC, Organization, Workflow Engine, Notification Engine, Accounting Event Engine, Audit Engine, API Gateway, etc.)*

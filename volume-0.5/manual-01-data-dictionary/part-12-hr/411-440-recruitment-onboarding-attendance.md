# Manual 1 · Part 12 · Sections 4-6 · Entities 411-440 — Recruitment/ATS, Onboarding & Attendance/Scheduling

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 12 — Enterprise Workforce Management (EWM) |
| Sections | 4 (Recruitment/ATS), 5 (Onboarding), 6 (Attendance/Scheduling) |
| Entities | 411–440 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 9 §9.7, Part 12 §4-6 |
| Last Updated | 2026-07-07 |

---

## Overview — Recruitment, Onboarding & Attendance Architecture

Sections 4-6 cover the **talent acquisition to daily workforce operations** pipeline:

```
RECRUITMENT (Sec 4: 411-420)
  Job Requisition → Posting → Candidate → ATS → Interview → Offer → BGV → Hiring
  ↓ Transitions to
ONBOARDING (Sec 5: 421-430)
  Joining Checklist → Document Verification → Asset Assignment → IT Access → Induction → Probation Review
  ↓ Daily operations
ATTENDANCE & SCHEDULING (Sec 6: 431-440)
  Shift Master → Roster → Attendance Device → Clock In/Out → Exceptions → Overtime → Timesheet → Payroll
```

### Integrated Enhancement: Enterprise Workforce Scheduling Engine
Per Chief Architect recommendation, a dedicated **Scheduling Engine** connects workforce planning with operational modules:

```
Production Plan + Restaurant Forecast + Retail Footfall + Warehouse Workload
  ↓
Scheduling Engine (auto-generates optimal rosters)
  ↓
Shift Planning → Roster Generation → Leave Validation → Skill Matching → Attendance → Payroll
```

---

# SECTION 4: Recruitment, Applicant Tracking System (ATS) & Hiring (Entities 411-420)

## Entity 411 — Job Requisition

### 1. Business Purpose
Per Part 12: Originates from workforce planning. Stores Department, Position, Vacancies, Reason, Budget, Priority, Approval.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `requisition_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `department_id` | UUID | Yes | — | FK to `departments` | Department (per Part 12: "Department") | Internal |
| `position_id` | UUID | Yes | — | FK to `position_masters` (Entity 393) | Position (per Part 12: "Position") | Internal |
| `vacancies_count` | INTEGER | Yes | — | > 0 | Vacancies (per Part 12: "Vacancies") | Internal |
| `hiring_reason` | ENUM | Yes | — | NEW_POSITION, REPLACEMENT, EXPANSION, BACKFILL | Reason (per Part 12: "Reason") | Internal |
| `budgeted_ctc` | DECIMAL(18,4) | Yes | — | > 0 | Budget (per Part 12: "Budget") | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `priority` | ENUM | Yes | `MEDIUM` | LOW, MEDIUM, HIGH, URGENT, CRITICAL | Priority (per Part 12: "Priority") | Internal |
| `required_by_date` | DATE | Yes | — | — | Required date | Internal |
| `job_description` | TEXT | Yes | — | Min 50 chars | JD | Internal |
| `required_skills` | JSONB | Yes | `'[]'` | — | Array of `{ skill, mandatory, min_years }` | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver (per Part 12: "Approval") | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval time | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, CLOSED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 412 — Job Posting

### 1. Business Purpose
Per Part 12: Supports Website, LinkedIn, Naukri, Indeed, Campus, Referral, Recruitment Agency, Internal Portal.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `posting_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `requisition_id` | UUID | Yes | — | FK to `job_requisitions` (Entity 411) | Source requisition | Internal |
| `job_title` | VARCHAR(200) | Yes | — | Min 3 | Title | Public |
| `job_description` | TEXT | Yes | — | Min 50 | Description | Public |
| `posting_channels` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | Subset: WEBSITE, LINKEDIN, NAUKRI, INDEED, CAMPUS, REFERRAL, AGENCY, INTERNAL_PORTAL (per Part 12) | Channels | Internal |
| `external_posting_ids` | JSONB | No | `'{}'` | — | `{ linkedin_id, naukri_id, ... }` | Internal |
| `posted_date` | DATE | Yes | `CURRENT_DATE` | — | Posted | Internal |
| `closing_date` | DATE | Yes | — | > posted_date | Closing | Internal |
| `is_active` | BOOLEAN | Yes | `true` | — | Active | Internal |
| `views_count` | INTEGER | Yes | `0` | ≥ 0 | Views | Internal |
| `applications_count` | INTEGER | Yes | `0` | ≥ 0 | Applications | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, PAUSED, CLOSED | Status | Internal |

---

## Entity 413 — Candidate Master

### 1. Business Purpose
Per Part 12: Stores Name, Email, Phone, Skills, Experience, Education, Resume, Portfolio, Current Company, Expected Salary.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `candidate_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `full_name` | VARCHAR(200) | Yes | — | Min 3 | Name (per Part 12: "Name") | Public |
| `email` | VARCHAR(200) | Yes | — | Email format | Email (per Part 12: "Email") | Confidential |
| `phone` | VARCHAR(20) | Yes | — | E.164 | Phone (per Part 12: "Phone") | Confidential |
| `current_company` | VARCHAR(200) | No | NULL | — | Current company (per Part 12: "Current Company") | Internal |
| `current_designation` | VARCHAR(200) | No | NULL | — | Designation | Internal |
| `total_experience_years` | DECIMAL(4,1) | No | NULL | ≥ 0 | Experience (per Part 12: "Experience") | Internal |
| `skills` | JSONB | No | `'[]'` | — | Array of `{ skill, proficiency, years }` (per Part 12: "Skills") | Internal |
| `education` | JSONB | No | `'[]'` | — | Array of `{ degree, institution, year }` (per Part 12: "Education") | Confidential |
| `resume_file_id` | UUID | No | NULL | FK to `file_attachments` | Resume (per Part 12: "Resume") | Confidential |
| `portfolio_url` | VARCHAR(500) | No | NULL | — | Portfolio (per Part 12: "Portfolio") | Internal |
| `current_ctc` | DECIMAL(18,4) | No | NULL | ≥ 0 | Current CTC | Confidential |
| `expected_ctc` | DECIMAL(18,4) | No | NULL | ≥ 0 | Expected (per Part 12: "Expected Salary") | Confidential |
| `notice_period_days` | INTEGER | No | NULL | ≥ 0 | Notice period | Internal |
| `source` | VARCHAR(50) | No | NULL | — | Source channel | Internal |
| `ai_resume_parsed` | JSONB | No | NULL | — | AI-parsed resume data (per Part 12 AI: "Resume Parsing") | Internal |
| `ai_match_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI job match score (per Part 12 AI: "Candidate Ranking") | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, HIRED, REJECTED, IN_TALENT_POOL, BLACKLISTED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 414 — Applicant Tracking (ATS)

### 1. Business Purpose
Per Part 12: Stages — Applied, Screened, Shortlisted, Interview, HR Round, Technical Round, Management Round, Selected, Rejected, Hold.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ats_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `candidate_id` | UUID | Yes | — | FK to `candidate_masters` (Entity 413) | Candidate | Confidential |
| `job_posting_id` | UUID | Yes | — | FK to `job_postings` (Entity 412) | Applied job | Internal |
| `application_date` | DATE | Yes | `CURRENT_DATE` | — | Applied date | Internal |
| `current_stage` | ENUM | Yes | `APPLIED` | APPLIED, SCREENED, SHORTLISTED, INTERVIEW, HR_ROUND, TECHNICAL_ROUND, MANAGEMENT_ROUND, SELECTED, REJECTED, HOLD (per Part 12: "Stages") | Stage | Confidential |
| `stage_history` | JSONB | Yes | `'[]'` | — | Array of `{ stage, entered_at, exited_at, changed_by }` | Internal |
| `screening_score` | DECIMAL(5,2) | No | NULL | 0-100 | Screening score | Internal |
| `ai_ranking` | INTEGER | No | NULL | ≥ 1 | AI candidate rank (per Part 12 AI: "Candidate Ranking") | Internal |
| `rejection_reason` | TEXT | No | NULL | Required if REJECTED | Reason | Internal |
| `hold_reason` | TEXT | No | NULL | Required if HOLD | Reason | Internal |
| `assigned_recruiter_id` | UUID | No | NULL | FK to `workforce_master` | Recruiter | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, CLOSED, CONVERTED_TO_EMPLOYEE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 415 — Interview Management

### 1. Business Purpose
Per Part 12: Supports Online, Offline, Panel, Scorecard, Feedback, Decision.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `interview_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `ats_id` | UUID | Yes | — | FK to `applicant_trackings` (Entity 414) | Candidate application | Confidential |
| `interview_type` | ENUM | Yes | — | HR_ROUND, TECHNICAL_ROUND, MANAGEMENT_ROUND, PHONE_SCREEN, VIDEO, IN_PERSON, PANEL (per Part 12) | Type | Internal |
| `interview_mode` | ENUM | Yes | `IN_PERSON` | ONLINE, OFFLINE (per Part 12: "Online", "Offline") | Mode | Internal |
| `scheduled_at` | TIMESTAMPTZ | Yes | — | — | Scheduled time | Internal |
| `duration_min` | INTEGER | Yes | `30` | > 0 | Duration | Internal |
| `interviewer_ids` | UUID[] | Yes | `ARRAY[]::UUID[]` | FK array to `workforce_master` | Interviewers (panel per Part 12: "Panel") | Internal |
| `location` | VARCHAR(200) | No | NULL | — | Location / meeting link | Internal |
| `scorecard` | JSONB | No | `'{}'` | — | `{ parameters: [{ name, rating, comments }], overall_score }` (per Part 12: "Scorecard") | Confidential |
| `feedback` | TEXT | No | NULL | — | Feedback (per Part 12: "Feedback") | Confidential |
| `decision` | ENUM | No | NULL | PENDING, PROCEED, REJECT, HOLD | Decision (per Part 12: "Decision") | Confidential |
| `conducted_at` | TIMESTAMPTZ | No | NULL | — | Actual conduct time | Internal |
| `status` | ENUM | Yes | `SCHEDULED` | SCHEDULED, COMPLETED, CANCELLED, NO_SHOW | Status | Internal |

---

## Entity 416 — Offer Management

### 1. Business Purpose
Per Part 12: Stores CTC, Designation, Joining Date, Offer Letter, Acceptance, Expiry.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `offer_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `ats_id` | UUID | Yes | — | FK to `applicant_trackings` | Candidate application | Confidential |
| `candidate_id` | UUID | Yes | — | FK to `candidate_masters` | Candidate | Confidential |
| `position_id` | UUID | Yes | — | FK to `position_masters` | Position | Internal |
| `designation_id` | UUID | Yes | — | FK to `designations` | Designation (per Part 12: "Designation") | Internal |
| `ctc_amount` | DECIMAL(18,4) | Yes | — | > 0 | CTC (per Part 12: "CTC") | **Restricted** |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `ctc_breakup` | JSONB | Yes | `'{}'` | — | `{ basic, hra, allowances, bonus, pf }` | **Restricted** |
| `joining_date` | DATE | Yes | — | — | Joining date (per Part 12: "Joining Date") | Internal |
| `offer_letter_file_id` | UUID | No | NULL | FK to `file_attachments` | Offer letter (per Part 12: "Offer Letter") | Confidential |
| `offer_expiry_date` | DATE | Yes | — | > offer_date | Expiry (per Part 12: "Expiry") | Internal |
| `accepted` | BOOLEAN | Yes | `false` | — | Accepted (per Part 12: "Acceptance") | Internal |
| `accepted_at` | TIMESTAMPTZ | No | NULL | — | Acceptance time | Internal |
| `approved_by` | UUID | Yes | — | FK to `workforce_master` | Approver | Confidential |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, PENDING_APPROVAL, APPROVED, SENT, ACCEPTED, REJECTED, EXPIRED, WITHDRAWN | Status | Internal |

---

## Entity 417 — Background Verification

### 1. Business Purpose
Per Part 12: Checks — Education, Employment, Identity, Criminal, Reference, Medical.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `bgv_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Confidential |
| `candidate_id` | UUID | Yes | — | FK to `candidate_masters` | Candidate | Confidential |
| `offer_id` | UUID | Yes | — | FK to `offer_managements` | Source offer | Confidential |
| `verification_checks` | JSONB | Yes | `'[]'` | — | Array of `{ check_type, status, agency, initiated_date, completed_date, result, remarks }` — EDUCATION, EMPLOYMENT, IDENTITY, CRIMINAL, REFERENCE, MEDICAL (per Part 12: "Checks") | **Restricted** |
| `overall_status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, CLEAR, DISCREPANCY, FAILED | Overall | Confidential |
| `agency_vendor_id` | UUID | No | NULL | FK to `suppliers` | BGV agency | Internal |
| `report_file_id` | UUID | No | NULL | FK to `file_attachments` | BGV report | **Restricted** |
| `initiated_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Initiated | Internal |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Completed | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, COMPLETED | Status | Internal |

---

## Entity 418 — Talent Pool

### 1. Business Purpose
Per Part 12: Stores Future Candidates, Silver Medalists, Campus Talent, Experienced Talent.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `candidate_id` | UUID | Yes | — | FK to `candidate_masters` | Candidate | Confidential |
| `pool_type` | ENUM | Yes | — | FUTURE_CANDIDATE, SILVER_MEDALIST, CAMPUS_TALENT, EXPERIENCED_TALENT (per Part 12: "Stores") | Type | Internal |
| `pool_category` | VARCHAR(50) | No | NULL | — | Category (e.g., "Tech", "Sales") | Internal |
| `skills_summary` | TEXT | No | NULL | — | Skills | Internal |
| `added_reason` | TEXT | Yes | — | Min 10 chars | Why added | Internal |
| `added_by` | UUID | Yes | — | FK to `workforce_master` | Who added | Internal |
| `added_at` | TIMESTAMPTZ | Yes | `NOW()` | — | When | Internal |
| `last_contacted_at` | TIMESTAMPTZ | No | NULL | — | Last contact | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, CONVERTED, EXPIRED | Status | Internal |

---

## Entity 419 — Recruitment Agency

### 1. Business Purpose
Per Part 12: Stores Agency, Agreement, Commission, Performance.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `agency_vendor_id` | UUID | Yes | — | FK to `suppliers` | Agency (per Part 12: "Agency") as vendor | Confidential |
| `agency_name` | VARCHAR(200) | Yes | — | Min 3 | Name | Internal |
| `agreement_start_date` | DATE | Yes | — | — | Agreement start (per Part 12: "Agreement") | Internal |
| `agreement_end_date` | DATE | No | NULL | — | Agreement end | Internal |
| `commission_rate_pct` | DECIMAL(5,2) | Yes | — | ≥ 0 | Commission % (per Part 12: "Commission") | Confidential |
| `commission_type` | ENUM | Yes | `CTC_PERCENTAGE` | CTC_PERCENTAGE, FLAT_FEE, TIERED | Type | Confidential |
| `total_candidates_supplied` | INTEGER | Yes | `0` | ≥ 0 | Candidates (per Part 12: "Performance") | Internal |
| `total_hires` | INTEGER | Yes | `0` | ≥ 0 | Successful hires | Internal |
| `conversion_rate_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Conversion | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 420 — Recruitment Dashboard

### 1. Business Purpose
Per Part 12: Open Positions, Applications, Interviews, Offers, Hiring Time, Offer Acceptance, Recruitment Cost.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `open_positions` | INTEGER | Yes | `0` | ≥ 0 | Open (per Part 12: "Open Positions") | Internal |
| `total_applications` | INTEGER | Yes | `0` | ≥ 0 | Applications (per Part 12: "Applications") | Internal |
| `interviews_scheduled` | INTEGER | Yes | `0` | ≥ 0 | Interviews (per Part 12: "Interviews") | Internal |
| `offers_pending` | INTEGER | Yes | `0` | ≥ 0 | Offers (per Part 12: "Offers") | Internal |
| `avg_hiring_time_days` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | Hiring time (per Part 12: "Hiring Time") | Internal |
| `offer_acceptance_rate` | DECIMAL(5,2) | Yes | `0` | 0-100 | Acceptance (per Part 12: "Offer Acceptance") | Internal |
| `total_recruitment_cost` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost (per Part 12: "Recruitment Cost") | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI recruitment insights (per Part 12 AI) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

# SECTION 5: Onboarding, Employee Documents & Compliance (Entities 421-430)

## Entity 421 — Joining Checklist

### 1. Business Purpose
Per Part 12: Tasks — Document Verification, Medical, Bank Details, PF, ESIC, Email, Laptop, ID Card, Uniform, Training.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | New employee | Internal |
| `checklist_items` | JSONB | Yes | `'[]'` | — | Array of `{ task, completed, completed_by, completed_date, remarks }` — DOCUMENT_VERIFICATION, MEDICAL, BANK_DETAILS, PF, ESIC, EMAIL, LAPTOP, ID_CARD, UNIFORM, TRAINING (per Part 12: "Tasks") | Internal |
| `total_tasks` | INTEGER | Yes | `0` | ≥ 0 | Total tasks | Internal |
| `completed_tasks` | INTEGER | Yes | `0` | ≥ 0 | Completed | Internal |
| `completion_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Completion | Internal |
| `is_complete` | BOOLEAN | Yes | `false` | Generated: all completed | Complete | Internal |
| `joining_date` | DATE | Yes | — | — | Joining date | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, COMPLETED | Status | Internal |

---

## Entity 422 — Document Verification

### 1. Business Purpose
Per Part 12: Supports Aadhaar, PAN, Passport, Visa, Education, Experience, Police Verification.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `verification_items` | JSONB | Yes | `'[]'` | — | Array of `{ doc_type, status, verified_by, verified_date, remarks }` — AADHAAR, PAN, PASSPORT, VISA, EDUCATION, EXPERIENCE, POLICE_VERIFICATION (per Part 12: "Supports") | **Restricted** |
| `all_verified` | BOOLEAN | Yes | `false` | Generated: all items verified | All | Internal |
| `verified_by` | UUID | Yes | — | FK to `workforce_master` | HR verifier | Internal |
| `verified_at` | TIMESTAMPTZ | No | NULL | — | Verification time | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, COMPLETED, DISCREPANCY | Status | Internal |

---

## Entity 423 — Asset Assignment

### 1. Business Purpose
Per Part 12: Assigns Laptop, Desktop, Scanner, Mobile, SIM, Access Card, Uniform, Vehicle, Safety Kit, Locker.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `assignment_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Internal |
| `asset_type` | ENUM | Yes | — | LAPTOP, DESKTOP, SCANNER, MOBILE, SIM, ACCESS_CARD, UNIFORM, VEHICLE, SAFETY_KIT, LOCKER (per Part 12: "Assigns") | Type | Internal |
| `asset_code` | VARCHAR(30) | No | NULL | — | Asset identifier | Internal |
| `serial_number` | VARCHAR(100) | No | NULL | — | Serial | Internal |
| `assigned_date` | DATE | Yes | `CURRENT_DATE` | — | Assigned | Internal |
| `return_date` | DATE | No | NULL | — | Returned (on exit) | Internal |
| `condition_at_assignment` | ENUM | Yes | `NEW` | NEW, GOOD, FAIR | Condition | Internal |
| `condition_at_return` | ENUM | No | NULL | GOOD, FAIR, DAMAGED, LOST | Return condition | Internal |
| `status` | ENUM | Yes | `ASSIGNED` | ASSIGNED, RETURNED, LOST, DAMAGED | Status | Internal |

---

## Entity 424 — IT Access

### 1. Business Purpose
Per Part 12: Supports Email, ERP, POS, Warehouse App, Restaurant App, VPN, SSO.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `access_items` | JSONB | Yes | `'[]'` | — | Array of `{ system, access_level, provisioned, provisioned_date, revoked_date }` — EMAIL, ERP, POS, WAREHOUSE_APP, RESTAURANT_APP, VPN, SSO (per Part 12: "Supports") | Confidential |
| `all_provisioned` | BOOLEAN | Yes | `false` | Generated: all provisioned | All | Internal |
| `provisioned_by` | UUID | Yes | — | FK to `workforce_master` | IT staff | Internal |
| `provisioned_at` | TIMESTAMPTZ | No | NULL | — | Time | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, PROVISIONED, REVOKED | Status | Internal |

---

## Entity 425 — Department Induction

### 1. Business Purpose
Per Part 12: Tracks Manager, Orientation, Policies, Department SOP, Safety Training.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Internal |
| `department_id` | UUID | Yes | — | FK to `departments` | Department | Internal |
| `induction_items` | JSONB | Yes | `'[]'` | — | Array of `{ item, completed }` — MANAGER_INTRO, ORIENTATION, POLICIES, DEPT_SOP, SAFETY_TRAINING (per Part 12: "Tracks") | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager (per Part 12: "Manager") | Internal |
| `induction_date` | DATE | Yes | `CURRENT_DATE` | — | Date | Internal |
| `completed` | BOOLEAN | Yes | `false` | — | Completed | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, COMPLETED | Status | Internal |

---

## Entity 426 — Medical Fitness

### 1. Business Purpose
Per Part 12: Stores Medical Reports, Vaccination, Health Certificate, Fitness Approval.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `medical_report_file_id` | UUID | No | NULL | FK to `file_attachments` | Report (per Part 12: "Medical Reports") | **Restricted** |
| `vaccination_details` | JSONB | No | `'[]'` | — | Array of `{ vaccine, date, dose }` (per Part 12: "Vaccination") | Confidential |
| `health_certificate_file_id` | UUID | No | NULL | FK to `file_attachments` | Certificate (per Part 12: "Health Certificate") | Confidential |
| `fitness_status` | ENUM | Yes | `PENDING` | PENDING, FIT, UNFIT, CONDITIONALLY_FIT | Fitness (per Part 12: "Fitness Approval") | Confidential |
| `medical_examination_date` | DATE | Yes | — | — | Exam date | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Medical officer | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, COMPLETED | Status | Internal |

---

## Entity 427 — Compliance Checklist

### 1. Business Purpose
Per Part 12: Supports Labor Law, Factory Act, Food Safety, NDA, Employment Contract, Code of Conduct.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `compliance_items` | JSONB | Yes | `'[]'` | — | Array of `{ item, status, document_file_id, completed_date }` — LABOR_LAW, FACTORY_ACT, FOOD_SAFETY, NDA, EMPLOYMENT_CONTRACT, CODE_OF_CONDUCT (per Part 12: "Supports") | **Restricted** |
| `all_compliant` | BOOLEAN | Yes | `false` | Generated: all items completed | All | Confidential |
| `verified_by` | UUID | Yes | — | FK to `workforce_master` | HR | Internal |
| `verified_at` | TIMESTAMPTZ | No | NULL | — | Time | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, COMPLETED, NON_COMPLIANT | Status | Internal |

---

## Entity 428 — Digital Signature

### 1. Business Purpose
Per Part 12: Supports Offer Letter, NDA, Policies, Contracts, Acknowledgements.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `document_type` | ENUM | Yes | — | OFFER_LETTER, NDA, POLICIES, CONTRACTS, ACKNOWLEDGEMENTS (per Part 12: "Supports") | Type | Confidential |
| `document_file_id` | UUID | Yes | — | FK to `file_attachments` | Document | Confidential |
| `signature_hash` | VARCHAR(500) | Yes | — | — | Digital signature hash | **Restricted** |
| `signed_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Signed time | Internal |
| `ip_address` | VARCHAR(45) | Yes | — | — | IP | Confidential |
| `status` | ENUM | Yes | `SIGNED` | PENDING, SIGNED, REVOKED | Status | Internal |

---

## Entity 429 — Probation Review

### 1. Business Purpose
Per Part 12: Tracks 30 Day, 60 Day, 90 Day, Manager Feedback, HR Feedback, Decision.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `review_type` | ENUM | Yes | — | DAY_30, DAY_60, DAY_90 (per Part 12: "30 Day", "60 Day", "90 Day") | Type | Internal |
| `review_date` | DATE | Yes | — | — | Review date | Internal |
| `manager_feedback` | TEXT | Yes | — | Min 20 chars | Manager (per Part 12: "Manager Feedback") | Confidential |
| `hr_feedback` | TEXT | Yes | — | Min 20 chars | HR (per Part 12: "HR Feedback") | Confidential |
| `performance_rating` | DECIMAL(3,2) | No | NULL | 0-5 | Rating | Confidential |
| `decision` | ENUM | Yes | `PENDING` | PENDING, ON_TRACK, NEEDS_IMPROVEMENT, EXTEND_PROBATION, CONFIRM, TERMINATE | Decision (per Part 12: "Decision") | Confidential |
| `reviewed_by` | UUID | Yes | — | FK to `workforce_master` | Reviewer | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, COMPLETED | Status | Internal |

---

## Entity 430 — Onboarding Dashboard

### 1. Business Purpose
Per Part 12: Joining Today, Pending Documents, Pending Assets, Training Status, Probation, Compliance.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `joining_today` | INTEGER | Yes | `0` | ≥ 0 | Joining (per Part 12: "Joining Today") | Internal |
| `pending_documents` | INTEGER | Yes | `0` | ≥ 0 | Pending docs (per Part 12: "Pending Documents") | Internal |
| `pending_assets` | INTEGER | Yes | `0` | ≥ 0 | Pending assets (per Part 12: "Pending Assets") | Internal |
| `training_in_progress` | INTEGER | Yes | `0` | ≥ 0 | Training (per Part 12: "Training Status") | Internal |
| `on_probation` | INTEGER | Yes | `0` | ≥ 0 | Probation (per Part 12: "Probation") | Internal |
| `compliance_pending` | INTEGER | Yes | `0` | ≥ 0 | Compliance (per Part 12: "Compliance") | Confidential |
| `ai_insights` | JSONB | No | NULL | — | AI onboarding insights (per Part 12 AI) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

# SECTION 6: Attendance, Shift Planning & Workforce Scheduling (Entities 431-440)

## Entity 431 — Attendance Register

### 1. Business Purpose
Per Part 12: Stores Date, Shift, In Time, Out Time, Late, Early Exit, OT, Status.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Work location | Internal |
| `attendance_date` | DATE | Yes | — | — | Date (per Part 12: "Date") | Internal |
| `shift_id` | UUID | No | NULL | FK to `shift_masters` (Entity 432) | Shift (per Part 12: "Shift") | Internal |
| `clock_in_time` | TIMESTAMPTZ | No | NULL | — | In time (per Part 12: "In Time") | Internal |
| `clock_out_time` | TIMESTAMPTZ | No | NULL | — | Out time (per Part 12: "Out Time") | Internal |
| `is_late` | BOOLEAN | Yes | `false` | — | Late (per Part 12: "Late") | Internal |
| `late_duration_min` | INTEGER | Yes | `0` | ≥ 0 | Late duration | Internal |
| `is_early_exit` | BOOLEAN | Yes | `false` | — | Early exit (per Part 12: "Early Exit") | Internal |
| `early_exit_duration_min` | INTEGER | Yes | `0` | ≥ 0 | Early exit duration | Internal |
| `overtime_hours` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | OT (per Part 12: "OT") | Confidential |
| `total_hours_worked` | DECIMAL(5,2) | No | NULL | ≥ 0 | Total hours | Internal |
| `attendance_status` | ENUM | Yes | `ABSENT` | PRESENT, ABSENT, LATE, HALF_DAY, WEEK_OFF, HOLIDAY, LEAVE, WORK_FROM_HOME, MISSION (per Part 12: "Status") | Status | Confidential |
| `clock_in_method` | ENUM | No | NULL | BIOMETRIC, FACE_RECOGNITION, RFID, QR, GPS, MOBILE, MANUAL | Clock in method | Internal |
| `clock_in_location` | JSONB | No | NULL | — | `{ lat, long }` (if GPS) | Internal |
| `device_id` | VARCHAR(100) | No | NULL | — | Attendance device | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Standard | Internal |

### 5-16. Standard Pattern
- **Partitioning**: Monthly by `attendance_date` (high volume)
- **Index**: `idx_ar_workforce_date`, `idx_ar_facility_date`, `idx_ar_status`
- **AI**: Attendance Prediction, Absenteeism Risk, Shift Optimization, Overtime Optimization

---

## Entity 432 — Shift Master

### 1. Business Purpose
Per Part 12: Examples — General, Morning, Evening, Night, Flexible, Rotational, Split Shift.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `shift_code` | VARCHAR(20) | Yes | — | Unique per company | Code | Internal |
| `shift_name` | VARCHAR(100) | Yes | — | Min 2 | Name (per Part 12: "General", "Morning", etc.) | Public |
| `shift_type` | ENUM | Yes | — | GENERAL, MORNING, EVENING, NIGHT, FLEXIBLE, ROTATIONAL, SPLIT_SHIFT (per Part 12) | Type | Internal |
| `start_time` | TIME | Yes | — | — | Start | Internal |
| `end_time` | TIME | Yes | — | — | End | Internal |
| `break_duration_min` | INTEGER | Yes | `30` | ≥ 0 | Break | Internal |
| `grace_period_late_min` | INTEGER | Yes | `10` | ≥ 0 | Late grace (per Part 12: "Grace Time") | Internal |
| `grace_period_early_exit_min` | INTEGER | Yes | `10` | ≥ 0 | Early exit grace | Internal |
| `half_day_threshold_min` | INTEGER | Yes | `240` | ≥ 0 | Half day threshold (per Part 12: "Half Day") | Internal |
| `overtime_eligible` | BOOLEAN | Yes | `false` | — | OT eligible | Internal |
| `overtime_rate_multiplier` | DECIMAL(3,2) | No | `1.50` | > 1.0 | OT rate | Confidential |
| `weekly_off_days` | TEXT[] | Yes | `ARRAY['SUN']::TEXT[]` | Subset MON-SUN | Weekly off (per Part 12: "Weekly Off") | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 433 — Shift Roster

### 1. Business Purpose
Per Part 12: Assigns Employee, Shift, Location, Manager, Effective Date.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `roster_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee (per Part 12: "Employee") | Internal |
| `shift_id` | UUID | Yes | — | FK to `shift_masters` (Entity 432) | Shift (per Part 12: "Shift") | Internal |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Location (per Part 12: "Location") | Internal |
| `manager_id` | UUID | No | NULL | FK to `workforce_master` | Manager (per Part 12: "Manager") | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from (per Part 12: "Effective Date") | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `is_ai_generated` | BOOLEAN | Yes | `false` | — | AI-scheduled (per Scheduling Engine Enhancement) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, COMPLETED, CANCELLED | Status | Internal |

---

## Entity 434 — Attendance Device

### 1. Business Purpose
Per Part 12: Supports Biometric, Face Recognition, RFID, QR, GPS, Mobile.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `device_code` | VARCHAR(30) | Yes | — | Unique per facility | Code | Internal |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Location | Internal |
| `device_type` | ENUM | Yes | — | BIOMETRIC, FACE_RECOGNITION, RFID, QR, GPS, MOBILE (per Part 12: "Supports") | Type | Internal |
| `device_name` | VARCHAR(100) | Yes | — | Min 3 | Name | Public |
| `serial_number` | VARCHAR(100) | No | NULL | — | Serial | Internal |
| `ip_address` | VARCHAR(45) | No | NULL | — | IP | Internal |
| `last_sync_at` | TIMESTAMPTZ | No | NULL | — | Last sync | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, OFFLINE, MAINTENANCE | Status | Internal |

---

## Entity 435 — Overtime Register

### 1. Business Purpose
Per Part 12: Tracks Hours, Approval, Rate, Reason.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ot_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `attendance_id` | UUID | Yes | — | FK to `attendance_registers` (Entity 431) | Source attendance | Internal |
| `ot_date` | DATE | Yes | — | — | Date | Internal |
| `ot_hours` | DECIMAL(5,2) | Yes | — | > 0 | Hours (per Part 12: "Hours") | Internal |
| `ot_rate` | DECIMAL(18,4) | Yes | — | > 0 | Rate (per Part 12: "Rate") | Confidential |
| `ot_amount` | DECIMAL(18,4) | Yes | — | Generated: `hours * rate` | Amount | Confidential |
| `reason` | TEXT | Yes | — | Min 10 chars | Reason (per Part 12: "Reason") | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approval (per Part 12: "Approval") | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval time | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, PROCESSED | Status | Internal |

---

## Entity 436 — Workforce Scheduling

### 1. Business Purpose
Per Part 12: Supports Restaurant, Retail, Warehouse, Manufacturing, Field Staff, Drivers. Integrates with Enterprise Workforce Scheduling Engine (per Enhancement).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `schedule_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal | |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Location | Internal | |
| `department_id` | UUID | Yes | — | FK to `departments` | Department | Internal | |
| `schedule_type` | ENUM | Yes | — | RESTAURANT, RETAIL, WAREHOUSE, MANUFACTURING, FIELD_STAFF, DRIVERS (per Part 12: "Supports") | Type | Internal | |
| `schedule_date` | DATE | Yes | — | — | Date | Internal | |
| `demand_source` | JSONB | No | `'{}'` | — | `{ production_plan, restaurant_forecast, retail_footfall, warehouse_workload }` (per Scheduling Engine Enhancement) | Internal | |
| `required_staff_count` | INTEGER | Yes | — | > 0 | Required | Internal | |
| `scheduled_staff_count` | INTEGER | Yes | `0` | ≥ 0 | Scheduled | Internal | |
| `roster_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Linked rosters (Entity 433) | Internal | |
| `is_ai_optimized` | BOOLEAN | Yes | `false` | — | AI-optimized (per Scheduling Engine Enhancement) | Internal | Scheduling AI |
| `ai_confidence_score` | DECIMAL(5,2) | No | NULL | 0-100 | AI confidence | Internal | |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, PUBLISHED, COMPLETED | Status | Internal | |

---

## Entity 437 — Attendance Exception

### 1. Business Purpose
Per Part 12: Reasons — Missed Punch, Late, Absent, Unauthorized, System Error.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `exception_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `attendance_id` | UUID | No | NULL | FK to `attendance_registers` | Source attendance | Internal |
| `exception_type` | ENUM | Yes | — | MISSED_PUNCH, LATE, ABSENT, UNAUTHORIZED, SYSTEM_ERROR (per Part 12: "Reasons") | Type | Internal |
| `exception_date` | DATE | Yes | — | — | Date | Internal |
| `description` | TEXT | Yes | — | Min 10 chars | Details | Internal |
| `resolution` | TEXT | No | NULL | — | How resolved | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver | Confidential |
| `status` | ENUM | Yes | `OPEN` | OPEN, RESOLVED, REJECTED | Status | Internal |

---

## Entity 438 — Timesheet

### 1. Business Purpose
Per Part 12: Stores Hours Worked, Projects, Departments, Tasks.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `timesheet_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Internal |
| `timesheet_date` | DATE | Yes | — | — | Date | Internal |
| `total_hours` | DECIMAL(5,2) | Yes | — | > 0 | Hours (per Part 12: "Hours Worked") | Internal |
| `entries` | JSONB | Yes | `'[]'` | — | Array of `{ project, department, task, hours, description }` (per Part 12: "Projects", "Departments", "Tasks") | Internal |
| `approved_by` | UUID | No | NULL | FK to `workforce_master` | Approver | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SUBMITTED, APPROVED, REJECTED | Status | Internal |

---

## Entity 439 — Attendance Policy

### 1. Business Purpose
Per Part 12: Supports Grace Time, Late Rules, Half Day, Weekly Off, Holiday Rules, Sandwich Rule.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `policy_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Confidential |
| `policy_name` | VARCHAR(200) | Yes | — | Min 3 | Name | Public |
| `grace_time_late_min` | INTEGER | Yes | `10` | ≥ 0 | Grace (per Part 12: "Grace Time") | Internal |
| `late_rules` | JSONB | Yes | `'{}'` | — | `{ deductions_per_late, max_late_per_month, half_day_after_min }` (per Part 12: "Late Rules") | Confidential |
| `half_day_rules` | JSONB | Yes | `'{}'` | — | `{ threshold_hours, late_half_day_min, early_leave_half_day_min }` (per Part 12: "Half Day") | Internal |
| `weekly_off_rules` | JSONB | Yes | `'{}'` | — | `{ default_off_day, alternate_off_allowed, consecutive_off_required }` (per Part 12: "Weekly Off") | Internal |
| `holiday_rules` | JSONB | Yes | `'{}'` | — | `{ paid_holidays, restricted_holidays }` (per Part 12: "Holiday Rules") | Internal |
| `sandwich_rule_applied` | BOOLEAN | Yes | `false` | — | Sandwich rule (per Part 12: "Sandwich Rule") — leave between holidays/weekends counts as leave | Confidential |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 440 — Workforce Operations Dashboard

### 1. Business Purpose
Per Part 12: Present, Absent, Late, OT, Shift Coverage, Labor Cost, Attendance %.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Facility | Internal |
| `total_workforce` | INTEGER | Yes | `0` | ≥ 0 | Total | Internal |
| `present_count` | INTEGER | Yes | `0` | ≥ 0 | Present (per Part 12: "Present") | Internal |
| `absent_count` | INTEGER | Yes | `0` | ≥ 0 | Absent (per Part 12: "Absent") | Internal |
| `late_count` | INTEGER | Yes | `0` | ≥ 0 | Late (per Part 12: "Late") | Internal |
| `overtime_hours_total` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | OT (per Part 12: "OT") | Internal |
| `shift_coverage_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Coverage (per Part 12: "Shift Coverage") | Internal |
| `labor_cost_today` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Labor cost (per Part 12: "Labor Cost") | Confidential |
| `attendance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Attendance % (per Part 12: "Attendance %") | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI workforce ops insights (per Part 12 AI) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Part 12 Sections 4-6 Completion Summary

**All 30 Recruitment, Onboarding & Attendance entities are now defined** at full enterprise-grade depth.

### Key Architectural Decisions

1. **Enterprise ATS** — Full recruitment workflow from requisition to hiring
2. **AI candidate ranking** — Resume parsing, match scoring, ranking
3. **Digital onboarding** — Paperless with 10+ checklist items
4. **Asset assignment** — Cross-module (laptop, scanner, uniform, vehicle, access card)
5. **IT access provisioning** — Email, ERP, POS, apps, VPN, SSO
6. **Compliance checklist** — Labor Law, Factory Act, Food Safety, NDA, Contract, Code of Conduct
7. **Enterprise Attendance Engine** — Multi-device (Biometric, Face, RFID, QR, GPS, Mobile)
8. **Shift management** — 7 shift types, grace periods, half-day rules, sandwich rule
9. **Workforce Scheduling Engine** — Auto-generates rosters from production/retail/restaurant/warehouse demand
10. **Overtime tracking** — With approval workflow and rate calculation
11. **Attendance exceptions** — Missed punch, late, absent, unauthorized, system error
12. **Timesheet** — Project/department/task-level time tracking
13. **AI workforce planning** — Shift optimization, labor forecast, absenteeism risk, OT optimization
14. **Background verification** — 6 check types with agency integration
15. **Talent pool** — Silver medalists, campus talent, future candidates

# Manual 1 · Part 12 · Sections 1-3 · Entities 381-410 — Workforce Foundation, Org Structure & Employee Lifecycle

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 12 — Enterprise Workforce Management (EWM) |
| Sections | 1 (Foundation), 2 (Org Structure), 3 (Employee Lifecycle) |
| Entities | 381–410 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 2 §2.3, Ch 6 §6.2, Part 12 §1-3 |
| Last Updated | 2026-07-07 |

---

## Overview — Enterprise Workforce Architecture

Part 12 implements the **Enterprise Workforce Management (EWM)** domain. The architecture is built on a critical innovation recommended by the Chief Enterprise Architect:

### Enterprise Workforce Identity Service (Core Platform Component)

Instead of every module maintaining independent employee references, all applications use the **Workforce Identity Service**. This is the 6th core platform service (alongside Auth, RBAC, Workflow Engine, Notification Engine, and Accounting Event Engine).

```
Enterprise Workforce Identity Service
│
├── Authentication Link (User Account)
├── RBAC Link (Role Assignment)
├── Attendance Link
├── Payroll Link
├── Manufacturing Link (Operator Assignment)
├── Warehouse Link (Picker Assignment)
├── Retail Link (Cashier Assignment)
├── Restaurant Link (Chef/Waiter Assignment)
├── Finance Link (Cost Center)
├── Asset Assignment Link (Laptop, Scanner, Uniform)
├── Training Link
└── Performance Link
```

**One Workforce ID** across the entire enterprise. Unified authentication, centralized history, consistent attendance/payroll, cross-module asset assignments.

---

## SECTION 1: Workforce Foundation & Enterprise Architecture (Entities 381-390)

### Entity 381 — Workforce Master

#### 1. Business Purpose
Represents **every workforce member** — the single source of truth for people in SUOP. Per Part 12: *"Employee Code immutable. Workforce ID globally unique."* Extends Employee (Entity from Part 2 Identity Domain) with comprehensive workforce attributes.

#### 2-4. Owner / Schema / Fields

| Owner | L2 — HR Head |
|---|---|
| Schema | `master` |
| Table | `workforce_master` (extends `employees` from Part 2) |

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID (globally unique Workforce ID per Part 12) | |
| `employee_code` | VARCHAR(30) | Yes | — | Unique per company, immutable | Employee code (per Part 12: "employee_code") | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Primary company | Internal |
| `person_id` | UUID | Yes | — | FK to `persons` (Part 2) | Linked person (legal identity) | Confidential |
| `full_name` | VARCHAR(200) | Yes | — | Min 3 | Display name (per Part 12: "full_name") | Public |
| `employee_type` | ENUM | Yes | — | PERMANENT, CONTRACT, INTERN, CONSULTANT, DAILY_WAGE, PART_TIME, TRAINEE, VENDOR_STAFF (per Part 12: "Employee Types") | Type | Confidential |
| `employment_status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, NOTICE_PERIOD, SUSPENDED, RETIRED, TERMINATED, TRANSFERRED (per Part 12: "Employment Status") | Status | Confidential |
| `joining_date` | DATE | Yes | — | — | Joining date (per Part 12: "joining_date") | Internal |
| `department_id` | UUID | Yes | — | FK to `departments` | Department (per Part 12: "department_id") | Internal |
| `reporting_manager_id` | UUID | No | NULL | FK self-ref | Reporting manager (per Part 12: "reporting_manager") | Internal |
| `business_unit_id` | UUID | No | NULL | FK to `business_units` | BU | Internal |
| `position_id` | UUID | No | NULL | FK to `position_masters` (Entity 393) | Position | Internal |
| `designation_id` | UUID | No | NULL | FK to `designations` (Entity 394) | Designation | Internal |
| `grade_id` | UUID | No | NULL | FK to `grades` (Entity 395) | Grade | Confidential |
| `workforce_category_id` | UUID | No | NULL | FK to `workforce_categories` (Entity 382) | Category | Internal |
| `user_account_id` | UUID | No | NULL | FK to `user_accounts` | Linked digital identity (per Enhancement: "Authentication Link") | Confidential |
| `primary_facility_id` | UUID | Yes | — | FK to `facilities` | Primary work location | Internal |
| `cost_center_id` | UUID | No | NULL | FK to `cost_centers` | Cost center (per Enhancement: "Finance Link") | Confidential |
| `exit_date` | DATE | No | NULL | > joining_date if set | Exit date | Internal |
| `exit_reason` | VARCHAR(200) | No | NULL | — | Reason for exit | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status (per Part 12: "status") | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

#### 5-16. Standard Pattern
- **Relationships**: → Person, Company, Department, BU, Position, Designation, Grade, UserAccount, Facility, CostCenter; → WorkforceProfile, DigitalEmployeeFile, Identity, EmergencyContact, FamilyDetails (1:1 each)
- **Validation**: `employee_code` immutable after creation; `workforce_id` globally unique; `exit_date` > `joining_date`
- **AI**: Attrition Prediction, Workforce Forecast, Skill Analysis, Succession Planning, Promotion Recommendation

---

### Entity 382 — Workforce Category
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `category_code` | VARCHAR(20) | Yes | — | Unique per company | Code | Internal |
| `category_name` | VARCHAR(100) | Yes | — | Min 2 | Name (per Part 12: "Management", "Production", etc.) | Public |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

### Entity 383 — Employment Type
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `type_code` | VARCHAR(20) | Yes | — | Unique | Code | Internal |
| `type_name` | VARCHAR(100) | Yes | — | Min 2 | Name (per Part 12: "Permanent", "Contract", etc.) | Public |
| `is_permanent` | BOOLEAN | Yes | `false` | — | Is permanent | Internal |
| `requires_renewal` | BOOLEAN | Yes | `false` | — | Contract renewal needed | Internal |
| `default_contract_months` | INTEGER | No | NULL | > 0 | Default duration | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

### Entity 384 — Employment Status
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `status_code` | VARCHAR(20) | Yes | — | Unique | Code | Internal |
| `status_name` | VARCHAR(100) | Yes | — | Min 2 | Name (per Part 12: "Active", "Notice Period", etc.) | Public |
| `is_active_state` | BOOLEAN | Yes | `false` | — | Counts as active employee | Internal |
| `allows_payroll` | BOOLEAN | Yes | `false` | — | Eligible for payroll | Confidential |
| `allows_attendance` | BOOLEAN | Yes | `false` | — | Can mark attendance | Internal |
| `color_code` | VARCHAR(7) | No | NULL | Hex | UI color | Public |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

### Entity 385 — Workforce Profile
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master`, UNIQUE | Employee | Confidential |
| `photo_file_id` | UUID | No | NULL | FK to `file_attachments` | Photo (per Part 12: "Photo") | Internal |
| `signature_file_id` | UUID | No | NULL | FK to `file_attachments` | Signature (per Part 12: "Signature") | Confidential |
| `blood_group` | VARCHAR(10) | No | NULL | — | Blood group (per Part 12: "Blood Group") | Confidential |
| `nationality` | CHAR(2) | Yes | `IN` | ISO 3166-1 | Nationality (per Part 12: "Nationality") | Internal |
| `languages_known` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Languages (per Part 12: "Languages") | Internal |
| `skills` | JSONB | No | `'[]'` | — | Skills array: `[{ skill, proficiency, years } ]` (per Part 12: "Skills") | Internal |
| `total_experience_years` | DECIMAL(4,1) | No | NULL | ≥ 0 | Experience (per Part 12: "Experience") | Internal |
| `education_summary` | JSONB | No | `'[]'` | — | Education: `[{ degree, institution, year } ]` (per Part 12: "Education Summary") | Confidential |
| `marital_status` | ENUM | No | NULL | SINGLE, MARRIED, DIVORCED, WIDOWED | Status | Confidential |
| `gender` | ENUM | No | NULL | MALE, FEMALE, OTHER | Gender | Confidential |
| `date_of_birth` | DATE | No | NULL | — | DOB | Confidential |
| `physically_challenged` | BOOLEAN | Yes | `false` | — | PwD status | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

### Entity 386 — Digital Employee File
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master`, UNIQUE | Employee | Confidential |
| `documents` | JSONB | Yes | `'[]'` | — | Array of `{ doc_type, file_id, uploaded_at, expiry_date, verified }` (per Part 12: "Resume", "Offer Letter", "Aadhaar", "PAN", etc.) | **Restricted** |
| `resume_file_id` | UUID | No | NULL | FK to `file_attachments` | Resume (per Part 12: "Resume") | Confidential |
| `offer_letter_file_id` | UUID | No | NULL | FK to `file_attachments` | Offer letter (per Part 12: "Offer Letter") | Confidential |
| `appointment_letter_file_id` | UUID | No | NULL | FK to `file_attachments` | Appointment (per Part 12: "Appointment Letter") | Confidential |
| `id_proof_file_id` | UUID | No | NULL | FK to `file_attachments` | Aadhaar/ID (per Part 12: "Aadhaar") | **Restricted** |
| `pan_file_id` | UUID | No | NULL | FK to `file_attachments` | PAN (per Part 12: "PAN") | **Restricted** |
| `education_certificates` | UUID[] | No | `ARRAY[]::UUID[]` | — | Education docs (per Part 12: "Education") | Confidential |
| `medical_file_id` | UUID | No | NULL | FK to `file_attachments` | Medical (per Part 12: "Medical") | Confidential |
| `insurance_file_id` | UUID | No | NULL | FK to `file_attachments` | Insurance (per Part 12: "Insurance") | Confidential |
| `contract_file_id` | UUID | No | NULL | FK to `file_attachments` | Contract (per Part 12: "Contracts") | Confidential |
| `nda_file_id` | UUID | No | NULL | FK to `file_attachments` | NDA (per Part 12: "NDA") | Confidential |
| `policy_acknowledgement_file_id` | UUID | No | NULL | FK to `file_attachments` | Policies (per Part 12: "Policies") | Internal |
| `is_complete` | BOOLEAN | Yes | `false` | — | All mandatory docs uploaded | Internal |
| `completion_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Completion % | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

---

### Entity 387 — Employee Identity
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master`, UNIQUE | Employee | Confidential |
| `aadhaar_number` | VARCHAR(12) | No | NULL | 12 digits, encrypted | Aadhaar (per Part 12: "National IDs") | **Restricted** |
| `pan_number` | VARCHAR(10) | No | NULL | PAN format | PAN (per Part 12: "Tax Number") | **Restricted** |
| `passport_number` | VARCHAR(20) | No | NULL | — | Passport (per Part 12: "Passport") | Confidential |
| `passport_expiry` | DATE | No | NULL | — | Expiry | Confidential |
| `visa_number` | VARCHAR(20) | No | NULL | — | Visa | Confidential |
| `visa_expiry` | DATE | No | NULL | — | Expiry | Confidential |
| `driving_license_number` | VARCHAR(20) | No | NULL | — | DL (per Part 12: "Driving License") | Confidential |
| `driving_license_expiry` | DATE | No | NULL | — | Expiry | Confidential |
| `pf_number` | VARCHAR(30) | No | NULL | — | PF (per Part 12: "PF") | Confidential |
| `esic_number` | VARCHAR(30) | No | NULL | — | ESIC (per Part 12: "ESIC") | Confidential |
| `uan_number` | VARCHAR(30) | No | NULL | — | UAN | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

### Entity 388 — Emergency Contact
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `contact_name` | VARCHAR(100) | Yes | — | Min 2 | Name (per Part 12: "Name") | Confidential |
| `relationship` | VARCHAR(50) | Yes | — | — | Relationship (per Part 12: "Relationship") | Confidential |
| `phone_number` | VARCHAR(20) | Yes | — | E.164 | Phone (per Part 12: "Phone") | Confidential |
| `address` | TEXT | No | NULL | — | Address (per Part 12: "Address") | Confidential |
| `priority` | INTEGER | Yes | `1` | ≥ 1 | Priority (1 = primary) (per Part 12: "Priority") | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

### Entity 389 — Family Details
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `member_name` | VARCHAR(100) | Yes | — | Min 2 | Name | Confidential |
| `relationship` | ENUM | Yes | — | SPOUSE, CHILD, PARENT, DEPENDENT, NOMINEE (per Part 12) | Relationship | Confidential |
| `date_of_birth` | DATE | No | NULL | — | DOB | Confidential |
| `is_dependent` | BOOLEAN | Yes | `false` | — | Dependent (per Part 12: "Dependents") | Confidential |
| `is_nominee` | BOOLEAN | Yes | `false` | — | Nominee (per Part 12: "Nominees") | Confidential |
| `nominee_percentage` | DECIMAL(5,2) | No | NULL | 0-100 | Nominee % | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

### Entity 390 — Workforce Dashboard
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `total_employees` | INTEGER | Yes | `0` | ≥ 0 | Total (per Part 12: "Total Employees") | Internal |
| `new_joiners_today` | INTEGER | Yes | `0` | ≥ 0 | New (per Part 12: "New Joiners") | Internal |
| `contract_workers` | INTEGER | Yes | `0` | ≥ 0 | Contract (per Part 12: "Contract Workers") | Internal |
| `interns` | INTEGER | Yes | `0` | ≥ 0 | Interns (per Part 12: "Interns") | Internal |
| `transfers_today` | INTEGER | Yes | `0` | ≥ 0 | Transfers (per Part 12: "Transfers") | Internal |
| `resignations_today` | INTEGER | Yes | `0` | ≥ 0 | Resignations (per Part 12: "Resignations") | Confidential |
| `workforce_distribution` | JSONB | Yes | `'{}'` | — | By dept/category (per Part 12: "Workforce Distribution") | Internal |
| `organization_strength` | DECIMAL(5,2) | Yes | `0` | 0-100 | Strength (per Part 12: "Organization Strength") | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI workforce insights | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## SECTION 2: Organization Structure, Departments, Positions & Grades (Entities 391-400)

### Entity 391 — Department Master (HR Extension)
Extends Department (Entity A.12, Part 2) with HR-specific attributes.

#### 4. Field Dictionary (HR Extension Fields)
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `division_id` | UUID | No | NULL | FK to `divisions` (Entity 392) | Division (per Part 12: "Division") | Internal |
| `head_employee_id` | UUID | No | NULL | FK to `workforce_master` | Dept head | Internal |
| `total_positions` | INTEGER | Yes | `0` | ≥ 0 | Sanctioned positions | Internal |
| `filled_positions` | INTEGER | Yes | `0` | ≥ 0 | Filled | Internal |
| `vacant_positions` | INTEGER | Yes | `0` | ≥ 0 | Vacant | Internal |
| `default_cost_center_id` | UUID | No | NULL | FK to `cost_centers` | Default cost center | Confidential |

---

### Entity 392 — Division
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `division_code` | VARCHAR(20) | Yes | — | Unique per company | Code | Internal |
| `division_name` | VARCHAR(100) | Yes | — | Min 2 | Name (per Part 12: "Operations", "Commercial", etc.) | Public |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `business_unit_id` | UUID | No | NULL | FK to `business_units` | BU | Internal |
| `head_employee_id` | UUID | No | NULL | FK to `workforce_master` | Division head | Internal |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

### Entity 393 — Position Master
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `position_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `position_title` | VARCHAR(200) | Yes | — | Min 3 | Title (per Part 12: "Warehouse Manager", "Production Operator", etc.) | Public |
| `department_id` | UUID | Yes | — | FK to `departments` | Department | Internal |
| `grade_id` | UUID | No | NULL | FK to `grades` (Entity 395) | Grade | Confidential |
| `designation_id` | UUID | No | NULL | FK to `designations` (Entity 394) | Designation | Internal |
| `job_description` | TEXT | No | NULL | — | JD | Internal |
| `is_sanctioned` | BOOLEAN | Yes | `true` | — | Approved position | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

### Entity 394 — Designation
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `designation_code` | VARCHAR(20) | Yes | — | Unique per company | Code | Internal |
| `designation_name` | VARCHAR(100) | Yes | — | Min 2 | Name (per Part 12: "Junior", "Senior", "Manager", etc.) | Public |
| `level` | INTEGER | Yes | `1` | ≥ 1 | Hierarchy level | Internal |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

### Entity 395 — Grade
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `grade_code` | VARCHAR(20) | Yes | — | Unique per company | Code (per Part 12: "G1", "M1", etc.) | Confidential |
| `grade_name` | VARCHAR(100) | Yes | — | Min 2 | Name (per Part 12: "Executive", etc.) | Confidential |
| `grade_level` | INTEGER | Yes | `1` | ≥ 1 | Level (1 = highest) | Confidential |
| `min_salary` | DECIMAL(18,4) | No | NULL | ≥ 0 | Min salary for grade | **Restricted** |
| `max_salary` | DECIMAL(18,4) | No | NULL | ≥ min_salary | Max salary | **Restricted** |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

### Entity 396 — Reporting Structure
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `employee_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Internal |
| `manager_type` | ENUM | Yes | `REPORTING` | REPORTING, FUNCTIONAL, HR, PROJECT, DOTTED_LINE (per Part 12) | Type | Internal |
| `manager_id` | UUID | Yes | — | FK to `workforce_master` | Manager (per Part 12: "Reporting Manager") | Internal |
| `effective_from` | DATE | Yes | — | — | Effective from | Internal |
| `effective_to` | DATE | No | NULL | — | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

### Entity 397 — Organization Chart
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `chart_type` | ENUM | Yes | `HIERARCHY` | HIERARCHY, DEPARTMENT_TREE, BU_TREE, REPORTING_TREE (per Part 12: "Generates") | Type | Internal |
| `chart_data` | JSONB | Yes | `'{}'` | — | Tree structure: `{ nodes: [...], edges: [...] }` (per Part 12: "Hierarchy", "Reporting Tree") | Internal |
| `generated_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Generation time | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

---

### Entity 398 — Position History
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `change_type` | ENUM | Yes | — | PROMOTION, TRANSFER, DEPARTMENT_CHANGE, DESIGNATION_CHANGE, SALARY_GRADE_CHANGE (per Part 12: "Tracks") | Type | Confidential |
| `old_value` | JSONB | No | NULL | — | Old: `{ position, dept, designation, grade }` | Confidential |
| `new_value` | JSONB | No | NULL | — | New: `{ position, dept, designation, grade }` | Confidential |
| `effective_date` | DATE | Yes | — | — | Effective date | Internal |
| `approved_by` | UUID | Yes | — | FK to `workforce_master` | Approver | Internal |
| `reason` | TEXT | No | NULL | — | Reason | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, COMPLETED | Status | Internal |

---

### Entity 399 — Workforce Transfer
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `transfer_number` | VARCHAR(50) | Yes | — | Unique per company | Display | Internal |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `transfer_type` | ENUM | Yes | — | DEPARTMENT, BRANCH, COMPANY, LOCATION, BUSINESS_UNIT (per Part 12: "Supports") | Type | Internal |
| `from_entity_id` | UUID | Yes | — | — | From | Internal |
| `to_entity_id` | UUID | Yes | — | — | To | Internal |
| `transfer_date` | DATE | Yes | — | — | Date | Internal |
| `approved_by` | UUID | Yes | — | FK to `workforce_master` | Approver | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, COMPLETED, CANCELLED | Status | Internal |

---

### Entity 400 — Organization Dashboard
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `total_departments` | INTEGER | Yes | `0` | ≥ 0 | Depts (per Part 12: "Departments") | Internal |
| `total_managers` | INTEGER | Yes | `0` | ≥ 0 | Managers (per Part 12: "Managers") | Internal |
| `vacant_positions` | INTEGER | Yes | `0` | ≥ 0 | Vacant (per Part 12: "Vacant Positions") | Internal |
| `filled_positions` | INTEGER | Yes | `0` | ≥ 0 | Filled (per Part 12: "Filled Positions") | Internal |
| `avg_span_of_control` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Span (per Part 12: "Span of Control") | Internal |
| `org_growth_pct` | DECIMAL(5,2) | Yes | `0` | — | Growth (per Part 12: "Organization Growth") | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## SECTION 3: Employee Master, Employee Lifecycle & Digital Personnel Management (Entities 401-410)

### Entity 401 — Employee Lifecycle
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `lifecycle_stage` | ENUM | Yes | — | CANDIDATE, OFFER, JOINING, PROBATION, CONFIRMATION, TRANSFER, PROMOTION, TRAINING, PERFORMANCE, RESIGNATION, EXIT, ALUMNI (per Part 12: "Tracks") | Stage | Confidential |
| `stage_start_date` | DATE | Yes | — | — | Start | Internal |
| `stage_end_date` | DATE | No | NULL | ≥ stage_start_date | End | Internal |
| `stage_details` | JSONB | Yes | `'{}'` | — | Stage-specific data | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, COMPLETED | Status | Internal |

---

### Entity 402 — Joining Kit
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | New employee | Internal |
| `kit_items` | JSONB | Yes | `'[]'` | — | Array of `{ item, issued, issued_date }` — ID_CARD, LAPTOP, EMAIL, ACCESS_CARD, UNIFORM, TRAINING (per Part 12: "Supports") | Internal |
| `is_complete` | BOOLEAN | Yes | `false` | — | All items issued | Internal |
| `issued_by` | UUID | Yes | — | FK to `workforce_master` | HR who issued | Internal |
| `joining_date` | DATE | Yes | — | — | Joining date | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, COMPLETED | Status | Internal |

---

### Entity 403 — Probation
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `probation_start_date` | DATE | Yes | — | — | Start | Internal |
| `probation_duration_months` | INTEGER | Yes | `3` | > 0 | Duration (per Part 12: "Duration") | Internal |
| `review_date` | DATE | Yes | — | — | Review date (per Part 12: "Review Date") | Internal |
| `reviewer_id` | UUID | Yes | — | FK to `workforce_master` | Reviewer (per Part 12: "Reviewer") | Internal |
| `review_outcome` | ENUM | No | NULL | PENDING, CONFIRMED, EXTENDED, TERMINATED | Outcome | Confidential |
| `review_comments` | TEXT | No | NULL | — | Comments | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, COMPLETED | Status | Internal |

---

### Entity 404 — Confirmation
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `probation_id` | UUID | Yes | — | FK to `probations` | Source probation | Internal |
| `confirmation_date` | DATE | Yes | — | — | Effective date (per Part 12: "Effective Date") | Internal |
| `confirmed_by` | UUID | Yes | — | FK to `workforce_master` | Approver (per Part 12: "Confirmation Approval") | Confidential |
| `confirmation_letter_file_id` | UUID | No | NULL | FK to `file_attachments` | Letter (per Part 12: "Letter") | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, COMPLETED | Status | Internal |

---

### Entity 405 — Employee Transfer (Lifecycle)
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `transfer_type` | ENUM | Yes | — | COMPANY, DEPARTMENT, LOCATION, MANAGER (per Part 12: "Supports") | Type | Internal |
| `from_details` | JSONB | Yes | `'{}'` | — | Old: `{ company, dept, location, manager }` | Internal |
| `to_details` | JSONB | Yes | `'{}'` | — | New: `{ company, dept, location, manager }` | Internal |
| `effective_date` | DATE | Yes | — | — | Date | Internal |
| `approved_by` | UUID | Yes | — | FK to `workforce_master` | Approver | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, COMPLETED | Status | Internal |

---

### Entity 406 — Promotion
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `old_position_id` | UUID | Yes | — | FK to `position_masters` | Old (per Part 12: "Old Position") | Internal |
| `new_position_id` | UUID | Yes | — | FK to `position_masters` | New (per Part 12: "New Position") | Internal |
| `old_salary` | DECIMAL(18,4) | Yes | — | ≥ 0 | Old (per Part 12: "Old Salary") | **Restricted** |
| `new_salary` | DECIMAL(18,4) | Yes | — | > old_salary | New (per Part 12: "New Salary") | **Restricted** |
| `increase_pct` | DECIMAL(5,2) | No | NULL | — | Increase % | Confidential |
| `effective_date` | DATE | Yes | — | — | Effective (per Part 12: "Effective Date") | Internal |
| `approved_by` | UUID | Yes | — | FK to `workforce_master` | Approver | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, COMPLETED | Status | Internal |

---

### Entity 407 — Resignation
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Employee | Confidential |
| `resignation_date` | DATE | Yes | — | — | Submitted date | Internal |
| `reason` | TEXT | Yes | — | Min 10 chars | Reason (per Part 12: "Reason") | Confidential |
| `notice_period_days` | INTEGER | Yes | `30` | > 0 | Notice (per Part 12: "Notice Period") | Internal |
| `last_working_day` | DATE | Yes | — | — | LWD (per Part 12: "Last Working Day") | Internal |
| `approved_by` | UUID | Yes | — | FK to `workforce_master` | Approval (per Part 12: "Approval") | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, WITHDRAWN | Status | Internal |

---

### Entity 408 — Exit Clearance
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Exiting employee | Confidential |
| `clearance_departments` | JSONB | Yes | `'[]'` | — | Array of `{ dept, cleared, cleared_by, cleared_date }` — IT, HR, FINANCE, ADMIN, SECURITY, MANAGER, WAREHOUSE (per Part 11: "Departments") | Internal |
| `is_full_clearance` | BOOLEAN | Yes | `false` | Generated: all cleared | Full | Internal |
| `last_working_day` | DATE | Yes | — | — | LWD | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, COMPLETED | Status | Internal |

---

### Entity 409 — Alumni Register
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workforce_id` | UUID | Yes | — | FK to `workforce_master` | Former employee (per Part 12: "Former Employees") | Confidential |
| `exit_date` | DATE | Yes | — | — | Exit date | Internal |
| `exit_reason` | VARCHAR(200) | Yes | — | — | Reason | Confidential |
| `experience_years` | DECIMAL(4,1) | Yes | — | ≥ 0 | Experience (per Part 12: "Experience") | Internal |
| `performance_rating` | DECIMAL(3,2) | No | NULL | 0-5 | Last rating | Confidential |
| `eligible_for_rehire` | BOOLEAN | Yes | `false` | — | Rehire (per Part 12: "Eligibility for Rehire") | Confidential |
| `alumni_contact` | JSONB | No | `'{}'` | — | Post-exit contact | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

### Entity 410 — Workforce Mission Dashboard
#### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `new_joiners_count` | INTEGER | Yes | `0` | ≥ 0 | Joiners (per Part 12: "New Joiners") | Internal |
| `on_probation_count` | INTEGER | Yes | `0` | ≥ 0 | Probation (per Part 12: "Probation") | Internal |
| `promotions_count` | INTEGER | Yes | `0` | ≥ 0 | Promotions (per Part 12: "Promotions") | Internal |
| `transfers_count` | INTEGER | Yes | `0` | ≥ 0 | Transfers (per Part 12: "Transfers") | Internal |
| `exits_count` | INTEGER | Yes | `0` | ≥ 0 | Exits (per Part 12: "Exits") | Confidential |
| `open_positions_count` | INTEGER | Yes | `0` | ≥ 0 | Open (per Part 12: "Open Positions") | Internal |
| `org_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Health (per Part 12: "Organization Health") | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI workforce insights (per Part 12 AI) | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Part 12 Sections 1-3 Completion Summary

**All 30 Workforce Foundation entities are now defined** at full enterprise-grade depth.

### Key Architectural Decisions

1. **Enterprise Workforce Identity Service** — Core platform service; one Workforce ID across enterprise (per Enhancement)
2. **Single Workforce Master** — All modules reference Workforce ID, not create employee records
3. **Digital Employee File** — Paperless HR with 14+ document types
4. **Multi-company, Multi-location, Multi-department** — Full enterprise support
5. **Complete Employee Lifecycle** — Candidate → Offer → Joining → Probation → Confirmation → Transfer → Promotion → Resignation → Exit → Alumni
6. **Organization Structure** — Company → BU → Division → Department → Section → Position → Employee
7. **Multi-role support** — Employees can hold multiple positions/roles simultaneously
8. **Position History** — Immutable record of all position changes (promotions, transfers)
9. **Joining Kit** — Digital checklist for new employee onboarding (ID card, laptop, email, access card, uniform, training)
10. **Exit Clearance** — Multi-department clearance workflow (IT, HR, Finance, Admin, Security, Manager, Warehouse)
11. **Alumni Register** — Former employees with rehire eligibility tracking
12. **AI-ready Workforce** — Attrition prediction, succession planning, promotion recommendations, talent heat map

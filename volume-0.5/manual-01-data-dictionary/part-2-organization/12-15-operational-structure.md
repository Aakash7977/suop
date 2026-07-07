# Manual 1 · Part 2 · Entities 12-15 — Operational Structure (Department, Cost Center, Shift, Calendar)

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 2 — Organization Domain |
| Entities | Department (A.12), Cost Center (A.13), Shift (A.14), Calendar (A.15) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## Entity A.12 — Department

### 1. Business Purpose

The `Department` entity represents an **organizational unit within a company** — a functional grouping of employees responsible for a business area. Per Volume 0 Chapter 2 §2.3, SUOP has 12 core departments (Procurement, Warehouse, Manufacturing, Quality Control, Retail, Restaurant, Logistics, Maintenance, Finance, HR, IT, Executive) plus Product Management (added in Q37) = **13 seeded departments**.

Departments are the **primary scoping dimension for approvals, ownership, and KPIs**. Every business object has a `responsible_department_id` (per Ch 4 §4.8). Every approval flow is routed by department. Every KPI is owned by a department.

Departments can be **hierarchical** (parent → sub-department) and **facility-scoped** (a department may exist at one facility but not another — e.g., Manufacturing Dept at Factory A but not at a retail store).

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — HR Head |
| Data Owner | HR Head |
| Technical Owner | Backend Lead — Organization Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `departments` |
| Prisma Model | `Department` |
| File Location | `prisma/schema/master/organization/department.prisma` |
| Partitioning | None (low volume — max ~100 departments) |

### 4. Field Dictionary

#### Universal Base Fields (per Part 1 §3)

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID |
| `code` | VARCHAR(20) | Yes | — | Unique per company, Number Series `DEPT-` | Department code (e.g., `PROC`, `WH`, `MFG`) |
| `company_id` | UUID | Yes | — | FK to companies | Owning company |
| `facility_id` | UUID | No | NULL | FK to facilities; NULL = company-wide department | Facility scope (NULL means department exists company-wide) |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ARCHIVED | Operational status |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto | Last modification |
| `created_by` | UUID | Yes | — | FK to user_accounts | Creator |
| `updated_by` | UUID | Yes | — | FK to user_accounts | Modifier |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft delete |
| `version` | INTEGER | Yes | `1` | — | Optimistic concurrency |

#### Department-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `name` | VARCHAR(100) | Yes | — | Min 2, max 100, unique per company | Department name (e.g., "Procurement") | Public | — |
| `name_short` | VARCHAR(30) | Yes | — | Min 2, max 30 | Short name (e.g., "Proc") | Public | — |
| `description` | TEXT | No | NULL | — | Department description | Internal | — |
| `department_type` | ENUM | Yes | — | PROCUREMENT, WAREHOUSE, MANUFACTURING, QUALITY_CONTROL, RETAIL, RESTAURANT, LOGISTICS, MAINTENANCE, FINANCE, HR, IT, EXECUTIVE, PRODUCT_MANAGEMENT, ADMINISTRATION, OTHER | Seeded department type (per Ch 2 §2.3 + Q37) | Internal | — |
| `parent_dept_id` | UUID | No | NULL | FK self-ref, no cycles | Parent department (hierarchical) | Internal | — |
| `business_unit_id` | UUID | No | NULL | FK to business_units | BU this department belongs to | Internal | — |
| `head_employee_id` | UUID | No | NULL | FK to employees | Department head (L2 role) | Internal | — |
| `default_cost_center_id` | UUID | No | NULL | FK to cost_centers | Default cost center for department expenses | Internal | — |
| `is_seed_department` | BOOLEAN | Yes | `false` | — | If true, one of the 13 seeded departments (cannot be deleted) | Internal | — |
| `default_approval_chain_id` | UUID | No | NULL | FK to approval_flows | Default approval chain for this department (per Ch 2 §2.6) | Internal | — |
| `operating_hours_start` | TIME | No | NULL | — | Default operating hours start | Internal | — |
| `operating_hours_end` | TIME | No | NULL | Must differ from start | Default operating hours end | Internal | — |
| `is_operational_24x7` | BOOLEAN | Yes | `false` | — | 24/7 department (e.g., Maintenance for emergencies) | Internal | — |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Filterable annotations | Internal | — |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| Department → Company | N : 1 | `company_id` | RESTRICT |
| Department → Facility | N : 1 | `facility_id` | SET NULL |
| Department → BusinessUnit | N : 1 | `business_unit_id` | SET NULL |
| Department → Department (parent) | N : 1 | `parent_dept_id` (self-ref) | SET NULL |
| Department → Employee (head) | N : 1 | `head_employee_id` | SET NULL |
| Department → Employee (members) | 1 : N | `employees.primary_department_id` | SET NULL |
| Department → CostCenter | 1 : N | `cost_centers.department_id` | SET NULL |
| Department → Role | 1 : N | `roles.default_department_id` | SET NULL |
| Department → ApprovalFlow | 1 : N | `approval_flows.department_id` | SET NULL |
| Department → BusinessObject (ownership) | 1 : N | `*.responsible_department_id` | RESTRICT (cannot delete dept with owned objects) |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_departments` | PK | `id` |
| `uq_departments_code_company` | UNIQUE | `company_id, code` |
| `uq_departments_name_company` | UNIQUE PARTIAL | `company_id, name WHERE deleted_at IS NULL` |
| `idx_departments_status` | B-TREE | `status, deleted_at` |
| `idx_departments_type` | B-TREE | `company_id, department_type` |
| `idx_departments_parent` | B-TREE | `parent_dept_id` |
| `idx_departments_facility` | B-TREE | `facility_id WHERE facility_id IS NOT NULL` |
| `idx_departments_head` | B-TREE | `head_employee_id` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `code` unique per company | DB |
| 2 | `name` unique per company (active) | DB |
| 3 | `parent_dept_id` cannot reference self | App |
| 4 | `parent_dept_id` cannot create cycle | App (recursive CTE) |
| 5 | `parent_dept_id` must belong to same company | App |
| 6 | `head_employee_id` must be active employee of same company | App + DB |
| 7 | `is_seed_department = true` departments cannot be deleted (only deactivated) | App |
| 8 | `department_type` is immutable once set (for seed departments) | App |
| 9 | If `facility_id` is set, department is facility-scoped; if NULL, company-wide | App logic |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/departments` (GET, POST), `/api/v1/departments/:id` (GET, PATCH), `/api/v1/departments/:id/employees` (GET), `/api/v1/departments/:id/cost-centers` (GET), `/api/v1/departments/:id/children` (GET) |
| **UI** | Department List (AG Grid with type filter), Department Detail (tabbed: Employees, Cost Centers, Roles, Approvals), Department Hierarchy Tree |
| **Mobile** | Department info, department-scoped task routing, department filter on dashboards |
| **Reports** | Department Headcount, Department Cost Analysis, Department KPI Performance, Department Comparison |
| **Audit** | Full; mandatory reason for head change, type change, parent change |

### 13-15. Security / AI / Performance

| Fields | Classification |
|---|---|
| `name`, `name_short`, `department_type` | Public |
| `head_employee_id`, `business_unit_id`, `default_cost_center_id` | Internal |
| `default_approval_chain_id`, `operating_hours_*` | Internal |
| `is_seed_department` | Internal |

**AI**: Workforce Planning AI (headcount optimization), Resource Allocation AI (cross-department resource recommendations), Department Performance AI.

**Performance**: < 100 per company; Redis cache TTL 1 hour.

### 16. Example Records

```json
{
  "id": "01928f7a-...-dept-proc",
  "code": "PROC",
  "company_id": "01928f7a-...-company",
  "facility_id": null,
  "name": "Procurement",
  "name_short": "Proc",
  "department_type": "PROCUREMENT",
  "head_employee_id": "01928f7a-...-emp-proc-head",
  "default_cost_center_id": "01928f7a-...-cc-proc",
  "is_seed_department": true,
  "status": "ACTIVE",
  "version": 1
}
```

```json
{
  "id": "01928f7a-...-dept-mfg-pune",
  "code": "MFG-PUN",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "name": "Manufacturing - Pune Factory",
  "name_short": "MFG-Pune",
  "department_type": "MANUFACTURING",
  "parent_dept_id": "01928f7a-...-dept-mfg",
  "business_unit_id": "01928f7a-...-bu-mfg",
  "head_employee_id": "01928f7a-...-emp-mfg-mgr-pune",
  "operating_hours_start": "06:00:00",
  "operating_hours_end": "22:00:00",
  "is_operational_24x7": false,
  "status": "ACTIVE",
  "version": 2
}
```

---

## Entity A.13 — Cost Center

### 1. Business Purpose

The `CostCenter` entity represents a **financial reporting unit** within the organization — a logical grouping for tracking costs, expenses, and (optionally) revenues. Cost centers enable the Finance department to analyze spending by department, facility, project, or activity.

Per Volume 0 Chapter 4 §4.3, Cost Centers are part of both Organization Masters and Finance Masters. They bridge operational data (departments, facilities) and financial data (general ledger, expense tracking).

Cost centers are **hierarchical** — a parent cost center rolls up costs from child cost centers. This enables multi-level financial reporting (e.g., "Manufacturing cost" rolls up from "Sweets production", "Namkeen production", etc.).

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Finance Head |
| Data Owner | Finance Head |
| Technical Owner | Backend Lead — Finance Module |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `cost_centers` |
| Prisma Model | `CostCenter` |

### 4. Field Dictionary

#### Universal Base + Cost Center-Specific

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | — |
| `code` | VARCHAR(20) | Yes | — | Unique per company, Number Series `CC-` | Cost center code (e.g., `CC-MFG-SWT`) | Internal |
| `company_id` | UUID | Yes | — | FK to companies | Owning company | — |
| `facility_id` | UUID | No | NULL | FK to facilities | Facility scope (NULL = company-wide) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ARCHIVED | Status | — |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard fields | — |
| `name` | VARCHAR(100) | Yes | — | Min 3, unique per company | Cost center name | Internal |
| `name_short` | VARCHAR(30) | Yes | — | Min 2 | Short name | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `parent_cc_id` | UUID | No | NULL | FK self-ref, no cycles | Parent cost center (hierarchical) | Internal |
| `department_id` | UUID | No | NULL | FK to departments | Owning department | Internal |
| `business_unit_id` | UUID | No | NULL | FK to business_units | Owning business unit | Internal |
| `cost_center_type` | ENUM | Yes | `EXPENSE` | EXPENSE, REVENUE, PROFIT, INVESTMENT, SERVICE | Cost center type | Confidential |
| `is_profit_center` | BOOLEAN | Yes | `false` | — | If true, tracks revenue + cost → profit | Confidential |
| `is_active_for_posting` | BOOLEAN | Yes | `true` | — | If false, no new GL entries can be posted | Confidential |
| `gl_account_code` | VARCHAR(20) | No | NULL | FK to gl_accounts | Default GL account for this cost center | Confidential |
| `budget_annual` | DECIMAL(18,4) | No | NULL | ≥ 0 | Annual budget (in base currency) | Confidential |
| `budget_used` | DECIMAL(18,4) | No | `0` | ≥ 0 | Budget consumed YTD (denormalized) | Confidential |
| `budget_remaining` | DECIMAL(18,4) | No | — | Generated: `budget_annual - budget_used` | Remaining budget | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | ISO 4217 | Budget currency | Internal |
| `fiscal_year` | INTEGER | No | NULL | YYYY | Fiscal year for budget | Internal |
| `effective_from` | DATE | No | NULL | — | Effective dating | Internal |
| `effective_to` | DATE | No | NULL | Must be > effective_from | Effective dating end | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

### 5-12. Relationships / Index / Validation / API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **Relationships** | CostCenter → Company (N:1), → Department (N:1), → BusinessUnit (N:1), → Facility (N:1), → CostCenter parent (N:1 self-ref), → GLAccount (N:1), → FinancialLedger (1:N), → PurchaseOrder (1:N via cost_center_id) |
| **Index** | `uq_cost_centers_code_company`, `uq_cost_centers_name_company`, `idx_cost_centers_parent`, `idx_cost_centers_department`, `idx_cost_centers_type` |
| **Validation** | `code` unique per company, `parent_cc_id` no self-ref/cycle, `budget_used` ≤ `budget_annual` (enforced at posting time), `effective_to` > `effective_from`, GL account must be active |
| **API** | `/api/v1/cost-centers` (GET, POST), `/api/v1/cost-centers/:id` (GET, PATCH), `/api/v1/cost-centers/:id/budget` (GET), `/api/v1/cost-centers/:id/hierarchy` (GET), `/api/v1/cost-centers/:id/children` (GET) |
| **UI** | Cost Center List (AG Grid), Cost Center Detail (tabbed: Budget, GL Entries, Hierarchy), Cost Center Hierarchy Tree, Budget vs Actual Dashboard |
| **Mobile** | View-only cost center info (for approvers checking budget), budget alert notifications |
| **Reports** | Cost Center Budget vs Actual, Cost Center Hierarchy Rollup, Department-wise Cost Analysis, Profit Center Performance |
| **Audit** | Full; **mandatory reason** for budget change, GL account change, is_active_for_posting change, type change |

### 13-16. Security / AI / Performance / Example

**Security**: `name`, `code` = Internal; `cost_center_type`, `is_profit_center`, `budget_*`, `gl_account_code` = Confidential (L2+ Finance only).

**AI**: Budget Forecast AI (predicts budget overrun), Cost Optimization AI (identifies cost-saving opportunities), Profitability AI (analyzes profit center performance).

**Performance**: < 200 per company; Redis cache TTL 1 hour.

```json
{
  "id": "01928f7a-...-cc-mfg-swt",
  "code": "CC-MFG-SWT",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "name": "Sweets Production Cost Center",
  "name_short": "Sweets CC",
  "parent_cc_id": "01928f7a-...-cc-mfg",
  "department_id": "01928f7a-...-dept-mfg-pune",
  "business_unit_id": "01928f7a-...-bu-mfg",
  "cost_center_type": "EXPENSE",
  "is_profit_center": false,
  "is_active_for_posting": true,
  "gl_account_code": "5001-MFG-SWT",
  "budget_annual": 5000000.0000,
  "budget_used": 2100000.0000,
  "budget_remaining": 2900000.0000,
  "currency_code": "INR",
  "fiscal_year": 2026,
  "status": "ACTIVE",
  "version": 4
}
```

---

## Entity A.14 — Shift

### 1. Business Purpose

The `Shift` entity defines **work schedules** for employees. Per Volume 0 Chapter 2 §2.2, Sudhastar operates manufacturing in multiple shift patterns (single, double, triple). Shifts are critical for:

- **Task routing** — tasks are assigned to users on active shift (per Ch 9 §9.7 Smart Recipient Resolution)
- **Attendance tracking** — employees clock in/out against their assigned shift
- **Notification routing** — notifications respect shift hours (no alerts to off-shift users except Critical)
- **Production planning** — production orders are scheduled against shift capacity
- **Payroll calculation** — shift differentials (night shift premium, overtime)

Shifts can be **facility-scoped** (Pune factory shifts differ from Mumbai shifts) and **department-scoped** (Manufacturing shifts differ from Retail shifts).

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — HR Head |
| Data Owner | HR Head |
| Technical Owner | Backend Lead — HR Module |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `shifts` |
| Prisma Model | `Shift` |

### 4. Field Dictionary

#### Universal Base + Shift-Specific

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | — |
| `code` | VARCHAR(20) | Yes | — | Unique per company, Number Series `SFT-` | Shift code (e.g., `A`, `B`, `GEN`) | Public |
| `company_id` | UUID | Yes | — | FK to companies | Owning company | — |
| `facility_id` | UUID | No | NULL | FK to facilities | Facility scope (NULL = company-wide) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ARCHIVED | Status | — |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard | — |
| `name` | VARCHAR(100) | Yes | — | Min 3 | Shift name (e.g., "Morning Shift", "General Shift") | Public |
| `name_short` | VARCHAR(20) | Yes | — | Min 1 | Short name (e.g., "A", "Gen") | Public |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `shift_type` | ENUM | Yes | — | GENERAL, MORNING, AFTERNOON, NIGHT, SPLIT, FLEXIBLE | Shift category | Internal |
| `start_time` | TIME | Yes | — | — | Shift start time (local facility timezone) | Public |
| `end_time` | TIME | Yes | — | Can be < start_time (overnight shift) | Shift end time | Public |
| `break_duration_min` | INTEGER | Yes | `30` | 0–180 | Break duration in minutes | Internal |
| `grace_period_late_min` | INTEGER | Yes | `10` | 0–60 | Grace period for late arrival | Internal |
| `grace_period_early_leave_min` | INTEGER | Yes | `10` | 0–60 | Grace period for early departure | Internal |
| `overtime_threshold_min` | INTEGER | No | NULL | > 0 | Minutes after end_time before overtime applies | Internal |
| `overtime_rate_multiplier` | DECIMAL(3,2) | No | `1.50` | > 1.0 | Overtime pay rate multiplier | Confidential |
| `night_shift_allowance` | DECIMAL(10,2) | No | `0` | ≥ 0 | Night shift allowance (in base currency) | Confidential |
| `is_overnight` | BOOLEAN | Yes | `false` | Generated: `end_time < start_time` | Whether shift crosses midnight | Internal |
| `operating_days` | VARCHAR(20)[] | Yes | `ARRAY['MON','TUE','WED','THU','FRI','SAT']::VARCHAR[]` | Subset of MON-SUN | Days this shift operates | Internal |
| `department_id` | UUID | No | NULL | FK to departments | Department scope (NULL = all departments at facility) | Internal |
| `color_code` | VARCHAR(7) | No | NULL | Hex color | UI color for calendar display | Public |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

### 5-12. Relationships / Index / Validation / API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **Relationships** | Shift → Company (N:1), → Facility (N:1), → Department (N:1), → Employee (1:N via employees.default_shift_id), → AttendanceLog (1:N), → ShiftAssignment (1:N), → ProductionOrder (1:N — scheduled shift) |
| **Index** | `uq_shifts_code_company`, `idx_shifts_facility_dept`, `idx_shifts_type`, `idx_shifts_status` |
| **Validation** | `code` unique per company, `end_time` ≠ `start_time`, `overtime_rate_multiplier` > 1.0 if set, `operating_days` non-empty, `break_duration_min` < total shift duration |
| **API** | `/api/v1/shifts` (GET, POST), `/api/v1/shifts/:id` (GET, PATCH), `/api/v1/shifts/:id/employees` (GET), `/api/v1/shifts/active?facilityId=X&time=T` (GET — find active shift at a facility) |
| **UI** | Shift List, Shift Detail, Shift Calendar (visual), Shift Assignment Manager |
| **Mobile** | Shift info card, shift-based task routing, shift change notifications, clock in/out |
| **Reports** | Shift-wise Attendance, Shift Productivity, Overtime Analysis, Shift Cost Analysis |
| **Audit** | Full; **mandatory reason** for time change, overtime rate change, allowance change |

### 13-16. Security / AI / Performance / Example

**Security**: `name`, `code`, `start_time`, `end_time` = Public; `break_duration_min`, `grace_period_*` = Internal; `overtime_*`, `night_shift_allowance` = Confidential.

**AI**: Workforce Planning AI (shift optimization), Attendance Pattern AI (detects absenteeism patterns), Production Scheduling AI (matches production to shift capacity).

**Performance**: < 50 per company; Redis cache TTL 1 hour.

```json
{
  "id": "01928f7a-...-shift-a",
  "code": "A",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "name": "Morning Shift (Shift A)",
  "name_short": "A",
  "shift_type": "MORNING",
  "start_time": "06:00:00",
  "end_time": "14:00:00",
  "break_duration_min": 30,
  "grace_period_late_min": 10,
  "grace_period_early_leave_min": 10,
  "overtime_threshold_min": 60,
  "overtime_rate_multiplier": 1.50,
  "is_overnight": false,
  "operating_days": ["MON","TUE","WED","THU","FRI","SAT"],
  "department_id": "01928f7a-...-dept-mfg-pune",
  "color_code": "#10B981",
  "status": "ACTIVE",
  "version": 1
}
```

Night shift example:
```json
{
  "id": "01928f7a-...-shift-c",
  "code": "C",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "name": "Night Shift (Shift C)",
  "name_short": "C",
  "shift_type": "NIGHT",
  "start_time": "22:00:00",
  "end_time": "06:00:00",
  "break_duration_min": 30,
  "overtime_threshold_min": 60,
  "overtime_rate_multiplier": 2.00,
  "night_shift_allowance": 250.00,
  "is_overnight": true,
  "operating_days": ["SUN","MON","TUE","WED","THU","FRI"],
  "color_code": "#6366F1",
  "status": "ACTIVE",
  "version": 2
}
```

---

## Entity A.15 — Calendar

### 1. Business Purpose

The `Calendar` entity defines **working days, holidays, and facility-specific operational calendars**. It determines which days are business days for:

- **Production planning** — production orders scheduled only on working days
- **Delivery scheduling** — transfers and dispatches on working days
- **SLA calculation** — SLA deadlines skip non-working days (per Ch 9 §9.9)
- **Payroll** — working day count for monthly salary
- **Attendance** — expected vs actual working days
- **Compliance deadlines** — regulatory filing dates adjusted for holidays

Calendars are **facility-scoped** (Pune factory may have different holidays than Mumbai factory) and **year-based** (each year has its own calendar definition). They support three day types: WORKING_DAY, HOLIDAY, WEEKLY_OFF.

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — HR Head |
| Data Owner | HR Head |
| Technical Owner | Backend Lead — Organization Module |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `calendars` (header) + `calendar_days` (line items) |
| Prisma Models | `Calendar`, `CalendarDay` |
| Pattern | Header-line (one calendar → many days) |

### 4. Field Dictionary

#### 4.1 Calendar Header

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | — |
| `code` | VARCHAR(20) | Yes | — | Unique per company, Number Series `CAL-` | Calendar code (e.g., `CAL-2026-PUN`) | Internal |
| `company_id` | UUID | Yes | — | FK to companies | Owning company | — |
| `facility_id` | UUID | No | NULL | FK to facilities | Facility scope (NULL = company-wide calendar) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ARCHIVED | Status | — |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard | — |
| `name` | VARCHAR(100) | Yes | — | Min 3 | Calendar name (e.g., "Pune Factory Calendar 2026") | Public |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `year` | INTEGER | Yes | — | YYYY, unique per company+facility | Calendar year | Internal |
| `calendar_type` | ENUM | Yes | `FACILITY` | COMPANY, FACILITY, DEPARTMENT | Calendar scope type | Internal |
| `department_id` | UUID | No | NULL | FK to departments; required if calendar_type=DEPARTMENT | Department scope | Internal |
| `default_working_days` | VARCHAR(20)[] | Yes | `ARRAY['MON','TUE','WED','THU','FRI','SAT']::VARCHAR[]` | Subset of MON-SUN | Default weekly working days | Internal |
| `weekly_off_days` | VARCHAR(20)[] | Yes | `ARRAY['SUN']::VARCHAR[]` | Subset of MON-SUN | Default weekly off days | Internal |
| `default_working_hours_start` | TIME | No | NULL | — | Default working hours start | Internal |
| `default_working_hours_end` | TIME | No | NULL | — | Default working hours end | Internal |
| `total_working_days` | INTEGER | No | NULL | ≥ 0 | Total working days in year (computed) | Internal |
| `total_holidays` | INTEGER | No | NULL | ≥ 0 | Total holidays in year (computed) | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

#### 4.2 Calendar Day (Line Item)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | — |
| `calendar_id` | UUID | Yes | — | FK to calendars | Parent calendar | — |
| `date` | DATE | Yes | — | Unique per calendar | The calendar date | Public |
| `day_type` | ENUM | Yes | — | WORKING_DAY, HOLIDAY, WEEKLY_OFF, RESTRICTED_HOLIDAY | Type of day | Public |
| `day_name` | VARCHAR(50) | No | NULL | — | Display name for holidays (e.g., "Diwali", "Republic Day") | Public |
| `day_of_week` | VARCHAR(10) | Yes | — | Computed from date | MON, TUE, etc. | Public |
| `is_half_day` | BOOLEAN | Yes | `false` | — | If true, half-day working | Internal |
| `half_day_hours` | DECIMAL(4,2) | No | NULL | > 0; required if is_half_day=true | Working hours for half day | Internal |
| `is_national_holiday` | BOOLEAN | Yes | `false` | — | If true, national holiday (mandatory closure) | Internal |
| `is_gazetted_holiday` | BOOLEAN | Yes | `false` | — | If true, government gazetted holiday | Internal |
| `holiday_description` | TEXT | No | NULL | — | Description of holiday | Internal |
| `alternate_working_day` | DATE | No | NULL | — | If this is a holiday, alternative working day (for make-up) | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |

### 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| Calendar → Company | N : 1 | `company_id` | RESTRICT |
| Calendar → Facility | N : 1 | `facility_id` | CASCADE |
| Calendar → Department | N : 1 | `department_id` | SET NULL |
| Calendar → CalendarDay | 1 : N | `calendar_days.calendar_id` | CASCADE (delete calendar → delete all days) |
| CalendarDay → Calendar | N : 1 | `calendar_id` | — |

### 6. Index Strategy

| Index | Type | Columns |
|---|---|---|
| `pk_calendars` | PK | `id` |
| `uq_calendars_year_facility` | UNIQUE | `company_id, facility_id, year` |
| `uq_calendars_year_company` | UNIQUE PARTIAL | `company_id, year WHERE facility_id IS NULL` |
| `idx_calendars_type` | B-TREE | `calendar_type` |
| `pk_calendar_days` | PK | `id` |
| `uq_calendar_days_date` | UNIQUE | `calendar_id, date` |
| `idx_calendar_days_date` | B-TREE | `calendar_id, date` |
| `idx_calendar_days_type` | B-TREE | `calendar_id, day_type` |

### 7. Validation Rules

| # | Rule | Layer |
|---|---|---|
| 1 | `year` unique per company+facility | DB |
| 2 | Each calendar must have 365 (or 366 for leap year) calendar days | App |
| 3 | `date` unique per calendar | DB |
| 4 | `day_of_week` auto-computed from `date` | App |
| 5 | `default_working_days` + `weekly_off_days` must cover all 7 days | App |
| 6 | If `is_half_day = true`, `half_day_hours` required | DB CHECK |
| 7 | `alternate_working_day` if set must be in same calendar year | App |
| 8 | Cannot delete calendar for current year (only next year+) | App |

### 8-12. API / UI / Mobile / Reports / Audit

| Section | Summary |
|---|---|
| **API** | `/api/v1/calendars` (GET, POST), `/api/v1/calendars/:id` (GET, PATCH), `/api/v1/calendars/:id/days` (GET), `/api/v1/calendars/:id/days/:date` (GET — specific day), `/api/v1/calendars/is-working-day?date=X&facilityId=Y` (GET — quick check), `/api/v1/calendars/:id/generate` (POST — auto-generate days for year) |
| **UI** | Calendar List, Calendar Detail (year view with color-coded days), Holiday Manager, Working Day Configurator |
| **Mobile** | Today's status (working day / holiday), upcoming holidays, shift schedule based on calendar |
| **Reports** | Working Days Report (per month/year), Holiday List, Attendance vs Calendar (expected vs actual working days), SLA Calendar Impact |
| **Audit** | Full; **mandatory reason** for day_type change (especially WORKING_DAY → HOLIDAY), holiday addition/removal |

### 13-16. Security / AI / Performance / Example

**Security**: `name`, `year` = Public; `calendar_type`, `default_working_days` = Internal; `total_working_days`, `total_holidays` = Internal; CalendarDay: `date`, `day_type`, `day_name` = Public; `is_half_day`, `half_day_hours` = Internal.

**AI**: Production Scheduling AI (uses working days for capacity planning), Attendance Anomaly AI (detects patterns of absence on specific day types), SLA Prediction AI (predicts SLA breaches based on calendar).

**Performance**: < 20 calendars per company; ~366 rows per calendar in calendar_days (partitioning not needed — total < 10,000 rows); Redis cache TTL 24 hours (calendars change rarely).

```json
{
  "id": "01928f7a-...-cal-2026-pun",
  "code": "CAL-2026-PUN",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-plt-01",
  "name": "Pune Factory Calendar 2026",
  "year": 2026,
  "calendar_type": "FACILITY",
  "default_working_days": ["MON","TUE","WED","THU","FRI","SAT"],
  "weekly_off_days": ["SUN"],
  "default_working_hours_start": "06:00:00",
  "default_working_hours_end": "22:00:00",
  "total_working_days": 312,
  "total_holidays": 10,
  "status": "ACTIVE",
  "version": 1
}
```

Calendar Day examples:
```json
[
  {
    "id": "01928f7a-...-cd-2026-01-01",
    "calendar_id": "01928f7a-...-cal-2026-pun",
    "date": "2026-01-01",
    "day_type": "HOLIDAY",
    "day_name": "New Year's Day",
    "day_of_week": "THU",
    "is_national_holiday": true,
    "holiday_description": "New Year's Day — mandatory closure"
  },
  {
    "id": "01928f7a-...-cd-2026-01-02",
    "calendar_id": "01928f7a-...-cal-2026-pun",
    "date": "2026-01-02",
    "day_type": "WORKING_DAY",
    "day_of_week": "FRI"
  },
  {
    "id": "01928f7a-...-cd-2026-01-04",
    "calendar_id": "01928f7a-...-cal-2026-pun",
    "date": "2026-01-04",
    "day_type": "WEEKLY_OFF",
    "day_of_week": "SUN"
  },
  {
    "id": "01928f7a-...-cd-2026-01-26",
    "calendar_id": "01928f7a-...-cal-2026-pun",
    "date": "2026-01-26",
    "day_type": "HOLIDAY",
    "day_name": "Republic Day",
    "day_of_week": "MON",
    "is_national_holiday": true,
    "is_gazetted_holiday": true
  },
  {
    "id": "01928f7a-...-cd-2026-10-21",
    "calendar_id": "01928f7a-...-cal-2026-pun",
    "date": "2026-10-21",
    "day_type": "HOLIDAY",
    "day_name": "Diwali (Laxmi Pujan)",
    "day_of_week": "WED",
    "is_national_holiday": false,
    "holiday_description": "Diwali festival — main celebration day"
  }
]
```

---

## Part 2 Completion Summary

**All 15 Organization Domain entities are now defined** at full enterprise-grade depth:

| Entity | File | Status |
|---|---|---|
| A.1 Company | `01-company.md` | ✅ Complete |
| A.2 Business Unit | `02-business-unit.md` | ✅ Complete |
| A.3 Brand | `03-brand.md` | ✅ Complete |
| A.4 Facility | `04-facility.md` | ✅ Complete |
| A.5 Plant | `05-plant.md` | ✅ Complete |
| A.6 Warehouse | `06-warehouse.md` | ✅ Complete |
| A.7-A.11 Zone, Aisle, Rack, Shelf, Bin | `07-11-location-hierarchy.md` | ✅ Complete |
| A.12 Department | `12-15-operational-structure.md` | ✅ Complete |
| A.13 Cost Center | `12-15-operational-structure.md` | ✅ Complete |
| A.14 Shift | `12-15-operational-structure.md` | ✅ Complete |
| A.15 Calendar | `12-15-operational-structure.md` | ✅ Complete |

### Key Architectural Decisions in Part 2

1. **Single-table inheritance for Facility specializations** — Plant and Warehouse are views on the `facilities` table, avoiding polymorphic joins
2. **Single-table with discriminator for Location Hierarchy** — Zone/Aisle/Rack/Shelf/Bin all live in `locations` table with `location_level` discriminator
3. **Header-line pattern for Calendar** — `calendars` (header) + `calendar_days` (line items, one per date)
4. **Barcode values auto-generated from hierarchy path** — e.g., `SDH-WH-RM-01-Z01-A-R01-S01-B01`
5. **Coordinate fields reserved on all location entities** — for Smart Warehouse Navigation (per Ch 17 enhancement)
6. **IoT-ready fields** — `temp_sensor_count`, `temp_logging_interval_min`, `has_iot_sensors` on Warehouse for future cold chain monitoring
7. **Robotics-ready fields** — `has_conveyor_system`, `has_agv_fleet` on Warehouse for future automation (per Ch 24)
8. **Capacity tracking denormalized** — `current_load_kg`, `current_stock_qty`, `used_bin_capacity` updated by event handlers (per Ch 10 Q1 event-updated summary pattern)

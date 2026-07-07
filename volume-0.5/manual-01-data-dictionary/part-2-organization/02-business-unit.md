# Manual 1 · Part 2 · Entity 2 — Business Unit

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 2 — Organization Domain |
| Entity | Business Unit |
| Entity Code | A.2 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Last Updated | 2026-07-07 |

---

## 1. Business Purpose

The `BusinessUnit` entity represents a **major operational division** within a Company — a strategic grouping of facilities, departments, and activities that share a common business objective. For Sudhastar, the primary Business Units are:

- **Manufacturing** — Sweets, Namkeen, Bakery, Snacks, RTE, Frozen Foods
- **Retail** — Sudhamrit stores
- **Restaurant** — Sudhamrit Food Joints
- **Distribution** — Logistics and dispatch
- **Procurement** — Centralized purchasing (future)

Business Units enable **strategic reporting, cost center rollups, and cross-facility coordination**. They sit between Company (legal entity) and Facility (physical location) in the organizational hierarchy. A Business Unit may span multiple facilities (e.g., Manufacturing BU covers Factory A + Factory B + Central Warehouse).

---

## 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Managing Director / CEO |
| Data Owner | Administration Head |
| Technical Owner | Backend Lead — Organization Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

---

## 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `master` |
| Table Name | `business_units` |
| Prisma Model | `BusinessUnit` |
| File Location | `prisma/schema/master/organization/business_unit.prisma` |
| Partitioning | None (low volume — max ~20 BUs) |
| Lifecycle | Master Data Lifecycle (Volume 0 Ch 7 §7.5) |

---

## 4. Field Dictionary

### 4.1 Universal Base Fields (per Part 1 §3)

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | `uuid_generate_v7()` | PK, immutable | Internal primary key |
| `code` | VARCHAR(20) | Yes | — | Unique per company, format `^[A-Z]{2,10}$`, Number Series `BU-` | Business code (e.g., `MFG`) |
| `company_id` | UUID | Yes | — | FK to `companies.id` | Owning company |
| `facility_id` | UUID | No | NULL | — | **Exception**: NULL for BU — BU spans multiple facilities |
| `status` | ENUM | Yes | `DRAFT` | 8-stage master lifecycle | Master data lifecycle |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation timestamp (UTC) |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto-update | Last modification (UTC) |
| `created_by` | UUID | Yes | — | FK to `user_accounts.id` | Creator |
| `updated_by` | UUID | Yes | — | FK to `user_accounts.id` | Last modifier |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft-delete timestamp |
| `version` | INTEGER | Yes | `1` | Optimistic concurrency | Increments on each update |

### 4.2 Business Unit-Specific Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `name` | VARCHAR(100) | Yes | — | Min 3, max 100 chars | Display name (e.g., "Manufacturing Division") | Public | — |
| `name_short` | VARCHAR(30) | Yes | — | Min 2, max 30 chars | Short name (e.g., "MFG") | Public | — |
| `description` | TEXT | No | NULL | — | Detailed description | Internal | — |
| `bu_type` | ENUM | Yes | — | MANUFACTURING, RETAIL, RESTAURANT, DISTRIBUTION, PROCUREMENT, FINANCE, HR, IT, ADMIN, OTHER | Business unit category | Internal | — |
| `parent_bu_id` | UUID | No | NULL | FK self-ref, no cycles | Parent BU for hierarchical structure | Internal | — |
| `head_employee_id` | UUID | No | NULL | FK to `employees.id` | BU Head (L2 role) | Internal | — |
| `cost_center_id` | UUID | No | NULL | FK to `cost_centers.id` | Default cost center for BU | Internal | — |
| `is_profit_center` | BOOLEAN | Yes | `false` | — | If true, BU tracks its own P&L | Internal | — |
| `is_cost_center` | BOOLEAN | Yes | `true` | — | If true, BU tracks costs | Internal | — |
| `fiscal_year_start_month` | SMALLINT | No | NULL | 1–12; NULL = inherit from company | BU-specific fiscal year override | Internal | — |
| `base_currency_code` | CHAR(3) | No | NULL | ISO 4217; NULL = inherit from company | BU-specific currency override | Internal | — |
| `effective_from` | DATE | No | NULL | — | Effective dating (per Ch 7 §7.11) | Internal | — |
| `effective_to` | DATE | No | NULL | Must be > effective_from if set | Effective dating end | Internal | — |
| `remarks` | TEXT | No | NULL | — | Free-text annotation | Internal | — |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Filterable annotations | Internal | — |

---

## 5. Relationships

| Relationship | Cardinality | Direction | FK Field | Cascade | Delete Rule |
|---|---|---|---|---|---|
| BusinessUnit → Company | N : 1 | inbound | `business_units.company_id` → `companies.id` | RESTRICT | Cannot delete company with active BUs |
| BusinessUnit → Facility | 1 : N | outbound | `facilities.business_unit_id` | SET NULL | Facilities become unassigned if BU deleted |
| BusinessUnit → Department | 1 : N | outbound | `departments.business_unit_id` | SET NULL | Departments become unassigned if BU deleted |
| BusinessUnit → CostCenter | 1 : N | outbound | `cost_centers.business_unit_id` | SET NULL | Cost centers become unassigned |
| BusinessUnit → Employee (head) | N : 1 | inbound | `business_units.head_employee_id` → `employees.id` | SET NULL | BU head becomes NULL if employee exits |
| BusinessUnit → BusinessUnit (parent) | N : 1 | self-ref | `business_units.parent_bu_id` | SET NULL | Child BU becomes standalone |
| BusinessUnit → CostCenter (default) | N : 1 | inbound | `business_units.cost_center_id` → `cost_centers.id` | SET NULL | Default cost center becomes NULL |

---

## 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_business_units` | PRIMARY KEY | `id` | Default PK |
| `uq_bu_code_company` | UNIQUE | `company_id, code` | Code uniqueness per company |
| `uq_bu_name_company` | UNIQUE PARTIAL | `company_id, name WHERE deleted_at IS NULL` | Name uniqueness per company (active) |
| `idx_bu_status` | B-TREE | `status, deleted_at` | Default query filter |
| `idx_bu_parent` | B-TREE | `parent_bu_id` | Hierarchy traversal |
| `idx_bu_company_type` | B-TREE | `company_id, bu_type` | Filter by type within company |
| `idx_bu_head` | B-TREE | `head_employee_id` | Find BUs by head |

---

## 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `code` must be unique per company | DB + App | Unique constraint |
| 2 | `name` must be unique per company (among active BUs) | DB + App | Unique partial constraint |
| 3 | `parent_bu_id` cannot reference self | App | Service-layer check |
| 4 | `parent_bu_id` cannot create cycle | App | Recursive CTE check |
| 5 | `parent_bu_id` must belong to same company | App | Service-layer validation |
| 6 | `bu_type` determines which facility types are allowed (e.g., MANUFACTURING BU → PLANT facilities) | App | Service-layer validation |
| 7 | `head_employee_id` must be an active employee of the same company | App + DB | FK + service check |
| 8 | `effective_to` must be > `effective_from` if both set | DB | CHECK constraint |
| 9 | Date ranges of versions must not overlap for same BU | App | Service-layer check |
| 10 | State transition DRAFT → SUBMITTED requires `name`, `bu_type`, `head_employee_id` | App | Master Data Quality Validator |
| 11 | Once ACTIVE, `code` and `bu_type` are immutable | App | Service-layer + audit |

---

## 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/business-units` | GET | List BUs | `ORGANIZATION:VIEW` |
| `/api/v1/business-units/:id` | GET | Get BU details | `ORGANIZATION:VIEW` |
| `/api/v1/business-units` | POST | Create BU (DRAFT) | `ORGANIZATION:CREATE` |
| `/api/v1/business-units/:id` | PATCH | Update BU | `ORGANIZATION:EDIT` |
| `/api/v1/business-units/:id/submit` | POST | Submit for approval | `ORGANIZATION:EDIT` |
| `/api/v1/business-units/:id/approve` | POST | Approve BU | `ORGANIZATION:APPROVE` |
| `/api/v1/business-units/:id/activate` | POST | Activate BU | `ORGANIZATION:APPROVE` |
| `/api/v1/business-units/:id/deactivate` | POST | Deactivate BU | `ORGANIZATION:APPROVE` |
| `/api/v1/business-units/:id/facilities` | GET | List facilities in BU | `ORGANIZATION:VIEW` |
| `/api/v1/business-units/:id/departments` | GET | List departments in BU | `ORGANIZATION:VIEW` |

---

## 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Business Unit List | AG Grid list with type filter | `/organization/business-units` |
| BU Detail | Tabbed: Overview, Facilities, Departments, Cost Centers | `/organization/business-units/:id` |
| BU Create Form | Fields: name, type, head, cost center | `/organization/business-units/new` |
| BU Hierarchy Tree | Visual tree of BU parent-child relationships | `/organization/business-units/hierarchy` |

---

## 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| View-only BU info | Users see which BU their facility belongs to |
| BU filter on dashboards | Filter KPIs by BU (for L2+ roles) |

---

## 11. Reports

| Report | Use of Business Unit |
|---|---|
| BU Performance Report | Revenue, cost, margin per BU |
| Manufacturing Output by BU | Production quantities per Manufacturing BU |
| Retail Sales by BU | Sales per Retail BU |
| Cost Center Rollup | Costs grouped by BU then rolled to company |

---

## 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE | Yes | Optional | Permanent |
| UPDATE (non-critical) | Yes | Optional | Permanent |
| UPDATE (critical: code, bu_type, head) | Yes | **Mandatory** | Permanent |
| STATUS CHANGE | Yes | **Mandatory** | Permanent |
| DELETE (soft) | Yes | **Mandatory** | Permanent |

**Audit Level**: Full

---

## 13. Security Classification

| Field Category | Classification | Access |
|---|---|---|
| `name`, `name_short`, `bu_type` | Public | All authenticated users |
| `head_employee_id`, `cost_center_id` | Internal | L2+ Admin, HR |
| `is_profit_center`, `is_cost_center` | Internal | L2+ Finance |
| `fiscal_year_start_month`, `base_currency_code` | Internal | L2+ Finance |

---

## 14. AI Relevance

| AI Capability | Usage |
|---|---|
| Demand Forecast AI | Per-BU forecasting (Manufacturing vs Retail have different patterns) |
| Cost Optimization AI | Identifies cost anomalies within a BU |
| Resource Allocation AI | Recommends resource shifts between BUs |

---

## 15. Performance Notes

| Consideration | Guidance |
|---|---|
| Row count | < 20 rows per company |
| Cache strategy | Redis cache, TTL 1 hour, invalidated on update |
| Query patterns | Queried by `company_id + code` or `id` (FK) |
| Joins | Frequently joined with Facility, Department, CostCenter |

---

## 16. Example Records

### Example 1: Manufacturing Division

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7ea1",
  "code": "MFG",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Manufacturing Division",
  "name_short": "MFG",
  "description": "Sweets, Namkeen, Bakery, Snacks, RTE, Frozen Foods production",
  "bu_type": "MANUFACTURING",
  "head_employee_id": "01928f7a-...-emp001",
  "is_profit_center": true,
  "is_cost_center": true,
  "status": "ACTIVE",
  "version": 2
}
```

### Example 2: Retail Division

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7ea2",
  "code": "RTL",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Retail Division",
  "name_short": "RTL",
  "bu_type": "RETAIL",
  "head_employee_id": "01928f7a-...-emp002",
  "is_profit_center": true,
  "is_cost_center": true,
  "status": "ACTIVE",
  "version": 1
}
```

### Example 3: Restaurant Division

```json
{
  "id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7ea3",
  "code": "RST",
  "company_id": "01928f7a-3a5e-7d3c-9e6f-4a2b8c5d7e9f",
  "name": "Restaurant Division",
  "name_short": "RST",
  "bu_type": "RESTAURANT",
  "head_employee_id": "01928f7a-...-emp003",
  "is_profit_center": true,
  "is_cost_center": true,
  "status": "ACTIVE",
  "version": 1
}
```

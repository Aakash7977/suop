# Manual 1 · Part 8 · Section 1 · Entities 111-120 — Quality Foundation & Enterprise Quality Architecture

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 8 — Enterprise Quality Management (QMS) |
| Section | 1 — Quality Foundation & Enterprise Quality Architecture |
| Entities | 111–120 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 1 §2.4, Ch 5 §5.10, Ch 7 §7.6, Ch 18 §18.7 |
| Last Updated | 2026-07-07 |

---

## Overview — Enterprise Quality Architecture

The Quality Foundation defines the **standards, specifications, and planning framework** for all quality operations.

```
QUALITY STANDARD (111) — Regulatory/compliance framework (FSSAI, ISO 22000, HACCP)
  ↓ Defines
QUALITY SPECIFICATION (112) — Measurable parameters (moisture, pH, weight, etc.)
  ↓ Planned via
INSPECTION PLAN (114) — What to inspect, when, how often
  ↓ Uses
SAMPLING PLAN (115) + TEST METHOD (116) + QUALITY PARAMETER (117)
  ↓ Executed via
QUALITY CHECKLIST (118) — Digital inspection form
  ↓ Tracked by
INSPECTION TYPE (113) + QUALITY APPROVAL (119) + DASHBOARD (120)
```

### Architectural Decisions (Locked)

| Decision | Value |
|---|---|
| **Risk-based inspection** | Inspection frequency based on product risk + supplier performance |
| **Version-controlled plans** | Inspection Plans are versioned (per Ch 7 §7.6 pattern) |
| **Digital quality records** | Electronic Batch Records (EBR); no paper |
| **No shipment without release** | Quality release mandatory before warehouse dispatch |
| **Digital signatures** | All approvals electronically signed (per Ch 18 §18.9 future-ready) |
| **Full audit history** | All spec changes, results, approvals permanently audited |
| **AI-ready quality metadata** | All entities structured for AI consumption |
| **Mobile-first inspections** | QC inspectors work from mobile/tablets with barcode + photo capture |

---

## Entity 111 — Quality Standard

### 1. Business Purpose
The `QualityStandard` entity represents **enterprise quality requirements** — the regulatory and internal standards that govern food safety and product quality. Per Volume 0 Chapter 18 §18.7, SUOP supports FSSAI, HACCP, ISO 22000, GMP, and future FDA/BRCGS.

### 2-4. Owner / Schema / Fields

| Owner | L2 — Quality Head |
|---|---|
| Schema | `master` |
| Table | `quality_standards` |

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `QSTD-` | Standard code (e.g., `QSTD-FSSAI`) | Public |
| `company_id` | UUID | Yes | — | FK to `companies` | Owning company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE, ARCHIVED | Status | Internal |
| `created_at` / `updated_at` / `created_by` / `updated_by` / `deleted_at` / `version` | — | Yes | — | Universal base | Standard | |
| `standard_code` | VARCHAR(50) | Yes | — | Unique per company | External standard code (e.g., `FSSAI-2011`) | Public |
| `standard_name` | VARCHAR(200) | Yes | — | Min 3 | Standard name | Public |
| `description` | TEXT | No | NULL | — | Detailed description | Internal |
| `category` | ENUM | Yes | — | REGULATORY, INTERNATIONAL, NATIONAL, INDUSTRY, INTERNAL_SOP, CUSTOMER_SPECIFIC | Category (per Part 8) | Internal |
| `regulatory_authority` | VARCHAR(100) | No | NULL | — | Issuing authority (e.g., "FSSAI", "ISO", "FDA") | Public |
| `standard_version` | VARCHAR(20) | No | NULL | — | Version of external standard | Internal |
| `effective_date` | DATE | Yes | — | — | Effective from (per Part 8) | Internal |
| `expiry_date` | DATE | No | NULL | > effective_date if set | Expiry/review date | Internal |
| `is_mandatory` | BOOLEAN | Yes | `true` | — | Mandatory compliance | Confidential |
| `applicable_product_lines` | TEXT[] | No | NULL | Subset of product lines | Applicable product lines | Internal |
| `applicable_facility_types` | TEXT[] | No | NULL | Subset: PLANT, WAREHOUSE, STORE, OUTLET | Applicable facility types | Internal |
| `certificate_file_id` | UUID | No | NULL | FK to `file_attachments` | Certificate document | Confidential |
| `compliance_score` | DECIMAL(5,2) | No | NULL | 0–100 | Current compliance score | Confidential |
| `last_audit_date` | DATE | No | NULL | — | Last compliance audit | Internal |
| `next_audit_due_date` | DATE | No | NULL | — | Next audit due (feeds Compliance Calendar) | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

### 5-16. Standard Pattern
- **Relationships**: → Company, FileAttachment; → QualitySpecification (1:N); → ComplianceCalendarItem (1:N)
- **Index**: `uq_qs_code_company`, `idx_qs_category`, `idx_qs_status`, `idx_qs_authority`, `idx_qs_expiry`
- **Validation**: `code` unique per company; `expiry_date` > `effective_date`; mandatory standards cannot be deactivated without ADR
- **API**: `/api/v1/quality-standards` (GET, POST), `/:id` (GET, PATCH), `/:id/specifications` (GET), `/by-category/:cat` (GET), `/expiring` (GET)
- **UI**: Standard List, Standard Detail (with specs + compliance), Compliance Dashboard, Audit Calendar
- **Reports**: Quality Standards Report, Compliance Status, Audit Due Report, Expiring Standards
- **Audit**: Full; mandatory reason for deactivation, compliance score change
- **Security**: `standard_name`, `standard_code`, `category`, `regulatory_authority` = Public; `compliance_score`, `is_mandatory` = Confidential
- **AI**: Compliance Monitoring AI, Risk Analysis AI, Trend Analysis AI, Audit Prediction AI
- **Performance**: < 50 per company; Redis cache TTL 24 hours

```json
{
  "id": "01928f7a-...-qstd-001",
  "code": "QSTD-FSSAI",
  "company_id": "01928f7a-...-company",
  "standard_code": "FSSAI-2011",
  "standard_name": "FSSAI Food Safety and Standards",
  "category": "REGULATORY",
  "regulatory_authority": "FSSAI",
  "standard_version": "2011",
  "effective_date": "2011-08-05",
  "is_mandatory": true,
  "applicable_product_lines": ["SWEETS", "NAMEKEEN", "BAKERY", "SNACKS", "RTE", "FROZEN"],
  "applicable_facility_types": ["PLANT", "WAREHOUSE", "STORE", "OUTLET"],
  "compliance_score": 94.50,
  "last_audit_date": "2026-03-15",
  "next_audit_due_date": "2026-09-15",
  "status": "ACTIVE",
  "tags": ["fssai", "mandatory", "india", "food-safety"]
}
```

---

## Entity 112 — Quality Specification

### 1. Business Purpose
Defines **measurable specifications** for products — moisture content, weight, sugar %, protein, temperature, viscosity, pH, microbiology, color, taste, odor. Per Volume 0 Chapter 7 §7.6, Quality Specification is one of the **6 versioned master data types**.

### 2-4. Owner / Schema / Fields

| Owner | L2 — Quality Head |
|---|---|
| Schema | `master` |
| Tables | `quality_specifications` (header) + `quality_specification_versions` (versioned) + `quality_specification_lines` (parameters) |
| Pattern | Parent → Version → Lines (per Ch 4 §4.11) |

#### Specification Header

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `QSPEC-` | Spec code | Internal |
| `company_id` | UUID | Yes | — | FK to companies | Owning company | Internal |
| `spec_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Public |
| `product_id` | UUID | Yes | — | FK to `products` | Product this spec applies to | Internal |
| `product_family_id` | UUID | No | NULL | FK to `product_families` | Family (for family-level specs) | Internal |
| `quality_standard_id` | UUID | No | NULL | FK to `quality_standards` | Governing standard (Entity 111) | Confidential |
| `active_version_id` | UUID | No | NULL | FK to `quality_specification_versions` | Active version | Internal |
| `latest_version_number` | INTEGER | Yes | `0` | ≥ 0 | Latest version | Internal |
| `status` | ENUM | Yes | `DRAFT` | 8-stage master lifecycle | Lifecycle | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

#### Specification Version

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `spec_id` | UUID | Yes | — | FK to `quality_specifications` | Parent spec | Internal |
| `version_number` | INTEGER | Yes | — | > 0, unique per spec | Version | Public |
| `change_reason` | TEXT | Yes | — | Min 10 chars | Reason for revision | Internal |
| `effective_from` | DATE | Yes | — | — | Effective date | Internal |
| `effective_to` | DATE | No | NULL | Auto-set when superseded | Effective end | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, REVIEW, APPROVED, RELEASED, RETIRED | Lifecycle | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | QA approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval timestamp | Confidential |
| `is_released` | BOOLEAN | Yes | `false` | — | Immutable after release | Internal |

#### Specification Lines (Parameters)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | | |
| `spec_version_id` | UUID | Yes | — | FK to `quality_specification_versions` | Parent version | Internal | |
| `line_number` | INTEGER | Yes | — | > 0, unique per version | Line number | Internal | |
| `parameter_code` | VARCHAR(30) | Yes | — | FK to `quality_parameters` (Entity 117) | Parameter (e.g., `MOISTURE`, `PH`) | Internal | Defect AI |
| `parameter_name` | VARCHAR(100) | No | NULL | Denormalized | Display name | Public | |
| `target_value` | DECIMAL(18,4) | Yes | — | — | Target value (per Part 8: "Target") | Internal | |
| `min_value` | DECIMAL(18,4) | Yes | — | ≤ target_value | Minimum acceptable (per Part 8: "Minimum") | Internal | |
| `max_value` | DECIMAL(18,4) | Yes | — | ≥ target_value | Maximum acceptable (per Part 8: "Maximum") | Internal | |
| `tolerance_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Tolerance % (per Part 8: "Tolerance") | Internal | |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | UOM (e.g., "%", "°C", "pH") | Internal | |
| `is_critical` | BOOLEAN | Yes | `false` | — | Critical parameter (per Part 8: "Critical Flag") — failure = reject | Confidential | Defect AI |
| `test_method_id` | UUID | No | NULL | FK to `test_methods` (Entity 116) | Test method | Internal | |
| `inspection_frequency` | ENUM | Yes | `EVERY_BATCH` | EVERY_BATCH, EVERY_5TH, RANDOM, ON_DEMAND | Frequency | Internal | |

### 5-16. Standard Pattern
- **Relationships**: → Company, Product, ProductFamily, QualityStandard; → QualitySpecificationVersion (1:N); Version → Lines (1:N)
- **Index**: `uq_qspec_code_company`, `idx_qspec_product`, `idx_qspec_standard`, `idx_qspecv_spec`, `idx_qspecl_version`
- **Validation**: Immutable after RELEASED; `min_value` ≤ `target_value` ≤ `max_value`; at least 1 line before RELEASED
- **AI**: Defect Prediction AI, Quality Prediction AI, Trend Analysis AI

```json
{
  "header": {
    "id": "01928f7a-...-qspec-001",
    "code": "QSPEC-KAJU-001",
    "spec_name": "Kaju Katli 500g Quality Specification",
    "product_id": "01928f7a-...-prod-kaju-katli-500",
    "quality_standard_id": "01928f7a-...-qstd-001",
    "active_version_id": "01928f7a-...-qspec-v2",
    "latest_version_number": 2,
    "status": "ACTIVE"
  },
  "lines": [
    {
      "line_number": 1,
      "parameter_code": "MOISTURE",
      "parameter_name": "Moisture Content",
      "target_value": 8.0000,
      "min_value": 5.0000,
      "max_value": 12.0000,
      "unit_of_measure": "%",
      "is_critical": true,
      "inspection_frequency": "EVERY_BATCH"
    },
    {
      "line_number": 3,
      "parameter_code": "MICRO_TPC",
      "parameter_name": "Total Plate Count",
      "target_value": 10000.0000,
      "min_value": 0.0000,
      "max_value": 50000.0000,
      "unit_of_measure": "CFU/g",
      "is_critical": true,
      "inspection_frequency": "EVERY_BATCH"
    }
  ]
}
```

---

## Entity 113 — Inspection Type

### 1. Business Purpose
Reference data defining categories of quality inspections. Per Part 8: Incoming QC, In-Process QC, Final QC, Dispatch QC, Market Return QC, Supplier Audit, Warehouse Inspection.

### 4. Field Dictionary

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique globally | Type code (e.g., `INCOMING_QC`) | Public |
| `name` | VARCHAR(100) | Yes | — | — | Display name | Public |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `inspection_category` | ENUM | Yes | — | INCOMING, IN_PROCESS, FINAL, DISPATCH, RETURNS, AUDIT, WAREHOUSE | Category (per Part 8) | Internal |
| `is_mandatory` | BOOLEAN | Yes | `false` | — | Mandatory for all products | Internal |
| `default_approval_required` | BOOLEAN | Yes | `true` | — | Approval required by default | Internal |
| `color_code` | VARCHAR(7) | No | NULL | Hex | UI color | Public |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order | Internal |
| `is_seed_type` | BOOLEAN | Yes | `true` | — | Seeded (cannot delete) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

### Seeded Types

```json
[
  { "code": "INCOMING_QC", "name": "Incoming QC", "inspection_category": "INCOMING", "is_mandatory": true, "color_code": "#3B82F6" },
  { "code": "IN_PROCESS_QC", "name": "In-Process QC", "inspection_category": "IN_PROCESS", "is_mandatory": true, "color_code": "#8B5CF6" },
  { "code": "FINAL_QC", "name": "Final QC", "inspection_category": "FINAL", "is_mandatory": true, "color_code": "#10B981" },
  { "code": "DISPATCH_QC", "name": "Dispatch QC", "inspection_category": "DISPATCH", "is_mandatory": false, "color_code": "#F59E0B" },
  { "code": "RETURN_QC", "name": "Market Return QC", "inspection_category": "RETURNS", "is_mandatory": false, "color_code": "#EF4444" },
  { "code": "SUPPLIER_AUDIT", "name": "Supplier Audit", "inspection_category": "AUDIT", "is_mandatory": false, "color_code": "#6366F1" },
  { "code": "WAREHOUSE_QC", "name": "Warehouse Inspection", "inspection_category": "WAREHOUSE", "is_mandatory": false, "color_code": "#6B7280" }
]
```

---

## Entity 114 — Inspection Plan

### 1. Business Purpose
Defines **what should be inspected, when, how often, and by whom**. Per Part 8: *"Plans are version-controlled."*

### 4. Field Dictionary

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `IPLAN-` | Plan code | Internal |
| `company_id` | UUID | Yes | — | FK to companies | Owning company | Internal |
| `plan_name` | VARCHAR(200) | Yes | — | Min 3 | Plan name | Public |
| `product_id` | UUID | Yes | — | FK to `products` | Product to inspect | Internal |
| `product_family_id` | UUID | No | NULL | FK to `product_families` | Family (for family-level plans) | Internal |
| `inspection_type_id` | UUID | Yes | — | FK to `inspection_types` (Entity 113) | Type of inspection | Internal |
| `quality_specification_id` | UUID | Yes | — | FK to `quality_specifications` (Entity 112) | Spec to check against | Confidential |
| `sampling_plan_id` | UUID | Yes | — | FK to `sampling_plans` (Entity 115) | Sampling method | Internal |
| `frequency` | ENUM | Yes | `EVERY_BATCH` | EVERY_BATCH, EVERY_SHIFT, DAILY, WEEKLY, MONTHLY, RANDOM, RISK_BASED | Inspection frequency (per Part 8) | Internal |
| `inspector_role_id` | UUID | No | NULL | FK to `roles` | Required inspector role | Internal |
| `approval_workflow_id` | UUID | No | NULL | FK to `approval_flows` | Approval workflow | Internal |
| `active_version_id` | UUID | No | NULL | FK to `inspection_plan_versions` | Active version | Internal |
| `is_risk_based` | BOOLEAN | Yes | `false` | — | Risk-based inspection | Internal |
| `risk_score_threshold` | DECIMAL(5,2) | No | NULL | 0–100 | Risk score that triggers inspection | Confidential |
| `status` | ENUM | Yes | `DRAFT` | 8-stage master lifecycle | Lifecycle | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 115 — Sampling Plan

### 1. Business Purpose
Controls **sample selection** from a lot/batch. Per Part 8, methods: 100%, Random, AQL (Acceptance Quality Limit), Statistical, Risk-Based.

### 4. Field Dictionary

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `SMP-` | Plan code | Internal |
| `plan_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Public |
| `sampling_method` | ENUM | Yes | — | HUNDRED_PERCENT, RANDOM, AQL, STATISTICAL, RISK_BASED | Method (per Part 8) | Internal |
| `lot_size_min` | INTEGER | No | NULL | ≥ 0 | Min lot size for this plan | Internal |
| `lot_size_max` | INTEGER | No | NULL | ≥ `lot_size_min` | Max lot size | Internal |
| `sample_size` | INTEGER | Yes | — | > 0 | Samples to take (per Part 8: "Sample Size") | Internal |
| `sample_size_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Sample as % of lot | Internal |
| `acceptance_number` | INTEGER | Yes | `0` | ≥ 0 | Max defects allowed (per Part 8: "Acceptance Number") | Internal |
| `rejection_number` | INTEGER | Yes | `1` | > `acceptance_number` | Defects that trigger rejection (per Part 8: "Rejection Number") | Internal |
| `aql_level` | VARCHAR(20) | No | NULL | — | AQL level (e.g., "2.5", "4.0") | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 116 — Test Method

### 1. Business Purpose
Defines **testing procedures** for quality parameters — the lab procedure, equipment, expected results, and standard reference.

### 4. Field Dictionary

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `TM-` | Method code | Internal |
| `method_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Public |
| `parameter_code` | VARCHAR(30) | Yes | — | FK to `quality_parameters` (Entity 117) | Parameter tested | Internal |
| `equipment_required` | TEXT | No | NULL | — | Lab equipment (per Part 8: "Equipment") | Internal |
| `procedure` | TEXT | Yes | — | Min 20 chars | Step-by-step procedure (per Part 8: "Procedure") | Confidential |
| `expected_result_type` | ENUM | Yes | `NUMERIC` | NUMERIC, PASS_FAIL, TEXT, RANGE | Result type | Internal |
| `expected_result` | TEXT | No | NULL | — | Expected result description | Internal |
| `standard_reference` | VARCHAR(100) | No | NULL | — | Reference standard (e.g., "ISO 4833", "FSSAI Manual 2016") | Internal |
| `duration_hours` | DECIMAL(8,2) | No | NULL | > 0 | Test duration | Internal |
| `cost_per_test` | DECIMAL(18,4) | No | NULL | ≥ 0 | Lab cost | Confidential |
| `is_accredited` | BOOLEAN | Yes | `false` | — | Method accredited | Confidential |
| `accreditation_body` | VARCHAR(100) | No | NULL | — | Accrediting body | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 117 — Quality Parameter

### 1. Business Purpose
Reference data storing the canonical list of measurable quality parameters (Temperature, pH, Moisture, Viscosity, Weight, Density, Microbiology, Appearance, Color, Texture, Flavor, etc.).

### 4. Field Dictionary

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique globally, UPPER_SNAKE | Parameter code (e.g., `MOISTURE`, `PH`, `MICRO_TPC`) | Public |
| `name` | VARCHAR(100) | Yes | — | — | Display name | Public |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `parameter_type` | ENUM | Yes | — | PHYSICAL, CHEMICAL, MICROBIOLOGICAL, SENSORY, NUTRITIONAL, PACKAGING | Type | Internal |
| `default_unit` | VARCHAR(20) | Yes | — | — | Default UOM | Internal |
| `is_numeric` | BOOLEAN | Yes | `true` | — | Numeric value (vs PASS/FAIL) | Internal |
| `is_critical_default` | BOOLEAN | Yes | `false` | — | Critical by default | Confidential |
| `display_order` | INTEGER | Yes | `100` | > 0 | Display order | Internal |
| `is_seed_parameter` | BOOLEAN | Yes | `true` | — | Seeded | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

### Seeded Parameters

```json
[
  { "code": "TEMPERATURE", "name": "Temperature", "parameter_type": "PHYSICAL", "default_unit": "°C" },
  { "code": "PH", "name": "pH Value", "parameter_type": "CHEMICAL", "default_unit": "pH" },
  { "code": "MOISTURE", "name": "Moisture Content", "parameter_type": "PHYSICAL", "default_unit": "%" },
  { "code": "VISCOSITY", "name": "Viscosity", "parameter_type": "PHYSICAL", "default_unit": "cP" },
  { "code": "WEIGHT", "name": "Weight", "parameter_type": "PHYSICAL", "default_unit": "g" },
  { "code": "MICRO_TPC", "name": "Total Plate Count", "parameter_type": "MICROBIOLOGICAL", "default_unit": "CFU/g", "is_critical_default": true },
  { "code": "MICRO_COLIFORM", "name": "Coliform Count", "parameter_type": "MICROBIOLOGICAL", "default_unit": "CFU/g", "is_critical_default": true },
  { "code": "MICRO_ECOLI", "name": "E. coli", "parameter_type": "MICROBIOLOGICAL", "default_unit": "CFU/g", "is_critical_default": true },
  { "code": "MICRO_SALMONELLA", "name": "Salmonella", "parameter_type": "MICROBIOLOGICAL", "default_unit": "Presence/Absence", "is_numeric": false, "is_critical_default": true },
  { "code": "SUGAR_CONTENT", "name": "Sugar Content", "parameter_type": "CHEMICAL", "default_unit": "%" },
  { "code": "PROTEIN", "name": "Protein Content", "parameter_type": "NUTRITIONAL", "default_unit": "%" },
  { "code": "FAT_CONTENT", "name": "Fat Content", "parameter_type": "NUTRITIONAL", "default_unit": "%" },
  { "code": "COLOR", "name": "Color", "parameter_type": "SENSORY", "default_unit": "Visual", "is_numeric": false },
  { "code": "TASTE", "name": "Taste", "parameter_type": "SENSORY", "default_unit": "Subjective", "is_numeric": false },
  { "code": "ODOR", "name": "Odor", "parameter_type": "SENSORY", "default_unit": "Subjective", "is_numeric": false },
  { "code": "TEXTURE", "name": "Texture", "parameter_type": "SENSORY", "default_unit": "Subjective", "is_numeric": false },
  { "code": "APPEARANCE", "name": "Appearance", "parameter_type": "SENSORY", "default_unit": "Visual", "is_numeric": false },
  { "code": "SEAL_INTEGRITY", "name": "Seal Integrity", "parameter_type": "PACKAGING", "default_unit": "Pass/Fail", "is_numeric": false }
]
```

---

## Entity 118 — Quality Checklist

### 1. Business Purpose
Defines **digital inspection checklists** — the step-by-step form QC inspectors complete during an inspection. Per Part 8, includes questions, mandatory flags, sequence, and scoring.

### 4. Field Dictionary

#### Checklist Header

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `CHK-` | Checklist code | Internal |
| `checklist_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Public |
| `inspection_type_id` | UUID | Yes | — | FK to `inspection_types` (Entity 113) | Associated inspection type | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `total_questions` | INTEGER | Yes | `0` | ≥ 0 | Number of questions | Internal |
| `passing_score_pct` | DECIMAL(5,2) | Yes | `80.00` | 0–100 | Minimum passing score (per Part 8: "Score") | Internal |
| `is_digital_signature_required` | BOOLEAN | Yes | `false` | — | Digital signature required | Confidential |
| `is_photo_capture_required` | BOOLEAN | Yes | `false` | — | Photo evidence required | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

#### Checklist Questions (Lines)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `checklist_id` | UUID | Yes | — | FK to `quality_checklists` | Parent checklist | Internal |
| `question_number` | INTEGER | Yes | — | > 0, unique per checklist | Sequence (per Part 8: "Sequence") | Internal |
| `question_text` | TEXT | Yes | — | Min 10 chars | Question | Public |
| `question_type` | ENUM | Yes | `PASS_FAIL` | PASS_FAIL, NUMERIC, TEXT, PHOTO, SIGNATURE, BARCODE_SCAN | Answer type | Internal |
| `is_mandatory` | BOOLEAN | Yes | `false` | — | Mandatory (per Part 8: "Mandatory Flag") | Internal |
| `expected_value` | TEXT | No | NULL | — | Expected answer | Internal |
| `min_value` | DECIMAL(18,4) | No | NULL | — | Min (for NUMERIC) | Internal |
| `max_value` | DECIMAL(18,4) | No | NULL | — | Max (for NUMERIC) | Internal |
| `weight` | DECIMAL(5,2) | Yes | `1.00` | > 0 | Question weight in scoring | Internal |
| `failure_action` | ENUM | Yes | `WARN` | WARN, REJECT, HOLD, TRIGGER_CAPA | Action on failure | Confidential |
| `linked_parameter_code` | VARCHAR(30) | No | NULL | FK to `quality_parameters` | Linked quality parameter | Internal |

---

## Entity 119 — Quality Approval

### 1. Business Purpose
Manages the **approval workflow** for quality inspections. Per Part 8:
```
Inspection → Reviewer → QA Manager → Release → Production/Warehouse
```

### 4. Field Dictionary

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `QAPR-` | Approval code | Internal |
| `company_id` | UUID | Yes | — | FK to companies | Owning company | Internal |
| `inspection_id` | UUID | Yes | — | FK to `qc_inspections` | Inspection being approved | Confidential |
| `approval_flow_id` | UUID | No | NULL | FK to `approval_flows` | Approval workflow config | Internal |
| `approval_status` | ENUM | Yes | `PENDING` | PENDING, IN_REVIEW, APPROVED, REJECTED, DELEGATED, ESCALATED | Status (per Part 8) | Internal |
| `current_level` | INTEGER | Yes | `1` | ≥ 1 | Current approval level | Internal |
| `total_levels` | INTEGER | Yes | `1` | ≥ 1 | Total levels | Internal |
| `submitted_by` | UUID | Yes | — | FK to `user_accounts` | Inspector | Internal |
| `submitted_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Submission time | Internal |
| `reviewed_by` | UUID | No | NULL | FK to `user_accounts` | Reviewer (Level 1) | Internal |
| `reviewed_at` | TIMESTAMPTZ | No | NULL | — | Review time | Internal |
| `review_comments` | TEXT | No | NULL | — | Review notes | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | QA Manager (final approver) | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Final approval time | Confidential |
| `approval_comments` | TEXT | No | NULL | — | Approval comments | Internal |
| `rejected_reason` | TEXT | No | NULL | Required if `approval_status = REJECTED` | Rejection reason | Internal |
| `rejected_by` | UUID | No | NULL | FK to `user_accounts` | Who rejected | Internal |
| `rejected_at` | TIMESTAMPTZ | No | NULL | — | Rejection time | Internal |
| `digital_signature` | VARCHAR(500) | No | NULL | — | Digital signature hash (per Ch 18 §18.9 future) | Confidential |
| `is_two_person_approval` | BOOLEAN | Yes | `false` | — | Two-person approval required | Confidential |
| `second_approver_id` | UUID | No | NULL | FK to `user_accounts` | Second approver (if two-person) | Confidential |
| `second_approved_at` | TIMESTAMPTZ | No | NULL | — | Second approval time | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

---

## Entity 120 — Quality Dashboard Snapshot

### 1. Business Purpose
Stores **periodic quality metrics** for the Quality Dashboard and Mission Control. Per Part 8: Pending Inspections, Passed, Failed, Open CAPAs, Open Deviations, Open Complaints, Quality Score, Compliance %.

### 4. Field Dictionary

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot date | Internal |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Plant | Internal |
| `snapshot_type` | ENUM | Yes | `DAILY` | DAILY, WEEKLY, MONTHLY | Period | Internal |
| `pending_inspections` | INTEGER | Yes | `0` | ≥ 0 | Pending (per Part 8) | Internal |
| `passed_inspections` | INTEGER | Yes | `0` | ≥ 0 | Passed (per Part 8) | Internal |
| `failed_inspections` | INTEGER | Yes | `0` | ≥ 0 | Failed (per Part 8) | Internal |
| `open_capas` | INTEGER | Yes | `0` | ≥ 0 | Open CAPAs (per Part 8) | Confidential |
| `open_deviations` | INTEGER | Yes | `0` | ≥ 0 | Open deviations (per Part 8) | Confidential |
| `open_complaints` | INTEGER | Yes | `0` | ≥ 0 | Open complaints (per Part 8) | Confidential |
| `quality_score` | DECIMAL(5,2) | Yes | `0` | 0–100 | Overall quality score (per Part 8) | Internal |
| `compliance_pct` | DECIMAL(5,2) | Yes | `0` | 0–100 | Compliance % (per Part 8) | Confidential |
| `fpy_pct` | DECIMAL(5,2) | No | NULL | 0–100 | First Pass Yield % | Internal |
| `rejection_rate_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Rejection rate | Internal |
| `supplier_quality_score` | DECIMAL(5,2) | No | NULL | 0–100 | Avg supplier quality | Internal |
| `in_process_quality_score` | DECIMAL(5,2) | No | NULL | 0–100 | In-process quality | Internal |
| `finished_goods_quality_score` | DECIMAL(5,2) | No | NULL | 0–100 | FG quality | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI-generated quality insights | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

### 5-16. Standard Pattern
- **Partitioning**: Monthly by `snapshot_date`.
- **AI**: Quality Prediction AI, Defect Prediction AI, Compliance Monitoring AI, Trend Analysis AI.
- **UI**: Quality Dashboard (feeds Mission Control per Ch 15 enhancement).

```json
{
  "id": "01928f7a-...-qds-001",
  "snapshot_date": "2026-07-07",
  "facility_id": "01928f7a-...-plt-01",
  "snapshot_type": "DAILY",
  "pending_inspections": 8,
  "passed_inspections": 42,
  "failed_inspections": 3,
  "open_capas": 2,
  "open_deviations": 1,
  "open_complaints": 0,
  "quality_score": 94.50,
  "compliance_pct": 96.00,
  "fpy_pct": 92.30,
  "rejection_rate_pct": 1.50,
  "supplier_quality_score": 95.00,
  "in_process_quality_score": 93.00,
  "finished_goods_quality_score": 96.00,
  "ai_insights": {
    "key_findings": [
      "Quality score improved 1.2% vs yesterday",
      "3 failed inspections — 2 from Supplier X (sugar moisture)",
      "FPY dropped 2% — investigate cooking stage temperature deviation"
    ],
    "recommendations": [
      "Trigger CAPA for Supplier X moisture failures",
      "Review cooking stage temperature control — 2 deviations this week"
    ]
  },
  "status": "COMPLETED"
}
```

---

## Part 8 Section 1 Completion Summary

**All 10 Quality Foundation entities are now defined** at full enterprise-grade depth:

| Entity | Status |
|---|---|
| 111 Quality Standard | ✅ Complete (regulatory framework) |
| 112 Quality Specification | ✅ Complete (versioned, parameter-level) |
| 113 Inspection Type | ✅ Complete (7 seeded types) |
| 114 Inspection Plan | ✅ Complete (versioned, risk-based) |
| 115 Sampling Plan | ✅ Complete (AQL, statistical, risk-based) |
| 116 Test Method | ✅ Complete (lab procedures, accredited) |
| 117 Quality Parameter | ✅ Complete (18 seeded parameters) |
| 118 Quality Checklist | ✅ Complete (digital, mobile-first) |
| 119 Quality Approval | ✅ Complete (multi-tier, digital signature ready) |
| 120 Quality Dashboard Snapshot | ✅ Complete (AI insights, feeds Mission Control) |

### Key Architectural Decisions

1. **Enterprise quality standards** — FSSAI, HACCP, ISO 22000, GMP, FDA framework
2. **Version-controlled inspection plans** — Immutable after release (per Ch 7 §7.6)
3. **Digital quality records** — Electronic Batch Records (EBR), no paper
4. **Risk-based inspections** — Frequency based on product risk + supplier performance
5. **Electronic approvals** — Multi-tier with digital signature readiness
6. **AI-ready quality metadata** — All entities structured for defect prediction + risk analysis
7. **Mobile-first inspections** — Barcode scan, photo capture, digital signature on mobile
8. **Complete audit trail** — All spec changes, results, approvals permanently audited
9. **Compliance-driven** — Every parameter links to regulatory standard
10. **End-to-end traceability** — Standard → Spec → Plan → Inspection → Result → Approval → Release

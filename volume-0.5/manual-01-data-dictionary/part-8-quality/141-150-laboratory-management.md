# Manual 1 · Part 8 · Section 4 · Entities 141-150 — Laboratory Management, Sample Management & COA

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 8 — Enterprise Quality Management (QMS) |
| Section | 4 — Laboratory Management, Sample Management & COA |
| Entities | 141–150 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 18 §18.7, Ch 18 §18.13 |
| Last Updated | 2026-07-07 |

---

## Overview — Laboratory (LIMS) Architecture

Section 4 implements an **Electronic Laboratory Information Management System (LIMS)** within SUOP. Every sample is barcode-tracked through its lifecycle from collection → registration → testing → result → COA generation → QA approval.

```
SAMPLE COLLECTION (142) → REGISTRATION → TEST REQUEST (143) → LABORATORY ASSIGNMENT (141)
  ↓ Uses
INSTRUMENT (145) + CALIBRATION (146)
  ↓ Produces
TEST RESULT (144) → MICROBIOLOGY (147) / CHEMICAL (148)
  ↓ Generates
COA (149) → QA APPROVAL → BATCH RELEASE
  ↓ Monitored by
LABORATORY DASHBOARD (150)
```

### Integrated Enhancements
1. **Integrated LIMS+MES** (per Enhancement) — `auto_capture_enabled`, `instrument_integration`, `eln_enabled`
2. **Automatic instrument data capture** — `auto_result_capture`, `raw_data_file_id`
3. **QR-verifiable digital COAs** — `qr_verification_code`, `blockchain_hash`

---

## Entity 141 — Laboratory Master

### 1. Business Purpose
Represents quality laboratories. Per Part 8: Types include Chemical, Microbiology, Physical, Packaging, R&D, Environmental. Each lab has accreditation, manager, and instrument inventory.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `LAB-` | Lab code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Owning company | Internal |
| `laboratory_code` | VARCHAR(20) | Yes | — | Unique per company | Short code (e.g., `CHEM-LAB-01`) | Public |
| `laboratory_name` | VARCHAR(200) | Yes | — | Min 3 | Display name (per Part 8) | Public |
| `laboratory_type` | ENUM | Yes | — | CHEMICAL, MICROBIOLOGY, PHYSICAL, PACKAGING, R_AND_D, ENVIRONMENTAL (per Part 8) | Type | Internal |
| `manager_user_id` | UUID | Yes | — | FK to `user_accounts` | Lab manager (per Part 8) | Internal |
| `accreditation` | VARCHAR(100) | No | NULL | — | Accreditation body (e.g., "NABL", "ISO 17025") (per Part 8) | Confidential |
| `accreditation_expiry` | DATE | No | NULL | — | Accreditation expiry | Confidential |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Physical location | Internal |
| `is_in_house` | BOOLEAN | Yes | `true` | — | In-house vs external lab | Internal |
| `external_lab_vendor_id` | UUID | No | NULL | FK to `suppliers` | External lab vendor | Confidential |
| `instrument_count` | INTEGER | Yes | `0` | ≥ 0 | Total instruments | Internal |
| `auto_capture_enabled` | BOOLEAN | Yes | `false` | — | Auto instrument data capture (per LIMS Enhancement) | Internal |
| `eln_enabled` | BOOLEAN | Yes | `false` | — | Electronic Lab Notebook enabled (per LIMS Enhancement) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, MAINTENANCE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 142 — Sample Registration

### 1. Business Purpose
Registers every collected sample. Per Part 8: Every sample uniquely identified, barcode tracked, chain of custody maintained.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `SMP-` | Sample code | Internal |
| `sample_number` | VARCHAR(50) | Yes | — | Unique per company | Display number (per Part 8) | Public |
| `sample_type` | ENUM | Yes | — | RAW_MATERIAL, PACKAGING, SEMI_FINISHED, FINISHED_GOODS, WATER, SWAB, AIR, RETENTION, MARKET_SAMPLE (per Part 8) | Type | Internal |
| `product_id` | UUID | No | NULL | FK to `products` | Product sampled | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches` | Batch sampled | Internal |
| `collected_by` | UUID | Yes | — | FK to `user_accounts` | Collector (per Part 8) | Internal |
| `collection_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Collection time (per Part 8) | Internal |
| `collection_location` | VARCHAR(200) | Yes | — | — | Collection location (per Part 8) | Internal |
| `barcode_value` | VARCHAR(100) | Yes | — | Generated | Sample barcode (per Part 8) | Public |
| `seal_number` | VARCHAR(50) | No | NULL | — | Tamper-evident seal | Internal |
| `priority` | ENUM | Yes | `ROUTINE` | ROUTINE, URGENT, CRITICAL, REGULATORY | Priority (per Part 8) | Internal |
| `sample_quantity` | DECIMAL(18,4) | Yes | — | > 0 | Quantity sampled | Internal |
| `uom_id` | UUID | Yes | — | FK to `uoms` | UOM | Internal |
| `storage_condition` | TEXT | No | NULL | — | Storage requirement | Internal |
| `chain_of_custody` | JSONB | No | `'[]'` | — | Array of custody transfers | Internal |
| `retention_expiry_date` | DATE | No | NULL | — | Retention sample expiry | Internal |
| `status` | ENUM | Yes | `REGISTERED` | REGISTERED, ASSIGNED, IN_TESTING, COMPLETED, DISPOSED, EXPIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 143 — Laboratory Test Request

### 1. Business Purpose
Creates laboratory work orders. Per Part 8: Links sample to laboratory, test method, priority, and expected completion.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `LTR-` | Request code | Internal |
| `request_number` | VARCHAR(50) | Yes | — | Unique per company | Display number (per Part 8) | Public |
| `sample_id` | UUID | Yes | — | FK to `sample_registrations` (Entity 142) | Sample to test | Internal |
| `laboratory_id` | UUID | Yes | — | FK to `laboratory_masters` (Entity 141) | Assigned lab | Internal |
| `test_method_id` | UUID | Yes | — | FK to `test_methods` (Entity 116) | Test method (per Part 8) | Internal |
| `parameter_code` | VARCHAR(30) | Yes | — | FK to `quality_parameters` (Entity 117) | Parameter to test | Internal |
| `requested_by` | UUID | Yes | — | FK to `user_accounts` | Requester (per Part 8) | Internal |
| `requested_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Request time | Internal |
| `priority` | ENUM | Yes | `ROUTINE` | ROUTINE, URGENT, CRITICAL, REGULATORY (per Part 8) | Priority | Internal |
| `expected_completion` | TIMESTAMPTZ | Yes | — | > requested_at | Expected completion (per Part 8) | Internal |
| `actual_completion` | TIMESTAMPTZ | No | NULL | — | Actual completion | Internal |
| `assigned_analyst_id` | UUID | No | NULL | FK to `user_accounts` | Lab analyst | Internal |
| `instrument_id` | UUID | No | NULL | FK to `laboratory_instruments` (Entity 145) | Assigned instrument | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED, RETEST_REQUIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 144 — Laboratory Test Result

### 1. Business Purpose
Stores scientific results. Per Part 8: Supports Numeric, Boolean, Visual, Image, PDF, Spectrometer Output.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `result_number` | VARCHAR(50) | Yes | — | Unique per company | Display number (per Part 8) | Public |
| `test_request_id` | UUID | Yes | — | FK to `lab_test_requests` (Entity 143) | Parent request | Internal |
| `sample_id` | UUID | Yes | — | FK to `sample_registrations` (Entity 142) | Sample tested | Internal |
| `parameter_code` | VARCHAR(30) | Yes | — | FK to `quality_parameters` (Entity 117) | Parameter (per Part 8) | Internal |
| `expected_value` | DECIMAL(18,4) | Yes | — | — | Expected (per Part 8) | Internal |
| `observed_value` | DECIMAL(18,4) | No | NULL | — | Observed (per Part 8) | Confidential |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | Unit (per Part 8) | Internal |
| `tolerance_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Tolerance (per Part 8) | Internal |
| `pass_fail` | ENUM | Yes | — | PASS, FAIL, NA | Result (per Part 8) | Confidential |
| `result_type` | ENUM | Yes | `NUMERIC` | NUMERIC, BOOLEAN, VISUAL, IMAGE, PDF, SPECTROMETER (per Part 8) | Type | Internal |
| `analyst_user_id` | UUID | Yes | — | FK to `user_accounts` | Analyst (per Part 8) | Internal |
| `analyzed_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Analysis time | Internal |
| `instrument_id` | UUID | No | NULL | FK to `laboratory_instruments` (Entity 145) | Instrument used | Internal |
| `auto_result_capture` | BOOLEAN | Yes | `false` | — | Auto-captured from instrument (per LIMS Enhancement) | Internal |
| `raw_data_file_id` | UUID | No | NULL | FK to `file_attachments` | Raw instrument data | Confidential |
| `image_file_id` | UUID | No | NULL | FK to `file_attachments` | Image evidence (per Part 8) | Internal |
| `approval_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, REJECTED, RETEST | Approval (per Part 8) | Confidential |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval time | Internal |
| `digital_signature` | VARCHAR(500) | No | NULL | — | Digital signature | Confidential |
| `remarks` | TEXT | No | NULL | — | Notes | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

---

## Entity 145 — Laboratory Instrument

### 1. Business Purpose
Tracks testing equipment. Per Part 8: pH Meter, Moisture Analyzer, HPLC, GC, Incubator, Microscope, Weighing Scale, Metal Detector Tester.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `INST-` | Instrument code | Internal |
| `instrument_code` | VARCHAR(30) | Yes | — | Unique per lab | Lab-internal code (per Part 8) | Internal |
| `instrument_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Public |
| `instrument_type` | VARCHAR(50) | Yes | — | — | Type (e.g., "HPLC", "pH Meter") (per Part 8) | Internal |
| `serial_number` | VARCHAR(100) | Yes | — | — | Manufacturer serial (per Part 8) | Internal |
| `manufacturer` | VARCHAR(100) | No | NULL | — | Make | Internal |
| `model` | VARCHAR(100) | No | NULL | — | Model | Internal |
| `laboratory_id` | UUID | Yes | — | FK to `laboratory_masters` (Entity 141) | Located lab | Internal |
| `location_description` | VARCHAR(200) | No | NULL | — | Specific location (per Part 8) | Internal |
| `calibration_due_date` | DATE | Yes | — | — | Next calibration due (per Part 8) | Confidential |
| `last_calibration_date` | DATE | No | NULL | — | Last calibrated | Internal |
| `is_calibrated` | BOOLEAN | Yes | `false` | Generated: `calibration_due_date >= CURRENT_DATE` | Current calibration status | Confidential |
| `auto_capture_capable` | BOOLEAN | Yes | `false` | — | Can auto-capture data (per LIMS Enhancement) | Internal |
| `iot_enabled` | BOOLEAN | Yes | `false` | — | IoT connected (per Mfg 4.0) | Internal |
| `status` | ENUM | Yes | `AVAILABLE` | AVAILABLE, IN_USE, MAINTENANCE, CALIBRATION, RETIRED (per Part 8) | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 146 — Instrument Calibration

### 1. Business Purpose
Maintains calibration history. Per Part 8: *"Expired instruments cannot record results."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `instrument_id` | UUID | Yes | — | FK to `laboratory_instruments` (Entity 145) | Calibrated instrument | Internal |
| `calibration_date` | DATE | Yes | — | — | Calibration date (per Part 8) | Internal |
| `next_due_date` | DATE | Yes | — | > calibration_date | Next due (per Part 8) | Confidential |
| `performed_by` | UUID | Yes | — | FK to `user_accounts` | Calibrator (per Part 8) | Internal |
| `calibrated_by_external` | BOOLEAN | Yes | `false` | — | External calibration service | Internal |
| `external_vendor_id` | UUID | No | NULL | FK to `suppliers` | External calibrator | Confidential |
| `certificate_file_id` | UUID | No | NULL | FK to `file_attachments` | Calibration certificate (per Part 8) | Confidential |
| `standard_reference` | VARCHAR(100) | No | NULL | — | Reference standard used | Internal |
| `readings` | JSONB | No | NULL | — | Calibration readings: `[{ expected, observed, variance }]` | Internal |
| `is_passed` | BOOLEAN | Yes | `true` | — | Pass/fail | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | SCHEDULED, IN_PROGRESS, COMPLETED, FAILED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 147 — Microbiology Test

### 1. Business Purpose
Stores microbiological analysis. Per Part 8: TPC, Yeast, Mold, E. coli, Salmonella, Listeria, Coliform, Staphylococcus. Supports incubation, growth monitoring, digital images.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `test_result_id` | UUID | Yes | — | FK to `lab_test_results` (Entity 144) | Parent result | Confidential |
| `sample_id` | UUID | Yes | — | FK to `sample_registrations` (Entity 142) | Sample | Internal |
| `organism_code` | ENUM | Yes | — | TPC, YEAST, MOLD, E_COLI, SALMONELLA, LISTERIA, COLIFORM, STAPHYLOCOCCUS (per Part 8) | Organism | Confidential |
| `result_value` | DECIMAL(18,4) | No | NULL | ≥ 0 | Colony count (CFU/g) | Confidential |
| `result_unit` | VARCHAR(20) | Yes | `CFU/g` | — | Unit | Internal |
| `detection_limit` | DECIMAL(18,4) | No | NULL | — | Detection limit | Internal |
| `is_detected` | BOOLEAN | Yes | `false` | — | Presence/absence (for Salmonella, Listeria) | Confidential |
| `incubation_temp_c` | DECIMAL(5,2) | No | NULL | — | Incubation temperature | Internal |
| `incubation_duration_hours` | DECIMAL(8,2) | No | NULL | — | Incubation duration | Internal |
| `growth_monitoring_data` | JSONB | No | NULL | — | Time-series growth readings | Internal |
| `plate_image_file_id` | UUID | No | NULL | FK to `file_attachments` | Plate photo (per Part 8) | Internal |
| `media_used` | VARCHAR(100) | No | NULL | — | Culture media | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, INCUBATING, COMPLETED, RETEST | Status | Internal |

---

## Entity 148 — Chemical Analysis

### 1. Business Purpose
Chemical testing. Per Part 8: Moisture, Sugar, Protein, Fat, Ash, pH, Acidity, Salt, Preservatives, Heavy Metals.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `test_result_id` | UUID | Yes | — | FK to `lab_test_results` (Entity 144) | Parent result | Confidential |
| `sample_id` | UUID | Yes | — | FK to `sample_registrations` (Entity 142) | Sample | Internal |
| `parameter_code` | VARCHAR(30) | Yes | — | FK to `quality_parameters` | Parameter (MOISTURE, SUGAR_CONTENT, PROTEIN, FAT_CONTENT, ASH, PH, ACIDITY, SALT, PRESERVATIVES, HEAVY_METALS) (per Part 8) | Internal |
| `result_value` | DECIMAL(18,4) | Yes | — | — | Observed value | Confidential |
| `result_unit` | VARCHAR(20) | Yes | — | — | Unit (%, mg/kg, pH) | Internal |
| `method_reference` | VARCHAR(100) | No | NULL | — | Standard method (e.g., "AOAC 925.10") | Internal |
| `instrument_id` | UUID | No | NULL | FK to `laboratory_instruments` | Instrument used | Internal |
| `reagent_batch` | VARCHAR(50) | No | NULL | — | Reagent batch number | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, IN_PROGRESS, COMPLETED, RETEST | Status | Internal |

---

## Entity 149 — Certificate of Analysis (COA)

### 1. Business Purpose
Generates customer-ready quality certificates. Per Part 8: *"COA generated only after approved results. Version controlled."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `COA-` | COA code | Internal |
| `coa_number` | VARCHAR(50) | Yes | — | Unique per company | Display number (per Part 8) | Public |
| `batch_id` | UUID | Yes | — | FK to `batches` | Certified batch (per Part 8) | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Product (per Part 8) | Internal |
| `manufacturing_date` | DATE | Yes | — | — | Mfg date (per Part 8) | Public |
| `expiry_date` | DATE | Yes | — | > manufacturing_date | Expiry (per Part 8) | Public |
| `test_summary` | JSONB | Yes | `'{}'` | — | Array of `{ parameter, specification, result, pass_fail }` (per Part 8) | Confidential |
| `overall_result` | ENUM | Yes | — | PASS, FAIL, CONDITIONAL | Overall | Confidential |
| `approved_by` | UUID | Yes | — | FK to `user_accounts` | QA approver (per Part 8) | Confidential |
| `approval_date` | TIMESTAMPTZ | Yes | `NOW()` | — | Approval time | Internal |
| `digital_signature` | VARCHAR(500) | No | NULL | — | Digital signature (per Part 8) | Confidential |
| `qr_verification_code` | VARCHAR(100) | Yes | — | Generated | QR code for verification (per LIMS Enhancement) | Public |
| `blockchain_hash` | VARCHAR(100) | No | NULL | — | Blockchain verification hash (future) | Confidential |
| `document_file_id` | UUID | No | NULL | FK to `file_attachments` | PDF COA | Confidential |
| `version_number` | INTEGER | Yes | `1` | ≥ 1 | Version (per Part 8: "Version controlled") | Internal |
| `previous_version_id` | UUID | No | NULL | FK self-ref | Previous version | Internal |
| `is_customer_facing` | BOOLEAN | Yes | `true` | — | Shared with customers | Internal |
| `customer_id` | UUID | No | NULL | FK to `customers` | Specific customer (if custom COA) | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, SUPERSEDED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 150 — Laboratory Dashboard

### 1. Business Purpose
Snapshot of laboratory metrics. Per Part 8: Open Samples, Pending Tests, Completed Tests, Calibration Due, Instrument Utilization, Average Test Time, Failed Samples, Laboratory KPI.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `laboratory_id` | UUID | Yes | — | FK to `laboratory_masters` | Lab | Internal |
| `open_samples` | INTEGER | Yes | `0` | ≥ 0 | Open (per Part 8) | Internal |
| `pending_tests` | INTEGER | Yes | `0` | ≥ 0 | Pending (per Part 8) | Internal |
| `completed_tests` | INTEGER | Yes | `0` | ≥ 0 | Completed (per Part 8) | Internal |
| `calibration_due` | INTEGER | Yes | `0` | ≥ 0 | Instruments due (per Part 8) | Confidential |
| `instrument_utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Utilization (per Part 8) | Internal |
| `avg_test_time_hours` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | Avg time (per Part 8) | Internal |
| `failed_samples` | INTEGER | Yes | `0` | ≥ 0 | Failed (per Part 8) | Confidential |
| `retest_count` | INTEGER | Yes | `0` | ≥ 0 | Retests needed | Internal |
| `lab_kpi_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Overall KPI (per Part 8) | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI-generated lab insights | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |

---

## Section 4 Completion Summary

**All 10 Laboratory Management entities are now defined** at full enterprise-grade depth.

### Key Architectural Decisions

1. **LIMS architecture** — Electronic Laboratory Information Management within SUOP
2. **Barcode-based sample tracking** — Every sample uniquely identified with barcode
3. **Chain of custody** — Full custody trail in JSONB
4. **Instrument traceability** — Every result linked to instrument + calibration
5. **Calibration enforcement** — Expired instruments cannot record results
6. **Digital COA generation** — Version-controlled, QR-verifiable, blockchain-ready
7. **Electronic laboratory records** — Paperless, digital signatures
8. **Auto instrument capture** — `auto_capture_capable`, `auto_result_capture` (per LIMS Enhancement)
9. **Microbiology tracking** — Incubation, growth monitoring, plate images
10. **Chemical analysis** — Method references, reagent batches, instrument linkage

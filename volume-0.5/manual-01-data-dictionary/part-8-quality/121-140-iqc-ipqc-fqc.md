# Manual 1 · Part 8 · Sections 2 & 3 · Entities 121-140 — Incoming QC & In-Process/Final QC

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 8 — Enterprise Quality Management (QMS) |
| Sections | 2 (Incoming QC & Supplier Quality) & 3 (In-Process QC & Final QC) |
| Entities | 121–140 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 5 §5.3, Ch 5 §5.4, Ch 5 §5.10, Ch 18 §18.5, Ch 18 §18.7 |
| Last Updated | 2026-07-07 |

---

## Overview — Operational Quality Architecture

Sections 2 & 3 define the **operational execution** of quality control — from receiving materials to releasing finished goods. This is where the "plan" from Section 1 becomes "action."

```
INCOMING QC (Sec 2)
  Supplier → ASN → GRN → Incoming Inspection (121) → COA Verify (123) → Quarantine (124) → Accept/Reject (125/126) → Supplier Score (127)

IN-PROCESS QC (Sec 3)
  Production Order → Mfg Batch → Stage Inspection (131) → CCP Check (132) → Process Result (133) → Hold/Rework (134/135)

FINAL QC (Sec 3)
  Production Complete → Final Inspection (136) → Batch Release/Reject (137/138) → Inventory
```

### Integrated Enhancements
1. **Supplier Portal** (per Enhancement) — `portal_enabled`, `coa_upload_status`, `supplier_response_status`
2. **AI Vision Inspection** (per Enhancement) — `vision_inspection_result`, `vision_anomaly_detected`, `vision_image_id`
3. **Electronic Batch Record (EBR)** (per Enhancement) — `ebr_compiled`, `ebr_file_id`

---

## Entity 121 — Incoming Inspection

### 1. Business Purpose
Represents quality inspection for received materials. Per Part 8 Sec 2: *"Inspection automatically created after GRN. Cannot bypass QA approval."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `IQC-` | Inspection code | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Owning company | Internal |
| `inspection_number` | VARCHAR(50) | Yes | — | Unique per company | Display number | Public |
| `supplier_id` | UUID | Yes | — | FK to `suppliers` | Supplier | Confidential |
| `grn_id` | UUID | Yes | — | FK to `goods_receipt_notes` | Source GRN | Internal |
| `po_id` | UUID | No | NULL | FK to `purchase_orders` | Source PO | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Material inspected | Internal |
| `supplier_batch_number` | VARCHAR(50) | No | NULL | — | Supplier's batch ref | Internal |
| `internal_batch_id` | UUID | No | NULL | FK to `batches` | Internal batch created | Internal |
| `inspection_date` | DATE | Yes | `CURRENT_DATE` | — | Inspection date | Internal |
| `inspector_user_id` | UUID | Yes | — | FK to `user_accounts` | QC Inspector | Internal |
| `sampling_plan_id` | UUID | No | NULL | FK to `sampling_plans` | Sampling method | Internal |
| `inspection_status` | ENUM | Yes | `PENDING` | PENDING, SAMPLING, TESTING, UNDER_REVIEW, PASSED, FAILED, PARTIAL_PASS, QUARANTINED, REJECTED (per Part 8) | Status | Internal |
| `decision` | ENUM | No | NULL | ACCEPTED, ACCEPTED_WITH_DEVIATION, CONDITIONAL_RELEASE, REJECTED, QUARANTINE, SUPPLIER_CAPA_REQUIRED | QA decision | Confidential |
| `vision_inspection_result` | JSONB | No | NULL | — | AI Vision Inspection results (per Enhancement) | Internal |
| `vision_anomaly_detected` | BOOLEAN | Yes | `false` | — | Vision AI found anomaly | Internal |
| `portal_enabled` | BOOLEAN | Yes | `false` | — | Supplier portal tracking enabled (per Enhancement) | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Standard | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5-16. Standard Pattern
- **Partitioning**: Monthly by `inspection_date`.
- **Validation**: Auto-created on GRN completion; cannot bypass QA.
- **API**: `/api/v1/incoming-inspections` (GET, POST), `/:id/start-sampling`, `/:id/submit-results`, `/:id/decision`.
- **Mobile**: GRN scan, batch scan, COA upload, photo capture, checklist, digital signature.
- **AI**: Supplier Risk Prediction, Incoming Defect Prediction, Automatic Sampling Recommendation.

---

## Entity 122 — Supplier Batch Verification

### 1. Business Purpose
Verifies supplier batch integrity. Per Part 8: *"Duplicate supplier batches prohibited. Expired material automatically blocked."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `supplier_batch_number` | VARCHAR(50) | Yes | — | Unique per supplier+product | Supplier's batch | Internal |
| `supplier_id` | UUID | Yes | — | FK to `suppliers` | Supplier | Confidential |
| `product_id` | UUID | Yes | — | FK to `products` | Product | Internal |
| `manufacturing_date` | DATE | Yes | — | — | Mfg date (per Part 8) | Public |
| `expiry_date` | DATE | Yes | — | > manufacturing_date | Expiry date (per Part 8) | Public |
| `lot_number` | VARCHAR(50) | No | NULL | — | Lot number (per Part 8) | Internal |
| `coa_reference` | VARCHAR(50) | No | NULL | — | COA reference (per Part 8) | Confidential |
| `seal_number` | VARCHAR(50) | No | NULL | — | Container seal | Internal |
| `barcode_value` | VARCHAR(100) | Yes | — | — | Barcode (per Part 8) | Public |
| `qr_code_value` | VARCHAR(100) | No | NULL | — | QR code | Public |
| `is_verified` | BOOLEAN | Yes | `false` | — | Verification complete | Internal |
| `is_expired` | BOOLEAN | Yes | `false` | Generated: `expiry_date < CURRENT_DATE` | Auto-block flag | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, BLOCKED, INACTIVE | Status | Internal |

---

## Entity 123 — Certificate of Analysis (COA)

### 1. Business Purpose
Stores supplier quality certificates. Per Part 8: Supports PDF, Digital Certificates, Electronic Signatures.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `coa_number` | VARCHAR(50) | Yes | — | Unique per supplier | COA number (per Part 8) | Internal |
| `supplier_id` | UUID | Yes | — | FK to `suppliers` | Issuing supplier | Confidential |
| `product_id` | UUID | Yes | — | FK to `products` | Product | Internal |
| `batch_id` | UUID | Yes | — | FK to `batches` | Batch | Internal |
| `issue_date` | DATE | Yes | — | — | COA issue date (per Part 8) | Internal |
| `expiry_date` | DATE | No | NULL | > issue_date | COA validity | Internal |
| `issued_by` | VARCHAR(100) | No | NULL | — | Issued by (per Part 8) | Internal |
| `document_file_id` | UUID | Yes | — | FK to `file_attachments` | PDF/digital cert (per Part 8) | Confidential |
| `digital_signature` | VARCHAR(500) | No | NULL | — | Electronic signature (per Part 8) | Confidential |
| `verification_status` | ENUM | Yes | `PENDING` | PENDING, VERIFIED, REJECTED, EXPIRED | Status (per Part 8) | Confidential |
| `verified_by` | UUID | No | NULL | FK to `user_accounts` | Verifier | Internal |
| `verified_at` | TIMESTAMPTZ | No | NULL | — | Verification time | Internal |
| `portal_uploaded` | BOOLEAN | Yes | `false` | — | Uploaded via Supplier Portal (per Enhancement) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Status | Internal |

---

## Entity 124 — Quarantine Management

### 1. Business Purpose
Stores materials awaiting approval. Per Part 8 reasons: QC Pending, COA Pending, Documentation Missing, Temperature Deviation, Damaged Packaging, Supplier Complaint.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `quarantine_number` | VARCHAR(50) | Yes | — | Unique per company | Display number | Internal |
| `warehouse_id` | UUID | Yes | — | FK to `facilities` | Quarantine warehouse | Internal |
| `zone_id` | UUID | Yes | — | FK to `locations` (ZONE) | Quarantine zone | Internal |
| `batch_id` | UUID | Yes | — | FK to `batches` | Quarantined batch | Internal |
| `reason` | ENUM | Yes | — | QC_PENDING, COA_PENDING, DOCUMENTATION_MISSING, TEMP_DEVIATION, DAMAGED_PACKAGING, SUPPLIER_COMPLAINT (per Part 8) | Reason | Confidential |
| `inspector_user_id` | UUID | No | NULL | FK to `user_accounts` | Assigned inspector | Internal |
| `hold_date` | TIMESTAMPTZ | Yes | `NOW()` | — | Hold start (per Part 8) | Internal |
| `release_date` | TIMESTAMPTZ | No | NULL | — | Release date (per Part 8) | Internal |
| `status` | ENUM | Yes | `ON_HOLD` | ON_HOLD, RELEASED, SCRAPPED, RETURNED | Status | Internal |

---

## Entity 125 — Material Acceptance

### 1. Business Purpose
Records approved quantities. Per Part 8: *"Only accepted quantity enters inventory."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `inspection_id` | UUID | Yes | — | FK to `incoming_inspections` | Parent inspection | Internal |
| `accepted_quantity` | DECIMAL(18,4) | Yes | — | ≥ 0 | Accepted (per Part 8) | Internal |
| `rejected_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Rejected (per Part 8) | Internal |
| `conditional_quantity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Conditional (per Part 8) | Internal |
| `released_by` | UUID | Yes | — | FK to `user_accounts` | Releaser | Confidential |
| `release_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Release time | Internal |
| `inventory_status` | ENUM | Yes | `AVAILABLE` | AVAILABLE, QC_HOLD, BLOCKED | Resulting inventory status | Internal |

---

## Entity 126 — Rejected Material

### 1. Business Purpose
Tracks rejected materials. Per Part 8 reasons: Contamination, Expired, Wrong Material, Damaged, Foreign Particles, Spec Failure, Microbiology Failure, Packaging Failure. Disposition: Destroy, Return Supplier, Rework, Conditional Use.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `inspection_id` | UUID | Yes | — | FK to `incoming_inspections` | Parent inspection | Internal |
| `batch_id` | UUID | Yes | — | FK to `batches` | Rejected batch | Internal |
| `quantity` | DECIMAL(18,4) | Yes | — | > 0 | Rejected qty | Internal |
| `rejection_reason` | ENUM | Yes | — | CONTAMINATION, EXPIRED, WRONG_MATERIAL, DAMAGED, FOREIGN_PARTICLES, SPEC_FAILURE, MICROBIOLOGY_FAILURE, PACKAGING_FAILURE (per Part 8) | Reason | Confidential |
| `disposition` | ENUM | Yes | — | DESTROY, RETURN_SUPPLIER, REWORK, CONDITIONAL_USE (per Part 8) | Disposition | Internal |
| `disposition_date` | DATE | No | NULL | — | Action date | Internal |
| `cost_impact` | DECIMAL(18,4) | No | NULL | ≥ 0 | Financial impact | Confidential |
| `status` | ENUM | Yes | `PENDING` | PENDING, DISPOSED, RETURNED, REWORKED | Status | Internal |

---

## Entity 127 — Supplier Quality Score

### 1. Business Purpose
Measures supplier quality. Per Part 8 KPIs: Acceptance %, Rejection %, Complaint %, On-Time Delivery, Documentation Accuracy, COA Accuracy, Audit Score, Response Time.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `supplier_id` | UUID | Yes | — | FK to `suppliers` | Evaluated supplier | Confidential |
| `period_start` | DATE | Yes | — | — | Period start | Internal |
| `period_end` | DATE | Yes | — | > period_start | Period end | Internal |
| `acceptance_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Acceptance % (per Part 8) | Internal |
| `rejection_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Rejection % (per Part 8) | Internal |
| `complaint_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Complaint % (per Part 8) | Internal |
| `on_time_delivery_pct` | DECIMAL(5,2) | Yes | — | 0-100 | OTD % (per Part 8) | Internal |
| `documentation_accuracy_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Doc accuracy (per Part 8) | Internal |
| `coa_accuracy_pct` | DECIMAL(5,2) | Yes | — | 0-100 | COA accuracy (per Part 8) | Internal |
| `audit_score` | DECIMAL(5,2) | Yes | — | 0-100 | Audit score (per Part 8) | Confidential |
| `response_time_hours` | DECIMAL(8,2) | Yes | — | ≥ 0 | Avg response time | Internal |
| `overall_score` | DECIMAL(5,2) | Yes | — | 0-100 | Weighted total | Internal |
| `risk_level` | ENUM | Yes | `LOW` | LOW, MEDIUM, HIGH, CRITICAL | Risk level (per Part 8 AI) | Confidential |
| `ai_ranking` | INTEGER | No | NULL | ≥ 1 | Supplier rank (per Part 8 AI) | Confidential |

---

## Entity 128 — Incoming Defect

### 1. Business Purpose
Tracks defects found during receiving. Per Part 8 categories: Packaging, Weight, Color, Odor, Temperature, Moisture, Foreign Material, Microbiology, Label, Documentation.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `inspection_id` | UUID | Yes | — | FK to `incoming_inspections` | Parent inspection | Internal |
| `defect_category` | ENUM | Yes | — | PACKAGING, WEIGHT, COLOR, ODOR, TEMPERATURE, MOISTURE, FOREIGN_MATERIAL, MICROBIOLOGY, LABEL, DOCUMENTATION (per Part 8) | Category | Internal |
| `defect_description` | TEXT | Yes | — | Min 10 chars | Details | Internal |
| `severity` | ENUM | Yes | `MEDIUM` | LOW, MEDIUM, HIGH, CRITICAL | Severity | Confidential |
| `quantity_affected` | DECIMAL(18,4) | Yes | — | > 0 | Affected qty | Internal |
| `photo_file_id` | UUID | No | NULL | FK to `file_attachments` | Evidence photo | Internal |

---

## Entity 129 — Incoming Quality Decision

### 1. Business Purpose
Formal quality decision record. Per Part 8: Accepted, Accepted with Deviation, Conditional Release, Rejected, Quarantine, Supplier CAPA Required. Approval levels: Inspector → QA Executive → QA Manager → Plant Head.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `inspection_id` | UUID | Yes | — | FK to `incoming_inspections` | Parent inspection | Confidential |
| `decision` | ENUM | Yes | — | ACCEPTED, ACCEPTED_WITH_DEVIATION, CONDITIONAL_RELEASE, REJECTED, QUARANTINE, SUPPLIER_CAPA_REQUIRED (per Part 8) | Decision | Confidential |
| `decision_reason` | TEXT | Yes | — | Min 10 chars | Reason | Internal |
| `approval_level` | ENUM | Yes | `INSPECTOR` | INSPECTOR, QA_EXECUTIVE, QA_MANAGER, PLANT_HEAD (per Part 8) | Level | Internal |
| `approved_by` | UUID | Yes | — | FK to `user_accounts` | Decider | Confidential |
| `approved_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Decision time | Internal |
| `digital_signature` | VARCHAR(500) | No | NULL | — | Signature | Confidential |
| `capa_id` | UUID | No | NULL | FK to `capas` | Triggered CAPA | Confidential |

---

## Entity 130 — Incoming QC Dashboard

### 1. Business Purpose
Snapshot of incoming QC metrics. Per Part 8: Pending Inspections, Quarantine Stock, Rejected Material, Supplier Ranking, Today's Pass/Reject %, Open CAPAs, Incoming Risk Score.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Plant | Internal |
| `pending_inspections` | INTEGER | Yes | `0` | ≥ 0 | Pending (per Part 8) | Internal |
| `quarantine_stock_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Quarantined (per Part 8) | Internal |
| `rejected_material_qty` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Rejected (per Part 8) | Internal |
| `supplier_ranking` | JSONB | No | NULL | — | Top/bottom suppliers (per Part 8) | Confidential |
| `pass_pct_today` | DECIMAL(5,2) | Yes | `0` | 0-100 | Pass % (per Part 8) | Internal |
| `reject_pct_today` | DECIMAL(5,2) | Yes | `0` | 0-100 | Reject % (per Part 8) | Internal |
| `open_capas` | INTEGER | Yes | `0` | ≥ 0 | Open CAPAs (per Part 8) | Confidential |
| `incoming_risk_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Risk score (per Part 8) | Confidential |

---

## Entity 131 — In-Process Inspection

### 1. Business Purpose
Represents inspections performed during manufacturing. Per Part 8 Sec 3: *"Inspection automatically generated at configured process stages. Inspection cannot be deleted."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `IPQC-` | Inspection code | Internal |
| `production_order_id` | UUID | Yes | — | FK to `production_orders` | Parent order | Internal |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Batch inspected | Internal |
| `process_stage_id` | UUID | Yes | — | FK to `production_stages` | Stage (per Part 8: "Process Stage") | Internal |
| `inspector_user_id` | UUID | Yes | — | FK to `user_accounts` | Inspector | Internal |
| `inspection_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Time (per Part 8) | Internal |
| `inspection_status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, PASSED, FAILED, ON_HOLD, REWORK, APPROVED (per Part 8) | Status | Internal |
| `result` | ENUM | No | NULL | PASS, FAIL, CONDITIONAL | Overall result | Confidential |
| `checklist_id` | UUID | No | NULL | FK to `quality_checklists` | Checklist used | Internal |
| `ebr_compiled` | BOOLEAN | Yes | `false` | — | EBR data captured (per Enhancement) | Internal |
| `remarks` | TEXT | No | NULL | — | Notes | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED | Standard | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5-16. Standard Pattern
- **Partitioning**: Monthly by `inspection_time`.
- **Validation**: Auto-generated at configured stages; cannot be deleted.

---

## Entity 132 — Critical Control Point (CCP)

### 1. Business Purpose
Defines mandatory food safety checkpoints. Per Part 8: *"CCP failure can automatically stop production."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ccp_code` | VARCHAR(30) | Yes | — | Unique per company | CCP code | Confidential |
| `recipe_version_id` | UUID | Yes | — | FK to `recipe_versions` | Applicable recipe | Confidential |
| `process_stage_id` | UUID | Yes | — | FK to `production_stages` | Stage (per Part 8) | Internal |
| `parameter_code` | VARCHAR(30) | Yes | — | FK to `quality_parameters` | Parameter (per Part 8) | Internal |
| `critical_limit_min` | DECIMAL(18,4) | Yes | — | — | Min limit (per Part 8) | Confidential |
| `critical_limit_max` | DECIMAL(18,4) | Yes | — | ≥ min | Max limit (per Part 8) | Confidential |
| `tolerance` | DECIMAL(5,2) | Yes | — | 0-100 | Tolerance % (per Part 8) | Internal |
| `corrective_action` | TEXT | Yes | — | Min 20 chars | Action on failure (per Part 8) | Confidential |
| `is_mandatory` | BOOLEAN | Yes | `true` | — | Mandatory (per Part 8) | Confidential |
| `auto_stop_production` | BOOLEAN | Yes | `true` | — | Stops production on failure (per Part 8) | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 133 — Process Quality Result

### 1. Business Purpose
Stores measured production values. Per Part 8: Supports Numeric, Boolean, Visual, Image, Laboratory Reference.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `inspection_id` | UUID | Yes | — | FK to `in_process_inspections` | Parent inspection | Internal |
| `parameter_code` | VARCHAR(30) | Yes | — | FK to `quality_parameters` | Parameter measured | Internal |
| `expected_value` | DECIMAL(18,4) | Yes | — | — | Expected (per Part 8) | Internal |
| `actual_value` | DECIMAL(18,4) | No | NULL | — | Actual (per Part 8) | Internal |
| `tolerance_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Tolerance (per Part 8) | Internal |
| `pass_fail` | ENUM | Yes | — | PASS, FAIL, NA | Result | Confidential |
| `measurement_device` | VARCHAR(100) | No | NULL | — | Device used (per Part 8) | Internal |
| `operator_user_id` | UUID | Yes | — | FK to `user_accounts` | Operator (per Part 8) | Internal |
| `timestamp` | TIMESTAMPTZ | Yes | `NOW()` | — | Measurement time (per Part 8) | Internal |
| `result_type` | ENUM | Yes | `NUMERIC` | NUMERIC, BOOLEAN, VISUAL, IMAGE, LAB_REF (per Part 8) | Type | Internal |
| `image_file_id` | UUID | No | NULL | FK to `file_attachments` | Image evidence | Internal |
| `lab_test_id` | UUID | No | NULL | FK to `lab_tests` | Lab reference | Confidential |

---

## Entity 134 — Production Hold

### 1. Business Purpose
Temporarily blocks production. Per Part 8 reasons: Quality Failure, Machine Issue, Material Issue, Operator Issue, Safety Issue, CCP Failure, Investigation. *"Production cannot resume without approval."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Held batch | Internal |
| `hold_reason` | ENUM | Yes | — | QUALITY_FAILURE, MACHINE_ISSUE, MATERIAL_ISSUE, OPERATOR_ISSUE, SAFETY_ISSUE, CCP_FAILURE, INVESTIGATION (per Part 8) | Reason | Confidential |
| `hold_description` | TEXT | Yes | — | Min 10 chars | Details | Internal |
| `hold_start_time` | TIMESTAMPTZ | Yes | `NOW()` | — | Start | Internal |
| `hold_end_time` | TIMESTAMPTZ | No | NULL | — | End (on release) | Internal |
| `duration_min` | INTEGER | No | NULL | ≥ 0 | Duration | Internal |
| `approved_by` | UUID | No | NULL | FK to `user_accounts` | Release approver | Confidential |
| `status` | ENUM | Yes | `ON_HOLD` | ON_HOLD, RELEASED, CANCELLED | Status | Internal |

---

## Entity 135 — Rework Management

### 1. Business Purpose
Tracks batches requiring reprocessing. Per Part 8: *"Every rework cycle audited. Maximum rework count configurable."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Batch to rework | Internal |
| `rework_count` | INTEGER | Yes | `1` | ≥ 1, ≤ max_configured | Rework cycle number | Internal |
| `reason` | TEXT | Yes | — | Min 10 chars | Rework reason (per Part 8) | Internal |
| `rework_method` | TEXT | Yes | — | Min 10 chars | Method (per Part 8) | Internal |
| `supervisor_user_id` | UUID | Yes | — | FK to `user_accounts` | Supervisor | Internal |
| `qa_approval_id` | UUID | Yes | — | FK to `quality_approvals` | QA approval | Confidential |
| `expected_yield_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Expected yield (per Part 8) | Internal |
| `actual_yield_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Actual yield (per Part 8) | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, IN_PROGRESS, COMPLETED, REJECTED | Status | Internal |

---

## Entity 136 — Final Quality Inspection (FQC)

### 1. Business Purpose
Final inspection before release. Per Part 8 flow: Production Complete → Sampling → Lab → Final Inspection → QA Approval → Inventory Release.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `code` | VARCHAR(30) | Yes | — | Unique per company, `FQC-` | Inspection code | Internal |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Batch inspected | Internal |
| `product_id` | UUID | Yes | — | FK to `products` | Finished product | Internal |
| `inspector_user_id` | UUID | Yes | — | FK to `user_accounts` | Inspector | Internal |
| `inspection_date` | DATE | Yes | `CURRENT_DATE` | — | Date (per Part 8) | Internal |
| `overall_result` | ENUM | No | NULL | PASS, FAIL, CONDITIONAL | Result (per Part 8) | Confidential |
| `qa_decision` | ENUM | Yes | `PENDING` | PENDING, RELEASED, CONDITIONAL_RELEASE, QUARANTINED, REJECTED, REWORK_REQUIRED (per Part 8) | Decision | Confidential |
| `release_status` | ENUM | Yes | `PENDING` | RELEASED, CONDITIONAL_RELEASE, QUARANTINED, REJECTED, REWORK_REQUIRED (per Part 8) | Release status | Internal |
| `specification_version_id` | UUID | Yes | — | FK to `quality_specification_versions` | Spec checked | Confidential |
| `lab_test_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Lab tests referenced | Confidential |
| `approval_id` | UUID | No | NULL | FK to `quality_approvals` | Approval workflow | Confidential |
| `remarks` | TEXT | No | NULL | — | Notes | Internal |

---

## Entity 137 — Batch Release

### 1. Business Purpose
Official QA release. Per Part 8: *"Inventory cannot become AVAILABLE without release (configurable)."*

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `release_number` | VARCHAR(50) | Yes | — | Unique per company | Display number | Internal |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Released batch | Internal |
| `fqc_inspection_id` | UUID | Yes | — | FK to `final_quality_inspections` | Source FQC | Confidential |
| `released_by` | UUID | Yes | — | FK to `user_accounts` | Releaser (per Part 8) | Confidential |
| `release_date` | TIMESTAMPTZ | Yes | `NOW()` | — | Release time (per Part 8) | Internal |
| `inventory_status` | ENUM | Yes | `AVAILABLE` | AVAILABLE, QC_HOLD, BLOCKED | Resulting status (per Part 8) | Internal |
| `digital_signature` | VARCHAR(500) | No | NULL | — | Signature (per Part 8) | Confidential |
| `release_type` | ENUM | Yes | `FULL` | FULL, CONDITIONAL | Type | Internal |
| `conditions` | TEXT | No | NULL | — | Conditions (if conditional) | Internal |
| `remarks` | TEXT | No | NULL | — | Notes | Internal |

---

## Entity 138 — Batch Rejection

### 1. Business Purpose
Tracks rejected finished batches. Per Part 8 reasons: Microbiology, Weight, Packaging, Label, Foreign Matter, Appearance, Taste, Odor. Disposition: Destroy, Rework, Downgrade, Customer Sample, Investigation.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `manufacturing_batch_id` | UUID | Yes | — | FK to `manufacturing_batches` | Rejected batch | Internal |
| `fqc_inspection_id` | UUID | Yes | — | FK to `final_quality_inspections` | Source FQC | Confidential |
| `rejection_reason` | ENUM | Yes | — | MICROBIOLOGY, WEIGHT_FAILURE, PACKAGING_FAILURE, LABEL_FAILURE, FOREIGN_MATTER, APPEARANCE, TASTE, ODOR (per Part 8) | Reason | Confidential |
| `rejection_description` | TEXT | Yes | — | Min 10 chars | Details | Internal |
| `disposition` | ENUM | Yes | — | DESTROY, REWORK, DOWNGRADE, CUSTOMER_SAMPLE, INVESTIGATION (per Part 8) | Disposition | Internal |
| `disposition_date` | DATE | No | NULL | — | Action date | Internal |
| `cost_impact` | DECIMAL(18,4) | No | NULL | ≥ 0 | Financial impact | Confidential |
| `capa_id` | UUID | No | NULL | FK to `capas` | Triggered CAPA | Confidential |

---

## Entity 139 — Quality Exception

### 1. Business Purpose
Captures unexpected quality events. Per Part 8 categories: Deviation, Critical Failure, Specification Violation, Equipment Failure, Human Error, Supplier Material, Environmental. Priority: Critical, High, Medium, Low.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `exception_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `entity_type` | VARCHAR(30) | Yes | — | — | Source (BATCH, GRN, MACHINE) | Internal |
| `entity_id` | UUID | Yes | — | — | Source ID | Internal |
| `exception_category` | ENUM | Yes | — | DEVIATION, CRITICAL_FAILURE, SPECIFICATION_VIOLATION, EQUIPMENT_FAILURE, HUMAN_ERROR, SUPPLIER_MATERIAL, ENVIRONMENTAL (per Part 8) | Category | Confidential |
| `priority` | ENUM | Yes | `HIGH` | CRITICAL, HIGH, MEDIUM, LOW (per Part 8) | Priority | Internal |
| `description` | TEXT | Yes | — | Min 20 chars | Details | Internal |
| `identified_by` | UUID | Yes | — | FK to `user_accounts` | Identifier | Internal |
| `identified_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Time | Internal |
| `capa_id` | UUID | No | NULL | FK to `capas` | CAPA triggered | Confidential |
| `status` | ENUM | Yes | `OPEN` | OPEN, INVESTIGATING, RESOLVED, CLOSED | Status | Internal |

---

## Entity 140 — Production Quality Dashboard

### 1. Business Purpose
Snapshot of production quality metrics. Per Part 8: Running Inspections, Failed CCPs, Open Holds, Open Rework, Released Batches, Rejected Batches, Today's Pass Rate, Today's Quality Score.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Date | Internal |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Plant | Internal |
| `running_inspections` | INTEGER | Yes | `0` | ≥ 0 | Active (per Part 8) | Internal |
| `failed_ccps` | INTEGER | Yes | `0` | ≥ 0 | CCP failures (per Part 8) | Confidential |
| `open_holds` | INTEGER | Yes | `0` | ≥ 0 | Holds (per Part 8) | Internal |
| `open_rework` | INTEGER | Yes | `0` | ≥ 0 | Rework (per Part 8) | Internal |
| `released_batches` | INTEGER | Yes | `0` | ≥ 0 | Released (per Part 8) | Internal |
| `rejected_batches` | INTEGER | Yes | `0` | ≥ 0 | Rejected (per Part 8) | Confidential |
| `pass_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Pass % (per Part 8) | Internal |
| `quality_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Score (per Part 8) | Internal |

---

## Part 8 Sections 2 & 3 Completion Summary

**All 20 Incoming QC & In-Process/Final QC entities are now defined** at full enterprise-grade depth.

### Key Architectural Decisions

1. **Mandatory incoming inspection** — Auto-created on GRN; no bypass (per Part 8 Sec 2)
2. **Quarantine-first receiving** — Materials held until QA release
3. **COA verification** — Digital certificates with electronic signatures
4. **Supplier quality scoring** — 8 KPIs with AI ranking + risk
5. **Stage-wise quality inspections** — Auto-generated at configured process stages (per Part 8 Sec 3)
6. **CCP monitoring** — Auto-stop production on critical failure
7. **Production hold workflow** — No resume without approval
8. **Controlled rework** — Audited, max count configurable
9. **Mandatory final quality release** — No inventory without FQC release
10. **Digital approvals** — Multi-tier with digital signature readiness
11. **Supplier Portal ready** — `portal_enabled`, `portal_uploaded` fields (per Enhancement)
12. **AI Vision Inspection ready** — `vision_inspection_result`, `vision_anomaly_detected` (per Enhancement)
13. **Electronic Batch Record (EBR) ready** — `ebr_compiled` flag on inspections (per Enhancement)
14. **Complete batch traceability** — Inspection → CCP → Result → Hold → Rework → FQC → Release → Inventory
15. **Monthly partitioning** — High-volume inspection tables partitioned by date

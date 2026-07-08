# Manual 1 · Part 14 · Sections 7-9 · Entities 661-690 — Audit, Search & Identification

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 14 — Enterprise Platform Services (EPS) |
| Sections | 7 (Enterprise Audit Engine, Activity Logs & Compliance), 8 (Enterprise Search Engine, Global Search & Enterprise Indexing), 9 (Barcode, QR Code, RFID & Enterprise Label Printing Engine) |
| Entities | 661–690 |
| Version | 1.0.0 |
| Status | ACTIVE — LOCKED |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 9, Part 14 §7-9 |
| Last Updated | 2026-07-08 |
| Importance | **CRITICAL — Enterprise Governance & Identification Layer** |

---

## Overview — Enterprise Governance & Identification Layer

Sections 7-9 complete the **Enterprise Governance & Identification Layer** of SUOP. These services provide **traceability, searchability, compliance, and identification** across the enterprise — consumed by every application in the platform.

```
AUDIT ENGINE (Sec 7: 661-670)
  Business Event → Audit Engine → Audit Log → Compliance Rules → Retention → Reports → Investigation
  ↓ Searchable via
SEARCH ENGINE (Sec 8: 671-680)
  Modules → Indexing Engine → Search Index → Permission Filter → Global Search → Results → Drill Down
  ↓ Identifies via
IDENTIFICATION ENGINE (Sec 9: 681-690)
  Entity → Identity Engine → Barcode/QR/RFID → Scanner → Business Action → Audit
```

### 🏆 Architectural Lock: Universal Identity Resolution Service (Q191)

Per Chief Enterprise Architect recommendation, the **Universal Identity Resolution Service** is hereby locked as **Architectural Decision Q191** and **Foundation Service #53**. This service sits **above** the Barcode, QR, RFID, and Search engines as the single entry point for all physical-to-digital identification across the SUOP platform.

**Problem Solved**: Instead of each module interpreting scanned identifiers independently (leading to inconsistent behavior and duplicated logic), every scan or lookup first passes through this service.

**Locked Architecture**:
```
Barcode ─┐
QR Code ─┤
RFID ────┤
Reference Number ─┤
Document Number ──┴──► Identity Resolution Service (FS-53, Q191)
                          │
                          ├─► Universal Entity Resolver
                          ├─► Permission Validation
                          ├─► Search Engine (FS-48)
                          └─► Business Module
```

**Architectural Benefits (Locked)**:
1. **One lookup API** for all identifiers (barcode, QR, RFID, reference numbers, document numbers)
2. **Consistent behavior** across Warehouse, Manufacturing, Retail, Restaurant, HR, Finance, and Maintenance
3. **Simplified scanner application development** — single integration point
4. **Faster integration with third-party hardware** — one contract for all scanners
5. **Better caching and performance** — centralized identity cache
6. **Centralized audit and security validation** — every lookup logged uniformly

**Resolution Logic**:
- Input: any identifier (barcode string, QR payload, RFID tag, document number, reference number)
- Service auto-detects identifier type and resolves to universal entity
- Permission validation applied before returning entity to caller
- All resolutions logged for audit
- Cache layer for frequently-resolved entities (5-min TTL)

**Governance**: Owned by Platform Kernel team (per Q189). Business modules call `IdentityResolutionService.resolve(identifier)` — they never interpret identifiers directly.

---

# SECTION 7: Enterprise Audit Engine, Activity Logs & Compliance (Entities 661-670)

## Entity 661 — Audit Event

### 1. Business Purpose
Per Part 14 §7: Stores Event ID, Module, Entity, Action, User, Timestamp, IP Address, Device. The atomic unit of the audit system.

### 2. Architectural Role
**Foundational audit entity** — every important business action creates an Audit Event. Per Vol 0: "Nothing should happen without leaving an audit trail." The system is **immutable** and supports regulatory compliance, security investigations, and operational transparency.

### 3. Business Rules
- **Append-only** — records are never updated or deleted (corrections via new compensating records)
- **Tamper-evident** — hash chain across consecutive records per partition (per module or per entity)
- **User attribution** — every event linked to an actor (user, system, or service)
- **Before/After tracking** — material field changes captured (per Entity 663 Change History)
- **Compliance retention** — per Compliance Policy (Entity 664) and Audit Retention (Entity 665)
- **Searchable** — full-text indexed for fast queries
- **Digital evidence** — supporting artifacts linked (per Entity 666)
- Partitioning: by month for query performance (Time-series pattern)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `event_id` | VARCHAR(50) | Yes | — | Unique enterprise-wide | Event ID (per Part 14) — display identifier | Internal |
| `audit_partition_key` | VARCHAR(20) | Yes | — | — | Partition key (YYYY-MM) | Internal |
| `business_module` | ENUM | Yes | — | INVENTORY, PROCUREMENT, WAREHOUSE, MANUFACTURING, RETAIL, RESTAURANT, FINANCE, HR, EAM, QUALITY, PLATFORM, ALL | Module (per Part 14) | Internal |
| `entity_type` | VARCHAR(100) | Yes | — | — | Entity (per Part 14) — e.g., `purchase_order` | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ID | Internal |
| `entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `action` | ENUM | Yes | — | CREATE, READ, UPDATE, DELETE, APPROVE, REJECT, EXPORT, PRINT, LOGIN, LOGOUT, SHARE, ARCHIVE, RESTORE, ASSIGN, TRANSFER, SIGN, SUBMIT, CANCEL, OTHER | Action (per Part 14) | Internal |
| `action_category` | ENUM | Yes | — | LIFECYCLE, MODIFICATION, APPROVAL, ACCESS, SECURITY, COMPLIANCE, INTEGRATION, SYSTEM | Category | Internal |
| `event_type` | VARCHAR(100) | Yes | — | — | Specific event (e.g., `purchase_order.submitted`) | Internal |
| `actor_identity_id` | UUID | No | NULL | FK to `identity_master` (Entity 601) | User (per Part 14) | Confidential |
| `actor_name` | VARCHAR(200) | No | NULL | — | Denormalized | Internal |
| `actor_type` | ENUM | Yes | — | USER, SYSTEM, SERVICE_ACCOUNT, EXTERNAL_USER, AI, WORKFLOW, SCHEDULED_JOB | Type | Internal |
| `actor_role_id` | UUID | No | NULL | FK to `role_master` | Role at time | Confidential |
| `action_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Timestamp (per Part 14) | Internal |
| `ip_address` | INET | No | NULL | — | IP Address (per Part 14) | Confidential |
| `ip_geolocation` | JSONB | No | NULL | — | { city, state, country, lat, lon } | Confidential |
| `user_agent` | TEXT | No | NULL | — | User agent | Confidential |
| `session_id` | UUID | No | NULL | FK to `session_management` (Entity 603) | Session | Confidential |
| `device_id` | UUID | No | NULL | FK to `device_registry` (Entity 604) | Device (per Part 14) | Confidential |
| `device_type` | VARCHAR(50) | No | NULL | — | Device type | Internal |
| `request_id` | UUID | No | NULL | — | Request ID | Internal |
| `correlation_id` | UUID | No | NULL | — | Cross-service correlation | Internal |
| `trace_id` | UUID | No | NULL | — | Distributed trace | Internal |
| `api_endpoint` | VARCHAR(500) | No | NULL | — | API endpoint | Internal |
| `http_method` | VARCHAR(10) | No | NULL | — | HTTP method | Internal |
| `http_status_code` | INTEGER | No | NULL | 100-599 | Status | Internal |
| `request_payload_summary` | JSONB | No | NULL | — | Request summary (no PII) | Confidential |
| `response_payload_summary` | JSONB | No | NULL | — | Response summary | Confidential |
| `before_values` | JSONB | No | NULL | — | State before | Confidential |
| `after_values` | JSONB | No | NULL | — | State after | Confidential |
| `change_summary` | TEXT | No | NULL | — | Human-readable summary | Internal |
| `business_context` | JSONB | Yes | `'{}'` | — | Additional context | Confidential |
| `workflow_instance_id` | UUID | No | NULL | FK to `workflow_instance` | Linked workflow | Internal |
| `task_id` | UUID | No | NULL | FK to `task_queue` | Linked task | Internal |
| `notification_queue_id` | UUID | No | NULL | FK to `notification_queue` | Linked notification | Internal |
| `document_master_id` | UUID | No | NULL | FK to `document_master` | Linked document | Internal |
| `compliance_policy_id` | UUID | No | NULL | FK to `compliance_policy` (Entity 664) | Compliance tag | Internal |
| `retention_policy_id` | UUID | Yes | — | FK to `audit_retention` (Entity 665) | Retention | Internal |
| `retention_until` | DATE | Yes | — | — | Retention expiry | Internal |
| `legal_hold` | BOOLEAN | Yes | `false` | — | Legal hold | Confidential |
| `legal_hold_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `legal_hold_until` | DATE | No | NULL | — | Until | Internal |
| `risk_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | AI risk score | Confidential |
| `risk_factors` | JSONB | No | NULL | — | Detected risks | Confidential |
| `is_flagged` | BOOLEAN | Yes | `false` | — | Flagged for review | Confidential |
| `flag_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `partition_sequence` | BIGINT | Yes | — | — | Sequence within partition | Internal |
| `previous_hash` | VARCHAR(64) | Yes | — | — | Hash of previous event (per partition) | Internal |
| `record_hash` | VARCHAR(64) | Yes | — | SHA-256 | Hash of this record | Internal |
| `hash_algorithm` | VARCHAR(20) | Yes | `SHA-256` | — | Algorithm | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, EXPORTED, ARCHIVED, PURGED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard (created_at only; immutable) | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Identity Master (601) | Many-to-One | N:1 | Actor |
| Session Management (603) | Many-to-One | N:1 | Session |
| Device Registry (604) | Many-to-One | N:1 | Device |
| Compliance Policy (664) | Many-to-One | N:1 | Compliance |
| Audit Retention (665) | Many-to-One | N:1 | Retention |
| Digital Evidence (666) | One-to-Many | 1:N | Evidence |
| Change History (663) | One-to-Many | 1:N | Field changes |

### 6. Indexes
- UNIQUE (`event_id`)
- INDEX (`audit_partition_key`, `partition_sequence`)
- INDEX (`business_module`, `entity_type`, `entity_id`, `action_timestamp` DESC)
- INDEX (`actor_identity_id`, `action_timestamp` DESC)
- INDEX (`action`, `action_timestamp` DESC)
- INDEX (`action_timestamp`, `retention_until`)
- INDEX (`correlation_id`)
- INDEX (`trace_id`)
- INDEX (`legal_hold`) WHERE `legal_hold = true`
- INDEX (`is_flagged`) WHERE `is_flagged = true`
- INDEX (`record_hash`)

### 7. Security Classification
**Confidential** — audit data with PII; before/after values may be **Restricted**.

### 8. Integration Points
- **Audit Engine** (FS-5): Primary consumer
- **Unified Automation Engine** (FS-52, Q190): All events flow through
- **Compliance Engine**: Regulatory reporting
- **Security Incident** (Entity 667): Anomaly escalation
- **Search Engine** (FS-48): Audit search
- **All Business Modules**: Audit event emission

### 9. Sample Data
```json
{
  "event_id": "AE-2026-07-00123456", "audit_partition_key": "2026-07",
  "business_module": "PROCUREMENT", "entity_type": "purchase_order",
  "entity_id": "po-001", "entity_code": "PO-MUM-2026-001248",
  "action": "APPROVE", "action_category": "APPROVAL",
  "event_type": "purchase_order.approved",
  "actor_identity_id": "id-100", "actor_name": "Rajesh Kumar",
  "actor_type": "USER", "actor_role_id": "role-mgr",
  "action_timestamp": "2026-07-08T10:30:00Z",
  "ip_address": "192.168.1.50", "session_id": "ses-001",
  "device_id": "dev-001", "device_type": "DESKTOP",
  "correlation_id": "corr-001", "change_summary": "PO approved by reporting manager",
  "workflow_instance_id": "wfi-001", "task_id": "tsk-001",
  "retention_until": "2033-07-08", "risk_score": 5.00,
  "record_hash": "abc123def456...", "company_id": "cmp-001",
  "branch_id": "br-mum-001", "status": "RECORDED"
}
```

### 10. Audit Events
(Meta-recursive: this entity IS the audit trail; events on this entity are managed by Audit Engine itself with extra governance)

---

## Entity 662 — Activity Log

### 1. Business Purpose
Per Part 14 §7: Tracks Login, Logout, Create, Update, Delete, Approve, Reject, Export, Print. User activity log (separate from audit events for performance and queryability).

### 2. Architectural Role
Operational log entity — derived from Audit Events but indexed for fast user-activity queries. Powers user activity reports and "recent activity" widgets.

### 3. Business Rules
- Activity logs are derived from Audit Events (denormalized for query performance)
- Indexed by user, module, action, and timestamp
- Used for: user activity reports, "recent activity" widgets, compliance evidence
- Retention: shorter than Audit Events (1 year typical) — Audit Events retain longer
- Append-only — never updated

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `log_id` | VARCHAR(50) | Yes | — | Unique | Display ID | Internal |
| `audit_event_id` | UUID | Yes | — | FK to `audit_event` (Entity 661) | Source audit event | Internal |
| `identity_id` | UUID | Yes | — | FK to `identity_master` (Entity 601) | User | Confidential |
| `user_name` | VARCHAR(200) | Yes | — | — | Denormalized | Internal |
| `user_role_id` | UUID | No | NULL | FK to `role_master` | Role | Confidential |
| `activity_type` | ENUM | Yes | — | LOGIN, LOGOUT, CREATE, UPDATE, DELETE, APPROVE, REJECT, EXPORT, PRINT, SHARE, DOWNLOAD, VIEW, OTHER | Type (per Part 14) | Internal |
| `activity_category` | ENUM | Yes | — | AUTHENTICATION, MODIFICATION, APPROVAL, ACCESS, SHARING, EXPORT, OTHER | Category | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `entity_type` | VARCHAR(100) | No | NULL | — | Entity type | Internal |
| `entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `activity_description` | TEXT | Yes | — | Min 10 | Description | Confidential |
| `activity_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Timestamp | Internal |
| `ip_address` | INET | No | NULL | — | IP | Confidential |
| `device_type` | VARCHAR(50) | No | NULL | — | Device | Internal |
| `session_id` | UUID | No | NULL | FK to `session_management` | Session | Confidential |
| `duration_ms` | INTEGER | No | NULL | ≥ 0 | Action duration | Internal |
| `result` | ENUM | Yes | `SUCCESS` | SUCCESS, FAILURE, PARTIAL, ERROR | Result | Internal |
| `error_message` | TEXT | No | NULL | — | If failed | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `retention_until` | DATE | Yes | — | — | Retention | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Audit Event (661) | Many-to-One | N:1 | Source |
| Identity Master (601) | Many-to-One | N:1 | User |

### 6. Indexes
- UNIQUE (`log_id`)
- INDEX (`identity_id`, `activity_timestamp` DESC)
- INDEX (`activity_type`, `activity_timestamp` DESC)
- INDEX (`business_module`, `activity_timestamp` DESC)
- INDEX (`entity_type`, `entity_id`, `activity_timestamp` DESC)
- INDEX (`activity_timestamp`, `retention_until`)

### 7. Security Classification
**Confidential**

### 8. Integration Points
- **Audit Engine** (FS-5): Source
- **ESS/MSS Portals** (Part 12): Recent activity widgets
- **Compliance Reports**: User activity evidence
- **Search Engine** (FS-48): Activity search

### 9. Sample Data
```json
{
  "log_id": "AL-2026-07-00123456", "audit_event_id": "ae-001",
  "identity_id": "id-100", "user_name": "Rajesh Kumar",
  "activity_type": "APPROVE", "activity_category": "APPROVAL",
  "business_module": "PROCUREMENT", "entity_type": "purchase_order",
  "entity_id": "po-001", "entity_code": "PO-MUM-2026-001248",
  "activity_description": "Approved Purchase Order PO-MUM-2026-001248 for ₹500,000",
  "activity_timestamp": "2026-07-08T10:30:00Z", "ip_address": "192.168.1.50",
  "result": "SUCCESS", "company_id": "cmp-001",
  "retention_until": "2027-07-08", "status": "RECORDED"
}
```

### 10. Audit Events
`ACTIVITY_LOG_RECORDED`, `ACTIVITY_LOG_ARCHIVED`

---

## Entity 663 — Change History

### 1. Business Purpose
Per Part 14 §7: Stores Before Value, After Value, Changed Field, Reason, Approval Reference. Field-level change tracking.

### 2. Architectural Role
Detail entity — extends Audit Event with field-level granularity. Critical for compliance and dispute resolution.

### 3. Business Rules
- One Change History record per field changed (one Audit Event → multiple Change History records)
- Tracks: field_name, before_value, after_value, data_type, change_type
- Reason: optional user-provided reason for change
- Approval reference: if change required approval, link to workflow
- Encrypted values: for sensitive fields (e.g., salary), values encrypted

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `change_id` | VARCHAR(50) | Yes | — | Unique | Display ID | Internal |
| `audit_event_id` | UUID | Yes | — | FK to `audit_event` (Entity 661) | Parent audit event | Internal |
| `entity_type` | VARCHAR(100) | Yes | — | — | Entity type | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ID | Internal |
| `field_name` | VARCHAR(200) | Yes | — | — | Changed Field (per Part 14) | Internal |
| `field_path` | VARCHAR(500) | No | NULL | — | JSON path (for nested) | Internal |
| `data_type` | ENUM | Yes | — | STRING, INTEGER, DECIMAL, BOOLEAN, DATE, DATETIME, JSON, UUID, BINARY, REFERENCE | Type | Internal |
| `change_type` | ENUM | Yes | — | ADDED, MODIFIED, REMOVED, CLEARED | Change | Internal |
| `before_value` | TEXT | No | NULL | — | Before Value (per Part 14) | Confidential |
| `before_value_display` | TEXT | No | NULL | — | Human-readable | Internal |
| `after_value` | TEXT | No | NULL | — | After Value (per Part 14) | Confidential |
| `after_value_display` | TEXT | No | NULL | — | Human-readable | Internal |
| `before_value_encrypted` | TEXT | No | NULL | — | If sensitive | Restricted |
| `after_value_encrypted` | TEXT | No | NULL | — | If sensitive | Restricted |
| `encryption_key_id` | UUID | No | NULL | FK to `security_keys` | Key | Restricted |
| `is_sensitive` | BOOLEAN | Yes | `false` | — | Sensitive field | Confidential |
| `sensitivity_reason` | VARCHAR(100) | No | NULL | — | PII/Salary/etc. | Confidential |
| `change_reason` | TEXT | No | NULL | — | Reason (per Part 14) | Confidential |
| `approval_reference_id` | UUID | No | NULL | FK to `workflow_instance` | Approval Reference (per Part 14) | Internal |
| `approval_task_id` | UUID | No | NULL | FK to `task_queue` | Approval task | Internal |
| `change_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Timestamp | Internal |
| `changed_by` | UUID | Yes | — | FK to `identity_master` | Changer | Confidential |
| `validation_passed` | BOOLEAN | Yes | `true` | — | Field validation | Internal |
| `validation_errors` | JSONB | No | NULL | — | Errors | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `retention_until` | DATE | Yes | — | — | Retention | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Audit Event (661) | Many-to-One | N:1 | Parent |
| Identity Master (601) | Many-to-One | N:1 | Changer |
| Workflow Instance (633) | Many-to-One | N:1 | Approval |

### 6. Indexes
- UNIQUE (`change_id`)
- INDEX (`audit_event_id`)
- INDEX (`entity_type`, `entity_id`, `field_name`, `change_timestamp` DESC)
- INDEX (`field_name`, `change_timestamp` DESC)
- INDEX (`changed_by`, `change_timestamp` DESC)
- INDEX (`is_sensitive`) WHERE `is_sensitive = true`

### 7. Security Classification
**Confidential** — encrypted values are **Restricted**.

### 8. Integration Points
- **Audit Engine** (FS-5): Source
- **Compliance Engine**: Field-level compliance
- **HR** (Part 12): Sensitive field changes (salary, etc.)
- **Finance** (Part 11): Financial field changes

### 9. Sample Data
```json
{
  "change_id": "CH-2026-07-001234", "audit_event_id": "ae-001",
  "entity_type": "purchase_order", "entity_id": "po-001",
  "field_name": "status", "data_type": "STRING",
  "change_type": "MODIFIED", "before_value": "PENDING_APPROVAL",
  "after_value": "APPROVED", "change_reason": "Approved by reporting manager",
  "approval_reference_id": "wfi-001", "approval_task_id": "tsk-001",
  "changed_by": "id-100", "company_id": "cmp-001",
  "retention_until": "2033-07-08", "status": "RECORDED"
}
```

### 10. Audit Events
`CHANGE_HISTORY_RECORDED`, `CHANGE_HISTORY_ARCHIVED`, `SENSITIVE_FIELD_CHANGED`

---

## Entity 664 — Compliance Policy

### 1. Business Purpose
Per Part 14 §7: Supports ISO, FSSAI, HACCP, GMP, SOX, GDPR, Internal Policy. Compliance framework definitions.

### 2. Architectural Role
Master entity — defines compliance regulations and their audit requirements. Drives Audit Retention and Compliance Reports.

### 3. Business Rules
- Each compliance type has specific audit requirements (what to log, how long to retain)
- SOX: financial controls audit (7-year retention)
- GDPR: personal data access logs (right to explanation)
- FSSAI/HACCP/GMP: food safety audit (5-year retention)
- ISO: quality management system audit
- Internal Policy: company-specific compliance
- Multi-regulation: an entity can be subject to multiple compliance policies

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `policy_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `policy_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `compliance_type` | ENUM | Yes | — | ISO_9001, ISO_14001, ISO_27001, ISO_22000, FSSAI, HACCP, GMP, SOX, GDPR, CCPA, HIPAA, PCI_DSS, FACTORY_ACT, INTERNAL_POLICY, OTHER | Type (per Part 14) | Internal |
| `regulatory_authority` | VARCHAR(200) | Yes | — | — | Authority | Internal |
| `regulation_reference` | VARCHAR(200) | Yes | — | — | Reference | Internal |
| `policy_description` | TEXT | Yes | — | Min 30 | Description | Internal |
| `applicable_modules` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Affected modules | Internal |
| `applicable_entities` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Affected entities | Internal |
| `audit_requirements` | JSONB | Yes | `'[]'` | — | What must be logged | Confidential |
| `required_audit_fields` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Required fields | Internal |
| `retention_period_years` | INTEGER | Yes | `7` | 1-100 | Retention (per Part 14: "7 Years") | Internal |
| `retention_period_days` | INTEGER | Yes | `2555` | ≥ 365 | Days | Internal |
| `permanent_retention` | BOOLEAN | Yes | `false` | — | Permanent (per Part 14) | Internal |
| `reporting_frequency` | ENUM | Yes | `ANNUAL` | MONTHLY, QUARTERLY, HALF_YEARLY, ANNUAL, ON_DEMAND | Frequency | Internal |
| `next_report_due` | DATE | Yes | — | — | Next report | Internal |
| `data_subject_rights` | JSONB | No | NULL | — | GDPR rights | Confidential |
| `right_to_access` | BOOLEAN | Yes | `false` | — | GDPR access | Internal |
| `right_to_erasure` | BOOLEAN | Yes | `false` | — | GDPR erasure | Internal |
| `right_to_portability` | BOOLEAN | Yes | `false` | — | GDPR portability | Internal |
| `consent_required` | BOOLEAN | Yes | `false` | — | Consent needed | Internal |
| `cross_border_transfer_restricted` | BOOLEAN | Yes | `false` | — | Cross-border | Confidential |
| `data_localization_required` | BOOLEAN | Yes | `false` | — | Localization | Confidential |
| `encryption_required` | BOOLEAN | Yes | `true` | — | Encryption | Internal |
| `audit_trail_required` | BOOLEAN | Yes | `true` | — | Audit trail | Internal |
| `access_log_required` | BOOLEAN | Yes | `true` | — | Access log | Internal |
| `change_log_required` | BOOLEAN | Yes | `true` | — | Change log | Internal |
| `penalty_for_non_compliance` | TEXT | No | NULL | — | Penalties | Confidential |
| `max_penalty_amount` | DECIMAL(18,4) | No | NULL | ≥ 0 | Max penalty | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `applicable_countries` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Countries | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Audit Event (661) | One-to-Many | 1:N | Events under this policy |
| Audit Retention (665) | One-to-Many | 1:N | Retention configs |
| Compliance Report (668) | One-to-Many | 1:N | Reports |

### 6. Indexes
- UNIQUE (`policy_code`)
- INDEX (`compliance_type`, `status`)
- INDEX (`applicable_company_id`, `status`)
- GIN INDEX (`applicable_modules`)
- GIN INDEX (`applicable_countries`)

### 7. Security Classification
**Confidential** — penalties and data subject rights.

### 8. Integration Points
- **Audit Engine** (FS-5): Compliance tagging
- **Compliance Engine**: Regulatory reporting
- **All Business Modules**: Compliance adherence
- **Data Privacy Service**: GDPR rights

### 9. Sample Data
```json
{
  "policy_code": "CMP-GDPR-001", "policy_name": "GDPR Compliance Policy",
  "compliance_type": "GDPR", "regulatory_authority": "European Commission",
  "regulation_reference": "Regulation (EU) 2016/679",
  "applicable_modules": ["HR", "FINANCE", "PLATFORM"],
  "retention_period_years": 7, "retention_period_days": 2555,
  "reporting_frequency": "ON_DEMAND", "right_to_access": true,
  "right_to_erasure": true, "right_to_portability": true,
  "consent_required": true, "cross_border_transfer_restricted": true,
  "data_localization_required": false, "encryption_required": true,
  "audit_trail_required": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`COMPLIANCE_POLICY_CREATED`, `COMPLIANCE_POLICY_UPDATED`, `COMPLIANCE_POLICY_ACTIVATED`, `COMPLIANCE_POLICY_INACTIVATED`, `COMPLIANCE_VIOLATION_DETECTED`

---

## Entity 665 — Audit Retention

### 1. Business Purpose
Per Part 14 §7: Supports 1 Year, 3 Years, 5 Years, 7 Years, Permanent. Audit retention configuration.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `retention_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `retention_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `compliance_policy_id` | UUID | No | NULL | FK to `compliance_policy` (Entity 664) | Compliance link | Internal |
| `retention_category` | ENUM | Yes | — | ONE_YEAR, THREE_YEARS, FIVE_YEARS, SEVEN_YEARS, TEN_YEARS, PERMANENT | Category (per Part 14) | Internal |
| `retention_period_days` | INTEGER | Yes | `2555` | ≥ 365, or 0 for permanent | Days | Internal |
| `is_permanent` | BOOLEAN | Yes | `false` | — | Permanent (per Part 14) | Internal |
| `applicable_modules` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Modules | Internal |
| `applicable_entities` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Entities | Internal |
| `applicable_actions` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Actions | Internal |
| `applicable_classifications` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Classifications | Internal |
| `retention_trigger` | ENUM | Yes | `EVENT_TIMESTAMP` | EVENT_TIMESTAMP, CREATION_DATE, FISCAL_YEAR_END, CUSTOM | Trigger | Internal |
| `archive_after_days` | INTEGER | No | NULL | ≥ 30 | Archive tier transition | Internal |
| `archive_storage_tier` | ENUM | No | NULL | HOT, WARM, COLD, GLACIER | Tier | Internal |
| `disposal_method` | ENUM | Yes | `SECURE_DELETE` | SOFT_DELETE, SECURE_DELETE, CRYPTO_SHREDDING, PHYSICAL_DESTRUCTION | Method | Confidential |
| `legal_hold_overrides_disposal` | BOOLEAN | Yes | `true` | — | Hold prevents disposal | Internal |
| `disposal_approval_required` | BOOLEAN | Yes | `true` | — | Approval needed | Internal |
| `disposal_approver_role_id` | UUID | No | NULL | FK to `role_master` | Approver | Confidential |
| `periodic_review_years` | INTEGER | Yes | `1` | ≥ 1 | Review cycle | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `priority` | INTEGER | Yes | `100` | 1-999 | Resolution priority | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 666 — Digital Evidence

### 1. Business Purpose
Per Part 14 §7: Stores Documents, Screenshots, Photos, Videos, Attachments. Digital evidence repository for investigations.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `evidence_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `evidence_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `evidence_type` | ENUM | Yes | — | DOCUMENT, SCREENSHOT, PHOTO, VIDEO, AUDIO, EMAIL, CHAT_LOG, SYSTEM_LOG, DATABASE_SNAPSHOT, OTHER | Type (per Part 14) | Internal |
| `audit_event_id` | UUID | No | NULL | FK to `audit_event` (Entity 661) | Linked audit | Internal |
| `security_incident_id` | UUID | No | NULL | FK to `security_incident` (Entity 667) | Linked incident | Confidential |
| `compliance_report_id` | UUID | No | NULL | FK to `compliance_report` (Entity 668) | Linked report | Internal |
| `description` | TEXT | Yes | — | Min 20 | Description | Confidential |
| `document_master_id` | UUID | No | NULL | FK to `document_master` (Entity 651) | Linked document | Confidential |
| `file_attachment_id` | UUID | Yes | — | FK to `attachments` | File | Restricted |
| `file_format` | VARCHAR(20) | Yes | — | — | Format | Internal |
| `file_size_bytes` | BIGINT | Yes | — | > 0 | Size | Internal |
| `checksum_sha256` | VARCHAR(64) | Yes | — | SHA-256 | Checksum | Internal |
| `captured_at` | TIMESTAMPTZ | Yes | — | — | When evidence captured | Internal |
| `captured_by` | UUID | Yes | — | FK to `identity_master` | Capturer | Confidential |
| `capture_method` | ENUM | Yes | — | MANUAL_UPLOAD, SCREENSHOT, AUTOMATED_CAPTURE, SYSTEM_EXPORT, THIRD_PARTY | Method | Internal |
| `capture_source` | VARCHAR(200) | No | NULL | — | Source system | Internal |
| `chain_of_custody` | JSONB | Yes | `'[]'` | — | [{ timestamp, action, actor, notes }] | Restricted |
| `is_encrypted` | BOOLEAN | Yes | `true` | — | Encrypted | Internal |
| `encryption_key_id` | UUID | No | NULL | FK to `security_keys` | Key | Restricted |
| `is_hashed` | BOOLEAN | Yes | `true` | — | Hashed | Internal |
| `hash_algorithm` | VARCHAR(20) | Yes | `SHA-256` | — | Algorithm | Internal |
| `is_signed` | BOOLEAN | Yes | `false` | — | Digitally signed | Internal |
| `signature_id` | UUID | No | NULL | FK to `digital_signature` (Entity 655) | Signature | Confidential |
| `legal_hold` | BOOLEAN | Yes | `false` | — | Legal hold | Confidential |
| `legal_hold_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `legal_hold_until` | DATE | No | NULL | — | Until | Internal |
| `access_restricted` | BOOLEAN | Yes | `true` | — | Restricted access | Confidential |
| `authorized_viewers` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Authorized identities | Confidential |
| `retention_until` | DATE | Yes | — | — | Retention | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `current_status` | ENUM | Yes | `ACTIVE` | ACTIVE, ARCHIVED, DELETED, RELEASED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 667 — Security Incident

### 1. Business Purpose
Per Part 14 §7: Tracks Unauthorized Access, Data Modification, Privilege Escalation, Policy Violation. Security incident management.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `incident_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `incident_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `incident_type` | ENUM | Yes | — | UNAUTHORIZED_ACCESS, DATA_MODIFICATION, PRIVILEGE_ESCALATION, POLICY_VIOLATION, DATA_BREACH, MALWARE_DETECTION, INSIDER_THREAT, BRUTE_FORCE, PHISHING, CONFIGURATION_ERROR, OTHER | Type (per Part 14) | Restricted |
| `severity` | ENUM | Yes | — | LOW, MEDIUM, HIGH, CRITICAL, CATASTROPHIC | Severity | Restricted |
| `priority` | ENUM | Yes | — | LOW, MEDIUM, HIGH, URGENT, IMMEDIATE | Priority | Internal |
| `detection_method` | ENUM | Yes | — | AI_DETECTION, MANUAL_REPORT, AUTOMATED_ALERT, AUDIT_REVIEW, EXTERNAL_REPORT, USER_REPORT | Method | Internal |
| `detected_at` | TIMESTAMPTZ | Yes | `now()` | — | Detection time | Internal |
| `detected_by` | UUID | No | NULL | FK to `identity_master` | Detector | Confidential |
| `detected_by_system` | VARCHAR(100) | No | NULL | — | System | Internal |
| `started_at` | TIMESTAMPTZ | No | NULL | — | When incident started | Internal |
| `ended_at` | TIMESTAMPTZ | No | NULL | — | When incident ended | Internal |
| `duration_hours` | DECIMAL(7,2) | No | NULL | ≥ 0 | Duration | Internal |
| `description` | TEXT | Yes | — | Min 30 | Description | Restricted |
| `affected_identity_id` | UUID | No | NULL | FK to `identity_master` | Affected user | Confidential |
| `affected_entity_type` | VARCHAR(100) | No | NULL | — | Affected entity | Internal |
| `affected_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `affected_data_types` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | PII, PCI, PHI, etc. | Restricted |
| `data_records_affected_count` | INTEGER | Yes | `0` | ≥ 0 | Records | Restricted |
| `data_records_exposed_count` | INTEGER | Yes | `0` | ≥ 0 | Exposed | Restricted |
| `root_cause` | TEXT | No | NULL | — | Root cause | Restricted |
| `attack_vector` | VARCHAR(200) | No | NULL | — | Vector | Confidential |
| `vulnerability_exploited` | VARCHAR(200) | No | NULL | — | Vulnerability | Confidential |
| `containment_actions` | JSONB | Yes | `'[]'` | — | Actions taken | Confidential |
| `remediation_actions` | JSONB | Yes | `'[]'` | — | Fixes | Confidential |
| `preventive_actions` | JSONB | Yes | `'[]'` | — | Prevention | Confidential |
| `assigned_to_id` | UUID | No | NULL | FK to `identity_master` | Assigned investigator | Confidential |
| `assigned_at` | TIMESTAMPTZ | No | NULL | — | Assignment | Internal |
| `investigation_status` | ENUM | Yes | `OPEN` | OPEN, INVESTIGATING, CONTAINED, RESOLVED, CLOSED, FALSE_POSITIVE | Status | Internal |
| `investigation_notes` | TEXT | No | NULL | — | Notes | Restricted |
| `regulatory_reportable` | BOOLEAN | Yes | `false` | — | Must report | Confidential |
| `regulatory_reported` | BOOLEAN | Yes | `false` | — | Reported | Confidential |
| `regulatory_reported_at` | TIMESTAMPTZ | No | NULL | — | Time | Internal |
| `regulatory_authority_notified` | VARCHAR(200) | No | NULL | — | Authority | Confidential |
| `notification_required_to_users` | BOOLEAN | Yes | `false` | — | Must notify users | Confidential |
| `users_notified` | BOOLEAN | Yes | `false` | — | Notified | Internal |
| `users_notified_count` | INTEGER | Yes | `0` | ≥ 0 | Count | Internal |
| `financial_impact` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Impact | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `reputational_impact` | ENUM | Yes | `NONE` | NONE, LOW, MEDIUM, HIGH, SEVERE | Impact | Confidential |
| `operational_impact` | ENUM | Yes | `NONE` | NONE, LOW, MEDIUM, HIGH, SEVERE | Impact | Confidential |
| `evidence_ids` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Linked evidence | Confidential |
| `linked_audit_events_count` | INTEGER | Yes | `0` | ≥ 0 | Audit events | Internal |
| `post_mortem_completed` | BOOLEAN | Yes | `false` | — | Post-mortem | Internal |
| `post_mortem_document_id` | UUID | No | NULL | FK to `document_master` | Document | Confidential |
| `lessons_learned` | TEXT | No | NULL | — | Lessons | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `current_status` | ENUM | Yes | `OPEN` | OPEN, INVESTIGATING, CONTAINED, RESOLVED, CLOSED, FALSE_POSITIVE, ESCALATED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 668 — Compliance Report

### 1. Business Purpose
Per Part 14 §7: Measures Audit Coverage, Violations, Pending Reviews, Corrective Actions. Compliance reporting.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `report_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `report_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `compliance_policy_id` | UUID | Yes | — | FK to `compliance_policy` (Entity 664) | Compliance | Internal |
| `report_type` | ENUM | Yes | — | PERIODIC, INCIDENT_BASED, ON_DEMAND, REGULATORY_SUBMISSION, INTERNAL_REVIEW | Type | Internal |
| `reporting_period_start` | DATE | Yes | — | — | Period start | Internal |
| `reporting_period_end` | DATE | Yes | — | > start | Period end | Internal |
| `generated_at` | TIMESTAMPTZ | Yes | `now()` | — | Generation | Internal |
| `generated_by` | UUID | Yes | — | FK to `identity_master` | Generator | Confidential |
| `audit_coverage_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Audit Coverage (per Part 14) | Internal |
| `total_audit_events` | BIGINT | Yes | `0` | ≥ 0 | Events | Internal |
| `total_activities_logged` | BIGINT | Yes | `0` | ≥ 0 | Activities | Internal |
| `violations_count` | INTEGER | Yes | `0` | ≥ 0 | Violations (per Part 14) | Confidential |
| `violations_list` | JSONB | Yes | `'[]'` | — | List | Restricted |
| `policy_violations_count` | INTEGER | Yes | `0` | ≥ 0 | Policy | Confidential |
| `security_incidents_count` | INTEGER | Yes | `0` | ≥ 0 | Incidents | Confidential |
| `pending_reviews_count` | INTEGER | Yes | `0` | ≥ 0 | Pending Reviews (per Part 14) | Internal |
| `overdue_reviews_count` | INTEGER | Yes | `0` | ≥ 0 | Overdue | Internal |
| `corrective_actions_count` | INTEGER | Yes | `0` | ≥ 0 | Corrective Actions (per Part 14) | Internal |
| `corrective_actions_open` | INTEGER | Yes | `0` | ≥ 0 | Open | Internal |
| `corrective_actions_closed` | INTEGER | Yes | `0` | ≥ 0 | Closed | Internal |
| `corrective_actions_overdue` | INTEGER | Yes | `0` | ≥ 0 | Overdue | Internal |
| `compliance_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Score | Confidential |
| `compliance_status` | ENUM | Yes | `COMPLIANT` | COMPLIANT, PARTIALLY_COMPLIANT, NON_COMPLIANT, AT_RISK | Status | Confidential |
| `risk_assessment` | JSONB | No | NULL | — | Risk assessment | Confidential |
| `key_findings` | JSONB | Yes | `'[]'` | — | Findings | Confidential |
| `recommendations` | JSONB | Yes | `'[]'` | — | Recommendations | Confidential |
| `report_document_id` | UUID | Yes | — | FK to `document_master` | Generated PDF | Confidential |
| `submitted_to_authority` | BOOLEAN | Yes | `false` | — | Submitted | Internal |
| `submission_date` | DATE | No | NULL | — | Date | Internal |
| `submission_reference` | VARCHAR(100) | No | NULL | — | Reference | Confidential |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `current_status` | ENUM | Yes | `DRAFT` | DRAFT, GENERATED, REVIEWED, APPROVED, SUBMITTED, ARCHIVED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 669 — Audit Search

### 1. Business Purpose
Per Part 14 §7: Search By User, Module, Entity, Date, Action, Reference Number. Audit-specific search.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `search_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `searched_by` | UUID | Yes | — | FK to `identity_master` | Searcher | Confidential |
| `searched_at` | TIMESTAMPTZ | Yes | `now()` | — | Time | Internal |
| `search_query` | JSONB | Yes | `'{}'` | — | Query parameters | Confidential |
| `search_filters` | JSONB | Yes | `'{}'` | — | Applied filters | Confidential |
| `search_by_user` | UUID | No | NULL | FK to `identity_master` | User (per Part 14) | Confidential |
| `search_by_module` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Module (per Part 14) | Internal |
| `search_by_entity_type` | VARCHAR(100) | No | NULL | — | Entity type (per Part 14) | Internal |
| `search_by_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `search_by_date_from` | TIMESTAMPTZ | No | NULL | — | Date range start (per Part 14) | Internal |
| `search_by_date_to` | TIMESTAMPTZ | No | NULL | — | Date range end | Internal |
| `search_by_action` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Action (per Part 14) | Internal |
| `search_by_reference_number` | VARCHAR(100) | No | NULL | — | Reference Number (per Part 14) | Internal |
| `search_by_ip_address` | INET | No | NULL | — | IP | Confidential |
| `search_by_session_id` | UUID | No | NULL | — | Session | Confidential |
| `search_by_correlation_id` | UUID | No | NULL | — | Correlation | Internal |
| `search_by_compliance_type` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Compliance | Internal |
| `search_by_classification` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Classification | Confidential |
| `include_sensitive` | BOOLEAN | Yes | `false` | — | Include sensitive | Confidential |
| `results_count` | INTEGER | Yes | `0` | ≥ 0 | Results | Internal |
| `results_summary` | JSONB | Yes | `'{}'` | — | Summary | Confidential |
| `execution_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Execution | Internal |
| `export_requested` | BOOLEAN | Yes | `false` | — | Export | Internal |
| `export_format` | ENUM | No | NULL | PDF, XLSX, CSV, JSON | Format | Internal |
| `export_document_id` | UUID | No | NULL | FK to `document_master` | Export | Confidential |
| `purpose` | TEXT | No | NULL | — | Search purpose | Confidential |
| `investigation_reference` | VARCHAR(100) | No | NULL | — | Investigation | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PROCESSING, COMPLETED, FAILED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 670 — Audit Dashboard

### 1. Business Purpose
Per Part 14 §7: Displays Events Today, Security Incidents, Policy Violations, Retention Status, Audit Health. AI: Anomalies, Suspicious Activity, Policy Violations, Risk Patterns.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | COMPANY, ENTERPRISE | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `events_today_count` | BIGINT | Yes | `0` | ≥ 0 | Events Today (per Part 14) | Internal |
| `events_today_by_module` | JSONB | Yes | `'{}'` | — | By module | Internal |
| `events_today_by_action` | JSONB | Yes | `'{}'` | — | By action | Internal |
| `events_trend_7d` | JSONB | Yes | `'[]'` | — | 7-day trend | Internal |
| `events_trend_30d` | JSONB | Yes | `'[]'` | — | 30-day trend | Internal |
| `total_events_mtd` | BIGINT | Yes | `0` | ≥ 0 | MTD | Internal |
| `total_events_ytd` | BIGINT | Yes | `0` | ≥ 0 | YTD | Internal |
| `security_incidents_active_count` | INTEGER | Yes | `0` | ≥ 0 | Security Incidents (per Part 14) | Restricted |
| `security_incidents_by_severity` | JSONB | Yes | `'{}'` | — | By severity | Restricted |
| `security_incidents_list` | JSONB | Yes | `'[]'` | — | Active | Restricted |
| `policy_violations_today_count` | INTEGER | Yes | `0` | ≥ 0 | Policy Violations (per Part 14) | Confidential |
| `policy_violations_open_count` | INTEGER | Yes | `0` | ≥ 0 | Open | Confidential |
| `policy_violations_list` | JSONB | Yes | `'[]'` | — | List | Confidential |
| `retention_status` | JSONB | Yes | `'{}'` | — | Retention Status (per Part 14) | Internal |
| `records_pending_disposal_count` | BIGINT | Yes | `0` | ≥ 0 | Pending disposal | Internal |
| `records_disposed_today_count` | BIGINT | Yes | `0` | ≥ 0 | Disposed | Internal |
| `legal_hold_records_count` | BIGINT | Yes | `0` | ≥ 0 | On hold | Confidential |
| `audit_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Audit Health (per Part 14) | Confidential |
| `audit_health_components` | JSONB | Yes | `'{}'` | — | { coverage, completeness, accuracy, timeliness, retention_compliance } | Confidential |
| `compliance_score_avg` | DECIMAL(5,2) | Yes | `0` | 0-100 | Avg compliance | Confidential |
| `compliance_by_type` | JSONB | Yes | `'{}'` | — | By type | Confidential |
| `audit_storage_used_gb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Storage | Internal |
| `audit_storage_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `ai_anomalies_detected` | JSONB | No | NULL | — | AI: Anomalies (per Part 14 AI) | Restricted |
| `ai_suspicious_activity_detected` | JSONB | No | NULL | — | AI: Suspicious Activity (per Part 14 AI) | Restricted |
| `ai_policy_violations_detected` | JSONB | No | NULL | — | AI: Policy Violations (per Part 14 AI) | Restricted |
| `ai_risk_patterns_identified` | JSONB | No | NULL | — | AI: Risk Patterns (per Part 14 AI) | Restricted |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 8: Enterprise Search Engine, Global Search & Enterprise Indexing (Entities 671-680)

## Entity 671 — Search Index

### 1. Business Purpose
Per Part 14 §8: Indexes Products, Customers, Vendors, Employees, Assets, Documents, Invoices, Work Orders. Master search index.

### 2. Architectural Role
**Index entity** — the heart of the Search Engine (FS-48). Per Vol 0: "Users should not need to know where data is stored."

### 3. Business Rules
- Index types: DATABASE (live DB), DOCUMENT (file content), IMAGE (OCR text), OCR_TEXT, LOGS, CACHE
- Real-time indexing: incremental on data change (event-driven)
- Batch re-indexing: full rebuild option (scheduled)
- Permission-aware: search results filtered by user permissions (per Entity 677)
- Multi-language: supports multiple languages with stemming
- Synonym support: configurable synonyms
- Indexing frequency: real-time for critical, near-real-time for others

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `index_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `index_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `index_type` | ENUM | Yes | — | PRODUCTS, CUSTOMERS, VENDORS, EMPLOYEES, ASSETS, DOCUMENTS, INVOICES, WORK_ORDERS, PURCHASE_ORDERS, SALES_ORDERS, CONTRACTS, TICKETS, ALL | Type (per Part 14) | Internal |
| `business_module` | ENUM | Yes | — | INVENTORY, PROCUREMENT, WAREHOUSE, MANUFACTURING, RETAIL, RESTAURANT, FINANCE, HR, EAM, QUALITY, PLATFORM, ALL | Module | Internal |
| `data_source` | ENUM | Yes | — | DATABASE, DOCUMENT_STORE, OCR_TEXT, LOG_STORE, CACHE, EXTERNAL_API | Source | Internal |
| `indexing_strategy` | ENUM | Yes | `REAL_TIME` | REAL_TIME, NEAR_REAL_TIME, BATCH, SCHEDULED | Strategy | Internal |
| `indexing_frequency` | VARCHAR(50) | No | NULL | — | If scheduled | Internal |
| `indexed_fields` | JSONB | Yes | `'[]'` | — | [{ field, weight, type, searchable, filterable, sortable }] | Internal |
| `total_documents_indexed` | BIGINT | Yes | `0` | ≥ 0 | Documents | Internal |
| `index_size_mb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Size | Internal |
| `last_indexed_at` | TIMESTAMPTZ | No | NULL | — | Last index | Internal |
| `last_full_rebuild_at` | TIMESTAMPTZ | No | NULL | — | Last rebuild | Internal |
| `indexing_lag_seconds` | INTEGER | Yes | `0` | ≥ 0 | Lag | Internal |
| `index_health` | ENUM | Yes | `HEALTHY` | HEALTHY, DEGRADED, CORRUPTED, REBUILDING | Health | Internal |
| `index_health_score` | DECIMAL(5,2) | Yes | `100` | 0-100 | Score | Internal |
| `search_analyzer_config` | JSONB | Yes | `'{}'` | — | Analyzer | Internal |
| `language_analyzers` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Languages | Internal |
| `synonym_sets` | JSONB | No | NULL | — | Synonyms | Internal |
| `stop_words` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Stop words | Internal |
| `boosting_rules` | JSONB | No | NULL | — | Field boosting | Internal |
| `permission_filter_required` | BOOLEAN | Yes | `true` | — | Permission-aware | Internal |
| `fuzzy_search_enabled` | BOOLEAN | Yes | `true` | — | Fuzzy (per Part 14) | Internal |
| `fuzzy_max_edits` | INTEGER | Yes | `2` | 0-5 | Max edits | Internal |
| `ocr_indexing_enabled` | BOOLEAN | Yes | `false` | — | OCR (per Part 14) | Internal |
| `barcode_search_enabled` | BOOLEAN | Yes | `true` | — | Barcode search | Internal |
| `voice_search_ready` | BOOLEAN | Yes | `false` | — | Voice-ready (per Part 14) | Internal |
| `ai_semantic_search_ready` | BOOLEAN | Yes | `false` | — | AI semantic (per Part 14) | Internal |
| `embedding_model` | VARCHAR(100) | No | NULL | — | Embedding model | Internal |
| `embedding_dimensions` | INTEGER | No | NULL | > 0 | Dimensions | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `priority` | INTEGER | Yes | `100` | 1-999 | Priority | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, REBUILDING | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Enterprise Index (675) | Many-to-One | N:1 | Parent index |
| Search Query (672) | One-to-Many | 1:N | Queries |
| Search Permissions (677) | One-to-Many | 1:N | Permissions |

### 6. Indexes
- UNIQUE (`index_code`)
- INDEX (`index_type`, `status`)
- INDEX (`business_module`, `status`)
- INDEX (`index_health`)
- INDEX (`last_indexed_at`)

### 7. Security Classification
**Internal**

### 8. Integration Points
- **Search Engine** (FS-48): Primary consumer
- **Universal Identity Resolution Service** (FS-53, Q191): Identity searches
- **All Business Modules**: Data indexing
- **OCR Service**: OCR text indexing
- **AI/ML Service**: Semantic search

### 9. Sample Data
```json
{
  "index_code": "IDX-PRODUCTS", "index_name": "Products Master Index",
  "index_type": "PRODUCTS", "business_module": "INVENTORY",
  "data_source": "DATABASE", "indexing_strategy": "REAL_TIME",
  "total_documents_indexed": 15420, "index_size_mb": 250.50,
  "last_indexed_at": "2026-07-08T10:30:00Z", "indexing_lag_seconds": 5,
  "index_health": "HEALTHY", "index_health_score": 99.50,
  "permission_filter_required": true, "fuzzy_search_enabled": true,
  "fuzzy_max_edits": 2, "barcode_search_enabled": true,
  "ai_semantic_search_ready": true, "embedding_model": "all-MiniLM-L6-v2",
  "embedding_dimensions": 384, "status": "ACTIVE"
}
```

### 10. Audit Events
`SEARCH_INDEX_CREATED`, `SEARCH_INDEX_REBUILT`, `SEARCH_INDEX_UPDATED`, `SEARCH_INDEX_DEGRADED`, `SEARCH_INDEX_CORRUPTED`, `SEARCH_INDEX_REBUILD_STARTED`

---

## Entity 672 — Search Query

### 1. Business Purpose
Per Part 14 §8: Stores Keyword, Filters, Sorting, Pagination, User Context. User search queries.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `query_id` | VARCHAR(50) | Yes | — | Unique | Query ID | Internal |
| `searched_by` | UUID | Yes | — | FK to `identity_master` | User | Confidential |
| `searched_at` | TIMESTAMPTZ | Yes | `now()` | — | Time | Internal |
| `keyword` | TEXT | Yes | — | Min 1 | Keyword (per Part 14) | Confidential |
| `query_type` | ENUM | Yes | `KEYWORD` | KEYWORD, FILTERED, SEMANTIC, VOICE, BARCODE, ADVANCED, UNIVERSAL_LOOKUP | Type | Internal |
| `searched_indices` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Indices searched | Internal |
| `filters` | JSONB | Yes | `'{}'` | — | Filters (per Part 14) | Confidential |
| `sorting` | JSONB | Yes | `'[]'` | — | Sorting (per Part 14) | Internal |
| `pagination` | JSONB | Yes | `'{}'` | — | Pagination (per Part 14) — { page, page_size } | Internal |
| `user_context` | JSONB | Yes | `'{}'` | — | User Context (per Part 14) — { company, branch, role, permissions } | Confidential |
| `fuzzy_search_enabled` | BOOLEAN | Yes | `true` | — | Fuzzy | Internal |
| `semantic_search_enabled` | BOOLEAN | Yes | `false` | — | Semantic | Internal |
| `synonym_expansion_enabled` | BOOLEAN | Yes | `true` | — | Synonyms | Internal |
| `permission_filter_applied` | BOOLEAN | Yes | `true` | — | Permission filtered | Internal |
| `execution_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Execution | Internal |
| `results_count` | INTEGER | Yes | `0` | ≥ 0 | Results | Internal |
| `results_total_available` | INTEGER | Yes | `0` | ≥ 0 | Total available | Internal |
| `results_returned` | INTEGER | Yes | `0` | ≥ 0 | Returned | Internal |
| `clicked_result_id` | UUID | No | NULL | — | Clicked result | Internal |
| `clicked_position` | INTEGER | No | NULL | ≥ 1 | Position clicked | Internal |
| `was_satisfied` | BOOLEAN | No | NULL | — | User satisfied | Internal |
| `refined_query_id` | UUID | No | NULL | FK to `search_query` (self) | Refined query | Internal |
| `session_id` | UUID | No | NULL | FK to `session_management` | Session | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PROCESSING, COMPLETED, FAILED, CANCELLED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 673 — Search Result

### 1. Business Purpose
Per Part 14 §8: Displays Entity, Module, Reference, Relevance, Preview. Individual search results.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `search_query_id` | UUID | Yes | — | FK to `search_query` (Entity 672) | Source query | Internal |
| `result_position` | INTEGER | Yes | — | ≥ 1 | Position | Internal |
| `entity_type` | VARCHAR(100) | Yes | — | — | Entity (per Part 14) | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ID | Internal |
| `entity_code` | VARCHAR(100) | No | NULL | — | Reference (per Part 14) | Internal |
| `entity_name` | VARCHAR(500) | No | NULL | — | Display name | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module (per Part 14) | Internal |
| `relevance_score` | DECIMAL(5,2) | Yes | — | 0-100 | Relevance (per Part 14) | Internal |
| `relevance_factors` | JSONB | No | NULL | — | Score breakdown | Internal |
| `preview` | TEXT | No | NULL | — | Preview (per Part 14) — snippet | Internal |
| `highlighted_text` | TEXT | No | NULL | — | Highlighted matches | Internal |
| `thumbnail_url` | VARCHAR(500) | No | NULL | — | Thumbnail | Internal |
| `action_url` | VARCHAR(500) | Yes | — | — | Action URL | Internal |
| `quick_actions` | JSONB | Yes | `'[]'` | — | Quick actions | Internal |
| `metadata` | JSONB | Yes | `'{}'` | — | Additional metadata | Internal |
| `permission_validated` | BOOLEAN | Yes | `true` | — | Permission checked | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 674 — Saved Search

### 1. Business Purpose
Per Part 14 §8: Stores Personal Searches, Shared Searches, Pinned Searches. User saved searches.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `saved_search_code` | VARCHAR(50) | Yes | — | Unique per user | Code | Internal |
| `search_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `search_description` | TEXT | No | NULL | — | Description | Internal |
| `search_type` | ENUM | Yes | `PERSONAL` | PERSONAL (per Part 14), SHARED (per Part 14), PINNED (per Part 14), SYSTEM | Type | Internal |
| `owner_identity_id` | UUID | Yes | — | FK to `identity_master` | Owner | Confidential |
| `search_query_template` | JSONB | Yes | `'{}'` | — | Query template | Confidential |
| `default_filters` | JSONB | Yes | `'{}'` | — | Default filters | Confidential |
| `default_sorting` | JSONB | Yes | `'[]'` | — | Default sort | Internal |
| `notification_enabled` | BOOLEAN | Yes | `false` | — | Notify on new results | Internal |
| `notification_frequency` | ENUM | No | NULL | IMMEDIATE, DAILY, WEEKLY | Frequency | Internal |
| `last_executed_at` | TIMESTAMPTZ | No | NULL | — | Last run | Internal |
| `execution_count` | INTEGER | Yes | `0` | ≥ 0 | Total runs | Internal |
| `shared_with_identities` | UUID[] | No | `ARRAY[]::UUID[]` | — | Shared with | Confidential |
| `shared_with_roles` | UUID[] | No | `ARRAY[]::UUID[]` | — | Shared with roles | Confidential |
| `shared_with_departments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Shared with depts | Internal |
| `is_pinned` | BOOLEAN | Yes | `false` | — | Pinned | Internal |
| `pinned_position` | INTEGER | No | NULL | ≥ 1 | Position | Internal |
| `is_default` | BOOLEAN | Yes | `false` | — | User's default | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 675 — Enterprise Index

### 1. Business Purpose
Per Part 14 §8: Indexes Database, Documents, Images, PDF, OCR Text, Logs. Enterprise-wide index configuration.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `enterprise_index_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `enterprise_index_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `index_scope` | ENUM | Yes | `ENTERPRISE` | ENTERPRISE, COMPANY, BRANCH, DEPARTMENT | Scope | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `data_sources_indexed` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | DATABASE, DOCUMENTS, IMAGES, PDF, OCR_TEXT, LOGS (per Part 14) | Sources | Internal |
| `indexing_engine` | ENUM | Yes | `ELASTICSEARCH` | ELASTICSEARCH, OPENSEARCH, SOLR, ALGOLIA, POSTGRES_FTS, CUSTOM | Engine | Internal |
| `engine_version` | VARCHAR(20) | Yes | — | — | Version | Internal |
| `engine_endpoint` | VARCHAR(500) | Yes | — | — | Endpoint | Confidential |
| `engine_config_encrypted` | TEXT | No | NULL | — | Config | Restricted |
| `total_indices_count` | INTEGER | Yes | `0` | ≥ 0 | Indices | Internal |
| `total_documents_indexed` | BIGINT | Yes | `0` | ≥ 0 | Documents | Internal |
| `total_storage_used_gb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Storage | Internal |
| `storage_quota_gb` | DECIMAL(10,2) | Yes | `1000.00` | ≥ 1 | Quota | Confidential |
| `storage_utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Utilization | Internal |
| `indexing_throughput_per_second` | INTEGER | Yes | `0` | ≥ 0 | Throughput | Internal |
| `avg_query_latency_ms` | INTEGER | Yes | `0` | ≥ 0 | Latency | Internal |
| `queries_per_second` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | QPS | Internal |
| `indexing_lag_seconds` | INTEGER | Yes | `0` | ≥ 0 | Lag | Internal |
| `backup_enabled` | BOOLEAN | Yes | `true` | — | Backups | Internal |
| `backup_frequency_hours` | INTEGER | Yes | `24` | ≥ 1 | Frequency | Internal |
| `backup_retention_days` | INTEGER | Yes | `30` | ≥ 1 | Retention | Internal |
| `high_availability_enabled` | BOOLEAN | Yes | `true` | — | HA | Internal |
| `replication_factor` | INTEGER | Yes | `2` | ≥ 1 | Replicas | Internal |
| `disaster_recovery_enabled` | BOOLEAN | Yes | `true` | — | DR | Internal |
| `dr_target_endpoint` | VARCHAR(500) | No | NULL | — | DR target | Confidential |
| `encryption_at_rest` | BOOLEAN | Yes | `true` | — | Encryption | Internal |
| `encryption_in_transit` | BOOLEAN | Yes | `true` | — | TLS | Internal |
| `index_health_overall` | ENUM | Yes | `HEALTHY` | HEALTHY, DEGRADED, CRITICAL | Health | Internal |
| `last_health_check_at` | TIMESTAMPTZ | Yes | `now()` | — | Last check | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, MAINTENANCE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 676 — Search Analytics

### 1. Business Purpose
Per Part 14 §8: Measures Popular Searches, Failed Searches, Response Time, Click Rate. Search analytics.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | DAILY, WEEKLY, MONTHLY | Grain | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `total_queries_today` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `unique_searchers_today` | INTEGER | Yes | `0` | ≥ 0 | Unique users | Internal |
| `queries_per_second_avg` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | QPS | Internal |
| `queries_per_second_peak` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Peak QPS | Internal |
| `avg_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Response Time (per Part 14) | Internal |
| `p50_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | P50 | Internal |
| `p95_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | P95 | Internal |
| `p99_response_time_ms` | INTEGER | Yes | `0` | ≥ 0 | P99 | Internal |
| `popular_searches` | JSONB | Yes | `'[]'` | — | Popular Searches (per Part 14) — top keywords | Confidential |
| `popular_searches_by_module` | JSONB | Yes | `'{}'` | — | By module | Internal |
| `failed_searches_count` | INTEGER | Yes | `0` | ≥ 0 | Failed Searches (per Part 14) | Internal |
| `failed_searches_list` | JSONB | Yes | `'[]'` | — | List | Confidential |
| `zero_results_searches_count` | INTEGER | Yes | `0` | ≥ 0 | Zero results | Internal |
| `zero_results_searches_list` | JSONB | Yes | `'[]'` | — | List | Confidential |
| `click_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Click Rate (per Part 14) | Internal |
| `click_through_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | CTR | Internal |
| `avg_click_position` | DECIMAL(5,2) | Yes | `0` | ≥ 1 | Avg position | Internal |
| `search_satisfaction_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Satisfaction | Internal |
| `search_refinement_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Refined | Internal |
| `voice_searches_count` | INTEGER | Yes | `0` | ≥ 0 | Voice | Internal |
| `barcode_searches_count` | INTEGER | Yes | `0` | ≥ 0 | Barcode | Internal |
| `semantic_searches_count` | INTEGER | Yes | `0` | ≥ 0 | Semantic | Internal |
| `search_trend_30d` | JSONB | Yes | `'[]'` | — | 30-day trend | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI insights | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 677 — Search Permissions

### 1. Business Purpose
Per Part 14 §8: Filters Company, Branch, Department, Role, Record Ownership. Permission-aware search filtering.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `permission_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `permission_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `applicable_index_id` | UUID | No | NULL | FK to `search_index` (Entity 671) | Index | Internal |
| `applicable_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `applicable_entity_type` | VARCHAR(100) | No | NULL | — | Entity | Internal |
| `filter_type` | ENUM | Yes | — | COMPANY, BRANCH, DEPARTMENT, ROLE, RECORD_OWNERSHIP, CUSTOM_SCOPE | Filter (per Part 14) | Internal |
| `filter_rules` | JSONB | Yes | `'[]'` | — | Filter expressions | Confidential |
| `applicable_role_ids` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `data_scope_expression` | TEXT | No | NULL | — | SQL-like expression | Confidential |
| `column_restrictions` | JSONB | No | NULL | — | Hidden columns | Confidential |
| `row_level_filter` | TEXT | No | NULL | — | Row filter | Confidential |
| `ownership_field` | VARCHAR(100) | No | NULL | — | Owner field (e.g., `created_by`) | Internal |
| `inherit_from_parent` | BOOLEAN | Yes | `true` | — | Inherit | Internal |
| `override_allowed` | BOOLEAN | Yes | `false` | — | Override | Confidential |
| `override_authority_role_id` | UUID | No | NULL | FK to `role_master` | Override role | Confidential |
| `cache_filter_results` | BOOLEAN | Yes | `true` | — | Cache | Internal |
| `cache_ttl_seconds` | INTEGER | Yes | `300` | ≥ 0 | TTL | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 678 — Universal Lookup

### 1. Business Purpose
Per Part 14 §8: Supports Barcode, QR, RFID, Reference Number, Serial Number, Lot, Batch. Universal identifier lookup.

### 2. Architectural Role
This entity is the operational implementation of the **Universal Identity Resolution Service** (FS-53, Q191). It is the **single entry point** for all physical-to-digital identification.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `lookup_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `lookup_identifier` | VARCHAR(500) | Yes | — | — | Input identifier | Confidential |
| `identifier_type` | ENUM | Yes | — | BARCODE, QR, RFID (per Part 14), REFERENCE_NUMBER, SERIAL_NUMBER, LOT, BATCH, DOCUMENT_NUMBER, EMPLOYEE_ID, ASSET_CODE, PRODUCT_CODE, AUTO_DETECT | Type | Internal |
| `identifier_format` | VARCHAR(50) | No | NULL | — | Detected format | Internal |
| `auto_detected_type` | BOOLEAN | Yes | `false` | — | Auto-detected | Internal |
| `detection_confidence` | DECIMAL(5,2) | No | NULL | 0-100 | Confidence | Internal |
| `resolved_entity_type` | VARCHAR(100) | No | NULL | — | Resolved entity type | Internal |
| `resolved_entity_id` | UUID | No | NULL | — | Resolved entity ID | Internal |
| `resolved_entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `resolved_entity_name` | VARCHAR(500) | No | NULL | — | Display name | Internal |
| `resolved_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `resolution_status` | ENUM | Yes | `PENDING` | PENDING, RESOLVED, MULTIPLE_MATCHES, NOT_FOUND, INVALID_FORMAT, PERMISSION_DENIED | Status | Internal |
| `resolution_method` | ENUM | Yes | `EXACT_MATCH` | EXACT_MATCH, FUZZY_MATCH, PARTIAL_MATCH, SEMANTIC_MATCH | Method | Internal |
| `lookup_source` | ENUM | Yes | — | BARCODE_SCAN, QR_SCAN, RFID_READ, MANUAL_ENTRY, VOICE_INPUT, API_CALL, FILE_IMPORT, UNIVERSAL_SEARCH | Source | Internal |
| `lookup_by` | UUID | Yes | — | FK to `identity_master` | Looker | Confidential |
| `lookup_at` | TIMESTAMPTZ | Yes | `now()` | — | Time | Internal |
| `permission_validated` | BOOLEAN | Yes | `true` | — | Permission checked | Internal |
| `permission_denied_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `cache_hit` | BOOLEAN | Yes | `false` | — | From cache | Internal |
| `resolution_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Time | Internal |
| `multiple_matches_count` | INTEGER | Yes | `0` | ≥ 0 | If multiple | Internal |
| `multiple_matches_list` | JSONB | No | NULL | — | List | Internal |
| `business_action_triggered` | VARCHAR(100) | No | NULL | — | Action | Internal |
| `device_id` | UUID | No | NULL | FK to `device_registry` | Scanner device | Confidential |
| `location_id` | UUID | No | NULL | FK to `location_master` | Location | Internal |
| `ip_address` | INET | No | NULL | — | IP | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PROCESSING, COMPLETED, FAILED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Identity Master (601) | Many-to-One | N:1 | Looker |
| Device Registry (604) | Many-to-One | N:1 | Scanner |
| Location Master (607) | Many-to-One | N:1 | Location |

### 6. Indexes
- UNIQUE (`lookup_code`)
- INDEX (`lookup_identifier`, `identifier_type`)
- INDEX (`resolved_entity_type`, `resolved_entity_id`)
- INDEX (`lookup_by`, `lookup_at` DESC)
- INDEX (`resolution_status`)
- INDEX (`lookup_at`)

### 7. Security Classification
**Confidential** — identifiers may be sensitive.

### 8. Integration Points
- **Universal Identity Resolution Service** (FS-53, Q191): Primary consumer
- **Search Engine** (FS-48): Resolution
- **All Business Modules**: Universal lookup
- **Mobile App**: Scanner integration
- **Audit Engine** (FS-5): All lookups audited

### 9. Sample Data
```json
{
  "lookup_code": "UL-2026-07-00123456", "lookup_identifier": "BC-MIX-001",
  "identifier_type": "BARCODE", "identifier_format": "CODE_128",
  "auto_detected_type": true, "detection_confidence": 99.50,
  "resolved_entity_type": "asset_master", "resolved_entity_id": "asset-001",
  "resolved_entity_code": "MFG-MUM-L1-MIX-001", "resolved_entity_name": "Industrial Mixer - Line 1",
  "resolved_module": "EAM", "resolution_status": "RESOLVED",
  "resolution_method": "EXACT_MATCH", "lookup_source": "BARCODE_SCAN",
  "lookup_by": "id-100", "permission_validated": true,
  "cache_hit": true, "resolution_time_ms": 25,
  "device_id": "dev-scanner-001", "company_id": "cmp-001",
  "status": "COMPLETED"
}
```

### 10. Audit Events
`UNIVERSAL_LOOKUP_PERFORMED`, `UNIVERSAL_LOOKUP_RESOLVED`, `UNIVERSAL_LOOKUP_NOT_FOUND`, `UNIVERSAL_LOOKUP_MULTIPLE_MATCHES`, `UNIVERSAL_LOOKUP_PERMISSION_DENIED`

---

## Entity 679 — Semantic Search

### 1. Business Purpose
Per Part 14 §8: Supports Natural Language Queries, Context Awareness, Synonyms, Intent Recognition. AI-powered semantic search.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `semantic_search_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `user_query_natural_language` | TEXT | Yes | — | Min 3 | Natural Language Queries (per Part 14) | Confidential |
| `query_intent` | ENUM | Yes | — | SEARCH, COUNT, COMPARE, FILTER, SORT, AGGREGATE, EXPLAIN, RECOMMEND, OTHER | Intent | Internal |
| `intent_confidence` | DECIMAL(5,2) | Yes | `0` | 0-100 | Confidence | Internal |
| `extracted_entities` | JSONB | Yes | `'[]'` | — | Entities extracted | Internal |
| `extracted_filters` | JSONB | Yes | `'{}'` | — | Filters | Internal |
| `synonyms_expanded` | JSONB | Yes | `'[]'` | — | Synonyms (per Part 14) | Internal |
| `context_aware` | BOOLEAN | Yes | `true` | — | Context Awareness (per Part 14) | Internal |
| `user_context_applied` | JSONB | Yes | `'{}'` | — | Context | Confidential |
| `search_query_generated` | JSONB | Yes | `'{}'` | — | Generated query | Internal |
| `embedding_vector` | JSONB | No | NULL | — | Query embedding | Confidential |
| `embedding_model` | VARCHAR(100) | Yes | — | — | Model | Internal |
| `semantic_results_count` | INTEGER | Yes | `0` | ≥ 0 | Semantic results | Internal |
| `keyword_results_count` | INTEGER | Yes | `0` | ≥ 0 | Keyword results | Internal |
| `hybrid_results_count` | INTEGER | Yes | `0` | ≥ 0 | Hybrid | Internal |
| `results_blend_strategy` | ENUM | Yes | `HYBRID` | SEMANTIC_ONLY, KEYWORD_ONLY, HYBRID, WEIGHTED | Strategy | Internal |
| `semantic_weight_pct` | DECIMAL(5,2) | Yes | `70.00` | 0-100 | Weight | Internal |
| `keyword_weight_pct` | DECIMAL(5,2) | Yes | `30.00` | 0-100 | Weight | Internal |
| `execution_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Time | Internal |
| `model_version` | VARCHAR(20) | Yes | — | — | Model | Internal |
| `searched_by` | UUID | Yes | — | FK to `identity_master` | User | Confidential |
| `searched_at` | TIMESTAMPTZ | Yes | `now()` | — | Time | Internal |
| `user_feedback` | ENUM | No | NULL | POSITIVE, NEGATIVE, NEUTRAL | Feedback | Internal |
| `feedback_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | PROCESSING, COMPLETED, FAILED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 680 — Search Dashboard

### 1. Business Purpose
Per Part 14 §8: Displays Index Health, Query Volume, Search Speed, Top Results, Errors. AI: Natural Language Search, Document Understanding, Recommendation, Smart Ranking.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | COMPANY, ENTERPRISE | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `index_health_overall` | ENUM | Yes | `HEALTHY` | HEALTHY, DEGRADED, CRITICAL | Index Health (per Part 14) | Internal |
| `index_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Score | Internal |
| `indices_count` | INTEGER | Yes | `0` | ≥ 0 | Total indices | Internal |
| `indices_healthy_count` | INTEGER | Yes | `0` | ≥ 0 | Healthy | Internal |
| `indices_degraded_count` | INTEGER | Yes | `0` | ≥ 0 | Degraded | Internal |
| `indices_corrupted_count` | INTEGER | Yes | `0` | ≥ 0 | Corrupted | Internal |
| `total_documents_indexed` | BIGINT | Yes | `0` | ≥ 0 | Documents | Internal |
| `total_index_size_gb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Size | Internal |
| `query_volume_today` | BIGINT | Yes | `0` | ≥ 0 | Query Volume (per Part 14) today | Internal |
| `query_volume_mtd` | BIGINT | Yes | `0` | ≥ 0 | MTD | Internal |
| `query_volume_trend_30d` | JSONB | Yes | `'[]'` | — | Trend | Internal |
| `avg_search_speed_ms` | INTEGER | Yes | `0` | ≥ 0 | Search Speed (per Part 14) | Internal |
| `p95_search_speed_ms` | INTEGER | Yes | `0` | ≥ 0 | P95 | Internal |
| `p99_search_speed_ms` | INTEGER | Yes | `0` | ≥ 0 | P99 | Internal |
| `top_results_clicked` | JSONB | Yes | `'[]'` | — | Top Results (per Part 14) | Internal |
| `top_searches_today` | JSONB | Yes | `'[]'` | — | Top searches | Confidential |
| `zero_result_searches_count` | INTEGER | Yes | `0` | ≥ 0 | Zero results | Internal |
| `errors_count_today` | INTEGER | Yes | `0` | ≥ 0 | Errors (per Part 14) | Internal |
| `errors_list` | JSONB | Yes | `'[]'` | — | List | Confidential |
| `search_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success | Internal |
| `click_through_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | CTR | Internal |
| `search_satisfaction_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Satisfaction | Internal |
| `voice_searches_count` | INTEGER | Yes | `0` | ≥ 0 | Voice | Internal |
| `semantic_searches_count` | INTEGER | Yes | `0` | ≥ 0 | Semantic | Internal |
| `universal_lookups_count` | INTEGER | Yes | `0` | ≥ 0 | Lookups | Internal |
| `universal_lookups_by_type` | JSONB | Yes | `'{}'` | — | By type | Internal |
| `ai_natural_language_search` | JSONB | No | NULL | — | AI: NL Search (per Part 14 AI) | Confidential |
| `ai_document_understanding` | JSONB | No | NULL | — | AI: Document Understanding (per Part 14 AI) | Confidential |
| `ai_recommendation` | JSONB | No | NULL | — | AI: Recommendation (per Part 14 AI) | Confidential |
| `ai_smart_ranking` | JSONB | No | NULL | — | AI: Smart Ranking (per Part 14 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 9: Barcode, QR Code, RFID & Enterprise Label Printing Engine (Entities 681-690)

## Entity 681 — Barcode Master

### 1. Business Purpose
Per Part 14 §9: Supports EAN-13, EAN-8, UPC, Code 128, Code 39, GS1-128. Barcode master registry.

### 2. Architectural Role
Master entity — defines all barcodes in the system. Linked to products, assets, locations, documents.

### 3. Business Rules
- Barcode formats: EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, GS1-128, ITF-14, ISBN, ISSN
- GS1 compliance: barcodes follow GS1 standards for retail/warehouse
- One barcode = one entity (1:1 mapping) — no duplicates
- Barcode generation: auto-generated or externally assigned (e.g., GS1 company prefix)
- Validation: checksum validation per format
- Print-ready: barcodes can be rendered to images for printing

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `barcode_value` | VARCHAR(100) | Yes | — | Unique per company | Barcode value | Internal |
| `barcode_format` | ENUM | Yes | — | EAN_13, EAN_8, UPC_A, UPC_E, CODE_128, CODE_39, GS1_128, ITF_14, ISBN, ISSN, CUSTOM | Format (per Part 14) | Internal |
| `barcode_image_attachment_id` | UUID | No | NULL | FK to `attachments` | Rendered image | Internal |
| `barcode_text_below` | VARCHAR(100) | No | NULL | — | Human-readable | Internal |
| `gs1_company_prefix` | VARCHAR(20) | No | NULL | — | GS1 prefix | Confidential |
| `gs1_application_identifiers` | JSONB | No | NULL | — | GS1 AIs | Internal |
| `checksum_algorithm` | VARCHAR(20) | No | NULL | — | Algorithm | Internal |
| `checksum_valid` | BOOLEAN | Yes | `true` | — | Valid | Internal |
| `linked_entity_type` | VARCHAR(100) | Yes | — | — | Linked entity type | Internal |
| `linked_entity_id` | UUID | Yes | — | — | Linked entity ID | Internal |
| `linked_entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `linked_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `generation_method` | ENUM | Yes | — | AUTO_GENERATED, EXTERNALLY_ASSIGNED, GS1_ASSIGNED, MANUAL | Method | Internal |
| `generation_sequence` | BIGINT | No | NULL | — | Sequence (if auto) | Internal |
| `assigned_at` | TIMESTAMPTZ | Yes | `now()` | — | Assignment | Internal |
| `assigned_by` | UUID | Yes | — | FK to `identity_master` | Assigner | Confidential |
| `print_count` | BIGINT | Yes | `0` | ≥ 0 | Times printed | Internal |
| `scan_count` | BIGINT | Yes | `0` | ≥ 0 | Times scanned | Internal |
| `last_scanned_at` | TIMESTAMPTZ | No | NULL | — | Last scan | Internal |
| `last_scanned_by` | UUID | No | NULL | FK to `identity_master` | Scanner | Confidential |
| `last_scanned_location_id` | UUID | No | NULL | FK to `location_master` | Location | Internal |
| `is_active` | BOOLEAN | Yes | `true` | — | Active | Internal |
| `deactivated_at` | TIMESTAMPTZ | No | NULL | — | Deactivation | Internal |
| `deactivation_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, RETIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Identity Mapping (688) | One-to-One | 1:1 | Mapping |
| Print History (689) | One-to-Many | 1:N | Prints |

### 6. Indexes
- UNIQUE (`barcode_value`, `company_id`)
- INDEX (`barcode_format`, `status`)
- INDEX (`linked_entity_type`, `linked_entity_id`)
- INDEX (`gs1_company_prefix`)

### 7. Security Classification
**Internal** — GS1 prefix is **Confidential**.

### 8. Integration Points
- **Barcode Engine** (FS-12): Generation/rendering
- **Universal Identity Resolution Service** (FS-53, Q191): Resolution
- **All Business Modules**: Barcode assignment
- **Mobile App**: Scanning

### 9. Sample Data
```json
{
  "barcode_value": "8901234567890", "barcode_format": "EAN_13",
  "barcode_text_below": "8901234567890", "checksum_valid": true,
  "linked_entity_type": "product", "linked_entity_id": "prod-001",
  "linked_entity_code": "PROD-MIX-001", "linked_module": "INVENTORY",
  "generation_method": "GS1_ASSIGNED", "gs1_company_prefix": "8901234",
  "scan_count": 15420, "last_scanned_at": "2026-07-08T10:30:00Z",
  "company_id": "cmp-001", "status": "ACTIVE"
}
```

### 10. Audit Events
`BARCODE_GENERATED`, `BARCODE_ASSIGNED`, `BARCODE_SCANNED`, `BARCODE_PRINTED`, `BARCODE_DEACTIVATED`, `BARCODE_DUPLICATE_DETECTED`

---

## Entity 682 — QR Code Master

### 1. Business Purpose
Per Part 14 §9: Supports Asset QR, Product QR, Employee QR, Document QR, Location QR. QR code registry.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `qr_code_value` | VARCHAR(500) | Yes | — | Unique per company | QR value | Internal |
| `qr_code_payload` | JSONB | Yes | `'{}'` | — | Decoded payload | Internal |
| `qr_code_type` | ENUM | Yes | — | ASSET_QR, PRODUCT_QR, EMPLOYEE_QR, DOCUMENT_QR, LOCATION_QR, WORK_ORDER_QR, BATCH_QR, LOT_QR, PALLET_QR, URL_QR, CUSTOM | Type (per Part 14) | Internal |
| `qr_code_format` | ENUM | Yes | `QR_v2` | QR_v1, QR_v2, QR_v3, QR_v4, QR_v5, MICRO_QR, IQR, CUSTOM | Format | Internal |
| `error_correction_level` | ENUM | Yes | `M` | L (7%), M (15%), Q (25%), H (30%) | Error correction | Internal |
| `version` | INTEGER | Yes | — | 1-40 | QR version | Internal |
| `module_size_pixels` | INTEGER | Yes | `10` | ≥ 1 | Module size | Internal |
| `image_format` | ENUM | Yes | `PNG` | PNG, SVG, JPG, BMP | Image | Internal |
| `image_attachment_id` | UUID | No | NULL | FK to `attachments` | Rendered image | Internal |
| `logo_overlay_attachment_id` | UUID | No | NULL | FK to `attachments` | Logo overlay | Internal |
| `color_foreground` | VARCHAR(20) | Yes | `#000000` | — | Color | Internal |
| `color_background` | VARCHAR(20) | Yes | `#FFFFFF` | — | Color | Internal |
| `linked_entity_type` | VARCHAR(100) | Yes | — | — | Linked entity type | Internal |
| `linked_entity_id` | UUID | Yes | — | — | Linked entity ID | Internal |
| `linked_entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `linked_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `url_encoded` | VARCHAR(1000) | No | NULL | — | URL (if URL_QR) | Internal |
| `password_protected` | BOOLEAN | Yes | `false` | — | Password protected | Confidential |
| `password_hash` | VARCHAR(500) | No | NULL | — | Argon2id | Restricted |
| `expiry_at` | TIMESTAMPTZ | No | NULL | — | Expiry | Internal |
| `max_scans` | INTEGER | No | NULL | > 0 | Max scans | Internal |
| `scan_count` | BIGINT | Yes | `0` | ≥ 0 | Scans | Internal |
| `print_count` | BIGINT | Yes | `0` | ≥ 0 | Prints | Internal |
| `last_scanned_at` | TIMESTAMPTZ | No | NULL | — | Last scan | Internal |
| `last_scanned_by` | UUID | No | NULL | FK to `identity_master` | Scanner | Confidential |
| `last_scanned_location_id` | UUID | No | NULL | FK to `location_master` | Location | Internal |
| `last_scanned_device_id` | UUID | No | NULL | FK to `device_registry` | Device | Confidential |
| `is_active` | BOOLEAN | Yes | `true` | — | Active | Internal |
| `deactivated_at` | TIMESTAMPTZ | No | NULL | — | Deactivation | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, EXPIRED, RETIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 683 — RFID Tag

### 1. Business Purpose
Per Part 14 §9: Stores Tag ID, Frequency, Asset Mapping, Status. RFID tag registry.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `rfid_tag_id` | VARCHAR(100) | Yes | — | Unique per company | Tag ID (per Part 14) | Confidential |
| `rfid_electronic_product_code` | VARCHAR(100) | No | NULL | — | EPC | Confidential |
| `rfid_frequency` | ENUM | Yes | — | LF (125 kHz), HF (13.56 MHz), UHF (860-960 MHz) (per Part 14), MICROWAVE (2.45 GHz) | Frequency | Internal |
| `rfid_protocol` | ENUM | Yes | — | ISO_14443, ISO_15693, ISO_18000_6C, EPC_GEN2, NFC, CUSTOM | Protocol | Internal |
| `tag_type` | ENUM | Yes | — | PASSIVE, ACTIVE, SEMI_PASSIVE, BAP (Battery-Assisted Passive) | Type | Internal |
| `memory_size_bytes` | INTEGER | No | NULL | > 0 | Memory | Internal |
| `read_range_meters` | DECIMAL(5,2) | No | NULL | > 0 | Read range | Internal |
| `write_capable` | BOOLEAN | Yes | `false` | — | Writable | Internal |
| `battery_powered` | BOOLEAN | Yes | `false` | — | Battery | Internal |
| `battery_level_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Battery | Internal |
| `battery_expiry_date` | DATE | No | NULL | — | Expiry | Internal |
| `linked_entity_type` | VARCHAR(100) | Yes | — | — | Asset Mapping (per Part 14) — entity type | Internal |
| `linked_entity_id` | UUID | Yes | — | — | Entity ID | Internal |
| `linked_entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `linked_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `physical_location_on_entity` | VARCHAR(200) | No | NULL | — | Where attached | Internal |
| `attached_at` | TIMESTAMPTZ | Yes | `now()` | — | Attachment | Internal |
| `attached_by` | UUID | Yes | — | FK to `identity_master` | Attacher | Confidential |
| `read_count` | BIGINT | Yes | `0` | ≥ 0 | Reads | Internal |
| `last_read_at` | TIMESTAMPTZ | No | NULL | — | Last read | Internal |
| `last_read_reader_id` | UUID | No | NULL | FK to `device_registry` | Reader | Confidential |
| `last_read_location_id` | UUID | No | NULL | FK to `location_master` | Location | Internal |
| `last_read_rssi_dbm` | INTEGER | No | NULL | — | Signal strength | Internal |
| `is_active` | BOOLEAN | Yes | `true` | — | Active | Internal |
| `deactivated_at` | TIMESTAMPTZ | No | NULL | — | Deactivation | Internal |
| `deactivation_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, BATTERY_DEAD, RETIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 684 — Label Template

### 1. Business Purpose
Per Part 14 §9: Supports Product Label, Pallet Label, Shelf Label, Shipment Label, Asset Label, Employee ID. Label templates.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `template_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `template_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `label_type` | ENUM | Yes | — | PRODUCT_LABEL, PALLET_LABEL, SHELF_LABEL, SHIPMENT_LABEL, ASSET_LABEL, EMPLOYEE_ID, RECEIPT_LABEL, INVOICE_LABEL, BATCH_LABEL, CUSTOM | Type (per Part 14) | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `label_dimensions` | JSONB | Yes | `'{}'` | — | { width_mm, height_mm, shape } | Internal |
| `label_size` | ENUM | Yes | — | A4, A5, A6, A7, CUSTOM, THERMAL_4X6, THERMAL_3X2, THERMAL_2X1 | Size | Internal |
| `orientation` | ENUM | Yes | `PORTRAIT` | PORTRAIT, LANDSCAPE | Orientation | Internal |
| `layout_template` | TEXT | Yes | — | — | Layout (ZPL, HTML, SVG, or JSON) | Confidential |
| `layout_engine` | ENUM | Yes | `ZPL` | ZPL, HTML, SVG, BARTENDER, CUSTOM | Engine | Internal |
| `elements` | JSONB | Yes | `'[]'` | — | [{ type, position, size, content, dynamic_variable }] | Confidential |
| `barcode_element` | JSONB | No | NULL | — | Barcode config | Internal |
| `qr_code_element` | JSONB | No | NULL | — | QR config | Internal |
| `text_elements` | JSONB | Yes | `'[]'` | — | Text elements | Internal |
| `image_elements` | JSONB | Yes | `'[]'` | — | Image elements | Internal |
| `dynamic_variables` | JSONB | Yes | `'[]'` | — | Variables | Internal |
| `preview_attachment_id` | UUID | No | NULL | FK to `attachments` | Preview | Internal |
| `supported_printers` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Printer types | Internal |
| `paper_type` | ENUM | Yes | `STANDARD` | STANDARD, THERMAL, THERMAL_TRANSFER, GLOSSY, MATTE, SYNTHETIC | Paper | Internal |
| `color_printing` | BOOLEAN | Yes | `false` | — | Color | Internal |
| `double_sided` | BOOLEAN | Yes | `false` | — | Double-sided | Internal |
| `copies_default` | INTEGER | Yes | `1` | ≥ 1 | Default copies | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `label_template` (self) | Previous | Internal |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `usage_count` | BIGINT | Yes | `0` | ≥ 0 | Times used | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 685 — Label Print Queue

### 1. Business Purpose
Per Part 14 §9: Tracks Queued, Printing, Completed, Failed, Reprint. Print queue management.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `print_job_id` | VARCHAR(50) | Yes | — | Unique | Job ID | Internal |
| `template_id` | UUID | Yes | — | FK to `label_template` (Entity 684) | Template | Internal |
| `printer_id` | UUID | Yes | — | FK to `device_registry` (Entity 604, type=PRINTER) | Printer | Confidential |
| `printer_name` | VARCHAR(200) | No | NULL | — | Denormalized | Internal |
| `print_data` | JSONB | Yes | `'{}'` | — | Variable data | Confidential |
| `copies_requested` | INTEGER | Yes | `1` | ≥ 1 | Copies | Internal |
| `copies_printed` | INTEGER | Yes | `0` | ≥ 0 | Printed | Internal |
| `print_quality` | ENUM | Yes | `NORMAL` | DRAFT, NORMAL, HIGH, PHOTO | Quality | Internal |
| `print_speed` | ENUM | Yes | `NORMAL` | SLOW, NORMAL, FAST | Speed | Internal |
| `paper_source` | VARCHAR(50) | No | NULL | — | Tray | Internal |
| `color_mode` | ENUM | Yes | `MONOCHROME` | MONOCHROME, COLOR, GRAYSCALE | Mode | Internal |
| `duplex` | BOOLEAN | Yes | `false` | — | Double-sided | Internal |
| `queued_at` | TIMESTAMPTZ | Yes | `now()` | — | Queued (per Part 14) | Internal |
| `printing_started_at` | TIMESTAMPTZ | No | NULL | — | Printing (per Part 14) | Internal |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Completed (per Part 14) | Internal |
| `failed_at` | TIMESTAMPTZ | No | NULL | — | Failed | Internal |
| `reprint_count` | INTEGER | Yes | `0` | ≥ 0 | Reprints | Internal |
| `reprint_of_id` | UUID | No | NULL | FK to `label_print_queue` (self) | Original (if reprint) | Internal |
| `reprint_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `queued_by` | UUID | Yes | — | FK to `identity_master` | Queued by | Confidential |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT | Priority | Internal |
| `business_module` | VARCHAR(50) | No | NULL | — | Source module | Internal |
| `applicable_entity_type` | VARCHAR(100) | No | NULL | — | Entity type | Internal |
| `applicable_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `applicable_entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `error_message` | TEXT | No | NULL | — | Error | Confidential |
| `error_code` | VARCHAR(50) | No | NULL | — | Code | Internal |
| `print_duration_seconds` | INTEGER | No | NULL | ≥ 0 | Duration | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `current_status` | ENUM | Yes | `QUEUED` | QUEUED, PRINTING, COMPLETED, FAILED, CANCELLED, REPRINT_PENDING | Status (per Part 14) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 686 — Scan Transaction

### 1. Business Purpose
Per Part 14 §9: Stores Scanner, User, Location, Timestamp, Entity, Action. Scan transaction log.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `scan_id` | VARCHAR(50) | Yes | — | Unique | Scan ID | Internal |
| `scanner_device_id` | UUID | Yes | — | FK to `device_registry` (Entity 604) | Scanner (per Part 14) | Confidential |
| `scanner_device_type` | ENUM | Yes | — | HANDHELD_BARCODE, HANDHELD_QR, RFID_READER, MOBILE_APP_CAMERA, INDUSTRIAL_SCANNER, KIOSK_SCANNER, FIXED_SCANNER | Type | Internal |
| `scanned_by` | UUID | Yes | — | FK to `identity_master` | User (per Part 14) | Confidential |
| `scan_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Timestamp (per Part 14) | Internal |
| `scan_location_id` | UUID | No | NULL | FK to `location_master` | Location (per Part 14) | Internal |
| `scan_location_description` | VARCHAR(200) | No | NULL | — | Description | Internal |
| `scan_gps_coordinates` | JSONB | No | NULL | — | { lat, lon } | Confidential |
| `identifier_scanned` | VARCHAR(500) | Yes | — | — | Scanned value | Confidential |
| `identifier_type` | ENUM | Yes | — | BARCODE, QR_CODE, RFID_TAG, NFC_TAG, REFERENCE_NUMBER | Type | Internal |
| `resolved_entity_type` | VARCHAR(100) | No | NULL | — | Entity (per Part 14) | Internal |
| `resolved_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `resolved_entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `resolved_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `resolution_status` | ENUM | Yes | `PENDING` | PENDING, RESOLVED, NOT_FOUND, MULTIPLE_MATCHES, INVALID | Status | Internal |
| `business_action` | VARCHAR(100) | No | NULL | — | Action (per Part 14) | Internal |
| `business_action_triggered` | BOOLEAN | Yes | `false` | — | Action triggered | Internal |
| `workflow_instance_id` | UUID | No | NULL | FK to `workflow_instance` | Workflow triggered | Internal |
| `task_id` | UUID | No | NULL | FK to `task_queue` | Task triggered | Internal |
| `quantity_scanned` | DECIMAL(15,3) | No | NULL | > 0 | Qty (if applicable) | Internal |
| `unit_of_measure` | VARCHAR(20) | No | NULL | — | UoM | Internal |
| `batch_number` | VARCHAR(50) | No | NULL | — | Batch | Internal |
| `lot_number` | VARCHAR(50) | No | NULL | — | Lot | Internal |
| `serial_number` | VARCHAR(100) | No | NULL | — | Serial | Internal |
| `scan_result` | ENUM | Yes | `SUCCESS` | SUCCESS, FAILURE, PARTIAL | Result | Internal |
| `error_message` | TEXT | No | NULL | — | Error | Confidential |
| `scan_duration_ms` | INTEGER | Yes | `0` | ≥ 0 | Duration | Internal |
| `offline_scan` | BOOLEAN | Yes | `false` | — | Offline (per Part 14) | Internal |
| `synced_at` | TIMESTAMPTZ | No | NULL | — | Sync time | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 687 — Mobile Scanner

### 1. Business Purpose
Per Part 14 §9: Supports Android, iOS, Bluetooth Scanner, Camera Scanner, Industrial Scanner. Mobile scanner app configuration.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `scanner_config_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `scanner_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `platform` | ENUM | Yes | — | ANDROID, IOS, WINDOWS, CROSS_PLATFORM, BLUETOOTH_SCANNER, INDUSTRIAL_SCANNER, KIOSK_SCANNER | Platform (per Part 14) | Internal |
| `app_version` | VARCHAR(20) | Yes | — | — | App version | Internal |
| `device_id` | UUID | No | NULL | FK to `device_registry` (Entity 604) | Device | Confidential |
| `assigned_to_identity_id` | UUID | No | NULL | FK to `identity_master` | Assigned user | Confidential |
| `assigned_to_facility_id` | UUID | No | NULL | FK to `facilities` | Facility | Internal |
| `supported_scan_types` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | BARCODE, QR_CODE, RFID, NFC, OCR, DOCUMENT | Types | Internal |
| `supported_barcode_formats` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Formats | Internal |
| `camera_scanning_enabled` | BOOLEAN | Yes | `true` | — | Camera Scanner (per Part 14) | Internal |
| `bluetooth_scanner_paired` | BOOLEAN | Yes | `false` | — | Bluetooth Scanner (per Part 14) | Internal |
| `bluetooth_scanner_device_id` | UUID | No | NULL | FK to `device_registry` | BT scanner | Confidential |
| `rfid_reader_enabled` | BOOLEAN | Yes | `false` | — | RFID | Internal |
| `nfc_reader_enabled` | BOOLEAN | Yes | `false` | — | NFC | Internal |
| `offline_mode_enabled` | BOOLEAN | Yes | `true` | — | Offline Support (per Part 14) | Internal |
| `offline_queue_capacity` | INTEGER | Yes | `1000` | ≥ 1 | Capacity | Internal |
| `offline_sync_frequency_minutes` | INTEGER | Yes | `5` | ≥ 1 | Sync freq | Internal |
| `auto_sync_enabled` | BOOLEAN | Yes | `true` | — | Auto-sync | Internal |
| `haptic_feedback` | BOOLEAN | Yes | `true` | — | Haptic | Internal |
| `sound_feedback` | BOOLEAN | Yes | `true` | — | Sound | Internal |
| `vibration_feedback` | BOOLEAN | Yes | `true` | — | Vibration | Internal |
| `flashlight_control` | BOOLEAN | Yes | `true` | — | Flashlight | Internal |
| `zoom_control` | BOOLEAN | Yes | `true` | — | Zoom | Internal |
| `batch_scan_mode` | BOOLEAN | Yes | `true` | — | Batch | Internal |
| `continuous_scan_mode` | BOOLEAN | Yes | `false` | — | Continuous | Internal |
| `scan_interval_seconds` | DECIMAL(5,2) | Yes | `1.00` | > 0 | Interval | Internal |
| `auto_submit_after_scan` | BOOLEAN | Yes | `false` | — | Auto-submit | Internal |
| `default_business_module` | VARCHAR(50) | No | NULL | — | Default module | Internal |
| `default_business_action` | VARCHAR(100) | No | NULL | — | Default action | Internal |
| `print_capability` | BOOLEAN | Yes | `false` | — | Can print | Internal |
| `paired_printers` | UUID[] | No | `ARRAY[]::UUID[]` | — | Printers | Confidential |
| `last_synced_at` | TIMESTAMPTZ | No | NULL | — | Last sync | Internal |
| `pending_offline_scans_count` | INTEGER | Yes | `0` | ≥ 0 | Pending | Internal |
| `total_scans_count` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 688 — Identity Mapping

### 1. Business Purpose
Per Part 14 §9: Maps Barcode, QR, RFID, Entity ID, Reference. Universal identity mapping.

### 2. Architectural Role
Mapping entity — the implementation backbone of the Universal Identity Resolution Service (FS-53, Q191). Maps all identifier types to canonical entities.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `mapping_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `identifier_type` | ENUM | Yes | — | BARCODE, QR, RFID (per Part 14), REFERENCE_NUMBER, SERIAL_NUMBER, LOT, BATCH, DOCUMENT_NUMBER, EMPLOYEE_ID, ASSET_CODE, PRODUCT_CODE | Type | Internal |
| `identifier_value` | VARCHAR(500) | Yes | — | — | Identifier | Confidential |
| `canonical_entity_type` | VARCHAR(100) | Yes | — | — | Entity ID (per Part 14) — type | Internal |
| `canonical_entity_id` | UUID | Yes | — | — | Entity ID | Internal |
| `canonical_entity_code` | VARCHAR(100) | No | NULL | — | Reference (per Part 14) | Internal |
| `canonical_entity_name` | VARCHAR(500) | No | NULL | — | Display name | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `mapping_source` | ENUM | Yes | — | AUTO_GENERATED, MANUAL, IMPORTED, EXTERNAL_SYSTEM, LEGACY_MIGRATION | Source | Internal |
| `mapping_confidence` | DECIMAL(5,2) | Yes | `100.00` | 0-100 | Confidence | Internal |
| `is_primary_identifier` | BOOLEAN | Yes | `false` | — | Primary for entity | Internal |
| `alternative_identifiers` | JSONB | Yes | `'[]'` | — | Other identifiers for same entity | Internal |
| `mapping_validated` | BOOLEAN | Yes | `true` | — | Validated | Internal |
| `validated_at` | TIMESTAMPTZ | No | NULL | — | Validation | Internal |
| `validated_by` | UUID | No | NULL | FK to `identity_master` | Validator | Confidential |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `effective_to` | TIMESTAMPTZ | No | NULL | > effective_from | Effective to | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, EXPIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Barcode Master (681) | One-to-One | 1:1 | If BARCODE |
| QR Code Master (682) | One-to-One | 1:1 | If QR |
| RFID Tag (683) | One-to-One | 1:1 | If RFID |

### 6. Indexes
- UNIQUE (`mapping_code`)
- UNIQUE (`identifier_type`, `identifier_value`, `company_id`)
- INDEX (`canonical_entity_type`, `canonical_entity_id`)
- INDEX (`business_module`)

### 7. Security Classification
**Confidential**

### 8. Integration Points
- **Universal Identity Resolution Service** (FS-53, Q191): Primary consumer
- **Barcode Engine** (FS-12): Mapping registration
- **Search Engine** (FS-48): Resolution
- **All Business Modules**: Identity resolution

### 9. Sample Data
```json
{
  "mapping_code": "IM-2026-00123456", "identifier_type": "BARCODE",
  "identifier_value": "8901234567890", "canonical_entity_type": "product",
  "canonical_entity_id": "prod-001", "canonical_entity_code": "PROD-MIX-001",
  "canonical_entity_name": "Industrial Mixer 2000L", "business_module": "INVENTORY",
  "mapping_source": "AUTO_GENERATED", "mapping_confidence": 100.00,
  "is_primary_identifier": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`IDENTITY_MAPPING_CREATED`, `IDENTITY_MAPPING_UPDATED`, `IDENTITY_MAPPING_EXPIRED`, `IDENTITY_MAPPING_VALIDATED`

---

## Entity 689 — Print History

### 1. Business Purpose
Per Part 14 §9: Tracks Printed By, Printer, Copies, Reprints, Status. Print audit trail.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `print_history_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `print_job_id` | UUID | Yes | — | FK to `label_print_queue` (Entity 685) | Print job | Internal |
| `template_id` | UUID | Yes | — | FK to `label_template` (Entity 684) | Template | Internal |
| `printer_device_id` | UUID | Yes | — | FK to `device_registry` | Printer (per Part 14) | Confidential |
| `printer_name` | VARCHAR(200) | Yes | — | — | Denormalized | Internal |
| `printed_by` | UUID | Yes | — | FK to `identity_master` | Printed By (per Part 14) | Confidential |
| `printed_by_name` | VARCHAR(200) | Yes | — | — | Denormalized | Internal |
| `printed_at` | TIMESTAMPTZ | Yes | `now()` | — | Time | Internal |
| `copies_printed` | INTEGER | Yes | `1` | ≥ 1 | Copies (per Part 14) | Internal |
| `is_reprint` | BOOLEAN | Yes | `false` | — | Reprint | Internal |
| `reprint_count` | INTEGER | Yes | `0` | ≥ 0 | Reprints (per Part 14) | Internal |
| `original_print_id` | UUID | No | NULL | FK to `print_history` (self) | Original | Internal |
| `reprint_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `business_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `applicable_entity_type` | VARCHAR(100) | No | NULL | — | Entity type | Internal |
| `applicable_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `applicable_entity_code` | VARCHAR(100) | No | NULL | — | Display code | Internal |
| `label_preview_attachment_id` | UUID | No | NULL | FK to `attachments` | Preview | Internal |
| `print_data_snapshot` | JSONB | Yes | `'{}'` | — | Data printed | Confidential |
| `print_duration_seconds` | INTEGER | Yes | `0` | ≥ 0 | Duration | Internal |
| `print_quality` | ENUM | Yes | `NORMAL` | DRAFT, NORMAL, HIGH, PHOTO | Quality | Internal |
| `paper_used_count` | INTEGER | Yes | `0` | ≥ 0 | Paper used | Internal |
| `toner_ink_used_ml` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Ink | Internal |
| `cost_incurred` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `print_result` | ENUM | Yes | `SUCCESS` | SUCCESS, PARTIAL, FAILED | Result (per Part 14) | Internal |
| `error_message` | TEXT | No | NULL | — | Error | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 690 — Identification Dashboard

### 1. Business Purpose
Per Part 14 §9: Displays Labels Printed, Scans Today, RFID Reads, Failed Prints, Scanner Status. AI: Duplicate Barcode Detection, Scan Error Analysis, Label Optimization, Print Forecast.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | FACILITY, COMPANY | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `labels_printed_today` | INTEGER | Yes | `0` | ≥ 0 | Labels Printed (per Part 14) today | Internal |
| `labels_printed_mtd` | BIGINT | Yes | `0` | ≥ 0 | MTD | Internal |
| `labels_printed_by_type` | JSONB | Yes | `'{}'` | — | By type | Internal |
| `labels_printed_trend_30d` | JSONB | Yes | `'[]'` | — | Trend | Internal |
| `scans_today_count` | BIGINT | Yes | `0` | ≥ 0 | Scans Today (per Part 14) | Internal |
| `scans_by_type` | JSONB | Yes | `'{}'` | — | By type (BARCODE/QR/RFID) | Internal |
| `scans_by_module` | JSONB | Yes | `'{}'` | — | By module | Internal |
| `scans_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success rate | Internal |
| `scans_failed_count` | INTEGER | Yes | `0` | ≥ 0 | Failed | Internal |
| `rfid_reads_today_count` | BIGINT | Yes | `0` | ≥ 0 | RFID Reads (per Part 14) | Internal |
| `rfid_active_tags_count` | BIGINT | Yes | `0` | ≥ 0 | Active tags | Internal |
| `rfid_battery_low_tags_count` | INTEGER | Yes | `0` | ≥ 0 | Low battery | Internal |
| `failed_prints_today_count` | INTEGER | Yes | `0` | ≥ 0 | Failed Prints (per Part 14) | Internal |
| `failed_prints_list` | JSONB | Yes | `'[]'` | — | List | Confidential |
| `print_queue_pending_count` | INTEGER | Yes | `0` | ≥ 0 | Pending | Internal |
| `print_queue_processing_count` | INTEGER | Yes | `0` | ≥ 0 | Processing | Internal |
| `scanner_status` | JSONB | Yes | `'[]'` | — | Scanner Status (per Part 14) — per-scanner | Confidential |
| `active_scanners_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `offline_scanners_count` | INTEGER | Yes | `0` | ≥ 0 | Offline | Internal |
| `total_barcodes_registered` | BIGINT | Yes | `0` | ≥ 0 | Barcodes | Internal |
| `total_qr_codes_registered` | BIGINT | Yes | `0` | ≥ 0 | QR codes | Internal |
| `total_rfid_tags_registered` | BIGINT | Yes | `0` | ≥ 0 | RFID tags | Internal |
| `total_identity_mappings` | BIGINT | Yes | `0` | ≥ 0 | Mappings | Internal |
| `universal_lookups_today_count` | BIGINT | Yes | `0` | ≥ 0 | Lookups | Internal |
| `universal_lookups_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success | Internal |
| `print_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `ai_duplicate_barcode_detection` | JSONB | No | NULL | — | AI: Duplicate Barcode Detection (per Part 14 AI) | Confidential |
| `ai_scan_error_analysis` | JSONB | No | NULL | — | AI: Scan Error Analysis (per Part 14 AI) | Confidential |
| `ai_label_optimization` | JSONB | No | NULL | — | AI: Label Optimization (per Part 14 AI) | Confidential |
| `ai_print_forecast` | JSONB | No | NULL | — | AI: Print Forecast (per Part 14 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# Part 14 Batch 3 Completion Summary

**All 30 Audit, Search & Identification entities are now defined** at full enterprise-grade depth.

## Architectural Decisions Locked (Part 14 Batch 3)

1. **Universal Identity Resolution Service (Q191, FS-53)** — NEW — Single entry point for all physical-to-digital identification
2. **Enterprise Audit Engine** — Immutable, tamper-evident, hash-chained audit trail
3. **Activity Logs** — User activity tracking derived from audit events
4. **Change History** — Field-level before/after tracking with approval references
5. **Compliance Policy** — Multi-regulation (ISO/FSSAI/HACCP/GMP/SOX/GDPR) framework
6. **Audit Retention** — 1/3/5/7/10 years or permanent with legal hold
7. **Digital Evidence** — Chain-of-custody tracked, encrypted, hash-verified
8. **Security Incident** — Full incident lifecycle with regulatory reporting
9. **Compliance Report** — Audit coverage, violations, corrective actions
10. **Audit Search** — Multi-dimensional audit query with export
11. **Enterprise Search Engine** — Permission-aware, fuzzy, OCR-indexed, semantic-ready
12. **Search Index** — Per-module indices with real-time indexing
13. **Universal Lookup** — Single entry point for all identifier types
14. **Semantic Search** — AI-powered natural language with intent recognition
15. **Search Permissions** — Company/Branch/Department/Role/Ownership filtering
16. **Saved Searches** — Personal, shared, pinned with notifications
17. **Barcode Engine** — GS1-compliant, multi-format (EAN/UPC/Code 128/GS1-128)
18. **QR Code Engine** — Multi-type with error correction and password protection
19. **RFID Engine** — LF/HF/UHF with active/passive/semi-passive support
20. **Label Printing** — Template-driven with ZPL/HTML/SVG support
21. **Mobile Scanning** — Android/iOS/Bluetooth/Industrial with offline support
22. **Identity Mapping** — Universal identifier-to-entity mapping
23. **AI Capabilities** — 12 AI capabilities across the three sections

## New Foundation Service Locked

### Universal Identity Resolution Service — Foundation Service #53

| Attribute | Value |
|---|---|
| Service ID | FS-53 |
| Architectural Decision | Q191 |
| Status | LOCKED |
| Owner | Enterprise Architect (Platform Kernel team) |
| Position | **ABOVE** Barcode, QR, RFID, and Search engines |
| Consumers | All business modules via `IdentityResolutionService.resolve(identifier)` |
| Capabilities | One lookup API, consistent behavior, simplified scanner dev, faster hardware integration, centralized caching, centralized audit |
| Design Principle | Single entry point for all physical-to-digital identification |

## 12 AI Capabilities Locked (Batch 3)

| Section | AI Capabilities |
|---|---|
| Audit | Anomalies, Suspicious Activity, Policy Violations, Risk Patterns |
| Search | Natural Language Search, Document Understanding, Recommendation, Smart Ranking |
| Identification | Duplicate Barcode Detection, Scan Error Analysis, Label Optimization, Print Forecast |

## Part 14 Progress Tracker

| Batch | Sections | Entities | Status |
|---|---|---|---|
| Batch 1 | 1-3 (Identity, RBAC, Configuration) | 601-630 | ✅ COMPLETE |
| Batch 2 | 4-6 (Workflow, Notification, Document) | 631-660 | ✅ COMPLETE |
| **Batch 3** | **7-9 (Audit, Search, Identification)** | **661-690** | **✅ COMPLETE (LOCKED)** |
| Batch 4 (Final) | 10-12 (API Gateway, Event Bus, Reporting) | 691-720 | ⏳ PENDING |

## Cumulative Status

- **Manual 1 cumulative**: 695 entities (Parts 1-14 Batch 3)
- **Foundation Services**: 53 (FS-1 through FS-53) + Platform Kernel (Q189) as meta-architecture
- **Architectural Decisions**: 191 (Q1-Q191)

---

*End of Manual 1 Part 14 Sections 7-9. Next batch: Part 14 Batch 4 (Final) — Sections 10-12 (API Gateway, Integration Framework & External Connectors; Event Bus, Message Queue, Scheduler & Background Jobs; Reporting Engine, Print Engine, BI Services & Platform Mission Control).*

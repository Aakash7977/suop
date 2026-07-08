# Manual 1 · Part 14 · Sections 4-6 · Entities 631-660 — Workflow, Notification & Document Management

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 14 — Enterprise Platform Services (EPS) |
| Sections | 4 (Enterprise Workflow Engine & Business Process Automation), 5 (Enterprise Notification Engine, Communication Hub & Alerts), 6 (Enterprise Document Management, File Storage & Digital Records) |
| Entities | 631–660 |
| Version | 1.0.0 |
| Status | ACTIVE — LOCKED |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 8-9, Part 14 §4-6 |
| Last Updated | 2026-07-08 |
| Importance | **CRITICAL — Core automation layer used by every SUOP module** |

---

## Overview — Core Automation Layer

Sections 4-6 define the **core automation layer** of SUOP — services used by **every single module**: Inventory, Warehouse, Manufacturing, Retail, Restaurant, Finance, HR, Maintenance, CRM, Supplier Portal, Customer Portal, and all future modules.

```
WORKFLOW ENGINE (Sec 4: 631-640)
  Business Event → Workflow Definition → Step → Approval Matrix → Task Queue → SLA → Escalation → Delegation → Audit
  ↓ Triggers
NOTIFICATION ENGINE (Sec 5: 641-650)
  Business Event → Template → Channel (Email/SMS/Push/WhatsApp/Slack/Teams) → Delivery → Acknowledgement → History
  ↓ Generates
DOCUMENT MANAGEMENT (Sec 6: 651-660)
  Business Module → Document Engine → Metadata → Version Control → Storage → Access Control → Search → Audit
```

### 🏆 Architectural Lock: Unified Enterprise Automation Engine (Q190)

Per Chief Enterprise Architect recommendation, the **Unified Enterprise Automation Engine** is hereby locked as **Architectural Decision Q190** and **Foundation Service #52**. This engine sits **above** the Workflow, Notification, and Document Engines, providing one standardized event pipeline across the entire ERP.

**Problem Solved**: Instead of every module triggering workflows, notifications, and documents independently (leading to duplication and inconsistency), all business events first pass through this Automation Engine.

**Locked Architecture**:
```
Business Event
        │
        ▼
Enterprise Automation Engine (FS-52, Q190)
        │
────────┼────────
│       │       │
Workflow Notification Document
Engine   Engine    Engine
│       │       │
Tasks   Alerts   Records
│       │       │
Audit & Analytics
```

**Architectural Benefits (Locked)**:
1. **One standardized event pipeline** across the ERP
2. **Easier maintenance and debugging** — single place to inspect event flow
3. **Consistent workflow execution** — no per-module reinvention
4. **Centralized notification routing** — uniform channel selection
5. **Automatic document generation** — invoices, work orders, payslips auto-generated from events
6. **Better monitoring, retry handling, and observability** — uniform retry and tracing
7. **Common in modern enterprise platforms** — proven architectural pattern

**Event Routing Logic**:
- Each business event declares what it needs: WORKFLOW (approval chain), NOTIFICATION (alerts), DOCUMENT (generation), or any combination
- The Automation Engine fans out to the appropriate sub-engines
- All sub-engine results aggregate back for unified audit and observability
- Failed sub-tasks trigger unified retry logic

**Governance**: The Automation Engine is owned by the Platform Kernel team (per Q189). Business modules emit events; they do not directly invoke Workflow/Notification/Document engines.

---

# SECTION 4: Enterprise Workflow Engine & Business Process Automation (Entities 631-640)

## Entity 631 — Workflow Definition

### 1. Business Purpose
Per Part 14 §4: Stores Workflow Name, Module, Version, Status, Trigger Event. Master definition of all business processes.

### 2. Architectural Role
**Configuration master entity** — the heart of the Workflow Engine (FS-3). Per Vol 0: "No hardcoded workflows." Every approval, review, and business process is configurable here.

### 3. Business Rules
- Workflows are versioned — published versions immutable; new versions supersedes
- Trigger events: BUSINESS_EVENT (event bus), SCHEDULED (cron), MANUAL (user-initiated), API (external trigger)
- Workflow types: SEQUENTIAL (linear), PARALLEL (concurrent), DYNAMIC (rule-based branching), AD_HOC (user-built)
- Drag-and-drop designer: visual BPMN-compatible designer for business users
- Workflow templates: pre-built per industry vertical
- Effective period: workflows have effective_from/to dates

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workflow_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `workflow_name` | VARCHAR(200) | Yes | — | Min 3 | Name (per Part 14) | Internal |
| `workflow_description` | TEXT | No | NULL | — | Description | Internal |
| `business_module` | ENUM | Yes | — | INVENTORY, PROCUREMENT, WAREHOUSE, MANUFACTURING, RETAIL, RESTAURANT, FINANCE, HR, EAM, QUALITY, PLATFORM, ALL | Module (per Part 14) | Internal |
| `workflow_type` | ENUM | Yes | `SEQUENTIAL` | SEQUENTIAL, PARALLEL, DYNAMIC, AD_HOC, HYBRID | Type | Internal |
| `trigger_event` | VARCHAR(200) | Yes | — | — | Trigger Event (per Part 14) — event name | Internal |
| `trigger_type` | ENUM | Yes | `BUSINESS_EVENT` | BUSINESS_EVENT, SCHEDULED, MANUAL, API, ESCALATION, SYSTEM | Trigger | Internal |
| `trigger_condition` | JSONB | No | NULL | — | Conditions to fire | Confidential |
| `applicable_entity` | VARCHAR(100) | Yes | — | — | Entity (e.g., `purchase_order`) | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `applicable_branch_id` | UUID | No | NULL | FK to `branch_master` | NULL = all | Internal |
| `applicable_role_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `priority` | INTEGER | Yes | `100` | 1-999 | Resolution priority | Internal |
| `max_duration_hours` | DECIMAL(7,2) | Yes | `720` | > 0 | Max time (30 days default) | Internal |
| `auto_cancel_on_expiry` | BOOLEAN | Yes | `false` | — | Auto-cancel | Internal |
| `enable_delegation` | BOOLEAN | Yes | `true` | — | Delegation allowed | Internal |
| `enable_parallel_branches` | BOOLEAN | Yes | `false` | — | Parallel branches | Internal |
| `enable_dynamic_routing` | BOOLEAN | Yes | `false` | — | Dynamic routing | Internal |
| `bpmn_xml` | TEXT | No | NULL | — | BPMN 2.0 XML definition | Confidential |
| `visual_designer_json` | JSONB | No | NULL | — | Visual designer state | Confidential |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version (per Part 14) | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `workflow_definition` (self) | Previous | Internal |
| `tested_in_sandbox` | BOOLEAN | Yes | `false` | — | Sandbox tested | Internal |
| `sandbox_test_results` | JSONB | No | NULL | — | Test results | Internal |
| `published_by` | UUID | No | NULL | FK to `identity_master` | Publisher | Confidential |
| `published_at` | TIMESTAMPTZ | No | NULL | — | Publish time | Internal |
| `active_instances_count` | INTEGER | Yes | `0` | ≥ 0 | Currently running | Internal |
| `total_instances_count` | BIGINT | Yes | `0` | ≥ 0 | Total ever | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, TESTING, PUBLISHED, ACTIVE, INACTIVE, DEPRECATED | Status (per Part 14) | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workflow Step (632) | One-to-Many | 1:N | Steps |
| Workflow Instance (633) | One-to-Many | 1:N | Instances |
| Self (631) | Self-reference | N:1 | Previous version |

### 6. Indexes
- UNIQUE (`workflow_code`)
- INDEX (`business_module`, `trigger_event`, `status`)
- INDEX (`applicable_entity`, `status`)
- INDEX (`is_latest_version`, `status`)
- INDEX (`applicable_company_id`, `applicable_branch_id`)

### 7. Security Classification
**Confidential** — BPMN XML and conditions are business logic.

### 8. Integration Points
- **Workflow Engine** (FS-3): Primary consumer
- **Unified Automation Engine** (FS-52, Q190): Event routing
- **Event Bus** (FS-49): Event subscription
- **All Business Modules**: Workflow triggers
- **Audit Engine** (FS-5): Execution audit

### 9. Sample Data
```json
{
  "workflow_code": "WF-PO-APPROVAL", "workflow_name": "Purchase Order Approval",
  "workflow_description": "Multi-level PO approval based on amount and department",
  "business_module": "PROCUREMENT", "workflow_type": "DYNAMIC",
  "trigger_event": "purchase_order.submitted", "trigger_type": "BUSINESS_EVENT",
  "applicable_entity": "purchase_order", "max_duration_hours": 168,
  "enable_delegation": true, "enable_dynamic_routing": true,
  "version": "2.0", "is_latest_version": true, "tested_in_sandbox": true,
  "active_instances_count": 14, "total_instances_count": 4523,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`WORKFLOW_DEFINITION_CREATED`, `WORKFLOW_DEFINITION_UPDATED`, `WORKFLOW_DEFINITION_VERSION_PUBLISHED`, `WORKFLOW_DEFINITION_ACTIVATED`, `WORKFLOW_DEFINITION_DEACTIVATED`, `WORKFLOW_DEFINITION_DEPRECATED`, `WORKFLOW_SANDBOX_TESTED`

---

## Entity 632 — Workflow Step

### 1. Business Purpose
Per Part 14 §4: Stores Step Number, Approver, Role, Department, SLA, Next Step. Step definitions within a workflow.

### 2. Architectural Role
Configuration entity — defines each step in the workflow. Steps can be sequential, parallel, or conditionally branched.

### 3. Business Rules
- Step types: APPROVAL (user approves), REVIEW (user reviews), NOTIFICATION (send alert), SYSTEM_ACTION (automated), GATEWAY (decision point), TIMER (wait), SCRIPT (custom logic)
- Approver resolution: by ROLE, by DEPARTMENT, by USER, by FORMULA (e.g., reporting manager), by MATRIX (approval matrix lookup)
- Branching: condition-based (IF/ELSE), parallel (FORK/JOIN), exclusive (XOR)
- SLA per step: defines escalation if breached
- Auto-approve: if approver is same as submitter, auto-approve (configurable)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `workflow_definition_id` | UUID | Yes | — | FK to `workflow_definition` (Entity 631) | Parent workflow | Internal |
| `step_code` | VARCHAR(50) | Yes | — | Unique per workflow | Code | Internal |
| `step_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `step_description` | TEXT | No | NULL | — | Description | Internal |
| `step_number` | INTEGER | Yes | — | ≥ 1 | Step Number (per Part 14) | Internal |
| `step_type` | ENUM | Yes | — | APPROVAL, REVIEW, NOTIFICATION, SYSTEM_ACTION, GATEWAY, TIMER, SCRIPT, SUB_WORKFLOW | Type | Internal |
| `approver_resolution_method` | ENUM | Yes | — | ROLE, DEPARTMENT, USER, FORMULA, MATRIX, DYNAMIC, SELF | Method | Confidential |
| `approver_role_id` | UUID | No | NULL | FK to `role_master` (Entity 611) | Role (per Part 14) | Confidential |
| `approver_department_id` | UUID | No | NULL | FK to `departments` | Department (per Part 14) | Internal |
| `approver_user_id` | UUID | No | NULL | FK to `identity_master` | Specific user | Confidential |
| `approver_formula` | TEXT | No | NULL | — | Formula (e.g., `reporting_manager`) | Confidential |
| `approval_matrix_id` | UUID | No | NULL | FK to `approval_matrix` (Entity 635) | Matrix lookup | Confidential |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | Per-company | Internal |
| `applicable_branch_id` | UUID | No | NULL | FK to `branch_master` | Per-branch | Internal |
| `parallel_branch_id` | VARCHAR(50) | No | NULL | — | Branch (if parallel) | Internal |
| `next_step_on_approve` | UUID | No | NULL | FK to `workflow_step` (self) | Next Step (per Part 14) on approve | Internal |
| `next_step_on_reject` | UUID | No | NULL | FK to `workflow_step` (self) | Next on reject | Internal |
| `gateway_conditions` | JSONB | No | NULL | — | Conditions (GATEWAY type) | Confidential |
| `sla_hours` | DECIMAL(7,2) | Yes | — | > 0 | SLA (per Part 14) | Internal |
| `sla_escalation_rule_id` | UUID | No | NULL | FK to `escalation_rule` (Entity 636) | Escalation | Internal |
| `auto_approve_if_submitter` | BOOLEAN | Yes | `false` | — | Auto-approve self | Internal |
| `require_comments` | BOOLEAN | Yes | `false` | — | Comments mandatory | Internal |
| `require_attachment` | BOOLEAN | Yes | `false` | — | Attachment needed | Internal |
| `allow_delegation` | BOOLEAN | Yes | `true` | — | Delegation allowed | Internal |
| `allow_rejection` | BOOLEAN | Yes | `true` | — | Can reject | Internal |
| `allow_return_to_previous` | BOOLEAN | Yes | `false` | — | Return to prev | Internal |
| `notification_template_id` | UUID | No | NULL | FK to `notification_template` (Entity 641) | Notification | Internal |
| `system_action_config` | JSONB | No | NULL | — | SYSTEM_ACTION config | Confidential |
| `script_content` | TEXT | No | NULL | — | SCRIPT content | Confidential |
| `sub_workflow_definition_id` | UUID | No | NULL | FK to `workflow_definition` | SUB_WORKFLOW | Internal |
| `timer_duration_hours` | DECIMAL(7,2) | No | NULL | > 0 | TIMER duration | Internal |
| `is_optional` | BOOLEAN | Yes | `false` | — | Can skip | Internal |
| `priority` | INTEGER | Yes | `100` | 1-999 | Priority | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workflow Definition (631) | Many-to-One | N:1 | Parent workflow |
| Self (632) | Self-reference | N:1 | Next step |
| Approval Matrix (635) | Many-to-One | N:1 | Matrix |
| Escalation Rule (636) | Many-to-One | N:1 | Escalation |
| Task Queue (634) | One-to-Many | 1:N | Generated tasks |

### 6. Indexes
- UNIQUE (`workflow_definition_id`, `step_code`)
- INDEX (`workflow_definition_id`, `step_number`)
- INDEX (`step_type`, `status`)
- INDEX (`approver_role_id`)
- INDEX (`approver_department_id`)

### 7. Security Classification
**Confidential** — approver resolution and conditions.

### 8. Integration Points
- **Workflow Engine** (FS-3): Step execution
- **RBAC Engine** (FS-2): Approver resolution
- **Approval Authority** (Entity 616): Limits
- **Notification Engine** (FS-4): Step notifications
- **Task Queue** (Entity 634): Task generation

### 9. Sample Data
```json
{
  "workflow_definition_id": "wf-001", "step_code": "STEP-001",
  "step_name": "Reporting Manager Approval", "step_number": 1,
  "step_type": "APPROVAL", "approver_resolution_method": "FORMULA",
  "approver_formula": "submitter.reporting_manager_id",
  "sla_hours": 24, "auto_approve_if_submitter": false,
  "require_comments": true, "allow_delegation": true,
  "allow_rejection": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`WORKFLOW_STEP_CREATED`, `WORKFLOW_STEP_UPDATED`, `WORKFLOW_STEP_ACTIVATED`, `WORKFLOW_STEP_INACTIVATED`

---

## Entity 633 — Workflow Instance

### 1. Business Purpose
Per Part 14 §4: Tracks Started, Running, Completed, Rejected, Cancelled. Runtime instances of workflow definitions.

### 2. Architectural Role
Transaction entity — one record per workflow execution. Tracks current state, history, and outcome.

### 3. Business Rules
- State machine: STARTED → RUNNING → (COMPLETED | REJECTED | CANCELLED | TIMED_OUT)
- Instance carries business context (entity_id, entity_type, data snapshot)
- Concurrent instances: one entity can have multiple workflows if different types
- Recovery: instances persist across server restarts
- Audit: every state change creates history record

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `instance_number` | VARCHAR(50) | Yes | — | Unique per company | Display number | Internal |
| `workflow_definition_id` | UUID | Yes | — | FK to `workflow_definition` (Entity 631) | Definition | Internal |
| `workflow_definition_version` | VARCHAR(20) | Yes | — | — | Version at start | Internal |
| `applicable_entity_type` | VARCHAR(100) | Yes | — | — | Entity type (e.g., `purchase_order`) | Internal |
| `applicable_entity_id` | UUID | Yes | — | — | Entity ID | Internal |
| `applicable_entity_code` | VARCHAR(50) | No | NULL | — | Display code | Internal |
| `business_context` | JSONB | Yes | `'{}'` | — | Business data snapshot | Confidential |
| `initiated_by` | UUID | Yes | — | FK to `identity_master` | Initiator | Confidential |
| `initiated_at` | TIMESTAMPTZ | Yes | `now()` | — | Start time (per Part 14: "Started") | Internal |
| `current_step_id` | UUID | No | NULL | FK to `workflow_step` (Entity 632) | Current step | Internal |
| `current_step_number` | INTEGER | Yes | `1` | ≥ 1 | Step number | Internal |
| `current_assignee_id` | UUID | No | NULL | FK to `identity_master` | Current assignee | Confidential |
| `current_assignee_role_id` | UUID | No | NULL | FK to `role_master` | Role | Confidential |
| `last_action_at` | TIMESTAMPTZ | No | NULL | — | Last action | Internal |
| `last_action_by` | UUID | No | NULL | FK to `identity_master` | Actor | Confidential |
| `last_action_type` | ENUM | No | NULL | APPROVED, REJECTED, DELEGATED, RETURNED, ESCALATED, AUTO_APPROVED | Action | Internal |
| `last_action_comments` | TEXT | No | NULL | — | Comments | Confidential |
| `progress_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Progress | Internal |
| `steps_completed_count` | INTEGER | Yes | `0` | ≥ 0 | Completed steps | Internal |
| `steps_total_count` | INTEGER | Yes | `0` | ≥ 0 | Total steps | Internal |
| `parallel_branches_active` | JSONB | Yes | `'[]'` | — | Active parallel branches | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA deadline | Internal |
| `sla_breached` | BOOLEAN | Yes | `false` | — | SLA breach | Internal |
| `escalation_count` | INTEGER | Yes | `0` | ≥ 0 | Escalations | Internal |
| `delegation_count` | INTEGER | Yes | `0` | ≥ 0 | Delegations | Internal |
| `duration_seconds` | INTEGER | No | NULL | ≥ 0 | Total duration | Internal |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Completion (per Part 14: "Completed") | Internal |
| `rejected_at` | TIMESTAMPTZ | No | NULL | — | Rejection (per Part 14: "Rejected") | Internal |
| `cancelled_at` | TIMESTAMPTZ | No | NULL | — | Cancellation (per Part 14: "Cancelled") | Internal |
| `cancelled_by` | UUID | No | NULL | FK to `identity_master` | Canceller | Confidential |
| `cancellation_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `outcome` | ENUM | No | NULL | APPROVED, REJECTED, CANCELLED, TIMED_OUT, COMPLETED | Outcome | Internal |
| `outcome_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `priority` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW | Priority | Internal |
| `current_status` | ENUM | Yes | `STARTED` | STARTED, RUNNING, ON_HOLD, COMPLETED, REJECTED, CANCELLED, TIMED_OUT | Status (per Part 14) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workflow Definition (631) | Many-to-One | N:1 | Definition |
| Workflow Step (632) | Many-to-One | N:1 | Current step |
| Task Queue (634) | One-to-Many | 1:N | Tasks |
| Workflow Audit (639) | One-to-Many | 1:N | Audit trail |

### 6. Indexes
- UNIQUE (`instance_number`)
- INDEX (`workflow_definition_id`, `current_status`)
- INDEX (`applicable_entity_type`, `applicable_entity_id`)
- INDEX (`current_assignee_id`, `current_status`)
- INDEX (`current_status`, `sla_due_at`)
- INDEX (`initiated_by`, `initiated_at`)

### 7. Security Classification
**Confidential** — business context and comments.

### 8. Integration Points
- **Workflow Engine** (FS-3): Instance lifecycle
- **Unified Automation Engine** (FS-52, Q190): Event correlation
- **Task Queue** (Entity 634): Task generation
- **Notification Engine** (FS-4): State change alerts
- **Audit Engine** (FS-5): Full audit

### 9. Sample Data
```json
{
  "instance_number": "WFI-2026-001234", "workflow_definition_id": "wf-001",
  "workflow_definition_version": "2.0", "applicable_entity_type": "purchase_order",
  "applicable_entity_id": "po-001", "applicable_entity_code": "PO-MUM-2026-001248",
  "business_context": { "amount": 500000, "vendor": "vnd-001", "department": "MFG" },
  "initiated_by": "id-100", "initiated_at": "2026-07-08T09:30:00Z",
  "current_step_number": 2, "progress_pct": 50.00,
  "steps_completed_count": 1, "steps_total_count": 4,
  "sla_due_at": "2026-07-09T09:30:00Z", "priority": "HIGH",
  "current_status": "RUNNING"
}
```

### 10. Audit Events
`WORKFLOW_INSTANCE_STARTED`, `WORKFLOW_STEP_ENTERED`, `WORKFLOW_STEP_COMPLETED`, `WORKFLOW_INSTANCE_COMPLETED`, `WORKFLOW_INSTANCE_REJECTED`, `WORKFLOW_INSTANCE_CANCELLED`, `WORKFLOW_INSTANCE_TIMED_OUT`, `WORKFLOW_SLA_BREACHED`, `WORKFLOW_ESCALATED`, `WORKFLOW_DELEGATED`

---

## Entity 634 — Task Queue

### 1. Business Purpose
Per Part 14 §4: Stores Pending Tasks, Assigned Tasks, Completed Tasks, Rejected Tasks. Per-user task inbox.

### 2. Architectural Role
Operational entity — implements the **Task-Driven UX** principle from Vol 0: "Users receive tasks in their inbox; they don't navigate menus."

### 3. Business Rules
- Task sources: WORKFLOW (from workflow instance), MANUAL (user-created), SYSTEM (scheduled), AI (AI-suggested)
- Task priority: CRITICAL (immediate), HIGH (same day), MEDIUM (week), LOW (when convenient)
- Task assignment: explicit user, role-based (anyone with role can claim), team-based
- Auto-escalation: if not picked up within SLA, escalate
- Batch actions: approve/reject multiple tasks at once (with audit)

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `task_number` | VARCHAR(50) | Yes | — | Unique per company | Display number | Internal |
| `task_title` | VARCHAR(200) | Yes | — | Min 3 | Title | Internal |
| `task_description` | TEXT | Yes | — | Min 10 | Description | Confidential |
| `task_type` | ENUM | Yes | — | APPROVAL, REVIEW, DATA_ENTRY, VERIFICATION, CONFIRMATION, FOLLOW_UP, OTHER | Type | Internal |
| `task_source` | ENUM | Yes | — | WORKFLOW, MANUAL, SYSTEM, AI, ESCALATION, NOTIFICATION | Source | Internal |
| `workflow_instance_id` | UUID | No | NULL | FK to `workflow_instance` (Entity 633) | Source workflow | Internal |
| `workflow_step_id` | UUID | No | NULL | FK to `workflow_step` (Entity 632) | Source step | Internal |
| `applicable_entity_type` | VARCHAR(100) | No | NULL | — | Entity type | Internal |
| `applicable_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `applicable_entity_code` | VARCHAR(50) | No | NULL | — | Display code | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `assigned_to_id` | UUID | No | NULL | FK to `identity_master` | Assigned user | Confidential |
| `assigned_to_role_id` | UUID | No | NULL | FK to `role_master` | Assigned role | Confidential |
| `assigned_to_team_id` | UUID | No | NULL | FK to `teams` | Assigned team | Internal |
| `assignment_type` | ENUM | Yes | `EXPLICIT` | EXPLICIT, ROLE_BASED, TEAM_BASED, SELF_CLAIM | Type | Internal |
| `priority` | ENUM | Yes | `MEDIUM` | CRITICAL, HIGH, MEDIUM, LOW | Priority | Internal |
| `created_at` | TIMESTAMPTZ | Yes | `now()` | — | Creation | Internal |
| `assigned_at` | TIMESTAMPTZ | No | NULL | — | Assignment | Internal |
| `claimed_at` | TIMESTAMPTZ | No | NULL | — | Self-claim | Internal |
| `started_at` | TIMESTAMPTZ | No | NULL | — | Work start | Internal |
| `due_at` | TIMESTAMPTZ | Yes | — | — | Due date | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | SLA deadline | Internal |
| `sla_breached` | BOOLEAN | Yes | `false` | — | Breach | Internal |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Completion | Internal |
| `completed_by` | UUID | No | NULL | FK to `identity_master` | Completer | Confidential |
| `completion_action` | ENUM | No | NULL | APPROVED, REJECTED, COMPLETED, DEFERRED, RETURNED, ESCALATED | Action | Internal |
| `completion_comments` | TEXT | No | NULL | — | Comments | Confidential |
| `completion_attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Attachments | Confidential |
| `delegated_to_id` | UUID | No | NULL | FK to `identity_master` | Delegated to | Confidential |
| `delegation_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `escalation_count` | INTEGER | Yes | `0` | ≥ 0 | Escalations | Internal |
| `escalated_to_id` | UUID | No | NULL | FK to `identity_master` | Escalated to | Confidential |
| `reminder_count` | INTEGER | Yes | `0` | ≥ 0 | Reminders sent | Internal |
| `last_reminder_at` | TIMESTAMPTZ | No | NULL | — | Last reminder | Internal |
| `business_context` | JSONB | Yes | `'{}'` | — | Context data | Confidential |
| `action_url` | VARCHAR(500) | No | NULL | — | Direct action URL | Internal |
| `quick_actions` | JSONB | Yes | `'[]'` | — | Quick action buttons | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `current_status` | ENUM | Yes | `PENDING` | PENDING, ASSIGNED, CLAIMED, IN_PROGRESS, COMPLETED, REJECTED, DEFERRED, ESCALATED, CANCELLED, EXPIRED | Status (per Part 14) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workflow Instance (633) | Many-to-One | N:1 | Source workflow |
| Workflow Step (632) | Many-to-One | N:1 | Source step |
| Identity Master (601) | Many-to-One | N:1 | Assignee |

### 6. Indexes
- UNIQUE (`task_number`)
- INDEX (`assigned_to_id`, `current_status`)
- INDEX (`assigned_to_role_id`, `current_status`, `assignment_type`)
- INDEX (`current_status`, `priority`, `due_at`)
- INDEX (`business_module`, `applicable_entity_type`, `applicable_entity_id`)
- INDEX (`sla_due_at`, `sla_breached`)

### 7. Security Classification
**Confidential** — business context and comments.

### 8. Integration Points
- **Task Control Room** (Foundation Service): Unified inbox
- **Workflow Engine** (FS-3): Task generation
- **Notification Engine** (FS-4): Task notifications
- **ESS/MSS Portals** (Part 12): User task views
- **Mobile App**: Push tasks

### 9. Sample Data
```json
{
  "task_number": "TSK-2026-00456", "task_title": "Approve Purchase Order PO-MUM-2026-001248",
  "task_description": "PO from Hindustan Engineers for ₹500,000 — Mixer spares",
  "task_type": "APPROVAL", "task_source": "WORKFLOW",
  "workflow_instance_id": "wfi-001", "applicable_entity_type": "purchase_order",
  "applicable_entity_id": "po-001", "applicable_entity_code": "PO-MUM-2026-001248",
  "business_module": "PROCUREMENT", "assigned_to_id": "id-100",
  "assignment_type": "EXPLICIT", "priority": "HIGH",
  "due_at": "2026-07-09T09:30:00Z", "sla_due_at": "2026-07-09T09:30:00Z",
  "quick_actions": [{ "label": "Approve", "action": "APPROVE" }, { "label": "Reject", "action": "REJECT" }],
  "current_status": "ASSIGNED"
}
```

### 10. Audit Events
`TASK_CREATED`, `TASK_ASSIGNED`, `TASK_CLAIMED`, `TASK_STARTED`, `TASK_COMPLETED`, `TASK_REJECTED`, `TASK_DEFERRED`, `TASK_ESCALATED`, `TASK_DELEGATED`, `TASK_REMINDER_SENT`, `TASK_EXPIRED`, `TASK_SLA_BREACHED`

---

## Entity 635 — Approval Matrix

### 1. Business Purpose
Per Part 14 §4: Supports Department, Amount, Business Unit, Company, Branch, Role. Multi-dimensional approval matrix.

### 2. Architectural Role
Configuration entity — defines who can approve what based on multiple dimensions. Used by Workflow Engine for dynamic approver resolution.

### 3. Business Rules
- Dimensions: COMPANY, BRANCH, BUSINESS_UNIT, DEPARTMENT, ROLE, AMOUNT_RANGE, DOCUMENT_TYPE, VENDOR, CUSTOMER
- Matrix evaluation: all dimensions must match (AND logic)
- Approval levels: tiered (Level 1, 2, 3, etc.) with cumulative limits
- Special conditions: e.g., vendor blacklisted → require CFO approval regardless of amount
- Override: super admin can override (audited)
- Effective period: matrix active from-to

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `matrix_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `matrix_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `matrix_description` | TEXT | No | NULL | — | Description | Internal |
| `business_module` | ENUM | Yes | — | PROCUREMENT, FINANCE, HR, INVENTORY, MANUFACTURING, RETAIL, RESTAURANT, EAM, ALL | Module | Internal |
| `document_type` | VARCHAR(50) | Yes | — | — | Document type (PO, INVOICE, LEAVE, etc.) | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | Company (per Part 14) | Internal |
| `applicable_branch_id` | UUID | No | NULL | FK to `branch_master` | Branch (per Part 14) | Internal |
| `applicable_business_unit_id` | UUID | No | NULL | FK to `organization_service` | Business Unit (per Part 14) | Internal |
| `applicable_department_id` | UUID | No | NULL | FK to `departments` | Department (per Part 14) | Internal |
| `amount_min` | DECIMAL(18,4) | No | NULL | ≥ 0 | Amount range min | Confidential |
| `amount_max` | DECIMAL(18,4) | No | NULL | ≥ amount_min | Amount range max (per Part 14) | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `approval_levels` | JSONB | Yes | `'[]'` | — | [{ level, role_id, approver_user_id, sla_hours, requires_dual_approval }] | Confidential |
| `total_levels` | INTEGER | Yes | `1` | ≥ 1 | Levels count | Internal |
| `approval_authority_ids` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | Linked Approval Authority (E616) | Confidential |
| `conditions` | JSONB | No | NULL | — | Special conditions | Confidential |
| `override_allowed` | BOOLEAN | Yes | `false` | — | Override allowed | Confidential |
| `override_authority_role_id` | UUID | No | NULL | FK to `role_master` | Override role | Confidential |
| `priority` | INTEGER | Yes | `100` | 1-999 | Resolution priority | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `effective_to` | DATE | No | NULL | > effective_from | Effective to | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Workflow Step (632) | One-to-Many | 1:N | Steps using this matrix |
| Approval Authority (616) | Many-to-Many | N:N | Via authority_ids |
| Role Master (611) | Many-to-Many | N:N | Via approval_levels |

### 6. Indexes
- UNIQUE (`matrix_code`)
- INDEX (`business_module`, `document_type`, `status`)
- INDEX (`applicable_company_id`, `applicable_branch_id`, `applicable_department_id`)
- INDEX (`amount_min`, `amount_max`)

### 7. Security Classification
**Confidential** — approval levels and conditions.

### 8. Integration Points
- **Workflow Engine** (FS-3): Dynamic approver resolution
- **Approval Authority** (Entity 616): Authority limits
- **RBAC Engine** (FS-2): Role resolution
- **All Business Modules**: Approval routing

### 9. Sample Data
```json
{
  "matrix_code": "AM-PO-MFG-MUM", "matrix_name": "PO Approval Matrix - Mfg Mumbai",
  "business_module": "PROCUREMENT", "document_type": "PURCHASE_ORDER",
  "applicable_company_id": "cmp-001", "applicable_branch_id": "br-mum-001",
  "applicable_department_id": "dept-mfg",
  "approval_levels": [
    { "level": 1, "role_id": "role-mgr", "sla_hours": 24 },
    { "level": 2, "role_id": "role-hod", "amount_min": 100000, "sla_hours": 48 },
    { "level": 3, "role_id": "role-cfo", "amount_min": 500000, "sla_hours": 72, "requires_dual_approval": true }
  ],
  "total_levels": 3, "status": "ACTIVE"
}
```

### 10. Audit Events
`APPROVAL_MATRIX_CREATED`, `APPROVAL_MATRIX_UPDATED`, `APPROVAL_MATRIX_ACTIVATED`, `APPROVAL_MATRIX_INACTIVATED`, `APPROVAL_MATRIX_OVERRIDE_USED`

---

## Entity 636 — Escalation Rule

### 1. Business Purpose
Per Part 14 §4: Supports Time Based, Priority Based, Manager Escalation, Email Escalation, SMS Escalation. Automated escalation rules.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `rule_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `rule_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `escalation_type` | ENUM | Yes | — | TIME_BASED, PRIORITY_BASED, MANAGER_ESCALATION, EMAIL_ESCALATION, SMS_ESCALATION, COMPOSITE | Type (per Part 14) | Internal |
| `trigger_condition` | JSONB | Yes | `'{}'` | — | When to trigger | Confidential |
| `sla_threshold_hours` | DECIMAL(7,2) | No | NULL | > 0 | Time threshold | Internal |
| `sla_threshold_pct` | DECIMAL(5,2) | No | NULL | 0-100 | % of SLA | Internal |
| `escalation_levels` | JSONB | Yes | `'[]'` | — | [{ level, after_hours, escalate_to_role_id, escalate_to_user_id, notification_channels }] | Confidential |
| `max_escalation_levels` | INTEGER | Yes | `3` | ≥ 1 | Max levels | Internal |
| `escalation_action` | ENUM | Yes | `NOTIFY` | NOTIFY, REASSIGN, AUTO_APPROVE, AUTO_REJECT, INFORM_MANAGER, INFORM_CXO | Action | Internal |
| `reassign_to_role_id` | UUID | No | NULL | FK to `role_master` | Reassign to | Confidential |
| `reassign_to_user_id` | UUID | No | NULL | FK to `identity_master` | Specific user | Confidential |
| `inform_manager_levels_up` | INTEGER | Yes | `1` | ≥ 1 | How many levels up | Internal |
| `notification_template_id` | UUID | No | NULL | FK to `notification_template` (Entity 641) | Template | Internal |
| `notification_channels` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | EMAIL, SMS, PUSH, WHATSAPP, IN_APP | Channels | Internal |
| `priority_override` | ENUM | No | NULL | CRITICAL, HIGH, MEDIUM, LOW | Priority change | Internal |
| `stop_on_acknowledgement` | BOOLEAN | Yes | `true` | — | Stop if acknowledged | Internal |
| `repeat_escalation` | BOOLEAN | Yes | `false` | — | Repeat until action | Internal |
| `repeat_interval_hours` | DECIMAL(7,2) | No | NULL | > 0 | Repeat every | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 637 — Delegation

### 1. Business Purpose
Per Part 14 §4: Supports Leave, Temporary, Permanent, Emergency. Approver delegation management.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `delegation_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `delegator_id` | UUID | Yes | — | FK to `identity_master` | Delegator | Confidential |
| `delegatee_id` | UUID | Yes | — | FK to `identity_master` | Delegatee | Confidential |
| `delegation_type` | ENUM | Yes | — | LEAVE, TEMPORARY, PERMANENT, EMERGENCY | Type (per Part 14) | Internal |
| `delegation_scope` | ENUM | Yes | `ALL` | ALL, SPECIFIC_MODULE, SPECIFIC_WORKFLOW, SPECIFIC_TASK_TYPE | Scope | Internal |
| `applicable_modules` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Modules | Internal |
| `applicable_workflow_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Workflows | Internal |
| `approval_limit_max` | DECIMAL(18,4) | No | NULL | ≥ 0 | Max amount delegatee can approve | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `start_date` | DATE | Yes | — | — | Start | Internal |
| `end_date` | DATE | Yes | — | > start_date | End | Internal |
| `reason` | TEXT | Yes | — | Min 10 | Reason | Confidential |
| `linked_leave_request_id` | UUID | No | NULL | FK to `leave_requests` (Entity 444) | Leave link | Confidential |
| `requires_approval` | BOOLEAN | Yes | `true` | — | Approval needed | Internal |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `rejection_reason` | TEXT | No | NULL | — | If rejected | Confidential |
| `active_tasks_count` | INTEGER | Yes | `0` | ≥ 0 | Tasks delegated | Internal |
| `total_tasks_delegated` | BIGINT | Yes | `0` | ≥ 0 | Total ever | Internal |
| `auto_expire` | BOOLEAN | Yes | `true` | — | Auto-expire on end_date | Internal |
| `revoked_at` | TIMESTAMPTZ | No | NULL | — | Revocation | Internal |
| `revoked_by` | UUID | No | NULL | FK to `identity_master` | Revoker | Confidential |
| `revocation_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `current_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED, ACTIVE, EXPIRED, REVOKED, REJECTED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 638 — SLA Monitor

### 1. Business Purpose
Per Part 14 §4: Tracks Response Time, Approval Time, Completion Time, Overdue. SLA monitoring for workflows.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `monitor_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `workflow_instance_id` | UUID | Yes | — | FK to `workflow_instance` (Entity 633) | Workflow | Internal |
| `task_id` | UUID | No | NULL | FK to `task_queue` (Entity 634) | Task | Internal |
| `sla_type` | ENUM | Yes | — | RESPONSE, APPROVAL, COMPLETION, RESOLUTION | Type | Internal |
| `sla_target_hours` | DECIMAL(7,2) | Yes | — | > 0 | Target | Internal |
| `sla_started_at` | TIMESTAMPTZ | Yes | `now()` | — | Start | Internal |
| `sla_due_at` | TIMESTAMPTZ | Yes | — | — | Due | Internal |
| `actual_response_at` | TIMESTAMPTZ | No | NULL | — | Response Time (per Part 14) | Internal |
| `actual_response_hours` | DECIMAL(7,2) | No | NULL | ≥ 0 | Actual response | Internal |
| `actual_approval_at` | TIMESTAMPTZ | No | NULL | — | Approval Time (per Part 14) | Internal |
| `actual_approval_hours` | DECIMAL(7,2) | No | NULL | ≥ 0 | Actual approval | Internal |
| `actual_completion_at` | TIMESTAMPTZ | No | NULL | — | Completion Time (per Part 14) | Internal |
| `actual_completion_hours` | DECIMAL(7,2) | No | NULL | ≥ 0 | Actual completion | Internal |
| `is_overdue` | BOOLEAN | Yes | `false` | — | Overdue (per Part 14) | Internal |
| `overdue_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Hours overdue | Internal |
| `overdue_severity` | ENUM | No | NULL | MINOR, MAJOR, CRITICAL | Severity | Internal |
| `compliance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Compliance | Internal |
| `escalation_triggered` | BOOLEAN | Yes | `false` | — | Escalated | Internal |
| `escalation_count` | INTEGER | Yes | `0` | ≥ 0 | Times escalated | Internal |
| `breach_reason` | TEXT | No | NULL | — | If breached | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `current_status` | ENUM | Yes | `ACTIVE` | ACTIVE, COMPLETED, BREACHED, ESCALATED, CANCELLED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 639 — Workflow Audit

### 1. Business Purpose
Per Part 14 §4: Stores Every Action, Approver, Time, Decision, Comments. Immutable workflow audit trail.

### 2. Architectural Role
Append-only audit ledger — every workflow event creates an immutable record.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `audit_code` | VARCHAR(40) | Yes | — | Unique | Code | Internal |
| `workflow_instance_id` | UUID | Yes | — | FK to `workflow_instance` (Entity 633) | Instance | Internal |
| `workflow_definition_id` | UUID | Yes | — | FK to `workflow_definition` (Entity 631) | Definition | Internal |
| `task_id` | UUID | No | NULL | FK to `task_queue` (Entity 634) | Task | Internal |
| `step_id` | UUID | No | NULL | FK to `workflow_step` (Entity 632) | Step | Internal |
| `event_type` | ENUM | Yes | — | STARTED, STEP_ENTERED, STEP_COMPLETED, APPROVED, REJECTED, DELEGATED, ESCALATED, RETURNED, AUTO_APPROVED, COMPLETED, CANCELLED, TIMED_OUT, SLA_BREACHED | Event | Internal |
| `action_performed` | VARCHAR(100) | Yes | — | — | Action (per Part 14) | Internal |
| `actor_id` | UUID | No | NULL | FK to `identity_master` | Approver (per Part 14) / Actor | Confidential |
| `actor_name` | VARCHAR(200) | No | NULL | — | Denormalized | Internal |
| `actor_role_id` | UUID | No | NULL | FK to `role_master` | Role | Confidential |
| `action_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Time (per Part 14) | Internal |
| `decision` | ENUM | No | NULL | APPROVED, REJECTED, DELEGATED, RETURNED, ESCALATED, COMPLETED, CANCELLED | Decision (per Part 14) | Internal |
| `comments` | TEXT | No | NULL | — | Comments (per Part 14) | Confidential |
| `attachments` | UUID[] | No | `ARRAY[]::UUID[]` | — | Evidence | Confidential |
| `before_state` | JSONB | No | NULL | — | State before | Confidential |
| `after_state` | JSONB | No | NULL | — | State after | Confidential |
| `applicable_entity_type` | VARCHAR(100) | Yes | — | — | Entity type | Internal |
| `applicable_entity_id` | UUID | Yes | — | — | Entity ID | Internal |
| `applicable_entity_code` | VARCHAR(50) | No | NULL | — | Display code | Internal |
| `ip_address` | INET | No | NULL | — | Source IP | Confidential |
| `user_agent` | TEXT | No | NULL | — | User agent | Confidential |
| `session_id` | UUID | No | NULL | FK to `session_management` | Session | Confidential |
| `correlation_id` | UUID | No | NULL | — | Cross-service | Internal |
| `previous_hash` | VARCHAR(64) | Yes | — | — | Hash of previous (per instance) | Internal |
| `record_hash` | VARCHAR(64) | Yes | — | SHA-256 | Hash of this record | Internal |
| `retention_until` | DATE | Yes | — | — | Retention expiry | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, EXPORTED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 640 — Workflow Dashboard

### 1. Business Purpose
Per Part 14 §4: Displays Pending, Approved, Rejected, SLA Breaches, Workflow Performance. AI: Suggest Workflow, Detect Bottlenecks, Optimize Approvals, Predict Delays.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | USER, DEPARTMENT, BRANCH, COMPANY | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `pending_tasks_count` | INTEGER | Yes | `0` | ≥ 0 | Pending (per Part 14) | Internal |
| `pending_tasks_by_priority` | JSONB | Yes | `'{}'` | — | By priority | Internal |
| `pending_tasks_by_module` | JSONB | Yes | `'{}'` | — | By module | Internal |
| `approved_today_count` | INTEGER | Yes | `0` | ≥ 0 | Approved (per Part 14) today | Internal |
| `rejected_today_count` | INTEGER | Yes | `0` | ≥ 0 | Rejected (per Part 14) today | Internal |
| `completed_today_count` | INTEGER | Yes | `0` | ≥ 0 | Completed today | Internal |
| `total_processed_today_count` | INTEGER | Yes | `0` | ≥ 0 | Total | Internal |
| `approval_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Approval rate | Internal |
| `rejection_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Rejection rate | Internal |
| `sla_breaches_count` | INTEGER | Yes | `0` | ≥ 0 | SLA Breaches (per Part 14) | Confidential |
| `sla_breaches_list` | JSONB | Yes | `'[]'` | — | List | Confidential |
| `sla_compliance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Compliance | Internal |
| `avg_approval_time_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Avg time | Internal |
| `avg_completion_time_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Avg | Internal |
| `escalations_today_count` | INTEGER | Yes | `0` | ≥ 0 | Escalations | Internal |
| `delegations_today_count` | INTEGER | Yes | `0` | ≥ 0 | Delegations | Internal |
| `active_workflows_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `workflow_performance_trend_30d` | JSONB | Yes | `'[]'` | — | 30-day trend | Internal |
| `workflows_by_module` | JSONB | Yes | `'{}'` | — | By module | Internal |
| `top_bottleneck_workflows` | JSONB | Yes | `'[]'` | — | Slowest workflows | Confidential |
| `ai_suggest_workflow` | JSONB | No | NULL | — | AI: Suggest Workflow (per Part 14 AI) | Confidential |
| `ai_detect_bottlenecks` | JSONB | No | NULL | — | AI: Detect Bottlenecks (per Part 14 AI) | Confidential |
| `ai_optimize_approvals` | JSONB | No | NULL | — | AI: Optimize Approvals (per Part 14 AI) | Confidential |
| `ai_predict_delays` | JSONB | No | NULL | — | AI: Predict Delays (per Part 14 AI) | Restricted |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 5: Enterprise Notification Engine, Communication Hub & Alerts (Entities 641-650)

## Entity 641 — Notification Template

### 1. Business Purpose
Per Part 14 §5: Supports Email, SMS, Push, WhatsApp, In-App, Voice. Template-driven multi-channel notifications.

### 2. Architectural Role
Configuration entity — defines notification content per channel. Variables populated at runtime from business context.

### 3. Business Rules
- Templates per channel: each channel has its own template (Email HTML, SMS plain text, Push JSON, WhatsApp interactive, Voice script)
- Variables: `{{user.name}}`, `{{entity.code}}`, `{{action.url}}`, etc.
- Localization: templates per locale
- Versioning: templates versioned
- Personalization: dynamic content based on user profile
- A/B testing: variant templates for optimization

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `template_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `template_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `template_description` | TEXT | No | NULL | — | Description | Internal |
| `notification_category` | ENUM | Yes | — | WORKFLOW, ALERT, REMINDER, BROADCAST, TRANSACTION, MARKETING, SYSTEM, SECURITY, OTHER | Category | Internal |
| `supported_channels` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | EMAIL, SMS, PUSH, WHATSAPP, IN_APP, VOICE (per Part 14) | Channels | Internal |
| `email_subject` | VARCHAR(500) | No | NULL | — | Email subject (with variables) | Internal |
| `email_body_html` | TEXT | No | NULL | — | Email HTML body | Internal |
| `email_body_text` | TEXT | No | NULL | — | Plain text fallback | Internal |
| `email_from_name` | VARCHAR(100) | No | NULL | — | From name | Internal |
| `email_from_address` | VARCHAR(200) | No | NULL | — | From address | Confidential |
| `email_reply_to` | VARCHAR(200) | No | NULL | — | Reply-to | Confidential |
| `email_cc` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | CC | Confidential |
| `email_bcc` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | BCC | Confidential |
| `email_attachments` | JSONB | No | NULL | — | Attachments config | Internal |
| `sms_text` | VARCHAR(1000) | No | NULL | — | SMS text (with variables) | Internal |
| `sms_sender_id` | VARCHAR(20) | No | NULL | — | Sender ID | Confidential |
| `sms_unicode` | BOOLEAN | Yes | `true` | — | Unicode support | Internal |
| `push_title` | VARCHAR(200) | No | NULL | — | Push title | Internal |
| `push_body` | VARCHAR(500) | No | NULL | — | Push body | Internal |
| `push_icon_url` | VARCHAR(500) | No | NULL | — | Icon | Internal |
| `push_image_url` | VARCHAR(500) | No | NULL | — | Image | Internal |
| `push_action_url` | VARCHAR(500) | No | NULL | — | Action URL | Internal |
| `push_action_buttons` | JSONB | No | NULL | — | Action buttons | Internal |
| `push_sound` | VARCHAR(50) | No | NULL | — | Sound | Internal |
| `push_badge` | INTEGER | No | NULL | ≥ 0 | Badge count | Internal |
| `push_category` | VARCHAR(50) | No | NULL | — | Category | Internal |
| `push_thread_id` | VARCHAR(100) | No | NULL | — | Thread | Internal |
| `whatsapp_template_name` | VARCHAR(100) | No | NULL | — | WhatsApp template name (pre-approved) | Internal |
| `whatsapp_language` | VARCHAR(10) | No | NULL | — | Template language | Internal |
| `whatsapp_body_parameters` | JSONB | No | NULL | — | Body params | Internal |
| `whatsapp_header_parameters` | JSONB | No | NULL | — | Header params | Internal |
| `whatsapp_buttons` | JSONB | No | NULL | — | Interactive buttons | Internal |
| `in_app_title` | VARCHAR(200) | No | NULL | — | In-app title | Internal |
| `in_app_body` | TEXT | No | NULL | — | In-app body | Internal |
| `in_app_icon` | VARCHAR(50) | No | NULL | — | Icon name | Internal |
| `in_app_color` | VARCHAR(20) | No | NULL | — | Color | Internal |
| `in_app_action_url` | VARCHAR(500) | No | NULL | — | Action URL | Internal |
| `in_app_expiry_hours` | INTEGER | No | NULL | > 0 | Expiry | Internal |
| `voice_script` | TEXT | No | NULL | — | Voice script (TTS) | Internal |
| `voice_language` | VARCHAR(10) | No | NULL | — | Language | Internal |
| `voice_voice_id` | VARCHAR(50) | No | NULL | — | Voice ID | Internal |
| `variables` | JSONB | Yes | `'[]'` | — | [{ name, type, required, default, description }] | Internal |
| `localization_overrides` | JSONB | No | NULL | — | Per-locale overrides | Internal |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT | Priority | Internal |
| `applicable_modules` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Modules | Internal |
| `applicable_events` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Trigger events | Internal |
| `ab_testing_enabled` | BOOLEAN | Yes | `false` | — | A/B test | Internal |
| `ab_variants` | JSONB | No | NULL | — | Variants | Confidential |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `notification_template` (self) | Previous | Internal |
| `tested` | BOOLEAN | Yes | `false` | — | Test sent | Internal |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `usage_count` | BIGINT | Yes | `0` | ≥ 0 | Times used | Internal |
| `delivery_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success rate | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, TESTING, ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Self (641) | Self-reference | N:1 | Previous version |
| Notification Queue (643) | One-to-Many | 1:N | Queue items |
| Alert Rule (644) | Many-to-One | N:1 | Alert templates |

### 6. Indexes
- UNIQUE (`template_code`)
- INDEX (`notification_category`, `status`)
- INDEX (`priority`, `status`)
- GIN INDEX (`supported_channels`)
- GIN INDEX (`applicable_modules`)

### 7. Security Classification
**Confidential** — from addresses and BCC.

### 8. Integration Points
- **Notification Engine** (FS-4): Primary consumer
- **Unified Automation Engine** (FS-52, Q190): Event routing
- **Workflow Engine** (FS-3): Step notifications
- **Alert Rule** (Entity 644): Alert templates
- **Reminder Engine** (Entity 646): Reminder templates

### 9. Sample Data
```json
{
  "template_code": "NTF-PO-APPROVAL-REQ", "template_name": "PO Approval Requested",
  "notification_category": "WORKFLOW", "supported_channels": ["EMAIL", "PUSH", "IN_APP"],
  "email_subject": "PO {{po.code}} awaiting your approval (₹{{po.amount}})",
  "email_body_html": "<html>... PO {{po.code}} from {{po.vendor}} ...</html>",
  "push_title": "PO Approval Required",
  "push_body": "PO {{po.code}} for ₹{{po.amount}} awaiting approval",
  "push_action_url": "/procurement/po/{{po.id}}/approve",
  "in_app_title": "PO Approval Required",
  "variables": [
    { "name": "po.code", "type": "STRING", "required": true },
    { "name": "po.amount", "type": "DECIMAL", "required": true },
    { "name": "po.vendor", "type": "STRING", "required": true }
  ],
  "priority": "HIGH", "applicable_modules": ["PROCUREMENT"],
  "applicable_events": ["purchase_order.submitted"], "status": "ACTIVE"
}
```

### 10. Audit Events
`NOTIFICATION_TEMPLATE_CREATED`, `NOTIFICATION_TEMPLATE_UPDATED`, `NOTIFICATION_TEMPLATE_VERSION_PUBLISHED`, `NOTIFICATION_TEMPLATE_TESTED`, `NOTIFICATION_TEMPLATE_APPROVED`, `NOTIFICATION_TEMPLATE_DEPRECATED`

---

## Entity 642 — Notification Channel

### 1. Business Purpose
Per Part 14 §5: Supports Email, SMS, Push, WhatsApp, Slack, Microsoft Teams, Webhook. Channel configuration.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `channel_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `channel_name` | VARCHAR(100) | Yes | — | Min 3 | Display name | Internal |
| `channel_type` | ENUM | Yes | — | EMAIL, SMS, PUSH, WHATSAPP, SLACK, MICROSOFT_TEAMS, WEBHOOK, IN_APP, VOICE, OTHER | Type (per Part 14) | Internal |
| `provider` | VARCHAR(100) | Yes | — | — | Provider (SendGrid, Twilio, etc.) | Confidential |
| `provider_config_encrypted` | TEXT | Yes | — | — | Encrypted config | Restricted |
| `encryption_key_id` | UUID | Yes | — | FK to `security_keys` | Key | Restricted |
| `api_endpoint` | VARCHAR(500) | No | NULL | — | API URL | Confidential |
| `api_key_encrypted` | TEXT | No | NULL | — | Encrypted API key | Restricted |
| `sender_id` | VARCHAR(100) | No | NULL | — | Sender (email from, SMS sender ID) | Confidential |
| `from_address` | VARCHAR(200) | No | NULL | — | Email from | Confidential |
| `reply_to_address` | VARCHAR(200) | No | NULL | — | Reply-to | Confidential |
| `whatsapp_business_account_id` | VARCHAR(100) | No | NULL | — | WhatsApp Business | Confidential |
| `whatsapp_phone_number_id` | VARCHAR(100) | No | NULL | — | Phone number ID | Confidential |
| `slack_bot_token_encrypted` | TEXT | No | NULL | — | Slack token | Restricted |
| `slack_default_channel` | VARCHAR(100) | No | NULL | — | Default channel | Internal |
| `teams_app_id` | VARCHAR(100) | No | NULL | — | Teams app | Confidential |
| `teams_tenant_id` | VARCHAR(100) | No | NULL | — | Tenant | Confidential |
| `webhook_url` | VARCHAR(500) | No | NULL | — | Webhook URL | Confidential |
| `webhook_auth_header` | VARCHAR(500) | No | NULL | — | Auth header | Restricted |
| `webhook_secret_encrypted` | TEXT | No | NULL | — | Secret | Restricted |
| `push_apns_key_encrypted` | TEXT | No | NULL | — | APNs key | Restricted |
| `push_apns_key_id` | VARCHAR(100) | No | NULL | — | APNs key ID | Confidential |
| `push_apns_team_id` | VARCHAR(100) | No | NULL | — | Team ID | Confidential |
| `push_fcm_server_key_encrypted` | TEXT | No | NULL | — | FCM key | Restricted |
| `push_fcm_project_id` | VARCHAR(100) | No | NULL | — | FCM project | Confidential |
| `voice_provider` | VARCHAR(100) | No | NULL | — | Voice provider | Confidential |
| `voice_from_number` | VARCHAR(20) | No | NULL | — | From number | Confidential |
| `is_primary` | BOOLEAN | Yes | `false` | — | Primary for channel_type | Internal |
| `is_active` | BOOLEAN | Yes | `true` | — | Active | Internal |
| `rate_limit_per_minute` | INTEGER | Yes | `100` | ≥ 1 | Rate limit | Internal |
| `rate_limit_per_hour` | INTEGER | Yes | `1000` | ≥ 1 | Hourly | Internal |
| `rate_limit_per_day` | INTEGER | Yes | `10000` | ≥ 1 | Daily | Internal |
| `daily_quota_used` | INTEGER | Yes | `0` | ≥ 0 | Today's usage | Internal |
| `daily_quota_limit` | INTEGER | No | NULL | ≥ 1 | Daily quota | Internal |
| `monthly_quota_used` | BIGINT | Yes | `0` | ≥ 0 | Month usage | Internal |
| `monthly_quota_limit` | BIGINT | No | NULL | ≥ 1 | Month quota | Internal |
| `cost_per_message` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Cost per msg | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `retry_policy` | JSONB | Yes | `'{}'` | — | Retry config | Internal |
| `fallback_channel_id` | UUID | No | NULL | FK to `notification_channel` (self) | Fallback | Internal |
| `last_test_at` | TIMESTAMPTZ | No | NULL | — | Last test | Internal |
| `last_test_success` | BOOLEAN | No | NULL | — | Test result | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, SUSPENDED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 643 — Notification Queue

### 1. Business Purpose
Per Part 14 §5: Stores Queued, Processing, Delivered, Failed, Retried. Notification queue with retry.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `queue_id` | VARCHAR(100) | Yes | — | Unique | Queue item ID | Internal |
| `template_id` | UUID | Yes | — | FK to `notification_template` (Entity 641) | Template | Internal |
| `channel_id` | UUID | Yes | — | FK to `notification_channel` (Entity 642) | Channel | Internal |
| `channel_type` | ENUM | Yes | — | EMAIL, SMS, PUSH, WHATSAPP, SLACK, MICROSOFT_TEAMS, WEBHOOK, IN_APP, VOICE | Type | Internal |
| `recipient_identity_id` | UUID | No | NULL | FK to `identity_master` | Recipient identity | Confidential |
| `recipient_address` | VARCHAR(500) | Yes | — | — | Email/phone/URL | Confidential |
| `recipient_name` | VARCHAR(200) | No | NULL | — | Name | Internal |
| `recipient_user_id` | UUID | No | NULL | FK to `workforce_master` | Workforce | Confidential |
| `subject` | VARCHAR(500) | No | NULL | — | Subject (rendered) | Internal |
| `body_content` | TEXT | Yes | — | — | Rendered body | Confidential |
| `variables_used` | JSONB | Yes | `'{}'` | — | Variables applied | Internal |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT | Priority | Internal |
| `scheduled_at` | TIMESTAMPTZ | Yes | `now()` | — | Scheduled | Internal |
| `queued_at` | TIMESTAMPTZ | Yes | `now()` | — | Queued (per Part 14) | Internal |
| `processing_started_at` | TIMESTAMPTZ | No | NULL | — | Processing (per Part 14) | Internal |
| `delivered_at` | TIMESTAMPTZ | No | NULL | — | Delivered (per Part 14) | Internal |
| `failed_at` | TIMESTAMPTZ | No | NULL | — | Failed | Internal |
| `retry_count` | INTEGER | Yes | `0` | ≥ 0 | Retried (per Part 14) | Internal |
| `max_retries` | INTEGER | Yes | `3` | ≥ 0 | Max retries | Internal |
| `next_retry_at` | TIMESTAMPTZ | No | NULL | — | Next retry | Internal |
| `provider_message_id` | VARCHAR(200) | No | NULL | — | Provider's ID | Confidential |
| `provider_response` | JSONB | No | NULL | — | Provider response | Confidential |
| `error_message` | TEXT | No | NULL | — | Error | Confidential |
| `error_code` | VARCHAR(50) | No | NULL | — | Code | Internal |
| `business_module` | VARCHAR(50) | No | NULL | — | Source module | Internal |
| `business_event` | VARCHAR(200) | No | NULL | — | Source event | Internal |
| `applicable_entity_type` | VARCHAR(100) | No | NULL | — | Entity type | Internal |
| `applicable_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `workflow_instance_id` | UUID | No | NULL | FK to `workflow_instance` | Source workflow | Internal |
| `task_id` | UUID | No | NULL | FK to `task_queue` | Source task | Internal |
| `correlation_id` | UUID | No | NULL | — | Cross-service | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `cost_incurred` | DECIMAL(10,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `current_status` | ENUM | Yes | `QUEUED` | QUEUED, PROCESSING, DELIVERED, FAILED, RETRYING, CANCELLED, EXPIRED | Status (per Part 14) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 644 — Alert Rule

### 1. Business Purpose
Per Part 14 §5: Examples — Low Stock, Machine Breakdown, Payroll Complete, Order Delayed, Quality Failure, Temperature Alert. Business alert rules.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `rule_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `rule_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `alert_category` | ENUM | Yes | — | LOW_STOCK, MACHINE_BREAKDOWN, PAYROLL_COMPLETE, ORDER_DELAYED, QUALITY_FAILURE, TEMPERATURE_ALERT, INVENTORY_THRESHOLD, SLA_BREACH, COMPLIANCE_DUE, CERTIFICATION_EXPIRY, CONTRACT_EXPIRY, PAYMENT_DUE, OTHER | Category (per Part 14) | Internal |
| `business_module` | ENUM | Yes | — | INVENTORY, MANUFACTURING, FINANCE, HR, RETAIL, RESTAURANT, WAREHOUSE, EAM, QUALITY, PROCUREMENT, ALL | Module | Internal |
| `trigger_event` | VARCHAR(200) | Yes | — | — | Triggering event | Internal |
| `trigger_type` | ENUM | Yes | `EVENT_BASED` | EVENT_BASED, SCHEDULED, THRESHOLD_BASED, CONDITION_BASED, COMPOSITE | Type | Internal |
| `trigger_conditions` | JSONB | Yes | `'[]'` | — | Conditions | Confidential |
| `threshold_value` | DECIMAL(18,4) | No | NULL | — | Threshold | Confidential |
| `threshold_operator` | ENUM | No | NULL | LESS_THAN, LESS_THAN_EQUAL, EQUAL, GREATER_THAN_EQUAL, GREATER_THAN, NOT_EQUAL | Operator | Internal |
| `evaluation_frequency` | ENUM | Yes | `REAL_TIME` | REAL_TIME, EVERY_MINUTE, EVERY_5_MINUTES, HOURLY, DAILY | Frequency | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `applicable_branch_id` | UUID | No | NULL | FK to `branch_master` | NULL = all | Internal |
| `applicable_department_id` | UUID | No | NULL | FK to `departments` | NULL = all | Internal |
| `recipient_resolution_method` | ENUM | Yes | — | ROLE_BASED, DEPARTMENT_BASED, SPECIFIC_USERS, DYNAMIC, ESCALATION_CHAIN | Method | Confidential |
| `recipient_role_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Recipient roles | Confidential |
| `recipient_user_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Specific users | Confidential |
| `notification_template_id` | UUID | Yes | — | FK to `notification_template` (Entity 641) | Template | Internal |
| `notification_channels` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | EMAIL, SMS, PUSH, WHATSAPP, IN_APP | Channels | Internal |
| `priority` | ENUM | Yes | `HIGH` | LOW, NORMAL, HIGH, URGENT, CRITICAL | Priority | Internal |
| `severity_levels` | JSONB | Yes | `'[]'` | — | Multi-severity config | Confidential |
| `suppression_window_minutes` | INTEGER | Yes | `0` | ≥ 0 | Suppress duplicate alerts | Internal |
| `last_triggered_at` | TIMESTAMPTZ | No | NULL | — | Last trigger | Internal |
| `trigger_count_today` | INTEGER | Yes | `0` | ≥ 0 | Today | Internal |
| `trigger_count_total` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `is_kill_switch_active` | BOOLEAN | Yes | `false` | — | Temporarily disabled | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 645 — Broadcast Message

### 1. Business Purpose
Per Part 14 §5: Supports Company, Department, Branch, Role, Individual. Broadcast messaging.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `broadcast_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `broadcast_title` | VARCHAR(200) | Yes | — | Min 3 | Title | Internal |
| `broadcast_message` | TEXT | Yes | — | Min 10 | Message | Confidential |
| `broadcast_type` | ENUM | Yes | — | ANNOUNCEMENT, ALERT, NOTICE, EMERGENCY, MAINTENANCE, POLICY_UPDATE, SYSTEM | Type | Internal |
| `target_scope` | ENUM | Yes | — | COMPANY, DEPARTMENT, BRANCH, ROLE, INDIVIDUAL, ALL_EMPLOYEES, CUSTOM_GROUP | Scope (per Part 14) | Internal |
| `target_company_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Companies | Internal |
| `target_branch_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Branches | Internal |
| `target_department_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Departments | Internal |
| `target_role_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `target_user_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Specific users | Confidential |
| `channels` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | EMAIL, SMS, PUSH, WHATSAPP, IN_APP, SLACK, TEAMS | Channels | Internal |
| `notification_template_id` | UUID | Yes | — | FK to `notification_template` (Entity 641) | Template | Internal |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT, CRITICAL | Priority | Internal |
| `scheduled_at` | TIMESTAMPTZ | No | NULL | — | Scheduled | Internal |
| `sent_at` | TIMESTAMPTZ | No | NULL | — | Sent | Internal |
| `sent_by` | UUID | Yes | — | FK to `identity_master` | Sender | Confidential |
| `approval_required` | BOOLEAN | Yes | `true` | — | Approval needed | Internal |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `total_recipients_count` | INTEGER | Yes | `0` | ≥ 0 | Recipients | Internal |
| `delivered_count` | INTEGER | Yes | `0` | ≥ 0 | Delivered | Internal |
| `failed_count` | INTEGER | Yes | `0` | ≥ 0 | Failed | Internal |
| `read_count` | INTEGER | Yes | `0` | ≥ 0 | Read | Internal |
| `acknowledged_count` | INTEGER | Yes | `0` | ≥ 0 | Acknowledged | Internal |
| `expiry_at` | TIMESTAMPTZ | No | NULL | — | Expiry | Internal |
| `acknowledgement_required` | BOOLEAN | Yes | `false` | — | Must acknowledge | Internal |
| `attachment_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Attachments | Confidential |
| `current_status` | ENUM | Yes | `DRAFT` | DRAFT, PENDING_APPROVAL, APPROVED, SCHEDULED, SENT, PARTIALLY_SENT, FAILED, CANCELLED, EXPIRED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 646 — Reminder Engine

### 1. Business Purpose
Per Part 14 §5: Supports Due Date, Recurring, Escalation, Follow-up. Automated reminder system.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `reminder_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `reminder_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `reminder_type` | ENUM | Yes | — | DUE_DATE, RECURRING, ESCALATION, FOLLOW_UP, NUDGE, EXPIRY_WARNING | Type (per Part 14) | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `applicable_entity_type` | VARCHAR(100) | Yes | — | — | Entity type | Internal |
| `trigger_event` | VARCHAR(200) | Yes | — | — | Trigger | Internal |
| `reminder_schedule` | JSONB | Yes | `'[]'` | — | [{ offset_hours, template_id, channels }] | Internal |
| `first_reminder_offset_hours` | DECIMAL(7,2) | Yes | — | — | First reminder | Internal |
| `reminder_frequency_hours` | DECIMAL(7,2) | No | NULL | > 0 | Repeat frequency | Internal |
| `max_reminders` | INTEGER | Yes | `3` | ≥ 1 | Max reminders | Internal |
| `escalation_after_reminders` | INTEGER | Yes | `3` | ≥ 1 | Escalate after | Internal |
| `escalation_rule_id` | UUID | No | NULL | FK to `escalation_rule` (Entity 636) | Escalation | Internal |
| `recipient_resolution_method` | ENUM | Yes | `ASSIGNEE` | ASSIGNEE, ROLE_BASED, DEPARTMENT_BASED, CUSTOM | Method | Confidential |
| `notification_template_id` | UUID | Yes | — | FK to `notification_template` (Entity 641) | Template | Internal |
| `notification_channels` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Channels | Internal |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT | Priority | Internal |
| `stop_on_action` | BOOLEAN | Yes | `true` | — | Stop when action taken | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `trigger_count_today` | INTEGER | Yes | `0` | ≥ 0 | Today | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 647 — Delivery Tracking

### 1. Business Purpose
Per Part 14 §5: Tracks Sent, Delivered, Read, Clicked, Failed. Notification delivery tracking.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `notification_queue_id` | UUID | Yes | — | FK to `notification_queue` (Entity 643) | Source | Internal |
| `tracking_id` | VARCHAR(100) | Yes | — | Unique | Tracking ID | Internal |
| `channel_type` | ENUM | Yes | — | EMAIL, SMS, PUSH, WHATSAPP, IN_APP, VOICE | Channel | Internal |
| `recipient_identity_id` | UUID | Yes | — | FK to `identity_master` | Recipient | Confidential |
| `recipient_address` | VARCHAR(500) | Yes | — | — | Address | Confidential |
| `sent_at` | TIMESTAMPTZ | Yes | `now()` | — | Sent (per Part 14) | Internal |
| `delivered_at` | TIMESTAMPTZ | No | NULL | — | Delivered (per Part 14) | Internal |
| `delivery_duration_ms` | INTEGER | No | NULL | ≥ 0 | Duration | Internal |
| `read_at` | TIMESTAMPTZ | No | NULL | — | Read (per Part 14) | Internal |
| `read_duration_ms` | INTEGER | No | NULL | ≥ 0 | Time to read | Internal |
| `clicked_at` | TIMESTAMPTZ | No | NULL | — | Clicked (per Part 14) | Internal |
| `clicked_url` | VARCHAR(500) | No | NULL | — | URL clicked | Internal |
| `click_count` | INTEGER | Yes | `0` | ≥ 0 | Clicks | Internal |
| `acknowledged_at` | TIMESTAMPTZ | No | NULL | — | Acknowledged | Internal |
| `failed_at` | TIMESTAMPTZ | No | NULL | — | Failed (per Part 14) | Internal |
| `failure_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `failure_code` | VARCHAR(50) | No | NULL | — | Code | Internal |
| `bounced_at` | TIMESTAMPTZ | No | NULL | — | Bounced | Internal |
| `bounce_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `bounce_type` | ENUM | No | NULL | HARD_BOUNCE, SOFT_BOUNCE, COMPLAINT, BLOCKED | Type | Internal |
| `unsubscribed_at` | TIMESTAMPTZ | No | NULL | — | Unsubscribed | Internal |
| `marked_spam_at` | TIMESTAMPTZ | No | NULL | — | Marked spam | Internal |
| `provider_message_id` | VARCHAR(200) | No | NULL | — | Provider ID | Confidential |
| `provider_events` | JSONB | Yes | `'[]'` | — | Provider webhook events | Confidential |
| `device_type` | VARCHAR(50) | No | NULL | — | Device (email opened on) | Internal |
| `client_type` | VARCHAR(50) | No | NULL | — | Email client | Internal |
| `geolocation` | JSONB | No | NULL | — | Open/click location | Confidential |
| `current_status` | ENUM | Yes | `SENT` | SENT, DELIVERED, READ, CLICKED, ACKNOWLEDGED, FAILED, BOUNCED, UNSUBSCRIBED, SPAM | Status (per Part 14) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 648 — Notification Preference

### 1. Business Purpose
Per Part 14 §5: Stores Preferred Channel, Quiet Hours, Language, Priority. Per-user notification preferences.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `identity_id` | UUID | Yes | — | FK to `identity_master` | User | Confidential |
| `preferred_channel_order` | TEXT[] | Yes | `ARRAY['IN_APP','EMAIL','PUSH','SMS']` | — | Preferred Channel (per Part 14) priority | Internal |
| `email_enabled` | BOOLEAN | Yes | `true` | — | Email | Internal |
| `sms_enabled` | BOOLEAN | Yes | `true` | — | SMS | Internal |
| `push_enabled` | BOOLEAN | Yes | `true` | — | Push | Internal |
| `whatsapp_enabled` | BOOLEAN | Yes | `true` | — | WhatsApp | Internal |
| `in_app_enabled` | BOOLEAN | Yes | `true` | — | In-app | Internal |
| `voice_enabled` | BOOLEAN | Yes | `false` | — | Voice | Internal |
| `quiet_hours_enabled` | BOOLEAN | Yes | `false` | — | Quiet Hours (per Part 14) | Internal |
| `quiet_hours_start` | TIME | No | NULL | — | Start | Internal |
| `quiet_hours_end` | TIME | No | NULL | — | End | Internal |
| `quiet_hours_timezone` | VARCHAR(50) | No | NULL | — | Timezone | Internal |
| `quiet_hours_days` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Days | Internal |
| `do_not_disturb_enabled` | BOOLEAN | Yes | `false` | — | DND | Internal |
| `dnd_until` | TIMESTAMPTZ | No | NULL | — | DND until | Internal |
| `language` | VARCHAR(10) | Yes | `en-IN` | — | Language (per Part 14) | Internal |
| `priority_filter` | ENUM | Yes | `ALL` | ALL, HIGH_AND_ABOVE, URGENT_ONLY | Priority filter (per Part 14) | Internal |
| `category_preferences` | JSONB | Yes | `'{}'` | — | Per-category prefs | Internal |
| `module_preferences` | JSONB | Yes | `'{}'` | — | Per-module prefs | Internal |
| `digest_mode_enabled` | BOOLEAN | Yes | `false` | — | Daily digest | Internal |
| `digest_frequency` | ENUM | Yes | `DAILY` | HOURLY, DAILY, WEEKLY | Frequency | Internal |
| `digest_time` | TIME | No | NULL | — | Digest time | Internal |
| `emergency_override` | BOOLEAN | Yes | `true` | — | Emergency alerts bypass | Internal |
| `security_override` | BOOLEAN | Yes | `true` | — | Security alerts bypass | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 649 — Communication History

### 1. Business Purpose
Per Part 14 §5: Stores Every Communication, Recipient, Channel, Timestamp, Status. Immutable communication log.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `history_code` | VARCHAR(40) | Yes | — | Unique | Code | Internal |
| `identity_id` | UUID | Yes | — | FK to `identity_master` | Recipient (per Part 14) | Confidential |
| `recipient_address` | VARCHAR(500) | Yes | — | — | Address | Confidential |
| `channel_type` | ENUM | Yes | — | EMAIL, SMS, PUSH, WHATSAPP, IN_APP, VOICE, SLACK, TEAMS | Channel (per Part 14) | Internal |
| `notification_template_id` | UUID | No | NULL | FK to `notification_template` | Template | Internal |
| `subject` | VARCHAR(500) | No | NULL | — | Subject | Internal |
| `body_content` | TEXT | Yes | — | — | Body | Confidential |
| `communication_type` | ENUM | Yes | — | NOTIFICATION, ALERT, REMINDER, BROADCAST, TRANSACTIONAL, MARKETING, SECURITY | Type | Internal |
| `business_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `business_event` | VARCHAR(200) | No | NULL | — | Event | Internal |
| `applicable_entity_type` | VARCHAR(100) | No | NULL | — | Entity type | Internal |
| `applicable_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `notification_queue_id` | UUID | No | NULL | FK to `notification_queue` | Source | Internal |
| `delivery_tracking_id` | UUID | No | NULL | FK to `delivery_tracking` | Tracking | Internal |
| `sent_at` | TIMESTAMPTZ | Yes | `now()` | — | Timestamp (per Part 14) | Internal |
| `delivered_at` | TIMESTAMPTZ | No | NULL | — | Delivered | Internal |
| `read_at` | TIMESTAMPTZ | No | NULL | — | Read | Internal |
| `delivery_status` | ENUM | Yes | `SENT` | SENT, DELIVERED, READ, FAILED, BOUNCED | Status (per Part 14) | Internal |
| `priority` | ENUM | Yes | `NORMAL` | LOW, NORMAL, HIGH, URGENT | Priority | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `retention_until` | DATE | Yes | — | — | Retention | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 650 — Notification Dashboard

### 1. Business Purpose
Per Part 14 §5: Displays Queued, Delivered, Failed, Alerts, Broadcasts, Read Rate. AI: Smart Channel Selection, Delivery Optimization, Alert Prioritization, Duplicate Alert Detection.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | COMPANY, ENTERPRISE | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `queued_count` | INTEGER | Yes | `0` | ≥ 0 | Queued (per Part 14) | Internal |
| `processing_count` | INTEGER | Yes | `0` | ≥ 0 | Processing | Internal |
| `delivered_today_count` | INTEGER | Yes | `0` | ≥ 0 | Delivered (per Part 14) today | Internal |
| `failed_today_count` | INTEGER | Yes | `0` | ≥ 0 | Failed (per Part 14) today | Internal |
| `delivery_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success rate | Internal |
| `delivered_by_channel` | JSONB | Yes | `'{}'` | — | By channel | Internal |
| `failed_by_channel` | JSONB | Yes | `'{}'` | — | By channel | Internal |
| `delivery_trend_7d` | JSONB | Yes | `'[]'` | — | Trend | Internal |
| `active_alerts_count` | INTEGER | Yes | `0` | ≥ 0 | Alerts (per Part 14) | Internal |
| `alerts_by_severity` | JSONB | Yes | `'{}'` | — | By severity | Internal |
| `alerts_by_module` | JSONB | Yes | `'{}'` | — | By module | Internal |
| `broadcasts_today_count` | INTEGER | Yes | `0` | ≥ 0 | Broadcasts (per Part 14) today | Internal |
| `broadcasts_active_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `total_sent_today` | BIGINT | Yes | `0` | ≥ 0 | Total today | Internal |
| `total_sent_mtd` | BIGINT | Yes | `0` | ≥ 0 | MTD | Internal |
| `read_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Read Rate (per Part 14) | Internal |
| `click_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Click rate | Internal |
| `acknowledgement_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Ack rate | Internal |
| `bounce_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Bounce rate | Internal |
| `unsubscribe_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Unsubscribe rate | Internal |
| `avg_delivery_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Avg time | Internal |
| `avg_time_to_read_ms` | INTEGER | Yes | `0` | ≥ 0 | Avg read time | Internal |
| `notification_cost_today` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `notification_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | MTD cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `ai_smart_channel_selection` | JSONB | No | NULL | — | AI: Smart Channel Selection (per Part 14 AI) | Confidential |
| `ai_delivery_optimization` | JSONB | No | NULL | — | AI: Delivery Optimization (per Part 14 AI) | Confidential |
| `ai_alert_prioritization` | JSONB | No | NULL | — | AI: Alert Prioritization (per Part 14 AI) | Confidential |
| `ai_duplicate_alert_detection` | JSONB | No | NULL | — | AI: Duplicate Alert Detection (per Part 14 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 6: Enterprise Document Management, File Storage & Digital Records (Entities 651-660)

## Entity 651 — Document Master

### 1. Business Purpose
Per Part 14 §6: Stores Document ID, Name, Type, Module, Owner, Status. Master record for all enterprise documents.

### 2. Architectural Role
Master entity — the **Document Engine (FS-11)** core. Per Vol 0: "Every enterprise document should exist only once."

### 3. Business Rules
- One document = one logical file (even if multiple versions)
- Document types: per business module (Invoice, PO, WO, Employee Doc, Asset Manual, Quality Report, Contract, Drawing, Certificate, etc.)
- Document ownership: per user, department, or entity (asset, employee, vendor)
- Document lifecycle: DRAFT → ACTIVE → ARCHIVED → DELETED
- Deletion: soft-delete only; physical delete after retention period
- Every document linked to at least one business entity

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `document_id` | VARCHAR(50) | Yes | — | Unique per company | Document ID (per Part 14) | Internal |
| `document_name` | VARCHAR(500) | Yes | — | Min 3 | Name (per Part 14) | Internal |
| `document_title` | VARCHAR(500) | No | NULL | — | Title (longer) | Internal |
| `document_description` | TEXT | No | NULL | — | Description | Internal |
| `category_id` | UUID | Yes | — | FK to `document_category` (Entity 652) | Category | Internal |
| `document_type` | ENUM | Yes | — | INVOICE, PURCHASE_ORDER, WORK_ORDER, EMPLOYEE_DOCUMENT, ASSET_MANUAL, QUALITY_REPORT, CONTRACT, DRAWING, CERTIFICATE, POLICY, REPORT, RECEIPT, BANK_STATEMENT, TAX_DOCUMENT, OTHER | Type (per Part 14) | Internal |
| `business_module` | ENUM | Yes | — | INVENTORY, PROCUREMENT, WAREHOUSE, MANUFACTURING, RETAIL, RESTAURANT, FINANCE, HR, EAM, QUALITY, PLATFORM, ALL | Module (per Part 14) | Internal |
| `file_format` | VARCHAR(20) | Yes | — | — | PDF, DOCX, XLSX, JPG, PNG, etc. | Internal |
| `file_extension` | VARCHAR(10) | Yes | — | — | Extension | Internal |
| `mime_type` | VARCHAR(100) | Yes | — | — | MIME | Internal |
| `current_version_number` | VARCHAR(20) | Yes | `1.0` | — | Current version | Internal |
| `current_file_version_id` | UUID | Yes | — | FK to `file_version` (Entity 653) | Current version | Internal |
| `total_versions_count` | INTEGER | Yes | `1` | ≥ 1 | Versions | Internal |
| `total_size_bytes` | BIGINT | Yes | — | > 0 | Total size (all versions) | Internal |
| `current_size_bytes` | BIGINT | Yes | — | > 0 | Current version size | Internal |
| `checksum_current` | VARCHAR(64) | Yes | — | SHA-256 | Checksum | Internal |
| `owner_identity_id` | UUID | Yes | — | FK to `identity_master` | Owner (per Part 14) | Confidential |
| `owner_department_id` | UUID | No | NULL | FK to `departments` | Owning dept | Internal |
| `applicable_entity_type` | VARCHAR(100) | No | NULL | — | Linked entity type | Internal |
| `applicable_entity_id` | UUID | No | NULL | — | Linked entity ID | Internal |
| `applicable_entity_code` | VARCHAR(50) | No | NULL | — | Display code | Internal |
| `classification` | ENUM | Yes | `INTERNAL` | PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED, TOP_SECRET | Classification | Confidential |
| `sensitivity_level` | INTEGER | Yes | `1` | 1-5 | Sensitivity | Confidential |
| `pii_data` | BOOLEAN | Yes | `false` | — | Contains PII | Confidential |
| `pci_data` | BOOLEAN | Yes | `false` | — | Contains PCI | Confidential |
| `phi_data` | BOOLEAN | Yes | `false` | — | Contains PHI | Confidential |
| `encryption_required` | BOOLEAN | Yes | `true` | — | Must be encrypted | Internal |
| `encryption_status` | ENUM | Yes | `ENCRYPTED` | UNENCRYPTED, ENCRYPTED, ENCRYPTED_AT_REST, ENCRYPTED_END_TO_END | Status | Internal |
| `encryption_key_id` | UUID | No | NULL | FK to `security_keys` | Key | Restricted |
| `virus_scan_status` | ENUM | Yes | `PENDING` | PENDING, CLEAN, INFECTED, SCAN_FAILED | Scan status | Confidential |
| `virus_scan_at` | TIMESTAMPTZ | No | NULL | — | Scan time | Internal |
| `virus_threat_name` | VARCHAR(200) | No | NULL | — | If infected | Restricted |
| `digital_signature_count` | INTEGER | Yes | `0` | ≥ 0 | Signatures | Internal |
| `is_signed` | BOOLEAN | Yes | `false` | — | Has signature | Internal |
| `is_ocred` | BOOLEAN | Yes | `false` | — | OCR processed | Internal |
| `ocr_text_extracted` | TEXT | No | NULL | — | Extracted text | Confidential |
| `ocr_confidence_pct` | DECIMAL(5,2) | No | NULL | 0-100 | OCR confidence | Internal |
| `retention_policy_id` | UUID | Yes | — | FK to `file_retention_policy` (Entity 657) | Retention | Internal |
| `retention_until` | DATE | Yes | — | — | Retention expiry | Internal |
| `legal_hold` | BOOLEAN | Yes | `false` | — | Legal hold | Confidential |
| `legal_hold_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `legal_hold_until` | DATE | No | NULL | — | Hold until | Internal |
| `share_count` | INTEGER | Yes | `0` | ≥ 0 | Active shares | Internal |
| `download_count` | BIGINT | Yes | `0` | ≥ 0 | Total downloads | Internal |
| `view_count` | BIGINT | Yes | `0` | ≥ 0 | Total views | Internal |
| `created_at` | TIMESTAMPTZ | Yes | `now()` | — | Creation | Internal |
| `last_modified_at` | TIMESTAMPTZ | Yes | `now()` | — | Last modification | Internal |
| `last_accessed_at` | TIMESTAMPTZ | No | NULL | — | Last access | Internal |
| `archived_at` | TIMESTAMPTZ | No | NULL | — | Archive | Internal |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft delete | Internal |
| `deleted_by` | UUID | No | NULL | FK to `identity_master` | Deleter | Confidential |
| `deletion_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `branch_id` | UUID | No | NULL | FK to `branch_master` | Branch | Internal |
| `current_status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, ARCHIVED, DELETED, QUARANTINED | Status (per Part 14) | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Document Category (652) | Many-to-One | N:1 | Category |
| File Version (653) | One-to-Many | 1:N | Versions |
| Metadata Index (654) | One-to-Many | 1:N | Metadata |
| Digital Signature (655) | One-to-Many | 1:N | Signatures |
| File Retention Policy (657) | Many-to-One | N:1 | Retention |

### 6. Indexes
- UNIQUE (`document_id`)
- INDEX (`business_module`, `document_type`, `current_status`)
- INDEX (`owner_identity_id`, `current_status`)
- INDEX (`applicable_entity_type`, `applicable_entity_id`)
- INDEX (`classification`, `current_status`)
- INDEX (`retention_until`)
- INDEX (`legal_hold`)
- INDEX (`checksum_current`)

### 7. Security Classification
**Confidential** — classification varies; PII/PCI/PHI fields are **Restricted**.

### 8. Integration Points
- **Document Engine** (FS-11): Primary consumer
- **Unified Automation Engine** (FS-52, Q190): Auto-document generation
- **Search Engine** (FS-48): Full-text search
- **OCR Service**: Text extraction
- **Virus Scan Service**: Malware detection
- **All Business Modules**: Document attachment

### 9. Sample Data
```json
{
  "document_id": "DOC-PO-2026-001248", "document_name": "PO-MUM-2026-001248.pdf",
  "document_title": "Purchase Order - Hindustan Engineers - Mixer Spares",
  "document_type": "PURCHASE_ORDER", "business_module": "PROCUREMENT",
  "file_format": "PDF", "file_extension": "pdf", "mime_type": "application/pdf",
  "current_version_number": "1.0", "total_versions_count": 1,
  "current_size_bytes": 250000, "checksum_current": "abc123...",
  "owner_identity_id": "id-100", "applicable_entity_type": "purchase_order",
  "applicable_entity_id": "po-001", "applicable_entity_code": "PO-MUM-2026-001248",
  "classification": "INTERNAL", "encryption_status": "ENCRYPTED_AT_REST",
  "virus_scan_status": "CLEAN", "is_ocred": true,
  "ocr_confidence_pct": 95.50, "current_status": "ACTIVE"
}
```

### 10. Audit Events
`DOCUMENT_CREATED`, `DOCUMENT_VERSION_UPLOADED`, `DOCUMENT_ACCESSED`, `DOCUMENT_DOWNLOADED`, `DOCUMENT_SHARED`, `DOCUMENT_ARCHIVED`, `DOCUMENT_DELETED`, `DOCUMENT_RESTORED`, `DOCUMENT_QUARANTINED`, `DOCUMENT_VIRUS_DETECTED`, `DOCUMENT_OCR_PROCESSED`, `DOCUMENT_DIGITALLY_SIGNED`, `DOCUMENT_LEGAL_HOLD_PLACED`, `DOCUMENT_LEGAL_HOLD_RELEASED`

---

## Entity 652 — Document Category

### 1. Business Purpose
Per Part 14 §6: Examples — Invoice, Purchase Order, Work Order, Employee Document, Asset Manual, Quality Report, Contract, Drawing, Certificate. Document taxonomy.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `category_code` | VARCHAR(30) | Yes | — | Unique per company | Code | Internal |
| `category_name` | VARCHAR(100) | Yes | — | Min 3 | Display name | Internal |
| `parent_category_id` | UUID | No | NULL | FK to `document_category` (self) | Parent | Internal |
| `category_type` | ENUM | Yes | — | INVOICE, PURCHASE_ORDER, WORK_ORDER, EMPLOYEE_DOCUMENT, ASSET_MANUAL, QUALITY_REPORT, CONTRACT, DRAWING, CERTIFICATE, POLICY, REPORT, RECEIPT, BANK_STATEMENT, TAX_DOCUMENT, OTHER | Type (per Part 14) | Internal |
| `business_module` | ENUM | Yes | — | INVENTORY, PROCUREMENT, WAREHOUSE, MANUFACTURING, RETAIL, RESTAURANT, FINANCE, HR, EAM, QUALITY, PLATFORM, ALL | Module | Internal |
| `description` | TEXT | No | NULL | — | Description | Internal |
| `default_classification` | ENUM | Yes | `INTERNAL` | PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED | Default | Confidential |
| `default_retention_days` | INTEGER | Yes | `2555` | ≥ 30 | Default retention (7 years) | Internal |
| `requires_approval` | BOOLEAN | Yes | `false` | — | Approval needed | Internal |
| `requires_digital_signature` | BOOLEAN | Yes | `false` | — | Signature needed | Internal |
| `requires_ocr` | BOOLEAN | Yes | `false` | — | OCR needed | Internal |
| `requires_virus_scan` | BOOLEAN | Yes | `true` | — | Virus scan | Internal |
| `allowed_file_formats` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Allowed formats | Internal |
| `max_file_size_mb` | INTEGER | Yes | `50` | ≥ 1 | Max size | Internal |
| `watermark_required` | BOOLEAN | Yes | `false` | — | Watermark | Internal |
| `watermark_text` | VARCHAR(200) | No | NULL | — | Text | Internal |
| `default_access_roles` | UUID[] | No | `ARRAY[]::UUID[]` | — | Default access | Confidential |
| `gl_account_code` | VARCHAR(30) | No | NULL | FK to `gl_accounts` | GL (if applicable) | Confidential |
| `hierarchy_level` | INTEGER | Yes | `1` | ≥ 1 | Level | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 653 — File Version

### 1. Business Purpose
Per Part 14 §6: Tracks Version, Uploaded By, Upload Date, Changes, Checksum. Document version history.

### 2. Architectural Role
Version entity — each document upload creates a new version. Enables audit trail and rollback.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `document_master_id` | UUID | Yes | — | FK to `document_master` (Entity 651) | Parent document | Internal |
| `version_number` | VARCHAR(20) | Yes | — | — | Version (per Part 14) | Internal |
| `version_sequence` | INTEGER | Yes | — | ≥ 1 | Sequence | Internal |
| `is_current_version` | BOOLEAN | Yes | `false` | — | Current | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `file_version` (self) | Previous | Internal |
| `file_name` | VARCHAR(500) | Yes | — | — | File name | Internal |
| `file_format` | VARCHAR(20) | Yes | — | — | Format | Internal |
| `file_extension` | VARCHAR(10) | Yes | — | — | Extension | Internal |
| `mime_type` | VARCHAR(100) | Yes | — | — | MIME | Internal |
| `file_size_bytes` | BIGINT | Yes | — | > 0 | Size | Internal |
| `checksum_sha256` | VARCHAR(64) | Yes | — | SHA-256 | Checksum (per Part 14) | Internal |
| `checksum_md5` | VARCHAR(32) | No | NULL | — | MD5 (legacy) | Internal |
| `storage_provider` | ENUM | Yes | `S3` | S3, AZURE_BLOB, GCP_STORAGE, LOCAL, FILE_SYSTEM | Provider | Internal |
| `storage_bucket` | VARCHAR(200) | No | NULL | — | Bucket | Confidential |
| `storage_key` | VARCHAR(500) | Yes | — | — | Storage key | Confidential |
| `storage_url` | VARCHAR(1000) | No | NULL | — | URL (pre-signed) | Confidential |
| `storage_url_expires_at` | TIMESTAMPTZ | No | NULL | — | URL expiry | Internal |
| `thumbnail_url` | VARCHAR(1000) | No | NULL | — | Thumbnail | Internal |
| `preview_url` | VARCHAR(1000) | No | NULL | — | Preview | Internal |
| `encryption_status` | ENUM | Yes | `ENCRYPTED` | UNENCRYPTED, ENCRYPTED, ENCRYPTED_AT_REST | Status | Internal |
| `encryption_key_id` | UUID | No | NULL | FK to `security_keys` | Key | Restricted |
| `virus_scan_status` | ENUM | Yes | `PENDING` | PENDING, CLEAN, INFECTED, SCAN_FAILED | Scan | Confidential |
| `virus_scan_at` | TIMESTAMPTZ | No | NULL | — | Scan time | Internal |
| `ocr_processed` | BOOLEAN | Yes | `false` | — | OCR done | Internal |
| `ocr_text` | TEXT | No | NULL | — | Extracted text | Confidential |
| `ocr_confidence_pct` | DECIMAL(5,2) | No | NULL | 0-100 | Confidence | Internal |
| `changes_description` | TEXT | No | NULL | — | Changes (per Part 14) | Confidential |
| `change_summary` | TEXT | No | NULL | — | Brief summary | Internal |
| `uploaded_by` | UUID | Yes | — | FK to `identity_master` | Uploaded By (per Part 14) | Confidential |
| `uploaded_at` | TIMESTAMPTZ | Yes | `now()` | — | Upload Date (per Part 14) | Internal |
| `upload_source` | ENUM | Yes | — | WEB_UPLOAD, API_UPLOAD, EMAIL_ATTACHMENT, MOBILE_UPLOAD, AUTOMATED_GENERATION, MIGRATION | Source | Internal |
| `upload_ip` | INET | No | NULL | — | Source IP | Confidential |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `rejection_reason` | TEXT | No | NULL | — | If rejected | Confidential |
| `download_count` | BIGINT | Yes | `0` | ≥ 0 | Downloads | Internal |
| `view_count` | BIGINT | Yes | `0` | ≥ 0 | Views | Internal |
| `status` | ENUM | Yes | `ACTIVE` | PENDING_APPROVAL, ACTIVE, REJECTED, ARCHIVED, DELETED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 654 — Metadata Index

### 1. Business Purpose
Per Part 14 §6: Stores Tags, Keywords, Department, Asset, Employee, Vendor, Customer. Document metadata for search.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `document_master_id` | UUID | Yes | — | FK to `document_master` (Entity 651) | Document | Internal |
| `file_version_id` | UUID | No | NULL | FK to `file_version` (Entity 653) | Specific version | Internal |
| `tags` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Tags (per Part 14) | Internal |
| `keywords` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Keywords (per Part 14) | Internal |
| `department_id` | UUID | No | NULL | FK to `departments` | Department (per Part 14) | Internal |
| `asset_id` | UUID | No | NULL | FK to `asset_master` | Asset (per Part 14) | Internal |
| `employee_id` | UUID | No | NULL | FK to `workforce_master` | Employee (per Part 14) | Confidential |
| `vendor_id` | UUID | No | NULL | FK to `vendors` | Vendor (per Part 14) | Internal |
| `customer_id` | UUID | No | NULL | FK to `customers` | Customer (per Part 14) | Confidential |
| `project_id` | UUID | No | NULL | FK to `projects` | Project | Internal |
| `facility_id` | UUID | No | NULL | FK to `facilities` | Facility | Internal |
| `cost_center_id` | UUID | No | NULL | FK to `cost_centers` | Cost center | Confidential |
| `gl_account_code` | VARCHAR(30) | No | NULL | — | GL account | Confidential |
| `invoice_number` | VARCHAR(50) | No | NULL | — | Invoice # | Confidential |
| `po_number` | VARCHAR(50) | No | NULL | — | PO # | Internal |
| `work_order_number` | VARCHAR(50) | No | NULL | — | WO # | Internal |
| `employee_id_number` | VARCHAR(50) | No | NULL | — | Employee ID | Confidential |
| `asset_code` | VARCHAR(50) | No | NULL | — | Asset code | Internal |
| `barcode_value` | VARCHAR(100) | No | NULL | — | Barcode | Internal |
| `qr_code_value` | VARCHAR(100) | No | NULL | — | QR code | Internal |
| `amount` | DECIMAL(18,4) | No | NULL | — | Document amount | Confidential |
| `currency_code` | CHAR(3) | No | NULL | — | Currency | Internal |
| `document_date` | DATE | No | NULL | — | Document date | Internal |
| `effective_date` | DATE | No | NULL | — | Effective | Internal |
| `expiry_date` | DATE | No | NULL | — | Expiry | Internal |
| `custom_attributes` | JSONB | Yes | `'{}'` | — | Custom metadata | Internal |
| `search_text` | TEXT | Yes | — | — | Concatenated searchable text | Internal |
| `search_vector` | TSVECTOR | Yes | — | — | PostgreSQL full-text vector | Internal |
| `indexed_at` | TIMESTAMPTZ | Yes | `now()` | — | Last index | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 655 — Digital Signature

### 1. Business Purpose
Per Part 14 §6: Supports Approval, Certificate, Hash, Timestamp, Verifier. Digital signature management.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `signature_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `document_master_id` | UUID | Yes | — | FK to `document_master` (Entity 651) | Document | Internal |
| `file_version_id` | UUID | Yes | — | FK to `file_version` (Entity 653) | Version signed | Internal |
| `signature_type` | ENUM | Yes | — | APPROVAL, CERTIFICATE, HASH, TIMESTAMP, VERIFIER, ELECTRONIC, DIGITAL_CERTIFICATE | Type (per Part 14) | Internal |
| `signer_identity_id` | UUID | Yes | — | FK to `identity_master` | Signer | Confidential |
| `signer_name` | VARCHAR(200) | Yes | — | — | Denormalized | Internal |
| `signer_email` | VARCHAR(200) | Yes | — | — | Email | Confidential |
| `signer_role_id` | UUID | No | NULL | FK to `role_master` | Role | Confidential |
| `signature_purpose` | ENUM | Yes | — | APPROVAL, REVIEW, ACKNOWLEDGEMENT, WITNESS, AUTHORIZATION, CERTIFICATION | Purpose | Internal |
| `signature_algorithm` | VARCHAR(50) | Yes | `RSA-2048` | — | Algorithm | Internal |
| `signature_hash_algorithm` | VARCHAR(20) | Yes | `SHA-256` | — | Hash algorithm | Internal |
| `signature_value` | TEXT | Yes | — | — | Signature value (base64) | Restricted |
| `document_hash` | VARCHAR(64) | Yes | — | SHA-256 | Hash (per Part 14) | Internal |
| `document_hash_algorithm` | VARCHAR(20) | Yes | `SHA-256` | — | Algorithm | Internal |
| `certificate_serial_number` | VARCHAR(100) | No | NULL | — | Cert serial (per Part 14) | Confidential |
| `certificate_issuer` | VARCHAR(200) | No | NULL | — | Issuer | Confidential |
| `certificate_subject` | VARCHAR(500) | No | NULL | — | Subject | Confidential |
| `certificate_valid_from` | DATE | No | NULL | — | Valid from | Internal |
| `certificate_valid_until` | DATE | No | NULL | — | Valid until | Internal |
| `certificate_chain` | TEXT | No | NULL | — | Full chain | Restricted |
| `timestamp_authority` | VARCHAR(200) | No | NULL | — | TSA | Confidential |
| `timestamp_value` | TIMESTAMPTZ | No | NULL | — | Timestamp (per Part 14) | Internal |
| `timestamp_token` | TEXT | No | NULL | — | TSA token | Restricted |
| `signature_ip` | INET | Yes | — | — | Source IP | Confidential |
| `signature_user_agent` | TEXT | No | NULL | — | User agent | Confidential |
| `signature_location` | JSONB | No | NULL | — | Geo-location | Confidential |
| `signature_intent` | TEXT | No | NULL | — | "I approve this document" | Confidential |
| `signature_appearance_attachment_id` | UUID | No | NULL | FK to `attachments` | Visual signature | Internal |
| `signature_field_name` | VARCHAR(100) | No | NULL | — | PDF field | Internal |
| `signature_page_number` | INTEGER | No | NULL | ≥ 1 | Page | Internal |
| `signature_coordinates` | JSONB | No | NULL | — | { x, y, width, height } | Internal |
| `verification_status` | ENUM | Yes | `PENDING` | PENDING, VALID, INVALID, EXPIRED, REVOKED, TAMPERED | Status | Confidential |
| `verified_by` | UUID | No | NULL | FK to `identity_master` | Verifier (per Part 14) | Confidential |
| `verified_at` | TIMESTAMPTZ | No | NULL | — | Verification | Internal |
| `verification_details` | JSONB | No | NULL | — | Verification result | Confidential |
| `revoked_at` | TIMESTAMPTZ | No | NULL | — | Revocation | Internal |
| `revocation_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, REVOKED, EXPIRED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 656 — OCR Processing

### 1. Business Purpose
Per Part 14 §6: Extracts Invoice Number, Vendor, Employee ID, Asset Code, Barcode, QR Code. OCR data extraction.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `ocr_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `document_master_id` | UUID | Yes | — | FK to `document_master` (Entity 651) | Document | Internal |
| `file_version_id` | UUID | Yes | — | FK to `file_version` (Entity 653) | Version | Internal |
| `ocr_engine` | ENUM | Yes | — | TESSERACT, GOOGLE_VISION, AWS_TEXTRACT, AZURE_FORM_RECOGNIZER, ABBYY, CUSTOM | Engine | Internal |
| `ocr_engine_version` | VARCHAR(20) | Yes | — | — | Version | Internal |
| `document_type_hint` | ENUM | No | NULL | INVOICE, RECEIPT, PURCHASE_ORDER, EMPLOYEE_ID, CONTRACT, FORM, GENERIC | Hint | Internal |
| `processing_started_at` | TIMESTAMPTZ | Yes | `now()` | — | Start | Internal |
| `processing_completed_at` | TIMESTAMPTZ | No | NULL | — | Completion | Internal |
| `processing_duration_ms` | INTEGER | No | NULL | ≥ 0 | Duration | Internal |
| `pages_processed` | INTEGER | Yes | `0` | ≥ 0 | Pages | Internal |
| `total_pages` | INTEGER | Yes | `0` | ≥ 0 | Total | Internal |
| `confidence_overall_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Confidence | Internal |
| `extracted_text_raw` | TEXT | No | NULL | — | Raw text | Confidential |
| `extracted_text_cleaned` | TEXT | No | NULL | — | Cleaned | Confidential |
| `extracted_fields` | JSONB | Yes | `'{}'` | — | { field_name: { value, confidence, bbox } } | Confidential |
| `invoice_number` | VARCHAR(100) | No | NULL | — | Invoice Number (per Part 14) | Confidential |
| `invoice_date` | DATE | No | NULL | — | Invoice date | Internal |
| `invoice_amount` | DECIMAL(18,4) | No | NULL | — | Amount | Confidential |
| `vendor_name` | VARCHAR(200) | No | NULL | — | Vendor (per Part 14) | Internal |
| `vendor_gstin` | VARCHAR(20) | No | NULL | — | Vendor GSTIN | Confidential |
| `employee_id_number` | VARCHAR(50) | No | NULL | — | Employee ID (per Part 14) | Confidential |
| `asset_code` | VARCHAR(50) | No | NULL | — | Asset Code (per Part 14) | Internal |
| `barcodes_detected` | JSONB | Yes | `'[]'` | — | [{ value, type, bbox }] | Internal |
| `qr_codes_detected` | JSONB | Yes | `'[]'` | — | QR codes (per Part 14) | Internal |
| `tables_extracted` | JSONB | Yes | `'[]'` | — | Table data | Confidential |
| `key_value_pairs` | JSONB | Yes | `'[]'` | — | [{ key, value, confidence }] | Confidential |
| `handwriting_detected` | BOOLEAN | Yes | `false` | — | Handwriting | Internal |
| `handwriting_text` | TEXT | No | NULL | — | If detected | Confidential |
| `languages_detected` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Languages | Internal |
| `validation_results` | JSONB | No | NULL | — | Field validation | Confidential |
| `auto_classification` | VARCHAR(100) | No | NULL | — | AI suggested type | Internal |
| `auto_classification_confidence` | DECIMAL(5,2) | No | NULL | 0-100 | Confidence | Internal |
| `linked_entity_type` | VARCHAR(100) | No | NULL | — | Auto-linked entity | Internal |
| `linked_entity_id` | UUID | No | NULL | — | Linked ID | Internal |
| `review_required` | BOOLEAN | Yes | `true` | — | Manual review needed | Internal |
| `reviewed_by` | UUID | No | NULL | FK to `identity_master` | Reviewer | Confidential |
| `reviewed_at` | TIMESTAMPTZ | No | NULL | — | Review | Internal |
| `review_notes` | TEXT | No | NULL | — | Notes | Confidential |
| `current_status` | ENUM | Yes | `QUEUED` | QUEUED, PROCESSING, COMPLETED, PARTIALLY_COMPLETED, FAILED, REVIEW_PENDING, REVIEWED, ARCHIVED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 657 — File Retention Policy

### 1. Business Purpose
Per Part 14 §6: Supports Archive, Delete, Legal Hold, Retention Period. Document lifecycle policy.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `policy_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `policy_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `policy_description` | TEXT | No | NULL | — | Description | Internal |
| `applicable_document_types` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Document types | Internal |
| `applicable_modules` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Modules | Internal |
| `applicable_classifications` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Classifications | Internal |
| `retention_period_days` | INTEGER | Yes | `2555` | ≥ 30 | Retention Period (per Part 14) — 7 years default | Internal |
| `retention_trigger_event` | ENUM | Yes | `CREATION_DATE` | CREATION_DATE, LAST_MODIFIED, LAST_ACCESSED, DOCUMENT_DATE, CUSTOM_EVENT | Trigger | Internal |
| `custom_trigger_event` | VARCHAR(200) | No | NULL | — | If custom | Internal |
| `archive_after_days` | INTEGER | No | NULL | ≥ 1 | Archive (per Part 14) — days after creation | Internal |
| `archive_storage_tier` | ENUM | No | NULL | HOT, WARM, COLD, GLACIER | Tier | Internal |
| `delete_after_days` | INTEGER | Yes | `2555` | ≥ 30 | Delete (per Part 14) — days after creation | Internal |
| `deletion_method` | ENUM | Yes | `SOFT_DELETE` | SOFT_DELETE, HARD_DELETE, CRYPTO_SHREDDING | Method | Confidential |
| `legal_hold_supported` | BOOLEAN | Yes | `true` | — | Legal Hold (per Part 14) supported | Internal |
| `legal_hold_override_deletion` | BOOLEAN | Yes | `true` | — | Hold prevents deletion | Internal |
| `compliance_regulations` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Applicable regulations | Internal |
| `audit_retention_days` | INTEGER | Yes | `3650` | ≥ 30 | Audit log retention (10 years) | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `applicable_branch_id` | UUID | No | NULL | FK to `branch_master` | NULL = all | Internal |
| `priority` | INTEGER | Yes | `100` | 1-999 | Resolution priority | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 658 — Secure File Sharing

### 1. Business Purpose
Per Part 14 §6: Supports Internal, External, Temporary Link, Expiry, Password Protection. Secure document sharing.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `share_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `document_master_id` | UUID | Yes | — | FK to `document_master` (Entity 651) | Document | Internal |
| `file_version_id` | UUID | No | NULL | FK to `file_version` (Entity 653) | Specific version | Internal |
| `share_type` | ENUM | Yes | — | INTERNAL, EXTERNAL, TEMPORARY_LINK, PUBLIC_LINK | Type (per Part 14) | Internal |
| `shared_by` | UUID | Yes | — | FK to `identity_master` | Sharer | Confidential |
| `shared_at` | TIMESTAMPTZ | Yes | `now()` | — | Share time | Internal |
| `recipient_identities` | UUID[] | No | `ARRAY[]::UUID[]` | — | Internal recipients | Confidential |
| `recipient_emails` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | External emails | Confidential |
| `recipient_phones` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | External phones | Confidential |
| `share_url` | VARCHAR(1000) | No | NULL | — | Public link URL | Confidential |
| `share_url_hash` | VARCHAR(100) | Yes | — | — | URL hash (token) | Restricted |
| `password_protected` | BOOLEAN | Yes | `false` | — | Password Protection (per Part 14) | Internal |
| `password_hash` | VARCHAR(500) | No | NULL | — | Argon2id hash | Restricted |
| `expiry_at` | TIMESTAMPTZ | No | NULL | — | Expiry (per Part 14) | Internal |
| `max_access_count` | INTEGER | No | NULL | > 0 | Max accesses | Internal |
| `access_count_current` | INTEGER | Yes | `0` | ≥ 0 | Current | Internal |
| `permissions_granted` | JSONB | Yes | `'{}'` | — | { view, download, print, share, edit } | Confidential |
| `watermark_enabled` | BOOLEAN | Yes | `true` | — | Watermark on view/download | Internal |
| `watermark_text` | VARCHAR(200) | No | NULL | — | Text | Internal |
| `download_allowed` | BOOLEAN | Yes | `true` | — | Can download | Internal |
| `print_allowed` | BOOLEAN | Yes | `false` | — | Can print | Internal |
| `forward_allowed` | BOOLEAN | Yes | `false` | — | Can forward | Internal |
| `screenshot_protected` | BOOLEAN | Yes | `false` | — | Screenshot prevention | Internal |
| `view_only_mode` | BOOLEAN | Yes | `false` | — | View only | Internal |
| `ip_restrictions_enabled` | BOOLEAN | Yes | `false` | — | IP whitelist | Confidential |
| `allowed_ip_ranges` | INET[] | No | `ARRAY[]::INET[]` | — | Ranges | Confidential |
| `geo_restrictions` | JSONB | No | NULL | — | Geo-fence | Confidential |
| `requires_acknowledgement` | BOOLEAN | Yes | `false` | — | Must acknowledge | Internal |
| `access_log_enabled` | BOOLEAN | Yes | `true` | — | Log all access | Internal |
| `revoked_at` | TIMESTAMPTZ | No | NULL | — | Revocation | Internal |
| `revoked_by` | UUID | No | NULL | FK to `identity_master` | Revoker | Confidential |
| `revocation_reason` | TEXT | No | NULL | — | Reason | Confidential |
| `current_status` | ENUM | Yes | `ACTIVE` | ACTIVE, EXPIRED, REVOKED, EXHAUSTED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 659 — Document Audit

### 1. Business Purpose
Per Part 14 §6: Tracks Upload, Download, Edit, Delete, Share, Print. Immutable document access audit.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `audit_code` | VARCHAR(40) | Yes | — | Unique | Code | Internal |
| `document_master_id` | UUID | Yes | — | FK to `document_master` (Entity 651) | Document | Internal |
| `file_version_id` | UUID | No | NULL | FK to `file_version` (Entity 653) | Version | Internal |
| `event_type` | ENUM | Yes | — | UPLOAD, DOWNLOAD, EDIT, DELETE, SHARE, PRINT, VIEW, RESTORE, ARCHIVE, SIGN, OCR, VIRUS_SCAN, SHARE_REVOKE, EXPIRE | Event (per Part 14) | Internal |
| `actor_identity_id` | UUID | No | NULL | FK to `identity_master` | Actor | Confidential |
| `actor_name` | VARCHAR(200) | No | NULL | — | Denormalized | Internal |
| `actor_type` | ENUM | Yes | — | USER, SYSTEM, SERVICE_ACCOUNT, EXTERNAL_USER, AI | Type | Internal |
| `action_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Timestamp | Internal |
| `ip_address` | INET | No | NULL | — | IP | Confidential |
| `user_agent` | TEXT | No | NULL | — | User agent | Confidential |
| `session_id` | UUID | No | NULL | FK to `session_management` | Session | Confidential |
| `device_id` | UUID | No | NULL | FK to `device_registry` | Device | Confidential |
| `geolocation` | JSONB | No | NULL | — | Geo | Confidential |
| `action_details` | JSONB | Yes | `'{}'` | — | Details | Confidential |
| `before_state` | JSONB | No | NULL | — | State before | Confidential |
| `after_state` | JSONB | No | NULL | — | State after | Confidential |
| `share_id` | UUID | No | NULL | FK to `secure_file_sharing` | Share link | Internal |
| `business_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `applicable_entity_type` | VARCHAR(100) | No | NULL | — | Entity type | Internal |
| `applicable_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `correlation_id` | UUID | No | NULL | — | Cross-service | Internal |
| `previous_hash` | VARCHAR(64) | Yes | — | — | Hash of previous | Internal |
| `record_hash` | VARCHAR(64) | Yes | — | SHA-256 | Hash | Internal |
| `retention_until` | DATE | Yes | — | — | Retention | Internal |
| `status` | ENUM | Yes | `RECORDED` | RECORDED, EXPORTED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 660 — Document Dashboard

### 1. Business Purpose
Per Part 14 §6: Displays Storage Usage, Recent Uploads, Version History, Expired Files, OCR Queue. AI: Auto Classification, Document Summarization, Duplicate Detection, OCR Validation, Smart Search.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | — | COMPANY, ENTERPRISE | Grain | Internal |
| `entity_id` | UUID | Yes | — | — | Entity ref | Internal |
| `total_documents_count` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `documents_by_type` | JSONB | Yes | `'{}'` | — | By type | Internal |
| `documents_by_module` | JSONB | Yes | `'{}'` | — | By module | Internal |
| `storage_used_gb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Storage Usage (per Part 14) | Internal |
| `storage_quota_gb` | DECIMAL(10,2) | Yes | `100.00` | ≥ 1 | Quota | Confidential |
| `storage_utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Utilization | Internal |
| `storage_by_tier` | JSONB | Yes | `'{}'` | — | { HOT, WARM, COLD, GLACIER } | Internal |
| `storage_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `storage_cost_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | YTD | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `recent_uploads_today_count` | INTEGER | Yes | `0` | ≥ 0 | Recent Uploads (per Part 14) today | Internal |
| `recent_uploads_today_size_mb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Size | Internal |
| `uploads_trend_30d` | JSONB | Yes | `'[]'` | — | Trend | Internal |
| `version_history_count` | BIGINT | Yes | `0` | ≥ 0 | Version History (per Part 14) total | Internal |
| `avg_versions_per_document` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Avg versions | Internal |
| `expired_files_count` | INTEGER | Yes | `0` | ≥ 0 | Expired Files (per Part 14) | Internal |
| `expiring_soon_count` | INTEGER | Yes | `0` | ≥ 0 | Expiring (90 days) | Internal |
| `legal_hold_count` | INTEGER | Yes | `0` | ≥ 0 | On legal hold | Confidential |
| `ocr_queue_pending_count` | INTEGER | Yes | `0` | ≥ 0 | OCR Queue (per Part 14) | Internal |
| `ocr_queue_processing_count` | INTEGER | Yes | `0` | ≥ 0 | Processing | Internal |
| `ocr_queue_failed_count` | INTEGER | Yes | `0` | ≥ 0 | Failed | Internal |
| `ocr_avg_confidence_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Avg confidence | Internal |
| `virus_scan_pending_count` | INTEGER | Yes | `0` | ≥ 0 | Pending scan | Internal |
| `virus_infected_count` | INTEGER | Yes | `0` | ≥ 0 | Infected | Restricted |
| `active_shares_count` | INTEGER | Yes | `0` | ≥ 0 | Active shares | Internal |
| `external_shares_count` | INTEGER | Yes | `0` | ≥ 0 | External | Confidential |
| `digital_signatures_count` | BIGINT | Yes | `0` | ≥ 0 | Signatures | Internal |
| `pending_signature_requests` | INTEGER | Yes | `0` | ≥ 0 | Pending | Internal |
| `search_queries_today` | INTEGER | Yes | `0` | ≥ 0 | Searches | Internal |
| `search_avg_response_ms` | INTEGER | Yes | `0` | ≥ 0 | Avg response | Internal |
| `ai_auto_classification` | JSONB | No | NULL | — | AI: Auto Classification (per Part 14 AI) | Confidential |
| `ai_document_summarization` | JSONB | No | NULL | — | AI: Document Summarization (per Part 14 AI) | Confidential |
| `ai_duplicate_detection` | JSONB | No | NULL | — | AI: Duplicate Detection (per Part 14 AI) | Confidential |
| `ai_ocr_validation` | JSONB | No | NULL | — | AI: OCR Validation (per Part 14 AI) | Confidential |
| `ai_smart_search` | JSONB | No | NULL | — | AI: Smart Search (per Part 14 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# Part 14 Batch 2 Completion Summary

**All 30 Workflow, Notification & Document Management entities are now defined** at full enterprise-grade depth.

## Architectural Decisions Locked (Part 14 Batch 2)

1. **Unified Enterprise Automation Engine (Q190, FS-52)** — NEW — Single standardized event pipeline above Workflow/Notification/Document Engines
2. **Enterprise Workflow Engine** — No hardcoded workflows, drag-and-drop designer, BPMN-compatible
3. **Multi-Workflow Types** — Sequential, Parallel, Dynamic, Ad-Hoc, Hybrid
4. **Approval Matrix** — Multi-dimensional (Company/Branch/BU/Department/Role/Amount/Document)
5. **Escalation Rules** — Time-based, Priority-based, Manager/Email/SMS escalation
6. **Delegation** — Leave, Temporary, Permanent, Emergency with scope control
7. **SLA Monitoring** — Response, Approval, Completion times with breach tracking
8. **Workflow Audit** — Immutable hash-chained ledger
9. **Task-Driven UX** — Users receive tasks; don't navigate menus (Vol 0 principle)
10. **Enterprise Notification Engine** — Multi-channel, template-driven, retry mechanism
11. **Multi-Channel Support** — Email, SMS, Push, WhatsApp, In-App, Voice, Slack, Teams, Webhook
12. **Alert Rules** — Business event alerts with suppression and severity
13. **Broadcast Messaging** — Company/Department/Branch/Role/Individual scope
14. **Reminder Engine** — Due date, recurring, escalation, follow-up
15. **Delivery Tracking** — Sent/Delivered/Read/Clicked/Failed with bounce handling
16. **Notification Preferences** — Per-user channel priority, quiet hours, language
17. **Communication History** — Immutable communication log
18. **Enterprise Document Engine** — One document = one logical file (no duplicates)
19. **Document Versioning** — Full version history with checksum verification
20. **Metadata Indexing** — Tags, keywords, entity links, full-text search
21. **Digital Signatures** — Multi-type with certificate chains and TSA
22. **OCR Processing** — Multi-engine with field extraction and validation
23. **File Retention Policy** — Archive/Delete/Legal Hold with compliance regulations
24. **Secure File Sharing** — Internal/External with password, expiry, watermark
25. **Document Audit** — Immutable hash-chained access trail
26. **AI Capabilities** — 13 AI capabilities across the three sections

## New Foundation Service Locked

### Unified Enterprise Automation Engine — Foundation Service #52

| Attribute | Value |
|---|---|
| Service ID | FS-52 |
| Architectural Decision | Q190 |
| Status | LOCKED |
| Owner | Enterprise Architect (Platform Kernel team) |
| Position | **ABOVE** Workflow Engine, Notification Engine, Document Engine |
| Consumers | All business modules emit events; never directly invoke sub-engines |
| Capabilities | Standardized event pipeline, centralized routing, automatic document generation, unified retry/monitoring |
| Design Principle | One standardized event pipeline across the ERP |
| Common Pattern | Modern enterprise platform architecture |

## 13 AI Capabilities Locked (Batch 2)

| Section | AI Capabilities |
|---|---|
| Workflow | Suggest Workflow, Detect Bottlenecks, Optimize Approvals, Predict Delays |
| Notification | Smart Channel Selection, Delivery Optimization, Alert Prioritization, Duplicate Alert Detection |
| Document | Auto Classification, Document Summarization, Duplicate Detection, OCR Validation, Smart Search |

## Part 14 Progress Tracker

| Batch | Sections | Entities | Status |
|---|---|---|---|
| Batch 1 | 1-3 (Identity, RBAC, Configuration) | 601-630 | ✅ COMPLETE |
| **Batch 2** | **4-6 (Workflow, Notification, Document)** | **631-660** | **✅ COMPLETE (LOCKED)** |
| Batch 3 | 7-9 (Audit, Search, Barcode/Print) | 661-690 | ⏳ PENDING |

## Cumulative Status

- **Manual 1 cumulative**: 665 entities (Parts 1-14 Batch 2)
- **Foundation Services**: 52 (FS-1 through FS-52) + Platform Kernel (Q189) as meta-architecture
- **Architectural Decisions**: 190 (Q1-Q190)

---

*End of Manual 1 Part 14 Sections 4-6. Next batch: Sections 7-9 (Audit Engine, Activity Logs & Compliance; Search Engine, Global Search & Enterprise Indexing; Barcode, QR Code, RFID & Label Printing Engine).*

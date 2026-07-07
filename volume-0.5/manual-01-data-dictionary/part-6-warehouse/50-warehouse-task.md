# Manual 1 · Part 6 · Entity 50 — Warehouse Task

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 6 — Warehouse Management Domain (WMS) |
| Entity | Warehouse Task (050) |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 5 §5.14, Ch 9 §9.4, Ch 9 §9.7, Part 6 §"Warehouse Task" |
| Last Updated | 2026-07-07 |

---

## 1. Business Purpose

The `WarehouseTask` entity represents **work assigned to warehouse operators** — the task-driven execution layer of WMS. Per Volume 0 Chapter 5 §5.14 (Task-Driven UX Model) and Chapter 9 §9.4 (8-stage task lifecycle), warehouse operators don't navigate menus — they **receive tasks** in their mobile inbox and execute them via barcode scanning.

Per Part 6 Enterprise Warehouse Rules: *"Warehouse tasks are generated through the Workflow Engine"* and *"Every completed task publishes an enterprise event."*

### Task Types (per Part 6)

| Task Type | Description | Trigger |
|---|---|---|
| **RECEIVING** | Receive goods at dock | GRN creation / ASN arrival |
| **PUTAWAY** | Move goods from receiving to storage | GRN QC pass |
| **PICKING** | Pick goods for outbound | Sales order / Transfer / Production issue |
| **PACKING** | Pack picked goods | Picking completion |
| **CYCLE_COUNT** | Count inventory at location | ABC schedule / On-demand |
| **TRANSFER** | Move goods between locations | Transfer order |
| **AUDIT** | Audit specific location/stock | Compliance / Ad-hoc |
| **REPLENISHMENT** | Replenish picking face from reserve | Low stock at picking face |
| **DISPATCH** | Load goods to vehicle | Dispatch order |
| **RETURNS** | Process returns | Return receipt |
| **CROSS_DOCK** | Cross-dock operation | Inbound matching outbound (WMS 2.0) |
| **RESLOT** | Reslotting (move to better location) | AI recommendation (WMS 2.0) |

### Task Lifecycle (8-stage per Ch 9 §9.4, extends Part 6)

```
PENDING → ASSIGNED → ACCEPTED → WORKING → IN_PROGRESS → COMPLETED → VERIFIED → CLOSED
              ↓          ↓          ↓
           CANCELLED  ESCALATED  FAILED (with exception)
```

### 2. Owner

| Owner Type | Identity |
|---|---|
| Business Owner | L2 — Warehouse Head |
| Data Owner | Warehouse Head |
| Technical Owner | Backend Lead — Warehouse Module |
| Security Owner | IT Security Head |
| AI Owner | Enterprise Architect |

### 3. Database Schema

| Attribute | Value |
|---|---|
| Schema | `transactional` |
| Table Name | `warehouse_tasks` |
| Prisma Model | `WarehouseTask` |
| File Location | `prisma/schema/transactional/warehouse/warehouse_task.prisma` |
| **Partitioning** | Monthly by `created_at` (high volume — thousands of tasks/day) |

### 4. Field Dictionary

#### 4.1 Universal Base Fields

| Field | Type | Required | Default | Validation | Description |
|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | `uuid_generate_v7()` | PK | Internal primary key |
| `code` | VARCHAR(30) | Yes | — | Unique per company, Number Series `TASK-` | Task code (e.g., `TASK-2026-000001`) |
| `company_id` | UUID | Yes | — | FK to `companies.id` | Owning company |
| `facility_id` | UUID | Yes | — | FK to `facilities.id` | Facility |
| `warehouse_id` | UUID | Yes | — | FK to `facilities.id` (WAREHOUSE) | Warehouse |
| `status` | ENUM | Yes | `PENDING` | PENDING, ASSIGNED, ACCEPTED, WORKING, IN_PROGRESS, COMPLETED, VERIFIED, CLOSED, CANCELLED, ESCALATED, FAILED | 8-stage lifecycle + special states |
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Yes | `NOW()` | Auto-update | Last modification |
| `created_by` | UUID | Yes | — | FK to `user_accounts.id` | Creator (system or user) |
| `updated_by` | UUID | Yes | — | FK to `user_accounts.id` | Last modifier |
| `deleted_at` | TIMESTAMPTZ | No | NULL | — | Soft-delete (rare) |
| `version` | INTEGER | Yes | `1` | Optimistic concurrency | Increments on each update |

#### 4.2 Task Identity Fields

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `task_number` | VARCHAR(50) | Yes | — | Unique per company, format `TASK-{YEAR}-{SEQ}` | Display number | Public | — |
| `task_type` | ENUM | Yes | — | RECEIVING, PUTAWAY, PICKING, PACKING, CYCLE_COUNT, TRANSFER, AUDIT, REPLENISHMENT, DISPATCH, RETURNS, CROSS_DOCK, RESLOT | Task type (per Part 6) | Internal | — |
| `task_category` | ENUM | Yes | — | INBOUND, OUTBOUND, INTERNAL | High-level category | Internal | — |
| `task_origin` | ENUM | Yes | `SYSTEM` | MANUAL, SYSTEM, WORKFLOW, AI_RECOMMENDED, SCHEDULED | How task was created | Internal | — |
| `priority` | ENUM | Yes | `MEDIUM` | LOW, MEDIUM, HIGH, URGENT, CRITICAL | Task priority (per Q48) | Internal | — |
| `is_barcode_required` | BOOLEAN | Yes | `true` | — | Whether barcode scan required | Internal | — |
| `is_offline_capable` | BOOLEAN | Yes | `true` | — | Whether task can be done offline | Internal | — |

#### 4.3 Assignment Fields

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `assignment_type` | ENUM | Yes | `AUTOMATIC` | DIRECT, ROLE, QUEUE, AUTOMATIC (per Ch 9 §9.7) | Assignment strategy | Internal |
| `assigned_user_id` | UUID | No | NULL | FK to `user_accounts.id` | Assigned operator | Internal |
| `assigned_role_id` | UUID | No | NULL | FK to `roles.id` | Assigned role (for ROLE assignment) | Internal |
| `assigned_queue_id` | UUID | No | NULL | FK to `task_queues.id` | Assigned queue | Internal |
| `assigned_team_id` | UUID | No | NULL | FK to `teams.id` | Assigned team | Internal |
| `assigned_at` | TIMESTAMPTZ | No | NULL | — | Assignment timestamp | Internal |
| `assigned_by` | UUID | No | NULL | FK to `user_accounts.id` | Who assigned (or SYSTEM) | Internal |
| `accepted_at` | TIMESTAMPTZ | No | NULL | — | Acceptance timestamp | Internal |
| `accepted_by` | UUID | No | NULL | FK to `user_accounts.id` | Who accepted | Internal |

#### 4.4 Source Document

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `source_document_type` | VARCHAR(30) | No | NULL | GRN, STOCK_TRANSFER, PRODUCTION_ORDER, SALES_ORDER, PURCHASE_RETURN, etc. | Source document | Internal |
| `source_document_id` | UUID | No | NULL | FK to source | Source document ID | Internal |
| `source_document_number` | VARCHAR(50) | No | NULL | — | Source document number | Internal |
| `workflow_instance_id` | UUID | No | NULL | FK to `workflow_instances.id` | Associated workflow (per Ch 9) | Internal |

#### 4.5 Task Lines (Multi-line tasks like picking multiple items)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `total_lines` | INTEGER | Yes | `0` | ≥ 0 | Number of task lines | Internal |
| `completed_lines` | INTEGER | Yes | `0` | ≥ 0 | Completed lines | Internal |
| `line_completion_pct` | DECIMAL(5,2) | No | — | Generated: `(completed_lines / total_lines) * 100` | Completion % | Internal |

#### 4.6 Location & Product References

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `source_location_id` | UUID | No | NULL | FK to `locations.id` (BIN) | Source location (for pick/transfer) | Internal |
| `source_location_code` | VARCHAR(200) | No | NULL | Denormalized | Source complete code | Internal |
| `destination_location_id` | UUID | No | NULL | FK to `locations.id` (BIN) | Destination location (for putaway/transfer) | Internal |
| `destination_location_code` | VARCHAR(200) | No | NULL | Denormalized | Destination complete code | Internal |
| `dock_id` | UUID | No | NULL | FK to `docks.id` | Dock (for receiving/dispatch tasks) | Internal |
| `zone_id` | UUID | No | NULL | FK to `locations.id` (ZONE) | Zone (for zone-based tasks) | Internal |

#### 4.7 Quantity & Product

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `product_id` | UUID | No | NULL | FK to `products.id` | Product (for single-product tasks) | Internal |
| `batch_id` | UUID | No | NULL | FK to `batches.id` | Batch (for FEFO picking) | Internal |
| `quantity_required` | DECIMAL(18,4) | No | NULL | > 0 | Required quantity | Internal |
| `quantity_completed` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Completed quantity | Internal |
| `quantity_variance` | DECIMAL(18,4) | No | NULL | — | Variance (for cycle count) | Internal |
| `uom_id` | UUID | No | NULL | FK to `uoms.id` | UOM | Internal |

#### 4.8 SLA & Timing (per Ch 9 §9.9)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `created_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Creation timestamp | Internal | — |
| `required_by` | TIMESTAMPTZ | Yes | — | > created_at | When task must be completed | Internal | — |
| `sla_deadline` | TIMESTAMPTZ | Yes | — | — | SLA deadline (per Ch 9 §9.9) | Internal | SLA AI |
| `sla_breach_at` | TIMESTAMPTZ | No | NULL | — | When SLA was breached | Internal | — |
| `is_sla_breached` | BOOLEAN | Yes | `false` | — | SLA breach flag | Internal | — |
| `started_at` | TIMESTAMPTZ | No | NULL | — | When work started | Internal | Productivity AI |
| `completed_at` | TIMESTAMPTZ | No | NULL | — | Completion timestamp | Internal | — |
| `verified_at` | TIMESTAMPTZ | No | NULL | — | Verification timestamp | Internal | — |
| `closed_at` | TIMESTAMPTZ | No | NULL | — | Closure timestamp | Internal | — |
| `duration_seconds` | INTEGER | No | NULL | ≥ 0; Generated: `completed_at - started_at` | Execution duration | Internal | Productivity AI |
| `queue_time_seconds` | INTEGER | No | NULL | ≥ 0; Generated: `started_at - assigned_at` | Time in queue | Internal | — |
| `estimated_duration_sec` | INTEGER | No | NULL | ≥ 0 | AI-estimated duration | Internal | — |

#### 4.9 Verification (per Ch 9 §9.4)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `requires_verification` | BOOLEAN | Yes | `false` | — | Whether verification required | Internal |
| `verifier_user_id` | UUID | No | NULL | FK to `user_accounts.id`; required if `requires_verification = true` | Verifier (L4 supervisor) | Internal |
| `verification_status` | ENUM | No | NULL | PENDING, APPROVED, REJECTED | Verification status | Internal |
| `verification_comments` | TEXT | No | NULL | — | Verifier comments | Internal |
| `rejection_reason` | TEXT | No | NULL | Required if `verification_status = REJECTED` | Rejection reason | Internal |

#### 4.10 Escalation (per Ch 9 §9.10)

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `escalation_level` | INTEGER | Yes | `0` | ≥ 0 | Current escalation level (0 = not escalated) | Internal |
| `escalation_owner_id` | UUID | No | NULL | FK to `user_accounts.id` | Current escalation owner | Internal |
| `escalated_at` | TIMESTAMPTZ | No | NULL | — | First escalation timestamp | Internal |
| `last_escalation_at` | TIMESTAMPTZ | No | NULL | — | Last escalation timestamp | Internal |
| `escalation_history` | JSONB | No | `'[]'::JSONB` | — | Array of escalation events | Internal |

#### 4.11 WMS 2.0 Intelligence Fields (per Enhancement)

| Field | Type | Required | Default | Validation | Description | Security Class | AI Usage |
|---|---|---|---|---|---|---|---|
| `wave_id` | UUID | No | NULL | FK to `pick_waves.id` | Pick wave (wave picking) | Internal | Wave picking AI |
| `cluster_id` | UUID | No | NULL | FK to `pick_clusters.id` | Pick cluster (cluster picking) | Internal | Cluster picking AI |
| `batch_pick_id` | UUID | No | NULL | FK self-ref | Batch pick parent (multi-order picking) | Internal | Batch pick AI |
| `order_group_id` | UUID | No | NULL | FK to `order_groups.id` | Order group (multi-order) | Internal | — |
| `is_wave_pick` | BOOLEAN | Yes | `false` | — | Part of wave picking | Internal | — |
| `is_cluster_pick` | BOOLEAN | Yes | `false` | — | Part of cluster picking | Internal | — |
| `is_batch_pick` | BOOLEAN | Yes | `false` | — | Multi-order batch pick | Internal | — |
| `is_cross_dock` | BOOLEAN | Yes | `false` | — | Cross-dock task | Internal | Cross-dock AI |
| `pick_path_optimized` | BOOLEAN | Yes | `false` | — | Pick path AI-optimized | Internal | Path optimization AI |
| `pick_path_sequence` | INTEGER | No | NULL | ≥ 1 | Sequence in pick path | Internal | — |
| `optimal_pick_path` | JSONB | No | NULL | — | AI-recommended pick path | Internal | — |
| `estimated_travel_distance_m` | DECIMAL(10,2) | No | NULL | ≥ 0 | Estimated travel | Internal | — |
| `actual_travel_distance_m` | DECIMAL(10,2) | No | NULL | ≥ 0 | Actual travel (from movements) | Internal | — |
| `is_agv_task` | BOOLEAN | Yes | `false` | — | AGV-executed task (future per Ch 24 §24.8) | Internal | Robotics AI |
| `agv_id` | VARCHAR(50) | No | NULL | — | AGV identifier | Internal | — |
| `is_robotics_task` | BOOLEAN | Yes | `false` | — | Robot-executed task (future) | Internal | — |

#### 4.12 Performance & Analytics

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `productivity_score` | DECIMAL(5,2) | No | NULL | 0–100 | Operator productivity for this task | Internal |
| `efficiency_pct` | DECIMAL(5,2) | No | NULL | 0–100 | Efficiency vs estimated | Internal |
| `scan_count` | INTEGER | Yes | `0` | ≥ 0 | Total barcode scans | Internal |
| `scan_failure_count` | INTEGER | Yes | `0` | ≥ 0 | Scan failures | Internal |
| `exception_count` | INTEGER | Yes | `0` | ≥ 0 | Exceptions during task | Internal |
| `has_exception` | BOOLEAN | Yes | `false` | — | Whether exception occurred | Internal |
| `exception_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Exception record IDs | Internal |

#### 4.13 Movement References

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `movement_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Warehouse movements created by this task | Internal |
| `movement_count` | INTEGER | Yes | `0` | ≥ 0 | Number of movements | Internal |

#### 4.14 Custom Fields & Annotations

| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `custom_fields` | JSONB | No | `'{}'::JSONB` | — | Custom fields | Internal |
| `task_instructions` | TEXT | No | NULL | — | Special instructions for operator | Internal |
| `remarks` | TEXT | No | NULL | — | Annotation | Internal |
| `tags` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | Annotations | Internal |

---

## 5. Relationships

| Relationship | Cardinality | FK | Cascade |
|---|---|---|---|
| WarehouseTask → Company, Facility, Warehouse | N : 1 each | various | RESTRICT |
| WarehouseTask → Location (source, destination, zone) | N : 1 each | various | SET NULL |
| WarehouseTask → Dock | N : 1 | `dock_id` | SET NULL |
| WarehouseTask → Product, Batch, UOM | N : 1 each | various | SET NULL |
| WarehouseTask → UserAccount (assigned, accepted, verifier, escalator) | N : 1 each | various | RESTRICT |
| WarehouseTask → Role, Team, TaskQueue | N : 1 each | various | SET NULL |
| WarehouseTask → WorkflowInstance | N : 1 | `workflow_instance_id` | SET NULL |
| WarehouseTask → WarehouseTask (batch_pick parent) | N : 1 | `batch_pick_id` (self-ref) | SET NULL |
| WarehouseTask → WarehouseMovement | 1 : N | `warehouse_movements.warehouse_task_id` | SET NULL |
| WarehouseTask → Exception | 1 : N | (via `exception_ids` array) | SET NULL |

---

## 6. Index Strategy

| Index Name | Type | Columns | Rationale |
|---|---|---|---|
| `pk_warehouse_tasks` | PRIMARY KEY | `id` | Default PK |
| `uq_wt_code_company` | UNIQUE | `company_id, code` | Code uniqueness |
| `uq_wt_number_company` | UNIQUE | `company_id, task_number` | Task number uniqueness |
| `idx_wt_created_at` | B-TREE | `created_at DESC` | **Partition pruning** |
| `idx_wt_status` | B-TREE | `status, created_at DESC` | Default filter |
| `idx_wt_type` | B-TREE | `task_type, status, created_at DESC` | Filter by type |
| `idx_wt_warehouse` | B-TREE | `warehouse_id, status` | Warehouse tasks |
| `idx_wt_assigned_user` | B-TREE | `assigned_user_id, status WHERE status IN ('ASSIGNED', 'ACCEPTED', 'WORKING', 'IN_PROGRESS')` | User's active tasks (mobile inbox) |
| `idx_wt_assigned_role` | B-TREE | `assigned_role_id, status WHERE status = 'ASSIGNED'` | Role-based claiming |
| `idx_wt_queue` | B-TREE | `assigned_queue_id, status WHERE status = 'PENDING'` | Queue claiming |
| `idx_wt_priority` | B-TREE | `priority, sla_deadline WHERE status IN ('PENDING', 'ASSIGNED')` | Priority queue |
| `idx_wt_sla` | B-TREE | `sla_deadline WHERE status NOT IN ('COMPLETED', 'CLOSED', 'CANCELLED')` | SLA monitoring |
| `idx_wt_sla_breached` | PARTIAL | `sla_deadline WHERE is_sla_breached = true` | Breached tasks |
| `idx_wt_escalated` | PARTIAL | `escalation_level WHERE escalation_level > 0` | Escalated tasks |
| `idx_wt_source_doc` | B-TREE | `source_document_type, source_document_id` | Document tasks |
| `idx_wt_workflow` | B-TREE | `workflow_instance_id WHERE workflow_instance_id IS NOT NULL` | Workflow tasks |
| `idx_wt_wave` | B-TREE | `wave_id WHERE wave_id IS NOT NULL` | Wave tasks |
| `idx_wt_cluster` | B-TREE | `cluster_id WHERE cluster_id IS NOT NULL` | Cluster tasks |
| `idx_wt_batch_pick` | B-TREE | `batch_pick_id WHERE batch_pick_id IS NOT NULL` | Batch pick tasks |
| `idx_wt_cross_dock` | PARTIAL | `warehouse_id WHERE is_cross_dock = true` | Cross-dock tasks |
| `idx_wt_agv` | PARTIAL | `warehouse_id WHERE is_agv_task = true` | AGV tasks |
| `idx_wt_verification_pending` | PARTIAL | `warehouse_id WHERE requires_verification = true AND status = 'COMPLETED' AND verification_status = 'PENDING'` | Verification queue |
| `idx_wt_offline_capable` | PARTIAL | `warehouse_id WHERE is_offline_capable = true AND status IN ('ASSIGNED', 'ACCEPTED')` | Offline-capable tasks |

### Partitioning

```sql
-- Monthly partitions
CREATE TABLE warehouse_tasks_2026_07 PARTITION OF warehouse_tasks
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
-- pg_partman manages automatically
```

---

## 7. Validation Rules

| # | Rule | Layer | Enforcement |
|---|---|---|---|
| 1 | `code` unique per company | DB | Unique constraint |
| 2 | `task_number` unique per company | DB | Unique constraint |
| 3 | `task_type` required | DB | NOT NULL |
| 4 | `priority` required | DB | NOT NULL |
| 5 | `required_by` > `created_at` | DB | CHECK constraint |
| 6 | `sla_deadline` ≥ `required_by` (SLA at least as strict as required_by) | App | Service-layer |
| 7 | `requires_verification = true` for CYCLE_COUNT, AUDIT, HIGH-value tasks | App | Service-layer |
| 8 | `verifier_user_id` required if `requires_verification = true` and status = COMPLETED | App | Service-layer |
| 9 | Cannot self-verify (verifier ≠ assigned_user) | App | Service-layer (4-eyes principle) |
| 10 | Status transitions follow 8-stage lifecycle (per Ch 9 §9.4) | App | Workflow Engine |
| 11 | On COMPLETED: create WarehouseMovement(s) and write to Inventory Ledger | App | Outbox pattern |
| 12 | On COMPLETED: publish domain event (per Ch 3 §3.7) | App | Event Bus |
| 13 | `sla_breach_at` auto-set when `NOW() > sla_deadline` and status not COMPLETED | App | Scheduled job |
| 14 | Escalation auto-triggered per escalation rules (per Ch 9 §9.10) | App | Scheduler Service |
| 15 | Cannot modify after CLOSED (immutable) | App | Service-layer |
| 16 | `quantity_completed` ≤ `quantity_required` (unless over-pick allowed) | App | Service-layer |
| 17 | If `is_barcode_required = true`, barcode scan required before COMPLETED | App | Barcode Engine |
| 18 | `rejection_reason` required if `verification_status = REJECTED` | DB | CHECK |
| 19 | `batch_pick_id` cannot reference self | App | Service-layer |
| 20 | If `is_agv_task = true`, `agv_id` required | DB | CHECK |

---

## 8. API Mapping

| Endpoint | Method | Capability | Permission |
|---|---|---|---|
| `/api/v1/warehouse-tasks` | GET | List tasks | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-tasks/:id` | GET | Get task details | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-tasks` | POST | Create task | `WAREHOUSE:CREATE` (or SYSTEM) |
| `/api/v1/warehouse-tasks/:id` | PATCH | Update task (limited — most fields immutable after ASSIGNED) | `WAREHOUSE:EDIT` |
| `/api/v1/warehouse-tasks/:id/assign` | POST | Assign to user/role/queue | `WAREHOUSE:EDIT` |
| `/api/v1/warehouse-tasks/:id/accept` | POST | Accept task | `WAREHOUSE:EDIT` |
| `/api/v1/warehouse-tasks/:id/start` | POST | Start work | `WAREHOUSE:EDIT` |
| `/api/v1/warehouse-tasks/:id/scan` | POST | Record barcode scan | `WAREHOUSE:EDIT` |
| `/api/v1/warehouse-tasks/:id/complete` | POST | Complete task | `WAREHOUSE:EDIT` |
| `/api/v1/warehouse-tasks/:id/verify` | POST | Verify task (supervisor) | `WAREHOUSE:APPROVE` |
| `/api/v1/warehouse-tasks/:id/reject` | POST | Reject verification | `WAREHOUSE:APPROVE` |
| `/api/v1/warehouse-tasks/:id/cancel` | POST | Cancel task | `WAREHOUSE:EDIT` |
| `/api/v1/warehouse-tasks/:id/escalate` | POST | Escalate task | `WAREHOUSE:APPROVE` |
| `/api/v1/warehouse-tasks/:id/reassign` | POST | Reassign task | `WAREHOUSE:APPROVE` |
| `/api/v1/warehouse-tasks/my-tasks` | GET | Current user's tasks | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-tasks/by-queue/:queueId` | GET | Queue tasks | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-tasks/by-status/:status` | GET | Tasks by status | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-tasks/by-type/:type` | GET | Tasks by type | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-tasks/by-priority/:priority` | GET | Tasks by priority | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-tasks/sla-breached` | GET | SLA-breached tasks | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-tasks/escalated` | GET | Escalated tasks | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-tasks/pending-verification` | GET | Tasks awaiting verification | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-tasks/wave/:waveId` | GET | Wave tasks | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-tasks/cluster/:clusterId` | GET | Cluster tasks | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-tasks/cross-dock` | GET | Cross-dock tasks | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-tasks/analytics` | GET | Task analytics | `WAREHOUSE:VIEW` |
| `/api/v1/warehouse-tasks/offline-sync` | POST | Sync offline task updates | `WAREHOUSE:EDIT` |

---

## 9. UI Screens

| Screen | Purpose | Route |
|---|---|---|
| Task List | AG Grid with multi-filter | `/warehouse/tasks` |
| Task Detail | Single task with movements + scans + verification | `/warehouse/tasks/:id` |
| My Tasks (Desktop) | Current user's task queue | `/warehouse/tasks/my` |
| Task Kanban Board | Visual board: Pending → Assigned → In Progress → Completed | `/warehouse/tasks/board` |
| SLA Dashboard | Tasks by SLA status | `/warehouse/tasks/sla` |
| Escalation Dashboard | Escalated tasks | `/warehouse/tasks/escalated` |
| Verification Queue | Tasks awaiting supervisor verification | `/warehouse/tasks/verification` |
| Wave Picking Manager | Wave creation + management | `/warehouse/tasks/waves` |
| Cluster Picking Manager | Cluster creation + management | `/warehouse/tasks/clusters` |
| Cross-Dock Board | Cross-dock opportunities + tasks | `/warehouse/tasks/cross-dock` |
| Task Analytics | Productivity, efficiency, SLA compliance charts | `/warehouse/tasks/analytics` |

---

## 10. Mobile Usage

| Mobile Interaction | Purpose |
|---|---|
| **Task inbox (home screen)** | Primary mobile interaction — per Ch 5 §5.14 task-driven UX |
| Task acceptance | Accept assigned task |
| Task execution with barcode scan | Scan product → batch → location (per Ch 17 §17.12) |
| Task completion | Confirm with final scan |
| Offline task execution | Execute tasks offline, sync later (per Ch 11 Q3) |
| Task exception reporting | Report exception with guided recovery (per Ch 5 §5.15) |
| Task verification | L4 supervisor verifies on mobile |
| Task reassignment | L3+ reassign from mobile |
| SLA alerts | Push notifications for approaching SLA breach |
| Escalation alerts | Push notifications when task escalated |

---

## 11. Reports

| Report | Use of Warehouse Task |
|---|---|
| Task Productivity Report | Tasks per operator, avg duration, productivity score (per Part 6 Reports) |
| Task by Type | Task counts by type |
| SLA Compliance Report | % tasks completed within SLA |
| Task Cycle Time | Avg time from creation to completion |
| Operator Performance | Per-operator task metrics |
| Task Aging | Tasks by age (pending, assigned, in progress) |
| Wave Picking Report | Wave efficiency |
| Cluster Picking Report | Cluster efficiency |
| Cross-Dock Report | Cross-dock task performance |
| Verification Report | Verification pass/fail rate |
| Escalation Report | Escalation frequency by type/operator |
| Exception Report | Tasks with exceptions |
| Offline Task Report | Offline tasks + sync status |
| Task Completion Rate | Tasks completed vs created |
| Pick Path Efficiency | Actual vs optimal pick path |

---

## 12. Audit Rules

| Action | Audit Required | Reason Required | Retention |
|---|---|---|---|
| CREATE | Yes | Optional | Permanent |
| ASSIGN / REASSIGN | Yes | **Mandatory** (reason for reassign) | Permanent |
| ACCEPT | Yes | Optional | Permanent |
| START | Yes | Optional | Permanent |
| COMPLETE | Yes | Optional | Permanent |
| VERIFY (APPROVE) | Yes | Optional | Permanent |
| VERIFY (REJECT) | Yes | **Mandatory** (rejection_reason) | Permanent |
| CANCEL | Yes | **Mandatory** (reason) | Permanent |
| ESCALATE | Yes | Optional | Permanent |
| FAILED | Yes | **Mandatory** (exception reason) | Permanent |
| DELETE (soft — rare) | Yes | **Mandatory** | Permanent |
| Barcode scans | Yes (in movement's `barcode_scans`) | N/A | 7 years |
| Ledger writes | Yes (via ledger entry audit) | N/A | Permanent |

**Audit Level**: Full — all field changes + barcode scans + escalation history + verification decisions.

---

## 13. Security Classification

| Field Category | Classification | Access |
|---|---|---|
| `task_number`, `task_type`, `priority`, `status` | Internal | L2+ Warehouse |
| `assigned_user_id`, `assigned_role_id`, `assigned_team_id` | Internal | L2+ Warehouse, HR |
| `source_document_*`, `workflow_instance_id` | Internal | L2+ Warehouse |
| `product_id`, `batch_id`, `quantity_*`, `uom_id` | Internal | L2+ Warehouse |
| `source_*`, `destination_*`, `dock_id`, `zone_id` | Internal | L2+ Warehouse |
| `productivity_score`, `efficiency_pct` | Internal | L2+ Warehouse, HR |
| `wave_id`, `cluster_id`, `batch_pick_id` | Internal | L2+ Warehouse |
| `is_agv_task`, `agv_id` | Internal | L2+ Warehouse, IT |
| `escalation_*` | Internal | L2+ Warehouse |
| `verification_*` | Internal | L2+ Warehouse |

---

## 14. AI Relevance

| AI Capability | Usage |
|---|---|
| **Task Assignment AI** | Optimal task routing (per Ch 9 Q26) |
| **Wave Picking AI** | Groups orders into waves for efficient picking |
| **Cluster Picking AI** | Groups picks by location cluster |
| **Batch Pick AI** | Multi-order batch pick optimization |
| **Pick Path Optimization AI** | Optimal pick path within task |
| **Cross-Dock AI** | Identifies cross-dock opportunities |
| **Labor Planning AI** | Predicts task volume for workforce planning |
| **Productivity Analysis AI** | Operator productivity scoring |
| **SLA Prediction AI** | Predicts SLA breaches before they happen |
| **Escalation AI** | Smart escalation routing |
| **Replenishment AI** | Auto-generates replenishment tasks |
| **Reslot AI** | Generates reslotting tasks based on movement patterns |
| **Robotics/AGV Orchestration AI** | Assigns tasks to AGVs (future per Ch 24 §24.8) |
| **Congestion Prediction AI** | Schedules tasks to avoid congestion |

---

## 15. Performance Notes

| Consideration | Guidance |
|---|---|
| **Row count** | HIGH volume — ~5,000+ tasks/day at scale (~150k+/month) |
| **Partitioning** | Monthly by `created_at`; pg_partman auto-managed |
| **Cache strategy** | Redis cache for active tasks (5-min TTL); user's task list cached with 1-min TTL |
| **Hot path: my tasks** | `idx_wt_assigned_user` — fast lookup for mobile inbox |
| **Hot path: SLA monitoring** | `idx_wt_sla` — scheduled job checks every minute |
| **Hot path: priority queue** | `idx_wt_priority` — fast priority-based assignment |
| **Task assignment** | Assignment algorithm (per Q26) runs on task creation |
| **Escalation monitoring** | Scheduler Service checks every minute for escalation triggers |
| **Offline sync** | Offline tasks sync via `offline-sync` endpoint (per Ch 11 Q3) |
| **Aggregations** | Pre-aggregated daily/hourly summaries for dashboards |
| **N+1 prevention** | Eager-load `product`, `batch`, `locations`, `assigned_user` when listing |

---

## 16. Example Records

### Example 1: Putaway Task

```json
{
  "id": "01928f7a-...-task-001",
  "code": "TASK-2026-000001",
  "company_id": "01928f7a-...-company",
  "facility_id": "01928f7a-...-wh-rm-01",
  "warehouse_id": "01928f7a-...-wh-rm-01",
  "task_number": "TASK-2026-000001",
  "task_type": "PUTAWAY",
  "task_category": "INTERNAL",
  "task_origin": "SYSTEM",
  "priority": "HIGH",
  "is_barcode_required": true,
  "is_offline_capable": true,
  "assignment_type": "AUTOMATIC",
  "assigned_user_id": "01928f7a-...-user-wh-operator-01",
  "assigned_at": "2026-07-07T14:00:00Z",
  "assigned_by": "01928f7a-...-user-system",
  "accepted_at": "2026-07-07T14:05:00Z",
  "source_document_type": "GOODS_RECEIPT_NOTE",
  "source_document_id": "01928f7a-...-grn-001",
  "source_document_number": "GRN-2026-000001",
  "total_lines": 1,
  "completed_lines": 1,
  "line_completion_pct": 100.00,
  "source_location_id": "01928f7a-...-bin-recv-01",
  "destination_location_id": "01928f7a-...-bin-rm-01-01",
  "product_id": "01928f7a-...-prod-sugar",
  "batch_id": "01928f7a-...-batch-002",
  "quantity_required": 495.0000,
  "quantity_completed": 495.0000,
  "uom_id": "01928f7a-...-uom-kg",
  "required_by": "2026-07-07T18:00:00Z",
  "sla_deadline": "2026-07-07T15:00:00Z",
  "started_at": "2026-07-07T14:30:00Z",
  "completed_at": "2026-07-07T14:35:30Z",
  "duration_seconds": 330,
  "queue_time_seconds": 1500,
  "estimated_duration_sec": 300,
  "requires_verification": false,
  "is_sla_breached": false,
  "escalation_level": 0,
  "pick_path_optimized": true,
  "estimated_travel_distance_m": 45.50,
  "actual_travel_distance_m": 45.50,
  "productivity_score": 95.00,
  "efficiency_pct": 90.91,
  "scan_count": 3,
  "scan_failure_count": 0,
  "exception_count": 0,
  "has_exception": false,
  "movement_ids": ["01928f7a-...-wm-001"],
  "movement_count": 1,
  "task_instructions": "Putaway 495kg Sugar to Bin A-01-01. Cold chain not required.",
  "status": "COMPLETED",
  "version": 4
}
```

### Example 2: Picking Task (Wave Pick with FEFO)

```json
{
  "id": "01928f7a-...-task-002",
  "code": "TASK-2026-000002",
  "task_number": "TASK-2026-000002",
  "task_type": "PICKING",
  "task_category": "OUTBOUND",
  "task_origin": "WORKFLOW",
  "priority": "HIGH",
  "assignment_type": "ROLE",
  "assigned_role_id": "01928f7a-...-role-picker",
  "assigned_user_id": "01928f7a-...-user-picker-001",
  "source_document_type": "SALES_ORDER",
  "source_document_number": "SO-2026-000123",
  "total_lines": 3,
  "completed_lines": 3,
  "line_completion_pct": 100.00,
  "source_location_id": "01928f7a-...-bin-fg-01-01-05",
  "destination_location_id": "01928f7a-...-bin-dispatch-01",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "batch_id": "01928f7a-...-batch-001",
  "quantity_required": 15.0000,
  "quantity_completed": 15.0000,
  "uom_id": "01928f7a-...-uom-kg",
  "required_by": "2026-07-07T18:00:00Z",
  "sla_deadline": "2026-07-07T16:00:00Z",
  "started_at": "2026-07-07T15:00:00Z",
  "completed_at": "2026-07-07T15:08:30Z",
  "duration_seconds": 510,
  "wave_id": "01928f7a-...-wave-001",
  "is_wave_pick": true,
  "pick_path_optimized": true,
  "pick_path_sequence": 2,
  "optimal_pick_path": {
    "sequence": [
      { "location_id": "01928f7a-...-bin-fg-01-01-05", "sequence": 1, "distance_from_prev": 0 },
      { "location_id": "01928f7a-...-bin-fg-01-02-03", "sequence": 2, "distance_from_prev": 12.5 },
      { "location_id": "01928f7a-...-bin-fg-01-03-08", "sequence": 3, "distance_from_prev": 8.3 }
    ],
    "total_distance_m": 28.30,
    "estimated_time_sec": 480
  },
  "estimated_travel_distance_m": 28.30,
  "actual_travel_distance_m": 28.30,
  "productivity_score": 110.00,
  "efficiency_pct": 94.12,
  "scan_count": 9,
  "scan_failure_count": 0,
  "movement_ids": ["01928f7a-...-wm-002", "01928f7a-...-wm-003", "01928f7a-...-wm-004"],
  "movement_count": 3,
  "task_instructions": "FEFO picking — pick oldest expiry first. Batch SDS-2026-000001 (expiry 2026-07-28) first.",
  "status": "COMPLETED",
  "version": 3,
  "tags": ["fefo", "wave-pick", "fast-pick"]
}
```

### Example 3: SLA-Breached + Escalated Task

```json
{
  "id": "01928f7a-...-task-003",
  "code": "TASK-2026-000003",
  "task_number": "TASK-2026-000003",
  "task_type": "PICKING",
  "priority": "URGENT",
  "assigned_user_id": "01928f7a-...-user-picker-002",
  "assigned_at": "2026-07-07T10:00:00Z",
  "sla_deadline": "2026-07-07T11:00:00Z",
  "sla_breach_at": "2026-07-07T11:00:00Z",
  "is_sla_breached": true,
  "escalation_level": 2,
  "escalation_owner_id": "01928f7a-...-user-wh-manager",
  "escalated_at": "2026-07-07T11:15:00Z",
  "last_escalation_at": "2026-07-07T11:45:00Z",
  "escalation_history": [
    {
      "level": 1,
      "escalated_at": "2026-07-07T11:15:00Z",
      "escalated_to": "01928f7a-...-user-wh-supervisor",
      "action": "ESCALATE",
      "reason": "SLA breached by 15 minutes"
    },
    {
      "level": 2,
      "escalated_at": "2026-07-07T11:45:00Z",
      "escalated_to": "01928f7a-...-user-wh-manager",
      "action": "ESCALATE",
      "reason": "No response from supervisor in 30 minutes"
    }
  ],
  "started_at": null,
  "status": "ESCALATED",
  "version": 6,
  "tags": ["sla-breached", "escalated", "urgent"]
}
```

### Example 4: Cross-Dock Task (WMS 2.0)

```json
{
  "id": "01928f7a-...-task-004",
  "code": "TASK-2026-000004",
  "task_number": "TASK-2026-000004",
  "task_type": "CROSS_DOCK",
  "task_category": "INTERNAL",
  "priority": "HIGH",
  "is_cross_dock": true,
  "source_document_type": "GOODS_RECEIPT_NOTE",
  "source_document_number": "GRN-2026-000002",
  "dock_id": "01928f7a-...-dock-cross-01",
  "total_lines": 1,
  "product_id": "01928f7a-...-prod-bhujia-200",
  "batch_id": "01928f7a-...-batch-007",
  "quantity_required": 100.0000,
  "quantity_completed": 100.0000,
  "uom_id": "01928f7a-...-uom-kg",
  "source_location_id": "01928f7a-...-bin-recv-cross-01",
  "destination_location_id": "01928f7a-...-bin-dispatch-01",
  "started_at": "2026-07-07T12:00:00Z",
  "completed_at": "2026-07-07T12:05:00Z",
  "duration_seconds": 300,
  "productivity_score": 100.00,
  "efficiency_pct": 100.00,
  "movement_ids": ["01928f7a-...-wm-005"],
  "task_instructions": "Cross-dock: Receive from GRN-2026-000002 and immediately load to vehicle for Store-04 transfer. No putaway.",
  "status": "COMPLETED",
  "version": 2,
  "tags": ["cross-dock", "wms-2.0", "no-putaway"]
}
```

### Example 5: AGV Task (Future — Robotics)

```json
{
  "id": "01928f7a-...-task-005",
  "code": "TASK-2026-000005",
  "task_number": "TASK-2026-000005",
  "task_type": "TRANSFER",
  "task_category": "INTERNAL",
  "priority": "MEDIUM",
  "is_agv_task": true,
  "agv_id": "AGV-001",
  "assignment_type": "AUTOMATIC",
  "assigned_user_id": null,
  "source_location_id": "01928f7a-...-bin-reserve-01",
  "destination_location_id": "01928f7a-...-bin-picking-01",
  "product_id": "01928f7a-...-prod-kaju-katli-500",
  "batch_id": "01928f7a-...-batch-001",
  "quantity_required": 20.0000,
  "quantity_completed": 20.0000,
  "uom_id": "01928f7a-...-uom-kg",
  "started_at": "2026-07-07T16:00:00Z",
  "completed_at": "2026-07-07T16:08:00Z",
  "duration_seconds": 480,
  "estimated_travel_distance_m": 65.40,
  "actual_travel_distance_m": 67.20,
  "movement_ids": ["01928f7a-...-wm-006"],
  "task_instructions": "AGV transfer: Move 20kg Kaju Katli from reserve to picking face. AGV-001 assigned.",
  "status": "COMPLETED",
  "version": 2,
  "tags": ["agv", "robotics", "automated", "future"]
}
```

---

## Part 6 Completion Summary

**All 10 Warehouse Management Domain entities are now defined** at full enterprise-grade depth:

| Entity | File | Status |
|---|---|---|
| 041 Warehouse Master (WMS Extension) | `41-46-wms-extension-location-hierarchy.md` | ✅ Complete (extends Part 2 A.6) |
| 042 Zone Master (WMS Extension) | `41-46-wms-extension-location-hierarchy.md` | ✅ Complete (extends Part 2 A.7) |
| 043 Aisle Master (WMS Extension) | `41-46-wms-extension-location-hierarchy.md` | ✅ Complete (extends Part 2 A.8) |
| 044 Rack Master (WMS Extension) | `41-46-wms-extension-location-hierarchy.md` | ✅ Complete (extends Part 2 A.9) |
| 045 Shelf Master (WMS Extension) | `41-46-wms-extension-location-hierarchy.md` | ✅ Complete (extends Part 2 A.10) |
| 046 Bin Master (WMS Extension) | `41-46-wms-extension-location-hierarchy.md` | ✅ Complete (extends Part 2 A.11) |
| 047 Dock Master | `47-48-dock-and-location.md` | ✅ Complete |
| 048 Warehouse Location | `47-48-dock-and-location.md` | ✅ Complete (materialized view) |
| 049 Warehouse Movement | `49-warehouse-movement.md` | ✅ Complete (partitioned monthly) |
| 050 Warehouse Task | `50-warehouse-task.md` | ✅ Complete (most detailed, WMS 2.0 integrated) |

### Key Architectural Decisions in Part 6

1. **Extension pattern** — Part 6 extends Part 2 Location Hierarchy (no duplication, single source of truth)
2. **WMS 2.0 Intelligence fully integrated** — Slotting, heat maps, congestion, wave/cluster/batch picking, cross-dock, AGV-ready
3. **Dock management** — Full dock lifecycle, appointment scheduling, cross-dock capability
4. **Materialized view for Warehouse Location** — Denormalized complete address for fast barcode lookup (< 200ms)
5. **Warehouse Movement partitioned monthly** — High volume (1M+/year), per Part 6 Performance Strategy
6. **Movement → Ledger integration** — Every completed movement writes to Inventory Ledger (Outbox pattern)
7. **Barcode-first movement execution** — 7-point validation per Ch 17 §17.8
8. **Task-driven execution** — 8-stage lifecycle per Ch 9 §9.4, 4 assignment strategies per Ch 9 §9.7
9. **SLA + Escalation** — Per Ch 9 §9.9, §9.10; auto-escalation via Scheduler Service
10. **Offline-capable tasks** — Per Ch 11 Q3 6-layer offline architecture
11. **AGV/Robotics ready** — `is_agv_task`, `agv_id`, `is_robotics_task` fields (per Ch 24 §24.8)
12. **Digital Twin ready** — `is_digital_twin_enabled`, `warehouse_map_file_id`, coordinates (per Ch 3 §3.8)
13. **WMS 2.0 fields all nullable** — Activated via feature flags (per Ch 8 §8.6); no data migration needed
14. **All movements auditable** — Per Ch 18 §18.14 immutable history + hash-chained ledger entries
15. **Complete warehouse event publishing** — Every completed task publishes enterprise event (per Ch 3 §3.7)

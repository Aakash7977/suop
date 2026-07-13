# 04 — Missing Modules

**Date**: 2026-07-13
**Status**: FINAL

---

## 🔴 MISSING Modules (9 of 29)

These backend modules do NOT exist. No directory, no Prisma models, no routes, no service. Verified by searching `apps/backend/src/modules/` and `prisma/schema.prisma`.

---

### 1. `receiving/` — ASN, Appointments, Docks, Exceptions

**Business Purpose**: Pre-receipt inbound logistics — schedule supplier deliveries, assign docks, manage gate-in, track unloading before GRN creation.

**Business Flow**: Purchase Order → ASN Created → Dock Appointment Scheduled → Truck Arrives at Gate → Gate Entry → Dock Assignment → Unloading → Quality Check → Goods Receipt Created

**Required Tables**: `asn_headers`, `asn_lines`, `dock_appointments`, `dock_doors`, `receiving_exceptions`
**Required APIs**: ~20 endpoints (ASN CRUD, appointment CRUD, dock CRUD, exception CRUD)
**Required Workflow**: `AsnLifecycle` (EXPECTED → IN_TRANSIT → ARRIVED → UNLOADED → CLOSED)
**Required Permissions**: `RECEIVING_READ`, `RECEIVING_CREATE`, `RECEIVING_UPDATE`, `DOCK_MANAGE`
**Required Events**: `AsnCreated`, `AsnArrived`, `DockScheduled`, `ReceivingException`
**Required Business Rules**: ASN must reference valid PO, dock double-booking prevention, appointment SLA tracking
**Required Reports**: Dock utilization, ASN accuracy, receiving exceptions by type
**Required KPIs**: Dock-to-stock time, receiving accuracy, appointment adherence
**Dependencies**: purchase-order (ASN references PO), goods-receipt (ASN → GRN), warehouse (dock doors)
**Blocked Frontend Modules**: ReceivingModule (1 module, 435 lines)
**Estimated Effort**: 80 hours

---

### 2. `yard/` — Truck Queue, Dock Schedule, Yard Map, Gate Console

**Business Purpose**: Manage truck movements within the warehouse yard — from gate entry to dock assignment to departure.

**Business Flow**: Truck Arrives → Gate Check-In → Yard Placement → Dock Assignment → Loading/Unloading → Gate Check-Out

**Required Tables**: `yard_trucks`, `yard_locations`, `gate_entries`, `gate_exits`, `yard_moves`
**Required APIs**: ~15 endpoints
**Required Workflow**: `TruckLifecycle` (EXPECTED → ARRIVED → IN_YARD → AT_DOOR → DEPARTED)
**Required Permissions**: `YARD_READ`, `YARD_CHECKIN`, `YARD_CHECKOUT`, `YARD_MOVE`
**Required Events**: `TruckArrived`, `TruckAtDock`, `TruckDeparted`
**Required Business Rules**: Gate pass validation, yard capacity check, dock door availability
**Dependencies**: receiving (ASN arrival triggers truck creation), warehouse (dock doors)
**Blocked Frontend Modules**: TruckQueueModule, DockScheduleModule, YardMapModule, VehicleTrackerModule, GateConsoleModule, YardControlTowerModule (6 modules)
**Estimated Effort**: 60 hours

---

### 3. `eam/` — Enterprise Asset Management (Forklifts, Batteries, Maintenance, Certifications, Scanners)

**Business Purpose**: Track and maintain material-handling equipment — forklifts, pallet jacks, scanners, batteries — with preventive maintenance scheduling and operator certification management.

**Business Flow**: Equipment Registered → Assigned to Operator → Daily Inspection → Maintenance Scheduled → Maintenance Performed → Certification Tracked → Breakdown Reported → Repaired

**Required Tables**: `equipment`, `equipment_types`, `batteries`, `battery_charges`, `maintenance_schedules`, `maintenance_records`, `certifications`, `scanner_devices`
**Required APIs**: ~30 endpoints
**Required Workflow**: `EquipmentLifecycle`, `MaintenanceLifecycle`
**Required Permissions**: `EAM_READ`, `EAM_CREATE`, `EAM_UPDATE`, `EAM_MAINTENANCE`, `EAM_CERTIFY`
**Required Events**: `EquipmentCreated`, `MaintenanceScheduled`, `MaintenanceCompleted`, `CertificationExpiring`
**Required Business Rules**: Certification expiry alerts, maintenance frequency enforcement, battery charge cycle tracking
**Dependencies**: alerts-kpi-engine (maintenance reminders), hr (operator assignment)
**Blocked Frontend Modules**: EquipmentModule, EquipmentMasterModule, ForkliftDashboardModule, ScannerManagementModule, BatteryDashboardModule, MaintenancePlannerModule, BreakdownConsoleModule, CertificationCenterModule, EquipmentAnalyticsModule (9 modules)
**Estimated Effort**: 120 hours

---

### 4. `cycle-count/` — Count Requests, Variances, Approvals

**Business Purpose**: Physical inventory verification — schedule counts, execute counts, calculate variances, approve adjustments, post to inventory.

**Business Flow**: Count Request Created (ABC-based) → Count Executed (blind or with system qty) → Variance Calculated → Variance Approved → Adjustment Posted to Inventory

**Required Tables**: `cycle_count_requests`, `cycle_count_lines`, `cycle_count_variances`, `cycle_count_approvals`
**Required APIs**: ~15 endpoints
**Required Workflow**: `CycleCountLifecycle` (DRAFT → SCHEDULED → IN_PROGRESS → COUNTED → RECONCILED → APPROVED → POSTED → CLOSED)
**Required Permissions**: `CYCLE_COUNT_READ`, `CYCLE_COUNT_CREATE`, `CYCLE_COUNT_EXECUTE`, `CYCLE_COUNT_APPROVE`, `CYCLE_COUNT_POST`
**Required Events**: `CycleCountCreated`, `CycleCountCompleted`, `VarianceDetected`, `AdjustmentPosted`
**Dependencies**: inventory (adjustment posting), warehouse (bin-level counts)
**Blocked Frontend Modules**: CycleCountModule (1 module, 354 lines)
**Estimated Effort**: 70 hours

---

### 5. `stock-transfer/` — Paired stockOut + stockIn

**Business Purpose**: Move stock between warehouses or bins in a single transactional operation.

**Business Flow**: Transfer Request → Pick from Source → Ship → Receive at Destination → Post to Inventory

**Required Tables**: `stock_transfers`, `stock_transfer_lines`, `stock_transfer_shipments`, `stock_transfer_receipts`
**Required APIs**: ~12 endpoints
**Required Workflow**: `StockTransferLifecycle` (DRAFT → APPROVED → IN_PICKING → IN_TRANSIT → RECEIVED → CLOSED)
**Required Permissions**: `TRANSFER_READ`, `TRANSFER_CREATE`, `TRANSFER_APPROVE`, `TRANSFER_SHIP`, `TRANSFER_RECEIVE`
**Dependencies**: inventory (paired stockOut + stockIn)
**Blocked Frontend Modules**: StockTransferModule (1 module, 222 lines)
**Estimated Effort**: 50 hours

---

### 6. `stock-adjustment/` — Variance + Reason + Approval

**Business Purpose**: Correct inventory discrepancies with reason codes, approval workflow, and audit trail.

**Business Flow**: Adjustment Request → Reason Code Selected → Submitted for Approval → Approved → Posted to Inventory

**Required Tables**: `stock_adjustments`, `stock_adjustment_lines`, `stock_adjustment_approvals`
**Required APIs**: ~10 endpoints
**Required Workflow**: `StockAdjustmentLifecycle` (DRAFT → SUBMITTED → APPROVED → POSTED → CLOSED)
**Required Permissions**: `ADJUSTMENT_READ`, `ADJUSTMENT_CREATE`, `ADJUSTMENT_APPROVE`, `ADJUSTMENT_POST`
**Dependencies**: inventory (adjustment posting with ledger entry)
**Blocked Frontend Modules**: AdjustmentModule (1 module, 318 lines)
**Estimated Effort**: 40 hours

---

### 7. `task-queue/` — Unified Task Aggregation

**Business Purpose**: Single view of all warehouse tasks (putaway, pick, pack, count, transfer, maintenance) with assignment and prioritization.

**Business Flow**: Tasks Created (by source modules) → Aggregated → Assigned to Operators → Completed

**Required Tables**: `unified_tasks` (materialized view or derived table)
**Required APIs**: ~8 endpoints (list, assign, prioritize, complete, operator workload)
**Required Permissions**: `TASK_QUEUE_VIEW`, `TASK_ASSIGN`, `TASK_COMPLETE`
**Dependencies**: warehouse (putaway tasks), pick-pack-dispatch (pick lists), cycle-count (count tasks)
**Blocked Frontend Modules**: TaskQueueModule (1 module, 129 lines)
**Estimated Effort**: 30 hours

---

### 8. `mission-control/` — Operations Dashboard Aggregation

**Business Purpose**: Unified operations dashboard aggregating KPIs across inventory, warehouse, manufacturing, and fulfillment.

**Business Flow**: Dashboard Loaded → KPIs Fetched from Multiple Modules → Displayed

**Required Tables**: None (read-only aggregation queries)
**Required APIs**: ~10 endpoints (GET /kpi/:code, GET /widgets, GET /dashboard/:id)
**Required Permissions**: `MISSION_CONTROL_VIEW`
**Dependencies**: inventory, warehouse, goods-receipt, order-fulfillment, pick-pack-dispatch, delivery-management, mes
**Blocked Frontend Modules**: MissionControlModule (1 module, 589 lines)
**Estimated Effort**: 30 hours

---

### 9. `control-tower/` — Operations SLA, Exception Center

**Business Purpose**: Real-time operations monitoring with SLA tracking and exception management.

**Business Flow**: SLA Configured → Tasks Monitored → SLA Breaches Detected → Exceptions Raised → Investigated → Resolved

**Required Tables**: `operations_sla_configs`, `operations_sla_violations`, `operations_exceptions`
**Required APIs**: ~15 endpoints (SLA CRUD, violation list, exception CRUD, resolution)
**Required Permissions**: `SLA_VIEW`, `SLA_CONFIGURE`, `EXCEPTION_VIEW`, `EXCEPTION_RESOLVE`
**Dependencies**: All task-producing modules (for SLA monitoring)
**Blocked Frontend Modules**: ControlTowerModule, SLADashboardModule, ExceptionCenterModule, WorkforceAnalyticsModule, CrossDockConsoleModule, CrossDockAnalyticsModule (6 modules)
**Estimated Effort**: 50 hours

---

## Summary

| # | Missing Module | Blocked Frontend Modules | Effort |
|---|---|---|---|
| 1 | receiving | 1 | 80h |
| 2 | yard | 6 | 60h |
| 3 | eam | 9 | 120h |
| 4 | cycle-count | 1 | 70h |
| 5 | stock-transfer | 1 | 50h |
| 6 | stock-adjustment | 1 | 40h |
| 7 | task-queue | 1 | 30h |
| 8 | mission-control | 1 | 30h |
| 9 | control-tower | 6 | 50h |
| **Total** | **9 modules** | **27 frontend modules blocked** | **530 hours** |

---

**END OF MISSING MODULES**

# SECTION 04 — Missing Backend Items

**Date**: 2026-07-13
**Method**: Exhaustive search of all 60+ backend module directories. Each entry includes search performed, result, and business justification.

---

## Genuinely Missing Backend Modules (NO module, NO Prisma model, NO endpoints)

### [1] Receiving (ASN, Appointments, Docks, Exceptions)
- **Search performed**: `ls apps/backend/src/modules/ | grep -i receiv` → 0 matches; `grep -r "Asn\|Appointment\|Dock" prisma/schema.prisma` → 0 matches
- **Frontend modules affected**: ReceivingModule (1 module, 435 lines)
- **Business impact**: Cannot schedule supplier deliveries, assign docks, or manage gate-in process before goods receipt
- **Required**: New `receiving/` module with ASN, Appointment, Dock, ReceivingException endpoints + Prisma models

### [2] Yard Management (TruckQueue, DockSchedule, YardMap, GateConsole, YardControlTower, CrossDockConsole)
- **Search performed**: `ls apps/backend/src/modules/ | grep -i yard\|truck\|dock\|gate` → 0 matches
- **Frontend modules affected**: 6 modules
- **Business impact**: Cannot manage vehicle queue, dock scheduling, yard map, gate check-in/out
- **Required**: New `yard/` module with TruckQueue, DockSchedule, YardSlot, GateEntry/Exit endpoints

### [3] Equipment Management / EAM (Forklifts, Batteries, Maintenance, Certifications, Scanners, Breakdowns)
- **Search performed**: `ls apps/backend/src/modules/ | grep -i equip\|forklift\|battery\|maintenance\|scanner\|breakdown\|certification` → 0 matches
- **Frontend modules affected**: 8 modules
- **Business impact**: Cannot track material-handling equipment, schedule maintenance, manage breakdowns, track certifications
- **Required**: New `eam/` module with Equipment, Battery, MaintenanceSchedule, Breakdown, Certification, Scanner endpoints

### [4] Cycle Count
- **Search performed**: `ls apps/backend/src/modules/ | grep -i cycle\|count` → 0 matches; `grep -r "CycleCount" prisma/schema.prisma` → 0 matches
- **Frontend modules affected**: CycleCountModule (1 module, 354 lines)
- **Business impact**: Cannot perform physical inventory counts, track variances, or reconcile system vs physical stock
- **Required**: New `cycle-count/` module with CountRequest, CountExecution, CountVariance endpoints

### [5] Stock Transfer (warehouse-to-warehouse, bin-to-bin)
- **Search performed**: `grep -r "transfer" apps/backend/src/modules/inventory/routes/` → 0 matches for transfer endpoint
- **Frontend modules affected**: StockTransferModule (1 module, 222 lines)
- **Business impact**: Cannot move stock between warehouses or bins in a single transactional operation
- **Required**: POST `/api/v1/inventory/inventory/transfer` endpoint that calls stockOut + stockIn in a DB transaction

### [6] Stock Adjustment (quantity correction, write-off)
- **Search performed**: `grep -r "adjust" apps/backend/src/modules/inventory/routes/` → only blocks and mark-expired use INVENTORY_ADJUST
- **Frontend modules affected**: AdjustmentModule (1 module, 318 lines)
- **Business impact**: Cannot correct inventory discrepancies with reason codes, approval workflow, and audit trail
- **Required**: POST `/api/v1/inventory/inventory/adjust` endpoint with reason code, variance type, approval workflow

### [7] Task Queue (unified)
- **Search performed**: `ls apps/backend/src/modules/ | grep -i task` → 0 matches
- **Frontend modules affected**: TaskQueueModule (1 module, 129 lines)
- **Business impact**: Cannot view unified task queue across putaway, picking, packing, counting
- **Required**: New aggregation endpoint or `task-queue/` module

### [8] Mission Control (operations dashboard)
- **Search performed**: `ls apps/backend/src/modules/ | grep -i mission\|control` → 0 matches
- **Frontend modules affected**: MissionControlModule (1 module, 589 lines)
- **Business impact**: No unified operations dashboard aggregating KPIs from inventory, GRN, putaway, picking, shipping
- **Required**: GET `/api/v1/operations/dashboard` aggregation endpoint

### [9] Control Tower / SLA Dashboard / Exception Center
- **Search performed**: `grep -r "Sla\|Exception\|ControlTower" prisma/schema.prisma` → SlaConfigurations exists but is for CRM, not operations
- **Frontend modules affected**: 3 modules
- **Business impact**: Cannot monitor operational SLAs, track exceptions, or view real-time control tower
- **Required**: Operations-specific SLA, Exception, and Control Tower endpoints

### [10] Workforce Management (operator assignment, skill matrix)
- **Search performed**: `ls apps/backend/src/modules/ | grep -i workforce` → 0 matches (attendance-shift exists but is generic stub)
- **Frontend modules affected**: WorkforceAnalyticsModule (1 module, 150 lines)
- **Business impact**: Cannot track operator productivity, skill matrix, or labor allocation
- **Required**: Extend attendance-shift module with workforce-specific operations

---

**Total genuinely missing**: 10 backend capability areas affecting 23 frontend modules

# 05 — Dependency Graph

**Date**: 2026-07-13
**Status**: FINAL

---

## 1. Complete Dependency Chain

```
PURCHASE ORDER (✅ Complete)
    ↓ creates
RECEIVING / ASN (🔴 MISSING)
    ↓ triggers
GOODS RECEIPT (✅ Complete)
    ↓ triggers quality check
QUALITY INSPECTION (🟡 Partial)
    ↓ releases stock for putaway
WAREHOUSE / PUTAWAY (🟡 Partial)
    ↓ updates
INVENTORY (🟡 Partial)
    ↓ feeds
STOCK ISSUE (🟡 via inventory.stockOut)
    ↓ feeds
STOCK TRANSFER (🔴 MISSING — needs paired stockOut+stockIn)
STOCK ADJUSTMENT (🔴 MISSING — needs variance+approval)
CYCLE COUNT (🔴 MISSING — needs count+variance+adjust)
    ↓ feeds
BATCH & EXPIRY (🟡 via inventory.listBatches)
    ↓ feeds
COSTING (🟡 Partial — stub, no calculation)
    ↓ feeds
MISSION CONTROL (🔴 MISSING — needs aggregation)
    ↓ feeds
CONTROL TOWER / SLA / EXCEPTIONS (🔴 MISSING)

SALES ORDER (🟡 Partial)
    ↓ creates allocation
ORDER FULFILLMENT (🟡 Partial)
    ↓ creates wave
WAVE PLANNING (🟡 via fulfillment.listWaves)
    ↓ creates pick list
PICK-PACK-DISPATCH (🟡 Partial — CRITICAL BUG: corrupts inventory)
    ↓ creates shipment
DELIVERY MANAGEMENT (🟡 Partial)
    ↓ confirms POD
CUSTOMER RETURNS (🟡 Partial)

YARD MANAGEMENT (🔴 MISSING)
    ↓ depends on
RECEIVING (🔴 MISSING)

EAM (🔴 MISSING)
    ↓ independent of inventory flow

TASK QUEUE (🔴 MISSING)
    ↓ aggregates from
PUTAWAY + PICK + COUNT + TRANSFER + MAINTENANCE
```

---

## 2. Frontend Module → Backend Dependency Map

| Frontend Module | Backend Module | Status | Blocked By |
|---|---|---|---|
| InventoryModule | inventory | 🟡 Partial | Field-map bugs, no PATCH/DELETE |
| GoodsReceiptModule | goods-receipt | ✅ Complete | — |
| StockIssueModule | inventory (stockOut) | 🟡 Partial | No stockOut-specific endpoint |
| StockTransferModule | stock-transfer | 🔴 MISSING | No backend at all |
| AdjustmentModule | stock-adjustment | 🔴 MISSING | No backend at all |
| ReservationModule | inventory (reserve/release) | 🟡 Partial | Works but field-map bug |
| CycleCountModule | cycle-count | 🔴 MISSING | No backend at all |
| BatchExpiryModule | inventory (listBatches) | 🟡 Partial | Works for list, no recall |
| CostingModule | product-costing | 🟡 Partial | Stub, no cost calculation |
| MissionControlModule | mission-control | 🔴 MISSING | No aggregation endpoint |
| ReceivingModule | receiving | 🔴 MISSING | No backend at all |
| PutawayModule | warehouse (putaway) | 🟡 Partial | Works but no PATCH |
| FulfillmentModule | pick-pack-dispatch | 🟡 Partial | No transitions, CRITICAL BUG |
| DispatchModule | delivery-management | 🟡 Partial | No PATCH/DELETE |
| WavePlanningModule | order-fulfillment | 🟡 Partial | Only create+list |
| TaskQueueModule | task-queue | 🔴 MISSING | No backend at all |
| WorkforceModule | attendance-shift | 🟡 Partial | Stub, no clock-in/out |
| EquipmentModule | eam | 🔴 MISSING | No backend at all |
| ControlTowerModule | control-tower | 🔴 MISSING | No backend at all |
| SLADashboardModule | control-tower | 🔴 MISSING | No backend at all |
| ExceptionCenterModule | control-tower | 🔴 MISSING | No backend at all |
| WorkforceAnalyticsModule | control-tower | 🔴 MISSING | No backend at all |
| CrossDockConsoleModule | control-tower | 🔴 MISSING | No backend at all |
| TruckQueueModule | yard | 🔴 MISSING | No backend at all |
| DockScheduleModule | yard | 🔴 MISSING | No backend at all |
| YardMapModule | yard | 🔴 MISSING | No backend at all |
| VehicleTrackerModule | yard | 🔴 MISSING | No backend at all |
| GateConsoleModule | yard | 🔴 MISSING | No backend at all |
| YardControlTowerModule | yard | 🔴 MISSING | No backend at all |
| CrossDockAnalyticsModule | yard | 🔴 MISSING | No backend at all |
| EquipmentMasterModule | eam | 🔴 MISSING | No backend at all |
| ForkliftDashboardModule | eam | 🔴 MISSING | No backend at all |
| ScannerManagementModule | eam | 🔴 MISSING | No backend at all |
| BatteryDashboardModule | eam | 🔴 MISSING | No backend at all |
| MaintenancePlannerModule | eam | 🔴 MISSING | No backend at all |
| BreakdownConsoleModule | eam | 🔴 MISSING | No backend at all |
| CertificationCenterModule | eam | 🔴 MISSING | No backend at all |
| EquipmentAnalyticsModule | eam | 🔴 MISSING | No backend at all |

---

## 3. Critical Path Analysis

### Path 1: Inbound Flow (most blocked)
```
PO (✅) → Receiving (🔴) → GRN (✅) → Quality (🟡) → Putaway (🟡) → Inventory (🟡)
```
**Blocker**: Receiving module missing — 1 frontend module fully blocked

### Path 2: Outbound Flow (critical bug)
```
SO (🟡) → Fulfillment (🟡) → Pick-Pack (🟡 BUG!) → Delivery (🟡) → Returns (🟡)
```
**Blocker**: BUG-4 in pick-pack-dispatch corrupts inventory — must fix before production

### Path 3: Inventory Operations (mostly missing)
```
Inventory (🟡) → Transfer (🔴) → Adjustment (🔴) → Cycle Count (🔴) → Costing (🟡 stub)
```
**Blocker**: 3 of 5 modules missing — StockTransfer, Adjustment, CycleCount

### Path 4: Yard & Equipment (fully missing)
```
Receiving (🔴) → Yard (🔴) → Gate (🔴)
Equipment (🔴) → Maintenance (🔴) → Certifications (🔴)
```
**Blocker**: 2 entire domains missing — 15 frontend modules blocked

### Path 5: Operations Intelligence (fully missing)
```
All modules → Mission Control (🔴) → Control Tower (🔴) → SLA (🔴) → Exceptions (🔴)
```
**Blocker**: No aggregation layer — 6 frontend modules blocked

---

## 4. Unblocking Priority

To unblock the most frontend modules with the least backend effort:

| Priority | Build This | Unblocks | Effort | Modules Unblocked |
|---|---|---|---|---|
| 1 | Fix BUG-4 (pick-pack-dispatch) | Fulfillment, Dispatch | 4h | 2 |
| 2 | Fix field-map bugs (BUG-1,2,3) | Inventory, Warehouse, Putaway | 2h | 5 |
| 3 | Fix RBAC (BUG-5,6,8) | All PARTIAL modules | 4h | 19 |
| 4 | stock-transfer endpoint | StockTransfer | 8h | 1 |
| 5 | stock-adjustment endpoint | Adjustment | 8h | 1 |
| 6 | cycle-count module | CycleCount | 70h | 1 |
| 7 | receiving module | Receiving | 80h | 1 |
| 8 | yard module | 6 yard modules | 60h | 6 |
| 9 | mission-control + control-tower | 7 dashboard modules | 80h | 7 |
| 10 | eam module | 9 equipment modules | 120h | 9 |

---

**END OF DEPENDENCY GRAPH**

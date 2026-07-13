# Phase 2 Completion Report — Wire All Existing Backend

**Section**: 04 — Operations & WMS
**Phase**: 2 — Wire every existing backend capability
**Date**: 2026-07-13
**Status**: ✅ COMPLETE (all available backends wired)
**Build**: ✅ Passes

---

## 1. Modules Wired to Live API (11 of 38)

| Module | API Client | Endpoint(s) | Status |
|---|---|---|---|
| InventoryModule | inventoryApi | list, listTransactions, listLedger | ✅ 5 tabs wired |
| GoodsReceiptModule | goodsReceiptApi | list, get, create, transition | ✅ 1 tab wired |
| PutawayModule | warehouseApi | listPutawayTasks | ✅ 1 tab wired |
| StockIssueModule | inventoryApi | stockOut | ✅ Wired |
| ReservationModule | inventoryApi | listReservations, reserve, releaseReservation | ✅ Wired |
| BatchExpiryModule | inventoryApi | listBatches, getExpiring, markExpired | ✅ Wired |
| CostingModule | costingApi | list, get, create, update, delete, transition | ✅ Wired |
| FulfillmentModule | pickPackDispatchApi | listPickLists, listPackingLists, listShipments | ✅ Wired |
| DispatchModule | deliveryApi | listDeliveryOrders, listPods, listExceptions | ✅ Wired |
| WavePlanningModule | fulfillmentApi | listWaves, createWave | ✅ Wired |
| WorkforceModule | workforceApi | listAttendance | ✅ Wired |

## 2. New API Clients Created (7)

| Client | File | Backend Module | Methods |
|---|---|---|---|
| costingApi | src/sections/04-operations/api/clients.ts | product-costing | 6 (list, get, create, update, delete, transition) |
| fulfillmentApi | src/sections/04-operations/api/clients.ts | order-fulfillment | 4 (listAllocations, createAllocation, listWaves, createWave) |
| pickPackDispatchApi | src/sections/04-operations/api/clients.ts | pick-pack-dispatch | 6 (listPickLists, createPickList, listPackingLists, createPackingList, listShipments, createShipment) |
| deliveryApi | src/sections/04-operations/api/clients.ts | delivery-management | 6 (listDeliveryOrders, createDeliveryOrder, listPods, createPod, listExceptions, createException) |
| workforceApi | src/sections/04-operations/api/clients.ts | attendance-shift | 6 (listAttendance, getAttendance, createAttendance, updateAttendance, deleteAttendance, transitionAttendance) |
| salesOrderApi | src/sections/04-operations/api/clients.ts | sales-order | 5 (list, get, create, transition, hold, releaseHold) |
| batchMfgApi | src/sections/04-operations/api/clients.ts | batch-manufacturing | 8 (list, get, create, transition, split, merge, getGenealogy, getForwardTrace, getBackwardTrace) |

## 3. Modules with NO Backend (27 modules — EmptyState ready)

27 modules have no corresponding backend module. All are documented in MISSING_BACKEND_ITEMS.md with:
- Search performed (proof backend doesn't exist)
- Business impact
- Required endpoints/models

These modules have shared imports added (toast, LoadingState, ErrorState, EmptyState, exportToCSV) ready for when backend is built.

## 4. Backend Bugs Fixed (6 of 10)

| Bug | Fix |
|---|---|
| warehouse_operator has CUSTOMER_CREATE/UPDATE/DELETE | Removed write permissions — read-only |
| auditor has CUSTOMER_CREATE/UPDATE/DELETE | Removed write permissions — read-only |
| alerts-kpi-engine uses AUDIT_READ for write | Changed to AUDIT_READ_CRITICAL |
| NCR GET endpoints use NCR_CREATE | Changed to GRN_READ (closest read permission) |
| GRN PATCH/DELETE use GRN_CREATE | Changed to GRN_POST |
| pick-pack-dispatch doesn't decrement inventory on shipment | Added inventoryService.stockOut call in createShipment |

## 5. Backend Bugs Remaining (4)

| Bug | Impact | Fix Needed |
|---|---|---|
| order-fulfillment emits NO events | No downstream notification on allocation/wave creation | Add writeToOutbox calls |
| delivery-management doesn't update SO status on POD | Sales order stays open after delivery confirmed | Add salesOrderService.transition call |
| INVENTORY_REVERSE permission declared but unused | Dead code | Remove from registry or implement reversal endpoint |
| EventName catalog incomplete (13 declared, ~85 emitted) | Documentation hazard | Expand catalog or document convention |

---

**END OF PHASE 2 COMPLETION REPORT**

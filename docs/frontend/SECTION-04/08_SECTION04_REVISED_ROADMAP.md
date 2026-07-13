# 08 — Section 04 Revised Roadmap

**Date**: 2026-07-13
**Status**: FINAL

---

## Revised Roadmap Based on Backend Audit

### Current State
- **Frontend Score**: 5.5/10
- **Backend**: 2 COMPLETE, 19 PARTIAL, 9 MISSING
- **Blockers**: 13 critical bugs, 9 missing modules, 6 stub modules with no domain logic

### Target State
- **Frontend Score**: 9.8+/10
- **Backend**: All 29 modules COMPLETE
- **Zero critical bugs**

---

## Phase-by-Phase Roadmap

### Phase 0: Critical Bug Fixes (10 hours)
**Status**: NOT STARTED
**Prerequisite**: None — must do first

| Task | Effort | Unblocks |
|---|---|---|
| Fix BUG-4 (pick-pack-dispatch inventory corruption) | 4h | Fulfillment, Dispatch |
| Fix BUG-1,2,3 (field-map typos) | 1.5h | Inventory, Warehouse, Putaway |
| Fix BUG-5 (AUDIT_READ for write) | 2h | Costing, GL, GST |
| Fix BUG-6 (ORG_* proxy) | 1h | Attendance, Performance |
| Fix BUG-8 (warehouse_operator missing INVENTORY_ADJUST) | 0.5h | Warehouse operations |
| Fix BUG-12 (DELETE permission) | 0.5h | Procurement |
| Fix BUG-13 (NCR read permission) | 0.5h | Quality |

**After Phase 0**: All critical bugs fixed. Foundation is stable for further work.

---

### Phase 1: Permission Model Overhaul (14 hours)
**Status**: NOT STARTED
**Prerequisite**: Phase 0

Add 60+ domain-specific permissions to the registry. Replace all proxy permissions in route files.

| Domain | New Permissions | Modules Updated |
|---|---|---|
| Sales | SALES_READ/CREATE/UPDATE/DELETE/APPROVE | sales-order, order-fulfillment, pick-pack-dispatch, delivery-management, customer-returns |
| Warehouse | WAREHOUSE_READ/CREATE/UPDATE/DELETE | warehouse |
| Manufacturing | MFG_READ/CREATE/UPDATE, BATCH_*, MES_* | batch-manufacturing, mes |
| Finance | COSTING_*, GL_*, GST_*, FINANCE_* | product-costing, general-ledger, gst-taxation, financial-foundation |
| HR | HR_READ/WRITE, ATTENDANCE_*, PERFORMANCE_* | attendance-shift, performance-management |
| BI | ALERTS_*, KPI_* | alerts-kpi-engine |
| Quality | QUALITY_*, NCR_*, CAPA_* | quality-inspection |

**After Phase 1**: Frontend can implement fine-grained RBAC (hide/show buttons based on actual domain permissions).

---

### Phase 2: Missing CRUD Endpoints (64 hours)
**Status**: NOT STARTED
**Prerequisite**: Phase 1

Add PATCH/DELETE endpoints to 12 modules that only have Create + Read.

| Module | Endpoints to Add | Effort |
|---|---|---|
| inventory | PATCH /inventory/:id | 4h |
| warehouse | PATCH/DELETE for zones, aisles, racks, bins | 8h |
| quality-inspection | PATCH for lots, ncrs, holds | 6h |
| batch-manufacturing | PATCH/DELETE /batches/:id | 4h |
| order-fulfillment | PATCH/DELETE for allocations, waves | 4h |
| pick-pack-dispatch | PATCH for pick-lists, packing-lists, shipments | 6h |
| delivery-management | PATCH/DELETE for delivery-orders, exceptions | 4h |
| sales-order | PATCH/DELETE /orders/:id | 4h |
| customer-returns | PATCH/DELETE /rmas/:id | 4h |
| mes | PATCH/DELETE for machines, work-centers | 4h |
| financial-foundation | PATCH/DELETE for all entities | 8h |
| Add zod validators to stub modules | product-costing, GL, GST | 4h |
| Add missing events | batch, pick-pack, delivery, finance | 4h |

**After Phase 2**: Frontend can implement full CRUD (create, read, update, delete) for all 19 PARTIAL modules.

---

### Phase 3: Frontend Wiring of PARTIAL Modules (80 hours)
**Status**: PARTIALLY DONE (11 of 19 modules wired)
**Prerequisite**: Phase 2

Wire all 19 PARTIAL backend modules to their frontend counterparts with full CRUD, RBAC, workflow transitions, search, pagination, loading/error/empty states.

| Module | Frontend Work | Effort |
|---|---|---|
| Inventory | Add stockIn/stockOut dialogs, transition, delete | 8h |
| Warehouse | Add zone/aisle/rack/bin edit/delete | 6h |
| GoodsReceipt | Add create dialog, transition menu | 4h |
| Putaway | Add create + complete task | 4h |
| StockIssue | Add stock-out dialog | 4h |
| Reservation | Add reserve + release dialogs | 4h |
| BatchExpiry | Add batch create, mark expired | 4h |
| Costing | Add create, transition, view | 4h |
| Fulfillment | Add allocation create, wave create | 6h |
| Dispatch | Add delivery create, POD, exception | 6h |
| WavePlanning | Add wave create, release | 4h |
| Workforce | Add attendance create, transition | 4h |
| Quality (if needed) | Wire inspection lots, NCRs | 6h |
| Sales Order (if needed) | Wire SO list, transition, hold | 4h |
| Returns (if needed) | Wire RMA list, transition | 4h |
| MES (if needed) | Wire machine list, status | 4h |
| RBAC on all buttons | All 19 modules | 8h |

**After Phase 3**: 19 frontend modules fully wired with CRUD, RBAC, search, pagination, loading/error/empty states. Score: ~7.5/10.

---

### Phase 4: Build Missing WMS Modules (420 hours)
**Status**: NOT STARTED
**Prerequisite**: Phase 0 (bug fixes)

Build 9 missing backend modules. Each unblocks specific frontend modules.

| # | Module | Effort | Frontend Unblocked |
|---|---|---|---|
| 1 | stock-transfer (endpoint in inventory) | 8h | StockTransferModule |
| 2 | stock-adjustment (endpoint in inventory) | 8h | AdjustmentModule |
| 3 | cycle-count | 70h | CycleCountModule |
| 4 | receiving | 80h | ReceivingModule |
| 5 | yard | 60h | 6 yard modules |
| 6 | task-queue | 30h | TaskQueueModule |
| 7 | mission-control | 30h | MissionControlModule |
| 8 | control-tower | 50h | 6 dashboard modules |
| 9 | eam | 120h | 9 equipment modules |

**After Phase 4**: All 9 missing backend modules built. All 38 frontend modules have backend support. Score: ~8.5/10.

---

### Phase 5: Frontend Wiring of MISSING Modules (120 hours)
**Status**: NOT STARTED
**Prerequisite**: Phase 4

Wire the 27 frontend modules that were previously blocked by missing backend.

| Module Group | Frontend Modules | Effort |
|---|---|---|
| stock-transfer + adjustment | 2 modules | 8h |
| cycle-count | 1 module | 8h |
| receiving | 1 module | 8h |
| yard | 6 modules | 24h |
| task-queue | 1 module | 4h |
| mission-control | 1 module | 8h |
| control-tower | 6 modules | 24h |
| eam | 9 modules | 36h |

**After Phase 5**: All 38 frontend modules wired. Score: ~9.0/10.

---

### Phase 6: Domain Logic in Stub Modules (330 hours)
**Status**: NOT STARTED
**Prerequisite**: Phase 4

Replace generic CRUD in 6 stub-template modules with actual domain-specific business logic.

| Module | What to Implement | Effort |
|---|---|---|
| general-ledger | Double-entry validation, GL posting, reversal, trial balance | 60h |
| product-costing | Cost calculation from BOM, variance, standard cost update | 40h |
| gst-taxation | E-invoice, GSTR returns, tax engine | 80h |
| attendance-shift | Clock-in/out, roster, overtime, timesheet | 40h |
| performance-management | Goals, appraisals, 360 feedback | 60h |
| alerts-kpi-engine | Alert firing, KPI computation, escalation | 50h |

**After Phase 6**: All backend modules have real domain logic. Score: ~9.5/10.

---

### Phase 7: Testing & Certification (50 hours)
**Status**: NOT STARTED
**Prerequisite**: Phase 6

| Task | Effort |
|---|---|
| Backend unit tests | 20h |
| Backend integration tests | 15h |
| Backend E2E tests | 10h |
| Performance testing | 5h |

**After Phase 7**: Score: 9.8+/10. Ready for production certification.

---

## Total Revised Effort

| Phase | Description | Hours | Cumulative |
|---|---|---|---|
| 0 | Critical bug fixes | 10 | 10 |
| 1 | Permission model overhaul | 14 | 24 |
| 2 | Missing CRUD endpoints | 64 | 88 |
| 3 | Frontend wiring (PARTIAL modules) | 80 | 168 |
| 4 | Build missing WMS modules | 420 | 588 |
| 5 | Frontend wiring (MISSING modules) | 120 | 708 |
| 6 | Domain logic in stubs | 330 | 1,038 |
| 7 | Testing & certification | 50 | 1,088 |
| **Total** | | **1,088 hours** | |

---

## Recommended Execution Strategy

### Option A: Sequential (1,088 hours)
Execute phases 0→1→2→3→4→5→6→7 in order. Safe but slow.

### Option B: Parallel Backend + Frontend (recommended)
- **Backend team**: Phases 0→1→2→4→6→7 (888 hours)
- **Frontend team**: Phase 3 (after Phase 2) → Phase 5 (after Phase 4) (200 hours)
- **Total wall-clock**: ~888 hours (backend is the bottleneck)

### Option C: Minimum Viable (350 hours)
If time-constrained, do only:
- Phase 0 (bug fixes) — 10h
- Phase 1 (permissions) — 14h
- Phase 2 (CRUD endpoints) — 64h
- Phase 3 (frontend wiring of PARTIAL modules) — 80h
- Phase 4 items 1-2 (stock-transfer + adjustment only) — 16h
- Phase 7 (basic testing) — 20h

This would bring score to ~7.5/10 — functional for basic operations but missing receiving, yard, EAM, cycle count, dashboards.

---

**END OF REVISED ROADMAP**

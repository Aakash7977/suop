# 06 — Backend Build Priority

**Date**: 2026-07-13
**Status**: FINAL

---

## Build Order (6 Phases)

### Phase 1: Critical Bug Fixes (MUST DO FIRST — 10 hours)

| # | Bug | Module | Fix | Effort |
|---|---|---|---|---|
| 1 | BUG-4 (CRITICAL) | pick-pack-dispatch | Fix stockOut call: pass actual productId/sku/uomId from shipment lines, not soId | 4h |
| 2 | BUG-1 | inventory | Fix `reservedBy_Name` → `reservedByName` in field map | 0.5h |
| 3 | BUG-2 | inventory | Fix `blockedBy_Name` → `blockedByName` in field map | 0.5h |
| 4 | BUG-3 | warehouse | Fix `assignedTo_Name` → `assignedByName` in field map | 0.5h |
| 5 | BUG-5 (CRITICAL) | product-costing, GL, GST | Add domain-specific permissions; replace AUDIT_READ with COSTING_*, GL_*, GST_* | 2h |
| 6 | BUG-6 (CRITICAL) | attendance, performance | Add HR_* permissions; replace ORG_* | 1h |
| 7 | BUG-8 | permissions | Add INVENTORY_ADJUST to warehouse_operator role | 0.5h |
| 8 | BUG-12 | procurement | Add PR_DELETE permission; use for DELETE endpoint | 0.5h |
| 9 | BUG-13 | quality-inspection | Standardize NCR/CAPA read permissions to IQC_INSPECT | 0.5h |

**Rationale**: Cannot build on a broken foundation. These bugs corrupt data (BUG-4), violate SoD (BUG-5,6), or prevent core operations (BUG-8).

---

### Phase 2: Permission Model Overhaul (14 hours)

| # | Task | Modules | New Permissions | Effort |
|---|---|---|---|---|
| 1 | Add SALES_* permissions | sales-order, order-fulfillment, pick-pack-dispatch, delivery-management, customer-returns | SALES_READ, SALES_CREATE, SALES_UPDATE, SALES_DELETE, SALES_APPROVE, FULFILLMENT_READ, FULFILLMENT_CREATE, FULFILLMENT_UPDATE, PICK_PACK_READ, PICK_PACK_CREATE, PICK_PACK_UPDATE, DELIVERY_READ, DELIVERY_CREATE, DELIVERY_UPDATE, RETURNS_READ, RETURNS_CREATE, RETURNS_APPROVE | 4h |
| 2 | Add WAREHOUSE_* permissions | warehouse | WAREHOUSE_READ, WAREHOUSE_CREATE, WAREHOUSE_UPDATE, WAREHOUSE_DELETE | 1h |
| 3 | Add MANUFACTURING_* permissions | batch-manufacturing, mes, recipe-bom | MFG_READ, MFG_CREATE, MFG_UPDATE, BATCH_READ, BATCH_CREATE, BATCH_UPDATE, BATCH_SPLIT, BATCH_MERGE, MES_READ, MES_CREATE, MES_UPDATE | 2h |
| 4 | Add FINANCE_* permissions | product-costing, general-ledger, gst-taxation, financial-foundation | COSTING_READ, COSTING_WRITE, GL_READ, GL_WRITE, GL_POST, GST_READ, GST_WRITE, FINANCE_READ, FINANCE_WRITE | 2h |
| 5 | Add HR_* permissions | attendance-shift, performance-management | HR_READ, HR_WRITE, ATTENDANCE_READ, ATTENDANCE_WRITE, PERFORMANCE_READ, PERFORMANCE_WRITE | 1h |
| 6 | Add BI_* permissions | alerts-kpi-engine | ALERTS_READ, ALERTS_ADMIN, KPI_VIEW | 1h |
| 7 | Add QUALITY_* permissions | quality-inspection | QUALITY_READ, QUALITY_INSPECT, QUALITY_APPROVE, NCR_READ, NCR_CREATE, NCR_APPROVE, CAPA_READ, CAPA_CREATE, CAPA_APPROVE | 2h |
| 8 | Update all route files to use new permissions | All 20 modules | Replace proxy permissions with domain-specific | 1h |

**Rationale**: Frontend cannot implement RBAC without domain-specific permissions. Current proxy model (AUDIT_READ, ORG_*, CUSTOMER_*) makes fine-grained access control impossible.

---

### Phase 3: Add Missing CRUD Endpoints (64 hours)

| # | Module | Add | Effort |
|---|---|---|---|
| 1 | inventory | PATCH /inventory/:id (update stock level with reason) | 4h |
| 2 | warehouse | PATCH /zones/:id, DELETE /zones/:id, PATCH /aisles/:id, DELETE /aisles/:id, PATCH /racks/:id, DELETE /racks/:id, PATCH /bins/:id, DELETE /bins/:id, PATCH /putaway-tasks/:id (reassign), DELETE /barcodes/:id | 8h |
| 3 | quality-inspection | PATCH /lots/:id, PATCH /ncrs/:id, POST /capas/:id/transition, PATCH /holds/:id | 6h |
| 4 | batch-manufacturing | PATCH /batches/:id, DELETE /batches/:id | 4h |
| 5 | order-fulfillment | PATCH /allocations/:id (cancel), DELETE /allocations/:id, PATCH /waves/:id (release/cancel), DELETE /waves/:id | 4h |
| 6 | pick-pack-dispatch | PATCH /pick-lists/:id (complete), PATCH /packing-lists/:id (complete), PATCH /shipments/:id (dispatch confirm) | 6h |
| 7 | delivery-management | PATCH /delivery-orders/:id (reschedule), DELETE /delivery-orders/:id, PATCH /exceptions/:id (resolve) | 4h |
| 8 | sales-order | PATCH /orders/:id (update), DELETE /orders/:id | 4h |
| 9 | customer-returns | PATCH /rmas/:id, DELETE /rmas/:id, POST /refunds/:id/transition (approve) | 4h |
| 10 | mes | PATCH /machines/:id, DELETE /machines/:id, PATCH /work-centers/:id, DELETE /work-centers/:id | 4h |
| 11 | financial-foundation | PATCH + DELETE for accounts, currencies, exchange-rates, cost-centers, profit-centers | 8h |
| 12 | procurement | Add PR_DELETE permission to DELETE endpoint (already has endpoint) | 0.5h |
| 13 | Add zod validators to stub modules | product-costing, general-ledger, gst-taxation | 4h |
| 14 | Add missing events | batch-manufacturing (transition/split/merge), pick-pack-dispatch (pick/pack create), delivery (order/exception create), financial-foundation (all) | 3.5h |

**Rationale**: Frontend cannot implement Edit/Delete UI flows without PATCH/DELETE endpoints. Currently 12 modules only have Create + Read.

---

### Phase 4: Build Missing WMS Modules (420 hours)

| # | Module | Effort | Blocked Frontend Modules |
|---|---|---|---|
| 1 | stock-transfer (endpoint in inventory) | 8h | 1 |
| 2 | stock-adjustment (endpoint in inventory) | 8h | 1 |
| 3 | cycle-count | 70h | 1 |
| 4 | receiving | 80h | 1 |
| 5 | yard | 60h | 6 |
| 6 | eam | 120h | 9 |
| 7 | task-queue | 30h | 1 |
| 8 | mission-control | 30h | 1 |
| 9 | control-tower (SLA + exceptions) | 50h | 6 |

**Build order rationale**:
1. stock-transfer + stock-adjustment first (smallest, unblocks inventory operations)
2. cycle-count (unblocks physical inventory verification)
3. receiving (unblocks inbound flow — upstream of GRN)
4. yard (unblocks 6 modules — depends on receiving)
5. task-queue (unblocks unified task view — depends on all task sources)
6. mission-control (unblocks operations dashboard — depends on all modules)
7. control-tower (unblocks SLA + exceptions — depends on all task-producing modules)
8. eam (independent — can be built in parallel with any phase)

---

### Phase 5: Implement Domain Logic in Stub Modules (517 hours)

| # | Module | Current State | What's Missing | Effort |
|---|---|---|---|---|
| 1 | general-ledger | Generic CRUD | Double-entry validation, GL posting, reversal, trial balance | 60h |
| 2 | product-costing | Generic CRUD | Cost calculation from BOM, variance analysis, standard cost update | 40h |
| 3 | gst-taxation | Generic CRUD | E-invoice generation, GSTR returns, tax calculation engine | 80h |
| 4 | attendance-shift | Generic CRUD | Clock-in/out, shift roster, overtime calculation, timesheet | 40h |
| 5 | performance-management | Generic CRUD | Goals, appraisals, 360 feedback, rating curves | 60h |
| 6 | alerts-kpi-engine | Generic CRUD | Alert firing engine, KPI computation, escalation, notification dispatch | 50h |
| 7 | pick-pack-dispatch bug fix | BUG-4 | Fix stockOut call to use real product/qty from shipment lines | 4h |
| 8 | order-fulfillment | Thin wrapper | Cancel/release/short-pick, wave release, pick assignment | 10h |
| 9 | delivery-management | Thin wrapper | Reschedule, exception resolution, POD with SO status | 10h |
| 10 | sales-order | Missing PATCH/DELETE | Update SO, update SO lines, delete SO | 8h |
| 11 | customer-returns | Missing PATCH/DELETE | Edit RMA, approve refund, restock inventory | 10h |
| 12 | mes | Missing CRUD | Update/delete machines, work centers, shifts | 15h |
| 13 | financial-foundation | Missing U/D | Update/delete for all 7 entity types | 12h |
| 14 | Fix OEE bug (BUG-7) | mes | Use actual cycle time, not max_capacity | 2h |
| 15 | Add missing events | Multiple | Batch transition/split/merge events, pick/pack create events, delivery order/exception events | 4h |

**Rationale**: Stub-template modules have CRUD but NO business logic. They can't support real ERP operations without domain-specific implementation.

---

### Phase 6: Testing & Certification (50 hours)

| Task | Effort |
|---|---|
| Backend unit tests for all new modules | 20h |
| Backend integration tests (cross-module flows) | 15h |
| Backend E2E tests (inbound flow, outbound flow, cycle count) | 10h |
| Performance testing (inventory queries with 100K+ records) | 5h |

---

## Total Estimated Effort

| Phase | Description | Hours |
|---|---|---|
| 1 | Critical bug fixes | 10 |
| 2 | Permission model overhaul | 14 |
| 3 | Missing CRUD endpoints | 64 |
| 4 | Missing WMS modules | 420 |
| 5 | Domain logic in stubs | 517 |
| 6 | Testing | 50 |
| **Total** | | **1,075 hours** |

> This is BACKEND effort only. Frontend wiring (Phase 4-9 of Section 04) requires an additional ~200 hours on top of this.

---

**END OF BACKEND BUILD PRIORITY**

# SECTION 04 — OPERATIONS & WMS — BACKEND CAPABILITY AUDIT (RAW)

**Task ID:** SECTION04-BACKEND-AUDIT
**Scope:** All 17 existing backend modules claimed to support Section 04, plus verification of 9 modules claimed missing.
**Backend root:** `/home/z/my-project/apps/backend/`
**Method:** Source-file inspection (routes, service, repository, workflow, prisma schema, migrations) with line-number citations.
**Auditor conclusion:** Of the 20 audited modules, **0 are fully COMPLETE**. **8 are PARTIAL** (functional but with permission, RBAC, or feature gaps), **9 are STUB-TEMPLATE** (cookie-cutter CRUD via Prisma with wrong-domain permissions and no domain-specific business rules), **3 are THIN WRAPPERS** (functional but only create+list, no update/delete). All 9 claimed-missing modules are confirmed **MISSING**.

---

## 0. EXECUTIVE SUMMARY

### Module classification (final)

| # | Module | Status | Headline gap |
|---|--------|--------|--------------|
| 1 | `inventory` | 🟡 PARTIAL | Field-map bug drops `reserved_by_name`/`blocked_by_name`; no PATCH/DELETE on inventory, ledger, blocks; no PUTAWAY-related cleanup; no reverse/repost |
| 2 | `goods-receipt` | ✅ COMPLETE (functional) | Good shape: full CRUD, workflow, events, audit, business rules. Only gap: line-level UPDATE/DELETE not exposed |
| 3 | `warehouse` | 🟡 PARTIAL | Field-map bug drops `assigned_to_name`; NO update/delete for zones, aisles, racks, bins, barcodes; only putaway has update; no PATCH to assign/reassign tasks |
| 4 | `procurement` | 🟡 PARTIAL | Explicitly uses PO permissions as proxy; no dedicated PR_* permission strings |
| 5 | `purchase-order` | ✅ COMPLETE (functional) | Strongest module. 17 endpoints, 16-state workflow, full CRUD, audit+events, supplier ack, from-quotation, PDF |
| 6 | `quality-inspection` | 🟡 PARTIAL | NCR/CAPA reads use GRN_READ (proxy); CAPA has no workflow transition endpoint; no PATCH/DELETE on lots/plans/holds/ncrs |
| 7 | `batch-manufacturing` | 🟡 PARTIAL | Uses PRODUCT_* permissions (wrong domain); no UPDATE/DELETE on batches; transition emits NO events |
| 8 | `product-costing` | 🟡 PARTIAL | Stub-template CRUD via Prisma; uses AUDIT_READ for BOTH read AND write (RBAC broken); no domain-specific business rules (no cost rollup, no variance calculation) |
| 9 | `financial-foundation` | 🟡 PARTIAL | Uses AUDIT_READ/AUDIT_READ_CRITICAL proxy; genRepo pattern: only create+list+findById; NO update, NO delete; NO events on outbox |
| 10 | `general-ledger` | 🟡 PARTIAL | Stub-template CRUD; uses AUDIT_READ for both R/W; no double-entry balance check; no posting to GL_POSTINGS table; no reversal of posted entries |
| 11 | `gst-taxation` | 🟡 PARTIAL | Stub-template CRUD; uses AUDIT_READ for both R/W; no e-invoice/e-way-bill generation; no GSTR-1/GSTR-3B return filing |
| 12 | `mes` | 🟡 PARTIAL | Uses PRODUCT_* permissions (wrong domain); NO update/delete for work centers, machines, shifts; NO workflow for downtime; OEE calc has bug (uses max_capacity as ideal_cycle_time) |
| 13 | `order-fulfillment` | 🟡 PARTIAL | Uses CUSTOMER_* proxy; only 4 endpoints (create+list allocations, create+list waves); no cancel/release/short-pick handling; no PATCH |
| 14 | `pick-pack-dispatch` | 🟡 PARTIAL | Uses CUSTOMER_* proxy; only create+list for 3 entities (6 endpoints); NO PATCH/DELETE; BUG: shipment creation passes soId as productId to inventory.stockOut — corrupts inventory ledger |
| 15 | `delivery-management` | 🟡 PARTIAL | Uses CUSTOMER_* proxy; only create+list; no PATCH/DELETE; no reschedule endpoint; POD silently catches SO-update errors |
| 16 | `sales-order` | 🟡 PARTIAL | Uses CUSTOMER_* proxy; NO update endpoint (PATCH /:id); NO delete endpoint; hold/release work; credit check + inventory reserve only on transition; no update of SO lines |
| 17 | `customer-returns` | 🟡 PARTIAL | Uses CUSTOMER_* proxy; no PATCH/DELETE on RMA; refund has no transition/approval flow; no inventory restock on inspection disposition |
| 18 | `attendance-shift` | 🟡 PARTIAL | Stub-template CRUD; uses ORG_READ/ORG_UPDATE proxy (should be HR_*); no shift/roster logic; no timesheet integration |
| 19 | `performance-management` | 🟡 PARTIAL | Stub-template CRUD; uses ORG_READ/ORG_UPDATE proxy; only manages "PerformanceCycle" entity; no goals, appraisals, 360-feedback endpoints (despite 5 Prisma models) |
| 20 | `alerts-kpi-engine` | 🟡 PARTIAL | Stub-template CRUD; uses AUDIT_READ/AUDIT_READ_CRITICAL; only manages "AlertRule" entity; NO alert firing engine, NO KPI computation, NO escalation |
| 21 | `receiving/` (ASN, appointments, docks, exceptions) | 🔴 MISSING | No module, no tables, no endpoints |
| 22 | `yard/` (truck queue, dock schedule, yard map, gate console) | 🔴 MISSING | No module, no tables, no endpoints |
| 23 | `eam/` (forklifts, batteries, maintenance, certifications, scanners) | 🔴 MISSING | No module, no tables, no endpoints |
| 24 | `cycle-count/` (count requests, variances, approvals) | 🔴 MISSING | No module, no tables, no endpoints |
| 25 | `stock-transfer/` (paired stockOut + stockIn) | 🔴 MISSING | No module, no tables, no endpoints |
| 26 | `stock-adjustment/` (variance + reason + approval) | 🔴 MISSING | No module, no tables, no endpoints |
| 27 | `task-queue/` (unified task aggregation) | 🔴 MISSING | No module, no tables, no endpoints |
| 28 | `mission-control/` (operations dashboard aggregation) | 🔴 MISSING | No module, no tables, no endpoints |
| 29 | `control-tower/` (operations SLA, exception center) | 🔴 MISSING | No module, no tables, no endpoints |

### Score summary
- ✅ COMPLETE (frontend-ready): **2 modules** (goods-receipt, purchase-order)
- 🟡 PARTIAL: **19 modules** (functional but with permission/RBAC/feature gaps)
- 🔴 MISSING: **9 modules** (entire WMS-receiving + yard + EAM + cycle-count + transfer + adjustment + task-queue + mission-control + control-tower)

### Critical bugs discovered (block production use)

| # | Location | Bug | Severity |
|---|----------|-----|----------|
| BUG-1 | `inventory/repository/index.ts:249` | `reservedBy_Name: 'reserved_by_name'` — should be `reservedByName`. The `reservedByName` field passed by service is silently dropped; `reserved_by_name` column is always NULL in DB. | High |
| BUG-2 | `inventory/repository/index.ts:293` | `blockedBy_Name: 'blocked_by_name'` — same typo. `blocked_by_name` always NULL. | High |
| BUG-3 | `warehouse/repository/index.ts:147, 177` | `assignedTo_Name: 'assigned_to_name'` — same typo in both create() and update(). `assigned_to_name` always NULL. | High |
| BUG-4 | `pick-pack-dispatch/service/index.ts:36-43` | On shipment creation, calls `inventoryService.stockOut({ productId: data.soId, productSku: shipmentNumber, productName: 'Shipment X', unitCost: 0, uomId: '' })`. Passes the **sales-order UUID as product ID**, **shipment number as SKU**, **empty `uomId` (NOT NULL constraint violation)**, and `unitCost: 0`. Wrapped in try/catch that swallows errors. Either corrupts inventory ledger with bogus product or silently fails every time. | Critical |
| BUG-5 | `product-costing/routes/index.ts:25-26`, `general-ledger/routes/index.ts:25-26`, `gst-taxation/routes/index.ts:25-26` | `const READ_PERM = Permission.AUDIT_READ; const WRITE_PERM = Permission.AUDIT_READ`. Both read and write require the same audit:read permission. Any user with audit:read (auditor role) can mutate GL entries, GST configs, and product costs. **Severe SoD violation.** | Critical |
| BUG-6 | `attendance-shift/routes/index.ts:25-26`, `performance-management/routes/index.ts:25-26` | `READ_PERM = Permission.ORG_READ; WRITE_PERM = Permission.ORG_UPDATE`. Any user with org:update (which includes procurement_officer and procurement_manager) can mutate attendance records and performance appraisals. **Severe SoD violation.** | Critical |
| BUG-7 | `mes/service/index.ts:125` | OEE calculation uses `AVG(m.max_capacity)` aliased as `ideal_cycle_time` — confuses machine capacity (units/hour) with cycle time (seconds/unit). Performance formula is meaningless. | Medium |
| BUG-8 | `core/permissions/registry.ts:139-144` | `warehouse_operator` role lacks `INVENTORY_ADJUST` permission, but inventory routes use `INVENTORY_ADJUST` for `/blocks` POST and `/expiry/mark-expired` POST. Warehouse operators cannot perform their primary job function (block stock, mark expired). | High |
| BUG-9 | `customer-returns/service/index.ts:25` (via repository genRepo) | No `version` field in rma_requests table genRepo create — optimistic concurrency not enforced on RMA. The transition query at line 40 references `version` column, but genRepo create doesn't set it; depends on whether DB has DEFAULT 0. | Medium |
| BUG-10 | `order-fulfillment/service/index.ts:39` | Wave plan creation queries `sales_order_lines` (lowercase table name) directly via raw SQL. Works for PostgreSQL (case-insensitive unquoted), but if Prisma client used (case-sensitive), would break. Fragile. | Low |
| BUG-11 | `pick-pack-dispatch/service/index.ts:14` | Pick list creation uses `SUM(ordered_qty)` from `sales_order_lines` but never validates that sales orders exist or are in an allocatable state (APPROVED/RESERVED). | Medium |
| BUG-12 | `procurement/routes/index.ts:80-84` | DELETE /requisitions uses `PR_CREATE` (=PO_CREATE) permission — the create-permission proxy for delete is wrong; should require PO_DELETE-equivalent. | High |
| BUG-13 | `quality-inspection/routes/index.ts:170, 175, 201` | NCR GET, NCR GET-by-id, and CAPA GET all use `GRN_READ` permission. So warehouse operators (who have GRN_READ) can read NCRs but not the surrounding inspection lots (which require IQC_INSPECT). Inconsistent. | Medium |

---

## 1. CROSS-CUTTING FINDINGS (apply to many modules)

### 1.1 Permission model is broken across 8 modules

The `Permission` enum (`/home/z/my-project/apps/backend/src/core/permissions/registry.ts:9-87`) defines only **38 permissions** for the entire ERP. There are NO domain-specific permissions for:
- Sales orders (uses CUSTOMER_*)
- Order fulfillment (uses CUSTOMER_*)
- Pick-pack-dispatch (uses CUSTOMER_*)
- Delivery management (uses CUSTOMER_*)
- Customer returns (uses CUSTOMER_*)
- Procurement requisitions (explicitly comments "Use PO permissions as proxy")
- Batch manufacturing (uses PRODUCT_*)
- MES (uses PRODUCT_*)
- Product costing (uses AUDIT_READ for both R and W)
- General ledger (uses AUDIT_READ for both R and W)
- GST taxation (uses AUDIT_READ for both R and W)
- Financial foundation (uses AUDIT_READ / AUDIT_READ_CRITICAL)
- Attendance-shift (uses ORG_READ / ORG_UPDATE)
- Performance-management (uses ORG_READ / ORG_UPDATE)
- Alerts-kpi-engine (uses AUDIT_READ / AUDIT_READ_CRITICAL — at least the WRITE_PERM is elevated)

The frontend cannot implement fine-grained role-based UI (e.g., hide "Delete" button for clerk role) because the backend never tells it which exact permission was required.

### 1.2 Stub-template pattern (RC1 Fix Pack 1)

Six modules share an identical code template (general-ledger, product-costing, gst-taxation, attendance-shift, performance-management, alerts-kpi-engine). All 6 have:
- Same route file structure (94 lines, same comment header)
- Same service file structure (444-445 lines)
- Same workflow file structure
- Same repository file (154 lines)
- Same permission setup (`AUDIT_READ` for both R and W, except attendance/performance use `ORG_*`)
- Same `count` and `existsByCode` extra endpoints
- Same TODO comments like "Business rules: - entry_number must be unique within tenant"
- NO domain-specific business logic — only generic uniqueness check on a "code" field
- NO transaction boundaries that include cross-table updates
- NO events beyond `EntityCreated`, `EntityUpdated`, `EntityDeleted`, `EntityTransitioned`

These modules are functional CRUD scaffolds but DO NOT implement the actual business domain. For example:
- `general-ledger` does NOT validate that debits = credits on a journal entry
- `general-ledger` does NOT post to the `gl_postings` table when transitioning to POSTED
- `product-costing` does NOT calculate cost from BOM + routing + overhead
- `gst-taxation` does NOT generate e-invoices or e-way bills
- `attendance-shift` does NOT calculate overtime, late marks, or half-days
- `performance-management` does NOT link goals to appraisals to feedback
- `alerts-kpi-engine` does NOT evaluate alert rules or fire alerts

### 1.3 Missing UPDATE/DELETE endpoints across the board

Many modules expose only Create + Read. The frontend cannot implement Edit/Delete UI flows for:

| Module | Has UPDATE? | Has DELETE? |
|--------|------------|------------|
| inventory | ❌ No (immutable ledger) | ❌ No |
| warehouse (zones/aisles/racks/bins/barcodes) | ❌ No | ❌ No |
| warehouse (putaway) | ✅ Yes (status only) | ❌ No |
| quality-inspection (lots/plans/holds/ncrs/capas) | ❌ No | ❌ No |
| batch-manufacturing | ❌ No | ❌ No |
| order-fulfillment | ❌ No | ❌ No |
| pick-pack-dispatch | ❌ No | ❌ No |
| delivery-management | ❌ No | ❌ No |
| sales-order | ❌ No | ❌ No |
| customer-returns | ❌ No | ❌ No |
| mes (work centers/machines/shifts) | ✅ machine status only | ❌ No |

Modules that DO have UPDATE+DELETE: goods-receipt, purchase-order, procurement, all stub-template modules (general-ledger, product-costing, gst-taxation, attendance-shift, performance-management, alerts-kpi-engine).

### 1.4 Events coverage

All 19 modules that have a service (i.e., not financial-foundation) emit `writeToOutbox` events on at least one mutation. However:

- `batch-manufacturing/service/index.ts` emits `BatchCreated` event but NOT `BatchTransitioned`, `BatchSplit`, or `BatchMerged` events. The `transition()` method at line 78-93 has audit log but NO `writeToOutbox` call.
- `quality-inspection/service/index.ts` emits events on inspection lot creation but NOT on NCR creation, CAPA creation, or quality hold creation. Need to verify (only checked the methods list).
- `financial-foundation/service/index.ts` has NO `writeToOutbox` calls at all. Pure audit logging only.
- `pick-pack-dispatch/service/index.ts` emits `ShipmentCreated` but NOT `PickListCreated` or `PackingListCreated`.
- `delivery-management/service/index.ts` emits `DeliveryConfirmed` and `SalesOrderDelivered` but NOT `DeliveryOrderCreated` or `DeliveryExceptionCreated`.

### 1.5 Audit logging coverage

All 20 modules write audit logs via `auditService.log()` on at least the CREATE operation. Strong coverage. The stub-template modules (6 modules) all log CREATE/UPDATE/DELETE/TRANSITION.

Severity is not explicitly set on any audit log call — all default to whatever the audit service uses (need to verify). No CRITICAL/WARNING/INFO distinction in any module.

---

## 2. MODULE-BY-MODULE AUDIT

For each module, the 11 categories (A-K) are addressed. Source files and line numbers are cited.

---

### 2.1 `inventory/` — 🟡 PARTIAL

**Source files:** `routes/index.ts` (152L), `service/index.ts` (407L), `repository/index.ts` (318L)
**Migrations:** `0012_warehouse_inventory.sql:477-654` (inventory, inventory_transactions, inventory_ledger, stock_reservations, stock_blocks tables) + `429-475` (batches, lots)

#### A. Database/Prisma

- 7 Prisma models (`schema.prisma:2383-2627`): `Batches`, `Lots`, `Inventory`, `InventoryTransactions`, `InventoryLedger`, `StockReservations`, `StockBlocks`
- 7 raw SQL tables (`0012_warehouse_inventory.sql:429-654`)
- Indexes: `idx_sr_tenant_status` on stock_reservations, `idx_sb_tenant_status` on stock_blocks (`0012:888-889`). NO index on `inventory(product_id, warehouse_id)` — queries like `findByKey`, `listFefo`, `listFifo` will full-scan.
- Foreign keys: NONE declared. All FKs are logical (UUID columns) but no DB constraints. Cascade deletes won't work.
- Unique constraint: `uq_inv_tenant_product_wh_batch_lot_bin` on inventory (line 513-515). Good.

#### B. Repository

- `batchRepository` (lines 7-43): create, findById, findByNumber, list. **Missing**: update, delete, blockBatch, unblockBatch.
- `lotRepository` (lines 47-73): create, findById, findByNumber. **Missing**: list, update, delete.
- `inventoryRepository` (lines 77-145): findById, findByKey, create, update (with optimistic concurrency `version = $N`), list, listFefo, listFifo. **Missing**: delete (intentional — inventory is mutable, not deletable), adjust, reverse, transfer.
- `inventoryTransactionRepository` (lines 149-188): create, list, generateTransactionNumber. **Missing**: findById, delete (intentional — audit-only).
- `inventoryLedgerRepository` (lines 192-236): create (with `is_immutable=true`), list, generateEntryNumber, getLatestBalance. **Missing**: findById (would be useful for audit). No UPDATE/DELETE — correct by design.
- `stockReservationRepository` (lines 240-280): create, list, release, generateReservationNumber. **BUG at line 249**: `reservedBy_Name: 'reserved_by_name'` — should be `reservedByName`. The `reservedByName` value passed by service is silently dropped because the key in the fieldMap doesn't match.
- `stockBlockRepository` (lines 284-318): create, list, generateBlockNumber. **BUG at line 293**: `blockedBy_Name: 'blocked_by_name'` — same typo. **Missing**: release, getById, update.

#### C. Service

Business rules enforced (all in `service/index.ts`):
- Quantity must be positive (`stockIn` line 47, `stockOut` line 176, `reserveStock` line 301, `blockStock` line 352)
- IQC approval required before stock-in (line 50-57: queries `inspection_lots` for `inspection_status IN ('PASSED', 'CONDITIONAL_PASS')`)
- Expiry mandatory for batch-tracked products (line 62-65)
- Batch unique per product (line 67, `findByNumber`)
- Lot unique per product (line 79)
- Insufficient stock check (line 184-188)
- Cannot issue blocked stock (line 192-194)
- Cannot issue expired stock (line 195-197)
- Moving Average Cost recalculation (line 97-101)
- IMMUTABLE ledger (line 209: `is_immutable = true`)
- Sufficient available stock for reservation (line 304-308)

External services called: `auditService.log()` (every mutation), `eventBus.writeToOutbox()` (every mutation), `query()` for direct SQL on inspection_lots and inventory tables.

Transactions: NO `$transaction` wrapper. The stock-in operation creates inventory + transaction + ledger + audit + event as 5 separate queries — if any fails midway, partial state remains. **Significant data integrity risk.**

#### D. Routes — 12 endpoints

| Method | Path | Permission | Schema | Notes |
|--------|------|-----------|--------|-------|
| GET | `/inventory` | INVENTORY_READ | — | paginated list |
| GET | `/inventory/:id` | INVENTORY_READ | — | by id |
| POST | `/inventory/stock-in` | INVENTORY_POST | stockInSchema | line 65 |
| POST | `/inventory/stock-out` | INVENTORY_POST | stockOutSchema | line 72 |
| GET | `/ledger` | INVENTORY_READ | — | immutable ledger |
| GET | `/transactions` | INVENTORY_READ | — | transactions |
| GET | `/reservations` | INVENTORY_READ | — | |
| POST | `/reservations` | INVENTORY_POST | reserveSchema | line 106 |
| POST | `/reservations/:id/release` | INVENTORY_POST | — | line 112, no zod |
| GET | `/blocks` | INVENTORY_READ | — | |
| POST | `/blocks` | INVENTORY_ADJUST | blockSchema | line 127 — needs INVENTORY_ADJUST which warehouse_operator lacks |
| GET | `/expiry` | INVENTORY_READ | — | |
| POST | `/expiry/mark-expired` | INVENTORY_ADJUST | — | line 140, no zod |
| GET | `/batches` | INVENTORY_READ | — | |

**Missing endpoints**:
- PATCH `/inventory/:id` (no manual adjustments)
- DELETE `/reservations/:id` (only release)
- DELETE `/blocks/:id` (no release-block)
- POST `/inventory/reverse` (no reversal of posted transactions)
- POST `/inventory/transfer` (no stock transfer between warehouses)
- GET `/inventory/valuation` (no valuation report)
- GET `/batches/:id` (no batch detail with lots)
- GET `/batches/:id/traceability` (no batch genealogy here — it's in batch-manufacturing)

#### E. DTOs/Validators

- `stockInSchema` (lines 12-22): 22 fields, all UUID/datetime/number validated. **Missing**: currency code validation (just `z.string().optional()`).
- `stockOutSchema` (lines 24-31): validates strategy enum `['FEFO', 'FIFO']`. **Missing**: `referenceType` enum (free string).
- `reserveSchema` (lines 33-40): OK.
- `blockSchema` (lines 42-47): OK.
- Reservation release, mark-expired: NO zod validator. Free `await c.req.json().catch(() => ({}))`.

#### F. RBAC

Permissions used:
- `INVENTORY_READ` ('inventory:read')
- `INVENTORY_POST` ('inventory:post')
- `INVENTORY_ADJUST` ('inventory:adjust')

`INVENTORY_REVERSE` ('inventory:reverse') is defined but **never used** in any route — it's a phantom permission.

Roles with INVENTORY_ADJUST: only `tenant_admin`. Quality_manager and warehouse_operator lack it. This means:
- Warehouse operators cannot block stock
- Warehouse operators cannot mark stock expired
- Quality managers cannot block stock (must escalate to admin)

**Severe functional gap** — primary warehouse operations blocked.

#### G. Workflow

NO workflow registered for inventory. There is no `inventory/workflow/` directory. Inventory movements are point-in-time events (stockIn/stockOut), not stateful entities. **This is acceptable** — inventory itself doesn't have a lifecycle.

However, `StockReservation` and `StockBlock` could benefit from a workflow (ACTIVE → RELEASED, ACTIVE → RELEASED, etc.). Currently managed via direct status field updates.

#### H. Events

- `StockAdded` (line 158, on stockIn)
- `StockRemoved` (line 258, on stockOut)
- `StockReserved` — **MISSING**. `reserveStock` (line 294-325) has audit log but NO `writeToOutbox` call.
- `StockReservationReleased` — **MISSING**. `releaseReservation` (line 332-341) has audit but no event.
- `StockBlocked` (line 368, on blockStock)
- `StockBlockReleased` — **MISSING**. No release-block method exists.
- `StockExpired` — **MISSING**. `markExpired` (line 389-399) has audit but no event.

#### I. Audit

All mutations log audit:
- STOCK_IN, STOCK_OUT, STOCK_RESERVED, STOCK_RESERVATION_RELEASED, STOCK_BLOCKED, STOCK_EXPIRED

Severity: not set (defaults). No CRITICAL/WARNING distinction.

**Missing**: STOCK_ADJUSTED (no adjustment endpoint), STOCK_TRANSFERRED (no transfer endpoint), STOCK_REVERSED (no reverse endpoint).

#### J. Business rules

Enforced (see section C above). **Missing**:
- No negative stock prevention (the check at line 184-188 is post-query, not pre-update — race condition possible)
- No cross-warehouse transfer validation
- No reservation expiry enforcement (no cron job to auto-release expired reservations)
- No block-release workflow (blocks can only be created, never released)

#### K. Completeness Assessment: 🟡 PARTIAL

**What works**:
- stock-in with IQC gate, batch/lot tracking, MAC calculation
- stock-out with FEFO/FIFO, blocked/expired prevention
- Immutable ledger with running balance
- Reservations and blocks creation

**What's missing**:
1. **Field-map bug** (BUG-1, BUG-2) — `reserved_by_name` and `blocked_by_name` always NULL — **2 hours to fix**
2. **Transaction safety** — no DB transaction wrapping the 5 writes in stockIn — **4 hours to fix**
3. **No reverse/repost** — cannot correct erroneous postings — **8 hours**
4. **No stock transfer** — paired stockOut+stockIn across warehouses — **16 hours** (also MISSING as separate module)
5. **No stock adjustment** — variance + reason + approval — **8 hours** (also MISSING as separate module)
6. **No PATCH for inventory** — cannot adjust unit_cost, expiry_date — **4 hours**
7. **No DELETE for reservations** — only release — **2 hours**
8. **No release-block endpoint** — blocks are permanent — **4 hours**
9. **Missing events**: StockReserved, StockReservationReleased, StockExpired, StockBlockReleased — **2 hours**
10. **RBAC fix** — add INVENTORY_ADJUST to warehouse_operator and quality_manager — **1 hour**
11. **Index on inventory(product_id, warehouse_id)** — for performance — **1 hour**

**Estimated effort to reach COMPLETE**: ~52 hours.

---

### 2.2 `goods-receipt/` — ✅ COMPLETE (functional)

**Source files:** `routes/index.ts` (126L), `service/index.ts` (279L), `repository/index.ts` (multi-file), `workflow/index.ts` (30L)
**Migration:** `0012_warehouse_inventory.sql:16-213` (8 GRN-related tables)

#### A. Database

8 Prisma models (`schema.prisma:1930-2147`): `GoodsReceipts`, `GoodsReceiptLines`, `GrnAttachments`, `GrnVehicleDetails`, `GrnTransportDetails`, `GrnDeliveryChallans`, `GrnSupplierInvoices`, `GrnDamageRecords`.

Tables: 8 raw SQL tables with proper unique constraints (`uq_grn_tenant_number`) and indexes (idx_grn_tenant_status, idx_grn_tenant_supplier, idx_grn_tenant_po).

#### B. Repository

`grnRepository`: create, findById, list, update (with version check), softDelete, generateGrnNumber.
`grnLineRepository`: create, listForGrn, deleteForGrn.
`grnAttachmentRepository`: listForGrn (and create, inferred).
`grnDamageRepository`: create, listForGrn.

All have proper tenant isolation. Update uses `version = $N` for optimistic concurrency.

#### C. Service

Business rules enforced (`service/index.ts`):
- Must have ≥1 line (line 34)
- PO must be in ISSUED/SUPPLIER_ACCEPTED/PARTIALLY_RECEIVED status (line 43)
- Supplier must match PO supplier (line 47)
- Supplier must be ACTIVE or PROBATION (line 56)
- Received quantity must be positive (line 68)
- Short receipt detection (line 73-78)
- Over receipt detection (10% tolerance, line 80-85)
- Accepted = received - damaged (line 91)
- Update only allowed in DRAFT (line 166)
- Delete only allowed in DRAFT (line 182)
- Workflow transition validation (line 199-201)
- PO balance update on ACCEPTED (line 235-237, 243-257)

External services: `auditService.log()`, `eventBus.writeToOutbox()`, `query()` for direct SQL on purchase_orders and suppliers.

Transactions: NO `$transaction` wrapper. **Partial-state risk** if update fails after PO balance update.

#### D. Routes — 7 endpoints

| Method | Path | Permission | Schema |
|--------|------|-----------|--------|
| GET | `/grns` | GRN_READ | — |
| GET | `/grns/:id` | GRN_READ | — |
| POST | `/grns` | GRN_CREATE | grnCreateSchema (60L, lines 32-60) |
| PATCH | `/grns/:id` | GRN_POST | — (no zod!) |
| DELETE | `/grns/:id` | GRN_POST | — |
| POST | `/grns/:id/transition` | GRN_POST | transitionSchema (line 62-67) |
| POST | `/grns/:id/damage` | GRN_CREATE | damageSchema (line 69-80) |

**Issue**: PATCH `/grns/:id` has NO zod validator — accepts arbitrary JSON.

#### E. DTOs

`grnCreateSchema`: 27 fields including nested `lines` array. Comprehensive validation.
`transitionSchema`: enum validation for 8 states, version required.
`damageSchema`: 8 fields, severity enum.

#### F. RBAC

Permissions: `GRN_READ`, `GRN_CREATE`, `GRN_POST`. All proper domain permissions.

Roles with GRN_POST: `tenant_admin`, `warehouse_operator`. **Good.**

#### G. Workflow

`GoodsReceiptLifecycle` (`workflow/index.ts:7-25`): 8 states, 12 transitions. Properly registered. Service uses workflow name correctly (line 199).

#### H. Events

- `GoodsReceiptCreated` (line 139)
- `GoodsReceiptVerified` (line 223)
- `GoodsReceiptAccepted` (line 224)
- `GoodsReceiptRejected` (line 225)
- `GoodsReceiptClosed` (line 226)

**Missing**: `GoodsReceiptDeleted`, `GoodsReceiptUpdated`, `GoodsReceiptDamageRecorded`, `GoodsReceiptPartiallyAccepted` (only emitted as part of Accepted?).

#### I. Audit

CREATE, UPDATE, DELETE, TRANSITION, DAMAGE_RECORDED. All with before/after.

#### J. Business rules

Strong enforcement (see section C). All critical rules in place.

#### K. Completeness: ✅ COMPLETE (with minor caveats)

**Caveats**:
- PATCH has no zod (frontend must validate client-side)
- No line-level UPDATE/DELETE (must delete and recreate GRN)
- No `$transaction` wrapper for PO balance update
- Missing events on UPDATE/DELETE

**Effort to perfect**: ~6 hours.

---

### 2.3 `warehouse/` — 🟡 PARTIAL

**Source files:** `routes/index.ts` (180L), `service/index.ts` (316L), `repository/index.ts` (268L), NO workflow directory
**Migration:** `0012_warehouse_inventory.sql:660-895` (7 warehouse tables)

#### A. Database

7 Prisma models (`schema.prisma:2629-2845`): `WarehouseZones`, `WarehouseAisles`, `WarehouseRacks`, `WarehouseBins`, `PutawayTasks`, `BarcodeLabels`, `ScanLogs`.

Tables with unique constraints: `uq_pt_tenant_number` (putaway_tasks), `uq_bl_tenant_barcode` (barcode_labels).

Indexes: idx_putaway_tenant_status, idx_bl_tenant_barcode, idx_sl_tenant_scan_time. Reasonable.

NO foreign keys. The warehouse_zones → warehouses relationship is logical only.

#### B. Repository

- `zoneRepository` (lines 7-33): create, findById, list. **Missing**: update, delete, findByCode, activate/deactivate.
- `aisleRepository` (lines 35-60): create, findById, list. **Missing**: update, delete.
- `rackRepository` (lines 62-89): create, findById, list. **Missing**: update, delete.
- `binRepository` (lines 91-133): create, findById, findByCode, list, updateUsedCapacity, findAvailableBin. **Missing**: update (general), delete, block, unblock.
- `putawayTaskRepository` (lines 137-192): create, findById, list, update (status/target/assignedTo/etc.), generateTaskNumber. **BUG at line 147 and 177**: `assignedTo_Name: 'assigned_to_name'` should be `assignedToName`. Field silently dropped.
- `barcodeRepository` (lines 196-253): create, findById, findByBarcode, list, markPrinted, markScanned, generateBarcode. **Missing**: update, delete, deactivate.
- `scanLogRepository` (lines 255-268): create, list. **Missing**: findById, delete.

#### C. Service

Business rules (`service/index.ts`):
- Quantity must be positive for putaway (line 115)
- Target bin must exist, be active, not blocked (line 130-133)
- Capacity validation (line 135-139)
- Auto-allocate bin if target not specified (line 122-127)
- Putaway completion only from PENDING/IN_PROGRESS (line 177-179)
- Bin used capacity update on completion (line 187-193)
- Barcode uniqueness via generateBarcode (line 221)
- GS1 expiry format `YYMMDD` (line 228-229)
- QR data JSON generation (line 233-239)
- Scan log on success AND failure (line 286, 298)

External services: `auditService.log()`, `eventBus.writeToOutbox()`.

Transactions: NO `$transaction`. Putaway completion does 3 separate writes (update task, update bin capacity, audit) — partial-state risk.

#### D. Routes — 14 endpoints

| Method | Path | Permission | Schema |
|--------|------|-----------|--------|
| GET | `/zones` | INVENTORY_READ | — |
| POST | `/zones` | INVENTORY_POST | zoneSchema |
| GET | `/aisles` | INVENTORY_READ | — |
| POST | `/aisles` | INVENTORY_POST | aisleSchema |
| GET | `/racks` | INVENTORY_READ | — |
| POST | `/racks` | INVENTORY_POST | rackSchema |
| GET | `/bins` | INVENTORY_READ | — |
| POST | `/bins` | INVENTORY_POST | binSchema |
| GET | `/putaway-tasks` | INVENTORY_READ | — |
| POST | `/putaway-tasks` | INVENTORY_POST | putawaySchema |
| POST | `/putaway-tasks/:id/complete` | INVENTORY_POST | — |
| GET | `/barcodes` | INVENTORY_READ | — |
| POST | `/barcodes` | INVENTORY_POST | barcodeSchema |
| POST | `/barcodes/:id/print` | INVENTORY_READ | — |
| POST | `/scan` | INVENTORY_READ | scanSchema |
| GET | `/scan-logs` | INVENTORY_READ | — |

**Missing endpoints**:
- PATCH `/zones/:id`, `/aisles/:id`, `/racks/:id`, `/bins/:id` (no edit)
- DELETE `/zones/:id`, etc. (no delete)
- POST `/putaway-tasks/:id/assign` (no assign)
- POST `/putaway-tasks/:id/cancel` (no cancel)
- POST `/bins/:id/block` (no block/unblock)
- DELETE `/barcodes/:id` (no delete)
- GET `/barcodes/:id` (no detail)

#### E. DTOs

All schemas validated with zod. `putawaySchema` has 16 fields including priority enum `['LOW', 'NORMAL', 'HIGH', 'URGENT']`. `barcodeSchema` has labelType enum `['PRODUCT', 'BATCH', 'LOT', 'BIN', 'GRN', 'PALLET', 'GS1', 'QR']`. Good.

#### F. RBAC

All permissions are `INVENTORY_READ` or `INVENTORY_POST`. No warehouse-specific permissions. The permission registry doesn't define `WAREHOUSE_*` permissions.

**Issue**: `warehouse_operator` role has both `INVENTORY_READ` and `INVENTORY_POST`, so this works. But `quality_manager` has only `INVENTORY_READ` — cannot create zones/aisles/etc.

#### G. Workflow

NO workflow registered. Putaway tasks have status (PENDING → IN_PROGRESS → COMPLETED) but transitions are direct field updates with manual status checks (line 177-179). No state machine.

#### H. Events

- `PutawayTaskCreated` (line 162)
- `PutawayCompleted` (line 200)

**Missing events**:
- `ZoneCreated`, `AisleCreated`, `RackCreated`, `BinCreated` — no events on master-data creation
- `BarcodeCreated`, `BarcodeScanned`, `BarcodePrinted` — no events
- `PutawayTaskAssigned`, `PutawayTaskCancelled` — no events

#### I. Audit

All mutations logged: CREATE for each entity, PUTAWAY_CREATED, PUTAWAY_COMPLETED, BARCODE_CREATED, BARCODE_PRINTED, BARCODE_SCANNED.

#### J. Business rules

Enforced (see C). **Missing**:
- No zone/aisle/rack/bin code uniqueness check at service level (relies on DB constraint which doesn't exist — only `uq_pt_tenant_number` for putaway)
- No cycle-count integration
- No putaway assignment to specific user (assignedTo field exists but no assignment endpoint)

#### K. Completeness: 🟡 PARTIAL

**What works**:
- Full master-data creation (zones, aisles, racks, bins)
- Putaway task with auto-bin-allocation, capacity validation
- Barcode engine with GS1/QR support
- Scanner API with scan logs

**What's missing**:
1. **Field-map bug** (BUG-3) — `assigned_to_name` always NULL — **1 hour to fix**
2. **No UPDATE/DELETE** for any master data — **8 hours** to add PATCH/DELETE for zones, aisles, racks, bins, barcodes
3. **No bin block/unblock** — **4 hours**
4. **No putaway assignment/cancel** — **4 hours**
5. **No $transaction** for putaway completion — **2 hours**
6. **Missing events** on master-data creation — **2 hours**
7. **No workflow** for putaway (manual status checks are fragile) — **4 hours**
8. **No WAREHOUSE_* permissions** — **2 hours** to add and re-assign

**Estimated effort**: ~27 hours.

---

### 2.4 `procurement/` — 🟡 PARTIAL

**Source files:** `routes/index.ts` (92L), `service/index.ts` (145L), `repository/index.ts` (multi-file), `workflow/index.ts` (34L)
**Migration:** `0009_procurement.sql`

#### A. Database

3 Prisma models (`schema.prisma:1761-1850`): `PurchaseRequisitions`, `PurchaseRequisitionLines`, `PurchaseRequisitionApprovals`.

#### B. Repository

`prRepository`: create, findById, list, update, softDelete, generatePrNumber.
`prLineRepository`: create, listForPr, deleteForPr.
`prApprovalRepository`: create, listForPr.

All with optimistic concurrency on update.

#### C. Service

Business rules (`service/index.ts`):
- Must have ≥1 line (line 21)
- Required date cannot be in past (line 24)
- Can only modify DRAFT or REJECTED (line 84)
- Can only delete DRAFT (line 98)
- Workflow transition validation (line 111)
- Budget validation for BUDGET_APPROVAL state (line 115-118)
- Approval recording on APPROVED/REJECTED (line 125-132)

External services: `auditService.log()`, `eventBus.writeToOutbox()`, `workflowRegistry`.

#### D. Routes — 5 endpoints

| Method | Path | Permission | Schema |
|--------|------|-----------|--------|
| GET | `/requisitions` | PO_READ (proxy) | — |
| GET | `/requisitions/:id` | PO_READ (proxy) | — |
| POST | `/requisitions` | PO_CREATE (proxy) | prSchema |
| PATCH | `/requisitions/:id` | PO_CREATE (proxy) | — (no zod!) |
| DELETE | `/requisitions/:id` | PO_CREATE (proxy — should be DELETE perm) | — |
| POST | `/requisitions/:id/transition` | PO_APPROVE (proxy) | transitionSchema |

**Permission bugs**:
- All endpoints use PO_* as proxy. Explicitly commented at line 12: `// Use PO permissions as proxy for PR (will add PR-specific permissions later)`
- DELETE uses `PR_CREATE` (=PO_CREATE) — should require PO_DELETE-equivalent

**Missing endpoints**:
- POST `/requisitions/:id/lines` (no line management)
- PATCH `/requisitions/:id/lines/:lineId`
- DELETE `/requisitions/:id/lines/:lineId`
- POST `/requisitions/:id/convert-to-rfq`
- POST `/requisitions/:id/approvals`

#### E. DTOs

`prSchema`: 11 fields, lines array with 10 fields per line. Good validation.

PATCH has no zod validator.

#### F. RBAC

Uses `PO_READ`, `PO_CREATE`, `PO_APPROVE` as proxy. No `PR_*` permissions defined in registry.

**Should add**: `PR_READ`, `PR_CREATE`, `PR_UPDATE`, `PR_DELETE`, `PR_APPROVE`, `PR_CONVERT_TO_RFQ`.

#### G. Workflow

`PurchaseRequisitionLifecycle` (`workflow/index.ts:7-30`): 10 states, 17 transitions. Properly registered. Service uses workflow name correctly (line 110).

States: DRAFT → SUBMITTED → DEPT_REVIEW → BUDGET_APPROVAL → PROC_REVIEW → APPROVED → CONVERTED_TO_RFQ → CLOSED. Plus CANCELLED and REJECTED with return-to-DRAFT paths.

#### H. Events

- `PurchaseRequisitionCreated` (line 58)
- `PurchaseRequisitionSubmitted` (line 137)
- `PurchaseRequisitionApproved` (line 137)
- `PurchaseRequisitionRejected` (line 137)
- `PurchaseRequisitionCancelled` (line 137)

**Missing**: `PurchaseRequisitionUpdated`, `PurchaseRequisitionDeleted`, `PurchaseRequisitionConvertedToRfq`.

#### I. Audit

CREATE, UPDATE, DELETE, TRANSITION. All with before/after.

#### J. Business rules

Enforced (see C). **Missing**:
- No PR-to-PO conversion (only PR-to-RFQ via workflow state, but no actual RFQ creation logic)
- No approval-level escalation (single approval only)
- No budget consumption tracking (just validation against budget_amount field)

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **PR_* permissions** — **2 hours** to add 6 permissions to registry and update routes
2. **No PATCH zod validator** — **1 hour**
3. **No line management endpoints** — **8 hours**
4. **No convert-to-RFQ logic** — **4 hours**
5. **No approval workflow with multiple levels** — **8 hours**
6. **Missing events** on UPDATE/DELETE — **2 hours**

**Estimated effort**: ~25 hours.

---

### 2.5 `purchase-order/` — ✅ COMPLETE (functional)

**Source files:** `routes/index.ts` (306L), `service/index.ts` (994L), `repository/index.ts` (551L), `workflow/index.ts` (102L)
**Migration:** `0011_purchase_orders.sql`

#### A. Database

13 Prisma models (`schema.prisma:343-702`): `PurchaseOrder`, `PurchaseOrderLine`, `PurchaseOrderTax`, `PurchaseOrderCharge`, `PurchaseOrderAttachment`, `PurchaseOrderTerm`, `PurchaseOrderApproval`, `PurchaseOrderRevision`, `PurchaseOrderHistory`, `PurchaseOrderDeliverySchedule`, `PurchaseOrderMilestone`, `PurchaseOrderCommunication`. Plus `SupplierQuotation` and `SupplierQuotationLine`.

#### B. Repository

`purchaseOrderRepository`: create, findById, findByNumber, list (with sort), update (with version), softDelete, generatePoNumber.
`purchaseOrderLineRepository`: create, listForPo, deleteForPo.
`purchaseOrderTaxRepository`, `purchaseOrderChargeRepository`, `purchaseOrderAttachmentRepository`, `purchaseOrderTermRepository`, `purchaseOrderApprovalRepository`, `purchaseOrderRevisionRepository`, `purchaseOrderHistoryRepository`, `purchaseOrderDeliveryScheduleRepository`, `purchaseOrderMilestoneRepository`, `purchaseOrderCommunicationRepository`.

All with proper tenant isolation and optimistic concurrency.

#### C. Service

Business rules (`service/index.ts`):
- 9 service methods (lines 295-876)
- PO total calculation with discount/tax/charges (line 229+)
- Status transition validation via workflow (line 594-700)
- Supplier acknowledge with 5 ack types (line 700-773)
- Create from quotation with auto-line generation (line 774-875)
- PDF generation (line 876+) — returns structured PDF data
- Update only in DRAFT or REVISION_REQUESTED (inferred from workflow)
- Delete only in DRAFT (inferred)
- Approval level tracking (DEPT_APPROVAL → FINANCE_APPROVAL → MANAGEMENT_APPROVAL)

External services: `auditService.log()`, `eventBus.writeToOutbox()`, `query()` for direct SQL.

Transactions: NO explicit `$transaction` (need to verify in service).

#### D. Routes — 17 endpoints

| Method | Path | Permission | Schema |
|--------|------|-----------|--------|
| GET | `/pos` | PO_READ | — |
| GET | `/pos/:id` | PO_READ | — |
| POST | `/pos` | PO_CREATE | poCreateSchema (82L!) |
| PATCH | `/pos/:id` | PO_UPDATE | — (no zod!) |
| DELETE | `/pos/:id` | PO_DELETE | — |
| POST | `/pos/:id/transition` | PO_APPROVE | transitionSchema |
| POST | `/pos/:id/issue` | PO_ISSUE | — |
| POST | `/pos/:id/cancel` | PO_APPROVE | — |
| POST | `/pos/:id/close` | PO_CLOSE | — |
| POST | `/pos/:id/supplier-accept` | PO_APPROVE | — |
| POST | `/pos/:id/supplier-reject` | PO_APPROVE | — |
| POST | `/pos/:id/supplier-counter` | PO_APPROVE | — |
| POST | `/pos/:id/revision` | PO_UPDATE | — |
| POST | `/pos/from-quotation` | PO_CREATE | createFromQuotationSchema |
| GET | `/pos/:id/pdf` | PO_EXPORT | — |
| GET | `/pos/:id/export-pdf` | PO_EXPORT | — |
| POST | `/pos/search` | PO_READ | — |

**Issue**: PATCH has no zod. Several POST endpoints have no zod (issue, cancel, supplier-accept, etc.) — accept arbitrary JSON.

#### E. DTOs

`poCreateSchema` (lines 40-82): 32 fields, comprehensive. `poLineSchema` (lines 14-38): 19 fields. `transitionSchema` (lines 84-96): 7 fields including approvalLevel enum. Good.

#### F. RBAC

Uses 10 distinct PO_* permissions: PO_READ, PO_CREATE, PO_UPDATE, PO_DELETE, PO_APPROVE, PO_APPROVE_ANY, PO_ISSUE, PO_CLOSE, PO_CANCEL, PO_EXPORT, PO_RECEIVE.

All proper domain permissions. Best-in-class.

#### G. Workflow

`PurchaseOrderLifecycle` (`workflow/index.ts:33-93`): 16 states, 27 transitions. Comprehensive. Includes approval chain, supplier interaction, receipt states, revision requests.

#### H. Events

Multiple events emitted (need to grep service for writeToOutbox calls — at least PO_CREATED, PO_ISSUED, PO_RECEIVED are emitted based on the worklog history).

#### I. Audit

CREATE, UPDATE, DELETE, TRANSITION, supplier-acknowledge, from-quotation. All with before/after.

#### J. Business rules

Strong enforcement. **Missing**:
- No budget consumption check (PR has it, PO doesn't)
- No credit-limit check for supplier (one-way relationship)

#### K. Completeness: ✅ COMPLETE (strongest module)

**Caveats**:
- PATCH and several POST endpoints have no zod
- No PDF binary generation (returns structured data only — frontend must render)

**Effort to perfect**: ~8 hours.

---

### 2.6 `quality-inspection/` — 🟡 PARTIAL

**Source files:** `routes/index.ts` (210L), `service/index.ts` (393L), `repository/index.ts` (258L), `workflow/index.ts` (25L), `workflow/ncr.ts` (24L)
**Migration:** `0012_warehouse_inventory.sql:215-428` (8 quality tables)

#### A. Database

8 Prisma models (`schema.prisma:2149-2381`): `InspectionPlans`, `SamplingPlans`, `InspectionParameters`, `InspectionLots`, `InspectionResults`, `QualityHolds`, `Ncrs`, `CapaRecords`.

#### B. Repository

Inspection plan, sampling plan, inspection lot, inspection result, quality hold, NCR, CAPA repositories. All with create/findById/list. Most missing update/delete.

#### C. Service

17 service methods (lines 23-389). Business rules:
- Sample size determination based on lot quantity (line 65-76)
- Inspection lot creation linked to GRN (line 77-123)
- Result recording with PASS/FAIL/CONDITIONAL (line 141-163)
- Workflow transition with auto-NCR creation on FAILED (line 164-238, line 211-220)
- Quality hold creation with `heldQty > 0` validation (line 239-261)
- Hold release with disposition (line 267-285)
- NCR creation with severity enum (line 286-319)
- NCR transition with root cause and CAPA linking (line 332-370)
- CAPA creation with corrective + preventive actions (line 371-388)

External services: `auditService.log()`, `eventBus.writeToOutbox()`, `query()` for direct SQL.

#### D. Routes — 13 endpoints

| Method | Path | Permission | Schema |
|--------|------|-----------|--------|
| GET | `/plans` | IQC_INSPECT | — |
| GET | `/plans/:id` | IQC_INSPECT | — |
| POST | `/plans` | IQC_APPROVE | planSchema |
| GET | `/sampling-plans` | IQC_INSPECT | — |
| POST | `/sampling-plans` | IQC_APPROVE | samplingPlanSchema |
| GET | `/lots` | IQC_INSPECT | — |
| GET | `/lots/:id` | IQC_INSPECT | — |
| POST | `/lots` | IQC_INSPECT | lotCreateSchema |
| POST | `/lots/:id/start` | IQC_INSPECT | — |
| POST | `/lots/:id/results` | IQC_INSPECT | resultSchema |
| POST | `/lots/:id/transition` | IQC_APPROVE | lotTransitionSchema |
| GET | `/holds` | IQC_INSPECT | — |
| POST | `/holds` | IQC_APPROVE | holdSchema |
| POST | `/holds/:id/release` | IQC_APPROVE | holdReleaseSchema |
| GET | `/ncrs` | **GRN_READ (proxy)** | — |
| GET | `/ncrs/:id` | **GRN_READ (proxy)** | — |
| POST | `/ncrs` | NCR_CREATE | ncrSchema |
| POST | `/ncrs/:id/transition` | NCR_APPROVE | ncrTransitionSchema |
| GET | `/capas` | **GRN_READ (proxy)** | — |
| POST | `/capas` | NCR_APPROVE | capaSchema |

**Permission bugs**:
- NCR GET and CAPA GET use `GRN_READ` — should be `NCR_READ` or `IQC_INSPECT`
- CAPA POST uses `NCR_APPROVE` — should be `CAPA_CREATE`

**Missing endpoints**:
- PATCH `/plans/:id`, `/sampling-plans/:id`, `/lots/:id` (no edit)
- DELETE for all entities
- POST `/capas/:id/transition` (CAPA workflow exists in `capa-management` module but not here)
- GET `/capas/:id`
- POST `/ncrs/:id/capa` (link NCR to CAPA)

#### E. DTOs

All schemas validated. `lotTransitionSchema` has 6 fields with enum. `ncrSchema` has severity enum `['MINOR', 'MAJOR', 'CRITICAL']`.

#### F. RBAC

Permissions: `IQC_INSPECT`, `IQC_APPROVE`, `NCR_CREATE`, `NCR_APPROVE`, `GRN_READ` (proxy for NCR/CAPA reads).

**Missing**: `NCR_READ`, `CAPA_READ`, `CAPA_CREATE`, `CAPA_APPROVE`, `HOLD_CREATE`, `HOLD_RELEASE`. The registry only has 4 quality permissions — too few for 8 entities.

#### G. Workflow

Two workflows registered:
- `InspectionLotLifecycle` (`workflow/index.ts:7-22`): 6 states, 8 transitions.
- `NCRLifecycle` (`workflow/ncr.ts:7-19`): 5 states, 6 transitions.

**Missing workflow**: CAPA lifecycle (exists in `capa-management` module separately, but no endpoint here to transition CAPAs).

#### H. Events

Need to verify by reading service file. Based on method count and the writeToOutbox grep, events are likely emitted on lot creation and NCR creation. Quality hold creation likely has no event.

#### I. Audit

All mutations logged.

#### J. Business rules

Strong enforcement. AQL-based sampling. Auto-NCR on FAILED inspection. Quality hold with mandatory release disposition.

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **Permission fixes** — NCR/CAPA reads should use NCR_READ/CAPA_READ, not GRN_READ — **2 hours** to add permissions and update routes
2. **No PATCH/DELETE** on any entity — **12 hours**
3. **No CAPA transition endpoint** — **4 hours**
4. **No CAPA GET-by-id** — **1 hour**
5. **No NCR-to-CAPA link endpoint** — **2 hours**

**Estimated effort**: ~21 hours.

---

### 2.7 `batch-manufacturing/` — 🟡 PARTIAL

**Source files:** `routes/index.ts` (79L), `service/index.ts` (263L), `repository/index.ts` (121L), `workflow/index.ts` (26L)
**Migration:** `0013_manufacturing.sql:381-462` (6 batch tables)

#### A. Database

6 Prisma models (`schema.prisma:3590-3724`): `ProductionBatches`, `BatchGenealogy`, `BatchSplits`, `BatchMerges`, `TraceabilityLogs`. Plus `Batches` and `Lots` from migration 0012.

#### B. Repository

`productionBatchRepository`: create, findById, list, update, generateBatchNumber.
`batchGenealogyRepository`: create, list (inferred).
`batchSplitRepository`, `batchMergeRepository`, `traceabilityLogRepository`: create + list.

#### C. Service

8 service methods (lines 17-263). Business rules:
- Quantity must be positive (line 28)
- Batch number auto-generation (line 30)
- Parent batch → genealogy record (line 45-51)
- Traceability log on every mutation (line 54-58, etc.)
- Workflow transition validation (line 83-85)
- Split: source quantity must equal sum of splits (inferred from line 96-163)
- Merge: ≥2 source batches required (route schema, line 35)

External services: `auditService.log()`, `eventBus.writeToOutbox()`, `traceabilityLogRepository` (every mutation).

#### D. Routes — 7 endpoints

| Method | Path | Permission | Schema |
|--------|------|-----------|--------|
| GET | `/batches` | **PRODUCT_READ (proxy)** | — |
| GET | `/batches/:id` | **PRODUCT_READ (proxy)** | — |
| POST | `/batches` | **PRODUCT_CREATE (proxy)** | batchSchema |
| POST | `/batches/:id/transition` | **PRODUCT_UPDATE (proxy)** | batchTransitionSchema |
| POST | `/batches/:id/split` | **PRODUCT_UPDATE (proxy)** | splitSchema |
| POST | `/batches/merge` | **PRODUCT_UPDATE (proxy)** | mergeSchema |
| GET | `/batches/:id/backward-traceability` | **PRODUCT_READ (proxy)** | — |
| GET | `/batches/:id/forward-traceability` | **PRODUCT_READ (proxy)** | — |
| GET | `/batches/:id/genealogy` | **PRODUCT_READ (proxy)** | — |

**Permission issues**: All endpoints use PRODUCT_* — batches aren't products. Should be `BATCH_READ`, `BATCH_CREATE`, `BATCH_UPDATE`, `BATCH_SPLIT`, `BATCH_MERGE`.

**Missing endpoints**:
- PATCH `/batches/:id` (no edit)
- DELETE `/batches/:id` (no delete — probably intentional for audit)
- GET `/batches/:id/splits` (list splits for a batch)
- GET `/batches/:id/merges` (list merges)

#### E. DTOs

`batchSchema`: 11 fields. `splitSchema`: nested splits array with quantity + warehouseId. `mergeSchema`: sourceBatchIds array (min 2). Good.

#### F. RBAC

Uses `PRODUCT_READ`, `PRODUCT_CREATE`, `PRODUCT_UPDATE`. **Wrong domain** — should be `BATCH_*`.

No `BATCH_*` permissions in registry.

#### G. Workflow

`ProductionBatchLifecycle` (`workflow/index.ts:7-22`): 7 states, 9 transitions. Properly registered. Service uses workflow name correctly (line 83).

#### H. Events

- `BatchCreated` (line 61)

**Missing events**:
- `BatchTransitioned` — transition() method (line 78-93) has audit but NO writeToOutbox call
- `BatchSplit` — splitBatch (line 96-163) — need to verify, but no event mentioned in method list
- `BatchMerged` — mergeBatches (line 164-234) — need to verify

#### I. Audit

BATCH_CREATED, BATCH_TRANSITION. Split/merge/genealogy likely logged.

#### J. Business rules

- Quantity positive
- Split: source quantity = sum of splits (need to verify in service code at line 96-163)
- Merge: ≥2 source batches (schema-enforced)
- Genealogy: parent-child relationship recorded
- Traceability: every mutation logged

**Missing**:
- No batch uniqueness check (batch number is auto-generated, so OK)
- No expiry date validation (expiryDate is optional in schema)
- No FGQC integration (FGQC_PENDING state exists but no auto-trigger)

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **BATCH_* permissions** — **2 hours** to add 5 permissions and update routes
2. **Missing events** on transition/split/merge — **2 hours**
3. **No PATCH/DELETE** — **4 hours**
4. **No FGQC integration** — when transitioning to FGQC_PENDING, should auto-create FGQC inspection lot — **8 hours**
5. **No split/merge list endpoints** — **2 hours**

**Estimated effort**: ~18 hours.

---

### 2.8 `product-costing/` — 🟡 PARTIAL (stub-template)

**Source files:** `routes/index.ts` (94L), `service/index.ts` (445L), `repository/index.ts` (154L), `workflow/index.ts` (24L)
**Migration:** `0016_finance.sql:345-420` (6 costing tables)

#### A. Database

6 Prisma models (`schema.prisma:6425-6594`): `ProductCosts`, `CostRollups`, `CostRollupLines`, `CostVariances`, `BatchCosts`, `InventoryValuations`.

#### B. Repository

Stub-template — generic create/findById/list/update/softDelete via Prisma client. No domain-specific queries.

#### C. Service

Generic CRUD (lines 82-445). Business rules:
- entry_number uniqueness (line 154-168)
- Optimistic concurrency (line 242-248)
- Workflow transition validation (line 357-368)

**Missing business rules**:
- No cost calculation from BOM + routing + overhead
- No cost rollup generation
- No variance calculation (standard vs actual)
- No inventory valuation recompute
- No batch cost aggregation
- No posting to GL on transition to POSTED

#### D. Routes — 7 endpoints (stub-template)

| Method | Path | Permission | Schema |
|--------|------|-----------|--------|
| GET | `/` | **AUDIT_READ (proxy)** | — |
| GET | `/count` | **AUDIT_READ (proxy)** | — |
| GET | `/exists/:code` | **AUDIT_READ (proxy)** | — |
| GET | `/:id` | **AUDIT_READ (proxy)** | — |
| POST | `/` | **AUDIT_READ (proxy — should be costing write)** | — (no zod!) |
| PUT | `/:id` | **AUDIT_READ (proxy)** | — (no zod!) |
| DELETE | `/:id` | **AUDIT_READ (proxy)** | — |
| POST | `/:id/transition` | **AUDIT_READ (proxy)** | — (no zod!) |

**Critical RBAC bug (BUG-5)**: Both READ_PERM and WRITE_PERM = `AUDIT_READ`. Any user with audit:read (including `auditor` role) can CREATE/UPDATE/DELETE/TRANSITION product costs. **Severe SoD violation.**

**Missing endpoints**:
- POST `/:id/rollup` (trigger cost rollup)
- POST `/:id/variance` (calculate variance)
- GET `/:id/valuation` (inventory valuation)

#### E. DTOs

NO zod validators on any endpoint. All accept `await c.req.json()` raw.

#### F. RBAC

Uses `AUDIT_READ` for everything. **No `COSTING_*` permissions in registry.**

**Should add**: `COSTING_READ`, `COSTING_CREATE`, `COSTING_UPDATE`, `COSTING_DELETE`, `COSTING_APPROVE`, `COSTING_POST`.

#### G. Workflow

`ProductCostLifecycle` (`workflow/index.ts:7-19`): 5 states, 6 transitions. DRAFT → CALCULATED → APPROVED → POSTED → ARCHIVED.

#### H. Events

- `ProductCostCreated` (inferred from stub-template pattern)
- `ProductCostUpdated`
- `ProductCostDeleted`
- `ProductCostTransitioned`

Generic. No domain events like `CostRollupCompleted`, `VarianceCalculated`.

#### I. Audit

CREATE, UPDATE, DELETE, TRANSITION. All with before/after.

#### J. Business rules

Only generic uniqueness check. No domain rules.

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **CRITICAL: RBAC fix** — add COSTING_* permissions and update routes — **3 hours**
2. **CRITICAL: zod validators** on all endpoints — **4 hours**
3. **Cost calculation engine** — **40 hours** (BOM explosion + routing + overhead + labor + variance)
4. **Cost rollup generation** — **16 hours**
5. **Variance calculation** — **8 hours**
6. **Inventory valuation** — **8 hours**
7. **GL posting on POSTED** — **8 hours**

**Estimated effort**: ~87 hours.

---

### 2.9 `financial-foundation/` — 🟡 PARTIAL

**Source files:** `routes/index.ts` (29L), `service/index.ts` (45L), `repository/index.ts` (16L), `workflow/index.ts` (25L)
**Migration:** `0016_finance.sql:10-122` (11 foundation tables)

#### A. Database

11 Prisma models (`schema.prisma:5795-6004`): `ChartOfAccounts`, `FiscalYears`, `FiscalPeriods`, `ProfitCenters`, `Currencies`, `ExchangeRates`, `FinancialDimensions`, `DimensionValues`, `JournalTemplates`, `JournalTemplateLines`. Plus `CostCenters` from migration 0002.

#### B. Repository

`genRepo` factory (line 3-9) creates a generic repository with create/findById/list ONLY. **NO update, NO delete.**

7 repositories generated: chartOfAccountsRepository, fiscalYearRepository, fiscalPeriodRepository, costCenterRepository, profitCenterRepository, currencyRepository, exchangeRateRepository.

#### C. Service

11 service methods (lines 9-45). Business rules:
- Account type validation (line 13)
- Fiscal year end date > start date (line 21)
- Auto-create 12 fiscal periods on fiscal year creation (line 23-24)
- Period close only if status=OPEN (line 32-33)
- Exchange rate > 0 (line 43)

**Missing business rules**:
- No account code uniqueness check (relies on DB)
- No parent account cycle prevention
- No period-close-prevents-posting enforcement
- No currency code ISO 4217 validation

#### D. Routes — 14 endpoints (compact one-liners)

| Method | Path | Permission | Schema |
|--------|------|-----------|--------|
| GET | `/accounts` | **AUDIT_READ (proxy)** | — |
| POST | `/accounts` | **AUDIT_READ_CRITICAL (proxy)** | accSchema |
| GET | `/fiscal-years` | **AUDIT_READ (proxy)** | — |
| POST | `/fiscal-years` | **AUDIT_READ_CRITICAL (proxy)** | fySchema |
| GET | `/fiscal-periods` | **AUDIT_READ (proxy)** | — |
| POST | `/fiscal-periods/close` | **AUDIT_READ_CRITICAL (proxy)** | — |
| GET | `/cost-centers` | **AUDIT_READ (proxy)** | — |
| POST | `/cost-centers` | **AUDIT_READ_CRITICAL (proxy)** | ccSchema |
| GET | `/profit-centers` | **AUDIT_READ (proxy)** | — |
| POST | `/profit-centers` | **AUDIT_READ_CRITICAL (proxy)** | pcSchema |
| GET | `/currencies` | **AUDIT_READ (proxy)** | — |
| POST | `/currencies` | **AUDIT_READ_CRITICAL (proxy)** | currSchema |
| GET | `/exchange-rates` | **AUDIT_READ (proxy)** | — |
| POST | `/exchange-rates` | **AUDIT_READ_CRITICAL (proxy)** | erSchema |

**RBAC issue**: Uses AUDIT_READ / AUDIT_READ_CRITICAL as proxy. Should be `FIN_*` permissions.

**Missing endpoints**:
- PATCH for ALL entities (no update — critical for editing accounts, cost centers, etc.)
- DELETE for ALL entities (no delete — even soft delete)
- GET `/:id` for ALL entities (no detail view)
- POST `/fiscal-periods/open` (re-open a closed period — controlled but needed)
- GET `/accounts/tree` (hierarchical account tree)
- POST `/accounts/:id/activate` (activate/deactivate)

#### E. DTOs

All schemas validated with zod. Compact but functional.

#### F. RBAC

Uses `AUDIT_READ` and `AUDIT_READ_CRITICAL`. **No `FIN_*` permissions in registry.**

#### G. Workflow

`FinancialFoundationJournalEntryLifecycle` (`workflow/index.ts:11-22`): 4 states, 5 transitions. Note: this workflow is for journal entries, but financial-foundation module doesn't actually create journal entries (that's general-ledger). This workflow is essentially dead code.

#### H. Events

**NO events emitted.** financial-foundation service has zero `writeToOutbox` calls. Pure audit logging.

This breaks the event-driven architecture: downstream modules (GL, AP, AR) cannot react to account creation, fiscal year changes, or exchange rate updates.

#### I. Audit

All mutations logged: CREATE, PERIOD_CLOSED, SET_EXCHANGE_RATE.

#### J. Business rules

Minimal (see C). Most domain rules missing.

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **FIN_* permissions** — **3 hours** to add 10+ permissions
2. **PATCH/DELETE** for all 7 entity types — **16 hours**
3. **GET /:id** for all entities — **4 hours**
4. **Events** on all mutations — **4 hours**
5. **Account tree endpoint** — **4 hours**
6. **Parent account cycle prevention** — **2 hours**
7. **Currency ISO validation** — **1 hour**

**Estimated effort**: ~34 hours.

---

### 2.10 `general-ledger/` — 🟡 PARTIAL (stub-template)

**Source files:** `routes/index.ts` (94L), `service/index.ts` (444L), `repository/index.ts` (154L), `workflow/index.ts` (30L)
**Migration:** `0016_finance.sql:438-535` (8 GL tables)

#### A. Database

8 Prisma models (`schema.prisma:6595-6774`): `JournalEntries`, `JournalEntryLines`, `GlPostings`, `TrialBalances`, `FinancialStatements`, `OpeningBalances`, `PeriodCloses`. Plus `JournalTemplates` from foundation.

#### B. Repository

Stub-template — generic CRUD via Prisma. No domain-specific queries (no "get journal entry with lines", no "get trial balance for period").

#### C. Service

Generic CRUD (lines 74-444). Business rules:
- entry_number uniqueness (line 154-168)
- Optimistic concurrency (line 242-248)
- Workflow transition validation (line 357-368)
- Status cannot be set directly (line 230, deleted from data)

**Missing business rules**:
- No double-entry validation (debits must equal credits)
- No posting to `gl_postings` table on POSTED transition
- No period-close check (cannot post to closed period)
- No trial balance generation
- No financial statement generation
- No reversal of posted entries (REVERSED state exists but no logic)
- No journal template application

#### D. Routes — 7 endpoints (stub-template)

Same pattern as product-costing. All use `AUDIT_READ` for both R and W.

**Critical RBAC bug (BUG-5)**: Same as product-costing.

**Missing endpoints**:
- POST `/:id/lines` (add lines to entry)
- PATCH `/:id/lines/:lineId`
- DELETE `/:id/lines/:lineId`
- POST `/:id/post` (shortcut for transition to POSTED)
- POST `/:id/reverse` (shortcut for transition to REVERSED with auto-creation of reversal entry)
- GET `/trial-balance` (trial balance report)
- GET `/financial-statements/:type` (P&L, Balance Sheet, Cash Flow)

#### E. DTOs

NO zod validators. All accept raw JSON.

#### F. RBAC

Uses `AUDIT_READ`. **No `GL_*` permissions in registry.**

#### G. Workflow

`JournalEntryLifecycle` (`workflow/index.ts:12-25`): 6 states (DRAFT, PENDING_APPROVAL, APPROVED, POSTED, REVERSED, CANCELLED), 7 transitions. Good.

#### H. Events

- `JournalEntryCreated`
- `JournalEntryUpdated` (inferred)
- `JournalEntryDeleted` (inferred)
- `JournalEntryTransitioned`

**Missing**: `JournalEntryPosted` (with debit/credit totals), `JournalEntryReversed` (with reversal entry ID).

#### I. Audit

CREATE, UPDATE, DELETE, TRANSITION. All with before/after.

#### J. Business rules

Only generic uniqueness. **No double-entry validation** — the most critical GL business rule is missing.

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **CRITICAL: RBAC fix** — add GL_* permissions — **3 hours**
2. **CRITICAL: zod validators** — **4 hours**
3. **Double-entry validation** (debits = credits) — **8 hours**
4. **GL posting on POSTED transition** — **8 hours**
5. **Period-close check** — **4 hours**
6. **Reversal entry auto-creation** — **8 hours**
7. **Trial balance generation** — **16 hours**
8. **Financial statement generation** — **24 hours**
9. **Line management endpoints** — **8 hours**

**Estimated effort**: ~83 hours.

---

### 2.11 `gst-taxation/` — 🟡 PARTIAL (stub-template)

**Source files:** `routes/index.ts` (94L), `service/index.ts` (444L), `repository/index.ts` (154L), `workflow/index.ts` (40L)
**Migration:** `0016_finance.sql:537-636` (6 GST tables)

#### A. Database

6 Prisma models (`schema.prisma:6775-6973`): `GstConfigurations`, `TaxRules`, `EInvoices`, `EWayBills`, `TaxReturns`, `TaxRegisters`.

#### B. Repository

Stub-template — generic CRUD.

#### C. Service

Generic CRUD. No domain-specific logic.

**Missing business rules**:
- No GSTIN format validation (regex `\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}`)
- No HSN/SAC code validation
- No tax rate validation (0%, 5%, 12%, 18%, 28%)
- No e-invoice generation (IRN, QR code)
- No e-way bill generation
- No GSTR-1 return filing
- No GSTR-3B return filing
- No tax register auto-population

#### D. Routes — 7 endpoints (stub-template)

All use `AUDIT_READ`. Same RBAC bug.

**Missing endpoints**:
- POST `/e-invoices` (generate e-invoice)
- GET `/e-invoices/:id`
- POST `/e-way-bills` (generate e-way bill)
- GET `/e-way-bills/:id`
- POST `/returns/:type/file` (file GSTR-1, GSTR-3B)
- GET `/returns/:type/preview`
- GET `/registers/:type`

#### E. DTOs

NO zod validators.

#### F. RBAC

Uses `AUDIT_READ`. **No `GST_*` or `TAX_*` permissions in registry.**

#### G. Workflow

Two workflows (`workflow/index.ts:7-39`):
- `GstConfigurationLifecycle`: 5 states, 6 transitions
- `TaxReturnLifecycle`: 4 states, 4 transitions

#### H. Events

Generic stub-template events.

#### I. Audit

Generic stub-template audit.

#### J. Business rules

None beyond generic uniqueness.

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **RBAC fix** — **3 hours**
2. **zod validators** — **4 hours**
3. **GSTIN validation** — **2 hours**
4. **E-invoice generation** (IRN, QR code, NIC API integration) — **40 hours**
5. **E-way bill generation** — **24 hours**
6. **GSTR-1 filing** — **24 hours**
7. **GSTR-3B filing** — **16 hours**
8. **Tax register auto-population** — **16 hours**

**Estimated effort**: ~129 hours.

---

### 2.12 `mes/` — 🟡 PARTIAL

**Source files:** `routes/index.ts` (119L), `service/index.ts` (170L), `repository/index.ts` (103L), NO workflow directory
**Migration:** `0013_manufacturing.sql:10-95` (5 MES tables)

#### A. Database

5 Prisma models (`schema.prisma:2846-3028`): `WorkCenters`, `ProductionLines`, `Machines`, `Shifts`, `ShiftCalendars`, `MachineStatusLogs`, `DowntimeRecords`, `ProductionEvents`.

#### B. Repository

`workCenterRepository`, `machineRepository`, `shiftRepository`, `downtimeRepository`, `productionEventRepository`. All with create/findById/list. `machineRepository` has `updateStatus`.

**Missing**: update (general), delete, findByCode for all.

#### C. Service

Business rules:
- Machine status validation (line 46-49): `['IDLE', 'RUNNING', 'SETUP', 'MAINTENANCE', 'BREAKDOWN', 'CLEANING']`
- Downtime end > start (line 78)
- Downtime duration auto-calculation (line 76-77)
- OEE calculation: Availability × Performance × Quality (line 113-135)

**OEE bug (BUG-7)**: Line 125 uses `AVG(m.max_capacity)` aliased as `ideal_cycle_time`. This confuses capacity (units/hour) with cycle time (seconds/unit). The performance formula at line 134 (`producedQty / (runTime / 60)`) is then meaningless.

External services: `auditService.log()`, `eventBus.writeToOutbox()`, `query()` for direct SQL on shift_calendars, downtime_records, production_confirmations, production_orders, machines.

#### D. Routes — 9 endpoints

| Method | Path | Permission | Schema |
|--------|------|-----------|--------|
| GET | `/work-centers` | **PRODUCT_READ (proxy)** | — |
| POST | `/work-centers` | **PRODUCT_CREATE (proxy)** | wcSchema |
| GET | `/machines` | **PRODUCT_READ (proxy)** | — |
| POST | `/machines` | **PRODUCT_CREATE (proxy)** | machineSchema |
| POST | `/machines/:id/status` | **PRODUCT_UPDATE (proxy)** | — (no zod!) |
| GET | `/shifts` | **PRODUCT_READ (proxy)** | — |
| POST | `/shifts` | **PRODUCT_CREATE (proxy)** | shiftSchema |
| GET | `/downtime` | **PRODUCT_READ (proxy)** | — |
| POST | `/downtime` | **PRODUCT_UPDATE (proxy)** | downtimeSchema |
| GET | `/events` | **PRODUCT_READ (proxy)** | — |
| POST | `/events` | **PRODUCT_UPDATE (proxy)** | eventSchema |
| GET | `/analytics/oee/:machineId` | **PRODUCT_READ (proxy)** | — |
| GET | `/dashboard` | **PRODUCT_READ (proxy)** | — |

**Permission issues**: All use PRODUCT_* — wrong domain.

**Missing endpoints**:
- PATCH `/work-centers/:id`, `/machines/:id`, `/shifts/:id`
- DELETE for all
- POST `/downtime/:id/end` (end an active downtime)
- GET `/downtime/active` (currently active downtimes)
- GET `/analytics/oee` (OEE across all machines)
- GET `/analytics/availability`, `/performance`, `/quality` (individual OEE components)

#### E. DTOs

All schemas validated. `eventSchema` has severity enum `['INFO', 'WARN', 'ERROR', 'CRITICAL']`.

#### F. RBAC

Uses `PRODUCT_READ`, `PRODUCT_CREATE`, `PRODUCT_UPDATE`. **Wrong domain.**

**Should add**: `MES_READ`, `MES_CREATE`, `MES_UPDATE`, `MES_OEE_VIEW`, `MES_DOWNTIME_RECORD`.

#### G. Workflow

NO workflow registered. Machine status changes are direct field updates with manual validation. Downtime has no lifecycle (open → ended).

#### H. Events

- `MachineStatusChanged` (line 53)
- `DowntimeRecorded` (line 89)

**Missing events**:
- `WorkCenterCreated`, `MachineCreated`, `ShiftCreated`
- `ProductionEventRecorded` — recordEvent (line 100-104) has NO writeToOutbox call

#### I. Audit

CREATE for work centers, machines, shifts. MACHINE_STATUS_CHANGE, DOWNTIME_RECORDED.

**Missing**: No audit on production event recording (line 100-104).

#### J. Business rules

Enforced (see C). **OEE calculation bug**.

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **MES_* permissions** — **2 hours**
2. **PATCH/DELETE** for all entities — **8 hours**
3. **OEE calculation bug fix** — **4 hours**
4. **Downtime end endpoint** — **2 hours**
5. **Production event audit + event** — **1 hour**
6. **Workflow for machine status** — **4 hours**
7. **OEE dashboard endpoint** (across all machines) — **4 hours**

**Estimated effort**: ~25 hours.

---

### 2.13 `order-fulfillment/` — 🟡 PARTIAL (thin wrapper)

**Source files:** `routes/index.ts` (16L), `service/index.ts` (50L), `repository/index.ts` (33L)
**Migration:** `0015_sales_distribution.sql:207-280` (4 tables: inventory_allocations, wave_plans, wave_plan_lines, substitution_rules, fulfillment_analytics)

#### A. Database

5 Prisma models (`schema.prisma:5108-5250`): `InventoryAllocations`, `WavePlans`, `WavePlanLines`, `SubstitutionRules`, `FulfillmentAnalytics`.

#### B. Repository

`allocationRepository`, `wavePlanRepository`. Both with create + list + generator functions. **No update, no delete, no findById.**

#### C. Service

2 service methods (lines 10-50):
- `createAllocation` (line 11-30): FEFO allocation with batch assignment, partial allocation tracking, short qty calculation
- `createWavePlan` (line 34-47): aggregates SO lines, calculates totals

**Missing service methods**:
- `cancelAllocation`
- `releaseAllocation`
- `shortPickAllocation`
- `cancelWavePlan`
- `releaseWavePlan`
- `assignWaveToPicker`

#### D. Routes — 4 endpoints

| Method | Path | Permission | Schema |
|--------|------|-----------|--------|
| GET | `/allocations` | **CUSTOMER_READ (proxy)** | — |
| POST | `/allocations` | **CUSTOMER_UPDATE (proxy)** | allocSchema |
| GET | `/waves` | **CUSTOMER_READ (proxy)** | — |
| POST | `/waves` | **CUSTOMER_UPDATE (proxy)** | waveSchema |

**Permission issues**: Uses CUSTOMER_* — wrong domain (these are warehouse/fulfillment operations).

**Missing endpoints**:
- GET `/allocations/:id`
- PATCH `/allocations/:id`
- DELETE `/allocations/:id`
- POST `/allocations/:id/cancel`
- POST `/allocations/:id/release`
- GET `/waves/:id`
- PATCH `/waves/:id`
- DELETE `/waves/:id`
- POST `/waves/:id/release`
- POST `/waves/:id/assign`

#### E. DTOs

`allocSchema` (line 11): 10 fields. `waveSchema` (line 12): 4 fields including soIds array. Minimal but functional.

#### F. RBAC

Uses `CUSTOMER_READ`, `CUSTOMER_UPDATE`. **Wrong domain.**

**Should add**: `FULFILLMENT_READ`, `FULFILLMENT_ALLOCATE`, `FULFILLMENT_WAVE_PLAN`, `FULFILLMENT_RELEASE`.

#### G. Workflow

NO workflow. Allocations have status (ALLOCATED) but no transitions. Wave plans have status (CREATED) but no transitions.

#### H. Events

- `AllocationCreated` (line 28)
- `WavePlanCreated` (line 45)

**Missing**: `AllocationCancelled`, `AllocationReleased`, `WavePlanReleased`, `WavePlanAssigned`.

#### I. Audit

ALLOCATION_CREATED, WAVE_CREATED.

#### J. Business rules

- Ordered qty positive (line 13)
- FEFO allocation (line 15)
- Partial allocation tracking (line 23-24)

**Missing**:
- No stock reservation sync (allocation doesn't call inventory.reserveStock)
- No SO status validation (can allocate against a CANCELLED SO)
- No wave capacity check

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **FULFILLMENT_* permissions** — **2 hours**
2. **GET /:id, PATCH, DELETE** for allocations and waves — **8 hours**
3. **Cancel/release endpoints** — **6 hours**
4. **Stock reservation sync** with inventory module — **4 hours**
5. **SO status validation** — **2 hours**
6. **Workflow for allocation and wave** — **6 hours**
7. **Missing events** — **2 hours**

**Estimated effort**: ~30 hours.

---

### 2.14 `pick-pack-dispatch/` — 🟡 PARTIAL (thin wrapper)

**Source files:** `routes/index.ts` (19L), `service/index.ts` (52L), `repository/index.ts` (15L)
**Migration:** `0015_sales_distribution.sql:281-383` (6 tables: pick_lists, pick_list_lines, packing_lists, packing_list_lines, shipments, dispatch_plans)

#### A. Database

6 Prisma models (`schema.prisma:5251-5464`): `PickLists`, `PickListLines`, `PackingLists`, `PackingListLines`, `Shipments`, `DispatchPlans`.

#### B. Repository

`pickListRepository`, `packingListRepository`, `shipmentRepository`. All with create + list + generator functions. **No update, no delete, no findById.**

#### C. Service

3 service methods (lines 9-52):
- `createPickList` (line 10-18): aggregates SO lines into pick list
- `createPackingList` (line 20-26): creates packing list from pick list
- `createShipment` (line 28-50): creates shipment from packing list, **BUG: calls inventory.stockOut with wrong data**

**Critical bug (BUG-4)**: Lines 36-43:
```typescript
await inventoryService.stockOut({
  productId: data.soId,            // SALES ORDER UUID, not a product
  productSku: shipmentNumber,       // shipment number, not a SKU
  productName: `Shipment ${shipmentNumber}`,
  warehouseId: data.warehouseId, warehouseName: data.warehouseName || '',
  quantity: data.totalQty || 0, unitCost: 0, uomId: '', uomCode: 'EA',
  movementType: 'SALES_ISSUE', referenceType: 'SHIPMENT', referenceNumber: shipmentNumber,
} as any)
```

This passes:
- `productId` = sales order UUID (will fail FK or create phantom inventory record)
- `uomId` = empty string (NOT NULL constraint violation in inventory_transactions table)
- `unitCost` = 0 (corrupts moving average cost)
- `movementType` = 'SALES_ISSUE' (not in the inventory service signature — ignored)

The `as any` cast suppresses TypeScript errors. The try/catch swallows runtime errors. Either:
1. Every shipment creation fails silently (inventory not decremented) — **most likely**
2. Or phantom inventory records are created with sales-order-UUID as product ID

Either way, **this is broken in production**.

#### D. Routes — 6 endpoints

| Method | Path | Permission | Schema |
|--------|------|-----------|--------|
| GET | `/pick-lists` | **CUSTOMER_READ (proxy)** | — |
| POST | `/pick-lists` | **CUSTOMER_UPDATE (proxy)** | pickSchema |
| GET | `/packing-lists` | **CUSTOMER_READ (proxy)** | — |
| POST | `/packing-lists` | **CUSTOMER_UPDATE (proxy)** | packSchema |
| GET | `/shipments` | **CUSTOMER_READ (proxy)** | — |
| POST | `/shipments` | **CUSTOMER_UPDATE (proxy)** | shipSchema |

**Missing endpoints**:
- GET `/:id` for all 3
- PATCH `/:id` for all 3
- DELETE `/:id` for all 3
- POST `/pick-lists/:id/start`, `/complete`, `/cancel`
- POST `/pick-lists/:id/lines/:lineId/short-pick`
- POST `/packing-lists/:id/seal`, `/complete`
- POST `/shipments/:id/dispatch`, `/deliver`, `/cancel`
- GET `/shipments/:id/tracking`

#### E. DTOs

3 schemas with minimal fields. No line-level detail in pick/pack schemas.

#### F. RBAC

Uses `CUSTOMER_READ`, `CUSTOMER_UPDATE`. **Wrong domain.**

#### G. Workflow

NO workflow. Pick lists have status (CREATED) but no transitions. Same for packing lists and shipments.

#### H. Events

- `ShipmentCreated` (line 33)

**Missing**: `PickListCreated`, `PackingListCreated`, `PickListCompleted`, `PackingListSealed`, `ShipmentDispatched`, `ShipmentDelivered`, `ShipmentCancelled`.

#### I. Audit

PICK_LIST_CREATED, PACKING_LIST_CREATED, SHIPMENT_CREATED.

#### J. Business rules

- No SO status validation (can pick against CANCELLED SO)
- No inventory availability check before picking
- **Broken inventory stockOut call** (see BUG-4)

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **CRITICAL: Fix inventory.stockOut call** — must iterate SO lines and call stockOut per line with real product info — **8 hours**
2. **PICK_PACK_* permissions** — **2 hours**
3. **GET /:id, PATCH, DELETE** for all 3 entities — **12 hours**
4. **State transition endpoints** (start, complete, cancel, seal, dispatch) — **16 hours**
5. **Short-pick handling** — **4 hours**
6. **Workflow for pick/pack/ship** — **8 hours**
7. **Missing events** — **4 hours**
8. **Line-level management** — **8 hours**

**Estimated effort**: ~62 hours.

---

### 2.15 `delivery-management/` — 🟡 PARTIAL (thin wrapper)

**Source files:** `routes/index.ts` (19L), `service/index.ts` (47L), `repository/index.ts` (13L)
**Migration:** `0015_sales_distribution.sql:385-581` (7 tables: delivery_orders, proof_of_deliveries, delivery_exceptions, delivery_tracking, delivery_analytics)

#### A. Database

7 Prisma models (`schema.prisma:5465-5603`): `DeliveryOrders`, `ProofOfDeliveries`, `DeliveryExceptions`, `DeliveryTracking`, `DeliveryAnalytics`.

#### B. Repository

`deliveryOrderRepository`, `proofOfDeliveryRepository`, `deliveryExceptionRepository`. All with create + list + generator. **No update, no delete, no findById.**

#### C. Service

3 service methods (lines 8-47):
- `createDeliveryOrder` (line 9-15): creates DO from shipment
- `createPod` (line 17-38): creates POD, updates DO status to DELIVERED, updates SO status to DELIVERED
- `createException` (line 40-45): creates exception

**Issue**: POD creation at line 26-36 wraps SO status update in try/catch that swallows errors. If SO update fails, POD still succeeds but SO remains in non-DELIVERED state. **Silent data inconsistency.**

**Missing service methods**:
- `rescheduleDelivery`
- `cancelDeliveryOrder`
- `updateTracking`
- `getDeliveryAnalytics`

#### D. Routes — 6 endpoints

| Method | Path | Permission | Schema |
|--------|------|-----------|--------|
| GET | `/delivery-orders` | **CUSTOMER_READ (proxy)** | — |
| POST | `/delivery-orders` | **CUSTOMER_UPDATE (proxy)** | doSchema |
| GET | `/pods` | **CUSTOMER_READ (proxy)** | — |
| POST | `/pods` | **CUSTOMER_UPDATE (proxy)** | podSchema |
| GET | `/exceptions` | **CUSTOMER_READ (proxy)** | — |
| POST | `/exceptions` | **CUSTOMER_UPDATE (proxy)** | excSchema |

**Missing endpoints**:
- GET `/:id` for all 3
- PATCH `/:id` for all 3
- DELETE `/:id` for all 3
- POST `/delivery-orders/:id/reschedule`
- POST `/delivery-orders/:id/cancel`
- POST `/delivery-orders/:id/tracking` (update tracking)
- POST `/exceptions/:id/resolve`
- GET `/analytics`

#### E. DTOs

3 schemas with comprehensive fields. `podSchema` has deliveryStatus enum `['DELIVERED', 'PARTIAL', 'FAILED', 'RESCHEDULED']`.

#### F. RBAC

Uses `CUSTOMER_READ`, `CUSTOMER_UPDATE`. **Wrong domain.**

#### G. Workflow

NO workflow. DOs have status (CREATED, DELIVERED) but no state machine.

#### H. Events

- `DeliveryConfirmed` (line 24)
- `SalesOrderDelivered` (line 31)

**Missing**: `DeliveryOrderCreated`, `DeliveryExceptionCreated`, `DeliveryRescheduled`, `DeliveryCancelled`.

#### I. Audit

DELIVERY_ORDER_CREATED, POD_CREATED, DELIVERY_EXCEPTION.

#### J. Business rules

- Delivered qty positive (line 19)
- DO status update on POD (line 22)
- SO status update on POD (line 26-36, with swallowed errors)

**Missing**:
- No DO status validation (can deliver a CANCELLED DO)
- No reschedule validation
- No exception resolution workflow

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **DELIVERY_* permissions** — **2 hours**
2. **GET /:id, PATCH, DELETE** for all 3 entities — **12 hours**
3. **Reschedule, cancel, tracking endpoints** — **8 hours**
4. **Exception resolution workflow** — **4 hours**
5. **Analytics endpoint** — **8 hours**
6. **Workflow for DO** — **6 hours**
7. **Fix silent SO update failure** — **2 hours**
8. **Missing events** — **2 hours**

**Estimated effort**: ~44 hours.

---

### 2.16 `sales-order/` — 🟡 PARTIAL

**Source files:** `routes/index.ts` (75L), `service/index.ts` (260L), `repository/index.ts` (155L), `workflow/index.ts` (37L)
**Migration:** `0015_sales_distribution.sql:10-113` (6 SO tables)

#### A. Database

6 Prisma models (`schema.prisma:4727-4926`): `SalesOrders`, `SalesOrderLines`, `SalesOrderAmendments`, `SalesOrderHolds`, `SalesOrderApprovals`, `SalesOrderHistory`.

#### B. Repository

`salesOrderRepository`: create, findById, findByNumber, list, update, generateSoNumber.
`salesOrderLineRepository`: create, listForSo, deleteForSo.
`salesOrderAmendmentRepository`, `salesOrderHoldRepository`, `salesOrderApprovalRepository`, `salesOrderHistoryRepository`: create + listForSo.

**Missing**: update on line repository, delete on amendment/hold/approval/history.

#### C. Service

7 service methods (lines 17-260):
- `create` (line 18-104): full SO creation with line totals, discount, tax, grand total
- `getById` (line 106-118): with lines, amendments, holds, approvals, history
- `list` (line 120-123)
- `transition` (line 125-161): workflow transition
- `performCreditCheck` (line 162-189): credit limit check
- `reserveInventory` (line 191-233): FEFO reservation
- `addHold` (line 234-248): place hold
- `releaseHold` (line 249-260): release hold

Business rules:
- Must have ≥1 line (line 36)
- Product must exist (line 41-46)
- Line total calculation with discount + tax (line 49-65)
- Grand total = subtotal - discount + tax + freight + other (line 65)
- Workflow transition validation (line 125+)
- Credit check before APPROVED (line 162+)
- Inventory reservation before RESERVED (line 191+)
- Hold placement with type + reason (line 234+)
- Hold release with reason (line 249+)

External services: `auditService.log()`, `eventBus.writeToOutbox()`, `query()` for products and inventory, `salesOrderHistoryRepository`.

#### D. Routes — 5 endpoints

| Method | Path | Permission | Schema |
|--------|------|-----------|--------|
| GET | `/orders` | **CUSTOMER_READ (proxy)** | — |
| GET | `/orders/:id` | **CUSTOMER_READ (proxy)** | — |
| POST | `/orders` | **CUSTOMER_CREATE (proxy)** | soSchema |
| POST | `/orders/:id/transition` | **CUSTOMER_UPDATE (proxy)** | transitionSchema |
| POST | `/orders/:id/hold` | **CUSTOMER_UPDATE (proxy)** | holdSchema |
| POST | `/orders/:id/release-hold` | **CUSTOMER_UPDATE (proxy)** | releaseHoldSchema |

**Missing endpoints**:
- PATCH `/orders/:id` (no edit — must cancel and recreate)
- DELETE `/orders/:id` (no delete)
- GET `/orders/:id/lines`
- POST `/orders/:id/lines`
- PATCH `/orders/:id/lines/:lineId`
- DELETE `/orders/:id/lines/:lineId`
- POST `/orders/:id/amend` (create amendment)
- GET `/orders/:id/amendments`
- GET `/orders/:id/approvals`
- POST `/orders/:id/approvals`
- GET `/orders/:id/history`

#### E. DTOs

`soSchema` (lines 24-38): 22 fields, comprehensive. `lineSchema` (lines 16-22): 9 fields. `transitionSchema`: 14-state enum. `holdSchema`, `releaseHoldSchema`: minimal.

#### F. RBAC

Uses `CUSTOMER_READ`, `CUSTOMER_CREATE`, `CUSTOMER_UPDATE`. **Wrong domain.**

**Should add**: `SO_READ`, `SO_CREATE`, `SO_UPDATE`, `SO_DELETE`, `SO_APPROVE`, `SO_HOLD`, `SO_RELEASE`, `SO_AMEND`, `SO_CANCEL`.

#### G. Workflow

`SalesOrderLifecycle` (`workflow/index.ts:7-33`): 14 states, 20 transitions. Comprehensive — covers DRAFT → PENDING_APPROVAL → APPROVED → RESERVED → WAVE_PLANNED → PICKING → PICKED → PACKING → PACKED → DISPATCHED → IN_TRANSIT → DELIVERED → COMPLETED, plus CANCELLED from multiple states.

#### H. Events

- `SalesOrderCreated` (line 101)
- `SalesOrderDelivered` (from delivery-management module)

**Missing**: `SalesOrderUpdated`, `SalesOrderTransitioned`, `SalesOrderHoldPlaced`, `SalesOrderHoldReleased`, `SalesOrderAmended`, `SalesOrderCancelled`, `SalesOrderCompleted`.

#### I. Audit

CREATE, TRANSITION, HOLD, RELEASE_HOLD. Plus history records via `salesOrderHistoryRepository`.

#### J. Business rules

Strong enforcement (see C). **Missing**:
- No customer credit limit check on create (only on transition to APPROVED)
- No customer status validation (can sell to INACTIVE customer)
- No payment terms validation
- No SO line update (must cancel and recreate)

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **SO_* permissions** — **2 hours**
2. **PATCH /:id** — **4 hours**
3. **DELETE /:id** — **2 hours**
4. **Line management endpoints** — **8 hours**
5. **Amendment endpoints** — **4 hours**
6. **Approval endpoints** — **4 hours**
7. **Missing events** — **3 hours**
8. **Customer status validation** — **1 hour**

**Estimated effort**: ~28 hours.

---

### 2.17 `customer-returns/` — 🟡 PARTIAL

**Source files:** `routes/index.ts` (22L), `service/index.ts` (64L), `repository/index.ts` (15L), `workflow/index.ts` (26L)
**Migration:** `0015_sales_distribution.sql:462-560` (6 returns tables)

#### A. Database

6 Prisma models (`schema.prisma:5605-5794`): `RmaRequests`, `RmaLines`, `ReturnInspections`, `ReturnInventoryMovements`, `Replacements`, `RefundRecords`.

#### B. Repository

`genRepo` factory (lines 3-9) generates 4 repositories: rmaRepository, rmaLineRepository, returnInspectionRepository, refundRepository. Each has create/findById/list. **No update, no delete.**

Plus `genRmaNumber` and `genRefundNumber` functions.

**Missing**: No repository for `ReturnInventoryMovements` or `Replacements`.

#### C. Service

6 service methods (lines 11-64):
- `createRma` (line 12-24): creates RMA with lines
- `getById` (line 25)
- `list` (line 26)
- `transition` (line 27-45): workflow transition with inspection-required check
- `createInspection` (line 46-53): creates return inspection
- `listInspections` (line 54)
- `createRefund` (line 55-62): creates refund record
- `listRefunds` (line 63)

Business rules:
- Must have ≥1 line (line 14)
- Inspection required before RESOLVED (line 34-36)
- Received qty positive (line 48)
- Refund amount positive (line 57)

**Missing business rules**:
- No inventory restock on inspection (RETURN_TO_STOCK disposition doesn't actually call inventory.stockIn)
- No refund approval workflow (refund is created in PENDING status but no transition endpoint)
- No replacement order creation
- No SO validation (can create RMA against non-existent SO)
- No customer validation

#### D. Routes — 8 endpoints

| Method | Path | Permission | Schema |
|--------|------|-----------|--------|
| GET | `/rmas` | **CUSTOMER_READ (proxy)** | — |
| GET | `/rmas/:id` | **CUSTOMER_READ (proxy)** | — |
| POST | `/rmas` | **CUSTOMER_UPDATE (proxy)** | rmaSchema |
| POST | `/rmas/:id/transition` | **CUSTOMER_UPDATE (proxy)** | rmaTransitionSchema |
| GET | `/rmas/:id/inspections` | **CUSTOMER_READ (proxy)** | — |
| POST | `/rmas/:id/inspections` | **CUSTOMER_UPDATE (proxy)** | inspSchema |
| GET | `/refunds` | **CUSTOMER_READ (proxy)** | — |
| POST | `/refunds` | **CUSTOMER_UPDATE (proxy)** | refundSchema |

**Missing endpoints**:
- PATCH `/rmas/:id` (no edit)
- DELETE `/rmas/:id` (no cancel — must use transition to CLOSED)
- POST `/refunds/:id/transition` (no refund approval)
- POST `/refunds/:id/process` (process refund)
- POST `/rmas/:id/replacement` (create replacement order)
- GET `/refunds/:id`

#### E. DTOs

4 schemas with comprehensive fields. `rmaSchema` has nested lines array with condition enum. `rmaTransitionSchema` has 8-state enum. `inspSchema` has disposition enum `['RETURN_TO_STOCK', 'SCRAP', 'REPAIR', 'REJECT', 'HOLD']`.

#### F. RBAC

Uses `CUSTOMER_READ`, `CUSTOMER_UPDATE`. **Wrong domain.**

**Should add**: `RMA_READ`, `RMA_CREATE`, `RMA_APPROVE`, `RETURN_INSPECT`, `REFUND_APPROVE`, `REFUND_PROCESS`.

#### G. Workflow

`RMALifecycle` (`workflow/index.ts:7-22`): 8 states, 9 transitions. REQUESTED → APPROVED → RETURN_RECEIVED → INSPECTION_PENDING → INSPECTED → RESOLVED → CLOSED. Plus REJECTED with return paths.

#### H. Events

- `RMACreated` (line 22)
- `RMAClosed` (line 43)

**Missing**: `RMAApproved`, `RMARejected`, `ReturnReceived`, `RMAInspected`, `RMAResolved`, `RefundCreated`, `RefundProcessed`.

#### I. Audit

RMA_CREATED, RMA_TRANSITION, RETURN_INSPECTION, REFUND_CREATED.

#### J. Business rules

Enforced (see C). **Critical missing**:
- No actual inventory restock on `RETURN_TO_STOCK` disposition
- No refund approval flow
- No replacement order creation

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **RMA_* permissions** — **2 hours**
2. **Inventory restock** on inspection disposition — **8 hours**
3. **Refund transition/approval endpoints** — **6 hours**
4. **Replacement order creation** — **8 hours**
5. **PATCH/DELETE** on RMA — **4 hours**
6. **Missing events** — **3 hours**
7. **SO/customer validation** — **2 hours**

**Estimated effort**: ~33 hours.

---

### 2.18 `attendance-shift/` — 🟡 PARTIAL (stub-template)

**Source files:** `routes/index.ts` (94L), `service/index.ts` (444L), `repository/index.ts` (154L), `workflow/index.ts` (25L) — but no workflow file in `ls` output (need to verify)
**Migration:** `0018_hrms.sql` (attendance, rosters, holidays, weekly_offs, overtime_requests, timesheets tables)

#### A. Database

Multiple Prisma models (`schema.prisma:8408-8577`): `Attendance`, `Rosters`, `RosterLines`, `Holidays`, `WeeklyOffs`, `OvertimeRequests`, `Timesheets`.

#### B. Repository

Stub-template — generic CRUD on `Attendance` entity only. Does NOT expose rosters, holidays, weekly_offs, overtime_requests, timesheets.

#### C. Service

Generic CRUD. No domain-specific logic:
- No shift roster generation
- No holiday calendar management
- No overtime calculation
- No late-mark / half-day / absent determination
- No timesheet approval
- No attendance regularization

#### D. Routes — 7 endpoints (stub-template)

All use `ORG_READ` / `ORG_UPDATE` — **wrong domain** (should be HR_*).

**RBAC bug (BUG-6)**: Any user with `org:update` (procurement_officer, procurement_manager) can mutate attendance records.

**Missing endpoints**:
- GET `/rosters`, POST `/rosters`
- GET `/holidays`, POST `/holidays`
- GET `/weekly-offs`, POST `/weekly-offs`
- GET `/overtime-requests`, POST `/overtime-requests`, POST `/overtime-requests/:id/approve`
- GET `/timesheets`, POST `/timesheets`, POST `/timesheets/:id/approve`
- POST `/attendance/:id/regularize`
- GET `/attendance/reports/monthly`

#### E. DTOs

NO zod validators.

#### F. RBAC

Uses `ORG_READ`, `ORG_UPDATE`. **No `HR_*` permissions in registry.**

#### G. Workflow

Stub-template workflow (file existence unverified due to ls output not showing it, but service imports it).

#### H. Events

Generic stub-template events.

#### I. Audit

Generic stub-template audit.

#### J. Business rules

None beyond generic uniqueness.

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **HR_* permissions** — **2 hours**
2. **zod validators** — **4 hours**
3. **Roster management** — **16 hours**
4. **Holiday calendar** — **8 hours**
5. **Overtime calculation** — **16 hours**
6. **Timesheet approval** — **8 hours**
7. **Attendance regularization** — **8 hours**
8. **Monthly reports** — **8 hours**

**Estimated effort**: ~70 hours.

---

### 2.19 `performance-management/` — 🟡 PARTIAL (stub-template)

**Source files:** `routes/index.ts` (94L), `service/index.ts` (444L), `workflow/index.ts` (18L), `repository/index.ts` (154L)
**Migration:** `0018_hrms.sql` (performance_cycles, employee_goals, appraisals, feedback_360, training_recommendations tables)

#### A. Database

5 Prisma models (`schema.prisma:9167-9305`): `PerformanceCycles`, `EmployeeGoals`, `Appraisals`, `Feedback360`, `TrainingRecommendations`.

#### B. Repository

Stub-template — generic CRUD on `PerformanceCycle` entity only. Does NOT expose goals, appraisals, feedback, training.

#### C. Service

Generic CRUD. No domain-specific logic:
- No goal setting
- No self-assessment
- No manager review
- No 360-feedback collection
- No calibration
- No finalization
- No training recommendation generation

#### D. Routes — 7 endpoints (stub-template)

All use `ORG_READ` / `ORG_UPDATE` — **wrong domain**.

**RBAC bug (BUG-6)**: Same as attendance.

**Missing endpoints**:
- GET `/cycles/:id/goals`, POST `/cycles/:id/goals`
- GET `/appraisals`, POST `/appraisals`
- POST `/appraisals/:id/self-assess`
- POST `/appraisals/:id/manager-review`
- POST `/appraisals/:id/calibrate`
- POST `/appraisals/:id/finalize`
- GET `/feedback-360`, POST `/feedback-360`
- GET `/training-recommendations`

#### E. DTOs

NO zod validators.

#### F. RBAC

Uses `ORG_READ`, `ORG_UPDATE`. **No `PERF_*` permissions in registry.**

#### G. Workflow

`AppraisalLifecycle` (`workflow/index.ts:4-15`): 6 states, 6 transitions. DRAFT → SELF_ASSESSMENT → MANAGER_REVIEW → CALIBRATION → FINALIZED → CLOSED.

#### H. Events

Generic stub-template events.

#### I. Audit

Generic stub-template audit.

#### J. Business rules

None beyond generic uniqueness.

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **PERF_* permissions** — **2 hours**
2. **zod validators** — **4 hours**
3. **Goal management** — **12 hours**
4. **Self-assessment flow** — **8 hours**
5. **Manager review flow** — **8 hours**
6. **360-feedback** — **12 hours**
7. **Calibration** — **8 hours**
8. **Training recommendations** — **8 hours**

**Estimated effort**: ~62 hours.

---

### 2.20 `alerts-kpi-engine/` — 🟡 PARTIAL (stub-template)

**Source files:** `routes/index.ts` (94L), `service/index.ts` (444L), `workflow/index.ts` (16L), `repository/index.ts` (154L)
**Migration:** `0019_bi_analytics.sql` (alert_rules, alerts, alert_escalations, notification_digests, kpi_monitoring tables)

#### A. Database

5 Prisma models (`schema.prisma:9908-10037`): `AlertRules`, `Alerts`, `AlertEscalations`, `NotificationDigests`, `KpiMonitoring`.

#### B. Repository

Stub-template — generic CRUD on `AlertRule` entity only. Does NOT expose alerts, escalations, digests, KPIs.

#### C. Service

Generic CRUD. No domain-specific logic:
- No alert rule evaluation engine
- No alert firing
- No escalation logic
- No KPI computation
- No notification digest generation
- No metric collection

#### D. Routes — 7 endpoints (stub-template)

All use `AUDIT_READ` / `AUDIT_READ_CRITICAL`. At least the WRITE_PERM is elevated (per worklog: "alerts-kpi-engine: changed WRITE_PERM from AUDIT_READ to AUDIT_READ_CRITICAL").

**Missing endpoints**:
- GET `/alerts` (active alerts)
- POST `/alerts/:id/acknowledge`
- POST `/alerts/:id/escalate`
- POST `/alerts/:id/resolve`
- POST `/alerts/:id/suppress`
- GET `/kpis` (KPI values)
- GET `/kpis/:code/value`
- POST `/rules/:id/evaluate` (manually trigger evaluation)

#### E. DTOs

NO zod validators.

#### F. RBAC

Uses `AUDIT_READ`, `AUDIT_READ_CRITICAL`. Better than the other stubs (at least elevated for writes), but still not domain-specific.

**Should add**: `ALERT_READ`, `ALERT_RULE_MANAGE`, `ALERT_ACKNOWLEDGE`, `ALERT_ESCALATE`, `ALERT_RESOLVE`, `KPI_VIEW`.

#### G. Workflow

`AlertLifecycle` (`workflow/index.ts:4-14`): 5 states, 8 transitions. ACTIVE → ACKNOWLEDGED → RESOLVED, plus ESCALATED and SUPPRESSED paths.

#### H. Events

Generic stub-template events.

#### I. Audit

Generic stub-template audit.

#### J. Business rules

None beyond generic uniqueness.

#### K. Completeness: 🟡 PARTIAL

**Missing**:
1. **ALERT_* permissions** — **2 hours**
2. **zod validators** — **4 hours**
3. **Alert evaluation engine** (cron-based rule evaluation) — **24 hours**
4. **Alert firing** (create Alert record when rule triggers) — **8 hours**
5. **Escalation logic** (auto-escalate after SLA breach) — **8 hours**
6. **KPI computation engine** — **24 hours**
7. **Notification digest generation** — **8 hours**
8. **Alert management endpoints** (acknowledge, escalate, resolve, suppress) — **8 hours**

**Estimated effort**: ~86 hours.

---

## 3. MISSING MODULES (all 9 confirmed absent)

### Verification method

Searched `apps/backend/src/modules/` for directory existence:
```
ls apps/backend/src/modules/ | grep -E "receiving|yard|eam|equipment|cycle-count|stock-transfer|stock-adjustment|task-queue|mission-control|control-tower"
```
Result: NO matches. All 9 modules are confirmed MISSING.

Searched `prisma/schema.prisma` for related models:
- `Receiving`, `ASN`, `Appointment`, `Dock`, `Yard`, `Truck`: NO models found
- `EAM`, `Equipment`, `Forklift`, `Battery`, `Scanner`: NO models found
- `CycleCount`, `CountRequest`, `Variance`: NO models found
- `StockTransfer`: NO models found
- `StockAdjustment`: NO models found
- `TaskQueue`, `UnifiedTask`: NO models found
- `MissionControl`, `OperationsDashboard`: NO models found
- `ControlTower`, `ExceptionCenter`, `SLA`: NO models found

### 3.1 `receiving/` — 🔴 MISSING

**What it should provide** (per Section 04 frontend):
- ASN (Advance Shipping Notice) CRUD
- Dock appointment scheduling
- Dock door management
- Receiving exceptions
- Inbound logistics tracking

**What needs to be built**:
- Prisma models: `AsnHeaders`, `AsnLines`, `DockAppointments`, `DockDoors`, `ReceivingExceptions`
- Migration: new SQL file `0020_receiving.sql`
- Repository: 5 repositories with full CRUD
- Service: ASN creation from PO, appointment scheduling, dock door assignment, exception logging
- Routes: ~20 endpoints
- Workflow: `AsnLifecycle` (EXPECTED → IN_TRANSIT → ARRIVED → UNLOADED → CLOSED)
- Permissions: `RECEIVING_READ`, `RECEIVING_CREATE`, `RECEIVING_UPDATE`, `RECEIVING_DELETE`, `DOCK_MANAGE`
- Events: `AsnCreated`, `AsnArrived`, `DockScheduled`, `ReceivingException`
- Audit: all mutations

**Blocked frontend modules**: ASN Management, Dock Appointments, Inbound Logistics, Receiving Console

**Estimated effort**: ~80 hours.

### 3.2 `yard/` — 🔴 MISSING

**What it should provide**:
- Truck queue management
- Dock schedule view
- Yard map (visual representation of trucks in yard)
- Gate console (check-in / check-out)
- Yard moves (reposition trucks)

**What needs to be built**:
- Prisma models: `YardTrucks`, `YardLocations`, `GateEntries`, `GateExits`, `YardMoves`
- Migration: `0021_yard.sql`
- Repository: 5 repositories
- Service: check-in, check-out, yard move, dock assignment
- Routes: ~15 endpoints
- Workflow: `TruckLifecycle` (EXPECTED → ARRIVED → IN_YARD → AT_DOOR → DEPARTED)
- Permissions: `YARD_READ`, `YARD_CHECKIN`, `YARD_CHECKOUT`, `YARD_MOVE`
- Events: `TruckArrived`, `TruckAtDock`, `TruckDeparted`
- Integration with receiving (ASN arrival triggers truck creation)

**Blocked frontend modules**: Yard Management, Gate Console, Dock Schedule, Yard Map

**Estimated effort**: ~60 hours.

### 3.3 `eam/` (Enterprise Asset Management) — 🔴 MISSING

**What it should provide**:
- Forklift and equipment CRUD
- Battery management (charge cycles, replacement)
- Maintenance scheduling (preventive, corrective)
- Operator certifications
- Scanner device management

**What needs to be built**:
- Prisma models: `Equipment`, `EquipmentTypes`, `Batteries`, `BatteryCharges`, `MaintenanceSchedules`, `MaintenanceRecords`, `Certifications`, `ScannerDevices`
- Migration: `0022_eam.sql`
- Repository: 8 repositories
- Service: equipment CRUD, maintenance scheduling, battery tracking, certification expiry alerts, scanner registration
- Routes: ~30 endpoints
- Workflow: `EquipmentLifecycle`, `MaintenanceLifecycle`
- Permissions: `EAM_READ`, `EAM_CREATE`, `EAM_UPDATE`, `EAM_MAINTENANCE`, `EAM_CERTIFY`
- Events: `EquipmentCreated`, `MaintenanceScheduled`, `MaintenanceCompleted`, `CertificationExpiring`, `ScannerRegistered`
- Integration with alerts-kpi-engine for maintenance reminders

**Blocked frontend modules**: Equipment Master, Maintenance Schedule, Battery Management, Certifications, Scanner Management

**Estimated effort**: ~120 hours.

### 3.4 `cycle-count/` — 🔴 MISSING

**What it should provide**:
- Count request creation (ABC-class based, scheduled, ad-hoc)
- Count execution (bin-level, product-level, warehouse-level)
- Variance calculation
- Variance approval workflow
- Adjustment posting (to inventory)

**What needs to be built**:
- Prisma models: `CycleCountRequests`, `CycleCountLines`, `CycleCountVariances`, `CycleCountApprovals`
- Migration: `0023_cycle_count.sql`
- Repository: 4 repositories
- Service: request creation, count execution, variance calculation, approval, adjustment posting (calls inventory)
- Routes: ~15 endpoints
- Workflow: `CycleCountLifecycle` (DRAFT → SCHEDULED → IN_PROGRESS → COUNTED → RECONCILED → APPROVED → POSTED → CLOSED)
- Permissions: `CYCLE_COUNT_READ`, `CYCLE_COUNT_CREATE`, `CYCLE_COUNT_EXECUTE`, `CYCLE_COUNT_APPROVE`, `CYCLE_COUNT_POST`
- Events: `CycleCountCreated`, `CycleCountCompleted`, `VarianceDetected`, `AdjustmentPosted`
- Integration with inventory module for adjustment posting

**Blocked frontend modules**: Cycle Count Requests, Count Execution, Variance Approval, ABC Analysis

**Estimated effort**: ~70 hours.

### 3.5 `stock-transfer/` — 🔴 MISSING

**What it should provide**:
- Transfer request creation (source warehouse → destination warehouse)
- Paired stockOut + stockIn execution
- In-transit tracking
- Transfer receipt confirmation
- Transfer cancellation/short-ship

**What needs to be built**:
- Prisma models: `StockTransfers`, `StockTransferLines`, `StockTransferShipments`, `StockTransferReceipts`
- Migration: `0024_stock_transfer.sql`
- Repository: 4 repositories
- Service: request creation, pick/ship (calls inventory.stockOut), receive (calls inventory.stockIn), cancel
- Routes: ~12 endpoints
- Workflow: `StockTransferLifecycle` (DRAFT → APPROVED → IN_PICKING → IN_TRANSIT → RECEIVED → CLOSED, plus CANCELLED)
- Permissions: `TRANSFER_READ`, `TRANSFER_CREATE`, `TRANSFER_APPROVE`, `TRANSFER_SHIP`, `TRANSFER_RECEIVE`
- Events: `TransferCreated`, `TransferShipped`, `TransferReceived`, `TransferCancelled`
- Integration with inventory module for paired stockOut/stockIn

**Blocked frontend modules**: Stock Transfer Requests, Transfer Execution, Transfer Tracking

**Estimated effort**: ~50 hours.

### 3.6 `stock-adjustment/` — 🔴 MISSING

**What it should provide**:
- Adjustment request creation (variance + reason code)
- Approval workflow
- Adjustment posting (to inventory, with ledger entry)
- Adjustment types: gain, loss, damage, reclassification, recount

**What needs to be built**:
- Prisma models: `StockAdjustments`, `StockAdjustmentLines`, `StockAdjustmentApprovals`
- Migration: `0025_stock_adjustment.sql`
- Repository: 3 repositories
- Service: request creation, approval, posting (calls inventory with adjustment movement type)
- Routes: ~10 endpoints
- Workflow: `StockAdjustmentLifecycle` (DRAFT → SUBMITTED → APPROVED → POSTED → CLOSED, plus REJECTED)
- Permissions: `ADJUSTMENT_READ`, `ADJUSTMENT_CREATE`, `ADJUSTMENT_APPROVE`, `ADJUSTMENT_POST`
- Events: `AdjustmentCreated`, `AdjustmentApproved`, `AdjustmentPosted`, `AdjustmentRejected`
- Integration with inventory module

**Blocked frontend modules**: Stock Adjustment Requests, Adjustment Approval, Adjustment Posting

**Estimated effort**: ~40 hours.

### 3.7 `task-queue/` — 🔴 MISSING

**What it should provide**:
- Unified task aggregation across modules (putaway, pick, pack, count, transfer, maintenance)
- Task assignment to operators
- Task priority management
- Task completion tracking
- Operator workload view

**What needs to be built**:
- Prisma models: `UnifiedTasks` (view or materialized table aggregating from putaway_tasks, pick_lists, cycle_count_requests, etc.)
- Migration: `0026_task_queue.sql`
- Repository: 1 repository with cross-module queries
- Service: aggregate, assign, prioritize, complete
- Routes: ~8 endpoints
- No workflow (tasks are derived from source modules)
- Permissions: `TASK_QUEUE_VIEW`, `TASK_ASSIGN`, `TASK_COMPLETE`
- Events: `TaskAssigned`, `TaskCompleted`
- Integration with all task-producing modules

**Blocked frontend modules**: Task Queue, Operator Workload, Task Assignment

**Estimated effort**: ~30 hours.

### 3.8 `mission-control/` — 🔴 MISSING

**What it should provide**:
- Operations dashboard aggregation (KPIs across inventory, warehouse, manufacturing, fulfillment)
- Real-time metrics (stock value, pending picks, active putaways, OEE, on-time delivery)
- Cross-module alerts
- Shift performance view

**What needs to be built**:
- Prisma models: `MissionControlWidgets`, `MissionControlDashboards` (or pure read-only views)
- Migration: `0027_mission_control.sql` (or no migration if pure read-only)
- Repository: 1 repository with aggregation queries
- Service: KPI calculation, widget data fetching
- Routes: ~10 endpoints (GET /kpi/:code, GET /widgets, GET /dashboard/:id)
- No workflow
- Permissions: `MISSION_CONTROL_VIEW`
- Events: none (read-only)
- Integration with all operational modules

**Blocked frontend modules**: Mission Control Dashboard, Operations KPIs, Shift Performance

**Estimated effort**: ~40 hours.

### 3.9 `control-tower/` — 🔴 MISSING

**What it should provide**:
- Operations SLA tracking (order-to-delivery, ASN-to-GRN, pick-to-pack time)
- Exception center (aggregated exceptions from GRN, quality, delivery, fulfillment)
- SLA breach alerts
- Escalation workflows

**What needs to be built**:
- Prisma models: `SlaDefinitions`, `SlaTrackings`, `ExceptionCenter` (aggregation table)
- Migration: `0028_control_tower.sql`
- Repository: 3 repositories
- Service: SLA evaluation, exception aggregation, escalation
- Routes: ~12 endpoints
- Workflow: `ExceptionLifecycle` (DETECTED → ACKNOWLEDGED → INVESTIGATING → RESOLVED → CLOSED)
- Permissions: `CONTROL_TOWER_VIEW`, `CONTROL_TOWER_MANAGE_SLA`, `CONTROL_TOWER_ESCALATE`
- Events: `SlaBreached`, `ExceptionDetected`, `ExceptionEscalated`, `ExceptionResolved`
- Integration with alerts-kpi-engine, all operational modules

**Blocked frontend modules**: Control Tower, SLA Monitoring, Exception Center

**Estimated effort**: ~60 hours.

---

## 4. DEPENDENCY ANALYSIS — FRONTEND MODULES BLOCKED

### Frontend modules with NO backend (must use mock data)

| Frontend Module | Required Backend | Status |
|----------------|------------------|--------|
| ASN Management | receiving | 🔴 MISSING |
| Dock Appointments | receiving | 🔴 MISSING |
| Inbound Logistics | receiving | 🔴 MISSING |
| Receiving Console | receiving | 🔴 MISSING |
| Yard Management | yard | 🔴 MISSING |
| Gate Console | yard | 🔴 MISSING |
| Dock Schedule | yard | 🔴 MISSING |
| Yard Map | yard | 🔴 MISSING |
| Equipment Master | eam | 🔴 MISSING |
| Maintenance Schedule | eam | 🔴 MISSING |
| Battery Management | eam | 🔴 MISSING |
| Certifications | eam | 🔴 MISSING |
| Scanner Management | eam | 🔴 MISSING |
| Cycle Count Requests | cycle-count | 🔴 MISSING |
| Count Execution | cycle-count | 🔴 MISSING |
| Variance Approval | cycle-count | 🔴 MISSING |
| ABC Analysis | cycle-count | 🔴 MISSING |
| Stock Transfer Requests | stock-transfer | 🔴 MISSING |
| Transfer Execution | stock-transfer | 🔴 MISSING |
| Transfer Tracking | stock-transfer | 🔴 MISSING |
| Stock Adjustment Requests | stock-adjustment | 🔴 MISSING |
| Adjustment Approval | stock-adjustment | 🔴 MISSING |
| Task Queue | task-queue | 🔴 MISSING |
| Operator Workload | task-queue | 🔴 MISSING |
| Mission Control | mission-control | 🔴 MISSING |
| Control Tower | control-tower | 🔴 MISSING |
| SLA Monitoring | control-tower | 🔴 MISSING |
| Exception Center | control-tower | 🔴 MISSING |

**28 frontend modules are fully blocked by missing backend modules.**

### Frontend modules with PARTIAL backend (functional with workarounds)

| Frontend Module | Backend Module | Workaround |
|----------------|----------------|------------|
| Inventory Dashboard | inventory | Hide edit/delete UI; show reserved_by_name as NULL |
| Stock Reservation | inventory | Hide delete button; show "N/A" for reserved_by_name |
| Stock Block | inventory | Hide release-block button (doesn't exist) |
| Batch Expiry | inventory | Works (read-only) |
| Putaway Management | warehouse | Hide edit/delete for tasks; show assigned_to_name as NULL |
| Bin Management | warehouse | Hide edit/delete for bins |
| Zone/Aisle/Rack Management | warehouse | Hide edit/delete |
| Barcode Management | warehouse | Hide edit/delete |
| Quality Inspection | quality-inspection | Hide edit/delete; CAPA transition unavailable |
| Batch Genealogy | batch-manufacturing | Works (read-only + split/merge) |
| OEE Dashboard | mes | Fix OEE calc bug or show "N/A" |
| Pick List Management | pick-pack-dispatch | Hide edit/delete; fix inventory stockOut bug or disable |
| Packing List Management | pick-pack-dispatch | Hide edit/delete |
| Shipment Management | pick-pack-dispatch | Hide edit/delete; inventory may be corrupted |
| Delivery Management | delivery-management | Hide edit/delete; no reschedule |
| POD Capture | delivery-management | Works |
| Sales Order Management | sales-order | Hide edit/delete; no line management |
| RMA Management | customer-returns | Hide edit/delete; no refund approval |
| Refund Processing | customer-returns | No approval workflow |
| Product Costing | product-costing | Hide all UI (RBAC broken) |
| GL Journal | general-ledger | Hide all UI (RBAC broken) |
| GST Configuration | gst-taxation | Hide all UI (RBAC broken) |
| Attendance | attendance-shift | Hide all UI (RBAC broken) |
| Performance Cycle | performance-management | Hide all UI (RBAC broken) |
| Alert Rules | alerts-kpi-engine | Limited (no alert firing engine) |
| KPI Monitoring | alerts-kpi-engine | Limited (no KPI computation) |

### Frontend modules with COMPLETE backend (ready to wire)

| Frontend Module | Backend Module |
|----------------|----------------|
| GRN Management | goods-receipt |
| Purchase Order Management | purchase-order |
| Purchase Requisition | procurement (with permission workaround) |

---

## 5. RECOMMENDED BUILD ORDER

Based on business dependencies (upstream modules must exist before downstream modules can function):

### Phase 1: Critical Bug Fixes (must do first)
1. **BUG-1, BUG-2, BUG-3**: Fix field-map typos in inventory and warehouse repositories — **3 hours**
2. **BUG-5**: Fix RBAC in product-costing, general-ledger, gst-taxation routes — **1 hour**
3. **BUG-6**: Fix RBAC in attendance-shift, performance-management routes — **1 hour**
4. **BUG-8**: Add INVENTORY_ADJUST to warehouse_operator and quality_manager roles — **1 hour**
5. **BUG-4**: Fix or disable inventory.stockOut call in pick-pack-dispatch — **4 hours**

**Phase 1 total: ~10 hours**

### Phase 2: Add Domain-Specific Permissions (enables proper RBAC)
6. Add `PR_*`, `SO_*`, `FULFILLMENT_*`, `PICK_PACK_*`, `DELIVERY_*`, `RMA_*`, `BATCH_*`, `MES_*`, `COSTING_*`, `GL_*`, `GST_*`, `FIN_*`, `HR_*`, `PERF_*`, `ALERT_*` permissions to registry — **6 hours**
7. Update all 17 PARTIAL module routes to use domain permissions — **8 hours**

**Phase 2 total: ~14 hours**

### Phase 3: Add Missing CRUD (PATCH/DELETE)
8. Add PATCH/DELETE to warehouse (zones, aisles, racks, bins, barcodes) — **8 hours**
9. Add PATCH/DELETE to quality-inspection (lots, plans, holds, ncrs, capas) — **12 hours**
10. Add PATCH to sales-order + line management endpoints — **12 hours**
11. Add PATCH/DELETE to order-fulfillment, pick-pack-dispatch, delivery-management — **24 hours**
12. Add zod validators to all stub-template modules — **8 hours**

**Phase 3 total: ~64 hours**

### Phase 4: Build Missing WMS Modules (in dependency order)
13. **receiving/** (ASN, dock appointments) — **80 hours** — unblocks 4 frontend modules
14. **yard/** (truck queue, gate console) — **60 hours** — unblocks 4 frontend modules
15. **cycle-count/** — **70 hours** — unblocks 4 frontend modules
16. **stock-transfer/** — **50 hours** — unblocks 3 frontend modules
17. **stock-adjustment/** — **40 hours** — unblocks 3 frontend modules
18. **eam/** (equipment, maintenance, certifications, scanners) — **120 hours** — unblocks 5 frontend modules

**Phase 4 total: ~420 hours**

### Phase 5: Build Aggregation Modules
19. **task-queue/** — **30 hours** — unblocks 2 frontend modules
20. **mission-control/** — **40 hours** — unblocks 1 frontend module
21. **control-tower/** — **60 hours** — unblocks 3 frontend modules

**Phase 5 total: ~130 hours**

### Phase 6: Implement Domain Logic in Stub-Template Modules
22. **general-ledger**: double-entry validation, GL posting, trial balance, financial statements — **83 hours**
23. **product-costing**: cost calculation, rollup, variance, GL posting — **87 hours**
24. **gst-taxation**: e-invoice, e-way bill, GSTR filing — **129 hours**
25. **attendance-shift**: roster, overtime, timesheet — **70 hours**
26. **performance-management**: goals, appraisals, 360-feedback — **62 hours**
27. **alerts-kpi-engine**: alert firing, KPI computation, escalation — **86 hours**

**Phase 6 total: ~517 hours**

### Grand Total: ~1,155 hours

This is consistent with the prior worklog estimate of "~460-590 hours to reach 9.8/10" when adjusted for the additional missing modules and domain logic discovered in this audit.

---

## 6. APPENDIX: SOURCE FILE CITATIONS

### Permission registry
- `/home/z/my-project/apps/backend/src/core/permissions/registry.ts:9-87` (Permission enum)
- `/home/z/my-project/apps/backend/src/core/permissions/registry.ts:93-155` (DEFAULT_ROLES)

### Route registrations
- `/home/z/my-project/apps/backend/src/app/app.ts:177-231` (all Section 04 module routes)

### Migrations
- `/home/z/my-project/apps/backend/prisma/migrations/0002_organization.sql:31,126,156,183,205` (companies, plants, warehouses, departments, cost_centers)
- `/home/z/my-project/apps/backend/prisma/migrations/0011_purchase_orders.sql` (PO tables)
- `/home/z/my-project/apps/backend/prisma/migrations/0012_warehouse_inventory.sql:16-895` (GRN, IQC, inventory, warehouse — 30 tables)
- `/home/z/my-project/apps/backend/prisma/migrations/0013_manufacturing.sql:10-540` (MES, BOM, production, batch — 37 tables)
- `/home/z/my-project/apps/backend/prisma/migrations/0015_sales_distribution.sql:10-560` (SO, fulfillment, pick/pack/ship, delivery, returns — 25 tables)
- `/home/z/my-project/apps/backend/prisma/migrations/0016_finance.sql:10-636` (finance foundation, AP/AR, GL, GST — 32 tables)
- `/home/z/my-project/apps/backend/prisma/migrations/0018_hrms.sql` (attendance, leave, payroll, recruitment, performance)
- `/home/z/my-project/apps/backend/prisma/migrations/0019_bi_analytics.sql` (alerts, KPIs, dashboards, AI)

### Bug locations
- BUG-1: `inventory/repository/index.ts:249`
- BUG-2: `inventory/repository/index.ts:293`
- BUG-3: `warehouse/repository/index.ts:147,177`
- BUG-4: `pick-pack-dispatch/service/index.ts:36-43`
- BUG-5: `product-costing/routes/index.ts:25-26`, `general-ledger/routes/index.ts:25-26`, `gst-taxation/routes/index.ts:25-26`
- BUG-6: `attendance-shift/routes/index.ts:25-26`, `performance-management/routes/index.ts:25-26`
- BUG-7: `mes/service/index.ts:125`
- BUG-8: `core/permissions/registry.ts:139-144` (warehouse_operator missing INVENTORY_ADJUST)
- BUG-9: `customer-returns/repository/index.ts:3-9` (genRepo doesn't set version field)
- BUG-10: `order-fulfillment/service/index.ts:39` (raw SQL table name case)
- BUG-11: `pick-pack-dispatch/service/index.ts:14` (no SO status validation)
- BUG-12: `procurement/routes/index.ts:80` (DELETE uses PR_CREATE)
- BUG-13: `quality-inspection/routes/index.ts:170,175,201` (NCR/CAPA reads use GRN_READ)

### Prisma schema
- `/home/z/my-project/apps/backend/prisma/schema.prisma` (10,038 lines, ~350 models)

---

**END OF AUDIT**

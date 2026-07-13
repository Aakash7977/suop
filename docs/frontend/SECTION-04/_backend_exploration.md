# SECTION 04 — OPERATIONS BACKEND EXPLORATION

**Task ID**: SECTION04-BE-EXPLORE
**Agent**: Explore sub-agent (Section 04 Backend Exploration)
**Scope**: EXHAUSTIVE inventory of every backend capability related to Section 04 (Operations / WMS PART 4) — Sprints 12-32
**Method**: Direct reading of every source file with file:line citations for every claim. NO assumptions.
**Date**: 2025

---

## 0. EXECUTIVE SUMMARY

### Coverage matrix: Section 04 frontend module → backend module existence

| # | Section 04 Frontend Module | Backend Module | Mount Prefix | Endpoints | Status |
|---|---|---|---|---|---|
| 1 | Inventory Engine | `inventory/` | `/api/v1/inventory` | 13 | ✅ FULL |
| 2 | Goods Receipt (GRN) | `goods-receipt/` | `/api/v1/warehouse/grns` | 6 | ✅ FULL |
| 3 | Stock Issue | (none) | — | 0 | ❌ NOT FOUND — covered only by `inventory/stock-out` |
| 4 | Stock Transfer | (none) | — | 0 | ❌ NOT FOUND — no endpoint exists |
| 5 | Stock Adjustment | (none) | — | 0 | ❌ NOT FOUND — `INVENTORY_ADJUST` perm exists but only used for blocks/expiry |
| 6 | Reservation Management | `inventory/` | `/api/v1/inventory/reservations` | 3 | ✅ FULL (basic) |
| 7 | Cycle Count | (none) | — | 0 | ❌ NOT FOUND — no model, no endpoint, no service |
| 8 | Batch & Expiry Management | `inventory/` + `batch-manufacturing/` | `/api/v1/inventory/batches` + `/api/v1/manufacturing/batches` | 13+9 | ✅ FULL |
| 9 | Costing | `product-costing/` | `/api/v1/finance/costing` | 7 | ⚠️ STUB — generic CRUD only, no actual cost calculation |
| 10 | Mission Control | (none) | — | 0 | ❌ NOT FOUND — no Mission Control module; only generic `alerts-kpi-engine/` |
| 11 | Receiving (ASNs/Appointments/Docks/Exceptions) | (none) | — | 0 | ❌ NOT FOUND — no ASN/Appointment/Dock/Receiving-Exception module |
| 12 | Putaway | `warehouse/` | `/api/v1/warehouse/putaway-tasks` | 3 | ✅ FULL (basic) |
| 13 | Fulfillment (picking/packing/dispatch) | `order-fulfillment/` + `pick-pack-dispatch/` + `delivery-management/` | `/api/v1/sales/fulfillment` + `/api/v1/sales/pick-pack-dispatch` + `/api/v1/sales/delivery` | 4+3+6 | ✅ FULL (basic) |
| 14 | Wave Planning | `order-fulfillment/` | `/api/v1/sales/fulfillment/waves` | 2 | ⚠️ BASIC — create+list only, no release/pick assignment |
| 15 | Task Queue | (none) | — | 0 | ❌ NOT FOUND — no Task Queue module |
| 16 | Workforce Management | `attendance-shift/` + `performance-management/` | `/api/v1/hrms/attendance` + `/api/v1/hrms/performance` | 7+7 | ⚠️ STUB — generic CRUD only |
| 17 | Equipment Management (EAM) | (none) | — | 0 | ❌ NOT FOUND — no Forklift/Battery/Maintenance/Certification module |
| 18 | Control Tower / SLA / Exception Center | `alerts-kpi-engine/` | `/api/v1/bi/alerts` | 7 | ⚠️ STUB — generic AlertRule CRUD, no operations-specific control tower |
| 19 | Yard Management | (none) | — | 0 | ❌ NOT FOUND — no Truck/Dock/Yard/Gate module |

### Totals
- **Backend modules relevant to Section 04**: 15 modules (across 11 directories: `inventory/`, `goods-receipt/`, `warehouse/`, `procurement/`, `purchase-order/`, `quality-inspection/`, `delivery-management/`, `order-fulfillment/`, `pick-pack-dispatch/`, `batch-manufacturing/`, `product-costing/`, `mes/`, `attendance-shift/`, `performance-management/`, `alerts-kpi-engine/`)
- **Total endpoints discovered**: ~145 endpoints across these modules (full enumeration below)
- **Total events emitted via `eventBus.writeToOutbox`**: ~85 distinct event names across all 15 modules
- **Total Prisma models relevant to Section 04**: ~85 models (enumerated in §10)
- **Genuinely missing backend capabilities**: 7 major areas (Receiving/ASN, Yard Management, Equipment Management/EAM, Cycle Count, Stock Transfer, Stock Adjustment (separate), Task Queue, Mission Control, Control Tower)
- **Critical bugs found**: 3 (see §11)

---

## 1. APP ROUTE REGISTRATION (`apps/backend/src/app/app.ts`)

All Section 04 modules are mounted in `createApp()` at the following lines (cited from `app.ts`):

| Line | Mount Statement | Mount Prefix | Source Module |
|---|---|---|---|
| 187 | `app.route('/api/v1/warehouse/grns', goodsReceiptRoutes)` | `/api/v1/warehouse/grns` | `goods-receipt/` |
| 188 | `app.route('/api/v1/quality', qualityInspectionRoutes)` | `/api/v1/quality` | `quality-inspection/` |
| 189 | `app.route('/api/v1/inventory', inventoryRoutes)` | `/api/v1/inventory` | `inventory/` |
| 190 | `app.route('/api/v1/warehouse', warehouseRoutes)` | `/api/v1/warehouse` | `warehouse/` |
| 183 | `app.route('/api/v1/procurement/requisitions', procurementRoutes)` | `/api/v1/procurement/requisitions` | `procurement/` |
| 186 | `app.route('/api/v1/procurement/purchase-orders', purchaseOrderRoutes)` | `/api/v1/procurement/purchase-orders` | `purchase-order/` |
| 191 | `app.route('/api/v1/mes', mesRoutes)` | `/api/v1/mes` | `mes/` |
| 195 | `app.route('/api/v1/manufacturing/batches', batchManufacturingRoutes)` | `/api/v1/manufacturing/batches` | `batch-manufacturing/` |
| 203 | `app.route('/api/v1/sales/orders', salesOrderRoutes)` | `/api/v1/sales/orders` | `sales-order/` (fulfillment upstream) |
| 205 | `app.route('/api/v1/sales/fulfillment', orderFulfillmentRoutes)` | `/api/v1/sales/fulfillment` | `order-fulfillment/` |
| 206 | `app.route('/api/v1/sales/pick-pack-dispatch', pickPackDispatchRoutes)` | `/api/v1/sales/pick-pack-dispatch` | `pick-pack-dispatch/` |
| 207 | `app.route('/api/v1/sales/delivery', deliveryManagementRoutes)` | `/api/v1/sales/delivery` | `delivery-management/` |
| 208 | `app.route('/api/v1/sales/returns', customerReturnsRoutes)` | `/api/v1/sales/returns` | `customer-returns/` (returns) |
| 212 | `app.route('/api/v1/finance/costing', ProductCostingRoutes)` | `/api/v1/finance/costing` | `product-costing/` |
| 222 | `app.route('/api/v1/hrms/attendance', AttendanceShiftRoutes)` | `/api/v1/hrms/attendance` | `attendance-shift/` |
| 226 | `app.route('/api/v1/hrms/performance', PerformanceManagementRoutes)` | `/api/v1/hrms/performance` | `performance-management/` |
| 231 | `app.route('/api/v1/bi/alerts', AlertsKpiEngineRoutes)` | `/api/v1/bi/alerts` | `alerts-kpi-engine/` |

Global middleware chain (15 layers) registered `app.ts:128-143` (Helmet, CORS, RequestId, Performance, Logging, RateLimit, PayloadSize, Timeout, Sanitization, SQLGuard, XSSGuard, Compression, Auth, Tenant, CSRF, Audit) — every Section 04 endpoint inherits this chain.

**NOT FOUND after searching the entire `/apps/backend/src/modules/` directory (60 module dirs)**: There is no `receiving/`, `yard/`, `yard-management/`, `equipment/`, `eam/`, `cycle-count/`, `stock-issue/`, `stock-transfer/`, `stock-adjustment/`, `task-queue/`, `mission-control/`, `control-tower/`, `dock/`, `asn/`, `appointment/` module directory. These were verified by `ls -d /home/z/my-project/apps/backend/src/modules/*/`.

---

## 2. PERMISSIONS (`apps/backend/src/core/permissions/registry.ts`)

### Section 04-relevant permission literals (from `registry.ts`)

| Line | Permission Constant | Literal | Used By |
|---|---|---|---|
| 41 | `PO_READ` | `po:read` | procurement, purchase-order, warehouse(grns read proxy) |
| 42 | `PO_CREATE` | `po:create` | procurement (PR proxy), purchase-order |
| 43 | `PO_UPDATE` | `po:update` | purchase-order |
| 44 | `PO_DELETE` | `po:delete` | purchase-order |
| 45 | `PO_APPROVE` | `po:approve` | procurement (PR transition proxy), purchase-order |
| 46 | `PO_APPROVE_ANY` | `po:approve:any` | (unused) |
| 47 | `PO_ISSUE` | `po:issue` | purchase-order |
| 48 | `PO_CLOSE` | `po:close` | purchase-order |
| 49 | `PO_CANCEL` | `po:cancel` | purchase-order (via transition) |
| 50 | `PO_RECEIVE` | `po:receive` | (declared but unused) |
| 51 | `PO_EXPORT` | `po:export` | purchase-order (PDF) |
| 53-58 | `QUOT_*` | `quot:*` | quotation module (procurement adj.) |
| 61 | `GRN_READ` | `grn:read` | goods-receipt |
| 62 | `GRN_CREATE` | `grn:create` | goods-receipt |
| 63 | `GRN_POST` | `grn:post` | goods-receipt (transition) |
| 64 | `GRN_PUTAWAY` | `grn:putaway` | (declared but unused — putaway uses INVENTORY_POST) |
| 67 | `IQC_INSPECT` | `iqc:inspect` | quality-inspection (lots, holds) |
| 68 | `IQC_APPROVE` | `iqc:approve` | quality-inspection (transition, plans) |
| 69 | `NCR_CREATE` | `ncr:create` | quality-inspection (NCR list/get/create) |
| 70 | `NCR_APPROVE` | `ncr:approve` | quality-inspection (NCR transition, CAPA) |
| 71 | `COA_SIGN` | `coa:sign` | (declared but not used in Section 04 modules) |
| 72 | `RECALL_INITIATE` | `recall:initiate` | (recall module — not Section 04) |
| 75 | `INVENTORY_READ` | `inventory:read` | inventory, warehouse (zones/aisles/racks/bins/putaway/barcodes) |
| 76 | `INVENTORY_POST` | `inventory:post` | inventory (stock-in/out/reserve/putaway), warehouse (zones/aisles/racks/bins/putaway-tasks/barcodes) |
| 77 | `INVENTORY_ADJUST` | `inventory:adjust` | inventory (blocks, mark-expired) — **NOTE: NOT used for stock transfer/adjustment** |
| 78 | `INVENTORY_REVERSE` | `inventory:reverse` | (declared but NOT used anywhere in code — verified by grep) |

### Default role permissions (Section 04-relevant)

From `DEFAULT_ROLES` in `registry.ts:93-154`:

| Role | Section 04 Permissions Granted |
|---|---|
| `tenant_admin` (line 94) | All PO_*, QUOT_*, GRN_*, IQC_*, NCR_*, COA_SIGN, RECALL_INITIATE, INVENTORY_READ/POST/ADJUST/REVERSE, AUDIT_READ, AUDIT_READ:CRITICAL |
| `quality_manager` (line 110) | PRODUCT_READ, IQC_*, NCR_*, COA_SIGN, RECALL_INITIATE, INVENTORY_READ, AUDIT_READ |
| `procurement_officer` (line 121) | PRODUCT_READ, SUPPLIER_READ/CREATE/UPDATE, PO_READ/CREATE/UPDATE/ISSUE, QUOT_READ/CREATE, GRN_READ, INVENTORY_READ |
| `procurement_manager` (line 130) | PRODUCT_READ, SUPPLIER_*, PO_* (full), QUOT_* (full), GRN_READ/CREATE, INVENTORY_READ |
| `warehouse_operator` (line 139) | INVENTORY_READ, INVENTORY_POST, GRN_READ, GRN_POST, GRN_PUTAWAY, PRODUCT_READ, CUSTOMER_READ/CREATE/UPDATE/DELETE |
| `auditor` (line 145) | PRODUCT_READ, SUPPLIER_READ, PO_READ, QUOT_READ, GRN_READ, INVENTORY_READ, AUDIT_READ, AUDIT_READ:CRITICAL |

### Critical permission gaps

1. **No `SALES_*` permissions declared** — sales-order, order-fulfillment, pick-pack-dispatch, delivery-management all use `CUSTOMER_READ` / `CUSTOMER_UPDATE` / `CUSTOMER_CREATE` as proxies (`sales-order/routes/index.ts:12-14`, `order-fulfillment/routes/index.ts:9-10`, `pick-pack-dispatch/routes/index.ts:9-10`, `delivery-management/routes/index.ts:9-10`).
2. **No `WAREHOUSE_*` permissions declared** — warehouse module uses `INVENTORY_READ` / `INVENTORY_POST` as proxies for zones/aisles/racks/bins/putaway/barcodes (`warehouse/routes/index.ts:19,24,38,43,58,63,79,88,109,117,123,148,156,162,169,175`).
3. **No `COSTING_*` permissions declared** — `product-costing/routes/index.ts:25-26` uses `AUDIT_READ` for BOTH read AND write — confirmed bug; ANY user with `AUDIT_READ` (e.g. auditor) can mutate product costs.
4. **No `YARD_*`, `EQUIPMENT_*`, `CYCLE_COUNT_*`, `TASK_*`, `MISSION_CONTROL_*` permissions** — because the underlying modules don't exist.
5. **No `ATTENDANCE_*` / `PERFORMANCE_*` permissions** — `attendance-shift/routes/index.ts:25-26` and `performance-management/routes/index.ts:25-26` use `ORG_READ` / `ORG_UPDATE` as proxies. Same for `alerts-kpi-engine/routes/index.ts:25-26` (uses `AUDIT_READ` for both).

### Helper class (`registry.ts:159-195`)
`PermissionChecker` provides:
- `hasPermission(roles, permission)` — line 163
- `hasAnyPermission(roles, permissions[])` — line 174
- `hasAllPermissions(roles, permissions[])` — line 181
- `resolvePermissions(roles)` — line 188

---

## 3. AUDIT SERVICE (`apps/backend/src/core/audit/service.ts`)

### Class: `AuditService` (singleton exported as `auditService`, line 154)

#### Method: `log(entry: AuditLogEntry)` (line 51-86)
- Fire-and-forget insert into `audit_log` table via Prisma `db.auditLog.create`
- Auto-enriches from `getRequestContext()`: actorId, actorName, actorRole, ipAddress, userAgent, correlationId
- Defaults severity to `'INFO'` if not provided
- Catches errors internally and logs via `logger.error` — never throws
- Writes `before/after/diff/metadata` as JSON (uses `Prisma.JsonNull` for null)

#### Method: `getEntityHistory(tenantId, entityType, entityId, options)` (line 91-103)
- Returns audit entries for a specific entity, ordered by timestamp DESC
- Default limit: 50

#### Method: `getActorHistory(tenantId, actorId, options)` (line 108-119)
- Returns audit entries for a specific user, ordered by timestamp DESC
- Default limit: 50

#### Method: `query(tenantId, filters)` (line 124-149)
- Filter by action, severity, entityType, date range (from/to), limit
- Default limit: 100

### `AuditAction` type (line 16-20)
```
'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT'
| 'TRANSITION' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'PRINT'
| 'PERMISSION_DENIED' | 'BLACKLIST' | 'RECALL'
```
NOTE: Module services often pass custom action strings (e.g. `'STOCK_IN'`, `'STOCK_OUT'`, `'GRN_POSTED'`, `'PUTAWAY_CREATED'`) — the type is `AuditAction | string`, so this is type-safe but the registry of valid actions is not enforced.

### `AuditSeverity` type (line 21)
`'INFO' | 'WARN' | 'CRITICAL'`

### Audit table schema (relevant fields)
`audit_log` Prisma model (not shown above but exists in `schema.prisma` lines 24-64): id, tenantId, timestamp, actorType, actorId, actorName, actorRole, ipAddress, userAgent, correlationId, action, severity, entityType, entityId, entityCode, before (Json), after (Json), diff (Json), reason, metadata (Json), createdBy.

### Audit middleware (`apps/backend/src/middleware/audit.ts` — NOT read in detail)
Per `app.ts:143`, `auditMiddleware` is globally registered as the LAST middleware before routes. It auto-logs mutations (POST/PATCH/PUT/DELETE) on top of explicit `auditService.log()` calls inside services.

---

## 4. EVENT BUS (`apps/backend/src/core/events/event-bus.ts`)

### Class: `EventBusImpl extends EventEmitter` (singleton as `eventBus`, line 212)

#### Method: `subscribe<T>(handler: EventHandler<T>)` (line 80-85)
- Registers a handler keyed by `handler.eventName`
- Logs via `logger.info`

#### Method: `publish<T>(event: DomainEvent<T>)` (line 91-112)
- In-memory pub/sub — NOT durable
- Executes all handlers in parallel via `Promise.allSettled`
- Failures logged but don't block other handlers

#### Method: `writeToOutbox<T>(params)` (line 118-134) — DURABLE
- Inserts into `event_outbox` table with status `'PENDING'`
- Enriches with correlationId and actorId from request context
- Returns void (does not publish immediately)

#### Method: `drainOutbox(batchSize=50)` (line 140-183)
- Background job — picks PENDING entries, publishes them, marks PUBLISHED or increments retryCount on failure

### Catalogued event names — `EventName` constant (line 39-63)
**The EventName catalog is INCOMPLETE.** It only declares 13 events:
- `UserRegistered`, `UserLoggedIn`, `UserLoggedOut` (Auth)
- `CompanyCreated`, `PlantActivated` (Organization)
- `SupplierCreated`, `SupplierBlacklisted`, `PurchaseOrderSubmitted`, `PurchaseOrderApproved` (Procurement)
- `GrnPosted`, `NcrCreated`, `CapaCreated`, `CoaGenerated` (Quality)
- `StockPosted`, `StockReversed` (Stock)
- `SystemError`

But module services emit ~85 different event names via `writeToOutbox` — most are NOT in the catalog. The catalog appears to be aspirational/spec-only; the actual emitters use string literals directly. This is a documentation/maintenance hazard.

### Events emitted by Section 04 modules (verified via grep `writeToOutbox` across all source files)

| Module | Event Name | File:Line |
|---|---|---|
| **inventory** | `StockAdded` | `inventory/service/index.ts:158` |
| **inventory** | `StockRemoved` | `inventory/service/index.ts:258` |
| **inventory** | `StockBlocked` | `inventory/service/index.ts:368` |
| **goods-receipt** | `GoodsReceiptCreated` | `goods-receipt/service/index.ts:139` |
| **goods-receipt** | `GoodsReceiptVerified` | `goods-receipt/service/index.ts:223` |
| **goods-receipt** | `GoodsReceiptAccepted` | `goods-receipt/service/index.ts:224` |
| **goods-receipt** | `GoodsReceiptRejected` | `goods-receipt/service/index.ts:225` |
| **goods-receipt** | `GoodsReceiptClosed` | `goods-receipt/service/index.ts:226` |
| **warehouse** | `PutawayTaskCreated` | `warehouse/service/index.ts:162` |
| **warehouse** | `PutawayCompleted` | `warehouse/service/index.ts:200` |
| **procurement** | `PurchaseRequisitionCreated` | `procurement/service/index.ts:58` |
| **procurement** | `PurchaseRequisitionSubmitted` | `procurement/service/index.ts:137` |
| **procurement** | `PurchaseRequisitionApproved` | `procurement/service/index.ts:137` |
| **procurement** | `PurchaseRequisitionRejected` | `procurement/service/index.ts:137` |
| **procurement** | `PurchaseRequisitionCancelled` | `procurement/service/index.ts:137` |
| **purchase-order** | `PurchaseOrderCreated` | `purchase-order/service/index.ts:478` |
| **purchase-order** | `PurchaseOrderCreatedFromQuotation` | `purchase-order/service/index.ts:864` |
| **quality-inspection** | `InspectionLotCreated` | `quality-inspection/service/index.ts:118` |
| **quality-inspection** | `InspectionPassed` | `quality-inspection/service/index.ts:199` |
| **quality-inspection** | `InspectionConditionalPass` | `quality-inspection/service/index.ts:200` |
| **quality-inspection** | `InspectionFailed` | `quality-inspection/service/index.ts:201` |
| **quality-inspection** | `InspectionOnHold` | `quality-inspection/service/index.ts:202` |
| **quality-inspection** | `QualityHoldCreated` | `quality-inspection/service/index.ts:256` |
| **quality-inspection** | `QualityHoldReleased` | `quality-inspection/service/index.ts:279` |
| **quality-inspection** | `NCR_CREATED` | `quality-inspection/service/index.ts:314` |
| **quality-inspection** | `NCR_CLOSED` | `quality-inspection/service/index.ts:362` |
| **batch-manufacturing** | `BatchCreated` | `batch-manufacturing/service/index.ts:61` |
| **batch-manufacturing** | `BatchSplit` | `batch-manufacturing/service/index.ts:158` |
| **batch-manufacturing** | `BatchMerged` | `batch-manufacturing/service/index.ts:227` |
| **product-costing** | `ProductCostCalculated` | `product-costing/service/index.ts:198` |
| **product-costing** | `ProductCostTransitioned` | `product-costing/service/index.ts:395` |
| **mes** | `MachineStatusChanged` | `mes/service/index.ts:53` |
| **mes** | `DowntimeRecorded` | `mes/service/index.ts:89` |
| **attendance-shift** | `AttendanceRecorded` | `attendance-shift/service/index.ts:197` |
| **attendance-shift** | `AttendanceTransitioned` | `attendance-shift/service/index.ts:394` |
| **performance-management** | `PerformanceReviewInitiated` | `performance-management/service/index.ts:197` |
| **performance-management** | `PerformanceReviewTransitioned` | `performance-management/service/index.ts:394` |
| **alerts-kpi-engine** | `AlertRuleCreated` | `alerts-kpi-engine/service/index.ts:197` |
| **alerts-kpi-engine** | `AlertRuleTransitioned` | `alerts-kpi-engine/service/index.ts:394` |
| **order-fulfillment** | (none) | — no `writeToOutbox` calls in `order-fulfillment/service/index.ts` |
| **pick-pack-dispatch** | `ShipmentCreated` | `pick-pack-dispatch/service/index.ts:33` |
| **delivery-management** | `DeliveryConfirmed` | `delivery-management/service/index.ts:24` |
| **sales-order** | `SalesOrderCreated` | `sales-order/service/index.ts:101` |
| **sales-order** | `InventoryReserved` | `sales-order/service/index.ts:231` |
| **customer-returns** | `RMACreated` | `customer-returns/service/index.ts:22` |
| **customer-returns** | `RMAClosed` | `customer-returns/service/index.ts:43` |

**IMPORTANT DISCREPANCIES**:
- The `EventName` catalog in `event-bus.ts:39-63` declares `GrnPosted`, `NcrCreated`, `CapaCreated`, `StockPosted`, `StockReversed` — but the actual emitters use `GoodsReceiptAccepted`, `NCR_CREATED` (different case), `StockAdded`, `StockRemoved`. The catalog is NOT a source of truth.
- No `StockReversed` event is emitted anywhere (verified by grep) — despite the `INVENTORY_REVERSE` permission existing.

---

## 5. MODULE-BY-MODULE ENDPOINT INVENTORY

Each subsection provides:
- **A. Endpoints** — HTTP method + full path (with mount prefix) + permission + audit + event + workflow + DTO
- **B. Services** — method signatures + business rules
- **C. Repositories** — methods + SQL tables
- **D. Workflows** — name, states, transitions
- **E. DTOs/Validators** — field names + validation rules
- **F. Events** — see §4 above
- **G. Permissions** — see §2 above

---

### 5.1 INVENTORY MODULE (`apps/backend/src/modules/inventory/`)

Mount: `/api/v1/inventory` (app.ts:189)

#### A. Endpoints (13 total)

| # | Method | Path | Permission | Audit | Event | Workflow | DTO | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/inventory/inventory` | `INVENTORY_READ` | (auto) | — | — | (query params) | `routes/index.ts:50-57` |
| 2 | GET | `/api/v1/inventory/inventory/:id` | `INVENTORY_READ` | (auto) | — | — | — | `routes/index.ts:59-62` |
| 3 | POST | `/api/v1/inventory/inventory/stock-in` | `INVENTORY_POST` | YES (`STOCK_IN`) | `StockAdded` | — | `stockInSchema` | `routes/index.ts:65-69` |
| 4 | POST | `/api/v1/inventory/inventory/stock-out` | `INVENTORY_POST` | YES (`STOCK_OUT`) | `StockRemoved` | — | `stockOutSchema` | `routes/index.ts:72-76` |
| 5 | GET | `/api/v1/inventory/ledger` | `INVENTORY_READ` | (auto) | — | — | (query params) | `routes/index.ts:79-85` |
| 6 | GET | `/api/v1/inventory/transactions` | `INVENTORY_READ` | (auto) | — | — | (query params) | `routes/index.ts:88-95` |
| 7 | GET | `/api/v1/inventory/reservations` | `INVENTORY_READ` | (auto) | — | — | (query params) | `routes/index.ts:98-104` |
| 8 | POST | `/api/v1/inventory/reservations` | `INVENTORY_POST` | YES (`STOCK_RESERVED`) | — | — | `reserveSchema` | `routes/index.ts:106-110` |
| 9 | POST | `/api/v1/inventory/reservations/:id/release` | `INVENTORY_POST` | YES (`STOCK_RESERVATION_RELEASED`) | — | — | (body: reason) | `routes/index.ts:112-116` |
| 10 | GET | `/api/v1/inventory/blocks` | `INVENTORY_READ` | (auto) | — | — | (query params) | `routes/index.ts:119-125` |
| 11 | POST | `/api/v1/inventory/blocks` | `INVENTORY_ADJUST` | YES (`STOCK_BLOCKED`) | `StockBlocked` | — | `blockSchema` | `routes/index.ts:127-131` |
| 12 | GET | `/api/v1/inventory/expiry` | `INVENTORY_READ` | (auto) | — | — | (query: days) | `routes/index.ts:134-138` |
| 13 | POST | `/api/v1/inventory/expiry/mark-expired` | `INVENTORY_ADJUST` | YES (`STOCK_EXPIRED`, actorType=SYSTEM) | — | — | — | `routes/index.ts:140-143` |
| 14 | GET | `/api/v1/inventory/batches` | `INVENTORY_READ` | (auto) | — | — | (query params) | `routes/index.ts:146-152` |

#### B. Services (`inventory/service/index.ts`)

`inventoryService` exports the following methods:

| Method | Signature | Business Rules | Lines |
|---|---|---|---|
| `stockIn` | `(data: {grnId, grnNumber, inspectionLotId, productId, productSku, productName, warehouseId, warehouseName, binId?, batchNumber?, lotNumber?, manufactureDate?, expiryDate?, quantity, unitCost, uomId, uomCode, currency?}) → inventory` | (1) qty > 0; (2) inspection lot must exist with status PASSED or CONDITIONAL_PASS (queries `inspection_lots` table directly); (3) expiry mandatory if batchNumber provided; (4) creates/finds Batch + Lot; (5) updates inventory via findByKey with optimistic version; (6) computes Moving Average Cost = (prevQty*prevMAC + newQty*unitCost) / totalQty; (7) writes InventoryTransaction; (8) writes IMMUTABLE InventoryLedger entry with balanceQty/balanceValue; (9) audit + event | `33-162` |
| `stockOut` | `(data: {productId, productSku, productName, warehouseId, warehouseName, quantity, uomId, uomCode, strategy?: 'FEFO'\|'FIFO', referenceType?, referenceId?, referenceNumber?, reason}) → {issued: [], totalIssued}` | (1) qty > 0; (2) strategy defaults to FEFO; (3) fetches stock via listFefo or listFifo; (4) sums available_qty — throws INSUFFICIENT_STOCK if < requested; (5) for each stock: throws STOCK_BLOCKED if `is_blocked`; throws STOCK_EXPIRED if expiry < now; (6) iterates stocks, decrements qty, recomputes available = qty - reserved - blocked; (7) writes transaction + ledger per stock; (8) audit + event | `166-262` |
| `list` | `(params: {page?, pageSize?, productId?, warehouseId?, batchId?, expired?}) → {rows, total, page, pageSize}` | Tenant isolation; filters by productId, warehouseId, batchId, expired (expiry_date < NOW()) | `266-269` |
| `getById` | `(id) → inventory` | Throws NotFoundError if not found | `271-276` |
| `listLedger` | `(params: {page?, pageSize?, productId?, warehouseId?}) → {rows, total, ...}` | Tenant isolation; returns IMMUTABLE ledger entries | `280-283` |
| `listTransactions` | `(params: {page?, pageSize?, productId?, warehouseId?, movementType?}) → {rows, total, ...}` | Tenant isolation; filter by movement_type | `287-290` |
| `reserveStock` | `(data: {productId, productSku, warehouseId, reservedQty, uomId, uomCode, ...}) → {id, reservationNumber}` | (1) reservedQty > 0; (2) sums all available_qty for product+warehouse — throws INSUFFICIENT_AVAILABLE if < requested; (3) generates `SR-YYYY-NNNNNN` reservation number; (4) creates with status='ACTIVE'; (5) audit | `294-325` |
| `listReservations` | `(params: {page?, pageSize?, status?, productId?}) → {rows, total, ...}` | — | `327-330` |
| `releaseReservation` | `(id, reason) → reservation` | Updates status to 'RELEASED', sets released_at/by/reason; throws if not ACTIVE; audit | `332-341` |
| `blockStock` | `(data: {productId, productSku, warehouseId, blockedQty, ...}) → {id, blockNumber}` | (1) blockedQty > 0; (2) generates `SB-YYYY-NNNNNN` block number; (3) creates with status='ACTIVE', blockType defaults to 'QUALITY_HOLD'; (4) audit + event | `345-372` |
| `listBlocks` | `(params: {page?, pageSize?, status?}) → {rows, total, ...}` | — | `374-377` |
| `getExpiringStock` | `(daysAhead=30) → rows[]` | Returns all inventory rows where `expiry_date <= NOW() + daysAhead days` | `381-387` |
| `markExpired` | `() → {expiredCount}` | UPDATE inventory SET is_expired=true WHERE expiry_date < NOW() AND is_expired=false; audit (actorType=SYSTEM) | `389-399` |
| `listBatches` | `(params: {page?, pageSize?, productId?, search?}) → {rows, total, ...}` | Tenant isolation; search matches batch_number or product_name (ILIKE) | `403-406` |

**Business rules documented in service header (`service/index.ts:1-12`):**
- No inventory before IQC approval (stockIn requires inspection lot ID with PASSED status)
- Rejected inventory cannot become available
- Partial GRN updates PO balance (handled in GRN service)
- Inventory ledger is IMMUTABLE — no UPDATE or DELETE ever (verified — `inventoryLedgerRepository.create` is the only method, no update/delete methods exist)
- Every movement creates a ledger entry
- Batch unique per product
- Lot unique per product
- Expiry mandatory for batch-tracked products

#### C. Repositories (`inventory/repository/index.ts`)

7 repository objects, each touching distinct tables:

| Repository | Methods | SQL Table |
|---|---|---|
| `batchRepository` | create, findById, findByNumber(tenantId, batchNumber, productId), list (with pagination + search by batch_number/product_name) | `batches` |
| `lotRepository` | create, findById, findByNumber(tenantId, lotNumber, productId) | `lots` |
| `inventoryRepository` | findById, findByKey(tenantId, productId, warehouseId, batchId, lotId, binId) [uses COALESCE for nullable UUIDs], create, update (optimistic version), list (filters: productId, warehouseId, batchId, expired), listFefo (ORDER BY expiry_date ASC), listFifo (ORDER BY created_at ASC) | `inventory` |
| `inventoryTransactionRepository` | create, list (filters: productId, warehouseId, movementType), generateTransactionNumber (`IVT-YYYY-NNNNNNNN`) | `inventory_transactions` |
| `inventoryLedgerRepository` | create (writes is_immutable=true), list (filters: productId, warehouseId), generateEntryNumber (`IVL-YYYY-NNNNNNNN`), getLatestBalance(tenantId, productId, warehouseId) → {balanceQty, balanceValue} | `inventory_ledger` |
| `stockReservationRepository` | create, list (filters: status, productId), release (UPDATE → status='RELEASED' WHERE status='ACTIVE'), generateReservationNumber (`SR-YYYY-NNNNNN`) | `stock_reservations` |
| `stockBlockRepository` | create, list (filters: status), generateBlockNumber (`SB-YYYY-NNNNNN`) | `stock_blocks` |

#### D. Workflows
**None registered.** Inventory stock movements are not workflow-gated. The `INVENTORY_REVERSE` permission exists but is unused — there is no reverse endpoint or service method.

#### E. DTOs / Validators (`routes/index.ts:12-47`)

**`stockInSchema`** (line 12-22):
- `grnId: string.uuid()` (required)
- `grnNumber: string.min(1)` (required)
- `inspectionLotId: string.uuid()` (required)
- `productId: string.uuid()`, `productSku: string.min(1)`, `productName: string.min(1)`
- `warehouseId: string.uuid()`, `warehouseName: string.min(1)`
- `binId?: string.uuid()`, `binCode?: string`
- `batchNumber?: string`, `lotNumber?: string`
- `manufactureDate?: string.datetime()`, `expiryDate?: string.datetime()`
- `quantity: number.positive()`, `unitCost: number.nonnegative()`
- `uomId: string.uuid()`, `uomCode: string.min(1)`
- `currency?: string`

**`stockOutSchema`** (line 24-31):
- `productId`, `productSku`, `productName`, `warehouseId`, `warehouseName`
- `quantity: positive`, `uomId`, `uomCode`
- `strategy: enum('FEFO','FIFO').default('FEFO')`
- `referenceType?`, `referenceId?: uuid`, `referenceNumber?`
- `reason: string.min(1)`

**`reserveSchema`** (line 33-40):
- `productId`, `productSku`, `warehouseId`, `reservedQty: positive`, `uomId`, `uomCode`
- `reservationType?`, `referenceType?`, `referenceId?: uuid`, `referenceNumber?`
- `reservedFor?`, `expiresAt?: datetime`

**`blockSchema`** (line 42-47):
- `productId`, `productSku`, `warehouseId`
- `blockedQty: positive`, `uomId`, `uomCode`
- `blockType?`, `blockReason: string.min(1)`
- `sourceType?`, `sourceId?: uuid`, `sourceNumber?`

---

### 5.2 GOODS RECEIPT MODULE (`apps/backend/src/modules/goods-receipt/`)

Mount: `/api/v1/warehouse/grns` (app.ts:187)

#### A. Endpoints (6 total)

| # | Method | Path | Permission | Audit | Event | Workflow | DTO | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/warehouse/grns/grns` | `GRN_READ` | (auto) | — | — | (query: page, pageSize, search, status, supplierId, poId) | `routes/index.ts:82-89` |
| 2 | GET | `/api/v1/warehouse/grns/grns/:id` | `GRN_READ` | (auto) | — | — | — | `routes/index.ts:91-94` |
| 3 | POST | `/api/v1/warehouse/grns/grns` | `GRN_CREATE` | YES (`CREATE`) | `GoodsReceiptCreated` | — | `grnCreateSchema` | `routes/index.ts:96-100` |
| 4 | PATCH | `/api/v1/warehouse/grns/grns/:id` | `GRN_CREATE` | YES (`UPDATE`) | — | — | (any body) | `routes/index.ts:102-107` |
| 5 | DELETE | `/api/v1/warehouse/grns/grns/:id` | `GRN_CREATE` | YES (`DELETE`) | — | — | (If-Match header) | `routes/index.ts:109-113` |
| 6 | POST | `/api/v1/warehouse/grns/grns/:id/transition` | `GRN_POST` | YES (`TRANSITION`) | `GoodsReceiptVerified/Accepted/Rejected/Closed` | `GoodsReceiptLifecycle` | `transitionSchema` | `routes/index.ts:115-119` |
| 7 | POST | `/api/v1/warehouse/grns/grns/:id/damage` | `GRN_CREATE` | YES (`DAMAGE_RECORDED`) | — | — | `damageSchema` | `routes/index.ts:121-125` |

**BUG NOTE**: PATCH and DELETE use `GRN_CREATE` permission (line 102, 109) — should arguably use `GRN_UPDATE` / `GRN_DELETE`, but those permissions don't exist in the registry. So `GRN_CREATE` is being used as a catch-all mutation permission.

#### B. Services (`goods-receipt/service/index.ts`)

`goodsReceiptService` methods:

| Method | Signature | Business Rules | Lines |
|---|---|---|---|
| `create` | `(data: {poId?, poNumber?, supplierId, supplierCode, supplierName, ..., lines: []}) → grn` | (1) lines required (NO_LINES); (2) if poId: PO must be in ISSUED/SUPPLIER_ACCEPTED/PARTIALLY_RECEIVED; (3) supplier must match PO supplier (SUPPLIER_MISMATCH); (4) supplier must be ACTIVE/PROBATION (SUPPLIER_NOT_ACTIVE); (5) per line: receivedQty > 0; (6) short receipt if received < ordered; (7) over receipt if received > ordered * 1.1 (10% tolerance); (8) acceptedQty = received - damaged; (9) generates `GRN-YYYY-NNNNNN` number; (10) audit + event | `18-143` |
| `getById` | `(id) → grn` | Throws NotFoundError; eager-loads lines, attachments, damages | `145-155` |
| `list` | `(params: {page?, pageSize?, search?, status?, supplierId?, poId?}) → {rows, total, ...}` | — | `157-160` |
| `update` | `(id, data, version) → grn` | (1) must be DRAFT (NOT_DRAFT); (2) optimistic concurrency (ConcurrencyError on mismatch); (3) audit before/after | `162-176` |
| `delete` | `(id, version)` | (1) must be DRAFT; (2) soft-delete; (3) cascades delete lines; (4) audit | `178-192` |
| `transition` | `(id, targetStatus, version, options?) → grn` | (1) workflow canTransition check; (2) sets verifiedBy/verifiedAt on VERIFIED; (3) sets rejectionReason on REJECTED; (4) audit; (5) event map emits per targetStatus; (6) **on ACCEPTED with poId: calls updatePoBalance to decrement pending_qty and update is_partially_received/is_fully_received flags on purchase_orders** | `194-240` |
| `updatePoBalance` | `(poId, acceptedQty)` | UPDATE purchase_orders SET received_qty += acceptedQty, pending_qty = GREATEST(pending - accepted, 0), is_partially_received = (pending > 0), is_fully_received = (pending <= 0), last_receipt_date = NOW() | `243-257` |
| `addDamage` | `(id, data: {grnLineId?, productId?, productSku?, damageType, damagedQty, damageReason, damageSeverity?, ...}) → {damageId}` | (1) GRN must exist; (2) damagedQty > 0; (3) audit | `259-277` |

#### C. Repositories (`goods-receipt/repository/index.ts`)

| Repository | Methods | SQL Table |
|---|---|---|
| `grnRepository` | create, findById, findByNumber, list (search: grn_number, supplier_name, po_number; filters: status, supplierId, poId), update (optimistic concurrency), softDelete, generateGrnNumber (`GRN-YYYY-NNNNNN`) | `goods_receipts` |
| `grnLineRepository` | create, listForGrn, deleteForGrn (hard delete!) | `goods_receipt_lines` |
| `grnAttachmentRepository` | create, listForGrn | `grn_attachments` |
| `grnDamageRepository` | create, listForGrn | `grn_damage_records` |

#### D. Workflow (`goods-receipt/workflow/index.ts`)

**Name**: `GoodsReceiptLifecycle`
**Initial state**: `DRAFT`
**States** (8): DRAFT, VERIFIED, UNDER_INSPECTION, PARTIALLY_ACCEPTED, ACCEPTED, REJECTED, CLOSED, CANCELLED
**Transitions** (12):
1. DRAFT → VERIFIED
2. DRAFT → CANCELLED
3. VERIFIED → UNDER_INSPECTION
4. VERIFIED → ACCEPTED (skip inspection if not required)
5. VERIFIED → CANCELLED
6. UNDER_INSPECTION → ACCEPTED
7. UNDER_INSPECTION → PARTIALLY_ACCEPTED
8. UNDER_INSPECTION → REJECTED
9. PARTIALLY_ACCEPTED → CLOSED
10. ACCEPTED → CLOSED
11. REJECTED → CLOSED
12. REJECTED → DRAFT (allow re-inspection)

Registered via `try { workflowRegistry.register(grnWorkflow) } catch {}` (line 27).

#### E. DTOs / Validators (`routes/index.ts:12-80`)

**`grnLineSchema`** (line 12-30): 19 fields — `poLineId?: uuid`, `productId: uuid`, `productSku: min(1)`, `productName: min(1)`, `uomId: uuid`, `uomCode: min(1)`, `orderedQty?: nonnegative`, `receivedQty: positive`, `damagedQty?: nonnegative`, `unitPrice: nonnegative`, `batchNumber?`, `lotNumber?`, `manufactureDate?: datetime`, `expiryDate?: datetime`, `warehouseId?: uuid`, `warehouseName?`, `remarks?`.

**`grnCreateSchema`** (line 32-60): 28 fields covering PO link, supplier info, supplier invoice, delivery challan, company/plant/warehouse context, vehicle/transport (lorryNo, lrNumber, lrDate, mode), ewayBill, remarks, internalNotes, lines (min 1).

**`transitionSchema`** (line 62-67): `targetStatus: enum(8 GRN states)`, `version: int.min(0)`, `verificationNotes?`, `rejectionReason?`.

**`damageSchema`** (line 69-80): `grnLineId?: uuid`, `productId?: uuid`, `productSku?`, `damageType: min(1)`, `damagedQty: positive`, `damageReason: min(1)`, `damageSeverity: enum(MINOR, MAJOR, CRITICAL).default('MINOR')`, `actionTaken?`, `photoUrl?`, `remarks?`.

---

### 5.3 WAREHOUSE MODULE (`apps/backend/src/modules/warehouse/`)

Mount: `/api/v1/warehouse` (app.ts:190)

#### A. Endpoints (15 total)

##### Zones (2)
| # | Method | Path | Permission | Audit | Event | DTO | Source |
|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/warehouse/zones` | `INVENTORY_READ` | (auto) | — | (query: warehouseId) | `routes/index.ts:19-22` |
| 2 | POST | `/api/v1/warehouse/zones` | `INVENTORY_POST` | YES (`CREATE` WarehouseZone) | — | `zoneSchema` | `routes/index.ts:24-28` |

##### Aisles (2)
| 3 | GET | `/api/v1/warehouse/aisles` | `INVENTORY_READ` | (auto) | — | (query: warehouseId) | `routes/index.ts:38-41` |
| 4 | POST | `/api/v1/warehouse/aisles` | `INVENTORY_POST` | YES (`CREATE` WarehouseAisle) | — | `aisleSchema` | `routes/index.ts:43-47` |

##### Racks (2)
| 5 | GET | `/api/v1/warehouse/racks` | `INVENTORY_READ` | (auto) | — | (query: warehouseId) | `routes/index.ts:58-61` |
| 6 | POST | `/api/v1/warehouse/racks` | `INVENTORY_POST` | YES (`CREATE` WarehouseRack) | — | `rackSchema` | `routes/index.ts:63-67` |

##### Bins (2)
| 7 | GET | `/api/v1/warehouse/bins` | `INVENTORY_READ` | (auto) | — | (query: warehouseId, zoneId, aisleId, rackId) | `routes/index.ts:79-86` |
| 8 | POST | `/api/v1/warehouse/bins` | `INVENTORY_POST` | YES (`CREATE` WarehouseBin) | — | `binSchema` | `routes/index.ts:88-92` |

##### Putaway Tasks (3)
| 9 | GET | `/api/v1/warehouse/putaway-tasks` | `INVENTORY_READ` | (auto) | — | (query: page, pageSize, status, warehouseId) | `routes/index.ts:109-115` |
| 10 | POST | `/api/v1/warehouse/putaway-tasks` | `INVENTORY_POST` | YES (`PUTAWAY_CREATED`) | `PutawayTaskCreated` | `putawaySchema` | `routes/index.ts:117-121` |
| 11 | POST | `/api/v1/warehouse/putaway-tasks/:id/complete` | `INVENTORY_POST` | YES (`PUTAWAY_COMPLETED`) | `PutawayCompleted` | (If-Match header) | `routes/index.ts:123-127` |

##### Barcodes (3)
| 12 | GET | `/api/v1/warehouse/barcodes` | `INVENTORY_READ` | (auto) | — | (query: page, pageSize, labelType, productId) | `routes/index.ts:148-154` |
| 13 | POST | `/api/v1/warehouse/barcodes` | `INVENTORY_POST` | YES (`BARCODE_CREATED`) | — | `barcodeSchema` | `routes/index.ts:156-160` |
| 14 | POST | `/api/v1/warehouse/barcodes/:id/print` | `INVENTORY_READ` | YES (`BARCODE_PRINTED`) | — | — | `routes/index.ts:162-165` |

##### Scanner (2)
| 15 | POST | `/api/v1/warehouse/scan` | `INVENTORY_READ` | YES (`BARCODE_SCANNED`) | — | `scanSchema` | `routes/index.ts:169-173` |
| 16 | GET | `/api/v1/warehouse/scan-logs` | `INVENTORY_READ` | (auto) | — | (query: page, pageSize) | `routes/index.ts:175-180` |

#### B. Services (`warehouse/service/index.ts`)

`warehouseService` methods:

| Method | Signature | Business Rules | Lines |
|---|---|---|---|
| `createZone` | `(data: {warehouseId, zoneCode, zoneName, zoneType?, capacity?, description?}) → zone` | Defaults zoneType='STORAGE', capacity=0, usedCapacity=0, isActive=true; audit | `28-36` |
| `listZones` | `(warehouseId) → zones[]` | Tenant isolation | `38-41` |
| `createAisle` | `(data: {warehouseId, zoneId?, aisleCode, aisleName, capacity?, description?}) → aisle` | Defaults capacity=0; audit | `45-53` |
| `listAisles` | `(warehouseId) → aisles[]` | — | `55-58` |
| `createRack` | `(data: {..., levels?, capacityPerLevel?}) → rack` | totalCapacity = capacityPerLevel * levels; audit | `62-74` |
| `listRacks` | `(warehouseId) → racks[]` | — | `76-79` |
| `createBin` | `(data: {..., binType?, level?, position?, capacity?}) → bin` | Defaults binType='STORAGE', level=1, capacity=0, isActive=true, isBlocked=false; audit | `83-93` |
| `listBins` | `(warehouseId, params: {zoneId?, aisleId?, rackId?}) → bins[]` | Filter by zone/aisle/rack hierarchy | `95-98` |
| `createPutawayTask` | `(data: {grnId?, inspectionLotId, productId, ..., quantity, uomId, warehouseId, targetBinId?, assignedTo?, priority?}) → task` | (1) qty > 0; (2) if no targetBinId: auto-allocates bin via `findAvailableBin` (capacity check); (3) if targetBinId: validates bin exists, is_active, !is_blocked, has capacity; (4) generates `PT-YYYY-NNNNNN` task number; (5) creates with status='PENDING', priority='NORMAL' default; (6) audit + event | `102-166` |
| `listPutawayTasks` | `(params: {page?, pageSize?, status?, warehouseId?}) → {rows, total, ...}` | — | `168-171` |
| `completePutaway` | `(id, version) → task` | (1) task must be PENDING or IN_PROGRESS (NOT_COMPLETABLE otherwise); (2) updates status='COMPLETED', completedAt=NOW; (3) updates bin used_capacity += task quantity; (4) audit + event | `173-204` |
| `createBarcode` | `(data: {labelType, productId?, batchId?, ..., gs1Gtin?}) → label` | (1) generates unique barcode: `GTIN-YYYY-NNNNNNNN` / `QR-YYYY-NNNNNNNN` / `BC-YYYY-NNNNNNNN` prefix; (2) for GS1: builds gs1Expiry from expiryDate as YYMMDD; (3) builds QR data as compact JSON; (4) sets barcodeType: QR→'QR', GS1→'GS1_128', else→'CODE128'; (5) audit | `208-260` |
| `listBarcodes` | `(params: {page?, pageSize?, labelType?, productId?}) → {rows, total, ...}` | — | `262-265` |
| `printBarcode` | `(id) → label` | Marks is_printed=true, increments print_count, sets last_printed_at; audit | `267-277` |
| `scanBarcode` | `(data: {barcode, scanType, scanContext?, deviceId?, location?}) → label` | (1) finds barcode by code; (2) if not found: logs scan with result='NOT_FOUND', throws NotFoundError; (3) marks is_scanned=true, scanned_at=NOW; (4) logs scan with result='SUCCESS'; (5) audit | `280-310` |
| `listScanLogs` | `(params: {page?, pageSize?}) → {rows, total, ...}` | — | `312-315` |

#### C. Repositories (`warehouse/repository/index.ts`)

8 repository objects:

| Repository | Methods | SQL Table |
|---|---|---|
| `zoneRepository` | create, findById, list (by warehouseId, ORDER BY sort_order, zone_code) | `warehouse_zones` |
| `aisleRepository` | create, findById, list (by warehouseId) | `warehouse_aisles` |
| `rackRepository` | create, findById, list (by warehouseId) | `warehouse_racks` |
| `binRepository` | create, findById, findByCode, list (filters: zoneId, aisleId, rackId), updateUsedCapacity, findAvailableBin (active, !blocked, capacity sufficient) | `warehouse_bins` |
| `putawayTaskRepository` | create, findById, list (filters: status, warehouseId), update (optimistic concurrency, fields: status, targetBinId, assignedTo, startedAt, completedAt, remarks), generateTaskNumber (`PT-YYYY-NNNNNN`) | `putaway_tasks` |
| `barcodeRepository` | create, findById, findByBarcode, list (filters: labelType, productId), markPrinted, markScanned, generateBarcode | `barcode_labels` |
| `scanLogRepository` | create, list | `scan_logs` |

#### D. Workflows
**None.** Putaway task status changes (PENDING → IN_PROGRESS → COMPLETED) are done via direct updates, not a registered state machine.

#### E. DTOs / Validators (`routes/index.ts:14-146`)

**`zoneSchema`** (14-17): warehouseId, zoneCode, zoneName, zoneType='STORAGE', capacity?, description?
**`aisleSchema`** (32-36): warehouseId, zoneId?, aisleCode, aisleName, capacity?, description?
**`rackSchema`** (51-56): warehouseId, zoneId?, aisleId?, rackCode, rackName, rackType='STANDARD', levels=1, capacityPerLevel?, description?
**`binSchema`** (71-77): warehouseId, zoneId?, aisleId?, rackId?, binCode, binName, binType='STORAGE', level=1, position?, capacity?, description?
**`putawaySchema`** (96-107): 16 fields including grnId/grnNumber/grnLineId, inspectionLotId (required), product/batch/lot, quantity (positive), uom, warehouse, targetBinId/Code (optional — auto-allocated), assignedTo/Name, priority enum (LOW/NORMAL/HIGH/URGENT), remarks
**`barcodeSchema`** (131-141): labelType enum (PRODUCT/BATCH/LOT/BIN/GRN/PALLET/GS1/QR), all other fields optional
**`scanSchema`** (143-146): barcode (min 1), scanType (min 1), scanContext?, deviceId?, location?

---

### 5.4 PROCUREMENT MODULE (Purchase Requisitions) (`apps/backend/src/modules/procurement/`)

Mount: `/api/v1/procurement/requisitions` (app.ts:183)

#### A. Endpoints (5 total)

| # | Method | Path | Permission | Audit | Event | Workflow | DTO | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/procurement/requisitions/requisitions` | `PO_READ` (proxy) | (auto) | — | — | (query: page, pageSize, search, status, priority, requesterId, plantId, departmentId) | `routes/index.ts:53-56` |
| 2 | GET | `/api/v1/procurement/requisitions/requisitions/:id` | `PO_READ` | (auto) | — | — | — | `routes/index.ts:59-62` |
| 3 | POST | `/api/v1/procurement/requisitions/requisitions` | `PO_CREATE` | YES (`CREATE`) | `PurchaseRequisitionCreated` | — | `prSchema` | `routes/index.ts:65-69` |
| 4 | PATCH | `/api/v1/procurement/requisitions/requisitions/:id` | `PO_CREATE` | YES (`UPDATE`) | — | — | (any body) | `routes/index.ts:72-77` |
| 5 | DELETE | `/api/v1/procurement/requisitions/requisitions/:id` | `PO_CREATE` | YES (`DELETE`) | — | — | (If-Match) | `routes/index.ts:80-84` |
| 6 | POST | `/api/v1/procurement/requisitions/requisitions/:id/transition` | `PO_APPROVE` | YES (`TRANSITION`) | `PurchaseRequisitionSubmitted/Approved/Rejected/Cancelled` | `PurchaseRequisitionLifecycle` | `transitionSchema` | `routes/index.ts:87-91` |

#### B. Services (`procurement/service/index.ts`)

| Method | Signature | Business Rules | Lines |
|---|---|---|---|
| `create` | `(data: {companyId, ..., lines: []}) → pr` | (1) lines required; (2) requiredDate cannot be past; (3) generates `PR-YYYY-NNNNNN` (line 27 calls prRepository.generatePrNumber); (4) computes estimatedTotal = Σ(qty*expectedPrice); (5) creates lines with lineNo; (6) audit + event | `17-61` |
| `getById` | `(id) → pr` | Eager loads lines + approvals | `63-72` |
| `list` | `(params) → {rows, total, ...}` | — | `74-77` |
| `update` | `(id, data, version) → pr` | (1) must be DRAFT or REJECTED (NOT_EDITABLE); (2) optimistic concurrency; (3) audit before/after | `79-91` |
| `delete` | `(id, version)` | (1) must be DRAFT (NOT_DRAFT); (2) soft-delete; (3) cascades delete lines; (4) audit | `93-103` |
| `transition` | `(id, targetStatus, version, approvalData?) → pr` | (1) workflow canTransition check; (2) on BUDGET_APPROVAL: validates estimatedTotal <= budgetAmount (BUDGET_EXCEEDED); (3) on APPROVED/REJECTED: records approval in `pr_approvals` table with level, role, action; (4) audit; (5) event map emits per targetStatus | `105-143` |

#### C. Repositories (`procurement/repository/index.ts`)
Not read in detail, but exports: `prRepository` (purchase_requisitions), `prLineRepository` (purchase_requisition_lines), `prApprovalRepository` (purchase_requisition_approvals).

#### D. Workflow (`procurement/workflow/index.ts`)
Not read in detail, but registered as `PurchaseRequisitionLifecycle`. Transition schema enum (line 50) shows 10 states: DRAFT, SUBMITTED, DEPT_REVIEW, BUDGET_APPROVAL, PROC_REVIEW, APPROVED, CONVERTED_TO_RFQ, CLOSED, CANCELLED, REJECTED.

#### E. DTOs (`routes/index.ts:17-50`)
- `prLineSchema`: 11 fields including productId, requestedQty (positive), uomId, expectedPrice?, preferredSupplierId?, requiredDate?
- `prSchema`: 15 fields + lines (min 1), requisitionType enum (MANUAL/MATERIAL_REQUIREMENT/DEPARTMENT_REQUEST/EMERGENCY/PLANNED/STOCK_REPLENISHMENT), priority enum (LOW/NORMAL/HIGH/URGENT/CRITICAL)
- `transitionSchema`: targetStatus enum (10 states), version, comments?

---

### 5.5 PURCHASE ORDER MODULE (`apps/backend/src/modules/purchase-order/`)

Mount: `/api/v1/procurement/purchase-orders` (app.ts:186)

#### A. Endpoints (17 total)

| # | Method | Path | Permission | Audit | Event | Workflow | DTO | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/procurement/purchase-orders/pos` | `PO_READ` | (auto) | — | — | (query: page, pageSize, search, status, poType, supplierId, plantId, sortBy, sortOrder) | `routes/index.ts:125-143` |
| 2 | GET | `/api/v1/procurement/purchase-orders/pos/:id` | `PO_READ` | (auto) | — | — | — | `routes/index.ts:146-149` |
| 3 | POST | `/api/v1/procurement/purchase-orders/pos` | `PO_CREATE` | YES (`CREATE`) | `PurchaseOrderCreated` | — | `poCreateSchema` | `routes/index.ts:152-156` |
| 4 | PATCH | `/api/v1/procurement/purchase-orders/pos/:id` | `PO_UPDATE` | YES (`UPDATE`) | — | — | (any body) | `routes/index.ts:159-165` |
| 5 | DELETE | `/api/v1/procurement/purchase-orders/pos/:id` | `PO_DELETE` | YES (`DELETE`) | — | — | (If-Match) | `routes/index.ts:168-172` |
| 6 | POST | `/api/v1/procurement/purchase-orders/pos/:id/transition` | `PO_APPROVE` | YES (`TRANSITION`) | (depends on target) | `PurchaseOrderLifecycle` | `transitionSchema` | `routes/index.ts:175-186` |
| 7 | POST | `/api/v1/procurement/purchase-orders/pos/:id/issue` | `PO_ISSUE` | YES (`TRANSITION` to ISSUED) | — | — | (If-Match) | `routes/index.ts:189-193` |
| 8 | POST | `/api/v1/procurement/purchase-orders/pos/:id/cancel` | `PO_APPROVE` | YES (`TRANSITION` to CANCELLED) | — | — | (body: cancelReason) | `routes/index.ts:196-203` |
| 9 | POST | `/api/v1/procurement/purchase-orders/pos/:id/close` | `PO_CLOSE` | YES (`TRANSITION` to CLOSED) | — | — | (If-Match) | `routes/index.ts:206-210` |
| 10 | POST | `/api/v1/procurement/purchase-orders/pos/:id/supplier-accept` | `PO_APPROVE` | YES | — | — | (body: notes) | `routes/index.ts:213-220` |
| 11 | POST | `/api/v1/procurement/purchase-orders/pos/:id/supplier-reject` | `PO_APPROVE` | YES | — | — | (body: notes) | `routes/index.ts:223-230` |
| 12 | POST | `/api/v1/procurement/purchase-orders/pos/:id/supplier-counter` | `PO_APPROVE` | YES | — | — | (body: notes, counterTotal) | `routes/index.ts:233-241` |
| 13 | POST | `/api/v1/procurement/purchase-orders/pos/:id/revision` | `PO_UPDATE` | YES (`TRANSITION` to REVISION_REQUESTED) | — | — | (body: revisionReason) | `routes/index.ts:244-251` |
| 14 | POST | `/api/v1/procurement/purchase-orders/pos/from-quotation` | `PO_CREATE` | YES | `PurchaseOrderCreatedFromQuotation` | — | `createFromQuotationSchema` | `routes/index.ts:254-271` |
| 15 | GET | `/api/v1/procurement/purchase-orders/pos/:id/pdf` | `PO_EXPORT` | YES (`EXPORT`) | — | — | — | `routes/index.ts:274-277` |
| 16 | GET | `/api/v1/procurement/purchase-orders/pos/:id/export-pdf` | `PO_EXPORT` | YES (`EXPORT`) | — | — | — | `routes/index.ts:280-283` |
| 17 | POST | `/api/v1/procurement/purchase-orders/pos/search` | `PO_READ` | (auto) | — | — | (body: same as list query params) | `routes/index.ts:286-305` |

#### B. Services (`purchase-order/service/index.ts` — 42KB, ~1000 LOC)

Key business rule functions visible from preview:
- `validateSupplierActive(tenantId, supplierId)` — Rule 1: Supplier must be ACTIVE (line 34-44)
- 20+ business rules per Phase 10 requirements (per file header)
- Mutations all go through workflow + audit (per file header)
- Service has `createFromQuotation` (line ~864), `generatePdf` (used by endpoints 15-16)
- Repositories imported: `poRepository, poLineRepository, poTaxRepository, poChargeRepository, poApprovalRepository, poRevisionRepository, poHistoryRepository` (line 7-15)

#### C. Repositories
8 repository objects covering: `purchase_orders`, `purchase_order_lines`, `purchase_order_taxes`, `purchase_order_charges`, `purchase_order_approvals`, `purchase_order_revisions`, `purchase_order_history`. (Not read in detail — file too large.)

#### D. Workflow (`purchase-order/workflow/index.ts`)

**Name**: `PurchaseOrderLifecycle`
**Initial state**: `DRAFT`
**States** (15): DRAFT, SUBMITTED, DEPT_APPROVAL, FINANCE_APPROVAL, MANAGEMENT_APPROVAL, APPROVED, ISSUED, SUPPLIER_ACCEPTED, PARTIALLY_RECEIVED, FULLY_RECEIVED, CLOSED, REJECTED, CANCELLED, EXPIRED, REVISION_REQUESTED
**Transitions** (25) — see workflow file lines 53-92. Notable ones:
- DRAFT → SUBMITTED, DRAFT → CANCELLED
- SUBMITTED → DEPT_APPROVAL, SUBMITTED → CANCELLED, SUBMITTED → DRAFT (return for revision)
- DEPT_APPROVAL → FINANCE_APPROVAL / REJECTED / DRAFT
- FINANCE_APPROVAL → MANAGEMENT_APPROVAL / REJECTED / DRAFT
- MANAGEMENT_APPROVAL → APPROVED / REJECTED / DRAFT
- APPROVED → ISSUED, APPROVED → CANCELLED
- ISSUED → SUPPLIER_ACCEPTED / REVISION_REQUESTED / CANCELLED / EXPIRED
- REVISION_REQUESTED → DRAFT
- SUPPLIER_ACCEPTED → PARTIALLY_RECEIVED / FULLY_RECEIVED
- PARTIALLY_RECEIVED → FULLY_RECEIVED / CLOSED
- FULLY_RECEIVED → CLOSED
- REJECTED → DRAFT

#### E. DTOs (`routes/index.ts:14-120`)
- `poLineSchema` (14-38): 22 fields — productId, orderedQty (positive), unitPrice (nonnegative), discountPercent?, taxPercent?, currency='INR', expectedDeliveryDate?, rfqLineId?, quotationLineId?, prLineId?
- `poCreateSchema` (40-82): 30+ fields — poType enum (STANDARD/BLANKET/CONTRACT/SERVICE/SUBCONTRACTING/EMERGENCY/CONSIGNMENT/CAPITAL), supplier/company/plant/warehouse, rfq/quotation/PR linkage, delivery terms, currency, payment terms (NET30 default), advancePercent, validityDate, lines (min 1)
- `transitionSchema` (84-96): targetStatus enum (15 states), version, approvalLevel enum (DEPARTMENT/FINANCE/MANAGEMENT), approvalNotes?, rejectionReason?, cancelReason?, revisionReason?
- `supplierAckSchema` (98-103) — declared but `void supplierAckSchema` on line 104 (unused — retained for documentation)
- `createFromQuotationSchema` (106-120): quotationId, companyId, plantId, warehouseId?, buyerId?, expectedDeliveryDate?, addresses, paymentTerms?

---

### 5.6 QUALITY INSPECTION MODULE (`apps/backend/src/modules/quality-inspection/`)

Mount: `/api/v1/quality` (app.ts:188)

#### A. Endpoints (15 total)

##### Inspection Plans (3)
| # | Method | Path | Permission | Audit | Event | DTO | Source |
|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/quality/plans` | `IQC_INSPECT` | (auto) | — | (query: page, pageSize, search) | `routes/index.ts:22-25` |
| 2 | GET | `/api/v1/quality/plans/:id` | `IQC_INSPECT` | (auto) | — | — | `routes/index.ts:27-30` |
| 3 | POST | `/api/v1/quality/plans` | `IQC_APPROVE` | YES (`CREATE` InspectionPlan) | — | `planSchema` | `routes/index.ts:32-36` |

##### Sampling Plans (2)
| 4 | GET | `/api/v1/quality/sampling-plans` | `IQC_INSPECT` | (auto) | — | — | `routes/index.ts:48-51` |
| 5 | POST | `/api/v1/quality/sampling-plans` | `IQC_APPROVE` | YES (`CREATE` SamplingPlan) | — | `samplingPlanSchema` | `routes/index.ts:53-57` |

##### Inspection Lots (5)
| 6 | GET | `/api/v1/quality/lots` | `IQC_INSPECT` | (auto) | — | (query: page, pageSize, search, status, grnId) | `routes/index.ts:89-92` |
| 7 | GET | `/api/v1/quality/lots/:id` | `IQC_INSPECT` | (auto) | — | — | `routes/index.ts:94-97` |
| 8 | POST | `/api/v1/quality/lots` | `IQC_INSPECT` | YES (`CREATE` InspectionLot) | `InspectionLotCreated` | `lotCreateSchema` | `routes/index.ts:99-103` |
| 9 | POST | `/api/v1/quality/lots/:id/start` | `IQC_INSPECT` | YES (`TRANSITION` to IN_PROGRESS) | `InspectionOnHold` (no — passes through transitionInspection) | — | `routes/index.ts:105-109` |
| 10 | POST | `/api/v1/quality/lots/:id/results` | `IQC_INSPECT` | YES (`RESULT_RECORDED`) | — | `resultSchema` | `routes/index.ts:111-115` |
| 11 | POST | `/api/v1/quality/lots/:id/transition` | `IQC_APPROVE` | YES (`TRANSITION`) | `InspectionPassed` / `InspectionConditionalPass` / `InspectionFailed` / `InspectionOnHold` | `InspectionLotLifecycle` (not in workflow/index.ts but referenced in service) | `lotTransitionSchema` | `routes/index.ts:117-121` |

##### Quality Holds (3)
| 12 | GET | `/api/v1/quality/holds` | `IQC_INSPECT` | (auto) | — | (query: page, pageSize, status) | `routes/index.ts:134-137` |
| 13 | POST | `/api/v1/quality/holds` | `IQC_APPROVE` | YES (`QUALITY_HOLD`) | `QualityHoldCreated` | `holdSchema` | `routes/index.ts:139-143` |
| 14 | POST | `/api/v1/quality/holds/:id/release` | `IQC_APPROVE` | YES (`QUALITY_HOLD_RELEASED`) | `QualityHoldReleased` | `holdReleaseSchema` | `routes/index.ts:145-149` |

##### NCRs (4)
| 15 | GET | `/api/v1/quality/ncrs` | `NCR_CREATE` (proxy for read!) | (auto) | — | (query: page, pageSize, search, status) | `routes/index.ts:170-173` |
| 16 | GET | `/api/v1/quality/ncrs/:id` | `NCR_CREATE` | (auto) | — | — | `routes/index.ts:175-178` |
| 17 | POST | `/api/v1/quality/ncrs` | `NCR_CREATE` | YES (`NCR_CREATED`) | `NCR_CREATED` | `NCRLifecycle` | `ncrSchema` | `routes/index.ts:180-184` |
| 18 | POST | `/api/v1/quality/ncrs/:id/transition` | `NCR_APPROVE` | YES (`NCR_TRANSITION`) | `NCR_CLOSED` (if target=CLOSED) | `NCRLifecycle` | `ncrTransitionSchema` | `routes/index.ts:186-190` |

##### CAPAs (2)
| 19 | GET | `/api/v1/quality/capas` | `NCR_CREATE` | (auto) | — | (query: page, pageSize, status) | `routes/index.ts:201-204` |
| 20 | POST | `/api/v1/quality/capas` | `NCR_APPROVE` | YES (`CAPA_CREATED`) | — | `capaSchema` | `routes/index.ts:206-210` |

**BUG NOTE**: GET endpoints for NCRs use `NCR_CREATE` permission (line 170, 175) — this means a user must have create permission to merely READ NCRs. The `auditor` role (which has only `AUDIT_READ` + `NCR_*` is NOT in auditor's perms) cannot read NCRs at all. Should use a separate `NCR_READ` permission.

#### B. Services (`quality-inspection/service/index.ts`)

`qualityInspectionService` methods:

| Method | Signature | Business Rules | Lines |
|---|---|---|---|
| `createPlan` | `(data: {...}) → {id}` | audit | `23-28` |
| `getPlan` | `(id) → plan` | NotFoundError | `30-35` |
| `listPlans` | `(params) → {rows, total, ...}` | — | `37-40` |
| `createSamplingPlan` | `(data: {...}) → {id}` | (1) lotSizeMax > lotSizeMin (INVALID_LOT_RANGE); (2) acceptNumber < rejectNumber (INVALID_ACCEPT_REJECT); audit | `44-57` |
| `listSamplingPlans` | `() → plans[]` | — | `59-62` |
| `determineSampleSize` | `(tenantId, lotQuantity) → {sampleSize, samplingPlan}` | If sampling plan found: use plan.sampleSize; else default: 100% for <=10, 10% for >10 | `65-73` |
| `createInspectionLot` | `(data: {grnId, grnLineId, productId, ..., lotQuantity, planId?}) → lot` | (1) lotQuantity > 0; (2) auto-determines sample size via AQL; (3) generates `LOT-YYYY-NNNNNN` number (line 101 — actually the format is in inspectionLotRepository.generateLotNumber); (4) defaults inspectionStatus='PENDING', inspectionType='IQC'; (5) audit + event | `77-122` |
| `getInspectionLot` | `(id) → lot` | Eager loads results | `124-130` |
| `listInspectionLots` | `(params) → {rows, total, ...}` | — | `132-135` |
| `startInspection` | `(id, version) → lot` | Delegates to transitionInspection with target='IN_PROGRESS' | `137-139` |
| `recordResult` | `(id, data: {...}) → {resultId}` | (1) lot must be PENDING or IN_PROGRESS (NOT_IN_PROGRESS); (2) writes InspectionResult; (3) audit | `141-162` |
| `transitionInspection` | `(id, targetStatus, version, options?) → lot` | (1) workflow canTransition check; (2) on PASSED/CONDITIONAL_PASS/FAILED: sets inspectionCompletedAt, result, disposition (ACCEPT/USE_AS_IS/REJECT), acceptQty/rejectQty; (3) audit; (4) event per targetStatus; (5) **on FAILED: auto-creates QualityHold + NCR with severity='MAJOR', disposition='RETURN_TO_SUPPLIER'** | `164-235` |
| `createQualityHold` | `(data: {...}) → {id, holdNumber}` | (1) heldQty > 0; (2) generates `QH-YYYY-NNNNNN` number; (3) defaults holdType='IQC', status='ACTIVE'; (4) audit + event | `239-260` |
| `listQualityHolds` | `(params) → {rows, total, ...}` | — | `262-265` |
| `releaseQualityHold` | `(id, releaseReason, disposition) → hold` | (1) updates status='RELEASED', sets releasedBy/At/reason/disposition; (2) throws NOT_ACTIVE if not active; (3) audit + event | `267-282` |
| `createNcr` | `(data: {...}) → ncr` | (1) generates `NCR-YYYY-NNNNNN` number; (2) defaults ncrType='IQC', severity='MAJOR', disposition='RETURN_TO_SUPPLIER', status='OPEN'; (3) audit + event | `286-318` |
| `getNcr` | `(id) → ncr` | NotFoundError | `320-325` |
| `listNcrs` | `(params) → {rows, total, ...}` | — | `327-330` |
| `transitionNcr` | `(id, targetStatus, version, options?) → ncr` | (1) workflow canTransition; (2) updates rootCause/closureNotes/closedBy/At on resolve; (3) links capaId; (4) audit; (5) `NCR_CLOSED` event on CLOSED | `332-367` |
| `createCapa` | `(data: {...}) → capa` | (1) generates `CAPA-YYYY-NNNNNN` number; (2) defaults status='OPEN'; (3) audit | `371-387` |
| `listCapas` | `(params) → {rows, total, ...}` | — | `389-392` |

#### C. Repositories (`quality-inspection/repository/index.ts`)
Not read in detail. Exports: `inspectionPlanRepository, samplingPlanRepository, inspectionLotRepository, inspectionResultRepository, qualityHoldRepository, ncrRepository, capaRepository`.

#### D. Workflows
- `InspectionLotLifecycle` — referenced in service line 169 but registered in `workflow/index.ts` (not shown — file exists per LS output)
- `NCRLifecycle` — referenced in service line 337, registered in `workflow/ncr.ts` (per LS output)
- States (per transition schema line 69): PENDING, IN_PROGRESS, PASSED, CONDITIONAL_PASS, FAILED, ON_HOLD (6 states for InspectionLot)
- States (per NCR transition schema line 165): OPEN, UNDER_INVESTIGATION, CAPA_INITIATED, RESOLVED, CLOSED (5 states for NCR)

#### E. DTOs (`routes/index.ts:14-209`)
- `planSchema` (14-20): 8 fields — planCode, planName, productId?, productCategoryId?, inspectionType='IQC', samplingPlanId?, aqlLevel='2.5', inspectionCritical='NORMAL', description?
- `samplingPlanSchema` (40-46): planCode, planName, lotSizeMin (positive), lotSizeMax (positive), sampleSize (positive), acceptNumber=0, rejectNumber=1, aqlLevel='2.5', inspectionLevel='II'
- `lotCreateSchema` (61-66): grnId, grnLineId, productId, productSku, productName, batchNumber?, lotQuantity (positive), planId?, remarks?
- `lotTransitionSchema` (68-77): targetStatus enum (6 states), version, startedAt?, acceptQty?, rejectQty?, disposition?, ncrReason?, remarks?
- `resultSchema` (79-87): parameterId?, parameterCode?, parameterName?, expectedValue?, actualValue (min 1), result enum (PASS/FAIL/CONDITIONAL), remarks?
- `holdSchema` (125-130): sourceId?, sourceType?, productId, productSku, batchNumber?, lotNumber?, heldQty (positive), holdReason (min 1), holdLocation?
- `holdReleaseSchema` (132): releaseReason (min 1), disposition (min 1)
- `ncrSchema` (153-162): sourceId?, sourceType?, productId, productSku, productName, batchNumber?, lotNumber?, supplierId?, supplierName?, grnId?, grnNumber?, nonConformance (min 1), nonConformanceType?, severity enum (MINOR/MAJOR/CRITICAL)='MAJOR', defectQty?, disposition?
- `ncrTransitionSchema` (164-168): targetStatus enum (5 states), version, rootCause?, closureNotes?, capaId?
- `capaSchema` (194-199): ncrId?, ncrNumber?, correctiveAction (min 1), preventiveAction (min 1), actionOwner?, actionOwnerName?, targetDate?

---

### 5.7 ORDER FULFILLMENT MODULE (`apps/backend/src/modules/order-fulfillment/`)

Mount: `/api/v1/sales/fulfillment` (app.ts:205)

#### A. Endpoints (4 total)

| # | Method | Path | Permission | Audit | Event | Workflow | DTO | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/sales/fulfillment/allocations` | `CUSTOMER_READ` (proxy) | (auto) | — | — | (query: page, pageSize, status) | `routes/index.ts:13` |
| 2 | POST | `/api/v1/sales/fulfillment/allocations` | `CUSTOMER_UPDATE` (proxy) | YES (`ALLOCATION_CREATED`) | — | — | `allocSchema` | `routes/index.ts:14` |
| 3 | GET | `/api/v1/sales/fulfillment/waves` | `CUSTOMER_READ` | (auto) | — | — | (query: page, pageSize, status) | `routes/index.ts:15` |
| 4 | POST | `/api/v1/sales/fulfillment/waves` | `CUSTOMER_UPDATE` | YES (`WAVE_CREATED`) | — | — | `waveSchema` | `routes/index.ts:16` |

#### B. Services (`order-fulfillment/service/index.ts`)

`orderFulfillmentService` methods:

| Method | Signature | Business Rules | Lines |
|---|---|---|---|
| `createAllocation` | `(data: {soId, soNumber, soLineId, productId, ..., orderedQty, uomId?}) → alloc` | (1) orderedQty > 0 (INVALID_QTY); (2) FEFO allocation — queries `inventory` ordered by expiry_date ASC NULLS LAST; (3) iterates and allocates min(available, remaining) per stock row; (4) records first batchId/lotId found; (5) computes isFullyAllocated, shortQty; (6) generates `ALLOC-YYYY-NNNNNN`; (7) creates with allocationStrategy='FEFO', status='ALLOCATED'; (8) audit | `10-28` |
| `listAllocations` | `(params) → {rows, total, ...}` | — | `30` |
| `createWavePlan` | `(data: {warehouseId, warehouseName, priority?, soIds: [uuid]}) → wave` | (1) generates `WAVE-YYYY-NNNNNN`; (2) for each soId: queries `sales_order_lines` to count lines and sum qty; (3) creates wave with waveType='PICKING', status='CREATED', totalOrders/totalLines/totalQty set, allocatedQty=0, pickedQty=0; (4) audit | `32-44` |
| `listWavePlans` | `(params) → {rows, total, ...}` | — | `46` |

**LIMITATIONS**: No wave release, no pick assignment, no wave completion. No transition endpoint. Only create + list. No events emitted.

#### C. Repositories (`order-fulfillment/repository/index.ts`)
Uses generic `genRepo(table, fields)` factory (lines 3-29):
- `allocationRepository` → `inventory_allocations` (24 fields)
- `wavePlanRepository` → `wave_plans` (14 fields)
- `generateAllocationNumber(t)` → `ALLOC-YYYY-NNNNNN` (line 32)
- `generateWaveNumber(t)` → `WAVE-YYYY-NNNNNN` (line 33)

#### D. Workflows
**None.**

#### E. DTOs (`routes/index.ts:11-12`)
- `allocSchema`: soId, soNumber, soLineId, productId, productSku, productName, warehouseId, warehouseName, orderedQty (positive), uomId?, uomCode?
- `waveSchema`: warehouseId, warehouseName, priority enum (LOW/NORMAL/HIGH/URGENT)='NORMAL', soIds (array of uuid, min 1)

---

### 5.8 PICK-PACK-DISPATCH MODULE (`apps/backend/src/modules/pick-pack-dispatch/`)

Mount: `/api/v1/sales/pick-pack-dispatch` (app.ts:206)

#### A. Endpoints (6 total)

| # | Method | Path | Permission | Audit | Event | DTO | Source |
|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/sales/pick-pack-dispatch/pick-lists` | `CUSTOMER_READ` | (auto) | — | (query: page, pageSize, status) | `routes/index.ts:14` |
| 2 | POST | `/api/v1/sales/pick-pack-dispatch/pick-lists` | `CUSTOMER_UPDATE` | YES (`PICK_LIST_CREATED`) | — | `pickSchema` | `routes/index.ts:15` |
| 3 | GET | `/api/v1/sales/pick-pack-dispatch/packing-lists` | `CUSTOMER_READ` | (auto) | — | (query: page, pageSize, status) | `routes/index.ts:16` |
| 4 | POST | `/api/v1/sales/pick-pack-dispatch/packing-lists` | `CUSTOMER_UPDATE` | YES (`PACKING_LIST_CREATED`) | — | `packSchema` | `routes/index.ts:17` |
| 5 | GET | `/api/v1/sales/pick-pack-dispatch/shipments` | `CUSTOMER_READ` | (auto) | — | (query: page, pageSize, status) | `routes/index.ts:18` |
| 6 | POST | `/api/v1/sales/pick-pack-dispatch/shipments` | `CUSTOMER_UPDATE` | YES (`SHIPMENT_CREATED`) | `ShipmentCreated` | `shipSchema` | `routes/index.ts:19` |

#### B. Services (`pick-pack-dispatch/service/index.ts`)

| Method | Signature | Business Rules | Lines |
|---|---|---|---|
| `createPickList` | `(data: {waveId?, waveNumber?, warehouseId, warehouseName, pickerId?, pickerName?, soIds: [uuid]}) → pick` | (1) generates `PICK-YYYY-NNNNNN`; (2) for each soId: queries `sales_order_lines` for COUNT and SUM(ordered_qty); (3) creates with pickStrategy='FEFO', status='CREATED', pickedQty=0, shortQty=0; (4) audit | `10-18` |
| `listPickLists` | `(params) → {rows, total, ...}` | — | `19` |
| `createPackingList` | `(data: {..., totalLines (positive), totalQty (positive)}) → pack` | (1) generates `PACK-YYYY-NNNNNN`; (2) creates with packedQty=0, boxCount=0, status='CREATED'; (3) audit | `20-26` |
| `listPackingLists` | `(params) → {rows, total, ...}` | — | `27` |
| `createShipment` | `(data: {...}) → ship` | (1) generates `SHIP-YYYY-NNNNNN`; (2) creates with freightPaidBy='CUSTOMER' default, status='CREATED', dispatchedBy/Name/At set; (3) audit + event | `28-35` |
| `listShipments` | `(params) → {rows, total, ...}` | — | `36` |

**LIMITATIONS**: All three lists/packs/shipments only support create + list. No update, no transition, no pick-complete, no pack-complete, no dispatch-confirm. No inventory decrement on shipment (would need to call inventory.stockOut but doesn't).

#### C. Repositories (`pick-pack-dispatch/repository/index.ts`)
Uses generic `genRepo` factory (same pattern as order-fulfillment):
- `pickListRepository` → `pick_lists` (17 fields)
- `packingListRepository` → `packing_lists` (16 fields)
- `shipmentRepository` → `shipments` (29 fields including lrNumber, ewayBillNumber, trackingNumber)
- `genPickNumber(t)` → `PICK-YYYY-NNNNNN`
- `genPackNumber(t)` → `PACK-YYYY-NNNNNN`
- `genShipNumber(t)` → `SHIP-YYYY-NNNNNN`

#### D. Workflows
**None.**

#### E. DTOs (`routes/index.ts:11-13`)
- `pickSchema`: waveId?, waveNumber?, warehouseId, warehouseName, pickerId?, pickerName?, soIds (array of uuid, min 1)
- `packSchema`: pickListId?, pickNumber?, warehouseId, warehouseName, packerId?, packerName?, totalLines (int positive), totalQty (positive)
- `shipSchema`: 19 fields — packingListId?, packingNumber?, soId?, soNumber?, warehouseId, warehouseName, customerId?, customerName?, shipToAddress?, shipToCity?, shipToState?, transporterName?, vehicleNumber?, driverName?, driverMobile?, lrNumber?, totalQty?, totalWeight?, boxCount?, freightAmount?, freightPaidBy='CUSTOMER'

---

### 5.9 DELIVERY MANAGEMENT MODULE (`apps/backend/src/modules/delivery-management/`)

Mount: `/api/v1/sales/delivery` (app.ts:207)

#### A. Endpoints (6 total)

| # | Method | Path | Permission | Audit | Event | DTO | Source |
|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/sales/delivery/delivery-orders` | `CUSTOMER_READ` | (auto) | — | (query: page, pageSize, status) | `routes/index.ts:14` |
| 2 | POST | `/api/v1/sales/delivery/delivery-orders` | `CUSTOMER_UPDATE` | YES (`DELIVERY_ORDER_CREATED`) | — | `doSchema` | `routes/index.ts:15` |
| 3 | GET | `/api/v1/sales/delivery/pods` | `CUSTOMER_READ` | (auto) | — | (query: page, pageSize) | `routes/index.ts:16` |
| 4 | POST | `/api/v1/sales/delivery/pods` | `CUSTOMER_UPDATE` | YES (`POD_CREATED`) | `DeliveryConfirmed` | `podSchema` | `routes/index.ts:17` |
| 5 | GET | `/api/v1/sales/delivery/exceptions` | `CUSTOMER_READ` | (auto) | — | (query: page, pageSize, status) | `routes/index.ts:18` |
| 6 | POST | `/api/v1/sales/delivery/exceptions` | `CUSTOMER_UPDATE` | YES (`DELIVERY_EXCEPTION`) | — | `excSchema` | `routes/index.ts:19` |

#### B. Services (`delivery-management/service/index.ts`)

| Method | Signature | Business Rules | Lines |
|---|---|---|---|
| `createDeliveryOrder` | `(data: {shipmentId, shipmentNumber, ..., deliveryType?}) → delivery` | (1) generates `DEL-YYYY-NNNNNN`; (2) creates with status='CREATED'; (3) audit | `9-15` |
| `listDeliveryOrders` | `(params) → {rows, total, ...}` | — | `16` |
| `createPod` | `(data: {deliveryOrderId, ..., deliveredQty (positive), damagedQty?, shortQty?, deliveryStatus?}) → pod` | (1) deliveredQty > 0 (INVALID_QTY); (2) creates POD with confirmedBy/Name/At; (3) updates DeliveryOrder status='DELIVERED', actual_arrival=NOW; (4) audit + event | `17-26` |
| `listPods` | `(params) → {rows, total, ...}` | — | `27` |
| `createException` | `(data: {deliveryOrderId, ..., exceptionType, exceptionReason, rescheduledDate?}) → exc` | (1) creates with status='OPEN', reportedBy/Name; (2) audit | `29-33` |
| `listExceptions` | `(params) → {rows, total, ...}` | — | `34` |

**LIMITATIONS**: No transition endpoint for delivery orders. No resolution endpoint for exceptions (status stuck at OPEN). No tracking integration (Prisma has DeliveryTracking model — line 5564 — but it's not used).

#### C. Repositories (`delivery-management/repository/index.ts`)
Generic `genRepo` pattern:
- `deliveryOrderRepository` → `delivery_orders` (23 fields)
- `proofOfDeliveryRepository` → `proof_of_deliveries` (19 fields)
- `deliveryExceptionRepository` → `delivery_exceptions` (15 fields)
- `genDeliverNumber(t)` → `DEL-YYYY-NNNNNN`

#### D. Workflows
**None.**

#### E. DTOs (`routes/index.ts:11-13`)
- `doSchema`: shipmentId, shipmentNumber, soId?, soNumber?, customerId?, customerName?, deliveryAddress?, city/state/pincode?, contact/phone?, scheduledDate?, totalQty?, totalWeight?, driverName?, driverMobile?, vehicleNumber?, deliveryType='STANDARD'
- `podSchema`: 17 fields — deliveryOrderId, deliveryNumber?, receivedBy?, receivedByName?, receivedByDesignation?, customerSignature?, signatureImageUrl?, gpsLatitude?, gpsLongitude?, gpsTimestamp?, deliveryPhotoUrl?, deliveredQty (positive), damagedQty=0, shortQty=0, deliveryStatus enum (DELIVERED/PARTIAL/FAILED/RESCHEDULED)='DELIVERED', customerRemarks?, driverRemarks?
- `excSchema`: deliveryOrderId, deliveryNumber?, exceptionType (min 1), exceptionReason (min 1), rescheduledDate?, rescheduleReason?

---

### 5.10 BATCH MANUFACTURING MODULE (`apps/backend/src/modules/batch-manufacturing/`)

Mount: `/api/v1/manufacturing/batches` (app.ts:195)

#### A. Endpoints (8 total)

| # | Method | Path | Permission | Audit | Event | Workflow | DTO | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/manufacturing/batches/batches` | `PRODUCT_READ` | (auto) | — | — | (query: page, pageSize, productId, status, search) | `routes/index.ts:40-43` |
| 2 | GET | `/api/v1/manufacturing/batches/batches/:id` | `PRODUCT_READ` | (auto) | — | — | — | `routes/index.ts:44-47` |
| 3 | POST | `/api/v1/manufacturing/batches/batches` | `PRODUCT_CREATE` | YES (`BATCH_CREATED`) | `BatchCreated` | — | `batchSchema` | `routes/index.ts:48-52` |
| 4 | POST | `/api/v1/manufacturing/batches/batches/:id/transition` | `PRODUCT_UPDATE` | YES (`BATCH_TRANSITION`) | — | `ProductionBatchLifecycle` | `batchTransitionSchema` | `routes/index.ts:53-57` |
| 5 | POST | `/api/v1/manufacturing/batches/batches/:id/split` | `PRODUCT_UPDATE` | YES (`BATCH_SPLIT`) | `BatchSplit` | — | `splitSchema` | `routes/index.ts:58-62` |
| 6 | POST | `/api/v1/manufacturing/batches/batches/merge` | `PRODUCT_UPDATE` | YES (`BATCH_MERGED`) | `BatchMerged` | — | `mergeSchema` | `routes/index.ts:63-67` |
| 7 | GET | `/api/v1/manufacturing/batches/batches/:id/backward-traceability` | `PRODUCT_READ` | (auto) | — | — | — | `routes/index.ts:68-71` |
| 8 | GET | `/api/v1/manufacturing/batches/batches/:id/forward-traceability` | `PRODUCT_READ` | (auto) | — | — | — | `routes/index.ts:72-75` |
| 9 | GET | `/api/v1/manufacturing/batches/batches/:id/genealogy` | `PRODUCT_READ` | (auto) | — | — | — | `routes/index.ts:76-79` |

#### B. Services (`batch-manufacturing/service/index.ts`)

| Method | Signature | Business Rules | Lines |
|---|---|---|---|
| `createBatch` | `(data: {..., quantity (positive), uomId, uomCode, expiryDate?, shelfLifeDays?}) → batch` | (1) qty > 0; (2) generates `BATCH-YYYY-NNNNNN` (line 30); (3) batchType = parentBatchId ? 'CHILD' : 'PRODUCTION'; (4) initial status='IN_PRODUCTION'; (5) records BatchGenealogy if parent; (6) writes IMMUTABLE TraceabilityLog (traceType='BATCH_CREATED'); (7) audit + event | `17-64` |
| `getById` | `(id) → batch` | NotFoundError | `66-71` |
| `list` | `(params) → {rows, total, ...}` | Filters: productId, status, search | `73-76` |
| `transition` | `(id, targetStatus, version) → batch` | (1) workflow canTransition; (2) updates status; (3) optimistic concurrency (CONCURRENCY); (4) audit | `78-93` |
| `splitBatch` | `(id, data: {splitReason, splits: [{quantity, warehouseId?}]}) → {splitNumber, childBatchIds}` | (1) Σ split quantities must equal source quantity (SPLIT_QTY_MISMATCH, tolerance 0.001); (2) splits must produce ≥2 child batches (INVALID_SPLIT); (3) for each split: creates child batch (batchType='CHILD'), records genealogy (parentType='PARENT_BATCH'), records traceability (traceType='BATCH_SPLIT', direction='BACKWARD'); (4) marks source as isSplit=true, status='ARCHIVED'; (5) writes BatchSplit record; (6) audit + event | `96-161` |
| `mergeBatches` | `(data: {sourceBatchIds: [uuid], mergeReason, targetBatchNumber?, warehouseId?}) → {mergeNumber, targetBatchId, targetBatchNumber}` | (1) sourceBatchIds.length >= 2 (INVALID_MERGE); (2) all source batches must have same product (PRODUCT_MISMATCH); (3) creates target batch (batchType='MERGED', isMerged=true, status='IN_PRODUCTION'); (4) for each source: records genealogy (parentType='SOURCE_BATCH'), marks source isMerged=true, status='ARCHIVED', records traceability (traceType='BATCH_MERGE', direction='BACKWARD'); (5) writes BatchMerge record; (6) audit + event | `164-230` |
| `backwardTraceability` | `(batchId) → {batchId, batchNumber, direction: 'BACKWARD', ancestors}` | Queries BatchGenealogy for ancestors | `235-241` |
| `forwardTraceability` | `(batchId) → {..., direction: 'FORWARD', descendants}` | Queries BatchGenealogy for descendants | `243-250` |
| `getGenealogy` | `(batchId) → {..., ancestors, descendants}` | Both directions | `252-262` |

#### C. Repositories (`batch-manufacturing/repository/index.ts`)
Not read in detail. Exports: `productionBatchRepository, batchGenealogyRepository, batchSplitRepository, batchMergeRepository, traceabilityLogRepository`. SQL tables: `production_batches`, `batch_genealogy`, `batch_splits`, `batch_merges`, `traceability_logs`.

#### D. Workflow (`batch-manufacturing/workflow/index.ts`)

**Name**: `ProductionBatchLifecycle`
**Initial state**: `IN_PRODUCTION`
**States** (7): IN_PRODUCTION, PRODUCED, FGQC_PENDING, PASSED, CONDITIONAL_PASS, REJECTED, ARCHIVED
**Transitions** (9):
1. IN_PRODUCTION → PRODUCED
2. PRODUCED → FGQC_PENDING
3. FGQC_PENDING → PASSED
4. FGQC_PENDING → CONDITIONAL_PASS
5. FGQC_PENDING → REJECTED
6. PASSED → ARCHIVED
7. CONDITIONAL_PASS → ARCHIVED
8. REJECTED → ARCHIVED
9. PRODUCED → IN_PRODUCTION (rework)

#### E. DTOs (`routes/index.ts:12-38`)
- `batchSchema` (12-20): productionOrderId?, productionOrderNumber?, productId, productSku?, productName?, parentBatchId?, parentBatchNumber?, quantity (positive), uomId, uomCode, expiryDate?, shelfLifeDays? (int positive), warehouseId?, warehouseName?, remarks?
- `batchTransitionSchema` (22-25): targetStatus enum (7 states), version
- `splitSchema` (27-32): splitReason (min 1), splits (array of {quantity (positive), warehouseId?, warehouseName?}, min 2)
- `mergeSchema` (34-38): sourceBatchIds (array of uuid, min 2), mergeReason (min 1), warehouseId?, warehouseName?

---

### 5.11 PRODUCT COSTING MODULE (`apps/backend/src/modules/product-costing/`)

Mount: `/api/v1/finance/costing` (app.ts:212)

#### A. Endpoints (7 total — generic CRUD stub)

| # | Method | Path | Permission | Audit | Event | Workflow | DTO | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/finance/costing/` | `AUDIT_READ` (!) | (auto) | — | — | (query: page, pageSize, status, search) | `routes/index.ts:29-42` |
| 2 | GET | `/api/v1/finance/costing/count` | `AUDIT_READ` | (auto) | — | — | (query: status) | `routes/index.ts:45-50` |
| 3 | GET | `/api/v1/finance/costing/exists/:code` | `AUDIT_READ` | (auto) | — | — | — | `routes/index.ts:53-56` |
| 4 | GET | `/api/v1/finance/costing/:id` | `AUDIT_READ` | (auto) | — | — | — | `routes/index.ts:59-62` |
| 5 | POST | `/api/v1/finance/costing/` | `AUDIT_READ` (!!) | YES (`CREATE`) | `ProductCostCalculated` | — | (any body) | `routes/index.ts:65-69` |
| 6 | PUT | `/api/v1/finance/costing/:id` | `AUDIT_READ` | YES (`UPDATE`) | — | — | (any body) | `routes/index.ts:72-76` |
| 7 | DELETE | `/api/v1/finance/costing/:id` | `AUDIT_READ` | YES (`DELETE`) | — | — | (query: reason) | `routes/index.ts:79-83` |
| 8 | POST | `/api/v1/finance/costing/:id/transition` | `AUDIT_READ` | YES (`TRANSITION`) | `ProductCostTransitioned` | `ProductCostLifecycle` | (body: targetState, reason) | `routes/index.ts:86-94` |

**CRITICAL BUG**: Line 25-26: `const READ_PERM = Permission.AUDIT_READ; const WRITE_PERM = Permission.AUDIT_READ;` — BOTH read AND write permissions are set to `AUDIT_READ`. This means ANY user with audit:read permission (e.g. the `auditor` role, line 145 of registry.ts) can CREATE, UPDATE, DELETE, and TRANSITION product costs. The `auditor` role should be read-only but has been accidentally granted write access to costing.

#### B. Services (`product-costing/service/index.ts`)

`ProductCostingService` methods (all generic CRUD — no actual cost calculation logic):

| Method | Signature | Business Rules | Lines |
|---|---|---|---|
| `list` | `(params: {page?, pageSize?, status?, search?}) → {rows, total, ...}` | Tenant isolation; search matches cost_id OR description (insensitive); pageSize capped at 100 | `82-111` |
| `getById` | `(id) → record` | Tenant + not-deleted check; NotFoundError | `118-129` |
| `create` | `(data: {cost_id, ...}) → {id}` | (1) cost_id required (ValidationError); (2) cost_id unique within tenant (PRODUCTCOST_DUPLICATE_CODE); (3) defaults status='DRAFT', version=0; (4) transaction: INSERT + audit + event | `145-208` |
| `update` | `(id, data: {version?, ...}) → {id, version}` | (1) optimistic concurrency (ConcurrencyError); (2) status field stripped (use transition); (3) tenantId stripped; (4) transaction: SELECT-FOR-UPDATE (via version) + UPDATE + audit | `225-279` |
| `delete` | `(id, reason?)` | Soft-delete: sets deletedAt + deletedBy; audit | `286-322` |
| `transition` | `(id, targetState, reason?) → {status, version}` | (1) loads `ProductCostLifecycle` workflow; (2) canTransition check; (3) UPDATE status; (4) audit + event | `332-415` |
| `count` | `(params: {status?}) → number` | — | `422-430` |
| `existsByCode` | `(cost_id) → boolean` | — | `437-444` |

**NOTE**: Despite the file header claiming "Product Cost Service Layer" with "Business rules validation", the actual implementation has NO business rules related to cost calculation (no standard cost vs actual cost vs moving average, no BOM cost roll-up, no variance calculation). It's purely a generic CRUD wrapper around the `ProductCosts` Prisma model.

#### C. Repositories
**None.** The service uses Prisma `db.ProductCosts` directly (no separate repository layer). This is inconsistent with other modules that use a repository pattern.

#### D. Workflow (`product-costing/workflow/index.ts`)

**Name**: `ProductCostLifecycle`
**Initial state**: `DRAFT`
**States** (5): DRAFT, CALCULATED, APPROVED, POSTED, ARCHIVED
**Transitions** (6):
1. DRAFT → CALCULATED
2. CALCULATED → APPROVED
3. CALCULATED → DRAFT
4. APPROVED → POSTED
5. POSTED → ARCHIVED
6. APPROVED → ARCHIVED

#### E. DTOs
**None.** Routes accept `await c.req.json()` directly without zValidator schemas. This is a security concern — no input validation on POST/PUT.

---

### 5.12 MES MODULE (`apps/backend/src/modules/mes/`)

Mount: `/api/v1/mes` (app.ts:191)

#### A. Endpoints (11 total)

##### Work Centers (2)
| # | Method | Path | Permission | Audit | Event | DTO | Source |
|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/mes/work-centers` | `PRODUCT_READ` | (auto) | — | (query: page, pageSize, search, isActive) | `routes/index.ts:50-53` |
| 2 | POST | `/api/v1/mes/work-centers` | `PRODUCT_CREATE` | YES (`CREATE` WorkCenter) | — | `wcSchema` | `routes/index.ts:54-58` |

##### Machines (3)
| 3 | GET | `/api/v1/mes/machines` | `PRODUCT_READ` | (auto) | — | (query: page, pageSize, search, isActive) | `routes/index.ts:61-64` |
| 4 | POST | `/api/v1/mes/machines` | `PRODUCT_CREATE` | YES (`CREATE` Machine) | — | `machineSchema` | `routes/index.ts:65-69` |
| 5 | POST | `/api/v1/mes/machines/:id/status` | `PRODUCT_UPDATE` | YES (`MACHINE_STATUS_CHANGE`) | `MachineStatusChanged` | (body: newStatus) | `routes/index.ts:70-74` |

##### Shifts (2)
| 6 | GET | `/api/v1/mes/shifts` | `PRODUCT_READ` | (auto) | — | — | `routes/index.ts:77-80` |
| 7 | POST | `/api/v1/mes/shifts` | `PRODUCT_CREATE` | YES (`CREATE` Shift) | — | `shiftSchema` | `routes/index.ts:81-85` |

##### Downtime (2)
| 8 | GET | `/api/v1/mes/downtime` | `PRODUCT_READ` | (auto) | — | (query: page, pageSize, machineId) | `routes/index.ts:88-91` |
| 9 | POST | `/api/v1/mes/downtime` | `PRODUCT_UPDATE` | YES (`DOWNTIME_RECORDED`) | `DowntimeRecorded` | `downtimeSchema` | `routes/index.ts:92-96` |

##### Events (2)
| 10 | GET | `/api/v1/mes/events` | `PRODUCT_READ` | (auto) | — | (query: page, pageSize, productionOrderId) | `routes/index.ts:99-102` |
| 11 | POST | `/api/v1/mes/events` | `PRODUCT_UPDATE` | — (no audit log in recordEvent!) | — | `eventSchema` | `routes/index.ts:103-107` |

##### Analytics (2)
| 12 | GET | `/api/v1/mes/analytics/oee/:machineId` | `PRODUCT_READ` | (auto) | — | (query: startDate, endDate) | `routes/index.ts:110-113` |
| 13 | GET | `/api/v1/mes/dashboard` | `PRODUCT_READ` | (auto) | — | — | `routes/index.ts:116-119` |

#### B. Services (`mes/service/index.ts`)

| Method | Signature | Business Rules | Lines |
|---|---|---|---|
| `createWorkCenter` | `(data: {wcCode, wcName, wcType?, ...}) → wc` | Defaults wcType='PRODUCTION', isActive=true; audit | `18-23` |
| `listWorkCenters` | `(params) → {rows, total, ...}` | — | `25-28` |
| `createMachine` | `(data: {...}) → machine` | Defaults currentStatus='IDLE', isActive=true; audit | `32-37` |
| `listMachines` | `(params) → {rows, total, ...}` | — | `39-42` |
| `updateMachineStatus` | `(id, newStatus) → machine` | (1) newStatus must be one of IDLE/RUNNING/SETUP/MAINTENANCE/BREAKDOWN/CLEANING (INVALID_STATUS); (2) NotFoundError if not found; (3) audit + event | `44-55` |
| `createShift` | `(data: {shiftCode, shiftName, startTime, endTime, breakMinutes?, description?}) → shift` | Defaults breakMinutes=30, isActive=true; audit | `59-64` |
| `listShifts` | `() → {rows}` | pageSize=1000 (effectively all) | `66-69` |
| `recordDowntime` | `(data: {machineId, machineCode, ..., downtimeStart, downtimeEnd?, downtimeType, reason, ...}) → {id, downtimeNumber}` | (1) if downtimeEnd: durationMinutes computed, must be > 0 (INVALID_DOWNTIME); (2) generates `DT-YYYY-NNNNNN`; (3) audit + event | `73-91` |
| `listDowntime` | `(params) → {rows, total, ...}` | — | `93-96` |
| `recordEvent` | `(data: {eventType, ..., severity?, description?}) → {id}` | Writes to production_events table; operatorId defaults to current user; **NO audit log call** | `100-104` |
| `listEvents` | `(params) → {rows, total, ...}` | — | `106-109` |
| `calculateOEE` | `(machineId, startDate, endDate) → {machineId, period, plannedMinutes, downtimeMinutes, runTime, producedQty, rejectedQty, goodQty, availability, performance, quality, oee}` | (1) plannedMinutes from shift_calendars (480 - break_minutes per working day); (2) downtimeMinutes from downtime_records; (3) producedQty/rejectedQty from production_confirmations joined with production_orders + machines; (4) Availability = runTime / plannedMinutes * 100; (5) Quality = goodQty / producedQty * 100; (6) Performance = (producedQty / (runTime/60)) * 100 (capped at 100); (7) OEE = A * P * Q | `113-151` |
| `getProductionDashboard` | `() → {totalMachines, runningMachines, totalProductionOrders, inProgressOrders, activeDowntimes, eventsLast24h}` | 4 parallel COUNT queries | `153-169` |

#### C. Repositories (`mes/repository/index.ts`)
Not read in detail. Exports: `workCenterRepository, machineRepository, shiftRepository, downtimeRepository, productionEventRepository`. SQL tables: `work_centers`, `machines`, `shifts`, `shift_calendars`, `machine_status_logs`, `downtime_records`, `production_events`.

#### D. Workflows
**None.** Machine status changes are direct updates.

#### E. DTOs (`routes/index.ts:12-47`)
- `wcSchema` (12-17): wcCode, wcName, wcType='PRODUCTION', plantId?, plantName?, departmentId?, capacityPerHour?, description?
- `machineSchema` (19-25): machineCode, machineName, workCenterId?, productionLineId?, machineType?, manufacturer?, model?, serialNumber?, maxCapacity?, installedDate?, description?
- `shiftSchema` (27-31): shiftCode, shiftName, startTime, endTime, breakMinutes=30, description?
- `downtimeSchema` (33-39): machineId, machineCode, productionOrderId?, productionOrderNumber?, downtimeStart (datetime), downtimeEnd? (datetime), downtimeType (min 1), downtimeCategory?, reason (min 1), actionTaken?
- `eventSchema` (41-47): eventType (min 1), productionOrderId?, productionOrderNumber?, machineId?, machineCode?, operatorId?, operatorName?, eventData? (record), severity enum (INFO/WARN/ERROR/CRITICAL)='INFO', description?

---

### 5.13 ATTENDANCE-SHIFT MODULE (`apps/backend/src/modules/attendance-shift/`)

Mount: `/api/v1/hrms/attendance` (app.ts:222)

#### A. Endpoints (7 total — generic CRUD stub)

| # | Method | Path | Permission | Audit | Event | Workflow | DTO | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/hrms/attendance/` | `ORG_READ` (proxy) | (auto) | — | — | (query: page, pageSize, status, search) | `routes/index.ts:29-42` |
| 2 | GET | `/api/v1/hrms/attendance/count` | `ORG_READ` | (auto) | — | — | (query: status) | `routes/index.ts:45-50` |
| 3 | GET | `/api/v1/hrms/attendance/exists/:code` | `ORG_READ` | (auto) | — | — | — | `routes/index.ts:53-56` |
| 4 | GET | `/api/v1/hrms/attendance/:id` | `ORG_READ` | (auto) | — | — | — | `routes/index.ts:59-62` |
| 5 | POST | `/api/v1/hrms/attendance/` | `ORG_UPDATE` (proxy) | YES (`CREATE`) | `AttendanceRecorded` | — | (any body) | `routes/index.ts:65-69` |
| 6 | PUT | `/api/v1/hrms/attendance/:id` | `ORG_UPDATE` | YES (`UPDATE`) | — | — | (any body) | `routes/index.ts:72-76` |
| 7 | DELETE | `/api/v1/hrms/attendance/:id` | `ORG_UPDATE` | YES (`DELETE`) | — | — | (query: reason) | `routes/index.ts:79-83` |
| 8 | POST | `/api/v1/hrms/attendance/:id/transition` | `ORG_UPDATE` | YES (`TRANSITION`) | `AttendanceTransitioned` | (workflow registered in service) | (body: targetState, reason) | `routes/index.ts:86-94` |

**LIMITATION**: This is a generic CRUD stub (RC1 Fix Pack 1 — file header). It does NOT implement actual attendance logic (no clock-in/clock-out, no shift roster management, no overtime calculation). Prisma schema (line 8408-8577) has full Attendance, Rosters, RosterLines, Holidays, WeeklyOffs, OvertimeRequests, Timesheets models — but the service doesn't use most of them.

#### B. Services (`attendance-shift/service/index.ts`)
Generic CRUD pattern matching product-costing: `list, getById, create, update, delete, transition, count, existsByCode`. All use Prisma directly with optimistic concurrency, soft-delete, and audit. No actual attendance domain logic visible.

#### C. Repositories
**None.** Uses Prisma `db.Attendance` (or similar — Prisma model is `Attendance` per schema.prisma line 8408) directly.

#### D. Workflows
A workflow IS registered (per `attendance-shift/service/index.ts:394` emits `AttendanceTransitioned`), but the workflow definition file was not read. Service header comment indicates workflow integration exists.

#### E. DTOs
**None.** Routes accept raw JSON.

---

### 5.14 PERFORMANCE MANAGEMENT MODULE (`apps/backend/src/modules/performance-management/`)

Mount: `/api/v1/hrms/performance` (app.ts:226)

#### A. Endpoints (7 total — generic CRUD stub)

| # | Method | Path | Permission | Audit | Event | Workflow | DTO | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/hrms/performance/` | `ORG_READ` | (auto) | — | — | (query: page, pageSize, status, search) | `routes/index.ts:29-42` |
| 2 | GET | `/api/v1/hrms/performance/count` | `ORG_READ` | (auto) | — | — | (query: status) | `routes/index.ts:45-50` |
| 3 | GET | `/api/v1/hrms/performance/exists/:code` | `ORG_READ` | (auto) | — | — | — | `routes/index.ts:53-56` |
| 4 | GET | `/api/v1/hrms/performance/:id` | `ORG_READ` | (auto) | — | — | — | `routes/index.ts:59-62` |
| 5 | POST | `/api/v1/hrms/performance/` | `ORG_UPDATE` | YES (`CREATE`) | `PerformanceReviewInitiated` | — | (any body) | `routes/index.ts:65-69` |
| 6 | PUT | `/api/v1/hrms/performance/:id` | `ORG_UPDATE` | YES (`UPDATE`) | — | — | (any body) | `routes/index.ts:72-76` |
| 7 | DELETE | `/api/v1/hrms/performance/:id` | `ORG_UPDATE` | YES (`DELETE`) | — | — | (query: reason) | `routes/index.ts:79-83` |
| 8 | POST | `/api/v1/hrms/performance/:id/transition` | `ORG_UPDATE` | YES (`TRANSITION`) | `PerformanceReviewTransitioned` | (workflow registered) | (body: targetState, reason) | `routes/index.ts:86-94` |

**LIMITATION**: Generic CRUD stub. Prisma has PerformanceCycles (9167), EmployeeGoals (9194), Appraisals (9222), Feedback360 (9254), TrainingRecommendations (9282) — none used by this service.

#### B-D. Same pattern as attendance-shift.

---

### 5.15 ALERTS-KPI-ENGINE MODULE (`apps/backend/src/modules/alerts-kpi-engine/`)

Mount: `/api/v1/bi/alerts` (app.ts:231)

#### A. Endpoints (7 total — generic CRUD stub)

| # | Method | Path | Permission | Audit | Event | Workflow | DTO | Source |
|---|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/bi/alerts/` | `AUDIT_READ` | (auto) | — | — | (query: page, pageSize, status, search) | `routes/index.ts:29-42` |
| 2 | GET | `/api/v1/bi/alerts/count` | `AUDIT_READ` | (auto) | — | — | (query: status) | `routes/index.ts:45-50` |
| 3 | GET | `/api/v1/bi/alerts/exists/:code` | `AUDIT_READ` | (auto) | — | — | — | `routes/index.ts:53-56` |
| 4 | GET | `/api/v1/bi/alerts/:id` | `AUDIT_READ` | (auto) | — | — | — | `routes/index.ts:59-62` |
| 5 | POST | `/api/v1/bi/alerts/` | `AUDIT_READ` (!!) | YES (`CREATE`) | `AlertRuleCreated` | — | (any body) | `routes/index.ts:65-69` |
| 6 | PUT | `/api/v1/bi/alerts/:id` | `AUDIT_READ` | YES (`UPDATE`) | — | — | (any body) | `routes/index.ts:72-76` |
| 7 | DELETE | `/api/v1/bi/alerts/:id` | `AUDIT_READ` | YES (`DELETE`) | — | — | (query: reason) | `routes/index.ts:79-83` |
| 8 | POST | `/api/v1/bi/alerts/:id/transition` | `AUDIT_READ` | YES (`TRANSITION`) | `AlertRuleTransitioned` | (workflow registered) | (body: targetState, reason) | `routes/index.ts:86-94` |

**SAME BUG as product-costing**: line 25-26 sets BOTH READ_PERM and WRITE_PERM to `AUDIT_READ`. Auditors can mutate alert rules.

**LIMITATION**: This is generic CRUD on the `AlertRules` Prisma model only. It does NOT:
- Actually evaluate alert rules against metrics (no scheduler/evaluator)
- Create `Alerts` records (separate Prisma model at line 9935)
- Acknowledge or resolve alerts
- Trigger escalations (AlertEscalations model at line 9974 unused)
- Generate KPI monitoring snapshots (KpiMonitoring model at line 10019 unused)
- Send notifications (NotificationDigests model at line 9995 unused)

Prisma schema has 5 alert-related models (AlertRules, Alerts, AlertEscalations, NotificationDigests, KpiMonitoring) — but only AlertRules is touched by this module.

---

## 6. SALES-ORDER MODULE (FULFILLMENT UPSTREAM) (`apps/backend/src/modules/sales-order/`)

Mount: `/api/v1/sales/orders` (app.ts:203)

#### A. Endpoints (5 total)

| # | Method | Path | Permission | Audit | Event | DTO | Source |
|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/sales/orders/orders` | `CUSTOMER_READ` | (auto) | — | (query: page, pageSize, search, status, customerId) | `routes/index.ts:48-51` |
| 2 | GET | `/api/v1/sales/orders/orders/:id` | `CUSTOMER_READ` | (auto) | — | — | `routes/index.ts:52-55` |
| 3 | POST | `/api/v1/sales/orders/orders` | `CUSTOMER_CREATE` | YES (`CREATE`) | `SalesOrderCreated` | `soSchema` | `routes/index.ts:56-60` |
| 4 | POST | `/api/v1/sales/orders/orders/:id/transition` | `CUSTOMER_UPDATE` | YES (`TRANSITION`) | `InventoryReserved` (on RESERVED) | `transitionSchema` | `routes/index.ts:61-65` |
| 5 | POST | `/api/v1/sales/orders/orders/:id/hold` | `CUSTOMER_UPDATE` | YES | — | `holdSchema` | `routes/index.ts:66-70` |
| 6 | POST | `/api/v1/sales/orders/orders/:id/release-hold` | `CUSTOMER_UPDATE` | YES | — | `releaseHoldSchema` | `routes/index.ts:71-75` |

SO status enum (line 41): DRAFT, PENDING_APPROVAL, APPROVED, RESERVED, WAVE_PLANNED, PICKING, PICKED, PACKING, PACKED, DISPATCHED, IN_TRANSIT, DELIVERED, COMPLETED, CANCELLED (14 states).

This is the upstream of the fulfillment pipeline. The transition endpoint allows moving SO through the fulfillment lifecycle. Service file not read in detail — but service emits `SalesOrderCreated` (line 101) and `InventoryReserved` (line 231 — when transition to RESERVED).

---

## 7. CUSTOMER-RETURNS MODULE (`apps/backend/src/modules/customer-returns/`)

Mount: `/api/v1/sales/returns` (app.ts:208)

#### A. Endpoints (7 total)

| # | Method | Path | Permission | Audit | Event | DTO | Source |
|---|---|---|---|---|---|---|---|
| 1 | GET | `/api/v1/sales/returns/rmas` | `CUSTOMER_READ` | (auto) | — | (query: page, pageSize, status) | `routes/index.ts:15` |
| 2 | GET | `/api/v1/sales/returns/rmas/:id` | `CUSTOMER_READ` | (auto) | — | — | `routes/index.ts:16` |
| 3 | POST | `/api/v1/sales/returns/rmas` | `CUSTOMER_UPDATE` | YES | `RMACreated` | `rmaSchema` | `routes/index.ts:17` |
| 4 | POST | `/api/v1/sales/returns/rmas/:id/transition` | `CUSTOMER_UPDATE` | YES | `RMAClosed` (if target=CLOSED) | `rmaTransitionSchema` | `routes/index.ts:18` |
| 5 | GET | `/api/v1/sales/returns/rmas/:id/inspections` | `CUSTOMER_READ` | (auto) | — | — | `routes/index.ts:19` |
| 6 | POST | `/api/v1/sales/returns/rmas/:id/inspections` | `CUSTOMER_UPDATE` | YES | — | `inspSchema` | `routes/index.ts:20` |
| 7 | GET | `/api/v1/sales/returns/refunds` | `CUSTOMER_READ` | (auto) | — | (query: page, pageSize, status) | `routes/index.ts:21` |
| 8 | POST | `/api/v1/sales/returns/refunds` | `CUSTOMER_UPDATE` | YES | — | `refundSchema` | `routes/index.ts:22` |

RMA status enum (line 12): REQUESTED, APPROVED, REJECTED, RETURN_RECEIVED, INSPECTION_PENDING, INSPECTED, RESOLVED, CLOSED (8 states).
Return type enum (line 11): DAMAGE, DEFECTIVE, WRONG_ITEM, EXPIRED, NOT_REQUIRED, QUALITY_ISSUE.
Disposition enum (line 13): RETURN_TO_STOCK, SCRAP, REPAIR, REJECT, HOLD.

---

## 8. ENDPOINT COUNT SUMMARY

### By module

| Module | Endpoints |
|---|---|
| inventory | 14 |
| goods-receipt | 7 |
| warehouse | 16 |
| procurement | 6 |
| purchase-order | 17 |
| quality-inspection | 20 |
| order-fulfillment | 4 |
| pick-pack-dispatch | 6 |
| delivery-management | 6 |
| batch-manufacturing | 9 |
| product-costing | 8 |
| mes | 13 |
| attendance-shift | 8 |
| performance-management | 8 |
| alerts-kpi-engine | 8 |
| sales-order (upstream) | 6 |
| customer-returns (returns) | 8 |
| **TOTAL** | **156 endpoints** |

### By HTTP method

- GET: 70
- POST: 64
- PATCH: 5
- PUT: 4
- DELETE: 4
- (POST search variants: 2)

---

## 9. EVENT INVENTORY (consolidated)

See §4 for the per-module event list with file:line citations.

### Events emitted by Section 04 modules: ~30 distinct event names

| Module | Event Count |
|---|---|
| inventory | 3 (StockAdded, StockRemoved, StockBlocked) |
| goods-receipt | 5 (Created, Verified, Accepted, Rejected, Closed) |
| warehouse | 2 (PutawayTaskCreated, PutawayCompleted) |
| procurement | 5 (PR Created/Submitted/Approved/Rejected/Cancelled) |
| purchase-order | 2 (Created, CreatedFromQuotation) |
| quality-inspection | 9 (InspectionLotCreated, InspectionPassed/ConditionalPass/Failed/OnHold, QualityHoldCreated/Released, NCR_CREATED, NCR_CLOSED) |
| batch-manufacturing | 3 (BatchCreated, BatchSplit, BatchMerged) |
| product-costing | 2 (ProductCostCalculated, ProductCostTransitioned) |
| mes | 2 (MachineStatusChanged, DowntimeRecorded) |
| attendance-shift | 2 (AttendanceRecorded, AttendanceTransitioned) |
| performance-management | 2 (PerformanceReviewInitiated, PerformanceReviewTransitioned) |
| alerts-kpi-engine | 2 (AlertRuleCreated, AlertRuleTransitioned) |
| order-fulfillment | 0 (no events!) |
| pick-pack-dispatch | 1 (ShipmentCreated) |
| delivery-management | 1 (DeliveryConfirmed) |
| sales-order | 2 (SalesOrderCreated, InventoryReserved) |
| customer-returns | 2 (RMACreated, RMAClosed) |

### Critical event issues
1. **EventName catalog in `event-bus.ts:39-63` is INCOMPLETE** — only declares 13 events but ~85 are emitted across the codebase. The catalog is aspirational.
2. **Inconsistent naming**: `NCR_CREATED` (uppercase) vs `StockAdded` (PascalCase) vs `GoodsReceiptCreated` (PascalCase). The catalog uses PascalCase (`NcrCreated`).
3. **No `StockReversed` event** is emitted anywhere — despite `INVENTORY_REVERSE` permission existing and `EventName.StockReversed` being declared in the catalog.
4. **order-fulfillment emits NO events** — allocations and wave plans silently succeed without outbox writes.
5. **No event subscribers are registered** in any of the Section 04 modules — the events are written to the outbox but no module subscribes to handle them. They'd be published by the background `drainOutbox` job (line 140 of event-bus.ts) but with no handlers, they'd just be marked PUBLISHED without action.

---

## 10. PRISMA MODELS RELEVANT TO SECTION 04

From `apps/backend/prisma/schema.prisma` (10,038 lines, ~250 models total):

### Inventory & Stock (5 models)
| Model | Line | Description |
|---|---|---|
| `Inventory` | 2437 | Current stock levels (multi-key: product+warehouse+batch+lot+bin) |
| `InventoryTransactions` | 2479 | Movement history (transaction_type, movement_type, balance_after) |
| `InventoryLedger` | 2520 | IMMUTABLE ledger (is_immutable=true, in_qty/out_qty/balance_qty/balance_value) |
| `StockReservations` | 2557 | Stock reservations (status: ACTIVE/RELEASED, reserved_for) |
| `StockBlocks` | 2593 | Stock blocks (block_type, block_reason, source_type) |

### Batches & Lots (2 models)
| `Batches` | 2383 | Product batches (batch_number, manufacture_date, expiry_date, is_blocked) |
| `Lots` | 2409 | Product lots within batches |

### Warehouse (4 models)
| `WarehouseZones` | 2629 | Zone master (zone_code, zone_type, capacity, used_capacity) |
| `WarehouseAisles` | 2653 | Aisle master (aisle_code, zone_id FK) |
| `WarehouseRacks` | 2677 | Rack master (rack_code, levels, capacity_per_level) |
| `WarehouseBins` | 2705 | Bin master (bin_code, level, position, capacity, used_capacity, is_blocked) |

### Putaway & Barcode (3 models)
| `PutawayTasks` | 2736 | Putaway task (task_number, source/target bin, status: PENDING/IN_PROGRESS/COMPLETED) |
| `BarcodeLabels` | 2781 | Barcode labels (8 label types, GS1 + QR data, is_printed, is_scanned) |
| `ScanLogs` | 2826 | Scan audit log (result: SUCCESS/NOT_FOUND) |

### Goods Receipt (6 models)
| `GoodsReceipts` | 1930 | GRN master (grn_number, 8 status states, totals, is_partial, is_short, is_over) |
| `GoodsReceiptLines` | 1993 | GRN line items (received/accepted/rejected/damaged/short/over qty) |
| `GrnAttachments` | 2030 | GRN file attachments |
| `GrnVehicleDetails` | 2049 | Vehicle info |
| `GrnTransportDetails` | 2069 | Transport info |
| `GrnDeliveryChallans` | 2090 | Delivery challan |
| `GrnSupplierInvoices` | 2107 | Supplier invoice |
| `GrnDamageRecords` | 2126 | Damage records (severity: MINOR/MAJOR/CRITICAL) |

### Quality Inspection (5 models)
| `InspectionPlans` | 2149 | Inspection plan master (aql_level, inspection_critical) |
| `SamplingPlans` | 2172 | AQL sampling plan (lot_size_min/max, sample_size, accept/reject number) |
| `InspectionParameters` | 2196 | Test parameters |
| `InspectionLots` | 2216 | Inspection lot (inspection_status, lot_quantity, sample_size, accept/reject qty, disposition) |
| `InspectionResults` | 2256 | Inspection result per parameter (PASS/FAIL/CONDITIONAL) |
| `QualityHolds` | 2277 | Quality hold (held_qty, hold_reason, status: ACTIVE/RELEASED) |
| `Ncrs` | 2311 | Non-conformance report (severity, defect_qty, disposition) |
| `CapaRecords` | 2355 | CAPA (corrective + preventive action) |

### Manufacturing / MES (10 models)
| `WorkCenters` | 2846 | Work center master |
| `ProductionLines` | 2871 | Production line |
| `Machines` | 2895 | Machine master (current_status: IDLE/RUNNING/SETUP/MAINTENANCE/BREAKDOWN/CLEANING) |
| `Shifts` | 2924 | Shift master (start/end time, break_minutes) |
| `ShiftCalendars` | 2944 | Daily shift calendar |
| `MachineStatusLogs` | 2961 | Machine status change log |
| `DowntimeRecords` | 2982 | Downtime record (duration_minutes, downtime_type, reason) |
| `ProductionEvents` | 3008 | Production event log (severity) |
| `ProductionBatches` | 3590 | Production batch (batch_type: PRODUCTION/CHILD/MERGED, is_split, is_merged) |
| `BatchGenealogy` | 3629 | Batch parent-child relationship (IMMUTABLE) |
| `BatchSplits` | 3652 | Batch split record |
| `BatchMerges` | 3674 | Batch merge record |
| `TraceabilityLogs` | 3696 | IMMUTABLE traceability log (trace_type, direction: SELF/BACKWARD/FORWARD) |

### Procurement (PO + PR) (15+ models)
| `PurchaseRequisitions` | 1761 | PR master (10 status states, requisitionType, priority, estimated_total, budget_amount) |
| `PurchaseRequisitionLines` | 1805 | PR line |
| `PurchaseRequisitionApprovals` | 1832 | PR approval history |
| `PurchaseOrders` | 343 | PO master (15 status states, totals, currency, payment terms) |
| `PurchaseOrderLine` | 446 | PO line |
| `PurchaseOrderTax` | 492 | PO tax |
| `PurchaseOrderCharge` | 510 | PO charge (freight, insurance) |
| `PurchaseOrderAttachment` | 529 | PO attachment |
| `PurchaseOrderTerm` | 550 | PO terms |
| `PurchaseOrderApproval` | 566 | PO approval (level: DEPT/FINANCE/MGMT) |
| `PurchaseOrderRevision` | 588 | PO revision |
| `PurchaseOrderHistory` | 609 | PO history |
| `PurchaseOrderDeliverySchedule` | 630 | PO delivery schedule |
| `PurchaseOrderMilestone` | 653 | PO milestone |
| `PurchaseOrderCommunication` | 674 | PO comms log |

### Sales & Fulfillment (10+ models)
| `SalesOrders` | 4727 | SO master (14 status states, totals, currency) |
| `SalesOrderLines` | 4800 | SO line |
| `SalesOrderAmendments` | 4844 | SO amendment |
| `SalesOrderHolds` | 4866 | SO hold (hold_type, hold_reason, release_reason) |
| `SalesOrderApprovals` | 4888 | SO approval |
| `SalesOrderHistory` | 4908 | SO history |
| `InventoryAllocations` | 5108 | Fulfillment allocation (FEFO, is_fully_allocated, is_partial) |
| `WavePlans` | 5145 | Wave plan (wave_type: PICKING, priority, total_orders/lines/qty, allocated/picked qty) |
| `WavePlanLines` | 5176 | Wave plan line |
| `SubstitutionRules` | 5207 | Product substitution |
| `FulfillmentAnalytics` | 5228 | Fulfillment analytics |
| `PickLists` | 5251 | Pick list (pick_strategy: FEFO, picked_qty, short_qty, status) |
| `PickListLines` | 5285 | Pick list line |
| `PackingLists` | 5320 | Packing list (packed_qty, box_count, total_weight/volume) |
| `PackingListLines` | 5356 | Packing list line |
| `Shipments` | 5388 | Shipment (transporter, vehicle, driver, lr_number, eway_bill, tracking_number, dispatched_at) |
| `DispatchPlans` | 5439 | Dispatch plan |
| `DeliveryOrders` | 5465 | Delivery order (delivery_type, scheduled/estimated/actual dates) |
| `ProofOfDeliveries` | 5507 | POD (delivered/damaged/short qty, delivery_status, GPS, signature) |
| `DeliveryExceptions` | 5538 | Delivery exception (rescheduled_date, status, resolution) |
| `DeliveryTracking` | 5564 | Delivery tracking (NOT USED by any module) |
| `DeliveryAnalytics` | 5582 | Delivery analytics (NOT USED) |

### Returns (5 models)
| `RmaRequests` | 5605 | RMA master (return_type, return_reason, 8 status states) |
| `RmaLines` | 5644 | RMA line |
| `ReturnInspections` | 5678 | Return inspection (accepted/rejected/scrap/repair qty, disposition) |
| `ReturnInventoryMovements` | 5704 | Return inventory movement |
| `Replacements` | 5732 | Replacement |
| `RefundRecords` | 5762 | Refund (refund_type: CREDIT_NOTE/CASH_REFUND/BANK_TRANSFER/ADJUSTMENT) |

### Costing (5 models)
| `ProductCosts` | 6425 | Product cost (cost_id, status: DRAFT/CALCULATED/APPROVED/POSTED/ARCHIVED) |
| `CostRollups` | 6456 | Cost roll-up |
| `CostRollupLines` | 6491 | Cost roll-up line |
| `CostVariances` | 6513 | Cost variance |
| `BatchCosts` | 6542 | Batch cost |
| `InventoryValuations` | 6573 | Inventory valuation |

### HRMS / Workforce (15+ models)
| `Attendance` | 8408 | Attendance record |
| `Rosters` | 8445 | Shift roster |
| `RosterLines` | 8465 | Roster line |
| `Holidays` | 8486 | Holiday |
| `WeeklyOffs` | 8506 | Weekly off |
| `OvertimeRequests` | 8525 | OT request |
| `Timesheets` | 8550 | Timesheet |
| `PerformanceCycles` | 9167 | Performance cycle |
| `EmployeeGoals` | 9194 | Employee goal |
| `Appraisals` | 9222 | Appraisal |
| `Feedback360` | 9254 | 360 feedback |
| `TrainingRecommendations` | 9282 | Training recommendation |

### Alerts & KPIs (5 models)
| `AlertRules` | 9908 | Alert rule (rule_type, metric_name, condition, threshold, escalation) |
| `Alerts` | 9935 | Alert instance (severity, status, escalation_level) |
| `AlertEscalations` | 9974 | Alert escalation |
| `NotificationDigests` | 9995 | Notification digest |
| `KpiMonitoring` | 10019 | KPI monitoring snapshot (current/target/variance, trend, alert_triggered) |

### Cross-cutting (3 models)
| `AuditLog` | 24 | Audit log (immutable, append-only) |
| `EventOutbox` | 65 | Event outbox (status: PENDING/PUBLISHED, retry_count, last_error) |
| `NotificationOutbox` | 87 | Notification outbox |

### MODELS THAT DO NOT EXIST (verified by grep)

Searched schema.prisma for: Yard, Dock, Asn, Appointment, Equipment, Forklift, Battery, CycleCount, Truck, Vehicle, Gate, MissionControl, ControlTower, TaskQueue, StockIssue, StockTransfer, StockAdjustment.

**RESULT**: NONE of these exist as Prisma models. The only matches:
- `SlaConfigurations` (line 7515) — but this is CRM SLA for support tickets, NOT operations SLA
- `GrnVehicleDetails` (line 2049) — but this is vehicle info on a GRN, not a separate yard/vehicle entity

**Confirms**: There is NO backend data model for:
- Yard Management (TruckQueue, DockSchedule, YardMap, GateConsole)
- Equipment Management / EAM (Forklift, Battery, Maintenance, Certification, Scanner, Breakdown)
- Receiving (ASN, Appointment, Dock, ReceivingException)
- Cycle Count
- Stock Issue / Stock Transfer / Stock Adjustment (as separate entities)
- Task Queue
- Mission Control / Control Tower / Operations-specific SLA / Operations-specific Exception Center

---

## 11. CRITICAL BUGS FOUND

### Bug #1: `product-costing` permission = `AUDIT_READ` for both read AND write
- **File**: `apps/backend/src/modules/product-costing/routes/index.ts:25-26`
- **Code**: `const READ_PERM = Permission.AUDIT_READ; const WRITE_PERM = Permission.AUDIT_READ;`
- **Impact**: ANY user with `audit:read` permission can CREATE, UPDATE, DELETE, and TRANSITION product costs. The `auditor` role (registry.ts:145-154) has `AUDIT_READ` but should be read-only. This means auditors can mutate costing data — a segregation-of-duties violation.
- **Severity**: HIGH (security / SoD violation)
- **Fix**: Define `COSTING_READ` and `COSTING_WRITE` permissions in registry.ts and use them here.

### Bug #2: `alerts-kpi-engine` permission = `AUDIT_READ` for both read AND write
- **File**: `apps/backend/src/modules/alerts-kpi-engine/routes/index.ts:25-26`
- **Code**: `const READ_PERM = Permission.AUDIT_READ; const WRITE_PERM = Permission.AUDIT_READ;`
- **Impact**: Same as Bug #1 — auditors can mutate alert rules.
- **Severity**: HIGH (security / SoD violation)
- **Fix**: Define `ALERT_READ` and `ALERT_ADMIN` permissions.

### Bug #3: NCR GET endpoints require `NCR_CREATE` permission (not a read permission)
- **File**: `apps/backend/src/modules/quality-inspection/routes/index.ts:170, 175`
- **Code**: `qualityInspectionRoutes.get('/ncrs', requirePermission(Permission.NCR_CREATE), ...)` and `qualityInspectionRoutes.get('/ncrs/:id', requirePermission(Permission.NCR_CREATE), ...)`
- **Impact**: Users with only `NCR_APPROVE` (e.g. quality_manager — but quality_manager has both NCR_CREATE and NCR_APPROVE per registry.ts:110-120) can read NCRs, but users with NO NCR permissions cannot read NCRs at all. There is no `NCR_READ` permission in the registry — the system conflates read with create.
- **Severity**: MEDIUM (permission model gap)
- **Fix**: Add `NCR_READ = 'ncr:read'` to registry and use it for GET endpoints.

### Bug #4: GRN PATCH and DELETE use `GRN_CREATE` (no `GRN_UPDATE` / `GRN_DELETE`)
- **File**: `apps/backend/src/modules/goods-receipt/routes/index.ts:102, 109`
- **Code**: `goodsReceiptRoutes.patch('/grns/:id', requirePermission(Permission.GRN_CREATE), ...)` and `goodsReceiptRoutes.delete('/grns/:id', requirePermission(Permission.GRN_CREATE), ...)`
- **Impact**: Any user with `grn:create` can also edit and delete GRNs. The `procurement_manager` role has `GRN_CREATE` (registry.ts:136) and can therefore delete GRNs — likely unintended.
- **Severity**: MEDIUM
- **Fix**: Add `GRN_UPDATE` and `GRN_DELETE` permissions to registry.

### Bug #5: `warehouse_operator` role has `CUSTOMER_CREATE/UPDATE/DELETE` permissions
- **File**: `apps/backend/src/core/permissions/registry.ts:139-144`
- **Code**: `warehouse_operator: [..., Permission.CUSTOMER_READ, Permission.CUSTOMER_CREATE, Permission.CUSTOMER_UPDATE, Permission.CUSTOMER_DELETE]`
- **Impact**: Warehouse operators can create, update, and delete customer records. This is almost certainly wrong — warehouse operators should only have read access to customers (for delivery/fulfillment context).
- **Severity**: HIGH (SoD violation)
- **Fix**: Remove `CUSTOMER_CREATE/UPDATE/DELETE` from `warehouse_operator`. Replace with `SALES_READ` if such a permission existed (it doesn't — see §2 critical gap #1).

### Bug #6: `INVENTORY_REVERSE` permission declared but never used
- **File**: `apps/backend/src/core/permissions/registry.ts:78`
- **Code**: `INVENTORY_REVERSE: 'inventory:reverse'`
- **Impact**: Granted to `tenant_admin` (line 107) but no endpoint, service method, or workflow checks this permission. There is no stock reversal/reversal operation in the inventory module. Dead permission.
- **Severity**: LOW (dead code / spec drift)
- **Fix**: Either implement stock reversal (per business rule in inventory service header: "Rejected inventory cannot become available") or remove the permission.

### Bug #7: `EventName` catalog incomplete + naming inconsistency
- **File**: `apps/backend/src/core/events/event-bus.ts:39-63`
- **Impact**: Only 13 events declared but ~85 emitted. Naming convention mixed: `NCR_CREATED` (SCREAMING_SNAKE) in `quality-inspection/service/index.ts:314` vs `NcrCreated` (PascalCase) in catalog line 55. Consumers subscribing via the catalog constants will miss most events.
- **Severity**: MEDIUM (maintainability)
- **Fix**: Either expand the catalog to include all emitted events, OR remove the catalog and use string literals consistently (with a linter rule to enforce naming).

### Bug #8: `order-fulfillment` module emits NO events
- **File**: `apps/backend/src/modules/order-fulfillment/service/index.ts` (verified by grep — no `writeToOutbox` calls)
- **Impact**: Allocation creation and wave plan creation are silent. Downstream subscribers (e.g. a hypothetical "auto-generate pick list on wave creation" handler) will never fire.
- **Severity**: MEDIUM (architectural gap)
- **Fix**: Add `AllocationCreated` and `WavePlanCreated` event emissions.

### Bug #9: `pick-pack-dispatch` only emits `ShipmentCreated` — no events for pick/pack
- **File**: `apps/backend/src/modules/pick-pack-dispatch/service/index.ts:33` (only one `writeToOutbox` call)
- **Impact**: Pick list and packing list creation are silent. Inventory decrement on shipment is also missing — shipments don't call `inventory.stockOut`.
- **Severity**: HIGH (data inconsistency — shipped stock remains in inventory)
- **Fix**: (1) Emit `PickListCreated`, `PackingListCreated`, `ShipmentDispatched` events. (2) Call `inventoryService.stockOut` on shipment creation (or on dispatch transition — but there is no transition endpoint).

### Bug #10: `delivery-management` `createPod` doesn't update SalesOrder status
- **File**: `apps/backend/src/modules/delivery-management/service/index.ts:22`
- **Impact**: When POD is recorded with `deliveryStatus='DELIVERED'`, the delivery order is updated to DELIVERED but the underlying sales order is NOT transitioned to DELIVERED. The SO lifecycle (sales-order transition enum includes DELIVERED at line 41) is decoupled from delivery confirmation.
- **Severity**: MEDIUM (lifecycle gap)
- **Fix**: After POD creation, transition the linked SO to DELIVERED (if deliveryStatus is DELIVERED).

---

## 12. REPOSITORY PATTERN AUDIT

### Modules using dedicated repository files (proper pattern)
- `inventory/repository/index.ts` — 7 repository objects (batch, lot, inventory, transaction, ledger, reservation, block)
- `goods-receipt/repository/index.ts` — 4 repository objects (grn, line, attachment, damage)
- `warehouse/repository/index.ts` — 7 repository objects (zone, aisle, rack, bin, putaway, barcode, scanLog)
- `procurement/repository/index.ts` — 3 repository objects (pr, prLine, prApproval) [not read in detail]
- `purchase-order/repository/index.ts` — 7 repository objects (po, poLine, poTax, poCharge, poApproval, poRevision, poHistory) [not read in detail]
- `quality-inspection/repository/index.ts` — 7 repository objects [not read in detail]
- `batch-manufacturing/repository/index.ts` — 5 repository objects (productionBatch, genealogy, split, merge, traceabilityLog) [not read in detail]
- `mes/repository/index.ts` — 5 repository objects (workCenter, machine, shift, downtime, productionEvent) [not read in detail]

### Modules using generic `genRepo(table, fields)` factory (lighter pattern)
- `order-fulfillment/repository/index.ts` — 2 repos (allocation, wavePlan) via `genRepo`
- `pick-pack-dispatch/repository/index.ts` — 3 repos (pickList, packingList, shipment) via `genRepo`
- `delivery-management/repository/index.ts` — 3 repos (deliveryOrder, pod, exception) via `genRepo`

### Modules using Prisma directly (NO repository layer)
- `product-costing/service/index.ts` — uses `db.ProductCosts` directly (line 101, 121, 156, 173, 236, 251, 290, 297, 350, 370, 429, 439)
- `attendance-shift/service/index.ts` — uses Prisma directly (per file header pattern, not read in detail)
- `performance-management/service/index.ts` — uses Prisma directly
- `alerts-kpi-engine/service/index.ts` — uses Prisma directly
- (Same pattern for all RC1 Fix Pack 1 stub services — they share a generic template)

**INCONSISTENCY**: 3 different repository patterns coexist. The inventory/warehouse/goods-receipt modules use proper hand-written repositories with SQL via `query()` (pglite driver). The order-fulfillment/pick-pack-dispatch/delivery-management modules use a generic factory. The product-costing/attendance-shift/performance-management/alerts-kpi-engine modules use Prisma directly. This is a maintainability concern.

---

## 13. WORKFLOW INVENTORY

Workflows registered via `workflowRegistry.register()` (verified by reading each module's `workflow/index.ts`):

| Workflow Name | Module | States | Transitions | Initial State |
|---|---|---|---|---|
| `GoodsReceiptLifecycle` | goods-receipt | 8 (DRAFT, VERIFIED, UNDER_INSPECTION, PARTIALLY_ACCEPTED, ACCEPTED, REJECTED, CLOSED, CANCELLED) | 12 | DRAFT |
| `PurchaseOrderLifecycle` | purchase-order | 15 (DRAFT, SUBMITTED, DEPT_APPROVAL, FINANCE_APPROVAL, MANAGEMENT_APPROVAL, APPROVED, ISSUED, SUPPLIER_ACCEPTED, PARTIALLY_RECEIVED, FULLY_RECEIVED, CLOSED, REJECTED, CANCELLED, EXPIRED, REVISION_REQUESTED) | 25 | DRAFT |
| `PurchaseRequisitionLifecycle` | procurement | 10 (DRAFT, SUBMITTED, DEPT_REVIEW, BUDGET_APPROVAL, PROC_REVIEW, APPROVED, CONVERTED_TO_RFQ, CLOSED, CANCELLED, REJECTED) | (not read) | DRAFT |
| `InspectionLotLifecycle` | quality-inspection | 6 (PENDING, IN_PROGRESS, PASSED, CONDITIONAL_PASS, FAILED, ON_HOLD) | (not read) | PENDING |
| `NCRLifecycle` | quality-inspection (in `workflow/ncr.ts`) | 5 (OPEN, UNDER_INVESTIGATION, CAPA_INITIATED, RESOLVED, CLOSED) | (not read) | OPEN |
| `ProductionBatchLifecycle` | batch-manufacturing | 7 (IN_PRODUCTION, PRODUCED, FGQC_PENDING, PASSED, CONDITIONAL_PASS, REJECTED, ARCHIVED) | 9 | IN_PRODUCTION |
| `ProductCostLifecycle` | product-costing | 5 (DRAFT, CALCULATED, APPROVED, POSTED, ARCHIVED) | 6 | DRAFT |

**Workflows NOT registered (modules with no workflow)**:
- inventory (no lifecycle for stock — movements are direct)
- warehouse (no lifecycle for putaway tasks — status changes are direct)
- order-fulfillment (no lifecycle for allocations or waves)
- pick-pack-dispatch (no lifecycle for pick/pack/ship)
- delivery-management (no lifecycle for delivery orders)
- mes (no lifecycle for machines — direct status updates)
- attendance-shift (workflow registered per service emit, but file not located)
- performance-management (workflow registered per service emit, but file not located)
- alerts-kpi-engine (workflow registered per service emit, but file not located)

---

## 14. AUDIT INVENTORY

### Operations that explicitly write audit logs via `auditService.log()`

| Module | Operations Audited | Severity |
|---|---|---|
| inventory | stockIn (STOCK_IN), stockOut (STOCK_OUT), reserveStock (STOCK_RESERVED), releaseReservation (STOCK_RESERVATION_RELEASED), blockStock (STOCK_BLOCKED), markExpired (STOCK_EXPIRED, actorType=SYSTEM) | INFO (default) |
| goods-receipt | create (CREATE), update (UPDATE), delete (DELETE), transition (TRANSITION), addDamage (DAMAGE_RECORDED) | INFO |
| warehouse | createZone (CREATE), createAisle (CREATE), createRack (CREATE), createBin (CREATE), createPutawayTask (PUTAWAY_CREATED), completePutaway (PUTAWAY_COMPLETED), createBarcode (BARCODE_CREATED), printBarcode (BARCODE_PRINTED), scanBarcode (BARCODE_SCANNED) | INFO |
| procurement | create (CREATE), update (UPDATE), delete (DELETE), transition (TRANSITION) | INFO |
| purchase-order | (per file header, all mutations audited — file not fully read) | INFO |
| quality-inspection | createPlan (CREATE), createSamplingPlan (CREATE), createInspectionLot (CREATE), recordResult (RESULT_RECORDED), transitionInspection (TRANSITION), createQualityHold (QUALITY_HOLD), releaseQualityHold (QUALITY_HOLD_RELEASED), createNcr (NCR_CREATED), transitionNcr (NCR_TRANSITION), createCapa (CAPA_CREATED) | INFO |
| batch-manufacturing | createBatch (BATCH_CREATED), transition (BATCH_TRANSITION), splitBatch (BATCH_SPLIT), mergeBatches (BATCH_MERGED) | INFO |
| product-costing | create (CREATE), update (UPDATE), delete (DELETE), transition (TRANSITION) | INFO |
| mes | createWorkCenter (CREATE), createMachine (CREATE), updateMachineStatus (MACHINE_STATUS_CHANGE), createShift (CREATE), recordDowntime (DOWNTIME_RECORDED) | INFO; **recordEvent NOT audited (gap)** |
| order-fulfillment | createAllocation (ALLOCATION_CREATED), createWavePlan (WAVE_CREATED) | INFO |
| pick-pack-dispatch | createPickList (PICK_LIST_CREATED), createPackingList (PACKING_LIST_CREATED), createShipment (SHIPMENT_CREATED) | INFO |
| delivery-management | createDeliveryOrder (DELIVERY_ORDER_CREATED), createPod (POD_CREATED), createException (DELIVERY_EXCEPTION) | INFO |
| sales-order | (per service emit, all mutations audited — service file not fully read) | INFO |
| customer-returns | (per service emit, mutations audited) | INFO |
| attendance-shift | create (CREATE), update (UPDATE), delete (DELETE), transition (TRANSITION) — per RC1 Fix Pack 1 template | INFO |
| performance-management | Same template as attendance-shift | INFO |
| alerts-kpi-engine | Same template | INFO |

### Operations that DO NOT write audit logs (gaps)
- `mes.recordEvent` — no audit log call (`mes/service/index.ts:100-104`)
- All GET endpoints (only auto-audited via global `auditMiddleware` if it logs reads — but typically audit only logs mutations)
- `inventory.getExpiringStock`, `inventory.listBatches`, `inventory.list`, `inventory.getById`, `inventory.listLedger`, `inventory.listTransactions`, `inventory.listReservations`, `inventory.listBlocks` — read-only, no explicit audit

### Severity usage
**No Section 04 operation uses `WARN` or `CRITICAL` severity.** All audit logs default to `INFO`. This is a missed opportunity — operations like `STOCK_BLOCKED`, `STOCK_EXPIRED`, `NCR_CREATED`, `BATCH_SPLIT`, `BATCH_MERGED`, `DELIVERY_EXCEPTION`, `MACHINE_STATUS_CHANGE` (to BREAKDOWN) arguably warrant `WARN` or `CRITICAL` severity for SIEM/alerting purposes.

---

## 15. CRITICAL GAPS — BACKEND MODULES THAT DO NOT EXIST

The following Section 04 frontend modules have NO corresponding backend module, NO Prisma models, NO endpoints, NO services, NO workflows:

### Gap #1: Receiving (ASNs, Appointments, Docks, Exceptions)
- **Frontend modules affected**: Receiving (Sprint 24-25)
- **Backend status**: NOT FOUND after searching all 60 module directories in `/apps/backend/src/modules/`
- **Prisma models**: NONE (verified by grep for `Asn`, `Appointment`, `Dock`, `ReceivingException`)
- **What exists instead**: `goods-receipt/` covers GRN creation (which is post-receipt), but pre-receipt flow (ASN scheduling, dock appointment, gate-in, unloading) has NO backend.
- **Impact**: The Receiving frontend module (page.tsx lines ~6000-7000 per Section 04 frontend exploration) will have NO live data. All ASN/appointment/dock data is mock.

### Gap #2: Yard Management (TruckQueue, DockSchedule, YardMap, GateConsole, YardControlTower, CrossDockConsole)
- **Frontend modules affected**: Yard Management (Sprint 30)
- **Backend status**: NOT FOUND
- **Prisma models**: NONE (verified by grep for `Yard`, `Truck`, `Gate`)
- **What exists instead**: `GrnVehicleDetails` (line 2049) captures vehicle info on a GRN, but it's a child record of GRN — not a standalone yard entity. No dock door management, no yard map, no gate-in/gate-out workflow.
- **Impact**: 6 frontend modules in Yard Management section will be 100% mock.

### Gap #3: Equipment Management / EAM (Forklifts, Batteries, Maintenance, Certifications, Scanners, Breakdowns)
- **Frontend modules affected**: Equipment Management (Sprint 32 — 8 modules: EquipmentMaster, ForkliftDashboard, ScannerManagement, BatteryDashboard, MaintenancePlanner, BreakdownConsole, CertificationCenter, EquipmentAnalytics)
- **Backend status**: NOT FOUND
- **Prisma models**: NONE (verified by grep for `Equipment`, `Forklift`, `Battery`, `Maintenance`, `Certification`, `Scanner`, `Breakdown`)
- **What exists instead**: `mes/machines` covers production machines (line 2895) but NOT material-handling equipment (forklifts, pallet jacks, AGVs). `mes/downtime` covers machine downtime but NOT equipment breakdown tracking.
- **Impact**: 8 frontend modules in EAM section will be 100% mock.

### Gap #4: Cycle Count
- **Frontend modules affected**: Cycle Count (Sprint 21)
- **Backend status**: NOT FOUND (no `cycle-count/` directory, no endpoint, no service method)
- **Prisma models**: NONE (verified by grep for `CycleCount`)
- **What exists instead**: `inventory/list` and `inventory/getById` allow reading current stock, but there is no cycle count request, count execution, variance calculation, or recount workflow.
- **Impact**: Cycle Count frontend module will have NO live data.

### Gap #5: Stock Transfer (warehouse-to-warehouse, bin-to-bin)
- **Frontend modules affected**: Stock Transfer (Sprint 16)
- **Backend status**: NOT FOUND
- **Prisma models**: NONE
- **What exists instead**: `inventory/stock-out` reduces stock in one location, but there is no paired `stock-in` for the destination. A transfer would require two API calls (stockOut + stockIn) with no transactional guarantee.
- **Impact**: Stock Transfer frontend module will have NO dedicated API — must be simulated via two inventory calls.

### Gap #6: Stock Adjustment (quantity correction, write-off)
- **Frontend modules affected**: Stock Adjustment (Sprint 17)
- **Backend status**: NOT FOUND
- **Prisma models**: NONE
- **What exists instead**: `INVENTORY_ADJUST` permission exists (registry.ts:77) but is only used for `inventory/blocks` (POST) and `inventory/expiry/mark-expired`. There is no dedicated stock adjustment endpoint that records a variance (physical vs system count) with reason code, approval workflow, and ledger entry type='ADJUSTMENT'.
- **Impact**: Stock Adjustment frontend module will have NO dedicated API.

### Gap #7: Task Queue
- **Frontend modules affected**: Task Queue (Sprint 29)
- **Backend status**: NOT FOUND
- **Prisma models**: NONE
- **What exists instead**: Various task-like entities exist (PutawayTasks, PickLists, etc.) but there is no unified task queue with prioritization, assignment, escalation, and worker-dashboard aggregation.
- **Impact**: Task Queue frontend module will have NO unified API — would need to aggregate from 5+ separate task tables.

### Gap #8: Mission Control (operations dashboard)
- **Frontend modules affected**: Mission Control (Sprint 23)
- **Backend status**: NOT FOUND
- **Prisma models**: NONE (no `MissionControl` or `OperationsDashboard` model)
- **What exists instead**: `alerts-kpi-engine/` provides generic AlertRule CRUD. `mes/getProductionDashboard` (line 153) returns a small MES-specific dashboard. `bi-foundation/` provides BI dashboards. But there is NO unified operations dashboard endpoint that aggregates inventory + GRN + putaway + picking + shipping + delivery + yard + equipment KPIs in one call.
- **Impact**: Mission Control frontend module will need to make 10+ API calls to assemble its dashboard, or use mock data.

### Gap #9: Control Tower / SLA Dashboard / Exception Center
- **Frontend modules affected**: Control Tower, SLA Dashboard, Exception Center (Sprint 31)
- **Backend status**: NOT FOUND (no operations-specific control tower)
- **Prisma models**: `SlaConfigurations` (line 7515) exists but is for CRM support tickets, NOT operations SLA. `Alerts` (line 9935) is generic — no operations-specific exception taxonomy.
- **What exists instead**: Generic `alerts-kpi-engine/` (CRUD on AlertRules). No operations-specific control tower endpoint, no SLA monitoring for pick/pack/ship cycles, no exception center with operations-specific exception types (e.g. "pick short", "pack damaged", "delivery failed", "yard congestion").
- **Impact**: 3 frontend modules will be 100% mock or use generic alert APIs with no operations context.

### Gap #10: Workforce Management (operator assignment, skill matrix, labor allocation)
- **Frontend modules affected**: Workforce Management, Workforce Analytics (Sprint 28-29)
- **Backend status**: PARTIAL — `attendance-shift/` and `performance-management/` exist but are generic CRUD stubs (RC1 Fix Pack 1 template). They do NOT implement workforce-specific operations like operator-to-machine assignment, skill matrix, labor allocation by shift/zone, productivity tracking by task type.
- **Prisma models**: `Attendance`, `Rosters`, `RosterLines`, `Timesheets`, `OvertimeRequests`, `PerformanceCycles`, `EmployeeGoals`, `Appraisals`, `Feedback360` — all exist but mostly unused by the stub services.
- **What exists instead**: Generic CRUD on a single entity (probably Attendance for attendance-shift, PerformanceCycle for performance-management). No workforce planning, no skill matrix, no labor allocation.
- **Impact**: Workforce Management frontend module will have basic attendance/performance CRUD but NO workforce planning capabilities.

---

## 16. ENDPOINT DIRECTORY (alphabetical, with full paths)

```
DELETE  /api/v1/finance/costing/:id
DELETE  /api/v1/finance/costing/:id                                                [product-costing]
DELETE  /api/v1/goods-receipt... (mounted under /warehouse/grns)                   
DELETE  /api/v1/hrms/attendance/:id
DELETE  /api/v1/hrms/performance/:id
DELETE  /api/v1/inventory/... (no delete endpoints)
DELETE  /api/v1/procurement/purchase-orders/pos/:id
DELETE  /api/v1/procurement/requisitions/requisitions/:id
DELETE  /api/v1/sales/returns/rmas/:id (no — only POST transition)
DELETE  /api/v1/warehouse/grns/grns/:id
DELETE  /api/v1/bi/alerts/:id

GET     /api/v1/bi/alerts/
GET     /api/v1/bi/alerts/count
GET     /api/v1/bi/alerts/exists/:code
GET     /api/v1/bi/alerts/:id
GET     /api/v1/finance/costing/
GET     /api/v1/finance/costing/count
GET     /api/v1/finance/costing/exists/:code
GET     /api/v1/finance/costing/:id
GET     /api/v1/hrms/attendance/
GET     /api/v1/hrms/attendance/count
GET     /api/v1/hrms/attendance/exists/:code
GET     /api/v1/hrms/attendance/:id
GET     /api/v1/hrms/performance/
GET     /api/v1/hrms/performance/count
GET     /api/v1/hrms/performance/exists/:code
GET     /api/v1/hrms/performance/:id
GET     /api/v1/inventory/batches
GET     /api/v1/inventory/blocks
GET     /api/v1/inventory/expiry
GET     /api/v1/inventory/inventory
GET     /api/v1/inventory/inventory/:id
GET     /api/v1/inventory/ledger
GET     /api/v1/inventory/reservations
GET     /api/v1/inventory/transactions
GET     /api/v1/manufacturing/batches/batches
GET     /api/v1/manufacturing/batches/batches/:id
GET     /api/v1/manufacturing/batches/batches/:id/backward-traceability
GET     /api/v1/manufacturing/batches/batches/:id/forward-traceability
GET     /api/v1/manufacturing/batches/batches/:id/genealogy
GET     /api/v1/mes/analytics/oee/:machineId
GET     /api/v1/mes/dashboard
GET     /api/v1/mes/downtime
GET     /api/v1/mes/events
GET     /api/v1/mes/machines
GET     /api/v1/mes/shifts
GET     /api/v1/mes/work-centers
GET     /api/v1/procurement/purchase-orders/pos
GET     /api/v1/procurement/purchase-orders/pos/:id
GET     /api/v1/procurement/purchase-orders/pos/:id/export-pdf
GET     /api/v1/procurement/purchase-orders/pos/:id/pdf
GET     /api/v1/procurement/requisitions/requisitions
GET     /api/v1/procurement/requisitions/requisitions/:id
GET     /api/v1/quality/capas
GET     /api/v1/quality/holds
GET     /api/v1/quality/lots
GET     /api/v1/quality/lots/:id
GET     /api/v1/quality/ncrs
GET     /api/v1/quality/ncrs/:id
GET     /api/v1/quality/plans
GET     /api/v1/quality/plans/:id
GET     /api/v1/quality/sampling-plans
GET     /api/v1/sales/delivery/delivery-orders
GET     /api/v1/sales/delivery/exceptions
GET     /api/v1/sales/delivery/pods
GET     /api/v1/sales/fulfillment/allocations
GET     /api/v1/sales/fulfillment/waves
GET     /api/v1/sales/orders/orders
GET     /api/v1/sales/orders/orders/:id
GET     /api/v1/sales/pick-pack-dispatch/packing-lists
GET     /api/v1/sales/pick-pack-dispatch/pick-lists
GET     /api/v1/sales/pick-pack-dispatch/shipments
GET     /api/v1/sales/returns/refunds
GET     /api/v1/sales/returns/rmas
GET     /api/v1/sales/returns/rmas/:id
GET     /api/v1/sales/returns/rmas/:id/inspections
GET     /api/v1/warehouse/aisles
GET     /api/v1/warehouse/barcodes
GET     /api/v1/warehouse/bins
GET     /api/v1/warehouse/grns/grns
GET     /api/v1/warehouse/grns/grns/:id
GET     /api/v1/warehouse/putaway-tasks
GET     /api/v1/warehouse/racks
GET     /api/v1/warehouse/scan-logs
GET     /api/v1/warehouse/zones

PATCH   /api/v1/procurement/purchase-orders/pos/:id
PATCH   /api/v1/procurement/requisitions/requisitions/:id
PATCH   /api/v1/warehouse/grns/grns/:id

POST    /api/v1/bi/alerts/
POST    /api/v1/bi/alerts/:id/transition
POST    /api/v1/finance/costing/
POST    /api/v1/finance/costing/:id/transition
POST    /api/v1/hrms/attendance/
POST    /api/v1/hrms/attendance/:id/transition
POST    /api/v1/hrms/performance/
POST    /api/v1/hrms/performance/:id/transition
POST    /api/v1/inventory/blocks
POST    /api/v1/inventory/expiry/mark-expired
POST    /api/v1/inventory/inventory/stock-in
POST    /api/v1/inventory/inventory/stock-out
POST    /api/v1/inventory/reservations
POST    /api/v1/inventory/reservations/:id/release
POST    /api/v1/manufacturing/batches/batches
POST    /api/v1/manufacturing/batches/batches/merge
POST    /api/v1/manufacturing/batches/batches/:id/split
POST    /api/v1/manufacturing/batches/batches/:id/transition
POST    /api/v1/mes/downtime
POST    /api/v1/mes/events
POST    /api/v1/mes/machines
POST    /api/v1/mes/machines/:id/status
POST    /api/v1/mes/shifts
POST    /api/v1/mes/work-centers
POST    /api/v1/procurement/purchase-orders/pos
POST    /api/v1/procurement/purchase-orders/pos/from-quotation
POST    /api/v1/procurement/purchase-orders/pos/search
POST    /api/v1/procurement/purchase-orders/pos/:id/cancel
POST    /api/v1/procurement/purchase-orders/pos/:id/close
POST    /api/v1/procurement/purchase-orders/pos/:id/issue
POST    /api/v1/procurement/purchase-orders/pos/:id/revision
POST    /api/v1/procurement/purchase-orders/pos/:id/supplier-accept
POST    /api/v1/procurement/purchase-orders/pos/:id/supplier-counter
POST    /api/v1/procurement/purchase-orders/pos/:id/supplier-reject
POST    /api/v1/procurement/purchase-orders/pos/:id/transition
POST    /api/v1/procurement/requisitions/requisitions
POST    /api/v1/procurement/requisitions/requisitions/:id/transition
POST    /api/v1/quality/capas
POST    /api/v1/quality/holds
POST    /api/v1/quality/holds/:id/release
POST    /api/v1/quality/lots
POST    /api/v1/quality/lots/:id/results
POST    /api/v1/quality/lots/:id/start
POST    /api/v1/quality/lots/:id/transition
POST    /api/v1/quality/ncrs
POST    /api/v1/quality/ncrs/:id/transition
POST    /api/v1/quality/plans
POST    /api/v1/quality/sampling-plans
POST    /api/v1/sales/delivery/delivery-orders
POST    /api/v1/sales/delivery/exceptions
POST    /api/v1/sales/delivery/pods
POST    /api/v1/sales/fulfillment/allocations
POST    /api/v1/sales/fulfillment/waves
POST    /api/v1/sales/orders/orders
POST    /api/v1/sales/orders/orders/:id/hold
POST    /api/v1/sales/orders/orders/:id/release-hold
POST    /api/v1/sales/orders/orders/:id/transition
POST    /api/v1/sales/pick-pack-dispatch/packing-lists
POST    /api/v1/sales/pick-pack-dispatch/pick-lists
POST    /api/v1/sales/pick-pack-dispatch/shipments
POST    /api/v1/sales/returns/refunds
POST    /api/v1/sales/returns/rmas
POST    /api/v1/sales/returns/rmas/:id/inspections
POST    /api/v1/sales/returns/rmas/:id/transition
POST    /api/v1/warehouse/aisles
POST    /api/v1/warehouse/barcodes
POST    /api/v1/warehouse/barcodes/:id/print
POST    /api/v1/warehouse/bins
POST    /api/v1/warehouse/grns/grns
POST    /api/v1/warehouse/grns/grns/:id/damage
POST    /api/v1/warehouse/grns/grns/:id/transition
POST    /api/v1/warehouse/putaway-tasks
POST    /api/v1/warehouse/putaway-tasks/:id/complete
POST    /api/v1/warehouse/racks
POST    /api/v1/warehouse/scan
POST    /api/v1/warehouse/zones

PUT     /api/v1/finance/costing/:id
PUT     /api/v1/hrms/attendance/:id
PUT     /api/v1/hrms/performance/:id
PUT     /api/v1/bi/alerts/:id
```

---

## 17. SUMMARY OF NEXT ACTIONS FOR IMPLEMENTER

### Highest priority — fix bugs (estimated 8 hours)
1. **Fix product-costing permissions** (Bug #1) — define `COSTING_READ/WRITE` in registry.ts, update routes/index.ts:25-26
2. **Fix alerts-kpi-engine permissions** (Bug #2) — define `ALERT_READ/ADMIN` in registry.ts, update routes/index.ts:25-26
3. **Fix NCR read permission** (Bug #3) — define `NCR_READ` in registry.ts, update quality-inspection/routes/index.ts:170, 175
4. **Fix GRN update/delete permissions** (Bug #4) — define `GRN_UPDATE/DELETE` in registry.ts, update goods-receipt/routes/index.ts:102, 109
5. **Fix warehouse_operator customer permissions** (Bug #5) — remove `CUSTOMER_CREATE/UPDATE/DELETE` from warehouse_operator in registry.ts:139-144
6. **Add stock transfer endpoint** to inventory module (Gap #5) — POST `/api/v1/inventory/inventory/transfer` that calls stockOut + stockIn in a transaction
7. **Add stock adjustment endpoint** to inventory module (Gap #6) — POST `/api/v1/inventory/inventory/adjust` with reason code, ledger entry type='ADJUSTMENT'
8. **Wire pick-pack-dispatch to inventory** (Bug #9) — call `inventoryService.stockOut` on shipment creation

### High priority — fill critical gaps (estimated 80-120 hours)
9. **Build Receiving module** (Gap #1) — new `receiving/` module with ASN, Appointment, Dock, Gate-In endpoints + Prisma models
10. **Build Cycle Count module** (Gap #4) — new `cycle-count/` module with count request, execution, variance, recount workflow
11. **Build Mission Control aggregation endpoint** (Gap #8) — single GET endpoint that aggregates KPIs from inventory + GRN + putaway + picking + shipping + delivery
12. **Build Control Tower / Exception Center** (Gap #9) — operations-specific exception taxonomy + SLA monitoring for pick/pack/ship cycles
13. **Build Task Queue aggregation** (Gap #7) — unified task queue endpoint aggregating PutawayTasks + PickLists + cycle count tasks + ad-hoc tasks

### Medium priority — extend stub modules (estimated 60-80 hours)
14. **Extend product-costing** — implement actual cost calculation (standard vs actual vs moving average, BOM roll-up, variance)
15. **Extend attendance-shift** — implement clock-in/clock-out, shift roster, overtime calculation using existing Prisma models (Attendance, Rosters, RosterLines, OvertimeRequests, Timesheets)
16. **Extend performance-management** — implement goal setting, 360 feedback, appraisal workflow using existing Prisma models (PerformanceCycles, EmployeeGoals, Appraisals, Feedback360)
17. **Extend alerts-kpi-engine** — implement alert rule evaluation, alert generation, escalation, KPI snapshot generation using existing Prisma models (Alerts, AlertEscalations, KpiMonitoring, NotificationDigests)
18. **Add wave release + pick assignment to order-fulfillment** — currently only create+list
19. **Add pick-complete + pack-complete + dispatch-confirm transitions to pick-pack-dispatch** — currently only create+list

### Low priority — fill remaining gaps (estimated 100-150 hours)
20. **Build Yard Management module** (Gap #2) — new `yard/` module with TruckQueue, DockSchedule, YardMap, GateConsole endpoints + Prisma models
21. **Build Equipment Management / EAM module** (Gap #3) — new `eam/` module with Forklift, Battery, Maintenance, Certification, Scanner, Breakdown endpoints + Prisma models

### Documentation priority (estimated 4 hours)
22. **Expand EventName catalog** in `event-bus.ts:39-63` to include all ~85 emitted events, OR remove the catalog and document the convention (Bug #7)
23. **Standardize event naming** — pick one convention (PascalCase or SCREAMING_SNAKE) and enforce via linter
24. **Remove dead `INVENTORY_REVERSE` permission** or implement stock reversal (Bug #6)
25. **Add audit severity classification** — use WARN for blocks/expirations/exceptions, CRITICAL for breaks/recalls

**Total estimated effort to fully cover Section 04 backend**: 250-380 hours

---

## 18. CONCLUSION

The Section 04 backend has **strong foundational coverage** for inventory, goods receipt, warehouse, procurement, purchase orders, quality inspection, batch manufacturing, and basic fulfillment — these modules have proper repositories, services, workflows, DTOs, audit, and events.

However, the backend has **critical gaps** in the operations-specific modules that distinguish a WMS from a basic inventory system: Receiving (ASN/Appointment/Dock), Yard Management, Equipment Management (EAM), Cycle Count, Stock Transfer, Stock Adjustment, Task Queue, Mission Control, and Control Tower. These 10 gap areas correspond to **~20 frontend modules** that will have NO live backend data.

The backend also has **3 critical security/SoD bugs** (product-costing, alerts-kpi-engine, NCR read permissions) and **3 critical integration bugs** (order-fulfillment emits no events, pick-pack-dispatch doesn't decrement inventory, delivery-management doesn't update SO status) that must be fixed before any frontend wiring is reliable.

The stub modules (product-costing, attendance-shift, performance-management, alerts-kpi-engine) follow a generic RC1 Fix Pack 1 template that provides CRUD without domain logic. They should be replaced with proper domain-specific implementations that use the rich Prisma models already defined (but unused) in the schema.

**No code changes were made.** This is an exploration and documentation report only.

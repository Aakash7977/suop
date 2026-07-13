# Section 04 — Frontend Exploration (Operations / WMS PART 4)

**Task ID:** SECTION04-FE-EXPLORE
**Agent:** Explore sub-agent
**Date:** Session continuation
**Source file:** `/home/z/my-project/src/app/page.tsx` (37,620 lines)
**Section 04 line span:** 4044–14241 (10,198 lines, 40 module components)

---

## §0. Section 04 Identification

### Sidebar group
The sidebar declaration appears at `src/app/page.tsx:191-235` (group name: **`'Operations (Sprint 12+) — PART 4'`**).

This is the FIRST major sidebar group AFTER the Master Data group (`'Master Data (Sprint 6-11) — PART 2 COMPLETE'`, lines 172-181, already covered by Section 03).

Section 03 already covered two of the Operations items (Warehouse @ line 8072 and Warehouse Locations @ line 8513 — extracted to `src/sections/03-master-data/components/warehouse.tsx` and `warehouse-locations.tsx`). The remaining 40 modules listed in this Operations sidebar group form the scope of **Section 04**.

### Section 04 modules — confirmed via grep `^function \w+Module\b` in page.tsx

| #  | Component                              | Lines      | LOC  | Sprint |
|----|----------------------------------------|------------|------|--------|
| 1  | InventoryModule                        | 4044–4482  | 439  | 12     |
| 2  | GoodsReceiptModule                     | 4483–4808  | 326  | 13     |
| 3  | StockIssueModule                       | 4809–5122  | 314  | 14     |
| 4  | StockTransferModule                    | 5123–5345  | 223  | 15     |
| 5  | AdjustmentModule                       | 5346–5664  | 319  | 16     |
| 6  | ReservationModule                      | 5665–6026  | 362  | 17     |
| 7  | CycleCountModule                       | 6027–6381  | 355  | 18     |
| 8  | BatchExpiryModule                      | 6382–6909  | 528  | 19     |
| 9  | CostingModule                          | 6910–7480  | 571  | 20     |
| 10 | MissionControlModule                   | 7481–8071  | 591  | 21     |
| 11 | WarehouseModule (Section 03 — skipped) | 8072–8512  | 441  | 22     |
| 12 | WarehouseLocationModule (Sec 03)       | 8513–8974  | 462  | 23     |
| 13 | ReceivingModule                        | 8975–9410  | 436  | 24     |
| 14 | PutawayModule                          | 9411–9970  | 560  | 25     |
| 15 | FulfillmentModule                      | 9971–10605 | 635  | 26     |
| 16 | DispatchModule                         | 10606–11114| 509  | 27     |
| 17 | WavePlanningModule                     | 11214–11440| 227  | 28     |
| 18 | TaskQueueModule                        | 11441–11569| 129  | 28     |
| 19 | WorkforceModule                        | 11570–11713| 144  | 28     |
| 20 | EquipmentModule                        | 11714–11795| 82   | 28     |
| 21 | ControlTowerModule                     | 11796–11973| 178  | 28     |
| 22 | SLADashboardModule                     | 11974–12081| 108  | 28     |
| 23 | ExceptionCenterModule                  | 12082–12190| 109  | 28     |
| 24 | WorkforceAnalyticsModule               | 12191–12340| 150  | 28     |
| 25 | CrossDockConsoleModule                 | 12341–12474| 134  | 29     |
| 26 | TruckQueueModule                       | 12475–12570| 96   | 30     |
| 27 | DockScheduleModule                     | 12571–12668| 98   | 30     |
| 28 | YardMapModule                          | 12669–12772| 104  | 30     |
| 29 | VehicleTrackerModule                   | 12773–12839| 67   | 30     |
| 30 | GateConsoleModule                      | 12840–12969| 130  | 30     |
| 31 | YardControlTowerModule                 | 12970–13084| 115  | 30     |
| 32 | CrossDockAnalyticsModule               | 13085–13263| 179  | 31     |
| 33 | EquipmentMasterModule                  | 13264–13379| 116  | 32     |
| 34 | ForkliftDashboardModule                | 13380–13483| 104  | 32     |
| 35 | ScannerManagementModule                | 13484–13603| 120  | 32     |
| 36 | BatteryDashboardModule                 | 13604–13715| 112  | 32     |
| 37 | MaintenancePlannerModule               | 13716–13882| 167  | 32     |
| 38 | BreakdownConsoleModule                 | 13883–13971| 89   | 32     |
| 39 | CertificationCenterModule              | 13972–14066| 95   | 32     |
| 40 | EquipmentAnalyticsModule               | 14067–14241| 175  | 32     |

**Total Section 04 LOC (excluding Warehouse + WarehouseLocation which are Section 03):** ~9,295 lines

---

## §1. Universal Findings (apply to ALL 40 Section 04 modules)

### 1.1 ZERO API integration
Grep across the entire Section 04 line range (`4044–14241`) confirms:
- `fetch(` calls: **0**
- `apiClient.` references: **0**
- `API_BASE` references: **0**
- `useEffect` calls: **0** (so no data loading on mount)
- `isDemoMode` references: **0**
- Any `/api/v1/...` URLs: **0**

**Conclusion:** Every Section 04 module is a 100% static mock dashboard. There is no live data anywhere in the section.

### 1.2 ZERO permission / RBAC gating
- `hasPermission(` calls: **0**
- `useAuthStore` references: **0**
- No auth-aware UI hiding, no `auth:manage_users` / `inventory:read` / `warehouse:write` checks.

### 1.3 ZERO toast/notification feedback
- `toast(` calls: **0**
- `pushToast(` calls: **0**

**Conclusion:** All buttons across Section 04 are "dead" — clicking them produces NO visible feedback. Buttons render correctly but their onClick handlers either (a) do not exist, or (b) only toggle local UI state (e.g. `setShowCreate(!showCreate)`).

### 1.4 Shared helper functions (defined in page.tsx)
- `S28_WAREHOUSES = ['WH-MUM-MAIN', 'WH-DEL-NORTH', 'WH-BLR-CENTRAL', 'WH-HYD-WEST']` (line 11154)
- `S28_ZONES = ['A-Receiving', 'B-Bulk', 'C-Picking', 'D-Pack', 'E-Dispatch', 'F-Cold']` (line 11155)
- `s28BadgeForStatus(status: string): { cls: string; label: string }` (line 11157) — 40+ entry status→badge lookup table (DRAFT, RELEASED, IN_PROGRESS, COMPLETED, CANCELLED, ON_HOLD, OPEN, ASSIGNED, ACCEPTED, PAUSED, FAILED, ESCALATED, AVAILABLE, IN_USE, CHARGING, MAINTENANCE, OUT_OF_SERVICE, ACTIVE, INACTIVE, ON_LEAVE, PRESENT, LATE, ABSENT, SCHEDULED, WARNING, MINOR, MAJOR, CRITICAL, MEDIUM, LOW, HIGH, EMERGENCY, etc.)
- `s28PriorityBadge(priority: string): string` (line 11203) — returns Tailwind class string for priority badges

These helpers are reused across all Sprint 28-32 modules (WavePlanning through EquipmentAnalytics).

### 1.5 Module-level mock data constants (declared OUTSIDE component functions)
30 named arrays at module top-level:

| Constant name                | Line  | Used by               |
|------------------------------|-------|-----------------------|
| WHM_WAREHOUSES               | 3982  | Warehouse (Sec 03)    |
| WHM_ZONES                    | 3991  | Warehouse (Sec 03)    |
| WHM_TEMP_ZONES               | 4004  | Warehouse (Sec 03)    |
| WHM_RULES                    | 4011  | Warehouse (Sec 03)    |
| WHM_RECOMMENDED              | 4019  | Warehouse (Sec 03)    |
| WH_LOC_AISLES                | 4408  | WarehouseLoc (Sec 03) |
| WH_LOC_RACKS                 | 4417  | WarehouseLoc (Sec 03) |
| WH_LOC_BINS                  | 4428  | WarehouseLoc (Sec 03) |
| WH_LOC_CAPACITY_LOGS         | 4446  | WarehouseLoc (Sec 03) |
| RECV_ASNS                    | 4895  | Receiving             |
| RECV_APPOINTMENTS            | 4904  | Receiving             |
| RECV_GATE_ENTRIES            | 4911  | Receiving             |
| RECV_DOCKS                   | 4917  | Receiving             |
| RECV_EXCEPTIONS              | 4925  | Receiving             |
| PUTAWAY_TASKS                | 5336  | Putaway               |
| PUTAWAY_RULES                | 5345  | Putaway               |
| WAREHOUSE_PALLETS            | 5353  | Putaway               |
| FORKLIFT_TASKS_DATA          | 5360  | Putaway               |
| PICKING_TASKS_DATA           | 5874  | Fulfillment           |
| PACKING_STATIONS_DATA        | 5883  | Fulfillment           |
| PACKING_JOBS_DATA            | 5889  | Fulfillment           |
| CARTON_TYPES_DATA            | 5896  | Fulfillment           |
| CARTONS_DATA                 | 5902  | Fulfillment           |
| SHIPPING_LABELS_DATA         | 5910  | Fulfillment           |
| PICKING_STRATEGIES           | 5917  | Fulfillment           |
| DISPATCH_ORDERS_DATA         | 6529  | Dispatch              |
| DISPATCH_VEHICLES_DATA       | 6538  | Dispatch              |
| SHIPPING_DOCUMENTS_DATA      | 6546  | Dispatch              |
| VEHICLE_SEALS_DATA           | 6553  | Dispatch              |
| GATE_EXIT_LOGS_DATA          | 6558  | Dispatch              |

Additionally, **every Section 04 component declares dozens of inline mock data arrays inside its tab sub-functions** (e.g. `const transactions = [...]`, `const grns = [...]`, `const issues = [...]`). These inline arrays together hold 200+ mock records across the section.

### 1.6 Two module patterns observed

**Pattern A — Hero + Tabs + Tables (16 modules):**
Used by Inventory, GoodsReceipt, StockIssue, StockTransfer, Adjustment, Reservation, CycleCount, BatchExpiry, Costing, MissionControl, Receiving, Putaway, Fulfillment, Dispatch (and partially Warehouse/WarehouseLocation in Sec 03).

Each follows this skeleton:
```tsx
function XxxModule() {
  const [tab, setTab] = useState<XxxTab>('overview')
  const tabs: Array<{ key: XxxTab; label: string; icon: React.ReactNode }> = [...]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r ... text-white border-0">
        <h2>... Title ...</h2>
        <p>... Subtitle ...</p>
        <Badge>Sprint XX · Part N</Badge>
      </Card>
      <Card>... Receiving-flow / Architecture-principle card ...</Card>
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map(t => <button onClick={() => setTab(t.key)} ...>{t.icon}{t.label}</button>)}
      </div>
      {tab === 'overview' && <XxxOverviewTab />}
      {tab === '...' && <XxxListTab />}
      ... etc ...
    </div>
  )
}
```

**Pattern B — Standalone Dashboard (24 modules):**
Used by WavePlanning, TaskQueue, Workforce, Equipment, ControlTower, SLADashboard, ExceptionCenter, WorkforceAnalytics, CrossDockConsole, TruckQueue, DockSchedule, YardMap, VehicleTracker, GateConsole, YardControlTower, CrossDockAnalytics, EquipmentMaster, ForkliftDashboard, ScannerManagement, BatteryDashboard, MaintenancePlanner, BreakdownConsole, CertificationCenter, EquipmentAnalytics.

Each is a single function returning one large dashboard with:
1. Header (title + subtitle + 1–3 action buttons)
2. KPI stat cards (grid 2/3/4/6)
3. Workflow diagram OR Alerts OR Live indicator
4. Main data table OR grid of cards
5. Optional Create dialog (only in WavePlanning, CrossDockConsole, EquipmentMaster, GateConsole — and even these have NO submit handler, just renders a panel)

### 1.7 Imports used by Section 04
At the top of page.tsx (lines 1-44):
- React: `useState`, `useEffect` (only `useState` is used in Section 04 — `useEffect` is imported for the Dashboard/Org/RBAC modules above)
- lucide-react: 100+ icons imported in a single destructured import (lines 4-33). Section 04 uses ~70 distinct icons across modules.
- shadcn/ui: `Button`, `Card`, `Input`, `Label`, `Badge`, `Separator`, `ScrollArea`, `Switch` (NOT `Tabs`, `Table`, `Select`, `Dialog`, `Form`, `Pagination` — these exist in `src/components/ui/` but Section 04 builds raw HTML)
- `useAuthStore` from `@/stores/auth-store` (imported but NEVER called by Section 04)
- `cn` from `@/lib/utils`

**Section 04 does NOT import from `@/modules/*` at all** — it ignores the existing modular components and API clients entirely.

---

## §2. Module-by-Module Breakdown

For each module below, the columns mean:
- **Tab structure:** list of tabs and their sub-component function names
- **State hooks:** local `useState` calls (mostly just `tab`)
- **Mock data:** named inline arrays (all in-component, all 100% mock)
- **Tables:** main tables with column counts
- **Buttons:** all rendered buttons; "dead" = no onClick or only local-toggle
- **Forms:** any inline create/edit forms (note: NONE submit anywhere)
- **Production score:** 1–10 subjective readiness

---

### 2.1 InventoryModule (lines 4044–4482, Sprint 12)

- **Tabs** (7): `overview`, `transactions`, `balances`, `ledger`, `movements`, `journal`, `availability`
- **State:** `[tab, setTab]` only — no other state
- **Sub-components:** `InvOverviewTab`, `InvTransactionsTab`, `InvBalancesTab`, `InvLedgerTab`, `InvMovementsTab`, `InvJournalTab`, `InvAvailabilityTab`
- **Mock data (inline):**
  - `stats` (8 cards) — overview
  - `transactions` (10 records) — 18 transaction types enumerated
  - `balances` (10 records) — derived stock cache
  - `entries` (10 records) — immutable ledger
  - `movements` (7 records) — IN/OUT/TRANSFER/etc.
  - `entries` (6 records) — double-entry journal DEBIT/CREDIT pairs
  - `summary` + `byProduct` (8 records) — availability
- **Tables:**
  - Transactions (9 cols: Txn#, Type, Date, Reference, Warehouse, Partner, Qty, Value, Status)
  - Balances (11 cols: Product, Warehouse, Batch, Avail, Resv, Alloc, Dmg, Exp, Total, Value, Expiry)
  - Ledger (9 cols: Txn#, Type, Product, Warehouse, Batch, Qty Delta, Avail Delta, Posted, Reversal?)
  - Movements (card list, not table)
  - Journal (10 cols: Entry#, Type, Product, Qty, Unit Cost, Total Value, Account, Offset, Reference, Posted)
  - Availability by Product (5 cols: Product, Available, Reserved, Expired, Value)
- **Buttons:**
  - "New Transaction" — DEAD (no onClick)
- **Color maps:** `typeColor` (18 txn types), `statusColor` (5 txn statuses)
- **Forms:** NONE
- **Business rules visible:** "Available = Received − Issued − Reserved − Damaged"; 18 transaction types; reversals create new entries with negative deltas; Opening Stock, Scrap, Expiry are NOT reversible
- **Production score:** 2/10 — pretty mock dashboard with rich domain modeling; needs API wiring to `/api/v1/inventory/inventory`, `/ledger`, `/transactions`, `/batches`, `/reservations`, `/blocks`, `/expiry`

---

### 2.2 GoodsReceiptModule (lines 4483–4808, Sprint 13)

- **Tabs** (5): `overview`, `grns`, `putaway`, `quality`, `rules`
- **State:** `[tab, setTab]`
- **Sub-components:** `GRNOverviewTab`, `GRNListTab`, `GRNPutawayTab`, `GRNQualityTab`, `GRNRulesTab`
- **Mock data (inline):**
  - `stats` (8 cards)
  - `grns` (8 records — 10 receipt types enumerated: PURCHASE_RECEIPT, MANUFACTURING_RECEIPT, SALES_RETURN, CUSTOMER_RETURN, OPENING_STOCK, INTER_BRANCH_RECEIPT, WAREHOUSE_TRANSFER_RECEIPT, STOCK_CORRECTION, DONATION_RECEIPT, SAMPLE_RECEIPT)
  - `tasks` (6 records) — putaway tasks
  - `holds` (records) — quality holds
  - `rules` (records) — putaway rules (FIFO/FEFO/ABC/Zone/Temperature)
- **Tables:**
  - GRN list (14 cols: GRN#, Type, Date, Supplier, Ref, Warehouse, Ordered, Received, Accepted, Rejected, Value, Quality, Posted, Status)
  - Putaway tasks (card list)
  - Quality holds (varies)
  - Putaway rules (varies)
- **Buttons:**
  - "New GRN" — DEAD
  - "Generate Tasks" — DEAD
- **Color maps:** `typeColor` (10 receipt types), `statusColor` (6 statuses), `strategyColor` (6 strategies)
- **Forms:** NONE
- **Business rules:** 10 receipt types; quality hold separates receiving from putaway; FEFO/FIFO/ABC/Zone/Temperature strategies; stock NOT available until quality release + putaway completion
- **Production score:** 2/10 — needs `goodsReceiptApi.list/create/get/transition` wiring

---

### 2.3 StockIssueModule (lines 4809–5122, Sprint 14)

- **Tabs** (5): `overview`, `issues`, `picking`, `scrap`, `damage`
- **State:** `[tab, setTab]`
- **Sub-components:** `SIOverviewTab`, `SIListTab`, `SIPickingTab`, `SIScrapTab`, `SIDamageTab`
- **Mock data (inline):**
  - `stats` (8 cards)
  - `issues` (8 records — 11 issue types: PRODUCTION_ISSUE, KITCHEN_ISSUE, SALES_ISSUE, SAMPLE_ISSUE, DAMAGE_ISSUE, SCRAP_ISSUE, INTERNAL_CONSUMPTION, MAINTENANCE_ISSUE, TRANSFER_ISSUE, RETURN_TO_SUPPLIER, ADJUSTMENT_ISSUE)
  - `tasks` (5 picking tasks)
  - `scraps` (5 records)
  - `damages` (4 records)
- **Tables:** Issues (11 cols), Picking tasks (cards w/ progress bar), Scraps (table), Damages (table)
- **Buttons:** "New Issue" — DEAD
- **Color maps:** `typeColor` (11), `statusColor` (5), `strategyColor` (6: FIFO, FEFO, NEAREST_BIN, WAVE, ZONE, PRIORITY)
- **Business rules:** 6 picking strategies; picking required before issue; auto-posts to inventory ledger; 11 issue types
- **Production score:** 2/10 — needs `inventoryApi.stockOut` + new picking-task endpoints

---

### 2.4 StockTransferModule (lines 5123–5345, Sprint 15)

- **Tabs** (4): `overview`, `transfers`, `transit`, `bin`
- **State:** `[tab, setTab]`
- **Sub-components:** `TransferOverviewTab`, `TransferListTab`, `TransferTransitTab`, `TransferBinTab`
- **Mock data:** `stats`, `transfers` (8 records), `items`, `bins`
- **Tables:** Transfers (multi-column), In-transit, Bin transfers
- **Buttons:** "New Transfer" — DEAD
- **Business rules:** 11 transfer types enumerated (in hero card description: Warehouse/Branch/Bin/Transit)
- **Production score:** 2/10

---

### 2.5 AdjustmentModule (lines 5346–5664, Sprint 16)

- **Tabs** (4): `overview`, `adjustments`, `damage`, `rootcauses`
- **State:** `[tab, setTab]`
- **Sub-components:** `AdjustmentOverviewTab`, `AdjustmentListTab`, `AdjustmentDamageTab`, `AdjustmentRootCauseTab`
- **Mock data:** `stats` (8 cards), `adjustments` (records), `reports` (records), `causes` (records)
- **Tables:** Adjustments, Damage reports, Root cause analysis
- **Buttons:** "New Adjustment" — DEAD
- **Business rules:** Adjustment types, damage reports, root cause analysis required
- **Production score:** 2/10

---

### 2.6 ReservationModule (lines 5665–6026, Sprint 17)

- **Tabs** (4): `overview`, `reservations`, `rules`, `availability`
- **State:** `[tab, setTab]`
- **Sub-components:** `ReservationOverviewTab`, `ReservationListTab`, `AllocationRulesTab`, `AvailabilityTab`
- **Mock data:**
  - `stats` (6 cards)
  - `flowSteps` (8 steps)
  - `priorityMatrix` (5 ranks) — Manufacturing > Sales > Restaurant > Transfers > Samples
  - `reservations` (8 records — 8 reservation types: SALES_ORDER, PRODUCTION_ORDER, KITCHEN_ORDER, TRANSFER_ORDER, MAINTENANCE_ORDER, PROJECT_RESERVATION, SAMPLE_RESERVATION, EMERGENCY_RESERVATION)
  - `rules` (6 rules: FIFO, FEFO, LIFO, NEAREST_BIN, LOWEST_COST, HIGHEST_PRIORITY)
  - `snapshots` (availability snapshots)
  - `formatINR` helper defined locally (line 6026+ — reimplementation of `@/lib/format`)
- **Tables:** Reservations (12 cols), Priority Matrix (7 cols), Availability by warehouse
- **Buttons:** "New Reservation" — DEAD
- **Color maps:** `typeColor` (9), `priorityColor` (5: EMERGENCY/CRITICAL/HIGH/NORMAL/LOW), `statusColor` (5)
- **Business rules:** Priority scoring 25–100; auto-release SLA hours per type; 6 allocation strategies
- **Production score:** 2/10 — needs `inventoryApi.reserve/releaseReservation/listReservations`

---

### 2.7 CycleCountModule (lines 6027–6381, Sprint 18)

- **Tabs** (4): `overview`, `physical`, `plans`, `variances`
- **State:** `[tab, setTab]`
- **Sub-components:** `CycleCountOverviewTab`, `PhysicalCountsTab`, `CyclePlansTab`, `CountVariancesTab`
- **Mock data:**
  - `stats` (8 cards)
  - `flowSteps` (8 steps)
  - `abcStrategy` (3 rows — A/B/C with frequency/items/accuracy target)
  - `counts` (8 records — 8 count types: ANNUAL_COUNT, CYCLE_COUNT, BLIND_COUNT, SPOT_COUNT, ABC_COUNT, RANDOM_COUNT, BIN_COUNT, INVESTIGATION_COUNT)
  - `plans` (4 plans: DAILY/WEEKLY/MONTHLY/QUARTERLY)
  - `variances` (6 variance types: MISSING/EXTRA/WRONG_LOCATION/WRONG_BATCH/WRONG_UOM/WRONG_PRODUCT)
- **Tables:** Physical Counts (10 cols: Count#, Date, Type, Warehouse, Team, System Qty, Counted Qty, Variance, Accuracy, Status)
- **Buttons:** "New Count" — DEAD
- **Color maps:** `typeColor` (8), `statusColor` (6), `classColor` (3)
- **Business rules:** ABC strategy — Class A daily, B weekly, C yearly; blind count hides system qty; supervisor/warehouse mgr/finance approval chain
- **Production score:** 2/10

---

### 2.8 BatchExpiryModule (lines 6382–6909, Sprint 19)

- **Tabs** (5): `overview`, `batches`, `alerts`, `recalls`, `genealogy`
- **State:** `[tab, setTab]`
- **Sub-components:** `BatchOverviewTab`, `BatchMastersTab`, `ExpiryAlertsTab`, `ProductRecallsTab`, `BatchGenealogyTab`
- **Mock data:**
  - `stats` (8 cards)
  - `flowSteps` (8 steps)
  - `batches` (10 records — 7 batch types: RAW_MATERIAL, PACKAGING_MATERIAL, SEMI_FINISHED, FINISHED_GOODS, RETURNED_GOODS, QUALITY_HOLD, TRIAL_BATCH, REWORK_BATCH; 11 batch statuses: PLANNED, CREATED, RELEASED, AVAILABLE, RESERVED, BLOCKED, QUARANTINED, EXPIRED, RECALLED, CONSUMED, CLOSED)
  - `alerts` (records — NEAR_EXPIRY/CRITICAL/EXPIRED)
  - `recalls` (records — FULL/PARTIAL/WITHDRAWAL)
  - `genealogies` (forward+backward trace)
- **Tables:** Batches (11 cols: Batch#, Product, Type, Mfg Date, Expiry, Days Left, FEFO, Grade, Curr Qty, Value, Status)
- **Buttons:** "New Batch" — DEAD
- **Color maps:** `typeColor` (8), `statusColor` (11), `gradeColor` (4: A/B/C/REJECT)
- **Business rules:** FEFO priority 1–5 = expired/critical (<7 days); 6–20 = near expiry (7-15d); 21–50 = approaching (15-30d); 51+ = healthy (>30d); action triggers FEFO_PRIORITIZE/DISCOUNT/DONATE/DESTROY/RETURN_TO_SUPPLIER
- **Production score:** 3/10 — best mock-modelled module; needs `inventoryApi.listBatches/getExpiring/markExpired` + new recall/genealogy endpoints

---

### 2.9 CostingModule (lines 6910–7480, Sprint 20)

- **Tabs** (5): `overview`, `layers`, `landed`, `revaluation`, `gl`
- **State:** `[tab, setTab]` (parent); also `[allocated, setAllocated]` in LandedCostTab (line 319) and `[revs, setRevs]` in RevaluationTab (line 384) — both for LOCAL-ONLY state mutations (no API)
- **Sub-components:** `CostingOverviewTab`, `CostLayersTab`, `LandedCostTab`, `RevaluationTab`, `GLPostingsTab`
- **Mock data:**
  - `stats` (8 cards)
  - `flowSteps` (8 steps)
  - `methodRecommendations` (4 by product type)
  - `abcGrid` (3: A/B/C)
  - `xyzGrid` (3: X/Y/Z)
  - `layers` (8 records — 6 costing methods: FIFO, WEIGHTED_AVERAGE, MOVING_AVERAGE, STANDARD, ACTUAL, SPECIFIC_IDENTIFICATION; 5 statuses: ACTIVE, PARTIALLY_CONSUMED, FULLY_CONSUMED, EXPIRED, CLOSED)
  - `docs` (landed cost docs) — 8 cost components: FREIGHT, INSURANCE, CUSTOM_DUTY, LOADING, UNLOADING, TRANSPORT, HANDLING, BROKERAGE; 5 allocation methods: QUANTITY, WEIGHT, VOLUME, VALUE, EQUAL
  - `initial` (3 revaluations — 5 types: INCREASE, DECREASE, MARKET_ADJUSTMENT, POLICY_CHANGE, STANDARD_COST_UPDATE; 5 statuses: DRAFT, PENDING_APPROVAL, APPROVED, POSTED, CANCELLED)
  - `postings` (6 GL postings — DEBIT/CREDIT pairs)
- **Tables:** Cost Layers (multi-col), Landed Cost docs (cards), Revaluation list, GL Postings (10 cols)
- **Buttons:**
  - "Allocate Components" (Landed Cost) — toggles local state only (no API)
  - "Approve" (Revaluation) — local-only mutation via `handleApprove(id)` at line 407 (calls `setRevs(...)` but never persists)
- **Color maps:** `methodColors`, `statusColors`, `receiptColors`, `typeColors`, `typeBorder`
- **Business rules:** Revaluation workflow: DRAFT → PENDING_APPROVAL → APPROVED → POSTED; auto-generate DEBIT/CREDIT pairs (Inventory Account ↔ Offset Account); ABC class A=top 20% SKUs/80% value, B=30%/15%, C=50%/5%
- **Production score:** 2/10

---

### 2.10 MissionControlModule (lines 7481–8071, Sprint 21)

- **Tabs** (5): `mission`, `kpis`, `classification`, `ageing`, `reorder`
- **State:** `[tab, setTab]`
- **Sub-components:** `MissionControlCommandTab`, `MissionControlKpisTab`, `MissionControlClassificationTab`, `MissionControlAgeingTab`, `MissionControlReorderTab`
- **Mock data:**
  - `heroStats` (6 cards) — Total Inventory Value ₹16.56L, Today's Transactions 142, Pending Approvals 7, Expired Stock 18, Active Recalls 1, Reorder Required 2
  - `gauges` (4 KPIs w/ progress bars)
  - `alerts` (6 alert types)
  - `ops` (4 pending operation types)
  - `kpis` (10 inventory KPIs across 4 categories: EFFICIENCY/QUALITY/SERVICE/CAPACITY)
  - `products` (ABC/XYZ/FSN classification — multiple grids)
  - `products` (ageing buckets)
  - `rules` (reorder rules)
- **Tables:** KPIs (cards w/ trend), Classification (ABC/XYZ/FSN), Ageing (6 buckets), Reorder rules
- **Buttons:** NONE in tab content; only the celebration banner "PART 3 COMPLETE"
- **Local helpers:** `bucketColor(idx, qty)` at line 336
- **Business rules:** 10 KPIs; 4 KPI categories; ageing buckets; ABC (Pareto by value), XYZ (demand variability), FSN (Fast/Slow/Non-moving)
- **Production score:** 2/10

---

### 2.11 ReceivingModule (lines 8975–9410, Sprint 24)

- **Tabs** (5): `overview`, `asns`, `appointments`, `docks`, `exceptions`
- **State:** `[tab, setTab]`
- **Sub-components:** NONE — all 5 tab views inline in `ReceivingModule` body (no separate functions; tab content rendered inline via `{tab === 'overview' && (...)}`)
- **Mock data (module-level):**
  - `RECV_ASNS` (line 4895, 6 ASNs — 8 receiving types: PURCHASE_ORDER, INTER_WAREHOUSE_TRANSFER, CUSTOMER_RETURN, SUPPLIER_REPLACEMENT, MANUFACTURING_RECEIPT, VENDOR_MANAGED_INVENTORY, etc.)
  - `RECV_APPOINTMENTS` (line 4904, 4 appointments)
  - `RECV_GATE_ENTRIES` (line 4911)
  - `RECV_DOCKS` (line 4917, 5 docks)
  - `RECV_EXCEPTIONS` (line 4925, 4 exceptions)
- **Inline data:**
  - `overviewStats` (8 cards)
  - `receivingFlow` (9 steps: Supplier → ASN → Appointment → Gate Entry → Dock → Unload → Verify → Goods Receipt → Putaway)
  - `palletHierarchy` (4 levels: Pallet→Boxes→Packs→Units)
- **Tables:** ASN list (12 cols), Appointments (cards), Docks (cards), Exceptions
- **Buttons:** "Confirm" (only on CONFIRMED ASNs) — DEAD
- **Color maps:** `RECV_TYPE_COLORS`, `ASN_STATUS_COLORS`, `APPT_PRIORITY_COLORS`, `APPT_STATUS_COLORS` (defined elsewhere)
- **Business rules:** 9-step receiving flow; pallet-level receiving (Chief Architect recommendation — 80% time reduction)
- **Production score:** 2/10

---

### 2.12 PutawayModule (lines 9411–9970, Sprint 25)

- **Tabs** (5): `overview`, `tasks`, `rules`, `pallets`, `forklift`
- **State:** `[tab, setTab]`
- **Sub-components:** NONE — all inline
- **Mock data (module-level):**
  - `PUTAWAY_TASKS` (line 5336, 6 tasks — types: DIRECTED, CROSS_DOCK, COLD_STORAGE, etc.)
  - `PUTAWAY_RULES` (line 5345, 5 rules: FEFO, FIFO, ABC, CLOSEST_EMPTY, FAST_MOVING_ZONE)
  - `WAREHOUSE_PALLETS` (line 5353)
  - `FORKLIFT_TASKS_DATA` (line 5360)
- **Inline data:**
  - `overviewStats` (8 cards)
  - `directedFlow` (7 steps: Receiving → Inspection → Putaway Task → Bin Recommendation → Barcode Scan → Confirm Location → Inventory Updated)
  - `operatorFlow` (7 steps: Operator Login → Assigned Tasks → Task # → Scan Pallet → System Shows Zone/Aisle/Rack/Shelf/Bin → Scan Bin → Complete)
  - `binScoringFactors` (5 factors with weights: Capacity 20%, Distance 30%, Product Compatibility 15%, Temperature Match 20%, Picking Efficiency 15%)
- **Tables:** Tasks (11 cols), Rules, Pallets, Forklift tasks
- **Buttons:** "Complete" (on IN_PROGRESS tasks only) — DEAD
- **Color maps:** `PUTAWAY_TYPE_COLORS`, `PUTAWAY_STATUS_COLORS`, `PUTAWAY_PRIORITY_COLORS`
- **Business rules:** 5-factor bin scoring (Capacity+Distance+Compatibility+Temperature+Picking Efficiency = 100); Chief Architect recommendation: system decides bin, not operator
- **Production score:** 2/10 — needs `warehouseApi.listPutawayTasks/createPutawayTask/completePutaway`

---

### 2.13 FulfillmentModule (lines 9971–10605, Sprint 26)

- **Tabs** (5): `overview`, `picking`, `packing`, `cartons`, `labels`
- **State:** `[tab, setTab]`
- **Sub-components:** NONE — all inline
- **Mock data (module-level):**
  - `PICKING_TASKS_DATA` (line 5874) — 6 fulfillment types: RETAIL, WHOLESALE, DISTRIBUTOR, RESTAURANT, BRANCH_TRANSFER, EXPORT
  - `PACKING_STATIONS_DATA` (line 5883)
  - `PACKING_JOBS_DATA` (line 5889)
  - `CARTON_TYPES_DATA` (line 5896)
  - `CARTONS_DATA` (line 5902)
  - `SHIPPING_LABELS_DATA` (line 5910)
  - `PICKING_STRATEGIES` (line 5917) — 8 strategies: SINGLE_ORDER, BATCH, WAVE, ZONE, PICK_AND_PASS, CART, CLUSTER, PALLET
- **Inline data:**
  - `overviewStats` (8 cards)
  - `fulfillmentFlow` (9 steps: Sales Order → Allocation → Wave Planning → Picking Task → Barcode Picking → Packing → Quality Check → Shipping Label → Dispatch Ready)
- **Tables:** Picking tasks (12 cols), Packing stations, Packing jobs, Cartons, Shipping labels
- **Buttons:** "Complete" (on IN_PROGRESS picking tasks) — DEAD
- **Color maps:** `FULFILLMENT_TYPE_COLORS`, `PICKING_STRATEGY_COLORS`, `PICKING_STATUS_COLORS`, `FULFILLMENT_PRIORITY_COLORS`
- **Business rules:** Two-stage barcode verification (Pick: Scan Bin→Product→Batch→Tote; Pack: second-scan verification→pack→label→dispatch); multi-carrier shipping labels (Shiprocket, Blue Dart, Delhivery, DTDC, FedEx, DHL); cartonization engine
- **Production score:** 2/10

---

### 2.14 DispatchModule (lines 10606–11114, Sprint 27)

- **Tabs** (5): `overview`, `dispatches`, `vehicles`, `documents`, `gateexit`
- **State:** `[tab, setTab]`
- **Sub-components:** NONE — all inline
- **Mock data (module-level):**
  - `DISPATCH_ORDERS_DATA` (line 6529) — 9 dispatch types: RETAIL, DISTRIBUTOR, RESTAURANT, BRANCH_TRANSFER, EXPORT, COURIER, DIRECT_DELIVERY, CUSTOMER_PICKUP, VENDOR_RETURN
  - `DISPATCH_VEHICLES_DATA` (line 6538) — 5 vehicle types: TRUCK, CONTAINER, REFRIGERATED, TEMPO, FLATBED; 4 ownership models: OWN_FLEET, THIRD_PARTY, COURIER, RENTAL
  - `SHIPPING_DOCUMENTS_DATA` (line 6546) — 7 doc types: DELIVERY_CHALLAN, PACKING_LIST, DELIVERY_MANIFEST, E_WAY_BILL_REF, etc.
  - `VEHICLE_SEALS_DATA` (line 6553) — 4 seal types: BOLT, CABLE, ELECTRONIC, TAMPER_PROOF
  - `GATE_EXIT_LOGS_DATA` (line 6558)
- **Inline data:**
  - `overviewStats` (8 cards)
  - `dispatchFlow` (9 steps: Packed Orders → Dispatch Planning → Vehicle Assignment → Loading → Barcode Verification → Seal Vehicle → Gate Exit → Carrier → Customer)
  - `vehicleLoadVerification` (8 steps — Chief Architect recommendation: Loading Complete → Scan Every Pallet → Scan Vehicle → Verify Dispatch Plan → Generate Manifest → Apply Seal → Security Gate Verification → Vehicle Exit)
- **Tables:** Dispatches (12 cols), Vehicles, Documents, Seals, Gate Exit logs
- **Buttons:** None visible in the dispatches table — the table is read-only with status badges
- **Color maps:** `DISPATCH_TYPE_COLORS`, `DISPATCH_STATUS_COLORS`, `DISPATCH_PRIORITY_COLORS`, `SEAL_TYPE_COLORS`, `SEAL_STATUS_COLORS`
- **Business rules:** Vehicle Load Verification 8-step chain; load planning (weight/volume/pallet utilization, loading sequence for multi-stop routes)
- **Production score:** 2/10

---

### 2.15 WavePlanningModule (lines 11214–11440, Sprint 28)

- **State:** `[view, setView]` ('list' | 'kanban' | 'gantt'), `[filterStatus, setFilterStatus]`, `[filterType, setFilterType]`, `[showCreate, setShowCreate]`
- **Mock data (inline):**
  - `waves` (8 records — 8 wave types: SINGLE_ORDER, MULTI_ORDER, BATCH, ZONE, CARRIER, ROUTE, PRIORITY, EMERGENCY; 6 statuses: DRAFT, RELEASED, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED)
  - `stats` (4 cards)
- **Three view modes:**
  - List view (table with 11 cols)
  - Kanban view (5 columns by status: DRAFT/RELEASED/IN_PROGRESS/COMPLETED/ON_HOLD)
  - Gantt view (time-blocks for 06:00–18:00 window)
- **Inline Create form** (rendered when `showCreate === true`):
  - Fields: Wave Type, Warehouse (uses `S28_WAREHOUSES`), Priority, Strategy, Planned Start, Planned Finish
  - "Create Wave" button — DEAD (no form submit handler)
  - "Cancel" button — closes the panel
- **Buttons:**
  - "New Wave" — opens create panel
  - "Export" — DEAD
  - Row action "..." (MoreHorizontal) — DEAD
- **Color maps:** uses `s28BadgeForStatus(w.status)` and `s28PriorityBadge(w.priority)` (shared helpers)
- **Production score:** 3/10 — has filter logic, 3 view modes, create panel scaffolding; needs API + form submission

---

### 2.16 TaskQueueModule (lines 11441–11569, Sprint 28)

- **State:** `[filter, setFilter]` (task type filter), `[assignmentFilter, setAssignmentFilter]` (ASSIGNED/UNASSIGNED)
- **Mock data:**
  - `tasks` (10 records — 8 task types: PICK, PUTAWAY, PACK, LOAD, RECEIVE, REPLENISH, COUNT, TRANSFER)
  - `stats` (6 cards)
  - "Auto-Assignment Engine Active" banner (purely decorative)
- **Tables:** Tasks (multi-column with SLA risk indicators: OK/WARNING/CRITICAL)
- **Buttons:** none in the visible table
- **Production score:** 2/10

---

### 2.17 WorkforceModule (lines 11570–11713, Sprint 28)

- **State:** `[view, setView]` ('operators' | 'shifts' | 'attendance')
- **Mock data:**
  - `operators` (8 operators — skill levels: EXPERT, ADVANCED, INTERMEDIATE, BEGINNER; statuses: ACTIVE, ON_LEAVE)
  - `shifts` (4: Morning 06-14, Evening 14-22, Night 22-06, Overtime Pool)
  - `attendance` (derived from operators)
- **Tables:** Operators, Shifts, Attendance
- **Buttons:** "New Operator" — DEAD
- **Production score:** 2/10

---

### 2.18 EquipmentModule (lines 11714–11795, Sprint 28)

- **State:** NONE — pure render
- **Mock data:**
  - `equipment` (10 records — 6 equipment types: FORKLIFT, REACH_TRUCK, STACKER, HAND_PALLET_TRUCK, SCANNER, LABEL_PRINTER)
  - `stats` (6 cards)
  - `typeIcons` map
- **Render:** Grid of equipment cards with battery bars, status badges (uses `s28BadgeForStatus`)
- **Buttons:** "Add Equipment" — DEAD
- **Production score:** 2/10

---

### 2.19 ControlTowerModule (lines 11796–11973, Sprint 28)

- **State:** `[liveMode, setLiveMode]` (boolean toggle for "LIVE/PAUSED" indicator — purely cosmetic, no polling)
- **Mock data:**
  - `kpis` (6 cards w/ target+trend)
  - `zoneHeat` (6 zones w/ load%)
  - `dockActivity` (5 docks w/ status)
  - `vehicleQueue` (4 vehicles)
  - `alerts` (5 alerts w/ severity CRITICAL/HIGH/WARNING/INFO)
- **Render:** KPI cards, zone heatmap, dock cards, vehicle queue, alerts list
- **Production score:** 2/10 — has Switch component, no auto-refresh

---

### 2.20 SLADashboardModule (lines 11974–12081, Sprint 28)

- **State:** NONE
- **Mock data:**
  - `slaConfigs` (7 SLA configs — task types: RECEIVE, PUTAWAY, PICK, PACK, DISPATCH, TRANSFER, CYCLE_COUNT)
  - `violations` (6 violation records — severities: CRITICAL, MAJOR, WARNING, MINOR; statuses: OPEN, INVESTIGATING, RESOLVED, WAIVED)
- **Tables:** SLA Compliance (9 cols: SLA Code, Task Type, Priority, Target, Tasks, On-Time %, Compliance, Violations, Penalty)
- **Production score:** 2/10

---

### 2.21 ExceptionCenterModule (lines 12082–12190, Sprint 28)

- **State:** `[filter, setFilter]` (filter by exception type or status)
- **Mock data:**
  - `exceptions` (8 records — 8 exception types: TASK_FAILURE, NO_STOCK, EQUIPMENT_FAILURE, WRONG_BIN, PRIORITY_CHANGE, TEMPERATURE_ALARM, EMERGENCY_ORDER, SHORT_PICK)
  - `stats` (5 cards)
  - Workflow: 6 steps (Exception Raised → Auto-Routed → Investigation → Decision → Reassign/Escalate/Close → Audit Logged)
- **Filter chips:** 10 (ALL + 9 exception types)
- **Buttons:** "Report Exception" — DEAD
- **Production score:** 2/10

---

### 2.22 WorkforceAnalyticsModule (lines 12191–12340, Sprint 28)

- **State:** NONE
- **Mock data:**
  - `operatorKPIs` (8 operators ranked — tasks/accuracy/util/idle/travel/avgDur/rating)
  - `dailyTrend` (7 days of tasks + accuracy)
  - `skillMatrix` (skills: FORKLIFT, REACH_TRUCK, STACKER, SCANNER, etc. by skill level)
- **Render:** KPI leaderboard, daily trend bars, skill matrix
- **Production score:** 2/10

---

### 2.23 CrossDockConsoleModule (lines 12341–12474, Sprint 29)

- **State:** `[filter, setFilter]`, `[showCreate, setShowCreate]`
- **Mock data:**
  - `crossDockOrders` (6 records — 3 types: PRE_DISTRIBUTIVE, POST_DISTRIBUTIVE, OPPORTUNISTIC; 7 statuses: PLANNED, INBOUND_ARRIVED, IN_PROGRESS, OUTBOUND_LOADED, COMPLETED, EXCEPTION)
  - `stats` (6 cards)
  - Workflow: 6 steps (Inbound Shipment → Order Matching → Cross-Dock Eligible? → Outbound Dock → Load Vehicle → Dispatch)
- **Inline Create form:** Cross-Dock Type, Inbound ASN, Outbound Order, Priority, Inbound Dock, Outbound Dock — DEAD submit
- **Filter chips:** 7 (ALL + 6 statuses)
- **Buttons:** "New Cross-Dock", "Export" — DEAD
- **Production score:** 3/10 — has create panel + filter

---

### 2.24 TruckQueueModule (lines 12475–12570, Sprint 30)

- **State:** NONE
- **Mock data:**
  - `queue` (8 vehicles — 6 queue types: FIFO, PRIORITY, COLD_CHAIN, EMERGENCY, VIP_SUPPLIER, MANUAL_OVERRIDE; 8 vehicle types: CONTAINER, COLD_TRUCK, MINI_TRUCK, TRAILER, BULK_TRUCK, SMALL_VAN, COURIER_VEHICLE, MILK_TANKER)
  - `stats` (4 cards)
  - `queueTypeColors` map
- **Tables:** Live Queue (12 cols: Pos, Queue#, Vehicle, Driver, Purpose, Queue Type, Priority, Wait, Est. Dock, Assigned Dock, Status, Actions)
- **Buttons:** "Filter", "Add to Queue", "Configure Rules" — DEAD; row-level "Assign" / "Resolve" — DEAD
- **Production score:** 2/10

---

### 2.25 DockScheduleModule (lines 12571–12668, Sprint 30)

- **State:** NONE
- **Mock data:**
  - `docks` (9 docks — 6 dock types: RECEIVING, DISPATCH, SHARED, COLD, BULK, EXPRESS; 4 statuses: AVAILABLE, OCCUPIED, MAINTENANCE)
  - `schedule` (8 appointments — 4 booking types: APPOINTMENT, WALK_IN, CROSS_DOCK, PRIORITY)
  - `typeIcons`, `typeColors` maps
- **Render:** Dock cards (grid 2x4) + Today's Schedule sidebar
- **Buttons:** "New Appointment" — DEAD
- **Production score:** 2/10

---

### 2.26 YardMapModule (lines 12669–12772, Sprint 30)

- **State:** NONE
- **Mock data:**
  - `yardZones` (6 zones: GATE_ZONE, WAITING, HOLDING, STAGING, COLD_HOLD, MAINTENANCE — total 19 slots)
  - `vehicles` (13 vehicles across zones)
- **Helper:** `getVehicleForSlot(slot: string)` at line 27 — local lookup
- **Render:** Yard zone layout (visual slot grid) + Vehicle list table
- **Production score:** 2/10 — has visual layout

---

### 2.27 VehicleTrackerModule (lines 12773–12839, Sprint 30)

- **State:** NONE
- **Mock data:**
  - `vehicles` (8 vehicles — full driver/phone/capacity/temp/carrier/ASN/dispatch info)
- **Render:** Vehicle cards grid (3 cols)
- **Production score:** 2/10

---

### 2.28 GateConsoleModule (lines 12840–12969, Sprint 30)

- **State:** `[showCheckIn, setShowCheckIn]`
- **Mock data:**
  - `entries` (6 gate entries — with photo evidence flags)
  - `exits` (2 gate exits)
- **Inline Check-In form:** Vehicle Number, Vehicle Type, Driver Name, Driver Phone, Purpose, ASN/Dispatch#, Gate, Pass Type (QR/BARCODE/RFID) — DEAD submit
- **Tables:** Active Gate Entries (11 cols), Exits table
- **Buttons:** "New Check-In" — opens form; "Generate Pass & Check-In" — DEAD
- **Production score:** 3/10 — has create form scaffolding

---

### 2.29 YardControlTowerModule (lines 12970–13084, Sprint 30)

- **State:** `[liveMode, setLiveMode]`
- **Mock data:**
  - `kpis` (8 cards: Vehicles Waiting, Loading, Unloading, Avg Yard Time, Dock Util %, Truck Turnaround, Avg Queue Time, Cross-Dock %)
  - `dockActivity` (8 docks)
  - `alerts` (5 alerts)
- **Render:** Same Control Tower pattern but yard-focused
- **Production score:** 2/10

---

### 2.30 CrossDockAnalyticsModule (lines 13085–13263, Sprint 31)

- **State:** NONE
- **Mock data:**
  - `dailyTrend` (7 days — crossDock count + total + savings)
  - `topProducts` (5)
  - `supplierPerf` (5)
  - `carrierPerf` (5)
- **Render:** 5 stat cards, daily trend bar chart, top products, supplier/carrier performance tables
- **Production score:** 2/10

---

### 2.31 EquipmentMasterModule (lines 13264–13379, Sprint 32)

- **State:** `[filterCat, setFilterCat]`, `[showCreate, setShowCreate]`
- **Mock data:**
  - `equipment` (10 records — 6 categories: FORKLIFT, REACH_TRUCK, STACKER, SCANNER, MOBILE_DEVICE, LABEL_PRINTER)
  - `stats` (6 cards)
- **Inline Register form:** Equipment Code, Name, Category, Manufacturer, Model, Serial, Purchase Date, Purchase Cost — DEAD submit ("Generate QR & Register" button)
- **Filter:** by category
- **Tables:** Equipment (multi-col)
- **Production score:** 3/10 — has filter + register form

---

### 2.32 ForkliftDashboardModule (lines 13380–13483, Sprint 32)

- **State:** NONE
- **Mock data:**
  - `forklifts` (7 forklifts — 5 types: ELECTRIC_FORKLIFT, REACH_TRUCK, PALLET_STACKER, ORDER_PICKER)
  - `assignments` (4 active assignments)
  - `stats` (6 cards)
- **Render:** Forklift cards + assignments list
- **Production score:** 2/10

---

### 2.33 ScannerManagementModule (lines 13484–13603, Sprint 32)

- **State:** `[view, setView]` ('scanners' | 'mobile')
- **Mock data:**
  - `scanners` (6 — 4 types: HANDHELD_2D, WEARABLE_RING, MOBILE_COMPUTER, HANDHELD_1D; supports 1D/2D/QR/GS1)
  - `mobile` (4 mobile devices with IMEI, OS, app version, connectivity status)
  - `scannerStats` (6 cards)
- **Render:** Toggle between Scanners view and Mobile devices view
- **Production score:** 2/10

---

### 2.34 BatteryDashboardModule (lines 13604–13715, Sprint 32)

- **State:** NONE
- **Mock data:**
  - `batteries` (6 — 2 types: LITHIUM_ION, LEAD_ACID)
  - `stations` (4 charging stations — 4 types: MULTI_BAY, FAST_CHARGE, SINGLE_BAY, SWAP_STATION)
  - `alerts` (4 alerts)
  - `stats` (5 cards)
- **Render:** Battery cards + charging stations + alerts
- **Production score:** 2/10

---

### 2.35 MaintenancePlannerModule (lines 13716–13882, Sprint 32)

- **State:** `[view, setView]` ('schedule' | 'tasks' | 'plans')
- **Mock data:**
  - `schedule` (6 maintenance schedules — types: DAILY, WEEKLY, MONTHLY, ANNUAL, CALIBRATION)
  - `tasks` (5 maintenance tasks — types: REPAIR, SERVICE, INSPECTION, CALIBRATION)
  - `plans` (5 maintenance plans — freq: WEEKLY, MONTHLY, ANNUAL, CALIBRATION, RUN_BASED)
  - `stats` (cards)
- **Render:** 3-view toggle (Schedule/Tasks/Plans)
- **Production score:** 2/10

---

### 2.36 BreakdownConsoleModule (lines 13883–13971, Sprint 32)

- **State:** NONE
- **Mock data:**
  - `breakdowns` (6 records — 6 categories: HYDRAULIC, ELECTRICAL, MECHANICAL, BATTERY, PHYSICAL_DAMAGE, SOFTWARE; severities: CRITICAL, HIGH, MEDIUM, LOW; statuses: OPEN, ASSIGNED, IN_PROGRESS, REPAIRED, TESTED, RETURNED_TO_SERVICE)
  - `stats` (6 cards)
- **Tables:** Breakdowns list
- **Buttons:** "Report Breakdown" — DEAD
- **Production score:** 2/10

---

### 2.37 CertificationCenterModule (lines 13972–14066, Sprint 32)

- **State:** NONE
- **Mock data:**
  - `certifications` (8 records — 8 cert types: FORKLIFT_LICENSE, REACH_TRUCK, COLD_STORAGE, HAZARDOUS_GOODS, FIRST_AID, SAFETY_TRAINING, EQUIPMENT_TRAINING, FIRE_SAFETY; statuses: ACTIVE, EXPIRED, PENDING_RENEWAL)
  - `stats` (6 cards)
- **Tables:** Certifications list
- **Buttons:** "Issue Certification" — DEAD
- **Production score:** 2/10

---

### 2.38 EquipmentAnalyticsModule (lines 14067–14241, Sprint 32)

- **State:** NONE
- **Mock data:**
  - `kpis` (6 cards: Equipment Utilization, MTBF, MTTR, Battery Health, Maintenance Compliance, Equipment Availability)
  - `equipmentUtil` (8 records)
  - `maintenanceTrend` (7 months — planned vs completed + cost)
- **Render:** KPI cards + equipment utilization table + maintenance trend bars
- **Production score:** 2/10

---

## §3. Existing Modular Components Audit

The following reusable modular components exist in `src/modules/` and **COULD** be used by Section 04, but **NONE are imported** by `page.tsx` for any Section 04 module:

| Modular Component                                            | LOC | API Client Used? | Imported by page.tsx? |
|--------------------------------------------------------------|-----|------------------|------------------------|
| `src/modules/inventory/components/InventoryModule.tsx`       | ~50 | YES (inventoryApi) | NO |
| `src/modules/goods-receipt/components/GoodsReceiptModule.tsx`| ~50 | YES (goodsReceiptApi) | NO |
| `src/modules/warehouse/components/WarehouseModule.tsx`       | ~50 | YES (warehouseApi) | NO |
| `src/modules/procurement/components/ProcurementModule.tsx`   | ~50 | YES (procurementApi) | NO |
| `src/modules/purchase-order/components/PurchaseOrderModule.tsx`| ~50 | YES (purchaseOrderApi) | NO |
| `src/modules/rfq/components/RfqModule.tsx`                   | ~50 | YES (rfqApi) | NO |
| `src/modules/quotation/components/QuotationModule.tsx`       | ~50 | YES (quotationApi) | NO |
| `src/modules/quality-inspection/components/QualityInspectionModule.tsx` | ~50 | YES | NO |
| `src/modules/customer/components/CustomerModule.tsx`         | ~50 | YES (customerApi) | NO |
| `src/modules/supplier/components/SupplierModule.tsx`         | ~50 | YES (supplierApi) | NO |
| `src/modules/product/components/ProductModule.tsx`           | ~50 | YES (productApi) | NO |
| `src/modules/organization/components/OrganizationModule.tsx` | ~600 | YES (companyApi/plantApi/etc.) | NO (page.tsx has its own OrganizationModule at line 679) |
| `src/modules/user-management/components/UserManagementModule.tsx` | ~50 | YES (userMgmtApi) | NO (page.tsx has its own RBACModule at line 935) |

**Important:** The existing modular `InventoryModule.tsx` is a MINIMAL list view (~50 LOC) — it's nowhere near the functionality of the inline `InventoryModule()` in `page.tsx` (439 LOC with 7 tabs). The modular one would need to be expanded ~10x to match the inline version's scope. Same gap for GoodsReceiptModule, WarehouseModule.

**Verdict:** The existing modular components are scaffolded stubs. They demonstrate the API client wiring pattern but lack the rich tabular/hero/tab UX of the inline versions. To migrate Section 04 to API-driven, the implementer has two options:
1. **Option A:** Expand each modular component (`src/modules/inventory/components/InventoryModule.tsx`, etc.) to match the inline version's scope, wire API calls, then replace the inline `InventoryModule()` in page.tsx with the modular one. This mirrors what Section 03 did with `src/sections/03-master-data/`.
2. **Option B:** Add API calls directly into the inline functions in `page.tsx` (faster but doesn't reduce page.tsx size).

**Recommendation:** Follow Section 03's pattern (Option A) — create `src/sections/04-operations/` and extract each module into its own file with API integration.

---

## §4. Existing API Clients Audit

### 4.1 `inventoryApi` — `src/modules/inventory/api/client.ts` (84 LOC, 13 methods)

| Method | Endpoint | Used by |
|--------|----------|---------|
| `list({page,pageSize,productId,warehouseId,expired})` | `GET /api/v1/inventory/inventory` | NOT wired (page.tsx uses mock data) |
| `get(id)` | `GET /api/v1/inventory/inventory/:id` | NOT wired |
| `stockIn(data)` | `POST /api/v1/inventory/inventory/stock-in` | NOT wired |
| `stockOut(data)` | `POST /api/v1/inventory/inventory/stock-out` | NOT wired |
| `listLedger({page,productId,warehouseId})` | `GET /api/v1/inventory/ledger` | NOT wired |
| `listTransactions({page,movementType})` | `GET /api/v1/inventory/transactions` | NOT wired |
| `reserve(data)` | `POST /api/v1/inventory/reservations` | NOT wired |
| `block(data)` | `POST /api/v1/inventory/blocks` | NOT wired |
| `getExpiring(days)` | `GET /api/v1/inventory/expiry?days=` | NOT wired |
| `listBatches({page,productId,search})` | `GET /api/v1/inventory/batches` | NOT wired |
| `releaseReservation(id, reason)` | `POST /api/v1/inventory/reservations/:id/release` | NOT wired |
| `markExpired()` | `POST /api/v1/inventory/expiry/mark-expired` | NOT wired |
| `listReservations({page,status,productId})` | `GET /api/v1/inventory/reservations` | NOT wired |
| `listBlocks({page,status})` | `GET /api/v1/inventory/blocks` | NOT wired |

Exports `Inventory` TypeScript interface.

### 4.2 `goodsReceiptApi` — `src/modules/goods-receipt/api/client.ts` (41 LOC, 4 methods)

| Method | Endpoint | Used by |
|--------|----------|---------|
| `list({page,pageSize,search,status,supplierId,poId})` | `GET /api/v1/warehouse/grns/grns` | NOT wired |
| `get(id)` | `GET /api/v1/warehouse/grns/grns/:id` | NOT wired |
| `create(data)` | `POST /api/v1/warehouse/grns/grns` | NOT wired |
| `transition(id, targetStatus, version)` | `POST /api/v1/warehouse/grns/grns/:id/transition` | NOT wired |

Exports `GoodsReceipt` TypeScript interface (grn_number, grn_date, po_number, supplier_name, supplier_code, total_qty, total_accepted_qty, status, version).

### 4.3 `warehouseApi` — `src/modules/warehouse/api/client.ts` (65 LOC, 15 methods)

| Method | Endpoint | Used by |
|--------|----------|---------|
| `listZones(warehouseId)` | `GET /api/v1/warehouse/zones` | Sec 03 only |
| `listAisles(warehouseId)` | `GET /api/v1/warehouse/aisles` | Sec 03 only |
| `listRacks(warehouseId)` | `GET /api/v1/warehouse/racks` | Sec 03 only |
| `listBins(warehouseId, params)` | `GET /api/v1/warehouse/bins` | Sec 03 only |
| `createBin(data)` | `POST /api/v1/warehouse/bins` | NOT wired |
| `listPutawayTasks({page,status,warehouseId})` | `GET /api/v1/warehouse/putaway-tasks` | NOT wired (Sec 04 Putaway uses mock) |
| `createPutawayTask(data)` | `POST /api/v1/warehouse/putaway-tasks` | NOT wired |
| `completePutaway(id, version)` | `POST /api/v1/warehouse/putaway-tasks/:id/complete` | NOT wired |
| `createBarcode(data)` | `POST /api/v1/warehouse/barcodes` | NOT wired |
| `printBarcode(id)` | `POST /api/v1/warehouse/barcodes/:id/print` | NOT wired |
| `scan(barcode, scanType)` | `POST /api/v1/warehouse/scan` | NOT wired |
| `createZone(data)` | `POST /api/v1/warehouse/zones` | NOT wired |
| `createAisle(data)` | `POST /api/v1/warehouse/aisles` | NOT wired |
| `createRack(data)` | `POST /api/v1/warehouse/racks` | NOT wired |
| `listScanLogs({page,warehouseId})` | `GET /api/v1/warehouse/scan-logs` | NOT wired |
| `listBarcodes({labelType,productId})` | `GET /api/v1/warehouse/barcodes` | NOT wired |

Exports `WarehouseBin` TypeScript interface.

### 4.4 Other clients relevant to Section 04

- `procurementApi` (src/modules/procurement/api/client.ts, 26 LOC) — minimal; list/get methods only
- `purchaseOrderApi` (src/modules/purchase-order/api/client.ts, 77 LOC) — list/get/create/transition + lines endpoints
- `qualityInspectionApi` (src/modules/quality-inspection/api/client.ts, 54 LOC) — list/get/create/transition + results endpoints
- `rfqApi` (src/modules/rfq/api/client.ts, 27 LOC) — minimal
- `quotationApi` (src/modules/quotation/api/client.ts, 122 LOC) — most fully-featured

### 4.5 API clients MISSING for Section 04 modules

The following Section 04 modules have NO existing API client and would need one created:

| Module | Likely API Client Needed | Backend Module |
|--------|--------------------------|----------------|
| StockIssue | `stockIssueApi` (new) | inventory/warehouse service |
| StockTransfer | `stockTransferApi` (new) | inventory/warehouse service |
| Adjustment | `adjustmentApi` (new) | inventory service |
| Reservation | extend `inventoryApi` (already has reserve/listReservations) | inventory service |
| CycleCount | `cycleCountApi` (new) | inventory service |
| BatchExpiry | extend `inventoryApi` (already has listBatches/getExpiring/markExpired) | inventory service |
| Costing | `costingApi` (new) | product-costing service (backend exists) |
| MissionControl | `inventoryAnalyticsApi` (new) | inventory service |
| Receiving | `receivingApi` (new) | warehouse service (ASN/appointments/docks) |
| Putaway | extend `warehouseApi` (already has putaway-tasks endpoints) | warehouse service |
| Fulfillment | `fulfillmentApi` (new) | warehouse service (picking/packing/cartons/labels) |
| Dispatch | `dispatchApi` (new) | warehouse service (dispatch/vehicles/seals/gate-exit) |
| WavePlanning | `waveApi` (new) | warehouse service |
| TaskQueue | `taskApi` (new) | warehouse service |
| Workforce | `workforceApi` (new) | HRMS or new warehouse-workforce service |
| Equipment | `equipmentApi` (new) | EAM service (backend exists in part 13) |
| ControlTower | `controlTowerApi` (new) | warehouse analytics service |
| SLADashboard | `slaApi` (new) | warehouse service |
| ExceptionCenter | `exceptionApi` (new) | warehouse service |
| WorkforceAnalytics | `workforceAnalyticsApi` (new) | warehouse analytics |
| CrossDockConsole | `crossDockApi` (new) | warehouse service |
| TruckQueue | `truckQueueApi` (new) | warehouse yard service |
| DockSchedule | `dockApi` (new) | warehouse service |
| YardMap | `yardApi` (new) | warehouse yard service |
| VehicleTracker | `vehicleApi` (new) | warehouse yard service |
| GateConsole | `gateApi` (new) | warehouse yard service |
| YardControlTower | `yardTowerApi` (new) | warehouse yard service |
| CrossDockAnalytics | `crossDockAnalyticsApi` (new) | warehouse analytics |
| EquipmentMaster | `equipmentMasterApi` (new) | EAM service |
| ForkliftDashboard | `forkliftApi` (new) | EAM service |
| ScannerManagement | `scannerApi` (new) | EAM service |
| BatteryDashboard | `batteryApi` (new) | EAM service |
| MaintenancePlanner | `maintenanceApi` (new) | EAM service |
| BreakdownConsole | `breakdownApi` (new) | EAM service |
| CertificationCenter | `certificationApi` (new) | EAM service |
| EquipmentAnalytics | `equipmentAnalyticsApi` (new) | EAM analytics |

**Summary:** 3 clients ready (inventory, goods-receipt, warehouse) + 6 clients partially applicable (procurement, purchase-order, rfq, quotation, quality-inspection, customer/supplier/product/org) + ~25 NEW clients needed.

---

## §5. Production Readiness Score (per module)

| #  | Module                   | Score | Rationale |
|----|--------------------------|-------|-----------|
| 1  | InventoryModule          | 2/10  | Rich domain modeling (7 tabs, 18 txn types, immutable ledger principle) but 0 API calls; needs full inventoryApi wiring |
| 2  | GoodsReceiptModule       | 2/10  | 5 tabs, 10 receipt types; needs goodsReceiptApi.list/create/transition wiring |
| 3  | StockIssueModule         | 2/10  | 5 tabs, 11 issue types; needs new stockIssueApi + inventoryApi.stockOut wiring |
| 4  | StockTransferModule      | 2/10  | 4 tabs, 11 transfer types; needs new stockTransferApi |
| 5  | AdjustmentModule         | 2/10  | 4 tabs; needs new adjustmentApi |
| 6  | ReservationModule        | 2/10  | 4 tabs, 8 reservation types, priority matrix; needs inventoryApi.listReservations/reserve/releaseReservation wiring |
| 7  | CycleCountModule         | 2/10  | 4 tabs, 8 count types, ABC strategy; needs new cycleCountApi |
| 8  | BatchExpiryModule        | 3/10  | 5 tabs, 7 batch types, 11 statuses, FEFO logic, recall engine; needs inventoryApi.listBatches/getExpiring + new recall/genealogy API |
| 9  | CostingModule            | 2/10  | 5 tabs, 6 costing methods, 8 cost components, 5 allocation methods, GL postings; needs new costingApi (backend product-costing exists) |
| 10 | MissionControlModule     | 2/10  | 5 tabs, 10 KPIs, ABC/XYZ/FSN classification; needs new inventoryAnalyticsApi |
| 11 | ReceivingModule          | 2/10  | 5 tabs, 9-step flow, pallet-level receiving; needs new receivingApi (ASN/appointments/docks/exceptions) |
| 12 | PutawayModule            | 2/10  | 5 tabs, 5-factor bin scoring; needs warehouseApi.listPutawayTasks/createPutawayTask/completePutaway wiring (ALREADY EXISTS!) |
| 13 | FulfillmentModule        | 2/10  | 5 tabs, 8 picking strategies, two-stage barcode verification; needs new fulfillmentApi |
| 14 | DispatchModule           | 2/10  | 5 tabs, 9 dispatch types, 5 vehicle types, 4 ownership models, 8-step vehicle load verification; needs new dispatchApi |
| 15 | WavePlanningModule       | 3/10  | Has filter, 3 view modes (list/kanban/gantt), create panel scaffolding; needs new waveApi + form submission |
| 16 | TaskQueueModule          | 2/10  | Has filter, auto-assignment banner; needs new taskApi |
| 17 | WorkforceModule          | 2/10  | 3 views (operators/shifts/attendance); needs new workforceApi |
| 18 | EquipmentModule          | 2/10  | Card grid; needs new equipmentApi |
| 19 | ControlTowerModule       | 2/10  | Live mode toggle (cosmetic); needs new controlTowerApi with polling |
| 20 | SLADashboardModule       | 2/10  | SLA configs + violations; needs new slaApi |
| 21 | ExceptionCenterModule    | 2/10  | Has filter, 8 exception types; needs new exceptionApi |
| 22 | WorkforceAnalyticsModule | 2/10  | KPI leaderboard, daily trend, skill matrix; needs new workforceAnalyticsApi |
| 23 | CrossDockConsoleModule   | 3/10  | Has filter, create panel; needs new crossDockApi + form submission |
| 24 | TruckQueueModule         | 2/10  | 12-col live queue; needs new truckQueueApi |
| 25 | DockScheduleModule       | 2/10  | 9 docks + schedule; needs new dockApi |
| 26 | YardMapModule            | 2/10  | Visual yard layout (6 zones, 19 slots); needs new yardApi |
| 27 | VehicleTrackerModule     | 2/10  | 8 vehicle cards; needs new vehicleApi |
| 28 | GateConsoleModule        | 3/10  | Has check-in form scaffolding; needs new gateApi + form submission |
| 29 | YardControlTowerModule   | 2/10  | Live mode toggle (cosmetic); needs new yardTowerApi with polling |
| 30 | CrossDockAnalyticsModule | 2/10  | Daily trend + supplier/carrier perf; needs new crossDockAnalyticsApi |
| 31 | EquipmentMasterModule    | 3/10  | Has filter + register form; needs new equipmentMasterApi + form submission |
| 32 | ForkliftDashboardModule  | 2/10  | 7 forklifts + assignments; needs new forkliftApi |
| 33 | ScannerManagementModule  | 2/10  | 2 views (scanners/mobile); needs new scannerApi |
| 34 | BatteryDashboardModule   | 2/10  | 6 batteries + 4 charging stations; needs new batteryApi |
| 35 | MaintenancePlannerModule | 2/10  | 3 views (schedule/tasks/plans); needs new maintenanceApi |
| 36 | BreakdownConsoleModule   | 2/10  | 6 breakdown records; needs new breakdownApi |
| 37 | CertificationCenterModule| 2/10  | 8 certifications; needs new certificationApi |
| 38 | EquipmentAnalyticsModule | 2/10  | 6 KPIs + utilization + trend; needs new equipmentAnalyticsApi |

**Section 04 average score: 2.1/10** (significantly lower than Section 03's 8.8/10 — Section 04 is essentially a mockup gallery)

---

## §6. Critical Issues Found

### 6.1 CRITICAL — All 40 modules are 100% mock data
**Severity:** P0 (production blocker)
**Evidence:** grep `fetch\(|apiClient\.|API_BASE|useEffect` across lines 4044–14241 returns ZERO matches
**Impact:** The entire Operations/WMS section shows static demo data that NEVER changes. Users cannot create real GRNs, post real stock issues, view real inventory, etc.
**Fix:** Wire each module to its API client (existing inventory/goods-receipt/warehouse clients + ~25 new clients to be built)

### 6.2 CRITICAL — Zero RBAC / permission gating
**Severity:** P0
**Evidence:** grep `hasPermission\(|useAuthStore` across Section 04 returns ZERO matches
**Impact:** Any logged-in user (or demo-mode user) can see all inventory data, all dispatch records, all workforce info. Violates enterprise RBAC requirements.
**Fix:** Wrap every create/transition/delete button in `hasPermission('inventory:write')` etc.; hide sensitive columns based on permissions

### 6.3 CRITICAL — All buttons are dead (no onClick handlers)
**Severity:** P0
**Evidence:** "New Transaction", "New GRN", "New Issue", "New Reservation", "New Count", "New Batch", "New Wave", "New Cross-Dock", "New Check-In", "Register Equipment", "Issue Certification", "Report Breakdown", "Report Exception" — ALL have no onClick or only toggle local UI state
**Impact:** Clicking any CTA produces no visible feedback (no toast, no API call, no state mutation that persists). The UI feels broken.
**Fix:** Wire every button to an actual API call (or remove if not in scope)

### 6.4 HIGH — No toast/notification system wired
**Severity:** P1
**Evidence:** grep `toast\(|pushToast\(` across Section 04 returns ZERO matches
**Impact:** Even if buttons were wired, success/error feedback would be invisible
**Fix:** Import `toast` from `@/hooks/use-toast` (already mounted via `<Toaster />` in layout.tsx) and call `toast({ title: '...', description: '...' })` in every API success/error handler. (Section 03 already migrated to this pattern in Phase R1.)

### 6.5 HIGH — Massive duplication of mock data
**Severity:** P1
**Evidence:** 30 module-level mock arrays + dozens of inline arrays = 200+ mock records scattered across 10,000 lines
**Impact:** When backend APIs are wired, every mock array must be deleted; high risk of leaving dead code. Mock data also creates a maintenance burden (changing one mock record requires editing page.tsx).
**Fix:** During migration, delete each mock array as the corresponding API call is wired

### 6.6 HIGH — Massive duplication of color maps
**Severity:** P1
**Evidence:** Every Section 04 module declares its own `typeColor`/`statusColor`/`priorityColor`/`strategyColor` Record<string, string>. The shared `s28BadgeForStatus` helper exists at line 11157 but only Sprint 28-32 modules use it; Sprint 12-27 modules each define their own.
**Impact:** Status badge colors are inconsistent across modules (e.g. "COMPLETED" is green in Inventory but slate in MissionControl)
**Fix:** Promote `s28BadgeForStatus` to `src/lib/badges.ts` (Section 03 already has `s28BadgeForStatus` in `src/sections/03-master-data/utils/helpers.ts` at line 12 with 70 entries — that's the most complete copy). Replace all inline color maps with the shared helper.

### 6.7 HIGH — No shared LoadingState/ErrorState/EmptyState components used
**Severity:** P1
**Evidence:** Section 03 created `src/components/shared/loading-state.tsx`, `error-state.tsx`, `empty-state.tsx` in Phase R2 — but NONE of these are used in Section 04
**Impact:** No loading skeleton during API fetch; no error display on API failure; no empty state when no records exist
**Fix:** Import and use `<LoadingState />`, `<ErrorState />`, `<EmptyState />` from `@/components/shared` (already exists from Section 03's R2 phase)

### 6.8 HIGH — Manual tab bar instead of shadcn `<Tabs>`
**Severity:** P2
**Evidence:** Every multi-tab Section 04 module uses raw `<button>` elements with manual `tab === 'overview' && <XxxOverviewTab />` conditionals
**Impact:** Keyboard navigation broken (no Tab/Arrow key support); no ARIA tab role; visual styling differs from shadcn Tabs
**Fix:** Replace manual tab bars with `<Tabs>` from `@/components/ui/tabs` (already imported by Section 03)

### 6.9 HIGH — Manual tables instead of shadcn `<Table>`
**Severity:** P2
**Evidence:** Every Section 04 table uses raw `<table className="w-full text-sm">` with manual `<thead>`/`<tbody>`
**Impact:** No responsive overflow handling; no built-in sort/select; inconsistent styling
**Fix:** Replace raw tables with `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableHead>`, `<TableCell>` from `@/components/ui/table`

### 6.10 HIGH — Manual `<select>` instead of shadcn `<Select>`
**Severity:** P2
**Evidence:** Every form in Section 04 (WavePlanning create, CrossDock create, EquipmentMaster create, GateConsole check-in) uses raw `<select>` elements
**Impact:** Inconsistent styling; no keyboard navigation; no search/filter for long option lists
**Fix:** Replace with `<Select>` from `@/components/ui/select`

### 6.11 MEDIUM — Costing module has local-only state mutations
**Severity:** P2
**Evidence:** `CostingModule`'s `LandedCostTab` (line 319) uses `[allocated, setAllocated]` for "Allocate Components" button — clicking the button flips local state but never persists. `RevaluationTab` (line 384) uses `[revs, setRevs]` with `handleApprove(id)` at line 407 — approving a revaluation updates local state but never calls API.
**Impact:** User thinks they approved a revaluation; on page reload, it's back to PENDING_APPROVAL. Silent data loss.
**Fix:** Wire `handleApprove` to a new `costingApi.approveRevaluation(id)` call

### 6.12 MEDIUM — Create panels render but never submit
**Severity:** P2
**Evidence:** WavePlanning's create panel (line 11231), CrossDock's create panel (line 12368), EquipmentMaster's register panel (line 13321), GateConsole's check-in panel (line 12862) — all render form fields but the "Create"/"Register"/"Check-In" buttons have NO onClick handlers
**Impact:** User fills the form, clicks submit, nothing happens
**Fix:** Wire each form's submit button to the corresponding API create call

### 6.13 MEDIUM — No org context scoping
**Severity:** P2
**Evidence:** Zero references to `useOrgContextStore()` in Section 04. All mock data assumes "Mumbai Plant Warehouse" / "Mumbai DC" / "WH-MUM-MAIN" — hardcoded.
**Impact:** When wired to API, queries won't be scoped to the user's selected company/plant/warehouse
**Fix:** Read `useOrgContextStore()` and pass `warehouseId` / `plantId` / `companyId` to every list query

### 6.14 MEDIUM — No pagination on any list
**Severity:** P2
**Evidence:** Every Section 04 table renders the entire inline mock array (5–10 records typically). No page state, no page-size selector, no "Next/Previous" buttons.
**Impact:** When wired to API and returns 1000+ records, the table will be unusable
**Fix:** Add `useList` hook from `src/hooks/use-list.ts` (created in Section 03 R2) for pagination state; render `<Pagination>` from `@/components/ui/pagination`

### 6.15 MEDIUM — No search/filter on most lists
**Severity:** P2
**Evidence:** Only WavePlanning, TaskQueue, ExceptionCenter, CrossDockConsole, EquipmentMaster have any filter UI. The other 35 modules render raw lists with no search box.
**Impact:** When wired to API, users can't find specific records
**Fix:** Add `useDebouncedSearch` hook (Section 03 R2) + `<Input>` search box to every list tab

### 6.16 LOW — Inline `formatINR` reimplementation
**Severity:** P3
**Evidence:** ReservationModule line 6026+ defines `const formatINR = (n: number) => \`₹${n.toLocaleString('en-IN')}\`` locally. Section 03 already promotes this to `src/lib/format.ts`.
**Impact:** Minor duplication
**Fix:** Import `formatINR` from `@/lib/format`

### 6.17 LOW — Live-mode toggles are cosmetic
**Severity:** P3
**Evidence:** ControlTowerModule (line 11797) and YardControlTowerModule (line 12971) both have `[liveMode, setLiveMode]` state with a Switch component — but no `setInterval`/polling logic. Toggling "LIVE" just changes the badge color.
**Impact:** User thinks the dashboard is real-time; it's actually static
**Fix:** Either remove the LIVE toggle or wire it to a 30-second polling useEffect

---

## §7. Summary & Next Actions

### 7.1 Summary
Section 04 (Operations / WMS PART 4) is the LARGEST section in page.tsx (~10,000 LOC across 40 modules) but the LEAST production-ready. Every module is a 100% static mock dashboard with:
- Zero API calls
- Zero RBAC gating
- Zero toast feedback
- Zero org-context scoping
- Zero pagination/search
- Zero loading/error/empty states
- Dead "Create"/"New"/"Register" buttons

The domain modeling is RICH (correct transaction types, batch statuses, FEFO logic, ABC/XYZ classification, 8-step vehicle load verification, 5-factor bin scoring, etc.) — but none of it is wired to a backend.

### 7.2 Existing assets ready to reuse
From Section 03's R1/R2 phases:
- `toast` from `@/hooks/use-toast` (working pub/sub via `<Toaster />` in layout)
- `<LoadingState>`, `<ErrorState>`, `<EmptyState>`, `<ConfirmDialog>` from `@/components/shared`
- `useList`, `useRecord`, `useMutation`, `useDebouncedSearch`, `useDropdown` from `src/hooks/`
- `formatINR`, `formatDate`, `formatDateTime`, `relativeTime`, `exportToCSV`, `validateGSTIN/PAN/Email/Phone/Pincode` from `src/lib/`
- `s28BadgeForStatus` (70 entries) from `src/sections/03-master-data/utils/helpers.ts` — promote to `src/lib/badges.ts`
- shadcn primitives: `<Tabs>`, `<Table>`, `<Select>`, `<Pagination>`, `<Skeleton>`, `<Form>`, `<Dialog>`, `<AlertDialog>`, `<Sheet>`, `<Drawer>` — all available in `src/components/ui/`

### 7.3 Existing API clients ready to call
- `inventoryApi` (13 methods) — covers Inventory, Reservation, BatchExpiry tabs
- `goodsReceiptApi` (4 methods) — covers GoodsReceipt list/create/transition
- `warehouseApi` (15 methods) — covers Putaway tasks + bins + barcodes + scan
- `procurementApi`, `purchaseOrderApi`, `rfqApi`, `quotationApi`, `qualityInspectionApi` — adjacent modules

### 7.4 API clients that need to be built (~25 new clients)
See §4.5 for the full list. The biggest gaps:
1. `stockIssueApi`, `stockTransferApi`, `adjustmentApi`, `cycleCountApi` — for Sprint 14-18 modules
2. `costingApi` — for Sprint 20 (backend product-costing service exists)
3. `inventoryAnalyticsApi` — for Sprint 21 MissionControl
4. `receivingApi` — for Sprint 24 Receiving (ASN/appointments/docks/exceptions)
5. `fulfillmentApi` — for Sprint 26 Fulfillment (picking/packing/cartons/labels)
6. `dispatchApi` — for Sprint 27 Dispatch (dispatch/vehicles/seals/gate-exit)
7. `waveApi`, `taskApi`, `workforceApi`, `equipmentApi`, `controlTowerApi`, `slaApi`, `exceptionApi`, `workforceAnalyticsApi` — for Sprint 28
8. `crossDockApi`, `truckQueueApi`, `dockApi`, `yardApi`, `vehicleApi`, `gateApi`, `yardTowerApi`, `crossDockAnalyticsApi` — for Sprint 29-31
9. `equipmentMasterApi`, `forkliftApi`, `scannerApi`, `batteryApi`, `maintenanceApi`, `breakdownApi`, `certificationApi`, `equipmentAnalyticsApi` — for Sprint 32 (EAM)

### 7.5 Recommended implementation approach
Follow Section 03's pattern (Option A):
1. Create `src/sections/04-operations/` directory
2. For each of the 40 modules, extract into its own file (e.g. `src/sections/04-operations/components/inventory.tsx`)
3. In each extracted file:
   - Replace mock data arrays with API calls (`useEffect` + `useState`)
   - Replace manual tab bar with shadcn `<Tabs>`
   - Replace manual tables with shadcn `<Table>`
   - Replace manual selects with shadcn `<Select>`
   - Add `<LoadingState>`, `<ErrorState>`, `<EmptyState>` from `@/components/shared`
   - Wire create/transition buttons to API calls with `toast()` feedback
   - Add `hasPermission()` checks on all write actions
   - Add `useOrgContextStore()` scoping to all list queries
   - Add `useDebouncedSearch` + pagination
4. Replace inline `InventoryModule()` etc. in page.tsx with imports from `@/sections/04-operations`
5. Delete the 10,000 lines of inline Section 04 code from page.tsx

### 7.6 Estimated effort
- 40 modules × ~4 hours/module (extract + wire API + add states + tests) = ~160 hours
- 25 new API clients × ~1 hour/client = ~25 hours
- Backend endpoint gaps (receiving, dispatch, yard, EAM) = additional backend work
- **Total: ~185-220 hours** (similar to original Section 03 estimate before R1-R8 reduction)

### 7.7 Priority order (recommended)
1. **P0 — Sprint 12-13 (Inventory + GoodsReceipt):** These are the foundational modules — everything else depends on them. Wire `inventoryApi` and `goodsReceiptApi` first.
2. **P0 — Sprint 14-19 (StockIssue, StockTransfer, Adjustment, Reservation, CycleCount, BatchExpiry):** Complete the inventory lifecycle.
3. **P0 — Sprint 20-21 (Costing, MissionControl):** Inventory valuation and analytics.
4. **P1 — Sprint 24-27 (Receiving, Putaway, Fulfillment, Dispatch):** Core WMS operations.
5. **P2 — Sprint 28 (WavePlanning through WorkforceAnalytics):** Operations orchestration.
6. **P2 — Sprint 29-31 (CrossDock through CrossDockAnalytics):** Yard management.
7. **P3 — Sprint 32 (EquipmentMaster through EquipmentAnalytics):** EAM — can be deferred if EAM backend is not ready.

---

**End of exploration.** This document is the single source of truth for Section 04 frontend status as of this session. The next implementer should use it as the blueprint for the migration to API-driven modules.

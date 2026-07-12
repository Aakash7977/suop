# SUOP ERP — Frontend Component Map

**Generated**: 2026-07-12
**Source File**: `src/app/page.tsx` (37,080 lines, 340 functions)
**Official SUOP ERP Frontend — EXISTING UI PRESERVATION MODE**

---

## 1. Application Structure

### Main Component
- **`Home()`** (line 35,332) — Default export, the root application component
  - Uses `useAuthStore` for authentication state
  - Manages `activeModule` state (which module is displayed)
  - Manages `sidebarOpen` state (mobile drawer)
  - Manages `zoom` state (Ctrl+/- zoom controls)
  - Renders: LoginScreen → Sidebar + Header + Module Content

### Authentication
- **`LoginScreen()`** (line 89) — Login form with email/password, demo mode
  - Uses `useAuthStore.login()` and `useAuthStore.loginDemo()`
  - Shows error messages on failure
  - "Remember me for 30 days" checkbox
  - Demo Mode button (no login required)

### Auth Store (`src/stores/auth-store.ts`)
- Zustand store with 3 auth modes:
  1. **Supabase** (if `NEXT_PUBLIC_SUPABASE_URL` configured)
  2. **Local fallback** (any email/password works)
  3. **Demo mode** (instant access, no credentials)
- Persists to `localStorage` key `suop_auth`
- Token stored in `localStorage` key `suop_access_token`

---

## 2. Navigation Structure

### Sidebar Sections (27 sections, 200+ items)

| Section | Modules | Status |
|---|---|---|
| Overview | Dashboard | ✅ Available |
| Master Data (Sprint 6-11) | Product Master, PIM, Commercial Engine, Business Partners, Identification, Governance | ✅ Available (6) |
| Platform (Sprint 1-5) | Organization, RBAC, Settings | ✅ Available (3) |
| Operations (Sprint 12+) | Inventory, GRN, Stock Issue, Transfer, Adjustments, Reservations, Cycle Count, Batch, Costing, Mission Control, Warehouse, Locations, Receiving, Putaway, Fulfillment, Dispatch, Wave, Task Queue, Workforce, Equipment, Control Tower, SLA, Exceptions, Workforce Analytics, Cross-Dock, Truck Queue, Dock Schedule, Yard Map, Vehicle Tracker, Gate Console, Yard Tower, Cross-Dock Analytics, Equipment Master, Forklift, Scanner, Battery, Maintenance, Breakdown, Certification, Equipment Analytics | ✅ Available (40) |
| Warehouse Analytics (Sprint 32) | Mission Control, KPI, Operator Analytics, Equipment Analytics+, Heat Maps, Cost Dashboard, SLA Analytics, Executive Reports | ✅ Available (8) |
| Sprint 33 — Command Center | WMS Mission Control, Control Tower, Digital Twin, AI Operations, Executive Dashboard, Alert Center, Recovery Dashboard, Enterprise Analytics | ✅ Available (8) |
| Part 5 — Manufacturing (Sprint 34) | Plant Master through Prod Exceptions | ✅ Available (33) |
| Part 5 — Batch Traceability (Sprint 39) | Batch Master through Split & Merge | ✅ Available (9) |
| Part 5 — Production Mobile (Sprint 40) | Mobile Control through Sync Monitor | ✅ Available (6) |
| Part 5 — Packaging & FG (Sprint 41) | Packaging Dashboard through WH Handover | ✅ Available (8) |
| Part 5 — Mfg Cost & Finance (Sprint 42) | Cost Dashboard through Mfg Finance | ✅ Available (9) |
| Part 5 — Machine & IoT (Sprint 43) | Machine Dashboard through Production Counters | ✅ Available (8) |
| Part 5 — OEE & Analytics (Sprint 44) | OEE through Exec Mfg Dashboard | ✅ Available (8) |
| Part 5 — Waste & Yield (Sprint 45) | Waste Dashboard through Food Loss | ✅ Available (8) |
| Part 5 — Scheduling (Sprint 46) | Scheduling through Capacity Heat Map | ✅ Available (8) |
| Part 5 — Mission Control (Sprint 47) | Mission Control through Biz Continuity | ✅ Available (8) |
| Part 5 — AI Smart Factory (Sprint 48) | AI Smart Factory through Continuous Imp. | ✅ Available (8) |
| Part 6 — Quality Foundation (Sprint 49) | QMS Dashboard through QMS Departments | ✅ Available (8) |
| Part 6 — Supplier Quality (Sprint 50) | IQC Dashboard through Vendor Scorecard | ✅ Available (6) |
| Part 6 — IPQC (Sprint 51) | IPQC Dashboard through Quality Alerts | ✅ Available (6) |
| Part 6 — FGQC (Sprint 52) | FGQC Dashboard through Certificates | ✅ Available (5) |
| Part 6 — LIMS (Sprint 53) | LIMS Dashboard through Lab Inventory | ✅ Available (5) |
| Part 6 — Food Safety (Sprint 54) | Food Safety through Allergen Matrix | ✅ Available (5) |
| Part 6 — NCR (Sprint 55) | NCR Dashboard through Investigation | ✅ Available (4) |
| Part 6 — CAPA | CAPA Dashboard through Continuous Improvement | ✅ Available (5) |
| Part 6 — COA | COA Dashboard through Compliance Dashboard | ✅ Available (5) |
| Future Modules | Manufacturing, Quality, Procurement, Finance, HR, Maintenance, Retail, Restaurant, AI | ❌ Unavailable (9) |

**Total**: 200+ sidebar items, 191 available, 9 unavailable (Coming Soon)

---

## 3. Module Function Map (340 functions)

### Platform Modules (Sprint 1-7)

| Function | Line | Purpose | Backend API | Status |
|---|---|---|---|---|
| `LoginScreen` | 89 | Login form | `POST /api/v1/auth/login` via authClient | ✅ Connected (via auth store) |
| `DashboardModule` | 546 | Executive dashboard with sprint progress | None (static data) | ⚠️ Uses inline data |
| `OrganizationModule` | 629 | Org tree view | `GET /api/v1/organization` via orgClient | ⚠️ Has API client, page uses inline data |
| `RBACModule` | 703 | Roles, permissions, flags, approvals | `GET /api/v1/admin/roles` via userClient | ⚠️ Has API client, page uses inline data |
| `ProductMasterModule` | 782 | Product list with tabs | `GET /api/v1/catalog` via productClient | ⚠️ Has API client, page uses inline data |
| `PIMModule` | 855 | PIM platform with families, compliance | None | ⚠️ Uses inline data |
| `CommercialEngineModule` | 940 | Pricing engine with 9 tabs | `POST /api/v1/sales/pricing/resolve` | ✅ 1 API call connected |
| `BusinessPartnerModule` | 1565 | Partners with 9 tabs | None | ⚠️ Uses inline data |
| `IdentificationModule` | 2108 | Barcodes, QR, batches, lots, traceability | `POST /api/v1/identification/trace` | ✅ 1 API call connected |
| `GovernanceModule` | 2762 | Data governance with 9 tabs | None | ⚠️ Uses inline data |

### Inventory Modules (Sprint 12+)

| Function | Line | Purpose | Backend API | Status |
|---|---|---|---|---|
| `InventoryModule` | 3332 | Inventory with 7 tabs | `GET /api/v1/inventory` via inventoryClient | ⚠️ Has API client, page uses inline data |
| `GoodsReceiptModule` | 3771 | GRN with 5 tabs | `GET /api/v1/warehouse/grns` via grnClient | ⚠️ Has API client, page uses inline data |
| `StockIssueModule` | 4097 | Stock issue with 5 tabs | None | ⚠️ Uses inline data |
| `StockTransferModule` | 4411 | Transfer with 4 tabs | None | ⚠️ Uses inline data |
| `AdjustmentModule` | 4634 | Adjustments with 4 tabs | None | ⚠️ Uses inline data |
| `ReservationModule` | 4932 | Reservations | None | ⚠️ Uses inline data |
| `CycleCountModule` | 5018 | Cycle count | None | ⚠️ Uses inline data |
| `BatchExpiryModule` | 5104 | Batch & expiry | None | ⚠️ Uses inline data |
| `CostingModule` | 5190 | Costing & valuation | None | ⚠️ Uses inline data |
| `MissionControlModule` | 5276 | Mission control | None | ⚠️ Uses inline data |

### Warehouse Modules (Sprint 30-33)

| Function | Line | Purpose | Backend API | Status |
|---|---|---|---|---|
| `WarehouseModule` | 5362 | Warehouse management | `GET /api/v1/warehouse` via warehouseClient | ⚠️ Has API client, page uses inline data |
| `WarehouseLocationModule` | 5442 | Locations & bins | None | ⚠️ Uses inline data |
| `ReceivingModule` | 5522 | Receiving operations | None | ⚠️ Uses inline data |
| `PutawayModule` | 5602 | Directed putaway | None | ⚠️ Uses inline data |
| `FulfillmentModule` | 5682 | Picking & packing | None | ⚠️ Uses inline data |
| `DispatchModule` | 5762 | Dispatch & shipping | None | ⚠️ Uses inline data |
| `WavePlanningModule` | 5842 | Wave planning | None | ⚠️ Uses inline data |
| `TaskQueueModule` | 5922 | Task queue | None | ⚠️ Uses inline data |
| `WorkforceModule` | 6002 | Workforce management | None | ⚠️ Uses inline data |
| `EquipmentModule` | 6082 | Equipment management | None | ⚠️ Uses inline data |
| ... (40+ warehouse modules) | ... | ... | ... | ⚠️ Uses inline data |

### Manufacturing Modules (Sprint 34-48)

| Function | Line | Purpose | Backend API | Status |
|---|---|---|---|---|
| `PlantMasterModule` | ~9000 | Plant master data | None | ⚠️ Uses inline data |
| `RecipeMasterModule` | ~10000 | Recipe management | None | ⚠️ Uses inline data |
| `ProductionOrdersModule` | ~12000 | Production orders | None | ⚠️ Uses inline data |
| ... (80+ manufacturing modules) | ... | ... | ... | ⚠️ Uses inline data |

### Quality Modules (Sprint 49-55)

| Function | Line | Purpose | Backend API | Status |
|---|---|---|---|---|
| `QMSDashboardModule` | 26819 | QMS dashboard | None | ⚠️ Uses inline data |
| `IQCDashboardModule` | 28792 | IQC dashboard | `GET /api/v1/quality` via qualityClient | ⚠️ Has API client, page uses inline data |
| `IPQCDashboardModule` | 28996 | IPQC dashboard | None | ⚠️ Uses inline data |
| `FGQCDashboardModule` | 30368 | FGQC dashboard | None | ⚠️ Uses inline data |
| `LIMSDashboardModule` | 31363 | LIMS dashboard | None | ⚠️ Uses inline data |
| `FSDashboardModule` | 32682 | Food safety dashboard | None | ⚠️ Uses inline data |
| `NCRDashboardModule` | 33997 | NCR dashboard | None | ⚠️ Uses inline data |
| `CAPADashboardModule` | 35730 | CAPA dashboard | None | ⚠️ Uses inline data |
| `COADashboardModule` | 36453 | COA dashboard | None | ⚠️ Uses inline data |
| `ComingSoon` | 35320 | Placeholder for unavailable modules | None | ✅ Correct usage |

---

## 4. API Client Inventory (14 clients)

| Module | File | Endpoints | Wired to page.tsx? |
|---|---|---|---|
| Auth | `src/modules/auth/api/client.ts` | login, logout, refresh, me, change-password, forgot, reset, sessions, devices, invite, accept | ✅ Yes (via auth store) |
| Organization | `src/modules/organization/api/client.ts` | list, get, create, update, delete | ❌ No (page uses inline data) |
| User Management | `src/modules/user-management/api/client.ts` | list, create, update, delete, roles | ❌ No (page uses inline data) |
| Product | `src/modules/product/api/client.ts` | list, get, create, update, delete | ❌ No (page uses inline data) |
| Supplier | `src/modules/supplier/api/client.ts` | list, get, create, update, delete | ❌ No (page uses inline data) |
| Customer | `src/modules/customer/api/client.ts` | list, get, create, update, delete | ❌ No (page uses inline data) |
| Procurement | `src/modules/procurement/api/client.ts` | list, create, update | ❌ No (page uses inline data) |
| RFQ | `src/modules/rfq/api/client.ts` | list, create, update, submit | ❌ No (page uses inline data) |
| Quotation | `src/modules/quotation/api/client.ts` | list, create, update, compare | ❌ No (page uses inline data) |
| Purchase Order | `src/modules/purchase-order/api/client.ts` | list, get, create, update, approve | ❌ No (page uses inline data) |
| Goods Receipt | `src/modules/goods-receipt/api/client.ts` | list, create, post | ❌ No (page uses inline data) |
| Quality Inspection | `src/modules/quality-inspection/api/client.ts` | list, create, result | ❌ No (page uses inline data) |
| Inventory | `src/modules/inventory/api/client.ts` | list, post, adjust, reverse | ❌ No (page uses inline data) |
| Warehouse | `src/modules/warehouse/api/client.ts` | list, bins | ❌ No (page uses inline data) |

---

## 5. Inline API Calls (not via API client)

| Line | Endpoint | Purpose | Status |
|---|---|---|---|
| 1412 | `POST http://localhost:3030/api/commercial/resolve-price` | Price resolution in Commercial Engine | ⚠️ Hardcoded URL |
| 2655 | `POST http://localhost:3030/api/identification/trace` | Traceability lookup | ⚠️ Hardcoded URL |

---

## 6. UI Component Inventory

### shadcn/ui Components Used (48 files in `src/components/ui/`)
- accordion, alert-dialog, aspect-ratio, avatar, badge, button, calendar, card, chart, checkbox, collapsible, command, dialog, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip

### Page-Level UI Patterns
- **Cards**: Used extensively for dashboards, KPIs, stats
- **Tables**: Inline table rendering with headers and rows
- **Tabs**: Tab-based navigation within modules (e.g., Commercial Engine has 9 tabs)
- **Forms**: Inline forms with Input, Label, Button
- **Badges**: Status badges, sprint badges, availability badges
- **Buttons**: Action buttons with icons
- **ScrollArea**: Sidebar and content scrolling
- **Separators**: Visual dividers
- **Switches**: Toggle controls

---

## 7. State Management

| Store | File | Purpose |
|---|---|---|
| `useAuthStore` | `src/stores/auth-store.ts` | Authentication state (Zustand) |
| `useOrgStore` | `src/stores/org-context-store.ts` | Organization context |

### Component-Level State (108 `useState` calls)
- `activeModule` — Currently selected module
- `sidebarOpen` — Mobile sidebar visibility
- `zoom` — UI zoom level (60-150%)
- Various tab selections, form inputs, loading states

---

## 8. Key Observations

1. **340 functions** in a single file — each function is a module or sub-component
2. **238 module render conditions** — `activeModule === 'xxx'` pattern
3. **Only 2 inline API calls** — the rest use inline data arrays
4. **14 API clients exist** but are NOT imported or used in page.tsx
5. **122 placeholder/data references** — modules display static data instead of API responses
6. **9 modules marked unavailable** — show "ComingSoon" component
7. **3 `useEffect` calls** — initialize auth and keyboard zoom
8. **Demo mode** — allows instant access without backend
9. **Auth store** connects to backend via `authClient` or Supabase or local fallback
10. **Zoom controls** — Ctrl+/- for zoom, unique enterprise feature

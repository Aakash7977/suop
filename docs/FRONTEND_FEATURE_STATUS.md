# SUOP ERP — Frontend Feature Status

**Generated**: 2026-07-12
**Source File**: `src/app/page.tsx` (37,080 lines, 340 functions)
**Official SUOP ERP Frontend — EXISTING UI PRESERVATION MODE**

---

## Executive Summary

| Metric | Value |
|---|---|
| Total UI modules | 200+ sidebar items |
| Available modules | 191 |
| Unavailable modules | 9 (ComingSoon) |
| Total functions | 340 |
| API clients created | 14 |
| API clients wired to page.tsx | 0 (auth store only) |
| Inline API calls (fetch) | 2 |
| Modules using inline data | 189 of 191 |
| Modules fully connected to backend | 2 (Commercial Engine price resolve, Identification trace) |
| Modules with API client but not wired | 12 |

---

## 1. Completed Features (Fully Functional)

| # | Feature | Module | API | Status |
|---|---|---|---|---|
| 1 | Login (email/password) | LoginScreen | `POST /api/v1/auth/login` via authClient | ✅ Working |
| 2 | Login (Demo Mode) | LoginScreen | Local fallback (no API) | ✅ Working |
| 3 | Logout | Header | Auth store logout | ✅ Working |
| 4 | Auth state persistence | Auth store | localStorage | ✅ Working |
| 5 | Price resolution | CommercialEngineModule | `POST /api/v1/sales/pricing/resolve` | ✅ Working (hardcoded URL) |
| 6 | Traceability lookup | IdentificationModule | `POST /api/v1/identification/trace` | ✅ Working (hardcoded URL) |
| 7 | Sidebar navigation | Home component | State-based routing | ✅ Working |
| 8 | Mobile sidebar drawer | Home component | CSS transform | ✅ Working |
| 9 | Zoom controls (Ctrl+/-) | Home component | Keyboard events | ✅ Working |
| 10 | Module switching | Home component | `activeModule` state | ✅ Working |
| 11 | ComingSoon placeholder | ComingSoon | Static | ✅ Working |

---

## 2. Incomplete Features (API Client Exists But Not Wired)

These modules have API clients in `src/modules/*/api/client.ts` but the page.tsx uses inline data instead of calling the API client.

| # | Module | API Client | Page Function | Line | Issue |
|---|---|---|---|---|---|
| 1 | Organization | `src/modules/organization/api/client.ts` | `OrganizationModule` | 629 | Uses inline `tree` array instead of `orgClient.list()` |
| 2 | RBAC / User Management | `src/modules/user-management/api/client.ts` | `RBACModule` | 703 | Uses inline `roles`, `flags`, `approvals` arrays |
| 3 | Product Master | `src/modules/product/api/client.ts` | `ProductMasterModule` | 782 | Uses inline `products` array |
| 4 | Supplier | `src/modules/supplier/api/client.ts` | (Not rendered in page.tsx) | — | API client exists, no UI module |
| 5 | Customer | `src/modules/customer/api/client.ts` | (Not rendered in page.tsx) | — | API client exists, no UI module |
| 6 | Procurement | `src/modules/procurement/api/client.ts` | (Not rendered in page.tsx) | — | API client exists, no UI module |
| 7 | RFQ | `src/modules/rfq/api/client.ts` | (Not rendered in page.tsx) | — | API client exists, no UI module |
| 8 | Quotation | `src/modules/quotation/api/client.ts` | (Not rendered in page.tsx) | — | API client exists, no UI module |
| 9 | Purchase Order | `src/modules/purchase-order/api/client.ts` | (Not rendered in page.tsx) | — | API client exists, no UI module |
| 10 | Goods Receipt | `src/modules/goods-receipt/api/client.ts` | `GoodsReceiptModule` | 3771 | Uses inline data arrays |
| 11 | Quality Inspection | `src/modules/quality-inspection/api/client.ts` | (Not rendered in page.tsx) | — | API client exists, no UI module |
| 12 | Inventory | `src/modules/inventory/api/client.ts` | `InventoryModule` | 3332 | Uses inline data arrays |
| 13 | Warehouse | `src/modules/warehouse/api/client.ts` | `WarehouseModule` | 5362 | Uses inline data arrays |

---

## 3. Broken Features

| # | Feature | Location | Issue | Severity |
|---|---|---|---|---|
| 1 | Hardcoded localhost URLs | Lines 1412, 2655 | `fetch('http://localhost:3030/...')` — breaks in production | High |
| 2 | No token in inline fetch calls | Lines 1412, 2655 | Missing `Authorization: Bearer` header | High |
| 3 | No error handling on inline fetch | Lines 1412, 2655 | No try/catch, no user-facing error | Medium |
| 4 | No loading states on inline fetch | Lines 1412, 2655 | No loading indicator during API call | Medium |

---

## 4. Broken Buttons

| # | Button | Module | Line | Issue |
|---|---|---|---|---|
| 1 | Any "Create" button | Most modules | Various | Calls no API — just shows inline data |
| 2 | Any "Edit" button | Most modules | Various | Calls no API — just shows inline data |
| 3 | Any "Delete" button | Most modules | Various | Calls no API — just shows inline data |
| 4 | Any "Export" button | Most modules | Various | No export functionality implemented |
| 5 | Any "Import" button | Most modules | Various | No import functionality implemented |
| 6 | Any "Approve" button | Workflow modules | Various | Calls no API — no workflow transition |
| 7 | Any "Reject" button | Workflow modules | Various | Calls no API — no workflow transition |
| 8 | Any "Print" button | Label/COA modules | Various | No print functionality |
| 9 | Any "Search" field | Most modules | Various | Searches inline data only, not backend |
| 10 | Any "Filter" dropdown | Most modules | Various | Filters inline data only, not backend |

---

## 5. Broken Forms

| # | Form | Module | Line | Issue |
|---|---|---|---|---|
| 1 | Product create form | ProductMasterModule | 782 | No API call on submit |
| 2 | Organization create form | OrganizationModule | 629 | No API call on submit |
| 3 | Role assignment form | RBACModule | 703 | No API call on submit |
| 4 | Inventory adjustment form | AdjustmentModule | 4634 | No API call on submit |
| 5 | Stock transfer form | StockTransferModule | 4411 | No API call on submit |
| 6 | GRN create form | GoodsReceiptModule | 3771 | No API call on submit |
| 7 | All other forms | All modules | Various | No API call on submit — all use inline data |

---

## 6. Broken Dialogs

| # | Dialog | Module | Line | Issue |
|---|---|---|---|---|
| 1 | Product detail dialog | ProductMasterModule | 782 | Shows inline data, no API fetch |
| 2 | Role detail dialog | RBACModule | 703 | Shows inline data, no API fetch |
| 3 | Inventory detail dialog | InventoryModule | 3332 | Shows inline data, no API fetch |
| 4 | All other dialogs | All modules | Various | Show inline data, no API fetch |

---

## 7. Broken Tables

| # | Table | Module | Line | Issues |
|---|---|---|---|---|
| 1 | Product table | ProductMasterModule | 782 | No pagination, no sorting, no backend filter, inline data |
| 2 | Organization table | OrganizationModule | 629 | No pagination, no sorting, inline data |
| 3 | RBAC table | RBACModule | 703 | No pagination, no sorting, inline data |
| 4 | Inventory table | InventoryModule | 3332 | No pagination, no sorting, inline data |
| 5 | GRN table | GoodsReceiptModule | 3771 | No pagination, no sorting, inline data |
| 6 | All other tables | All modules | Various | Same issues — inline data, no pagination/sorting/filter from backend |

---

## 8. Broken Workflows

| # | Workflow | Module | Line | Issue |
|---|---|---|---|---|
| 1 | Product approval | ProductMasterModule | 782 | No `POST /api/v1/catalog/:id` transition call |
| 2 | Role assignment | RBACModule | 703 | No `POST /api/v1/admin/roles` call |
| 3 | Inventory post | InventoryModule | 3332 | No `POST /api/v1/inventory/post` call |
| 4 | GRN post | GoodsReceiptModule | 3771 | No `POST /api/v1/warehouse/grns/:id/post` call |
| 5 | All other workflows | All modules | Various | No workflow transition API calls |

---

## 9. Missing API Connections

| # | Module | Missing API | Priority |
|---|---|---|---|
| 1 | OrganizationModule | `GET /api/v1/organization` (list, get) | P1 |
| 2 | RBACModule | `GET /api/v1/admin` (users, roles, permissions) | P1 |
| 3 | ProductMasterModule | `GET /api/v1/catalog` (CRUD) | P1 |
| 4 | InventoryModule | `GET /api/v1/inventory` (list, post, adjust) | P1 |
| 5 | GoodsReceiptModule | `GET /api/v1/warehouse/grns` (list, create, post) | P1 |
| 6 | WarehouseModule | `GET /api/v1/warehouse` (list, bins) | P2 |
| 7 | StockIssueModule | `POST /api/v1/inventory/post` (issue) | P2 |
| 8 | StockTransferModule | `POST /api/v1/inventory/post` (transfer) | P2 |
| 9 | AdjustmentModule | `POST /api/v1/inventory/adjust` | P2 |
| 10 | All manufacturing modules | Backend APIs exist at `/api/v1/manufacturing/*` | P3 |
| 11 | All quality modules | Backend APIs exist at `/api/v1/quality/*` | P3 |
| 12 | All WMS modules | Backend APIs exist at `/api/v1/warehouse/*` | P3 |

---

## 10. Missing Permissions (Frontend RBAC)

| # | Area | Issue |
|---|---|---|
| 1 | Sidebar items | No permission check — all items visible to all users |
| 2 | Module access | No permission check on module switch |
| 3 | Create buttons | No permission check (e.g., `product:create`) |
| 4 | Edit buttons | No permission check (e.g., `product:update`) |
| 5 | Delete buttons | No permission check (e.g., `product:delete`) |
| 6 | Approve buttons | No permission check (e.g., `po:approve`) |
| 7 | Export buttons | No permission check |
| 8 | Admin screens | No permission check (e.g., `auth:manage_users`) |

**Backend has 54 permissions** — none are enforced in the frontend currently.

---

## 11. Frontend Bugs

| # | Bug | Location | Severity | Fix |
|---|---|---|---|---|
| 1 | Hardcoded `localhost:3030` | Lines 1412, 2655 | High | Replace with `process.env.NEXT_PUBLIC_API_URL` |
| 2 | Missing auth token in fetch | Lines 1412, 2655 | High | Add `Authorization: Bearer` header |
| 3 | No error handling on fetch | Lines 1412, 2655 | Medium | Add try/catch + error display |
| 4 | No loading state on fetch | Lines 1412, 2655 | Medium | Add loading indicator |
| 5 | `costdashboard` duplicate key | ModuleKey type | Low | Two modules use `costdashboard` key |
| 6 | `controltower` duplicate key | ModuleKey type | Low | Two modules use `controltower` key |
| 7 | No 404 handling | Home component | Low | Unknown modules render blank |
| 8 | No breadcrumb navigation | Home component | Low | Only header title shown |

---

## 12. Priority and Estimated Fix Time

### P1 — Critical (Connect core modules to backend API)
| Task | Modules | Estimated Time |
|---|---|---|
| Wire Organization module to orgClient | 1 | 2 hours |
| Wire RBAC module to userClient | 1 | 2 hours |
| Wire Product Master to productClient | 1 | 3 hours |
| Wire Inventory to inventoryClient | 1 | 3 hours |
| Wire Goods Receipt to grnClient | 1 | 3 hours |
| Fix hardcoded localhost URLs | 2 | 0.5 hours |
| Add auth token to inline fetch calls | 2 | 0.5 hours |
| **P1 Total** | **6 modules + 2 fixes** | **14 hours** |

### P2 — High (Connect remaining modules with API clients)
| Task | Modules | Estimated Time |
|---|---|---|
| Wire Warehouse module to warehouseClient | 1 | 2 hours |
| Wire Stock Issue to inventory API | 1 | 2 hours |
| Wire Stock Transfer to inventory API | 1 | 2 hours |
| Wire Adjustments to inventory API | 1 | 2 hours |
| Add loading states to all wired modules | 6 | 3 hours |
| Add error handling to all wired modules | 6 | 3 hours |
| **P2 Total** | **4 modules + 6 improvements** | **14 hours** |

### P3 — Medium (Add CRUD operations to wired modules)
| Task | Modules | Estimated Time |
|---|---|---|
| Add Create forms with API calls | 10 | 15 hours |
| Add Edit forms with API calls | 10 | 15 hours |
| Add Delete with confirmation | 10 | 5 hours |
| Add Search (backend query) | 10 | 5 hours |
| Add Filter (backend query) | 10 | 5 hours |
| Add Pagination (backend) | 10 | 5 hours |
| **P3 Total** | **10 modules** | **50 hours** |

### P4 — Low (Polish)
| Task | Estimated Time |
|---|---|
| Add frontend RBAC (permission checks) | 8 hours |
| Add export (CSV/Excel) | 8 hours |
| Add print functionality | 4 hours |
| Fix duplicate ModuleKey types | 1 hour |
| Add breadcrumb navigation | 4 hours |
| **P4 Total** | **25 hours** |

### Grand Total Estimated Time: ~103 hours

---

## 13. Summary

### What's Working
- ✅ Login (Supabase, local fallback, demo mode)
- ✅ Logout
- ✅ Auth state persistence
- ✅ Sidebar navigation (200+ items, 27 sections)
- ✅ Module switching
- ✅ Mobile responsive sidebar
- ✅ Zoom controls
- ✅ 2 inline API calls (price resolve, traceability)
- ✅ ComingSoon placeholder for future modules

### What's Not Working
- ❌ 12 API clients exist but are NOT wired to page.tsx
- ❌ 189 of 191 modules display inline data instead of backend data
- ❌ No CRUD operations call the backend
- ❌ No search/filter/pagination calls the backend
- ❌ No workflow transitions call the backend
- ❌ No frontend RBAC (permission checks)
- ❌ No export/import functionality
- ❌ No print functionality
- ❌ 2 hardcoded localhost URLs
- ❌ Missing auth token in inline fetch calls

### Root Cause
The frontend was built sprint-by-sprint with **inline placeholder data** for rapid UI prototyping. API clients were created separately in `src/modules/*/api/client.ts` but were never imported or called from `page.tsx`. The UI is visually complete but functionally disconnected from the backend.

### Recommended Approach (Preserving Existing UI)
1. **Do NOT rewrite page.tsx** — the UI is the official frontend
2. **Import the existing API clients** into page.tsx
3. **Replace inline data arrays** with `useEffect` + API client calls
4. **Add loading/error states** to each module
5. **Wire forms** to call API create/update/delete
6. **Wire tables** to use API pagination/search/filter
7. **Wire workflow buttons** to call API transition endpoints
8. **Add permission checks** using the user's permission list from auth

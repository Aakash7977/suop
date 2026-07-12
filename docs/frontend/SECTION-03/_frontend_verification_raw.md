# Section 03 — Frontend Reusable Artifacts Verification (RAW)

**Task ID**: SECTION03-FRONTEND-VERIFY
**Agent**: Explore sub-agent (Section 03 Frontend Verification)
**Date**: 2026-07-13
**Scope**: EXHAUSTIVE inventory of EVERY reusable frontend artifact that Section 03 (Master Data Management) can use.
**Method**: Read every file in `src/components/`, `src/components/ui/`, `src/hooks/`, `src/lib/`, `src/stores/`, `src/modules/*/api/`, `src/modules/*/components/`, `src/sections/03-master-data/`, and `src/app/page.tsx`. Every claim below is cited with file:line source.
**No code changes made.**

---

## 0. Quick Map of What Exists

| Area | Path | Files | Total LOC |
|---|---|---|---|
| shadcn/ui primitives | `src/components/ui/*.tsx` | 47 | 5,496 |
| Generic shared components (non-ui) | `src/components/*` | 0 | 0 |
| Hooks | `src/hooks/*.ts` | 2 | 213 |
| Lib utilities | `src/lib/*.ts` | 3 | 142 |
| Zustand stores | `src/stores/*.ts` | 2 | 668 |
| Module API clients | `src/modules/*/api/client.ts` | 14 | 1,193 |
| Module components | `src/modules/*/components/*.tsx` | 14 | 3,606 |
| Existing Section 03 | `src/sections/03-master-data/**` | 13 | 5,596 |
| App entry | `src/app/page.tsx` | 1 | 37,619 |
| App layout | `src/app/layout.tsx` | 1 | 38 |

**Key surprise**: `src/components/` contains ONLY a `ui/` subdirectory. There are **zero** generic shared domain components (no `<DataTable>`, no `<Combobox>`, no `<PageHeader>`, no `<EmptyState>`, no `<LoadingState>`, no `<ErrorState>`). Every module reinvents these inline.

---

## 1. UI Primitives Catalog (`src/components/ui/`)

All 47 shadcn/ui primitives available. None are domain-specific. **NO DataTable, NO Combobox, NO DatePicker, NO Command-based select** (only raw `command.tsx` + `popover.tsx`).

| # | File | Component | LOC | Notes |
|---|---|---|---|---|
| 1 | `accordion.tsx` | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | 66 | |
| 2 | `alert-dialog.tsx` | `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel` | 157 | |
| 3 | `alert.tsx` | `Alert`, `AlertTitle`, `AlertDescription` | 66 | |
| 4 | `aspect-ratio.tsx` | `AspectRatio` | 11 | |
| 5 | `avatar.tsx` | `Avatar`, `AvatarImage`, `AvatarFallback` | 53 | |
| 6 | `badge.tsx` | `Badge` (variants: default, secondary, destructive, outline) | 46 | |
| 7 | `breadcrumb.tsx` | `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator` | 109 | |
| 8 | `button.tsx` | `Button` (variants: default, destructive, outline, secondary, ghost, link; sizes: default, sm, lg, icon) | 136 | |
| 9 | `calendar.tsx` | `Calendar` | 213 | Single-date only; no range picker. Could be used as a DatePicker if wrapped. |
| 10 | `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction` | 92 | |
| 11 | `carousel.tsx` | `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext` | 241 | |
| 12 | `chart.tsx` | `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle` | 353 | Recharts wrapper |
| 13 | `checkbox.tsx` | `Checkbox` | 32 | |
| 14 | `collapsible.tsx` | `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` | 33 | |
| 15 | `command.tsx` | `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator` | 184 | Used by combobox pattern, but NO Combobox wrapper component exists. |
| 16 | `context-menu.tsx` | `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, … | 252 | |
| 17 | `dialog.tsx` | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` | 143 | |
| 18 | `drawer.tsx` | `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`, `DrawerClose` | 135 | |
| 19 | `dropdown-menu.tsx` | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuGroup`, `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuSubTrigger` | 257 | |
| 20 | `form.tsx` | `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage` (react-hook-form + zod resolver) | 167 | **UNUSED in any module — no module imports react-hook-form** |
| 21 | `hover-card.tsx` | `HoverCard`, `HoverCardTrigger`, `HoverCardContent` | 44 | |
| 22 | `input-otp.tsx` | `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator` | 77 | |
| 23 | `input.tsx` | `Input` | 21 | |
| 24 | `label.tsx` | `Label` | 24 | |
| 25 | `menubar.tsx` | `Menubar`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarItem`, … | 276 | |
| 26 | `navigation-menu.tsx` | `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuViewport` | 168 | |
| 27 | `pagination.tsx` | `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis` | 127 | **UNUSED — modules all roll their own Prev/Next buttons** |
| 28 | `popover.tsx` | `Popover`, `PopoverTrigger`, `PopoverContent` | 48 | |
| 29 | `progress.tsx` | `Progress` | 31 | |
| 30 | `radio-group.tsx` | `RadioGroup`, `RadioGroupItem` | 45 | |
| 31 | `resizable.tsx` | `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle` | 56 | |
| 32 | `scroll-area.tsx` | `ScrollArea`, `ScrollBar` | 58 | Used by `business-partner.tsx` + `warehouse.tsx` in Section 03 |
| 33 | `select.tsx` | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectSeparator` | 185 | |
| 34 | `separator.tsx` | `Separator` | 28 | |
| 35 | `sheet.tsx` | `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose` | 139 | |
| 36 | `sidebar.tsx` | `Sidebar`, `SidebarProvider`, `SidebarTrigger`, `SidebarContent`, `SidebarHeader`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent`, `SidebarGroupAction`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`, `SidebarRail`, `SidebarInput`, `SidebarSeparator`, `SidebarInset`, `SidebarMenuSkeleton` | 726 | |
| 37 | `skeleton.tsx` | `Skeleton` | 13 | **UNUSED — modules use raw `<div className="animate-pulse">`** |
| 38 | `slider.tsx` | `Slider` | 63 | |
| 39 | `sonner.tsx` | `Toaster` (sonner) | 25 | **UNUSED — the layout uses `<Toaster />` from `toaster.tsx` (the shadcn toaster), not sonner** |
| 40 | `switch.tsx` | `Switch` | 31 | Used by Section 03's `business-partner.tsx` and `warehouse.tsx` |
| 41 | `table.tsx` | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` | 116 | **Modules use raw `<table>` instead of this primitive in nearly every list view** |
| 42 | `tabs.tsx` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | 66 | **UNUSED — every module rolls its own tab bar with `<button>`** |
| 43 | `textarea.tsx` | `Textarea` | 18 | |
| 44 | `toast.tsx` | `Toast`, `ToastAction`, `ToastProvider`, `ToastViewport` | 128 | |
| 45 | `toaster.tsx` | `Toaster` (renders toasts from `useToast`) | 56 | **Mounted in `src/app/layout.tsx:34`** — this is the active toast system |
| 46 | `toggle-group.tsx` | `ToggleGroup`, `ToggleGroupItem` | 73 | |
| 47 | `toggle.tsx` | `Toggle` | 47 | |
| 48 | `tooltip.tsx` | `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | 61 | |

### Critical UI-Primitive Gaps (do NOT exist as components — must be built or imported)

- **NO `<DataTable>`** — every list view re-implements its own `<table>` with manual headers, sorting, and pagination
- **NO `<Combobox>`** — searchable dropdowns would need to be assembled from `Popover + Command + PopoverContent` (primitives exist, wrapper doesn't)
- **NO `<DatePicker>`** — `Calendar` exists but is not wrapped; no range picker
- **NO `<EmptyState>` / `<LoadingState>` / `<ErrorState>` / `<PageHeader>` / `<StatCard>`** — every module has its own inline copy
- **NO `<FileUpload>` / `<Dropzone>`** — needed for import wizards
- **NO `<ConfirmDialog>`** — would need to compose from `AlertDialog`

---

## 2. Hooks Catalog (`src/hooks/`)

Only **2 hooks** exist in the shared `src/hooks/` directory.

### 2.1 `useIsMobile()` — `src/hooks/use-mobile.ts:5`

```ts
export function useIsMobile(): boolean
```

- **Purpose**: Returns `true` if viewport width < 768px. Listens to `matchMedia('(max-width: 767px)')`.
- **Parameters**: none
- **Returns**: `boolean`
- **Used by**: shadcn sidebar primitives (sidebar.tsx) and `mobile-app/src/screens/*` — NOT used by any desktop module

### 2.2 `useToast()` and `toast()` — `src/hooks/use-toast.ts:145, 174`

```ts
export function useToast(): {
  toasts: ToasterToast[]
  toast: (props: Toast) => { id: string; dismiss: () => void; update: (props) => void }
  dismiss: (toastId?: string) => void
}
export const toast: (props: Toast) => { id, dismiss, update }
```

- **Purpose**: shadcn toast manager. `useToast()` is the React hook for consuming toast state inside `<Toaster />`. The exported `toast()` function (line 145) is callable from anywhere (including event handlers) to fire a toast.
- **State**: in-memory `toasts[]`, reducer-based, listeners-pub-sub. `TOAST_LIMIT = 1` (only 1 toast visible at a time).
- **Mounted via**: `<Toaster />` in `src/app/layout.tsx:34`, which calls `useToast()` internally (see `src/components/ui/toaster.tsx:15`).
- **Used by**: Only `src/components/ui/toaster.tsx`. **NO module currently imports `useToast` or `toast` directly** — modules reinvent their own inline `setSuccessMsg('...')` pattern with `<div>` banner.
- **CRITICAL FOR SECTION 03**: This is the proper toast system. Section 03 should use `import { toast } from '@/hooks/use-toast'` instead of its custom `pushToast` (see §9.1 below).

### Hooks that DON'T exist (must be built):

- **NO `useDebounce`** — Section 03 already built its own `useDebouncedSearch` in `src/sections/03-master-data/hooks/use-master-data.ts:168`
- **NO `useList` / `usePaginatedQuery`** — Section 03 already built its own in `src/sections/03-master-data/hooks/use-master-data.ts:36`
- **NO `useMutation` (frontend)** — Section 03 already built its own (lightweight, not React Query) at `src/sections/03-master-data/hooks/use-master-data.ts:138`
- **NO `useRecord` / `useResource`** — Section 03 built `useRecord` at `src/sections/03-master-data/hooks/use-master-data.ts:96`
- **NO `useDropdown` / `useLookup`** — Section 03 built `useDropdown` at `src/sections/03-master-data/hooks/use-master-data.ts:186`
- **NO `usePermission` / `useCan`** — `useAuthStore().hasPermission(perm)` (from `src/stores/auth-store.ts:508`) is the canonical way; Section 03 wires this correctly.
- **NO `useOrgContext`** — `useOrgContextStore()` from `src/stores/org-context-store.ts:49` is the canonical way.

---

## 3. Module Components Catalog (`src/modules/*/components/`)

All 14 module component files. **These are existing reference implementations** of list/detail/CRUD/transition flows. Section 03 should study them as a pattern reference and reuse the underlying API clients, NOT copy the JSX.

### 3.1 `ProductModule` — `src/modules/product/components/ProductModule.tsx:205` (221 LOC)

- **Exports**: `ProductModule` (named export)
- **Internal sub-components**: `LoadingState`, `ErrorState`, `EmptyState`, `ProductDashboard`, `ProductList`, `CategoryList`, `BrandList`, `UOMList`
- **Tabs**: dashboard, products, categories, brands, uoms (5 tabs, manual `<button>` tab bar — NOT shadcn `<Tabs>`)
- **API calls** (all via `productApi` from `../api/client`):
  - `productApi.list({ page, search })` — list view
  - `productApi.list({ pageSize:1, status:'ACTIVE' })` — dashboard stat counts (4 parallel calls)
  - `productApi.transition(id, target, version)` — lifecycle transition (DRAFT → REVIEW → APPROVED → ACTIVE → DISCONTINUED)
  - `productApi.listCategories()`, `listBrands()`, `listUOMs()` — reference data dropdowns
- **CRUD**: list ✅, transition ✅, create ❌ (button is dead), update ❌, delete ❌, get ❌
- **Search**: ✅ via `search` state, no debounce
- **Pagination**: ✅ simple Prev/Next (page size 25 hard-coded), only shown when `total > 25`
- **Loading/error/empty**: ✅ inline `LoadingState`/`ErrorState`/`EmptyState` (NOT reusable — defined in same file)
- **Permission gating**: ❌ none — "New Product" button is always visible (click does nothing)
- **Status color maps**: `statusColors` (line 16), `typeColors` (line 20) — **DUPLICATED** in Section 03's `STATUS_COLORS` constant

### 3.2 `CustomerModule` — `src/modules/customer/components/CustomerModule.tsx:159` (171 LOC)

- **Exports**: `CustomerModule` (named export)
- **Sub-components**: `LoadingState`, `ErrorState`, `EmptyState`, `CustomerDashboard`, `CustomerList`, `GroupList`
- **Tabs**: dashboard, customers, groups
- **API calls** (`customerApi` from `../api/client`):
  - `customerApi.list({ page, search, status, customerType })`
  - `customerApi.transition(id, target, version)` — LEAD → PROSPECT → APPROVED → ACTIVE → BLOCKED
  - `customerApi.listGroups()`
- **CRUD**: list ✅, transition ✅, create ❌ (button dead), update ❌, delete ❌, get ❌, getCredit ❌
- **Search/Pagination**: same pattern as ProductModule
- **Permission gating**: ❌ none
- **Status color maps**: `statusColors` (line 15), `riskColors` (line 19), `typeColors` (line 20) — **DUPLICATED** in Section 03 constants

### 3.3 `SupplierModule` — `src/modules/supplier/components/SupplierModule.tsx:163` (177 LOC)

- **Exports**: `SupplierModule` (named export)
- **Sub-components**: `LoadingState`, `ErrorState`, `EmptyState`, `SupplierDashboard`, `SupplierList`, `CategoryList`
- **Tabs**: dashboard, suppliers, categories
- **API calls** (`supplierApi` from `../api/client`):
  - `supplierApi.list({ page, search, status, vendorType })`
  - `supplierApi.transition(id, target, version)` — DRAFT → VERIFICATION → APPROVED → ACTIVE → PROBATION → BLOCKED → BLACKLISTED
  - `supplierApi.listCategories()`
- **CRUD**: list ✅, transition ✅, create ❌, update ❌, delete ❌, get ❌, blacklist ❌
- **Permission gating**: ❌ none
- **Color maps**: `statusColors` (line 15), `riskColors` (line 20) — **DUPLICATED** in Section 03 constants

### 3.4 `WarehouseModule` (operational) — `src/modules/warehouse/components/WarehouseModule.tsx:7` (37 LOC)

- **Exports**: `WarehouseModule` (default export)
- **Purpose**: Loads bins for a single warehouse ID entered in an `<input>` field. Bare-bones display.
- **API calls** (`warehouseApi` from `../api/client`):
  - `warehouseApi.listBins(warehouseId)` — bins for one warehouse
- **CRUD**: list bins only. No zones, no aisles, no racks, no putaway tasks, no barcodes.
- **Search/pagination**: ❌ none
- **Loading/error/empty**: minimal loading spinner only; no error/empty states
- **Permission gating**: ❌ none
- **NOTE**: This is the OPERATIONAL warehouse (bins/putaway/barcodes). Section 03's `WarehouseModule` (master data) is a completely separate component in `src/sections/03-master-data/components/warehouse.tsx`.

### 3.5 `InventoryModule` — `src/modules/inventory/components/InventoryModule.tsx:7` (39 LOC)

- **Exports**: `InventoryModule` (default export)
- **Purpose**: Loads first 50 inventory items with summary stats (Total Items, Total Quantity, Expired count).
- **API calls** (`inventoryApi` from `../api/client`):
  - `inventoryApi.list({ page:1, pageSize:50 })`
- **CRUD**: list only. No stockIn/stockOut/ledger/transactions/reserve/block/expiring.
- **Search/pagination**: ❌ none (loads first 50)
- **Permission gating**: ❌ none

### 3.6 `OrganizationModule` — `src/modules/organization/components/OrganizationModule.tsx:688` (749 LOC)

**This is the most complete module and the closest template for what Section 03 should look like.**

- **Exports**: `OrganizationModule` (named export)
- **Sub-components** (defined in same file): `LoadingState`, `ErrorState`, `EmptyState`, `OrgDashboard`, `CompanyManagement`, `CompanyForm` (create dialog inline), `PlantManagement`, `WarehouseManagement`, `DepartmentManagement`, `CostCenterManagement`, `FinancialYearManagement`, `HierarchyTree` + internal `TreeNode`
- **Tabs**: dashboard, companies, plants, warehouses, departments, cost-centers, financial-years, hierarchy (8 tabs)
- **API calls** (all from `../api/client`):
  - `companyApi.list/get/create/update/delete/transition` — full CRUD + lifecycle
  - `plantApi.list/get/create/transition`
  - `warehouseApi.list/get/create`
  - `departmentApi.list/create`
  - `costCenterApi.list/create`
  - `financialYearApi.list/getCurrent/create`
  - `hierarchyApi.getTree()`
  - `authApi.getTestToken()` — temporary bootstrap token (called once on mount, lines 693-717)
- **CRUD**: 
  - **Companies**: list ✅, create ✅ (inline form with 9 fields), transition ✅ (DRAFT → CONFIGURED → ACTIVE → SUSPENDED), update ❌, delete ❌
  - **Plants**: list ✅, transition ✅, create ❌, update ❌
  - **Warehouses**: list ✅, create ❌ (no form)
  - **Departments**: list ✅, create ❌
  - **Cost Centers**: list ✅, create ❌
  - **Financial Years**: list ✅, create ❌
  - **Hierarchy**: ✅ full tree view with expand/collapse
- **Search**: ✅ per-tab `search` state
- **Pagination**: ✅ simple Prev/Next when `total > 25`
- **Loading/error/empty**: ✅ all three (inline, not reusable)
- **Permission gating**: ❌ none (visible to everyone)
- **Auth bootstrap**: this module has special bootstrapping code (lines 690-725) that gets a test token if no auth is persisted — this is **TEMPORARY DEAD CODE** that should be removed once real auth is fully wired.
- **`CompanyForm` component** (line 282) — a complete 9-field create form with code/name/legalName/gstin/email/phone/city/state/country. **Section 03 could REUSE this pattern** but it's not exported.

### 3.7 `UserManagementModule` — `src/modules/user-management/components/UserManagementModule.tsx:328` (352 LOC)

- **Exports**: `UserManagementModule` (named export)
- **Sub-components**: `LoadingState`, `ErrorState`, `EmptyState`, `UserDirectory`, `UserDetails`, `RoleManagement`, `PermissionMatrix`
- **Tabs**: users, roles, permissions, delegations (4 tabs; delegations tab shows EmptyState only)
- **API calls** (`userMgmtApi` from `../api/client`):
  - `userMgmtApi.listUsers({ page, search, status })`, `getUser(id)`, `lockUser(id)`, `unlockUser(id)`, `getUserSessions(id)`, `revokeAllSessions(id)`, `getUserLoginHistory(id)`
  - `userMgmtApi.listRoles({ page, search, category, status })`, `getRole(id)`, `createRole`, `updateRole`, `deleteRole`, `cloneRole`, `assignPermission`, `revokePermission`
  - `userMgmtApi.listPermissions({ module, group, search })`, `listPermissionModules()`, `listPermissionGroups()`
  - `userMgmtApi.listDelegations({ page, status })`
- **CRUD**:
  - Users: list ✅, get ✅, lock/unlock ✅, sessions ✅, login history ✅, create ❌ (button dead), update ❌, delete ❌
  - Roles: list ✅, get ✅, create ❌ (button dead), update ❌, delete ❌, clone ❌, assign/revoke perm ❌
  - Permissions: list ✅ (grouped by module)
- **Search**: ✅ per-tab `search` state + module filter on permissions
- **Pagination**: ✅ Prev/Next when `total > 25`
- **Loading/error/empty**: ✅ all three (inline, not reusable)
- **Permission gating**: ❌ none (ironic — the user-management module doesn't gate its own actions with `auth:manage_users` permission)
- **Status color map**: `statusColors` (line 27) — **DUPLICATED** in Section 03 constants

### 3.8–3.14 Other modules (lighter implementations)

| Module | File:Line | LOC | Export | API used | CRUD | Tabs |
|---|---|---|---|---|---|---|
| 3.8 `GoodsReceiptModule` | `goods-receipt/components/GoodsReceiptModule.tsx:15` | 42 | default | `goodsReceiptApi.list({page:1,pageSize:50})` | list only | 1 |
| 3.9 `ProcurementModule` | `procurement/components/ProcurementModule.tsx:150` | 161 | named | `procurementApi.list({page,search,status,priority})`, `transition(id,target,version,comments)` | list+transition (10-state PR workflow) | 2 (dashboard, requisitions) |
| 3.10 `PurchaseOrderModule` | `purchase-order/components/PurchaseOrderModule.tsx:193` | 198 | default | `purchaseOrderApi.list({page,pageSize,search,status,poType,supplierId,plantId,sortBy,sortOrder})` | list only (no create/transition despite API support) | 2 (dashboard, list) |
| 3.11 `QualityInspectionModule` | `quality-inspection/components/QualityInspectionModule.tsx:13` | 40 | default | `qualityInspectionApi.listLots({page:1,pageSize:50})` | list only | 1 |
| 3.12 `QuotationModule` | `quotation/components/QuotationModule.tsx:160` | 165 | default | `quotationApi.list({page,pageSize,search,status,rfqId,supplierId})` | list only | 2 (dashboard, list) |
| 3.13 `RfqModule` | `rfq/components/RfqModule.tsx:148` | 159 | named | `rfqApi.list({page,search,status})`, `transition(id,target,version)` | list+transition (8-state RFQ workflow) | 2 (dashboard, rfqs) |
| 3.14 `RfqModule` `Auth` | `auth/` | — | — | (no auth component — auth happens via `useAuthStore` and `authClient`) | — | — |

**Pattern uniformity**: All modules follow the same skeleton (Dashboard + List, manual tab bar, inline LoadingState/ErrorState/EmptyState, Prev/Next pagination, no permission gating). This is both an opportunity (extract these into shared primitives) and a hazard (every copy has subtle drift).

---

## 4. API Clients Catalog (`src/modules/*/api/client.ts`)

14 API clients. Every one uses the same `apiFetch<T>` helper pattern: reads `localStorage.getItem('suop_access_token')`, sets `Authorization: Bearer <token>`, parses `{success, data, error}` envelope, throws `Error(error.message)` on failure.

### 4.1 `productApi` — `src/modules/product/api/client.ts:28` (47 LOC)

**Types exported**: `Product`, `Category`, `Brand`, `UOM`
**Endpoints**:
| Method | Path | Purpose |
|---|---|---|
| `list({page,pageSize,search,productType,status})` | `GET /api/v1/catalog/products` | paginated list |
| `get(id)` | `GET /api/v1/catalog/products/:id` | single |
| `create(data)` | `POST /api/v1/catalog/products` | create |
| `update(id,data,version)` | `PATCH /api/v1/catalog/products/:id` (If-Match) | update |
| `delete(id,version)` | `DELETE /api/v1/catalog/products/:id` (If-Match) | delete |
| `transition(id,targetStatus,version)` | `POST /api/v1/catalog/products/:id/transition` | lifecycle |
| `lookupBarcode(barcode)` | `GET /api/v1/catalog/products/barcode/:barcode` | barcode lookup |
| `listCategories()` | `GET /api/v1/catalog/categories` | reference |
| `listBrands()` | `GET /api/v1/catalog/brands` | reference |
| `listUOMs()` | `GET /api/v1/catalog/uoms` | reference |

**Coverage**: ✅ full CRUD + transition + reference data

### 4.2 `customerApi` — `src/modules/customer/api/client.ts:14` (30 LOC)

**Types exported**: `Customer`, `CustomerGroup`
**Endpoints**:
| Method | Path |
|---|---|
| `list({page,search,status,customerType})` | `GET /api/v1/sales/customers` |
| `get(id)` | `GET /api/v1/sales/customers/:id` |
| `create(data)` | `POST /api/v1/sales/customers` |
| `update(id,data,version)` | `PATCH /api/v1/sales/customers/:id` (If-Match) |
| `delete(id,version)` | `DELETE /api/v1/sales/customers/:id` (If-Match) |
| `transition(id,targetStatus,version)` | `POST /api/v1/sales/customers/:id/transition` |
| `getCredit(id)` | `GET /api/v1/sales/customers/:id/credit` |
| `listGroups()` | `GET /api/v1/sales/customer-groups` |

**Coverage**: ✅ full CRUD + transition + credit + groups

### 4.3 `supplierApi` — `src/modules/supplier/api/client.ts:14` (30 LOC)

**Types exported**: `Supplier`, `SupplierCategory`
**Endpoints**:
| Method | Path |
|---|---|
| `list({page,search,status,vendorType})` | `GET /api/v1/procurement/suppliers` |
| `get(id)` | `GET /api/v1/procurement/suppliers/:id` |
| `create(data)` | `POST /api/v1/procurement/suppliers` |
| `update(id,data,version)` | `PATCH /api/v1/procurement/suppliers/:id` (If-Match) |
| `delete(id,version)` | `DELETE /api/v1/procurement/suppliers/:id` (If-Match) |
| `transition(id,targetStatus,version)` | `POST /api/v1/procurement/suppliers/:id/transition` |
| `blacklist(id,reason)` | `POST /api/v1/procurement/suppliers/:id/blacklist` |
| `listCategories()` | `GET /api/v1/procurement/supplier-categories` |

**Coverage**: ✅ full CRUD + transition + blacklist + categories

### 4.4 `warehouseApi` — `src/modules/warehouse/api/client.ts:26` (50 LOC)

**NOTE**: This is the OPERATIONAL warehouse API (bins/putaway/barcodes), NOT the master-data warehouse CRUD. For master-data warehouse CRUD use `companyApi`/`plantApi`/`warehouseApi` (the org one) from `src/modules/organization/api/client.ts`.

**Types exported**: `WarehouseBin`
**Endpoints**:
| Method | Path |
|---|---|
| `listZones(warehouseId)` | `GET /api/v1/warehouse/zones?warehouseId=` |
| `listAisles(warehouseId)` | `GET /api/v1/warehouse/aisles?warehouseId=` |
| `listRacks(warehouseId)` | `GET /api/v1/warehouse/racks?warehouseId=` |
| `listBins(warehouseId,{zoneId,aisleId,rackId})` | `GET /api/v1/warehouse/bins?warehouseId=...` |
| `createBin(data)` | `POST /api/v1/warehouse/bins` |
| `listPutawayTasks({page,status,warehouseId})` | `GET /api/v1/warehouse/putaway-tasks` |
| `createPutawayTask(data)` | `POST /api/v1/warehouse/putaway-tasks` |
| `completePutaway(id,version)` | `POST /api/v1/warehouse/putaway-tasks/:id/complete` |
| `createBarcode(data)` | `POST /api/v1/warehouse/barcodes` |
| `printBarcode(id)` | `POST /api/v1/warehouse/barcodes/:id/print` |
| `scan(barcode,scanType)` | `POST /api/v1/warehouse/scan` |

**Coverage**: ✅ zones/aisles/racks/bins read + bin create + putaway CRUD + barcode create/print + scan

### 4.5 `inventoryApi` — `src/modules/inventory/api/client.ts:33` (62 LOC)

**Types exported**: `Inventory`
**Endpoints**:
| Method | Path |
|---|---|
| `list({page,pageSize,productId,warehouseId,expired})` | `GET /api/v1/inventory/inventory` |
| `get(id)` | `GET /api/v1/inventory/inventory/:id` |
| `stockIn(data)` | `POST /api/v1/inventory/inventory/stock-in` |
| `stockOut(data)` | `POST /api/v1/inventory/inventory/stock-out` |
| `listLedger({page,productId,warehouseId})` | `GET /api/v1/inventory/ledger` |
| `listTransactions({page,movementType})` | `GET /api/v1/inventory/transactions` |
| `reserve(data)` | `POST /api/v1/inventory/reservations` |
| `block(data)` | `POST /api/v1/inventory/blocks` |
| `getExpiring(days)` | `GET /api/v1/inventory/expiry?days=` |

**Coverage**: ✅ list + get + stockIn/Out + ledger + transactions + reserve + block + expiring. **Missing**: adjustments, transfers, physical counts, batch genealogy.

### 4.6 Organization API clients — `src/modules/organization/api/client.ts:200` (357 LOC)

This file exports **8 separate API objects** plus an inline `authApi` for test-token bootstrap. **This is the single largest client file (357 LOC) and the most complete.**

**Types exported**: `Company`, `Plant`, `Warehouse` (org-level, NOT operational), `Department`, `CostCenter`, `FinancialYear`, `HierarchyNode`, `PaginatedResponse<T>`, `SingleResponse<T>`, `ErrorResponse`

**Clients exported**:

#### 4.6.1 `companyApi` (lines 200–236)
- `list({page,pageSize,search})` → `GET /api/v1/organization/companies`
- `get(id)` → `GET /api/v1/organization/companies/:id`
- `create(data)` → `POST /api/v1/organization/companies`
- `update(id,data,version)` → `PATCH .../:id` (If-Match)
- `delete(id,version)` → `DELETE .../:id` (If-Match)
- `transition(id,targetStatus,version)` → `POST .../:id/transition`
- **Coverage**: ✅ full CRUD + lifecycle (DRAFT → CONFIGURED → ACTIVE → SUSPENDED → ARCHIVED)

#### 4.6.2 `plantApi` (lines 240–263)
- `list`, `get`, `create`, `transition` — no `update`, no `delete`
- **Coverage**: list+get+create+transition only. **Section 03 should add `update`/`delete` if backend supports them.**

#### 4.6.3 `warehouseApi` (org-level — lines 267–285)
- `list({page,pageSize,search,plantId})`, `get(id)`, `create(data)` — no `update`, no `delete`, no `transition`
- **NOTE**: This is a DIFFERENT `warehouseApi` from the one in §4.4. Section 03 imports both and aliases the org one as `orgWarehouseApi` (`src/sections/03-master-data/api/clients.ts:16`).

#### 4.6.4 `departmentApi` (lines 289–303)
- `list`, `create` only

#### 4.6.5 `costCenterApi` (lines 307–321)
- `list`, `create` only

#### 4.6.6 `financialYearApi` (lines 325–341)
- `list`, `getCurrent()`, `create` — no update/delete/close

#### 4.6.7 `hierarchyApi` (lines 345–348)
- `getTree()` → `GET /api/v1/organization/hierarchy`

#### 4.6.8 `authApi` (lines 352–357) — TEMPORARY BOOTSTRAP
- `getTestToken()` → `POST /api/v1/_internal/smoke-test/token`
- **Purpose**: For dev before real auth is fully wired. **Should be removed in production.**

**Helpers exported**: `setAuthToken(token)`, `getAuthToken()` (lines 151–169) — used by OrganizationModule's bootstrap. These duplicate the `localStorage.getItem('suop_access_token')` pattern used by every other client.

### 4.7 `authClient` — `src/modules/auth/api/client.ts:62` (93 LOC)

**Types exported**: `LoginResponse`, `CurrentUser`
**Endpoints**:
| Method | Path |
|---|---|
| `login(email,password)` | `POST /api/v1/auth/login` |
| `logout(refreshToken)` | `POST /api/v1/auth/logout` |
| `refresh(refreshToken)` | `POST /api/v1/auth/refresh` |
| `getCurrentUser()` | `GET /api/v1/auth/me` |
| `changePassword(currentPassword,newPassword)` | `POST /api/v1/auth/change-password` |
| `forgotPassword(email)` | `POST /api/v1/auth/forgot-password` |
| `resetPassword(token,newPassword)` | `POST /api/v1/auth/reset-password` |
| `listSessions()` | `GET /api/v1/auth/sessions` |
| `revokeSession(tokenHash)` | `POST /api/v1/auth/sessions/:tokenHash/revoke` |
| `listDevices()` | `GET /api/v1/auth/devices` |
| `inviteUser(params)` | `POST /api/v1/auth/invite` |
| `acceptInvitation(params)` | `POST /api/v1/auth/accept-invitation` |

**Coverage**: ✅ complete auth surface (login/logout/refresh/me/password/sessions/devices/invitations). **NOTE**: The auth store (`src/stores/auth-store.ts`) has its OWN inline `backendLogin`/`backendRefresh`/`backendLogout` functions (lines 140–213) that DUPLICATE this client. The store does this to avoid a circular dependency. This is a documented technical-debt item.

### 4.8 `goodsReceiptApi` — `src/modules/goods-receipt/api/client.ts:27` (41 LOC)

**Types exported**: `GoodsReceipt`
**Endpoints**: `list({page,pageSize,search,status,supplierId,poId})`, `get(id)`, `create(data)`, `transition(id,targetStatus,version)`
**Coverage**: list + get + create + lifecycle

### 4.9 `procurementApi` — `src/modules/procurement/api/client.ts:13` (26 LOC)

**Types exported**: `PurchaseRequisition`
**Endpoints**: `list({page,search,status,priority})`, `get(id)`, `create(data)`, `transition(id,targetStatus,version,comments)`, `delete(id,version)`
**Coverage**: full CRUD + lifecycle + delete

### 4.10 `purchaseOrderApi` — `src/modules/purchase-order/api/client.ts:47` (77 LOC)

**Types exported**: `PurchaseOrder`
**Endpoints** (16 methods — most comprehensive after Organization):
- `list({page,pageSize,search,status,poType,supplierId,plantId,sortBy,sortOrder})`
- `get(id)`, `create(data)`, `update(id,data,version)`, `delete(id,version)`
- `transition(id,targetStatus,version,extra)`
- `issue(id,version)`, `cancel(id,version,reason)`, `close(id,version)`
- `supplierAccept(id,version,notes)`, `supplierReject(id,version,notes)`, `supplierCounter(id,version,counterTotal,notes)`
- `revision(id,version,reason)`, `fromQuotation(data)`
- `pdf(id)`, `exportPdf(id)`, `search(criteria)`

**Coverage**: ✅ enterprise-grade (16 methods including PDF export and supplier counter-offer)

### 4.11 `qualityInspectionApi` — `src/modules/quality-inspection/api/client.ts:27` (54 LOC)

**Types exported**: `InspectionLot`
**Endpoints**: `listLots({page,pageSize,search,status,grnId})`, `getLot(id)`, `createLot(data)`, `startInspection(id,version)`, `recordResult(id,data)`, `transitionLot(id,targetStatus,version)`, `listNcrs({page,status})`, `listHolds({page,status})`

### 4.12 `quotationApi` — `src/modules/quotation/api/client.ts:105` (122 LOC)

**Types exported**: `Quotation`, `QuotationLine`, `QuotationComparison`, `ComparisonResult`
**Endpoints**: `list`, `get`, `create`, `update`, `delete`, `transition`, `compare(rfqId)`

### 4.13 `rfqApi` — `src/modules/rfq/api/client.ts:13` (27 LOC)

**Types exported**: `Rfq`
**Endpoints**: `list`, `get`, `create`, `update`, `delete`, `transition`, `inviteSupplier(id,data)`

### 4.14 `userMgmtApi` — `src/modules/user-management/api/client.ts:20` (79 LOC)

**Types exported**: `UserListItem`, `RoleItem`, `PermissionItem`
**Endpoints** (16 methods):
- Users: `listUsers`, `getUser`, `lockUser`, `unlockUser`, `assignRole`, `revokeRole`, `getUserSessions`, `revokeAllSessions`, `getUserLoginHistory`
- Roles: `listRoles`, `getRole`, `createRole`, `updateRole`, `deleteRole`, `cloneRole`, `assignPermission`, `revokePermission`
- Permissions: `listPermissions`, `listPermissionModules`, `listPermissionGroups`
- Delegations: `listDelegations`

**Coverage**: ✅ complete admin surface.

---

## 5. Stores Catalog (`src/stores/`)

### 5.1 `useAuthStore` — `src/stores/auth-store.ts:217` (566 LOC, Zustand)

**State shape** (lines 51–69):
```ts
{
  user: AppUser | null,           // {id,email,username,firstName,lastName,roles[],permissions[],tenantId,defaultCompanyId,defaultPlantId,designation}
  session: AuthSession | null,    // {accessToken,refreshToken,accessExpiresAt,refreshExpiresAt}
  isLoading: boolean,
  isAuthenticated: boolean,
  error: string | null,
  isDemoMode: boolean,
  authMode: 'backend' | 'supabase' | 'local' | 'demo' | 'none'
}
```

**Actions**:
- `initialize()` — restores session from localStorage, falls back to Supabase, then to login screen. Sets up multi-tab sync via `window.addEventListener('storage', ...)`.
- `login(email,password)` — tries backend JWT first, then Supabase, then local fallback (any email/password works).
- `loginDemo()` — instant demo access with all permissions.
- `logout()` — clears storage, calls backend logout if backend mode.
- `clearError()`
- `hasPermission(perm: string): boolean` — **the canonical permission gate**. Returns true if `isDemoMode`, or user has `SUPER_ADMIN` role, or `user.permissions.includes(perm)`.
- `hasRole(role: string): boolean`
- `getAccessToken(): string | null`
- `refreshSession(): Promise<boolean>`

**Permission constants** (lines 552–565, `ALL_PERMISSIONS`): 30 literals covering org/auth/product/supplier/customer/po/quot/grn/quality/inventory/audit/system domains.

**Persistence**: `localStorage['suop_auth']` (JSON blob), `localStorage['suop_access_token']` (raw JWT), `localStorage['suop_refresh_token']`.

**Critical helper for Section 03**: `const { hasPermission } = useAuthStore()` then `hasPermission('product:create')`.

### 5.2 `useOrgContextStore` — `src/stores/org-context-store.ts:49` (101 LOC, Zustand + persist)

**State shape**:
```ts
{
  enterpriseId, enterpriseName,
  companyId, companyName,
  branchId, branchName,
  plantId, plantName,
  warehouseId, warehouseName,
  departmentId, departmentName
}  // all string | null
```

**Actions**: `setEnterprise`, `setCompany`, `setBranch`, `setPlant`, `setWarehouse`, `setDepartment`, `clearBelow(level)`, `reset()`, `getBreadcrumb(): Array<{level, name}>`

**Persistence**: `localStorage['suop-org-context']` via `persist` middleware.

**Used by**: `src/app/page.tsx` (TopBar Organization Context picker). **NOT used by Section 03 modules** — Section 03 currently does NOT scope queries by current company/plant/warehouse. This is a known gap.

---

## 6. Existing Section 03 State (`src/sections/03-master-data/`)

This is the prior agent's extraction work. 13 files, ~5,596 LOC.

### 6.1 `index.ts` (37 LOC) — Barrel

Re-exports all 9 components + `api/clients`, `hooks/use-master-data`, `constants/master-data`, `utils/helpers`. Used by `src/app/page.tsx:47-57`.

### 6.2 `api/clients.ts` (243 LOC) — Unified API Service Layer

- **Re-exports**: `productApi`, `customerApi`, `supplierApi`, `companyApi`, `plantApi`, `orgWarehouseApi`, `departmentApi`, `costCenterApi`, `financialYearApi`, `hierarchyApi`, `warehouseApi`, `inventoryApi` (12 existing clients)
- **Adds 3 new clients**:
  - `pricingApi` — list/create PriceLists, Promotions, Coupons, TaxConfigs; `calculate(data)` (line 127)
  - `gstApi` — `list`, `get` for `/api/v1/finance/gst` (line 173)
  - `financeApi` — list/create Currencies, ExchangeRates for `/api/v1/finance/foundation/*` (line 204)
- **Adds lightweight toast pub/sub** (lines 221–238): `pushToast(kind, msg)`, `subscribeToasts(fn)`, types `ToastKind`, `ToastEntry`
- **Re-exports**: `useAuthStore` from `@/stores/auth-store` (line 242)

#### 🚨 CRITICAL BUG IN SECTION 03 TOAST SYSTEM

`subscribeToasts` is **exported but NEVER imported anywhere** (verified via `rg "subscribeToasts" src/` → only the definition at line 229). This means every `pushToast('info', '...')` call in Section 03 components fires the pub/sub event, but **NO listener is wired to the shadcn `<Toaster />`**. Result: **Section 03's toasts are invisible to the user.**

The proper fix is to delete the entire custom toast pub/sub from `api/clients.ts` (lines 221–238) and replace every `pushToast(kind, msg)` call in Section 03 components with `toast({ title: ..., variant: ... })` from `@/hooks/use-toast.ts:145` (or the `useToast()` hook).

### 6.3 `hooks/use-master-data.ts` (214 LOC) — Data fetching hooks

Five hooks, all written from scratch (NOT using React Query, NOT using shadcn primitives):

| Hook | Line | Signature | Purpose |
|---|---|---|---|
| `useList<T>` | 36 | `(fetcher, {initialPage, initialPageSize, enabled, search}) => ListState<T>` | Paginated list fetcher. Returns `{data, loading, error, page, pageSize, total, totalPages, refresh, setPage, setPageSize}`. |
| `useRecord<T>` | 96 | `(fetcher, deps[], {enabled}) => RecordState<T>` | Single-record fetcher. Returns `{data, loading, error, refresh}`. |
| `useMutation` | 138 | `(fn, {successMsg, errorMsg, onSuccess}) => MutationState` | Mutation wrapper with toast side-effect via `pushToast`. |
| `useDebouncedSearch` | 168 | `(initialValue='', delay=350) => {search, setSearch, debouncedSearch}` | Debounced search input. |
| `useDropdown<T>` | 186 | `(fetcher, deps[]) => {items, loading}` | Cached lookup for dropdowns (categories, brands, UOMs). |

**These hooks are Section-03-specific — they live under `src/sections/03-master-data/hooks/`, NOT under `src/hooks/`**. Other sections cannot import them. They should be **promoted to `src/hooks/`** if other sections need them.

### 6.4 `constants/master-data.ts` (294 LOC) — Shared Constants

- `STATUS_COLORS` (line 12) — 35-status color map
- `PRODUCT_TYPES` (9 types), `PRODUCT_LIFECYCLE_STATES` + `PRODUCT_LIFECYCLE_TRANSITIONS`
- `CUSTOMER_LIFECYCLE_STATES` + `_TRANSITIONS`
- `SUPPLIER_LIFECYCLE_STATES` + `_TRANSITIONS`
- `ORG_LIFECYCLE_STATES`
- `CUSTOMER_TYPES` (9), `VENDOR_TYPES` (7), `SUPPLIER_TYPES` (3), `PLANT_TYPES` (5), `WAREHOUSE_TYPES` (12), `COST_CENTER_TYPES` (4), `RISK_LEVELS` (4), `PAYMENT_TERMS` (6), `FIFO_STRATEGIES` (3), `COSTING_METHODS` (5), `PROCUREMENT_TYPES` (3), `ABC_CLASSES` (3), `XYZ_CLASSES` (3), `GST_RATES` (7), `BARCODE_TYPES` (9), `ADDRESS_TYPES` (9), `COMPLIANCE_TYPES` (9)
- Validation regexes: `GSTIN_REGEX`, `PAN_REGEX`, `PINCODE_REGEX`, `PHONE_REGEX`, `EMAIL_REGEX`
- `PAGE_SIZE_OPTIONS` = `[10, 25, 50, 100, 250]`
- `API_BASE` constant

**DUPLICATION NOTE**: `STATUS_COLORS` here is a generic Tailwind-color-based map (line 12). The per-module `statusColors` maps inside `src/modules/*/components/*.tsx` (e.g., ProductModule line 16, CustomerModule line 15, SupplierModule line 15, UserManagementModule line 27) are slightly different — they use `bg-{color}-100 text-{color}-700` (pastel-style). Both patterns coexist. The Section 03 `STATUS_COLORS` constant is currently used only by `product-master.tsx` (line 320).

### 6.5 `utils/helpers.ts` (168 LOC) — Shared Utilities

- `s28BadgeForStatus(status): {cls, label}` — line 12, **70-entry status→badge map** (preserved verbatim from page.tsx:11157). Used by `plant-master.tsx:182` and `warehouse.tsx` (via import).
- `formatINR(value)` — Indian Rupee currency formatter (line 85)
- `formatNumber(value, locale)` — line 92
- `formatDate(value)` — Indian date format (line 99)
- `formatDateTime(value)` — line 108
- `relativeTime(value)` — "5m ago" style (line 117)
- `exportToCSV(filename, headers, rows)` — line 135, **unused in any Section 03 component** (product-master.tsx has its own inline CSV impl at line 252–263)
- `validateGSTIN/PAN/Email/Phone/Pincode(value): boolean` — lines 150–168

### 6.6 Section 03 Components — Wire-up Status Matrix

| # | Component | LOC | Live APIs wired? | Mock arrays remaining? | Permission gated? | CRUD flows? |
|---|---|---|---|---|---|---|
| 1 | `product-master.tsx` | 346 | ✅ `productApi.list`, `create`, `listCategories/Brands/UOMs` | ❌ none | ✅ `product:create` | ✅ Create (28-field dialog) |
| 2 | `pim.tsx` | 152 | ✅ `productApi.listCategories`, `productApi.list` | ⚠️ static `compliance[]` + `approvals[]` arrays (lines 57–66) | ❌ none | ❌ none |
| 3 | `commercial-engine.tsx` | 684 | ✅ `pricingApi.calculate` (ResolutionTab migrated from mini-service) | ⚠️ static price lists, tax configs, discounts, promotions, future prices, approvals, cost, rules arrays | ❌ none | ❌ none (10 buttons dead) |
| 4 | `business-partner.tsx` | 657 | ✅ `customerApi.list` + `supplierApi.list` (BPPartnersTab unified) | ⚠️ static addresses, contacts, financial, compliance, groups, banking, relationships, scorecards arrays | ❌ none | ❌ none (10 buttons dead with toast info) |
| 5 | `identification.tsx` | 712 | ✅ `inventoryApi.list` (IDTraceabilityTab migrated from mini-service) | ⚠️ static barcodes, QR, batches, lots, serials, GS1, labels, print arrays | ❌ none | ❌ none (8 buttons dead) |
| 6 | `governance.tsx` | 628 | ❌ no live APIs | ⚠️ static lifecycle, approvals, imports, exports, validation, duplicates, audit, quality, history arrays | ❌ none | ❌ none (10+ buttons dead) |
| 7 | `warehouse.tsx` | 690 | ✅ `orgWarehouseApi.list` (WarehouseWarehousesTab — with fallback) | ⚠️ 9 mock arrays (WHM_WAREHOUSES, WHM_ZONES, WHM_TEMP_ZONES, WHM_RULES, WHM_RECOMMENDED, WH_LOC_AISLES, WH_LOC_RACKS, WH_LOC_BINS, WH_LOC_CAPACITY_LOGS) | ❌ none | ❌ none |
| 8 | `warehouse-locations.tsx` | 557 | ❌ no live APIs | ⚠️ 4 mock arrays (WH_LOC_AISLES, WH_LOC_RACKS, WH_LOC_BINS, WH_LOC_CAPACITY_LOGS) | ❌ none | ❌ none |
| 9 | `plant-master.tsx` | 216 | ✅ `plantApi.list`, `plantApi.create` | ❌ none | ✅ `org:create` | ✅ Create (8-field form) |

**Summary**: 5 of 9 components have live API data. 30+ dead buttons emit invisible `pushToast('info', '...')` calls (the toast pub/sub is unwired). Only 2 components gate create flows with permissions.

---

## 7. Duplicates Found (Section 03 Reinvented the Wheel)

### 7.1 TOAST SYSTEM — most critical duplication

- **What exists**: shadcn toast system at `src/hooks/use-toast.ts:145` (`toast()` function) + `src/components/ui/toaster.tsx:15` (consumer). `<Toaster />` mounted globally in `src/app/layout.tsx:34`.
- **What Section 03 built**: custom pub/sub at `src/sections/03-master-data/api/clients.ts:221-238` (`pushToast`, `subscribeToasts`, `ToastKind`, `ToastEntry`).
- **Why it's broken**: `subscribeToasts` is exported but **never called anywhere**. The pub/sub fires events into a void. Section 03's `pushToast('info', '...')` calls (40+ of them) are silently no-ops.
- **Fix**: Delete the custom pub/sub. Replace every `pushToast(kind, msg)` call with `toast({ title: msg, variant: kind === 'error' ? 'destructive' : 'default' })` imported from `@/hooks/use-toast`. This wires Section 03 into the global `<Toaster />` immediately.

### 7.2 STATUS COLOR MAPS — 6+ copies

Each module defines its own `statusColors: Record<string, string>`:
- `src/modules/product/components/ProductModule.tsx:16` (6 statuses)
- `src/modules/customer/components/CustomerModule.tsx:15` (7 statuses)
- `src/modules/supplier/components/SupplierModule.tsx:15` (8 statuses)
- `src/modules/organization/components/OrganizationModule.tsx:53` (5 statuses)
- `src/modules/user-management/components/UserManagementModule.tsx:27` (7 statuses)
- `src/modules/goods-receipt/components/GoodsReceiptModule.tsx:8`
- `src/modules/procurement/components/ProcurementModule.tsx:16`
- `src/modules/purchase-order/components/PurchaseOrderModule.tsx:15`
- `src/modules/quality-inspection/components/QualityInspectionModule.tsx:7`
- `src/modules/quotation/components/QuotationModule.tsx:15`
- `src/modules/rfq/components/RfqModule.tsx:15`
- `src/sections/03-master-data/constants/master-data.ts:12` (`STATUS_COLORS` — 35 statuses)
- `src/sections/03-master-data/utils/helpers.ts:12` (`s28BadgeForStatus` — 70 statuses)
- `src/sections/03-master-data/components/warehouse.tsx:99` (`WAREHOUSE_STATUS_COLORS` — 4 statuses)
- `src/sections/03-master-data/components/warehouse.tsx:64, 78, 91, 106` (4 more color maps)
- Plus ~25 more color maps in `src/app/page.tsx` lines 7977–11154

**Fix**: Promote `s28BadgeForStatus` (the most complete 70-entry map) to `src/lib/badges.ts`. Delete all per-module copies.

### 7.3 LoadingState / ErrorState / EmptyState — 12+ copies

Every module defines its own three inline helper components. Verified copies in:
- `src/modules/product/components/ProductModule.tsx:12-14`
- `src/modules/customer/components/CustomerModule.tsx:11-13`
- `src/modules/supplier/components/SupplierModule.tsx:11-13`
- `src/modules/organization/components/OrganizationModule.tsx:25-50`
- `src/modules/user-management/components/UserManagementModule.tsx:19-25`
- `src/modules/procurement/components/ProcurementModule.tsx:12-14`
- `src/modules/purchase-order/components/PurchaseOrderModule.tsx:11-13`
- `src/modules/quotation/components/QuotationModule.tsx:11-13`
- `src/modules/rfq/components/RfqModule.tsx:11-13`

Plus informal variants inline in `goods-receipt`, `inventory`, `quality-inspection`, `warehouse` modules.

**Fix**: Create `src/components/states.tsx` exporting `<LoadingState/>`, `<ErrorState msg onRetry/>`, `<EmptyState icon msg/>`. Replace all inline copies.

### 7.4 Manual Tab Bar — 9+ copies

Every module rolls its own tab bar with `<button>` + `cn()` for active styling:
- `src/modules/product/components/ProductModule.tsx:209-213`
- `src/modules/customer/components/CustomerModule.tsx:163-165`
- `src/modules/supplier/components/SupplierModule.tsx:167-171`
- `src/modules/organization/components/OrganizationModule.tsx:729-737`
- `src/modules/user-management/components/UserManagementModule.tsx:334-342`
- `src/modules/procurement/components/ProcurementModule.tsx:154-156`
- `src/modules/rfq/components/RfqModule.tsx:151-154`
- `src/sections/03-master-data/components/business-partner.tsx:96-104`
- `src/sections/03-master-data/components/warehouse.tsx` (similar)

The shadcn `<Tabs>` primitive (`src/components/ui/tabs.tsx`) exists but is **never used by any module**.

**Fix**: Replace manual tab bars with shadcn `<Tabs>`.

### 7.5 Manual Pagination — 9+ copies

Every list view has its own Prev/Next `<Button>` pair. The shadcn `<Pagination>` primitive (`src/components/ui/pagination.tsx`) is **never used**.

### 7.6 Manual `<table>` — 14+ copies

Every list view uses raw `<table className="w-full">`. The shadcn `<Table>` primitive (`src/components/ui/table.tsx`) is **never used by any module** (only the Toaster uses no table).

### 7.7 formatINR / formatCurrency — 3+ copies

- `src/sections/03-master-data/utils/helpers.ts:85` (`formatINR`)
- `src/modules/purchase-order/components/PurchaseOrderModule.tsx:44` (`formatCurrency`)
- `src/modules/quotation/components/QuotationModule.tsx:26` (`formatCurrency`)
- Plus inline `₹${Number(x).toLocaleString('en-IN')}` patterns in 20+ places

**Fix**: Promote `formatINR` to `src/lib/format.ts`.

### 7.8 inline `<select>` — 14+ copies

Every module uses raw `<select className="...">` instead of shadcn `<Select>` primitive. The shadcn `<Select>` is **never used by any module**.

### 7.9 Manual Form (FormData) — Section 03 vs. shadcn `<Form>`

- Section 03's `CreateProductDialog` (`product-master.tsx:57-103`) reads fields via `new FormData(e.currentTarget)` and `fd.get('fieldName')` — works but no client-side validation.
- shadcn `<Form>` + `<FormField>` (`src/components/ui/form.tsx`) uses react-hook-form + zod resolver. **`<Form>` is never used by any module**. This is the largest missed opportunity — Section 03's 28-field Product create form should use it.

### 7.10 Two `warehouseApi` exports with the same name

- `src/modules/warehouse/api/client.ts:26` exports `warehouseApi` (operational: bins, putaway, barcodes)
- `src/modules/organization/api/client.ts:267` exports `warehouseApi` (master-data: list, get, create)

Section 03's `api/clients.ts:14-20` imports both and aliases the org one as `orgWarehouseApi`. This works but is confusing — any consumer must remember which is which. **Fix**: Rename the org one to `orgWarehouseApi` at the source.

### 7.11 Auth store duplicates `authClient` logic inline

- `src/stores/auth-store.ts:140-213` defines `backendLogin`, `backendRefresh`, `backendLogout` as inline functions (using `fetch` directly)
- `src/modules/auth/api/client.ts:62` exports `authClient` with `login`, `refresh`, `logout` methods

The store's inline versions exist to avoid a circular import (`authClient` imports nothing from stores, but the store creator said the inline version avoids "circular dep with modules/auth/api/client.ts"). The inline versions are 100% duplicate logic.

**Fix**: Refactor so `authClient` exports pure fetch helpers and the store calls them. Or merge `authClient` into the store entirely.

### 7.12 Section 03 `product-master.tsx` CSV export duplicates `utils/helpers.ts`

- `src/sections/03-master-data/utils/helpers.ts:135` exports `exportToCSV(filename, headers, rows)`
- `src/sections/03-master-data/components/product-master.tsx:252-263` defines its own inline CSV impl

**Fix**: Call the shared `exportToCSV` helper.

### 7.13 Permission helper exists in two places

- `src/stores/auth-store.ts:508` — `hasPermission(perm)` on the store (canonical)
- `src/sections/03-master-data/api/clients.ts:242` — re-exports `useAuthStore` (so `useAuthStore().hasPermission(...)` works)

The re-export is harmless but unnecessary — components can import directly from `@/stores/auth-store`. Some Section 03 components do `import { useAuthStore as useSectionAuth } from '../api/clients'` (e.g., `business-partner.tsx:59`) which is a needless indirection.

---

## 8. Lib Utilities Catalog (`src/lib/`)

Only 3 files, 142 LOC total.

### 8.1 `cn(...)` — `src/lib/utils.ts:4`

```ts
export function cn(...inputs: ClassValue[]): string
```
- Uses `clsx` + `tailwind-merge`
- **The single most-used utility in the codebase** — imported by every module, every Section 03 component, every shadcn primitive.

### 8.2 `db` — `src/lib/db.ts:7`

```ts
export const db: PrismaClient
```
- Singleton PrismaClient (with global caching for Next.js hot reload).
- **Used by**: server-side code only. NO module or Section 03 component imports this (they all use `fetch()` against `API_BASE` instead).
- **Note**: There is also `apps/backend/src/core/db/client.ts` (the backend's Prisma client) — the frontend `src/lib/db.ts` appears to be **dead code**.

### 8.3 `supabase` and auth helpers — `src/lib/supabase.ts`

- `supabase: SupabaseClient | null` — null if env vars not set
- `isSupabaseConfigured: boolean`
- `AUTH_PROVIDERS: Record<AuthProvider, {label, icon, enabled}>` — 6 providers (LOCAL enabled, others disabled)
- Functions: `signInWithEmail`, `signUpWithEmail`, `signOut`, `getSession`, `getCurrentUser`, `refreshSession`, `sendPasswordResetEmail`, `updatePassword`, `onAuthStateChange`
- **Used by**: `src/stores/auth-store.ts:19-26` (imports `supabase`, `isSupabaseConfigured`, `signInWithEmail`, `signOut as supabaseSignOut`, `getSession`, `getCurrentUser`). All 6 helper functions are wrapped by the auth store. Direct import by components is not recommended.

### Lib utilities that DON'T exist (but should):

- `src/lib/format.ts` — `formatINR`, `formatNumber`, `formatDate`, `formatDateTime`, `relativeTime` (currently in Section 03's `utils/helpers.ts`)
- `src/lib/badges.ts` — `badgeForStatus(status)` returning `{cls, label}` (currently `s28BadgeForStatus` in Section 03)
- `src/lib/csv.ts` — `exportToCSV(filename, headers, rows)` (currently in Section 03)
- `src/lib/validate.ts` — `validateGSTIN/PAN/Email/Phone/Pincode` (currently in Section 03)
- `src/lib/api.ts` — shared `apiFetch<T>(path, options)` helper (currently duplicated inline in 14 module API clients)

---

## 9. Page.tsx Helpers Catalog (`src/app/page.tsx`)

`src/app/page.tsx` is 37,619 lines and contains 340 top-level functions. It is the monolith that Section 03 was extracted from.

### 9.1 Helper functions actually defined at top level (not module components)

Only **2 helpers** of general use:

| Function | File:Line | Signature | Purpose |
|---|---|---|---|
| `s28BadgeForStatus` | `src/app/page.tsx:11157` | `(status: string) => {cls: string, label: string}` | 70-entry status → badge class+label map. **DUPLICATED** in `src/sections/03-master-data/utils/helpers.ts:12` (verbatim copy). |
| `s28PriorityBadge` | `src/app/page.tsx:11203` | `(priority: string) => string` | 4-entry priority → color class map (EMERGENCY/HIGH/NORMAL/LOW). **NOT extracted to Section 03** — still inline in page.tsx. |

Plus 2 helper arrays at line 11154–11155:
- `S28_WAREHOUSES = ['WH-MUM-MAIN', 'WH-DEL-NORTH', 'WH-BLR-CENTRAL', 'WH-HYD-WEST']`
- `S28_ZONES = ['A-Receiving', 'B-Bulk', 'C-Picking', 'D-Pack', 'E-Dispatch', 'F-Cold']`

### 9.2 Color maps in page.tsx (relevant to Section 03 — would need to be consolidated)

Lines 7977–11154 contain ~40 `*_COLORS: Record<string, string>` maps, including:
- `WAREHOUSE_TYPE_COLORS` (line 7977), `ZONE_TYPE_COLORS` (line 7991), `TEMP_ZONE_COLORS` (line 8004), `WAREHOUSE_STATUS_COLORS` (line 8012), `ENFORCEMENT_COLORS` (line 8019)
- `TRAFFIC_DIRECTION_COLORS` (line 8397), `PICKING_LEVEL_COLORS` (line 8404), `ACCESSIBILITY_COLORS` (line 8411), `BIN_TYPE_COLORS` (line 8418), `BIN_STATUS_COLORS` (line 8426), `BIN_TEMP_ZONE_COLORS` (line 8436), `ALERT_TYPE_COLORS` (line 8444)
- `RECV_TYPE_COLORS` (line 8857), `ASN_STATUS_COLORS` (line 8868), `APPT_STATUS_COLORS` (line 8878), `APPT_PRIORITY_COLORS` (line 8888), `DOCK_TYPE_COLORS` (line 8895), `DOCK_STATUS_COLORS` (line 8904), `EXCEPTION_TYPE_COLORS` (line 8911), `RESOLUTION_STATUS_COLORS` (line 8922), `GATE_STATUS_COLORS` (line 8931)
- `PUTAWAY_TYPE_COLORS`, `PUTAWAY_STATUS_COLORS`, `PUTAWAY_PRIORITY_COLORS`, `STRATEGY_COLORS`, `PALLET_TYPE_COLORS`, `PALLET_STATUS_COLORS`, `FORKLIFT_TYPE_COLORS`, `FORKLIFT_STATUS_COLORS` (lines 9311–9372)
- 10 more color maps for fulfillment/packing/dispatch (lines 9806–10565)

**Section 03 components have INLINE copies** of `WAREHOUSE_TYPE_COLORS`, `ZONE_TYPE_COLORS`, `TEMP_ZONE_COLORS`, `WAREHOUSE_STATUS_COLORS`, `ENFORCEMENT_COLORS` (verified in `src/sections/03-master-data/components/warehouse.tsx:64-110`). These are byte-for-byte duplicates of page.tsx lines 7977–8019.

### 9.3 Mock data arrays in page.tsx that Section 03 also has copies of

Section 03 components duplicate these mock arrays from page.tsx (both copies still exist):
- `WHM_WAREHOUSES`, `WHM_ZONES`, `WHM_TEMP_ZONES`, `WHM_RULES`, `WHM_RECOMMENDED` (page.tsx:8025–8062 vs warehouse.tsx:112–149)
- `WH_LOC_AISLES`, `WH_LOC_RACKS`, `WH_LOC_BINS`, `WH_LOC_CAPACITY_LOGS` (page.tsx:8451–8494 vs warehouse.tsx:630–680 and warehouse-locations.tsx:117–160)

**Status**: The page.tsx versions are dead code (the inline `WarehouseModule` in page.tsx just delegates to the extracted Section 03 component). The Section 03 copies are still actively rendered. Both should be deleted once warehouse.tsx is wired to `warehouseApi.list/get/create` (org-level) and `warehouseApi.listBins/listZones/listAisles/listRacks` (operational).

### 9.4 What page.tsx Section 03 helpers do NOT exist

- No generic CSV export utility (Section 03's `exportToCSV` is the only copy)
- No generic date formatter (Section 03's `formatDate`/`formatDateTime`/`relativeTime` are the only copies)
- No generic currency formatter (page.tsx uses inline `Intl.NumberFormat` calls in 30+ places)
- No generic validation helpers (Section 03's `validateGSTIN/PAN/Email/Phone/Pincode` are the only copies)
- No generic pagination component
- No generic status badge component

---

## 10. What Section 03 Should Reuse Before Writing New Code — Final Checklist

### 10.1 APIs that EXIST and are READY to be called (no new client code needed)

| Section 03 Need | Existing Client | Method | Endpoint |
|---|---|---|---|
| Product list/create/CRUD | `productApi` (§4.1) | `list`, `create`, `update`, `delete`, `transition`, `get`, `lookupBarcode`, `listCategories`, `listBrands`, `listUOMs` | `/api/v1/catalog/*` |
| Customer list/create/CRUD | `customerApi` (§4.2) | `list`, `create`, `update`, `delete`, `transition`, `getCredit`, `listGroups` | `/api/v1/sales/customers*` |
| Supplier list/create/CRUD | `supplierApi` (§4.3) | `list`, `create`, `update`, `delete`, `transition`, `blacklist`, `listCategories` | `/api/v1/procurement/suppliers*` |
| Company CRUD | `companyApi` (§4.6.1) | full CRUD + lifecycle | `/api/v1/organization/companies*` |
| Plant list+create+transition | `plantApi` (§4.6.2) | list, get, create, transition (no update/delete) | `/api/v1/organization/plants*` |
| Warehouse (master) list+get+create | `orgWarehouseApi` (§4.6.3) | list, get, create (no update/delete/transition) | `/api/v1/organization/warehouses*` |
| Department list+create | `departmentApi` (§4.6.4) | list, create | `/api/v1/organization/departments*` |
| Cost Center list+create | `costCenterApi` (§4.6.5) | list, create | `/api/v1/organization/cost-centers*` |
| Financial Year list+create+getCurrent | `financialYearApi` (§4.6.6) | list, getCurrent, create | `/api/v1/organization/financial-years*` |
| Org Hierarchy tree | `hierarchyApi` (§4.6.7) | `getTree()` | `/api/v1/organization/hierarchy` |
| Warehouse bins/putaway/barcodes | `warehouseApi` operational (§4.4) | 11 methods | `/api/v1/warehouse/*` |
| Inventory list/stockIn/Out/ledger/transactions/reserve/block/expiring | `inventoryApi` (§4.5) | 9 methods | `/api/v1/inventory/*` |
| Pricing (price lists, promotions, coupons, tax configs, calculate) | `pricingApi` (§6.2 of Section 03 clients) | 9 methods | `/api/v1/sales/pricing/*` |
| GST config | `gstApi` (§6.2 of Section 03 clients) | list, get | `/api/v1/finance/gst*` |
| Currency + exchange rate | `financeApi` (§6.2 of Section 03 clients) | list+create for currencies + exchange rates | `/api/v1/finance/foundation/*` |

### 10.2 Generic primitives Section 03 should USE from shadcn (currently underused)

- `<Tabs>` from `@/components/ui/tabs` instead of manual tab bars (replace 9+ manual copies)
- `<Table>` from `@/components/ui/table` instead of raw `<table>` (replace 14+ raw tables)
- `<Select>` from `@/components/ui/select` instead of raw `<select>` (replace 14+ raw selects)
- `<Pagination>` from `@/components/ui/pagination` instead of manual Prev/Next (replace 9+ manual copies)
- `<Skeleton>` from `@/components/ui/skeleton` instead of `<div className="animate-pulse">`
- `<Form>` + `<FormField>` from `@/components/ui/form` for the Product create dialog (28 fields)
- `<AlertDialog>` for destructive-action confirmations (delete, blacklist)
- `<Dialog>` for create/edit modals (currently `product-master.tsx:108` uses raw `<div className="fixed inset-0">`)
- `<Calendar>` + `<Popover>` for date fields (validity dates, financial year start/end)
- `<toast>` from `@/hooks/use-toast` instead of custom `pushToast` pub/sub

### 10.3 Generic hooks Section 03 should USE (already built but not shared)

- `useAuthStore().hasPermission(perm)` from `@/stores/auth-store` — already used, keep doing this
- `useOrgContextStore()` from `@/stores/org-context-store` — **NOT YET USED** by Section 03; should be used to scope queries by current company/plant/warehouse
- `useList`, `useRecord`, `useMutation`, `useDebouncedSearch`, `useDropdown` from Section 03's own `hooks/use-master-data.ts` — these are reusable **across all Section 03 components** but currently only `product-master.tsx` and `plant-master.tsx` actually use them

### 10.4 Generic constants Section 03 should USE (already built)

- `STATUS_COLORS` from `constants/master-data.ts:12`
- `s28BadgeForStatus` from `utils/helpers.ts:12` (more complete — 70 entries)
- `PRODUCT_TYPES`, `CUSTOMER_TYPES`, `VENDOR_TYPES`, `WAREHOUSE_TYPES`, `PLANT_TYPES`, `BARCODE_TYPES`, `GST_RATES`, `FIFO_STRATEGIES`, `COSTING_METHODS`, `ABC_CLASSES`, `XYZ_CLASSES`, `RISK_LEVELS`, `PAYMENT_TERMS`, etc. from `constants/master-data.ts`
- `formatINR`, `formatDate`, `formatDateTime`, `relativeTime` from `utils/helpers.ts`
- `exportToCSV` from `utils/helpers.ts:135` (currently NOT used — product-master has its own inline copy)
- `validateGSTIN`, `validatePAN`, `validateEmail`, `validatePhone`, `validatePincode` from `utils/helpers.ts`
- `GSTIN_REGEX`, `PAN_REGEX`, `PINCODE_REGEX`, `PHONE_REGEX`, `EMAIL_REGEX` from `constants/master-data.ts:281-285`

### 10.5 Things that DO NOT exist and MUST be built before they're claimed as reusable

- `<DataTable>` — does not exist; Section 03 lists all use raw `<table>` or shadcn `<Table>` (once adopted)
- `<Combobox>` — does not exist; would need to compose `Popover + Command`
- `<DatePicker>` / date range picker — does not exist; only `<Calendar>` is available
- `<EmptyState>` / `<LoadingState>` / `<ErrorState>` / `<PageHeader>` / `<StatCard>` — do not exist as shared components
- `<FileUpload>` / `<Dropzone>` — does not exist; needed for import wizards
- `<ConfirmDialog>` — does not exist; compose from `<AlertDialog>`
- Generic `useList` / `useMutation` / `useDebouncedSearch` / `useDropdown` in `src/hooks/` — currently live ONLY under `src/sections/03-master-data/hooks/`. To share with other sections, **promote them** to `src/hooks/`.
- Generic `apiFetch<T>` helper in `src/lib/` — currently duplicated inline in every API client. Should be extracted.

---

## 11. Critical Action Items for Section 03 (Prioritized)

1. **🚨 FIX THE TOAST SYSTEM** — Delete `pushToast`/`subscribeToasts`/`ToastKind`/`ToastEntry` from `src/sections/03-master-data/api/clients.ts:221-238`. Replace every `pushToast(kind, msg)` call in Section 03 components with `toast({ title: msg, variant: kind === 'error' ? 'destructive' : 'default' })` from `@/hooks/use-toast`. This makes 40+ dead toasts visible immediately.

2. **PROMOTE Section 03 hooks** to `src/hooks/` (`use-list.ts`, `use-record.ts`, `use-mutation.ts`, `use-debounced-search.ts`, `use-dropdown.ts`) so other sections can use them.

3. **PROMOTE Section 03 utils** to `src/lib/` (`format.ts`, `badges.ts`, `csv.ts`, `validate.ts`). Update imports in Section 03 components.

4. **PROMOTE Section 03 constants** to `src/lib/master-data-constants.ts` (or split into per-domain files).

5. **EXTRACT** `LoadingState`/`ErrorState`/`EmptyState` to `src/components/states.tsx`. Replace 12+ inline copies.

6. **ADOPT shadcn `<Tabs>`** for all tab bars (replace 9+ manual copies).

7. **ADOPT shadcn `<Table>`** for all list views (replace 14+ raw tables).

8. **ADOPT shadcn `<Select>`** for all dropdowns (replace 14+ raw selects).

9. **ADOPT shadcn `<Form>` + react-hook-form + zod** for the Product create dialog (replace FormData-based parsing).

10. **DELETE dead mock arrays** in `warehouse.tsx` and `warehouse-locations.tsx` once warehouse API is wired.

11. **REMOVE `authApi.getTestToken()` bootstrap** from `OrganizationModule` (lines 690–725) — replaced by real auth via `useAuthStore`.

12. **WIRE `useOrgContextStore()`** into all Section 03 list queries — currently no list view is scoped by company/plant/warehouse.

13. **CONSOLIDATE color maps** — promote `s28BadgeForStatus` (70 entries) to `src/lib/badges.ts`; delete per-module `statusColors` copies.

14. **RENAME** `warehouseApi` in `src/modules/organization/api/client.ts:267` to `orgWarehouseApi` at the source (currently aliased only at Section 03 import time).

15. **MERGE** `authClient` (in `src/modules/auth/api/client.ts`) into `useAuthStore` or refactor the store's inline `backendLogin`/`backendRefresh`/`backendLogout` to call `authClient` — eliminate the duplicated auth-fetch logic.

---

## End of raw findings. Summary delivered to user in final message.

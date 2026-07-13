# 05 — Shared Types Architecture

**Date**: 2026-07-13
**Status**: FINAL

---

## 1. Purpose

Types (TypeScript interfaces) are **separated from API client code**. API files contain only client objects and their method implementations. Types live in `src/types/` and are imported by both API clients and UI components.

## 2. Why Separate Types?

| Concern | API File | Types File |
|---|---|---|
| Contains | `export const inventoryApi = { list() {...}, ... }` | `export interface Inventory { id: string, ... }` |
| Changes when | Backend endpoint changes | Entity shape changes |
| Used by | API consumers (hooks, components) | API files + UI components + stores |
| Size | ~100-200 lines per domain | ~50-100 lines per domain |

**Enterprise Comparison**: SAP's DDIC (Data Dictionary) separates data elements from function modules. Oracle's ADF separates Entity Objects from service interfaces. SUOP separates types from API clients.

## 3. File Structure

```
src/types/
├── common.ts              ← Shared types (PaginatedResponse, SingleResponse, ErrorResponse, ListParams)
├── organization.ts        ← Company, Plant, Warehouse, Department, CostCenter, FinancialYear, HierarchyNode
├── catalog.ts             ← Product, Category, Brand, UOM
├── partners.ts            ← Customer, CustomerGroup, Supplier, SupplierCategory
├── inventory.ts           ← Inventory, InventoryTransaction, InventoryLedger, StockReservation, StockBlock, Batch
├── warehouse.ts           ← WarehouseZone, WarehouseAisle, WarehouseRack, WarehouseBin, PutawayTask, BarcodeLabel, ScanLog, GoodsReceipt
├── procurement.ts         ← PurchaseRequisition, PurchaseOrder, Quotation, Rfq
├── sales.ts               ← SalesOrder, Allocation, WavePlan, PickList, PackingList, Shipment, DeliveryOrder, PriceList, Promotion, Coupon, TaxConfig
├── manufacturing.ts       ← Batch, Recipe, Bom, Routing, WorkCenter, Machine, Shift
├── quality.ts             ← InspectionLot, Ncr, Capa, Coa, QualityHold
├── finance.ts             ← ProductCost, GstConfig, Currency, ExchangeRate, JournalEntry, ChartOfAccount, FiscalYear, FiscalPeriod
├── hr.ts                  ← AttendanceRecord, PerformanceCycle
├── crm.ts                 ← CrmActivity, Lead, Opportunity, Complaint
├── administration.ts      ← LoginResponse, CurrentUser, UserListItem, RoleItem, PermissionItem
└── index.ts               ← Barrel: re-exports all types
```

## 4. Type Ownership Rules

| Rule | Description |
|---|---|
| One entity = one type definition | `Inventory` is defined ONCE in `src/types/inventory.ts` — never duplicated in API files or components |
| Types are domain-scoped | `Inventory` lives in `inventory.ts`, not in `common.ts` |
| API files import types | `import type { Inventory } from '@/types'` — API files do NOT export types |
| Components import types | `import type { Inventory } from '@/types'` — components do NOT define their own types |
| Shared types in common.ts | `PaginatedResponse<T>`, `SingleResponse<T>`, `ErrorResponse`, `ListParams` — used by ALL domains |

## 5. Common Types

```typescript
// src/types/common.ts
export interface PaginatedMeta { total: number; page: number; pageSize: number; totalPages?: number }
export interface PaginatedResponse<T> { success: boolean; data: T[]; meta: PaginatedMeta }
export interface SingleResponse<T> { success: boolean; data: T; message?: string }
export interface ErrorResponse { success: false; error: { code: string; message: string; details?: Array<{ field: string; code: string; message: string }> } }
export interface ListParams { page?: number; pageSize?: number; search?: string; status?: string; [key: string]: string | number | undefined }
```

## 6. Migration Path

1. Create `src/types/` with all 15 files
2. Move types from existing API client files to their domain type file
3. Update API files to `import type { ... } from '@/types'`
4. Update components to import types from `@/types` instead of from API client files
5. Delete inline type definitions from API client files
6. `src/lib/api.ts` types (`PaginatedResponse`, etc.) move to `src/types/common.ts`
7. `src/lib/api.ts` re-exports types from `@/types/common` for backward compat

## 7. Backward Compatibility

During migration, existing imports like `import { type Inventory } from '@/modules/inventory/api/client'` will continue to work because the API client file will re-export the type:
```typescript
// src/api/inventory.ts (after migration)
import type { Inventory } from '@/types'
export type { Inventory }  // backward compat re-export
```

---

**END OF SHARED TYPES ARCHITECTURE**

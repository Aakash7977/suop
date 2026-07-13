# 03 — Dependency Map

**Section**: 03 — Master Data Management
**Date**: 2026-07-13

---

## 1. Section 03 Internal Dependencies

```
Organization Module (Section 01)
    ↓ provides Company, BU, Division, Region
    ↓
Plant Master ← depends on Organization (regionId)
    ↓ provides manufacturing plants
    ↓
Warehouse Master ← depends on Plant (plantId)
    ↓ provides storage facilities
    ↓
Storage Locations (Bins/Aisles/Racks) ← depends on Warehouse (warehouseId)
    ↓
Product Master ← depends on Category, Brand, UOM (all from catalog)
    ↓ referenced by Inventory, Manufacturing, Sales, Procurement
    ↓
Customer Master ← depends on Customer Groups
Supplier Master ← depends on Supplier Categories
    ↓ both referenced by Sales, Procurement, Finance
    ↓
Commercial Engine ← depends on Product (price), Customer (discounts), Tax Config
    ↓ provides price calculation
    ↓
Identification & Traceability ← depends on Product (barcodes), Inventory (batches/lots)
    ↓ provides traceability chain
    ↓
Data Governance ← overlays ALL master data (lifecycle, audit, validation)
```

## 2. External Module Dependencies (Reused, NOT Duplicated)

| Section 03 Module | Reuses From | Purpose |
|---|---|---|
| All modules | `useAuthStore` (`@/stores/auth-store`) | Permission gating, user context |
| All modules | `useOrgContextStore` (`@/stores/org-context-store`) | Company/plant/warehouse scoping |
| All modules | `toast()` (`@/hooks/use-toast`) | Toast notifications |
| All modules | shadcn UI primitives (`@/components/ui/*`) | Button, Card, Input, Badge, Dialog, AlertDialog, etc. |
| All modules | `cn()` (`@/lib/utils`) | Tailwind class merging |
| All modules | `apiFetch` pattern (`@/lib/api`) | HTTP client with auth |
| ProductMaster | `productApi` (`@/modules/product/api/client`) | Product CRUD + lifecycle |
| BusinessPartner | `customerApi` (`@/modules/customer/api/client`) | Customer CRUD + lifecycle |
| BusinessPartner | `supplierApi` (`@/modules/supplier/api/client`) | Supplier CRUD + lifecycle + blacklist |
| PlantMaster | `plantApi` (`@/modules/organization/api/client`) | Plant CRUD + lifecycle |
| Warehouse | `orgWarehouseApi` (`@/modules/organization/api/client`) | Warehouse master CRUD |
| Warehouse | `warehouseApi` (`@/modules/warehouse/api/client`) | WMS operations (zones, bins, putaway) |
| Identification | `inventoryApi` (`@/modules/inventory/api/client`) | Batches, ledger, transactions |
| CommercialEngine | `pricingApi` (`@/sections/03-master-data/api/clients`) | Price lists, promotions, coupons, calculate |

## 3. Shared Code Promoted for Future Sections

| Shared File | Location | Reusable By |
|---|---|---|
| `formatINR`, `formatDate`, etc. | `src/lib/format.ts` | ALL sections |
| `badgeForStatus` | `src/lib/badges.ts` | ALL sections |
| `exportToCSV` | `src/lib/csv.ts` | ALL sections |
| `validateGSTIN/PAN/Email/Phone/Pincode` | `src/lib/validate.ts` | ALL sections |
| `apiFetch`, `buildQueryString` | `src/lib/api.ts` | ALL API clients |
| Master data constants | `src/lib/master-data-constants.ts` | ALL sections |
| `useList` | `src/hooks/use-list.ts` | ALL sections |
| `useRecord` | `src/hooks/use-record.ts` | ALL sections |
| `useMutation` | `src/hooks/use-mutation.ts` | ALL sections |
| `useDebouncedSearch` | `src/hooks/use-debounced-search.ts` | ALL sections |
| `useDropdown` | `src/hooks/use-dropdown.ts` | ALL sections |
| `<LoadingState>` | `src/components/shared/loading-state.tsx` | ALL sections |
| `<ErrorState>` | `src/components/shared/error-state.tsx` | ALL sections |
| `<EmptyState>` | `src/components/shared/empty-state.tsx` | ALL sections |
| `<ConfirmDialog>` | `src/components/shared/confirm-dialog.tsx` | ALL sections |

## 4. Backend Module Dependencies

```
product ← depends on → (none — leaf entity)
customer ← depends on → customer_groups
supplier ← depends on → supplier_categories, products (via product_mappings)
organization ← depends on → (self-contained hierarchy)
warehouse ← depends on → organization (warehouses belong to plants)
inventory ← depends on → products, warehouses, batches, lots
pricing-engine ← depends on → products, customers, price_lists, promotions, coupons
gst-taxation ← depends on → (standalone config)
recipe-bom ← depends on → products
product-costing ← depends on → products
financial-foundation ← depends on → (standalone foundation)
general-ledger ← depends on → financial-foundation (fiscal years, periods)
```

---

**END OF DEPENDENCY MAP**

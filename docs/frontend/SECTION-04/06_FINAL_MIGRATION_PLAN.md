# 06 — Final Migration Plan

**Date**: 2026-07-13
**Status**: FINAL (pending approval)

---

## 1. Migration Overview

| Metric | Value |
|---|---|
| Files to CREATE | ~40 (14 domain API files + 9 core files + 15 type files + 2 barrels) |
| Files to MOVE | 24 existing clients (14 from modules + 3 from Sec03 + 7 from Sec04) |
| Files to DELETE (after migration) | 16 old `api/client.ts` files + 2 section-local `clients.ts` files |
| Files to UPDATE (imports) | ~60+ files across page.tsx, sections, stores, modules/components |
| Estimated effort | 6-8 hours |
| Risk | LOW — backward compat maintained via re-exports |

## 2. Migration Phases

### Phase A: Create Infrastructure (1 hour)
1. Create `src/api/core/` with 9 files (api-fetch, auth, interceptors, errors, pagination, query-builder, upload, retry, index)
2. Create `src/types/` with 15 files (common + 14 domain type files + index)
3. Create `src/api/index.ts` master barrel (initially empty — will be populated in Phase B)

### Phase B: Create Domain API Files (2 hours)
For each of the 14 domain files:
1. Create `src/api/<domain>.ts`
2. Copy client code from source location
3. Replace inline `apiFetch` with `import { apiFetch } from '@/api/core'`
4. Replace inline types with `import type { ... } from '@/types'`
5. Add to `src/api/index.ts` barrel

**Order** (by dependency — foundational first):
1. `src/api/administration.ts` (authApi, userApi) — no dependencies on other domains
2. `src/api/catalog.ts` (catalogApi) — no dependencies
3. `src/api/partners.ts` (customerApi, supplierApi) — no dependencies
4. `src/api/organization.ts` (organizationApi) — no dependencies
5. `src/api/inventory.ts` (inventoryApi) — no dependencies
6. `src/api/warehouse.ts` (warehouseApi, goodsReceiptApi) — no dependencies
7. `src/api/procurement.ts` (procurementApi, purchaseOrderApi, quotationApi, rfqApi) — no dependencies
8. `src/api/quality.ts` (qualityApi) — no dependencies
9. `src/api/finance.ts` (costingApi, gstApi, financeFoundationApi, glApi) — no dependencies
10. `src/api/sales.ts` (salesOrderApi, fulfillmentApi, pickPackApi, deliveryApi, returnsApi, pricingApi) — depends on catalog for product lookups (but uses API, not direct import)
11. `src/api/manufacturing.ts` (batchApi, recipeApi, mesApi) — no dependencies
12. `src/api/hr.ts` (attendanceApi, performanceApi) — no dependencies
13. `src/api/crm.ts` (crmApi) — no dependencies
14. `src/api/bi.ts` (alertsApi) — no dependencies

### Phase C: Update Imports (3 hours)
For each consumer file, replace old import paths with new:

| Old Import | New Import |
|---|---|
| `import { inventoryApi } from '@/modules/inventory/api/client'` | `import { inventoryApi } from '@/api'` |
| `import { productApi } from '@/modules/product/api/client'` | `import { catalogApi } from '@/api'` |
| `import { companyApi } from '@/modules/organization/api/client'` | `import { organizationApi } from '@/api'` |
| `import { pricingApi } from '@/sections/03-master-data/api/clients'` | `import { pricingApi } from '@/api'` |
| `import { costingApi } from '@/sections/04-operations/api/clients'` | `import { costingApi } from '@/api'` |
| `import { customerApi } from '@/modules/customer/api/client'` | `import { customerApi } from '@/api'` |
| `import { supplierApi } from '@/modules/supplier/api/client'` | `import { supplierApi } from '@/api'` |
| `import { type Inventory } from '@/modules/inventory/api/client'` | `import type { Inventory } from '@/types'` |
| `import { type Product } from '@/modules/product/api/client'` | `import type { Product } from '@/types'` |
| `import { apiFetch } from '@/lib/api'` | `import { apiFetch } from '@/api/core'` |

**Files to update** (by category):
- `src/app/page.tsx` — ~10 import changes
- `src/sections/03-master-data/**/*.tsx` — ~20 import changes
- `src/sections/03-master-data/api/clients.ts` — re-export from `@/api` (then delete)
- `src/sections/04-operations/**/*.tsx` — ~40 import changes
- `src/sections/04-operations/api/clients.ts` — re-export from `@/api` (then delete)
- `src/sections/04-operations/utils/helpers.ts` — promote `s28PriorityBadge` to `@/lib/badges`
- `src/stores/auth-store.ts` — update auth imports
- `src/modules/*/components/*.tsx` — update any API client imports (14 files)

### Phase D: Create Backward Compat Shims (30 min)
For each old `src/modules/*/api/client.ts` file, replace contents with a re-export:
```typescript
// src/modules/inventory/api/client.ts (shim — to be deleted later)
export { inventoryApi } from '@/api'
export type { Inventory } from '@/types'
```

This ensures any imports not yet updated continue to work.

### Phase E: Verify Build (30 min)
1. Run `npx next build` — must pass
2. Run `npx tsc --noEmit` — must pass (no type errors)
3. Manual smoke test — navigate to each section, verify data loads

### Phase F: Delete Old Files (30 min)
After build passes:
1. Delete `src/sections/03-master-data/api/clients.ts`
2. Delete `src/sections/04-operations/api/clients.ts`
3. Delete `src/modules/*/api/client.ts` (14 files)
4. Delete `src/lib/api.ts` (replaced by `src/api/core/`)
5. Verify build still passes

### Phase G: Promote s28PriorityBadge (5 min)
1. Move `s28PriorityBadge` from `src/sections/04-operations/utils/helpers.ts` to `src/lib/badges.ts`
2. Update `src/sections/04-operations/utils/helpers.ts` to re-export from `@/lib/badges`
3. Delete `S28_WAREHOUSES` and `S28_ZONES` mock data (replace with live API when modules are wired)

## 3. Backward Compatibility Strategy

| Concern | Strategy |
|---|---|
| Old imports break | Phase D creates re-export shims — old paths still work |
| Type imports break | Types re-exported from old locations during migration |
| Section 01/02/03 break | Shims ensure old imports work until Phase F cleanup |
| Build breaks | Phase E verifies build BEFORE any deletions |
| Runtime breaks | No runtime changes — only import paths change |

## 4. Rollback Plan

If migration fails:
1. `git revert` to pre-migration commit
2. All old files restored
3. No data loss (migration is code-only, no database changes)

## 5. Success Criteria

| Criterion | Verification |
|---|---|
| Build passes | `npx next build` succeeds |
| TypeScript passes | `npx tsc --noEmit` succeeds |
| No old import paths | `grep -r "from '@/modules/.*/api/client'" src/` returns 0 results |
| No section-local API clients | `find src/sections -name "clients.ts" -path "*/api/*"` returns 0 results |
| All clients in src/api/ | `ls src/api/*.ts` shows 14 domain files + core/ + index.ts |
| Types in src/types/ | `ls src/types/*.ts` shows 15 type files + index.ts |
| UI unchanged | Manual smoke test — all sections render identically |

## 6. Post-Migration Architecture

```
src/
├── api/
│   ├── core/               (9 files — shared HTTP infrastructure)
│   ├── administration.ts   (authApi, userApi)
│   ├── catalog.ts          (catalogApi)
│   ├── partners.ts         (customerApi, supplierApi)
│   ├── organization.ts     (organizationApi)
│   ├── inventory.ts        (inventoryApi)
│   ├── warehouse.ts        (warehouseApi, goodsReceiptApi)
│   ├── procurement.ts      (procurementApi, purchaseOrderApi, quotationApi, rfqApi)
│   ├── sales.ts            (salesOrderApi, fulfillmentApi, pickPackApi, deliveryApi, returnsApi, pricingApi)
│   ├── manufacturing.ts    (batchApi, recipeApi, mesApi)
│   ├── quality.ts          (qualityApi)
│   ├── finance.ts          (costingApi, gstApi, financeFoundationApi, glApi)
│   ├── hr.ts               (attendanceApi, performanceApi)
│   ├── crm.ts              (crmApi)
│   ├── bi.ts               (alertsApi)
│   └── index.ts            (master barrel)
├── types/
│   ├── common.ts
│   ├── organization.ts
│   ├── catalog.ts
│   ├── ... (15 files total)
│   └── index.ts
├── components/
│   ├── ui/                 (shadcn primitives)
│   └── shared/             (LoadingState, ErrorState, EmptyState, ConfirmDialog)
├── hooks/                  (useList, useMutation, useDebouncedSearch, etc.)
├── lib/                    (format, csv, validate, badges, utils)
├── stores/                 (auth-store, org-context-store)
├── sections/
│   ├── 03-master-data/     (UI only — NO api/ folder)
│   └── 04-operations/      (UI only — NO api/ folder)
└── app/
    └── page.tsx            (thin orchestrator)
```

**Total files**: ~70 in `src/api/` + `src/types/` (vs 18 scattered across `src/modules/*/api/` + `src/sections/*/api/` today)

---

**END OF FINAL MIGRATION PLAN — AWAITING APPROVAL**

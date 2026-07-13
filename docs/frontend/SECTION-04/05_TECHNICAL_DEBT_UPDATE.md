# 05 — Technical Debt Update

**Date**: 2026-07-13
**Status**: TECHNICAL DEBT REGISTER

---

## Debt Register

| # | Debt Item | Severity | Source | Current Status | Fix Required | Effort |
|---|---|---|---|---|---|---|
| TD-01 | 12 existing clients have inline `apiFetch` | MEDIUM | Pre-existing (Sections 01-03) | 12 files with duplicate fetch logic | Replace with `import { apiFetch } from '@/lib/api'` | 1 hour |
| TD-02 | 3 Section 03 clients in section-local file | HIGH | Section 03 R2 | `pricingApi`, `gstApi`, `financeApi` in `src/sections/03-master-data/api/clients.ts` | Move to `src/api/sales/pricing.ts`, `src/api/finance/gst.ts`, `src/api/finance/foundation.ts` | 30 min |
| TD-03 | 7 Section 04 clients in section-local file | HIGH | Section 04 Phase 2 | All 7 in `src/sections/04-operations/api/clients.ts` | Move to respective `src/api/<domain>/` directories | 1 hour |
| TD-04 | `s28PriorityBadge` not promoted to shared lib | LOW | Section 04 Phase 1 | In `src/sections/04-operations/utils/helpers.ts` | Promote to `src/lib/badges.ts` | 5 min |
| TD-05 | `S28_WAREHOUSES` / `S28_ZONES` mock data in utils | LOW | Section 04 Phase 1 | In `src/sections/04-operations/utils/helpers.ts` | Delete when modules wired to live API | 5 min |
| TD-06 | Section 04 uses manual useState+useEffect instead of `useList` | MEDIUM | Section 04 Phase 2 | 8 modules with inline data fetching | Replace with `useList` from `@/hooks/use-list` | 2 hours |
| TD-07 | Section 04 uses manual search instead of `useDebouncedSearch` | LOW | Section 04 Phase 2 | 3 modules with non-debounced search | Replace with `useDebouncedSearch` | 30 min |
| TD-08 | `useOrgContextStore` not used by any Section 04 module | MEDIUM | Section 04 Phase 2 | All queries unscoped | Pass `warehouseId` / `plantId` from org context | 1 hour |
| TD-09 | 4 backend modules have NO frontend client | MEDIUM | Pre-existing | `mes`, `customer-returns`, `performance-management`, `alerts-kpi-engine` | Create clients in `src/api/` | 1 hour |
| TD-10 | `src/lib/db.ts` is dead frontend code | LOW | Pre-existing | PrismaClient singleton imported nowhere on frontend | Move to `src/lib/server/db.ts` or delete | 5 min |
| TD-11 | `src/lib/supabase.ts` auth helpers duplicated by `auth-store.ts` inline | MEDIUM | Pre-existing | Store has inline `backendLogin`/`backendRefresh` that duplicate `authClient` | Refactor store to call `authClient` | 2 hours |
| TD-12 | Two `warehouseApi` exports with same name | LOW | Pre-existing | `src/modules/warehouse/api/client.ts` and `src/modules/organization/api/client.ts` both export `warehouseApi` | Rename org one to `orgWarehouseApi` at source (already aliased at import) | 10 min |

---

## Priority Order for Debt Resolution

### Immediate (Before Phase 3 Implementation)
1. **TD-03**: Move 7 Section 04 clients to `src/api/` (1 hour)
2. **TD-02**: Move 3 Section 03 clients to `src/api/` (30 min)
3. **TD-04**: Promote `s28PriorityBadge` (5 min)
4. **TD-12**: Rename `warehouseApi` in org client (10 min)

### During Phase 4-7
5. **TD-01**: Replace 12 inline `apiFetch` with shared import (1 hour)
6. **TD-06**: Replace manual useState+useEffect with `useList` (2 hours)
7. **TD-07**: Replace manual search with `useDebouncedSearch` (30 min)
8. **TD-08**: Add org context scoping (1 hour)
9. **TD-09**: Create 4 missing clients (1 hour)

### Long-Term
10. **TD-05**: Delete mock data constants (5 min — done incrementally)
11. **TD-10**: Remove dead `db.ts` (5 min)
12. **TD-11**: Refactor auth store to use authClient (2 hours)

**Total effort**: ~10 hours

---

**END OF TECHNICAL DEBT UPDATE**

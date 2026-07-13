# 04 — Shared Infrastructure Review

**Date**: 2026-07-13
**Status**: REVIEW COMPLETE

---

## 1. Current Shared Artifacts

### src/lib/ (8 files)

| File | Exports | Used By | Correct Location? |
|---|---|---|---|
| `api.ts` | `apiFetch`, `getApiBase`, `getAuthToken`, `buildQueryString`, types (`PaginatedResponse`, `SingleResponse`, `ErrorResponse`, `ListParams`, `PaginatedMeta`) | Section 04 new clients (7), Section 03 re-exports | ✅ Yes |
| `badges.ts` | `badgeForStatus` (70-entry map) | Section 03 (via re-export), Section 04 (via re-export) | ✅ Yes |
| `csv.ts` | `exportToCSV` | Section 03, Section 04 | ✅ Yes |
| `format.ts` | `formatINR`, `formatNumber`, `formatDate`, `formatDateTime`, `relativeTime` | Section 03 | ✅ Yes |
| `validate.ts` | `validateGSTIN`, `validatePAN`, `validateEmail`, `validatePhone`, `validatePincode`, regex constants | Section 03 | ✅ Yes |
| `utils.ts` | `cn` (clsx + tailwind-merge) | ALL modules, ALL sections | ✅ Yes |
| `master-data-constants.ts` | `STATUS_COLORS`, lifecycle states, type enums, page size options | Section 03 | ✅ Yes |
| `db.ts` | `db` (PrismaClient singleton) | Server-side only (dead code on frontend) | ⚠️ Should be in `src/lib/server/` or removed |
| `supabase.ts` | `supabase`, auth helpers | `src/stores/auth-store.ts` | ✅ Yes |

### src/hooks/ (7 files)

| File | Exports | Used By Section 03? | Used By Section 04? | Correct Location? |
|---|---|---|---|---|
| `use-toast.ts` | `toast`, `useToast` | ✅ Yes | ✅ Yes (all 38 modules) | ✅ Yes |
| `use-list.ts` | `useList`, `ListState` | ✅ Yes | ❌ NOT YET (manual patterns used) | ✅ Yes |
| `use-record.ts` | `useRecord`, `RecordState` | ✅ Yes | ❌ NOT YET | ✅ Yes |
| `use-mutation.ts` | `useMutation`, `MutationState` | ✅ Yes | ❌ NOT YET | ✅ Yes |
| `use-debounced-search.ts` | `useDebouncedSearch` | ✅ Yes | ❌ NOT YET (manual search state) | ✅ Yes |
| `use-dropdown.ts` | `useDropdown` | ✅ Yes | ❌ NOT YET | ✅ Yes |
| `use-mobile.ts` | `useIsMobile` | shadcn sidebar | ❌ NOT USED | ✅ Yes |

### src/components/shared/ (5 files)

| File | Exports | Used By Section 03? | Used By Section 04? | Correct Location? |
|---|---|---|---|---|
| `loading-state.tsx` | `LoadingState`, `LoadingCard` | ✅ Yes | ✅ Yes (all 38 modules import) | ✅ Yes |
| `error-state.tsx` | `ErrorState` | ✅ Yes | ✅ Yes (all 38 modules import) | ✅ Yes |
| `empty-state.tsx` | `EmptyState` | ✅ Yes | ✅ Yes (all 38 modules import) | ✅ Yes |
| `confirm-dialog.tsx` | `ConfirmDialog` | ✅ Yes | ❌ NOT YET (no delete flows yet) | ✅ Yes |
| `index.ts` | barrel | ✅ Yes | ✅ Yes | ✅ Yes |

### src/stores/ (2 files)

| File | Exports | Used By Section 03? | Used By Section 04? | Correct Location? |
|---|---|---|---|---|
| `auth-store.ts` | `useAuthStore` (user, session, hasPermission, hasRole, login, logout, demo) | ✅ Yes | ✅ Yes (imported in all 38 modules) | ✅ Yes |
| `org-context-store.ts` | `useOrgContextStore` (enterprise/company/plant/warehouse context) | ✅ TopBar only | ❌ NOT YET | ✅ Yes |

---

## 2. Missing Shared Artifacts

| Artifact | Needed For | Proposed Location | Priority |
|---|---|---|---|
| `usePagination` hook | All list views (pagination state) | `src/hooks/use-pagination.ts` | MEDIUM — currently inline in ProductMaster |
| `<DataTable>` component | All list views (sorting, column visibility, bulk select) | `src/components/shared/data-table.tsx` | MEDIUM — currently raw `<table>` everywhere |
| `<DetailDrawer>` component | All detail views (slide-out panel) | `src/components/shared/detail-drawer.tsx` | MEDIUM — currently no detail drawers exist |
| `<SearchBar>` component | All list views (debounced search input) | `src/components/shared/search-bar.tsx` | LOW — `useDebouncedSearch` + `<Input>` works |
| `<StatusBadge>` component | All status displays | `src/components/shared/status-badge.tsx` | LOW — `badgeForStatus` + `<Badge>` works |
| `formatCurrency(value, currency)` | Multi-currency support | `src/lib/format.ts` (extend) | LOW — `formatINR` covers INR only |

---

## 3. Duplications Found

### Duplication 1: Inline `apiFetch` in 12 existing clients
- **Pattern**: Each of 12 `src/modules/*/api/client.ts` files defines its own `async function apiFetch<T>(...)`
- **Shared alternative**: `src/lib/api.ts` exports `apiFetch`
- **Fix**: Replace inline with `import { apiFetch } from '@/lib/api'`
- **Status**: Section 04's 7 new clients CORRECTLY use shared `apiFetch` ✅

### Duplication 2: `s28PriorityBadge` in Section 04 utils
- **Pattern**: `src/sections/04-operations/utils/helpers.ts` defines `s28PriorityBadge`
- **Shared alternative**: Should be in `src/lib/badges.ts`
- **Fix**: Promote to `@/lib/badges.ts`

### Duplication 3: Mock data in utils
- **Pattern**: `S28_WAREHOUSES` and `S28_ZONES` in `src/sections/04-operations/utils/helpers.ts`
- **Issue**: These are mock data arrays masquerading as utilities
- **Fix**: Delete when modules are wired to live API

### Duplication 4: Manual useState+useEffect instead of useList
- **Pattern**: Section 04 modules use inline `const [data, setData] = useState([])` + `useEffect(() => { ... })` instead of `useList`
- **Shared alternative**: `src/hooks/use-list.ts`
- **Fix**: Replace manual patterns with `useList`

### Duplication 5: Manual search instead of useDebouncedSearch
- **Pattern**: Section 04 modules use `const [search, setSearch] = useState('')` with no debounce
- **Shared alternative**: `src/hooks/use-debounced-search.ts`
- **Fix**: Replace with `useDebouncedSearch`

---

## 4. Compliance Summary

| Check | Status |
|---|---|
| All shared utilities in `src/lib/` | ✅ Yes |
| All shared hooks in `src/hooks/` | ✅ Yes |
| All shared components in `src/components/shared/` | ✅ Yes |
| No duplicate `apiFetch` in new code | ✅ Yes (Section 04 uses shared) |
| No duplicate formatters | ⚠️ `s28PriorityBadge` needs promotion |
| No duplicate validators | ✅ Yes |
| No duplicate badge logic | ⚠️ `s28PriorityBadge` needs promotion |
| No duplicate toast logic | ✅ Yes (all use `@/hooks/use-toast`) |
| No duplicate loading/error/empty | ✅ Yes (all use `@/components/shared`) |
| Hooks used instead of manual patterns | ❌ No (Section 04 uses manual patterns) |

---

**END OF SHARED INFRASTRUCTURE REVIEW**

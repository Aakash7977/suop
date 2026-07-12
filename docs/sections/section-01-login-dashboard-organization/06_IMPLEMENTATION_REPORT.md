# Section 1: Implementation Report

**Section**: Login + Dashboard + Organization
**Date**: 2026-07-12
**Status**: Analysis Complete — Awaiting Approval to Implement

---

## 1. What's Already Working

| Feature | Status | Details |
|---|---|---|
| Login (email + password) | ✅ Fully functional | Calls backend via `authClient.login()` |
| Login (Demo Mode) | ✅ Fully functional | Local fallback, no backend needed |
| Login (Supabase) | ✅ Fully functional | If `NEXT_PUBLIC_SUPABASE_URL` configured |
| Logout | ✅ Fully functional | Clears state + localStorage |
| Auth persistence | ✅ Working | Restores from localStorage on refresh |
| Loading state | ✅ Working | Spinner during login |
| Error display | ✅ Working | Shows error message on failure |
| Show/hide password | ✅ Working | Eye toggle |
| Remember me | ✅ Working | Checkbox (visual only — backend handles TTL) |
| Sidebar navigation | ✅ Working | 200+ items, 27 sections |
| Module switching | ✅ Working | State-based routing |
| Mobile sidebar | ✅ Working | Drawer with overlay |
| Zoom controls | ✅ Working | Ctrl+/- keyboard shortcuts |
| Sprint badge | ✅ Working | Static display |

---

## 2. What Needs Implementation

### Critical (Must Fix)

| # | Issue | Fix | Effort |
|---|---|---|---|
| C-01 | Auth store doesn't set `suop_access_token` in localStorage | Add `localStorage.setItem('suop_access_token', result.data.accessToken)` in `auth-store.ts` login method | 5 min |
| C-02 | Organization tree uses hardcoded data | Import `hierarchyApi.getTree()`, add `useEffect` to fetch, replace `tree` array | 1 hour |
| C-03 | "Add Entity" button has no handler | Add create dialog with form, wire to `companyApi.create()` | 2 hours |

### High (Should Fix)

| # | Issue | Fix | Effort |
|---|---|---|---|
| H-01 | Dashboard stats are hardcoded | Fetch real counts from APIs | 30 min |
| H-02 | No loading state on Organization | Add loading skeleton | 15 min |
| H-03 | No error state on Organization | Add error message + retry | 15 min |
| H-04 | No node detail panel | Add detail panel that shows company info on node click | 1 hour |
| H-05 | No CRUD operations for org entities | Add Edit/Delete/Transition buttons | 2 hours |

### Medium (Nice to Have)

| # | Issue | Fix | Effort |
|---|---|---|---|
| M-01 | No permission checks on buttons | Check `useAuthStore` permissions before showing buttons | 30 min |
| M-02 | No toast notifications | Add success/error toasts on CRUD operations | 30 min |
| M-03 | No confirmation dialog on delete | Add `ConfirmationDialog` before delete | 15 min |
| M-04 | Sprint data is static | Can remain static (historical info, not from API) | N/A |

---

## 3. Implementation Plan (Preserving Existing UI)

### Step 1: Fix Auth Token Storage (5 min)

In `src/stores/auth-store.ts`, in the `login` method, after successful Supabase/local login:

```typescript
// Add after setting state:
if (data?.accessToken) {
  localStorage.setItem('suop_access_token', data.accessToken)
}
```

For local fallback:
```typescript
localStorage.setItem('suop_access_token', 'local-token-' + Date.now())
```

For demo mode:
```typescript
localStorage.setItem('suop_access_token', 'demo-token')
```

In `logout`:
```typescript
localStorage.removeItem('suop_access_token')
```

### Step 2: Wire Organization Tree to API (1 hour)

In `OrganizationModule()`:

```typescript
// BEFORE (hardcoded):
const tree = [{ code: 'SUDHASTAR', ... }]

// AFTER (API-connected):
import { hierarchyApi, companyApi, plantApi, warehouseApi } from '@/modules/organization/api/client'

const [tree, setTree] = useState<any[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')

useEffect(() => {
  async function loadTree() {
    setLoading(true)
    try {
      const res = await hierarchyApi.getTree()
      setTree(res.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  loadTree()
}, [])

if (loading) return <LoadingSkeleton />
if (error) return <ErrorState message={error} onRetry={loadTree} />
```

### Step 3: Wire Dashboard Stats (30 min)

In `DashboardModule()`:

```typescript
const [stats, setStats] = useState({ products: 0, roles: 0, companies: 0 })

useEffect(() => {
  async function loadStats() {
    try {
      const [products, roles, companies] = await Promise.all([
        fetch(`${API_BASE}/api/v1/catalog/products?pageSize=1`).then(r => r.json()),
        fetch(`${API_BASE}/api/v1/admin/roles?pageSize=1`).then(r => r.json()),
        fetch(`${API_BASE}/api/v1/organization/companies?pageSize=1`).then(r => r.json()),
      ])
      setStats({
        products: products.meta?.total ?? 0,
        roles: roles.meta?.total ?? 0,
        companies: companies.meta?.total ?? 0,
      })
    } catch {}
  }
  // Only fetch if NOT in demo mode
  if (!isDemoMode) loadStats()
}, [])
```

### Step 4: Add "Add Entity" Functionality (2 hours)

Add a create dialog to `OrganizationModule()`:

```typescript
const [showCreate, setShowCreate] = useState(false)

// Button:
<Button size="sm" variant="outline" onClick={() => setShowCreate(true)}>
  <Plus className="mr-1 h-3 w-3" />Add Entity
</Button>

// Dialog with form:
{showCreate && (
  <CreateCompanyDialog
    onClose={() => setShowCreate(false)}
    onCreated={() => { loadTree(); setShowCreate(false) }}
  />
)}
```

### Step 5: Add Node Detail Panel (1 hour)

When a tree node is selected, show a detail panel:

```typescript
const [selectedDetail, setSelectedDetail] = useState<any>(null)

useEffect(() => {
  if (selectedNode) {
    companyApi.get(selectedNode).then(res => setSelectedDetail(res.data))
  }
}, [selectedNode])
```

---

## 4. Files to Modify

| File | Change | Risk |
|---|---|---|
| `src/stores/auth-store.ts` | Add `suop_access_token` to localStorage | Low — additive only |
| `src/app/page.tsx` lines 546-626 | Replace hardcoded stats with API calls | Low — visual unchanged |
| `src/app/page.tsx` lines 629-700 | Replace hardcoded tree with API call + add loading/error states + add create dialog | Medium — adds new UI elements (dialog, detail panel) |

**No files deleted. No components removed. No design changed.**

---

## 5. Quality Gates

| Gate | Current | After Implementation |
|---|---|---|
| TypeScript | ✅ 0 errors | ✅ 0 errors (types from API client) |
| ESLint | ✅ 0 errors | ✅ 0 errors |
| Build | ✅ Passes | ✅ Passes |
| Frontend tests | 0 | To be written |
| Backend tests | 3,299 passing | 3,299 passing (no backend changes) |
| No console errors | ✅ | ✅ |
| No broken buttons | ❌ "Add Entity" broken | ✅ Fixed |
| No broken forms | ❌ No forms | ✅ Create form added |

---

## 6. Estimated Effort

| Task | Time |
|---|---|
| Fix auth token storage | 5 min |
| Wire organization tree to API | 1 hour |
| Add loading/error states | 30 min |
| Wire dashboard stats | 30 min |
| Add "Add Entity" dialog + form | 2 hours |
| Add node detail panel | 1 hour |
| Add edit/delete functionality | 2 hours |
| Add permission checks | 30 min |
| Add toast notifications | 30 min |
| Write frontend tests | 2 hours |
| **Total** | **~10.5 hours** |

---

## 7. Section Score

| Dimension | Current | After Implementation |
|---|---|---|
| Visual quality | 8/10 | 8/10 (unchanged) |
| API integration | 2/10 | 9/10 |
| CRUD operations | 1/10 | 8/10 |
| Loading states | 2/10 | 9/10 |
| Error handling | 2/10 | 8/10 |
| Permission checks | 0/10 | 7/10 |
| Overall | **2.5/10** | **8.2/10** |

---

## 8. Conclusion

Section 1 (Login + Dashboard + Organization) is visually complete and the login flow is fully functional. The main gap is that the Organization module and Dashboard stats use hardcoded data instead of calling the existing backend APIs.

The fix is straightforward: import the existing API clients, add `useEffect` to fetch data, and add loading/error states. The UI design does NOT need to change — only the data source switches from inline arrays to API responses.

**The "Add Entity" button and node detail panel are the only new UI elements needed** — everything else is wiring existing UI to existing APIs.

**Awaiting approval to begin implementation.**

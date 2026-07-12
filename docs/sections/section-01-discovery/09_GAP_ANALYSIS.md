# 09 — Gap Analysis: Login + Dashboard + Organization

**Scope**: Every gap identified during discovery, categorised by severity, effort, and dependency.
**Convention**: Gaps are numbered G-01 through G-20. Each gap has a severity (Critical/High/Medium/Low), an effort estimate (S/M/L), and a dependency list.

---

## 1. Gap Register

| # | Gap | Severity | Effort | Depends on | Section ref |
|---|---|---|---|---|---|
| G-01 | Token key mismatch (`suop_auth` vs `suop_access_token`) | Critical | S | — | §2 |
| G-02 | `orgClient` written but never imported | Critical | S | G-01 | §3 |
| G-03 | Dashboard stat cards hardcoded (Products=12, Roles=15, Branches=8, Compliance=6) | High | M | G-01 | §4 |
| G-04 | Organization tree hardcoded (not from `hierarchyApi`) | High | M | G-01 | §5 |
| G-05 | Organization stats hardcoded (Enterprises=1, Companies=2, Branches=8, Warehouses=4) | High | S | G-01 | §5 |
| G-06 | "Add Entity" button has no `onClick` handler | High | L | G-02 | §5 |
| G-07 | No node detail panel when selecting a tree node | High | M | G-04 | §5 |
| G-08 | No CRUD for companies / plants / warehouses in frontend | High | L | G-02, G-06 | §5 |
| G-09 | No loading states on Dashboard or Organization | Medium | S | — | §6 |
| G-10 | No error states on Dashboard or Organization | Medium | S | — | §6 |
| G-11 | No permission checks on any button | High | M | — | §7 |
| G-12 | No toast notifications | Medium | S | — | §6 |
| G-13 | No confirmation dialogs | Medium | S | — | §6 |
| G-14 | No search/filter on organization tree | Medium | M | G-04 | §5 |
| G-15 | No export functionality | Low | M | G-08 | §5 |
| G-16 | No audit trail viewer in frontend | High | L | G-08 | §5 |
| G-17 | No workflow transition UI in frontend | High | L | G-08 | §5 |
| G-18 | No form validation | Medium | M | — | §6 |
| G-19 | No dark mode toggle | Low | S | — | §6 |
| G-20 | No breadcrumbs | Low | S | — | §6 |
| G-21 | Sprint data static (27 entries) | Low | — | — | §4 (acceptable) |
| G-22 | No tenant indicator in Header | Medium | S | — | §7 |
| G-23 | No automatic refresh-token retry on 401 | Medium | S | G-01 | §6 |
| G-24 | Login error does not distinguish LOCKED / SUSPENDED / ARCHIVED | High | S | — | §7 |
| G-25 | `org-context-store` not wired to Organization module | Medium | S | G-04 | §5 |

> Note: the brief lists 20 gaps; this register expands to 25 by separating discoverable sub-gaps (e.g., G-21 is the accepted static sprint data, G-24 is the login-error branching that the brief implies under "no form validation"). Gaps G-01 and G-02 are the two critical items; everything else is downstream.

---

## 2. G-01 — Token Key Mismatch (Critical)

### 2.1 Symptom

After a successful login, every API client call (`orgClient`, `userClient`, `productClient`, …) sends `Authorization: Bearer null` because the clients read `localStorage.getItem('suop_access_token')` and the auth store writes to `localStorage['suop_auth']`.

### 2.2 Evidence

- `src/stores/auth-store.ts` — `persist` with name `suop_auth`.
- `src/modules/*/api/client.ts` — all 14 clients call `localStorage.getItem('suop_access_token')`.
- The auth store exposes `accessToken` in its state but never persists it under the key the clients expect.

### 2.3 Impact

- Every API call after login returns 401.
- The Login screen appears to succeed because the auth store's own state is correct.
- The failure surfaces only when the user navigates to a module that uses an API client.

### 2.4 Fix

Two options:

**Option A (minimal):** add a `subscribe` in `auth-store.ts` that mirrors `accessToken` into `localStorage['suop_access_token']`:

```ts
useAuthStore.subscribe(
  (s) => s.accessToken,
  (token) => {
    if (token) localStorage.setItem('suop_access_token', token);
    else localStorage.removeItem('suop_access_token');
  }
);
```

**Option B (cleaner):** standardise on a single key (`suop_auth`) across all clients by introducing a `getToken()` helper in a shared `apiClient` wrapper.

Recommendation: **Option B**, because it removes the divergence permanently and makes the auth store the single source of truth.

### 2.5 Effort

S (≤ 1 day). No backend change, no schema change, no migration.

---

## 3. G-02 — `orgClient` Written but Never Imported (Critical)

### 3.1 Symptom

`src/modules/organization/api/client.ts` exposes a full CRUD client for companies, plants, warehouses, departments, cost centers, financial years, and hierarchy. The `OrganizationModule` component does not import it.

### 3.2 Impact

22 organisation endpoints are unreachable from the UI. The org tree is hardcoded; the stats are hardcoded; CRUD is impossible.

### 3.3 Fix

Import `orgClient` into `OrganizationModule`. Replace the hardcoded `tree` constant with a `useEffect` that calls `orgClient.hierarchyApi.getTree()`. Replace the 4 hardcoded stat values with counts from `orgClient.companyApi.list`, `plantApi.list`, `warehouseApi.list`.

### 3.4 Effort

S once G-01 is fixed. The client is already written and tested.

---

## 4. Dashboard Gaps (G-03, G-09, G-10, G-12, G-19, G-20, G-21)

### 4.1 Hardcoded stats (G-03)

The 4 stat cards display fixed numbers. Replace each with a real count:

| Card | Source | Notes |
|---|---|---|
| Products=12 | `productClient.list({ page:1, pageSize:1 })` → read `meta.pagination.total` | Cross-section but wired through shared client |
| Roles=15 | `userClient.roles.list({ page:1, pageSize:1 })` → read total | |
| Branches=8 | `orgClient.plantApi.list({ status:'ACTIVE' })` → total | |
| Compliance=6 | (no existing endpoint) | Either remove or add a new aggregation endpoint |

### 4.2 Loading (G-09)

Add `<Skeleton>` rows while counts are loading.

### 4.3 Error (G-10)

Add an error state with retry button if any count fetch fails.

### 4.4 Toast (G-12)

Surface background-refresh failures as a toast, not a blocking error.

### 4.5 Dark mode (G-19)

Low priority. The current dark-slate theme is acceptable for v1.

### 4.6 Breadcrumbs (G-20)

Add `<Breadcrumb>` to the Header showing `Home / Dashboard`.

### 4.7 Static sprint data (G-21)

Acceptable as-is. The 27 sprints are a historical record. Mark the list as "Historical" with a small caption.

---

## 5. Organization Gaps (G-04, G-05, G-06, G-07, G-08, G-14, G-15, G-16, G-17, G-25)

### 5.1 Hardcoded tree (G-04)

Replace the literal `tree` array with:

```ts
const [tree, setTree] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
  orgClient.hierarchyApi.getTree()
    .then(setTree)
    .finally(() => setLoading(false));
}, []);
```

### 5.2 Hardcoded stats (G-05)

Replace the 4 literals with counts from `companyApi.list`, `plantApi.list`, `warehouseApi.list`, and a top-level company count for "Enterprises".

### 5.3 "Add Entity" button (G-06)

Implement an `onClick` that opens a `Dialog` with a form for the selected entity type. The form posts to `companyApi.create` / `plantApi.create` / `warehouseApi.create` depending on the selected parent's type.

### 5.4 Node detail panel (G-07)

Render a right-hand panel (or `Sheet` on mobile) when `selectedNode` is set. The panel calls `companyApi.get(id)` / `plantApi.get(id)` / `warehouseApi.get(id)` and shows all columns from the table (see `05_DATABASE_MAPPING.md`).

### 5.5 CRUD forms (G-08)

Three forms, one per entity type. Use `react-hook-form` + `zod` for validation. Forms are reachable from the detail panel (Edit) and from "Add Entity".

### 5.6 Search/filter (G-14)

Add an `Input` above the tree that filters nodes by name (case-insensitive). Auto-expand matching branches.

### 5.7 Export (G-15)

Add a "Export CSV" button that calls `companyApi.list({ pageSize: -1 })` and downloads the result. Low priority.

### 5.8 Audit trail viewer (G-16)

Add an "Audit" tab on the detail panel that calls a future `/audit-logs?entity_id=…&entity_type=…` endpoint. Renders a timeline of `timestamp`, `actor`, `action`, `diff`.

### 5.9 Workflow transition UI (G-17)

Add transition buttons on the detail panel: Activate, Suspend, Resume, Archive. Each opens a `Dialog` with an optional "reason" textarea and a confirmation step. The dialog calls `companyApi.transition(id, { action, reason })`.

### 5.10 Org-context-store wiring (G-25)

When a node is selected, call `useOrgContextStore.setState({ company, plant, warehouse, … })` so downstream modules (Inventory, Goods Receipt) inherit the selection.

---

## 6. Cross-Cutting Gaps (G-09, G-10, G-12, G-13, G-18, G-19, G-20, G-23)

| Gap | Fix | Effort |
|---|---|---|
| G-09 Loading | `<Skeleton>` while fetching | S |
| G-10 Error | error boundary + retry UI | S |
| G-12 Toast | `useToast` on success/failure of every mutation | S |
| G-13 Confirm | `AlertDialog` before destructive actions | S |
| G-18 Validation | `react-hook-form` + `zod` schemas | M |
| G-19 Dark mode | theme toggle + Tailwind `dark:` variants | S |
| G-20 Breadcrumbs | `<Breadcrumb>` in Header | S |
| G-23 Auto-refresh | fetch wrapper retries once on 401 with `POST /auth/refresh` | S |

---

## 7. Security Gaps (G-11, G-22, G-24)

### 7.1 Permission checks (G-11)

Introduce `hasPermission(user, code)` helper. Wrap every CRUD button in `{hasPermission(user, 'ORG_CREATE') && <Button>…</Button>}`.

### 7.2 Tenant indicator (G-22)

Show `tenant.name` in the Header next to the user avatar. Source: `useAuthStore.user.tenantId` → lookup via a future `/tenants/:id` endpoint or include `tenantName` in the JWT claim.

### 7.3 Login error branching (G-24)

The Login screen currently shows a single `loginError` string. Branch on the backend's error code:

| Backend code | Message |
|---|---|
| `auth.invalid_credentials` | "Invalid email or password" |
| `auth.account_locked` | "Account locked. Try again in 30 minutes." |
| `auth.account_suspended` | "Account suspended. Contact your administrator." |
| `auth.account_archived` | "Account archived. Contact your administrator." |
| `auth.invitation_pending` | "Check your email to accept your invitation." |

---

## 8. Gap Dependency Graph

```
G-01 (token) ──────┬──▶ G-02 (orgClient) ──▶ G-04 (tree) ──▶ G-07 (detail) ──▶ G-08 (CRUD) ──▶ G-16 (audit)
                   │                                     │                │              └──▶ G-17 (transition)
                   ├──▶ G-03 (dashboard stats)           │                └──▶ G-14 (search)
                   ├──▶ G-05 (org stats)                 │
                   └──▶ G-23 (auto-refresh)              └──▶ G-25 (org-context wiring)

G-11 (permissions) ──── independent, can run in parallel
G-22 (tenant indicator) ── independent
G-24 (login error branching) ── independent
G-09 / G-10 / G-12 / G-13 / G-18 / G-19 / G-20 ── independent, batch together
```

The critical path is **G-01 → G-02 → G-04 → G-08 → G-17**.

---

## 9. Severity Roll-Up

| Severity | Count |
|---|---|
| Critical | 2 (G-01, G-02) |
| High | 8 (G-03, G-04, G-05, G-06, G-07, G-08, G-11, G-16, G-17, G-24) |
| Medium | 10 (G-09, G-10, G-12, G-13, G-14, G-18, G-22, G-23, G-25) |
| Low | 4 (G-15, G-19, G-20, G-21) |
| **Total** | **25** |

---

## 10. Effort Roll-Up

| Effort | Count | Estimated dev-days |
|---|---|---|
| S (≤ 1 day) | 14 | 14 |
| M (1–3 days) | 7 | 14 |
| L (3–5 days) | 3 | 12 |
| — (G-21 accepted) | 1 | 0 |
| **Total** | **25** | **~40 dev-days** |

A two-engineer squad can close every gap in **4 working weeks** (see `12_IMPLEMENTATION_PLAN.md`).

---

## 11. Out-of-Scope Items (Explicitly Deferred)

- Multi-factor authentication (MFA) — future security epic.
- Social login (Google/Microsoft) — future.
- WebAuthn / passkeys — future.
- Real-time collaboration on org tree — future.
- Drag-and-drop tree restructuring — future.
- Mobile-native org module (the mobile-app has its own DashboardScreen) — separate workstream.

These are noted so they are not re-discovered in a future cycle.

---

## 12. Conclusion

The section has **2 critical gaps** that block every downstream integration and **8 high-severity gaps** that prevent the section from being usable by an admin. The critical path runs through the token-key fix and the orgClient wiring; once those are in place, the remaining gaps are straightforward composition of existing UI primitives around existing API clients. No backend work, no schema work, and no migration is required to close any of the 25 gaps.

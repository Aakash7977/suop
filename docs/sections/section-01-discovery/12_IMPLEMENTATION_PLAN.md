# 12 — Implementation Plan: Login + Dashboard + Organization

**Scope**: Workstream breakdown, sequencing, effort, owners, and acceptance criteria for closing every gap in `09_GAP_ANALYSIS.md`.
**Cadence**: 2-week sprints, 2 engineers (1 frontend, 1 full-stack).
**Goal**: Section production-ready in 4 weeks (2 sprints).

---

## 1. Workstream Overview

| Workstream | Gaps closed | Effort (dev-days) | Sprint |
|---|---|---|---|
| W-01 Token unification | G-01, G-23 | 2 | S1 |
| W-02 Organization wiring | G-02, G-04, G-05, G-25 | 4 | S1 |
| W-03 Dashboard live counts | G-03, G-09, G-10 | 3 | S1 |
| W-04 CRUD + detail panel | G-06, G-07, G-08, G-14 | 8 | S2 |
| W-05 Workflow transitions + audit | G-16, G-17 | 6 | S2 |
| W-06 Permission gating + login branching | G-11, G-22, G-24 | 4 | S2 |
| W-07 Polish (toasts, validation, breadcrumbs) | G-12, G-13, G-18, G-19, G-20 | 5 | S2 |
| W-08 Test automation | (per `11_TEST_PLAN.md`) | 14 | S1 + S2 (parallel) |
| **Total** | | **~46 dev-days** | **2 sprints** |

---

## 2. Sprint 1 — Foundation (Weeks 1–2)

### 2.1 W-01 Token Unification

**Goal**: every API client sends a valid Bearer token after login.

**Tasks**:

1. Create `src/lib/api/token.ts` exporting `getAccessToken()` and `setAccessToken(token)` that read/write a single key (`suop_access_token`).
2. Update `src/stores/auth-store.ts`:
   - In `login()`, after receiving the response, call `setAccessToken(res.accessToken)`.
   - In `logout()`, call `setAccessToken(null)`.
   - Add a `subscribe` that mirrors the persisted state into the single key on hydration.
3. Update all 14 API clients to import `getAccessToken` instead of calling `localStorage.getItem` inline.
4. Add a fetch wrapper `src/lib/api/fetch.ts` that:
   - Injects `Authorization: Bearer <token>`.
   - On 401, calls `authClient.refresh()` once, retries the original request.
   - On second 401, calls `useAuthStore.logout()` and redirects to Login.
5. Smoke test: after login, `orgClient.hierarchyApi.getTree()` returns 200.

**Acceptance criteria**:

- `localStorage.getItem('suop_access_token')` returns a non-empty JWT after login.
- All 14 API clients use `getAccessToken()`.
- 401 retry-once behaviour verified by integration test.
- No reference to `localStorage.getItem('suop_access_token')` outside `token.ts`.

**Effort**: 2 days.

### 2.2 W-02 Organization Wiring

**Goal**: org tree and stats load from the backend.

**Tasks**:

1. In `OrganizationModule`:
   - Replace the hardcoded `tree` constant with `useState`.
   - Add `useEffect` calling `orgClient.hierarchyApi.getTree()`.
   - Add `loading` and `error` states; render `<Skeleton>` and an error banner.
2. Replace the 4 hardcoded stat values with counts from `companyApi.list`, `plantApi.list`, `warehouseApi.list`, and a top-level company count.
3. On node select, call `useOrgContextStore.setState({ company, plant, warehouse })` so downstream modules inherit the selection.
4. Add an empty state when the tree is empty.

**Acceptance criteria**:

- Tree matches `GET /organization/hierarchy` response.
- Stats match the counts from the list endpoints.
- `org-context-store` reflects the selected node.
- Loading and error states render correctly.

**Effort**: 4 days (including the recursive TreeItem refactor for async data).

### 2.3 W-03 Dashboard Live Counts

**Goal**: Dashboard stat cards show real numbers.

**Tasks**:

1. In `DashboardModule`, add `useEffect` that fetches the 4 counts in parallel.
2. Replace hardcoded literals with state.
3. Add `<Skeleton>` while loading and an error banner with Retry on failure.
4. Add a "Historical" caption to the sprint list (G-21).
5. Optionally refresh counts on window focus.

**Acceptance criteria**:

- Products count matches `productClient.list({ page:1, pageSize:1 }).meta.pagination.total`.
- Roles count matches `userClient.roles.list`.
- Branches count matches `plantApi.list({ status:'ACTIVE' })`.
- Compliance card either removed or backed by a new aggregation endpoint (decision needed from product).

**Effort**: 3 days.

### 2.4 Sprint 1 exit criteria

- W-01, W-02, W-03 merged and deployed to staging.
- TE-01 (admin onboarding) E2E passes up to "Verify tree" (CRUD still mocked).
- Zero critical defects.
- Coverage ≥ 60 % on touched files.

---

## 3. Sprint 2 — Functionality (Weeks 3–4)

### 3.1 W-04 CRUD + Detail Panel + Search

**Goal**: admin can create, read, update, soft-delete, restore, and hard-delete companies, plants, and warehouses.

**Tasks**:

1. Build a `NodeDetailPanel` component that renders when `selectedNode` is set; calls `companyApi.get` / `plantApi.get` / `warehouseApi.get`.
2. Build three `EntityForm` variants (company, plant, warehouse) using `react-hook-form` + `zod`.
3. Wire "Add Entity" button to open the appropriate form in a `Dialog`.
4. Wire Edit button on the detail panel.
5. Wire Delete button → `AlertDialog` confirm → `companyApi.delete`.
6. Wire "Show deleted" toggle → list with `?includeDeleted=true` → Restore button.
7. Wire Hard Delete → typed-confirm dialog (type entity name) → `companyApi.hardDelete`.
8. Add a search `Input` above the tree that filters by name (case-insensitive).

**Acceptance criteria**:

- All T-OC01–T-OC11 test cases pass.
- Search filters the tree in < 100ms for 50 nodes.
- Detail panel shows every column from `05_DATABASE_MAPPING.md` for the entity type.
- Hard-delete requires typed confirmation.

**Effort**: 8 days.

### 3.2 W-05 Workflow Transitions + Audit

**Goal**: admin can transition entities through the lifecycle and view the audit trail.

**Tasks**:

1. Add transition buttons (Activate, Configure, Suspend, Resume, Archive) on the detail panel, gated by current state.
2. Build a `TransitionDialog` with an optional reason textarea and a confirmation step.
3. On transition, call `companyApi.transition(id, { action, reason })`; refresh detail panel; emit toast.
4. Add an "Audit" tab on the detail panel that calls `GET /audit-logs?entity_id=…&entity_type=…`.
5. Render an `AuditTimeline` component (timestamp, actor, action, diff).
6. Add a date-range filter and CSV export.

**Acceptance criteria**:

- All T-OW01–T-OW07 and T-OA01–T-OA04 test cases pass.
- Audit timeline shows the 9 audit calls from organisation service.
- `CompanyCreated` and `PlantActivated` events visible in the timeline.

**Effort**: 6 days. (May require a new `/audit-logs` endpoint — confirm it exists; if not, add a thin read-only endpoint reusing `auditService.query`.)

### 3.3 W-06 Permission Gating + Login Branching

**Goal**: UI respects the user's permissions; login errors are specific.

**Tasks**:

1. Create `src/lib/auth/has-permission.ts` (see `07_RBAC_ANALYSIS.md`).
2. Apply `hasPermission` to:
   - Dashboard stat cards (hide if user lacks the read permission for that module).
   - Organization "Add Entity" button (`ORG_CREATE`).
   - Detail panel Edit button (`ORG_UPDATE`).
   - Transition buttons (`ORG_UPDATE`).
   - Delete button (`ORG_DELETE`).
   - Hard Delete button (`ORG_DELETE` + typed confirm).
3. Drive the Sidebar `available` flag from `hasPermission` instead of the hardcoded boolean.
4. Add a tenant-name badge in the Header (requires including `tenantName` in the `/auth/me` response).
5. Branch the Login error display on backend error code (see G-24 table).

**Acceptance criteria**:

- All T-P01–T-P04 permission tests pass.
- Operator sees no Add Entity button.
- Locked user sees "Account locked, try again in 30 minutes".
- Header shows current tenant name.

**Effort**: 4 days.

### 3.4 W-07 Polish

**Goal**: production-grade UX.

**Tasks**:

1. Add `<Toaster>` and `useToast` for every mutation success/failure.
2. Add `<AlertDialog>` for all destructive actions.
3. Add `react-hook-form` + `zod` validation to the Login form (email format, password min length).
4. Add `<Breadcrumb>` to the Header (Home / Dashboard, Home / Organization, …).
5. Add a theme toggle (dark/light) — low priority, may slip to v1.1.

**Acceptance criteria**:

- Every mutation surfaces a toast.
- Every destructive action requires confirmation.
- Login form blocks invalid email format client-side.
- Breadcrumbs render on every module.

**Effort**: 5 days (theme toggle optional).

### 3.5 Sprint 2 exit criteria

- W-04, W-05, W-06, W-07 merged and deployed to staging.
- TE-01 through TE-10 E2E all green.
- Zero critical or high defects.
- Coverage ≥ 80 % on touched files.
- axe accessibility: 0 critical violations.

---

## 4. Dependency Graph

```
W-01 (token) ──▶ W-02 (org wiring) ──▶ W-04 (CRUD) ──▶ W-05 (transitions + audit)
            │                                         │
            ├──▶ W-03 (dashboard)                      └──▶ W-07 (polish)
            │
            └──▶ W-06 (permissions + login branching)  ── independent of W-04/W-05

W-08 (tests) runs in parallel from day 1
```

W-01 is the keystone: nothing else can be verified without it.

---

## 5. Resource Plan

| Role | Allocation | Weeks |
|---|---|---|
| Frontend engineer | 100 % | 4 |
| Full-stack engineer (audit endpoint, tenant claim) | 50 % | 4 |
| QA engineer | 50 % | 4 |
| Product owner | 10 % | 4 (decision on Compliance card, audit endpoint scope) |
| Designer | 10 % | 1 (NodeDetailPanel, TransitionDialog layouts) |

---

## 6. Risk to the Plan

| # | Risk | Mitigation |
|---|---|---|
| P-1 | `/audit-logs` endpoint does not exist | W-05 includes a thin read-only endpoint; size at 1 day |
| P-2 | `tenantName` not in `/auth/me` response | W-06 includes a backend change to add the claim; size at 0.5 day |
| P-3 | Hierarchy API slow for large tenants | Add Redis cache (backend already has Redis); size at 0.5 day |
| P-4 | Compliance card has no source | Product decision needed in week 1; default = remove |
| P-5 | Permission claim missing from JWT | Backend already includes it; verify in W-06 |

---

## 7. Definition of Done (per gap)

A gap is "done" when:

1. Code merged to main via PR with at least one reviewer.
2. Unit + integration tests added and green.
3. E2E test added (if user-visible).
4. Updated in `09_GAP_ANALYSIS.md` (status column).
5. Verified on staging by QA.
6. No regression in existing E2E suite.

---

## 8. Backlog (Deferred to v1.1)

| Item | Reason |
|---|---|
| Dark mode toggle (G-19) | Low priority; current theme acceptable |
| Export (G-15) | Low priority; can be done via API today |
| MFA | Separate security epic |
| Real-time tree updates via SSE | Nice-to-have; polling sufficient for v1 |
| Drag-and-drop tree restructuring | Future |
| Mobile-native Organization module | Separate workstream (mobile-app) |

---

## 9. Communication Plan

- Daily standup (15 min) during the 4-week sprint.
- Mid-sprint demo to product owner.
- End-of-sprint demo to stakeholders.
- Weekly risk review (per `10_RISK_REGISTER.md`).
- Release readiness review at end of Sprint 2.

---

## 10. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Gap closure | 24/25 (G-21 accepted) | `09_GAP_ANALYSIS.md` status |
| Critical risks closed | 2/2 (R-01, R-02) | `10_RISK_REGISTER.md` |
| High risks closed | 8/8 | `10_RISK_REGISTER.md` |
| E2E pass rate | 100 % (TE-01–TE-10) | CI |
| Unit coverage | ≥ 80 % | CI |
| axe critical violations | 0 | CI |
| Login support tickets | -50 % within 4 weeks of release | Support desk |

---

## 11. Rollout Plan

1. **Day 1 of Sprint 2**: cut a release branch `release/section-01-v1.1`.
2. **End of Sprint 2**: deploy to staging; run full E2E suite.
3. **+1 day**: deploy to production behind a feature flag (`section_01_v1_1`).
4. **+1 day**: enable for internal users (Priya, Meena, Rahul).
5. **+3 days**: enable for all enterprise_admin users.
6. **+7 days**: enable for all users.
7. **+14 days**: remove the feature flag.

Rollback: disable the feature flag; the old hardcoded UI returns instantly.

---

## 12. Conclusion

The plan closes every tractable gap in 4 weeks with 2 engineers and 1 part-time QA. The critical path is **W-01 → W-02 → W-04 → W-05**, which delivers admin self-service. W-06 (permissions and login branching) and W-07 (polish) run in parallel and bring the section to production-grade. No backend rework, no schema change, and no migration is required — only wiring, validation, and composition of existing primitives. The single most important day of the entire plan is day 1: the token-key fix.

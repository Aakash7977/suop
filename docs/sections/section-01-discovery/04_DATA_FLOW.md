# 04 — Data Flow: Login + Dashboard + Organization

**Perspective**: How data moves through the section — from user input to localStorage, over HTTP, through services, into the database, and back to the UI.
**Goal**: Identify every handoff, every persistence point, and every silent failure mode.

---

## 1. Login Data Flow

```
┌────────────┐  email+pwd   ┌──────────────┐  login()    ┌──────────────┐
│ LoginScreen│─────────────▶│ useAuthStore │────────────▶│  authClient  │
└────────────┘              └──────────────┘             └──────┬───────┘
                                  │                             │ POST /auth/login
                                  │ persists suop_auth          │
                                  │ (Zustand persist)           ▼
                                  │                      ┌──────────────┐
                                  │                      │  authService │
                                  │                      └──────┬───────┘
                                  │                             │ Argon2id verify
                                  │                             │ JWT sign
                                  │                             ▼
                                  │                      ┌──────────────┐
                                  │                      │  PostgreSQL  │
                                  │                      │  users,      │
                                  │                      │  audit_logs, │
                                  │                      │  event_outbox│
                                  │                      └──────────────┘
                                  ▼
                          ┌──────────────────┐
                          │  localStorage    │
                          │  suop_auth       │   ←❌ suop_access_token NEVER SET
                          └──────────────────┘
```

### 1.1 Forward path

1. `LoginScreen` collects `email`, `password`, `rem`.
2. `onLogin` → `useAuthStore.login(email, password, rem)`.
3. The store calls `authClient.login()`, which performs `POST /api/v1/auth/login`.
4. `authService.login` verifies the Argon2id hash, checks account lock, issues JWT access + refresh tokens, writes to `audit_logs`, publishes `UserLoggedIn` to `event_outbox`.
5. The store receives the envelope, sets `isAuthenticated = true`, and persists the auth blob to `localStorage` under key `suop_auth`.

### 1.2 Return path

6. The `Home` shell re-renders; `isAuthenticated === true` triggers the Sidebar + Header + main content branch.
7. `useAuthStore.initialize()` runs `GET /auth/me` to refresh the user profile.

### 1.3 Silent failure: token key mismatch

- After step 5, every API client (including `orgClient`) calls `localStorage.getItem('suop_access_token')`.
- The store wrote to `suop_auth`, **never** to `suop_access_token`.
- Result: `orgClient` and the other 12 clients send requests with `Authorization: Bearer null`.
- Backend rejects with 401; clients throw `ApiError`.
- The Login screen still appears to succeed because the auth store's own state is correct. The failure surfaces only when the user navigates to a module that uses an API client.

This is the single most dangerous data-flow defect in the section: **login looks green, everything downstream is red.**

---

## 2. Dashboard Data Flow

```
┌──────────────────┐    no API    ┌─────────────┐
│ DashboardModule  │◀─────────────│ hardcoded   │
│  - sprintData[]  │              │ 27 sprints  │
│  - 4 stat cards  │              │ 4 counters  │
└──────────────────┘              └─────────────┘
        │
        │ onClick = setActiveModule('products' | 'rbac' | …)
        ▼
┌──────────────────┐
│ Home.activeModule│
└──────────────────┘
```

### 2.1 What flows

- `sprintData` is a module-level constant array; no network, no store.
- The 4 stat cards are static literals.
- The only state mutation is `setActiveModule`, which is local React state in `Home`.

### 2.2 What should flow

- The 4 counters should come from `GET /organization/companies?status=ACTIVE` (for "Branches") plus equivalent counts from `userClient` (for "Roles") and `productClient` (for "Products").
- A "Compliance" counter requires a new aggregation endpoint (no existing endpoint returns this).

### 2.3 Failure mode

There is no failure mode because there is no network call. The defect is **staleness**: the numbers never change. The risk is user trust, not system uptime.

---

## 3. Organization Data Flow

```
┌────────────────────┐    no API    ┌─────────────────────┐
│ OrganizationModule │◀─────────────│ hardcoded tree      │
│  - selectedNode    │              │ Sudhastar Group →   │
│  - TreeItem.exp    │              │   Foods Ltd →       │
│                    │              │     Manufacturing → │
│                    │              │       Mumbai Plant  │
└────────────────────┘              └─────────────────────┘
        │
        │ "Add Entity" onClick = undefined
        ▼
      (no-op)
```

### 3.1 What flows

- A constant tree literal is rendered by a recursive `TreeItem` component.
- `TreeItem` keeps a local `exp` useState for expand/collapse.
- Selecting a node sets `selectedNode` — but nothing reads it back, so there is no detail panel.

### 3.2 What should flow (target)

```
OrganizationModule mounts
   │
   ▼
useEffect → orgClient.hierarchyApi.getTree()
   │
   ▼
GET /organization/hierarchy
   │
   ▼
hierarchyService.getTree()
   │ reads companies, business_units, divisions, regions, plants, warehouses
   ▼
returns nested tree
   │
   ▼
setState(tree)
   │
   ▼
TreeItem renders real nodes
   │
   ▼
selectedNode → detail panel → orgClient.companyApi.get(id) or plantApi.get(id)
```

### 3.3 Failure mode

- The "Add Entity" button has **no `onClick`**. The user click is swallowed silently.
- No `useEffect` runs, so the module renders instantly with the hardcoded tree — there is no loading state, no error state, and no path for the backend to push updates.

---

## 4. Cross-Module Data Flow

### 4.1 Auth context propagation

```
useAuthStore  ──┬──▶ isAuthenticated   ──▶ Home decides Login vs Shell
                ├──▶ user               ──▶ Header (name, avatar)
                ├──▶ isDemoMode         ──▶ Header demo badge
                └───┘
```

The auth store is the single source of truth for identity. Other modules read from it but do not mutate it.

### 4.2 Org context store

`org-context-store.ts` (101 lines, Zustand with persist) maintains the currently selected enterprise/company/branch/plant/warehouse/department. **It is not consumed by `OrganizationModule`** — the module uses local state instead. As a result:

- Selecting a plant in the tree does **not** update the org context.
- Other modules that read the org context (Inventory, Goods Receipt, etc.) will not see the user's selection.
- The org context store is effectively unused in this section.

### 4.3 Token propagation (broken)

```
useAuthStore.login()  ──writes──▶  localStorage['suop_auth']
                                     │
                                     │ (no bridge)
                                     ▼
orgClient.fetch()  ──reads──▶  localStorage['suop_access_token']  === null
                                     │
                                     ▼
                              Authorization: Bearer null  ──▶  401
```

There is no bridge step that copies the access token from the auth-store blob into `suop_access_token`. This is the critical data-flow break.

---

## 5. Event Flow (Backend Side)

The backend uses an outbox pattern for cross-module events:

```
Service method (e.g., companyService.create)
   │
   ├──▶ INSERT INTO companies ...
   ├──▶ INSERT INTO audit_logs ...
   └──▶ INSERT INTO event_outbox (event_name='CompanyCreated', payload, status='PENDING')
                                              │
                                              ▼
                                    Outbox dispatcher (polls every Ns)
                                              │
                                              ▼
                                    Event bus → subscribers
```

Within this section:

- `UserLoggedIn` is emitted on login.
- `UserLoggedOut` is emitted on logout.
- `CompanyCreated` is emitted when a company is created (currently only via direct API call, never via UI).
- `PlantActivated` is emitted on the `DRAFT → ACTIVE` transition.

No frontend subscriber exists for these events. The Dashboard could subscribe to `CompanyCreated` to refresh its "Branches" counter in real time, but the wiring is absent.

---

## 6. Audit-Log Data Flow

```
Any audited mutation
   │
   ▼
auditService.log({ actor_type, actor_id, action, severity,
                   entity_type, entity_id, before, after, diff,
                   correlation_id })
   │
   ▼
INSERT INTO audit_logs
   │
   ▼
(available via future /audit-logs endpoint)
   │
   ▼
NOT surfaced in section UI
```

Within the section, **9 audit calls** fire in the organisation service alone (one per CRUD operation). None of these are visible to the user.

---

## 7. Persistence Layers

| Layer | Technology | Lifetime | Scope |
|---|---|---|---|
| React state | useState in `LoginScreen`, `OrganizationModule`, `Home` | Component mount | Component-local |
| Zustand store | `useAuthStore`, `org-context-store` | Browser session | App-wide |
| Persisted Zustand | Same, with `persist` middleware | Across sessions | `localStorage` |
| Network cache | None (no SWR/React Query) | n/a | n/a |
| Server cache | Redis (backend) | TTL-based | Backend-only |
| Database | PGlite / PostgreSQL | Permanent | Tenant-scoped |

The absence of a client-side query cache (React Query, SWR) means every navigation re-fetches. For the Dashboard this is fine (no fetch today), but for the target Dashboard it would mean 4–6 requests per navigation. Introducing React Query is recommended in `12_IMPLEMENTATION_PLAN.md`.

---

## 8. Data-Flow Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| DF-1 | Token mismatch breaks all API clients | Certain | Critical | W-01 in implementation plan |
| DF-2 | No retry/backoff → transient 5xx fails the UI silently | High | High | Add retry at fetch wrapper |
| DF-3 | No request deduplication → duplicate POST on double-click | Medium | High | Disable buttons on submit |
| DF-4 | Hardcoded tree drifts from backend truth | Certain | Medium | Replace with `hierarchyApi` |
| DF-5 | `selectedNode` set but never read | Certain | Low | Wire to detail panel |
| DF-6 | Org-context store unused in section | Certain | Medium | Wire `OrganizationModule` to it |
| DF-7 | No optimistic update path → slow perceived performance | High | Medium | Add optimistic UI on CRUD |
| DF-8 | Outbox events invisible to frontend | Certain | Low | Subscribe via SSE or polling |

---

## 9. Data-Flow Test Points

To verify the data flow after fixes:

1. **TP-1**: After login, `localStorage.getItem('suop_access_token')` must return a non-empty JWT.
2. **TP-2**: A `orgClient.hierarchyApi.getTree()` call from the browser console must return 200 with a `tree` array.
3. **TP-3**: Selecting a plant in the tree must update `org-context-store` and a downstream module must observe the change.
4. **TP-4**: Creating a company from the UI must produce a row in `audit_logs` with `action='company.create'`.
5. **TP-5**: The Dashboard "Branches" counter must change within 60 seconds of creating a new company through the Organization module.

---

## 10. Conclusion

The section's data flow is **split-brain**: the auth path works (Login → store → shell), but the API-client path is broken at the localStorage key boundary. The Dashboard and Organization modules short-circuit the network entirely, which avoids the breakage but defeats the purpose of having a backend. Closing the token-key gap and replacing the two hardcoded data sources with their existing API calls will restore end-to-end data flow with no new backend work required.

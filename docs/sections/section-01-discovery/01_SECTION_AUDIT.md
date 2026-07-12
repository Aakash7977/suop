# 01 — Section Audit: Login + Dashboard + Organization

**Section scope**: Login Screen, Dashboard Module, Organization Module
**Source**: `src/app/page.tsx` lines 89–700 (plus shell wiring at line 35332)
**Audit type**: Enterprise discovery — frontend, backend, database, security, and operational readiness
**Auditor**: Discovery automation
**Date**: Current cycle

---

## 1. Audit Objectives

This audit answers four questions for the in-scope section:

1. **What is shipped?** Inventory of components, endpoints, tables, stores.
2. **What works end-to-end?** Functional verification against the live codebase.
3. **What is disconnected?** Identification of frontend surfaces that ignore backend capabilities.
4. **What blocks production?** Categorisation of issues by severity and effort.

The audit is **evidence-based**: every claim is tied to a line number, a file, or a database object that exists in the repository.

---

## 2. Section Inventory

### 2.1 Frontend components in scope

| Component | Lines | State hooks | Backend calls | Verdict |
|---|---|---|---|---|
| `LoginScreen` | 89–148 | 6 useState | `useAuthStore.login()`, `useAuthStore.loginDemo()` | Functional |
| `DashboardModule` | 546–626 | 0 | None | Visual only |
| `OrganizationModule` | 629–700 | 1 useState + nested `TreeItem` `exp` | None | Visual only |
| `Home` (shell) | 35332+ | 3 useState, 1 useEffect | `useAuthStore.initialize()` | Functional |

### 2.2 Backend modules in scope

| Module | Endpoints | Services | Workflows | Audit calls |
|---|---|---|---|---|
| Auth | 12 | authService (16 methods) | UserLifecycle | Every login attempt |
| Organization | 22 | 7 services | OrganizationLifecycle | 9 `auditService.log` calls |
| User Management | 29 | userService, roleService, permissionService | Reuses UserLifecycle | Per-role assignment |

### 2.3 Database tables in scope

- **Auth**: `users`, `audit_logs`, `event_outbox`
- **Organization**: `tenants`, `companies`, `business_units`, `divisions`, `regions`, `plants`, `warehouses`, `departments`, `cost_centers`, `financial_years`, `working_calendars`, `reference_timezones`, `reference_currencies`, `tax_configs`
- All tables carry the enterprise contract columns: `id (UUID)`, `tenant_id (UUID)`, `status`, `version (Int)`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`.

---

## 3. Frontend Evidence

### 3.1 LoginScreen (lines 89–148)

- **State**: `email`, `password`, `show`, `rem`, `loading`, `loginError` (6 hooks).
- **Form fields**: email input (Mail icon), password input (Lock icon + show/hide Eye toggle), remember-me checkbox, Sign In button, Demo Mode button.
- **Error surface**: `text-rose-400` on `bg-rose-950/50` — visible and accessible.
- **Loading**: `Loader2` with `animate-spin`.
- **Responsive**: `p-3 md:p-4`, `max-w-md`.
- **Wiring**: `onLogin(email, password, rem)` → `useAuthStore.login()`; `onDemo()` → `useAuthStore.loginDemo()`.
- **Verdict**: Functional and production-grade for visual UX; missing only form-level validation and brute-force guidance text.

### 3.2 DashboardModule (lines 546–626)

- **Data source**: hardcoded `sprintData` array with **27 sprint entries** (Sprint 1 → Sprint 27).
- **Welcome banner**: stats are 223 tables, 821 entities, 249 decisions, 27 sprints.
- **Stat cards (4)**: Products=12, Roles=15, Branches=8, Compliance=6 — all hardcoded.
- **Interactions**: card `onClick` calls `setActiveModule(module)` — navigation works.
- **Sprint list**: `CheckCircle2` icons + "Done" badges.
- **Lifecycle hooks**: **no `useEffect`, no `fetch`, no API calls.**
- **Verdict**: Marketing-quality visual; data is static. Sprint history is acceptable as-is (historical record). Stat cards must be backed by real counters.

### 3.3 OrganizationModule (lines 629–700)

- **State**: `selectedNode` (single hook) plus a local `exp` useState inside `TreeItem`.
- **Data source**: hardcoded tree: Sudhastar Group → Sudhastar Foods Ltd → Manufacturing BU → Mumbai Plant, etc.
- **Icons map**: `ENTERPRISE`, `COMPANY`, `BU`, `BRANCH`.
- **TreeItem**: recursive, expand/collapse via `exp` state.
- **Stat cards (4)**: Enterprises=1, Companies=2, Branches=8, Warehouses=4 — all hardcoded.
- **"Add Entity" button**: present, **no `onClick` handler** — dead control.
- **Scroll area**: `h-[500px]` for the tree.
- **Lifecycle hooks**: **no `useEffect`, no `fetch`, no API calls.**
- **Verdict**: Visual shell only. None of the 22 organisation endpoints are reached from this module.

### 3.4 Home shell (line 35332)

- **Auth**: `useAuthStore` for `isAuthenticated`, `isLoading`, `login`, `logout`, `loginDemo`, `isDemoMode`.
- **State**: `activeModule`, `sidebarOpen`, `zoom`.
- **Effects**: `initialize()` for auth, plus keyboard zoom (`Ctrl + +/-/0`).
- **Render logic**: `LoginScreen` if `!isAuthenticated`; otherwise Sidebar + Header + main content.
- **Module routing**: 238 `activeModule === 'xxx'` conditional branches.
- **Sidebar**: 27 sections, 200+ items, each with an `available` boolean, plus Sign Out.
- **Header**: mobile menu, module title, zoom controls, sprint badge, demo badge, mobile link.

---

## 4. Backend Evidence

### 4.1 Auth module

- **Endpoints (12)**: login, logout, refresh, me, change-password, forgot-password, reset-password, sessions, devices, invite, accept-invitation, plus session/device revocation.
- **Service surface**: login (Argon2id verify, account lock check, JWT generation, audit log, event publish), logout (revoke refresh), refresh (rotation), changePassword (history check), forgotPassword, resetPassword, inviteUser, acceptInvitation, getCurrentUser, listSessions, revokeSession, listDevices, lockUser, unlockUser.
- **Security constants**: `MAX_FAILED_LOGINS = 5`, `LOCK_DURATION_MIN = 30`, `PASSWORD_HISTORY_COUNT = 10`.
- **Workflow**: `UserLifecycle` — `REGISTERED → ACTIVE → SUSPENDED → LOCKED → ARCHIVED`.
- **Events**: `UserRegistered`, `UserLoggedIn`, `UserLoggedOut`.
- **Audit**: every login attempt is recorded, success and failure.

### 4.2 Organization module

- **Endpoints (22)**: companies CRUD + transition + restore + hardDelete; plants CRUD + transition; warehouses CRUD; departments; cost-centers; financial-years; hierarchy.
- **Services**: `companyService`, `plantService`, `warehouseService`, `departmentService`, `costCenterService`, `financialYearService`, `hierarchyService.getTree()`.
- **Workflow**: `OrganizationLifecycle` — `DRAFT → CONFIGURED → ACTIVE → SUSPENDED → ARCHIVED`.
- **Events**: `CompanyCreated`, `PlantActivated`.
- **Audit**: 9 `auditService.log` calls in organisation service.
- **Repository**: raw SQL via PGlite, with `tenant_id` scoping.

### 4.3 User management module

- **Endpoints (29)**: users CRUD, lock/unlock, role assign/revoke, sessions, login-history, assignments, preferences, roles CRUD, clone, permissions, delegations.
- **Services**: `userService` (list, getById, update, assignRole, revokeRole, lockUser, unlockUser, sessions, loginHistory), `roleService` (list, getById, create, update, delete, clone), `permissionService`.

---

## 5. Cross-Cutting Findings

### 5.1 Token mismatch (Critical)

- `auth-store.ts` persists auth under the localStorage key **`suop_auth`**.
- All 14 API clients in `src/modules/*/api/client.ts` read the bearer token from **`suop_access_token`**.
- The auth store **never sets** `suop_access_token`.
- **Impact**: every API call after login will be missing the `Authorization` header and will be rejected by the backend. This is a release blocker for any module that uses an API client.

### 5.2 API clients written but unused

The frontend ships **14 API clients** (`authClient`, `orgClient`, `productClient`, `supplierClient`, `customerClient`, `procurementClient`, `rfqClient`, `quotationClient`, `purchaseOrderClient`, `goodsReceiptClient`, `qualityInspectionClient`, `inventoryClient`, `warehouseClient`, `userClient`). Within this section, only `authClient` is exercised (via the auth store). `orgClient` is fully implemented (company/plant/warehouse/department/costCenter/financialYear/hierarchy) but **never imported** by `OrganizationModule`.

### 5.3 Missing UX controls across the section

- No loading skeletons on Dashboard or Organization.
- No error boundaries or error toasts on either module.
- No permission checks on any button (stat cards, "Add Entity", tree nodes).
- No confirmation dialogs.
- No breadcrumbs, no dark-mode toggle, no search/filter on the org tree, no export.
- No node-detail panel when a tree node is selected.
- No CRUD forms for companies/plants/warehouses despite the backend and client both being ready.
- No workflow-transition UI in the frontend.
- No audit-trail viewer in the frontend.
- No form validation beyond the login form.

---

## 6. Severity-Weighted Finding Count

| Severity | Count | Examples |
|---|---|---|
| Critical | 2 | Token mismatch (5.1); org client not wired (5.2) |
| High | 6 | Hardcoded org tree; no CRUD; "Add Entity" dead button; no permission checks; no audit viewer; no workflow UI |
| Medium | 8 | Hardcoded dashboard stats; no loading/error states; no search; no export; no breadcrumbs; no toasts; no confirm dialogs; no node detail |
| Low | 4 | Sprint data static (historical, acceptable); no dark mode; no form validation; demo badge styling |
| **Total** | **20** | |

---

## 7. Audit Conclusion

The Login surface is functionally complete and ships with multi-mode auth (Supabase, local, demo) and a hardened backend (Argon2id, account lockout, password history, refresh rotation, audit). The Dashboard and Organization surfaces are visually complete but **data-disconnected**: they render hardcoded arrays instead of calling the existing, tested `orgClient`. The single most important defect is the **token key mismatch**, which silently breaks every API client call and must be fixed before any further integration work.

**Section production-readiness score**: 5.5 / 10 — see `13_PRODUCTION_SCORECARD.md` for the breakdown.

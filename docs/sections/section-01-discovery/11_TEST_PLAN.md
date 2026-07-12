# 11 — Test Plan: Login + Dashboard + Organization

**Scope**: Test strategy, coverage targets, test cases, and automation plan for the section.
**Audience**: QA lead, engineering manager, release manager.
**Convention**: Test IDs are prefixed T- for manual, TA- for automated, TE- for end-to-end.

---

## 1. Test Strategy

### 1.1 Test pyramid

```
                  ┌──────────────────┐
                  │   E2E (Playwright)│   ~10 tests
                  └──────────────────┘
                ┌──────────────────────┐
                │  Integration (Vitest) │  ~40 tests
                └──────────────────────┘
              ┌────────────────────────────┐
              │   Unit (Vitest + RTL)        │  ~120 tests
              └────────────────────────────┘
```

- **Unit**: pure functions, hooks, components in isolation.
- **Integration**: API client ↔ service ↔ PGlite in-memory DB.
- **E2E**: full browser flow from login through organisation CRUD.

### 1.2 Coverage targets

| Layer | Target |
|---|---|
| Unit test line coverage | ≥ 80 % |
| Integration test of API clients | 100 % of in-section endpoints |
| E2E of critical journeys | 100 % (login, dashboard load, org tree load, company create) |
| Accessibility (axe) | 0 critical violations |
| Visual regression | Login, Dashboard, Organization snapshots |

---

## 2. Test Environments

| Environment | Database | Auth | Purpose |
|---|---|---|---|
| Unit (Vitest) | Mocked | Mocked | Fast feedback |
| Integration | PGlite in-memory | Real authService | API contract verification |
| E2E (Playwright) | PGlite file-based | Real authService | Browser flow |
| Staging | PostgreSQL | Real authService + Supabase | Pre-production |

---

## 3. Test Cases — Login Screen

### 3.1 Functional (unit + integration)

| ID | Scenario | Steps | Expected |
|---|---|---|---|
| T-L01 | Successful login | Enter valid email + password, click Sign In | `useAuthStore.isAuthenticated` becomes true; navigates to Dashboard |
| T-L02 | Invalid password | Enter valid email + wrong password | Shows "Invalid email or password" in rose-400 block |
| T-L03 | Non-existent email | Enter unknown email | Shows "Invalid email or password" (do not leak user existence) |
| T-L04 | Empty email | Submit without email | Browser validation blocks submit |
| T-L05 | Empty password | Submit without password | Browser validation blocks submit |
| T-L06 | Show/hide password | Click Eye icon | Password input type toggles text/password |
| T-L07 | Remember me checked | Check box, submit | Refresh token TTL extended |
| T-L08 | Remember me unchecked | Uncheck, submit | Refresh token TTL short |
| T-L09 | Demo mode button | Click Demo Mode | `isDemoMode = true`; Dashboard loads with demo badge |
| T-L10 | Loading state | Submit, observe | Sign In button shows Loader2 spinner; button disabled |
| T-L11 | Enter key submits | Focus email, press Enter | Form submits |
| T-L12 | Backend 500 | Mock 500 response | Shows "Something went wrong, try again" |

### 3.2 Security

| ID | Scenario | Expected |
|---|---|---|
| T-LS01 | 5 failed logins | Account LOCKED; error message changes to "Account locked, try again in 30 minutes" |
| T-LS02 | Login during lock | Reject with `auth.account_locked` |
| T-LS03 | Login after lock expires | Accept; account ACTIVE |
| T-LS04 | Login with SUSPENDED account | Reject with `auth.account_suspended` |
| T-LS05 | Login with ARCHIVED account | Reject with `auth.account_archived` |
| T-LS06 | Login with REGISTERED (no acceptance) | Reject with `auth.invitation_pending` |
| T-LS07 | Password in DOM after submit | Password field cleared; not present in network log body (HTTPS) |
| T-LS08 | Token in localStorage after login | `suop_access_token` (post-fix) set; `suop_auth` set |
| T-LS09 | Logout clears tokens | Both `suop_auth` and `suop_access_token` removed |
| T-LS10 | Refresh-token rotation | Old refresh token rejected after rotation; family revoked on reuse |

### 3.3 Accessibility

| ID | Scenario | Expected |
|---|---|---|
| T-LA01 | Tab order | Email → Password → Eye toggle → Remember → Sign In → Demo |
| T-LA02 | Screen reader labels | Each input has associated `<Label>` |
| T-LA03 | Error association | Error text linked via `aria-describedby` |
| T-LA04 | Reduced motion | `animate-spin` respects `prefers-reduced-motion` |

---

## 4. Test Cases — Dashboard Module

### 4.1 Functional

| ID | Scenario | Expected |
|---|---|---|
| T-D01 | Dashboard loads after login | Welcome banner, 4 stat cards, sprint list render |
| T-D02 | Stat cards show real counts | Products count matches `productClient.list` total |
| T-D03 | Roles count | Matches `userClient.roles.list` total |
| T-D04 | Branches count | Matches `orgClient.plantApi.list` total where status=ACTIVE |
| T-D05 | Compliance count | Either removed or matches new aggregation endpoint |
| T-D06 | Click Products card | `setActiveModule('products')`; Products module renders |
| T-D07 | Click Roles card | `setActiveModule('rbac')`; RBAC module renders |
| T-D08 | Click Branches card | `setActiveModule('organization')`; Organization module renders |
| T-D09 | Click Compliance card | Navigates to compliance module |
| T-D10 | Sprint list renders 27 entries | Historical caption visible |
| T-D11 | Loading skeleton | Skeleton shows while counts are loading |
| T-D12 | Error state | If any count fails, error banner with Retry |
| T-D13 | Background refresh | Counts refresh on window focus (optional) |

### 4.2 Permission

| ID | Scenario | Expected |
|---|---|---|
| T-DP01 | Operator (no `ORG_READ`) | "Branches" card hidden |
| T-DP02 | Operator (no `AUTH_MANAGE_ROLES`) | "Roles" card hidden |
| T-DP03 | Auditor (read-only) | All cards visible but click navigates to read-only view |

---

## 5. Test Cases — Organization Module

### 5.1 Tree rendering

| ID | Scenario | Expected |
|---|---|---|
| T-O01 | Tree loads from API | `orgClient.hierarchyApi.getTree` called; tree matches response |
| T-O02 | Loading skeleton | Skeleton while fetching |
| T-O03 | Error state | Error banner with Retry on failure |
| T-O04 | Empty state | "No companies yet. Click Add Entity to create one." |
| T-O05 | Expand node | Clicking ChevronRight expands children; icon becomes ChevronDown |
| T-O06 | Collapse node | Clicking ChevronDown collapses children |
| T-O07 | Select node | `selectedNode` set; node highlighted; detail panel opens |
| T-O08 | Recursive depth | Tree renders to arbitrary depth without stack overflow (test depth=10) |
| T-O09 | Icons per type | ENTERPRISE=Building2, COMPANY=Factory, BU=Layers, BRANCH=MapPin |

### 5.2 Stat cards

| ID | Scenario | Expected |
|---|---|---|
| T-OS01 | Enterprises count | Matches count of top-level companies |
| T-OS02 | Companies count | Matches `companyApi.list` total |
| T-OS03 | Branches count | Matches `plantApi.list` total |
| T-OS04 | Warehouses count | Matches `warehouseApi.list` total |

### 5.3 CRUD (companies)

| ID | Scenario | Expected |
|---|---|---|
| T-OC01 | Open Add Entity dialog | Dialog renders with form fields |
| T-OC02 | Required field validation | Submit blocked if code/name/legal_name/gstin/pan/cin empty |
| T-OC03 | GSTIN format validation | Invalid GSTIN shows error |
| T-OC04 | PAN format validation | Invalid PAN shows error |
| T-OC05 | CIN format validation | Invalid CIN shows error |
| T-OC06 | Successful create | `companyApi.create` called; toast "Company created"; tree refreshes |
| T-OC07 | Duplicate code | 422; toast "Code already in use" |
| T-OC08 | Edit company | Detail panel Edit button opens form pre-filled; save calls `companyApi.update` |
| T-OC09 | Soft delete | Confirm dialog; on confirm `companyApi.delete`; toast; tree refreshes |
| T-OC10 | Hard delete | Typed-confirm dialog (type company name); `companyApi.hardDelete`; row removed |
| T-OC11 | Restore | "Show deleted" toggle; Restore button; `companyApi.restore` |

### 5.4 CRUD (plants, warehouses)

Mirror T-OC01–T-OC11 for plants and warehouses. Plants require `plant_type`, `region_id`, `timezone`, `currency`. Warehouses require `plant_id`, `warehouse_type`, `is_default`.

### 5.5 Workflow transitions

| ID | Scenario | Expected |
|---|---|---|
| T-OW01 | DRAFT → CONFIGURED | Transition button enabled; success toast; status badge updates |
| T-OW02 | CONFIGURED → ACTIVE | Same; `CompanyCreated` event emitted |
| T-OW03 | ACTIVE → SUSPENDED | Reason textarea required; audit row written |
| T-OW04 | SUSPENDED → ACTIVE | Transition button "Resume"; success |
| T-OW05 | ACTIVE → ARCHIVED | Confirm dialog; archived badge |
| T-OW06 | Illegal transition (DRAFT → ACTIVE) | Button disabled or 422 on attempt |
| T-OW07 | Plant activate | `PlantActivated` event emitted |

### 5.6 Audit viewer

| ID | Scenario | Expected |
|---|---|---|
| T-OA01 | Open audit tab on detail panel | Timeline loads |
| T-OA02 | Timeline entries | Each shows timestamp, actor, action, diff |
| T-OA03 | Filter by date range | Only entries in range shown |
| T-OA04 | Export CSV | Downloads file with current filter |

### 5.7 Search/filter

| ID | Scenario | Expected |
|---|---|---|
| T-OF01 | Type in search | Tree filters by name (case-insensitive) |
| T-OF02 | Clear search | Full tree restores |
| T-OF03 | No results | Shows "No matching nodes" |

---

## 6. Test Cases — Cross-Cutting

### 6.1 Token lifecycle

| ID | Scenario | Expected |
|---|---|---|
| T-T01 | Post-login API call | `orgClient.hierarchyApi.getTree` returns 200 (token present) |
| T-T02 | Token expiry | On 401, refresh attempted; retry succeeds |
| T-T03 | Refresh failure | User signed out; Login screen shown |
| T-T04 | Logout | Tokens cleared from localStorage; API calls fail |

### 6.2 Permission gating

| ID | Scenario | Expected |
|---|---|---|
| T-P01 | Operator | "Add Entity" hidden |
| T-P02 | Ops admin | "Add Entity" visible; hard-delete hidden |
| T-P03 | Enterprise admin | All buttons visible |
| T-P04 | Auditor | Read-only; no CRUD buttons |

### 6.3 Toasts and confirmations

| ID | Scenario | Expected |
|---|---|---|
| T-TC01 | Create success | Success toast "Company created" |
| T-TC02 | Create failure | Error toast with backend message |
| T-TC03 | Delete confirm | AlertDialog shown; Cancel aborts |
| T-TC04 | Hard-delete typed confirm | Must type exact company name to enable button |

### 6.4 Tenant isolation

| ID | Scenario | Expected |
|---|---|---|
| T-TI01 | User in tenant A | Cannot see tenant B's companies |
| T-TI02 | Cross-tenant API call | 404 (row not visible) |
| T-TI03 | Tenant badge in Header | Shows current tenant name |

---

## 7. E2E Test Cases (Playwright)

| ID | Journey | Steps |
|---|---|---|
| TE-01 | First-time admin onboarding | Login → Dashboard → Organization → Add Entity → Create company → Configure → Activate → Verify tree |
| TE-02 | Daily operator | Login → Dashboard → Click module card → Work |
| TE-03 | Lockout recovery | 5 failed logins → See lock message → Wait → Successful login |
| TE-04 | Audit trail | Login as auditor → Organization → Select company → Audit tab → Verify timeline |
| TE-05 | Permission denial | Login as operator → Navigate to Organization → Verify no Add Entity button |
| TE-06 | Soft delete + restore | Login as admin → Delete company → Toggle show deleted → Restore |
| TE-07 | Refresh token rotation | Login → Wait for token expiry → Continue working → Verify transparent refresh |
| TE-08 | Demo mode | Click Demo Mode → Verify demo badge → Verify read-only enforcement |
| TE-09 | Mobile responsive | Viewport 375px → Verify Sidebar drawer, header hamburger, stacked cards |
| TE-10 | Keyboard a11y | Tab through Login → Tab through Organization tree → Verify visible focus |

---

## 8. Performance Tests

| ID | Scenario | Threshold |
|---|---|---|
| T-PE01 | Dashboard load time | < 1.5s on 3G throttling |
| T-PE02 | Organization tree render (50 nodes) | < 500ms |
| T-PE03 | Organization tree render (500 nodes) | < 2s |
| T-PE04 | Hierarchy API response (50 nodes) | < 200ms p95 |
| T-PE05 | Login latency | < 800ms p95 |

Use the existing k6 scripts in `scripts/k6/` for backend load testing.

---

## 9. Test Automation Plan

| Layer | Tool | Location | CI trigger |
|---|---|---|---|
| Unit | Vitest + React Testing Library | `src/**/*.test.tsx` | Every push |
| Integration | Vitest + PGlite | `apps/backend/src/**/*.test.ts` | Every push |
| E2E | Playwright | `e2e/**/*.spec.ts` | On PR merge |
| Visual regression | Playwright + screenshot diff | `e2e/visual/` | Nightly |
| Accessibility | axe-playwright | `e2e/a11y/` | On PR merge |
| Load | k6 | `scripts/k6/` | Nightly + pre-release |

---

## 10. Test Data

- **Seed**: a tenant with 2 enterprises, 2 companies, 8 plants, 4 warehouses, 15 users, 12 products.
- **Reset**: PGlite in-memory for unit/integration; `db/custom.db` reset script for E2E.
- **Demo mode**: separate seed with read-only flag.

---

## 11. Defect Triage

| Severity | SLA |
|---|---|
| Critical (blocker) | Fix before merge |
| High | Fix within sprint |
| Medium | Fix within 2 sprints |
| Low | Backlog |

---

## 12. Sign-off Criteria

The section is test-ready when:

1. All T-L, T-D, T-O test cases above are automated and green.
2. Coverage targets (80 % unit, 100 % in-section integration) are met.
3. E2E TE-01 through TE-10 pass on staging.
4. Zero critical axe violations.
5. Performance thresholds T-PE01–T-PE05 met.
6. No open Critical or High defects.

---

## 13. Test Plan Estimate

| Activity | Effort |
|---|---|
| Write unit tests (120) | 5 days |
| Write integration tests (40) | 3 days |
| Write E2E tests (10) | 3 days |
| Set up visual regression + axe | 2 days |
| Performance test harness | 1 day |
| **Total** | **14 days** |

Tests can be written in parallel with implementation (see `12_IMPLEMENTATION_PLAN.md`).

---

## 14. Conclusion

The section today has **no automated tests** for the Dashboard or Organization modules, and only ad-hoc manual coverage for the Login screen. The test plan above is sized at ~170 test cases across unit, integration, and E2E layers, achievable in 14 engineer-days. The single most valuable test is TE-01 (the admin onboarding journey), because it would have caught the token-key mismatch before it shipped. Adding that one E2E test to CI is the highest-leverage quality investment available.

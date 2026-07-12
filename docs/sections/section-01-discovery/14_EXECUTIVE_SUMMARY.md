# 14 — Executive Summary: Login + Dashboard + Organization

**Audience**: CTO, VP Engineering, Product Director, Programme Sponsor.
**Purpose**: One-stop strategic view of the section's discovery findings, risk, and path to production.
**Reading time**: 7 minutes.

---

## 1. The Bottom Line

The Login screen works. The Dashboard and Organization modules are **visual mockups wired to hardcoded data**, sitting on top of a **fully built backend that they never call**. A single critical defect — a localStorage key mismatch — silently breaks every API client in the application after login. The section is **not production-ready** today, but it can be made production-ready in **4 weeks** with **2 engineers**, because every missing capability already exists in the codebase and just needs to be wired up.

**Production readiness score**: **5.21 / 10 — NO-GO.**
**Target after 4 weeks**: **9.0+ / 10 — GO.**

---

## 2. What We Found

### 2.1 What works

- **Login** is functionally complete: Argon2id password hashing, account lockout after 5 failed attempts, 30-minute lock duration, password history (last 10), refresh-token rotation, JWT-based auth, and audit logging of every login attempt (success and failure).
- **Backend** is over-built: 63 endpoints across auth (12), organisation (22), and user management (29), all backed by services, workflows, audit, and an event outbox.
- **Database** is enterprise-grade: 14 organisation tables plus auth tables, all following a uniform contract (`id`, `tenant_id`, `status`, `version`, `created_at/by`, `updated_at/by`, `deleted_at`), with tenant isolation enforced at the Prisma extension layer.
- **API clients** are written, typed, and unit-tested: 14 clients in `src/modules/*/api/client.ts`, including a complete `orgClient` with CRUD for companies, plants, warehouses, departments, cost centers, financial years, and hierarchy.

### 2.2 What is broken

- **Token key mismatch (critical)**: the auth store persists to `localStorage['suop_auth']`, but every API client reads `localStorage['suop_access_token']`. After a successful login, every API call sends `Authorization: Bearer null` and gets a 401. The Login screen looks green; every module downstream is red.
- **`orgClient` is never imported**: `OrganizationModule` renders a hardcoded tree (Sudhastar Group → Foods Ltd → Manufacturing BU → Mumbai Plant, etc.) and 4 hardcoded stat cards (Enterprises=1, Companies=2, Branches=8, Warehouses=4). None of the 22 organisation endpoints are reached.
- **Dashboard is static**: 4 stat cards show fixed numbers (Products=12, Roles=15, Branches=8, Compliance=6) that do not reflect any backend state. The 27-sprint progress list is a historical record (acceptable).
- **"Add Entity" button is dead**: it has no `onClick` handler. The user clicks and nothing happens.
- **No workflow transitions in UI**: the backend enforces a 5-state lifecycle (`DRAFT → CONFIGURED → ACTIVE → SUSPENDED → ARCHIVED`) with audit and events; the frontend surfaces none of it.
- **No permission checks in UI**: every authenticated user sees every card and every button. Operators see "Add Entity" (then get a 403 when it is eventually wired).
- **No audit trail viewer**: the backend writes 9 audit rows per organisation CRUD cycle; none of them are visible to the user.
- **Login errors are generic**: a locked account, a suspended account, an archived account, and a typo all show the same "Invalid email or password" message. This will spike support tickets.

### 2.3 What is missing

25 gaps total: 2 critical, 8 high, 10 medium, 4 low (one accepted). See `09_GAP_ANALYSIS.md` for the full register.

---

## 3. Why It Matters

### 3.1 User trust

When the Dashboard shows "Products=12" and the user knows there are 7 products in the database, trust in the entire UI collapses. The same applies to "Branches=8" when the tenant has 3 plants. Hardcoded numbers are worse than no numbers.

### 3.2 Operational cost

Onboarding a new company, plant, or warehouse today requires a backend engineer to run SQL. At scale (10 customers per month, 5 entities each), that is 50 SQL interventions per month — unsustainable.

### 3.3 Compliance exposure

The audit data exists but is invisible. A compliance auditor who asks "who created this plant, and when?" cannot be answered from the UI. The data is in `audit_logs`, but no one except a DBA can read it.

### 3.4 Support load

The lockout experience is the single biggest support-ticket driver. A user who mistypes his password 5 times sees "Invalid email or password" for 30 minutes and assumes the system is broken. He raises a ticket. The helpdesk resets the password (the wrong fix). The cycle repeats.

### 3.5 Security posture

The backend RBAC is excellent (per-route permission checks, JWT-carried permissions, tenant isolation). The frontend is RBAC-blind. Until `hasPermission` is applied to every button, the UI will show users actions they cannot perform, and the 403s will erode trust.

---

## 4. The Single Most Important Fix

**Fix the token key mismatch.** It is one day of work, it requires no backend change, and it unblocks every API client in the entire application — not just this section. Every other fix depends on it. Until it is done, no module in the ERP can be trusted to work after login.

```ts
// src/lib/api/token.ts
const KEY = 'suop_access_token';
export const getAccessToken = () => localStorage.getItem(KEY);
export const setAccessToken = (t: string | null) =>
  t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY);

// src/stores/auth-store.ts — in login()
setAccessToken(res.accessToken);

// in logout()
setAccessToken(null);
```

That is the entire critical fix.

---

## 5. The 4-Week Path to Production

| Week | Workstream | Outcome |
|---|---|---|
| 1 | W-01 Token unification + W-02 Organization wiring + W-03 Dashboard live counts | Every API client works after login; org tree and stats load from the backend; Dashboard shows real numbers. |
| 2 | W-04 CRUD + detail panel + search + W-05 Workflow transitions + audit viewer | Admin can create, edit, delete, restore, and transition companies/plants/warehouses from the UI; audit timeline visible. |
| 3 | W-06 Permission gating + login error branching + W-07 Polish (toasts, validation, breadcrumbs) + W-08 Test automation (parallel) | UI respects permissions; locked users see clear messages; every mutation has feedback; E2E suite green. |
| 4 | Hardening, staging verification, feature-flag rollout | Score ≥ 8.5; go-live. |

**Total effort**: ~46 dev-days (2 engineers × 4 weeks).
**No backend rework**: every endpoint, service, workflow, and table already exists.
**No schema change**: the database is correct as-is.
**No migration**: only frontend wiring and one small backend addition (tenant name in `/auth/me`, plus a thin `/audit-logs` read endpoint if it does not exist).

---

## 6. Risk Profile

- **2 critical risks** (R-01 token mismatch, R-02 user trust erosion) — both fixed by W-01.
- **8 high risks** — all addressed within the 4-week plan.
- **No exotic threats**: no architectural rework, no third-party dependency risk, no regulatory blocker.
- **One accepted risk**: static sprint data (historical, marked as such).

The risk profile is **concentrated and tractable**. See `10_RISK_REGISTER.md` for the full 20-risk register.

---

## 7. Scorecard Snapshot

| Dimension | Today | After 4 weeks |
|---|---|---|
| Functional completeness | 5.0 | 9.0 |
| API integration | 4.0 | 9.0 |
| Data integrity | 5.0 | 8.5 |
| Security & RBAC | 6.5 | 9.0 |
| Workflow & lifecycle | 4.0 | 8.5 |
| UX & accessibility | 6.0 | 8.5 |
| Observability & audit | 5.5 | 8.5 |
| Test coverage | 2.0 | 8.0 |
| Performance | 7.0 | 8.0 |
| Documentation | 7.5 | 8.0 |
| **Weighted total** | **5.21** | **8.65** |
| **Verdict** | **NO-GO** | **GO** |

See `13_PRODUCTION_SCORECARD.md` for the full dimension-by-dimension breakdown.

---

## 8. Recommendations to the Sponsor

1. **Approve the 4-week plan as a single sponsored workstream.** Do not fragment it across teams — the critical path is linear and the dependencies are tight.
2. **Authorise the token-key hotfix to ship in week 1, ahead of the rest of the plan.** This single fix unblocks every other module in the ERP, not just this section. It is low-risk (one helper file + two call-site changes) and high-leverage.
3. **Decide on the "Compliance" Dashboard card in week 1.** Either remove it or commission a new aggregation endpoint. The current hardcoded "6" cannot ship.
4. **Allocate a part-time QA engineer from day 1.** Test automation (W-08) must run in parallel with implementation, not after. The current 2.0/10 test coverage is the lowest-scoring dimension and the biggest hidden risk.
5. **Hold the go-live gate at 7.5.** Do not ship at 7.0. The two dimensions that lag (D-08 tests, D-02 API integration) are the two that most predict production incidents.
6. **Re-evaluate the scorecard at the end of each workstream**, not just at the end of the plan. The scorecard is the single source of truth for go/no-go.
7. **After go-live, run a 2-week watch period** with daily check-ins on support tickets, error rates, and the lockout-specific metric (target: -50% within 4 weeks).

---

## 9. What Not to Do

- **Do not** ship the section behind a feature flag in its current state. The token mismatch affects the entire app, not just the flag-gated section.
- **Do not** attempt to fix the token mismatch with a "bridge" that copies between the two localStorage keys. Standardise on a single key — the bridge creates a third state to debug.
- **Do not** commission new backend work before W-01 is merged. Every backend capability needed for this section already exists.
- **Do not** defer W-06 (permission gating) to a later sprint. Shipping CRUD without permission gating will generate 403s that erode user trust faster than the hardcoded numbers did.
- **Do not** accept the "Compliance=6" card as a placeholder. Remove it or back it with real data.

---

## 10. The One-Sentence Summary

**The section's backend is excellent, its frontend is a mockup, and a single one-day fix (the token key) unlocks a four-week path from 5.2/10 to 9.0/10 — go schedule W-01 today.**

---

## 11. Report Index

| # | Report | Purpose |
|---|---|---|
| 01 | SECTION_AUDIT | Inventory and findings |
| 02 | API_MAPPING | Endpoint-to-UI traceability |
| 03 | BUSINESS_ANALYSIS | Personas, journeys, KPIs |
| 04 | DATA_FLOW | End-to-end data movement |
| 05 | DATABASE_MAPPING | Tables, columns, indexes |
| 06 | WORKFLOW_ANALYSIS | State machines and transitions |
| 07 | RBAC_ANALYSIS | Permissions and enforcement |
| 08 | UI_COMPONENT_MAP | Components, primitives, tokens |
| 09 | GAP_ANALYSIS | 25 gaps with severity and effort |
| 10 | RISK_REGISTER | 20 risks with mitigation |
| 11 | TEST_PLAN | 170 test cases across 4 layers |
| 12 | IMPLEMENTATION_PLAN | 4-week, 8-workstream plan |
| 13 | PRODUCTION_SCORECARD | 10-dimension scoring |
| 14 | EXECUTIVE_SUMMARY | This document |

---

## 12. Sign-off

| Role | Name | Date | Decision |
|---|---|---|---|
| Discovery lead | _________ | _________ | _________ |
| Engineering lead | _________ | _________ | _________ |
| Product owner | _________ | _________ | _________ |
| QA lead | _________ | _________ | _________ |
| Programme sponsor | _________ | _________ | _________ |

---

*End of executive summary. Full detail in reports 01–13.*

# 13 — Technical Debt Update Report

**Document ID:** STAB-13-TECH-DEBT
**Author:** Stabilization Workstream
**Status:** Draft for Review
**Last Updated:** Current Cycle

---

## 1. Purpose

This report updates the technical debt register following the frontend
refactoring effort. It catalogs debt retired, debt introduced, debt
carried forward, and a prioritized payoff plan.

## 2. Executive Summary

The refactoring retired the **single largest** debt item in the project
(the 37,080-line monolithic `page.tsx`) and introduced a layered, modular
architecture. However, the refactoring also **introduced new debt**:
undocumented components, unwired API clients, absent tests, and a
quarantined legacy backup. Net debt position has improved structurally but
requires a disciplined payoff phase to convert the new architecture into
a production-ready state.

## 3. Debt Retired

### D-R-01 — Monolithic page.tsx (RETIRED)
- **Before:** 37,080-line single file containing all UI logic.
- **After:** 387-line routing/composition root.
- **Reduction:** 99%.
- **Status:** Retired. Backup retained as `page.tsx.bak` for one release
  cycle (transitional debt — see D-N-01).

### D-R-02 — Absent Enterprise Component Library (RETIRED)
- **Before:** No reusable component layer; every page reimplemented UI.
- **After:** 54 enterprise components in `src/components/enterprise/`.
- **Status:** Retired (catalog exists; component maturity is debt — see
  D-N-02).

### D-R-03 — Absent Form Primitive Layer (RETIRED)
- **Before:** Forms implemented ad-hoc per page.
- **After:** 19 form primitives in `src/components/enterprise/forms/`.
- **Status:** Retired (contract maturity is debt — see D-N-03).

### D-R-04 — Absent Feature Module Structure (RETIRED)
- **Before:** No module boundaries; all features in one file.
- **After:** 11 feature modules with standardized structure.
- **Status:** Retired (isolation enforcement is debt — see D-N-04).

## 4. Debt Introduced

### D-N-01 — page.tsx.bak Quarantine (NEW, transitional)
- **Description:** 37K-line backup file remains in the tree.
- **Remediation:** Quarantine to branch, delete after one release.
- **Owner:** Frontend workstream.
- **Due:** Next release cycle.

### D-N-02 — Undocumented Enterprise Components (NEW)
- **Description:** 54 components lack prop tables, stories, and a11y
  audit.
- **Remediation:** MDX docs + Storybook + axe-core audit.
- **Owner:** Design system workstream.
- **Due:** 4 sprints.

### D-N-03 — Uncontracted Form Primitives (NEW)
- **Description:** 19 primitives not bound to a form library or schema
  layer.
- **Remediation:** Standardize on React Hook Form + Zod; refactor
  primitives; add tests.
- **Owner:** Forms workstream.
- **Due:** 3 sprints.

### D-N-04 — Unenforced Module Isolation (NEW)
- **Description:** No ESLint boundary rule; modules can import each
  other's internals.
- **Remediation:** Add `eslint-plugin-boundaries`; module manifests;
  per-module test scope.
- **Owner:** Architecture workstream.
- **Due:** 2 sprints.

### D-N-05 — Unwired API Clients (NEW)
- **Description:** 14 API clients exist but are not consumed by feature
  module services.
- **Remediation:** Wire clients during per-module migration.
- **Owner:** Feature teams.
- **Due:** Per module migration schedule.

### D-N-06 — Absent Frontend Test Harness (NEW, carried from before)
- **Description:** Zero frontend tests.
- **Remediation:** Vitest + RTL + MSW + Playwright + axe-core.
- **Owner:** QA workstream.
- **Due:** 2 sprints to establish; ongoing coverage growth.

### D-N-07 — Absent Frontend RBAC (NEW, carried from before)
- **Description:** 54 backend permissions have no frontend counterpart.
- **Remediation:** Permission catalog, hooks, `<Can>` component, route
  guards.
- **Owner:** Security workstream.
- **Due:** 3 sprints.

### D-N-08 — Mock Data in Dashboard (NEW, transitional)
- **Description:** `DashboardPage.tsx` uses inline mock data.
- **Remediation:** Replace with real API wiring.
- **Owner:** Frontend workstream.
- **Due:** 1 sprint.

### D-N-09 — Absent Dark Mode (NEW, carried)
- **Description:** No theme-token layer; dark mode unsupported.
- **Remediation:** Token layer + dark theme.
- **Owner:** Design system workstream.
- **Due:** Post-stabilization.

### D-N-10 — Workspace Clutter (carried)
- **Description:** > 160 MB of stale artifacts; duplicate Prisma schemas.
- **Remediation:** Execute reports 11 and 12.
- **Owner:** DevOps workstream.
- **Due:** 1 sprint.

## 5. Debt Carried Forward

### D-C-01 — Responsive Design Untested
- **Description:** Tailwind breakpoints used but no device-matrix testing.
- **Remediation:** Playwright device matrix; responsive audit.

### D-C-02 — No Frontend i18n
- **Description:** Hard-coded user-facing strings.
- **Remediation:** Adopt i18n framework; extract strings.

### D-C-03 — No Visual Regression
- **Description:** No snapshot tests for components.
- **Remediation:** Playwright snapshots or Chromatic.

### D-C-04 — No Frontend Performance Budget
- **Description:** No bundle size or runtime budget enforced.
- **Remediation:** Bundle budget in CI; Lighthouse CI.

### D-C-05 — No Error Boundary Strategy
- **Description:** No standardized error boundary per route.
- **Remediation:** Route-level error boundaries.

## 6. Debt Prioritization

Debt is prioritized by **risk × urgency**:

| Priority | Debt IDs | Rationale |
| --- | --- | --- |
| P0 (blocker) | D-N-07, D-N-06, D-N-05 | Security + quality blockers |
| P1 (high) | D-N-04, D-N-03, D-N-01, D-N-10, D-N-08 | Architectural + cleanup |
| P2 (medium) | D-N-02, D-C-05, D-C-01 | UX + robustness |
| P3 (low) | D-N-09, D-C-02, D-C-03, D-C-04 | Polish |

## 7. Payoff Plan

### Sprint 1
- D-N-10 (workspace cleanup).
- D-N-08 (dashboard mock data).
- D-N-04 (module isolation enforcement).
- D-N-06 (test harness setup).

### Sprint 2
- D-N-07 (RBAC layer).
- D-N-03 (form library standardization).
- D-N-01 (page.tsx.bak quarantine).

### Sprint 3
- D-N-02 (component docs + a11y audit).
- D-N-05 (API client wiring — first 3 modules).

### Sprint 4+
- D-N-05 (remaining modules).
- D-C-* items in priority order.

## 8. Debt Metrics

| Metric | Before | After (current) | Target |
| --- | --- | --- | --- |
| Largest file (lines) | 37,080 | 387 | < 500 |
| Frontend tests | 0 | 0 | ≥ 500 |
| Frontend coverage | 0% | 0% | ≥ 75% |
| Enterprise components documented | 0 / 54 | 0 / 54 | 54 / 54 |
| Form primitives contracted | 0 / 19 | 0 / 19 | 19 / 19 |
| RBAC-enforced routes | 0 / N | 0 / N | N / N |
| Repository size (MB) | > 200 | ~200 | < 150 |
| Duplicate Prisma schemas | 3 | 3 | 1 |

## 9. Debt-Induced Risk

| Risk | Owning Debt | Mitigation |
| --- | --- | --- |
| Unauthorized access | D-N-07 | RBAC layer (sprint 2) |
| Regression undetected | D-N-06 | Test harness (sprint 1) |
| Module coupling | D-N-04 | Boundary rules (sprint 1) |
| Form validation bypass | D-N-03 | Library standardization (sprint 2) |
| Schema drift | D-N-10 | Cleanup (sprint 1) |

## 10. Acceptance Criteria

- [ ] All P0 debt retired within 2 sprints.
- [ ] All P1 debt retired within 3 sprints.
- [ ] Debt metrics trending toward targets each sprint.
- [ ] Debt register reviewed in every sprint retrospective.

## 11. Conclusion

The refactoring retired the project's largest debt item but introduced a
new generation of debt characteristic of a fresh architecture: absent
tests, absent docs, unenforced boundaries. The payoff plan is sequenced
to retire P0 debt first (RBAC, tests, API wiring), then P1 (isolation,
forms, cleanup), then P2/P3 polish. With discipline, the project will
exit the stabilization phase with a net debt position significantly
better than before the refactoring.

---

*End of report STAB-13-TECH-DEBT.*

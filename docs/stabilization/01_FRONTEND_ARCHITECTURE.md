# 01 — Frontend Architecture Stabilization Report

**Document ID:** STAB-01-FE-ARCH
**Author:** Stabilization Workstream
**Status:** Draft for Review
**Last Updated:** Current Cycle

---

## 1. Purpose

This report documents the architectural state of the frontend application
following the recent large-scale refactoring effort. It identifies structural
risks, gaps in wiring, and stabilization actions required before the next
release milestone.

## 2. Executive Summary

The frontend has undergone a structural refactoring that reduced the
monolithic `page.tsx` from **37,080 lines to 387 lines** (a 99% reduction).
A new layered architecture composed of enterprise design system components,
form primitives, and feature modules has been introduced. While the skeleton
is in place, the feature module contents are still placeholder pages and the
API clients have not yet been wired to the new components. The architecture
is sound but **not yet load-bearing** — it must be hardened before business
logic is migrated into it.

## 3. Current Architecture Overview

### 3.1 Layered Model

The refactored frontend follows a four-layer architecture:

1. **Routing / Composition Layer** — `page.tsx` (387 lines)
   - Reduced to routing and top-level composition only.
   - No business logic, no inline components.
2. **Enterprise Design System Layer** — `src/components/enterprise/`
   - 54 components providing reusable UI primitives.
3. **Form Primitives Layer** — `src/components/enterprise/forms/`
   - 19 typed, accessible form field components.
4. **Feature Module Layer** — `src/features/`
   - 11 feature modules, each with a standardized internal structure.

### 3.2 Feature Module Standard Structure

Each of the 11 feature modules (`procurement`, `inventory`, `warehouse`,
`manufacturing`, `quality`, `finance`, `crm`, `hr`, `analytics`,
`administration`, `platform`) exposes the following sub-paths:

```
src/features/<module>/
  ├── components/
  ├── forms/
  ├── hooks/
  ├── schemas/
  ├── services/
  ├── tables/
  ├── dialogs/
  ├── drawers/
  ├── pages/
  ├── types/
  ├── utils/
  └── index.ts
```

The `index.ts` barrel file is the single entry point for cross-module imports,
enforcing encapsulation.

### 3.3 Backend Reference (Frozen Baseline)

The backend is frozen and unchanged:

| Metric | Value |
| --- | --- |
| Backend modules | 56 |
| Prisma models | 360 |
| Tests passing | 3,299 |
| TypeScript errors | 0 |
| ESLint errors | 0 |
| Circular dependencies | 0 |
| API endpoints | 656 |
| Workflows | 38 |
| Permissions | 54 |

The backend provides a stable contract against which the frontend must be
validated.

## 4. Findings

### F-01 — Monolithic Page Decomposed but Backup Remains in Tree
`page.tsx.bak` (37,080 lines) is still present in the repository. It must be
removed (or quarantined) to prevent accidental re-import and to keep the
repository diff clean. See report 12 for deletion procedure.

### F-02 — Feature Modules Are Placeholder Pages
Each of the 11 feature modules currently exposes a placeholder page. The
actual module content (forms, tables, dialogs) has **not yet been migrated**
from the legacy page. The architecture is structurally correct but
functionally empty.

### F-03 — API Clients Exist but Are Not Wired
API clients are present at `src/modules/*/api/client.ts` for 14 modules.
However, the new feature module components do not yet import or invoke these
clients. This creates a risk of divergent data shapes between the frontend
and the backend contract.

### F-04 — Mock Data in DashboardPage
`DashboardPage.tsx` contains inline mock data rather than live API calls.
This must be replaced with real API wiring before any user-facing release.

### F-05 — No Frontend Test Harness
Vitest, React Testing Library, and Playwright have not been configured. The
architecture cannot be considered stable without a regression harness. See
report 09.

### F-06 — Dark Mode Not Implemented
Theming supports light mode only. The architecture should expose a
theme-token layer; this is currently absent.

### F-07 — Responsive Design Untested
Tailwind breakpoints are used throughout components, but no formal
responsive audit or device-matrix test has been performed.

### F-08 — Auth Store Coupling
Frontend relies on `useAuthStore` for auth state. The store is sound, but no
guard layer exists to prevent modules from accessing auth internals directly.

## 5. Risk Assessment

| ID | Risk | Likelihood | Impact | Score |
| --- | --- | --- | --- | --- |
| R1 | Placeholder pages shipped to production | Medium | High | High |
| R2 | API contract drift between client and components | High | High | Critical |
| R3 | No regression coverage on refactored code | High | High | Critical |
| R4 | Accidental re-import of `page.tsx.bak` | Low | High | Medium |
| R5 | RBAC bypass on frontend routes | Medium | High | High |

## 6. Recommended Actions

1. **Quarantine `page.tsx.bak`** into a separate branch or archive within
   one sprint, then delete after one release cycle.
2. **Wire API clients** to feature module services as the first task of each
   module migration.
3. **Replace mock data** in `DashboardPage.tsx` with real API calls.
4. **Establish a test harness** (Vitest + RTL + Playwright) before any
   further feature migration. See report 09.
5. **Introduce a route guard layer** that enforces RBAC at the navigation
   boundary. See report 08.
6. **Add a theme-token abstraction** to support dark mode in a later phase.

## 7. Acceptance Criteria

- [ ] `page.tsx.bak` removed from the main branch.
- [ ] At least one feature module fully migrated end-to-end as a reference.
- [ ] API clients imported and invoked from feature module services.
- [ ] DashboardPage no longer contains inline mock data.
- [ ] Test harness configured and running on CI.
- [ ] Route guard layer enforces RBAC for all protected routes.

## 8. Open Questions

- Should the enterprise component library be published as an internal
  package, or kept as a path-aliased module?
- What is the long-term strategy for the 14 API clients in `src/modules/*/api/`
  relative to the 11 feature modules in `src/features/`? Should the clients
  be relocated under `src/features/<module>/services/`?

## 9. Conclusion

The frontend architecture has been successfully rebalanced from a single
monolithic page into a layered, modular structure. The skeleton is sound and
matches enterprise conventions. However, the architecture is **not yet
operational** — feature content, API wiring, tests, and RBAC enforcement
remain as stabilization work. This report establishes the baseline against
which subsequent stabilization reports (02–15) measure progress.

---

*End of report STAB-01-FE-ARCH.*

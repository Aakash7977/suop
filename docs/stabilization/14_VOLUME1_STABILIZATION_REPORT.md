# 14 — Volume 1 Stabilization Report

**Document ID:** STAB-14-VOLUME-1
**Author:** Stabilization Workstream
**Status:** Draft for Review
**Last Updated:** Current Cycle

---

## 1. Purpose

This report consolidates the findings of reports 01 through 13 into a
single stabilization plan for Volume 1 of the post-refactoring phase. It
defines the scope, sequencing, exit criteria, and resource estimates for
the stabilization effort.

## 2. Executive Summary

Volume 1 stabilization covers the work required to take the refactored
frontend from a structurally complete but functionally empty state to a
production-ready state. The scope spans six workstreams: **architecture**,
**design system**, **forms**, **navigation & RBAC**, **testing**, and
**business flow validation**, supported by a **workspace cleanup**
workstream. Estimated duration: **4 sprints** (8 weeks). Estimated effort:
**~320 person-days**. Exit criteria are defined per workstream and rolled
up to a single release gate.

## 3. Scope

### 3.1 In Scope
- Frontend architecture stabilization (report 01).
- Design system standardization (reports 02, 03).
- Forms layer standardization (report 04).
- Navigation and RBAC enforcement (reports 05, 08).
- UI/UX standardization (report 06).
- Module isolation enforcement (report 07).
- Frontend test harness (report 09).
- Business flow validation (report 10).
- Workspace cleanup (reports 11, 12).
- Technical debt payoff P0 and P1 (report 13).

### 3.2 Out of Scope
- Backend changes (backend is frozen).
- New business features.
- Dark mode (deferred to Volume 2).
- i18n (deferred to Volume 2).
- Visual regression with Chromatic (deferred to Volume 2).
- Performance budgeting (deferred to Volume 2).

## 4. Workstream Summary

| # | Workstream | Report | Owner | Sprint |
| --- | --- | --- | --- | --- |
| W1 | Workspace cleanup | 11, 12 | DevOps | 1 |
| W2 | Test harness setup | 09 | QA | 1 |
| W3 | Module isolation | 07 | Architecture | 1 |
| W4 | Route registry & navigation | 05 | Architecture | 1–2 |
| W5 | RBAC enforcement | 08 | Security | 2 |
| W6 | Form standardization | 04 | Forms | 2 |
| W7 | Design system docs & a11y | 02, 03 | Design system | 2–3 |
| W8 | API client wiring | 01 | Feature teams | 2–4 |
| W9 | Business flow validation | 10 | Feature teams | 2–4 |
| W10 | UI/UX standard adoption | 06 | All | 1–4 |

## 5. Sprint Plan

### Sprint 1 — Foundations
**Focus:** Cleanup, test harness, isolation, navigation foundation.
- W1: Workspace cleanup executed in 3 batched PRs.
- W2: Vitest, RTL, MSW, Playwright, axe-core configured. CI gates active.
- W3: ESLint boundary rules. Module manifests drafted.
- W4: Route registry skeleton. Sidebar bound to registry.
- W10: UI/UX standard published. Token layer introduced.

**Exit criteria:**
- Repository size reduced ≥ 150 MB.
- CI runs frontend tests with coverage gate.
- Boundary rules enforce module isolation.
- Route registry exists and drives sidebar.

### Sprint 2 — Security & Forms
**Focus:** RBAC, form standardization, design system docs.
- W5: Permission catalog generated. `usePermissions`, `<Can>`, route
  guards, sidebar filtering, 403 handler.
- W6: React Hook Form + Zod adopted. 19 primitives refactored. Tests
  added.
- W7: MDX docs for P0 components. axe-core audit on P0 components.
- W4: Breadcrumbs bound to route registry. Command palette contract.
- W8: API clients wired for procurement (reference module).

**Exit criteria:**
- All 54 permissions enforced on routes and sidebar.
- All 19 form primitives under standardized contract with tests.
- P0 components documented and a11y-audited.
- Procurement module API client wired.

### Sprint 3 — Reference Flow
**Focus:** First business flow end-to-end.
- W9: Procurement PO flow validated end-to-end (flow #1 from report 10).
- W8: API clients wired for inventory, warehouse, finance.
- W7: MDX docs for P1 components. a11y audit on P1.
- W5: Command palette filtered by permission. Global search scoped.
- W10: At least one feature module fully UI/UX-compliant as reference.

**Exit criteria:**
- PO flow passes Playwright e2e.
- PO flow RBAC matrix verified.
- PO flow audit trail verified.
- P1 components documented and a11y-audited.

### Sprint 4 — Flow Coverage
**Focus:** Remaining critical flows.
- W9: Flows 2, 3, 5 (inventory receiving, manufacturing, sales-to-cash).
- W8: API clients wired for manufacturing, quality, crm, hr.
- W7: MDX docs for P2 components. a11y audit on P2.
- W10: UI/UX compliance matrix filled for migrated modules.

**Exit criteria:**
- 4 of 12 critical flows validated end-to-end.
- Remaining 8 flows scheduled for Volume 2.
- P2 components documented and a11y-audited.

## 6. Resource Estimates

| Workstream | Effort (person-days) |
| --- | --- |
| W1 Workspace cleanup | 5 |
| W2 Test harness | 10 |
| W3 Module isolation | 8 |
| W4 Navigation | 15 |
| W5 RBAC | 25 |
| W6 Forms | 25 |
| W7 Design system | 40 |
| W8 API wiring | 80 |
| W9 Flow validation | 90 |
| W10 UI/UX standard | 20 |
| Cross-cutting / buffer | 20 |
| **Total** | **~338** |

Assuming a 5-person team, this is approximately 8 weeks (4 two-week
sprints).

## 7. Exit Criteria (Release Gate)

All of the following must be satisfied to exit Volume 1:

### Architecture
- [ ] `page.tsx.bak` quarantined.
- [ ] Route registry drives all 4 navigation surfaces.
- [ ] Module isolation enforced by CI.
- [ ] Single canonical Prisma schema.

### Design System
- [ ] All 54 components documented.
- [ ] P0 and P1 components a11y-audited.
- [ ] Token layer adopted.

### Forms
- [ ] 19 primitives under standardized contract.
- [ ] Each primitive has unit tests.

### RBAC
- [ ] All 54 permissions enforced on routes and sidebar.
- [ ] Action buttons wrapped with `<Can>`.
- [ ] 403 handler active.
- [ ] RBAC tests in CI.

### Testing
- [ ] Vitest, RTL, MSW, Playwright, axe-core configured.
- [ ] Coverage gate: 75% statements, 70% branches, 75% functions.
- [ ] At least 4 critical flow e2e tests.

### Business Flows
- [ ] 4 of 12 critical flows validated end-to-end.
- [ ] Remaining 8 flows scheduled.

### Workspace
- [ ] Cleanup executed (≥ 150 MB recovered).
- [ ] CI hygiene gates active.

## 8. Risk Register (Roll-up)

| ID | Risk | Workstream | Mitigation |
| --- | --- | --- | --- |
| V1R1 | RBAC gaps slip past sprint 2 | W5 | Dedicated security reviewer |
| V1R2 | Test harness delays feature work | W2, W8 | Harness first, then features |
| V1R3 | Flow validation reveals deep defects | W9 | Buffer sprint + triage |
| V1R4 | Cleanup deletes in-use artifact | W1 | Verification gates per report 12 |
| V1R5 | Scope creep into Volume 2 items | All | Strict out-of-scope list |

## 9. Out-of-Scope Items (Volume 2)

The following are explicitly deferred to Volume 2:
- Dark mode (D-N-09).
- i18n (D-C-02).
- Visual regression with Chromatic (D-C-03).
- Performance budget (D-C-04).
- Route-level error boundaries (D-C-05).
- Remaining 8 critical flow validations.
- Full UI/UX compliance for all 11 modules.
- Per-module build optimization.

## 10. Reporting Cadence

- **Daily:** Standup with workstream leads.
- **Sprint review:** Demo of sprint exit criteria.
- **Sprint retrospective:** Debt register review (report 13).
- **Weekly:** Risk register review with stakeholders.

## 11. Success Definition

Volume 1 is successful if, at the end of sprint 4:
- All release-gate criteria are met.
- 4 critical flows pass end-to-end on the new frontend with RBAC and
  audit verification.
- The frontend has a working test harness with non-zero coverage.
- The workspace is clean and CI hygiene gates prevent regression.
- The debt register shows net reduction in P0 and P1 debt.

## 12. Conclusion

Volume 1 stabilization is a **focused 8-week effort** to convert the
refactored architecture from skeleton to production-ready. The plan is
sequenced to retire risk early (cleanup, tests, isolation in sprint 1;
RBAC in sprint 2), establish a reference flow (sprint 3), and expand
coverage (sprint 4). With disciplined execution against the exit criteria,
the project will exit Volume 1 with a stable, secure, tested, and
documented frontend.

---

*End of report STAB-14-VOLUME-1.*

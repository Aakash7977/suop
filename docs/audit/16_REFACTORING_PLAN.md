# 16 — Refactoring Plan

**Project:** SUOP ERP System
**Audit Date:** RC2 Certification Cycle
**Owner:** Engineering Leadership
**Scope:** Frontend decomposition + backend type-safety + DevOps hardening
**Audit Phase:** Final RC2 Certification

---

## 1. Executive Summary

This refactoring plan addresses the technical debt identified in Report 15, with a primary focus on the **frontend monolith** (`page.tsx`, 37,080 lines), which is the single largest blocker for end-to-end production readiness. The plan is organized into **4 phases** spanning approximately **12 weeks**, with clear deliverables, owners, and exit criteria for each phase.

The plan prioritizes the frontend because:
1. It unblocks the most downstream items (E2E tests, user manual, business flow verification).
2. It is the lowest-scoring dimension (5.0/10 frontend, 4.0/10 forms, 5.0/10 UI/UX).
3. The backend is already RC2-certified and requires only incremental improvements.

---

## 2. Methodology

1. **Debt prioritization** — Ranked all 27 debt items from Report 15 by impact and dependency.
2. **Critical-path identification** — Identified TD-01 (monolith) as the critical-path blocker.
3. **Phase decomposition** — Grouped items into 4 sequential phases with clear exit criteria.
4. **Effort estimation** — Assigned rough effort estimates (T-shirt sizes) per item.
5. **Owner assignment** — Assigned each phase to a logical owner.
6. **Risk assessment** — Identified refactor risks (regression, scope creep) and mitigations.

---

## 3. Findings Table (Refactor Backlog)

| ID | Phase | Item | Effort | Owner | Dependency | Priority |
|----|-------|------|--------|-------|------------|----------|
| RF-01 | 1 | Decompose `page.tsx` into feature folders | High | Frontend | — | P1 |
| RF-02 | 1 | Build API client layer (`src/lib/api.ts`) | Medium | Frontend | — | P1 |
| RF-03 | 1 | Adopt Zustand for global state (auth, tenant, master data) | Medium | Frontend | RF-01 | P1 |
| RF-04 | 2 | Extract all forms into `src/features/*/forms/` | High | Frontend | RF-01 | P1 |
| RF-05 | 2 | Adopt `react-hook-form` + Zod resolver | Medium | Frontend | RF-04 | P1 |
| RF-06 | 2 | Share Zod schemas between frontend and backend (monorepo) | Medium | Fullstack | RF-05 | P2 |
| RF-07 | 2 | Build field primitives (`<TextField>`, `<SelectField>`, etc.) | Medium | Frontend | RF-01 | P2 |
| RF-08 | 3 | Build ERP components (`<DataGrid>`, `<MasterDetail>`, `<Wizard>`) | High | Frontend | RF-07 | P2 |
| RF-09 | 3 | Define design tokens (color, spacing, typography) | Medium | Frontend | — | P2 |
| RF-10 | 3 | Build `<AuditViewer>`, `<WorkflowStatus>`, `<TenantSwitcher>` | Medium | Frontend | RF-08 | P2 |
| RF-11 | 3 | Adopt i18n framework (`next-intl`); externalize strings | Medium | Frontend | RF-01 | P2 |
| RF-12 | 4 | Add Vitest + RTL frontend test suite | High | Frontend | RF-01 | P1 |
| RF-13 | 4 | Add Playwright E2E suite for 5 canonical flows | High | QA | RF-02 | P1 |
| RF-14 | 4 | Refactor 86 non-essential `as any` instances | Medium | Backend | — | P2 |
| RF-15 | 4 | Increase backend statement coverage to 80%+ | Medium | Backend | — | P2 |
| RF-16 | 4 | Run axe-core a11y audit; remediate to WCAG 2.1 AA | Medium | Frontend | RF-08 | P3 |

---

## 4. Detailed Analysis

### 4.1 Phase 1: Foundation (Weeks 1–3)

**Goal:** Break the monolith and establish the API client layer.

**Deliverables:**
- `page.tsx` decomposed into feature folders:
  ```
  src/features/<module>/
    ├── components/
    ├── forms/
    ├── hooks/
    ├── schemas/
    └── index.ts
  ```
- API client layer (`src/lib/api.ts`) with typed methods generated from OpenAPI.
- Zustand store for auth, tenant context, and cached master data.

**Exit Criteria:**
- `page.tsx` reduced to < 500 lines (route composition only).
- All API calls go through `src/lib/api.ts` (no direct `fetch`).
- Global state is in Zustand (no prop-drilling for auth/tenant).
- Existing UI behavior preserved (verified by manual smoke test).

**Risks:**
- Regression in existing UI behavior — mitigated by manual smoke testing (automated tests come in Phase 4).
- Scope creep — mitigated by strict exit criteria.

### 4.2 Phase 2: Forms & Validation (Weeks 4–6)

**Goal:** Extract forms and adopt a proper form library with shared validation.

**Deliverables:**
- All forms extracted to `src/features/*/forms/` as standalone components.
- `react-hook-form` adopted with Zod resolver.
- Zod schemas shared between frontend and backend via monorepo workspace package.
- Reusable field primitives (`<TextField>`, `<NumberField>`, `<DateField>`, `<SelectField>`, `<FileField>`, `<ToggleField>`, `<FieldArray>`).

**Exit Criteria:**
- Zero forms remain inlined in route components.
- 100% of forms use `react-hook-form` + Zod.
- Zod schemas are imported from the shared package (single source of truth).
- Field primitives are reused across all forms.

**Risks:**
- Schema sharing requires monorepo setup — mitigated by using Turborepo or Nx.
- Form behavior changes — mitigated by manual testing per form.

### 4.3 Phase 3: ERP Components & Design System (Weeks 7–9)

**Goal:** Build enterprise-grade ERP components and a design system.

**Deliverables:**
- Design tokens (color, spacing, typography, elevation, motion) defined in `src/design/tokens.ts`.
- ERP components: `<DataGrid>` (sort/filter/pin/export), `<MasterDetail>`, `<Wizard>`, `<AuditViewer>`, `<WorkflowStatus>`, `<TenantSwitcher>`, `<FilterBar>`, `<BulkActionBar>`.
- i18n framework (`next-intl`) adopted; all strings externalized.
- Dark mode enabled via tokens.

**Exit Criteria:**
- Design tokens are the single source of styling truth.
- All ERP components are reusable and documented (Storybook optional but recommended).
- 100% of user-visible strings are externalized.
- Dark mode works on all screens.

**Risks:**
- Component scope creep — mitigated by building only what the features need.
- i18n externalization is tedious — mitigated by codemods.

### 4.4 Phase 4: Testing, Type Safety & Hardening (Weeks 10–12)

**Goal:** Add test coverage, eliminate type-safety escape hatches, and harden accessibility.

**Deliverables:**
- Vitest + RTL frontend test suite (target 60%+ coverage on refactored components).
- Playwright E2E suite covering 5 canonical flows + compliance flows.
- 86 non-essential `as any` instances refactored to Zod-inferred types or proper interfaces.
- Backend statement coverage increased to 80%+.
- axe-core a11y audit completed; WCAG 2.1 AA issues remediated.

**Exit Criteria:**
- Frontend test coverage ≥ 60% on refactored components.
- Playwright E2E suite runs green on CI.
- `as any` count reduced from 286 to ≤ 200 (the remaining ~200 are Prisma/library interop, accepted).
- Backend statement coverage ≥ 80%.
- axe-core reports 0 critical a11y issues.

**Risks:**
- Test flakiness (E2E) — mitigated by retry logic and isolated test data.
- Type refactoring regressions — mitigated by running the existing 3,299-test backend suite after each change.

---

## 5. Recommendations

| Priority | Recommendation | Rationale |
|----------|---------------|-----------|
| P1 | Execute Phases 1–4 sequentially | Each phase's exit criteria gate the next |
| P1 | Freeze new frontend features during refactor | Prevents merge conflicts and scope creep |
| P1 | Run the 3,299-test backend suite after every frontend change | Catches accidental backend regressions |
| P2 | Set up Storybook for ERP components | Isolated component development + visual regression |
| P2 | Use codemods for mechanical refactors (e.g., i18n externalization) | Speeds up tedious work |
| P3 | Conduct a mid-refactor review (end of Phase 2) | Catches course deviations early |
| P3 | Update the user manual (TD-18) as each phase completes | Documentation stays current |

---

## 6. Conclusion

This refactoring plan provides a clear, sequenced path from the current frontend state (5.0/10) to an enterprise-grade, tested, accessible frontend (target 9.0+/10) over approximately 12 weeks. The backend requires only incremental improvements (type-safety, coverage) which can proceed in parallel.

The critical-path item is **RF-01 (decompose `page.tsx`)** — it unblocks the largest number of downstream items and should begin immediately.

**Verdict:** Refactoring plan approved for execution post-RC2.

---

*End of Report 16 — Refactoring Plan*

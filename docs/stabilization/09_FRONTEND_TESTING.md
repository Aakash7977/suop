# 09 — Frontend Testing Strategy Report

**Document ID:** STAB-09-FE-TESTING
**Author:** Stabilization Workstream
**Status:** Draft for Review
**Last Updated:** Current Cycle

---

## 1. Purpose

This report defines the frontend testing strategy, toolchain, coverage
targets, and integration with CI. It addresses the current gap: **no
frontend tests exist** despite a substantial refactoring effort.

## 2. Executive Summary

The frontend has zero tests. The backend, by contrast, has 3,299 passing
tests with 71% statement coverage. This asymmetry is the **single largest
quality risk** in the project. This report proposes a layered testing
strategy (unit, integration, accessibility, e2e) using Vitest, React
Testing Library, axe-core, and Playwright, with coverage gates and CI
integration.

## 3. Current State

| Surface | Tests | Coverage | Tooling |
| --- | --- | --- | --- |
| Backend | 3,299 | 71% / 81% / 77% | (existing) |
| Frontend unit | 0 | 0% | None configured |
| Frontend integration | 0 | 0% | None configured |
| Frontend e2e | 0 | 0% | None configured |
| Frontend a11y | 0 | 0% | None configured |
| Frontend visual | 0 | 0% | None configured |

## 4. Findings

### F-01 — No Test Runner Configured
Vitest, Jest, or any equivalent is not configured for the frontend. No
`vitest.config.ts`, no `setupTests.ts`, no test scripts in `package.json`.

### F-02 — No React Testing Library
RTL is not installed. Component testing is impossible without it.

### F-03 — No Playwright or E2E
No end-to-end test harness. Business flows cannot be validated
automatically.

### F-04 — No Accessibility Testing
`axe-core` or `@axe-core/playwright` not integrated.

### F-05 — No Visual Regression
No Storybook, no snapshot testing. Visual changes go undetected.

### F-06 — No Mock Service Worker
MSW is not installed. API integration tests have no HTTP mocking layer.

### F-07 — No Coverage Gate
No coverage threshold configured. Even if tests are added, there is no
gate against regression.

### F-08 — No CI Integration
Frontend tests are not in CI. Even if added locally, they would not run on
PRs.

### F-09 — No Test Data Fixtures
No factory or fixture layer for test data. Each test would improvise.

### F-10 — No Test ID Convention
No `data-testid` convention. Integration tests would rely on fragile
DOM selectors.

## 5. Proposed Testing Pyramid

```
            /\
           /e2\        Playwright (5%)
          /----\
         /  a11y\      axe-core (5%)
        /--------\
       /integration\   RTL + MSW (30%)
      /------------\
     /    unit     \   Vitest (60%)
    /----------------\
```

### 5.1 Unit Tests (60%)
- Pure functions, hooks, schemas, utils.
- Tool: Vitest.
- Target: 80% statement coverage on `src/features/*/utils/`,
  `src/features/*/schemas/`, `src/shared/`.

### 5.2 Integration Tests (30%)
- Component + API mocking.
- Tool: Vitest + RTL + MSW.
- Target: every enterprise component, every form primitive, every feature
  module page.

### 5.3 Accessibility Tests (5%)
- axe-core scan on rendered components and pages.
- Tool: `@axe-core/playwright` or `jest-axe`.
- Target: zero critical violations on P0 and P1 components.

### 5.4 E2E Tests (5%)
- Critical business flows across the application.
- Tool: Playwright.
- Target: one e2e per critical flow (see report 10).

## 6. Toolchain Selection

| Concern | Tool | Rationale |
| --- | --- | --- |
| Test runner | Vitest | Fast, Vite-native, Jest-compatible API |
| Component testing | React Testing Library | Industry standard |
| HTTP mocking | MSW | Service-worker based, framework-agnostic |
| E2E | Playwright | Cross-browser, fast, reliable |
| A11y | @axe-core/playwright | De-facto standard |
| Visual regression | Playwright snapshot | Avoids Storybook dependency |
| Coverage | c8 (via Vitest) | Vite-native |

## 7. Coverage Targets

| Surface | Statement | Branch | Function |
| --- | --- | --- | --- |
| Enterprise components | 80% | 75% | 80% |
| Form primitives | 90% | 85% | 90% |
| Feature module utils/schemas | 80% | 75% | 80% |
| Feature module pages | 60% | 55% | 60% |
| Shared | 90% | 85% | 90% |
| Overall frontend | 75% | 70% | 75% |

These targets are below the backend's 71/81/77 in some bands, reflecting
the relative immaturity of the frontend. Targets should be raised in
subsequent phases.

## 8. Test ID Convention

A `data-testid` convention is proposed:

```
data-testid="<module>.<view>.<element>"
```

Examples:
- `procurement.po-list.table`
- `procurement.po-list.row[<id>]`
- `procurement.po-detail.approve-button`
- `inventory.stock-adjust.form.submit`

A helper `testId(path)` ensures consistency.

## 9. Test Data Fixtures

A factory layer in `src/test/factories/`:
- `makeUser(overrides?)`
- `makePurchaseOrder(overrides?)`
- `makeInventoryItem(overrides?)`
- ... one per backend model the frontend touches.

Fixtures consume the backend's OpenAPI schema to ensure shape parity.

## 10. CI Integration

### 10.1 Pipeline Stages
1. **Lint** — ESLint, including boundary rules.
2. **Type check** — `tsc --noEmit`.
3. **Unit + integration** — Vitest with coverage gate.
4. **A11y** — axe-core on P0/P1 components.
5. **Build** — production build.
6. **E2E** — Playwright smoke (parallelized).

### 10.2 Coverage Gate
CI fails if coverage drops below the targets in section 7.

### 10.3 PR Requirements
- All tests green.
- Coverage delta non-negative.
- No new critical a11y violations.

## 11. Recommended Actions

1. **Install toolchain:** Vitest, RTL, MSW, Playwright, axe-core, c8.
2. **Create `vitest.config.ts`** with coverage thresholds.
3. **Create `setupTests.ts`** with RTL matchers, MSW server, axe setup.
4. **Write P0 component tests first** (5 components — see report 03).
5. **Write form primitive tests** (19 primitives).
6. **Write per-module integration tests** as modules are migrated.
7. **Write critical-flow e2e tests** (see report 10).
8. **Create fixture factories** for backend models.
9. **Integrate into CI** with coverage gate.
10. **Establish `data-testid` convention** across components.

## 12. Acceptance Criteria

- [ ] Vitest configured and running.
- [ ] RTL configured.
- [ ] MSW configured with mock handlers.
- [ ] Playwright configured with at least one smoke test.
- [ ] axe-core integrated.
- [ ] Coverage gate active in CI.
- [ ] All 5 P0 components have unit + a11y tests.
- [ ] All 19 form primitives have unit tests.
- [ ] At least one critical flow has an e2e test.
- [ ] Fixture factories for the 10 most-used backend models.

## 13. Risk Register

| ID | Risk | Impact |
| --- | --- | --- |
| TR1 | Regression undetected post-refactoring | High |
| TR2 | Coverage gate too low to be meaningful | Medium |
| TR3 | Flaky e2e tests slow CI | Medium |
| TR4 | Test data drift from backend contract | High |
| TR5 | Slow unit tests due to poor isolation | Medium |

## 14. Conclusion

The absence of frontend tests is the **single largest quality risk** in the
project. The strategy proposed here is pragmatic, layered, and aligned with
the backend's testing discipline. Establishing the harness is a
**prerequisite** to any further feature migration.

---

*End of report STAB-09-FE-TESTING.*

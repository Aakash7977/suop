# 07 — Feature Module Isolation Report

**Document ID:** STAB-07-MODULE-ISOLATION
**Author:** Stabilization Workstream
**Status:** Draft for Review
**Last Updated:** Current Cycle

---

## 1. Purpose

This report audits the isolation boundaries between the 11 feature modules
in `src/features/`. It assesses whether modules can be developed, tested,
and deployed independently, and identifies coupling that violates module
boundaries.

## 2. Executive Summary

The refactoring introduced 11 feature modules with a standardized internal
structure. Each module exports through an `index.ts` barrel file. However,
**no isolation enforcement** exists: there is no ESLint boundary rule, no
dependency graph check, and no per-module build. Modules can currently
import internals from each other freely, which will lead to coupling and
defeat the purpose of the modularization.

## 3. Module Inventory

| # | Module | Status | Notes |
| --- | --- | --- | --- |
| 1 | procurement | Placeholder | Standard structure present |
| 2 | inventory | Placeholder | Standard structure present |
| 3 | warehouse | Placeholder | Standard structure present |
| 4 | manufacturing | Placeholder | Standard structure present |
| 5 | quality | Placeholder | Standard structure present |
| 6 | finance | Placeholder | Standard structure present |
| 7 | crm | Placeholder | Standard structure present |
| 8 | hr | Placeholder | Standard structure present |
| 9 | analytics | Placeholder | Standard structure present |
| 10 | administration | Placeholder | Standard structure present |
| 11 | platform | Placeholder | Standard structure present |

All modules share the directory layout:
`components/ forms/ hooks/ schemas/ services/ tables/ dialogs/ drawers/
pages/ types/ utils/ index.ts`.

## 4. Isolation Principles

A well-isolated module must satisfy:

1. **Public API** — Only `index.ts` is importable from outside the module.
2. **No cross-module internal imports** — `features/procurement/forms/X`
   may not import `features/inventory/components/Y` directly.
3. **Shared dependencies** flow through `src/components/enterprise/` or
   `src/shared/`, not through peer feature modules.
4. **Type sharing** flows through `src/shared/types/` or
   `src/shared/contracts/`.
5. **No circular module dependencies** — `procurement` ↔ `inventory` is
   forbidden; if needed, a shared contract is introduced.

## 5. Findings

### F-01 — No ESLint Boundary Rule
No `eslint-plugin-boundaries` or equivalent is configured. Modules can
import each other's internals without lint failure.

### F-02 — No Public API Contract Documented
Each module's `index.ts` exports symbols, but there is no documentation of
which exports are part of the public API vs. accidentally exposed
internals.

### F-03 — API Client Location Mismatch
API clients live in `src/modules/*/api/client.ts` (14 modules), but the
feature modules live in `src/features/` (11 modules). The two directories
have **different module boundaries**, creating ambiguity about where
service code should live.

### F-04 — Shared Types Location
Shared types were created during refactoring, but it is unclear whether
modules import them from `src/shared/types/` or from their own `types/`
directory. Risk of duplication.

### F-05 — No Per-Module Build
There is no mechanism to build a single module in isolation. A broken
module can block the entire build.

### F-06 — No Per-Module Test Boundaries
Tests, once introduced, will not be scoped per module. A failing test in
one module will block CI for all modules.

### F-07 — No Lazy Loading Per Module
Modules are not lazy-loaded at the route level. The entire application
loads upfront, defeating the bundle-size benefit of modularization.

### F-08 — Module Cross-References in Legacy Code
`page.tsx.bak` contains cross-references between what are now separate
modules. During migration, care must be taken not to reintroduce these
couplings.

### F-09 — No Module Manifest
There is no `module.manifest.ts` declaring each module's:
- Public exports.
- Required permissions.
- Contributed routes.
- Contributed commands.
- Contributed nav items.

### F-10 — Mock Data Leakage Between Modules
`DashboardPage.tsx` contains mock data that spans multiple domains. This
mock data must be scoped per module to avoid coupling.

## 6. Proposed Module Manifest Contract

```ts
type ModuleManifest = {
  name: FeatureModuleName;
  version: string;
  publicApi: ExportSpec[];
  routes: RouteDef[];
  navItems: NavItem[];
  commands: Command[];
  permissions: Permission[];
  dependencies: FeatureModuleName[];   // declared deps on other modules
};
```

A `module.manifest.ts` per module would be the single source of truth for
its public surface.

## 7. Proposed Boundary Enforcement

### 7.1 ESLint Boundaries
Configure `eslint-plugin-boundaries` with rules:
- `features/*` modules may only import from:
  - their own internals,
  - `components/enterprise/*`,
  - `shared/*`,
  - declared dependencies in the manifest.

### 7.2 Dependency Graph Check
A pre-commit or CI check validates the dependency graph and fails on:
- Circular module dependencies.
- Undeclared inter-module imports.
- Imports of internals (bypassing `index.ts`).

### 7.3 Lazy Loading
Each module's root page is lazy-loaded at the route:
```ts
const ProcurementPage = lazy(() => import('@/features/procurement/pages'));
```

### 7.4 Per-Module Test Scope
Vitest projects (or workspaces) configured per module, with aggregated CI
reporting.

## 8. API Client Reconciliation

Two options:

**Option A — Relocate clients under features/**
Move `src/modules/*/api/client.ts` → `src/features/<module>/services/api.ts`.
Aligns client boundaries with feature boundaries.

**Option B — Keep clients separate, treat as services layer**
Keep `src/modules/` as a service-layer namespace, distinct from
`src/features/`. Document the boundary explicitly.

**Recommendation:** Option A. Aligning client boundaries with feature
boundaries reduces cognitive load and enforces isolation.

## 9. Module Dependency Map (Proposed)

Based on ERP domain semantics, allowed module dependencies:

| Module | May depend on |
| --- | --- |
| procurement | inventory, finance |
| inventory | warehouse |
| warehouse | inventory |
| manufacturing | inventory, procurement |
| quality | inventory, manufacturing |
| finance | procurement, crm |
| crm | (none) |
| hr | (none) |
| analytics | all (read-only) |
| administration | platform |
| platform | (none) |

Any deviation requires a documented shared contract in `src/shared/`.

## 10. Recommended Actions

1. **Add `eslint-plugin-boundaries`** with the rules described above.
2. **Define module manifests** (`module.manifest.ts` per module).
3. **Reconcile API clients** under `src/features/<module>/services/`.
4. **Add lazy loading** per module at the route layer.
5. **Configure per-module test workspaces** (see report 09).
6. **Document the public API** of each module in `index.ts` comments.
7. **Add a dependency graph check** to CI.

## 11. Acceptance Criteria

- [ ] ESLint boundary rules active and passing.
- [ ] Module manifests defined for all 11 modules.
- [ ] API clients relocated (or boundary explicitly documented).
- [ ] All module root pages lazy-loaded.
- [ ] Per-module test workspaces configured.
- [ ] Dependency graph check in CI.
- [ ] Zero circular module dependencies.

## 12. Risk Register

| ID | Risk | Impact |
| --- | --- | --- |
| MR1 | Hidden cross-module coupling | High |
| MR2 | Bundle bloat (no lazy loading) | Medium |
| MR3 | Module boundary erosion over time | High |
| MR4 | Build breakage cascade | Medium |
| MR5 | Inconsistent service-layer location | Medium |

## 13. Conclusion

Module isolation is **declared but not enforced**. Without boundary rules,
manifests, and per-module build/test scope, the 11 modules will silently
couple and the modularization benefit will erode. Stabilization requires
enforcement tooling to be in place before feature content is migrated.

---

*End of report STAB-07-MODULE-ISOLATION.*

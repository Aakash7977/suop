# 05 — Navigation Audit Report

**Document ID:** STAB-05-NAV-AUDIT
**Author:** Stabilization Workstream
**Status:** Draft for Review
**Last Updated:** Current Cycle

---

## 1. Purpose

This report audits the navigation architecture of the refactored frontend:
route definitions, sidebar navigation, breadcrumbs, command palette, and
global search. It identifies gaps in route coverage, RBAC enforcement at
navigation boundaries, and accessibility of navigation surfaces.

## 2. Executive Summary

The refactored `page.tsx` (387 lines) serves as a routing and composition
root. Navigation components (`SidebarNavigation`, `BreadcrumbNav`,
`CommandPalette`, `GlobalSearch`) exist in the enterprise component set.
However, route definitions and navigation config are **not centrally
declared**, RBAC is not enforced at the navigation layer, and there is no
single source of truth for the application's route map. This is a
**blocking gap** for any role-based access verification.

## 3. Navigation Surfaces

The application exposes four navigation surfaces:

1. **Primary navigation** — `SidebarNavigation` component.
2. **Breadcrumbs** — `BreadcrumbNav` component.
3. **Command palette** — `CommandPalette` (Cmd+K).
4. **Global search** — `GlobalSearch`.

A fifth surface — **in-page navigation** — is provided by `EnterpriseTabs`
and `PageHeader` action slots.

## 4. Findings

### F-01 — No Central Route Registry
Routes are not declared in a single registry. There is no `routes.ts` or
equivalent that maps a route path to a feature module, required permission,
and breadcrumb label. This makes RBAC enforcement and breadcrumb generation
impossible to centralize.

### F-02 — Navigation Config Exists but Not Bound
A shared navigation config was created during refactoring, but it has not
been verified to drive `SidebarNavigation`. There is risk of drift between
the config and the actual sidebar.

### F-03 — RBAC Not Enforced at Navigation Boundary
The backend defines **54 permissions** and a complete RBAC model. The
frontend does not yet enforce these at route entry or sidebar visibility.
See report 08 for the full RBAC audit.

### F-04 — Breadcrumbs Are Manual
`BreadcrumbNav` appears to be driven by manual props rather than a route
registry. This leads to inconsistent breadcrumbs across modules.

### F-05 — Command Palette Index Not Defined
`CommandPalette` exists but no contract defines how commands are
registered. Each feature module should be able to contribute commands.

### F-06 — Global Search Index Not Defined
`GlobalSearch` exists but no contract defines the indexed entities, search
provider, or result ranking. Backend has 56 modules and 360 Prisma models;
search surface must be explicitly scoped.

### F-07 — Deep Linking Untested
Deep links to specific records (e.g. `/procurement/po/123`) have not been
verified across all 11 feature modules.

### F-08 — No 404 / NotFound Standard
No standard `NotFound` page or fallback route is defined at the routing
layer.

### F-09 — No Loading Boundary on Route Transitions
Route transitions do not show a standardized loading boundary. Slow
transitions appear unresponsive.

### F-10 — Mobile Navigation Undefined
`SidebarNavigation` does not define a mobile variant (drawer, bottom nav).
Responsive navigation behavior is undefined.

## 5. Proposed Route Registry Contract

A central route registry should be established:

```ts
type RouteDef = {
  path: string;                       // e.g. "/procurement/po/:id"
  module: FeatureModule;              // procurement | inventory | ...
  page: React.LazyExoticComponent<...>;
  permissions: Permission[];          // required permissions
  breadcrumb: (params) => Crumb[];    // dynamic breadcrumb
  sidebar?: {
    label: string;
    icon: IconName;
    section: string;
  };
  commands?: Command[];               // command palette entries
};
```

A single `routes.registry.ts` would export `RouteDef[]` consumed by:
- The router (route table).
- `SidebarNavigation` (visibility filter by permissions).
- `BreadcrumbNav` (crumb resolution).
- `CommandPalette` (command index).
- `GlobalSearch` (entity scoping).

## 6. Sidebar Topology Proposal

Based on the 11 feature modules, the sidebar should expose the following
sections:

| Section | Modules |
| --- | --- |
| Operations | procurement, inventory, warehouse, manufacturing, quality |
| Commercial | crm, finance |
| People | hr |
| Insights | analytics |
| Admin | administration |
| Platform | platform |

Each section expands to reveal module entries, and each module may reveal
sub-pages. Visibility is filtered by the viewer's permissions.

## 7. Compliance Matrix

| Surface | Centralized | RBAC-bound | Documented | Tested |
| --- | --- | --- | --- | --- |
| SidebarNavigation | No | No | No | No |
| BreadcrumbNav | No | N/A | No | No |
| CommandPalette | No | No | No | No |
| GlobalSearch | No | No | No | No |
| Route table | No | No | No | No |

All surfaces return **No** across all columns.

## 8. Recommended Actions

1. **Establish a route registry** (`routes.registry.ts`) as the single
   source of truth.
2. **Bind `SidebarNavigation`** to the registry, with permission-based
   filtering.
3. **Bind `BreadcrumbNav`** to the registry for dynamic crumb resolution.
4. **Define a command registration contract** for `CommandPalette`.
5. **Define an entity index contract** for `GlobalSearch`, scoped to
   allowed modules per role.
6. **Add a `NotFound` standard** at the routing layer.
7. **Add a route-transition loading boundary.**
8. **Define a mobile navigation variant** (drawer-based).

## 9. Acceptance Criteria

- [ ] Single route registry exists and is consumed by all 4 surfaces.
- [ ] Sidebar items filter by viewer permissions.
- [ ] Breadcrumbs auto-resolve from route registry.
- [ ] Command palette accepts contributions from feature modules.
- [ ] Global search scoped by role and module.
- [ ] Standard `NotFound` page present.
- [ ] Loading boundary on route transitions.
- [ ] Mobile navigation variant defined.

## 10. Risk Register

| ID | Risk | Impact |
| --- | --- | --- |
| NR1 | Unauthorized route access via direct URL | Critical |
| NR2 | Inconsistent breadcrumbs | Medium |
| NR3 | Search surface leaks unauthorized data | Critical |
| NR4 | Command palette executes unauthorized actions | High |
| NR5 | Mobile navigation unusable | Medium |

## 11. Open Questions

- Should the route registry be generated from backend OpenAPI spec, or
  hand-maintained?
- How should command palette contributions be tree-shaken when a module is
  not authorized for the user?

## 12. Conclusion

Navigation is the **primary RBAC enforcement surface** on the frontend.
Without a central route registry and permission-bound navigation, the
frontend cannot be considered secure. The 54 backend permissions have no
frontend counterpart today. This is a **blocking stabilization item**.

---

*End of report STAB-05-NAV-AUDIT.*

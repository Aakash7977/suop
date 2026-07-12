# 08 — RBAC Audit Report

**Document ID:** STAB-08-RBAC-AUDIT
**Author:** Stabilization Workstream
**Status:** Draft for Review
**Last Updated:** Current Cycle

---

## 1. Purpose

This report audits the role-based access control (RBAC) implementation on
the frontend. It compares the backend RBAC model (frozen, complete) against
the frontend enforcement gap, and defines the work required to bring the
frontend to parity.

## 2. Executive Summary

The backend defines a complete RBAC model: **54 permissions**, role
definitions, and enforcement across 656 API endpoints. The frontend
currently **does not enforce RBAC** at any layer — not at routes, not at
navigation, not at component visibility, not at action buttons. This is a
**critical security gap** that blocks any production release.

## 3. Backend RBAC Baseline (Frozen)

| Metric | Value |
| --- | --- |
| Permissions defined | 54 |
| API endpoints with RBAC | 656 |
| Workflows with RBAC | 38 |
| Backend RBAC tests | Passing (part of 3,299) |
| OWASP rating | 9.1/10 |
| RC2 certified | 8.9/10 |

The backend is the source of truth. The frontend must mirror its permission
model.

## 4. Frontend RBAC Current State

### 4.1 Auth Store
The frontend uses `useAuthStore` for auth state. The store holds the
authenticated user, token, and (presumably) role/permission claims.

### 4.2 Enforcement Points
| Surface | Enforcement Status |
| --- | --- |
| Route entry | **None** |
| Sidebar visibility | **None** |
| Component render | **None** |
| Button / action visibility | **None** |
| Command palette | **None** |
| Global search scope | **None** |
| API call guard | Backend only |

### 4.3 RBAC Utility Layer
No `hasPermission(perm)`, `usePermissions()`, or `<Can>` component exists.
There is no frontend abstraction over the 54 backend permissions.

## 5. Findings

### F-01 — No Frontend Permission Catalog
The 54 backend permissions are not mirrored in a frontend catalog.
Permissions are likely referenced as raw strings, risking typos and drift.

### F-02 — No Route Guards
Routes do not declare required permissions and are not guarded. A user can
navigate directly to any URL.

### F-03 — No Sidebar Filtering
Sidebar items are not filtered by permission. Users see all navigation
entries regardless of role.

### F-04 — No Component-Level Guards
There is no `<Can permission="po.approve">` or equivalent. Action buttons
(e.g. "Approve", "Delete", "Post") render unconditionally.

### F-05 — No API Response 403 Handling
Frontend API clients may not gracefully handle 403 responses from the
backend. A 403 may surface as a generic error rather than a permission
denial message.

### F-06 — No Token Refresh / Expiry Strategy
The auth store holds tokens, but there is no documented refresh or expiry
strategy. Sessions may silently fail.

### F-07 — No Audit Logging of Denied Actions
Denied permission checks are not logged. The backend audit log captures
server-side denials, but client-side attempts are invisible.

### F-08 — No Role-Based Command Palette Filtering
`CommandPalette` does not filter commands by permission. Unauthorized
commands are visible (even if they fail on execution).

### F-09 — No Global Search Permission Scoping
`GlobalSearch` does not scope results by the viewer's permissions. Search
may surface unauthorized entities, even if detail pages are guarded.

### F-10 — No RBAC Tests on Frontend
There are no tests verifying that unauthorized users cannot access
protected routes or actions.

## 6. Proposed Frontend RBAC Layer

### 6.1 Permission Catalog
A single `src/shared/permissions/catalog.ts` mirrors the 54 backend
permissions as a typed enum:

```ts
export const Permission = {
  PO_VIEW: 'po.view',
  PO_CREATE: 'po.create',
  PO_APPROVE: 'po.approve',
  // ... 54 total
} as const;
```

Generated from the backend OpenAPI spec to prevent drift.

### 6.2 Hooks
```ts
const { has, hasAny, hasAll } = usePermissions();
const canApprove = has(Permission.PO_APPROVE);
```

### 6.3 Component
```tsx
<Can permission={Permission.PO_APPROVE}>
  <Button onClick={approve}>Approve</Button>
</Can>
```

### 6.4 Route Guard
Route definitions declare required permissions (see report 05):
```ts
{ path: '/procurement/po/approve', permissions: [Permission.PO_APPROVE], ... }
```
A `<RouteGuard>` wrapper enforces at navigation time.

### 6.5 Sidebar Filter
`SidebarNavigation` filters entries by `usePermissions()`.

### 6.6 API 403 Handler
A central API client interceptor:
- Detects 403.
- Shows a permission-denied toast.
- Optionally logs to audit.

### 6.7 Command Palette Filter
`CommandPalette` filters commands by permission before rendering.

### 6.8 Global Search Scoping
`GlobalSearch` server-side scoping relies on backend; client-side filters
results by permission for display.

## 7. Permission Coverage Matrix (Excerpt)

A representative subset of the 54 permissions and their planned frontend
enforcement:

| Permission | Route | Sidebar | Button | Cmd Palette |
| --- | --- | --- | --- | --- |
| `po.view` | Yes | Yes | N/A | Yes |
| `po.create` | Yes | Yes | Yes | Yes |
| `po.approve` | Yes | No | Yes | Yes |
| `inventory.view` | Yes | Yes | N/A | Yes |
| `inventory.adjust` | Yes | No | Yes | Yes |
| `finance.gl.view` | Yes | Yes | N/A | Yes |
| `finance.gl.post` | Yes | No | Yes | Yes |
| `hr.employee.view` | Yes | Yes | N/A | Yes |
| `admin.user.manage` | Yes | Yes | Yes | Yes |

The full matrix will cover all 54 permissions × 4 enforcement surfaces =
216 cells.

## 8. Recommended Actions

1. **Generate the permission catalog** from backend OpenAPI.
2. **Implement `usePermissions` hook** and `<Can>` component.
3. **Add route guards** consuming the route registry permissions.
4. **Filter sidebar** by permissions.
5. **Wrap all action buttons** with `<Can>`.
6. **Add 403 interceptor** on the API client.
7. **Filter command palette** and **scope global search**.
8. **Add RBAC tests** (see report 09) for unauthorized access.
9. **Log client-side denials** to the audit log via a backend endpoint.

## 9. Acceptance Criteria

- [ ] Permission catalog generated and matches backend (54 permissions).
- [ ] `usePermissions` and `<Can>` available and used.
- [ ] All routes guarded by required permissions.
- [ ] Sidebar items filtered by viewer permissions.
- [ ] All action buttons wrapped with `<Can>`.
- [ ] 403 responses handled with a permission-denied UX.
- [ ] Command palette filtered by permission.
- [ ] Global search scoped by permission.
- [ ] RBAC tests cover all 54 permissions × 4 surfaces.

## 10. Risk Register

| ID | Risk | Impact |
| --- | --- | --- |
| RR1 | Unauthorized route access via direct URL | Critical |
| RR2 | Unauthorized action button visible | High |
| RR3 | Permission string drift backend ↔ frontend | High |
| RR4 | 403 surfacing as generic error | Medium |
| RR5 | Client-side denial bypass (no audit) | Medium |
| RR6 | Token expiry silently fails | High |

## 11. Open Questions

- Should the frontend permission catalog be auto-generated from backend
  OpenAPI, or hand-maintained?
- Should client-side denials be logged to the audit trail, given they may
  be spoofable?
- What is the UX for an unauthorized deep link — redirect to a "no access"
  page, or to login?

## 12. Conclusion

The frontend has **zero RBAC enforcement** today. The backend model is
complete and frozen. Bringing the frontend to parity is a **critical,
non-negotiable** stabilization item that must be completed before any
production deployment. This is the single highest-priority workstream in
the stabilization phase.

---

*End of report STAB-08-RBAC-AUDIT.*

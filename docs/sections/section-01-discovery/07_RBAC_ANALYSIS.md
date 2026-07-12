# 07 — RBAC Analysis: Login + Dashboard + Organization

**Scope**: Roles, permissions, permission checks, and enforcement gaps across the section.
**Frameworks**: `apps/backend/src/core/permissions/registry.ts`, `apps/backend/src/middleware/rbac.ts`, `apps/backend/src/middleware/auth.ts`.

---

## 1. Permission Catalogue (in scope)

| Permission code | Module | Granted to | Purpose |
|---|---|---|---|
| `AUTH_MANAGE_USERS` | Auth | Enterprise Admin, Helpdesk | Invite, lock, unlock, archive users |
| `AUTH_MANAGE_ROLES` | Auth | Enterprise Admin | Create/update/clone roles, assign/revoke |
| `AUTH_RESET_PASSWORD` | Auth | Helpdesk | Trigger password reset flow |
| `ORG_READ` | Organization | All authenticated (read-only) | List/get companies, plants, warehouses, hierarchy |
| `ORG_CREATE` | Organization | Enterprise Admin, Ops Admin | Create companies, plants, warehouses |
| `ORG_UPDATE` | Organization | Enterprise Admin, Ops Admin | Update entities, run transitions, restore |
| `ORG_DELETE` | Organization | Enterprise Admin only | Soft-delete, hard-delete |

---

## 2. Enforcement Layers

### 2.1 Backend enforcement (strong)

```
Request
  │
  ▼
auth.ts middleware        ── verifies JWT, sets req.user
  │
  ▼
tenant.ts middleware      ── injects tenant_id from JWT claim
  │
  ▼
rbac.ts middleware        ── checks req.user.permissions against route requirement
  │  (throws 403 if missing)
  ▼
route handler             ── business logic
  │
  ▼
audit.ts middleware       ── logs the action
```

- Permissions are encoded as a flat string list in the JWT `permissions` claim.
- `rbac.ts` uses `requirePermission('ORG_CREATE')` declaratively per route.
- The registry in `core/permissions/registry.ts` is the source of truth for permission codes.

### 2.2 Frontend enforcement (absent)

Within this section:

- No permission check on the Dashboard stat cards. Any authenticated user sees "Products", "Roles", "Branches", "Compliance" and can click into them.
- No permission check on the Organization module. Any authenticated user sees the (hardcoded) tree.
- No permission check on the "Add Entity" button (which is dead anyway).
- No permission check on the Sign Out button (correct — sign-out is universal).
- No conditional rendering based on `user.permissions`.

The frontend reads `user` from `useAuthStore` but never inspects `user.permissions`. The `org-context-store` similarly has no permission awareness.

---

## 3. Permission-to-UI Mapping

| UI element | Required permission | Backend enforcement | Frontend enforcement | Gap |
|---|---|---|---|---|
| Login screen | Public | n/a | n/a | None |
| Sign In button | Public | n/a | n/a | None |
| Demo Mode button | Public | n/a | n/a | None |
| Sign Out button | Authenticated | Yes | Implicit (only shown when authenticated) | None |
| Dashboard view | Authenticated | n/a | n/a | None |
| Dashboard "Products" card | `PRODUCT_READ` (other section) | Yes (in product routes) | No — card visible to all | Medium |
| Dashboard "Roles" card | `AUTH_MANAGE_ROLES` | Yes (in user-mgmt routes) | No — card visible to all | Medium |
| Dashboard "Branches" card | `ORG_READ` | Yes (in org routes) | No — card visible to all | Low |
| Dashboard "Compliance" card | (new permission needed) | TBD | No | Medium |
| Organization module view | `ORG_READ` | Yes (org routes) | No — module visible to all | Medium |
| Org tree expand/collapse | `ORG_READ` | n/a | n/a | None |
| Org stat cards | `ORG_READ` | Yes | No | Low |
| "Add Entity" button | `ORG_CREATE` | Yes (would be enforced if wired) | No | High |
| Tree node selection | `ORG_READ` | n/a | n/a | None |
| Future: company edit form | `ORG_UPDATE` | Yes | Not implemented | High |
| Future: transition button | `ORG_UPDATE` | Yes | Not implemented | High |
| Future: delete button | `ORG_DELETE` | Yes | Not implemented | High |
| Future: restore button | `ORG_UPDATE` | Yes | Not implemented | High |

---

## 4. Role Definitions (target)

The system supports arbitrary roles via `roleService`. Recommended baseline roles for this section:

| Role | Permissions granted | Persona |
|---|---|---|
| `enterprise_admin` | `ORG_*`, `AUTH_MANAGE_USERS`, `AUTH_MANAGE_ROLES`, `AUTH_RESET_PASSWORD` | Priya |
| `ops_admin` | `ORG_READ`, `ORG_CREATE`, `ORG_UPDATE` | Plant onboarding team |
| `plant_manager` | `ORG_READ` + module-specific | Rahul |
| `auditor` | `ORG_READ` + audit read | Meena |
| `operator` | (module-specific only) | Suresh |
| `helpdesk` | `AUTH_MANAGE_USERS`, `AUTH_RESET_PASSWORD` | L1 support |

### 4.1 Frontend behaviour per role

| Role | Dashboard sees | Organization sees |
|---|---|---|
| `enterprise_admin` | All 4 cards + admin widgets | Tree + CRUD + transitions + restore + hard-delete |
| `ops_admin` | All 4 cards | Tree + CRUD + transitions + restore (no hard-delete) |
| `plant_manager` | Branches card only | Tree (read-only) + filter to his plant |
| `auditor` | All 4 cards (read-only) | Tree (read-only) + audit timeline |
| `operator` | Branches card hidden; only his module cards | Organization hidden |
| `helpdesk` | Roles card only | Organization hidden |

Today, none of this conditional rendering exists. Every authenticated user sees every card and the full organisation module.

---

## 5. Permission Source of Truth

```
roleService.create({ code, permissions: [...] })
   │
   ▼
role table + role_permissions join
   │
   ▼
userService.assignRole(userId, roleId)
   │
   ▼
user_roles table
   │
   ▼
on login: authService.login() builds JWT with permissions claim
   │  (union of all roles' permissions)
   ▼
JWT payload: { sub, tenant_id, roles: [...], permissions: [...] }
   │
   ▼
useAuthStore.user.permissions  ──▶  available in every component
   │
   ▼
UNUSED in this section's UI
```

The plumbing is complete end-to-end; the only missing piece is the consumer in `DashboardModule` and `OrganizationModule`.

---

## 6. Permission Helper Recommendation

Introduce a small helper to standardise permission checks in the frontend:

```ts
// src/lib/auth/has-permission.ts
export function hasPermission(
  user: { permissions?: string[] } | null | undefined,
  code: string | string[]
): boolean {
  if (!user?.permissions) return false;
  const required = Array.isArray(code) ? code : [code];
  return required.every((c) => user.permissions!.includes(c));
}

// Usage in components
{hasPermission(user, 'ORG_CREATE') && <Button>Add Entity</Button>}
```

This helper should be used:

- In the Sidebar to hide unavailable modules (the Sidebar already has an `available` boolean per item, but it is hardcoded, not permission-driven).
- In the Dashboard to hide cards the user cannot act on.
- In the Organization module to gate CRUD buttons.
- In every future detail panel to gate transition buttons.

---

## 7. Tenant Isolation

Although not strictly RBAC, tenant isolation is enforced alongside RBAC:

- Every JWT carries a `tenant_id` claim.
- `tenant.ts` middleware injects `req.tenantId`.
- All repository queries (Prisma extension + raw SQL) auto-filter by `tenant_id`.
- Cross-tenant access requires `SUPER_ADMIN` permission, which is not granted to any UI role.

**Frontend gap**: the UI does not display the current tenant name anywhere in this section. A user invited to multiple tenants cannot tell at a glance which tenant he is operating in. Recommendation: show `tenant.name` in the Header next to the user avatar.

---

## 8. RBAC Test Scenarios

| # | Scenario | Setup | Expected |
|---|---|---|---|
| R-1 | Operator cannot create company | User with only `PRODUCT_READ`; call `POST /organization/companies` | 403 Forbidden |
| R-2 | Ops admin can create but not hard-delete | User with `ORG_CREATE`, `ORG_UPDATE`; call hard-delete | 403 Forbidden |
| R-3 | Enterprise admin full access | User with all `ORG_*`; call any org endpoint | 200 / 201 |
| R-4 | Auditor read-only | User with `ORG_READ`; call `POST` | 403 |
| R-5 | Expired token | JWT exp in the past | 401, refresh attempted |
| R-6 | Wrong tenant | JWT tenant_id ≠ row tenant_id | 404 (row not visible) |
| R-7 | Missing permission claim | JWT with empty permissions | 403 on protected routes |
| R-8 | Demo mode | `isDemoMode = true`; permissions simulated | Read-only across the section |

---

## 9. RBAC Risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| RB-1 | Frontend shows buttons the user cannot use → frustrating 403s | High | Use `hasPermission` to hide |
| RB-2 | No tenant indicator → user may act in wrong tenant | High | Show tenant name in Header |
| RB-3 | Demo mode grants full permissions silently | Medium | Show demo badge (already done) + restrict writes |
| RB-4 | No audit on permission grant/revoke | Medium | Wrap `assignRole` / `revokeRole` in audit |
| RB-5 | JWT permissions claim cached past role change | Medium | Short access-token TTL + refresh on role change |
| RB-6 | No UI to view own permissions | Low | Add "My Permissions" panel |
| RB-7 | Sidebar `available` flag hardcoded | Medium | Drive from `hasPermission` |
| RB-8 | No mass-role-assignment UI | Low | Add bulk assign in user management |

---

## 10. Compliance Mapping

| Control | Implementation | Status |
|---|---|---|
| Least privilege | Flat permission list, role-based assignment | ✅ Backend; ❌ Frontend |
| Separation of duties | `ORG_DELETE` separated from `ORG_UPDATE` | ✅ Backend; ❌ Frontend |
| Audit of privilege changes | `auditService.log` on role assign/revoke | ⚠️ Partial — verify coverage |
| Periodic access review | No UI to export role assignments | ❌ Missing |
| MFA | Not in scope of this section | ❌ Future |
| Password policy | Argon2id + history + lockout | ✅ Backend; ❌ No change-password UI |

---

## 11. Conclusion

The backend RBAC infrastructure is production-grade: declarative per-route permission checks, a central registry, JWT-carried permissions, and tenant isolation. The frontend is RBAC-blind: it renders every card, every module, and (once wired) would render every button regardless of the user's permissions. The fix is small — a `hasPermission` helper plus conditional rendering — but it must be applied before the section ships to production, otherwise users will hit 403 errors after clicking visible buttons, and auditors will flag the lack of least-privilege enforcement in the UI.

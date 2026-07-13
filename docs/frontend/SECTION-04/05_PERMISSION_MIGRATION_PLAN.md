# 05 — Permission Migration Plan (FINAL)

**Date**: 2026-07-13
**Status**: FINAL

---

## 1. Migration Overview

| Metric | Value |
|---|---|
| Old permissions | 38 (many proxy) |
| New permissions | ~329 (domain-specific, with view/read split, override, delegation, scope) |
| Old roles | 6 |
| New roles | 14 (6 revised + 6 new + 1 break_glass + 1 hr_manager) |
| Route files to update | ~30 |
| Registry file | 1 (`core/permissions/registry.ts`) |
| Estimated effort | 16 hours |
| Risk | LOW — backward compatible via aliases |

---

## 2. Migration Steps

### Step 1: Rewrite Permission Registry (3 hours)
1. Replace `Permission` enum with ~329 domain-specific permissions
2. Add backward compatibility aliases for old permission names
3. Define 14 roles with SoD-compliant permission sets
4. Add `DataScope` enum and scope resolution logic
5. Add `BreakGlassSession` type and activation logic
6. Add delegation tracking types
7. Keep `PermissionChecker` class, extend with scope awareness

### Step 2: Add Data Scope Infrastructure (1 hour)
1. Add `dataScope` field to user profile (stored in JWT claims)
2. Add scope resolution middleware (resolves scope from user's role + assignment)
3. Add scope check in `requirePermission()` middleware
4. Update `getRequestContext()` to include resolved scope

### Step 3: Update Route Files (10 hours)
For each of ~30 route files:
1. Replace proxy permissions with domain-specific permissions
2. Add `view` vs `read` distinction (GET /list → `read`, GET /summary → `view`)
3. Add `approve`/`release`/`post` where workflow transitions exist
4. Add `archive`/`restore`/`close`/`reopen` where applicable
5. Add `override` where business rules can be overridden
6. Add scope suffixes where applicable

### Step 4: Update Default Roles (1 hour)
1. Revise existing 6 roles (remove customer write from quality/procurement, add domain permissions)
2. Add 6 new roles (sales_officer, sales_manager, warehouse_supervisor, finance_accountant, finance_manager, manufacturing_supervisor)
3. Add break_glass role (read + configure only, no post/approve/delete/override)
4. Add hr_manager role
5. Add conflict detection (prevent assigning conflicting roles)

### Step 5: Add Break Glass Infrastructure (0.5 hour)
1. Add `break_glass_sessions` table (id, user_id, reason, activated_at, expires_at, revoked_at, revoked_by)
2. Add break glass activation endpoint (POST /api/v1/auth/break-glass)
3. Add auto-revocation cron job
4. Add security officer notification

### Step 6: Add Delegation Infrastructure (0.5 hour)
1. Add `delegations` table (id, delegator_id, delegate_id, domain, starts_at, ends_at, revoked_at)
2. Add delegation CRUD endpoints
3. Add `approve:as-delegate` check in service layer

### Step 7: Verify Builds (30 min)
1. Backend: `cd apps/backend && bun run build`
2. Frontend: `npx next build`
3. Tests: `cd apps/backend && bun test`

### Step 8: Remove Backward Compat Aliases (after all verified)
Delete alias constants from registry.ts

---

## 3. Backward Compatibility

During migration, old permission names aliased to new:
```typescript
// Temporary aliases
export const AUDIT_READ = Permission.AUDIT_READ
export const INVENTORY_POST = Permission.INVENTORY_STOCKIN
export const IQC_INSPECT = Permission.QUALITY_INSPECT
export const GRN_PUTAWAY = Permission.PUTAWAY_CREATE
// ... etc
```

After all routes updated, aliases removed.

---

## 4. Quality Gates

| Gate | Criteria |
|---|---|
| No proxy permissions | Zero AUDIT_READ/ORG_*/CUSTOMER_*/PRODUCT_* used as proxy |
| VIEW/READ separated | Every domain has both `*:view` and `*:read` |
| APPROVE/RELEASE/POST separated | Every workflow has distinct approve, release, post |
| CLOSE/ARCHIVE/RESTORE added | Every entity has archive/restore (no hard delete except admin) |
| OVERRIDE added | Critical domains have `*:override` (pricing, inventory, quality, costing, shipment) |
| CONFIGURE split | No bare `configure` — split into settings/workflow/master/templates/numbering/notifications/approval-rules |
| DATA SCOPE | Every role has defined default scope |
| DELEGATION | 6 domains have delegation permissions (SO, PR, PO, GL, leave, attendance) |
| Break Glass | Read + configure only, time-limited, audited |
| SoD enforced | 27 SoD rules — no role has conflicting create+approve |
| Backend build passes | `bun run build` succeeds |
| Frontend build passes | `npx next build` succeeds |

---

**END OF PERMISSION MIGRATION PLAN (FINAL)**

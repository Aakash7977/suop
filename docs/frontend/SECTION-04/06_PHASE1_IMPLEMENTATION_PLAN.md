# 06 — Phase 1 Implementation Plan (FINAL)

**Date**: 2026-07-13
**Status**: FINAL (pending approval)

---

## 1. Objective

Implement the approved enterprise permission architecture:
- Replace 38 proxy permissions with ~329 domain-specific permissions
- Add 14 roles (6 revised + 6 new + break_glass + hr_manager)
- Add 22 standard actions (view, read, create, update, delete, close, archive, restore, approve, reject, release, post, cancel, reopen, reverse, override, export, import, print, delegate, approve:as-delegate, audit)
- Add 7 configuration actions (settings, workflow, master, templates, numbering, notifications, approval-rules)
- Add 8 data scope levels (own, dept, wh, plant, company, bu, region, global)
- Add delegation infrastructure
- Add break glass emergency access
- Enforce 27 Separation of Duties rules
- Update ~30 route files

## 2. Implementation Steps (16 hours total)

### Step 1: Rewrite Permission Registry (3 hours)
**File**: `apps/backend/src/core/permissions/registry.ts`
- Write ~329 permission constants grouped by domain
- Add backward compat aliases
- Define 14 roles with SoD-compliant permission sets
- Add `DataScope` enum
- Extend `PermissionChecker` with scope awareness
- Add `BreakGlassSession` type
- Add `Delegation` type

### Step 2: Add Data Scope Infrastructure (1 hour)
**Files**: middleware, context, JWT
- Add `dataScope` to JWT claims
- Add scope resolution middleware
- Update `requirePermission()` to check scope
- Update `getRequestContext()` to include resolved scope

### Step 3: Update Route Files (10 hours)
**Files**: ~30 route files across all backend modules
- Replace all proxy permissions with domain-specific permissions
- Add view/read separation
- Add approve/release/post separation
- Add archive/restore/close/reopen where applicable
- Add override where business rules can be overridden
- Add scope suffixes where applicable

### Step 4: Update Default Roles (1 hour)
**File**: `apps/backend/src/core/permissions/registry.ts`
- Revise 6 existing roles
- Add 8 new roles (sales_officer, sales_manager, warehouse_supervisor, finance_accountant, finance_manager, manufacturing_supervisor, break_glass, hr_manager)
- Add role conflict detection logic

### Step 5: Add Break Glass Infrastructure (0.5 hour)
**Files**: new table, new endpoint, cron job
- Add `break_glass_sessions` Prisma model
- Add POST /api/v1/auth/break-glass endpoint
- Add auto-revocation timer
- Add security officer notification

### Step 6: Add Delegation Infrastructure (0.5 hour)
**Files**: new table, new endpoints
- Add `delegations` Prisma model
- Add delegation CRUD endpoints (POST /api/v1/admin/delegations)
- Add `approve:as-delegate` check in service layer

### Step 7: Verify (30 min)
1. Backend build: `cd apps/backend && bun run build`
2. Frontend build: `npx next build`
3. Backend tests: `cd apps/backend && bun test`
4. Verify no proxy: `grep -r "AUDIT_READ\|ORG_READ.*proxy" apps/backend/src/modules/*/routes/`
5. Verify SoD: manual review of role definitions

## 3. Quality Gates

| # | Gate | Criteria | Verification |
|---|---|---|---|
| 1 | No proxy permissions | Zero AUDIT_READ/ORG_*/CUSTOMER_*/PRODUCT_* as proxy | grep across all route files |
| 2 | VIEW/READ separated | Every domain has both `*:view` and `*:read` | grep for `:view` and `:read` |
| 3 | APPROVE/RELEASE/POST separated | Workflow modules have distinct permissions | grep for `:approve`, `:release`, `:post` |
| 4 | CLOSE/ARCHIVE/RESTORE | Entities have archive/restore (no hard delete) | grep for `:archive`, `:restore` |
| 5 | OVERRIDE permissions | Critical domains have `*:override` | grep for `:override` |
| 6 | CONFIGURE split | No bare `configure` — split into 7 specialized | grep for `:settings`, `:workflow`, etc. |
| 7 | DATA SCOPE model | Every role has defined default scope | Review role definitions |
| 8 | DELEGATION | 6 domains have delegation permissions | grep for `:delegate`, `:approve:as-delegate` |
| 9 | Break Glass | Read + configure only, time-limited, audited | Review break_glass role |
| 10 | SoD enforced | 27 SoD rules — no role has conflicting create+approve | Manual review |
| 11 | All permissions in registry | Every route permission exists in Permission enum | TypeScript compilation |
| 12 | Backend build passes | `bun run build` succeeds | Build command |
| 13 | Frontend build passes | `npx next build` succeeds | Build command |
| 14 | Backend tests pass | All existing tests pass | `bun test` |
| 15 | No broken imports | All `Permission.*` references resolve | TypeScript compilation |

## 4. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Route file uses permission not in registry | Medium | Build fails | TypeScript catches at compile time |
| Role missing critical permission | Medium | User can't perform job function | Test each role's core workflow |
| SoD violation introduced | Low | Security risk | Manual review + conflict detection |
| Frontend hasPermission() calls break | Low | UI doesn't show/hide correctly | Frontend uses string literals — no enum dependency |
| Data scope not enforced | Medium | User sees data outside their scope | Add scope check in requirePermission middleware |
| Break glass abused | Low | Security breach | Rate limit (2x/24h), mandatory reason, CRITICAL audit, auto-revocation |

---

**END OF PHASE 1 IMPLEMENTATION PLAN (FINAL)**

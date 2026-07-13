# SYSTEM READINESS SCORECARD

**Project:** SUOP Enterprise ERP — Phase 1.5 Validation
**Date:** 2026-07-14
**Validation Mode:** READ-ONLY (no business logic modified)
**Target Score:** 9.8+ per category for enterprise certification

---

## CERTIFICATION DECISION

**Result:** ❌ **NOT READY** — Platform requires Phase 1.6 hardening before enterprise certification.

**Overall Score: 6.2 / 10** (target: 9.8+)

Of 20 validation categories:
- **5 categories** at 9.0+ (enterprise-ready)
- **6 categories** at 7.0-8.9 (partial — minor fixes needed)
- **9 categories** below 7.0 (critical gaps)

---

## SCORECARD

| # | Category | Score | Status | Critical Blockers |
|---|----------|-------|--------|-------------------|
| 1 | Authentication | **8.0** | ⚠️ | Login rate limit not wired; JTI blocklist not consulted; key rotation broken |
| 2 | Organization Context | **4.2** | ❌ | JWT missing scope claims; middleware not registered; frontend store orphaned |
| 3 | Permission Engine | **9.0** | ✅ | — |
| 4 | RBAC | **8.6** | ⚠️ | Customer maker-checker broken; GL/SO permission mismatches |
| 5 | Data Scope | **5.9** | ❌ | Middleware not wired; REGION/BU fail-open; specialized filters unused |
| 6 | Workflow Engine | **8.8** / **4.5** | ✅ / ❌ | Phase 1 fields not propagated; transition() bypassed; no guards in production |
| 7 | CRUD Engine | **6.4** | ⚠️ | 3 update() methods have ReferenceError; no transaction wrapping |
| 8 | Audit | **5.5** | ❌ | Hash chain disconnected; no audit routes; no redaction |
| 9 | Events | **5.5** | ❌ | drainOutbox never called; zero subscribers; no DLQ |
| 10 | Notifications | **3.5** | ❌ | Delivery is stub-only; not wired to event bus; no rules registered |
| 11 | API Layer | **9.0** | ✅ | — |
| 12 | Frontend Authorization | **9.2** | ✅ | — |
| 13 | Sidebar | **9.5** | ✅ | — |
| 14 | Dashboard | **9.0** | ✅ | — |
| 15 | Cross Module Navigation | **2.8** | ❌ | No cross-module links; GRN/Inventory read-only |
| 16 | Cross Module Transactions | **5.5** | ⚠️ | GL not wired; SO→Invoice missing; event bus dead |
| 17 | Tenant Isolation | **8.2** | ✅ | findByGstin cross-tenant |
| 18 | Plant Isolation | **3.5** | ❌ | BROKEN — scope context not propagated |
| 19 | Warehouse Isolation | **3.5** | ❌ | BROKEN — scope context not propagated |
| 20 | Performance/Security/Scalability | **6.1** | ❌ | 2.7 MB chunk; SSRF; JTI in-memory; worker race |

---

## ENTERPRISE-READY CATEGORIES (9.0+) ✅

### Permission Engine — 9.0/10
- 329+ permissions, 14 roles, 8 scope levels
- Naming convention enforced
- PermissionChecker fully functional
- 10 backward-compat aliases

### API Layer — 9.0/10
- Standard JSON envelope with pagination
- 12 typed error classes, 27 error codes
- Zod validation across all routes
- OpenAPI 3.1.0 spec generation

### Frontend Authorization — 9.2/10
- 4-layer protection model
- `hasModuleAccess()`, `<Protected>`, `<PermissionButton>`
- 265 sidebar items filtered
- 265 module renders gated

### Sidebar — 9.5/10
- 265 items across 29 sections
- All filtered via `hasModuleAccess()`
- Empty sections hidden

### Dashboard — 9.0/10
- 4 stat cards filtered by permission
- Sprint progress display

---

## PARTIAL CATEGORIES (7.0-8.9) ⚠️

### Authentication — 8.0/10
**Gaps:**
- Login rate limit not wired to route (critical)
- JTI blocklist not consulted by middleware (critical)
- JWT key rotation broken on verify path
- Cross-tenant login fallback
- Break-glass auto-revoke cron not registered
- Concurrent session limit not enforced on active path

### RBAC — 8.6/10
**Gaps:**
- Customer maker-checker broken (critical)
- GL routes over-broaden write permission
- SO transition uses SO_UPDATE instead of SO_APPROVE
- Delegation route uses USER_UPDATE instead of :delegate
- Only 4 of 27 SoD rules codified as runtime pairs

### Tenant Isolation — 8.2/10
**Gaps:**
- Cross-tenant login fallback at service/index.ts:120
- findByGstin not tenant-scoped (cross-tenant leak)
- findByIdGlobal unscoped

### Cross Module Transactions — 5.5/10
**Gaps:**
- GL not wired to inventory events
- SO → Invoice generation missing
- Event bus dead in production
- SO → Inventory decrement swallows errors
- GRN → PO balance SQL bug

---

## CRITICAL CATEGORIES (below 7.0) ❌

### Organization Context — 4.2/10
**Blockers:**
- JWT does NOT carry scope claims
- `scopeContextMiddleware` defined but NEVER REGISTERED
- Frontend `org-context-store` orphaned (zero consumers)
- `apiFetch()` sends no org headers

### Data Scope — 5.9/10
**Blockers:**
- `scopeContextMiddleware` not registered in app.ts
- `enforceScope` fails OPEN for REGION/BU
- `poRepository.findById` uses raw query()
- `withScope` proxy is a documented no-op
- All 5 specialized filters have zero production callers

### Workflow Engine Integration — 4.5/10
**Blockers:**
- Production services do NOT propagate Phase 1 context fields
- Production services bypass `StateMachine.transition()` entirely
- No production workflow defines guards
- Maker-checker is test-fixture only

### CRUD Engine — 6.4/10
**Blockers:**
- 3 `update()` methods have `targetStatus` ReferenceError
- No DB transaction wrapping
- `findByGstin` not tenant-scoped
- PATCH endpoints skip Zod validation
- Missing `@@unique([tenantId, code])` constraints

### Audit — 5.5/10
**Blockers:**
- Hash chain disconnected from write path
- AuditLog schema lacks hash/prev_hash columns
- No audit routes (compliance blocker)
- No sensitive field redaction
- No retention policy

### Events — 5.5/10
**Blockers:**
- `drainOutbox()` never called in production
- Zero production event subscribers
- No idempotency tracking
- No dead-letter queue
- No row-level locking

### Notifications — 3.5/10
**Blockers:**
- All non-IN_APP channels are stubs
- `drainOutbox()` never scheduled
- Not wired to event bus
- No notification rules registered
- No PUSH channel
- User preferences not integrated

### Cross Module Navigation — 2.8/10
**Blockers:**
- No cross-module navigation links
- GRN/Inventory modules are read-only lists
- No URL routing for entity detail views
- `useOrgContextStore.getBreadcrumb()` never called
- No org-context selector UI

### Plant Isolation — 3.5/10
**Blockers:**
- `scopeContextMiddleware` not registered
- JWT missing `scope.plantIds` claim
- At runtime, `getRequestContext().plantIds === undefined`
- `buildScopeFilter(PLANT, ...)` returns `AND 1=0` → zero rows
- `manufacturing_supervisor` / `quality_manager` see NO DATA

### Warehouse Isolation — 3.5/10
**Blockers:**
- Same root cause as Plant Isolation
- JWT missing `scope.warehouseIds` claim
- `warehouse_operator` sees NO DATA in production

### Performance/Security/Scalability — 6.1/10
**Blockers:**
- Frontend ships 2.7 MB monolithic chunk (page.tsx = 28,639 lines)
- SSRF in webhook + connector modules
- JTI blocklist is in-memory (breaks multi-replica)
- Background worker has no atomic job claim
- Scheduled jobs double-execute across replicas
- Compression not actually compressing
- Field-encryption key defaults to JWT secret
- No IP blocking

---

## SCORE DISTRIBUTION

```
9.0+ (Enterprise Ready)     ████████████████████ 5 categories
7.0-8.9 (Partial)           ████████████████████ 6 categories
5.0-6.9 (Critical Gaps)     ████████████████████ 6 categories
Below 5.0 (Broken)          ████████████████████ 3 categories
```

---

## ROOT CAUSE ANALYSIS

The majority of critical issues stem from **3 root causes**:

### Root Cause 1: Scope Context Chain Broken (affects 5 categories)
The data-scope enforcement chain is broken end-to-end:
1. JWT does not include `scope` claims (warehouseIds, plantIds, etc.)
2. `scopeContextMiddleware` is defined but never registered in `app.ts`
3. Frontend `org-context-store` is orphaned — no consumers, no API headers
4. `enforceScope` fails OPEN for REGION/BU scopes
5. Specialized filters (audit, notification, workflow) have zero callers

**Affected categories:** Organization Context (4.2), Data Scope (5.9), Plant Isolation (3.5), Warehouse Isolation (3.5), Cross Module Transactions (5.5)

**Fix effort:** 3-5 days

### Root Cause 2: Authentication Wiring Gaps (affects 3 categories)
Authentication infrastructure exists but is not wired into the application:
1. `loginRateLimit` defined but never applied to login route
2. JTI blocklist functions exported but never called by middleware
3. JWT key rotation functions exist but verify path ignores them
4. Break-glass auto-revoke function exists but cron never scheduled
5. Concurrent session limit exists but not enforced on active path

**Affected categories:** Authentication (8.0), RBAC (8.6), Performance/Security (6.1)

**Fix effort:** 3-5 days

### Root Cause 3: Infrastructure Scaffolding Not Completed (affects 4 categories)
Audit, Events, Notifications, and Cross-Module Navigation are scaffolding-only:
1. Audit hash chain computed in tests but not in write path
2. Event outbox written to DB but never drained
3. Notification delivery channels are stub `logger.info()` calls
4. Frontend modules are read-only lists with no create/edit actions

**Affected categories:** Audit (5.5), Events (5.5), Notifications (3.5), Cross Module Navigation (2.8)

**Fix effort:** 2-3 engineer-weeks

---

## PATH TO 9.8+

To reach 9.8+ on all 20 categories, the following must be completed:

### Phase 1.6 Hardening Sprint (Estimated: 4 engineer-weeks)

**Week 1: Critical Wiring (P0)**
- Wire `scopeContextMiddleware` into `app.ts`
- Add `scope` claims to JWT signing
- Apply `loginRateLimit` to login route
- Add JTI blocklist check to auth middleware
- Fix 3 `targetStatus` ReferenceErrors in service `update()` methods
- Add SSRF protection to webhook/connector modules

**Week 2: Infrastructure Completion (P0/P1)**
- Add `hash`/`prev_hash` columns to AuditLog; compute in write path
- Create `/api/v1/audit` routes
- Implement sensitive field redaction in audit middleware
- Wire `drainOutbox()` to background scheduler
- Bootstrap production event subscribers (notification router, audit projection, break-glass alerter)
- Wire `eventBus.subscribe()` to `notificationEngine.processEvent()`
- Implement real SMTP/Twilio/WhatsApp adapters

**Week 3: Scalability & Performance (P0/P1)**
- Move JTI blocklist to Redis
- Add `SELECT FOR UPDATE SKIP LOCKED` to worker job claim
- Add leader election for scheduled jobs
- Frontend code splitting (break page.tsx into route modules)
- Add `next/dynamic` for 38 operations components
- Wrap multi-step service mutations in `transaction()`
- Add `@@unique([tenantId, code])` constraints

**Week 4: RBAC & CRUD Hardening (P1)**
- Fix GL/SO route permission mismatches
- Add `enforceMakerChecker` to GL/SO service transition methods
- Fix delegation route to use domain-specific `:delegate` permission
- Add REGION/BU cases to `enforceScope` (fail-closed)
- Tenant-scope `findByGstin`
- Add Zod schemas to PATCH endpoints
- Implement plant/warehouse delete with child-existence guards
- Build GRN creation UI with PO-picker

### Post-1.6 Re-Validation
After Phase 1.6, re-run this validation. Target: all 20 categories at 9.8+.

---

## SIGN-OFF

| Role | Date | Decision |
|------|------|----------|
| Validation Agent | 2026-07-14 | ❌ NOT READY — 6.2/10 (target 9.8+) |
| Test Suite | 2026-07-14 | 3,638/3,638 passing (but masks wiring gaps) |
| Architecture | 2026-07-14 | Sound — issues are wiring, not design |

**SYSTEM IS NOT READY FOR ENTERPRISE CERTIFICATION.**

**Recommended next step:** Execute Phase 1.6 Hardening Sprint (4 engineer-weeks), then re-validate.

**DO NOT FREEZE THE PLATFORM. DO NOT DECLARE "ENTERPRISE PLATFORM V1 READY".**

**WAIT FOR APPROVAL BEFORE PROCEEDING.**

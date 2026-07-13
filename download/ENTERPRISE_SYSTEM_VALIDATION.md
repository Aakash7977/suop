# ENTERPRISE SYSTEM VALIDATION

**Project:** SUOP Enterprise ERP — Phase 1.5
**Date:** 2026-07-14
**Mode:** READ-ONLY validation (no business logic modified, no refactoring)
**Scope:** Complete enterprise platform validation across 20 categories

---

## EXECUTIVE SUMMARY

Phase 1.5 validation performed a comprehensive read-only audit of the entire SUOP Enterprise ERP platform. Twenty subsystems were examined by parallel validation agents, each producing file:line-cited findings. The validation discovered that while the **permission registry, frontend RBAC, response envelope, error handling, and backend performance tests** are enterprise-ready, the platform has **critical wiring gaps** that prevent production go-live in its current state.

**Key finding:** The data-scope enforcement chain is broken end-to-end in production. JWTs do not carry scope claims, `scopeContextMiddleware` is defined but never registered, and frontend `org-context-store` is orphaned. This means plant-scoped and warehouse-scoped users (the entire warehouse floor staff, manufacturing supervisors, quality managers) would see **zero data** in production despite the feature passing all unit tests.

**Validation verdict:** The platform is **NOT READY** for production go-live. The architecture is sound and the codebase is well-structured, but 5 critical blockers and 15 high-priority issues must be resolved before enterprise certification.

| Metric | Value |
|--------|-------|
| Subsystems validated | 20 |
| Total tests passing | 3,638 / 3,638 (100%) |
| Test files | 131 |
| Overall line coverage | 71.47% |
| Backend performance tests | 17/17 passing (< 5ms per permission check) |
| Frontend build | ✅ Succeeds |
| Critical blockers (P0) | 5 |
| High-priority issues (P1) | 15 |
| Medium-priority issues (P2) | 23 |
| Low-priority issues (P3) | 18 |
| Overall readiness score | **6.2 / 10** (target: 9.8+) |

---

## VALIDATION METHODOLOGY

Five parallel validation agents examined the codebase:

1. **Authentication Agent** — JWT, password, session, rate limiting, auth middleware, multi-tenant auth, break glass
2. **RBAC Agent** — Permission registry, route-level RBAC, service-layer RBAC, frontend RBAC, SoD, delegation, break glass permissions
3. **Data Scope & Workflow Agent** — Scope resolution, filter builder, repository enforcement, service enforcement, specialized filters, context propagation, state machine, workflow registry, workflow-RBAC integration
4. **Audit/Events/Notifications/API Agent** — Audit service, audit hardening, audit middleware, audit routes, event bus, event consumers, notification engine, response envelope, error handling, API versioning, OpenAPI, input validation
5. **CRUD/Org/Cross-Module/Isolation/Performance/Security/Scalability Agent** — Repository pattern, service pattern, route pattern, database schema, organization hierarchy, context propagation, cross-module workflows, cross-module consistency, frontend cross-module navigation, tenant/plant/warehouse isolation, database performance, API performance, frontend performance, OWASP, secrets, security monitoring, horizontal scalability, vertical scalability, multi-instance readiness

Each agent ran relevant test suites and produced file:line-cited findings.

---

## CATEGORY-BY-CATEGORY FINDINGS

### 1. Authentication — Score: 8.0/10 ⚠️

**Subsystems:**
| Subsystem | Score | Status |
|-----------|-------|--------|
| JWT Security | 8.2 | ⚠️ JTI blocklist never consulted; key rotation broken on verify path |
| Password Security | 9.4 | ✅ Argon2id + pepper + history |
| Session Management | 9.0 | ✅ Refresh rotation + replay detection + device tracking |
| Rate Limiting | 6.8 | ⚠️ Login rate limit never wired to route |
| Auth Middleware | 7.4 | ⚠️ No JTI blocklist check |
| Multi-tenant Auth | 7.8 | ⚠️ Cross-tenant login fallback |
| Break Glass Auth | 7.6 | ⚠️ Auto-revoke cron not registered |

**Critical findings:**
- 🔴 **Login route has no `loginRateLimit` middleware** — brute-force protection is 1000 attempts/min/IP (global limit only). The `login` rule (5/300s) exists in the rate-limiter service but is never applied to `/api/v1/auth/login`.
- 🔴 **JTI blocklist is dead code** — `isTokenBlocked()` and `isJtiBlocked()` are exported and tested but never called by `middleware/auth.ts:62`. Access tokens remain valid for up to 15 minutes after logout/lock/password-change.
- 🔴 **JWT key rotation is broken** — `verifyAccessToken()` always uses `env.JWT_SECRET`, ignoring `getVerificationKeys()`. Rotating the key provides false security.
- 🟠 **Cross-tenant login fallback** — `service/index.ts:120-123` does `SELECT * FROM users WHERE email = $1 LIMIT 1` without tenant filter when `tenantId` is not provided. Non-deterministic tenant assignment.
- 🟠 **Break-glass auto-revoke cron not registered** — `revokeExpiredSessions()` exists but is never scheduled. Expired sessions linger as "ACTIVE" in the dashboard.

### 2. Organization Context — Score: 4.2/10 ❌

**Findings:**
- ✅ Organization hierarchy (Company → BU → Division → Region → Plant → Warehouse) is implemented with CRUD for each level
- ✅ Business rules: cannot delete company with children; only one default warehouse per plant; financial year no overlap
- ✅ Workflow engine integration for organization lifecycle
- 🔴 **JWT does NOT carry scope claims** — `signAccessToken()` only signs `{ userId, tenantId, email, roles, permissions, jti }`. No `scope.warehouseIds`, `scope.plantIds`, `scope.companyIds`.
- 🔴 **`scopeContextMiddleware` is defined but NEVER REGISTERED** in `app.ts` middleware chain. `grep "scopeContext" src/app/app.ts` returns zero matches.
- 🔴 **Frontend `org-context-store` is orphaned** — `useOrgContextStore` has zero consumers outside the store file. `apiFetch()` sends no org headers (`X-Company-Id`, `X-Plant-Id`, etc.).
- 🟠 **Hierarchy mismatch** — Backend has Company → BU → Division → Region → Plant → Warehouse; frontend `org-context-store` references `enterpriseId`/`branchId` which don't exist in backend.
- 🟠 **Plant/Warehouse delete missing** — No `delete` method on `plantService` or `warehouseService`. Cannot delete plants/warehouses; no guard against deleting plant with warehouses.

### 3. Permission Engine — Score: 9.0/10 ✅

**Findings:**
- ✅ 329+ permissions across 14 domains, 14 roles, 8 data scope levels
- ✅ Naming convention `<domain>:<action>[:<sub-scope>]` enforced by test
- ✅ `PermissionChecker` with `hasPermission`, `hasAnyPermission`, `hasAllPermissions`, `resolvePermissions`, `isRoleConflict`
- ✅ 10 backward-compat aliases for smooth migration
- ⚠️ Only 4 of 27 SoD rules codified as runtime role-conflict pairs. The remaining 23 are enforced implicitly via role design.
- ⚠️ 16 alias keys inflate the count (346 keys vs 330 unique strings)

### 4. RBAC — Score: 8.6/10 ⚠️

**Subsystems:**
| Subsystem | Score | Status |
|-----------|-------|--------|
| Route-level RBAC | 8.6 | ⚠️ GL/SO permission mismatches |
| Service-layer RBAC | 7.8 | ⚠️ Customer maker-checker bug; GL/SO missing maker-checker |
| Frontend RBAC | 9.2 | ✅ 4-layer protection solid |
| SoD Rules | 8.4 | ⚠️ Runtime enforcement incomplete |
| Delegation | 8.0 | ⚠️ Route permission mismatch; no runtime delegation-record check |
| Break Glass | 9.4 | ✅ Enterprise-ready |

**Critical findings:**
- 🔴 **Customer maker-checker broken** — `customer/service/index.ts:75-78` references `targetStatus` which is undefined in `update()` scope. Dead code → SoD bypass. A customer's creator can approve their own customer.
- 🟠 **GL routes over-broaden write permission** — `WRITE_PERM = Permission.GL_CREATE` used for POST, PUT, DELETE, AND `/transition`. Distinct `GL_UPDATE`, `GL_APPROVE`, `GL_POST`, `GL_REVERSE` not enforced at route layer.
- 🟠 **SO transition route uses `SO_UPDATE`** instead of `SO_APPROVE` — any user with `SO_UPDATE` (including `sales_officer`) can invoke the transition endpoint.
- 🟠 **Delegation route uses `USER_UPDATE`** instead of domain-specific `:delegate` permission. Any user with `USER_UPDATE` can create delegations in ANY of the 6 domains.

### 5. Data Scope — Score: 5.9/10 ❌

**Subsystems:**
| Subsystem | Score | Status |
|-----------|-------|--------|
| Scope Resolution | 7.0 | ⚠️ BU/REGION unmapped |
| Scope Filter Builder | 9.0 | ✅ Solid |
| Repository Enforcement | 6.5 | ⚠️ 49% adoption, write-path gaps |
| Service-Layer Enforcement | 3.5 | ❌ Dead code, REGION/BU fail-open |
| Specialized Filters | 3.0 | ❌ Zero production callers |
| Context Propagation | 2.5 | ❌ Middleware not wired into app.ts |

**Critical findings:**
- 🔴 **`scopeContextMiddleware` is never registered** in `app.ts` — production requests never populate `ctx.warehouseIds/plantIds/...`. All non-global users hit fail-closed `AND 1=0` (broken) OR scope is silently bypassed.
- 🔴 **`enforceScope` / `requireScopeContext` / `filterResultSetByScope` fail OPEN for `REGION` and `BU` scopes** — no case matches, no check runs, all records pass.
- 🔴 **`poRepository.findById` uses raw `query()`** — out-of-scope POs retrievable by ID.
- 🔴 **`withScope` proxy is a documented no-op** — `scoped-query.ts:183-185` admits "we log the scope but don't intercept the call."
- 🔴 **All 5 specialized filters (audit, notification, workflow, multi-table, result-set) have zero production callers** — audit logs, notifications, and workflow instances are not scope-filtered.

### 6. Workflow Engine — Score: 8.8/10 ✅ (engine) / 4.5/10 ❌ (integration)

**Subsystems:**
| Subsystem | Score | Status |
|-----------|-------|--------|
| State Machine | 8.8 | ✅ Correctly implemented |
| Workflow Registry | 8.5 | ✅ 40 workflows registered |
| Workflow-RBAC Integration | 4.5 | ❌ Phase 1 fields not propagated; transition() bypassed |

**Critical findings:**
- ✅ State machine: validation, canTransition, transition (with break-glass block), guards, onBefore/onAfter hooks, version increment
- 🔴 **Production services do NOT propagate Phase 1 context fields** — `recruitment-onboarding/service/index.ts:361-365` and `crm-foundation/service/index.ts:362-366` call `sm.canTransition(entity, targetState, { userId, tenantId, correlationId })` — `roles`, `permissions`, `dataScope`, `isBreakGlass` all omitted.
- 🔴 **Production services bypass `StateMachine.transition()` entirely** — they call `tx.update()` directly after `canTransition()`. The break-glass check inside `transition()` is never executed.
- 🔴 **No production workflow defines guards** — maker-checker is test-fixture only. All 40 workflows are pure state charts with NO guards and NO hooks.

### 7. CRUD Engine — Score: 6.4/10 ⚠️

**Subsystems:**
| Subsystem | Score | Status |
|-----------|-------|--------|
| Repository Pattern | 8.2 | ⚠️ Solid foundation, scope-enforcement gap |
| Service Pattern | 6.4 | ⚠️ Strong business rules, but critical bugs + no transaction wrapping |
| Route Pattern | 8.4 | ✅ Well-structured, minor validation gaps |
| Database Schema | 8.8 | ✅ Enterprise-grade, missing unique constraints |

**Critical findings:**
- 🔴 **3 runtime ReferenceErrors in service `update()` methods**:
  - `purchaseOrderService.update()` (`service/index.ts:521`) references undefined `targetStatus`
  - `customerService.update()` (`service/index.ts:75`) same bug
  - `goodsReceiptService.update()` (`service/index.ts:168`) same bug
  - PATCH endpoints throw `ReferenceError: targetStatus is not defined`
- 🔴 **No DB transaction wrapping** in any of the 5 sampled services. Multi-step mutations (PO header + lines + taxes + charges + audit + outbox = 6+ INSERTs) have no atomic boundary. Partial failures leave inconsistent state.
- 🟠 **`findByGstin` not tenant-scoped** — `customer/repository/index.ts:40-43` scans all tenants for a matching GSTIN. Cross-tenant data leak via `GET /customers/gst/:gstin`.
- 🟠 **PATCH endpoints skip Zod validation** — `/pos/:id`, `/customers/:id`, `/grns/:id` accept raw `c.req.json()`.
- 🟠 **Missing `@@unique([tenantId, code])`** constraints on Customers, Companies, Plants, Warehouses, Departments — race condition risk.

### 8. Audit — Score: 5.5/10 ❌

**Subsystems:**
| Subsystem | Score | Status |
|-----------|-------|--------|
| Audit Service | 5.5 | ⚠️ No hash chaining in write path; no retention policy |
| Audit Hardening | 5.0 | ⚠️ Disconnected from write path; schema lacks hash columns |
| Audit Middleware | 4.5 | ⚠️ No sensitive field redaction; no request body capture |
| Audit Routes | 1.0 | ❌ Missing entirely |

**Critical findings:**
- 🔴 **Audit hash chain is disconnected** — `AuditLog` schema (`schema.prisma:24-60`) has no `hash`/`prev_hash` columns. `auditService.log()` never computes a hash. `verifyAuditChain()` reads nonexistent columns. Tamper-evidence is non-functional.
- 🔴 **No audit routes** — `/api/v1/audit` does not exist. Operators cannot query, filter, export, or search audit logs without DB access. Compliance blocker for SOC 2 / ISO 27001.
- 🔴 **No sensitive field redaction** — if a caller logs `after: { password: '...' }`, it lands in `audit_logs.after` as plaintext JSON.
- 🟠 **No retention policy** — unbounded table growth, no archival, no legal-hold workflow.
- 🟠 **Severity levels incomplete** — type is `'INFO' | 'WARN' | 'CRITICAL'`; missing `ERROR`.

### 9. Events — Score: 5.5/10 ❌

**Findings:**
- ✅ Outbox pattern with `writeToOutbox()` in 30+ service modules
- ✅ At-least-once delivery semantics, per-handler retry with exponential backoff
- 🔴 **`drainOutbox()` is never called in production** — `main.ts` starts only the HTTP server. No `setInterval`, no BullMQ, no cron. Events pile up in `event_outbox` table with status `PENDING` forever.
- 🔴 **Zero production event subscribers** — `eventBus.subscribe()` is called only in test files. The notification engine's `processEvent()` method is dead code.
- 🟠 **No idempotency tracking** — `DomainEvent.id` exists but consumers have no deduplication cache.
- 🟠 **No dead-letter queue** — after `retryCount` exceeds limit, the row stays PENDING and is retried forever.
- 🟠 **No row-level locking** — `db.eventOutbox.findMany({ where: { status: 'PENDING' }})` has no `SELECT ... FOR UPDATE`. Multiple workers will publish the same event.
- 🟠 **EventName catalog drift** — `SalesOrderCreated`, `InventoryReserved`, `BreakGlassActivated` are published but not in the `EventName` enum.

### 10. Notifications — Score: 3.5/10 ❌

**Findings:**
- ✅ Template engine with `{{var}}` interpolation
- ✅ Rule-based routing with recipient resolvers
- ✅ Outbox pattern with delivery status tracking
- 🔴 **All non-IN_APP channels are stubs** — `deliver()` for EMAIL/SMS/WHATSAPP just calls `logger.info('...sent (stub — SMTP integration in Phase 1)')`. No actual SMTP, Twilio, or WhatsApp Business API.
- 🔴 **`drainOutbox()` never scheduled** — no cron job in `main.ts`.
- 🔴 **Not wired to event bus** — `processEvent()` is dead code.
- 🔴 **No notification rules registered** — `registerRule()` exists but no production code calls it.
- 🟠 **No PUSH channel** — engine has WHATSAPP instead of PUSH (no FCM/APNS).
- 🟠 **User preferences not integrated** — `userPreferenceRepository` exists but engine never queries it.
- 🟠 **ROLE recipient resolver returns `[]`** — comment says "real resolution in Phase 1".

### 11. API Layer — Score: 9.0/10 ✅

**Subsystems:**
| Subsystem | Score | Status |
|-----------|-------|--------|
| Response Envelope | 9.5 | ✅ Correctly implemented |
| Error Handling | 9.5 | ✅ 12 typed errors, 27 error codes |
| API Versioning | 7.0 | ⚠️ Hard-coded to v1 |
| OpenAPI | 6.5 | ⚠️ Manual catalog covers ~10 of 58 modules |
| Input Validation | 8.0 | ✅ Zod + SchemaRegistry |

**Findings:**
- ✅ Standard JSON envelope: `{ success, data, meta, error }` with pagination metadata
- ✅ 12 typed error classes: `ValidationError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ConcurrencyError`, `ConflictError`, `BusinessRuleError`, `RateLimitError`, `InternalError`, `DatabaseError`, `ExternalServiceError`, `ServiceUnavailableError`
- ✅ 27 error codes with HTTP status mapping
- ✅ Zod validation with `@hono/zod-validator` across all routes
- ⚠️ OpenAPI route catalog is manually maintained — covers only ~10 of 58 modules
- ⚠️ No `Accept-Version` header handling; no deprecation engine

### 12. Frontend Authorization — Score: 9.2/10 ✅

**Findings:**
- ✅ 4-layer protection model: sidebar filter + module render gate + dashboard card filter + per-button checks
- ✅ `hasModuleAccess()` with `anyOf`/`allOf` semantics
- ✅ `<Protected>`, `<PermissionButton>`, `<ProtectedAction>` centralized components
- ✅ `usePermission()` hook
- ✅ 265 sidebar items filtered, 265 module renders gated, 4 dashboard cards filtered
- ⚠️ `ALL_PERMISSIONS` catalog has 311 unique strings vs backend's 330 (19 missing)
- ⚠️ Demo mode + SUPER_ADMIN bypass all checks (acceptable for development)

### 13. Sidebar — Score: 9.5/10 ✅

- ✅ 265 sidebar items across 29 sections
- ✅ All filtered via `hasModuleAccess(item.module, hasPermission, ...)`
- ✅ Empty sections hidden when all items filtered out
- ✅ "Soon" badge for unavailable items

### 14. Dashboard — Score: 9.0/10 ✅

- ✅ 4 stat cards (Products, Roles, Companies, Compliance)
- ✅ All filtered via `hasModuleAccess(s.module, ...)`
- ✅ Sprint progress display
- ⚠️ Dashboard is always accessible to authenticated users (acceptable)

### 15. Cross Module Navigation — Score: 2.8/10 ❌

**Findings:**
- 🔴 **No cross-module navigation links** — PO list has no "Create GRN" action. No deep links from PO → GRN → Inventory.
- 🔴 **GRN/Inventory modules are read-only lists** — `GoodsReceiptModule.tsx` is 42 lines (list only). `InventoryModule.tsx` is 39 lines (list + 3 stat cards). No create/edit actions.
- 🔴 **No URL routing for entity detail views** — frontend uses `useState` for view switching. Refreshing the page loses context.
- 🔴 **`useOrgContextStore.getBreadcrumb()` never called** by any component.
- 🔴 **No org-context selector UI** in the frontend.

### 16. Cross Module Transactions — Score: 5.5/10 ⚠️

**Findings:**
- ✅ PO → GRN → Inventory flow works via direct service calls
- ✅ SO → Allocation → Pick → Pack → Ship flow works via direct calls
- ✅ PR → PO → GRN → Quality → Putaway flow works
- 🔴 **GL not wired to inventory events** — `general-ledger` service has no `eventBus.subscribe()`. Procurement → GL financial postings do not happen automatically.
- 🔴 **SO → Invoice generation missing** — no `INVOICED` state in SO workflow. AR module not wired to SO completion.
- 🔴 **Event bus is dead in production** — zero subscribers. All cross-module coordination is via direct service method calls (tight coupling).
- 🟠 **SO → Inventory decrement silently swallows errors** — `pick-pack-dispatch/service/index.ts:73-76` catches and logs errors without failing the shipment. Data inconsistency risk.
- 🟠 **GRN → PO balance SQL bug** — `is_partially_received` / `is_fully_received` flags may be wrong on the completing transition.

### 17. Tenant Isolation — Score: 8.2/10 ✅

- ✅ Every SQL query includes `WHERE tenant_id = $N` (verified across 5 repositories)
- ✅ `enforceTenantIsolation()` at service layer
- ✅ `SYSTEM_TENANT_CROSS` restricted to `tenant_admin` only
- ✅ Prisma tenant extension auto-injects tenantId
- ⚠️ Cross-tenant login fallback at `service/index.ts:120`
- ⚠️ `findByGstin` not tenant-scoped — cross-tenant GSTIN lookup

### 18. Plant Isolation — Score: 3.5/10 ❌

- 🔴 **BROKEN IN PRODUCTION** — `scopeContextMiddleware` not registered; JWT missing `scope.plantIds` claim. At runtime, `getRequestContext().plantIds === undefined` for ALL users. `buildScopeFilter(DataScope.PLANT, ...)` returns `AND 1=0` → every plant-scoped query returns zero rows.
- A `manufacturing_supervisor` or `quality_manager` logging in will see **no data at all**.

### 19. Warehouse Isolation — Score: 3.5/10 ❌

- 🔴 **BROKEN IN PRODUCTION** — same root cause as Plant Isolation. JWT missing `scope.warehouseIds` claim. Every warehouse_operator will see zero inventory, zero putaway tasks, zero barcode labels.

### 20. Performance, Security, Scalability — Score: 6.1/10 ❌

**Subsystems:**
| Subsystem | Score | Status |
|-----------|-------|--------|
| Database Performance | 6.5 | ⚠️ N+1 patterns present; optimization helpers unused |
| API Performance | 7.0 | ⚠️ Compression not actually compressing |
| Frontend Performance | 2.0 | ❌ 2.7 MB monolithic chunk; zero code splitting |
| Backend Performance Tests | 9.8 | ✅ All 17 tests pass |
| OWASP Top 10 | 7.5 | ⚠️ SSRF gap in webhook/connector modules |
| Secrets Management | 6.5 | ⚠️ Field-encryption key defaults to JWT secret |
| Security Monitoring | 7.5 | ⚠️ No IP blocking |
| Horizontal Scalability | 6.0 | ⚠️ JTI blocklist + worker race in-memory |
| Vertical Scalability | 6.5 | ⚠️ N+1 + no bulk operations |
| Multi-Instance Readiness | 4.5 | ❌ 3 blockers: JTI, worker, scheduled jobs |

**Critical findings:**
- 🔴 **Frontend ships 2.7 MB monolithic chunk** — `src/app/page.tsx` is 28,639 lines in a single file. Zero code splitting. Catastrophic initial page load; fails Core Web Vitals.
- 🔴 **SSRF in webhook + connector modules** — `eip/webhooks/service/index.ts:126` and `eip/connectors/service/index.ts:188` do `fetch(url)` to tenant-provided URLs with NO SSRF protection. Cloud metadata service exfiltration risk.
- 🔴 **JTI blocklist is in-memory** — token revocation on one replica does NOT propagate to others.
- 🔴 **Background worker has no atomic job claim** — `processNextJob()` does `findFirst` with no `SELECT FOR UPDATE SKIP LOCKED`. Multiple replicas double-process every job.
- 🔴 **Scheduled jobs double-execute** — `scheduledJobs` Map is process-local. Every replica runs every scheduled job.
- 🟠 **Compression not actually compressing** — `compressionMiddleware()` only sets `Vary: Accept-Encoding` header. Relies on reverse proxy.
- 🟠 **Field-encryption key defaults to JWT secret** — `FIELD_ENCRYPTION_KEY` falls back to `JWT_SECRET` if not set.
- 🟠 **No IP blocking** — security monitoring records events but never blocks IPs.
- 🟠 **N+1 patterns present** — 12 sequential INSERTs in fiscal period creation; PO creation does 12+ separate INSERTs.

---

## CRITICAL BLOCKERS (P0 — Must Fix Before Go-Live)

| # | Blocker | Impact | Effort |
|---|---------|--------|--------|
| 1 | `scopeContextMiddleware` not registered; JWT missing scope claims | Plant/warehouse-scoped users see zero data in production | 1 day |
| 2 | Login route has no `loginRateLimit` middleware | Brute-force protection is 1000/min/IP | 0.5 day |
| 3 | JTI blocklist never consulted by auth middleware | Access tokens valid for 15 min after logout/lock | 1 day |
| 4 | 3 service `update()` methods have `targetStatus` ReferenceError | PATCH endpoints throw at runtime | 0.5 day |
| 5 | Frontend ships 2.7 MB monolithic chunk | Catastrophic page load; fails Core Web Vitals | 3-5 days |
| 6 | SSRF in webhook + connector modules | Cloud metadata exfiltration risk | 1 day |
| 7 | No DB transaction wrapping in services | Partial failures leave inconsistent state | 2 days |
| 8 | Audit hash chain disconnected from write path | Audit logs tamperable with zero detection | 2 days |
| 9 | Zero production event subscribers | Outbox is write-only queue; events pile up forever | 3 days |
| 10 | Background worker has no atomic job claim | Multiple replicas double-process every job | 1 day |

---

## HIGH-PRIORITY ISSUES (P1 — Fix Before Enterprise Certification)

| # | Issue | Impact |
|---|-------|--------|
| 1 | JWT key rotation broken on verify path | Rotation provides false security |
| 2 | Cross-tenant login fallback | Non-deterministic tenant assignment |
| 3 | Break-glass auto-revoke cron not registered | Expired sessions linger as "ACTIVE" |
| 4 | Customer maker-checker broken | Creator can approve own customer |
| 5 | GL/SO route permission mismatches | SoD weakened at HTTP boundary |
| 6 | Delegation route uses `USER_UPDATE` instead of `:delegate` | Any user with `USER_UPDATE` can delegate in any domain |
| 7 | `enforceScope` fails OPEN for REGION/BU | Records pass without check |
| 8 | `findByGstin` not tenant-scoped | Cross-tenant GSTIN lookup |
| 9 | PATCH endpoints skip Zod validation | Arbitrary JSON accepted |
| 10 | No audit routes | Compliance blocker |
| 11 | No sensitive field redaction in audit | Plaintext secrets in audit log |
| 12 | Notification delivery is stub-only | No actual SMTP/Twilio/WhatsApp |
| 13 | GL not wired to inventory events | Financial postings don't happen automatically |
| 14 | SO → Invoice generation missing | AR not wired to SO completion |
| 15 | No `@@unique([tenantId, code])` constraints | Race condition risk |

---

## MEDIUM-PRIORITY ISSUES (P2)

1. Only 4 of 27 SoD rules codified as runtime conflict pairs
2. OpenAPI route catalog covers ~10 of 58 modules
3. No `Accept-Version` header handling
4. No audit retention policy
5. No idempotency tracking for events
6. No dead-letter queue for events
7. No PUSH notification channel
8. User notification preferences not integrated
9. No plant/warehouse delete with child-existence guards
10. No frontend cross-module navigation
11. GRN/Inventory modules are read-only lists
12. No URL routing for entity detail views
13. Compression not actually compressing
14. Field-encryption key defaults to JWT secret
15. No IP blocking in security monitoring
16. No `npm audit` / SBOM / Dependabot
17. N+1 query patterns present
18. Optimization helpers (cursorPaginate, bulkInsert) unused
19. EventName catalog drift
20. No real OAuth2 implementation (spec advertises it)
21. No `ERROR` severity in audit type
22. `withScope` proxy is a documented no-op
23. Hardcoded scrypt salt in secrets

---

## TEST EXECUTION SUMMARY

```
Test Files  131 passed (131)
     Tests  3,638 passed (3,638)
  Duration  ~65s
```

All 3,638 tests pass. However, tests use `_runInTestContext()` to inject scope context directly, bypassing the unregistered `scopeContextMiddleware`. CI is green but the system is non-functional for plant/warehouse-scoped users in a real deployment.

**Test coverage gaps:**
- No tests for `core/audit/` (service, middleware redaction)
- No tests for `core/notifications/` (engine, templates, delivery)
- No integration tests for scoped (non-global) users
- No tests for login rate limiting on the actual route
- No tests for JTI blocklist consultation by middleware
- No tests for cross-tenant login fallback
- No tests for break-glass auto-revocation cron
- No tests for JWT key rotation on verify path

---

## OVERALL READINESS ASSESSMENT

| Dimension | Score | Status |
|-----------|-------|--------|
| Authentication | 8.0 | ⚠️ |
| Organization Context | 4.2 | ❌ |
| Permission Engine | 9.0 | ✅ |
| RBAC | 8.6 | ⚠️ |
| Data Scope | 5.9 | ❌ |
| Workflow Engine | 8.8 / 4.5 | ✅ / ❌ |
| CRUD Engine | 6.4 | ⚠️ |
| Audit | 5.5 | ❌ |
| Events | 5.5 | ❌ |
| Notifications | 3.5 | ❌ |
| API Layer | 9.0 | ✅ |
| Frontend Authorization | 9.2 | ✅ |
| Sidebar | 9.5 | ✅ |
| Dashboard | 9.0 | ✅ |
| Cross Module Navigation | 2.8 | ❌ |
| Cross Module Transactions | 5.5 | ⚠️ |
| Tenant Isolation | 8.2 | ✅ |
| Plant Isolation | 3.5 | ❌ |
| Warehouse Isolation | 3.5 | ❌ |
| Performance/Security/Scalability | 6.1 | ❌ |

**Overall Score: 6.2 / 10** — ❌ **NOT ENTERPRISE READY** (target: 9.8+)

---

## CONCLUSION

The SUOP Enterprise ERP has a **sound architecture** and **well-structured codebase**. The permission registry, frontend RBAC, response envelope, error handling, and backend performance are enterprise-ready. However, the platform has **critical wiring gaps** that prevent production go-live:

1. **Data scope enforcement chain is broken end-to-end** — JWT missing scope claims, middleware not registered, frontend store orphaned
2. **Authentication has critical gaps** — login rate limit not wired, JTI blocklist not consulted, key rotation broken
3. **CRUD services have runtime bugs** — 3 `update()` methods throw ReferenceError
4. **Audit/Events/Notifications are scaffolding-only** — hash chain disconnected, outbox never drained, notification delivery stubbed
5. **Frontend performance is critical** — 2.7 MB monolithic chunk
6. **Multi-instance readiness blocked** — in-memory JTI blocklist, worker race condition, scheduled job double-execution

These issues are **fixable** — the architecture supports the needed changes, and the codebase is clean enough to apply them. Estimated effort for P0+P1 items: **~4 engineer-weeks**.

**Recommendation:** Do NOT declare "ENTERPRISE PLATFORM V1 READY" at this time. Address P0 blockers first, then re-validate. The platform has the potential to reach 9.8+ after a focused hardening sprint (Phase 1.6).

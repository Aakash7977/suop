# PRODUCTION GO-LIVE CHECKLIST

**Project:** SUOP Enterprise ERP
**Date:** 2026-07-14
**Status:** ❌ **NOT READY FOR PRODUCTION GO-LIVE**
**Prerequisite:** Complete Phase 1.6 Hardening Sprint (estimated 4 engineer-weeks)

---

## EXECUTIVE SUMMARY

This checklist defines the minimum requirements that must be met before the SUOP Enterprise ERP can be deployed to production. Each item is derived from the Phase 1.5 Enterprise System Validation findings and is categorized by priority.

**Current status:** 0 of 67 items complete. 10 critical blockers (P0) must be resolved before any production deployment. 15 high-priority items (P1) must be resolved before enterprise certification. 23 medium-priority items (P2) and 18 low-priority items (P3) should be resolved for production hardening.

**Estimated effort:** 4 engineer-weeks for P0+P1, additional 3 engineer-weeks for P2+P3.

---

## P0 — CRITICAL BLOCKERS (Must Fix Before Any Production Deployment)

### P0-1: Wire Scope Context Middleware ☐
- [ ] Register `scopeContextMiddleware` in `app/app.ts` after `authMiddleware`
- [ ] Add `scope` claim to JWT signing in `core/auth/jwt.ts:40-67`
- [ ] Update `modules/auth/service/index.ts:222-228` to load user's plant/warehouse assignments from DB at login
- [ ] Pass scope claims to `signAccessToken()`
- [ ] Verify `getRequestContext().plantIds` is populated for plant-scoped users
- [ ] Verify `getRequestContext().warehouseIds` is populated for warehouse-scoped users
- [ ] Add integration test: warehouse_operator sees only assigned warehouse data
- **Effort:** 1 day
- **Validation category:** Organization Context, Plant Isolation, Warehouse Isolation

### P0-2: Apply Login Rate Limiting ☐
- [ ] Import `loginRateLimit` from `middleware/security/rate-limit.ts`
- [ ] Apply to `POST /api/v1/auth/login` in `modules/auth/routes/index.ts:75`
- [ ] Apply `passwordResetRateLimit` to `POST /api/v1/auth/forgot-password`
- [ ] Verify 6th login attempt within 5 minutes returns 429
- [ ] Add integration test for login rate limiting
- **Effort:** 0.5 day
- **Validation category:** Authentication

### P0-3: Add JTI Blocklist Check to Auth Middleware ☐
- [ ] In `middleware/auth.ts:62`, after `verifyAccessToken()`, call `isTokenBlocked(payload.jti)`
- [ ] If blocked, throw `AuthenticationError` with code `AUTH.TOKEN_REVOKED`
- [ ] Move JTI blocklist from in-memory `Map` to Redis (for multi-replica support)
- [ ] Add JTI to blocklist on: logout, password change, admin lock, password reset
- [ ] Add integration test: logged-out user's access token is rejected
- **Effort:** 1 day
- **Validation category:** Authentication, Scalability

### P0-4: Fix Service `update()` ReferenceErrors ☐
- [ ] Fix `purchaseOrderService.update()` at `service/index.ts:521` — remove `targetStatus` reference
- [ ] Fix `customerService.update()` at `service/index.ts:75` — remove `targetStatus` reference
- [ ] Fix `goodsReceiptService.update()` at `service/index.ts:168` — remove `targetStatus` reference
- [ ] Move maker-checker logic into `transition()` method where `targetStatus` is defined
- [ ] Add regression test: `PATCH /pos/:id`, `PATCH /customers/:id`, `PATCH /grns/:id` succeed without throwing
- **Effort:** 0.5 day
- **Validation category:** CRUD Engine, RBAC

### P0-5: Frontend Code Splitting ☐
- [ ] Refactor `src/app/page.tsx` (28,639 lines) into route-level modules
- [ ] Use `next/dynamic` for 38 operations components in `src/sections/04-operations/`
- [ ] Use `next/dynamic` for 9 master-data components in `src/sections/03-master-data/`
- [ ] Enable `experimental.optimizePackageImports` in `next.config.ts`
- [ ] Enable `swcMinify` in `next.config.ts`
- [ ] Add bundle analyzer (`@next/bundle-analyzer`)
- [ ] Set chunk size warning budget to 250 KB
- [ ] Verify largest chunk is under 500 KB
- [ ] Verify initial page load is under 3 seconds on 3G
- **Effort:** 3-5 days
- **Validation category:** Frontend Performance

### P0-6: SSRF Protection ☐
- [ ] Create `validateOutboundUrl()` utility in `core/security/`
- [ ] Block private IP ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, 127.0.0.0/8
- [ ] Resolve DNS and re-check IP before fetch
- [ ] Re-validate on redirect (follow-redirects must re-check)
- [ ] Apply to `modules/eip/webhooks/service/index.ts:126`
- [ ] Apply to `modules/eip/connectors/service/index.ts:188`
- [ ] Add test: webhook URL `http://169.254.169.254/latest/meta-data/` is rejected
- **Effort:** 1 day
- **Validation category:** Security (OWASP A10)

### P0-7: DB Transaction Wrapping ☐
- [ ] Wrap `purchaseOrderService.create()` in `transaction()` (header + lines + taxes + charges + audit + outbox)
- [ ] Wrap `salesOrderService.create()` in `transaction()`
- [ ] Wrap `goodsReceiptService.create()` + `transition('ACCEPTED')` in `transaction()`
- [ ] Wrap `salesOrderService.reserveInventory()` in `transaction()`
- [ ] Wrap `pickPackDispatchService.createShipment()` + `stockOut()` in `transaction()`
- [ ] Ensure transaction rollback on any sub-step failure
- [ ] Add test: simulate failure mid-creation, verify no orphaned records
- **Effort:** 2 days
- **Validation category:** CRUD Engine, Cross-Module Transactions

### P0-8: Audit Hash Chain ☐
- [ ] Add `hash` and `prev_hash` columns to `AuditLog` model in `prisma/schema.prisma`
- [ ] Create migration: `ALTER TABLE audit_logs ADD COLUMN hash TEXT, ADD COLUMN prev_hash TEXT`
- [ ] Update `auditService.log()` to compute `hash` using `computeAuditHash()`
- [ ] Update `auditService.log()` to fetch and set `prev_hash` from the previous entry
- [ ] Schedule `verifyAuditChain()` to run hourly via cron
- [ ] Schedule `createCheckpoint()` to run daily via cron
- [ ] Add test: tampering with an audit log entry is detected by `verifyAuditChain()`
- **Effort:** 2 days
- **Validation category:** Audit

### P0-9: Event Outbox Draining ☐
- [ ] Create background scheduler in `main.ts` or `core/jobs/`
- [ ] Call `eventBus.drainOutbox()` every 5 seconds via `setInterval` or BullMQ
- [ ] Add `SELECT ... FOR UPDATE SKIP LOCKED` to `drainOutbox()` for multi-worker safety
- [ ] Add max-retry limit (e.g., 10) — move to dead-letter queue after exhaustion
- [ ] Bootstrap production event subscribers:
  - [ ] Notification router (`eventBus.subscribe('*')` → `notificationEngine.processEvent()`)
  - [ ] Audit projection (optional — for search index)
  - [ ] Break-glass security alerter (`eventBus.subscribe('BreakGlassActivated')` → send email to security officer)
- [ ] Add test: event written to outbox is published within 10 seconds
- **Effort:** 2 days
- **Validation category:** Events, Notifications

### P0-10: Background Worker Atomic Job Claim ☐
- [ ] Update `processNextJob()` in `core/jobs/v2/queue.ts:165-176`
- [ ] Use `SELECT FOR UPDATE SKIP LOCKED LIMIT 1` instead of `findFirst`
- [ ] OR use Redis BLPOPLPUSH pattern as documented in file comments
- [ ] Remove process-local `workerRunning` boolean guard
- [ ] Add test: two workers running simultaneously do not pick the same job
- **Effort:** 1 day
- **Validation category:** Scalability

---

## P1 — HIGH PRIORITY (Must Fix Before Enterprise Certification)

### P1-1: Fix JWT Key Rotation ☐
- [ ] Update `core/auth/jwt.ts:71` to use `getVerificationKeys()` instead of `env.JWT_SECRET`
- [ ] Iterate over all verification keys during `jwt.verify()`
- [ ] Add test: token signed with old key verifies during rotation window

### P1-2: Remove Cross-Tenant Login Fallback ☐
- [ ] Remove `SELECT * FROM users WHERE email = $1 LIMIT 1` at `service/index.ts:120-123`
- [ ] Require `tenantId` on every login (from subdomain or explicit field)
- [ ] Add test: login without tenantId returns 400

### P1-3: Register Break-Glass Auto-Revoke Cron ☐
- [ ] Schedule `breakGlassService.revokeExpiredSessions()` every 5 minutes
- [ ] Refactor `revokeExpiredSessions()` to not call `getContext()` (use system context)
- [ ] Add test: expired session is revoked within 5 minutes

### P1-4: Fix Customer Maker-Checker ☐
- [ ] Move `enforceMakerChecker` call from `update()` to `transition()` in `customer/service/index.ts`
- [ ] Add `enforceMakerChecker` to GL `transition()` for `POSTED` target state
- [ ] Add `enforceMakerChecker` to SO `transition()` for `APPROVED` target state

### P1-5: Fix GL/SO Route Permissions ☐
- [ ] Split `WRITE_PERM` in `general-ledger/routes/index.ts:25-26` into `GL_CREATE`, `GL_UPDATE`, `GL_ARCHIVE`, `GL_APPROVE`
- [ ] Change SO transition permission from `SO_UPDATE` to `SO_APPROVE` in `sales-order/routes/index.ts:61`

### P1-6: Fix Delegation Route Permission ☐
- [ ] Change `user-management/routes/delegations.ts:34` from `USER_UPDATE` to domain-specific `:delegate` permission
- [ ] Add helper `requireDomainDelegatePermission(domain)` that resolves `so:delegate`, `pr:delegate`, etc.

### P1-7: Add REGION/BU Cases to enforceScope ☐
- [ ] Add `case DataScope.REGION` to `enforceScope()` in `data-scope.ts:407-463`
- [ ] Add `case DataScope.BU` to `enforceScope()`
- [ ] Add REGION/BU cases to `requireScopeContext()` and `filterResultSetByScope()`
- [ ] All should fail-closed when IDs are missing

### P1-8: Tenant-Scope findByGstin ☐
- [ ] Add `tenantId` parameter to `customer/repository/index.ts:40-43` `findByGstin()`
- [ ] Add `tenantId` parameter to `supplier/repository/index.ts:43-46` `findByGstin()`
- [ ] Update all callers in customer/supplier services

### P1-9: Add Zod Schemas to PATCH Endpoints ☐
- [ ] Add Zod schema to `PATCH /pos/:id` in `purchase-order/routes/index.ts:159-165`
- [ ] Add Zod schema to `PATCH /customers/:id` in `customer/routes/index.ts:72-77`
- [ ] Add Zod schema to `PATCH /grns/:id` in `goods-receipt/routes/`

### P1-10: Create Audit Routes ☐
- [ ] Create `modules/audit/routes/index.ts`
- [ ] `GET /api/v1/audit` — list with pagination
- [ ] `GET /api/v1/audit/:id` — get single entry
- [ ] `GET /api/v1/audit/export` — CSV/PDF export with signature
- [ ] `GET /api/v1/audit/entity/:entityType/:entityId` — entity history
- [ ] `GET /api/v1/audit/actor/:actorId` — actor history
- [ ] All gated by `AUDIT_READ` / `AUDIT_READ_CRITICAL` / `AUDIT_EXPORT` permissions

### P1-11: Sensitive Field Redaction in Audit ☐
- [ ] Create redaction utility with configurable allowlist
- [ ] Fields to redact: `password`, `token`, `secret`, `pin`, `otp`, `apiKey`, `privateKey`
- [ ] Apply in `auditService.log()` before writing `before`/`after` to DB
- [ ] Apply in `auditMiddleware` before capturing request/response bodies

### P1-12: Real Notification Delivery ☐
- [ ] Implement SMTP adapter for EMAIL channel
- [ ] Implement Twilio adapter for SMS channel
- [ ] Implement WhatsApp Business API adapter
- [ ] Add DELIVERED webhook handlers for email/SMS receipts
- [ ] Add retry with exponential backoff
- [ ] Add max-retry limit with DLQ

### P1-13: Wire GL to Inventory Events ☐
- [ ] `eventBus.subscribe('StockPosted')` → create GL journal entry (debit inventory, credit GRNI)
- [ ] `eventBus.subscribe('StockRemoved')` → create GL journal entry (debit COGS, credit inventory)
- [ ] `eventBus.subscribe('GrnPosted')` → create GL journal entry (debit GRNI, credit AP)
- [ ] `eventBus.subscribe('ShipmentCreated')` → create GL journal entry (debit AR, credit revenue)

### P1-14: SO → Invoice Generation ☐
- [ ] Add `INVOICED` state to SO workflow
- [ ] On `DELIVERED → COMPLETED` transition, create customer invoice
- [ ] Wire AR module to invoice creation

### P1-15: Add Unique Constraints ☐
- [ ] `@@unique([tenantId, customerCode])` on Customers
- [ ] `@@unique([tenantId, supplierCode])` on Suppliers
- [ ] `@@unique([tenantId, companyCode])` on Companies
- [ ] `@@unique([tenantId, plantCode])` on Plants
- [ ] `@@unique([tenantId, warehouseCode])` on Warehouses
- [ ] `@@unique([tenantId, departmentCode])` on Departments
- [ ] Create migration to add constraints

---

## P2 — MEDIUM PRIORITY (Production Hardening)

### RBAC
- [ ] Codify all 27 SoD rules as runtime conflict pairs in `isRoleConflict()`
- [ ] Add `enforceScopeOnRead` / `enforceScopeForWrite` to service get/update/delete methods
- [ ] Wire specialized filters: `buildAuditScopeFilter`, `buildNotificationScopeFilter`, `buildWorkflowScopeFilter`
- [ ] Migrate remaining 28 stub-template repositories to `scopedQuery`
- [ ] Implement `withScope` proxy to actually wrap methods (or remove it)

### Workflow
- [ ] Update all 40 module workflow services to construct `WorkflowContext` with Phase 1 fields
- [ ] Call `sm.transition()` instead of direct `tx.update()` in all workflow services
- [ ] Add maker-checker guards to approval transitions in PO, SO, Leave, CAPA workflows

### CRUD
- [ ] Implement plant/warehouse delete with child-existence guards
- [ ] Fix GRN → PO balance SQL bug (flag evaluation)
- [ ] Fix SO `reserveInventory` to use `scopedQuery` instead of raw `query()`
- [ ] Fix SO `performCreditCheck` to pass actual version (not 0)
- [ ] Fix `pick-pack-dispatch/service/index.ts:50-65` `stockOut` call signature

### Audit
- [ ] Add `ERROR` severity to `AuditSeverity` type
- [ ] Add audit retention job (7-year retention with archival)
- [ ] Add audit middleware request body capture
- [ ] Add status-code-based severity escalation (4xx → WARN, 5xx → ERROR)

### Events
- [ ] Add idempotency cache (Redis `SETNX event:<id>`)
- [ ] Add dead-letter queue for events exceeding max retries
- [ ] Add row-level locking (`SELECT FOR UPDATE`) to `drainOutbox()`
- [ ] Update `EventName` enum with all published events

### Notifications
- [ ] Add PUSH channel (FCM/APNS)
- [ ] Wire `userPreferenceRepository` into notification engine
- [ ] Implement multi-channel fan-out (HIGH priority → EMAIL + SMS)
- [ ] Implement ROLE recipient resolver
- [ ] Register default notification rules at bootstrap

### API
- [ ] Auto-generate OpenAPI paths from Hono route introspection
- [ ] Bridge `SchemaRegistry` to OpenAPI `components.schemas`
- [ ] Add `Accept-Version` header negotiation
- [ ] Add `Deprecation`/`Sunset` header middleware
- [ ] Remove OAuth2 from spec (not implemented)

### Frontend
- [ ] Build GRN creation UI with PO-picker
- [ ] Build Inventory stock-in/stock-out/reserve/block UI
- [ ] Add cross-module navigation links (PO → GRN, SO → Pick)
- [ ] Add URL routing for entity detail views
- [ ] Wire `useOrgContextStore` to `apiFetch()` headers
- [ ] Add org-context selector component
- [ ] Consume `useOrgContextStore.getBreadcrumb()`

### Performance
- [ ] Replace OFFSET pagination with `cursorPaginate()` on hot tables
- [ ] Replace for-loop INSERTs with `bulkInsert()` in PO/SO/financial-foundation services
- [ ] Enable actual response compression (or document reverse proxy requirement)
- [ ] Fix N+1 in fiscal period creation (12 sequential INSERTs)

### Security
- [ ] Add `npm audit` to CI
- [ ] Generate SBOM via `cyclonedx`
- [ ] Add Dependabot config
- [ ] Implement IP blocking in security monitoring
- [ ] Remove `FIELD_ENCRYPTION_KEY` default-to-JWT-secret fallback
- [ ] Generate per-deployment scrypt salt
- [ ] Implement `AwsSecretsManagerProvider` or `VaultProvider`
- [ ] Replace 11 `expect(true).toBe(true)` OWASP smell tests with real tests

### Scalability
- [ ] Move JTI blocklist to Redis hash with TTL
- [ ] Add leader election for scheduled jobs
- [ ] Replace PGlite direct imports with Prisma client (or document single-instance limitation)

---

## P3 — LOW PRIORITY (Post-Launch Hardening)

- [ ] Add HaveIBeenPwned k-anonymity API integration
- [ ] Expand common-password list beyond 5 entries
- [ ] Add sequential-character / keyboard-walk detection
- [ ] Migrate from HS256 to RS256/ES256 (for multi-service)
- [ ] Add `schemas.uuidv7` actual UUIDv7 validation
- [ ] Add GST/PAN checksum digit validation
- [ ] Fix `needsRehash()` to use proper hash parsing
- [ ] Remove dead `CUSTOMER_*` constants in sales-order routes
- [ ] Add `INVOICED` state to SO workflow
- [ ] Implement PR → PO automation (`createFromPR()`)
- [ ] Add search index projection builder
- [ ] Add webhook dispatcher for external subscribers
- [ ] Add event replay tooling
- [ ] Add template injection protection in notification engine
- [ ] Add rate-limiting per notification recipient
- [ ] Encrypt PII in `NotificationOutbox`
- [ ] Add `operationId` uniqueness check in OpenAPI
- [ ] Validate OpenAPI spec against 3.1 schema

---

## PRE-DEPLOYMENT VERIFICATION

Before deploying to production, verify the following:

### Infrastructure
- [ ] Managed PostgreSQL provisioned (not PGlite)
- [ ] Redis cluster provisioned
- [ ] SMTP relay configured
- [ ] Twilio account configured
- [ ] S3 bucket provisioned (file uploads + quarantine)
- [ ] ClamAV instance provisioned (virus scanning)
- [ ] CDN configured (for frontend bundle)
- [ ] Reverse proxy configured (Caddy/Nginx for compression/TLS)

### Environment Variables
- [ ] `DATABASE_URL` points to managed Postgres
- [ ] `REDIS_URL` points to Redis cluster
- [ ] `JWT_SECRET` is 32+ chars, generated securely
- [ ] `PASSWORD_PEPPER` is 32+ chars, generated securely
- [ ] `FIELD_ENCRYPTION_KEY` is set (NOT defaulting to JWT_SECRET)
- [ ] `S3_*` credentials configured
- [ ] `SMTP_*` credentials configured
- [ ] `CLAMAV_HOST` set (virus scanning enabled)
- [ ] `SENTRY_DSN` set (error tracking)
- [ ] `OTEL_EXPORTER_OTLP_ENDPOINT` set (tracing)
- [ ] `CORS_ALLOWED_ORIGINS` set to production frontend URL

### Security
- [ ] Demo mode disabled in production build
- [ ] `typescript.ignoreBuildErrors` set to `false` in `next.config.ts`
- [ ] `reactStrictMode` set to `true` in `next.config.ts`
- [ ] Helmet CSP configured for production
- [ ] HSTS enabled (1 year + preload)
- [ ] CORS restricted to production frontend URL
- [ ] Rate limits configured appropriately
- [ ] SSRF protection verified

### Data Migration
- [ ] Database schema migrated
- [ ] Seed data loaded (roles, permissions, admin user)
- [ ] Initial organization hierarchy created
- [ ] Default warehouses/plants configured
- [ ] Admin user created with strong password

### Monitoring
- [ ] Health check endpoint (`/health`) responds 200
- [ ] Readiness endpoint (`/ready`) responds 200
- [ ] Metrics endpoint (`/metrics`) exposes Prometheus metrics
- [ ] Sentry error tracking verified
- [ ] OpenTelemetry tracing verified
- [ ] Log aggregation configured
- [ ] Alerting rules configured

### Smoke Tests
- [ ] Login with admin user succeeds
- [ ] Login with warehouse_operator succeeds
- [ ] warehouse_operator sees only assigned warehouse data (verify P0-1)
- [ ] Login rate limiting works (6th attempt returns 429)
- [ ] Logout invalidates access token immediately (verify P0-3)
- [ ] Audit log entry written on every mutation
- [ ] Audit log hash chain verifies successfully
- [ ] Event outbox drains within 10 seconds
- [ ] Notification delivered via EMAIL channel
- [ ] Frontend initial page load under 3 seconds

---

## SIGN-OFF

| Role | Name | Date | Status |
|------|------|------|--------|
| Engineering Lead | ___ | ___ | ☐ Approved |
| Security Officer | ___ | ___ | ☐ Approved |
| DevOps Lead | ___ | ___ | ☐ Approved |
| Product Owner | ___ | ___ | ☐ Approved |
| QA Lead | ___ | ___ | ☐ Approved |

**All 5 sign-offs required before production deployment.**

---

## CONCLUSION

The SUOP Enterprise ERP is **NOT ready for production go-live**. The platform has a sound architecture and well-structured codebase, but 10 critical blockers (P0) must be resolved before any deployment. An additional 15 high-priority items (P1) must be resolved before enterprise certification.

**Estimated timeline:**
- P0 items: 2 engineer-weeks
- P1 items: 2 engineer-weeks
- P2 items: 3 engineer-weeks (post-launch hardening)
- P3 items: 2 engineer-weeks (ongoing)

**Total Phase 1.6 Hardening Sprint: 4 engineer-weeks (P0+P1)**

After Phase 1.6, re-run the Phase 1.5 validation. If all 20 categories score 9.8+, declare "ENTERPRISE PLATFORM V1 READY" and freeze the platform.

**DO NOT DEPLOY TO PRODUCTION UNTIL ALL P0 ITEMS ARE COMPLETE.**

# SUOP ERP v1.0 — Final Production Readiness Checklist

| Field | Value |
|---|---|
| Document Version | 1.0 |
| Status | DRAFT — Awaiting Final Approval |
| Date | 2026-07-11 |
| Approval Required | Project Owner |
| Purpose | Single source of truth for v1.0 production readiness |

---

## How to Use This Checklist

This checklist defines **100% completion criteria** for SUOP ERP v1.0 production readiness. When every item is checked, the documentation phase is **permanently frozen** and implementation may begin.

The checklist aggregates requirements from all 8 architecture documents:
- Phase 0 Architecture
- Data Architecture
- API Standards
- Security Architecture
- DevOps Architecture
- Performance Standards
- Disaster Recovery
- (Plus operational items)

**Each checkbox must be verifiable.** "Verifiable" means there is a test, command, or artifact that proves the item is complete.

---

## 1. Documentation (100% complete)

| # | Item | Verified By | Status |
|---|---|---|---|
| 1.1 | Phase 0 Architecture approved | Stakeholder signature | ☐ |
| 1.2 | Data Architecture approved | Stakeholder signature | ☐ |
| 1.3 | API Standards approved | Stakeholder signature | ☐ |
| 1.4 | Security Architecture approved | Stakeholder signature | ☐ |
| 1.5 | DevOps Architecture approved | Stakeholder signature | ☐ |
| 1.6 | Performance Standards approved | Stakeholder signature | ☐ |
| 1.7 | Disaster Recovery approved | Stakeholder signature | ☐ |
| 1.8 | Schema Review Report produced | Document exists | ☐ |
| 1.9 | Stock Ledger Design produced | Document exists | ☐ |
| 1.10 | All ADRs (Architecture Decision Records) written | ADR folder populated | ☐ |
| 1.11 | Runbooks for top 10 ops tasks written | Runbook folder | ☐ |
| 1.12 | README.md in every package | File inspection | ☐ |

---

## 2. Foundation Framework (Phase 0 Code)

### 2.1 Project Structure

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.1.1 | Monorepo setup (Turborepo + pnpm) | `pnpm install` works | ☐ |
| 2.1.2 | `apps/web`, `apps/backend`, `apps/mobile` folders | Folder structure | ☐ |
| 2.1.3 | `packages/shared`, `packages/prisma`, `packages/ui` folders | Folder structure | ☐ |
| 2.1.4 | ESLint config enforces layer boundaries | `bun run lint` passes | ☐ |
| 2.1.5 | TypeScript strict mode enabled | `tsconfig.json` inspection | ☐ |
| 2.1.6 | No `any` types (without justification) | ESLint rule | ☐ |

### 2.2 Configuration Framework

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.2.1 | Env validation (zod schema) | App refuses to start on missing env | ☐ |
| 2.2.2 | Feature flags implemented | `features.isEnabled()` works | ☐ |
| 2.2.3 | Config sources prioritized (env > DB > defaults) | Tested | ☐ |
| 2.2.4 | Secrets manager integration | Secrets loaded at boot | ☐ |

### 2.3 Error Framework

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.3.1 | Error hierarchy (BaseError + 10 subclasses) | Code inspection | ☐ |
| 2.3.2 | Error code catalog | `packages/shared` export | ☐ |
| 2.3.3 | Error handler middleware | Errors shaped correctly | ☐ |
| 2.3.4 | 5xx errors published to Sentry | Sentry integration | ☐ |

### 2.4 Response Envelope

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.4.1 | Success envelope `{success, data, meta}` | All endpoints return this | ☐ |
| 2.4.2 | Error envelope `{success: false, error, meta}` | All errors return this | ☐ |
| 2.4.3 | Pagination meta | List endpoints include meta | ☐ |
| 2.4.4 | Correlation ID in every response | `X-Request-Id` header | ☐ |

### 2.5 Logging Framework

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.5.1 | Structured JSON logging (Pino) | Log format verified | ☐ |
| 2.5.2 | Request context (correlation ID, user, tenant) | Logs include context | ☐ |
| 2.5.3 | Sensitive field redaction | Logs don't contain secrets | ☐ |
| 2.5.4 | Log levels (fatal, error, warn, info, debug) | Configurable per env | ☐ |

### 2.6 Validation Framework

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.6.1 | Zod schemas for every endpoint | Schema files exist | ☐ |
| 2.6.2 | Validation middleware | Invalid input → 400 with details | ☐ |
| 2.6.3 | Schema registry | Schemas registered at boot | ☐ |
| 2.6.4 | Reusable schema fragments | Shared schemas in `packages/shared` | ☐ |
| 2.6.5 | OpenAPI spec generated from schemas | `openapi.yaml` exists | ☐ |

### 2.7 Audit Framework

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.7.1 | `audit_logs` table migrated | DB inspection | ☐ |
| 2.7.2 | Audit log table is append-only | RLS policy enforced | ☐ |
| 2.7.3 | Audit middleware records mutations | All POST/PATCH/DELETE audited | ☐ |
| 2.7.4 | Workflow transitions audit logged | Transitions produce audit entry | ☐ |
| 2.7.5 | Audit query API (`/api/v1/audit/...`) | Endpoints work | ☐ |
| 2.7.6 | `<AuditTrail />` frontend component | Renders audit timeline | ☐ |
| 2.7.7 | Hash chain for audit log integrity | Daily hash published externally | ☐ |

### 2.8 Event Bus

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.8.1 | EventBus interface | Code inspection | ☐ |
| 2.8.2 | Outbox pattern implemented | `event_outbox` table + publisher job | ☐ |
| 2.8.3 | Event handler base class | `BaseEventHandler` exists | ☐ |
| 2.8.4 | Event catalog (all event names) | `packages/shared` export | ☐ |
| 2.8.5 | At-least-once delivery | Idempotency tested | ☐ |
| 2.8.6 | Event replay API | Admin can replay events | ☐ |

### 2.9 Notification Engine

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.9.1 | Notification rule engine | Rules configurable per tenant | ☐ |
| 2.9.2 | In-app channel | Notifications table populated | ☐ |
| 2.9.3 | Email channel | Test email sent via SMTP | ☐ |
| 2.9.4 | SMS channel (Twilio) | Stub or working | ☐ |
| 2.9.5 | WhatsApp channel | Stub or working | ☐ |
| 2.9.6 | Durable delivery (outbox pattern) | `notification_outbox` table | ☐ |
| 2.9.7 | Template system (Handlebars) | Templates versioned | ☐ |
| 2.9.8 | Subscription service | User can unsubscribe | ☐ |
| 2.9.9 | Delivery status tracked | Status visible in UI | ☐ |

### 2.10 Workflow Engine

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.10.1 | `BaseWorkflow` class | Code inspection | ☐ |
| 2.10.2 | State machine with guards | Invalid transition rejected | ☐ |
| 2.10.3 | Pre/post transition hooks | Hooks fire on transition | ☐ |
| 2.10.4 | Transitions publish events | Events emitted | ☐ |
| 2.10.5 | Transitions audit logged | Audit entries created | ☐ |
| 2.10.6 | Workflow registry | All workflows registered at boot | ☐ |
| 2.10.7 | Workflow inspection API | `/api/v1/workflows/:entityType/:id` works | ☐ |
| 2.10.8 | `<WorkflowActions />` frontend component | UI shows available actions | ☐ |

### 2.11 Permission Framework

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.11.1 | RBAC middleware | Endpoints protected | ☐ |
| 2.11.2 | `@requirePermission` decorator | Used on routes | ☐ |
| 2.11.3 | Permission registry | All permissions catalogued | ☐ |
| 2.11.4 | 3-layer enforcement (route, service, field) | Tested | ☐ |
| 2.11.5 | `<PermissionGuard>` frontend component | UI hides unauthorized | ☐ |
| 2.11.6 | Default roles seeded | `tenants`, `roles`, `permissions` seeded | ☐ |

### 2.12 Multi-Tenancy

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.12.1 | `tenantId` on every business table | Schema inspection | ☐ |
| 2.12.2 | Prisma extension auto-scopes queries | Cross-tenant test blocked | ☐ |
| 2.12.3 | PostgreSQL RLS enabled | DB policy check | ☐ |
| 2.12.4 | TenantMiddleware loads context | AsyncLocalStorage populated | ☐ |
| 2.12.5 | Cross-tenant access audited at CRITICAL | Audit log check | ☐ |

### 2.13 Transaction Helper

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.13.1 | `transaction()` helper | Code inspection | ☐ |
| 2.13.2 | Retry on deadlock/serialization | Retry test passes | ☐ |
| 2.13.3 | Long transaction detection (>5s warning) | Log warning fires | ☐ |
| 2.13.4 | Outbox pattern in transactions | Events published after commit | ☐ |

### 2.14 File Upload Service

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.14.1 | FileService interface | Code inspection | ☐ |
| 2.14.2 | S3 driver | Files uploaded to S3 | ☐ |
| 2.14.3 | Local driver (dev) | Files saved locally | ☐ |
| 2.14.4 | MIME type whitelist | Invalid MIME rejected | ☐ |
| 2.14.5 | File size limits | Large file rejected | ☐ |
| 2.14.6 | Signed URLs (15-min TTL) | URLs expire | ☐ |
| 2.14.7 | Virus scan (ClamAV) | Infected file rejected | ☐ |
| 2.14.8 | File metadata in `file_uploads` table | DB inspection | ☐ |

### 2.15 Background Job Framework

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.15.1 | BullMQ integration | Queue works | ☐ |
| 2.15.2 | Scheduled jobs (cron) | Jobs fire on schedule | ☐ |
| 2.15.3 | Queued jobs | `jobs.enqueue()` works | ☐ |
| 2.15.4 | Retry with backoff | Failed job retried | ☐ |
| 2.15.5 | Dead-letter queue | Failed jobs land in DLQ | ☐ |
| 2.15.6 | Job observability API | `/api/v1/_internal/jobs` works | ☐ |
| 2.15.7 | Distributed lock (single instance per tenant) | Duplicate job prevented | ☐ |

### 2.16 Base Classes

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.16.1 | `BaseRepository` with tenant scope, soft delete, optimistic lock | Code inspection | ☐ |
| 2.16.2 | `BaseService` with hooks + validation contract | Code inspection | ☐ |
| 2.16.3 | `BaseController` with CRUD handlers | Code inspection | ☐ |
| 2.16.4 | `BaseWorkflow` with state machine | Code inspection | ☐ |
| 2.16.5 | `BaseEventHandler` | Code inspection | ☐ |
| 2.16.6 | `BaseJob` | Code inspection | ☐ |
| 2.16.7 | `BaseMiddleware` | Code inspection | ☐ |

### 2.17 Frontend Foundation

| # | Item | Verified By | Status |
|---|---|---|---|
| 2.17.1 | Axios client with interceptors | Code inspection | ☐ |
| 2.17.2 | React Query client + query key factory | Code inspection | ☐ |
| 2.17.3 | Auth context + permission guard | Login works, guards hide UI | ☐ |
| 2.17.4 | Shared UI components (DataTable, EntityForm, StatusBadge, etc.) | Component library exists | ☐ |
| 2.17.5 | Loading/error/empty states | All data views have states | ☐ |
| 2.17.6 | Toast notifications | Mutations show toasts | ☐ |

---

## 3. Database

### 3.1 Database Setup

| # | Item | Verified By | Status |
|---|---|---|---|
| 3.1.1 | PostgreSQL 16+ provisioned (production) | Live DB connection | ☐ |
| 3.1.2 | PostgreSQL 16+ provisioned (staging) | Live DB connection | ☐ |
| 3.1.3 | PostgreSQL 16+ in Docker (development) | `docker-compose up` works | ☐ |
| 3.1.4 | Connection pooling (PgBouncer/Supavisor) | Pool config verified | ☐ |
| 3.1.5 | Read replica provisioned | Replica accessible | ☐ |
| 3.1.6 | TLS required for all connections | Connection test | ☐ |

### 3.2 Schema

| # | Item | Verified By | Status |
|---|---|---|---|
| 3.2.1 | All Prisma models have reserved columns (id, tenant_id, version, created_at, etc.) | Schema inspection | ☐ |
| 3.2.2 | UUID v7 primary keys | Schema inspection | ☐ |
| 3.2.3 | Soft delete columns (deleted_at, deleted_by) | Schema inspection | ☐ |
| 3.2.4 | Optimistic locking (version field) | Schema inspection | ☐ |
| 3.2.5 | Foreign key indexes on every FK | DB inspection | ☐ |
| 3.2.6 | Partial indexes for soft-deleted tables | DB inspection | ☐ |
| 3.2.7 | Row-Level Security enabled | RLS policy check | ☐ |
| 3.2.8 | Check constraints for business rules | DB inspection | ☐ |
| 3.2.9 | Audit log table append-only | RLS policy | ☐ |

### 3.3 Migrations

| # | Item | Verified By | Status |
|---|---|---|---|
| 3.3.1 | Initial migration applied to production | DB inspection | ☐ |
| 3.3.2 | Migration files in `prisma/migrations/` | Folder inspection | ☐ |
| 3.3.3 | Every migration has rollback SQL | Rollback tested | ☐ |
| 3.3.4 | Migrations forward-compatible (no downtime) | Tested in staging | ☐ |
| 3.3.5 | Migrations use `CONCURRENTLY` for new indexes | SQL inspection | ☐ |
| 3.3.6 | Seed scripts for reference data | Seed runs | ☐ |
| 3.3.7 | Seed scripts for default roles + permissions | Seed runs | ☐ |

### 3.4 Backups

| # | Item | Verified By | Status |
|---|---|---|---|
| 3.4.1 | PITR enabled (14-day retention) | Backup config | ☐ |
| 3.4.2 | Daily logical backup to S3 | Backup job runs | ☐ |
| 3.4.3 | Weekly logical backup (12-month retention) | Backup config | ☐ |
| 3.4.4 | Monthly logical backup to Glacier (7-year retention) | Backup config | ☐ |
| 3.4.5 | Backup encryption (SSE-KMS) | Encryption verified | ☐ |
| 3.4.6 | Daily restore-test job | Job runs, alerts on fail | ☐ |
| 3.4.7 | Weekly full restore to staging | Restore verified | ☐ |
| 3.4.8 | Cross-region backup replication | Replication verified | ☐ |

### 3.5 Observability

| # | Item | Verified By | Status |
|---|---|---|---|
| 3.5.1 | `pg_stat_statements` enabled | Extension check | ☐ |
| 3.5.2 | Slow query log (>500ms) | Log inspection | ☐ |
| 3.5.3 | Prometheus metrics exporter | Metrics scraped | ☐ |
| 3.5.4 | Database dashboard in Grafana | Dashboard exists | ☐ |
| 3.5.5 | Lock wait alerting | Alert fires on lock | ☐ |
| 3.5.6 | Connection pool monitoring | Dashboard shows pool | ☐ |

---

## 4. API

### 4.1 API Conformance

| # | Item | Verified By | Status |
|---|---|---|---|
| 4.1.1 | All endpoints under `/api/v1/` | Route inspection | ☐ |
| 4.1.2 | REST conventions (verbs, status codes) | API test | ☐ |
| 4.1.3 | Plural kebab-case URLs | Route inspection | ☐ |
| 4.1.4 | UUID v7 IDs in URLs | Route test | ☐ |
| 4.1.5 | Standard response envelope | API test | ☐ |
| 4.1.6 | Error codes namespaced | Error response test | ☐ |
| 4.1.7 | Pagination (offset + cursor) | List endpoint test | ☐ |
| 4.1.8 | Filtering (operator suffixes) | Filter test | ☐ |
| 4.1.9 | Sorting (`-field` for desc) | Sort test | ☐ |
| 4.1.10 | Bulk operations (max 100) | Bulk endpoint test | ☐ |
| 4.1.11 | Idempotency key support | Idempotency test | ☐ |
| 4.1.12 | Rate limiting (4 response headers) | Rate limit test | ☐ |
| 4.1.13 | CORS configured | CORS test | ☐ |
| 4.1.14 | ETag + conditional requests | Cache test | ☐ |
| 4.1.15 | gzip/Brotli compression | Compression test | ☐ |

### 4.2 Authentication

| # | Item | Verified By | Status |
|---|---|---|---|
| 4.2.1 | JWT auth on all endpoints (except login, health) | Unauth request → 401 | ☐ |
| 4.2.2 | Argon2id password hashing | Hash inspection | ☐ |
| 4.2.3 | 15-min access token TTL | Token inspection | ☐ |
| 4.2.4 | 30-day refresh token (httpOnly cookie) | Cookie inspection | ☐ |
| 4.2.5 | Refresh token rotation | Old token rejected | ☐ |
| 4.2.6 | Refresh token replay detection | Replay → session revoked | ☐ |
| 4.2.7 | MFA (TOTP) for admin/finance/recall | MFA flow tested | ☐ |
| 4.2.8 | Account lockout (5 attempts → 30-min) | Lockout test | ☐ |
| 4.2.9 | Password reset (token-based, 30-min TTL) | Reset flow tested | ☐ |
| 4.2.10 | JWT blocklist for compromised tokens | Blocklist test | ☐ |

### 4.3 Authorization

| # | Item | Verified By | Status |
|---|---|---|---|
| 4.3.1 | RBAC middleware on every endpoint | Permission test | ☐ |
| 4.3.2 | Row-level checks (user can only see own data) | Cross-user test | ☐ |
| 4.3.3 | Field-level response shaping | Sensitive field hidden | ☐ |
| 4.3.4 | Cross-tenant access blocked | Cross-tenant test | ☐ |
| 4.3.5 | Sensitive endpoints require MFA re-auth | Re-auth test | ☐ |
| 4.3.6 | All auth failures audit logged | Audit log check | ☐ |

### 4.4 API Documentation

| # | Item | Verified By | Status |
|---|---|---|---|
| 4.4.1 | OpenAPI 3.1 spec generated | `openapi.yaml` exists | ☐ |
| 4.4.2 | Every endpoint documented | Spec inspection | ☐ |
| 4.4.3 | TypeScript SDK auto-generated | `@suop/api-client` package | ☐ |
| 4.4.4 | API changelog maintained | `CHANGELOG.md` updated | ☐ |
| 4.4.5 | Swagger UI (dev only) | `/api/docs` works in dev | ☐ |

---

## 5. Security

### 5.1 Transport Security

| # | Item | Verified By | Status |
|---|---|---|---|
| 5.1.1 | TLS 1.3 enforced | SSL Labs A+ grade | ☐ |
| 5.1.2 | HSTS header (2-year, includeSubDomains, preload) | Header inspection | ☐ |
| 5.1.3 | Auto-renewing certificates | Renewal verified | ☐ |
| 5.1.4 | DB connection over TLS | Connection test | ☐ |
| 5.1.5 | Redis connection over TLS | Connection test | ☐ |

### 5.2 Application Security

| # | Item | Verified By | Status |
|---|---|---|---|
| 5.2.1 | All inputs validated by zod schema | Validation test | ☐ |
| 5.2.2 | SQL injection prevention (Prisma parameterized) | SAST scan | ☐ |
| 5.2.3 | XSS prevention (React auto-encoding, no dangerouslySetInnerHTML) | Code scan | ☐ |
| 5.2.4 | CSRF protection (SameSite cookies) | Cookie test | ☐ |
| 5.2.5 | SSRF prevention (URL allowlist + IP blocking) | Outbound URL test | ☐ |
| 5.2.6 | Content Security Policy header | Header inspection | ☐ |
| 5.2.7 | Security headers (nosniff, frame-deny, etc.) | Header inspection | ☐ |
| 5.2.8 | Sensitive column encryption (pgcrypto) | DB inspection | ☐ |
| 5.2.9 | Password pepper from secrets manager | Config inspection | ☐ |
| 5.2.10 | No secrets in code/git | Secret scan | ☐ |

### 5.3 Infrastructure Security

| # | Item | Verified By | Status |
|---|---|---|---|
| 5.3.1 | VPC with private subnets | Network config | ☐ |
| 5.3.2 | DB in isolated subnet (no internet) | Network config | ☐ |
| 5.3.3 | Security groups least privilege | SG inspection | ☐ |
| 5.3.4 | S3 buckets private (no public access) | Bucket policy | ☐ |
| 5.3.5 | S3 versioning enabled | Bucket config | ☐ |
| 5.3.6 | S3 cross-region replication | Replication check | ☐ |
| 5.3.7 | Container non-root user | Dockerfile inspection | ☐ |
| 5.3.8 | Container read-only filesystem | Container test | ☐ |
| 5.3.9 | Image scanning (Trivy) | CI scan passes | ☐ |
| 5.3.10 | SBOM generated per image | SBOM artifact | ☐ |

### 5.4 Security Testing

| # | Item | Verified By | Status |
|---|---|---|---|
| 5.4.1 | SAST on every PR (SonarQube) | CI passes | ☐ |
| 5.4.2 | Dependency scanning (Snyk + npm audit) | CI passes | ☐ |
| 5.4.3 | Secret scanning (git-secrets) | CI passes | ☐ |
| 5.4.4 | Container image scanning (Trivy) | CI passes | ☐ |
| 5.4.5 | Annual penetration test | Pen test report | ☐ |
| 5.4.6 | OWASP Top 10 coverage verified | Coverage doc | ☐ |

### 5.5 Audit & Compliance

| # | Item | Verified By | Status |
|---|---|---|---|
| 5.5.1 | All mutations audit logged | Audit log inspection | ☐ |
| 5.5.2 | Audit log immutable (RLS) | UPDATE/DELETE rejected | ☐ |
| 5.5.3 | Audit log hash chain | Hash verified | ☐ |
| 5.5.4 | Audit log retention (7 years) | Retention config | ☐ |
| 5.5.5 | FSSAI compliance (2-year records) | Retention verified | ☐ |
| 5.5.6 | GST compliance (6-year records) | Retention verified | ☐ |
| 5.5.7 | DPDP compliance (DSAR workflow) | DSAR test | ☐ |

---

## 6. DevOps

### 6.1 CI/CD

| # | Item | Verified By | Status |
|---|---|---|---|
| 6.1.1 | CI pipeline (lint, typecheck, test, build) | CI runs on PR | ☐ |
| 6.1.2 | CD pipeline (staging auto, production manual) | Deploy verified | ☐ |
| 6.1.3 | Blue-green deployment | Zero-downtime deploy | ☐ |
| 6.1.4 | Auto-rollback on smoke test failure | Rollback tested | ☐ |
| 6.1.5 | Migration tested in CI | Migration runs in CI | ☐ |
| 6.1.6 | All gates blocking | PR blocked on fail | ☐ |

### 6.2 Docker

| # | Item | Verified By | Status |
|---|---|---|---|
| 6.2.1 | Dockerfile.backend (multi-stage) | Build works | ☐ |
| 6.2.2 | Dockerfile.web (multi-stage, Next.js standalone) | Build works | ☐ |
| 6.2.3 | docker-compose.yml (full stack) | `docker-compose up` works | ☐ |
| 6.2.4 | Non-root user in containers | Container test | ☐ |
| 6.2.5 | Health check in Dockerfile | Health endpoint works | ☐ |

### 6.3 Infrastructure as Code

| # | Item | Verified By | Status |
|---|---|---|---|
| 6.3.1 | Terraform for all infrastructure | `terraform plan` works | ☐ |
| 6.3.2 | State in S3 backend with lock | State config | ☐ |
| 6.3.3 | Drift detection daily | Drift alert works | ☐ |
| 6.3.4 | Staging + production environments | Both deployable | ☐ |

### 6.4 Git Strategy

| # | Item | Verified By | Status |
|---|---|---|---|
| 6.4.1 | Branch protection on main + develop | Branch settings | ☐ |
| 6.4.2 | Signed commits required | Commit signatures | ☐ |
| 6.4.3 | PR review (1 for code, 2 for security) | PR template | ☐ |
| 6.4.4 | Squash & merge | Merge history | ☐ |
| 6.4.5 | Conventional commits enforced | Commit lint | ☐ |

---

## 7. Performance

### 7.1 API Performance

| # | Item | Verified By | Status |
|---|---|---|---|
| 7.1.1 | p95 latency targets met (per endpoint type) | Load test | ☐ |
| 7.1.2 | No N+1 queries | Query count test | ☐ |
| 7.1.3 | Cursor pagination for >100k row tables | API test | ☐ |
| 7.1.4 | Page size max 200 | API test | ☐ |
| 7.1.5 | ETag on GET responses | Header test | ☐ |
| 7.1.6 | gzip/Brotli enabled | Compression test | ☐ |

### 7.2 Database Performance

| # | Item | Verified By | Status |
|---|---|---|---|
| 7.2.1 | Every FK has an index | DB inspection | ☐ |
| 7.2.2 | EXPLAIN ANALYZE shows no seq scans >10k rows | Plan inspection | ☐ |
| 7.2.3 | Slow query log enabled (>500ms) | Log config | ☐ |
| 7.2.4 | Auto-vacuum tuned | Config inspection | ☐ |
| 7.2.5 | Partitioning for large tables (audit, ledger) | Partition check | ☐ |
| 7.2.6 | Cache hit ratio >95% | `pg_stat_database` | ☐ |

### 7.3 Frontend Performance

| # | Item | Verified By | Status |
|---|---|---|---|
| 7.3.1 | Lighthouse Performance ≥90 | Lighthouse run | ☐ |
| 7.3.2 | LCP <2.5s | Lighthouse | ☐ |
| 7.3.3 | FID <100ms | Lighthouse | ☐ |
| 7.3.4 | CLS <0.1 | Lighthouse | ☐ |
| 7.3.5 | Initial bundle <300KB gzipped | Bundle analyzer | ☐ |
| 7.3.6 | Per-route bundle <100KB gzipped | Bundle analyzer | ☐ |
| 7.3.7 | Code splitting per route | Bundle inspection | ☐ |
| 7.3.8 | Image optimization (Next.js Image) | Code inspection | ☐ |

### 7.4 Caching

| # | Item | Verified By | Status |
|---|---|---|---|
| 7.4.1 | Redis cache operational | Cache hit/miss metrics | ☐ |
| 7.4.2 | Reference data cached (1h TTL) | Cache test | ☐ |
| 7.4.3 | Master data cached (5min TTL) | Cache test | ☐ |
| 7.4.4 | Dashboard aggregations cached (5min TTL) | Cache test | ☐ |
| 7.4.5 | Cache hit rate >80% | Redis metrics | ☐ |
| 7.4.6 | Cache invalidation on update | Update → cache miss | ☐ |
| 7.4.7 | CDN configured (Cloudflare) | CDN test | ☐ |
| 7.4.8 | Static assets cached (1 year) | CDN config | ☐ |

### 7.5 Load Testing

| # | Item | Verified By | Status |
|---|---|---|---|
| 7.5.1 | Normal load test (100 users) passes | k6 run | ☐ |
| 7.5.2 | Peak load test (500 users) passes | k6 run | ☐ |
| 7.5.3 | Stress test (find breaking point) documented | Report exists | ☐ |
| 7.5.4 | Spike test passes | k6 run | ☐ |
| 7.5.5 | Soak test (8 hours) passes | k6 run | ☐ |
| 7.5.6 | Performance regression tests in CI | CI passes | ☐ |

---

## 8. Disaster Recovery

### 8.1 Backup & Recovery

| # | Item | Verified By | Status |
|---|---|---|---|
| 8.1.1 | Daily restore-test job | Job runs, alerts work | ☐ |
| 8.1.2 | Weekly full restore to staging | Restore verified | ☐ |
| 8.1.3 | Monthly DR failover drill | Drill report | ☐ |
| 8.1.4 | Annual full disaster simulation | Simulation report | ☐ |
| 8.1.5 | Glacier restore tested | Restore time documented | ☐ |

### 8.2 High Availability

| # | Item | Verified By | Status |
|---|---|---|---|
| 8.2.1 | Multi-AZ DB (primary + 2 replicas) | DB config | ☐ |
| 8.2.2 | Auto-failover for DB | Failover test | ☐ |
| 8.2.3 | Cross-region async replica | Replication lag <1min | ☐ |
| 8.2.4 | Multi-AZ backend (min 2 tasks) | ECS config | ☐ |
| 8.2.5 | Multi-AZ load balancer | ALB config | ☐ |
| 8.2.6 | Route53 health check + failover | DNS config | ☐ |

### 8.3 DR Documentation

| # | Item | Verified By | Status |
|---|---|---|---|
| 8.3.1 | 15 DR runbooks written | Runbook folder | ☐ |
| 8.3.2 | DR contact tree documented | Doc inspection | ☐ |
| 8.3.3 | BCP manual workaround procedures | BCP doc | ☐ |
| 8.3.4 | Communication templates drafted | Template folder | ☐ |
| 8.3.5 | Regulatory notification procedures | Doc inspection | ☐ |

### 8.4 DR Testing

| # | Item | Verified By | Status |
|---|---|---|---|
| 8.4.1 | Tabletop exercise (quarterly) | Exercise report | ☐ |
| 8.4.2 | DR failover drill (monthly) | Drill report | ☐ |
| 8.4.3 | Full restore test (weekly) | Test report | ☐ |
| 8.4.4 | Full BCP test (annual) | Test report | ☐ |
| 8.4.5 | Full disaster simulation (annual) | Simulation report | ☐ |

---

## 9. Monitoring & Observability

### 9.1 Metrics

| # | Item | Verified By | Status |
|---|---|---|---|
| 9.1.1 | Prometheus scraping backend | Metrics endpoint | ☐ |
| 9.1.2 | Grafana dashboards (system, DB, business) | Dashboards exist | ☐ |
| 9.1.3 | Database metrics (connections, latency, locks) | Dashboard | ☐ |
| 9.1.4 | Redis metrics (memory, hit rate) | Dashboard | ☐ |
| 9.1.5 | Business metrics (POs/day, GRNs/day, NCRs/day) | Dashboard | ☐ |

### 9.2 Logs

| # | Item | Verified By | Status |
|---|---|---|---|
| 9.2.1 | Structured JSON logs (Pino) | Log format | ☐ |
| 9.2.2 | Log aggregation (Loki or ELK) | Logs searchable | ☐ |
| 9.2.3 | Sensitive field redaction | Log inspection | ☐ |
| 9.2.4 | Log retention (30 days hot, 90 days warm) | Retention config | ☐ |
| 9.2.5 | Correlation ID in every log line | Log inspection | ☐ |

### 9.3 Tracing

| # | Item | Verified By | Status |
|---|---|---|---|
| 9.3.1 | OpenTelemetry instrumentation | Trace export | ☐ |
| 9.3.2 | Traces exported to Tempo/Jaeger | Trace inspection | ☐ |
| 9.3.3 | 100% error traces captured | Trace test | ☐ |
| 9.3.4 | 10% normal traces sampled | Sampling config | ☐ |

### 9.4 Alerting

| # | Item | Verified By | Status |
|---|---|---|---|
| 9.4.1 | PagerDuty integration (critical alerts) | Test page | ☐ |
| 9.4.2 | Slack integration (warning alerts) | Test alert | ☐ |
| 9.4.3 | High error rate alert (>5% for 5min) | Alert test | ☐ |
| 9.4.4 | Service down alert | Alert test | ☐ |
| 9.4.5 | DB down alert | Alert test | ☐ |
| 9.4.6 | High latency alert (p95 >1s for 10min) | Alert test | ☐ |
| 9.4.7 | Disk space alert (>80%) | Alert test | ☐ |
| 9.4.8 | Business alerts (NCR critical, recall, CAPA overdue) | Alert test | ☐ |
| 9.4.9 | Security alerts (failed login spike, permission denied spike) | Alert test | ☐ |
| 9.4.10 | Alert fatigue prevention (grouping, inhibition) | Config verified | ☐ |

### 9.5 Error Tracking

| # | Item | Verified By | Status |
|---|---|---|---|
| 9.5.1 | Sentry integration | Errors captured | ☐ |
| 9.5.2 | Source maps uploaded | Stack traces readable | ☐ |
| 9.5.3 | Release tracking | Releases tagged in Sentry | ☐ |
| 9.5.4 | Frontend errors captured | Error test | ☐ |

### 9.6 Uptime Monitoring

| # | Item | Verified By | Status |
|---|---|---|---|
| 9.6.1 | External uptime monitor (Pingdom/UptimeRobot) | Monitor configured | ☐ |
| 9.6.2 | Synthetic transaction monitoring (Checkly) | Synthetics run | ☐ |
| 9.6.3 | Status page (public) | `status.sudhamrit.com` live | ☐ |
| 9.6.4 | Real User Monitoring (Sentry Performance) | RUM data flowing | ☐ |

---

## 10. Testing

### 10.1 Test Infrastructure

| # | Item | Verified By | Status |
|---|---|---|---|
| 10.1.1 | Vitest configured | `bun run test:unit` works | ☐ |
| 10.1.2 | Testcontainers configured | Integration tests run | ☐ |
| 10.1.3 | Playwright configured | E2E tests run | ☐ |
| 10.1.4 | k6 configured | Load tests run | ☐ |
| 10.1.5 | Test database isolated | Tests don't pollute | ☐ |

### 10.2 Test Coverage

| # | Item | Verified By | Status |
|---|---|---|---|
| 10.2.1 | Foundation code coverage ≥90% | Coverage report | ☐ |
| 10.2.2 | Business code coverage ≥70% | Coverage report | ☐ |
| 10.2.3 | Coverage gate in CI | CI fails below threshold | ☐ |
| 10.2.4 | Mutation tests (Stryker) on foundation | Mutation score ≥80% | ☐ |

### 10.3 Test Types

| # | Item | Verified By | Status |
|---|---|---|---|
| 10.3.1 | Unit tests for every service method | Test count | ☐ |
| 10.3.2 | Unit tests for every workflow transition | Test count | ☐ |
| 10.3.3 | Integration tests for every endpoint | Test count | ☐ |
| 10.3.4 | E2E tests for top 20 user journeys | Test count | ☐ |
| 10.3.5 | Performance regression tests | Nightly run | ☐ |
| 10.3.6 | Contract tests (frontend ↔ backend) | CI passes | ☐ |
| 10.3.7 | Smoke tests post-deploy | Deploy triggers tests | ☐ |

---

## 11. First Business Journey (Procure-to-Receive)

### 11.1 Organization Module

| # | Item | Verified By | Status |
|---|---|---|---|
| 11.1.1 | Schema migrated | DB inspection | ☐ |
| 11.1.2 | Repository implemented | Code inspection | ☐ |
| 11.1.3 | Service with business rules | Code inspection | ☐ |
| 11.1.4 | Workflow (Plant lifecycle) | State machine test | ☐ |
| 11.1.5 | API endpoints (CRUD + workflow) | API tests | ☐ |
| 11.1.6 | Frontend wired to API | UI test | ☐ |
| 11.1.7 | RBAC enforced | Permission test | ☐ |
| 11.1.8 | Audit logging | Audit log check | ☐ |
| 11.1.9 | Notifications (plant activation) | Notification test | ☐ |
| 11.1.10 | Unit + integration tests | Tests pass | ☐ |

### 11.2 Auth & RBAC Module

| # | Item | Verified By | Status |
|---|---|---|---|
| 11.2.1 | Schema migrated | DB inspection | ☐ |
| 11.2.2 | Real auth (Argon2id + JWT) | Auth test | ☐ |
| 11.2.3 | MFA (TOTP) | MFA test | ☐ |
| 11.2.4 | Refresh token rotation | Rotation test | ☐ |
| 11.2.5 | User lifecycle state machine | Workflow test | ☐ |
| 11.2.6 | RBAC middleware on every endpoint | Permission test | ☐ |
| 11.2.7 | Frontend login wired to real API | Login test | ☐ |
| 11.2.8 | RBAC UI (roles, permissions) wired | UI test | ☐ |
| 11.2.9 | Audit logging (login, logout, permission changes) | Audit check | ☐ |
| 11.2.10 | Notifications (welcome, password reset) | Notification test | ☐ |
| 11.2.11 | Tests (90%+ coverage) | Coverage report | ☐ |

### 11.3-11.12 — Remaining 10 Modules

(Same 10-point checklist per module: Organization, Auth, Supplier, Product, Purchase Order, GRN, IQC, Quality Hold, Inventory, Barcode, Stock Ledger, Warehouse Available Stock)

| Module | DB | Repo | Service | Workflow | API | Frontend | RBAC | Audit | Notifications | Tests | Done |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Organization | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Auth & RBAC | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Supplier | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Product | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Purchase Order | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| GRN | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| IQC | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Quality Hold | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Inventory | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Barcode | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Stock Ledger | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Warehouse Stock | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

---

## 12. Production Launch Readiness

### 12.1 Final Pre-Launch

| # | Item | Verified By | Status |
|---|---|---|---|
| 12.1.1 | Production environment provisioned | Terraform applied | ☐ |
| 12.1.2 | DNS configured | DNS lookup works | ☐ |
| 12.1.3 | TLS certificate valid | SSL Labs test | ☐ |
| 12.1.4 | All env vars set in secrets manager | Config check | ☐ |
| 12.1.5 | Database migrated | Migration applied | ☐ |
| 12.1.6 | Seed data loaded (roles, permissions, reference data) | Seed runs | ☐ |
| 12.1.7 | Initial tenant + admin user created | Login test | ☐ |
| 12.1.8 | Smoke tests pass on production | Test run | ☐ |
| 12.1.9 | Monitoring alerts firing | Alert test | ☐ |
| 12.1.10 | Status page live | Page accessible | ☐ |
| 12.1.11 | Backup jobs scheduled | Jobs run | ☐ |
| 12.1.12 | DR drill completed | Drill report | ☐ |
| 12.1.13 | On-call rotation set up | PagerDuty schedule | ☐ |
| 12.1.14 | Customer support trained | Training complete | ☐ |
| 12.1.15 | Documentation for end users | User guide exists | ☐ |

### 12.2 Sign-off

| Role | Name | Signature | Date |
|---|---|---|---|
| Project Owner | | | |
| Lead Architect | | | |
| Engineering Lead | | | |
| Operations Lead | | | |
| Security Lead | | | |
| QA Lead | | | |

---

## Final Production Readiness Score

**Calculation:**
- Total checkboxes: ~350
- Each checkbox worth ~0.285%
- Production Ready % = (checked / total) × 100

**Status:**
- ☐ 0% — Documentation phase
- ☐ 25% — Foundation framework complete
- ☐ 50% — First business journey complete
- ☐ 75% — All modules wired
- ☐ 90% — Testing + monitoring complete
- ☐ 100% — Production ready (sign-off required)

**Target: 100% before any code is "done"**

---

## Approval Block

By approving this checklist, the Project Owner authorizes:

1. **Permanent freeze** of all architecture documentation
2. **No additional documentation** unless explicitly requested
3. **All future responses contain production code only**
4. Implementation begins with Phase 0 Foundation code

**Approved by:** ______________________  **Date:** ___________

**Signature:** ______________________

**Once approved, the documentation phase is permanently frozen. Implementation begins.**

---

*End of Final Production Readiness Checklist*

# SUOP ERP — Technical Debt Register (v1.0)

**Document Version**: 1.0
**Frozen At**: 2026-07-11
**Phase**: 9B — Architecture Freeze
**Status**: 🔒 FROZEN (debt items tracked, not removed)

> This document is the authoritative register of all known technical debt. Each item has an ID, severity, owner, and remediation plan. Items are not "bugs" — they are deliberate trade-offs or deferred work.

---

## Severity Definitions

| Severity | Definition | SLA |
|---|---|---|
| 🔴 **Critical** | Blocks production or causes data loss risk | Fix before production |
| 🟠 **High** | Significant impact on maintainability or security | Fix within 1 sprint |
| 🟡 **Medium** | Moderate impact, workaround exists | Fix within 3 sprints |
| 🟢 **Low** | Minor inconvenience, no functional impact | Fix when convenient |
| 🔵 **Future** | Architectural decision deferred to future phase | Track for future planning |

---

## Critical (🔴)

### TD-C001: No Git Branch Protection
- **ID**: TD-C001
- **Severity**: 🔴 Critical
- **Category**: DevOps / Security
- **Description**: The `main` branch on GitHub has no protection rules. Anyone with push access can force-push or commit directly.
- **Impact**: A single bad commit or force-push could destroy the repository (same failure mode as the original Phase 1-8 loss).
- **Remediation**: Apply branch protection rules documented in `docs/BRANCH_PROTECTION_RECOMMENDATIONS.md` (2 approvals, 7 required CI checks, no admin bypass).
- **Effort**: 30 minutes (manual via GitHub UI)
- **Status**: ⏳ Awaiting user action (recommendations generated, not applied)

### TD-C002: No Offsite Backup Beyond GitHub
- **ID**: TD-C002
- **Severity**: 🔴 Critical
- **Category**: Disaster Recovery
- **Description**: The only offsite backup is GitHub. If GitHub is unavailable or the account is compromised, there is no fallback.
- **Impact**: Total repository loss if GitHub fails.
- **Remediation**: Set up secondary backup (e.g., GitLab mirror, local bare clone on separate server, scheduled `git bundle` to S3).
- **Effort**: 2 hours
- **Status**: 🔲 Not started

### TD-C003: Coverage Thresholds Failing
- **ID**: TD-C003
- **Severity**: 🔴 Critical
- **Category**: Quality
- **Description**: 3 of 4 coverage thresholds fail (statements 47% vs 55%, functions 64% vs 70%, lines 47% vs 55%). CI is configured to warn but not block.
- **Impact**: Bugs in untested code (middleware, routes, DB layer) could ship undetected.
- **Remediation**: Either (a) add middleware/route/DB unit tests to lift coverage to 55%+, or (b) lower thresholds to current actual levels to unblock CI gating.
- **Effort**: 2-3 days (option a) or 5 minutes (option b)
- **Status**: ⏳ Documented in `docs/RECOVERY_HARDENING_TASK2_COVERAGE.md`

---

## High (🟠)

### TD-H001: `src/app/page.tsx` is 37,080 Lines
- **ID**: TD-H001
- **Severity**: 🟠 High
- **Category**: Frontend / Maintainability
- **Description**: The Next.js main page file contains 37,080 lines of code with 120+ modules. This is a monolith that is extremely difficult to maintain.
- **Impact**: Slow IDE performance, merge conflicts, difficult testing, no code splitting.
- **Remediation**: Refactor into route-per-module structure (`app/(dashboard)/organization/page.tsx`, `app/(dashboard)/procurement/page.tsx`, etc.). Use server components for data fetching.
- **Effort**: 3-5 days
- **Status**: 🔲 Not started (planned for post-Phase 9)

### TD-H002: Frontend Uses Mock Data
- **ID**: TD-H002
- **Severity**: 🟠 High
- **Category**: Frontend / Integration
- **Description**: The frontend `src/modules/*/components/*.tsx` use hardcoded mock data instead of calling the backend API. The API clients (`src/modules/*/api/client.ts`) exist but are not wired to the components.
- **Impact**: Frontend cannot be used against a real backend. No end-to-end testing possible.
- **Remediation**: Wire API clients to React Query hooks in each module component. Replace mock data with `useQuery` calls.
- **Effort**: 2-3 days
- **Status**: 🔲 Not started (planned for post-Phase 9)

### TD-H003: No Frontend Tests
- **ID**: TD-H003
- **Severity**: 🟠 High
- **Category**: Frontend / Quality
- **Description**: No Jest, Vitest, or Playwright tests exist for the frontend.
- **Impact**: Frontend regressions go undetected. No E2E coverage.
- **Remediation**: Add Vitest for unit tests, Playwright for E2E tests. Start with critical paths (login, navigation, CRUD operations).
- **Effort**: 3-5 days (initial setup + smoke tests)
- **Status**: 🔲 Not started

### TD-H004: No Rate Limiting
- **ID**: TD-H004
- **Severity**: 🟠 High
- **Category**: Security
- **Description**: The backend has no rate limiting middleware. Public endpoints (`/auth/login`, `/auth/forgot-password`) are vulnerable to brute force.
- **Impact**: Brute force attacks on login, denial of service via API flooding.
- **Remediation**: Add rate limiting middleware using Redis-backed token bucket or sliding window. Apply per-IP for public endpoints, per-user for authenticated endpoints.
- **Effort**: 1 day
- **Status**: 🔲 Not started (planned before production)

### TD-H005: No OpenAPI/Swagger Documentation
- **ID**: TD-H005
- **Severity**: 🟠 High
- **Category**: Documentation / API
- **Description**: The 89 REST endpoints are documented in `docs/API_BASELINE.md` (manual) but there is no machine-readable OpenAPI/Swagger spec.
- **Impact**: Frontend/mobile teams cannot auto-generate clients. No interactive API explorer.
- **Remediation**: Generate OpenAPI spec from Hono routes using `@hono/zod-openapi` or manual `swagger.json`. Serve at `/api/v1/docs`.
- **Effort**: 2 days
- **Status**: 🔲 Not started

### TD-H006: CI/CD Workflow Not Yet Triggered on GitHub
- **ID**: TD-H006
- **Severity**: 🟠 High
- **Category**: DevOps
- **Description**: The workflow file (`.github/workflows/ci-cd.yml`) is committed but has not yet run on GitHub Actions. The token used for pushing lacks the `Workflows` scope, so the workflow file was added in a separate commit.
- **Impact**: CI pipeline status is unknown. Branch protection cannot require CI checks until they run at least once.
- **Remediation**: Trigger a workflow run (push to `develop` or open a PR). Verify all 7 jobs pass. Then add required status checks to branch protection.
- **Effort**: 30 minutes
- **Status**: ⏳ Awaiting first trigger

---

## Medium (🟡)

### TD-M001: Business Tables Not in Prisma Schema
- **ID**: TD-M001
- **Severity**: 🟡 Medium
- **Category**: Database / ORM
- **Description**: Only 10 Phase 0 foundation models are in `prisma/schema.prisma`. The 50 business module tables (organization, auth, product, supplier, etc.) exist only in raw SQL migrations and are accessed via raw SQL queries.
- **Impact**: No type safety for business entities. Manual SQL is error-prone. Cannot use Prisma's query builder, relations, or migrations for these tables.
- **Remediation**: Add all 60 tables to `prisma/schema.prisma`. Run `prisma db pull` to introspect, then clean up. Replace raw SQL in repositories with Prisma client calls.
- **Effort**: 3-5 days
- **Status**: 🔲 Not started (planned for Phase 10+)

### TD-M002: No Migration Down/Rollback Scripts
- **ID**: TD-M002
- **Severity**: 🟡 Medium
- **Category**: Database / Operations
- **Description**: Migrations are forward-only. There are no rollback scripts. If a migration breaks production, there is no automated way to revert.
- **Impact**: Risky production deploys. Manual SQL required to roll back.
- **Remediation**: Either (a) write down-migrations for each migration, or (b) adopt a "forward-fix" policy (bad migration = new migration that fixes it) and document the rollback procedure.
- **Effort**: 1 day (policy + template) or 5 days (all down-migrations)
- **Status**: 🔲 Not started

### TD-M003: No Database Connection Pooling Verification
- **ID**: TD-M003
- **Severity**: 🟡 Medium
- **Category**: Performance / Database
- **Description**: Prisma's connection pool is configured (`DATABASE_POOL_SIZE`) but not load-tested. No PgBouncer or connection pooling proxy in production architecture.
- **Impact**: Under high concurrency, database connections may be exhausted.
- **Remediation**: Load test with k6 or Artillery. Add PgBouncer in transaction pooling mode for production. Verify pool size is appropriate.
- **Effort**: 1-2 days
- **Status**: 🔲 Not started (planned before production)

### TD-M004: Audit Log Retention Policy Undefined
- **ID**: TD-M004
- **Severity**: 🟡 Medium
- **Category**: Compliance / Operations
- **Description**: The `audit_logs` table grows unboundedly. No retention or archival policy is defined.
- **Impact**: Table will grow to billions of rows, degrading query performance. Compliance requirements (7-year retention for financial audit) not enforced.
- **Remediation**: Define retention policy (e.g., 7 years for financial, 1 year for general). Implement archival job that moves old records to cold storage (S3 Parquet).
- **Effort**: 2 days
- **Status**: 🔲 Not started

### TD-M005: Event Outbox Not Consumed by Background Job
- **ID**: TD-M005
- **Severity**: 🟡 Medium
- **Category**: Architecture / Reliability
- **Description**: The `event_outbox` table exists (for durable event delivery) but no background job consumes it. Events are published in-process only.
- **Impact**: Events are lost if the process crashes between publish and handling. No at-least-once delivery guarantee.
- **Remediation**: Implement a background job (`core/jobs/`) that polls `event_outbox`, delivers to external systems (webhooks, message queue), and marks as processed.
- **Effort**: 2 days
- **Status**: 🔲 Not started

### TD-M006: No CSRF Protection
- **ID**: TD-M006
- **Severity**: 🟡 Medium
- **Category**: Security
- **Description**: The API uses JWT Bearer tokens (not cookies), so CSRF is not directly applicable. However, if cookie-based auth is added for the frontend, CSRF protection will be needed.
- **Impact**: Currently none (JWT in Authorization header is CSRF-safe). Future risk if auth strategy changes.
- **Remediation**: Document the JWT-based CSRF-safe approach. If cookies are added, implement double-submit cookie or SameSite=Strict.
- **Effort**: 2 hours (documentation) or 1 day (if cookies added)
- **Status**: 🔲 Not applicable yet (track for future)

### TD-M007: No Secret Rotation Procedure
- **ID**: TD-M007
- **Severity**: 🟡 Medium
- **Category**: Security / Operations
- **Description**: `JWT_SECRET` and `PASSWORD_PEPPER` have no rotation procedure. If compromised, rotation requires invalidating all sessions.
- **Impact**: Inability to respond to a secret compromise without full user logout.
- **Remediation**: Implement multi-key support (old + new key both valid during rotation window). Document rotation runbook.
- **Effort**: 2 days
- **Status**: 🔲 Not started

---

## Low (🟢)

### TD-L001: Prisma Schema Has Only 10 Models
- **ID**: TD-L001
- **Severity**: 🟢 Low
- **Category**: Database
- **Description**: Related to TD-M001 but specifically: the Prisma schema is sparse. Type safety is limited to foundation tables.
- **Impact**: Minor — raw SQL works, just less ergonomic.
- **Remediation**: Same as TD-M001.
- **Status**: Tracked under TD-M001

### TD-L002: No Pre-commit Hooks
- **ID**: TD-L002
- **Severity**: 🟢 Low
- **Category**: Developer Experience
- **Description**: No `husky` + `lint-staged` pre-commit hooks. Developers can commit code that fails lint or typecheck.
- **Impact**: CI catches issues, but local feedback is slower.
- **Remediation**: Add `husky` + `lint-staged` to run ESLint + `tsc --noEmit` on staged files.
- **Effort**: 1 hour
- **Status**: 🔲 Not started

### TD-L003: No Prettier Configuration
- **ID**: TD-L003
- **Severity**: 🟢 Low
- **Category**: Code Style
- **Description**: No `.prettierrc` file. Code formatting is enforced only by ESLint rules.
- **Impact**: Inconsistent formatting across files.
- **Remediation**: Add Prettier config, integrate with ESLint (`eslint-config-prettier`).
- **Effort**: 30 minutes
- **Status**: 🔲 Not started

### TD-L004: TypeScript Path Aliases Not Enforced for Module Isolation
- **ID**: TD-L004
- **Severity**: 🟢 Low
- **Category**: Architecture
- **Description**: Path aliases (`@/core/*`, `@/modules/*`) exist but no ESLint rule enforces module boundaries. A module could import another module's repository directly.
- **Impact**: Architecture violations go undetected until code review.
- **Remediation**: Add `eslint-plugin-import` with `no-restricted-paths` rule to enforce layer boundaries.
- **Effort**: 2 hours
- **Status**: 🔲 Not started

### TD-L005: No Dockerfile for Backend
- **ID**: TD-L005
- **Severity**: 🟢 Low
- **Category**: DevOps
- **Description**: No `Dockerfile` exists for the backend service. The CI workflow has a `docker` job but no Dockerfile to build.
- **Impact**: Cannot containerize the backend for production deployment.
- **Remediation**: Create `apps/backend/Dockerfile` (multi-stage: build with Bun, runtime with Bun slim).
- **Effort**: 2 hours
- **Status**: 🔲 Not started

### TD-L006: No Health Check Endpoint
- **ID**: TD-L006
- **Severity**: 🟢 Low
- **Category**: Operations
- **Description**: No `/health` or `/ready` endpoint for Kubernetes liveness/readiness probes.
- **Impact**: Container orchestrators cannot verify backend health.
- **Remediation**: Add `GET /health` (returns 200 if process alive) and `GET /ready` (returns 200 if DB + Redis connected).
- **Effort**: 1 hour
- **Status**: 🔲 Not started

### TD-L007: Worklog Committed to Git
- **ID**: TD-L007
- **Severity**: 🟢 Low
- **Category**: Repository Hygiene
- **Description**: `worklog.md` (3,000+ lines of agent work logs) is committed to the repository. This is operational metadata, not source code.
- **Impact**: Repo size grows with each session. Noisy git history.
- **Remediation**: Move `worklog.md` to a separate ops repository or exclude from git (keep locally).
- **Effort**: 30 minutes
- **Status**: 🔲 Not started

### TD-L008: No Environment-Based Logging Configuration
- **ID**: TD-L008
- **Severity**: 🟢 Low
- **Category**: Operations
- **Description**: Pino logger uses `LOG_LEVEL` from env but does not configure log transport (JSON for prod, pretty for dev) automatically based on `NODE_ENV`.
- **Impact**: Logs may be hard to parse in production or too verbose in development.
- **Remediation**: Update `core/logging/logger.ts` to auto-configure transport based on `NODE_ENV`.
- **Effort**: 1 hour
- **Status**: 🔲 Not started

---

## Future (🔵)

### TD-F001: Multi-Region Deployment
- **ID**: TD-F001
- **Severity**: 🔵 Future
- **Category**: Architecture
- **Description**: Current architecture assumes single-region deployment. No multi-region strategy.
- **Impact**: Cannot serve users in multiple regions with low latency. No disaster recovery if a region fails.
- **Remediation**: Design multi-region active-active or active-passive architecture. Consider CockroachDB or PostgreSQL with logical replication.
- **Effort**: 2-4 weeks
- **Status**: 🔲 Deferred to v2.0

### TD-F002: GraphQL API Layer
- **ID**: TD-F002
- **Severity**: 🔵 Future
- **Category**: API
- **Description**: Only REST API exists. No GraphQL layer for flexible client queries.
- **Impact**: Mobile and frontend clients must make multiple REST calls for complex views.
- **Remediation**: Add GraphQL gateway (Apollo Server or Yoga) that wraps the REST API or reads directly from the database.
- **Effort**: 1-2 weeks
- **Status**: 🔲 Deferred to v2.0 (evaluate demand first)

### TD-F003: Event Sourcing for Audit Logs
- **ID**: TD-F003
- **Severity**: 🔵 Future
- **Category**: Architecture
- **Description**: Audit logs are stored as snapshots (before/after JSON). No event sourcing pattern.
- **Impact**: Cannot reconstruct entity state at arbitrary point in time. Limited temporal queries.
- **Remediation**: Migrate audit log to event sourcing pattern. Store events, project to current state.
- **Effort**: 2-3 weeks
- **Status**: 🔲 Deferred (evaluate compliance requirement)

### TD-F004: AI-Powered Demand Forecasting
- **ID**: TD-F004
- **Severity**: 🔵 Future
- **Category**: Features
- **Description**: No demand forecasting or predictive analytics. Feature flag `FEATURE_AI_PREDICTIVE_QUALITY` exists but is not implemented.
- **Impact**: No ML-based inventory optimization or quality prediction.
- **Remediation**: Build ML pipeline (Python + scikit-learn / TensorFlow) that consumes historical sales + quality data. Expose predictions via API.
- **Effort**: 4-6 weeks
- **Status**: 🔲 Deferred to v2.0

### TD-F005: Mobile App API Integration
- **ID**: TD-F005
- **Severity**: 🔵 Future
- **Category**: Mobile
- **Description**: The React Native mobile app exists but is not integrated with the backend API. It uses mock data.
- **Impact**: Mobile app is non-functional for real users.
- **Remediation**: Wire mobile app to backend API. Implement OAuth2 PKCE flow for mobile authentication. Add push notifications.
- **Effort**: 2-3 weeks
- **Status**: 🔲 Deferred to post-Phase 9

### TD-F006: Multi-Currency Support
- **ID**: TD-F006
- **Severity**: 🔵 Future
- **Category**: Features
- **Description**: `reference_currencies` table exists but no multi-currency transaction support. All amounts assumed to be in base currency.
- **Impact**: Cannot handle international suppliers/customers with different currencies.
- **Remediation**: Add currency conversion, multi-currency pricing, and FX gain/loss accounting.
- **Effort**: 1-2 weeks
- **Status**: 🔲 Deferred to Finance phase (Phase 13)

### TD-F007: Localization (i18n)
- **ID**: TD-F007
- **Severity**: 🔵 Future
- **Category**: Features
- **Description**: No internationalization. All UI text and error messages are in English.
- **Impact**: Cannot serve non-English speaking users.
- **Remediation**: Add `next-intl` (frontend) + backend error message catalog. Support Hindi + English initially.
- **Effort**: 1 week
- **Status**: 🔲 Deferred to v2.0

---

## Summary

| Severity | Count | Items |
|---|---|---|
| 🔴 Critical | 3 | TD-C001, TD-C002, TD-C003 |
| 🟠 High | 6 | TD-H001 through TD-H006 |
| 🟡 Medium | 7 | TD-M001 through TD-M007 |
| 🟢 Low | 8 | TD-L001 through TD-L008 |
| 🔵 Future | 7 | TD-F001 through TD-F007 |
| **Total** | **31** | |

## Remediation Priority

1. **Immediate (before production)**: TD-C001, TD-C002, TD-C003, TD-H004, TD-H006, TD-L005, TD-L006
2. **Next sprint**: TD-H001, TD-H002, TD-H003, TD-H005, TD-L002, TD-L003
3. **Next quarter**: TD-M001 through TD-M007, TD-L004, TD-L007, TD-L008
4. **Future versions**: TD-F001 through TD-F007

---

*This document is FROZEN as of Phase 9B. New debt items must be added with a unique ID and severity.*

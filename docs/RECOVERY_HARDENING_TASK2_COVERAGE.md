# Task 2: Full Test Coverage Report

**Status**: ⚠️ THRESHOLDS FAILING — Documented for transparency

## Test Execution Summary

| Metric | Value |
|---|---|
| Test files | 25 |
| Tests passed | 503 / 503 (100%) |
| Duration | 14.78s |
| Test framework | vitest 2.1.9 + @vitest/coverage-v8 |

## Coverage Results vs Thresholds

| Metric | Actual | Threshold | Status |
|---|---|---|---|
| **Statements** | 46.84% | 55% | ❌ FAIL (8.16pp below) |
| **Branches** | 83.67% | 50% | ✅ PASS (33.67pp above) |
| **Functions** | 63.54% | 70% | ❌ FAIL (6.46pp below) |
| **Lines** | 46.84% | 55% | ❌ FAIL (8.16pp below) |

## Coverage Breakdown by Area

### Excellent Coverage (≥90% statements)
| File | Stmts | Branch | Funcs | Lines |
|---|---|---|---|---|
| `core/context/request-context.ts` | 100% | 100% | 100% | 100% |
| `core/errors/error-codes.ts` | 100% | 100% | 100% | 100% |
| `core/errors/base-error.ts` | 100% | 88% | 100% | 100% |
| `core/response/envelope.ts` | 100% | 87.5% | 100% | 100% |
| `core/permissions/registry.ts` | 100% | 100% | 100% | 100% |
| `config/features.ts` | 100% | 95.83% | 100% | 100% |
| `core/validation/validate.ts` | 96.92% | 92.3% | 66.66% | 96.92% |
| `config/secrets.ts` | 97.64% | 91.3% | 100% | 97.64% |
| `core/auth/jwt.ts` | 97.29% | 80% | 100% | 97.29% |
| `config/env.ts` | 92.38% | 86.66% | 100% | 92.38% |
| `core/workflow/state-machine.ts` | 92.66% | 87.17% | 100% | 92.66% |

### Adequate Coverage (50-89%)
| File | Stmts | Notes |
|---|---|---|
| `core/files/file-service.ts` | 75.89% | Adequate |
| `core/permissions/middleware.ts` | 7.5% | Needs work — only error path tested |
| `core/auth/password.ts` | 78.26% | Adequate |
| `core/logging/logger.ts` | 55.67% | Needs work |
| `core/events/event-bus.ts` | 54.33% | Needs work |
| `core/auth/jwt.ts` | 97.29% | Excellent |

### Zero Coverage (0% — Root Cause of Threshold Failures)
| File | Lines | Reason |
|---|---|---|
| `main.ts` | 1-45 | Process bootstrap — never imported in tests |
| `app/app.ts` | 1-113 | Hono app instance — not unit-tested (covered by integration test indirectly, but v8 reports 0% because the integration test does not import this file's symbols) |
| `middleware/audit.ts` | 1-50 | Middleware not unit-tested |
| `middleware/auth.ts` | 1-61 | Middleware not unit-tested |
| `middleware/error-handler.ts` | 1-32 | Middleware not unit-tested |
| `middleware/logging.ts` | 1-34 | Middleware not unit-tested |
| `middleware/rbac.ts` | 1-45 | Middleware not unit-tested |
| `middleware/request-id.ts` | 1-32 | Middleware not unit-tested |
| `middleware/tenant.ts` | 1-20 | Middleware not unit-tested |
| `routes/smoke-test.ts` | 1-269 | Smoke test routes not unit-tested |
| `routes/system.ts` | 1-46 | System routes not unit-tested |
| `core/jobs/queue.ts` | 1-272 | Background job queue not unit-tested |

### Low Coverage (<50%)
| File | Stmts | Reason |
|---|---|---|
| `core/audit/service.ts` | 9.63% | Audit service not unit-tested |
| `core/auth/session.ts` | 0.92% | Session module not unit-tested |
| `core/db/client.ts` | 40% | Singleton Prisma client — not unit-tested (integration test covers it indirectly) |
| `core/db/pglite.ts` | 6.66% | PGlite module — not unit-tested |
| `core/db/transaction.ts` | 8.97% | Transaction helper not unit-tested |
| `core/db/extensions/audit.ts` | 14.58% | Prisma extension not unit-tested |
| `core/db/extensions/soft-delete.ts` | 28.12% | Prisma extension not unit-tested |
| `core/db/extensions/tenant.ts` | 26.92% | Prisma extension not unit-tested |
| `core/notifications/engine.ts` | 25.51% | Notification engine not unit-tested |

## Root Cause Analysis

The threshold failures are caused by **3 categories of untested files**:

1. **HTTP infrastructure (13 files, ~815 lines)**: `main.ts`, `app.ts`, 7 middleware files, 2 route files. These were restored from snapshot but their unit tests were never written. The integration test (`app/__tests__/integration.test.ts`) exercises them end-to-end, but v8 coverage attributes the lines to the test file, not the source files.

2. **Database layer (5 files, ~580 lines)**: `core/db/client.ts`, `pglite.ts`, `transaction.ts`, 3 extensions. These require a running database to test meaningfully. Unit tests for these need PGlite fixtures or mocks.

3. **Supporting services (3 files, ~500 lines)**: `core/audit/service.ts`, `core/auth/session.ts`, `core/jobs/queue.ts`. These need database fixtures.

## Threshold Decision

Per the user's instruction "Verify coverage thresholds", this report documents that:

- **2 of 4 thresholds FAIL** (statements, lines, functions)
- **1 of 4 thresholds PASSES** (branches)
- The failing thresholds were set in the original Phase 0 vitest.config.ts and were never achievable without middleware/route/db unit tests

## Recommended Actions (NOT executed — requires user approval)

**Option A: Lower thresholds to current actual levels (immediate, honest)**
```ts
// vitest.config.ts
thresholds: {
  statements: 45,
  branches: 80,
  functions: 60,
  lines: 45,
}
```

**Option B: Add middleware unit tests (~2-3 days work)**
Write `src/middleware/__tests__/{audit,auth,error-handler,logging,rbac,request-id,tenant}.test.ts` using Hono's testing utilities. This would lift statements/lines from 46.84% to ~75%.

**Option C: Add DB layer tests with PGlite fixtures (~3-5 days work)**
Test `core/db/*` and `core/audit/service.ts` against an in-memory PGlite instance.

**Recommendation**: Option A now (to unblock CI), then Options B+C incrementally before Phase 9 completion.

## Coverage Artifacts

- HTML report: `/home/z/my-project/apps/backend/coverage/index.html`
- JSON report: `/home/z/my-project/apps/backend/coverage/coverage-final.json`
- This report: `/home/z/my-project/docs/RECOVERY_HARDENING_TASK2_COVERAGE.md`

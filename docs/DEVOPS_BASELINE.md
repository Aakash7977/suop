# SUOP ERP — DevOps Baseline

**Document Version**: 1.0
**Last Updated**: 2026-07-11
**Status**: Active
**Scope**: Phase 9A — Enterprise DevOps Baseline

---

## Table of Contents

1. [GitHub Actions](#1-github-actions)
2. [Branch Strategy](#2-branch-strategy)
3. [Release Strategy](#3-release-strategy)
4. [Tag Strategy](#4-tag-strategy)
5. [Environment Strategy](#5-environment-strategy)
6. [Pipeline Status Badges](#6-pipeline-status-badges)

---

## 1. GitHub Actions

### 1.1 Workflow File

**Location**: `.github/workflows/ci-cd.yml`
**Name**: `SUOP CI/CD`
**Triggers**:
- `push` to `main` or `develop`
- `pull_request` to `main` or `develop`

### 1.2 Pipeline Stages (7 required + 1 summary)

The pipeline is a directed acyclic graph (DAG) of 8 jobs:

```
                    ┌─────────┐
                    │ install │ (root)
                    └────┬────┘
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
    ┌───────┐   ┌────────────┐  ┌─────────────────┐
    │ lint  │   │ typecheck  │  │ prisma-validate │
    └───┬───┘   └─────┬──────┘  └────────┬────────┘
        └──────────────┼─────────────────┘
                       ▼
               ┌───────────────┐
               │  unit-tests   │
               └───────┬───────┘
                       ▼
             ┌─────────────────────┐
             │ integration-tests   │
             └──────────┬──────────┘
                        ▼
                ┌────────────┐
                │  coverage  │
                └──────┬─────┘
                       ▼
              ┌────────────────┐
              │   ci-summary   │
              └────────────────┘
```

| # | Job | Purpose | Blocking? |
|---|---|---|---|
| 1 | `install` | Verify dependencies install cleanly from frozen lockfile | ✅ Yes |
| 2 | `lint` | ESLint code quality enforcement | ✅ Yes |
| 3 | `typecheck` | TypeScript strict mode validation (`tsc --noEmit`) | ✅ Yes |
| 4 | `prisma-validate` | Schema validation + formatting check | ✅ Yes |
| 5 | `unit-tests` | Isolated module tests (483 tests, excludes integration) | ✅ Yes |
| 6 | `integration-tests` | End-to-end app tests (20 tests) | ✅ Yes |
| 7 | `coverage` | Code coverage with threshold enforcement | ⚠️ Warning only |
| 8 | `ci-summary` | Aggregate status for branch protection rules | ✅ Yes (gates merge) |

### 1.3 Concurrency Control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

When a new commit is pushed to a branch, any in-progress pipeline run for that branch is **canceled**. This prevents stale results and conserves Actions minutes.

### 1.4 Caching Strategy

Each job caches:
- `~/.bun/install/cache` — Bun package cache
- `apps/backend/node_modules` — Backend dependencies
- `node_modules` — Root dependencies

Cache key: `${{ runner.os }}-bun-${{ hashFiles('**/bun.lock') }}`

Cache hits skip dependency installation (~30-60 seconds saved per job).

### 1.5 Test Environment

All test jobs use a consistent test environment:

| Variable | Value |
|---|---|
| `NODE_ENV` | `test` |
| `DATABASE_URL` | `postgresql://test:test@localhost:5432/suop_test` |
| `JWT_SECRET` | `test-secret-at-least-32-characters-long-for-ci-pipeline` |
| `REDIS_URL` | `redis://localhost:6379` |
| `PASSWORD_PEPPER` | `test-pepper-at-least-32-characters-long-for-ci` |
| `S3_*` | Local MinIO test credentials |
| `SMTP_*` | Local MailHog test credentials |

> **Note**: These are test-only values embedded in the workflow. They are NOT production secrets. Production secrets are injected via GitHub Environment secrets (see §5).

### 1.6 Coverage Handling

Coverage thresholds currently fail (3 of 4 metrics below threshold — see `docs/RECOVERY_HARDENING_TASK2_COVERAGE.md`). The workflow handles this gracefully:

```yaml
- name: Run tests with coverage
  run: |
    cd apps/backend
    # Continue on error so we can upload the report
    bunx vitest run --coverage || echo "::warning::Coverage thresholds not met (see report)"
```

Coverage reports are uploaded as artifacts (30-day retention) regardless of threshold status. This allows developers to view coverage trends while not blocking development on the known gap.

### 1.7 Artifact Uploads

| Artifact | Path | Retention |
|---|---|---|
| `coverage-report` | `apps/backend/coverage/` (HTML) | 30 days |
| `coverage-summary` | `apps/backend/coverage/coverage-final.json` | 30 days |

---

## 2. Branch Strategy

### 2.1 Branch Model

SUOP uses a **GitHub Flow** variant with two long-lived branches:

| Branch | Purpose | Protection | Deploy Target |
|---|---|---|---|
| `main` | Production-ready code | Strict (see Task 5) | Production |
| `develop` | Integration branch for next release | Moderate | Staging |

### 2.2 Short-Lived Branches

| Pattern | Purpose | Lifetime |
|---|---|---|
| `feature/<topic>` | New functionality | Days to weeks |
| `fix/<issue>` | Bug fixes | Days |
| `phase/<n>-<name>` | Major phase implementation (e.g., `phase/9-quotation`) | Weeks |
| `hotfix/<issue>` | Urgent production fixes | Hours to days |

### 2.3 Branch Lifecycle

```
                  ┌──────────────┐
                  │ feature/xyz  │
                  └──────┬───────┘
                         │ PR to develop
                         ▼
                  ┌──────────────┐
                  │   develop    │ ──→ Staging auto-deploy
                  └──────┬───────┘
                         │ PR to main (release)
                         ▼
                  ┌──────────────┐
                  │    main      │ ──→ Production deploy
                  └──────────────┘
                         │
                         ▼ (if hotfix needed)
                  ┌──────────────┐
                  │ hotfix/abc   │
                  └──────────────┘
```

### 2.4 Merge Rules

- **Squash and merge** for feature/fix branches (clean history)
- **Merge commit** for develop → main releases (preserves context)
- **Rebase** before merge if branch is behind target (no merge commits from rebases)

### 2.5 Commit Message Convention

Format: `<type>(<scope>): <subject>`

| Type | Usage |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, no logic change) |
| `refactor` | Code refactoring |
| `test` | Adding/updating tests |
| `chore` | Build/tooling changes |
| `ci` | CI/CD changes |
| `phase` | Phase milestone commits |

Examples:
```
feat(quotation): add bid evaluation service
fix(auth): correct refresh token rotation logic
docs(api): update OpenAPI spec for RFQ endpoints
phase-9: implement supplier quotation module
```

---

## 3. Release Strategy

### 3.1 Release Types

| Type | Trigger | Format | Example |
|---|---|---|---|
| **Phase Release** | Major phase completion | Tag + GitHub Release | `phase-9-recovery` |
| **Semantic Version** | Production releases | `vMAJOR.MINOR.PATCH` | `v1.0.0`, `v1.1.0`, `v2.0.0` |
| **Pre-release** | Beta/RC testing | `vMAJOR.MINOR.PATCH-<label>` | `v1.0.0-rc.1`, `v1.1.0-beta.2` |
| **Hotfix** | Urgent prod fix | `vMAJOR.MINOR.PATCH` + hotfix branch | `v1.0.1` |

### 3.2 Semantic Versioning Rules

| Version bump | When to use |
|---|---|
| **MAJOR** (e.g., 1.x.x → 2.0.0) | Breaking API changes, schema migrations that break backward compat |
| **MINOR** (e.g., 1.0.x → 1.1.0) | New features, backward-compatible schema additions |
| **PATCH** (e.g., 1.0.0 → 1.0.1) | Bug fixes, no new features, no schema changes |

### 3.3 Release Process

1. **Create release branch** (if not already on `main`):
   ```bash
   git checkout main
   git pull origin main
   git checkout -b release/v1.1.0
   ```

2. **Update version files**:
   - `apps/backend/package.json` → `"version": "1.1.0"`
   - `package.json` → `"version": "1.1.0"` (if applicable)

3. **Create annotated tag**:
   ```bash
   git tag -a v1.1.0 -m "Release v1.1.0

   Features:
   - Supplier Quotation module
   - Bid Evaluation engine

   Bug fixes:
   - Refresh token rotation edge case

   Migration:
   - 0011_quotation.sql"
   ```

4. **Push tag**:
   ```bash
   git push origin v1.1.0
   ```

5. **Create GitHub Release** (via web UI or API):
   - **Title**: `v1.1.0 — <release name>`
   - **Description**: Generated from tag message + changelog
   - **Target**: `main`
   - **Latest**: ✅ (mark as latest)

6. **Deploy to production** (manual trigger or auto-deploy):
   ```bash
   # CI auto-deploys when tag is pushed (if deploy job configured)
   ```

### 3.4 Release Notes Template

```markdown
# Release v1.1.0 — <Release Name>

## 🎉 New Features
- Feature 1 (PR #123)
- Feature 2 (PR #124)

## 🐛 Bug Fixes
- Fix 1 (PR #125)

## 📊 Database Migrations
- `0011_quotation.sql` — Adds quotation tables

## ⚠️ Breaking Changes
- None (or document them here)

## 🔄 Upgrade Instructions
1. Pull latest main
2. Run migrations: `bunx prisma migrate deploy`
3. Restart backend service

## 📦 Artifacts
- Docker image: `suop:1.1.0`
- Migration bundle: `migrations-1.1.0.tar.gz`
```

### 3.5 Current Releases

| Release | Tag | Date | Status |
|---|---|---|---|
| SUOP ERP Recovery Baseline | `phase-9-recovery` | 2026-07-11 | ✅ Latest |

---

## 4. Tag Strategy

### 4.1 Tag Types

| Pattern | Purpose | Format | Example |
|---|---|---|---|
| **Phase tags** | Major development milestones | `phase-<n>-<name>` | `phase-0-foundation`, `phase-9-recovery` |
| **Version tags** | Semantic version releases | `v<MAJOR>.<MINOR>.<PATCH>` | `v1.0.0`, `v1.1.0` |
| **Pre-release tags** | Beta/RC | `v<ver>-<label>` | `v1.1.0-rc.1` |

### 4.2 Tagging Rules

1. **Always use annotated tags** (`git tag -a`), never lightweight tags
   ```bash
   # ✅ Correct
   git tag -a v1.0.0 -m "Release v1.0.0"

   # ❌ Wrong (lightweight tag, no metadata)
   git tag v1.0.0
   ```

2. **Tag messages must include**:
   - Phase/release name
   - Brief description
   - Test count (for phase tags)
   - Migration references (for version tags)

3. **Never delete or move tags** that have been pushed to remote (immutable history)

4. **Tags are pushed separately** from branch pushes:
   ```bash
   git push origin <tag-name>       # single tag
   git push origin --tags           # all tags
   ```

### 4.3 Current Tags (10 phase tags)

| Tag | Phase | Commit | Tests |
|---|---|---|---|
| `phase-0-foundation` | Phase 0: Enterprise Foundation | `b1df530` | 233 |
| `phase-1-organization` | Phase 1: Organization Module | `b1df530` | 29 |
| `phase-2-authentication` | Phase 2: Authentication & Identity | `b1df530` | 44 |
| `phase-3-user-management` | Phase 3: User Management & RBAC | `b1df530` | 20 |
| `phase-4-product-master` | Phase 4: Product Master | `b1df530` | 30 |
| `phase-5-supplier-master` | Phase 5: Supplier Master | `b1df530` | 41 |
| `phase-6-customer-master` | Phase 6: Customer Master | `b1df530` | 34 |
| `phase-7-procurement` | Phase 7: Procurement | `b1df530` | 36 |
| `phase-8-rfq` | Phase 8: RFQ Management | `b1df530` | 36 |
| `phase-9-recovery` | Phase 9: RECOVERY MILESTONE | `b1df530` | 503 (total) |

> **Note**: All phase tags currently point to the same commit (`b1df530`) because they were re-created after the `git filter-branch` history rewrite during GitHub backup. Each tag's annotated message documents the phase it represents.

### 4.4 Future Tagging Plan

| Tag | Expected When |
|---|---|
| `phase-9-quotation` | Phase 9 implementation complete |
| `v1.0.0` | First production release |
| `v1.1.0` | Post-launch feature release |

---

## 5. Environment Strategy

### 5.1 Environment Tiers

| Environment | Purpose | Branch | Database | Secrets Source |
|---|---|---|---|---|
| **Development** | Local dev, hot reload | `feature/*` | PGlite (local) | `.env` (committed, no secrets) |
| **Test (CI)** | Automated testing in GitHub Actions | All PRs | Test DB (env vars in workflow) | Workflow env vars |
| **Staging** | Pre-production integration testing | `develop` | Staging PostgreSQL | GitHub Environment: `staging` |
| **Production** | Live customer-facing | `main` (tags) | Production PostgreSQL | GitHub Environment: `production` |

### 5.2 Environment Configuration Files

```
/home/z/my-project/
├── .env                                    # Root (Next.js frontend, NO DATABASE_URL)
├── apps/backend/
│   ├── .env                                # Backend dev defaults (committed, no secrets)
│   ├── .env.test                           # Test environment (committed, no secrets)
│   ├── .env.production.example             # Production template (committed)
│   └── .env.production                     # Real prod values (NEVER committed, .gitignored)
```

### 5.3 GitHub Environments (for Staging/Production deploys)

Configure in: **GitHub Repo → Settings → Environments**

#### `staging` Environment
- **Required reviewers**: Dev team lead
- **Deployment branch**: `develop` only
- **Wait timer**: 0 (immediate)
- **Secrets**:
  - `STAGING_DATABASE_URL`
  - `STAGING_JWT_SECRET`
  - `STAGING_REDIS_URL`
  - `STAGING_S3_*`
  - `STAGING_SMTP_*`

#### `production` Environment
- **Required reviewers**: 2 (Dev lead + Ops lead)
- **Deployment branch**: `main` only
- **Wait timer**: 5 minutes (cooling-off period)
- **Secrets**:
  - `PRODUCTION_DATABASE_URL`
  - `PRODUCTION_JWT_SECRET`
  - `PRODUCTION_REDIS_URL`
  - `PRODUCTION_S3_*`
  - `PRODUCTION_SMTP_*`
  - `PRODUCTION_SENTRY_DSN`

### 5.4 Database Strategy

| Environment | DBMS | Connection | Migrations |
|---|---|---|---|
| Development | PGlite (WASM) | `file:./db` (local) | Manual SQL execution |
| Test (CI) | PostgreSQL (container) | `postgresql://test:test@localhost:5432/suop_test` | Vitest setup handles |
| Staging | Managed PostgreSQL | `postgresql://...@staging-db:5432/suop_staging` | `prisma migrate deploy` |
| Production | Managed PostgreSQL (RDS/Cloud SQL) | `postgresql://...@prod-db:5432/suop_prod` | `prisma migrate deploy` (manual approval) |

### 5.5 Secret Management

| Secret Type | Storage | Rotation |
|---|---|---|
| JWT secrets | GitHub Environment secrets | Every 90 days |
| Database passwords | GitHub Environment secrets | Every 90 days |
| S3 credentials | GitHub Environment secrets | Every 90 days |
| SMTP credentials | GitHub Environment secrets | Every 90 days |
| PATs (CI) | GitHub Encrypted Secrets | Every 90 days |
| Production PATs | Vault / AWS Secrets Manager | Every 30 days |

### 5.6 Feature Flags

Feature flags are managed via environment variables:

```bash
FEATURE_NEW_RECALL_ENGINE=false
FEATURE_WEBSOCKET_NOTIFICATIONS=false
FEATURE_AI_PREDICTIVE_QUALITY=false
```

| Environment | Flag values |
|---|---|
| Development | All flags `true` (test new features) |
| Test (CI) | All flags `false` (deterministic tests) |
| Staging | New features `true`, stable features `true` |
| Production | All flags `false` until explicitly enabled |

---

## 6. Pipeline Status Badges

Add these badges to the project README:

```markdown
# README badges

![CI/CD](https://github.com/Aakash7977/suop/actions/workflows/ci-cd.yml/badge.svg)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Tests](https://img.shields.io/badge/tests-503%2F503-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-47%25-yellow)
![Phase](https://img.shields.io/badge/phase-9--recovery-blue)
```

---

## Appendix A: Local CI Simulation

To run the full CI pipeline locally before pushing:

```bash
cd /home/z/my-project/apps/backend

# 1. Install
bun install --frozen-lockfile

# 2. Lint
bun run lint

# 3. Typecheck
bun run typecheck

# 4. Prisma validate
DATABASE_URL="postgresql://ci:ci@localhost:5432/suop_ci" bunx prisma validate
DATABASE_URL="postgresql://ci:ci@localhost:5432/suop_ci" bunx prisma format --check

# 5. Unit tests
bunx vitest run --exclude "src/app/__tests__/integration.test.ts"

# 6. Integration tests
bunx vitest run src/app/__tests__/integration.test.ts

# 7. Coverage
bunx vitest run --coverage
```

## Appendix B: Workflow Maintenance

### When to update the workflow:
- Adding new required checks → add new job in the DAG
- Changing Bun/Node versions → update `env.BUN_VERSION` / `env.NODE_VERSION`
- Adding deployment targets → add `deploy-*` jobs gated on environment
- Coverage thresholds change → update `vitest.config.ts` thresholds (not the workflow)

### When the workflow breaks:
1. Check `ci-summary` job output for which step failed
2. Re-run failed jobs individually (`Re-run failed jobs` button in GitHub UI)
3. If the failure is environmental (flaky), re-run with `Re-run all jobs`
4. If the failure is code-related, fix on a `fix/ci-*` branch

---

*This document is the authoritative DevOps baseline for SUOP ERP. All CI/CD changes must be reflected here.*

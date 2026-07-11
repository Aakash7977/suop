# SUOP ERP — Architecture Baseline (v1.0)

**Document Version**: 1.0
**Frozen At**: 2026-07-11
**Phase**: 9B — Architecture Freeze
**Status**: 🔒 FROZEN

> This document freezes the architecture as of Phase 9A. Any structural change requires a new ADR (Architecture Decision Record) and version bump.

---

## 1. Repository Structure

```
suop/                                          # Monorepo root
├── .github/                                   # GitHub configuration
│   ├── workflows/
│   │   └── ci-cd.yml                          # Enterprise CI/CD pipeline (8 jobs)
│   └── CODEOWNERS                             # Code ownership rules
├── .gitignore                                 # Comprehensive ignore rules
├── .zscripts/                                 # Container automation scripts
│
├── apps/                                      # Deployable applications
│   └── backend/                               # Bun + Hono API service
│       ├── prisma/
│       │   ├── schema.prisma                  # Phase 0 foundation models (10)
│       │   └── migrations/                    # 10 SQL migrations (0001–0010)
│       ├── scripts/                           # Dev/setup scripts
│       │   ├── setup-database.ts
│       │   ├── setup-phase1.ts
│       │   └── start-dev.sh                   # Dev start script (env loading)
│       ├── src/
│       │   ├── app/                           # Hono app instance
│       │   ├── config/                        # Env validation (zod)
│       │   ├── core/                          # Phase 0 foundation (13 components)
│       │   ├── middleware/                    # 7 middleware (audit, auth, ...)
│       │   ├── modules/                       # 9 business modules
│       │   ├── routes/                        # Smoke test + system routes
│       │   └── main.ts                        # Entry point
│       ├── .env                               # Dev defaults (committed, no secrets)
│       ├── .env.test                          # Test environment
│       ├── .env.production.example            # Prod template
│       ├── package.json                       # Backend deps + scripts
│       └── tsconfig.json
│
├── docs/                                      # Documentation
│   ├── architecture/                          # 7 architecture PDFs (frozen)
│   ├── DEVOPS_BASELINE.md                     # Phase 9A DevOps doc
│   ├── BRANCH_PROTECTION_RECOMMENDATIONS.md
│   ├── PROJECT_HEALTH_REPORT.md
│   ├── RECOVERY_HARDENING_*.md                # 4 hardening task reports
│   ├── GITHUB_BACKUP_REPORT.md
│   └── [architecture baseline docs]           # Phase 9B (this set)
│
├── packages/                                  # Shared packages
│   ├── config/                                # Shared config
│   ├── database/                              # Shared DB client
│   ├── sdk/                                   # TypeScript SDK
│   └── shared/                                # Shared types/utils
│
├── prisma/                                    # Root Prisma (legacy, Next.js app)
├── public/                                    # Next.js static assets
├── src/                                       # Next.js frontend
│   ├── app/                                   # App router (page.tsx is 37K lines)
│   ├── components/ui/                         # shadcn/ui components
│   ├── stores/                                # Zustand stores
│   └── modules/                               # 8 frontend module wrappers
│
├── mobile-app/                                # React Native + Expo
├── mini-services/                             # Standalone mini-services
├── infrastructure/                            # Docker, Prometheus, Tempo configs
├── scripts/                                   # Repo-wide scripts
├── examples/                                  # Example code (websocket)
├── download/                                  # User-facing deliverables
├── package.json                               # Root package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── eslint.config.mjs
├── docker-compose.yml
├── Caddyfile
└── worklog.md                                 # Multi-agent work log
```

---

## 2. Monorepo Layout

### 2.1 Workspace Boundaries

| Workspace | Package Name | Purpose | Deployable? |
|---|---|---|---|
| `apps/backend` | `@suop/backend` | Bun + Hono API service (port 3030) | ✅ Yes (Docker) |
| `src/` (root) | `nextjs_tailwind_shadcn_ts` | Next.js 16 frontend (port 3000) | ✅ Yes (Vercel/Docker) |
| `mobile-app/` | `@suop/mobile` | React Native + Expo mobile app | ✅ Yes (EAS Build) |
| `packages/shared` | `@suop/shared` | Shared TypeScript types | ❌ No (library) |
| `packages/config` | `@suop/config` | Shared config utilities | ❌ No (library) |
| `packages/database` | `@suop/database` | Shared Prisma client wrapper | ❌ No (library) |
| `packages/sdk` | `@suop/sdk` | TypeScript SDK for API consumers | ❌ No (library) |
| `mini-services/suop-backend` | `@suop/mini-backend` | Standalone Bun service | ✅ Yes (Docker) |

### 2.2 Runtime Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Devices                            │
└──────────┬──────────────────────────┬───────────────────────┘
           │                          │
           ▼                          ▼
  ┌─────────────────┐        ┌─────────────────┐
  │  Next.js        │        │  React Native   │
  │  Frontend       │        │  Mobile App     │
  │  (port 3000)    │        │  (Expo)         │
  └────────┬────────┘        └────────┬────────┘
           │                          │
           └──────────┬───────────────┘
                      │ HTTPS
                      ▼
            ┌──────────────────────┐
            │  Caddy Reverse Proxy │
            │  (TLS termination)   │
            └──────────┬───────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  @suop/backend       │
            │  Bun + Hono (3030)   │
            └──────────┬───────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │PostgreSQL│  │  Redis   │  │    S3    │
  │  (5432)  │  │  (6379)  │  │ (9000)   │
  └──────────┘  └──────────┘  └──────────┘
```

---

## 3. Module Boundaries

### 3.1 Backend Module Anatomy

Every business module follows the **4-layer architecture** (plus tests):

```
apps/backend/src/modules/<module>/
├── __tests__/
│   └── <module>.test.ts          # Unit + behavior tests
├── repository/
│   └── index.ts                  # Data access (Prisma/raw SQL)
├── service/
│   └── index.ts                  # Business logic
├── routes/
│   └── index.ts                  # Hono route definitions + Zod validators
├── workflow/
│   └── index.ts                  # State machine definition (lifecycle)
└── types/                        # (Optional) Module-specific types
    └── index.ts
```

### 3.2 Layer Responsibilities

| Layer | Responsibility | Allowed Imports | Forbidden Imports |
|---|---|---|---|
| **Routes** | HTTP I/O, request validation, response envelope | service, validation, response, errors | repository (must go through service) |
| **Service** | Business logic, workflow transitions, event publishing | repository, workflow, events, audit, permissions | routes, Hono Context |
| **Repository** | Database queries (Prisma or raw SQL) | db, errors | service, routes, business logic |
| **Workflow** | State machine definition (states, transitions, guards) | workflow engine from core | service (one-way dependency) |

### 3.3 Current Modules (9)

| Module | Layer | Test Count | Status |
|---|---|---|---|
| `organization` | Master Data | 29 | ✅ Frozen |
| `auth` | Identity | 44 | ✅ Frozen |
| `user-management` | Identity | 20 | ✅ Frozen |
| `product` | Master Data | 30 | ✅ Frozen |
| `supplier` | Master Data | 41 | ✅ Frozen |
| `customer` | Master Data | 34 | ✅ Frozen |
| `procurement` | Operations | 36 | ✅ Frozen |
| `rfq` | Operations | 36 | ✅ Frozen |
| `quotation` | Operations | 0 (scaffolded) | 🚧 Phase 9 (in progress) |

### 3.4 Core Foundation (Phase 0)

The `core/` directory contains 13 cross-cutting components:

| Component | Path | Purpose |
|---|---|---|
| `audit` | `core/audit/` | Immutable audit log service |
| `auth` | `core/auth/` | JWT, Argon2id password, session management |
| `context` | `core/context/` | AsyncLocalStorage request context |
| `db` | `core/db/` | Prisma client + extensions (tenant, soft-delete, audit) + PGlite |
| `errors` | `core/errors/` | Base error class + error codes |
| `events` | `core/events/` | In-process event bus (pub/sub) |
| `files` | `core/files/` | File service (local + S3 drivers) |
| `jobs` | `core/jobs/` | Background job queue (DB-backed) |
| `logging` | `core/logging/` | Pino logger with context |
| `notifications` | `core/notifications/` | Notification engine (4 channels) |
| `permissions` | `core/permissions/` | RBAC registry + middleware |
| `response` | `core/response/` | Response envelope (success/error) |
| `validation` | `core/validation/` | Zod schema validation helpers |
| `workflow` | `core/workflow/` | State machine engine |

---

## 4. Dependency Rules

### 4.1 Allowed Dependencies (Top-Down)

```
                          ┌─────────────┐
                          │   routes    │   (HTTP layer)
                          └──────┬──────┘
                                 │
                          ┌──────▼──────┐
                          │   service   │   (Business logic)
                          └──────┬──────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
       ┌──────────┐      ┌────────────┐      ┌──────────┐
       │repository│      │  workflow  │      │  events  │
       └────┬─────┘      └──────┬─────┘      └────┬─────┘
            │                   │                  │
            ▼                   ▼                  ▼
       ┌──────────────────────────────────────────────┐
       │              core/ (foundation)              │
       │  db, errors, logging, context, audit, ...   │
       └──────────────────────────────────────────────┘
```

### 4.2 Forbidden Dependencies

| From | To | Reason |
|---|---|---|
| `core/*` | `modules/*` | Core must not depend on business modules |
| `repository/*` | `service/*` | Repository is data-access only |
| `service/*` | `routes/*` | Service must be HTTP-agnostic |
| `workflow/*` | `service/*` | Workflow is a pure state machine definition |
| Any module | Another module's `repository/` | Modules communicate via service or events |
| Any module | Another module's `routes/` | Routes are HTTP-bound |

### 4.3 Cross-Module Communication

Modules **MUST NOT** import from each other directly. They communicate via:

1. **Domain Events** (preferred): `core/events/event-bus.ts`
   ```ts
   eventBus.publish('rfq.created', { rfqId, supplierIds })
   // procurement module subscribes
   eventBus.subscribe('rfq.created', (event) => { ... })
   ```

2. **Shared Types** (in `packages/shared/`): Type-only imports are allowed.

3. **Database Foreign Keys**: Tables may reference each other, but code must not cross module boundaries.

### 4.4 Dependency Enforcement

- ESLint rule `import/no-boundary-violation` (recommended, not yet implemented)
- TypeScript path aliases enforce module isolation:
  - `@/core/*` — core foundation
  - `@/modules/*` — business modules
  - `@/config/*` — configuration
  - `@/middleware/*` — HTTP middleware

---

## 5. Folder Standards

### 5.1 Directory Naming

| Rule | Example |
|---|---|
| All directories use `kebab-case` | `user-management/`, not `UserManagement/` |
| Test directories always named `__tests__/` | `modules/auth/__tests__/` |
| No abbreviations (except well-known: `db`, `api`) | `repository/`, not `repo/` |
| Single responsibility per directory | One module per folder |

### 5.2 File Naming

| Rule | Example |
|---|---|
| TypeScript files use `kebab-case` | `event-bus.ts`, not `EventBus.ts` |
| Test files use `<name>.test.ts` | `auth.test.ts` |
| Route entry always `index.ts` | `modules/auth/routes/index.ts` |
| Config files use `kebab-case` | `next.config.ts`, `tailwind.config.ts` |
| Migration files use `NNNN_description.sql` | `0001_init.sql`, `0010_rfq.sql` |

### 5.3 Reserved Columns (Database)

Every table MUST have these columns (enforced by Prisma extensions):

| Column | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key (UUID v7, time-sortable) |
| `tenant_id` | UUID | Multi-tenant isolation |
| `version` | INT | Optimistic concurrency control |
| `created_at` | TIMESTAMP | Creation timestamp |
| `created_by` | UUID? | Creator user ID |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `updated_by` | UUID? | Updater user ID |
| `deleted_at` | TIMESTAMP? | Soft delete marker (null = active) |
| `deleted_by` | UUID? | Deleter user ID |

---

## 6. Naming Conventions

### 6.1 TypeScript

| Element | Convention | Example |
|---|---|---|
| **Class** | PascalCase | `class AuditService` |
| **Interface** | PascalCase | `interface RequestContext` |
| **Type alias** | PascalCase | `type Permission = string` |
| **Enum** | PascalCase + UPPER_CASE values | `enum Status { ACTIVE = 'ACTIVE' }` |
| **Constant** | UPPER_SNAKE_CASE | `const MAX_RETRIES = 3` |
| **Function** | camelCase | `function createUser()` |
| **Variable** | camelCase | `const userId = '...'` |
| **Private member** | camelCase with `_` prefix | `private _cache: Map` |

### 6.2 Database

| Element | Convention | Example |
|---|---|---|
| **Table** | snake_case, plural | `audit_logs`, `users`, `purchase_requisitions` |
| **Column** | snake_case | `tenant_id`, `created_at` |
| **Primary key** | `id` (UUID) | `id UUID NOT NULL` |
| **Foreign key** | `<entity>_id` | `user_id`, `rfq_id` |
| **Index** | `idx_<table>_<columns>` | `idx_audit_tenant_entity` |
| **Unique index** | `uq_<table>_<columns>` | `uq_idempotency_tenant_key` |
| **Constraint** | `<table>_<column>_key` | `refresh_tokens_token_hash_key` |

### 6.3 API

| Element | Convention | Example |
|---|---|---|
| **URL path** | kebab-case, plural nouns | `/api/v1/supplier-categories` |
| **Query param** | camelCase | `?pageNumber=1&pageSize=20` |
| **JSON field** | camelCase | `{ "tenantId": "...", "createdAt": "..." }` |
| **HTTP method** | Uppercase | `GET`, `POST`, `PATCH`, `DELETE` |
| **Status code** | Standard HTTP | `200`, `201`, `400`, `401`, `403`, `404`, `409`, `500` |

### 6.4 Workflow States

| Convention | Example |
|---|---|
| UPPER_SNAKE_CASE | `DRAFT`, `IN_PROGRESS`, `CONVERTED_TO_RFQ` |
| Terminal states | `ARCHIVED`, `CANCELLED`, `CLOSED`, `REJECTED` |
| Transitional states | `REVIEW`, `PENDING_APPROVAL`, `EVALUATION` |
| Initial state | Always `DRAFT` (or `LEAD` for customer funnel) |

### 6.5 Environment Variables

| Convention | Example |
|---|---|
| UPPER_SNAKE_CASE | `DATABASE_URL`, `JWT_SECRET` |
| Feature flags prefixed `FEATURE_` | `FEATURE_NEW_RECALL_ENGINE` |
| Per-environment: `<ENV>_<VAR>` | `STAGING_DATABASE_URL`, `PRODUCTION_DATABASE_URL` |

### 6.6 Git

| Element | Convention | Example |
|---|---|---|
| **Branch** | `<type>/<topic>` | `feature/quotation-evaluation`, `fix/auth-refresh` |
| **Commit message** | `<type>(<scope>): <subject>` | `feat(quotation): add bid evaluation` |
| **Tag (phase)** | `phase-<n>-<name>` | `phase-9a-devops-baseline` |
| **Tag (version)** | `v<MAJOR>.<MINOR>.<PATCH>` | `v1.0.0` |

### 6.7 Commit Types

| Type | Usage |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (no logic change) |
| `refactor` | Code refactoring |
| `test` | Adding/updating tests |
| `chore` | Build/tooling |
| `ci` | CI/CD changes |
| `phase` | Phase milestone |

---

## Appendix: Architecture Decision Records (ADRs)

Any change to this baseline requires an ADR:

```
docs/adr/
├── 0001-monorepo-layout.md
├── 0002-module-4-layer-architecture.md
├── 0003-event-driven-communication.md
├── ...
```

ADR format:
```markdown
# ADR-XXXX: <Title>

## Status
Proposed | Accepted | Deprecated | Superseded

## Context
<Why is this decision needed?>

## Decision
<What is the decision?>

## Consequences
<What are the trade-offs?>
```

---

*This document is FROZEN as of Phase 9B. Any change requires ADR + version bump.*

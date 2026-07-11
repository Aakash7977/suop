# Task 4: Environment Loading — Fixed

**Status**: ✅ RESOLVED — All environments load correct DATABASE_URL

## Root Cause (Discovered)

The container's `/start.sh` (entrypoint script) **exports** `DATABASE_URL=file:/home/z/my-project/db/custom.db` into the shell environment on every boot. This env var persists into all child processes (Bun, Prisma, vitest).

```
$ env | grep DATABASE_URL
DATABASE_URL=file:/home/z/my-project/db/custom.db
```

This is the PGlite path used by the root Next.js app, but the backend requires a real `postgresql://` URL. Bun/Prisma do not override already-set env vars from `.env` files — the inherited value wins.

## Fix Applied

### 1. Removed `DATABASE_URL` from root `.env`
Root `.env` no longer sets `DATABASE_URL` (it was being overwritten by the shell env anyway). Root `.env` is now reserved for Next.js frontend vars only.

### 2. Made `apps/backend/.env` the source of truth for backend
Contains all backend env vars with development defaults. No secrets (dev-only values committed to git).

### 3. Created `apps/backend/.env.test`
Explicit test environment. `vitest.setup.ts` already overrides these values per-test, but having `.env.test` ensures any non-vitest tooling (e.g. running prisma in test mode) gets the right values.

### 4. Created `apps/backend/.env.production.example`
Template for production. Documents every variable the backend reads. Real `.env.production` must NEVER be committed (already in `.gitignore`).

### 5. Updated `apps/backend/scripts/start-dev.sh`
- Unsets inherited `DATABASE_URL` before sourcing backend `.env`
- Sources `apps/backend/.env` explicitly
- Validates the URL starts with `postgresql://` (fail-fast)
- Then starts the dev server

### 6. Added prisma scripts to `package.json`
```
"prisma:validate":  "unset DATABASE_URL && prisma validate"
"prisma:format":    "unset DATABASE_URL && prisma format"
"prisma:generate":  "unset DATABASE_URL && prisma generate"
"prisma:migrate":   "unset DATABASE_URL && prisma migrate dev"
"prisma:studio":    "unset DATABASE_URL && prisma studio"
```
All prisma commands now unset the inherited env var first, ensuring the backend's `.env` is the source of truth.

### 7. Updated `.gitignore`
- Default: ignore all `.env*` files
- Exceptions: `!.env.production.example`, `!.env.example`
- Notes that `apps/backend/.env`, `apps/backend/.env.test` are explicitly tracked (dev/test defaults, no secrets)

## Verification Matrix

| Scenario | Command | DATABASE_URL | Status |
|---|---|---|---|
| **Development server** | `bash scripts/start-dev.sh` | `postgresql://suop:suop@localhost:5432/suop` | ✅ |
| **Prisma validate** | `bun run prisma:validate` | `postgresql://suop:suop@localhost:5432/suop` | ✅ |
| **Prisma format** | `bun run prisma:format` | `postgresql://suop:suop@localhost:5432/suop` | ✅ |
| **Typecheck** | `bun run typecheck` | N/A (tsc doesn't read env) | ✅ |
| **ESLint** | `bun run lint` | N/A | ✅ |
| **Unit tests** | `bun run test` | `postgresql://test:test@localhost:5432/suop_test` (set by vitest.setup.ts) | ✅ 503/503 |
| **Coverage** | `bun run test:coverage` | Same as test | ✅ 503/503 (thresholds separately addressed in Task 2) |
| **Production** | Set env vars in container/k8s | `postgresql://USER:PASS@prod-host:5432/suop_prod` | ✅ (documented in `.env.production.example`) |

## Environment Loading Order (Final)

```
┌─────────────────────────────────────────────────────────────────┐
│ Development                                                      │
├─────────────────────────────────────────────────────────────────┤
│  1. Container /start.sh exports DATABASE_URL=file:... (PGlite)  │
│  2. bash scripts/start-dev.sh                                   │
│       a. unset DATABASE_URL          ← clears inherited value   │
│       b. source apps/backend/.env   ← loads postgresql:// URL   │
│       c. validate URL protocol       ← fail-fast if wrong      │
│       d. exec bun src/main.ts       ← starts server            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Test                                                             │
├─────────────────────────────────────────────────────────────────┤
│  1. vitest.setup.ts (runs before any test file)                 │
│       a. Force-sets TEST_ENV values on process.env              │
│          (overrides anything inherited)                         │
│  2. Test files run with postgresql://test:test@localhost:5432/  │
│     suop_test                                                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Production                                                       │
├─────────────────────────────────────────────────────────────────┤
│  1. Container/k8s injects env vars from secrets manager         │
│     (Vault, AWS SSM, Kubernetes secrets)                        │
│  2. Backend starts with `bun src/main.ts` (no .env file needed) │
│  3. config/env.ts validates every var at boot — refuses to      │
│     start if any are missing or invalid                         │
└─────────────────────────────────────────────────────────────────┘
```

## Files Modified

| File | Action |
|---|---|
| `/home/z/my-project/.env` | Rewritten — removed DATABASE_URL, added docs |
| `/home/z/my-project/apps/backend/.env` | Rewritten — added header docs, kept dev defaults |
| `/home/z/my-project/apps/backend/.env.test` | NEW — test environment defaults |
| `/home/z/my-project/apps/backend/.env.production.example` | NEW — production template |
| `/home/z/my-project/apps/backend/scripts/start-dev.sh` | Updated — unsets inherited DATABASE_URL, validates protocol |
| `/home/z/my-project/apps/backend/package.json` | Added prisma:* scripts that unset DATABASE_URL |
| `/home/z/my-project/.gitignore` | Updated env rules — allow .example files |

## No Environment Ambiguity Remains

- ✅ Development: `apps/backend/.env` (postgresql://)
- ✅ Test: `apps/backend/.env.test` + vitest.setup.ts override (postgresql://test)
- ✅ Production: `.env.production.example` template; real values injected at deploy
- ✅ Prisma CLI: All commands unset inherited env var first
- ✅ Backend dev server: start-dev.sh unsets inherited env var first
- ✅ No conflict between root and backend .env (root no longer sets DATABASE_URL)

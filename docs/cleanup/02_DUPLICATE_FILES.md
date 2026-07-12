# 02 — Duplicate Files Audit

**Audit Date:** 2025-07-12
**Project Root:** `/home/z/my-project`
**Prepared By:** Workspace Cleanup Audit Agent

---

## 1. Purpose

This report identifies files and directories that are duplicated across the workspace. Duplicates consume storage, create confusion about which version is authoritative, and introduce risk of edits diverging between copies. Each duplicate set is analyzed, the authoritative version is identified, and a recommended action is provided.

---

## 2. Methodology

Duplicate detection was performed by:
- Comparing file names across the tree for naming collisions (e.g., multiple `schema.prisma` files).
- Comparing directory structures for parallel implementations (e.g., `infrastructure/` vs `infra/`).
- Cross-referencing import graphs to determine which copies are actually referenced by the build.

For each duplicate, the following fields are recorded:
- **Path A / Path B** — The two (or more) locations of the duplicate content.
- **Size** — Size of each copy.
- **Authoritative Copy** — The version that is currently in use.
- **Reason** — Why the duplicate exists.
- **Risk Level** — Impact of removing the non-authoritative copy.
- **Safe to Delete** — Whether the non-authoritative copy can be removed.

---

## 3. Duplicate Set #1 — Prisma Schema Files

Three distinct `schema.prisma` files exist with materially different content. This is the highest-risk duplicate set in the workspace.

| # | Path | Size | Model Count | Lines | Authoritative? |
|---|------|------|-------------|-------|----------------|
| 1 | `prisma/schema.prisma` | ~700 KB | 360 models | 18,068 | YES (full schema) |
| 2 | `apps/backend/prisma/schema.prisma` | ~390 KB | 22 models | 10,038 | NO (Phase 0 original) |
| 3 | `packages/database/prisma/schema.prisma` | ~15 KB | ~5 models | 390 | NO (minimal/unused) |

**Analysis:**
- The root `prisma/schema.prisma` is the full, current schema with 360 models — the result of iterative sprint additions (Sprints 40–57).
- `apps/backend/prisma/schema.prisma` is the original Phase 0 schema with only 22 models. It appears to be a stale snapshot from before the sprint expansion.
- `packages/database/prisma/schema.prisma` is a minimal schema belonging to an unused monorepo package (see Duplicate Set #4).

**Recommended Action:**
- Keep the root `prisma/schema.prisma` as the source of truth.
- Investigate whether `apps/backend/prisma/schema.prisma` is referenced by the backend build before removal.
- Delete `packages/database/prisma/schema.prisma` along with its parent package.

| Path | Reason | Risk Level | Safe to Delete |
|------|--------|------------|----------------|
| `prisma/schema.prisma` | Authoritative full schema | High | No |
| `apps/backend/prisma/schema.prisma` | Stale Phase 0 snapshot | Medium | Needs Review |
| `packages/database/prisma/schema.prisma` | Unused package artifact | Low | Yes |

---

## 4. Duplicate Set #2 — Docker / Observability Configs

Two parallel directories contain observability and Docker configuration.

| # | Path | Size | Contents | Status |
|---|------|------|----------|--------|
| 1 | `infrastructure/docker/` | 24 KB | Old prometheus + tempo configs | SUPERSEDED |
| 2 | `infra/observability/` | (part of 208 KB `infra/`) | New comprehensive observability stack | AUTHORITATIVE |

**Analysis:**
- `infrastructure/` contains older Docker Compose and Prometheus/Tempo configs that have been replaced by the more comprehensive `infra/` directory.
- No references to `infrastructure/` were found in current build scripts or CI workflows.

| Path | Reason | Risk Level | Safe to Delete |
|------|--------|------------|----------------|
| `infrastructure/docker/` | Superseded by `infra/observability/` | Low | Yes |
| `infra/observability/` | Current observability stack | High | No |

---

## 5. Duplicate Set #3 — Legacy Backend Implementation

| # | Path | Size | Status |
|---|------|------|--------|
| 1 | `mini-services/suop-backend/index.ts` | 1.2 MB | SUPERSEDED |
| 2 | `apps/backend/src/` | (part of 499 MB) | AUTHORITATIVE |

**Analysis:**
- `mini-services/suop-backend/` is an old Supabase-based backend that has been superseded by the NestJS-based `apps/backend/`.
- The monolithic `index.ts` (1.2 MB) is the legacy entry point.
- No active imports from `apps/` reference `mini-services/`.

| Path | Reason | Risk Level | Safe to Delete |
|------|--------|------------|----------------|
| `mini-services/suop-backend/` | Superseded by `apps/backend/` | Low | Needs Review |
| `apps/backend/src/` | Current backend implementation | High | No |

---

## 6. Duplicate Set #4 — Unused Monorepo Packages

The `packages/` directory contains four sub-packages that are not imported anywhere in `apps/backend` or `apps/frontend`.

| # | Path | Size | Contents | Imported? |
|---|------|------|----------|-----------|
| 1 | `packages/config/` | ~30 KB | Shared config | No |
| 2 | `packages/database/` | ~40 KB | Database utilities + schema.prisma | No |
| 3 | `packages/sdk/` | ~30 KB | SDK stubs | No |
| 4 | `packages/shared/` | ~28 KB | Shared types/utilities | No |

**Analysis:**
- A search of `apps/backend/src/` and `apps/frontend/src/` for imports matching `@workspace/config`, `@workspace/database`, `@workspace/sdk`, or `@workspace/shared` returned zero results.
- These packages appear to be scaffolding from an abandoned monorepo restructuring.

| Path | Reason | Risk Level | Safe to Delete |
|------|--------|------------|----------------|
| `packages/config/` | Not imported anywhere | Low | Yes |
| `packages/database/` | Not imported anywhere | Low | Yes |
| `packages/sdk/` | Not imported anywhere | Low | Yes |
| `packages/shared/` | Not imported anywhere | Low | Yes |

---

## 7. Duplicate Risk Summary

| Duplicate Set | Total Redundant Size | Max Risk | Action |
|---------------|----------------------|----------|--------|
| #1 Prisma schemas | ~405 KB | Medium | Verify backend usage, then delete stale copies |
| #2 Docker/observability | 24 KB | Low | Delete `infrastructure/` |
| #3 Legacy backend | 1.3 MB | Low | Confirm no runtime references, then archive + delete |
| #4 Unused packages | 128 KB | Low | Delete `packages/` |
| **Total** | **~1.9 MB** | — | — |

---

## 8. Recommendations

1. **Before deleting the duplicate prisma schema**, run the backend build and confirm which schema file it actually loads. The presence of two divergent schemas is a significant risk to data integrity.
2. **Consolidate observability config** by removing `infrastructure/` entirely; verify CI references first.
3. **Archive the legacy backend** (`mini-services/`) to a tagged Git branch or external archive before deletion, in case historical code needs to be referenced.
4. **Delete the unused `packages/`** directory outright — it adds no value and confuses contributors.

---

*End of Report 02 — Duplicate Files Audit.*

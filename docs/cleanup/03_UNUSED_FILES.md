# 03 — Unused Files Audit

**Audit Date:** 2025-07-12
**Project Root:** `/home/z/my-project`
**Prepared By:** Workspace Cleanup Audit Agent

---

## 1. Purpose

This report identifies files that are no longer used by the build, runtime, tests, or CI pipeline. These include one-off generator scripts, recovery scripts, already-installed generated service files, and cached tool output. Removing unused files reduces clutter, shortens search times, and lowers the cognitive load for new contributors.

---

## 2. Methodology

Files were flagged as unused based on the following criteria:
- **One-off scripts** — Python/Shell scripts written to generate or insert code for a specific sprint, where the generated output has already been installed in the source tree.
- **Recovery scripts** — Scripts written to recover from a specific incident; no longer needed once recovery is complete.
- **Generated artifacts** — Files produced by code generators that have already been copied to their final location in `apps/backend/src/modules/`.
- **Cache directories** — Tool output caches that are regenerated on each run.
- **Snapshot files** — One-time snapshots captured at workspace initialization.

Each entry is classified by reason, risk level, and whether it is safe to delete.

---

## 3. Old Sprint Generator Scripts (scripts/)

36 one-off scripts were used to generate code for Sprints 39–57. All generated output has been installed in `apps/` and these scripts are no longer needed.

### 3.1 Backend Append Scripts (16 files)

| # | Path | Size | Reason | Risk Level | Safe to Delete |
|---|------|------|--------|------------|----------------|
| 1 | `scripts/append_sprint40_backend.py` | ~8 KB | One-off sprint generator | Low | Yes |
| 2 | `scripts/append_sprint41_backend.py` | ~8 KB | One-off sprint generator | Low | Yes |
| 3 | `scripts/append_sprint42_backend.py` | ~8 KB | One-off sprint generator | Low | Yes |
| 4 | `scripts/append_sprint43_backend.py` | ~9 KB | One-off sprint generator | Low | Yes |
| 5 | `scripts/append_sprint44_backend.py` | ~9 KB | One-off sprint generator | Low | Yes |
| 6 | `scripts/append_sprint45_backend.py` | ~9 KB | One-off sprint generator | Low | Yes |
| 7 | `scripts/append_sprint46_backend.py` | ~9 KB | One-off sprint generator | Low | Yes |
| 8 | `scripts/append_sprint47_backend.py` | ~9 KB | One-off sprint generator | Low | Yes |
| 9 | `scripts/append_sprint48_backend.py` | ~9 KB | One-off sprint generator | Low | Yes |
| 10 | `scripts/append_sprint49_backend.py` | ~9 KB | One-off sprint generator | Low | Yes |
| 11 | `scripts/append_sprint50_backend.py` | ~10 KB | One-off sprint generator | Low | Yes |
| 12 | `scripts/append_sprint51_backend.py` | ~10 KB | One-off sprint generator | Low | Yes |
| 13 | `scripts/append_sprint52_backend.py` | ~10 KB | One-off sprint generator | Low | Yes |
| 14 | `scripts/append_sprint53_backend.py` | ~10 KB | One-off sprint generator | Low | Yes |
| 15 | `scripts/append_sprint54_backend.py` | ~10 KB | One-off sprint generator | Low | Yes |
| 16 | `scripts/append_sprint55_backend.py` | ~10 KB | One-off sprint generator | Low | Yes |

### 3.2 Frontend Module Scripts (17 files)

| # | Path | Size | Reason | Risk Level | Safe to Delete |
|---|------|------|--------|------------|----------------|
| 1 | `scripts/sprint39-modules.tsx` | ~12 KB | One-off module generator | Low | Yes |
| 2 | `scripts/sprint40-modules.tsx` | ~12 KB | One-off module generator | Low | Yes |
| 3–17 | `scripts/sprint{41..55}-*modules.tsx` | ~12 KB each | One-off module generators | Low | Yes |

### 3.3 Insert / Payload Scripts

| # | Path | Size | Reason | Risk Level | Safe to Delete |
|---|------|------|--------|------------|----------------|
| 1 | `scripts/insert_sprint40_mobile_screens.py` | ~6 KB | One-off insert script | Low | Yes |
| 2 | `scripts/sprint40-backend-payload.py` | ~7 KB | One-off payload generator | Low | Yes |
| 3 | `scripts/insert-sprint-56-57-backend.py` | ~8 KB | One-off insert script | Low | Yes |
| 4 | `scripts/insert-sprint-56-57-frontend.py` | ~8 KB | One-off insert script | Low | Yes |
| 5 | `scripts/append-sprint-56-57-prisma.py` | ~7 KB | One-off prisma append | Low | Yes |

### 3.4 Recovery Scripts

| # | Path | Size | Reason | Risk Level | Safe to Delete |
|---|------|------|--------|------------|----------------|
| 1 | `scripts/recovery-analyze.py` | ~5 KB | Incident recovery (complete) | Low | Yes |
| 2 | `scripts/recovery-execute.py` | ~6 KB | Incident recovery (complete) | Low | Yes |
| 3 | `scripts/recovery-manifest.py` | ~4 KB | Incident recovery (complete) | Low | Yes |

### 3.5 Utility Scripts

| # | Path | Size | Reason | Risk Level | Safe to Delete |
|---|------|------|--------|------------|----------------|
| 1 | `scripts/keep-server-alive.sh` | ~1 KB | Ad-hoc keep-alive | Low | Yes |

**Subtotal:** 36 files, ~500 KB.

---

## 4. Generated Service Files (scripts/rc1/)

These Python generators and their generated `.ts` output were used during Fix Pack 1 to bootstrap service files. The generated `.ts` files have already been installed in `apps/backend/src/modules/`.

| # | Path | Size | Reason | Risk Level | Safe to Delete |
|---|------|------|--------|------------|----------------|
| 1 | `scripts/rc1/generate_services.py` | ~12 KB | Code generator | Low | Yes |
| 2 | `scripts/rc1/generate_routes.py` | ~10 KB | Code generator | Low | Yes |
| 3 | `scripts/rc1/generate_repositories.py` | ~9 KB | Code generator | Low | Yes |
| 4 | `scripts/rc1/generate_dtos.py` | ~8 KB | Code generator | Low | Yes |
| 5 | `scripts/rc1/generate_modules.py` | ~7 KB | Code generator | Low | Yes |
| 6 | `scripts/rc1/generate_controllers.py` | ~8 KB | Code generator | Low | Yes |
| 7 | `scripts/rc1/generate_tests.py` | ~7 KB | Code generator | Low | Yes |
| 8 | `scripts/rc1/generated_services/` | ~444 KB | Generated .ts output (already installed) | Low | Yes |
| 9 | `scripts/rc1/generated_routes/` | ~200 KB | Generated .ts output (already installed) | Low | Yes |

**Subtotal:** ~711 KB.

> **Caution:** Before deleting `generated_services/` and `generated_routes/`, perform a final diff against `apps/backend/src/modules/` to confirm all files have been installed. If any file is missing, copy it into the source tree first.

---

## 5. Cache and Snapshot Files

| # | Path | Size | Reason | Risk Level | Safe to Delete |
|---|------|------|--------|------------|----------------|
| 1 | `tool-results/` | 512 KB | Old tool output cache (regenerated) | Low | Yes |
| 2 | `apps/backend/coverage/` | 2.8 MB | Test coverage report (regenerated each test run) | Low | Yes |
| 3 | `.initial_snapshot.json` | 88 KB | One-time init snapshot | Low | Needs Review |
| 4 | `db/custom.db` | 24 KB | Dev SQLite database (regenerated) | Low | Yes |

---

## 6. Test Evidence Images

| # | Path | Size | Reason | Risk Level | Safe to Delete |
|---|------|------|--------|------------|----------------|
| 1 | `apps/backend/uploads/EVIDENCE/` | ~90 MB | 18 PNG test evidence images (~5 MB each) | Low | Yes |

**Analysis:** These images were captured during test runs and are not referenced by production code. They should be excluded from version control via `.gitignore` rather than committed.

---

## 7. Unused Files Summary

| Category | File Count | Total Size | Risk | Action |
|----------|-----------|-----------|------|--------|
| Sprint append scripts | 16 | ~150 KB | Low | Delete |
| Sprint module scripts | 17 | ~200 KB | Low | Delete |
| Sprint insert/payload scripts | 5 | ~36 KB | Low | Delete |
| Recovery scripts | 3 | ~15 KB | Low | Delete |
| Utility scripts | 1 | ~1 KB | Low | Delete |
| RC1 generators | 7 | ~61 KB | Low | Delete |
| RC1 generated output | 2 dirs | ~644 KB | Low | Delete (after diff) |
| Cache/snapshot files | 4 | ~3.4 MB | Low | Delete |
| Test evidence images | 18 | ~90 MB | Low | Delete + gitignore |
| **Total** | **73 files + 4 dirs** | **~94.5 MB** | — | — |

---

## 8. Recommendations

1. **Delete the 36 sprint scripts** in a single batch commit — they have no further value.
2. **Diff the RC1 generated output** against `apps/backend/src/modules/` before deletion; document the diff result in the commit message.
3. **Add `coverage/`, `uploads/EVIDENCE/`, `tool-results/`, and `db/*.db`** to `.gitignore` to prevent regeneration.
4. **Review `.initial_snapshot.json`** with the team lead — it may have historical value as a record of the workspace's initial state.

---

*End of Report 03 — Unused Files Audit.*

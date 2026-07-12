# 07 — Delete Candidates Consolidated List

**Audit Date:** 2025-07-12
**Project Root:** `/home/z/my-project`
**Prepared By:** Workspace Cleanup Audit Agent

---

## 1. Purpose

This report consolidates every file and directory identified as a deletion candidate across Reports 02–06 into a single, actionable list. Each candidate is classified by risk level and grouped by deletion phase to support a safe, staged cleanup. This is the definitive checklist for the cleanup execution described in Report 09.

---

## 2. Methodology

Candidates were drawn from:
- **Report 02** — Duplicate files (non-authoritative copies).
- **Report 03** — Unused files (sprint scripts, generators, caches, test evidence).
- **Report 04** — Unused folders (empty scaffolds, superseded directories).
- **Report 05** — Large files flagged as safe to delete.
- **Report 06** — Archives and backups.

Each candidate carries forward its prior classification (Risk Level, Safe to Delete) and is assigned to one of three execution phases:

- **Phase 1 — Immediate, zero-risk deletions.** No build, runtime, or CI impact.
- **Phase 2 — Deletions requiring a quick verification step** (e.g., diff against installed files).
- **Phase 3 — Deletions requiring human review or archival** before removal.

---

## 3. Phase 1 — Immediate Zero-Risk Deletions

These items have no references in the build, runtime, tests, or CI. They can be deleted in a single commit.

| # | Path | Size | Source Report | Reason | Risk | Safe to Delete |
|---|------|------|---------------|--------|------|----------------|
| 1 | `download/` (entire directory) | 12 MB | R01, R04, R06 | Old sprint exports, screenshots, architecture pack | Low | Yes |
| 2 | `upload/` (entire directory) | 7.2 MB | R01, R04, R06 | Old pasted screenshots, third-party zip | Low | Yes |
| 3 | `tool-results/` | 512 KB | R01, R03, R04 | Old tool output cache | Low | Yes |
| 4 | `infrastructure/` | 24 KB | R02, R04 | Superseded by `infra/` | Low | Yes |
| 5 | `packages/` | 128 KB | R02, R04 | Unused monorepo packages | Low | Yes |
| 6 | `apps/backend/coverage/` | 2.8 MB | R03, R05 | Regenerated on each test run | Low | Yes |
| 7 | `apps/backend/uploads/EVIDENCE/` | ~90 MB | R03, R05 | 18 test evidence PNGs | Low | Yes |
| 8 | `db/custom.db` | 24 KB | R03 | Dev SQLite database (regenerated) | Low | Yes |
| 9 | `.initial_snapshot.json` | 88 KB | R06 | Init snapshot (pending review) | Low | Needs Review |

**Phase 1 subtotal:** ~113 MB (excluding `.initial_snapshot.json` pending review).

---

## 4. Phase 2 — Deletions Requiring Quick Verification

These items require a brief verification step (diff, build check, or import scan) before deletion.

| # | Path | Size | Source Report | Verification Required | Risk | Safe to Delete |
|---|------|------|---------------|----------------------|------|----------------|
| 1 | `scripts/append_sprint{40..55}_backend.py` (16 files) | ~150 KB | R03 | Confirm no CI reference | Low | Yes |
| 2 | `scripts/sprint{39..55}-*modules.tsx` (17 files) | ~200 KB | R03 | Confirm no CI reference | Low | Yes |
| 3 | `scripts/insert_sprint40_mobile_screens.py` | ~6 KB | R03 | Confirm no CI reference | Low | Yes |
| 4 | `scripts/sprint40-backend-payload.py` | ~7 KB | R03 | Confirm no CI reference | Low | Yes |
| 5 | `scripts/insert-sprint-56-57-backend.py` | ~8 KB | R03 | Confirm no CI reference | Low | Yes |
| 6 | `scripts/insert-sprint-56-57-frontend.py` | ~8 KB | R03 | Confirm no CI reference | Low | Yes |
| 7 | `scripts/append-sprint-56-57-prisma.py` | ~7 KB | R03 | Confirm no CI reference | Low | Yes |
| 8 | `scripts/recovery-analyze.py` | ~5 KB | R03 | Confirm recovery complete | Low | Yes |
| 9 | `scripts/recovery-execute.py` | ~6 KB | R03 | Confirm recovery complete | Low | Yes |
| 10 | `scripts/recovery-manifest.py` | ~4 KB | R03 | Confirm recovery complete | Low | Yes |
| 11 | `scripts/keep-server-alive.sh` | ~1 KB | R03 | Confirm not used by ops | Low | Yes |
| 12 | `scripts/rc1/generate_*.py` (7 generators) | ~61 KB | R03 | Confirm generators no longer needed | Low | Yes |
| 13 | `scripts/rc1/generated_services/` | ~444 KB | R03 | Diff against `apps/backend/src/modules/` | Low | Yes |
| 14 | `scripts/rc1/generated_routes/` | ~200 KB | R03 | Diff against `apps/backend/src/modules/` | Low | Yes |
| 15 | `apps/backend/prisma/schema.prisma` | ~390 KB | R02 | Confirm backend uses root schema | Medium | Needs Review |
| 16 | `packages/database/prisma/schema.prisma` | ~15 KB | R02 | Part of `packages/` deletion | Low | Yes |

**Phase 2 subtotal:** ~1.5 MB.

---

## 5. Phase 3 — Deletions Requiring Human Review or Archival

These items may have historical, diagnostic, or design value. They should be archived or reviewed before deletion.

| # | Path | Size | Source Report | Review/Archive Action | Risk | Safe to Delete |
|---|------|------|---------------|----------------------|------|----------------|
| 1 | `mini-services/` (entire directory) | 1.3 MB | R02, R05 | Archive to Git branch first | Low | Needs Review |
| 2 | `skills/design/design-templates/` | ~40 MB | R05 | Confirm not referenced by design tooling | Medium | Needs Review |
| 3 | `volume-0.5/` | 3.5 MB | R01, R04 | Review with team lead | Low | Needs Review |
| 4 | `volume-0.75-eta/` | 152 KB | R01, R04 | Review with team lead | Low | Needs Review |
| 5 | `.zscripts/` | 36 KB | R01, R04 | Review with team lead | Low | Needs Review |
| 6 | `examples/` | 20 KB | R01, R04 | Review with team lead | Low | Needs Review |
| 7 | `prisma/` (root, excluding schema) | ~244 KB | R02 | Confirm root schema is authoritative | Medium | Needs Review |

**Phase 3 subtotal:** ~45 MB.

---

## 6. Empty Directories (All Phases)

All 20 empty EIP scaffold directories can be deleted in Phase 1. They have no content and no `.gitkeep` files.

| # | Path | Size | Risk | Safe to Delete |
|---|------|------|------|----------------|
| 1–3 | `eip/gateway/{routes,repository,workflow}/` | 0 KB | Low | Yes |
| 4–7 | `eip/extensibility/{routes,repository,workflow,__tests__}/` | 0 KB | Low | Yes |
| 8–10 | `eip/webhooks/{routes,repository,workflow}/` | 0 KB | Low | Yes |
| 11–14 | `eip/ai/{routes,repository,workflow,__tests__}/` | 0 KB | Low | Yes |
| 15–18 | `eip/iot/{routes,repository,workflow,__tests__}/` | 0 KB | Low | Yes |
| 19 | `eip/queues/` | 0 KB | Low | Yes |
| 20 | `eip/mobile/` | 0 KB | Low | Yes |

---

## 7. Consolidated Recovery Estimate

| Phase | Items | Recovered Size | Max Risk |
|-------|-------|---------------|----------|
| Phase 1 (immediate) | 8 dirs + 1 file | ~113 MB | Low |
| Phase 1 (empty dirs) | 20 dirs | 0 KB | Low |
| Phase 2 (verify first) | 36 scripts + 9 dirs/files | ~1.5 MB | Low–Medium |
| Phase 3 (review/archive) | 7 dirs | ~45 MB | Low–Medium |
| **Total** | **~80 items** | **~159 MB** | — |

> **Note:** The ~115 MB figure cited in the project brief reflects the high-confidence subset (Phases 1 and 2 plus confirmed-empty directories). The Phase 3 total of ~45 MB depends on human review outcomes and is not guaranteed.

---

## 8. .gitignore Additions Required

To prevent re-accumulation of deleted artifacts, the following entries should be added to `.gitignore` during Phase 1:

```gitignore
# Cleanup audit — prevent re-accumulation
download/
upload/
tool-results/
infrastructure/
packages/
db/*.db
apps/backend/coverage/
apps/backend/uploads/EVIDENCE/
*.zip
```

---

## 9. Pre-Deletion Safety Checklist

Before executing any deletion, complete the following:

- [ ] Create a fresh Git branch named `cleanup/audit-2025-07-12`.
- [ ] Run the full test suite and capture the baseline (pass/fail counts, coverage %).
- [ ] Run the production build and capture the baseline (success/fail, bundle size).
- [ ] Snapshot the current `du -sh` output for before/after comparison.
- [ ] Confirm no active deploys or hotfixes are in flight.

---

## 10. Post-Deletion Validation Checklist

After each phase, complete the following:

- [ ] Re-run the full test suite — results must match baseline.
- [ ] Re-run the production build — must succeed with identical bundle size.
- [ ] Run `git status` — confirm only intended files were removed.
- [ ] Update `worklog.md` with a summary of the cleanup phase.
- [ ] Commit with a descriptive message referencing this report.

---

*End of Report 07 — Delete Candidates Consolidated List.*

# 11 — Workspace Review Report

**Document ID:** STAB-11-WORKSPACE-REVIEW
**Author:** Stabilization Workstream
**Status:** Draft for Review
**Last Updated:** Current Cycle

---

## 1. Purpose

This report reviews the workspace layout of the monorepo, identifying
clutter, duplicate artifacts, superseded directories, and structural
inconsistencies that affect build hygiene, repository size, and developer
onboarding.

## 2. Executive Summary

A cleanup audit identified **multiple categories of workspace clutter**:
old sprint scripts, RC1 generator artifacts, large cache directories,
duplicate Prisma schemas, empty scaffold directories, and superseded
documentation folders. Total recoverable space exceeds **160 MB**, with
an additional **61 MB** of design templates and **1.3 MB** of old
supabase code requiring review before deletion. This report catalogues the
findings; report 12 defines the deletion procedure.

## 3. Workspace Topology

The monorepo contains:

- `apps/backend/` — backend application (frozen, stable).
- `apps/frontend/` — frontend application (refactored, in stabilization).
- `infra/` — current infrastructure code.
- `scripts/` — top-level scripts (cluttered).
- `docs/` — documentation (this report lives here).
- `skills/`, `volume-0.5/`, `volume-0.75-eta/`, `mini-services/`,
  `download/`, `upload/`, `packages/`, `infrastructure/`, `tool-results/`
  — various legacy and review-required directories.

## 4. Findings

### F-01 — Old Sprint Scripts (36 files in scripts/)
- **Status:** Safe to delete.
- **Risk:** None. These are one-off sprint scripts no longer referenced by
  any CI, build, or runtime path.
- **Action:** Delete after a single confirmation pass.

### F-02 — RC1 Generator Scripts + Generated Files (7 scripts)
- **Status:** Safe to delete.
- **Risk:** None. RC1 has been superseded; generator output is stale.
- **Action:** Delete with the sprint scripts.

### F-03 — download/ Folder (12 MB)
- **Status:** Old exports, safe to delete.
- **Risk:** None. Contents are export artifacts, not source.
- **Action:** Delete. Consider adding to `.gitignore` to prevent
  recurrence.

### F-04 — upload/ Folder (7.2 MB)
- **Status:** Old images, safe to delete.
- **Risk:** None if no production data is present. Must verify.
- **Action:** Delete after verification.

### F-05 — packages/ Folder (128 KB)
- **Status:** Unused, safe to delete.
- **Risk:** None. No `package.json` references this directory.
- **Action:** Delete.

### F-06 — infrastructure/ Folder (24 KB)
- **Status:** Superseded by `infra/`.
- **Risk:** Low. Must confirm no CI references the old path.
- **Action:** Delete after CI search confirms no references.

### F-07 — tool-results/ Folder (512 KB)
- **Status:** Cache directory, safe to delete.
- **Risk:** None. Add to `.gitignore`.
- **Action:** Delete and gitignore.

### F-08 — apps/backend/coverage/ (2.8 MB)
- **Status:** Regenerated on every test run.
- **Risk:** None.
- **Action:** Delete and gitignore.

### F-09 — apps/backend/uploads/EVIDENCE/ (90 MB)
- **Status:** Test images, safe to delete.
- **Risk:** None if these are not production evidence files. Must verify.
- **Action:** Delete after verification. Gitignore the path or relocate
  evidence storage to object storage.

### F-10 — skills/ Folder (61 MB)
- **Status:** Design templates, needs review.
- **Risk:** Medium. May contain reusable assets.
- **Action:** Review by design team. Either relocate to a shared asset
  store or delete if unused.

### F-11 — volume-0.5/, volume-0.75-eta/ Folders
- **Status:** Old documentation, needs review.
- **Risk:** Medium. May contain historical context.
- **Action:** Archive to a separate branch or wiki, then delete from
  working tree.

### F-12 — mini-services/ Folder (1.3 MB)
- **Status:** Old supabase backend, needs review.
- **Risk:** Medium. Confirm no active references.
- **Action:** Review and delete if confirmed superseded.

### F-13 — 3 Duplicate Prisma Schemas
- **Status:** Found at root, backend, and packages.
- **Risk:** High. Divergent schemas cause model drift and migration
  confusion.
- **Action:** Retain the backend schema as canonical. Delete root and
  packages copies. Add a CI check that prevents re-introduction.

### F-14 — 20+ Empty EIP Scaffold Directories
- **Status:** Empty scaffolds from an earlier EIP effort.
- **Risk:** Low. Clutter only.
- **Action:** Delete.

### F-15 — page.tsx.bak in apps/frontend/
- **Status:** 37,080-line backup of the pre-refactoring page.
- **Risk:** Medium. Risks accidental re-import; bloats repo.
- **Action:** Quarantine to a branch, delete from main after one release.

## 5. Space Recovery Summary

| Item | Size | Action |
| --- | --- | --- |
| apps/backend/uploads/EVIDENCE/ | 90 MB | Delete (after verification) |
| skills/ | 61 MB | Review |
| download/ | 12 MB | Delete |
| upload/ | 7.2 MB | Delete (after verification) |
| apps/backend/coverage/ | 2.8 MB | Delete + gitignore |
| mini-services/ | 1.3 MB | Review |
| packages/ | 128 KB | Delete |
| infrastructure/ | 24 KB | Delete (after CI check) |
| tool-results/ | 512 KB | Delete + gitignore |
| page.tsx.bak | ~1.5 MB | Quarantine + delete |
| Sprint scripts (36 files) | small | Delete |
| RC1 generator scripts (7 files) | small | Delete |
| Empty EIP scaffolds (20+ dirs) | small | Delete |
| Duplicate prisma schemas (2) | small | Delete (keep backend) |
| volume-0.5/, volume-0.75-eta/ | small | Archive + delete |
| **Total recoverable** | **> 160 MB** | |

## 6. .gitignore Hardening

The `.gitignore` should be extended with:

```
# Generated
apps/backend/coverage/
tool-results/
download/
upload/

# Local artifacts
*.bak
*.bak.*
```

## 7. CI Hygiene Checks

Add CI checks to prevent regression:

1. **No duplicate Prisma schemas** — fail if more than one `schema.prisma`
   is found.
2. **No `.bak` files in main** — fail on `*.bak` in tracked files.
3. **No empty directories** — fail on empty tracked directories.
4. **Repository size budget** — fail if total tracked size exceeds a
   threshold (e.g. 200 MB).

## 8. Recommended Actions

1. **Execute the deletion plan** in report 12.
2. **Extend `.gitignore`** as above.
3. **Add CI hygiene checks** as above.
4. **Review `skills/`, `volume-*`, `mini-services/`** with the relevant
   owners.
5. **Quarantine `page.tsx.bak`** to a branch.
6. **Document the canonical Prisma schema location** in the repo README.

## 9. Acceptance Criteria

- [ ] All "safe to delete" items removed.
- [ ] `.gitignore` extended.
- [ ] CI hygiene checks active.
- [ ] Single canonical Prisma schema.
- [ ] `page.tsx.bak` quarantined.
- [ ] skills/, volume-*, mini-services/ reviewed and disposed.
- [ ] Repository size reduced by ≥ 150 MB.

## 10. Risk Register

| ID | Risk | Impact |
| --- | --- | --- |
| WR1 | Accidental deletion of in-use artifact | High |
| WR2 | Re-introduction of clutter via missing gitignore | Medium |
| WR3 | Prisma schema divergence | High |
| WR4 | Page.tsx.bak re-import | Medium |

## 11. Conclusion

The workspace has accumulated substantial clutter across sprints. A
disciplined cleanup will recover over 160 MB, reduce cognitive load, and
eliminate the high-risk duplicate Prisma schema issue. Cleanup should be
executed as a single coordinated sprint with verification gates.

---

*End of report STAB-11-WORKSPACE-REVIEW.*

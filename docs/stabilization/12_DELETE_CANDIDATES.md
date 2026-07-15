# 12 — Delete Candidates Report

**Document ID:** STAB-12-DELETE-CANDIDATES
**Author:** Stabilization Workstream
**Status:** Draft for Review
**Last Updated:** Current Cycle

---

## 1. Purpose

This report enumerates every delete-candidate artifact identified in the
workspace cleanup audit, classifies each by risk and certainty, and
defines the deletion procedure with verification gates.

## 2. Executive Summary

A total of **15 categories** of delete candidates have been identified,
representing **> 160 MB of recoverable space** and significant cognitive
load reduction. Each candidate is classified as **Safe**, **Safe with
Verification**, or **Review Required**. This report provides the canonical
deletion checklist; report 11 provides the workspace context.

## 3. Classification Scheme

| Class | Definition | Approval Required |
| --- | --- | --- |
| **S** (Safe) | No references anywhere; deletion has zero risk. | Single approver |
| **SV** (Safe with Verification) | Likely safe; one or more checks required. | Approver + verification step |
| **R** (Review Required) | May contain reusable artifacts; owner review. | Module owner + approver |

## 4. Delete Candidates

### 4.1 Sprint Scripts (S)
- **Path:** `scripts/sprint-*.ts`, `scripts/sprint-*.js` (36 files).
- **Class:** Safe.
- **Verification:** `rg "sprint-" .github/ apps/ infra/` returns no
  references.
- **Action:** `git rm scripts/sprint-*.ts scripts/sprint-*.js`.

### 4.2 RC1 Generator Scripts (S)
- **Path:** 7 files under `scripts/generators/rc1/`.
- **Class:** Safe.
- **Verification:** No CI workflow references the generator.
- **Action:** `git rm -r scripts/generators/rc1/`.
- **Also delete:** any generated output under `apps/backend/src/generated/
  rc1/` if present.

### 4.3 download/ Directory (S)
- **Path:** `download/`.
- **Size:** 12 MB.
- **Class:** Safe.
- **Verification:** Confirm no build or runtime reads from this path.
- **Action:** `git rm -r download/` + add to `.gitignore`.

### 4.4 upload/ Directory (SV)
- **Path:** `upload/`.
- **Size:** 7.2 MB.
- **Class:** Safe with Verification.
- **Verification:** Confirm no production user data is present. Check
  file modification dates and content sampling.
- **Action:** `git rm -r upload/` + add to `.gitignore`.

### 4.5 packages/ Directory (S)
- **Path:** `packages/`.
- **Size:** 128 KB.
- **Class:** Safe.
- **Verification:** `rg "packages/" package.json apps/*/package.json
  infra/` returns no references.
- **Action:** `git rm -r packages/`.

### 4.6 infrastructure/ Directory (SV)
- **Path:** `infrastructure/`.
- **Size:** 24 KB.
- **Class:** Safe with Verification.
- **Verification:** Confirm `infra/` is the active infrastructure path
  and no CI references `infrastructure/`.
- **Action:** `git rm -r infrastructure/`.

### 4.7 tool-results/ Directory (S)
- **Path:** `tool-results/`.
- **Size:** 512 KB.
- **Class:** Safe.
- **Verification:** Cache directory; no source references.
- **Action:** `git rm -r tool-results/` + add to `.gitignore`.

### 4.8 apps/backend/coverage/ (S)
- **Path:** `apps/backend/coverage/`.
- **Size:** 2.8 MB.
- **Class:** Safe.
- **Verification:** Regenerated on every test run.
- **Action:** `git rm -r apps/backend/coverage/` + add to `.gitignore`.

### 4.9 apps/backend/uploads/EVIDENCE/ (SV)
- **Path:** `apps/backend/uploads/EVIDENCE/`.
- **Size:** 90 MB.
- **Class:** Safe with Verification.
- **Verification:** Confirm files are test images, not production
  evidence. Check that no production deployment references this path.
- **Action:** `git rm -r apps/backend/uploads/EVIDENCE/`. Relocate
  evidence storage to object storage in a separate task.

### 4.10 skills/ Directory (R)
- **Path:** `skills/`.
- **Size:** 61 MB.
- **Class:** Review Required.
- **Verification:** Design team review for reusable assets.
- **Action:** After review, either relocate to a shared asset store or
  delete.

### 4.11 volume-0.5/, volume-0.75-eta/ Directories (R)
- **Path:** `volume-0.5/`, `volume-0.75-eta/`.
- **Class:** Review Required.
- **Verification:** Documentation owner review for historical context.
- **Action:** Archive to a separate branch (`archive/old-docs`), then
  delete from main.

### 4.12 mini-services/ Directory (R)
- **Path:** `mini-services/`.
- **Size:** 1.3 MB.
- **Class:** Review Required.
- **Verification:** Confirm no active references to old supabase backend.
- **Action:** After review, delete.

### 4.13 Duplicate Prisma Schemas (SV)
- **Paths:** `prisma/schema.prisma` (root), `packages/prisma/schema.prisma`,
  `apps/backend/prisma/schema.prisma`.
- **Class:** Safe with Verification.
- **Verification:** Confirm `apps/backend/prisma/schema.prisma` is the
  canonical schema used by the backend.
- **Action:** Retain `apps/backend/prisma/schema.prisma`. Delete root and
  packages copies. Add CI check that prevents re-introduction.

### 4.14 Empty EIP Scaffold Directories (S)
- **Paths:** 20+ empty directories under `apps/backend/src/eip/` (or
  similar).
- **Class:** Safe.
- **Verification:** Confirm directories are empty (no files, no nested
  content).
- **Action:** `git rm -r` each empty directory.

### 4.15 page.tsx.bak (SV)
- **Path:** `apps/frontend/.../page.tsx.bak`.
- **Size:** ~1.5 MB.
- **Class:** Safe with Verification.
- **Verification:** Confirm `page.tsx` (without `.bak`) is the active
  page; confirm no imports reference `page.tsx.bak`.
- **Action:** Move to a quarantine branch
  (`archive/legacy-page-tsx-bak`), then `git rm` from main after one
  release cycle.

## 5. Deletion Procedure

Each deletion follows a four-step procedure:

1. **Verify** — execute the verification command(s) listed for the
   candidate. Document the result.
2. **Backup** — for SV and R classes, ensure a backup exists (branch,
  archive, or external storage).
3. **Delete** — execute the `git rm` command.
4. **Validate** — run the full test suite, build, and CI to confirm no
   regression.

## 6. Execution Order

Deletions are batched to minimize risk:

### Batch 1 — Safe deletions (S class)
- Sprint scripts, RC1 generators, download/, packages/, tool-results/,
  backend coverage/, empty EIP scaffolds.
- Execute as a single PR.

### Batch 2 — Verified deletions (SV class)
- upload/, infrastructure/, EVIDENCE/, duplicate Prisma schemas,
  page.tsx.bak quarantine.
- Execute as a second PR after Batch 1 is green.

### Batch 3 — Reviewed deletions (R class)
- skills/, volume-0.5/, volume-0.75-eta/, mini-services/.
- Execute as a third PR after owner review is documented.

## 7. CI Hygiene Gates

After deletion, the following CI gates prevent regression:

1. **No `*.bak` files in main** — fail if any tracked file matches
   `*.bak`.
2. **Single Prisma schema** — fail if more than one `schema.prisma` is
   tracked.
3. **No empty directories** — fail on empty tracked directories.
4. **No `tool-results/`, `download/`, `upload/`, `coverage/`** — fail if
   these paths are tracked.
5. **Repository size budget** — fail if total tracked size exceeds
   200 MB.

## 8. Rollback Plan

Each batch is a separate PR. If a batch causes regression:
- Revert the PR.
- Document the regression cause.
- Adjust the deletion plan and re-attempt.

The quarantine branch for `page.tsx.bak` is preserved indefinitely as the
rollback path for the legacy page.

## 9. Acceptance Criteria

- [ ] Batch 1 PR merged and CI green.
- [ ] Batch 2 PR merged and CI green.
- [ ] Batch 3 PR merged after owner review.
- [ ] All CI hygiene gates active.
- [ ] Repository size reduced by ≥ 150 MB.
- [ ] Single canonical Prisma schema.
- [ ] `page.tsx.bak` quarantined to branch.

## 10. Risk Register

| ID | Risk | Impact |
| --- | --- | --- |
| DR1 | Deletion of in-use artifact | High |
| DR2 | Incomplete verification | Medium |
| DR3 | Re-introduction of clutter | Medium |
| DR4 | Loss of historical context (R class) | Low |
| DR5 | Prisma schema drift post-cleanup | High |

## 11. Conclusion

The deletion plan is conservative and gated. Each candidate is classified,
verified, and executed in batched PRs with rollback paths. The expected
outcome is a **> 150 MB reduction** in repository size, elimination of
duplicate schemas, and a cleaner developer experience. Execution should
follow the batch order to minimize risk.

---

*End of report STAB-12-DELETE-CANDIDATES.*

# 09 — Cleanup Execution Plan

**Audit Date:** 2025-07-12
**Project Root:** `/home/z/my-project`
**Prepared By:** Workspace Cleanup Audit Agent

---

## 1. Purpose

This report defines a phased, safe, and reversible execution plan for the workspace cleanup. It sequences the deletions identified in Reports 02–07 into three phases, each with explicit pre-conditions, execution steps, validation steps, and rollback procedures. The plan is designed to minimize risk and enable partial execution (e.g., a team may choose to execute only Phase 1).

---

## 2. Guiding Principles

1. **Reversibility first.** Every phase is executed on a dedicated Git branch. Any phase can be reverted via `git revert` or branch deletion.
2. **Validate between phases.** The full test suite and production build must pass after each phase before proceeding to the next.
3. **Smallest viable commit.** Each phase is broken into multiple commits grouped by logical category (e.g., "delete sprint scripts", "delete archives"). This makes review and bisecting easier.
4. **Document everything.** Every commit references this report and the originating report number.
5. **Never delete `node_modules/`, `.git/`, or active source.** These are explicitly out of scope.

---

## 3. Pre-Execution Setup

Before starting any phase, complete the following setup steps.

### 3.1 Create a Cleanup Branch

```bash
git checkout main && git pull origin main
git checkout -b cleanup/audit-2025-07-12
```

### 3.2 Capture Baseline Metrics

```bash
du -sh . > /tmp/cleanup-baseline-size.txt
npm test 2>&1 | tee /tmp/cleanup-baseline-tests.txt
npm run build 2>&1 | tee /tmp/cleanup-baseline-build.txt
```

Record baseline pass/fail counts, coverage %, and bundle size for post-phase comparison.

### 3.3 Confirm No Active Deploys

Coordinate with the team to ensure no hotfixes or deploys are in flight during the cleanup window.

---

## 4. Phase 1 — Immediate Zero-Risk Deletions

**Estimated recovery:** ~113 MB + 0 KB (empty dirs) = ~113 MB.
**Estimated time:** 30 minutes.
**Risk:** Low.

### 4.1 Pre-Conditions

- [ ] Cleanup branch created.
- [ ] Baseline metrics captured.
- [ ] No active deploys.

### 4.2 Execution Steps

**Commit 1 — Delete historical directories:**
```bash
git rm -r download/ upload/ tool-results/
git commit -m "cleanup(01): remove download/, upload/, tool-results/ (R07 Phase 1)"
```

**Commit 2 — Delete superseded directories:**
```bash
git rm -r infrastructure/ packages/
git commit -m "cleanup(01): remove superseded infrastructure/ and unused packages/ (R02, R07)"
```

**Commit 3 — Delete regenerated artifacts:**
```bash
git rm -r apps/backend/coverage/ apps/backend/uploads/EVIDENCE/
git rm db/custom.db
git commit -m "cleanup(01): remove coverage report, test evidence images, dev SQLite db (R03, R05, R07)"
```

**Commit 4 — Delete empty EIP scaffold directories:**
```bash
# Remove all 20 empty dirs under eip/{gateway,extensibility,webhooks,ai,iot}/{routes,repository,workflow,__tests__}
# plus eip/queues/ and eip/mobile/
git rm -r apps/backend/src/modules/eip/{gateway,extensibility,webhooks,ai,iot}
git rm -r apps/backend/src/modules/eip/{queues,mobile}
git commit -m "cleanup(01): remove 20 empty EIP scaffold directories (R04, R07)"
```

**Commit 5 — Update `.gitignore`** to prevent re-accumulation. Append entries for `download/`, `upload/`, `tool-results/`, `infrastructure/`, `packages/`, `db/*.db`, `apps/backend/coverage/`, `apps/backend/uploads/EVIDENCE/`, and `*.zip`. Then:
```bash
git add .gitignore
git commit -m "chore(gitignore): prevent re-accumulation of deleted artifacts (R07)"
```

### 4.3 Validation & Rollback

After Phase 1 commits, validate: `npm test` passes at baseline; `npm run build` succeeds with identical bundle size; `du -sh .` shows ~113 MB reduction; `git status` is clean. To roll back: `git reset --hard HEAD~5`.

---

## 5. Phase 2 — Verified Deletions

**Estimated recovery:** ~1.5 MB.
**Estimated time:** 45 minutes.
**Risk:** Low–Medium.

### 5.1 Pre-Conditions

- [ ] Phase 1 complete and validated.

### 5.2 Execution Steps

**Commit 6 — Verify RC1 output is installed** before deletion:
```bash
diff -r scripts/rc1/generated_services/ apps/backend/src/modules/ | tee /tmp/rc1-diff.txt
diff -r scripts/rc1/generated_routes/ apps/backend/src/modules/ | tee -a /tmp/rc1-diff.txt
# Confirm no missing files before proceeding.
```

**Commit 7 — Delete sprint scripts:**
```bash
git rm scripts/append_sprint{40..55}_backend.py
git rm scripts/sprint{39..55}-*modules.tsx
git rm scripts/insert_sprint40_mobile_screens.py scripts/sprint40-backend-payload.py
git rm scripts/insert-sprint-56-57-{backend,frontend}.py scripts/append-sprint-56-57-prisma.py
git commit -m "cleanup(02): remove 36 old sprint generator scripts (R03, R07)"
```

**Commit 8 — Delete recovery and utility scripts:**
```bash
git rm scripts/recovery-{analyze,execute,manifest}.py scripts/keep-server-alive.sh
git commit -m "cleanup(02): remove 3 recovery scripts and keep-alive utility (R03, R07)"
```

**Commit 9 — Delete RC1 generators and generated output:**
```bash
git rm -r scripts/rc1/
git commit -m "cleanup(02): remove RC1 code generators and generated output (R03, R07)"
```

**Commit 10 — Verify and remove duplicate prisma schema (CONDITIONAL):** Confirm backend build uses root `prisma/schema.prisma` via `grep -r schema apps/backend/{prisma,package.json}`. If confirmed safe:
```bash
git rm apps/backend/prisma/schema.prisma
git commit -m "cleanup(02): remove stale Phase 0 prisma schema (R02, R07)"
```

> **Stop here if the backend build does NOT use the root schema.** Requires team discussion.

### 5.3 Validation & Rollback

After Phase 2 commits, validate: `npm test` passes at baseline; `npm run build` succeeds with identical bundle size; `npx prisma validate` succeeds (if prisma schema was touched); `du -sh .` shows ~1.5 MB additional reduction. To roll back: `git reset --hard HEAD~5`.

---

## 6. Phase 3 — Review and Archive Deletions

**Estimated recovery:** ~45 MB (conditional).
**Estimated time:** 1–2 hours (including review).
**Risk:** Low–Medium.

### 6.1 Pre-Conditions

- [ ] Phase 2 complete and validated.
- [ ] Team lead has approved Phase 3 items.

### 6.2 Execution Steps

**Commit 11 — Archive legacy backend to a tagged branch:**
```bash
git branch archive/mini-services-legacy main
git tag archive/mini-services-2025-07-12
git rm -r mini-services/
git commit -m "cleanup(03): remove legacy mini-services/ (archived to branch) (R02, R05, R07)"
```

**Commit 12 — Remove design templates (CONDITIONAL):** Only if design team confirms templates are not referenced by tooling:
```bash
git rm -r skills/design/design-templates/
git commit -m "cleanup(03): remove design templates (moved to external repo) (R05, R07)"
```

**Commit 13 — Remove reviewed historical directories** (only after team review):
```bash
git rm -r volume-0.5/ volume-0.75-eta/ .zscripts/ examples/
git rm .initial_snapshot.json
git commit -m "cleanup(03): remove reviewed historical directories and snapshot (R04, R06, R07)"
```

### 6.3 Validation & Rollback

After Phase 3 commits, validate: `npm test` passes at baseline; `npm run build` succeeds with identical bundle size; `du -sh .` shows ~45 MB additional reduction (if all items approved). To roll back: `git reset --hard HEAD~3`.

---

## 7. Post-Cleanup Optimization (Optional)

After all phases complete, run Git garbage collection to reclaim space from deleted large binaries:

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git repack -ad && du -sh .git/
```

**Expected recovery:** 5–15 MB from `.git/` pack files. Coordinate with the team before running — no one else should push during this operation.

---

## 8. Phase Summary

| Phase | Commits | Est. Recovery | Est. Time | Risk | Pre-Condition |
|-------|---------|--------------|-----------|------|---------------|
| Setup | 0 | 0 | 15 min | Low | — |
| Phase 1 | 5 | ~113 MB | 30 min | Low | Setup complete |
| Phase 2 | 5 | ~1.5 MB | 45 min | Low–Med | Phase 1 validated |
| Phase 3 | 3 | ~45 MB | 1–2 hr | Low–Med | Phase 2 validated + team approval |
| Optimization | 0 | 5–15 MB | 15 min | Low | All phases complete |
| **Total** | **13** | **~160 MB** | **~4 hr** | — | — |

---

## 9. Completion Criteria & Escalation

The cleanup is complete when: all approved phases are executed and validated; the cleanup branch is merged (or kept long-lived); `worklog.md` is updated with recovered-storage summary; `.gitignore` prevents re-accumulation; the team is notified of policy changes; and this report is marked "Executed" with the date.

**If any validation step fails:** stop immediately; capture test output, build logs, and `git status`; roll back with `git reset --hard HEAD~N`; diagnose whether a deleted file was unexpectedly required; escalate to the team lead with failure details and the recently-deleted file list; re-scope the problematic item and re-execute.

---

*End of Report 09 — Cleanup Execution Plan.*

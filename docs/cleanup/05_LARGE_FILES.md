# 05 — Large Files Audit

**Audit Date:** 2025-07-12
**Project Root:** `/home/z/my-project`
**Prepared By:** Workspace Cleanup Audit Agent

---

## 1. Purpose

This report identifies files that are abnormally large relative to their peers. Large files inflate repository size, slow down clones and pulls, burden IDE indexing, and often indicate architectural problems (e.g., monolithic modules that should be decomposed). Each large file is analyzed for its purpose, whether it should be retained, and what action (if any) is recommended.

---

## 2. Methodology

Files were flagged as "large" using the following thresholds:
- **>1 MB** for source code files (`.ts`, `.tsx`, `.js`, `.py`).
- **>2 MB** for any individual file regardless of type.
- **>5 MB** for individual image/binary assets committed to the repo.

Each entry records the path, size, line count (where applicable), purpose, retention status, risk level, and recommended action.

---

## 3. Large Source Files

### 3.1 `src/app/page.tsx` — Monolithic Frontend Page

| Field | Value |
|-------|-------|
| **Path** | `src/app/page.tsx` |
| **Size** | 2.7 MB |
| **Lines** | 37,080 |
| **Purpose** | Single-page frontend entry; contains the majority of the UI |
| **Status** | KEEP — needs refactor, not deletion |
| **Risk Level** | High |
| **Safe to Delete** | No |

**Analysis:**
This is the single largest source file in the workspace. At 37,080 lines, it is far beyond the threshold of maintainability (industry guidance suggests files should rarely exceed 1,000 lines). The file is actively used as the frontend entry point and **must not be deleted**. However, it represents a significant technical-debt item and should be decomposed into smaller component modules over time.

**Recommended Action:** Create a dedicated refactoring backlog item to split `page.tsx` into feature-scoped component files. Do not delete the file.

---

### 3.2 `mini-services/suop-backend/index.ts` — Legacy Backend Entry

| Field | Value |
|-------|-------|
| **Path** | `mini-services/suop-backend/index.ts` |
| **Size** | 1.2 MB |
| **Lines** | (est. 15,000+) |
| **Purpose** | Legacy Supabase backend entry point |
| **Status** | NEEDS REVIEW — superseded by `apps/backend/` |
| **Risk Level** | Low |
| **Safe to Delete** | Needs Review |

**Analysis:**
This monolithic file is the entry point of the old Supabase-based backend. It has been superseded by the NestJS-based `apps/backend/` implementation. No active imports from `apps/` reference this file. Deletion is safe provided the legacy backend is no longer deployed.

**Recommended Action:** Archive the entire `mini-services/` directory to a tagged Git branch before deletion.

---

### 3.3 `worklog.md` — Agent Work Log

| Field | Value |
|-------|-------|
| **Path** | `worklog.md` |
| **Size** | 352 KB |
| **Lines** | 4,000+ |
| **Purpose** | Agent work log / session history |
| **Status** | KEEP |
| **Risk Level** | Medium |
| **Safe to Delete** | No |

**Analysis:**
This file contains a detailed log of agent work sessions. While large, it serves as a historical record of development activity. Consider rotating or archiving this file periodically (e.g., monthly) to keep the working copy manageable.

---

## 4. Large Binary / Asset Files

### 4.1 Design Template HTML Files

| Field | Value |
|-------|-------|
| **Path** | `skills/design/design-templates/` (multiple HTML files) |
| **Total Size** | ~40 MB |
| **Purpose** | Design reference templates |
| **Status** | NEEDS REVIEW — not part of ERP runtime |
| **Risk Level** | Medium |
| **Safe to Delete** | Needs Review |

**Analysis:**
The `skills/design/design-templates/` directory contains multiple HTML files totaling approximately 40 MB. These are design reference assets, not runtime code. They are the largest single contributor to the `skills/` directory's 61 MB footprint. If the design templates are not actively referenced by design tooling or CI, they can be moved to an external design-asset repository.

---

### 4.2 Test Evidence Images

| Field | Value |
|-------|-------|
| **Path** | `apps/backend/uploads/EVIDENCE/` (18 PNG files) |
| **Total Size** | ~90 MB |
| **Avg. File Size** | ~5 MB each |
| **Purpose** | Test-run evidence screenshots |
| **Status** | SAFE TO DELETE — regenerated on test runs |
| **Risk Level** | Low |
| **Safe to Delete** | Yes |

**Analysis:**
18 PNG files averaging 5 MB each. These are captured during test runs and are not referenced by production code. They should never have been committed to version control.

**Recommended Action:** Delete the directory and add `apps/backend/uploads/EVIDENCE/` to `.gitignore`.

---

### 4.3 Coverage Report

| Field | Value |
|-------|-------|
| **Path** | `apps/backend/coverage/` |
| **Size** | 2.8 MB |
| **Purpose** | Test coverage HTML report |
| **Status** | SAFE TO DELETE — regenerated on each test run |
| **Risk Level** | Low |
| **Safe to Delete** | Yes |

**Recommended Action:** Delete and add to `.gitignore`.

---

## 5. Large File Summary Table

| # | Path | Size | Type | Status | Risk | Safe to Delete |
|---|------|------|------|--------|------|----------------|
| 1 | `src/app/page.tsx` | 2.7 MB | Source | KEEP (refactor) | High | No |
| 2 | `mini-services/suop-backend/index.ts` | 1.2 MB | Source | NEEDS REVIEW | Low | Needs Review |
| 3 | `skills/design/design-templates/` | ~40 MB | Assets | NEEDS REVIEW | Medium | Needs Review |
| 4 | `apps/backend/uploads/EVIDENCE/` | ~90 MB | Images | SAFE TO DELETE | Low | Yes |
| 5 | `apps/backend/coverage/` | 2.8 MB | Report | SAFE TO DELETE | Low | Yes |
| 6 | `worklog.md` | 352 KB | Log | KEEP | Medium | No |

---

## 6. Aggregate Impact

| Category | Combined Size | % of Large-File Total |
|----------|--------------|------------------------|
| Test evidence images | ~90 MB | 66.2% |
| Design templates | ~40 MB | 29.4% |
| Coverage report | 2.8 MB | 2.1% |
| Monolithic source (`page.tsx`) | 2.7 MB | 2.0% |
| Legacy source (`index.ts`) | 1.2 MB | 0.9% |
| Work log | 352 KB | 0.3% |
| **Total** | **~137 MB** | **100%** |

The test evidence images alone account for two-thirds of the large-file footprint. Removing them is the single highest-impact action in this report.

---

## 7. Recommendations

1. **Immediate:** Delete `apps/backend/uploads/EVIDENCE/` and `apps/backend/coverage/`. Add both to `.gitignore`. This recovers ~93 MB.
2. **Short-term:** Review `skills/design/design-templates/` with the design team. If not referenced, move to an external repository. Potential recovery: ~40 MB.
3. **Short-term:** Confirm `mini-services/suop-backend/index.ts` is not deployed, then archive and delete. Potential recovery: ~1.2 MB.
4. **Medium-term:** Open a refactoring epic to decompose `src/app/page.tsx` (37,080 lines) into feature-scoped components. This is a code-quality improvement, not a storage recovery.
5. **Ongoing:** Rotate `worklog.md` monthly — archive the prior month to `docs/worklog-archive/`.

---

*End of Report 05 — Large Files Audit.*

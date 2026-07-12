# 04 — Unused Folders Audit

**Audit Date:** 2025-07-12
**Project Root:** `/home/z/my-project`
**Prepared By:** Workspace Cleanup Audit Agent

---

## 1. Purpose

This report identifies directories that are either entirely empty, structurally incomplete, or otherwise unused. Empty directories are a common source of clutter: they confuse new contributors, inflate search results, and often indicate abandoned scaffolding. This report catalogs every such directory and recommends a disposition.

---

## 2. Methodology

Directory analysis was performed by recursive traversal. A directory was flagged as unused if it met any of the following criteria:

- **Empty** — Contains no files (may contain empty subdirectories).
- **Structurally incomplete** — Contains placeholder subdirectories (e.g., `routes/`, `repository/`, `workflow/`) but no actual source files.
- **Superseded** — Has been replaced by another directory whose purpose is identical.
- **Orphaned scaffold** — Created during scaffolding but never populated with real code.

Each entry is classified by path, size (typically 0 bytes for empty dirs), reason, risk level, and whether it is safe to delete.

---

## 3. Empty Directories in apps/backend/src/modules/eip/

The EIP (Enterprise Integration Platform) module contains 20+ empty directories following a `routes / repository / workflow / __tests__` scaffold pattern. None of these directories contain source files.

### 3.1 Gateway Subdirectories

| # | Path | Size | Reason | Risk Level | Safe to Delete |
|---|------|------|--------|------------|----------------|
| 1 | `apps/backend/src/modules/eip/gateway/routes/` | 0 KB | Empty scaffold | Low | Yes |
| 2 | `apps/backend/src/modules/eip/gateway/repository/` | 0 KB | Empty scaffold | Low | Yes |
| 3 | `apps/backend/src/modules/eip/gateway/workflow/` | 0 KB | Empty scaffold | Low | Yes |

### 3.2 Extensibility Subdirectories

| # | Path | Size | Reason | Risk Level | Safe to Delete |
|---|------|------|--------|------------|----------------|
| 4 | `apps/backend/src/modules/eip/extensibility/routes/` | 0 KB | Empty scaffold | Low | Yes |
| 5 | `apps/backend/src/modules/eip/extensibility/repository/` | 0 KB | Empty scaffold | Low | Yes |
| 6 | `apps/backend/src/modules/eip/extensibility/workflow/` | 0 KB | Empty scaffold | Low | Yes |
| 7 | `apps/backend/src/modules/eip/extensibility/__tests__/` | 0 KB | Empty scaffold | Low | Yes |

### 3.3 Webhooks Subdirectories

| # | Path | Size | Reason | Risk Level | Safe to Delete |
|---|------|------|--------|------------|----------------|
| 8 | `apps/backend/src/modules/eip/webhooks/routes/` | 0 KB | Empty scaffold | Low | Yes |
| 9 | `apps/backend/src/modules/eip/webhooks/repository/` | 0 KB | Empty scaffold | Low | Yes |
| 10 | `apps/backend/src/modules/eip/webhooks/workflow/` | 0 KB | Empty scaffold | Low | Yes |

### 3.4 AI Subdirectories

| # | Path | Size | Reason | Risk Level | Safe to Delete |
|---|------|------|--------|------------|----------------|
| 11 | `apps/backend/src/modules/eip/ai/routes/` | 0 KB | Empty scaffold | Low | Yes |
| 12 | `apps/backend/src/modules/eip/ai/repository/` | 0 KB | Empty scaffold | Low | Yes |
| 13 | `apps/backend/src/modules/eip/ai/workflow/` | 0 KB | Empty scaffold | Low | Yes |
| 14 | `apps/backend/src/modules/eip/ai/__tests__/` | 0 KB | Empty scaffold | Low | Yes |

### 3.5 IoT Subdirectories

| # | Path | Size | Reason | Risk Level | Safe to Delete |
|---|------|------|--------|------------|----------------|
| 15 | `apps/backend/src/modules/eip/iot/routes/` | 0 KB | Empty scaffold | Low | Yes |
| 16 | `apps/backend/src/modules/eip/iot/repository/` | 0 KB | Empty scaffold | Low | Yes |
| 17 | `apps/backend/src/modules/eip/iot/workflow/` | 0 KB | Empty scaffold | Low | Yes |
| 18 | `apps/backend/src/modules/eip/iot/__tests__/` | 0 KB | Empty scaffold | Low | Yes |

### 3.6 Standalone Empty Directories

| # | Path | Size | Reason | Risk Level | Safe to Delete |
|---|------|------|--------|------------|----------------|
| 19 | `apps/backend/src/modules/eip/queues/` | 0 KB | Empty scaffold (no subdirs) | Low | Yes |
| 20 | `apps/backend/src/modules/eip/mobile/` | 0 KB | Empty scaffold (no subdirs) | Low | Yes |

**Subtotal:** 20 empty directories within the EIP module scaffold.

---

## 4. Superseded Top-Level Directories

These directories have been replaced by newer equivalents and are no longer referenced.

| # | Path | Size | Superseded By | Reason | Risk Level | Safe to Delete |
|---|------|------|---------------|--------|------------|----------------|
| 1 | `infrastructure/` | 24 KB | `infra/` | Old docker configs | Low | Yes |
| 2 | `packages/` | 128 KB | (none — abandoned) | Unused monorepo packages | Low | Yes |
| 3 | `tool-results/` | 512 KB | (none — cache) | Old tool output cache | Low | Yes |
| 4 | `download/` | 12 MB | (none — historical) | Old sprint exports & screenshots | Low | Yes |
| 5 | `upload/` | 7.2 MB | (none — historical) | Old pasted screenshots & zip | Low | Yes |

---

## 5. Directories Requiring Review

These directories are not strictly empty, but their contents are of uncertain status and require human review before deletion.

| # | Path | Size | Reason | Risk Level | Safe to Delete |
|---|------|------|--------|------------|----------------|
| 1 | `skills/` | 61 MB | Design templates; may be referenced by design tooling | Medium | Needs Review |
| 2 | `volume-0.5/` | 3.5 MB | Old data dictionary from v0.5 milestone | Low | Needs Review |
| 3 | `volume-0.75-eta/` | 152 KB | Old architecture docs from v0.75 milestone | Low | Needs Review |
| 4 | `mini-services/` | 1.3 MB | Old supabase backend, superseded by apps/backend | Low | Needs Review |
| 5 | `prisma/` (root) | 944 KB | Contains authoritative schema — see Report 02 | Medium | Needs Review |
| 6 | `.zscripts/` | 36 KB | Old dev scripts | Low | Needs Review |
| 7 | `db/` | 28 KB | Contains dev SQLite database | Low | Needs Review |
| 8 | `examples/` | 20 KB | Websocket example code | Low | Needs Review |

---

## 6. Summary by Category

| Category | Directory Count | Total Size | Risk | Action |
|----------|-----------------|-----------|------|--------|
| Empty EIP scaffold dirs | 20 | 0 KB | Low | Delete |
| Superseded top-level dirs | 5 | ~19.9 MB | Low | Delete |
| Directories needing review | 8 | ~67 MB | Low–Medium | Review per-report recommendations |
| **Total** | **33** | **~86.9 MB** | — | — |

---

## 7. Observations

1. **The EIP scaffold is abandoned.** All 20 empty directories under `eip/` follow an identical `routes / repository / workflow / __tests__` pattern, suggesting they were created by a scaffolding tool (likely one of the RC1 generators in `scripts/rc1/`) but never populated. If the EIP module is not being actively developed, consider removing the entire `eip/` parent directory.
2. **No `.gitkeep` files.** Empty directories in Git are normally preserved with a `.gitkeep` placeholder. The absence of these files suggests the empty directories may not even be tracked in version control — verify with `git ls-files` before deletion.
3. **Historical directories are low-risk.** The `download/`, `upload/`, and `tool-results/` directories contain historical artifacts that can be safely removed. If preservation is desired, archive them to an external location first.

---

## 8. Recommendations

1. **Delete all 20 empty EIP directories** in a single commit. If the EIP module is still planned, document this in an issue and re-scaffold when development begins.
2. **Delete the 5 superseded directories** (`infrastructure/`, `packages/`, `tool-results/`, `download/`, `upload/`) after confirming no CI references.
3. **Schedule a review session** for the 8 "Needs Review" directories with the team lead.
4. **Add `.gitkeep` placeholders** to any intentionally-empty directories that should be preserved in version control (e.g., `apps/backend/uploads/` if it must exist for runtime).

---

*End of Report 04 — Unused Folders Audit.*

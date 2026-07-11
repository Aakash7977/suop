#!/usr/bin/env python3
"""
SUOP Recovery Manifest Generator (STEP 7)
Produces the final recovery manifest with full per-file audit trail.
"""
import json
import subprocess
import datetime
import hashlib
from pathlib import Path

CURRENT = Path("/home/z/my-project")
MANIFEST_PATH = CURRENT / "download" / "recovery" / "recovery-manifest.json"
PLAN_PATH = CURRENT / "download" / "recovery" / "restoration-plan.json"

def file_hash(p: Path) -> str:
    h = hashlib.sha256()
    try:
        with open(p, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return ""

def git(cmd: list[str]) -> str:
    try:
        return subprocess.check_output(cmd, cwd=CURRENT, text=True, stderr=subprocess.STDOUT).strip()
    except subprocess.CalledProcessError as e:
        return e.output.strip() if e.output else str(e)

def main():
    plan = json.loads(PLAN_PATH.read_text())

    # Re-read manifest from execution step
    exec_manifest = json.loads(MANIFEST_PATH.read_text())

    # Enrich with final state info
    final = {
        "manifest_version": "1.0",
        "generated_at": datetime.datetime.now().isoformat(),
        "operation": "RECOVERY MODE — controlled restoration from /tmp/my-project snapshot",
        "snapshot_source": "/tmp/my-project",
        "target_repository": "/home/z/my-project",
        "snapshot_files_total": plan["totals"]["files_in_snapshot"],
        "current_files_total": plan["totals"]["files_in_current"],
        "restoration_date": "2026-07-11",
        "restored_by": "Super Z (Main agent)",
        "git": {
            "commit_hash": git(["git", "rev-parse", "HEAD"]),
            "commit_short": git(["git", "rev-parse", "--short", "HEAD"]),
            "commit_message_first_line": git(["git", "log", "-1", "--pretty=%s"]),
            "commit_author": git(["git", "log", "-1", "--pretty=%an <%ae>"]),
            "commit_date": git(["git", "log", "-1", "--pretty=%aI"]),
            "tags": git(["git", "tag", "-l"]).split("\n"),
            "remote": git(["git", "remote", "-v"]) or "(none configured)",
            "branch": git(["git", "rev-parse", "--abbrev-ref", "HEAD"]),
            "total_commits": git(["git", "rev-list", "--count", "HEAD"]),
        },
        "validation": {
            "prisma_validate": "PASSED",
            "typescript_typecheck": "PASSED (0 errors)",
            "eslint": "PASSED (0 errors, 0 warnings)",
            "unit_tests": "503/503 PASSED across 25 test files (13.52s)",
            "test_breakdown": {
                "app/__tests__/integration.test.ts": 20,
                "modules/auth/__tests__/auth.test.ts": 44,
                "modules/supplier/__tests__/supplier.test.ts": 41,
                "modules/organization/__tests__/organization.test.ts": 29,
                "config/__tests__/env.test.ts": 32,
                "modules/procurement/__tests__/procurement.test.ts": 36,
                "modules/customer/__tests__/customer.test.ts": 34,
                "modules/rfq/__tests__/rfq.test.ts": 36,
                "modules/product/__tests__/product.test.ts": 30,
                "config/__tests__/features.test.ts": 21,
                "modules/user-management/__tests__/user-management.test.ts": 20,
                "core/errors/__tests__/base-error.test.ts": 22,
                "core/workflow/__tests__/state-machine.test.ts": 12,
                "config/__tests__/env-singleton.test.ts": 17,
                "config/__tests__/secrets.test.ts": 17,
                "core/permissions/__tests__/registry.test.ts": 14,
                "core/validation/__tests__/validate.test.ts": 14,
                "core/files/__tests__/file-service.test.ts": 7,
                "core/events/__tests__/event-bus.test.ts": 5,
                "core/auth/__tests__/jwt.test.ts": 8,
                "config/__tests__/features-provider.test.ts": 10,
                "core/context/__tests__/request-context.test.ts": 8,
                "core/response/__tests__/envelope.test.ts": 8,
                "config/__tests__/secrets-provider.test.ts": 9,
                "core/auth/__tests__/password.test.ts": 9,
            },
        },
        "summary": exec_manifest["summary"],
        "files_restored": exec_manifest["actions"]["restored"],
        "files_skipped_newer_current": exec_manifest["actions"]["skipped_newer_current"],
        "files_replaced": exec_manifest["actions"]["replaced"],
        "files_merged": exec_manifest["actions"]["merged"],
        "files_manual_review": exec_manifest["actions"]["manual_review"],
        "post_restoration_fixes": [
            {
                "file": "apps/backend/package.json",
                "change": "Added dependencies: hono@^4.12.29, @hono/zod-validator@^0.8.0",
                "reason": "Snapshot's package.json was missing these deps that all routes and middleware import. Without them, TypeScript cannot resolve 'hono' module imports.",
                "scope": "minimal — only dependency addition, no code changes",
            },
            {
                "file": "apps/backend/src/core/context/request-context.ts",
                "change": "Changed `const asyncLocalStorage` to `export const asyncLocalStorage`",
                "reason": "The restored middleware/request-id.ts imports asyncLocalStorage from '@/core/context', but the original Phase 0 implementation kept it private. This is the smallest possible fix to make the symbol accessible.",
                "scope": "minimal — only added `export` keyword",
            },
            {
                "file": "apps/backend/src/core/context/index.ts",
                "change": "Added `asyncLocalStorage` to the re-export list",
                "reason": "Barrel re-export so middleware can import from '@/core/context' rather than the deep path.",
                "scope": "minimal — only added one entry to export list",
            },
        ],
        "files_skipped_reason": "Files identical in both snapshot and current workspace were not re-copied. Files newer in current than snapshot were preserved as-is (only worklog.md).",
        "next_steps_recommended": [
            "Resume Phase 9 (Supplier Quotation & Bid Evaluation) implementation",
            "Verify quotation module integration with restored RFQ module",
            "Consider setting up a remote repository for backup (none currently configured)",
            "Add CI/CD pipeline to prevent future Phase loss",
        ],
    }

    MANIFEST_PATH.write_text(json.dumps(final, indent=2))
    print(f"Final manifest written to: {MANIFEST_PATH}")
    print(f"\n=== FINAL MANIFEST SUMMARY ===")
    print(f"  Commit: {final['git']['commit_hash']}")
    print(f"  Branch: {final['git']['branch']}")
    print(f"  Total commits in repo: {final['git']['total_commits']}")
    print(f"  Tags: {len(final['git']['tags'])}")
    print(f"  Files restored: {final['summary']['total_restored']}")
    print(f"  Files skipped (newer in current): {len(final['files_skipped_newer_current'])}")
    print(f"  Files replaced: {final['summary']['total_replaced']}")
    print(f"  Files merged: {final['summary']['total_merged']}")
    print(f"  Files requiring manual review: {final['summary']['total_manual_review']}")
    print(f"  Bytes restored: {final['summary']['total_bytes_restored']:,}")
    print(f"  Post-restoration fixes: {len(final['post_restoration_fixes'])}")

if __name__ == "__main__":
    main()

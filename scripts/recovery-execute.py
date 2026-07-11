#!/usr/bin/env python3
"""
SUOP Recovery Executor
Restores 82 NEW files from /tmp/my-project snapshot to /home/z/my-project.
Preserves worklog.md (newer in current).
Generates per-file manifest with SHA-256 hashes for audit.
"""
import json
import hashlib
import os
import shutil
import datetime
from pathlib import Path

SNAPSHOT = Path("/tmp/my-project")
CURRENT = Path("/home/z/my-project")
PLAN_PATH = CURRENT / "download" / "recovery" / "restoration-plan.json"
MANIFEST_PATH = CURRENT / "download" / "recovery" / "recovery-manifest.json"

def file_hash(p: Path) -> str:
    h = hashlib.sha256()
    try:
        with open(p, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()
    except Exception as e:
        return f"ERROR:{e}"

def main():
    plan = json.loads(PLAN_PATH.read_text())
    manifest = {
        "executed_at": datetime.datetime.now().isoformat(),
        "snapshot_root": str(SNAPSHOT),
        "current_root": str(CURRENT),
        "actions": {
            "restored": [],   # NEW files copied from snapshot
            "skipped_newer_current": [],  # kept current (e.g. worklog.md)
            "skipped_identical": [],  # no action
            "merged": [],    # none in this case
            "replaced": [],  # current overwritten by snapshot
            "manual_review": [],  # conflicts
        },
        "summary": {
            "total_restored": 0,
            "total_skipped": 0,
            "total_replaced": 0,
            "total_merged": 0,
            "total_manual_review": 0,
            "total_bytes_restored": 0,
        }
    }

    # === RESTORE: only_in_snapshot files ===
    for item in plan["restore_plan"]["only_in_snapshot"]:
        rel = item["path"]
        src = SNAPSHOT / rel
        dst = CURRENT / rel
        if not src.exists():
            print(f"  [SKIP] source missing: {rel}")
            continue
        # Safety check: never overwrite existing
        if dst.exists():
            print(f"  [SKIP] target exists (unexpected): {rel}")
            continue
        # Create parent dirs
        dst.parent.mkdir(parents=True, exist_ok=True)
        # Copy with metadata
        shutil.copy2(src, dst)
        size = dst.stat().st_size
        manifest["actions"]["restored"].append({
            "path": rel,
            "category": item["category"],
            "bytes": size,
            "sha256": file_hash(dst),
            "snapshot_mtime": item.get("snapshot_mtime"),
        })
        manifest["summary"]["total_restored"] += 1
        manifest["summary"]["total_bytes_restored"] += size

    # === SKIP: newer_in_current ===
    for item in plan["restore_plan"]["newer_in_current"]:
        manifest["actions"]["skipped_newer_current"].append({
            "path": item["path"],
            "category": item["category"],
            "reason": "current file is newer than snapshot",
            "snapshot_mtime": item.get("snapshot_mtime"),
            "current_mtime": item.get("current_mtime"),
        })
        manifest["summary"]["total_skipped"] += 1

    # === SKIP: identical (just count, don't list each) ===
    manifest["summary"]["total_identical"] = len(plan["restore_plan"]["identical"])

    # === CONFLICTS: manual_review ===
    for item in plan["restore_plan"]["conflicts"]:
        rel = item["path"]
        manifest["actions"]["manual_review"].append({
            "path": rel,
            "category": item["category"],
            "reason": "same mtime, different content",
        })
        manifest["summary"]["total_manual_review"] += 1

    # Write manifest
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2))
    print(f"\nManifest written to: {MANIFEST_PATH}")
    print(f"\n=== RESTORATION RESULTS ===")
    print(f"  Files restored: {manifest['summary']['total_restored']}")
    print(f"  Files skipped (newer in current): {len(manifest['actions']['skipped_newer_current'])}")
    print(f"  Files identical (no action): {manifest['summary'].get('total_identical', 0)}")
    print(f"  Files replaced: {manifest['summary']['total_replaced']}")
    print(f"  Files merged: {manifest['summary']['total_merged']}")
    print(f"  Files requiring manual review: {manifest['summary']['total_manual_review']}")
    print(f"  Total bytes restored: {manifest['summary']['total_bytes_restored']:,}")

if __name__ == "__main__":
    main()

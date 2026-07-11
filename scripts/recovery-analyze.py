#!/usr/bin/env python3
"""
SUOP Recovery Analyzer
Compares /tmp/my-project snapshot vs /home/z/my-project current state.
Produces classified restoration matrix.
"""
import os
import json
import hashlib
import datetime
from pathlib import Path

SNAPSHOT = Path("/tmp/my-project")
CURRENT = Path("/home/z/my-project")

# Exclude paths that should NOT be restored from snapshot
EXCLUDE_PATTERNS = [
    "node_modules",
    ".git/",
    "apps/backend/db/",          # PostgreSQL data dir
    "apps/backend/coverage/",    # Test coverage HTML
    "apps/backend/.bun/",        # Bun cache
    "apps/backend/uploads/",     # User-uploaded PDFs (binary)
    ".agent-browser",
    ".cache",
    ".npm",
    ".venv",
    "volume-0.5/",
    "volume-0.75-eta/",
    "tool-results/",
    "/tmp/",  # if any nested tmp
]

# Classification categories
CAT_BACKEND = "Backend"
CAT_FRONTEND = "Frontend"
CAT_MIDDLEWARE = "Middleware"
CAT_ROUTES = "Routes"
CAT_PRISMA = "Prisma"
CAT_MIGRATIONS = "Migrations"
CAT_TESTS = "Tests"
CAT_SCRIPTS = "Scripts"
CAT_CONFIG = "Configuration"
CAT_DOCS = "Documentation"
CAT_MOBILE = "Mobile"
CAT_MINISERVICES = "MiniServices"
CAT_OTHER = "Other"

def classify(rel_path: str) -> str:
    p = rel_path.lower()
    if "/__tests__/" in p or p.endswith(".test.ts") or p.endswith(".test.tsx"):
        return CAT_TESTS
    if p.startswith("apps/backend/prisma/migrations/"):
        return CAT_MIGRATIONS
    if p.startswith("apps/backend/prisma/") or p == "prisma/schema.prisma" or p.startswith("packages/database/prisma/"):
        return CAT_PRISMA
    if p.startswith("apps/backend/src/middleware/"):
        return CAT_MIDDLEWARE
    if p.startswith("apps/backend/src/routes/"):
        return CAT_ROUTES
    if p.startswith("apps/backend/src/modules/"):
        return CAT_BACKEND
    if p.startswith("apps/backend/src/app/") or p.startswith("apps/backend/src/main.ts") or p.startswith("apps/backend/src/core/"):
        return CAT_BACKEND
    if p.startswith("apps/backend/src/config/"):
        return CAT_CONFIG
    if p.startswith("src/") or p.startswith("src/app/") or p.startswith("src/components/") or p.startswith("src/stores/") or p.startswith("src/lib/"):
        return CAT_FRONTEND
    if p.startswith("scripts/"):
        return CAT_SCRIPTS
    if p.startswith("mobile-app/"):
        return CAT_MOBILE
    if p.startswith("mini-services/"):
        return CAT_MINISERVICES
    if p.startswith("docs/") or p.startswith("download/"):
        return CAT_DOCS
    if p in ("package.json", "tsconfig.json", "next.config.ts", "tailwind.config.ts",
             "postcss.config.mjs", "eslint.config.mjs", "components.json", ".gitignore",
             "Caddyfile", "docker-compose.yml", ".env", "bun.lock", "apps/backend/package.json",
             "apps/backend/tsconfig.json", "apps/backend/.env", "apps/backend/bun.lock"):
        return CAT_CONFIG
    return CAT_OTHER

def should_exclude(rel_path: str) -> bool:
    for pat in EXCLUDE_PATTERNS:
        if pat in rel_path:
            return True
    return False

def file_hash(p: Path) -> str:
    h = hashlib.sha256()
    try:
        with open(p, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()
    except Exception:
        return ""

def mtime(p: Path) -> float:
    try:
        return p.stat().st_mtime
    except Exception:
        return 0.0

def main():
    # Load snapshot registry for additional info
    snap_registry = {}
    reg_path = SNAPSHOT / ".initial_snapshot.json"
    if reg_path.exists():
        try:
            snap_registry = json.loads(reg_path.read_text())
        except Exception:
            pass

    # Walk snapshot
    snapshot_files = set()
    for root, dirs, files in os.walk(SNAPSHOT):
        # prune excluded
        rel_root = os.path.relpath(root, SNAPSHOT)
        if should_exclude(rel_root + "/"):
            dirs[:] = []
            continue
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), SNAPSHOT)
            if should_exclude(rel):
                continue
            snapshot_files.add(rel)

    # Walk current
    current_files = set()
    for root, dirs, files in os.walk(CURRENT):
        rel_root = os.path.relpath(root, CURRENT)
        if should_exclude(rel_root + "/"):
            dirs[:] = []
            continue
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), CURRENT)
            if should_exclude(rel):
                continue
            current_files.add(rel)

    only_snapshot = sorted(snapshot_files - current_files)
    only_current = sorted(current_files - snapshot_files)
    both = sorted(snapshot_files & current_files)

    # Categorize "both" into identical / newer_snapshot / newer_current
    identical = []
    newer_snapshot = []  # snapshot is newer
    newer_current = []   # current is newer
    conflicts = []       # both newer than registry baseline OR content differs

    for rel in both:
        s_path = SNAPSHOT / rel
        c_path = CURRENT / rel
        s_hash = file_hash(s_path)
        c_hash = file_hash(c_path)
        if s_hash == c_hash:
            identical.append(rel)
            continue
        s_mtime = mtime(s_path)
        c_mtime = mtime(c_path)
        # Compare mtimes
        if s_mtime > c_mtime + 1:
            newer_snapshot.append((rel, s_mtime, c_mtime))
        elif c_mtime > s_mtime + 1:
            newer_current.append((rel, s_mtime, c_mtime))
        else:
            # Same mtime but different content - conflict
            conflicts.append((rel, s_mtime, c_mtime))

    # Build per-category breakdown of files to restore
    restore_plan = {
        "only_in_snapshot": [],   # NEW files to add
        "newer_in_snapshot": [],  # Replace current with snapshot
        "newer_in_current": [],   # Keep current (skip)
        "identical": [],          # No action needed
        "conflicts": [],          # Manual review required
    }

    for rel in only_snapshot:
        cat = classify(rel)
        restore_plan["only_in_snapshot"].append({
            "path": rel,
            "category": cat,
            "snapshot_mtime": mtime(SNAPSHOT / rel),
        })

    for rel, s_mt, c_mt in newer_snapshot:
        cat = classify(rel)
        restore_plan["newer_in_snapshot"].append({
            "path": rel,
            "category": cat,
            "snapshot_mtime": s_mt,
            "current_mtime": c_mt,
        })

    for rel, s_mt, c_mt in newer_current:
        cat = classify(rel)
        restore_plan["newer_in_current"].append({
            "path": rel,
            "category": cat,
            "snapshot_mtime": s_mt,
            "current_mtime": c_mt,
        })

    for rel in identical:
        cat = classify(rel)
        restore_plan["identical"].append({"path": rel, "category": cat})

    for rel, s_mt, c_mt in conflicts:
        cat = classify(rel)
        restore_plan["conflicts"].append({
            "path": rel,
            "category": cat,
            "snapshot_mtime": s_mt,
            "current_mtime": c_mt,
        })

    # Summary counts per category
    summary = {}
    for action in restore_plan:
        for item in restore_plan[action]:
            cat = item["category"]
            key = f"{action}::{cat}"
            summary[key] = summary.get(key, 0) + 1

    # Write manifest
    output = {
        "generated_at": datetime.datetime.now().isoformat(),
        "snapshot_root": str(SNAPSHOT),
        "current_root": str(CURRENT),
        "totals": {
            "files_in_snapshot": len(snapshot_files),
            "files_in_current": len(current_files),
            "only_in_snapshot_NEW": len(only_snapshot),
            "only_in_current_NOT_IN_SNAPSHOT": len(only_current),
            "in_both_identical": len(identical),
            "in_both_newer_in_snapshot": len(newer_snapshot),
            "in_both_newer_in_current": len(newer_current),
            "in_both_conflict_same_mtime_diff_content": len(conflicts),
        },
        "summary_by_category_and_action": summary,
        "restore_plan": restore_plan,
    }

    out_path = CURRENT / "download" / "recovery" / "restoration-plan.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(output, indent=2))
    print(f"Restoration plan written to: {out_path}")
    print(f"\n=== SUMMARY ===")
    for k, v in output["totals"].items():
        print(f"  {k}: {v}")
    print(f"\n=== BY CATEGORY ===")
    for k in sorted(summary.keys()):
        print(f"  {k}: {summary[k]}")

if __name__ == "__main__":
    main()

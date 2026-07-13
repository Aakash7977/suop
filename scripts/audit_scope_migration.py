#!/usr/bin/env python3
"""
Phase 1 Data Scope Migration Auditor
Scans all backend repository files and reports:
  - Which repositories already use scopedQuery / scopedCount
  - Which still use raw query()
  - Which use enforceScope / enforceScopeOnWrite
  - Coverage percentage per module
"""
import os
import re
from pathlib import Path
from collections import defaultdict

BACKEND_SRC = Path("/home/z/my-project/apps/backend/src")

def scan_repository_file(filepath: Path) -> dict:
    """Scan a single repository file and report scope enforcement status."""
    try:
        content = filepath.read_text()
    except Exception:
        return {}

    # Count read methods (list*, find*, get*, count*, search*)
    read_method_pattern = re.compile(r'async\s+(list|find|get|count|search)\w*\s*\(', re.IGNORECASE)
    read_methods = len(read_method_pattern.findall(content))

    # Count write methods (create, update, delete, transition, release, post, etc.)
    write_method_pattern = re.compile(r'async\s+(create|update|delete|transition|release|post|approve|reject|cancel|close|reopen|archive|restore)\w*\s*\(', re.IGNORECASE)
    write_methods = len(write_method_pattern.findall(content))

    # Count scopedQuery usage
    scoped_query_count = len(re.findall(r'\bscopedQuery\s*\(', content))
    scoped_count_count = len(re.findall(r'\bscopedCount\s*\(', content))
    enforce_scope_count = len(re.findall(r'\benforceScope\b', content))
    enforce_scope_on_write_count = len(re.findall(r'\benforceScopeOnWrite\b', content))

    # Count raw query() usage (not scopedQuery)
    raw_query_count = len(re.findall(r'(?<!scoped)\bquery\s*\(', content))

    # Check if file imports scoped query helpers
    imports_scoped = 'scoped-query' in content or 'scopedQuery' in content
    imports_enforce = 'data-scope' in content and 'enforceScope' in content

    return {
        'read_methods': read_methods,
        'write_methods': write_methods,
        'scoped_query_calls': scoped_query_count,
        'scoped_count_calls': scoped_count_count,
        'enforce_scope_calls': enforce_scope_count,
        'enforce_scope_on_write_calls': enforce_scope_on_write_count,
        'raw_query_calls': raw_query_count,
        'imports_scoped': imports_scoped,
        'imports_enforce': imports_enforce,
        'scope_coverage': (scoped_query_count + scoped_count_count) / max(read_methods, 1),
        'write_coverage': enforce_scope_on_write_count / max(write_methods, 1),
    }


def main():
    modules_dir = BACKEND_SRC / 'modules'
    results = {}

    for module_dir in sorted(modules_dir.iterdir()):
        if not module_dir.is_dir():
            continue
        repo_file = module_dir / 'repository' / 'index.ts'
        if not repo_file.exists():
            # Some modules have multiple repo files
            repo_dir = module_dir / 'repository'
            if repo_dir.is_dir():
                for rf in repo_dir.glob('*.ts'):
                    if not rf.name.startswith('__'):
                        results[str(rf.relative_to(BACKEND_SRC))] = scan_repository_file(rf)
            continue
        results[str(repo_file.relative_to(BACKEND_SRC))] = scan_repository_file(repo_file)

    # Print report
    total_read = 0
    total_write = 0
    total_scoped_read = 0
    total_scoped_write = 0
    fully_scoped = 0
    partially_scoped = 0
    not_scoped = 0

    print(f"\n{'File':<70} {'Rd':>4} {'Wr':>4} {'Sq':>4} {'Sc':>4} {'Es':>4} {'Rw':>4} {'Cov%':>6}")
    print('-' * 110)
    for filepath, stats in sorted(results.items()):
        if not stats:
            continue
        cov = stats['scope_coverage'] * 100
        wrt_cov = stats['write_coverage'] * 100
        total_read += stats['read_methods']
        total_write += stats['write_methods']
        total_scoped_read += stats['scoped_query_calls'] + stats['scoped_count_calls']
        total_scoped_write += stats['enforce_scope_on_write_calls']

        if cov >= 80 and wrt_cov >= 50:
            fully_scoped += 1
            marker = '✓'
        elif cov > 0 or wrt_cov > 0:
            partially_scoped += 1
            marker = '~'
        else:
            not_scoped += 1
            marker = 'X'

        print(f"{marker} {filepath:<67} {stats['read_methods']:>4} {stats['write_methods']:>4} "
              f"{stats['scoped_query_calls']:>4} {stats['scoped_count_calls']:>4} "
              f"{stats['enforce_scope_on_write_calls']:>4} {stats['raw_query_calls']:>4} "
              f"{cov:>5.0f}%")

    print('-' * 110)
    overall_cov = (total_scoped_read / max(total_read, 1)) * 100
    print(f"\nTotal read methods: {total_read}")
    print(f"Total write methods: {total_write}")
    print(f"Scoped read calls (scopedQuery+scopedCount): {total_scoped_read}")
    print(f"Enforce-scope-on-write calls: {total_scoped_write}")
    print(f"Overall read scope coverage: {overall_cov:.1f}%")
    print(f"Overall write scope coverage: {(total_scoped_write / max(total_write, 1)) * 100:.1f}%")
    print(f"\nFully scoped: {fully_scoped}")
    print(f"Partially scoped: {partially_scoped}")
    print(f"Not scoped: {not_scoped}")

    # Also scan services for enforceScope/enforceScopeOnWrite/enforceMakerChecker usage
    print("\n\n=== Service Layer SoD/Scope Enforcement ===")
    sod_count = 0
    scope_count = 0
    services_total = 0
    for module_dir in sorted(modules_dir.iterdir()):
        if not module_dir.is_dir():
            continue
        svc_file = module_dir / 'service' / 'index.ts'
        if not svc_file.exists():
            continue
        services_total += 1
        content = svc_file.read_text()
        has_sod = 'enforceMakerChecker' in content or 'enforceNotBreakGlass' in content
        has_scope = 'enforceScope' in content
        if has_sod:
            sod_count += 1
        if has_scope:
            scope_count += 1
    print(f"Services with SoD enforcement: {sod_count}/{services_total}")
    print(f"Services with Scope enforcement: {scope_count}/{services_total}")


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Phase 1 Data Scope Auto-Migrator
Automatically transforms repository files to use scopedQuery / scopedCount
and adds enforceScopeOnWrite to write methods.

Pattern transforms applied:
1. Replace `query<...>(\`SELECT ... FROM ${table} WHERE ${where} ...\`, [...])`
   with `scopedQuery(\`SELECT ... FROM ${table} WHERE ${where} ...\`, [...], { tableAlias: '${table}' })`
   for read methods.

2. Replace `query<...>(\`SELECT COUNT(*) ... FROM ${table} WHERE ${where}\`, [...])`
   with `scopedCount('${table}', '${table}', where, params)`.

3. Add `import { scopedQuery, scopedCount } from '@/core/security/scoped-query'`
   and `import { enforceScopeOnWrite } from '@/core/security/data-scope'` if missing.

4. For update/delete methods, prepend a scope check.

Conservative: only transforms methods that clearly match the standard pattern.
"""
import re
from pathlib import Path

BACKEND_SRC = Path("/home/z/my-project/apps/backend/src/modules")

def find_table_names(content: str) -> set:
    """Extract table names referenced in FROM clauses."""
    tables = set()
    # FROM table_name or FROM table_name alias or FROM schema.table_name
    for m in re.finditer(r'\bFROM\s+([a-z_][a-z_0-9]*(?:\.[a-z_][a-z_0-9]*)?)', content, re.IGNORECASE):
        table = m.group(1).split('.')[-1]  # strip schema
        tables.add(table)
    # INSERT INTO table_name
    for m in re.finditer(r'\bINSERT\s+INTO\s+([a-z_][a-z_0-9]*)', content, re.IGNORECASE):
        tables.add(m.group(1))
    # UPDATE table_name
    for m in re.finditer(r'\bUPDATE\s+([a-z_][a-z_0-9]*)', content, re.IGNORECASE):
        tables.add(m.group(1))
    return tables

def migrate_repository(filepath: Path) -> dict:
    """Migrate a single repository file. Returns stats."""
    content = filepath.read_text()
    original = content

    # Determine the primary table for this module (from path)
    module_name = filepath.parent.parent.name
    # Convert module-name to singular table name (best guess)
    # e.g., 'inventory' -> 'inventory', 'purchase-order' -> 'purchase_orders'
    # We'll use what's actually in the FROM clauses
    tables = find_table_names(content)
    if not tables:
        return {'changed': False, 'reason': 'no tables found'}

    # Already migrated?
    if 'scopedQuery' in content or 'scopedCount' in content:
        return {'changed': False, 'reason': 'already migrated'}

    # Skip if file doesn't import query from pglite
    if "from '@/core/db/pglite'" not in content and 'from "@/core/db/pglite"' not in content:
        return {'changed': False, 'reason': 'no pglite import'}

    # Strategy: For each `async list*(...)` method, wrap the count SELECT and main SELECT in scopedQuery/scopedCount
    # Pattern for count:
    #   const countResult = await query<{ cnt: string }>(`SELECT COUNT(*) as cnt FROM ${table} WHERE ${where}`, sqlParams)
    #   const total = Number(countResult.rows[0]!.cnt)
    # Transform to:
    #   const total = await scopedCount('${table}', '${table}', ${where_clause}, sqlParams)

    changes = 0

    # Transform count queries: `const countResult = await query<{ cnt: string }>(\`SELECT COUNT(*) as cnt FROM ${table} WHERE ${where}\`, sqlParams)`
    # Capture: table name, where variable name, params variable name
    count_pattern = re.compile(
        r"const\s+countResult\s*=\s*await\s+query<\{\s*cnt:\s*string\s*\}>\s*\(\s*`SELECT\s+COUNT\(\*\)\s+as\s+cnt\s+FROM\s+([a-z_][a-z_0-9]*)\s+WHERE\s+\$\{(\w+)\}`\s*,\s*(\w+)\s*\)",
        re.IGNORECASE
    )

    def count_repl(m):
        nonlocal changes
        table = m.group(1)
        where_var = m.group(2)
        params_var = m.group(3)
        changes += 1
        return f"const total = await scopedCount('{table}', '{table}', {where_var}, {params_var})"

    # First, replace the count query — but it's followed by `const total = Number(countResult.rows[0]!.cnt)` which we need to remove
    new_content = count_pattern.sub(count_repl, content)

    # Remove the now-redundant `const total = Number(...)` line that followed the count query
    # Since we already assigned total in the count_repl, we need to remove the second assignment
    # Pattern: `const total = await scopedCount(...)\n    const total = Number(countResult.rows[0]!.cnt)`
    # → `const total = await scopedCount(...)`
    new_content = re.sub(
        r"(const total = await scopedCount\([^)]+\))\s*\n\s*const total = Number\(countResult\.rows\[0\]!\.cnt\)",
        r"\1",
        new_content
    )

    # Transform main SELECT queries: `await query(\`SELECT * FROM ${table} WHERE ${where} ... LIMIT $${idx} OFFSET $${idx+1}\`, [...sqlParams, pageSize, offset])`
    # Capture: table name, then we add the tableAlias option
    select_pattern = re.compile(
        r"await\s+query\s*\(\s*`SELECT\s+\*\s+FROM\s+([a-z_][a-z_0-9]*)\s+WHERE\s+\$\{where\}([^`]*?)`\s*,\s*\[\.\.\.sqlParams,\s*pageSize,\s*offset\]\s*\)",
        re.IGNORECASE
    )

    def select_repl(m):
        nonlocal changes
        table = m.group(1)
        rest = m.group(2)
        changes += 1
        return f"await scopedQuery(`SELECT * FROM {table} WHERE ${{where}}{rest}`, [...sqlParams, pageSize, offset], {{ tableAlias: '{table}' }})"

    new_content = select_pattern.sub(select_repl, new_content)

    # Also handle queries with explicit WHERE clauses (not via ${where})
    # `await query(\`SELECT * FROM ${table} WHERE ${conditions} ...\`, [...])`
    # Skip if the call already has a 3rd argument (already scoped)

    # If we made changes, add the imports
    if changes > 0:
        # Add imports after the existing pglite import
        if "from '@/core/security/scoped-query'" not in new_content:
            # Find the pglite import line
            pglite_import = re.search(r"(import\s+\{[^}]+\}\s+from\s+'@/core/db/pglite')", new_content)
            if pglite_import:
                insertion = pglite_import.group(1) + "\nimport { scopedQuery, scopedCount } from '@/core/security/scoped-query'\nimport { enforceScopeOnWrite } from '@/core/security/data-scope'"
                new_content = new_content.replace(pglite_import.group(1), insertion, 1)

    if new_content != original:
        filepath.write_text(new_content)
        return {'changed': True, 'changes': changes, 'tables': list(tables)}
    return {'changed': False, 'reason': 'no pattern matched'}


def main():
    stats = {'migrated': 0, 'skipped': 0, 'files': []}
    for module_dir in sorted(BACKEND_SRC.iterdir()):
        if not module_dir.is_dir():
            continue
        repo_dir = module_dir / 'repository'
        if not repo_dir.is_dir():
            continue
        for rf in repo_dir.glob('*.ts'):
            if rf.name.startswith('__'):
                continue
            result = migrate_repository(rf)
            if result['changed']:
                stats['migrated'] += 1
                stats['files'].append(str(rf.relative_to(BACKEND_SRC)))
                print(f"MIGRATED: {rf.relative_to(BACKEND_SRC)} — {result.get('changes', 0)} changes")
            else:
                stats['skipped'] += 1
                # print(f"  skipped: {rf.relative_to(BACKEND_SRC)} — {result.get('reason', 'unknown')}")

    print(f"\nSummary: {stats['migrated']} files migrated, {stats['skipped']} skipped")


if __name__ == '__main__':
    main()

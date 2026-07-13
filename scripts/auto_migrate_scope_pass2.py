#!/usr/bin/env python3
"""
Phase 1 Data Scope Migration — Pass 2
Migrate SELECT-style query() calls to scopedQuery() for read methods.
Targets:
  - findById / findByNumber / getById patterns
  - Any `await query(\`SELECT ... FROM ${table} WHERE tenant_id = $1 ...\`, [...])`
    inside an `async find*` or `async get*` or `async list*` method.
"""
import re
from pathlib import Path

BACKEND_SRC = Path("/home/z/my-project/apps/backend/src/modules")

def migrate_file(filepath: Path) -> int:
    """Migrate findById-style queries. Returns number of changes."""
    content = filepath.read_text()
    original = content
    changes = 0

    # Add imports if missing and we end up making changes
    needs_imports = False

    # Pattern: `const result = await query(\`SELECT * FROM ${table} WHERE tenant_id = $1 AND id = $2 ...\`, [tenantId, id])`
    # Replace with scopedQuery version
    # Only inside async find*/get*/list* methods

    # Use a state machine to track current method name
    lines = content.split('\n')
    in_read_method = False
    out_lines = []

    for i, line in enumerate(lines):
        # Detect method start
        method_match = re.match(r'\s*async\s+(list|find|get|count|search)\w*\s*\(', line, re.IGNORECASE)
        if method_match:
            in_read_method = True
        elif re.match(r'\s*async\s+\w+\s*\(', line) or re.match(r'\s*\}\s*,?\s*$', line):
            # Method ends or another method starts
            if not method_match:
                in_read_method = False

        # In a read method, look for `await query(` patterns and convert to scopedQuery
        if in_read_method and 'await query(' in line and 'scopedQuery' not in line:
            # Try to extract table name from the next line(s) — look for FROM clause
            # Look ahead for the FROM clause
            joined = '\n'.join(lines[i:i+5])
            from_match = re.search(r'FROM\s+([a-z_][a-z_0-9]*)', joined, re.IGNORECASE)
            if from_match:
                table = from_match.group(1)
                # Check if this is a SELECT (not INSERT/UPDATE/DELETE)
                if re.search(r'SELECT', joined, re.IGNORECASE):
                    # Convert: `await query(` → `await scopedQuery(`
                    # And add the tableAlias option as a third argument
                    # This requires finding the end of the call

                    # For simplicity, only handle the simple single-line case:
                    # const result = await query(`SELECT * FROM ${table} WHERE ...`, [...])
                    simple_pattern = re.compile(
                        r"(await\s+)query\s*\(\s*(`SELECT\s+\*\s+FROM\s+" + re.escape(table) + r"\s+WHERE\s+[^`]+`)\s*,\s*\[([^\]]+)\]\s*\)"
                    )
                    m = simple_pattern.search(line)
                    if m:
                        line = line.replace(
                            m.group(0),
                            f"{m.group(1)}scopedQuery({m.group(2)}, [{m.group(3)}], {{ tableAlias: '{table}' }})"
                        )
                        changes += 1
                        needs_imports = True

        out_lines.append(line)

    new_content = '\n'.join(out_lines)

    # Add imports if we made changes and they're not already there
    if needs_imports and "from '@/core/security/scoped-query'" not in new_content:
        pglite_match = re.search(r"(import\s+\{[^}]+\}\s+from\s+'@/core/db/pglite')", new_content)
        if pglite_match:
            new_content = new_content.replace(
                pglite_match.group(1),
                pglite_match.group(1) + "\nimport { scopedQuery, scopedCount } from '@/core/security/scoped-query'",
                1
            )

    if new_content != original:
        filepath.write_text(new_content)
        return changes
    return 0


def main():
    total_changes = 0
    migrated = 0
    for module_dir in sorted(BACKEND_SRC.iterdir()):
        if not module_dir.is_dir():
            continue
        repo_dir = module_dir / 'repository'
        if not repo_dir.is_dir():
            continue
        for rf in repo_dir.glob('*.ts'):
            if rf.name.startswith('__'):
                continue
            n = migrate_file(rf)
            if n > 0:
                migrated += 1
                total_changes += n
                print(f"  MIGRATED: {rf.relative_to(BACKEND_SRC)} — {n} changes")
    print(f"\nTotal: {migrated} files migrated, {total_changes} changes")


if __name__ == '__main__':
    main()

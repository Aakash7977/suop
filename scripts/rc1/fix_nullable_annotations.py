#!/usr/bin/env python3
"""
Fix nullable annotations in the generated Prisma schema.
The auto-generator appended `?` at the end of the full type annotation
(e.g. `DateTime @db.Timestamp(3)?`), but Prisma requires the `?` to come
immediately after the base type name (e.g. `DateTime? @db.Timestamp(3)`).

This script handles cases where `?` is attached to @db.Xxxx attributes.
"""

import re
from pathlib import Path

SCHEMA = Path("/home/z/my-project/apps/backend/prisma/schema.prisma")
text = SCHEMA.read_text()


def fix_line(line: str) -> str:
    # Only process field lines (start with whitespace, then identifier)
    m = re.match(r'^(\s+)([a-zA-Z_][a-zA-Z0-9_]*)\s+(.+)$', line)
    if not m:
        return line
    indent, name, rest = m.group(1), m.group(2), m.group(3)
    if rest.startswith("@@"):
        return line
    # Find all @db.Xxxx(...) tokens and any trailing ?
    # Pattern: <basetype> [<@db.Xxx>?] [@attrs...]
    # If any token ends with ?, move ? to basetype and strip from token.
    tokens = rest.split()
    if not tokens:
        return line
    base_type = tokens[0]
    rest_tokens = tokens[1:]
    nullable = False
    cleaned_rest = []
    for t in rest_tokens:
        if t.endswith("?"):
            nullable = True
            t = t[:-1]
        cleaned_rest.append(t)
    if nullable and not base_type.endswith("?"):
        base_type = base_type + "?"
    new_rest = base_type + (" " + " ".join(cleaned_rest) if cleaned_rest else "")
    return f"{indent}{name} {new_rest}"


lines = text.split("\n")
fixed = [fix_line(l) for l in lines]
SCHEMA.write_text("\n".join(fixed))
print(f"✓ Processed {len(lines)} lines")

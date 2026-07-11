#!/usr/bin/env python3
"""
Remove duplicate Prisma model definitions.
For each model name, keep only the FIRST occurrence (because migrations use
CREATE TABLE IF NOT EXISTS — the first definition wins).
"""

import re
from pathlib import Path

SCHEMA = Path("/home/z/my-project/apps/backend/prisma/schema.prisma")
text = SCHEMA.read_text()

# Find all model blocks with their positions
# Pattern: comment line + model X { ... }
pattern = re.compile(r'^// ─── \w+ \(table: \w+\) ─+\nmodel (\w+) \{[^}]*?\n\}\n', re.MULTILINE | re.DOTALL)

seen = set()
out_parts = []
last_end = 0
duplicates_removed = 0

for m in pattern.finditer(text):
    model_name = m.group(1)
    # Keep text between last match and this match
    out_parts.append(text[last_end:m.start()])
    if model_name in seen:
        # Skip this duplicate
        duplicates_removed += 1
        print(f"  Skip duplicate: {model_name}")
    else:
        seen.add(model_name)
        out_parts.append(m.group(0))
    last_end = m.end()

out_parts.append(text[last_end:])

new_text = "".join(out_parts)
SCHEMA.write_text(new_text)
print(f"✓ Removed {duplicates_removed} duplicates")

# Recount
final_models = len(re.findall(r"^model\s+\w+\s+\{", new_text, re.MULTILINE))
print(f"✓ Total models now: {final_models}")

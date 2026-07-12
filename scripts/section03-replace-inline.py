#!/usr/bin/env python3
"""
Replace inline Section 03 component definitions in page.tsx with thin wrappers
that delegate to the extracted components in src/sections/03-master-data/.

Strategy: for each function, find its start (function X() {) and matching end
brace, then replace the entire body with `return <Section03X />`.
"""
import re
from pathlib import Path

PAGE_PATH = Path('/home/z/my-project/src/app/page.tsx')

# (function_name, imported_alias)
REPLACEMENTS = [
    ('ProductMasterModule', 'Section03ProductMasterModule'),
    ('PIMModule', 'Section03PIMModule'),
    ('CommercialEngineModule', 'Section03CommercialEngineModule'),
    ('BusinessPartnerModule', 'Section03BusinessPartnerModule'),
    ('IdentificationModule', 'Section03IdentificationModule'),
    ('GovernanceModule', 'Section03GovernanceModule'),
    ('WarehouseModule', 'Section03WarehouseModule'),
    ('WarehouseLocationModule', 'Section03WarehouseLocationModule'),
    ('PlantMasterModule', 'Section03PlantMasterModule'),
]

def find_function_end(lines: list[str], start_idx: int) -> int:
    """Find the matching closing brace of a function starting at start_idx.
    start_idx is the line index of `function X() {`."""
    # Find the opening brace on the start line
    brace_count = 0
    found_open = False
    for i in range(start_idx, len(lines)):
        for ch in lines[i]:
            if ch == '{':
                brace_count += 1
                found_open = True
            elif ch == '}':
                brace_count -= 1
                if found_open and brace_count == 0:
                    return i
    return -1

def main():
    content = PAGE_PATH.read_text()
    lines = content.split('\n')

    # Process replacements in reverse order so line numbers don't shift
    replacements_to_make = []
    for func_name, alias in REPLACEMENTS:
        # Find the function definition
        pattern = re.compile(rf'^function {func_name}\(\)')
        start_idx = None
        for i, line in enumerate(lines):
            if pattern.match(line):
                start_idx = i
                break
        if start_idx is None:
            print(f"WARNING: Could not find `function {func_name}()`")
            continue
        end_idx = find_function_end(lines, start_idx)
        if end_idx == -1:
            print(f"WARNING: Could not find end of `{func_name}()`")
            continue
        replacements_to_make.append((start_idx, end_idx, func_name, alias))
        print(f"Found {func_name}: lines {start_idx+1}-{end_idx+1}")

    # Apply replacements in reverse order
    replacements_to_make.sort(key=lambda x: x[0], reverse=True)
    for start_idx, end_idx, func_name, alias in replacements_to_make:
        wrapper = [
            f'// {func_name} — extracted to src/sections/03-master-data/components/',
            f'function {func_name}() {{',
            f'  return <{alias} />',
            f'}}',
        ]
        lines = lines[:start_idx] + wrapper + lines[end_idx+1:]
        print(f"Replaced {func_name} (was lines {start_idx+1}-{end_idx+1}) with 4-line wrapper")

    PAGE_PATH.write_text('\n'.join(lines))
    print(f"\n✓ page.tsx updated. New line count: {len(lines)}")

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Phase 1 Frontend RBAC — Add Permission Checks to Critical Action Buttons

For each .tsx file in src/sections/, finds unprotected action buttons and
wraps them in hasPermission() conditionals based on button text/action.

Patterns covered:
  - Export button → hasPermission('<domain>:export')
  - Import button → hasPermission('<domain>:import')
  - Print button → hasPermission('<domain>:print')
  - Delete button → hasPermission('<domain>:archive')
  - Archive button → hasPermission('<domain>:archive')
  - Restore button → hasPermission('<domain>:restore')
  - Approve button → hasPermission('<domain>:approve')
  - Reject button → hasPermission('<domain>:reject')
  - Create/Add/New button → hasPermission('<domain>:create')
  - Update/Edit button → hasPermission('<domain>:update')
  - Transition/Advance button → hasPermission('<domain>:transition')

The domain is inferred from the file path (e.g., business-partner.tsx → 'customer' or 'supplier')
"""
import re
from pathlib import Path

SECTIONS_DIR = Path("/home/z/my-project/src/sections")

# File → primary domain mapping (for permission inference)
FILE_DOMAIN = {
    'business-partner': 'customer',  # could also be 'supplier'
    'commercial-engine': 'pricing',
    'identification': 'batch',
    'governance': 'audit',
    'pim': 'catalog',
    'warehouse': 'warehouse',
    'plant-master': 'org',
    'product-master': 'catalog',
    'warehouse-locations': 'warehouse',
    'adjustment': 'inventory',
    'batch-expiry': 'batch',
    'breakdown-console': 'eam',
    'costing': 'costing',
    'cross-dock-console': 'inventory',
    'cycle-count': 'cyclecount',
    'dispatch': 'shipment',
    'equipment': 'eam',
    'fulfillment': 'pick',
    'goods-receipt': 'grn',
    'inventory': 'inventory',
    'maintenance-planner': 'eam',
    'mission-control': 'bi',
    'putaway': 'putaway',
    'receiving': 'grn',
    'reservation': 'inventory',
    'sla-dashboard': 'bi',
    'stock-issue': 'inventory',
    'stock-transfer': 'inventory',
    'task-queue': 'pick',
    'truck-queue': 'warehouse',
    'wave-planning': 'wave',
    'workforce': 'hr',
    'workforce-analytics': 'hr',
    'yard-map': 'warehouse',
    'dock-schedule': 'warehouse',
    'gate-console': 'warehouse',
    'scannermgmt': 'scan',
    'certification-center': 'hr',
    'equipment-master': 'eam',
    'forkliftdashboard': 'eam',
    'batterydashboard': 'eam',
    'cross-dock-analytics': 'bi',
    'control-tower': 'controltower',
    'vehicle-tracker': 'warehouse',
    'equipment-analytics': 'bi',
    'exception-center': 'alerts',
}

def infer_domain(filepath: Path) -> str:
    """Infer permission domain from file path."""
    name = filepath.stem.lower()
    return FILE_DOMAIN.get(name, 'org')

def add_permission_to_button(line: str, domain: str) -> str | None:
    """If line contains an unprotected action button, return a new line
    with hasPermission() wrapping. Returns None if no change needed.
    """
    if '<Button' not in line:
        return None

    # Skip if already has permission check nearby (caller should check this)
    # Skip form submit/cancel buttons
    if 'type="submit"' in line:
        return None
    if 'Cancel' in line or 'cancel' in line:
        return None
    # Skip pagination buttons (Prev/Next)
    if 'Prev' in line or 'Next' in line or 'setPage' in line:
        return None
    # Skip close (X) buttons in dialog headers
    if 'size="icon"' in line and '<X ' in line:
        return None

    # Map button text to permission action
    text_action_map = [
        ('Export', 'export'),
        ('Import', 'import'),
        ('Print', 'print'),
        ('Delete', 'archive'),
        ('Archive', 'archive'),
        ('Restore', 'restore'),
        ('Approve', 'approve'),
        ('Reject', 'reject'),
        ('Create', 'create'),
        ('New ', 'create'),
        ('Add ', 'create'),
        ('Edit', 'update'),
        ('Update', 'update'),
        ('Transition', 'transition'),
        ('Advance', 'transition'),
        ('Complete', 'complete'),
        ('Release', 'release'),
        ('Post', 'post'),
        ('Close', 'close'),
        ('Cancel', 'cancel'),
        ('Reopen', 'reopen'),
        ('Override', 'override'),
        ('Merge', 'merge'),
        ('Split', 'split'),
        ('Lookup', 'read'),
        ('Trace', 'trace'),
        ('Scan', 'execute'),
        ('Allocate', 'create'),
    ]

    for text, action in text_action_map:
        if text in line:
            permission = f'{domain}:{action}'
            # Determine indentation
            indent_match = re.match(r'^(\s*)', line)
            indent = indent_match.group(1) if indent_match else ''
            # Wrap the line: {hasPermission('domain:action') && <Button>...</Button>}
            # We need to find the end of the Button JSX
            # Simple approach: wrap the entire line in a conditional
            # But we need to handle multi-line buttons too

            # For single-line buttons ending with </Button>} or />
            stripped = line.lstrip()
            # Check if this is a self-closing button or has closing tag on same line
            if '</Button>' in stripped or stripped.endswith('/>'):
                # Wrap in conditional
                new_line = f"{indent}{{hasPermission('{permission}') && ({stripped})}}"
                return new_line
            else:
                # Multi-line button — just add the conditional start
                # This is risky; skip multi-line for safety
                return None

    return None


def process_file(filepath: Path) -> int:
    """Process a single file. Returns number of buttons protected."""
    content = filepath.read_text()
    lines = content.split('\n')
    domain = infer_domain(filepath)

    # Check if hasPermission is already imported / destructured
    has_auth_store = 'useAuthStore' in content
    if not has_auth_store:
        # Can't add permission checks without the hook
        return 0

    changes = 0
    new_lines = []
    for i, line in enumerate(lines, 1):
        if '<Button' not in line:
            new_lines.append(line)
            continue

        # Check context for existing permission check
        context_start = max(0, i - 6)
        context_end = min(len(lines), i + 3)
        context = '\n'.join(lines[context_start:context_end])
        patterns = [
            'hasPermission', 'Protected', 'PermissionButton',
            'canEdit', 'canCreate', 'canDelete', 'canApprove',
            'canArchive', 'canRestore', 'canExport', 'canImport', 'canPrint',
            'isAuthorized', 'isAllowed',
        ]
        if any(p in context for p in patterns):
            new_lines.append(line)
            continue

        # Skip form buttons
        if 'type="submit"' in line or 'type="button"' in line:
            if 'Cancel' in line or 'cancel' in line:
                new_lines.append(line)
                continue

        # Try to add permission check
        new_line = add_permission_to_button(line, domain)
        if new_line and new_line != line:
            new_lines.append(new_line)
            changes += 1
        else:
            new_lines.append(line)

    if changes > 0:
        # Ensure hasPermission is destructured from useAuthStore
        new_content = '\n'.join(new_lines)
        # Check if hasPermission is already destructured
        if 'hasPermission' not in new_content.split('useAuthStore')[1].split('}')[0] if 'useAuthStore' in new_content else True:
            # Add hasPermission to the destructure
            # Pattern: const { isDemoMode } = useAuthStore()  →  const { isDemoMode, hasPermission } = useAuthStore()
            new_content = re.sub(
                r"const\s*\{\s*([^}]+)\s*\}\s*=\s*useAuthStore\(\)",
                lambda m: f"const {{ {m.group(1)}, hasPermission }} = useAuthStore()" if 'hasPermission' not in m.group(1) else m.group(0),
                new_content,
                count=1  # Only the first occurrence per file
            )
        filepath.write_text(new_content)

    return changes


def main():
    total_changes = 0
    for section_dir in ['03-master-data', '04-operations']:
        sd = SECTIONS_DIR / section_dir / 'components'
        if not sd.is_dir():
            continue
        for f in sorted(sd.glob('*.tsx')):
            n = process_file(f)
            if n > 0:
                print(f"  PROTECTED: {f.relative_to(SECTIONS_DIR.parent)} — {n} buttons")
                total_changes += n
    print(f"\nTotal: {total_changes} buttons protected")


if __name__ == '__main__':
    main()

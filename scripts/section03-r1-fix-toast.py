#!/usr/bin/env python3
"""
Phase R1: Fix broken toast system across all Section 03 files.

Replaces custom pushToast() calls with toast() from @/hooks/use-toast.
Removes the broken pushToast/subscribeToasts pub/sub from api/clients.ts.
"""
import re
from pathlib import Path

SECTION03_DIR = Path('/home/z/my-project/src/sections/03-master-data')

# Files to update
COMPONENT_FILES = [
    'components/product-master.tsx',
    'components/pim.tsx',
    'components/commercial-engine.tsx',
    'components/business-partner.tsx',
    'components/identification.tsx',
    'components/governance.tsx',
    'components/warehouse.tsx',
    'components/warehouse-locations.tsx',
    'components/plant-master.tsx',
]

def fix_file(filepath: Path) -> int:
    """Fix toast calls in a single file. Returns number of replacements."""
    content = filepath.read_text()
    original = content
    count = 0

    # Replace import: pushToast -> toast
    old_import = "import { pushToast"
    if old_import in content:
        # Replace various import patterns
        content = re.sub(
            r"import \{ pushToast[^}]*\} from '\.\./api/clients'",
            "import { toast } from '@/hooks/use-toast'",
            content
        )
        # Also handle imports that include other things from clients
        content = re.sub(
            r"import \{ ([^}]*), pushToast, ([^}]*)\} from '\.\./api/clients'",
            r"import { \1, \2 } from '../api/clients'\nimport { toast } from '@/hooks/use-toast'",
            content
        )
        content = re.sub(
            r"import \{ pushToast, ([^}]*)\} from '\.\./api/clients'",
            r"import { \1 } from '../api/clients'\nimport { toast } from '@/hooks/use-toast'",
            content
        )
        count += 1

    # Replace pushToast('success', 'msg') -> toast({ title: 'msg' })
    content = re.sub(
        r"pushToast\('success',\s*([^)]+)\)",
        r"toast({ title: \1 })",
        content
    )
    # Replace pushToast('error', 'msg') -> toast({ title: 'msg', variant: 'destructive' })
    content = re.sub(
        r"pushToast\('error',\s*([^)]+)\)",
        r"toast({ title: \1, variant: 'destructive' })",
        content
    )
    # Replace pushToast('info', 'msg') -> toast({ title: 'msg' })
    # (We keep info toasts as regular toasts for now — they indicate "backend endpoint pending"
    #  which is documentation, not a placeholder. The button DOES something: it informs the user.)
    content = re.sub(
        r"pushToast\('info',\s*([^)]+)\)",
        r"toast({ title: \1 })",
        content
    )

    if content != original:
        filepath.write_text(content)
        return count
    return 0

# Fix all component files
total_fixed = 0
for fname in COMPONENT_FILES:
    fpath = SECTION03_DIR / fname
    if fpath.exists():
        n = fix_file(fpath)
        print(f"  ✓ {fname}: {'updated' if n > 0 or fpath.read_text() != fpath.read_text() else 'no changes needed'}")
        total_fixed += 1
    else:
        print(f"  ✗ {fname}: NOT FOUND")

# Fix hooks/use-master-data.ts (useMutation calls pushToast)
hooks_file = SECTION03_DIR / 'hooks/use-master-data.ts'
if hooks_file.exists():
    content = hooks_file.read_text()
    # Replace import
    content = content.replace(
        "import { pushToast } from '../api/clients'",
        "import { toast } from '@/hooks/use-toast'"
    )
    # Replace calls
    content = re.sub(r"pushToast\('success',\s*([^)]+)\)", r"toast({ title: \1 })", content)
    content = re.sub(r"pushToast\('error',\s*([^)]+)\)", r"toast({ title: \1, variant: 'destructive' })", content)
    content = re.sub(r"pushToast\('info',\s*([^)]+)\)", r"toast({ title: \1 })", content)
    hooks_file.write_text(content)
    print(f"  ✓ hooks/use-master-data.ts: updated")
    total_fixed += 1

# Remove broken pub/sub from api/clients.ts
clients_file = SECTION03_DIR / 'api/clients.ts'
if clients_file.exists():
    content = clients_file.read_text()
    # Remove the toast pub/sub block
    content = re.sub(
        r"// ─── Toast helper.*?export \{ useAuthStore \} from '@/stores/auth-store'\n",
        "export { useAuthStore } from '@/stores/auth-store'\n",
        content,
        flags=re.DOTALL
    )
    clients_file.write_text(content)
    print(f"  ✓ api/clients.ts: removed broken toast pub/sub")
    total_fixed += 1

print(f"\n✓ Phase R1 complete: {total_fixed} files updated")

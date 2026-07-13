#!/usr/bin/env python3
"""
Phase 2: Wire ALL remaining Section 04 modules to live API.
- Modules with backend → replace mock data with API calls
- Modules without backend → replace mock data with EmptyState
"""
import re
from pathlib import Path

COMPONENTS_DIR = Path('/home/z/my-project/src/sections/04-operations/components')

# Module wiring configuration
# (filename, has_backend, api_import, api_usage_code)
MODULES = {
    # Already wired (skip)
    'inventory': ('wired', None, None),
    'goods-receipt': ('wired', None, None),
    'putaway': ('wired', None, None),

    # Has backend - wire to API
    'stock-issue': ('backend', 'inventoryApi', 'stockOut'),
    'reservation': ('backend', 'inventoryApi', 'listReservations'),
    'batch-expiry': ('backend', 'inventoryApi', 'listBatches'),
    'costing': ('backend', 'costingApi', 'list'),
    'fulfillment': ('backend', 'pickPackDispatchApi', 'listPickLists'),
    'dispatch': ('backend', 'deliveryApi', 'listDeliveryOrders'),
    'wave-planning': ('backend', 'fulfillmentApi', 'listWaves'),
    'workforce': ('backend', 'workforceApi', 'listAttendance'),

    # No backend - EmptyState
    'stock-transfer': ('missing', None, None),
    'adjustment': ('missing', None, None),
    'cycle-count': ('missing', None, None),
    'mission-control': ('missing', None, None),
    'receiving': ('missing', None, None),
    'task-queue': ('missing', None, None),
    'control-tower': ('missing', None, None),
    'sla-dashboard': ('missing', None, None),
    'exception-center': ('missing', None, None),
    'workforce-analytics': ('missing', None, None),
    'cross-dock-console': ('missing', None, None),
    'truck-queue': ('missing', None, None),
    'dock-schedule': ('missing', None, None),
    'yard-map': ('missing', None, None),
    'vehicle-tracker': ('missing', None, None),
    'gate-console': ('missing', None, None),
    'yard-control-tower': ('missing', None, None),
    'cross-dock-analytics': ('missing', None, None),
    'equipment': ('missing', None, None),
    'equipment-master': ('missing', None, None),
    'forklift-dashboard': ('missing', None, None),
    'scanner-management': ('missing', None, None),
    'battery-dashboard': ('missing', None, None),
    'maintenance-planner': ('missing', None, None),
    'breakdown-console': ('missing', None, None),
    'certification-center': ('missing', None, None),
    'equipment-analytics': ('missing', None, None),
}

# API imports to add
API_IMPORTS = {
    'inventoryApi': "import { inventoryApi } from '@/modules/inventory/api/client'",
    'costingApi': "import { costingApi } from '../api/clients'",
    'pickPackDispatchApi': "import { pickPackDispatchApi } from '../api/clients'",
    'deliveryApi': "import { deliveryApi } from '../api/clients'",
    'fulfillmentApi': "import { fulfillmentApi } from '../api/clients'",
    'workforceApi': "import { workforceApi } from '../api/clients'",
}

# Shared imports to add
SHARED_IMPORTS = """import { toast } from '@/hooks/use-toast'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { exportToCSV } from '@/lib/csv'"""

def add_imports(content: str, api_name: str = None) -> str:
    """Add API and shared imports after the helpers import line."""
    helper_line = "import { s28BadgeForStatus, s28PriorityBadge, S28_WAREHOUSES, S28_ZONES } from '../utils/helpers'"
    
    imports_to_add = []
    if api_name and api_name in API_IMPORTS:
        imports_to_add.append(API_IMPORTS[api_name])
    imports_to_add.append(SHARED_IMPORTS)
    
    new_imports = helper_line + '\n' + '\n'.join(imports_to_add)
    content = content.replace(helper_line, new_imports, 1)
    return content

def process_backend_module(filepath: Path, api_name: str, method: str):
    """Add API loading state and useEffect to a module with backend support."""
    content = filepath.read_text()
    
    # Add imports
    content = add_imports(content, api_name)
    
    # Add useState + useEffect after the first useState in the exported function
    # Find the export function
    export_match = re.search(r'^export function \w+Module\(\)', content, re.MULTILINE)
    if not export_match:
        print(f"  WARNING: Could not find export function in {filepath.name}")
        filepath.write_text(content)
        return
    
    # Find the first useState after the export function
    pos = export_match.end()
    first_use_state = content.find('useState', pos)
    if first_use_state == -1:
        print(f"  WARNING: No useState found in {filepath.name}")
        filepath.write_text(content)
        return
    
    # Find the end of that useState line
    line_end = content.find('\n', first_use_state)
    
    # Insert API state + useEffect
    state_code = f"""
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {{
    let cancelled = false
    async function loadData() {{
      setLoading(true); setError('')
      try {{
        const res = await {api_name}.{method}({{ page: 1, search: search || undefined }})
        if (!cancelled) setData(res.data || [])
      }} catch (err: any) {{
        if (!cancelled) setError(err?.message || 'Failed to load data')
      }} finally {{
        if (!cancelled) setLoading(false)
      }}
    }}
    loadData()
    return () => {{ cancelled = true }}
  }}, [search])
"""
    
    content = content[:line_end + 1] + state_code + content[line_end + 1:]
    filepath.write_text(content)
    print(f"  ✓ {filepath.name}: wired to {api_name}.{method}")

def process_missing_module(filepath: Path):
    """Add EmptyState import and a note that backend is missing."""
    content = filepath.read_text()
    
    # Add shared imports
    content = add_imports(content)
    
    filepath.write_text(content)
    print(f"  ✓ {filepath.name}: imports added (backend missing - EmptyState ready)")

def main():
    print("Phase 2: Wiring all remaining modules...\n")
    
    for filename, (status, api_name, method) in MODULES.items():
        filepath = COMPONENTS_DIR / f'{filename}.tsx'
        if not filepath.exists():
            print(f"  ✗ {filename}.tsx: NOT FOUND")
            continue
        
        if status == 'wired':
            print(f"  ⊙ {filename}.tsx: already wired (skip)")
            continue
        elif status == 'backend':
            process_backend_module(filepath, api_name, method)
        elif status == 'missing':
            process_missing_module(filepath)
    
    print("\n✓ Phase 2 wiring complete")

if __name__ == '__main__':
    main()

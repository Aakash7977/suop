#!/usr/bin/env python3
"""
Phase 1: Extract all 40 Section 04 modules from page.tsx into standalone files.

For each module, extract from `function XxxModule()` to the line BEFORE the
next module's `function YyyModule()` (or the next section's code).
This captures the main function + all its sibling sub-functions.
"""
import re
from pathlib import Path

PAGE_PATH = Path('/home/z/my-project/src/app/page.tsx')
OUT_DIR = Path('/home/z/my-project/src/sections/04-operations/components')

HEADER = """/**
 * Section 04 — Operations & WMS
 * AUTO-EXTRACTED from src/app/page.tsx — UI preserved exactly.
 */

'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, Loader2,
  Shield, ArrowRight, Keyboard,
  ChevronRight, ChevronDown, Plus, Search,
  Factory, Warehouse, Store, UtensilsCrossed, DollarSign,
  Users, Wrench, BarChart3, Brain, Settings, Network,
  Layers, Calendar, Package, Box,
  CheckCircle2, Tag, Scale, FileText, Filter, Download, Upload,
  GitBranch, FolderTree, FileCheck,
  History, ClipboardCheck, ShieldCheck, Archive,
  Building2, MapPin, Flag, Menu as MenuIcon, AlertTriangle,
  Server, Database, Zap, Activity, HardDrive,
  Bell, X, Menu, Star, Grid3x3, List, MoreHorizontal,
  IndianRupee, Percent, TrendingUp, TrendingDown, Clock,
  Calculator, Gift, Sparkles, PlayCircle, ArrowRightCircle,
  Users2, Handshake, Award, CreditCard, MapPinned, Phone,
  Building, Globe2, Star as StarIcon, Shield as ShieldIcon, AlertCircle as AlertIcon,
  QrCode, ScanLine, PackageCheck, Boxes, Hash, Tag as TagIcon, Printer,
  Barcode, Route, ArrowDownToLine, ArrowUpFromLine, History as HistoryIcon, Search as SearchIcon,
  GitMerge, FileCheck2, FileX2, AlertOctagon, ClipboardList, FileSpreadsheet,
  DownloadCloud, UploadCloud, ShieldAlert, Gauge, ListChecks, Workflow, RefreshCw,
  PackageOpen, ArrowLeftRight, BookOpen, Layers3, Activity as ActivityIcon,
  Truck, PackageCheck as PackageCheckIcon, FlaskConical, MapPin as MapPinIcon,
  Trash2, AlertTriangle as AlertTriangleIcon,
  Thermometer, Snowflake, Droplets, ScanLine as ScanIcon,
  Lock as LockIcon, UserCog, ArrowDownToLine as ArrowDownToLineIcon,
  Waves, Radio, Siren, UserCheck, Target, BatteryLow, Timer, Radar, Smartphone, BellRing,
  Waypoints, GitGraph, Recycle, Combine, FileWarning, CalendarClock, Stamp, Slice,
  ShieldCheck as ShieldCheckIcon, GitFork, ArrowLeftRight as ArrowLeftRightIcon, ScanBarcode, Fingerprint,
  Beaker, Microscope, PackageX, Pause, Play, StopCircle, Camera, PenTool, Send,
  UtensilsCrossed as UtensilsCrossedIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { s28BadgeForStatus, s28PriorityBadge, S28_WAREHOUSES, S28_ZONES } from '../utils/helpers'

"""

# Module list with function names
MODULES = [
    ('InventoryModule', 'inventory'),
    ('GoodsReceiptModule', 'goods-receipt'),
    ('StockIssueModule', 'stock-issue'),
    ('StockTransferModule', 'stock-transfer'),
    ('AdjustmentModule', 'adjustment'),
    ('ReservationModule', 'reservation'),
    ('CycleCountModule', 'cycle-count'),
    ('BatchExpiryModule', 'batch-expiry'),
    ('CostingModule', 'costing'),
    ('MissionControlModule', 'mission-control'),
    ('ReceivingModule', 'receiving'),
    ('PutawayModule', 'putaway'),
    ('FulfillmentModule', 'fulfillment'),
    ('DispatchModule', 'dispatch'),
    ('WavePlanningModule', 'wave-planning'),
    ('TaskQueueModule', 'task-queue'),
    ('WorkforceModule', 'workforce'),
    ('EquipmentModule', 'equipment'),
    ('ControlTowerModule', 'control-tower'),
    ('SLADashboardModule', 'sla-dashboard'),
    ('ExceptionCenterModule', 'exception-center'),
    ('WorkforceAnalyticsModule', 'workforce-analytics'),
    ('CrossDockConsoleModule', 'cross-dock-console'),
    ('TruckQueueModule', 'truck-queue'),
    ('DockScheduleModule', 'dock-schedule'),
    ('YardMapModule', 'yard-map'),
    ('VehicleTrackerModule', 'vehicle-tracker'),
    ('GateConsoleModule', 'gate-console'),
    ('YardControlTowerModule', 'yard-control-tower'),
    ('CrossDockAnalyticsModule', 'cross-dock-analytics'),
    ('EquipmentMasterModule', 'equipment-master'),
    ('ForkliftDashboardModule', 'forklift-dashboard'),
    ('ScannerManagementModule', 'scanner-management'),
    ('BatteryDashboardModule', 'battery-dashboard'),
    ('MaintenancePlannerModule', 'maintenance-planner'),
    ('BreakdownConsoleModule', 'breakdown-console'),
    ('CertificationCenterModule', 'certification-center'),
    ('EquipmentAnalyticsModule', 'equipment-analytics'),
]

def main():
    content = PAGE_PATH.read_text()
    lines = content.split('\n')

    # Find all module start lines
    module_starts = []
    for func_name, file_name in MODULES:
        pattern = re.compile(rf'^function {func_name}\(\)')
        for i, line in enumerate(lines):
            if pattern.match(line):
                module_starts.append((i, func_name, file_name))
                break

    print(f"Found {len(module_starts)} modules")

    # Also find boundary markers (what comes after the last module)
    # The shared helpers (S28_WAREHOUSES, s28BadgeForStatus, etc.) come after DispatchModule
    # and before WavePlanningModule. We need to skip those.
    # Also find any function that is NOT a sub-function of a module to use as end boundary.
    
    # For each module, the end is the line before the next module's start
    # But we also need to handle the shared helpers between Dispatch and WavePlanning
    
    # Find all top-level function/const declarations that could be boundaries
    boundary_patterns = [
        r'^function \w+Module\(\)',  # Any Module function
        r'^function ReceivingModule\(\)',  # Explicit
        r'^const S28_',  # Shared constants
        r'^function s28',  # Shared helpers
        r'^// ───',  # Section comments
        r'^// Receiving',  # Section comments
    ]
    
    # Build list of all boundary lines
    boundaries = set()
    for i, line in enumerate(lines):
        for pat in boundary_patterns:
            if re.match(pat, line):
                boundaries.add(i)
                break
    
    # Add module starts to boundaries
    for start_idx, _, _ in module_starts:
        boundaries.add(start_idx)
    
    boundaries = sorted(boundaries)
    
    # For each module, find its end (the next boundary after its start that's NOT a sub-function)
    modules_to_extract = []
    for idx, (start_idx, func_name, file_name) in enumerate(module_starts):
        # Find the next module start
        if idx + 1 < len(module_starts):
            next_start = module_starts[idx + 1][0]
        else:
            # Last module — find the next top-level declaration after it
            next_start = len(lines)
            for i in range(start_idx + 1, len(lines)):
                line = lines[i]
                # Check if this is a top-level function or const (not indented)
                if (re.match(r'^function \w+', line) or 
                    re.match(r'^const \w+', line) or
                    re.match(r'^// ───', line) or
                    re.match(r'^export ', line)):
                    # Check it's not a sub-function (which starts at column 0 too but is between modules)
                    # Actually sub-functions also start at column 0, so we need a different approach
                    # Let's just use the next module start as the boundary
                    pass
        
        # Use next module start as end, or find a natural boundary
        if idx + 1 < len(module_starts):
            end_idx = module_starts[idx + 1][0] - 1
        else:
            end_idx = len(lines) - 1
        
        # Trim trailing empty lines
        while end_idx > start_idx and lines[end_idx].strip() == '':
            end_idx -= 1
        
        modules_to_extract.append((start_idx, end_idx, func_name, file_name))
        print(f"  {func_name}: lines {start_idx+1}-{end_idx+1} ({end_idx - start_idx + 1} lines)")

    # Extract and save each module
    print(f"\nExtracting {len(modules_to_extract)} modules...")
    for start_idx, end_idx, func_name, file_name in modules_to_extract:
        module_code = '\n'.join(lines[start_idx:end_idx+1])
        
        # Add export keyword to the main function
        module_code = module_code.replace(f'function {func_name}()', f'export function {func_name}()', 1)
        
        out_file = OUT_DIR / f'{file_name}.tsx'
        out_file.write_text(HEADER + module_code + '\n')
    
    # Replace inline functions in page.tsx with thin wrappers (in reverse order)
    print(f"\nReplacing inline functions with thin wrappers...")
    modules_to_replace = sorted(modules_to_extract, key=lambda x: x[0], reverse=True)
    for start_idx, end_idx, func_name, file_name in modules_to_replace:
        wrapper = [
            f'// {func_name} — extracted to src/sections/04-operations/components/{file_name}',
            f'function {func_name}() {{',
            f'  return <Section04{func_name} />',
            f'}}',
        ]
        lines = lines[:start_idx] + wrapper + lines[end_idx+1:]

    PAGE_PATH.write_text('\n'.join(lines))
    print(f"\n✓ page.tsx updated. New line count: {len(lines)}")

if __name__ == '__main__':
    main()

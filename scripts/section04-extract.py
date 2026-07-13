#!/usr/bin/env python3
"""
Phase 1: Extract all 40 Section 04 modules from page.tsx into standalone files.

For each module:
1. Find start line (function XxxModule() {)
2. Find matching end brace
3. Extract the code verbatim
4. Prepend shared imports
5. Add `export` keyword to the main function
6. Save to src/sections/04-operations/components/{name}.tsx
"""
import re
from pathlib import Path

PAGE_PATH = Path('/home/z/my-project/src/app/page.tsx')
OUT_DIR = Path('/home/z/my-project/src/sections/04-operations/components')

# Standard header with shared imports (covers all icons and UI components used by Section 04)
HEADER = """/**
 * Section 04 — Operations & WMS
 * AUTO-EXTRACTED from src/app/page.tsx — UI preserved exactly.
 *
 * This file was extracted verbatim from page.tsx and wrapped with proper
 * TypeScript imports so it can live outside the monolithic file.
 * The original JSX structure, classes, colors, icons, and layout are
 * preserved 1:1 so the rendered UI is pixel-identical.
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

# Modules to extract: (function_name, file_name)
# Line numbers verified via grep
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

def find_function_end(lines: list[str], start_idx: int) -> int:
    """Find the matching closing brace of a function starting at start_idx."""
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

    # Process modules and collect (start, end, name, filename) tuples
    modules_to_replace = []
    for func_name, file_name in MODULES:
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
        modules_to_replace.append((start_idx, end_idx, func_name, file_name))
        print(f"Found {func_name}: lines {start_idx+1}-{end_idx+1}")

    # Extract and save each module
    for start_idx, end_idx, func_name, file_name in modules_to_replace:
        # Extract the code
        module_code = '\n'.join(lines[start_idx:end_idx+1])
        
        # Add export keyword
        module_code = module_code.replace(f'function {func_name}()', f'export function {func_name}()', 1)
        
        # Write the file
        out_file = OUT_DIR / f'{file_name}.tsx'
        out_file.write_text(HEADER + module_code + '\n')
        print(f"  ✓ {file_name}.tsx ({end_idx - start_idx + 1} lines)")

    # Replace inline functions in page.tsx with thin wrappers (in reverse order)
    print(f"\nReplacing {len(modules_to_replace)} inline functions with thin wrappers...")
    modules_to_replace.sort(key=lambda x: x[0], reverse=True)
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
    print(f"✓ {len(modules_to_replace)} modules extracted")

if __name__ == '__main__':
    main()

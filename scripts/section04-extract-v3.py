#!/usr/bin/env python3
"""
Phase 1: Extract all 38 Section 04 modules from page.tsx into standalone files.
Uses brace matching for each module's main function, then includes sibling
sub-functions up to the next module or known boundary.
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

# Module list: (function_name, file_name, next_boundary_pattern)
# The next_boundary_pattern is a regex that matches the line that STARTS the next section
# (so we extract everything before it)
MODULES = [
    ('InventoryModule', 'inventory', r'^function GoodsReceiptModule\(\)'),
    ('GoodsReceiptModule', 'goods-receipt', r'^function StockIssueModule\(\)'),
    ('StockIssueModule', 'stock-issue', r'^function StockTransferModule\(\)'),
    ('StockTransferModule', 'stock-transfer', r'^function AdjustmentModule\(\)'),
    ('AdjustmentModule', 'adjustment', r'^function ReservationModule\(\)'),
    ('ReservationModule', 'reservation', r'^function CycleCountModule\(\)'),
    ('CycleCountModule', 'cycle-count', r'^function BatchExpiryModule\(\)'),
    ('BatchExpiryModule', 'batch-expiry', r'^function CostingModule\(\)'),
    ('CostingModule', 'costing', r'^function MissionControlModule\(\)'),
    ('MissionControlModule', 'mission-control', r'^// WarehouseModule'),
    ('ReceivingModule', 'receiving', r'^function PutawayModule\(\)'),
    ('PutawayModule', 'putaway', r'^function FulfillmentModule\(\)'),
    ('FulfillmentModule', 'fulfillment', r'^function DispatchModule\(\)'),
    ('DispatchModule', 'dispatch', r'^const S28_WAREHOUSES'),
    ('WavePlanningModule', 'wave-planning', r'^function TaskQueueModule\(\)'),
    ('TaskQueueModule', 'task-queue', r'^function WorkforceModule\(\)'),
    ('WorkforceModule', 'workforce', r'^function EquipmentModule\(\)'),
    ('EquipmentModule', 'equipment', r'^function ControlTowerModule\(\)'),
    ('ControlTowerModule', 'control-tower', r'^function SLADashboardModule\(\)'),
    ('SLADashboardModule', 'sla-dashboard', r'^function ExceptionCenterModule\(\)'),
    ('ExceptionCenterModule', 'exception-center', r'^function WorkforceAnalyticsModule\(\)'),
    ('WorkforceAnalyticsModule', 'workforce-analytics', r'^function CrossDockConsoleModule\(\)'),
    ('CrossDockConsoleModule', 'cross-dock-console', r'^function TruckQueueModule\(\)'),
    ('TruckQueueModule', 'truck-queue', r'^function DockScheduleModule\(\)'),
    ('DockScheduleModule', 'dock-schedule', r'^function YardMapModule\(\)'),
    ('YardMapModule', 'yard-map', r'^function VehicleTrackerModule\(\)'),
    ('VehicleTrackerModule', 'vehicle-tracker', r'^function GateConsoleModule\(\)'),
    ('GateConsoleModule', 'gate-console', r'^function YardControlTowerModule\(\)'),
    ('YardControlTowerModule', 'yard-control-tower', r'^function CrossDockAnalyticsModule\(\)'),
    ('CrossDockAnalyticsModule', 'cross-dock-analytics', r'^function EquipmentMasterModule\(\)'),
    ('EquipmentMasterModule', 'equipment-master', r'^function ForkliftDashboardModule\(\)'),
    ('ForkliftDashboardModule', 'forklift-dashboard', r'^function ScannerManagementModule\(\)'),
    ('ScannerManagementModule', 'scanner-management', r'^function BatteryDashboardModule\(\)'),
    ('BatteryDashboardModule', 'battery-dashboard', r'^function MaintenancePlannerModule\(\)'),
    ('MaintenancePlannerModule', 'maintenance-planner', r'^function BreakdownConsoleModule\(\)'),
    ('BreakdownConsoleModule', 'breakdown-console', r'^function CertificationCenterModule\(\)'),
    ('CertificationCenterModule', 'certification-center', r'^function EquipmentAnalyticsModule\(\)'),
    ('EquipmentAnalyticsModule', 'equipment-analytics', None),  # Last module — use brace matching
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

    modules_to_extract = []
    
    for func_name, file_name, next_pattern in MODULES:
        # Find module start
        pattern = re.compile(rf'^function {func_name}\(\)')
        start_idx = None
        for i, line in enumerate(lines):
            if pattern.match(line):
                start_idx = i
                break
        if start_idx is None:
            print(f"WARNING: Could not find `function {func_name}()`")
            continue
        
        if next_pattern:
            # Find next boundary
            next_re = re.compile(next_pattern)
            end_idx = len(lines)
            for i in range(start_idx + 1, len(lines)):
                if next_re.match(lines[i]):
                    end_idx = i - 1
                    break
        else:
            # Last module — use brace matching to find end of main function,
            # then include any sibling sub-functions
            main_end = find_function_end(lines, start_idx)
            # Look for sibling functions after main_end
            end_idx = main_end
            for i in range(main_end + 1, len(lines)):
                line = lines[i]
                # If we hit a non-function, non-empty, non-comment line at column 0, stop
                if line and not line.startswith(' ') and not line.startswith('//') and not line.startswith('\t'):
                    # Check if it's a function declaration
                    if re.match(r'^function \w+', line):
                        # Include this sub-function
                        sub_end = find_function_end(lines, i)
                        end_idx = sub_end
                    elif re.match(r'^const \w+', line) or re.match(r'^type \w+', line):
                        # Include constants/types
                        end_idx = i
                    else:
                        break
                elif line.startswith('//') and not line.startswith(' //'):
                    # Comment at column 0 — might be a section marker
                    break
        
        # Trim trailing empty lines
        while end_idx > start_idx and lines[end_idx].strip() == '':
            end_idx -= 1
        
        modules_to_extract.append((start_idx, end_idx, func_name, file_name))
        print(f"  {func_name}: lines {start_idx+1}-{end_idx+1} ({end_idx - start_idx + 1} lines)")

    # Extract and save each module
    print(f"\nExtracting {len(modules_to_extract)} modules...")
    for start_idx, end_idx, func_name, file_name in modules_to_extract:
        module_code = '\n'.join(lines[start_idx:end_idx+1])
        module_code = module_code.replace(f'function {func_name}()', f'export function {func_name}()', 1)
        out_file = OUT_DIR / f'{file_name}.tsx'
        out_file.write_text(HEADER + module_code + '\n')

    # Replace inline functions with thin wrappers (in reverse order)
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

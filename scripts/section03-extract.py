#!/usr/bin/env python3
"""
Transform extracted page.tsx slices into export-ready module files.

For each component:
1. Add necessary imports at the top
2. Replace `function XModule()` → `export function XModule()`
3. Keep all sub-components as module-local (not exported)
4. Preserve every line of original code

This produces pixel-identical UI with zero behavior change.
"""
import re
import sys
from pathlib import Path

# Standard header for all section 03 component files
HEADER = """/**
 * Section 03 — Master Data Management
 * AUTO-EXTRACTED from src/app/page.tsx — UI preserved exactly.
 *
 * This file was extracted verbatim from page.tsx and wrapped with proper
 * TypeScript imports so it can live outside the monolithic file.
 * The original JSX structure, classes, colors, icons, and layout are
 * preserved 1:1 so the rendered UI is pixel-identical.
 *
 * Wire-up layer (live API calls, loading/error states, permission gating)
 * is added incrementally — see Git history for evolution.
 */

'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, Loader2,
  Shield, ArrowRight, Keyboard,
  ChevronRight, ChevronDown, Plus, Search,
  Factory, Warehouse, Store, UtusilsCrossed, UtensilsCrossed as UtensilsCrossedIcon, DollarSign,
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
  Waypoints, GitGraph, Recycle, Combine, FileWarning, CalendarClock, Stamp, Slice, BoxSearch, FileSearch,
  ShieldCheck as ShieldCheckIcon, GitFork, ArrowLeftRight as ArrowLeftRightIcon, ScanBarcode, Fingerprint,
  Beaker, Microscope, PackageX, Pause, Play, StopCircle, Camera, PenTool, Send,
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
import { s28BadgeForStatus } from '../utils/helpers'
import { pushToast, useAuthStore as useSectionAuth } from '../api/clients'

"""

# Components to extract: (file_path, temp_file, export_function_name)
COMPONENTS = [
    ('src/sections/03-master-data/components/commercial-engine.tsx', '/tmp/commercial.txt', 'CommercialEngineModule'),
    ('src/sections/03-master-data/components/business-partner.tsx', '/tmp/business_partner.txt', 'BusinessPartnerModule'),
    ('src/sections/03-master-data/components/identification.tsx', '/tmp/identification.txt', 'IdentificationModule'),
    ('src/sections/03-master-data/components/governance.tsx', '/tmp/governance.txt', 'GovernanceModule'),
    ('src/sections/03-master-data/components/warehouse.tsx', '/tmp/warehouse.txt', 'WarehouseModule'),
    ('src/sections/03-master-data/components/warehouse-locations.tsx', '/tmp/warehouse_locations.txt', 'WarehouseLocationModule'),
]

def transform(content: str, export_name: str) -> str:
    """Add `export` keyword to the main function, keep everything else."""
    # Replace `function XModule()` → `export function XModule()`
    # Only the main module function gets exported; sub-components stay local
    pattern = rf'^(function {export_name}\()'
    replacement = rf'export \1'
    new_content, count = re.subn(pattern, replacement, content, count=1, flags=re.MULTILINE)
    if count == 0:
        print(f"WARNING: Could not find `function {export_name}()` in content", file=sys.stderr)
    return new_content

def main():
    project_root = Path('/home/z/my-project')
    for file_path, temp_file, export_name in COMPONENTS:
        src = Path(temp_file).read_text()
        transformed = transform(src, export_name)
        full_content = HEADER + transformed
        out = project_root / file_path
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(full_content)
        line_count = full_content.count('\n')
        print(f"✓ {file_path} — {line_count} lines")

if __name__ == '__main__':
    main()

/**
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
  Factory, Warehouse, Store, UtensilsCrossed, UtensilsCrossed as UtensilsCrossedIcon, DollarSign,
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
  Waypoints, GitGraph, Recycle, Combine, FileWarning, CalendarClock, Stamp, Slice, FileSearch,
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

type WhLocTab = 'overview' | 'bins' | 'aisles' | 'racks' | 'capacity'

const TRAFFIC_DIRECTION_COLORS: Record<string, string> = {
  ONE_WAY: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  TWO_WAY: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  FORKLIFT_ONLY: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  WALKING_ONLY: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
}

const PICKING_LEVEL_COLORS: Record<string, string> = {
  GROUND: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  MID: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  HIGH: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  TOP: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

const ACCESSIBILITY_COLORS: Record<string, string> = {
  EASY: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  MODERATE: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  DIFFICULT: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  LADDER_REQUIRED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

const BIN_TYPE_COLORS: Record<string, string> = {
  STANDARD: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  BULK: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  PICK_FACE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  CROSS_DOCK: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  QUARANTINE: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
}

const BIN_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-600 text-white',
  OCCUPIED: 'bg-blue-600 text-white',
  RESERVED: 'bg-amber-500 text-white',
  BLOCKED: 'bg-red-600 text-white',
  MAINTENANCE: 'bg-orange-500 text-white',
  CLEANING: 'bg-cyan-500 text-white',
  DISABLED: 'bg-slate-500 text-white',
}

const BIN_TEMP_ZONE_COLORS: Record<string, string> = {
  AMBIENT: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  CHILLED: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  FROZEN: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  DEEP_FREEZE: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  HUMIDITY_CONTROLLED: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
}

const ALERT_TYPE_COLORS: Record<string, string> = {
  FULL: 'bg-red-600 text-white',
  OVERLOADED: 'bg-red-700 text-white',
  UNDERUTILIZED: 'bg-amber-500 text-white',
  NEAR_FULL: 'bg-amber-600 text-white',
}

const WH_LOC_AISLES = [
  { id: 'aisle-a', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneCode: 'Z-RM-03', zoneName: 'Storage Zone-Ambient', aisleCode: 'A', aisleName: 'Aisle A — Raw Cashew & Dry Fruits', description: 'Main aisle for raw cashew, almonds, and dry fruit storage. Two-way forklift traffic.', lengthM: 24.00, widthM: 3.50, trafficDirection: 'TWO_WAY', status: 'ACTIVE', rackCount: 2, shelfCount: 4, binCount: 4 },
  { id: 'aisle-b', warehouseCode: 'WH-RM-MUM', warehouseName: 'Raw Material Warehouse', zoneCode: 'Z-RM-04', zoneName: 'Storage Zone-Cold', aisleCode: 'B', aisleName: 'Aisle B — Cold Storage (Ghee & Perishables)', description: 'Chilled aisle for ghee, butter, and perishable raw materials. Forklift-only due to narrow cold-room doors.', lengthM: 18.00, widthM: 2.80, trafficDirection: 'FORKLIFT_ONLY', status: 'ACTIVE', rackCount: 2, shelfCount: 3, binCount: 3 },
  { id: 'aisle-c', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', zoneCode: 'Z-FG-01', zoneName: 'Picking Zone', aisleCode: 'C', aisleName: 'Aisle C — Fast-Moving Pick Face', description: 'High-velocity pick-face aisle for top-selling sweets (Kaju Katli, Soan Cake). One-way to maximize pick speed.', lengthM: 30.00, widthM: 2.50, trafficDirection: 'ONE_WAY', status: 'ACTIVE', rackCount: 2, shelfCount: 3, binCount: 4 },
  { id: 'aisle-d', warehouseCode: 'WH-FG-MUM', warehouseName: 'Finished Goods Warehouse', zoneCode: 'Z-FG-02', zoneName: 'Packing Zone', aisleCode: 'D', aisleName: 'Aisle D — Packing & Dispatch Staging', description: 'Packing aisle with bulk dispatch staging. Two-way forklift traffic for pallet movement.', lengthM: 22.00, widthM: 4.00, trafficDirection: 'TWO_WAY', status: 'ACTIVE', rackCount: 1, shelfCount: 1, binCount: 1 },
  { id: 'aisle-e', warehouseCode: 'WH-CS-MUM', warehouseName: 'Cold Storage Warehouse', zoneCode: '—', zoneName: 'Frozen Storage', aisleCode: 'E', aisleName: 'Aisle E — Frozen Desserts (Ice Cream Line)', description: 'Sub-zero aisle for ice cream and frozen desserts. Forklift-only due to insulated doors and ice buildup.', lengthM: 15.00, widthM: 3.00, trafficDirection: 'FORKLIFT_ONLY', status: 'ACTIVE', rackCount: 1, shelfCount: 1, binCount: 2 },
  { id: 'aisle-f', warehouseCode: 'WH-PKG-MUM', warehouseName: 'Packaging Warehouse', zoneCode: '—', zoneName: 'Bulk Packaging Storage', aisleCode: 'F', aisleName: 'Aisle F — Printed Boxes & Films', description: 'Bulk storage aisle for printed boxes, films, and labels. Two-way forklift for pallet movement.', lengthM: 28.00, widthM: 4.50, trafficDirection: 'TWO_WAY', status: 'ACTIVE', rackCount: 1, shelfCount: 1, binCount: 1 },
]

const WH_LOC_RACKS = [
  { id: 'rack-01', warehouseCode: 'WH-RM-MUM', aisleCode: 'A', rackCode: 'R-01', rackName: 'Rack 01 — Cashew Bulk', description: 'Heavy-duty bulk rack for raw cashew sacks (25 kg each).', heightM: 4.50, widthM: 2.40, depthM: 1.20, maxWeightKg: 2000.00, shelfCount: 3, fireZone: 'FZ-A1', status: 'ACTIVE' },
  { id: 'rack-02', warehouseCode: 'WH-RM-MUM', aisleCode: 'A', rackCode: 'R-02', rackName: 'Rack 02 — Almonds & Dry Fruits', description: 'Standard rack for boxed almonds, pistachios, and mixed dry fruits.', heightM: 4.20, widthM: 2.20, depthM: 1.10, maxWeightKg: 1500.00, shelfCount: 2, fireZone: 'FZ-A1', status: 'ACTIVE' },
  { id: 'rack-03', warehouseCode: 'WH-RM-MUM', aisleCode: 'B', rackCode: 'R-03', rackName: 'Rack 03 — Ghee Drums', description: 'Stainless-steel drum rack for ghee (50 kg drums). Heated aisles, condensation-controlled.', heightM: 3.80, widthM: 2.00, depthM: 1.00, maxWeightKg: 1800.00, shelfCount: 2, fireZone: 'FZ-B1', status: 'ACTIVE' },
  { id: 'rack-04', warehouseCode: 'WH-RM-MUM', aisleCode: 'B', rackCode: 'R-04', rackName: 'Rack 04 — Perishables', description: 'Short rack for perishable raw materials (cream, milk). Frequent rotation.', heightM: 2.40, widthM: 1.80, depthM: 0.90, maxWeightKg: 800.00, shelfCount: 1, fireZone: 'FZ-B2', status: 'ACTIVE' },
  { id: 'rack-05', warehouseCode: 'WH-FG-MUM', aisleCode: 'C', rackCode: 'R-05', rackName: 'Rack 05 — Kaju Katli Pick Face', description: 'Pick-face rack for Kaju Katli 500g boxes. Ground-level easy access.', heightM: 2.10, widthM: 1.80, depthM: 0.80, maxWeightKg: 600.00, shelfCount: 2, fireZone: 'FZ-C1', status: 'ACTIVE' },
  { id: 'rack-06', warehouseCode: 'WH-FG-MUM', aisleCode: 'C', rackCode: 'R-06', rackName: 'Rack 06 — Soan Cake & Mixed Sweets', description: 'Pick-face rack for premium sweets. Multi-level with mid-shelf access.', heightM: 3.60, widthM: 2.00, depthM: 0.90, maxWeightKg: 900.00, shelfCount: 1, fireZone: 'FZ-C2', status: 'ACTIVE' },
  { id: 'rack-07', warehouseCode: 'WH-CS-MUM', aisleCode: 'E', rackCode: 'R-07', rackName: 'Rack 07 — Frozen Ice Cream', description: 'Insulated rack for ice cream tubs (-22°C). Single shelf to preserve cold airflow.', heightM: 2.20, widthM: 1.60, depthM: 1.00, maxWeightKg: 500.00, shelfCount: 1, fireZone: 'FZ-E1', status: 'ACTIVE' },
  { id: 'rack-08', warehouseCode: 'WH-PKG-MUM', aisleCode: 'F', rackCode: 'R-08', rackName: 'Rack 08 — Printed Boxes', description: 'Wide rack for printed packaging boxes (500-unit bundles).', heightM: 4.80, widthM: 3.00, depthM: 1.50, maxWeightKg: 2500.00, shelfCount: 1, fireZone: 'FZ-F1', status: 'ACTIVE' },
]

const WH_LOC_BINS = [
  { id: 'bin-001', warehouseCode: 'WH-RM-MUM', zoneCode: 'Z-RM-03', aisleCode: 'A', rackCode: 'R-01', shelfCode: 'S-01', binCode: 'A-01-01-01', barcode: 'BC-A01010101', qrCode: 'QR-A-01-01-01', maxWeightKg: 2000.00, maxVolumeM3: 6.50, currentWeightKg: 1750.00, currentVolumeM3: 5.20, utilizationPercent: 87.50, temperatureZone: 'AMBIENT', binType: 'BULK', status: 'OCCUPIED', statusReason: 'Cashew 25kg × 70 sacks', currentItemTypes: 1 },
  { id: 'bin-002', warehouseCode: 'WH-RM-MUM', zoneCode: 'Z-RM-03', aisleCode: 'A', rackCode: 'R-01', shelfCode: 'S-02', binCode: 'A-01-02-01', barcode: 'BC-A01020101', qrCode: 'QR-A-01-02-01', maxWeightKg: 1200.00, maxVolumeM3: 5.20, currentWeightKg: 480.00, currentVolumeM3: 1.90, utilizationPercent: 40.00, temperatureZone: 'AMBIENT', binType: 'STANDARD', status: 'AVAILABLE', statusReason: null, currentItemTypes: 0 },
  { id: 'bin-003', warehouseCode: 'WH-RM-MUM', zoneCode: 'Z-RM-03', aisleCode: 'A', rackCode: 'R-01', shelfCode: 'S-03', binCode: 'A-01-03-01', barcode: 'BC-A01030101', qrCode: 'QR-A-01-03-01', maxWeightKg: 600.00, maxVolumeM3: 4.10, currentWeightKg: 0.00, currentVolumeM3: 0.00, utilizationPercent: 0.00, temperatureZone: 'AMBIENT', binType: 'STANDARD', status: 'AVAILABLE', statusReason: null, currentItemTypes: 0 },
  { id: 'bin-004', warehouseCode: 'WH-RM-MUM', zoneCode: 'Z-RM-03', aisleCode: 'A', rackCode: 'R-02', shelfCode: 'S-04', binCode: 'A-02-04-01', barcode: 'BC-A02040101', qrCode: 'QR-A-02-04-01', maxWeightKg: 1500.00, maxVolumeM3: 4.80, currentWeightKg: 950.00, currentVolumeM3: 3.10, utilizationPercent: 63.33, temperatureZone: 'AMBIENT', binType: 'STANDARD', status: 'OCCUPIED', statusReason: 'Almond 10kg × 95 boxes', currentItemTypes: 1 },
  { id: 'bin-005', warehouseCode: 'WH-RM-MUM', zoneCode: 'Z-RM-04', aisleCode: 'B', rackCode: 'R-03', shelfCode: 'S-06', binCode: 'B-03-06-01', barcode: 'BC-B03060101', qrCode: 'QR-B-03-06-01', maxWeightKg: 1800.00, maxVolumeM3: 3.80, currentWeightKg: 1800.00, currentVolumeM3: 3.80, utilizationPercent: 100.00, temperatureZone: 'CHILLED', binType: 'BULK', status: 'OCCUPIED', statusReason: 'Ghee 50kg × 36 drums — at capacity', currentItemTypes: 1 },
  { id: 'bin-006', warehouseCode: 'WH-RM-MUM', zoneCode: 'Z-RM-04', aisleCode: 'B', rackCode: 'R-03', shelfCode: 'S-07', binCode: 'B-03-07-01', barcode: 'BC-B03070101', qrCode: 'QR-B-03-07-01', maxWeightKg: 1000.00, maxVolumeM3: 2.90, currentWeightKg: 220.00, currentVolumeM3: 0.65, utilizationPercent: 22.00, temperatureZone: 'CHILLED', binType: 'STANDARD', status: 'AVAILABLE', statusReason: null, currentItemTypes: 0 },
  { id: 'bin-007', warehouseCode: 'WH-RM-MUM', zoneCode: 'Z-RM-04', aisleCode: 'B', rackCode: 'R-04', shelfCode: 'S-08', binCode: 'B-04-08-01', barcode: 'BC-B04080101', qrCode: 'QR-B-04-08-01', maxWeightKg: 800.00, maxVolumeM3: 2.40, currentWeightKg: 0.00, currentVolumeM3: 0.00, utilizationPercent: 0.00, temperatureZone: 'CHILLED', binType: 'QUARANTINE', status: 'BLOCKED', statusReason: 'Spillage — awaiting deep clean', currentItemTypes: 0 },
  { id: 'bin-008', warehouseCode: 'WH-FG-MUM', zoneCode: 'Z-FG-01', aisleCode: 'C', rackCode: 'R-05', shelfCode: 'S-09', binCode: 'C-05-09-01', barcode: 'BC-C05090101', qrCode: 'QR-C-05-09-01', maxWeightKg: 400.00, maxVolumeM3: 1.60, currentWeightKg: 142.00, currentVolumeM3: 0.95, utilizationPercent: 35.50, temperatureZone: 'AMBIENT', binType: 'PICK_FACE', status: 'OCCUPIED', statusReason: 'Kaju Katli 500g × 142 boxes (KK-2607-01)', currentItemTypes: 1 },
  { id: 'bin-009', warehouseCode: 'WH-FG-MUM', zoneCode: 'Z-FG-01', aisleCode: 'C', rackCode: 'R-05', shelfCode: 'S-10', binCode: 'C-05-10-01', barcode: 'BC-C05100101', qrCode: 'QR-C-05-10-01', maxWeightKg: 300.00, maxVolumeM3: 1.20, currentWeightKg: 285.00, currentVolumeM3: 1.10, utilizationPercent: 95.00, temperatureZone: 'AMBIENT', binType: 'PICK_FACE', status: 'OCCUPIED', statusReason: 'Kaju Katli 250g × 570 boxes — near capacity', currentItemTypes: 1 },
  { id: 'bin-010', warehouseCode: 'WH-FG-MUM', zoneCode: 'Z-FG-01', aisleCode: 'C', rackCode: 'R-06', shelfCode: 'S-11', binCode: 'C-06-11-01', barcode: 'BC-C06110101', qrCode: 'QR-C-06-11-01', maxWeightKg: 500.00, maxVolumeM3: 2.00, currentWeightKg: 89.00, currentVolumeM3: 0.85, utilizationPercent: 17.80, temperatureZone: 'AMBIENT', binType: 'PICK_FACE', status: 'RESERVED', statusReason: 'Reserved for production order PRD-2026-0156 (Soan Cake 1kg)', currentItemTypes: 1 },
  { id: 'bin-011', warehouseCode: 'WH-FG-MUM', zoneCode: 'Z-FG-02', aisleCode: 'D', rackCode: '—', shelfCode: '—', binCode: 'D-00-00-01', barcode: 'BC-D00000001', qrCode: 'QR-D-00-00-01', maxWeightKg: 1000.00, maxVolumeM3: 4.00, currentWeightKg: 0.00, currentVolumeM3: 0.00, utilizationPercent: 0.00, temperatureZone: 'AMBIENT', binType: 'STANDARD', status: 'AVAILABLE', statusReason: null, currentItemTypes: 0 },
  { id: 'bin-012', warehouseCode: 'WH-FG-MUM', zoneCode: 'Z-FG-01', aisleCode: 'C', rackCode: 'R-05', shelfCode: 'S-09', binCode: 'C-05-09-02', barcode: 'BC-C05090102', qrCode: 'QR-C-05-09-02', maxWeightKg: 400.00, maxVolumeM3: 1.60, currentWeightKg: 0.00, currentVolumeM3: 0.00, utilizationPercent: 0.00, temperatureZone: 'AMBIENT', binType: 'PICK_FACE', status: 'MAINTENANCE', statusReason: 'Rack re-leveling scheduled 10-Jul-2026', currentItemTypes: 0 },
  { id: 'bin-013', warehouseCode: 'WH-CS-MUM', zoneCode: '—', aisleCode: 'E', rackCode: 'R-07', shelfCode: 'S-12', binCode: 'E-07-12-01', barcode: 'BC-E07120101', qrCode: 'QR-E-07-12-01', maxWeightKg: 500.00, maxVolumeM3: 1.60, currentWeightKg: 312.00, currentVolumeM3: 1.05, utilizationPercent: 62.40, temperatureZone: 'FROZEN', binType: 'STANDARD', status: 'OCCUPIED', statusReason: 'Vanilla ice cream 1L × 312 tubs', currentItemTypes: 1 },
  { id: 'bin-014', warehouseCode: 'WH-CS-MUM', zoneCode: '—', aisleCode: 'E', rackCode: 'R-07', shelfCode: 'S-12', binCode: 'E-07-12-02', barcode: 'BC-E07120102', qrCode: 'QR-E-07-12-02', maxWeightKg: 500.00, maxVolumeM3: 1.60, currentWeightKg: 540.00, currentVolumeM3: 1.65, utilizationPercent: 108.00, temperatureZone: 'FROZEN', binType: 'BULK', status: 'OCCUPIED', statusReason: 'Chocolate ice cream 1L × 540 tubs — OVERLOADED', currentItemTypes: 1 },
  { id: 'bin-015', warehouseCode: 'WH-PKG-MUM', zoneCode: '—', aisleCode: 'F', rackCode: 'R-08', shelfCode: '—', binCode: 'F-08-00-01', barcode: 'BC-F08000001', qrCode: 'QR-F-08-00-01', maxWeightKg: 2500.00, maxVolumeM3: 12.00, currentWeightKg: 1420.00, currentVolumeM3: 7.80, utilizationPercent: 56.80, temperatureZone: 'AMBIENT', binType: 'BULK', status: 'OCCUPIED', statusReason: 'Printed Kaju Katli 500g boxes × 2840', currentItemTypes: 1 },
]

const WH_LOC_CAPACITY_LOGS = [
  { id: 'bcl-001', binCode: 'B-03-06-01', warehouseName: 'Raw Material Warehouse', currentWeightKg: 1800.00, currentVolumeM3: 3.80, maxWeightKg: 1800.00, maxVolumeM3: 3.80, utilizationPercent: 100.00, alertType: 'FULL', alertMessage: 'Bin at 100% capacity. No further putaway allowed. Suggest overflow to B-03-07-01.', itemTypes: 1, totalQuantity: 36, snapshotAt: '09 Jul 08:45' },
  { id: 'bcl-002', binCode: 'E-07-12-02', warehouseName: 'Cold Storage Warehouse', currentWeightKg: 540.00, currentVolumeM3: 1.65, maxWeightKg: 500.00, maxVolumeM3: 1.60, utilizationPercent: 108.00, alertType: 'OVERLOADED', alertMessage: 'Bin OVERLOADED — 540 kg exceeds 500 kg max (8% over). Structural risk. Immediate redistribution required.', itemTypes: 1, totalQuantity: 540, snapshotAt: '09 Jul 07:35' },
  { id: 'bcl-003', binCode: 'A-01-02-01', warehouseName: 'Raw Material Warehouse', currentWeightKg: 480.00, currentVolumeM3: 1.90, maxWeightKg: 1200.00, maxVolumeM3: 5.20, utilizationPercent: 40.00, alertType: 'UNDERUTILIZED', alertMessage: 'Bin at 40% utilization for 7+ days. Consider consolidating or re-slotting for fast-moving stock.', itemTypes: 0, totalQuantity: 0, snapshotAt: '09 Jul 08:30' },
  { id: 'bcl-004', binCode: 'C-05-10-01', warehouseName: 'Finished Goods Warehouse', currentWeightKg: 285.00, currentVolumeM3: 1.10, maxWeightKg: 300.00, maxVolumeM3: 1.20, utilizationPercent: 95.00, alertType: 'NEAR_FULL', alertMessage: 'Bin at 95% capacity. Reserve for current SKU only — disable mixed-SKU putaway to prevent overflow.', itemTypes: 1, totalQuantity: 570, snapshotAt: '09 Jul 09:20' },
]

function utilizationColor(p: number): string {
  if (p >= 100) return 'bg-red-600'
  if (p >= 90) return 'bg-amber-500'
  if (p >= 60) return 'bg-emerald-500'
  if (p >= 30) return 'bg-blue-500'
  return 'bg-slate-400'
}

function utilizationTextColor(p: number): string {
  if (p >= 100) return 'text-red-600 dark:text-red-400'
  if (p >= 90) return 'text-amber-600 dark:text-amber-400'
  if (p >= 60) return 'text-emerald-600 dark:text-emerald-400'
  if (p >= 30) return 'text-blue-600 dark:text-blue-400'
  return 'text-slate-500'
}

export function WarehouseLocationModule() {
  const [tab, setTab] = useState<WhLocTab>('overview')
  const tabs: Array<{ key: WhLocTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'bins', label: 'Bins', icon: <Hash className="h-4 w-4" /> },
    { key: 'aisles', label: 'Aisles', icon: <Route className="h-4 w-4" /> },
    { key: 'racks', label: 'Racks', icon: <Grid3x3 className="h-4 w-4" /> },
    { key: 'capacity', label: 'Capacity', icon: <Gauge className="h-4 w-4" /> },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-indigo-950 via-purple-900 to-fuchsia-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <MapPinIcon className="h-7 w-7" /> Warehouse Location & Bin Management
            </h2>
            <p className="text-indigo-200 text-sm max-w-3xl">
              The digital map of the warehouse — 6-level hierarchy (Warehouse → Zone → Aisle → Rack → Shelf → Bin) with
              scanner-first workflow. 6 aisles · 8 racks · 12 shelves · 15 bins · 4 capacity alerts. Every putaway, pick,
              count, and transfer resolves to a specific bin via barcode/QR scan.
            </p>
          </div>
          <Badge className="bg-fuchsia-500 text-fuchsia-950 hover:bg-fuchsia-500">Sprint 23 · Part 4 WMS</Badge>
        </div>
      </Card>
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      {tab === 'overview' && <WhLocOverviewTab />}
      {tab === 'bins' && <WhLocBinsTab />}
      {tab === 'aisles' && <WhLocAislesTab />}
      {tab === 'racks' && <WhLocRacksTab />}
      {tab === 'capacity' && <WhLocCapacityTab />}
    </div>
  )
}

function WhLocOverviewTab() {
  const stats = [
    { label: 'Total Bins', value: '15', sub: 'Across 5 warehouses', icon: <Hash className="h-5 w-5 text-indigo-600" /> },
    { label: 'Available', value: '4', sub: 'Ready for putaway', icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" /> },
    { label: 'Occupied', value: '8', sub: 'Active stock', icon: <Box className="h-5 w-5 text-blue-600" /> },
    { label: 'Reserved', value: '1', sub: 'Held for orders', icon: <LockIcon className="h-5 w-5 text-amber-600" /> },
    { label: 'Blocked', value: '1', sub: 'Needs cleaning', icon: <AlertTriangle className="h-5 w-5 text-red-600" /> },
    { label: 'Aisles', value: '6', sub: '4 traffic types', icon: <Route className="h-5 w-5 text-purple-600" /> },
    { label: 'Racks', value: '8', sub: '7 fire zones', icon: <Grid3x3 className="h-5 w-5 text-cyan-600" /> },
    { label: 'Shelves', value: '12', sub: '4 picking levels', icon: <Layers3 className="h-5 w-5 text-fuchsia-600" /> },
  ]
  const hierarchy = [
    { level: 'Warehouse', icon: <Warehouse className="h-4 w-4" />, desc: 'WH-RM-MUM · WH-FG-MUM ...', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    { level: 'Zone', icon: <Layers3 className="h-4 w-4" />, desc: 'Z-RM-03 · Z-FG-01 ...', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
    { level: 'Aisle', icon: <Route className="h-4 w-4" />, desc: 'A · B · C · D · E · F', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
    { level: 'Rack', icon: <Grid3x3 className="h-4 w-4" />, desc: 'R-01 · R-02 ... R-08', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' },
    { level: 'Shelf', icon: <Box className="h-4 w-4" />, desc: 'S-01 · S-02 ... S-12', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    { level: 'Bin', icon: <Hash className="h-4 w-4" />, desc: 'A-01-01-01 ... smallest unit', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
    { level: 'Inventory', icon: <Boxes className="h-4 w-4" />, desc: 'Stock lives here', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
  ]
  const namingParts = [
    { part: 'A', label: 'Aisle Code', desc: 'Single letter (A-F) — aisle identifier within the warehouse', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' },
    { part: '05', label: 'Rack Sequence', desc: 'Zero-padded 2-digit rack number (01-99) — physical rack within the aisle', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' },
    { part: '03', label: 'Shelf Sequence', desc: 'Zero-padded 2-digit shelf number (01-99) — shelf level on the rack', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    { part: '12', label: 'Bin Sequence', desc: 'Zero-padded 2-digit bin number (01-99) — specific bin on the shelf', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  ]
  const scannerSteps = [
    { step: '1', title: 'Scan Bin Barcode/QR', desc: 'Operator scans bin label with handheld scanner or mobile device. Bin code (e.g., A-05-03-12) is read instantly.', icon: <ScanIcon className="h-5 w-5 text-indigo-600" /> },
    { step: '2', title: 'Resolve Hierarchy', desc: 'System resolves Warehouse → Zone → Aisle → Rack → Shelf → Bin, validates access rules, and checks bin status.', icon: <Network className="h-5 w-5 text-purple-600" /> },
    { step: '3', title: 'Validate Operation', desc: 'Rules engine validates: MAX_BIN_WEIGHT, FEFO_ENABLED, BARCODE_MANDATORY, QUALITY_INSPECTION_REQUIRED. BLOCK/WARN/LOG.', icon: <ShieldCheck className="h-5 w-5 text-emerald-600" /> },
    { step: '4', title: 'Confirm or Reject', desc: 'Operation confirmed (putaway/pick/count/transfer) or rejected with reason. Snapshot logged for capacity tracking.', icon: <CheckCircle2 className="h-5 w-5 text-amber-600" /> },
  ]
  return (
    <div className="space-y-6">
      {/* 8 stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className="p-5">
            <div className="flex items-start justify-between mb-2"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">{s.icon}</div></div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium mt-1">{s.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Warehouse hierarchy diagram */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Network className="h-5 w-5 text-indigo-600" /> Warehouse Hierarchy — 7 Levels (Inventory lives at the Bin)</h3>
        <p className="text-sm text-muted-foreground mb-4">Physical storage is addressed through 7 nested levels. The Bin is the smallest addressable storage unit — every transaction (putaway, pick, count, transfer) resolves to a specific bin via barcode/QR scan.</p>
        <div className="flex flex-wrap items-center gap-2">
          {hierarchy.map((h, i) => (
            <div key={h.level} className="flex items-center gap-2">
              <div className={cn('flex items-center gap-2 px-3 py-2 rounded-md', h.color)}>
                {h.icon}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide">{h.level}</p>
                  <p className="text-xs opacity-80">{h.desc}</p>
                </div>
              </div>
              {i < hierarchy.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Bin naming convention */}
      <Card className="p-5">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Hash className="h-5 w-5 text-rose-600" /> Bin Naming Convention — A-05-03-12 Format</h3>
        <p className="text-sm text-muted-foreground mb-4">Every bin has a human-readable code that encodes its full physical location. Sortable, parseable, and easy to label. Example: <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">A-05-03-12</span> = Aisle A, Rack 05, Shelf 03, Bin 12.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {namingParts.map((p, i) => (
            <div key={p.label} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={cn('font-mono text-2xl font-bold px-3 py-1 rounded-md', p.color)}>{p.part}</span>
                <span className="text-xs text-muted-foreground">{i < namingParts.length - 1 ? <ChevronRight className="h-4 w-4" /> : '✓'}</span>
              </div>
              <p className="text-sm font-semibold">{p.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Scanner-first workflow */}
      <Card className="p-5">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><ScanIcon className="h-5 w-5 text-indigo-600" /> Scanner-First Workflow — 4 Steps</h3>
        <p className="text-sm text-muted-foreground mb-4">Every receive/putaway/pick/dispatch starts with a barcode or QR scan of the bin label. Manual entry triggers a WARN (per Sprint 22 BARCODE_MANDATORY rule). The system resolves the hierarchy, validates the operation against rules, and confirms or blocks.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {scannerSteps.map(s => (
            <div key={s.step} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-sm">{s.step}</div>
                {s.icon}
              </div>
              <p className="text-sm font-semibold">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function WhLocBinsTab() {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900">
        <p className="text-sm text-indigo-900 dark:text-indigo-200">
          <Hash className="inline h-4 w-4 mr-1" /> 15 bins across 5 warehouses. Each bin has a unique code (A-05-03-12 format), barcode (BC-...), QR code, capacity (max weight + volume), current utilization, status (7 types), and type (STANDARD, BULK, PICK_FACE, QUARANTINE). Utilization color-coded: emerald (60-89%), amber (90-99%), red (≥100%).
        </p>
      </Card>
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-3 py-2 font-medium">Bin Code</th>
                <th className="text-left px-3 py-2 font-medium">Hierarchy Path</th>
                <th className="text-left px-3 py-2 font-medium">Barcode / QR</th>
                <th className="text-center px-3 py-2 font-medium">Status</th>
                <th className="text-center px-3 py-2 font-medium">Type</th>
                <th className="text-center px-3 py-2 font-medium">Temp</th>
                <th className="text-left px-3 py-2 font-medium">Utilization</th>
                <th className="text-right px-3 py-2 font-medium">Weight (kg)</th>
                <th className="text-right px-3 py-2 font-medium">Volume (m³)</th>
              </tr>
            </thead>
            <tbody>
              {WH_LOC_BINS.map(b => (
                <tr key={b.id} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <p className="font-mono font-bold text-base">{b.binCode}</p>
                    <p className="text-xs text-muted-foreground">{b.warehouseCode}</p>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <span className="font-mono">{b.zoneCode}</span>
                    <ChevronRight className="inline h-3 w-3 text-muted-foreground" />
                    <span className="font-mono">{b.aisleCode}</span>
                    <ChevronRight className="inline h-3 w-3 text-muted-foreground" />
                    <span className="font-mono">{b.rackCode}</span>
                    <ChevronRight className="inline h-3 w-3 text-muted-foreground" />
                    <span className="font-mono">{b.shelfCode}</span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div className="flex items-center gap-1"><Barcode className="h-3 w-3 text-muted-foreground" /><span className="font-mono">{b.barcode}</span></div>
                    <div className="flex items-center gap-1"><QrCode className="h-3 w-3 text-muted-foreground" /><span className="font-mono">{b.qrCode}</span></div>
                  </td>
                  <td className="px-3 py-2 text-center"><Badge className={cn('text-xs', BIN_STATUS_COLORS[b.status])}>{b.status}</Badge></td>
                  <td className="px-3 py-2 text-center"><Badge className={cn('text-xs', BIN_TYPE_COLORS[b.binType])}>{b.binType.replace(/_/g, ' ')}</Badge></td>
                  <td className="px-3 py-2 text-center"><Badge className={cn('text-xs', BIN_TEMP_ZONE_COLORS[b.temperatureZone])}>{b.temperatureZone}</Badge></td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-[60px]">
                        <div className={cn('h-full rounded-full', utilizationColor(b.utilizationPercent))} style={{ width: `${Math.min(b.utilizationPercent, 100)}%` }} />
                      </div>
                      <span className={cn('text-xs font-mono font-semibold w-12 text-right', utilizationTextColor(b.utilizationPercent))}>{b.utilizationPercent.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    <span className={cn(b.utilizationPercent >= 100 ? 'text-red-600 dark:text-red-400 font-bold' : '')}>{b.currentWeightKg.toFixed(0)}</span>
                    <span className="text-muted-foreground"> / {b.maxWeightKg.toFixed(0)}</span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs">
                    <span className={cn(b.utilizationPercent >= 100 ? 'text-red-600 dark:text-red-400 font-bold' : '')}>{b.currentVolumeM3.toFixed(2)}</span>
                    <span className="text-muted-foreground"> / {b.maxVolumeM3.toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function WhLocAislesTab() {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900">
        <p className="text-sm text-purple-900 dark:text-purple-200">
          <Route className="inline h-4 w-4 mr-1" /> 6 aisles across 4 warehouses. Each aisle has a traffic direction: ONE_WAY (max pick velocity, single direction), TWO_WAY (bidirectional for balanced throughput), FORKLIFT_ONLY (cold storage, heavy pallets), WALKING_ONLY (picker-foot-traffic only).
        </p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WH_LOC_AISLES.map(a => (
          <Card key={a.id} className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl font-bold text-indigo-600 dark:text-indigo-400">{a.aisleCode}</span>
                  <Badge className={cn('text-xs', TRAFFIC_DIRECTION_COLORS[a.trafficDirection])}>{a.trafficDirection.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="font-semibold text-sm mt-1">{a.aisleName}</p>
              </div>
              <Badge className="text-xs bg-emerald-600 text-white">{a.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{a.description}</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Warehouse</span>
                <span className="font-mono">{a.warehouseCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Zone Link</span>
                <span className="font-mono text-right">{a.zoneCode} · {a.zoneName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Dimensions</span>
                <span className="font-mono">{a.lengthM.toFixed(1)} × {a.widthM.toFixed(1)} m</span>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div><p className="text-muted-foreground">Racks</p><p className="font-mono font-semibold text-base">{a.rackCount}</p></div>
              <div><p className="text-muted-foreground">Shelves</p><p className="font-mono font-semibold text-base">{a.shelfCount}</p></div>
              <div><p className="text-muted-foreground">Bins</p><p className="font-mono font-semibold text-base">{a.binCount}</p></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function WhLocRacksTab() {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-900">
        <p className="text-sm text-cyan-900 dark:text-cyan-200">
          <Grid3x3 className="inline h-4 w-4 mr-1" /> 8 racks across 4 warehouses. Each rack has physical dimensions (height × width × depth), maximum weight capacity, shelf count, and a fire zone assignment for safety compliance.
        </p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WH_LOC_RACKS.map(r => (
          <Card key={r.id} className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">Aisle {r.aisleCode} · {r.warehouseCode}</p>
                <p className="font-semibold text-sm">{r.rackName}</p>
              </div>
              <Badge className="text-xs bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"><AlertTriangleIcon className="mr-1 h-3 w-3" />{r.fireZone}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{r.description}</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Height</p>
                <p className="font-mono font-semibold">{r.heightM.toFixed(2)} m</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Width</p>
                <p className="font-mono font-semibold">{r.widthM.toFixed(2)} m</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-muted-foreground">Depth</p>
                <p className="font-mono font-semibold">{r.depthM.toFixed(2)} m</p>
              </div>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Scale className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Max Weight:</span>
                <span className="font-mono font-semibold">{r.maxWeightKg.toFixed(0)} kg</span>
              </div>
              <div className="flex items-center gap-1">
                <Layers3 className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Shelves:</span>
                <span className="font-mono font-semibold">{r.shelfCount}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function WhLocCapacityTab() {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900">
        <p className="text-sm text-rose-900 dark:text-rose-200">
          <Gauge className="inline h-4 w-4 mr-1" /> 4 bin capacity alerts. Snapshot-driven capacity monitoring tracks each bin&apos;s utilization and raises alerts: FULL (100%), OVERLOADED (&gt;100%), NEAR_FULL (90-99%), UNDERUTILIZED (&lt;40% for 7+ days). Alerts trigger re-slotting or redistribution.
        </p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        {WH_LOC_CAPACITY_LOGS.map(l => (
          <Card key={l.id} className={cn('p-5 border-2', l.alertType === 'OVERLOADED' || l.alertType === 'FULL' ? 'border-red-300 dark:border-red-800' : 'border-amber-300 dark:border-amber-800')}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-mono text-xs text-muted-foreground">Bin</p>
                <p className="font-mono font-bold text-lg">{l.binCode}</p>
                <p className="text-xs text-muted-foreground">{l.warehouseName}</p>
              </div>
              <Badge className={cn('text-xs', ALERT_TYPE_COLORS[l.alertType])}>
                {l.alertType === 'OVERLOADED' && <AlertOctagon className="mr-1 h-3 w-3" />}
                {l.alertType === 'FULL' && <AlertCircle className="mr-1 h-3 w-3" />}
                {l.alertType === 'NEAR_FULL' && <AlertTriangle className="mr-1 h-3 w-3" />}
                {l.alertType === 'UNDERUTILIZED' && <TrendingDown className="mr-1 h-3 w-3" />}
                {l.alertType.replace(/_/g, ' ')}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center mb-3">
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Weight (kg)</p>
                <p className="font-mono text-sm font-semibold">{l.currentWeightKg.toFixed(0)} / {l.maxWeightKg.toFixed(0)}</p>
              </div>
              <div className="rounded-md bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Volume (m³)</p>
                <p className="font-mono text-sm font-semibold">{l.currentVolumeM3.toFixed(2)} / {l.maxVolumeM3.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full', utilizationColor(l.utilizationPercent))} style={{ width: `${Math.min(l.utilizationPercent, 100)}%` }} />
              </div>
              <span className={cn('text-xs font-mono font-bold w-14 text-right', utilizationTextColor(l.utilizationPercent))}>{l.utilizationPercent.toFixed(1)}%</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{l.alertMessage}</p>
            <Separator className="my-2" />
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">Item Types: <span className="font-mono font-semibold text-foreground">{l.itemTypes}</span></span>
                <span className="text-muted-foreground">Total Qty: <span className="font-mono font-semibold text-foreground">{l.totalQuantity}</span></span>
              </div>
              <span className="text-muted-foreground">{l.snapshotAt}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

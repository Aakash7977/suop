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
import { toast } from '@/hooks/use-toast'

type IDTab = 'overview' | 'barcodes' | 'qrcodes' | 'batches' | 'lots' | 'serials' | 'gs1' | 'labels' | 'print' | 'traceability'

export function IdentificationModule() {
  const [tab, setTab] = useState<IDTab>('overview')
  const tabs: Array<{ key: IDTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'barcodes', label: 'Barcodes', icon: <Barcode className="h-4 w-4" /> },
    { key: 'qrcodes', label: 'QR Codes', icon: <QrCode className="h-4 w-4" /> },
    { key: 'batches', label: 'Batches', icon: <Boxes className="h-4 w-4" /> },
    { key: 'lots', label: 'Lots', icon: <PackageCheck className="h-4 w-4" /> },
    { key: 'serials', label: 'Serial Numbers', icon: <Hash className="h-4 w-4" /> },
    { key: 'gs1', label: 'GS1 Standards', icon: <Globe2 className="h-4 w-4" /> },
    { key: 'labels', label: 'Label Templates', icon: <FileText className="h-4 w-4" /> },
    { key: 'print', label: 'Print Queue', icon: <Printer className="h-4 w-4" /> },
    { key: 'traceability', label: 'Traceability', icon: <Route className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-emerald-950 via-teal-900 to-cyan-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ScanLine className="h-7 w-7" /> Enterprise Identification & Traceability Platform
            </h2>
            <p className="text-teal-200 text-sm max-w-3xl">
              Complete identification layer: barcodes, QR codes, batches, lots, serial numbers, GS1 standards,
              label templates, print jobs, and end-to-end forward/backward traceability. Every Kaju Katli can be
              traced from customer complaint back to the cashew supplier in Konkan.
            </p>
          </div>
          <Badge className="bg-teal-500 text-teal-950 hover:bg-teal-500">Sprint 10</Badge>
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

      {tab === 'overview' && <IDOverviewTab />}
      {tab === 'barcodes' && <IDBarcodesTab />}
      {tab === 'qrcodes' && <IDQRCodesTab />}
      {tab === 'batches' && <IDBatchesTab />}
      {tab === 'lots' && <IDLotsTab />}
      {tab === 'serials' && <IDSerialsTab />}
      {tab === 'gs1' && <IDGS1Tab />}
      {tab === 'labels' && <IDLabelsTab />}
      {tab === 'print' && <IDPrintTab />}
      {tab === 'traceability' && <IDTraceabilityTab />}
    </div>
  )
}

function IDOverviewTab() {
  const stats = [
    { label: 'Barcode Types', value: '9', sub: 'EAN, UPC, Code128, GS1-128, ITF-14 + Internal', icon: <Barcode className="h-5 w-5 text-blue-600" /> },
    { label: 'Barcodes', value: '8', sub: '6 EAN-13 + 2 Internal + 1 ITF-14', icon: <Barcode className="h-5 w-5 text-cyan-600" /> },
    { label: 'QR Codes', value: '6', sub: 'Product, Batch, Warehouse, Location, Asset, Invoice', icon: <QrCode className="h-5 w-5 text-purple-600" /> },
    { label: 'Batches', value: '8', sub: '2 Released, 1 Quarantined, 1 Blocked, 1 Expired', icon: <Boxes className="h-5 w-5 text-amber-600" /> },
    { label: 'Lots', value: '7', sub: '3 Supplier + 2 Production + 1 Return + 1 Packaging', icon: <PackageCheck className="h-5 w-5 text-emerald-600" /> },
    { label: 'Serial Numbers', value: '5', sub: 'Machines + Equipment + Electronics', icon: <Hash className="h-5 w-5 text-indigo-600" /> },
    { label: 'GS1 Identifiers', value: '6', sub: 'GTIN, GLN, SSCC, GS1-128', icon: <Globe2 className="h-5 w-5 text-pink-600" /> },
    { label: 'Label Templates', value: '8', sub: '7 Published + 1 Pending Approval', icon: <FileText className="h-5 w-5 text-teal-600" /> },
  ]
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><AlertIcon className="h-5 w-5 text-amber-600" /> Quality Alerts</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 p-2 rounded border border-red-200 bg-red-50 dark:bg-red-950/30">
            <AlertIcon className="h-4 w-4 text-red-600" />
            <span className="font-medium">Batch KK-2606-05 BLOCKED</span>
            <span className="text-muted-foreground">— Customer complaint: taste deviation. Recall initiated (RC-2026-001). 56 units quarantined.</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded border border-amber-200 bg-amber-50 dark:bg-amber-950/30">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="font-medium">Batch KK-2607-02 QUARANTINED</span>
            <span className="text-muted-foreground">— Quality check pending. 800 units on hold.</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded border border-orange-200 bg-orange-50 dark:bg-orange-950/30">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="font-medium">Batch GJ-2606-02 EXPIRED</span>
            <span className="text-muted-foreground">— Past expiry date. Disposal required.</span>
          </div>
        </div>
      </Card>
      <Card className="p-6 bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Route className="h-5 w-5 text-teal-600" /> Traceability Architecture</h3>
        <p className="text-sm text-muted-foreground mb-3">Every finished product traces back through 7 stages. The Traceability Engine supports both directions:</p>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded border bg-background">
            <p className="font-semibold mb-2 flex items-center gap-1"><ArrowUpFromLine className="h-4 w-4 text-emerald-600" /> Forward Traceability (Batch → Customer)</p>
            <p className="text-muted-foreground">Production Output → Warehouse → Sales Dispatch → Customer Delivery. Used for: "Where did this batch go?"</p>
          </div>
          <div className="p-3 rounded border bg-background">
            <p className="font-semibold mb-2 flex items-center gap-1"><ArrowDownToLine className="h-4 w-4 text-blue-600" /> Backward Traceability (Customer → Supplier)</p>
            <p className="text-muted-foreground">Customer Complaint → Invoice → Batch → Production Order → Raw Material → Supplier. Used for recalls.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function IDBarcodesTab() {
  const barcodes = [
    { id: 'bc-001', barcode: '8901234567890', type: 'EAN_13', product: 'Kaju Katli 500g', primary: true, status: 'ACTIVE' },
    { id: 'bc-002', barcode: '8901234567891', type: 'EAN_13', product: 'Kaju Katli 250g', primary: true, status: 'ACTIVE' },
    { id: 'bc-003', barcode: '8901234567892', type: 'EAN_13', product: 'Soan Cake 1kg', primary: true, status: 'ACTIVE' },
    { id: 'bc-004', barcode: '8901234567893', type: 'EAN_13', product: 'Mixed Namkeen 200g', primary: true, status: 'ACTIVE' },
    { id: 'bc-005', barcode: '8901234567894', type: 'EAN_13', product: 'Gulab Jamun 1kg', primary: true, status: 'ACTIVE' },
    { id: 'bc-006', barcode: 'SUDH-INT-KK-500', type: 'INTERNAL', product: 'Kaju Katli 500g (Internal)', primary: false, status: 'ACTIVE' },
    { id: 'bc-007', barcode: 'SUDH-INT-SC-1000', type: 'INTERNAL', product: 'Soan Cake 1kg (Internal)', primary: false, status: 'ACTIVE' },
    { id: 'bc-008', barcode: '00012345600012', type: 'ITF_14', product: 'Kaju Katli Carton (12 pcs)', primary: false, status: 'ACTIVE' },
  ]
  const typeColor: Record<string, string> = {
    EAN_13: 'bg-blue-100 text-blue-800', EAN_8: 'bg-cyan-100 text-cyan-800',
    UPC_A: 'bg-purple-100 text-purple-800', UPC_E: 'bg-violet-100 text-violet-800',
    CODE_128: 'bg-amber-100 text-amber-800', CODE_39: 'bg-orange-100 text-orange-800',
    GS1_128: 'bg-emerald-100 text-emerald-800', ITF_14: 'bg-pink-100 text-pink-800',
    INTERNAL: 'bg-slate-100 text-slate-800',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Barcode Management</h3>
        <p className="text-xs text-muted-foreground mt-1">9 supported types: EAN-13, EAN-8, UPC-A, UPC-E, Code128, Code39, GS1-128, ITF-14, Internal. One primary barcode per variant. Unique enforcement.</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Generate Barcode — POST /api/v1/catalog/products/:id/barcodes' })}><Plus className="mr-1 h-4 w-4" /> Generate Barcode</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Barcode</th><th className="font-medium">Type</th>
            <th className="font-medium">Product</th><th className="font-medium">Primary</th><th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {barcodes.map(b => (
              <tr key={b.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{b.barcode}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[b.type])}>{b.type.replace(/_/g, '-')}</span></td>
                <td className="font-medium">{b.product}</td>
                <td>{b.primary ? <Badge className="bg-blue-600 hover:bg-blue-600 text-xs">Primary</Badge> : <Badge variant="outline" className="text-xs">Secondary</Badge>}</td>
                <td><Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs">{b.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function IDQRCodesTab() {
  const qrcodes = [
    { id: 'qr-001', code: 'QR-PROD-KK-001', purpose: 'PRODUCT', entity: 'Kaju Katli 500g', scans: 1247, lastScan: '2026-07-08 15:23', encrypted: false, status: 'ACTIVE' },
    { id: 'qr-002', code: 'QR-BATCH-KK-2607-01', purpose: 'BATCH', entity: 'Batch KK-2607-01', scans: 384, lastScan: '2026-07-09 11:15', encrypted: true, status: 'ACTIVE' },
    { id: 'qr-003', code: 'QR-WHSE-MUM-DC', purpose: 'WAREHOUSE', entity: 'Mumbai Distribution Center', scans: 5421, lastScan: '2026-07-09 09:00', encrypted: false, status: 'ACTIVE' },
    { id: 'qr-004', code: 'QR-LOC-A1-03', purpose: 'LOCATION', entity: 'Rack A1, Bin 03 (Cold Storage)', scans: 892, lastScan: '2026-07-09 14:30', encrypted: false, status: 'ACTIVE' },
    { id: 'qr-005', code: 'QR-ASSET-MIXER-01', purpose: 'ASSET', entity: 'Industrial Mixer M-01', scans: 156, lastScan: '2026-07-07 16:45', encrypted: true, status: 'ACTIVE' },
    { id: 'qr-006', code: 'QR-INV-2026-00892', purpose: 'INVOICE', entity: 'Invoice INV-2026-00892 (Tata)', scans: 12, lastScan: '2026-07-08 18:00', encrypted: false, status: 'ACTIVE' },
  ]
  const purposeColor: Record<string, string> = {
    PRODUCT: 'bg-blue-100 text-blue-800', BATCH: 'bg-purple-100 text-purple-800',
    WAREHOUSE: 'bg-amber-100 text-amber-800', LOCATION: 'bg-emerald-100 text-emerald-800',
    ASSET: 'bg-pink-100 text-pink-800', INVOICE: 'bg-cyan-100 text-cyan-800',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">QR Code Platform</h3>
        <p className="text-xs text-muted-foreground mt-1">7 purposes: Product, Batch, Warehouse, Location, Asset, Order, Invoice. AES-256 encryption for sensitive codes. Scan tracking with last-scanned timestamp.</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Generate QR — backend endpoint pending' })}><Plus className="mr-1 h-4 w-4" /> Generate QR</Button>
      </div>
      <div className="space-y-3">
        {qrcodes.map(q => (
          <div key={q.id} className="border rounded-lg p-3 flex items-center gap-3">
            <div className="h-12 w-12 rounded-md bg-slate-900 flex items-center justify-center flex-shrink-0">
              <QrCode className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-mono text-xs">{q.code}</p>
                <span className={cn('inline-block px-1.5 py-0.5 rounded text-xs font-medium', purposeColor[q.purpose])}>{q.purpose}</span>
                {q.encrypted && <Badge variant="outline" className="text-xs"><ShieldIcon className="mr-1 h-3 w-3" />AES-256</Badge>}
              </div>
              <p className="font-medium text-sm truncate">{q.entity}</p>
              <p className="text-xs text-muted-foreground">{q.scans.toLocaleString('en-IN')} scans · Last: {q.lastScan}</p>
            </div>
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs">{q.status}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}

function IDBatchesTab() {
  const batches = [
    { id: 'bat-001', batch: 'KK-2607-01', product: 'Kaju Katli 500g', mfg: '2026-07-01', exp: '2026-07-31', produced: 500, remaining: 142, status: 'RELEASED', grade: 'A', lots: 3 },
    { id: 'bat-002', batch: 'KK-2607-02', product: 'Kaju Katli 500g', mfg: '2026-07-05', exp: '2026-08-04', produced: 800, remaining: 800, status: 'QUARANTINED', grade: null, lots: 0, reason: 'Quality check pending' },
    { id: 'bat-003', batch: 'SC-2606-04', product: 'Soan Cake 1kg', mfg: '2026-06-15', exp: '2026-09-15', produced: 300, remaining: 89, status: 'RELEASED', grade: 'A', lots: 2 },
    { id: 'bat-004', batch: 'MN-2607-03', product: 'Mixed Namkeen 200g', mfg: '2026-07-08', exp: '2026-08-22', produced: 1200, remaining: 1180, status: 'PRODUCED', grade: 'B', lots: 4 },
    { id: 'bat-005', batch: 'GJ-2606-02', product: 'Gulab Jamun 1kg', mfg: '2026-06-20', exp: '2026-07-20', produced: 400, remaining: 0, status: 'EXPIRED', grade: null, lots: 2, reason: 'Past expiry - dispose' },
    { id: 'bat-006', batch: 'GJ-2607-01', product: 'Gulab Jamun 1kg', mfg: '2026-07-05', exp: '2026-08-05', produced: 600, remaining: 412, status: 'RELEASED', grade: 'A', lots: 3 },
    { id: 'bat-007', batch: 'KK-2606-05', product: 'Kaju Katli 500g', mfg: '2026-06-25', exp: '2026-07-25', produced: 700, remaining: 56, status: 'BLOCKED', grade: 'C', lots: 2, reason: 'Customer complaint - investigation' },
    { id: 'bat-008', batch: 'SC-2607-01', product: 'Soan Cake 1kg', mfg: '2026-07-10', exp: '2026-10-10', produced: 0, remaining: 0, status: 'PLANNED', grade: null, lots: 0 },
  ]
  const statusColor: Record<string, string> = {
    RELEASED: 'bg-emerald-600 hover:bg-emerald-600', PRODUCED: 'bg-blue-600 hover:bg-blue-600',
    PLANNED: 'bg-slate-500 hover:bg-slate-500', QUARANTINED: 'bg-amber-500 hover:bg-amber-500',
    BLOCKED: 'bg-red-600 hover:bg-red-600', EXPIRED: 'bg-gray-700 hover:bg-gray-700',
    CONSUMED: 'bg-violet-600 hover:bg-violet-600',
  }
  const gradeColor: Record<string, string> = { A: 'text-emerald-600', B: 'text-blue-600', C: 'text-amber-600', REJECT: 'text-red-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Batch Management</h3>
        <p className="text-xs text-muted-foreground mt-1">7 batch statuses: Planned, Produced, Released, Quarantined, Blocked, Consumed, Expired. Quality grade A/B/C/REJECT. Mandatory for all manufactured products (per Chief Architect recommendation).</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Create Batch — use manufacturing module' })}><Plus className="mr-1 h-4 w-4" /> New Batch</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Batch No</th><th className="font-medium">Product</th>
            <th className="font-medium">Mfg Date</th><th className="font-medium">Expiry</th>
            <th className="font-medium text-right">Produced</th><th className="font-medium text-right">Remaining</th>
            <th className="font-medium">Grade</th><th className="font-medium">Lots</th><th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {batches.map(b => (
              <tr key={b.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{b.batch}</td>
                <td className="font-medium">{b.product}</td>
                <td className="text-xs text-muted-foreground">{b.mfg}</td>
                <td className="text-xs text-muted-foreground">{b.exp}</td>
                <td className="text-right font-mono">{b.produced}</td>
                <td className="text-right font-mono">{b.remaining}</td>
                <td>{b.grade ? <span className={cn('font-mono font-bold', gradeColor[b.grade])}>{b.grade}</span> : <span className="text-muted-foreground">—</span>}</td>
                <td className="text-center">{b.lots}</td>
                <td><Badge className={statusColor[b.status] || 'bg-gray-500'}>{b.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(batches.find(b => b.reason)) && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Status Reasons:</p>
          {batches.filter(b => b.reason).map(b => (
            <div key={b.id} className="text-xs p-2 rounded border bg-muted/40">
              <span className="font-mono font-medium">{b.batch}:</span> <span className="text-muted-foreground">{b.reason}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function IDLotsTab() {
  const lots = [
    { id: 'lot-001', lot: 'CASHEW-KK-2606', type: 'SUPPLIER_LOT', product: 'Cashew Nuts (Raw)', supplier: 'Konkan Cashew Processors', invoice: 'PO-2026-0142', batch: 'KK-2607-01', qty: 200, remaining: 35, quality: 'PASSED' },
    { id: 'lot-002', lot: 'SUGAR-SB-2606', type: 'SUPPLIER_LOT', product: 'Sugar (Raw)', supplier: 'Sri Balaji Sugar', invoice: 'PO-2026-0156', batch: 'KK-2607-01', qty: 150, remaining: 28, quality: 'PASSED' },
    { id: 'lot-003', lot: 'GHEE-AM-2606', type: 'SUPPLIER_LOT', product: 'Ghee (Raw)', supplier: 'Amul', invoice: 'PO-2026-0178', batch: 'KK-2607-01', qty: 50, remaining: 12, quality: 'PASSED' },
    { id: 'lot-004', lot: 'PROD-KK-2607-01-A', type: 'PRODUCTION_LOT', product: 'Kaju Katli (Run A)', supplier: null, invoice: null, batch: 'KK-2607-01', qty: 250, remaining: 78, quality: 'PASSED' },
    { id: 'lot-005', lot: 'PROD-KK-2607-01-B', type: 'PRODUCTION_LOT', product: 'Kaju Katli (Run B)', supplier: null, invoice: null, batch: 'KK-2607-01', qty: 250, remaining: 64, quality: 'PASSED' },
    { id: 'lot-006', lot: 'PKG-MB-2607', type: 'SUPPLIER_LOT', product: 'Packaging Boxes', supplier: 'Mumbai Packaging Solutions', invoice: 'PO-2026-0203', batch: null, qty: 5000, remaining: 2840, quality: 'PASSED' },
    { id: 'lot-007', lot: 'RET-KK-2606-05', type: 'RETURN_LOT', product: 'Kaju Katli (Returned)', supplier: null, invoice: null, batch: 'KK-2606-05', qty: 24, remaining: 24, quality: 'QUARANTINED' },
  ]
  const typeColor: Record<string, string> = {
    SUPPLIER_LOT: 'bg-purple-100 text-purple-800', PRODUCTION_LOT: 'bg-emerald-100 text-emerald-800',
    WAREHOUSE_LOT: 'bg-amber-100 text-amber-800', RETURN_LOT: 'bg-red-100 text-red-800',
    INSPECTION_LOT: 'bg-blue-100 text-blue-800',
  }
  const qualityColor: Record<string, string> = { PASSED: 'text-emerald-600', FAILED: 'text-red-600', PENDING: 'text-amber-600', QUARANTINED: 'text-red-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Lot Management</h3>
        <p className="text-xs text-muted-foreground mt-1">5 lot types: Supplier, Production, Warehouse, Return, Inspection. Hierarchy: Batch → Multiple Lots. Tracks supplier invoice + quality status for raw material traceability.</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Create Lot — backend endpoint pending' })}><Plus className="mr-1 h-4 w-4" /> New Lot</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Lot No</th><th className="font-medium">Type</th>
            <th className="font-medium">Product</th><th className="font-medium">Supplier / Source</th>
            <th className="font-medium">Batch</th><th className="font-medium text-right">Qty</th>
            <th className="font-medium text-right">Remaining</th><th className="font-medium">Quality</th>
          </tr></thead>
          <tbody>
            {lots.map(l => (
              <tr key={l.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{l.lot}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[l.type])}>{l.type.replace(/_/g, ' ')}</span></td>
                <td className="font-medium">{l.product}</td>
                <td className="text-xs">{l.supplier || <span className="text-muted-foreground">—</span>}<br />{l.invoice && <span className="font-mono text-muted-foreground">{l.invoice}</span>}</td>
                <td className="font-mono text-xs">{l.batch || <span className="text-muted-foreground">—</span>}</td>
                <td className="text-right font-mono">{l.qty}</td>
                <td className="text-right font-mono">{l.remaining}</td>
                <td className={cn('font-semibold', qualityColor[l.quality])}>{l.quality}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function IDSerialsTab() {
  const serials = [
    { id: 'sn-001', serial: 'SUDH-MIX-M01', product: 'Industrial Dough Mixer', type: 'MACHINE', warrantyStart: '2025-04-01', warrantyEnd: '2027-04-01', status: 'IN_SERVICE', location: 'Mumbai Plant - Production Line 1', lastService: '2026-06-15', nextService: '2026-09-15' },
    { id: 'sn-002', serial: 'SUDH-PACK-P02', product: 'Automatic Packaging Machine', type: 'MACHINE', warrantyStart: '2025-04-01', warrantyEnd: '2027-04-01', status: 'IN_SERVICE', location: 'Mumbai Plant - Packaging Line 2', lastService: '2026-06-20', nextService: '2026-09-20' },
    { id: 'sn-003', serial: 'SUDH-COLD-S01', product: 'Walk-in Cold Storage Unit', type: 'EQUIPMENT', warrantyStart: '2024-01-15', warrantyEnd: '2026-01-15', status: 'UNDER_REPAIR', location: 'Mumbai DC - Cold Zone', lastService: '2026-07-01', nextService: '2026-07-12' },
    { id: 'sn-004', serial: 'SUDH-FORL-F03', product: 'Electric Forklift', type: 'EQUIPMENT', warrantyStart: '2024-08-01', warrantyEnd: '2026-08-01', status: 'IN_SERVICE', location: 'Pune Warehouse', lastService: '2026-05-10', nextService: '2026-08-10' },
    { id: 'sn-005', serial: 'SUDH-POS-R001', product: 'POS Terminal (Retail)', type: 'ELECTRONICS', warrantyStart: '2025-10-01', warrantyEnd: '2026-10-01', status: 'ACTIVE', location: 'Mumbai Retail Store 01', lastService: null, nextService: null },
  ]
  const typeColor: Record<string, string> = { MACHINE: 'bg-blue-100 text-blue-800', EQUIPMENT: 'bg-purple-100 text-purple-800', ELECTRONICS: 'bg-cyan-100 text-cyan-800', HIGH_VALUE_ITEM: 'bg-amber-100 text-amber-800' }
  const statusColor: Record<string, string> = { ACTIVE: 'bg-emerald-600 hover:bg-emerald-600', IN_SERVICE: 'bg-blue-600 hover:bg-blue-600', UNDER_REPAIR: 'bg-amber-500 hover:bg-amber-500', RETIRED: 'bg-gray-600 hover:bg-gray-600', LOST: 'bg-red-600 hover:bg-red-600', STOLEN: 'bg-red-700 hover:bg-red-700' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Serial Number Management</h3>
        <p className="text-xs text-muted-foreground mt-1">For machines, equipment, electronics, high-value items. Globally unique serials. Tracks warranty, service history, current location. Per Chief Architect: mandatory for machines & equipment, not for food products.</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Assign Serial — backend endpoint pending' })}><Plus className="mr-1 h-4 w-4" /> Assign Serial</Button>
      </div>
      <div className="space-y-3">
        {serials.map(s => {
          const today = new Date()
          const warrantyEnd = new Date(s.warrantyEnd)
          const warrantyActive = warrantyEnd > today
          const warrantyExpiringSoon = warrantyEnd > today && warrantyEnd < new Date(today.getTime() + 60 * 86400000)
          return (
            <div key={s.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-mono text-xs">{s.serial}</p>
                    <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[s.type])}>{s.type}</span>
                    <Badge className={statusColor[s.status] + ' text-xs'}>{s.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <p className="font-medium">{s.product}</p>
                  <p className="text-xs text-muted-foreground mt-0.5"><MapPinned className="inline h-3 w-3 mr-1" />{s.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Warranty</p>
                  <p className={cn('text-xs font-semibold', warrantyActive ? (warrantyExpiringSoon ? 'text-amber-600' : 'text-emerald-600') : 'text-red-600')}>
                    {warrantyActive ? (warrantyExpiringSoon ? 'Expiring soon' : 'Active') : 'Expired'}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.warrantyStart} → {s.warrantyEnd}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <span>Last service: <span className="font-medium text-foreground">{s.lastService || 'Never'}</span></span>
                <span>·</span>
                <span>Next service: <span className="font-medium text-foreground">{s.nextService || 'Not scheduled'}</span></span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function IDGS1Tab() {
  const gs1 = [
    { id: 'gs1-001', type: 'GTIN', identifier: '08901234567890', entity: 'Kaju Katli 500g', entityType: 'PRODUCT', prefix: '8901234', check: '0' },
    { id: 'gs1-002', type: 'GTIN', identifier: '08901234567891', entity: 'Kaju Katli 250g', entityType: 'PRODUCT', prefix: '8901234', check: '1' },
    { id: 'gs1-003', type: 'GLN', identifier: '8901234000017', entity: 'Mumbai Plant', entityType: 'LOCATION', prefix: '8901234', check: '7' },
    { id: 'gs1-004', type: 'GLN', identifier: '8901234000024', entity: 'Mumbai Distribution Center', entityType: 'LOCATION', prefix: '8901234', check: '4' },
    { id: 'gs1-005', type: 'SSCC', identifier: '008901234000000018', entity: 'Pallet PAL-2026-001', entityType: 'LOGISTIC_UNIT', prefix: '8901234', check: '8' },
    { id: 'gs1-006', type: 'GS1_128', identifier: '(01)08901234567890(17)260731(10)KK260701', entity: 'Kaju Katli 500g with batch+expiry', entityType: 'PRODUCT', prefix: '8901234', check: '0' },
  ]
  const typeColor: Record<string, string> = { GTIN: 'bg-blue-100 text-blue-800', GLN: 'bg-emerald-100 text-emerald-800', SSCC: 'bg-amber-100 text-amber-800', GS1_128: 'bg-purple-100 text-purple-800' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">GS1 Standards</h3>
        <p className="text-xs text-muted-foreground mt-1">4 GS1 identifier types: GTIN (products), GLN (locations), SSCC (logistic units), GS1-128 (with application identifiers). Company prefix: 8901234. Enables global supply chain integration.</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Create GS1 ID — backend endpoint pending' })}><Plus className="mr-1 h-4 w-4" /> New GS1 ID</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Type</th><th className="font-medium">Identifier</th>
            <th className="font-medium">Entity</th><th className="font-medium">Type</th>
            <th className="font-medium">Company Prefix</th><th className="font-medium">Check</th>
          </tr></thead>
          <tbody>
            {gs1.map(g => (
              <tr key={g.id} className="border-b hover:bg-muted/40">
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[g.type])}>{g.type.replace(/_/g, '-')}</span></td>
                <td className="font-mono text-xs break-all">{g.identifier}</td>
                <td className="font-medium">{g.entity}</td>
                <td><Badge variant="outline" className="text-xs">{g.entityType.replace(/_/g, ' ')}</Badge></td>
                <td className="font-mono text-xs">{g.prefix}</td>
                <td className="font-mono">{g.check}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function IDLabelsTab() {
  const templates = [
    { id: 'lt-001', code: 'LBL-PROD-STD', name: 'Product Label (Standard)', type: 'PRODUCT', format: 'THERMAL', w: 100, h: 60, status: 'PUBLISHED', version: 3, fields: 8 },
    { id: 'lt-002', code: 'LBL-SHELF-STD', name: 'Shelf Label', type: 'SHELF', format: 'THERMAL', w: 80, h: 40, status: 'PUBLISHED', version: 2, fields: 5 },
    { id: 'lt-003', code: 'LBL-PALLET-STD', name: 'Pallet Label (GS1)', type: 'PALLET', format: 'ZEBRA', w: 150, h: 100, status: 'PUBLISHED', version: 4, fields: 10 },
    { id: 'lt-004', code: 'LBL-BATCH-EXP', name: 'Batch Label with Expiry', type: 'BATCH', format: 'THERMAL', w: 100, h: 50, status: 'PUBLISHED', version: 2, fields: 6 },
    { id: 'lt-005', code: 'LBL-LOC-QR', name: 'Location QR Label', type: 'LOCATION', format: 'PDF', w: 90, h: 90, status: 'PUBLISHED', version: 1, fields: 4 },
    { id: 'lt-006', code: 'LBL-SHIP-DISPATCH', name: 'Shipping Dispatch Label', type: 'SHIPPING', format: 'A4', w: 210, h: 100, status: 'PUBLISHED', version: 5, fields: 12 },
    { id: 'lt-007', code: 'LBL-QR-PROD', name: 'Product QR Code Label', type: 'QR', format: 'THERMAL', w: 60, h: 60, status: 'PUBLISHED', version: 1, fields: 3 },
    { id: 'lt-008', code: 'LBL-BC-EAN13', name: 'EAN-13 Barcode Label', type: 'BARCODE', format: 'THERMAL', w: 50, h: 30, status: 'PENDING_APPROVAL', version: 1, fields: 2 },
  ]
  const typeColor: Record<string, string> = {
    PRODUCT: 'bg-blue-100 text-blue-800', SHELF: 'bg-cyan-100 text-cyan-800',
    PALLET: 'bg-amber-100 text-amber-800', BATCH: 'bg-purple-100 text-purple-800',
    LOCATION: 'bg-emerald-100 text-emerald-800', SHIPPING: 'bg-pink-100 text-pink-800',
    QR: 'bg-indigo-100 text-indigo-800', BARCODE: 'bg-slate-100 text-slate-800',
  }
  const statusColor: Record<string, string> = { PUBLISHED: 'bg-emerald-600 hover:bg-emerald-600', DRAFT: 'bg-slate-500 hover:bg-slate-500', PENDING_APPROVAL: 'bg-amber-500 hover:bg-amber-500', APPROVED: 'bg-blue-600 hover:bg-blue-600', ARCHIVED: 'bg-gray-600 hover:bg-gray-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Label Templates</h3>
        <p className="text-xs text-muted-foreground mt-1">8 label types: Product, Shelf, Pallet, Batch, Location, Shipping, QR, Barcode. 5 print formats: A4, Thermal, Zebra, Brother, PDF. Approval workflow before publishing.</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Create Label Template — backend endpoint pending' })}><Plus className="mr-1 h-4 w-4" /> New Template</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {templates.map(t => (
          <div key={t.id} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{t.code}</p>
                <p className="font-medium">{t.name}</p>
              </div>
              <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[t.type])}>{t.type}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
              <Badge variant="outline" className="text-xs font-mono">{t.format}</Badge>
              <span>{t.w}×{t.h}mm</span>
              <span>·</span>
              <span>{t.fields} fields</span>
              <span>·</span>
              <span>v{t.version}</span>
            </div>
            <Badge className={statusColor[t.status] + ' text-xs'}>{t.status.replace(/_/g, ' ')}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}

function IDPrintTab() {
  const jobs = [
    { id: 'lpj-001', template: 'Product Label (Standard)', mode: 'BULK', entityType: 'PRODUCT', printerType: 'THERMAL', printer: 'Zebra ZD420 - Plant 1', total: 500, printed: 500, status: 'COMPLETED', requestedAt: '2026-07-08 10:00', completedAt: '2026-07-08 11:30' },
    { id: 'lpj-002', template: 'Batch Label with Expiry', mode: 'SINGLE', entityType: 'BATCH', printerType: 'THERMAL', printer: 'Brother TD-4520 - Plant 1', total: 50, printed: 32, status: 'PRINTING', requestedAt: '2026-07-09 08:00', completedAt: null },
    { id: 'lpj-003', template: 'Pallet Label (GS1)', mode: 'BULK', entityType: 'LOGISTIC_UNIT', printerType: 'ZEBRA', printer: 'Zebra ZT411 - DC', total: 24, printed: 0, status: 'QUEUED', requestedAt: '2026-07-09 09:15', scheduledAt: '2026-07-09 14:00' },
    { id: 'lpj-004', template: 'Location QR Label', mode: 'BULK', entityType: 'LOCATION', printerType: 'LASER', printer: 'HP LaserJet - Office', total: 120, printed: 120, status: 'COMPLETED', requestedAt: '2026-07-07 15:00', completedAt: '2026-07-07 16:20' },
    { id: 'lpj-005', template: 'Shipping Dispatch Label', mode: 'AUTO', entityType: 'INVOICE', printerType: 'NETWORK', printer: 'Network Printer - Dispatch', total: 12, printed: 8, status: 'PRINTING', requestedAt: '2026-07-09 11:00', completedAt: null },
    { id: 'lpj-006', template: 'Product Label (Standard)', mode: 'REPRINT', entityType: 'PRODUCT', printerType: 'THERMAL', printer: 'Zebra ZD420 - Plant 1', total: 100, printed: 0, status: 'QUEUED', requestedAt: '2026-07-09 12:00', scheduledAt: null },
  ]
  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', PRINTING: 'bg-blue-600 hover:bg-blue-600', QUEUED: 'bg-amber-500 hover:bg-amber-500', FAILED: 'bg-red-600 hover:bg-red-600', CANCELLED: 'bg-gray-500 hover:bg-gray-500' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Print Queue</h3>
        <p className="text-xs text-muted-foreground mt-1">5 print modes: Single, Bulk, Auto, Scheduled, Reprint. 5 printer types: Thermal, Laser, Inkjet, Bluetooth, Network. Real-time progress tracking.</p></div>
        <Button size="sm" onClick={() => toast({ title: 'Create Print Job — backend endpoint pending' })}><Plus className="mr-1 h-4 w-4" /> New Print Job</Button>
      </div>
      <div className="space-y-3">
        {jobs.map(j => {
          const progress = j.total > 0 ? Math.round((j.printed / j.total) * 100) : 0
          return (
            <div key={j.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">{j.template}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <Badge variant="outline" className="text-xs mr-1">{j.mode}</Badge>
                    <Badge variant="outline" className="text-xs mr-1">{j.entityType.replace(/_/g, ' ')}</Badge>
                    <Printer className="inline h-3 w-3 mr-1" />{j.printer}
                  </p>
                </div>
                <Badge className={statusColor[j.status] + ' text-xs'}>{j.status}</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                  <div className={cn('h-full', j.status === 'COMPLETED' ? 'bg-emerald-600' : j.status === 'PRINTING' ? 'bg-blue-600' : 'bg-amber-500')} style={{ width: `${progress}%` }} />
                </div>
                <span className="font-mono font-medium">{j.printed} / {j.total} ({progress}%)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Requested: {j.requestedAt}{j.completedAt && ` · Completed: ${j.completedAt}`}</p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function IDTraceabilityTab() {
  const [batchNumber, setBatchNumber] = useState('KK-2607-01')
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const mockChain = direction === 'forward'
    ? [
        { step: 1, stage: 'PRODUCTION_OUTPUT', entity: 'Batch KK-2607-01', detail: 'Kaju Katli 500g manufactured', qty: 500, date: '2026-07-01' },
        { step: 2, stage: 'WAREHOUSE_TRANSFER', entity: 'Mumbai Distribution Center', from: 'Mumbai Plant Warehouse', to: 'Mumbai DC', qty: 358, ref: 'TO-2026-0042', date: '2026-07-03' },
        { step: 3, stage: 'SALES_DISPATCH', entity: 'Tata Consumer Products', from: 'Mumbai DC', to: 'Tata', qty: 100, ref: 'INV-2026-00892', date: '2026-07-05' },
        { step: 4, stage: 'SALES_DISPATCH', entity: 'Reliance Retail (Andheri)', from: 'Mumbai DC', to: 'Reliance', qty: 48, ref: 'INV-2026-00915', date: '2026-07-06' },
        { step: 5, stage: 'SALES_DISPATCH', entity: 'Sudhamrit Retail Store 01', from: 'Mumbai DC', to: 'Store 01', qty: 24, ref: 'INV-2026-00921', date: '2026-07-06' },
      ]
    : [
        { step: 1, stage: 'CUSTOMER', entity: 'Customer Complaint / Recall', detail: 'Investigation triggered', date: '2026-07-08' },
        { step: 2, stage: 'BATCH', entity: 'Batch KK-2607-01', detail: 'Kaju Katli 500g (Quality: A)', qty: 142, status: 'RELEASED', date: '2026-07-01' },
        { step: 3, stage: 'PRODUCTION_ORDER', entity: 'MO-2026-0089', detail: 'Manufacturing order', date: '2026-07-01' },
        { step: 4, stage: 'RAW_MATERIAL', entity: 'CASHEW-KK-2606', detail: 'Cashew Nuts', supplier: 'Konkan Cashew Processors', invoice: 'PO-2026-0142', qty: 200, remaining: 35, quality: 'PASSED' },
        { step: 5, stage: 'RAW_MATERIAL', entity: 'SUGAR-SB-2606', detail: 'Sugar', supplier: 'Sri Balaji Sugar', invoice: 'PO-2026-0156', qty: 150, remaining: 28, quality: 'PASSED' },
        { step: 6, stage: 'RAW_MATERIAL', entity: 'GHEE-AM-2606', detail: 'Ghee', supplier: 'Amul', invoice: 'PO-2026-0178', qty: 50, remaining: 12, quality: 'PASSED' },
      ]

  async function trace() {
    setLoading(true)
    try {
      const token = localStorage.getItem('suop_access_token') || ''
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'}/api/v1/inventory/batches`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success) setResult(json.data)
      else setResult({ error: json.message })
    } catch {
      setResult({ chain: mockChain, direction, batch: { batchNumber, productName: 'Kaju Katli 500g', manufacturingDate: '2026-07-01', expiryDate: '2026-07-31', status: 'RELEASED', qualityGrade: 'A', quantityProduced: 500, quantityRemaining: 142 }, relatedLots: 3, relatedLogs: 8, note: 'Backend offline — showing simulated trace. Start backend: cd mini-services/suop-backend && bun run index.ts' })
    } finally { setLoading(false) }
  }

  const stageColor: Record<string, string> = {
    PRODUCTION_OUTPUT: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
    WAREHOUSE_TRANSFER: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
    SALES_DISPATCH: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30',
    CUSTOMER_DELIVERY: 'border-pink-500 bg-pink-50 dark:bg-pink-950/30',
    CUSTOMER: 'border-red-500 bg-red-50 dark:bg-red-950/30',
    BATCH: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30',
    PRODUCTION_ORDER: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30',
    RAW_MATERIAL: 'border-teal-500 bg-teal-50 dark:bg-teal-950/30',
    RECALL: 'border-red-700 bg-red-50 dark:bg-red-950/30',
    QUALITY_HOLD: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30',
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <Route className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Traceability Engine</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Forward: trace a batch downstream to all customers who received it. Backward: trace from customer complaint
              back to the raw material suppliers. Critical for food safety recalls.
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div><Label className="text-xs">Batch Number</Label>
            <Input value={batchNumber} onChange={e => setBatchNumber(e.target.value)} className="font-mono text-sm" placeholder="KK-2607-01" /></div>
          <div><Label className="text-xs">Direction</Label>
            <select value={direction} onChange={e => setDirection(e.target.value as 'forward' | 'backward')} className="w-full h-9 rounded-md border px-3 text-sm bg-background">
              <option value="forward">Forward (Batch → Customers)</option>
              <option value="backward">Backward (Customer → Supplier)</option>
            </select></div>
          <div className="flex items-end">
            <Button onClick={trace} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Tracing...</> : <><SearchIcon className="mr-2 h-4 w-4" />Trace</>}
            </Button>
          </div>
        </div>
      </Card>

      {result && !result.error && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold flex items-center gap-2">
                {direction === 'forward' ? <ArrowUpFromLine className="h-5 w-5 text-emerald-600" /> : <ArrowDownToLine className="h-5 w-5 text-blue-600" />}
                {direction === 'forward' ? 'Forward Traceability' : 'Backward Traceability'} — {result.batch?.batchNumber || batchNumber}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {result.batch?.productName || 'Kaju Katli 500g'} · Mfg: {result.batch?.manufacturingDate || '2026-07-01'} · Exp: {result.batch?.expiryDate || '2026-07-31'} · Quality: {result.batch?.qualityGrade || 'A'} · {result.relatedLots || 3} lots · {result.relatedLogs || 8} events
              </p>
            </div>
            <Badge className={result.batch?.status === 'RELEASED' ? 'bg-emerald-600 hover:bg-emerald-600' : result.batch?.status === 'BLOCKED' ? 'bg-red-600 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-500'}>{result.batch?.status || 'RELEASED'}</Badge>
          </div>
          {result.note && <p className="text-xs text-amber-600 italic mb-3">{result.note}</p>}
          <div className="space-y-3">
            {(result.chain || []).map((step: any, i: number) => (
              <div key={i} className={cn('border-l-4 rounded-r-lg p-3', stageColor[step.stage] || 'border-slate-400 bg-muted/40')}>
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-bold items-center justify-center flex-shrink-0">{step.step}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs font-mono">{step.stage.replace(/_/g, ' ')}</Badge>
                      <p className="font-medium text-sm">{step.entity}</p>
                    </div>
                    {step.detail && <p className="text-xs text-muted-foreground mt-1">{step.detail}</p>}
                    <div className="flex items-center gap-3 text-xs mt-1.5 flex-wrap">
                      {step.from && step.to && <span><span className="text-muted-foreground">From:</span> <span className="font-medium">{step.from}</span> → <span className="text-muted-foreground">To:</span> <span className="font-medium">{step.to}</span></span>}
                      {step.qty && <span><span className="text-muted-foreground">Qty:</span> <span className="font-mono font-medium">{step.qty}</span></span>}
                      {step.remaining !== undefined && <span><span className="text-muted-foreground">Remaining:</span> <span className="font-mono font-medium">{step.remaining}</span></span>}
                      {step.ref && <span><span className="text-muted-foreground">Ref:</span> <span className="font-mono font-medium">{step.ref}</span></span>}
                      {step.supplier && <span><span className="text-muted-foreground">Supplier:</span> <span className="font-medium">{step.supplier}</span></span>}
                      {step.invoice && <span><span className="text-muted-foreground">PO:</span> <span className="font-mono font-medium">{step.invoice}</span></span>}
                      {step.quality && <span><span className="text-muted-foreground">Quality:</span> <span className="font-semibold text-emerald-600">{step.quality}</span></span>}
                      {step.date && <span className="ml-auto text-muted-foreground">{step.date}</span>}
                    </div>
                    {step.notes && <p className="text-xs text-red-600 mt-1">⚠ {step.notes}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      {result?.error && <Card className="p-6 border-red-200"><p className="text-red-600 text-sm">{result.error}</p></Card>}
    </div>
  )
}

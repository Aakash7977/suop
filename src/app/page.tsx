'use client'

import { useState, useEffect } from 'react'
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
  DownloadCloud, UploadCloud, ShieldAlert, Gauge, ListChecks, Workflow,
  PackageOpen, ArrowLeftRight, BookOpen, Layers3, Activity as ActivityIcon,
  Truck, PackageCheck as PackageCheckIcon, FlaskConical, MapPin as MapPinIcon,
  Trash2, AlertTriangle as AlertTriangleIcon
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

// ═══════════════════════════════════════════════════════
// UNIFIED SUOP ADMIN — ALL SPRINTS IN ONE APPLICATION
// Sprints 1-7: Platform Foundation + Master Data + PIM
// ═══════════════════════════════════════════════════════

// ─── Types ──────────────────────────────────────────────
type ModuleKey =
  | 'dashboard' | 'organization' | 'rbac' | 'products' | 'pim' | 'commercial' | 'partners' | 'identification' | 'governance' | 'inventory' | 'goodsreceipt' | 'stockissue' | 'transfer' | 'adjustment' | 'reservation'
  | 'warehouse' | 'manufacturing' | 'quality'
  | 'procurement' | 'finance' | 'hr' | 'maintenance'
  | 'retail' | 'restaurant' | 'analytics' | 'ai' | 'settings'

// ─── Login Screen ───────────────────────────────────────
function LoginScreen({ onLogin, onDemo }: { onLogin: (e: string, p: string, r: boolean) => void; onDemo: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [rem, setRem] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl">S</div>
          <div>
            <h1 className="text-2xl font-bold text-white">SUOP Admin</h1>
            <p className="text-sm text-slate-400">Sudhastar Unified Operating Platform</p>
          </div>
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            <Shield className="mr-1 h-3 w-3" /> Enterprise Operating System
          </Badge>
        </div>
        <Card className="p-6 bg-slate-900/80 backdrop-blur border-slate-700">
          <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await onLogin(email, password, rem); setLoading(false) }} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input type="email" placeholder="admin@sudhastar.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input type={show ? 'text' : 'password'} placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 pr-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input id="rem" type="checkbox" checked={rem} onChange={(e) => setRem(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary" />
              <Label htmlFor="rem" className="text-sm text-slate-300 cursor-pointer">Remember me for 30 days</Label>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : <>Sign In<ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>
          <Separator className="bg-slate-700 mt-6" />
          <Button type="button" variant="outline" onClick={onDemo} className="w-full bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white">
            <Sparkles className="mr-2 h-4 w-4 text-amber-400" /> Explore Demo Mode (No Login Required)
          </Button>
          <p className="text-center text-xs text-slate-500 mt-4">Sprints 1-17 · Part 2 Complete + Part 3 Inventory Engine (Receipt, Issue, Transfer, Adjustment, Reservation)</p>
        </Card>
      </div>
    </div>
  )
}

// ─── Sidebar Navigation (ALL Modules) ───────────────────
const SIDEBAR_SECTIONS: Array<{ section: string; items: Array<{ name: string; icon: React.ReactNode; module: ModuleKey; available: boolean }> }> = [
  {
    section: 'Overview',
    items: [
      { name: 'Dashboard', icon: <BarChart3 className="h-4 w-4" />, module: 'dashboard', available: true },
    ]
  },
  {
    section: 'Master Data (Sprint 6-11) — PART 2 COMPLETE',
    items: [
      { name: 'Product Master', icon: <Package className="h-4 w-4" />, module: 'products', available: true },
      { name: 'PIM Platform', icon: <Layers className="h-4 w-4" />, module: 'pim', available: true },
      { name: 'Commercial Engine', icon: <IndianRupee className="h-4 w-4" />, module: 'commercial', available: true },
      { name: 'Business Partners', icon: <Users2 className="h-4 w-4" />, module: 'partners', available: true },
      { name: 'Identification & Traceability', icon: <ScanLine className="h-4 w-4" />, module: 'identification', available: true },
      { name: 'Data Governance', icon: <ShieldCheck className="h-4 w-4" />, module: 'governance', available: true },
    ]
  },
  {
    section: 'Platform (Sprint 1-5)',
    items: [
      { name: 'Organization', icon: <Network className="h-4 w-4" />, module: 'organization', available: true },
      { name: 'RBAC & Security', icon: <Shield className="h-4 w-4" />, module: 'rbac', available: true },
      { name: 'Settings', icon: <Settings className="h-4 w-4" />, module: 'settings', available: true },
    ]
  },
  {
    section: 'Operations (Sprint 12+) — PART 3',
    items: [
      { name: 'Inventory Engine', icon: <Boxes className="h-4 w-4" />, module: 'inventory', available: true },
      { name: 'Goods Receipt', icon: <Truck className="h-4 w-4" />, module: 'goodsreceipt', available: true },
      { name: 'Stock Issue', icon: <ArrowUpFromLine className="h-4 w-4" />, module: 'stockissue', available: true },
      { name: 'Stock Transfer', icon: <ArrowLeftRight className="h-4 w-4" />, module: 'transfer', available: true },
      { name: 'Adjustments', icon: <ShieldAlert className="h-4 w-4" />, module: 'adjustment', available: true },
      { name: 'Reservations', icon: <ShieldCheck className="h-4 w-4" />, module: 'reservation', available: true },
      { name: 'Warehouse', icon: <Warehouse className="h-4 w-4" />, module: 'warehouse', available: false },
      { name: 'Manufacturing', icon: <Factory className="h-4 w-4" />, module: 'manufacturing', available: false },
      { name: 'Quality', icon: <ShieldCheck className="h-4 w-4" />, module: 'quality', available: false },
    ]
  },
  {
    section: 'Business (Planned)',
    items: [
      { name: 'Procurement', icon: <Package className="h-4 w-4" />, module: 'procurement', available: false },
      { name: 'Finance', icon: <DollarSign className="h-4 w-4" />, module: 'finance', available: false },
      { name: 'Workforce', icon: <Users className="h-4 w-4" />, module: 'hr', available: false },
      { name: 'Maintenance', icon: <Wrench className="h-4 w-4" />, module: 'maintenance', available: false },
    ]
  },
  {
    section: 'Channels (Planned)',
    items: [
      { name: 'Retail POS', icon: <Store className="h-4 w-4" />, module: 'retail', available: false },
      { name: 'Restaurant POS', icon: <UtensilsCrossed className="h-4 w-4" />, module: 'restaurant', available: false },
    ]
  },
  {
    section: 'Intelligence (Planned)',
    items: [
      { name: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, module: 'analytics', available: false },
      { name: 'AI Copilot', icon: <Brain className="h-4 w-4" />, module: 'ai', available: false },
    ]
  },
]

// ─── Dashboard Module (Sprint 1 + All Stats) ────────────
function DashboardModule() {
  const sprintData = [
    { sprint: 'Sprint 1', name: 'Project Bootstrap', status: 'done', desc: 'Repository, Docker, Admin shell, Backend' },
    { sprint: 'Sprint 2', name: 'Core Infrastructure', status: 'done', desc: 'Config, Database, Redis, RabbitMQ, Logging, SDK, CI/CD' },
    { sprint: 'Sprint 3', name: 'Identity Platform', status: 'done', desc: 'Auth, JWT, Password, Sessions, Devices, Audit' },
    { sprint: 'Sprint 4', name: 'Organization Platform', status: 'done', desc: 'Enterprise, Company, BU, Branch, Plant, Warehouse, Dept' },
    { sprint: 'Sprint 5', name: 'Authorization Platform', status: 'done', desc: 'RBAC, Permissions, Feature Flags, Approval Matrix' },
    { sprint: 'Sprint 6', name: 'Product Foundation', status: 'done', desc: 'Products, Categories, Brands, UOMs, Variants, UPI' },
    { sprint: 'Sprint 7', name: 'PIM Platform', status: 'done', desc: 'Families, Collections, Compliance, Versioning, Approvals' },
    { sprint: 'Sprint 8', name: 'Commercial Engine', status: 'done', desc: 'Pricing, GST, Discounts, Promotions, Future Prices, Resolution' },
    { sprint: 'Sprint 9', name: 'Business Partner Platform', status: 'done', desc: 'Unified Customers, Suppliers, Transporters, Franchisees, Scorecards' },
    { sprint: 'Sprint 10', name: 'Identification & Traceability', status: 'done', desc: 'Barcodes, QR, Batches, Lots, Serials, GS1, Labels, Traceability Engine' },
    { sprint: 'Sprint 11', name: 'Data Governance & Quality', status: 'done', desc: 'Lifecycle, Approvals, Import/Export, Validation, Duplicates, Audit, Quality' },
    { sprint: 'Sprint 12', name: 'Inventory Foundation', status: 'done', desc: 'Universal Stock Ledger, Transactions, Journal, Availability Service' },
    { sprint: 'Sprint 13', name: 'Goods Receipt & Putaway', status: 'done', desc: 'GRN, Barcode Receiving, Batch Creation, Putaway Engine, Quality Hold' },
    { sprint: 'Sprint 14', name: 'Stock Issue & Outbound', status: 'done', desc: 'Material Issue, Picking, Consumption, Scrap, Damage, Outbound Dashboard' },
    { sprint: 'Sprint 15', name: 'Stock Transfer & Transit', status: 'done', desc: 'Warehouse/Branch/Bin Transfers, In-Transit Inventory, Receiving Verification' },
    { sprint: 'Sprint 16', name: 'Adjustment & Reconciliation', status: 'done', desc: 'Inventory Adjustments, Damage Reports, Expiry Disposal, Root Cause Analysis' },
    { sprint: 'Sprint 17', name: 'Reservation & Allocation', status: 'done', desc: 'Inventory Reservations, Allocation Rules, Availability Snapshots, Priority Matrix' },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Welcome to SUOP Admin</h2>
        <p className="text-slate-300 text-sm max-w-3xl">
          Sudhastar Unified Operating Platform — Enterprise Operating System for Food Manufacturing,
          Warehouse, Retail & Restaurant Operations. Currently in <span className="font-semibold text-white">Part 3: Enterprise Inventory Engine (Sprint 17 of 21)</span>.
        </p>
        <div className="flex items-center gap-6 mt-4">
          <div className="text-center"><p className="text-3xl font-bold">159</p><p className="text-xs text-slate-400">Database Tables</p></div>
          <Separator orientation="vertical" className="h-12 bg-slate-700" />
          <div className="text-center"><p className="text-3xl font-bold">821</p><p className="text-xs text-slate-400">Architecture Entities</p></div>
          <Separator orientation="vertical" className="h-12 bg-slate-700" />
          <div className="text-center"><p className="text-3xl font-bold">249</p><p className="text-xs text-slate-400">Arch. Decisions</p></div>
          <Separator orientation="vertical" className="h-12 bg-slate-700" />
          <div className="text-center"><p className="text-3xl font-bold text-blue-400">17</p><p className="text-xs text-slate-400">Sprints Done · Part 3</p></div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Products', value: 12, icon: <Package className="h-5 w-5 text-blue-600" />, module: 'products' as ModuleKey },
          { label: 'Roles', value: 15, icon: <Shield className="h-5 w-5 text-purple-600" />, module: 'rbac' as ModuleKey },
          { label: 'Branches', value: 8, icon: <MapPin className="h-5 w-5 text-emerald-600" />, module: 'organization' as ModuleKey },
          { label: 'Compliance', value: 6, icon: <ShieldCheck className="h-5 w-5 text-amber-600" />, module: 'pim' as ModuleKey },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Implementation Progress — All Sprints</h3>
        <div className="space-y-3">
          {sprintData.map(s => (
            <div key={s.sprint} className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <Badge variant="outline" className="font-mono text-xs flex-shrink-0">{s.sprint}</Badge>
              <span className="font-medium flex-shrink-0">{s.name}</span>
              <span className="text-muted-foreground text-xs flex-1 truncate hidden sm:inline">{s.desc}</span>
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs flex-shrink-0">Done</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Organization Module (Sprint 4) ─────────────────────
function OrganizationModule() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const tree = [
    { code: 'SUDHASTAR', name: 'Sudhastar Group', type: 'ENTERPRISE', level: 0, children: [
      { code: 'SFL', name: 'Sudhastar Foods Ltd.', type: 'COMPANY', level: 1, children: [
        { code: 'MFG-BU', name: 'Manufacturing BU', type: 'BU', level: 2, children: [
          { code: 'MUM-PLT', name: 'Mumbai Plant', type: 'BRANCH', level: 3 },
          { code: 'PUN-PLT', name: 'Pune Plant', type: 'BRANCH', level: 3 },
        ]},
        { code: 'RTL-BU', name: 'Retail BU', type: 'BU', level: 2, children: [
          { code: 'MUM-STR-01', name: 'Mumbai Store 01', type: 'BRANCH', level: 3 },
          { code: 'PUN-STR-01', name: 'Pune Store 01', type: 'BRANCH', level: 3 },
        ]},
        { code: 'RST-BU', name: 'Restaurant BU', type: 'BU', level: 2, children: [
          { code: 'MUM-RST-01', name: 'Mumbai Restaurant', type: 'BRANCH', level: 3 },
        ]},
      ]},
      { code: 'SLL', name: 'Sudhastar Logistics Ltd.', type: 'COMPANY', level: 1, children: [
        { code: 'DIST-BU', name: 'Distribution BU', type: 'BU', level: 2, children: [
          { code: 'MUM-DC', name: 'Mumbai DC', type: 'BRANCH', level: 3 },
        ]},
      ]},
    ]}
  ]

  const icons: Record<string, React.ReactNode> = {
    ENTERPRISE: <Network className="h-4 w-4 text-blue-600" />,
    COMPANY: <Building2 className="h-4 w-4 text-purple-600" />,
    BU: <Layers className="h-4 w-4 text-indigo-600" />,
    BRANCH: <MapPin className="h-4 w-4 text-emerald-600" />,
  }

  function TreeItem({ node, depth }: { node: any; depth: number }) {
    const [exp, setExp] = useState(depth < 2)
    const has = node.children && node.children.length > 0
    return (
      <div>
        <div className={cn('flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-muted/50', selectedNode === node.code && 'bg-primary/10')} style={{ paddingLeft: `${depth * 20 + 8}px` }} onClick={() => setSelectedNode(node.code)}>
          {has ? <button onClick={(e) => { e.stopPropagation(); setExp(!exp) }}>{exp ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}</button> : <div className="w-3" />}
          {icons[node.type] || <Package className="h-4 w-4" />}
          <span className="text-sm font-medium flex-1 truncate">{node.name}</span>
          <Badge variant="outline" className="text-xs font-mono">{node.code}</Badge>
        </div>
        {exp && has && node.children.map((c: any) => <TreeItem key={c.code} node={c} depth={depth + 1} />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Enterprise Organization Platform</h2>
        <p className="text-slate-300 text-sm">Complete organizational hierarchy: Enterprise → Company → BU → Branch → Plant → Warehouse. Every module references these entities.</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Enterprises', value: 1, icon: <Network className="h-5 w-5 text-blue-600" /> },
          { label: 'Companies', value: 2, icon: <Building2 className="h-5 w-5 text-purple-600" /> },
          { label: 'Branches', value: 8, icon: <MapPin className="h-5 w-5 text-emerald-600" /> },
          { label: 'Warehouses', value: 4, icon: <Warehouse className="h-5 w-5 text-amber-600" /> },
        ].map(s => <Card key={s.label} className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div><p className="text-2xl font-bold">{s.value}</p></Card>)}
      </div>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2"><Network className="h-5 w-5" /> Organization Tree</h3>
          <Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" />Add Entity</Button>
        </div>
        <ScrollArea className="h-[500px]">{tree.map(n => <TreeItem key={n.code} node={n} depth={0} />)}</ScrollArea>
      </Card>
    </div>
  )
}

// ─── RBAC Module (Sprint 5) ─────────────────────────────
function RBACModule() {
  const roles = [
    { code: 'SUPER_ADMIN', name: 'Super Administrator', category: 'EXECUTIVE', users: 1, perms: 250 },
    { code: 'FIN_MGR', name: 'Finance Manager', category: 'MANAGEMENT', users: 3, perms: 85 },
    { code: 'HR_MGR', name: 'HR Manager', category: 'MANAGEMENT', users: 2, perms: 75 },
    { code: 'WH_MGR', name: 'Warehouse Manager', category: 'MANAGER', users: 6, perms: 55 },
    { code: 'CASHIER', name: 'Cashier', category: 'OPERATOR', users: 25, perms: 15 },
    { code: 'AUDITOR', name: 'Auditor', category: 'CLERK', users: 2, perms: 30 },
  ]
  const flags = [
    { key: 'ai_copilot', name: 'AI Copilot', state: 'PILOT' },
    { key: 'offline_pos', name: 'Offline POS', state: 'ENABLED' },
    { key: 'digital_twin', name: 'Digital Twin', state: 'BETA' },
    { key: 'auto_reorder', name: 'Auto Reorder', state: 'GRADUAL_ROLLOUT' },
  ]
  const approvals = [
    { level: 1, role: 'Department Head', min: '₹0', max: '₹25,000' },
    { level: 2, role: 'Finance Manager', min: '₹25,000', max: '₹2,00,000' },
    { level: 3, role: 'Director', min: '₹2,00,000', max: '₹10,00,000' },
    { level: 4, role: 'CEO', min: '₹10,00,000', max: 'Unlimited' },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Authorization Platform (RBAC)</h2>
        <p className="text-slate-300 text-sm">Roles, Permissions, Feature Flags, Approval Authority, Security Policies</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Roles', value: 15, icon: <Shield className="h-5 w-5 text-blue-600" /> },
          { label: 'Permissions', value: 325, icon: <ShieldCheck className="h-5 w-5 text-emerald-600" /> },
          { label: 'Feature Flags', value: 8, icon: <Flag className="h-5 w-5 text-amber-600" /> },
          { label: 'Policies', value: 5, icon: <AlertTriangle className="h-5 w-5 text-red-600" /> },
        ].map(s => <Card key={s.label} className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div><p className="text-2xl font-bold">{s.value}</p></Card>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="h-5 w-5" /> Roles</h3>
          <div className="space-y-2">
            {roles.map(r => (
              <div key={r.code} className="flex items-center gap-3 p-2 rounded-lg border text-sm">
                <span className="font-mono text-xs text-muted-foreground w-24">{r.code}</span>
                <span className="font-medium flex-1">{r.name}</span>
                <Badge variant="outline" className="text-xs">{r.users} users</Badge>
                <Badge variant="outline" className="text-xs">{r.perms} perms</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Flag className="h-5 w-5" /> Feature Flags</h3>
          <div className="space-y-2">
            {flags.map(f => (
              <div key={f.key} className="flex items-center gap-3 p-2 rounded-lg border">
                <Switch checked={f.state === 'ENABLED' || f.state === 'BETA' || f.state === 'PILOT'} />
                <span className="text-sm font-medium flex-1">{f.name}</span>
                <Badge className={cn('text-xs', f.state === 'ENABLED' ? 'bg-emerald-600 text-white' : f.state === 'PILOT' ? 'bg-purple-600 text-white' : f.state === 'BETA' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white')}>{f.state}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Approval Authority Matrix</h3>
        <div className="grid grid-cols-4 gap-2 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
          <span>Level</span><span>Approver</span><span>Min</span><span>Max</span>
        </div>
        {approvals.map(a => (
          <div key={a.level} className="grid grid-cols-4 gap-2 px-4 py-3 border-t text-sm">
            <Badge variant="outline">Level {a.level}</Badge><span className="font-medium">{a.role}</span><span className="font-mono">{a.min}</span><span className="font-mono">{a.max}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ─── Product Master Module (Sprint 6) ───────────────────
function ProductMasterModule() {
  const products = [
    { upi: 'UPI-000001', code: 'KK-001', sku: 'KAJU-KATLI-250', name: 'Kaju Katli 250g', type: 'FINISHED_GOODS', status: 'ACTIVE', brand: 'Sudhamrit', mrp: 450, stock: 1250 },
    { upi: 'UPI-000002', code: 'KK-002', sku: 'KAJU-KATLI-500', name: 'Kaju Katli 500g', type: 'FINISHED_GOODS', status: 'ACTIVE', brand: 'Sudhamrit', mrp: 850, stock: 850 },
    { upi: 'UPI-000003', code: 'BP-001', sku: 'BADAM-PISTA-250', name: 'Badam Pista Roll 250g', type: 'FINISHED_GOODS', status: 'ACTIVE', brand: 'Sudhamrit', mrp: 520, stock: 650 },
    { upi: 'UPI-000004', code: 'CW-001', sku: 'CHOCO-WAFER-100', name: 'Chocolate Wafer 100g', type: 'FINISHED_GOODS', status: 'ACTIVE', brand: 'Shwet', mrp: 50, stock: 5200 },
    { upi: 'UPI-000005', code: 'RM-001', sku: 'SUGAR-RAW-50KG', name: 'Raw Sugar 50kg Bag', type: 'RAW_MATERIAL', status: 'ACTIVE', brand: 'Imported', mrp: 0, stock: 12500 },
    { upi: 'UPI-000006', code: 'PK-001', sku: 'BOX-250G-GIFT', name: 'Gift Box 250g', type: 'PACKAGING', status: 'ACTIVE', brand: 'Private Label', mrp: 0, stock: 15000 },
  ]
  const [search, setSearch] = useState('')

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.upi.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Product Master</h2>
            <p className="text-slate-300 text-sm">Single source of truth for every product with Universal Product Identity (UPI)</p>
          </div>
          <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white"><GitBranch className="mr-1 h-3 w-3" />UPI Active</Badge>
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Products', value: 12, icon: <Package className="h-5 w-5 text-blue-600" /> },
          { label: 'Active', value: 10, icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" /> },
          { label: 'Product Types', value: 11, icon: <Layers className="h-5 w-5 text-purple-600" /> },
          { label: 'With UPI', value: 12, icon: <GitBranch className="h-5 w-5 text-indigo-600" /> },
        ].map(s => <Card key={s.label} className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div><p className="text-2xl font-bold">{s.value}</p></Card>)}
      </div>
      <Card className="p-4">
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, SKU, code, or UPI..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Button variant="outline" size="sm"><Upload className="mr-1 h-3 w-3" />Import</Button>
          <Button variant="outline" size="sm"><Download className="mr-1 h-3 w-3" />Export</Button>
          <Button size="sm"><Plus className="mr-1 h-3 w-3" />New Product</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left px-4 py-3">UPI</th><th className="text-left px-4 py-3">Product</th><th className="text-left px-4 py-3">SKU</th>
                <th className="text-left px-4 py-3">Brand</th><th className="text-right px-4 py-3">MRP</th><th className="text-right px-4 py-3">Stock</th><th className="text-center px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.upi} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3"><Badge variant="outline" className="font-mono text-xs">{p.upi}</Badge></td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3 text-sm">{p.brand}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm">{p.mrp > 0 ? `₹${p.mrp}` : '—'}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm">{p.stock.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-center"><Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs">{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── PIM Module (Sprint 7) ──────────────────────────────
function PIMModule() {
  const families = [
    { code: 'INDIAN_SWEETS', name: 'Indian Sweets', products: 6 },
    { code: 'NAMKEEN', name: 'Namkeen', products: 4 },
    { code: 'BAKERY', name: 'Bakery', products: 8 },
    { code: 'BEVERAGES', name: 'Beverages', products: 3 },
  ]
  const compliance = [
    { product: 'Kaju Katli 250g', type: 'FSSAI', cert: 'FSS-12345678', status: 'APPROVED', expiry: '2027-03-15' },
    { product: 'Chocolate Wafer 100g', type: 'FSSAI', cert: 'FSS-12345681', status: 'PENDING', expiry: null },
    { product: 'Kaju Katli 250g', type: 'HACCP', cert: 'HACCP-2026-045', status: 'EXPIRED', expiry: '2026-03-01' },
  ]
  const approvals = [
    { req: 'PAR-2026-001', product: 'Kaju Katli 100g', stage: 'QA_REVIEW', status: 'IN_REVIEW' },
    { req: 'PAR-2026-002', product: 'Milk Burfi 250g', stage: 'COMPLIANCE_REVIEW', status: 'IN_REVIEW' },
    { req: 'PAR-2026-004', product: 'Kaju Katli 1kg', stage: 'PUBLISHED', status: 'PUBLISHED' },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-indigo-950 to-purple-900 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Enterprise PIM Platform</h2>
        <p className="text-indigo-300 text-sm">Product Information Management — Families, Collections, Compliance, Versioning, Approval Workflow, Usage Matrix</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Families', value: 6, icon: <FolderTree className="h-5 w-5 text-blue-600" /> },
          { label: 'Collections', value: 5, icon: <Archive className="h-5 w-5 text-purple-600" /> },
          { label: 'Pending Approvals', value: 2, icon: <ClipboardCheck className="h-5 w-5 text-amber-600" /> },
          { label: 'Compliance Records', value: 6, icon: <ShieldCheck className="h-5 w-5 text-emerald-600" /> },
        ].map(s => <Card key={s.label} className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div><p className="text-2xl font-bold">{s.value}</p></Card>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><FolderTree className="h-5 w-5" /> Product Families</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {families.map(f => <div key={f.code} className="flex items-center gap-2 p-2 rounded-lg border"><FolderTree className="h-4 w-4 text-blue-600" /><span className="text-sm font-medium flex-1">{f.name}</span><Badge variant="outline" className="text-xs">{f.products}</Badge></div>)}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Compliance</h3>
          <div className="space-y-2">
            {compliance.map((c, i) => <div key={i} className="flex items-center gap-2 p-2 rounded-lg border text-sm"><span className="flex-1 font-medium">{c.product}</span><Badge variant="outline" className="text-xs">{c.type}</Badge><Badge className={cn('text-xs', c.status === 'APPROVED' ? 'bg-emerald-600 text-white' : c.status === 'PENDING' ? 'bg-amber-500 text-white' : 'bg-red-600 text-white')}>{c.status}</Badge></div>)}
          </div>
        </Card>
      </div>
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ClipboardCheck className="h-5 w-5" /> Approval Queue</h3>
        <div className="space-y-2">
          {approvals.map(a => <div key={a.req} className="flex items-center gap-3 p-2 rounded-lg border text-sm"><Badge variant="outline" className="font-mono text-xs">{a.req}</Badge><span className="font-medium flex-1">{a.product}</span><Badge className={cn('text-xs', a.status === 'PUBLISHED' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white')}>{a.stage.replace(/_/g, ' ')}</Badge></div>)}
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><GitBranch className="h-5 w-5" /> Product Usage Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase">
              <th className="text-left px-4 py-3">Product</th><th className="text-center px-4 py-3">Mfg</th><th className="text-center px-4 py-3">Warehouse</th><th className="text-center px-4 py-3">Retail</th><th className="text-center px-4 py-3">Restaurant</th><th className="text-center px-4 py-3">E-com</th>
            </tr></thead>
            <tbody>
              {[
                { name: 'Kaju Katli 250g', mfg: true, wh: true, ret: true, rst: false, eco: true },
                { name: 'Sugar 50kg', mfg: true, wh: true, ret: false, rst: true, eco: false },
                { name: 'Gift Box', mfg: true, wh: true, ret: false, rst: false, eco: false },
              ].map(p => (
                <tr key={p.name} className="border-t">
                  <td className="px-4 py-3 font-medium text-sm">{p.name}</td>
                  <td className="px-4 py-3 text-center">{p.mfg ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 text-center">{p.wh ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 text-center">{p.ret ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 text-center">{p.rst ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 text-center">{p.eco ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Commercial Engine Module (Sprint 8) ────────────────
type CommercialTab = 'overview' | 'priceLists' | 'tax' | 'discounts' | 'promotions' | 'futurePrices' | 'approvals' | 'cost' | 'rules' | 'resolution'

function CommercialEngineModule() {
  const [tab, setTab] = useState<CommercialTab>('overview')
  const tabs: Array<{ key: CommercialTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'priceLists', label: 'Price Lists', icon: <Tag className="h-4 w-4" /> },
    { key: 'tax', label: 'GST & Tax', icon: <Percent className="h-4 w-4" /> },
    { key: 'discounts', label: 'Discounts', icon: <Calculator className="h-4 w-4" /> },
    { key: 'promotions', label: 'Promotions', icon: <Gift className="h-4 w-4" /> },
    { key: 'futurePrices', label: 'Future Prices', icon: <Clock className="h-4 w-4" /> },
    { key: 'approvals', label: 'Approvals', icon: <ClipboardCheck className="h-4 w-4" /> },
    { key: 'cost', label: 'Cost & Margin', icon: <TrendingUp className="h-4 w-4" /> },
    { key: 'rules', label: 'Commercial Rules', icon: <ShieldCheck className="h-4 w-4" /> },
    { key: 'resolution', label: 'Price Resolution', icon: <Sparkles className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-amber-950 via-orange-900 to-red-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <IndianRupee className="h-7 w-7" /> Enterprise Commercial Engine
            </h2>
            <p className="text-amber-200 text-sm max-w-3xl">
              Unified pricing, taxation, discount, promotion, and margin engine. Every channel
              (Retail POS, Restaurant POS, ERP, E-commerce) consumes the same pricing logic via the
              Price Resolution Service. No module calculates prices independently.
            </p>
          </div>
          <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500">Sprint 8</Badge>
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

      {tab === 'overview' && <CommercialOverviewTab />}
      {tab === 'priceLists' && <PriceListsTab />}
      {tab === 'tax' && <TaxTab />}
      {tab === 'discounts' && <DiscountsTab />}
      {tab === 'promotions' && <PromotionsTab />}
      {tab === 'futurePrices' && <FuturePricesTab />}
      {tab === 'approvals' && <ApprovalsTab />}
      {tab === 'cost' && <CostMarginTab />}
      {tab === 'rules' && <RulesTab />}
      {tab === 'resolution' && <ResolutionTab />}
    </div>
  )
}

function CommercialOverviewTab() {
  const stats = [
    { label: 'Price Lists', value: '6', sub: '5 Active', icon: <Tag className="h-5 w-5 text-blue-600" /> },
    { label: 'Tax Groups', value: '6', sub: 'GST 0/5/12/18/28 + Cess', icon: <Percent className="h-5 w-5 text-emerald-600" /> },
    { label: 'Discount Rules', value: '5', sub: '5 Active', icon: <Calculator className="h-5 w-5 text-purple-600" /> },
    { label: 'Promotions', value: '5', sub: '4 Active · 1 Scheduled', icon: <Gift className="h-5 w-5 text-pink-600" /> },
    { label: 'Future Prices', value: '4', sub: '2 Pending Approval', icon: <Clock className="h-5 w-5 text-amber-600" /> },
    { label: 'Pending Approvals', value: '3', sub: 'Avg SLA 7 days', icon: <ClipboardCheck className="h-5 w-5 text-red-600" /> },
    { label: 'Cost Profiles', value: '4', sub: 'All Tracked', icon: <TrendingUp className="h-5 w-5 text-indigo-600" /> },
    { label: 'Commercial Rules', value: '5', sub: 'Enforced', icon: <ShieldCheck className="h-5 w-5 text-teal-600" /> },
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
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><IndianRupee className="h-5 w-5" /> Price Resolution Flow</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// Every channel calls the same endpoint:</p>
          <p className="text-blue-600">POST /api/commercial/resolve-price</p>
          <div className="space-y-1 pt-2">
            <p><Badge variant="outline" className="font-mono">1</Badge> Base Price (from Price List, scoped by Company/Branch/Customer)</p>
            <p><Badge variant="outline" className="font-mono">2</Badge> Quantity Break (volume discount tier)</p>
            <p><Badge variant="outline" className="font-mono">3</Badge> Apply Discounts (stackable rules evaluated)</p>
            <p><Badge variant="outline" className="font-mono">4</Badge> Apply Promotions (channel-specific, priority sorted)</p>
            <p><Badge variant="outline" className="font-mono">5</Badge> Compute Taxable Amount = ListPrice − Discounts − Promotions</p>
            <p><Badge variant="outline" className="font-mono">6</Badge> Compute Tax (CGST + SGST intra-state, IGST inter-state)</p>
            <p><Badge variant="outline" className="font-mono">7</Badge> Final Price = Taxable + Tax</p>
          </div>
        </div>
        <div className="mt-4 grid sm:grid-cols-5 gap-2 text-center text-xs">
          {['Retail POS', 'Restaurant POS', 'ERP', 'E-commerce', 'Customer Portal'].map(ch => (
            <div key={ch} className="p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
              <p className="font-semibold text-amber-700 dark:text-amber-400">{ch}</p>
              <p className="text-muted-foreground mt-1">Consumes via API</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function PriceListsTab() {
  const lists = [
    { code: 'PL-RETAIL-MUM', name: 'Mumbai Retail Price List', type: 'RETAIL', currency: 'INR', validFrom: '2026-01-01', priority: 100, status: 'ACTIVE', taxMode: 'INCLUSIVE', items: 248 },
    { code: 'PL-WS-DIST', name: 'Wholesale Distributor Price List', type: 'WHOLESALE', currency: 'INR', validFrom: '2026-01-01', priority: 200, status: 'ACTIVE', taxMode: 'EXCLUSIVE', items: 180 },
    { code: 'PL-RST-MUM', name: 'Restaurant Menu Price List', type: 'RESTAURANT', currency: 'INR', validFrom: '2026-01-01', priority: 100, status: 'ACTIVE', taxMode: 'INCLUSIVE', items: 65 },
    { code: 'PL-CORP-TATA', name: 'Tata Corporate Contract', type: 'CORPORATE', currency: 'INR', validFrom: '2026-04-01', priority: 50, status: 'ACTIVE', taxMode: 'EXCLUSIVE', items: 92 },
    { code: 'PL-FEST-DIWALI', name: 'Diwali Festival Price List', type: 'FESTIVAL', currency: 'INR', validFrom: '2026-10-15', priority: 30, status: 'SCHEDULED', taxMode: 'INCLUSIVE', items: 45 },
    { code: 'PL-EXP-DUBAI', name: 'Dubai Export Price List', type: 'EXPORT', currency: 'USD', validFrom: '2026-01-01', priority: 150, status: 'ACTIVE', taxMode: 'EXCLUSIVE', items: 38 },
  ]
  const typeColor: Record<string, string> = {
    RETAIL: 'bg-blue-100 text-blue-800', WHOLESALE: 'bg-purple-100 text-purple-800',
    RESTAURANT: 'bg-orange-100 text-orange-800', CORPORATE: 'bg-emerald-100 text-emerald-800',
    FESTIVAL: 'bg-pink-100 text-pink-800', EXPORT: 'bg-amber-100 text-amber-800',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Price Lists</h3>
          <p className="text-xs text-muted-foreground mt-1">10 supported types: Retail, Wholesale, Distributor, Export, Restaurant, Online, Corporate, Employee, Festival, Special Contract</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Price List</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Code</th><th className="font-medium">Name</th><th className="font-medium">Type</th>
            <th className="font-medium">Currency</th><th className="font-medium">Tax Mode</th><th className="font-medium">Priority</th>
            <th className="font-medium">Items</th><th className="font-medium">Valid From</th><th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {lists.map(l => (
              <tr key={l.code} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{l.code}</td>
                <td className="font-medium">{l.name}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[l.type])}>{l.type}</span></td>
                <td className="font-mono">{l.currency}</td>
                <td><Badge variant="outline" className="text-xs">{l.taxMode}</Badge></td>
                <td className="font-mono">{l.priority}</td>
                <td>{l.items}</td>
                <td className="text-xs text-muted-foreground">{l.validFrom}</td>
                <td><Badge className={l.status === 'ACTIVE' ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-500'}>{l.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function TaxTab() {
  const groups = [
    { code: 'GST-0', name: 'GST Exempt (Fresh Foods)', type: 'EXEMPT', rates: [], status: 'ACTIVE' },
    { code: 'GST-5', name: 'GST 5% (Food Items)', type: 'GST', rates: [{ c: 'CGST', r: 2.5 }, { c: 'SGST', r: 2.5 }], status: 'ACTIVE' },
    { code: 'GST-12', name: 'GST 12% (Processed Foods)', type: 'GST', rates: [{ c: 'CGST', r: 6 }, { c: 'SGST', r: 6 }], status: 'ACTIVE' },
    { code: 'GST-18', name: 'GST 18% (Beverages)', type: 'GST', rates: [{ c: 'CGST', r: 9 }, { c: 'SGST', r: 9 }], status: 'ACTIVE' },
    { code: 'GST-28', name: 'GST 28% (Luxury/Sin)', type: 'GST', rates: [{ c: 'CGST', r: 14 }, { c: 'SGST', r: 14 }], status: 'ACTIVE' },
    { code: 'CESS-5', name: 'Cess 5% over GST', type: 'CESS', rates: [{ c: 'CESS', r: 5 }], status: 'ACTIVE' },
  ]
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div><h3 className="font-semibold">GST & Tax Engine</h3>
          <p className="text-xs text-muted-foreground mt-1">Supports GST (CGST/SGST/IGST), CESS, TCS, TDS (future). HSN/SAC mapped per product. Tax rules engine for state/type/category-based overrides.</p></div>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Tax Group</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {groups.map(g => (
            <div key={g.code} className="border rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{g.code}</p>
                  <p className="font-medium">{g.name}</p>
                </div>
                <Badge variant="outline" className="text-xs">{g.type}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {g.rates.length === 0 ? <Badge variant="outline" className="text-xs">EXEMPT (0%)</Badge> :
                  g.rates.map(r => <Badge key={r.c} variant="outline" className="text-xs font-mono">{r.c}: {r.r}%</Badge>)}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Tax Calculation Modes</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="border rounded-lg p-3"><p className="font-medium text-sm mb-1">Exclusive (Tax added on top)</p><p className="text-xs text-muted-foreground">Used for: Wholesale, Export, B2B. Price ₹100 + 5% GST = ₹105</p></div>
          <div className="border rounded-lg p-3"><p className="font-medium text-sm mb-1">Inclusive (Tax included in price)</p><p className="text-xs text-muted-foreground">Used for: Retail, Restaurant, E-commerce. MRP ₹105 includes ₹5 GST</p></div>
        </div>
      </Card>
    </div>
  )
}

function DiscountsTab() {
  const discounts = [
    { code: 'DISC-5PCT', name: '5% General Discount', type: 'PERCENTAGE', value: 5, kind: 'PERCENTAGE', max: 50, stackable: true, status: 'ACTIVE' },
    { code: 'DISC-FLAT-50', name: 'Flat ₹50 Off (above ₹500)', type: 'FLAT', value: 50, kind: 'AMOUNT', max: null, stackable: false, status: 'ACTIVE' },
    { code: 'DISC-VOL-10', name: 'Volume Discount 10% (10+ units)', type: 'VOLUME', value: 10, kind: 'PERCENTAGE', max: 200, stackable: false, status: 'ACTIVE' },
    { code: 'DISC-EMP-15', name: 'Employee Discount 15%', type: 'CUSTOMER', value: 15, kind: 'PERCENTAGE', max: null, stackable: false, status: 'ACTIVE' },
    { code: 'DISC-SENIOR', name: 'Senior Citizen 7%', type: 'CUSTOMER', value: 7, kind: 'PERCENTAGE', max: null, stackable: false, status: 'ACTIVE' },
  ]
  const typeColor: Record<string, string> = {
    PERCENTAGE: 'bg-blue-100 text-blue-800', FLAT: 'bg-purple-100 text-purple-800',
    VOLUME: 'bg-amber-100 text-amber-800', CUSTOMER: 'bg-emerald-100 text-emerald-800',
    COUPON: 'bg-pink-100 text-pink-800',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Discount Rules</h3>
        <p className="text-xs text-muted-foreground mt-1">9 supported types: Flat, Percentage, Buy X Get Y, Volume, Combo, Category, Brand, Customer, Coupon</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Discount</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Code</th><th className="font-medium">Name</th><th className="font-medium">Type</th>
            <th className="font-medium">Value</th><th className="font-medium">Max</th><th className="font-medium">Stackable</th><th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {discounts.map(d => (
              <tr key={d.code} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{d.code}</td>
                <td className="font-medium">{d.name}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[d.type])}>{d.type}</span></td>
                <td className="font-mono">{d.kind === 'PERCENTAGE' ? `${d.value}%` : `₹${d.value}`}</td>
                <td className="font-mono text-xs">{d.max !== null ? `₹${d.max}` : '—'}</td>
                <td>{d.stackable ? <Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs">Yes</Badge> : <Badge variant="outline" className="text-xs">No</Badge>}</td>
                <td><Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs">{d.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function PromotionsTab() {
  const promos = [
    { code: 'PROMO-DIWALI-2026', name: 'Diwali Dhamaka 15% Off', type: 'AUTOMATIC', offer: 'PERCENT_OFF', value: 15, channels: ['RETAIL_POS', 'ECOMMERCE'], validFrom: '2026-10-15', validTo: '2026-11-15', used: 234, max: 1000, priority: 50, status: 'SCHEDULED' },
    { code: 'PROMO-WEEKEND', name: 'Weekend Special 10%', type: 'AUTOMATIC', offer: 'PERCENT_OFF', value: 10, channels: ['RETAIL_POS'], validFrom: '2026-01-01', validTo: null, used: 1582, max: null, priority: 100, status: 'ACTIVE' },
    { code: 'PROMO-HAPPY-HRS', name: 'Happy Hours 20% (4-7PM)', type: 'AUTOMATIC', offer: 'PERCENT_OFF', value: 20, channels: ['RESTAURANT_POS'], validFrom: '2026-01-01', validTo: null, used: 765, max: null, priority: 80, status: 'ACTIVE' },
    { code: 'PROMO-BUY2GET1', name: 'Buy 2 Get 1 Free Sweets', type: 'AUTOMATIC', offer: 'BUY_X_GET_Y', value: null, channels: ['RETAIL_POS'], validFrom: '2026-01-01', validTo: null, used: 423, max: null, priority: 90, status: 'ACTIVE' },
    { code: 'PROMO-COUPON-WELCOME', name: 'Welcome Coupon ₹100 Off', type: 'COUPON', offer: 'FLAT_OFF', value: 100, channels: ['ALL'], validFrom: '2026-01-01', validTo: null, used: 891, max: 5000, priority: 70, status: 'ACTIVE' },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Promotions</h3>
        <p className="text-xs text-muted-foreground mt-1">4 supported types: Automatic, Manual, Coupon, Loyalty. Channel-scoped. Priority sorted. Conflict detection rules.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Promotion</Button>
      </div>
      <div className="space-y-3">
        {promos.map(p => (
          <div key={p.code} className="border rounded-lg p-3 hover:bg-muted/40">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono text-xs text-muted-foreground">{p.code}</p>
                  <Badge variant="outline" className="text-xs">{p.type}</Badge>
                  <Badge variant="outline" className="text-xs">{p.offer}</Badge>
                  {p.value !== null && <Badge variant="outline" className="text-xs font-mono">{p.offer === 'PERCENT_OFF' ? `${p.value}%` : `₹${p.value}`}</Badge>}
                </div>
                <p className="font-medium">{p.name}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  <span>Channels: {p.channels.join(', ')}</span>
                  <span>·</span><span>Valid: {p.validFrom} → {p.validTo || 'ongoing'}</span>
                  <span>·</span><span>Used: {p.used}{p.max ? ` / ${p.max}` : ''}</span>
                </div>
              </div>
              <Badge className={p.status === 'ACTIVE' ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-500'}>{p.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function FuturePricesTab() {
  const prices = [
    { product: 'Kaju Katli 500g', current: 540, future: 580, change: 7.41, effective: '2026-08-01', auto: true, status: 'PENDING_APPROVAL' },
    { product: 'Soan Cake 1kg', current: 880, future: 920, change: 4.55, effective: '2026-08-01', auto: true, status: 'APPROVED' },
    { product: 'Mixed Namkeen 200g', current: 85, future: 80, change: -5.88, effective: '2026-07-15', auto: true, status: 'SCHEDULED' },
    { product: 'Gulab Jamun 1kg', current: 420, future: 450, change: 7.14, effective: '2026-09-01', auto: true, status: 'PENDING_APPROVAL' },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Future Pricing</h3>
        <p className="text-xs text-muted-foreground mt-1">Scheduled price changes with automatic activation, expiry, rollback, and approval workflow.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Schedule Price Change</Button>
      </div>
      <div className="space-y-3">
        {prices.map(p => (
          <div key={p.product} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{p.product}</p>
              <Badge className={p.status === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-600' : p.status === 'SCHEDULED' ? 'bg-blue-600 hover:bg-blue-600' : 'bg-amber-500 hover:bg-amber-500'}>{p.status.replace('_', ' ')}</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-mono">₹{p.current}</span>
              <ArrowRightCircle className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono font-semibold">₹{p.future}</span>
              <Badge variant="outline" className={p.change > 0 ? 'text-red-600 border-red-200' : 'text-emerald-600 border-emerald-200'}>
                {p.change > 0 ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                {p.change > 0 ? '+' : ''}{p.change}%
              </Badge>
              <span className="text-xs text-muted-foreground ml-auto">Effective: {p.effective}</span>
              {p.auto && <Badge variant="outline" className="text-xs">Auto-activate</Badge>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ApprovalsTab() {
  const approvals = [
    { id: 'ap-001', type: 'PRICE_LIST', name: 'Diwali Festival Price List', stage: 'PRICING_TEAM', status: 'IN_REVIEW', sla: '2026-09-15', breached: false },
    { id: 'ap-002', type: 'FUTURE_PRICE', name: 'Kaju Katli Price Change +7.41%', stage: 'FINANCE', status: 'IN_REVIEW', sla: '2026-07-20', breached: false },
    { id: 'ap-003', type: 'PROMOTION', name: 'Diwali Dhamaka 15% Off', stage: 'MANAGEMENT', status: 'IN_REVIEW', sla: '2026-09-20', breached: false },
    { id: 'ap-004', type: 'FUTURE_PRICE', name: 'Gulab Jamun Price Change +7.14%', stage: 'DRAFT', status: 'PENDING', sla: '2026-07-25', breached: false },
    { id: 'ap-005', type: 'DISCOUNT_RULE', name: 'Senior Citizen 7% Discount', stage: 'APPROVED', status: 'APPROVED', sla: '2026-06-30', breached: false },
  ]
  const stages = ['DRAFT', 'PRICING_TEAM', 'FINANCE', 'MANAGEMENT', 'APPROVED', 'PUBLISHED']
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Price Approval Workflow</h3>
      <div className="mb-4 flex items-center gap-1 text-xs">
        {stages.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="px-2 py-1 rounded border bg-muted/40 font-mono">{s}</div>
            {i < stages.length - 1 && <ArrowRight className="h-3 w-3 mx-0.5 text-muted-foreground" />}
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {approvals.map(a => (
          <div key={a.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">{a.type}</Badge>
                <p className="font-medium text-sm">{a.name}</p>
              </div>
              <Badge className={a.status === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-600' : a.status === 'IN_REVIEW' ? 'bg-blue-600 hover:bg-blue-600' : 'bg-amber-500 hover:bg-amber-500'}>{a.status.replace('_', ' ')}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Current Stage: <span className="font-mono font-medium text-foreground">{a.stage}</span></span>
              <span>·</span>
              <span>SLA Due: {a.sla}</span>
              {a.breached && <Badge variant="destructive" className="text-xs">SLA BREACHED</Badge>}
              {a.status !== 'APPROVED' && a.status !== 'PUBLISHED' && (
                <Button size="sm" variant="outline" className="ml-auto h-7 text-xs">
                  <ArrowRightCircle className="mr-1 h-3 w-3" /> Advance Stage
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function CostMarginTab() {
  const profiles = [
    { product: 'Kaju Katli 500g', method: 'FIFO', purchase: 320, average: 325, fifo: 318, weighted: 327, standard: 330, last: 332, total: 350, margin: 54.29, selling: 540 },
    { product: 'Soan Cake 1kg', method: 'WEIGHTED_AVERAGE', purchase: 580, average: 585, fifo: 575, weighted: 588, standard: 590, last: 595, total: 625, margin: 28.64, selling: 880 },
    { product: 'Mixed Namkeen 200g', method: 'STANDARD', purchase: 48, average: 50, fifo: 47, weighted: 51, standard: 52, last: 49, total: 53, margin: 37.65, selling: 85 },
    { product: 'Gulab Jamun 1kg', method: 'LAST_PURCHASE', purchase: 280, average: 278, fifo: 275, weighted: 282, standard: 285, last: 290, total: 304, margin: 27.62, selling: 420 },
  ]
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-1">Cost & Margin Engine</h3>
      <p className="text-xs text-muted-foreground mb-4">4 costing methods: FIFO, Weighted Average, Standard, Last Purchase. Tracks landing cost, overhead, total cost, and computes margins in real-time.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Product</th><th className="font-medium">Method</th>
            <th className="font-medium text-right">Purchase</th><th className="font-medium text-right">Avg</th>
            <th className="font-medium text-right">FIFO</th><th className="font-medium text-right">Wtd Avg</th>
            <th className="font-medium text-right">Std</th><th className="font-medium text-right">Last</th>
            <th className="font-medium text-right">Total</th><th className="font-medium text-right">Selling</th>
            <th className="font-medium text-right">Margin%</th>
          </tr></thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.product} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-medium">{p.product}</td>
                <td><Badge variant="outline" className="text-xs font-mono">{p.method}</Badge></td>
                <td className="text-right font-mono">₹{p.purchase}</td>
                <td className="text-right font-mono text-xs">₹{p.average}</td>
                <td className="text-right font-mono text-xs">₹{p.fifo}</td>
                <td className="text-right font-mono text-xs">₹{p.weighted}</td>
                <td className="text-right font-mono text-xs">₹{p.standard}</td>
                <td className="text-right font-mono text-xs">₹{p.last}</td>
                <td className="text-right font-mono font-semibold">₹{p.total}</td>
                <td className="text-right font-mono">₹{p.selling}</td>
                <td className="text-right font-mono"><span className={p.margin > 30 ? 'text-emerald-600 font-semibold' : p.margin > 15 ? 'text-amber-600' : 'text-red-600 font-semibold'}>{p.margin}%</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function RulesTab() {
  const rules = [
    { code: 'MIN-SELL-PRICE', name: 'Minimum Selling Price (Below Cost)', type: 'MIN_SELLING_PRICE', enforcement: 'HARD_BLOCK', desc: 'Selling price cannot be below cost' },
    { code: 'MAX-DISC-30', name: 'Maximum Discount 30%', type: 'MAX_DISCOUNT', enforcement: 'OVERRIDE_WITH_REASON', desc: 'Discounts above 30% require justification reason' },
    { code: 'MIN-MARGIN-15', name: 'Minimum Margin 15%', type: 'MIN_MARGIN', enforcement: 'WARN', desc: 'Warns when margin falls below 15%' },
    { code: 'HOLIDAY-MKUP', name: 'Festival Holiday Markup 5%', type: 'HOLIDAY_PRICING', enforcement: 'HARD_BLOCK', desc: 'Auto-applies 5% markup on Diwali/Holi/Christmas' },
    { code: 'CONTRACT-TATA', name: 'Tata Corporate Contract Pricing', type: 'CONTRACT_PRICING', enforcement: 'HARD_BLOCK', desc: 'Forces Tata customer to use contract price list' },
  ]
  const enfColor: Record<string, string> = {
    HARD_BLOCK: 'bg-red-100 text-red-800', OVERRIDE_WITH_REASON: 'bg-amber-100 text-amber-800', WARN: 'bg-yellow-100 text-yellow-800',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Commercial Rules Engine</h3>
        <p className="text-xs text-muted-foreground mt-1">Enforcement rules: Minimum Selling Price, Maximum Discount, Minimum Margin, Customer Pricing, Location Pricing, Holiday Pricing, Contract Pricing. Future: AI Dynamic Pricing, Demand Pricing.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Rule</Button>
      </div>
      <div className="space-y-3">
        {rules.map(r => (
          <div key={r.code} className="border rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono text-xs text-muted-foreground">{r.code}</p>
                  <Badge variant="outline" className="text-xs">{r.type.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
              </div>
              <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', enfColor[r.enforcement])}>{r.enforcement.replace(/_/g, ' ')}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ResolutionTab() {
  const [productId, setProductId] = useState('prd-kaju-katli')
  const [quantity, setQuantity] = useState('1')
  const [channel, setChannel] = useState('RETAIL_POS')
  const [customerId, setCustomerId] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function resolve() {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3030/api/commercial/resolve-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId, productName: productId, customerId: customerId || undefined,
          channelId: channel, quantity: Number(quantity) || 1, basePrice: 540,
        }),
      })
      const json = await res.json()
      if (json.success) setResult(json.data)
      else setResult({ error: json.message })
    } catch (e) {
      // Backend may not be running; show demo result
      setResult({
        requestId: 'demo-' + Date.now(),
        basePrice: 540,
        listPrice: Number(quantity) >= 10 ? 513 : 540,
        appliedDiscounts: [{ code: 'DISC-5PCT', name: '5% General Discount', amount: Number(((Number(quantity) >= 10 ? 513 : 540) * 0.05).toFixed(2)) }],
        appliedPromotions: channel === 'RETAIL_POS' ? [{ code: 'PROMO-WEEKEND', name: 'Weekend Special 10%', amount: Number(((Number(quantity) >= 10 ? 513 : 540) * 0.10).toFixed(2)) }] : [],
        discountAmount: Number(((Number(quantity) >= 10 ? 513 : 540) * 0.05).toFixed(2)),
        promotionAmount: channel === 'RETAIL_POS' ? Number(((Number(quantity) >= 10 ? 513 : 540) * 0.10).toFixed(2)) : 0,
        taxableAmount: Number((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)).toFixed(2),
        taxComponents: [{ component: 'CGST', rate: 2.5, amount: Number((((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)) * 0.025).toFixed(2)) }, { component: 'SGST', rate: 2.5, amount: Number((((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)) * 0.025).toFixed(2)) }],
        taxAmount: Number((((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)) * 0.05).toFixed(2)),
        finalPrice: Number(((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)) * 1.05).toFixed(2),
        resolutionTrace: [
          { step: 'BASE_PRICE', source: 'PRICE_LIST', value: 540 },
          { step: 'LIST_PRICE', value: Number(quantity) >= 10 ? 513 : 540 },
          ...(Number(quantity) >= 10 ? [{ step: 'QUANTITY_BREAK', quantity: Number(quantity), discountPercent: 5, value: 513 }] : []),
          { step: 'DISCOUNTS_APPLIED', count: 1, totalAmount: Number(((Number(quantity) >= 10 ? 513 : 540) * 0.05).toFixed(2)) },
          { step: 'PROMOTIONS_APPLIED', count: channel === 'RETAIL_POS' ? 1 : 0, totalAmount: channel === 'RETAIL_POS' ? Number(((Number(quantity) >= 10 ? 513 : 540) * 0.10).toFixed(2)) : 0 },
          { step: 'TAXABLE_AMOUNT', value: Number((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)).toFixed(2) },
          { step: 'TAX_CALCULATED', mode: 'EXCLUSIVE', components: 2, totalAmount: Number((((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)) * 0.05).toFixed(2)) },
          { step: 'FINAL_PRICE', value: Number(((Number(quantity) >= 10 ? 513 : 540) - ((Number(quantity) >= 10 ? 513 : 540) * 0.05) - (channel === 'RETAIL_POS' ? ((Number(quantity) >= 10 ? 513 : 540) * 0.10) : 0)) * 1.05).toFixed(2) },
        ],
        responseTimeMs: 3,
        note: 'Backend offline — showing simulated resolution. Start backend: cd mini-services/suop-backend && bun run index.ts'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-start gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold">Price Resolution Service</h3>
            <p className="text-xs text-muted-foreground mt-1">
              The single source of truth for pricing. Your Retail POS and Restaurant POS will call this endpoint
              instead of maintaining their own pricing logic. Returns the final price with full audit trail.
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-4 gap-3 mb-4">
          <div><Label className="text-xs">Product ID</Label>
            <Input value={productId} onChange={e => setProductId(e.target.value)} className="font-mono text-sm" /></div>
          <div><Label className="text-xs">Quantity</Label>
            <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="text-sm" /></div>
          <div><Label className="text-xs">Channel</Label>
            <select value={channel} onChange={e => setChannel(e.target.value)} className="w-full h-9 rounded-md border px-3 text-sm bg-background">
              <option value="RETAIL_POS">Retail POS</option>
              <option value="RESTAURANT_POS">Restaurant POS</option>
              <option value="ERP">ERP</option>
              <option value="ECOMMERCE">E-commerce</option>
              <option value="CUSTOMER_PORTAL">Customer Portal</option>
            </select></div>
          <div><Label className="text-xs">Customer ID (optional)</Label>
            <Input value={customerId} onChange={e => setCustomerId(e.target.value)} placeholder="cust-tata-001" className="font-mono text-sm" /></div>
        </div>
        <Button onClick={resolve} disabled={loading} className="w-full">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resolving...</> : <><PlayCircle className="mr-2 h-4 w-4" />Resolve Price</>}
        </Button>
      </Card>

      {result && !result.error && (
        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-900">
            <div className="flex items-center justify-between mb-4">
              <div><p className="text-xs text-muted-foreground">Final Price</p>
              <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-400">₹{Number(result.finalPrice).toFixed(2)}</p></div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Request ID</p>
                <p className="font-mono text-xs">{result.requestId?.slice(0, 18)}...</p>
                <p className="text-xs text-muted-foreground mt-2">Response Time</p>
                <p className="font-mono text-xs">{result.responseTimeMs}ms</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-4 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Base Price</p><p className="font-mono font-semibold">₹{Number(result.basePrice).toFixed(2)}</p></div>
              <div><p className="text-xs text-muted-foreground">List Price</p><p className="font-mono font-semibold">₹{Number(result.listPrice).toFixed(2)}</p></div>
              <div><p className="text-xs text-muted-foreground">Discount</p><p className="font-mono text-red-600">−₹{Number(result.discountAmount).toFixed(2)}</p></div>
              <div><p className="text-xs text-muted-foreground">Promotion</p><p className="font-mono text-red-600">−₹{Number(result.promotionAmount).toFixed(2)}</p></div>
              <div><p className="text-xs text-muted-foreground">Taxable Amount</p><p className="font-mono font-semibold">₹{Number(result.taxableAmount).toFixed(2)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground">Tax Components</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {result.taxComponents?.map((tc: any, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs font-mono">{tc.component}: ₹{tc.amount} ({tc.rate}%)</Badge>
                  ))}
                </div>
              </div>
              <div><p className="text-xs text-muted-foreground">Tax Total</p><p className="font-mono text-blue-600">+₹{Number(result.taxAmount).toFixed(2)}</p></div>
            </div>
            {result.appliedDiscounts?.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-1">Applied Discounts:</p>
                {result.appliedDiscounts.map((d: any, i: number) => (
                  <Badge key={i} variant="outline" className="mr-1 text-xs">{d.code}: −₹{d.amount}</Badge>
                ))}
              </div>
            )}
            {result.appliedPromotions?.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Applied Promotions:</p>
                {result.appliedPromotions.map((p: any, i: number) => (
                  <Badge key={i} variant="outline" className="mr-1 text-xs bg-pink-50 dark:bg-pink-950/30">{p.code}: −₹{p.amount}</Badge>
                ))}
              </div>
            )}
            {result.note && <p className="mt-3 text-xs text-amber-600 italic">{result.note}</p>}
          </Card>

          {result.resolutionTrace && (
            <Card className="p-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2"><Activity className="h-4 w-4" /> Resolution Trace (Audit Trail)</h4>
              <div className="space-y-1.5 font-mono text-xs">
                {result.resolutionTrace.map((t: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/40">
                    <Badge variant="outline" className="text-xs">{i + 1}</Badge>
                    <span className="font-semibold text-blue-600">{t.step}</span>
                    {t.source && <span className="text-muted-foreground">← {t.source}</span>}
                    {t.value !== undefined && <span className="ml-auto">₹{Number(t.value).toFixed(2)}</span>}
                    {t.count !== undefined && <span className="ml-auto text-muted-foreground">{t.count} applied, total ₹{t.totalAmount?.toFixed(2)}</span>}
                    {t.discountPercent && <span className="ml-auto text-muted-foreground">−{t.discountPercent}%</span>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
      {result?.error && (
        <Card className="p-6 border-red-200"><p className="text-red-600 text-sm">{result.error}</p></Card>
      )}
    </div>
  )
}

// ─── Business Partner Module (Sprint 9) ─────────────────
type BPTab = 'overview' | 'partners' | 'addresses' | 'contacts' | 'financial' | 'compliance' | 'groups' | 'banking' | 'relationships' | 'scorecards'

function BusinessPartnerModule() {
  const [tab, setTab] = useState<BPTab>('overview')
  const tabs: Array<{ key: BPTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'partners', label: 'Partners', icon: <Users2 className="h-4 w-4" /> },
    { key: 'addresses', label: 'Addresses', icon: <MapPinned className="h-4 w-4" /> },
    { key: 'contacts', label: 'Contacts', icon: <Phone className="h-4 w-4" /> },
    { key: 'financial', label: 'Financial', icon: <CreditCard className="h-4 w-4" /> },
    { key: 'compliance', label: 'Compliance', icon: <ShieldCheck className="h-4 w-4" /> },
    { key: 'groups', label: 'Groups', icon: <FolderTree className="h-4 w-4" /> },
    { key: 'banking', label: 'Banking', icon: <IndianRupee className="h-4 w-4" /> },
    { key: 'relationships', label: 'Relationships', icon: <Handshake className="h-4 w-4" /> },
    { key: 'scorecards', label: 'Scorecards', icon: <Award className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-indigo-950 via-blue-900 to-cyan-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Users2 className="h-7 w-7" /> Enterprise Business Partner Platform
            </h2>
            <p className="text-blue-200 text-sm max-w-3xl">
              Unified master for Customers, Suppliers, Transporters, Franchisees, Corporate Clients,
              Delivery Partners, and Service Providers. One partner can play multiple roles — no duplication.
              Every module (Finance, Inventory, Sales, Purchase) references the same partner record.
            </p>
          </div>
          <Badge className="bg-blue-500 text-blue-950 hover:bg-blue-500">Sprint 9</Badge>
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

      {tab === 'overview' && <BPOverviewTab />}
      {tab === 'partners' && <BPPartnersTab />}
      {tab === 'addresses' && <BPAddressesTab />}
      {tab === 'contacts' && <BPContactsTab />}
      {tab === 'financial' && <BPFinancialTab />}
      {tab === 'compliance' && <BPComplianceTab />}
      {tab === 'groups' && <BPGroupsTab />}
      {tab === 'banking' && <BPBankingTab />}
      {tab === 'relationships' && <BPRelationshipsTab />}
      {tab === 'scorecards' && <BPScorecardsTab />}
    </div>
  )
}

function BPOverviewTab() {
  const stats = [
    { label: 'Total Partners', value: '10', sub: 'All Active', icon: <Users2 className="h-5 w-5 text-blue-600" /> },
    { label: 'Customer Groups', value: '5', sub: 'Retail, Wholesale, Corporate, VIP, Export', icon: <FolderTree className="h-5 w-5 text-emerald-600" /> },
    { label: 'Supplier Groups', value: '5', sub: 'Raw, Packaging, Transport, Maint, Utility', icon: <Package className="h-5 w-5 text-purple-600" /> },
    { label: 'Total Credit Exposure', value: '₹2.41Cr', sub: 'Across all partners', icon: <CreditCard className="h-5 w-5 text-amber-600" /> },
    { label: 'Scorecards', value: '6', sub: 'Q2 2026 graded', icon: <Award className="h-5 w-5 text-pink-600" /> },
    { label: 'Relationships', value: '5', sub: 'Parent/subsidiary/franchise', icon: <Handshake className="h-5 w-5 text-teal-600" /> },
    { label: 'Low Risk Partners', value: '7', sub: 'Risk score &lt; 25', icon: <ShieldCheck className="h-5 w-5 text-emerald-600" /> },
    { label: 'Medium Risk Partners', value: '3', sub: 'Risk 25-50', icon: <AlertIcon className="h-5 w-5 text-amber-600" /> },
  ]
  const roleBreakdown = [
    { role: 'CUSTOMER', count: 3, color: 'bg-blue-500' },
    { role: 'SUPPLIER', count: 4, color: 'bg-purple-500' },
    { role: 'DISTRIBUTOR', count: 2, color: 'bg-emerald-500' },
    { role: 'TRANSPORTER', count: 1, color: 'bg-amber-500' },
    { role: 'DELIVERY_PARTNER', count: 2, color: 'bg-pink-500' },
    { role: 'FRANCHISE', count: 1, color: 'bg-rose-500' },
    { role: 'CORPORATE', count: 3, color: 'bg-indigo-500' },
    { role: 'MANUFACTURER', count: 1, color: 'bg-cyan-500' },
    { role: 'RETAIL_OUTLET', count: 2, color: 'bg-teal-500' },
    { role: 'SERVICE_PROVIDER', count: 2, color: 'bg-violet-500' },
  ]
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1" dangerouslySetInnerHTML={{ __html: s.sub }} />
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Users2 className="h-5 w-5" /> Partner Role Breakdown</h3>
        <p className="text-xs text-muted-foreground mb-4">One partner can hold multiple roles. Total role assignments below.</p>
        <div className="space-y-2">
          {roleBreakdown.map(r => (
            <div key={r.role} className="flex items-center gap-3">
              <div className="w-40 text-sm font-medium">{r.role.replace(/_/g, ' ')}</div>
              <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                <div className={cn('h-full flex items-center justify-end pr-2 text-white text-xs font-medium', r.color)} style={{ width: `${(r.count / 4) * 100}%` }}>{r.count}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><Handshake className="h-5 w-5 text-blue-600" /> Why Single Business Partner Master?</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Modern enterprise ERPs (SAP, Oracle, Microsoft Dynamics) use a unified business partner master instead of
          separate Customer Master and Supplier Master. One organization can play multiple roles over time:
        </p>
        <div className="grid sm:grid-cols-2 gap-2 text-xs">
          {[
            'A supplier can later become a customer',
            'A customer can become a distributor',
            'A transporter can become a service provider',
            'A franchisee is also a retail outlet',
            'One PAN/GST record per organization',
            'Bank accounts reusable across roles',
            'Compliance certificates shared across roles',
            'Scorecards evaluate any role performance',
          ].map(benefit => (
            <div key={benefit} className="flex items-start gap-2">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function BPPartnersTab() {
  const partners = [
    { id: 'bp-001', code: 'CUST-TATA-001', name: 'Tata Consumer Products Ltd.', type: 'CORPORATE', roles: ['CUSTOMER', 'CORPORATE'], gst: '27AAACT2727Q1ZW', credit: 5000000, risk: 'LOW', riskScore: 12.5, status: 'ACTIVE' },
    { id: 'bp-002', code: 'SUP-CASHEW-01', name: 'Konkan Cashew Processors Pvt. Ltd.', type: 'COMPANY', roles: ['SUPPLIER', 'MANUFACTURER'], gst: '27AAGCK1234M1Z2', credit: 1000000, risk: 'LOW', riskScore: 18.0, status: 'ACTIVE' },
    { id: 'bp-003', code: 'SUP-SUGAR-AP', name: 'Sri Balaji Sugar Industries Ltd.', type: 'COMPANY', roles: ['SUPPLIER'], gst: '37AAECS7890P1Z5', credit: 2500000, risk: 'MEDIUM', riskScore: 35.0, status: 'ACTIVE' },
    { id: 'bp-004', code: 'TRANS-BLUE-01', name: 'Blue Dart Express Ltd.', type: 'COMPANY', roles: ['TRANSPORTER', 'DELIVERY_PARTNER'], gst: '27AAACB1234M1Z6', credit: 500000, risk: 'LOW', riskScore: 15.0, status: 'ACTIVE' },
    { id: 'bp-005', code: 'CUST-RELIANCE-01', name: 'Reliance Retail Ltd.', type: 'CORPORATE', roles: ['CUSTOMER', 'DISTRIBUTOR', 'RETAIL_OUTLET'], gst: '27AAACR5055K1ZA', credit: 8000000, risk: 'LOW', riskScore: 8.0, status: 'ACTIVE' },
    { id: 'bp-006', code: 'FRANCH-MUM-01', name: 'Sudhamrit Franchise - Andheri West', type: 'COMPANY', roles: ['FRANCHISE', 'RETAIL_OUTLET'], gst: '27AAGCS5678P1Z9', credit: 500000, risk: 'MEDIUM', riskScore: 28.0, status: 'ACTIVE' },
    { id: 'bp-007', code: 'SUP-GHEE-AMUL', name: 'Amul (GCMMF)', type: 'COMPANY', roles: ['SUPPLIER', 'DISTRIBUTOR'], gst: '24AAACG1234N1Z1', credit: 3000000, risk: 'LOW', riskScore: 10.0, status: 'ACTIVE' },
    { id: 'bp-008', code: 'CUST-BLR-TECH', name: 'Infosys Technologies Ltd.', type: 'CORPORATE', roles: ['CUSTOMER', 'CORPORATE', 'SERVICE_PROVIDER'], gst: '29AAACI4798L1ZB', credit: 2000000, risk: 'LOW', riskScore: 5.0, status: 'ACTIVE' },
    { id: 'bp-009', code: 'SUP-PKG-MUMBAI', name: 'Mumbai Packaging Solutions', type: 'COMPANY', roles: ['SUPPLIER'], gst: '27AAFCM9012P1Z3', credit: 800000, risk: 'MEDIUM', riskScore: 32.0, status: 'ACTIVE' },
    { id: 'bp-010', code: 'DELIV-ZOMATO-01', name: 'Zomato Limited', type: 'COMPANY', roles: ['DELIVERY_PARTNER', 'SERVICE_PROVIDER'], gst: '29AAACZ4567Q1Z8', credit: 300000, risk: 'LOW', riskScore: 20.0, status: 'ACTIVE' },
  ]
  const roleColor: Record<string, string> = {
    CUSTOMER: 'bg-blue-100 text-blue-800', SUPPLIER: 'bg-purple-100 text-purple-800',
    DISTRIBUTOR: 'bg-emerald-100 text-emerald-800', TRANSPORTER: 'bg-amber-100 text-amber-800',
    DELIVERY_PARTNER: 'bg-pink-100 text-pink-800', FRANCHISE: 'bg-rose-100 text-rose-800',
    CORPORATE: 'bg-indigo-100 text-indigo-800', MANUFACTURER: 'bg-cyan-100 text-cyan-800',
    RETAIL_OUTLET: 'bg-teal-100 text-teal-800', SERVICE_PROVIDER: 'bg-violet-100 text-violet-800',
  }
  const riskColor: Record<string, string> = {
    LOW: 'bg-emerald-100 text-emerald-800', MEDIUM: 'bg-amber-100 text-amber-800',
    HIGH: 'bg-orange-100 text-orange-800', CRITICAL: 'bg-red-100 text-red-800',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Business Partners</h3>
        <p className="text-xs text-muted-foreground mt-1">10 partners holding 21 role assignments. Filter by role or type. Duplicate GST/PAN auto-detected on create.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Partner</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Code</th><th className="font-medium">Legal Name</th>
            <th className="font-medium">Type</th><th className="font-medium">Roles</th>
            <th className="font-medium">GST</th><th className="font-medium text-right">Credit Limit</th>
            <th className="font-medium">Risk</th><th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {partners.map(p => (
              <tr key={p.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{p.code}</td>
                <td className="font-medium">{p.name}</td>
                <td><Badge variant="outline" className="text-xs">{p.type}</Badge></td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {p.roles.map(r => <span key={r} className={cn('inline-block px-1.5 py-0.5 rounded text-xs font-medium', roleColor[r])}>{r.replace(/_/g, ' ')}</span>)}
                  </div>
                </td>
                <td className="font-mono text-xs">{p.gst}</td>
                <td className="text-right font-mono">₹{p.credit.toLocaleString('en-IN')}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', riskColor[p.risk])}>{p.risk} ({p.riskScore})</span></td>
                <td><Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs">{p.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function BPAddressesTab() {
  const addresses = [
    { partner: 'Tata Consumer Products', type: 'REGISTERED_OFFICE', line1: 'Bombay House, Homi Mody Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', isDefault: true },
    { partner: 'Tata Consumer Products', type: 'BILLING', line1: 'Tower A, Tata Chambers', city: 'Mumbai', state: 'Maharashtra', pincode: '400020', isDefault: false },
    { partner: 'Tata Consumer Products', type: 'SHIPPING', line1: 'Plot 12, MIDC Industrial Area', city: 'Pune', state: 'Maharashtra', pincode: '411019', isDefault: false },
    { partner: 'Konkan Cashew Processors', type: 'FACTORY', line1: 'Survey 45, Ratnagiri Road', city: 'Ratnagiri', state: 'Maharashtra', pincode: '415612', isDefault: true },
    { partner: 'Konkan Cashew Processors', type: 'BILLING', line1: 'Shop 8, APMC Market', city: 'Vashi', state: 'Maharashtra', pincode: '400703', isDefault: false },
    { partner: 'Blue Dart Express', type: 'WAREHOUSE', line1: 'Hub 4, Sahara Logistics Park', city: 'Mumbai', state: 'Maharashtra', pincode: '400709', isDefault: true },
    { partner: 'Blue Dart Express', type: 'BRANCH', line1: 'Airport Road, Cargo Terminal', city: 'Bengaluru', state: 'Karnataka', pincode: '560017', isDefault: false },
    { partner: 'Sudhamrit Franchise - Andheri West', type: 'RETAIL_OUTLET', line1: 'Shop 12, Lokhandwala Complex', city: 'Mumbai', state: 'Maharashtra', pincode: '400053', isDefault: true },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Address Management</h3>
        <p className="text-xs text-muted-foreground mt-1">9 address types: Registered Office, Billing, Shipping, Factory, Warehouse, Branch, Restaurant, Pickup, Return. Reusable across modules.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Address</Button>
      </div>
      <div className="space-y-3">
        {addresses.map((a, i) => (
          <div key={i} className="border rounded-lg p-3 flex items-start gap-3">
            <MapPinned className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium">{a.partner}</p>
                <Badge variant="outline" className="text-xs">{a.type.replace(/_/g, ' ')}</Badge>
                {a.isDefault && <Badge className="bg-blue-600 hover:bg-blue-600 text-xs">Default</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{a.line1}, {a.city}, {a.state} — {a.pincode}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function BPContactsTab() {
  const contacts = [
    { partner: 'Tata Consumer Products', name: 'Rajesh Mehta', designation: 'Procurement Head', email: 'rajesh.mehta@tataconsumer.com', mobile: '+91 98200 12345', primary: true },
    { partner: 'Tata Consumer Products', name: 'Priya Sharma', designation: 'Accounts Manager', email: 'priya.sharma@tataconsumer.com', mobile: '+91 98200 67890', primary: false },
    { partner: 'Konkan Cashew Processors', name: 'Suresh Patil', designation: 'Director', email: 'suresh@konkancashew.in', mobile: '+91 94210 11111', primary: true },
    { partner: 'Blue Dart Express', name: 'Anil Kumar', designation: 'Key Account Manager', email: 'anil.kumar@bluedart.com', mobile: '+91 99300 22222', primary: true },
    { partner: 'Reliance Retail', name: 'Vikram Iyer', designation: 'Category Manager - Foods', email: 'vikram.iyer@ril.com', mobile: '+91 98200 33333', primary: true },
    { partner: 'Amul', name: 'Deepak Patel', designation: 'Sales Manager (Maharashtra)', email: 'deepak.patel@amul.coop', mobile: '+91 94260 44444', primary: true },
    { partner: 'Infosys', name: 'Lakshmi Nair', designation: 'Admin Head', email: 'lakshmi.nair@infosys.com', mobile: '+91 99860 55555', primary: true },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Contact Management</h3>
        <p className="text-xs text-muted-foreground mt-1">Per-partner contacts with designation, department, email, mobile, office phone, WhatsApp, and preferred contact channel.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Contact</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Partner</th><th className="font-medium">Name</th>
            <th className="font-medium">Designation</th><th className="font-medium">Email</th>
            <th className="font-medium">Mobile</th><th className="font-medium">Primary</th>
          </tr></thead>
          <tbody>
            {contacts.map((c, i) => (
              <tr key={i} className="border-b hover:bg-muted/40">
                <td className="py-2.5">{c.partner}</td>
                <td className="font-medium">{c.name}</td>
                <td className="text-xs">{c.designation}</td>
                <td className="text-xs"><a href={`mailto:${c.email}`} className="text-blue-600 hover:underline">{c.email}</a></td>
                <td className="font-mono text-xs">{c.mobile}</td>
                <td>{c.primary ? <Badge className="bg-blue-600 hover:bg-blue-600 text-xs">Yes</Badge> : <Badge variant="outline" className="text-xs">No</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function BPFinancialTab() {
  const profiles = [
    { partner: 'Tata Consumer Products', creditLimit: 5000000, outstanding: 1250000, available: 3750000, creditDays: 60, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_60', taxCategory: 'REGISTERED', risk: 'LOW' },
    { partner: 'Konkan Cashew Processors', creditLimit: 1000000, outstanding: 280000, available: 720000, creditDays: 30, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_30', taxCategory: 'REGISTERED', risk: 'LOW' },
    { partner: 'Sri Balaji Sugar', creditLimit: 2500000, outstanding: 1850000, available: 650000, creditDays: 45, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_45', taxCategory: 'REGISTERED', risk: 'MEDIUM' },
    { partner: 'Blue Dart Express', creditLimit: 500000, outstanding: 145000, available: 355000, creditDays: 30, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_30', taxCategory: 'REGISTERED', risk: 'LOW' },
    { partner: 'Reliance Retail', creditLimit: 8000000, outstanding: 4200000, available: 3800000, creditDays: 45, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_45', taxCategory: 'REGISTERED', risk: 'LOW' },
    { partner: 'Sudhamrit Andheri Franchise', creditLimit: 500000, outstanding: 85000, available: 415000, creditDays: 15, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_15', taxCategory: 'COMPOSITION', risk: 'MEDIUM' },
    { partner: 'Amul', creditLimit: 3000000, outstanding: 920000, available: 2080000, creditDays: 30, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_30', taxCategory: 'REGISTERED', risk: 'LOW' },
    { partner: 'Infosys', creditLimit: 2000000, outstanding: 540000, available: 1460000, creditDays: 30, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_30', taxCategory: 'REGISTERED', risk: 'LOW' },
    { partner: 'Mumbai Packaging', creditLimit: 800000, outstanding: 410000, available: 390000, creditDays: 30, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_30', taxCategory: 'REGISTERED', risk: 'MEDIUM' },
    { partner: 'Zomato', creditLimit: 300000, outstanding: 67000, available: 233000, creditDays: 15, currency: 'INR', paymentMode: 'CREDIT', paymentTerms: 'NET_15', taxCategory: 'REGISTERED', risk: 'LOW' },
  ]
  const riskColor: Record<string, string> = { LOW: 'text-emerald-600', MEDIUM: 'text-amber-600', HIGH: 'text-orange-600' }
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-1">Financial Profiles</h3>
      <p className="text-xs text-muted-foreground mb-4">Credit limits, outstanding balances, payment terms, tax category, and risk rating per partner. One profile per partner.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Partner</th>
            <th className="font-medium text-right">Credit Limit</th><th className="font-medium text-right">Outstanding</th>
            <th className="font-medium text-right">Available</th><th className="font-medium">Days</th>
            <th className="font-medium">Terms</th><th className="font-medium">Tax</th><th className="font-medium">Risk</th>
          </tr></thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.partner} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-medium">{p.partner}</td>
                <td className="text-right font-mono">₹{p.creditLimit.toLocaleString('en-IN')}</td>
                <td className="text-right font-mono text-red-600">₹{p.outstanding.toLocaleString('en-IN')}</td>
                <td className="text-right font-mono text-emerald-600">₹{p.available.toLocaleString('en-IN')}</td>
                <td className="text-center">{p.creditDays}</td>
                <td><Badge variant="outline" className="text-xs font-mono">{p.paymentTerms}</Badge></td>
                <td><Badge variant="outline" className="text-xs">{p.taxCategory}</Badge></td>
                <td className={cn('font-semibold', riskColor[p.risk])}>{p.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function BPComplianceTab() {
  const compliance = [
    { partner: 'Tata Consumer Products', type: 'GST', number: '27AAACT2727Q1ZW', authority: 'GSTN', issueDate: '2017-07-01', expiry: null, status: 'ACTIVE' },
    { partner: 'Tata Consumer Products', type: 'PAN', number: 'AAACT2727Q', authority: 'Income Tax Dept', issueDate: '1998-04-12', expiry: null, status: 'ACTIVE' },
    { partner: 'Konkan Cashew Processors', type: 'GST', number: '27AAGCK1234M1Z2', authority: 'GSTN', issueDate: '2017-07-01', expiry: null, status: 'ACTIVE' },
    { partner: 'Konkan Cashew Processors', type: 'FSSAI', number: '11522034000123', authority: 'FSSAI', issueDate: '2024-01-15', expiry: '2027-01-14', status: 'ACTIVE' },
    { partner: 'Konkan Cashew Processors', type: 'MSME', number: 'UDYAM-MH-12-0044521', authority: 'MSME Ministry', issueDate: '2020-08-10', expiry: null, status: 'ACTIVE' },
    { partner: 'Sri Balaji Sugar', type: 'GST', number: '37AAECS7890P1Z5', authority: 'GSTN', issueDate: '2017-07-01', expiry: null, status: 'ACTIVE' },
    { partner: 'Amul', type: 'FSSAI', number: '10322034000111', authority: 'FSSAI', issueDate: '2023-06-01', expiry: '2026-05-31', status: 'EXPIRED' },
    { partner: 'Amul', type: 'ISO', number: 'ISO 22000:2018', authority: 'ISO Cert Body', issueDate: '2023-09-01', expiry: '2026-08-31', status: 'ACTIVE' },
    { partner: 'Mumbai Packaging', type: 'MSME', number: 'UDYAM-MH-16-0099887', authority: 'MSME Ministry', issueDate: '2021-03-15', expiry: null, status: 'ACTIVE' },
  ]
  const statusColor: Record<string, string> = { ACTIVE: 'bg-emerald-600 hover:bg-emerald-600', EXPIRED: 'bg-red-600 hover:bg-red-600', PENDING_VERIFICATION: 'bg-amber-500 hover:bg-amber-500' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Compliance Management</h3>
        <p className="text-xs text-muted-foreground mt-1">8 compliance types: GST, PAN, MSME, FSSAI, IEC, ISO, Agreements, Insurance. Document uploads + verification workflow. Expiry alerts.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Compliance</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Partner</th><th className="font-medium">Type</th>
            <th className="font-medium">Certificate Number</th><th className="font-medium">Authority</th>
            <th className="font-medium">Issue</th><th className="font-medium">Expiry</th><th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {compliance.map((c, i) => (
              <tr key={i} className="border-b hover:bg-muted/40">
                <td className="py-2.5">{c.partner}</td>
                <td><Badge variant="outline" className="text-xs font-mono">{c.type}</Badge></td>
                <td className="font-mono text-xs">{c.number}</td>
                <td className="text-xs">{c.authority}</td>
                <td className="text-xs text-muted-foreground">{c.issueDate}</td>
                <td className="text-xs text-muted-foreground">{c.expiry || '—'}</td>
                <td><Badge className={statusColor[c.status] || 'bg-gray-600'}>{c.status.replace(/_/g, ' ')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function BPGroupsTab() {
  const groups = [
    { code: 'CG-RETAIL', name: 'Retail Customers', type: 'CUSTOMER', discount: 0, terms: 'CASH', members: 1245 },
    { code: 'CG-WHOLESALE', name: 'Wholesale Customers', type: 'CUSTOMER', discount: 5, terms: 'NET_30', members: 89 },
    { code: 'CG-CORPORATE', name: 'Corporate Customers', type: 'CUSTOMER', discount: 8, terms: 'NET_45', members: 32 },
    { code: 'CG-VIP', name: 'VIP Customers', type: 'CUSTOMER', discount: 12, terms: 'NET_30', members: 18 },
    { code: 'CG-EXPORT', name: 'Export Customers', type: 'CUSTOMER', discount: 0, terms: 'ADVANCE', members: 7 },
    { code: 'SG-RAW-MATERIAL', name: 'Raw Material Suppliers', type: 'SUPPLIER', discount: null, terms: 'NET_30', members: 24 },
    { code: 'SG-PACKAGING', name: 'Packaging Suppliers', type: 'SUPPLIER', discount: null, terms: 'NET_30', members: 12 },
    { code: 'SG-TRANSPORT', name: 'Transport Services', type: 'SUPPLIER', discount: null, terms: 'NET_15', members: 8 },
    { code: 'SG-MAINTENANCE', name: 'Maintenance Services', type: 'SUPPLIER', discount: null, terms: 'NET_30', members: 6 },
    { code: 'SG-UTILITY', name: 'Utility Providers', type: 'SUPPLIER', discount: null, terms: 'NET_30', members: 4 },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Customer & Supplier Groups</h3>
        <p className="text-xs text-muted-foreground mt-1">Classification for pricing tiers, payment terms defaults, and reporting. Plus flexible partner tags for ad-hoc labeling.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Group</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {groups.map(g => (
          <div key={g.code} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{g.code}</p>
                <p className="font-medium">{g.name}</p>
              </div>
              <Badge className={g.type === 'CUSTOMER' ? 'bg-blue-600 hover:bg-blue-600' : 'bg-purple-600 hover:bg-purple-600'}>{g.type}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {g.discount !== null && <span>Discount: <span className="font-mono font-medium text-foreground">{g.discount}%</span></span>}
              <span>Terms: <span className="font-mono font-medium text-foreground">{g.terms}</span></span>
              <span>·</span>
              <span><span className="font-mono font-medium text-foreground">{g.members.toLocaleString('en-IN')}</span> members</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function BPBankingTab() {
  const accounts = [
    { partner: 'Tata Consumer Products', accountName: 'Tata Consumer Products Ltd', accountNumber: '**** **** **** 4521', bank: 'HDFC Bank', branch: 'Fort, Mumbai', ifsc: 'HDFC0000001', type: 'CURRENT', isDefault: true, verified: true },
    { partner: 'Tata Consumer Products', accountName: 'Tata Consumer Products Ltd', accountNumber: '**** **** **** 7821', bank: 'State Bank of India', branch: 'Nariman Point', ifsc: 'SBIN0000001', type: 'CURRENT', isDefault: false, verified: true },
    { partner: 'Konkan Cashew Processors', accountName: 'Konkan Cashew Processors Pvt Ltd', accountNumber: '**** **** **** 1192', bank: 'Bank of Maharashtra', branch: 'Ratnagiri', ifsc: 'MAHB0000001', type: 'CURRENT', isDefault: true, verified: true },
    { partner: 'Blue Dart Express', accountName: 'Blue Dart Express Ltd', accountNumber: '**** **** **** 3344', bank: 'ICICI Bank', branch: 'Andheri East', ifsc: 'ICIC0000001', type: 'CURRENT', isDefault: true, verified: true },
    { partner: 'Blue Dart Express', accountName: 'Blue Dart Express Ltd', accountNumber: '**** **** **** 9912', bank: 'Axis Bank', branch: 'Bengaluru MG Road', ifsc: 'UTIB0000001', type: 'CURRENT', isDefault: false, verified: true },
    { partner: 'Reliance Retail', accountName: 'Reliance Retail Ltd', accountNumber: '**** **** **** 5567', bank: 'HDFC Bank', branch: 'Bandra Kurla Complex', ifsc: 'HDFC0000123', type: 'CURRENT', isDefault: true, verified: true },
    { partner: 'Amul', accountName: 'GCMMF Ltd', accountNumber: '**** **** **** 2298', bank: 'Bank of Baroda', branch: 'Anand', ifsc: 'BARB0000001', type: 'CURRENT', isDefault: true, verified: true },
    { partner: 'Infosys', accountName: 'Infosys Ltd', accountNumber: '**** **** **** 8890', bank: 'HDFC Bank', branch: 'Electronics City', ifsc: 'HDFC0000456', type: 'CURRENT', isDefault: true, verified: true },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Bank Accounts</h3>
        <p className="text-xs text-muted-foreground mt-1">Per-partner bank accounts with IFSC, SWIFT (for export), UPI ID. Account numbers masked in UI (encrypted at rest). Verification workflow for each account.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add Bank Account</Button>
      </div>
      <div className="space-y-3">
        {accounts.map((a, i) => (
          <div key={i} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-muted-foreground">{a.partner}</p>
                <p className="font-medium">{a.accountName}</p>
              </div>
              <div className="flex items-center gap-1">
                {a.isDefault && <Badge className="bg-blue-600 hover:bg-blue-600 text-xs">Default</Badge>}
                {a.verified ? <Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs"><CheckCircle2 className="mr-1 h-3 w-3" />Verified</Badge> : <Badge variant="outline" className="text-xs">Pending</Badge>}
              </div>
            </div>
            <div className="grid sm:grid-cols-4 gap-2 text-xs">
              <div><p className="text-muted-foreground">Account No</p><p className="font-mono">{a.accountNumber}</p></div>
              <div><p className="text-muted-foreground">Bank</p><p>{a.bank}, {a.branch}</p></div>
              <div><p className="text-muted-foreground">IFSC</p><p className="font-mono">{a.ifsc}</p></div>
              <div><p className="text-muted-foreground">Type</p><Badge variant="outline" className="text-xs">{a.type}</Badge></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function BPRelationshipsTab() {
  const relationships = [
    { from: 'Tata Consumer Products', to: 'Sudhamrit Foods Ltd.', type: 'CUSTOMER_OF', validFrom: '2026-01-15', status: 'ACTIVE' },
    { from: 'Reliance Retail', to: 'Reliance Industries Ltd.', type: 'SUBSIDIARY', validFrom: '2026-01-12', status: 'ACTIVE' },
    { from: 'Konkan Cashew Processors', to: 'Sudhamrit Foods Ltd.', type: 'PREFERRED_SUPPLIER', validFrom: '2026-01-20', status: 'ACTIVE' },
    { from: 'Amul', to: 'Sudhamrit Foods Ltd.', type: 'STRATEGIC_PARTNER', validFrom: '2026-01-18', status: 'ACTIVE' },
    { from: 'Sudhamrit Franchise - Andheri West', to: 'Sudhamrit Foods Ltd.', type: 'FRANCHISE', validFrom: '2026-03-05', status: 'ACTIVE' },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Business Partner Relationships</h3>
        <p className="text-xs text-muted-foreground mt-1">Track parent/subsidiary, distributor/dealer, franchise, preferred supplier, strategic partner, sister concern, JV partner relationships between partners.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Relationship</Button>
      </div>
      <div className="space-y-3">
        {relationships.map((r, i) => (
          <div key={i} className="border rounded-lg p-3 flex items-center gap-3">
            <Handshake className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">{r.from}</p>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <p className="font-medium text-sm">{r.to}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">{r.type.replace(/_/g, ' ')}</Badge>
                <span>Valid from: {r.validFrom}</span>
              </div>
            </div>
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs">{r.status}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}

function BPScorecardsTab() {
  const scorecards = [
    { partner: 'Amul', period: 'Q2 2026', onTime: 97.8, accuracy: 99.5, quality: 98.5, complaints: 0.5, payment: 96.0, response: 95.0, overall: 97.8, grade: 'A+', orders: 218, value: 8450000 },
    { partner: 'Tata Consumer Products', period: 'Q2 2026', onTime: null, accuracy: null, quality: 95.0, complaints: 0.8, payment: 99.0, response: null, overall: 96.2, grade: 'A+', orders: 32, value: 12500000 },
    { partner: 'Konkan Cashew Processors', period: 'Q2 2026', onTime: 94.5, accuracy: 98.2, quality: 96.0, complaints: 1.2, payment: 92.0, response: 88.0, overall: 93.5, grade: 'A', orders: 142, value: 3845000 },
    { partner: 'Blue Dart Express', period: 'Q2 2026', onTime: 91.2, accuracy: 96.8, quality: 92.0, complaints: 2.8, payment: 88.0, response: 90.5, overall: 91.6, grade: 'A', orders: 485, value: 1240000 },
    { partner: 'Sri Balaji Sugar', period: 'Q2 2026', onTime: 82.0, accuracy: 88.5, quality: 90.0, complaints: 3.5, payment: 85.0, response: 78.0, overall: 83.5, grade: 'B', orders: 56, value: 2890000 },
    { partner: 'Mumbai Packaging Solutions', period: 'Q2 2026', onTime: 75.5, accuracy: 82.0, quality: 85.0, complaints: 5.2, payment: 78.0, response: 72.0, overall: 78.5, grade: 'C', orders: 38, value: 580000 },
  ]
  const gradeColor: Record<string, string> = { 'A+': 'bg-emerald-600 text-white', 'A': 'bg-emerald-500 text-white', 'B': 'bg-amber-500 text-white', 'C': 'bg-orange-500 text-white', 'D': 'bg-red-600 text-white' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Partner Scorecards</h3>
        <p className="text-xs text-muted-foreground mt-1">Quarterly evaluations: on-time delivery, order accuracy, quality, complaints, payment history, response time. Composite overall score + letter grade. Future: AI risk prediction, customer lifetime value.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Scorecard</Button>
      </div>
      <div className="space-y-3">
        {scorecards.map(s => (
          <div key={s.partner} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium">{s.partner}</p>
                <p className="text-xs text-muted-foreground">{s.period} · {s.orders} orders · ₹{s.value.toLocaleString('en-IN')} business value</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-2xl font-bold">{s.overall}</p>
                  <p className="text-xs text-muted-foreground">Overall Score</p>
                </div>
                <span className={cn('inline-flex items-center justify-center h-10 w-10 rounded-full font-bold text-sm', gradeColor[s.grade])}>{s.grade}</span>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2 text-xs">
              <div className="text-center p-2 rounded bg-muted/40"><p className="text-muted-foreground">On-Time</p><p className="font-mono font-semibold">{s.onTime !== null ? `${s.onTime}%` : '—'}</p></div>
              <div className="text-center p-2 rounded bg-muted/40"><p className="text-muted-foreground">Accuracy</p><p className="font-mono font-semibold">{s.accuracy !== null ? `${s.accuracy}%` : '—'}</p></div>
              <div className="text-center p-2 rounded bg-muted/40"><p className="text-muted-foreground">Quality</p><p className="font-mono font-semibold">{s.quality}%</p></div>
              <div className="text-center p-2 rounded bg-muted/40"><p className="text-muted-foreground">Complaints</p><p className="font-mono font-semibold">{s.complaints}%</p></div>
              <div className="text-center p-2 rounded bg-muted/40"><p className="text-muted-foreground">Payment</p><p className="font-mono font-semibold">{s.payment}%</p></div>
              <div className="text-center p-2 rounded bg-muted/40"><p className="text-muted-foreground">Response</p><p className="font-mono font-semibold">{s.response !== null ? `${s.response}%` : '—'}</p></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Identification & Traceability Module (Sprint 10) ────
type IDTab = 'overview' | 'barcodes' | 'qrcodes' | 'batches' | 'lots' | 'serials' | 'gs1' | 'labels' | 'print' | 'traceability'

function IdentificationModule() {
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
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Generate Barcode</Button>
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
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Generate QR</Button>
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
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Batch</Button>
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
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Lot</Button>
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
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Assign Serial</Button>
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
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New GS1 ID</Button>
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
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Template</Button>
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
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Print Job</Button>
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
      const res = await fetch('http://localhost:3030/api/identification/trace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchNumber, direction }),
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

// ─── Data Governance Module (Sprint 11) ─────────────────
type GovTab = 'overview' | 'lifecycle' | 'approvals' | 'import' | 'export' | 'validation' | 'duplicates' | 'audit' | 'quality' | 'history'

function GovernanceModule() {
  const [tab, setTab] = useState<GovTab>('overview')
  const tabs: Array<{ key: GovTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'lifecycle', label: 'Lifecycle', icon: <Workflow className="h-4 w-4" /> },
    { key: 'approvals', label: 'Approvals', icon: <ClipboardList className="h-4 w-4" /> },
    { key: 'import', label: 'Import', icon: <UploadCloud className="h-4 w-4" /> },
    { key: 'export', label: 'Export', icon: <DownloadCloud className="h-4 w-4" /> },
    { key: 'validation', label: 'Validation', icon: <ListChecks className="h-4 w-4" /> },
    { key: 'duplicates', label: 'Duplicates', icon: <GitMerge className="h-4 w-4" /> },
    { key: 'audit', label: 'Audit Trail', icon: <HistoryIcon className="h-4 w-4" /> },
    { key: 'quality', label: 'Quality', icon: <ShieldAlert className="h-4 w-4" /> },
    { key: 'history', label: 'Change History', icon: <History className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-violet-950 via-purple-900 to-fuchsia-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ShieldCheck className="h-7 w-7" /> Data Governance & Master Data Quality
            </h2>
            <p className="text-violet-200 text-sm max-w-3xl">
              Enterprise-grade governance: product lifecycle enforcement, multi-level approval workflows,
              bulk import/export with rollback, validation framework, duplicate detection & merge,
              complete audit trail, and real-time data quality scoring.
            </p>
          </div>
          <Badge className="bg-violet-500 text-violet-950 hover:bg-violet-500">Sprint 11 · Part 2 ✓</Badge>
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

      {tab === 'overview' && <GovOverviewTab />}
      {tab === 'lifecycle' && <GovLifecycleTab />}
      {tab === 'approvals' && <GovApprovalsTab />}
      {tab === 'import' && <GovImportTab />}
      {tab === 'export' && <GovExportTab />}
      {tab === 'validation' && <GovValidationTab />}
      {tab === 'duplicates' && <GovDuplicatesTab />}
      {tab === 'audit' && <GovAuditTab />}
      {tab === 'quality' && <GovQualityTab />}
      {tab === 'history' && <GovHistoryTab />}
    </div>
  )
}

function GovOverviewTab() {
  const stats = [
    { label: 'Active Products', value: '2', sub: 'In ACTIVE lifecycle state', icon: <Package className="h-5 w-5 text-emerald-600" /> },
    { label: 'Pending Approvals', value: '2', sub: '1 IN_REVIEW · 1 PENDING', icon: <ClipboardList className="h-5 w-5 text-amber-600" /> },
    { label: 'SLA Breached', value: '1', sub: 'Old Laddu (rejected)', icon: <AlertOctagon className="h-5 w-5 text-red-600" /> },
    { label: 'Import Jobs', value: '5', sub: '2 COMPLETED · 1 ROLLBACK', icon: <UploadCloud className="h-5 w-5 text-blue-600" /> },
    { label: 'Export Jobs', value: '4', sub: '3 COMPLETED · 1 EXPORTING', icon: <DownloadCloud className="h-5 w-5 text-purple-600" /> },
    { label: 'Validation Rules', value: '10', sub: 'All ACTIVE', icon: <ListChecks className="h-5 w-5 text-teal-600" /> },
    { label: 'Pending Duplicates', value: '2', sub: 'Need resolution', icon: <GitMerge className="h-5 w-5 text-pink-600" /> },
    { label: 'Audit Entries', value: '8', sub: 'Full trail', icon: <HistoryIcon className="h-5 w-5 text-indigo-600" /> },
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
      <Card className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-900">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2"><Gauge className="h-5 w-5 text-emerald-600" /> Overall Data Quality Score</h3>
            <p className="text-xs text-muted-foreground mt-1">Aggregated across 9 product metrics + 3 business partner metrics</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-emerald-600">91.6</p>
            <Badge className="bg-emerald-600 hover:bg-emerald-600 mt-1">Grade A</Badge>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-background"><p className="text-muted-foreground">Completeness</p><p className="font-bold text-emerald-600">87.5%</p></div>
          <div className="p-2 rounded bg-background"><p className="text-muted-foreground">Accuracy</p><p className="font-bold text-emerald-600">94.2%</p></div>
          <div className="p-2 rounded bg-background"><p className="text-muted-foreground">Consistency</p><p className="font-bold text-emerald-600">91.8%</p></div>
          <div className="p-2 rounded bg-background"><p className="text-muted-foreground">Duplicate Rate</p><p className="font-bold text-emerald-600">2.3%</p></div>
          <div className="p-2 rounded bg-background"><p className="text-muted-foreground">Approval SLA</p><p className="font-bold text-amber-600">88.0%</p></div>
          <div className="p-2 rounded bg-background"><p className="text-muted-foreground">Validation Errors</p><p className="font-bold text-amber-600">47</p></div>
        </div>
      </Card>
      <Card className="p-6 bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-900">
        <h3 className="font-semibold mb-2 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-violet-600" /> Part 2 — Enterprise Master Data Platform: COMPLETE</h3>
        <p className="text-sm text-muted-foreground mb-3">All 11 sprints of Part 2 are done. The foundation is finished:</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          {[
            'Sprint 6: Product Foundation',
            'Sprint 7: PIM Platform',
            'Sprint 8: Commercial Engine',
            'Sprint 9: Business Partner Platform',
            'Sprint 10: Identification & Traceability',
            'Sprint 11: Data Governance & Quality',
          ].map(item => (
            <div key={item} className="flex items-center gap-2 p-2 rounded bg-background">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Next: Part 3 — Enterprise Inventory Engine (10 sprints) begins the actual ERP transaction layer.</p>
      </Card>
    </div>
  )
}

function GovLifecycleTab() {
  const lifecycles = [
    { id: 'plc-001', product: 'Kaju Katli 500g', state: 'ACTIVE', prev: 'PUBLISHED', submitted: '2026-06-15', approved: '2026-06-18', published: '2026-06-20', activated: '2026-06-20', reason: null, transitions: 4 },
    { id: 'plc-002', product: 'Kaju Katli 250g', state: 'UNDER_REVIEW', prev: 'DRAFT', submitted: '2026-07-08', approved: null, published: null, reason: 'Pending QA review', transitions: 1 },
    { id: 'plc-003', product: 'Soan Cake 1kg', state: 'ACTIVE', prev: 'PUBLISHED', submitted: '2026-05-10', approved: '2026-05-12', published: '2026-05-15', activated: '2026-05-15', reason: null, transitions: 4 },
    { id: 'plc-004', product: 'Mixed Namkeen 200g', state: 'APPROVED', prev: 'UNDER_REVIEW', submitted: '2026-07-05', approved: '2026-07-07', published: null, reason: 'Awaiting publish', transitions: 2 },
    { id: 'plc-005', product: 'Gulab Jamun 1kg', state: 'INACTIVE', prev: 'ACTIVE', submitted: '2026-04-01', approved: '2026-04-03', published: '2026-04-05', activated: '2026-04-05', reason: 'Seasonal - summer off-season', transitions: 5 },
    { id: 'plc-006', product: 'Diwali Gift Hampers 2026', state: 'DRAFT', prev: null, submitted: null, approved: null, published: null, reason: 'New product in design', transitions: 0 },
    { id: 'plc-007', product: 'Old Recipe Laddu 500g', state: 'ARCHIVED', prev: 'DISCONTINUED', reason: 'Recipe discontinued, replaced by new formulation', transitions: 6 },
    { id: 'plc-008', product: 'Pista Roll 250g', state: 'DISCONTINUED', prev: 'INACTIVE', reason: 'Low demand', transitions: 5 },
  ]
  const stateColor: Record<string, string> = {
    DRAFT: 'bg-slate-500 hover:bg-slate-500', UNDER_REVIEW: 'bg-amber-500 hover:bg-amber-500',
    APPROVED: 'bg-blue-600 hover:bg-blue-600', PUBLISHED: 'bg-indigo-600 hover:bg-indigo-600',
    ACTIVE: 'bg-emerald-600 hover:bg-emerald-600', INACTIVE: 'bg-gray-600 hover:bg-gray-600',
    DISCONTINUED: 'bg-orange-600 hover:bg-orange-600', ARCHIVED: 'bg-red-700 hover:bg-red-700',
  }
  const states = ['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ACTIVE', 'INACTIVE', 'DISCONTINUED', 'ARCHIVED']
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Product Lifecycle Management</h3>
        <p className="text-xs text-muted-foreground mt-1">8 lifecycle states enforced. Every transition recorded with timestamp, actor, and reason. Archived products cannot be edited.</p></div>
        <Button size="sm"><Workflow className="mr-1 h-4 w-4" /> Transition</Button>
      </div>
      <div className="mb-4 flex items-center gap-1 text-xs overflow-x-auto pb-2">
        {states.map((s, i) => (
          <div key={s} className="flex items-center flex-shrink-0">
            <div className="px-2 py-1 rounded border bg-muted/40 font-mono whitespace-nowrap">{s.replace(/_/g, ' ')}</div>
            {i < states.length - 1 && <ArrowRight className="h-3 w-3 mx-0.5 text-muted-foreground flex-shrink-0" />}
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Product</th><th className="font-medium">Current State</th>
            <th className="font-medium">Previous</th><th className="font-medium">Submitted</th>
            <th className="font-medium">Approved</th><th className="font-medium">Published</th>
            <th className="font-medium">Transitions</th><th className="font-medium">Reason</th>
          </tr></thead>
          <tbody>
            {lifecycles.map(l => (
              <tr key={l.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-medium">{l.product}</td>
                <td><Badge className={stateColor[l.state] + ' text-xs'}>{l.state.replace(/_/g, ' ')}</Badge></td>
                <td className="text-xs text-muted-foreground">{l.prev ? l.prev.replace(/_/g, ' ') : '—'}</td>
                <td className="text-xs text-muted-foreground">{l.submitted || '—'}</td>
                <td className="text-xs text-muted-foreground">{l.approved || '—'}</td>
                <td className="text-xs text-muted-foreground">{l.published || '—'}</td>
                <td className="text-center font-mono">{l.transitions}</td>
                <td className="text-xs text-muted-foreground max-w-xs truncate">{l.reason || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function GovApprovalsTab() {
  const workflows = [
    { id: 'awf-001', product: 'Kaju Katli 250g', type: 'STANDARD', stage: 'QA', status: 'IN_REVIEW', sla: '2026-07-12', breached: false, steps: 6, completed: 2 },
    { id: 'awf-002', product: 'Mixed Namkeen 200g', type: 'STANDARD', stage: 'PUBLISHER', status: 'IN_REVIEW', sla: '2026-07-09', breached: false, steps: 6, completed: 5 },
    { id: 'awf-003', product: 'Diwali Gift Hampers 2026', type: 'PARALLEL', stage: 'CREATOR', status: 'PENDING', sla: '2026-08-15', breached: false, steps: 6, completed: 0 },
    { id: 'awf-004', product: 'Pista Roll 250g', type: 'CONDITIONAL', stage: 'COMPLETED', status: 'PUBLISHED', sla: '2025-10-15', breached: false, steps: 4, completed: 4 },
    { id: 'awf-005', product: 'Old Recipe Laddu 500g', type: 'STANDARD', stage: 'COMPLETED', status: 'REJECTED', sla: '2026-01-20', breached: true, steps: 3, completed: 3 },
  ]
  const stages = ['CREATOR', 'REVIEWER', 'QA', 'COMPLIANCE', 'FINANCE', 'PUBLISHER', 'COMPLETED']
  const statusColor: Record<string, string> = { PENDING: 'bg-amber-500 hover:bg-amber-500', IN_REVIEW: 'bg-blue-600 hover:bg-blue-600', PUBLISHED: 'bg-emerald-600 hover:bg-emerald-600', REJECTED: 'bg-red-600 hover:bg-red-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Product Approval Workflow</h3>
        <p className="text-xs text-muted-foreground mt-1">6-stage workflow: Creator → Reviewer → QA → Compliance → Finance (optional) → Publisher. Supports STANDARD, PARALLEL, and CONDITIONAL workflows with SLA tracking.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Workflow</Button>
      </div>
      <div className="mb-4 flex items-center gap-1 text-xs overflow-x-auto pb-2">
        {stages.map((s, i) => (
          <div key={s} className="flex items-center flex-shrink-0">
            <div className="px-2 py-1 rounded border bg-muted/40 font-mono whitespace-nowrap">{s}</div>
            {i < stages.length - 1 && <ArrowRight className="h-3 w-3 mx-0.5 text-muted-foreground flex-shrink-0" />}
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {workflows.map(w => {
          const progress = w.steps > 0 ? Math.round((w.completed / w.steps) * 100) : 0
          return (
            <div key={w.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{w.product}</p>
                    <Badge variant="outline" className="text-xs">{w.type}</Badge>
                    {w.breached && <Badge variant="destructive" className="text-xs">SLA BREACHED</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">Current stage: <span className="font-mono font-medium text-foreground">{w.stage}</span> · SLA due: {w.sla}</p>
                </div>
                <Badge className={statusColor[w.status] + ' text-xs'}>{w.status.replace(/_/g, ' ')}</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                  <div className={cn('h-full', w.status === 'PUBLISHED' ? 'bg-emerald-600' : w.status === 'REJECTED' ? 'bg-red-600' : 'bg-blue-600')} style={{ width: `${progress}%` }} />
                </div>
                <span className="font-mono font-medium">{w.completed} / {w.steps} steps ({progress}%)</span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function GovImportTab() {
  const jobs = [
    { id: 'ij-001', code: 'IMP-PROD-2026-0142', entity: 'PRODUCT', file: 'products_batch_july.xlsx', format: 'EXCEL', total: 250, success: 242, errors: 5, duplicates: 3, status: 'COMPLETED', initiated: '2026-07-08 10:00', completed: '2026-07-08 10:15' },
    { id: 'ij-002', code: 'IMP-BP-2026-0089', entity: 'BUSINESS_PARTNER', file: 'customers_import.csv', format: 'CSV', total: 500, success: 485, errors: 12, duplicates: 3, status: 'COMPLETED', initiated: '2026-07-07 14:00', completed: '2026-07-07 14:08' },
    { id: 'ij-003', code: 'IMP-PROD-2026-0143', entity: 'PRODUCT', file: 'new_sweets_catalog.xlsx', format: 'EXCEL', total: 0, success: 0, errors: 0, duplicates: 0, status: 'PREVIEWING', initiated: '2026-07-09 11:00', completed: null },
    { id: 'ij-004', code: 'IMP-PROD-2026-0140', entity: 'PRODUCT', file: 'faulty_import.xlsx', format: 'EXCEL', total: 100, success: 45, errors: 55, duplicates: 0, status: 'ROLLBACK', initiated: '2026-07-05 09:00', completed: '2026-07-05 09:10', rollbackReason: 'Excessive validation errors - rolled back per policy' },
    { id: 'ij-005', code: 'IMP-PRICE-2026-0034', entity: 'PRICE_LIST', file: 'price_update_august.csv', format: 'CSV', total: 0, success: 0, errors: 0, duplicates: 0, status: 'QUEUED', initiated: '2026-07-09 12:00', completed: null },
  ]
  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', PREVIEWING: 'bg-blue-600 hover:bg-blue-600', QUEUED: 'bg-amber-500 hover:bg-amber-500', ROLLBACK: 'bg-red-600 hover:bg-red-600', FAILED: 'bg-red-700 hover:bg-red-700' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Import Jobs</h3>
        <p className="text-xs text-muted-foreground mt-1">Excel/CSV import with validation, preview, duplicate detection, error reporting, and rollback. All jobs support rollback for safety.</p></div>
        <Button size="sm"><UploadCloud className="mr-1 h-4 w-4" /> New Import</Button>
      </div>
      <div className="space-y-3">
        {jobs.map(j => (
          <div key={j.id} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono text-xs">{j.code}</p>
                  <Badge variant="outline" className="text-xs">{j.entity.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline" className="text-xs font-mono">{j.format}</Badge>
                </div>
                <p className="font-medium text-sm">{j.file}</p>
              </div>
              <Badge className={statusColor[j.status] + ' text-xs'}>{j.status}</Badge>
            </div>
            {j.total > 0 && (
              <div className="grid grid-cols-4 gap-2 text-xs mt-2">
                <div><p className="text-muted-foreground">Total</p><p className="font-mono font-semibold">{j.total}</p></div>
                <div><p className="text-muted-foreground">Success</p><p className="font-mono font-semibold text-emerald-600">{j.success}</p></div>
                <div><p className="text-muted-foreground">Errors</p><p className="font-mono font-semibold text-red-600">{j.errors}</p></div>
                <div><p className="text-muted-foreground">Duplicates</p><p className="font-mono font-semibold text-amber-600">{j.duplicates}</p></div>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">Initiated: {j.initiated}{j.completed && ` · Completed: ${j.completed}`}</p>
            {j.rollbackReason && <p className="text-xs text-red-600 mt-1">⚠ {j.rollbackReason}</p>}
          </div>
        ))}
      </div>
    </Card>
  )
}

function GovExportTab() {
  const jobs = [
    { id: 'ej-001', code: 'EXP-PROD-2026-0056', entity: 'PRODUCT', format: 'EXCEL', file: 'product_master_export.xlsx', total: 1248, exported: 1248, size: '240 KB', status: 'COMPLETED', initiated: '2026-07-08 16:00', completed: '2026-07-08 16:02' },
    { id: 'ej-002', code: 'EXP-BP-2026-0023', entity: 'BUSINESS_PARTNER', format: 'CSV', file: 'business_partners.csv', total: 1412, exported: 1412, size: '376 KB', status: 'COMPLETED', initiated: '2026-07-07 11:00', completed: '2026-07-07 11:01' },
    { id: 'ej-003', code: 'EXP-PROD-2026-0057', entity: 'PRODUCT', format: 'PDF', file: 'product_catalog_q3.pdf', total: 0, exported: 0, size: null, status: 'EXPORTING', initiated: '2026-07-09 13:00', completed: null },
    { id: 'ej-004', code: 'EXP-PRICE-2026-0012', entity: 'PRICE_LIST', format: 'JSON', file: 'price_lists_api.json', total: 6, exported: 6, size: '45 KB', status: 'COMPLETED', initiated: '2026-07-08 09:00', completed: '2026-07-08 09:00' },
  ]
  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', EXPORTING: 'bg-blue-600 hover:bg-blue-600', QUEUED: 'bg-amber-500 hover:bg-amber-500', FAILED: 'bg-red-600 hover:bg-red-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Export Jobs</h3>
        <p className="text-xs text-muted-foreground mt-1">Export to Excel, CSV, PDF, or JSON. Filtered exports with custom field selection.</p></div>
        <Button size="sm"><DownloadCloud className="mr-1 h-4 w-4" /> New Export</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Job Code</th><th className="font-medium">Entity</th>
            <th className="font-medium">Format</th><th className="font-medium">File</th>
            <th className="font-medium text-right">Rows</th><th className="font-medium">Size</th>
            <th className="font-medium">Status</th><th className="font-medium">Completed</th>
          </tr></thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{j.code}</td>
                <td><Badge variant="outline" className="text-xs">{j.entity.replace(/_/g, ' ')}</Badge></td>
                <td><Badge variant="outline" className="text-xs font-mono">{j.format}</Badge></td>
                <td className="text-xs">{j.file}</td>
                <td className="text-right font-mono">{j.exported > 0 ? `${j.exported} / ${j.total}` : '—'}</td>
                <td className="text-xs">{j.size || '—'}</td>
                <td><Badge className={statusColor[j.status] + ' text-xs'}>{j.status}</Badge></td>
                <td className="text-xs text-muted-foreground">{j.completed || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function GovValidationTab() {
  const rules = [
    { code: 'PROD-NAME-REQ', name: 'Product Name Required', entity: 'PRODUCT', field: 'productName', type: 'REQUIRED', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
    { code: 'PROD-SKU-UNIQUE', name: 'SKU Must Be Unique', entity: 'PRODUCT', field: 'sku', type: 'UNIQUE', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
    { code: 'PROD-BARCODE-UNIQUE', name: 'Barcode Must Be Unique', entity: 'PRODUCT', field: 'barcode', type: 'UNIQUE', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
    { code: 'PROD-PRICE-RANGE', name: 'Price Range (₹1 - ₹100000)', entity: 'PRODUCT', field: 'sellingPrice', type: 'RANGE', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
    { code: 'PROD-HSN-REGEX', name: 'HSN Code Format (4-8 digits)', entity: 'PRODUCT', field: 'hsnCode', type: 'REGEX', severity: 'WARNING', enforcement: 'WARN', status: 'ACTIVE' },
    { code: 'BP-GST-REGEX', name: 'GST Number Format (15 chars)', entity: 'BUSINESS_PARTNER', field: 'gstNumber', type: 'REGEX', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
    { code: 'BP-PAN-UNIQUE', name: 'PAN Must Be Unique', entity: 'BUSINESS_PARTNER', field: 'panNumber', type: 'UNIQUE', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
    { code: 'PROD-CAT-XREF', name: 'Category Must Exist', entity: 'PRODUCT', field: 'categoryId', type: 'CROSS_REFERENCE', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
    { code: 'PROD-MARGIN-BIZ', name: 'Margin Must Be > 5%', entity: 'PRODUCT', field: 'marginPercent', type: 'BUSINESS_RULE', severity: 'WARNING', enforcement: 'WARN', status: 'ACTIVE' },
    { code: 'PROD-UOM-REQ', name: 'UOM Required for Stock Items', entity: 'PRODUCT', field: 'defaultUomId', type: 'REQUIRED', severity: 'ERROR', enforcement: 'BLOCK', status: 'ACTIVE' },
  ]
  const typeColor: Record<string, string> = { REQUIRED: 'bg-blue-100 text-blue-800', UNIQUE: 'bg-purple-100 text-purple-800', RANGE: 'bg-amber-100 text-amber-800', REGEX: 'bg-cyan-100 text-cyan-800', BUSINESS_RULE: 'bg-emerald-100 text-emerald-800', CROSS_REFERENCE: 'bg-pink-100 text-pink-800' }
  const sevColor: Record<string, string> = { ERROR: 'text-red-600', WARNING: 'text-amber-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Validation Rules</h3>
        <p className="text-xs text-muted-foreground mt-1">6 validation types: Required, Unique, Range, Regex, Business Rule, Cross-Reference. Enforcement modes: BLOCK, WARN, LOG.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Rule</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Code</th><th className="font-medium">Rule Name</th>
            <th className="font-medium">Entity</th><th className="font-medium">Field</th>
            <th className="font-medium">Type</th><th className="font-medium">Severity</th>
            <th className="font-medium">Enforcement</th><th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.code} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{r.code}</td>
                <td className="font-medium">{r.name}</td>
                <td><Badge variant="outline" className="text-xs">{r.entity.replace(/_/g, ' ')}</Badge></td>
                <td className="font-mono text-xs">{r.field}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[r.type])}>{r.type.replace(/_/g, ' ')}</span></td>
                <td className={cn('font-semibold', sevColor[r.severity])}>{r.severity}</td>
                <td><Badge variant="outline" className="text-xs">{r.enforcement}</Badge></td>
                <td><Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs">{r.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function GovDuplicatesTab() {
  const duplicates = [
    { id: 'dc-001', primary: 'Kaju Katli 500g', duplicate: 'Kaju Katri 500g', rule: 'SIMILAR_NAME', score: 92.5, matched: ['name (92% similar)', 'category (match)', 'brand (match)'], status: 'PENDING' },
    { id: 'dc-002', primary: 'Soan Cake 1kg', duplicate: 'Soan Papdi 1kg', rule: 'SIMILAR_NAME', score: 78.3, matched: ['name (78% similar)', 'category (match)'], status: 'FALSE_POSITIVE', notes: 'Different products - Soan Cake vs Soan Papdi' },
    { id: 'dc-003', primary: 'Mixed Namkeen 200g', duplicate: 'Namkeen Mix 200g', rule: 'SIMILAR_NAME', score: 88.9, matched: ['name (89% similar)', 'category (match)', 'weight (match)'], status: 'MERGED', action: 'KEEP_PRIMARY', notes: 'Confirmed duplicate - merged into primary' },
    { id: 'dc-004', primary: 'Gulab Jamun 1kg', duplicate: 'Gulab Jamun (1kg tin)', rule: 'BARCODE', score: 100, matched: ['barcode (exact match)'], status: 'MERGED', action: 'ARCHIVE_DUPLICATE', notes: 'Same barcode - archived duplicate' },
    { id: 'dc-005', primary: 'Pista Roll 250g', duplicate: 'Pista Roll 250gms', rule: 'SKU', score: 95.0, matched: ['sku (95% similar)', 'name (match)'], status: 'PENDING' },
    { id: 'dc-006', primary: 'Cashew Nuts (Raw)', duplicate: 'Cashew Nut Raw Material', rule: 'SIMILAR_NAME', score: 85.7, matched: ['name (86% similar)'], status: 'IGNORED', notes: 'Different grade specifications' },
  ]
  const statusColor: Record<string, string> = { PENDING: 'bg-amber-500 hover:bg-amber-500', MERGED: 'bg-emerald-600 hover:bg-emerald-600', IGNORED: 'bg-gray-500 hover:bg-gray-500', FALSE_POSITIVE: 'bg-blue-600 hover:bg-blue-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Duplicate Detection & Merge</h3>
        <p className="text-xs text-muted-foreground mt-1">6 detection rules: Name, SKU, Barcode, HSN, Brand, Similar Names. Merge options: Keep Primary, Merge References, Archive Duplicate. Side-by-side comparison supported.</p></div>
        <Button size="sm"><GitMerge className="mr-1 h-4 w-4" /> Scan Duplicates</Button>
      </div>
      <div className="space-y-3">
        {duplicates.map(d => (
          <div key={d.id} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{d.primary}</p>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <p className="font-medium text-sm text-muted-foreground">{d.duplicate}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">{d.rule.replace(/_/g, ' ')}</Badge>
                  <span>Match: <span className="font-mono font-semibold text-foreground">{d.score}%</span></span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {d.matched.map((m, i) => <Badge key={i} variant="outline" className="text-xs">{m}</Badge>)}
                </div>
              </div>
              <div className="text-right">
                <Badge className={statusColor[d.status] + ' text-xs'}>{d.status.replace(/_/g, ' ')}</Badge>
                {d.action && <p className="text-xs text-muted-foreground mt-1">{d.action.replace(/_/g, ' ')}</p>}
              </div>
            </div>
            {d.notes && <p className="text-xs text-muted-foreground mt-1 pt-1 border-t">{d.notes}</p>}
            {d.status === 'PENDING' && (
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="default" className="h-7 text-xs"><GitMerge className="mr-1 h-3 w-3" />Merge</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">Mark False Positive</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">Ignore</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function GovAuditTab() {
  const audit = [
    { id: 'mda-001', entity: 'Kaju Katli 500g', type: 'PRODUCT', action: 'UPDATE', module: 'PIM', user: 'Priya Sharma', role: 'PIM Manager', fields: ['sellingPrice: ₹520 → ₹540', 'mrp: ₹580 → ₹600'], reason: 'Quarterly price review', ip: '192.168.1.45', time: '2026-07-08 14:30' },
    { id: 'mda-002', entity: 'Mixed Namkeen 200g', type: 'PRODUCT', action: 'CREATE', module: 'Product Master', user: 'Rajesh Mehta', role: 'Product Manager', fields: ['New product created'], reason: 'New product launch', ip: '192.168.1.50', time: '2026-07-08 09:15' },
    { id: 'mda-003', entity: 'Old Recipe Laddu 500g', type: 'PRODUCT', action: 'ARCHIVE', module: 'Lifecycle', user: 'Anita Desai', role: 'Admin', fields: ['lifecycleState: DISCONTINUED → ARCHIVED'], reason: 'Recipe discontinued 6 months ago', ip: '192.168.1.10', time: '2026-01-15 10:00' },
    { id: 'mda-004', entity: 'Tata Consumer Products', type: 'BUSINESS_PARTNER', action: 'UPDATE', module: 'Business Partner', user: 'Suresh Patil', role: 'Accounts Manager', fields: ['creditLimit: ₹4500000 → ₹5000000'], reason: 'Annual credit review', ip: '192.168.1.55', time: '2026-07-07 16:45' },
    { id: 'mda-005', entity: 'Kaju Katli 500g', type: 'PRODUCT', action: 'MERGE', module: 'Duplicate Manager', user: 'Priya Sharma', role: 'PIM Manager', fields: ['Merged "Kaju Katri 500g" into "Kaju Katli 500g"'], reason: 'Duplicate detected and merged', ip: '192.168.1.45', time: '2026-07-06 11:20' },
    { id: 'mda-006', entity: 'Diwali Festival Price List', type: 'PRICE_LIST', action: 'CREATE', module: 'Commercial Engine', user: 'Vikram Iyer', role: 'Pricing Manager', fields: ['New price list with 45 items'], reason: 'Diwali festival preparation', ip: '192.168.1.60', time: '2026-09-01 14:00' },
    { id: 'mda-007', entity: 'Gulab Jamun 1kg', type: 'PRODUCT', action: 'UPDATE', module: 'PIM', user: 'Rajesh Mehta', role: 'Product Manager', fields: ['lifecycleState: ACTIVE → INACTIVE'], reason: 'Summer off-season - temporarily inactive', ip: '192.168.1.50', time: '2026-07-01 08:00' },
    { id: 'mda-008', entity: 'Konkan Cashew Processors', type: 'BUSINESS_PARTNER', action: 'UPDATE', module: 'Business Partner', user: 'Suresh Patil', role: 'Accounts Manager', fields: ['compliance.FSSAI verified'], reason: 'Annual compliance renewal', ip: '192.168.1.55', time: '2026-06-28 15:30' },
  ]
  const actionColor: Record<string, string> = { CREATE: 'bg-emerald-100 text-emerald-800', UPDATE: 'bg-blue-100 text-blue-800', DELETE: 'bg-red-100 text-red-800', ARCHIVE: 'bg-orange-100 text-orange-800', RESTORE: 'bg-cyan-100 text-cyan-800', MERGE: 'bg-purple-100 text-purple-800' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Master Data Audit Trail</h3>
        <p className="text-xs text-muted-foreground mt-1">Every change tracked: before/after values, user, role, timestamp, module, IP address, reason. Filterable by action and module.</p></div>
      </div>
      <div className="space-y-2">
        {audit.map(a => (
          <div key={a.id} className="border rounded-lg p-3 flex items-start gap-3">
            <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium flex-shrink-0', actionColor[a.action])}>{a.action}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-medium text-sm">{a.entity}</p>
                <Badge variant="outline" className="text-xs">{a.type.replace(/_/g, ' ')}</Badge>
                <Badge variant="outline" className="text-xs">{a.module}</Badge>
              </div>
              <div className="flex flex-wrap gap-1 mb-1">
                {a.fields.map((f, i) => <span key={i} className="text-xs font-mono bg-muted/60 px-1.5 py-0.5 rounded">{f}</span>)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{a.user}</span> ({a.role}) · {a.time} · IP: {a.ip}
              </p>
              {a.reason && <p className="text-xs text-muted-foreground mt-0.5">Reason: {a.reason}</p>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function GovQualityTab() {
  const metrics = [
    { entity: 'PRODUCT', name: 'COMPLETENESS', value: 87.5, unit: 'PERCENT', score: 87.5, desc: '87.5% of required fields populated across 1248 products' },
    { entity: 'PRODUCT', name: 'ACCURACY', value: 94.2, unit: 'PERCENT', score: 94.2, desc: '94.2% of products passed validation rules' },
    { entity: 'PRODUCT', name: 'CONSISTENCY', value: 91.8, unit: 'PERCENT', score: 91.8, desc: '91.8% consistent across all channels' },
    { entity: 'PRODUCT', name: 'DUPLICATE_PERCENT', value: 2.3, unit: 'PERCENT', score: 97.7, desc: '2.3% duplicate rate (29 duplicates out of 1248)' },
    { entity: 'PRODUCT', name: 'APPROVAL_SLA', value: 88.0, unit: 'PERCENT', score: 88.0, desc: '88% of approvals completed within SLA' },
    { entity: 'PRODUCT', name: 'VALIDATION_ERRORS', value: 47, unit: 'COUNT', score: 92.0, desc: '47 active validation errors across products' },
    { entity: 'PRODUCT', name: 'INACTIVE_PRODUCTS', value: 124, unit: 'COUNT', score: 90.0, desc: '124 inactive products (9.9% of catalog)' },
    { entity: 'PRODUCT', name: 'MISSING_IMAGES', value: 89, unit: 'COUNT', score: 92.9, desc: '89 products missing images (7.1%)' },
    { entity: 'PRODUCT', name: 'MISSING_BARCODES', value: 23, unit: 'COUNT', score: 98.2, desc: '23 products missing barcodes (1.8%)' },
    { entity: 'BUSINESS_PARTNER', name: 'COMPLETENESS', value: 92.1, unit: 'PERCENT', score: 92.1, desc: '92.1% of required fields populated' },
    { entity: 'BUSINESS_PARTNER', name: 'DUPLICATE_PERCENT', value: 1.1, unit: 'PERCENT', score: 98.9, desc: '1.1% duplicate rate (15 out of 1412)' },
    { entity: 'BUSINESS_PARTNER', name: 'MISSING_GST', value: 34, unit: 'COUNT', score: 97.6, desc: '34 partners missing GST (2.4%)' },
  ]
  const scoreColor = (s: number) => s >= 95 ? 'text-emerald-600' : s >= 85 ? 'text-blue-600' : s >= 75 ? 'text-amber-600' : 'text-red-600'
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Data Quality Dashboard</h3>
        <p className="text-xs text-muted-foreground mt-1">9 quality metrics for products + 3 for business partners. Overall score: 91.6 (Grade A). Real-time monitoring with trend analysis.</p></div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m, i) => (
          <div key={i} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{m.entity.replace(/_/g, ' ')}</p>
                <p className="font-medium text-sm">{m.name.replace(/_/g, ' ')}</p>
              </div>
              <div className="text-right">
                <p className={cn('text-2xl font-bold', scoreColor(m.score))}>{m.unit === 'PERCENT' ? `${m.value}%` : m.value}</p>
                <p className="text-xs text-muted-foreground">Score: <span className={cn('font-bold', scoreColor(m.score))}>{m.score}</span></p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{m.desc}</p>
            <div className="mt-2 h-1.5 bg-muted rounded overflow-hidden">
              <div className={cn('h-full', m.score >= 95 ? 'bg-emerald-600' : m.score >= 85 ? 'bg-blue-600' : m.score >= 75 ? 'bg-amber-500' : 'bg-red-600')} style={{ width: `${m.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function GovHistoryTab() {
  const history = [
    { id: 'pch-001', product: 'Kaju Katli 500g', version: 5, type: 'PRICE_CHANGE', fields: ['sellingPrice: ₹520 → ₹540', 'mrp: ₹580 → ₹600'], editor: 'Priya Sharma', reason: 'Quarterly price review', time: '2026-07-08 14:30', rollback: true },
    { id: 'pch-002', product: 'Kaju Katli 500g', version: 4, type: 'UPDATE', fields: ['description updated', 'ingredients clarified'], editor: 'Rajesh Mehta', reason: 'Compliance review - ingredient clarity', time: '2026-06-20 11:00', rollback: true },
    { id: 'pch-003', product: 'Kaju Katli 500g', version: 3, type: 'LIFECYCLE_TRANSITION', fields: ['lifecycleState: PUBLISHED → ACTIVE'], editor: 'System', reason: 'Auto-activation after publish', time: '2026-06-20 10:00', rollback: false },
    { id: 'pch-004', product: 'Kaju Katli 500g', version: 2, type: 'LIFECYCLE_TRANSITION', fields: ['lifecycleState: APPROVED → PUBLISHED'], editor: 'Anita Desai', reason: 'Approved for publication', time: '2026-06-20 09:30', rollback: false },
    { id: 'pch-005', product: 'Kaju Katli 500g', version: 1, type: 'CREATE', fields: ['Initial product creation'], editor: 'Rajesh Mehta', reason: 'New product', time: '2026-06-15 08:00', rollback: false },
    { id: 'pch-006', product: 'Mixed Namkeen 200g', version: 3, type: 'CATEGORY_CHANGE', fields: ['categoryId: Sweets → Namkeen'], editor: 'Priya Sharma', reason: 'Reclassification - product is savory not sweet', time: '2026-07-09 10:00', rollback: true },
  ]
  const typeColor: Record<string, string> = { CREATE: 'bg-emerald-100 text-emerald-800', UPDATE: 'bg-blue-100 text-blue-800', PRICE_CHANGE: 'bg-amber-100 text-amber-800', CATEGORY_CHANGE: 'bg-purple-100 text-purple-800', LIFECYCLE_TRANSITION: 'bg-indigo-100 text-indigo-800', ARCHIVE: 'bg-orange-100 text-orange-800', RESTORE: 'bg-cyan-100 text-cyan-800' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Product Change History</h3>
        <p className="text-xs text-muted-foreground mt-1">Versioned history with before/after snapshots. Rollback support for reversible changes. Every change records editor, reason, and approval link.</p></div>
      </div>
      <div className="space-y-2">
        {history.map(h => (
          <div key={h.id} className="border rounded-lg p-3 flex items-start gap-3">
            <div className="flex h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-bold items-center justify-center flex-shrink-0">v{h.version}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-medium text-sm">{h.product}</p>
                <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[h.type])}>{h.type.replace(/_/g, ' ')}</span>
                {h.rollback && <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">Rollbackable</Badge>}
              </div>
              <div className="flex flex-wrap gap-1 mb-1">
                {h.fields.map((f, i) => <span key={i} className="text-xs font-mono bg-muted/60 px-1.5 py-0.5 rounded">{f}</span>)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{h.editor}</span> · {h.time}
              </p>
              {h.reason && <p className="text-xs text-muted-foreground mt-0.5">Reason: {h.reason}</p>}
            </div>
            {h.rollback && (
              <Button size="sm" variant="outline" className="h-7 text-xs flex-shrink-0">Rollback</Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Inventory Engine Module (Sprint 12) ────────────────
type InvTab = 'overview' | 'transactions' | 'balances' | 'ledger' | 'movements' | 'journal' | 'availability'

function InventoryModule() {
  const [tab, setTab] = useState<InvTab>('overview')
  const tabs: Array<{ key: InvTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'transactions', label: 'Transactions', icon: <ArrowLeftRight className="h-4 w-4" /> },
    { key: 'balances', label: 'Stock Balances', icon: <Boxes className="h-4 w-4" /> },
    { key: 'ledger', label: 'Stock Ledger', icon: <BookOpen className="h-4 w-4" /> },
    { key: 'movements', label: 'Movements', icon: <PackageOpen className="h-4 w-4" /> },
    { key: 'journal', label: 'Journal', icon: <Layers3 className="h-4 w-4" /> },
    { key: 'availability', label: 'Availability', icon: <ActivityIcon className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-red-950 via-orange-900 to-amber-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Boxes className="h-7 w-7" /> Enterprise Inventory Engine
            </h2>
            <p className="text-orange-200 text-sm max-w-3xl">
              Universal Stock Ledger — the single source of truth for inventory.
              <span className="font-semibold text-white"> NEVER update stock directly.</span> Every stock change creates an immutable ledger transaction.
              Stock balances are DERIVED from the ledger. This is the core engine that Manufacturing, Warehouse, Retail, Restaurant, and Finance all depend on.
            </p>
          </div>
          <Badge className="bg-red-500 text-red-950 hover:bg-red-500">Sprint 12 · Part 3</Badge>
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <div className="flex items-center gap-3 text-sm">
          <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-200">Core Architecture Principle</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
              Available = Received − Issued − Reserved − Damaged. The <code className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">stock_balances</code> table is a performance cache only — it must always be reconstructable from the immutable <code className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">stock_ledger</code>.
            </p>
          </div>
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

      {tab === 'overview' && <InvOverviewTab />}
      {tab === 'transactions' && <InvTransactionsTab />}
      {tab === 'balances' && <InvBalancesTab />}
      {tab === 'ledger' && <InvLedgerTab />}
      {tab === 'movements' && <InvMovementsTab />}
      {tab === 'journal' && <InvJournalTab />}
      {tab === 'availability' && <InvAvailabilityTab />}
    </div>
  )
}

function InvOverviewTab() {
  const stats = [
    { label: 'Total Inventory Value', value: '₹5.16L', sub: 'Across 10 stock balances', icon: <IndianRupee className="h-5 w-5 text-emerald-600" /> },
    { label: 'Available Units', value: '4,904', sub: 'Ready for sale/issue', icon: <PackageCheck className="h-5 w-5 text-blue-600" /> },
    { label: 'Reserved Units', value: '24', sub: 'For Infosys order', icon: <ShieldCheck className="h-5 w-5 text-purple-600" /> },
    { label: 'Expired Units', value: '56', sub: 'Batch KK-2606-05', icon: <AlertOctagon className="h-5 w-5 text-red-600" /> },
    { label: 'Transactions', value: '10', sub: '8 POSTED · 2 PENDING', icon: <ArrowLeftRight className="h-5 w-5 text-amber-600" /> },
    { label: 'Ledger Entries', value: '10', sub: 'Immutable audit trail', icon: <BookOpen className="h-5 w-5 text-cyan-600" /> },
    { label: 'Journal Entries', value: '6', sub: 'Double-entry style', icon: <Layers3 className="h-5 w-5 text-indigo-600" /> },
    { label: 'Transaction Types', value: '18', sub: 'Goods Receipt to Stock Take', icon: <ListChecks className="h-5 w-5 text-teal-600" /> },
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
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ActivityIcon className="h-5 w-5" /> Transaction Flow (Universal Ledger)</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// Every module calls the Inventory Engine — never updates stock directly</p>
          <div className="space-y-1 pt-2">
            <p><Badge variant="outline" className="font-mono">1</Badge> <span className="text-blue-600">Inventory Transaction</span> (Goods Receipt, Issue, Transfer, Adjustment, etc.)</p>
            <p><Badge variant="outline" className="font-mono">2</Badge> → Posts to <span className="text-purple-600">Stock Ledger</span> (immutable, append-only)</p>
            <p><Badge variant="outline" className="font-mono">3</Badge> → Posts to <span className="text-indigo-600">Inventory Journal</span> (double-entry: DEBIT/CREDIT)</p>
            <p><Badge variant="outline" className="font-mono">4</Badge> → Creates <span className="text-cyan-600">Stock Movement</span> record (from→to)</p>
            <p><Badge variant="outline" className="font-mono">5</Badge> → <span className="text-emerald-600">Stock Balance</span> cache updated (derived from ledger)</p>
            <p><Badge variant="outline" className="font-mono">6</Badge> → <span className="text-amber-600">Availability Service</span> exposes current state to all modules</p>
          </div>
        </div>
        <div className="mt-4 grid sm:grid-cols-5 gap-2 text-center text-xs">
          {['Manufacturing', 'Warehouse', 'Retail POS', 'Restaurant POS', 'Finance'].map(ch => (
            <div key={ch} className="p-2 rounded-md bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900">
              <p className="font-semibold text-orange-700 dark:text-orange-400">{ch}</p>
              <p className="text-muted-foreground mt-1">Consumes via API</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function InvTransactionsTab() {
  const transactions = [
    { id: 'it-001', number: 'INV-2026-00142', type: 'GOODS_RECEIPT', date: '2026-07-08', refType: 'PURCHASE_ORDER', refNumber: 'PO-2026-0142', warehouse: 'Mumbai Plant Warehouse', partner: 'Konkan Cashew Processors', status: 'POSTED', lines: 3, totalQty: 380, totalValue: 114000, createdBy: 'Suresh Patil' },
    { id: 'it-002', number: 'INV-2026-00143', type: 'GOODS_RECEIPT', date: '2026-07-08', refType: 'PURCHASE_ORDER', refNumber: 'PO-2026-0156', warehouse: 'Mumbai Plant Warehouse', partner: 'Sri Balaji Sugar', status: 'POSTED', lines: 1, totalQty: 500, totalValue: 25000, createdBy: 'Suresh Patil' },
    { id: 'it-003', number: 'INV-2026-00144', type: 'PRODUCTION_RECEIPT', date: '2026-07-01', refType: 'PRODUCTION_ORDER', refNumber: 'MO-2026-0089', warehouse: 'Mumbai Plant Warehouse', partner: null, status: 'POSTED', lines: 1, totalQty: 500, totalValue: 175000, createdBy: 'Anita Desai' },
    { id: 'it-004', number: 'INV-2026-00145', type: 'TRANSFER', date: '2026-07-03', refType: 'TRANSFER_ORDER', refNumber: 'TO-2026-0042', warehouse: 'Mumbai Plant Warehouse', partner: null, status: 'POSTED', lines: 1, totalQty: 358, totalValue: 125300, createdBy: 'Anita Desai' },
    { id: 'it-005', number: 'INV-2026-00146', type: 'SALES', date: '2026-07-05', refType: 'INVOICE', refNumber: 'INV-2026-00892', warehouse: 'Mumbai DC', partner: 'Tata Consumer Products', status: 'POSTED', lines: 1, totalQty: 100, totalValue: 54000, createdBy: 'Vikram Iyer' },
    { id: 'it-006', number: 'INV-2026-00147', type: 'SALES', date: '2026-07-06', refType: 'INVOICE', refNumber: 'INV-2026-00915', warehouse: 'Mumbai DC', partner: 'Reliance Retail', status: 'POSTED', lines: 1, totalQty: 48, totalValue: 25920, createdBy: 'Vikram Iyer' },
    { id: 'it-007', number: 'INV-2026-00148', type: 'RESERVATION', date: '2026-07-08', refType: 'SALES_ORDER', refNumber: 'SO-2026-0234', warehouse: 'Mumbai DC', partner: 'Infosys', status: 'POSTED', lines: 1, totalQty: 24, totalValue: 12960, createdBy: 'Vikram Iyer' },
    { id: 'it-008', number: 'INV-2026-00149', type: 'DAMAGE', date: '2026-07-07', refType: 'DAMAGE_REPORT', refNumber: 'DMG-2026-0012', warehouse: 'Mumbai DC', partner: null, status: 'PENDING_APPROVAL', lines: 1, totalQty: 8, totalValue: 4320, createdBy: 'Anita Desai' },
    { id: 'it-009', number: 'INV-2026-00150', type: 'ADJUSTMENT', date: '2026-07-09', refType: 'ADJUSTMENT_REQUEST', refNumber: 'ADJ-2026-0034', warehouse: 'Mumbai Plant Warehouse', partner: null, status: 'PENDING_APPROVAL', lines: 2, totalQty: 12, totalValue: 6480, createdBy: 'Suresh Patil' },
    { id: 'it-010', number: 'INV-2026-00151', type: 'OPENING_STOCK', date: '2026-01-01', refType: 'OPENING_STOCK', refNumber: 'OS-2026-001', warehouse: 'Mumbai Plant Warehouse', partner: null, status: 'POSTED', lines: 12, totalQty: 2400, totalValue: 840000, createdBy: 'System' },
  ]
  const typeColor: Record<string, string> = {
    GOODS_RECEIPT: 'bg-emerald-100 text-emerald-800', GOODS_ISSUE: 'bg-red-100 text-red-800',
    TRANSFER: 'bg-blue-100 text-blue-800', ADJUSTMENT: 'bg-amber-100 text-amber-800',
    PRODUCTION_RECEIPT: 'bg-emerald-100 text-emerald-800', PRODUCTION_CONSUMPTION: 'bg-orange-100 text-orange-800',
    SALES: 'bg-purple-100 text-purple-800', SALES_RETURN: 'bg-cyan-100 text-cyan-800',
    PURCHASE_RETURN: 'bg-red-100 text-red-800', OPENING_STOCK: 'bg-slate-100 text-slate-800',
    CYCLE_COUNT: 'bg-teal-100 text-teal-800', RESERVATION: 'bg-indigo-100 text-indigo-800',
    ALLOCATION: 'bg-violet-100 text-violet-800', RELEASE: 'bg-pink-100 text-pink-800',
    SCRAP: 'bg-red-200 text-red-900', DAMAGE: 'bg-orange-200 text-orange-900',
    EXPIRY: 'bg-gray-200 text-gray-800', STOCK_TAKE: 'bg-teal-100 text-teal-800',
  }
  const statusColor: Record<string, string> = { POSTED: 'bg-emerald-600 hover:bg-emerald-600', PENDING_APPROVAL: 'bg-amber-500 hover:bg-amber-500', DRAFT: 'bg-slate-500 hover:bg-slate-500', REVERSED: 'bg-red-600 hover:bg-red-600', CANCELLED: 'bg-gray-600 hover:bg-gray-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Inventory Transactions</h3>
        <p className="text-xs text-muted-foreground mt-1">18 transaction types supported. Every transaction posts to the immutable ledger. Negative stock blocked by default. Reversible (except Opening Stock, Scrap, Expiry).</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Transaction</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Transaction #</th><th className="font-medium">Type</th>
            <th className="font-medium">Date</th><th className="font-medium">Reference</th>
            <th className="font-medium">Warehouse</th><th className="font-medium">Partner</th>
            <th className="font-medium text-right">Qty</th><th className="font-medium text-right">Value</th>
            <th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{t.number}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[t.type])}>{t.type.replace(/_/g, ' ')}</span></td>
                <td className="text-xs text-muted-foreground">{t.date}</td>
                <td className="text-xs"><span className="font-mono">{t.refNumber}</span><br /><span className="text-muted-foreground">{t.refType.replace(/_/g, ' ')}</span></td>
                <td className="text-xs">{t.warehouse}</td>
                <td className="text-xs">{t.partner || <span className="text-muted-foreground">—</span>}</td>
                <td className="text-right font-mono">{t.totalQty}</td>
                <td className="text-right font-mono">₹{t.totalValue.toLocaleString('en-IN')}</td>
                <td><Badge className={statusColor[t.status] + ' text-xs'}>{t.status.replace(/_/g, ' ')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function InvBalancesTab() {
  const balances = [
    { product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', batch: 'KK-2607-01', available: 142, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 142, unitCost: 350, totalValue: 49700, expiry: '2026-07-31' },
    { product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', batch: 'KK-2607-01', available: 186, reserved: 24, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 210, unitCost: 350, totalValue: 73500, expiry: '2026-07-31' },
    { product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', batch: 'KK-2606-05', available: 0, reserved: 0, allocated: 0, damaged: 0, expired: 56, inTransit: 0, total: 56, unitCost: 345, totalValue: 19320, expiry: '2026-07-25' },
    { product: 'Soan Cake 1kg', warehouse: 'Mumbai Plant Warehouse', batch: 'SC-2606-04', available: 89, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 89, unitCost: 625, totalValue: 55625, expiry: '2026-09-15' },
    { product: 'Mixed Namkeen 200g', warehouse: 'Mumbai Plant Warehouse', batch: 'MN-2607-03', available: 1180, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 1180, unitCost: 53, totalValue: 62540, expiry: '2026-08-22' },
    { product: 'Gulab Jamun 1kg', warehouse: 'Mumbai DC', batch: 'GJ-2607-01', available: 412, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 412, unitCost: 304, totalValue: 125248, expiry: '2026-08-05' },
    { product: 'Cashew Nuts (Raw)', warehouse: 'Mumbai Plant Warehouse', batch: null, available: 35, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 35, unitCost: 850, totalValue: 29750, expiry: null },
    { product: 'Sugar (Raw)', warehouse: 'Mumbai Plant Warehouse', batch: null, available: 28, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 28, unitCost: 45, totalValue: 1260, expiry: null },
    { product: 'Ghee (Raw)', warehouse: 'Mumbai Plant Warehouse', batch: null, available: 12, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 12, unitCost: 520, totalValue: 6240, expiry: null },
    { product: 'Packaging Boxes', warehouse: 'Mumbai Plant Warehouse', batch: null, available: 2840, reserved: 0, allocated: 0, damaged: 0, expired: 0, inTransit: 0, total: 2840, unitCost: 12, totalValue: 34080, expiry: null },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Stock Balances (Derived Cache)</h3>
        <p className="text-xs text-muted-foreground mt-1">Computed from the immutable ledger. Formula: Total = Available + Reserved + Allocated + Damaged + Expired + In Transit. Multi-dimensional: product × warehouse × batch × location × bin.</p></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Product</th><th className="font-medium">Warehouse</th>
            <th className="font-medium">Batch</th><th className="font-medium text-right">Avail</th>
            <th className="font-medium text-right">Resv</th><th className="font-medium text-right">Alloc</th>
            <th className="font-medium text-right">Dmg</th><th className="font-medium text-right">Exp</th>
            <th className="font-medium text-right">Total</th><th className="font-medium text-right">Value</th>
            <th className="font-medium">Expiry</th>
          </tr></thead>
          <tbody>
            {balances.map((b, i) => (
              <tr key={i} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-medium">{b.product}</td>
                <td className="text-xs">{b.warehouse}</td>
                <td className="font-mono text-xs">{b.batch || <span className="text-muted-foreground">—</span>}</td>
                <td className="text-right font-mono font-semibold text-emerald-600">{b.available}</td>
                <td className="text-right font-mono text-blue-600">{b.reserved}</td>
                <td className="text-right font-mono text-purple-600">{b.allocated}</td>
                <td className="text-right font-mono text-orange-600">{b.damaged}</td>
                <td className="text-right font-mono text-red-600">{b.expired}</td>
                <td className="text-right font-mono font-semibold">{b.total}</td>
                <td className="text-right font-mono">₹{b.totalValue.toLocaleString('en-IN')}</td>
                <td className="text-xs text-muted-foreground">{b.expiry || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function InvLedgerTab() {
  const entries = [
    { id: 'sl-001', txnNumber: 'INV-2026-00142', txnType: 'GOODS_RECEIPT', product: 'Cashew Nuts (Raw)', warehouse: 'Mumbai Plant Warehouse', qtyDelta: 200, availDelta: 200, postingDate: '2026-07-08 10:15', isReversal: false },
    { id: 'sl-002', txnNumber: 'INV-2026-00142', txnType: 'GOODS_RECEIPT', product: 'Sugar (Raw)', warehouse: 'Mumbai Plant Warehouse', qtyDelta: 150, availDelta: 150, postingDate: '2026-07-08 10:15', isReversal: false },
    { id: 'sl-003', txnNumber: 'INV-2026-00142', txnType: 'GOODS_RECEIPT', product: 'Ghee (Raw)', warehouse: 'Mumbai Plant Warehouse', qtyDelta: 30, availDelta: 30, postingDate: '2026-07-08 10:15', isReversal: false },
    { id: 'sl-004', txnNumber: 'INV-2026-00143', txnType: 'GOODS_RECEIPT', product: 'Sugar (Raw)', warehouse: 'Mumbai Plant Warehouse', qtyDelta: 500, availDelta: 500, postingDate: '2026-07-08 10:20', isReversal: false },
    { id: 'sl-005', txnNumber: 'INV-2026-00144', txnType: 'PRODUCTION_RECEIPT', product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', batch: 'KK-2607-01', qtyDelta: 500, availDelta: 500, postingDate: '2026-07-01 16:00', isReversal: false },
    { id: 'sl-006', txnNumber: 'INV-2026-00145', txnType: 'TRANSFER', product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', batch: 'KK-2607-01', qtyDelta: -358, availDelta: -358, postingDate: '2026-07-03 10:00', isReversal: false },
    { id: 'sl-007', txnNumber: 'INV-2026-00145', txnType: 'TRANSFER', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', batch: 'KK-2607-01', qtyDelta: 358, availDelta: 358, postingDate: '2026-07-03 10:00', isReversal: false },
    { id: 'sl-008', txnNumber: 'INV-2026-00146', txnType: 'SALES', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', batch: 'KK-2607-01', qtyDelta: -100, availDelta: -100, postingDate: '2026-07-05 14:00', isReversal: false },
    { id: 'sl-009', txnNumber: 'INV-2026-00147', txnType: 'SALES', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', batch: 'KK-2607-01', qtyDelta: -48, availDelta: -48, postingDate: '2026-07-06 11:30', isReversal: false },
    { id: 'sl-010', txnNumber: 'INV-2026-00148', txnType: 'RESERVATION', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', batch: 'KK-2607-01', qtyDelta: -24, availDelta: -24, postingDate: '2026-07-08 09:00', isReversal: false },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><BookOpen className="h-5 w-5" /> Stock Ledger (Immutable Source of Truth)</h3>
        <p className="text-xs text-muted-foreground mt-1">Append-only. Never edited. Never deleted. Reversals create new entries with negative deltas. This is the single source from which all stock balances are derived.</p></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Txn Number</th><th className="font-medium">Type</th>
            <th className="font-medium">Product</th><th className="font-medium">Warehouse</th>
            <th className="font-medium">Batch</th><th className="font-medium text-right">Qty Delta</th>
            <th className="font-medium text-right">Avail Delta</th><th className="font-medium">Posted</th>
            <th className="font-medium">Reversal?</th>
          </tr></thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="border-b hover:bg-muted/40 font-mono text-xs">
                <td className="py-2.5">{e.txnNumber}</td>
                <td><Badge variant="outline" className="text-xs">{e.txnType.replace(/_/g, ' ')}</Badge></td>
                <td className="font-sans font-medium">{e.product}</td>
                <td className="font-sans">{e.warehouse}</td>
                <td>{e.batch || <span className="text-muted-foreground">—</span>}</td>
                <td className={cn('text-right font-bold', e.qtyDelta > 0 ? 'text-emerald-600' : 'text-red-600')}>{e.qtyDelta > 0 ? '+' : ''}{e.qtyDelta}</td>
                <td className={cn('text-right font-bold', e.availDelta > 0 ? 'text-emerald-600' : 'text-red-600')}>{e.availDelta > 0 ? '+' : ''}{e.availDelta}</td>
                <td className="text-muted-foreground">{e.postingDate}</td>
                <td>{e.isReversal ? <Badge variant="destructive" className="text-xs">Yes</Badge> : <span className="text-muted-foreground">No</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function InvMovementsTab() {
  const movements = [
    { id: 'sm-001', product: 'Cashew Nuts (Raw)', type: 'IN', qty: 200, from: 'Konkan Cashew Processors', to: 'Mumbai Plant Warehouse', ref: 'PO-2026-0142', partner: 'Konkan Cashew', performedBy: 'Suresh Patil', reason: 'Purchase receipt', date: '2026-07-08 10:15' },
    { id: 'sm-002', product: 'Sugar (Raw)', type: 'IN', qty: 500, from: 'Sri Balaji Sugar', to: 'Mumbai Plant Warehouse', ref: 'PO-2026-0156', partner: 'Sri Balaji Sugar', performedBy: 'Suresh Patil', reason: 'Purchase receipt', date: '2026-07-08 10:20' },
    { id: 'sm-003', product: 'Kaju Katli 500g', type: 'IN', qty: 500, from: 'Production Line 1', to: 'Mumbai Plant Warehouse', ref: 'MO-2026-0089', partner: null, performedBy: 'Anita Desai', reason: 'Production output', date: '2026-07-01 16:00' },
    { id: 'sm-004', product: 'Kaju Katli 500g', type: 'TRANSFER', qty: 358, from: 'Mumbai Plant Warehouse', to: 'Mumbai DC', ref: 'TO-2026-0042', partner: null, performedBy: 'Anita Desai', reason: 'Inter-warehouse transfer', date: '2026-07-03 10:00' },
    { id: 'sm-005', product: 'Kaju Katli 500g', type: 'OUT', qty: 100, from: 'Mumbai DC', to: 'Tata Consumer Products', ref: 'INV-2026-00892', partner: 'Tata Consumer', performedBy: 'Vikram Iyer', reason: 'Sales dispatch', date: '2026-07-05 14:00' },
    { id: 'sm-006', product: 'Kaju Katli 500g', type: 'OUT', qty: 48, from: 'Mumbai DC', to: 'Reliance Retail', ref: 'INV-2026-00915', partner: 'Reliance Retail', performedBy: 'Vikram Iyer', reason: 'Sales dispatch', date: '2026-07-06 11:30' },
    { id: 'sm-007', product: 'Kaju Katli 500g', type: 'RESERVATION', qty: 24, from: 'Mumbai DC', to: 'Mumbai DC (Reserved)', ref: 'SO-2026-0234', partner: 'Infosys', performedBy: 'Vikram Iyer', reason: 'Customer order reservation', date: '2026-07-08 09:00' },
  ]
  const typeColor: Record<string, string> = { IN: 'bg-emerald-100 text-emerald-800', OUT: 'bg-red-100 text-red-800', TRANSFER: 'bg-blue-100 text-blue-800', ADJUSTMENT: 'bg-amber-100 text-amber-800', RESERVATION: 'bg-indigo-100 text-indigo-800', ALLOCATION: 'bg-violet-100 text-violet-800', RELEASE: 'bg-pink-100 text-pink-800' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Stock Movement History</h3>
        <p className="text-xs text-muted-foreground mt-1">Tracks every movement: who, when, from, to, reason, reference. Supports forward and backward traceability.</p></div>
      </div>
      <div className="space-y-2">
        {movements.map(m => (
          <div key={m.id} className="border rounded-lg p-3 flex items-start gap-3">
            <span className={cn('inline-block px-2 py-1 rounded text-xs font-bold flex-shrink-0', typeColor[m.type])}>{m.type}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-medium text-sm">{m.product}</p>
                <Badge variant="outline" className="text-xs font-mono">{m.qty} units</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span className="font-medium text-foreground">{m.from}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="font-medium text-foreground">{m.to}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Ref: <span className="font-mono">{m.ref}</span> · {m.partner && `Partner: ${m.partner} · `}By: {m.performedBy} · {m.date}
              </p>
              <p className="text-xs text-muted-foreground">Reason: {m.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function InvJournalTab() {
  const entries = [
    { id: 'ij-001', entryNumber: 'IJ-2026-00284', txnNumber: 'INV-2026-00142', entryType: 'DEBIT', product: 'Cashew Nuts (Raw)', warehouse: 'Mumbai Plant Warehouse', qty: 200, unitCost: 850, totalValue: 170000, account: 'RAW_MATERIAL', offsetAccount: 'GRNI', ref: 'PO-2026-0142', postingDate: '2026-07-08 10:15' },
    { id: 'ij-002', entryNumber: 'IJ-2026-00285', txnNumber: 'INV-2026-00142', entryType: 'CREDIT', product: 'Cashew Nuts (Raw)', warehouse: 'Mumbai Plant Warehouse', qty: 200, unitCost: 850, totalValue: 170000, account: 'GRNI', offsetAccount: 'RAW_MATERIAL', ref: 'PO-2026-0142', postingDate: '2026-07-08 10:15' },
    { id: 'ij-003', entryNumber: 'IJ-2026-00286', txnNumber: 'INV-2026-00144', entryType: 'DEBIT', product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', qty: 500, unitCost: 350, totalValue: 175000, account: 'FINISHED_GOODS', offsetAccount: 'WIP', ref: 'MO-2026-0089', postingDate: '2026-07-01 16:00' },
    { id: 'ij-004', entryNumber: 'IJ-2026-00287', txnNumber: 'INV-2026-00144', entryType: 'CREDIT', product: 'Kaju Katli 500g', warehouse: 'Mumbai Plant Warehouse', qty: 500, unitCost: 350, totalValue: 175000, account: 'WIP', offsetAccount: 'FINISHED_GOODS', ref: 'MO-2026-0089', postingDate: '2026-07-01 16:00' },
    { id: 'ij-005', entryNumber: 'IJ-2026-00288', txnNumber: 'INV-2026-00146', entryType: 'CREDIT', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', qty: 100, unitCost: 540, totalValue: 54000, account: 'FINISHED_GOODS', offsetAccount: 'COGS', ref: 'INV-2026-00892', postingDate: '2026-07-05 14:00' },
    { id: 'ij-006', entryNumber: 'IJ-2026-00289', txnNumber: 'INV-2026-00146', entryType: 'DEBIT', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', qty: 100, unitCost: 540, totalValue: 54000, account: 'COGS', offsetAccount: 'FINISHED_GOODS', ref: 'INV-2026-00892', postingDate: '2026-07-05 14:00' },
  ]
  const typeColor: Record<string, string> = { DEBIT: 'bg-emerald-100 text-emerald-800', CREDIT: 'bg-red-100 text-red-800' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><Layers3 className="h-5 w-5" /> Inventory Journal (Immutable, Double-Entry)</h3>
        <p className="text-xs text-muted-foreground mt-1">Accounting-style immutable journal. Never edited. Never deleted. Only reversal entries. Every transaction creates paired DEBIT/CREDIT entries for inventory valuation.</p></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Entry #</th><th className="font-medium">Type</th>
            <th className="font-medium">Product</th><th className="font-medium text-right">Qty</th>
            <th className="font-medium text-right">Unit Cost</th><th className="font-medium text-right">Total Value</th>
            <th className="font-medium">Account</th><th className="font-medium">Offset Account</th>
            <th className="font-medium">Reference</th><th className="font-medium">Posted</th>
          </tr></thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id} className="border-b hover:bg-muted/40 font-mono text-xs">
                <td className="py-2.5">{e.entryNumber}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-bold', typeColor[e.entryType])}>{e.entryType}</span></td>
                <td className="font-sans font-medium">{e.product}</td>
                <td className="text-right">{e.qty}</td>
                <td className="text-right">₹{e.unitCost}</td>
                <td className="text-right font-semibold">₹{e.totalValue.toLocaleString('en-IN')}</td>
                <td><Badge variant="outline" className="text-xs">{e.account}</Badge></td>
                <td><Badge variant="outline" className="text-xs">{e.offsetAccount}</Badge></td>
                <td>{e.ref}</td>
                <td className="text-muted-foreground">{e.postingDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function InvAvailabilityTab() {
  const summary = {
    totalAvailable: 4904,
    totalReserved: 24,
    totalAllocated: 0,
    totalDamaged: 0,
    totalExpired: 56,
    totalInTransit: 0,
    totalUnits: 4984,
    totalValue: 516258,
  }
  const byProduct = [
    { product: 'Kaju Katli 500g', available: 328, reserved: 24, expired: 56, value: 142520 },
    { product: 'Soan Cake 1kg', available: 89, reserved: 0, expired: 0, value: 55625 },
    { product: 'Mixed Namkeen 200g', available: 1180, reserved: 0, expired: 0, value: 62540 },
    { product: 'Gulab Jamun 1kg', available: 412, reserved: 0, expired: 0, value: 125248 },
    { product: 'Cashew Nuts (Raw)', available: 35, reserved: 0, expired: 0, value: 29750 },
    { product: 'Sugar (Raw)', available: 28, reserved: 0, expired: 0, value: 1260 },
    { product: 'Ghee (Raw)', available: 12, reserved: 0, expired: 0, value: 6240 },
    { product: 'Packaging Boxes', available: 2840, reserved: 0, expired: 0, value: 34080 },
  ]
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><ActivityIcon className="h-5 w-5" /> Stock Availability Service</h3>
        <p className="text-xs text-muted-foreground mt-1">Shared service that every module calls instead of reading stock directly. Returns available, reserved, allocated, in-transit, and projected quantities.</p></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-4 mb-6">
        <div className="p-3 rounded-lg border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900">
          <p className="text-xs text-muted-foreground">Available</p>
          <p className="text-2xl font-bold text-emerald-600">{summary.totalAvailable.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-3 rounded-lg border bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
          <p className="text-xs text-muted-foreground">Reserved</p>
          <p className="text-2xl font-bold text-blue-600">{summary.totalReserved}</p>
        </div>
        <div className="p-3 rounded-lg border bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900">
          <p className="text-xs text-muted-foreground">Expired</p>
          <p className="text-2xl font-bold text-red-600">{summary.totalExpired}</p>
        </div>
        <div className="p-3 rounded-lg border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
          <p className="text-xs text-muted-foreground">Total Value</p>
          <p className="text-2xl font-bold text-amber-600">₹{summary.totalValue.toLocaleString('en-IN')}</p>
        </div>
      </div>
      <h4 className="font-semibold text-sm mb-3">Availability by Product</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Product</th>
            <th className="font-medium text-right">Available</th>
            <th className="font-medium text-right">Reserved</th>
            <th className="font-medium text-right">Expired</th>
            <th className="font-medium text-right">Value</th>
          </tr></thead>
          <tbody>
            {byProduct.map(p => (
              <tr key={p.product} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-medium">{p.product}</td>
                <td className="text-right font-mono font-semibold text-emerald-600">{p.available}</td>
                <td className="text-right font-mono text-blue-600">{p.reserved}</td>
                <td className="text-right font-mono text-red-600">{p.expired}</td>
                <td className="text-right font-mono">₹{p.value.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ─── Goods Receipt & Putaway Module (Sprint 13) ─────────
type GRNTab = 'overview' | 'grns' | 'putaway' | 'quality' | 'rules'

function GoodsReceiptModule() {
  const [tab, setTab] = useState<GRNTab>('overview')
  const tabs: Array<{ key: GRNTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Dashboard', icon: <Gauge className="h-4 w-4" /> },
    { key: 'grns', label: 'Goods Receipts', icon: <Truck className="h-4 w-4" /> },
    { key: 'putaway', label: 'Putaway Tasks', icon: <PackageOpen className="h-4 w-4" /> },
    { key: 'quality', label: 'Quality Holds', icon: <FlaskConical className="h-4 w-4" /> },
    { key: 'rules', label: 'Putaway Rules', icon: <ListChecks className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-cyan-950 via-blue-900 to-indigo-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Truck className="h-7 w-7" /> Goods Receipt & Intelligent Putaway Engine
            </h2>
            <p className="text-blue-200 text-sm max-w-3xl">
              The first real inventory operation — stock physically enters SUOP. Create GRNs, scan barcodes,
              verify supplier deliveries, assign batches, quality hold for inspection, intelligent putaway with
              FIFO/FEFO/ABC strategies, and automatic ledger posting.
            </p>
          </div>
          <Badge className="bg-cyan-500 text-cyan-950 hover:bg-cyan-500">Sprint 13</Badge>
        </div>
      </Card>

      <Card className="p-4 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-900">
        <div className="flex items-center gap-3 text-sm">
          <ShieldCheck className="h-5 w-5 text-cyan-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-cyan-900 dark:text-cyan-200">Receiving Flow (Food Manufacturing Best Practice)</p>
            <p className="text-xs text-cyan-700 dark:text-cyan-300 mt-0.5">
              Supplier Truck → Receiving Dock → Goods Receipt → Quality Check → Temporary Receiving Area → Putaway → Storage Bin → Available Stock. Stock is NOT available until quality release + putaway completion.
            </p>
          </div>
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

      {tab === 'overview' && <GRNOverviewTab />}
      {tab === 'grns' && <GRNListTab />}
      {tab === 'putaway' && <GRNPutawayTab />}
      {tab === 'quality' && <GRNQualityTab />}
      {tab === 'rules' && <GRNRulesTab />}
    </div>
  )
}

function GRNOverviewTab() {
  const stats = [
    { label: 'Total GRNs', value: '8', sub: '5 COMPLETED · 1 PENDING', icon: <Truck className="h-5 w-5 text-blue-600" /> },
    { label: "Today's Receipts", value: '3', sub: '5,393 units · ₹3.63L value', icon: <PackageCheckIcon className="h-5 w-5 text-emerald-600" /> },
    { label: 'Pending Putaway', value: '3', sub: 'Awaiting storage assignment', icon: <PackageOpen className="h-5 w-5 text-amber-600" /> },
    { label: 'Quality Holds (Active)', value: '2', sub: 'Ghee lab test + Customer return', icon: <FlaskConical className="h-5 w-5 text-red-600" /> },
    { label: 'Rejected Quantity', value: '5', sub: 'Cashew damaged in transit', icon: <AlertOctagon className="h-5 w-5 text-orange-600" /> },
    { label: 'Putaway Tasks', value: '6', sub: '4 COMPLETED · 1 IN PROGRESS · 1 PENDING', icon: <ClipboardCheck className="h-5 w-5 text-purple-600" /> },
    { label: 'Putaway Rules', value: '5', sub: 'FIFO, FEFO, ABC, ZONE, TEMPERATURE', icon: <ListChecks className="h-5 w-5 text-teal-600" /> },
    { label: 'Inventory Posted', value: '5/8', sub: 'Auto-posted to ledger on approval', icon: <BookOpen className="h-5 w-5 text-indigo-600" /> },
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
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Truck className="h-5 w-5" /> Receiving & Putaway Flow</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// 10 receipt types: Purchase, Manufacturing, Sales Return, Customer Return, Opening Stock, Inter-Branch, Warehouse Transfer, Stock Correction, Donation, Sample</p>
          <div className="space-y-1 pt-2">
            <p><Badge variant="outline" className="font-mono">1</Badge> <span className="text-blue-600">Supplier Delivery</span> arrives at Receiving Dock (vehicle, driver, gate entry)</p>
            <p><Badge variant="outline" className="font-mono">2</Badge> → Create <span className="text-cyan-600">Goods Receipt Note (GRN)</span> with line items (ordered vs received vs accepted vs rejected)</p>
            <p><Badge variant="outline" className="font-mono">3</Badge> → <span className="text-amber-600">Quality Hold</span> (if required) — stock held in quarantine until inspection</p>
            <p><Badge variant="outline" className="font-mono">4</Badge> → <span className="text-purple-600">Putaway Engine</span> suggests storage bin based on rules (FIFO/FEFO/ABC/Zone/Temperature)</p>
            <p><Badge variant="outline" className="font-mono">5</Badge> → Warehouse operator completes <span className="text-indigo-600">Putaway Task</span> — stock moved to storage bin</p>
            <p><Badge variant="outline" className="font-mono">6</Badge> → <span className="text-emerald-600">Inventory Ledger</span> auto-posted — stock becomes AVAILABLE</p>
            <p><Badge variant="outline" className="font-mono">7</Badge> → <span className="text-pink-600">Finance</span> notified — GRNI account credited, Raw Material account debited</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function GRNListTab() {
  const grns = [
    { id: 'gr-001', grnNumber: 'GRN-2026-00142', type: 'PURCHASE_RECEIPT', date: '2026-07-08', supplier: 'Konkan Cashew Processors', ref: 'PO-2026-0142', warehouse: 'Mumbai Plant Warehouse', vehicle: 'MH-12-AB-4521', status: 'COMPLETED', qualityHold: true, qualityStatus: 'APPROVED', lines: 3, ordered: 380, received: 380, accepted: 380, rejected: 0, value: 114000, posted: true, putaway: true, receivedBy: 'Suresh Patil' },
    { id: 'gr-002', grnNumber: 'GRN-2026-00143', type: 'PURCHASE_RECEIPT', date: '2026-07-08', supplier: 'Sri Balaji Sugar', ref: 'PO-2026-0156', warehouse: 'Mumbai Plant Warehouse', vehicle: 'AP-09-CD-8832', status: 'COMPLETED', qualityHold: false, qualityStatus: 'APPROVED', lines: 1, ordered: 500, received: 500, accepted: 500, rejected: 0, value: 25000, posted: true, putaway: true, receivedBy: 'Suresh Patil' },
    { id: 'gr-003', grnNumber: 'GRN-2026-00144', type: 'MANUFACTURING_RECEIPT', date: '2026-07-01', supplier: null, ref: 'MO-2026-0089', warehouse: 'Mumbai Plant Warehouse', vehicle: null, status: 'COMPLETED', qualityHold: true, qualityStatus: 'APPROVED', lines: 1, ordered: 500, received: 500, accepted: 500, rejected: 0, value: 175000, posted: true, putaway: true, receivedBy: 'Anita Desai' },
    { id: 'gr-004', grnNumber: 'GRN-2026-00145', type: 'PURCHASE_RECEIPT', date: '2026-07-09', supplier: 'Amul', ref: 'PO-2026-0178', warehouse: 'Mumbai Plant Warehouse', vehicle: 'GJ-01-EF-1192', status: 'APPROVED', qualityHold: true, qualityStatus: 'INSPECTION', lines: 2, ordered: 100, received: 98, accepted: 0, rejected: 0, value: 52000, posted: false, putaway: false, receivedBy: 'Suresh Patil' },
    { id: 'gr-005', grnNumber: 'GRN-2026-00146', type: 'PURCHASE_RECEIPT', date: '2026-07-09', supplier: 'Mumbai Packaging Solutions', ref: 'PO-2026-0203', warehouse: 'Mumbai Plant Warehouse', vehicle: 'MH-04-GH-7745', status: 'PUTAWAY_IN_PROGRESS', qualityHold: false, qualityStatus: 'APPROVED', lines: 1, ordered: 5000, received: 5000, accepted: 5000, rejected: 0, value: 60000, posted: true, putaway: false, receivedBy: 'Suresh Patil' },
    { id: 'gr-006', grnNumber: 'GRN-2026-00147', type: 'SALES_RETURN', date: '2026-07-07', supplier: null, ref: 'INV-2026-00789', warehouse: 'Mumbai DC', vehicle: null, status: 'APPROVED', qualityHold: true, qualityStatus: 'PENDING', lines: 1, ordered: 0, received: 24, accepted: 0, rejected: 0, value: 12960, posted: false, putaway: false, receivedBy: 'Vikram Iyer' },
    { id: 'gr-007', grnNumber: 'GRN-2026-00148', type: 'PURCHASE_RECEIPT', date: '2026-07-09', supplier: 'Konkan Cashew Processors', ref: 'PO-2026-0210', warehouse: 'Mumbai Plant Warehouse', vehicle: 'MH-12-AB-4521', status: 'PENDING_APPROVAL', qualityHold: true, qualityStatus: 'PENDING', lines: 2, ordered: 300, received: 295, accepted: 0, rejected: 5, value: 250750, posted: false, putaway: false, receivedBy: 'Suresh Patil' },
    { id: 'gr-008', grnNumber: 'GRN-2026-00149', type: 'OPENING_STOCK', date: '2026-01-01', supplier: null, ref: 'OS-2026-001', warehouse: 'Mumbai Plant Warehouse', vehicle: null, status: 'COMPLETED', qualityHold: false, qualityStatus: 'APPROVED', lines: 12, ordered: 0, received: 2400, accepted: 2400, rejected: 0, value: 840000, posted: true, putaway: true, receivedBy: 'System' },
  ]
  const typeColor: Record<string, string> = {
    PURCHASE_RECEIPT: 'bg-blue-100 text-blue-800', MANUFACTURING_RECEIPT: 'bg-emerald-100 text-emerald-800',
    SALES_RETURN: 'bg-purple-100 text-purple-800', CUSTOMER_RETURN: 'bg-pink-100 text-pink-800',
    OPENING_STOCK: 'bg-slate-100 text-slate-800', INTER_BRANCH_RECEIPT: 'bg-cyan-100 text-cyan-800',
    WAREHOUSE_TRANSFER_RECEIPT: 'bg-indigo-100 text-indigo-800', STOCK_CORRECTION: 'bg-amber-100 text-amber-800',
    DONATION_RECEIPT: 'bg-teal-100 text-teal-800', SAMPLE_RECEIPT: 'bg-violet-100 text-violet-800',
  }
  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', APPROVED: 'bg-blue-600 hover:bg-blue-600', PUTAWAY_IN_PROGRESS: 'bg-amber-500 hover:bg-amber-500', PENDING_APPROVAL: 'bg-orange-500 hover:bg-orange-500', DRAFT: 'bg-slate-500 hover:bg-slate-500', REJECTED: 'bg-red-600 hover:bg-red-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Goods Receipt Notes (GRN)</h3>
        <p className="text-xs text-muted-foreground mt-1">10 receipt types. Each GRN tracks ordered vs received vs accepted vs rejected quantities. Quality hold separates receiving from putaway for food safety.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New GRN</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">GRN #</th><th className="font-medium">Type</th>
            <th className="font-medium">Date</th><th className="font-medium">Supplier / Source</th>
            <th className="font-medium">Reference</th><th className="font-medium">Warehouse</th>
            <th className="font-medium text-right">Ordered</th><th className="font-medium text-right">Received</th>
            <th className="font-medium text-right">Accepted</th><th className="font-medium text-right">Rejected</th>
            <th className="font-medium text-right">Value</th><th className="font-medium">Quality</th>
            <th className="font-medium">Posted</th><th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {grns.map(g => (
              <tr key={g.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{g.grnNumber}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[g.type])}>{g.type.replace(/_/g, ' ')}</span></td>
                <td className="text-xs text-muted-foreground">{g.date}</td>
                <td className="text-xs">{g.supplier || <span className="text-muted-foreground">—</span>}</td>
                <td className="font-mono text-xs">{g.ref}</td>
                <td className="text-xs">{g.warehouse}</td>
                <td className="text-right font-mono">{g.ordered || '—'}</td>
                <td className="text-right font-mono">{g.received}</td>
                <td className="text-right font-mono text-emerald-600">{g.accepted || '—'}</td>
                <td className="text-right font-mono text-red-600">{g.rejected || '—'}</td>
                <td className="text-right font-mono">₹{g.value.toLocaleString('en-IN')}</td>
                <td>{g.qualityHold ? <Badge variant="outline" className="text-xs">{g.qualityStatus}</Badge> : <Badge variant="outline" className="text-xs text-emerald-600">N/A</Badge>}</td>
                <td className="text-center">{g.posted ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <Clock className="h-4 w-4 text-amber-500 mx-auto" />}</td>
                <td><Badge className={statusColor[g.status] + ' text-xs'}>{g.status.replace(/_/g, ' ')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function GRNPutawayTab() {
  const tasks = [
    { id: 'pt-001', taskNumber: 'PT-2026-00142', grnNumber: 'GRN-2026-00142', product: 'Cashew Nuts (Raw)', batch: null, qty: 200, from: 'Receiving Dock 1', to: 'Zone A - Rack A1, Bin 03', zone: 'Zone A - Raw Materials', strategy: 'FIFO', status: 'COMPLETED', assignedTo: 'Ramesh Yadav', completedAt: '2026-07-08 11:30' },
    { id: 'pt-002', taskNumber: 'PT-2026-00143', grnNumber: 'GRN-2026-00142', product: 'Sugar (Raw)', batch: null, qty: 150, from: 'Receiving Dock 1', to: 'Zone A - Rack A2, Bin 01', zone: 'Zone A - Raw Materials', strategy: 'FIFO', status: 'COMPLETED', assignedTo: 'Ramesh Yadav', completedAt: '2026-07-08 11:45' },
    { id: 'pt-003', taskNumber: 'PT-2026-00144', grnNumber: 'GRN-2026-00142', product: 'Ghee (Raw)', batch: null, qty: 30, from: 'Receiving Dock 1', to: 'Zone C - Cold Storage, Rack C1', zone: 'Zone C - Cold Storage', strategy: 'FEFO', status: 'COMPLETED', assignedTo: 'Ramesh Yadav', completedAt: '2026-07-08 12:00' },
    { id: 'pt-004', taskNumber: 'PT-2026-00145', grnNumber: 'GRN-2026-00144', product: 'Kaju Katli 500g', batch: 'KK-2607-01', qty: 500, from: 'Production Line 1', to: 'Zone C - Cold Storage, Rack C2', zone: 'Zone C - Cold Storage', strategy: 'FEFO', status: 'COMPLETED', assignedTo: 'Ramesh Yadav', completedAt: '2026-07-01 17:00' },
    { id: 'pt-005', taskNumber: 'PT-2026-00146', grnNumber: 'GRN-2026-00146', product: 'Packaging Boxes', batch: null, qty: 5000, from: 'Receiving Dock 2', to: 'Zone B - Rack B1, Bin 01-05', zone: 'Zone B - Packaging Bulk', strategy: 'ZONE', status: 'IN_PROGRESS', assignedTo: 'Sandeep Kumar', completedAt: null },
    { id: 'pt-006', taskNumber: 'PT-2026-00147', grnNumber: 'GRN-2026-00145', product: 'Ghee (Raw)', batch: null, qty: 98, from: 'Receiving Dock 1', to: 'PENDING - Quality Hold', zone: null, strategy: 'FEFO', status: 'PENDING', assignedTo: null, completedAt: null },
  ]
  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', IN_PROGRESS: 'bg-blue-600 hover:bg-blue-600', PENDING: 'bg-amber-500 hover:bg-amber-500', ASSIGNED: 'bg-cyan-600 hover:bg-cyan-600', CANCELLED: 'bg-red-600 hover:bg-red-600' }
  const strategyColor: Record<string, string> = { FIFO: 'bg-blue-100 text-blue-800', FEFO: 'bg-emerald-100 text-emerald-800', ABC: 'bg-purple-100 text-purple-800', ZONE: 'bg-amber-100 text-amber-800', TEMPERATURE: 'bg-cyan-100 text-cyan-800', MANUAL: 'bg-slate-100 text-slate-800' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Putaway Tasks</h3>
        <p className="text-xs text-muted-foreground mt-1">Intelligent putaway engine suggests storage bins based on product type, temperature zone, and strategy (FIFO/FEFO/ABC/Zone). Operators complete tasks by moving stock to assigned bins.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Generate Tasks</Button>
      </div>
      <div className="space-y-3">
        {tasks.map(t => (
          <div key={t.id} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-mono text-xs">{t.taskNumber}</p>
                  <Badge variant="outline" className="text-xs">{t.grnNumber}</Badge>
                  <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', strategyColor[t.strategy])}>{t.strategy}</span>
                </div>
                <p className="font-medium">{t.product}{t.batch && <span className="text-muted-foreground ml-2 text-xs">Batch: {t.batch}</span>}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Badge variant="outline" className="text-xs font-mono">{t.qty} units</Badge>
                  <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{t.from}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{t.to}</span>
                </div>
              </div>
              <div className="text-right">
                <Badge className={statusColor[t.status] + ' text-xs'}>{t.status.replace(/_/g, ' ')}</Badge>
                {t.assignedTo && <p className="text-xs text-muted-foreground mt-1">{t.assignedTo}</p>}
                {t.completedAt && <p className="text-xs text-muted-foreground">{t.completedAt}</p>}
              </div>
            </div>
            {t.status !== 'COMPLETED' && t.status !== 'PENDING' && (
              <Button size="sm" variant="outline" className="h-7 text-xs mt-1"><CheckCircle2 className="mr-1 h-3 w-3" /> Complete Putaway</Button>
            )}
            {t.status === 'PENDING' && t.to.includes('Quality Hold') && (
              <p className="text-xs text-amber-600 mt-1">⚠ Blocked by quality hold — cannot putaway until inspection complete</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function GRNQualityTab() {
  const holds = [
    { id: 'qh-001', holdNumber: 'QH-2026-0012', grnNumber: 'GRN-2026-00145', product: 'Ghee (Raw)', batch: null, qtyHeld: 98, reason: 'QUALITY_CHECK', inspectionType: 'LAB_TEST', result: 'PENDING', status: 'ACTIVE', resolution: 'PENDING', createdBy: 'Suresh Patil', notes: 'Sample sent to external lab for adulteration test' },
    { id: 'qh-002', holdNumber: 'QH-2026-0013', grnNumber: 'GRN-2026-00147', product: 'Customer Return Kaju Katli', batch: 'KK-2606-05', qtyHeld: 24, reason: 'SUPPLIER_ISSUE', inspectionType: 'VISUAL', result: 'PENDING', status: 'ACTIVE', resolution: 'PENDING', createdBy: 'Vikram Iyer', notes: 'Customer returned - taste deviation complaint. Awaiting investigation.' },
    { id: 'qh-003', holdNumber: 'QH-2026-0011', grnNumber: 'GRN-2026-00142', product: 'Cashew Nuts (Raw)', batch: null, qtyHeld: 200, reason: 'QUALITY_CHECK', inspectionType: 'SAMPLE_TEST', result: 'PASSED', status: 'RESOLVED', resolution: 'RELEASED', releasedQty: 200, rejectedQty: 0, createdBy: 'Suresh Patil', resolvedBy: 'Anita Desai', notes: 'Sample tested - quality approved. Released for production.' },
    { id: 'qh-004', holdNumber: 'QH-2026-0010', grnNumber: 'GRN-2026-00144', product: 'Kaju Katli 500g', batch: 'KK-2607-01', qtyHeld: 500, reason: 'QUALITY_CHECK', inspectionType: 'VISUAL', result: 'PASSED', status: 'RESOLVED', resolution: 'RELEASED', releasedQty: 500, rejectedQty: 0, createdBy: 'Anita Desai', resolvedBy: 'Anita Desai', notes: 'Production batch quality check passed. Grade A.' },
    { id: 'qh-005', holdNumber: 'QH-2026-0014', grnNumber: 'GRN-2026-00147', product: 'Cashew Nuts (Raw)', batch: null, qtyHeld: 5, reason: 'DAMAGE_SUSPECTED', inspectionType: 'VISUAL', result: 'FAILED', status: 'RESOLVED', resolution: 'REJECTED', releasedQty: 0, rejectedQty: 5, createdBy: 'Suresh Patil', resolvedBy: 'Anita Desai', notes: '5 units damaged in transit - packaging crushed. Rejected and scrapped.' },
  ]
  const reasonColor: Record<string, string> = { QUALITY_CHECK: 'bg-blue-100 text-blue-800', SUPPLIER_ISSUE: 'bg-amber-100 text-amber-800', DAMAGE_SUSPECTED: 'bg-orange-100 text-orange-800', EXPIRY_CHECK: 'bg-red-100 text-red-800', SPEC_VERIFICATION: 'bg-purple-100 text-purple-800', RANDOM_SAMPLE: 'bg-teal-100 text-teal-800' }
  const resultColor: Record<string, string> = { PENDING: 'text-amber-600', PASSED: 'text-emerald-600', FAILED: 'text-red-600', CONDITIONAL_PASS: 'text-blue-600' }
  const statusColor: Record<string, string> = { ACTIVE: 'bg-red-600 hover:bg-red-600', RESOLVED: 'bg-emerald-600 hover:bg-emerald-600', CANCELLED: 'bg-gray-500 hover:bg-gray-500' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><FlaskConical className="h-5 w-5" /> Quality Hold Management</h3>
        <p className="text-xs text-muted-foreground mt-1">6 hold reasons: Quality Check, Supplier Issue, Damage Suspected, Expiry Check, Spec Verification, Random Sample. Stock held in quarantine until released, rejected, or scrapped.</p></div>
      </div>
      <div className="space-y-3">
        {holds.map(h => (
          <div key={h.id} className={cn('border rounded-lg p-3', h.status === 'ACTIVE' && 'border-red-200 bg-red-50/50 dark:bg-red-950/20')}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-mono text-xs">{h.holdNumber}</p>
                  <Badge variant="outline" className="text-xs">{h.grnNumber}</Badge>
                  <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', reasonColor[h.reason])}>{h.reason.replace(/_/g, ' ')}</span>
                  <Badge variant="outline" className="text-xs">{h.inspectionType.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="font-medium">{h.product}{h.batch && <span className="text-muted-foreground ml-2 text-xs">Batch: {h.batch}</span>}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Quantity held: <span className="font-mono font-semibold text-foreground">{h.qtyHeld}</span> units</p>
                {h.notes && <p className="text-xs text-muted-foreground mt-1">{h.notes}</p>}
              </div>
              <div className="text-right">
                <Badge className={statusColor[h.status] + ' text-xs'}>{h.status}</Badge>
                <p className="text-xs mt-1">Result: <span className={cn('font-semibold', resultColor[h.result || 'PENDING'])}>{h.result || 'PENDING'}</span></p>
                <p className="text-xs text-muted-foreground">{h.resolution.replace(/_/g, ' ')}</p>
              </div>
            </div>
            {h.status === 'RESOLVED' && (
              <div className="flex items-center gap-3 text-xs pt-2 border-t">
                <span>Released: <span className="font-mono font-semibold text-emerald-600">{h.releasedQty || 0}</span></span>
                <span>Rejected: <span className="font-mono font-semibold text-red-600">{h.rejectedQty || 0}</span></span>
                <span className="text-muted-foreground">By: {h.resolvedBy}</span>
              </div>
            )}
            {h.status === 'ACTIVE' && (
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="default" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" />Release</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-300">Reject</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">Partial Release</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function GRNRulesTab() {
  const rules = [
    { code: 'PA-RAW-FIFO', name: 'Raw Materials → FIFO Zone A', strategy: 'FIFO', productType: 'RAW_MATERIAL', targetZone: 'Zone A - Raw Materials', tempZone: 'AMBIENT', priority: 50, status: 'ACTIVE' },
    { code: 'PA-FG-FEFO', name: 'Finished Goods → FEFO Cold Storage', strategy: 'FEFO', productType: 'FINISHED_GOOD', targetZone: 'Zone C - Cold Storage', tempZone: 'REFRIGERATED', priority: 30, status: 'ACTIVE' },
    { code: 'PA-PKG-ZONE', name: 'Packaging → Zone B Bulk', strategy: 'ZONE', productType: 'PACKAGING', targetZone: 'Zone B - Packaging Bulk', tempZone: 'AMBIENT', priority: 100, status: 'ACTIVE' },
    { code: 'PA-ABC-HIGH', name: 'High-Value Items → Secure Zone', strategy: 'ABC', productType: 'FINISHED_GOOD', targetZone: 'Zone D - Secure', tempZone: 'AMBIENT', priority: 20, status: 'ACTIVE' },
    { code: 'PA-FROZEN', name: 'Frozen Items → Freezer Zone', strategy: 'TEMPERATURE', productType: 'FINISHED_GOOD', targetZone: 'Zone E - Freezer', tempZone: 'FROZEN', priority: 10, status: 'ACTIVE' },
  ]
  const strategyColor: Record<string, string> = { FIFO: 'bg-blue-100 text-blue-800', FEFO: 'bg-emerald-100 text-emerald-800', ABC: 'bg-purple-100 text-purple-800', ZONE: 'bg-amber-100 text-amber-800', TEMPERATURE: 'bg-cyan-100 text-cyan-800', MANUAL: 'bg-slate-100 text-slate-800' }
  const tempColor: Record<string, string> = { AMBIENT: 'text-amber-600', REFRIGERATED: 'text-blue-600', FROZEN: 'text-cyan-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Putaway Rules</h3>
        <p className="text-xs text-muted-foreground mt-1">5 strategies: FIFO (First In First Out), FEFO (First Expiry First Out), ABC (High-value secure), ZONE (by product type), TEMPERATURE (cold chain). Rules matched by priority — lower number = higher priority.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Rule</Button>
      </div>
      <div className="space-y-3">
        {rules.map(r => (
          <div key={r.code} className="border rounded-lg p-3 flex items-center gap-3">
            <span className={cn('inline-block px-3 py-1 rounded text-xs font-bold flex-shrink-0', strategyColor[r.strategy])}>{r.strategy}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-mono text-xs text-muted-foreground">{r.code}</p>
                <p className="font-medium">{r.name}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Product type: <span className="font-medium text-foreground">{r.productType.replace(/_/g, ' ')}</span></span>
                <span>·</span>
                <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{r.targetZone}</span>
                <span>·</span>
                <span className={cn('font-medium', tempColor[r.tempZone])}>{r.tempZone}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-muted-foreground">Priority</p>
              <p className="font-mono font-bold text-lg">{r.priority}</p>
            </div>
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-xs flex-shrink-0">{r.status}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Stock Issue & Outbound Module (Sprint 14) ──────────
type SITab = 'overview' | 'issues' | 'picking' | 'scrap' | 'damage'

function StockIssueModule() {
  const [tab, setTab] = useState<SITab>('overview')
  const tabs: Array<{ key: SITab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Dashboard', icon: <Gauge className="h-4 w-4" /> },
    { key: 'issues', label: 'Stock Issues', icon: <ArrowUpFromLine className="h-4 w-4" /> },
    { key: 'picking', label: 'Picking Tasks', icon: <ClipboardCheck className="h-4 w-4" /> },
    { key: 'scrap', label: 'Scrap Records', icon: <Trash2 className="h-4 w-4" /> },
    { key: 'damage', label: 'Damage Records', icon: <AlertTriangleIcon className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-rose-950 via-red-900 to-orange-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ArrowUpFromLine className="h-7 w-7" /> Stock Issue & Outbound Engine
            </h2>
            <p className="text-rose-200 text-sm max-w-3xl">
              Every movement where inventory leaves stock — production issues, kitchen issues, sales issues,
              samples, scrap, damage, internal consumption, returns to supplier. Barcode-based picking with
              FIFO/FEFO strategies. Automatic ledger posting on issue.
            </p>
          </div>
          <Badge className="bg-rose-500 text-rose-950 hover:bg-rose-500">Sprint 14</Badge>
        </div>
      </Card>

      <Card className="p-4 bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900">
        <div className="flex items-center gap-3 text-sm">
          <ShieldCheck className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-rose-900 dark:text-rose-200">Outbound Flow (Issue Request → Picking → Issue)</p>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
              Production Order → Issue Request → Warehouse Approval → Picking Task → Barcode Scan → Stock Issue → Production → Consumption → Inventory Ledger. No unauthorized stock withdrawals.
            </p>
          </div>
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

      {tab === 'overview' && <SIOverviewTab />}
      {tab === 'issues' && <SIListTab />}
      {tab === 'picking' && <SIPickingTab />}
      {tab === 'scrap' && <SIScrapTab />}
      {tab === 'damage' && <SIDamageTab />}
    </div>
  )
}

function SIOverviewTab() {
  const stats = [
    { label: 'Total Issues', value: '8', sub: '6 ISSUED · 1 PICKING · 1 PENDING', icon: <ArrowUpFromLine className="h-5 w-5 text-blue-600" /> },
    { label: "Today's Issues", value: '2', sub: '285 units · ₹0 (in progress)', icon: <PackageCheckIcon className="h-5 w-5 text-emerald-600" /> },
    { label: 'Pending Approval', value: '1', sub: 'Kitchen issue - Chef Rajesh', icon: <ClipboardCheck className="h-5 w-5 text-amber-600" /> },
    { label: 'Picking In Progress', value: '1', sub: 'PK-2026-00237 · 120/250 picked', icon: <ClipboardCheck className="h-5 w-5 text-purple-600" /> },
    { label: 'Scrap Records', value: '5', sub: '1 pending approval (₹19,320)', icon: <Trash2 className="h-5 w-5 text-red-600" /> },
    { label: 'Damage Records', value: '4', sub: '1 under review', icon: <AlertTriangleIcon className="h-5 w-5 text-orange-600" /> },
    { label: 'Total Scrap Value', value: '₹28,881', sub: 'Across 5 scrap records', icon: <IndianRupee className="h-5 w-5 text-red-600" /> },
    { label: 'Total Damage Value', value: '₹20,006', sub: '₹4,250 insurance claimable', icon: <IndianRupee className="h-5 w-5 text-orange-600" /> },
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
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ArrowUpFromLine className="h-5 w-5" /> Outbound Issue Flow</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// 11 issue types: Production, Kitchen, Sales, Sample, Damage, Scrap, Internal Consumption, Maintenance, Transfer, Return to Supplier, Adjustment</p>
          <div className="space-y-1 pt-2">
            <p><Badge variant="outline" className="font-mono">1</Badge> <span className="text-blue-600">Stock Request</span> from Production Order / Sales Order / Material Requisition</p>
            <p><Badge variant="outline" className="font-mono">2</Badge> → <span className="text-amber-600">Warehouse Approval</span> — prevents unauthorized withdrawals</p>
            <p><Badge variant="outline" className="font-mono">3</Badge> → <span className="text-purple-600">Picking Task</span> generated with FIFO/FEFO/Zone strategy</p>
            <p><Badge variant="outline" className="font-mono">4</Badge> → <span className="text-cyan-600">Barcode Scan</span> — validates product, batch, location, quantity</p>
            <p><Badge variant="outline" className="font-mono">5</Badge> → <span className="text-emerald-600">Stock Issue</span> posted — inventory ledger auto-updated</p>
            <p><Badge variant="outline" className="font-mono">6</Badge> → <span className="text-indigo-600">Material Consumption</span> tracked for production costing</p>
            <p><Badge variant="outline" className="font-mono">7</Badge> → <span className="text-pink-600">Finance</span> notified — COGS/WIP accounts updated</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function SIListTab() {
  const issues = [
    { id: 'si-001', number: 'SI-2026-00234', type: 'PRODUCTION_ISSUE', date: '2026-07-01', ref: 'MO-2026-0089', warehouse: 'Mumbai Plant Warehouse', destination: 'Production Line 1', status: 'ISSUED', lines: 3, requested: 180, issued: 180, value: 153000, posted: true, picking: true, requestedBy: 'Anita Desai', approvedBy: 'Anita Desai' },
    { id: 'si-002', number: 'SI-2026-00235', type: 'SALES_ISSUE', date: '2026-07-05', ref: 'INV-2026-00892', warehouse: 'Mumbai DC', destination: 'Tata Consumer Products', status: 'ISSUED', lines: 1, requested: 100, issued: 100, value: 54000, posted: true, picking: true, requestedBy: 'Vikram Iyer', approvedBy: 'Vikram Iyer' },
    { id: 'si-003', number: 'SI-2026-00236', type: 'SALES_ISSUE', date: '2026-07-06', ref: 'INV-2026-00915', warehouse: 'Mumbai DC', destination: 'Reliance Retail', status: 'ISSUED', lines: 1, requested: 48, issued: 48, value: 25920, posted: true, picking: true, requestedBy: 'Vikram Iyer', approvedBy: 'Vikram Iyer' },
    { id: 'si-004', number: 'SI-2026-00237', type: 'PRODUCTION_ISSUE', date: '2026-07-09', ref: 'MO-2026-0095', warehouse: 'Mumbai Plant Warehouse', destination: 'Production Line 2', status: 'PICKING_IN_PROGRESS', lines: 4, requested: 250, issued: 0, value: 0, posted: false, picking: false, requestedBy: 'Anita Desai', approvedBy: 'Anita Desai' },
    { id: 'si-005', number: 'SI-2026-00238', type: 'KITCHEN_ISSUE', date: '2026-07-09', ref: 'MR-2026-0042', warehouse: 'Mumbai Plant Warehouse', destination: 'Restaurant Kitchen', status: 'PENDING_APPROVAL', lines: 5, requested: 35, issued: 0, value: 0, posted: false, picking: false, requestedBy: 'Chef Rajesh', approvedBy: null },
    { id: 'si-006', number: 'SI-2026-00239', type: 'INTERNAL_CONSUMPTION', date: '2026-07-08', ref: 'MR-2026-0039', warehouse: 'Mumbai Plant Warehouse', destination: 'Maintenance Dept', status: 'ISSUED', lines: 2, requested: 12, issued: 12, value: 3400, posted: true, picking: true, requestedBy: 'Maintenance Team', approvedBy: 'Anita Desai' },
    { id: 'si-007', number: 'SI-2026-00240', type: 'SAMPLE_ISSUE', date: '2026-07-07', ref: 'MR-2026-0036', warehouse: 'Mumbai DC', destination: 'Sales Team (Trade Show)', status: 'ISSUED', lines: 3, requested: 15, issued: 15, value: 8100, posted: true, picking: true, requestedBy: 'Vikram Iyer', approvedBy: 'Vikram Iyer' },
    { id: 'si-008', number: 'SI-2026-00241', type: 'RETURN_TO_SUPPLIER', date: '2026-07-06', ref: 'PR-2026-0012', warehouse: 'Mumbai Plant Warehouse', destination: 'Sri Balaji Sugar', status: 'ISSUED', lines: 1, requested: 50, issued: 50, value: 2250, posted: true, picking: true, requestedBy: 'Suresh Patil', approvedBy: 'Anita Desai' },
  ]
  const typeColor: Record<string, string> = {
    PRODUCTION_ISSUE: 'bg-blue-100 text-blue-800', KITCHEN_ISSUE: 'bg-orange-100 text-orange-800',
    SALES_ISSUE: 'bg-purple-100 text-purple-800', SAMPLE_ISSUE: 'bg-teal-100 text-teal-800',
    DAMAGE_ISSUE: 'bg-red-100 text-red-800', SCRAP_ISSUE: 'bg-gray-100 text-gray-800',
    INTERNAL_CONSUMPTION: 'bg-amber-100 text-amber-800', MAINTENANCE_ISSUE: 'bg-cyan-100 text-cyan-800',
    TRANSFER_ISSUE: 'bg-indigo-100 text-indigo-800', RETURN_TO_SUPPLIER: 'bg-pink-100 text-pink-800',
    ADJUSTMENT_ISSUE: 'bg-slate-100 text-slate-800',
  }
  const statusColor: Record<string, string> = { ISSUED: 'bg-emerald-600 hover:bg-emerald-600', PICKING_IN_PROGRESS: 'bg-blue-600 hover:bg-blue-600', PENDING_APPROVAL: 'bg-amber-500 hover:bg-amber-500', DRAFT: 'bg-slate-500 hover:bg-slate-500', REJECTED: 'bg-red-600 hover:bg-red-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Stock Issues</h3>
        <p className="text-xs text-muted-foreground mt-1">11 issue types. Each issue tracks requested vs issued quantities. Picking required before issue. Auto-posts to inventory ledger on completion.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Issue</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Issue #</th><th className="font-medium">Type</th>
            <th className="font-medium">Date</th><th className="font-medium">Reference</th>
            <th className="font-medium">Warehouse</th><th className="font-medium">Destination</th>
            <th className="font-medium text-right">Requested</th><th className="font-medium text-right">Issued</th>
            <th className="font-medium text-right">Value</th><th className="font-medium">Posted</th>
            <th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {issues.map(i => (
              <tr key={i.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{i.number}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[i.type])}>{i.type.replace(/_/g, ' ')}</span></td>
                <td className="text-xs text-muted-foreground">{i.date}</td>
                <td className="font-mono text-xs">{i.ref}</td>
                <td className="text-xs">{i.warehouse}</td>
                <td className="text-xs">{i.destination}</td>
                <td className="text-right font-mono">{i.requested}</td>
                <td className="text-right font-mono text-emerald-600">{i.issued || '—'}</td>
                <td className="text-right font-mono">{i.value > 0 ? `₹${i.value.toLocaleString('en-IN')}` : '—'}</td>
                <td className="text-center">{i.posted ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <Clock className="h-4 w-4 text-amber-500 mx-auto" />}</td>
                <td><Badge className={statusColor[i.status] + ' text-xs'}>{i.status.replace(/_/g, ' ')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function SIPickingTab() {
  const tasks = [
    { id: 'pk-001', taskNumber: 'PK-2026-00234', issueNumber: 'SI-2026-00234', strategy: 'FEFO', warehouse: 'Mumbai Plant Warehouse', zone: 'Zone A - Raw Materials', status: 'COMPLETED', totalLines: 3, pickedLines: 3, totalQty: 180, pickedQty: 180, assignedTo: 'Ramesh Yadav', duration: 18, completedAt: '2026-07-01 08:18' },
    { id: 'pk-002', taskNumber: 'PK-2026-00235', issueNumber: 'SI-2026-00235', strategy: 'FEFO', warehouse: 'Mumbai DC', zone: 'Zone C - Cold Storage', status: 'COMPLETED', totalLines: 1, pickedLines: 1, totalQty: 100, pickedQty: 100, assignedTo: 'Ramesh Yadav', duration: 8, completedAt: '2026-07-05 13:50' },
    { id: 'pk-003', taskNumber: 'PK-2026-00236', issueNumber: 'SI-2026-00236', strategy: 'FEFO', warehouse: 'Mumbai DC', zone: 'Zone C - Cold Storage', status: 'COMPLETED', totalLines: 1, pickedLines: 1, totalQty: 48, pickedQty: 48, assignedTo: 'Ramesh Yadav', duration: 6, completedAt: '2026-07-06 11:20' },
    { id: 'pk-004', taskNumber: 'PK-2026-00237', issueNumber: 'SI-2026-00237', strategy: 'FIFO', warehouse: 'Mumbai Plant Warehouse', zone: 'Zone A - Raw Materials', status: 'IN_PROGRESS', totalLines: 4, pickedLines: 2, totalQty: 250, pickedQty: 120, assignedTo: 'Sandeep Kumar', duration: null, completedAt: null },
    { id: 'pk-005', taskNumber: 'PK-2026-00240', issueNumber: 'SI-2026-00240', strategy: 'FEFO', warehouse: 'Mumbai Plant Warehouse', zone: 'Zone A - Raw Materials', status: 'COMPLETED', totalLines: 1, pickedLines: 1, totalQty: 50, pickedQty: 50, assignedTo: 'Ramesh Yadav', duration: 5, completedAt: '2026-07-06 15:30' },
  ]
  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', IN_PROGRESS: 'bg-blue-600 hover:bg-blue-600', PENDING: 'bg-amber-500 hover:bg-amber-500', ASSIGNED: 'bg-cyan-600 hover:bg-cyan-600' }
  const strategyColor: Record<string, string> = { FIFO: 'bg-blue-100 text-blue-800', FEFO: 'bg-emerald-100 text-emerald-800', NEAREST_BIN: 'bg-amber-100 text-amber-800', WAVE: 'bg-purple-100 text-purple-800', ZONE: 'bg-cyan-100 text-cyan-800', PRIORITY: 'bg-pink-100 text-pink-800' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Picking Tasks</h3>
        <p className="text-xs text-muted-foreground mt-1">6 strategies: FIFO, FEFO, Nearest Bin, Wave, Zone, Priority. Barcode-verified picking with short-pick tracking.</p></div>
      </div>
      <div className="space-y-3">
        {tasks.map(t => {
          const progress = t.totalQty > 0 ? Math.round((t.pickedQty / t.totalQty) * 100) : 0
          return (
            <div key={t.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-mono text-xs">{t.taskNumber}</p>
                    <Badge variant="outline" className="text-xs">{t.issueNumber}</Badge>
                    <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', strategyColor[t.strategy])}>{t.strategy}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.warehouse} · {t.zone}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Assigned to: {t.assignedTo}{t.duration && ` · ${t.duration} min`}</p>
                </div>
                <Badge className={statusColor[t.status] + ' text-xs'}>{t.status.replace(/_/g, ' ')}</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="font-mono">{t.pickedLines}/{t.totalLines} lines</span>
                <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                  <div className={cn('h-full', t.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-blue-600')} style={{ width: `${progress}%` }} />
                </div>
                <span className="font-mono font-medium">{t.pickedQty}/{t.totalQty} ({progress}%)</span>
              </div>
              {t.status === 'IN_PROGRESS' && (
                <Button size="sm" variant="outline" className="h-7 text-xs mt-2"><CheckCircle2 className="mr-1 h-3 w-3" /> Complete Picking</Button>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function SIScrapTab() {
  const scraps = [
    { id: 'scrap-001', number: 'SCRAP-2026-0012', type: 'PRODUCTION_SCRAP', date: '2026-07-01', product: 'Kaju Katli 500g', batch: 'KK-2607-01', warehouse: 'Mumbai Plant Warehouse', qty: 8, value: 2800, reason: 'Shape deformation during molding', disposal: 'DESTROYED', status: 'POSTED', createdBy: 'Anita Desai' },
    { id: 'scrap-002', number: 'SCRAP-2026-0013', type: 'EXPIRED_PRODUCTS', date: '2026-07-08', product: 'Kaju Katli 500g', batch: 'KK-2606-05', warehouse: 'Mumbai Plant Warehouse', qty: 56, value: 19320, reason: 'Past expiry date - recall batch', disposal: 'DESTROYED', status: 'PENDING_APPROVAL', createdBy: 'Anita Desai' },
    { id: 'scrap-003', number: 'SCRAP-2026-0014', type: 'WAREHOUSE_DAMAGE', date: '2026-07-07', product: 'Mixed Namkeen 200g', batch: 'MN-2607-03', warehouse: 'Mumbai DC', qty: 12, value: 636, reason: 'Rat damage in storage bin B3', disposal: 'DESTROYED', status: 'POSTED', createdBy: 'Ramesh Yadav' },
    { id: 'scrap-004', number: 'SCRAP-2026-0015', type: 'QUALITY_REJECTION', date: '2026-07-09', product: 'Cashew Nuts (Raw)', batch: null, warehouse: 'Mumbai Plant Warehouse', qty: 5, value: 4250, reason: 'Damaged in transit - packaging crushed', disposal: 'RETURNED_TO_SUPPLIER', status: 'APPROVED', createdBy: 'Suresh Patil' },
    { id: 'scrap-005', number: 'SCRAP-2026-0016', type: 'PRODUCTION_SCRAP', date: '2026-07-05', product: 'Soan Cake 1kg', batch: 'SC-2606-04', warehouse: 'Mumbai Plant Warehouse', qty: 3, value: 1875, reason: 'Sugar crystallization - quality fail', disposal: 'RECYCLED', status: 'POSTED', createdBy: 'Anita Desai' },
  ]
  const typeColor: Record<string, string> = { PRODUCTION_SCRAP: 'bg-blue-100 text-blue-800', WAREHOUSE_DAMAGE: 'bg-amber-100 text-amber-800', TRANSPORT_DAMAGE: 'bg-orange-100 text-orange-800', EXPIRED_PRODUCTS: 'bg-red-100 text-red-800', CUSTOMER_DAMAGE_RETURNS: 'bg-purple-100 text-purple-800', QUALITY_REJECTION: 'bg-pink-100 text-pink-800' }
  const statusColor: Record<string, string> = { POSTED: 'bg-emerald-600 hover:bg-emerald-600', PENDING_APPROVAL: 'bg-amber-500 hover:bg-amber-500', APPROVED: 'bg-blue-600 hover:bg-blue-600', DISPOSED: 'bg-cyan-600 hover:bg-cyan-600' }
  const disposalColor: Record<string, string> = { DESTROYED: 'text-red-600', RECYCLED: 'text-emerald-600', SOLD_AS_SCRAP: 'text-amber-600', DONATED: 'text-blue-600', RETURNED_TO_SUPPLIER: 'text-purple-600', ANIMAL_FEED: 'text-teal-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><Trash2 className="h-5 w-5" /> Scrap Records</h3>
        <p className="text-xs text-muted-foreground mt-1">6 scrap types. Disposal methods: Destroyed, Recycled, Sold as Scrap, Donated, Returned to Supplier, Animal Feed. Requires approval before posting to inventory.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Scrap</Button>
      </div>
      <div className="space-y-3">
        {scraps.map(s => (
          <div key={s.id} className={cn('border rounded-lg p-3', s.status === 'PENDING_APPROVAL' && 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20')}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-mono text-xs">{s.number}</p>
                  <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[s.type])}>{s.type.replace(/_/g, ' ')}</span>
                </div>
                <p className="font-medium">{s.product}{s.batch && <span className="text-muted-foreground ml-2 text-xs">Batch: {s.batch}</span>}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.reason}</p>
                <div className="flex items-center gap-3 text-xs mt-1">
                  <span>Qty: <span className="font-mono font-semibold">{s.qty}</span></span>
                  <span>Value: <span className="font-mono font-semibold text-red-600">₹{s.value.toLocaleString('en-IN')}</span></span>
                  <span>Disposal: <span className={cn('font-semibold', disposalColor[s.disposal])}>{s.disposal.replace(/_/g, ' ')}</span></span>
                </div>
              </div>
              <div className="text-right">
                <Badge className={statusColor[s.status] + ' text-xs'}>{s.status}</Badge>
                <p className="text-xs text-muted-foreground mt-1">{s.date}</p>
                <p className="text-xs text-muted-foreground">By: {s.createdBy}</p>
              </div>
            </div>
            {s.status === 'PENDING_APPROVAL' && (
              <Button size="sm" variant="default" className="h-7 text-xs mt-1 bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="mr-1 h-3 w-3" />Approve & Post</Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

function SIDamageTab() {
  const damages = [
    { id: 'dmg-001', number: 'DMG-2026-0012', type: 'TRANSPORT_DAMAGE', severity: 'MODERATE', date: '2026-07-09', product: 'Cashew Nuts (Raw)', batch: null, warehouse: 'Mumbai Plant Warehouse', qty: 5, value: 4250, reason: 'Packaging crushed during transit', disposition: 'RETURN_TO_SUPPLIER', status: 'POSTED', insurance: true, claimAmount: 4250, reportedBy: 'Suresh Patil' },
    { id: 'dmg-002', number: 'DMG-2026-0013', type: 'STORAGE_DAMAGE', severity: 'MINOR', date: '2026-07-07', product: 'Mixed Namkeen 200g', batch: 'MN-2607-03', warehouse: 'Mumbai DC', qty: 12, value: 636, reason: 'Rat damage in storage bin B3', disposition: 'SCRAP', status: 'POSTED', insurance: false, reportedBy: 'Ramesh Yadav' },
    { id: 'dmg-003', number: 'DMG-2026-0014', type: 'HANDLING_DAMAGE', severity: 'MINOR', date: '2026-07-08', product: 'Kaju Katli 500g', batch: 'KK-2607-01', warehouse: 'Mumbai DC', qty: 4, value: 2160, reason: 'Box dropped during putaway', disposition: 'REPACK', status: 'APPROVED', insurance: false, reportedBy: 'Sandeep Kumar' },
    { id: 'dmg-004', number: 'DMG-2026-0015', type: 'CUSTOMER_RETURN_DAMAGE', severity: 'MODERATE', date: '2026-07-07', product: 'Kaju Katli 500g', batch: 'KK-2606-05', warehouse: 'Mumbai DC', qty: 24, value: 12960, reason: 'Customer returned - taste deviation', disposition: 'PENDING_REVIEW', status: 'UNDER_REVIEW', insurance: false, reportedBy: 'Vikram Iyer' },
  ]
  const typeColor: Record<string, string> = { WAREHOUSE_DAMAGE: 'bg-amber-100 text-amber-800', TRANSPORT_DAMAGE: 'bg-orange-100 text-orange-800', HANDLING_DAMAGE: 'bg-blue-100 text-blue-800', STORAGE_DAMAGE: 'bg-purple-100 text-purple-800', CUSTOMER_RETURN_DAMAGE: 'bg-pink-100 text-pink-800', PRODUCTION_DAMAGE: 'bg-cyan-100 text-cyan-800' }
  const severityColor: Record<string, string> = { MINOR: 'text-amber-600', MODERATE: 'text-orange-600', SEVERE: 'text-red-600', TOTAL_LOSS: 'text-red-700' }
  const statusColor: Record<string, string> = { POSTED: 'bg-emerald-600 hover:bg-emerald-600', APPROVED: 'bg-blue-600 hover:bg-blue-600', UNDER_REVIEW: 'bg-amber-500 hover:bg-amber-500', REPORTED: 'bg-orange-500 hover:bg-orange-500' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><AlertTriangleIcon className="h-5 w-5" /> Damage Records</h3>
        <p className="text-xs text-muted-foreground mt-1">6 damage types · 4 severity levels. Disposition: Repairable, Scrap, Donate, Return to Supplier, Write Off, Repack. Insurance claim tracking.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Report Damage</Button>
      </div>
      <div className="space-y-3">
        {damages.map(d => (
          <div key={d.id} className={cn('border rounded-lg p-3', (d.status === 'UNDER_REVIEW' || d.status === 'REPORTED') && 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20')}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-mono text-xs">{d.number}</p>
                  <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[d.type])}>{d.type.replace(/_/g, ' ')}</span>
                  <Badge variant="outline" className={cn('text-xs font-semibold', severityColor[d.severity])}>{d.severity}</Badge>
                </div>
                <p className="font-medium">{d.product}{d.batch && <span className="text-muted-foreground ml-2 text-xs">Batch: {d.batch}</span>}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{d.reason}</p>
                <div className="flex items-center gap-3 text-xs mt-1">
                  <span>Qty: <span className="font-mono font-semibold">{d.qty}</span></span>
                  <span>Value: <span className="font-mono font-semibold text-red-600">₹{d.value.toLocaleString('en-IN')}</span></span>
                  <span>Disposition: <span className="font-semibold">{d.disposition.replace(/_/g, ' ')}</span></span>
                  {d.insurance && <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">Insurance: ₹{d.claimAmount?.toLocaleString('en-IN')}</Badge>}
                </div>
              </div>
              <div className="text-right">
                <Badge className={statusColor[d.status] + ' text-xs'}>{d.status.replace(/_/g, ' ')}</Badge>
                <p className="text-xs text-muted-foreground mt-1">{d.date}</p>
                <p className="text-xs text-muted-foreground">By: {d.reportedBy}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Stock Transfer Module (Sprint 15) ──────────────────
type TransferTab = 'overview' | 'transfers' | 'transit' | 'bin'

function StockTransferModule() {
  const [tab, setTab] = useState<TransferTab>('overview')
  const tabs: Array<{ key: TransferTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Dashboard', icon: <Gauge className="h-4 w-4" /> },
    { key: 'transfers', label: 'Transfers', icon: <ArrowLeftRight className="h-4 w-4" /> },
    { key: 'transit', label: 'In Transit', icon: <Truck className="h-4 w-4" /> },
    { key: 'bin', label: 'Bin Transfers', icon: <MapPinIcon className="h-4 w-4" /> },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-indigo-950 via-blue-900 to-cyan-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ArrowLeftRight className="h-7 w-7" /> Stock Transfer & In-Transit Engine
            </h2>
            <p className="text-blue-200 text-sm max-w-3xl">
              Move inventory across warehouses, branches, stores, restaurants, bins, and locations.
              11 transfer types with full in-transit tracking, barcode verification, and receiving confirmation.
            </p>
          </div>
          <Badge className="bg-blue-500 text-blue-950 hover:bg-blue-500">Sprint 15</Badge>
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
      {tab === 'overview' && <TransferOverviewTab />}
      {tab === 'transfers' && <TransferListTab />}
      {tab === 'transit' && <TransferTransitTab />}
      {tab === 'bin' && <TransferBinTab />}
    </div>
  )
}

function TransferOverviewTab() {
  const stats = [
    { label: 'Total Transfers', value: '8', sub: '3 COMPLETED · 2 IN_TRANSIT', icon: <ArrowLeftRight className="h-5 w-5 text-blue-600" /> },
    { label: 'In Transit', value: '2', sub: '5 items · ₹1.04L value', icon: <Truck className="h-5 w-5 text-amber-600" /> },
    { label: 'Pending Approval', value: '1', sub: 'Restaurant transfer request', icon: <ClipboardCheck className="h-5 w-5 text-orange-600" /> },
    { label: 'Dispatched (not received)', value: '1', sub: 'Cold storage transfer', icon: <PackageOpen className="h-5 w-5 text-purple-600" /> },
    { label: 'Partial Receipt', value: '1', sub: '2 units short (return)', icon: <AlertTriangleIcon className="h-5 w-5 text-red-600" /> },
    { label: 'Bin Transfers', value: '4', sub: '2 PENDING · 2 COMPLETED', icon: <MapPinIcon className="h-5 w-5 text-teal-600" /> },
    { label: 'In-Transit Value', value: '₹1.04L', sub: 'Across 5 items in transit', icon: <IndianRupee className="h-5 w-5 text-emerald-600" /> },
    { label: 'Completed Today', value: '0', sub: 'No completions today yet', icon: <CheckCircle2 className="h-5 w-5 text-slate-600" /> },
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
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ArrowLeftRight className="h-5 w-5" /> Transfer Workflow</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// 11 transfer types: WH→WH, WH→Store, WH→Restaurant, Plant→WH, Plant→Store, Branch→Branch, Bin→Bin, Loc→Loc, Cold Storage, Transit Vehicle, Return</p>
          <div className="space-y-1 pt-2">
            <p><Badge variant="outline" className="font-mono">1</Badge> <span className="text-blue-600">Transfer Request</span> — source and destination specified</p>
            <p><Badge variant="outline" className="font-mono">2</Badge> → <span className="text-amber-600">Approval</span> — warehouse manager approves</p>
            <p><Badge variant="outline" className="font-mono">3</Badge> → <span className="text-purple-600">Picking & Dispatch</span> — stock removed from source, loaded on vehicle</p>
            <p><Badge variant="outline" className="font-mono">4</Badge> → <span className="text-cyan-600">In Transit</span> — inventory tracked in transit (not available at either location)</p>
            <p><Badge variant="outline" className="font-mono">5</Badge> → <span className="text-indigo-600">Receiving</span> — destination scans and verifies delivery</p>
            <p><Badge variant="outline" className="font-mono">6</Badge> → <span className="text-emerald-600">Completed</span> — inventory available at destination, ledger updated</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function TransferListTab() {
  const transfers = [
    { id: 'st-001', number: 'ST-2026-0042', type: 'PLANT_TO_WAREHOUSE', date: '2026-07-03', source: 'Mumbai Plant Warehouse', dest: 'Mumbai DC', vehicle: 'MH-12-TR-8821', carrier: 'In-House', status: 'COMPLETED', lines: 1, requested: 358, dispatched: 358, received: 358, value: 125300, requestedBy: 'Anita Desai' },
    { id: 'st-002', number: 'ST-2026-0043', type: 'WAREHOUSE_TO_STORE', date: '2026-07-06', source: 'Mumbai DC', dest: 'Mumbai Retail Store 01', vehicle: 'MH-04-TR-1192', carrier: 'Blue Dart', status: 'COMPLETED', lines: 2, requested: 72, dispatched: 72, received: 72, value: 38880, requestedBy: 'Vikram Iyer' },
    { id: 'st-003', number: 'ST-2026-0044', type: 'WAREHOUSE_TO_WAREHOUSE', date: '2026-07-08', source: 'Mumbai DC', dest: 'Pune Warehouse', vehicle: 'MH-12-TR-8821', carrier: 'In-House', status: 'IN_TRANSIT', lines: 3, requested: 200, dispatched: 200, received: 0, value: 70000, requestedBy: 'Anita Desai' },
    { id: 'st-004', number: 'ST-2026-0045', type: 'BRANCH_TO_BRANCH', date: '2026-07-09', source: 'Mumbai DC', dest: 'Pune Warehouse', vehicle: null, carrier: null, status: 'APPROVED', lines: 2, requested: 150, dispatched: 0, received: 0, value: 52500, requestedBy: 'Suresh Patil' },
    { id: 'st-005', number: 'ST-2026-0046', type: 'WAREHOUSE_TO_RESTAURANT', date: '2026-07-09', source: 'Mumbai Plant Warehouse', dest: 'Sudhamrit Restaurant Mumbai', vehicle: null, carrier: null, status: 'SUBMITTED', lines: 5, requested: 45, dispatched: 0, received: 0, value: 0, requestedBy: 'Chef Rajesh' },
    { id: 'st-006', number: 'ST-2026-0047', type: 'RETURN_TRANSFER', date: '2026-07-07', source: 'Mumbai Retail Store 01', dest: 'Mumbai DC', vehicle: 'MH-04-TR-1192', carrier: 'Blue Dart', status: 'PARTIALLY_RECEIVED', lines: 1, requested: 24, dispatched: 24, received: 22, value: 12960, requestedBy: 'Vikram Iyer' },
    { id: 'st-007', number: 'ST-2026-0048', type: 'COLD_STORAGE_TRANSFER', date: '2026-07-09', source: 'Mumbai Plant Warehouse', dest: 'Mumbai DC', vehicle: 'MH-12-TR-8821', carrier: 'In-House', status: 'DISPATCHED', lines: 2, requested: 100, dispatched: 100, received: 0, value: 35000, requestedBy: 'Anita Desai' },
    { id: 'st-008', number: 'ST-2026-0049', type: 'PLANT_TO_STORE', date: '2026-07-05', source: 'Mumbai Plant Warehouse', dest: 'Mumbai Retail Store 01', vehicle: 'MH-12-TR-8821', carrier: 'In-House', status: 'COMPLETED', lines: 1, requested: 48, dispatched: 48, received: 48, value: 25920, requestedBy: 'Vikram Iyer' },
  ]
  const typeColor: Record<string, string> = { PLANT_TO_WAREHOUSE: 'bg-blue-100 text-blue-800', WAREHOUSE_TO_STORE: 'bg-purple-100 text-purple-800', WAREHOUSE_TO_RESTAURANT: 'bg-orange-100 text-orange-800', WAREHOUSE_TO_WAREHOUSE: 'bg-cyan-100 text-cyan-800', BRANCH_TO_BRANCH: 'bg-indigo-100 text-indigo-800', RETURN_TRANSFER: 'bg-pink-100 text-pink-800', COLD_STORAGE_TRANSFER: 'bg-teal-100 text-teal-800', PLANT_TO_STORE: 'bg-emerald-100 text-emerald-800' }
  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', IN_TRANSIT: 'bg-amber-500 hover:bg-amber-500', DISPATCHED: 'bg-blue-600 hover:bg-blue-600', APPROVED: 'bg-cyan-600 hover:bg-cyan-600', SUBMITTED: 'bg-orange-500 hover:bg-orange-500', PARTIALLY_RECEIVED: 'bg-red-500 hover:bg-red-500', DRAFT: 'bg-slate-500 hover:bg-slate-500' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold">Stock Transfers</h3>
        <p className="text-xs text-muted-foreground mt-1">11 transfer types. Source ≠ Destination enforced. Workflow: Request → Approve → Dispatch → Transit → Receive → Complete.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Transfer</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Transfer #</th><th className="font-medium">Type</th>
            <th className="font-medium">Date</th><th className="font-medium">Source</th>
            <th className="font-medium">Destination</th><th className="font-medium text-right">Req</th>
            <th className="font-medium text-right">Disp</th><th className="font-medium text-right">Recv</th>
            <th className="font-medium text-right">Value</th><th className="font-medium">Status</th>
          </tr></thead>
          <tbody>
            {transfers.map(t => (
              <tr key={t.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{t.number}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[t.type] || 'bg-slate-100 text-slate-800')}>{t.type.replace(/_/g, ' ')}</span></td>
                <td className="text-xs text-muted-foreground">{t.date}</td>
                <td className="text-xs">{t.source}</td>
                <td className="text-xs">{t.dest}</td>
                <td className="text-right font-mono">{t.requested}</td>
                <td className="text-right font-mono text-amber-600">{t.dispatched || '—'}</td>
                <td className="text-right font-mono text-emerald-600">{t.received || '—'}</td>
                <td className="text-right font-mono">{t.value > 0 ? `₹${t.value.toLocaleString('en-IN')}` : '—'}</td>
                <td><Badge className={statusColor[t.status] + ' text-xs'}>{t.status.replace(/_/g, ' ')}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function TransferTransitTab() {
  const items = [
    { id: 'iit-001', transferNumber: 'ST-2026-0044', product: 'Kaju Katli 500g', batch: 'KK-2607-01', qty: 100, source: 'Mumbai DC', dest: 'Pune Warehouse', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House', dispatchedAt: '2026-07-08 14:00', eta: '2026-07-09 12:00', status: 'IN_TRANSIT', value: 35000 },
    { id: 'iit-002', transferNumber: 'ST-2026-0044', product: 'Soan Cake 1kg', batch: 'SC-2606-04', qty: 50, source: 'Mumbai DC', dest: 'Pune Warehouse', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House', dispatchedAt: '2026-07-08 14:00', eta: '2026-07-09 12:00', status: 'IN_TRANSIT', value: 31250 },
    { id: 'iit-003', transferNumber: 'ST-2026-0044', product: 'Mixed Namkeen 200g', batch: 'MN-2607-03', qty: 50, source: 'Mumbai DC', dest: 'Pune Warehouse', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House', dispatchedAt: '2026-07-08 14:00', eta: '2026-07-09 12:00', status: 'IN_TRANSIT', value: 2650 },
    { id: 'iit-004', transferNumber: 'ST-2026-0048', product: 'Gulab Jamun 1kg', batch: 'GJ-2607-01', qty: 60, source: 'Mumbai Plant Warehouse', dest: 'Mumbai DC', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House', dispatchedAt: '2026-07-09 08:00', eta: '2026-07-09 10:00', status: 'IN_TRANSIT', value: 18240 },
    { id: 'iit-005', transferNumber: 'ST-2026-0048', product: 'Kaju Katli 250g', batch: null, qty: 40, source: 'Mumbai Plant Warehouse', dest: 'Mumbai DC', vehicle: 'MH-12-TR-8821', driver: 'Ramesh Yadav', carrier: 'In-House', dispatchedAt: '2026-07-09 08:00', eta: '2026-07-09 10:00', status: 'IN_TRANSIT', value: 16800 },
  ]
  const statusColor: Record<string, string> = { IN_TRANSIT: 'bg-amber-500 hover:bg-amber-500', DELIVERED: 'bg-emerald-600 hover:bg-emerald-600', DELAYED: 'bg-red-600 hover:bg-red-600', LOST: 'bg-red-700 hover:bg-red-700' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><Truck className="h-5 w-5" /> In-Transit Inventory</h3>
        <p className="text-xs text-muted-foreground mt-1">Stock removed from source but not yet received at destination. Tracked separately — not available at either location. 5 items in transit worth ₹1.04L.</p></div>
      </div>
      <div className="space-y-3">
        {items.map(i => (
          <div key={i.id} className="border rounded-lg p-3 border-amber-200 bg-amber-50/30 dark:bg-amber-950/10">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-mono text-xs">{i.transferNumber}</p>
                  <Badge variant="outline" className="text-xs font-mono">{i.qty} units</Badge>
                  {i.batch && <Badge variant="outline" className="text-xs">Batch: {i.batch}</Badge>}
                </div>
                <p className="font-medium">{i.product}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span className="font-medium text-foreground">{i.source}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-medium text-foreground">{i.dest}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Vehicle: {i.vehicle} · Driver: {i.driver} · Carrier: {i.carrier}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Dispatched: {i.dispatchedAt} · ETA: {i.eta}</p>
              </div>
              <div className="text-right">
                <Badge className={statusColor[i.status] + ' text-xs'}>{i.status.replace(/_/g, ' ')}</Badge>
                <p className="text-xs font-mono font-semibold text-amber-600 mt-1">₹{i.value.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function TransferBinTab() {
  const bins = [
    { id: 'bt-001', number: 'BT-2026-0023', date: '2026-07-08', warehouse: 'Mumbai Plant Warehouse', product: 'Kaju Katli 500g', batch: 'KK-2607-01', qty: 100, fromZone: 'Receiving Area', fromBin: 'RCV-01', toZone: 'Zone C - Cold Storage', toBin: 'C2-03', reason: 'REORGANIZATION', status: 'COMPLETED', createdBy: 'Ramesh Yadav' },
    { id: 'bt-002', number: 'BT-2026-0024', date: '2026-07-08', warehouse: 'Mumbai Plant Warehouse', product: 'Sugar (Raw)', batch: null, qty: 50, fromZone: 'Zone A', fromBin: 'A2-01', toZone: 'Zone A', toBin: 'A2-03', reason: 'CONSOLIDATION', status: 'COMPLETED', createdBy: 'Ramesh Yadav' },
    { id: 'bt-003', number: 'BT-2026-0025', date: '2026-07-09', warehouse: 'Mumbai DC', product: 'Mixed Namkeen 200g', batch: 'MN-2607-03', qty: 200, fromZone: 'Zone B', fromBin: 'B1-02', toZone: 'Zone B', toBin: 'B3-05', reason: 'CAPACITY_OPTIMIZATION', status: 'PENDING', createdBy: 'Sandeep Kumar' },
    { id: 'bt-004', number: 'BT-2026-0026', date: '2026-07-09', warehouse: 'Mumbai Plant Warehouse', product: 'Ghee (Raw)', batch: null, qty: 10, fromZone: 'Zone C', fromBin: 'C1-01', toZone: 'Zone C', toBin: 'C1-04', reason: 'TEMP_CONTROL', status: 'PENDING', createdBy: 'Suresh Patil' },
  ]
  const reasonColor: Record<string, string> = { REORGANIZATION: 'bg-blue-100 text-blue-800', CONSOLIDATION: 'bg-purple-100 text-purple-800', CAPACITY_OPTIMIZATION: 'bg-amber-100 text-amber-800', CYCLE_COUNT_PREP: 'bg-teal-100 text-teal-800', TEMP_CONTROL: 'bg-cyan-100 text-cyan-800', MANUAL: 'bg-slate-100 text-slate-800' }
  const statusColor: Record<string, string> = { COMPLETED: 'bg-emerald-600 hover:bg-emerald-600', PENDING: 'bg-amber-500 hover:bg-amber-500', CANCELLED: 'bg-red-600 hover:bg-red-600' }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><MapPinIcon className="h-5 w-5" /> Bin & Location Transfers</h3>
        <p className="text-xs text-muted-foreground mt-1">Move stock within the same warehouse: rack→rack, bin→bin, shelf→shelf. No warehouse change. 6 reasons: Reorganization, Consolidation, Capacity Optimization, Cycle Count Prep, Temp Control, Manual.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Bin Transfer</Button>
      </div>
      <div className="space-y-3">
        {bins.map(b => (
          <div key={b.id} className="border rounded-lg p-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-mono text-xs">{b.number}</p>
                <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', reasonColor[b.reason])}>{b.reason.replace(/_/g, ' ')}</span>
              </div>
              <p className="font-medium text-sm">{b.product} <span className="text-muted-foreground ml-2 text-xs">{b.batch && `Batch: ${b.batch}`}</span></p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Badge variant="outline" className="text-xs font-mono">{b.qty}</Badge>
                <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{b.fromZone} / {b.fromBin}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{b.toZone} / {b.toBin}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{b.warehouse} · {b.date} · By: {b.createdBy}</p>
            </div>
            <Badge className={statusColor[b.status] + ' text-xs flex-shrink-0'}>{b.status}</Badge>
            {b.status === 'PENDING' && <Button size="sm" variant="outline" className="h-7 text-xs flex-shrink-0"><CheckCircle2 className="mr-1 h-3 w-3" /> Complete</Button>}
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Adjustment & Reconciliation Module (Sprint 16) ──────
type AdjustmentTab = 'overview' | 'adjustments' | 'damage' | 'rootcauses'

function AdjustmentModule() {
  const [tab, setTab] = useState<AdjustmentTab>('overview')
  const tabs: Array<{ key: AdjustmentTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'adjustments', label: 'Adjustments', icon: <ShieldAlert className="h-4 w-4" /> },
    { key: 'damage', label: 'Damage', icon: <AlertTriangleIcon className="h-4 w-4" /> },
    { key: 'rootcauses', label: 'Root Causes', icon: <ListChecks className="h-4 w-4" /> },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-rose-950 via-red-900 to-orange-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ShieldAlert className="h-7 w-7" /> Adjustment & Reconciliation Engine
            </h2>
            <p className="text-rose-200 text-sm max-w-3xl">
              Inventory adjustments, damage reports, expiry disposal, and root cause analysis.
              13 adjustment types, 10 reasons, severity-based damage handling, expiry blocking,
              and corrective action tracking with recurrence detection.
            </p>
          </div>
          <Badge className="bg-rose-500 text-rose-950 hover:bg-rose-500">Sprint 16</Badge>
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
      {tab === 'overview' && <AdjustmentOverviewTab />}
      {tab === 'adjustments' && <AdjustmentListTab />}
      {tab === 'damage' && <AdjustmentDamageTab />}
      {tab === 'rootcauses' && <AdjustmentRootCauseTab />}
    </div>
  )
}

function AdjustmentOverviewTab() {
  const stats = [
    { label: 'Total Adjustments', value: '8', sub: '2 POSTED · 3 PENDING', icon: <ShieldAlert className="h-5 w-5 text-rose-600" /> },
    { label: 'Pending Approval', value: '3', sub: 'STOCK_LOSS, SHRINKAGE, PRODUCTION_VARIANCE', icon: <Clock className="h-5 w-5 text-amber-600" /> },
    { label: 'Damage Reports', value: '4', sub: '1 SEVERE · 1 TOTAL_LOSS', icon: <AlertTriangleIcon className="h-5 w-5 text-red-600" /> },
    { label: 'Expiry Adjustments', value: '3', sub: '1 EXPIRED · 1 NEAR_EXPIRY · 1 BLOCKED', icon: <Clock className="h-5 w-5 text-orange-600" /> },
    { label: 'Write-Off Value', value: '₹69,236', sub: 'Damage + Expiry + Posted write-offs', icon: <IndianRupee className="h-5 w-5 text-emerald-600" /> },
    { label: 'Root Causes', value: '5', sub: '2 OPEN · 2 IN_PROGRESS · 1 COMPLETED', icon: <ListChecks className="h-5 w-5 text-purple-600" /> },
    { label: 'Recurring Issues', value: '2', sub: 'STORAGE + PRODUCTION', icon: <AlertTriangleIcon className="h-5 w-5 text-pink-600" /> },
    { label: 'Reasons Configured', value: '10', sub: 'INCREASE / DECREASE / NEUTRAL', icon: <Tag className="h-5 w-5 text-blue-600" /> },
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
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Adjustment & Reconciliation Workflow</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// 13 adjustment types: STOCK_GAIN, STOCK_LOSS, DAMAGE, EXPIRY, SHRINKAGE, THEFT, PRODUCTION_VARIANCE, PACKING_VARIANCE, SUPPLIER_SHORTAGE, CUSTOMER_RETURN_CORRECTION, BARCODE_CORRECTION, OPENING_BALANCE_CORRECTION, FINANCIAL_RECONCILIATION</p>
          <div className="space-y-1 pt-2">
            <p><Badge variant="outline" className="font-mono">1</Badge> <span className="text-blue-600">Identify Discrepancy</span> — cycle count, damage event, expiry scan, or system reconciliation</p>
            <p><Badge variant="outline" className="font-mono">2</Badge> → <span className="text-amber-600">Capture Evidence</span> — photo required for DAMAGE / EXPIRY / THEFT; reason code mandatory</p>
            <p><Badge variant="outline" className="font-mono">3</Badge> → <span className="text-orange-600">Submit for Approval</span> — routed by reason approvalLevel (SUPERVISOR / WAREHOUSE_MANAGER / FINANCE / MANAGEMENT)</p>
            <p><Badge variant="outline" className="font-mono">4</Badge> → <span className="text-cyan-600">Approve / Reject</span> — write-offs require finance + management sign-off</p>
            <p><Badge variant="outline" className="font-mono">5</Badge> → <span className="text-indigo-600">Post to Inventory</span> — ledger updated, system_qty → physical_qty reconciled</p>
            <p><Badge variant="outline" className="font-mono">6</Badge> → <span className="text-emerald-600">Post to Finance (GL)</span> — write-off value journalized to loss / shrinkage account</p>
            <p><Badge variant="outline" className="font-mono">7</Badge> → <span className="text-purple-600">Root Cause Analysis</span> — corrective + preventive actions assigned with due date and recurrence flag</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function AdjustmentListTab() {
  const adjustments = [
    { id: 'adj-001', number: 'ADJ-2026-0101', date: '2026-07-09', type: 'STOCK_GAIN', warehouse: 'Mumbai DC', reason: 'FOUND', lines: 2, systemQty: 100, physicalQty: 118, diff: 18, value: 5400, status: 'POSTED', posted: true, writeOff: false, photo: true, requestedBy: 'Ramesh Yadav' },
    { id: 'adj-002', number: 'ADJ-2026-0102', date: '2026-07-09', type: 'STOCK_LOSS', warehouse: 'Mumbai Plant Warehouse', reason: 'COUNTING_ERROR', lines: 1, systemQty: 60, physicalQty: 54, diff: -6, value: -1800, status: 'PENDING_APPROVAL', posted: false, writeOff: false, photo: false, requestedBy: 'Sandeep Kumar' },
    { id: 'adj-003', number: 'ADJ-2026-0103', date: '2026-07-08', type: 'DAMAGE', warehouse: 'Mumbai DC', reason: 'DAMAGE', lines: 1, systemQty: 60, physicalQty: 48, diff: -12, value: -7200, status: 'APPROVED', posted: false, writeOff: true, photo: true, requestedBy: 'Suresh Patil' },
    { id: 'adj-004', number: 'ADJ-2026-0104', date: '2026-07-07', type: 'EXPIRY', warehouse: 'Mumbai Retail Store 01', reason: 'EXPIRY', lines: 1, systemQty: 24, physicalQty: 0, diff: -24, value: -4800, status: 'POSTED', posted: true, writeOff: true, photo: true, requestedBy: 'Vikram Iyer' },
    { id: 'adj-005', number: 'ADJ-2026-0105', date: '2026-07-09', type: 'SHRINKAGE', warehouse: 'Mumbai Retail Store 01', reason: 'LOST', lines: 3, systemQty: 200, physicalQty: 191, diff: -9, value: -2700, status: 'SUBMITTED', posted: false, writeOff: false, photo: false, requestedBy: 'Vikram Iyer' },
    { id: 'adj-006', number: 'ADJ-2026-0106', date: '2026-07-06', type: 'THEFT', warehouse: 'Mumbai DC', reason: 'THEFT', lines: 1, systemQty: 20, physicalQty: 16, diff: -4, value: -16000, status: 'REJECTED', posted: false, writeOff: false, photo: true, requestedBy: 'Suresh Patil' },
    { id: 'adj-007', number: 'ADJ-2026-0107', date: '2026-07-09', type: 'PRODUCTION_VARIANCE', warehouse: 'Mumbai Plant Warehouse', reason: 'PRODUCTION_LOSS', lines: 2, systemQty: 500, physicalQty: 485, diff: -15, value: -9750, status: 'PENDING_APPROVAL', posted: false, writeOff: false, photo: true, requestedBy: 'Chef Rajesh' },
    { id: 'adj-008', number: 'ADJ-2026-0108', date: '2026-07-09', type: 'BARCODE_CORRECTION', warehouse: 'Mumbai DC', reason: 'WRONG_ENTRY', lines: 1, systemQty: 0, physicalQty: 0, diff: 0, value: 0, status: 'APPROVED', posted: false, writeOff: false, photo: false, requestedBy: 'Sandeep Kumar' },
  ]
  const typeColor: Record<string, string> = {
    STOCK_GAIN: 'bg-emerald-100 text-emerald-800',
    STOCK_LOSS: 'bg-red-100 text-red-800',
    DAMAGE: 'bg-orange-100 text-orange-800',
    EXPIRY: 'bg-amber-100 text-amber-800',
    SHRINKAGE: 'bg-pink-100 text-pink-800',
    THEFT: 'bg-rose-100 text-rose-800',
    PRODUCTION_VARIANCE: 'bg-purple-100 text-purple-800',
    PACKING_VARIANCE: 'bg-violet-100 text-violet-800',
    SUPPLIER_SHORTAGE: 'bg-cyan-100 text-cyan-800',
    CUSTOMER_RETURN_CORRECTION: 'bg-teal-100 text-teal-800',
    BARCODE_CORRECTION: 'bg-blue-100 text-blue-800',
    OPENING_BALANCE_CORRECTION: 'bg-slate-100 text-slate-800',
    FINANCIAL_RECONCILIATION: 'bg-indigo-100 text-indigo-800',
  }
  const statusColor: Record<string, string> = {
    POSTED: 'bg-emerald-600 hover:bg-emerald-600',
    APPROVED: 'bg-cyan-600 hover:bg-cyan-600',
    PENDING_APPROVAL: 'bg-amber-500 hover:bg-amber-500',
    SUBMITTED: 'bg-orange-500 hover:bg-orange-500',
    REJECTED: 'bg-red-600 hover:bg-red-600',
    DRAFT: 'bg-slate-500 hover:bg-slate-500',
    CANCELLED: 'bg-slate-600 hover:bg-slate-600',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Inventory Adjustments</h3>
        <p className="text-xs text-muted-foreground mt-1">13 adjustment types · 7 statuses. system_qty vs physical_qty → difference posted to inventory + GL after approval. Write-offs require FINANCE/MANAGEMENT approval.</p></div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Adjustment</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Adjustment #</th><th className="font-medium">Type</th>
            <th className="font-medium">Date</th><th className="font-medium">Warehouse</th>
            <th className="font-medium">Reason</th><th className="font-medium text-right">System</th>
            <th className="font-medium text-right">Physical</th><th className="font-medium text-right">Diff</th>
            <th className="font-medium text-right">Value</th><th className="font-medium">Status</th><th className="font-medium">Flags</th>
          </tr></thead>
          <tbody>
            {adjustments.map(a => (
              <tr key={a.id} className="border-b hover:bg-muted/40">
                <td className="py-2.5 font-mono text-xs">{a.number}</td>
                <td><span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[a.type] || 'bg-slate-100 text-slate-800')}>{a.type.replace(/_/g, ' ')}</span></td>
                <td className="text-xs text-muted-foreground">{a.date}</td>
                <td className="text-xs">{a.warehouse}</td>
                <td className="text-xs"><Badge variant="outline" className="text-xs">{a.reason.replace(/_/g, ' ')}</Badge></td>
                <td className="text-right font-mono text-slate-600">{a.systemQty}</td>
                <td className="text-right font-mono text-slate-900 font-medium">{a.physicalQty}</td>
                <td className={cn('text-right font-mono font-bold', a.diff > 0 ? 'text-emerald-600' : a.diff < 0 ? 'text-red-600' : 'text-slate-400')}>{a.diff > 0 ? '+' : ''}{a.diff}</td>
                <td className={cn('text-right font-mono', a.value < 0 ? 'text-red-600' : a.value > 0 ? 'text-emerald-600' : 'text-slate-400')}>{a.value !== 0 ? `₹${Math.abs(a.value).toLocaleString('en-IN')}` : '—'}</td>
                <td><Badge className={statusColor[a.status] + ' text-xs'}>{a.status.replace(/_/g, ' ')}</Badge></td>
                <td className="text-xs">
                  <div className="flex items-center gap-1">
                    {a.posted && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                    {a.writeOff && <Trash2 className="h-3.5 w-3.5 text-red-600" />}
                    {a.photo && <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function AdjustmentDamageTab() {
  const reports = [
    { id: 'dmg-001', number: 'DR-2026-0901', date: '2026-07-08', type: 'WAREHOUSE_DAMAGE', severity: 'SEVERE', product: 'Kaju Katli 500g', batch: 'KK-2607-04', qty: 12, unitCost: 600, value: 7200, warehouse: 'Mumbai DC', photos: 4, disposition: 'WRITE_OFF', status: 'POSTED', reportedBy: 'Suresh Patil', adjNumber: 'ADJ-2026-0103', desc: '12 units crushed during forklift handling — outer carton damaged, inner packs contaminated.' },
    { id: 'dmg-002', number: 'DR-2026-0902', date: '2026-07-09', type: 'TRANSPORT_DAMAGE', severity: 'MODERATE', product: 'Soan Cake 1kg', batch: 'SC-2606-04', qty: 6, unitCost: 625, value: 3750, warehouse: 'Mumbai DC', photos: 2, disposition: 'REPACK', status: 'UNDER_REVIEW', reportedBy: 'Ramesh Yadav', adjNumber: null, desc: '6 units outer box dented during truck unload — contents intact, repackable.' },
    { id: 'dmg-003', number: 'DR-2026-0903', date: '2026-07-09', type: 'STORAGE_DAMAGE', severity: 'MINOR', product: 'Mixed Namkeen 200g', batch: 'MN-2607-03', qty: 18, unitCost: 53, value: 954, warehouse: 'Mumbai DC', photos: 1, disposition: 'REPAIRABLE', status: 'REPORTED', reportedBy: 'Sandeep Kumar', adjNumber: null, desc: '18 packets with minor seal damage from cold storage humidity — sealable via rework.' },
    { id: 'dmg-004', number: 'DR-2026-0904', date: '2026-07-07', type: 'PRODUCTION_DAMAGE', severity: 'TOTAL_LOSS', product: 'Gulab Jamun 1kg', batch: 'GJ-2607-01', qty: 24, unitCost: 304, value: 7296, warehouse: 'Mumbai Plant Warehouse', photos: 6, disposition: 'SCRAP', status: 'DISPOSED', reportedBy: 'Chef Rajesh', adjNumber: 'ADJ-2026-0107', desc: 'Full batch burned due to thermostat malfunction — disposed to animal feed vendor.' },
  ]
  const typeColor: Record<string, string> = {
    FOOD_DAMAGE: 'bg-amber-100 text-amber-800',
    TRANSPORT_DAMAGE: 'bg-blue-100 text-blue-800',
    WAREHOUSE_DAMAGE: 'bg-purple-100 text-purple-800',
    PRODUCTION_DAMAGE: 'bg-orange-100 text-orange-800',
    STORAGE_DAMAGE: 'bg-cyan-100 text-cyan-800',
    HANDLING_DAMAGE: 'bg-pink-100 text-pink-800',
  }
  const severityColor: Record<string, string> = {
    MINOR: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    MODERATE: 'bg-amber-100 text-amber-800 border-amber-300',
    SEVERE: 'bg-orange-100 text-orange-800 border-orange-300',
    TOTAL_LOSS: 'bg-red-100 text-red-800 border-red-300',
  }
  const dispositionColor: Record<string, string> = {
    PENDING_REVIEW: 'bg-slate-100 text-slate-800',
    SCRAP: 'bg-red-100 text-red-800',
    REPAIRABLE: 'bg-emerald-100 text-emerald-800',
    DONATE: 'bg-teal-100 text-teal-800',
    RETURN_TO_SUPPLIER: 'bg-blue-100 text-blue-800',
    WRITE_OFF: 'bg-rose-100 text-rose-800',
    REPACK: 'bg-purple-100 text-purple-800',
  }
  const statusColor: Record<string, string> = {
    REPORTED: 'bg-orange-500 hover:bg-orange-500',
    UNDER_REVIEW: 'bg-amber-500 hover:bg-amber-500',
    APPROVED: 'bg-cyan-600 hover:bg-cyan-600',
    POSTED: 'bg-emerald-600 hover:bg-emerald-600',
    DISPOSED: 'bg-slate-600 hover:bg-slate-600',
    CANCELLED: 'bg-red-600 hover:bg-red-600',
  }
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div><h3 className="font-semibold flex items-center gap-2"><AlertTriangleIcon className="h-5 w-5" /> Damage Reports</h3>
          <p className="text-xs text-muted-foreground mt-1">6 damage types · 4 severity levels · 7 dispositions. Photo evidence required. Linked to inventory adjustment on posting.</p></div>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Damage Report</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map(r => (
            <div key={r.id} className={cn('border rounded-lg p-4', severityColor[r.severity])}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-mono text-xs">{r.number}</p>
                    <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium', typeColor[r.type])}>{r.type.replace(/_/g, ' ')}</span>
                    <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-bold border', severityColor[r.severity])}>{r.severity.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="font-medium">{r.product}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Batch: {r.batch} · {r.warehouse} · {r.date}</p>
                </div>
                <Badge className={statusColor[r.status] + ' text-xs flex-shrink-0'}>{r.status.replace(/_/g, ' ')}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{r.desc}</p>
              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div className="bg-background/50 rounded p-2"><p className="text-muted-foreground">Damaged Qty</p><p className="font-mono font-bold">{r.qty}</p></div>
                <div className="bg-background/50 rounded p-2"><p className="text-muted-foreground">Unit Cost</p><p className="font-mono">₹{r.unitCost.toLocaleString('en-IN')}</p></div>
                <div className="bg-background/50 rounded p-2"><p className="text-muted-foreground">Total Value</p><p className="font-mono font-bold text-red-600">₹{r.value.toLocaleString('en-IN')}</p></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('inline-block px-2 py-0.5 rounded font-medium', dispositionColor[r.disposition])}>{r.disposition.replace(/_/g, ' ')}</span>
                  {r.adjNumber && <Badge variant="outline" className="text-xs font-mono">{r.adjNumber}</Badge>}
                </div>
                <span className="flex items-center gap-1 text-muted-foreground"><ShieldAlert className="h-3 w-3" />{r.photos} photo{r.photos !== 1 ? 's' : ''}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Reported by: {r.reportedBy}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function AdjustmentRootCauseTab() {
  const causes = [
    { id: 'rc-001', adjNumber: 'ADJ-2026-0103', category: 'STORAGE', detail: 'Pallets stacked too high in Zone B causing top-tier product crush damage during forklift retrieval.', affectedQty: 12, affectedValue: 7200, correctiveAction: 'Reduce max stacking height from 5 to 3 pallets. Install racking guards on top tier.', preventiveAction: 'Add rack height sensors + weekly safety audit.', owner: 'Anita Desai', dueDate: '2026-07-20', status: 'IN_PROGRESS', recurring: true, recurrenceCount: 3 },
    { id: 'rc-002', adjNumber: 'ADJ-2026-0102', category: 'HUMAN_ERROR', detail: 'Cycle count clerk missed 6 units in dark corner of Zone A — physical count discrepancy.', affectedQty: 6, affectedValue: 1800, correctiveAction: 'Re-train cycle count staff on full-sweep methodology. Add task lighting to Zone A corners.', preventiveAction: 'Add lighting + monthly count audit on Zone A.', owner: 'Sandeep Kumar', dueDate: '2026-07-15', status: 'OPEN', recurring: false, recurrenceCount: 1 },
    { id: 'rc-003', adjNumber: 'ADJ-2026-0108', category: 'SYSTEM_ERROR', detail: 'Barcode master mismatch — GS1 GTIN for Kaju Katli 500g not synced from PIM to scanner database, causing wrong scans during putaway.', affectedQty: 0, affectedValue: 0, correctiveAction: 'Force PIM → scanner sync job. Add validation rule to fail putaway if barcode not recognized.', preventiveAction: 'Add nightly PIM sync verification alert.', owner: 'Ramesh Yadav', dueDate: '2026-07-12', status: 'COMPLETED', recurring: false, recurrenceCount: 0 },
    { id: 'rc-004', adjNumber: 'ADJ-2026-0107', category: 'PRODUCTION', detail: 'Thermostat on cooker #3 malfunctioned, temperature exceeded BOM threshold by 12°C causing batch burn and yield drop.', affectedQty: 15, affectedValue: 9750, correctiveAction: 'Replace thermostat, recalibrate cooker #3, add 15-min temperature logging interval.', preventiveAction: 'Quarterly thermostat calibration schedule.', owner: 'Chef Rajesh', dueDate: '2026-07-13', status: 'OPEN', recurring: true, recurrenceCount: 2 },
    { id: 'rc-005', adjNumber: 'ADJ-2026-0104', category: 'RECEIVING', detail: 'GRN inspector did not verify expiry date on incoming batch — expired stock accepted into Mumbai Retail Store 01 inventory.', affectedQty: 24, affectedValue: 4800, correctiveAction: 'Add mandatory expiry date check to GRN workflow with photo evidence.', preventiveAction: 'Update GRN checklist, train 4 receiving staff on near-expiry rejection policy.', owner: 'Vikram Iyer', dueDate: '2026-07-18', status: 'IN_PROGRESS', recurring: false, recurrenceCount: 1 },
  ]
  const categoryColor: Record<string, string> = {
    RECEIVING: 'bg-blue-100 text-blue-800',
    STORAGE: 'bg-amber-100 text-amber-800',
    PRODUCTION: 'bg-orange-100 text-orange-800',
    PACKING: 'bg-purple-100 text-purple-800',
    PICKING: 'bg-cyan-100 text-cyan-800',
    DISPATCH: 'bg-teal-100 text-teal-800',
    TRANSPORT: 'bg-indigo-100 text-indigo-800',
    RETAIL: 'bg-pink-100 text-pink-800',
    RESTAURANT: 'bg-rose-100 text-rose-800',
    SYSTEM_ERROR: 'bg-red-100 text-red-800',
    HUMAN_ERROR: 'bg-violet-100 text-violet-800',
  }
  const statusColor: Record<string, string> = {
    OPEN: 'bg-orange-500 hover:bg-orange-500',
    IN_PROGRESS: 'bg-amber-500 hover:bg-amber-500',
    COMPLETED: 'bg-emerald-600 hover:bg-emerald-600',
    OVERDUE: 'bg-red-600 hover:bg-red-600',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h3 className="font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5" /> Root Cause Analysis</h3>
        <p className="text-xs text-muted-foreground mt-1">11 categories. Each adjustment with value impact triggers RCA. Corrective + preventive actions tracked with owner, due date, and recurrence flag.</p></div>
      </div>
      <div className="space-y-4">
        {causes.map(c => (
          <div key={c.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-bold', categoryColor[c.category])}>{c.category.replace(/_/g, ' ')}</span>
                <Badge variant="outline" className="text-xs font-mono">{c.adjNumber}</Badge>
                {c.recurring && <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 text-xs"><AlertTriangleIcon className="mr-1 h-3 w-3" />Recurring ({c.recurrenceCount}x)</Badge>}
              </div>
              <Badge className={statusColor[c.status] + ' text-xs'}>{c.status.replace(/_/g, ' ')}</Badge>
            </div>
            <p className="text-sm mb-3">{c.detail}</p>
            <div className="grid gap-3 md:grid-cols-2 mb-3">
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded p-3 border border-amber-200 dark:border-amber-900">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1"><AlertTriangleIcon className="h-3 w-3" /> Corrective Action</p>
                <p className="text-xs text-foreground">{c.correctiveAction}</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded p-3 border border-emerald-200 dark:border-emerald-900">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Preventive Action</p>
                <p className="text-xs text-foreground">{c.preventiveAction}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span>Owner: <span className="font-medium text-foreground">{c.owner}</span></span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Due: {c.dueDate}</span>
                <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />Impact: ₹{c.affectedValue.toLocaleString('en-IN')} ({c.affectedQty} units)</span>
              </div>
              {c.status !== 'COMPLETED' && <Button size="sm" variant="outline" className="h-7 text-xs"><CheckCircle2 className="mr-1 h-3 w-3" /> Mark Complete</Button>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── Reservation & Allocation Module (Sprint 17) ────────
type ReservationTab = 'overview' | 'reservations' | 'rules' | 'availability'

function ReservationModule() {
  const [tab, setTab] = useState<ReservationTab>('overview')
  const tabs: Array<{ key: ReservationTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'reservations', label: 'Reservations', icon: <ShieldCheck className="h-4 w-4" /> },
    { key: 'rules', label: 'Allocation Rules', icon: <ListChecks className="h-4 w-4" /> },
    { key: 'availability', label: 'Availability', icon: <Boxes className="h-4 w-4" /> },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-indigo-950 via-blue-900 to-cyan-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ShieldCheck className="h-7 w-7" /> Reservation & Allocation Engine
            </h2>
            <p className="text-blue-200 text-sm max-w-3xl">
              Inventory reservations across sales, production, kitchen, transfer, maintenance, project, sample, and emergency.
              6 allocation strategies (FIFO, FEFO, LIFO, NEAREST_BIN, LOWEST_COST, HIGHEST_PRIORITY), priority matrix,
              and real-time availability snapshots with short-supply detection.
            </p>
          </div>
          <Badge className="bg-blue-500 text-blue-950 hover:bg-blue-500">Sprint 17</Badge>
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
      {tab === 'overview' && <ReservationOverviewTab />}
      {tab === 'reservations' && <ReservationListTab />}
      {tab === 'rules' && <AllocationRulesTab />}
      {tab === 'availability' && <AvailabilityTab />}
    </div>
  )
}

function ReservationOverviewTab() {
  const stats = [
    { label: 'Active Reservations', value: '4', sub: '2 ACTIVE · 2 PARTIALLY_ALLOCATED', icon: <ShieldCheck className="h-5 w-5 text-blue-600" /> },
    { label: 'Fully Allocated', value: '2', sub: 'PRODUCTION + EMERGENCY', icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" /> },
    { label: 'Short Supply Items', value: '2', sub: 'Soan Cake + Gulab Jamun', icon: <AlertTriangleIcon className="h-5 w-5 text-red-600" /> },
    { label: 'Released / Expired', value: '1', sub: 'SAMPLE_RESERVATION released', icon: <Archive className="h-5 w-5 text-slate-600" /> },
    { label: 'Allocation Rules', value: '6', sub: 'FIFO · FEFO · LIFO · NEAREST · LOWEST · PRIORITY', icon: <ListChecks className="h-5 w-5 text-purple-600" /> },
    { label: 'Available Stock Value', value: '₹3.47L', sub: 'across 4 warehouses', icon: <IndianRupee className="h-5 w-5 text-amber-600" /> },
  ]
  const flowSteps = [
    { n: 1, label: 'Business Document', detail: 'Sales Order / Production Order / Transfer / Project', color: 'text-blue-600' },
    { n: 2, label: 'Reservation Request', detail: 'Auto-create reservation with priority + expiry', color: 'text-cyan-600' },
    { n: 3, label: 'Availability Check', detail: 'Query AvailabilitySnapshot (onHand − reserved − allocated − blocked)', color: 'text-amber-600' },
    { n: 4, label: 'Reservation Created', detail: 'Stock earmarked — available pool reduced', color: 'text-orange-600' },
    { n: 5, label: 'Allocation', detail: 'Apply allocation rule (FIFO / FEFO / LIFO / NEAREST / LOWEST / PRIORITY)', color: 'text-purple-600' },
    { n: 6, label: 'Picking', detail: 'Pick list generated against allocated bin', color: 'text-violet-600' },
    { n: 7, label: 'Issue / Consumption', detail: 'Stock issued — ledger updated, reservation moves to FULLY_ISSUED', color: 'text-indigo-600' },
    { n: 8, label: 'Inventory Ledger', detail: 'Reservation → Allocation → Issue chain recorded for audit', color: 'text-emerald-600' },
  ]
  const priorityMatrix = [
    { rank: 1, source: 'Manufacturing Orders', exampleType: 'PRODUCTION_ORDER', priority: 'CRITICAL', score: 95, sla: '24 hrs', notes: 'Production line stoppage costs >50K/hr — highest non-emergency priority.' },
    { rank: 2, source: 'Customer Sales Orders', exampleType: 'SALES_ORDER', priority: 'HIGH', score: 80, sla: '48 hrs', notes: 'Wholesale + retail orders. VIP customers get CRITICAL override.' },
    { rank: 3, source: 'Restaurant / Kitchen', exampleType: 'KITCHEN_ORDER', priority: 'NORMAL', score: 60, sla: '8 hrs', notes: 'Same-day consumption — short reservation window.' },
    { rank: 4, source: 'Stock Transfers', exampleType: 'TRANSFER_ORDER', priority: 'NORMAL', score: 50, sla: '144 hrs', notes: 'Inter-warehouse restocking — 6-day reservation window.' },
    { rank: 5, source: 'Samples & Marketing', exampleType: 'SAMPLE_RESERVATION', priority: 'LOW', score: 25, sla: '288 hrs', notes: '12-day window — low priority, can be bumped by higher orders.' },
  ]
  const priorityColor: Record<string, string> = {
    CRITICAL: 'bg-orange-100 text-orange-800',
    HIGH: 'bg-amber-100 text-amber-800',
    NORMAL: 'bg-blue-100 text-blue-800',
    LOW: 'bg-slate-100 text-slate-800',
  }
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Reservation → Allocation → Issue Flow</h3>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs space-y-2">
          <p className="text-muted-foreground">// 8 reservation types: SALES_ORDER, PRODUCTION_ORDER, KITCHEN_ORDER, TRANSFER_ORDER, MAINTENANCE_ORDER, PROJECT_RESERVATION, SAMPLE_RESERVATION, EMERGENCY_RESERVATION</p>
          <div className="space-y-1 pt-2">
            {flowSteps.map(s => (
              <p key={s.n}>
                <Badge variant="outline" className="font-mono">{s.n}</Badge> → <span className={s.color}>{s.label}</span> — <span className="text-muted-foreground">{s.detail}</span>
              </p>
            ))}
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><ListChecks className="h-5 w-5" /> Reservation Priority Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-3 font-medium text-muted-foreground">Rank</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">Source</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">Example Type</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">Default Priority</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">Score</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">SLA</th>
                <th className="py-2 pr-3 font-medium text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {priorityMatrix.map(p => (
                <tr key={p.rank} className="border-b last:border-0">
                  <td className="py-2 pr-3 font-mono">{p.rank}</td>
                  <td className="py-2 pr-3 font-medium">{p.source}</td>
                  <td className="py-2 pr-3"><Badge variant="outline" className="font-mono text-xs">{p.exampleType}</Badge></td>
                  <td className="py-2 pr-3"><Badge className={priorityColor[p.priority]}>{p.priority}</Badge></td>
                  <td className="py-2 pr-3 font-mono">{p.score}</td>
                  <td className="py-2 pr-3">{p.sla}</td>
                  <td className="py-2 pr-3 text-muted-foreground text-xs">{p.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function ReservationListTab() {
  const reservations = [
    { id: 'res-001', number: 'RSV-2026-0001', date: '2026-07-09', type: 'SALES_ORDER', priority: 'HIGH', score: 80, warehouse: 'Mumbai DC', refType: 'SALES_ORDER', refNumber: 'SO-2026-0451', partner: 'Sai Distribution Pvt Ltd', requested: 250, reserved: 250, allocated: 180, issued: 0, status: 'ACTIVE', expiry: '2026-07-12', autoRelease: 72, createdBy: 'Anita Desai' },
    { id: 'res-002', number: 'RSV-2026-0002', date: '2026-07-09', type: 'PRODUCTION_ORDER', priority: 'CRITICAL', score: 95, warehouse: 'Mumbai Plant Warehouse', refType: 'PRODUCTION_ORDER', refNumber: 'PO-2026-0078', partner: null, requested: 1200, reserved: 1200, allocated: 1200, issued: 600, status: 'FULLY_ALLOCATED', expiry: '2026-07-10', autoRelease: 24, createdBy: 'Chef Rajesh' },
    { id: 'res-003', number: 'RSV-2026-0003', date: '2026-07-09', type: 'KITCHEN_ORDER', priority: 'NORMAL', score: 60, warehouse: 'Mumbai Plant Warehouse', refType: 'KITCHEN_REQUISITION', refNumber: 'KR-2026-0234', partner: null, requested: 80, reserved: 80, allocated: 45, issued: 45, status: 'PARTIALLY_ALLOCATED', expiry: '2026-07-09', autoRelease: 8, createdBy: 'Chef Rajesh' },
    { id: 'res-004', number: 'RSV-2026-0004', date: '2026-07-08', type: 'TRANSFER_ORDER', priority: 'NORMAL', score: 50, warehouse: 'Mumbai DC', refType: 'STOCK_TRANSFER', refNumber: 'ST-2026-0156', partner: null, requested: 400, reserved: 380, allocated: 200, issued: 0, status: 'ACTIVE', expiry: '2026-07-14', autoRelease: 144, createdBy: 'Ramesh Yadav' },
    { id: 'res-005', number: 'RSV-2026-0005', date: '2026-07-07', type: 'MAINTENANCE_ORDER', priority: 'LOW', score: 30, warehouse: 'Mumbai Plant Warehouse', refType: 'MAINTENANCE_WO', refNumber: 'MWO-2026-0089', partner: null, requested: 15, reserved: 15, allocated: 15, issued: 0, status: 'ACTIVE', expiry: '2026-07-21', autoRelease: 240, createdBy: 'Sandeep Kumar' },
    { id: 'res-006', number: 'RSV-2026-0006', date: '2026-07-06', type: 'PROJECT_RESERVATION', priority: 'HIGH', score: 75, warehouse: 'Mumbai DC', refType: 'PROJECT', refNumber: 'PRJ-2026-0012', partner: 'Wedding Belles Events', requested: 600, reserved: 550, allocated: 320, issued: 100, status: 'PARTIALLY_ALLOCATED', expiry: '2026-07-25', autoRelease: 360, createdBy: 'Anita Desai' },
    { id: 'res-007', number: 'RSV-2026-0007', date: '2026-07-05', type: 'SAMPLE_RESERVATION', priority: 'LOW', score: 25, warehouse: 'Mumbai Retail Store 01', refType: 'SAMPLE_REQUEST', refNumber: 'SR-2026-0042', partner: 'Apna Bazaar Chain', requested: 12, reserved: 12, allocated: 12, issued: 12, status: 'RELEASED', expiry: '2026-07-19', autoRelease: 288, createdBy: 'Vikram Iyer' },
    { id: 'res-008', number: 'RSV-2026-0008', date: '2026-07-09', type: 'EMERGENCY_RESERVATION', priority: 'EMERGENCY', score: 100, warehouse: 'Mumbai DC', refType: 'EMERGENCY_REQUEST', refNumber: 'ER-2026-0003', partner: 'Lifeline Hospital Canteen', requested: 50, reserved: 50, allocated: 50, issued: 0, status: 'FULLY_ALLOCATED', expiry: '2026-07-10', autoRelease: 12, createdBy: 'Anita Desai' },
  ]
  const typeColor: Record<string, string> = {
    SALES_ORDER: 'bg-blue-100 text-blue-800',
    PRODUCTION_ORDER: 'bg-purple-100 text-purple-800',
    KITCHEN_ORDER: 'bg-orange-100 text-orange-800',
    TRANSFER_ORDER: 'bg-cyan-100 text-cyan-800',
    MAINTENANCE_ORDER: 'bg-slate-100 text-slate-800',
    PROJECT_RESERVATION: 'bg-violet-100 text-violet-800',
    SAMPLE_RESERVATION: 'bg-pink-100 text-pink-800',
    EMERGENCY_RESERVATION: 'bg-red-100 text-red-800',
    QUALITY_RESERVATION: 'bg-teal-100 text-teal-800',
  }
  const priorityColor: Record<string, string> = {
    EMERGENCY: 'bg-red-600 hover:bg-red-600 text-white',
    CRITICAL: 'bg-orange-500 hover:bg-orange-500 text-white',
    HIGH: 'bg-amber-500 hover:bg-amber-500 text-white',
    NORMAL: 'bg-blue-600 hover:bg-blue-600 text-white',
    LOW: 'bg-slate-500 hover:bg-slate-500 text-white',
  }
  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-blue-600 hover:bg-blue-600 text-white',
    PARTIALLY_ALLOCATED: 'bg-amber-500 hover:bg-amber-500 text-white',
    FULLY_ALLOCATED: 'bg-emerald-600 hover:bg-emerald-600 text-white',
    RELEASED: 'bg-slate-500 hover:bg-slate-500 text-white',
    EXPIRED: 'bg-rose-600 hover:bg-rose-600 text-white',
  }
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> All Reservations ({reservations.length})</h3>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Reservation</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-3 font-medium text-muted-foreground">Reservation #</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Date</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Type</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Priority</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Reference</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Warehouse</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Req</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Rsvd</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Alloc</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Issued</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Status</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Expiry</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="py-2 pr-3 font-mono text-xs">{r.number}</td>
                <td className="py-2 pr-3 text-xs">{r.date}</td>
                <td className="py-2 pr-3"><Badge className={typeColor[r.type]}>{r.type}</Badge></td>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-1">
                    <Badge className={priorityColor[r.priority]}>{r.priority}</Badge>
                    <span className="font-mono text-xs text-muted-foreground">{r.score}</span>
                  </div>
                </td>
                <td className="py-2 pr-3 text-xs"><div className="font-mono">{r.refNumber}</div><div className="text-muted-foreground">{r.partner || '—'}</div></td>
                <td className="py-2 pr-3 text-xs">{r.warehouse}</td>
                <td className="py-2 pr-3 font-mono text-right">{r.requested}</td>
                <td className="py-2 pr-3 font-mono text-right text-blue-600">{r.reserved}</td>
                <td className="py-2 pr-3 font-mono text-right text-purple-600">{r.allocated}</td>
                <td className="py-2 pr-3 font-mono text-right text-emerald-600">{r.issued}</td>
                <td className="py-2 pr-3"><Badge className={statusColor[r.status]}>{r.status}</Badge></td>
                <td className="py-2 pr-3 text-xs">{r.expiry}<div className="text-muted-foreground">{r.autoRelease}h</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function AllocationRulesTab() {
  const rules = [
    { id: 'alr-001', code: 'FEFO-PERISHABLE', name: 'FEFO for Perishable Items', description: 'First Expiry First Out — strict for dairy, sweets, and short-shelf-life products.', strategy: 'FEFO', priority: 10, reservationType: 'SALES_ORDER', category: 'PERISHABLES', productType: 'FINISHED_GOOD', warehouse: 'All Warehouses', batchPreference: 'EXPIRY_BASED', excludeExpired: true, excludeQuarantine: true, excludeBlocked: true, status: 'ACTIVE' },
    { id: 'alr-002', code: 'FIFO-RAW-MATERIAL', name: 'FIFO for Raw Materials', description: 'First In First Out — for raw materials and ingredients in plant warehouse.', strategy: 'FIFO', priority: 20, reservationType: 'PRODUCTION_ORDER', category: 'RAW_MATERIALS', productType: 'RAW_MATERIAL', warehouse: 'Mumbai Plant Warehouse', batchPreference: 'SAME_BATCH', excludeExpired: true, excludeQuarantine: true, excludeBlocked: true, status: 'ACTIVE' },
    { id: 'alr-003', code: 'LIFO-FINISHED', name: 'LIFO for Finished Goods', description: 'Last In First Out — for finished goods in dispatch zone, picks freshest batch first.', strategy: 'LIFO', priority: 30, reservationType: 'SALES_ORDER', category: 'FINISHED_GOODS', productType: 'FINISHED_GOOD', warehouse: 'Mumbai DC', batchPreference: 'AUTO_BATCH', excludeExpired: true, excludeQuarantine: true, excludeBlocked: true, status: 'ACTIVE' },
    { id: 'alr-004', code: 'NEAREST-BIN-PICK', name: 'Nearest Bin for Picking', description: 'Optimize picker travel time — picks from nearest bin to dispatch dock.', strategy: 'NEAREST_BIN', priority: 40, reservationType: 'TRANSFER_ORDER', category: 'ANY', productType: 'ANY', warehouse: 'All Warehouses', batchPreference: 'MULTIPLE_BATCH', excludeExpired: true, excludeQuarantine: true, excludeBlocked: true, status: 'ACTIVE' },
    { id: 'alr-005', code: 'LOWEST-COST-PROJ', name: 'Lowest Cost for Project Reservations', description: 'Select stock from lowest-cost batches for project/event reservations to maximize margin.', strategy: 'LOWEST_COST', priority: 50, reservationType: 'PROJECT_RESERVATION', category: 'FINISHED_GOODS', productType: 'FINISHED_GOOD', warehouse: 'All Warehouses', batchPreference: 'SUPPLIER_BATCH', excludeExpired: true, excludeQuarantine: true, excludeBlocked: true, status: 'ACTIVE' },
    { id: 'alr-006', code: 'HIGHEST-PRIORITY-EMR', name: 'Highest Priority for Emergency', description: 'Override all other reservations — emergency orders get highest-priority stock access.', strategy: 'HIGHEST_PRIORITY', priority: 5, reservationType: 'EMERGENCY_RESERVATION', category: 'ANY', productType: 'ANY', warehouse: 'All Warehouses', batchPreference: 'AUTO_BATCH', excludeExpired: true, excludeQuarantine: false, excludeBlocked: false, status: 'ACTIVE' },
  ]
  const strategyColor: Record<string, string> = {
    FIFO: 'bg-blue-100 text-blue-800',
    FEFO: 'bg-amber-100 text-amber-800',
    LIFO: 'bg-purple-100 text-purple-800',
    NEAREST_BIN: 'bg-cyan-100 text-cyan-800',
    LOWEST_COST: 'bg-emerald-100 text-emerald-800',
    HIGHEST_PRIORITY: 'bg-red-100 text-red-800',
  }
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2"><ListChecks className="h-5 w-5" /> Allocation Rules ({rules.length})</h3>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> New Rule</Button>
        </div>
        <p className="text-xs text-muted-foreground">Rules evaluated by ascending priority (lower number = higher precedence). First matching rule wins for each reservation line.</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rules.map(r => (
          <Card key={r.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{r.code}</p>
                <p className="font-semibold text-sm">{r.name}</p>
              </div>
              <Badge className={strategyColor[r.strategy]}>{r.strategy}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{r.description}</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><span className="font-mono">#{r.priority}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Reservation Type</span><Badge variant="outline" className="text-xs">{r.reservationType}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Product Category</span><span>{r.category}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Warehouse</span><span className="truncate ml-2">{r.warehouse}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Batch Preference</span><Badge variant="outline" className="text-xs">{r.batchPreference}</Badge></div>
            </div>
            <Separator className="my-3" />
            <div className="flex flex-wrap gap-1">
              {r.excludeExpired && <Badge variant="outline" className="text-xs text-rose-700 border-rose-300">No Expired</Badge>}
              {r.excludeQuarantine ? <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">No Quarantine</Badge> : <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300">Allow Quarantine</Badge>}
              {r.excludeBlocked ? <Badge variant="outline" className="text-xs text-red-700 border-red-300">No Blocked</Badge> : <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-300">Allow Blocked</Badge>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AvailabilityTab() {
  const snapshots = [
    { id: 'avs-001', product: 'Kaju Katli 500g', warehouse: 'Mumbai DC', onHand: 480, reserved: 250, allocated: 180, inTransit: 100, blocked: 12, unitCost: 600 },
    { id: 'avs-002', product: 'Sugar (Raw)', warehouse: 'Mumbai Plant Warehouse', onHand: 1500, reserved: 600, allocated: 600, inTransit: 0, blocked: 0, unitCost: 45 },
    { id: 'avs-003', product: 'Ghee (Raw)', warehouse: 'Mumbai Plant Warehouse', onHand: 80, reserved: 40, allocated: 30, inTransit: 50, blocked: 0, unitCost: 520 },
    { id: 'avs-004', product: 'Soan Cake 1kg', warehouse: 'Mumbai DC', onHand: 60, reserved: 80, allocated: 50, inTransit: 40, blocked: 6, unitCost: 625 },
    { id: 'avs-005', product: 'Mixed Namkeen 200g', warehouse: 'Mumbai DC', onHand: 850, reserved: 200, allocated: 150, inTransit: 0, blocked: 24, unitCost: 53 },
    { id: 'avs-006', product: 'Gulab Jamun 1kg', warehouse: 'Mumbai Retail Store 01', onHand: 24, reserved: 30, allocated: 20, inTransit: 0, blocked: 0, unitCost: 304 },
  ]
  const rows = snapshots.map(s => ({
    ...s,
    available: s.onHand - s.reserved - s.allocated - s.blocked,
    totalValue: s.onHand * s.unitCost,
  }))
  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2"><Boxes className="h-5 w-5" /> Availability Snapshots ({rows.length})</h3>
        <Badge variant="outline" className="text-xs">Snapshot: 2026-07-09 09:30 IST</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-3 font-medium text-muted-foreground">Product</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Warehouse</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">On Hand</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Reserved</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Allocated</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">In Transit</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Blocked</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Available</th>
              <th className="py-2 pr-3 font-medium text-muted-foreground">Stock Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="py-2 pr-3 font-medium">{r.product}</td>
                <td className="py-2 pr-3 text-xs">{r.warehouse}</td>
                <td className="py-2 pr-3 font-mono text-right">{r.onHand}</td>
                <td className="py-2 pr-3 font-mono text-right text-amber-600">{r.reserved}</td>
                <td className="py-2 pr-3 font-mono text-right text-purple-600">{r.allocated}</td>
                <td className="py-2 pr-3 font-mono text-right text-blue-600">{r.inTransit}</td>
                <td className="py-2 pr-3 font-mono text-right text-red-600">{r.blocked}</td>
                <td className="py-2 pr-3 font-mono text-right">
                  <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-bold',
                    r.available > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800')}>
                    {r.available > 0 ? `+${r.available}` : r.available}
                  </span>
                </td>
                <td className="py-2 pr-3 font-mono text-right text-xs">{formatINR(r.totalValue)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 font-semibold">
              <td className="py-2 pr-3" colSpan={2}>Totals</td>
              <td className="py-2 pr-3 font-mono text-right">{rows.reduce((s, r) => s + r.onHand, 0)}</td>
              <td className="py-2 pr-3 font-mono text-right text-amber-600">{rows.reduce((s, r) => s + r.reserved, 0)}</td>
              <td className="py-2 pr-3 font-mono text-right text-purple-600">{rows.reduce((s, r) => s + r.allocated, 0)}</td>
              <td className="py-2 pr-3 font-mono text-right text-blue-600">{rows.reduce((s, r) => s + r.inTransit, 0)}</td>
              <td className="py-2 pr-3 font-mono text-right text-red-600">{rows.reduce((s, r) => s + r.blocked, 0)}</td>
              <td className="py-2 pr-3 font-mono text-right">{rows.reduce((s, r) => s + r.available, 0)}</td>
              <td className="py-2 pr-3 font-mono text-right text-xs">{formatINR(rows.reduce((s, r) => s + r.totalValue, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mt-4 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
        <p className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangleIcon className="h-4 w-4" />
          <strong>Short Supply Alert:</strong> 2 items showing negative availability — Soan Cake 1kg (-76) and Gulab Jamun 1kg (-26). Reserved + allocated qty exceeds on-hand. Trigger replenishment or release lower-priority reservations.
        </p>
      </div>
    </Card>
  )
}

// ─── Settings Module (Sprint 2) ─────────────────────────
function SettingsModule() {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Platform Settings</h2>
        <p className="text-slate-300 text-sm">Configuration, Infrastructure, Health Monitoring</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { name: 'PostgreSQL', status: 'healthy', icon: <Database className="h-5 w-5" /> },
          { name: 'Redis', status: 'healthy', icon: <Zap className="h-5 w-5" /> },
          { name: 'RabbitMQ', status: 'healthy', icon: <Activity className="h-5 w-5" /> },
          { name: 'MinIO Storage', status: 'healthy', icon: <HardDrive className="h-5 w-5" /> },
          { name: 'OpenSearch', status: 'offline', icon: <Search className="h-5 w-5" /> },
          { name: 'Backend API', status: 'healthy', icon: <Server className="h-5 w-5" /> },
        ].map(s => (
          <Card key={s.name} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-md', s.status === 'healthy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-muted text-muted-foreground')}>{s.icon}</div>
                <div><p className="text-sm font-medium">{s.name}</p></div>
              </div>
              <Badge className={cn('text-xs', s.status === 'healthy' ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground')}>{s.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Coming Soon Placeholder ────────────────────────────
function ComingSoon({ name }: { name: string }) {
  return (
    <Card className="p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted"><Package className="h-8 w-8 text-muted-foreground" /></div>
        <div><h3 className="font-semibold text-lg">{name}</h3><p className="text-sm text-muted-foreground mt-1">This module is planned for future sprints.</p></div>
      </div>
    </Card>
  )
}

// ─── Main Unified Application ───────────────────────────
export default function Home() {
  const { isAuthenticated, isLoading, initialize, login, logout, loginDemo, isDemoMode } = useAuthStore()
  const [activeModule, setActiveModule] = useState<ModuleKey>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => { initialize() }, [initialize])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl">S</div>
          <div className="flex items-center justify-center gap-2 text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /><p className="text-sm">Loading SUOP Admin...</p></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={async (e, p, r) => { await login(e, p) }} onDemo={loginDemo} />
  }

  const moduleNames: Record<ModuleKey, string> = {
    dashboard: 'Dashboard', organization: 'Organization', rbac: 'RBAC & Security',
    products: 'Product Master', pim: 'PIM Platform', commercial: 'Commercial Engine',
    partners: 'Business Partners', identification: 'Identification & Traceability',
    governance: 'Data Governance', inventory: 'Inventory Engine',
    goodsreceipt: 'Goods Receipt & Putaway', stockissue: 'Stock Issue & Outbound', transfer: 'Stock Transfer', adjustment: 'Adjustments & Write-Off', reservation: 'Reservations & Allocation', settings: 'Settings',
    warehouse: 'Warehouse', manufacturing: 'Manufacturing',
    quality: 'Quality', procurement: 'Procurement', finance: 'Finance', hr: 'Workforce',
    maintenance: 'Maintenance', retail: 'Retail POS', restaurant: 'Restaurant POS',
    analytics: 'Analytics', ai: 'AI Copilot',
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className={cn('flex flex-col border-r bg-sidebar transition-all duration-200 flex-shrink-0', sidebarOpen ? 'w-64' : 'w-0')}>
        {sidebarOpen && (
          <>
            <div className="flex h-16 items-center gap-3 border-b px-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">S</div>
              <div><p className="font-bold text-sm leading-tight">SUOP</p><p className="text-xs text-muted-foreground leading-tight">Sudhastar Unified OS</p></div>
            </div>
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-6">
                {SIDEBAR_SECTIONS.map(section => (
                  <div key={section.section}>
                    <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.section}</p>
                    <div className="space-y-1">
                      {section.items.map(item => (
                        <button key={item.name} disabled={!item.available}
                          className={cn('flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            activeModule === item.module ? 'bg-sidebar-accent text-sidebar-accent-foreground' : item.available ? 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground' : 'text-muted-foreground/40 cursor-not-allowed'
                          )}
                          onClick={() => item.available && setActiveModule(item.module)}
                        >
                          {item.icon}{item.name}
                          {!item.available && <Badge variant="outline" className="text-xs ml-auto">Soon</Badge>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </ScrollArea>
            <div className="border-t p-4"><Button variant="ghost" size="sm" onClick={logout} className="w-full">Sign Out</Button></div>
          </>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b px-6">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
          <h1 className="text-lg font-semibold">{moduleNames[activeModule]}</h1>
          <div className="flex-1" />
          <Badge variant="outline"><Calendar className="mr-1 h-3 w-3" />Sprint 17 · 159 Tables · Part 3</Badge>
          {isDemoMode && <Badge className="bg-amber-500 hover:bg-amber-500 text-amber-950"><Sparkles className="mr-1 h-3 w-3" />Demo Mode</Badge>}
        </header>

        <ScrollArea className="flex-1">
          <main className="p-6 max-w-[1600px] mx-auto">
            {activeModule === 'dashboard' && <DashboardModule />}
            {activeModule === 'organization' && <OrganizationModule />}
            {activeModule === 'rbac' && <RBACModule />}
            {activeModule === 'products' && <ProductMasterModule />}
            {activeModule === 'pim' && <PIMModule />}
            {activeModule === 'commercial' && <CommercialEngineModule />}
            {activeModule === 'partners' && <BusinessPartnerModule />}
            {activeModule === 'identification' && <IdentificationModule />}
            {activeModule === 'governance' && <GovernanceModule />}
            {activeModule === 'inventory' && <InventoryModule />}
            {activeModule === 'goodsreceipt' && <GoodsReceiptModule />}
            {activeModule === 'stockissue' && <StockIssueModule />}
            {activeModule === 'transfer' && <StockTransferModule />}
            {activeModule === 'adjustment' && <AdjustmentModule />}
            {activeModule === 'reservation' && <ReservationModule />}
            {activeModule === 'settings' && <SettingsModule />}
            {(activeModule === 'warehouse' || activeModule === 'manufacturing' || activeModule === 'quality' || activeModule === 'procurement' || activeModule === 'finance' || activeModule === 'hr' || activeModule === 'maintenance' || activeModule === 'retail' || activeModule === 'restaurant' || activeModule === 'analytics' || activeModule === 'ai') && <ComingSoon name={moduleNames[activeModule]} />}
            <div className="text-center text-xs text-muted-foreground py-8">
              <p>SUOP — Sudhastar Unified Operating Platform</p>
              <p className="mt-1">Sprints 1-17 · Part 2 Complete + Part 3 Inventory Engine · 159 Database Tables</p>
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}

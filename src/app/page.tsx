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
  Bell, X, Menu, Star, Grid3x3, List, MoreHorizontal
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
  | 'dashboard' | 'organization' | 'rbac' | 'products' | 'pim'
  | 'inventory' | 'warehouse' | 'manufacturing' | 'quality'
  | 'procurement' | 'finance' | 'hr' | 'maintenance'
  | 'retail' | 'restaurant' | 'analytics' | 'ai' | 'settings'

// ─── Login Screen ───────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (e: string, p: string, r: boolean) => void }) {
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
          <p className="text-center text-xs text-slate-500 mt-4">Sprints 1-7 · Platform Foundation + Master Data + PIM</p>
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
    section: 'Master Data (Sprint 6-7)',
    items: [
      { name: 'Product Master', icon: <Package className="h-4 w-4" />, module: 'products', available: true },
      { name: 'PIM Platform', icon: <Layers className="h-4 w-4" />, module: 'pim', available: true },
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
    section: 'Operations (Planned)',
    items: [
      { name: 'Inventory', icon: <Box className="h-4 w-4" />, module: 'inventory', available: false },
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
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Welcome to SUOP Admin</h2>
        <p className="text-slate-300 text-sm max-w-3xl">
          Sudhastar Unified Operating Platform — Enterprise Operating System for Food Manufacturing,
          Warehouse, Retail & Restaurant Operations. Currently in <span className="font-semibold text-white">Part 2: Master Data Platform (Sprint 7 of 11)</span>.
        </p>
        <div className="flex items-center gap-6 mt-4">
          <div className="text-center"><p className="text-3xl font-bold">69</p><p className="text-xs text-slate-400">Database Tables</p></div>
          <Separator orientation="vertical" className="h-12 bg-slate-700" />
          <div className="text-center"><p className="text-3xl font-bold">815</p><p className="text-xs text-slate-400">Architecture Entities</p></div>
          <Separator orientation="vertical" className="h-12 bg-slate-700" />
          <div className="text-center"><p className="text-3xl font-bold">243</p><p className="text-xs text-slate-400">Arch. Decisions</p></div>
          <Separator orientation="vertical" className="h-12 bg-slate-700" />
          <div className="text-center"><p className="text-3xl font-bold">7</p><p className="text-xs text-slate-400">Sprints Done</p></div>
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
  const { isAuthenticated, isLoading, initialize, login, logout } = useAuthStore()
  const [activeModule, setActiveModule] = useState<ModuleKey>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => { initialize() }, [initialize])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl animate-pulse">S</div>
          <div className="flex items-center justify-center gap-2 text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /><p className="text-sm">Loading SUOP Admin...</p></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={async (e, p, r) => { await login(e, p) }} />
  }

  const moduleNames: Record<ModuleKey, string> = {
    dashboard: 'Dashboard', organization: 'Organization', rbac: 'RBAC & Security',
    products: 'Product Master', pim: 'PIM Platform', settings: 'Settings',
    inventory: 'Inventory', warehouse: 'Warehouse', manufacturing: 'Manufacturing',
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
          <Badge variant="outline"><Calendar className="mr-1 h-3 w-3" />Sprint 7 · 69 Tables · 815 Entities</Badge>
        </header>

        <ScrollArea className="flex-1">
          <main className="p-6 max-w-[1600px] mx-auto">
            {activeModule === 'dashboard' && <DashboardModule />}
            {activeModule === 'organization' && <OrganizationModule />}
            {activeModule === 'rbac' && <RBACModule />}
            {activeModule === 'products' && <ProductMasterModule />}
            {activeModule === 'pim' && <PIMModule />}
            {activeModule === 'settings' && <SettingsModule />}
            {(activeModule === 'inventory' || activeModule === 'warehouse' || activeModule === 'manufacturing' || activeModule === 'quality' || activeModule === 'procurement' || activeModule === 'finance' || activeModule === 'hr' || activeModule === 'maintenance' || activeModule === 'retail' || activeModule === 'restaurant' || activeModule === 'analytics' || activeModule === 'ai') && <ComingSoon name={moduleNames[activeModule]} />}
            <div className="text-center text-xs text-muted-foreground py-8">
              <p>SUOP — Sudhastar Unified Operating Platform</p>
              <p className="mt-1">Sprints 1-7 · Platform Foundation + Master Data + PIM · 69 Database Tables</p>
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}

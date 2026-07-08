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
  Calculator, Gift, Sparkles, PlayCircle, ArrowRightCircle
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
  | 'dashboard' | 'organization' | 'rbac' | 'products' | 'pim' | 'commercial'
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
          <p className="text-center text-xs text-slate-500 mt-4">Sprints 1-8 · Platform Foundation + Master Data + PIM + Commercial Engine</p>
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
    section: 'Master Data (Sprint 6-8)',
    items: [
      { name: 'Product Master', icon: <Package className="h-4 w-4" />, module: 'products', available: true },
      { name: 'PIM Platform', icon: <Layers className="h-4 w-4" />, module: 'pim', available: true },
      { name: 'Commercial Engine', icon: <IndianRupee className="h-4 w-4" />, module: 'commercial', available: true },
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
    { sprint: 'Sprint 8', name: 'Commercial Engine', status: 'done', desc: 'Pricing, GST, Discounts, Promotions, Future Prices, Resolution' },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Welcome to SUOP Admin</h2>
        <p className="text-slate-300 text-sm max-w-3xl">
          Sudhastar Unified Operating Platform — Enterprise Operating System for Food Manufacturing,
          Warehouse, Retail & Restaurant Operations. Currently in <span className="font-semibold text-white">Part 2: Master Data Platform (Sprint 8 of 11)</span>.
        </p>
        <div className="flex items-center gap-6 mt-4">
          <div className="text-center"><p className="text-3xl font-bold">88</p><p className="text-xs text-slate-400">Database Tables</p></div>
          <Separator orientation="vertical" className="h-12 bg-slate-700" />
          <div className="text-center"><p className="text-3xl font-bold">815</p><p className="text-xs text-slate-400">Architecture Entities</p></div>
          <Separator orientation="vertical" className="h-12 bg-slate-700" />
          <div className="text-center"><p className="text-3xl font-bold">243</p><p className="text-xs text-slate-400">Arch. Decisions</p></div>
          <Separator orientation="vertical" className="h-12 bg-slate-700" />
          <div className="text-center"><p className="text-3xl font-bold">8</p><p className="text-xs text-slate-400">Sprints Done</p></div>
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
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl">S</div>
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
    products: 'Product Master', pim: 'PIM Platform', commercial: 'Commercial Engine',
    settings: 'Settings',
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
          <Badge variant="outline"><Calendar className="mr-1 h-3 w-3" />Sprint 8 · 88 Tables · 815 Entities</Badge>
        </header>

        <ScrollArea className="flex-1">
          <main className="p-6 max-w-[1600px] mx-auto">
            {activeModule === 'dashboard' && <DashboardModule />}
            {activeModule === 'organization' && <OrganizationModule />}
            {activeModule === 'rbac' && <RBACModule />}
            {activeModule === 'products' && <ProductMasterModule />}
            {activeModule === 'pim' && <PIMModule />}
            {activeModule === 'commercial' && <CommercialEngineModule />}
            {activeModule === 'settings' && <SettingsModule />}
            {(activeModule === 'inventory' || activeModule === 'warehouse' || activeModule === 'manufacturing' || activeModule === 'quality' || activeModule === 'procurement' || activeModule === 'finance' || activeModule === 'hr' || activeModule === 'maintenance' || activeModule === 'retail' || activeModule === 'restaurant' || activeModule === 'analytics' || activeModule === 'ai') && <ComingSoon name={moduleNames[activeModule]} />}
            <div className="text-center text-xs text-muted-foreground py-8">
              <p>SUOP — Sudhastar Unified Operating Platform</p>
              <p className="mt-1">Sprints 1-8 · Platform Foundation + Master Data + PIM + Commercial Engine · 88 Database Tables</p>
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}

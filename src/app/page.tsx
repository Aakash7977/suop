'use client'

import { useState, useEffect } from 'react'
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, Loader2,
  Shield, ArrowRight, Keyboard,
  ChevronRight, ChevronDown, Plus, Search,
  Factory, Warehouse, Store, DollarSign,
  Users, Wrench, BarChart3, Brain, Settings, Network,
  Layers, Calendar, Package, Box,
  CheckCircle2, Tag, Scale, FileText, Filter, Download, Upload,
  GitBranch, Star, FolderTree, FileCheck,
  History, Languages, ClipboardCheck, Globe, ShieldCheck, Archive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

// ─── PIM Sample Data ────────────────────────────────────
const FAMILIES = [
  { code: 'INDIAN_SWEETS', name: 'Indian Sweets', products: 6, status: 'ACTIVE' },
  { code: 'NAMKEEN', name: 'Namkeen', products: 4, status: 'ACTIVE' },
  { code: 'BAKERY', name: 'Bakery', products: 8, status: 'ACTIVE' },
  { code: 'BEVERAGES', name: 'Beverages', products: 3, status: 'ACTIVE' },
  { code: 'FROZEN', name: 'Frozen Foods', products: 2, status: 'ACTIVE' },
  { code: 'PACKAGING_MAT', name: 'Packaging Materials', products: 5, status: 'ACTIVE' },
]

const COLLECTIONS = [
  { code: 'DIWALI_2026', name: 'Diwali Collection 2026', type: 'FESTIVAL', items: 12, status: 'ACTIVE' },
  { code: 'WEDDING', name: 'Wedding Collection', type: 'MARKETING', items: 8, status: 'ACTIVE' },
  { code: 'PREMIUM', name: 'Premium Collection', type: 'MARKETING', items: 5, status: 'ACTIVE' },
  { code: 'EXPORT', name: 'Export Collection', type: 'EXPORT', items: 6, status: 'ACTIVE' },
  { code: 'CORP_GIFT', name: 'Corporate Gift Collection', type: 'CORPORATE', items: 4, status: 'ACTIVE' },
]

const COMPLIANCE_RECORDS = [
  { product: 'Kaju Katli 250g', type: 'FSSAI', cert: 'FSS-12345678', status: 'APPROVED', expiry: '2027-03-15' },
  { product: 'Kaju Katli 500g', type: 'FSSAI', cert: 'FSS-12345679', status: 'APPROVED', expiry: '2027-03-15' },
  { product: 'Badam Pista Roll', type: 'FSSAI', cert: 'FSS-12345680', status: 'APPROVED', expiry: '2027-06-20' },
  { product: 'Chocolate Wafer 100g', type: 'FSSAI', cert: 'FSS-12345681', status: 'PENDING', expiry: null },
  { product: 'Kaju Katli 250g', type: 'ISO_22000', cert: 'ISO-2026-001', status: 'APPROVED', expiry: '2028-01-10' },
  { product: 'Kaju Katli 250g', type: 'HACCP', cert: 'HACCP-2026-045', status: 'EXPIRED', expiry: '2026-03-01' },
]

const APPROVAL_QUEUE = [
  { req: 'PAR-2026-001', product: 'Kaju Katli 100g', stage: 'QA_REVIEW', submittedBy: 'Priya S.', submittedAt: '2026-07-06', sla: '2026-07-09', status: 'IN_REVIEW' },
  { req: 'PAR-2026-002', product: 'Milk Burfi 250g', stage: 'COMPLIANCE_REVIEW', submittedBy: 'Rahul K.', submittedAt: '2026-07-05', sla: '2026-07-08', status: 'IN_REVIEW' },
  { req: 'PAR-2026-003', product: 'Chocolate Wafer 200g', stage: 'APPROVED', submittedBy: 'Amit P.', submittedAt: '2026-07-03', sla: '2026-07-07', status: 'APPROVED' },
  { req: 'PAR-2026-004', product: 'Kaju Katli 1kg', stage: 'PUBLISHED', submittedBy: 'Priya S.', submittedAt: '2026-07-01', sla: '2026-07-05', status: 'PUBLISHED' },
  { req: 'PAR-2026-005', product: 'Cooking Oil 15L', stage: 'DRAFT', submittedBy: 'Suresh M.', submittedAt: '2026-07-08', sla: '2026-07-12', status: 'PENDING' },
]

const VERSIONS = [
  { version: 3, product: 'Kaju Katli 250g', changeType: 'PRICE_CHANGE', summary: 'MRP updated from ₹420 to ₹450', editor: 'Finance Team', date: '2026-07-05', current: true },
  { version: 2, product: 'Kaju Katli 250g', changeType: 'SPEC_UPDATE', summary: 'Updated nutritional values', editor: 'QA Team', date: '2026-06-15', current: false },
  { version: 1, product: 'Kaju Katli 250g', changeType: 'CREATE', summary: 'Product created', editor: 'Priya S.', date: '2026-01-10', current: false },
]

const TEMPLATES = [
  { code: 'SWEET_TEMPLATE', name: 'Sweet Product Template', defaults: 'Category: Sweets, UOM: PCS, Shelf Life: 30d', status: 'ACTIVE' },
  { code: 'NAMKEEN_TEMPLATE', name: 'Namkeen Product Template', defaults: 'Category: Namkeen, UOM: PCS, Shelf Life: 60d', status: 'ACTIVE' },
  { code: 'RAW_MAT_TEMPLATE', name: 'Raw Material Template', defaults: 'Type: RAW_MATERIAL, Track Batch: Yes', status: 'ACTIVE' },
  { code: 'PACKAGING_TEMPLATE', name: 'Packaging Material Template', defaults: 'Type: PACKAGING, Sold: No, Stock: Yes', status: 'ACTIVE' },
]

const STAGE_COLORS: Record<string, string> = {
  DRAFT: 'bg-blue-600 hover:bg-blue-600 text-white',
  QA_REVIEW: 'bg-amber-500 hover:bg-amber-500 text-white',
  COMPLIANCE_REVIEW: 'bg-purple-600 hover:bg-purple-600 text-white',
  APPROVED: 'bg-emerald-600 hover:bg-emerald-600 text-white',
  PUBLISHED: 'bg-emerald-700 hover:bg-emerald-700 text-white',
  REJECTED: 'bg-red-600 hover:bg-red-600 text-white',
  EXPIRED: 'bg-orange-500 hover:bg-orange-500 text-white',
  PENDING: 'bg-muted text-muted-foreground',
}

// ─── Login (compact) ────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (e: string, p: string, r: boolean) => void }) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [show, setShow] = useState(false), [rem, setRem] = useState(false), [loading, setLoading] = useState(false)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl">S</div>
          <div><h1 className="text-2xl font-bold text-white">SUOP Admin</h1><p className="text-sm text-slate-400">Sudhastar Unified Operating Platform</p></div>
          <Badge variant="outline" className="border-slate-600 text-slate-300"><Package className="mr-1 h-3 w-3" /> PIM Platform</Badge>
        </div>
        <Card className="p-6 bg-slate-900/80 backdrop-blur border-slate-700">
          <form onSubmit={async (e) => { e.preventDefault(); setLoading(true); await onLogin(email, password, rem); setLoading(false) }} className="space-y-4">
            <div className="space-y-2"><Label className="text-slate-200">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="email" placeholder="admin@sudhastar.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10 bg-slate-800 border-slate-600 text-white" /></div></div>
            <div className="space-y-2"><Label className="text-slate-200">Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type={show ? 'text' : 'password'} placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 pr-10 bg-slate-800 border-slate-600 text-white" /><button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            <div className="flex items-center space-x-2"><input id="rem" type="checkbox" checked={rem} onChange={(e) => setRem(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary" /><Label htmlFor="rem" className="text-sm text-slate-300 cursor-pointer">Remember me</Label></div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : <>Sign In<ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
          </form>
          <Separator className="bg-slate-700 mt-6" /><p className="text-center text-xs text-slate-500 mt-4">Sprint 7 — PIM Platform</p>
        </Card>
      </div>
    </div>
  )
}

// ─── PIM Dashboard ──────────────────────────────────────
function PIMDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('overview')

  const sidebar = [
    { section: 'PIM', items: [
      { name: 'Overview', icon: <BarChart3 className="h-4 w-4" />, tab: 'overview' },
      { name: 'Families', icon: <FolderTree className="h-4 w-4" />, tab: 'families' },
      { name: 'Collections', icon: <Archive className="h-4 w-4" />, tab: 'collections' },
      { name: 'Templates', icon: <Layers className="h-4 w-4" />, tab: 'templates' },
      { name: 'Compliance', icon: <ShieldCheck className="h-4 w-4" />, tab: 'compliance' },
      { name: 'Approval Queue', icon: <ClipboardCheck className="h-4 w-4" />, tab: 'approvals' },
      { name: 'Version History', icon: <History className="h-4 w-4" />, tab: 'versions' },
      { name: 'Usage Matrix', icon: <GitBranch className="h-4 w-4" />, tab: 'matrix' },
    ]},
    { section: 'Products', items: [
      { name: 'All Products', icon: <Package className="h-4 w-4" /> },
      { name: 'Categories', icon: <Layers className="h-4 w-4" /> },
      { name: 'Brands', icon: <Tag className="h-4 w-4" /> },
    ]},
    { section: 'Operations', items: [
      { name: 'Inventory', icon: <Box className="h-4 w-4" /> },
      { name: 'Warehouse', icon: <Warehouse className="h-4 w-4" /> },
    ]},
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="flex flex-col border-r bg-sidebar w-64 flex-shrink-0">
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">S</div>
          <div><p className="font-bold text-sm">SUOP</p><p className="text-xs text-muted-foreground">PIM Platform</p></div>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-6">
            {sidebar.map(s => (
              <div key={s.section}>
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase">{s.section}</p>
                <div className="space-y-1">
                  {s.items.map(item => (
                    <button key={item.name} className={cn('flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors', 'tab' in item && item.tab === activeTab ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/50')} onClick={() => 'tab' in item && setActiveTab(item.tab)}>{item.icon}{item.name}</button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-4"><Button variant="ghost" size="sm" onClick={onLogout} className="w-full">Sign Out</Button></div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b px-6">
          <h1 className="text-lg font-semibold capitalize">{activeTab}</h1>
          <div className="flex-1" />
          <Badge variant="outline"><Calendar className="mr-1 h-3 w-3" />Sprint 7 — PIM</Badge>
        </header>

        <ScrollArea className="flex-1">
          <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
            {/* Overview */}
            {activeTab === 'overview' && (
              <>
                <Card className="p-6 bg-gradient-to-r from-indigo-950 to-purple-900 text-white border-0">
                  <h2 className="text-2xl font-bold mb-1">Enterprise Product Information Management</h2>
                  <p className="text-indigo-300 text-sm">SUOP PIM transforms Product Master into a governed, classified, compliant, multi-language product platform — comparable to SAP MDG, Oracle Product Hub, and Microsoft Dynamics 365 PIM.</p>
                </Card>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'Product Families', value: FAMILIES.length, icon: <FolderTree className="h-5 w-5 text-blue-600" /> },
                    { label: 'Collections', value: COLLECTIONS.length, icon: <Archive className="h-5 w-5 text-purple-600" /> },
                    { label: 'Pending Approvals', value: APPROVAL_QUEUE.filter(a => a.status === 'IN_REVIEW' || a.status === 'PENDING').length, icon: <ClipboardCheck className="h-5 w-5 text-amber-600" /> },
                    { label: 'Compliance Records', value: COMPLIANCE_RECORDS.length, icon: <ShieldCheck className="h-5 w-5 text-emerald-600" /> },
                  ].map(s => (
                    <Card key={s.label} className="p-4"><div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div><p className="text-2xl font-bold">{s.value}</p></Card>
                  ))}
                </div>
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">PIM Workflow Pipeline</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {['Draft', 'QA Review', 'Compliance Review', 'Finance Review', 'Approved', 'Published'].map((stage, i) => (
                      <div key={stage} className="flex items-center gap-2">
                        <Badge className={cn('text-xs', STAGE_COLORS[stage.toUpperCase().replace(' ', '_')] || 'bg-muted')}>{stage}</Badge>
                        {i < 5 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {/* Families */}
            {activeTab === 'families' && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4"><h3 className="font-semibold flex items-center gap-2"><FolderTree className="h-5 w-5" /> Product Families</h3><Button size="sm"><Plus className="mr-1 h-3 w-3" />Add Family</Button></div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {FAMILIES.map(f => (
                    <Card key={f.code} className="p-4"><div className="flex items-center gap-3 mb-2"><div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"><FolderTree className="h-5 w-5" /></div><div><p className="font-medium">{f.name}</p><p className="text-xs text-muted-foreground font-mono">{f.code}</p></div></div><div className="flex items-center gap-2"><Badge variant="outline" className="text-xs">{f.products} products</Badge><Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs">{f.status}</Badge></div></Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Archives */}
            {activeTab === 'collections' && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4"><h3 className="font-semibold flex items-center gap-2"><Archive className="h-5 w-5" /> Product Collections</h3><Button size="sm"><Plus className="mr-1 h-3 w-3" />Add Collection</Button></div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {COLLECTIONS.map(c => (
                    <Card key={c.code} className="p-4"><div className="flex items-center gap-3 mb-2"><div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400"><Archive className="h-5 w-5" /></div><div><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground font-mono">{c.code}</p></div></div><div className="flex items-center gap-2"><Badge variant="outline" className="text-xs">{c.type}</Badge><Badge variant="outline" className="text-xs">{c.items} items</Badge></div></Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Templates */}
            {activeTab === 'templates' && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4"><h3 className="font-semibold flex items-center gap-2"><Layers className="h-5 w-5" /> Product Templates</h3><Button size="sm"><Plus className="mr-1 h-3 w-3" />Add Template</Button></div>
                <div className="space-y-3">
                  {TEMPLATES.map(t => (
                    <div key={t.code} className="flex items-center gap-4 p-4 rounded-lg border">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"><Layers className="h-5 w-5" /></div>
                      <div className="flex-1"><p className="font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.defaults}</p></div>
                      <Badge variant="outline" className="text-xs font-mono">{t.code}</Badge>
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs">{t.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Compliance */}
            {activeTab === 'compliance' && (
              <Card className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><ShieldCheck className="h-5 w-5" /> Product Compliance Management</h3>
                <div className="rounded-lg border overflow-hidden">
                  <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase"><span>Product</span><span>Type</span><span>Certificate</span><span>Expiry</span><span>Status</span></div>
                  {COMPLIANCE_RECORDS.map((c, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2 px-4 py-3 border-t text-sm">
                      <span className="font-medium">{c.product}</span>
                      <Badge variant="outline" className="text-xs w-fit">{c.type.replace(/_/g, ' ')}</Badge>
                      <span className="font-mono text-xs">{c.cert}</span>
                      <span className="text-xs">{c.expiry || '—'}</span>
                      <Badge className={cn('text-xs', STAGE_COLORS[c.status] || 'bg-muted')}>{c.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Approval Queue */}
            {activeTab === 'approvals' && (
              <Card className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><ClipboardCheck className="h-5 w-5" /> Product Approval Queue</h3>
                <div className="rounded-lg border overflow-hidden">
                  <div className="grid grid-cols-6 gap-2 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase"><span>Request</span><span>Product</span><span>Current Stage</span><span>Submitted By</span><span>SLA Due</span><span>Status</span></div>
                  {APPROVAL_QUEUE.map(a => (
                    <div key={a.req} className="grid grid-cols-6 gap-2 px-4 py-3 border-t text-sm">
                      <span className="font-mono text-xs">{a.req}</span>
                      <span className="font-medium">{a.product}</span>
                      <Badge className={cn('text-xs', STAGE_COLORS[a.stage] || 'bg-muted')}>{a.stage.replace(/_/g, ' ')}</Badge>
                      <span className="text-xs">{a.submittedBy}</span>
                      <span className="text-xs">{a.sla}</span>
                      <Badge className={cn('text-xs', STAGE_COLORS[a.status] || 'bg-muted')}>{a.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Versions */}
            {activeTab === 'versions' && (
              <Card className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><History className="h-5 w-5" /> Product Version History</h3>
                <div className="space-y-3">
                  {VERSIONS.map(v => (
                    <div key={v.version} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm', v.current ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground')}>v{v.version}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{v.product}</span>
                          <Badge variant="outline" className="text-xs">{v.changeType.replace(/_/g, ' ')}</Badge>
                          {v.current && <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs">CURRENT</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{v.summary}</p>
                        <p className="text-xs text-muted-foreground mt-1">By {v.editor} on {v.date}</p>
                      </div>
                      {!v.current && <Button variant="outline" size="sm"><History className="mr-1 h-3 w-3" />Rollback</Button>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Usage Matrix */}
            {activeTab === 'matrix' && (
              <Card className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><GitBranch className="h-5 w-5" /> Product Usage Matrix</h3>
                <p className="text-sm text-muted-foreground mb-4">Each product explicitly defines where it is allowed to be used — preventing accidental misuse while maintaining one unified Product Master.</p>
                <div className="rounded-lg border overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr className="text-xs font-semibold text-muted-foreground uppercase">
                        <th className="text-left px-4 py-3">Product</th>
                        <th className="text-center px-4 py-3">Mfg</th>
                        <th className="text-center px-4 py-3">Warehouse</th>
                        <th className="text-center px-4 py-3">Retail POS</th>
                        <th className="text-center px-4 py-3">Restaurant POS</th>
                        <th className="text-center px-4 py-3">E-commerce</th>
                        <th className="text-center px-4 py-3">Purchase</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Kaju Katli 250g', mfg: true, wh: true, retail: true, rst: false, eco: true, pur: false },
                        { name: 'Sugar 50kg Bag', mfg: true, wh: true, retail: false, rst: true, eco: false, pur: true },
                        { name: 'Packaging Box 250g', mfg: true, wh: true, retail: false, rst: false, eco: false, pur: true },
                        { name: 'Chocolate Wafer 100g', mfg: true, wh: true, retail: true, rst: false, eco: true, pur: false },
                        { name: 'Cooking Oil 15L', mfg: true, wh: true, retail: false, rst: true, eco: false, pur: true },
                      ].map(p => (
                        <tr key={p.name} className="border-t">
                          <td className="px-4 py-3 font-medium text-sm">{p.name}</td>
                          <td className="px-4 py-3 text-center">{p.mfg ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                          <td className="px-4 py-3 text-center">{p.wh ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                          <td className="px-4 py-3 text-center">{p.retail ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                          <td className="px-4 py-3 text-center">{p.rst ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                          <td className="px-4 py-3 text-center">{p.eco ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                          <td className="px-4 py-3 text-center">{p.pur ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            <div className="text-center text-xs text-muted-foreground py-4">
              <p>SUOP — Sudhastar Unified Operating Platform</p>
              <p className="mt-1">Volume 1 — Part 2: Master Data Platform · Sprint 7 — PIM</p>
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}

// ─── Main ───────────────────────────────────────────────
export default function Home() {
  const { isAuthenticated, isLoading, initialize, login, logout } = useAuthStore()
  useEffect(() => { initialize() }, [initialize])
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-950"><div className="text-center space-y-4"><div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl animate-pulse">S</div><div className="flex items-center justify-center gap-2 text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /><p className="text-sm">Loading SUOP Admin...</p></div></div></div>
  if (!isAuthenticated) return <LoginScreen onLogin={async (e, p, r) => { await login(e, p) }} />
  return <PIMDashboard onLogout={logout} />
}

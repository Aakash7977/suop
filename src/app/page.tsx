'use client'

import { useState, useEffect } from 'react'
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, Loader2,
  Shield, ArrowRight, KeyRound, Keyboard,
  Building2, ChevronRight, ChevronDown, Plus, Search,
  Factory, Warehouse, Store, UtensilsCrossed, DollarSign,
  Users, Wrench, BarChart3, Brain, Settings, Network,
  Layers, MapPin, Calendar, Package, Box
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuthStore } from '@/stores/auth-store'
import { useOrgContextStore } from '@/stores/org-context-store'
import { cn } from '@/lib/utils'

// ─── Organization Tree Data ─────────────────────────────
interface OrgNode {
  id: string
  type: 'ENTERPRISE' | 'COMPANY' | 'BU' | 'BRANCH' | 'PLANT' | 'WAREHOUSE' | 'DEPARTMENT' | 'COST_CENTER'
  code: string
  name: string
  status: string
  children?: OrgNode[]
}

const SAMPLE_TREE: OrgNode[] = [
  {
    id: 'ent-1', type: 'ENTERPRISE', code: 'SUDHASTAR', name: 'Sudhastar Group', status: 'ACTIVE',
    children: [
      {
        id: 'cmp-1', type: 'COMPANY', code: 'SFL', name: 'Sudhastar Foods Ltd.', status: 'ACTIVE',
        children: [
          {
            id: 'bu-1', type: 'BU', code: 'MFG-BU', name: 'Manufacturing BU', status: 'ACTIVE',
            children: [
              {
                id: 'br-1', type: 'BRANCH', code: 'MUM-PLT', name: 'Mumbai Plant', status: 'ACTIVE',
                children: [
                  { id: 'pl-1', type: 'PLANT', code: 'MUM-P1', name: 'Production Line 1', status: 'ACTIVE' },
                  { id: 'wh-1', type: 'WAREHOUSE', code: 'MUM-WH-RM', name: 'Raw Material Warehouse', status: 'ACTIVE' },
                  { id: 'wh-2', type: 'WAREHOUSE', code: 'MUM-WH-FG', name: 'Finished Goods Warehouse', status: 'ACTIVE' },
                ]
              },
              {
                id: 'br-2', type: 'BRANCH', code: 'PUN-PLT', name: 'Pune Plant', status: 'ACTIVE',
                children: [
                  { id: 'pl-2', type: 'PLANT', code: 'PUN-P1', name: 'Production Line 1', status: 'ACTIVE' },
                  { id: 'wh-3', type: 'WAREHOUSE', code: 'PUN-WH-RM', name: 'Raw Material Warehouse', status: 'ACTIVE' },
                ]
              }
            ]
          },
          {
            id: 'bu-2', type: 'BU', code: 'RTL-BU', name: 'Retail BU', status: 'ACTIVE',
            children: [
              { id: 'br-3', type: 'BRANCH', code: 'MUM-STR-01', name: 'Mumbai Store 01', status: 'ACTIVE' },
              { id: 'br-4', type: 'BRANCH', code: 'MUM-STR-02', name: 'Mumbai Store 02', status: 'ACTIVE' },
              { id: 'br-5', type: 'BRANCH', code: 'PUN-STR-01', name: 'Pune Store 01', status: 'ACTIVE' },
            ]
          },
          {
            id: 'bu-3', type: 'BU', code: 'RST-BU', name: 'Restaurant BU', status: 'ACTIVE',
            children: [
              { id: 'br-6', type: 'BRANCH', code: 'MUM-RST-01', name: 'Mumbai Restaurant 01', status: 'ACTIVE' },
              { id: 'br-7', type: 'BRANCH', code: 'PUN-RST-01', name: 'Pune Restaurant 01', status: 'ACTIVE' },
            ]
          },
        ]
      },
      {
        id: 'cmp-2', type: 'COMPANY', code: 'SLL', name: 'Sudhastar Logistics Ltd.', status: 'ACTIVE',
        children: [
          {
            id: 'bu-4', type: 'BU', code: 'DIST-BU', name: 'Distribution BU', status: 'ACTIVE',
            children: [
              { id: 'br-8', type: 'BRANCH', code: 'MUM-DC', name: 'Mumbai Distribution Center', status: 'ACTIVE' },
              { id: 'wh-4', type: 'WAREHOUSE', code: 'MUM-DC-WH', name: 'DC Warehouse', status: 'ACTIVE' },
            ]
          }
        ]
      }
    ]
  }
]

const NODE_ICONS: Record<string, React.ReactNode> = {
  ENTERPRISE: <Network className="h-4 w-4 text-blue-600" />,
  COMPANY: <Building2 className="h-4 w-4 text-purple-600" />,
  BU: <Layers className="h-4 w-4 text-indigo-600" />,
  BRANCH: <MapPin className="h-4 w-4 text-emerald-600" />,
  PLANT: <Factory className="h-4 w-4 text-orange-600" />,
  WAREHOUSE: <Warehouse className="h-4 w-4 text-amber-600" />,
  DEPARTMENT: <Users className="h-4 w-4 text-cyan-600" />,
  COST_CENTER: <DollarSign className="h-4 w-4 text-green-600" />,
}

const NODE_LABELS: Record<string, string> = {
  ENTERPRISE: 'Enterprise', COMPANY: 'Company', BU: 'Business Unit',
  BRANCH: 'Branch', PLANT: 'Plant', WAREHOUSE: 'Warehouse',
  DEPARTMENT: 'Department', COST_CENTER: 'Cost Center',
}

// ─── Tree Node Component ────────────────────────────────
function TreeNode({ node, depth, onSelect, selectedId }: {
  node: OrgNode, depth: number, onSelect: (n: OrgNode) => void, selectedId?: string
}) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors',
          selectedId === node.id && 'bg-primary/10 border border-primary/20'
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="flex-shrink-0"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <div className="w-3" />
        )}
        {NODE_ICONS[node.type]}
        <span className="text-sm font-medium flex-1 truncate">{node.name}</span>
        <Badge variant="outline" className="text-xs font-mono">{node.code}</Badge>
        <Badge variant={node.status === 'ACTIVE' ? 'default' : 'secondary'}
          className={node.status === 'ACTIVE' ? 'text-xs bg-emerald-600 hover:bg-emerald-600 text-white' : 'text-xs'}>
          {node.status}
        </Badge>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} selectedId={selectedId} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Login Screen ───────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (email: string, password: string, remember: boolean) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    await onLogin(email, password, remember)
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setCapsLockOn(!!(e.getModifierState && e.getModifierState('CapsLock')))
  }

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
            <Shield className="mr-1 h-3 w-3" /> Enterprise Identity Platform
          </Badge>
        </div>

        <Card className="p-6 bg-slate-900/80 backdrop-blur border-slate-700">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="email" type="email" placeholder="admin@sudhastar.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} required
                  className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} required
                  className="pl-10 pr-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {capsLockOn && (
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <Keyboard className="h-3 w-3" /> Caps Lock is on
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input id="remember" type="checkbox" checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary" />
              <Label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer">Remember me for 30 days</Label>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-950/50 border border-red-800 p-3">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>) : (<>Sign In<ArrowRight className="ml-2 h-4 w-4" /></>)}
            </Button>
          </form>
          <Separator className="bg-slate-700 mt-6" />
          <p className="text-center text-xs text-slate-500 mt-4">Sprint 4 — Organization Platform</p>
        </Card>
      </div>
    </div>
  )
}

// ─── Organization Dashboard Screen ──────────────────────
function OrgDashboard({ onLogout }: { onLogout: () => void }) {
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'tree' | 'enterprise' | 'company' | 'branch' | 'plant' | 'warehouse' | 'department' | 'costcenter'>('tree')
  const orgContext = useOrgContextStore()

  const breadcrumb = orgContext.getBreadcrumb()

  const sidebarSections = [
    { label: 'Operations', items: [
      { name: 'Dashboard', icon: <BarChart3 className="h-4 w-4" />, tab: 'tree' as const },
      { name: 'Inventory', icon: <Box className="h-4 w-4" /> },
      { name: 'Warehouse', icon: <Warehouse className="h-4 w-4" /> },
      { name: 'Manufacturing', icon: <Factory className="h-4 w-4" /> },
      { name: 'Quality', icon: <Shield className="h-4 w-4" /> },
    ]},
    { label: 'Organization', items: [
      { name: 'Enterprise', icon: <Network className="h-4 w-4" />, tab: 'enterprise' as const },
      { name: 'Companies', icon: <Building2 className="h-4 w-4" />, tab: 'company' as const },
      { name: 'Branches', icon: <MapPin className="h-4 w-4" />, tab: 'branch' as const },
      { name: 'Plants', icon: <Factory className="h-4 w-4" />, tab: 'plant' as const },
      { name: 'Warehouses', icon: <Warehouse className="h-4 w-4" />, tab: 'warehouse' as const },
      { name: 'Departments', icon: <Users className="h-4 w-4" />, tab: 'department' as const },
      { name: 'Cost Centers', icon: <DollarSign className="h-4 w-4" />, tab: 'costcenter' as const },
    ]},
    { label: 'Business', items: [
      { name: 'Procurement', icon: <Package className="h-4 w-4" /> },
      { name: 'Finance', icon: <DollarSign className="h-4 w-4" /> },
      { name: 'Workforce', icon: <Users className="h-4 w-4" /> },
      { name: 'Maintenance', icon: <Wrench className="h-4 w-4" /> },
    ]},
    { label: 'Channels', items: [
      { name: 'Retail POS', icon: <Store className="h-4 w-4" /> },
      { name: 'Restaurant POS', icon: <UtensilsCrossed className="h-4 w-4" /> },
    ]},
    { label: 'Intelligence', items: [
      { name: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
      { name: 'AI Copilot', icon: <Brain className="h-4 w-4" /> },
    ]},
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex flex-col border-r bg-sidebar w-64 flex-shrink-0">
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">S</div>
          <div>
            <p className="font-bold text-sm leading-tight">SUOP</p>
            <p className="text-xs text-muted-foreground leading-tight">Sudhastar Unified OS</p>
          </div>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-6">
            {sidebarSections.map(section => (
              <div key={section.label}>
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.label}</p>
                <div className="space-y-1">
                  {section.items.map(item => (
                    <button key={item.name}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        'tab' in item && item.tab === activeTab
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                      )}
                      onClick={() => 'tab' in item && setActiveTab(item.tab)}
                    >
                      {item.icon}
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>
        <div className="border-t p-4">
          <Button variant="ghost" size="sm" onClick={onLogout} className="w-full">Sign Out</Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header with Global Context Breadcrumb */}
        <header className="flex h-16 items-center gap-4 border-b px-6">
          <h1 className="text-lg font-semibold capitalize">{activeTab === 'tree' ? 'Organization Tree' : activeTab}</h1>
          {breadcrumb.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {breadcrumb.map((c, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3 w-3" />}
                  <Badge variant="outline" className="text-xs">{c.level}: {c.name}</Badge>
                </span>
              ))}
            </div>
          )}
          <div className="flex-1" />
          <Badge variant="outline">
            <Calendar className="mr-1 h-3 w-3" />
            Sprint 4 — Organization Platform
          </Badge>
        </header>

        {/* Content */}
        <ScrollArea className="flex-1">
          <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
            {activeTab === 'tree' && (
              <>
                {/* Welcome */}
                <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
                  <h2 className="text-2xl font-bold mb-1">Enterprise Organization Platform</h2>
                  <p className="text-slate-300 text-sm">
                    Complete organizational hierarchy: Enterprise → Company → Business Unit → Branch → Plant → Warehouse → Department.
                    Every module in SUOP references these entities.
                  </p>
                </Card>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'Enterprises', value: 1, icon: <Network className="h-5 w-5 text-blue-600" /> },
                    { label: 'Companies', value: 2, icon: <Building2 className="h-5 w-5 text-purple-600" /> },
                    { label: 'Branches', value: 8, icon: <MapPin className="h-5 w-5 text-emerald-600" /> },
                    { label: 'Warehouses', value: 4, icon: <Warehouse className="h-5 w-5 text-amber-600" /> },
                  ].map(s => (
                    <Card key={s.label} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        {s.icon}
                      </div>
                      <p className="text-2xl font-bold">{s.value}</p>
                    </Card>
                  ))}
                </div>

                {/* Tree View */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Network className="h-5 w-5 text-muted-foreground" />
                      Organization Tree
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-8 w-48 h-8 text-sm" />
                      </div>
                      <Button size="sm" variant="outline">
                        <Plus className="mr-1 h-3 w-3" /> Add Entity
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[500px]">
                    {SAMPLE_TREE.map(node => (
                      <TreeNode key={node.id} node={node} depth={0}
                        onSelect={setSelectedNode} selectedId={selectedNode?.id} />
                    ))}
                  </ScrollArea>
                </Card>

                {/* Selected Node Details */}
                {selectedNode && (
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {NODE_ICONS[selectedNode.type]}
                      <div>
                        <h3 className="font-semibold text-lg">{selectedNode.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {NODE_LABELS[selectedNode.type]} · {selectedNode.code}
                        </p>
                      </div>
                      <div className="flex-1" />
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">{selectedNode.status}</Badge>
                    </div>
                    <Separator className="mb-4" />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Entity Type</p>
                        <p className="text-sm font-medium">{NODE_LABELS[selectedNode.type]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Code</p>
                        <p className="text-sm font-medium font-mono">{selectedNode.code}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">{selectedNode.status}</Badge>
                      </div>
                    </div>
                    {selectedNode.children && selectedNode.children.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <p className="text-xs text-muted-foreground mb-2">Child Entities ({selectedNode.children.length})</p>
                        <div className="space-y-1">
                          {selectedNode.children.map(child => (
                            <div key={child.id} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer"
                              onClick={() => setSelectedNode(child)}>
                              {NODE_ICONS[child.type]}
                              <span className="text-sm flex-1">{child.name}</span>
                              <Badge variant="outline" className="text-xs font-mono">{child.code}</Badge>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </Card>
                )}
              </>
            )}

            {activeTab !== 'tree' && (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    {activeTab === 'enterprise' && <Network className="h-8 w-8 text-muted-foreground" />}
                    {activeTab === 'company' && <Building2 className="h-8 w-8 text-muted-foreground" />}
                    {activeTab === 'branch' && <MapPin className="h-8 w-8 text-muted-foreground" />}
                    {activeTab === 'plant' && <Factory className="h-8 w-8 text-muted-foreground" />}
                    {activeTab === 'warehouse' && <Warehouse className="h-8 w-8 text-muted-foreground" />}
                    {activeTab === 'department' && <Users className="h-8 w-8 text-muted-foreground" />}
                    {activeTab === 'costcenter' && <DollarSign className="h-8 w-8 text-muted-foreground" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg capitalize">{activeTab} Management</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                      CRUD interface for {activeTab}s will be implemented with data table, search, filters, and form modals.
                    </p>
                  </div>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create {activeTab}
                  </Button>
                </div>
              </Card>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground py-4">
              <p>SUOP — Sudhastar Unified Operating Platform</p>
              <p className="mt-1">Volume 1 — Enterprise Development Blueprint · Sprint 4 — Organization Platform</p>
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────
export default function Home() {
  const { isAuthenticated, isLoading, initialize, login, logout } = useAuthStore()

  useEffect(() => { initialize() }, [initialize])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-3xl animate-pulse">S</div>
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm">Loading SUOP Admin...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={async (email, password, remember) => { await login(email, password) }} />
  }

  return <OrgDashboard onLogout={logout} />
}

'use client'

import { useState, useEffect } from 'react'
import {
  Eye, EyeOff, Lock, Mail, AlertCircle, Loader2,
  Shield, ArrowRight, KeyRound, Keyboard,
  Building2, ChevronRight, ChevronDown, Plus, Search,
  Factory, Warehouse, Store, UtensilsCrossed, DollarSign,
  Users, Wrench, BarChart3, Brain, Settings, Network,
  Layers, MapPin, Calendar, Package, Box,
  CheckCircle2, ToggleLeft, ToggleRight, ShieldCheck,
  UserCog, Flag, Menu as MenuIcon, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

// ─── RBAC Data ──────────────────────────────────────────
const ROLES = [
  { code: 'SUPER_ADMIN', name: 'Super Administrator', category: 'EXECUTIVE', type: 'SYSTEM', users: 1, permissions: 250 },
  { code: 'ENT_ADMIN', name: 'Enterprise Administrator', category: 'EXECUTIVE', type: 'BUILTIN', users: 2, permissions: 200 },
  { code: 'CMP_ADMIN', name: 'Company Administrator', category: 'EXECUTIVE', type: 'BUILTIN', users: 5, permissions: 180 },
  { code: 'FIN_MGR', name: 'Finance Manager', category: 'MANAGEMENT', type: 'BUILTIN', users: 3, permissions: 85 },
  { code: 'HR_MGR', name: 'HR Manager', category: 'MANAGEMENT', type: 'BUILTIN', users: 2, permissions: 75 },
  { code: 'PURCH_MGR', name: 'Purchase Manager', category: 'MANAGEMENT', type: 'BUILTIN', users: 4, permissions: 60 },
  { code: 'WH_MGR', name: 'Warehouse Manager', category: 'MANAGER', type: 'BUILTIN', users: 6, permissions: 55 },
  { code: 'PROD_MGR', name: 'Production Manager', category: 'MANAGER', type: 'BUILTIN', users: 4, permissions: 50 },
  { code: 'QUAL_MGR', name: 'Quality Manager', category: 'MANAGER', type: 'BUILTIN', users: 3, permissions: 45 },
  { code: 'MAINT_MGR', name: 'Maintenance Manager', category: 'MANAGER', type: 'BUILTIN', users: 2, permissions: 40 },
  { code: 'RTL_MGR', name: 'Retail Manager', category: 'MANAGER', type: 'BUILTIN', users: 8, permissions: 35 },
  { code: 'RST_MGR', name: 'Restaurant Manager', category: 'MANAGER', type: 'BUILTIN', users: 5, permissions: 35 },
  { code: 'CASHIER', name: 'Cashier', category: 'OPERATOR', type: 'BUILTIN', users: 25, permissions: 15 },
  { code: 'AUDITOR', name: 'Auditor', category: 'CLERK', type: 'BUILTIN', users: 2, permissions: 30 },
  { code: 'VIEWER', name: 'Viewer', category: 'CLERK', type: 'BUILTIN', users: 10, permissions: 20 },
]

const PERMISSION_MODULES = [
  { module: 'PLATFORM', label: 'Platform', permissions: 45, color: 'text-blue-600' },
  { module: 'ORGANIZATION', label: 'Organization', permissions: 30, color: 'text-purple-600' },
  { module: 'INVENTORY', label: 'Inventory', permissions: 25, color: 'text-indigo-600' },
  { module: 'WAREHOUSE', label: 'Warehouse', permissions: 35, color: 'text-amber-600' },
  { module: 'MANUFACTURING', label: 'Manufacturing', permissions: 40, color: 'text-orange-600' },
  { module: 'FINANCE', label: 'Finance', permissions: 50, color: 'text-green-600' },
  { module: 'HR', label: 'Workforce', permissions: 45, color: 'text-cyan-600' },
  { module: 'MAINTENANCE', label: 'Maintenance', permissions: 30, color: 'text-red-600' },
  { module: 'REPORTS', label: 'Reports', permissions: 15, color: 'text-slate-600' },
  { module: 'SETTINGS', label: 'Settings', permissions: 10, color: 'text-muted-foreground' },
]

const FEATURE_FLAGS = [
  { key: 'ai_copilot', name: 'AI Copilot', state: 'PILOT', targets: ['Corporate'], killSwitch: false },
  { key: 'ai_agents', name: 'AI Agents', state: 'DISABLED', targets: [], killSwitch: false },
  { key: 'digital_twin', name: 'Digital Twin', state: 'BETA', targets: ['Mumbai Plant'], killSwitch: false },
  { key: 'offline_pos', name: 'Offline POS', state: 'ENABLED', targets: ['All Stores'], killSwitch: false },
  { key: 'multi_currency', name: 'Multi-Currency', state: 'ENABLED', targets: ['All'], killSwitch: false },
  { key: 'predictive_maintenance', name: 'Predictive Maintenance', state: 'DISABLED', targets: [], killSwitch: false },
  { key: 'auto_reorder', name: 'Auto Reorder', state: 'GRADUAL_ROLLOUT', targets: ['50% rollout'], killSwitch: false },
  { key: 'voice_commands', name: 'Voice Commands', state: 'DISABLED', targets: [], killSwitch: true },
]

const APPROVAL_LEVELS = [
  { level: 1, role: 'Department Head', min: 0, max: 25000, currency: 'INR', sla: 24 },
  { level: 2, role: 'Finance Manager', min: 25000, max: 200000, currency: 'INR', sla: 48 },
  { level: 3, role: 'Director', min: 200000, max: 1000000, currency: 'INR', sla: 72 },
  { level: 4, role: 'CEO', min: 1000000, max: null, currency: 'INR', sla: 96 },
]

const SECURITY_POLICIES = [
  { code: 'WH_WORKING_HOURS', name: 'Warehouse Working Hours', type: 'WORKING_HOURS', scope: 'Warehouse roles', action: 'DENY', status: 'ACTIVE' },
  { code: 'OFFICE_IP_ONLY', name: 'Office IP Restriction', type: 'IP_RESTRICTION', scope: 'Finance roles', action: 'DENY', status: 'ACTIVE' },
  { code: 'INDIA_ONLY', name: 'India Country Restriction', type: 'COUNTRY_RESTRICTION', scope: 'All roles', action: 'DENY', status: 'ACTIVE' },
  { code: 'MAX_3_SESSIONS', name: 'Max Concurrent Sessions', type: 'CONCURRENT_SESSIONS', scope: 'All roles', action: 'DENY', status: 'ACTIVE' },
  { code: 'PWD_EXPIRY_90', name: 'Password Expiry 90 Days', type: 'PASSWORD_POLICY', scope: 'All roles', action: 'REQUIRE_MFA', status: 'ACTIVE' },
]

const STATE_COLORS: Record<string, string> = {
  ENABLED: 'bg-emerald-600 hover:bg-emerald-600 text-white',
  DISABLED: 'bg-muted text-muted-foreground',
  BETA: 'bg-blue-600 hover:bg-blue-600 text-white',
  PILOT: 'bg-purple-600 hover:bg-purple-600 text-white',
  GRADUAL_ROLLOUT: 'bg-amber-500 hover:bg-amber-500 text-white',
}

// ─── Login Screen ───────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (email: string, password: string, remember: boolean) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onLogin(email, password, remember)
    setLoading(false)
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
              <Label className="text-slate-200">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input type="email" placeholder="admin@sudhastar.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => setCapsLockOn(!!(e.getModifierState && e.getModifierState('CapsLock')))}
                  required className="pl-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                  onKeyDown={(e) => setCapsLockOn(!!(e.getModifierState && e.getModifierState('CapsLock')))}
                  className="pl-10 pr-10 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {capsLockOn && <div className="flex items-center gap-1 text-xs text-amber-400"><Keyboard className="h-3 w-3" /> Caps Lock is on</div>}
            </div>
            <div className="flex items-center space-x-2">
              <input id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary" />
              <Label htmlFor="remember" className="text-sm text-slate-300 cursor-pointer">Remember me for 30 days</Label>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</>) : (<>Sign In<ArrowRight className="ml-2 h-4 w-4" /></>)}
            </Button>
          </form>
          <Separator className="bg-slate-700 mt-6" />
          <p className="text-center text-xs text-slate-500 mt-4">Sprint 5 — Authorization Platform</p>
        </Card>
      </div>
    </div>
  )
}

// ─── RBAC Management Screen ─────────────────────────────
function RBACDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('roles')

  const sidebarItems = [
    { section: 'Operations', items: [
      { name: 'Dashboard', icon: <BarChart3 className="h-4 w-4" />, tab: 'dashboard' },
      { name: 'Inventory', icon: <Box className="h-4 w-4" /> },
      { name: 'Warehouse', icon: <Warehouse className="h-4 w-4" /> },
    ]},
    { section: 'Administration', items: [
      { name: 'Roles', icon: <Shield className="h-4 w-4" />, tab: 'roles' },
      { name: 'Permissions', icon: <ShieldCheck className="h-4 w-4" />, tab: 'permissions' },
      { name: 'User Groups', icon: <Users className="h-4 w-4" />, tab: 'groups' },
      { name: 'Feature Flags', icon: <Flag className="h-4 w-4" />, tab: 'flags' },
      { name: 'Approval Matrix', icon: <CheckCircle2 className="h-4 w-4" />, tab: 'approvals' },
      { name: 'Security Policies', icon: <AlertTriangle className="h-4 w-4" />, tab: 'policies' },
      { name: 'Menu Builder', icon: <MenuIcon className="h-4 w-4" />, tab: 'menus' },
    ]},
    { section: 'Organization', items: [
      { name: 'Enterprise', icon: <Network className="h-4 w-4" /> },
      { name: 'Companies', icon: <Building2 className="h-4 w-4" /> },
      { name: 'Branches', icon: <MapPin className="h-4 w-4" /> },
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
            {sidebarItems.map(section => (
              <div key={section.section}>
                <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.section}</p>
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
                      {item.icon}{item.name}
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
        <header className="flex h-16 items-center gap-4 border-b px-6">
          <h1 className="text-lg font-semibold capitalize">{activeTab === 'dashboard' ? 'Dashboard' : activeTab}</h1>
          <div className="flex-1" />
          <Badge variant="outline">
            <Calendar className="mr-1 h-3 w-3" />
            Sprint 5 — Authorization Platform
          </Badge>
        </header>

        <ScrollArea className="flex-1">
          <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <>
                <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
                  <h2 className="text-2xl font-bold mb-1">🎉 Platform Foundation Complete</h2>
                  <p className="text-slate-300 text-sm">
                    Sprint 5 completes the Platform Foundation. Sprints 1-5 have built: Project Bootstrap,
                    Core Infrastructure, Identity Platform, Organization Platform, and Authorization Platform.
                    Next: Enterprise Master Data Platform (Part 2).
                  </p>
                </Card>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'Roles', value: ROLES.length, icon: <Shield className="h-5 w-5 text-blue-600" /> },
                    { label: 'Permission Modules', value: PERMISSION_MODULES.length, icon: <ShieldCheck className="h-5 w-5 text-emerald-600" /> },
                    { label: 'Feature Flags', value: FEATURE_FLAGS.length, icon: <Flag className="h-5 w-5 text-amber-600" /> },
                    { label: 'Security Policies', value: SECURITY_POLICIES.length, icon: <AlertTriangle className="h-5 w-5 text-red-600" /> },
                  ].map(s => (
                    <Card key={s.label} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}
                      </div>
                      <p className="text-2xl font-bold">{s.value}</p>
                    </Card>
                  ))}
                </div>
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Platform Foundation Progress</h3>
                  <div className="space-y-3">
                    {[
                      { sprint: 'Sprint 1', name: 'Project Bootstrap', status: 'done' },
                      { sprint: 'Sprint 2', name: 'Core Infrastructure', status: 'done' },
                      { sprint: 'Sprint 3', name: 'Identity Platform', status: 'done' },
                      { sprint: 'Sprint 4', name: 'Organization Platform', status: 'done' },
                      { sprint: 'Sprint 5', name: 'Authorization Platform', status: 'done' },
                    ].map(s => (
                      <div key={s.sprint} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <Badge variant="outline" className="font-mono">{s.sprint}</Badge>
                        <span className="flex-1">{s.name}</span>
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">Complete</Badge>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Phase 1: Platform Foundation</span>
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                      <CheckCircle2 className="mr-1 h-3 w-3" />100% COMPLETE
                    </Badge>
                  </div>
                </Card>
              </>
            )}

            {/* Roles */}
            {activeTab === 'roles' && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2"><Shield className="h-5 w-5" /> Role Management</h3>
                  <Button size="sm"><Plus className="mr-1 h-3 w-3" /> Create Role</Button>
                </div>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-6 gap-2 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                    <span>Role Code</span><span>Role Name</span><span>Category</span><span>Type</span><span>Users</span><span>Permissions</span>
                  </div>
                  {ROLES.map(role => (
                    <div key={role.code} className="grid grid-cols-6 gap-2 px-4 py-3 border-t text-sm hover:bg-muted/30">
                      <span className="font-mono text-xs">{role.code}</span>
                      <span className="font-medium">{role.name}</span>
                      <Badge variant="outline" className="text-xs w-fit">{role.category}</Badge>
                      <Badge variant={role.type === 'SYSTEM' ? 'default' : 'secondary'} className="text-xs w-fit">{role.type}</Badge>
                      <span>{role.users}</span>
                      <span>{role.permissions}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Permissions */}
            {activeTab === 'permissions' && (
              <Card className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><ShieldCheck className="h-5 w-5" /> Permission Matrix by Module</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {PERMISSION_MODULES.map(m => (
                    <Card key={m.module} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {m.label === 'Platform' && <Settings className={cn('h-4 w-4', m.color)} />}
                        {m.label === 'Organization' && <Network className={cn('h-4 w-4', m.color)} />}
                        {m.label === 'Inventory' && <Box className={cn('h-4 w-4', m.color)} />}
                        {m.label === 'Warehouse' && <Warehouse className={cn('h-4 w-4', m.color)} />}
                        {m.label === 'Manufacturing' && <Factory className={cn('h-4 w-4', m.color)} />}
                        {m.label === 'Finance' && <DollarSign className={cn('h-4 w-4', m.color)} />}
                        {m.label === 'Workforce' && <Users className={cn('h-4 w-4', m.color)} />}
                        {m.label === 'Maintenance' && <Wrench className={cn('h-4 w-4', m.color)} />}
                        {m.label === 'Reports' && <BarChart3 className={cn('h-4 w-4', m.color)} />}
                        {m.label === 'Settings' && <Settings className={cn('h-4 w-4', m.color)} />}
                        <span className="text-sm font-medium">{m.label}</span>
                      </div>
                      <p className="text-2xl font-bold">{m.permissions}</p>
                      <p className="text-xs text-muted-foreground">permissions</p>
                      <Separator className="my-2" />
                      <div className="flex flex-wrap gap-1">
                        {['CREATE','READ','UPDATE','DELETE','APPROVE','EXPORT'].map(a => (
                          <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Feature Flags */}
            {activeTab === 'flags' && (
              <Card className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><Flag className="h-5 w-5" /> Feature Flag Management</h3>
                <div className="space-y-2">
                  {FEATURE_FLAGS.map(f => (
                    <div key={f.key} className="flex items-center gap-4 p-3 rounded-lg border">
                      <Switch checked={f.state === 'ENABLED' || f.state === 'BETA' || f.state === 'PILOT' || f.state === 'GRADUAL_ROLLOUT'} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{f.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{f.key}</p>
                      </div>
                      {f.targets.length > 0 && (
                        <div className="flex items-center gap-1">
                          {f.targets.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                        </div>
                      )}
                      <Badge className={cn('text-xs', STATE_COLORS[f.state] || 'bg-muted')}>{f.state}</Badge>
                      {f.killSwitch && <Badge variant="destructive" className="text-xs">KILL SWITCH</Badge>}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Approval Matrix */}
            {activeTab === 'approvals' && (
              <Card className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><CheckCircle2 className="h-5 w-5" /> Approval Authority Matrix</h3>
                <p className="text-sm text-muted-foreground mb-4">Purchase Order approval levels by amount</p>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase">
                    <span>Level</span><span>Approver Role</span><span>Min Amount</span><span>Max Amount</span><span>SLA (hours)</span>
                  </div>
                  {APPROVAL_LEVELS.map(l => (
                    <div key={l.level} className="grid grid-cols-5 gap-2 px-4 py-3 border-t text-sm">
                      <Badge variant="outline">Level {l.level}</Badge>
                      <span className="font-medium">{l.role}</span>
                      <span className="font-mono">₹{l.min.toLocaleString('en-IN')}</span>
                      <span className="font-mono">{l.max ? `₹${l.max.toLocaleString('en-IN')}` : 'Unlimited'}</span>
                      <span>{l.sla}h</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Security Policies */}
            {activeTab === 'policies' && (
              <Card className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><AlertTriangle className="h-5 w-5" /> Security Policies</h3>
                <div className="space-y-2">
                  {SECURITY_POLICIES.map(p => (
                    <div key={p.code} className="flex items-center gap-4 p-3 rounded-lg border">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.code}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{p.type.replace(/_/g, ' ')}</Badge>
                      <Badge variant="outline" className="text-xs">{p.scope}</Badge>
                      <Badge variant={p.action === 'DENY' ? 'destructive' : 'default'} className="text-xs">{p.action}</Badge>
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs">ACTIVE</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* User Groups */}
            {activeTab === 'groups' && (
              <Card className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><Users className="h-5 w-5" /> User Groups</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {['Finance Team','Warehouse Team','Production Team','Restaurant Team','Retail Team','Corporate Team','Auditors','IT Team'].map(g => (
                    <Card key={g} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                          <Users className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">{g}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{Math.floor(Math.random() * 20) + 3} members</p>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Menu Builder */}
            {activeTab === 'menus' && (
              <Card className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-4"><MenuIcon className="h-5 w-5" /> Dynamic Menu Builder</h3>
                <p className="text-sm text-muted-foreground mb-4">Menus are generated dynamically based on user permissions. Each menu item requires one or more permissions to be visible.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Warehouse Manager Menu</p>
                    <div className="space-y-1">
                      {['Dashboard','Inventory','Warehouse','Inbound','Outbound','Reports'].map(m => (
                        <div key={m} className="flex items-center gap-2 py-1 text-sm"><ChevronRight className="h-3 w-3" />{m}</div>
                      ))}
                    </div>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Cashier Menu</p>
                    <div className="space-y-1">
                      {['Billing','Sales','Customers','Returns','Cash Drawer'].map(m => (
                        <div key={m} className="flex items-center gap-2 py-1 text-sm"><ChevronRight className="h-3 w-3" />{m}</div>
                      ))}
                    </div>
                  </Card>
                </div>
              </Card>
            )}

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground py-4">
              <p>SUOP — Sudhastar Unified Operating Platform</p>
              <p className="mt-1">Volume 1 — Enterprise Development Blueprint · Sprint 5 — Authorization Platform · Phase 1 COMPLETE</p>
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

  return <RBACDashboard onLogout={logout} />
}

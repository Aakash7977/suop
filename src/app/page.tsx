'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Package, Warehouse, Factory, ShieldCheck,
  Store, UtensilsCrossed, DollarSign, Users, Wrench,
  BarChart3, Brain, Settings, Bell, Search, Menu, X,
  CheckCircle2, AlertCircle, Clock, Server, Database,
  HardDrive, Activity, Zap, ArrowRight, Box
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────
interface ServiceHealth {
  name: string
  status: 'healthy' | 'degraded' | 'offline' | 'pending'
  latency?: number
  icon: React.ReactNode
}

interface ModuleInfo {
  name: string
  code: string
  icon: React.ReactNode
  status: 'planned' | 'in-progress' | 'ready'
  entityCount: number
  description: string
}

// ─── Data ───────────────────────────────────────────────
const SUOP_MODULES: ModuleInfo[] = [
  { name: 'Organization', code: 'ORG', icon: <Building2 className="h-5 w-5" />, status: 'planned', entityCount: 15, description: 'Company, Branch, Department, Facility' },
  { name: 'Product', code: 'PROD', icon: <Package className="h-5 w-5" />, status: 'planned', entityCount: 10, description: 'Product Master, Variants, Packaging' },
  { name: 'Inventory', code: 'INV', icon: <Box className="h-5 w-5" />, status: 'planned', entityCount: 10, description: 'Immutable Ledger, Batches, Reservations' },
  { name: 'Procurement', code: 'PROC', icon: <ShoppingCart className="h-5 w-5" />, status: 'planned', entityCount: 10, description: 'Vendors, Purchase Orders, GRN' },
  { name: 'Warehouse', code: 'WMS', icon: <Warehouse className="h-5 w-5" />, status: 'planned', entityCount: 10, description: 'WMS, Pick/Pack/Ship, Locations' },
  { name: 'Manufacturing', code: 'MES', icon: <Factory className="h-5 w-5" />, status: 'planned', entityCount: 60, description: 'MES, BOM, Routing, Production' },
  { name: 'Quality', code: 'QMS', icon: <ShieldCheck className="h-5 w-5" />, status: 'planned', entityCount: 60, description: 'QMS, Inspections, CAPA, Compliance' },
  { name: 'Retail', code: 'RTL', icon: <Store className="h-5 w-5" />, status: 'planned', entityCount: 60, description: 'POS, Store Operations, Customer' },
  { name: 'Restaurant', code: 'RST', icon: <UtensilsCrossed className="h-5 w-5" />, status: 'planned', entityCount: 50, description: 'Restaurant POS, Kitchen, Menu' },
  { name: 'Finance', code: 'FIN', icon: <DollarSign className="h-5 w-5" />, status: 'planned', entityCount: 100, description: 'GL, AP/AR, Journal, Treasury' },
  { name: 'Workforce', code: 'HR', icon: <Users className="h-5 w-5" />, status: 'planned', entityCount: 130, description: 'HR, Payroll, Attendance, Performance' },
  { name: 'Maintenance', code: 'EAM', icon: <Wrench className="h-5 w-5" />, status: 'planned', entityCount: 90, description: 'EAM, Work Orders, PM, Reliability' },
  { name: 'Platform', code: 'PLT', icon: <Server className="h-5 w-5" />, status: 'in-progress', entityCount: 120, description: 'Auth, RBAC, Workflow, Audit, API' },
  { name: 'AI & Analytics', code: 'AI', icon: <Brain className="h-5 w-5" />, status: 'planned', entityCount: 90, description: 'AI Gateway, Copilot, BI, Mission Control' },
]

const SERVICES: ServiceHealth[] = [
  { name: 'PostgreSQL', status: 'pending', icon: <Database className="h-4 w-4" /> },
  { name: 'Redis', status: 'pending', icon: <Zap className="h-4 w-4" /> },
  { name: 'RabbitMQ', status: 'pending', icon: <Activity className="h-4 w-4" /> },
  { name: 'MinIO Storage', status: 'pending', icon: <HardDrive className="h-4 w-4" /> },
  { name: 'OpenSearch', status: 'pending', icon: <Search className="h-4 w-4" /> },
  { name: 'Backend API', status: 'pending', icon: <Server className="h-4 w-4" /> },
]

const SIDEBAR_SECTIONS = [
  {
    label: 'Operations',
    items: [
      { name: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, active: true },
      { name: 'Inventory', icon: <Box className="h-4 w-4" /> },
      { name: 'Warehouse', icon: <Warehouse className="h-4 w-4" /> },
      { name: 'Manufacturing', icon: <Factory className="h-4 w-4" /> },
      { name: 'Quality', icon: <ShieldCheck className="h-4 w-4" /> },
    ]
  },
  {
    label: 'Business',
    items: [
      { name: 'Procurement', icon: <ShoppingCart className="h-4 w-4" /> },
      { name: 'Finance', icon: <DollarSign className="h-4 w-4" /> },
      { name: 'Workforce', icon: <Users className="h-4 w-4" /> },
      { name: 'Maintenance', icon: <Wrench className="h-4 w-4" /> },
    ]
  },
  {
    label: 'Channels',
    items: [
      { name: 'Retail POS', icon: <Store className="h-4 w-4" /> },
      { name: 'Restaurant POS', icon: <UtensilsCrossed className="h-4 w-4" /> },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { name: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
      { name: 'AI Copilot', icon: <Brain className="h-4 w-4" /> },
    ]
  },
  {
    label: 'System',
    items: [
      { name: 'Settings', icon: <Settings className="h-4 w-4" /> },
    ]
  },
]

// ─── Helper Components ──────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className?: string }> = {
    'healthy': { variant: 'default', label: 'Healthy', className: 'bg-emerald-600 hover:bg-emerald-600 text-white' },
    'degraded': { variant: 'default', label: 'Degraded', className: 'bg-amber-500 hover:bg-amber-500 text-white' },
    'offline': { variant: 'destructive', label: 'Offline' },
    'pending': { variant: 'secondary', label: 'Pending' },
    'planned': { variant: 'outline', label: 'Planned' },
    'in-progress': { variant: 'default', label: 'In Progress', className: 'bg-blue-600 hover:bg-blue-600 text-white' },
    'ready': { variant: 'default', label: 'Ready', className: 'bg-emerald-600 hover:bg-emerald-600 text-white' },
  }
  const c = config[status] || config['pending']
  return <Badge variant={c.variant} className={c.className}>{c.label}</Badge>
}

function ServiceHealthCard({ service }: { service: ServiceHealth }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md",
          service.status === 'healthy' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
          service.status === 'degraded' && "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
          service.status === 'offline' && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
          service.status === 'pending' && "bg-muted text-muted-foreground",
        )}>
          {service.icon}
        </div>
        <div>
          <p className="text-sm font-medium">{service.name}</p>
          {service.latency && <p className="text-xs text-muted-foreground">{service.latency}ms</p>}
        </div>
      </div>
      <StatusBadge status={service.status} />
    </div>
  )
}

function ModuleCard({ module }: { module: ModuleInfo }) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-default group">
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
          module.status === 'in-progress' ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400" :
          module.status === 'ready' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" :
          "bg-muted text-muted-foreground"
        )}>
          {module.icon}
        </div>
        <StatusBadge status={module.status} />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{module.name}</h3>
          <Badge variant="outline" className="text-xs font-mono">{module.code}</Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{module.description}</p>
        <div className="flex items-center gap-1 pt-1">
          <Badge variant="secondary" className="text-xs">{module.entityCount} entities</Badge>
        </div>
      </div>
    </Card>
  )
}

// ─── Additional Icons ───────────────────────────────────
function Building2({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
}
function ShoppingCart({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
}

// ─── Main Page ──────────────────────────────────────────
export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [services, setServices] = useState<ServiceHealth[]>(SERVICES)
  const [healthCheckDone, setHealthCheckDone] = useState(false)

  // Simulate health check on mount
  useEffect(() => {
    const checkHealth = async () => {
      // Try to call backend health API
      try {
        const response = await fetch('/api/health?XTransformPort=3030')
        if (response.ok) {
          const data = await response.json()
          setServices(prev => prev.map(s => {
            if (s.name === 'Backend API') return { ...s, status: 'healthy', latency: 12 }
            if (data.services) {
              const match = data.services.find((ds: { name: string }) => ds.name === s.name)
              if (match) return { ...s, status: match.status, latency: match.latency }
            }
            return s
          }))
        } else {
          // Backend not running yet — mark as pending
          setServices(prev => prev.map(s => ({ ...s, status: 'pending' as const })))
        }
      } catch {
        // Backend not running yet — mark as pending
        setServices(prev => prev.map(s => ({ ...s, status: 'pending' as const })))
      }
      setHealthCheckDone(true)
    }
    checkHealth()
  }, [])

  const healthyCount = services.filter(s => s.status === 'healthy').length
  const totalEntities = SUOP_MODULES.reduce((sum, m) => sum + m.entityCount, 0)
  const inProgressModules = SUOP_MODULES.filter(m => m.status === 'in-progress').length
  const plannedModules = SUOP_MODULES.filter(m => m.status === 'planned').length

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ─── Sidebar ─── */}
      <aside className={cn(
        "flex flex-col border-r bg-sidebar transition-all duration-200",
        sidebarOpen ? "w-64" : "w-0"
      )}>
        {sidebarOpen && (
          <>
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b px-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                S
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">SUOP</p>
                <p className="text-xs text-muted-foreground leading-tight">Sudhastar Unified OS</p>
              </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4">
              <nav className="space-y-6">
                {SIDEBAR_SECTIONS.map((section) => (
                  <div key={section.label}>
                    <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.label}
                    </p>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <button
                          key={item.name}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            item.active
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          )}
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

            {/* Footer */}
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  AD
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Admin User</p>
                  <p className="text-xs text-muted-foreground truncate">Sprint 2 — Enterprise Core Infrastructure</p>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <Badge variant="outline" className="hidden sm:flex">
              <Clock className="mr-1 h-3 w-3" />
              Sprint 2 — Enterprise Core Infrastructure
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Search className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search (Cmd+K)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        {/* Content Area */}
        <ScrollArea className="flex-1">
          <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
            {/* ─── Welcome Banner ─── */}
            <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Welcome to SUOP Admin</h2>
                  <p className="text-slate-300 text-sm max-w-2xl">
                    Sudhastar Unified Operating Platform — Enterprise Operating System for Food Manufacturing,
                    Warehouse, Retail & Restaurant Operations. Currently in <span className="font-semibold text-white">Sprint 2: Enterprise Core Infrastructure</span>.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{totalEntities}</p>
                    <p className="text-xs text-slate-400">Entities Defined</p>
                  </div>
                  <Separator orientation="vertical" className="h-12 bg-slate-700" />
                  <div className="text-center">
                    <p className="text-3xl font-bold">14</p>
                    <p className="text-xs text-slate-400">Modules</p>
                  </div>
                  <Separator orientation="vertical" className="h-12 bg-slate-700" />
                  <div className="text-center">
                    <p className="text-3xl font-bold">243</p>
                    <p className="text-xs text-slate-400">Arch. Decisions</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* ─── System Health ─── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">System Health</h3>
                </div>
                {healthCheckDone && (
                  <Badge variant={healthyCount === services.length ? "default" : "secondary"}
                    className={healthyCount === services.length ? "bg-emerald-600 hover:bg-emerald-600 text-white" : ""}>
                    {healthyCount}/{services.length} Services Healthy
                  </Badge>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {services.map(service => (
                  <ServiceHealthCard key={service.name} service={service} />
                ))}
              </div>
              {!healthCheckDone && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Clock className="h-3 w-3 animate-spin" />
                  Checking service health...
                </p>
              )}
              {healthCheckDone && healthyCount === 0 && (
                <div className="mt-3 rounded-lg border border-dashed p-4 text-center">
                  <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">Infrastructure services not detected</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Run <code className="bg-muted px-1.5 py-0.5 rounded text-xs">docker compose up</code> to start PostgreSQL, Redis, RabbitMQ, MinIO, and the backend API.
                  </p>
                </div>
              )}
            </div>

            {/* ─── Sprint Progress ─── */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Sprint 2 — Enterprise Core Infrastructure</h3>
                </div>
                <Badge variant="outline">In Progress</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">50%</span>
                </div>
                <Progress value={50} className="h-2" />
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                  {[
                    { name: 'Repository Initialization', status: 'done' },
                    { name: 'Monorepo Setup', status: 'done' },
                    { name: 'Docker Infrastructure', status: 'done' },
                    { name: 'Admin Application Bootstrap', status: 'done' },
                    { name: 'Configuration Framework', status: 'done' },
                    { name: 'Database Foundation (Prisma)', status: 'done' },
                    { name: 'Redis & RabbitMQ Platform', status: 'done' },
                    { name: 'Logging & Exception Framework', status: 'done' },
                    { name: 'Shared SDK & UI Library', status: 'done' },
                    { name: 'CI/CD Pipeline', status: 'done' },
                  ].map(epic => (
                    <div key={epic.name} className="flex items-center gap-2 text-sm">
                      {epic.status === 'done' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : epic.status === 'in-progress' ? (
                        <Clock className="h-4 w-4 text-amber-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-muted" />
                      )}
                      <span className={epic.status === 'done' ? 'text-foreground' : 'text-muted-foreground'}>
                        {epic.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* ─── Module Overview ─── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Enterprise Modules</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="default" className="bg-blue-600 hover:bg-blue-600 text-white">
                    {inProgressModules} In Progress
                  </Badge>
                  <Badge variant="outline">{plannedModules} Planned</Badge>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {SUOP_MODULES.map(module => (
                  <ModuleCard key={module.code} module={module} />
                ))}
              </div>
            </div>

            {/* ─── Architecture Summary ─── */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-muted-foreground" />
                Architecture Summary
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-muted-foreground">Architecture Volumes (0, 0.5, 0.75)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">815</p>
                  <p className="text-xs text-muted-foreground">Enterprise Entities Defined</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">66</p>
                  <p className="text-xs text-muted-foreground">Foundation Services</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">150+</p>
                  <p className="text-xs text-muted-foreground">AI Capabilities Locked</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Architecture Phase</span>
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Complete & Locked
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Implementation Phase</span>
                <Badge variant="default" className="bg-blue-600 hover:bg-blue-600 text-white">
                  <ArrowRight className="mr-1 h-3 w-3" />
                  Sprint 2 — In Progress
                </Badge>
              </div>
            </Card>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground py-4">
              <p>SUOP — Sudhastar Unified Operating Platform</p>
              <p className="mt-1">Volume 1 — Enterprise Development Blueprint · Sprint 2 — Enterprise Core Infrastructure</p>
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  )
}

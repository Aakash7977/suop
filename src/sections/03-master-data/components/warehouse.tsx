/**
 * Section 03 — Master Data Management
 * Warehouse Module — Live API Integration
 *
 * 5 sub-tabs:
 * 1. Overview    — Stats from live warehouse + zones
 * 2. Warehouses  — GET /api/v1/organization/warehouses (live)
 * 3. Zones       — GET /api/v1/warehouse/zones (live)
 * 4. Temperature — NO backend → EmptyState
 * 5. Rules       — NO backend → EmptyState
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Search, Download, X, Loader2, AlertCircle,
  Warehouse, Layers3, Thermometer, Snowflake, Droplets,
  Gauge, AlertTriangle, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared'
import { orgWarehouseApi, warehouseApi } from '../api/clients'

type WarehouseTab = 'overview' | 'warehouses' | 'zones' | 'temperature' | 'rules'

export function WarehouseModule() {
  const [tab, setTab] = useState<WarehouseTab>('overview')
  const tabs: Array<{ key: WarehouseTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'warehouses', label: 'Warehouses', icon: <Warehouse className="h-4 w-4" /> },
    { key: 'zones', label: 'Zones', icon: <Layers3 className="h-4 w-4" /> },
    { key: 'temperature', label: 'Temperature', icon: <Thermometer className="h-4 w-4" /> },
    { key: 'rules', label: 'Rules', icon: <ShieldCheck className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-amber-950 via-orange-900 to-yellow-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Warehouse className="h-7 w-7" /> Enterprise Warehouse Master
            </h2>
            <p className="text-amber-200 text-sm max-w-3xl">
              Multi-warehouse management with zones, temperature control, and operating rules.
              11 warehouse types: Raw Material, Packaging, Finished Goods, Cold Storage, Deep Freeze,
              Returns, Transit, Quarantine, Scrap, Distribution Center, Dark Store.
            </p>
          </div>
          <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500">Sprint 22</Badge>
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

      {tab === 'overview' && <WarehouseOverviewTab />}
      {tab === 'warehouses' && <WarehouseWarehousesTab />}
      {tab === 'zones' && <WarehouseZonesTab />}
      {tab === 'temperature' && <WarehouseTemperatureTab />}
      {tab === 'rules' && <WarehouseRulesTab />}
    </div>
  )
}

const WAREHOUSE_TYPE_COLORS: Record<string, string> = {
  RAW_MATERIAL: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  PACKAGING: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  FINISHED_GOODS: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  QUARANTINE: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  RETURNS: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  SCRAP: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  COLD_STORAGE: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
  DEEP_FREEZE: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  TRANSIT: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  DISTRIBUTION_CENTER: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  DISTRIBUTION: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  DARK_STORE: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
}
const WAREHOUSE_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  MAINTENANCE: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  INACTIVE: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function WarehouseOverviewTab() {
  const [stats, setStats] = useState<Array<{ label: string; value: string; sub: string; icon: React.ReactNode }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await orgWarehouseApi.list({ page: 1, pageSize: 100 }).catch(() => ({ data: [] }))
        if (cancelled) return
        const warehouses = res.data || []
        const active = warehouses.filter((w: { status: string }) => w.status === 'ACTIVE').length
        const types = new Set(warehouses.map((w: { warehouse_type: string }) => w.warehouse_type)).size
        setStats([
          { label: 'Total Warehouses', value: String(warehouses.length), sub: 'All types', icon: <Warehouse className="h-5 w-5 text-blue-600" /> },
          { label: 'Active', value: String(active), sub: 'Currently operational', icon: <ShieldCheck className="h-5 w-5 text-emerald-600" /> },
          { label: 'Warehouse Types', value: String(types), sub: 'Different types in use', icon: <Layers3 className="h-5 w-5 text-purple-600" /> },
          { label: 'Temperature Zones', value: 'N/A', sub: 'Backend not available', icon: <Thermometer className="h-5 w-5 text-cyan-600" /> },
        ])
      } catch {
        if (!cancelled) setStats([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [...Array(4)].map((_, i) => <Card key={i} className="p-4"><div className="h-16 bg-muted/50 rounded animate-pulse" /></Card>)
        ) : (
          stats.map(s => (
            <Card key={s.label} className="p-4">
              <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{s.label}</p>{s.icon}</div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Warehouses Tab — Live API ────────────────────────────────────────────────

interface OrgWarehouse {
  id: string; plant_id: string; code: string; name: string; description: string | null;
  warehouse_type: string; is_default: boolean; status: string; version: number;
}

function WarehouseWarehousesTab() {
  const { hasPermission } = useAuthStore()
  const [warehouses, setWarehouses] = useState<OrgWarehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await orgWarehouseApi.list({ page: 1, pageSize: 100, search })
      setWarehouses(res.data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load warehouses')
      setWarehouses([])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  function handleExport() {
    if (warehouses.length === 0) { toast({ title: 'No data to export' }); return }
    const headers = ['Code', 'Name', 'Type', 'Default', 'Status']
    const rows = warehouses.map(w => [w.code, w.name, w.warehouse_type, w.is_default ? 'Yes' : 'No', w.status])
    import('@/lib/csv').then(({ exportToCSV }) => exportToCSV('warehouses', headers, rows))
    toast({ title: `Exported ${warehouses.length} warehouses` })
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900">
        <p className="text-sm text-amber-900 dark:text-amber-200">
          <Warehouse className="inline h-4 w-4 mr-1" /> {loading ? 'Loading...' : `${warehouses.length} warehouses. 11 supported types: RAW_MATERIAL, PACKAGING, FINISHED_GOODS, COLD_STORAGE, DEEP_FREEZE, RETURNS, TRANSIT, QUARANTINE, SCRAP, DISTRIBUTION_CENTER, DARK_STORE.`}
        </p>
      </Card>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div></div>
          {hasPermission('inventory:export') && <Button size="sm" variant="outline" onClick={handleExport}><Download className="mr-1 h-3 w-3" />Export</Button>}
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search warehouses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        {error && <ErrorState message={error} onRetry={load} />}
        {loading ? <LoadingState rows={5} /> : warehouses.length === 0 ? (
          <EmptyState icon={Warehouse} title="No warehouses found" description="Create warehouses via the Organization module (POST /api/v1/organization/warehouses)." action={hasPermission('org:create') ? { label: 'Go to Organization', onClick: () => window.location.hash = 'organization' } : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-3 py-2 font-medium">Code</th>
                  <th className="text-left px-3 py-2 font-medium">Name</th>
                  <th className="text-left px-3 py-2 font-medium">Type</th>
                  <th className="text-left px-3 py-2 font-medium">Default</th>
                  <th className="text-center px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map(w => (
                  <tr key={w.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{w.code}</td>
                    <td className="px-3 py-2 font-medium">{w.name}</td>
                    <td className="px-3 py-2"><Badge className={cn('text-xs', WAREHOUSE_TYPE_COLORS[w.warehouse_type] || 'bg-slate-100 text-slate-800')}>{w.warehouse_type.replace(/_/g, ' ')}</Badge></td>
                    <td className="px-3 py-2">{w.is_default ? <Badge className="bg-blue-600 text-xs">Default</Badge> : <span className="text-muted-foreground text-xs">—</span>}</td>
                    <td className="px-3 py-2 text-center"><Badge className={cn('text-xs', WAREHOUSE_STATUS_COLORS[w.status] || 'bg-slate-100 text-slate-800')}>{w.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

// ─── Zones Tab — Live API ─────────────────────────────────────────────────────

function WarehouseZonesTab() {
  const { hasPermission } = useAuthStore()
  const [zones, setZones] = useState<Array<Record<string, unknown>>>([])
  const [warehouses, setWarehouses] = useState<OrgWarehouse[]>([])
  const [selectedWh, setSelectedWh] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    orgWarehouseApi.list({ page: 1, pageSize: 100 }).then(r => { setWarehouses(r.data || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const load = useCallback(async () => {
    if (!selectedWh) { setZones([]); return }
    setLoading(true); setError('')
    try {
      const res = await warehouseApi.listZones(selectedWh)
      setZones(res.data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load zones')
      setZones([])
    } finally {
      setLoading(false)
    }
  }, [selectedWh])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900">
        <p className="text-sm text-purple-900 dark:text-purple-200">
          <Layers3 className="inline h-4 w-4 mr-1" /> {loading ? 'Loading...' : `${zones.length} zones. 10 zone types: RECEIVING, PUTAWAY, STORAGE, PICKING, PACKING, DISPATCH, RETURNS, QUARANTINE, QUALITY_INSPECTION, DAMAGED_GOODS.`}
        </p>
      </Card>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Warehouse:</Label>
            <select className="h-8 rounded-md border px-2 text-sm bg-background" value={selectedWh} onChange={e => setSelectedWh(e.target.value)}>
              <option value="">— Select Warehouse —</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
            </select>
          </div>
          {hasPermission('inventory:post') && selectedWh && <Button size="sm" onClick={() => toast({ title: 'Create Zone — POST /api/v1/warehouse/zones' })}><Plus className="mr-1 h-4 w-4" /> New Zone</Button>}
        </div>
        {error && <ErrorState message={error} onRetry={load} />}
        {loading ? <LoadingState rows={4} /> : !selectedWh ? (
          <EmptyState icon={Layers3} title="Select a warehouse" description="Select a warehouse to view its zones." />
        ) : zones.length === 0 ? (
          <EmptyState icon={Layers3} title="No zones found" description="This warehouse has no zones defined." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {zones.map((z, i) => (
              <div key={i} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-mono text-xs text-muted-foreground">{String(z.zoneCode || z.zone_code || z.code || '—')}</p>
                  <Badge variant="outline" className="text-xs">{String(z.zoneType || z.zone_type || z.type || '—')}</Badge>
                </div>
                <p className="font-medium text-sm">{String(z.zoneName || z.zone_name || z.name || '—')}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge className={cn('text-xs', z.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-500')}>{String(z.status || 'ACTIVE')}</Badge>
                  {z.restricted && <Badge variant="outline" className="text-xs text-amber-600">Restricted</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

// ─── Temperature Tab — NO BACKEND ─────────────────────────────────────────────

function WarehouseTemperatureTab() {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <EmptyState icon={Thermometer} title="Backend endpoint not available" description="The temperature zones API does not exist in the backend. Temperature zones would allow tracking AMBIENT, CHILLED, FROZEN, DEEP_FREEZE, and HUMIDITY_CONTROLLED zones with sensor readings, min/max temperature thresholds, and active alerts." />
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
          <p className="text-xs text-amber-800 dark:text-amber-200"><strong>Backend gap documented:</strong> See <code>MISSING_BACKEND_ITEMS.md</code>. No Prisma model for warehouse temperature zones exists. The warehouse zone schema does include a <code>temperature_zone</code> field on bins, but there is no dedicated temperature monitoring endpoint.</p>
        </div>
      </Card>
    </div>
  )
}

// ─── Rules Tab — NO BACKEND ───────────────────────────────────────────────────

function WarehouseRulesTab() {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <EmptyState icon={ShieldCheck} title="Backend endpoint not available" description="The warehouse rules API does not exist in the backend. Rules would include: MAX_BIN_WEIGHT, FEFO_ENABLED, BARCODE_MANDATORY, QUALITY_INSPECTION_REQUIRED, MAX_STACK_HEIGHT — with enforcement modes HARD_BLOCK, WARN, LOG." />
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
          <p className="text-xs text-amber-800 dark:text-amber-200"><strong>Backend gap documented:</strong> See <code>MISSING_BACKEND_ITEMS.md</code>. No Prisma model for warehouse rules exists. Some rules (like FEFO) are enforced at the product level via <code>fifoStrategy</code> field.</p>
        </div>
      </Card>
    </div>
  )
}

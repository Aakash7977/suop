/**
 * Section 03 — Master Data Management
 * Warehouse Locations & Bins Module — Live API Integration
 *
 * 5 sub-tabs:
 * 1. Overview  — Stats from live bins
 * 2. Bins      — GET /api/v1/warehouse/bins (live)
 * 3. Aisles    — GET /api/v1/warehouse/aisles (live)
 * 4. Racks     — GET /api/v1/warehouse/racks (live)
 * 5. Capacity  — Computed from bins utilization
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search, Download, Plus, Loader2,
  Hash, Gauge, AlertTriangle, Warehouse,
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
import { orgWarehouseApi, warehouseApi, type WarehouseBin } from '../api/clients'

type WhLocTab = 'overview' | 'bins' | 'aisles' | 'racks' | 'capacity'

export function WarehouseLocationModule() {
  const [tab, setTab] = useState<WhLocTab>('overview')
  const tabs: Array<{ key: WhLocTab; label: string; icon: React.ReactNode }> = [
    { key: 'overview', label: 'Overview', icon: <Gauge className="h-4 w-4" /> },
    { key: 'bins', label: 'Bins', icon: <Hash className="h-4 w-4" /> },
    { key: 'aisles', label: 'Aisles', icon: <Warehouse className="h-4 w-4" /> },
    { key: 'racks', label: 'Racks', icon: <Warehouse className="h-4 w-4" /> },
    { key: 'capacity', label: 'Capacity', icon: <AlertTriangle className="h-4 w-4" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-teal-950 via-cyan-900 to-blue-900 text-white border-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Hash className="h-7 w-7" /> Storage Locations & Bins
            </h2>
            <p className="text-teal-200 text-sm max-w-3xl">
              Warehouse → Zone → Aisle → Rack → Shelf → Bin hierarchy.
              Each bin has capacity limits (weight + volume), temperature zone, type, and status.
              Barcode and QR code assigned to every bin for scanning.
            </p>
          </div>
          <Badge className="bg-teal-500 text-teal-950 hover:bg-teal-500">Sprint 23</Badge>
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

// ─── Shared warehouse selector hook ───────────────────────────────────────────

function useWarehouseSelector() {
  const [warehouses, setWarehouses] = useState<Array<{ id: string; code: string; name: string }>>([])
  const [selectedWh, setSelectedWh] = useState('')

  useEffect(() => {
    orgWarehouseApi.list({ page: 1, pageSize: 100 }).then(r => {
      const whs = (r.data || []).map(w => ({ id: w.id, code: w.code, name: w.name }))
      setWarehouses(whs)
      if (whs.length > 0) setSelectedWh(whs[0].id)
    }).catch(() => setWarehouses([]))
  }, [])

  return { warehouses, selectedWh, setSelectedWh }
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function WhLocOverviewTab() {
  const { warehouses, selectedWh, setSelectedWh } = useWarehouseSelector()
  const [bins, setBins] = useState<WarehouseBin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedWh) { setLoading(false); return }
    setLoading(true)
    warehouseApi.listBins(selectedWh).then(r => setBins(r.data || [])).catch(() => setBins([])).finally(() => setLoading(false))
  }, [selectedWh])

  const activeBins = bins.filter(b => b.is_active && !b.is_blocked).length
  const blockedBins = bins.filter(b => b.is_blocked).length
  const totalCapacity = bins.reduce((sum, b) => sum + (b.capacity || 0), 0)
  const usedCapacity = bins.reduce((sum, b) => sum + (b.used_capacity || 0), 0)
  const utilizationPct = totalCapacity > 0 ? ((usedCapacity / totalCapacity) * 100).toFixed(1) : '0'

  const stats = [
    { label: 'Total Bins', value: String(bins.length), sub: 'In selected warehouse', icon: <Hash className="h-5 w-5 text-blue-600" /> },
    { label: 'Active Bins', value: String(activeBins), sub: 'Available for putaway', icon: <Hash className="h-5 w-5 text-emerald-600" /> },
    { label: 'Blocked Bins', value: String(blockedBins), sub: 'Under hold/maintenance', icon: <AlertTriangle className="h-5 w-5 text-amber-600" /> },
    { label: 'Utilization', value: `${utilizationPct}%`, sub: `${usedCapacity} / ${totalCapacity} units`, icon: <Gauge className="h-5 w-5 text-purple-600" /> },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Warehouse:</Label>
          <select className="h-8 rounded-md border px-2 text-sm bg-background" value={selectedWh} onChange={e => setSelectedWh(e.target.value)}>
            <option value="">— Select —</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
          </select>
        </div>
      </Card>
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
      <Card className="p-4">
        <h3 className="font-semibold mb-2 text-sm">Bin Hierarchy</h3>
        <div className="flex items-center gap-2 text-xs overflow-x-auto">
          {['Warehouse', 'Zone', 'Aisle', 'Rack', 'Shelf', 'Bin', 'Inventory'].map((step, i, arr) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <div className="px-3 py-1.5 bg-muted/40 border rounded-md font-medium">{step}</div>
              {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Bins Tab — Live API ──────────────────────────────────────────────────────

const BIN_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-emerald-100 text-emerald-800', OCCUPIED: 'bg-amber-100 text-amber-800',
  RESERVED: 'bg-indigo-100 text-indigo-800', BLOCKED: 'bg-red-100 text-red-800',
  MAINTENANCE: 'bg-orange-100 text-orange-800', CLEANING: 'bg-blue-100 text-blue-800',
  DISABLED: 'bg-slate-100 text-slate-800',
}

function WhLocBinsTab() {
  const { hasPermission } = useAuthStore()
  const { warehouses, selectedWh, setSelectedWh } = useWarehouseSelector()
  const [bins, setBins] = useState<WarehouseBin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    if (!selectedWh) { setBins([]); setLoading(false); return }
    setLoading(true); setError('')
    try {
      const res = await warehouseApi.listBins(selectedWh)
      setBins(res.data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load bins')
      setBins([])
    } finally {
      setLoading(false)
    }
  }, [selectedWh])

  useEffect(() => { load() }, [load])

  const filtered = bins.filter(b => !search || (b.bin_code || '').toLowerCase().includes(search.toLowerCase()) || (b.bin_name || '').toLowerCase().includes(search.toLowerCase()))

  function handleExport() {
    if (filtered.length === 0) { toast({ title: 'No data to export' }); return }
    const headers = ['Bin Code', 'Bin Name', 'Type', 'Level', 'Capacity', 'Used', 'Active', 'Blocked']
    const rows = filtered.map(b => [b.bin_code, b.bin_name, b.bin_type, b.level, b.capacity, b.used_capacity, b.is_active, b.is_blocked])
    import('@/lib/csv').then(({ exportToCSV }) => exportToCSV('bins', headers, rows))
    toast({ title: `Exported ${filtered.length} bins` })
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Warehouse:</Label>
          <select className="h-8 rounded-md border px-2 text-sm bg-background" value={selectedWh} onChange={e => setSelectedWh(e.target.value)}>
            <option value="">— Select —</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExport}><Download className="mr-1 h-3 w-3" />Export</Button>
          {hasPermission('inventory:post') && <Button size="sm" onClick={() => toast({ title: 'Create Bin — POST /api/v1/warehouse/bins' })}><Plus className="mr-1 h-3 w-3" /> New Bin</Button>}
        </div>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search bins..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>
      {error && <ErrorState message={error} onRetry={load} />}
      {loading ? <LoadingState rows={5} /> : !selectedWh ? (
        <EmptyState icon={Hash} title="Select a warehouse" description="Select a warehouse to view its bins." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Hash} title="No bins found" description="This warehouse has no bins defined. Create bins via POST /api/v1/warehouse/bins." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-xs text-muted-foreground">
              <th className="text-left px-3 py-2 font-medium">Bin Code</th>
              <th className="text-left px-3 py-2 font-medium">Name</th>
              <th className="text-left px-3 py-2 font-medium">Type</th>
              <th className="text-right px-3 py-2 font-medium">Capacity</th>
              <th className="text-right px-3 py-2 font-medium">Used</th>
              <th className="text-center px-3 py-2 font-medium">Utilization</th>
              <th className="text-center px-3 py-2 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {filtered.map(b => {
                const pct = b.capacity > 0 ? (b.used_capacity / b.capacity) * 100 : 0
                return (
                  <tr key={b.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-xs">{b.bin_code}</td>
                    <td className="px-3 py-2 font-medium">{b.bin_name}</td>
                    <td className="px-3 py-2"><Badge variant="outline" className="text-xs">{b.bin_type}</Badge></td>
                    <td className="px-3 py-2 text-right font-mono">{b.capacity}</td>
                    <td className="px-3 py-2 text-right font-mono">{b.used_capacity}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div className={cn('h-full', pct >= 100 ? 'bg-red-500' : pct >= 90 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-xs font-mono">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {b.is_blocked ? <Badge className="bg-red-600 text-xs">Blocked</Badge> : b.is_active ? <Badge className="bg-emerald-600 text-xs">Active</Badge> : <Badge className="bg-slate-500 text-xs">Inactive</Badge>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

// ─── Aisles Tab — Live API ────────────────────────────────────────────────────

function WhLocAislesTab() {
  const { hasPermission } = useAuthStore()
  const { warehouses, selectedWh, setSelectedWh } = useWarehouseSelector()
  const [aisles, setAisles] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!selectedWh) { setAisles([]); setLoading(false); return }
    setLoading(true); setError('')
    try {
      const res = await warehouseApi.listAisles(selectedWh)
      setAisles(res.data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load aisles')
      setAisles([])
    } finally {
      setLoading(false)
    }
  }, [selectedWh])

  useEffect(() => { load() }, [load])

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Warehouse:</Label>
          <select className="h-8 rounded-md border px-2 text-sm bg-background" value={selectedWh} onChange={e => setSelectedWh(e.target.value)}>
            <option value="">— Select —</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
          </select>
        </div>
        {hasPermission('inventory:post') && selectedWh && <Button size="sm" onClick={() => toast({ title: 'Create Aisle — POST /api/v1/warehouse/aisles' })}><Plus className="mr-1 h-3 w-3" /> New Aisle</Button>}
      </div>
      {error && <ErrorState message={error} onRetry={load} />}
      {loading ? <LoadingState rows={4} /> : !selectedWh ? (
        <EmptyState icon={Warehouse} title="Select a warehouse" description="Select a warehouse to view its aisles." />
      ) : aisles.length === 0 ? (
        <EmptyState icon={Warehouse} title="No aisles found" description="This warehouse has no aisles defined." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {aisles.map((a, i) => (
            <div key={i} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="font-mono text-xs text-muted-foreground">{String(a.aisleCode || a.aisle_code || '—')}</p>
                <Badge className={cn('text-xs', a.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-500')}>{String(a.status || 'ACTIVE')}</Badge>
              </div>
              <p className="font-medium text-sm">{String(a.aisleName || a.aisle_name || a.description || '—')}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Traffic: {String(a.trafficDirection || a.traffic_direction || '—')}</span>
                <span>·</span>
                <span>Racks: {String(a.rackCount || a.rack_count || '—')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ─── Racks Tab — Live API ─────────────────────────────────────────────────────

function WhLocRacksTab() {
  const { hasPermission } = useAuthStore()
  const { warehouses, selectedWh, setSelectedWh } = useWarehouseSelector()
  const [racks, setRacks] = useState<Array<Record<string, unknown>>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!selectedWh) { setRacks([]); setLoading(false); return }
    setLoading(true); setError('')
    try {
      const res = await warehouseApi.listRacks(selectedWh)
      setRacks(res.data || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load racks')
      setRacks([])
    } finally {
      setLoading(false)
    }
  }, [selectedWh])

  useEffect(() => { load() }, [load])

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Warehouse:</Label>
          <select className="h-8 rounded-md border px-2 text-sm bg-background" value={selectedWh} onChange={e => setSelectedWh(e.target.value)}>
            <option value="">— Select —</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
          </select>
        </div>
        {hasPermission('inventory:post') && selectedWh && <Button size="sm" onClick={() => toast({ title: 'Create Rack — POST /api/v1/warehouse/racks' })}><Plus className="mr-1 h-3 w-3" /> New Rack</Button>}
      </div>
      {error && <ErrorState message={error} onRetry={load} />}
      {loading ? <LoadingState rows={4} /> : !selectedWh ? (
        <EmptyState icon={Warehouse} title="Select a warehouse" description="Select a warehouse to view its racks." />
      ) : racks.length === 0 ? (
        <EmptyState icon={Warehouse} title="No racks found" description="This warehouse has no racks defined." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {racks.map((r, i) => (
            <div key={i} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="font-mono text-xs text-muted-foreground">{String(r.rackCode || r.rack_code || '—')}</p>
                <Badge className={cn('text-xs', r.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-500')}>{String(r.status || 'ACTIVE')}</Badge>
              </div>
              <p className="font-medium text-sm">{String(r.rackName || r.rack_name || r.description || '—')}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                {r.maxWeightKg && <span>Max: {String(r.maxWeightKg)} kg</span>}
                {r.shelfCount && <><span>·</span><span>Shelves: {String(r.shelfCount || r.shelf_count)}</span></>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ─── Capacity Tab — Computed from bins ────────────────────────────────────────

function WhLocCapacityTab() {
  const { warehouses, selectedWh, setSelectedWh } = useWarehouseSelector()
  const [bins, setBins] = useState<WarehouseBin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedWh) { setLoading(false); return }
    setLoading(true)
    warehouseApi.listBins(selectedWh).then(r => setBins(r.data || [])).catch(() => setBins([])).finally(() => setLoading(false))
  }, [selectedWh])

  const fullBins = bins.filter(b => b.capacity > 0 && (b.used_capacity / b.capacity) >= 100).length
  const nearFullBins = bins.filter(b => b.capacity > 0 && (b.used_capacity / b.capacity) >= 90 && (b.used_capacity / b.capacity) < 100).length
  const blockedBins = bins.filter(b => b.is_blocked).length
  const underutilizedBins = bins.filter(b => b.capacity > 0 && (b.used_capacity / b.capacity) < 30).length

  const alerts = [
    { type: 'FULL', count: fullBins, color: 'bg-red-100 text-red-800 border-red-300', icon: '🔴' },
    { type: 'NEAR_FULL', count: nearFullBins, color: 'bg-amber-100 text-amber-800 border-amber-300', icon: '🟡' },
    { type: 'BLOCKED', count: blockedBins, color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🟠' },
    { type: 'UNDERUTILIZED', count: underutilizedBins, color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '🔵' },
  ]

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Label className="text-xs">Warehouse:</Label>
          <select className="h-8 rounded-md border px-2 text-sm bg-background" value={selectedWh} onChange={e => setSelectedWh(e.target.value)}>
            <option value="">— Select —</option>
            {warehouses.map(w => <option key={w.id} value={w.id}>{w.code} — {w.name}</option>)}
          </select>
        </div>
      </Card>
      {loading ? <LoadingState rows={4} /> : !selectedWh ? (
        <EmptyState icon={Gauge} title="Select a warehouse" description="Select a warehouse to view capacity alerts." />
      ) : bins.length === 0 ? (
        <EmptyState icon={Gauge} title="No bins found" description="This warehouse has no bins to analyze." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {alerts.map(a => (
              <Card key={a.type} className={cn('p-4 border-2', a.color)}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium">{a.type.replace(/_/g, ' ')}</p>
                  <span className="text-2xl">{a.icon}</span>
                </div>
                <p className="text-3xl font-bold">{a.count}</p>
                <p className="text-xs mt-1">{a.count === 1 ? 'bin' : 'bins'}</p>
              </Card>
            ))}
          </div>
          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-sm">Capacity Utilization Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left px-3 py-2 font-medium">Bin Code</th>
                  <th className="text-right px-3 py-2 font-medium">Capacity</th>
                  <th className="text-right px-3 py-2 font-medium">Used</th>
                  <th className="text-center px-3 py-2 font-medium">Utilization</th>
                  <th className="text-center px-3 py-2 font-medium">Alert</th>
                </tr></thead>
                <tbody>
                  {bins.filter(b => b.capacity > 0).sort((a, b) => (b.used_capacity / b.capacity) - (a.used_capacity / a.capacity)).slice(0, 20).map(b => {
                    const pct = (b.used_capacity / b.capacity) * 100
                    const alertType = pct >= 100 ? 'FULL' : pct >= 90 ? 'NEAR_FULL' : b.is_blocked ? 'BLOCKED' : pct < 30 ? 'UNDERUTILIZED' : null
                    return (
                      <tr key={b.id} className="border-b hover:bg-muted/30">
                        <td className="px-3 py-2 font-mono text-xs">{b.bin_code}</td>
                        <td className="px-3 py-2 text-right font-mono">{b.capacity}</td>
                        <td className="px-3 py-2 text-right font-mono">{b.used_capacity}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div className={cn('h-full', pct >= 100 ? 'bg-red-500' : pct >= 90 ? 'bg-amber-500' : pct < 30 ? 'bg-blue-500' : 'bg-emerald-500')} style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                            <span className="text-xs font-mono">{pct.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {alertType && <Badge className={cn('text-xs', alertType === 'FULL' ? 'bg-red-600' : alertType === 'NEAR_FULL' ? 'bg-amber-500' : alertType === 'BLOCKED' ? 'bg-orange-600' : 'bg-blue-500')}>{alertType}</Badge>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

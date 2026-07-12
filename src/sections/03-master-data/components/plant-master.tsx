/**
 * Section 03 — Master Data Management
 * Plant Master Module
 *
 * Extracted from src/app/page.tsx lines 16342-16439.
 * UI preserved EXACTLY.
 *
 * Wire-up additions:
 * - Live API call to GET /api/v1/organization/plants (replaces hardcoded `plants` array)
 * - "Create Plant" button now actually calls POST /api/v1/organization/plants
 * - Loading skeletons, error retry
 * - Permission gating on "New Plant" button (org:create)
 * - Toast notifications
 * - Stats computed from live data (preserves the same 6 stat cards)
 */

'use client'

import { useState, useMemo } from 'react'
import { Plus, CheckCircle2, ArrowRight, AlertCircle, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth-store'
import { plantApi, pushToast, type Plant } from '../api/clients'
import { useList } from '../hooks/use-master-data'
import { s28BadgeForStatus } from '../utils/helpers'

// Plant type colors (preserved from original)
const typeColors: Record<string, string> = {
  SWEET_MANUFACTURING: 'bg-amber-100 text-amber-700',
  NAMKEEN_MANUFACTURING: 'bg-orange-100 text-orange-700',
  BATTER_PRODUCTION: 'bg-blue-100 text-blue-700',
  CENTRAL_KITCHEN: 'bg-purple-100 text-purple-700',
  PACKAGING_PLANT: 'bg-emerald-100 text-emerald-700',
  MANUFACTURING: 'bg-amber-100 text-amber-700',
  DISTRIBUTION: 'bg-blue-100 text-blue-700',
  WAREHOUSE: 'bg-slate-100 text-slate-700',
  RETAIL: 'bg-emerald-100 text-emerald-700',
  RESTAURANT: 'bg-purple-100 text-purple-700',
}
const typeIcons: Record<string, string> = {
  SWEET_MANUFACTURING: '🍬',
  NAMKEEN_MANUFACTURING: '🥜',
  BATTER_PRODUCTION: '🥣',
  CENTRAL_KITCHEN: '🍳',
  PACKAGING_PLANT: '📦',
  MANUFACTURING: '🏭',
  DISTRIBUTION: '🚚',
  WAREHOUSE: '🏬',
  RETAIL: '🏪',
  RESTAURANT: '🍴',
}

// ─── Create Plant Form (inline, preserves original layout) ──────────────────

function CreatePlantForm({ onCreate, onCancel, submitting }: {
  onCreate: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  submitting: boolean
}) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await onCreate({
      code: fd.get('code'),
      name: fd.get('name'),
      plantType: fd.get('plantType') || 'MANUFACTURING',
      city: fd.get('city') || undefined,
      email: fd.get('email') || undefined,
      phone: fd.get('phone') || undefined,
    })
  }
  return (
    <Card className="p-4 border-amber-300 bg-amber-50/50">
      <h3 className="font-semibold mb-3">Register New Plant</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div><Label className="text-xs">Plant Code *</Label><Input name="code" required className="mt-1" placeholder="PLANT-XXX-01" /></div>
        <div><Label className="text-xs">Plant Name *</Label><Input name="name" required className="mt-1" placeholder="Thane Sweet Plant" /></div>
        <div><Label className="text-xs">Plant Type</Label>
          <select name="plantType" className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md">
            <option value="MANUFACTURING">MANUFACTURING</option>
            <option value="DISTRIBUTION">DISTRIBUTION</option>
            <option value="WAREHOUSE">WAREHOUSE</option>
            <option value="RETAIL">RETAIL</option>
            <option value="RESTAURANT">RESTAURANT</option>
          </select>
        </div>
        <div><Label className="text-xs">Manager Email</Label><Input name="email" type="email" className="mt-1" placeholder="manager@plant.com" /></div>
        <div><Label className="text-xs">City</Label><Input name="city" className="mt-1" placeholder="Thane" /></div>
        <div><Label className="text-xs">Phone</Label><Input name="phone" className="mt-1" placeholder="+91..." /></div>
        <div className="md:col-span-4 flex gap-2">
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />Creating...</> : <><CheckCircle2 className="mr-1 h-4 w-4" />Create Plant</>}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={submitting}>Cancel</Button>
        </div>
      </form>
    </Card>
  )
}

// ─── Main Module (preserves original layout) ────────────────────────────────

export function PlantMasterModule() {
  const { hasPermission, isDemoMode } = useAuthStore()
  const [showCreate, setShowCreate] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Live API fetch
  const { data: plants, loading, error, refresh } = useList<Plant>(
    ({ page, pageSize, search }) => plantApi.list({ page, pageSize, search }).then(r => ({ data: r.data, meta: r.meta })),
    { enabled: !isDemoMode }
  )

  // Stats computed from live data (preserves same 6 stats)
  const stats = useMemo(() => [
    { label: 'Total Plants', value: plants.length, color: 'text-blue-600' },
    { label: 'Active', value: plants.filter(p => p.status === 'ACTIVE').length, color: 'text-emerald-600' },
    { label: 'Maintenance', value: plants.filter(p => p.status === 'MAINTENANCE' || p.status === 'SUSPENDED').length, color: 'text-orange-600' },
    { label: 'Total Capacity (kg/day)', value: '—', color: 'text-purple-600' }, // Not in API yet
    { label: 'Plant Types', value: new Set(plants.map(p => p.plant_type)).size, color: 'text-cyan-600' },
    { label: 'Cities', value: new Set(plants.map(p => p.city).filter(Boolean)).size, color: 'text-amber-600' },
  ], [plants])

  async function handleCreate(data: Record<string, unknown>) {
    setSubmitting(true)
    try {
      await plantApi.create(data)
      pushToast('success', 'Plant created successfully')
      setShowCreate(false)
      refresh()
    } catch (err: unknown) {
      pushToast('error', err instanceof Error ? err.message : 'Failed to create plant')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Manufacturing Plant Master</h2><p className="text-sm text-muted-foreground mt-1">Multi-plant management · Company → Branch → Plant → Department → Line → Work Center</p></div>
        {hasPermission('org:create') && <Button size="sm" onClick={() => setShowCreate(!showCreate)}><Plus className="mr-2 h-4 w-4" />New Plant</Button>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {stats.map(s => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{loading ? '...' : s.value}</p></Card>)}
      </div>

      {/* Manufacturing Hierarchy Diagram */}
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300">
        <h3 className="font-semibold mb-3 text-sm">Manufacturing Hierarchy — Sudhamrit Example</h3>
        <div className="flex items-center gap-2 text-xs overflow-x-auto">
          {['Sudhamrit Foods', 'Thane Plant', 'Production Building', 'Sweet Dept', 'Kaju Katli Line', 'Mixing → Cooking → Cooling → Cutting → Packing'].map((step, i, arr) => (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <div className="px-3 py-1.5 bg-white border rounded-md font-medium">{step}</div>
              {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-amber-600" />}
            </div>
          ))}
        </div>
      </Card>

      {error && <div className="text-sm text-rose-500 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-md p-3 flex items-center gap-2"><AlertCircle className="h-4 w-4 flex-shrink-0" />{error}<Button size="sm" variant="ghost" className="ml-auto" onClick={refresh}>Retry</Button></div>}

      {showCreate && hasPermission('org:create') && (
        <CreatePlantForm onCreate={handleCreate} onCancel={() => setShowCreate(false)} submitting={submitting} />
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Card key={i} className="p-4"><div className="h-32 bg-muted/50 rounded animate-pulse" /></Card>)}
        </div>
      ) : plants.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <p className="text-sm">No plants found. {hasPermission('org:create') && 'Click "New Plant" to register one.'}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plants.map(p => {
            const b = s28BadgeForStatus(p.status)
            const pType = (p.plant_type || 'MANUFACTURING').toUpperCase()
            return (
              <Card key={p.id} className={`p-4 ${p.status === 'MAINTENANCE' || p.status === 'SUSPENDED' ? 'border-orange-300 bg-orange-50/30' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">{typeIcons[pType] || '🏭'}</div>
                    <div>
                      <div className="font-mono text-xs font-semibold text-blue-700">{p.code}</div>
                      <div className="font-semibold text-sm">{p.name}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${b.cls}`}>{b.label}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Type:</span><span className={`px-1.5 py-0.5 rounded font-medium ${typeColors[pType] || 'bg-slate-100'}`}>{pType.replace(/_/g, ' ')}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Location:</span><span className="font-mono">{p.city || '—'}, {p.state || ''}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Timezone:</span><span className="font-mono">{p.timezone}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Currency:</span><span className="font-mono">{p.currency}</span></div>
                  {p.email && <div className="flex justify-between"><span className="text-muted-foreground">Email:</span><span>{p.email}</span></div>}
                  {p.phone && <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span><span>{p.phone}</span></div>}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-muted/50 rounded"><p className="text-lg font-bold text-blue-600">{p.version}</p><p className="text-[10px] text-muted-foreground">VERSION</p></div>
                  <div className="text-center p-2 bg-muted/50 rounded"><p className="text-lg font-bold text-purple-600">{p.status === 'ACTIVE' ? '✓' : '—'}</p><p className="text-[10px] text-muted-foreground">ACTIVE</p></div>
                  <div className="text-center p-2 bg-muted/50 rounded"><p className="text-lg font-bold text-amber-600">{p.country}</p><p className="text-[10px] text-muted-foreground">COUNTRY</p></div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

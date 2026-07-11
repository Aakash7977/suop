'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  companyApi, plantApi, warehouseApi, departmentApi,
  costCenterApi, financialYearApi, hierarchyApi,
  authApi, setAuthToken,
  type Company, type Plant, type Warehouse, type Department,
  type CostCenter, type FinancialYear, type HierarchyNode,
} from '../api/client'
import {
  Building2, Factory, Warehouse as WarehouseIcon, Users, DollarSign,
  Calendar, Network, Plus, Search, Loader2, AlertCircle, CheckCircle2,
  ChevronRight, ChevronDown, FileText, MapPin, Clock,
} from 'lucide-react'

// ─── Shared UI Components ───────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <AlertCircle className="h-8 w-8 text-red-500" />
      <p className="text-sm text-red-600">{message}</p>
      {onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2">
      <FileText className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  CONFIGURED: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  SUSPENDED: 'bg-amber-100 text-amber-700',
  ARCHIVED: 'bg-zinc-100 text-zinc-500',
}

// ─── Organization Dashboard ─────────────────────────────────────────────────

function OrgDashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [stats, setStats] = useState({ companies: 0, plants: 0, warehouses: 0, departments: 0, costCenters: 0 })
  const [currentFY, setCurrentFY] = useState<FinancialYear | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [companies, plants, warehouses, depts, ccs, fy] = await Promise.all([
        companyApi.list({ pageSize: 1 }),
        plantApi.list({ pageSize: 1 }),
        warehouseApi.list({ pageSize: 1 }),
        departmentApi.list({ pageSize: 1 }),
        costCenterApi.list({ pageSize: 1 }),
        financialYearApi.getCurrent(),
      ])
      setStats({
        companies: companies.meta.total,
        plants: plants.meta.total,
        warehouses: warehouses.meta.total,
        departments: depts.meta.total,
        costCenters: ccs.meta.total,
      })
      setCurrentFY(fy.data ?? null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={load} />

  const cards = [
    { label: 'Companies', value: stats.companies, icon: Building2, color: 'text-blue-600', tab: 'companies' },
    { label: 'Plants', value: stats.plants, icon: Factory, color: 'text-amber-600', tab: 'plants' },
    { label: 'Warehouses', value: stats.warehouses, icon: WarehouseIcon, color: 'text-purple-600', tab: 'warehouses' },
    { label: 'Departments', value: stats.departments, icon: Users, color: 'text-cyan-600', tab: 'departments' },
    { label: 'Cost Centers', value: stats.costCenters, icon: DollarSign, color: 'text-emerald-600', tab: 'cost-centers' },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Organization Dashboard</h2>
        <p className="text-slate-300 text-sm">Enterprise organization hierarchy — companies, plants, warehouses, departments, and financial configuration.</p>
        {currentFY && (
          <div className="mt-4 flex items-center gap-3">
            <Badge className="bg-emerald-500 text-white">Current FY: {currentFY.code}</Badge>
            <span className="text-xs text-slate-400">{currentFY.start_date.split('T')[0]} → {currentFY.end_date.split('T')[0]}</span>
          </div>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(card => (
          <Card key={card.label} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(card.tab)}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Network className="h-5 w-5 text-blue-600" />Organization Hierarchy</h3>
          <p className="text-sm text-muted-foreground mb-4">View the complete organization tree from Company → Plant → Warehouse.</p>
          <Button size="sm" variant="outline" onClick={() => onNavigate('hierarchy')}>
            View Hierarchy Tree <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="h-5 w-5 text-emerald-600" />Financial Year</h3>
          {currentFY ? (
            <div>
              <p className="text-sm font-medium">{currentFY.name}</p>
              <p className="text-xs text-muted-foreground">{currentFY.start_date.split('T')[0]} to {currentFY.end_date.split('T')[0]}</p>
              <Badge className="mt-2 bg-emerald-100 text-emerald-700">Active · Current</Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No current financial year set.</p>
          )}
          <Button size="sm" variant="outline" className="mt-4" onClick={() => onNavigate('financial-years')}>
            Manage Financial Years <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Card>
      </div>
    </div>
  )
}

// ─── Company Management ─────────────────────────────────────────────────────

function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await companyApi.list({ page, pageSize: 25, search: search || undefined })
      setCompanies(result.data)
      setTotal(result.meta.total)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { load() }, [load])

  const handleCreate = async (data: Partial<Company>) => {
    await companyApi.create(data)
    setSuccessMsg(`Company "${data.name}" created successfully`)
    setShowCreate(false)
    setTimeout(() => setSuccessMsg(''), 3000)
    load()
  }

  const handleTransition = async (company: Company, target: string) => {
    try {
      await companyApi.transition(company.id, target, company.version)
      setSuccessMsg(`Company "${company.name}" transitioned to ${target}`)
      setTimeout(() => setSuccessMsg(''), 3000)
      load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Companies</h2>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-1 h-4 w-4" />New Company
        </Button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          <CheckCircle2 className="h-4 w-4" />{successMsg}
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search companies..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
      </div>

      {showCreate && <CompanyForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />}

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <Card className="p-0 overflow-hidden">
          {companies.length === 0 ? <EmptyState message="No companies found. Create your first company." /> : (
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-xs font-semibold text-muted-foreground uppercase">
                  <th className="text-left px-4 py-3">Code</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">GSTIN</th>
                  <th className="text-left px-4 py-3">City</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(c => (
                  <tr key={c.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{c.code}</td>
                    <td className="px-4 py-3 font-medium text-sm">{c.name}</td>
                    <td className="px-4 py-3 text-xs font-mono">{c.gstin || '—'}</td>
                    <td className="px-4 py-3 text-xs">{c.city || '—'}</td>
                    <td className="px-4 py-3 text-center"><Badge className={`text-[10px] ${statusColors[c.status] || 'bg-slate-100'}`}>{c.status}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {c.status === 'DRAFT' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleTransition(c, 'CONFIGURED')}>Configure</Button>}
                        {c.status === 'CONFIGURED' && <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleTransition(c, 'ACTIVE')}>Activate</Button>}
                        {c.status === 'ACTIVE' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleTransition(c, 'SUSPENDED')}>Suspend</Button>}
                        {c.status === 'SUSPENDED' && <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleTransition(c, 'ACTIVE')}>Reactivate</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {total > 25 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{total} companies · Page {page}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page * 25 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function CompanyForm({ onSubmit, onCancel }: { onSubmit: (data: Partial<Company>) => Promise<void>; onCancel: () => void }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ code: '', name: '', legalName: '', gstin: '', email: '', phone: '', city: '', state: '', country: 'India' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSubmit({
        code: form.code, name: form.name, legalName: form.legalName || undefined,
        gstin: form.gstin || undefined, email: form.email || undefined,
        phone: form.phone || undefined, city: form.city || undefined,
        state: form.state || undefined, country: form.country,
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="p-6 border-2 border-blue-200 bg-blue-50/30">
      <h3 className="font-semibold mb-4">Create New Company</h3>
      {error && <div className="mb-4 p-2 rounded bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>Code *</Label><Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required placeholder="SUDHAMRIT" /></div>
        <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Sudhamrit Foods" /></div>
        <div className="space-y-2"><Label>Legal Name</Label><Input value={form.legalName} onChange={e => setForm({ ...form, legalName: e.target.value })} placeholder="Sudhamrit Foods Pvt Ltd" /></div>
        <div className="space-y-2"><Label>GSTIN</Label><Input value={form.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} placeholder="27AABCS1234M1Z5" /></div>
        <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="info@sudhamrit.com" /></div>
        <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91-22-12345678" /></div>
        <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" /></div>
        <div className="space-y-2"><Label>State</Label><Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="Maharashtra" /></div>
        <div className="md:col-span-2 flex items-end gap-2">
          <Button type="submit" size="sm" disabled={saving}>{saving ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" />Creating...</> : 'Create Company'}</Button>
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Card>
  )
}

// ─── Plant Management ───────────────────────────────────────────────────────

function PlantManagement() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await plantApi.list({ page, pageSize: 25, search: search || undefined })
      setPlants(result.data); setTotal(result.meta.total)
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])

  const handleTransition = async (plant: Plant, target: string) => {
    try {
      await plantApi.transition(plant.id, target, plant.version)
      setSuccessMsg(`Plant "${plant.name}" transitioned to ${target}`)
      setTimeout(() => setSuccessMsg(''), 3000)
      load()
    } catch (e) { setError((e as Error).message) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Plants</h2>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)}><Plus className="mr-1 h-4 w-4" />New Plant</Button>
      </div>
      {successMsg && <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"><CheckCircle2 className="h-4 w-4" />{successMsg}</div>}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search plants..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <Card className="p-0 overflow-hidden">
          {plants.length === 0 ? <EmptyState message="No plants found." /> : (
            <table className="w-full">
              <thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left px-4 py-3">Code</th><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">City</th><th className="text-center px-4 py-3">Status</th><th className="text-right px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {plants.map(p => (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{p.code}</td>
                    <td className="px-4 py-3 font-medium text-sm">{p.name}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{p.plant_type}</Badge></td>
                    <td className="px-4 py-3 text-xs">{p.city || '—'}</td>
                    <td className="px-4 py-3 text-center"><Badge className={`text-[10px] ${statusColors[p.status] || 'bg-slate-100'}`}>{p.status}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {p.status === 'DRAFT' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleTransition(p, 'CONFIGURED')}>Configure</Button>}
                        {p.status === 'CONFIGURED' && <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleTransition(p, 'ACTIVE')}>Activate</Button>}
                        {p.status === 'ACTIVE' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleTransition(p, 'SUSPENDED')}>Suspend</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
      {total > 25 && (<div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{total} plants · Page {page}</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button size="sm" variant="outline" disabled={page * 25 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </div>)}
    </div>
  )
}

// ─── Warehouse Management ───────────────────────────────────────────────────

function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await warehouseApi.list({ page, pageSize: 25, search: search || undefined })
      setWarehouses(result.data); setTotal(result.meta.total)
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Warehouses</h2>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search warehouses..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <Card className="p-0 overflow-hidden">
          {warehouses.length === 0 ? <EmptyState message="No warehouses found." /> : (
            <table className="w-full">
              <thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left px-4 py-3">Code</th><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Type</th>
                <th className="text-center px-4 py-3">Default</th><th className="text-center px-4 py-3">Status</th>
              </tr></thead>
              <tbody>
                {warehouses.map(w => (
                  <tr key={w.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{w.code}</td>
                    <td className="px-4 py-3 font-medium text-sm">{w.name}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{w.warehouse_type}</Badge></td>
                    <td className="px-4 py-3 text-center">{w.is_default && <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />}</td>
                    <td className="px-4 py-3 text-center"><Badge className={`text-[10px] ${statusColors[w.status] || 'bg-slate-100'}`}>{w.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  )
}

// ─── Department Management ──────────────────────────────────────────────────

function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await departmentApi.list({ page, pageSize: 25, search: search || undefined })
      setDepartments(result.data); setTotal(result.meta.total)
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Departments</h2>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search departments..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <Card className="p-0 overflow-hidden">
          {departments.length === 0 ? <EmptyState message="No departments found." /> : (
            <table className="w-full">
              <thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left px-4 py-3">Code</th><th className="text-left px-4 py-3">Name</th><th className="text-center px-4 py-3">Status</th>
              </tr></thead>
              <tbody>
                {departments.map(d => (
                  <tr key={d.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{d.code}</td>
                    <td className="px-4 py-3 font-medium text-sm">{d.name}</td>
                    <td className="px-4 py-3 text-center"><Badge className={`text-[10px] ${statusColors[d.status] || 'bg-slate-100'}`}>{d.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  )
}

// ─── Cost Center Management ─────────────────────────────────────────────────

function CostCenterManagement() {
  const [centers, setCenters] = useState<CostCenter[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await costCenterApi.list({ page, pageSize: 25, search: search || undefined })
      setCenters(result.data); setTotal(result.meta.total)
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Cost Centers</h2>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search cost centers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <Card className="p-0 overflow-hidden">
          {centers.length === 0 ? <EmptyState message="No cost centers found." /> : (
            <table className="w-full">
              <thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left px-4 py-3">Code</th><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Type</th><th className="text-center px-4 py-3">Status</th>
              </tr></thead>
              <tbody>
                {centers.map(c => (
                  <tr key={c.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{c.code}</td>
                    <td className="px-4 py-3 font-medium text-sm">{c.name}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{c.cost_center_type}</Badge></td>
                    <td className="px-4 py-3 text-center"><Badge className={`text-[10px] ${statusColors[c.status] || 'bg-slate-100'}`}>{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  )
}

// ─── Financial Year Management ──────────────────────────────────────────────

function FinancialYearManagement() {
  const [years, setYears] = useState<FinancialYear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await financialYearApi.list({ pageSize: 50 })
      setYears(result.data)
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Financial Years</h2>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <Card className="p-0 overflow-hidden">
          {years.length === 0 ? <EmptyState message="No financial years configured." /> : (
            <table className="w-full">
              <thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left px-4 py-3">Code</th><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Start Date</th><th className="text-left px-4 py-3">End Date</th><th className="text-center px-4 py-3">Current</th><th className="text-center px-4 py-3">Status</th>
              </tr></thead>
              <tbody>
                {years.map(fy => (
                  <tr key={fy.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{fy.code}</td>
                    <td className="px-4 py-3 font-medium text-sm">{fy.name}</td>
                    <td className="px-4 py-3 text-xs font-mono">{fy.start_date.split('T')[0]}</td>
                    <td className="px-4 py-3 text-xs font-mono">{fy.end_date.split('T')[0]}</td>
                    <td className="px-4 py-3 text-center">{fy.is_current && <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />}</td>
                    <td className="px-4 py-3 text-center"><Badge className={`text-[10px] ${statusColors[fy.status] || 'bg-slate-100'}`}>{fy.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  )
}

// ─── Hierarchy Tree ─────────────────────────────────────────────────────────

function HierarchyTree() {
  const [tree, setTree] = useState<HierarchyNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await hierarchyApi.getTree()
      setTree(result.data)
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const typeColors: Record<string, string> = {
    Company: 'text-blue-600 bg-blue-50',
    BusinessUnit: 'text-purple-600 bg-purple-50',
    Division: 'text-indigo-600 bg-indigo-50',
    Region: 'text-cyan-600 bg-cyan-50',
    Plant: 'text-amber-600 bg-amber-50',
    Warehouse: 'text-emerald-600 bg-emerald-50',
  }

  function TreeNode({ node, depth }: { node: HierarchyNode; depth: number }) {
    const [expanded, setExpanded] = useState(depth < 2)
    const hasChildren = node.children && node.children.length > 0
    return (
      <div style={{ marginLeft: depth * 24 }}>
        <div className="flex items-center gap-2 py-1.5 hover:bg-muted/30 rounded px-2 cursor-pointer" onClick={() => hasChildren && setExpanded(!expanded)}>
          {hasChildren ? (
            expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : <span className="w-4" />}
          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${typeColors[node.type] || 'bg-slate-50 text-slate-600'}`}>{node.type}</span>
          <span className="font-mono text-xs text-blue-700">{node.code}</span>
          <span className="text-sm font-medium">{node.name}</span>
          <Badge className={`text-[9px] ${statusColors[node.status] || 'bg-slate-100'}`}>{node.status}</Badge>
        </div>
        {expanded && hasChildren && node.children!.map(child => <TreeNode key={child.id} node={child} depth={depth + 1} />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Organization Hierarchy</h2>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : (
        <Card className="p-6">
          {tree.length === 0 ? <EmptyState message="No organization hierarchy found. Create companies to build the tree." /> : (
            <div>{tree.map(node => <TreeNode key={node.id} node={node} depth={0} />)}</div>
          )}
        </Card>
      )}
    </div>
  )
}

// ─── Main Organization Module ───────────────────────────────────────────────

type OrgTab = 'dashboard' | 'companies' | 'plants' | 'warehouses' | 'departments' | 'cost-centers' | 'financial-years' | 'hierarchy'

const TABS: Array<{ key: OrgTab; label: string; icon: React.ReactNode }> = [
  { key: 'dashboard', label: 'Dashboard', icon: <Network className="h-4 w-4" /> },
  { key: 'companies', label: 'Companies', icon: <Building2 className="h-4 w-4" /> },
  { key: 'plants', label: 'Plants', icon: <Factory className="h-4 w-4" /> },
  { key: 'warehouses', label: 'Warehouses', icon: <WarehouseIcon className="h-4 w-4" /> },
  { key: 'departments', label: 'Departments', icon: <Users className="h-4 w-4" /> },
  { key: 'cost-centers', label: 'Cost Centers', icon: <DollarSign className="h-4 w-4" /> },
  { key: 'financial-years', label: 'Financial Years', icon: <Calendar className="h-4 w-4" /> },
  { key: 'hierarchy', label: 'Hierarchy Tree', icon: <Network className="h-4 w-4" /> },
]

export function OrganizationModule() {
  const [tab, setTab] = useState<OrgTab>('dashboard')
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    // Get a token for API calls (temporary — will be replaced by real auth)
    const existing = localStorage.getItem('suop_auth')
    if (existing) {
      try {
        const data = JSON.parse(existing)
        if (data.token) {
          setAuthToken(data.token)
          setAuthReady(true)
          return
        }
      } catch { /* ignore */ }
    }
    // Get a test token
    authApi.getTestToken().then(token => {
      if (token) {
        setAuthToken(token)
        localStorage.setItem('suop_auth', JSON.stringify({ token, isAuthenticated: true }))
        setAuthReady(true)
      }
    }).catch(e => {
      setAuthError(`Cannot connect to backend: ${(e as Error).message}`)
      setAuthReady(true)
    })
  }, [])

  if (authError) {
    return <ErrorState message={authError} />
  }

  if (!authReady) {
    return <LoadingState />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <OrgDashboard onNavigate={(t) => setTab(t as OrgTab)} />}
      {tab === 'companies' && <CompanyManagement />}
      {tab === 'plants' && <PlantManagement />}
      {tab === 'warehouses' && <WarehouseManagement />}
      {tab === 'departments' && <DepartmentManagement />}
      {tab === 'cost-centers' && <CostCenterManagement />}
      {tab === 'financial-years' && <FinancialYearManagement />}
      {tab === 'hierarchy' && <HierarchyTree />}
    </div>
  )
}

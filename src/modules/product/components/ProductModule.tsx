'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { productApi, type Product } from '../api/client'
import { Plus, Search, Loader2, AlertCircle, CheckCircle2, Package, Tag, Layers3, Scale, QrCode, ChevronRight } from 'lucide-react'

function LoadingState() { return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /><span className="ml-2 text-sm text-muted-foreground">Loading...</span></div> }
function ErrorState({ msg, onRetry }: { msg: string; onRetry?: () => void }) { return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="h-8 w-8 text-red-500" /><p className="text-sm text-red-600">{msg}</p>{onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}</div> }
function EmptyState({ msg }: { msg: string }) { return <div className="flex flex-col items-center justify-center py-12 gap-2"><Package className="h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">{msg}</p></div> }

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700', REVIEW: 'bg-blue-100 text-blue-700', APPROVED: 'bg-cyan-100 text-cyan-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700', DISCONTINUED: 'bg-amber-100 text-amber-700', ARCHIVED: 'bg-zinc-100 text-zinc-500',
}
const typeColors: Record<string, string> = {
  RAW_MATERIAL: 'bg-orange-100 text-orange-700', FINISHED_GOOD: 'bg-emerald-100 text-emerald-700',
  PACKAGING: 'bg-purple-100 text-purple-700', CONSUMABLE: 'bg-blue-100 text-blue-700',
}

type Tab = 'dashboard' | 'products' | 'categories' | 'brands' | 'uoms'
const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
  { key: 'dashboard', label: 'Dashboard', icon: <Package className="h-4 w-4" /> },
  { key: 'products', label: 'Products', icon: <Package className="h-4 w-4" /> },
  { key: 'categories', label: 'Categories', icon: <Layers3 className="h-4 w-4" /> },
  { key: 'brands', label: 'Brands', icon: <Tag className="h-4 w-4" /> },
  { key: 'uoms', label: 'UOMs', icon: <Scale className="h-4 w-4" /> },
]

function ProductDashboard({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [stats, setStats] = useState({ total: 0, active: 0, draft: 0, rawMaterials: 0 })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    (async () => {
      try {
        const [all, active, draft, rm] = await Promise.all([
          productApi.list({ pageSize: 1 }),
          productApi.list({ pageSize: 1, status: 'ACTIVE' }),
          productApi.list({ pageSize: 1, status: 'DRAFT' }),
          productApi.list({ pageSize: 1, productType: 'RAW_MATERIAL' }),
        ])
        setStats({ total: all.meta.total, active: active.meta.total, draft: draft.meta.total, rawMaterials: rm.meta.total })
      } catch {} finally { setLoading(false) }
    })()
  }, [])
  if (loading) return <LoadingState />
  const cards = [
    { label: 'Total Products', value: stats.total, icon: Package, color: 'text-blue-600', tab: 'products' as Tab },
    { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'text-emerald-600', tab: 'products' as Tab },
    { label: 'Draft', value: stats.draft, icon: Package, color: 'text-amber-600', tab: 'products' as Tab },
    { label: 'Raw Materials', value: stats.rawMaterials, icon: Package, color: 'text-orange-600', tab: 'products' as Tab },
  ]
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Product Master Dashboard</h2>
        <p className="text-slate-300 text-sm">Single source of truth for every material, product, and item in SUOP ERP.</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => (
          <Card key={c.label} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate(c.tab)}>
            <div className="flex items-center justify-between mb-2"><p className="text-xs text-muted-foreground">{c.label}</p><c.icon className={`h-5 w-5 ${c.color}`} /></div>
            <p className="text-2xl font-bold">{c.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await productApi.list({ page, search: search || undefined })
      setProducts(result.data); setTotal(result.meta.total)
    } catch (e) { setError((e as Error).message) } finally { setLoading(false) }
  }, [page, search])
  useEffect(() => { load() }, [load])

  const handleTransition = async (p: Product, target: string) => {
    try { await productApi.transition(p.id, target, p.version); setSuccessMsg(`Product "${p.name}" transitioned to ${target}`); setTimeout(() => setSuccessMsg(''), 3000); load() }
    catch (e) { setError((e as Error).message) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Products</h2>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Product</Button>
      </div>
      {successMsg && <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"><CheckCircle2 className="h-4 w-4" />{successMsg}</div>}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by SKU, name, or item code..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="pl-10" />
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState msg={error} onRetry={load} /> : (
        <Card className="p-0 overflow-hidden">
          {products.length === 0 ? <EmptyState msg="No products found." /> : (
            <table className="w-full">
              <thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase">
                <th className="text-left px-4 py-3">SKU</th><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">MRP</th><th className="text-left px-4 py-3">ABC</th><th className="text-center px-4 py-3">Status</th><th className="text-right px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-blue-700">{p.sku}</td>
                    <td className="px-4 py-3 font-medium text-sm">{p.name}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] ${typeColors[p.product_type] || 'bg-slate-100'}`}>{p.product_type.replace(/_/g, ' ')}</Badge></td>
                    <td className="px-4 py-3 text-xs font-mono">{p.mrp ? `₹${p.mrp}` : '—'}</td>
                    <td className="px-4 py-3 text-center">{p.abc_class && <Badge variant="outline" className="text-[10px]">{p.abc_class}</Badge>}</td>
                    <td className="px-4 py-3 text-center"><Badge className={`text-[10px] ${statusColors[p.status] || 'bg-slate-100'}`}>{p.status}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {p.status === 'DRAFT' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleTransition(p, 'REVIEW')}>Submit Review</Button>}
                        {p.status === 'REVIEW' && <Button size="sm" className="h-7 text-xs bg-cyan-600 hover:bg-cyan-700" onClick={() => handleTransition(p, 'APPROVED')}>Approve</Button>}
                        {p.status === 'APPROVED' && <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleTransition(p, 'ACTIVE')}>Activate</Button>}
                        {p.status === 'ACTIVE' && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleTransition(p, 'DISCONTINUED')}>Discontinue</Button>}
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
        <p className="text-xs text-muted-foreground">{total} products · Page {page}</p>
        <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page * 25 >= total} onClick={() => setPage(p => p + 1)}>Next</Button></div>
      </div>)}
    </div>
  )
}

function CategoryList() {
  const [cats, setCats] = useState<Array<{ id: string; code: string; name: string; product_type: string | null }>>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => { try { const r = await productApi.listCategories(); setCats(r.data) } catch {} finally { setLoading(false) } })() }, [])
  if (loading) return <LoadingState />
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Categories</h2><Button size="sm"><Plus className="mr-1 h-4 w-4" />New Category</Button></div>
      <Card className="p-0 overflow-hidden">
        {cats.length === 0 ? <EmptyState msg="No categories found." /> : (
          <table className="w-full">
            <thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase"><th className="text-left px-4 py-3">Code</th><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Type</th></tr></thead>
            <tbody>{cats.map(c => <tr key={c.id} className="border-t hover:bg-muted/30"><td className="px-4 py-3 font-mono text-xs text-blue-700">{c.code}</td><td className="px-4 py-3 font-medium text-sm">{c.name}</td><td className="px-4 py-3">{c.product_type && <Badge variant="outline" className="text-[10px]">{c.product_type.replace(/_/g, ' ')}</Badge>}</td></tr>)}</tbody>
          </table>
        )}
      </Card>
    </div>
  )
}

function BrandList() {
  const [brands, setBrands] = useState<Array<{ id: string; code: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => { try { const r = await productApi.listBrands(); setBrands(r.data) } catch {} finally { setLoading(false) } })() }, [])
  if (loading) return <LoadingState />
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Brands</h2><Button size="sm"><Plus className="mr-1 h-4 w-4" />New Brand</Button></div>
      <Card className="p-0 overflow-hidden">
        {brands.length === 0 ? <EmptyState msg="No brands found." /> : (
          <table className="w-full"><thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase"><th className="text-left px-4 py-3">Code</th><th className="text-left px-4 py-3">Name</th></tr></thead>
          <tbody>{brands.map(b => <tr key={b.id} className="border-t hover:bg-muted/30"><td className="px-4 py-3 font-mono text-xs text-blue-700">{b.code}</td><td className="px-4 py-3 font-medium text-sm">{b.name}</td></tr>)}</tbody></table>
        )}
      </Card>
    </div>
  )
}

function UOMList() {
  const [uoms, setUoms] = useState<Array<{ id: string; code: string; name: string; symbol: string; uom_type: string }>>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { (async () => { try { const r = await productApi.listUOMs(); setUoms(r.data) } catch {} finally { setLoading(false) } })() }, [])
  if (loading) return <LoadingState />
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Units of Measure</h2>
      <Card className="p-0 overflow-hidden">
        {uoms.length === 0 ? <EmptyState msg="No UOMs found." /> : (
          <table className="w-full"><thead className="bg-muted/50"><tr className="text-xs font-semibold text-muted-foreground uppercase"><th className="text-left px-4 py-3">Code</th><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Symbol</th><th className="text-left px-4 py-3">Type</th></tr></thead>
          <tbody>{uoms.map(u => <tr key={u.id} className="border-t hover:bg-muted/30"><td className="px-4 py-3 font-mono text-xs text-blue-700">{u.code}</td><td className="px-4 py-3 font-medium text-sm">{u.name}</td><td className="px-4 py-3 text-sm">{u.symbol}</td><td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{u.uom_type}</Badge></td></tr>)}</tbody></table>
        )}
      </Card>
    </div>
  )
}

export function ProductModule() {
  const [tab, setTab] = useState<Tab>('dashboard')
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>{t.icon}{t.label}</button>
        ))}
      </div>
      {tab === 'dashboard' && <ProductDashboard onNavigate={setTab} />}
      {tab === 'products' && <ProductList />}
      {tab === 'categories' && <CategoryList />}
      {tab === 'brands' && <BrandList />}
      {tab === 'uoms' && <UOMList />}
    </div>
  )
}

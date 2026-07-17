'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { purchaseOrderApi, type PurchaseOrder } from '../api/client'
import { useAuthStore } from '@/stores/auth-store'
import { Plus, Search, Loader2, AlertCircle, CheckCircle2, FileText, Clock, TrendingUp, Package, ArrowLeft, FileDown } from 'lucide-react'

function LoadingState() { return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /><span className="ml-2 text-sm text-muted-foreground">Loading...</span></div> }
function ErrorState({ msg, onRetry }: { msg: string; onRetry?: () => void }) { return <div className="flex flex-col items-center justify-center py-12 gap-3"><AlertCircle className="h-8 w-8 text-red-500" /><p className="text-sm text-red-600">{msg}</p>{onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>}</div> }
function EmptyState({ msg }: { msg: string }) { return <div className="flex flex-col items-center justify-center py-12 gap-2"><FileText className="h-8 w-8 text-muted-foreground" /><p className="text-sm text-muted-foreground">{msg}</p></div> }

const statusColors: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  DEPT_APPROVAL: 'bg-cyan-100 text-cyan-700',
  FINANCE_APPROVAL: 'bg-amber-100 text-amber-700',
  MANAGEMENT_APPROVAL: 'bg-orange-100 text-orange-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  ISSUED: 'bg-indigo-100 text-indigo-700',
  SUPPLIER_ACCEPTED: 'bg-green-100 text-green-700',
  PARTIALLY_RECEIVED: 'bg-yellow-100 text-yellow-700',
  FULLY_RECEIVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-zinc-100 text-zinc-500',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-zinc-100 text-zinc-500',
  REVISION_REQUESTED: 'bg-purple-100 text-purple-700',
}

const typeColors: Record<string, string> = {
  STANDARD: 'bg-blue-100 text-blue-700',
  BLANKET: 'bg-purple-100 text-purple-700',
  CONTRACT: 'bg-indigo-100 text-indigo-700',
  SERVICE: 'bg-cyan-100 text-cyan-700',
  SUBCONTRACTING: 'bg-teal-100 text-teal-700',
  EMERGENCY: 'bg-red-100 text-red-700',
  CONSIGNMENT: 'bg-amber-100 text-amber-700',
  CAPITAL: 'bg-emerald-100 text-emerald-700',
}

function formatCurrency(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

function PODashboard({ onNavigate, hasPermission }: { onNavigate: () => void; hasPermission: (perm: string) => boolean }) {
  const [stats, setStats] = useState({ total: 0, pending: 0, issued: 0, received: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [all, pending, issued, received] = await Promise.all([
          purchaseOrderApi.list({ page: 1, pageSize: 1 }),
          purchaseOrderApi.list({ page: 1, pageSize: 1, status: 'DEPT_APPROVAL' }),
          purchaseOrderApi.list({ page: 1, pageSize: 1, status: 'ISSUED' }),
          purchaseOrderApi.list({ page: 1, pageSize: 1, status: 'FULLY_RECEIVED' }),
        ])
        setStats({ total: all.meta.total, pending: pending.meta.total, issued: issued.meta.total, received: received.meta.total })
      } catch {} finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <LoadingState />

  const cards = [
    { label: 'Total POs', value: stats.total, icon: FileText, color: 'text-blue-600' },
    { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'text-amber-600' },
    { label: 'Issued to Suppliers', value: stats.issued, icon: Package, color: 'text-indigo-600' },
    { label: 'Fully Received', value: stats.received, icon: CheckCircle2, color: 'text-emerald-600' },
  ]

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1">Purchase Order Management</h2>
        <p className="text-slate-300 text-sm">Enterprise procurement execution — from draft to delivery. The official procurement engine of SUOP ERP.</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(c => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold">{c.value}</p>
              </div>
              <c.icon className={`h-8 w-8 ${c.color}`} />
            </div>
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        {hasPermission('po:read') && <Button onClick={onNavigate}><Plus className="h-4 w-4 mr-1" />View All POs</Button>}
      </div>
    </div>
  )
}

function POList({ onBack, hasPermission }: { onBack: () => void; hasPermission: (perm: string) => boolean }) {
  const [pos, setPos] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await purchaseOrderApi.list({ page: 1, pageSize: 50, search: search || undefined, status: statusFilter || undefined, poType: typeFilter || undefined })
      setPos(result.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load POs')
    } finally { setLoading(false) }
  }, [search, statusFilter, typeFilter])

  useEffect(() => { load() }, [load])

  if (loading) return <LoadingState />
  if (error) return <ErrorState msg={error} onRetry={load} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">All Purchase Orders</h2>
        <div className="flex gap-2">
          {hasPermission('po:export') && <Button variant="outline" onClick={async () => {
            try {
              const res = await purchaseOrderApi.export({ search: search || undefined, status: statusFilter || undefined, poType: typeFilter || undefined })
              const rows = res.data || []
              if (rows.length === 0) return
              const csv = [Object.keys(rows[0]!).join(','), ...rows.map(r => Object.values(r).join(','))].join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a'); a.href = url; a.download = `purchase-orders-${new Date().toISOString().split('T')[0]}.csv`; a.click()
            } catch {}
          }}><FileDown className="h-4 w-4 mr-1" />Export</Button>}
          <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" />Back to Dashboard</Button>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Input placeholder="Search by PO number or supplier..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
        <select className="px-3 py-2 border rounded-md text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="DEPT_APPROVAL">Dept Approval</option>
          <option value="FINANCE_APPROVAL">Finance Approval</option>
          <option value="MANAGEMENT_APPROVAL">Management Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="ISSUED">Issued</option>
          <option value="SUPPLIER_ACCEPTED">Supplier Accepted</option>
          <option value="PARTIALLY_RECEIVED">Partially Received</option>
          <option value="FULLY_RECEIVED">Fully Received</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select className="px-3 py-2 border rounded-md text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="STANDARD">Standard</option>
          <option value="BLANKET">Blanket</option>
          <option value="CONTRACT">Contract</option>
          <option value="SERVICE">Service</option>
          <option value="SUBCONTRACTING">Subcontracting</option>
          <option value="EMERGENCY">Emergency</option>
          <option value="CONSIGNMENT">Consignment</option>
          <option value="CAPITAL">Capital</option>
        </select>
        <Button variant="outline" onClick={load}><Search className="h-4 w-4 mr-1" />Search</Button>
      </div>
      {pos.length === 0 ? (
        <EmptyState msg="No purchase orders found" />
      ) : (
        <div className="border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">PO Number</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Supplier</th>
                <th className="text-left p-3 font-medium">Plant</th>
                <th className="text-right p-3 font-medium">Grand Total</th>
                <th className="text-center p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {pos.map(po => (
                <tr key={po.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs">{po.po_number}{po.revision_no > 0 && <span className="text-muted-foreground ml-1">Rev {po.revision_no}</span>}</td>
                  <td className="p-3"><Badge className={typeColors[po.po_type] || 'bg-gray-100'}>{po.po_type}</Badge></td>
                  <td className="p-3">{po.supplier_name} <span className="text-xs text-muted-foreground">({po.supplier_code})</span></td>
                  <td className="p-3 text-xs">{po.plant_name}</td>
                  <td className="p-3 text-right font-semibold">{formatCurrency(Number(po.grand_total), po.currency)}</td>
                  <td className="p-3 text-center"><Badge className={statusColors[po.status] || 'bg-gray-100'}>{po.status.replace(/_/g, ' ')}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function PurchaseOrderModule() {
  const { hasPermission } = useAuthStore()
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard')
  return view === 'dashboard'
    ? <PODashboard onNavigate={() => setView('list')} hasPermission={hasPermission} />
    : <POList onBack={() => setView('dashboard')} hasPermission={hasPermission} />
}

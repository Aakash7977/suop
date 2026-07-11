'use client'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Loader2, Package, AlertTriangle } from 'lucide-react'
import { inventoryApi, type Inventory } from '../api/client'

export default function InventoryModule() {
  const [items, setItems] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    (async () => {
      try { const result = await inventoryApi.list({ page: 1, pageSize: 50 }); setItems(result.data) } catch {} finally { setLoading(false) }
    })()
  }, [])
  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
  const totalQty = items.reduce((s, i) => s + Number(i.quantity), 0)
  const expiredCount = items.filter(i => i.is_expired).length
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2"><Package className="h-6 w-6" /> Inventory & Stock Ledger</h2>
        <p className="text-slate-300 text-sm">Immutable stock ledger, FEFO/FIFO issuance, batch/lot tracking, expiry management, moving average cost.</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-sm text-muted-foreground">Total Items</p><p className="text-2xl font-bold">{items.length}</p></Card>
        <Card className="p-5"><p className="text-sm text-muted-foreground">Total Quantity</p><p className="text-2xl font-bold">{totalQty.toLocaleString()}</p></Card>
        <Card className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Expired</p><p className="text-2xl font-bold text-red-600">{expiredCount}</p></div>{expiredCount > 0 && <AlertTriangle className="h-8 w-8 text-red-500" />}</div></Card>
      </div>
      {items.length > 0 && (
        <div className="border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="text-left p-3">SKU</th><th className="text-left p-3">Product</th><th className="text-left p-3">Warehouse</th><th className="text-left p-3">Batch</th><th className="text-right p-3">Qty</th><th className="text-right p-3">Available</th><th className="text-right p-3">Unit Cost</th><th className="text-left p-3">Expiry</th></tr></thead>
            <tbody>{items.map(i => (<tr key={i.id} className="border-t hover:bg-muted/30"><td className="p-3 font-mono text-xs">{i.product_sku}</td><td className="p-3">{i.product_name}</td><td className="p-3 text-xs">{i.warehouse_name}</td><td className="p-3 text-xs">{i.batch_number ?? '—'}</td><td className="p-3 text-right">{Number(i.quantity)}</td><td className="p-3 text-right">{Number(i.available_qty)}</td><td className="p-3 text-right">₹{Number(i.moving_avg_cost).toFixed(2)}</td><td className="p-3 text-xs">{i.expiry_date ? new Date(i.expiry_date).toLocaleDateString() : '—'}{i.is_expired && ' ⚠️'}</td></tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

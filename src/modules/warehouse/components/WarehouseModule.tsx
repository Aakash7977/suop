'use client'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Loader2, Warehouse as WarehouseIcon } from 'lucide-react'
import { warehouseApi, type WarehouseBin } from '../api/client'

export default function WarehouseModule() {
  const [bins, setBins] = useState<WarehouseBin[]>([])
  const [loading, setLoading] = useState(true)
  const [warehouseId, setWarehouseId] = useState('')
  useEffect(() => {
    if (!warehouseId) { setLoading(false); return }
    (async () => {
      try { const result = await warehouseApi.listBins(warehouseId); setBins(result.data) } catch {} finally { setLoading(false) }
    })()
  }, [warehouseId])
  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2"><WarehouseIcon className="h-6 w-6" /> Warehouse Management</h2>
        <p className="text-slate-300 text-sm">Zones, aisles, racks, bins hierarchy. Put-away engine, barcode generation (GS1/QR/Code128), scanner API.</p>
      </Card>
      <div className="flex gap-2">
        <input className="px-3 py-2 border rounded-md text-sm flex-1" placeholder="Enter Warehouse ID to load bins..." value={warehouseId} onChange={e => setWarehouseId(e.target.value)} />
      </div>
      {bins.length > 0 && (
        <div className="border rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="text-left p-3">Bin Code</th><th className="text-left p-3">Name</th><th className="text-left p-3">Type</th><th className="text-right p-3">Level</th><th className="text-right p-3">Used/Capacity</th><th className="text-center p-3">Status</th></tr></thead>
            <tbody>{bins.map(b => (<tr key={b.id} className="border-t hover:bg-muted/30"><td className="p-3 font-mono text-xs">{b.bin_code}</td><td className="p-3">{b.bin_name}</td><td className="p-3 text-xs">{b.bin_type}</td><td className="p-3 text-right">{b.level}</td><td className="p-3 text-right">{Number(b.used_capacity)} / {Number(b.capacity)}</td><td className="p-3 text-center">{b.is_blocked ? <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-700">Blocked</span> : b.is_active ? <span className="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-700">Active</span> : <span className="px-2 py-1 rounded text-xs bg-zinc-100 text-zinc-500">Inactive</span>}</td></tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

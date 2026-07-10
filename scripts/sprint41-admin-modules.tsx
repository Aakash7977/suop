// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 41 — PACKAGING, LABELING & FINISHED GOODS MANAGEMENT
// Admin modules: Packaging Orders, Dashboard, Labels, Quality, Finished Goods,
// Cost, Handover, Hierarchy
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Packaging Dashboard ────────────────────────────────────────────────
function PackagingDashboardModule() {
  const kpis = {
    totalOrders: 24, inProgress: 3, completedToday: 12, qualityHold: 1, transferred: 11,
    unitsPacked: 1248, cartonsBuilt: 104, palletsBuilt: 8, labelsPrinted: 1386,
    avgPackagingTime: '45m', warehouseTransferRate: 100, avgTransferMs: 2840,
  }
  const recentOrders = [
    { pkgOrder: 'PKG-2026-00024', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', type: 'RETAIL_PACK', planned: 188, completed: 188, status: 'TRANSFERRED', priority: 'HIGH' },
    { pkgOrder: 'PKG-2026-00023', batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', type: 'GIFT_BOX', planned: 98, completed: 98, status: 'COMPLETED', priority: 'NORMAL' },
    { pkgOrder: 'PKG-2026-00022', batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', type: 'RETAIL_PACK', planned: 95, completed: 47, status: 'IN_PROGRESS', priority: 'HIGH' },
    { pkgOrder: 'PKG-2026-00021', batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', type: 'BULK_PACK', planned: 98, completed: 0, status: 'QUALITY_HOLD', priority: 'EMERGENCY' },
    { pkgOrder: 'PKG-2026-00020', batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', type: 'EXPORT_PACK', planned: 250, completed: 250, status: 'TRANSFERRED', priority: 'HIGH' },
  ]
  const statusColors: Record<string, string> = { DRAFT: 'bg-slate-100 text-slate-700', RELEASED: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-blue-100 text-blue-700', QUALITY_HOLD: 'bg-amber-100 text-amber-700', COMPLETED: 'bg-emerald-100 text-emerald-700', TRANSFERRED: 'bg-cyan-100 text-cyan-700', CANCELLED: 'bg-rose-100 text-rose-700' }
  const typeColors: Record<string, string> = { RETAIL_PACK: 'bg-emerald-100 text-emerald-700', GIFT_BOX: 'bg-purple-100 text-purple-700', BULK_PACK: 'bg-amber-100 text-amber-700', EXPORT_PACK: 'bg-blue-100 text-blue-700', PRIMARY: 'bg-pink-100 text-pink-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><PackageCheck className="h-6 w-6 text-amber-600" />Packaging Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 41 · Production Batch → Packaged → Labeled → Quality → Finished Goods → Warehouse</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Packaging Order</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total Orders', value: kpis.totalOrders, color: 'text-blue-600', icon: Package },
          { label: 'In Progress', value: kpis.inProgress, color: 'text-blue-600', icon: Activity },
          { label: 'Completed Today', value: kpis.completedToday, color: 'text-emerald-600', icon: CheckCircle2 },
          { label: 'Quality Hold', value: kpis.qualityHold, color: 'text-amber-600', icon: AlertTriangle },
          { label: 'Transferred', value: kpis.transferred, color: 'text-cyan-600', icon: ArrowRight },
          { label: 'Labels Printed', value: kpis.labelsPrinted, color: 'text-purple-600', icon: Printer },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className="h-6 w-6 text-muted-foreground/40" />
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Units Packed', value: kpis.unitsPacked, color: 'text-emerald-600', icon: Package },
          { label: 'Cartons Built', value: kpis.cartonsBuilt, color: 'text-amber-600', icon: Boxes },
          { label: 'Pallets Built', value: kpis.palletsBuilt, color: 'text-purple-600', icon: Layers3 },
          { label: 'Avg Transfer Time', value: `${(kpis.avgTransferMs / 1000).toFixed(2)}s`, color: 'text-cyan-600', icon: Clock },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className="h-6 w-6 text-muted-foreground/40" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Hierarchical Packaging Traceability — Unit → Box → Carton → Pallet</p>
            <div className="flex items-center gap-1 text-[11px] mt-2 overflow-x-auto">
              {['Unit Pack (12 pcs)', 'Box (10 unit packs)', 'Carton (12 boxes)', 'Pallet (40 cartons)', 'Available for Sale'].map((step, i, a) => (
                <div key={i} className="flex items-center gap-1 flex-shrink-0">
                  <span className="px-2 py-0.5 bg-white border rounded text-[10px] font-medium">{step}</span>
                  {i < a.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-amber-600 flex-shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Scan one pallet → identify all cartons. Scan one carton → identify all boxes. Scan one box → identify every retail unit. Faster warehouse receiving & dispatch.</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Recent Packaging Orders</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">PKG Order</th>
                <th className="px-3 py-2 font-medium">Batch / Product</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium text-right">Progress</th>
                <th className="px-3 py-2 font-medium">Priority</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.pkgOrder} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{o.pkgOrder}</td>
                  <td className="px-3 py-2"><p className="font-mono text-[10px] text-blue-700">{o.batch}</p><p className="font-medium">{o.product}</p></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[o.type] || 'bg-slate-100'}`}>{o.type.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 text-right">
                    <p className="font-medium">{o.completed} / {o.planned}</p>
                    <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden w-20 ml-auto">
                      <div className="h-full bg-emerald-500" style={{ width: `${o.planned > 0 ? (o.completed / o.planned) * 100 : 0}%` }} />
                    </div>
                  </td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${o.priority === 'EMERGENCY' ? 'bg-red-100 text-red-700' : o.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>{o.priority}</span></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColors[o.status]}`}>{o.status.replace(/_/g, ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Packaging Orders Module ────────────────────────────────────────────
function PackagingOrdersModule() {
  const orders = [
    { id: 'po1', pkgOrder: 'PKG-2026-00024', batch: 'KAJ-THN-20260709-000145', po: 'PO-2026-00125', product: 'Kaju Katli 500g', type: 'RETAIL_PACK', planned: 188, completed: 188, rejected: 0, uom: 'PCS', unitPerBox: 12, boxPerCarton: 4, cartonPerPallet: 3, priority: 'HIGH', status: 'TRANSFERRED', operator: 'Rajesh Kumar', line: 'PACK-LINE-01', wc: 'WC-PK-01', plannedStart: '2026-07-09 08:30', plannedFinish: '2026-07-09 11:00', actualStart: '2026-07-09 08:35', actualFinish: '2026-07-09 10:55', quality: 'PASSED', whReceipt: 'WR-2026-0148', transferredAt: '2026-07-09 11:02' },
    { id: 'po2', pkgOrder: 'PKG-2026-00023', batch: 'KAJ-THN-20260709-000146', po: 'PO-2026-00125', product: 'Kaju Katli 1kg', type: 'GIFT_BOX', planned: 98, completed: 98, rejected: 0, uom: 'PCS', unitPerBox: 6, boxPerCarton: 4, cartonPerPallet: 4, priority: 'NORMAL', status: 'COMPLETED', operator: 'Rajesh Kumar', line: 'PACK-LINE-01', wc: 'WC-PK-01', plannedStart: '2026-07-09 11:30', plannedFinish: '2026-07-09 14:00', actualStart: '2026-07-09 11:35', actualFinish: '2026-07-09 13:40', quality: 'PASSED' },
    { id: 'po3', pkgOrder: 'PKG-2026-00022', batch: 'SHW-THN-20260709-000047', po: 'PO-2026-00126', product: 'Shwet Idli Batter 1kg', type: 'RETAIL_PACK', planned: 95, completed: 47, rejected: 1, uom: 'PCS', unitPerBox: 12, boxPerCarton: 6, cartonPerPallet: 4, priority: 'HIGH', status: 'IN_PROGRESS', operator: 'Anil Reddy', line: 'PACK-LINE-02', wc: 'WC-PK-02', plannedStart: '2026-07-09 13:00', plannedFinish: '2026-07-09 16:00', actualStart: '2026-07-09 13:15', quality: 'PENDING' },
    { id: 'po4', pkgOrder: 'PKG-2026-00021', batch: 'MOT-THN-20260708-000032', po: 'PO-2026-00129', product: 'Motichoor Laddu 1kg', type: 'BULK_PACK', planned: 98, completed: 0, rejected: 0, uom: 'PCS', unitPerBox: 4, boxPerCarton: 6, cartonPerPallet: 5, priority: 'EMERGENCY', status: 'QUALITY_HOLD', operator: 'Vijay Patel', line: 'PACK-LINE-03', wc: 'WC-PK-03', plannedStart: '2026-07-09 14:00', plannedFinish: '2026-07-09 17:00', quality: 'HOLD' },
    { id: 'po5', pkgOrder: 'PKG-2026-00020', batch: 'NAM-THN-20260709-000021', po: 'PO-2026-00127', product: 'Mixed Namkeen 500g', type: 'EXPORT_PACK', planned: 250, completed: 250, rejected: 2, uom: 'PCS', unitPerBox: 20, boxPerCarton: 8, cartonPerPallet: 6, priority: 'HIGH', status: 'TRANSFERRED', operator: 'Suresh Mehta', line: 'PACK-LINE-02', wc: 'WC-PK-02', quality: 'PASSED', whReceipt: 'WR-2026-0146', transferredAt: '2026-07-09 09:30' },
  ]
  const statusColors: Record<string, string> = { DRAFT: 'bg-slate-100 text-slate-700', RELEASED: 'bg-blue-100 text-blue-700', IN_PROGRESS: 'bg-blue-100 text-blue-700', QUALITY_HOLD: 'bg-amber-100 text-amber-700', COMPLETED: 'bg-emerald-100 text-emerald-700', TRANSFERRED: 'bg-cyan-100 text-cyan-700', CANCELLED: 'bg-rose-100 text-rose-700' }
  const typeColors: Record<string, string> = { RETAIL_PACK: 'bg-emerald-100 text-emerald-700', GIFT_BOX: 'bg-purple-100 text-purple-700', BULK_PACK: 'bg-amber-100 text-amber-700', EXPORT_PACK: 'bg-blue-100 text-blue-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-amber-600" />Packaging Orders</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 41 · Epic 1 · Production batch → Packaged units → Finished goods → Warehouse</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Order</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: orders.length, color: 'text-blue-600' },
          { label: 'In Progress', value: orders.filter(o => o.status === 'IN_PROGRESS').length, color: 'text-blue-600' },
          { label: 'Completed', value: orders.filter(o => o.status === 'COMPLETED').length, color: 'text-emerald-600' },
          { label: 'Quality Hold', value: orders.filter(o => o.status === 'QUALITY_HOLD').length, color: 'text-amber-600' },
          { label: 'Transferred', value: orders.filter(o => o.status === 'TRANSFERRED').length, color: 'text-cyan-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">PKG Order</th>
                <th className="px-3 py-2 font-medium">Batch / Product</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Hierarchy (Unit/Box/Carton/Pallet)</th>
                <th className="px-3 py-2 font-medium text-right">Progress</th>
                <th className="px-3 py-2 font-medium">Operator</th>
                <th className="px-3 py-2 font-medium">Schedule</th>
                <th className="px-3 py-2 font-medium">Quality</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{o.pkgOrder}<p className="text-[10px] text-muted-foreground">{o.po}</p></td>
                  <td className="px-3 py-2"><p className="font-mono text-[10px] text-blue-700">{o.batch}</p><p className="font-medium">{o.product}</p></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[o.type]}`}>{o.type.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 text-[10px]">{o.unitPerBox}u/{o.boxPerCarton}b/{o.cartonPerPallet}c</td>
                  <td className="px-3 py-2 text-right">
                    <p className="font-medium">{o.completed} / {o.planned} {o.uom}</p>
                    {o.rejected > 0 && <p className="text-[10px] text-rose-600">Rejected: {o.rejected}</p>}
                    <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden w-20 ml-auto">
                      <div className="h-full bg-emerald-500" style={{ width: `${o.planned > 0 ? (o.completed / o.planned) * 100 : 0}%` }} />
                    </div>
                  </td>
                  <td className="px-3 py-2"><p>{o.operator}</p><p className="text-[10px] text-muted-foreground">{o.line} · {o.wc}</p></td>
                  <td className="px-3 py-2 text-[10px]"><p>Start: {o.actualStart || o.plannedStart}</p><p>Finish: {o.actualFinish || o.plannedFinish}</p></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${o.quality === 'PASSED' ? 'bg-emerald-100 text-emerald-700' : o.quality === 'HOLD' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>{o.quality}</span></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColors[o.status]}`}>{o.status.replace(/_/g, ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Package Hierarchy Viewer ───────────────────────────────────────────
function PackageHierarchyModule() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><GitGraph className="h-6 w-6 text-purple-600" />Package Hierarchy</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 41 · Epic 2 · Unit → Inner Pack → Box → Carton → Pallet · Hierarchical traceability</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-xs border rounded px-2 py-1 bg-background h-8">
            <option>PKG-2026-00024 · Kaju Katli 500g</option>
            <option>PKG-2026-00023 · Kaju Katli 1kg</option>
            <option>PKG-2026-00022 · Shwet Idli Batter 1kg</option>
          </select>
        </div>
      </div>
      <Card className="p-4 bg-purple-50/30 border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Hierarchy Tree — PKG-2026-00024 (Kaju Katli 500g)</h3>
          <Badge variant="outline" className="text-purple-700 border-purple-300">188 units · 16 boxes · 4 cartons · 2 pallets</Badge>
        </div>
        <div className="flex flex-col items-center gap-4 py-4">
          {/* Pallets */}
          <div className="w-full">
            <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">📦 PALLETS (2)</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { num: 'PAL-2026-000012', barcode: 'PAL-012', qr: 'QR-PAL-012', cartons: 3, boxes: 12, units: 144, weight: 72.0, status: 'SEALED', destination: 'WH-THN-FG-01' },
                { num: 'PAL-2026-000013', barcode: 'PAL-013', qr: 'QR-PAL-013', cartons: 1, boxes: 4, units: 44, weight: 22.0, status: 'BUILDING', destination: 'WH-THN-FG-01' },
              ].map(p => (
                <div key={p.num} className="p-3 rounded-lg bg-purple-100 border-2 border-purple-300">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-mono text-[11px] font-semibold text-purple-700">{p.num}</p>
                    <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">📦 {p.cartons} cartons · 📦 {p.boxes} boxes · 📦 {p.units} units · {p.weight} kg</p>
                  <p className="text-[10px] text-purple-700 mt-1">🏷️ {p.barcode} · QR: {p.qr}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">📍 Dest: {p.destination}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Down arrow */}
          <ArrowRight className="h-5 w-5 text-purple-400 rotate-90" />
          {/* Cartons */}
          <div className="w-full">
            <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">📦 CARTONS (4)</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { num: 'CTN-2026-000048', barcode: 'CTN-048', boxes: 4, units: 48, weight: 24.0, status: 'SEALED' },
                { num: 'CTN-2026-000049', barcode: 'CTN-049', boxes: 4, units: 48, weight: 24.0, status: 'SEALED' },
                { num: 'CTN-2026-000050', barcode: 'CTN-050', boxes: 4, units: 48, weight: 24.0, status: 'SEALED' },
                { num: 'CTN-2026-000051', barcode: 'CTN-051', boxes: 4, units: 44, weight: 22.0, status: 'SEALED' },
              ].map(c => (
                <div key={c.num} className="p-2 rounded-lg bg-amber-100 border border-amber-300 text-center">
                  <p className="font-mono text-[10px] text-amber-700">{c.num}</p>
                  <p className="text-[9px] text-muted-foreground mt-1">{c.boxes}b · {c.units}u · {c.weight}kg</p>
                  <p className="text-[9px] text-amber-700">{c.barcode}</p>
                </div>
              ))}
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-purple-400 rotate-90" />
          {/* Boxes */}
          <div className="w-full">
            <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">📦 BOXES (16)</p>
            <div className="grid grid-cols-8 gap-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="p-1.5 rounded bg-blue-100 border border-blue-300 text-center">
                  <p className="font-mono text-[9px] text-blue-700">BOX-{481 + i}</p>
                  <p className="text-[8px] text-muted-foreground">12u</p>
                </div>
              ))}
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-purple-400 rotate-90" />
          {/* Units */}
          <div className="w-full">
            <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">📦 UNITS (188) — Retail Packs</p>
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="p-1 rounded bg-emerald-100 border border-emerald-300 text-center">
                  <p className="font-mono text-[8px] text-emerald-700">U-{i + 1}</p>
                </div>
              ))}
              <div className="col-span-12 text-center text-[10px] text-muted-foreground py-1">... and 164 more units</div>
            </div>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Traceability Matrix</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { scan: 'Scan PALLET', reveals: 'All cartons inside', count: 4, icon: Package },
            { scan: 'Scan CARTON', reveals: 'All boxes inside', count: 16, icon: Boxes },
            { scan: 'Scan BOX', reveals: 'All retail units', count: 188, icon: Package },
            { scan: 'Scan UNIT', reveals: 'Full batch + supplier', count: 1, icon: QrCode },
          ].map(t => (
            <div key={t.scan} className="p-3 rounded-lg border bg-muted/20">
              <t.icon className="h-5 w-5 text-purple-600" />
              <p className="text-xs font-semibold mt-2">{t.scan}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t.reveals}</p>
              <p className="text-base font-bold text-purple-600 mt-1">{t.count}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Packaging Labels Module ────────────────────────────────────────────
function PackagingLabelsModule() {
  const jobs = [
    { code: 'PLJ-2026-00148', pkgOrder: 'PKG-2026-00024', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', package: 'PAL-2026-000012', level: 'PALLET', labelType: 'PALLET_LABEL', printer: 'Zebra ZD420 (BT)', copies: 1, duration: 1340, status: 'COMPLETED', time: '11:01' },
    { code: 'PLJ-2026-00147', pkgOrder: 'PKG-2026-00024', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', package: 'CTN-2026-000048', level: 'CARTON', labelType: 'CARTON_LABEL', printer: 'Zebra ZD620 (Network)', copies: 1, duration: 1180, status: 'COMPLETED', time: '10:45' },
    { code: 'PLJ-2026-00146', pkgOrder: 'PKG-2026-00024', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', package: 'BOX-2026-000481', level: 'BOX', labelType: 'BARCODE_LABEL', printer: 'Zebra ZD420 (BT)', copies: 1, duration: 920, status: 'COMPLETED', time: '10:30' },
    { code: 'PLJ-2026-00145', pkgOrder: 'PKG-2026-00023', batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', package: 'PKG-UNIT-002345', level: 'UNIT', labelType: 'PRODUCT_LABEL', printer: 'Zebra ZD420 (BT)', copies: 1, duration: 1480, status: 'COMPLETED', time: '13:30' },
    { code: 'PLJ-2026-00144', pkgOrder: 'PKG-2026-00021', batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', package: 'CTN-2026-000045', level: 'CARTON', labelType: 'SHIPPING_LABEL', printer: 'Zebra 110Xi4', copies: 1, duration: null, status: 'QUEUED', time: '—' },
    { code: 'PLJ-2026-00143', pkgOrder: 'PKG-2026-00020', batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', package: 'PAL-2026-000010', level: 'PALLET', labelType: 'PALLET_LABEL', printer: 'Zebra ZD620 (Network)', copies: 1, duration: 1620, status: 'COMPLETED', time: '09:25' },
  ]
  const statusColors: Record<string, string> = { COMPLETED: 'bg-emerald-100 text-emerald-700', QUEUED: 'bg-slate-100 text-slate-700', PRINTING: 'bg-blue-100 text-blue-700', FAILED: 'bg-rose-100 text-rose-700' }
  const labelTypeColors: Record<string, string> = { PRODUCT_LABEL: 'bg-emerald-100 text-emerald-700', BATCH_LABEL: 'bg-blue-100 text-blue-700', CARTON_LABEL: 'bg-amber-100 text-amber-700', PALLET_LABEL: 'bg-purple-100 text-purple-700', QR_LABEL: 'bg-cyan-100 text-cyan-700', BARCODE_LABEL: 'bg-pink-100 text-pink-700', SHIPPING_LABEL: 'bg-orange-100 text-orange-700', INTERNAL_LABEL: 'bg-slate-100 text-slate-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Printer className="h-6 w-6 text-purple-600" />Packaging Labels</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 41 · Epic 4 · 8 label types · Auto-print product/batch/carton/pallet/QR/barcode/shipping · Target &lt;2s</p>
        </div>
        <Button size="sm"><Printer className="mr-1 h-4 w-4" />Print Label</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Jobs', value: 1386, color: 'text-blue-600' },
          { label: 'Completed', value: 1381, color: 'text-emerald-600' },
          { label: 'Queued', value: 3, color: 'text-slate-600' },
          { label: 'Failed', value: 2, color: 'text-rose-600' },
          { label: 'Avg Duration', value: '1.48s', color: 'text-emerald-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4 bg-purple-50/50 border-purple-200">
        <div className="flex items-start gap-3">
          <Printer className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Label Specification — What gets printed</p>
            <p className="text-xs text-muted-foreground mt-1">Product Name · Batch Number · MFG Date · Expiry Date · MRP · Net Weight · QR Code · Barcode · Barcode Type (CODE_128, EAN-13, GS1-128, GS1 DataMatrix) · Future: RFID Tag · 8 label types: PRODUCT, BATCH, CARTON, PALLET, QR, BARCODE, SHIPPING, INTERNAL</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Job Code</th>
                <th className="px-3 py-2 font-medium">PKG Order / Batch</th>
                <th className="px-3 py-2 font-medium">Package</th>
                <th className="px-3 py-2 font-medium">Label Type</th>
                <th className="px-3 py-2 font-medium">Printer</th>
                <th className="px-3 py-2 font-medium text-center">Duration</th>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-blue-700">{j.code}</td>
                  <td className="px-3 py-2"><p className="font-mono text-[10px] text-blue-700">{j.pkgOrder}</p><p className="text-[10px] text-muted-foreground">{j.product}</p></td>
                  <td className="px-3 py-2"><p className="font-mono text-[10px] text-blue-700">{j.package}</p><p className="text-[10px] text-muted-foreground">{j.level}</p></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${labelTypeColors[j.labelType]}`}>{j.labelType.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 text-[11px]">{j.printer}</td>
                  <td className={`px-3 py-2 text-center font-medium ${j.duration ? (j.duration < 2000 ? 'text-emerald-600' : 'text-amber-600') : 'text-slate-400'}`}>{j.duration ? `${(j.duration / 1000).toFixed(2)}s` : '—'}</td>
                  <td className="px-3 py-2 text-[11px]">{j.time}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColors[j.status]}`}>{j.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Packaging Quality Module ───────────────────────────────────────────
function PackagingQualityModule() {
  const checks = [
    { code: 'PKG-QC-000148', pkgOrder: 'PKG-2026-00024', batch: 'KAJ-THN-20260709-000145', package: 'PAL-2026-000012', type: 'SEAL_QUALITY', measured: 'OK', target: 'OK', result: 'PASS', by: 'Lakshmi V.', time: '11:00', remarks: 'All seals verified' },
    { code: 'PKG-QC-000147', pkgOrder: 'PKG-2026-00024', batch: 'KAJ-THN-20260709-000145', package: 'CTN-2026-000048', type: 'WEIGHT', measured: '24.0 KG', target: '24.0 KG ±0.1', result: 'PASS', by: 'Lakshmi V.', time: '10:45' },
    { code: 'PKG-QC-000146', pkgOrder: 'PKG-2026-00024', batch: 'KAJ-THN-20260709-000145', package: 'CTN-2026-000048', type: 'BARCODE_READABILITY', measured: 'READ', target: 'READ', result: 'PASS', by: 'Rajesh Kumar', time: '10:46' },
    { code: 'PKG-QC-000145', pkgOrder: 'PKG-2026-00024', batch: 'KAJ-THN-20260709-000145', package: 'BOX-2026-000481', type: 'LABEL_ACCURACY', measured: 'CORRECT', target: 'CORRECT', result: 'PASS', by: 'Rajesh Kumar', time: '10:30' },
    { code: 'PKG-QC-000144', pkgOrder: 'PKG-2026-00022', batch: 'SHW-THN-20260709-000047', package: 'PKG-UNIT-002188', type: 'PRINT_QUALITY', measured: 'FADED', target: 'CRISP', result: 'FAIL', by: 'Anil Reddy', time: '14:30', remarks: 'Print head needs cleaning' },
    { code: 'PKG-QC-000143', pkgOrder: 'PKG-2026-00022', batch: 'SHW-THN-20260709-000047', package: 'PKG-UNIT-002189', type: 'WEIGHT', measured: '0.98 KG', target: '1.0 KG ±0.02', result: 'FAIL', by: 'Anil Reddy', time: '14:45' },
    { code: 'PKG-QC-000142', pkgOrder: 'PKG-2026-00020', batch: 'NAM-THN-20260709-000021', package: 'PAL-2026-000010', type: 'PACKAGE_DAMAGE', measured: 'OK', target: 'OK', result: 'PASS', by: 'Suresh Mehta', time: '09:20' },
    { code: 'PKG-QC-000141', pkgOrder: 'PKG-2026-00020', batch: 'NAM-THN-20260709-000021', package: 'CTN-2026-000040', type: 'MRP_ACCURACY', measured: '₹250', target: '₹250', result: 'PASS', by: 'Suresh Mehta', time: '09:15' },
    { code: 'PKG-QC-000140', pkgOrder: 'PKG-2026-00023', batch: 'KAJ-THN-20260709-000146', package: 'PKG-UNIT-002345', type: 'DATE_PRINTING', measured: 'CLEAR', target: 'CLEAR', result: 'PASS', by: 'Rajesh Kumar', time: '13:35' },
  ]
  const resultColors: Record<string, string> = { PASS: 'bg-emerald-100 text-emerald-700', FAIL: 'bg-rose-100 text-rose-700', REWORK: 'bg-amber-100 text-amber-700', HOLD: 'bg-purple-100 text-purple-700' }
  const checkTypeIcons: Record<string, string> = { SEAL_QUALITY: '🔐', WEIGHT: '⚖️', BARCODE_READABILITY: '📊', LABEL_ACCURACY: '🏷️', PRINT_QUALITY: '🖨️', PACKAGE_DAMAGE: '📦', MRP_ACCURACY: '💰', DATE_PRINTING: '📅' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-purple-600" />Packaging Quality</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 41 · Epic 6 · 8 check types · Quality approval required before warehouse transfer</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Checks', value: 18, color: 'text-blue-600' },
          { label: 'Pass', value: 16, color: 'text-emerald-600' },
          { label: 'Fail', value: 2, color: 'text-rose-600' },
          { label: 'Pass Rate', value: '88.9%', color: 'text-emerald-600' },
          { label: 'Critical Fails', value: 1, color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { type: 'SEAL_QUALITY', count: 4, pass: 4, icon: '🔐' },
          { type: 'WEIGHT', count: 5, pass: 4, icon: '⚖️' },
          { type: 'BARCODE_READABILITY', count: 3, pass: 3, icon: '📊' },
          { type: 'LABEL_ACCURACY', count: 2, pass: 2, icon: '🏷️' },
          { type: 'PRINT_QUALITY', count: 2, pass: 1, icon: '🖨️' },
          { type: 'PACKAGE_DAMAGE', count: 1, pass: 1, icon: '📦' },
          { type: 'MRP_ACCURACY', count: 1, pass: 1, icon: '💰' },
          { type: 'DATE_PRINTING', count: 1, pass: 1, icon: '📅' },
        ].map(c => (
          <Card key={c.type} className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-xl">{c.icon}</span>
              <span className="text-xs font-bold">{c.count}</span>
            </div>
            <p className="text-xs font-medium mt-1">{c.type.replace(/_/g, ' ')}</p>
            <p className="text-[10px] text-muted-foreground">Pass rate: {c.count > 0 ? ((c.pass / c.count) * 100).toFixed(0) : 0}%</p>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Recent Quality Checks</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">QC Code</th>
                <th className="px-3 py-2 font-medium">PKG Order / Batch</th>
                <th className="px-3 py-2 font-medium">Package</th>
                <th className="px-3 py-2 font-medium">Check Type</th>
                <th className="px-3 py-2 font-medium">Measured / Target</th>
                <th className="px-3 py-2 font-medium">Inspector</th>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {checks.map(qc => (
                <tr key={qc.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-blue-700">{qc.code}</td>
                  <td className="px-3 py-2"><p className="font-mono text-[10px] text-blue-700">{qc.pkgOrder}</p><p className="text-[10px] text-muted-foreground">{qc.batch}</p></td>
                  <td className="px-3 py-2 font-mono text-[10px] text-blue-700">{qc.package}</td>
                  <td className="px-3 py-2"><span className="text-base mr-1">{checkTypeIcons[qc.type]}</span><span className="text-[10px]">{qc.type.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 text-[11px]"><p className="font-medium">{qc.measured}</p><p className="text-muted-foreground">Target: {qc.target}</p>{qc.remarks && <p className="text-rose-600 text-[10px] mt-0.5">⚠ {qc.remarks}</p>}</td>
                  <td className="px-3 py-2">{qc.by}</td>
                  <td className="px-3 py-2 text-[11px]">{qc.time}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${resultColors[qc.result]}`}>{qc.result}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Finished Goods Module ──────────────────────────────────────────────
function FinishedGoodsModule() {
  const fgs = [
    { code: 'FG-2026-00024', pkgOrder: 'PKG-2026-00024', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', qty: 188, uom: 'PCS', units: 188, boxes: 16, cartons: 4, pallets: 2, weight: 94.0, quality: 'PASSED', invPosted: true, invTxn: 'INV-2026-00482', whReceipt: 'WR-2026-0148', wh: 'WH-THN-FG-01', putaway: 'PUT-2026-00148', transferredAt: '2026-07-09 11:02', transferMs: 2840, status: 'COMPLETED' },
    { code: 'FG-2026-00023', pkgOrder: 'PKG-2026-00023', batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', qty: 98, uom: 'PCS', units: 98, boxes: 17, cartons: 5, pallets: 2, weight: 98.0, quality: 'PASSED', invPosted: true, invTxn: 'INV-2026-00481', whReceipt: 'WR-2026-0147', wh: 'WH-THN-FG-01', putaway: 'PUT-2026-00147', transferredAt: '2026-07-09 13:45', transferMs: 2120, status: 'COMPLETED' },
    { code: 'FG-2026-00022', pkgOrder: 'PKG-2026-00022', batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', qty: 47, uom: 'PCS', units: 47, boxes: 4, cartons: 1, pallets: 0, weight: 47.0, quality: 'PENDING', invPosted: false, status: 'PENDING' },
    { code: 'FG-2026-00020', pkgOrder: 'PKG-2026-00020', batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', qty: 250, uom: 'PCS', units: 250, boxes: 13, cartons: 2, pallets: 1, weight: 125.0, quality: 'PASSED', invPosted: true, invTxn: 'INV-2026-00478', whReceipt: 'WR-2026-0146', wh: 'WH-THN-FG-01', putaway: 'PUT-2026-00146', transferredAt: '2026-07-09 09:30', transferMs: 3120, status: 'COMPLETED' },
  ]
  const statusColors: Record<string, string> = { PENDING: 'bg-amber-100 text-amber-700', QUALITY_APPROVED: 'bg-blue-100 text-blue-700', INVENTORY_POSTED: 'bg-cyan-100 text-cyan-700', WAREHOUSE_TRANSFERRED: 'bg-purple-100 text-purple-700', COMPLETED: 'bg-emerald-100 text-emerald-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><PackageCheck className="h-6 w-6 text-emerald-600" />Finished Goods</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 41 · Epic 5 · Auto FG batch · Inventory posting · Warehouse receipt · Putaway task</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />Confirm FG</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total FG', value: 12, color: 'text-blue-600' },
          { label: 'Pending', value: 1, color: 'text-amber-600' },
          { label: 'Inventory Posted', value: 11, color: 'text-cyan-600' },
          { label: 'WH Transferred', value: 11, color: 'text-purple-600' },
          { label: 'Total Units', value: 1248, color: 'text-emerald-600' },
          { label: 'Avg Transfer', value: '2.84s', color: 'text-emerald-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4 bg-emerald-50/50 border-emerald-200">
        <div className="flex items-start gap-3">
          <PackageCheck className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Finished Goods Workflow</p>
            <div className="flex items-center gap-1 text-[11px] mt-2 overflow-x-auto">
              {['Packaging Complete', 'Quality Approved', 'FG Batch Created', 'Inventory Posted', 'Warehouse Receipt', 'Putaway Task', 'Available for Sale'].map((step, i, a) => (
                <div key={i} className="flex items-center gap-1 flex-shrink-0">
                  <span className="px-2 py-0.5 bg-white border rounded text-[10px] font-medium">{step}</span>
                  {i < a.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-emerald-600 flex-shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">No manual stock transfer. Everything flows automatically. Target: &lt;5 seconds for full handover.</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">FG Code</th>
                <th className="px-3 py-2 font-medium">PKG Order / Batch</th>
                <th className="px-3 py-2 font-medium">Product / Qty</th>
                <th className="px-3 py-2 font-medium">Hierarchy (U/B/C/P)</th>
                <th className="px-3 py-2 font-medium">Quality</th>
                <th className="px-3 py-2 font-medium">Inventory</th>
                <th className="px-3 py-2 font-medium">Warehouse Handover</th>
                <th className="px-3 py-2 font-medium text-center">Transfer Time</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {fgs.map(fg => (
                <tr key={fg.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{fg.code}</td>
                  <td className="px-3 py-2"><p className="font-mono text-[10px] text-blue-700">{fg.pkgOrder}</p><p className="text-[10px] text-muted-foreground">{fg.batch}</p></td>
                  <td className="px-3 py-2"><p className="font-medium">{fg.product}</p><p className="text-[10px] text-muted-foreground">{fg.qty} {fg.uom} · {fg.weight} KG</p></td>
                  <td className="px-3 py-2 text-[11px]">{fg.units}/{fg.boxes}/{fg.cartons}/{fg.pallets}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${fg.quality === 'PASSED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{fg.quality}</span></td>
                  <td className="px-3 py-2">{fg.invPosted ? <div><p className="text-[10px] text-emerald-600">✓ Posted</p><p className="font-mono text-[10px] text-blue-700">{fg.invTxn}</p></div> : <span className="text-[10px] text-amber-600">Pending</span>}</td>
                  <td className="px-3 py-2">{fg.whReceipt ? <div><p className="font-mono text-[10px] text-blue-700">{fg.whReceipt}</p><p className="text-[10px] text-muted-foreground">{fg.wh}</p><p className="font-mono text-[10px] text-purple-700">{fg.putaway}</p></div> : <span className="text-[10px] text-amber-600">Awaiting</span>}</td>
                  <td className={`px-3 py-2 text-center font-medium ${fg.transferMs ? (fg.transferMs < 5000 ? 'text-emerald-600' : 'text-amber-600') : 'text-slate-400'}`}>{fg.transferMs ? `${(fg.transferMs / 1000).toFixed(2)}s` : '—'}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColors[fg.status]}`}>{fg.status.replace(/_/g, ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Packaging Cost Module ──────────────────────────────────────────────
function PackagingCostModule() {
  const costs = [
    { pkgOrder: 'PKG-2026-00024', product: 'Kaju Katli 500g', type: 'RETAIL_PACK', qty: 188, uom: 'PCS', material: 940.00, labor: 240.00, machine: 80.00, energy: 30.00, overhead: 50.00, total: 1340.00, perUnit: 7.13, perKg: 14.26, production: 18800.00, final: 20140.00, finalPerUnit: 107.13 },
    { pkgOrder: 'PKG-2026-00023', product: 'Kaju Katli 1kg', type: 'GIFT_BOX', qty: 98, uom: 'PCS', material: 980.00, labor: 196.00, machine: 60.00, energy: 25.00, overhead: 40.00, total: 1301.00, perUnit: 13.27, perKg: 13.27, production: 19600.00, final: 20901.00, finalPerUnit: 213.27 },
    { pkgOrder: 'PKG-2026-00022', product: 'Shwet Idli Batter 1kg', type: 'RETAIL_PACK', qty: 47, uom: 'PCS', material: 235.00, labor: 120.00, machine: 40.00, energy: 15.00, overhead: 25.00, total: 435.00, perUnit: 9.26, perKg: 9.26, production: 9400.00, final: 9835.00, finalPerUnit: 209.26 },
    { pkgOrder: 'PKG-2026-00020', product: 'Mixed Namkeen 500g', type: 'EXPORT_PACK', qty: 250, uom: 'PCS', material: 1500.00, labor: 400.00, machine: 120.00, energy: 50.00, overhead: 80.00, total: 2150.00, perUnit: 8.60, perKg: 17.20, production: 25000.00, final: 27150.00, finalPerUnit: 108.60 },
  ]
  const typeColors: Record<string, string> = { RETAIL_PACK: 'bg-emerald-100 text-emerald-700', GIFT_BOX: 'bg-purple-100 text-purple-700', BULK_PACK: 'bg-amber-100 text-amber-700', EXPORT_PACK: 'bg-blue-100 text-blue-700' }
  const fmtINR = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><IndianRupee className="h-6 w-6 text-amber-600" />Packaging Cost Tracking</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 41 · Epic 7 · 5 cost components · Material + Labor + Machine + Energy + Overhead → Final Product Cost</p>
        </div>
        <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Material Cost', value: fmtINR(3655), color: 'text-blue-600' },
          { label: 'Labor Cost', value: fmtINR(956), color: 'text-emerald-600' },
          { label: 'Machine + Energy', value: fmtINR(420), color: 'text-amber-600' },
          { label: 'Total Packaging', value: fmtINR(5226), color: 'text-purple-600' },
          { label: 'Final Product Cost', value: fmtINR(78026), color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-base font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Cost Breakdown by Packaging Type</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { type: 'RETAIL_PACK', count: 2, avgPerUnit: 8.20, avgPerKg: 11.76, color: 'border-emerald-300 bg-emerald-50' },
            { type: 'GIFT_BOX', count: 1, avgPerUnit: 13.27, avgPerKg: 13.27, color: 'border-purple-300 bg-purple-50' },
            { type: 'EXPORT_PACK', count: 1, avgPerUnit: 8.60, avgPerKg: 17.20, color: 'border-blue-300 bg-blue-50' },
          ].map(t => (
            <div key={t.type} className={`p-3 rounded-lg border ${t.color}`}>
              <p className="text-xs font-bold">{t.type.replace(/_/g, ' ')}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{t.count} orders</p>
              <p className="text-base font-bold mt-1">₹{t.avgPerUnit}/unit</p>
              <p className="text-[10px] text-muted-foreground">₹{t.avgPerKg}/kg</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">PKG Order</th>
                <th className="px-3 py-2 font-medium">Product / Type</th>
                <th className="px-3 py-2 font-medium text-right">Material</th>
                <th className="px-3 py-2 font-medium text-right">Labor</th>
                <th className="px-3 py-2 font-medium text-right">Machine</th>
                <th className="px-3 py-2 font-medium text-right">Energy</th>
                <th className="px-3 py-2 font-medium text-right">Overhead</th>
                <th className="px-3 py-2 font-medium text-right">Total Pack</th>
                <th className="px-3 py-2 font-medium text-right">Per Unit</th>
                <th className="px-3 py-2 font-medium text-right">Production</th>
                <th className="px-3 py-2 font-medium text-right">Final Cost</th>
                <th className="px-3 py-2 font-medium text-right">Final/Unit</th>
              </tr>
            </thead>
            <tbody>
              {costs.map(c => (
                <tr key={c.pkgOrder} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{c.pkgOrder}</td>
                  <td className="px-3 py-2"><p className="font-medium">{c.product}</p><div className="mt-0.5"><span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[c.type]}`}>{c.type.replace(/_/g, ' ')}</span></div><p className="text-[10px] text-muted-foreground mt-0.5">{c.qty} {c.uom}</p></td>
                  <td className="px-3 py-2 text-right text-blue-700">{fmtINR(c.material)}</td>
                  <td className="px-3 py-2 text-right text-emerald-700">{fmtINR(c.labor)}</td>
                  <td className="px-3 py-2 text-right text-amber-700">{fmtINR(c.machine)}</td>
                  <td className="px-3 py-2 text-right text-orange-700">{fmtINR(c.energy)}</td>
                  <td className="px-3 py-2 text-right text-purple-700">{fmtINR(c.overhead)}</td>
                  <td className="px-3 py-2 text-right font-bold text-purple-700">{fmtINR(c.total)}</td>
                  <td className="px-3 py-2 text-right font-medium">₹{c.perUnit}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{fmtINR(c.production)}</td>
                  <td className="px-3 py-2 text-right font-bold text-rose-700">{fmtINR(c.final)}</td>
                  <td className="px-3 py-2 text-right font-bold text-rose-700">₹{c.finalPerUnit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Warehouse Handover Module ──────────────────────────────────────────
function WarehouseHandoverModule() {
  const queue = [
    { fgCode: 'FG-2026-00022', pkgOrder: 'PKG-2026-00022', product: 'Shwet Idli Batter 1kg', qty: 47, uom: 'PCS', stage: 'QUALITY_APPROVED', wh: 'WH-THN-FG-01', estMins: 15, status: 'AWAITING_INVENTORY_POSTING' },
  ]
  const completed = [
    { fgCode: 'FG-2026-00024', pkgOrder: 'PKG-2026-00024', product: 'Kaju Katli 500g', qty: 188, uom: 'PCS', stage: 'PUTAWAY', wh: 'WH-THN-FG-01', bin: 'A-01-03-02', putaway: 'PUT-2026-00148', completedAt: '2026-07-09 11:15', transferMs: 2840, status: 'COMPLETED' },
    { fgCode: 'FG-2026-00023', pkgOrder: 'PKG-2026-00023', product: 'Kaju Katli 1kg', qty: 98, uom: 'PCS', stage: 'PUTAWAY', wh: 'WH-THN-FG-01', bin: 'A-01-04-01', putaway: 'PUT-2026-00147', completedAt: '2026-07-09 14:00', transferMs: 2120, status: 'COMPLETED' },
    { fgCode: 'FG-2026-00020', pkgOrder: 'PKG-2026-00020', product: 'Mixed Namkeen 500g', qty: 250, uom: 'PCS', stage: 'PUTAWAY', wh: 'WH-THN-FG-01', bin: 'B-02-01-04', putaway: 'PUT-2026-00146', completedAt: '2026-07-09 09:45', transferMs: 3120, status: 'COMPLETED' },
  ]
  const stages = ['PACKAGING_COMPLETE', 'QUALITY_APPROVED', 'INVENTORY_POSTED', 'WAREHOUSE_RECEIPT_GENERATED', 'PUTAWAY_TASK_GENERATED', 'PUTAWAY_COMPLETED', 'AVAILABLE_FOR_SALE']
  const stageColors: Record<string, string> = { PACKAGING_COMPLETE: 'bg-slate-100 text-slate-700', QUALITY_APPROVED: 'bg-blue-100 text-blue-700', INVENTORY_POSTED: 'bg-cyan-100 text-cyan-700', WAREHOUSE_RECEIPT_GENERATED: 'bg-purple-100 text-purple-700', PUTAWAY_TASK_GENERATED: 'bg-amber-100 text-amber-700', PUTAWAY_COMPLETED: 'bg-emerald-100 text-emerald-700', AVAILABLE_FOR_SALE: 'bg-emerald-200 text-emerald-800' }
  const statusColors: Record<string, string> = { AWAITING_INVENTORY_POSTING: 'bg-amber-100 text-amber-700', COMPLETED: 'bg-emerald-100 text-emerald-700', IN_PROGRESS: 'bg-blue-100 text-blue-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ArrowRight className="h-6 w-6 text-cyan-600" />Warehouse Handover</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 41 · Epic 8 · FG → Inventory → Warehouse Receipt → Putaway → Available for Sale · Target &lt;5s</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Transferred', value: 11, color: 'text-emerald-600' },
          { label: 'In Queue', value: 1, color: 'text-amber-600' },
          { label: 'Avg Transfer', value: '2.84s', color: 'text-emerald-600' },
          { label: 'Success Rate', value: '100%', color: 'text-emerald-600' },
          { label: 'Units Transferred', value: 1248, color: 'text-blue-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4 bg-cyan-50/50 border-cyan-200">
        <h3 className="font-semibold text-sm mb-3">7-Stage Handover Workflow</h3>
        <div className="flex items-center gap-2 text-xs overflow-x-auto">
          {stages.map((stage, i) => (
            <div key={stage} className="flex items-center gap-2 flex-shrink-0">
              <div className={`px-3 py-1.5 rounded-md font-medium ${stageColors[stage]}`}>
                <span className="text-[10px] mr-1">{i + 1}.</span>{stage.replace(/_/g, ' ')}
              </div>
              {i < stages.length - 1 && <ArrowRight className="h-3 w-3 text-cyan-400 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Clock className="h-4 w-4 text-amber-600" />Awaiting Handover ({queue.length})</h3>
        <div className="space-y-2">
          {queue.map(q => (
            <div key={q.fgCode} className="p-3 rounded-lg border border-amber-300 bg-amber-50/50">
              <div className="flex items-center justify-between mb-1">
                <p className="font-mono text-xs text-blue-700">{q.fgCode}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColors[q.status]}`}>{q.status.replace(/_/g, ' ')}</span>
              </div>
              <p className="text-sm font-medium">{q.product} ({q.qty} {q.uom})</p>
              <p className="text-[11px] text-muted-foreground mt-1">PKG Order: {q.pkgOrder} · Dest: {q.wh} · Est. {q.estMins} min to complete</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Completed Handovers</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">FG Code</th>
                <th className="px-3 py-2 font-medium">PKG Order</th>
                <th className="px-3 py-2 font-medium">Product / Qty</th>
                <th className="px-3 py-2 font-medium">Stage</th>
                <th className="px-3 py-2 font-medium">Warehouse / Bin</th>
                <th className="px-3 py-2 font-medium">Putaway Task</th>
                <th className="px-3 py-2 font-medium">Completed At</th>
                <th className="px-3 py-2 font-medium text-center">Transfer Time</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {completed.map(c => (
                <tr key={c.fgCode} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{c.fgCode}</td>
                  <td className="px-3 py-2 font-mono text-[10px] text-blue-700">{c.pkgOrder}</td>
                  <td className="px-3 py-2"><p className="font-medium">{c.product}</p><p className="text-[10px] text-muted-foreground">{c.qty} {c.uom}</p></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${stageColors[c.stage]}`}>{c.stage.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2"><p>{c.wh}</p><p className="font-mono text-[10px] text-blue-700">{c.bin}</p></td>
                  <td className="px-3 py-2 font-mono text-[10px] text-purple-700">{c.putaway}</td>
                  <td className="px-3 py-2 text-[11px]">{c.completedAt}</td>
                  <td className={`px-3 py-2 text-center font-medium ${c.transferMs < 5000 ? 'text-emerald-600' : 'text-amber-600'}`}>{(c.transferMs / 1000).toFixed(2)}s</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColors[c.status]}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

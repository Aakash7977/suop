// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 39 — BATCH MANUFACTURING, GENEALOGY & END-TO-END TRACEABILITY
// Frontend modules — 8 screens + Split/Merge console
// ═══════════════════════════════════════════════════════════════════════════════
// This file is appended into src/app/page.tsx — uses shared UI components.

// ─── Epic 1: Batch Master Module ───────────────────────────────────────
function BatchMasterModule() {
  const [filter, setFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const batches = [
    { id: 'b001', batch: 'KAJ-THN-20260709-000145', type: 'FINISHED_GOODS', product: 'Kaju Katli 500g', sku: 'KK-500', po: 'PO-2026-00125', plant: 'Thane', line: 'LINE-KK-01', wc: 'WC-KK-03', operator: 'Rajesh Kumar', mfgDate: '2026-07-09', expiry: '2026-10-07', bestBefore: '2026-09-07', planned: 95, actual: 94, scrap: 1, uom: 'KG', status: 'RELEASED', grade: 'A', quality: 'PASSED', recalled: false, recipeVer: 'V2.3', supplier: null },
    { id: 'b002', batch: 'KAJ-THN-20260709-000146', type: 'FINISHED_GOODS', product: 'Kaju Katli 1kg', sku: 'KK-1KG', po: 'PO-2026-00125', plant: 'Thane', line: 'LINE-KK-01', wc: 'WC-KK-03', operator: 'Rajesh Kumar', mfgDate: '2026-07-09', expiry: '2026-10-07', bestBefore: '2026-09-07', planned: 100, actual: 98, scrap: 2, uom: 'KG', status: 'RELEASED', grade: 'A', quality: 'PASSED', recalled: false, recipeVer: 'V2.3', supplier: null },
    { id: 'b003', batch: 'SHW-THN-20260709-000047', type: 'FINISHED_GOODS', product: 'Shwet Idli Batter 1kg', sku: 'IB-1KG', po: 'PO-2026-00126', plant: 'Thane', line: 'LINE-IB-01', wc: 'WC-IB-02', operator: 'Anil R.', mfgDate: '2026-07-09', expiry: '2026-07-16', bestBefore: '2026-07-14', planned: 100, actual: 95, scrap: 5, uom: 'KG', status: 'RUNNING', grade: null, quality: 'PENDING', recalled: false, recipeVer: 'V1.5', supplier: null },
    { id: 'b004', batch: 'MOT-THN-20260708-000032', type: 'FINISHED_GOODS', product: 'Motichoor Laddu 1kg', sku: 'ML-1KG', po: 'PO-2026-00129', plant: 'Thane', line: 'LINE-NM-01', wc: 'WC-ML-04', operator: 'Suresh M.', mfgDate: '2026-07-08', expiry: '2026-08-07', bestBefore: '2026-08-01', planned: 100, actual: 98, scrap: 2, uom: 'KG', status: 'QUALITY_HOLD', grade: null, quality: 'QUARANTINE', recalled: false, recipeVer: 'V1.2', supplier: null },
    { id: 'b005', batch: 'CAS-THN-20260705-000018', type: 'RAW_MATERIAL', product: 'Cashew W320', sku: 'CAS-W320', po: null, plant: 'Thane', line: null, wc: null, operator: null, mfgDate: '2026-07-05', expiry: '2027-01-05', bestBefore: '2026-12-05', planned: 500, actual: 445, scrap: 0, uom: 'KG', status: 'RELEASED', grade: 'A', quality: 'PASSED', recalled: false, recipeVer: null, supplier: 'Sri Balaji Cashews' },
    { id: 'b006', batch: 'SUG-THN-20260701-000042', type: 'RAW_MATERIAL', product: 'Sugar S30', sku: 'SUG-S30', po: null, plant: 'Thane', line: null, wc: null, operator: null, mfgDate: '2026-07-01', expiry: '2027-07-01', bestBefore: '2027-04-01', planned: 1000, actual: 965, scrap: 0, uom: 'KG', status: 'RELEASED', grade: 'A', quality: 'PASSED', recalled: false, recipeVer: null, supplier: 'EID Parry India Ltd' },
    { id: 'b007', batch: 'GHE-THN-20260703-000008', type: 'INGREDIENT', product: 'Cow Ghee', sku: 'GHE-COW', po: null, plant: 'Thane', line: null, wc: null, operator: null, mfgDate: '2026-07-03', expiry: '2027-01-03', bestBefore: '2026-12-03', planned: 200, actual: 178, scrap: 0, uom: 'KG', status: 'RELEASED', grade: 'A', quality: 'PASSED', recalled: false, recipeVer: null, supplier: 'Amul Dairy' },
    { id: 'b008', batch: 'REC-THN-20260628-000011', type: 'FINISHED_GOODS', product: 'Kaju Katli 500g', sku: 'KK-500', po: 'PO-2026-00098', plant: 'Thane', line: 'LINE-KK-01', wc: 'WC-KK-03', operator: 'Vijay P.', mfgDate: '2026-06-28', expiry: '2026-09-26', bestBefore: '2026-08-26', planned: 95, actual: 93, scrap: 2, uom: 'KG', status: 'RECALLED', grade: 'C', quality: 'FAILED', recalled: true, recipeVer: 'V2.2', supplier: null },
  ]
  const statusColors: Record<string, string> = {
    PLANNED: 'bg-slate-100 text-slate-700', RUNNING: 'bg-blue-100 text-blue-700', COMPLETED: 'bg-cyan-100 text-cyan-700',
    RELEASED: 'bg-emerald-100 text-emerald-700', QUALITY_HOLD: 'bg-amber-100 text-amber-700',
    REJECTED: 'bg-rose-100 text-rose-700', RECALLED: 'bg-red-100 text-red-700', EXPIRED: 'bg-zinc-100 text-zinc-700', DISPOSED: 'bg-zinc-200 text-zinc-800',
  }
  const typeColors: Record<string, string> = {
    RAW_MATERIAL: 'bg-blue-100 text-blue-700', INGREDIENT: 'bg-pink-100 text-pink-700',
    SEMI_FINISHED: 'bg-amber-100 text-amber-700', FINISHED_GOODS: 'bg-emerald-100 text-emerald-700',
    PACKAGING: 'bg-purple-100 text-purple-700', TRIAL: 'bg-slate-100 text-slate-700',
    REWORK: 'bg-orange-100 text-orange-700', SAMPLE: 'bg-cyan-100 text-cyan-700',
  }
  const filteredBatches = batches.filter(b =>
    (filter === 'ALL' || b.status === filter) &&
    (typeFilter === 'ALL' || b.type === typeFilter)
  )
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Boxes className="h-6 w-6 text-emerald-600" />Batch Master</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 39 · Epic 1-2 · Batch Number: <span className="font-mono text-blue-700">PROD-PLANT-YYYYMMDD-SEQ</span></p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />Create Batch</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Batches', value: '1,248', color: 'text-blue-600', icon: Boxes },
          { label: 'Running', value: '7', color: 'text-blue-600', icon: Activity },
          { label: 'Released', value: '894', color: 'text-emerald-600', icon: CheckCircle2 },
          { label: 'Quality Hold', value: '3', color: 'text-amber-600', icon: AlertTriangle },
          { label: 'Recalled', value: '1', color: 'text-red-600', icon: FileWarning },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className="h-6 w-6 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Batch Number Format — <span className="font-mono">KAJ-THN-20260709-000145</span></p>
            <p className="text-xs text-muted-foreground mt-1">Auto-generated: <span className="font-mono">[PRODUCT 3-char]-[PLANT 3-char]-[YYYYMMDD]-[6-digit sequence + check digit]</span>. Manual override authorized for Plant Head only.</p>
          </div>
        </div>
      </Card>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="text-xs border rounded px-2 py-1 bg-background">
            <option value="ALL">All</option>
            <option value="PLANNED">Planned</option>
            <option value="RUNNING">Running</option>
            <option value="RELEASED">Released</option>
            <option value="QUALITY_HOLD">Quality Hold</option>
            <option value="RECALLED">Recalled</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Type:</span>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="text-xs border rounded px-2 py-1 bg-background">
            <option value="ALL">All Types</option>
            <option value="RAW_MATERIAL">Raw Material</option>
            <option value="INGREDIENT">Ingredient</option>
            <option value="SEMI_FINISHED">Semi-Finished</option>
            <option value="FINISHED_GOODS">Finished Goods</option>
            <option value="PACKAGING">Packaging</option>
            <option value="TRIAL">Trial</option>
            <option value="REWORK">Rework</option>
            <option value="SAMPLE">Sample</option>
          </select>
        </div>
        <div className="relative ml-auto">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input placeholder="Search batch number..." className="pl-7 h-8 w-56 text-xs" />
        </div>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Batch Number</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Plant / Line</th>
                <th className="px-3 py-2 font-medium">Mfg Date</th>
                <th className="px-3 py-2 font-medium">Expiry</th>
                <th className="px-3 py-2 font-medium text-right">Qty (planned/actual)</th>
                <th className="px-3 py-2 font-medium">Quality</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map(b => (
                <tr key={b.id} className={`border-t hover:bg-muted/30 ${b.recalled ? 'bg-red-50/40' : ''}`}>
                  <td className="px-3 py-2 font-mono text-blue-700 text-[11px]">{b.batch}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[b.type]}`}>{b.type.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2">
                    <p className="font-medium">{b.product}</p>
                    <p className="text-[10px] text-muted-foreground">SKU: {b.sku} {b.recipeVer ? `· Recipe ${b.recipeVer}` : ''}</p>
                    {b.supplier && <p className="text-[10px] text-pink-600">Supplier: {b.supplier}</p>}
                  </td>
                  <td className="px-3 py-2">
                    <p>{b.plant}</p>
                    {b.line && <p className="text-[10px] text-muted-foreground">{b.line} · {b.wc}</p>}
                  </td>
                  <td className="px-3 py-2">{b.mfgDate}</td>
                  <td className="px-3 py-2 text-amber-700">{b.expiry}</td>
                  <td className="px-3 py-2 text-right">
                    <span className="font-medium">{b.actual}</span>
                    <span className="text-muted-foreground"> / {b.planned} {b.uom}</span>
                    {b.scrap > 0 && <p className="text-[10px] text-rose-600">Scrap: {b.scrap} {b.uom}</p>}
                  </td>
                  <td className="px-3 py-2">
                    {b.grade && <span className={`text-[10px] px-1.5 py-0.5 rounded mr-1 ${b.grade === 'A' ? 'bg-emerald-100 text-emerald-700' : b.grade === 'B' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>Grade {b.grade}</span>}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${b.quality === 'PASSED' ? 'bg-emerald-100 text-emerald-700' : b.quality === 'PENDING' ? 'bg-slate-100 text-slate-600' : b.quality === 'QUARANTINE' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{b.quality}</span>
                  </td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColors[b.status]}`}>{b.status.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-[11px]"><QrCode className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 text-[11px]"><Eye className="h-3 w-3" /></Button>
                      {b.status === 'QUALITY_HOLD' && <Button size="sm" className="h-7 text-[11px]">Release</Button>}
                      {b.recalled && <Button size="sm" variant="destructive" className="h-7 text-[11px]">Recall</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 3: Batch Genealogy Viewer ────────────────────────────────────
function BatchGenealogyModule() {
  const [selectedBatch, setSelectedBatch] = useState('KAJ-THN-20260709-000145')
  const [viewMode, setViewMode] = useState<'tree' | 'timeline' | 'graph'>('tree')
  const parents = [
    { batch: 'CAS-THN-20260705-000018', type: 'RAW_MATERIAL', product: 'Cashew W320', qty: 55, uom: 'KG', supplier: 'Sri Balaji Cashews', supplierBatch: 'SBC-2026-0705', po: 'PO-2026-00112', gr: 'GR-2026-00145', date: '2026-07-05', relationship: 'USED_IN' },
    { batch: 'SUG-THN-20260701-000042', type: 'RAW_MATERIAL', product: 'Sugar S30', qty: 35, uom: 'KG', supplier: 'EID Parry India Ltd', supplierBatch: 'EID-2026-0298', po: 'PO-2026-00098', gr: 'GR-2026-00133', date: '2026-07-01', relationship: 'USED_IN' },
    { batch: 'GHE-THN-20260703-000008', type: 'INGREDIENT', product: 'Cow Ghee', qty: 4, uom: 'KG', supplier: 'Amul Dairy', supplierBatch: 'AMUL-2026-0789', po: 'PO-2026-00105', gr: 'GR-2026-00139', date: '2026-07-03', relationship: 'USED_IN' },
  ]
  const children = [
    { batch: 'KAJ-THN-20260709-000145-A', type: 'PACKAGING', product: 'Kaju Katli 500g (Packed)', qty: 188, uom: 'PCS', warehouse: 'WH-THN-FG-01', bin: 'A-01-03-02', dispatch: null, relationship: 'PACKAGED_FROM' },
    { batch: 'KAJ-THN-20260709-000145-B', type: 'PACKAGING', product: 'Kaju Katli 500g (Display Box)', qty: 6, uom: 'PCS', warehouse: 'WH-THN-FG-01', bin: 'A-01-03-03', dispatch: null, relationship: 'PACKAGED_FROM' },
  ]
  const siblings = [
    { batch: 'KAJ-THN-20260709-000146', type: 'FINISHED_GOODS', product: 'Kaju Katli 1kg', qty: 98, uom: 'KG', po: 'PO-2026-00125' },
  ]
  const typeColors: Record<string, string> = {
    RAW_MATERIAL: 'bg-blue-100 text-blue-700 border-blue-300', INGREDIENT: 'bg-pink-100 text-pink-700 border-pink-300',
    SEMI_FINISHED: 'bg-amber-100 text-amber-700 border-amber-300', FINISHED_GOODS: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    PACKAGING: 'bg-purple-100 text-purple-700 border-purple-300',
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><GitGraph className="h-6 w-6 text-purple-600" />Batch Genealogy Viewer</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 39 · Epic 3 · Parent-Child Batch Relationships · One-to-One, One-to-Many, Many-to-One, Many-to-Many</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border bg-muted/40 px-1 py-1">
            <Button size="sm" variant={viewMode === 'tree' ? 'default' : 'ghost'} className="h-7 text-xs" onClick={() => setViewMode('tree')}>Tree</Button>
            <Button size="sm" variant={viewMode === 'timeline' ? 'default' : 'ghost'} className="h-7 text-xs" onClick={() => setViewMode('timeline')}>Timeline</Button>
            <Button size="sm" variant={viewMode === 'graph' ? 'default' : 'ghost'} className="h-7 text-xs" onClick={() => setViewMode('graph')}>Graph</Button>
          </div>
        </div>
      </div>
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search batch number, product, or supplier..." value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="h-8 text-sm" />
          <Button size="sm"><Waypoints className="mr-1 h-4 w-4" />Trace</Button>
        </div>
      </Card>
      {viewMode === 'tree' && (
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-purple-50/30 border-purple-200">
          <div className="flex flex-col items-center gap-6">
            {/* Root - Selected Batch */}
            <div className="flex flex-col items-center">
              <div className="px-4 py-3 rounded-lg bg-emerald-100 border-2 border-emerald-400 shadow-sm text-center min-w-[280px]">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Boxes className="h-4 w-4 text-emerald-600" />
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase">Finished Goods</span>
                </div>
                <p className="font-mono text-xs text-blue-700">{selectedBatch}</p>
                <p className="text-sm font-medium mt-1">Kaju Katli 500g</p>
                <p className="text-[10px] text-muted-foreground">94 KG · Released · Grade A</p>
              </div>
            </div>
            {/* Connector */}
            <div className="text-purple-400 text-2xl">↑</div>
            {/* Parents (Raw Materials) */}
            <div className="w-full">
              <p className="text-xs font-semibold text-muted-foreground mb-3 text-center">↑ PARENTS (Inputs) — Raw Materials & Ingredients</p>
              <div className="grid grid-cols-3 gap-3">
                {parents.map(p => (
                  <div key={p.batch} className={`px-3 py-2 rounded-lg border-2 ${typeColors[p.type]} text-center`}>
                    <p className="text-[10px] font-semibold uppercase">{p.type.replace(/_/g, ' ')}</p>
                    <p className="font-mono text-[11px] text-blue-700 mt-1">{p.batch}</p>
                    <p className="text-xs font-medium mt-0.5">{p.product}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{p.qty} {p.uom} · {p.supplier}</p>
                    <p className="text-[9px] text-pink-600 mt-1">Supplier Batch: {p.supplierBatch}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Connector */}
            <div className="text-purple-400 text-2xl">↓</div>
            {/* Children (Packaged) */}
            <div className="w-full">
              <p className="text-xs font-semibold text-muted-foreground mb-3 text-center">↓ CHILDREN (Outputs) — Packaged Batches</p>
              <div className="grid grid-cols-2 gap-3">
                {children.map(c => (
                  <div key={c.batch} className={`px-3 py-2 rounded-lg border-2 ${typeColors[c.type]} text-center`}>
                    <p className="text-[10px] font-semibold uppercase">{c.type}</p>
                    <p className="font-mono text-[11px] text-blue-700 mt-1">{c.batch}</p>
                    <p className="text-xs font-medium mt-0.5">{c.product}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{c.qty} {c.uom} · {c.warehouse} / {c.bin}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
      {viewMode === 'timeline' && (
        <Card className="p-4">
          <div className="relative pl-8">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-purple-200" />
            {[
              { date: '2026-07-01 08:30', title: 'Sugar Received', desc: 'SUG-THN-20260701-000042 · 1000 KG from EID Parry India Ltd · GR-2026-00133', color: 'bg-blue-500' },
              { date: '2026-07-03 09:15', title: 'Cow Ghee Received', desc: 'GHE-THN-20260703-000008 · 200 KG from Amul Dairy · GR-2026-00139', color: 'bg-pink-500' },
              { date: '2026-07-05 10:30', title: 'Cashew Received', desc: 'CAS-THN-20260705-000018 · 500 KG from Sri Balaji Cashews · GR-2026-00145', color: 'bg-blue-500' },
              { date: '2026-07-09 06:30', title: 'Production Started', desc: 'PO-2026-00125 · WC-KK-03 · Operator: Rajesh Kumar · Shift A', color: 'bg-amber-500' },
              { date: '2026-07-09 06:35', title: 'Materials Consumed', desc: '55 KG Cashew + 35 KG Sugar + 4 KG Ghee → KAJ-THN-20260709-000145', color: 'bg-purple-500' },
              { date: '2026-07-09 08:00', title: 'Production Complete', desc: '94 KG output (planned 95 KG, scrap 1 KG) · Yield: 98.9%', color: 'bg-emerald-500' },
              { date: '2026-07-09 08:05', title: 'Label Printed', desc: 'Production Batch Label + Pallet Label · QR Code generated', color: 'bg-cyan-500' },
              { date: '2026-07-09 08:30', title: 'Packed & Stored', desc: 'Split into 188 retail packs (500g) + 6 display boxes · WH-THN-FG-01', color: 'bg-purple-500' },
              { date: '2026-07-09 10:00', title: 'Quality Released', desc: 'Quality check PASSED · Grade A · Status: RELEASED', color: 'bg-emerald-600' },
            ].map((event, i) => (
              <div key={i} className="relative mb-4">
                <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full ${event.color} border-2 border-white shadow`} />
                <p className="text-[10px] text-muted-foreground">{event.date}</p>
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{event.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      {viewMode === 'graph' && (
        <Card className="p-6 bg-slate-50/50">
          <div className="text-center mb-4">
            <p className="text-xs text-muted-foreground">Relationship Graph — Showing all batch connections</p>
          </div>
          <div className="relative h-[480px] bg-white rounded-lg border-2 border-dashed border-purple-200 overflow-hidden p-6">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
                </marker>
              </defs>
              <line x1="20%" y1="80%" x2="50%" y2="50%" stroke="#a855f7" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
              <line x1="50%" y1="80%" x2="50%" y2="50%" stroke="#a855f7" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
              <line x1="80%" y1="80%" x2="50%" y2="50%" stroke="#a855f7" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
              <line x1="50%" y1="50%" x2="35%" y2="20%" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" />
              <line x1="50%" y1="50%" x2="65%" y2="20%" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrow)" />
              <line x1="50%" y1="50%" x2="85%" y2="50%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
            </svg>
            {/* Parent nodes (bottom) */}
            <div className="absolute bottom-[5%] left-[10%] px-2 py-1 bg-blue-100 border border-blue-400 rounded text-[10px] font-mono text-blue-700">CAS-...018</div>
            <div className="absolute bottom-[5%] left-[44%] px-2 py-1 bg-blue-100 border border-blue-400 rounded text-[10px] font-mono text-blue-700">SUG-...042</div>
            <div className="absolute bottom-[5%] left-[75%] px-2 py-1 bg-pink-100 border border-pink-400 rounded text-[10px] font-mono text-pink-700">GHE-...008</div>
            {/* Selected batch (middle) */}
            <div className="absolute top-[42%] left-[36%] px-3 py-2 bg-emerald-100 border-2 border-emerald-500 rounded text-xs font-mono text-emerald-700 shadow-md">{selectedBatch.slice(0, 18)}...</div>
            {/* Children (top) */}
            <div className="absolute top-[5%] left-[28%] px-2 py-1 bg-purple-100 border border-purple-400 rounded text-[10px] font-mono text-purple-700">...145-A</div>
            <div className="absolute top-[5%] left-[60%] px-2 py-1 bg-purple-100 border border-purple-400 rounded text-[10px] font-mono text-purple-700">...145-B</div>
            {/* Sibling (right) */}
            <div className="absolute top-[42%] right-[5%] px-2 py-1 bg-emerald-100 border border-emerald-400 rounded text-[10px] font-mono text-emerald-700">...146 (sibling)</div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-[11px]">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-200 border border-blue-400 rounded" /> Raw Material</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-pink-200 border border-pink-400 rounded" /> Ingredient</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-200 border border-emerald-400 rounded" /> Finished Goods</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-200 border border-purple-400 rounded" /> Packaging</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-500 rounded" /> → produced from</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded" /> → packaged from</div>
          </div>
        </Card>
      )}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">PARENT BATCHES (3)</p>
          <div className="space-y-2">
            {parents.map(p => (
              <div key={p.batch} className="text-xs p-2 rounded border bg-muted/30">
                <p className="font-mono text-[11px] text-blue-700">{p.batch}</p>
                <p className="font-medium mt-0.5">{p.product} ({p.qty} {p.uom})</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.supplier} · {p.date}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">CHILD BATCHES (2)</p>
          <div className="space-y-2">
            {children.map(c => (
              <div key={c.batch} className="text-xs p-2 rounded border bg-muted/30">
                <p className="font-mono text-[11px] text-blue-700">{c.batch}</p>
                <p className="font-medium mt-0.5">{c.product} ({c.qty} {c.uom})</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{c.warehouse} · {c.bin}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2">SIBLINGS (Same PO)</p>
          <div className="space-y-2">
            {siblings.map(s => (
              <div key={s.batch} className="text-xs p-2 rounded border bg-muted/30">
                <p className="font-mono text-[11px] text-blue-700">{s.batch}</p>
                <p className="font-medium mt-0.5">{s.product} ({s.qty} {s.uom})</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">PO: {s.po}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── Epic 4: Traceability Search Module ────────────────────────────────
function TraceabilitySearchModule() {
  const [searchTerm, setSearchTerm] = useState('KAJ-THN-20260628-000011')
  const [direction, setDirection] = useState<'FORWARD' | 'BACKWARD' | 'BOTH'>('BOTH')
  const [searchType, setSearchType] = useState('BY_BATCH')
  const [searched, setSearched] = useState(true)
  const [executionMs, setExecutionMs] = useState(1240)
  const handleSearch = () => {
    setSearched(true)
    setExecutionMs(800 + Math.floor(Math.random() * 600))
  }
  const backwardSteps = [
    { step: 1, level: 'CUSTOMER', entity: 'Customer Complaint #CMP-2026-0042', date: '2026-07-08', details: 'Customer reported taste deviation in Kaju Katli 500g', icon: AlertCircle, color: 'bg-rose-100 text-rose-700 border-rose-300' },
    { step: 2, level: 'RETAIL', entity: 'Sweets Mart, Bandra (Batch KAJ-THN-20260628-000011)', date: '2026-07-06', details: 'Distributor dispatched 24 boxes', icon: Store, color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { step: 3, level: 'DISTRIBUTOR', entity: 'Mumbai Sweets Distributors', date: '2026-07-03', details: 'Received 96 boxes from plant', icon: Truck, color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { step: 4, level: 'SHIPMENT', entity: 'SHP-2026-00892', date: '2026-07-01', details: 'Dispatched from WH-THN-FG-01', icon: Package, color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { step: 5, level: 'WAREHOUSE', entity: 'WH-THN-FG-01 / Bin A-01-03-02', date: '2026-06-28', details: 'Warehouse receipt', icon: Warehouse, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { step: 6, level: 'FINISHED_BATCH', entity: 'KAJ-THN-20260628-000011 (Kaju Katli 500g)', date: '2026-06-28', details: 'Production batch - 95 kg', icon: Boxes, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { step: 7, level: 'PRODUCTION_ORDER', entity: 'PO-2026-00098', date: '2026-06-28', details: 'Production order - Kaju Katli 500g line', icon: Factory, color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { step: 8, level: 'INGREDIENT_BATCH', entity: 'CAS-THN-20260625-000015 (Cashew W320)', date: '2026-06-25', details: 'Used 55 kg', icon: Package, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { step: 9, level: 'SUPPLIER', entity: 'Sri Balaji Cashews (Supplier Batch SBC-2026-0625)', date: '2026-06-25', details: 'PO-2026-00092, GR-2026-00128', icon: Building2, color: 'bg-pink-100 text-pink-700 border-pink-300' },
  ]
  const forwardSteps = [
    { step: 1, level: 'RAW_BATCH', entity: 'CAS-THN-20260705-000018 (Cashew W320)', date: '2026-07-05', details: '500 kg received', icon: Package, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { step: 2, level: 'SUPPLIER', entity: 'Sri Balaji Cashews', date: '2026-07-05', details: 'Supplier Batch SBC-2026-0705', icon: Building2, color: 'bg-pink-100 text-pink-700 border-pink-300' },
    { step: 3, level: 'WAREHOUSE', entity: 'WH-THN-RM-01 / Bin RM-CAS-01', date: '2026-07-05', details: 'Raw material warehouse', icon: Warehouse, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { step: 4, level: 'PRODUCTION_BATCH', entity: 'KAJ-THN-20260709-000145 (Kaju Katli 500g)', date: '2026-07-09', details: 'Used 55 kg of 500 kg', icon: Boxes, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { step: 5, level: 'FINISHED_BATCH', entity: 'KAJ-THN-20260709-000145-A (188 boxes)', date: '2026-07-09', details: 'Packed & labeled', icon: Package, color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { step: 6, level: 'WAREHOUSE', entity: 'WH-THN-FG-01 / Bin A-01-03-02', date: '2026-07-09', details: 'FG warehouse', icon: Warehouse, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { step: 7, level: 'SHIPMENT', entity: 'SHP-2026-00948', date: '2026-07-10', details: 'To Mumbai Sweets Distributors - 96 boxes', icon: Truck, color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { step: 8, level: 'DISTRIBUTOR', entity: 'Mumbai Sweets Distributors', date: '2026-07-11', details: 'Received', icon: Truck, color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { step: 9, level: 'RETAIL', entity: '12 Retail Stores', date: '2026-07-12', details: '8 boxes each on average', icon: Store, color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { step: 10, level: 'CUSTOMER', entity: 'Customers across 12 stores', date: '2026-07-12', details: '~96 boxes sold to consumers', icon: Users, color: 'bg-rose-100 text-rose-700 border-rose-300' },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Waypoints className="h-6 w-6 text-blue-600" />Traceability Search</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 39 · Epic 4 · Forward & Backward Traceability · Target &lt; 5 seconds</p>
        </div>
        <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50"><Timer className="mr-1 h-3 w-3" />Avg: 1240ms</Badge>
      </div>
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300">
        <div className="grid grid-cols-12 gap-3 items-end">
          <div className="col-span-5">
            <Label className="text-xs">Search Term (Batch #, Barcode, QR, Product, Supplier)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="e.g. KAJ-THN-20260709-000145" className="h-9" />
            </div>
          </div>
          <div className="col-span-3">
            <Label className="text-xs">Direction</Label>
            <select value={direction} onChange={(e) => setDirection(e.target.value as any)} className="w-full mt-1 border rounded px-2 py-1.5 text-sm bg-background h-9">
              <option value="BOTH">⇄ Both (Forward + Backward)</option>
              <option value="FORWARD">→ Forward (Raw → Customer)</option>
              <option value="BACKWARD">← Backward (Customer → Supplier)</option>
            </select>
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Search Type</Label>
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="w-full mt-1 border rounded px-2 py-1.5 text-sm bg-background h-9">
              <option value="BY_BATCH">By Batch Number</option>
              <option value="BY_BARCODE">By Barcode</option>
              <option value="BY_QR">By QR Code</option>
              <option value="BY_PRODUCT">By Product</option>
              <option value="BY_SUPPLIER">By Supplier</option>
              <option value="BY_CUSTOMER">By Customer</option>
            </select>
          </div>
          <div className="col-span-2">
            <Button className="w-full h-9" onClick={handleSearch}><Waypoints className="mr-1 h-4 w-4" />Trace Now</Button>
          </div>
        </div>
      </Card>
      {searched && (
        <>
          <Card className="p-4 bg-emerald-50 border-emerald-300">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="font-semibold text-sm">Search completed in <span className="text-emerald-700">{executionMs} ms</span> · Within target (&lt; 5000 ms)</p>
                  <p className="text-xs text-muted-foreground">Found: 18 nodes · 14 batches · 3 suppliers · 5 customers · 4 shipments · 2 warehouses</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline"><Download className="mr-1 h-3 w-3" />Export Report</Button>
                <Button size="sm" variant="outline"><FileText className="mr-1 h-3 w-3" />Audit Log</Button>
              </div>
            </div>
          </Card>
          {(direction === 'BACKWARD' || direction === 'BOTH') && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowLeftRight className="h-4 w-4 text-rose-600" />
                <h3 className="font-semibold text-sm">BACKWARD TRACE — Customer Complaint → Supplier (9 steps)</h3>
              </div>
              <div className="space-y-2">
                {backwardSteps.map(s => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${s.color}`}>
                        {s.step}
                      </div>
                      {s.step < backwardSteps.length && <div className="w-0.5 h-full bg-rose-200 mt-1" style={{ minHeight: '24px' }} />}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${s.color}`}>{s.level.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-muted-foreground">{s.date}</span>
                      </div>
                      <p className="text-sm font-medium mt-0.5">{s.entity}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {(direction === 'FORWARD' || direction === 'BOTH') && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowLeftRight className="h-4 w-4 text-emerald-600" />
                <h3 className="font-semibold text-sm">FORWARD TRACE — Raw Material → Customer (10 steps)</h3>
              </div>
              <div className="space-y-2">
                {forwardSteps.map(s => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${s.color}`}>
                        {s.step}
                      </div>
                      {s.step < forwardSteps.length && <div className="w-0.5 h-full bg-emerald-200 mt-1" style={{ minHeight: '24px' }} />}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${s.color}`}>{s.level.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-muted-foreground">{s.date}</span>
                      </div>
                      <p className="text-sm font-medium mt-0.5">{s.entity}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
      <Card className="p-4 bg-amber-50/50 border-amber-200">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Audit & Compliance — Every traceability query is fully auditable</p>
            <p className="text-xs text-muted-foreground mt-1">Each search logs: search term, direction, executor, timestamp, execution time, results returned. Required for FSSAI Article 27 traceability, HACCP recall procedure, ISO 22000 §7.9, BRCGS §3.10.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 5: Expiry Dashboard Module ───────────────────────────────────
function ExpiryDashboardModule() {
  const batches = [
    { batch: 'SHW-THN-20260702-000041', product: 'Shwet Idli Batter 1kg', mfgDate: '2026-07-02', expiry: '2026-07-09', days: 0, level: 'EXPIRED', qty: 8, uom: 'KG', value: 1600, wh: 'WH-THN-FG-02' },
    { batch: 'DAH-THN-20260705-000022', product: 'Fresh Curd 1L', mfgDate: '2026-07-05', expiry: '2026-07-12', days: 3, level: 'CRITICAL', qty: 24, uom: 'PCS', value: 1200, wh: 'WH-THN-FG-02' },
    { batch: 'PAN-THN-20260628-000018', product: 'Paneer 200g', mfgDate: '2026-06-28', expiry: '2026-07-12', days: 3, level: 'CRITICAL', qty: 45, uom: 'PCS', value: 3375, wh: 'WH-THN-FG-02' },
    { batch: 'KHE-THN-20260625-000009', product: 'Kheer 500ml', mfgDate: '2026-06-25', expiry: '2026-07-15', days: 6, level: 'CRITICAL', qty: 18, uom: 'PCS', value: 1620, wh: 'WH-THN-FG-02' },
    { batch: 'GUL-THN-20260625-000016', product: 'Gulab Jamun 1kg', mfgDate: '2026-06-25', expiry: '2026-08-24', days: 46, level: 'NEAR_EXPIRY', qty: 28, uom: 'KG', value: 14000, wh: 'WH-THN-FG-01' },
    { batch: 'RAS-THN-20260628-000008', product: 'Rasgulla 1kg', mfgDate: '2026-06-28', expiry: '2026-08-27', days: 49, level: 'NEAR_EXPIRY', qty: 32, uom: 'KG', value: 19200, wh: 'WH-THN-FG-01' },
  ]
  const levelColors: Record<string, string> = {
    HEALTHY: 'bg-emerald-100 text-emerald-700', NEAR_EXPIRY: 'bg-amber-100 text-amber-700',
    CRITICAL: 'bg-rose-100 text-rose-700', EXPIRED: 'bg-red-100 text-red-700',
    SHORT_LIFE: 'bg-orange-100 text-orange-700', COLD_CHAIN_BREAK: 'bg-blue-100 text-blue-700',
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><CalendarClock className="h-6 w-6 text-rose-600" />Expiry Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 39 · Epic 5 · FEFO (First Expiry First Out) · Cold Chain Compliance</p>
        </div>
        <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export Report</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Batches', value: '1,248', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Healthy', value: '1,192', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Near Expiry (≤30d)', value: '36', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Critical (≤7d)', value: '14', color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Expired', value: '2', color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Short Life (<15d)', value: '4', color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Cold Chain Breaks', value: '0', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Value at Risk', value: '₹1,84,500', color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <Card key={s.label} className={`p-3 ${s.bg}`}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { action: 'FEFO_PRIORITIZE', count: 36, value: 184500, icon: CalendarClock, color: 'text-emerald-600 bg-emerald-50 border-emerald-300' },
          { action: 'DISCOUNT', count: 4, value: 12000, icon: Tag, color: 'text-amber-600 bg-amber-50 border-amber-300' },
          { action: 'DONATE', count: 1, value: 1600, icon: Gift, color: 'text-purple-600 bg-purple-50 border-purple-300' },
          { action: 'DESTROY', count: 2, value: 3200, icon: Trash2, color: 'text-rose-600 bg-rose-50 border-rose-300' },
        ].map(a => (
          <Card key={a.action} className={`p-3 border ${a.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">{a.action.replace(/_/g, ' ')}</p>
                <p className="text-2xl font-bold mt-1">{a.count}</p>
                <p className="text-[10px] mt-0.5">₹{a.value.toLocaleString('en-IN')}</p>
              </div>
              <a.icon className="h-8 w-8 opacity-50" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm">At-Risk Batches</h3>
          <Badge variant="outline" className="text-rose-700 border-rose-300">6 batches need attention</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Batch</th>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">Mfg Date</th>
                <th className="px-3 py-2 font-medium">Expiry</th>
                <th className="px-3 py-2 font-medium text-center">Days Left</th>
                <th className="px-3 py-2 font-medium text-right">Qty</th>
                <th className="px-3 py-2 font-medium text-right">Value at Risk</th>
                <th className="px-3 py-2 font-medium">Warehouse</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(b => (
                <tr key={b.batch} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{b.batch}</td>
                  <td className="px-3 py-2 font-medium">{b.product}</td>
                  <td className="px-3 py-2">{b.mfgDate}</td>
                  <td className="px-3 py-2 text-rose-700 font-medium">{b.expiry}</td>
                  <td className={`px-3 py-2 text-center font-bold ${b.days <= 0 ? 'text-red-600' : b.days <= 7 ? 'text-rose-600' : 'text-amber-600'}`}>{b.days === 0 ? 'EXPIRED' : `${b.days}d`}</td>
                  <td className="px-3 py-2 text-right">{b.qty} {b.uom}</td>
                  <td className="px-3 py-2 text-right font-medium text-rose-700">₹{b.value.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-2 text-[11px]">{b.wh}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${levelColors[b.level]}`}>{b.level.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2">
                    <select className="text-[10px] border rounded px-1 py-0.5 bg-background">
                      <option>Select action...</option>
                      <option>FEFO Prioritize</option>
                      <option>Discount</option>
                      <option>Donate</option>
                      <option>Destroy</option>
                      <option>Return to Supplier</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Snowflake className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-sm">Cold Chain Compliance Log</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { batch: 'PAN-THN-20260705-000022', product: 'Paneer 200g', min: 2.1, max: 7.9, reqMin: 0, reqMax: 8, ok: true },
            { batch: 'DAH-THN-20260705-000022', product: 'Fresh Curd 1L', min: 2.5, max: 7.2, reqMin: 0, reqMax: 8, ok: true },
          ].map(c => (
            <div key={c.batch} className={`p-3 rounded border ${c.ok ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-300'}`}>
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] text-blue-700">{c.batch}</p>
                {c.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-rose-600" />}
              </div>
              <p className="text-xs font-medium mt-1">{c.product}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Actual: {c.min}°C – {c.max}°C · Required: {c.reqMin}°C – {c.reqMax}°C</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 5 (cont.): Shelf-Life Monitor Module ─────────────────────────
function ShelfLifeMonitorModule() {
  const batches = [
    { batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', total: 90, elapsed: 1, remaining: 89, percent: 98.9, level: 'HEALTHY', tempOk: true, storage: 'Cool & Dry (15-25°C)' },
    { batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', total: 90, elapsed: 1, remaining: 89, percent: 98.9, level: 'HEALTHY', tempOk: true, storage: 'Cool & Dry (15-25°C)' },
    { batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', total: 7, elapsed: 1, remaining: 6, percent: 85.7, level: 'SHORT_LIFE', tempOk: true, storage: 'Refrigerated (2-8°C)' },
    { batch: 'GUL-THN-20260625-000016', product: 'Gulab Jamun 1kg', total: 60, elapsed: 15, remaining: 45, percent: 75.0, level: 'NEAR_EXPIRY', tempOk: true, storage: 'Cool & Dry' },
    { batch: 'RAS-THN-20260628-000008', product: 'Rasgulla 1kg', total: 60, elapsed: 12, remaining: 48, percent: 80.0, level: 'NEAR_EXPIRY', tempOk: true, storage: 'Cool & Dry' },
    { batch: 'DAH-THN-20260705-000022', product: 'Fresh Curd 1L', total: 7, elapsed: 4, remaining: 3, percent: 42.9, level: 'CRITICAL', tempOk: true, storage: 'Refrigerated (2-8°C)' },
    { batch: 'PAN-THN-20260628-000018', product: 'Paneer 200g', total: 14, elapsed: 11, remaining: 3, percent: 21.4, level: 'CRITICAL', tempOk: true, storage: 'Refrigerated (2-8°C)' },
    { batch: 'SHW-THN-20260702-000041', product: 'Shwet Idli Batter 1kg', total: 7, elapsed: 7, remaining: 0, percent: 0, level: 'EXPIRED', tempOk: true, storage: 'Refrigerated (2-8°C)' },
  ]
  const levelColors: Record<string, string> = {
    HEALTHY: 'bg-emerald-100 text-emerald-700', NEAR_EXPIRY: 'bg-amber-100 text-amber-700',
    CRITICAL: 'bg-rose-100 text-rose-700', EXPIRED: 'bg-red-100 text-red-700', SHORT_LIFE: 'bg-orange-100 text-orange-700',
  }
  const barColor = (pct: number) => pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Timer className="h-6 w-6 text-amber-600" />Shelf-Life Monitor</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 39 · Epic 5 · Real-time shelf-life tracking · Storage conditions · Cold chain integrity</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Avg Shelf Life', value: '90 days', color: 'text-blue-600', icon: Clock },
          { label: 'Healthy Batches', value: '1,192', color: 'text-emerald-600', icon: CheckCircle2 },
          { label: 'Near Expiry (≤30d)', value: '36', color: 'text-amber-600', icon: CalendarClock },
          { label: 'Critical (≤7d)', value: '14', color: 'text-rose-600', icon: AlertTriangle },
          { label: 'Cold Chain OK', value: '100%', color: 'text-blue-600', icon: Snowflake },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className="h-6 w-6 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Active Batch Shelf-Life Tracking</h3>
        <div className="space-y-3">
          {batches.map(b => (
            <div key={b.batch} className="p-3 rounded-lg border bg-muted/20">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <p className="font-mono text-[11px] text-blue-700">{b.batch}</p>
                  <p className="text-sm font-medium">{b.product}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{b.storage}</span>
                  {b.tempOk ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />}
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${levelColors[b.level]}`}>{b.level.replace(/_/g, ' ')}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Day {b.elapsed} / {b.total}</span>
                    <span className="font-medium">{b.remaining}d remaining ({b.percent}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full ${barColor(b.percent)}`} style={{ width: `${b.percent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 7: Recall Center Module ──────────────────────────────────────
function RecallCenterModule() {
  const recalls = [
    { num: 'REC-2026-003', date: '2026-07-08', type: 'MARKET', class: 'CLASS_III', product: 'Kaju Katli 500g', batch: 'KAJ-THN-20260628-000011', reason: 'QUALITY_ISSUE', desc: 'Customer reported taste deviation. Lab test found elevated sugar crystallization.', status: 'RETURNS_IN_PROGRESS', batches: 1, customers: 12, qtyRecalled: 96, qtyReturned: 84, value: 48000, initiated: '2026-07-08T11:00', noticeSent: '2026-07-08T14:00', completed: null, regulatory: true },
    { num: 'REC-2026-002', date: '2026-06-15', type: 'INTERNAL', class: 'CLASS_II', product: 'Shwet Idli Batter 1kg', batch: 'SHW-THN-20260610-000031', reason: 'CONTAMINATION', desc: 'Internal QA detected possible yeast contamination in batch from Shift B.', status: 'COMPLETED', batches: 1, customers: 0, qtyRecalled: 60, qtyReturned: 60, value: 12000, initiated: '2026-06-15T10:00', noticeSent: '2026-06-15T11:00', completed: '2026-06-17T16:00', regulatory: false },
    { num: 'REC-2026-001', date: '2026-05-22', type: 'SUPPLIER', class: 'CLASS_II', product: 'Motichoor Laddu 1kg', batch: 'MOT-THN-20260518-000014', reason: 'FOREIGN_OBJECT', desc: 'Supplier notified of possible foreign material (metal shaving) in cashew lot used in this batch.', status: 'COMPLETED', batches: 1, customers: 8, qtyRecalled: 72, qtyReturned: 68, value: 27200, initiated: '2026-05-22T09:00', noticeSent: '2026-05-22T10:30', completed: '2026-05-26T15:00', regulatory: true },
  ]
  const typeColors: Record<string, string> = { INTERNAL: 'bg-amber-100 text-amber-700', MARKET: 'bg-rose-100 text-rose-700', SUPPLIER: 'bg-blue-100 text-blue-700', REGULATORY: 'bg-purple-100 text-purple-700' }
  const classColors: Record<string, string> = { CLASS_I: 'bg-red-100 text-red-700', CLASS_II: 'bg-orange-100 text-orange-700', CLASS_III: 'bg-amber-100 text-amber-700' }
  const statusColors: Record<string, string> = { INITIATED: 'bg-blue-100 text-blue-700', INVESTIGATING: 'bg-amber-100 text-amber-700', RETURNS_IN_PROGRESS: 'bg-orange-100 text-orange-700', COMPLETED: 'bg-emerald-100 text-emerald-700', CANCELLED: 'bg-slate-100 text-slate-700' }
  const workflow = ['QUALITY_ISSUE', 'AFFECTED_BATCH', 'LOCATE_INVENTORY', 'LOCATE_SHIPMENTS', 'NOTIFY_CUSTOMERS', 'BLOCK_SALES', 'TRACK_RECOVERY', 'CLOSE_RECALL']
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><FileWarning className="h-6 w-6 text-rose-600" />Recall Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 39 · Epic 7 · 8-Stage Recall Workflow · Internal / Market / Supplier / Regulatory</p>
        </div>
        <Button size="sm" variant="destructive"><FileWarning className="mr-1 h-4 w-4" />Initiate Recall</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Recalls', value: '3', color: 'text-blue-600' },
          { label: 'Open', value: '1', color: 'text-rose-600' },
          { label: 'Completed', value: '2', color: 'text-emerald-600' },
          { label: 'Recovery Rate', value: '93.0%', color: 'text-emerald-600' },
          { label: 'Total Value', value: '₹87,200', color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>
      <Card className="p-4 bg-gradient-to-r from-rose-50 to-orange-50 border-rose-300">
        <h3 className="font-semibold text-sm mb-3">Recall Workflow — 8 Stages</h3>
        <div className="flex items-center gap-2 text-xs overflow-x-auto">
          {workflow.map((stage, i) => (
            <div key={stage} className="flex items-center gap-2 flex-shrink-0">
              <div className={`px-3 py-1.5 rounded-md font-medium ${i < 5 ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : i === 5 ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-white border'}`}>
                <span className="text-[10px] mr-1">{i + 1}.</span>{stage.replace(/_/g, ' ')}
              </div>
              {i < workflow.length - 1 && <ArrowRight className="h-3 w-3 text-rose-400 flex-shrink-0" />}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Stages 1-5 complete for REC-2026-003 · Currently at stage 6 (Block Sales) · Awaiting full recovery</p>
      </Card>
      <div className="space-y-3">
        {recalls.map(r => (
          <Card key={r.num} className="p-4 border-l-4 border-rose-400">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-sm font-semibold text-rose-700">{r.num}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[r.type]}`}>{r.type}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${classColors[r.class]}`}>{r.class.replace(/_/g, ' ')}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[r.status]}`}>{r.status.replace(/_/g, ' ')}</span>
                  {r.regulatory && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">FSSAI Notified</span>}
                </div>
                <p className="font-semibold">{r.product}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Affected Batch: <span className="font-mono text-blue-700">{r.batch}</span></p>
                <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
              </div>
              <div className="text-right text-xs">
                <p className="text-muted-foreground">Initiated: {r.date}</p>
                {r.completed && <p className="text-emerald-700">Completed: {r.completed.split('T')[0]}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
              <div className="p-2 rounded bg-muted/30"><p className="text-[10px] text-muted-foreground">Batches</p><p className="font-bold">{r.batches}</p></div>
              <div className="p-2 rounded bg-muted/30"><p className="text-[10px] text-muted-foreground">Customers</p><p className="font-bold">{r.customers}</p></div>
              <div className="p-2 rounded bg-muted/30"><p className="text-[10px] text-muted-foreground">Qty Recalled</p><p className="font-bold">{r.qtyRecalled} pcs</p></div>
              <div className="p-2 rounded bg-muted/30"><p className="text-[10px] text-muted-foreground">Qty Returned</p><p className="font-bold text-emerald-700">{r.qtyReturned} pcs</p></div>
              <div className="p-2 rounded bg-muted/30"><p className="text-[10px] text-muted-foreground">Recovery</p><p className="font-bold text-emerald-700">{((r.qtyReturned / r.qtyRecalled) * 100).toFixed(1)}%</p></div>
              <div className="p-2 rounded bg-muted/30"><p className="text-[10px] text-muted-foreground">Value</p><p className="font-bold text-rose-700">₹{r.value.toLocaleString('en-IN')}</p></div>
            </div>
            {r.status !== 'COMPLETED' && (
              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" variant="destructive" className="h-7 text-xs"><FileWarning className="mr-1 h-3 w-3" />Send Recall Notice</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">Notify FSSAI</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">Block Sales</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs">Track Recovery</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs ml-auto">View Full Audit Trail</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Epic 8: Compliance Dashboard Module ───────────────────────────────
function ComplianceDashboardModule() {
  const standards = [
    { std: 'FSSAI', ver: '2018', status: 'CERTIFIED', certified: '2025-11-15', validUntil: '2028-11-14', score: 96.5, lastAudit: '2025-11-15', findings: 3, crit: 0, maj: 0, min: 3, obs: 5, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { std: 'HACCP', ver: 'Rev 7', status: 'CERTIFIED', certified: '2025-09-20', validUntil: '2028-09-19', score: 95.0, lastAudit: '2025-09-20', findings: 2, crit: 0, maj: 1, min: 1, obs: 4, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { std: 'ISO 22000', ver: '2018', status: 'CERTIFIED', certified: '2025-08-10', validUntil: '2028-08-09', score: 93.8, lastAudit: '2025-08-10', findings: 4, crit: 0, maj: 1, min: 3, obs: 6, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { std: 'BRCGS', ver: 'Issue 9', status: 'CERTIFIED', certified: '2025-12-05', validUntil: '2026-12-04', score: 92.5, lastAudit: '2025-12-05', findings: 5, crit: 0, maj: 2, min: 3, obs: 7, color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { std: 'FDA', ver: 'FSMA', status: 'SCHEDULED', certified: null, validUntil: null, score: null, lastAudit: null, findings: 0, crit: 0, maj: 0, min: 0, obs: 0, color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { std: 'Export', ver: 'APEDA', status: 'CERTIFIED', certified: '2025-10-30', validUntil: '2027-10-29', score: 94.0, lastAudit: '2025-10-30', findings: 2, crit: 0, maj: 0, min: 2, obs: 3, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  ]
  const recentAudits = [
    { code: 'AUD-2026-014', std: 'BRCGS', type: 'INTERNAL', date: '2026-07-01', score: 92.5, status: 'COMPLETED', findings: 5, batches: 24, auditor: 'Internal QA Team' },
    { code: 'AUD-2026-013', std: 'FSSAI', type: 'REGULATORY', date: '2026-06-20', score: 96.0, status: 'COMPLETED', findings: 3, batches: 18, auditor: 'FSSAI Inspector' },
    { code: 'AUD-2026-012', std: 'HACCP', type: 'CUSTOMER', date: '2026-06-10', score: 95.0, status: 'COMPLETED', findings: 2, batches: 12, auditor: 'Big Bazaar QA Team' },
    { code: 'AUD-2026-011', std: 'ISO 22000', type: 'EXTERNAL', date: '2026-05-25', score: 93.8, status: 'COMPLETED', findings: 4, batches: 30, auditor: 'DNV GL' },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Stamp className="h-6 w-6 text-purple-600" />Compliance Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 39 · Epic 8 · FSSAI · HACCP · ISO 22000 · BRCGS · FDA · Export Compliance</p>
        </div>
        <Button size="sm" variant="outline"><Plus className="mr-1 h-4 w-4" />Schedule Audit</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Audits', value: '24', color: 'text-blue-600' },
          { label: 'Passed', value: '21', color: 'text-emerald-600' },
          { label: 'Failed', value: '1', color: 'text-rose-600' },
          { label: 'Avg Score', value: '94.2%', color: 'text-emerald-600' },
          { label: 'Valid Certifications', value: '5', color: 'text-purple-600' },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {standards.map(s => (
          <Card key={s.std} className={`p-4 border-2 ${s.color}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-bold">{s.std}</p>
                <p className="text-[10px] text-muted-foreground">{s.ver}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] ${s.status === 'CERTIFIED' ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : s.status === 'SCHEDULED' ? 'border-slate-300 text-slate-600 bg-slate-50' : ''}`}>{s.status}</Badge>
            </div>
            {s.score !== null ? (
              <>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold">{s.score}%</span>
                  <span className="text-[10px] text-muted-foreground">score</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${s.score >= 95 ? 'bg-emerald-500' : s.score >= 90 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${s.score}%` }} />
                </div>
                <div className="flex items-center gap-2 text-[10px] mb-1">
                  <span className="text-rose-600">{s.crit} Critical</span>
                  <span className="text-orange-600">{s.maj} Major</span>
                  <span className="text-amber-600">{s.min} Minor</span>
                  <span className="text-slate-600">{s.obs} Obs.</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Certified: {s.certified}</p>
                <p className="text-[10px] text-muted-foreground">Valid until: {s.validUntil}</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic">Audit scheduled — pending</p>
            )}
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30">
          <h3 className="font-semibold text-sm">Recent Audits</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Audit Code</th>
                <th className="px-3 py-2 font-medium">Standard</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium text-center">Score</th>
                <th className="px-3 py-2 font-medium text-center">Findings</th>
                <th className="px-3 py-2 font-medium text-center">Batches</th>
                <th className="px-3 py-2 font-medium">Auditor</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAudits.map(a => (
                <tr key={a.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-blue-700">{a.code}</td>
                  <td className="px-3 py-2 font-medium">{a.std}</td>
                  <td className="px-3 py-2"><span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{a.type}</span></td>
                  <td className="px-3 py-2">{a.date}</td>
                  <td className={`px-3 py-2 text-center font-bold ${a.score >= 95 ? 'text-emerald-600' : a.score >= 90 ? 'text-amber-600' : 'text-rose-600'}`}>{a.score}%</td>
                  <td className="px-3 py-2 text-center">{a.findings}</td>
                  <td className="px-3 py-2 text-center">{a.batches}</td>
                  <td className="px-3 py-2">{a.auditor}</td>
                  <td className="px-3 py-2"><span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Compliance Gaps & Actions</h3>
        <div className="space-y-2">
          {[
            { std: 'BRCGS', gap: 'Minor finding: Clutter near packaging line WC-KK-03', sev: 'MINOR', action: '5S training scheduled for 2026-07-15', status: 'IN_PROGRESS' },
            { std: 'ISO 22000', gap: 'Major finding: CCP-02 (cooking temp) log missing for 1 batch', sev: 'MAJOR', action: 'Cooking log enforcement enabled; retraining completed', status: 'RESOLVED' },
            { std: 'HACCP', gap: 'Observation: Hand wash station soap dispenser empty at line 2', sev: 'OBSERVATION', action: 'Daily checklist updated; supervisor sign-off required', status: 'RESOLVED' },
          ].map((g, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded border bg-muted/20">
              <Badge variant="outline" className={`text-[10px] ${g.sev === 'MAJOR' ? 'border-orange-300 text-orange-700' : g.sev === 'MINOR' ? 'border-amber-300 text-amber-700' : 'border-slate-300 text-slate-600'}`}>{g.sev}</Badge>
              <div className="flex-1">
                <p className="text-xs font-medium"><span className="text-purple-700">{g.std}</span>: {g.gap}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Action: {g.action}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] ${g.status === 'RESOLVED' ? 'border-emerald-300 text-emerald-700' : 'border-amber-300 text-amber-700'}`}>{g.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 1 (cont.): Batch History Module ──────────────────────────────
function BatchHistoryModule() {
  const history = [
    { batch: 'KAJ-THN-20260709-000145', from: 'PLANNED', to: 'RUNNING', when: '2026-07-09 06:30', by: 'Rajesh Kumar', reason: 'Production started', ref: 'WO-003', refType: 'WORK_ORDER' },
    { batch: 'KAJ-THN-20260709-000145', from: 'RUNNING', to: 'COMPLETED', when: '2026-07-09 08:00', by: 'Rajesh Kumar', reason: 'All operations complete', ref: 'WO-003', refType: 'WORK_ORDER' },
    { batch: 'KAJ-THN-20260709-000145', from: 'COMPLETED', to: 'RELEASED', when: '2026-07-09 10:00', by: 'Quality Team', reason: 'Quality check passed - Grade A', ref: 'QC-2026-0142', refType: 'QUALITY_CHECK' },
    { batch: 'KAJ-THN-20260709-000145', from: 'RELEASED', to: 'RELEASED', when: '2026-07-09 10:05', by: 'Label Printer', reason: 'Production label printed', ref: 'LBL-2026-0892', refType: 'LABEL' },
    { batch: 'KAJ-THN-20260709-000145', from: 'RELEASED', to: 'RELEASED', when: '2026-07-09 10:30', by: 'Warehouse', reason: 'Warehouse receipt WH-THN-FG-01 / Bin A-01-03-02', ref: 'WR-2026-0094', refType: 'WAREHOUSE_RECEIPT' },
    { batch: 'KAJ-THN-20260628-000011', from: 'RELEASED', to: 'RECALLED', when: '2026-07-08 11:00', by: 'Quality Head', reason: 'Customer complaint - taste deviation', ref: 'REC-2026-003', refType: 'RECALL' },
    { batch: 'KAJ-THN-20260628-000011', from: 'RECALLED', to: 'RECALLED', when: '2026-07-08 14:00', by: 'Sales Team', reason: 'Recall notice sent to 12 customers & 3 distributors', ref: 'REC-2026-003', refType: 'RECALL' },
    { batch: 'SHW-THN-20260702-000041', from: 'RELEASED', to: 'EXPIRED', when: '2026-07-09 00:00', by: 'System', reason: 'Auto-expired - 7-day shelf life elapsed', ref: 'EXP-2026-0042', refType: 'EXPIRY' },
    { batch: 'MOT-THN-20260708-000032', from: 'COMPLETED', to: 'QUALITY_HOLD', when: '2026-07-08 18:00', by: 'Quality Team', reason: 'Held for re-testing - sugar crystallization check', ref: 'QC-2026-0156', refType: 'QUALITY_CHECK' },
  ]
  const transitionColors: Record<string, string> = {
    PLANNED: 'bg-slate-100 text-slate-700', RUNNING: 'bg-blue-100 text-blue-700', COMPLETED: 'bg-cyan-100 text-cyan-700',
    RELEASED: 'bg-emerald-100 text-emerald-700', QUALITY_HOLD: 'bg-amber-100 text-amber-700', REJECTED: 'bg-rose-100 text-rose-700',
    RECALLED: 'bg-red-100 text-red-700', EXPIRED: 'bg-zinc-100 text-zinc-700', DISPOSED: 'bg-zinc-200 text-zinc-800',
  }
  const refTypeIcons: Record<string, any> = {
    WORK_ORDER: ListChecks, QUALITY_CHECK: ShieldCheck, RECALL: FileWarning, EXPIRY: CalendarClock, LABEL: QrCode, WAREHOUSE_RECEIPT: Warehouse,
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><History className="h-6 w-6 text-blue-600" />Batch History</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 39 · Epic 1 · Immutable audit trail of all batch status transitions</p>
        </div>
        <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export Audit Log</Button>
      </div>
      <Card className="p-4 bg-blue-50/50 border-blue-200">
        <div className="flex items-start gap-3">
          <History className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Immutable Audit Trail</p>
            <p className="text-xs text-muted-foreground mt-1">After production completion, batch genealogy is immutable. Every status change, reference (work order, quality check, recall, expiry), actor, and reason is permanently logged for FSSAI, HACCP, ISO 22000, BRCGS audit compliance.</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Batch Number</th>
                <th className="px-3 py-2 font-medium">Transition</th>
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">By</th>
                <th className="px-3 py-2 font-medium">Reason</th>
                <th className="px-3 py-2 font-medium">Reference</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => {
                const RefIcon = refTypeIcons[h.refType] || FileText
                return (
                  <tr key={i} className="border-t hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{h.batch}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${transitionColors[h.from]}`}>{h.from}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${transitionColors[h.to]}`}>{h.to}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[11px]">{h.when}</td>
                    <td className="px-3 py-2">{h.by}</td>
                    <td className="px-3 py-2">{h.reason}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <RefIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-[11px] text-blue-700">{h.ref}</span>
                        <span className="text-[10px] text-muted-foreground">({h.refType.replace(/_/g, ' ')})</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Epic 6: Batch Split & Merge Module ────────────────────────────────
function BatchSplitMergeModule() {
  const operations = [
    { code: 'BSM-2026-0048', type: 'SPLIT', source: 'KAJ-THN-20260709-000145', sourceQty: 94, targetBatches: 2, output: 94, loss: 0, uom: 'KG', reason: 'Split into 188 retail packs of 500g', operator: 'Rajesh K.', when: '2026-07-09 08:30', status: 'COMPLETED' },
    { code: 'BSM-2026-0047', type: 'REPACK', source: 'KAJ-THN-20260709-000146', sourceQty: 98, targetBatches: 1, output: 98, loss: 0, uom: 'KG', reason: 'Repack into 1kg display boxes', operator: 'Rajesh K.', when: '2026-07-09 11:30', status: 'COMPLETED' },
    { code: 'BSM-2026-0046', type: 'MERGE', source: '3 partial batches', sourceQty: 25, targetBatches: 1, output: 25, loss: 0, uom: 'KG', reason: 'Merge 3 partial batches of Gulab Jamun', operator: 'Anil R.', when: '2026-07-08 15:00', status: 'COMPLETED' },
    { code: 'BSM-2026-0045', type: 'REWORK', source: 'MOT-THN-20260705-000028', sourceQty: 5, targetBatches: 1, output: 4.5, loss: 0.5, uom: 'KG', reason: 'Rework syrup-soaked Laddus - reshape', operator: 'Suresh M.', when: '2026-07-05 17:00', status: 'COMPLETED' },
    { code: 'BSM-2026-0044', type: 'PARTIAL_CONSUMPTION', source: 'CAS-THN-20260705-000018', sourceQty: 500, targetBatches: 0, output: 55, loss: 0, uom: 'KG', reason: 'Partial consumption in PO-2026-00125', operator: 'Rajesh K.', when: '2026-07-09 06:35', status: 'COMPLETED' },
    { code: 'BSM-2026-0043', type: 'PACKAGING', source: 'SHW-THN-20260709-000047', sourceQty: 95, targetBatches: 95, output: 95, loss: 0, uom: 'KG', reason: 'Pack into 1kg retail pouches', operator: 'Anil R.', when: '2026-07-09 08:00', status: 'IN_PROGRESS' },
  ]
  const typeColors: Record<string, string> = {
    SPLIT: 'bg-blue-100 text-blue-700', MERGE: 'bg-emerald-100 text-emerald-700',
    REPACK: 'bg-purple-100 text-purple-700', PARTIAL_CONSUMPTION: 'bg-amber-100 text-amber-700',
    REWORK: 'bg-orange-100 text-orange-700', PACKAGING: 'bg-cyan-100 text-cyan-700',
  }
  const typeIcons: Record<string, any> = {
    SPLIT: Slice, MERGE: Combine, REPACK: Package, PARTIAL_CONSUMPTION: PackageOpen,
    REWORK: Recycle, PACKAGING: PackageCheck,
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><GitFork className="h-6 w-6 text-purple-600" />Batch Split & Merge</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 39 · Epic 6 · Split · Merge · Repack · Partial Consumption · Rework · Packaging</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Slice className="mr-1 h-4 w-4" />Split</Button>
          <Button size="sm" variant="outline"><Combine className="mr-1 h-4 w-4" />Merge</Button>
          <Button size="sm" variant="outline"><Recycle className="mr-1 h-4 w-4" />Rework</Button>
          <Button size="sm" variant="outline"><Package className="mr-1 h-4 w-4" />Repack</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { type: 'SPLIT', count: 18, icon: Slice, color: 'text-blue-600' },
          { type: 'MERGE', count: 6, icon: Combine, color: 'text-emerald-600' },
          { type: 'REPACK', count: 12, icon: Package, color: 'text-purple-600' },
          { type: 'REWORK', count: 4, icon: Recycle, color: 'text-orange-600' },
          { type: 'PARTIAL', count: 5, icon: PackageOpen, color: 'text-amber-600' },
          { type: 'PACKAGING', count: 3, icon: PackageCheck, color: 'text-cyan-600' },
        ].map(s => (
          <Card key={s.type} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.type}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.count}</p>
              </div>
              <s.icon className="h-6 w-6 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4 bg-purple-50/50 border-purple-200">
        <div className="flex items-start gap-3">
          <GitFork className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Split & Merge Workflow</p>
            <p className="text-xs text-muted-foreground mt-1">Large Batch → Split → Small Retail Packs → Track Every Child Batch. Each operation generates new batch numbers, updates genealogy (parent-child relationship), and maintains full traceability.</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Op Code</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Source Batch</th>
                <th className="px-3 py-2 font-medium text-right">Source Qty</th>
                <th className="px-3 py-2 font-medium text-center">Target Batches</th>
                <th className="px-3 py-2 font-medium text-right">Output</th>
                <th className="px-3 py-2 font-medium text-right">Loss</th>
                <th className="px-3 py-2 font-medium">Reason</th>
                <th className="px-3 py-2 font-medium">Operator</th>
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {operations.map(op => {
                const Icon = typeIcons[op.type] || GitFork
                return (
                  <tr key={op.code} className="border-t hover:bg-muted/30">
                    <td className="px-3 py-2 font-mono text-blue-700">{op.code}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeColors[op.type]}`}>{op.type.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{op.source}</td>
                    <td className="px-3 py-2 text-right">{op.sourceQty} {op.uom}</td>
                    <td className="px-3 py-2 text-center">{op.targetBatches || '—'}</td>
                    <td className="px-3 py-2 text-right font-medium text-emerald-700">{op.output} {op.uom}</td>
                    <td className="px-3 py-2 text-right text-rose-700">{op.loss > 0 ? `${op.loss} ${op.uom}` : '—'}</td>
                    <td className="px-3 py-2 text-[11px] max-w-[200px] truncate" title={op.reason}>{op.reason}</td>
                    <td className="px-3 py-2">{op.operator}</td>
                    <td className="px-3 py-2 text-[11px]">{op.when}</td>
                    <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded ${op.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{op.status}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Loss Analysis</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded bg-rose-50 border border-rose-200">
            <p className="text-xs text-muted-foreground">Total Loss (YTD)</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">4.2 KG</p>
            <p className="text-[10px] text-muted-foreground mt-1">Across 48 operations</p>
          </div>
          <div className="p-3 rounded bg-amber-50 border border-amber-200">
            <p className="text-xs text-muted-foreground">Loss Value</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">₹8,400</p>
            <p className="text-[10px] text-muted-foreground mt-1">Avg ₹175 per operation</p>
          </div>
          <div className="p-3 rounded bg-emerald-50 border border-emerald-200">
            <p className="text-xs text-muted-foreground">Yield Rate</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">99.96%</p>
            <p className="text-[10px] text-muted-foreground mt-1">Industry benchmark: 99.5%</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

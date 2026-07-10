// ═══════════════════════════════════════════════════════════════
// SPRINT 40 — PRODUCTION EXECUTION APP (Web Mobile Prototype)
// Industrial barcode-first production operations
// ═══════════════════════════════════════════════════════════════

// ─── App Selector (choose Warehouse or Production app) ──
function AppSelectorScreen({ onSelect }: { onSelect: (mode: 'warehouse' | 'production') => void }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white font-bold text-3xl">S</div>
          <h1 className="text-2xl font-bold text-white">SUOP</h1>
          <p className="text-xs text-slate-400">Sudhastar Unified Operating Platform</p>
          <span className="inline-block text-[10px] px-2 py-1 rounded bg-amber-500/15 text-amber-400 font-medium">Sprint 40 · Two Execution Apps</span>
        </div>
        <p className="text-xs text-slate-400 text-center font-semibold">Select Application</p>
        <button onClick={() => onSelect('warehouse')} className="w-full p-4 bg-slate-900 hover:bg-slate-800 rounded-xl border-l-4 border-amber-500 flex items-center gap-3 transition-colors">
          <span className="text-3xl">📦</span>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-white">Warehouse Execution App</p>
            <p className="text-[11px] text-slate-400 mt-1">For Receivers, Pickers, Forklift Operators, Dispatch Team</p>
            <p className="text-[10px] text-slate-500 mt-1">Sprint 31 · Receiving, Putaway, Picking, Transfers, Cycle Counts, Dispatch</p>
          </div>
          <span className="text-xl text-slate-600">→</span>
        </button>
        <button onClick={() => onSelect('production')} className="w-full p-4 bg-slate-900 hover:bg-slate-800 rounded-xl border-l-4 border-emerald-500 flex items-center gap-3 transition-colors">
          <span className="text-3xl">🏭</span>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-white">Production Execution App</p>
            <p className="text-[11px] text-slate-400 mt-1">For Mixing, Cooking, Frying, Packing Operators & Supervisors</p>
            <p className="text-[10px] text-slate-500 mt-1">Sprint 40 · Material Issue, Work Orders, Batch Creation, WIP, Quality, Labels</p>
          </div>
          <span className="text-xl text-slate-600">→</span>
        </button>
        <p className="text-[10px] text-slate-500 text-center">Both apps share authentication, offline sync, barcode engine, and audit infrastructure.</p>
      </div>
    </div>
  )
}

// ─── Production Dashboard ────────────────────────────────
function ProductionDashboard({ onNavigate, onLogout }: { onNavigate: (s: MobileScreen) => void; onLogout: () => void }) {
  const operator = { code: 'OP-001', name: 'Rajesh Kumar', role: 'MIXING_OPERATOR', shift: 'Morning (06:00-14:00)', line: 'LINE-KK-01', wc: 'WC-KK-03' }
  const summary = { assignedWOs: 3, completedWOs: 1, inProgressWOs: 1, pendingWOs: 1, targetQty: 285, completedQty: 95, scrapQty: 1, uom: 'KG', efficiency: 98.9 }
  const workOrders = [
    { wo: 'WO-001', op: 'Cooking', product: 'Kaju Katli 500g', plannedQty: 95, status: 'IN_PROGRESS', priority: 'HIGH' },
    { wo: 'WO-002', op: 'Mixing', product: 'Shwet Idli Batter 1kg', plannedQty: 100, status: 'ASSIGNED', priority: 'NORMAL' },
    { wo: 'WO-003', op: 'Packaging', product: 'Motichoor Laddu 1kg', plannedQty: 98, status: 'PENDING', priority: 'NORMAL' },
  ]
  const quickActions = [
    { label: 'Start Work', color: 'bg-emerald-500', screen: 'prod-work-orders' as MobileScreen, icon: '▶️' },
    { label: 'Material', color: 'bg-blue-500', screen: 'prod-material-issue' as MobileScreen, icon: '📦' },
    { label: 'Batch', color: 'bg-amber-500', screen: 'prod-batch-create' as MobileScreen, icon: '🏷️' },
    { label: 'Quality', color: 'bg-purple-500', screen: 'prod-quality-check' as MobileScreen, icon: '✓' },
    { label: 'WIP Move', color: 'bg-cyan-500', screen: 'prod-wip-movement' as MobileScreen, icon: '🔄' },
    { label: 'Lookup', color: 'bg-pink-500', screen: 'prod-lookup' as MobileScreen, icon: '🔍' },
    { label: 'Sync', color: 'bg-slate-600', screen: 'prod-sync' as MobileScreen, icon: '☁️' },
    { label: 'Logout', color: 'bg-rose-500', screen: 'app-selector' as MobileScreen, icon: '🚪' },
  ]
  const woStatusColors: Record<string, string> = { IN_PROGRESS: 'bg-blue-500', ASSIGNED: 'bg-amber-500', PENDING: 'bg-slate-400', COMPLETED: 'bg-emerald-500', PAUSED: 'bg-purple-500' }
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-emerald-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold">{operator.name}</p>
            <p className="text-xs opacity-90">{operator.role.replace(/_/g, ' ')}</p>
            <p className="text-[10px] opacity-75 mt-0.5">{operator.shift} · {operator.line} · {operator.wc}</p>
          </div>
          <div className="text-right">
            <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-emerald-500/30">🟢 ONLINE</span>
            <p className="text-[10px] opacity-75 mt-1">🔋 87%</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-700 mb-3">Today's Production</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="text-center"><p className="text-lg font-bold text-slate-900">{summary.assignedWOs}</p><p className="text-[10px] text-slate-500">Assigned</p></div>
            <div className="text-center"><p className="text-lg font-bold text-emerald-600">{summary.completedWOs}</p><p className="text-[10px] text-slate-500">Done</p></div>
            <div className="text-center"><p className="text-lg font-bold text-blue-600">{summary.inProgressWOs}</p><p className="text-[10px] text-slate-500">In Prog</p></div>
            <div className="text-center"><p className="text-lg font-bold text-amber-600">{summary.pendingWOs}</p><p className="text-[10px] text-slate-500">Pending</p></div>
          </div>
          <div className="flex justify-between py-2 border-t border-slate-100">
            <div><p className="text-[10px] text-slate-500">Target</p><p className="text-sm font-bold">{summary.targetQty} {summary.uom}</p></div>
            <div><p className="text-[10px] text-slate-500">Completed</p><p className="text-sm font-bold text-emerald-600">{summary.completedQty} {summary.uom}</p></div>
            <div><p className="text-[10px] text-slate-500">Scrap</p><p className="text-sm font-bold text-rose-600">{summary.scrapQty} {summary.uom}</p></div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-slate-500"><span>Efficiency</span><span className="font-bold text-emerald-600">{summary.efficiency}%</span></div>
            <div className="h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${summary.efficiency}%` }} /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-700 mb-3">Quick Actions</p>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map(a => (
              <button key={a.label} onClick={() => a.screen === 'app-selector' ? onLogout() : onNavigate(a.screen)} className={`${a.color} rounded-lg py-3 flex flex-col items-center justify-center`}>
                <span className="text-xl">{a.icon}</span>
                <span className="text-[10px] text-white font-semibold mt-1">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-700 mb-3">My Work Orders</p>
          {workOrders.map(wo => (
            <button key={wo.wo} onClick={() => onNavigate('prod-wo-detail')} className="w-full flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
              <div className="text-left">
                <p className="text-xs font-mono font-bold text-blue-600">{wo.wo}</p>
                <p className="text-xs text-slate-700 font-medium">{wo.product}</p>
                <p className="text-[10px] text-slate-500">{wo.op} · {wo.plannedQty} KG</p>
              </div>
              <span className={`text-[9px] px-2 py-1 rounded text-white font-bold ${woStatusColors[wo.status]}`}>{wo.status.replace(/_/g, ' ')}</span>
            </button>
          ))}
        </div>
      </div>
      <MobileTabBar active="dashboard" onNavigate={onNavigate} mode="production" />
    </div>
  )
}

// ─── Production Work Order Detail ────────────────────────
function ProductionWODetail({ onBack, onNavigate }: { onBack: () => void; onNavigate: (s: MobileScreen) => void }) {
  const wo = {
    woNumber: 'WO-001', operationName: 'Cooking', productName: 'Kaju Katli 500g',
    batchNumber: 'KAJ-THN-20260709-000145', plannedQty: 95, uom: 'KG', status: 'IN_PROGRESS',
    machineCode: 'COOK-01', machineName: 'Cooking Kettle 01', recipeCode: 'RCP-KK-001', recipeVersion: 'V2.3',
  }
  const instructions = [
    { step: 1, instruction: 'Pre-heat cooking kettle to 110°C', target: '110°C', completed: true },
    { step: 2, instruction: 'Add ghee to kettle', target: '4 KG', completed: true },
    { step: 3, instruction: 'Add sugar and stir for 5 minutes', target: '5 min', completed: true },
    { step: 4, instruction: 'Add cashew powder slowly', target: '55 KG', completed: false },
    { step: 5, instruction: 'Cook for 15 minutes at 110°C', target: '15 min @ 110°C', completed: false },
  ]
  const materials = [
    { code: 'CAS-W320', name: 'Cashew W320', qty: 55, uom: 'KG', issued: false, batchRequired: true },
    { code: 'SUG-S30', name: 'Sugar S30', qty: 35, uom: 'KG', issued: false, batchRequired: true },
    { code: 'GHE-COW', name: 'Cow Ghee', qty: 4, uom: 'KG', issued: false, batchRequired: true },
  ]
  const qualityChecks = [
    { type: 'TEMPERATURE', stage: 'COOKING', target: 110, min: 108, max: 112, unit: '°C', completed: false },
    { type: 'VISUAL', stage: 'COOKING', target: null, completed: false },
  ]
  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      <div className="bg-emerald-600 text-white p-4 flex items-center gap-3">
        <button onClick={onBack} className="text-xl">←</button>
        <div className="flex-1">
          <p className="text-base font-bold">{wo.woNumber}</p>
          <p className="text-xs opacity-90">{wo.productName}</p>
        </div>
        <span className="text-[10px] px-2 py-1 rounded bg-blue-500 font-bold">{wo.status}</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs text-slate-500">Operation</p>
          <p className="text-sm font-bold">{wo.operationName} · {wo.machineName}</p>
          <p className="text-xs text-slate-500 mt-1">Recipe: {wo.recipeCode} {wo.recipeVersion} · Batch: {wo.batchNumber}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 bg-purple-500 text-white py-3 rounded-lg font-bold text-sm">⏸ Pause</button>
          <button onClick={() => onNavigate('prod-material-issue')} className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-bold text-sm">📦 Materials</button>
          <button onClick={() => onNavigate('prod-batch-create')} className="flex-1 bg-amber-500 text-white py-3 rounded-lg font-bold text-sm">🏷️ Complete</button>
        </div>
        {materials.some(m => !m.issued) && (
          <button onClick={() => onNavigate('prod-material-issue')} className="w-full bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg text-left">
            <p className="text-xs font-bold text-amber-700">⚠ Materials Required</p>
            <p className="text-[11px] text-amber-700 mt-0.5">{materials.filter(m => !m.issued).length} materials to scan and issue</p>
            <p className="text-[11px] text-blue-600 mt-1 font-semibold">Tap to scan →</p>
          </button>
        )}
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs font-semibold text-slate-700 mb-2">Production Instructions</p>
          {instructions.map(inst => (
            <div key={inst.step} className="flex items-center py-2 border-b border-slate-100 last:border-b-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${inst.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{inst.step}</div>
              <div className="flex-1">
                <p className="text-xs text-slate-900">{inst.instruction}</p>
                <p className="text-[10px] text-slate-500">Target: {inst.target}</p>
              </div>
              {inst.completed && <span className="text-emerald-500 font-bold">✓</span>}
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs font-semibold text-slate-700 mb-2">Required Materials</p>
          {materials.map(m => (
            <div key={m.code} className="flex items-center py-2 border-b border-slate-100 last:border-b-0">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-900">{m.name}</p>
                <p className="text-[10px] text-slate-500">{m.code} · {m.qty} {m.uom}</p>
              </div>
              {m.batchRequired && <span className="text-[9px] text-blue-600 font-semibold mr-2">🔍 Batch Req</span>}
              <span className={`text-[9px] px-2 py-1 rounded text-white font-bold ${m.issued ? 'bg-emerald-500' : 'bg-amber-500'}`}>{m.issued ? 'ISSUED' : 'PENDING'}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs font-semibold text-slate-700 mb-2">Quality Checkpoints</p>
          {qualityChecks.map((qc, i) => (
            <button key={i} onClick={() => onNavigate('prod-quality-check')} className="w-full flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-900">{qc.type.replace(/_/g, ' ')} · {qc.stage}</p>
                {qc.target !== null && <p className="text-[10px] text-slate-500">Target: {qc.target} {qc.unit} (range: {qc.min}-{qc.max})</p>}
              </div>
              <span className={`text-[9px] px-2 py-1 rounded text-white font-bold ${qc.completed ? 'bg-emerald-500' : 'bg-amber-500'}`}>{qc.completed ? '✓ PASS' : 'PENDING'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Production Work Orders List ─────────────────────────
function ProductionWorkOrders({ onBack, onNavigate }: { onBack: () => void; onNavigate: (s: MobileScreen) => void }) {
  const workOrders = [
    { wo: 'WO-001', op: 'Cooking', product: 'Kaju Katli 500g', qty: 95, status: 'IN_PROGRESS', priority: 'HIGH', machine: 'COOK-01' },
    { wo: 'WO-002', op: 'Mixing', product: 'Shwet Idli Batter 1kg', qty: 100, status: 'ASSIGNED', priority: 'NORMAL', machine: 'MIX-02' },
    { wo: 'WO-003', op: 'Packaging', product: 'Motichoor Laddu 1kg', qty: 98, status: 'PENDING', priority: 'NORMAL', machine: 'PACK-03' },
  ]
  const statusColors: Record<string, string> = { IN_PROGRESS: 'bg-blue-500', ASSIGNED: 'bg-amber-500', PENDING: 'bg-slate-400' }
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-emerald-600 text-white p-4 flex items-center gap-3">
        <button onClick={onBack} className="text-xl">←</button>
        <div><p className="text-base font-bold">My Work Orders</p><p className="text-xs opacity-90">{workOrders.length} assigned · Tap to open</p></div>
      </div>
      <div className="p-4 space-y-3">
        {workOrders.map(wo => (
          <button key={wo.wo} onClick={() => onNavigate('prod-wo-detail')} className="w-full bg-white rounded-xl p-3 shadow-sm text-left">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-mono font-bold text-blue-600">{wo.wo}</p>
              <span className={`text-[9px] px-2 py-0.5 rounded text-white font-bold ${wo.priority === 'HIGH' ? 'bg-amber-500' : 'bg-slate-400'}`}>{wo.priority}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{wo.product}</p>
            <p className="text-[11px] text-slate-500">Operation: {wo.op} · Machine: {wo.machine}</p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs font-bold text-slate-700">0 / {wo.qty} KG</p>
              <span className={`text-[9px] px-2 py-1 rounded text-white font-bold ${statusColors[wo.status]}`}>{wo.status.replace(/_/g, ' ')}</span>
            </div>
          </button>
        ))}
      </div>
      <MobileTabBar active="work-orders" onNavigate={onNavigate} mode="production" />
    </div>
  )
}

// ─── Material Issue Screen ───────────────────────────────
function MaterialIssueScreen({ onBack }: { onBack: () => void }) {
  const [scannedMaterial, setScannedMaterial] = useState('')
  const [scannedBatch, setScannedBatch] = useState('')
  const [result, setResult] = useState<any>(null)
  const handleIssue = () => {
    if (!scannedMaterial || !scannedBatch) { alert('Scan both material and batch barcode'); return }
    setResult({
      status: 'ISSUED', materialName: 'Cashew W320', batchNumber: scannedBatch, actualQty: 55, uom: 'KG',
      supplierName: 'Sri Balaji Cashews', inventoryUpdated: true,
      validations: [
        { rule: 'INGREDIENT_MATCH', result: 'VALID', message: 'Ingredient matches recipe' },
        { rule: 'BATCH_VALID', result: 'VALID', message: 'Batch is valid and in-stock' },
        { rule: 'EXPIRY_CHECK', result: 'VALID', message: 'Batch not expired (expires 2027-01-05)' },
        { rule: 'QUANTITY_CHECK', result: 'VALID', message: 'Sufficient quantity (445 KG available)' },
        { rule: 'DUPLICATE_SCAN', result: 'VALID', message: 'Not a duplicate scan' },
        { rule: 'BARCODE_RECOGNIZED', result: 'VALID', message: 'Barcode format recognized' },
      ],
    })
  }
  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      <div className="bg-emerald-600 text-white p-4 flex items-center gap-3">
        <button onClick={onBack} className="text-xl">←</button>
        <div><p className="text-base font-bold">Material Issue</p><p className="text-xs opacity-90">Scan ingredient & batch barcode</p></div>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-blue-600 font-semibold">Work Order: WO-001</p>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs font-bold text-slate-900 mb-2">Step 1 — Scan Ingredient</p>
          <input value={scannedMaterial} onChange={(e) => setScannedMaterial(e.target.value)} placeholder="Scan material (e.g. CAS-W320)" className="w-full border border-blue-500 bg-blue-50 rounded-lg px-3 py-3 text-sm" />
          <p className="text-[10px] text-slate-500 mt-1">Expected: Cashew W320 (55 KG)</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs font-bold text-slate-900 mb-2">Step 2 — Scan Batch</p>
          <input value={scannedBatch} onChange={(e) => setScannedBatch(e.target.value)} placeholder="Scan batch (e.g. CAS-THN-20260705-000018)" className="w-full border border-blue-500 bg-blue-50 rounded-lg px-3 py-3 text-sm" />
          <p className="text-[10px] text-slate-500 mt-1">Batch must be valid, non-expired, in-stock</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs font-bold text-slate-900 mb-2">6 Validation Rules</p>
          {['Ingredient matches recipe', 'Batch is valid', 'Batch not expired', 'Sufficient quantity', 'Not a duplicate scan', 'Barcode recognized'].map(r => (
            <div key={r} className="flex items-center py-1"><span className="text-emerald-500 font-bold mr-2">✓</span><span className="text-xs text-slate-700">{r}</span></div>
          ))}
        </div>
        <button onClick={handleIssue} className="w-full bg-emerald-500 text-white py-4 rounded-lg font-bold text-sm">✓ Issue Material</button>
        {result && (
          <div className={`rounded-xl p-4 ${result.status === 'ISSUED' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
            <p className="text-sm font-bold text-slate-900 mb-2">{result.status === 'ISSUED' ? '✓ Material Issued' : '✗ Issue Rejected'}</p>
            {result.validations.map((v: any, i: number) => (
              <div key={i} className="flex items-start py-1 border-b border-slate-200 last:border-b-0">
                <span className={`font-bold mr-2 ${v.result === 'VALID' ? 'text-emerald-500' : 'text-rose-500'}`}>{v.result === 'VALID' ? '✓' : '✗'}</span>
                <div><p className="text-xs font-semibold text-slate-900">{v.rule.replace(/_/g, ' ')}</p><p className="text-[10px] text-slate-500">{v.message}</p></div>
              </div>
            ))}
            {result.status === 'ISSUED' && (
              <>
                <p className="text-xs text-slate-700 mt-2">Issued: {result.actualQty} {result.uom}</p>
                <p className="text-xs text-slate-700">Batch: {result.batchNumber}</p>
                <p className="text-xs text-slate-700">Supplier: {result.supplierName}</p>
                <p className="text-xs text-emerald-700 font-semibold">Inventory: ✓ Updated</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Batch Creation & Label Printing ─────────────────────
function BatchCreationScreen({ onBack }: { onBack: () => void }) {
  const [result, setResult] = useState<any>(null)
  const handleCreate = () => {
    setResult({
      batchNumber: 'KAJ-THN-20260709-000' + Math.floor(Math.random() * 900 + 100),
      labels: [
        { labelType: 'PRODUCTION_BATCH', labelCode: 'LBL-' + Date.now(), qrCode: 'QR-TEST', barcodeType: 'CODE_128' },
        { labelType: 'PALLET_LABEL', labelCode: 'LBL-' + Date.now() + '-P', qrCode: 'QR-TEST-P', barcodeType: 'GS1_128' },
      ],
    })
  }
  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      <div className="bg-emerald-600 text-white p-4 flex items-center gap-3">
        <button onClick={onBack} className="text-xl">←</button>
        <div><p className="text-base font-bold">Batch Creation & Label</p><p className="text-xs opacity-90">Auto-generate batch + print QR/barcode labels</p></div>
      </div>
      <div className="p-4 space-y-3">
        {!result && (
          <>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm font-bold text-slate-900 mb-2">Ready to Create Batch</p>
              <p className="text-xs text-slate-600 py-1">Product: Kaju Katli 500g</p>
              <p className="text-xs text-slate-600 py-1">Recipe: RCP-KK-001 V2.3</p>
              <p className="text-xs text-slate-600 py-1">Quantity: 94 KG</p>
              <p className="text-xs text-slate-600 py-1">Work Order: WO-001</p>
              <p className="text-xs text-slate-600 py-1">Expiry: 90 days from now</p>
              <p className="text-xs text-slate-600 py-1">Printer: Zebra ZD420 (Bluetooth)</p>
            </div>
            <button onClick={handleCreate} className="w-full bg-amber-500 text-white py-4 rounded-lg font-bold text-sm">🏷️ Create Batch + Print Labels</button>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs font-bold text-slate-900 mb-2">Auto-Generated</p>
              {['Production Batch (FINISHED_GOODS)', 'QR Code (encoded batch data)', 'Barcode Label (CODE_128)', 'Pallet Label (GS1-128)', 'Display Box Label (optional)'].map((item, i) => (
                <div key={item} className="flex items-center py-1">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center mr-2">{i + 1}</span>
                  <span className="text-xs text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {result && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-base font-bold text-emerald-600 mb-3">✓ Batch Created Successfully</p>
            <div className="bg-blue-50 border border-blue-500 rounded-lg p-3 mb-3">
              <p className="text-[10px] text-slate-500">Batch Number</p>
              <p className="text-sm font-bold text-blue-600 font-mono">{result.batchNumber}</p>
            </div>
            <p className="text-xs font-bold text-slate-900 mb-2">Generated Labels ({result.labels.length})</p>
            {result.labels.map((label: any, i: number) => (
              <div key={i} className="flex items-center bg-slate-50 rounded-lg p-3 mb-2 border-l-4 border-purple-500">
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-900">{label.labelType.replace(/_/g, ' ')}</p>
                  <p className="text-[11px] text-blue-600 font-mono">{label.labelCode}</p>
                  <p className="text-[10px] text-slate-500">QR: {label.qrCode} · {label.barcodeType}</p>
                </div>
                <button onClick={() => alert(`Label sent to Zebra ZD420`)} className="bg-purple-500 text-white text-xs px-3 py-2 rounded font-bold">🖨 Print</button>
              </div>
            ))}
            <button onClick={onBack} className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold text-sm mt-3">Done — Return to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Quality Check Screen ────────────────────────────────
function QualityCheckScreen({ onBack }: { onBack: () => void }) {
  const [measured, setMeasured] = useState('')
  const [remarks, setRemarks] = useState('')
  const [result, setResult] = useState<any>(null)
  const handleSubmit = () => {
    const m = parseFloat(measured)
    const pass = m >= 108 && m <= 112
    setResult({ measured, target: 110, min: 108, max: 112, unit: '°C', result: pass ? 'PASS' : 'FAIL', stage: 'COOKING', remarks, canProceed: pass })
  }
  const checkTypes = [
    { type: 'TEMPERATURE', icon: '🌡️', label: 'Temperature', unit: '°C' },
    { type: 'WEIGHT', icon: '⚖️', label: 'Weight', unit: 'KG' },
    { type: 'DIMENSIONS', icon: '📏', label: 'Dimensions', unit: 'MM' },
    { type: 'VISUAL', icon: '👁️', label: 'Visual Inspection', unit: '' },
    { type: 'TASTE', icon: '👅', label: 'Taste Approval', unit: '' },
    { type: 'PACKAGING', icon: '📦', label: 'Packaging Check', unit: '' },
    { type: 'METAL_DETECTOR', icon: '🔍', label: 'Metal Detector', unit: '' },
    { type: 'SEAL_VERIFICATION', icon: '🔐', label: 'Seal Verification', unit: '' },
  ]
  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      <div className="bg-emerald-600 text-white p-4 flex items-center gap-3">
        <button onClick={onBack} className="text-xl">←</button>
        <div><p className="text-base font-bold">Quality Checkpoint</p><p className="text-xs opacity-90">Temperature · Stage: COOKING</p></div>
      </div>
      <div className="p-4 space-y-3">
        {!result && (
          <>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <p className="text-xs text-slate-500">Target Value</p>
              <p className="text-3xl font-bold text-slate-900 my-1">110 °C</p>
              <p className="text-[11px] text-slate-500">Acceptable range: 108 - 112 °C</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs font-bold text-slate-900 mb-2">Enter Measured Value</p>
              <input value={measured} onChange={(e) => setMeasured(e.target.value)} placeholder="Enter temperature value in °C" className="w-full border border-blue-500 bg-blue-50 rounded-lg px-3 py-3 text-sm" />
              <p className="text-[10px] text-slate-500 mt-1">Or scan measurement device</p>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs font-bold text-slate-900 mb-2">Remarks (optional)</p>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Any observations..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm h-20" />
            </div>
            <button onClick={handleSubmit} disabled={!measured} className="w-full bg-purple-500 text-white py-4 rounded-lg font-bold text-sm disabled:opacity-50">Submit Quality Check</button>
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-xs font-bold text-slate-900 mb-2">8 Quality Check Types</p>
              {checkTypes.map(ct => (
                <div key={ct.type} className="flex items-center py-1"><span className="text-base mr-2">{ct.icon}</span><span className="text-xs text-slate-700 flex-1">{ct.label}</span>{ct.unit && <span className="text-[10px] text-slate-500">({ct.unit})</span>}</div>
              ))}
            </div>
          </>
        )}
        {result && (
          <div className={`rounded-xl p-4 ${result.result === 'PASS' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
            <p className="text-base font-bold text-slate-900 mb-2">{result.result === 'PASS' ? '✓ PASS — Proceed' : '✗ FAIL — Hold Production'}</p>
            <p className="text-xs text-slate-700">Measured: {result.measured} {result.unit}</p>
            <p className="text-xs text-slate-700">Target: {result.target} {result.unit}</p>
            <p className="text-xs text-slate-700">Range: {result.min} - {result.max} {result.unit}</p>
            <p className="text-xs text-slate-700">Stage: {result.stage}</p>
            {result.remarks && <p className="text-xs text-slate-700">Remarks: {result.remarks}</p>}
            {result.canProceed ? (
              <button onClick={onBack} className="w-full bg-emerald-500 text-white py-3 rounded-lg font-bold text-sm mt-3">✓ Continue Production</button>
            ) : (
              <>
                <button onClick={() => alert('Notifying supervisor for review...')} className="w-full bg-rose-500 text-white py-3 rounded-lg font-bold text-sm mt-3">📞 Call Supervisor</button>
                <button onClick={onBack} className="w-full bg-purple-500 text-white py-3 rounded-lg font-bold text-sm mt-2">Rework Batch</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── WIP Movement Screen ─────────────────────────────────
function WIPMovementScreen({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1)
  const [fromWC, setFromWC] = useState('')
  const [toWC, setToWC] = useState('')
  const [batch, setBatch] = useState('')
  const [qty, setQty] = useState('')
  const [result, setResult] = useState<any>(null)
  const stages = ['MIXING', 'COOKING', 'COOLING', 'CUTTING', 'PACKING', 'FINISHED']
  const handleTransfer = () => {
    setResult({ fromStage: 'COOKING', toStage: 'COOLING', batch, qty, uom: 'KG', newWipCode: 'WIP-' + Math.floor(Math.random() * 9000 + 1000) })
  }
  return (
    <div className="min-h-screen bg-slate-50 pb-6">
      <div className="bg-emerald-600 text-white p-4 flex items-center gap-3">
        <button onClick={onBack} className="text-xl">←</button>
        <div><p className="text-base font-bold">WIP Movement</p><p className="text-xs opacity-90">Transfer work-in-progress between stages</p></div>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs font-bold text-slate-900 mb-2">Production Stages</p>
          <div className="flex flex-wrap items-center">
            {stages.map((s, i) => (
              <div key={s} className="flex items-center mr-1 mb-2">
                <div className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i < 2 ? 'bg-emerald-500 text-white' : i === 2 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{i + 1}</div>
                  <span className="text-[9px] text-slate-700 mt-1 text-center w-12">{s}</span>
                </div>
                {i < stages.length - 1 && <span className="text-slate-400 mx-1">→</span>}
              </div>
            ))}
          </div>
        </div>
        {!result && (
          <>
            {step === 1 && (
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-xs font-bold text-slate-900 mb-2">Step 1 — Scan Current Work Center</p>
                <input value={fromWC} onChange={(e) => setFromWC(e.target.value)} placeholder="Scan current WC QR (e.g. WC-KK-03)" className="w-full border border-blue-500 bg-blue-50 rounded-lg px-3 py-3 text-sm" />
                <button onClick={() => setStep(2)} disabled={!fromWC} className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold text-sm mt-2 disabled:opacity-50">Next →</button>
              </div>
            )}
            {step === 2 && (
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-xs font-bold text-slate-900 mb-2">Step 2 — Scan Next Work Center</p>
                <input value={toWC} onChange={(e) => setToWC(e.target.value)} placeholder="Scan destination WC QR (e.g. WC-KK-04)" className="w-full border border-blue-500 bg-blue-50 rounded-lg px-3 py-3 text-sm" />
                <button onClick={() => setStep(3)} disabled={!toWC} className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold text-sm mt-2 disabled:opacity-50">Next →</button>
              </div>
            )}
            {step === 3 && (
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-xs font-bold text-slate-900 mb-2">Step 3 — Batch & Quantity</p>
                <input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="Scan batch QR" className="w-full border border-blue-500 bg-blue-50 rounded-lg px-3 py-3 text-sm" />
                <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Enter quantity (KG)" className="w-full border border-blue-500 bg-blue-50 rounded-lg px-3 py-3 text-sm mt-2" />
                <button onClick={handleTransfer} disabled={!batch || !qty} className="w-full bg-emerald-500 text-white py-3 rounded-lg font-bold text-sm mt-2 disabled:opacity-50">✓ Transfer WIP</button>
              </div>
            )}
          </>
        )}
        {result && (
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-base font-bold text-slate-900 mb-2">✓ WIP Transferred</p>
            <p className="text-xs text-slate-700">{result.fromStage} → {result.toStage}</p>
            <p className="text-xs text-slate-700">Batch: {result.batch}</p>
            <p className="text-xs text-slate-700">Quantity: {result.qty} {result.uom}</p>
            <p className="text-xs text-slate-700">New WIP Code: {result.newWipCode}</p>
            <button onClick={onBack} className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold text-sm mt-3">Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Production Inventory Lookup ─────────────────────────
function ProductionLookupScreen({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const handleSearch = () => {
    setResults([
      { type: 'MATERIAL', code: 'CAS-W320', name: 'Cashew W320', totalQty: 445, uom: 'KG', warehouse: 'WH-THN-RM-01', bin: 'RM-CAS-01' },
      { type: 'BATCH', code: 'CAS-THN-20260705-000018', name: 'Cashew W320 (Batch)', qty: 445, uom: 'KG', expiry: '2027-01-05', supplier: 'Sri Balaji Cashews' },
      { type: 'MATERIAL', code: 'SUG-S30', name: 'Sugar S30', totalQty: 965, uom: 'KG', warehouse: 'WH-THN-RM-01', bin: 'RM-SUG-01' },
    ])
  }
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-emerald-600 text-white p-4 flex items-center gap-3">
        <button onClick={onBack} className="text-xl">←</button>
        <div><p className="text-base font-bold">Inventory Lookup</p><p className="text-xs opacity-90">Search materials, batches, suppliers</p></div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Scan or enter search term" className="flex-1 border border-blue-500 bg-blue-50 rounded-lg px-3 py-3 text-sm" />
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 rounded-lg">🔍</button>
        </div>
        {results.map((r, i) => (
          <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center mb-2">
              <span className={`text-[9px] px-2 py-1 rounded text-white font-bold mr-2 ${r.type === 'BATCH' ? 'bg-blue-500' : 'bg-emerald-500'}`}>{r.type}</span>
              <span className="text-xs font-mono text-blue-600 font-semibold">{r.code}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{r.name}</p>
            {r.type === 'BATCH' ? (
              <>
                <p className="text-[11px] text-slate-500 mt-1">Qty: {r.qty} {r.uom}</p>
                <p className="text-[11px] text-slate-500">Expiry: {r.expiry}</p>
                <p className="text-[11px] text-slate-500">Supplier: {r.supplier}</p>
              </>
            ) : (
              <>
                <p className="text-[11px] text-slate-500 mt-1">Total Qty: {r.totalQty} {r.uom}</p>
                <p className="text-[11px] text-slate-500">Warehouse: {r.warehouse}</p>
                <p className="text-[11px] text-slate-500">Bin: {r.bin}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Production Sync Monitor ─────────────────────────────
function ProductionSyncScreen({ onBack }: { onBack: () => void }) {
  const [syncing, setSyncing] = useState(false)
  const syncHistory = [
    { syncCode: 'PSH-001', direction: 'BIDIRECTIONAL', total: 12, success: 12, failed: 0, duration: 1840, when: '2 min ago', status: 'COMPLETED' },
    { syncCode: 'PSH-002', direction: 'UPLOAD', total: 3, success: 3, failed: 0, duration: 620, when: '15 min ago', status: 'COMPLETED' },
    { syncCode: 'PSH-003', direction: 'BIDIRECTIONAL', total: 8, success: 7, failed: 1, duration: 2100, when: '32 min ago', status: 'PARTIAL' },
  ]
  const offlineCaps = ['Offline Login (cached credentials)', 'Offline Work Orders (preloaded)', 'Offline Scanning (queued)', 'Offline WIP Updates (queued)', 'Automatic Sync (when online)', 'Conflict Resolution (server/client/manual)', 'Retry Queue (max 5 attempts)', 'Encrypted Local Storage']
  const handleSync = () => { setSyncing(true); setTimeout(() => setSyncing(false), 1500) }
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-emerald-600 text-white p-4 flex items-center gap-3">
        <button onClick={onBack} className="text-xl">←</button>
        <div><p className="text-base font-bold">Sync Monitor</p><p className="text-xs opacity-90">Offline-first synchronization</p></div>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-slate-900">🟢 ONLINE</p>
          <p className="text-[11px] text-slate-700 mt-1">Last sync: just now</p>
          <p className="text-[11px] text-slate-700">Health: HEALTHY · Network: WIFI</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-lg p-2 text-center shadow-sm"><p className="text-lg font-bold text-slate-900">0</p><p className="text-[10px] text-slate-500">Pending</p></div>
          <div className="bg-white rounded-lg p-2 text-center shadow-sm"><p className="text-lg font-bold text-slate-900">0</p><p className="text-[10px] text-slate-500">Failed</p></div>
          <div className="bg-white rounded-lg p-2 text-center shadow-sm"><p className="text-lg font-bold text-slate-900">2.4 MB</p><p className="text-[10px] text-slate-500">Storage</p></div>
        </div>
        <button onClick={handleSync} disabled={syncing} className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold text-sm disabled:opacity-50">{syncing ? 'Syncing...' : '🔄 Sync Now'}</button>
        <p className="text-xs font-bold text-slate-900">Recent Sync History</p>
        {syncHistory.map(h => (
          <div key={h.syncCode} className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex justify-between items-center">
              <p className="text-xs font-mono font-semibold text-blue-600">{h.syncCode}</p>
              <span className={`text-[9px] px-2 py-1 rounded text-white font-bold ${h.status === 'COMPLETED' ? 'bg-emerald-500' : h.status === 'PARTIAL' ? 'bg-amber-500' : 'bg-rose-500'}`}>{h.status}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{h.direction} · {h.total} transactions · {h.success} success · {h.failed} failed</p>
            <p className="text-[11px] text-slate-500">Duration: {h.duration}ms · {h.when}</p>
          </div>
        ))}
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <p className="text-xs font-bold text-slate-900 mb-2">Offline Capabilities</p>
          {offlineCaps.map(c => (
            <div key={c} className="flex items-center py-1"><span className="text-emerald-500 font-bold mr-2">✓</span><span className="text-xs text-slate-700">{c}</span></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Mobile Tab Bar (production mode) ────────────────────
function MobileTabBar({ active, onNavigate, mode }: { active: string; onNavigate: (s: MobileScreen) => void; mode: 'warehouse' | 'production' }) {
  const tabs = mode === 'production'
    ? [
      { icon: <Activity className="h-5 w-5" />, label: 'Home', screen: 'prod-dashboard' as MobileScreen, active: active === 'dashboard' },
      { icon: <ClipboardCheck className="h-5 w-5" />, label: 'Work Orders', screen: 'prod-work-orders' as MobileScreen, active: active === 'work-orders' },
      { icon: <Search className="h-5 w-5" />, label: 'Lookup', screen: 'prod-lookup' as MobileScreen, active: active === 'lookup' },
      { icon: <Cloud className="h-5 w-5" />, label: 'Sync', screen: 'prod-sync' as MobileScreen, active: active === 'sync' },
      { icon: <Settings className="h-5 w-5" />, label: 'Settings', screen: 'settings' as MobileScreen, active: active === 'settings' },
    ]
    : [
      { icon: <Activity className="h-5 w-5" />, label: 'Home', screen: 'dashboard' as MobileScreen, active: active === 'dashboard' },
      { icon: <ClipboardCheck className="h-5 w-5" />, label: 'Tasks', screen: 'tasks' as MobileScreen, active: active === 'tasks' },
      { icon: <ScanLine className="h-5 w-5" />, label: 'Scan', screen: 'scan' as MobileScreen, active: active === 'scan' },
      { icon: <Search className="h-5 w-5" />, label: 'Lookup', screen: 'inventory-lookup' as MobileScreen, active: active === 'lookup' },
      { icon: <Settings className="h-5 w-5" />, label: 'Settings', screen: 'settings' as MobileScreen, active: active === 'settings' },
    ]
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 flex" style={{ paddingBottom: 4, height: 60 }}>
      {tabs.map((t) => (
        <button key={t.label} onClick={() => onNavigate(t.screen)} className={`flex-1 flex flex-col items-center justify-center ${t.active ? 'text-emerald-600' : 'text-slate-400'}`}>
          {t.icon}
          <span className="text-[10px] font-semibold mt-0.5">{t.label}</span>
        </button>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 40 — PRODUCTION EXECUTION MOBILE PLATFORM
// Admin-side modules: Prod Mobile Control, WO Console, Quality Center, Label Jobs, Device Mgr, Sync Monitor
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Production Mobile Control ──────────────────────────────────────────
function ProdMobileControlModule() {
  const devices = [
    { code: 'DEV-ZEBRA-001', name: 'Zebra TC52', operator: 'Rajesh Kumar (OP-001)', role: 'MIXING_OPERATOR', plant: 'THN', line: 'LINE-KK-01', wc: 'WC-KK-03', battery: 87, status: 'ONLINE', lastSync: '2 min ago' },
    { code: 'DEV-ZEBRA-002', name: 'Zebra TC52', operator: 'Anil Reddy (OP-002)', role: 'COOKING_OPERATOR', plant: 'THN', line: 'LINE-IB-01', wc: 'WC-IB-02', battery: 64, status: 'ONLINE', lastSync: '1 min ago' },
    { code: 'DEV-HON-001', name: 'Honeywell CT60', operator: 'Suresh Mehta (OP-003)', role: 'FRYING_OPERATOR', plant: 'THN', line: 'LINE-NM-01', wc: 'WC-NM-04', battery: 92, status: 'ONLINE', lastSync: '5 min ago' },
    { code: 'DEV-ZEBRA-003', name: 'Zebra TC57', operator: 'Vijay Patel (OP-004)', role: 'PACKING_OPERATOR', plant: 'THN', line: 'LINE-KK-01', wc: 'WC-KK-08', battery: 23, status: 'OFFLINE', lastSync: '18 min ago' },
    { code: 'DEV-CHN-001', name: 'Chainway C72', operator: 'Lakshmi V. (OP-005)', role: 'SHIFT_SUPERVISOR', plant: 'THN', line: 'ALL', wc: 'ALL', battery: 78, status: 'ONLINE', lastSync: '30 sec ago' },
  ]
  const todayActivity = {
    totalLogins: 5, activeNow: 4, offlineNow: 1,
    totalScans: 247, validScans: 242, invalidScans: 5, scanSuccessRate: 98.0,
    batchesCreated: 8, labelsPrinted: 16, qualityChecks: 18, wipTransfers: 12,
    materialIssued: 38, syncsToday: 47, syncSuccess: 46, syncPartial: 1,
  }
  const statusColors: Record<string, string> = { ONLINE: 'bg-emerald-100 text-emerald-700', OFFLINE: 'bg-rose-100 text-rose-700', SYNCING: 'bg-blue-100 text-blue-700' }
  const batteryColor = (b: number) => b >= 50 ? 'text-emerald-600' : b >= 20 ? 'text-amber-600' : 'text-rose-600'
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Smartphone className="h-6 w-6 text-emerald-600" />Production Mobile Control</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 40 · Real-time monitoring of production execution app · 5 login methods · 9 barcode types</p>
        </div>
        <a href="/mobile" target="_blank" rel="noopener noreferrer">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"><Smartphone className="mr-1 h-4 w-4" />Launch App</Button>
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Active Operators', value: todayActivity.activeNow, total: todayActivity.totalLogins, color: 'text-emerald-600', icon: Users },
          { label: 'Total Scans Today', value: todayActivity.totalScans, total: `${todayActivity.scanSuccessRate}%`, color: 'text-blue-600', icon: ScanLine },
          { label: 'Batches Created', value: todayActivity.batchesCreated, total: `${todayActivity.labelsPrinted} labels`, color: 'text-amber-600', icon: Boxes },
          { label: 'Quality Checks', value: todayActivity.qualityChecks, total: '0 failed', color: 'text-purple-600', icon: ShieldCheck },
          { label: 'WIP Transfers', value: todayActivity.wipTransfers, total: '6 stages', color: 'text-cyan-600', icon: GitFork },
          { label: 'Syncs Today', value: todayActivity.syncsToday, total: `${todayActivity.syncSuccess}/${todayActivity.syncsToday}`, color: 'text-slate-600', icon: RefreshCw },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.total}</p>
              </div>
              <s.icon className="h-6 w-6 text-muted-foreground/40" />
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
            <p className="font-semibold text-sm">Production Operator Workflow — No paper travelers, no manual deductions</p>
            <div className="flex items-center gap-1 text-[11px] mt-2 overflow-x-auto">
              {['Login', 'Scan WC', 'Scan WO', 'Issue Materials', 'Start Production', 'Quality Check', 'Create Batch', 'Print Label', 'Transfer WIP', 'Complete', 'Auto Sync'].map((step, i, a) => (
                <div key={i} className="flex items-center gap-1 flex-shrink-0">
                  <span className="px-2 py-0.5 bg-white border rounded text-[10px] font-medium">{step}</span>
                  {i < a.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-emerald-600 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Registered Devices ({devices.length})</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-emerald-700 border-emerald-300">{devices.filter(d => d.status === 'ONLINE').length} Online</Badge>
            <Badge variant="outline" className="text-rose-700 border-rose-300">{devices.filter(d => d.status === 'OFFLINE').length} Offline</Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Device</th>
                <th className="px-3 py-2 font-medium">Operator</th>
                <th className="px-3 py-2 font-medium">Plant / Line / WC</th>
                <th className="px-3 py-2 font-medium text-center">Battery</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Last Sync</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(d => (
                <tr key={d.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <p className="font-mono text-[11px] text-blue-700">{d.code}</p>
                    <p className="text-[10px] text-muted-foreground">{d.name}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-medium">{d.operator}</p>
                    <p className="text-[10px] text-muted-foreground">{d.role.replace(/_/g, ' ')}</p>
                  </td>
                  <td className="px-3 py-2 text-[11px]">{d.plant} · {d.line} · {d.wc}</td>
                  <td className={`px-3 py-2 text-center font-bold ${batteryColor(d.battery)}`}>{d.battery}%</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusColors[d.status]}`}>{d.status}</span></td>
                  <td className="px-3 py-2 text-[11px]">{d.lastSync}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-[11px]"><Eye className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 text-[11px] text-amber-600">Lock</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-[11px] text-rose-600">Wipe</Button>
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

// ─── WO Mobile Console ──────────────────────────────────────────────────
function WOMobileConsoleModule() {
  const workOrders = [
    { wo: 'WO-001', op: 'Cooking', product: 'Kaju Katli 500g', operator: 'Rajesh Kumar', device: 'DEV-ZEBRA-001', status: 'IN_PROGRESS', planned: 95, actual: 47, scrap: 0, uom: 'KG', started: '06:35', elapsed: '1h 25m', machine: 'COOK-01', qcStatus: 'PENDING' },
    { wo: 'WO-002', op: 'Mixing', product: 'Shwet Idli Batter 1kg', operator: 'Anil Reddy', device: 'DEV-ZEBRA-002', status: 'IN_PROGRESS', planned: 100, actual: 100, scrap: 0, uom: 'KG', started: '05:10', elapsed: '2h 50m', machine: 'MIX-02', qcStatus: 'PASS' },
    { wo: 'WO-003', op: 'Packaging', product: 'Motichoor Laddu 1kg', operator: 'Vijay Patel', device: 'DEV-ZEBRA-003', status: 'PAUSED', planned: 98, actual: 48, scrap: 2, uom: 'KG', started: '08:00', elapsed: '40m', machine: 'PACK-03', qcStatus: 'PENDING' },
    { wo: 'WO-004', op: 'Frying', product: 'Mixed Namkeen 500g', operator: 'Suresh Mehta', device: 'DEV-HON-001', status: 'COMPLETED', planned: 150, actual: 148, scrap: 2, uom: 'KG', started: '04:30', elapsed: '3h 30m', machine: 'FRY-01', qcStatus: 'PASS' },
    { wo: 'WO-005', op: 'Cooling', product: 'Kaju Katli 1kg', operator: 'Rajesh Kumar', device: 'DEV-ZEBRA-001', status: 'PENDING', planned: 100, actual: 0, scrap: 0, uom: 'KG', started: null, elapsed: null, machine: 'COOL-01', qcStatus: 'PENDING' },
  ]
  const statusColors: Record<string, string> = { IN_PROGRESS: 'bg-blue-100 text-blue-700', PAUSED: 'bg-purple-100 text-purple-700', COMPLETED: 'bg-emerald-100 text-emerald-700', PENDING: 'bg-slate-100 text-slate-700', REJECTED: 'bg-rose-100 text-rose-700' }
  const qcColors: Record<string, string> = { PASS: 'bg-emerald-100 text-emerald-700', FAIL: 'bg-rose-100 text-rose-700', PENDING: 'bg-amber-100 text-amber-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ListChecks className="h-6 w-6 text-blue-600" />Work Order Mobile Console</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 40 · Live WO execution from mobile devices · Start / Pause / Resume / Complete / Reject / Rework</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total WOs', value: 5, color: 'text-blue-600' },
          { label: 'In Progress', value: 2, color: 'text-blue-600' },
          { label: 'Paused', value: 1, color: 'text-purple-600' },
          { label: 'Completed', value: 1, color: 'text-emerald-600' },
          { label: 'Pending', value: 1, color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">WO</th>
                <th className="px-3 py-2 font-medium">Operation / Product</th>
                <th className="px-3 py-2 font-medium">Operator (Device)</th>
                <th className="px-3 py-2 font-medium">Machine</th>
                <th className="px-3 py-2 font-medium text-right">Progress</th>
                <th className="px-3 py-2 font-medium">Elapsed</th>
                <th className="px-3 py-2 font-medium">QC</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map(wo => (
                <tr key={wo.wo} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{wo.wo}</td>
                  <td className="px-3 py-2"><p className="font-medium">{wo.op}</p><p className="text-[10px] text-muted-foreground">{wo.product}</p></td>
                  <td className="px-3 py-2"><p>{wo.operator}</p><p className="text-[10px] text-muted-foreground font-mono">{wo.device}</p></td>
                  <td className="px-3 py-2 text-[11px]">{wo.machine}</td>
                  <td className="px-3 py-2 text-right">
                    <p className="font-medium">{wo.actual} / {wo.planned} {wo.uom}</p>
                    {wo.scrap > 0 && <p className="text-[10px] text-rose-600">Scrap: {wo.scrap}</p>}
                    <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden w-20 ml-auto">
                      <div className="h-full bg-blue-500" style={{ width: `${wo.planned > 0 ? (wo.actual / wo.planned) * 100 : 0}%` }} />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-[11px]">{wo.elapsed || '—'}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${qcColors[wo.qcStatus]}`}>{wo.qcStatus}</span></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColors[wo.status]}`}>{wo.status.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {wo.status === 'IN_PROGRESS' && <Button size="sm" variant="ghost" className="h-7 text-[11px] text-purple-600">Pause</Button>}
                      {wo.status === 'PAUSED' && <Button size="sm" variant="ghost" className="h-7 text-[11px] text-blue-600">Resume</Button>}
                      {wo.status === 'PENDING' && <Button size="sm" variant="ghost" className="h-7 text-[11px] text-emerald-600">Start</Button>}
                      <Button size="sm" variant="ghost" className="h-7 text-[11px]"><Eye className="h-3 w-3" /></Button>
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

// ─── Mobile Quality Center ──────────────────────────────────────────────
function MobileQualityCenterModule() {
  const recentChecks = [
    { code: 'QC-001', wo: 'WO-002', batch: 'SHW-THN-20260709-000047', type: 'WEIGHT', stage: 'MIXING', measured: 100, target: 100, unit: 'KG', result: 'PASS', operator: 'Anil Reddy', device: 'DEV-ZEBRA-002', time: '07:45' },
    { code: 'QC-002', wo: 'WO-001', batch: 'KAJ-THN-20260709-000145', type: 'TEMPERATURE', stage: 'COOKING', measured: 110, target: 110, unit: '°C', result: 'PASS', operator: 'Rajesh Kumar', device: 'DEV-ZEBRA-001', time: '07:15' },
    { code: 'QC-003', wo: 'WO-004', batch: 'NAM-THN-20260709-000021', type: 'VISUAL', stage: 'FRYING', measured: null, target: null, unit: '', result: 'PASS', operator: 'Suresh Mehta', device: 'DEV-HON-001', time: '06:30' },
    { code: 'QC-004', wo: 'WO-003', batch: 'MOT-THN-20260708-000032', type: 'WEIGHT', stage: 'PACKING', measured: 0.98, target: 1, unit: 'KG', result: 'FAIL', operator: 'Vijay Patel', device: 'DEV-ZEBRA-003', time: '08:20' },
    { code: 'QC-005', wo: 'WO-004', batch: 'NAM-THN-20260709-000021', type: 'METAL_DETECTOR', stage: 'PACKING', measured: null, target: null, unit: '', result: 'PASS', operator: 'Suresh Mehta', device: 'DEV-HON-001', time: '07:50' },
    { code: 'QC-006', wo: 'WO-002', batch: 'SHW-THN-20260709-000047', type: 'TASTE', stage: 'FINISHED', measured: null, target: null, unit: '', result: 'PASS', operator: 'Lakshmi V. (Supervisor)', device: 'DEV-CHN-001', time: '08:00' },
  ]
  const checkTypes = [
    { type: 'TEMPERATURE', icon: '🌡️', count: 4, passRate: 100 },
    { type: 'WEIGHT', icon: '⚖️', count: 6, passRate: 83 },
    { type: 'DIMENSIONS', icon: '📏', count: 0, passRate: 0 },
    { type: 'VISUAL', icon: '👁️', count: 3, passRate: 100 },
    { type: 'TASTE', icon: '👅', count: 1, passRate: 100 },
    { type: 'PACKAGING', icon: '📦', count: 2, passRate: 100 },
    { type: 'METAL_DETECTOR', icon: '🔍', count: 1, passRate: 100 },
    { type: 'SEAL_VERIFICATION', icon: '🔐', count: 1, passRate: 100 },
  ]
  const resultColors: Record<string, string> = { PASS: 'bg-emerald-100 text-emerald-700', FAIL: 'bg-rose-100 text-rose-700', REWORK: 'bg-amber-100 text-amber-700', HOLD: 'bg-purple-100 text-purple-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-purple-600" />Quality Center (Mobile)</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 40 · Quality checkpoints captured from mobile devices · 8 check types enforced</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Checks', value: 18, color: 'text-blue-600' },
          { label: 'Pass', value: 17, color: 'text-emerald-600' },
          { label: 'Fail', value: 1, color: 'text-rose-600' },
          { label: 'Pass Rate', value: '94.4%', color: 'text-emerald-600' },
          { label: 'Hold Count', value: 0, color: 'text-purple-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Check Type Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {checkTypes.filter(c => c.count > 0).map(c => (
            <div key={c.type} className="p-3 rounded-lg border bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xl">{c.icon}</span>
                <span className="text-xs font-bold">{c.count}</span>
              </div>
              <p className="text-xs font-medium mt-1">{c.type.replace(/_/g, ' ')}</p>
              <p className="text-[10px] text-muted-foreground">Pass rate: {c.passRate}%</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Recent Quality Checks (from Mobile)</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">QC Code</th>
                <th className="px-3 py-2 font-medium">WO / Batch</th>
                <th className="px-3 py-2 font-medium">Type / Stage</th>
                <th className="px-3 py-2 font-medium text-center">Measured / Target</th>
                <th className="px-3 py-2 font-medium">Operator (Device)</th>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {recentChecks.map(qc => (
                <tr key={qc.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-blue-700">{qc.code}</td>
                  <td className="px-3 py-2"><p className="font-mono text-[11px] text-blue-700">{qc.wo}</p><p className="text-[10px] text-muted-foreground">{qc.batch}</p></td>
                  <td className="px-3 py-2"><p className="font-medium">{qc.type.replace(/_/g, ' ')}</p><p className="text-[10px] text-muted-foreground">{qc.stage}</p></td>
                  <td className="px-3 py-2 text-center">{qc.measured !== null ? `${qc.measured} ${qc.unit} / ${qc.target} ${qc.unit}` : 'Visual / Pass'}</td>
                  <td className="px-3 py-2"><p>{qc.operator}</p><p className="text-[10px] text-muted-foreground font-mono">{qc.device}</p></td>
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

// ─── Label Print Jobs ───────────────────────────────────────────────────
function LabelPrintJobsModule() {
  const printJobs = [
    { code: 'LPJ-001', label: 'LBL-001', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', type: 'PRODUCTION_BATCH', printer: 'Zebra ZD420 (BT)', copies: 2, duration: 1240, status: 'COMPLETED', operator: 'Rajesh K.', time: '08:05' },
    { code: 'LPJ-002', label: 'LBL-002', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', type: 'PALLET_LABEL', printer: 'Zebra ZD420 (BT)', copies: 1, duration: 980, status: 'COMPLETED', operator: 'Rajesh K.', time: '08:06' },
    { code: 'LPJ-003', label: 'LBL-003', batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', type: 'PRODUCTION_BATCH', printer: 'Zebra ZD620 (Network)', copies: 1, duration: 1450, status: 'COMPLETED', operator: 'Anil R.', time: '08:15' },
    { code: 'LPJ-004', label: 'LBL-004', batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', type: 'PRODUCTION_BATCH', printer: 'Honeywell PC42t', copies: 4, duration: 1820, status: 'COMPLETED', operator: 'Suresh M.', time: '07:50' },
    { code: 'LPJ-005', label: 'LBL-005', batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', type: 'PRODUCTION_BATCH', printer: 'Zebra ZD420 (BT)', copies: 2, duration: null, status: 'QUEUED', operator: 'Vijay P.', time: '—' },
    { code: 'LPJ-006', label: 'LBL-006', batch: 'GUL-THN-20260708-000018', product: 'Gulab Jamun 1kg', type: 'DISPLAY_BOX_LABEL', printer: 'Zebra ZD620 (Network)', copies: 6, duration: 2100, status: 'FAILED', operator: 'Lakshmi V.', time: '07:30' },
  ]
  const statusColors: Record<string, string> = { COMPLETED: 'bg-emerald-100 text-emerald-700', QUEUED: 'bg-slate-100 text-slate-700', PRINTING: 'bg-blue-100 text-blue-700', FAILED: 'bg-rose-100 text-rose-700', CANCELLED: 'bg-zinc-100 text-zinc-700' }
  const labelTypeColors: Record<string, string> = { PRODUCTION_BATCH: 'bg-emerald-100 text-emerald-700', PALLET_LABEL: 'bg-purple-100 text-purple-700', DISPLAY_BOX_LABEL: 'bg-amber-100 text-amber-700', QR_LABEL: 'bg-cyan-100 text-cyan-700', BARCODE_LABEL: 'bg-blue-100 text-blue-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Printer className="h-6 w-6 text-amber-600" />Label Print Jobs</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 40 · Auto-printed batch + pallet labels · Target &lt;2 sec per label</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Jobs', value: 16, color: 'text-blue-600' },
          { label: 'Completed', value: 14, color: 'text-emerald-600' },
          { label: 'Queued', value: 1, color: 'text-slate-600' },
          { label: 'Failed', value: 1, color: 'text-rose-600' },
          { label: 'Avg Duration', value: '1.4s', color: 'text-emerald-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4 bg-amber-50/50 border-amber-200">
        <div className="flex items-start gap-3">
          <Printer className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Supported Printers</p>
            <p className="text-xs text-muted-foreground mt-1">Bluetooth (Zebra ZD420, Honeywell PC42t) · Network (Zebra ZD620, SATO CL4NX) · Industrial (Zebra 110Xi4, Sato CL4NX) · All labels support QR + CODE_128 + GS1-128 + GS1 DataMatrix</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Job Code</th>
                <th className="px-3 py-2 font-medium">Batch / Product</th>
                <th className="px-3 py-2 font-medium">Label Type</th>
                <th className="px-3 py-2 font-medium">Printer</th>
                <th className="px-3 py-2 font-medium text-center">Copies</th>
                <th className="px-3 py-2 font-medium text-center">Duration</th>
                <th className="px-3 py-2 font-medium">Operator</th>
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {printJobs.map(j => (
                <tr key={j.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{j.code}</td>
                  <td className="px-3 py-2"><p className="font-mono text-[11px] text-blue-700">{j.batch}</p><p className="text-[10px] text-muted-foreground">{j.product}</p></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${labelTypeColors[j.type]}`}>{j.type.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 text-[11px]">{j.printer}</td>
                  <td className="px-3 py-2 text-center">{j.copies}</td>
                  <td className="px-3 py-2 text-center">{j.duration ? `${(j.duration / 1000).toFixed(2)}s` : '—'}</td>
                  <td className="px-3 py-2">{j.operator}</td>
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

// ─── Production Device Manager ──────────────────────────────────────────
function ProdDeviceMgrModule() {
  const devices = [
    { code: 'DEV-ZEBRA-001', name: 'Zebra TC52', type: 'ZEBRA_TC', manufacturer: 'Zebra', model: 'TC52', serial: 'SN-TC52-001', android: 'Android 13', operator: 'Rajesh Kumar', plant: 'THN', line: 'LINE-KK-01', wc: 'WC-KK-03', battery: 87, status: 'ACTIVE', lastSeen: '1 min ago', encrypted: true, locked: false },
    { code: 'DEV-ZEBRA-002', name: 'Zebra TC52', type: 'ZEBRA_TC', manufacturer: 'Zebra', model: 'TC52', serial: 'SN-TC52-002', android: 'Android 13', operator: 'Anil Reddy', plant: 'THN', line: 'LINE-IB-01', wc: 'WC-IB-02', battery: 64, status: 'ACTIVE', lastSeen: '30 sec ago', encrypted: true, locked: false },
    { code: 'DEV-HON-001', name: 'Honeywell CT60', type: 'HONEYWELL', manufacturer: 'Honeywell', model: 'CT60', serial: 'SN-CT60-001', android: 'Android 12', operator: 'Suresh Mehta', plant: 'THN', line: 'LINE-NM-01', wc: 'WC-NM-04', battery: 92, status: 'ACTIVE', lastSeen: '2 min ago', encrypted: true, locked: false },
    { code: 'DEV-ZEBRA-003', name: 'Zebra TC57', type: 'ZEBRA_TC', manufacturer: 'Zebra', model: 'TC57', serial: 'SN-TC57-001', android: 'Android 14', operator: 'Vijay Patel', plant: 'THN', line: 'LINE-KK-01', wc: 'WC-KK-08', battery: 23, status: 'ACTIVE', lastSeen: '18 min ago', encrypted: true, locked: false },
    { code: 'DEV-CHN-001', name: 'Chainway C72', type: 'CHAINWAY', manufacturer: 'Chainway', model: 'C72', serial: 'SN-C72-001', android: 'Android 13', operator: 'Lakshmi V.', plant: 'THN', line: 'ALL', wc: 'ALL', battery: 78, status: 'ACTIVE', lastSeen: '15 sec ago', encrypted: true, locked: false },
    { code: 'DEV-URV-001', name: 'Urovo DT50', type: 'UROVO', manufacturer: 'Urovo', model: 'DT50', serial: 'SN-DT50-001', android: 'Android 12', operator: null, plant: 'THN', line: null, wc: null, battery: 100, status: 'INACTIVE', lastSeen: '3 days ago', encrypted: true, locked: false },
  ]
  const statusColors: Record<string, string> = { ACTIVE: 'bg-emerald-100 text-emerald-700', INACTIVE: 'bg-slate-100 text-slate-700', LOCKED: 'bg-rose-100 text-rose-700', WIPED: 'bg-zinc-200 text-zinc-700', RETIRED: 'bg-zinc-300 text-zinc-800' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Smartphone className="h-6 w-6 text-blue-600" />Production Device Manager</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 40 · Device binding · Remote lock / wipe · Encrypted local storage</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />Register Device</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total Devices', value: 6, color: 'text-blue-600' },
          { label: 'Active', value: 5, color: 'text-emerald-600' },
          { label: 'Inactive', value: 1, color: 'text-slate-600' },
          { label: 'Locked', value: 0, color: 'text-rose-600' },
          { label: 'Encrypted', value: '6/6', color: 'text-emerald-600' },
          { label: 'Avg Battery', value: '74%', color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4 bg-blue-50/50 border-blue-200">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Mobile Security Features</p>
            <p className="text-xs text-muted-foreground mt-1">JWT Auth · Device Binding · Encrypted Local Storage · Role-Based Access · Session Timeout (8h) · Remote Logout · Remote Device Lock · Remote Device Wipe · Biometric Login · Offline Login (cached)</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Device Code</th>
                <th className="px-3 py-2 font-medium">Type / Model</th>
                <th className="px-3 py-2 font-medium">Serial / Android</th>
                <th className="px-3 py-2 font-medium">Assigned Operator</th>
                <th className="px-3 py-2 font-medium">Plant / Line / WC</th>
                <th className="px-3 py-2 font-medium text-center">Battery</th>
                <th className="px-3 py-2 font-medium">Last Seen</th>
                <th className="px-3 py-2 font-medium">Security</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map(d => (
                <tr key={d.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-mono text-[11px] text-blue-700">{d.code}</p><p className="text-[10px] text-muted-foreground">{d.name}</p></td>
                  <td className="px-3 py-2"><p className="font-medium">{d.type.replace(/_/g, ' ')}</p><p className="text-[10px] text-muted-foreground">{d.manufacturer} {d.model}</p></td>
                  <td className="px-3 py-2"><p className="font-mono text-[10px]">{d.serial}</p><p className="text-[10px] text-muted-foreground">{d.android}</p></td>
                  <td className="px-3 py-2">{d.operator || <span className="text-muted-foreground italic">Unassigned</span>}</td>
                  <td className="px-3 py-2 text-[11px]">{d.plant} · {d.line || '—'} · {d.wc || '—'}</td>
                  <td className={`px-3 py-2 text-center font-bold ${d.battery >= 50 ? 'text-emerald-600' : d.battery >= 20 ? 'text-amber-600' : 'text-rose-600'}`}>{d.battery}%</td>
                  <td className="px-3 py-2 text-[11px]">{d.lastSeen}</td>
                  <td className="px-3 py-2">{d.encrypted ? <span className="text-[10px] text-emerald-700">🔒 Encrypted</span> : <span className="text-[10px] text-rose-700">🔓 Not Encrypted</span>}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColors[d.status]}`}>{d.status}</span></td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-[11px]"><Eye className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 text-[11px] text-amber-600">Lock</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-[11px] text-rose-600">Wipe</Button>
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

// ─── Production Sync Monitor (Admin) ────────────────────────────────────
function ProdSyncMonitorModule() {
  const syncHistory = [
    { code: 'PSH-001', device: 'DEV-ZEBRA-001', operator: 'Rajesh Kumar', direction: 'BIDIRECTIONAL', total: 12, success: 12, failed: 0, conflicts: 0, duration: 1840, network: 'WIFI', payload: 30, status: 'COMPLETED', when: '2 min ago' },
    { code: 'PSH-002', device: 'DEV-ZEBRA-002', operator: 'Anil Reddy', direction: 'UPLOAD', total: 3, success: 3, failed: 0, conflicts: 0, duration: 620, network: 'WIFI', payload: 8, status: 'COMPLETED', when: '15 min ago' },
    { code: 'PSH-003', device: 'DEV-HON-001', operator: 'Suresh Mehta', direction: 'BIDIRECTIONAL', total: 8, success: 7, failed: 1, conflicts: 1, duration: 2100, network: '4G', payload: 22, status: 'PARTIAL', when: '32 min ago' },
    { code: 'PSH-004', device: 'DEV-ZEBRA-003', operator: 'Vijay Patel', direction: 'UPLOAD', total: 5, success: 5, failed: 0, conflicts: 0, duration: 980, network: 'WIFI', payload: 13, status: 'COMPLETED', when: '45 min ago' },
    { code: 'PSH-005', device: 'DEV-CHN-001', operator: 'Lakshmi V.', direction: 'BIDIRECTIONAL', total: 18, success: 18, failed: 0, conflicts: 0, duration: 2480, network: 'WIFI', payload: 45, status: 'COMPLETED', when: '1 hour ago' },
    { code: 'PSH-006', device: 'DEV-ZEBRA-001', operator: 'Rajesh Kumar', direction: 'UPLOAD', total: 4, success: 3, failed: 1, conflicts: 0, duration: 1340, network: '4G', payload: 10, status: 'PARTIAL', when: '2 hours ago' },
  ]
  const statusColors: Record<string, string> = { COMPLETED: 'bg-emerald-100 text-emerald-700', PARTIAL: 'bg-amber-100 text-amber-700', FAILED: 'bg-rose-100 text-rose-700', IN_PROGRESS: 'bg-blue-100 text-blue-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><RefreshCw className="h-6 w-6 text-cyan-600" />Sync Monitor (Admin)</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 40 · Offline-first synchronization · Target &lt;10 sec recovery · Conflict resolution</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Syncs Today', value: 47, color: 'text-blue-600' },
          { label: 'Successful', value: 45, color: 'text-emerald-600' },
          { label: 'Partial', value: 2, color: 'text-amber-600' },
          { label: 'Avg Duration', value: '1.6s', color: 'text-emerald-600' },
          { label: 'Conflicts', value: 1, color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4 bg-cyan-50/50 border-cyan-200">
        <div className="flex items-start gap-3">
          <RefreshCw className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Offline Sync Capabilities</p>
            <p className="text-xs text-muted-foreground mt-1">Offline Login (cached) · Offline Work Orders (preloaded) · Offline Scanning (queued) · Offline WIP Updates (queued) · Automatic Sync (when online) · Conflict Resolution (server/client/manual) · Retry Queue (max 5 attempts) · Encrypted Local Storage · 7-day expiry on offline transactions</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Sync History (All Devices)</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Sync Code</th>
                <th className="px-3 py-2 font-medium">Device / Operator</th>
                <th className="px-3 py-2 font-medium">Direction</th>
                <th className="px-3 py-2 font-medium text-center">Total</th>
                <th className="px-3 py-2 font-medium text-center">Success</th>
                <th className="px-3 py-2 font-medium text-center">Failed</th>
                <th className="px-3 py-2 font-medium text-center">Conflicts</th>
                <th className="px-3 py-2 font-medium text-center">Duration</th>
                <th className="px-3 py-2 font-medium">Network</th>
                <th className="px-3 py-2 font-medium">When</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {syncHistory.map(s => (
                <tr key={s.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-blue-700">{s.code}</td>
                  <td className="px-3 py-2"><p className="font-mono text-[10px] text-blue-700">{s.device}</p><p className="text-[10px] text-muted-foreground">{s.operator}</p></td>
                  <td className="px-3 py-2 text-[10px]">{s.direction}</td>
                  <td className="px-3 py-2 text-center">{s.total}</td>
                  <td className="px-3 py-2 text-center text-emerald-600 font-medium">{s.success}</td>
                  <td className="px-3 py-2 text-center text-rose-600 font-medium">{s.failed}</td>
                  <td className="px-3 py-2 text-center text-amber-600 font-medium">{s.conflicts}</td>
                  <td className="px-3 py-2 text-center">{(s.duration / 1000).toFixed(2)}s</td>
                  <td className="px-3 py-2 text-[10px]">{s.network}</td>
                  <td className="px-3 py-2 text-[11px]">{s.when}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColors[s.status]}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

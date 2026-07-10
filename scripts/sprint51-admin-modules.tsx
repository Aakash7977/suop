// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 51 — IN-PROCESS QUALITY CONTROL (IPQC) · PROCESS VALIDATION & REAL-TIME PRODUCTION QUALITY
// Admin modules: IPQC Dashboard, Quality Checkpoints by Stage, CCP Monitor, Batch Quality
// Records, Production Quality Hold Center, Real-Time Quality Alerts
// ═══════════════════════════════════════════════════════════════════════════════
// ICON IMPORT NOTE: The following icons are already imported in src/app/page.tsx
// (lines 4–34): ShieldCheck, ClipboardCheck, AlertTriangle, AlertCircle, CheckCircle2,
// X, Clock, Activity, Gauge, Thermometer, Beaker, FlaskConical, FileText, FileWarning,
// Package, PackageX, Bell, BellRing, Siren, History, QrCode.
//
// ADD THESE 5 ICONS to the existing lucide-react import block in src/app/page.tsx
// before inserting this snippet:
//   Pause, Play, StopCircle, Camera, PenTool
//
// CONFLICT NOTE: `IQCDashboardModule` and `IQCHoldModule` already exist in page.tsx
// (Sprint 50 — Supplier Quality). All Sprint 51 modules use the `IPQC` prefix
// (IPQCDashboardModule, IPQCHoldModule, etc.) to avoid naming collisions.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── IPQC Dashboard ──────────────────────────────────────────────────────
function IPQCDashboardModule() {
  const kpis = [
    { label: 'Total Inspections', value: '48', unit: 'today across all lines', icon: ClipboardCheck, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Pending', value: '5', unit: 'awaiting inspector', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'In Progress', value: '3', unit: 'being conducted', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { label: 'Passed', value: '36', unit: 'compliant lots', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Failed', value: '2', unit: 'quality breach', icon: X, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Conditional Pass', value: '2', unit: 'rework approved', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    { label: 'On Hold', value: '3', unit: 'production paused', icon: Pause, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'CCP Checks', value: '124', unit: '122 passed · 2 breach', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Active Holds', value: '3', unit: '2 critical · 1 minor', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Batch Records', value: '24', unit: 'digital quality files', icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
    { label: 'Released Today', value: '8', unit: 'cleared for dispatch', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Inspection Rate', value: '97.8%', unit: 'pass yield', icon: Gauge, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  ]

  const stages = [
    { code: 'RAW_MATERIAL_PREP', name: 'Raw Material Prep', icon: Beaker, color: 'bg-slate-100 text-slate-700 border-slate-300', inspections: 6 },
    { code: 'MIXING', name: 'Mixing', icon: FlaskConical, color: 'bg-blue-100 text-blue-700 border-blue-300', inspections: 8 },
    { code: 'COOKING', name: 'Cooking', icon: Thermometer, color: 'bg-rose-100 text-rose-700 border-rose-300', inspections: 9, ccp: true },
    { code: 'COOLING', name: 'Cooling', icon: Activity, color: 'bg-cyan-100 text-cyan-700 border-cyan-300', inspections: 6, ccp: true },
    { code: 'CUTTING', name: 'Cutting', icon: ClipboardCheck, color: 'bg-amber-100 text-amber-700 border-amber-300', inspections: 5 },
    { code: 'METAL_DETECTION', name: 'Metal Detection', icon: ShieldCheck, color: 'bg-purple-100 text-purple-700 border-purple-300', inspections: 7, ccp: true },
    { code: 'PACKING', name: 'Packing', icon: Package, color: 'bg-emerald-100 text-emerald-700 border-emerald-300', inspections: 7 },
  ]

  const inspections = [
    { code: 'IPQC-2847', batch: 'BATCH-KK-500-26F003', stage: 'COOKING', product: 'Kaju Katli 500g', inspector: 'R. Nair', operator: 'S. Patil', machine: 'COOK-01', shift: 'A', passed: 8, failed: 0, status: 'PASSED', time: '10:42' },
    { code: 'IPQC-2846', batch: 'BATCH-NM-26F007', stage: 'METAL_DETECTION', product: 'Mixed Namkeen 200g', inspector: 'M. Joshi', operator: 'K. Rao', machine: 'MDT-02', shift: 'A', passed: 4, failed: 1, status: 'FAILED', time: '10:18' },
    { code: 'IPQC-2845', batch: 'BATCH-KK-1KG-26F002', stage: 'PACKING', product: 'Kaju Katli 1kg', inspector: 'R. Nair', operator: 'A. Singh', machine: 'PKG-04', shift: 'A', passed: 10, failed: 0, status: 'PASSED', time: '09:55' },
    { code: 'IPQC-2844', batch: 'BATCH-MT-26F011', stage: 'COOKING', product: 'Motichoor Laddu 1kg', inspector: 'P. Verma', operator: 'D. Gupta', machine: 'COOK-03', shift: 'A', passed: 7, failed: 1, status: 'CONDITIONAL_PASS', time: '09:32' },
    { code: 'IPQC-2843', batch: 'BATCH-SIB-26F005', stage: 'COOLING', product: 'Shwet Idli Batter 1kg', inspector: 'S. Iyer', operator: 'V. Kumar', machine: 'CLN-01', shift: 'B', passed: 5, failed: 1, status: 'CONDITIONAL_PASS', time: '09:10' },
    { code: 'IPQC-2842', batch: 'BATCH-NM-26F007', stage: 'COOKING', product: 'Mixed Namkeen 200g', inspector: 'M. Joshi', operator: 'K. Rao', machine: 'COOK-02', shift: 'A', passed: 9, failed: 0, status: 'PASSED', time: '08:48' },
    { code: 'IPQC-2841', batch: 'BATCH-KK-500-26F003', stage: 'RAW_MATERIAL_PREP', product: 'Kaju Katli 500g', inspector: 'R. Nair', operator: 'S. Patil', machine: 'PREP-01', shift: 'A', passed: 6, failed: 0, status: 'PASSED', time: '08:24' },
    { code: 'IPQC-2840', batch: 'BATCH-PB-26F014', stage: 'CUTTING', product: 'Pista Barfi 250g', inspector: 'P. Verma', operator: 'H. Mehta', machine: 'CUT-02', shift: 'A', passed: 5, failed: 0, status: 'PASSED', time: '08:02' },
  ]

  const statusColor: Record<string, string> = {
    PASSED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    FAILED: 'bg-rose-100 text-rose-700 border-rose-300',
    CONDITIONAL_PASS: 'bg-orange-100 text-orange-700 border-orange-300',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-300',
    ON_HOLD: 'bg-rose-100 text-rose-700 border-rose-300',
  }

  const stageColor: Record<string, string> = {
    RAW_MATERIAL_PREP: 'bg-slate-100 text-slate-700 border-slate-300',
    MIXING: 'bg-blue-100 text-blue-700 border-blue-300',
    COOKING: 'bg-rose-100 text-rose-700 border-rose-300',
    COOLING: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    CUTTING: 'bg-amber-100 text-amber-700 border-amber-300',
    METAL_DETECTION: 'bg-purple-100 text-purple-700 border-purple-300',
    PACKING: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  }

  // Chief Architect recommendation — mandatory IPQC checkpoints per product family
  // (Kaju Katli example with 10 sequential checkpoints)
  const kajuKatliCheckpoints = [
    { seq: 1, code: 'CP-KK-01', name: 'Raw Material Verification', stage: 'RAW_MATERIAL_PREP', type: 'DOCUMENT', severity: 'MAJOR' },
    { seq: 2, code: 'CP-KK-02', name: 'Cashew Paste Consistency', stage: 'MIXING', type: 'TEXTURE', severity: 'MAJOR' },
    { seq: 3, code: 'CCP-01', name: 'Cooking Temperature (110°C)', stage: 'COOKING', type: 'TEMPERATURE', severity: 'CRITICAL', ccp: true },
    { seq: 4, code: 'CP-KK-04', name: 'Brix / Sugar Syrup Concentration', stage: 'COOKING', type: 'BRIX', severity: 'MAJOR' },
    { seq: 5, code: 'CCP-03', name: 'Cooling Temperature (24°C)', stage: 'COOLING', type: 'TEMPERATURE', severity: 'CRITICAL', ccp: true },
    { seq: 6, code: 'CP-KK-06', name: 'Sheet Thickness (8mm)', stage: 'COOLING', type: 'DIMENSION', severity: 'MINOR' },
    { seq: 7, code: 'CP-KK-07', name: 'Piece Weight (12g ± 0.5g)', stage: 'CUTTING', type: 'WEIGHT', severity: 'MAJOR' },
    { seq: 8, code: 'CP-KK-08', name: 'Silver Leaf Coverage', stage: 'CUTTING', type: 'VISUAL', severity: 'MINOR' },
    { seq: 9, code: 'CCP-02', name: 'Metal Detection (Fe/Non-Fe/SS)', stage: 'METAL_DETECTION', type: 'METAL_DETECTION', severity: 'CRITICAL', ccp: true },
    { seq: 10, code: 'CP-KK-10', name: 'Packing Integrity Approval', stage: 'PACKING', type: 'PACKAGING', severity: 'MAJOR' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-emerald-600" />IPQC Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 51 · In-Process Quality Control · 48 inspections today · 124 CCP checks · 3 active quality holds · 8 batches released · Real-time production quality across 7 stages</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Inspection Log</Button>
          <Button size="sm" variant="outline"><Camera className="mr-1 h-4 w-4" />Photo Evidence</Button>
          <Button size="sm"><ClipboardCheck className="mr-1 h-4 w-4" />New Inspection</Button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className={`p-4 border ${kpi.bg}`}>
            <div className="flex items-start justify-between">
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              <span className="text-2xl font-bold text-foreground">{kpi.value}</span>
            </div>
            <p className="text-xs font-semibold mt-2 text-foreground">{kpi.label}</p>
            <p className="text-[10px] text-muted-foreground">{kpi.unit}</p>
          </Card>
        ))}
      </div>

      {/* Production stage flow visualization */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><Activity className="h-4 w-4 text-blue-600" />Production Stage Flow · Live Inspection Distribution</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Sequential 7-stage manufacturing pipeline · 3 stages carry CCPs (Cooking, Cooling, Metal Detection)</p>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />Real-time
          </Badge>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {stages.map((stage, i) => (
            <div key={stage.code} className="flex items-center gap-1 shrink-0">
              <div className={`rounded-lg border ${stage.color} px-3 py-2 min-w-[140px]`}>
                <div className="flex items-center gap-1.5">
                  <stage.icon className="h-3.5 w-3.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wide">{stage.code.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-semibold">{stage.inspections} insp.</span>
                  {stage.ccp && (
                    <Badge variant="outline" className="h-4 px-1 text-[9px] bg-rose-50 text-rose-700 border-rose-300">CCP</Badge>
                  )}
                </div>
              </div>
              {i < stages.length - 1 && (
                <span className="text-slate-400 text-lg">→</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Recent inspections table */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-blue-600" />Recent IPQC Inspections</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Last 8 inspections · Sorted by time descending · Click any row to open digital inspection record</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">Filter</Button>
            <Button size="sm" variant="outline">Export CSV</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3 font-semibold">Code</th>
                <th className="py-2 pr-3 font-semibold">Batch</th>
                <th className="py-2 pr-3 font-semibold">Stage</th>
                <th className="py-2 pr-3 font-semibold">Product</th>
                <th className="py-2 pr-3 font-semibold">Inspector</th>
                <th className="py-2 pr-3 font-semibold">Operator</th>
                <th className="py-2 pr-3 font-semibold">Machine</th>
                <th className="py-2 pr-3 font-semibold">Shift</th>
                <th className="py-2 pr-3 font-semibold text-center">Checkpoints</th>
                <th className="py-2 pr-3 font-semibold">Status</th>
                <th className="py-2 pr-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map((row) => (
                <tr key={row.code} className="border-b hover:bg-muted/50">
                  <td className="py-2 pr-3 font-mono font-semibold text-blue-600">{row.code}</td>
                  <td className="py-2 pr-3 font-mono text-[11px]">{row.batch}</td>
                  <td className="py-2 pr-3">
                    <Badge variant="outline" className={`text-[10px] ${stageColor[row.stage]}`}>{row.stage.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="py-2 pr-3">{row.product}</td>
                  <td className="py-2 pr-3">{row.inspector}</td>
                  <td className="py-2 pr-3">{row.operator}</td>
                  <td className="py-2 pr-3 font-mono text-[11px]">{row.machine}</td>
                  <td className="py-2 pr-3 text-center">
                    <Badge variant="outline" className="text-[10px]">{row.shift}</Badge>
                  </td>
                  <td className="py-2 pr-3 text-center">
                    <span className="text-emerald-600 font-semibold">{row.passed}</span>
                    <span className="text-muted-foreground mx-0.5">/</span>
                    {row.failed > 0 ? (
                      <span className="text-rose-600 font-semibold">{row.failed}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    <Badge variant="outline" className={`text-[10px] ${statusColor[row.status]}`}>{row.status.replace(/_/g, ' ')}</Badge>
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Chief Architect recommendation: mandatory IPQC checkpoints per product family */}
      <Card className="p-5 border-emerald-200 bg-emerald-50/30">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" />Chief Architect Recommendation · Mandatory IPQC Checkpoints per Product Family</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Each product family must declare a fixed sequence of mandatory checkpoints tied to its production routing. CCPs are non-skippable; breach = automatic production halt.</p>
          </div>
          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">Example: Kaju Katli · 10 Checkpoints · 3 CCPs</Badge>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {kajuKatliCheckpoints.map((cp, i) => (
            <div key={cp.code} className="flex items-center gap-2 shrink-0">
              <div className={`rounded-lg border px-3 py-2 min-w-[150px] ${cp.ccp ? 'border-rose-300 bg-rose-50' : cp.severity === 'CRITICAL' ? 'border-rose-300 bg-rose-50' : cp.severity === 'MAJOR' ? 'border-amber-300 bg-amber-50' : 'border-slate-300 bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500">#{cp.seq}</span>
                  {cp.ccp && <Badge variant="outline" className="h-4 px-1 text-[9px] bg-rose-100 text-rose-700 border-rose-300">CCP</Badge>}
                </div>
                <p className="text-xs font-semibold mt-1 text-foreground leading-tight">{cp.name}</p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground mt-1">{cp.stage.replace(/_/g, ' ')}</p>
                <p className="text-[10px] font-mono text-blue-600 mt-0.5">{cp.code}</p>
                <Badge variant="outline" className={`mt-1 h-4 px-1 text-[9px] ${cp.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700 border-rose-300' : cp.severity === 'MAJOR' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>{cp.severity}</Badge>
              </div>
              {i < kajuKatliCheckpoints.length - 1 && (
                <span className="text-emerald-500 text-lg">→</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-emerald-200 bg-white p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-rose-600" />
              <p className="text-xs font-bold text-rose-700">3 Critical Control Points (CCPs)</p>
            </div>
            <p className="text-[11px] text-muted-foreground">Cooking Temp (CCP-01), Metal Detection (CCP-02), Cooling Temp (CCP-03) — any breach halts the line instantly.</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-white p-3">
            <div className="flex items-center gap-2 mb-1">
              <ClipboardCheck className="h-3.5 w-3.5 text-amber-600" />
              <p className="text-xs font-bold text-amber-700">4 Major Severity Checkpoints</p>
            </div>
            <p className="text-[11px] text-muted-foreground">Raw material verification, cashew paste, brix, piece weight, packing integrity — recorded but non-blocking.</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-white p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-600" />
              <p className="text-xs font-bold text-slate-700">3 Minor Severity Checkpoints</p>
            </div>
            <p className="text-[11px] text-muted-foreground">Sheet thickness, silver leaf coverage — observation only, logged for trend analytics.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── IPQC Quality Checkpoints by Stage ──────────────────────────────────
function IPQCCheckpointsModule() {
  const checkpoints = [
    { seq: 1, code: 'CP-KK-01', name: 'Raw Material Verification', stage: 'RAW_MATERIAL_PREP', family: 'Kaju Katli', type: 'DOCUMENT', target: 'Lot match + QC pass', unit: '—', severity: 'MAJOR', mandatory: true, ccp: false },
    { seq: 2, code: 'CP-KK-02', name: 'Cashew Paste Consistency', stage: 'MIXING', family: 'Kaju Katli', type: 'TEXTURE', target: 'Smooth, no lumps', unit: 'visual', severity: 'MAJOR', mandatory: true, ccp: false },
    { seq: 3, code: 'CCP-01', name: 'Cooking Temperature', stage: 'COOKING', family: 'Kaju Katli', type: 'TEMPERATURE', target: '110', min: '108', max: '112', unit: '°C', severity: 'CRITICAL', mandatory: true, ccp: true },
    { seq: 4, code: 'CP-KK-04', name: 'Brix / Sugar Syrup Concentration', stage: 'COOKING', family: 'Kaju Katli', type: 'BRIX', target: '78', min: '76', max: '80', unit: '°Bx', severity: 'MAJOR', mandatory: true, ccp: false },
    { seq: 5, code: 'CCP-03', name: 'Cooling Temperature', stage: 'COOLING', family: 'Kaju Katli', type: 'TEMPERATURE', target: '24', min: '22', max: '26', unit: '°C', severity: 'CRITICAL', mandatory: true, ccp: true },
    { seq: 6, code: 'CP-KK-06', name: 'Sheet Thickness', stage: 'COOLING', family: 'Kaju Katli', type: 'DIMENSION', target: '8', min: '7.5', max: '8.5', unit: 'mm', severity: 'MINOR', mandatory: false, ccp: false },
    { seq: 7, code: 'CP-KK-07', name: 'Piece Weight', stage: 'CUTTING', family: 'Kaju Katli', type: 'WEIGHT', target: '12', min: '11.5', max: '12.5', unit: 'g', severity: 'MAJOR', mandatory: true, ccp: false },
    { seq: 8, code: 'CP-KK-08', name: 'Silver Leaf Coverage', stage: 'CUTTING', family: 'Kaju Katli', type: 'VISUAL', target: '≥95%', unit: '%', severity: 'MINOR', mandatory: false, ccp: false },
    { seq: 9, code: 'CCP-02', name: 'Metal Detection (Fe / Non-Fe / SS)', stage: 'METAL_DETECTION', family: 'Kaju Katli', type: 'METAL_DETECTION', target: 'PASS', min: '—', max: '—', unit: 'Pass/Fail', severity: 'CRITICAL', mandatory: true, ccp: true },
    { seq: 10, code: 'CP-KK-10', name: 'Packing Integrity Approval', stage: 'PACKING', family: 'Kaju Katli', type: 'PACKAGING', target: 'Seal + weight + label', unit: '—', severity: 'MAJOR', mandatory: true, ccp: false },
  ]

  const productionStages = [
    { code: 'RAW_MATERIAL_PREP', name: 'Raw Material Preparation', checkpoints: 1, color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { code: 'MIXING', name: 'Mixing & Blending', checkpoints: 1, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { code: 'COOKING', name: 'Cooking / Frying', checkpoints: 2, color: 'bg-rose-100 text-rose-700 border-rose-300' },
    { code: 'COOLING', name: 'Cooling / Setting', checkpoints: 2, color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { code: 'CUTTING', name: 'Cutting / Portioning', checkpoints: 2, color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { code: 'METAL_DETECTION', name: 'Metal Detection', checkpoints: 1, color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { code: 'PACKING', name: 'Packing & Sealing', checkpoints: 1, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { code: 'LABELING', name: 'Labeling & Coding', checkpoints: 0, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { code: 'DISPATCH', name: 'Dispatch Readiness', checkpoints: 0, color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300' },
  ]

  const checkpointTypes = [
    { type: 'DOCUMENT', desc: 'Verify lot, supplier QC pass, certificate of analysis', icon: FileText, color: 'text-slate-600' },
    { type: 'TEMPERATURE', desc: 'Probe or RTD reading vs min/max critical band', icon: Thermometer, color: 'text-rose-600' },
    { type: 'BRIX', desc: 'Refractometer reading of sugar syrup concentration', icon: Beaker, color: 'text-amber-600' },
    { type: 'TEXTURE', desc: 'Sensory or instrumental texture check', icon: Activity, color: 'text-blue-600' },
    { type: 'DIMENSION', desc: 'Caliper or template-based physical dimension', icon: Gauge, color: 'text-cyan-600' },
    { type: 'WEIGHT', desc: 'Balance reading vs target ± tolerance', icon: Gauge, color: 'text-indigo-600' },
    { type: 'VISUAL', desc: 'Inspector visual inspection against sample', icon: ClipboardCheck, color: 'text-purple-600' },
    { type: 'METAL_DETECTION', desc: 'Ferrous, non-ferrous, stainless steel detector pass/fail', icon: ShieldCheck, color: 'text-rose-600' },
    { type: 'PACKAGING', desc: 'Seal integrity, net weight, label verification', icon: Package, color: 'text-emerald-600' },
    { type: 'CHEMICAL', desc: 'pH, moisture, aw or titration analysis', icon: FlaskConical, color: 'text-orange-600' },
  ]

  const severityColor: Record<string, string> = {
    CRITICAL: 'bg-rose-100 text-rose-700 border-rose-300',
    MAJOR: 'bg-amber-100 text-amber-700 border-amber-300',
    MINOR: 'bg-slate-100 text-slate-700 border-slate-300',
  }

  const rowBorder = (cp: typeof checkpoints[number]) => {
    if (cp.ccp) return 'border-l-4 border-l-rose-500 bg-rose-50/30'
    if (cp.severity === 'CRITICAL') return 'border-l-4 border-l-rose-500'
    if (cp.severity === 'MAJOR') return 'border-l-4 border-l-amber-500'
    return 'border-l-4 border-l-slate-400'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ClipboardCheck className="h-6 w-6 text-blue-600" />Quality Checkpoints by Stage</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 51 · Mandatory IPQC checkpoint templates per product family · Color-coded by CCP flag and severity · Sequence-ordered across 7 production stages</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Checkpoint Library</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Checkpoint</Button>
        </div>
      </div>

      {/* Production stages overview */}
      <Card className="p-5">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-blue-600" />9 Production Stages · Checkpoint Distribution</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
          {productionStages.map((s) => (
            <div key={s.code} className={`rounded-lg border ${s.color} px-2 py-2 text-center`}>
              <p className="text-[9px] uppercase font-bold tracking-wide">{s.code.replace(/_/g, ' ')}</p>
              <p className="text-base font-bold mt-0.5">{s.checkpoints}</p>
              <p className="text-[9px] text-muted-foreground">checkpoints</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Checkpoint types reference */}
      <Card className="p-5">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Gauge className="h-4 w-4 text-indigo-600" />10 Checkpoint Types · Measurement Methodology</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
          {checkpointTypes.map((t) => (
            <div key={t.type} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <t.icon className={`h-3.5 w-3.5 ${t.color}`} />
                <span className="text-[10px] uppercase font-bold tracking-wide text-foreground">{t.type.replace(/_/g, ' ')}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">{t.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Checkpoint table */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-emerald-600" />Kaju Katli · 10 Sequential Checkpoints · 3 CCPs · 4 MAJOR · 3 MINOR</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Sequence order enforces production routing · CCP breach = automatic line halt · Non-mandatory checkpoints may be skipped with supervisor override</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300"><span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1" />CCP</Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1" />MAJOR</Badge>
            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-slate-500 mr-1" />MINOR</Badge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-3 font-semibold">#</th>
                <th className="py-2 pr-3 font-semibold">Code</th>
                <th className="py-2 pr-3 font-semibold">Checkpoint Name</th>
                <th className="py-2 pr-3 font-semibold">Stage</th>
                <th className="py-2 pr-3 font-semibold">Family</th>
                <th className="py-2 pr-3 font-semibold">Type</th>
                <th className="py-2 pr-3 font-semibold text-center">Min</th>
                <th className="py-2 pr-3 font-semibold text-center">Target</th>
                <th className="py-2 pr-3 font-semibold text-center">Max</th>
                <th className="py-2 pr-3 font-semibold">Unit</th>
                <th className="py-2 pr-3 font-semibold">Severity</th>
                <th className="py-2 pr-3 font-semibold text-center">Mandatory</th>
                <th className="py-2 pr-3 font-semibold text-center">CCP</th>
              </tr>
            </thead>
            <tbody>
              {checkpoints.map((cp) => (
                <tr key={cp.code} className={`border-b hover:bg-muted/50 ${rowBorder(cp)}`}>
                  <td className="py-2 pr-3 font-bold text-slate-500">{cp.seq}</td>
                  <td className="py-2 pr-3 font-mono font-semibold text-blue-600">{cp.code}</td>
                  <td className="py-2 pr-3 font-medium">{cp.name}</td>
                  <td className="py-2 pr-3 text-[10px] uppercase font-semibold text-muted-foreground">{cp.stage.replace(/_/g, ' ')}</td>
                  <td className="py-2 pr-3">{cp.family}</td>
                  <td className="py-2 pr-3"><Badge variant="outline" className="text-[10px]">{cp.type.replace(/_/g, ' ')}</Badge></td>
                  <td className="py-2 pr-3 text-center font-mono text-slate-500">{cp.min ?? '—'}</td>
                  <td className="py-2 pr-3 text-center font-mono font-bold text-foreground">{cp.target}</td>
                  <td className="py-2 pr-3 text-center font-mono text-slate-500">{cp.max ?? '—'}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{cp.unit}</td>
                  <td className="py-2 pr-3">
                    <Badge variant="outline" className={`text-[10px] ${severityColor[cp.severity]}`}>{cp.severity}</Badge>
                  </td>
                  <td className="py-2 pr-3 text-center">
                    {cp.mandatory ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 inline" />
                    ) : (
                      <span className="text-muted-foreground text-[10px]">Optional</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-center">
                    {cp.ccp ? (
                      <Badge variant="outline" className="text-[10px] bg-rose-100 text-rose-700 border-rose-300">CCP</Badge>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Severity Matrix:</span> CRITICAL (CCP) — breach triggers immediate production stop and automatic quality hold. MAJOR — breach logged, requires supervisor review before continuation. MINOR — observation only, trended for analytics but does not block flow.
          </p>
        </div>
      </Card>
    </div>
  )
}

// ─── IPQC CCP Monitor ───────────────────────────────────────────────────
function IPQCCCPModule() {
  const ccps = [
    {
      code: 'CCP-01', name: 'Cooking Temperature', stage: 'COOKING', product: 'Kaju Katli 500g',
      target: 110, min: 108, max: 112, unit: '°C', lastReading: 110, status: 'WITHIN_LIMIT',
      checkedAt: '10:42', checkedBy: 'R. Nair', machine: 'COOK-01', batch: 'BATCH-KK-500-26F003',
      correctiveAction: 'No action required — reading within spec.',
    },
    {
      code: 'CCP-02', name: 'Metal Detection (Fe / Non-Fe / SS)', stage: 'METAL_DETECTION', product: 'Mixed Namkeen 200g',
      target: 'PASS', min: '—', max: '—', unit: 'Pass/Fail', lastReading: 'PASS', status: 'WITHIN_LIMIT',
      checkedAt: '10:18', checkedBy: 'M. Joshi', machine: 'MDT-02', batch: 'BATCH-NM-26F007',
      correctiveAction: 'No action required — test piece detected and rejected.',
    },
    {
      code: 'CCP-03', name: 'Cooling Temperature', stage: 'COOLING', product: 'Kaju Katli 500g',
      target: 24, min: 22, max: 26, unit: '°C', lastReading: 24, status: 'WITHIN_LIMIT',
      checkedAt: '10:55', checkedBy: 'R. Nair', machine: 'CLN-02', batch: 'BATCH-KK-500-26F003',
      correctiveAction: 'No action required — ambient cooling effective.',
    },
    {
      code: 'CCP-04', name: 'Frying Oil Temperature', stage: 'COOKING', product: 'Mixed Namkeen 200g',
      target: 180, min: 175, max: 185, unit: '°C', lastReading: 182, status: 'WITHIN_LIMIT',
      checkedAt: '09:48', checkedBy: 'M. Joshi', machine: 'FRY-01', batch: 'BATCH-NM-26F007',
      correctiveAction: 'No action required — oil thermostat stable.',
    },
    {
      code: 'CCP-05', name: 'Packaging Seal Integrity', stage: 'PACKING', product: 'Kaju Katli 1kg',
      target: 'PASS', min: '—', max: '—', unit: 'Pass/Fail', lastReading: 'PASS', status: 'WITHIN_LIMIT',
      checkedAt: '09:55', checkedBy: 'R. Nair', machine: 'PKG-04', batch: 'BATCH-KK-1KG-26F002',
      correctiveAction: 'No action required — seal strength 4.2 N/15mm.',
    },
    {
      code: 'CCP-06', name: 'Storage Temperature', stage: 'COOLING', product: 'Shwet Idli Batter 1kg',
      target: 4, min: 2, max: 6, unit: '°C', lastReading: 4, status: 'WITHIN_LIMIT',
      checkedAt: '08:30', checkedBy: 'S. Iyer', machine: 'COLD-STORE-A', batch: 'BATCH-SIB-26F005',
      correctiveAction: 'No action required — cold store thermostat nominal.',
    },
  ]

  const statusColor: Record<string, string> = {
    WITHIN_LIMIT: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    WARNING: 'bg-amber-100 text-amber-700 border-amber-300',
    CRITICAL_BREACH: 'bg-rose-100 text-rose-700 border-rose-300',
  }

  const statusIcon: Record<string, typeof CheckCircle2> = {
    WITHIN_LIMIT: CheckCircle2,
    WARNING: AlertTriangle,
    CRITICAL_BREACH: AlertCircle,
  }

  const cardBorder: Record<string, string> = {
    WITHIN_LIMIT: 'border-emerald-200',
    WARNING: 'border-amber-300 bg-amber-50/30',
    CRITICAL_BREACH: 'border-rose-300 bg-rose-50/30',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-rose-600" />CCP Monitor</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 51 · Critical Control Points real-time monitoring · 6 active CCPs · 6 within limit · 0 warnings · 0 breaches · Auto-halt on critical breach</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />Live
          </Badge>
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />CCP Log</Button>
          <Button size="sm"><ShieldCheck className="mr-1 h-4 w-4" />Manual CCP Check</Button>
        </div>
      </div>

      {/* CCP summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border-rose-200 bg-rose-50">
          <div className="flex items-start justify-between">
            <ShieldCheck className="h-5 w-5 text-rose-600" />
            <span className="text-2xl font-bold text-rose-600">6</span>
          </div>
          <p className="text-xs font-semibold mt-2">Active CCPs</p>
          <p className="text-[10px] text-muted-foreground">across 4 stages</p>
        </Card>
        <Card className="p-4 border-emerald-200 bg-emerald-50">
          <div className="flex items-start justify-between">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-600">6</span>
          </div>
          <p className="text-xs font-semibold mt-2">Within Limit</p>
          <p className="text-[10px] text-muted-foreground">100% compliant</p>
        </Card>
        <Card className="p-4 border-amber-200 bg-amber-50">
          <div className="flex items-start justify-between">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="text-2xl font-bold text-amber-600">0</span>
          </div>
          <p className="text-xs font-semibold mt-2">Warnings</p>
          <p className="text-[10px] text-muted-foreground">approaching limit</p>
        </Card>
        <Card className="p-4 border-rose-300 bg-rose-50">
          <div className="flex items-start justify-between">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <span className="text-2xl font-bold text-rose-600">0</span>
          </div>
          <p className="text-xs font-semibold mt-2">Critical Breaches</p>
          <p className="text-[10px] text-muted-foreground">today</p>
        </Card>
      </div>

      {/* CCP cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ccps.map((ccp) => {
          const StatusIcon = statusIcon[ccp.status]
          const withinRange = typeof ccp.lastReading === 'number' && typeof ccp.target === 'number'
          const readingPct = withinRange ? Math.min(100, Math.max(0, ((ccp.lastReading as number) - (ccp.min as number)) / (((ccp.max as number) - (ccp.min as number)) || 1) * 100)) : 100
          return (
            <Card key={ccp.code} className={`p-4 border-2 ${cardBorder[ccp.status]}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-300 text-[10px] font-bold">CCP</Badge>
                    <span className="font-mono text-sm font-bold text-blue-600">{ccp.code}</span>
                    <Badge variant="outline" className="text-[10px]">{ccp.stage.replace(/_/g, ' ')}</Badge>
                  </div>
                  <p className="text-sm font-semibold mt-1">{ccp.name}</p>
                  <p className="text-[11px] text-muted-foreground">{ccp.product} · {ccp.machine}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={`text-[10px] ${statusColor[ccp.status]}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />{ccp.status.replace(/_/g, ' ')}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">{ccp.checkedAt} · {ccp.checkedBy}</p>
                </div>
              </div>

              <div className="rounded-lg bg-white border border-slate-200 p-3">
                <div className="flex items-end justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Last Reading</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">{ccp.lastReading}</span>
                    <span className="text-xs text-muted-foreground ml-1">{ccp.unit}</span>
                  </div>
                </div>
                {withinRange && (
                  <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden mt-2">
                    <div className="absolute inset-y-0 left-0 bg-emerald-500" style={{ width: `${readingPct}%` }} />
                    <div className="absolute inset-y-0 w-0.5 bg-slate-700" style={{ left: `calc(${Math.min(100, Math.max(0, ((ccp.target as number) - (ccp.min as number)) / (((ccp.max as number) - (ccp.min as number)) || 1) * 100))}% - 1px)` }} />
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] mt-1.5">
                  <span className="text-muted-foreground">Min: <span className="font-mono font-semibold text-slate-700">{ccp.min}</span></span>
                  <span className="text-muted-foreground">Target: <span className="font-mono font-semibold text-foreground">{ccp.target}</span></span>
                  <span className="text-muted-foreground">Max: <span className="font-mono font-semibold text-slate-700">{ccp.max}</span></span>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2">
                <PenTool className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Corrective Action</p>
                  <p className="text-[11px] text-foreground mt-0.5">{ccp.correctiveAction}</p>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <QrCode className="h-3 w-3" />
                <span className="font-mono">{ccp.batch}</span>
              </div>
            </Card>
          )
        })}
      </div>

      {/* CCP workflow */}
      <Card className="p-5 border-rose-200 bg-rose-50/20">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-rose-600" />CCP Workflow · HACCP-Aligned Decision Tree</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 min-w-[150px] shrink-0">
            <ClipboardCheck className="h-4 w-4 text-blue-600 mb-1" />
            <p className="text-xs font-semibold">1 · CCP Check</p>
            <p className="text-[10px] text-muted-foreground">Inspector runs probe / test piece</p>
          </div>
          <span className="text-slate-400 text-lg">→</span>
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 min-w-[150px] shrink-0">
            <Gauge className="h-4 w-4 text-amber-600 mb-1" />
            <p className="text-xs font-semibold">2 · Compare to Limit</p>
            <p className="text-[10px] text-muted-foreground">Reading vs min/target/max band</p>
          </div>
          <span className="text-slate-400 text-lg">→</span>
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 min-w-[170px] shrink-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mb-1" />
            <p className="text-xs font-semibold text-emerald-700">3a · Within Limit</p>
            <p className="text-[10px] text-muted-foreground">Continue production, log reading</p>
          </div>
          <span className="text-slate-400 text-lg">/</span>
          <div className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 min-w-[170px] shrink-0">
            <StopCircle className="h-4 w-4 text-rose-600 mb-1" />
            <p className="text-xs font-semibold text-rose-700">3b · Stop Production</p>
            <p className="text-[10px] text-muted-foreground">Auto-halt line, raise quality hold</p>
          </div>
          <span className="text-slate-400 text-lg">→</span>
          <div className="rounded-lg border border-purple-300 bg-purple-50 px-3 py-2 min-w-[170px] shrink-0">
            <ShieldCheck className="h-4 w-4 text-purple-600 mb-1" />
            <p className="text-xs font-semibold text-purple-700">4 · Corrective Action</p>
            <p className="text-[10px] text-muted-foreground">Rework / reject / supervisor release</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── IPQC Batch Quality Records ─────────────────────────────────────────
function IPQCBatchQualityModule() {
  const batches = [
    {
      batch: 'BATCH-KK-500-26F003', product: 'Kaju Katli 500g', family: 'Kaju Katli', line: 'LINE-01',
      total: 9, passed: 9, failed: 0, ccpChecks: 3, ccpPassed: 3, ccpBreaches: 0,
      grade: 'A', status: 'RELEASED',
      releasedBy: 'A. Sharma (QA Manager)', releasedAt: '11:02 · 26 Feb 2026',
      notes: 'All CCPs within limit. Excellent cooking temperature stability (110°C ± 0.4). Metal detector verified with test pieces. Approved for dispatch.',
      firstInspection: '08:24', lastInspection: '10:55',
    },
    {
      batch: 'BATCH-KK-1KG-26F002', product: 'Kaju Katli 1kg', family: 'Kaju Katli', line: 'LINE-02',
      total: 8, passed: 8, failed: 0, ccpChecks: 3, ccpPassed: 3, ccpBreaches: 0,
      grade: 'A', status: 'RELEASED',
      releasedBy: 'A. Sharma (QA Manager)', releasedAt: '10:08 · 26 Feb 2026',
      notes: 'Clean run, all checkpoints cleared first time. Seal integrity 4.2 N/15mm. Piece weight 12.02g ± 0.18g.',
      firstInspection: '07:48', lastInspection: '09:55',
    },
    {
      batch: 'BATCH-NM-26F007', product: 'Mixed Namkeen 200g', family: 'Namkeen', line: 'LINE-04',
      total: 6, passed: 4, failed: 2, ccpChecks: 2, ccpPassed: 1, ccpBreaches: 1,
      grade: 'REJECT', status: 'ON_HOLD',
      releasedBy: '—', releasedAt: '—',
      notes: 'CCP-02 metal detection failure at 10:18 — production halted. 2 pieces rejected. Under root cause analysis. Hold PQH-00003 active.',
      firstInspection: '08:42', lastInspection: '10:18',
    },
    {
      batch: 'BATCH-SIB-26F005', product: 'Shwet Idli Batter 1kg', family: 'Batter', line: 'LINE-03',
      total: 4, passed: 3, failed: 1, ccpChecks: 1, ccpPassed: 1, ccpBreaches: 0,
      grade: 'B', status: 'IN_PROGRESS',
      releasedBy: '—', releasedAt: '—',
      notes: 'Grinding time deviation flagged (12 min vs target 10 min). Taste & texture acceptable. Conditional pass — proceeding to packing under observation.',
      firstInspection: '08:05', lastInspection: '09:10',
    },
  ]

  const statusColor: Record<string, string> = {
    IN_PROGRESS: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    COMPLETED: 'bg-blue-100 text-blue-700 border-blue-300',
    RELEASED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    ON_HOLD: 'bg-rose-100 text-rose-700 border-rose-300',
    REJECTED: 'bg-rose-100 text-rose-700 border-rose-300',
  }

  const gradeColor: Record<string, string> = {
    A: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    B: 'bg-blue-100 text-blue-700 border-blue-300',
    C: 'bg-amber-100 text-amber-700 border-amber-300',
    REJECT: 'bg-rose-100 text-rose-700 border-rose-300',
  }

  const statusIcon: Record<string, typeof Package> = {
    IN_PROGRESS: Activity,
    COMPLETED: ClipboardCheck,
    RELEASED: CheckCircle2,
    ON_HOLD: Pause,
    REJECTED: PackageX,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-cyan-600" />Batch Quality Records</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 51 · Digital quality history per batch · 4 active batch records · 2 released · 1 on hold · 1 in progress · Full IPQC inspection trail with QR-code traceability</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><QrCode className="mr-1 h-4 w-4" />Scan Batch QR</Button>
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Export CoA</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Batch Record</Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border-cyan-200 bg-cyan-50">
          <div className="flex items-start justify-between">
            <FileText className="h-5 w-5 text-cyan-600" />
            <span className="text-2xl font-bold text-cyan-600">4</span>
          </div>
          <p className="text-xs font-semibold mt-2">Active Records</p>
          <p className="text-[10px] text-muted-foreground">today</p>
        </Card>
        <Card className="p-4 border-emerald-200 bg-emerald-50">
          <div className="flex items-start justify-between">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-600">2</span>
          </div>
          <p className="text-xs font-semibold mt-2">Released</p>
          <p className="text-[10px] text-muted-foreground">grade A · cleared</p>
        </Card>
        <Card className="p-4 border-rose-200 bg-rose-50">
          <div className="flex items-start justify-between">
            <Pause className="h-5 w-5 text-rose-600" />
            <span className="text-2xl font-bold text-rose-600">1</span>
          </div>
          <p className="text-xs font-semibold mt-2">On Hold</p>
          <p className="text-[10px] text-muted-foreground">CCP breach</p>
        </Card>
        <Card className="p-4 border-indigo-200 bg-indigo-50">
          <div className="flex items-start justify-between">
            <Activity className="h-5 w-5 text-indigo-600" />
            <span className="text-2xl font-bold text-indigo-600">1</span>
          </div>
          <p className="text-xs font-semibold mt-2">In Progress</p>
          <p className="text-[10px] text-muted-foreground">under observation</p>
        </Card>
      </div>

      {/* Batch cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {batches.map((b) => {
          const StatusIcon = statusIcon[b.status]
          const passRate = b.total > 0 ? Math.round((b.passed / b.total) * 100) : 0
          return (
            <Card key={b.batch} className={`p-5 border-2 ${b.status === 'ON_HOLD' || b.status === 'REJECTED' ? 'border-rose-300 bg-rose-50/20' : b.status === 'RELEASED' ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4 text-slate-500" />
                    <span className="font-mono text-sm font-bold text-blue-600">{b.batch}</span>
                  </div>
                  <p className="text-base font-semibold mt-1">{b.product}</p>
                  <p className="text-[11px] text-muted-foreground">{b.family} family · {b.line} · {b.firstInspection} → {b.lastInspection}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={`text-[10px] ${statusColor[b.status]}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />{b.status.replace(/_/g, ' ')}
                  </Badge>
                  <div className="mt-2 flex items-center justify-end gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Grade</span>
                    <Badge variant="outline" className={`text-[10px] font-bold ${gradeColor[b.grade]}`}>{b.grade}</Badge>
                  </div>
                </div>
              </div>

              {/* Inspection summary grid */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="rounded-lg border border-slate-200 bg-white p-2 text-center">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Inspections</p>
                  <p className="text-lg font-bold text-foreground">{b.total}</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-center">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Passed</p>
                  <p className="text-lg font-bold text-emerald-600">{b.passed}</p>
                </div>
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-center">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Failed</p>
                  <p className="text-lg font-bold text-rose-600">{b.failed}</p>
                </div>
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-2 text-center">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">CCP Checks</p>
                  <p className="text-lg font-bold text-purple-600">{b.ccpChecks}</p>
                </div>
              </div>

              {/* Pass rate bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="uppercase font-bold text-muted-foreground">Pass Rate</span>
                  <span className="font-mono font-bold text-foreground">{passRate}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${passRate === 100 ? 'bg-emerald-500' : passRate >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${passRate}%` }} />
                </div>
              </div>

              {/* CCP breach banner */}
              {b.ccpBreaches > 0 && (
                <div className="rounded-lg border border-rose-300 bg-rose-100 p-2 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <p className="text-xs text-rose-700">
                    <span className="font-bold">{b.ccpBreaches} CCP BREACH</span> detected — production halted automatically, batch quarantined.
                  </p>
                </div>
              )}

              {/* Digital quality history indicator */}
              <div className="rounded-lg border border-slate-200 bg-white p-2.5 mb-3 flex items-center gap-2">
                <History className="h-4 w-4 text-blue-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Digital Quality History</p>
                  <p className="text-[11px] text-foreground">Complete IPQC trail · {b.total} inspection records · {b.ccpChecks} CCP logs · photo evidence + e-signatures on file</p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />Complete
                </Badge>
              </div>

              {/* Release info */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1 flex items-center gap-1">
                  <PenTool className="h-3 w-3" />Release Information
                </p>
                {b.status === 'RELEASED' ? (
                  <>
                    <p className="text-[11px] text-foreground"><span className="font-semibold">Released by:</span> {b.releasedBy}</p>
                    <p className="text-[11px] text-foreground"><span className="font-semibold">Released at:</span> {b.releasedAt}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 italic">{b.notes}</p>
                  </>
                ) : (
                  <>
                    <p className="text-[11px] text-muted-foreground">Not yet released — batch is {b.status.replace(/_/g, ' ').toLowerCase()}.</p>
                    <p className="text-[11px] text-muted-foreground mt-1 italic">{b.notes}</p>
                  </>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── IPQC Production Quality Hold Center ────────────────────────────────
function IPQCHoldModule() {
  const holds = [
    {
      code: 'PQH-00003', batch: 'BATCH-NM-26F007', product: 'Mixed Namkeen 200g', stage: 'METAL_DETECTION',
      holdType: 'COMPLETE_HOLD', reason: 'CCP_BREACH', severity: 'CRITICAL', status: 'ACTIVE',
      description: 'Metal detection failure on MDT-02 — ferrous contaminant detected in 2 consecutive pieces. Production halted automatically at 10:18. CCP-02 breach logged.',
      stage_label: 'Metal Detection Line',
      heldBy: 'System (Auto-Halt)', heldAt: '10:18 · 26 Feb 2026',
      reviewedBy: '—', reviewedAt: '—',
      releasedBy: '—', releasedAt: '—',
      machine: 'MDT-02', operator: 'K. Rao', inspector: 'M. Joshi',
    },
    {
      code: 'PQH-00002', batch: 'BATCH-MT-26F011', product: 'Motichoor Laddu 1kg', stage: 'COOKING',
      holdType: 'PARTIAL_HOLD', reason: 'QUALITY_FAILURE', severity: 'MAJOR', status: 'UNDER_REVIEW',
      description: 'Sugar syrup crystallization observed during cooking — texture grainy instead of smooth. Brix reading 82 (max 80). Partial hold on affected lot, remainder of batch cleared.',
      stage_label: 'Cooking Kettle COOK-03',
      heldBy: 'P. Verma (Inspector)', heldAt: '09:32 · 26 Feb 2026',
      reviewedBy: 'A. Sharma (QA Manager)', reviewedAt: '10:45 · 26 Feb 2026',
      releasedBy: '—', releasedAt: '—',
      machine: 'COOK-03', operator: 'D. Gupta', inspector: 'P. Verma',
    },
    {
      code: 'PQH-00001', batch: 'BATCH-SIB-26F005', product: 'Shwet Idli Batter 1kg', stage: 'MIXING',
      holdType: 'PARTIAL_HOLD', reason: 'PARAMETER_DEVIATION', severity: 'MINOR', status: 'RELEASED',
      description: 'Grinding time exceeded target by 2 minutes (12 min vs 10 min target). Texture and taste verified acceptable. Conditional release with supervisor sign-off.',
      stage_label: 'Wet Grinder GRN-01',
      heldBy: 'S. Iyer (Inspector)', heldAt: '08:35 · 26 Feb 2026',
      reviewedBy: 'A. Sharma (QA Manager)', reviewedAt: '09:20 · 26 Feb 2026',
      releasedBy: 'A. Sharma (QA Manager)', releasedAt: '09:25 · 26 Feb 2026',
      machine: 'GRN-01', operator: 'V. Kumar', inspector: 'S. Iyer',
    },
  ]

  const severityColor: Record<string, string> = {
    CRITICAL: 'bg-rose-100 text-rose-700 border-rose-300',
    MAJOR: 'bg-amber-100 text-amber-700 border-amber-300',
    MINOR: 'bg-slate-100 text-slate-700 border-slate-300',
  }

  const severityBorder: Record<string, string> = {
    CRITICAL: 'border-l-rose-500 bg-rose-50/30',
    MAJOR: 'border-l-amber-500 bg-amber-50/30',
    MINOR: 'border-l-slate-400',
  }

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-rose-100 text-rose-700 border-rose-300',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700 border-amber-300',
    RELEASED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    REWORKED: 'bg-blue-100 text-blue-700 border-blue-300',
    REJECTED: 'bg-rose-100 text-rose-700 border-rose-300',
  }

  const statusIcon: Record<string, typeof Pause> = {
    ACTIVE: Siren,
    UNDER_REVIEW: AlertTriangle,
    RELEASED: CheckCircle2,
    REWORKED: History,
    REJECTED: X,
  }

  const holdTypeIcon: Record<string, typeof Pause> = {
    PARTIAL_HOLD: Pause,
    COMPLETE_HOLD: StopCircle,
    LINE_HOLD: Activity,
    MACHINE_HOLD: Gauge,
  }

  const reasonLabel: Record<string, string> = {
    CCP_BREACH: 'CCP Breach',
    QUALITY_FAILURE: 'Quality Failure',
    PARAMETER_DEVIATION: 'Parameter Deviation',
    CONTAMINATION: 'Contamination',
    DOCUMENTATION: 'Documentation Gap',
    CUSTOMER_COMPLAINT: 'Customer Complaint',
    AUDIT_FINDING: 'Audit Finding',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Pause className="h-6 w-6 text-rose-600" />Production Quality Hold Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 51 · Quarantine workflow for non-conforming production · 3 active holds (1 critical · 1 major · 1 minor) · Auto-halt on CCP breach · Supervisor decision tree (Continue / Rework / Reject)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileWarning className="mr-1 h-4 w-4" />Hold Registry</Button>
          <Button size="sm" variant="destructive"><Pause className="mr-1 h-4 w-4" />Manual Hold</Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4 border-rose-200 bg-rose-50">
          <div className="flex items-start justify-between">
            <Pause className="h-5 w-5 text-rose-600" />
            <span className="text-2xl font-bold text-rose-600">3</span>
          </div>
          <p className="text-xs font-semibold mt-2">Total Holds</p>
          <p className="text-[10px] text-muted-foreground">today</p>
        </Card>
        <Card className="p-4 border-rose-300 bg-rose-50">
          <div className="flex items-start justify-between">
            <Siren className="h-5 w-5 text-rose-600" />
            <span className="text-2xl font-bold text-rose-600">1</span>
          </div>
          <p className="text-xs font-semibold mt-2">Active</p>
          <p className="text-[10px] text-muted-foreground">CRITICAL · auto-halt</p>
        </Card>
        <Card className="p-4 border-amber-200 bg-amber-50">
          <div className="flex items-start justify-between">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="text-2xl font-bold text-amber-600">1</span>
          </div>
          <p className="text-xs font-semibold mt-2">Under Review</p>
          <p className="text-[10px] text-muted-foreground">MAJOR · QA review</p>
        </Card>
        <Card className="p-4 border-emerald-200 bg-emerald-50">
          <div className="flex items-start justify-between">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-600">1</span>
          </div>
          <p className="text-xs font-semibold mt-2">Released</p>
          <p className="text-[10px] text-muted-foreground">MINOR · signed-off</p>
        </Card>
        <Card className="p-4 border-slate-200">
          <div className="flex items-start justify-between">
            <Clock className="h-5 w-5 text-slate-600" />
            <span className="text-2xl font-bold text-slate-700">42m</span>
          </div>
          <p className="text-xs font-semibold mt-2">Avg Hold Time</p>
          <p className="text-[10px] text-muted-foreground">release cycle</p>
        </Card>
      </div>

      {/* Hold cards */}
      <div className="space-y-4">
        {holds.map((h) => {
          const StatusIcon = statusIcon[h.status]
          const HoldTypeIcon = holdTypeIcon[h.holdType] || Pause
          return (
            <Card key={h.code} className={`p-5 border-l-4 ${severityBorder[h.severity]}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-blue-600">{h.code}</span>
                    <Badge variant="outline" className={`text-[10px] ${statusColor[h.status]}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />{h.status.replace(/_/g, ' ')}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] ${severityColor[h.severity]}`}>{h.severity}</Badge>
                    <Badge variant="outline" className="text-[10px]">
                      <HoldTypeIcon className="h-3 w-3 mr-1" />{h.holdType.replace(/_/g, ' ')}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-300">{reasonLabel[h.reason] || h.reason.replace(/_/g, ' ')}</Badge>
                  </div>
                  <p className="text-base font-semibold mt-1.5">{h.product}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <QrCode className="h-3 w-3" />
                    <span className="font-mono">{h.batch}</span>
                    <span>·</span>
                    <span>{h.stage_label}</span>
                    <span>·</span>
                    <span className="font-mono">{h.machine}</span>
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-lg border border-slate-200 bg-white p-3 mb-3">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Hold Description</p>
                <p className="text-xs text-foreground">{h.description}</p>
              </div>

              {/* Workflow timeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className={`rounded-lg border p-2.5 ${h.heldBy !== '—' ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Pause className={`h-3.5 w-3.5 ${h.heldBy !== '—' ? 'text-rose-600' : 'text-slate-400'}`} />
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Held</p>
                  </div>
                  <p className="text-[11px] font-semibold text-foreground">{h.heldBy}</p>
                  <p className="text-[10px] text-muted-foreground">{h.heldAt}</p>
                </div>
                <div className={`rounded-lg border p-2.5 ${h.reviewedBy !== '—' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle className={`h-3.5 w-3.5 ${h.reviewedBy !== '—' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Reviewed</p>
                  </div>
                  <p className="text-[11px] font-semibold text-foreground">{h.reviewedBy}</p>
                  <p className="text-[10px] text-muted-foreground">{h.reviewedAt}</p>
                </div>
                <div className={`rounded-lg border p-2.5 ${h.releasedBy !== '—' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${h.releasedBy !== '—' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Released</p>
                  </div>
                  <p className="text-[11px] font-semibold text-foreground">{h.releasedBy}</p>
                  <p className="text-[10px] text-muted-foreground">{h.releasedAt}</p>
                </div>
              </div>

              {/* People + actions */}
              <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>Operator: <span className="font-semibold text-foreground">{h.operator}</span></span>
                  <span>·</span>
                  <span>Inspector: <span className="font-semibold text-foreground">{h.inspector}</span></span>
                </div>
                {h.status === 'ACTIVE' && (
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline"><History className="h-3.5 w-3.5 mr-1" />Rework</Button>
                    <Button size="sm" variant="destructive"><X className="h-3.5 w-3.5 mr-1" />Reject</Button>
                    <Button size="sm" variant="outline"><PenTool className="h-3.5 w-3.5 mr-1" />Investigate</Button>
                  </div>
                )}
                {h.status === 'UNDER_REVIEW' && (
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline"><History className="h-3.5 w-3.5 mr-1" />Approve Rework</Button>
                    <Button size="sm" variant="destructive"><X className="h-3.5 w-3.5 mr-1" />Reject</Button>
                    <Button size="sm"><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Conditional Release</Button>
                  </div>
                )}
                {h.status === 'RELEASED' && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />Resolved · {h.releasedAt}
                  </Badge>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Hold workflow */}
      <Card className="p-5 border-rose-200 bg-rose-50/20">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-rose-600" />Quality Hold Workflow · Auto-Halt → Supervisor Decision</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <div className="rounded-lg border border-rose-300 bg-white px-3 py-2 min-w-[150px] shrink-0">
            <AlertCircle className="h-4 w-4 text-rose-600 mb-1" />
            <p className="text-xs font-semibold">1 · Quality Failure</p>
            <p className="text-[10px] text-muted-foreground">CCP breach / deviation / failure</p>
          </div>
          <span className="text-slate-400 text-lg">→</span>
          <div className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 min-w-[150px] shrink-0">
            <StopCircle className="h-4 w-4 text-rose-600 mb-1" />
            <p className="text-xs font-semibold text-rose-700">2 · Stop Operation</p>
            <p className="text-[10px] text-muted-foreground">Auto-halt line + isolate batch</p>
          </div>
          <span className="text-slate-400 text-lg">→</span>
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 min-w-[150px] shrink-0">
            <Pause className="h-4 w-4 text-amber-600 mb-1" />
            <p className="text-xs font-semibold text-amber-700">3 · Move to Hold</p>
            <p className="text-[10px] text-muted-foreground">Quarantine, generate PQH code</p>
          </div>
          <span className="text-slate-400 text-lg">→</span>
          <div className="rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 min-w-[150px] shrink-0">
            <ClipboardCheck className="h-4 w-4 text-indigo-600 mb-1" />
            <p className="text-xs font-semibold text-indigo-700">4 · Supervisor Review</p>
            <p className="text-[10px] text-muted-foreground">Root cause + impact assessment</p>
          </div>
          <span className="text-slate-400 text-lg">→</span>
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 min-w-[180px] shrink-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mb-1" />
            <p className="text-xs font-semibold text-emerald-700">5 · Decision</p>
            <p className="text-[10px] text-muted-foreground">Continue · Rework · Reject</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── IPQC Real-Time Quality Alerts ──────────────────────────────────────
function IPQCAlertsModule() {
  const alertTypes = [
    { type: 'Critical CCP Failure', desc: 'CCP breach detected — production halted automatically', icon: Siren, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-300', severity: 'CRITICAL', active: 1 },
    { type: 'Temperature Out of Range', desc: 'Cooking/cooling/storage temp outside spec band', icon: Thermometer, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-300', severity: 'WARNING', active: 1 },
    { type: 'Weight Failure', desc: 'Piece or batch weight outside ± tolerance', icon: Gauge, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-300', severity: 'WARNING', active: 1 },
    { type: 'Metal Detection Failure', desc: 'Ferrous / non-ferrous / SS contaminant detected', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-300', severity: 'CRITICAL', active: 1 },
    { type: 'Repeated Defects', desc: 'Same defect recurring across N consecutive inspections', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-300', severity: 'WARNING', active: 1 },
    { type: 'Operator Error', desc: 'Procedural deviation logged by inspector', icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-300', severity: 'WARNING', active: 0 },
    { type: 'Machine Quality Alert', desc: 'Equipment sensor or calibration drift detected', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-300', severity: 'INFO', active: 0 },
  ]

  const recentAlerts = [
    {
      id: 'QA-0547', type: 'Critical CCP Failure', severity: 'CRITICAL', status: 'ACTIVE',
      batch: 'BATCH-NM-26F007', machine: 'MDT-02', stage: 'METAL_DETECTION',
      description: 'CCP-02 metal detection breach — ferrous contaminant (1.2mm Fe) detected in 2 consecutive pieces. Production halted at 10:18.',
      raisedAt: '10:18 · 26 Feb 2026', raisedBy: 'System (Auto-Halt)',
      channels: ['Dashboard', 'Mobile', 'Email', 'SMS', 'WhatsApp'],
    },
    {
      id: 'QA-0546', type: 'Temperature Out of Range', severity: 'WARNING', status: 'ACKNOWLEDGED',
      batch: 'BATCH-KK-500-26F003', machine: 'COOK-01', stage: 'COOKING',
      description: 'Cooking temp reading 112°C — at upper limit of CCP-01 band (108-112°C). Operator alerted to reduce flame.',
      raisedAt: '10:08 · 26 Feb 2026', raisedBy: 'R. Nair (Inspector)',
      channels: ['Dashboard', 'Mobile', 'Email'],
    },
    {
      id: 'QA-0545', type: 'Repeated Defects', severity: 'WARNING', status: 'ACKNOWLEDGED',
      batch: 'BATCH-SIB-26F005', machine: 'GRN-01', stage: 'MIXING',
      description: 'Grinding time deviation — 3rd consecutive batch exceeding 10-min target by ≥2 min. Equipment maintenance flagged.',
      raisedAt: '08:42 · 26 Feb 2026', raisedBy: 'S. Iyer (Inspector)',
      channels: ['Dashboard', 'Mobile', 'Email'],
    },
    {
      id: 'QA-0544', type: 'Metal Detection Failure', severity: 'CRITICAL', status: 'RESOLVED',
      batch: 'BATCH-NM-26F006', machine: 'MDT-02', stage: 'METAL_DETECTION',
      description: 'Single piece rejection — non-ferrous contaminant detected and auto-rejected. Line cleared after retest. No batch impact.',
      raisedAt: '07:55 · 26 Feb 2026', raisedBy: 'System (Auto-Detect)',
      channels: ['Dashboard', 'Mobile', 'SMS', 'WhatsApp'],
    },
    {
      id: 'QA-0543', type: 'Weight Failure', severity: 'WARNING', status: 'RESOLVED',
      batch: 'BATCH-PB-26F014', machine: 'CUT-02', stage: 'CUTTING',
      description: 'Pista Barfi piece weight 11.2g (target 12g ±0.5). Cutter blade adjustment performed, subsequent pieces within tolerance.',
      raisedAt: '07:32 · 26 Feb 2026', raisedBy: 'P. Verma (Inspector)',
      channels: ['Dashboard', 'Email'],
    },
  ]

  const deliveryChannels = [
    { name: 'Dashboard', icon: Activity, active: true, count: 5, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-300' },
    { name: 'Mobile', icon: BellRing, active: true, count: 4, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-300' },
    { name: 'Email', icon: FileText, active: true, count: 5, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-300' },
    { name: 'SMS', icon: Bell, active: true, count: 2, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-300' },
    { name: 'WhatsApp', icon: BellRing, active: true, count: 2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-300' },
  ]

  const severityColor: Record<string, string> = {
    CRITICAL: 'bg-rose-100 text-rose-700 border-rose-300',
    WARNING: 'bg-amber-100 text-amber-700 border-amber-300',
    INFO: 'bg-blue-100 text-blue-700 border-blue-300',
  }

  const statusColor: Record<string, string> = {
    ACTIVE: 'bg-rose-100 text-rose-700 border-rose-300',
    ACKNOWLEDGED: 'bg-amber-100 text-amber-700 border-amber-300',
    RESOLVED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  }

  const statusIcon: Record<string, typeof Bell> = {
    ACTIVE: Siren,
    ACKNOWLEDGED: BellRing,
    RESOLVED: CheckCircle2,
  }

  const channelIcon: Record<string, typeof Activity> = {
    Dashboard: Activity,
    Mobile: BellRing,
    Email: FileText,
    SMS: Bell,
    WhatsApp: BellRing,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><BellRing className="h-6 w-6 text-rose-600" />Real-Time Quality Alerts</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 51 · Multi-channel alerting · 7 alert types · 5 recent alerts (1 active · 2 acknowledged · 2 resolved) · 5 delivery channels with active indicators</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse" />1 Active
          </Badge>
          <Button size="sm" variant="outline"><Bell className="mr-1 h-4 w-4" />Alert Settings</Button>
          <Button size="sm"><BellRing className="mr-1 h-4 w-4" />Test Alert</Button>
        </div>
      </div>

      {/* Delivery channels */}
      <Card className="p-5">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-blue-600" />5 Delivery Channels · Multi-Notification Routing</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {deliveryChannels.map((c) => (
            <div key={c.name} className={`rounded-lg border ${c.bg} p-3 relative`}>
              <div className="flex items-center justify-between mb-1">
                <c.icon className={`h-5 w-5 ${c.color}`} />
                {c.active && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Active" />
                )}
              </div>
              <p className="text-xs font-bold text-foreground">{c.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{c.count} alerts today</p>
              <Badge variant="outline" className={`mt-1 h-4 px-1 text-[9px] ${c.active ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-50 text-slate-500 border-slate-300'}`}>
                {c.active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Alert types */}
      <Card className="p-5">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" />7 Quality Alert Types · Categorized by Severity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {alertTypes.map((a) => (
            <div key={a.type} className={`rounded-lg border ${a.bg} p-3`}>
              <div className="flex items-center justify-between mb-1">
                <a.icon className={`h-5 w-5 ${a.color}`} />
                {a.active > 0 && (
                  <Badge variant="outline" className="text-[9px] bg-white border-current">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1 animate-pulse" />{a.active} active
                  </Badge>
                )}
              </div>
              <p className="text-xs font-bold text-foreground">{a.type}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{a.desc}</p>
              <Badge variant="outline" className={`mt-1.5 h-4 px-1 text-[9px] ${severityColor[a.severity]}`}>{a.severity}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent alerts */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><BellRing className="h-4 w-4 text-rose-600" />Recent Quality Alerts · Last 5</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Sorted by time descending · Click any alert for full incident timeline</p>
          </div>
          <Button size="sm" variant="outline">View All Alerts</Button>
        </div>
        <div className="space-y-3">
          {recentAlerts.map((alert) => {
            const StatusIcon = statusIcon[alert.status]
            return (
              <div key={alert.id} className={`rounded-lg border p-3 ${alert.status === 'ACTIVE' ? 'border-rose-300 bg-rose-50/40' : alert.status === 'ACKNOWLEDGED' ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-600">{alert.id}</span>
                      <Badge variant="outline" className={`text-[10px] ${severityColor[alert.severity]}`}>{alert.severity}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${statusColor[alert.status]}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />{alert.status}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">{alert.type}</Badge>
                    </div>
                    <p className="text-xs text-foreground mt-1.5 leading-snug">{alert.description}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-0.5"><QrCode className="h-3 w-3" /><span className="font-mono">{alert.batch}</span></span>
                      <span>·</span>
                      <span className="font-mono">{alert.machine}</span>
                      <span>·</span>
                      <span>{alert.stage.replace(/_/g, ' ')}</span>
                      <span>·</span>
                      <span>by {alert.raisedBy}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Raised At</p>
                    <p className="text-[11px] font-mono text-foreground">{alert.raisedAt}</p>
                  </div>
                </div>
                {/* Delivery channels */}
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">Delivered via:</span>
                  {alert.channels.map((ch) => {
                    const ChIcon = channelIcon[ch] || Bell
                    return (
                      <Badge key={ch} variant="outline" className="text-[9px] bg-white">
                        <ChIcon className="h-2.5 w-2.5 mr-0.5" />{ch}
                      </Badge>
                    )
                  })}
                </div>
                {/* Action buttons */}
                <div className="flex items-center justify-end gap-1.5 mt-2">
                  {alert.status === 'ACTIVE' && (
                    <>
                      <Button size="sm" variant="outline"><Pause className="h-3.5 w-3.5 mr-1" />Acknowledge</Button>
                      <Button size="sm" variant="destructive"><StopCircle className="h-3.5 w-3.5 mr-1" />View Incident</Button>
                    </>
                  )}
                  {alert.status === 'ACKNOWLEDGED' && (
                    <Button size="sm"><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Mark Resolved</Button>
                  )}
                  {alert.status === 'RESOLVED' && (
                    <Button size="sm" variant="outline"><History className="h-3.5 w-3.5 mr-1" />View Timeline</Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

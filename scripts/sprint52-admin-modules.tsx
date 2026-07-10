// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 52 — FINISHED GOODS QUALITY CONTROL (FGQC) · BATCH RELEASE & QUALITY CERTIFICATION
// Admin modules: FGQC Dashboard, FG Inspection Records, Batch Release Center,
// Shelf-Life & Packaging Compliance, Quality Certificates
// ═══════════════════════════════════════════════════════════════════════════════
// ICON IMPORT NOTE: All 22 icons required by Sprint 52 are ALREADY imported in
// src/app/page.tsx (lines 4–34). No new icon imports needed. Verified icons:
//   ShieldCheck, FileText, FileCheck, FileWarning, CheckCircle2, X,
//   AlertTriangle, AlertCircle, Clock, Calendar, Package, PackageCheck,
//   PackageX, Award, Stamp, Download, PenTool, QrCode, ScanLine,
//   IndianRupee, ArrowRight, Plus
//
// CONFLICT NOTE: grep of `^function.*Module` in src/app/page.tsx against
// (fgqc|batch.release|shelf.life|packaging.compliance|certificate) returned
// ZERO matches. No collisions exist. All Sprint 52 modules use the `FGQC`
// prefix (FGQCDashboardModule, FGQCInspectionModule, FGQCBatchReleaseModule,
// FGQCShelfLifeModule, FGQCCertificatesModule) per task specification.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── FGQC Dashboard ─────────────────────────────────────────────────────
function FGQCDashboardModule() {
  const kpis = [
    { label: 'Total Inspections', value: '28', unit: 'finished goods lots', icon: ClipboardCheck, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Pending', value: '4', unit: 'awaiting inspector', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'In Inspection', value: '2', unit: 'being verified', icon: ScanLine, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { label: 'Passed', value: '18', unit: 'compliant lots', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Failed', value: '2', unit: 'quality breach', icon: X, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Conditional', value: '2', unit: 'partial release', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    { label: 'Released', value: '16', unit: 'cleared for sale', icon: PackageCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Batch Releases', value: '20', unit: 'release requests', icon: PackageCheck, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
    { label: 'Pending Releases', value: '4', unit: 'awaiting approval', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Released Today', value: '8', unit: 'warehouse available', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Blocked Releases', value: '1', unit: 'quality hold', icon: PackageX, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Certificates', value: '18', unit: '16 signed · 2 draft', icon: FileCheck, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Shelf-Life Alerts', value: '3', unit: 'of 24 validations', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Packaging Checks', value: '24', unit: '22 compliant', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Non-Compliant PKG', value: '2', unit: 'label / allergen', icon: FileWarning, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  ]

  // Chief Architect recommendation — 3-stage release model with access matrix
  const releaseStages = [
    {
      stage: 1, code: 'QUALITY_HOLD', name: 'Quality Hold',
      icon: PackageX, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-300',
      desc: 'Finished goods produced and packed, gated in QC hold area pending lab verification & quality approval. No access for sales.',
      pos: 'BLOCKED', warehouse: 'HOLD_ZONE', retail: 'BLOCKED',
    },
    {
      stage: 2, code: 'CONDITIONAL_RELEASE', name: 'Conditional Release',
      icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-300',
      desc: 'Partial release granted with documented conditions (e.g., short shelf-life clearance, restricted channel). Time- or quantity-limited.',
      pos: 'LIMITED', warehouse: 'RESTRICTED', retail: 'CONDITIONAL',
    },
    {
      stage: 3, code: 'RELEASED', name: 'Released',
      icon: PackageCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-300',
      desc: 'Full release — quality approved, digital signature captured, warehouse receipt generated, certificate published. Available to all channels.',
      pos: 'AVAILABLE', warehouse: 'AVAILABLE', retail: 'AVAILABLE',
    },
  ]

  // FGQC end-to-end workflow
  const workflow = [
    { step: 1, code: 'PRODUCTION', name: 'Production', icon: Factory, color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { step: 2, code: 'PACKAGING', name: 'Packaging', icon: Package, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { step: 3, code: 'FGQC', name: 'FGQC Inspection', icon: ClipboardCheck, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { step: 4, code: 'LAB_VERIFICATION', name: 'Lab Verification', icon: Beaker, color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { step: 5, code: 'QUALITY_APPROVAL', name: 'Quality Approval', icon: ShieldCheck, color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { step: 6, code: 'BATCH_RELEASE', name: 'Batch Release', icon: PackageCheck, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { step: 7, code: 'WAREHOUSE_AVAILABLE', name: 'Warehouse Available', icon: Archive, color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { step: 8, code: 'CHANNEL_DISPATCH', name: 'Retail / Restaurant / Distributor', icon: Truck, color: 'bg-rose-100 text-rose-700 border-rose-300' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-emerald-600" />FGQC Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 52 · Finished Goods Quality Control · 28 inspections today · 20 batch releases · 18 certificates · 3 shelf-life alerts · 24 packaging compliance checks · End-to-end FGQC lifecycle from production to channel dispatch</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />FGQC Report</Button>
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export KPIs</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Inspection</Button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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

      {/* FGQC workflow visualization */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><ArrowRight className="h-4 w-4 text-blue-600" />FGQC Workflow · Production to Channel Dispatch</h3>
            <p className="text-xs text-muted-foreground mt-0.5">8-stage finished goods lifecycle — each stage gates the next; no batch reaches the customer without passing FGQC + lab + quality approval + release signature</p>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />Live
          </Badge>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {workflow.map((step, i) => (
            <div key={step.code} className="flex items-center gap-1 shrink-0">
              <div className={`rounded-lg border ${step.color} px-3 py-2 min-w-[150px]`}>
                <div className="flex items-center gap-1.5">
                  <step.icon className="h-3.5 w-3.5" />
                  <span className="text-[9px] uppercase font-bold tracking-wide">Stage {step.step}</span>
                </div>
                <p className="text-[11px] font-semibold mt-1">{step.name}</p>
              </div>
              {i < workflow.length - 1 && (
                <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Chief Architect recommendation — 3-stage release model with access matrix */}
      <Card className="p-5 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Award className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm flex items-center gap-2"><Award className="h-4 w-4 text-emerald-600" />Chief Architect Recommendation — 3-Stage Release Model with POS / Warehouse Access Matrix</p>
            <p className="text-xs text-muted-foreground mt-1">Every finished goods lot transitions through a 3-stage release lifecycle before customer access. <span className="font-semibold text-rose-700">Quality Hold</span> blocks all channels; <span className="font-semibold text-orange-700">Conditional Release</span> opens limited channels with conditions; <span className="font-semibold text-emerald-700">Released</span> opens all channels. The POS and warehouse access matrix enforces this gating automatically — no SKU can be sold or dispatched until its release stage permits it.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              {releaseStages.map((s) => (
                <div key={s.code} className={`rounded-lg border p-3 ${s.bg}`}>
                  <div className="flex items-center gap-1.5">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Stage {s.stage}</span>
                  </div>
                  <p className={`font-semibold text-xs mt-1 ${s.color}`}>{s.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{s.desc}</p>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 grid grid-cols-3 gap-1 text-center">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">POS</p>
                      <Badge variant="outline" className="text-[9px] mt-0.5">{s.pos}</Badge>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Warehouse</p>
                      <Badge variant="outline" className="text-[9px] mt-0.5">{s.warehouse}</Badge>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Retail</p>
                      <Badge variant="outline" className="text-[9px] mt-0.5">{s.retail}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick channel access summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 border-rose-200 bg-rose-50/40">
          <div className="flex items-center gap-2 mb-2">
            <PackageX className="h-5 w-5 text-rose-600" />
            <p className="text-sm font-semibold text-rose-700">1 Batch on Quality Hold</p>
          </div>
          <p className="text-[11px] text-muted-foreground">FGQC-00025 Namkeen — blocked at quality approval stage. POS blocked, warehouse hold zone, retail blocked until quality approval or rejection.</p>
          <Button size="sm" variant="outline" className="mt-2 w-full text-[11px] h-7">View Hold Details</Button>
        </Card>
        <Card className="p-4 border-orange-200 bg-orange-50/40">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <p className="text-sm font-semibold text-orange-700">2 Conditional Releases</p>
          </div>
          <p className="text-[11px] text-muted-foreground">FGQC-00026 Idli Batter + BREL-00018 — limited channel access with documented conditions (short shelf-life clearance, restricted to local retail).</p>
          <Button size="sm" variant="outline" className="mt-2 w-full text-[11px] h-7">View Conditions</Button>
        </Card>
        <Card className="p-4 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center gap-2 mb-2">
            <PackageCheck className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-semibold text-emerald-700">16 Batches Fully Released</p>
          </div>
          <p className="text-[11px] text-muted-foreground">Full access across POS, warehouse, retail & restaurant/distributor channels. 8 released today, 16 certificates signed, ready for customer dispatch.</p>
          <Button size="sm" variant="outline" className="mt-2 w-full text-[11px] h-7">View Releases</Button>
        </Card>
      </div>
    </div>
  )
}

// ─── FGQC Inspection Records ───────────────────────────────────────────
function FGQCInspectionModule() {
  const inspections = [
    {
      code: 'FGQC-00028', batch: 'BATCH-KK-500-26F003', product: 'Kaju Katli 500g', qty: '120 kg',
      mfgDate: '2026-02-15', expiryDate: '2026-04-15', template: 'FGQC-SWEET-KK-001',
      passed: 12, failed: 0, grade: 'A', inspector: 'R. Nair', inspectedAt: '2026-02-18 10:42',
      status: 'PASSED', result: 'PASSED', releaseStatus: 'RELEASED',
      failReason: '—', conditionNotes: '—',
    },
    {
      code: 'FGQC-00027', batch: 'BATCH-KK-1KG-26F002', product: 'Kaju Katli 1kg', qty: '80 kg',
      mfgDate: '2026-02-14', expiryDate: '2026-04-14', template: 'FGQC-SWEET-KK-001',
      passed: 12, failed: 0, grade: 'A', inspector: 'R. Nair', inspectedAt: '2026-02-18 09:55',
      status: 'PASSED', result: 'PASSED', releaseStatus: 'RELEASED',
      failReason: '—', conditionNotes: '—',
    },
    {
      code: 'FGQC-00026', batch: 'BATCH-SIB-26F005', product: 'Shwet Idli Batter 1kg', qty: '95 kg',
      mfgDate: '2026-02-17', expiryDate: '2026-02-22', template: 'FGQC-DAIRY-IB-002',
      passed: 10, failed: 2, grade: 'B', inspector: 'S. Iyer', inspectedAt: '2026-02-18 09:10',
      status: 'CONDITIONAL_PASS', result: 'CONDITIONAL_PASS', releaseStatus: 'CONDITIONAL_RELEASE',
      failReason: '—', conditionNotes: 'Shelf-life 5 days only (below 7-day norm) — conditional release granted for local retail channel within 25 km radius, must clear within 3 days.',
    },
    {
      code: 'FGQC-00025', batch: 'BATCH-NM-26F007', product: 'Mixed Namkeen 200g', qty: '60 kg',
      mfgDate: '2026-02-16', expiryDate: '2026-05-15', template: 'FGQC-SNACK-NM-003',
      passed: 8, failed: 4, grade: 'C', inspector: 'M. Joshi', inspectedAt: '2026-02-18 10:18',
      status: 'FAILED', result: 'FAILED', releaseStatus: 'QUALITY_HOLD',
      failReason: '4 critical checkpoint failures — moisture content 4.8% (limit ≤3.5%), packaging seal integrity breach on 12 units, label smudged on 8 units, allergen declaration missing on 5 units.',
      conditionNotes: '—',
    },
    {
      code: 'FGQC-00024', batch: 'BATCH-MT-26F011', product: 'Motichoor Laddu 1kg', qty: '70 kg',
      mfgDate: '2026-02-15', expiryDate: '2026-03-15', template: 'FGQC-SWEET-MT-001',
      passed: 12, failed: 0, grade: 'A', inspector: 'P. Verma', inspectedAt: '2026-02-18 09:32',
      status: 'PASSED', result: 'PASSED', releaseStatus: 'PENDING_RELEASE',
      failReason: '—', conditionNotes: '—',
    },
  ]

  const statusColor: Record<string, string> = {
    PASSED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    FAILED: 'bg-rose-100 text-rose-700 border-rose-300',
    CONDITIONAL_PASS: 'bg-orange-100 text-orange-700 border-orange-300',
    IN_INSPECTION: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-300',
  }
  const gradeColor: Record<string, string> = {
    A: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    B: 'bg-amber-100 text-amber-700 border-amber-300',
    C: 'bg-orange-100 text-orange-700 border-orange-300',
    D: 'bg-rose-100 text-rose-700 border-rose-300',
  }
  const releaseColor: Record<string, string> = {
    RELEASED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    CONDITIONAL_RELEASE: 'bg-orange-100 text-orange-700 border-orange-300',
    PENDING_RELEASE: 'bg-amber-100 text-amber-700 border-amber-300',
    QUALITY_HOLD: 'bg-rose-100 text-rose-700 border-rose-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ClipboardCheck className="h-6 w-6 text-blue-600" />FGQC Inspection Records</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 52 · Finished Goods Quality Control · 5 most recent inspections · Each record contains batch, product, mfg/expiry dates, inspection template, checkpoint results, grade, inspector, status, and fail reason / condition notes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Export</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New FG Inspection</Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Passed</span><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
          <p className="text-xl font-bold text-emerald-700 mt-1">3</p>
        </Card>
        <Card className="p-3 border-orange-200 bg-orange-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Conditional</span><AlertTriangle className="h-4 w-4 text-orange-600" /></div>
          <p className="text-xl font-bold text-orange-700 mt-1">1</p>
        </Card>
        <Card className="p-3 border-rose-200 bg-rose-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Failed</span><X className="h-4 w-4 text-rose-600" /></div>
          <p className="text-xl font-bold text-rose-700 mt-1">1</p>
        </Card>
        <Card className="p-3 border-blue-200 bg-blue-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Grade A</span><Award className="h-4 w-4 text-blue-600" /></div>
          <p className="text-xl font-bold text-blue-700 mt-1">3</p>
        </Card>
        <Card className="p-3 border-amber-200 bg-amber-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Pending Release</span><Clock className="h-4 w-4 text-amber-600" /></div>
          <p className="text-xl font-bold text-amber-700 mt-1">1</p>
        </Card>
      </div>

      {/* Inspection cards */}
      <div className="space-y-3">
        {inspections.map((row) => (
          <Card key={row.code} className={`p-4 ${row.status === 'FAILED' ? 'border-rose-300 bg-rose-50/30' : row.status === 'CONDITIONAL_PASS' ? 'border-orange-300 bg-orange-50/30' : 'border-slate-200'}`}>
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-blue-600">{row.code}</span>
                  <Badge variant="outline" className={`text-[10px] ${statusColor[row.status]}`}>{row.status.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${releaseColor[row.releaseStatus]}`}>{row.releaseStatus.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${gradeColor[row.grade]}`}>Grade {row.grade}</Badge>
                  <Badge variant="outline" className="text-[10px]">{row.template}</Badge>
                </div>
                <p className="text-sm font-semibold mt-1.5">{row.product} <span className="text-muted-foreground font-normal">· {row.qty}</span></p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground flex-wrap">
                  <span className="font-mono">{row.batch}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />MFG {row.mfgDate}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />EXP {row.expiryDate}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Inspector</p>
                <p className="text-xs font-semibold">{row.inspector}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{row.inspectedAt}</p>
              </div>
            </div>

            {/* Checkpoint progress */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[11px] mb-3">
              <div className="rounded bg-muted/40 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Checkpoints Passed</p>
                <p className="text-sm font-semibold text-emerald-600">{row.passed}</p>
              </div>
              <div className="rounded bg-muted/40 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Checkpoints Failed</p>
                <p className={`text-sm font-semibold ${row.failed > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{row.failed}</p>
              </div>
              <div className="rounded bg-muted/40 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Total</p>
                <p className="text-sm font-semibold">{row.passed + row.failed}</p>
              </div>
              <div className="rounded bg-muted/40 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Pass Rate</p>
                <p className="text-sm font-semibold">{Math.round((row.passed / (row.passed + row.failed)) * 100)}%</p>
              </div>
            </div>

            {/* Fail reason / condition notes */}
            {row.failReason !== '—' && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-2.5 mb-2">
                <p className="text-[10px] uppercase font-bold text-rose-700 flex items-center gap-1"><X className="h-3 w-3" />Fail Reason</p>
                <p className="text-[11px] text-rose-900 mt-1 leading-snug">{row.failReason}</p>
              </div>
            )}
            {row.conditionNotes !== '—' && (
              <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-2.5 mb-2">
                <p className="text-[10px] uppercase font-bold text-orange-700 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Conditional Release Notes</p>
                <p className="text-[11px] text-orange-900 mt-1 leading-snug">{row.conditionNotes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-1.5 pt-2 border-t">
              <Button size="sm" variant="outline"><FileText className="h-3.5 w-3.5 mr-1" />View Detail</Button>
              {row.status === 'PASSED' && row.releaseStatus === 'PENDING_RELEASE' && (
                <Button size="sm"><PackageCheck className="h-3.5 w-3.5 mr-1" />Initiate Release</Button>
              )}
              {row.status === 'CONDITIONAL_PASS' && (
                <Button size="sm" variant="outline"><AlertTriangle className="h-3.5 w-3.5 mr-1" />View Conditions</Button>
              )}
              {row.status === 'FAILED' && (
                <Button size="sm" variant="destructive"><PackageX className="h-3.5 w-3.5 mr-1" />Quarantine</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── FGQC Batch Release Center ─────────────────────────────────────────
function FGQCBatchReleaseModule() {
  const releases = [
    {
      code: 'BREL-00020', batch: 'BATCH-KK-500-26F003', product: 'Kaju Katli 500g', qty: '120 kg',
      releaseType: 'FULL_RELEASE', releasedQty: '120 kg', restrictedQty: '0 kg',
      qualityApprovedBy: 'Dr. A. Mehta (QA Manager)', qualityApprovedAt: '2026-02-18 11:15',
      warehouseAuthorizedBy: 'V. Reddy (Warehouse Sup.)', warehouseAuthorizedAt: '2026-02-18 11:32',
      status: 'RELEASED', inventoryStatus: 'AVAILABLE', warehouseReceipt: 'WR-90342',
      conditions: '—',
    },
    {
      code: 'BREL-00019', batch: 'BATCH-KK-1KG-26F002', product: 'Kaju Katli 1kg', qty: '80 kg',
      releaseType: 'FULL_RELEASE', releasedQty: '80 kg', restrictedQty: '0 kg',
      qualityApprovedBy: 'Dr. A. Mehta (QA Manager)', qualityApprovedAt: '2026-02-18 10:50',
      warehouseAuthorizedBy: 'V. Reddy (Warehouse Sup.)', warehouseAuthorizedAt: '2026-02-18 11:08',
      status: 'RELEASED', inventoryStatus: 'AVAILABLE', warehouseReceipt: 'WR-90341',
      conditions: '—',
    },
    {
      code: 'BREL-00018', batch: 'BATCH-SIB-26F005', product: 'Shwet Idli Batter 1kg', qty: '95 kg',
      releaseType: 'CONDITIONAL_RELEASE', releasedQty: '85 kg', restrictedQty: '10 kg',
      qualityApprovedBy: 'Dr. A. Mehta (QA Manager)', qualityApprovedAt: '2026-02-18 09:45',
      warehouseAuthorizedBy: 'V. Reddy (Warehouse Sup.)', warehouseAuthorizedAt: '2026-02-18 10:02',
      status: 'CONDITIONAL_RELEASE', inventoryStatus: 'RESTRICTED', warehouseReceipt: 'WR-90340',
      conditions: '85 kg released for local retail within 25 km radius — must clear within 3 days. 10 kg restricted (short-dated) for internal QA re-evaluation; not available for sale.',
    },
    {
      code: 'BREL-00017', batch: 'BATCH-NM-26F007', product: 'Mixed Namkeen 200g', qty: '60 kg',
      releaseType: 'BLOCKED_RELEASE', releasedQty: '0 kg', restrictedQty: '60 kg',
      qualityApprovedBy: '—', qualityApprovedAt: '—',
      warehouseAuthorizedBy: '—', warehouseAuthorizedAt: '—',
      status: 'BLOCKED', inventoryStatus: 'QUALITY_HOLD', warehouseReceipt: '—',
      conditions: 'BLOCKED — 4 critical FGQC checkpoint failures (moisture, seal integrity, label, allergen). No release permitted until rework/repack and re-inspection passes.',
    },
    {
      code: 'BREL-00016', batch: 'BATCH-MT-26F011', product: 'Motichoor Laddu 1kg', qty: '70 kg',
      releaseType: 'FULL_RELEASE', releasedQty: '0 kg', restrictedQty: '0 kg',
      qualityApprovedBy: 'Dr. A. Mehta (QA Manager)', qualityApprovedAt: '2026-02-18 10:05',
      warehouseAuthorizedBy: '—', warehouseAuthorizedAt: '—',
      status: 'QUALITY_APPROVED', inventoryStatus: 'HOLD_ZONE', warehouseReceipt: '—',
      conditions: 'Quality approved — awaiting warehouse authorization & digital signature before batch release.',
    },
  ]

  const releaseTypeColor: Record<string, string> = {
    FULL_RELEASE: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    CONDITIONAL_RELEASE: 'bg-orange-100 text-orange-700 border-orange-300',
    BLOCKED_RELEASE: 'bg-rose-100 text-rose-700 border-rose-300',
    QUALITY_APPROVED: 'bg-amber-100 text-amber-700 border-amber-300',
  }
  const statusColor: Record<string, string> = {
    RELEASED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    CONDITIONAL_RELEASE: 'bg-orange-100 text-orange-700 border-orange-300',
    BLOCKED: 'bg-rose-100 text-rose-700 border-rose-300',
    QUALITY_APPROVED: 'bg-amber-100 text-amber-700 border-amber-300',
  }
  const inventoryColor: Record<string, string> = {
    AVAILABLE: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    RESTRICTED: 'bg-orange-100 text-orange-700 border-orange-300',
    QUALITY_HOLD: 'bg-rose-100 text-rose-700 border-rose-300',
    HOLD_ZONE: 'bg-amber-100 text-amber-700 border-amber-300',
  }

  // Release workflow
  const workflow = [
    { step: 1, code: 'INSPECTION_PASSED', name: 'Inspection Passed', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { step: 2, code: 'QUALITY_APPROVAL', name: 'Quality Approval', icon: ShieldCheck, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { step: 3, code: 'DIGITAL_SIGNATURE', name: 'Digital Signature', icon: PenTool, color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { step: 4, code: 'BATCH_RELEASED', name: 'Batch Released', icon: PackageCheck, color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { step: 5, code: 'WAREHOUSE_AVAILABLE', name: 'Warehouse Available', icon: Archive, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><PackageCheck className="h-6 w-6 text-emerald-600" />Batch Release Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 52 · FGQC Batch Release · 5 release requests · Each record includes release type, released/restricted qty, quality approval, warehouse authorization, inventory status, warehouse receipt number, and conditions for conditional releases</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Release Log</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Release Request</Button>
        </div>
      </div>

      {/* Release workflow visualization */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><ArrowRight className="h-4 w-4 text-blue-600" />Release Workflow · 5-Stage Gated Authorization</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Each stage gates the next — quality approval requires inspection pass; digital signature requires quality approval; batch release requires signature; warehouse availability requires release</p>
          </div>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {workflow.map((step, i) => (
            <div key={step.code} className="flex items-center gap-1 shrink-0">
              <div className={`rounded-lg border ${step.color} px-3 py-2 min-w-[160px]`}>
                <div className="flex items-center gap-1.5">
                  <step.icon className="h-3.5 w-3.5" />
                  <span className="text-[9px] uppercase font-bold tracking-wide">Stage {step.step}</span>
                </div>
                <p className="text-[11px] font-semibold mt-1">{step.name}</p>
              </div>
              {i < workflow.length - 1 && (
                <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Release cards */}
      <div className="space-y-3">
        {releases.map((row) => (
          <Card key={row.code} className={`p-4 ${row.status === 'BLOCKED' ? 'border-rose-300 bg-rose-50/30' : row.status === 'CONDITIONAL_RELEASE' ? 'border-orange-300 bg-orange-50/30' : row.status === 'QUALITY_APPROVED' ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-blue-600">{row.code}</span>
                  <Badge variant="outline" className={`text-[10px] ${releaseTypeColor[row.releaseType]}`}>{row.releaseType.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${statusColor[row.status]}`}>{row.status.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${inventoryColor[row.inventoryStatus]}`}>{row.inventoryStatus.replace(/_/g, ' ')}</Badge>
                  {row.warehouseReceipt !== '—' && (
                    <Badge variant="outline" className="text-[10px] font-mono"><QrCode className="h-3 w-3 mr-0.5" />{row.warehouseReceipt}</Badge>
                  )}
                </div>
                <p className="text-sm font-semibold mt-1.5">{row.product} <span className="text-muted-foreground font-normal">· {row.qty}</span></p>
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{row.batch}</p>
              </div>
              <div className="text-right shrink-0">
                {row.status === 'RELEASED' && <PackageCheck className="h-6 w-6 text-emerald-600 ml-auto" />}
                {row.status === 'CONDITIONAL_RELEASE' && <AlertTriangle className="h-6 w-6 text-orange-600 ml-auto" />}
                {row.status === 'BLOCKED' && <PackageX className="h-6 w-6 text-rose-600 ml-auto" />}
                {row.status === 'QUALITY_APPROVED' && <Clock className="h-6 w-6 text-amber-600 ml-auto" />}
              </div>
            </div>

            {/* Quantity split */}
            <div className="grid grid-cols-3 gap-2 text-[11px] mb-3">
              <div className="rounded bg-muted/40 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Released Qty</p>
                <p className="text-sm font-semibold text-emerald-600">{row.releasedQty}</p>
              </div>
              <div className="rounded bg-muted/40 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Restricted Qty</p>
                <p className={`text-sm font-semibold ${row.restrictedQty !== '0 kg' ? 'text-orange-600' : 'text-muted-foreground'}`}>{row.restrictedQty}</p>
              </div>
              <div className="rounded bg-muted/40 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Total Batch Qty</p>
                <p className="text-sm font-semibold">{row.qty}</p>
              </div>
            </div>

            {/* Authorization matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
              <div className={`rounded-lg border p-2.5 ${row.qualityApprovedBy !== '—' ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-muted/30'}`}>
                <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3" />Quality Approval</p>
                <p className="text-[11px] font-semibold mt-0.5">{row.qualityApprovedBy}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{row.qualityApprovedAt}</p>
              </div>
              <div className={`rounded-lg border p-2.5 ${row.warehouseAuthorizedBy !== '—' ? 'border-emerald-200 bg-emerald-50/40' : 'border-amber-200 bg-amber-50/40'}`}>
                <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Archive className="h-3 w-3" />Warehouse Authorization</p>
                <p className="text-[11px] font-semibold mt-0.5">{row.warehouseAuthorizedBy}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{row.warehouseAuthorizedAt}</p>
              </div>
            </div>

            {/* Conditions */}
            {row.conditions !== '—' && (
              <div className={`rounded-lg border p-2.5 mb-2 ${row.status === 'BLOCKED' ? 'border-rose-200 bg-rose-50/50' : 'border-orange-200 bg-orange-50/50'}`}>
                <p className={`text-[10px] uppercase font-bold flex items-center gap-1 ${row.status === 'BLOCKED' ? 'text-rose-700' : 'text-orange-700'}`}>
                  {row.status === 'BLOCKED' ? <X className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  {row.status === 'BLOCKED' ? 'Block Reason' : 'Conditional Release Conditions'}
                </p>
                <p className={`text-[11px] mt-1 leading-snug ${row.status === 'BLOCKED' ? 'text-rose-900' : 'text-orange-900'}`}>{row.conditions}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-1.5 pt-2 border-t">
              <Button size="sm" variant="outline"><FileText className="h-3.5 w-3.5 mr-1" />View Detail</Button>
              {row.status === 'RELEASED' && (
                <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 mr-1" />Release Order</Button>
              )}
              {row.status === 'QUALITY_APPROVED' && (
                <Button size="sm"><PenTool className="h-3.5 w-3.5 mr-1" />Authorize Warehouse</Button>
              )}
              {row.status === 'BLOCKED' && (
                <Button size="sm" variant="destructive"><PackageX className="h-3.5 w-3.5 mr-1" />Quarantine</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── FGQC Shelf-Life & Packaging Compliance ────────────────────────────
function FGQCShelfLifeModule() {
  const shelfLifeAlerts = [
    {
      batch: 'BATCH-SIB-26F005', product: 'Shwet Idli Batter 1kg', mfgDate: '2026-02-13', expiryDate: '2026-02-18',
      remainingDays: 0, alertLevel: 'EXPIRED', valueAtRisk: 1600,
    },
    {
      batch: 'BATCH-FC-26F019', product: 'Fresh Curd 500g', mfgDate: '2026-02-16', expiryDate: '2026-02-21',
      remainingDays: 3, alertLevel: 'CRITICAL', valueAtRisk: 1200,
    },
    {
      batch: 'BATCH-PN-26F022', product: 'Paneer 200g', mfgDate: '2026-02-15', expiryDate: '2026-02-21',
      remainingDays: 3, alertLevel: 'CRITICAL', valueAtRisk: 3375,
    },
  ]

  const alertColor: Record<string, string> = {
    EXPIRED: 'bg-rose-100 text-rose-700 border-rose-300',
    CRITICAL: 'bg-orange-100 text-orange-700 border-orange-300',
    WARNING: 'bg-amber-100 text-amber-700 border-amber-300',
    NORMAL: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  }
  const alertIcon: Record<string, any> = {
    EXPIRED: X,
    CRITICAL: AlertCircle,
    WARNING: AlertTriangle,
    NORMAL: CheckCircle2,
  }

  // 12 packaging compliance checks
  const packagingChecksList = ['box', 'label', 'barcode', 'qr', 'mrp', 'fssai', 'weight', 'ingredients', 'nutrition', 'allergen', 'mfgDate', 'expiryDate']

  const packagingChecks = [
    {
      batch: 'BATCH-KK-500-26F003', product: 'Kaju Katli 500g', overall: 'COMPLIANT',
      method: 'AQL 2.5 Level-II sampling · 125 units inspected', checkedBy: 'K. Rao (PKG Inspector)', checkedAt: '2026-02-18 08:30',
      results: { box: true, label: true, barcode: true, qr: true, mrp: true, fssai: true, weight: true, ingredients: true, nutrition: true, allergen: true, mfgDate: true, expiryDate: true },
      failedChecks: [],
    },
    {
      batch: 'BATCH-NM-26F007', product: 'Mixed Namkeen 200g', overall: 'NON_COMPLIANT',
      method: 'AQL 2.5 Level-II sampling · 125 units inspected', checkedBy: 'K. Rao (PKG Inspector)', checkedAt: '2026-02-18 09:10',
      results: { box: true, label: false, barcode: true, qr: true, mrp: true, fssai: true, weight: true, ingredients: true, nutrition: true, allergen: false, mfgDate: true, expiryDate: true },
      failedChecks: ['label (smudged on 8 units — illegible)', 'allergen (declaration missing on 5 units)'],
    },
  ]

  const overallColor: Record<string, string> = {
    COMPLIANT: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    NON_COMPLIANT: 'bg-rose-100 text-rose-700 border-rose-300',
  }

  const checkLabel: Record<string, string> = {
    box: 'Box Integrity', label: 'Label Print', barcode: 'Barcode Scan', qr: 'QR Code',
    mrp: 'MRP Print', fssai: 'FSSAI License', weight: 'Net Weight', ingredients: 'Ingredients List',
    nutrition: 'Nutrition Info', allergen: 'Allergen Decl.', mfgDate: 'MFG Date', expiryDate: 'Expiry Date',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="h-6 w-6 text-blue-600" />Shelf-Life & Packaging Compliance</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 52 · 24 shelf-life validations (3 alerts) + 24 packaging compliance checks (2 non-compliant) · Each shelf-life alert tracks remaining days, alert level & value at risk · Each packaging check runs 12 mandatory FSSAI compliance points</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Compliance Report</Button>
          <Button size="sm"><ScanLine className="mr-1 h-4 w-4" />New PKG Check</Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 border-rose-200 bg-rose-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Expired</span><X className="h-4 w-4 text-rose-600" /></div>
          <p className="text-xl font-bold text-rose-700 mt-1">1</p>
        </Card>
        <Card className="p-3 border-orange-200 bg-orange-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Critical (≤3 days)</span><AlertCircle className="h-4 w-4 text-orange-600" /></div>
          <p className="text-xl font-bold text-orange-700 mt-1">2</p>
        </Card>
        <Card className="p-3 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Shelf-Life OK</span><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
          <p className="text-xl font-bold text-emerald-700 mt-1">21</p>
        </Card>
        <Card className="p-3 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">PKG Compliant</span><ShieldCheck className="h-4 w-4 text-emerald-600" /></div>
          <p className="text-xl font-bold text-emerald-700 mt-1">22</p>
        </Card>
        <Card className="p-3 border-rose-200 bg-rose-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">PKG Non-Compliant</span><FileWarning className="h-4 w-4 text-rose-600" /></div>
          <p className="text-xl font-bold text-rose-700 mt-1">2</p>
        </Card>
      </div>

      {/* Shelf-Life Alerts section */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><AlertCircle className="h-4 w-4 text-rose-600" />Shelf-Life Alerts · 3 Active</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Batches with remaining shelf-life below 7-day warning threshold · EXPIRED requires immediate quarantine; CRITICAL requires conditional release or destruction</p>
          </div>
          <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-300">₹6,175 at risk</Badge>
        </div>
        <div className="space-y-2">
          {shelfLifeAlerts.map((alert) => {
            const AIcon = alertIcon[alert.alertLevel]
            return (
              <div key={alert.batch} className={`rounded-lg border p-3 ${alert.alertLevel === 'EXPIRED' ? 'border-rose-300 bg-rose-50/40' : 'border-orange-300 bg-orange-50/40'}`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <AIcon className={`h-4 w-4 ${alert.alertLevel === 'EXPIRED' ? 'text-rose-600' : 'text-orange-600'}`} />
                    <span className="font-semibold text-sm">{alert.product}</span>
                    <Badge variant="outline" className={`text-[10px] ${alertColor[alert.alertLevel]}`}>{alert.alertLevel}</Badge>
                    <span className="font-mono text-[11px] text-muted-foreground">{alert.batch}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <div className="text-center">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">MFG</p>
                      <p className="font-mono">{alert.mfgDate}</p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <div className="text-center">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Expiry</p>
                      <p className="font-mono">{alert.expiryDate}</p>
                    </div>
                    <div className="text-center px-2 py-0.5 rounded border border-slate-200 bg-white">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Remaining</p>
                      <p className={`font-bold text-xs ${alert.remainingDays === 0 ? 'text-rose-600' : 'text-orange-600'}`}>{alert.remainingDays === 0 ? 'EXPIRED' : `${alert.remainingDays} days`}</p>
                    </div>
                    <div className="text-center px-2 py-0.5 rounded border border-slate-200 bg-white">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Value at Risk</p>
                      <p className="font-bold text-xs text-rose-600 flex items-center gap-0.5"><IndianRupee className="h-3 w-3" />{alert.valueAtRisk.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Packaging Compliance Checks section */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-blue-600" />Packaging Compliance Checks · 12-Point FSSAI Verification</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Each batch runs 12 mandatory compliance checks (Box, Label, Barcode, QR, MRP, FSSAI, Weight, Ingredients, Nutrition, Allergen, MFG Date, Expiry Date) · pass/fail indicator per check</p>
          </div>
        </div>
        <div className="space-y-3">
          {packagingChecks.map((check) => (
            <div key={check.batch} className={`rounded-lg border p-3 ${check.overall === 'COMPLIANT' ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'}`}>
              {/* Header */}
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{check.product}</span>
                  <Badge variant="outline" className={`text-[10px] ${overallColor[check.overall]}`}>{check.overall.replace(/_/g, ' ')}</Badge>
                  <span className="font-mono text-[11px] text-muted-foreground">{check.batch}</span>
                </div>
                <div className="text-[10px] text-muted-foreground text-right">
                  <p>Checked by <span className="font-semibold text-foreground">{check.checkedBy}</span></p>
                  <p className="font-mono">{check.checkedAt}</p>
                </div>
              </div>

              {/* 12 compliance checks grid */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 mb-3">
                {packagingChecksList.map((key) => {
                  const passed = (check.results as any)[key]
                  return (
                    <div key={key} className={`rounded border px-1.5 py-1 text-center ${passed ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                      <div className="flex items-center justify-center gap-0.5">
                        {passed ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-rose-600" />}
                        <span className={`text-[9px] font-semibold ${passed ? 'text-emerald-700' : 'text-rose-700'}`}>{checkLabel[key]}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Method */}
              <div className="text-[11px] text-muted-foreground mb-2">
                <span className="font-semibold">Method:</span> {check.method}
              </div>

              {/* Failed checks detail */}
              {check.failedChecks.length > 0 && (
                <div className="rounded border border-rose-200 bg-rose-50/50 p-2">
                  <p className="text-[10px] uppercase font-bold text-rose-700 flex items-center gap-1 mb-1"><FileWarning className="h-3 w-3" />Failed Checks · {check.failedChecks.length}</p>
                  <ul className="text-[11px] text-rose-900 space-y-0.5">
                    {check.failedChecks.map((fc, i) => (
                      <li key={i} className="flex items-start gap-1"><X className="h-3 w-3 mt-0.5 shrink-0" /><span>{fc}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── FGQC Quality Certificates ─────────────────────────────────────────
function FGQCCertificatesModule() {
  const certificates = [
    {
      code: 'QCERT-00018', batch: 'BATCH-KK-500-26F003', product: 'Kaju Katli 500g',
      type: 'BATCH_QUALITY_CERTIFICATE', grade: 'A', signed: true,
      signedBy: 'Dr. A. Mehta (QA Manager)', signedAt: '2026-02-18 11:20',
      version: 'v1.0', status: 'PUBLISHED',
    },
    {
      code: 'QCERT-00017', batch: 'BATCH-KK-500-26F003', product: 'Kaju Katli 500g',
      type: 'INSPECTION_REPORT', grade: 'A', signed: true,
      signedBy: 'R. Nair (FGQC Inspector)', signedAt: '2026-02-18 10:48',
      version: 'v1.0', status: 'PUBLISHED',
    },
    {
      code: 'QCERT-00016', batch: 'BATCH-KK-1KG-26F002', product: 'Kaju Katli 1kg',
      type: 'BATCH_QUALITY_CERTIFICATE', grade: 'A', signed: true,
      signedBy: 'Dr. A. Mehta (QA Manager)', signedAt: '2026-02-18 10:55',
      version: 'v1.0', status: 'PUBLISHED',
    },
    {
      code: 'QCERT-00015', batch: 'BATCH-MT-26F011', product: 'Motichoor Laddu 1kg',
      type: 'BATCH_QUALITY_CERTIFICATE', grade: 'A', signed: false,
      signedBy: '—', signedAt: '—',
      version: 'v0.1 (draft)', status: 'GENERATED',
    },
  ]

  // 6 certificate types
  const certificateTypes = [
    { code: 'BATCH_QUALITY_CERTIFICATE', name: 'Batch Quality Certificate', icon: Award, desc: 'Comprehensive quality attestation for a finished goods batch', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { code: 'RELEASE_CERTIFICATE', name: 'Release Certificate', icon: PackageCheck, desc: 'Official release authorization with warehouse receipt reference', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { code: 'INSPECTION_REPORT', name: 'Inspection Report', icon: ClipboardCheck, desc: 'Detailed FGQC inspection record with checkpoint results', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { code: 'INTERNAL_COA', name: 'Internal COA', icon: Beaker, desc: 'Certificate of Analysis with lab verification results', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { code: 'PACKAGING_COMPLIANCE_REPORT', name: 'Packaging Compliance Report', icon: ShieldCheck, desc: '12-point FSSAI packaging compliance verification', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { code: 'QUALITY_SUMMARY', name: 'Quality Summary', icon: FileText, desc: 'Executive summary across all quality dimensions for a batch', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  ]

  // Certificate features
  const features = [
    { code: 'PDF_GENERATION', name: 'PDF Generation', icon: Download, desc: 'One-click PDF export with branded template & embedded QR', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { code: 'DIGITAL_SIGNATURE', name: 'Digital Signature', icon: PenTool, desc: 'Tamper-proof digital signature with signer identity & timestamp', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { code: 'QR_VERIFICATION', name: 'QR Verification', icon: QrCode, desc: 'Public QR code linking to verified certificate copy for customers/auditors', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { code: 'VERSION_CONTROL', name: 'Version Control', icon: History, desc: 'Full version history with supersession tracking — old versions retained', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  ]

  const typeColor: Record<string, string> = {
    BATCH_QUALITY_CERTIFICATE: 'bg-blue-100 text-blue-700 border-blue-300',
    RELEASE_CERTIFICATE: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    INSPECTION_REPORT: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    INTERNAL_COA: 'bg-purple-100 text-purple-700 border-purple-300',
    PACKAGING_COMPLIANCE_REPORT: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    QUALITY_SUMMARY: 'bg-amber-100 text-amber-700 border-amber-300',
  }

  const statusColor: Record<string, string> = {
    GENERATED: 'bg-amber-100 text-amber-700 border-amber-300',
    SIGNED: 'bg-blue-100 text-blue-700 border-blue-300',
    PUBLISHED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    SUPERSEDED: 'bg-slate-200 text-slate-700 border-slate-300',
    REVOKED: 'bg-rose-100 text-rose-700 border-rose-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><FileCheck className="h-6 w-6 text-emerald-600" />Quality Certificates</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 52 · 18 certificates total · 16 signed · 4 most recent shown · 6 certificate types supported · Features: PDF generation, digital signature, QR verification, version control</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Certificate Registry</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />Generate Certificate</Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 border-blue-200 bg-blue-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Total</span><FileCheck className="h-4 w-4 text-blue-600" /></div>
          <p className="text-xl font-bold text-blue-700 mt-1">18</p>
        </Card>
        <Card className="p-3 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Signed</span><PenTool className="h-4 w-4 text-emerald-600" /></div>
          <p className="text-xl font-bold text-emerald-700 mt-1">16</p>
        </Card>
        <Card className="p-3 border-amber-200 bg-amber-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Draft (Generated)</span><Clock className="h-4 w-4 text-amber-600" /></div>
          <p className="text-xl font-bold text-amber-700 mt-1">2</p>
        </Card>
        <Card className="p-3 border-purple-200 bg-purple-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Certificate Types</span><Award className="h-4 w-4 text-purple-600" /></div>
          <p className="text-xl font-bold text-purple-700 mt-1">6</p>
        </Card>
        <Card className="p-3 border-cyan-200 bg-cyan-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">QR Verified</span><QrCode className="h-4 w-4 text-cyan-600" /></div>
          <p className="text-xl font-bold text-cyan-700 mt-1">16</p>
        </Card>
      </div>

      {/* Certificate features */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><Stamp className="h-4 w-4 text-emerald-600" />Certificate Features · 4 Core Capabilities</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Every certificate supports PDF generation, digital signature, QR verification, and version control</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {features.map((f) => (
            <div key={f.code} className={`rounded-lg border p-3 ${f.bg}`}>
              <f.icon className={`h-5 w-5 ${f.color}`} />
              <p className={`font-semibold text-xs mt-2 ${f.color}`}>{f.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Certificate types catalog */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" />Certificate Types · 6 Supported</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Each certificate type has its own template, sign-off authority, and FSSAI compliance scope</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {certificateTypes.map((ct) => (
            <div key={ct.code} className={`rounded-lg border p-3 ${ct.color}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <ct.icon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wide">{ct.code.replace(/_/g, ' ')}</span>
              </div>
              <p className="font-semibold text-xs">{ct.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{ct.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent certificates */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><FileCheck className="h-4 w-4 text-emerald-600" />Recent Certificates · 4 Most Recent</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Each certificate carries code, batch, product, type, grade, signed status, signed by/at, version, and lifecycle status (GENERATED → SIGNED → PUBLISHED → SUPERSEDED / REVOKED)</p>
          </div>
        </div>
        <div className="space-y-2">
          {certificates.map((cert) => (
            <div key={cert.code} className={`rounded-lg border p-3 ${cert.status === 'PUBLISHED' ? 'border-emerald-200 bg-emerald-50/30' : cert.status === 'GENERATED' ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-blue-600">{cert.code}</span>
                    <Badge variant="outline" className={`text-[10px] ${typeColor[cert.type]}`}>{cert.type.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${statusColor[cert.status]}`}>{cert.status}</Badge>
                    <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-300">Grade {cert.grade}</Badge>
                    <Badge variant="outline" className="text-[10px] font-mono">{cert.version}</Badge>
                    {cert.signed ? (
                      <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-300"><PenTool className="h-2.5 w-2.5 mr-0.5" />SIGNED</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-700 border-amber-300"><Clock className="h-2.5 w-2.5 mr-0.5" />UNSIGNED</Badge>
                    )}
                  </div>
                  <p className="text-sm font-semibold mt-1.5">{cert.product}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
                    <span className="font-mono">{cert.batch}</span>
                    <span>·</span>
                    <span>Signed by <span className="font-semibold text-foreground">{cert.signedBy}</span></span>
                    {cert.signedAt !== '—' && (
                      <>
                        <span>·</span>
                        <span className="font-mono">{cert.signedAt}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {cert.status === 'PUBLISHED' && (
                    <>
                      <Button size="sm" variant="outline"><QrCode className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 mr-1" />PDF</Button>
                    </>
                  )}
                  {cert.status === 'GENERATED' && (
                    <Button size="sm"><PenTool className="h-3.5 w-3.5 mr-1" />Sign Now</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

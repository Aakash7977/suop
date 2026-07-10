// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 50 — SUPPLIER QUALITY MANAGEMENT & INCOMING RAW MATERIAL INSPECTION (IQC)
// Admin modules: Supplier Quality Dashboard, Incoming Inspection Queue, Quality Hold
// Inventory, Supplier NCR Center, Vendor Performance Scorecard, Incoming Quality Overview
// ═══════════════════════════════════════════════════════════════════════════════
// ICON IMPORT NOTE: ShieldCheck, Package, PackageCheck, AlertTriangle, AlertCircle,
// CheckCircle2, X, Clock, TrendingUp, TrendingDown, Building2, FileText, FileWarning,
// Award, Star, Truck, ScanLine, Beaker, ClipboardCheck, IndianRupee, ArrowRight are
// already imported in src/app/page.tsx. Add `PackageX` to the existing lucide-react
// import block (lines 4-34 of page.tsx) before inserting this snippet.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── IQC Supplier Quality Dashboard ─────────────────────────────────────
function IQCSupplierModule() {
  const kpis = [
    { label: 'Total Suppliers', value: '48', unit: 'onboarded vendors', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Approved', value: '32', unit: 'fully qualified', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Qualified', value: '8', unit: 'probation period', icon: ShieldCheck, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
    { label: 'Pending', value: '5', unit: 'awaiting docs', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Conditional', value: '2', unit: 'monitored', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    { label: 'Suspended', value: '1', unit: 'quality block', icon: X, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Preferred', value: '12', unit: 'strategic', icon: Star, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'High Risk', value: '3', unit: 'escalation', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Audits Due', value: '4', unit: 'next 30 days', icon: ClipboardCheck, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Certs Expiring', value: '2', unit: 'next 60 days', icon: FileWarning, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    { label: 'Avg Acceptance', value: '94.2%', unit: 'last 90 days', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  ]
  const suppliers = [
    {
      code: 'SUP-001', name: 'Sri Balaji Cashews', category: 'Dry Fruits', approval: 'APPROVED', risk: 'LOW', preferred: true,
      auditFreq: 'Quarterly', lastAudit: '2026-01-12', nextAudit: '2026-04-12', certs: 5, products: 8, acceptance: 98.5, rating: 'A+',
      city: 'Kollam, Kerala', contact: 'Ramesh Iyer',
    },
    {
      code: 'SUP-014', name: 'EID Parry (India) Ltd', category: 'Sugar & Sweeteners', approval: 'APPROVED', risk: 'LOW', preferred: true,
      auditFreq: 'Half-Yearly', lastAudit: '2025-12-18', nextAudit: '2026-06-18', certs: 7, products: 4, acceptance: 99.0, rating: 'A+',
      city: 'Chennai, TN', contact: 'Anand Krishnan',
    },
    {
      code: 'SUP-022', name: 'Amul Dairy', category: 'Dairy', approval: 'APPROVED', risk: 'LOW', preferred: true,
      auditFreq: 'Quarterly', lastAudit: '2026-01-25', nextAudit: '2026-04-25', certs: 6, products: 6, acceptance: 97.8, rating: 'A',
      city: 'Anand, Gujarat', contact: 'Priya Patel',
    },
    {
      code: 'SUP-031', name: 'Goyal Food Spices', category: 'Spices', approval: 'CONDITIONAL', risk: 'HIGH', preferred: false,
      auditFreq: 'Monthly', lastAudit: '2026-02-05', nextAudit: '2026-03-05', certs: 3, products: 12, acceptance: 82.5, rating: 'C',
      city: 'Unjha, Gujarat', contact: 'Vikram Goyal',
    },
    {
      code: 'SUP-038', name: 'Premium Packaging Co', category: 'Packaging', approval: 'APPROVED', risk: 'MEDIUM', preferred: true,
      auditFreq: 'Half-Yearly', lastAudit: '2025-11-30', nextAudit: '2026-05-30', certs: 4, products: 9, acceptance: 95.0, rating: 'A',
      city: 'Mumbai, MH', contact: 'Sneha Deshpande',
    },
    {
      code: 'SUP-045', name: 'Fortune Oils (Adani)', category: 'Edible Oils', approval: 'APPROVED', risk: 'LOW', preferred: true,
      auditFreq: 'Half-Yearly', lastAudit: '2026-01-08', nextAudit: '2026-07-08', certs: 5, products: 3, acceptance: 96.5, rating: 'A',
      city: 'Ahmedabad, Gujarat', contact: 'Rajat Shah',
    },
    {
      code: 'SUP-061', name: 'Local Spice Trader', category: 'Spices', approval: 'SUSPENDED', risk: 'CRITICAL', preferred: false,
      auditFreq: 'Monthly', lastAudit: '2026-01-20', nextAudit: '2026-02-20', certs: 1, products: 5, acceptance: 65.0, rating: 'D',
      city: 'Bhiwandi, MH', contact: 'Imran Q.',
    },
  ]
  const ratingColor: Record<string, string> = {
    'A+': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'A': 'bg-blue-100 text-blue-700 border-blue-300',
    'B': 'bg-amber-100 text-amber-700 border-amber-300',
    'C': 'bg-orange-100 text-orange-700 border-orange-300',
    'D': 'bg-rose-100 text-rose-700 border-rose-300',
  }
  const approvalColor: Record<string, string> = {
    APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    QUALIFIED: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-300',
    CONDITIONAL: 'bg-orange-100 text-orange-700 border-orange-300',
    SUSPENDED: 'bg-rose-100 text-rose-700 border-rose-300',
  }
  const riskColor: Record<string, string> = {
    LOW: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    MEDIUM: 'bg-amber-100 text-amber-700 border-amber-300',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-300',
    CRITICAL: 'bg-rose-100 text-rose-700 border-rose-300',
  }
  const inventoryStatuses = [
    { status: 'Quality Hold', desc: 'Goods received but blocked from manufacturing pending IQC inspection', icon: PackageX, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { status: 'Approved', desc: 'Inspection passed — material released to available stock for production', icon: PackageCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { status: 'Rejected', desc: 'Inspection failed — material quarantined for return or destruction', icon: PackageX, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-emerald-600" />Supplier Quality Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 50 · 48 onboarded suppliers · Approval lifecycle (Approved → Qualified → Pending → Conditional → Suspended) · Risk-based audit frequency · 3-tier inventory gating</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Export Supplier Registry</Button>
          <Button size="sm">+ New Supplier</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {kpis.map(w => (
          <Card key={w.label} className={`p-3 ${w.bg}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground">{w.label}</p>
                <p className={`text-xl font-bold mt-1 ${w.color}`}>{w.value}</p>
                <p className="text-[10px] text-muted-foreground">{w.unit}</p>
              </div>
              <w.icon className="h-5 w-5 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm flex items-center gap-2"><Award className="h-4 w-4 text-emerald-600" />Chief Architect Recommendation — 3 Inventory Statuses Governed by Supplier Quality</p>
            <p className="text-xs text-muted-foreground mt-1">All incoming raw material lands in <span className="font-semibold text-amber-700">Quality Hold</span> until IQC inspection completes. Only approved material transitions to <span className="font-semibold text-emerald-700">Available</span> stock for manufacturing; rejected material is quarantined. This 3-status inventory model (Hold / Approved / Rejected) prevents unverified material from contaminating production batches and enforces FSSAI traceability.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
              {inventoryStatuses.map((s, i) => (
                <div key={s.status} className={`rounded-lg border p-2 ${s.bg} relative`}>
                  <div className="flex items-center gap-1">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{i + 1}</span>
                  </div>
                  <p className={`font-semibold text-[11px] mt-1 ${s.color}`}>{s.status}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Building2 className="h-4 w-4 text-blue-600" />Supplier Cards — 7 Active Vendors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {suppliers.map(s => (
            <Card key={s.code} className={`p-3 ${s.approval === 'SUSPENDED' ? 'border-rose-300 bg-rose-50/40' : s.approval === 'CONDITIONAL' ? 'border-orange-300 bg-orange-50/40' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${ratingColor[s.rating]}`}>
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm leading-tight">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">{s.code} · {s.category}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={`text-[9px] font-bold ${ratingColor[s.rating]}`}>{s.rating}</Badge>
                  {s.preferred && <Badge variant="outline" className="text-[9px] bg-purple-100 text-purple-700 border-purple-300"><Star className="h-2.5 w-2.5 mr-0.5" />Preferred</Badge>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] mb-2">
                <div className="flex items-center justify-between rounded bg-muted/40 px-1.5 py-0.5">
                  <span className="text-muted-foreground">Acceptance</span>
                  <span className="font-semibold">{s.acceptance}%</span>
                </div>
                <div className="flex items-center justify-between rounded bg-muted/40 px-1.5 py-0.5">
                  <span className="text-muted-foreground">Products</span>
                  <span className="font-semibold">{s.products}</span>
                </div>
                <div className="flex items-center justify-between rounded bg-muted/40 px-1.5 py-0.5">
                  <span className="text-muted-foreground">Certs</span>
                  <span className="font-semibold">{s.certs}</span>
                </div>
                <div className="flex items-center justify-between rounded bg-muted/40 px-1.5 py-0.5">
                  <span className="text-muted-foreground">Audit</span>
                  <span className="font-semibold">{s.auditFreq}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 mb-2">
                <Badge variant="outline" className={`text-[9px] ${approvalColor[s.approval]}`}>{s.approval}</Badge>
                <Badge variant="outline" className={`text-[9px] ${riskColor[s.risk]}`}>Risk: {s.risk}</Badge>
              </div>
              <div className="text-[10px] text-muted-foreground border-t pt-1.5 flex items-center justify-between">
                <span>Last: {s.lastAudit}</span>
                <span>Next: <span className={s.nextAudit < '2026-03-15' ? 'text-rose-600 font-semibold' : ''}>{s.nextAudit}</span></span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── IQC Incoming Inspection Queue ──────────────────────────────────────
function IQCInspectionQueueModule() {
  const kpis = [
    { label: 'Total Inspections', value: '24', unit: 'this week', icon: ClipboardCheck, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Pending', value: '3', unit: 'awaiting start', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Passed', value: '18', unit: '75% pass rate', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Failed', value: '2', unit: '8.3% fail rate', icon: X, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Conditional', value: '1', unit: 'partial accept', icon: AlertTriangle, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  ]
  const inspections = [
    {
      code: 'IQC-00048', grn: 'GRN-10428', po: 'PO-7782', supplier: 'Sri Balaji Cashews', supplierBatch: 'SBC-26-018',
      material: 'Cashew W320', category: 'Dry Fruits', receivedQty: '500 kg', sampledQty: '25 kg', template: 'RM-NUT-001',
      samplingPlan: 'AQL 2.5 Level-II', status: 'IN_INSPECTION', inspector: 'R. Nair', result: 'IN_PROGRESS',
      decision: 'PENDING', acceptedQty: '-', rejectedQty: '-', ncrGenerated: false, sampledAt: '2026-02-18 09:15',
    },
    {
      code: 'IQC-00047', grn: 'GRN-10427', po: 'PO-7780', supplier: 'EID Parry', supplierBatch: 'EP-S-26-005',
      material: 'Refined Sugar S30', category: 'Sugar & Sweeteners', receivedQty: '500 kg', sampledQty: '13 kg', template: 'RM-SUG-001',
      samplingPlan: 'AQL 1.0 Level-II', status: 'PASSED', inspector: 'A. Pillai', result: 'PASS',
      decision: 'FULL_ACCEPTANCE', acceptedQty: '500 kg', rejectedQty: '0 kg', ncrGenerated: false, sampledAt: '2026-02-18 07:40',
    },
    {
      code: 'IQC-00046', grn: 'GRN-10426', po: 'PO-7778', supplier: 'Amul Dairy', supplierBatch: 'AM-G-26-022',
      material: 'Ghee Tin 15kg', category: 'Dairy', receivedQty: '300 kg', sampledQty: '6 kg', template: 'RM-DRY-002',
      samplingPlan: 'AQL 1.5 Level-II', status: 'PASSED', inspector: 'M. Kulkarni', result: 'PASS',
      decision: 'FULL_ACCEPTANCE', acceptedQty: '300 kg', rejectedQty: '0 kg', ncrGenerated: false, sampledAt: '2026-02-18 06:55',
    },
    {
      code: 'IQC-00045', grn: 'GRN-10425', po: 'PO-7775', supplier: 'Goyal Food Spices', supplierBatch: 'GF-CP-26-041',
      material: 'Red Chilli Powder', category: 'Spices', receivedQty: '100 kg', sampledQty: '8 kg', template: 'RM-SPI-003',
      samplingPlan: 'AQL 2.5 Level-II', status: 'FAILED', inspector: 'S. Joshi', result: 'FAIL',
      decision: 'REJECTION', acceptedQty: '0 kg', rejectedQty: '100 kg', ncrGenerated: true, sampledAt: '2026-02-17 16:20',
    },
    {
      code: 'IQC-00044', grn: 'GRN-10424', po: 'PO-7771', supplier: 'Premium Packaging', supplierBatch: 'PP-BX-26-009',
      material: 'Corrugated Boxes 500g', category: 'Packaging', receivedQty: '5000 pcs', sampledQty: '125 pcs', template: 'PKG-BOX-001',
      samplingPlan: 'AQL 4.0 Level-I', status: 'CONDITIONAL', inspector: 'K. Rao', result: 'CONDITIONAL',
      decision: 'PARTIAL_ACCEPTANCE', acceptedQty: '4500 pcs', rejectedQty: '500 pcs', ncrGenerated: true, sampledAt: '2026-02-17 14:05',
    },
    {
      code: 'IQC-00043', grn: 'GRN-10423', po: 'PO-7769', supplier: 'Fortune Oils', supplierBatch: 'FO-Palm-26-013',
      material: 'Palmolein Oil 15L', category: 'Edible Oils', receivedQty: '500 L', sampledQty: '5 L', template: 'RM-OIL-002',
      samplingPlan: 'AQL 1.5 Level-II', status: 'PENDING', inspector: '—', result: 'NOT_STARTED',
      decision: 'PENDING', acceptedQty: '-', rejectedQty: '-', ncrGenerated: false, sampledAt: '2026-02-18 11:00',
    },
  ]
  const statusColor: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700 border-amber-300',
    IN_INSPECTION: 'bg-blue-100 text-blue-700 border-blue-300',
    PASSED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    FAILED: 'bg-rose-100 text-rose-700 border-rose-300',
    CONDITIONAL: 'bg-purple-100 text-purple-700 border-purple-300',
  }
  const resultColor: Record<string, string> = {
    PASS: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    FAIL: 'bg-rose-100 text-rose-700 border-rose-300',
    CONDITIONAL: 'bg-purple-100 text-purple-700 border-purple-300',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-300',
    NOT_STARTED: 'bg-slate-100 text-slate-700 border-slate-300',
  }
  const decisionColor: Record<string, string> = {
    FULL_ACCEPTANCE: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    PARTIAL_ACCEPTANCE: 'bg-purple-100 text-purple-700 border-purple-300',
    CONDITIONAL: 'bg-amber-100 text-amber-700 border-amber-300',
    REJECTION: 'bg-rose-100 text-rose-700 border-rose-300',
    PENDING: 'bg-slate-100 text-slate-700 border-slate-300',
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ScanLine className="h-6 w-6 text-blue-600" />Incoming Inspection Queue</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 50 · IQC inspection lifecycle (Pending → In Inspection → Passed / Failed / Conditional) · AQL-based sampling · Auto NCR generation on failure</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Beaker className="mr-1 h-4 w-4" />Sampling Templates</Button>
          <Button size="sm">+ New Inspection</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map(w => (
          <Card key={w.label} className={`p-3 ${w.bg}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">{w.label}</p>
                <p className={`text-xl font-bold mt-1 ${w.color}`}>{w.value}</p>
                <p className="text-[10px] text-muted-foreground">{w.unit}</p>
              </div>
              <w.icon className="h-5 w-5 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-blue-600" />Inspection Queue — 6 Active Records</h3>
          <div className="flex items-center gap-2 text-[10px]">
            {Object.keys(statusColor).map(t => (
              <span key={t} className={`px-1.5 py-0.5 rounded ${statusColor[t]}`}>{t.replace('_', ' ')}</span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-2">IQC Code</th>
                <th className="text-left p-2">GRN / PO</th>
                <th className="text-left p-2">Supplier / Batch</th>
                <th className="text-left p-2">Material / Category</th>
                <th className="text-left p-2">Received / Sampled</th>
                <th className="text-left p-2">Template / Plan</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Inspector</th>
                <th className="text-left p-2">Result</th>
                <th className="text-left p-2">Decision</th>
                <th className="text-left p-2">Accepted / Rejected</th>
                <th className="text-center p-2">NCR</th>
              </tr>
            </thead>
            <tbody>
              {inspections.map(i => (
                <tr key={i.code} className="border-t hover:bg-muted/20">
                  <td className="p-2 align-top">
                    <code className="text-[10px] px-1 py-0.5 rounded bg-muted font-semibold">{i.code}</code>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{i.sampledAt}</p>
                  </td>
                  <td className="p-2 align-top">
                    <p className="font-medium">{i.grn}</p>
                    <p className="text-[10px] text-muted-foreground">{i.po}</p>
                  </td>
                  <td className="p-2 align-top">
                    <p className="font-medium">{i.supplier}</p>
                    <p className="text-[10px] text-muted-foreground">{i.supplierBatch}</p>
                  </td>
                  <td className="p-2 align-top">
                    <p className="font-medium">{i.material}</p>
                    <p className="text-[10px] text-muted-foreground">{i.category}</p>
                  </td>
                  <td className="p-2 align-top">
                    <p className="font-medium">{i.receivedQty}</p>
                    <p className="text-[10px] text-muted-foreground">Sample: {i.sampledQty}</p>
                  </td>
                  <td className="p-2 align-top">
                    <p className="font-medium">{i.template}</p>
                    <p className="text-[10px] text-muted-foreground">{i.samplingPlan}</p>
                  </td>
                  <td className="p-2 align-top"><Badge variant="outline" className={`text-[9px] ${statusColor[i.status]}`}>{i.status.replace('_', ' ')}</Badge></td>
                  <td className="p-2 align-top">{i.inspector}</td>
                  <td className="p-2 align-top"><Badge variant="outline" className={`text-[9px] ${resultColor[i.result]}`}>{i.result.replace('_', ' ')}</Badge></td>
                  <td className="p-2 align-top"><Badge variant="outline" className={`text-[9px] ${decisionColor[i.decision]}`}>{i.decision.replace('_', ' ')}</Badge></td>
                  <td className="p-2 align-top">
                    <p className="font-semibold text-emerald-700">{i.acceptedQty}</p>
                    <p className="text-[10px] text-rose-600">{i.rejectedQty}</p>
                  </td>
                  <td className="p-2 align-top text-center">
                    {i.ncrGenerated ? <AlertCircle className="h-4 w-4 text-rose-600 inline" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600/40 inline" />}
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

// ─── IQC Quality Hold Inventory ─────────────────────────────────────────
function IQCHoldModule() {
  const kpis = [
    { label: 'Hold Items', value: '5', unit: 'in quality gate', icon: PackageX, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Quality Hold', value: '2', unit: 'awaiting IQC', icon: PackageX, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Under Inspection', value: '1', unit: 'in progress', icon: Beaker, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Approved', value: '1', unit: 'pending release', icon: PackageCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Rejected', value: '1', unit: 'awaiting return', icon: PackageX, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Total Held Value', value: '₹2,85,000', unit: 'inventory blocked', icon: IndianRupee, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  ]
  const items = [
    {
      code: 'QHI-00048', grn: 'GRN-10428', inspection: 'IQC-00048', material: 'Cashew W320', supplier: 'Sri Balaji Cashews',
      batch: 'SBC-26-018', heldQty: '500 kg', releasedQty: '-', rejectedQty: '-', warehouse: 'WH-A (RM Store)', bin: 'A-12-03',
      status: 'UNDER_INSPECTION', heldTime: '2026-02-18 08:30', releasedTime: '-', value: 175000,
    },
    {
      code: 'QHI-00047', grn: 'GRN-10425', inspection: 'IQC-00045', material: 'Red Chilli Powder', supplier: 'Goyal Food Spices',
      batch: 'GF-CP-26-041', heldQty: '100 kg', releasedQty: '-', rejectedQty: '100 kg', warehouse: 'WH-A (Quarantine)', bin: 'Q-01-01',
      status: 'REJECTED', heldTime: '2026-02-17 15:00', releasedTime: '-', value: 28000,
    },
    {
      code: 'QHI-00046', grn: 'GRN-10424', inspection: 'IQC-00044', material: 'Corrugated Boxes 500g', supplier: 'Premium Packaging',
      batch: 'PP-BX-26-009', heldQty: '5000 pcs', releasedQty: '4500 pcs', rejectedQty: '500 pcs', warehouse: 'WH-C (Packaging)', bin: 'C-04-02',
      status: 'CONDITIONAL_RELEASE', heldTime: '2026-02-17 13:30', releasedTime: '2026-02-17 18:45', value: 32000,
    },
    {
      code: 'QHI-00045', grn: 'GRN-10423', inspection: 'IQC-00043', material: 'Palmolein Oil 15L', supplier: 'Fortune Oils',
      batch: 'FO-Palm-26-013', heldQty: '500 L', releasedQty: '-', rejectedQty: '-', warehouse: 'WH-A (Tank Farm)', bin: 'T-OIL-02',
      status: 'QUALITY_HOLD', heldTime: '2026-02-18 10:15', releasedTime: '-', value: 40000,
    },
    {
      code: 'QHI-00044', grn: 'GRN-10427', inspection: 'IQC-00047', material: 'Refined Sugar S30', supplier: 'EID Parry',
      batch: 'EP-S-26-005', heldQty: '500 kg', releasedQty: '500 kg', rejectedQty: '-', warehouse: 'WH-A (RM Store)', bin: 'A-08-01',
      status: 'APPROVED', heldTime: '2026-02-18 06:30', releasedTime: '2026-02-18 09:50', value: 10000,
    },
  ]
  const statusColor: Record<string, string> = {
    QUALITY_HOLD: 'bg-amber-100 text-amber-700 border-amber-300',
    UNDER_INSPECTION: 'bg-blue-100 text-blue-700 border-blue-300',
    APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    REJECTED: 'bg-rose-100 text-rose-700 border-rose-300',
    CONDITIONAL_RELEASE: 'bg-purple-100 text-purple-700 border-purple-300',
  }
  const flowSteps = [
    { stage: 'Quality Hold', desc: 'GRN posted, material blocked', icon: PackageX, color: 'text-amber-600', bg: 'bg-amber-100' },
    { stage: 'Inspection', desc: 'IQC sampling & testing', icon: Beaker, color: 'text-blue-600', bg: 'bg-blue-100' },
    { stage: 'Approved', desc: 'Released to available stock', icon: PackageCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { stage: 'Available', desc: 'Ready for manufacturing', icon: Package, color: 'text-emerald-700', bg: 'bg-emerald-200' },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><PackageX className="h-6 w-6 text-amber-600" />Quality Hold Inventory</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 50 · Material blocked at quality gate · 3-status inventory flow (Quality Hold → Approved → Available · or Rejected) · ₹2,85,000 value currently on hold</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Export Hold Report</Button>
          <Button size="sm">+ Manual Hold</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(w => (
          <Card key={w.label} className={`p-3 ${w.bg}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground">{w.label}</p>
                <p className={`text-xl font-bold mt-1 ${w.color}`}>{w.value}</p>
                <p className="text-[10px] text-muted-foreground">{w.unit}</p>
              </div>
              <w.icon className="h-5 w-5 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-emerald-50 border-amber-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm flex items-center gap-2"><Award className="h-4 w-4 text-amber-600" />Chief Architect Recommendation — 3-Status Inventory Flow</p>
            <p className="text-xs text-muted-foreground mt-1">All received material starts in <span className="font-semibold text-amber-700">Quality Hold</span> status. Only material that passes IQC inspection transitions to <span className="font-semibold text-emerald-700">Approved → Available</span>; failed material is segregated to <span className="font-semibold text-rose-700">Rejected</span>. This segregation prevents unverified or non-conforming material from entering manufacturing and ensures full FSSAI-compliant traceability from supplier to finished goods.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
              {flowSteps.map((s, i) => (
                <div key={s.stage} className={`rounded-lg border border-transparent p-2 ${s.bg} relative`}>
                  <div className="flex items-center gap-1">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{i + 1}</span>
                  </div>
                  <p className={`font-semibold text-[11px] mt-1 ${s.color}`}>{s.stage}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
                  {i < flowSteps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 absolute -right-2 top-1/2 -translate-y-1/2 hidden md:block" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2"><PackageX className="h-4 w-4 text-amber-600" />Quality Hold Items — 5 Records</h3>
          <div className="flex items-center gap-2 text-[10px]">
            {Object.keys(statusColor).map(t => (
              <span key={t} className={`px-1.5 py-0.5 rounded ${statusColor[t]}`}>{t.replace('_', ' ')}</span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground">
              <tr>
                <th className="text-left p-2">Hold Code</th>
                <th className="text-left p-2">GRN / IQC</th>
                <th className="text-left p-2">Material</th>
                <th className="text-left p-2">Supplier / Batch</th>
                <th className="text-left p-2">Held Qty</th>
                <th className="text-left p-2">Released Qty</th>
                <th className="text-left p-2">Rejected Qty</th>
                <th className="text-left p-2">Warehouse / Bin</th>
                <th className="text-right p-2">Value</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Held / Released</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.code} className="border-t hover:bg-muted/20">
                  <td className="p-2 align-top"><code className="text-[10px] px-1 py-0.5 rounded bg-muted font-semibold">{i.code}</code></td>
                  <td className="p-2 align-top">
                    <p className="font-medium">{i.grn}</p>
                    <p className="text-[10px] text-muted-foreground">{i.inspection}</p>
                  </td>
                  <td className="p-2 align-top font-medium">{i.material}</td>
                  <td className="p-2 align-top">
                    <p className="font-medium">{i.supplier}</p>
                    <p className="text-[10px] text-muted-foreground">{i.batch}</p>
                  </td>
                  <td className="p-2 align-top font-semibold text-amber-700">{i.heldQty}</td>
                  <td className="p-2 align-top font-semibold text-emerald-700">{i.releasedQty}</td>
                  <td className="p-2 align-top font-semibold text-rose-700">{i.rejectedQty}</td>
                  <td className="p-2 align-top">
                    <p className="font-medium">{i.warehouse}</p>
                    <p className="text-[10px] text-muted-foreground">Bin: {i.bin}</p>
                  </td>
                  <td className="p-2 align-top text-right font-semibold">₹{i.value.toLocaleString('en-IN')}</td>
                  <td className="p-2 align-top"><Badge variant="outline" className={`text-[9px] ${statusColor[i.status]}`}>{i.status.replace('_', ' ')}</Badge></td>
                  <td className="p-2 align-top">
                    <p className="text-[10px]">Held: {i.heldTime}</p>
                    <p className="text-[10px] text-emerald-600">Rel: {i.releasedTime}</p>
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

// ─── IQC Supplier NCR Center ────────────────────────────────────────────
function IQCNCRRModule() {
  const kpis = [
    { label: 'Total NCRs', value: '4', unit: 'last 30 days', icon: FileWarning, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Open', value: '1', unit: 'awaiting action', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Notified', value: '1', unit: 'supplier alerted', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Closed', value: '2', unit: 'resolved', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Critical', value: '2', unit: 'CAPA required', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Major', value: '1', unit: 'investigation', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    { label: 'Minor', value: '1', unit: 'monitor only', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  ]
  const ncrs = [
    {
      number: 'SNCR-00042', inspection: 'IQC-00045', grn: 'GRN-10425', supplier: 'Goyal Food Spices', material: 'Red Chilli Powder',
      batch: 'GF-CP-26-041', type: 'QUALITY_FAILURE', defect: 'Aflatoxin B1 detected at 12 ppb (limit: 5 ppb); color value below spec; foreign matter above tolerance',
      severity: 'CRITICAL', rootCause: 'Improper drying & storage at supplier warehouse; aged stock mixed with fresh batch',
      category: 'Microbiological & Foreign Matter', disposition: 'REJECT_RETURN', status: 'NOTIFIED',
      notifiedDate: '2026-02-17 17:30', responseDate: '-', closedDate: '-', correctiveActions: 3,
    },
    {
      number: 'SNCR-00041', inspection: 'IQC-00038', grn: 'GRN-10412', supplier: 'Goyal Food Spices', material: 'Turmeric Powder',
      batch: 'GF-TP-26-008', type: 'QUALITY_FAILURE', defect: 'Moisture content 11.2% vs spec max 8%; curcumin level 2.1% vs min 3.0%',
      severity: 'MAJOR', rootCause: 'Inadequate drying during harvest season; supplier QC oversight lapse',
      category: 'Chemical & Physical', disposition: 'REJECT_RETURN', status: 'CLOSED',
      notifiedDate: '2026-01-22 14:15', responseDate: '2026-01-23 10:00', closedDate: '2026-02-05 16:30', correctiveActions: 4,
    },
    {
      number: 'SNCR-00040', inspection: 'IQC-00033', grn: 'GRN-10398', supplier: 'Premium Packaging', material: 'Corrugated Boxes 200g',
      batch: 'PP-BX-26-004', type: 'PACKAGING_DAMAGE', defect: '15% boxes with crushed corners; printing smudge on batch code field; 8 boxes with weak side seams',
      severity: 'MINOR', rootCause: 'Transport damage due to inadequate palletization; printer maintenance gap',
      category: 'Packaging Integrity', disposition: 'PENDING_DISPOSITION', status: 'OPEN',
      notifiedDate: '2026-01-15 11:00', responseDate: '2026-01-16 09:30', closedDate: '-', correctiveActions: 2,
    },
    {
      number: 'SNCR-00039', inspection: 'IQC-00029', grn: 'GRN-10385', supplier: 'Local Spice Trader', material: 'Black Pepper Whole',
      batch: 'LST-BP-26-002', type: 'CONTAMINATION', defect: 'Live insect infestation (Tribolium castaneum) in 22% of bags; rodent droppings observed on pallets',
      severity: 'CRITICAL', rootCause: 'Non-compliant storage facility; no pest control program; expired fumigation certificate',
      category: 'Pest & Contamination', disposition: 'REJECT_DESTROY', status: 'CLOSED',
      notifiedDate: '2026-01-08 09:45', responseDate: '2026-01-08 16:20', closedDate: '2026-01-20 17:00', correctiveActions: 5,
    },
  ]
  const severityColor: Record<string, string> = {
    CRITICAL: 'bg-rose-100 text-rose-700 border-rose-300',
    MAJOR: 'bg-orange-100 text-orange-700 border-orange-300',
    MINOR: 'bg-amber-100 text-amber-700 border-amber-300',
  }
  const statusColor: Record<string, string> = {
    OPEN: 'bg-amber-100 text-amber-700 border-amber-300',
    NOTIFIED: 'bg-blue-100 text-blue-700 border-blue-300',
    INVESTIGATING: 'bg-purple-100 text-purple-700 border-purple-300',
    VERIFIED: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    CLOSED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  }
  const dispositionColor: Record<string, string> = {
    REJECT_RETURN: 'bg-rose-100 text-rose-700 border-rose-300',
    REJECT_DESTROY: 'bg-rose-100 text-rose-700 border-rose-300',
    PARTIAL_USE: 'bg-purple-100 text-purple-700 border-purple-300',
    REWORK: 'bg-amber-100 text-amber-700 border-amber-300',
    ACCEPT_AS_IS: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    PENDING_DISPOSITION: 'bg-slate-100 text-slate-700 border-slate-300',
  }
  const typeIcon: Record<string, any> = {
    QUALITY_FAILURE: Beaker,
    PACKAGING_DAMAGE: PackageX,
    CONTAMINATION: AlertCircle,
    LABELING_ERROR: FileWarning,
    DOCUMENTATION: FileText,
    DELIVERY_NONCONFORMANCE: Truck,
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><FileWarning className="h-6 w-6 text-purple-600" />Supplier NCR Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 50 · Supplier Non-Conformance Reports · Auto-generated from IQC failures · Root cause analysis · Corrective action tracking · Supplier disposition (Reject / Return / Destroy / Partial Use)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Export NCR Log</Button>
          <Button size="sm">+ Manual NCR</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {kpis.map(w => (
          <Card key={w.label} className={`p-3 ${w.bg}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground">{w.label}</p>
                <p className={`text-xl font-bold mt-1 ${w.color}`}>{w.value}</p>
                <p className="text-[10px] text-muted-foreground">{w.unit}</p>
              </div>
              <w.icon className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {ncrs.map(n => {
          const TypeIcon = typeIcon[n.type] || FileWarning
          return (
            <Card key={n.number} className={`p-4 ${n.severity === 'CRITICAL' ? 'border-rose-300 bg-rose-50/30' : n.severity === 'MAJOR' ? 'border-orange-300 bg-orange-50/30' : 'border-amber-300 bg-amber-50/30'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${severityColor[n.severity]}`}>
                    <TypeIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{n.number}</p>
                    <p className="text-[10px] text-muted-foreground">{n.inspection} · {n.grn}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={`text-[9px] font-bold ${severityColor[n.severity]}`}>{n.severity}</Badge>
                  <Badge variant="outline" className={`text-[9px] ${statusColor[n.status]}`}>{n.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Supplier</p>
                  <p className="font-medium">{n.supplier}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Material / Batch</p>
                  <p className="font-medium">{n.material}</p>
                  <p className="text-[10px] text-muted-foreground">{n.batch}</p>
                </div>
              </div>
              <div className="rounded-lg bg-white border p-2 mb-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Defect Description</p>
                <p className="text-[11px] text-foreground">{n.defect}</p>
              </div>
              <div className="rounded-lg bg-white border p-2 mb-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Root Cause Analysis</p>
                <p className="text-[11px] text-foreground">{n.rootCause}</p>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[9px] bg-slate-100 text-slate-700 border-slate-300">{n.category}</Badge>
                <Badge variant="outline" className={`text-[9px] ${dispositionColor[n.disposition]}`}>{n.disposition.replace('_', ' ')}</Badge>
                <Badge variant="outline" className="text-[9px] bg-cyan-100 text-cyan-700 border-cyan-300">{n.correctiveActions} CAPAs</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] border-t pt-2">
                <div>
                  <p className="text-muted-foreground">Notified</p>
                  <p className="font-medium">{n.notifiedDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Response</p>
                  <p className={`font-medium ${n.responseDate === '-' ? 'text-amber-600' : ''}`}>{n.responseDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Closed</p>
                  <p className={`font-medium ${n.closedDate === '-' ? 'text-amber-600' : 'text-emerald-600'}`}>{n.closedDate}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── IQC Vendor Performance Scorecard ───────────────────────────────────
function IQCVendorScorecardModule() {
  const summary = {
    total: 6, 'A+': 2, A: 2, B: 0, C: 1, D: 1,
    avgOnTime: 89.6, avgQuality: 89.6, avgOverall: 86.9,
  }
  const scorecards = [
    {
      code: 'SUP-001', name: 'Sri Balaji Cashews', category: 'Dry Fruits', rating: 'A+', overall: 97.4,
      metrics: { onTime: 98.2, quality: 98.5, acceptance: 98.5, rejection: 1.5, responseHrs: 4.5, complaintRate: 0.2, auditScore: 96, priceStability: 98 },
      deliveries: 142, inspections: 142, ncrs: 1, acceptedQty: '7100 kg', rejectedQty: '108 kg',
    },
    {
      code: 'SUP-014', name: 'EID Parry', category: 'Sugar & Sweeteners', rating: 'A+', overall: 99.1,
      metrics: { onTime: 99.5, quality: 99.0, acceptance: 99.0, rejection: 1.0, responseHrs: 2.0, complaintRate: 0.0, auditScore: 99, priceStability: 97 },
      deliveries: 88, inspections: 88, ncrs: 0, acceptedQty: '4400 kg', rejectedQty: '44 kg',
    },
    {
      code: 'SUP-022', name: 'Amul Dairy', category: 'Dairy', rating: 'A', overall: 95.5,
      metrics: { onTime: 96.8, quality: 97.8, acceptance: 97.8, rejection: 2.2, responseHrs: 6.0, complaintRate: 0.5, auditScore: 94, priceStability: 92 },
      deliveries: 65, inspections: 65, ncrs: 1, acceptedQty: '1950 kg', rejectedQty: '44 kg',
    },
    {
      code: 'SUP-031', name: 'Goyal Food Spices', category: 'Spices', rating: 'C', overall: 78.2,
      metrics: { onTime: 82.0, quality: 82.5, acceptance: 82.5, rejection: 17.5, responseHrs: 24.0, complaintRate: 3.2, auditScore: 72, priceStability: 75 },
      deliveries: 54, inspections: 54, ncrs: 4, acceptedQty: '1080 kg', rejectedQty: '230 kg',
    },
    {
      code: 'SUP-038', name: 'Premium Packaging', category: 'Packaging', rating: 'A', overall: 93.0,
      metrics: { onTime: 94.5, quality: 95.0, acceptance: 95.0, rejection: 5.0, responseHrs: 8.0, complaintRate: 1.0, auditScore: 92, priceStability: 95 },
      deliveries: 76, inspections: 76, ncrs: 2, acceptedQty: '38000 pcs', rejectedQty: '2000 pcs',
    },
    {
      code: 'SUP-061', name: 'Local Spice Trader', category: 'Spices', rating: 'D', overall: 58.2,
      metrics: { onTime: 67.0, quality: 65.0, acceptance: 65.0, rejection: 35.0, responseHrs: 48.0, complaintRate: 8.5, auditScore: 45, priceStability: 60 },
      deliveries: 22, inspections: 22, ncrs: 5, acceptedQty: '285 kg', rejectedQty: '153 kg',
    },
  ]
  const ratingColor: Record<string, string> = {
    'A+': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'A': 'bg-blue-100 text-blue-700 border-blue-300',
    'B': 'bg-amber-100 text-amber-700 border-amber-300',
    'C': 'bg-orange-100 text-orange-700 border-orange-300',
    'D': 'bg-rose-100 text-rose-700 border-rose-300',
  }
  const ratingBar: Record<string, string> = {
    'A+': 'bg-emerald-500', 'A': 'bg-blue-500', 'B': 'bg-amber-500', 'C': 'bg-orange-500', 'D': 'bg-rose-500',
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Award className="h-6 w-6 text-purple-600" />Vendor Performance Scorecard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 50 · 8-metric supplier scorecard · On-time delivery · Quality · Acceptance · Rejection · Response time · Complaint rate · Audit score · Price stability</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Export Scorecards</Button>
          <Button size="sm"><Star className="mr-1 h-4 w-4" />Recompute Ratings</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 bg-purple-50 border-purple-200">
          <p className="text-[11px] text-muted-foreground">Total Suppliers</p>
          <p className="text-xl font-bold mt-1 text-purple-600">{summary.total}</p>
          <p className="text-[10px] text-muted-foreground">scored this quarter</p>
        </Card>
        <Card className="p-3 bg-emerald-50 border-emerald-200">
          <p className="text-[11px] text-muted-foreground">Top Rated (A+)</p>
          <p className="text-xl font-bold mt-1 text-emerald-600">{summary['A+']}</p>
          <p className="text-[10px] text-muted-foreground">{summary.A} A · {summary.B} B</p>
        </Card>
        <Card className="p-3 bg-orange-50 border-orange-200">
          <p className="text-[11px] text-muted-foreground">At Risk (C)</p>
          <p className="text-xl font-bold mt-1 text-orange-600">{summary.C}</p>
          <p className="text-[10px] text-muted-foreground">conditional approval</p>
        </Card>
        <Card className="p-3 bg-rose-50 border-rose-200">
          <p className="text-[11px] text-muted-foreground">Suspended (D)</p>
          <p className="text-xl font-bold mt-1 text-rose-600">{summary.D}</p>
          <p className="text-[10px] text-muted-foreground">deactivate vendor</p>
        </Card>
        <Card className="p-3 bg-blue-50 border-blue-200">
          <p className="text-[11px] text-muted-foreground">Avg Overall Score</p>
          <p className="text-xl font-bold mt-1 text-blue-600">{summary.avgOverall}%</p>
          <p className="text-[10px] text-muted-foreground">on-time {summary.avgOnTime}% · quality {summary.avgQuality}%</p>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {scorecards.map(s => {
          const metricRows = [
            { label: 'On-Time Delivery', value: `${s.metrics.onTime}%`, pct: s.metrics.onTime, good: s.metrics.onTime >= 90 },
            { label: 'Quality Score', value: `${s.metrics.quality}%`, pct: s.metrics.quality, good: s.metrics.quality >= 90 },
            { label: 'Acceptance Rate', value: `${s.metrics.acceptance}%`, pct: s.metrics.acceptance, good: s.metrics.acceptance >= 90 },
            { label: 'Rejection Rate', value: `${s.metrics.rejection}%`, pct: s.metrics.rejection, good: s.metrics.rejection <= 5, invert: true },
            { label: 'Response Time', value: `${s.metrics.responseHrs} hrs`, pct: Math.max(0, 100 - s.metrics.responseHrs * 2), good: s.metrics.responseHrs <= 8 },
            { label: 'Complaint Rate', value: `${s.metrics.complaintRate}/100`, pct: Math.max(0, 100 - s.metrics.complaintRate * 10), good: s.metrics.complaintRate <= 1 },
            { label: 'Audit Score', value: `${s.metrics.auditScore}/100`, pct: s.metrics.auditScore, good: s.metrics.auditScore >= 85 },
            { label: 'Price Stability', value: `${s.metrics.priceStability}%`, pct: s.metrics.priceStability, good: s.metrics.priceStability >= 90 },
          ]
          return (
            <Card key={s.code} className={`p-4 ${s.rating === 'D' ? 'border-rose-300' : s.rating === 'C' ? 'border-orange-300' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${ratingColor[s.rating]}`}>
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">{s.code} · {s.category}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={`text-[10px] font-bold ${ratingColor[s.rating]}`}>{s.rating}</Badge>
                  <p className={`text-lg font-bold ${s.rating === 'D' ? 'text-rose-600' : s.rating === 'C' ? 'text-orange-600' : 'text-emerald-600'}`}>{s.overall}</p>
                </div>
              </div>
              <div className="space-y-1.5 mb-3">
                {metricRows.map(m => (
                  <div key={m.label} className="grid grid-cols-[1fr_auto] gap-2 items-center text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground w-28">{m.label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${m.good ? 'bg-emerald-500' : m.invert ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(100, m.pct)}%` }} />
                      </div>
                    </div>
                    <span className={`font-semibold w-16 text-right ${m.good ? 'text-emerald-700' : m.invert ? 'text-amber-700' : 'text-rose-700'}`}>{m.value}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 border-t pt-2 text-[10px]">
                <div className="rounded bg-muted/40 px-1.5 py-1">
                  <p className="text-muted-foreground">Deliveries</p>
                  <p className="font-semibold">{s.deliveries}</p>
                </div>
                <div className="rounded bg-muted/40 px-1.5 py-1">
                  <p className="text-muted-foreground">Inspections</p>
                  <p className="font-semibold">{s.inspections}</p>
                </div>
                <div className="rounded bg-muted/40 px-1.5 py-1">
                  <p className="text-muted-foreground">NCRs</p>
                  <p className={`font-semibold ${s.ncrs > 2 ? 'text-rose-600' : s.ncrs > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{s.ncrs}</p>
                </div>
                <div className="rounded bg-emerald-50 px-1.5 py-1 col-span-1">
                  <p className="text-muted-foreground">Accepted</p>
                  <p className="font-semibold text-emerald-700">{s.acceptedQty}</p>
                </div>
                <div className="rounded bg-rose-50 px-1.5 py-1 col-span-2">
                  <p className="text-muted-foreground">Rejected</p>
                  <p className="font-semibold text-rose-700">{s.rejectedQty}</p>
                </div>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full ${ratingBar[s.rating]}`} style={{ width: `${s.overall}%` }} />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ─── IQC Incoming Quality Overview Dashboard ────────────────────────────
function IQCDashboardModule() {
  const kpis = [
    { label: 'Active Suppliers', value: '48', unit: '32 approved · 12 preferred', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Inspections (Week)', value: '24', unit: '18 passed · 2 failed', icon: ClipboardCheck, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { label: 'Hold Items', value: '5', unit: '₹2,85,000 blocked', icon: PackageX, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Open NCRs', value: '2', unit: '2 critical · 0 major', icon: FileWarning, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Avg Acceptance', value: '94.2%', unit: 'last 90 days', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Avg Overall Score', value: '86.9%', unit: '6 scored vendors', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  ]
  const qualityGate = [
    { stage: 'Purchase Order', desc: 'PO issued to approved supplier', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { stage: 'Goods Receipt (GRN)', desc: 'Material received & logged', icon: Package, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { stage: 'Quality Hold', desc: 'Stock blocked pending IQC', icon: PackageX, color: 'text-amber-600', bg: 'bg-amber-100' },
    { stage: 'IQC Inspection', desc: 'Sampling & testing per AQL', icon: Beaker, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { stage: 'Pass / Fail Decision', desc: 'Full / Partial / Rejection', icon: ClipboardCheck, color: 'text-purple-600', bg: 'bg-purple-100' },
    { stage: 'Approved / Rejected', desc: 'Released or quarantined', icon: PackageCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { stage: 'Manufacturing', desc: 'Available for production', icon: Building2, color: 'text-teal-600', bg: 'bg-teal-100' },
  ]
  const todaySummary = [
    { label: 'Inspections Done', value: '6', icon: ClipboardCheck, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Pass Rate', value: '66.7%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Fail Rate', value: '16.7%', icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50 border-emerald-200' },
    { label: 'Items Released', value: '3', icon: PackageCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Items Rejected', value: '1', icon: PackageX, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  ]
  const alerts = [
    { level: 'CRITICAL', title: 'SNCR-00042 — Aflatoxin in Red Chilli Powder', desc: 'Goyal Food Spices batch GF-CP-26-041 · 12 ppb vs 5 ppb limit · 100 kg rejected · Supplier notified', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { level: 'HIGH', title: 'IQC-00043 Overdue — Palmolein Oil inspection pending', desc: 'Fortune Oils · 500 L on Quality Hold since 10:15 · SLA breach in 2 hrs · Inspector unassigned', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    { level: 'MEDIUM', title: 'Calibration Due — Moisture Analyser MA-02', desc: 'Last calibrated 2025-11-20 · 90-day cycle breached · Lab-1 RM Testing · 8 inspections at risk', icon: Beaker, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { level: 'MEDIUM', title: 'Supplier Cert Expiring — Local Spice Trader FSSAI License', desc: 'Expires 2026-03-15 (25 days) · Supplier currently SUSPENDED · Re-certification required before reactivation', icon: FileWarning, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  ]
  const alertColor: Record<string, string> = {
    CRITICAL: 'bg-rose-100 text-rose-700 border-rose-300',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-300',
    MEDIUM: 'bg-amber-100 text-amber-700 border-amber-300',
    LOW: 'bg-blue-100 text-blue-700 border-blue-300',
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-emerald-600" />Incoming Quality Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 50 · Supplier Quality & IQC unified dashboard · Quality Gate workflow (PO → GRN → Hold → Inspection → Pass/Fail → Release → Manufacturing) · Real-time alerts & today's summary</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Daily Quality Brief</Button>
          <Button size="sm"><ScanLine className="mr-1 h-4 w-4" />Start Inspection</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(w => (
          <Card key={w.label} className={`p-3 ${w.bg}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground">{w.label}</p>
                <p className={`text-xl font-bold mt-1 ${w.color}`}>{w.value}</p>
                <p className="text-[10px] text-muted-foreground">{w.unit}</p>
              </div>
              <w.icon className="h-5 w-5 text-muted-foreground/50" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4 bg-gradient-to-r from-blue-50 via-amber-50 to-emerald-50 border-blue-300">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-sm flex items-center gap-2"><Award className="h-4 w-4 text-blue-600" />Quality Gate Workflow — PO to Manufacturing (7 Stages)</p>
            <p className="text-xs text-muted-foreground mt-1">Every incoming material must traverse this 7-stage quality gate before entering production. No material can skip stages — the inventory system physically blocks movement from Quality Hold to Available until IQC inspection decision is recorded.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {qualityGate.map((g, i) => (
            <div key={g.stage} className={`rounded-lg border border-transparent p-2 ${g.bg} relative`}>
              <div className="flex items-center gap-1">
                <g.icon className={`h-4 w-4 ${g.color}`} />
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{i + 1}</span>
              </div>
              <p className={`font-semibold text-[11px] mt-1 ${g.color}`}>{g.stage}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{g.desc}</p>
              {i < qualityGate.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 absolute -right-2 top-1/2 -translate-y-1/2 hidden lg:block" />}
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="p-4 lg:col-span-1">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-blue-600" />Today's Summary</h3>
          <div className="space-y-2">
            {todaySummary.map(t => (
              <div key={t.label} className={`rounded-lg border p-2 ${t.bg} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <t.icon className={`h-4 w-4 ${t.color}`} />
                  <span className="text-xs font-medium">{t.label}</span>
                </div>
                <span className={`text-lg font-bold ${t.color}`}>{t.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-muted/40 p-2 border">
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Cumulative This Week</p>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <p className="text-[10px] text-muted-foreground">Inspections</p>
                <p className="text-sm font-bold text-blue-600">24</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Pass Rate</p>
                <p className="text-sm font-bold text-emerald-600">75.0%</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Items Released</p>
                <p className="text-sm font-bold text-emerald-600">21</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Items Rejected</p>
                <p className="text-sm font-bold text-rose-600">3</p>
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-600" />Quality Alerts & Escalations</h3>
            <Badge variant="outline" className="text-[9px] bg-rose-100 text-rose-700 border-rose-300">4 active</Badge>
          </div>
          <div className="space-y-2">
            {alerts.map(a => (
              <div key={a.title} className={`rounded-lg border p-3 ${a.bg}`}>
                <div className="flex items-start gap-2">
                  <a.icon className={`h-4 w-4 ${a.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={`text-[9px] ${alertColor[a.level]}`}>{a.level}</Badge>
                      <p className="font-semibold text-xs">{a.title}</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="p-4 bg-emerald-50 border-emerald-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Sprint 50 — Supplier Quality & IQC Module Summary</p>
            <p className="text-xs text-muted-foreground mt-1">5 integrated sub-modules governing incoming quality: <span className="font-semibold text-blue-700">Supplier Quality Dashboard</span> (48 vendors), <span className="font-semibold text-indigo-700">Inspection Queue</span> (24/week), <span className="font-semibold text-amber-700">Quality Hold Inventory</span> (3-status flow), <span className="font-semibold text-purple-700">Supplier NCR Center</span> (4 NCRs), <span className="font-semibold text-pink-700">Vendor Scorecard</span> (8-metric rating). All modules enforce FSSAI traceability from PO to manufacturing release.</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
              <div className="rounded-lg p-2 bg-white border border-emerald-200">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Suppliers</p>
                <p className="text-sm font-bold text-blue-600">48 active</p>
              </div>
              <div className="rounded-lg p-2 bg-white border border-emerald-200">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Inspections</p>
                <p className="text-sm font-bold text-indigo-600">24 this week</p>
              </div>
              <div className="rounded-lg p-2 bg-white border border-emerald-200">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Hold Value</p>
                <p className="text-sm font-bold text-amber-600">₹2,85,000</p>
              </div>
              <div className="rounded-lg p-2 bg-white border border-emerald-200">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Open NCRs</p>
                <p className="text-sm font-bold text-rose-600">2 critical</p>
              </div>
              <div className="rounded-lg p-2 bg-white border border-emerald-200">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Avg Score</p>
                <p className="text-sm font-bold text-purple-600">86.9%</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

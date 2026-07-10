// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 53 — LABORATORY INFORMATION MANAGEMENT SYSTEM (LIMS)
// Admin modules: LIMS Dashboard, Sample Registration & Tracking, Laboratory Worklist,
// Laboratory Equipment, Laboratory Inventory
// ═══════════════════════════════════════════════════════════════════════════════
// ICON IMPORT NOTE: 23 of 24 requested icons are ALREADY imported in
// src/app/page.tsx (lines 4–34). No new icon imports needed. Verified icons:
//   FlaskConical, Beaker, Microscope, QrCode, Barcode, ClipboardCheck,
//   FileText, Clock, AlertTriangle, AlertCircle, CheckCircle2, X,
//   Package, PackageX, Wrench, Calendar, Download, Plus, Activity,
//   Thermometer, Droplets, ScanLine, History
//
// TestTube is NOT exported by lucide-react (it does not exist in the
// installed version). Per task spec fallback rule, FlaskConical is used in
// its place for test-type and worklist-row indicators.
//
// CONFLICT NOTE: grep of `^function.*Module` in src/app/page.tsx against
// (lims|lab|sample|worklist|testing|equipment|inventory|report) returned
// TWO existing collisions:
//   - InventoryModule    (line 3277)
//   - EquipmentModule    (line 11026)
// (plus EquipmentMasterModule, EquipmentAnalyticsModule, WarehouseEquipmentAnalyticsModule,
//  EquipmentHealthModule, ExecutiveReportsModule, LaborCostModule — non-matching but adjacent)
// Per task spec, ALL Sprint 53 modules use the `LIMS` prefix:
//   LIMSDashboardModule, LIMSSamplesModule, LIMSWorklistModule,
//   LIMSEquipmentModule, LIMSInventoryModule
// Zero residual collisions.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── LIMS Dashboard ─────────────────────────────────────────────────────
function LIMSDashboardModule() {
  // KPIs — Samples (248), Tests (1240), Equipment (12), Inventory (48), Worklists (3), Reports (215)
  const kpis = [
    { label: 'Total Samples', value: '248', unit: '12 pending · 8 collected · 5 received · 3 testing · 2 validation · 215 approved · 3 rejected', icon: FlaskConical, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Pending Samples', value: '12', unit: 'awaiting collection', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Collected', value: '8', unit: 'en route to lab', icon: ScanLine, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
    { label: 'Received', value: '5', unit: 'lab receipt logged', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { label: 'In Testing', value: '3', unit: 'analysis in progress', icon: Beaker, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'In Validation', value: '2', unit: 'analyst review', icon: ClipboardCheck, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    { label: 'Approved', value: '215', unit: 'certified samples', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Rejected', value: '3', unit: 'OOS / non-conforming', icon: X, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Total Tests', value: '1240', unit: '18 pending · 5 in progress · 1210 completed · 4 overdue · 2 OOS', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Tests In Progress', value: '5', unit: 'being analyzed', icon: Beaker, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Tests Overdue', value: '4', unit: 'past TAT', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'OOS Tests', value: '2', unit: 'out of specification', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Equipment', value: '12', unit: '2 calibration due · 1 overdue', icon: Microscope, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
    { label: 'Calibration Due', value: '2', unit: 'within 7 days', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Calibration Overdue', value: '1', unit: 'must be removed', icon: Wrench, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Inventory Items', value: '48', unit: '4 low stock · 2 expiring · 1 expired', icon: Package, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
    { label: 'Low Stock Items', value: '4', unit: 'below min threshold', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
    { label: 'Expiring Soon', value: '2', unit: 'within 30 days', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Expired Items', value: '1', unit: 'quarantine required', icon: PackageX, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { label: 'Open Worklists', value: '3', unit: 'WL-003 in progress · WL-002 overdue · WL-001 completed', icon: ClipboardCheck, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Reports Generated', value: '215', unit: 'COAs · certificates · summaries', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  ]

  // Chief Architect recommendation — Retention Sample Program (8-stage lifecycle)
  const retentionStages = [
    {
      stage: 1, code: 'BATCH', name: 'Batch Production',
      icon: Package, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-300',
      desc: 'A finished goods batch is produced and packed. FGQC sampling plan identifies the unit to be retained as the retention sample for that batch.',
      actor: 'Production', output: 'Batch + sample identifier',
    },
    {
      stage: 2, code: 'FGQC', name: 'FGQC Inspection',
      icon: ClipboardCheck, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-300',
      desc: 'Finished Goods Quality Control inspects the batch. The retention sample is sealed, labelled with batch + mfg + expiry dates, and segregated from saleable stock.',
      actor: 'FGQC Inspector', output: 'Sealed retention sample',
    },
    {
      stage: 3, code: 'RETENTION_SAMPLE', name: 'Retention Sample Tagging',
      icon: FlaskConical, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-300',
      desc: 'Retention sample is registered in LIMS with sample_type = RETENTION. Linked to the originating batch, FGQC inspection record, and quality certificate.',
      actor: 'Lab Manager', output: 'LIMS retention record',
    },
    {
      stage: 4, code: 'BARCODE', name: 'Barcode & Seal',
      icon: Barcode, color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-300',
      desc: 'Tamper-evident seal applied; barcode (SMP-RET-xxx) printed and affixed. Chain-of-custody begins — every custody transfer scanned into LIMS from this point forward.',
      actor: 'Lab Analyst', output: 'Barcode + seal number',
    },
    {
      stage: 5, code: 'STORAGE', name: 'Storage in Retention Room',
      icon: Package, color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-300',
      desc: 'Sample stored in dedicated retention room under controlled temperature/humidity. Storage condition (ambient / 2-8°C / -20°C) matches product specification.',
      actor: 'Storekeeper', output: 'Storage location logged',
    },
    {
      stage: 6, code: 'HOLD_6_12_MONTHS', name: '6–12 Months Hold',
      icon: History, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-300',
      desc: 'Sample held for 6 months (perishables) to 12 months (shelf-stable) past expiry. Auto-alerts at 30/7/0 days to expiry of retention period. No testing unless triggered.',
      actor: 'LIMS (automated)', output: 'Hold timer + alerts',
    },
    {
      stage: 7, code: 'COMPLAINT_AUDIT', name: 'Complaint / Audit Retrieval',
      icon: Microscope, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-300',
      desc: 'Sample retrieved for investigation on customer complaint, regulatory audit, or market-return verification. Full chain-of-custody maintained during retrieval and post-test return.',
      actor: 'QA / Auditor', output: 'Investigation test results',
    },
    {
      stage: 8, code: 'DISPOSAL', name: 'Controlled Disposal',
      icon: PackageX, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-300',
      desc: 'On retention-period expiry (with no complaint/audit pull), sample is disposed per SOP with witness signature. Disposal record closes the chain-of-custody.',
      actor: 'Lab Manager + Witness', output: 'Disposal certificate',
    },
  ]

  // Sample lifecycle flow — 9-stage chain
  const lifecycle = [
    { step: 1, code: 'QUALITY_REQUEST', name: 'Quality Request', icon: FileText, color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { step: 2, code: 'SAMPLE_REGISTRATION', name: 'Sample Registration', icon: FlaskConical, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { step: 3, code: 'BARCODE_PRINTED', name: 'Barcode Printed', icon: Barcode, color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { step: 4, code: 'COLLECTION', name: 'Collection', icon: ScanLine, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { step: 5, code: 'LAB_RECEIPT', name: 'Lab Receipt', icon: Package, color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { step: 6, code: 'TESTING', name: 'Testing', icon: Beaker, color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { step: 7, code: 'VALIDATION', name: 'Validation', icon: ClipboardCheck, color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { step: 8, code: 'CERTIFICATE', name: 'Certificate', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { step: 9, code: 'ARCHIVE', name: 'Archive', icon: History, color: 'bg-slate-100 text-slate-700 border-slate-300' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><FlaskConical className="h-6 w-6 text-purple-600" />LIMS Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 53 · Laboratory Information Management System · 248 samples · 1240 tests · 12 instruments · 48 inventory items · 3 open worklists · 215 reports generated · End-to-end sample lifecycle from quality request to archive</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />LIMS Report</Button>
          <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" />Export KPIs</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Sample</Button>
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
            <p className="text-[10px] text-muted-foreground leading-tight">{kpi.unit}</p>
          </Card>
        ))}
      </div>

      {/* Sample lifecycle flow */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><Activity className="h-4 w-4 text-blue-600" />Sample Lifecycle · Quality Request to Archive</h3>
            <p className="text-xs text-muted-foreground mt-0.5">9-stage sample lifecycle — every sample is barcode-tracked and chain-of-custody maintained from quality request through registration, collection, lab receipt, testing, validation, certificate generation, and archive</p>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />Live
          </Badge>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {lifecycle.map((step, i) => (
            <div key={step.code} className="flex items-center gap-1 shrink-0">
              <div className={`rounded-lg border ${step.color} px-3 py-2 min-w-[150px]`}>
                <div className="flex items-center gap-1.5">
                  <step.icon className="h-3.5 w-3.5" />
                  <span className="text-[9px] uppercase font-bold tracking-wide">Stage {step.step}</span>
                </div>
                <p className="text-[11px] font-semibold mt-1">{step.name}</p>
              </div>
              {i < lifecycle.length - 1 && (
                <span className="text-slate-400 shrink-0">→</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Chief Architect recommendation — Retention Sample Program */}
      <Card className="p-5 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <FlaskConical className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm flex items-center gap-2"><FlaskConical className="h-4 w-4 text-purple-600" />Chief Architect Recommendation — Retention Sample Program (8-Stage Lifecycle)</p>
            <p className="text-xs text-muted-foreground mt-1">Every finished goods batch produces a sealed <span className="font-semibold text-purple-700">retention sample</span> that is barcode-tracked, stored under controlled conditions for 6–12 months past expiry, available for complaint/audit retrieval, and disposed with witness signature. The retention program closes the traceability loop — any market complaint or audit can be cross-verified against the physical retention sample and its LIMS chain-of-custody record.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              {retentionStages.map((s) => (
                <div key={s.code} className={`rounded-lg border p-3 ${s.bg}`}>
                  <div className="flex items-center gap-1.5">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Stage {s.stage}</span>
                  </div>
                  <p className={`font-semibold text-xs mt-1 ${s.color}`}>{s.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{s.desc}</p>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-1">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Actor</p>
                      <p className="text-[10px] font-semibold text-foreground">{s.actor}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Output</p>
                      <p className="text-[10px] font-semibold text-foreground">{s.output}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Quick alert panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 border-rose-200 bg-rose-50/40">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-5 w-5 text-rose-600" />
            <p className="text-sm font-semibold text-rose-700">1 Equipment Calibration Overdue</p>
          </div>
          <p className="text-[11px] text-muted-foreground">Weighing Scale 01 (WS-01) — calibration expired 2026-02-10. Per LIMS rule, expired instruments cannot record results. Equipment blocked from new test assignments until recalibrated.</p>
          <Button size="sm" variant="outline" className="mt-2 w-full text-[11px] h-7">Schedule Recalibration</Button>
        </Card>
        <Card className="p-4 border-orange-200 bg-orange-50/40">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <p className="text-sm font-semibold text-orange-700">4 Inventory Alerts</p>
          </div>
          <p className="text-[11px] text-muted-foreground">Agar Powder (low stock), pH Buffer 4.01 (low stock + expiring in 18 days), Sodium Hydroxide 0.1N (monitoring), Petri Dishes (OK). 1 expired item pending quarantine.</p>
          <Button size="sm" variant="outline" className="mt-2 w-full text-[11px] h-7">View Inventory Alerts</Button>
        </Card>
        <Card className="p-4 border-amber-200 bg-amber-50/40">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <p className="text-sm font-semibold text-amber-700">4 Tests Overdue · 2 OOS</p>
          </div>
          <p className="text-[11px] text-muted-foreground">WL-002 has 1 overdue test (Moisture on LAB-00244). 2 OOS results triggered retest workflow and QA investigation. CAPA records linked for root-cause analysis.</p>
          <Button size="sm" variant="outline" className="mt-2 w-full text-[11px] h-7">View Overdue Tests</Button>
        </Card>
      </div>
    </div>
  )
}

// ─── LIMS Sample Registration & Tracking ───────────────────────────────
function LIMSSamplesModule() {
  // 5 samples with full registration + tracking detail
  const samples = [
    {
      sampleNumber: 'LAB-00248', barcode: 'SMP-LAB-00248', type: 'FINISHED_GOODS',
      batch: 'BATCH-KK-500-26F003', product: 'Kaju Katli 500g', supplier: '— (in-house)',
      sourceModule: 'FGQC', requestedBy: 'R. Nair (FGQC)', collectedBy: 'A. Reddy (Lab Analyst)',
      collectedAt: '2026-02-18 10:45', status: 'APPROVED', priority: 'ROUTINE',
      receivedAt: '2026-02-18 11:10', testedAt: '2026-02-18 13:30', approvedAt: '2026-02-18 15:20',
      storageLoc: 'LAB-ROOM-1 / SHELF-A3', storageCond: 'Ambient (15-30°C)',
      custody: [
        { at: '2026-02-18 10:45', by: 'A. Reddy', action: 'Collected from FGQC hold zone', loc: 'FGQC-HOLD' },
        { at: '2026-02-18 11:10', by: 'S. Mehta', action: 'Received at lab', loc: 'LAB-ROOM-1' },
        { at: '2026-02-18 13:30', by: 'A. Reddy', action: 'Released for testing', loc: 'LAB-ROOM-1' },
        { at: '2026-02-18 15:20', by: 'Dr. A. Mehta', action: 'Approved & certified', loc: 'LAB-ROOM-1' },
      ],
    },
    {
      sampleNumber: 'LAB-00247', barcode: 'SMP-LAB-00247', type: 'RAW_MATERIAL',
      batch: 'BATCH-CAS-26F018', product: 'Cashew (Grade W240)', supplier: 'Mumbai Dry Fruits Pvt Ltd',
      sourceModule: 'IQC', requestedBy: 'P. Verma (IQC)', collectedBy: 'A. Reddy (Lab Analyst)',
      collectedAt: '2026-02-18 09:30', status: 'APPROVED', priority: 'ROUTINE',
      receivedAt: '2026-02-18 09:55', testedAt: '2026-02-18 12:00', approvedAt: '2026-02-18 14:45',
      storageLoc: 'LAB-ROOM-1 / SHELF-B1', storageCond: 'Ambient (15-30°C)',
      custody: [
        { at: '2026-02-18 09:30', by: 'A. Reddy', action: 'Collected from goods-in bay', loc: 'GI-BAY-2' },
        { at: '2026-02-18 09:55', by: 'S. Mehta', action: 'Received at lab', loc: 'LAB-ROOM-1' },
        { at: '2026-02-18 12:00', by: 'A. Reddy', action: 'Released for testing', loc: 'LAB-ROOM-1' },
        { at: '2026-02-18 14:45', by: 'Dr. A. Mehta', action: 'Approved & certified', loc: 'LAB-ROOM-1' },
      ],
    },
    {
      sampleNumber: 'LAB-00246', barcode: 'SMP-LAB-00246', type: 'FINISHED_GOODS',
      batch: 'BATCH-NM-26F007', product: 'Mixed Namkeen 200g', supplier: '— (in-house)',
      sourceModule: 'FGQC', requestedBy: 'M. Joshi (FGQC)', collectedBy: 'A. Reddy (Lab Analyst)',
      collectedAt: '2026-02-18 10:18', status: 'TESTING', priority: 'URGENT',
      receivedAt: '2026-02-18 10:35', testedAt: '2026-02-18 11:20 (in progress)', approvedAt: '— (pending)',
      storageLoc: 'LAB-ROOM-1 / SHELF-A4', storageCond: 'Ambient (15-30°C)',
      custody: [
        { at: '2026-02-18 10:18', by: 'A. Reddy', action: 'Collected from FGQC hold zone', loc: 'FGQC-HOLD' },
        { at: '2026-02-18 10:35', by: 'S. Mehta', action: 'Received at lab', loc: 'LAB-ROOM-1' },
        { at: '2026-02-18 11:20', by: 'A. Reddy', action: 'Released for testing (URGENT)', loc: 'LAB-ROOM-1' },
      ],
    },
    {
      sampleNumber: 'LAB-00245', barcode: 'SMP-LAB-00245', type: 'WATER',
      batch: 'BATCH-WTR-26F022', product: 'Plant Water (RO Output)', supplier: '— (in-house)',
      sourceModule: 'ROUTINE', requestedBy: 'Plant Maintenance', collectedBy: 'S. Mehta (Lab Analyst)',
      collectedAt: '2026-02-18 08:00', status: 'RECEIVED', priority: 'ROUTINE',
      receivedAt: '2026-02-18 08:25', testedAt: '— (queued)', approvedAt: '— (pending)',
      storageLoc: 'LAB-ROOM-2 / FRIDGE-C1', storageCond: '2-8°C (refrigerated)',
      custody: [
        { at: '2026-02-18 08:00', by: 'S. Mehta', action: 'Collected from RO plant outlet', loc: 'UTILITY-RO' },
        { at: '2026-02-18 08:25', by: 'S. Mehta', action: 'Received at lab (refrigerated)', loc: 'LAB-ROOM-2' },
      ],
    },
    {
      sampleNumber: 'LAB-00244', barcode: 'SMP-RET-00244', type: 'RETENTION',
      batch: 'BATCH-KK-500-26E015', product: 'Kaju Katli 500g', supplier: '— (in-house)',
      sourceModule: 'RETENTION', requestedBy: 'Dr. A. Mehta (QA)', collectedBy: 'A. Reddy (Lab Analyst)',
      collectedAt: '2026-01-15 11:00', status: 'ARCHIVED', priority: 'ROUTINE',
      receivedAt: '2026-01-15 11:30', testedAt: '— (no test scheduled)', approvedAt: '— (N/A)',
      storageLoc: 'RETENTION-ROOM / SHELF-R7', storageCond: 'Ambient (15-30°C)',
      custody: [
        { at: '2026-01-15 11:00', by: 'A. Reddy', action: 'Retention sample sealed & tagged', loc: 'FGQC-HOLD' },
        { at: '2026-01-15 11:30', by: 'Storekeeper', action: 'Stored in retention room', loc: 'RETENTION-ROOM' },
        { at: '2026-02-18 09:00', by: 'Dr. A. Mehta', action: 'Retrieved for complaint investigation', loc: 'LAB-ROOM-1' },
        { at: '2026-02-18 17:00', by: 'Storekeeper', action: 'Returned to retention room', loc: 'RETENTION-ROOM' },
      ],
    },
  ]

  // 10 sample types
  const sampleTypes = [
    { code: 'RAW_MATERIAL', name: 'Raw Material', icon: Package, desc: 'Incoming ingredients & raw inputs sampled at goods-in', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { code: 'PACKAGING', name: 'Packaging', icon: Package, desc: 'Primary/secondary packaging materials (films, labels, cartons)', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { code: 'SEMI_FINISHED', name: 'Semi-Finished', icon: Beaker, desc: 'In-process intermediate sampled at IPQC checkpoints', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { code: 'FINISHED_GOODS', name: 'Finished Goods', icon: CheckCircle2, desc: 'Final packed product sampled at FGQC for batch release', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { code: 'WATER', name: 'Water', icon: Droplets, desc: 'Plant water (RO, soft, DM) sampled for routine monitoring', color: 'bg-sky-100 text-sky-700 border-sky-300' },
    { code: 'OIL', name: 'Oil', icon: Droplets, desc: 'Frying/cooking oil sampled for FFA, TPM, polar compounds', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { code: 'CLEANING_VERIFICATION', name: 'Cleaning Verification', icon: ScanLine, desc: 'Swab/rinse samples after equipment cleaning (CIP/COP)', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { code: 'ENVIRONMENTAL', name: 'Environmental', icon: Activity, desc: 'Air, surface, water samples for environmental monitoring', color: 'bg-teal-100 text-teal-700 border-teal-300' },
    { code: 'RETENTION', name: 'Retention', icon: FlaskConical, desc: 'Sealed retention sample held for 6-12 months past expiry', color: 'bg-violet-100 text-violet-700 border-violet-300' },
    { code: 'COMPLAINT', name: 'Complaint', icon: AlertTriangle, desc: 'Customer complaint sample pulled for root-cause analysis', color: 'bg-rose-100 text-rose-700 border-rose-300' },
  ]

  // 8 sample statuses
  const sampleStatuses = [
    { code: 'REQUESTED', name: 'Requested', icon: FileText, color: 'bg-slate-100 text-slate-700 border-slate-300', desc: 'Quality request raised, sample not yet collected' },
    { code: 'COLLECTED', name: 'Collected', icon: ScanLine, color: 'bg-cyan-100 text-cyan-700 border-cyan-300', desc: 'Sample collected from source, en route to lab' },
    { code: 'RECEIVED', name: 'Received', icon: Package, color: 'bg-indigo-100 text-indigo-700 border-indigo-300', desc: 'Lab receipt logged, sample accepted for testing' },
    { code: 'TESTING', name: 'Testing', icon: Beaker, color: 'bg-orange-100 text-orange-700 border-orange-300', desc: 'Sample under analysis by assigned analyst' },
    { code: 'VALIDATION', name: 'Validation', icon: ClipboardCheck, color: 'bg-amber-100 text-amber-700 border-amber-300', desc: 'Results awaiting analyst/QA validation' },
    { code: 'APPROVED', name: 'Approved', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-300', desc: 'Results approved, certificate generated' },
    { code: 'REJECTED', name: 'Rejected', icon: X, color: 'bg-rose-100 text-rose-700 border-rose-300', desc: 'Sample rejected (OOS / non-conforming / invalid)' },
    { code: 'ARCHIVED', name: 'Archived', icon: History, color: 'bg-slate-200 text-slate-700 border-slate-400', desc: 'Sample lifecycle complete, record archived' },
  ]

  const statusColor: Record<string, string> = {
    REQUESTED: 'bg-slate-100 text-slate-700 border-slate-300',
    COLLECTED: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    RECEIVED: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    TESTING: 'bg-orange-100 text-orange-700 border-orange-300',
    VALIDATION: 'bg-amber-100 text-amber-700 border-amber-300',
    APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    REJECTED: 'bg-rose-100 text-rose-700 border-rose-300',
    ARCHIVED: 'bg-slate-200 text-slate-700 border-slate-400',
  }
  const priorityColor: Record<string, string> = {
    ROUTINE: 'bg-slate-100 text-slate-700 border-slate-300',
    URGENT: 'bg-orange-100 text-orange-700 border-orange-300',
    CRITICAL: 'bg-rose-100 text-rose-700 border-rose-300',
    REGULATORY: 'bg-purple-100 text-purple-700 border-purple-300',
  }
  const sourceColor: Record<string, string> = {
    IQC: 'bg-blue-100 text-blue-700 border-blue-300',
    IPQC: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    FGQC: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    ROUTINE: 'bg-slate-100 text-slate-700 border-slate-300',
    RETENTION: 'bg-violet-100 text-violet-700 border-violet-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><FlaskConical className="h-6 w-6 text-blue-600" />Sample Registration & Tracking</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 53 · 5 most recent samples · Each record contains sample number, barcode, type, batch, product, supplier, source module (IQC/IPQC/FGQC/ROUTINE/RETENTION), requester, collector, collection time, status, priority, storage location/condition, and full chain-of-custody trail</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><Barcode className="mr-1 h-4 w-4" />Print Barcodes</Button>
          <Button size="sm" variant="outline"><QrCode className="mr-1 h-4 w-4" />QR Verify</Button>
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Export</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Sample</Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Approved</span><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
          <p className="text-xl font-bold text-emerald-700 mt-1">2</p>
        </Card>
        <Card className="p-3 border-orange-200 bg-orange-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">In Testing</span><Beaker className="h-4 w-4 text-orange-600" /></div>
          <p className="text-xl font-bold text-orange-700 mt-1">1</p>
        </Card>
        <Card className="p-3 border-indigo-200 bg-indigo-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Received</span><Package className="h-4 w-4 text-indigo-600" /></div>
          <p className="text-xl font-bold text-indigo-700 mt-1">1</p>
        </Card>
        <Card className="p-3 border-violet-200 bg-violet-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Retention (Archived)</span><History className="h-4 w-4 text-violet-600" /></div>
          <p className="text-xl font-bold text-violet-700 mt-1">1</p>
        </Card>
        <Card className="p-3 border-orange-300 bg-orange-50/60">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Urgent Priority</span><AlertTriangle className="h-4 w-4 text-orange-600" /></div>
          <p className="text-xl font-bold text-orange-700 mt-1">1</p>
        </Card>
      </div>

      {/* Sample type reference grid */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><FlaskConical className="h-4 w-4 text-blue-600" />Sample Types · 10 Categories</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Every sample registered in LIMS is classified into one of 10 types — each type drives the test-panel template, storage condition, and lifecycle rules</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {sampleTypes.map((t) => (
            <div key={t.code} className={`rounded-lg border p-2.5 ${t.color}`}>
              <div className="flex items-center gap-1.5">
                <t.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wide truncate">{t.code.replace(/_/g, ' ')}</span>
              </div>
              <p className="text-[11px] font-semibold mt-1">{t.name}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{t.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Sample status reference */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><Activity className="h-4 w-4 text-emerald-600" />Sample Statuses · 8 Lifecycle States</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Every sample transitions through these 8 statuses — no status can be skipped; the chain-of-custody trail proves each transition</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {sampleStatuses.map((s, i) => (
            <div key={s.code} className={`rounded-lg border p-2.5 ${s.color}`}>
              <div className="flex items-center gap-1">
                <s.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[9px] font-bold uppercase">{i + 1}</span>
              </div>
              <p className="text-[11px] font-semibold mt-1">{s.name}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{s.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Sample cards with chain-of-custody */}
      <div className="space-y-3">
        {samples.map((row) => (
          <Card key={row.sampleNumber} className={`p-4 ${row.status === 'TESTING' ? 'border-orange-300 bg-orange-50/30' : row.status === 'RECEIVED' ? 'border-indigo-300 bg-indigo-50/30' : row.status === 'ARCHIVED' ? 'border-violet-300 bg-violet-50/30' : 'border-slate-200'}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-blue-600">{row.sampleNumber}</span>
                  <Badge variant="outline" className={`text-[10px] ${statusColor[row.status]}`}>{row.status}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${priorityColor[row.priority]}`}>{row.priority}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${sourceColor[row.sourceModule]}`}>{row.sourceModule}</Badge>
                  <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-700 border-slate-300">{row.type.replace(/_/g, ' ')}</Badge>
                  <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-0.5"><Barcode className="h-3 w-3" />{row.barcode}</span>
                </div>
                <p className="text-sm font-semibold mt-1.5">{row.product}</p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground flex-wrap">
                  <span className="font-mono">{row.batch}</span>
                  <span>·</span>
                  <span>Supplier: {row.supplier}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><Package className="h-3 w-3" />{row.storageLoc}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><Thermometer className="h-3 w-3" />{row.storageCond}</span>
                </div>
              </div>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-3">
              <div className="rounded border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Requested By</p>
                <p className="text-[11px] font-semibold text-foreground">{row.requestedBy}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Collected By</p>
                <p className="text-[11px] font-semibold text-foreground">{row.collectedBy}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Collected At</p>
                <p className="text-[11px] font-semibold text-foreground font-mono">{row.collectedAt}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Received At</p>
                <p className="text-[11px] font-semibold text-foreground font-mono">{row.receivedAt}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Tested At</p>
                <p className="text-[11px] font-semibold text-foreground font-mono">{row.testedAt}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Approved At</p>
                <p className="text-[11px] font-semibold text-foreground font-mono">{row.approvedAt}</p>
              </div>
            </div>

            {/* Chain of custody */}
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <History className="h-3.5 w-3.5 text-blue-600" />
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Chain of Custody · {row.custody.length} transfers</p>
              </div>
              <div className="space-y-1.5">
                {row.custody.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px]">
                    <div className="flex flex-col items-center shrink-0 mt-0.5">
                      <div className={`h-2 w-2 rounded-full ${i === row.custody.length - 1 ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      {i < row.custody.length - 1 && <div className="w-px h-4 bg-slate-300 mt-0.5" />}
                    </div>
                    <div className="flex-1">
                      <span className="font-mono text-[10px] text-muted-foreground">{c.at}</span>
                      <span className="mx-1 text-muted-300">·</span>
                      <span className="font-semibold text-foreground">{c.by}</span>
                      <span className="mx-1 text-muted-300">·</span>
                      <span className="text-foreground">{c.action}</span>
                      <span className="mx-1 text-muted-300">·</span>
                      <span className="font-mono text-[10px] text-muted-foreground">[{c.loc}]</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── LIMS Laboratory Worklist ──────────────────────────────────────────
function LIMSWorklistModule() {
  // 3 worklists
  const worklists = [
    {
      code: 'WL-003', date: '2026-02-18', assignedTo: 'Anil Reddy',
      total: 12, pending: 4, inProgress: 5, completed: 3, overdue: 0,
      status: 'IN_PROGRESS', lab: 'Chemical Lab', notes: 'Morning shift — FGQC samples priority',
    },
    {
      code: 'WL-002', date: '2026-02-18', assignedTo: 'Suresh Mehta',
      total: 8, pending: 2, inProgress: 3, completed: 2, overdue: 1,
      status: 'IN_PROGRESS', lab: 'Microbiology Lab', notes: 'Includes 1 overdue moisture test on retention sample LAB-00244',
    },
    {
      code: 'WL-001', date: '2026-02-17', assignedTo: 'Anil Reddy',
      total: 15, pending: 0, inProgress: 0, completed: 15, overdue: 0,
      status: 'COMPLETED', lab: 'Chemical Lab', notes: 'All 15 tests completed & validated; COAs generated',
    },
  ]

  // 16 test types (per task spec — 13 stated, 16 listed; all listed types included)
  const testTypes = [
    { code: 'MOISTURE', name: 'Moisture', category: 'PHYSICAL', unit: '%', method: 'Halogen Moisture Analyzer', icon: Droplets },
    { code: 'FAT', name: 'Fat', category: 'CHEMICAL', unit: '%', method: 'Soxhlet Extraction', icon: FlaskConical },
    { code: 'SUGAR', name: 'Sugar', category: 'CHEMICAL', unit: '%', method: 'Refractometer / HPLC', icon: FlaskConical },
    { code: 'SALT', name: 'Salt', category: 'CHEMICAL', unit: '%', method: 'Mohr Titration', icon: FlaskConical },
    { code: 'PROTEIN', name: 'Protein', category: 'CHEMICAL', unit: '%', method: 'Kjeldahl', icon: FlaskConical },
    { code: 'PH', name: 'pH', category: 'CHEMICAL', unit: 'pH', method: 'pH Meter (Electrode)', icon: FlaskConical },
    { code: 'DENSITY', name: 'Density', category: 'PHYSICAL', unit: 'g/mL', method: 'Pycnometer', icon: Activity },
    { code: 'VISCOSITY', name: 'Viscosity', category: 'PHYSICAL', unit: 'cP', method: 'Rotational Viscometer', icon: Activity },
    { code: 'BRIX', name: 'Brix', category: 'PHYSICAL', unit: '°Bx', method: 'Refractometer', icon: Activity },
    { code: 'WATER_ACTIVITY', name: 'Water Activity', category: 'PHYSICAL', unit: 'aw', method: 'Water Activity Meter', icon: Droplets },
    { code: 'ASH_CONTENT', name: 'Ash Content', category: 'CHEMICAL', unit: '%', method: 'Muffle Furnace (550°C)', icon: FlaskConical },
    { code: 'TPC', name: 'TPC', category: 'MICROBIOLOGY', unit: 'CFU/g', method: 'Aerobic Plate Count (37°C/48h)', icon: Microscope },
    { code: 'COLIFORM', name: 'Coliform', category: 'MICROBIOLOGY', unit: 'CFU/g', method: 'VRBA (37°C/24h)', icon: Microscope },
    { code: 'YEAST_MOLD', name: 'Yeast & Mold', category: 'MICROBIOLOGY', unit: 'CFU/g', method: 'PDA (25°C/5d)', icon: Microscope },
    { code: 'E_COLI', name: 'E. coli', category: 'MICROBIOLOGY', unit: 'Detected/Not', method: 'TBX Agar (44°C/24h)', icon: Microscope },
    { code: 'SALMONELLA', name: 'Salmonella', category: 'MICROBIOLOGY', unit: 'Detected/25g', method: 'XLD Agar (ISO 6579)', icon: Microscope },
  ]

  // 3 test categories
  const testCategories = [
    { code: 'CHEMICAL', name: 'Chemical', icon: FlaskConical, color: 'bg-blue-100 text-blue-700 border-blue-300', desc: 'Compositional analysis — moisture, fat, sugar, salt, protein, pH, ash content' },
    { code: 'PHYSICAL', name: 'Physical', icon: Activity, color: 'bg-cyan-100 text-cyan-700 border-cyan-300', desc: 'Physical properties — density, viscosity, Brix, water activity' },
    { code: 'MICROBIOLOGY', name: 'Microbiology', icon: Microscope, color: 'bg-purple-100 text-purple-700 border-purple-300', desc: 'Microbial enumeration — TPC, coliform, yeast & mold, E. coli, Salmonella' },
  ]

  // 8 result statuses
  const resultStatuses = [
    { code: 'PENDING', name: 'Pending', icon: Clock, color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { code: 'IN_PROGRESS', name: 'In Progress', icon: Beaker, color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { code: 'COMPLETED', name: 'Completed', icon: CheckCircle2, color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { code: 'VALIDATED', name: 'Validated', icon: ClipboardCheck, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { code: 'APPROVED', name: 'Approved', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { code: 'REJECTED', name: 'Rejected', icon: X, color: 'bg-rose-100 text-rose-700 border-rose-300' },
    { code: 'RETEST', name: 'Retest', icon: History, color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { code: 'OOS', name: 'OOS', icon: AlertTriangle, color: 'bg-rose-100 text-rose-700 border-rose-300' },
  ]

  const statusColor: Record<string, string> = {
    IN_PROGRESS: 'bg-orange-100 text-orange-700 border-orange-300',
    COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-300',
  }
  const categoryColor: Record<string, string> = {
    CHEMICAL: 'bg-blue-100 text-blue-700 border-blue-300',
    PHYSICAL: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    MICROBIOLOGY: 'bg-purple-100 text-purple-700 border-purple-300',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ClipboardCheck className="h-6 w-6 text-blue-600" />Laboratory Worklist</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 53 · 3 worklists (2 in progress, 1 completed) · Each worklist groups tests by analyst & date · 16 test types across 3 categories (Chemical, Physical, Microbiology) · 8 result statuses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Export</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />New Worklist</Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 border-blue-200 bg-blue-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Open Worklists</span><ClipboardCheck className="h-4 w-4 text-blue-600" /></div>
          <p className="text-xl font-bold text-blue-700 mt-1">2</p>
        </Card>
        <Card className="p-3 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Completed</span><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
          <p className="text-xl font-bold text-emerald-700 mt-1">1</p>
        </Card>
        <Card className="p-3 border-orange-200 bg-orange-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Tests In Progress</span><Beaker className="h-4 w-4 text-orange-600" /></div>
          <p className="text-xl font-bold text-orange-700 mt-1">8</p>
        </Card>
        <Card className="p-3 border-amber-200 bg-amber-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Pending</span><Clock className="h-4 w-4 text-amber-600" /></div>
          <p className="text-xl font-bold text-amber-700 mt-1">6</p>
        </Card>
        <Card className="p-3 border-rose-200 bg-rose-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Overdue</span><AlertTriangle className="h-4 w-4 text-rose-600" /></div>
          <p className="text-xl font-bold text-rose-700 mt-1">1</p>
        </Card>
      </div>

      {/* Worklist cards */}
      <div className="space-y-3">
        {worklists.map((wl) => {
          const progressPct = Math.round((wl.completed / wl.total) * 100)
          return (
            <Card key={wl.code} className={`p-4 ${wl.status === 'COMPLETED' ? 'border-emerald-300 bg-emerald-50/30' : wl.overdue > 0 ? 'border-rose-300 bg-rose-50/30' : 'border-orange-200 bg-orange-50/20'}`}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-blue-600">{wl.code}</span>
                    <Badge variant="outline" className={`text-[10px] ${statusColor[wl.status]}`}>{wl.status.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-700 border-slate-300">{wl.lab}</Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-0.5"><Calendar className="h-3 w-3" />{wl.date}</span>
                  </div>
                  <p className="text-sm font-semibold mt-1.5">Assigned to <span className="text-foreground">{wl.assignedTo}</span></p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{wl.notes}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Tests</p>
                  <p className="text-2xl font-bold text-foreground">{wl.total}</p>
                </div>
              </div>

              {/* Test progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-semibold text-muted-foreground">{progressPct}% completed</span>
                  <span className="text-muted-foreground">{wl.completed} of {wl.total} done</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden flex">
                  <div className="bg-emerald-500" style={{ width: `${(wl.completed / wl.total) * 100}%` }} />
                  <div className="bg-orange-500" style={{ width: `${(wl.inProgress / wl.total) * 100}%` }} />
                  <div className="bg-amber-400" style={{ width: `${(wl.pending / wl.total) * 100}%` }} />
                  {wl.overdue > 0 && <div className="bg-rose-500" style={{ width: `${(wl.overdue / wl.total) * 100}%` }} />}
                </div>
              </div>

              {/* Status breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div className="rounded border border-slate-200 bg-white px-2 py-1.5 text-center">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Total</p>
                  <p className="text-sm font-bold text-foreground">{wl.total}</p>
                </div>
                <div className="rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-center">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Pending</p>
                  <p className="text-sm font-bold text-amber-700">{wl.pending}</p>
                </div>
                <div className="rounded border border-orange-200 bg-orange-50 px-2 py-1.5 text-center">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">In Progress</p>
                  <p className="text-sm font-bold text-orange-700">{wl.inProgress}</p>
                </div>
                <div className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-center">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Completed</p>
                  <p className="text-sm font-bold text-emerald-700">{wl.completed}</p>
                </div>
                <div className={`rounded border px-2 py-1.5 text-center ${wl.overdue > 0 ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-white'}`}>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Overdue</p>
                  <p className={`text-sm font-bold ${wl.overdue > 0 ? 'text-rose-700' : 'text-slate-400'}`}>{wl.overdue}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Test categories */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><Activity className="h-4 w-4 text-purple-600" />Test Categories · 3 Domains</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Every laboratory test is grouped under one of 3 categories — each category has its own lab room, equipment, and qualification requirements</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {testCategories.map((c) => (
            <div key={c.code} className={`rounded-lg border p-3 ${c.color}`}>
              <div className="flex items-center gap-1.5">
                <c.icon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wide">{c.code}</span>
              </div>
              <p className="font-semibold text-sm mt-1">{c.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{c.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Test types reference grid */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2"><FlaskConical className="h-4 w-4 text-blue-600" />Test Types · 16 Test Methods</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Each test type has a defined method, unit of measure, and category assignment — test methods are version-controlled in the LIMS</p>
          </div>
          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-300">
            {testTypes.filter(t => t.category === 'CHEMICAL').length} Chemical · {testTypes.filter(t => t.category === 'PHYSICAL').length} Physical · {testTypes.filter(t => t.category === 'MICROBIOLOGY').length} Microbiology
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {testTypes.map((t) => (
            <div key={t.code} className={`rounded-lg border p-2 ${categoryColor[t.category]}`}>
              <t.icon className="h-4 w-4" />
              <p className="text-[11px] font-bold mt-1">{t.name}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{t.unit}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{t.method}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Result statuses */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><ClipboardCheck className="h-4 w-4 text-emerald-600" />Result Statuses · 8 Lifecycle States</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Each test result transitions through these 8 statuses — OOS and Rejected results trigger CAPA workflow automatically</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {resultStatuses.map((s, i) => (
            <div key={s.code} className={`rounded-lg border p-2.5 ${s.color}`}>
              <div className="flex items-center gap-1">
                <s.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[9px] font-bold uppercase">{i + 1}</span>
              </div>
              <p className="text-[11px] font-semibold mt-1">{s.name}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── LIMS Laboratory Equipment ─────────────────────────────────────────
function LIMSEquipmentModule() {
  // 4 equipment
  const equipment = [
    {
      code: 'EQP-PH-01', name: 'pH Meter 01', type: 'pH Meter',
      manufacturer: 'Mettler Toledo', model: 'SevenExcellence S400', serial: 'MT-S400-2024-0017',
      plant: 'Mumbai Plant 1', labLocation: 'Chemical Lab · Bench A1',
      lastCalibrated: '2026-01-15', nextCalibrationDue: '2026-04-15', calibrationFreqDays: 90,
      calibrationStatus: 'VALID', qualificationStatus: 'IQ/OQ/PQ Completed',
      totalUsageHours: 1248, status: 'AVAILABLE',
      notes: 'Standard buffers 4.01 / 7.00 / 10.01 refreshed weekly. Electrode stored in 3M KCl.',
    },
    {
      code: 'EQP-MA-01', name: 'Moisture Analyzer 01', type: 'Moisture Analyzer',
      manufacturer: 'Mettler Toledo', model: 'HC103', serial: 'MT-HC103-2024-0042',
      plant: 'Mumbai Plant 1', labLocation: 'Chemical Lab · Bench A2',
      lastCalibrated: '2025-11-20', nextCalibrationDue: '2026-02-20', calibrationFreqDays: 90,
      calibrationStatus: 'DUE', qualificationStatus: 'IQ/OQ/PQ Completed',
      totalUsageHours: 892, status: 'AVAILABLE',
      notes: 'Calibration due in 2 days. Schedule with external calibrator (NABL-accredited).',
    },
    {
      code: 'EQP-WS-01', name: 'Weighing Scale 01', type: 'Weighing Scale',
      manufacturer: 'Sartorius', model: 'Cubis II MCM66', serial: 'ST-CUBIS-2023-0115',
      plant: 'Mumbai Plant 1', labLocation: 'Chemical Lab · Bench A3',
      lastCalibrated: '2025-11-10', nextCalibrationDue: '2026-02-10', calibrationFreqDays: 90,
      calibrationStatus: 'OVERDUE', qualificationStatus: 'IQ/OQ/PQ Completed',
      totalUsageHours: 2156, status: 'OUT_OF_SERVICE',
      notes: 'Calibration expired 8 days ago. Equipment BLOCKED — no new test assignments permitted per LIMS rule.',
    },
    {
      code: 'EQP-BR-01', name: 'Brix Meter 01', type: 'Brix Meter',
      manufacturer: 'Atago', model: 'PAL-BX/RI', serial: 'AT-PALBX-2024-0088',
      plant: 'Mumbai Plant 1', labLocation: 'Chemical Lab · Bench A4',
      lastCalibrated: '2026-01-30', nextCalibrationDue: '2026-07-30', calibrationFreqDays: 180,
      calibrationStatus: 'VALID', qualificationStatus: 'IQ/OQ Completed',
      totalUsageHours: 348, status: 'AVAILABLE',
      notes: 'Handheld refractometer. Daily verification with distilled water (Brix 0.0).',
    },
  ]

  // 9 equipment types
  const equipmentTypes = [
    { code: 'WEIGHING_SCALE', name: 'Weighing Scale', icon: Package, desc: 'Precision balances for sample weighing', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { code: 'MOISTURE_ANALYZER', name: 'Moisture Analyzer', icon: Droplets, desc: 'Halogen-based moisture content determination', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { code: 'PH_METER', name: 'pH Meter', icon: FlaskConical, desc: 'Electrode-based pH measurement', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { code: 'SPECTROPHOTOMETER', name: 'Spectrophotometer', icon: Activity, desc: 'UV-Vis absorbance for chemical quantification', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { code: 'INCUBATOR', name: 'Incubator', icon: Thermometer, desc: 'Controlled-temperature chamber for microbial growth', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    { code: 'AUTOCLAVE', name: 'Autoclave', icon: Wrench, desc: 'Steam sterilization for microbiology media/glassware', color: 'bg-rose-100 text-rose-700 border-rose-300' },
    { code: 'MICROSCOPE', name: 'Microscope', icon: Microscope, desc: 'Optical microscopy for microbial examination', color: 'bg-violet-100 text-violet-700 border-violet-300' },
    { code: 'THERMOMETER', name: 'Thermometer', icon: Thermometer, desc: 'Calibrated temperature measurement', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { code: 'BRIX_METER', name: 'Brix Meter', icon: Droplets, desc: 'Refractometer for sugar content (°Bx)', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  ]

  const calStatusColor: Record<string, string> = {
    VALID: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    DUE: 'bg-amber-100 text-amber-700 border-amber-300',
    OVERDUE: 'bg-rose-100 text-rose-700 border-rose-300',
    EXPIRED: 'bg-slate-200 text-slate-700 border-slate-400',
  }
  const eqStatusColor: Record<string, string> = {
    AVAILABLE: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    IN_USE: 'bg-blue-100 text-blue-700 border-blue-300',
    MAINTENANCE: 'bg-amber-100 text-amber-700 border-amber-300',
    CALIBRATION: 'bg-purple-100 text-purple-700 border-purple-300',
    OUT_OF_SERVICE: 'bg-rose-100 text-rose-700 border-rose-300',
    RETIRED: 'bg-slate-200 text-slate-700 border-slate-400',
  }

  // Calibration alerts — overdue + due equipment
  const calibrationAlerts = equipment.filter(e => e.calibrationStatus === 'OVERDUE' || e.calibrationStatus === 'DUE')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Microscope className="h-6 w-6 text-indigo-600" />Laboratory Equipment</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 53 · 4 equipment tracked · Each instrument has manufacturer, model, serial, location, calibration schedule (last + next due + frequency), qualification status, and usage hours · LIMS rule: expired/overdue instruments cannot record results</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Export</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />Register Equipment</Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 border-indigo-200 bg-indigo-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Total Equipment</span><Microscope className="h-4 w-4 text-indigo-600" /></div>
          <p className="text-xl font-bold text-indigo-700 mt-1">4</p>
        </Card>
        <Card className="p-3 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Valid</span><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
          <p className="text-xl font-bold text-emerald-700 mt-1">2</p>
        </Card>
        <Card className="p-3 border-amber-200 bg-amber-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Due (≤7 days)</span><Calendar className="h-4 w-4 text-amber-600" /></div>
          <p className="text-xl font-bold text-amber-700 mt-1">1</p>
        </Card>
        <Card className="p-3 border-rose-200 bg-rose-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Overdue</span><AlertTriangle className="h-4 w-4 text-rose-600" /></div>
          <p className="text-xl font-bold text-rose-700 mt-1">1</p>
        </Card>
        <Card className="p-3 border-purple-200 bg-purple-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Equipment Types</span><Wrench className="h-4 w-4 text-purple-600" /></div>
          <p className="text-xl font-bold text-purple-700 mt-1">9</p>
        </Card>
      </div>

      {/* Calibration alerts — overdue & due */}
      <Card className={`p-5 border-rose-300 ${calibrationAlerts.some(a => a.calibrationStatus === 'OVERDUE') ? 'bg-rose-50/40' : 'bg-amber-50/40'}`}>
        <div className="flex items-start gap-3 mb-4">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${calibrationAlerts.some(a => a.calibrationStatus === 'OVERDUE') ? 'bg-rose-100' : 'bg-amber-100'}`}>
            <AlertTriangle className={`h-5 w-5 ${calibrationAlerts.some(a => a.calibrationStatus === 'OVERDUE') ? 'text-rose-600' : 'text-amber-600'}`} />
          </div>
          <div>
            <p className={`font-semibold text-sm ${calibrationAlerts.some(a => a.calibrationStatus === 'OVERDUE') ? 'text-rose-700' : 'text-amber-700'}`}>Calibration Alerts · {calibrationAlerts.length} Equipment Need Attention</p>
            <p className="text-xs text-muted-foreground mt-0.5">Per LIMS rule, instruments with calibration status OVERDUE are <span className="font-semibold text-rose-700">blocked from recording new results</span> until recalibrated. Equipment with status DUE must be scheduled for calibration within 7 days.</p>
          </div>
        </div>
        <div className="space-y-2">
          {calibrationAlerts.map((a) => (
            <div key={a.code} className={`rounded-lg border p-3 ${a.calibrationStatus === 'OVERDUE' ? 'border-rose-300 bg-rose-50' : 'border-amber-300 bg-amber-50'}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-blue-600">{a.code}</span>
                    <span className="font-semibold text-sm">{a.name}</span>
                    <Badge variant="outline" className={`text-[10px] ${calStatusColor[a.calibrationStatus]}`}>{a.calibrationStatus}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${eqStatusColor[a.status]}`}>{a.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{a.manufacturer} {a.model} · S/N: {a.serial} · {a.labLocation}</p>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <div className="text-center">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Last Calibration</p>
                    <p className="font-mono font-semibold">{a.lastCalibrated}</p>
                  </div>
                  <span className="text-slate-400">→</span>
                  <div className="text-center">
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Next Due</p>
                    <p className={`font-mono font-semibold ${a.calibrationStatus === 'OVERDUE' ? 'text-rose-700' : 'text-amber-700'}`}>{a.nextCalibrationDue}</p>
                  </div>
                  <div className={`text-center px-2 py-1 rounded border ${a.calibrationStatus === 'OVERDUE' ? 'border-rose-300 bg-white' : 'border-amber-300 bg-white'}`}>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Days Overdue / Until Due</p>
                    <p className={`font-bold text-xs ${a.calibrationStatus === 'OVERDUE' ? 'text-rose-700' : 'text-amber-700'}`}>
                      {a.calibrationStatus === 'OVERDUE' ? '8 days overdue' : '2 days until due'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-2">
                <p className="text-[11px] text-muted-foreground">{a.notes}</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-[11px] h-7"><History className="mr-1 h-3 w-3" />Calibration History</Button>
                  <Button size="sm" className={`text-[11px] h-7 ${a.calibrationStatus === 'OVERDUE' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'}`}><Calendar className="mr-1 h-3 w-3" />Schedule Calibration</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Equipment cards */}
      <div className="space-y-3">
        {equipment.map((eq) => (
          <Card key={eq.code} className={`p-4 ${eq.calibrationStatus === 'OVERDUE' ? 'border-rose-300 bg-rose-50/30' : eq.calibrationStatus === 'DUE' ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-blue-600">{eq.code}</span>
                  <span className="font-semibold text-sm">{eq.name}</span>
                  <Badge variant="outline" className={`text-[10px] ${calStatusColor[eq.calibrationStatus]}`}>CAL: {eq.calibrationStatus}</Badge>
                  <Badge variant="outline" className={`text-[10px] ${eqStatusColor[eq.status]}`}>{eq.status.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-700 border-slate-300">{eq.type}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{eq.manufacturer} · {eq.model} · S/N: {eq.serial}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-0.5"><MapPin className="h-3 w-3" />{eq.plant} · {eq.labLocation}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Usage Hours</p>
                <p className="text-lg font-bold text-foreground">{eq.totalUsageHours.toLocaleString()}h</p>
              </div>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
              <div className="rounded border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Last Calibrated</p>
                <p className="text-[11px] font-semibold text-foreground font-mono">{eq.lastCalibrated}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Next Due</p>
                <p className={`text-[11px] font-semibold font-mono ${eq.calibrationStatus === 'OVERDUE' ? 'text-rose-700' : eq.calibrationStatus === 'DUE' ? 'text-amber-700' : 'text-foreground'}`}>{eq.nextCalibrationDue}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Calibration Freq</p>
                <p className="text-[11px] font-semibold text-foreground">{eq.calibrationFreqDays} days</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Qualification</p>
                <p className="text-[11px] font-semibold text-foreground">{eq.qualificationStatus}</p>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">Calibration Status</p>
                <Badge variant="outline" className={`text-[10px] ${calStatusColor[eq.calibrationStatus]}`}>{eq.calibrationStatus}</Badge>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">Notes:</span> {eq.notes}
            </div>
          </Card>
        ))}
      </div>

      {/* Equipment types reference */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><Wrench className="h-4 w-4 text-purple-600" />Equipment Types · 9 Categories</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Each piece of laboratory equipment is classified into one of 9 types — type drives the calibration frequency, qualification requirements, and preventive maintenance schedule</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-2">
          {equipmentTypes.map((t) => (
            <div key={t.code} className={`rounded-lg border p-2 ${t.color}`}>
              <t.icon className="h-4 w-4" />
              <p className="text-[11px] font-bold mt-1">{t.name}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{t.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── LIMS Laboratory Inventory ─────────────────────────────────────────
function LIMSInventoryModule() {
  // 4 inventory items
  const items = [
    {
      code: 'INV-REAG-001', name: 'Sodium Hydroxide 0.1N', type: 'REAGENT',
      manufacturer: 'Merck', catalogNumber: 'SX0607H-6X1L',
      currentStock: 2.5, minStock: 1.0, maxStock: 5.0, uom: 'L',
      batch: 'NAOH-26B018', expiry: '2027-01-15',
      storageLocation: 'Chemical Store · Shelf CS-3', storageCondition: 'Ambient (15-30°C)',
      lowStock: false, expiringSoon: false, expired: false, status: 'OK',
      notes: 'Standard titrant for acid-base titration. Verify normality monthly.',
    },
    {
      code: 'INV-REAG-002', name: 'Agar Powder', type: 'REAGENT',
      manufacturer: 'Himedia', catalogNumber: 'RM666-500G',
      currentStock: 0.3, minStock: 0.5, maxStock: 2.0, uom: 'KG',
      batch: 'AGAR-26A022', expiry: '2027-06-30',
      storageLocation: 'Microbiology Store · Shelf MS-1', storageCondition: 'Ambient (15-30°C)',
      lowStock: true, expiringSoon: false, expired: false, status: 'LOW_STOCK',
      notes: 'Below min threshold (0.3 kg < 0.5 kg). Reorder 1.0 kg from Himedia.',
    },
    {
      code: 'INV-CONS-001', name: 'Petri Dishes (90mm, sterile)', type: 'CONSUMABLE',
      manufacturer: 'Borosil', catalogNumber: 'PD-90-S-500',
      currentStock: 480, minStock: 200, maxStock: 1000, uom: 'pcs',
      batch: 'PD-26C015', expiry: '2028-02-28',
      storageLocation: 'Microbiology Store · Shelf MS-4', storageCondition: 'Ambient (15-30°C, sealed)',
      lowStock: false, expiringSoon: false, expired: false, status: 'OK',
      notes: 'Pre-sterilized disposable Petri dishes. Inspect for cracks before use.',
    },
    {
      code: 'INV-STD-001', name: 'pH Buffer 4.01', type: 'STANDARD',
      manufacturer: 'Mettler Toledo', catalogNumber: '51302069',
      currentStock: 0.1, minStock: 0.2, maxStock: 0.5, uom: 'L',
      batch: 'PH4-26B008', expiry: '2026-03-10',
      storageLocation: 'Chemical Store · Fridge CF-2', storageCondition: 'Refrigerated (2-8°C)',
      lowStock: true, expiringSoon: true, expired: false, status: 'LOW_STOCK',
      notes: 'Below min threshold (0.1 L < 0.2 L) AND expiring in 20 days. Reorder fresh stock and dispose current batch post-expiry.',
    },
  ]

  // 8 item types
  const itemTypes = [
    { code: 'CHEMICAL', name: 'Chemical', icon: FlaskConical, desc: 'Bulk chemicals (acids, bases, solvents)', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { code: 'REAGENT', name: 'Reagent', icon: Beaker, desc: 'Ready-to-use reagents & titrants', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { code: 'GLASSWARE', name: 'Glassware', icon: Activity, desc: 'Beakers, flasks, pipettes, cylinders', color: 'bg-cyan-100 text-cyan-700 border-cyan-300' },
    { code: 'STANDARD', name: 'Standard', icon: ClipboardCheck, desc: 'Calibration standards & reference buffers', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { code: 'REFERENCE_MATERIAL', name: 'Reference Material', icon: CheckCircle2, desc: 'Certified reference materials (CRM)', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    { code: 'PIPETTE', name: 'Pipette', icon: Droplets, desc: 'Calibrated pipettes & tips', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { code: 'FILTER', name: 'Filter', icon: ScanLine, desc: 'Filter papers, membranes, syringe filters', color: 'bg-teal-100 text-teal-700 border-teal-300' },
    { code: 'CONSUMABLE', name: 'Consumable', icon: Package, desc: 'Petri dishes, tubes, vials, swabs', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  ]

  const statusColor: Record<string, string> = {
    OK: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    LOW_STOCK: 'bg-orange-100 text-orange-700 border-orange-300',
    EXPIRING_SOON: 'bg-amber-100 text-amber-700 border-amber-300',
    EXPIRED: 'bg-rose-100 text-rose-700 border-rose-300',
    QUARANTINED: 'bg-rose-100 text-rose-700 border-rose-300',
  }
  const typeColor: Record<string, string> = {
    CHEMICAL: 'bg-blue-100 text-blue-700 border-blue-300',
    REAGENT: 'bg-purple-100 text-purple-700 border-purple-300',
    GLASSWARE: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    STANDARD: 'bg-amber-100 text-amber-700 border-amber-300',
    REFERENCE_MATERIAL: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    PIPETTE: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    FILTER: 'bg-teal-100 text-teal-700 border-teal-300',
    CONSUMABLE: 'bg-slate-100 text-slate-700 border-slate-300',
  }

  // Alert rollups
  const lowStockItems = items.filter(i => i.lowStock)
  const expiringItems = items.filter(i => i.expiringSoon)
  const expiredItems = items.filter(i => i.expired)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-cyan-600" />Laboratory Inventory</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 53 · 4 inventory items tracked · Each item has manufacturer, catalog number, current/min/max stock, UoM, batch, expiry, storage location/condition, and low-stock / expiring-soon / expired alert flags · 8 item types supported</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Export</Button>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" />Add Inventory Item</Button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 border-cyan-200 bg-cyan-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Total Items</span><Package className="h-4 w-4 text-cyan-600" /></div>
          <p className="text-xl font-bold text-cyan-700 mt-1">48</p>
        </Card>
        <Card className="p-3 border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">OK</span><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
          <p className="text-xl font-bold text-emerald-700 mt-1">41</p>
        </Card>
        <Card className="p-3 border-orange-200 bg-orange-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Low Stock</span><AlertTriangle className="h-4 w-4 text-orange-600" /></div>
          <p className="text-xl font-bold text-orange-700 mt-1">4</p>
        </Card>
        <Card className="p-3 border-amber-200 bg-amber-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Expiring Soon</span><Clock className="h-4 w-4 text-amber-600" /></div>
          <p className="text-xl font-bold text-amber-700 mt-1">2</p>
        </Card>
        <Card className="p-3 border-rose-200 bg-rose-50/40">
          <div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Expired</span><PackageX className="h-4 w-4 text-rose-600" /></div>
          <p className="text-xl font-bold text-rose-700 mt-1">1</p>
        </Card>
      </div>

      {/* Alert rollups — low stock, expiring soon, expired */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Low stock */}
        <Card className={`p-4 border-orange-300 ${lowStockItems.length > 0 ? 'bg-orange-50/50' : 'bg-white'}`}>
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-700">Low Stock Alerts · {lowStockItems.length}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Items below minimum reorder threshold — auto-reorder triggered</p>
            </div>
          </div>
          <div className="space-y-1.5 mt-2">
            {lowStockItems.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">No low stock items</p>
            ) : lowStockItems.map((i) => (
              <div key={i.code} className="rounded border border-orange-200 bg-white px-2 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-blue-600 font-bold">{i.code}</span>
                  <Badge variant="outline" className="text-[9px] bg-orange-50 text-orange-700 border-orange-300">LOW</Badge>
                </div>
                <p className="text-[11px] font-semibold mt-0.5">{i.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <span className="text-rose-700 font-semibold">Current: {i.currentStock} {i.uom}</span>
                  <span>·</span>
                  <span>Min: {i.minStock} {i.uom}</span>
                  <span>·</span>
                  <span>Max: {i.maxStock} {i.uom}</span>
                </div>
                <Button size="sm" variant="outline" className="mt-1.5 w-full text-[10px] h-6"><Plus className="mr-1 h-3 w-3" />Reorder</Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Expiring soon */}
        <Card className={`p-4 border-amber-300 ${expiringItems.length > 0 ? 'bg-amber-50/50' : 'bg-white'}`}>
          <div className="flex items-start gap-2 mb-2">
            <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-700">Expiring Soon · {expiringItems.length}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Items expiring within 30 days — prioritize usage or arrange disposal</p>
            </div>
          </div>
          <div className="space-y-1.5 mt-2">
            {expiringItems.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">No items expiring soon</p>
            ) : expiringItems.map((i) => (
              <div key={i.code} className="rounded border border-amber-200 bg-white px-2 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-blue-600 font-bold">{i.code}</span>
                  <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-300">EXPIRING</Badge>
                </div>
                <p className="text-[11px] font-semibold mt-0.5">{i.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <span className="font-mono">Batch: {i.batch}</span>
                  <span>·</span>
                  <span className="text-amber-700 font-semibold">Expiry: {i.expiry}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                  <Thermometer className="h-3 w-3" />
                  <span>{i.storageCondition}</span>
                </div>
                <Button size="sm" variant="outline" className="mt-1.5 w-full text-[10px] h-6"><History className="mr-1 h-3 w-3" />Schedule Usage</Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Expired */}
        <Card className={`p-4 border-rose-300 ${expiredItems.length > 0 ? 'bg-rose-50/50' : 'bg-white'}`}>
          <div className="flex items-start gap-2 mb-2">
            <PackageX className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-700">Expired Items · {expiredItems.length}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Items past expiry date — quarantine required, no usage permitted</p>
            </div>
          </div>
          <div className="space-y-1.5 mt-2">
            {expiredItems.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">No expired items</p>
            ) : expiredItems.map((i) => (
              <div key={i.code} className="rounded border border-rose-300 bg-white px-2 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-blue-600 font-bold">{i.code}</span>
                  <Badge variant="outline" className="text-[9px] bg-rose-50 text-rose-700 border-rose-300">EXPIRED</Badge>
                </div>
                <p className="text-[11px] font-semibold mt-0.5">{i.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  <span className="font-mono">Batch: {i.batch}</span>
                  <span>·</span>
                  <span className="text-rose-700 font-semibold">Expired: {i.expiry}</span>
                </div>
                <Button size="sm" variant="outline" className="mt-1.5 w-full text-[10px] h-6 bg-rose-600 text-white hover:bg-rose-700"><PackageX className="mr-1 h-3 w-3" />Quarantine & Dispose</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Inventory items detail cards */}
      <div className="space-y-3">
        {items.map((it) => {
          const stockPct = Math.min(100, Math.round((it.currentStock / it.maxStock) * 100))
          const isLow = it.lowStock
          const isExpiring = it.expiringSoon
          const isExpired = it.expired
          return (
            <Card key={it.code} className={`p-4 ${isExpired ? 'border-rose-300 bg-rose-50/30' : isLow && isExpiring ? 'border-amber-300 bg-amber-50/30' : isLow ? 'border-orange-300 bg-orange-50/30' : isExpiring ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'}`}>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-blue-600">{it.code}</span>
                    <span className="font-semibold text-sm">{it.name}</span>
                    <Badge variant="outline" className={`text-[10px] ${typeColor[it.type]}`}>{it.type.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${statusColor[it.status]}`}>{it.status.replace(/_/g, ' ')}</Badge>
                    {it.lowStock && <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-300"><AlertTriangle className="h-3 w-3 mr-0.5" />LOW STOCK</Badge>}
                    {it.expiringSoon && <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-300"><Clock className="h-3 w-3 mr-0.5" />EXPIRING</Badge>}
                    {it.expired && <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-300"><PackageX className="h-3 w-3 mr-0.5" />EXPIRED</Badge>}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{it.manufacturer} · Catalog: {it.catalogNumber}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-0.5"><MapPin className="h-3 w-3" />{it.storageLocation} · <Thermometer className="h-3 w-3 ml-1" />{it.storageCondition}</p>
                </div>
              </div>

              {/* Stock level visualization */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="font-semibold text-muted-foreground">Stock Level: {it.currentStock} / {it.maxStock} {it.uom}</span>
                  <span className="text-muted-foreground">Min: {it.minStock} {it.uom} · Max: {it.maxStock} {it.uom}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden relative">
                  <div
                    className={`h-full ${isLow ? 'bg-orange-500' : 'bg-emerald-500'}`}
                    style={{ width: `${stockPct}%` }}
                  />
                  {/* Min threshold marker */}
                  <div
                    className="absolute top-0 h-full w-px bg-rose-600"
                    style={{ left: `${(it.minStock / it.maxStock) * 100}%` }}
                    title={`Min threshold: ${it.minStock} ${it.uom}`}
                  />
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">Vertical red line = min reorder threshold</p>
              </div>

              {/* Metadata grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <div className="rounded border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Batch</p>
                  <p className="text-[11px] font-semibold text-foreground font-mono">{it.batch}</p>
                </div>
                <div className="rounded border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Expiry</p>
                  <p className={`text-[11px] font-semibold font-mono ${isExpired ? 'text-rose-700' : isExpiring ? 'text-amber-700' : 'text-foreground'}`}>{it.expiry}</p>
                </div>
                <div className="rounded border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Current Stock</p>
                  <p className={`text-[11px] font-semibold ${isLow ? 'text-orange-700' : 'text-foreground'}`}>{it.currentStock} {it.uom}</p>
                </div>
                <div className="rounded border border-slate-200 bg-slate-50/60 px-2 py-1.5">
                  <p className="text-[9px] uppercase font-bold text-muted-foreground">Min / Max</p>
                  <p className="text-[11px] font-semibold text-foreground">{it.minStock} / {it.maxStock} {it.uom}</p>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Notes:</span> {it.notes}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Item types reference */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><Package className="h-4 w-4 text-purple-600" />Item Types · 8 Categories</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Every lab inventory item is classified into one of 8 types — type drives storage requirements, expiry tracking, and reorder rules</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {itemTypes.map((t) => (
            <div key={t.code} className={`rounded-lg border p-2.5 ${t.color}`}>
              <t.icon className="h-4 w-4" />
              <p className="text-[11px] font-bold mt-1">{t.name}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{t.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

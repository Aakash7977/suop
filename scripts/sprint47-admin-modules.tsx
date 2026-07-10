// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 47 — MANUFACTURING MISSION CONTROL, DIGITAL FACTORY & PRODUCTION COMMAND CENTER
// Admin modules: Mfg Mission Control, Mfg Control Tower, Digital Factory, Mfg Alert Center,
// Mfg Factory Health, Mfg Scorecard, Mfg Executive Dashboard, Mfg Business Continuity
// ═══════════════════════════════════════════════════════════════════════════════

// Icons needed for Sprint 47 not already imported in page.tsx (ES modules hoist these)
import { Lightbulb, Power, Wifi, Cloud, CloudOff } from 'lucide-react'

// ─── Mfg Mission Control ────────────────────────────────────────────────
function MfgMissionControlModule() {
  const kpis = {
    factoryHealth: 87.5,
    productionOrders: 5,
    runningMachines: 18,
    totalMachines: 24,
    operatorsActive: 5,
    operatorsTotal: 6,
    productionTarget: 94.5,
    oee: 84.2,
    qualityFPY: 99.4,
    yield: 96.8,
    energyKwh: 1840,
    alertsActive: 2,
    alertsCritical: 1,
  }
  const widgets = [
    { label: 'Factory Health', value: `${kpis.factoryHealth}`, unit: '/100', icon: Gauge, color: 'text-emerald-600', status: 'GREEN', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Production Orders', value: `${kpis.productionOrders}`, unit: 'Active', icon: FileText, color: 'text-blue-600', status: 'GREEN', bg: 'bg-blue-50 border-blue-200' },
    { label: 'Running Machines', value: `${kpis.runningMachines}/${kpis.totalMachines}`, unit: 'machines', icon: Server, color: 'text-emerald-600', status: 'GREEN', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Operator Status', value: `${kpis.operatorsActive}/${kpis.operatorsTotal}`, unit: 'on duty', icon: Users, color: 'text-amber-600', status: 'YELLOW', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Production Target', value: `${kpis.productionTarget}%`, unit: 'of plan', icon: Target, color: 'text-emerald-600', status: 'GREEN', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'OEE', value: `${kpis.oee}%`, unit: 'overall', icon: Activity, color: 'text-emerald-600', status: 'GREEN', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Quality (FPY)', value: `${kpis.qualityFPY}%`, unit: 'first pass', icon: CheckCircle2, color: 'text-emerald-600', status: 'GREEN', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Yield', value: `${kpis.yield}%`, unit: 'output', icon: TrendingUp, color: 'text-emerald-600', status: 'GREEN', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Energy', value: `${kpis.energyKwh.toLocaleString('en-IN')}`, unit: 'kWh', icon: Zap, color: 'text-amber-600', status: 'YELLOW', bg: 'bg-amber-50 border-amber-200' },
    { label: 'Alerts', value: `${kpis.alertsActive}/${kpis.alertsCritical}`, unit: 'crit', icon: Siren, color: 'text-rose-600', status: 'RED', bg: 'bg-rose-50 border-rose-200' },
  ]
  const statusColor: Record<string, string> = {
    GREEN: 'bg-emerald-500', YELLOW: 'bg-amber-500', RED: 'bg-rose-500',
  }
  const plants = [
    { code: 'THN', name: 'Thane Plant 01', lines: 5, activeWOs: 5, output: 1248, target: 1320, achievement: 94.5, oee: 84.2, machines: 24, running: 18, operators: 5, risk: 'LOW', status: 'GREEN' },
    { code: 'PUN', name: 'Pune Plant 02', lines: 4, activeWOs: 3, output: 880, target: 950, achievement: 92.6, oee: 81.5, machines: 18, running: 14, operators: 4, risk: 'MEDIUM', status: 'YELLOW' },
    { code: 'NAS', name: 'Nashik Plant 03', lines: 3, activeWOs: 2, output: 540, target: 600, achievement: 90.0, oee: 78.4, machines: 12, running: 9, operators: 3, risk: 'MEDIUM', status: 'YELLOW' },
    { code: 'BLR', name: 'Bengaluru Plant 04', lines: 2, activeWOs: 1, output: 320, target: 320, achievement: 100.0, oee: 88.9, machines: 8, running: 7, operators: 2, risk: 'LOW', status: 'GREEN' },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Radar className="h-6 w-6 text-purple-600" />Manufacturing Mission Control</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 47 · Single pane of glass · Plant + line + machine + operator visibility in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><RefreshCw className="mr-1 h-4 w-4" />Live</Button>
          <Button size="sm"><BellRing className="mr-1 h-4 w-4" />Acknowledge All</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {widgets.map(w => (
          <Card key={w.label} className={`p-3 ${w.bg}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground">{w.label}</p>
                <p className={`text-2xl font-bold mt-1 ${w.color}`}>{w.value}</p>
                <p className="text-[10px] text-muted-foreground">{w.unit}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <w.icon className="h-5 w-5 text-muted-foreground/50" />
                <span className={`inline-block h-2 w-2 rounded-full ${statusColor[w.status]}`} title={w.status} />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" />Chief Architect Recommendation — Single Enterprise Operations Center</p>
            <p className="text-xs text-muted-foreground mt-1">Consolidate Manufacturing, Warehouse, Quality, Procurement and Logistics mission control into <span className="font-semibold text-purple-700">one physical + virtual operations center</span>. One radar screen, one alert queue, one chat thread, one shift handover, one audit trail. Eliminates the 7 disconnected "control towers" that exist today across departments.</p>
            <div className="flex items-center gap-1 text-[11px] mt-2 overflow-x-auto">
              {['Plant Sensors', 'IoT Gateway', 'Event Bus', 'Mission Control Engine', 'Unified Ops Cockpit', 'Shift Handover', 'Audit Trail'].map((step, i, a) => (
                <div key={i} className="flex items-center gap-1 flex-shrink-0">
                  <span className="px-2 py-0.5 bg-white border rounded text-[10px] font-medium">{step}</span>
                  {i < a.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-purple-600 flex-shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Target: 1 ops center per region · 1 enterprise dashboard · 1 escalation policy · 1 RACI matrix · Mean Time To Acknowledge &lt; 60 seconds</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Plant Summary</h3>
          <span className="text-[10px] text-muted-foreground">Live · refreshed every 15s</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Plant</th>
                <th className="px-3 py-2 font-medium text-center">Lines</th>
                <th className="px-3 py-2 font-medium text-center">Active WOs</th>
                <th className="px-3 py-2 font-medium text-right">Output / Target</th>
                <th className="px-3 py-2 font-medium text-center">Achievement</th>
                <th className="px-3 py-2 font-medium text-center">OEE</th>
                <th className="px-3 py-2 font-medium text-center">Machines (Run/Total)</th>
                <th className="px-3 py-2 font-medium text-center">Operators</th>
                <th className="px-3 py-2 font-medium">Risk</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {plants.map(p => (
                <tr key={p.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-mono text-[11px] text-blue-700">{p.code}</p><p className="text-[10px] text-muted-foreground">{p.name}</p></td>
                  <td className="px-3 py-2 text-center">{p.lines}</td>
                  <td className="px-3 py-2 text-center font-medium">{p.activeWOs}</td>
                  <td className="px-3 py-2 text-right"><p className="font-medium">{p.output.toLocaleString('en-IN')} / {p.target.toLocaleString('en-IN')}</p><p className="text-[10px] text-muted-foreground">units</p></td>
                  <td className={`px-3 py-2 text-center font-bold ${p.achievement >= 95 ? 'text-emerald-600' : p.achievement >= 90 ? 'text-amber-600' : 'text-rose-600'}`}>{p.achievement}%</td>
                  <td className={`px-3 py-2 text-center font-bold ${p.oee >= 85 ? 'text-emerald-600' : p.oee >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>{p.oee}%</td>
                  <td className="px-3 py-2 text-center"><span className="text-emerald-600 font-medium">{p.running}</span><span className="text-muted-foreground">/{p.machines}</span></td>
                  <td className="px-3 py-2 text-center">{p.operators}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${p.risk === 'LOW' ? 'bg-emerald-100 text-emerald-700' : p.risk === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{p.risk}</span></td>
                  <td className="px-3 py-2"><span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-bold ${p.status === 'GREEN' ? 'bg-emerald-100 text-emerald-700' : p.status === 'YELLOW' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}><span className={`h-1.5 w-1.5 rounded-full ${statusColor[p.status]}`} />{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Mfg Control Tower ──────────────────────────────────────────────────
function MfgControlTowerModule() {
  const viewModes = ['Enterprise', 'Regional', 'Plant', 'Department', 'Line', 'TV Dashboard', 'Operations Center']
  const enterprise = {
    name: 'SUOP Enterprise Operations', plants: 4, activeWOs: 11, output: 2988, target: 3190, oee: 83.2,
    machines: 62, running: 48, operators: 14, risk: 'LOW', status: 'GREEN',
  }
  const plants = [
    { code: 'THN', name: 'Thane Plant 01', region: 'West', activeWOs: 5, output: 1248, oee: 84.2, machines: 24, running: 18, operators: 5, risk: 'LOW', status: 'GREEN' },
    { code: 'PUN', name: 'Pune Plant 02', region: 'West', activeWOs: 3, output: 880, oee: 81.5, machines: 18, running: 14, operators: 4, risk: 'MEDIUM', status: 'YELLOW' },
    { code: 'NAS', name: 'Nashik Plant 03', region: 'West', activeWOs: 2, output: 540, oee: 78.4, machines: 12, running: 9, operators: 3, risk: 'MEDIUM', status: 'YELLOW' },
    { code: 'BLR', name: 'Bengaluru Plant 04', region: 'South', activeWOs: 1, output: 320, oee: 88.9, machines: 8, running: 7, operators: 2, risk: 'LOW', status: 'GREEN' },
  ]
  const departments = [
    { code: 'DEP-PROD-THN', plant: 'THN', name: 'Production Dept', activeWOs: 4, output: 980, oee: 85.1, machines: 16, running: 12, operators: 4, risk: 'LOW', status: 'GREEN' },
    { code: 'DEP-PACK-THN', plant: 'THN', name: 'Packaging Dept', activeWOs: 1, output: 268, oee: 82.4, machines: 8, running: 6, operators: 1, risk: 'LOW', status: 'GREEN' },
    { code: 'DEP-PROD-PUN', plant: 'PUN', name: 'Production Dept', activeWOs: 3, output: 880, oee: 81.5, machines: 18, running: 14, operators: 4, risk: 'MEDIUM', status: 'YELLOW' },
    { code: 'DEP-PROD-NAS', plant: 'NAS', name: 'Production Dept', activeWOs: 2, output: 540, oee: 78.4, machines: 12, running: 9, operators: 3, risk: 'MEDIUM', status: 'YELLOW' },
    { code: 'DEP-PROD-BLR', plant: 'BLR', name: 'Production Dept', activeWOs: 1, output: 320, oee: 88.9, machines: 8, running: 7, operators: 2, risk: 'LOW', status: 'GREEN' },
  ]
  const lines = [
    { code: 'LINE-KK-01', dept: 'DEP-PROD-THN', name: 'Kaju Katli', activeWOs: 1, output: 542, oee: 88.7, machines: 6, running: 5, operators: 1, risk: 'LOW', status: 'GREEN' },
    { code: 'LINE-IB-01', dept: 'DEP-PROD-THN', name: 'Idli Batter', activeWOs: 1, output: 95, oee: 85.2, machines: 4, running: 4, operators: 1, risk: 'LOW', status: 'GREEN' },
    { code: 'LINE-NM-01', dept: 'DEP-PROD-THN', name: 'Namkeen', activeWOs: 1, output: 250, oee: 72.0, machines: 5, running: 3, operators: 1, risk: 'HIGH', status: 'RED' },
    { code: 'LINE-ML-01', dept: 'DEP-PROD-THN', name: 'Motichoor', activeWOs: 1, output: 93, oee: 87.3, machines: 5, running: 5, operators: 1, risk: 'LOW', status: 'GREEN' },
    { code: 'LINE-GUL-01', dept: 'DEP-PROD-THN', name: 'Gulab Jamun', activeWOs: 1, output: 67, oee: 88.4, machines: 4, running: 4, operators: 0, risk: 'LOW', status: 'GREEN' },
    { code: 'LINE-CHN-01', dept: 'DEP-PROD-PUN', name: 'Chikki Line', activeWOs: 1, output: 480, oee: 82.0, machines: 10, running: 8, operators: 2, risk: 'MEDIUM', status: 'YELLOW' },
  ]
  const statusColor: Record<string, string> = { GREEN: 'bg-emerald-500', YELLOW: 'bg-amber-500', RED: 'bg-rose-500' }
  const statusBadge: Record<string, string> = { GREEN: 'bg-emerald-100 text-emerald-700', YELLOW: 'bg-amber-100 text-amber-700', RED: 'bg-rose-100 text-rose-700' }
  const riskBadge: Record<string, string> = { LOW: 'bg-emerald-100 text-emerald-700', MEDIUM: 'bg-amber-100 text-amber-700', HIGH: 'bg-rose-100 text-rose-700' }
  const renderRow = (r: { activeWOs: number; output: number; oee: number; machines: number; running: number; operators: number; risk: string; status: string }) => (
    <>
      <td className="px-3 py-2 text-center font-medium">{r.activeWOs}</td>
      <td className="px-3 py-2 text-right font-medium">{r.output.toLocaleString('en-IN')}</td>
      <td className={`px-3 py-2 text-center font-bold ${r.oee >= 85 ? 'text-emerald-600' : r.oee >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>{r.oee}%</td>
      <td className="px-3 py-2 text-center"><span className="text-emerald-600 font-medium">{r.running}</span><span className="text-muted-foreground">/{r.machines}</span></td>
      <td className="px-3 py-2 text-center">{r.operators}</td>
      <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${riskBadge[r.risk]}`}>{r.risk}</span></td>
      <td className="px-3 py-2"><span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-bold ${statusBadge[r.status]}`}><span className={`h-1.5 w-1.5 rounded-full ${statusColor[r.status]}`} />{r.status}</span></td>
    </>
  )
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Globe2 className="h-6 w-6 text-blue-600" />Enterprise Control Tower</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 47 · Hierarchical drill-down · Enterprise → Plant → Department → Line</p>
        </div>
        <Button size="sm" variant="outline"><RefreshCw className="mr-1 h-4 w-4" />Sync Tower</Button>
      </div>
      <Card className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1">View Modes:</span>
          {viewModes.map((v, i) => (
            <span key={v} className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${i === 0 ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-muted text-muted-foreground'}`}>{v}</span>
          ))}
        </div>
      </Card>
      <Card className={`p-4 ${enterprise.status === 'GREEN' ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-lg bg-white border flex items-center justify-center flex-shrink-0">
              <Globe2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">{enterprise.name}</p>
              <p className="text-[11px] text-muted-foreground">{enterprise.plants} plants · {enterprise.machines} machines · {enterprise.operators} operators on shift</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div><p className="text-[10px] text-muted-foreground">Active WOs</p><p className="text-lg font-bold text-blue-700">{enterprise.activeWOs}</p></div>
            <div><p className="text-[10px] text-muted-foreground">Output / Target</p><p className="text-lg font-bold text-emerald-700">{enterprise.output.toLocaleString('en-IN')} / {enterprise.target.toLocaleString('en-IN')}</p></div>
            <div><p className="text-[10px] text-muted-foreground">OEE</p><p className="text-lg font-bold text-emerald-700">{enterprise.oee}%</p></div>
            <div><p className="text-[10px] text-muted-foreground">Machines</p><p className="text-lg font-bold"><span className="text-emerald-700">{enterprise.running}</span><span className="text-muted-foreground">/{enterprise.machines}</span></p></div>
            <div><span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded font-bold ${statusBadge[enterprise.status]}`}><span className={`h-2 w-2 rounded-full ${statusColor[enterprise.status]}`} />{enterprise.status}</span></div>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-sm">Level 2 — Plants</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50"><tr className="text-left">
              <th className="px-3 py-2 font-medium">Plant</th><th className="px-3 py-2 font-medium">Region</th>
              <th className="px-3 py-2 font-medium text-center">Active WOs</th><th className="px-3 py-2 font-medium text-right">Output</th>
              <th className="px-3 py-2 font-medium text-center">OEE</th><th className="px-3 py-2 font-medium text-center">Machines (Run/Total)</th>
              <th className="px-3 py-2 font-medium text-center">Operators</th><th className="px-3 py-2 font-medium">Risk</th><th className="px-3 py-2 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {plants.map(p => (
                <tr key={p.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-mono text-[11px] text-blue-700">{p.code}</p><p className="text-[10px] text-muted-foreground">{p.name}</p></td>
                  <td className="px-3 py-2 text-[11px]">{p.region}</td>
                  {renderRow(p)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center gap-2">
          <Factory className="h-4 w-4 text-purple-600" />
          <h3 className="font-semibold text-sm">Level 3 — Departments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50"><tr className="text-left">
              <th className="px-3 py-2 font-medium">Department</th><th className="px-3 py-2 font-medium">Plant</th>
              <th className="px-3 py-2 font-medium text-center">Active WOs</th><th className="px-3 py-2 font-medium text-right">Output</th>
              <th className="px-3 py-2 font-medium text-center">OEE</th><th className="px-3 py-2 font-medium text-center">Machines (Run/Total)</th>
              <th className="px-3 py-2 font-medium text-center">Operators</th><th className="px-3 py-2 font-medium">Risk</th><th className="px-3 py-2 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {departments.map(d => (
                <tr key={d.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-mono text-[11px] text-purple-700">{d.code}</p><p className="text-[10px] text-muted-foreground">{d.name}</p></td>
                  <td className="px-3 py-2 text-[11px]">{d.plant}</td>
                  {renderRow(d)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-emerald-600" />
          <h3 className="font-semibold text-sm">Level 4 — Lines</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50"><tr className="text-left">
              <th className="px-3 py-2 font-medium">Line</th><th className="px-3 py-2 font-medium">Dept</th>
              <th className="px-3 py-2 font-medium text-center">Active WOs</th><th className="px-3 py-2 font-medium text-right">Output</th>
              <th className="px-3 py-2 font-medium text-center">OEE</th><th className="px-3 py-2 font-medium text-center">Machines (Run/Total)</th>
              <th className="px-3 py-2 font-medium text-center">Operators</th><th className="px-3 py-2 font-medium">Risk</th><th className="px-3 py-2 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {lines.map(l => (
                <tr key={l.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-mono text-[11px] text-emerald-700">{l.code}</p><p className="text-[10px] text-muted-foreground">{l.name}</p></td>
                  <td className="px-3 py-2 text-[11px]">{l.dept}</td>
                  {renderRow(l)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Digital Factory (Digital Twin) ─────────────────────────────────────
function DigitalFactoryModule() {
  const summary = { totalNodes: 38, running: 18, setup: 1, cleaning: 1, fault: 1, idle: 3, totalWIP: 1248 }
  const statusStyles: Record<string, { dot: string; badge: string; border: string; icon: string }> = {
    RUNNING: { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-300', icon: 'text-emerald-600' },
    SETUP: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', border: 'border-amber-300', icon: 'text-amber-600' },
    FAULT: { dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700', border: 'border-rose-300', icon: 'text-rose-600' },
    CLEANING: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', border: 'border-blue-300', icon: 'text-blue-600' },
    IDLE: { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600', border: 'border-slate-300', icon: 'text-slate-500' },
  }
  const machines = [
    { code: 'MIX-01', name: 'Industrial Mixer 01', line: 'LINE-KK-01', status: 'RUNNING', batch: 'KK-500g-B247', output: 542, capacity: 600, operator: 'OP-001 Rajesh K.' },
    { code: 'COOK-01', name: 'Cooking Kettle 01', line: 'LINE-KK-01', status: 'RUNNING', batch: 'KK-500g-B247', output: 510, capacity: 600, operator: 'OP-001 Rajesh K.' },
    { code: 'COOL-01', name: 'Cooling Tunnel 01', line: 'LINE-KK-01', status: 'CLEANING', batch: '—', output: 0, capacity: 400, operator: 'OP-005 Lakshmi V.' },
    { code: 'PACK-03', name: 'Packaging Machine 03', line: 'LINE-KK-01', status: 'SETUP', batch: 'KK-1kg-B248', output: 0, capacity: 300, operator: 'OP-002 Anil R.' },
    { code: 'MIX-02', name: 'Industrial Mixer 02', line: 'LINE-IB-01', status: 'RUNNING', batch: 'IB-1L-B118', output: 95, capacity: 120, operator: 'OP-003 Suresh M.' },
    { code: 'PACK-04', name: 'Packaging Machine 04', line: 'LINE-IB-01', status: 'RUNNING', batch: 'IB-1L-B118', output: 90, capacity: 120, operator: 'OP-003 Suresh M.' },
    { code: 'FRY-01', name: 'Continuous Fryer 01', line: 'LINE-NM-01', status: 'FAULT', batch: 'NM-200g-B082', output: 0, capacity: 320, operator: '—' },
    { code: 'SEAS-01', name: 'Seasoning Drum 01', line: 'LINE-NM-01', status: 'IDLE', batch: '—', output: 0, capacity: 320, operator: '—' },
    { code: 'PACK-05', name: 'Packaging Machine 05', line: 'LINE-NM-01', status: 'RUNNING', batch: 'NM-200g-B082', output: 250, capacity: 320, operator: 'OP-004 Vijay P.' },
    { code: 'MIX-03', name: 'Industrial Mixer 03', line: 'LINE-ML-01', status: 'RUNNING', batch: 'ML-250g-B064', output: 294, capacity: 290, operator: 'OP-005 Lakshmi V.' },
    { code: 'FRY-02', name: 'Frying Pan 02', line: 'LINE-ML-01', status: 'RUNNING', batch: 'ML-250g-B064', output: 280, capacity: 290, operator: 'OP-005 Lakshmi V.' },
    { code: 'SYRUP-01', name: 'Syrup Injector 01', line: 'LINE-GUL-01', status: 'RUNNING', batch: 'GJ-1kg-B029', output: 67, capacity: 50, operator: 'OP-002 Anil R.' },
    { code: 'FRY-03', name: 'Frying Unit 03', line: 'LINE-GUL-01', status: 'RUNNING', batch: 'GJ-1kg-B029', output: 65, capacity: 50, operator: 'OP-002 Anil R.' },
    { code: 'PACK-06', name: 'Packaging Machine 06', line: 'LINE-GUL-01', status: 'IDLE', batch: '—', output: 0, capacity: 50, operator: '—' },
  ]
  const lines = [
    { code: 'LINE-KK-01', name: 'Kaju Katli Line', dept: 'Production', machines: 4, running: 2, wip: 1052 },
    { code: 'LINE-IB-01', name: 'Idli Batter Line', dept: 'Production', machines: 2, running: 2, wip: 185 },
    { code: 'LINE-NM-01', name: 'Namkeen Line', dept: 'Production', machines: 3, running: 1, wip: 250 },
    { code: 'LINE-ML-01', name: 'Motichoor Line', dept: 'Production', machines: 2, running: 2, wip: 574 },
    { code: 'LINE-GUL-01', name: 'Gulab Jamun Line', dept: 'Production', machines: 3, running: 2, wip: 132 },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Network className="h-6 w-6 text-indigo-600" />Digital Factory Twin</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 47 · Live hierarchical model · Plant → Department → Line → Machine</p>
        </div>
        <Button size="sm" variant="outline"><RefreshCw className="mr-1 h-4 w-4" />Re-sync Twin</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        {[
          { label: 'Total Nodes', value: summary.totalNodes, color: 'text-blue-600' },
          { label: 'Running', value: summary.running, color: 'text-emerald-600' },
          { label: 'Setup', value: summary.setup, color: 'text-amber-600' },
          { label: 'Cleaning', value: summary.cleaning, color: 'text-blue-600' },
          { label: 'Fault', value: summary.fault, color: 'text-rose-600' },
          { label: 'Idle', value: summary.idle, color: 'text-slate-500' },
          { label: 'Total WIP', value: summary.totalWIP.toLocaleString('en-IN'), color: 'text-purple-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-[11px] text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-sm">Plant — THN · Thane Plant 01</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-700">GREEN</span>
        </div>
        <div className="ml-4 border-l-2 border-muted pl-4 space-y-3">
          <div className="flex items-center gap-2">
            <Factory className="h-4 w-4 text-purple-600" />
            <span className="font-semibold text-xs">Department — Production (5 lines)</span>
          </div>
          <div className="ml-4 border-l-2 border-purple-200 pl-4 space-y-3">
            {lines.map(line => {
              const lineMachines = machines.filter(m => m.line === line.code)
              return (
                <div key={line.code}>
                  <div className="flex items-center gap-2 text-xs">
                    <ChevronRight className="h-3 w-3 text-emerald-600" />
                    <span className="font-mono text-[11px] text-emerald-700">{line.code}</span>
                    <span className="text-muted-foreground">{line.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{line.machines} machines · {line.running} running · WIP {line.wip.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="ml-4 mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {lineMachines.map(m => {
                      const s = statusStyles[m.status]
                      return (
                        <div key={m.code} className={`p-2 border rounded-lg ${s.border} bg-card`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-mono text-[11px] text-blue-700">{m.code}</p>
                              <p className="text-[10px] text-muted-foreground">{m.name}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-bold ${s.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{m.status}</span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                            <div className="text-muted-foreground">Batch:</div><div className="font-mono text-[10px]">{m.batch}</div>
                            <div className="text-muted-foreground">Output:</div><div className="font-semibold">{m.output.toLocaleString('en-IN')} / {m.capacity.toLocaleString('en-IN')}</div>
                            <div className="text-muted-foreground">Operator:</div><div className="text-[10px]">{m.operator}</div>
                          </div>
                          <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden"><div className={`h-full ${m.status === 'RUNNING' ? 'bg-emerald-500' : m.status === 'SETUP' ? 'bg-amber-500' : m.status === 'FAULT' ? 'bg-rose-500' : m.status === 'CLEANING' ? 'bg-blue-500' : 'bg-slate-400'}`} style={{ width: `${m.capacity > 0 ? Math.min(100, (m.output / m.capacity) * 100) : 0}%` }} /></div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
      <Card className="p-3 bg-muted/30">
        <div className="flex items-center gap-3 flex-wrap text-[11px]">
          <span className="font-semibold">Legend:</span>
          {Object.entries(statusStyles).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${v.dot}`} /><span className="font-medium">{k}</span></span>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Mfg Alert Center ───────────────────────────────────────────────────
function MfgAlertCenterModule() {
  const summary = { total: 24, active: 2, acknowledged: 5, resolved: 16, escalated: 1, critical: 1, warning: 6, info: 17 }
  const severityStyles: Record<string, string> = {
    CRITICAL: 'bg-rose-100 text-rose-700 border-rose-300',
    WARNING: 'bg-amber-100 text-amber-700 border-amber-300',
    INFO: 'bg-blue-100 text-blue-700 border-blue-300',
  }
  const statusStyles: Record<string, string> = {
    ACTIVE: 'bg-rose-100 text-rose-700',
    ACKNOWLEDGED: 'bg-amber-100 text-amber-700',
    RESOLVED: 'bg-emerald-100 text-emerald-700',
    ESCALATED: 'bg-purple-100 text-purple-700',
  }
  const alerts = [
    { code: 'ALR-2026-00471', plant: 'THN', line: 'LINE-NM-01', machine: 'FRY-01', type: 'EQUIPMENT_FAULT', title: 'Continuous Fryer 01 — Temperature Sensor Failure', description: 'PLC reports thermocouple T-02 out-of-range. Frying zone temperature dropped 18°C below setpoint. Auto-shutdown triggered.', severity: 'CRITICAL', status: 'ACTIVE', ackBy: '—', raisedAt: '14:32', escLevel: 2, channels: ['EMAIL', 'SMS', 'PUSH', 'SIREN', 'TEAMS'] },
    { code: 'ALR-2026-00470', plant: 'THN', line: 'LINE-KK-01', machine: 'COOL-01', type: 'CLEANING_OVERDUE', title: 'Cooling Tunnel 01 — Cleaning Cycle Overdue', description: 'Allergen-changeover cleaning scheduled 14:00 not started. Risk of cross-contamination with next batch.', severity: 'WARNING', status: 'ACKNOWLEDGED', ackBy: 'Lakshmi V.', raisedAt: '14:05', escLevel: 1, channels: ['EMAIL', 'PUSH', 'TEAMS'] },
    { code: 'ALR-2026-00469', plant: 'PUN', line: 'LINE-CHN-01', machine: 'OVEN-02', type: 'OEE_BELOW_TARGET', title: 'Chikki Line — OEE 72% (target 85%)', description: 'Sustained OEE below threshold for 3 consecutive hours. Investigate operator availability and material supply.', severity: 'WARNING', status: 'ESCALATED', ackBy: 'Mahesh K.', raisedAt: '12:18', escLevel: 3, channels: ['EMAIL', 'SMS', 'TEAMS'] },
    { code: 'ALR-2026-00468', plant: 'NAS', line: 'LINE-BRW-01', machine: 'PACK-07', type: 'MATERIAL_SHORTAGE', title: 'Packaging Film — Stock < 1 hr runtime', description: 'Laminated film roll at 12% remaining. Changeover required in 45 minutes.', severity: 'INFO', status: 'RESOLVED', ackBy: 'Suresh M.', raisedAt: '11:42', escLevel: 0, channels: ['PUSH'] },
    { code: 'ALR-2026-00467', plant: 'THN', line: 'LINE-ML-01', machine: 'MIX-03', type: 'QUALITY_HOLD', title: 'Motichoor Batch B064 — Quality Hold', description: 'Lab sample pending. Sugar syrup brix reading at 78.2 vs target 80.0. Pending supervisor release.', severity: 'WARNING', status: 'ACKNOWLEDGED', ackBy: 'Lakshmi V.', raisedAt: '10:55', escLevel: 1, channels: ['EMAIL', 'PUSH'] },
    { code: 'ALR-2026-00466', plant: 'BLR', line: 'LINE-CHK-02', machine: 'COOL-02', type: 'MAINTENANCE_DUE', title: 'Cooling Tunnel 02 — Preventive Maintenance Due', description: '500-hour PM checklist due. Schedule during next shift change.', severity: 'INFO', status: 'RESOLVED', ackBy: 'Vijay P.', raisedAt: '09:20', escLevel: 0, channels: ['EMAIL'] },
  ]
  const channels = [
    { name: 'EMAIL', active: true, alertCount: 24, icon: FileText },
    { name: 'SMS', active: true, alertCount: 3, icon: Bell },
    { name: 'PUSH', active: true, alertCount: 18, icon: BellRing },
    { name: 'SIREN', active: true, alertCount: 1, icon: Siren },
    { name: 'TEAMS', active: true, alertCount: 9, icon: Users },
    { name: 'WEBHOOK', active: false, alertCount: 0, icon: Network },
    { name: 'PHONE_CALL', active: true, alertCount: 2, icon: Phone },
  ]
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Siren className="h-6 w-6 text-rose-600" />Manufacturing Alert Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 47 · Unified alert queue · 7 delivery channels · Tiered escalation</p>
        </div>
        <Button size="sm"><BellRing className="mr-1 h-4 w-4" />Acknowledge All</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        {[
          { label: 'Total', value: summary.total, color: 'text-blue-600' },
          { label: 'Active', value: summary.active, color: 'text-rose-600' },
          { label: 'Acknowledged', value: summary.acknowledged, color: 'text-amber-600' },
          { label: 'Resolved', value: summary.resolved, color: 'text-emerald-600' },
          { label: 'Escalated', value: summary.escalated, color: 'text-purple-600' },
          { label: 'Critical', value: summary.critical, color: 'text-rose-700' },
          { label: 'Warning', value: summary.warning, color: 'text-amber-700' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-[11px] text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Active Alert Queue</h3>
          <span className="text-[10px] text-muted-foreground">Sorted by severity · Live</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50"><tr className="text-left">
              <th className="px-3 py-2 font-medium">Code</th>
              <th className="px-3 py-2 font-medium">Plant / Line / Machine</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Title & Description</th>
              <th className="px-3 py-2 font-medium">Severity</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Ack By</th>
              <th className="px-3 py-2 font-medium text-center">Raised</th>
              <th className="px-3 py-2 font-medium text-center">Esc</th>
              <th className="px-3 py-2 font-medium">Channels</th>
            </tr></thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.code} className="border-t hover:bg-muted/30 align-top">
                  <td className="px-3 py-2 font-mono text-[10px] text-blue-700">{a.code}</td>
                  <td className="px-3 py-2"><p className="font-medium text-[11px]">{a.plant}</p><p className="text-[10px] text-muted-foreground">{a.line}</p><p className="text-[10px] font-mono">{a.machine}</p></td>
                  <td className="px-3 py-2 text-[10px]">{a.type.replace(/_/g, ' ')}</td>
                  <td className="px-3 py-2 max-w-xs"><p className="font-semibold text-[11px]">{a.title}</p><p className="text-[10px] text-muted-foreground mt-0.5">{a.description}</p></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${severityStyles[a.severity]}`}>{a.severity}</span></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusStyles[a.status]}`}>{a.status}</span></td>
                  <td className="px-3 py-2 text-[10px]">{a.ackBy}</td>
                  <td className="px-3 py-2 text-center text-[10px] font-mono">{a.raisedAt}</td>
                  <td className="px-3 py-2 text-center"><span className={`text-[10px] font-bold ${a.escLevel >= 2 ? 'text-rose-600' : a.escLevel === 1 ? 'text-amber-600' : 'text-emerald-600'}`}>L{a.escLevel}</span></td>
                  <td className="px-3 py-2"><div className="flex flex-wrap gap-0.5">{a.channels.map(c => <span key={c} className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground font-medium">{c}</span>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Delivery Channels</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-0">
          {channels.map((c, i) => (
            <div key={c.name} className={`p-3 ${i < channels.length - 1 ? 'md:border-r' : ''} border-b md:border-b-0`}>
              <div className="flex items-center justify-between">
                <c.icon className={`h-4 w-4 ${c.active ? 'text-emerald-600' : 'text-muted-foreground/40'}`} />
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{c.active ? 'ACTIVE' : 'OFF'}</span>
              </div>
              <p className="text-[11px] font-semibold mt-2">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">{c.alertCount} alerts sent</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Mfg Factory Health & Business Continuity ───────────────────────────
function MfgFactoryHealthModule() {
  const systems = [
    { code: 'MES-CORE', name: 'MES Core', icon: Server, status: 'HEALTHY', healthScore: 98.2, responseMs: 142, uptime: 99.97, lastIncident: '2026-06-12 · 14m degradation' },
    { code: 'API-GW', name: 'API Gateway', icon: Network, status: 'HEALTHY', healthScore: 99.1, responseMs: 38, uptime: 99.99, lastIncident: '2026-05-28 · 6m throttling' },
    { code: 'IOT-GW', name: 'IoT Gateway', icon: Radio, status: 'DEGRADED', healthScore: 86.4, responseMs: 284, uptime: 99.42, lastIncident: 'ACTIVE · 2 sensors offline' },
    { code: 'DB-PRIMARY', name: 'Database (Primary)', icon: Database, status: 'HEALTHY', healthScore: 97.5, responseMs: 18, uptime: 99.98, lastIncident: '2026-04-30 · replica lag' },
    { code: 'PROD-APP', name: 'Production App', icon: Activity, status: 'HEALTHY', healthScore: 96.8, responseMs: 210, uptime: 99.95, lastIncident: '2026-06-20 · deploy rollback' },
    { code: 'WMS-INT', name: 'Warehouse Integration', icon: Boxes, status: 'HEALTHY', healthScore: 94.2, responseMs: 320, uptime: 99.88, lastIncident: '2026-06-08 · queue backlog' },
    { code: 'NETWORK', name: 'Network (LAN/WAN)', icon: Globe2, status: 'HEALTHY', healthScore: 99.0, responseMs: 4, uptime: 99.99, lastIncident: '2026-03-14 · switch failover' },
    { code: 'POWER', name: 'Power (UPS + DG)', icon: Power, status: 'HEALTHY', healthScore: 95.5, responseMs: 0, uptime: 99.92, lastIncident: '2026-05-04 · 12s UPS switchover' },
    { code: 'BACKUP', name: 'Backup & DR', icon: ShieldCheck, status: 'HEALTHY', healthScore: 97.0, responseMs: 0, uptime: 100.0, lastIncident: '2026-02-22 · test restore OK' },
  ]
  const incidents = [
    { code: 'INC-2026-0118', system: 'IoT Gateway', type: 'SENSOR_OFFLINE', description: '2 of 18 sensors on LINE-NM-01 stopped reporting at 14:28. PLC bridge retries exhausted.', severity: 'WARNING', status: 'INVESTIGATING', detectedAt: '14:28', downtimeMin: 24, failover: 'PARTIAL — stale values cached' },
    { code: 'INC-2026-0117', system: 'IoT Gateway', type: 'BROKER_DISCONNECT', description: 'MQTT broker connection lost for 38s during network blip. Auto-reconnect succeeded.', severity: 'INFO', status: 'RESOLVED', detectedAt: '13:51', downtimeMin: 1, failover: 'NONE — self-healed' },
  ]
  const checklist = [
    { step: 1, title: 'Detect & declare incident', done: true, owner: 'Auto-monitor', ts: '14:28' },
    { step: 2, title: 'Notify on-call + activate war room', done: true, owner: 'PagerDuty', ts: '14:30' },
    { step: 3, title: 'Engage failover / redundant path', done: true, owner: 'Network Ops', ts: '14:34' },
    { step: 4, title: 'Root cause analysis', done: false, owner: 'IoT Eng', ts: '—' },
    { step: 5, title: 'Restore + post-mortem + runbook update', done: false, owner: 'SRE Lead', ts: '—' },
  ]
  const statusBadge: Record<string, string> = { HEALTHY: 'bg-emerald-100 text-emerald-700', DEGRADED: 'bg-amber-100 text-amber-700', DOWN: 'bg-rose-100 text-rose-700' }
  const sevBadge: Record<string, string> = { CRITICAL: 'bg-rose-100 text-rose-700', WARNING: 'bg-amber-100 text-amber-700', INFO: 'bg-blue-100 text-blue-700' }
  const incBadge: Record<string, string> = { INVESTIGATING: 'bg-amber-100 text-amber-700', RESOLVED: 'bg-emerald-100 text-emerald-700', MITIGATING: 'bg-blue-100 text-blue-700' }
  const avgUptime = (systems.reduce((a, s) => a + s.uptime, 0) / systems.length).toFixed(2)
  const healthyCount = systems.filter(s => s.status === 'HEALTHY').length
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-emerald-600" />Factory Health & Business Continuity</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 47 · 9 critical systems · Live health probes · Active incident response</p>
        </div>
        <Button size="sm" variant="outline"><RefreshCw className="mr-1 h-4 w-4" />Run Health Probe</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Systems', value: systems.length, color: 'text-blue-600' },
          { label: 'Healthy', value: healthyCount, color: 'text-emerald-600' },
          { label: 'Avg Uptime', value: `${avgUptime}%`, color: 'text-emerald-600' },
          { label: 'Active Incidents', value: incidents.length, color: 'text-amber-600' },
          { label: 'Avg Resolution', value: '42 min', color: 'text-blue-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-[11px] text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">System Health Checks</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50"><tr className="text-left">
              <th className="px-3 py-2 font-medium">System</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium text-center">Health Score</th>
              <th className="px-3 py-2 font-medium text-right">Response</th>
              <th className="px-3 py-2 font-medium text-center">Uptime %</th>
              <th className="px-3 py-2 font-medium">Last Incident</th>
            </tr></thead>
            <tbody>
              {systems.map(s => (
                <tr key={s.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><div className="flex items-center gap-2"><s.icon className="h-4 w-4 text-muted-foreground" /><div><p className="font-mono text-[11px] text-blue-700">{s.code}</p><p className="text-[10px] text-muted-foreground">{s.name}</p></div></div></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusBadge[s.status]}`}>{s.status}</span></td>
                  <td className="px-3 py-2 text-center"><div className="flex items-center gap-1 justify-center"><div className="w-16 h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full ${s.healthScore >= 95 ? 'bg-emerald-500' : s.healthScore >= 85 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${s.healthScore}%` }} /></div><span className={`font-bold ${s.healthScore >= 95 ? 'text-emerald-600' : s.healthScore >= 85 ? 'text-amber-600' : 'text-rose-600'}`}>{s.healthScore}</span></div></td>
                  <td className="px-3 py-2 text-right font-mono text-[11px]">{s.responseMs} ms</td>
                  <td className={`px-3 py-2 text-center font-bold ${s.uptime >= 99.9 ? 'text-emerald-600' : s.uptime >= 99.0 ? 'text-amber-600' : 'text-rose-600'}`}>{s.uptime}%</td>
                  <td className="px-3 py-2 text-[10px] text-muted-foreground">{s.lastIncident}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Active Incidents</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50"><tr className="text-left">
              <th className="px-3 py-2 font-medium">Code</th>
              <th className="px-3 py-2 font-medium">System / Type</th>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="px-3 py-2 font-medium">Severity</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium text-center">Detected</th>
              <th className="px-3 py-2 font-medium text-center">Downtime</th>
              <th className="px-3 py-2 font-medium">Failover</th>
            </tr></thead>
            <tbody>
              {incidents.map(i => (
                <tr key={i.code} className="border-t hover:bg-muted/30 align-top">
                  <td className="px-3 py-2 font-mono text-[10px] text-blue-700">{i.code}</td>
                  <td className="px-3 py-2"><p className="text-[11px] font-medium">{i.system}</p><p className="text-[10px] text-muted-foreground">{i.type.replace(/_/g, ' ')}</p></td>
                  <td className="px-3 py-2 text-[10px] max-w-xs">{i.description}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${sevBadge[i.severity]}`}>{i.severity}</span></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${incBadge[i.status]}`}>{i.status}</span></td>
                  <td className="px-3 py-2 text-center text-[10px] font-mono">{i.detectedAt}</td>
                  <td className="px-3 py-2 text-center font-medium">{i.downtimeMin} min</td>
                  <td className="px-3 py-2 text-[10px]">{i.failover}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-600" />Recovery Checklist (Active Incident)</h3>
        <div className="space-y-2">
          {checklist.map(c => (
            <div key={c.step} className="flex items-center gap-3 p-2 border rounded-lg">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${c.done ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>{c.done ? <CheckCircle2 className="h-4 w-4" /> : c.step}</div>
              <div className="flex-1">
                <p className={`text-xs font-medium ${c.done ? 'line-through text-muted-foreground' : ''}`}>{c.title}</p>
                <p className="text-[10px] text-muted-foreground">Owner: {c.owner}</p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{c.ts}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Mfg Enterprise Scorecard ───────────────────────────────────────────
function MfgScorecardModule() {
  const kpis = [
    { name: 'Production Achievement', value: 94.5, target: 95.0, unit: '%', status: 'YELLOW', icon: Target },
    { name: 'OEE', value: 84.2, target: 85.0, unit: '%', status: 'YELLOW', icon: Gauge },
    { name: 'Yield', value: 96.8, target: 96.0, unit: '%', status: 'GREEN', icon: TrendingUp },
    { name: 'Scrap', value: 0.55, target: 0.80, unit: '%', status: 'GREEN', icon: TrendingDown },
    { name: 'Rework', value: 1.2, target: 1.0, unit: '%', status: 'RED', icon: RefreshCw },
    { name: 'Machine Utilization', value: 88.7, target: 90.0, unit: '%', status: 'YELLOW', icon: Server },
    { name: 'Schedule Adherence', value: 92.4, target: 95.0, unit: '%', status: 'YELLOW', icon: Calendar },
    { name: 'Labor Productivity', value: 108.5, target: 100.0, unit: 'index', status: 'GREEN', icon: Users },
    { name: 'Energy Cost', value: 8.42, target: 8.00, unit: '₹/unit', status: 'RED', icon: Zap },
    { name: 'Manufacturing Cost', value: 152.4, target: 150.0, unit: '₹/kg', status: 'YELLOW', icon: IndianRupee },
    { name: 'On-Time Completion', value: 88.0, target: 90.0, unit: '%', status: 'YELLOW', icon: Clock },
  ]
  const lightStyles: Record<string, { dot: string; badge: string; text: string }> = {
    GREEN: { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-600' },
    YELLOW: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', text: 'text-amber-600' },
    RED: { dot: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700', text: 'text-rose-600' },
  }
  const plantRanking = [
    { rank: 1, plant: 'BLR', name: 'Bengaluru Plant 04', score: 88.9, oee: 88.9, yield: 97.4, scrap: 0.42, cost: 148.2, onTime: 92.0, status: 'GREEN' },
    { rank: 2, plant: 'THN', name: 'Thane Plant 01', score: 84.2, oee: 84.2, yield: 96.8, scrap: 0.55, cost: 152.4, onTime: 88.0, status: 'YELLOW' },
    { rank: 3, plant: 'PUN', name: 'Pune Plant 02', score: 81.5, oee: 81.5, yield: 95.2, scrap: 0.78, cost: 156.8, onTime: 84.5, status: 'YELLOW' },
    { rank: 4, plant: 'NAS', name: 'Nashik Plant 03', score: 78.4, oee: 78.4, yield: 93.8, scrap: 1.05, cost: 162.4, onTime: 80.0, status: 'RED' },
  ]
  const deptRanking = [
    { rank: 1, dept: 'DEP-PROD-BLR', plant: 'BLR', name: 'Production', score: 88.9, kpiCount: 9, greenCount: 8, yellowCount: 1, redCount: 0 },
    { rank: 2, dept: 'DEP-PROD-THN', plant: 'THN', name: 'Production', score: 84.2, kpiCount: 11, greenCount: 4, yellowCount: 6, redCount: 1 },
    { rank: 3, dept: 'DEP-PACK-THN', plant: 'THN', name: 'Packaging', score: 82.4, kpiCount: 8, greenCount: 5, yellowCount: 2, redCount: 1 },
    { rank: 4, dept: 'DEP-PROD-PUN', plant: 'PUN', name: 'Production', score: 81.5, kpiCount: 11, greenCount: 3, yellowCount: 6, redCount: 2 },
    { rank: 5, dept: 'DEP-PROD-NAS', plant: 'NAS', name: 'Production', score: 78.4, kpiCount: 11, greenCount: 2, yellowCount: 6, redCount: 3 },
  ]
  const greenCount = kpis.filter(k => k.status === 'GREEN').length
  const yellowCount = kpis.filter(k => k.status === 'YELLOW').length
  const redCount = kpis.filter(k => k.status === 'RED').length
  const formatValue = (v: number, unit: string) => unit === '₹/kg' || unit === '₹/unit' ? `₹${v.toLocaleString('en-IN')}` : `${v}${unit === '%' ? '%' : ` ${unit}`}`
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Target className="h-6 w-6 text-indigo-600" />Enterprise Manufacturing Scorecard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 47 · 11 KPIs · Traffic-light status · Plant & department ranking</p>
        </div>
        <Button size="sm" variant="outline"><Calendar className="mr-1 h-4 w-4" />This Month</Button>
      </div>
      <Card className="p-3">
        <div className="flex items-center gap-4 flex-wrap text-xs">
          <span className="font-semibold">Traffic Light Summary:</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-emerald-500" /><span className="font-bold text-emerald-700">{greenCount} GREEN</span></span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-amber-500" /><span className="font-bold text-amber-700">{yellowCount} YELLOW</span></span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-rose-500" /><span className="font-bold text-rose-700">{redCount} RED</span></span>
          <span className="text-muted-foreground ml-auto">Total KPIs: {kpis.length}</span>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {kpis.map(k => {
          const s = lightStyles[k.status]
          return (
            <Card key={k.name} className={`p-3 border-l-4 ${k.status === 'GREEN' ? 'border-l-emerald-500' : k.status === 'YELLOW' ? 'border-l-amber-500' : 'border-l-rose-500'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <k.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[11px] text-muted-foreground">{k.name}</p>
                    <p className={`text-2xl font-bold mt-0.5 ${s.text}`}>{formatValue(k.value, k.unit)}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-bold ${s.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />{k.status}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Target: <span className="font-medium text-foreground">{formatValue(k.target, k.unit)}</span></span>
                <span className={`font-medium ${k.status === 'GREEN' ? 'text-emerald-600' : k.status === 'YELLOW' ? 'text-amber-600' : 'text-rose-600'}`}>{k.status === 'GREEN' ? 'Meets/Exceeds' : k.status === 'YELLOW' ? 'Watch' : 'Below'}</span>
              </div>
            </Card>
          )
        })}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Plant Ranking</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50"><tr className="text-left">
              <th className="px-3 py-2 font-medium text-center">#</th>
              <th className="px-3 py-2 font-medium">Plant</th>
              <th className="px-3 py-2 font-medium text-center">Score</th>
              <th className="px-3 py-2 font-medium text-center">OEE</th>
              <th className="px-3 py-2 font-medium text-center">Yield</th>
              <th className="px-3 py-2 font-medium text-center">Scrap</th>
              <th className="px-3 py-2 font-medium text-right">Cost ₹/kg</th>
              <th className="px-3 py-2 font-medium text-center">On-Time</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {plantRanking.map(p => (
                <tr key={p.plant} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 text-center font-bold">{p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : p.rank}</td>
                  <td className="px-3 py-2"><p className="font-mono text-[11px] text-blue-700">{p.plant}</p><p className="text-[10px] text-muted-foreground">{p.name}</p></td>
                  <td className="px-3 py-2 text-center font-bold">{p.score}</td>
                  <td className={`px-3 py-2 text-center ${p.oee >= 85 ? 'text-emerald-600' : p.oee >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>{p.oee}%</td>
                  <td className="px-3 py-2 text-center">{p.yield}%</td>
                  <td className={`px-3 py-2 text-center ${p.scrap <= 0.5 ? 'text-emerald-600' : p.scrap <= 0.8 ? 'text-amber-600' : 'text-rose-600'}`}>{p.scrap}%</td>
                  <td className="px-3 py-2 text-right font-medium">₹{p.cost.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-2 text-center">{p.onTime}%</td>
                  <td className="px-3 py-2"><span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-bold ${lightStyles[p.status].badge}`}><span className={`h-1.5 w-1.5 rounded-full ${lightStyles[p.status].dot}`} />{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Department Ranking</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50"><tr className="text-left">
              <th className="px-3 py-2 font-medium text-center">#</th>
              <th className="px-3 py-2 font-medium">Department</th>
              <th className="px-3 py-2 font-medium">Plant</th>
              <th className="px-3 py-2 font-medium text-center">Score</th>
              <th className="px-3 py-2 font-medium text-center">KPIs</th>
              <th className="px-3 py-2 font-medium text-center">Green</th>
              <th className="px-3 py-2 font-medium text-center">Yellow</th>
              <th className="px-3 py-2 font-medium text-center">Red</th>
            </tr></thead>
            <tbody>
              {deptRanking.map(d => (
                <tr key={d.dept} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 text-center font-bold">{d.rank === 1 ? '🥇' : d.rank === 2 ? '🥈' : d.rank === 3 ? '🥉' : d.rank}</td>
                  <td className="px-3 py-2"><p className="font-mono text-[11px] text-purple-700">{d.dept}</p><p className="text-[10px] text-muted-foreground">{d.name}</p></td>
                  <td className="px-3 py-2 text-[11px]">{d.plant}</td>
                  <td className="px-3 py-2 text-center font-bold">{d.score}</td>
                  <td className="px-3 py-2 text-center">{d.kpiCount}</td>
                  <td className="px-3 py-2 text-center"><span className="font-bold text-emerald-600">{d.greenCount}</span></td>
                  <td className="px-3 py-2 text-center"><span className="font-bold text-amber-600">{d.yellowCount}</span></td>
                  <td className="px-3 py-2 text-center"><span className="font-bold text-rose-600">{d.redCount}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

// ─── Mfg Executive Dashboard ────────────────────────────────────────────
function MfgExecutiveDashboardModule() {
  const healthScore = 87.5
  const kpis = [
    { label: 'Production', value: '94.5%', target: '95.0%', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'OEE', value: '84.2%', target: '85.0%', icon: Gauge, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Yield', value: '96.8%', target: '96.0%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Scrap', value: '0.55%', target: '0.80%', icon: TrendingDown, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Mfg Cost', value: `₹${(184600).toLocaleString('en-IN')}`, target: `₹${(178400).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Machine Availability', value: '93.5%', target: '95.0%', icon: Server, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'On-Time', value: '88.0%', target: '90.0%', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Energy', value: `${(1840).toLocaleString('en-IN')} kWh`, target: '1,900 kWh', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]
  const highlights = [
    { type: 'CRITICAL', title: 'Continuous Fryer 01 — Temperature sensor failure', detail: 'LINE-NM-01 down since 14:32 · 2 alerts raised · auto-escalated L2', icon: Siren, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
    { type: 'SUCCESS', title: 'Motichoor Line exceeded target by 1.4%', detail: 'Output 294 vs target 290 · operator OP-005 Lakshmi V.', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { type: 'WARNING', title: 'Cooling Tunnel 01 cleaning overdue 35 min', detail: 'Allergen changeover on LINE-KK-01 at risk · acknowledged by Lakshmi V.', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
    { type: 'INFO', title: 'Bengaluru Plant 04 hit 100% achievement', detail: 'Output 320 / 320 units · OEE 88.9% · best performer today', icon: Sparkles, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  ]
  const reportTypes = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']
  const plants = [
    { code: 'THN', name: 'Thane Plant 01', health: 87.5, production: 94.5, oee: 84.2, yield: 96.8, cost: 152.4, onTime: 88.0, status: 'GREEN' },
    { code: 'PUN', name: 'Pune Plant 02', health: 82.4, production: 92.6, oee: 81.5, yield: 95.2, cost: 156.8, onTime: 84.5, status: 'YELLOW' },
    { code: 'NAS', name: 'Nashik Plant 03', health: 78.4, production: 90.0, oee: 78.4, yield: 93.8, cost: 162.4, onTime: 80.0, status: 'YELLOW' },
    { code: 'BLR', name: 'Bengaluru Plant 04', health: 92.1, production: 100.0, oee: 88.9, yield: 97.4, cost: 148.2, onTime: 92.0, status: 'GREEN' },
  ]
  const statusColor: Record<string, string> = { GREEN: 'bg-emerald-500', YELLOW: 'bg-amber-500', RED: 'bg-rose-500' }
  const statusBadge: Record<string, string> = { GREEN: 'bg-emerald-100 text-emerald-700', YELLOW: 'bg-amber-100 text-amber-700', RED: 'bg-rose-100 text-rose-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6 text-blue-600" />Executive Manufacturing Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 47 · C-suite view · Factory health · KPIs · Highlights · Reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline"><FileText className="mr-1 h-4 w-4" />Export</Button>
          <Button size="sm"><Sparkles className="mr-1 h-4 w-4" />Generate Brief</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 md:col-span-1 bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground">Factory Health Score</p>
              <p className="text-4xl font-bold text-emerald-600 mt-1">{healthScore}</p>
              <p className="text-[10px] text-muted-foreground">/ 100</p>
            </div>
            <div className="h-16 w-16 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-white">
              <ShieldCheck className="h-7 w-7 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-700">HEALTHY</span>
            <span className="text-[10px] text-muted-foreground">+1.2 vs yesterday</span>
          </div>
        </Card>
        <Card className="p-3 md:col-span-2">
          <p className="text-[11px] text-muted-foreground mb-2">Key Performance Indicators (8)</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {kpis.map(k => (
              <div key={k.label} className={`p-2 rounded-lg border ${k.bg}`}>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">{k.label}</p>
                  <k.icon className={`h-3.5 w-3.5 ${k.color}`} />
                </div>
                <p className={`text-base font-bold mt-0.5 ${k.color}`}>{k.value}</p>
                <p className="text-[9px] text-muted-foreground">Target: {k.target}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-500" />Today&apos;s Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {highlights.map(h => (
            <div key={h.title} className={`p-3 border rounded-lg ${h.bg}`}>
              <div className="flex items-start gap-2">
                <h.icon className={`h-5 w-5 flex-shrink-0 ${h.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${h.color} bg-white/60`}>{h.type}</span>
                    <p className="text-xs font-semibold">{h.title}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{h.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Plant Performance Summary</h3>
          <span className="text-[10px] text-muted-foreground">Today · 09:00 – 15:00</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50"><tr className="text-left">
              <th className="px-3 py-2 font-medium">Plant</th>
              <th className="px-3 py-2 font-medium text-center">Health</th>
              <th className="px-3 py-2 font-medium text-center">Production</th>
              <th className="px-3 py-2 font-medium text-center">OEE</th>
              <th className="px-3 py-2 font-medium text-center">Yield</th>
              <th className="px-3 py-2 font-medium text-right">Cost ₹/kg</th>
              <th className="px-3 py-2 font-medium text-center">On-Time</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {plants.map(p => (
                <tr key={p.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-mono text-[11px] text-blue-700">{p.code}</p><p className="text-[10px] text-muted-foreground">{p.name}</p></td>
                  <td className={`px-3 py-2 text-center font-bold ${p.health >= 85 ? 'text-emerald-600' : p.health >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>{p.health}</td>
                  <td className="px-3 py-2 text-center">{p.production}%</td>
                  <td className={`px-3 py-2 text-center ${p.oee >= 85 ? 'text-emerald-600' : p.oee >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>{p.oee}%</td>
                  <td className="px-3 py-2 text-center">{p.yield}%</td>
                  <td className="px-3 py-2 text-right font-medium">₹{p.cost.toLocaleString('en-IN')}</td>
                  <td className="px-3 py-2 text-center">{p.onTime}%</td>
                  <td className="px-3 py-2"><span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-bold ${statusBadge[p.status]}`}><span className={`h-1.5 w-1.5 rounded-full ${statusColor[p.status]}`} />{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1">Report Types:</span>
          {reportTypes.map((r, i) => (
            <span key={r} className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${i === 2 ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-muted text-muted-foreground'}`}>
              <FileText className="inline h-3 w-3 mr-1" />{r}
            </span>
          ))}
          <Button size="sm" variant="outline" className="ml-auto"><DownloadCloud className="mr-1 h-4 w-4" />Download PDF</Button>
        </div>
      </Card>
    </div>
  )
}

// ─── Mfg Business Continuity Dashboard ──────────────────────────────────
function MfgBusinessContinuityModule() {
  const systems = [
    { code: 'MES-CORE', name: 'MES Core', icon: Server, status: 'HEALTHY', uptime: 99.97, rto: 15, rpo: 0 },
    { code: 'API-GW', name: 'API Gateway', icon: Network, status: 'HEALTHY', uptime: 99.99, rto: 5, rpo: 0 },
    { code: 'IOT-GW', name: 'IoT Gateway', icon: Radio, status: 'DEGRADED', uptime: 99.42, rto: 30, rpo: 60 },
    { code: 'DB-PRIMARY', name: 'Database', icon: Database, status: 'HEALTHY', uptime: 99.98, rto: 10, rpo: 0 },
    { code: 'PROD-APP', name: 'Production App', icon: Activity, status: 'HEALTHY', uptime: 99.95, rto: 20, rpo: 0 },
    { code: 'WMS-INT', name: 'Warehouse Int.', icon: Boxes, status: 'HEALTHY', uptime: 99.88, rto: 60, rpo: 300 },
    { code: 'NETWORK', name: 'Network', icon: Globe2, status: 'HEALTHY', uptime: 99.99, rto: 5, rpo: 0 },
    { code: 'POWER', name: 'Power (UPS+DG)', icon: Power, status: 'HEALTHY', uptime: 99.92, rto: 0, rpo: 0 },
    { code: 'BACKUP', name: 'Backup & DR', icon: ShieldCheck, status: 'HEALTHY', uptime: 100.0, rto: 240, rpo: 60 },
  ]
  const incidents = [
    { code: 'INC-2026-0118', time: '14:28', system: 'IoT Gateway', title: '2 sensors offline on LINE-NM-01', severity: 'WARNING', status: 'INVESTIGATING', impact: 'MEDIUM' },
    { code: 'INC-2026-0117', time: '13:51', system: 'IoT Gateway', title: 'MQTT broker 38s disconnect (auto-recovered)', severity: 'INFO', status: 'RESOLVED', impact: 'LOW' },
    { code: 'INC-2026-0116', time: '09:42', system: 'Production App', title: 'Deploy rollback v3.4.2 → v3.4.1 (memory leak)', severity: 'WARNING', status: 'RESOLVED', impact: 'MEDIUM' },
    { code: 'INC-2026-0115', time: 'Yesterday 22:14', system: 'Database', title: 'Replica lag 12s during batch ETL', severity: 'INFO', status: 'RESOLVED', impact: 'LOW' },
  ]
  const checklist = [
    { step: 1, title: 'Detect & declare incident', done: true, owner: 'Auto-monitor', ts: '14:28', desc: 'IoT GW health probe fired; PagerDuty triggered' },
    { step: 2, title: 'Notify on-call + activate war room', done: true, owner: 'PagerDuty', ts: '14:30', desc: 'SMS+push to SRE on-call; MS Teams war-room channel opened' },
    { step: 3, title: 'Engage failover / redundant path', done: true, owner: 'Network Ops', ts: '14:34', desc: 'Stale-value cache engaged; PLC local control active' },
    { step: 4, title: 'Root cause analysis', done: false, owner: 'IoT Eng', ts: '—', desc: 'Pending site visit to inspect sensor junction box' },
    { step: 5, title: 'Restore + post-mortem + runbook update', done: false, owner: 'SRE Lead', ts: '—', desc: 'Scheduled post-resolution review' },
  ]
  const failover = [
    { system: 'MES Core', primary: 'DC-Mumbai-A', secondary: 'DC-Mumbai-B', mode: 'ACTIVE-ACTIVE', state: 'SYNCHRONIZED', lastTest: '2026-06-25' },
    { system: 'Database', primary: 'Primary (RW)', secondary: 'Replica (RO)', mode: 'ACTIVE-PASSIVE', state: 'SYNCHRONIZED', lastTest: '2026-06-25' },
    { system: 'IoT Gateway', primary: 'Broker-A', secondary: 'Broker-B', mode: 'ACTIVE-ACTIVE', state: 'PARTIAL · 2 sensors offline', lastTest: '2026-06-20' },
    { system: 'Production App', primary: 'k8s-prod-blue', secondary: 'k8s-prod-green', mode: 'BLUE-GREEN', state: 'SYNCHRONIZED', lastTest: '2026-06-22' },
  ]
  const statusDot: Record<string, string> = { HEALTHY: 'bg-emerald-500', DEGRADED: 'bg-amber-500', DOWN: 'bg-rose-500' }
  const statusBadge: Record<string, string> = { HEALTHY: 'bg-emerald-100 text-emerald-700', DEGRADED: 'bg-amber-100 text-amber-700', DOWN: 'bg-rose-100 text-rose-700' }
  const sevBadge: Record<string, string> = { CRITICAL: 'bg-rose-100 text-rose-700', WARNING: 'bg-amber-100 text-amber-700', INFO: 'bg-blue-100 text-blue-700' }
  const incBadge: Record<string, string> = { INVESTIGATING: 'bg-amber-100 text-amber-700', RESOLVED: 'bg-emerald-100 text-emerald-700', MITIGATING: 'bg-blue-100 text-blue-700' }
  const impactBadge: Record<string, string> = { HIGH: 'bg-rose-100 text-rose-700', MEDIUM: 'bg-amber-100 text-amber-700', LOW: 'bg-blue-100 text-blue-700' }
  const avgUptime = (systems.reduce((a, s) => a + s.uptime, 0) / systems.length).toFixed(2)
  const completedSteps = checklist.filter(c => c.done).length
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6 text-emerald-600" />Business Continuity Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 47 · DR posture · Failover status · Active incident recovery</p>
        </div>
        <Button size="sm" variant="outline"><RefreshCw className="mr-1 h-4 w-4" />Refresh</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Avg Uptime', value: `${avgUptime}%`, color: 'text-emerald-600', icon: Activity },
          { label: 'Active Incidents', value: 1, color: 'text-amber-600', icon: AlertTriangle },
          { label: 'Avg Resolution', value: '42 min', color: 'text-blue-600', icon: Clock },
          { label: 'Business Impact', value: 'LOW', color: 'text-emerald-600', icon: ShieldCheck },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <div className="flex items-center justify-between">
              <div><p className="text-[11px] text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></div>
              <s.icon className="h-5 w-5 text-muted-foreground/40" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">System Health Grid</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {systems.map((s, i) => (
            <div key={s.code} className={`p-3 ${i % 3 !== 2 ? 'md:border-r' : ''} border-b`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-mono text-[11px] text-blue-700">{s.code}</p>
                    <p className="text-[10px] text-muted-foreground">{s.name}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-bold ${statusBadge[s.status]}`}><span className={`h-1.5 w-1.5 rounded-full ${statusDot[s.status]}`} />{s.status}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                <div className="text-muted-foreground">Uptime:</div><div className="font-semibold">{s.uptime}%</div>
                <div className="text-muted-foreground">RTO:</div><div className="font-semibold">{s.rto} min</div>
                <div className="text-muted-foreground">RPO:</div><div className="font-semibold">{s.rpo === 0 ? '0 (sync)' : `${s.rpo}s`}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Active Incidents Timeline</h3></div>
        <div className="p-4">
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-muted" />
            {incidents.map((inc, i) => (
              <div key={inc.code} className={`relative ${i < incidents.length - 1 ? 'pb-4' : ''}`}>
                <div className={`absolute -left-[18px] top-1 h-3 w-3 rounded-full ${inc.severity === 'CRITICAL' ? 'bg-rose-500' : inc.severity === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'} ring-2 ring-white`} />
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground mt-0.5">{inc.time}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] text-blue-700">{inc.code}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${sevBadge[inc.severity]}`}>{inc.severity}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${incBadge[inc.status]}`}>{inc.status}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${impactBadge[inc.impact]}`}>IMPACT: {inc.impact}</span>
                    </div>
                    <p className="text-xs font-medium mt-1">{inc.title}</p>
                    <p className="text-[10px] text-muted-foreground">{inc.system}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Failover Status</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50"><tr className="text-left">
              <th className="px-3 py-2 font-medium">System</th>
              <th className="px-3 py-2 font-medium">Primary</th>
              <th className="px-3 py-2 font-medium">Secondary</th>
              <th className="px-3 py-2 font-medium">Mode</th>
              <th className="px-3 py-2 font-medium">State</th>
              <th className="px-3 py-2 font-medium text-center">Last Test</th>
            </tr></thead>
            <tbody>
              {failover.map(f => (
                <tr key={f.system} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{f.system}</td>
                  <td className="px-3 py-2 text-[11px] font-mono">{f.primary}</td>
                  <td className="px-3 py-2 text-[11px] font-mono">{f.secondary}</td>
                  <td className="px-3 py-2"><span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">{f.mode}</span></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${f.state === 'SYNCHRONIZED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{f.state}</span></td>
                  <td className="px-3 py-2 text-center text-[10px] font-mono">{f.lastTest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-600" />Recovery Checklist — Step-by-Step</h3>
          <span className="text-[10px] text-muted-foreground">{completedSteps} / {checklist.length} steps complete</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(completedSteps / checklist.length) * 100}%` }} />
        </div>
        <div className="space-y-2">
          {checklist.map(c => (
            <div key={c.step} className={`flex items-start gap-3 p-3 border rounded-lg ${c.done ? 'bg-emerald-50/50 border-emerald-200' : 'bg-card'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${c.done ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                {c.done ? <CheckCircle2 className="h-4 w-4" /> : c.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-semibold ${c.done ? 'line-through text-muted-foreground' : ''}`}>{c.title}</p>
                  {!c.done && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">PENDING</span>}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{c.desc}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />Owner: {c.owner}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.ts}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

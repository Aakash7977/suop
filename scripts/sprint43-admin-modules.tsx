// ═══════════════════════════════════════════════════════════════════════════════
// SPRINT 43 — MACHINE INTEGRATION, EQUIPMENT MONITORING & INDUSTRIAL IoT
// Admin modules: Machine Master, Machine Dashboard, IoT Gateway, PLC Monitor,
// Sensor Dashboard, Machine Timeline, Equipment Health, Production Counters
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Machine Dashboard ──────────────────────────────────────────────────
function MachineDashboardModule() {
  const kpis = {
    totalMachines: 24, running: 18, idle: 2, setup: 1, cleaning: 1,
    maintenance: 1, fault: 1, offline: 0,
    avgAvailability: 94.2, avgPerformance: 87.5, avgOEE: 82.3,
    totalDowntimeMin: 142, totalOutput: 1248, totalRejects: 12,
    energyKwh: 1840, connectedDevices: 22, gatewaysOnline: 3,
  }
  const liveMachines = [
    { code: 'MIX-01', name: 'Industrial Mixer 01', category: 'MIXER', status: 'RUNNING', line: 'LINE-KK-01', wc: 'WC-KK-01', batch: 'KAJ-THN-20260709-000145', operator: 'Rajesh Kumar', speed: 95, target: 100, output: 94, reject: 1, temp: 28, power: 12.5, connected: true },
    { code: 'COOK-01', name: 'Cooking Kettle 01', category: 'OVEN', status: 'RUNNING', line: 'LINE-KK-01', wc: 'WC-KK-03', batch: 'KAJ-THN-20260709-000145', operator: 'Rajesh Kumar', speed: 110, target: 110, output: 47, reject: 0, temp: 110, power: 18.2, connected: true },
    { code: 'FRY-01', name: 'Continuous Fryer 01', category: 'FRYER', status: 'FAULT', line: 'LINE-NM-01', wc: 'WC-NM-04', batch: null, operator: null, speed: 0, target: 150, output: 0, reject: 0, temp: 25, power: 0, connected: true, faultCode: 'HYDRAULIC_PRESSURE_LOSS' },
    { code: 'PACK-03', name: 'Packaging Machine 03', category: 'PACKAGING', status: 'SETUP', line: 'LINE-KK-01', wc: 'WC-KK-08', batch: null, operator: 'Vijay Patel', speed: 0, target: 60, output: 0, reject: 0, temp: 22, power: 2.1, connected: true },
    { code: 'GRIND-01', name: 'Wet Grinder 01', category: 'MIXER', status: 'RUNNING', line: 'LINE-IB-01', wc: 'WC-IB-02', batch: 'SHW-THN-20260709-000047', operator: 'Anil Reddy', speed: 80, target: 80, output: 45, reject: 0, temp: 32, power: 7.8, connected: true },
    { code: 'COOL-01', name: 'Cooling Tunnel 01', category: 'COOLING_TUNNEL', status: 'CLEANING', line: 'LINE-KK-01', wc: 'WC-KK-05', batch: null, operator: 'Suresh Mehta', speed: 0, target: 0, output: 0, reject: 0, temp: 8, power: 1.2, connected: true },
    { code: 'CONV-01', name: 'Conveyor Belt 01', category: 'CONVEYOR', status: 'IDLE', line: 'LINE-KK-01', wc: 'WC-KK-09', batch: null, operator: null, speed: 0, target: 0, output: 0, reject: 0, temp: 25, power: 0.5, connected: true },
  ]
  const alarms = [
    { code: 'SA-000142', machine: 'FRY-01', type: 'THRESHOLD_BREACH', severity: 'CRITICAL', value: 'Hydraulic Pressure 0 bar', threshold: '>50 bar', raisedAt: '14:25', status: 'ACTIVE', ackBy: null },
    { code: 'SA-000141', machine: 'COOK-01', type: 'HIGH_TEMPERATURE', severity: 'WARNING', value: 'Cooking temp 112°C', threshold: '≤112°C', raisedAt: '14:10', status: 'ACKNOWLEDGED', ackBy: 'Rajesh Kumar' },
    { code: 'SA-000140', machine: 'MIX-01', type: 'VIBRATION_HIGH', severity: 'WARNING', value: 'Vibration 4.8 mm/s', threshold: '<4.5 mm/s', raisedAt: '13:55', status: 'RESOLVED', ackBy: 'Suresh Mehta' },
  ]
  const statusColors: Record<string, string> = { RUNNING: 'bg-emerald-100 text-emerald-700', IDLE: 'bg-blue-100 text-blue-700', SETUP: 'bg-purple-100 text-purple-700', CLEANING: 'bg-cyan-100 text-cyan-700', MAINTENANCE: 'bg-amber-100 text-amber-700', FAULT: 'bg-rose-100 text-rose-700', OFFLINE: 'bg-slate-100 text-slate-700', RETIRED: 'bg-zinc-200 text-zinc-700' }
  const severityColors: Record<string, string> = { INFO: 'bg-blue-100 text-blue-700', WARNING: 'bg-amber-100 text-amber-700', CRITICAL: 'bg-rose-100 text-rose-700', EMERGENCY: 'bg-red-100 text-red-700' }
  const alertStatusColors: Record<string, string> = { ACTIVE: 'bg-rose-100 text-rose-700', ACKNOWLEDGED: 'bg-amber-100 text-amber-700', RESOLVED: 'bg-emerald-100 text-emerald-700', DISMISSED: 'bg-slate-100 text-slate-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Server className="h-6 w-6 text-amber-600" />Machine Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 43 · Industry 4.0 · Real-time machine monitoring · 13 equipment categories · 6 PLC types</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />Register Machine</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total Machines', value: kpis.totalMachines, color: 'text-blue-600', icon: Server },
          { label: 'Running', value: kpis.running, color: 'text-emerald-600', icon: Activity },
          { label: 'Fault', value: kpis.fault, color: 'text-rose-600', icon: AlertTriangle },
          { label: 'Avg Availability', value: `${kpis.avgAvailability}%`, color: 'text-emerald-600', icon: Gauge },
          { label: 'Avg OEE', value: `${kpis.avgOEE}%`, color: 'text-purple-600', icon: TrendingUp },
          { label: 'Connected Devices', value: kpis.connectedDevices, color: 'text-cyan-600', icon: Wifi },
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
          { label: 'Total Output Today', value: `${kpis.totalOutput} pcs`, color: 'text-emerald-600' },
          { label: 'Rejects', value: kpis.totalRejects, color: 'text-rose-600' },
          { label: 'Downtime', value: `${kpis.totalDowntimeMin}m`, color: 'text-amber-600' },
          { label: 'Energy', value: `${kpis.energyKwh} kWh`, color: 'text-orange-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Industrial Architecture — Machine → PLC → Gateway → MES</p>
            <div className="flex items-center gap-1 text-[11px] mt-2 overflow-x-auto">
              {['Machine', 'PLC', 'Industrial Gateway', 'SUOP IoT Gateway', 'MES', 'Analytics', 'Mission Control'].map((step, i, a) => (
                <div key={i} className="flex items-center gap-1 flex-shrink-0">
                  <span className="px-2 py-0.5 bg-white border rounded text-[10px] font-medium">{step}</span>
                  {i < a.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-amber-600 flex-shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">13 equipment types supported: Mixers, Boilers, Roasters, Fryers, Cooling Tunnels, Packaging, Label Printers, Metal Detectors, Check Weighers, Conveyors, Compressors, Industrial Ovens, Cold Rooms</p>
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Live Machines</h3>
          <Badge variant="outline" className="text-emerald-700 border-emerald-300"><Activity className="mr-1 h-3 w-3" />Real-time</Badge>
        </div>
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {liveMachines.map(m => (
            <div key={m.code} className={`p-3 rounded-lg border-2 ${m.status === 'FAULT' ? 'border-rose-400 bg-rose-50/30' : m.status === 'RUNNING' ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-mono text-[11px] font-bold text-blue-700">{m.code}</p>
                  <p className="text-xs font-medium">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground">{m.category.replace(/_/g, ' ')} · {m.line} · {m.wc}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[m.status]}`}>{m.status}</span>
              </div>
              {m.batch && <p className="text-[10px] text-blue-700 font-mono mb-1">Batch: {m.batch}</p>}
              {m.operator && <p className="text-[10px] text-muted-foreground mb-1">Op: {m.operator}</p>}
              {m.faultCode && <p className="text-[10px] text-rose-700 font-bold mb-1">⚠ {m.faultCode.replace(/_/g, ' ')}</p>}
              <div className="grid grid-cols-2 gap-1 text-[10px] mt-2 pt-2 border-t border-slate-200">
                <div>Speed: <span className="font-bold">{m.speed}/{m.target}</span></div>
                <div>Output: <span className="font-bold text-emerald-600">{m.output}</span></div>
                <div>Reject: <span className="font-bold text-rose-600">{m.reject}</span></div>
                <div>Temp: <span className="font-bold">{m.temp}°C</span></div>
                <div>Power: <span className="font-bold">{m.power} KW</span></div>
                <div>{m.connected ? <span className="text-emerald-600">🟢 Connected</span> : <span className="text-rose-600">🔴 Offline</span>}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Alarm Panel</h3>
          <Badge variant="outline" className="text-rose-700 border-rose-300">{alarms.filter(a => a.status === 'ACTIVE').length} Active</Badge>
        </div>
        <div className="p-3 space-y-2">
          {alarms.map(a => (
            <div key={a.code} className={`p-3 rounded-lg border-l-4 ${a.severity === 'CRITICAL' ? 'border-rose-500 bg-rose-50/30' : 'border-amber-400 bg-amber-50/30'}`}>
              <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-blue-700">{a.code}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${severityColors[a.severity]}`}>{a.severity}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${alertStatusColors[a.status]}`}>{a.status}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{a.raisedAt}</span>
              </div>
              <p className="text-xs font-medium"><span className="text-blue-700 font-mono">{a.machine}</span> · {a.type.replace(/_/g, ' ')} · {a.value} (threshold: {a.threshold})</p>
              {a.ackBy && <p className="text-[10px] text-muted-foreground mt-1">Acknowledged by: {a.ackBy}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Machine Master ──────────────────────────────────────────────────────
function MachineMasterModule() {
  const machines = [
    { code: 'MIX-01', name: 'Industrial Mixer 01', category: 'MIXER', manufacturer: 'Hindustan Mixer', model: 'HM-500', serial: 'SN-MIX-001', firmware: 'v2.3.1', plant: 'THN', line: 'LINE-KK-01', wc: 'WC-KK-01', plc: 'SIEMENS', protocol: 'OPC_UA', ip: '192.168.1.101', port: 4840, installed: '2024-03-15', warranty: '2027-03-15', status: 'RUNNING', connected: true, opHours: 4280.5, cycles: 12480, lastMaint: '2026-06-15', nextMaint: '2026-09-15' },
    { code: 'COOK-01', name: 'Cooking Kettle 01', category: 'OVEN', manufacturer: 'Buhler', model: 'BK-300', serial: 'SN-COOK-001', firmware: 'v3.1.0', plant: 'THN', line: 'LINE-KK-01', wc: 'WC-KK-03', plc: 'ALLEN_BRADLEY', protocol: 'ETHERNET_IP', ip: '192.168.1.102', port: 44818, installed: '2024-02-20', warranty: '2027-02-20', status: 'RUNNING', connected: true, opHours: 5120.0, cycles: 8920, nextMaint: '2026-08-20' },
    { code: 'FRY-01', name: 'Continuous Fryer 01', category: 'FRYER', manufacturer: 'Heatmaster', model: 'HM-CF-200', serial: 'SN-FRY-001', firmware: 'v1.8.2', plant: 'THN', line: 'LINE-NM-01', wc: 'WC-NM-04', plc: 'MITSUBISHI', protocol: 'MODBUS_TCP', ip: '192.168.1.103', port: 502, installed: '2023-11-10', warranty: '2026-11-10', status: 'FAULT', connected: true, opHours: 6840.5, cycles: 15620, lastMaint: '2026-05-10', nextMaint: '2026-07-15' },
    { code: 'PACK-03', name: 'Packaging Machine 03', category: 'PACKAGING', manufacturer: 'Bosch', model: 'BPM-120', serial: 'SN-PACK-003', firmware: 'v4.2.0', plant: 'THN', line: 'LINE-KK-01', wc: 'WC-KK-08', plc: 'SCHNEIDER', protocol: 'OPC_UA', ip: '192.168.1.104', port: 4840, installed: '2024-05-05', warranty: '2027-05-05', status: 'SETUP', connected: true, opHours: 2840.0, cycles: 6240, nextMaint: '2026-10-05' },
    { code: 'GRIND-01', name: 'Wet Grinder 01', category: 'MIXER', manufacturer: 'Elgi Ultra', model: 'UG-200', serial: 'SN-GRIND-001', firmware: 'v2.0.0', plant: 'THN', line: 'LINE-IB-01', wc: 'WC-IB-02', plc: 'OMRON', protocol: 'MODBUS_RTU', ip: '192.168.1.105', port: 502, installed: '2024-04-12', warranty: '2027-04-12', status: 'RUNNING', connected: true, opHours: 3120.5, cycles: 4280, nextMaint: '2026-09-12' },
    { code: 'COOL-01', name: 'Cooling Tunnel 01', category: 'COOLING_TUNNEL', manufacturer: 'Buhler', model: 'BCT-500', serial: 'SN-COOL-001', firmware: 'v1.5.0', plant: 'THN', line: 'LINE-KK-01', wc: 'WC-KK-05', plc: 'SIEMENS', protocol: 'PROFINET', ip: '192.168.1.106', port: 502, installed: '2024-06-20', warranty: '2027-06-20', status: 'CLEANING', connected: true, opHours: 1980.5, cycles: 2840, nextMaint: '2026-12-20' },
  ]
  const statusColors: Record<string, string> = { RUNNING: 'bg-emerald-100 text-emerald-700', IDLE: 'bg-blue-100 text-blue-700', SETUP: 'bg-purple-100 text-purple-700', CLEANING: 'bg-cyan-100 text-cyan-700', MAINTENANCE: 'bg-amber-100 text-amber-700', FAULT: 'bg-rose-100 text-rose-700', OFFLINE: 'bg-slate-100 text-slate-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Server className="h-6 w-6 text-blue-600" />Machine Master</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 43 · Epic 1 · Industrial equipment registry · PLC integration info · Maintenance schedule</p>
        </div>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" />Register Machine</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Machines', value: machines.length, color: 'text-blue-600' },
          { label: 'Connected', value: machines.filter(m => m.connected).length, color: 'text-emerald-600' },
          { label: 'In Fault', value: machines.filter(m => m.status === 'FAULT').length, color: 'text-rose-600' },
          { label: 'Maintenance Due', value: machines.filter(m => m.nextMaint === '2026-07-15').length, color: 'text-amber-600' },
          { label: 'Avg Op Hours', value: '4,030h', color: 'text-purple-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Code / Name</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Manufacturer / Model</th>
                <th className="px-3 py-2 font-medium">Location</th>
                <th className="px-3 py-2 font-medium">PLC / Protocol</th>
                <th className="px-3 py-2 font-medium">Network</th>
                <th className="px-3 py-2 font-medium text-right">Op Hours</th>
                <th className="px-3 py-2 font-medium text-right">Cycles</th>
                <th className="px-3 py-2 font-medium">Next Maint</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {machines.map(m => (
                <tr key={m.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-mono text-[11px] font-bold text-blue-700">{m.code}</p><p className="text-[10px] text-muted-foreground">{m.name}</p><p className="text-[9px] text-muted-foreground">FW: {m.firmware}</p></td>
                  <td className="px-3 py-2"><span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{m.category.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2"><p className="text-[11px]">{m.manufacturer}</p><p className="text-[10px] text-muted-foreground">{m.model}</p><p className="text-[9px] text-muted-foreground font-mono">SN: {m.serial}</p></td>
                  <td className="px-3 py-2 text-[11px]"><p>{m.plant}</p><p className="text-muted-foreground">{m.line}</p><p className="text-muted-foreground">{m.wc}</p></td>
                  <td className="px-3 py-2"><p className="text-[11px] font-medium">{m.plc}</p><p className="text-[10px] text-muted-foreground">{m.protocol.replace(/_/g, ' ')}</p></td>
                  <td className="px-3 py-2 text-[10px] font-mono">{m.ip}:{m.port}</td>
                  <td className="px-3 py-2 text-right font-medium">{m.opHours.toLocaleString()}h</td>
                  <td className="px-3 py-2 text-right">{m.cycles.toLocaleString()}</td>
                  <td className="px-3 py-2 text-[11px]">{m.nextMaint}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[m.status]}`}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4 bg-blue-50/50 border-blue-200">
        <h3 className="font-semibold text-sm mb-3">Supported Equipment & Protocols</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <p className="font-semibold text-blue-700 mb-1">13 Equipment Categories</p>
            <p className="text-muted-foreground">Mixers · Steam Boilers · Roasters · Fryers · Cooling Tunnels · Packaging Machines · Label Printers · Metal Detectors · Check Weighers · Conveyors · Compressors · Industrial Ovens · Cold Rooms</p>
          </div>
          <div>
            <p className="font-semibold text-blue-700 mb-1">6 PLC Types + 6 Protocols</p>
            <p className="text-muted-foreground">PLCs: Siemens · Allen-Bradley · Mitsubishi · Schneider · Omron · Delta</p>
            <p className="text-muted-foreground mt-1">Protocols: OPC-UA · Modbus TCP · Modbus RTU · EtherNet/IP · Profinet · MQTT (future)</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── IoT Gateway Console ────────────────────────────────────────────────
function IoTGatewayModule() {
  const gateways = [
    { code: 'GW-THN-01', name: 'Thane Plant Gateway 01', plant: 'THN', ip: '192.168.1.10', mac: '00:1B:44:11:3A:B7', firmware: 'v2.4.1', max: 50, connected: 18, status: 'ONLINE', heartbeat: '14:30:12', epm: 247, avgMs: 124, cpu: 32.4, memory: 58.2, disk: 42.1, temp: 38.5, uptime: 284800, latency: 12 },
    { code: 'GW-THN-02', name: 'Thane Plant Gateway 02', plant: 'THN', ip: '192.168.1.11', mac: '00:1B:44:11:3A:B8', firmware: 'v2.4.1', max: 50, connected: 4, status: 'ONLINE', heartbeat: '14:30:08', epm: 84, avgMs: 98, cpu: 18.6, memory: 42.8, disk: 38.4, temp: 35.2, uptime: 284800, latency: 8 },
    { code: 'GW-THN-03', name: 'Thane Plant Gateway 03', plant: 'THN', ip: '192.168.1.12', mac: '00:1B:44:11:3A:B9', firmware: 'v2.3.5', max: 50, connected: 0, status: 'OFFLINE', heartbeat: '12:45:30', epm: 0, avgMs: 0, cpu: 0, memory: 0, disk: 0, temp: 0, uptime: 0, latency: 0 },
  ]
  const connections = [
    { code: 'CONN-001', gateway: 'GW-THN-01', machine: 'MIX-01', protocol: 'OPC_UA', endpoint: 'opc.tcp://192.168.1.101:4840', status: 'CONNECTED', connectedAt: '06:00:00', lastData: '14:30:11', messages: 12480, failed: 0 },
    { code: 'CONN-002', gateway: 'GW-THN-01', machine: 'COOK-01', protocol: 'ETHERNET_IP', endpoint: '192.168.1.102:44818', status: 'CONNECTED', connectedAt: '06:00:00', lastData: '14:30:10', messages: 8920, failed: 2 },
    { code: 'CONN-003', gateway: 'GW-THN-01', machine: 'FRY-01', protocol: 'MODBUS_TCP', endpoint: '192.168.1.103:502', status: 'CONNECTED', connectedAt: '06:00:00', lastData: '14:25:00', messages: 15620, failed: 8 },
    { code: 'CONN-004', gateway: 'GW-THN-01', machine: 'PACK-03', protocol: 'OPC_UA', endpoint: 'opc.tcp://192.168.1.104:4840', status: 'CONNECTED', connectedAt: '08:00:00', lastData: '14:30:09', messages: 6240, failed: 0 },
    { code: 'CONN-005', gateway: 'GW-THN-02', machine: 'GRIND-01', protocol: 'MODBUS_RTU', endpoint: '192.168.1.105:502', status: 'CONNECTED', connectedAt: '05:00:00', lastData: '14:30:05', messages: 4280, failed: 0 },
    { code: 'CONN-006', gateway: 'GW-THN-02', machine: 'COOL-01', protocol: 'PROFINET', endpoint: '192.168.1.106', status: 'CONNECTED', connectedAt: '06:00:00', lastData: '14:30:08', messages: 2840, failed: 0 },
  ]
  const statusColors: Record<string, string> = { ONLINE: 'bg-emerald-100 text-emerald-700', OFFLINE: 'bg-rose-100 text-rose-700', DEGRADED: 'bg-amber-100 text-amber-700', CONNECTED: 'bg-emerald-100 text-emerald-700', DISCONNECTED: 'bg-rose-100 text-rose-700', ERROR: 'bg-rose-100 text-rose-700' }
  const protocolColors: Record<string, string> = { OPC_UA: 'bg-blue-100 text-blue-700', MODBUS_TCP: 'bg-emerald-100 text-emerald-700', MODBUS_RTU: 'bg-amber-100 text-amber-700', ETHERNET_IP: 'bg-purple-100 text-purple-700', PROFINET: 'bg-cyan-100 text-cyan-700', MQTT: 'bg-pink-100 text-pink-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Network className="h-6 w-6 text-cyan-600" />IoT Gateway Console</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 43 · Epic 3 · Industrial IoT Gateway · Multi-protocol · Heartbeat monitoring</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Gateways', value: 3, color: 'text-blue-600' },
          { label: 'Online', value: 2, color: 'text-emerald-600' },
          { label: 'Active Connections', value: 22, color: 'text-emerald-600' },
          { label: 'Events / Min', value: 331, color: 'text-cyan-600' },
          { label: 'Success Rate', value: '99.98%', color: 'text-emerald-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">IoT Gateways</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Gateway</th>
                <th className="px-3 py-2 font-medium">Network</th>
                <th className="px-3 py-2 font-medium text-center">Capacity</th>
                <th className="px-3 py-2 font-medium text-center">CPU/Mem/Disk</th>
                <th className="px-3 py-2 font-medium text-center">Temp</th>
                <th className="px-3 py-2 font-medium text-center">Events/Min</th>
                <th className="px-3 py-2 font-medium text-center">Avg Proc</th>
                <th className="px-3 py-2 font-medium text-center">Latency</th>
                <th className="px-3 py-2 font-medium">Last Heartbeat</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {gateways.map(g => (
                <tr key={g.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2"><p className="font-mono text-[11px] font-bold text-blue-700">{g.code}</p><p className="text-[10px] text-muted-foreground">{g.name}</p><p className="text-[9px] text-muted-foreground">FW: {g.firmware}</p></td>
                  <td className="px-3 py-2 text-[10px] font-mono"><p>{g.ip}</p><p className="text-muted-foreground">{g.mac}</p></td>
                  <td className="px-3 py-2 text-center"><p className="font-bold">{g.connected}/{g.max}</p><div className="h-1 bg-muted rounded-full mt-1 overflow-hidden w-16 mx-auto"><div className={`h-full ${g.connected / g.max > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${(g.connected / g.max) * 100}%` }} /></div></td>
                  <td className="px-3 py-2 text-center text-[10px]"><span className={g.cpu > 80 ? 'text-rose-600' : g.cpu > 60 ? 'text-amber-600' : 'text-emerald-600'}>{g.cpu}%</span> / <span className={g.memory > 80 ? 'text-rose-600' : g.memory > 60 ? 'text-amber-600' : 'text-emerald-600'}>{g.memory}%</span> / <span className={g.disk > 80 ? 'text-rose-600' : g.disk > 60 ? 'text-amber-600' : 'text-emerald-600'}>{g.disk}%</span></td>
                  <td className={`px-3 py-2 text-center font-medium ${g.temp > 50 ? 'text-rose-600' : g.temp > 40 ? 'text-amber-600' : 'text-emerald-600'}`}>{g.temp}°C</td>
                  <td className="px-3 py-2 text-center font-medium">{g.epm}</td>
                  <td className="px-3 py-2 text-center">{g.avgMs}ms</td>
                  <td className="px-3 py-2 text-center">{g.latency}ms</td>
                  <td className="px-3 py-2 text-[10px]">{g.heartbeat}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[g.status]}`}>{g.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Active Connections</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Conn Code</th>
                <th className="px-3 py-2 font-medium">Gateway</th>
                <th className="px-3 py-2 font-medium">Machine</th>
                <th className="px-3 py-2 font-medium">Protocol</th>
                <th className="px-3 py-2 font-medium">Endpoint</th>
                <th className="px-3 py-2 font-medium">Connected At</th>
                <th className="px-3 py-2 font-medium">Last Data</th>
                <th className="px-3 py-2 font-medium text-right">Messages</th>
                <th className="px-3 py-2 font-medium text-right">Failed</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {connections.map(c => (
                <tr key={c.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{c.code}</td>
                  <td className="px-3 py-2 font-mono text-[10px] text-blue-700">{c.gateway}</td>
                  <td className="px-3 py-2 font-mono text-[11px] font-medium text-blue-700">{c.machine}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${protocolColors[c.protocol]}`}>{c.protocol.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 text-[10px] font-mono">{c.endpoint}</td>
                  <td className="px-3 py-2 text-[10px]">{c.connectedAt}</td>
                  <td className="px-3 py-2 text-[10px]">{c.lastData}</td>
                  <td className="px-3 py-2 text-right font-medium">{c.messages.toLocaleString()}</td>
                  <td className={`px-3 py-2 text-right font-medium ${c.failed > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{c.failed}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[c.status]}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4 bg-cyan-50/50 border-cyan-200">
        <div className="flex items-start gap-3">
          <Network className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">IoT Gateway Responsibilities</p>
            <p className="text-xs text-muted-foreground mt-1">Receive machine data from PLCs · Normalize data formats · Validate readings · Store events · Forward to MES · Handle automatic reconnect · Heartbeat monitoring (CPU/Memory/Disk/Temperature) · Failover &lt;30 seconds target</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── PLC Monitor ────────────────────────────────────────────────────────
function PLCMonitorModule() {
  const plcs = [
    { machine: 'MIX-01', plc: 'SIEMENS', model: 'S7-1200', protocol: 'OPC_UA', endpoint: 'opc.tcp://192.168.1.101:4840', ip: '192.168.1.101', port: 4840, status: 'CONNECTED', tags: 48, readRate: '500ms', lastSync: '14:30:11', dataPoints: 12480 },
    { machine: 'COOK-01', plc: 'ALLEN_BRADLEY', model: 'CompactLogix 5380', protocol: 'ETHERNET_IP', endpoint: '192.168.1.102:44818', ip: '192.168.1.102', port: 44818, status: 'CONNECTED', tags: 64, readRate: '250ms', lastSync: '14:30:10', dataPoints: 8920 },
    { machine: 'FRY-01', plc: 'MITSUBISHI', model: 'FX5U', protocol: 'MODBUS_TCP', endpoint: '192.168.1.103:502', ip: '192.168.1.103', port: 502, status: 'CONNECTED', tags: 32, readRate: '1000ms', lastSync: '14:25:00', dataPoints: 15620 },
    { machine: 'PACK-03', plc: 'SCHNEIDER', model: 'M221', protocol: 'OPC_UA', endpoint: 'opc.tcp://192.168.1.104:4840', ip: '192.168.1.104', port: 4840, status: 'CONNECTED', tags: 24, readRate: '500ms', lastSync: '14:30:09', dataPoints: 6240 },
    { machine: 'GRIND-01', plc: 'OMRON', model: 'CP1H', protocol: 'MODBUS_RTU', endpoint: '192.168.1.105:502', ip: '192.168.1.105', port: 502, status: 'CONNECTED', tags: 16, readRate: '1000ms', lastSync: '14:30:05', dataPoints: 4280 },
    { machine: 'COOL-01', plc: 'SIEMENS', model: 'S7-1500', protocol: 'PROFINET', endpoint: '192.168.1.106', ip: '192.168.1.106', port: 502, status: 'CONNECTED', tags: 36, readRate: '1000ms', lastSync: '14:30:08', dataPoints: 2840 },
  ]
  const statusColors: Record<string, string> = { CONNECTED: 'bg-emerald-100 text-emerald-700', DISCONNECTED: 'bg-rose-100 text-rose-700', AUTHENTICATING: 'bg-amber-100 text-amber-700' }
  const plcColors: Record<string, string> = { SIEMENS: 'bg-emerald-100 text-emerald-700', ALLEN_BRADLEY: 'bg-red-100 text-red-700', MITSUBISHI: 'bg-rose-100 text-rose-700', SCHNEIDER: 'bg-emerald-100 text-emerald-700', OMRON: 'bg-blue-100 text-blue-700', DELTA: 'bg-cyan-100 text-cyan-700' }
  const protocolColors: Record<string, string> = { OPC_UA: 'bg-blue-100 text-blue-700', MODBUS_TCP: 'bg-emerald-100 text-emerald-700', MODBUS_RTU: 'bg-amber-100 text-amber-700', ETHERNET_IP: 'bg-purple-100 text-purple-700', PROFINET: 'bg-cyan-100 text-cyan-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Server className="h-6 w-6 text-purple-600" />PLC Monitor</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 43 · Epic 2 · PLC Connectivity Framework · 6 PLC types · 6 communication protocols</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Connected PLCs', value: 6, color: 'text-emerald-600' },
          { label: 'Total Tags', value: 220, color: 'text-blue-600' },
          { label: 'Data Points Today', value: '50,380', color: 'text-cyan-600' },
          { label: 'Avg Read Rate', value: '500ms', color: 'text-purple-600' },
          { label: 'Failures', value: 10, color: 'text-rose-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Machine</th>
                <th className="px-3 py-2 font-medium">PLC Type / Model</th>
                <th className="px-3 py-2 font-medium">Protocol</th>
                <th className="px-3 py-2 font-medium">Endpoint</th>
                <th className="px-3 py-2 font-medium text-center">Tags</th>
                <th className="px-3 py-2 font-medium text-center">Read Rate</th>
                <th className="px-3 py-2 font-medium text-right">Data Points</th>
                <th className="px-3 py-2 font-medium">Last Sync</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {plcs.map(p => (
                <tr key={p.machine} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] font-bold text-blue-700">{p.machine}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${plcColors[p.plc]}`}>{p.plc.replace(/_/g, ' ')}</span><p className="text-[10px] text-muted-foreground mt-1">{p.model}</p></td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${protocolColors[p.protocol]}`}>{p.protocol.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 text-[10px] font-mono">{p.endpoint}</td>
                  <td className="px-3 py-2 text-center font-medium">{p.tags}</td>
                  <td className="px-3 py-2 text-center">{p.readRate}</td>
                  <td className="px-3 py-2 text-right font-medium">{p.dataPoints.toLocaleString()}</td>
                  <td className="px-3 py-2 text-[10px]">{p.lastSync}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${statusColors[p.status]}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">6 Supported PLC Types</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { plc: 'SIEMENS', models: 'S7-1200, S7-1500', protocols: 'OPC-UA, Profinet' },
              { plc: 'ALLEN_BRADLEY', models: 'CompactLogix, ControlLogix', protocols: 'EtherNet/IP' },
              { plc: 'MITSUBISHI', models: 'FX5U, Q-Series', protocols: 'Modbus TCP' },
              { plc: 'SCHNEIDER', models: 'M221, M340', protocols: 'OPC-UA, Modbus' },
              { plc: 'OMRON', models: 'CP1H, CJ2M', protocols: 'Modbus RTU/TCP' },
              { plc: 'DELTA', models: 'DVP, AS Series', protocols: 'Modbus RTU' },
            ].map(p => (
              <div key={p.plc} className="p-2 rounded border bg-muted/20">
                <p className="font-medium">{p.plc.replace(/_/g, ' ')}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{p.models}</p>
                <p className="text-[10px] text-blue-600">{p.protocols}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-3">6 Communication Protocols</h3>
          <div className="space-y-2 text-xs">
            {[
              { protocol: 'OPC_UA', desc: 'Modern standard, built-in security, tag-based addressing' },
              { protocol: 'MODBUS_TCP', desc: 'Industrial standard, simple register-based, Ethernet' },
              { protocol: 'MODBUS_RTU', desc: 'Serial (RS-485), register-based, low speed' },
              { protocol: 'ETHERNET_IP', desc: 'Rockwell/Allen-Bradley native, CIP messaging' },
              { protocol: 'PROFINET', desc: 'Siemens native, real-time Ethernet' },
              { protocol: 'MQTT', desc: 'Future - lightweight publish/subscribe for IoT cloud' },
            ].map(p => (
              <div key={p.protocol} className="flex items-start gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium flex-shrink-0">{p.protocol.replace(/_/g, ' ')}</span>
                <p className="text-[10px] text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── Sensor Dashboard ───────────────────────────────────────────────────
function SensorDashboardModule() {
  const readings = [
    { code: 'SR-00248', machine: 'COOK-01', type: 'TEMPERATURE', name: 'Cooking Chamber Temp', location: 'COOKING_CHAMBER', value: 110, unit: '°C', min: 108, max: 112, alert: false, at: '14:30' },
    { code: 'SR-00247', machine: 'COOK-01', type: 'POWER_CONSUMPTION', name: 'Power Draw', location: 'MAIN', value: 18.2, unit: 'KW', min: 0, max: 25, alert: false, at: '14:30' },
    { code: 'SR-00246', machine: 'FRY-01', type: 'PRESSURE', name: 'Hydraulic Pressure', location: 'PUMP', value: 0, unit: 'BAR', min: 50, max: 200, alert: true, level: 'CRITICAL', at: '14:25' },
    { code: 'SR-00245', machine: 'MIX-01', type: 'VIBRATION', name: 'Motor Vibration', location: 'MOTOR', value: 4.8, unit: 'MM/S', min: 0, max: 4.5, alert: true, level: 'WARNING', at: '13:55' },
    { code: 'SR-00244', machine: 'MIX-01', type: 'TEMPERATURE', name: 'Bearing Temp', location: 'BEARING', value: 42, unit: '°C', min: 0, max: 60, alert: false, at: '14:30' },
    { code: 'SR-00243', machine: 'COLD-01', type: 'TEMPERATURE', name: 'Cold Room Temp', location: 'COLD_ROOM', value: 4, unit: '°C', min: 2, max: 8, alert: false, at: '14:30' },
    { code: 'SR-00242', machine: 'COLD-01', type: 'HUMIDITY', name: 'Cold Room Humidity', location: 'COLD_ROOM', value: 65, unit: '%', min: 50, max: 70, alert: false, at: '14:30' },
    { code: 'SR-00241', machine: 'GRIND-01', type: 'RPM', name: 'Drum RPM', location: 'DRUM', value: 80, unit: 'RPM', min: 70, max: 90, alert: false, at: '14:30' },
  ]
  const sensorIcons: Record<string, string> = { TEMPERATURE: '🌡️', HUMIDITY: '💧', PRESSURE: '🔧', WEIGHT: '⚖️', VIBRATION: '📳', POWER_CONSUMPTION: '⚡', CURRENT: '🔌', VOLTAGE: '🔋', RPM: '🔄' }
  const sensorColors: Record<string, string> = { TEMPERATURE: 'bg-rose-100 text-rose-700', HUMIDITY: 'bg-cyan-100 text-cyan-700', PRESSURE: 'bg-amber-100 text-amber-700', WEIGHT: 'bg-emerald-100 text-emerald-700', VIBRATION: 'bg-purple-100 text-purple-700', POWER_CONSUMPTION: 'bg-orange-100 text-orange-700', CURRENT: 'bg-blue-100 text-blue-700', VOLTAGE: 'bg-yellow-100 text-yellow-700', RPM: 'bg-pink-100 text-pink-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6 text-rose-600" />Sensor Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 43 · Epic 6 · 9 sensor types · Real-time monitoring · Threshold alerts</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Readings', value: '18,420', color: 'text-blue-600' },
          { label: 'Alert Readings', value: 24, color: 'text-rose-600' },
          { label: 'Active Alerts', value: 2, color: 'text-rose-700' },
          { label: 'Critical Alerts', value: 1, color: 'text-red-700' },
          { label: 'Resolved Today', value: 21, color: 'text-emerald-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Live Sensor Readings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {readings.map(r => (
            <div key={r.code} className={`p-3 rounded-lg border-2 ${r.alert ? (r.level === 'CRITICAL' ? 'border-rose-400 bg-rose-50/50' : 'border-amber-400 bg-amber-50/50') : 'border-slate-200 bg-slate-50/30'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">{sensorIcons[r.type]}</span>
                {r.alert && <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${r.level === 'CRITICAL' ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'}`}>{r.level}</span>}
              </div>
              <p className="text-[10px] font-mono text-blue-700">{r.machine}</p>
              <p className="text-xs font-medium">{r.name}</p>
              <p className="text-[10px] text-muted-foreground">{r.location.replace(/_/g, ' ')}</p>
              <p className={`text-2xl font-bold mt-1 ${r.alert ? 'text-rose-600' : 'text-emerald-600'}`}>{r.value} <span className="text-xs font-normal text-muted-foreground">{r.unit}</span></p>
              <p className="text-[10px] text-muted-foreground mt-1">Range: {r.min} - {r.max} {r.unit}</p>
              <p className="text-[10px] text-muted-foreground">{r.at}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">9 Sensor Types Supported</h3>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2 text-xs">
          {[
            { type: 'TEMPERATURE', unit: '°C' }, { type: 'HUMIDITY', unit: '%' }, { type: 'PRESSURE', unit: 'BAR' },
            { type: 'WEIGHT', unit: 'KG' }, { type: 'VIBRATION', unit: 'MM/S' }, { type: 'POWER_CONSUMPTION', unit: 'KW' },
            { type: 'CURRENT', unit: 'A' }, { type: 'VOLTAGE', unit: 'V' }, { type: 'RPM', unit: 'RPM' },
          ].map(s => (
            <div key={s.type} className="p-2 rounded border bg-muted/20 text-center">
              <p className="text-lg">{sensorIcons[s.type]}</p>
              <p className="text-[10px] font-medium mt-1">{s.type.replace(/_/g, ' ')}</p>
              <p className="text-[9px] text-muted-foreground">{s.unit}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Machine Timeline (Runtime Events) ──────────────────────────────────
function MachineTimelineModule() {
  const events = [
    { code: 'MRE-00148', machine: 'FRY-01', type: 'FAULT', from: 'RUNNING', to: 'FAULT', reason: 'MACHINE_FAILURE', reasonDesc: 'Hydraulic pressure loss', start: '2026-07-09 14:25', end: null, duration: 35, source: 'PLC', operator: 'Suresh Mehta' },
    { code: 'MRE-00147', machine: 'MIX-01', type: 'CYCLE_COMPLETE', from: 'RUNNING', to: 'RUNNING', reason: null, start: '2026-07-09 14:20', end: '2026-07-09 14:21', duration: 1, source: 'PLC' },
    { code: 'MRE-00146', machine: 'COOK-01', type: 'MACHINE_START', from: 'SETUP', to: 'RUNNING', reason: null, start: '2026-07-09 06:35', end: null, source: 'OPERATOR', operator: 'Rajesh Kumar' },
    { code: 'MRE-00145', machine: 'PACK-03', type: 'SETUP_START', from: 'IDLE', to: 'SETUP', reason: 'CHANGE_OVER', start: '2026-07-09 14:00', end: null, source: 'OPERATOR', operator: 'Vijay Patel' },
    { code: 'MRE-00144', machine: 'COOL-01', type: 'CLEANING_START', from: 'RUNNING', to: 'CLEANING', reason: 'CLEANING', start: '2026-07-09 13:30', end: null, source: 'SYSTEM' },
    { code: 'MRE-00143', machine: 'FRY-01', type: 'DOWNTIME_END', from: 'FAULT', to: 'RUNNING', reason: 'MACHINE_FAILURE', start: '2026-07-09 12:00', end: '2026-07-09 14:25', duration: 145, source: 'PLC' },
  ]
  const typeColors: Record<string, string> = { MACHINE_START: 'bg-emerald-100 text-emerald-700', MACHINE_STOP: 'bg-rose-100 text-rose-700', CYCLE_COMPLETE: 'bg-blue-100 text-blue-700', DOWNTIME_START: 'bg-rose-100 text-rose-700', DOWNTIME_END: 'bg-emerald-100 text-emerald-700', SETUP_START: 'bg-purple-100 text-purple-700', SETUP_END: 'bg-emerald-100 text-emerald-700', CLEANING_START: 'bg-cyan-100 text-cyan-700', CLEANING_END: 'bg-emerald-100 text-emerald-700', FAULT: 'bg-red-100 text-red-700', RECOVERY: 'bg-emerald-100 text-emerald-700' }
  const sourceColors: Record<string, string> = { PLC: 'bg-blue-100 text-blue-700', OPERATOR: 'bg-emerald-100 text-emerald-700', SYSTEM: 'bg-amber-100 text-amber-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Clock className="h-6 w-6 text-purple-600" />Machine Timeline</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 43 · Epic 4 · Machine runtime events · Start/Stop/Cycle/Downtime/Setup/Cleaning/Fault</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: 'Total Events', value: 248, color: 'text-blue-600' },
          { label: 'Starts', value: 18, color: 'text-emerald-600' },
          { label: 'Stops', value: 12, color: 'text-rose-600' },
          { label: 'Cycles', value: 184, color: 'text-blue-600' },
          { label: 'Downtime', value: 8, color: 'text-amber-600' },
          { label: 'Faults', value: 1, color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="font-semibold text-sm mb-3">Recent Runtime Events</h3>
        <div className="space-y-3">
          {events.map(e => (
            <div key={e.code} className="flex items-start gap-3">
              <div className={`px-2 py-1 rounded text-[10px] font-bold flex-shrink-0 ${typeColors[e.type]}`}>{e.type.replace(/_/g, ' ')}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] font-bold text-blue-700">{e.code}</span>
                  <span className="font-mono text-xs text-blue-700 font-medium">{e.machine}</span>
                  <span className="text-[10px] text-muted-foreground">{e.from} → <span className="font-bold">{e.to}</span></span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${sourceColors[e.source]}`}>{e.source}</span>
                  {e.operator && <span className="text-[10px] text-muted-foreground">Op: {e.operator}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{e.start} {e.end && `→ ${e.end}`} {e.duration && <span className="font-medium">({e.duration} min)</span>}</p>
                {e.reason && <p className="text-[11px] text-amber-700 mt-0.5">Reason: {e.reason.replace(/_/g, ' ')} — {e.reasonDesc}</p>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Equipment Health ───────────────────────────────────────────────────
function EquipmentHealthModule() {
  const health = [
    { machine: 'COOK-01', name: 'Cooking Kettle 01', opHours: 5120, cycles: 8920, lastMaint: '2026-04-20', nextMaint: '2026-08-20', healthScore: 92, alerts: 1, status: 'RUNNING' },
    { machine: 'MIX-01', name: 'Industrial Mixer 01', opHours: 4280, cycles: 12480, lastMaint: '2026-06-15', nextMaint: '2026-09-15', healthScore: 88, alerts: 1, status: 'RUNNING' },
    { machine: 'GRIND-01', name: 'Wet Grinder 01', opHours: 3120, cycles: 4280, lastMaint: '2026-05-12', nextMaint: '2026-09-12', healthScore: 95, alerts: 0, status: 'RUNNING' },
    { machine: 'PACK-03', name: 'Packaging Machine 03', opHours: 2840, cycles: 6240, lastMaint: '2026-07-05', nextMaint: '2026-10-05', healthScore: 90, alerts: 0, status: 'SETUP' },
    { machine: 'COOL-01', name: 'Cooling Tunnel 01', opHours: 1980, cycles: 2840, lastMaint: '2026-06-20', nextMaint: '2026-12-20', healthScore: 96, alerts: 0, status: 'CLEANING' },
    { machine: 'FRY-01', name: 'Continuous Fryer 01', opHours: 6840, cycles: 15620, lastMaint: '2026-05-10', nextMaint: '2026-07-15', healthScore: 42, alerts: 1, status: 'FAULT' },
  ]
  const healthColor = (s: number) => s >= 80 ? 'text-emerald-600' : s >= 60 ? 'text-amber-600' : 'text-rose-600'
  const healthBarColor = (s: number) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-emerald-600" />Equipment Health</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 43 · Epic 7 · Maintenance integration · Health scores · Auto work orders</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Avg Health Score', value: '83.8', color: 'text-emerald-600' },
          { label: 'Machines >80%', value: 5, color: 'text-emerald-600' },
          { label: 'Machines 60-80%', value: 0, color: 'text-amber-600' },
          { label: 'Machines <60%', value: 1, color: 'text-rose-600' },
          { label: 'Maintenance Due', value: 1, color: 'text-amber-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="p-3 border-b bg-muted/30"><h3 className="font-semibold text-sm">Equipment Health Scores</h3></div>
        <div className="p-3 space-y-3">
          {health.map(h => (
            <div key={h.machine} className="p-3 rounded-lg border bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-mono text-[11px] font-bold text-blue-700">{h.machine}</p>
                  <p className="text-xs font-medium">{h.name}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold ${healthColor(h.healthScore)}`}>{h.healthScore}</p>
                  <p className="text-[10px] text-muted-foreground">health score</p>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div className={`h-full ${healthBarColor(h.healthScore)}`} style={{ width: `${h.healthScore}%` }} />
              </div>
              <div className="grid grid-cols-4 gap-2 text-[10px]">
                <div><p className="text-muted-foreground">Op Hours</p><p className="font-medium">{h.opHours.toLocaleString()}h</p></div>
                <div><p className="text-muted-foreground">Cycles</p><p className="font-medium">{h.cycles.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Last Maint</p><p className="font-medium">{h.lastMaint}</p></div>
                <div><p className="text-muted-foreground">Next Maint</p><p className={`font-medium ${h.nextMaint === '2026-07-15' ? 'text-rose-600' : 'text-emerald-600'}`}>{h.nextMaint}</p></div>
              </div>
              {h.alerts > 0 && <p className="text-[10px] text-rose-600 mt-2">⚠ {h.alerts} active alert(s)</p>}
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4 bg-emerald-50/40 border-emerald-200">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Maintenance Integration — Auto Work Order Workflow</p>
            <div className="flex items-center gap-1 text-[11px] mt-2 overflow-x-auto">
              {['Maintenance Trigger', 'Work Order Created', 'Technician Assignment', 'Repair', 'Machine Back Online'].map((step, i, a) => (
                <div key={i} className="flex items-center gap-1 flex-shrink-0">
                  <span className="px-2 py-0.5 bg-white border rounded text-[10px] font-medium">{step}</span>
                  {i < a.length - 1 && <ArrowRight className="h-2.5 w-2.5 text-emerald-600 flex-shrink-0" />}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">5 Trigger Types: Operating Hours · Cycle Count · Sensor Alert · Runtime · Manual Report. Thresholds configurable per machine.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Production Counters Module ─────────────────────────────────────────
function ProductionCountersModule() {
  const counters = [
    { code: 'CTR-00048', machine: 'COOK-01', batch: 'KAJ-THN-20260709-000145', type: 'GOOD_PIECES', current: 47, previous: 0, delta: 47, uom: 'PCS', source: 'PLC', at: '14:30' },
    { code: 'CTR-00047', machine: 'COOK-01', batch: 'KAJ-THN-20260709-000145', type: 'REJECTED_PIECES', current: 0, previous: 0, delta: 0, uom: 'PCS', source: 'PLC', at: '14:30' },
    { code: 'CTR-00046', machine: 'COOK-01', batch: 'KAJ-THN-20260709-000145', type: 'CYCLE_COUNT', current: 24, previous: 0, delta: 24, uom: 'CYCLES', source: 'PLC', at: '14:30' },
    { code: 'CTR-00045', machine: 'COOK-01', batch: 'KAJ-THN-20260709-000145', type: 'SPEED_RPM', current: 110, previous: 110, delta: 0, uom: 'RPM', source: 'PLC', at: '14:30' },
    { code: 'CTR-00044', machine: 'COOK-01', batch: 'KAJ-THN-20260709-000145', type: 'OUTPUT_RATE', current: 32.5, previous: 0, delta: 32.5, uom: 'KG/H', source: 'SYSTEM', at: '14:30' },
    { code: 'CTR-00043', machine: 'MIX-01', batch: 'KAJ-THN-20260709-000145', type: 'GOOD_PIECES', current: 1, previous: 0, delta: 1, uom: 'BATCH', source: 'PLC', at: '08:00' },
    { code: 'CTR-00042', machine: 'GRIND-01', batch: 'SHW-THN-20260709-000047', type: 'GOOD_PIECES', current: 45, previous: 0, delta: 45, uom: 'KG', source: 'PLC', at: '14:30' },
    { code: 'CTR-00041', machine: 'PACK-03', batch: 'KAJ-THN-20260709-000145', type: 'PACKAGING_COUNT', current: 188, previous: 0, delta: 188, uom: 'PCS', source: 'PLC', at: '11:00' },
  ]
  const typeIcons: Record<string, string> = { GOOD_PIECES: '✅', REJECTED_PIECES: '❌', CYCLE_COUNT: '🔄', PRODUCTION_QTY: '📦', PACKAGING_COUNT: '🎁', SPEED_RPM: '⚙️', OUTPUT_RATE: '📊' }
  const typeColors: Record<string, string> = { GOOD_PIECES: 'bg-emerald-100 text-emerald-700', REJECTED_PIECES: 'bg-rose-100 text-rose-700', CYCLE_COUNT: 'bg-blue-100 text-blue-700', PRODUCTION_QTY: 'bg-amber-100 text-amber-700', PACKAGING_COUNT: 'bg-purple-100 text-purple-700', SPEED_RPM: 'bg-cyan-100 text-cyan-700', OUTPUT_RATE: 'bg-orange-100 text-orange-700' }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Hash className="h-6 w-6 text-cyan-600" />Production Counters</h2>
          <p className="text-sm text-muted-foreground mt-1">Sprint 43 · Epic 5 · Auto counters from PLC · Good/Reject/Cycle/Speed/Output Rate</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Good Pieces', value: 1248, color: 'text-emerald-600' },
          { label: 'Total Rejects', value: 12, color: 'text-rose-600' },
          { label: 'Reject Rate', value: '0.95%', color: 'text-rose-600' },
          { label: 'Total Cycles', value: 248, color: 'text-blue-600' },
          { label: 'Avg Output Rate', value: '32.5 KG/H', color: 'text-orange-600' },
        ].map(s => (
          <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Code</th>
                <th className="px-3 py-2 font-medium">Machine</th>
                <th className="px-3 py-2 font-medium">Batch</th>
                <th className="px-3 py-2 font-medium">Counter Type</th>
                <th className="px-3 py-2 font-medium text-right">Current</th>
                <th className="px-3 py-2 font-medium text-right">Previous</th>
                <th className="px-3 py-2 font-medium text-right">Delta</th>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {counters.map(c => (
                <tr key={c.code} className="border-t hover:bg-muted/30">
                  <td className="px-3 py-2 font-mono text-[11px] text-blue-700">{c.code}</td>
                  <td className="px-3 py-2 font-mono text-[11px] font-medium text-blue-700">{c.machine}</td>
                  <td className="px-3 py-2 font-mono text-[10px] text-blue-700">{c.batch}</td>
                  <td className="px-3 py-2"><span className="text-base mr-1">{typeIcons[c.type]}</span><span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${typeColors[c.type]}`}>{c.type.replace(/_/g, ' ')}</span></td>
                  <td className="px-3 py-2 text-right font-bold">{c.current} {c.uom}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{c.previous} {c.uom}</td>
                  <td className={`px-3 py-2 text-right font-medium ${c.delta > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>+{c.delta} {c.uom}</td>
                  <td className="px-3 py-2"><span className={`text-[10px] px-1.5 py-0.5 rounded ${c.source === 'PLC' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{c.source}</span></td>
                  <td className="px-3 py-2 text-[10px]">{c.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="p-4 bg-cyan-50/40 border-cyan-200">
        <div className="flex items-start gap-3">
          <Hash className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Counter Workflow — Machine → Counter → MES → Dashboard</p>
            <p className="text-xs text-muted-foreground mt-1">7 Counter Types: Good Pieces · Rejected Pieces · Cycle Count · Production Quantity · Packaging Count · Speed (RPM) · Output Rate. Each counter update is recorded in Counter History for trend analysis. PLC pushes automatic; operator can enter manual counts via Production App.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

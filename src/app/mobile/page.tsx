'use client'

import { useState, useEffect } from 'react'
import {
  ScanLine, Package, Truck, Boxes, ArrowDownToLine, ArrowUpFromLine,
  ArrowLeftRight, ClipboardCheck, Search, Settings, Bell, Battery,
  Wifi, WifiOff, Cloud, CloudOff, CheckCircle2, AlertTriangle,
  User, Lock, Fingerprint, QrCode, LogOut, ChevronRight, ChevronLeft,
  X, Menu, RefreshCw, Zap, Activity, Clock, MapPin, AlertCircle,
  Smartphone, Volume2, Vibrate, Moon, Globe, Database, Server,
  PlayCircle, PauseCircle, ArrowRight, Hash,
  PackageCheck, Forklift, Eye, Download, Upload
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// SUOP WAREHOUSE MOBILE PLATFORM — Sprint 31
// Industrial barcode-first warehouse execution app
// Scanner-first · One screen = one task · Max 3 taps · Offline-ready
// ═══════════════════════════════════════════════════════════════

type MobileScreen =
  | 'app-selector' | 'login' | 'dashboard' | 'tasks' | 'scan' | 'task-execution'
  | 'inventory-lookup' | 'sync-monitor' | 'notifications' | 'settings'
  | 'receiving' | 'putaway' | 'picking' | 'transfer' | 'cyclecount' | 'dispatch'
  | 'prod-dashboard' | 'prod-work-orders' | 'prod-wo-detail' | 'prod-material-issue'
  | 'prod-batch-create' | 'prod-quality-check' | 'prod-wip-movement' | 'prod-lookup' | 'prod-sync'

// ─── Login Screen ────────────────────────────────────────
function MobileLogin({ onLogin }: { onLogin: (method: string, code: string) => void }) {
  const [method, setMethod] = useState<'employee' | 'pin' | 'biometric' | 'qr'>('pin')
  const [code, setCode] = useState('')
  const [pin, setPin] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)

  const handlePinPress = (digit: string) => {
    const nextEmpty = pin.findIndex(p => !p)
    if (nextEmpty === -1) return
    const newPin = [...pin]
    newPin[nextEmpty] = digit
    setPin(newPin)
    if (nextEmpty === 3) {
      setTimeout(() => { setLoading(true); setTimeout(() => onLogin('PIN_LOGIN', 'OP-' + newPin.join('')), 800) }, 200)
    }
  }

  const handlePinDelete = () => {
    const lastFilled = pin.map((p, i) => p ? i : -1).filter(i => i >= 0).pop()
    if (lastFilled === undefined) return
    const newPin = [...pin]
    newPin[lastFilled as number] = ''
    setPin(newPin)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="h-20 w-20 rounded-3xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-4xl mb-4">S</div>
        <h1 className="text-2xl font-bold">SUOP Warehouse</h1>
        <p className="text-sm text-slate-400 mt-1">Operator Execution App</p>
        <div className="mt-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full font-medium">Sprint 31 · v31.0.0</div>
      </div>

      <div className="px-6 mb-4">
        <div className="flex gap-2 mb-4">
          {([
            { key: 'pin', label: 'PIN', icon: <Hash className="h-4 w-4" /> },
            { key: 'employee', label: 'Employee', icon: <User className="h-4 w-4" /> },
            { key: 'biometric', label: 'Biometric', icon: <Fingerprint className="h-4 w-4" /> },
            { key: 'qr', label: 'QR', icon: <QrCode className="h-4 w-4" /> },
          ] as const).map(m => (
            <button key={m.key} onClick={() => setMethod(m.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium transition-colors ${method === m.key ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
              {m.icon}<span>{m.label}</span>
            </button>
          ))}
        </div>

        {method === 'pin' && (
          <div>
            <div className="flex justify-center gap-3 mb-6">
              {pin.map((p, i) => (
                <div key={i} className={`h-4 w-4 rounded-full ${p ? 'bg-amber-500' : 'bg-slate-700'}`} />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
                <button key={d} onClick={() => handlePinPress(d)} className="h-16 rounded-xl bg-slate-800 text-2xl font-bold active:bg-slate-700">{d}</button>
              ))}
              <button onClick={handlePinDelete} className="h-16 rounded-xl bg-slate-800 flex items-center justify-center active:bg-slate-700"><X className="h-6 w-6" /></button>
              <button onClick={() => handlePinPress('0')} className="h-16 rounded-xl bg-slate-800 text-2xl font-bold active:bg-slate-700">0</button>
              <button onClick={() => { setLoading(true); setTimeout(() => onLogin('PIN_LOGIN', 'OP-0000'), 500) }} className="h-16 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center active:bg-amber-400"><CheckCircle2 className="h-6 w-6" /></button>
            </div>
          </div>
        )}

        {method === 'employee' && (
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-xl p-4">
              <label className="text-xs text-slate-400">Operator Code</label>
              <input value={code} onChange={e => setCode(e.target.value)} placeholder="OP-001" className="w-full bg-transparent text-white text-lg font-mono outline-none mt-1" />
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <label className="text-xs text-slate-400">Password</label>
              <input type="password" placeholder="••••••••" className="w-full bg-transparent text-white text-lg outline-none mt-1" />
            </div>
            <button onClick={() => { setLoading(true); setTimeout(() => onLogin('EMPLOYEE_LOGIN', code || 'OP-001'), 800) }} className="w-full h-14 rounded-xl bg-amber-500 text-slate-950 font-bold text-lg active:bg-amber-400">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        )}

        {method === 'biometric' && (
          <div className="flex flex-col items-center py-8">
            <button onClick={() => { setLoading(true); setTimeout(() => onLogin('BIOMETRIC_LOGIN', 'OP-001'), 1200) }} className="h-28 w-28 rounded-full bg-slate-800 flex items-center justify-center active:bg-slate-700">
              <Fingerprint className={`h-14 w-14 text-amber-500 ${loading ? 'animate-pulse' : ''}`} />
            </button>
            <p className="text-sm text-slate-400 mt-4">{loading ? 'Verifying fingerprint...' : 'Tap to scan fingerprint'}</p>
          </div>
        )}

        {method === 'qr' && (
          <div className="flex flex-col items-center py-4">
            <div className="h-48 w-48 bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-600">
              <QrCode className="h-20 w-20 text-slate-500" />
            </div>
            <p className="text-sm text-slate-400 mt-4 text-center">Scan the QR code displayed on the desktop ERP to log in</p>
            <button onClick={() => { setLoading(true); setTimeout(() => onLogin('QR_LOGIN', 'OP-001'), 1000) }} className="mt-4 px-6 h-12 rounded-xl bg-amber-500 text-slate-950 font-bold active:bg-amber-400">Simulate Scan</button>
          </div>
        )}
      </div>

      <div className="px-6 py-4 text-center">
        <p className="text-xs text-slate-500">Offline login available · 9 supported devices · 10 barcode symbologies</p>
      </div>
    </div>
  )
}

// ─── Dashboard ──────────────────────────────────────────
function MobileDashboard({ onNavigate, operator, stats, device, syncStatus }: {
  onNavigate: (s: MobileScreen) => void
  operator: { code: string; name: string; shift: string }
  stats: { completed: number; pending: number; total: number; accuracy: number; util: number; hours: number }
  device: { battery: number; online: boolean; lastSync: string }
  syncStatus: { pending: number; conflicts: number }
}) {
  const quickActions = [
    { label: 'Receive', icon: <ArrowDownToLine className="h-7 w-7" />, screen: 'receiving' as MobileScreen, color: 'bg-emerald-500' },
    { label: 'Putaway', icon: <ArrowUpFromLine className="h-7 w-7" />, screen: 'putaway' as MobileScreen, color: 'bg-blue-500' },
    { label: 'Pick', icon: <Package className="h-7 w-7" />, screen: 'picking' as MobileScreen, color: 'bg-amber-500' },
    { label: 'Transfer', icon: <ArrowLeftRight className="h-7 w-7" />, screen: 'transfer' as MobileScreen, color: 'bg-purple-500' },
    { label: 'Count', icon: <ClipboardCheck className="h-7 w-7" />, screen: 'cyclecount' as MobileScreen, color: 'bg-orange-500' },
    { label: 'Lookup', icon: <Search className="h-7 w-7" />, screen: 'inventory-lookup' as MobileScreen, color: 'bg-cyan-500' },
    { label: 'Dispatch', icon: <Truck className="h-7 w-7" />, screen: 'dispatch' as MobileScreen, color: 'bg-pink-500' },
    { label: 'Tasks', icon: <ClipboardCheck className="h-7 w-7" />, screen: 'tasks' as MobileScreen, color: 'bg-slate-700' },
  ]

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <div className="bg-slate-900 text-white px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-slate-400">Welcome back</p>
            <h1 className="text-xl font-bold">{operator.name}</h1>
            <p className="text-xs text-amber-400 mt-0.5">{operator.code} · {operator.shift}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate('notifications')} className="relative h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center active:bg-slate-700">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
            </button>
            <div className={`px-2 py-1 rounded-full text-xs font-mono flex items-center gap-1 ${device.battery > 30 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
              <Battery className="h-3 w-3" /> {device.battery}%
            </div>
          </div>
        </div>

        <button onClick={() => onNavigate('sync-monitor')} className="w-full bg-slate-800 rounded-xl p-3 flex items-center justify-between active:bg-slate-700">
          <div className="flex items-center gap-2">
            {device.online ? <Wifi className="h-4 w-4 text-emerald-400" /> : <WifiOff className="h-4 w-4 text-rose-400" />}
            <span className="text-sm">{device.online ? 'Online' : 'Offline'}</span>
            {syncStatus.pending > 0 && <span className="text-xs text-amber-400">· {syncStatus.pending} pending sync</span>}
            {syncStatus.conflicts > 0 && <span className="text-xs text-rose-400">· {syncStatus.conflicts} conflicts</span>}
          </div>
          <Cloud className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-900">Today&apos;s Performance</h2>
            <span className="text-xs text-slate-500">{stats.hours}h worked</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
              <p className="text-[10px] text-slate-500 uppercase">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-[10px] text-slate-500 uppercase">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.accuracy}%</p>
              <p className="text-[10px] text-slate-500 uppercase">Accuracy</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs"><span className="text-slate-500">Utilization</span><span className="font-bold text-slate-900">{stats.util}%</span></div>
            <div className="mt-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${stats.util}%` }} /></div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6">
        <h2 className="font-bold text-slate-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(a => (
            <button key={a.label} onClick={() => onNavigate(a.screen)} className="flex flex-col items-center gap-2 active:scale-95 transition-transform">
              <div className={`h-16 w-16 rounded-2xl ${a.color} text-white flex items-center justify-center shadow-md`}>{a.icon}</div>
              <span className="text-xs font-medium text-slate-700">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-6">
        <h2 className="font-bold text-slate-900 mb-3">Assigned Equipment</h2>
        <div className="space-y-2">
          <div className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center"><Forklift className="h-5 w-5 text-amber-700" /></div>
            <div className="flex-1"><p className="font-semibold text-sm text-slate-900">Forklift FL-001</p><p className="text-xs text-slate-500">Toyota 8FBE15</p></div>
            <div className="text-right"><div className="text-xs font-mono text-emerald-600">78%</div><Battery className="h-4 w-4 text-emerald-500 ml-auto" /></div>
          </div>
          <div className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center"><ScanLine className="h-5 w-5 text-blue-700" /></div>
            <div className="flex-1"><p className="font-semibold text-sm text-slate-900">Scanner SC-001</p><p className="text-xs text-slate-500">Zebra TC52</p></div>
            <div className="text-right"><div className="text-xs font-mono text-emerald-600">88%</div><Battery className="h-4 w-4 text-emerald-500 ml-auto" /></div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex max-w-md mx-auto">
        {[
          { icon: <Activity className="h-5 w-5" />, label: 'Home', screen: 'dashboard' as MobileScreen, active: true },
          { icon: <ClipboardCheck className="h-5 w-5" />, label: 'Tasks', screen: 'tasks' as MobileScreen, active: false },
          { icon: <ScanLine className="h-5 w-5" />, label: 'Scan', screen: 'scan' as MobileScreen, active: false },
          { icon: <Search className="h-5 w-5" />, label: 'Lookup', screen: 'inventory-lookup' as MobileScreen, active: false },
          { icon: <Settings className="h-5 w-5" />, label: 'Settings', screen: 'settings' as MobileScreen, active: false },
        ].map(n => (
          <button key={n.label} onClick={() => onNavigate(n.screen)} className={`flex-1 flex flex-col items-center gap-1 py-3 ${n.active ? 'text-amber-500' : 'text-slate-400'}`}>
            {n.icon}<span className="text-[10px] font-medium">{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Task Queue ─────────────────────────────────────────
function MobileTasks({ onOpenTask, onBack }: { onOpenTask: (task: any) => void; onBack: () => void }) {
  const tasks = [
    { id: 't1', num: 'TASK-2026-001', type: 'PICK', priority: 'EMERGENCY', status: 'IN_PROGRESS', product: 'Kaju Katli 500g', from: 'C-02-03-A', to: 'PK-01', qty: '24 PCS', sla: '10:45' },
    { id: 't2', num: 'TASK-2026-003', type: 'PICK', priority: 'HIGH', status: 'OPEN', product: 'Mysore Pak 250g', from: 'C-03-01-B', to: 'PK-02', qty: '48 PCS', sla: '11:30' },
    { id: 't3', num: 'TASK-2026-011', type: 'PUTAWAY', priority: 'NORMAL', status: 'OPEN', product: 'Saffron 10g', from: 'RECV-01', to: 'B-01-02-C', qty: '100 PCS', sla: '13:00' },
    { id: 't4', num: 'TASK-2026-015', type: 'COUNT', priority: 'LOW', status: 'OPEN', product: 'Cycle Count Zone B1', from: 'B-01-01', to: '—', qty: '—', sla: '18:30' },
  ]

  const typeColors: Record<string, string> = { PICK: 'bg-amber-100 text-amber-700', PUTAWAY: 'bg-blue-100 text-blue-700', COUNT: 'bg-orange-100 text-orange-700', RECEIVE: 'bg-emerald-100 text-emerald-700', TRANSFER: 'bg-purple-100 text-purple-700', DISPATCH: 'bg-pink-100 text-pink-700' }
  const priorityColors: Record<string, string> = { EMERGENCY: 'bg-red-500', HIGH: 'bg-orange-500', NORMAL: 'bg-blue-500', LOW: 'bg-slate-400' }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-slate-900 text-white px-4 pt-4 pb-6 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center"><ChevronLeft className="h-5 w-5" /></button>
          <h1 className="text-xl font-bold">My Tasks</h1>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1 bg-slate-800 rounded-full">{tasks.length} assigned</span>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full">{tasks.filter(t => t.status === 'IN_PROGRESS').length} in progress</span>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full">{tasks.filter(t => t.status === 'OPEN').length} open</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {tasks.map(t => (
          <button key={t.id} onClick={() => onOpenTask(t)} className="w-full bg-white rounded-xl p-4 shadow-sm active:bg-slate-50 text-left">
            <div className="flex items-start gap-3">
              <div className={`w-1.5 self-stretch rounded-full ${priorityColors[t.priority]}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold text-blue-700">{t.num}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${typeColors[t.type]}`}>{t.type}</span>
                </div>
                <p className="font-semibold text-slate-900 text-sm">{t.product}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="font-mono">{t.from}</span><ArrowRight className="h-3 w-3" /><span className="font-mono">{t.to}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-500">Qty: <span className="font-mono font-semibold text-slate-900">{t.qty}</span></span>
                  <span className="text-xs flex items-center gap-1"><Clock className="h-3 w-3" />SLA: <span className="font-mono font-semibold text-slate-900">{t.sla}</span></span>
                </div>
                {t.status === 'IN_PROGRESS' && <div className="mt-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] rounded font-medium text-center">IN PROGRESS — Resume</div>}
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Task Execution ─────────────────────────────────────
function MobileTaskExecution({ task, onComplete, onBack }: { task: any; onComplete: () => void; onBack: () => void }) {
  const [step, setStep] = useState<'scan-from' | 'scan-product' | 'confirm-qty' | 'complete'>('scan-from')
  const [scannedValue, setScannedValue] = useState('')
  const [confirmedQty, setConfirmedQty] = useState(task?.qty?.split(' ')[0] || '24')
  const [scanHistory, setScanHistory] = useState<string[]>([])

  const handleScan = () => {
    if (!scannedValue) setScannedValue(`SCAN-${Date.now().toString().slice(-6)}`)
    setScanHistory([...scanHistory, `${new Date().toLocaleTimeString()} — ${scannedValue || 'AUTO-SCAN'}`])
    setScannedValue('')
    if (step === 'scan-from') setStep('scan-product')
    else if (step === 'scan-product') setStep('confirm-qty')
  }

  const steps = [
    { key: 'scan-from', label: 'Scan From Location', icon: <MapPin className="h-6 w-6" /> },
    { key: 'scan-product', label: 'Scan Product Barcode', icon: <Package className="h-6 w-6" /> },
    { key: 'confirm-qty', label: 'Confirm Quantity', icon: <Hash className="h-6 w-6" /> },
    { key: 'complete', label: 'Task Complete', icon: <CheckCircle2 className="h-6 w-6" /> },
  ]
  const currentStepIdx = steps.findIndex(s => s.key === step)

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-slate-900 text-white px-4 pt-4 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center"><ChevronLeft className="h-5 w-5" /></button>
          <div className="flex-1">
            <h1 className="text-base font-bold">{task?.num}</h1>
            <p className="text-xs text-amber-400">{task?.type} · {task?.priority}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={s.key} className="flex-1 h-1 rounded-full" style={{ backgroundColor: i <= currentStepIdx ? '#f59e0b' : '#334155' }} />
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">Step {currentStepIdx + 1} of {steps.length}: {steps[currentStepIdx].label}</p>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <h2 className="font-bold text-slate-900 text-sm mb-2">{task?.product}</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><p className="text-slate-500">From</p><p className="font-mono font-bold text-slate-900">{task?.from}</p></div>
            <div><p className="text-slate-500">To</p><p className="font-mono font-bold text-slate-900">{task?.to}</p></div>
            <div><p className="text-slate-500">Planned Qty</p><p className="font-mono font-bold text-slate-900">{task?.qty}</p></div>
            <div><p className="text-slate-500">SLA</p><p className="font-mono font-bold text-slate-900">{task?.sla}</p></div>
          </div>
        </div>

        {step === 'scan-from' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex flex-col items-center mb-4">
              <div className="h-32 w-32 rounded-2xl bg-slate-900 flex items-center justify-center mb-3">
                <ScanLine className="h-16 w-16 text-amber-500 animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Scan From Location</p>
              <p className="text-xs text-slate-500 mt-1">Aim scanner at bin label: <span className="font-mono font-bold">{task?.from}</span></p>
            </div>
            <div className="flex gap-2 mb-3">
              <input value={scannedValue} onChange={e => setScannedValue(e.target.value)} placeholder="Scan or enter barcode..." className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm font-mono outline-none" autoFocus />
              <button onClick={handleScan} className="px-4 bg-amber-500 text-slate-950 rounded-xl font-bold text-sm active:bg-amber-400">Verify</button>
            </div>
            <button onClick={handleScan} className="w-full h-14 bg-slate-900 text-white rounded-xl font-bold active:bg-slate-800">Simulate Scan ✓</button>
          </div>
        )}

        {step === 'scan-product' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex flex-col items-center mb-4">
              <div className="h-32 w-32 rounded-2xl bg-amber-500 flex items-center justify-center mb-3">
                <Package className="h-16 w-16 text-slate-950" />
              </div>
              <p className="text-sm font-semibold text-slate-900">Scan Product Barcode</p>
              <p className="text-xs text-slate-500 mt-1">{task?.product}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div><p className="text-xs font-medium text-emerald-900">From location verified</p><p className="text-[10px] text-emerald-700">Bin {task?.from} confirmed</p></div>
            </div>
            <div className="flex gap-2">
              <input value={scannedValue} onChange={e => setScannedValue(e.target.value)} placeholder="Scan product..." className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm font-mono outline-none" autoFocus />
              <button onClick={handleScan} className="px-4 bg-amber-500 text-slate-950 rounded-xl font-bold text-sm active:bg-amber-400">Verify</button>
            </div>
            <button onClick={handleScan} className="w-full h-14 mt-3 bg-slate-900 text-white rounded-xl font-bold active:bg-slate-800">Simulate Scan ✓</button>
          </div>
        )}

        {step === 'confirm-qty' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900 mb-1">Confirm Quantity</p>
            <p className="text-xs text-slate-500 mb-4">Planned: <span className="font-mono font-bold">{task?.qty}</span></p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <button onClick={() => setConfirmedQty(String(Math.max(0, parseInt(confirmedQty) - 1)))} className="h-14 w-14 rounded-full bg-slate-100 text-2xl font-bold active:bg-slate-200">−</button>
              <div className="text-center">
                <p className="text-5xl font-bold text-slate-900">{confirmedQty}</p>
                <p className="text-xs text-slate-500">{task?.qty?.split(' ')[1] || 'PCS'}</p>
              </div>
              <button onClick={() => setConfirmedQty(String(parseInt(confirmedQty) + 1))} className="h-14 w-14 rounded-full bg-slate-100 text-2xl font-bold active:bg-slate-200">+</button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['12', '24', '48'].map(q => <button key={q} onClick={() => setConfirmedQty(q)} className="py-2 bg-slate-100 rounded-lg text-sm font-mono font-bold active:bg-slate-200">{q}</button>)}
            </div>
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <div><p className="text-xs font-medium text-emerald-900">Product verified</p><p className="text-[10px] text-emerald-700">Batch & expiry confirmed</p></div>
            </div>
            <button onClick={() => setStep('complete')} className="w-full h-14 bg-emerald-500 text-white rounded-xl font-bold active:bg-emerald-600">Confirm & Complete</button>
          </div>
        )}

        {step === 'complete' && (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <div className="h-24 w-24 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-14 w-14 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Task Complete!</h2>
            <p className="text-sm text-slate-500 mt-1">{task?.num} · {confirmedQty} {task?.qty?.split(' ')[1] || 'PCS'}</p>
            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-left text-xs space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Duration:</span><span className="font-mono font-bold">2m 14s</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Scans:</span><span className="font-mono font-bold">{scanHistory.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Sync status:</span><span className="font-mono font-bold text-emerald-600">Uploaded</span></div>
            </div>
            <button onClick={onComplete} className="w-full h-14 mt-4 bg-amber-500 text-slate-950 rounded-xl font-bold active:bg-amber-400">Next Task →</button>
          </div>
        )}

        {scanHistory.length > 0 && step !== 'complete' && (
          <div className="mt-4 bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-700 mb-2">Scan History ({scanHistory.length})</p>
            {scanHistory.map((s, i) => <div key={i} className="text-[10px] font-mono text-slate-500 py-1 border-b last:border-0">{s}</div>)}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Inventory Lookup ───────────────────────────────────
function MobileInventoryLookup({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)

  const results = [
    { sku: 'SK-KAJU-500', name: 'Kaju Katli 500g', batch: 'BATCH-2026-A018', bin: 'C-02-03-A', avail: 156, reserved: 24, expiry: '2026-09-15', status: 'AVAILABLE' },
    { sku: 'SK-KAJU-500', name: 'Kaju Katli 500g', batch: 'BATCH-2026-A019', bin: 'C-02-04-B', avail: 84, reserved: 0, expiry: '2026-09-22', status: 'AVAILABLE' },
    { sku: 'SK-KAJU-500', name: 'Kaju Katli 500g', batch: 'BATCH-2026-A015', bin: 'B-01-03-A', avail: 12, reserved: 0, expiry: '2026-08-10', status: 'NEAR_EXPIRY' },
  ]

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-slate-900 text-white px-4 pt-4 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center"><ChevronLeft className="h-5 w-5" /></button>
          <h1 className="text-xl font-bold">Inventory Lookup</h1>
        </div>
        <div className="flex gap-2">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Scan barcode or search..." className="flex-1 px-4 py-3 bg-slate-800 rounded-xl text-sm outline-none placeholder:text-slate-500" />
          <button onClick={() => setSearched(true)} className="px-4 bg-amber-500 text-slate-950 rounded-xl font-bold text-sm active:bg-amber-400">Search</button>
        </div>
        <div className="flex gap-2 mt-2 text-xs">
          {['Barcode', 'QR', 'Product', 'Batch', 'Bin', 'Serial'].map(f => <span key={f} className="px-2 py-1 bg-slate-800 rounded-full text-slate-300">{f}</span>)}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {searched ? results.map((r, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div><p className="font-semibold text-slate-900 text-sm">{r.name}</p><p className="text-[10px] font-mono text-slate-500">{r.sku}</p></div>
              <span className={`text-[10px] px-2 py-0.5 rounded ${r.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.status.replace(/_/g, ' ')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><p className="text-slate-500">Batch</p><p className="font-mono font-semibold text-slate-900">{r.batch}</p></div>
              <div><p className="text-slate-500">Bin</p><p className="font-mono font-semibold text-blue-700">{r.bin}</p></div>
              <div><p className="text-slate-500">Available</p><p className="font-mono font-bold text-emerald-700">{r.avail} PCS</p></div>
              <div><p className="text-slate-500">Reserved</p><p className="font-mono font-bold text-amber-700">{r.reserved} PCS</p></div>
              <div><p className="text-slate-500">Expiry</p><p className="font-mono font-semibold text-slate-900">{r.expiry}</p></div>
            </div>
          </div>
        )) : (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Scan a barcode or search to lookup inventory</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sync Monitor ───────────────────────────────────────
function MobileSyncMonitor({ onBack }: { onBack: () => void }) {
  const [syncing, setSyncing] = useState(false)
  const offlineTxns = [
    { code: 'OFF-2026-018', type: 'PICK', status: 'CONFLICT', time: '10:35', conflict: 'Bin qty changed' },
    { code: 'OFF-2026-017', type: 'PUTAWAY', status: 'PENDING_SYNC', time: '10:18', conflict: null },
    { code: 'OFF-2026-016', type: 'PICK', status: 'SYNCED', time: '09:42', conflict: null },
    { code: 'OFF-2026-015', type: 'COUNT', status: 'SYNCED', time: '09:15', conflict: null },
  ]

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-slate-900 text-white px-4 pt-4 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center"><ChevronLeft className="h-5 w-5" /></button>
          <h1 className="text-xl font-bold">Sync Monitor</h1>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><Wifi className="h-5 w-5 text-emerald-400" /><span className="font-semibold">Online · WiFi</span></div>
            <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full">Sync Health: GOOD</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-2xl font-bold text-amber-400">2</p><p className="text-[10px] text-slate-400">Pending Upload</p></div>
            <div><p className="text-2xl font-bold text-rose-400">1</p><p className="text-[10px] text-slate-400">Conflicts</p></div>
            <div><p className="text-2xl font-bold text-emerald-400">0</p><p className="text-[10px] text-slate-400">Failed</p></div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">Storage</span><span className="font-mono">12.4 / 50 MB</span></div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: '25%' }} /></div>
          </div>
        </div>

        <button onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 2000) }} className="w-full mt-3 h-12 bg-amber-500 text-slate-950 rounded-xl font-bold active:bg-amber-400 flex items-center justify-center gap-2">
          {syncing ? <><RefreshCw className="h-5 w-5 animate-spin" /> Syncing...</> : <><RefreshCw className="h-5 w-5" /> Sync Now</>}
        </button>
      </div>

      <div className="p-4">
        <h2 className="font-bold text-slate-900 mb-3">Offline Transactions</h2>
        <div className="space-y-2">
          {offlineTxns.map(t => {
            const colors: Record<string, string> = { SYNCED: 'bg-emerald-100 text-emerald-700', PENDING_SYNC: 'bg-amber-100 text-amber-700', CONFLICT: 'bg-rose-100 text-rose-700', FAILED: 'bg-red-100 text-red-700' }
            return (
              <div key={t.code} className="bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-semibold text-blue-700">{t.code}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${colors[t.status]}`}>{t.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{t.type} · {t.time}</span>
                  {t.conflict && <span className="text-rose-600 font-medium">⚠ {t.conflict}</span>}
                </div>
                {t.status === 'CONFLICT' && (
                  <div className="mt-2 flex gap-2">
                    <button className="flex-1 py-1.5 bg-emerald-500 text-white text-xs rounded font-bold">Merge</button>
                    <button className="flex-1 py-1.5 bg-slate-200 text-slate-700 text-xs rounded font-bold">Keep Server</button>
                    <button className="flex-1 py-1.5 bg-amber-500 text-slate-950 text-xs rounded font-bold">Review</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Notifications ──────────────────────────────────────
function MobileNotifications({ onBack }: { onBack: () => void }) {
  const notifications = [
    { type: 'EMERGENCY_TASK', title: 'EMERGENCY: Pick Task', msg: 'TASK-2026-001 — Kaju Katli 500g, 24 PCS from C-02-03-A', time: '5 min ago', priority: 'EMERGENCY' },
    { type: 'TASK_ASSIGNED', title: 'New Task Assigned', msg: 'TASK-2026-015 (Cycle Count Zone B1) assigned to you', time: '30 min ago', priority: 'NORMAL' },
    { type: 'LOW_BATTERY', title: 'Low Battery Alert', msg: 'Scanner SC-005 at 18% — please return to charging station', time: '1 hour ago', priority: 'HIGH' },
    { type: 'SYNC_FAILURE', title: 'Sync Failed', msg: '1 transaction failed to sync — will retry automatically', time: '1 hour ago', priority: 'NORMAL' },
    { type: 'WAREHOUSE_ALERT', title: 'Dock Maintenance', msg: 'DOCK-04 unavailable until 12:00', time: '2 hours ago', priority: 'WARNING' },
  ]
  const priorityColors: Record<string, string> = { EMERGENCY: 'bg-red-500', HIGH: 'bg-orange-500', WARNING: 'bg-amber-500', NORMAL: 'bg-blue-500', LOW: 'bg-slate-400' }
  const typeIcons: Record<string, React.ReactNode> = { EMERGENCY_TASK: <AlertCircle className="h-5 w-5" />, TASK_ASSIGNED: <ClipboardCheck className="h-5 w-5" />, LOW_BATTERY: <Battery className="h-5 w-5" />, SYNC_FAILURE: <CloudOff className="h-5 w-5" />, WAREHOUSE_ALERT: <AlertTriangle className="h-5 w-5" /> }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-slate-900 text-white px-4 pt-4 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center"><ChevronLeft className="h-5 w-5" /></button>
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {notifications.map((n, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`h-10 w-10 rounded-full ${priorityColors[n.priority]} text-white flex items-center justify-center flex-shrink-0`}>{typeIcons[n.type]}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between"><p className="font-semibold text-sm text-slate-900">{n.title}</p><span className="text-[10px] text-slate-400">{n.time}</span></div>
                <p className="text-xs text-slate-600 mt-1">{n.msg}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Settings ───────────────────────────────────────────
function MobileSettings({ onBack, onLogout }: { onBack: () => void; onLogout: () => void }) {
  const [darkMode, setDarkMode] = useState(false)
  const [vibration, setVibration] = useState(true)
  const [voiceAlerts, setVoiceAlerts] = useState(true)
  const [scannerSensitivity, setScannerSensitivity] = useState('HIGH')

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-slate-900 text-white px-4 pt-4 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-3"><button onClick={onBack} className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center"><ChevronLeft className="h-5 w-5" /></button><h1 className="text-xl font-bold">Settings</h1></div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-sm text-slate-900 mb-3">Device Information</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">Device Code</span><span className="font-mono font-semibold">MD-002</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Model</span><span className="font-semibold">Zebra TC52</span></div>
            <div className="flex justify-between"><span className="text-slate-500">IMEI</span><span className="font-mono">358912456789013</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Android Version</span><span className="font-mono">13.1</span></div>
            <div className="flex justify-between"><span className="text-slate-500">App Version</span><span className="font-mono">SUOP Scanner v1.4.2</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Last Sync</span><span className="font-mono">10:30 AM</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-sm text-slate-900 mb-3">Preferences</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Moon className="h-4 w-4 text-slate-500" /><span className="text-sm">Dark Mode</span></div><button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-amber-500' : 'bg-slate-300'}`}><div className={`h-5 w-5 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} /></button></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Vibrate className="h-4 w-4 text-slate-500" /><span className="text-sm">Vibration Feedback</span></div><button onClick={() => setVibration(!vibration)} className={`w-12 h-6 rounded-full transition-colors ${vibration ? 'bg-amber-500' : 'bg-slate-300'}`}><div className={`h-5 w-5 rounded-full bg-white transition-transform ${vibration ? 'translate-x-6' : 'translate-x-0.5'}`} /></button></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Volume2 className="h-4 w-4 text-slate-500" /><span className="text-sm">Voice Alerts</span></div><button onClick={() => setVoiceAlerts(!voiceAlerts)} className={`w-12 h-6 rounded-full transition-colors ${voiceAlerts ? 'bg-amber-500' : 'bg-slate-300'}`}><div className={`h-5 w-5 rounded-full bg-white transition-transform ${voiceAlerts ? 'translate-x-6' : 'translate-x-0.5'}`} /></button></div>
            <div><div className="flex items-center gap-2 mb-2"><ScanLine className="h-4 w-4 text-slate-500" /><span className="text-sm">Scanner Sensitivity</span></div><div className="flex gap-2">{['LOW', 'MEDIUM', 'HIGH'].map(s => <button key={s} onClick={() => setScannerSensitivity(s)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${scannerSensitivity === s ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'}`}>{s}</button>)}</div></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-sm text-slate-900 mb-3">Sync & Storage</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">Sync Frequency</span><span className="font-semibold">Auto (on reconnect)</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Offline Storage Limit</span><span className="font-semibold">50 MB</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Currently Used</span><span className="font-mono font-semibold text-blue-700">12.4 MB</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Conflict Resolution</span><span className="font-semibold">Auto-Merge</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2"><Globe className="h-4 w-4" /> Language</h2>
          <div className="grid grid-cols-3 gap-2">{['English', 'हिन्दी', 'मराठी', 'தமிழ்', 'తెలుగు', 'ગુજરાતી'].map(l => <button key={l} className={`py-2 rounded-lg text-xs font-medium ${l === 'English' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'}`}>{l}</button>)}</div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2"><Activity className="h-4 w-4" /> Device Diagnostics</h2>
          <button className="w-full py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 active:bg-slate-200">Run Diagnostics</button>
        </div>

        <button onClick={onLogout} className="w-full h-14 bg-rose-500 text-white rounded-xl font-bold active:bg-rose-600 flex items-center justify-center gap-2"><LogOut className="h-5 w-5" /> Logout</button>
        <div className="h-8" />
      </div>
    </div>
  )
}

// ─── Operation Selector ─────────────────────────────────
function MobileOperationScreen({ operation, onBack, onStartTask }: { operation: string; onBack: () => void; onStartTask: (task: any) => void }) {
  const opConfig: Record<string, { title: string; color: string; icon: React.ReactNode; description: string }> = {
    receiving: { title: 'Receiving', color: 'bg-emerald-500', icon: <ArrowDownToLine className="h-8 w-8" />, description: 'Scan inbound shipment against ASN' },
    putaway: { title: 'Putaway', color: 'bg-blue-500', icon: <ArrowUpFromLine className="h-8 w-8" />, description: 'Move received goods to storage bins' },
    picking: { title: 'Picking', color: 'bg-amber-500', icon: <Package className="h-8 w-8" />, description: 'Pick items for outbound orders' },
    transfer: { title: 'Transfer', color: 'bg-purple-500', icon: <ArrowLeftRight className="h-8 w-8" />, description: 'Move inventory between bins' },
    cyclecount: { title: 'Cycle Count', color: 'bg-orange-500', icon: <ClipboardCheck className="h-8 w-8" />, description: 'Count inventory for audit' },
    dispatch: { title: 'Dispatch', color: 'bg-pink-500', icon: <Truck className="h-8 w-8" />, description: 'Verify & load outbound vehicles' },
  }
  const cfg = opConfig[operation] || opConfig.picking

  const task = {
    num: `TASK-2026-${Math.floor(Math.random() * 9000) + 1000}`,
    type: operation.toUpperCase(),
    priority: 'NORMAL',
    product: operation === 'cyclecount' ? 'Cycle Count Zone B1' : `${cfg.title} Item Sample`,
    from: operation === 'receiving' ? 'DOCK-02' : operation === 'putaway' ? 'RECV-01' : 'C-02-03-A',
    to: operation === 'receiving' ? 'RECV-01' : operation === 'putaway' ? 'B-01-02-C' : operation === 'dispatch' ? 'TRUCK-MH12' : 'PK-01',
    qty: '24 PCS',
    sla: '11:30',
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className={`${cfg.color} text-white px-4 pt-4 pb-8`}>
        <div className="flex items-center gap-3 mb-4"><button onClick={onBack} className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center"><ChevronLeft className="h-5 w-5" /></button><h1 className="text-xl font-bold">{cfg.title}</h1></div>
        <div className="flex flex-col items-center"><div className="h-20 w-20 rounded-2xl bg-white/20 flex items-center justify-center mb-2">{cfg.icon}</div><p className="text-sm text-white/90 text-center">{cfg.description}</p></div>
      </div>

      <div className="p-4 -mt-4">
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <h2 className="font-bold text-slate-900 mb-1">Next Task</h2>
          <p className="text-xs text-slate-500 mb-3">System auto-assigns highest priority task</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">Task #</span><span className="font-mono font-bold text-blue-700">{task.num}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Product</span><span className="font-semibold">{task.product}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">From → To</span><span className="font-mono font-semibold">{task.from} → {task.to}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Quantity</span><span className="font-mono font-bold">{task.qty}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">SLA</span><span className="font-mono font-bold text-amber-600">{task.sla}</span></div>
          </div>
          <button onClick={() => onStartTask(task)} className="w-full h-14 mt-4 bg-amber-500 text-slate-950 rounded-xl font-bold active:bg-amber-400 flex items-center justify-center gap-2"><ScanLine className="h-5 w-5" /> Start Task — Scan to Begin</button>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-900 mb-1">Scanner-First Principle</p>
          <p className="text-[11px] text-blue-700">Maximum 3 taps to complete this operation after scanning. One screen = one task. Voice & vibration feedback enabled.</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Mobile App ────────────────────────────────────
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


export default function MobileApp() {
  const [screen, setScreen] = useState<MobileScreen>('app-selector')
  const [appMode, setAppMode] = useState<'warehouse' | 'production' | null>(null)
  const [operator, setOperator] = useState({ code: 'OP-001', name: 'Rajesh Kumar', shift: 'Morning (06:00-14:00)' })
  const [activeTask, setActiveTask] = useState<any>(null)

  const stats = { completed: 14, pending: 3, total: 17, accuracy: 98.5, util: 87, hours: 4.5 }
  const device = { battery: 88, online: true, lastSync: '10:30 AM' }
  const syncStatus = { pending: 2, conflicts: 1 }

  const handleLogin = (method: string, code: string) => {
    setOperator({ code, name: 'Rajesh Kumar', shift: 'Morning (06:00-14:00)' })
    setScreen(appMode === 'production' ? 'prod-dashboard' : 'dashboard')
  }

  const handleOpenTask = (task: any) => {
    setActiveTask(task)
    setScreen('task-execution')
  }

  const handleStartTask = (task: any) => {
    setActiveTask(task)
    setScreen('task-execution')
  }

  const handleLogout = () => {
    setAppMode(null)
    setScreen('app-selector')
  }

  // App Selector
  if (screen === 'app-selector') {
    return <AppSelectorScreen onSelect={(mode) => { setAppMode(mode); setScreen('login') }} />
  }

  // Production App Screens
  if (screen === 'prod-dashboard') return <ProductionDashboard onNavigate={setScreen} onLogout={handleLogout} />
  if (screen === 'prod-work-orders') return <ProductionWorkOrders onBack={() => setScreen('prod-dashboard')} onNavigate={setScreen} />
  if (screen === 'prod-wo-detail') return <ProductionWODetail onBack={() => setScreen('prod-work-orders')} onNavigate={setScreen} />
  if (screen === 'prod-material-issue') return <MaterialIssueScreen onBack={() => setScreen('prod-wo-detail')} />
  if (screen === 'prod-batch-create') return <BatchCreationScreen onBack={() => setScreen('prod-dashboard')} />
  if (screen === 'prod-quality-check') return <QualityCheckScreen onBack={() => setScreen('prod-wo-detail')} />
  if (screen === 'prod-wip-movement') return <WIPMovementScreen onBack={() => setScreen('prod-dashboard')} />
  if (screen === 'prod-lookup') return <ProductionLookupScreen onBack={() => setScreen('prod-dashboard')} />
  if (screen === 'prod-sync') return <ProductionSyncScreen onBack={() => setScreen('prod-dashboard')} />

  // Warehouse App Screens (existing)
  if (screen === 'login') return <MobileLogin onLogin={handleLogin} />
  if (screen === 'dashboard') return <MobileDashboard onNavigate={setScreen} operator={operator} stats={stats} device={device} syncStatus={syncStatus} />
  if (screen === 'tasks') return <MobileTasks onOpenTask={handleOpenTask} onBack={() => setScreen('dashboard')} />
  if (screen === 'task-execution') return <MobileTaskExecution task={activeTask} onComplete={() => { setActiveTask(null); setScreen('tasks') }} onBack={() => { setActiveTask(null); setScreen('tasks') }} />
  if (screen === 'inventory-lookup') return <MobileInventoryLookup onBack={() => setScreen('dashboard')} />
  if (screen === 'sync-monitor') return <MobileSyncMonitor onBack={() => setScreen('dashboard')} />
  if (screen === 'notifications') return <MobileNotifications onBack={() => setScreen('dashboard')} />
  if (screen === 'settings') return <MobileSettings onBack={() => setScreen(appMode === 'production' ? 'prod-dashboard' : 'dashboard')} onLogout={handleLogout} />

  if (['receiving', 'putaway', 'picking', 'transfer', 'cyclecount', 'dispatch'].includes(screen)) {
    return <MobileOperationScreen operation={screen} onBack={() => setScreen('dashboard')} onStartTask={handleStartTask} />
  }

  if (screen === 'scan') {
    return <MobileOperationScreen operation="picking" onBack={() => setScreen('dashboard')} onStartTask={handleStartTask} />
  }

  return <MobileDashboard onNavigate={setScreen} operator={operator} stats={stats} device={device} syncStatus={syncStatus} />
}

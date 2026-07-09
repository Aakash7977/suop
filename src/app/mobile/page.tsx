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
  | 'login' | 'dashboard' | 'tasks' | 'scan' | 'task-execution'
  | 'inventory-lookup' | 'sync-monitor' | 'notifications' | 'settings'
  | 'receiving' | 'putaway' | 'picking' | 'transfer' | 'cyclecount' | 'dispatch'

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
export default function MobileApp() {
  const [screen, setScreen] = useState<MobileScreen>('login')
  const [operator, setOperator] = useState({ code: 'OP-001', name: 'Rajesh Kumar', shift: 'Morning (06:00-14:00)' })
  const [activeTask, setActiveTask] = useState<any>(null)

  const stats = { completed: 14, pending: 3, total: 17, accuracy: 98.5, util: 87, hours: 4.5 }
  const device = { battery: 88, online: true, lastSync: '10:30 AM' }
  const syncStatus = { pending: 2, conflicts: 1 }

  const handleLogin = (method: string, code: string) => {
    setOperator({ code, name: 'Rajesh Kumar', shift: 'Morning (06:00-14:00)' })
    setScreen('dashboard')
  }

  const handleOpenTask = (task: any) => {
    setActiveTask(task)
    setScreen('task-execution')
  }

  const handleStartTask = (task: any) => {
    setActiveTask(task)
    setScreen('task-execution')
  }

  if (screen === 'login') return <MobileLogin onLogin={handleLogin} />
  if (screen === 'dashboard') return <MobileDashboard onNavigate={setScreen} operator={operator} stats={stats} device={device} syncStatus={syncStatus} />
  if (screen === 'tasks') return <MobileTasks onOpenTask={handleOpenTask} onBack={() => setScreen('dashboard')} />
  if (screen === 'task-execution') return <MobileTaskExecution task={activeTask} onComplete={() => { setActiveTask(null); setScreen('tasks') }} onBack={() => { setActiveTask(null); setScreen('tasks') }} />
  if (screen === 'inventory-lookup') return <MobileInventoryLookup onBack={() => setScreen('dashboard')} />
  if (screen === 'sync-monitor') return <MobileSyncMonitor onBack={() => setScreen('dashboard')} />
  if (screen === 'notifications') return <MobileNotifications onBack={() => setScreen('dashboard')} />
  if (screen === 'settings') return <MobileSettings onBack={() => setScreen('dashboard')} onLogout={() => setScreen('login')} />

  if (['receiving', 'putaway', 'picking', 'transfer', 'cyclecount', 'dispatch'].includes(screen)) {
    return <MobileOperationScreen operation={screen} onBack={() => setScreen('dashboard')} onStartTask={handleStartTask} />
  }

  if (screen === 'scan') {
    return <MobileOperationScreen operation="picking" onBack={() => setScreen('dashboard')} onStartTask={handleStartTask} />
  }

  return <MobileDashboard onNavigate={setScreen} operator={operator} stats={stats} device={device} syncStatus={syncStatus} />
}

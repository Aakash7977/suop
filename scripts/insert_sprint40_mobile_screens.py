#!/usr/bin/env python3
"""Insert Sprint 40 production screens into src/app/mobile/page.tsx"""

# Read the production screens content
with open('scripts/sprint40-mobile-screens.tsx', 'r') as f:
    screens_content = f.read()

# Read the existing mobile page
with open('src/app/mobile/page.tsx', 'r') as f:
    page_content = f.read()

# Find the MobileApp function (main wrapper)
marker = 'export default function MobileApp()'
idx = page_content.find(marker)
if idx == -1:
    print("ERROR: MobileApp marker not found")
    exit(1)

# Find the end of the file
end_idx = page_content.rfind('}')

# Split content
before = page_content[:idx]
main_wrapper = page_content[idx:]

# Build new main wrapper that handles both warehouse and production modes
new_main_wrapper = '''export default function MobileApp() {
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
'''

# Combine: before + screens + new main wrapper
new_content = before + screens_content + '\n\n' + new_main_wrapper

# Write back
with open('src/app/mobile/page.tsx', 'w') as f:
    f.write(new_content)

print(f"Inserted Sprint 40 production screens")
print(f"Old size: {len(page_content)} chars, New size: {len(new_content)} chars")

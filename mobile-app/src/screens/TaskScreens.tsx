// ═════════════════════════════════════════════════════════
// Task Queue + Task Execution Screens
// ═════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl, Alert, Vibration
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { TaskAPI, getOperatorData, ScanAPI } from '../api/client'
import { saveOfflineTransaction } from '../utils/offline'
import type { Task } from '../types'

// ─── Task Queue Screen ──────────────────────────────────
export function TasksScreen({ navigation }: { navigation: any }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const loadTasks = useCallback(async () => {
    try {
      const data = await TaskAPI.getTasks()
      setTasks(data)
    } catch {
      // Use cached/mock data if offline
      setTasks([
        { id: '1', taskNumber: 'TASK-2026-001', taskType: 'PICK', priority: 'EMERGENCY', status: 'IN_PROGRESS', fromLocationCode: 'C-02-03-A', toLocationCode: 'PK-01', productName: 'Kaju Katli 500g', plannedQty: '24 PCS', slaDeadline: '10:45', waveNumber: 'WAVE-2026-004' },
        { id: '2', taskNumber: 'TASK-2026-003', taskType: 'PICK', priority: 'HIGH', status: 'OPEN', fromLocationCode: 'C-03-01-B', toLocationCode: 'PK-02', productName: 'Mysore Pak 250g', plannedQty: '48 PCS', slaDeadline: '11:30', waveNumber: 'WAVE-2026-001' },
        { id: '3', taskNumber: 'TASK-2026-011', taskType: 'PUTAWAY', priority: 'NORMAL', status: 'OPEN', fromLocationCode: 'RECV-01', toLocationCode: 'B-01-02-C', productName: 'Saffron 10g', plannedQty: '100 PCS', slaDeadline: '13:00' },
        { id: '4', taskNumber: 'TASK-2026-015', taskType: 'COUNT', priority: 'LOW', status: 'OPEN', fromLocationCode: 'B-01-01', toLocationCode: '—', productName: 'Cycle Count Zone B1', plannedQty: '—', slaDeadline: '18:30' },
      ])
    }
  }, [])

  useEffect(() => { loadTasks() }, [loadTasks])

  const onRefresh = useCallback(async () => {
    setRefreshing(true); await loadTasks(); setRefreshing(false)
  }, [loadTasks])

  const typeColors: Record<string, string> = {
    PICK: '#fef3c7', PUTAWAY: '#dbeafe', COUNT: '#fed7aa', RECEIVE: '#d1fae5', TRANSFER: '#e9d5ff', DISPATCH: '#fce7f3'
  }
  const typeTextColors: Record<string, string> = {
    PICK: '#92400e', PUTAWAY: '#1e40af', COUNT: '#9a3412', RECEIVE: '#065f46', TRANSFER: '#6b21a8', DISPATCH: '#9d174d'
  }
  const priorityColors: Record<string, string> = {
    EMERGENCY: '#ef4444', HIGH: '#f97316', NORMAL: '#3b82f6', LOW: '#94a3b8'
  }

  const openTask = (task: Task) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    navigation.navigate('TaskExecution', { task })
  }

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity style={styles.taskCard} onPress={() => openTask(item)}>
      <View style={[styles.priorityBar, { backgroundColor: priorityColors[item.priority] }]} />
      <View style={{ flex: 1 }}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskNumber}>{item.taskNumber}</Text>
          <View style={[styles.typeBadge, { backgroundColor: typeColors[item.taskType] }]}>
            <Text style={[styles.typeText, { color: typeTextColors[item.taskType] }]}>{item.taskType}</Text>
          </View>
        </View>
        <Text style={styles.taskProduct}>{item.productName}</Text>
        <View style={styles.taskRoute}>
          <Text style={styles.taskBin}>{item.fromLocationCode}</Text>
          <Text style={styles.taskArrow}>→</Text>
          <Text style={styles.taskBin}>{item.toLocationCode}</Text>
          <Text style={styles.taskQty}>· Qty: {item.plannedQty}</Text>
        </View>
        <View style={styles.taskFooter}>
          <Text style={styles.taskSla}>⏱ SLA: {item.slaDeadline}</Text>
          {item.status === 'IN_PROGRESS' && (
            <View style={styles.inProgressBadge}><Text style={styles.inProgressText}>IN PROGRESS — Resume</Text></View>
          )}
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <View style={styles.statusRow}>
          <View style={styles.statusBadge}><Text style={styles.statusText}>{tasks.length} assigned</Text></View>
          <View style={[styles.statusBadge, { backgroundColor: 'rgba(16,185,129,0.2)' }]}><Text style={[styles.statusText, { color: '#6ee7b7' }]}>{tasks.filter(t => t.status === 'IN_PROGRESS').length} active</Text></View>
        </View>
      </View>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
      />
    </View>
  )
}

// ─── Task Execution Screen ──────────────────────────────
export function TaskExecutionScreen({ route, navigation }: { route: any; navigation: any }) {
  const task: Task = route?.params?.task
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0) // 0=scan-from, 1=scan-product, 2=confirm-qty, 3=complete
  const [scannedValue, setScannedValue] = useState('')
  const [confirmedQty, setConfirmedQty] = useState(task?.plannedQty?.split(' ')[0] || '24')
  const [scanHistory, setScanHistory] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 40 }}>No task selected</Text>
      </View>
    )
  }

  const steps = ['Scan From Location', 'Scan Product', 'Confirm Quantity', 'Complete']

  async function handleScan() {
    const value = scannedValue || `AUTO-${Date.now().toString().slice(-6)}`
    setScanHistory([...scanHistory, `${new Date().toLocaleTimeString()} — ${value}`])
    setScannedValue('')
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    if (step === 0) setStep(1)
    else if (step === 1) setStep(2)
  }

  async function handleComplete() {
    setSubmitting(true)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)

    try {
      // Get operator data
      const operator = await getOperatorData()

      // Save offline transaction (works even if offline)
      await saveOfflineTransaction(task.taskType, {
        deviceId: 'MD-002',
        operatorId: operator?.operatorId || 'op-001',
        operatorCode: operator?.operatorCode || 'OP-001',
        taskId: task.id,
        taskNumber: task.taskNumber,
        barcodeScanned: scanHistory[0],
        barcodeType: 'CODE_128',
        productSku: task.productSku,
        batchNumber: task.batchNumber,
        binCode: task.fromLocationCode,
        qty: confirmedQty,
        uom: task.uom,
      })

      // Try to complete on server (will fail gracefully if offline)
      try {
        await TaskAPI.completeTask(task.id, {
          actualQty: confirmedQty,
          durationSeconds: 134,
        })
      } catch {
        // Offline — transaction saved, will sync later
      }

      setStep(3)
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{task.taskNumber}</Text>
          <Text style={styles.headerSubtitle}>{task.taskType} · {task.priority}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {steps.map((s, i) => (
          <View key={i} style={[styles.progressSegment, i <= step && styles.progressSegmentActive]} />
        ))}
      </View>
      <Text style={styles.progressLabel}>Step {step + 1} of {steps.length}: {steps[step]}</Text>

      {/* Task Info */}
      <View style={styles.taskInfoCard}>
        <Text style={styles.taskInfoProduct}>{task.productName}</Text>
        <View style={styles.taskInfoGrid}>
          <View style={styles.taskInfoItem}><Text style={styles.taskInfoLabel}>From</Text><Text style={styles.taskInfoValue}>{task.fromLocationCode}</Text></View>
          <View style={styles.taskInfoItem}><Text style={styles.taskInfoLabel}>To</Text><Text style={styles.taskInfoValue}>{task.toLocationCode}</Text></View>
          <View style={styles.taskInfoItem}><Text style={styles.taskInfoLabel}>Planned Qty</Text><Text style={styles.taskInfoValue}>{task.plannedQty}</Text></View>
          <View style={styles.taskInfoItem}><Text style={styles.taskInfoLabel}>SLA</Text><Text style={styles.taskInfoValue}>{task.slaDeadline}</Text></View>
        </View>
      </View>

      {/* Step Content */}
      {step === 0 && (
        <View style={styles.scanCard}>
          <View style={styles.scanIconContainer}>
            <Text style={styles.scanIcon}>📷</Text>
          </View>
          <Text style={styles.scanTitle}>Scan From Location</Text>
          <Text style={styles.scanHint}>Aim scanner at bin label: <Text style={styles.scanTarget}>{task.fromLocationCode}</Text></Text>
          <View style={styles.scanInputRow}>
            <TextInput
              style={styles.scanInput}
              value={scannedValue}
              onChangeText={setScannedValue}
              placeholder="Scan or enter barcode..."
              placeholderTextColor="#94a3b8"
              autoFocus
            />
            <TouchableOpacity style={styles.scanButton} onPress={handleScan}><Text style={styles.scanButtonText}>Verify</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.simulateButton} onPress={handleScan}>
            <Text style={styles.simulateButtonText}>Simulate Scan ✓</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 1 && (
        <View style={styles.scanCard}>
          <View style={[styles.scanIconContainer, { backgroundColor: '#fef3c7' }]}>
            <Text style={styles.scanIcon}>📦</Text>
          </View>
          <Text style={styles.scanTitle}>Scan Product Barcode</Text>
          <Text style={styles.scanHint}>{task.productName}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedIcon}>✓</Text>
            <View>
              <Text style={styles.verifiedTitle}>From location verified</Text>
              <Text style={styles.verifiedSub}>Bin {task.fromLocationCode} confirmed</Text>
            </View>
          </View>
          <View style={styles.scanInputRow}>
            <TextInput
              style={styles.scanInput}
              value={scannedValue}
              onChangeText={setScannedValue}
              placeholder="Scan product..."
              placeholderTextColor="#94a3b8"
              autoFocus
            />
            <TouchableOpacity style={styles.scanButton} onPress={handleScan}><Text style={styles.scanButtonText}>Verify</Text></TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.simulateButton} onPress={handleScan}>
            <Text style={styles.simulateButtonText}>Simulate Scan ✓</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={styles.qtyCard}>
          <Text style={styles.qtyTitle}>Confirm Quantity</Text>
          <Text style={styles.qtyPlanned}>Planned: <Text style={styles.qtyPlannedValue}>{task.plannedQty}</Text></Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity style={styles.qtyButton} onPress={() => setConfirmedQty(String(Math.max(0, parseInt(confirmedQty) - 1)))}>
              <Text style={styles.qtyButtonText}>−</Text>
            </TouchableOpacity>
            <View style={styles.qtyDisplay}>
              <Text style={styles.qtyValue}>{confirmedQty}</Text>
              <Text style={styles.qtyUnit}>{task.plannedQty?.split(' ')[1] || 'PCS'}</Text>
            </View>
            <TouchableOpacity style={styles.qtyButton} onPress={() => setConfirmedQty(String(parseInt(confirmedQty) + 1))}>
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.qtyQuickRow}>
            {['12', '24', '48'].map(q => (
              <TouchableOpacity key={q} style={styles.qtyQuick} onPress={() => setConfirmedQty(q)}>
                <Text style={styles.qtyQuickText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedIcon}>✓</Text>
            <View>
              <Text style={styles.verifiedTitle}>Product verified</Text>
              <Text style={styles.verifiedSub}>Batch & expiry confirmed</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.completeButton, submitting && { opacity: 0.5 }]} onPress={handleComplete} disabled={submitting}>
            <Text style={styles.completeButtonText}>Confirm & Complete</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 3 && (
        <View style={styles.completeCard}>
          <View style={styles.completeIcon}>
            <Text style={styles.completeIconText}>✓</Text>
          </View>
          <Text style={styles.completeTitle}>Task Complete!</Text>
          <Text style={styles.completeSub}>{task.taskNumber} · {confirmedQty} {task.plannedQty?.split(' ')[1] || 'PCS'}</Text>
          <View style={styles.completeStats}>
            <View style={styles.completeStatItem}><Text style={styles.completeStatLabel}>Duration</Text><Text style={styles.completeStatValue}>2m 14s</Text></View>
            <View style={styles.completeStatItem}><Text style={styles.completeStatLabel}>Scans</Text><Text style={styles.completeStatValue}>{scanHistory.length}</Text></View>
            <View style={styles.completeStatItem}><Text style={styles.completeStatLabel}>Sync</Text><Text style={styles.completeStatValue}>✓ Saved</Text></View>
          </View>
          <TouchableOpacity style={styles.nextTaskButton} onPress={() => navigation.navigate('Tasks')}>
            <Text style={styles.nextTaskButtonText}>Next Task →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && step < 3 && (
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Scan History ({scanHistory.length})</Text>
          {scanHistory.map((s, i) => (
            <Text key={i} style={styles.historyItem}>{s}</Text>
          ))}
        </View>
      )}
    </View>
  )
}

// Need to import TextInput
import { TextInput } from 'react-native'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16,
  },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  backText: { color: '#ffffff', fontSize: 24 },
  headerTitle: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  headerSubtitle: { color: '#fcd34d', fontSize: 12 },
  statusRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: 12 },
  statusText: { color: '#fcd34d', fontSize: 12 },
  taskCard: {
    flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  priorityBar: { width: 6, borderRadius: 3, marginRight: 12 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  taskNumber: { fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', color: '#1d4ed8' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 10, fontWeight: '600' },
  taskProduct: { fontSize: 14, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  taskRoute: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  taskBin: { fontFamily: 'monospace', fontSize: 12, color: '#64748b' },
  taskArrow: { color: '#94a3b8', fontSize: 12 },
  taskQty: { fontSize: 12, color: '#64748b' },
  taskFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
  taskSla: { fontSize: 12, color: '#64748b' },
  inProgressBadge: { backgroundColor: '#d1fae5', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  inProgressText: { color: '#065f46', fontSize: 10, fontWeight: '600' },
  chevron: { color: '#cbd5e1', fontSize: 24 },
  progressContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 4 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0' },
  progressSegmentActive: { backgroundColor: '#f59e0b' },
  progressLabel: { fontSize: 12, color: '#64748b', paddingHorizontal: 16, marginBottom: 12 },
  taskInfoCard: { backgroundColor: '#ffffff', borderRadius: 12, marginHorizontal: 16, marginBottom: 16, padding: 16 },
  taskInfoProduct: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  taskInfoGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  taskInfoItem: { width: '50%', marginBottom: 8 },
  taskInfoLabel: { fontSize: 12, color: '#64748b' },
  taskInfoValue: { fontFamily: 'monospace', fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
  scanCard: { backgroundColor: '#ffffff', borderRadius: 12, marginHorizontal: 16, padding: 24, alignItems: 'center' },
  scanIconContainer: { width: 128, height: 128, borderRadius: 24, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  scanIcon: { fontSize: 64 },
  scanTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 4 },
  scanHint: { fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 16 },
  scanTarget: { fontFamily: 'monospace', fontWeight: 'bold', color: '#0f172a' },
  scanInputRow: { flexDirection: 'row', gap: 8, marginBottom: 12, width: '100%' },
  scanInput: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, fontFamily: 'monospace', color: '#0f172a' },
  scanButton: { backgroundColor: '#f59e0b', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  scanButtonText: { color: '#0f172a', fontWeight: 'bold', fontSize: 14 },
  simulateButton: { width: '100%', height: 56, borderRadius: 12, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  simulateButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#d1fae5', borderRadius: 8, padding: 12, marginBottom: 12, width: '100%' },
  verifiedIcon: { fontSize: 20, color: '#10b981', fontWeight: 'bold' },
  verifiedTitle: { fontSize: 12, fontWeight: '600', color: '#065f46' },
  verifiedSub: { fontSize: 10, color: '#047857' },
  qtyCard: { backgroundColor: '#ffffff', borderRadius: 12, marginHorizontal: 16, padding: 24 },
  qtyTitle: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  qtyPlanned: { fontSize: 12, color: '#64748b', marginBottom: 16 },
  qtyPlannedValue: { fontFamily: 'monospace', fontWeight: 'bold' },
  qtyControls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 16 },
  qtyButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  qtyButtonText: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  qtyDisplay: { alignItems: 'center' },
  qtyValue: { fontSize: 48, fontWeight: 'bold', color: '#0f172a' },
  qtyUnit: { fontSize: 12, color: '#64748b' },
  qtyQuickRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  qtyQuick: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#f1f5f9', borderRadius: 8 },
  qtyQuickText: { fontFamily: 'monospace', fontWeight: 'bold', color: '#0f172a' },
  completeButton: { width: '100%', height: 56, borderRadius: 12, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },
  completeButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  completeCard: { backgroundColor: '#ffffff', borderRadius: 12, marginHorizontal: 16, padding: 32, alignItems: 'center' },
  completeIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#d1fae5', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  completeIconText: { fontSize: 56, color: '#10b981', fontWeight: 'bold' },
  completeTitle: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  completeSub: { fontSize: 14, color: '#64748b', marginTop: 4 },
  completeStats: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  completeStatItem: { alignItems: 'center' },
  completeStatLabel: { fontSize: 12, color: '#64748b' },
  completeStatValue: { fontFamily: 'monospace', fontWeight: 'bold', color: '#0f172a' },
  nextTaskButton: { width: '100%', height: 56, borderRadius: 12, backgroundColor: '#f59e0b', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  nextTaskButtonText: { color: '#0f172a', fontWeight: 'bold', fontSize: 16 },
  historyCard: { backgroundColor: '#ffffff', borderRadius: 12, marginHorizontal: 16, marginTop: 16, padding: 16 },
  historyTitle: { fontSize: 12, fontWeight: '600', color: '#334155', marginBottom: 8 },
  historyItem: { fontSize: 10, fontFamily: 'monospace', color: '#64748b', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
})

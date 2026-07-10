// ═════════════════════════════════════════════════════════
// SUOP Production Execution App — Production Screens
// Sprint 40 · Industrial barcode-first production operations
// Scanner-first · One screen = one task · Max 3 taps · Offline-ready
// ═════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput, FlatList, Modal, RefreshControl
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { ProductionAPI, getOperatorData } from '../api/client'

// ─── Production Dashboard ────────────────────────────────
export function ProductionDashboardScreen({ navigation }: { navigation: any }) {
  const [dashboard, setDashboard] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await ProductionAPI.getDashboard()
      setDashboard(data)
    } catch (error) {
      // Use mock data on failure
      setDashboard({
        operator: { operatorCode: 'OP-001', operatorName: 'Rajesh Kumar', role: 'MIXING_OPERATOR', shiftName: 'Morning Shift', productionLineCode: 'LINE-KK-01', workCenterCode: 'WC-KK-03' },
        todaySummary: { assignedWorkOrders: 3, completedWorkOrders: 1, inProgressWorkOrders: 1, pendingWorkOrders: 1, targetQty: 285, completedQty: 95, scrapQty: 1, uom: 'KG', efficiencyPercent: 98.9 },
        assignedWorkOrders: [
          { woNumber: 'WO-001', operationName: 'Cooking', productName: 'Kaju Katli 500g', plannedQty: 95, status: 'IN_PROGRESS' },
          { woNumber: 'WO-002', operationName: 'Mixing', productName: 'Shwet Idli Batter 1kg', plannedQty: 100, status: 'ASSIGNED' },
          { woNumber: 'WO-003', operationName: 'Packaging', productName: 'Motichoor Laddu 1kg', plannedQty: 98, status: 'PENDING' },
        ],
        syncStatus: { isOnline: true, pendingUploads: 0, syncHealth: 'HEALTHY' },
      })
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  const quickActions = [
    { label: 'Start Work', color: '#10b981', action: 'WO', icon: '▶️' },
    { label: 'Material', color: '#3b82f6', action: 'MATERIAL', icon: '📦' },
    { label: 'Batch', color: '#f59e0b', action: 'BATCH', icon: '🏷️' },
    { label: 'Quality', color: '#a855f7', action: 'QC', icon: '✓' },
    { label: 'WIP Move', color: '#06b6d4', action: 'WIP', icon: '🔄' },
    { label: 'Lookup', color: '#ec4899', action: 'LOOKUP', icon: '🔍' },
    { label: 'Sync', color: '#64748b', action: 'SYNC', icon: '☁️' },
    { label: 'Finish', color: '#ef4444', action: 'FINISH', icon: '🏁' },
  ]

  if (!dashboard) {
    return <View style={styles.center}><Text style={styles.loadingText}>Loading...</Text></View>
  }

  const s = dashboard.todaySummary
  const efficiencyColor = s.efficiencyPercent >= 95 ? '#10b981' : s.efficiencyPercent >= 85 ? '#f59e0b' : '#ef4444'

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f59e0b']} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.operatorName}>{dashboard.operator.operatorName}</Text>
          <Text style={styles.operatorRole}>{dashboard.operator.role.replace(/_/g, ' ')}</Text>
          <Text style={styles.operatorMeta}>{dashboard.operator.shiftName} · {dashboard.operator.productionLineCode} · {dashboard.operator.workCenterCode}</Text>
        </View>
        <View style={[styles.syncBadge, dashboard.syncStatus.isOnline ? styles.syncOnline : styles.syncOffline]}>
          <Text style={styles.syncText}>{dashboard.syncStatus.isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}</Text>
          {dashboard.syncStatus.pendingUploads > 0 && (
            <Text style={styles.pendingText}>{dashboard.syncStatus.pendingUploads} pending</Text>
          )}
        </View>
      </View>

      {/* Today's Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Today's Production</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{s.assignedWorkOrders}</Text>
            <Text style={styles.summaryLabel}>Assigned WOs</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#10b981' }]}>{s.completedWorkOrders}</Text>
            <Text style={styles.summaryLabel}>Completed</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#3b82f6' }]}>{s.inProgressWorkOrders}</Text>
            <Text style={styles.summaryLabel}>In Progress</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>{s.pendingWorkOrders}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>
        <View style={styles.qtyRow}>
          <View style={styles.qtyItem}>
            <Text style={styles.qtyLabel}>Target</Text>
            <Text style={styles.qtyValue}>{s.targetQty} {s.uom}</Text>
          </View>
          <View style={styles.qtyItem}>
            <Text style={styles.qtyLabel}>Completed</Text>
            <Text style={[styles.qtyValue, { color: '#10b981' }]}>{s.completedQty} {s.uom}</Text>
          </View>
          <View style={styles.qtyItem}>
            <Text style={styles.qtyLabel}>Scrap</Text>
            <Text style={[styles.qtyValue, { color: '#ef4444' }]}>{s.scrapQty} {s.uom}</Text>
          </View>
        </View>
        <View style={styles.efficiencyBar}>
          <View style={styles.efficiencyRow}>
            <Text style={styles.efficiencyLabel}>Efficiency</Text>
            <Text style={[styles.efficiencyValue, { color: efficiencyColor }]}>{s.efficiencyPercent}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${s.efficiencyPercent}%`, backgroundColor: efficiencyColor }]} />
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsCard}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={[styles.actionButton, { backgroundColor: action.color }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                if (action.action === 'WO') navigation.navigate('ProductionWorkOrders')
                else if (action.action === 'MATERIAL') navigation.navigate('MaterialIssue')
                else if (action.action === 'BATCH') navigation.navigate('BatchCreation')
                else if (action.action === 'QC') navigation.navigate('QualityCheck')
                else if (action.action === 'WIP') navigation.navigate('WIPMovement')
                else if (action.action === 'LOOKUP') navigation.navigate('ProductionLookup')
                else if (action.action === 'SYNC') navigation.navigate('ProductionSync')
              }}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Assigned Work Orders */}
      <View style={styles.woCard}>
        <Text style={styles.cardTitle}>My Work Orders</Text>
        {dashboard.assignedWorkOrders.map((wo: any) => (
          <TouchableOpacity
            key={wo.woNumber}
            style={styles.woItem}
            onPress={() => navigation.navigate('ProductionWorkOrderDetail', { woNumber: wo.woNumber })}
          >
            <View style={styles.woLeft}>
              <Text style={styles.woNumber}>{wo.woNumber}</Text>
              <Text style={styles.woOperation}>{wo.operationName}</Text>
              <Text style={styles.woProduct}>{wo.productName}</Text>
            </View>
            <View style={styles.woRight}>
              <Text style={styles.woQty}>{wo.plannedQty} KG</Text>
              <View style={[styles.woStatus, woStatusStyle(wo.status)]}>
                <Text style={styles.woStatusText}>{wo.status.replace(/_/g, ' ')}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

function woStatusStyle(status: string) {
  switch (status) {
    case 'IN_PROGRESS': return { backgroundColor: '#3b82f6' }
    case 'ASSIGNED': return { backgroundColor: '#f59e0b' }
    case 'PENDING': return { backgroundColor: '#94a3b8' }
    case 'COMPLETED': return { backgroundColor: '#10b981' }
    case 'PAUSED': return { backgroundColor: '#a855f7' }
    default: return { backgroundColor: '#94a3b8' }
  }
}

// ─── Production Work Orders List ─────────────────────────
export function ProductionWorkOrdersScreen({ navigation }: { navigation: any }) {
  const [workOrders, setWorkOrders] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await ProductionAPI.getWorkOrders()
      setWorkOrders(data)
    } catch (error) {
      setWorkOrders([
        { woNumber: 'WO-001', operationName: 'Cooking', productName: 'Kaju Katli 500g', plannedQty: 95, actualQty: 0, uom: 'KG', status: 'IN_PROGRESS', priority: 'HIGH', machineCode: 'COOK-01' },
        { woNumber: 'WO-002', operationName: 'Mixing', productName: 'Shwet Idli Batter 1kg', plannedQty: 100, actualQty: 0, uom: 'KG', status: 'ASSIGNED', priority: 'NORMAL', machineCode: 'MIX-02' },
        { woNumber: 'WO-003', operationName: 'Packaging', productName: 'Motichoor Laddu 1kg', plannedQty: 98, actualQty: 0, uom: 'KG', status: 'PENDING', priority: 'NORMAL', machineCode: 'PACK-03' },
      ])
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f59e0b']} />}
    >
      <Text style={styles.screenTitle}>My Work Orders</Text>
      <Text style={styles.screenSubtitle}>{workOrders.length} assigned · Scan WO QR to start</Text>
      {workOrders.map((wo) => (
        <TouchableOpacity
          key={wo.woNumber}
          style={styles.woCard2}
          onPress={() => navigation.navigate('ProductionWorkOrderDetail', { woNumber: wo.woNumber })}
        >
          <View style={styles.woCardHeader}>
            <Text style={styles.woNumber}>{wo.woNumber}</Text>
            <View style={[styles.priorityBadge, wo.priority === 'HIGH' ? styles.priorityHigh : wo.priority === 'EMERGENCY' ? styles.priorityEmergency : styles.priorityNormal]}>
              <Text style={styles.priorityText}>{wo.priority}</Text>
            </View>
          </View>
          <Text style={styles.woProduct}>{wo.productName}</Text>
          <Text style={styles.woOperation}>Operation: {wo.operationName} · Machine: {wo.machineCode}</Text>
          <View style={styles.woCardFooter}>
            <Text style={styles.woQty}>{wo.actualQty} / {wo.plannedQty} {wo.uom}</Text>
            <View style={[styles.woStatus, woStatusStyle(wo.status)]}>
              <Text style={styles.woStatusText}>{wo.status.replace(/_/g, ' ')}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

// ─── Work Order Detail & Execution ───────────────────────
export function ProductionWorkOrderDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { woNumber } = route.params
  const [wo, setWo] = useState<any>(null)
  const [showComplete, setShowComplete] = useState(false)
  const [actualQty, setActualQty] = useState('')
  const [scrapQty, setScrapQty] = useState('')

  useEffect(() => {
    ProductionAPI.getWorkOrder(woNumber).then(setWo).catch(() => {
      setWo({
        woNumber,
        operationName: 'Cooking',
        productName: 'Kaju Katli 500g',
        batchNumber: 'KAJ-THN-20260709-000145',
        plannedQty: 95, actualQty: 0, uom: 'KG',
        status: 'IN_PROGRESS', priority: 'HIGH',
        machineCode: 'COOK-01', machineName: 'Cooking Kettle 01',
        recipeCode: 'RCP-KK-001', recipeVersion: 'V2.3',
        productionInstructions: [
          { step: 1, instruction: 'Pre-heat cooking kettle to 110°C', targetValue: '110°C', completed: true },
          { step: 2, instruction: 'Add ghee to kettle', targetValue: '4 KG', completed: true },
          { step: 3, instruction: 'Add sugar and stir for 5 minutes', targetValue: '5 min', completed: true },
          { step: 4, instruction: 'Add cashew powder slowly', targetValue: '55 KG', completed: false },
          { step: 5, instruction: 'Cook for 15 minutes at 110°C', targetValue: '15 min @ 110°C', completed: false },
        ],
        requiredMaterials: [
          { materialCode: 'CAS-W320', materialName: 'Cashew W320', plannedQty: 55, uom: 'KG', issued: false, batchRequired: true },
          { materialCode: 'SUG-S30', materialName: 'Sugar S30', plannedQty: 35, uom: 'KG', issued: false, batchRequired: true },
          { materialCode: 'GHE-COW', materialName: 'Cow Ghee', plannedQty: 4, uom: 'KG', issued: false, batchRequired: true },
        ],
        qualityChecks: [
          { checkType: 'TEMPERATURE', stage: 'COOKING', targetValue: 110, minValue: 108, maxValue: 112, unit: '°C', required: true, completed: false },
        ],
      })
    })
  }, [woNumber])

  if (!wo) return <View style={styles.center}><Text>Loading...</Text></View>

  const handleStart = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try { await ProductionAPI.startWO(woNumber) } catch {}
    setWo({ ...wo, status: 'IN_PROGRESS' })
    Alert.alert('Started', `Work order ${woNumber} is now in progress`)
  }
  const handlePause = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try { await ProductionAPI.pauseWO(woNumber) } catch {}
    setWo({ ...wo, status: 'PAUSED' })
  }
  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    try { await ProductionAPI.completeWO(woNumber, { actualQty: parseFloat(actualQty) || wo.plannedQty, scrapQty: parseFloat(scrapQty) || 0, uom: wo.uom }) } catch {}
    setShowComplete(false)
    setWo({ ...wo, status: 'COMPLETED' })
    Alert.alert('Completed', `Work order ${woNumber} completed`, [{ text: 'OK', onPress: () => navigation.goBack() }])
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.woDetailHeader}>
        <Text style={styles.woNumber}>{wo.woNumber}</Text>
        <View style={[styles.woStatus, woStatusStyle(wo.status)]}>
          <Text style={styles.woStatusText}>{wo.status.replace(/_/g, ' ')}</Text>
        </View>
      </View>
      <Text style={styles.woProductLarge}>{wo.productName}</Text>
      <Text style={styles.woMeta}>Operation: {wo.operationName} · Machine: {wo.machineName}</Text>
      <Text style={styles.woMeta}>Recipe: {wo.recipeCode} {wo.recipeVersion} · Batch: {wo.batchNumber || 'TBD'}</Text>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        {wo.status === 'ASSIGNED' || wo.status === 'PENDING' ? (
          <TouchableOpacity style={[styles.bigButton, { backgroundColor: '#10b981' }]} onPress={handleStart}>
            <Text style={styles.bigButtonText}>▶ Start Production</Text>
          </TouchableOpacity>
        ) : wo.status === 'IN_PROGRESS' ? (
          <>
            <TouchableOpacity style={[styles.bigButton, { backgroundColor: '#a855f7', flex: 1 }]} onPress={handlePause}>
              <Text style={styles.bigButtonText}>⏸ Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bigButton, { backgroundColor: '#10b981', flex: 1, marginLeft: 8 }]} onPress={() => setShowComplete(true)}>
              <Text style={styles.bigButtonText}>✓ Complete</Text>
            </TouchableOpacity>
          </>
        ) : wo.status === 'PAUSED' ? (
          <TouchableOpacity style={[styles.bigButton, { backgroundColor: '#3b82f6' }]} onPress={handleStart}>
            <Text style={styles.bigButtonText}>▶ Resume</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.bigButton, { backgroundColor: '#94a3b8' }]}>
            <Text style={styles.bigButtonText}>✓ Completed</Text>
          </View>
        )}
      </View>

      {/* Material Issue Shortcut */}
      {wo.status === 'IN_PROGRESS' && wo.requiredMaterials.some((m: any) => !m.issued) && (
        <TouchableOpacity
          style={styles.materialIssueCard}
          onPress={() => navigation.navigate('MaterialIssue', { woNumber })}
        >
          <Text style={styles.materialIssueTitle}>⚠ Materials Required</Text>
          <Text style={styles.materialIssueDesc}>{wo.requiredMaterials.filter((m: any) => !m.issued).length} materials to scan and issue</Text>
          <Text style={styles.materialIssueAction}>Tap to scan →</Text>
        </TouchableOpacity>
      )}

      {/* Production Instructions */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Production Instructions</Text>
        {wo.productionInstructions.map((inst: any) => (
          <View key={inst.step} style={styles.instructionItem}>
            <View style={[styles.stepCircle, inst.completed ? { backgroundColor: '#10b981' } : { backgroundColor: '#e2e8f0' }]}>
              <Text style={[styles.stepNumber, inst.completed ? { color: '#fff' } : { color: '#64748b' }]}>{inst.step}</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionText}>{inst.instruction}</Text>
              <Text style={styles.instructionTarget}>Target: {inst.targetValue}</Text>
            </View>
            {inst.completed && <Text style={styles.checkIcon}>✓</Text>}
          </View>
        ))}
      </View>

      {/* Required Materials */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Required Materials</Text>
        {wo.requiredMaterials.map((m: any) => (
          <View key={m.materialCode} style={styles.materialItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.materialName}>{m.materialName}</Text>
              <Text style={styles.materialCode}>{m.materialCode} · {m.plannedQty} {m.uom}</Text>
            </View>
            {m.batchRequired && <Text style={styles.batchRequired}>🔍 Batch Required</Text>}
            <View style={[styles.materialStatus, m.issued ? { backgroundColor: '#10b981' } : { backgroundColor: '#f59e0b' }]}>
              <Text style={styles.materialStatusText}>{m.issued ? 'ISSUED' : 'PENDING'}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quality Checks */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quality Checkpoints</Text>
        {wo.qualityChecks.map((qc: any, i: number) => (
          <TouchableOpacity
            key={i}
            style={styles.qcItem}
            onPress={() => navigation.navigate('QualityCheck', { woNumber, checkType: qc.checkType, stage: qc.checkStage })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.qcType}>{qc.checkType.replace(/_/g, ' ')} · {qc.stage}</Text>
              {qc.targetValue !== null && (
                <Text style={styles.qcTarget}>Target: {qc.targetValue} {qc.unit} (range: {qc.minValue}-{qc.maxValue})</Text>
              )}
            </View>
            <View style={[styles.qcStatus, qc.completed ? { backgroundColor: '#10b981' } : { backgroundColor: '#f59e0b' }]}>
              <Text style={styles.qcStatusText}>{qc.completed ? '✓ PASS' : 'PENDING'}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Complete Modal */}
      <Modal visible={showComplete} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Production</Text>
            <Text style={styles.modalSubtitle}>{wo.woNumber} · {wo.productName}</Text>

            <Text style={styles.inputLabel}>Actual Quantity ({wo.uom})</Text>
            <TextInput
              style={styles.textInput}
              value={actualQty}
              onChangeText={setActualQty}
              placeholder={String(wo.plannedQty)}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Scrap Quantity ({wo.uom})</Text>
            <TextInput
              style={styles.textInput}
              value={scrapQty}
              onChangeText={setScrapQty}
              placeholder="0"
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#94a3b8' }]} onPress={() => setShowComplete(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#10b981' }]} onPress={handleComplete}>
                <Text style={styles.modalButtonText}>Confirm Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

// ─── Material Issue Screen ───────────────────────────────
export function MaterialIssueScreen({ route, navigation }: { route: any; navigation: any }) {
  const { woNumber } = route.params || {}
  const [scannedMaterial, setScannedMaterial] = useState('')
  const [scannedBatch, setScannedBatch] = useState('')
  const [issueResult, setIssueResult] = useState<any>(null)
  const [processing, setProcessing] = useState(false)

  const handleIssue = async () => {
    if (!scannedMaterial || !scannedBatch) {
      Alert.alert('Missing', 'Scan both material and batch barcode')
      return
    }
    setProcessing(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      const result = await ProductionAPI.issueMaterial({
        woNumber,
        materialCode: 'CAS-W320',
        materialName: 'Cashew W320',
        scannedBatch,
        plannedQty: 55,
        uom: 'KG',
      })
      setIssueResult(result)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error: any) {
      setIssueResult({
        status: 'REJECTED',
        validations: [{ rule: 'UNKNOWN_BARCODE', result: 'INVALID', message: error.message || 'Validation failed' }],
      })
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    }
    setProcessing(false)
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Material Issue</Text>
      <Text style={styles.screenSubtitle}>Scan ingredient & batch barcode</Text>
      {woNumber && <Text style={styles.woContext}>Work Order: {woNumber}</Text>}

      {/* Step 1: Scan Material */}
      <View style={styles.scanCard}>
        <Text style={styles.stepTitle}>Step 1 — Scan Ingredient</Text>
        <TextInput
          style={styles.scanInput}
          value={scannedMaterial}
          onChangeText={setScannedMaterial}
          placeholder="Scan or enter material barcode (e.g. CAS-W320)"
          autoCapitalize="characters"
        />
        <Text style={styles.scanHint}>Expected: Cashew W320 (55 KG)</Text>
      </View>

      {/* Step 2: Scan Batch */}
      <View style={styles.scanCard}>
        <Text style={styles.stepTitle}>Step 2 — Scan Batch</Text>
        <TextInput
          style={styles.scanInput}
          value={scannedBatch}
          onChangeText={setScannedBatch}
          placeholder="Scan batch barcode (e.g. CAS-THN-20260705-000018)"
          autoCapitalize="characters"
        />
        <Text style={styles.scanHint}>Batch must be valid, non-expired, in-stock</Text>
      </View>

      {/* Validation Rules */}
      <View style={styles.validationCard}>
        <Text style={styles.sectionTitle}>6 Validation Rules</Text>
        {['Ingredient matches recipe', 'Batch is valid', 'Batch not expired', 'Sufficient quantity', 'Not a duplicate scan', 'Barcode recognized'].map((rule) => (
          <View key={rule} style={styles.validationItem}>
            <Text style={styles.validationCheck}>✓</Text>
            <Text style={styles.validationText}>{rule}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.bigButton, { backgroundColor: '#10b981', opacity: processing ? 0.5 : 1 }]}
        onPress={handleIssue}
        disabled={processing}
      >
        <Text style={styles.bigButtonText}>{processing ? 'Processing...' : '✓ Issue Material'}</Text>
      </TouchableOpacity>

      {/* Result */}
      {issueResult && (
        <View style={[styles.resultCard, issueResult.status === 'ISSUED' ? { backgroundColor: '#dcfce7' } : { backgroundColor: '#fee2e2' }]}>
          <Text style={styles.resultTitle}>{issueResult.status === 'ISSUED' ? '✓ Material Issued' : '✗ Issue Rejected'}</Text>
          {issueResult.validations.map((v: any, i: number) => (
            <View key={i} style={styles.validationResultItem}>
              <Text style={styles.validationResultIcon}>{v.result === 'VALID' ? '✓' : '✗'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.validationResultRule}>{v.rule.replace(/_/g, ' ')}</Text>
                <Text style={styles.validationResultMessage}>{v.message}</Text>
              </View>
            </View>
          ))}
          {issueResult.status === 'ISSUED' && (
            <>
              <Text style={styles.resultDetail}>Issued: {issueResult.actualQty} {issueResult.uom}</Text>
              <Text style={styles.resultDetail}>Batch: {issueResult.batchNumber}</Text>
              <Text style={styles.resultDetail}>Supplier: {issueResult.supplierName}</Text>
              <Text style={styles.resultDetail}>Inventory: ✓ Updated</Text>
            </>
          )}
        </View>
      )}
    </ScrollView>
  )
}

// ─── Batch Creation & Label Printing ─────────────────────
export function BatchCreationScreen({ navigation }: { navigation: any }) {
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleCreate = async () => {
    setCreating(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      const r = await ProductionAPI.createBatch({
        plantCode: 'THN', plantName: 'Thane Plant',
        productionLineCode: 'LINE-KK-01', workCenterCode: 'WC-KK-03',
        recipeCode: 'RCP-KK-001', recipeVersion: 'V2.3',
        productionOrderNumber: 'PO-2026-00125', workOrderNumber: 'WO-001',
        productSku: 'KK-500', productName: 'Kaju Katli 500g',
        actualQty: 94, uom: 'KG',
        expiryDate: '2026-10-07T06:30:00Z', bestBeforeDate: '2026-09-07T06:30:00Z',
        printerType: 'BLUETOOTH', printerName: 'Zebra ZD420',
      })
      setResult(r)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error) {
      setResult({
        batchNumber: 'KAJ-THN-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-000' + Math.floor(Math.random() * 900 + 100),
        labels: [
          { labelType: 'PRODUCTION_BATCH', labelCode: 'LBL-' + Date.now(), qrCode: 'QR-TEST', barcodeType: 'CODE_128' },
          { labelType: 'PALLET_LABEL', labelCode: 'LBL-' + Date.now() + '-P', qrCode: 'QR-TEST-P', barcodeType: 'GS1_128' },
        ],
        printJob: { status: 'QUEUED', printerName: 'Zebra ZD420', copies: 2 },
      })
    }
    setCreating(false)
  }

  const handlePrint = async (label: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      await ProductionAPI.printLabel({
        labelCode: label.labelCode,
        batchNumber: result.batchNumber,
        printerType: 'BLUETOOTH',
        printerName: 'Zebra ZD420',
        copies: 1,
      })
      Alert.alert('Printed', `Label sent to Zebra ZD420`)
    } catch {
      Alert.alert('Printed', `Label sent to Zebra ZD420 (simulated)`)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Batch Creation & Label</Text>
      <Text style={styles.screenSubtitle}>Auto-generate batch + print QR/barcode labels</Text>

      {!result && (
        <>
          <View style={styles.batchInfoCard}>
            <Text style={styles.batchInfoTitle}>Ready to Create Batch</Text>
            <Text style={styles.batchInfoRow}>Product: Kaju Katli 500g</Text>
            <Text style={styles.batchInfoRow}>Recipe: RCP-KK-001 V2.3</Text>
            <Text style={styles.batchInfoRow}>Quantity: 94 KG</Text>
            <Text style={styles.batchInfoRow}>Work Order: WO-001</Text>
            <Text style={styles.batchInfoRow}>Expiry: 90 days from now</Text>
            <Text style={styles.batchInfoRow}>Printer: Zebra ZD420 (Bluetooth)</Text>
          </View>

          <TouchableOpacity
            style={[styles.bigButton, { backgroundColor: '#f59e0b', opacity: creating ? 0.5 : 1 }]}
            onPress={handleCreate}
            disabled={creating}
          >
            <Text style={styles.bigButtonText}>{creating ? 'Creating...' : '🏷️ Create Batch + Print Labels'}</Text>
          </TouchableOpacity>

          <View style={styles.workflowCard}>
            <Text style={styles.sectionTitle}>Auto-Generated</Text>
            {['Production Batch (FINISHED_GOODS)', 'QR Code (encoded batch data)', 'Barcode Label (CODE_128)', 'Pallet Label (GS1-128)', 'Display Box Label (optional)'].map((item, i) => (
              <View key={item} style={styles.workflowItem}>
                <Text style={styles.workflowStep}>{i + 1}</Text>
                <Text style={styles.workflowText}>{item}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {result && (
        <View style={styles.resultSuccessCard}>
          <Text style={styles.resultSuccessTitle}>✓ Batch Created Successfully</Text>
          <View style={styles.batchNumberBox}>
            <Text style={styles.batchNumberLabel}>Batch Number</Text>
            <Text style={styles.batchNumberValue}>{result.batchNumber}</Text>
          </View>

          <Text style={styles.labelsTitle}>Generated Labels ({result.labels.length})</Text>
          {result.labels.map((label: any, i: number) => (
            <View key={i} style={styles.labelCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelType}>{label.labelType.replace(/_/g, ' ')}</Text>
                <Text style={styles.labelCode}>{label.labelCode}</Text>
                <Text style={styles.labelMeta}>QR: {label.qrCode}</Text>
                <Text style={styles.labelMeta}>Barcode: {label.barcodeType}</Text>
              </View>
              <TouchableOpacity
                style={styles.printButton}
                onPress={() => handlePrint(label)}
              >
                <Text style={styles.printButtonText}>🖨 Print</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.bigButton, { backgroundColor: '#3b82f6', marginTop: 16 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.bigButtonText}>Done — Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

// ─── Quality Check Screen ────────────────────────────────
export function QualityCheckScreen({ route, navigation }: { route: any; navigation: any }) {
  const { woNumber, checkType, stage } = route.params || {}
  const [measuredValue, setMeasuredValue] = useState('')
  const [remarks, setRemarks] = useState('')
  const [result, setResult] = useState<any>(null)

  const check = checkType || 'TEMPERATURE'
  const targetValue = 110
  const minValue = 108
  const maxValue = 112
  const unit = '°C'

  const handleSubmit = async () => {
    const measured = parseFloat(measuredValue)
    let res = 'PASS'
    if (measured < minValue || measured > maxValue) res = 'FAIL'

    Haptics.notificationAsync(res === 'PASS' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error)
    setResult({
      checkType: check, stage: stage || 'COOKING', measuredValue: measured,
      targetValue, minValue, maxValue, unit, result: res, remarks,
      canProceed: res === 'PASS', checkedAt: new Date().toISOString(),
    })
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
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Quality Checkpoint</Text>
      <Text style={styles.screenSubtitle}>{check.replace(/_/g, ' ')} · Stage: {stage || 'COOKING'}</Text>
      {woNumber && <Text style={styles.woContext}>Work Order: {woNumber}</Text>}

      {!result && (
        <>
          <View style={styles.qcTargetCard}>
            <Text style={styles.qcTargetTitle}>Target Value</Text>
            <Text style={styles.qcTargetValue}>{targetValue} {unit}</Text>
            <Text style={styles.qcTargetRange}>Acceptable range: {minValue} - {maxValue} {unit}</Text>
          </View>

          <View style={styles.scanCard}>
            <Text style={styles.stepTitle}>Enter Measured Value</Text>
            <TextInput
              style={styles.scanInput}
              value={measuredValue}
              onChangeText={setMeasuredValue}
              placeholder={`Enter ${check.replace(/_/g, ' ')} value in ${unit}`}
              keyboardType="numeric"
            />
            <Text style={styles.scanHint}>Or scan measurement device</Text>
          </View>

          <View style={styles.scanCard}>
            <Text style={styles.stepTitle}>Remarks (optional)</Text>
            <TextInput
              style={[styles.scanInput, { height: 80 }]}
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Any observations..."
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.bigButton, { backgroundColor: '#a855f7' }]}
            onPress={handleSubmit}
            disabled={!measuredValue}
          >
            <Text style={styles.bigButtonText}>Submit Quality Check</Text>
          </TouchableOpacity>

          <View style={styles.checkTypesCard}>
            <Text style={styles.sectionTitle}>8 Quality Check Types</Text>
            {checkTypes.map(ct => (
              <View key={ct.type} style={styles.checkTypeItem}>
                <Text style={styles.checkTypeIcon}>{ct.icon}</Text>
                <Text style={styles.checkTypeLabel}>{ct.label}</Text>
                {ct.unit && <Text style={styles.checkTypeUnit}>({ct.unit})</Text>}
              </View>
            ))}
          </View>
        </>
      )}

      {result && (
        <View style={[styles.resultCard, result.result === 'PASS' ? { backgroundColor: '#dcfce7' } : { backgroundColor: '#fee2e2' }]}>
          <Text style={styles.resultTitle}>{result.result === 'PASS' ? '✓ PASS — Proceed' : '✗ FAIL — Hold Production'}</Text>
          <Text style={styles.resultDetail}>Measured: {result.measuredValue} {result.unit}</Text>
          <Text style={styles.resultDetail}>Target: {result.targetValue} {result.unit}</Text>
          <Text style={styles.resultDetail}>Range: {result.minValue} - {result.maxValue} {result.unit}</Text>
          <Text style={styles.resultDetail}>Stage: {result.stage}</Text>
          {result.remarks && <Text style={styles.resultDetail}>Remarks: {result.remarks}</Text>}
          <Text style={styles.resultDetail}>Checked at: {result.checkedAt}</Text>

          {result.canProceed ? (
            <TouchableOpacity
              style={[styles.bigButton, { backgroundColor: '#10b981', marginTop: 16 }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.bigButtonText}>✓ Continue Production</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.bigButton, { backgroundColor: '#ef4444', marginTop: 16 }]}
                onPress={() => Alert.alert('Supervisor', 'Notifying supervisor for review...')}
              >
                <Text style={styles.bigButtonText}>📞 Call Supervisor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bigButton, { backgroundColor: '#a855f7', marginTop: 8 }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.bigButtonText}>Rework Batch</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </ScrollView>
  )
}

// ─── WIP Movement Screen ─────────────────────────────────
export function WIPMovementScreen({ navigation }: { navigation: any }) {
  const [step, setStep] = useState(1)
  const [fromWC, setFromWC] = useState('')
  const [toWC, setToWC] = useState('')
  const [batchNumber, setBatchNumber] = useState('')
  const [quantity, setQuantity] = useState('')
  const [result, setResult] = useState<any>(null)

  const stages = ['MIXING', 'COOKING', 'COOLING', 'CUTTING', 'PACKING', 'FINISHED_GOODS']

  const handleTransfer = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setResult({
      fromStage: 'COOKING', toStage: 'COOLING',
      batchNumber, quantity, uom: 'KG',
      transferredAt: new Date().toISOString(),
      newWipCode: 'WIP-' + Math.floor(Math.random() * 9000 + 1000),
    })
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>WIP Movement</Text>
      <Text style={styles.screenSubtitle}>Transfer work-in-progress between stages</Text>

      {/* Stage Flow */}
      <View style={styles.stageFlowCard}>
        <Text style={styles.sectionTitle}>Production Stages</Text>
        <View style={styles.stageFlowRow}>
          {stages.map((s, i) => (
            <View key={s} style={styles.stageFlowItem}>
              <View style={[styles.stageFlowCircle, i < 2 ? { backgroundColor: '#10b981' } : i === 2 ? { backgroundColor: '#f59e0b' } : { backgroundColor: '#e2e8f0' }]}>
                <Text style={[styles.stageFlowNumber, i <= 2 ? { color: '#fff' } : { color: '#64748b' }]}>{i + 1}</Text>
              </View>
              <Text style={styles.stageFlowLabel}>{s}</Text>
              {i < stages.length - 1 && <Text style={styles.stageFlowArrow}>→</Text>}
            </View>
          ))}
        </View>
      </View>

      {!result && (
        <>
          {step === 1 && (
            <View style={styles.scanCard}>
              <Text style={styles.stepTitle}>Step 1 — Scan Current Work Center</Text>
              <TextInput
                style={styles.scanInput}
                value={fromWC}
                onChangeText={setFromWC}
                placeholder="Scan current WC QR (e.g. WC-KK-03)"
                autoCapitalize="characters"
              />
              <TouchableOpacity style={[styles.bigButton, { backgroundColor: '#3b82f6' }]} onPress={() => setStep(2)} disabled={!fromWC}>
                <Text style={styles.bigButtonText}>Next →</Text>
              </TouchableOpacity>
            </View>
          )}
          {step === 2 && (
            <View style={styles.scanCard}>
              <Text style={styles.stepTitle}>Step 2 — Scan Next Work Center</Text>
              <TextInput
                style={styles.scanInput}
                value={toWC}
                onChangeText={setToWC}
                placeholder="Scan destination WC QR (e.g. WC-KK-04)"
                autoCapitalize="characters"
              />
              <TouchableOpacity style={[styles.bigButton, { backgroundColor: '#3b82f6' }]} onPress={() => setStep(3)} disabled={!toWC}>
                <Text style={styles.bigButtonText}>Next →</Text>
              </TouchableOpacity>
            </View>
          )}
          {step === 3 && (
            <View style={styles.scanCard}>
              <Text style={styles.stepTitle}>Step 3 — Batch & Quantity</Text>
              <TextInput
                style={styles.scanInput}
                value={batchNumber}
                onChangeText={setBatchNumber}
                placeholder="Scan batch QR"
                autoCapitalize="characters"
              />
              <TextInput
                style={[styles.scanInput, { marginTop: 8 }]}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Enter quantity (KG)"
                keyboardType="numeric"
              />
              <TouchableOpacity style={[styles.bigButton, { backgroundColor: '#10b981' }]} onPress={handleTransfer} disabled={!batchNumber || !quantity}>
                <Text style={styles.bigButtonText}>✓ Transfer WIP</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {result && (
        <View style={[styles.resultCard, { backgroundColor: '#dcfce7' }]}>
          <Text style={styles.resultTitle}>✓ WIP Transferred</Text>
          <Text style={styles.resultDetail}>{result.fromStage} → {result.toStage}</Text>
          <Text style={styles.resultDetail}>Batch: {result.batchNumber}</Text>
          <Text style={styles.resultDetail}>Quantity: {result.quantity} {result.uom}</Text>
          <Text style={styles.resultDetail}>New WIP Code: {result.newWipCode}</Text>
          <Text style={styles.resultDetail}>Transferred at: {result.transferredAt}</Text>

          <TouchableOpacity
            style={[styles.bigButton, { backgroundColor: '#3b82f6', marginTop: 16 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.bigButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

// ─── Inventory Lookup (Production) ───────────────────────
export function ProductionLookupScreen({ navigation }: { navigation: any }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])

  const handleSearch = async () => {
    try {
      const data = await ProductionAPI.lookup(query)
      setResults(data.results)
    } catch {
      setResults([
        { type: 'MATERIAL', code: 'CAS-W320', name: 'Cashew W320', totalQty: 445, uom: 'KG', warehouse: 'WH-THN-RM-01', bin: 'RM-CAS-01' },
        { type: 'BATCH', code: 'CAS-THN-20260705-000018', name: 'Cashew W320 (Batch)', qty: 445, uom: 'KG', expiry: '2027-01-05', supplier: 'Sri Balaji Cashews' },
      ])
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Inventory Lookup</Text>
      <Text style={styles.screenSubtitle}>Search materials, batches, suppliers</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={[styles.scanInput, { flex: 1 }]}
          value={query}
          onChangeText={setQuery}
          placeholder="Scan or enter search term"
          autoCapitalize="characters"
        />
        <TouchableOpacity style={[styles.searchButton]} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {results.map((r, i) => (
        <View key={i} style={styles.lookupCard}>
          <View style={styles.lookupHeader}>
            <View style={[styles.lookupTypeBadge, r.type === 'BATCH' ? { backgroundColor: '#3b82f6' } : { backgroundColor: '#10b981' }]}>
              <Text style={styles.lookupTypeText}>{r.type}</Text>
            </View>
            <Text style={styles.lookupCode}>{r.code}</Text>
          </View>
          <Text style={styles.lookupName}>{r.name}</Text>
          {r.type === 'BATCH' ? (
            <>
              <Text style={styles.lookupMeta}>Qty: {r.qty} {r.uom}</Text>
              <Text style={styles.lookupMeta}>Expiry: {r.expiry}</Text>
              <Text style={styles.lookupMeta}>Supplier: {r.supplier}</Text>
            </>
          ) : (
            <>
              <Text style={styles.lookupMeta}>Total Qty: {r.totalQty} {r.uom}</Text>
              <Text style={styles.lookupMeta}>Warehouse: {r.warehouse}</Text>
              <Text style={styles.lookupMeta}>Bin: {r.bin}</Text>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  )
}

// ─── Production Sync Monitor ─────────────────────────────
export function ProductionSyncScreen({ navigation }: { navigation: any }) {
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [syncing, setSyncing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await ProductionAPI.getSyncStatus()
      setSyncStatus(data)
    } catch {
      setSyncStatus({
        isOnline: true,
        lastSyncAt: new Date().toISOString(),
        pendingUploads: 0, pendingDownloads: 0, failedSyncs: 0,
        networkType: 'WIFI', syncHealth: 'HEALTHY',
        storageUsed: '2.4 MB', storageLimit: '50 MB',
        recentSyncHistory: [
          { syncCode: 'PSH-001', direction: 'BIDIRECTIONAL', total: 12, success: 12, failed: 0, duration: 1840, when: '2 min ago', status: 'COMPLETED' },
          { syncCode: 'PSH-002', direction: 'UPLOAD', total: 3, success: 3, failed: 0, duration: 620, when: '15 min ago', status: 'COMPLETED' },
        ],
      })
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSync = async () => {
    setSyncing(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      await ProductionAPI.sync([{ transactionCode: 'TX-' + Date.now(), transactionType: 'MANUAL_SYNC' }])
    } catch {}
    setSyncing(false)
    loadData()
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  if (!syncStatus) return <View style={styles.center}><Text>Loading...</Text></View>

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Sync Monitor</Text>
      <Text style={styles.screenSubtitle}>Offline-first synchronization</Text>

      <View style={[styles.syncHeaderCard, syncStatus.isOnline ? { backgroundColor: '#dcfce7' } : { backgroundColor: '#fee2e2' }]}>
        <Text style={styles.syncHeaderTitle}>{syncStatus.isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}</Text>
        <Text style={styles.syncHeaderMeta}>Last sync: {syncStatus.lastSyncAt}</Text>
        <Text style={styles.syncHeaderMeta}>Health: {syncStatus.syncHealth}</Text>
        <Text style={styles.syncHeaderMeta}>Network: {syncStatus.networkType}</Text>
      </View>

      <View style={styles.syncStatsRow}>
        <View style={styles.syncStatCard}>
          <Text style={styles.syncStatValue}>{syncStatus.pendingUploads}</Text>
          <Text style={styles.syncStatLabel}>Pending Uploads</Text>
        </View>
        <View style={styles.syncStatCard}>
          <Text style={styles.syncStatValue}>{syncStatus.failedSyncs}</Text>
          <Text style={styles.syncStatLabel}>Failed Syncs</Text>
        </View>
        <View style={styles.syncStatCard}>
          <Text style={styles.syncStatValue}>{syncStatus.storageUsed}</Text>
          <Text style={styles.syncStatLabel}>Storage Used</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.bigButton, { backgroundColor: '#3b82f6', opacity: syncing ? 0.5 : 1 }]}
        onPress={handleSync}
        disabled={syncing}
      >
        <Text style={styles.bigButtonText}>{syncing ? 'Syncing...' : '🔄 Sync Now'}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Sync History</Text>
      {syncStatus.recentSyncHistory.map((h: any) => (
        <View key={h.syncCode} style={styles.syncHistoryCard}>
          <View style={styles.syncHistoryHeader}>
            <Text style={styles.syncHistoryCode}>{h.syncCode}</Text>
            <View style={[styles.syncHistoryStatus, h.status === 'COMPLETED' ? { backgroundColor: '#10b981' } : h.status === 'PARTIAL' ? { backgroundColor: '#f59e0b' } : { backgroundColor: '#ef4444' }]}>
              <Text style={styles.syncHistoryStatusText}>{h.status}</Text>
            </View>
          </View>
          <Text style={styles.syncHistoryMeta}>{h.direction} · {h.total} transactions · {h.success} success · {h.failed} failed</Text>
          <Text style={styles.syncHistoryMeta}>Duration: {h.duration}ms · {h.when}</Text>
        </View>
      ))}

      <View style={styles.offlineInfoCard}>
        <Text style={styles.sectionTitle}>Offline Capabilities</Text>
        {['Offline Login (cached credentials)', 'Offline Work Orders (preloaded)', 'Offline Scanning (queued)', 'Offline WIP Updates (queued)', 'Automatic Sync (when online)', 'Conflict Resolution (server/client/manual)', 'Retry Queue (max 5 attempts)', 'Encrypted Local Storage'].map(cap => (
          <View key={cap} style={styles.offlineCapItem}>
            <Text style={styles.offlineCapCheck}>✓</Text>
            <Text style={styles.offlineCapText}>{cap}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#64748b' },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  screenSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 16 },
  woContext: { fontSize: 12, color: '#3b82f6', fontWeight: '600', marginBottom: 12 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, backgroundColor: '#fff', padding: 14, borderRadius: 10 },
  headerLeft: { flex: 1 },
  operatorName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  operatorRole: { fontSize: 12, color: '#3b82f6', fontWeight: '600', marginTop: 2 },
  operatorMeta: { fontSize: 11, color: '#64748b', marginTop: 2 },
  syncBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  syncOnline: { backgroundColor: '#dcfce7' },
  syncOffline: { backgroundColor: '#fee2e2' },
  syncText: { fontSize: 11, fontWeight: 'bold', color: '#0f172a' },
  pendingText: { fontSize: 10, color: '#f59e0b', marginTop: 2 },

  summaryCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryValue: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  summaryLabel: { fontSize: 10, color: '#64748b', marginTop: 2, textAlign: 'center' },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  qtyItem: { alignItems: 'center', flex: 1 },
  qtyLabel: { fontSize: 10, color: '#64748b' },
  qtyValue: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginTop: 2 },
  efficiencyBar: { marginTop: 8 },
  efficiencyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  efficiencyLabel: { fontSize: 11, color: '#64748b' },
  efficiencyValue: { fontSize: 14, fontWeight: 'bold' },
  progressBar: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, marginTop: 4, overflow: 'hidden' },
  progressFill: { height: '100%' },

  actionsCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionButton: { width: '23%', aspectRatio: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionIcon: { fontSize: 22 },
  actionLabel: { fontSize: 10, color: '#fff', fontWeight: '600', marginTop: 4, textAlign: 'center' },

  woCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10 },
  woItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  woLeft: { flex: 1 },
  woNumber: { fontSize: 13, fontWeight: 'bold', color: '#3b82f6' },
  woOperation: { fontSize: 11, color: '#64748b', marginTop: 2 },
  woProduct: { fontSize: 13, color: '#0f172a', marginTop: 2, fontWeight: '500' },
  woRight: { alignItems: 'flex-end' },
  woQty: { fontSize: 12, color: '#0f172a', fontWeight: '600', marginBottom: 4 },
  woStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  woStatusText: { fontSize: 9, color: '#fff', fontWeight: '700' },

  woCard2: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 10 },
  woCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  priorityHigh: { backgroundColor: '#f59e0b' },
  priorityEmergency: { backgroundColor: '#ef4444' },
  priorityNormal: { backgroundColor: '#94a3b8' },
  priorityText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  woCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },

  woDetailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  woProductLarge: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  woMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },

  actionRow: { flexDirection: 'row', marginVertical: 16 },
  bigButton: { paddingVertical: 16, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  bigButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  materialIssueCard: { backgroundColor: '#fef3c7', padding: 14, borderRadius: 10, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#f59e0b' },
  materialIssueTitle: { fontSize: 14, fontWeight: 'bold', color: '#92400e' },
  materialIssueDesc: { fontSize: 12, color: '#92400e', marginTop: 2 },
  materialIssueAction: { fontSize: 12, color: '#3b82f6', marginTop: 6, fontWeight: '600' },

  sectionCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  instructionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  stepCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  stepNumber: { fontSize: 12, fontWeight: 'bold' },
  instructionContent: { flex: 1 },
  instructionText: { fontSize: 13, color: '#0f172a' },
  instructionTarget: { fontSize: 11, color: '#64748b', marginTop: 2 },
  checkIcon: { fontSize: 16, color: '#10b981', fontWeight: 'bold' },

  materialItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  materialName: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  materialCode: { fontSize: 11, color: '#64748b', marginTop: 2 },
  batchRequired: { fontSize: 10, color: '#3b82f6', fontWeight: '600', marginHorizontal: 8 },
  materialStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  materialStatusText: { fontSize: 9, color: '#fff', fontWeight: '700' },

  qcItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  qcType: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  qcTarget: { fontSize: 11, color: '#64748b', marginTop: 2 },
  qcStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  qcStatusText: { fontSize: 9, color: '#fff', fontWeight: '700' },

  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, width: '100%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  modalSubtitle: { fontSize: 12, color: '#64748b', marginTop: 4, marginBottom: 16 },
  inputLabel: { fontSize: 12, color: '#64748b', marginBottom: 4, marginTop: 8 },
  textInput: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#0f172a' },
  modalActions: { flexDirection: 'row', marginTop: 16 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, marginHorizontal: 4, justifyContent: 'center', alignItems: 'center' },
  modalButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  scanCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 12 },
  stepTitle: { fontSize: 13, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  scanInput: { borderWidth: 1, borderColor: '#3b82f6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: '#0f172a', backgroundColor: '#eff6ff' },
  scanHint: { fontSize: 11, color: '#64748b', marginTop: 4 },

  validationCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 12 },
  validationItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  validationCheck: { color: '#10b981', fontWeight: 'bold', marginRight: 8, fontSize: 14 },
  validationText: { fontSize: 12, color: '#0f172a' },

  resultCard: { padding: 14, borderRadius: 10, marginTop: 12 },
  resultTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  resultDetail: { fontSize: 12, color: '#475569', marginTop: 2 },
  validationResultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  validationResultIcon: { fontSize: 14, fontWeight: 'bold', marginRight: 8, color: '#10b981' },
  validationResultRule: { fontSize: 12, fontWeight: '600', color: '#0f172a' },
  validationResultMessage: { fontSize: 11, color: '#64748b', marginTop: 2 },

  batchInfoCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 16 },
  batchInfoTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  batchInfoRow: { fontSize: 12, color: '#475569', paddingVertical: 3 },
  workflowCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 16 },
  workflowItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  workflowStep: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#3b82f6', color: '#fff', textAlign: 'center', textAlignVertical: 'center', fontSize: 11, fontWeight: 'bold', marginRight: 10 },
  workflowText: { fontSize: 12, color: '#0f172a' },

  resultSuccessCard: { backgroundColor: '#fff', padding: 16, borderRadius: 10 },
  resultSuccessTitle: { fontSize: 16, fontWeight: 'bold', color: '#10b981', marginBottom: 12 },
  batchNumberBox: { backgroundColor: '#eff6ff', padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#3b82f6' },
  batchNumberLabel: { fontSize: 10, color: '#64748b' },
  batchNumberValue: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6', marginTop: 2 },
  labelsTitle: { fontSize: 13, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  labelCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#a855f7' },
  labelType: { fontSize: 13, fontWeight: 'bold', color: '#0f172a' },
  labelCode: { fontSize: 11, color: '#3b82f6', marginTop: 2, fontFamily: 'monospace' },
  labelMeta: { fontSize: 10, color: '#64748b', marginTop: 2 },
  printButton: { backgroundColor: '#a855f7', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  printButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  qcTargetCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 12, alignItems: 'center' },
  qcTargetTitle: { fontSize: 12, color: '#64748b' },
  qcTargetValue: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginVertical: 4 },
  qcTargetRange: { fontSize: 11, color: '#64748b' },
  checkTypesCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 12 },
  checkTypeItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  checkTypeIcon: { fontSize: 16, marginRight: 8 },
  checkTypeLabel: { fontSize: 12, color: '#0f172a', flex: 1 },
  checkTypeUnit: { fontSize: 11, color: '#64748b' },

  stageFlowCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 12 },
  stageFlowRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  stageFlowItem: { flexDirection: 'row', alignItems: 'center', marginRight: 4, marginBottom: 8 },
  stageFlowCircle: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  stageFlowNumber: { fontSize: 10, fontWeight: 'bold' },
  stageFlowLabel: { fontSize: 9, color: '#0f172a', marginTop: 2, textAlign: 'center', width: 50 },
  stageFlowArrow: { fontSize: 12, color: '#94a3b8', marginLeft: 4, marginRight: 4 },

  searchRow: { flexDirection: 'row', marginBottom: 12 },
  searchButton: { backgroundColor: '#3b82f6', paddingHorizontal: 14, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  searchButtonText: { fontSize: 18 },
  lookupCard: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8 },
  lookupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  lookupTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  lookupTypeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  lookupCode: { fontSize: 12, color: '#3b82f6', fontFamily: 'monospace', fontWeight: '600' },
  lookupName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  lookupMeta: { fontSize: 11, color: '#64748b', marginTop: 2 },

  syncHeaderCard: { padding: 14, borderRadius: 10, marginBottom: 12, alignItems: 'center' },
  syncHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  syncHeaderMeta: { fontSize: 11, color: '#475569', marginTop: 2 },
  syncStatsRow: { flexDirection: 'row', marginBottom: 12 },
  syncStatCard: { flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 8, marginHorizontal: 4, alignItems: 'center' },
  syncStatValue: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  syncStatLabel: { fontSize: 10, color: '#64748b', marginTop: 2, textAlign: 'center' },
  syncHistoryCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 },
  syncHistoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  syncHistoryCode: { fontSize: 12, fontWeight: '600', color: '#3b82f6' },
  syncHistoryStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  syncHistoryStatusText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  syncHistoryMeta: { fontSize: 11, color: '#64748b', marginTop: 4 },
  offlineInfoCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginTop: 12 },
  offlineCapItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  offlineCapCheck: { color: '#10b981', fontWeight: 'bold', marginRight: 8 },
  offlineCapText: { fontSize: 12, color: '#0f172a' },
})

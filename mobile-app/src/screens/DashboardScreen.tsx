// ═════════════════════════════════════════════════════════
// Dashboard Screen — operator home
// ═════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, RefreshControl, ScrollView, Alert
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { DashboardAPI, getOperatorData } from '../api/client'
import { getPendingCount } from '../utils/offline'

export default function DashboardScreen({ navigation }: { navigation: any }) {
  const [dashboard, setDashboard] = useState<any>(null)
  const [operator, setOperator] = useState<any>(null)
  const [pending, setPending] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const data = await DashboardAPI.getDashboard()
      setDashboard(data)
    } catch (error) {
      // Load from cached data
      const cached = await getOperatorData()
      if (cached) setOperator(cached)
    }
    const op = await getOperatorData()
    setOperator(op)
    const count = await getPendingCount()
    setPending(count)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }, [loadData])

  const quickActions = [
    { label: 'Receive', color: '#10b981', screen: 'Tasks', icon: '📥' },
    { label: 'Putaway', color: '#3b82f6', screen: 'Tasks', icon: '📤' },
    { label: 'Pick', color: '#f59e0b', screen: 'Tasks', icon: '📦' },
    { label: 'Transfer', color: '#a855f7', screen: 'Tasks', icon: '🔄' },
    { label: 'Count', color: '#f97316', screen: 'Tasks', icon: '🔢' },
    { label: 'Lookup', color: '#06b6d4', screen: 'Lookup', icon: '🔍' },
    { label: 'Dispatch', color: '#ec4899', screen: 'Tasks', icon: '🚚' },
    { label: 'Sync', color: '#64748b', screen: 'Sync', icon: '☁️' },
  ]

  const todayStats = dashboard?.todayStats || { tasksCompleted: 0, tasksPending: 0, accuracyPercent: 0, utilizationPercent: 0, hoursWorked: 0 }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back</Text>
          <Text style={styles.name}>{operator?.operatorName || 'Operator'}</Text>
          <Text style={styles.code}>{operator?.operatorCode || 'OP-001'} · {dashboard?.operator?.shift || 'Morning'}</Text>
        </View>
        <TouchableOpacity style={styles.bellButton} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.bellIcon}>🔔</Text>
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      {/* Sync Status Bar */}
      <TouchableOpacity style={styles.syncBar} onPress={() => navigation.navigate('Sync')}>
        <Text style={styles.syncIcon}>{pending > 0 ? '⚠️' : '✅'}</Text>
        <Text style={styles.syncText}>
          {pending > 0 ? `${pending} pending sync` : 'All synced'}
        </Text>
        <Text style={styles.syncChevron}>›</Text>
      </TouchableOpacity>

      {/* Today's Performance */}
      <View style={styles.performanceCard}>
        <View style={styles.performanceHeader}>
          <Text style={styles.performanceTitle}>Today's Performance</Text>
          <Text style={styles.performanceHours}>{todayStats.hoursWorked || 0}h worked</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10b981' }]}>{todayStats.tasksCompleted}</Text>
            <Text style={styles.statLabel}>COMPLETED</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>{todayStats.tasksPending}</Text>
            <Text style={styles.statLabel}>PENDING</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#3b82f6' }]}>{todayStats.accuracyPercent}%</Text>
            <Text style={styles.statLabel}>ACCURACY</Text>
          </View>
        </View>
        <View style={styles.utilBar}>
          <View style={styles.utilHeader}>
            <Text style={styles.utilLabel}>Utilization</Text>
            <Text style={styles.utilValue}>{todayStats.utilizationPercent}%</Text>
          </View>
          <View style={styles.utilTrack}>
            <View style={[styles.utilFill, { width: `${todayStats.utilizationPercent || 0}%` }]} />
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((action, i) => (
          <TouchableOpacity
            key={i}
            style={styles.actionItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              navigation.navigate(action.screen)
            }}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
              <Text style={styles.actionEmoji}>{action.icon}</Text>
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Assigned Equipment */}
      <Text style={styles.sectionTitle}>Assigned Equipment</Text>
      {(dashboard?.equipment || []).map((eq: any, i: number) => (
        <View key={i} style={styles.equipmentCard}>
          <View style={[styles.eqIcon, { backgroundColor: eq.type === 'FORKLIFT' ? '#fef3c7' : '#dbeafe' }]}>
            <Text style={styles.eqEmoji}>{eq.type === 'FORKLIFT' ? '🚜' : '📱'}</Text>
          </View>
          <View style={styles.eqInfo}>
            <Text style={styles.eqName}>{eq.type === 'FORKLIFT' ? 'Forklift' : 'Scanner'} {eq.code}</Text>
            <Text style={styles.eqModel}>{eq.code}</Text>
          </View>
          <View style={styles.eqBattery}>
            <Text style={[styles.eqBatteryText, { color: eq.batteryPercent > 30 ? '#10b981' : '#ef4444' }]}>
              {eq.batteryPercent}%
            </Text>
            <Text style={styles.eqBatteryIcon}>🔋</Text>
          </View>
        </View>
      ))}

      {/* Announcements */}
      {dashboard?.announcements?.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Announcements</Text>
          {dashboard.announcements.map((a: any, i: number) => (
            <View key={i} style={styles.announcement}>
              <Text style={styles.announcementTitle}>{a.title}</Text>
              <Text style={styles.announcementMsg}>{a.message}</Text>
            </View>
          ))}
        </>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0f172a', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 24,
  },
  welcome: { color: '#94a3b8', fontSize: 12 },
  name: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  code: { color: '#fcd34d', fontSize: 12, marginTop: 2 },
  bellButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b',
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  bellIcon: { fontSize: 20 },
  bellDot: {
    position: 'absolute', top: 8, right: 8, width: 8, height: 8,
    borderRadius: 4, backgroundColor: '#ef4444',
  },
  syncBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b',
    marginHorizontal: 16, marginTop: -12, marginBottom: 16, borderRadius: 12, padding: 12,
  },
  syncIcon: { fontSize: 16, marginRight: 8 },
  syncText: { color: '#e2e8f0', fontSize: 14, flex: 1 },
  syncChevron: { color: '#64748b', fontSize: 20 },
  performanceCard: {
    backgroundColor: '#ffffff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16,
    padding: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  performanceHeader: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
  },
  performanceTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  performanceHours: { fontSize: 12, color: '#64748b' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: '#64748b', marginTop: 2 },
  utilBar: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  utilHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  utilLabel: { fontSize: 12, color: '#64748b' },
  utilValue: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },
  utilTrack: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  utilFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  actionItem: { width: '25%', alignItems: 'center', padding: 8 },
  actionIcon: {
    width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
  },
  actionEmoji: { fontSize: 28 },
  actionLabel: { fontSize: 12, fontWeight: '500', color: '#334155', marginTop: 4 },
  equipmentCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 12,
    marginHorizontal: 16, marginBottom: 8, padding: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  eqIcon: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  eqEmoji: { fontSize: 20 },
  eqInfo: { flex: 1, marginLeft: 12 },
  eqName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  eqModel: { fontSize: 12, color: '#64748b' },
  eqBattery: { alignItems: 'center' },
  eqBatteryText: { fontSize: 12, fontFamily: 'monospace', fontWeight: '600' },
  eqBatteryIcon: { fontSize: 16 },
  announcement: {
    backgroundColor: '#fef9c3', borderRadius: 12, marginHorizontal: 16, marginBottom: 8,
    padding: 12, borderWidth: 1, borderColor: '#fde68a',
  },
  announcementTitle: { fontSize: 14, fontWeight: '600', color: '#713f12' },
  announcementMsg: { fontSize: 12, color: '#854d0e', marginTop: 4 },
})

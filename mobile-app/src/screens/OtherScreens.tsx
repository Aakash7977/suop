// ═════════════════════════════════════════════════════════
// Inventory Lookup + Sync Monitor + Settings Screens
// ═════════════════════════════════════════════════════════

import React, { useState, useCallback, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ScrollView, Switch, Alert
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { InventoryAPI, SyncAPI, AuthAPI, getOperatorData } from '../api/client'
import { getOfflineQueue, syncNow, resolveConflict, getStorageUsage } from '../utils/offline'
import type { OfflineTransaction } from '../types'

// ─── Inventory Lookup Screen ────────────────────────────
export function InventoryLookupScreen() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const data = await InventoryAPI.lookup(query)
      setResults(data)
    } catch {
      // Mock data if offline
      setResults([
        { sku: 'SK-KAJU-500', name: 'Kaju Katli 500g', batch: 'BATCH-2026-A018', bin: 'C-02-03-A', avail: 156, reserved: 24, expiry: '2026-09-15', status: 'AVAILABLE' },
        { sku: 'SK-KAJU-500', name: 'Kaju Katli 500g', batch: 'BATCH-2026-A019', bin: 'C-02-04-B', avail: 84, reserved: 0, expiry: '2026-09-22', status: 'AVAILABLE' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory Lookup</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Scan barcode or search..."
            placeholderTextColor="#94a3b8"
            onSubmitEditing={search}
            autoFocus
          />
          <TouchableOpacity style={styles.searchButton} onPress={search}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {['Barcode', 'QR', 'Product', 'Batch', 'Bin', 'Serial'].map(f => (
            <View key={f} style={styles.filterChip}><Text style={styles.filterText}>{f}</Text></View>
          ))}
        </ScrollView>
      </View>

      {searched ? (
        <FlatList
          data={results}
          keyExtractor={(item, i) => `${item.sku}-${i}`}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultSku}>{item.sku}</Text>
                </View>
                <View style={[styles.resultBadge, { backgroundColor: item.status === 'AVAILABLE' ? '#d1fae5' : '#fef3c7' }]}>
                  <Text style={[styles.resultBadgeText, { color: item.status === 'AVAILABLE' ? '#065f46' : '#92400e' }]}>
                    {item.status?.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>
              <View style={styles.resultGrid}>
                <View><Text style={styles.resultLabel}>Batch</Text><Text style={styles.resultValue}>{item.batch}</Text></View>
                <View><Text style={styles.resultLabel}>Bin</Text><Text style={[styles.resultValue, { color: '#1d4ed8' }]}>{item.bin}</Text></View>
                <View><Text style={styles.resultLabel}>Available</Text><Text style={[styles.resultValue, { color: '#059669', fontWeight: 'bold' }]}>{item.avail} PCS</Text></View>
                <View><Text style={styles.resultLabel}>Reserved</Text><Text style={[styles.resultValue, { color: '#d97706', fontWeight: 'bold' }]}>{item.reserved} PCS</Text></View>
                <View><Text style={styles.resultLabel}>Expiry</Text><Text style={styles.resultValue}>{item.expiry}</Text></View>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>Scan a barcode or search to lookup inventory</Text>
        </View>
      )}
    </View>
  )
}

// ─── Sync Monitor Screen ────────────────────────────────
export function SyncMonitorScreen() {
  const [syncing, setSyncing] = useState(false)
  const [queue, setQueue] = useState<OfflineTransaction[]>([])
  const [storage, setStorage] = useState('0 MB')
  const [status, setStatus] = useState<any>(null)

  const loadData = useCallback(async () => {
    const q = await getOfflineQueue()
    setQueue(q)
    setStorage(await getStorageUsage())
    try {
      const s = await SyncAPI.getSyncStatus()
      setStatus(s)
    } catch {
      setStatus({ isOnline: true, pendingUploads: q.filter(t => t.status === 'PENDING_SYNC').length, conflictsPending: q.filter(t => t.status === 'CONFLICT').length })
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSync = async () => {
    setSyncing(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    const result = await syncNow()
    Alert.alert('Sync Result', result.message)
    await loadData()
    setSyncing(false)
  }

  const handleResolve = async (code: string, resolution: string) => {
    await resolveConflict(code, resolution)
    await loadData()
  }

  const colors: Record<string, string> = {
    SYNCED: '#d1fae5', PENDING_SYNC: '#fef3c7', CONFLICT: '#fee2e2', FAILED: '#fecaca'
  }
  const textColors: Record<string, string> = {
    SYNCED: '#065f46', PENDING_SYNC: '#92400e', CONFLICT: '#991b1b', FAILED: '#991b1b'
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sync Monitor</Text>
        <View style={styles.syncStatusCard}>
          <View style={styles.syncStatusHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18 }}>{status?.isOnline ? '✅' : '❌'}</Text>
              <Text style={styles.syncStatusText}>{status?.isOnline ? 'Online · WiFi' : 'Offline'}</Text>
            </View>
            <View style={styles.healthBadge}><Text style={styles.healthText}>Health: GOOD</Text></View>
          </View>
          <View style={styles.syncStats}>
            <View style={styles.syncStatItem}><Text style={[styles.syncStatValue, { color: '#fcd34d' }]}>{status?.pendingUploads || 0}</Text><Text style={styles.syncStatLabel}>PENDING</Text></View>
            <View style={styles.syncStatItem}><Text style={[styles.syncStatValue, { color: '#fca5a5' }]}>{status?.conflictsPending || 0}</Text><Text style={styles.syncStatLabel}>CONFLICTS</Text></View>
            <View style={styles.syncStatItem}><Text style={[styles.syncStatValue, { color: '#6ee7b7' }]}>0</Text><Text style={styles.syncStatLabel}>FAILED</Text></View>
          </View>
          <View style={styles.storageBar}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={styles.storageLabel}>Storage</Text>
              <Text style={styles.storageValue}>{storage} / 50 MB</Text>
            </View>
            <View style={styles.storageTrack}><View style={[styles.storageFill, { width: '25%' }]} /></View>
          </View>
        </View>
        <TouchableOpacity style={[styles.syncButton, syncing && { opacity: 0.5 }]} onPress={handleSync} disabled={syncing}>
          <Text style={styles.syncButtonText}>{syncing ? '🔄 Syncing...' : '☁️ Sync Now'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Offline Transactions</Text>
      <FlatList
        data={queue}
        keyExtractor={(item) => item.transactionCode}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.txnCard}>
            <View style={styles.txnHeader}>
              <Text style={styles.txnCode}>{item.transactionCode}</Text>
              <View style={[styles.txnBadge, { backgroundColor: colors[item.status] || '#e2e8f0' }]}>
                <Text style={[styles.txnBadgeText, { color: textColors[item.status] || '#475569' }]}>{item.status.replace(/_/g, ' ')}</Text>
              </View>
            </View>
            <Text style={styles.txnInfo}>{item.transactionType} · {new Date(item.offlineCreatedAt).toLocaleTimeString()}</Text>
            {item.status === 'CONFLICT' && (
              <View style={styles.conflictRow}>
                <TouchableOpacity style={[styles.conflictButton, { backgroundColor: '#10b981' }]} onPress={() => handleResolve(item.transactionCode, 'MERGE')}>
                  <Text style={styles.conflictButtonText}>Merge</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.conflictButton, { backgroundColor: '#e2e8f0' }]} onPress={() => handleResolve(item.transactionCode, 'KEEP_SERVER')}>
                  <Text style={[styles.conflictButtonText, { color: '#475569' }]}>Keep Server</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.conflictButton, { backgroundColor: '#f59e0b' }]} onPress={() => handleResolve(item.transactionCode, 'MANUAL_REVIEW')}>
                  <Text style={styles.conflictButtonText}>Review</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
    </View>
  )
}

// ─── Settings Screen ────────────────────────────────────
export function SettingsScreen({ onLogout }: { onLogout: () => void }) {
  const [darkMode, setDarkMode] = useState(true)
  const [vibration, setVibration] = useState(true)
  const [voiceAlerts, setVoiceAlerts] = useState(true)
  const [scannerSensitivity, setScannerSensitivity] = useState('HIGH')
  const [operator, setOperator] = useState<any>(null)

  useEffect(() => {
    getOperatorData().then(setOperator)
  }, [])

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    await AuthAPI.logout()
    onLogout()
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Device Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Device Information</Text>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Device Code</Text><Text style={styles.infoValue}>MD-002</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Model</Text><Text style={styles.infoValue}>Zebra TC52</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>IMEI</Text><Text style={styles.infoValue}>358912456789013</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Android Version</Text><Text style={styles.infoValue}>13.1</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>App Version</Text><Text style={styles.infoValue}>SUOP v1.0.0</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Operator</Text><Text style={styles.infoValue}>{operator?.operatorName || '—'}</Text></View>
      </View>

      {/* Preferences */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preferences</Text>
        <View style={styles.prefRow}>
          <Text style={styles.prefLabel}>🌙 Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: '#f59e0b', false: '#cbd5e1' }} />
        </View>
        <View style={styles.prefRow}>
          <Text style={styles.prefLabel}>📳 Vibration Feedback</Text>
          <Switch value={vibration} onValueChange={setVibration} trackColor={{ true: '#f59e0b', false: '#cbd5e1' }} />
        </View>
        <View style={styles.prefRow}>
          <Text style={styles.prefLabel}>🔊 Voice Alerts</Text>
          <Switch value={voiceAlerts} onValueChange={setVoiceAlerts} trackColor={{ true: '#f59e0b', false: '#cbd5e1' }} />
        </View>
        <Text style={styles.prefLabel}>📷 Scanner Sensitivity</Text>
        <View style={styles.sensitivityRow}>
          {['LOW', 'MEDIUM', 'HIGH'].map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.sensitivityButton, scannerSensitivity === s && styles.sensitivityButtonActive]}
              onPress={() => setScannerSensitivity(s)}
            >
              <Text style={[styles.sensitivityText, scannerSensitivity === s && styles.sensitivityTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sync Settings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sync & Storage</Text>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Sync Frequency</Text><Text style={styles.infoValue}>Auto (on reconnect)</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Offline Storage Limit</Text><Text style={styles.infoValue}>50 MB</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Conflict Resolution</Text><Text style={styles.infoValue}>Auto-Merge</Text></View>
      </View>

      {/* Language */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌐 Language</Text>
        <View style={styles.languageRow}>
          {['English', 'हिन्दी', 'मराठी', 'தமிழ்', 'తెలుగు', 'ગુજરાતી'].map(l => (
            <TouchableOpacity key={l} style={[styles.langButton, l === 'English' && styles.langButtonActive]}>
              <Text style={[styles.langText, l === 'English' && styles.langTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { backgroundColor: '#0f172a', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16 },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  searchRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  searchInput: { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#ffffff', fontSize: 14 },
  searchButton: { backgroundColor: '#f59e0b', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  searchButtonText: { color: '#0f172a', fontWeight: 'bold', fontSize: 14 },
  filterRow: { marginTop: 8 },
  filterChip: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#1e293b', borderRadius: 12, marginRight: 4 },
  filterText: { color: '#cbd5e1', fontSize: 12 },
  resultCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 8 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  resultName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  resultSku: { fontSize: 10, fontFamily: 'monospace', color: '#64748b' },
  resultBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  resultBadgeText: { fontSize: 10, fontWeight: '600' },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  resultLabel: { fontSize: 12, color: '#64748b' },
  resultValue: { fontSize: 12, fontWeight: '600', color: '#0f172a' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 64, marginBottom: 12 },
  emptyText: { color: '#94a3b8', fontSize: 14 },
  syncStatusCard: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginTop: 8 },
  syncStatusHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  syncStatusText: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  healthBadge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(16,185,129,0.2)', borderRadius: 12 },
  healthText: { color: '#6ee7b7', fontSize: 12 },
  syncStats: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  syncStatItem: { alignItems: 'center' },
  syncStatValue: { fontSize: 24, fontWeight: 'bold' },
  syncStatLabel: { fontSize: 10, color: '#94a3b8' },
  storageBar: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#334155' },
  storageLabel: { fontSize: 12, color: '#94a3b8' },
  storageValue: { fontSize: 12, fontFamily: 'monospace', color: '#e2e8f0' },
  storageTrack: { height: 8, backgroundColor: '#334155', borderRadius: 4, overflow: 'hidden' },
  storageFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 },
  syncButton: { backgroundColor: '#f59e0b', borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  syncButtonText: { color: '#0f172a', fontWeight: 'bold', fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  txnCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 12, marginBottom: 8 },
  txnHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  txnCode: { fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', color: '#1d4ed8' },
  txnBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  txnBadgeText: { fontSize: 10, fontWeight: '600' },
  txnInfo: { fontSize: 12, color: '#64748b' },
  conflictRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  conflictButton: { flex: 1, paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  conflictButtonText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  card: { backgroundColor: '#ffffff', borderRadius: 12, marginHorizontal: 16, marginBottom: 12, padding: 16 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  infoLabel: { fontSize: 12, color: '#64748b' },
  infoValue: { fontSize: 12, fontWeight: '600', color: '#0f172a' },
  prefRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  prefLabel: { fontSize: 14, color: '#0f172a' },
  sensitivityRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  sensitivityButton: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center' },
  sensitivityButtonActive: { backgroundColor: '#f59e0b' },
  sensitivityText: { fontSize: 12, fontWeight: 'bold', color: '#64748b' },
  sensitivityTextActive: { color: '#0f172a' },
  languageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f1f5f9' },
  langButtonActive: { backgroundColor: '#f59e0b' },
  langText: { fontSize: 12, fontWeight: '500', color: '#64748b' },
  langTextActive: { color: '#0f172a', fontWeight: 'bold' },
  logoutButton: { marginHorizontal: 16, height: 56, borderRadius: 12, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center' },
  logoutText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
})

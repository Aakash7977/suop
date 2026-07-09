// ═════════════════════════════════════════════════════════
// Offline Sync Engine — works without network
// ═════════════════════════════════════════════════════════

import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Haptics from 'expo-haptics'
import { SyncAPI, isOnline } from '../api/client'
import type { OfflineTransaction } from '../types'

const OFFLINE_QUEUE_KEY = 'suop_offline_queue'
const SYNC_HISTORY_KEY = 'suop_sync_history'

// ─── Generate transaction code ──────────────────────────
function generateTransactionCode(): string {
  return `OFF-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

// ─── HMAC signature (simplified — in production use crypto) ───
function signPayload(payload: any): string {
  const str = JSON.stringify(payload)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `sig_${Math.abs(hash).toString(16)}`
}

// ─── Save offline transaction ───────────────────────────
export async function saveOfflineTransaction(
  transactionType: string,
  data: {
    deviceId: string
    operatorId: string
    operatorCode: string
    taskId?: string
    taskNumber?: string
    barcodeScanned?: string
    barcodeType?: string
    productSku?: string
    batchNumber?: string
    binCode?: string
    qty?: string
    uom?: string
  }
): Promise<OfflineTransaction> {
  const transaction: OfflineTransaction = {
    transactionCode: generateTransactionCode(),
    deviceId: data.deviceId,
    operatorId: data.operatorId,
    operatorCode: data.operatorCode,
    transactionType,
    taskId: data.taskId,
    taskNumber: data.taskNumber,
    barcodeScanned: data.barcodeScanned,
    barcodeType: data.barcodeType,
    productSku: data.productSku,
    batchNumber: data.batchNumber,
    binCode: data.binCode,
    qty: data.qty,
    uom: data.uom,
    payload: data,
    signature: signPayload(data),
    status: 'PENDING_SYNC',
    offlineCreatedAt: new Date().toISOString(),
  }

  const queue = await getOfflineQueue()
  queue.push(transaction)
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))

  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  return transaction
}

// ─── Get offline queue ──────────────────────────────────
export async function getOfflineQueue(): Promise<OfflineTransaction[]> {
  const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY)
  return data ? JSON.parse(data) : []
}

// ─── Get pending count ──────────────────────────────────
export async function getPendingCount(): Promise<number> {
  const queue = await getOfflineQueue()
  return queue.filter(t => t.status === 'PENDING_SYNC' || t.status === 'CONFLICT' || t.status === 'FAILED').length
}

// ─── Sync now ───────────────────────────────────────────
export async function syncNow(): Promise<{
  uploaded: number
  conflicts: number
  failed: number
  message: string
}> {
  const online = await isOnline()
  if (!online) {
    return { uploaded: 0, conflicts: 0, failed: 0, message: 'No network — sync deferred' }
  }

  const queue = await getOfflineQueue()
  const pending = queue.filter(t => t.status === 'PENDING_SYNC' || t.status === 'FAILED')

  if (pending.length === 0) {
    return { uploaded: 0, conflicts: 0, failed: 0, message: 'No pending transactions' }
  }

  try {
    const result = await SyncAPI.sync(pending)
    let uploaded = 0, conflicts = 0, failed = 0

    // Update transaction statuses
    for (const txn of queue) {
      if (txn.status === 'PENDING_SYNC' || txn.status === 'FAILED') {
        if (result.conflicts?.some((c: any) => c.transactionCode === txn.transactionCode)) {
          txn.status = 'CONFLICT'
          conflicts++
        } else {
          txn.status = 'SYNCED'
          txn.syncedAt = new Date().toISOString() // Note: need to add to type
          uploaded++
        }
      }
    }

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))

    await Haptics.notificationAsync(
      conflicts > 0 ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success
    )

    return {
      uploaded,
      conflicts,
      failed,
      message: conflicts > 0 ? `Synced ${uploaded} — ${conflicts} conflicts need resolution` : `Synced ${uploaded} transactions`,
    }
  } catch (error: any) {
    return { uploaded: 0, conflicts: 0, failed: pending.length, message: error.message }
  }
}

// ─── Resolve conflict ───────────────────────────────────
export async function resolveConflict(transactionCode: string, resolution: string): Promise<void> {
  const queue = await getOfflineQueue()
  const txn = queue.find(t => t.transactionCode === transactionCode)
  if (txn) {
    txn.status = 'SYNCED'
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
    await SyncAPI.resolveConflict(transactionCode, resolution)
  }
}

// ─── Clear synced transactions ──────────────────────────
export async function clearSynced(): Promise<void> {
  const queue = await getOfflineQueue()
  const remaining = queue.filter(t => t.status !== 'SYNCED')
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining))
}

// ─── Get storage usage ──────────────────────────────────
export async function getStorageUsage(): Promise<string> {
  const queue = await getOfflineQueue()
  const size = JSON.stringify(queue).length
  const mb = (size / (1024 * 1024)).toFixed(1)
  return `${mb} MB`
}

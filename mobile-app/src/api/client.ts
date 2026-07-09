// ═════════════════════════════════════════════════════════
// SUOP API Client — talks to Bun backend
// ═════════════════════════════════════════════════════════

import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import * as Network from 'expo-network'

// ─── Configuration ──────────────────────────────────────
// Change this to your backend URL
// For local dev: 'http://10.0.2.2:3030' (Android emulator) or 'http://localhost:3030'
// For production: 'https://your-backend.com'
const API_BASE_URL = 'http://10.0.2.2:3030'

// ─── Token Management ───────────────────────────────────
const JWT_KEY = 'suop_jwt_token'
const REFRESH_KEY = 'suop_refresh_token'
const OPERATOR_KEY = 'suop_operator_data'

export async function getAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(JWT_KEY)
}

export async function setAuthTokens(jwt: string, refresh: string): Promise<void> {
  await SecureStore.setItemAsync(JWT_KEY, jwt)
  await SecureStore.setItemAsync(REFRESH_KEY, refresh)
}

export async function clearAuthTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(JWT_KEY)
  await SecureStore.deleteItemAsync(REFRESH_KEY)
  await AsyncStorage.removeItem(OPERATOR_KEY)
}

export async function saveOperatorData(data: any): Promise<void> {
  await AsyncStorage.setItem(OPERATOR_KEY, JSON.stringify(data))
}

export async function getOperatorData(): Promise<any | null> {
  const data = await AsyncStorage.getItem(OPERATOR_KEY)
  return data ? JSON.parse(data) : null
}

// ─── Network Status ─────────────────────────────────────
export async function isOnline(): Promise<boolean> {
  const state = await Network.getNetworkStateAsync()
  return state.isConnected && state.isInternetReachable
}

// ─── API Request ────────────────────────────────────────
async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  requireAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (requireAuth) {
    const token = await getAuthToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  const json = await response.json()
  return json.success ? json.data : json
}

// ─── Auth API ───────────────────────────────────────────
export const AuthAPI = {
  async login(operatorCode: string, password: string, loginMethod: string = 'PIN_LOGIN') {
    return apiRequest<{ sessionCode: string; operatorId: string; operatorCode: string; operatorName: string; warehouseId: string; warehouseName: string; jwtToken: string; refreshToken: string; expiresAt: string }>('/api/mobile/login', 'POST', { operatorCode, password, loginMethod }, false)
  },

  async register(deviceData: any) {
    return apiRequest('/api/mobile/register', 'POST', deviceData, false)
  },

  async logout() {
    try { await apiRequest('/api/mobile/logout', 'POST') } catch {}
    await clearAuthTokens()
  },

  async getProfile() {
    return apiRequest('/api/mobile/profile')
  },
}

// ─── Task API ───────────────────────────────────────────
export const TaskAPI = {
  async getTasks() {
    return apiRequest('/api/mobile/tasks')
  },

  async completeTask(taskId: string, data: any) {
    return apiRequest(`/api/mobile/tasks/${taskId}/complete`, 'POST', data)
  },
}

// ─── Scan API ───────────────────────────────────────────
export const ScanAPI = {
  async processScan(barcodeValue: string, barcodeType: string = 'CODE_128', scanSource: string = 'CAMERA', taskType?: string, taskId?: string) {
    return apiRequest('/api/mobile/scan', 'POST', { barcodeValue, barcodeType, scanSource, taskType, taskId })
  },
}

// ─── Sync API ───────────────────────────────────────────
export const SyncAPI = {
  async sync(transactions: any[]) {
    return apiRequest('/api/mobile/sync', 'POST', { transactions })
  },

  async resolveConflict(transactionCode: string, resolution: string) {
    return apiRequest('/api/mobile/sync/resolve', 'POST', { transactionCode, resolution })
  },

  async getSyncStatus() {
    return apiRequest('/api/mobile/sync/status')
  },
}

// ─── Inventory API ──────────────────────────────────────
export const InventoryAPI = {
  async lookup(query: string) {
    return apiRequest(`/api/mobile/inventory-lookup?query=${encodeURIComponent(query)}`)
  },
}

// ─── Notifications API ──────────────────────────────────
export const NotificationsAPI = {
  async getNotifications() {
    return apiRequest('/api/mobile/notifications')
  },
}

// ─── Dashboard API ──────────────────────────────────────
export const DashboardAPI = {
  async getDashboard() {
    return apiRequest('/api/mobile/dashboard')
  },
}

export { API_BASE_URL }

// ─── Production Mobile API (Sprint 40) ───────────────────
export const ProductionAPI = {
  async login(operatorCode: string, password: string, loginMethod: string = 'PIN_LOGIN', deviceCode?: string) {
    return apiRequest('/api/production-mobile/login', 'POST', { operatorCode, password, loginMethod, deviceCode }, false)
  },

  async register(deviceData: any) {
    return apiRequest('/api/production-mobile/register', 'POST', deviceData, false)
  },

  async logout() {
    try { await apiRequest('/api/production-mobile/logout', 'POST') } catch {}
  },

  async getProfile() {
    return apiRequest('/api/production-mobile/profile')
  },

  async getDashboard() {
    return apiRequest('/api/production-mobile/dashboard')
  },

  async getWorkOrders() {
    return apiRequest('/api/production-mobile/work-orders')
  },

  async getWorkOrder(woNumber: string) {
    return apiRequest(`/api/production-mobile/work-orders/${woNumber}`)
  },

  async startWO(woNumber: string) {
    return apiRequest(`/api/production-mobile/work-orders/${woNumber}/start`, 'POST', {})
  },

  async pauseWO(woNumber: string) {
    return apiRequest(`/api/production-mobile/work-orders/${woNumber}/pause`, 'POST', {})
  },

  async completeWO(woNumber: string, data: any) {
    return apiRequest(`/api/production-mobile/work-orders/${woNumber}/complete`, 'POST', data)
  },

  async issueMaterial(data: any) {
    return apiRequest('/api/production-mobile/material-issue', 'POST', data)
  },

  async createBatch(data: any) {
    return apiRequest('/api/production-mobile/batch/create', 'POST', data)
  },

  async printLabel(data: any) {
    return apiRequest('/api/production-mobile/labels/print', 'POST', data)
  },

  async transferWIP(data: any) {
    return apiRequest('/api/production-mobile/wip/transfer', 'POST', data)
  },

  async submitQualityCheck(data: any) {
    return apiRequest('/api/production-mobile/quality-check', 'POST', data)
  },

  async scan(barcodeValue: string, barcodeType: string = 'CODE_128', scanSource: string = 'CAMERA') {
    return apiRequest('/api/production-mobile/scan', 'POST', { barcodeValue, barcodeType, scanSource })
  },

  async lookup(query: string) {
    return apiRequest(`/api/production-mobile/inventory-lookup?q=${encodeURIComponent(query)}`)
  },

  async getSyncStatus() {
    return apiRequest('/api/production-mobile/sync/status')
  },

  async sync(transactions: any[]) {
    return apiRequest('/api/production-mobile/sync', 'POST', { transactions })
  },

  async lockDevice(deviceCode: string) {
    return apiRequest(`/api/production-mobile/devices/${deviceCode}/lock`, 'POST', {})
  },

  async wipeDevice(deviceCode: string) {
    return apiRequest(`/api/production-mobile/devices/${deviceCode}/wipe`, 'POST', {})
  },
}

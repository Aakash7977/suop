// ═════════════════════════════════════════════════════════
// SUOP Warehouse App — Type Definitions
// ═════════════════════════════════════════════════════════

export interface Operator {
  operatorId: string
  operatorCode: string
  operatorName: string
  warehouseId: string
  warehouseName: string
  primaryZoneName: string
  shiftName: string
  skillLevel: string
  overallRating: number
  certifications: string[]
  assignedEquipment: { type: string; code: string }[]
  todayStats: {
    tasksCompleted: number
    tasksPending: number
    accuracyPercent: number
    utilizationPercent: number
  }
  device: {
    code: string
    name: string
    batteryPercent: number
    connectivityStatus: string
  }
}

export interface Task {
  id: string
  taskNumber: string
  taskType: 'PICK' | 'PUTAWAY' | 'RECEIVE' | 'PACK' | 'TRANSFER' | 'COUNT' | 'LOAD' | 'DISPATCH' | 'REPLENISH'
  priority: 'EMERGENCY' | 'HIGH' | 'NORMAL' | 'LOW'
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  fromLocationCode: string
  toLocationCode: string
  productSku?: string
  productName?: string
  batchNumber?: string
  plannedQty?: string
  uom?: string
  slaDeadline: string
  waveNumber?: string
}

export interface ScanResult {
  scanCode: string
  barcodeValue: string
  barcodeType: string
  scanSource: string
  validationResult: 'VALID' | 'WRONG_PRODUCT' | 'WRONG_BATCH' | 'WRONG_BIN' | 'WRONG_QTY' | 'DUPLICATE_SCAN' | 'UNKNOWN_BARCODE'
  validationMessage: string
  product?: {
    sku: string
    name: string
    batchNumber: string
    expiryDate: string
  }
  bin?: {
    code: string
    zone: string
    availableQty: number
  }
  scanDurationMs: number
}

export interface OfflineTransaction {
  transactionCode: string
  deviceId: string
  operatorId: string
  operatorCode: string
  transactionType: string
  taskId?: string
  taskNumber?: string
  barcodeScanned?: string
  barcodeType?: string
  productSku?: string
  batchNumber?: string
  binCode?: string
  qty?: string
  uom?: string
  payload: any
  signature: string
  status: 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'CONFLICT' | 'FAILED'
  offlineCreatedAt: string
}

export interface SyncStatus {
  isOnline: boolean
  lastSyncAt: string | null
  pendingUploads: number
  pendingDownloads: number
  failedSyncs: number
  conflictsPending: number
  storageUsed: string
  storageLimit: string
  networkType: string
  syncHealth: string
}

export interface Notification {
  id: string
  notificationType: string
  title: string
  message: string
  priority: 'EMERGENCY' | 'HIGH' | 'NORMAL' | 'LOW'
  status: string
  actionType?: string
  createdAt: string
}

export interface LoginSession {
  sessionCode: string
  operatorId: string
  operatorCode: string
  operatorName: string
  warehouseId: string
  warehouseName: string
  loginMethod: string
  jwtToken: string
  refreshToken: string
  loginAt: string
  expiresAt: string
  status: string
}

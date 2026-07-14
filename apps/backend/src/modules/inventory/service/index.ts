/** Inventory Service — Stock ledger engine, FEFO/FIFO, Moving Average Cost, Expiry tracking
 *
 * Business Rules enforced:
 * - No inventory before IQC approval (stockIn requires inspection lot ID with PASSED status)
 * - Rejected inventory cannot become available
 * - Partial GRN updates PO balance (handled in GRN service)
 * - Inventory ledger is IMMUTABLE — no UPDATE or DELETE ever
 * - Every movement creates a ledger entry
 * - Batch unique per product
 * - Lot unique per product
 * - Expiry mandatory for batch-tracked products
 */
import {
  batchRepository, lotRepository, inventoryRepository,
  inventoryTransactionRepository, inventoryLedgerRepository,
  stockReservationRepository, stockBlockRepository,
} from '../repository'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { query } from '@/core/db/pglite'
import { BusinessRuleError, NotFoundError, AuthorizationError, ConcurrencyError } from '@/core/errors'
import { enforceNotBreakGlass, enforceTenantIsolation } from '@/core/security/sod-enforcement'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail, ctx }
}

export const inventoryService = {
  // ═══ Stock In (from GRN after IQC pass) ═══════════════════════════════════

  async stockIn(data: {
    grnId: string; grnNumber: string
    inspectionLotId: string
    productId: string; productSku: string; productName: string
    warehouseId: string; warehouseName: string
    binId?: string; binCode?: string
    batchNumber?: string; lotNumber?: string
    manufactureDate?: string; expiryDate?: string
    quantity: number; unitCost: number; uomId: string; uomCode: string
    currency?: string
  }) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: quantity must be positive
    if (data.quantity <= 0) throw new BusinessRuleError('Quantity must be positive', { code: 'INV.INVALID_QTY' })

    // Business rule: No inventory before IQC approval
    const lotResult = await query(`SELECT inspection_status, accept_qty FROM inspection_lots WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, data.inspectionLotId])
    if (lotResult.rows.length === 0) {
      throw new BusinessRuleError('Inspection lot not found', { code: 'INV.INSPECTION_LOT_NOT_FOUND' })
    }
    const inspectionStatus = String(lotResult.rows[0]!['inspection_status'])
    if (!['PASSED', 'CONDITIONAL_PASS'].includes(inspectionStatus)) {
      throw new BusinessRuleError(`Cannot stock in: inspection lot status is ${inspectionStatus} (must be PASSED or CONDITIONAL_PASS)`, { code: 'INV.IQC_NOT_PASSED' })
    }

    // Business rule: Expiry mandatory for batch-tracked products
    let batchId: string | null = null
    let lotId: string | null = null
    if (data.batchNumber) {
      if (!data.expiryDate) {
        throw new BusinessRuleError('Expiry date is mandatory for batch-tracked products', { code: 'INV.EXPIRY_REQUIRED' })
      }
      // Create or find batch (unique per product)
      let batch = await batchRepository.findByNumber(tenantId, data.batchNumber, data.productId)
      if (!batch) {
        batch = await batchRepository.create({
          tenantId, batchNumber: data.batchNumber, productId: data.productId, productSku: data.productSku, productName: data.productName,
          manufactureDate: data.manufactureDate, expiryDate: data.expiryDate,
          grnId: data.grnId, grnNumber: data.grnNumber,
        })
      }
      batchId = String(batch!['id'])

      // Create lot if provided
      if (data.lotNumber) {
        let lot = await lotRepository.findByNumber(tenantId, data.lotNumber, data.productId)
        if (!lot) {
          lot = await lotRepository.create({
            tenantId, lotNumber: data.lotNumber, batchId, batchNumber: data.batchNumber,
            productId: data.productId, productSku: data.productSku, productName: data.productName,
            manufactureDate: data.manufactureDate, expiryDate: data.expiryDate,
            grnId: data.grnId, grnNumber: data.grnNumber,
          })
        }
        lotId = String(lot!['id'])
      }
    }

    // Find or create inventory record
    let inventory = await inventoryRepository.findByKey(tenantId, data.productId, data.warehouseId, batchId, lotId, data.binId ?? null)
    const previousQty = inventory ? Number(inventory['quantity']) : 0
    const previousValue = inventory ? Number(inventory['total_value']) : 0

    // Moving Average Cost calculation
    const newQty = previousQty + data.quantity
    const addedValue = data.quantity * data.unitCost
    const newTotalValue = previousValue + addedValue
    const movingAvgCost = newQty > 0 ? newTotalValue / newQty : data.unitCost

    if (!inventory) {
      inventory = await inventoryRepository.create({
        tenantId, productId: data.productId, productSku: data.productSku, productName: data.productName,
        warehouseId: data.warehouseId, warehouseName: data.warehouseName,
        binId: data.binId, binCode: data.binCode,
        batchId, batchNumber: data.batchNumber, lotId, lotNumber: data.lotNumber,
        uomId: data.uomId, uomCode: data.uomCode,
        quantity: newQty, reservedQty: 0, blockedQty: 0, availableQty: newQty,
        unitCost: data.unitCost, movingAvgCost, totalValue: newTotalValue,
        currency: data.currency ?? 'INR',
        manufactureDate: data.manufactureDate, expiryDate: data.expiryDate,
        lastMovementAt: new Date().toISOString(), lastMovementType: 'STOCK_IN',
      })
    } else {
      inventory = await inventoryRepository.update(tenantId, String(inventory['id']), {
        quantity: newQty, availableQty: newQty - Number(inventory['reserved_qty']) - Number(inventory['blocked_qty']),
        unitCost: data.unitCost, movingAvgCost, totalValue: newTotalValue,
        lastMovementAt: new Date().toISOString(), lastMovementType: 'STOCK_IN',
      }, Number(inventory['version']))
      if (!inventory) throw new ConcurrencyError('Inventory was modified by another transaction')
    }

    // Create transaction (audit record)
    const txnNumber = await inventoryTransactionRepository.generateTransactionNumber(tenantId)
    await inventoryTransactionRepository.create({
      tenantId, transactionNumber: txnNumber, transactionType: 'STOCK_IN', movementType: 'STOCK_IN',
      productId: data.productId, productSku: data.productSku, productName: data.productName,
      warehouseId: data.warehouseId, warehouseName: data.warehouseName, binId: data.binId, binCode: data.binCode,
      batchId, batchNumber: data.batchNumber, lotId, lotNumber: data.lotNumber,
      uomId: data.uomId, uomCode: data.uomCode, quantity: data.quantity, unitCost: data.unitCost, totalValue: addedValue,
      currency: data.currency ?? 'INR', balanceAfter: newQty,
      referenceType: 'GRN', referenceId: data.grnId, referenceNumber: data.grnNumber,
      reason: 'Goods received and passed IQC', performedBy: userId, performedByName: ctx.userEmail, correlationId: ctx.correlationId,
    })

    // Create IMMUTABLE ledger entry
    const entryNumber = await inventoryLedgerRepository.generateEntryNumber(tenantId)
    const latestBalance = await inventoryLedgerRepository.getLatestBalance(tenantId, data.productId, data.warehouseId)
    const balanceQty = latestBalance.balanceQty + data.quantity
    const balanceValue = latestBalance.balanceValue + addedValue
    await inventoryLedgerRepository.create({
      tenantId, entryNumber, transactionId: txnNumber, transactionNumber: txnNumber,
      productId: data.productId, productSku: data.productSku, warehouseId: data.warehouseId,
      batchId, batchNumber: data.batchNumber, lotId, lotNumber: data.lotNumber,
      movementType: 'STOCK_IN', inQty: data.quantity, outQty: 0, balanceQty,
      unitCost: data.unitCost, totalValue: addedValue, balanceValue,
      referenceType: 'GRN', referenceId: data.grnId, referenceNumber: data.grnNumber,
      reason: 'Goods received and passed IQC', performedBy: userId, performedByName: ctx.userEmail, correlationId: ctx.correlationId,
    })

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'STOCK_IN', entityType: 'Inventory', entityId: String(inventory!['id']),
      after: { quantity: newQty, unitCost: data.unitCost, movingAvgCost, batchNumber: data.batchNumber },
    })
    await eventBus.writeToOutbox({
      eventName: 'StockAdded', payload: { productId: data.productId, warehouseId: data.warehouseId, quantity: data.quantity, batchNumber: data.batchNumber }, tenantId,
    })

    return inventory
  },

  // ═══ Stock Out ════════════════════════════════════════════════════════════

  async stockOut(data: {
    productId: string; productSku: string; productName: string
    warehouseId: string; warehouseName: string
    quantity: number; uomId: string; uomCode: string
    strategy?: 'FEFO' | 'FIFO'
    referenceType?: string; referenceId?: string; referenceNumber?: string
    reason: string
  }) {
    const { tenantId, userId, ctx } = getContext()

    if (data.quantity <= 0) throw new BusinessRuleError('Quantity must be positive', { code: 'INV.INVALID_QTY' })

    const strategy = data.strategy ?? 'FEFO'
    // Get stock using FEFO or FIFO
    const stockList = strategy === 'FEFO'
      ? await inventoryRepository.listFefo(tenantId, data.productId, data.warehouseId, data.quantity)
      : await inventoryRepository.listFifo(tenantId, data.productId, data.warehouseId, data.quantity)

    // Check total available quantity
    const totalAvailable = stockList.reduce((sum: number, s: Record<string, unknown>) => sum + Number(s['available_qty']), 0)
    if (totalAvailable < data.quantity) {
      throw new BusinessRuleError(`Insufficient stock. Available: ${totalAvailable}, Requested: ${data.quantity}`, { code: 'INV.INSUFFICIENT_STOCK' })
    }

    // Business rule: cannot issue from blocked/expired stock
    for (const stock of stockList) {
      if (stock['is_blocked']) {
        throw new BusinessRuleError(`Cannot issue blocked stock (batch: ${stock['batch_number'] ?? 'N/A'})`, { code: 'INV.STOCK_BLOCKED' })
      }
      if (stock['expiry_date'] && new Date(String(stock['expiry_date'])) < new Date()) {
        throw new BusinessRuleError(`Cannot issue expired stock (batch: ${stock['batch_number'] ?? 'N/A'}, expiry: ${stock['expiry_date']})`, { code: 'INV.STOCK_EXPIRED' })
      }
    }

    // Issue from oldest/expiring-soonest first
    let remainingQty = data.quantity
    const issuedStocks: Array<Record<string, unknown>> = []

    for (const stock of stockList) {
      if (remainingQty <= 0) break
      const available = Number(stock['available_qty'])
      const issueQty = Math.min(available, remainingQty)
      const newQty = Number(stock['quantity']) - issueQty
      const newAvailable = newQty - Number(stock['reserved_qty']) - Number(stock['blocked_qty'])
      const unitCost = Number(stock['unit_cost'])
      const issueValue = issueQty * unitCost
      const newTotalValue = Number(stock['total_value']) - issueValue

      const updated = await inventoryRepository.update(tenantId, String(stock['id']), {
        quantity: newQty, availableQty: newAvailable, totalValue: newTotalValue,
        lastMovementAt: new Date().toISOString(), lastMovementType: 'STOCK_OUT',
      }, Number(stock['version']))
      if (!updated) throw new ConcurrencyError('Inventory was modified by another transaction during stock-out')

      // Transaction
      const txnNumber = await inventoryTransactionRepository.generateTransactionNumber(tenantId)
      await inventoryTransactionRepository.create({
        tenantId, transactionNumber: txnNumber, transactionType: 'STOCK_OUT', movementType: 'STOCK_OUT',
        productId: data.productId, productSku: data.productSku, productName: data.productName,
        warehouseId: data.warehouseId, warehouseName: data.warehouseName,
        binId: stock['bin_id'], binCode: stock['bin_code'],
        batchId: stock['batch_id'], batchNumber: stock['batch_number'], lotId: stock['lot_id'], lotNumber: stock['lot_number'],
        uomId: data.uomId, uomCode: data.uomCode, quantity: issueQty, unitCost, totalValue: issueValue,
        currency: String(stock['currency']), balanceAfter: newQty,
        referenceType: data.referenceType, referenceId: data.referenceId, referenceNumber: data.referenceNumber,
        reason: data.reason, performedBy: userId, performedByName: ctx.userEmail, correlationId: ctx.correlationId,
      })

      // Ledger (IMMUTABLE)
      const entryNumber = await inventoryLedgerRepository.generateEntryNumber(tenantId)
      const latestBalance = await inventoryLedgerRepository.getLatestBalance(tenantId, data.productId, data.warehouseId)
      const balanceQty = latestBalance.balanceQty - issueQty
      const balanceValue = latestBalance.balanceValue - issueValue
      await inventoryLedgerRepository.create({
        tenantId, entryNumber, transactionId: txnNumber, transactionNumber: txnNumber,
        productId: data.productId, productSku: data.productSku, warehouseId: data.warehouseId,
        batchId: stock['batch_id'], batchNumber: stock['batch_number'], lotId: stock['lot_id'], lotNumber: stock['lot_number'],
        movementType: 'STOCK_OUT', inQty: 0, outQty: issueQty, balanceQty,
        unitCost, totalValue: issueValue, balanceValue,
        referenceType: data.referenceType, referenceId: data.referenceId, referenceNumber: data.referenceNumber,
        reason: data.reason, performedBy: userId, performedByName: ctx.userEmail, correlationId: ctx.correlationId,
      })

      issuedStocks.push({ inventory: updated, issueQty, unitCost, batchNumber: stock['batch_number'] })
      remainingQty -= issueQty
    }

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'STOCK_OUT', entityType: 'Inventory', entityId: data.productId,
      after: { quantity: data.quantity, strategy, issuedFrom: issuedStocks.length },
    })
    await eventBus.writeToOutbox({
      eventName: 'StockRemoved', payload: { productId: data.productId, warehouseId: data.warehouseId, quantity: data.quantity, strategy }, tenantId,
    })

    return { issued: issuedStocks, totalIssued: data.quantity - remainingQty }
  },

  // ═══ Get Inventory ════════════════════════════════════════════════════════

  async list(params: { page?: number; pageSize?: number; productId?: string; warehouseId?: string; batchId?: string; expired?: boolean } = {}) {
    const { tenantId } = getContext()
    return inventoryRepository.list(tenantId, params)
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const inv = await inventoryRepository.findById(tenantId, id)
    if (!inv) throw new NotFoundError('Inventory', id)
    return inv
  },

  // ═══ Stock Ledger (IMMUTABLE) ═════════════════════════════════════════════

  async listLedger(params: { page?: number; pageSize?: number; productId?: string; warehouseId?: string } = {}) {
    const { tenantId } = getContext()
    return inventoryLedgerRepository.list(tenantId, params)
  },

  // ═══ Transactions ═════════════════════════════════════════════════════════

  async listTransactions(params: { page?: number; pageSize?: number; productId?: string; warehouseId?: string; movementType?: string } = {}) {
    const { tenantId } = getContext()
    return inventoryTransactionRepository.list(tenantId, params)
  },

  // ═══ Reservations ═════════════════════════════════════════════════════════

  async reserveStock(data: {
    productId: string; productSku: string
    warehouseId: string; reservedQty: number; uomId: string; uomCode: string
    reservationType?: string; referenceType?: string; referenceId?: string; referenceNumber?: string
    reservedFor?: string; expiresAt?: string
  }) {
    const { tenantId, userId, ctx } = getContext()
    if (data.reservedQty <= 0) throw new BusinessRuleError('Reserved quantity must be positive', { code: 'INV.INVALID_QTY' })

    // Check available stock
    const stockList = await inventoryRepository.list(tenantId, { productId: data.productId, warehouseId: data.warehouseId, pageSize: 1000 })
    const totalAvailable = stockList.rows.reduce((sum: number, s: Record<string, unknown>) => sum + Number(s['available_qty']), 0)
    if (totalAvailable < data.reservedQty) {
      throw new BusinessRuleError(`Insufficient available stock. Available: ${totalAvailable}, Requested: ${data.reservedQty}`, { code: 'INV.INSUFFICIENT_AVAILABLE' })
    }

    const reservationNumber = await stockReservationRepository.generateReservationNumber(tenantId)
    const id = await stockReservationRepository.create({
      tenantId, reservationNumber, productId: data.productId, productSku: data.productSku,
      warehouseId: data.warehouseId, reservedQty: data.reservedQty, uomId: data.uomId, uomCode: data.uomCode,
      reservationType: data.reservationType, referenceType: data.referenceType, referenceId: data.referenceId, referenceNumber: data.referenceNumber,
      reservedBy: userId, reservedByName: ctx.userEmail, reservedFor: data.reservedFor, expiresAt: data.expiresAt,
      status: 'ACTIVE',
    })

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'STOCK_RESERVED', entityType: 'StockReservation', entityId: id, entityCode: reservationNumber, after: data,
    })

    return { id, reservationNumber }
  },

  async listReservations(params: { page?: number; pageSize?: number; status?: string; productId?: string } = {}) {
    const { tenantId } = getContext()
    return stockReservationRepository.list(tenantId, params)
  },

  async releaseReservation(id: string, reason: string) {
    const { tenantId, userId, ctx } = getContext()
    const released = await stockReservationRepository.release(tenantId, id, userId, reason)
    if (!released) throw new BusinessRuleError('Reservation not found or not active', { code: 'INV.RESERVATION_NOT_ACTIVE' })
    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'STOCK_RESERVATION_RELEASED', entityType: 'StockReservation', entityId: id, after: { reason },
    })
    return released
  },

  // ═══ Stock Blocks ═════════════════════════════════════════════════════════

  async blockStock(data: {
    productId: string; productSku: string; warehouseId: string
    blockedQty: number; uomId: string; uomCode: string
    blockType?: string; blockReason: string
    sourceType?: string; sourceId?: string; sourceNumber?: string
  }) {
    const { tenantId, userId, ctx } = getContext()
    if (data.blockedQty <= 0) throw new BusinessRuleError('Blocked quantity must be positive', { code: 'INV.INVALID_QTY' })

    const blockNumber = await stockBlockRepository.generateBlockNumber(tenantId)
    const id = await stockBlockRepository.create({
      tenantId, blockNumber, productId: data.productId, productSku: data.productSku, warehouseId: data.warehouseId,
      blockedQty: data.blockedQty, uomId: data.uomId, uomCode: data.uomCode,
      blockType: data.blockType ?? 'QUALITY_HOLD', blockReason: data.blockReason,
      sourceType: data.sourceType, sourceId: data.sourceId, sourceNumber: data.sourceNumber,
      blockedBy: userId, blockedByName: ctx.userEmail, status: 'ACTIVE',
    })

    await auditService.log({
      tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail,
      action: 'STOCK_BLOCKED', entityType: 'StockBlock', entityId: id, entityCode: blockNumber, after: data,
    })
    await eventBus.writeToOutbox({
      eventName: 'StockBlocked', payload: { productId: data.productId, warehouseId: data.warehouseId, blockedQty: data.blockedQty, blockReason: data.blockReason }, tenantId,
    })

    return { id, blockNumber }
  },

  async listBlocks(params: { page?: number; pageSize?: number; status?: string } = {}) {
    const { tenantId } = getContext()
    return stockBlockRepository.list(tenantId, params)
  },

  // ═══ Expiry Tracking ══════════════════════════════════════════════════════

  async getExpiringStock(daysAhead: number = 30) {
    const { tenantId } = getContext()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + daysAhead)
    const result = await query(`SELECT * FROM inventory WHERE tenant_id = $1 AND deleted_at IS NULL AND quantity > 0 AND expiry_date IS NOT NULL AND expiry_date <= $2 ORDER BY expiry_date ASC`, [tenantId, cutoff.toISOString()])
    return result.rows
  },

  async markExpired() {
    const { tenantId, userId, ctx } = getContext()
    const result = await query(`UPDATE inventory SET is_expired = true, updated_at = NOW(), version = version + 1 WHERE tenant_id = $1 AND deleted_at IS NULL AND expiry_date < NOW() AND is_expired = false RETURNING id, product_sku, batch_number, expiry_date`, [tenantId])
    if (result.rows.length > 0) {
      await auditService.log({
        tenantId, correlationId: ctx.correlationId, actorType: 'SYSTEM', actorId: userId, actorName: ctx.userEmail,
        action: 'STOCK_EXPIRED', entityType: 'Inventory', entityId: 'batch', after: { expiredCount: result.rows.length, items: result.rows },
      })
    }
    return { expiredCount: result.rows.length }
  },

  // ═══ Batches & Lots ═══════════════════════════════════════════════════════

  async listBatches(params: { page?: number; pageSize?: number; productId?: string; search?: string } = {}) {
    const { tenantId } = getContext()
    return batchRepository.list(tenantId, params)
  },
}

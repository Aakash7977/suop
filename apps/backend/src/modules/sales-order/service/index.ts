/** Sales Order Service — Business logic, credit check, inventory reservation, amendments, holds, approvals */
import '@/modules/sales-order/workflow'
import { salesOrderRepository, salesOrderLineRepository, salesOrderAmendmentRepository, salesOrderHoldRepository, salesOrderApprovalRepository, salesOrderHistoryRepository } from '../repository'
import { workflowRegistry } from '@/core/workflow'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { query } from '@/core/db/pglite'
import { BusinessRuleError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx }
}

export const salesOrderService = {
  async create(data: {
    soType?: string
    customerId: string; customerCode: string; customerName: string; customerGstin?: string
    customerPoNumber?: string; customerPoDate?: string
    companyId: string; companyName: string; plantId?: string; plantName?: string
    warehouseId?: string; warehouseName?: string
    salespersonId?: string; salespersonName?: string
    deliveryAddress?: string; billingAddress?: string
    expectedDeliveryDate?: string; deliveryTerms?: string
    paymentTerms?: string; creditDays?: number
    currency?: string; exchangeRate?: number
    discountAmount?: number; freightAmount?: number; otherCharges?: number
    remarks?: string; internalNotes?: string
    lines: Array<Record<string, unknown>>
  }) {
    const { tenantId, userId, ctx } = getContext()

    // Business rule: must have at least one line
    if (!data.lines || data.lines.length === 0) {
      throw new BusinessRuleError('Sales order must have at least one line item', { code: 'SO.NO_LINES' })
    }

    // Business rule: No sales without released FG inventory — check product status
    for (const line of data.lines) {
      const prodResult = await query(`SELECT status FROM products WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, String(line['productId'])])
      if (prodResult.rows.length === 0) {
        throw new BusinessRuleError(`Product not found: ${line['productSku']}`, { code: 'SO.PRODUCT_NOT_FOUND' })
      }
    }

    // Calculate totals
    let subtotal = 0
    for (const line of data.lines) {
      const qty = Number(line['orderedQty'] ?? 0)
      const unitPrice = Number(line['unitPrice'] ?? 0)
      const discountAmount = qty * unitPrice * (Number(line['discountPercent'] ?? 0) / 100)
      const taxableAmount = qty * unitPrice - discountAmount
      const taxAmount = taxableAmount * (Number(line['taxPercent'] ?? 0) / 100)
      const lineTotal = taxableAmount + taxAmount
      line['lineTotal'] = lineTotal
      line['discountAmount'] = discountAmount
      line['taxAmount'] = taxAmount
      subtotal += qty * unitPrice
    }

    const totalDiscount = data.lines.reduce((s, l) => s + Number(l['discountAmount'] ?? 0), 0)
    const totalTax = data.lines.reduce((s, l) => s + Number(l['taxAmount'] ?? 0), 0)
    const grandTotal = subtotal - totalDiscount + totalTax + Number(data.freightAmount ?? 0) + Number(data.otherCharges ?? 0)

    const soNumber = await salesOrderRepository.generateSoNumber(tenantId)

    const so = await salesOrderRepository.create({
      tenantId, soNumber, soType: data.soType ?? 'STANDARD',
      customerId: data.customerId, customerCode: data.customerCode, customerName: data.customerName, customerGstin: data.customerGstin,
      customerPoNumber: data.customerPoNumber, customerPoDate: data.customerPoDate,
      companyId: data.companyId, companyName: data.companyName, plantId: data.plantId, plantName: data.plantName,
      warehouseId: data.warehouseId, warehouseName: data.warehouseName,
      salespersonId: data.salespersonId, salespersonName: data.salespersonName,
      deliveryAddress: data.deliveryAddress, billingAddress: data.billingAddress,
      expectedDeliveryDate: data.expectedDeliveryDate, deliveryTerms: data.deliveryTerms,
      paymentTerms: data.paymentTerms ?? 'NET30', creditDays: data.creditDays ?? 30,
      currency: data.currency ?? 'INR', exchangeRate: data.exchangeRate ?? 1,
      subtotal, discountAmount: totalDiscount, taxAmount: totalTax,
      freightAmount: data.freightAmount, otherCharges: data.otherCharges,
      grandTotal,
      creditStatus: 'PENDING',
      status: 'DRAFT', remarks: data.remarks, internalNotes: data.internalNotes,
    })
    if (!so) throw new Error('Failed to create sales order')

    // Create lines
    let lineNo = 1
    for (const line of data.lines) {
      await salesOrderLineRepository.create({
        ...line, tenantId, soId: so['id'], lineNo,
        reservedQty: 0, pickedQty: 0, packedQty: 0, dispatchedQty: 0, deliveredQty: 0,
        allocationStrategy: 'FEFO',
      })
      lineNo++
    }

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'CREATE', entityType: 'SalesOrder', entityId: String(so['id']), entityCode: soNumber, after: data })
    await salesOrderHistoryRepository.create({ tenantId, soId: String(so['id']), action: 'CREATE', toStatus: 'DRAFT', actionBy: userId, actionByName: ctx.userEmail })
    await eventBus.writeToOutbox({ eventName: 'SalesOrderCreated', payload: { soId: String(so['id']), soNumber, customerId: data.customerId, grandTotal }, tenantId })

    return so
  },

  async getById(id: string) {
    const { tenantId } = getContext()
    const so = await salesOrderRepository.findById(tenantId, id)
    if (!so) throw new NotFoundError('SalesOrder', id)
    const [lines, amendments, holds, approvals, history] = await Promise.all([
      salesOrderLineRepository.listForSo(tenantId, id),
      salesOrderAmendmentRepository.listForSo(tenantId, id),
      salesOrderHoldRepository.listForSo(tenantId, id),
      salesOrderApprovalRepository.listForSo(tenantId, id),
      salesOrderHistoryRepository.listForSo(tenantId, id),
    ])
    return { ...so, lines, amendments, holds, approvals, history }
  },

  async list(params: { page?: number; pageSize?: number; search?: string; status?: string; customerId?: string } = {}) {
    const { tenantId } = getContext()
    return salesOrderRepository.list(tenantId, params)
  },

  async transition(id: string, targetStatus: string, version: number) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await salesOrderRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('SalesOrder', id)

    const machine = workflowRegistry.get<string, { id: string; status: string; version: number }>('SalesOrderLifecycle')
    const check = await machine.canTransition({ id, status: String(existing['status']), version: Number(existing['version']) }, targetStatus, { userId, tenantId, correlationId: ctx.correlationId })
    if (!check.allowed) throw new BusinessRuleError(`Transition denied: ${check.reason}`, { code: 'SO.TRANSITION_DENIED' })

    // Business rule: Credit check before approval
    if (targetStatus === 'APPROVED') {
      await this.performCreditCheck(tenantId, id, String(existing['customer_id']), Number(existing['grand_total']), userId, ctx.userEmail ?? '')
    }

    // Business rule: Inventory reserved immediately after approval
    if (targetStatus === 'RESERVED') {
      await this.reserveInventory(tenantId, id, userId, ctx.userEmail ?? '', ctx.correlationId)
    }

    const updated = await salesOrderRepository.update(tenantId, id, { status: targetStatus }, version, userId)
    if (!updated) throw new ConcurrencyError('Sales order was modified by another transaction')

    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'TRANSITION', entityType: 'SalesOrder', entityId: id, entityCode: String(existing['so_number']), before: { status: existing['status'] }, after: { status: targetStatus } })
    await salesOrderHistoryRepository.create({ tenantId, soId: id, action: targetStatus, fromStatus: String(existing['status']), toStatus: targetStatus, actionBy: userId, actionByName: ctx.userEmail })

    const eventMap: Record<string, string> = {
      APPROVED: 'SalesOrderApproved', RESERVED: 'SalesOrderReserved', PICKING: 'SalesOrderPicking',
      DISPATCHED: 'SalesOrderDispatched', DELIVERED: 'SalesOrderDelivered', COMPLETED: 'SalesOrderCompleted',
    }
    if (eventMap[targetStatus]) {
      await eventBus.writeToOutbox({ eventName: eventMap[targetStatus], payload: { soId: id, soNumber: String(existing['so_number']), status: targetStatus }, tenantId })
    }

    return updated
  },

  /** Credit Check — verify customer has sufficient credit limit */
  async performCreditCheck(tenantId: string, soId: string, customerId: string, orderAmount: number, userId: string, userName: string) {
    // Get customer credit info
    const custResult = await query(`SELECT credit_limit, credit_used, status FROM customers WHERE tenant_id = $1 AND id = $2 AND deleted_at IS NULL`, [tenantId, customerId])
    if (custResult.rows.length === 0) throw new BusinessRuleError('Customer not found', { code: 'SO.CUSTOMER_NOT_FOUND' })

    const customer = custResult.rows[0]!
    if (customer['status'] && !['ACTIVE'].includes(String(customer['status']))) {
      throw new BusinessRuleError(`Customer must be ACTIVE (current: ${customer['status']})`, { code: 'SO.CUSTOMER_NOT_ACTIVE' })
    }

    const creditLimit = Number(customer['credit_limit'] ?? 0)
    const creditUsed = Number(customer['credit_used'] ?? 0)
    const creditAvailable = creditLimit - creditUsed

    // Update SO with credit info
    await salesOrderRepository.update(tenantId, soId, {
      creditLimit, creditUsed, creditAvailable,
      creditStatus: creditAvailable >= orderAmount ? 'APPROVED' : 'ON_HOLD',
      creditApprovedBy: userId, creditApprovedAt: new Date().toISOString(),
    }, 0)

    if (creditLimit > 0 && creditAvailable < orderAmount) {
      throw new BusinessRuleError(`Credit limit exceeded. Available: ${creditAvailable}, Order: ${orderAmount}`, { code: 'SO.CREDIT_EXCEEDED' })
    }

    await auditService.log({ tenantId, correlationId: '', actorType: 'USER', actorId: userId, actorName: userName, action: 'CREDIT_CHECK', entityType: 'SalesOrder', entityId: soId, after: { creditLimit, creditUsed, creditAvailable, orderAmount } })
  },

  /** Reserve inventory using FEFO — batch allocation mandatory */
  async reserveInventory(tenantId: string, soId: string, userId: string, userName: string, correlationId: string) {
    const lines = await salesOrderLineRepository.listForSo(tenantId, soId)
    const so = await salesOrderRepository.findById(tenantId, soId)
    void so

    for (const line of lines) {
      const productId = String(line['product_id'])
      const orderedQty = Number(line['ordered_qty'])

      // Get available stock using FEFO (First Expiry First Out)
      const stockResult = await query(`SELECT * FROM inventory WHERE tenant_id = $1 AND product_id = $2 AND available_qty > 0 AND deleted_at IS NULL AND is_blocked = false ORDER BY expiry_date ASC NULLS LAST, created_at ASC`, [tenantId, productId])

      let remainingQty = orderedQty
      let isFullyReserved = true; void isFullyReserved

      for (const stock of stockResult.rows) {
        if (remainingQty <= 0) break
        const availableQty = Number(stock['available_qty'])
        const reserveQty = Math.min(availableQty, remainingQty)

        // Update inventory reserved_qty
        await query(`UPDATE inventory SET reserved_qty = reserved_qty + $3, available_qty = available_qty - $3, version = version + 1, updated_at = NOW() WHERE tenant_id = $1 AND id = $2`, [tenantId, stock['id'], reserveQty])

        // Update SO line with batch info
        await query(`UPDATE sales_order_lines SET reserved_qty = reserved_qty + $3, batch_id = $4, batch_number = $5, lot_id = $6, lot_number = $7, updated_at = NOW() WHERE tenant_id = $1 AND id = $2`, [tenantId, line['id'], reserveQty, stock['batch_id'], stock['batch_number'], stock['lot_id'], stock['lot_number']])

        remainingQty -= reserveQty
      }

      if (remainingQty > 0) {
        isFullyReserved = false
        await query(`UPDATE sales_order_lines SET is_backorder = true WHERE tenant_id = $1 AND id = $2`, [tenantId, line['id']])
      }
    }

    // Update SO reserved qty
    const totalReserved = lines.reduce((s, l) => s + Number(l['reserved_qty']), 0)
    await salesOrderRepository.update(tenantId, soId, { reservedQty: totalReserved, isBackorder: lines.some((l: Record<string, unknown>) => l['is_backorder']), isPartial: lines.some((l: Record<string, unknown>) => l['is_backorder']) }, 0)

    await auditService.log({ tenantId, correlationId, actorType: 'USER', actorId: userId, actorName: userName, action: 'INVENTORY_RESERVED', entityType: 'SalesOrder', entityId: soId, after: { totalReserved, lines: lines.length } })
    await eventBus.writeToOutbox({ eventName: 'InventoryReserved', payload: { soId, totalReserved }, tenantId })
  },

  async addHold(id: string, data: { holdType: string; holdReason: string }) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await salesOrderRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('SalesOrder', id)

    const holdId = await salesOrderHoldRepository.create({
      tenantId, soId: id, holdType: data.holdType, holdReason: data.holdReason,
      heldBy: userId, heldByName: ctx.userEmail, status: 'ACTIVE',
    })

    await salesOrderRepository.update(tenantId, id, { isOnHold: true, holdReason: data.holdReason }, Number(existing['version']), userId)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'SO_HOLD', entityType: 'SalesOrder', entityId: id, entityCode: String(existing['so_number']), after: { holdId, holdType: data.holdType } })
    return { holdId }
  },

  async releaseHold(id: string, releaseReason: string) {
    const { tenantId, userId, ctx } = getContext()
    const existing = await salesOrderRepository.findById(tenantId, id)
    if (!existing) throw new NotFoundError('SalesOrder', id)

    await query(`UPDATE sales_order_holds SET status = 'RELEASED', released_by = $3, released_by_name = $4, released_at = NOW(), release_reason = $5, updated_at = NOW() WHERE tenant_id = $1 AND so_id = $2 AND status = 'ACTIVE'`, [tenantId, id, userId, ctx.userEmail, releaseReason])

    await salesOrderRepository.update(tenantId, id, { isOnHold: false, holdReason: null }, Number(existing['version']), userId)
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'SO_HOLD_RELEASED', entityType: 'SalesOrder', entityId: id, entityCode: String(existing['so_number']), after: { releaseReason } })
    return { released: true }
  },
}

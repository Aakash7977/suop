import { query } from '@/core/db/pglite'
import { pickListRepository, packingListRepository, shipmentRepository, genPickNumber, genPackNumber, genShipNumber } from '../repository'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { AuthorizationError } from '@/core/errors'
function getContext() { const ctx = getRequestContext(); if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required'); return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx } }

export const pickPackDispatchService = {
  async createPickList(data: { waveId?: string; waveNumber?: string; warehouseId: string; warehouseName: string; pickerId?: string; pickerName?: string; soIds: string[] }) {
    const { tenantId, userId, ctx } = getContext()
    const pickNumber = await genPickNumber(tenantId)
    let totalLines = 0; let totalQty = 0
    for (const soId of data.soIds) { const r = await query<{ cnt: string; qty: string }>(`SELECT COUNT(*) as cnt, COALESCE(SUM(ordered_qty), 0) as qty FROM sales_order_lines WHERE tenant_id = $1 AND so_id = $2`, [tenantId, soId]); totalLines += Number(r.rows[0]!.cnt); totalQty += Number(r.rows[0]!.qty) }
    const pick = await pickListRepository.create({ tenantId, pickNumber, waveId: data.waveId, waveNumber: data.waveNumber, warehouseId: data.warehouseId, warehouseName: data.warehouseName, pickerId: data.pickerId, pickerName: data.pickerName, totalLines, totalQty, pickedQty: 0, shortQty: 0, pickStrategy: 'FEFO', status: 'CREATED' })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'PICK_LIST_CREATED', entityType: 'PickList', entityId: String(pick!['id']), entityCode: pickNumber, after: { totalLines, totalQty } })
    return pick
  },
  async listPickLists(params: { page?: number; pageSize?: number; status?: string } = {}) { const { tenantId } = getContext(); return pickListRepository.list(tenantId, params) },
  async createPackingList(data: { pickListId?: string; pickNumber?: string; warehouseId: string; warehouseName: string; packerId?: string; packerName?: string; totalLines: number; totalQty: number }) {
    const { tenantId, userId, ctx } = getContext()
    const packingNumber = await genPackNumber(tenantId)
    const pack = await packingListRepository.create({ tenantId, packingNumber, pickListId: data.pickListId, pickNumber: data.pickNumber, warehouseId: data.warehouseId, warehouseName: data.warehouseName, packerId: data.packerId, packerName: data.packerName, totalLines: data.totalLines, totalQty: data.totalQty, packedQty: 0, boxCount: 0, status: 'CREATED' })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'PACKING_LIST_CREATED', entityType: 'PackingList', entityId: String(pack!['id']), entityCode: packingNumber })
    return pack
  },
  async listPackingLists(params: { page?: number; pageSize?: number; status?: string } = {}) { const { tenantId } = getContext(); return packingListRepository.list(tenantId, params) },
  async createShipment(data: { packingListId?: string; packingNumber?: string; soId?: string; soNumber?: string; warehouseId: string; warehouseName: string; customerId?: string; customerName?: string; shipToAddress?: string; shipToCity?: string; shipToState?: string; transporterName?: string; vehicleNumber?: string; driverName?: string; driverMobile?: string; lrNumber?: string; totalQty?: number; totalWeight?: number; boxCount?: number; freightAmount?: number; freightPaidBy?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const shipmentNumber = await genShipNumber(tenantId)
    const ship = await shipmentRepository.create({ tenantId, shipmentNumber, ...data, freightPaidBy: data.freightPaidBy ?? 'CUSTOMER', status: 'CREATED', dispatchedBy: userId, dispatchedByName: ctx.userEmail, dispatchedAt: new Date().toISOString() })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'SHIPMENT_CREATED', entityType: 'Shipment', entityId: String(ship!['id']), entityCode: shipmentNumber })
    await eventBus.writeToOutbox({ eventName: 'ShipmentCreated', payload: { shipmentId: String(ship!['id']), shipmentNumber }, tenantId })
    return ship
  },
  async listShipments(params: { page?: number; pageSize?: number; status?: string } = {}) { const { tenantId } = getContext(); return shipmentRepository.list(tenantId, params) },
}

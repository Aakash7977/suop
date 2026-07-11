import { deliveryOrderRepository, proofOfDeliveryRepository, deliveryExceptionRepository, genDeliverNumber } from '../repository'
import { auditService } from '@/core/audit'
import { eventBus } from '@/core/events'
import { getRequestContext } from '@/core/context'
import { BusinessRuleError, AuthorizationError } from '@/core/errors'
function getContext() { const ctx = getRequestContext(); if (!ctx?.tenantId || !ctx?.userId) throw new AuthorizationError('Authentication required'); return { tenantId: ctx.tenantId, userId: ctx.userId, userEmail: ctx.userEmail ?? '', ctx } }

export const deliveryManagementService = {
  async createDeliveryOrder(data: { shipmentId: string; shipmentNumber: string; soId?: string; soNumber?: string; customerId?: string; customerName?: string; deliveryAddress?: string; deliveryCity?: string; deliveryState?: string; deliveryPincode?: string; deliveryContact?: string; deliveryPhone?: string; scheduledDate?: string; totalQty?: number; totalWeight?: number; driverName?: string; driverMobile?: string; vehicleNumber?: string; deliveryType?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const deliveryNumber = await genDeliverNumber(tenantId)
    const delivery = await deliveryOrderRepository.create({ tenantId, deliveryNumber, ...data, status: 'CREATED' })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'DELIVERY_ORDER_CREATED', entityType: 'DeliveryOrder', entityId: String(delivery!['id']), entityCode: deliveryNumber })
    return delivery
  },
  async listDeliveryOrders(params: { page?: number; pageSize?: number; status?: string } = {}) { const { tenantId } = getContext(); return deliveryOrderRepository.list(tenantId, params) },
  async createPod(data: { deliveryOrderId: string; deliveryNumber?: string; receivedBy?: string; receivedByName?: string; receivedByDesignation?: string; customerSignature?: string; signatureImageUrl?: string; gpsLatitude?: number; gpsLongitude?: number; gpsTimestamp?: string; deliveryPhotoUrl?: string; deliveredQty: number; damagedQty?: number; shortQty?: number; deliveryStatus?: string; customerRemarks?: string; driverRemarks?: string }) {
    const { tenantId, userId, ctx } = getContext()
    if (data.deliveredQty <= 0) throw new BusinessRuleError('Delivered quantity must be positive', { code: 'POD.INVALID_QTY' })
    const pod = await proofOfDeliveryRepository.create({ tenantId, ...data, deliveryStatus: data.deliveryStatus ?? 'DELIVERED', confirmedBy: userId, confirmedByName: ctx.userEmail, confirmedAt: new Date().toISOString() })
    // Update delivery order status
    await import('@/core/db/pglite').then(m => m.query(`UPDATE delivery_orders SET status = 'DELIVERED', actual_arrival = NOW(), updated_at = NOW() WHERE tenant_id = $1 AND id = $2`, [tenantId, data.deliveryOrderId]))
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'POD_CREATED', entityType: 'ProofOfDelivery', entityId: String(pod!['id']), after: { deliveredQty: data.deliveredQty, deliveryStatus: data.deliveryStatus ?? 'DELIVERED' } })
    await eventBus.writeToOutbox({ eventName: 'DeliveryConfirmed', payload: { deliveryOrderId: data.deliveryOrderId, deliveredQty: data.deliveredQty }, tenantId })
    return pod
  },
  async listPods(params: { page?: number; pageSize?: number } = {}) { const { tenantId } = getContext(); return proofOfDeliveryRepository.list(tenantId, params) },
  async createException(data: { deliveryOrderId: string; deliveryNumber?: string; exceptionType: string; exceptionReason: string; rescheduledDate?: string; rescheduleReason?: string }) {
    const { tenantId, userId, ctx } = getContext()
    const exc = await deliveryExceptionRepository.create({ tenantId, ...data, reportedBy: userId, reportedByName: ctx.userEmail, status: 'OPEN' })
    await auditService.log({ tenantId, correlationId: ctx.correlationId, actorType: 'USER', actorId: userId, actorName: ctx.userEmail, action: 'DELIVERY_EXCEPTION', entityType: 'DeliveryException', entityId: String(exc!['id']), after: { exceptionType: data.exceptionType, exceptionReason: data.exceptionReason } })
    return exc
  },
  async listExceptions(params: { page?: number; pageSize?: number; status?: string } = {}) { const { tenantId } = getContext(); return deliveryExceptionRepository.list(tenantId, params) },
}

/**
 * Hono Application Composition
 *
 * Middleware registration order (per Phase 0 Architecture §4.3):
 *   1. RequestId    — assigns correlation ID
 *   2. Logging      — logs request start
 *   3. Auth         — validates JWT (errors caught by onError)
 *   4. Tenant       — loads tenant context
 *   5. RBAC         — checks permissions (per-route)
 *   6. Audit        — records mutations
 *   7. Validation   — validates request body (per-route)
 *
 * Error handling via Hono's app.onError() — catches all unhandled errors.
 */

import { Hono } from 'hono'
import { requestIdMiddleware } from '@/middleware/request-id'
import { loggingMiddleware } from '@/middleware/logging'
import { authMiddleware } from '@/middleware/auth'
import { tenantMiddleware } from '@/middleware/tenant'
import { auditMiddleware } from '@/middleware/audit'
import { systemRoutes } from '@/routes/system'
import { organizationRoutes } from '@/modules/organization/routes'
import { authRoutes } from '@/modules/auth/routes'
import { userManagementRoutes } from '@/modules/user-management/routes'
import { productRoutes } from '@/modules/product/routes'
import { supplierRoutes } from '@/modules/supplier/routes'
import { customerRoutes } from '@/modules/customer/routes'
import { procurementRoutes } from '@/modules/procurement/routes'
import { rfqRoutes } from '@/modules/rfq/routes'
import { quotationRoutes } from '@/modules/quotation/routes'
import { purchaseOrderRoutes } from '@/modules/purchase-order/routes'
import { goodsReceiptRoutes } from '@/modules/goods-receipt/routes'
import { qualityInspectionRoutes } from '@/modules/quality-inspection/routes'
import { inventoryRoutes } from '@/modules/inventory/routes'
import { warehouseRoutes } from '@/modules/warehouse/routes'
import { mesRoutes } from '@/modules/mes/routes'
import { recipeBomRoutes } from '@/modules/recipe-bom/routes'
import { productionPlanningRoutes } from '@/modules/production-planning/routes'
import { productionOrderRoutes } from '@/modules/production-order/routes'
import { batchManufacturingRoutes } from '@/modules/batch-manufacturing/routes'
import { fgqcRoutes } from '@/modules/fgqc/routes'
import { qualityFoundationRoutes } from '@/modules/quality-foundation/routes'
import { ncrManagementRoutes } from '@/modules/ncr-management/routes'
import { capaManagementRoutes } from '@/modules/capa-management/routes'
import { coaManagementRoutes } from '@/modules/coa-management/routes'
import { recallManagementRoutes } from '@/modules/recall-management/routes'
import { supplierQualityRoutes } from '@/modules/supplier-quality/routes'
import { salesOrderRoutes } from '@/modules/sales-order/routes'
import { pricingEngineRoutes } from '@/modules/pricing-engine/routes'
import { orderFulfillmentRoutes } from '@/modules/order-fulfillment/routes'
import { pickPackDispatchRoutes } from '@/modules/pick-pack-dispatch/routes'
import { deliveryManagementRoutes } from '@/modules/delivery-management/routes'
import { customerReturnsRoutes } from '@/modules/customer-returns/routes'
import { toBaseError, getHttpStatus } from '@/core/errors'
import { error, type ResponseMeta } from '@/core/response'
import { logger } from '@/core/logging'
import { getRequestContext } from '@/core/context'

export function createApp() {
  const app = new Hono()

  // ─── Global Middleware ────────────────────────────────────────────────────
  app.use('*', requestIdMiddleware)
  app.use('*', loggingMiddleware)
  app.use('*', authMiddleware)
  app.use('*', tenantMiddleware)
  app.use('*', auditMiddleware)

  // ─── Error Handler (Hono native — catches all unhandled errors) ───────────
  app.onError((err, _c) => {
    const baseError = toBaseError(err)
    const status = getHttpStatus(baseError)

    if (status >= 500) {
      logger.error('Unhandled error', {
        error: baseError.message,
        code: baseError.code,
        stack: baseError.stack,
      })
    } else if (status >= 400) {
      logger.warn('Client error', {
        error: baseError.message,
        code: baseError.code,
      })
    }

    const ctx = getRequestContext()
    const meta: ResponseMeta | undefined = ctx
      ? { correlationId: ctx.correlationId }
      : undefined

    const envelope = error(baseError.toJSON(), meta)

    return new Response(JSON.stringify(envelope), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  })

  // ─── Routes ───────────────────────────────────────────────────────────────
  app.route('/api/v1', systemRoutes)
  app.route('/api/v1/organization', organizationRoutes)
  app.route('/api/v1/auth', authRoutes)
  app.route('/api/v1/admin', userManagementRoutes)
  app.route('/api/v1/catalog', productRoutes)
  app.route('/api/v1/procurement', supplierRoutes)
  app.route('/api/v1/sales', customerRoutes)
  app.route('/api/v1/procurement/requisitions', procurementRoutes)
  app.route('/api/v1/procurement/rfqs', rfqRoutes)
  app.route('/api/v1/procurement/quotations', quotationRoutes)
  app.route('/api/v1/procurement/purchase-orders', purchaseOrderRoutes)
  app.route('/api/v1/warehouse/grns', goodsReceiptRoutes)
  app.route('/api/v1/quality', qualityInspectionRoutes)
  app.route('/api/v1/inventory', inventoryRoutes)
  app.route('/api/v1/warehouse', warehouseRoutes)
  app.route('/api/v1/mes', mesRoutes)
  app.route('/api/v1/manufacturing/recipes', recipeBomRoutes)
  app.route('/api/v1/manufacturing/planning', productionPlanningRoutes)
  app.route('/api/v1/manufacturing/orders', productionOrderRoutes)
  app.route('/api/v1/manufacturing/batches', batchManufacturingRoutes)
  app.route('/api/v1/manufacturing/fgqc', fgqcRoutes)
  app.route('/api/v1/quality/foundation', qualityFoundationRoutes)
  app.route('/api/v1/quality/ncr', ncrManagementRoutes)
  app.route('/api/v1/quality/capa', capaManagementRoutes)
  app.route('/api/v1/quality/coa', coaManagementRoutes)
  app.route('/api/v1/quality/recall', recallManagementRoutes)
  app.route('/api/v1/quality/supplier', supplierQualityRoutes)
  app.route('/api/v1/sales/orders', salesOrderRoutes)
  app.route('/api/v1/sales/pricing', pricingEngineRoutes)
  app.route('/api/v1/sales/fulfillment', orderFulfillmentRoutes)
  app.route('/api/v1/sales/pick-pack-dispatch', pickPackDispatchRoutes)
  app.route('/api/v1/sales/delivery', deliveryManagementRoutes)
  app.route('/api/v1/sales/returns', customerReturnsRoutes)

  // ─── 404 Handler ──────────────────────────────────────────────────────────
  app.notFound((c) => {
    const ctx = getRequestContext()
    const meta: ResponseMeta | undefined = ctx
      ? { correlationId: ctx.correlationId }
      : undefined

    return new Response(
      JSON.stringify(
        error(
          {
            code: 'NOT_FOUND',
            message: `Route ${c.req.method} ${c.req.path} not found`,
          },
          meta
        )
      ),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  })

  return app
}

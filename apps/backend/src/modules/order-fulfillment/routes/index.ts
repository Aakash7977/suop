/** Order Fulfillment API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { orderFulfillmentService } from '../service'

export const orderFulfillmentRoutes = new Hono()

const allocSchema = z.object({
  soId: z.string().uuid(), soNumber: z.string().min(1), soLineId: z.string().uuid(),
  productId: z.string().uuid(), productSku: z.string().min(1), productName: z.string().min(1),
  warehouseId: z.string().uuid(), warehouseName: z.string().min(1),
  orderedQty: z.number().positive(), uomId: z.string().uuid().optional(), uomCode: z.string().optional(),
})

const waveSchema = z.object({
  warehouseId: z.string().uuid(), warehouseName: z.string().min(1),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  soIds: z.array(z.string().uuid()).min(1),
})

// ─── Allocations ────────────────────────────────────────────────────────────

orderFulfillmentRoutes.get('/allocations', requirePermission(Permission.ALLOCATION_READ), async (c) => {
  const r = await orderFulfillmentService.listAllocations({
    page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25),
    status: c.req.query('status') ?? undefined, search: c.req.query('search') ?? undefined,
    warehouseId: c.req.query('warehouseId') ?? undefined, soId: c.req.query('soId') ?? undefined,
  })
  return c.json(paginated(r.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: r.page, pageSize: r.pageSize, total: r.total }))
})

orderFulfillmentRoutes.post('/allocations', requirePermission(Permission.ALLOCATION_CREATE), zValidator('json', allocSchema), async (c) => {
  const b = c.req.valid('json' as never) as z.infer<typeof allocSchema>
  const a = await orderFulfillmentService.createAllocation(b)
  return c.json(success(a, { message: 'Allocation created' }), 201)
})

orderFulfillmentRoutes.post('/allocations/:id/cancel', requirePermission(Permission.ALLOCATION_CANCEL), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  const updated = await orderFulfillmentService.cancelAllocation(c.req.param('id')!, version)
  return c.json(success(updated, { message: 'Allocation cancelled' }))
})

orderFulfillmentRoutes.get('/allocations/export', requirePermission(Permission.ALLOCATION_READ), async (c) => {
  const result = await orderFulfillmentService.exportAllocations({
    status: c.req.query('status') ?? undefined,
    warehouseId: c.req.query('warehouseId') ?? undefined,
    soId: c.req.query('soId') ?? undefined,
  })
  return c.json(success(result.rows, { message: `${result.rows.length} allocations exported` }))
})

// ─── Wave Plans ────────────────────────────────────────────────────────────

orderFulfillmentRoutes.get('/waves', requirePermission(Permission.WAVE_READ), async (c) => {
  const r = await orderFulfillmentService.listWavePlans({
    page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25),
    status: c.req.query('status') ?? undefined, search: c.req.query('search') ?? undefined,
    warehouseId: c.req.query('warehouseId') ?? undefined,
  })
  return c.json(paginated(r.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: r.page, pageSize: r.pageSize, total: r.total }))
})

orderFulfillmentRoutes.post('/waves', requirePermission(Permission.WAVE_CREATE), zValidator('json', waveSchema), async (c) => {
  const b = c.req.valid('json' as never) as z.infer<typeof waveSchema>
  const w = await orderFulfillmentService.createWavePlan(b)
  return c.json(success(w, { message: 'Wave plan created' }), 201)
})

orderFulfillmentRoutes.post('/waves/:id/release', requirePermission(Permission.WAVE_RELEASE), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  const updated = await orderFulfillmentService.releaseWave(c.req.param('id')!, version)
  return c.json(success(updated, { message: 'Wave released' }))
})

orderFulfillmentRoutes.post('/waves/:id/cancel', requirePermission(Permission.WAVE_CANCEL), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  const updated = await orderFulfillmentService.cancelWave(c.req.param('id')!, version)
  return c.json(success(updated, { message: 'Wave cancelled' }))
})

orderFulfillmentRoutes.get('/waves/export', requirePermission(Permission.WAVE_READ), async (c) => {
  const result = await orderFulfillmentService.exportWaves({
    status: c.req.query('status') ?? undefined,
    warehouseId: c.req.query('warehouseId') ?? undefined,
  })
  return c.json(success(result.rows, { message: `${result.rows.length} waves exported` }))
})

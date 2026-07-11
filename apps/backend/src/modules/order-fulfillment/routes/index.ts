import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { orderFulfillmentService } from '../service'
export const orderFulfillmentRoutes = new Hono()
const CR = Permission.CUSTOMER_READ
const CU = Permission.CUSTOMER_UPDATE
const allocSchema = z.object({ soId: z.string().uuid(), soNumber: z.string().min(1), soLineId: z.string().uuid(), productId: z.string().uuid(), productSku: z.string().min(1), productName: z.string().min(1), warehouseId: z.string().uuid(), warehouseName: z.string().min(1), orderedQty: z.number().positive(), uomId: z.string().uuid().optional(), uomCode: z.string().optional() })
const waveSchema = z.object({ warehouseId: z.string().uuid(), warehouseName: z.string().min(1), priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'), soIds: z.array(z.string().uuid()).min(1) })
orderFulfillmentRoutes.get('/allocations', requirePermission(CR), async (c) => { const r = await orderFulfillmentService.listAllocations({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined }); return c.json(paginated(r.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: r.page, pageSize: r.pageSize, total: r.total })) })
orderFulfillmentRoutes.post('/allocations', requirePermission(CU), zValidator('json', allocSchema), async (c) => { const b = c.req.valid('json' as never) as z.infer<typeof allocSchema>; const a = await orderFulfillmentService.createAllocation(b); return c.json(success(a, { message: 'Allocation created' }), 201) })
orderFulfillmentRoutes.get('/waves', requirePermission(CR), async (c) => { const r = await orderFulfillmentService.listWavePlans({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined }); return c.json(paginated(r.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: r.page, pageSize: r.pageSize, total: r.total })) })
orderFulfillmentRoutes.post('/waves', requirePermission(CU), zValidator('json', waveSchema), async (c) => { const b = c.req.valid('json' as never) as z.infer<typeof waveSchema>; const w = await orderFulfillmentService.createWavePlan(b); return c.json(success(w, { message: 'Wave plan created' }), 201) })

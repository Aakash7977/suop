/** Procurement API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { procurementService } from '../service'

export const procurementRoutes = new Hono()

// Use PO permissions as proxy for PR (will add PR-specific permissions later)
const PR_READ = Permission.PO_READ
const PR_CREATE = Permission.PO_CREATE
const PR_APPROVE = Permission.PO_APPROVE

const prLineSchema = z.object({
  productId: z.string().uuid(),
  productSku: z.string().min(1),
  productName: z.string().min(1),
  requestedQty: z.number().positive(),
  uomId: z.string().uuid(),
  uomCode: z.string().min(1),
  expectedPrice: z.number().nonnegative().optional(),
  currency: z.string().default('INR'),
  preferredSupplierId: z.string().uuid().optional(),
  preferredSupplierCode: z.string().optional(),
  requiredDate: z.string().datetime().optional(),
  remarks: z.string().optional(),
})

const prSchema = z.object({
  companyId: z.string().uuid(),
  businessUnitId: z.string().uuid().optional(),
  plantId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  requisitionType: z.enum(['MANUAL', 'MATERIAL_REQUIREMENT', 'DEPARTMENT_REQUEST', 'EMERGENCY', 'PLANNED', 'STOCK_REPLENISHMENT']).default('MANUAL'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).default('NORMAL'),
  requiredDate: z.string().datetime(),
  expectedDeliveryDate: z.string().datetime().optional(),
  budgetId: z.string().uuid().optional(),
  budgetAmount: z.number().nonnegative().optional(),
  currency: z.string().default('INR'),
  remarks: z.string().optional(),
  internalNotes: z.string().optional(),
  lines: z.array(prLineSchema).min(1),
})

const transitionSchema = z.object({ targetStatus: z.enum(['DRAFT', 'SUBMITTED', 'DEPT_REVIEW', 'BUDGET_APPROVAL', 'PROC_REVIEW', 'APPROVED', 'CONVERTED_TO_RFQ', 'CLOSED', 'CANCELLED', 'REJECTED']), version: z.number().int().min(0), comments: z.string().optional() })

// List
procurementRoutes.get('/requisitions', requirePermission(PR_READ), async (c) => {
  const result = await procurementService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, status: c.req.query('status') ?? undefined, priority: c.req.query('priority') ?? undefined, requesterId: c.req.query('requesterId') ?? undefined, plantId: c.req.query('plantId') ?? undefined, departmentId: c.req.query('departmentId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

// Get by ID
procurementRoutes.get('/requisitions/:id', requirePermission(PR_READ), async (c) => {
  const pr = await procurementService.getById(c.req.param('id')!)
  return c.json(success(pr))
})

// Create
procurementRoutes.post('/requisitions', requirePermission(PR_CREATE), zValidator('json', prSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof prSchema>
  const pr = await procurementService.create(body)
  return c.json(success(pr, { message: 'Purchase requisition created' }), 201)
})

// Update
procurementRoutes.patch('/requisitions/:id', requirePermission(PR_CREATE), async (c) => {
  const id = c.req.param('id')!; const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json()
  const updated = await procurementService.update(id, body, version)
  return c.json(success(updated, { message: 'Purchase requisition updated' }))
})

// Delete
procurementRoutes.delete('/requisitions/:id', requirePermission(PR_CREATE), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  await procurementService.delete(c.req.param('id')!, version)
  return c.json(success({ deleted: true }, { message: 'Purchase requisition deleted' }))
})

// Transition (submit, approve, reject, cancel)
procurementRoutes.post('/requisitions/:id/transition', requirePermission(PR_APPROVE), zValidator('json', transitionSchema), async (c) => {
  const id = c.req.param('id')!; const body = c.req.valid('json' as never) as z.infer<typeof transitionSchema>
  const updated = await procurementService.transition(id, body.targetStatus, body.version, { comments: body.comments })
  return c.json(success(updated, { message: `PR transitioned to ${body.targetStatus}` }))
})

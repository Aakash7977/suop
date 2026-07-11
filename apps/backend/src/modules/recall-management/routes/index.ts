/** Recall Management API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { recallManagementService } from '../service'

export const recallManagementRoutes = new Hono()

const recallSchema = z.object({
  recallType: z.enum(['VOLUNTARY', 'MANDATORY', 'FDA_DIRECTED']).default('VOLUNTARY'),
  recallClass: z.enum(['CLASS_I', 'CLASS_II', 'CLASS_III']).default('CLASS_III'),
  recallReason: z.string().min(1),
  productId: z.string().uuid().optional(), productSku: z.string().optional(), productName: z.string().optional(),
  batchId: z.string().uuid().optional(), batchNumber: z.string().optional(),
  productionBatchId: z.string().uuid().optional(), productionBatchNumber: z.string().optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('HIGH'),
  regulatoryNotification: z.boolean().default(false), remarks: z.string().optional(),
})

const transitionSchema = z.object({
  targetStatus: z.enum(['INITIATED', 'APPROVED', 'IN_PROGRESS', 'CUSTOMERS_NOTIFIED', 'RECOVERY_IN_PROGRESS', 'EFFECTIVENESS_REVIEW', 'CLOSED']),
  version: z.number().int().min(0),
})

const communicationSchema = z.object({
  communicationType: z.enum(['CUSTOMER_NOTIFICATION', 'REGULATORY_NOTIFICATION', 'INTERNAL', 'SUPPLIER_NOTIFICATION']),
  channel: z.enum(['EMAIL', 'PHONE', 'LETTER', 'PORTAL', 'OTHER']).default('EMAIL'),
  recipient: z.string().optional(), recipientName: z.string().optional(),
  subject: z.string().optional(), message: z.string().min(1), remarks: z.string().optional(),
})

const effectivenessSchema = z.object({
  totalAffectedQty: z.number().nonnegative(), totalRecoveredQty: z.number().nonnegative(),
  totalAffectedCustomers: z.number().int().nonnegative(), customersNotified: z.number().int().nonnegative(),
  customersResponded: z.number().int().nonnegative(),
  effectivenessRating: z.enum(['HIGHLY_EFFECTIVE', 'EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'NOT_EFFECTIVE']).optional(),
  isEffective: z.boolean(), remarks: z.string().optional(),
})

recallManagementRoutes.get('/recalls', requirePermission(Permission.NCR_CREATE), async (c) => {
  const result = await recallManagementService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), status: c.req.query('status') ?? undefined, productId: c.req.query('productId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
recallManagementRoutes.get('/recalls/:id', requirePermission(Permission.NCR_CREATE), async (c) => {
  const recall = await recallManagementService.getById(c.req.param('id')!)
  return c.json(success(recall))
})
recallManagementRoutes.post('/recalls', requirePermission(Permission.NCR_APPROVE), zValidator('json', recallSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof recallSchema>
  const recall = await recallManagementService.createRecall(body)
  return c.json(success(recall, { message: 'Recall initiated' }), 201)
})
recallManagementRoutes.post('/recalls/:id/transition', requirePermission(Permission.NCR_APPROVE), zValidator('json', transitionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof transitionSchema>
  const updated = await recallManagementService.transition(c.req.param('id')!, body.targetStatus, body.version)
  return c.json(success(updated, { message: `Recall transitioned to ${body.targetStatus}` }))
})
recallManagementRoutes.post('/recalls/:id/identify-customers', requirePermission(Permission.NCR_APPROVE), async (c) => {
  await recallManagementService.identifyAffectedCustomers(c.req.param('id')!)
  return c.json(success({ message: 'Affected customers identified' }))
})
recallManagementRoutes.get('/recalls/:id/affected-items', requirePermission(Permission.NCR_CREATE), async (c) => {
  const result = await recallManagementService.listAffectedItems(c.req.param('id')!)
  return c.json(success(result))
})
recallManagementRoutes.get('/recalls/:id/affected-customers', requirePermission(Permission.NCR_CREATE), async (c) => {
  const result = await recallManagementService.listAffectedCustomers(c.req.param('id')!)
  return c.json(success(result))
})
recallManagementRoutes.get('/recalls/:id/communications', requirePermission(Permission.NCR_CREATE), async (c) => {
  const result = await recallManagementService.listCommunications(c.req.param('id')!)
  return c.json(success(result))
})
recallManagementRoutes.post('/recalls/:id/communications', requirePermission(Permission.NCR_APPROVE), zValidator('json', communicationSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof communicationSchema>
  const result = await recallManagementService.addCommunication(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Communication sent' }), 201)
})
recallManagementRoutes.get('/recalls/:id/effectiveness', requirePermission(Permission.NCR_CREATE), async (c) => {
  const result = await recallManagementService.listEffectivenessReviews(c.req.param('id')!)
  return c.json(success(result))
})
recallManagementRoutes.post('/recalls/:id/effectiveness', requirePermission(Permission.NCR_APPROVE), zValidator('json', effectivenessSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof effectivenessSchema>
  const result = await recallManagementService.addEffectivenessReview(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Effectiveness review recorded' }), 201)
})

/** CAPA Management API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { capaManagementService } from '../service'

export const capaManagementRoutes = new Hono()

const actionSchema = z.object({
  actionType: z.enum(['CORRECTIVE', 'PREVENTIVE']), actionDescription: z.string().min(1),
  actionOwner: z.string().uuid().optional(), actionOwnerName: z.string().optional(),
  dueDate: z.string().datetime().optional(), priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  remarks: z.string().optional(),
})

const escalationSchema = z.object({
  escalationReason: z.string().min(1), escalatedTo: z.string().uuid().optional(), escalatedToName: z.string().optional(),
})

const verificationSchema = z.object({
  verificationType: z.enum(['IMPLEMENTATION', 'EFFECTIVENESS']).default('EFFECTIVENESS'),
  verificationMethod: z.string().optional(), result: z.string().min(1),
  evidence: z.string().optional(), remarks: z.string().optional(),
})

const effectivenessSchema = z.object({
  reviewPeriodDays: z.number().int().positive().default(30),
  effectivenessRating: z.enum(['HIGHLY_EFFECTIVE', 'EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'NOT_EFFECTIVE']),
  metricsBefore: z.record(z.unknown()).optional(), metricsAfter: z.record(z.unknown()).optional(),
  isEffective: z.boolean(), followUpRequired: z.boolean().default(false),
  followUpNotes: z.string().optional(), remarks: z.string().optional(),
})

const transitionSchema = z.object({
  targetStatus: z.enum(['OPEN', 'IN_PROGRESS', 'IMPLEMENTED', 'VERIFICATION_PENDING', 'VERIFIED', 'EFFECTIVENESS_REVIEW', 'CLOSED']),
  version: z.number().int().min(0),
})

capaManagementRoutes.post('/capas/:id/transition', requirePermission(Permission.NCR_APPROVE), zValidator('json', transitionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof transitionSchema>
  const updated = await capaManagementService.transitionCapa(c.req.param('id')!, body.targetStatus, body.version)
  return c.json(success(updated, { message: `CAPA transitioned to ${body.targetStatus}` }))
})

capaManagementRoutes.get('/capas/:id/actions', requirePermission(Permission.NCR_CREATE), async (c) => {
  const result = await capaManagementService.listActions(c.req.param('id')!)
  return c.json(success(result))
})
capaManagementRoutes.post('/capas/:id/actions', requirePermission(Permission.NCR_CREATE), zValidator('json', actionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof actionSchema>
  const result = await capaManagementService.addAction(c.req.param('id')!, body)
  return c.json(success(result, { message: 'CAPA action added' }), 201)
})
capaManagementRoutes.post('/capas/:capaId/actions/:actionId/complete', requirePermission(Permission.NCR_CREATE), async (c) => {
  const result = await capaManagementService.completeAction(c.req.param('actionId')!)
  return c.json(success(result, { message: 'Action completed' }))
})
capaManagementRoutes.post('/capas/:capaId/actions/:actionId/escalate', requirePermission(Permission.NCR_APPROVE), zValidator('json', escalationSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof escalationSchema>
  const result = await capaManagementService.escalateAction(c.req.param('capaId')!, c.req.param('actionId')!, body)
  return c.json(success(result, { message: 'Action escalated' }))
})

capaManagementRoutes.get('/capas/:id/verifications', requirePermission(Permission.NCR_CREATE), async (c) => {
  const result = await capaManagementService.listVerifications(c.req.param('id')!)
  return c.json(success(result))
})
capaManagementRoutes.post('/capas/:id/verifications', requirePermission(Permission.NCR_APPROVE), zValidator('json', verificationSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof verificationSchema>
  const result = await capaManagementService.addVerification(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Verification recorded' }), 201)
})

capaManagementRoutes.get('/capas/:id/effectiveness', requirePermission(Permission.NCR_CREATE), async (c) => {
  const result = await capaManagementService.listEffectivenessReviews(c.req.param('id')!)
  return c.json(success(result))
})
capaManagementRoutes.post('/capas/:id/effectiveness', requirePermission(Permission.NCR_APPROVE), zValidator('json', effectivenessSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof effectivenessSchema>
  const result = await capaManagementService.addEffectivenessReview(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Effectiveness review recorded' }), 201)
})

capaManagementRoutes.get('/capas/:id/escalations', requirePermission(Permission.NCR_CREATE), async (c) => {
  const result = await capaManagementService.listEscalations(c.req.param('id')!)
  return c.json(success(result))
})

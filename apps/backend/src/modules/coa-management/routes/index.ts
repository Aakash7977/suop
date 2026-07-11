/** COA Management API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { coaManagementService } from '../service'

export const coaManagementRoutes = new Hono()

const templateSchema = z.object({
  templateCode: z.string().min(1), templateName: z.string().min(1),
  productId: z.string().uuid().optional(), productSku: z.string().optional(), productName: z.string().optional(),
  templateType: z.string().default('STANDARD'), headerText: z.string().optional(), footerText: z.string().optional(),
  includesMicrobiology: z.boolean().default(true), includesChemical: z.boolean().default(true), includesPhysical: z.boolean().default(true),
  description: z.string().optional(), layoutConfig: z.record(z.unknown()).optional(),
})

const labResultSchema = z.object({
  testCategory: z.enum(['MICROBIOLOGY', 'CHEMICAL', 'PHYSICAL', 'PACKAGING', 'VISUAL', 'OTHER']),
  parameterName: z.string().min(1), specification: z.string().optional(),
  actualValue: z.string().min(1), minValue: z.string().optional(), maxValue: z.string().optional(),
  targetValue: z.string().optional(), unit: z.string().optional(),
  result: z.enum(['PASS', 'FAIL', 'CONDITIONAL']).default('PASS'),
  testMethod: z.string().optional(), equipment: z.string().optional(), remarks: z.string().optional(),
})

const approvalSchema = z.object({
  approvalLevel: z.enum(['PREPARED', 'REVIEWED', 'APPROVED', 'SIGNED']),
  approverRole: z.string().optional(), approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  approvalNotes: z.string().optional(),
})

const versionSchema = z.object({ versionReason: z.string().min(1) })

const transitionSchema = z.object({
  targetStatus: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SIGNED', 'SUPERSEDED']),
  version: z.number().int().min(0),
})

coaManagementRoutes.get('/templates', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const result = await coaManagementService.listTemplates({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), productId: c.req.query('productId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
coaManagementRoutes.post('/templates', requirePermission(Permission.COA_SIGN), zValidator('json', templateSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof templateSchema>
  const template = await coaManagementService.createTemplate(body)
  return c.json(success(template, { message: 'COA template created' }), 201)
})

coaManagementRoutes.post('/coas/:id/transition', requirePermission(Permission.COA_SIGN), zValidator('json', transitionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof transitionSchema>
  const updated = await coaManagementService.transitionCoa(c.req.param('id')!, body.targetStatus, body.version)
  return c.json(success(updated, { message: `COA transitioned to ${body.targetStatus}` }))
})

coaManagementRoutes.get('/coas/:id/lab-results', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const result = await coaManagementService.listLabResults(c.req.param('id')!)
  return c.json(success(result))
})
coaManagementRoutes.post('/coas/:id/lab-results', requirePermission(Permission.IQC_INSPECT), zValidator('json', labResultSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof labResultSchema>
  const result = await coaManagementService.addLabResult(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Lab result added' }), 201)
})

coaManagementRoutes.get('/coas/:id/approvals', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const result = await coaManagementService.listApprovals(c.req.param('id')!)
  return c.json(success(result))
})
coaManagementRoutes.post('/coas/:id/approvals', requirePermission(Permission.COA_SIGN), zValidator('json', approvalSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof approvalSchema>
  const result = await coaManagementService.addApproval(c.req.param('id')!, body)
  return c.json(success(result, { message: 'Approval recorded' }), 201)
})

coaManagementRoutes.get('/verify/:qrCode', async (c) => {
  const result = await coaManagementService.verifyByQr(c.req.param('qrCode')!)
  return c.json(success(result))
})

coaManagementRoutes.get('/coas/:id/versions', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const result = await coaManagementService.listVersions(c.req.param('id')!)
  return c.json(success(result))
})
coaManagementRoutes.post('/coas/:id/versions', requirePermission(Permission.COA_SIGN), zValidator('json', versionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof versionSchema>
  const result = await coaManagementService.createVersion(c.req.param('id')!, body)
  return c.json(success(result, { message: 'COA version created' }), 201)
})

coaManagementRoutes.get('/coas/:id/pdf', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const pdfData = await coaManagementService.generatePdf(c.req.param('id')!)
  return c.json(success(pdfData, { message: 'COA PDF data generated' }))
})

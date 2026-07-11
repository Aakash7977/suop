/** Supplier Quality API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { supplierQualityService } from '../service'

export const supplierQualityRoutes = new Hono()

const auditSchema = z.object({
  supplierId: z.string().uuid(), supplierCode: z.string().min(1), supplierName: z.string().min(1),
  auditType: z.string().default('SUPPLIER'), auditScope: z.string().optional(),
  leadAuditor: z.string().uuid().optional(), leadAuditorName: z.string().optional(),
  auditStartDate: z.string().optional(), auditEndDate: z.string().optional(),
  overallScore: z.number().min(0).max(100).optional(), maxScore: z.number().default(100),
  auditResult: z.string().optional(),
  findingsCount: z.number().int().default(0), criticalFindings: z.number().int().default(0),
  majorFindings: z.number().int().default(0), minorFindings: z.number().int().default(0),
  status: z.string().default('PLANNED'), reportUrl: z.string().optional(), remarks: z.string().optional(),
})

const complaintSchema = z.object({
  supplierId: z.string().uuid(), supplierCode: z.string().min(1), supplierName: z.string().min(1),
  productId: z.string().uuid().optional(), productSku: z.string().optional(), productName: z.string().optional(),
  batchNumber: z.string().optional(), grnNumber: z.string().optional(),
  complaintType: z.string().min(1), severity: z.enum(['MINOR', 'MAJOR', 'CRITICAL']).default('MAJOR'),
  description: z.string().min(1), ncrId: z.string().uuid().optional(), capaId: z.string().uuid().optional(), remarks: z.string().optional(),
})

const certSchema = z.object({
  supplierId: z.string().uuid(), supplierCode: z.string().optional(), supplierName: z.string().optional(),
  certType: z.string().min(1), certName: z.string().min(1), certNumber: z.string().optional(),
  issuingBody: z.string().optional(), issueDate: z.string().optional(), expiryDate: z.string().optional(),
  documentUrl: z.string().optional(), remarks: z.string().optional(),
})

const riskSchema = z.object({
  supplierId: z.string().uuid(), supplierCode: z.string().optional(), supplierName: z.string().optional(),
  riskCategory: z.string().min(1), riskScore: z.number().min(0).max(100),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  mitigationPlan: z.string().optional(), assessmentFactors: z.record(z.unknown()).optional(),
  nextReviewDate: z.string().optional(), remarks: z.string().optional(),
})

// Audits
supplierQualityRoutes.get('/audits', requirePermission(Permission.SUPPLIER_READ), async (c) => {
  const result = await supplierQualityService.listAudits({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), supplierId: c.req.query('supplierId') ?? undefined, status: c.req.query('status') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
supplierQualityRoutes.post('/audits', requirePermission(Permission.SUPPLIER_UPDATE), zValidator('json', auditSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof auditSchema>
  const audit = await supplierQualityService.createAudit(body)
  return c.json(success(audit, { message: 'Supplier audit created' }), 201)
})

// Scorecards
supplierQualityRoutes.get('/scorecards', requirePermission(Permission.SUPPLIER_READ), async (c) => {
  const result = await supplierQualityService.listScorecards({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), supplierId: c.req.query('supplierId') ?? undefined, period: c.req.query('period') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
supplierQualityRoutes.post('/scorecards/auto-update', requirePermission(Permission.SUPPLIER_UPDATE), async (c) => {
  const body = await c.req.json()
  const result = await supplierQualityService.autoUpdateScorecard(body.supplierId, body.period ?? new Date().toISOString().slice(0, 7))
  return c.json(success(result, { message: 'Scorecard auto-updated' }))
})

// Complaints
supplierQualityRoutes.get('/complaints', requirePermission(Permission.SUPPLIER_READ), async (c) => {
  const result = await supplierQualityService.listComplaints({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), supplierId: c.req.query('supplierId') ?? undefined, status: c.req.query('status') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
supplierQualityRoutes.post('/complaints', requirePermission(Permission.NCR_CREATE), zValidator('json', complaintSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof complaintSchema>
  const complaint = await supplierQualityService.createComplaint(body)
  return c.json(success(complaint, { message: 'Supplier complaint created' }), 201)
})

// Certifications
supplierQualityRoutes.get('/certifications', requirePermission(Permission.SUPPLIER_READ), async (c) => {
  const result = await supplierQualityService.listCertifications({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), supplierId: c.req.query('supplierId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
supplierQualityRoutes.post('/certifications', requirePermission(Permission.SUPPLIER_UPDATE), zValidator('json', certSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof certSchema>
  const result = await supplierQualityService.createCertification(body)
  return c.json(success(result, { message: 'Certification added' }), 201)
})
supplierQualityRoutes.get('/certifications/expiring', requirePermission(Permission.SUPPLIER_READ), async (c) => {
  const days = Number(c.req.query('days') ?? 90)
  const result = await supplierQualityService.getExpiringCertifications(days)
  return c.json(success(result))
})

// Risk Assessments
supplierQualityRoutes.get('/risk-assessments', requirePermission(Permission.SUPPLIER_READ), async (c) => {
  const result = await supplierQualityService.listRiskAssessments({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), supplierId: c.req.query('supplierId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
supplierQualityRoutes.post('/risk-assessments', requirePermission(Permission.SUPPLIER_UPDATE), zValidator('json', riskSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof riskSchema>
  const result = await supplierQualityService.createRiskAssessment(body)
  return c.json(success(result, { message: 'Risk assessment created' }), 201)
})

/** Quality Foundation API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { qualityFoundationService } from '../service'

export const qualityFoundationRoutes = new Hono()

const standardSchema = z.object({
  standardCode: z.string().min(1), standardName: z.string().min(1),
  standardType: z.string().default('INTERNAL'), version: z.string().default('1.0'),
  issuingBody: z.string().optional(), effectiveDate: z.string().optional(), expiryDate: z.string().optional(),
  description: z.string().optional(),
})

const specSchema = z.object({
  specCode: z.string().min(1), specName: z.string().min(1),
  productId: z.string().uuid().optional(), productSku: z.string().optional(), productName: z.string().optional(),
  specType: z.string().default('PRODUCT'), version: z.string().default('1.0'), description: z.string().optional(),
  parameters: z.array(z.object({
    parameterCode: z.string().min(1), parameterName: z.string().min(1), parameterType: z.string().default('NUMERIC'),
    targetValue: z.string().optional(), minValue: z.string().optional(), maxValue: z.string().optional(),
    unit: z.string().optional(), isMandatory: z.boolean().default(true), isCritical: z.boolean().default(false),
  })).optional(),
})

const methodSchema = z.object({
  methodCode: z.string().min(1), methodName: z.string().min(1),
  methodType: z.string().optional(), standardReference: z.string().optional(),
  equipmentRequired: z.string().optional(), durationHours: z.number().positive().optional(),
  description: z.string().optional(),
})

const typeSchema = z.object({
  typeCode: z.string().min(1), typeName: z.string().min(1),
  inspectionCategory: z.string().default('IQC'), description: z.string().optional(), sortOrder: z.number().int().default(0),
})

const templateSchema = z.object({
  templateCode: z.string().min(1), templateName: z.string().min(1),
  inspectionTypeId: z.string().uuid().optional(), productId: z.string().uuid().optional(),
  productCategoryId: z.string().uuid().optional(), specId: z.string().uuid().optional(), description: z.string().optional(),
})

qualityFoundationRoutes.get('/standards', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const result = await qualityFoundationService.listStandards({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, isActive: c.req.query('isActive') === 'true' ? true : c.req.query('isActive') === 'false' ? false : undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
qualityFoundationRoutes.post('/standards', requirePermission(Permission.IQC_APPROVE), zValidator('json', standardSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof standardSchema>
  const standard = await qualityFoundationService.createStandard(body)
  return c.json(success(standard, { message: 'Quality standard created' }), 201)
})

qualityFoundationRoutes.get('/specs', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const result = await qualityFoundationService.listSpecs({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, isActive: c.req.query('isActive') === 'true' ? true : c.req.query('isActive') === 'false' ? false : undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
qualityFoundationRoutes.post('/specs', requirePermission(Permission.IQC_APPROVE), zValidator('json', specSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof specSchema>
  const spec = await qualityFoundationService.createSpec(body)
  return c.json(success(spec, { message: 'Quality specification created' }), 201)
})

qualityFoundationRoutes.get('/test-methods', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const result = await qualityFoundationService.listTestMethods({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, isActive: c.req.query('isActive') === 'true' ? true : c.req.query('isActive') === 'false' ? false : undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
qualityFoundationRoutes.post('/test-methods', requirePermission(Permission.IQC_APPROVE), zValidator('json', methodSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof methodSchema>
  const method = await qualityFoundationService.createTestMethod(body)
  return c.json(success(method, { message: 'Test method created' }), 201)
})

qualityFoundationRoutes.get('/inspection-types', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const result = await qualityFoundationService.listInspectionTypes({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, isActive: c.req.query('isActive') === 'true' ? true : c.req.query('isActive') === 'false' ? false : undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
qualityFoundationRoutes.post('/inspection-types', requirePermission(Permission.IQC_APPROVE), zValidator('json', typeSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof typeSchema>
  const type = await qualityFoundationService.createInspectionType(body)
  return c.json(success(type, { message: 'Inspection type created' }), 201)
})

qualityFoundationRoutes.get('/inspection-templates', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const result = await qualityFoundationService.listInspectionTemplates({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, isActive: c.req.query('isActive') === 'true' ? true : c.req.query('isActive') === 'false' ? false : undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
qualityFoundationRoutes.post('/inspection-templates', requirePermission(Permission.IQC_APPROVE), zValidator('json', templateSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof templateSchema>
  const template = await qualityFoundationService.createInspectionTemplate(body)
  return c.json(success(template, { message: 'Inspection template created' }), 201)
})

qualityFoundationRoutes.get('/kpis', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const result = await qualityFoundationService.listKpis({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), period: c.req.query('period') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
qualityFoundationRoutes.post('/kpis/calculate', requirePermission(Permission.IQC_APPROVE), async (c) => {
  const period = c.req.query('period') ?? new Date().toISOString().slice(0, 7)
  const result = await qualityFoundationService.calculateQualityKpis(period)
  return c.json(success(result, { message: 'Quality KPIs calculated' }))
})
qualityFoundationRoutes.get('/dashboard', requirePermission(Permission.IQC_INSPECT), async (c) => {
  const dashboard = await qualityFoundationService.getQualityDashboard()
  return c.json(success(dashboard))
})

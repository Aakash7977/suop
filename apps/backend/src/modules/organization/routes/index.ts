/**
 * Organization API Routes
 *
 * REST endpoints for Organization module.
 * Per API Standards §3: plural kebab-case URLs, UUID v7 IDs.
 * Per Phase 0 Architecture §8: RBAC middleware on every mutating endpoint.
 */

import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import {
  companyService, plantService, warehouseService,
  departmentService, costCenterService, financialYearService,
  hierarchyService,
} from '../service'

export const organizationRoutes = new Hono()

// ─── Schemas ────────────────────────────────────────────────────────────────

const companySchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  legalName: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  parentId: z.string().uuid().optional(),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
  cin: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  postalCode: z.string().optional(),
  defaultTimezone: z.string().optional(),
  defaultCurrency: z.string().optional(),
})

const plantSchema = z.object({
  regionId: z.string().uuid(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  plantType: z.enum(['MANUFACTURING', 'DISTRIBUTION', 'WAREHOUSE', 'RETAIL', 'RESTAURANT']).default('MANUFACTURING'),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  postalCode: z.string().optional(),
  timezone: z.string().default('Asia/Kolkata'),
  currency: z.string().default('INR'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

const warehouseSchema = z.object({
  plantId: z.string().uuid(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  warehouseType: z.enum(['RAW_MATERIAL', 'FINISHED_GOODS', 'PACKAGING', 'DISTRIBUTION', 'QUARANTINE']).default('DISTRIBUTION'),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  timezone: z.string().default('Asia/Kolkata'),
  isDefault: z.boolean().default(false),
  totalAreaSqft: z.number().positive().optional(),
})

const departmentSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  companyId: z.string().uuid().optional(),
  businessUnitId: z.string().uuid().optional(),
  plantId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
})

const costCenterSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  plantId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  costCenterType: z.enum(['PRODUCTION', 'SERVICE', 'ADMIN', 'SALES']).default('PRODUCTION'),
})

const financialYearSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isCurrent: z.boolean().default(false),
})

const transitionSchema = z.object({
  targetStatus: z.enum(['DRAFT', 'CONFIGURED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED']),
  version: z.number().int().min(0),
})

// ─── Company Routes ─────────────────────────────────────────────────────────

organizationRoutes.get('/companies', requirePermission(Permission.ORG_READ), async (c) => {
  const page = Number(c.req.query('page') ?? 1)
  const pageSize = Number(c.req.query('pageSize') ?? 25)
  const search = c.req.query('search') ?? undefined
  const result = await companyService.list({ page, pageSize, search })
  return c.json(paginated(result.rows, {
    correlationId: c.req.header('X-Request-Id') ?? '',
    page: result.page, pageSize: result.pageSize, total: result.total,
  }))
})

organizationRoutes.get('/companies/:id', requirePermission(Permission.ORG_READ), async (c) => {
  const company = await companyService.getById(c.req.param('id')!)
  return c.json(success(company))
})

organizationRoutes.post('/companies', requirePermission(Permission.ORG_CREATE), zValidator('json', companySchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof companySchema>
  const company = await companyService.create(body)
  return c.json(success(company, { message: 'Company created' }), 201)
})

organizationRoutes.patch('/companies/:id', requirePermission(Permission.ORG_UPDATE), async (c) => {
  const id = c.req.param('id')!
  const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json()
  const updated = await companyService.update(id, body, version)
  return c.json(success(updated, { message: 'Company updated' }))
})

organizationRoutes.delete('/companies/:id', requirePermission(Permission.ORG_DELETE), async (c) => {
  const id = c.req.param('id')!
  const version = Number(c.req.header('If-Match') ?? '0')
  await companyService.delete(id, version)
  return c.json(success({ deleted: true }, { message: 'Company deleted' }))
})

organizationRoutes.post('/companies/:id/transition', requirePermission(Permission.ORG_UPDATE), zValidator('json', transitionSchema), async (c) => {
  const id = c.req.param('id')!
  const body = c.req.valid('json' as never) as z.infer<typeof transitionSchema>
  const updated = await companyService.transition(id, body.targetStatus, body.version)
  return c.json(success(updated, { message: `Company transitioned to ${body.targetStatus}` }))
})

organizationRoutes.post('/companies/:id/restore', requirePermission(Permission.ORG_UPDATE), async (c) => {
  const id = c.req.param('id')!
  const restored = await companyService.restore(id)
  return c.json(success(restored, { message: 'Company restored' }))
})

organizationRoutes.delete('/companies/:id/hard', requirePermission(Permission.ORG_DELETE), async (c) => {
  const id = c.req.param('id')!
  await companyService.hardDelete(id)
  return c.json(success({ deleted: true }, { message: 'Company permanently deleted' }))
})

// ─── Plant Routes ───────────────────────────────────────────────────────────

organizationRoutes.get('/plants', requirePermission(Permission.ORG_READ), async (c) => {
  const page = Number(c.req.query('page') ?? 1)
  const pageSize = Number(c.req.query('pageSize') ?? 25)
  const search = c.req.query('search') ?? undefined
  const result = await plantService.list({ page, pageSize, search })
  return c.json(paginated(result.rows, {
    correlationId: c.req.header('X-Request-Id') ?? '',
    page: result.page, pageSize: result.pageSize, total: result.total,
  }))
})

organizationRoutes.get('/plants/:id', requirePermission(Permission.ORG_READ), async (c) => {
  const plant = await plantService.getById(c.req.param('id')!)
  return c.json(success(plant))
})

organizationRoutes.post('/plants', requirePermission(Permission.ORG_CREATE), zValidator('json', plantSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof plantSchema>
  const plant = await plantService.create(body)
  return c.json(success(plant, { message: 'Plant created' }), 201)
})

organizationRoutes.post('/plants/:id/transition', requirePermission(Permission.ORG_UPDATE), zValidator('json', transitionSchema), async (c) => {
  const id = c.req.param('id')!
  const body = c.req.valid('json' as never) as z.infer<typeof transitionSchema>
  const updated = await plantService.transition(id, body.targetStatus, body.version)
  return c.json(success(updated, { message: `Plant transitioned to ${body.targetStatus}` }))
})

// ─── Warehouse Routes ───────────────────────────────────────────────────────

organizationRoutes.get('/warehouses', requirePermission(Permission.ORG_READ), async (c) => {
  const page = Number(c.req.query('page') ?? 1)
  const pageSize = Number(c.req.query('pageSize') ?? 25)
  const search = c.req.query('search') ?? undefined
  const plantId = c.req.query('plantId') ?? undefined
  const result = await warehouseService.list({ page, pageSize, search, plantId })
  return c.json(paginated(result.rows, {
    correlationId: c.req.header('X-Request-Id') ?? '',
    page: result.page, pageSize: result.pageSize, total: result.total,
  }))
})

organizationRoutes.get('/warehouses/:id', requirePermission(Permission.ORG_READ), async (c) => {
  const warehouse = await warehouseService.getById(c.req.param('id')!)
  return c.json(success(warehouse))
})

organizationRoutes.post('/warehouses', requirePermission(Permission.ORG_CREATE), zValidator('json', warehouseSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof warehouseSchema>
  const warehouse = await warehouseService.create(body)
  return c.json(success(warehouse, { message: 'Warehouse created' }), 201)
})

// ─── Department Routes ──────────────────────────────────────────────────────

organizationRoutes.get('/departments', requirePermission(Permission.ORG_READ), async (c) => {
  const page = Number(c.req.query('page') ?? 1)
  const pageSize = Number(c.req.query('pageSize') ?? 25)
  const search = c.req.query('search') ?? undefined
  const result = await departmentService.list({ page, pageSize, search })
  return c.json(paginated(result.rows, {
    correlationId: c.req.header('X-Request-Id') ?? '',
    page: result.page, pageSize: result.pageSize, total: result.total,
  }))
})

organizationRoutes.post('/departments', requirePermission(Permission.ORG_CREATE), zValidator('json', departmentSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof departmentSchema>
  const dept = await departmentService.create(body)
  return c.json(success(dept, { message: 'Department created' }), 201)
})

// ─── Cost Center Routes ─────────────────────────────────────────────────────

organizationRoutes.get('/cost-centers', requirePermission(Permission.ORG_READ), async (c) => {
  const page = Number(c.req.query('page') ?? 1)
  const pageSize = Number(c.req.query('pageSize') ?? 25)
  const search = c.req.query('search') ?? undefined
  const result = await costCenterService.list({ page, pageSize, search })
  return c.json(paginated(result.rows, {
    correlationId: c.req.header('X-Request-Id') ?? '',
    page: result.page, pageSize: result.pageSize, total: result.total,
  }))
})

organizationRoutes.post('/cost-centers', requirePermission(Permission.ORG_CREATE), zValidator('json', costCenterSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof costCenterSchema>
  const cc = await costCenterService.create(body)
  return c.json(success(cc, { message: 'Cost center created' }), 201)
})

// ─── Financial Year Routes ──────────────────────────────────────────────────

organizationRoutes.get('/financial-years', requirePermission(Permission.ORG_READ), async (c) => {
  const page = Number(c.req.query('page') ?? 1)
  const pageSize = Number(c.req.query('pageSize') ?? 25)
  const result = await financialYearService.list({ page, pageSize })
  return c.json(paginated(result.rows, {
    correlationId: c.req.header('X-Request-Id') ?? '',
    page: result.page, pageSize: result.pageSize, total: result.total,
  }))
})

organizationRoutes.get('/financial-years/current', requirePermission(Permission.ORG_READ), async (c) => {
  const fy = await financialYearService.getCurrent()
  return c.json(success(fy))
})

organizationRoutes.post('/financial-years', requirePermission(Permission.ORG_CREATE), zValidator('json', financialYearSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof financialYearSchema>
  const fy = await financialYearService.create(body)
  return c.json(success(fy, { message: 'Financial year created' }))
})

// ─── Hierarchy Tree ─────────────────────────────────────────────────────────

organizationRoutes.get('/hierarchy', requirePermission(Permission.ORG_READ), async (c) => {
  const tree = await hierarchyService.getTree()
  return c.json(success(tree))
})

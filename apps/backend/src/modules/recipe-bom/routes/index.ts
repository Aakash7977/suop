/** Recipe & BOM API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { recipeBomService } from '../service'

export const recipeBomRoutes = new Hono()

const recipeItemSchema = z.object({
  itemType: z.enum(['RAW_MATERIAL', 'PACKAGING', 'CONSUMABLE']).default('RAW_MATERIAL'),
  productId: z.string().uuid(), productSku: z.string().optional(), productName: z.string().optional(),
  uomId: z.string().uuid().optional(), uomCode: z.string().optional(),
  quantity: z.number().positive(), scrapPercent: z.number().nonnegative().default(0),
  isCritical: z.boolean().default(false), unitCost: z.number().nonnegative().optional(),
  remarks: z.string().optional(),
})

const recipeSchema = z.object({
  recipeCode: z.string().min(1), recipeName: z.string().min(1),
  productId: z.string().uuid(), productSku: z.string().optional(), productName: z.string().optional(),
  version: z.string().default('1.0'),
  yieldPercent: z.number().min(0).max(100).default(100), expectedLossPercent: z.number().min(0).max(100).default(0),
  batchSize: z.number().positive().optional(), batchUomId: z.string().uuid().optional(), batchUomCode: z.string().optional(),
  productionTimeHours: z.number().positive().optional(), description: z.string().optional(),
  items: z.array(recipeItemSchema).min(1),
  byproducts: z.array(z.object({
    productId: z.string().uuid(), productSku: z.string().optional(), productName: z.string().optional(),
    quantity: z.number().positive(), uomId: z.string().uuid().optional(), uomCode: z.string().optional(),
    byproductType: z.enum(['BY_PRODUCT', 'CO_PRODUCT']).default('BY_PRODUCT'),
  })).optional(),
})

const recipeTransitionSchema = z.object({
  targetStatus: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'DEPRECATED']),
  version: z.number().int().min(0),
})

const bomLineSchema = z.object({
  parentBomLineId: z.string().uuid().optional(),
  productId: z.string().uuid(), productSku: z.string().optional(), productName: z.string().optional(),
  uomId: z.string().uuid().optional(), uomCode: z.string().optional(),
  quantity: z.number().positive(), scrapPercent: z.number().nonnegative().default(0),
  isPhantom: z.boolean().default(false), isCritical: z.boolean().default(false),
  leadTimeOffsetDays: z.number().int().default(0), level: z.number().int().min(1).default(1),
  remarks: z.string().optional(),
})

const bomSchema = z.object({
  bomCode: z.string().min(1), bomName: z.string().min(1),
  productId: z.string().uuid(), productSku: z.string().optional(), productName: z.string().optional(),
  bomType: z.string().default('STANDARD'), description: z.string().optional(),
  lines: z.array(bomLineSchema).min(1),
})

const bomTransitionSchema = z.object({
  targetStatus: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'DEPRECATED']),
  version: z.number().int().min(0),
})

const routingSchema = z.object({
  routingCode: z.string().min(1), routingName: z.string().min(1),
  productId: z.string().uuid().optional(), bomId: z.string().uuid().optional(), description: z.string().optional(),
  operations: z.array(z.object({
    operationNo: z.number().int().positive().optional(), operationName: z.string().min(1),
    operationDescription: z.string().optional(), workCenterId: z.string().uuid().optional(), workCenterCode: z.string().optional(),
    machineId: z.string().uuid().optional(), machineCode: z.string().optional(),
    setupTimeMinutes: z.number().int().nonnegative().default(0), runTimeMinutes: z.number().nonnegative().default(0),
    laborRequired: z.boolean().default(true), skillLevel: z.string().optional(),
  })).min(1),
})

// Recipes
recipeBomRoutes.get('/recipes', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const result = await recipeBomService.listRecipes({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), productId: c.req.query('productId') ?? undefined, status: c.req.query('status') ?? undefined, search: c.req.query('search') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
recipeBomRoutes.get('/recipes/:id', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const recipe = await recipeBomService.getRecipe(c.req.param('id')!)
  return c.json(success(recipe))
})
recipeBomRoutes.post('/recipes', requirePermission(Permission.PRODUCT_CREATE), zValidator('json', recipeSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof recipeSchema>
  const recipe = await recipeBomService.createRecipe(body)
  return c.json(success(recipe, { message: 'Recipe created' }), 201)
})
recipeBomRoutes.post('/recipes/:id/transition', requirePermission(Permission.PRODUCT_UPDATE), zValidator('json', recipeTransitionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof recipeTransitionSchema>
  const updated = await recipeBomService.transitionRecipe(c.req.param('id')!, body.targetStatus, body.version)
  return c.json(success(updated, { message: `Recipe transitioned to ${body.targetStatus}` }))
})

// BOMs
recipeBomRoutes.get('/boms', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const result = await recipeBomService.listBoms({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), productId: c.req.query('productId') ?? undefined, status: c.req.query('status') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
recipeBomRoutes.get('/boms/:id', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const bom = await recipeBomService.getBom(c.req.param('id')!)
  return c.json(success(bom))
})
recipeBomRoutes.post('/boms', requirePermission(Permission.PRODUCT_CREATE), zValidator('json', bomSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof bomSchema>
  const bom = await recipeBomService.createBom(body)
  return c.json(success(bom, { message: 'BOM created' }), 201)
})
recipeBomRoutes.post('/boms/:id/transition', requirePermission(Permission.PRODUCT_UPDATE), zValidator('json', bomTransitionSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof bomTransitionSchema>
  const updated = await recipeBomService.transitionBom(c.req.param('id')!, body.targetStatus, body.version)
  return c.json(success(updated, { message: `BOM transitioned to ${body.targetStatus}` }))
})
recipeBomRoutes.get('/boms/:id/explode', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const explosion = await recipeBomService.explodeBom(c.req.param('id')!)
  return c.json(success(explosion))
})

// Routings
recipeBomRoutes.get('/routings', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const result = await recipeBomService.listRoutings({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), productId: c.req.query('productId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
recipeBomRoutes.get('/routings/:id', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const routing = await recipeBomService.getRouting(c.req.param('id')!)
  return c.json(success(routing))
})
recipeBomRoutes.post('/routings', requirePermission(Permission.PRODUCT_CREATE), zValidator('json', routingSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof routingSchema>
  const routing = await recipeBomService.createRouting(body)
  return c.json(success(routing, { message: 'Routing created' }), 201)
})

/** Product API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { productService, categoryService, brandService, uomService } from '../service'

export const productRoutes = new Hono()

const productSchema = z.object({
  sku: z.string().min(1).max(50),
  itemCode: z.string().optional(),
  name: z.string().min(1).max(200),
  shortName: z.string().optional(),
  description: z.string().optional(),
  productType: z.enum(['RAW_MATERIAL', 'SEMI_FINISHED', 'FINISHED_GOOD', 'PACKAGING', 'CONSUMABLE', 'SERVICE', 'ASSET', 'BY_PRODUCT', 'SCRAP']).default('FINISHED_GOOD'),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  baseUomId: z.string().uuid(),
  altUomId: z.string().uuid().optional(),
  hsnCode: z.string().optional(),
  gstRate: z.number().min(0).max(100).optional(),
  mrp: z.number().nonnegative().optional(),
  standardCost: z.number().nonnegative().optional(),
  listPrice: z.number().nonnegative().optional(),
  shelfLifeDays: z.number().int().positive().optional(),
  batchRequired: z.boolean().default(false),
  serialRequired: z.boolean().default(false),
  expiryTracking: z.boolean().default(false),
  fifoStrategy: z.enum(['FEFO', 'FIFO', 'LIFO']).default('FEFO'),
  inspectionRequired: z.boolean().default(false),
  costingMethod: z.enum(['FIFO', 'LIFO', 'WEIGHTED_AVG', 'STANDARD', 'ACTUAL']).default('WEIGHTED_AVG'),
  abcClass: z.enum(['A', 'B', 'C']).optional(),
  xyzClass: z.enum(['X', 'Y', 'Z']).optional(),
  fsnClass: z.string().optional(),
  isCritical: z.boolean().default(false),
  procurementType: z.enum(['MAKE', 'BUY', 'BOTH']).default('MAKE'),
  leadTimeDays: z.number().int().positive().optional(),
  reorderLevel: z.number().nonnegative().optional(),
  reorderQty: z.number().nonnegative().optional(),
  safetyStock: z.number().nonnegative().optional(),
  storageCondition: z.string().optional(),
  imageUrl: z.string().optional(),
})

const transitionSchema = z.object({ targetStatus: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'ACTIVE', 'DISCONTINUED', 'ARCHIVED']), version: z.number().int().min(0) })
const barcodeSchema = z.object({ barcodeType: z.string().default('EAN13'), barcodeValue: z.string().min(1), isPrimary: z.boolean().default(false) })
const categorySchema = z.object({ code: z.string().min(1).max(50), name: z.string().min(1).max(200), description: z.string().optional(), productType: z.string().optional(), parentId: z.string().uuid().optional() })
const brandSchema = z.object({ code: z.string().min(1).max(50), name: z.string().min(1).max(200), description: z.string().optional(), manufacturer: z.string().optional() })

// Products
productRoutes.get('/products', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const result = await productService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, productType: c.req.query('productType') ?? undefined, status: c.req.query('status') ?? undefined, categoryId: c.req.query('categoryId') ?? undefined, brandId: c.req.query('brandId') ?? undefined, abcClass: c.req.query('abcClass') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

productRoutes.get('/products/:id', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const product = await productService.getById(c.req.param('id')!)
  return c.json(success(product))
})

productRoutes.post('/products', requirePermission(Permission.PRODUCT_CREATE), zValidator('json', productSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof productSchema>
  const product = await productService.create(body as Record<string, unknown>)
  return c.json(success(product, { message: 'Product created' }), 201)
})

productRoutes.patch('/products/:id', requirePermission(Permission.PRODUCT_UPDATE), async (c) => {
  const id = c.req.param('id')!; const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json()
  const updated = await productService.update(id, body, version)
  return c.json(success(updated, { message: 'Product updated' }))
})

productRoutes.delete('/products/:id', requirePermission(Permission.PRODUCT_DELETE), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  await productService.delete(c.req.param('id')!, version)
  return c.json(success({ deleted: true }, { message: 'Product deleted' }))
})

productRoutes.post('/products/:id/transition', requirePermission(Permission.PRODUCT_UPDATE), zValidator('json', transitionSchema), async (c) => {
  const id = c.req.param('id')!; const body = c.req.valid('json' as never) as z.infer<typeof transitionSchema>
  const updated = await productService.transition(id, body.targetStatus, body.version)
  return c.json(success(updated, { message: `Product transitioned to ${body.targetStatus}` }))
})

// Barcode lookup
productRoutes.get('/products/barcode/:barcode', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const product = await productService.lookupByBarcode(c.req.param('barcode')!)
  return c.json(success(product))
})

// Product barcodes
productRoutes.get('/products/:id/barcodes', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const barcodes = await productService.listBarcodes(c.req.param('id')!)
  return c.json(success(barcodes))
})

productRoutes.post('/products/:id/barcodes', requirePermission(Permission.PRODUCT_UPDATE), zValidator('json', barcodeSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof barcodeSchema>
  const id = await productService.addBarcode(c.req.param('id')!, body)
  return c.json(success({ id }, { message: 'Barcode added' }), 201)
})

// Categories
productRoutes.get('/categories', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const cats = await categoryService.list()
  return c.json(success(cats))
})

productRoutes.post('/categories', requirePermission(Permission.PRODUCT_CREATE), zValidator('json', categorySchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof categorySchema>
  const cat = await categoryService.create(body)
  return c.json(success(cat, { message: 'Category created' }), 201)
})

// Brands
productRoutes.get('/brands', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const brands = await brandService.list()
  return c.json(success(brands))
})

productRoutes.post('/brands', requirePermission(Permission.PRODUCT_CREATE), zValidator('json', brandSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof brandSchema>
  const brand = await brandService.create(body)
  return c.json(success(brand, { message: 'Brand created' }), 201)
})

// UOMs
productRoutes.get('/uoms', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const uoms = await uomService.list()
  return c.json(success(uoms))
})

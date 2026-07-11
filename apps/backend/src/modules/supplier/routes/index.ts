/** Supplier API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { supplierService, supplierCategoryService } from '../service'

export const supplierRoutes = new Hono()

const supplierSchema = z.object({
  vendorCode: z.string().min(1).max(50),
  legalName: z.string().min(1).max(200),
  tradeName: z.string().min(1).max(200),
  shortName: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  supplierType: z.enum(['DOMESTIC', 'INTERNATIONAL', 'LOCAL']).default('DOMESTIC'),
  vendorType: z.enum(['MANUFACTURER', 'DISTRIBUTOR', 'TRADER', 'SERVICE_PROVIDER', 'TRANSPORTER', 'CONTRACTOR', 'IMPORTER']).default('MANUFACTURER'),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
  cin: z.string().optional(),
  fssaiLicense: z.string().optional(),
  msmeRegNo: z.string().optional(),
  iecCode: z.string().optional(),
  primaryEmail: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  paymentTerms: z.enum(['NET15', 'NET30', 'NET45', 'NET60', 'IMMEDIATE', 'ADVANCE']).default('NET30'),
  creditLimit: z.number().nonnegative().optional(),
  creditDays: z.number().int().min(0).default(30),
  currency: z.string().default('INR'),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  isPreferred: z.boolean().default(false),
  isStrategic: z.boolean().default(false),
})

const transitionSchema = z.object({ targetStatus: z.enum(['DRAFT', 'VERIFICATION', 'APPROVED', 'ACTIVE', 'PROBATION', 'BLOCKED', 'BLACKLISTED', 'ARCHIVED']), version: z.number().int().min(0) })
const blacklistSchema = z.object({ reason: z.string().min(1).max(500) })
const contactSchema = z.object({ name: z.string().min(1).max(200), designation: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional(), mobile: z.string().optional(), isPrimary: z.boolean().default(false) })
const addressSchema = z.object({ addressType: z.enum(['BILLING', 'SHIPPING', 'FACTORY', 'WAREHOUSE', 'REGISTERED_OFFICE']).default('BILLING'), addressLine1: z.string().min(1), city: z.string().min(1), state: z.string().optional(), country: z.string().default('India'), postalCode: z.string().optional(), isPrimary: z.boolean().default(false) })
const complianceSchema = z.object({ complianceType: z.enum(['FSSAI', 'ISO_22000', 'HACCP', 'GST_REG', 'PAN', 'MSME', 'INSURANCE', 'NDA', 'VENDOR_AGREEMENT']), licenseNumber: z.string().optional(), issuingAuthority: z.string().optional(), issuedDate: z.string().datetime().optional(), expiryDate: z.string().datetime().optional(), documentUrl: z.string().optional(), notes: z.string().optional() })
const productMappingSchema = z.object({ productId: z.string().uuid(), supplierSku: z.string().optional(), unitPrice: z.number().nonnegative().optional(), moq: z.number().nonnegative().optional(), leadTimeDays: z.number().int().positive().optional(), isPreferred: z.boolean().default(false) })
const categorySchema = z.object({ code: z.string().min(1).max(50), name: z.string().min(1).max(200), description: z.string().optional(), supplierType: z.enum(['DOMESTIC', 'INTERNATIONAL', 'LOCAL']).default('DOMESTIC'), vendorType: z.string().default('MANUFACTURER') })

// Suppliers
supplierRoutes.get('/suppliers', requirePermission(Permission.SUPPLIER_READ), async (c) => {
  const result = await supplierService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, status: c.req.query('status') ?? undefined, vendorType: c.req.query('vendorType') ?? undefined, categoryId: c.req.query('categoryId') ?? undefined, isPreferred: c.req.query('isPreferred') === 'true' ? true : undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

supplierRoutes.get('/suppliers/:id', requirePermission(Permission.SUPPLIER_READ), async (c) => {
  const supplier = await supplierService.getById(c.req.param('id')!)
  return c.json(success(supplier))
})

supplierRoutes.post('/suppliers', requirePermission(Permission.SUPPLIER_CREATE), zValidator('json', supplierSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof supplierSchema>
  const supplier = await supplierService.create(body as Record<string, unknown>)
  return c.json(success(supplier, { message: 'Supplier created' }), 201)
})

supplierRoutes.patch('/suppliers/:id', requirePermission(Permission.SUPPLIER_UPDATE), async (c) => {
  const id = c.req.param('id')!; const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json()
  const updated = await supplierService.update(id, body, version)
  return c.json(success(updated, { message: 'Supplier updated' }))
})

supplierRoutes.delete('/suppliers/:id', requirePermission(Permission.SUPPLIER_DELETE), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  await supplierService.delete(c.req.param('id')!, version)
  return c.json(success({ deleted: true }, { message: 'Supplier deleted' }))
})

supplierRoutes.post('/suppliers/:id/transition', requirePermission(Permission.SUPPLIER_UPDATE), zValidator('json', transitionSchema), async (c) => {
  const id = c.req.param('id')!; const body = c.req.valid('json' as never) as z.infer<typeof transitionSchema>
  const updated = await supplierService.transition(id, body.targetStatus, body.version)
  return c.json(success(updated, { message: `Supplier transitioned to ${body.targetStatus}` }))
})

supplierRoutes.post('/suppliers/:id/blacklist', requirePermission(Permission.SUPPLIER_BLACKLIST), zValidator('json', blacklistSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof blacklistSchema>
  await supplierService.blacklist(c.req.param('id')!, body.reason)
  return c.json(success({ blacklisted: true }, { message: 'Supplier blacklisted' }))
})

// GST lookup
supplierRoutes.get('/suppliers/gst/:gstin', requirePermission(Permission.SUPPLIER_READ), async (c) => {
  const supplier = await supplierService.lookupByGstin(c.req.param('gstin')!)
  return c.json(success(supplier))
})

// Contacts
supplierRoutes.get('/suppliers/:id/contacts', requirePermission(Permission.SUPPLIER_READ), async (c) => {
  
  // Need to get from context — use the service
  const supplier = await supplierService.getById(c.req.param('id')!)
  return c.json(success(supplier['contacts'] ?? []))
})

supplierRoutes.post('/suppliers/:id/contacts', requirePermission(Permission.SUPPLIER_UPDATE), zValidator('json', contactSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof contactSchema>
  const id = await supplierService.addContact(c.req.param('id')!, body)
  return c.json(success({ id }, { message: 'Contact added' }), 201)
})

// Addresses
supplierRoutes.post('/suppliers/:id/addresses', requirePermission(Permission.SUPPLIER_UPDATE), zValidator('json', addressSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof addressSchema>
  const id = await supplierService.addAddress(c.req.param('id')!, body)
  return c.json(success({ id }, { message: 'Address added' }), 201)
})

// Compliance
supplierRoutes.post('/suppliers/:id/compliances', requirePermission(Permission.SUPPLIER_UPDATE), zValidator('json', complianceSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof complianceSchema>
  const id = await supplierService.addCompliance(c.req.param('id')!, body)
  return c.json(success({ id }, { message: 'Compliance added' }), 201)
})

// Product mapping
supplierRoutes.post('/suppliers/:id/products', requirePermission(Permission.SUPPLIER_UPDATE), zValidator('json', productMappingSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof productMappingSchema>
  const id = await supplierService.assignProduct(c.req.param('id')!, body)
  return c.json(success({ id }, { message: 'Product assigned' }), 201)
})

// Categories
supplierRoutes.get('/supplier-categories', requirePermission(Permission.SUPPLIER_READ), async (c) => {
  const cats = await supplierCategoryService.list()
  return c.json(success(cats))
})

supplierRoutes.post('/supplier-categories', requirePermission(Permission.SUPPLIER_CREATE), zValidator('json', categorySchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof categorySchema>
  const id = await supplierCategoryService.create(body)
  return c.json(success({ id }, { message: 'Category created' }), 201)
})

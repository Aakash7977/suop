/** Customer API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { customerService, customerGroupService } from '../service'

export const customerRoutes = new Hono()

// ─── Add Customer permissions to the Permission enum ───
// These are defined in the permissions registry already (SUPPLIER_READ etc.)
// For customer-specific permissions, we reuse the supplier pattern but with 'customer:' prefix
// For now, we use AUTH_MANAGE_USERS as proxy for customer management (will be refined in a future sprint)

const customerSchema = z.object({
  customerCode: z.string().min(1).max(50),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR', 'DEALER', 'CORPORATE', 'FRANCHISE', 'EXPORT', 'WALK_IN', 'CASH']).default('RETAIL'),
  legalName: z.string().optional(),
  tradeName: z.string().min(1).max(200),
  shortName: z.string().optional(),
  description: z.string().optional(),
  groupId: z.string().uuid().optional(),
  territory: z.string().optional(),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).optional(),
  primaryEmail: z.string().email().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  website: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  paymentTerms: z.enum(['NET15', 'NET30', 'NET45', 'NET60', 'IMMEDIATE', 'ADVANCE']).default('NET30'),
  creditLimit: z.number().nonnegative().optional(),
  creditDays: z.number().int().min(0).default(30),
  currency: z.string().default('INR'),
  riskRating: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  loyaltyCategory: z.enum(['SILVER', 'GOLD', 'PLATINUM']).optional(),
  tags: z.array(z.string()).optional(),
})

const transitionSchema = z.object({ targetStatus: z.enum(['LEAD', 'PROSPECT', 'APPROVED', 'ACTIVE', 'BLOCKED', 'INACTIVE', 'ARCHIVED']), version: z.number().int().min(0) })
const contactSchema = z.object({ name: z.string().min(1).max(200), designation: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional(), mobile: z.string().optional(), isPrimary: z.boolean().default(false) })
const addressSchema = z.object({ addressType: z.enum(['BILLING', 'SHIPPING', 'REGISTERED_OFFICE']).default('BILLING'), addressLine1: z.string().min(1), city: z.string().min(1), state: z.string().optional(), country: z.string().default('India'), postalCode: z.string().optional(), isPrimary: z.boolean().default(false) })
const groupSchema = z.object({ code: z.string().min(1).max(50), name: z.string().min(1).max(200), description: z.string().optional() })

// ─── Use dedicated CUSTOMER_* permissions (defined in registry) ───
const CUSTOMER_READ = Permission.CUSTOMER_READ
const CUSTOMER_CREATE = Permission.CUSTOMER_CREATE
const CUSTOMER_UPDATE = Permission.CUSTOMER_UPDATE
const CUSTOMER_DELETE = Permission.CUSTOMER_DELETE

// Customers
customerRoutes.get('/customers', requirePermission(CUSTOMER_READ), async (c) => {
  const result = await customerService.list({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, status: c.req.query('status') ?? undefined, customerType: c.req.query('customerType') ?? undefined, groupId: c.req.query('groupId') ?? undefined, creditHold: c.req.query('creditHold') === 'true' ? true : undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})

customerRoutes.get('/customers/:id', requirePermission(CUSTOMER_READ), async (c) => {
  const customer = await customerService.getById(c.req.param('id')!)
  return c.json(success(customer))
})

customerRoutes.post('/customers', requirePermission(CUSTOMER_CREATE), zValidator('json', customerSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof customerSchema>
  const customer = await customerService.create(body as Record<string, unknown>)
  return c.json(success(customer, { message: 'Customer created' }), 201)
})

customerRoutes.patch('/customers/:id', requirePermission(CUSTOMER_UPDATE), async (c) => {
  const id = c.req.param('id')!; const version = Number(c.req.header('If-Match') ?? '0')
  const body = await c.req.json()
  const updated = await customerService.update(id, body, version)
  return c.json(success(updated, { message: 'Customer updated' }))
})

customerRoutes.delete('/customers/:id', requirePermission(CUSTOMER_DELETE), async (c) => {
  const version = Number(c.req.header('If-Match') ?? '0')
  await customerService.delete(c.req.param('id')!, version)
  return c.json(success({ deleted: true }, { message: 'Customer deleted' }))
})

customerRoutes.post('/customers/:id/transition', requirePermission(CUSTOMER_UPDATE), zValidator('json', transitionSchema), async (c) => {
  const id = c.req.param('id')!; const body = c.req.valid('json' as never) as z.infer<typeof transitionSchema>
  const updated = await customerService.transition(id, body.targetStatus, body.version)
  return c.json(success(updated, { message: `Customer transitioned to ${body.targetStatus}` }))
})

// Credit status
customerRoutes.get('/customers/:id/credit', requirePermission(CUSTOMER_READ), async (c) => {
  const credit = await customerService.getCreditStatus(c.req.param('id')!)
  return c.json(success(credit))
})

// GST lookup
customerRoutes.get('/customers/gst/:gstin', requirePermission(CUSTOMER_READ), async (c) => {
  const customer = await customerService.lookupByGstin(c.req.param('gstin')!)
  return c.json(success(customer))
})

// Contacts
customerRoutes.post('/customers/:id/contacts', requirePermission(CUSTOMER_UPDATE), zValidator('json', contactSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof contactSchema>
  const id = await customerService.addContact(c.req.param('id')!, body)
  return c.json(success({ id }, { message: 'Contact added' }), 201)
})

// Addresses
customerRoutes.post('/customers/:id/addresses', requirePermission(CUSTOMER_UPDATE), zValidator('json', addressSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof addressSchema>
  const id = await customerService.addAddress(c.req.param('id')!, body)
  return c.json(success({ id }, { message: 'Address added' }), 201)
})

// Groups
customerRoutes.get('/customer-groups', requirePermission(CUSTOMER_READ), async (c) => {
  const groups = await customerGroupService.list()
  return c.json(success(groups))
})

customerRoutes.post('/customer-groups', requirePermission(CUSTOMER_CREATE), zValidator('json', groupSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof groupSchema>
  const id = await customerGroupService.create(body)
  return c.json(success({ id }, { message: 'Group created' }), 201)
})

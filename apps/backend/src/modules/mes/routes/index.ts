/** MES API Routes */
import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { mesService } from '../service'

export const mesRoutes = new Hono()

const wcSchema = z.object({
  wcCode: z.string().min(1), wcName: z.string().min(1), wcType: z.string().default('PRODUCTION'),
  plantId: z.string().uuid().optional(), plantName: z.string().optional(),
  departmentId: z.string().uuid().optional(), capacityPerHour: z.number().nonnegative().optional(),
  description: z.string().optional(),
})

const machineSchema = z.object({
  machineCode: z.string().min(1), machineName: z.string().min(1),
  workCenterId: z.string().uuid().optional(), productionLineId: z.string().uuid().optional(),
  machineType: z.string().optional(), manufacturer: z.string().optional(), model: z.string().optional(),
  serialNumber: z.string().optional(), maxCapacity: z.number().nonnegative().optional(),
  installedDate: z.string().optional(), description: z.string().optional(),
})

const shiftSchema = z.object({
  shiftCode: z.string().min(1), shiftName: z.string().min(1),
  startTime: z.string().min(1), endTime: z.string().min(1),
  breakMinutes: z.number().int().nonnegative().default(30), description: z.string().optional(),
})

const downtimeSchema = z.object({
  machineId: z.string().uuid(), machineCode: z.string().min(1),
  productionOrderId: z.string().uuid().optional(), productionOrderNumber: z.string().optional(),
  downtimeStart: z.string().datetime(), downtimeEnd: z.string().datetime().optional(),
  downtimeType: z.string().min(1), downtimeCategory: z.string().optional(),
  reason: z.string().min(1), actionTaken: z.string().optional(),
})

const eventSchema = z.object({
  eventType: z.string().min(1), productionOrderId: z.string().uuid().optional(),
  productionOrderNumber: z.string().optional(), machineId: z.string().uuid().optional(),
  machineCode: z.string().optional(), operatorId: z.string().uuid().optional(),
  operatorName: z.string().optional(), eventData: z.record(z.unknown()).optional(),
  severity: z.enum(['INFO', 'WARN', 'ERROR', 'CRITICAL']).default('INFO'), description: z.string().optional(),
})

// Work Centers
mesRoutes.get('/work-centers', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const result = await mesService.listWorkCenters({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, isActive: c.req.query('isActive') === 'true' ? true : c.req.query('isActive') === 'false' ? false : undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
mesRoutes.post('/work-centers', requirePermission(Permission.PRODUCT_CREATE), zValidator('json', wcSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof wcSchema>
  const wc = await mesService.createWorkCenter(body)
  return c.json(success(wc, { message: 'Work center created' }), 201)
})

// Machines
mesRoutes.get('/machines', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const result = await mesService.listMachines({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), search: c.req.query('search') ?? undefined, isActive: c.req.query('isActive') === 'true' ? true : c.req.query('isActive') === 'false' ? false : undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
mesRoutes.post('/machines', requirePermission(Permission.PRODUCT_CREATE), zValidator('json', machineSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof machineSchema>
  const machine = await mesService.createMachine(body)
  return c.json(success(machine, { message: 'Machine created' }), 201)
})
mesRoutes.post('/machines/:id/status', requirePermission(Permission.PRODUCT_UPDATE), async (c) => {
  const body = await c.req.json()
  const updated = await mesService.updateMachineStatus(c.req.param('id')!, body.newStatus)
  return c.json(success(updated, { message: 'Machine status updated' }))
})

// Shifts
mesRoutes.get('/shifts', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const result = await mesService.listShifts()
  return c.json(success(result.rows))
})
mesRoutes.post('/shifts', requirePermission(Permission.PRODUCT_CREATE), zValidator('json', shiftSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof shiftSchema>
  const shift = await mesService.createShift(body)
  return c.json(success(shift, { message: 'Shift created' }), 201)
})

// Downtime
mesRoutes.get('/downtime', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const result = await mesService.listDowntime({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), machineId: c.req.query('machineId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
mesRoutes.post('/downtime', requirePermission(Permission.PRODUCT_UPDATE), zValidator('json', downtimeSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof downtimeSchema>
  const result = await mesService.recordDowntime(body)
  return c.json(success(result, { message: 'Downtime recorded' }), 201)
})

// Events
mesRoutes.get('/events', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const result = await mesService.listEvents({ page: Number(c.req.query('page') ?? 1), pageSize: Number(c.req.query('pageSize') ?? 25), productionOrderId: c.req.query('productionOrderId') ?? undefined })
  return c.json(paginated(result.rows, { correlationId: c.req.header('X-Request-Id') ?? '', page: result.page, pageSize: result.pageSize, total: result.total }))
})
mesRoutes.post('/events', requirePermission(Permission.PRODUCT_UPDATE), zValidator('json', eventSchema), async (c) => {
  const body = c.req.valid('json' as never) as z.infer<typeof eventSchema>
  const result = await mesService.recordEvent(body)
  return c.json(success(result, { message: 'Event recorded' }), 201)
})

// OEE Analytics
mesRoutes.get('/analytics/oee/:machineId', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const oee = await mesService.calculateOEE(c.req.param('machineId')!, c.req.query('startDate') ?? new Date(Date.now() - 86400000).toISOString(), c.req.query('endDate') ?? new Date().toISOString())
  return c.json(success(oee))
})

// Dashboard
mesRoutes.get('/dashboard', requirePermission(Permission.PRODUCT_READ), async (c) => {
  const dashboard = await mesService.getProductionDashboard()
  return c.json(success(dashboard))
})

/**
 * PayrollProcessingRoutes — Full CRUD + workflow transition routes
 *
 * RC1 Fix Pack 1: Extended from stub (GET only) to full CRUD.
 *
 * Endpoints:
 *   GET    /                  List with pagination/filter/search
 *   GET    /:id               Get by ID
 *   POST   /                  Create (audit + event emitted by service)
 *   PUT    /:id               Update (optimistic concurrency via version)
 *   DELETE /:id               Soft-delete (deleted_at, deleted_by)
 *   POST   /:id/transition    Workflow state transition
 *   GET    /count             Count by status
 *   GET    /exists/:code      Check existence by code field
 */

import { Hono } from 'hono'
import { success, paginated } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { PayrollProcessingService } from '../service'

export const PayrollProcessingRoutes = new Hono()

const READ_PERM = Permission.PAYROLL_READ
const WRITE_PERM = Permission.PAYROLL_APPROVE

// ─── LIST ────────────────────────────────────────────────────────────────────
PayrollProcessingRoutes.get('/', requirePermission(READ_PERM), async (c) => {
  const r = await PayrollProcessingService.list({
    page: Number(c.req.query('page') ?? 1),
    pageSize: Number(c.req.query('pageSize') ?? 25),
    status: c.req.query('status') ?? undefined,
    search: c.req.query('search') ?? undefined,
  })
  return c.json(paginated(r.rows, {
    correlationId: c.req.header('X-Request-Id') ?? '',
    page: r.page,
    pageSize: r.pageSize,
    total: r.total,
  }))
})

// ─── COUNT ───────────────────────────────────────────────────────────────────
PayrollProcessingRoutes.get('/count', requirePermission(READ_PERM), async (c) => {
  const total = await PayrollProcessingService.count({
    status: c.req.query('status') ?? undefined,
  })
  return c.json(success({ total }))
})

// ─── EXISTS BY CODE ──────────────────────────────────────────────────────────
PayrollProcessingRoutes.get('/exists/:code', requirePermission(READ_PERM), async (c) => {
  const exists = await PayrollProcessingService.existsByCode(c.req.param('code')!)
  return c.json(success({ exists }))
})

// ─── GET BY ID ───────────────────────────────────────────────────────────────
PayrollProcessingRoutes.get('/:id', requirePermission(READ_PERM), async (c) => {
  const item = await PayrollProcessingService.getById(c.req.param('id')!)
  return c.json(success(item))
})

// ─── CREATE ──────────────────────────────────────────────────────────────────
PayrollProcessingRoutes.post('/', requirePermission(WRITE_PERM), async (c) => {
  const body = await c.req.json()
  const result = await PayrollProcessingService.create(body)
  return c.json(success(result), 201)
})

// ─── UPDATE ──────────────────────────────────────────────────────────────────
PayrollProcessingRoutes.put('/:id', requirePermission(WRITE_PERM), async (c) => {
  const body = await c.req.json()
  const result = await PayrollProcessingService.update(c.req.param('id')!, body)
  return c.json(success(result))
})

// ─── DELETE (soft) ───────────────────────────────────────────────────────────
PayrollProcessingRoutes.delete('/:id', requirePermission(WRITE_PERM), async (c) => {
  const reason = c.req.query('reason') ?? undefined
  await PayrollProcessingService.delete(c.req.param('id')!, reason)
  return c.json(success({ id: c.req.param('id')!, deleted: true }))
})

// ─── TRANSITION (workflow) ───────────────────────────────────────────────────
PayrollProcessingRoutes.post('/:id/transition', requirePermission(WRITE_PERM), async (c) => {
  const body = await c.req.json()
  const result = await PayrollProcessingService.transition(
    c.req.param('id')!,
    body.targetState,
    body.reason,
  )
  return c.json(success(result))
})

/**
 * EmployeeMasterRoutes — Full CRUD + workflow transition routes
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
import { EmployeeMasterService } from '../service'

export const EmployeeMasterRoutes = new Hono()

const READ_PERM = Permission.HR_READ
const WRITE_PERM = Permission.HR_CREATE

// ─── LIST ────────────────────────────────────────────────────────────────────
EmployeeMasterRoutes.get('/', requirePermission(READ_PERM), async (c) => {
  const r = await EmployeeMasterService.list({
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
EmployeeMasterRoutes.get('/count', requirePermission(READ_PERM), async (c) => {
  const total = await EmployeeMasterService.count({
    status: c.req.query('status') ?? undefined,
  })
  return c.json(success({ total }))
})

// ─── EXISTS BY CODE ──────────────────────────────────────────────────────────
EmployeeMasterRoutes.get('/exists/:code', requirePermission(READ_PERM), async (c) => {
  const exists = await EmployeeMasterService.existsByCode(c.req.param('code')!)
  return c.json(success({ exists }))
})

// ─── GET BY ID ───────────────────────────────────────────────────────────────
EmployeeMasterRoutes.get('/:id', requirePermission(READ_PERM), async (c) => {
  const item = await EmployeeMasterService.getById(c.req.param('id')!)
  return c.json(success(item))
})

// ─── CREATE ──────────────────────────────────────────────────────────────────
EmployeeMasterRoutes.post('/', requirePermission(WRITE_PERM), async (c) => {
  const body = await c.req.json()
  const result = await EmployeeMasterService.create(body)
  return c.json(success(result), 201)
})

// ─── UPDATE ──────────────────────────────────────────────────────────────────
EmployeeMasterRoutes.put('/:id', requirePermission(WRITE_PERM), async (c) => {
  const body = await c.req.json()
  const result = await EmployeeMasterService.update(c.req.param('id')!, body)
  return c.json(success(result))
})

// ─── DELETE (soft) ───────────────────────────────────────────────────────────
EmployeeMasterRoutes.delete('/:id', requirePermission(WRITE_PERM), async (c) => {
  const reason = c.req.query('reason') ?? undefined
  await EmployeeMasterService.delete(c.req.param('id')!, reason)
  return c.json(success({ id: c.req.param('id')!, deleted: true }))
})

// ─── TRANSITION (workflow) ───────────────────────────────────────────────────
EmployeeMasterRoutes.post('/:id/transition', requirePermission(WRITE_PERM), async (c) => {
  const body = await c.req.json()
  const result = await EmployeeMasterService.transition(
    c.req.param('id')!,
    body.targetState,
    body.reason,
  )
  return c.json(success(result))
})

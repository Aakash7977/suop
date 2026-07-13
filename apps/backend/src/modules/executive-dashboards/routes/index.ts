/**
 * ExecutiveDashboardsRoutes — Full CRUD + workflow transition routes
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
import { ExecutiveDashboardsService } from '../service'

export const ExecutiveDashboardsRoutes = new Hono()

const READ_PERM = Permission.BI_READ
const WRITE_PERM = Permission.BI_SETTINGS

// ─── LIST ────────────────────────────────────────────────────────────────────
ExecutiveDashboardsRoutes.get('/', requirePermission(READ_PERM), async (c) => {
  const r = await ExecutiveDashboardsService.list({
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
ExecutiveDashboardsRoutes.get('/count', requirePermission(READ_PERM), async (c) => {
  const total = await ExecutiveDashboardsService.count({
    status: c.req.query('status') ?? undefined,
  })
  return c.json(success({ total }))
})

// ─── EXISTS BY CODE ──────────────────────────────────────────────────────────
ExecutiveDashboardsRoutes.get('/exists/:code', requirePermission(READ_PERM), async (c) => {
  const exists = await ExecutiveDashboardsService.existsByCode(c.req.param('code')!)
  return c.json(success({ exists }))
})

// ─── GET BY ID ───────────────────────────────────────────────────────────────
ExecutiveDashboardsRoutes.get('/:id', requirePermission(READ_PERM), async (c) => {
  const item = await ExecutiveDashboardsService.getById(c.req.param('id')!)
  return c.json(success(item))
})

// ─── CREATE ──────────────────────────────────────────────────────────────────
ExecutiveDashboardsRoutes.post('/', requirePermission(WRITE_PERM), async (c) => {
  const body = await c.req.json()
  const result = await ExecutiveDashboardsService.create(body)
  return c.json(success(result), 201)
})

// ─── UPDATE ──────────────────────────────────────────────────────────────────
ExecutiveDashboardsRoutes.put('/:id', requirePermission(WRITE_PERM), async (c) => {
  const body = await c.req.json()
  const result = await ExecutiveDashboardsService.update(c.req.param('id')!, body)
  return c.json(success(result))
})

// ─── DELETE (soft) ───────────────────────────────────────────────────────────
ExecutiveDashboardsRoutes.delete('/:id', requirePermission(WRITE_PERM), async (c) => {
  const reason = c.req.query('reason') ?? undefined
  await ExecutiveDashboardsService.delete(c.req.param('id')!, reason)
  return c.json(success({ id: c.req.param('id')!, deleted: true }))
})

// ─── TRANSITION (workflow) ───────────────────────────────────────────────────
ExecutiveDashboardsRoutes.post('/:id/transition', requirePermission(WRITE_PERM), async (c) => {
  const body = await c.req.json()
  const result = await ExecutiveDashboardsService.transition(
    c.req.param('id')!,
    body.targetState,
    body.reason,
  )
  return c.json(success(result))
})

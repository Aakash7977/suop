/**
 * @suop/backend — Enterprise Event Bus Routes (Phase 56)
 */

import { Hono } from 'hono'
import { success } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import {
  getRegisteredEvents,
  getEventBusStats,
  replayEvents,
  publishEvent,
  type EventCategory,
} from '../service'

export const eventBusRoutes = new Hono()

// ─── Event Registry ─────────────────────────────────────────────────────────

eventBusRoutes.get('/registry', requirePermission(Permission.AUDIT_READ), (c) => {
  const events = getRegisteredEvents()
  return c.json(success(events))
})

// ─── Event Bus Stats ────────────────────────────────────────────────────────

eventBusRoutes.get('/stats', requirePermission(Permission.AUDIT_READ), async (c) => {
  const stats = await getEventBusStats()
  return c.json(success(stats))
})

// ─── Publish Event ──────────────────────────────────────────────────────────

eventBusRoutes.post('/publish', requirePermission(Permission.AUDIT_READ), async (c) => {
  const body = await c.req.json()
  const eventId = await publishEvent({
    eventName: body.eventName,
    category: (body.category as EventCategory) ?? 'DOMAIN',
    version: body.version ?? '1.0.0',
    payload: body.payload,
  })
  return c.json(success({ eventId }), 201)
})

// ─── Replay Events ──────────────────────────────────────────────────────────

eventBusRoutes.post('/replay', requirePermission(Permission.AUDIT_READ), async (c) => {
  const body = await c.req.json()
  const result = await replayEvents({
    eventName: body.eventName,
    tenantId: body.tenantId,
    fromTimestamp: body.fromTimestamp ? new Date(body.fromTimestamp) : undefined,
    toTimestamp: body.toTimestamp ? new Date(body.toTimestamp) : undefined,
    limit: body.limit ?? 1000,
    handler: async (event) => {
      logger.info('Replaying event', { eventId: event.eventId, eventName: event.eventName })
    },
  })
  return c.json(success(result))
})

import { logger } from '@/core/logging'

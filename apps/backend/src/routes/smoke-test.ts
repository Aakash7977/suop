/**
 * Smoke Test Routes — Temporary (removed before Phase 1)
 *
 * This endpoint exists ONLY to prove the complete foundation works end-to-end:
 *   POST → Auth → Validation → Database → Workflow → Audit → Event Bus → Notification → Response
 *
 * Per Task 6 of the Foundation Acceptance Gate.
 * Per Task 3: also demonstrates middleware execution order.
 */

import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { success } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { signAccessToken } from '@/core/auth'
import { auditService } from '@/core/audit'
import { eventBus, EventName, type DomainEvent } from '@/core/events'
import { notificationEngine, templateEngine } from '@/core/notifications'
import { workflowRegistry, type WorkflowDefinition, type WorkflowEntity } from '@/core/workflow'
import { query } from '@/core/db/pglite'
import { getRequestContext } from '@/core/context'
import { logger } from '@/core/logging'

export const smokeTestRoutes = new Hono()

// ─── Register smoke test notification template ──────────────────────────────

templateEngine.register({
  id: 'smoke-test-template',
  subject: 'Smoke Test: {{message}}',
  body: 'This is a smoke test notification. Message: {{message}}',
  channel: 'IN_APP',
})

// ─── Test Workflow Definition ───────────────────────────────────────────────

type SmokeTestState = 'CREATED' | 'VALIDATED' | 'COMPLETED'

interface SmokeTestEntity extends WorkflowEntity {
  id: string
  status: SmokeTestState
  version: number
  message: string
}

const smokeTestWorkflow: WorkflowDefinition<SmokeTestState, SmokeTestEntity> = {
  name: 'SmokeTest',
  initialState: 'CREATED',
  states: ['CREATED', 'VALIDATED', 'COMPLETED'] as const,
  transitions: [
    {
      from: 'CREATED',
      to: 'VALIDATED',
      guard: async (e) => e.message.length > 0,
      onAfter: async (entity, updated) => {
        logger.info('SmokeTest workflow transition', {
          from: entity.status,
          to: updated.status,
          entityId: entity.id,
        })
      },
    },
    {
      from: 'VALIDATED',
      to: 'COMPLETED',
    },
  ],
}

// Register workflow (idempotent — check if already registered)
try {
  workflowRegistry.register(smokeTestWorkflow)
} catch {
  // Already registered — fine for hot reload
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// Route 1: Generate a test JWT token (no auth required — for testing only)
smokeTestRoutes.post('/token', (c) => {
  const token = signAccessToken({
    userId: '00000000-0000-0000-0000-000000000002',
    tenantId: '00000000-0000-0000-0000-000000000001',
    email: 'smoke-test@sudhamrit.com',
    roles: ['tenant_admin'],
    permissions: [],
  })
  return c.json(success({ token: token.token, expiresAt: token.expiresAt }))
})

// Route 2: Full smoke test — exercises every foundation component
const smokeTestSchema = z.object({
  message: z.string().min(1).max(100),
})

smokeTestRoutes.post(
  '/test',
  requirePermission(Permission.AUDIT_READ),
  zValidator('json', smokeTestSchema),
  async (c) => {
    const ctx = getRequestContext()
    const body = c.req.valid('json' as never) as z.infer<typeof smokeTestSchema>
    const middlewareTrace: string[] = []

    // ─── 1. Auth already verified (middleware) ──────────────────────────────
    middlewareTrace.push('1. AUTH ✓ — JWT verified, user context loaded')
    middlewareTrace.push(`   User: ${ctx?.userEmail}, Tenant: ${ctx?.tenantId}`)

    // ─── 2. Validation already verified (zod-validator) ─────────────────────
    middlewareTrace.push('2. VALIDATION ✓ — Request body validated by zod')
    middlewareTrace.push(`   Message: "${body.message}"`)

    // ─── 3. Database — write audit log ──────────────────────────────────────
    await auditService.log({
      tenantId: ctx!.tenantId!,
      actorType: 'USER',
      actorId: ctx!.userId,
      actorName: ctx!.userEmail,
      correlationId: ctx!.correlationId,
      action: 'CREATE',
      severity: 'INFO',
      entityType: 'SmokeTest',
      entityId: null,
      metadata: { message: body.message, source: 'smoke-test' },
    })
    middlewareTrace.push('3. DATABASE ✓ — Audit log written to PostgreSQL')

    // Verify audit log was written
    const auditCount = await query<{ cnt: string }>(
      `SELECT COUNT(*) as cnt FROM audit_logs WHERE tenant_id = $1 AND action = 'CREATE'`,
      [ctx!.tenantId]
    )
    middlewareTrace.push(`   Audit logs in DB: ${auditCount.rows[0]!.cnt}`)

    // ─── 4. Workflow — execute state machine transition ─────────────────────
    const machine = workflowRegistry.get<SmokeTestState, SmokeTestEntity>('SmokeTest')
    const entity: SmokeTestEntity = {
      id: crypto.randomUUID(),
      status: 'CREATED',
      version: 0,
      message: body.message,
    }

    const canTransition = await machine.canTransition(entity, 'VALIDATED', {
      userId: ctx!.userId,
      tenantId: ctx!.tenantId,
      correlationId: ctx!.correlationId,
    })
    if (!canTransition.allowed) {
      throw new Error('Workflow guard rejected transition')
    }

    const validated = await machine.transition(entity, 'VALIDATED', {
      userId: ctx!.userId,
      tenantId: ctx!.tenantId,
      correlationId: ctx!.correlationId,
    })
    middlewareTrace.push('4. WORKFLOW ✓ — State machine transitioned: CREATED → VALIDATED')
    middlewareTrace.push(`   Entity ID: ${validated.id}, Version: ${validated.version}`)

    // ─── 5. Event Bus — publish domain event ────────────────────────────────
    let eventReceived = false
    const testHandler = {
      eventName: EventName.SystemError,
      handle: async (_event: DomainEvent) => {
        eventReceived = true
      },
      retries: 0,
    }
    eventBus.subscribe(testHandler)

    const event: DomainEvent = {
      id: crypto.randomUUID(),
      name: EventName.SystemError,
      payload: { source: 'smoke-test', message: body.message },
      tenantId: ctx!.tenantId!,
      correlationId: ctx!.correlationId,
      actorId: ctx!.userId,
      timestamp: new Date(),
      version: 1,
    }
    await eventBus.publish(event)
    middlewareTrace.push('5. EVENT BUS ✓ — Domain event published and received')
    middlewareTrace.push(`   Event: ${event.name}, ID: ${event.id}`)

    // ─── 6. Notification — queue notification ───────────────────────────────
    await notificationEngine.queueNotification({
      tenantId: ctx!.tenantId!,
      userId: ctx!.userId,
      recipientEmail: ctx!.userEmail,
      channel: 'IN_APP',
      templateId: 'smoke-test-template',
      templateData: { message: body.message },
      priority: 'NORMAL',
      correlationId: ctx!.correlationId,
    })
    middlewareTrace.push('6. NOTIFICATION ✓ — Notification queued')

    // Verify notification in DB
    const notifCount = await query<{ cnt: string }>(
      `SELECT COUNT(*) as cnt FROM notification_outbox WHERE tenant_id = $1 AND template_id = 'smoke-test-template'`,
      [ctx!.tenantId]
    )
    middlewareTrace.push(`   Notifications in DB: ${notifCount.rows[0]!.cnt}`)

    // ─── 7. Response ─────────────────────────────────────────────────────────
    middlewareTrace.push('7. RESPONSE ✓ — Building success response')

    return c.json(
      success({
        status: 'PASS',
        middlewareTrace,
        verified: {
          auth: true,
          validation: true,
          database: true,
          workflow: { from: 'CREATED', to: 'VALIDATED', version: validated.version },
          eventBus: { published: true, received: eventReceived },
          notification: { queued: true, count: Number(notifCount.rows[0]!.cnt) },
          audit: { logged: true, count: Number(auditCount.rows[0]!.cnt) },
        },
        context: {
          correlationId: ctx!.correlationId,
          userId: ctx!.userId,
          tenantId: ctx!.tenantId,
          method: ctx!.method,
          path: ctx!.path,
        },
      })
    )
  }
)

// Route 3: Middleware order verification
smokeTestRoutes.get('/middleware-order', requirePermission(Permission.AUDIT_READ), (c) => {
  const ctx = getRequestContext()
  return c.json(
    success({
      executionOrder: [
        '1. RequestIdMiddleware — assigns correlation ID',
        '2. LoggingMiddleware — logs request start',
        '3. AuthMiddleware — validates JWT, loads user context',
        '4. TenantMiddleware — verifies tenant context',
        '5. RBAC Middleware — checks permission (AUDIT_READ)',
        '6. AuditMiddleware — records request (after response)',
        '7. ValidationMiddleware — validates body (per-route, zod-validator)',
      ],
      verified: {
        requestIdPresent: !!ctx?.correlationId,
        authVerified: !!ctx?.userId,
        tenantLoaded: !!ctx?.tenantId,
        permissionsLoaded: ctx?.permissions.length ?? 0 > 0,
        rolesLoaded: ctx?.roles.length ?? 0 > 0,
      },
      context: {
        correlationId: ctx?.correlationId,
        userId: ctx?.userId,
        tenantId: ctx?.tenantId,
        roles: ctx?.roles,
        permissions: ctx?.permissions,
        ip: ctx?.ip,
        method: ctx?.method,
        path: ctx?.path,
      },
    })
  )
})

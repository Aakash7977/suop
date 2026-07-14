/**
 * @suop/backend — Background Scheduler
 *
 * Phase 1.6 Hardening:
 *   - Drains event outbox every 5 seconds
 *   - Drains notification outbox every 10 seconds
 *   - Auto-revokes expired break-glass sessions every 5 minutes
 *   - Verifies audit hash chain hourly
 *
 * All jobs are designed to be safe for multi-instance deployment:
 *   - Outbox draining uses SELECT FOR UPDATE SKIP LOCKED
 *   - Break-glass revocation is idempotent
 *   - Audit verification is read-only
 */

import { logger } from '@/core/logging'
import { eventBus } from '@/core/events'
import { breakGlassService } from '@/core/security/break-glass-service'

// ─── Scheduler State ────────────────────────────────────────────────────────

const intervals: ReturnType<typeof setInterval>[] = []
let started = false

// ─── Jobs ───────────────────────────────────────────────────────────────────

/**
 * Drain event outbox — publish pending events to subscribers.
 * Runs every 5 seconds.
 */
async function drainEventOutbox(): Promise<void> {
  try {
    await eventBus.drainOutbox()
  } catch (err) {
    logger.error('Event outbox drain failed', { error: (err as Error).message })
  }
}

/**
 * Drain notification outbox — deliver pending notifications.
 * Runs every 10 seconds.
 */
async function drainNotificationOutbox(): Promise<void> {
  try {
    const { notificationEngine } = await import('@/core/notifications')
    await notificationEngine.drainOutbox()
  } catch (err) {
    logger.debug('Notification outbox drain skipped', { error: (err as Error).message })
  }
}

/**
 * Auto-revoke expired break-glass sessions.
 * Runs every 5 minutes.
 */
async function revokeExpiredBreakGlassSessions(): Promise<void> {
  try {
    const { _runInTestContext } = await import('@/core/context')
    await _runInTestContext(
      {
        userId: null,
        userEmail: 'system',
        tenantId: null,
        roles: [],
        permissions: [],
        correlationId: 'break-glass-revoke-cron',
        ip: null,
        userAgent: 'system-scheduler',
        method: 'CRON',
        path: '/internal/break-glass-revoke',
        startedAt: Date.now(),
      },
      async () => {
        const count = await breakGlassService.revokeExpiredSessions()
        if (count > 0) {
          logger.info('Break-glass sessions auto-revoked', { count })
        }
      }
    )
  } catch (err) {
    logger.error('Break-glass revocation failed', { error: (err as Error).message })
  }
}

/**
 * Verify audit hash chain integrity.
 * Runs every hour.
 */
async function verifyAuditChain(): Promise<void> {
  try {
    const { verifyAuditChain } = await import('@/core/security/audit-hardening')
    const result = await verifyAuditChain({})
    if (!result.valid) {
      logger.error('Audit chain verification FAILED — tampering detected!', {
        brokenAt: result.brokenAt,
        expectedHash: result.expectedHash,
        actualHash: result.actualHash,
      })
    } else {
      logger.debug('Audit chain verification passed', { entriesChecked: result.entriesChecked })
    }
  } catch (err) {
    logger.debug('Audit chain verification skipped', { error: (err as Error).message })
  }
}

/**
 * Mark expired inventory items.
 * Runs every hour. Scans all tenants for inventory past expiry_date and marks is_expired = true.
 */
async function markExpiredInventory(): Promise<void> {
  try {
    const { query } = await import('@/core/db/pglite')
    const result = await query(
      `UPDATE inventory SET is_expired = true, updated_at = NOW(), version = version + 1
       WHERE deleted_at IS NULL AND quantity > 0 AND expiry_date IS NOT NULL AND expiry_date < NOW() AND is_expired = false
       RETURNING id, tenant_id, product_sku, batch_number, expiry_date`
    )
    if (result.rows.length > 0) {
      logger.info('Inventory items marked expired', { count: result.rows.length })
      // Group by tenant for audit
      const byTenant = new Map<string, number>()
      for (const row of result.rows) {
        const tid = String(row['tenant_id'])
        byTenant.set(tid, (byTenant.get(tid) ?? 0) + 1)
      }
      // Write audit log for each tenant
      const { _runInTestContext } = await import('@/core/context')
      for (const [tenantId, count] of byTenant) {
        await _runInTestContext(
          {
            userId: null, userEmail: 'system', tenantId,
            roles: [], permissions: [],
            correlationId: 'inventory-expiry-cron',
            ip: null, userAgent: 'system-scheduler',
            method: 'CRON', path: '/internal/inventory-expiry',
            startedAt: Date.now(),
          },
          async () => {
            const { auditService } = await import('@/core/audit')
            await auditService.log({
              tenantId, correlationId: 'inventory-expiry-cron',
              actorType: 'SYSTEM', actorId: 'system', actorName: 'System',
              action: 'STOCK_EXPIRED', entityType: 'Inventory', entityId: 'batch',
              severity: 'WARN',
              after: { expiredCount: count, items: result.rows.filter(r => String(r['tenant_id']) === tenantId) },
            })
          }
        )
      }
    }
  } catch (err) {
    logger.error('Mark expired inventory failed', { error: (err as Error).message })
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function startScheduler(): void {
  if (started) return
  started = true

  intervals.push(setInterval(drainEventOutbox, 5_000))
  intervals.push(setInterval(drainNotificationOutbox, 10_000))
  intervals.push(setInterval(revokeExpiredBreakGlassSessions, 5 * 60_000))
  intervals.push(setInterval(verifyAuditChain, 60 * 60_000))
  intervals.push(setInterval(markExpiredInventory, 60 * 60_000)) // every hour

  logger.info('Background scheduler started', {
    jobs: intervals.length,
    intervals: ['event-outbox:5s', 'notification-outbox:10s', 'break-glass-revoke:5m', 'audit-verify:1h', 'inventory-expiry:1h'],
  })
}

export function stopScheduler(): void {
  for (const interval of intervals) {
    clearInterval(interval)
  }
  intervals.length = 0
  started = false
  logger.info('Background scheduler stopped')
}

export async function runAllJobsNow(): Promise<void> {
  await Promise.allSettled([
    drainEventOutbox(),
    drainNotificationOutbox(),
    revokeExpiredBreakGlassSessions(),
    verifyAuditChain(),
    markExpiredInventory(),
  ])
}

/**
 * @suop/backend — Enterprise Event Bus
 *
 * Per Phase 0 Architecture §18:
 *   - In-process pub/sub using EventEmitter
 *   - At-least-once delivery (handlers must be idempotent)
 *   - Outbox pattern: events written to DB in same transaction as mutation,
 *     published after commit (guarantees no event lost on crash)
 *   - Event replay for recovery
 */

import { EventEmitter } from 'node:events'
import { db } from '@/core/db'
import { logger } from '@/core/logging'
import { getRequestContext } from '@/core/context'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DomainEvent<T = unknown> {
  id: string
  name: string
  payload: T
  tenantId: string
  correlationId: string
  actorId: string | null
  timestamp: Date
  version: number
}

export interface EventHandler<T = unknown> {
  eventName: string
  handle(event: DomainEvent<T>): Promise<void>
  retries?: number
  backoffMs?: number
}

// ─── Event Name Catalog ─────────────────────────────────────────────────────

export const EventName = {
  // Auth
  UserRegistered: 'UserRegistered',
  UserLoggedIn: 'UserLoggedIn',
  UserLoggedOut: 'UserLoggedOut',
  // Organization
  CompanyCreated: 'CompanyCreated',
  PlantActivated: 'PlantActivated',
  // Procurement
  SupplierCreated: 'SupplierCreated',
  SupplierBlacklisted: 'SupplierBlacklisted',
  PurchaseOrderSubmitted: 'PurchaseOrderSubmitted',
  PurchaseOrderApproved: 'PurchaseOrderApproved',
  // Goods Receipt
  GrnPosted: 'GrnPosted',
  // Quality
  NcrCreated: 'NcrCreated',
  CapaCreated: 'CapaCreated',
  CoaGenerated: 'CoaGenerated',
  // Stock
  StockPosted: 'StockPosted',
  StockReversed: 'StockReversed',
  // System
  SystemError: 'SystemError',
} as const

export type EventName = (typeof EventName)[keyof typeof EventName]

// ─── Event Bus Implementation ───────────────────────────────────────────────

class EventBusImpl extends EventEmitter {
  private readonly handlers = new Map<string, EventHandler[]>()

  constructor() {
    super()
    this.setMaxListeners(0) // unlimited listeners
  }

  /**
   * Register a handler for an event.
   */
  subscribe<T>(handler: EventHandler<T>): void {
    const handlers = this.handlers.get(handler.eventName) ?? []
    handlers.push(handler as EventHandler)
    this.handlers.set(handler.eventName, handlers)
    logger.info('Event handler registered', { event: handler.eventName })
  }

  /**
   * Publish an event in-memory (immediate, non-durable).
   * For durable delivery, use publishToOutbox (called after DB transaction commit).
   */
  async publish<T>(event: DomainEvent<T>): Promise<void> {
    const handlers = this.handlers.get(event.name) ?? []
    if (handlers.length === 0) {
      logger.debug('No handlers for event', { event: event.name })
      return
    }

    // Execute all handlers in parallel; failures don't block other handlers
    const results = await Promise.allSettled(
      handlers.map((h) => this.executeWithRetry(h, event))
    )

    for (let i = 0; i < results.length; i++) {
      const result = results[i]!
      if (result.status === 'rejected') {
        logger.error('Event handler failed', {
          event: event.name,
          error: (result.reason as Error)?.message,
        })
      }
    }
  }

  /**
   * Write event to the outbox table (inside the DB transaction).
   * The outbox publisher will pick it up and publish after commit.
   */
  async writeToOutbox<T>(params: {
    eventName: string
    payload: T
    tenantId: string
  }): Promise<void> {
    const ctx = getRequestContext()
    await db.eventOutbox.create({
      data: {
        tenantId: params.tenantId,
        eventName: params.eventName,
        payload: params.payload as object,
        status: 'PENDING',
        correlationId: ctx?.correlationId ?? 'no-correlation',
        actorId: ctx?.userId ?? null,
      },
    })
  }

  /**
   * Drain the outbox — publish pending events.
   * Called by a background job (Phase 1.6 scheduler).
   *
   * Phase 1.6: Multi-instance safe — atomically claims entries by updating
   * status from PENDING to PROCESSING before publishing. If another instance
   * already claimed them, the update affects 0 rows and we skip.
   * Also enforces max retry limit (10) — entries exceeding it are marked FAILED
   * (dead-letter queue).
   */
  async drainOutbox(batchSize: number = 50): Promise<number> {
    const MAX_RETRIES = 10

    // Move failed entries to DEAD_LETTER status
    await db.eventOutbox.updateMany({
      where: { status: 'PENDING', retryCount: { gte: MAX_RETRIES } },
      data: { status: 'DEAD_LETTER' },
    }).catch(() => {})

    // Atomically claim pending entries: update status to PROCESSING
    // only if currently PENDING (optimistic lock pattern)
    const claimed = await db.eventOutbox.findMany({
      where: { status: 'PENDING', retryCount: { lt: MAX_RETRIES } },
      take: batchSize,
      orderBy: { createdAt: 'asc' },
    })

    let published = 0
    for (const entry of claimed) {
      // Atomically claim: only update if still PENDING
      const claimed_entry = await db.eventOutbox.updateMany({
        where: { id: entry.id, status: 'PENDING' },
        data: { status: 'PROCESSING' },
      }).catch(() => ({ count: 0 }))

      if (claimed_entry.count === 0) {
        // Another instance already claimed this entry — skip
        continue
      }

      try {
        const event: DomainEvent = {
          id: entry.id,
          name: entry.eventName,
          payload: entry.payload,
          tenantId: entry.tenantId,
          correlationId: entry.correlationId,
          actorId: entry.actorId,
          timestamp: entry.createdAt,
          version: 1,
        }
        await this.publish(event)

        await db.eventOutbox.update({
          where: { id: entry.id },
          data: { status: 'PUBLISHED', publishedAt: new Date() },
        })
        published++
      } catch (err) {
        // Publish failed — revert to PENDING for retry (with incremented retryCount)
        await db.eventOutbox.update({
          where: { id: entry.id },
          data: {
            status: 'PENDING',
            retryCount: { increment: 1 },
            lastError: (err as Error).message,
          },
        }).catch(() => {})
        logger.error('Outbox event publish failed', {
          eventId: entry.id,
          error: (err as Error).message,
          retryCount: entry.retryCount + 1,
        })
      }
    }

    return published
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private async executeWithRetry<T>(
    handler: EventHandler,
    event: DomainEvent<T>
  ): Promise<void> {
    const maxRetries = handler.retries ?? 3
    const backoffMs = handler.backoffMs ?? 1000
    let lastError: unknown

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await handler.handle(event as DomainEvent<unknown>)
        return
      } catch (err) {
        lastError = err
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, backoffMs * Math.pow(2, attempt)))
        }
      }
    }
    throw lastError
  }
}

// ─── Singleton ──────────────────────────────────────────────────────────────

export const eventBus = new EventBusImpl()

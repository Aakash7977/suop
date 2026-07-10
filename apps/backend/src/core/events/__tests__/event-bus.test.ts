import { describe, it, expect, beforeEach } from 'vitest'
import { eventBus, EventName, type DomainEvent, type EventHandler } from '../event-bus'

describe('Event Bus', () => {
  describe('publish / subscribe', () => {
    it('delivers events to subscribed handlers', async () => {
      let received: DomainEvent | null = null

      const handler: EventHandler = {
        eventName: EventName.UserLoggedIn,
        async handle(event) {
          received = event
        },
      }

      eventBus.subscribe(handler)

      const event: DomainEvent = {
        id: 'evt-001',
        name: EventName.UserLoggedIn,
        payload: { userId: 'user-1' },
        tenantId: 'tenant-1',
        correlationId: 'corr-1',
        actorId: 'user-1',
        timestamp: new Date(),
        version: 1,
      }

      await eventBus.publish(event)

      expect(received).not.toBeNull()
      expect(received!.name).toBe(EventName.UserLoggedIn)
      expect(received!.payload).toEqual({ userId: 'user-1' })
    })

    it('handles multiple handlers for same event', async () => {
      let handler1Called = false
      let handler2Called = false

      eventBus.subscribe({
        eventName: EventName.UserLoggedOut,
        async handle() { handler1Called = true },
      })
      eventBus.subscribe({
        eventName: EventName.UserLoggedOut,
        async handle() { handler2Called = true },
      })

      await eventBus.publish({
        id: 'evt-002',
        name: EventName.UserLoggedOut,
        payload: {},
        tenantId: 'tenant-1',
        correlationId: 'corr-2',
        actorId: null,
        timestamp: new Date(),
        version: 1,
      })

      expect(handler1Called).toBe(true)
      expect(handler2Called).toBe(true)
    })

    it('does not fail when no handlers registered', async () => {
      await eventBus.publish({
        id: 'evt-003',
        name: 'UnknownEvent',
        payload: {},
        tenantId: 'tenant-1',
        correlationId: 'corr-3',
        actorId: null,
        timestamp: new Date(),
        version: 1,
      })
      // Should not throw
    })

    it('retries failed handlers', async () => {
      let attempts = 0
      let succeeded = false

      eventBus.subscribe({
        eventName: EventName.SystemError,
        retries: 2,
        backoffMs: 10,
        async handle() {
          attempts++
          if (attempts < 2) throw new Error('fail')
          succeeded = true
        },
      })

      await eventBus.publish({
        id: 'evt-004',
        name: EventName.SystemError,
        payload: {},
        tenantId: 'tenant-1',
        correlationId: 'corr-4',
        actorId: null,
        timestamp: new Date(),
        version: 1,
      })

      expect(attempts).toBe(2)
      expect(succeeded).toBe(true)
    })
  })

  describe('EventName catalog', () => {
    it('defines all expected events', () => {
      expect(EventName.UserRegistered).toBe('UserRegistered')
      expect(EventName.UserLoggedIn).toBe('UserLoggedIn')
      expect(EventName.PurchaseOrderSubmitted).toBe('PurchaseOrderSubmitted')
      expect(EventName.GrnPosted).toBe('GrnPosted')
      expect(EventName.NcrCreated).toBe('NcrCreated')
      expect(EventName.SystemError).toBe('SystemError')
    })
  })
})

/**
 * @suop/backend — Notification Engine
 *
 * Per Phase 0 Architecture §10:
 *   - Event-driven (subscribes to domain events)
 *   - Rule-based routing (who gets notified, via which channel)
 *   - Durable delivery (outbox pattern)
 *   - Channels: in-app, email, SMS, WhatsApp
 */

import { db } from '@/core/db'
import { logger } from '@/core/logging'
import { type DomainEvent } from '@/core/events'

// ─── Types ──────────────────────────────────────────────────────────────────

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP'

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'

export interface NotificationRule {
  id: string
  eventName: string
  recipientResolver: 'USER' | 'ROLE' | 'CUSTOM'
  recipientConfig: Record<string, unknown>
  channels: NotificationChannel[]
  templateId: string
  priority: NotificationPriority
  enabled: boolean
}

export interface NotificationTemplate {
  id: string
  subject: string
  body: string
  channel: NotificationChannel
}

// ─── Template Engine ────────────────────────────────────────────────────────

class TemplateEngine {
  private readonly templates = new Map<string, NotificationTemplate>()

  register(template: NotificationTemplate): void {
    this.templates.set(template.id, template)
  }

  get(templateId: string): NotificationTemplate {
    const t = this.templates.get(templateId)
    if (!t) throw new Error(`Notification template '${templateId}' not found`)
    return t
  }

  render(templateId: string, data: Record<string, unknown>): { subject: string; body: string; channel: NotificationChannel } {
    const template = this.get(templateId)
    return {
      subject: this.interpolate(template.subject, data),
      body: this.interpolate(template.body, data),
      channel: template.channel,
    }
  }

  private interpolate(text: string, data: Record<string, unknown>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const value = data[key]
      return value !== undefined ? String(value) : `{{${key}}}`
    })
  }
}

export const templateEngine = new TemplateEngine()

// ─── Notification Engine ────────────────────────────────────────────────────

class NotificationEngine {
  private readonly rules = new Map<string, NotificationRule[]>()

  registerRule(rule: NotificationRule): void {
    const rules = this.rules.get(rule.eventName) ?? []
    rules.push(rule)
    this.rules.set(rule.eventName, rules)
    logger.info('Notification rule registered', {
      event: rule.eventName,
      channels: rule.channels,
    })
  }

  /**
   * Process an incoming domain event — determine who to notify and queue notifications.
   */
  async processEvent(event: DomainEvent): Promise<void> {
    const rules = this.rules.get(event.name) ?? []
    for (const rule of rules) {
      if (!rule.enabled) continue

      const recipients = await this.resolveRecipients(rule, event)
      for (const recipient of recipients) {
        await this.queueNotification({
          tenantId: event.tenantId,
          userId: recipient.userId,
          recipientEmail: recipient.email,
          recipientPhone: recipient.phone,
          channel: rule.channels[0]!, // Phase 0: one channel per rule
          templateId: rule.templateId,
          templateData: event.payload as Record<string, unknown>,
          priority: rule.priority,
          correlationId: event.correlationId,
        })
      }
    }
  }

  /**
   * Queue a notification for delivery (writes to outbox table).
   */
  async queueNotification(params: {
    tenantId: string
    userId?: string | null
    recipientEmail?: string | null
    recipientPhone?: string | null
    channel: NotificationChannel
    templateId: string
    templateData: Record<string, unknown>
    priority: NotificationPriority
    correlationId: string
  }): Promise<void> {
    const rendered = templateEngine.render(params.templateId, params.templateData)

    await db.notificationOutbox.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId ?? null,
        recipientEmail: params.recipientEmail ?? null,
        recipientPhone: params.recipientPhone ?? null,
        channel: params.channel,
        subject: rendered.subject,
        body: rendered.body,
        templateId: params.templateId,
        templateData: params.templateData as object,
        status: 'PENDING',
        correlationId: params.correlationId,
      },
    })
  }

  /**
   * Drain the notification outbox — send pending notifications.
   */
  async drainOutbox(batchSize: number = 50): Promise<number> {
    const pending = await db.notificationOutbox.findMany({
      where: { status: 'PENDING' },
      take: batchSize,
      orderBy: { createdAt: 'asc' },
    })

    let sent = 0
    for (const notif of pending) {
      try {
        await this.deliver(notif)
        await db.notificationOutbox.update({
          where: { id: notif.id },
          data: { status: 'SENT', sentAt: new Date() },
        })
        sent++
      } catch (err) {
        await db.notificationOutbox.update({
          where: { id: notif.id },
          data: {
            retryCount: { increment: 1 },
            lastError: (err as Error).message,
          },
        })
      }
    }
    return sent
  }

  // ─── Delivery Channels ────────────────────────────────────────────────────

  private async deliver(notif: {
    id: string
    channel: string
    subject: string | null
    body: string
    recipientEmail: string | null
    recipientPhone: string | null
    userId: string | null
    tenantId: string
  }): Promise<void> {
    switch (notif.channel) {
      case 'IN_APP':
        // In-app notifications are just stored — frontend polls
        logger.info('In-app notification delivered', { notifId: notif.id, userId: notif.userId })
        break
      case 'EMAIL':
        logger.info('Email notification sent (stub — SMTP integration in Phase 1)', {
          notifId: notif.id,
          to: notif.recipientEmail,
          subject: notif.subject,
        })
        break
      case 'SMS':
        logger.info('SMS notification sent (stub — Twilio integration future)', {
          notifId: notif.id,
          to: notif.recipientPhone,
        })
        break
      case 'WHATSAPP':
        logger.info('WhatsApp notification sent (stub — WhatsApp Business API future)', {
          notifId: notif.id,
          to: notif.recipientPhone,
        })
        break
      default:
        throw new Error(`Unknown notification channel: ${notif.channel}`)
    }
  }

  // ─── Recipient Resolution ─────────────────────────────────────────────────

  private async resolveRecipients(
    rule: NotificationRule,
    event: DomainEvent
  ): Promise<Array<{ userId?: string; email?: string; phone?: string }>> {
    // Phase 0: simplified — returns empty list (real resolution in Phase 1 with user DB)
    // When business modules exist, this will query the user/role service
    const payload = event.payload as Record<string, unknown>

    if (rule.recipientResolver === 'USER' && payload.userId) {
      return [{ userId: payload.userId as string }]
    }

    // For ROLE-based resolution, we'd query the DB for users with that role
    // For now, return empty (no users in DB yet)
    return []
  }
}

export const notificationEngine = new NotificationEngine()

// Note: In a real implementation, we'd use a wildcard listener.
// For Phase 0, notification rules are registered per event name.
// The notification engine processes events when they are explicitly routed
// via notificationEngine.processEvent(event).

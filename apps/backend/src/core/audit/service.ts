/**
 * @suop/backend — Audit Service
 *
 * Per Phase 0 Architecture §11:
 *   - Immutable, append-only audit log
 *   - Auto + manual logging
 *   - Query API for entity history, actor history, timeline
 */

import { db, Prisma } from '@/core/db'
import { getRequestContext } from '@/core/context'
import { logger } from '@/core/logging'

// ─── Types ──────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT'
  | 'TRANSITION' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'PRINT'
  | 'PERMISSION_DENIED' | 'BLACKLIST' | 'RECALL'

export type AuditSeverity = 'INFO' | 'WARN' | 'CRITICAL'

export interface AuditLogEntry {
  id?: string
  tenantId: string
  actorType: 'USER' | 'SYSTEM' | 'API_KEY' | 'JOB'
  actorId?: string | null
  actorName?: string | null
  actorRole?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  correlationId: string
  action: AuditAction | string
  severity?: AuditSeverity
  entityType: string
  entityId?: string | null
  entityCode?: string | null
  before?: unknown
  after?: unknown
  diff?: unknown
  reason?: string | null
  metadata?: Record<string, unknown>
}

// ─── Audit Service ──────────────────────────────────────────────────────────

export class AuditService {
  /**
   * Write an audit log entry. Fire-and-forget — failure does not break business ops.
   */
  async log(entry: AuditLogEntry): Promise<void> {
    const ctx = getRequestContext()

    try {
      await db.auditLog.create({
        data: {
          tenantId: entry.tenantId,
          timestamp: new Date(),
          actorType: entry.actorType,
          actorId: entry.actorId ?? ctx?.userId ?? null,
          actorName: entry.actorName ?? ctx?.userEmail ?? null,
          actorRole: entry.actorRole ?? (ctx?.roles.join(',') || null),
          ipAddress: entry.ipAddress ?? ctx?.ip ?? null,
          userAgent: entry.userAgent ?? ctx?.userAgent ?? null,
          correlationId: entry.correlationId ?? ctx?.correlationId ?? 'no-correlation',
          action: entry.action,
          severity: entry.severity ?? 'INFO',
          entityType: entry.entityType,
          entityId: entry.entityId ?? null,
          entityCode: entry.entityCode ?? null,
          before: entry.before ? (entry.before as object) : Prisma.JsonNull,
          after: entry.after ? (entry.after as object) : Prisma.JsonNull,
          diff: entry.diff ? (entry.diff as object) : Prisma.JsonNull,
          reason: entry.reason ?? null,
          metadata: entry.metadata ? (entry.metadata as object) : Prisma.JsonNull,
          createdBy: ctx?.userId ?? null,
        },
      })
    } catch (err) {
      logger.error('Audit log write failed', {
        action: entry.action,
        entityType: entry.entityType,
        error: (err as Error).message,
      })
    }
  }

  /**
   * Query audit log for a specific entity.
   */
  async getEntityHistory(
    tenantId: string,
    entityType: string,
    entityId: string,
    options?: { limit?: number }
  ): Promise<AuditLogEntry[]> {
    const records = await db.auditLog.findMany({
      where: { tenantId, entityType, entityId },
      orderBy: { timestamp: 'desc' },
      take: options?.limit ?? 50,
    })
    return records as unknown as AuditLogEntry[]
  }

  /**
   * Query audit log for a specific actor (user).
   */
  async getActorHistory(
    tenantId: string,
    actorId: string,
    options?: { limit?: number }
  ): Promise<AuditLogEntry[]> {
    const records = await db.auditLog.findMany({
      where: { tenantId, actorId },
      orderBy: { timestamp: 'desc' },
      take: options?.limit ?? 50,
    })
    return records as unknown as AuditLogEntry[]
  }

  /**
   * Query audit log by time range + filters.
   */
  async query(
    tenantId: string,
    filters: {
      action?: string
      severity?: AuditSeverity
      entityType?: string
      from?: Date
      to?: Date
      limit?: number
    }
  ): Promise<AuditLogEntry[]> {
    const records = await db.auditLog.findMany({
      where: {
        tenantId,
        ...(filters.action ? { action: filters.action } : {}),
        ...(filters.severity ? { severity: filters.severity } : {}),
        ...(filters.entityType ? { entityType: filters.entityType } : {}),
        ...(filters.from || filters.to
          ? { timestamp: { gte: filters.from, lte: filters.to } }
          : {}),
      },
      orderBy: { timestamp: 'desc' },
      take: filters.limit ?? 100,
    })
    return records as unknown as AuditLogEntry[]
  }
}

// ─── Singleton ──────────────────────────────────────────────────────────────

export const auditService = new AuditService()

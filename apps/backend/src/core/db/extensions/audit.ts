/**
 * @suop/backend — Audit Log Extension
 *
 * Automatically records CREATE/UPDATE/DELETE operations on audited models.
 * Uses fire-and-forget pattern — audit failure does not break business operations.
 */

import { Prisma } from '@prisma/client'
import { getRequestContext } from '@/core/context'
import { logger } from '@/core/logging'

const AUDITED_MODELS = new Set<string>([
  // Business models will be added here in Phase 1+
])

 
type AnyArgs = any

async function writeAuditEntry(params: {
   
  prisma: any
  model: string
  operation: string
  entityId?: string
  before?: unknown
  after?: unknown
}): Promise<void> {
  const ctx = getRequestContext()
  if (!ctx) return

  try {
    await params.prisma.auditLog.create({
      data: {
        tenantId: ctx.tenantId ?? '00000000-0000-0000-0000-000000000000',
        actorType: ctx.userId ? 'USER' : 'SYSTEM',
        actorId: ctx.userId,
        actorName: ctx.userEmail,
        actorRole: ctx.roles.join(',') || null,
        ipAddress: ctx.ip,
        userAgent: ctx.userAgent,
        correlationId: ctx.correlationId,
        action: params.operation.toUpperCase(),
        severity: 'INFO',
        entityType: params.model,
        entityId: params.entityId,
        before: params.before as object | undefined,
        after: params.after as object | undefined,
      },
    })
  } catch (err) {
    logger.error('Failed to write audit log', {
      model: params.model,
      operation: params.operation,
      error: (err as Error).message,
    })
  }
}

export const auditExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      $allModels: {
        async create({ model, args, query }: { model?: string; args: AnyArgs; query: (a: AnyArgs) => Promise<unknown> }) {
          const result = await query(args)
          if (model && AUDITED_MODELS.has(model)) {
             
            const r = result as any
            await writeAuditEntry({
              prisma: client,
              model,
              operation: 'CREATE',
              entityId: r?.id,
              after: result,
            })
          }
          return result
        },
        async update({ model, args, query }: { model?: string; args: AnyArgs; query: (a: AnyArgs) => Promise<unknown> }) {
          let before: unknown = undefined
          if (model && AUDITED_MODELS.has(model)) {
            try {
               
              before = await (client as any)[model]?.findUnique({ where: args.where })
            } catch { /* ignore */ }
          }
          const result = await query(args)
          if (model && AUDITED_MODELS.has(model)) {
             
            const r = result as any
            await writeAuditEntry({
              prisma: client,
              model,
              operation: 'UPDATE',
              entityId: r?.id,
              before,
              after: result,
            })
          }
          return result
        },
        async delete({ model, args, query }: { model?: string; args: AnyArgs; query: (a: AnyArgs) => Promise<unknown> }) {
          let before: unknown = undefined
          if (model && AUDITED_MODELS.has(model)) {
            try {
               
              before = await (client as any)[model]?.findUnique({ where: args.where })
            } catch { /* ignore */ }
          }
          const result = await query(args)
          if (model && AUDITED_MODELS.has(model)) {
            await writeAuditEntry({
              prisma: client,
              model,
              operation: 'DELETE',
              entityId: args.where?.id,
              before,
            })
          }
          return result
        },
      },
    },
  })
})

/**
 * @suop/backend — Tenant Scope Extension
 *
 * Automatically injects tenantId from request context into all queries
 * on tenant-scoped models.
 */

import { Prisma } from '@prisma/client'
import { getRequestContext } from '@/core/context'
import { logger } from '@/core/logging'

function getCurrentTenantId(): string | null {
  return getRequestContext()?.tenantId ?? null
}

const TENANT_SCOPED_MODELS = new Set([
  'AuditLog', 'EventOutbox', 'NotificationOutbox', 'RefreshToken',
  'IdempotencyKey', 'FeatureFlag', 'BackgroundJob', 'FileUpload',
])

 
type AnyArgs = any

export const tenantExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: {
          model?: string
          operation: string
          args: AnyArgs
          query: (args: AnyArgs) => Promise<unknown>
        }) {
          if (!model || !TENANT_SCOPED_MODELS.has(model)) {
            return query(args)
          }

          const tenantId = getCurrentTenantId()
          if (!tenantId) {
            if (operation !== 'count' && operation !== 'aggregate') {
              logger.warn('DB operation without tenant context', { model, operation })
            }
            return query(args)
          }

          const READ_OPS = new Set(['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'])
          const WRITE_OPS = new Set(['update', 'updateMany', 'delete', 'deleteMany'])

          if (READ_OPS.has(operation) || WRITE_OPS.has(operation)) {
            args.where = args.where ?? {}
            if (!args.where.tenantId) {
              args.where = { ...args.where, tenantId }
            }
          }

          if (operation === 'create') {
            args.data = { ...args.data, tenantId }
          }
          if (operation === 'createMany' && Array.isArray(args.data)) {
            args.data = args.data.map((item: Record<string, unknown>) => ({ ...item, tenantId }))
          }
          if (operation === 'upsert') {
            args.where = { ...args.where, tenantId }
            args.create = { ...args.create, tenantId }
          }

          return query(args)
        },
      },
    },
  })
})

export async function withTenant<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
  logger.warn('Cross-tenant DB operation', { tenantId })
  return fn()
}

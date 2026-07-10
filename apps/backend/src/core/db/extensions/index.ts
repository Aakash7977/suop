/**
 * @suop/backend — Prisma Extensions Aggregator
 *
 * Applies all extensions in the correct order:
 *   1. Soft Delete (filters before tenant scoping)
 *   2. Tenant Scope (adds tenantId to all queries)
 *   3. Audit Log (records mutations)
 */

import type { PrismaClient } from '@prisma/client'
import { softDeleteExtension } from './soft-delete'
import { tenantExtension } from './tenant'
import { auditExtension } from './audit'

export function applyExtensions(client: PrismaClient): PrismaClient {
  return client
    .$extends(softDeleteExtension)
    .$extends(tenantExtension)
    .$extends(auditExtension) as PrismaClient
}

export { softDeleteExtension } from './soft-delete'
export { tenantExtension } from './tenant'
export { auditExtension } from './audit'
export { withTenant } from './tenant'

/**
 * accounts-payable Repository — Prisma-backed
 *
 * RC1 Fix Pack 1: Refactored from raw SQL (genRepo factory) to Prisma client.
 *
 * The service layer (../service/index.ts) already uses the Prisma client
 * directly. This repository file is retained as a thin compatibility layer
 * for any external consumer that imports repository functions.
 *
 * Per RC1 Fix Pack 1 §3: "Repositories must use Prisma. Only performance-
 * critical SQL may remain." No raw SQL remains in this module.
 */

import { db, transaction, type TransactionClient } from '@/core/db'
import { getRequestContext } from '@/core/context'
import { NotFoundError, AuthorizationError } from '@/core/errors'

function getContext() {
  const ctx = getRequestContext()
  if (!ctx?.tenantId) throw new AuthorizationError('Authentication required')
  return { tenantId: ctx.tenantId, userId: ctx.userId }
}

// ─── Prisma-backed CRUD operations on SupplierInvoices ─────────────────────────────

export const repository = {
  /**
   * Find a record by ID, scoped to the current tenant.
   * Soft-deleted records (deleted_at IS NOT NULL) are excluded.
   */
  async findById(id: string) {
    const { tenantId } = getContext()
    return (db as any).SupplierInvoices.findFirst({
      where: { id, tenantId, deletedAt: null },
    })
  },

  /**
   * List records with pagination, status filter, and search.
   * Tenant isolation enforced automatically.
   */
  async list(params: {
    page?: number
    pageSize?: number
    status?: string
    search?: string
  } = {}) {
    const { tenantId } = getContext()
    const page = Math.max(1, params.page ?? 1)
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 25))
    const skip = (page - 1) * pageSize

    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    }
    if (params.status) where.status = params.status

    const [rows, total] = await Promise.all([
      (db as any).SupplierInvoices.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      (db as any).SupplierInvoices.count({ where }),
    ])

    return { rows, total, page, pageSize }
  },

  /**
   * Create a new record. Tenant ID, version, and audit fields are populated
   * automatically. The caller is responsible for higher-level business rules,
   * audit logging, and event publishing (typically done in the service layer).
   */
  async create(data: Record<string, unknown>) {
    const { tenantId, userId } = getContext()
    return (db as any).SupplierInvoices.create({
      data: {
        ...data,
        tenantId,
        version: 0,
        createdBy: userId,
        updatedBy: userId,
      },
    })
  },

  /**
   * Update an existing record by ID. Optimistic concurrency is enforced
   * via the version field — the caller must pass the expected version.
   */
  async update(id: string, data: Record<string, unknown>, expectedVersion?: number) {
    const { tenantId, userId } = getContext()

    if (expectedVersion !== undefined) {
      const existing = await (db as any).SupplierInvoices.findFirst({
        where: { id, tenantId, deletedAt: null },
        select: { version: true },
      })
      if (!existing) throw new NotFoundError('SupplierInvoices', id)
      if (existing.version !== expectedVersion) {
        throw new Error(
          `Concurrency conflict on SupplierInvoices '${id}': expected version ${expectedVersion}, actual ${existing.version}`
        )
      }
    }

    return (db as any).SupplierInvoices.update({
      where: { id },
      data: {
        ...data,
        version: { increment: 1 },
        updatedBy: userId,
      },
    })
  },

  /**
   * Soft-delete a record by setting deleted_at and deleted_by.
   * The row remains in the database for audit trail purposes.
   */
  async softDelete(id: string) {
    const { userId } = getContext()
    return (db as any).SupplierInvoices.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
        version: { increment: 1 },
      },
    })
  },

  /**
   * Count records matching the optional status filter.
   */
  async count(status?: string) {
    const { tenantId } = getContext()
    const where: Record<string, unknown> = {
      tenantId,
      deletedAt: null,
    }
    if (status) where.status = status
    return (db as any).SupplierInvoices.count({ where })
  },
}

/**
 * Transaction helper — exposes the core transaction primitive so service
 * code can wrap multi-step mutations in a single atomic unit.
 */
export { transaction, type TransactionClient }

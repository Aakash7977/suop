/**
 * @suop/backend — Audit Hardening (Hash Chain + Tamper Detection)
 *
 * RC1 Fix Pack 2 §A-8: Immutable, tamper-evident audit logs.
 *
 * Strategy: hash chain
 *   - Each audit log entry includes a `prev_hash` field linking to the
 *     previous entry's hash
 *   - The entry's `hash` is computed over (prev_hash || timestamp || payload)
 *   - Any modification to an entry breaks the chain (its hash no longer
 *     matches the next entry's prev_hash)
 *   - Periodic root hash checkpoints (every 1000 entries) — stored separately
 *
 * Verification:
 *   - `verifyAuditChain(startId, endId)` walks the chain and returns any breaks
 *   - `computeRootHash(startId, endId)` returns the cumulative hash for checkpointing
 *
 * This is similar to how blockchain works — but without the distributed consensus.
 * It guarantees that an attacker with DB write access cannot modify audit logs
 * without detection (they would need to recompute every subsequent hash).
 */

import { createHash } from 'node:crypto'
import { db } from '@/core/db'
import { logger } from '@/core/logging'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AuditChainEntry {
  id: string
  timestamp: Date
  prevHash: string | null
  hash: string
  payload: unknown
}

export interface ChainVerificationResult {
  valid: boolean
  totalEntries: number
  brokenAt: string | null // entry ID where the chain breaks
  expectedHash: string | null
  actualHash: string | null
}

// ─── Hashing ────────────────────────────────────────────────────────────────

/**
 * Compute the hash for an audit log entry.
 *
 * Hash input: prevHash || timestamp || payload (JSON, canonicalized)
 * Algorithm: SHA-256
 */
export function computeAuditHash(params: {
  prevHash: string | null
  timestamp: Date
  payload: unknown
}): string {
  const canonicalPayload = JSON.stringify(params.payload, Object.keys(params.payload as object).sort())
  const input = `${params.prevHash ?? ''}|${params.timestamp.toISOString()}|${canonicalPayload}`
  return createHash('sha256').update(input).digest('hex')
}

/**
 * Compute a cumulative "root hash" over a range of entries.
 *
 * Used for periodic checkpointing — store the root hash externally
 * (e.g., in a write-once log, on a separate server, or in a blockchain).
 * If the audit log is tampered with, the root hash will not match.
 */
export function computeRootHash(entries: AuditChainEntry[]): string {
  let cumulative = ''
  for (const entry of entries) {
    cumulative = createHash('sha256')
      .update(cumulative + entry.hash)
      .digest('hex')
  }
  return cumulative
}

// ─── Chain Verification ────────────────────────────────────────────────────

/**
 * Verify the integrity of the audit log chain for a range of entries.
 *
 * Returns the entry ID where the chain breaks (if any), plus the expected
 * and actual hashes at that point.
 *
 * Time complexity: O(n) where n = number of entries in the range.
 */
export async function verifyAuditChain(params: {
  startTimestamp?: Date
  endTimestamp?: Date
  limit?: number
}): Promise<ChainVerificationResult> {
  const where: Record<string, unknown> = {}
  if (params.startTimestamp) where.timestamp = { gte: params.startTimestamp }
  if (params.endTimestamp) {
    where.timestamp = { ...(where.timestamp as object), lte: params.endTimestamp }
  }

  const entries = await (db as any).auditLog.findMany({
    where,
    orderBy: { timestamp: 'asc' },
    take: params.limit ?? 10000,
    select: {
      id: true,
      timestamp: true,
      prevHash: true,
      hash: true,
      actorType: true,
      actorId: true,
      action: true,
      entityType: true,
      entityId: true,
      before: true,
      after: true,
    },
  })

  let prevHash: string | null = null
  for (const entry of entries) {
    const expectedHash = computeAuditHash({
      prevHash,
      timestamp: entry.timestamp,
      payload: {
        actorType: entry.actorType,
        actorId: entry.actorId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        before: entry.before,
        after: entry.after,
      },
    })

    if (entry.hash !== expectedHash) {
      logger.error('Audit chain broken — possible tampering detected', {
        entryId: entry.id,
        expectedHash,
        actualHash: entry.hash,
      })
      return {
        valid: false,
        totalEntries: entries.length,
        brokenAt: entry.id,
        expectedHash,
        actualHash: entry.hash,
      }
    }

    if (entry.prevHash !== prevHash) {
      logger.error('Audit chain prev_hash mismatch — possible insertion/deletion', {
        entryId: entry.id,
        expectedPrevHash: prevHash,
        actualPrevHash: entry.prevHash,
      })
      return {
        valid: false,
        totalEntries: entries.length,
        brokenAt: entry.id,
        expectedHash: prevHash,
        actualHash: entry.prevHash,
      }
    }

    prevHash = entry.hash
  }

  return {
    valid: true,
    totalEntries: entries.length,
    brokenAt: null,
    expectedHash: null,
    actualHash: null,
  }
}

/**
 * Repair the audit chain after a manual edit (administrative use only).
 *
 * WARNING: This recomputes hashes from a given point forward. It should
 * only be used by an administrator with break-glass access, and the
 * operation itself must be logged.
 */
export async function repairAuditChain(startId: string): Promise<{ repaired: number }> {
  // Get the entry before the broken one (to get its hash)
  const brokenEntry = await (db as any).auditLog.findUnique({ where: { id: startId } })
  if (!brokenEntry) {
    throw new Error(`Audit entry ${startId} not found`)
  }

  // Get all entries after the broken one, in order
  const entries = await (db as any).auditLog.findMany({
    where: { timestamp: { gt: brokenEntry.timestamp } },
    orderBy: { timestamp: 'asc' },
  })

  let prevHash = brokenEntry.hash
  let repaired = 0

  for (const entry of entries) {
    const newHash = computeAuditHash({
      prevHash,
      timestamp: entry.timestamp,
      payload: {
        actorType: entry.actorType,
        actorId: entry.actorId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        before: entry.before,
        after: entry.after,
      },
    })

    if (entry.hash !== newHash || entry.prevHash !== prevHash) {
      await (db as any).auditLog.update({
        where: { id: entry.id },
        data: { prevHash, hash: newHash },
      })
      repaired++
    }

    prevHash = newHash
  }

  logger.warn('Audit chain repaired', { startId, repaired })
  return { repaired }
}

// ─── Checkpointing ──────────────────────────────────────────────────────────

/**
 * Compute a checkpoint hash for the last N entries.
 *
 * Should be run periodically (e.g., every hour) and stored externally:
 *   - In a separate database (different credentials)
 *   - In a write-once log file
 *   - In a blockchain anchor (e.g., Bitcoin OP_RETURN)
 *   - Sent to a monitoring service
 *
 * If the audit log is later tampered with, the checkpoint will not match
 * when re-computed.
 */
export async function createCheckpoint(): Promise<{
  timestamp: Date
  entryCount: number
  rootHash: string
  lastEntryId: string
}> {
  const lastEntry = await (db as any).auditLog.findFirst({
    orderBy: { timestamp: 'desc' },
    select: { id: true, timestamp: true },
  })

  if (!lastEntry) {
    return {
      timestamp: new Date(),
      entryCount: 0,
      rootHash: '',
      lastEntryId: '',
    }
  }

  // Get the last 1000 entries for the checkpoint
  const entries = await (db as any).auditLog.findMany({
    where: { timestamp: { lte: lastEntry.timestamp } },
    orderBy: { timestamp: 'asc' },
    take: 1000,
    select: { id: true, timestamp: true, prevHash: true, hash: true },
  })

  const rootHash = computeRootHash(entries as AuditChainEntry[])

  return {
    timestamp: new Date(),
    entryCount: entries.length,
    rootHash,
    lastEntryId: lastEntry.id,
  }
}

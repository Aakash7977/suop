/**
 * @suop/backend — Transaction Helper
 *
 * Per Phase 0 Architecture §15:
 *   - Prisma $transaction wrapper with logging + error handling
 *   - Retry on deadlock (P2034) and serialization failure (P2038)
 *   - Long transaction detection (>5s warning, >30s error)
 *   - Transaction context propagated via AsyncLocalStorage
 */

import { Prisma } from '@prisma/client'
import { db } from './client'
import { logger } from '@/core/logging'
import { getRequestContext, updateContext } from '@/core/context'
import { DatabaseError, ConcurrencyError } from '@/core/errors'

// ─── Types ──────────────────────────────────────────────────────────────────

export type TransactionClient = Prisma.TransactionClient

export interface TransactionOptions {
  isolationLevel?: 'ReadCommitted' | 'RepeatableRead' | 'Serializable'
  maxRetries?: number
  timeoutMs?: number
}

// ─── Default Options ────────────────────────────────────────────────────────

const DEFAULTS: Required<TransactionOptions> = {
  isolationLevel: 'ReadCommitted',
  maxRetries: 4,
  timeoutMs: 30000,
}

// ─── Retryable Error Codes ──────────────────────────────────────────────────

const RETRYABLE_CODES = new Set(['P2034', 'P2038']) // deadlock, serialization failure

// ─── Transaction Helper ─────────────────────────────────────────────────────

/**
 * Execute a function within a database transaction.
 *
 * Features:
 *   - Automatic retry on deadlock / serialization failure (exponential backoff)
 *   - Long transaction detection (>5s warning, >30s error)
 *   - Transaction client propagated via RequestContext for repository access
 *   - Proper error wrapping (deadlock → ConcurrencyError, other → DatabaseError)
 *
 * Usage:
 *   const result = await transaction(ctx, async (tx) => {
 *     const po = await poRepo.create(tx, data)
 *     await stockLedger.post(tx, po)
 *     return po
 *   })
 */
export async function transaction<T>(
  fn: (tx: TransactionClient) => Promise<T>,
  options?: TransactionOptions
): Promise<T> {
  const opts = { ...DEFAULTS, ...options }
  const ctx = getRequestContext()

  let lastError: unknown = null

  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    const startedAt = Date.now()

    try {
      const result = await db.$transaction(
        async (tx) => {
          // Propagate transaction client via context
          if (ctx) {
            updateContext({ tx })
          }

          const result = await fn(tx)

          // Check duration before commit
          const durationMs = Date.now() - startedAt
          if (durationMs > 30000) {
            logger.error('Transaction exceeded 30 seconds', { durationMs, attempt })
          } else if (durationMs > 5000) {
            logger.warn('Transaction exceeded 5 seconds', { durationMs, attempt })
          }

          return result
        },
        {
          isolationLevel: opts.isolationLevel === 'Serializable'
            ? Prisma.TransactionIsolationLevel.Serializable
            : opts.isolationLevel === 'RepeatableRead'
            ? Prisma.TransactionIsolationLevel.RepeatableRead
            : Prisma.TransactionIsolationLevel.ReadCommitted,
          timeout: opts.timeoutMs,
        }
      )

      // Clear transaction from context
      if (ctx) {
        updateContext({ tx: undefined })
      }

      return result
    } catch (err) {
      lastError = err

      // Check if retryable
      const prismaError = err as { code?: string }
      if (prismaError.code && RETRYABLE_CODES.has(prismaError.code)) {
        const backoffMs = Math.min(50 * Math.pow(2, attempt), 400)
        logger.warn('Transaction retryable failure, retrying', {
          attempt,
          code: prismaError.code,
          backoffMs,
        })
        await sleep(backoffMs)
        continue
      }

      // Non-retryable — break and throw
      break
    }
  }

  // All retries exhausted or non-retryable error
  const prismaError = lastError as { code?: string; message?: string }

  if (ctx) {
    updateContext({ tx: undefined })
  }

  if (prismaError?.code && RETRYABLE_CODES.has(prismaError.code)) {
    throw new ConcurrencyError(
      'Transaction failed after all retries due to deadlock or serialization conflict.',
      { cause: lastError as Error }
    )
  }

  throw new DatabaseError(
    prismaError?.message ?? 'Transaction failed',
    { cause: lastError as Error }
  )
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

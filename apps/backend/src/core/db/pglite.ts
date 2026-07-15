/**
 * PGlite Database Service
 *
 * Provides a PGlite-backed database for development and testing.
 * PGlite IS real PostgreSQL (WASM-compiled from the C source).
 *
 * In production, this is replaced by the Prisma client connecting to
 * a managed PostgreSQL instance (Supabase/RDS).
 *
 * For the acceptance gate, this module provides:
 *   - query(): parameterized SQL queries
 *   - exec(): execute raw SQL
 *   - transaction(): BEGIN/COMMIT/ROLLBACK wrapper for multi-statement atomicity
 *   - close(): graceful shutdown
 */

import { PGlite } from '@electric-sql/pglite'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { logger } from '@/core/logging'

const DB_DIR = join(process.cwd(), 'db')

let instance: PGlite | null = null

export async function getPglite(): Promise<PGlite> {
  if (instance) {
    return instance
  }

  if (!existsSync(DB_DIR)) {
    mkdirSync(DB_DIR, { recursive: true })
  }

  instance = new PGlite({ dataDir: DB_DIR })
  await instance.waitReady

  logger.info('PGlite database initialized', { dataDir: DB_DIR })
  return instance
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number }> {
  const db = await getPglite()
  const result = await db.query(sql, params as (string | number | boolean | null)[] | undefined)
  return {
    rows: result.rows as T[],
    rowCount: result.affectedRows ?? result.rows.length,
  }
}

export async function exec(sql: string): Promise<void> {
  const db = await getPglite()
  await db.exec(sql)
}

/**
 * Execute a function within a database transaction.
 * Uses BEGIN / COMMIT / ROLLBACK on the PGlite instance.
 *
 * If the function throws, ROLLBACK is issued and the error is re-thrown.
 * If the function succeeds, COMMIT is issued.
 *
 * Usage:
 *   const result = await pgliteTransaction(async (txQuery) => {
 *     const inv = await txQuery('UPDATE inventory SET ... RETURNING *', [...])
 *     await txQuery('INSERT INTO inventory_transactions ...', [...])
 *     return inv
 *   })
 *
 * Note: PGlite is single-connection, so transactions are automatically serialized.
 * This is acceptable for development/testing. In production (managed Postgres),
 * the Prisma transaction() helper should be used instead.
 */
export async function pgliteTransaction<T>(
  fn: (txQuery: typeof query) => Promise<T>
): Promise<T> {
  const db = await getPglite()
  await db.query('BEGIN')
  try {
    const result = await fn(query)
    await db.query('COMMIT')
    return result
  } catch (err) {
    try {
      await db.query('ROLLBACK')
    } catch {
      // ROLLBACK failure is best-effort — the original error is more important
    }
    throw err
  }
}

export async function closePglite(): Promise<void> {
  if (instance) {
    await instance.close()
    instance = null
    logger.info('PGlite database closed')
  }
}

// ─── Health Check ───────────────────────────────────────────────────────────

export async function isDatabaseHealthy(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as ok')
    return result.rows.length > 0
  } catch {
    return false
  }
}

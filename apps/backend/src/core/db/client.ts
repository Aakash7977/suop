/**
 * @suop/backend — Prisma Client Singleton
 *
 * Per Phase 0 Architecture §6.3:
 *   - Singleton PrismaClient with extensions registered
 *   - Connection pool managed by Prisma
 *   - Extensions: soft delete, tenant scope, audit log
 */

import { PrismaClient } from '@prisma/client'
import { env } from '@/config/env'
import { logger } from '@/core/logging'

// ─── Client Factory ─────────────────────────────────────────────────────────

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: env.DATABASE_LOG_QUERIES
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
  })

  // Register extensions (added in Phase 0.3 — these are the actual implementations)
  // Extensions are applied via client.$extends() — see extensions/index.ts
  return applyExtensions(client)
}

// ─── Extension Application ──────────────────────────────────────────────────

import { applyExtensions } from './extensions'

// ─── Singleton ──────────────────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Singleton Prisma client.
 *
 * In development, the singleton is stored on globalThis to survive
 * Next.js hot-reloads (prevents connection pool exhaustion).
 * In production, a single instance is created per process.
 */
export const db: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient()

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// ─── Connection Lifecycle ───────────────────────────────────────────────────

/**
 * Connect to the database. Called once at application boot.
 * Idempotent — safe to call multiple times.
 */
export async function connectDatabase(): Promise<void> {
  try {
    await db.$connect()
    logger.info('Database connected', { url: maskUrl(env.DATABASE_URL) })
  } catch (err) {
    logger.error('Database connection failed', { error: (err as Error).message })
    throw err
  }
}

/**
 * Disconnect from the database. Called on graceful shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await db.$disconnect()
    logger.info('Database disconnected')
  } catch (err) {
    logger.error('Database disconnect failed', { error: (err as Error).message })
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Mask password in connection string for logging */
function maskUrl(url: string): string {
  return url.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')
}

// ─── Re-exports ─────────────────────────────────────────────────────────────

export { Prisma } from '@prisma/client'
export type { PrismaClient } from '@prisma/client'

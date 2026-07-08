/**
 * @suop/database — Enterprise Database Client
 * Sprint 2: Epic 2
 *
 * Centralized Prisma client with logging, connection management,
 * and enterprise patterns (soft delete, audit columns).
 */

import { PrismaClient } from '../generated/client';

// ─── Prisma Client Singleton ────────────────────────────
let prismaClient: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      log: process.env.DATABASE_LOG_QUERIES === 'true'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // ─── Connection Events ────────────────────────────
    prismaClient.$on('info', (e) => {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        service: 'suop',
        module: 'database',
        message: 'Prisma info',
        metadata: { event: e },
      }));
    });

    prismaClient.$on('warn', (e) => {
      console.warn(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'warn',
        service: 'suop',
        module: 'database',
        message: 'Prisma warning',
        metadata: { event: e },
      }));
    });

    prismaClient.$on('error', (e) => {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        service: 'suop',
        module: 'database',
        message: 'Prisma error',
        error: { message: e.message },
      }));
    });
  }

  return prismaClient;
}

// ─── Export Prisma Types ────────────────────────────────
export { PrismaClient } from '../generated/client';
export type { Company, Branch, User, Role, Permission, RolePermission, UserRole, Session, AuditLog, SystemSetting, FeatureFlag, OrganizationNode } from '../generated/client';

// ─── Database Health Check ──────────────────────────────
export async function checkDatabaseConnection(): Promise<{ status: 'healthy' | 'offline'; latency: number; details?: string }> {
  const start = Date.now();
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      latency: Date.now() - start,
      details: 'Connected to PostgreSQL',
    };
  } catch (error) {
    return {
      status: 'offline',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

// ─── Disconnect ─────────────────────────────────────────
export async function disconnectDatabase(): Promise<void> {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
  }
}

// ─── Default Export ─────────────────────────────────────
export default getPrismaClient;

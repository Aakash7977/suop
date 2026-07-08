/**
 * SUOP Backend — Enterprise Health Check Service
 * Sprint 2: Epic 7 — Health Monitoring (Upgraded)
 *
 * This service now includes:
 * - Real PostgreSQL connection check (via Prisma or raw connection)
 * - Real Redis connection check
 * - Real RabbitMQ connection check
 * - Real MinIO connection check
 * - OpenSearch connection check
 * - Structured JSON logging (per Epic 5)
 * - Standard API responses (per Epic 6)
 * - Configuration from environment (per Epic 1)
 *
 * Endpoints:
 *   GET /api/health          — Overall system health
 *   GET /api/health/detailed — Detailed service status with latency
 *   GET /api/info            — Platform information
 *   GET /api/modules         — All SUOP modules and their status
 */

const PORT = 3030
const VERSION = "2.0.0"

// ─── Types ──────────────────────────────────────────────
interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'offline'
  latency: number
  details?: string
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'offline'
  database: string
  redis: string
  rabbitmq: string
  storage: string
  search: string
  version: string
  timestamp: string
  services: ServiceStatus[]
}

// ─── Structured Logger (Epic 5) ────────────────────────
function log(level: string, message: string, metadata?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'suop-backend',
    module: 'health',
    message,
    ...metadata,
  }
  console.log(JSON.stringify(entry))
}

// ─── Standard API Response (Epic 6) ─────────────────────
function successResponse<T>(data: T, message: string = '') {
  return {
    success: true,
    message,
    data,
    meta: { correlationId: crypto.randomUUID() },
    errors: [],
  }
}

function errorResponse(message: string, code: string = 'INTERNAL_ERROR', errors: Array<{field: string; message: string}> = []) {
  return {
    success: false,
    message,
    data: null,
    meta: { correlationId: crypto.randomUUID() },
    errors: [{ code, field: '', message }],
  }
}

// ─── Health Check Functions ─────────────────────────────

async function checkPostgreSQL(): Promise<ServiceStatus> {
  const start = Date.now()
  const host = process.env.DATABASE_HOST || 'localhost'
  const port = parseInt(process.env.DATABASE_PORT || '5432')

  try {
    // Try to connect to PostgreSQL via TCP
    // In production, this would use Prisma client
    const connected = await checkTcpConnection(host, port, 2000)

    if (connected) {
      return {
        name: 'PostgreSQL',
        status: 'healthy',
        latency: Date.now() - start,
        details: `Connected to ${host}:${port}`,
      }
    } else {
      return {
        name: 'PostgreSQL',
        status: 'offline',
        latency: Date.now() - start,
        details: `Cannot connect to ${host}:${port}`,
      }
    }
  } catch (error) {
    return {
      name: 'PostgreSQL',
      status: 'offline',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Connection failed',
    }
  }
}

async function checkRedis(): Promise<ServiceStatus> {
  const start = Date.now()
  const host = process.env.REDIS_HOST || 'localhost'
  const port = parseInt(process.env.REDIS_PORT || '6379')

  try {
    const connected = await checkTcpConnection(host, port, 2000)

    if (connected) {
      return {
        name: 'Redis',
        status: 'healthy',
        latency: Date.now() - start,
        details: `Connected to ${host}:${port}`,
      }
    } else {
      return {
        name: 'Redis',
        status: 'offline',
        latency: Date.now() - start,
        details: `Cannot connect to ${host}:${port}`,
      }
    }
  } catch (error) {
    return {
      name: 'Redis',
      status: 'offline',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Connection failed',
    }
  }
}

async function checkRabbitMQ(): Promise<ServiceStatus> {
  const start = Date.now()
  const host = process.env.RABBITMQ_HOST || 'localhost'
  const port = parseInt(process.env.RABBITMQ_PORT || '5672')

  try {
    const connected = await checkTcpConnection(host, port, 2000)

    if (connected) {
      return {
        name: 'RabbitMQ',
        status: 'healthy',
        latency: Date.now() - start,
        details: `Connected to ${host}:${port}`,
      }
    } else {
      return {
        name: 'RabbitMQ',
        status: 'offline',
        latency: Date.now() - start,
        details: `Cannot connect to ${host}:${port}`,
      }
    }
  } catch (error) {
    return {
      name: 'RabbitMQ',
      status: 'offline',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Connection failed',
    }
  }
}

async function checkMinIO(): Promise<ServiceStatus> {
  const start = Date.now()
  const host = process.env.MINIO_HOST || 'localhost'
  const port = parseInt(process.env.MINIO_PORT || '9000')

  try {
    const connected = await checkTcpConnection(host, port, 2000)

    if (connected) {
      return {
        name: 'MinIO Storage',
        status: 'healthy',
        latency: Date.now() - start,
        details: `Connected to ${host}:${port}`,
      }
    } else {
      return {
        name: 'MinIO Storage',
        status: 'offline',
        latency: Date.now() - start,
        details: `Cannot connect to ${host}:${port}`,
      }
    }
  } catch (error) {
    return {
      name: 'MinIO Storage',
      status: 'offline',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Connection failed',
    }
  }
}

async function checkOpenSearch(): Promise<ServiceStatus> {
  const start = Date.now()
  const host = process.env.OPENSEARCH_HOST || 'localhost'
  const port = parseInt(process.env.OPENSEARCH_PORT || '9200')

  try {
    const connected = await checkTcpConnection(host, port, 2000)

    if (connected) {
      return {
        name: 'OpenSearch',
        status: 'healthy',
        latency: Date.now() - start,
        details: `Connected to ${host}:${port}`,
      }
    } else {
      return {
        name: 'OpenSearch',
        status: 'offline',
        latency: Date.now() - start,
        details: `Cannot connect to ${host}:${port}`,
      }
    }
  } catch (error) {
    return {
      name: 'OpenSearch',
      status: 'offline',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Connection failed',
    }
  }
}

// ─── TCP Connection Check ───────────────────────────────
async function checkTcpConnection(host: string, port: number, timeoutMs: number = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new BunSocket(host, port, timeoutMs)
    socket.connect().then(resolve).catch(() => resolve(false))
  })
}

// Simple TCP socket wrapper using Bun
class BunSocket {
  constructor(
    private host: string,
    private port: number,
    private timeoutMs: number,
  ) {}

  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const socket = Bun.connect({
          hostname: this.host,
          port: this.port,
          socket: {
            open() {
              resolve(true)
            },
            error() {
              resolve(false)
            },
          },
        })

        // Timeout
        setTimeout(() => {
          try {
            socket.then(s => s.end())
          } catch {}
          resolve(false)
        }, this.timeoutMs)
      } catch {
        resolve(false)
      }
    })
  }
}

// ─── HTTP Server ────────────────────────────────────────

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname

    // CORS headers
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers })
    }

    // ─── Routes ──────────────────────────────────────

    // GET /api/health
    if (path === '/api/health' && req.method === 'GET') {
      log('info', 'Health check requested')

      const [pg, redis, rabbitmq, minio, opensearch] = await Promise.all([
        checkPostgreSQL(),
        checkRedis(),
        checkRabbitMQ(),
        checkMinIO(),
        checkOpenSearch(),
      ])

      const services = [pg, redis, rabbitmq, minio, opensearch]
      const allHealthy = services.every(s => s.status === 'healthy')
      const anyOffline = services.some(s => s.status === 'offline')

      const response: HealthResponse = {
        status: allHealthy ? 'healthy' : anyOffline ? 'degraded' : 'offline',
        database: pg.status,
        redis: redis.status,
        rabbitmq: rabbitmq.status,
        storage: minio.status,
        search: opensearch.status,
        version: VERSION,
        timestamp: new Date().toISOString(),
        services: services.map(s => ({
          name: s.name,
          status: s.status,
          latency: s.latency,
          details: s.details,
        })),
      }

      log('info', 'Health check completed', { status: response.status, healthyCount: services.filter(s => s.status === 'healthy').length })

      return new Response(JSON.stringify(response), { headers })
    }

    // GET /api/health/detailed
    if (path === '/api/health/detailed' && req.method === 'GET') {
      const [pg, redis, rabbitmq, minio, opensearch] = await Promise.all([
        checkPostgreSQL(),
        checkRedis(),
        checkRabbitMQ(),
        checkMinIO(),
        checkOpenSearch(),
      ])

      const services = [
        ...[pg, redis, rabbitmq, minio, opensearch],
        {
          name: 'Backend API',
          status: 'healthy' as const,
          latency: 1,
          details: `Running on port ${PORT}, version ${VERSION}`,
        },
      ]

      const allHealthy = services.every(s => s.status === 'healthy')

      return new Response(JSON.stringify({
        status: allHealthy ? 'healthy' : 'degraded',
        version: VERSION,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        services,
      }), { headers })
    }

    // GET /api/info
    if (path === '/api/info' && req.method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        name: 'SUOP Backend',
        version: VERSION,
        description: 'Sudhastar Unified Operating Platform — Backend API',
        sprint: 2,
        sprintName: 'Enterprise Core Infrastructure',
        architecture: {
          volumes: 3,
          entities: 815,
          foundationServices: 66,
          architecturalDecisions: 243,
        },
        techStack: {
          backend: 'NestJS + TypeScript + Prisma (planned Sprint 3)',
          frontend: 'Next.js + React + TypeScript + Tailwind + Shadcn UI',
          mobile: 'React Native + WatermelonDB',
          database: 'PostgreSQL 16 + Redis 7 + RabbitMQ 3.13 + MinIO',
          monitoring: 'Prometheus + Grafana + Loki + Tempo',
        },
      }, 'SUOP Backend Information')), { headers })
    }

    // GET /api/modules
    if (path === '/api/modules' && req.method === 'GET') {
      const modules = [
        { code: 'ORG', name: 'Organization', entities: 15, status: 'planned', description: 'Company, Branch, Department, Facility' },
        { code: 'PROD', name: 'Product', entities: 10, status: 'planned', description: 'Product Master, Variants, Packaging' },
        { code: 'INV', name: 'Inventory', entities: 10, status: 'planned', description: 'Immutable Ledger, Batches, Reservations' },
        { code: 'PROC', name: 'Procurement', entities: 10, status: 'planned', description: 'Vendors, Purchase Orders, GRN' },
        { code: 'WMS', name: 'Warehouse', entities: 10, status: 'planned', description: 'WMS, Pick/Pack/Ship, Locations' },
        { code: 'MES', name: 'Manufacturing', entities: 60, status: 'planned', description: 'MES, BOM, Routing, Production' },
        { code: 'QMS', name: 'Quality', entities: 60, status: 'planned', description: 'QMS, Inspections, CAPA, Compliance' },
        { code: 'RTL', name: 'Retail', entities: 60, status: 'planned', description: 'POS, Store Operations, Customer' },
        { code: 'RST', name: 'Restaurant', entities: 50, status: 'planned', description: 'Restaurant POS, Kitchen, Menu' },
        { code: 'FIN', name: 'Finance', entities: 100, status: 'planned', description: 'GL, AP/AR, Journal, Treasury' },
        { code: 'HR', name: 'Workforce', entities: 130, status: 'planned', description: 'HR, Payroll, Attendance, Performance' },
        { code: 'EAM', name: 'Maintenance', entities: 90, status: 'planned', description: 'EAM, Work Orders, PM, Reliability' },
        { code: 'PLT', name: 'Platform', entities: 120, status: 'in-progress', description: 'Auth, RBAC, Workflow, Audit, API' },
        { code: 'AI', name: 'AI & Analytics', entities: 90, status: 'planned', description: 'AI Gateway, Copilot, BI, Mission Control' },
      ]

      return new Response(JSON.stringify(successResponse(modules, `${modules.length} modules registered`)), { headers })
    }

    // 404
    return new Response(JSON.stringify(errorResponse(`Route ${path} not found`, 'NOT_FOUND')), {
      status: 404,
      headers,
    })
  },
})

log('info', `SUOP Backend v${VERSION} started`, { port: PORT, environment: process.env.NODE_ENV || 'development' })
log('info', 'Endpoints available', {
  health: `http://localhost:${PORT}/api/health`,
  detailed: `http://localhost:${PORT}/api/health/detailed`,
  info: `http://localhost:${PORT}/api/info`,
  modules: `http://localhost:${PORT}/api/modules`,
})

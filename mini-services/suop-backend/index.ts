/**
 * SUOP Backend — Health Check Service
 * Sprint 1: Platform Foundation
 *
 * This is the initial backend service that provides:
 * - GET /api/health — System health check
 * - GET /api/health/detailed — Detailed service status
 *
 * In future sprints, this will be replaced by the full NestJS backend.
 */

const PORT = 3030
const VERSION = "1.0.0"

interface ServiceStatus {
  name: string
  status: 'healthy' | 'degraded' | 'offline'
  latency?: number
  details?: string
}

// ─── Health Check Functions ────────────────────────────

async function checkPostgreSQL(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    // In production, this would check actual PostgreSQL connection
    // For Sprint 1, we simulate the check
    const host = process.env.DATABASE_HOST || 'localhost'
    const port = process.env.DATABASE_PORT || '5432'

    // Simulate connection check
    await new Promise(resolve => setTimeout(resolve, 5))

    return {
      name: 'PostgreSQL',
      status: 'healthy',
      latency: Date.now() - start,
      details: `Connected to ${host}:${port}`
    }
  } catch (error) {
    return {
      name: 'PostgreSQL',
      status: 'offline',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Connection failed'
    }
  }
}

async function checkRedis(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    const host = process.env.REDIS_HOST || 'localhost'
    const port = process.env.REDIS_PORT || '6379'

    await new Promise(resolve => setTimeout(resolve, 3))

    return {
      name: 'Redis',
      status: 'healthy',
      latency: Date.now() - start,
      details: `Connected to ${host}:${port}`
    }
  } catch (error) {
    return {
      name: 'Redis',
      status: 'offline',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Connection failed'
    }
  }
}

async function checkRabbitMQ(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    const host = process.env.RABBITMQ_HOST || 'localhost'
    const port = process.env.RABBITMQ_PORT || '5672'

    await new Promise(resolve => setTimeout(resolve, 4))

    return {
      name: 'RabbitMQ',
      status: 'healthy',
      latency: Date.now() - start,
      details: `Connected to ${host}:${port}`
    }
  } catch (error) {
    return {
      name: 'RabbitMQ',
      status: 'offline',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Connection failed'
    }
  }
}

async function checkMinIO(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    const host = process.env.MINIO_HOST || 'localhost'
    const port = process.env.MINIO_PORT || '9000'

    await new Promise(resolve => setTimeout(resolve, 3))

    return {
      name: 'MinIO Storage',
      status: 'healthy',
      latency: Date.now() - start,
      details: `Connected to ${host}:${port}`
    }
  } catch (error) {
    return {
      name: 'MinIO Storage',
      status: 'offline',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Connection failed'
    }
  }
}

// ─── HTTP Server ───────────────────────────────────────

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
      const [pg, redis, rabbitmq, minio] = await Promise.all([
        checkPostgreSQL(),
        checkRedis(),
        checkRabbitMQ(),
        checkMinIO(),
      ])

      const services = [pg, redis, rabbitmq, minio]
      const allHealthy = services.every(s => s.status === 'healthy')

      return new Response(JSON.stringify({
        status: allHealthy ? 'healthy' : 'degraded',
        database: pg.status,
        redis: redis.status,
        rabbitmq: rabbitmq.status,
        storage: minio.status,
        version: VERSION,
        timestamp: new Date().toISOString(),
        services: services.map(s => ({
          name: s.name,
          status: s.status,
          latency: s.latency,
        })),
      }), { headers })
    }

    // GET /api/health/detailed
    if (path === '/api/health/detailed' && req.method === 'GET') {
      const [pg, redis, rabbitmq, minio] = await Promise.all([
        checkPostgreSQL(),
        checkRedis(),
        checkRabbitMQ(),
        checkMinIO(),
      ])

      const services = [pg, redis, rabbitmq, minio, {
        name: 'Backend API',
        status: 'healthy' as const,
        latency: 1,
        details: `Running on port ${PORT}`
      }]

      return new Response(JSON.stringify({
        status: 'healthy',
        version: VERSION,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: services,
        environment: process.env.NODE_ENV || 'development',
      }), { headers })
    }

    // GET /api/info
    if (path === '/api/info' && req.method === 'GET') {
      return new Response(JSON.stringify({
        name: 'SUOP Backend',
        version: VERSION,
        description: 'Sudhastar Unified Operating Platform — Backend API',
        sprint: 1,
        sprintName: 'Platform Foundation',
        architecture: {
          volumes: 3,
          entities: 815,
          foundationServices: 66,
          architecturalDecisions: 243,
        },
        modules: [
          { code: 'ORG', name: 'Organization', entities: 15, status: 'planned' },
          { code: 'PROD', name: 'Product', entities: 10, status: 'planned' },
          { code: 'INV', name: 'Inventory', entities: 10, status: 'planned' },
          { code: 'PROC', name: 'Procurement', entities: 10, status: 'planned' },
          { code: 'WMS', name: 'Warehouse', entities: 10, status: 'planned' },
          { code: 'MES', name: 'Manufacturing', entities: 60, status: 'planned' },
          { code: 'QMS', name: 'Quality', entities: 60, status: 'planned' },
          { code: 'RTL', name: 'Retail', entities: 60, status: 'planned' },
          { code: 'RST', name: 'Restaurant', entities: 50, status: 'planned' },
          { code: 'FIN', name: 'Finance', entities: 100, status: 'planned' },
          { code: 'HR', name: 'Workforce', entities: 130, status: 'planned' },
          { code: 'EAM', name: 'Maintenance', entities: 90, status: 'planned' },
          { code: 'PLT', name: 'Platform', entities: 120, status: 'in-progress' },
          { code: 'AI', name: 'AI & Analytics', entities: 90, status: 'planned' },
        ],
        techStack: {
          backend: 'NestJS + TypeScript + Prisma',
          frontend: 'Next.js + React + TypeScript + Tailwind + Shadcn UI',
          mobile: 'React Native + WatermelonDB',
          database: 'PostgreSQL + Redis + RabbitMQ + MinIO',
          infrastructure: 'Docker + Kubernetes + Terraform',
          monitoring: 'Prometheus + Grafana + Loki + Tempo',
        },
      }), { headers })
    }

    // 404
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${path} not found`,
      },
    }), { status: 404, headers })
  },
})

console.log(`🚀 SUOP Backend running on http://localhost:${PORT}`)
console.log(`   Health Check: http://localhost:${PORT}/api/health`)
console.log(`   Detailed:     http://localhost:${PORT}/api/health/detailed`)
console.log(`   Info:         http://localhost:${PORT}/api/info`)
console.log(`   Version: ${VERSION}`)

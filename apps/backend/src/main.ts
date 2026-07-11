/**
 * SUOP Backend — Main Entry Point
 *
 * Starts the Bun HTTP server with the Hono application.
 */

import { createApp } from '@/app/app'
import { env } from '@/config/env'
import { logger } from '@/core/logging'

const app = createApp()

const server = Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
})

logger.info('SUOP Backend started', {
  port: server.port ?? env.PORT,
  environment: env.NODE_ENV,
})

console.log(`\n╔══════════════════════════════════════════════════════════╗`)
console.log(`║  SUOP ERP v1.0 — Backend Service                         ║`)
console.log(`║  Phase 0: Enterprise Foundation                          ║`)
console.log(`╠══════════════════════════════════════════════════════════╣`)
const port = server.port ?? env.PORT
console.log(`║  Port:         ${String(port).padEnd(42)}║`)
console.log(`║  Environment:  ${env.NODE_ENV.padEnd(42)}║`)
console.log(`║  Health:       http://localhost:${port}/api/v1/_internal/health${' '.repeat(Math.max(0, 42 - 40 - String(port).length))}║`)
console.log(`║  Version:      http://localhost:${port}/api/v1/_internal/version${' '.repeat(Math.max(0, 42 - 40 - String(port).length))}║`)
console.log(`╚══════════════════════════════════════════════════════════╝\n`)

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down...')
  server.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...')
  server.stop()
  process.exit(0)
})

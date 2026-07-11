/**
 * System Routes — Health, Readiness, Liveness, Version
 */

import { Hono } from 'hono'
import { success } from '@/core/response'
import { env } from '@/config/env'
import { isDatabaseHealthy } from '@/core/db/pglite'

export const systemRoutes = new Hono()

systemRoutes.get('/_internal/health', (c) => {
  return c.json(success({ status: 'ok', uptime: process.uptime() }))
})

systemRoutes.get('/_internal/live', (c) => {
  return c.json(success({ status: 'alive' }))
})

systemRoutes.get('/_internal/ready', async (c) => {
  const checks: Record<string, string> = {}

  const dbOk = await isDatabaseHealthy()
  if (dbOk) {
    checks['database'] = 'ok'
  } else {
    checks['database'] = 'error'
    return c.json(success({ status: 'not_ready', checks }), 503)
  }

  checks['redis'] = 'skipped (Phase 0 uses in-memory)'

  return c.json(success({ status: 'ready', checks }))
})

systemRoutes.get('/_internal/version', (c) => {
  return c.json(
    success({
      name: 'suop-backend',
      version: '1.0.0',
      phase: '0',
      environment: env.NODE_ENV,
      runtime: typeof Bun !== 'undefined' ? `Bun ${Bun.version}` : `Node ${process.version}`,
    })
  )
})

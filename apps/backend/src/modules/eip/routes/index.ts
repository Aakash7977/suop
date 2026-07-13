/**
 * @suop/backend — EIP Routes (Phases 56-65)
 */

import { Hono } from 'hono'
import { success } from '@/core/response'
import { requirePermission } from '@/middleware/rbac'
import { Permission } from '@/core/permissions'
import { publishEvent, getEventBusStats, getRegisteredEvents, replayEvents } from '../event-bus/service'
import {
  generateApiKey,
  getGatewayAnalytics,
  getRecentRequests,
  registerOAuthClient,
  issueOAuthToken,
} from '../gateway/service'
import {
  getRegisteredConnectors,
  registerAllConnectors,
  getConnector,
  type ConnectorType,
  type ConnectorConfig,
  type ConnectorOperation,
} from '../connectors/service'
import { registerWebhook, rotateWebhookSecret, deliverWebhook, getWebhookStats } from '../webhooks/service'
import { getRegisteredBrokers, produceMessage, getAllQueueStats } from '../queues/service'
import { listDevices, getTelemetryStats, getRecentTelemetry } from '../iot/service'
import { startSyncSession, pushChanges, pullChanges, sendPushNotification } from '../mobile/service'
import { startChatSession, sendChatMessage, generateForecast, generateRecommendations, extractInvoiceData } from '../ai/service'
import { listPlugins, listMarketplacePlugins } from '../extensibility/service'

export const eipRoutes = new Hono()

registerAllConnectors()

// Phase 56: Event Bus
eipRoutes.get('/event-bus/stats', requirePermission(Permission.BI_READ), async (c) => c.json(success(await getEventBusStats())))
eipRoutes.get('/event-bus/registry', requirePermission(Permission.BI_READ), (c) => c.json(success(getRegisteredEvents())))
eipRoutes.post('/event-bus/publish', requirePermission(Permission.BI_READ), async (c) => {
  const body = await c.req.json()
  const eventId = await publishEvent({ eventName: body.eventName, category: body.category ?? 'DOMAIN', version: body.version ?? '1.0.0', payload: body.payload })
  return c.json(success({ eventId }), 201)
})
eipRoutes.post('/event-bus/replay', requirePermission(Permission.BI_READ), async (c) => {
  const body = await c.req.json()
  const result = await replayEvents({ eventName: body.eventName, tenantId: body.tenantId, limit: body.limit ?? 1000, handler: async () => {} })
  return c.json(success(result))
})

// Phase 57: API Gateway
eipRoutes.get('/gateway/analytics', requirePermission(Permission.BI_READ), (c) => c.json(success(getGatewayAnalytics())))
eipRoutes.get('/gateway/requests', requirePermission(Permission.BI_READ), (c) => c.json(success(getRecentRequests(Number(c.req.query('limit') ?? 100)))))
eipRoutes.post('/gateway/api-keys', requirePermission(Permission.BI_READ), (c) => {
  const { keyId, keySecret } = generateApiKey()
  return c.json(success({ keyId, keySecret }), 201)
})
eipRoutes.post('/gateway/oauth/clients', requirePermission(Permission.BI_READ), async (c) => {
  const body = await c.req.json()
  return c.json(success(await registerOAuthClient(body)), 201)
})
eipRoutes.post('/gateway/oauth/token', async (c) => {
  const body = await c.req.json()
  const token = await issueOAuthToken(body)
  if (!token) return c.json({ success: false, error: { code: 'INVALID_CLIENT' } }, 401)
  return c.json(success(token))
})

// Phase 58: Webhooks
eipRoutes.post('/webhooks/register', requirePermission(Permission.BI_READ), async (c) => {
  const body = await c.req.json()
  return c.json(success(await registerWebhook(body)), 201)
})
eipRoutes.post('/webhooks/:id/rotate-secret', requirePermission(Permission.BI_READ), async (c) => c.json(success(await rotateWebhookSecret(c.req.param('id')!))))
eipRoutes.post('/webhooks/:id/deliver', requirePermission(Permission.BI_READ), async (c) => {
  const body = await c.req.json()
  return c.json(success(await deliverWebhook({ webhookId: c.req.param('id')!, tenantId: body.tenantId, url: body.url, secret: body.secret, eventName: body.eventName, payload: body.payload })))
})
eipRoutes.get('/webhooks/stats', requirePermission(Permission.BI_READ), (c) => c.json(success(getWebhookStats())))

// Phase 59: Connectors
eipRoutes.get('/connectors', requirePermission(Permission.BI_READ), (c) => c.json(success(getRegisteredConnectors())))
eipRoutes.post('/connectors/:type/execute', requirePermission(Permission.BI_READ), async (c) => {
  const connector = getConnector(c.req.param('type') as ConnectorType)
  if (!connector) return c.json({ success: false, error: { code: 'CONNECTOR_NOT_FOUND' } }, 404)
  const body = await c.req.json()
  return c.json(success(await connector.execute(body.config as ConnectorConfig, body.operation as ConnectorOperation)))
})
eipRoutes.post('/connectors/:type/test', requirePermission(Permission.BI_READ), async (c) => {
  const connector = getConnector(c.req.param('type') as ConnectorType)
  if (!connector) return c.json({ success: false, error: { code: 'CONNECTOR_NOT_FOUND' } }, 404)
  const body = await c.req.json()
  return c.json(success(await connector.testConnection(body.config as ConnectorConfig)))
})
eipRoutes.get('/connectors/:type/operations', requirePermission(Permission.BI_READ), (c) => {
  const connector = getConnector(c.req.param('type') as ConnectorType)
  if (!connector) return c.json({ success: false, error: { code: 'CONNECTOR_NOT_FOUND' } }, 404)
  return c.json(success(connector.getOperations()))
})

// Phase 60: Queues
eipRoutes.get('/queues/brokers', requirePermission(Permission.BI_READ), (c) => c.json(success(getRegisteredBrokers())))
eipRoutes.post('/queues/produce', requirePermission(Permission.BI_READ), async (c) => {
  const body = await c.req.json()
  return c.json(success({ messageId: await produceMessage(body) }), 201)
})
eipRoutes.get('/queues/stats', requirePermission(Permission.BI_READ), async (c) => c.json(success(await getAllQueueStats())))

// Phase 61: IoT
eipRoutes.get('/iot/devices', requirePermission(Permission.BI_READ), (c) => c.json(success(listDevices())))
eipRoutes.get('/iot/telemetry', requirePermission(Permission.BI_READ), (c) => c.json(success(getRecentTelemetry(c.req.query('deviceId') ?? undefined, Number(c.req.query('limit') ?? 100)))))
eipRoutes.get('/iot/telemetry/stats', requirePermission(Permission.BI_READ), (c) => c.json(success(getTelemetryStats())))

// Phase 62-63: Mobile
eipRoutes.post('/mobile/sync/start', requirePermission(Permission.BI_READ), async (c) => {
  const body = await c.req.json()
  return c.json(success(await startSyncSession(body)), 201)
})
eipRoutes.post('/mobile/sync/push', requirePermission(Permission.BI_READ), async (c) => {
  const body = await c.req.json()
  return c.json(success(await pushChanges(body)))
})
eipRoutes.post('/mobile/sync/pull', requirePermission(Permission.BI_READ), async (c) => {
  const body = await c.req.json()
  return c.json(success(await pullChanges(body)))
})
eipRoutes.post('/mobile/push-notification', requirePermission(Permission.BI_READ), async (c) => {
  const body = await c.req.json()
  return c.json(success({ id: await sendPushNotification(body) }), 201)
})

// Phase 64: AI Copilot
eipRoutes.post('/ai/chat/start', requirePermission(Permission.BI_READ), async (c) => {
  const body = await c.req.json()
  return c.json(success({ sessionId: await startChatSession(body) }), 201)
})
eipRoutes.post('/ai/chat/:sessionId/message', requirePermission(Permission.BI_READ), async (c) => {
  const body = await c.req.json()
  return c.json(success(await sendChatMessage({ sessionId: c.req.param('sessionId')!, message: body.message, tenantId: body.tenantId, userId: body.userId })))
})
eipRoutes.post('/ai/forecast', requirePermission(Permission.BI_READ), async (c) => {
  const body = await c.req.json()
  return c.json(success(await generateForecast(body)))
})
eipRoutes.get('/ai/recommendations', requirePermission(Permission.BI_READ), async (c) => {
  return c.json(success(await generateRecommendations(c.req.query('tenantId') ?? 'default')))
})
eipRoutes.post('/ai/ocr/invoice', requirePermission(Permission.BI_READ), async (c) => {
  const body = await c.req.json()
  return c.json(success(await extractInvoiceData(body.imageBase64)))
})

// Phase 65: Extensibility
eipRoutes.get('/extensibility/plugins', requirePermission(Permission.BI_READ), (c) => c.json(success(listPlugins(c.req.query('tenantId') ?? undefined))))
eipRoutes.get('/extensibility/marketplace', requirePermission(Permission.BI_READ), (c) => c.json(success(listMarketplacePlugins())))

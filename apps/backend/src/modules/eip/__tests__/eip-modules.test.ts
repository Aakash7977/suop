/**
 * EIP — Queues, IoT, Mobile, AI, Extensibility Tests (Phases 60-65)
 */

import { describe, it, expect } from 'vitest'
import { getRegisteredBrokers, produceMessage } from '@/modules/eip/queues/service'
import {
  listDevices, getTelemetryStats, getRecentTelemetry, recordTelemetry,
  MQTTClient, BarcodeScanner, RFIDReader, IndustrialPrinter,
} from '@/modules/eip/iot/service'
import { startSyncSession, pushChanges, pullChanges, sendPushNotification } from '@/modules/eip/mobile/service'
import { startChatSession, detectIntent, generateForecast, generateRecommendations } from '@/modules/eip/ai/service'
import {
  installPlugin, listPlugins, createCustomWorkflow, listCustomWorkflows,
  createCustomForm, createCustomDashboard, createBusinessRule, listBusinessRules,
  createAutomation, listAutomations,
} from '@/modules/eip/extensibility/service'

describe('EIP Queues', () => {
  it('registers brokers', () => {
    const brokers = getRegisteredBrokers()
    expect(brokers.length).toBeGreaterThan(0)
    expect(brokers).toContain('redis-streams')
  })
  it('produces a message to in-memory queue', async () => {
    const messageId = await produceMessage({ broker: 'redis-streams', topic: 'test-topic', payload: { hello: 'world' } })
    expect(messageId).toBeTruthy()
  })
})

describe('EIP IoT', () => {
  it('lists devices', () => { expect(Array.isArray(listDevices())).toBe(true) })
  it('records and retrieves telemetry', () => {
    recordTelemetry({ deviceId: 'sensor-1', sensorType: 'temperature', value: 25.5, unit: 'C', timestamp: Date.now(), quality: 'GOOD' })
    const readings = getRecentTelemetry('sensor-1', 10)
    expect(readings.length).toBeGreaterThan(0)
    expect(readings[0].deviceId).toBe('sensor-1')
  })
  it('returns telemetry stats', () => {
    const stats = getTelemetryStats()
    expect(stats).toHaveProperty('totalReadings')
    expect(stats).toHaveProperty('activeDevices')
  })
  it('creates an MQTT client', () => {
    const client = new MQTTClient({ brokerUrl: 'mqtt://localhost:1883', clientId: 'test', topics: [] })
    expect(client).toBeTruthy()
    expect(client.isConnected()).toBe(false)
  })
  it('creates a barcode scanner', () => {
    const scanner = new BarcodeScanner('scanner-1')
    let scanned = false
    scanner.onScan(() => { scanned = true })
    scanner.emitScan('1234567890', 'EAN13')
    expect(scanned).toBe(true)
  })
  it('creates an RFID reader', () => {
    const reader = new RFIDReader('rfid-1')
    let tagRead = false
    reader.onTagRead(() => { tagRead = true })
    reader.emitTag('EPC001', -65)
    expect(tagRead).toBe(true)
  })
  it('creates an industrial printer', async () => {
    const printer = new IndustrialPrinter('printer-1', 'zpl')
    const jobId = await printer.print({ template: 'label1', data: { barcode: '123456' }, copies: 1 })
    expect(jobId).toBeTruthy()
  })
})

describe('EIP Mobile', () => {
  it('starts a sync session', async () => {
    const result = await startSyncSession({ tenantId: 't1', userId: 'u1', deviceId: 'd1', deviceType: 'ios', appVersion: '1.0.0' })
    expect(result.session.id).toBeTruthy()
    expect(result.session.status).toBe('SYNCING')
  })
  it('pushes changes (empty list)', async () => {
    const result = await pushChanges({ sessionId: 's1', tenantId: 't1', userId: 'u1', changes: [] })
    expect(result.accepted).toBe(0)
  })
  it('pulls changes', async () => {
    const result = await pullChanges({ sessionId: 's1', tenantId: 't1', syncToken: 'old' })
    expect(result.newSyncToken).toBeTruthy()
  })
  it('sends a push notification', async () => {
    const id = await sendPushNotification({ tenantId: 't1', userId: 'u1', deviceToken: 'tk', deviceType: 'android', title: 'Test', body: 'Hello' })
    expect(id).toBeTruthy()
  })
})

describe('EIP AI Copilot', () => {
  it('starts a chat session', async () => {
    const sessionId = await startChatSession({ tenantId: 't1', userId: 'u1' })
    expect(sessionId).toBeTruthy()
  })
  it('detects inventory intent', () => {
    expect(detectIntent('stock level')?.name).toBe('check_inventory')
  })
  it('detects order intent', () => {
    expect(detectIntent('sales orders')?.name).toBe('check_orders')
  })
  it('detects purchase intent', () => {
    expect(detectIntent('purchase orders')?.name).toBe('check_purchase')
  })
  it('detects production intent', () => {
    expect(detectIntent('production status')?.name).toBe('check_production')
  })
  it('detects forecast intent', () => {
    expect(detectIntent('forecast sales')?.name).toBe('forecast')
  })
  it('detects recommendation intent', () => {
    expect(detectIntent('recommendations')?.name).toBe('recommend')
  })
  it('returns null for unrecognized input', () => {
    expect(detectIntent('xyz random 123')).toBeNull()
  })
  it('generates a forecast', async () => {
    const result = await generateForecast({ metric: 'sales', tenantId: 't1', horizonDays: 7, granularity: 'daily' })
    expect(result.values.length).toBe(7)
    expect(result.confidence).toBeGreaterThan(0)
  })
  it('generates recommendations', async () => {
    const recs = await generateRecommendations('t1')
    expect(recs.length).toBeGreaterThan(0)
    expect(recs[0].title).toBeTruthy()
  })
})

describe('EIP Extensibility', () => {
  it('installs a plugin', () => {
    const plugin = installPlugin({ name: 'Test', version: '1.0.0', description: 'Test', author: 'Test', tenantId: 't1', entryPoint: './test', permissions: [], isActive: true, config: {} })
    expect(plugin.id).toBeTruthy()
  })
  it('lists plugins', () => {
    expect(listPlugins('t1').length).toBeGreaterThan(0)
  })
  it('creates a custom workflow', () => {
    const wf = createCustomWorkflow({ name: 'Test', tenantId: 't1', trigger: { type: 'event', config: {} }, steps: [{ id: 's1', name: 'Step1', type: 'action', config: {} }], isActive: true })
    expect(wf.id).toBeTruthy()
    expect(wf.version).toBe(1)
  })
  it('lists custom workflows', () => {
    expect(listCustomWorkflows('t1').length).toBeGreaterThan(0)
  })
  it('creates a custom form', () => {
    const form = createCustomForm({ name: 'Test', tenantId: 't1', entityType: 'Product', fields: [{ id: 'f1', name: 'sku', label: 'SKU', type: 'text', required: true }], layout: 'single', isActive: true })
    expect(form.id).toBeTruthy()
  })
  it('creates a custom dashboard', () => {
    const dash = createCustomDashboard({ name: 'Test', tenantId: 't1', widgets: [], layout: { columns: 12, rows: 8 }, isShared: false, createdBy: 'u1' })
    expect(dash.id).toBeTruthy()
  })
  it('creates a business rule', () => {
    const rule = createBusinessRule({ name: 'Test', tenantId: 't1', entityType: 'Product', trigger: 'before_save', conditions: [{ field: 'stock', operator: 'lt', value: 10 }], actions: [{ type: 'send_notification', config: {} }], isActive: true, priority: 1 })
    expect(rule.id).toBeTruthy()
  })
  it('lists business rules', () => {
    expect(listBusinessRules('t1', 'Product').length).toBeGreaterThan(0)
  })
  it('creates an automation', () => {
    const auto = createAutomation({ name: 'Test', tenantId: 't1', trigger: { type: 'event', config: {} }, actions: [{ type: 'send_email', config: {} }], isActive: true })
    expect(auto.id).toBeTruthy()
    expect(auto.runCount).toBe(0)
  })
  it('lists automations', () => {
    expect(listAutomations('t1').length).toBeGreaterThan(0)
  })
})

/**
 * EIP — Connectors Tests (Phase 59)
 */

import { describe, it, expect } from 'vitest'
import {
  getRegisteredConnectors,
  registerAllConnectors,
  getConnector,
  type ConnectorType,
} from '@/modules/eip/connectors/service'

describe('EIP Connectors — Registry', () => {
  it('registers all 28+ connectors', () => {
    registerAllConnectors()
    const connectors = getRegisteredConnectors()
    expect(connectors.length).toBeGreaterThanOrEqual(28)
  })

  it('registers ERP connectors', () => {
    registerAllConnectors()
    const types = getRegisteredConnectors().map((c) => c.type)
    expect(types).toContain('sap')
    expect(types).toContain('dynamics')
    expect(types).toContain('oracle')
    expect(types).toContain('tally')
    expect(types).toContain('zoho')
    expect(types).toContain('quickbooks')
    expect(types).toContain('odoo')
  })

  it('registers CRM connectors', () => {
    registerAllConnectors()
    const types = getRegisteredConnectors().map((c) => c.type)
    expect(types).toContain('salesforce')
    expect(types).toContain('hubspot')
  })

  it('registers logistics connectors', () => {
    registerAllConnectors()
    const types = getRegisteredConnectors().map((c) => c.type)
    expect(types).toContain('shiprocket')
    expect(types).toContain('delhivery')
    expect(types).toContain('bluedart')
    expect(types).toContain('fedex')
    expect(types).toContain('dhl')
  })

  it('registers payment connectors', () => {
    registerAllConnectors()
    const types = getRegisteredConnectors().map((c) => c.type)
    expect(types).toContain('razorpay')
    expect(types).toContain('stripe')
    expect(types).toContain('paypal')
  })

  it('registers tax connectors', () => {
    registerAllConnectors()
    const types = getRegisteredConnectors().map((c) => c.type)
    expect(types).toContain('gst')
    expect(types).toContain('einvoice')
    expect(types).toContain('ewaybill')
  })

  it('registers communication connectors', () => {
    registerAllConnectors()
    const types = getRegisteredConnectors().map((c) => c.type)
    expect(types).toContain('smtp')
    expect(types).toContain('sms')
    expect(types).toContain('whatsapp')
    expect(types).toContain('firebase')
    expect(types).toContain('slack')
    expect(types).toContain('teams')
  })

  it('registers storage connectors', () => {
    registerAllConnectors()
    const types = getRegisteredConnectors().map((c) => c.type)
    expect(types).toContain('gdrive')
    expect(types).toContain('onedrive')
    expect(types).toContain('s3')
    expect(types).toContain('minio')
  })

  it('retrieves a connector by type', () => {
    registerAllConnectors()
    const connector = getConnector('razorpay')
    expect(connector).not.toBeNull()
    expect(connector!.name).toBe('Razorpay')
  })

  it('returns null for unknown connector type', () => {
    expect(getConnector('nonexistent' as ConnectorType)).toBeNull()
  })

  it('all connectors have name and description', () => {
    registerAllConnectors()
    const connectors = getRegisteredConnectors()
    for (const c of connectors) {
      expect(c.name).toBeTruthy()
      expect(c.description).toBeTruthy()
    }
  })
})

describe('EIP Connectors — SAP', () => {
  it('exposes operations', () => {
    registerAllConnectors()
    const connector = getConnector('sap')
    expect(connector).not.toBeNull()
    const ops = connector!.getOperations()
    expect(ops.length).toBeGreaterThan(0)
    expect(ops.some((o) => o.name === 'getPurchaseOrders')).toBe(true)
  })
})

describe('EIP Connectors — Salesforce', () => {
  it('exposes operations', () => {
    registerAllConnectors()
    const connector = getConnector('salesforce')
    expect(connector).not.toBeNull()
    const ops = connector!.getOperations()
    expect(ops.length).toBeGreaterThan(0)
    expect(ops.some((o) => o.name === 'createAccount')).toBe(true)
  })
})

describe('EIP Connectors — Razorpay', () => {
  it('exposes operations', () => {
    registerAllConnectors()
    const connector = getConnector('razorpay')
    expect(connector).not.toBeNull()
    const ops = connector!.getOperations()
    expect(ops.length).toBeGreaterThan(0)
    expect(ops.some((o) => o.name === 'createOrder')).toBe(true)
  })
})

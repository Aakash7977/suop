/**
 * Unit tests for the feature flags framework.
 */
import { describe, it, expect } from 'vitest'
import {
  FeatureFlags,
  FLAG_CATALOG,
  _makeTestFeatureFlags,
  type FlagValue,
} from '../features'

// ─── Test Helpers ───────────────────────────────────────────────────────────

const TENANT_A = 'tenant-aaa'
const TENANT_B = 'tenant-bbb'
const UNKNOWN_FLAG = 'UNKNOWN_FLAG_THAT_DOES_NOT_EXIST'

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('FLAG_CATALOG', () => {
  it('declares NEW_RECALL_ENGINE', () => {
    expect(FLAG_CATALOG.NEW_RECALL_ENGINE).toBeDefined()
    expect(typeof FLAG_CATALOG.NEW_RECALL_ENGINE.defaultValue).toBe('boolean')
    expect(FLAG_CATALOG.NEW_RECALL_ENGINE.description).toBeTruthy()
  })

  it('declares WEBSOCKET_NOTIFICATIONS', () => {
    expect(FLAG_CATALOG.WEBSOCKET_NOTIFICATIONS).toBeDefined()
    expect(typeof FLAG_CATALOG.WEBSOCKET_NOTIFICATIONS.defaultValue).toBe('boolean')
  })

  it('declares AI_PREDICTIVE_QUALITY', () => {
    expect(FLAG_CATALOG.AI_PREDICTIVE_QUALITY).toBeDefined()
    expect(typeof FLAG_CATALOG.AI_PREDICTIVE_QUALITY.defaultValue).toBe('boolean')
  })
})

describe('FeatureFlags.isEnabled — boolean values', () => {
  it('returns true when flag is enabled (boolean)', async () => {
    const ff = _makeTestFeatureFlags({ NEW_RECALL_ENGINE: true })
    expect(await ff.isEnabled(TENANT_A, 'NEW_RECALL_ENGINE')).toBe(true)
  })

  it('returns false when flag is disabled (boolean)', async () => {
    const ff = _makeTestFeatureFlags({ NEW_RECALL_ENGINE: false })
    expect(await ff.isEnabled(TENANT_A, 'NEW_RECALL_ENGINE')).toBe(false)
  })

  it('returns the same value regardless of tenant when flag is boolean', async () => {
    const ff = _makeTestFeatureFlags({ NEW_RECALL_ENGINE: true })
    expect(await ff.isEnabled(TENANT_A, 'NEW_RECALL_ENGINE')).toBe(true)
    expect(await ff.isEnabled(TENANT_B, 'NEW_RECALL_ENGINE')).toBe(true)
  })
})

describe('FeatureFlags.isEnabled — tenant allowlist values', () => {
  it('returns true for tenant in allowlist', async () => {
    const ff = _makeTestFeatureFlags({
      NEW_RECALL_ENGINE: [TENANT_A],
    })
    expect(await ff.isEnabled(TENANT_A, 'NEW_RECALL_ENGINE')).toBe(true)
  })

  it('returns false for tenant not in allowlist', async () => {
    const ff = _makeTestFeatureFlags({
      NEW_RECALL_ENGINE: [TENANT_A],
    })
    expect(await ff.isEnabled(TENANT_B, 'NEW_RECALL_ENGINE')).toBe(false)
  })

  it('returns true for all tenants in allowlist', async () => {
    const ff = _makeTestFeatureFlags({
      NEW_RECALL_ENGINE: [TENANT_A, TENANT_B],
    })
    expect(await ff.isEnabled(TENANT_A, 'NEW_RECALL_ENGINE')).toBe(true)
    expect(await ff.isEnabled(TENANT_B, 'NEW_RECALL_ENGINE')).toBe(true)
  })

  it('returns false for all tenants when allowlist is empty', async () => {
    const ff = _makeTestFeatureFlags({
      NEW_RECALL_ENGINE: [],
    })
    expect(await ff.isEnabled(TENANT_A, 'NEW_RECALL_ENGINE')).toBe(false)
    expect(await ff.isEnabled(TENANT_B, 'NEW_RECALL_ENGINE')).toBe(false)
  })
})

describe('FeatureFlags.isEnabled — unknown flags', () => {
  it('returns false for an unknown flag (fail closed)', async () => {
    const ff = _makeTestFeatureFlags({})
    expect(await ff.isEnabled(TENANT_A, UNKNOWN_FLAG)).toBe(false)
  })

  it('returns false for an unknown flag even with a tenant', async () => {
    const ff = _makeTestFeatureFlags({})
    expect(await ff.isEnabled(TENANT_A, UNKNOWN_FLAG)).toBe(false)
  })
})

describe('FeatureFlags.getValue', () => {
  it('returns the raw boolean value', async () => {
    const ff = _makeTestFeatureFlags({ NEW_RECALL_ENGINE: true })
    expect(await ff.getValue('NEW_RECALL_ENGINE')).toBe(true)
  })

  it('returns the raw allowlist value', async () => {
    const ff = _makeTestFeatureFlags({
      NEW_RECALL_ENGINE: [TENANT_A, TENANT_B],
    })
    expect(await ff.getValue('NEW_RECALL_ENGINE')).toEqual([TENANT_A, TENANT_B])
  })

  it('returns undefined for unknown flag', async () => {
    const ff = _makeTestFeatureFlags({})
    expect(await ff.getValue(UNKNOWN_FLAG)).toBeUndefined()
  })
})

describe('FeatureFlags.list', () => {
  it('returns all configured flags', async () => {
    const ff = _makeTestFeatureFlags({
      NEW_RECALL_ENGINE: true,
      WEBSOCKET_NOTIFICATIONS: false,
    })
    const list = await ff.list()
    expect(list).toEqual({
      NEW_RECALL_ENGINE: true,
      WEBSOCKET_NOTIFICATIONS: false,
    })
  })

  it('returns empty object when no flags configured', async () => {
    const ff = _makeTestFeatureFlags({})
    const list = await ff.list()
    expect(list).toEqual({})
  })
})

describe('FeatureFlags.refresh', () => {
  it('does not throw', async () => {
    const ff = _makeTestFeatureFlags({ NEW_RECALL_ENGINE: true })
    await expect(ff.refresh()).resolves.toBeUndefined()
  })
})

describe('FeatureFlags — type contract', () => {
  it('FlagValue type accepts boolean', () => {
    const v: FlagValue = true
    expect(v).toBe(true)
  })

  it('FlagValue type accepts string array', () => {
    const v: FlagValue = ['tenant-1']
    expect(v).toEqual(['tenant-1'])
  })
})

describe('FeatureFlags — singleton', () => {
  it('features singleton is an instance of FeatureFlags', async () => {
    // Import here so env.ts loads with test env vars set
    const { features } = await import('../features')
    expect(features).toBeInstanceOf(FeatureFlags)
  })
})

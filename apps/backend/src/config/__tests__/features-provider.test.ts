/**
 * Unit tests for the EnvFlagProvider class (the singleton's default provider).
 *
 * These tests verify the real provider that reads from env vars, not the
 * test helper. The test helper (_makeTestFeatureFlags) is tested in
 * features.test.ts.
 */
import { describe, it, expect } from 'vitest'
import { features, FeatureFlags, FLAG_CATALOG } from '../features'

describe('EnvFlagProvider (singleton)', () => {
  it('features singleton is an instance of FeatureFlags', () => {
    expect(features).toBeInstanceOf(FeatureFlags)
  })

  it('returns boolean values for flags defined in FLAG_CATALOG', async () => {
    // The test setup sets all FEATURE_* flags to 'false'
    expect(await features.isEnabled('tenant-1', 'NEW_RECALL_ENGINE')).toBe(false)
    expect(await features.isEnabled('tenant-1', 'WEBSOCKET_NOTIFICATIONS')).toBe(false)
    expect(await features.isEnabled('tenant-1', 'AI_PREDICTIVE_QUALITY')).toBe(false)
  })

  it('returns false for unknown flags (fail closed)', async () => {
    expect(await features.isEnabled('tenant-1', 'NONEXISTENT_FLAG')).toBe(false)
  })

  it('getValue returns the raw value from the provider', async () => {
    const value = await features.getValue('NEW_RECALL_ENGINE')
    expect(typeof value).toBe('boolean')
  })

  it('getValue returns undefined for unknown flags', async () => {
    const value = await features.getValue('NONEXISTENT_FLAG')
    expect(value).toBeUndefined()
  })

  it('list returns all flags from the catalog', async () => {
    const list = await features.list()
    expect(list).toHaveProperty('NEW_RECALL_ENGINE')
    expect(list).toHaveProperty('WEBSOCKET_NOTIFICATIONS')
    expect(list).toHaveProperty('AI_PREDICTIVE_QUALITY')
  })

  it('refresh clears the cache and re-reads env vars', async () => {
    // refresh should not throw
    await features.refresh()
    // After refresh, values should still be readable
    const value = await features.getValue('NEW_RECALL_ENGINE')
    expect(typeof value).toBe('boolean')
  })

  it('returns the same value for different tenants (boolean flag)', async () => {
    const a = await features.isEnabled('tenant-a', 'NEW_RECALL_ENGINE')
    const b = await features.isEnabled('tenant-b', 'NEW_RECALL_ENGINE')
    expect(a).toBe(b)
  })
})

describe('FLAG_CATALOG completeness', () => {
  it('every flag has a description', () => {
    for (const [name, def] of Object.entries(FLAG_CATALOG)) {
      expect(def.description, `${name} should have a description`).toBeTruthy()
      expect(def.description.length, `${name} description should be >10 chars`).toBeGreaterThan(10)
    }
  })

  it('every flag has a boolean defaultValue', () => {
    for (const [name, def] of Object.entries(FLAG_CATALOG)) {
      expect(typeof def.defaultValue, `${name} defaultValue must be boolean`).toBe('boolean')
    }
  })
})

/**
 * Unit tests for the EnvSecretsProvider class (the singleton's default provider).
 *
 * These tests verify the real provider that reads from process.env, not the
 * test helper. The test helper (_makeTestSecrets) is tested in secrets.test.ts.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { secrets, Secrets, SECRET_KEYS } from '../secrets'

describe('EnvSecretsProvider (singleton)', () => {
  it('secrets singleton is an instance of Secrets', () => {
    expect(secrets).toBeInstanceOf(Secrets)
  })

  it('returns env var values for keys present in process.env', async () => {
    // JWT_SECRET is set by vitest.setup.ts
    const value = await secrets.get('JWT_SECRET')
    expect(value).toBeDefined()
    expect(typeof value).toBe('string')
    expect(value!.length).toBeGreaterThanOrEqual(32)
  })

  it('returns undefined for keys not in process.env', async () => {
    const value = await secrets.get('SOME_KEY_THAT_DOES_NOT_EXIST_IN_ENV')
    expect(value).toBeUndefined()
  })

  it('getOrThrow returns the value when present', async () => {
    const value = await secrets.getOrThrow('JWT_SECRET')
    expect(value).toBeDefined()
    expect(value.length).toBeGreaterThanOrEqual(32)
  })

  it('getOrThrow throws when key is missing', async () => {
    await expect(
      secrets.getOrThrow('MISSING_KEY_FOR_GET_OR_THROW_TEST')
    ).rejects.toThrow(/Secret 'MISSING_KEY_FOR_GET_OR_THROW_TEST' not found/)
  })

  it('getMany returns multiple values', async () => {
    const result = await secrets.getMany(['JWT_SECRET', 'MISSING_KEY'])
    expect(result['JWT_SECRET']).toBeDefined()
    expect(result['MISSING_KEY']).toBeUndefined()
  })

  it('refresh clears the cache', async () => {
    // Read a value (populates cache)
    const before = await secrets.get('JWT_SECRET')
    expect(before).toBeDefined()
    // Refresh
    await secrets.refresh()
    // Read again — should still work
    const after = await secrets.get('JWT_SECRET')
    expect(after).toBe(before)
  })

  it('refresh with a specific key clears only that key', async () => {
    await secrets.refresh('JWT_SECRET')
    const value = await secrets.get('JWT_SECRET')
    expect(value).toBeDefined()
  })
})

describe('SECRET_KEYS values', () => {
  it('every key maps to its own name', () => {
    for (const [key, value] of Object.entries(SECRET_KEYS)) {
      expect(value).toBe(key)
    }
  })
})

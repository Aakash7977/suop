/**
 * Unit tests for the secrets provider.
 */
import { describe, it, expect } from 'vitest'
import { Secrets, SECRET_KEYS, _makeTestSecrets } from '../secrets'

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('SECRET_KEYS catalog', () => {
  it('declares DATABASE_URL', () => {
    expect(SECRET_KEYS.DATABASE_URL).toBe('DATABASE_URL')
  })

  it('declares JWT_SECRET', () => {
    expect(SECRET_KEYS.JWT_SECRET).toBe('JWT_SECRET')
  })

  it('declares runtime integration secrets', () => {
    expect(SECRET_KEYS.TWILIO_ACCOUNT_SID).toBe('TWILIO_ACCOUNT_SID')
    expect(SECRET_KEYS.TWILIO_AUTH_TOKEN).toBe('TWILIO_AUTH_TOKEN')
    expect(SECRET_KEYS.WHATSAPP_BUSINESS_TOKEN).toBe('WHATSAPP_BUSINESS_TOKEN')
  })

  it('declares encryption secrets', () => {
    expect(SECRET_KEYS.COLUMN_ENCRYPTION_KEY).toBe('COLUMN_ENCRYPTION_KEY')
    expect(SECRET_KEYS.PASSWORD_PEPPER).toBe('PASSWORD_PEPPER')
  })
})

describe('Secrets.get', () => {
  it('returns the value when secret exists', async () => {
    const secrets = _makeTestSecrets({ MY_API_KEY: 'abc123' })
    expect(await secrets.get('MY_API_KEY')).toBe('abc123')
  })

  it('returns undefined when secret does not exist', async () => {
    const secrets = _makeTestSecrets({})
    expect(await secrets.get('NONEXISTENT')).toBeUndefined()
  })

  it('returns undefined for a key with explicit undefined value', async () => {
    const secrets = _makeTestSecrets({ MY_API_KEY: undefined })
    expect(await secrets.get('MY_API_KEY')).toBeUndefined()
  })
})

describe('Secrets.getOrThrow', () => {
  it('returns the value when secret exists', async () => {
    const secrets = _makeTestSecrets({ MY_API_KEY: 'abc123' })
    expect(await secrets.getOrThrow('MY_API_KEY')).toBe('abc123')
  })

  it('throws when secret does not exist', async () => {
    const secrets = _makeTestSecrets({})
    await expect(secrets.getOrThrow('NONEXISTENT')).rejects.toThrow(
      /Secret 'NONEXISTENT' not found/
    )
  })

  it('throws with the key name in the error message', async () => {
    const secrets = _makeTestSecrets({})
    await expect(secrets.getOrThrow('STRIPE_KEY')).rejects.toThrow(
      /STRIPE_KEY/
    )
  })
})

describe('Secrets.getMany', () => {
  it('returns multiple secrets in one call', async () => {
    const secrets = _makeTestSecrets({
      KEY_A: 'value-a',
      KEY_B: 'value-b',
    })
    const result = await secrets.getMany(['KEY_A', 'KEY_B'])
    expect(result).toEqual({
      KEY_A: 'value-a',
      KEY_B: 'value-b',
    })
  })

  it('returns undefined for missing keys', async () => {
    const secrets = _makeTestSecrets({ KEY_A: 'value-a' })
    const result = await secrets.getMany(['KEY_A', 'KEY_MISSING'])
    expect(result).toEqual({
      KEY_A: 'value-a',
      KEY_MISSING: undefined,
    })
  })

  it('returns empty object for empty keys array', async () => {
    const secrets = _makeTestSecrets({ KEY_A: 'value-a' })
    const result = await secrets.getMany([])
    expect(result).toEqual({})
  })
})

describe('Secrets.refresh', () => {
  it('does not throw when refreshing all', async () => {
    const secrets = _makeTestSecrets({ KEY_A: 'value-a' })
    await expect(secrets.refresh()).resolves.toBeUndefined()
  })

  it('does not throw when refreshing a single key', async () => {
    const secrets = _makeTestSecrets({ KEY_A: 'value-a' })
    await expect(secrets.refresh('KEY_A')).resolves.toBeUndefined()
  })
})

describe('Secrets — singleton', () => {
  it('secrets singleton is an instance of Secrets', async () => {
    const { secrets } = await import('../secrets')
    expect(secrets).toBeInstanceOf(Secrets)
  })
})

describe('Secrets — type contract', () => {
  it('get returns a string or undefined', async () => {
    const secrets = _makeTestSecrets({ KEY: 'value' })
    const value: string | undefined = await secrets.get('KEY')
    expect(value).toBe('value')
  })
})

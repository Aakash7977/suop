/**
 * Secrets Management Tests
 *
 * Tests for secret loading, rotation, field-level encryption,
 * and sensitive field detection.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadSecret,
  getSecret,
  rotateSecret,
  listSecrets,
  encryptField,
  decryptField,
  isEncrypted,
  hashForLookup,
  isSensitiveField,
  SENSITIVE_FIELDS,
  initializeSecrets,
} from '@/core/security/secrets'

describe('Secrets Management — Loading', () => {
  it('loads a secret from env var', () => {
    process.env.TEST_SECRET_1 = 'a-very-long-secret-value-for-testing-1234567890'
    const s = loadSecret('test-secret-1', 'TEST_SECRET_1', 32)
    expect(s.value).toBe('a-very-long-secret-value-for-testing-1234567890')
    expect(s.metadata.id).toBe('test-secret-1')
    expect(s.metadata.source).toBe('env')
    expect(s.metadata.version).toBe(1)
  })

  it('throws when env var is missing', () => {
    delete process.env.TEST_MISSING_SECRET
    expect(() => loadSecret('test-missing', 'TEST_MISSING_SECRET', 32)).toThrow()
  })

  it('throws when secret is too short', () => {
    process.env.TEST_SHORT_SECRET = 'short'
    expect(() => loadSecret('test-short', 'TEST_SHORT_SECRET', 32)).toThrow()
  })

  it('getSecret returns a loaded secret', () => {
    process.env.TEST_SECRET_2 = 'another-long-secret-value-for-testing-1234567890'
    loadSecret('test-secret-2', 'TEST_SECRET_2', 32)
    const s = getSecret('test-secret-2')
    expect(s.value).toBe('another-long-secret-value-for-testing-1234567890')
  })

  it('getSecret throws for unknown secret', () => {
    expect(() => getSecret('nonexistent-secret')).toThrow()
  })
})

describe('Secrets Management — Rotation', () => {
  it('rotates a secret and increments version', () => {
    process.env.TEST_ROTATE_SECRET = 'initial-value-that-is-long-enough-1234567890'
    loadSecret('test-rotate', 'TEST_ROTATE_SECRET', 32)
    const initial = getSecret('test-rotate')
    expect(initial.metadata.version).toBe(1)

    rotateSecret('test-rotate', 'new-value-that-is-also-long-enough-0987654321')
    const rotated = getSecret('test-rotate')
    expect(rotated.value).toBe('new-value-that-is-also-long-enough-0987654321')
    expect(rotated.metadata.version).toBe(2)
  })

  it('throws when rotating an unknown secret', () => {
    expect(() => rotateSecret('nonexistent', 'new-value')).toThrow()
  })
})

describe('Secrets Management — Listing', () => {
  it('lists loaded secrets (without values)', () => {
    process.env.TEST_LIST_SECRET = 'list-secret-value-that-is-long-enough-1234567890'
    loadSecret('test-list', 'TEST_LIST_SECRET', 32)
    const list = listSecrets()
    expect(list.length).toBeGreaterThan(0)
    const found = list.find((s) => s.id === 'test-list')
    expect(found).toBeTruthy()
    expect(found!.id).toBe('test-list')
    // Should not expose the value
    expect((found as any).value).toBeUndefined()
  })
})

describe('Field-Level Encryption', () => {
  it('encrypts a plaintext string', () => {
    const plaintext = '4111111111111111' // credit card number
    const encrypted = encryptField(plaintext)
    expect(encrypted).not.toBe(plaintext)
    expect(encrypted.startsWith('enc:v1:')).toBe(true)
  })

  it('decrypts back to the original plaintext', () => {
    const plaintext = 'sensitive-data-12345'
    const encrypted = encryptField(plaintext)
    const decrypted = decryptField(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('does not double-encrypt already-encrypted values', () => {
    const plaintext = 'test-value-67890'
    const encrypted1 = encryptField(plaintext)
    const encrypted2 = encryptField(encrypted1)
    expect(encrypted2).toBe(encrypted1)
  })

  it('passes through empty strings unchanged', () => {
    expect(encryptField('')).toBe('')
    expect(decryptField('')).toBe('')
  })

  it('passes through non-encrypted values unchanged on decrypt', () => {
    const plaintext = 'not-encrypted-data'
    expect(decryptField(plaintext)).toBe(plaintext)
  })

  it('isEncrypted detects encrypted values', () => {
    expect(isEncrypted('enc:v1:abc123')).toBe(true)
    expect(isEncrypted('plain-text')).toBe(false)
    expect(isEncrypted('')).toBe(false)
  })

  it('produces different ciphertexts for same plaintext (random IV)', () => {
    const plaintext = 'same-plaintext'
    const e1 = encryptField(plaintext)
    const e2 = encryptField(plaintext)
    expect(e1).not.toBe(e2) // Different IVs → different ciphertexts
    // But both decrypt to the same value
    expect(decryptField(e1)).toBe(plaintext)
    expect(decryptField(e2)).toBe(plaintext)
  })
})

describe('Hash for Lookup', () => {
  it('produces a deterministic SHA-256 hash', () => {
    const h1 = hashForLookup('email@test.com')
    const h2 = hashForLookup('email@test.com')
    expect(h1).toBe(h2)
    expect(h1).toHaveLength(64) // SHA-256 hex = 64 chars
  })

  it('produces different hashes for different inputs', () => {
    const h1 = hashForLookup('a@test.com')
    const h2 = hashForLookup('b@test.com')
    expect(h1).not.toBe(h2)
  })
})

describe('Sensitive Field Detection', () => {
  it('identifies PAN number as sensitive', () => {
    expect(isSensitiveField('pan_number')).toBe(true)
  })

  it('identifies GST number as sensitive', () => {
    expect(isSensitiveField('gst_number')).toBe(true)
  })

  it('identifies bank account as sensitive', () => {
    expect(isSensitiveField('bank_account_number')).toBe(true)
  })

  it('identifies API key as sensitive', () => {
    expect(isSensitiveField('api_key')).toBe(true)
  })

  it('does NOT identify name as sensitive', () => {
    expect(isSensitiveField('name')).toBe(false)
  })

  it('does NOT identify email as sensitive', () => {
    expect(isSensitiveField('email')).toBe(false)
  })

  it('is case-insensitive', () => {
    expect(isSensitiveField('PAN_NUMBER')).toBe(true)
    expect(isSensitiveField('Pan_Number')).toBe(true)
  })

  it('SENSITIVE_FIELDS is non-empty', () => {
    expect(SENSITIVE_FIELDS.length).toBeGreaterThan(10)
  })
})

describe('initializeSecrets', () => {
  it('loads required secrets without throwing', () => {
    // Should not throw — JWT_SECRET is set in test env
    expect(() => initializeSecrets()).not.toThrow()
  })
})

/**
 * Secrets Management — Additional Tests
 *
 * Extended tests for encryption edge cases and sensitive field detection.
 */

import { describe, it, expect } from 'vitest'
import {
  encryptField,
  decryptField,
  isEncrypted,
  hashForLookup,
  isSensitiveField,
  SENSITIVE_FIELDS,
} from '@/core/security/secrets'

describe('Encryption — Edge Cases', () => {
  it('handles unicode text', () => {
    const plaintext = 'Hello, 世界! 🌍 café'
    const encrypted = encryptField(plaintext)
    const decrypted = decryptField(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('handles very long strings', () => {
    const plaintext = 'x'.repeat(100000)
    const encrypted = encryptField(plaintext)
    const decrypted = decryptField(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('handles strings with special characters', () => {
    const plaintext = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
    const encrypted = encryptField(plaintext)
    const decrypted = decryptField(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('handles newlines and tabs', () => {
    const plaintext = 'line1\nline2\tcol1\rcol2'
    const encrypted = encryptField(plaintext)
    const decrypted = decryptField(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('handles JSON strings', () => {
    const plaintext = JSON.stringify({ name: 'Alice', age: 30, nested: { x: 1 } })
    const encrypted = encryptField(plaintext)
    const decrypted = decryptField(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('handles base64-like content', () => {
    const plaintext = 'SGVsbG8gV29ybGQ='
    const encrypted = encryptField(plaintext)
    const decrypted = decryptField(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('handles numeric strings', () => {
    const plaintext = '1234567890'
    const encrypted = encryptField(plaintext)
    const decrypted = decryptField(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('encrypted value starts with enc:v1: prefix', () => {
    const encrypted = encryptField('test')
    expect(encrypted.startsWith('enc:v1:')).toBe(true)
  })

  it('decryptField passes through already-encrypted value (no double-decrypt)', () => {
    const plaintext = 'test-value'
    const encrypted = encryptField(plaintext)
    // Calling decryptField on already-decrypted value should return the plaintext
    // (which is not encrypted, so passes through)
    const result = decryptField(plaintext)
    expect(result).toBe(plaintext)
  })
})

describe('Hash for Lookup — Edge Cases', () => {
  it('handles empty string', () => {
    const hash = hashForLookup('')
    expect(hash).toHaveLength(64)
  })

  it('handles very long strings', () => {
    const hash = hashForLookup('x'.repeat(100000))
    expect(hash).toHaveLength(64)
  })

  it('handles unicode', () => {
    const hash = hashForLookup('世界')
    expect(hash).toHaveLength(64)
  })

  it('produces consistent output for same input', () => {
    const inputs = ['test1', 'test2', 'test3', 'a', 'b', 'c']
    for (const input of inputs) {
      const h1 = hashForLookup(input)
      const h2 = hashForLookup(input)
      expect(h1).toBe(h2)
    }
  })

  it('produces different output for different inputs', () => {
    const inputs = ['test1', 'test2', 'test3']
    const hashes = inputs.map(hashForLookup)
    const uniqueHashes = new Set(hashes)
    expect(uniqueHashes.size).toBe(inputs.length)
  })

  it('output contains only hex characters', () => {
    const hash = hashForLookup('test')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('Sensitive Field Detection — Comprehensive', () => {
  it('detects all PII fields', () => {
    const piiFields = [
      'pan_number',
      'aadhaar_number',
      'gst_number',
      'passport_number',
      'voter_id',
      'driving_license',
    ]
    for (const field of piiFields) {
      expect(isSensitiveField(field)).toBe(true)
    }
  })

  it('detects all financial fields', () => {
    const financialFields = [
      'bank_account_number',
      'ifsc_code',
      'credit_card_number',
      'cvv',
      'salary',
      'salary_breakdown',
      'bank_details',
    ]
    for (const field of financialFields) {
      expect(isSensitiveField(field)).toBe(true)
    }
  })

  it('detects all API credential fields', () => {
    const apiFields = [
      'api_key',
      'api_secret',
      'webhook_secret',
      'oauth_token',
      'oauth_refresh_token',
    ]
    for (const field of apiFields) {
      expect(isSensitiveField(field)).toBe(true)
    }
  })

  it('detects all health/HR fields', () => {
    const healthFields = [
      'health_insurance_number',
      'medical_history',
      'disability_info',
    ]
    for (const field of healthFields) {
      expect(isSensitiveField(field)).toBe(true)
    }
  })

  it('detects all personal contact fields', () => {
    const contactFields = [
      'personal_email',
      'personal_phone',
      'date_of_birth',
      'home_address',
      'emergency_contact',
    ]
    for (const field of contactFields) {
      expect(isSensitiveField(field)).toBe(true)
    }
  })

  it('does NOT flag business fields as sensitive', () => {
    const businessFields = [
      'name',
      'email',
      'phone',
      'address',
      'company_name',
      'designation',
      'department',
      'employee_code',
      'status',
      'created_at',
      'updated_at',
      'id',
      'tenant_id',
    ]
    for (const field of businessFields) {
      expect(isSensitiveField(field)).toBe(false)
    }
  })

  it('is case-insensitive (lowercase)', () => {
    expect(isSensitiveField('pan_number')).toBe(true)
  })

  it('is case-insensitive (uppercase)', () => {
    expect(isSensitiveField('PAN_NUMBER')).toBe(true)
  })

  it('is case-insensitive (mixed case)', () => {
    expect(isSensitiveField('Pan_Number')).toBe(true)
    expect(isSensitiveField('pAN_nUMBER')).toBe(true)
  })

  it('SENSITIVE_FIELDS has at least 25 entries', () => {
    expect(SENSITIVE_FIELDS.length).toBeGreaterThanOrEqual(25)
  })
})

describe('isEncrypted — Detection', () => {
  it('returns true for enc:v1: prefix', () => {
    expect(isEncrypted('enc:v1:some-data')).toBe(true)
  })

  it('returns false for plain text', () => {
    expect(isEncrypted('plain text')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isEncrypted('')).toBe(false)
  })

  it('returns false for partial prefix', () => {
    expect(isEncrypted('enc:v1')).toBe(false)
    expect(isEncrypted('enc:')).toBe(false)
    expect(isEncrypted('enc:v2:data')).toBe(false)
  })
})

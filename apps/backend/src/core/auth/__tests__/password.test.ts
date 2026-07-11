import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, checkPasswordStrength } from '../password'

describe('Password Hashing', () => {
  it('hashes a password and verifies it', async () => {
    const hash = await hashPassword('MySecurePass123!')
    expect(hash).not.toBe('MySecurePass123!')
    expect(hash.startsWith('$argon2id$')).toBe(true)

    const valid = await verifyPassword('MySecurePass123!', hash)
    expect(valid).toBe(true)
  })

  it('rejects wrong password', async () => {
    const hash = await hashPassword('CorrectPassword123!')
    const valid = await verifyPassword('WrongPassword123!', hash)
    expect(valid).toBe(false)
  })

  it('produces different hashes for same password (salt)', async () => {
    const hash1 = await hashPassword('SamePassword123!')
    const hash2 = await hashPassword('SamePassword123!')
    expect(hash1).not.toBe(hash2)
  })
})

describe('Password Strength Check', () => {
  it('rejects short password', () => {
    const result = checkPasswordStrength('Short1!')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must be at least 12 characters')
  })

  it('rejects password without uppercase', () => {
    const result = checkPasswordStrength('alllowercase123!')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one uppercase letter')
  })

  it('rejects password without digit', () => {
    const result = checkPasswordStrength('NoDigitsHere!')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one digit')
  })

  it('rejects password without special char', () => {
    const result = checkPasswordStrength('NoSpecialChars123')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password must contain at least one special character')
  })

  it('rejects common passwords', () => {
    const result = checkPasswordStrength('Password12345!')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('Password is too common')
  })

  it('accepts strong password', () => {
    const result = checkPasswordStrength('MyV3ryStr0ng!Pass')
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
    expect(result.score).toBe(5)
  })
})

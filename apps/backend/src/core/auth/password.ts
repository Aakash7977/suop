/**
 * @suop/backend — Password Hashing (Argon2id)
 *
 * Per Security Architecture §3.2:
 *   - Argon2id with memoryCost=19456 (19MB), timeCost=2, parallelism=1
 *   - ~250ms per hash on production hardware
 *   - Pepper stored in secrets manager (not in DB or code)
 */

import argon2 from 'argon2'
import { secrets } from '@/config/secrets'

// ─── Argon2id Parameters ────────────────────────────────────────────────────

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456, // 19 MB
  timeCost: 2,
  parallelism: 1,
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Hash a plaintext password using Argon2id with server-side pepper.
 *
 * Flow:
 *   1. Read pepper from secrets manager
 *   2. Append pepper to password: password + pepper
 *   3. Hash with Argon2id
 *   4. Return encoded hash string
 */
export async function hashPassword(plaintext: string): Promise<string> {
  const pepper = await getPepper()
  const peppered = `${plaintext}:${pepper}`
  return argon2.hash(peppered, ARGON2_OPTIONS)
}

/**
 * Verify a plaintext password against a stored hash.
 *
 * Flow:
 *   1. Read pepper from secrets manager
 *   2. Append pepper to password: password + pepper
 *   3. Verify with argon2.verify
 */
export async function verifyPassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  try {
    const pepper = await getPepper()
    const peppered = `${plaintext}:${pepper}`
    return argon2.verify(hash, peppered)
  } catch {
    // Invalid hash format or other error — fail closed
    return false
  }
}

/**
 * Check if a hash needs rehashing (parameters changed).
 * Used during login to upgrade old hashes.
 */
export function needsRehash(hash: string): boolean {
  // argon2 v0.44 doesn't expose decode; use needsRehashHash if available
  // or check parameters by re-verifying and catching errors
  try {
    // If the hash is valid, check if it starts with the expected params
    // argon2id hash format: $argon2id$v=19$m=19456,t=2,p=1$...
    return !hash.includes('m=19456,t=2,p=1')
  } catch {
    return true
  }
}

// ─── Pepper ─────────────────────────────────────────────────────────────────

async function getPepper(): Promise<string> {
  const pepper = await secrets.get<string>('PASSWORD_PEPPER')
  if (!pepper || pepper.length < 32) {
    // In development, use a default. In production, this should fail.
    if (process.env['NODE_ENV'] === 'production') {
      throw new Error('PASSWORD_PEPPER must be set in production (>= 32 chars)')
    }
    return 'dev-only-pepper-not-for-production-use-32chars'
  }
  return pepper
}

// ─── Password Strength ──────────────────────────────────────────────────────

export interface PasswordStrength {
  score: number // 0-5 (0=very weak, 5=excellent)
  valid: boolean
  issues: string[]
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const issues: string[] = []

  if (password.length < 12) {
    issues.push('Password must be at least 12 characters')
  }
  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter')
  }
  if (!/\d/.test(password)) {
    issues.push('Password must contain at least one digit')
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    issues.push('Password must contain at least one special character')
  }

  // Common password check (simplified — production would use HaveIBeenPwned API)
  const common = ['password', '12345678', 'qwerty123', 'letmein', 'welcome1']
  if (common.some((c) => password.toLowerCase().includes(c))) {
    issues.push('Password is too common')
  }

  const score = Math.max(0, 5 - issues.length)
  return {
    score,
    valid: issues.length === 0,
    issues,
  }
}

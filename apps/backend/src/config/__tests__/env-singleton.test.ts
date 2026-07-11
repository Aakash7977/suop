/**
 * Unit tests for the env singleton and convenience booleans.
 *
 * The env.ts module validates process.env at module load. The singleton
 * is already loaded by vitest.setup.ts with valid test values.
 *
 * For testing the error path (process.exit on validation failure), we
 * use dynamic imports with mocked process.exit and process.env.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  env,
  isProduction,
  isDevelopment,
  isStaging,
  isTest,
  isProduction as _isProd,
} from '../env'

describe('env singleton', () => {
  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(env)).toBe(true)
  })

  it('has PORT as a number', () => {
    expect(typeof env.PORT).toBe('number')
    expect(env.PORT).toBe(3030)
  })

  it('has NODE_ENV as test', () => {
    expect(env.NODE_ENV).toBe('test')
  })

  it('has DATABASE_URL starting with postgresql://', () => {
    expect(env.DATABASE_URL).toMatch(/^postgresql:\/\//)
  })

  it('has REDIS_URL starting with redis://', () => {
    expect(env.REDIS_URL).toMatch(/^redis:\/\//)
  })

  it('has JWT_SECRET of at least 32 chars', () => {
    expect(env.JWT_SECRET.length).toBeGreaterThanOrEqual(32)
  })

  it('has all required S3 fields', () => {
    expect(env.S3_ENDPOINT).toBeTruthy()
    expect(env.S3_BUCKET).toBeTruthy()
    expect(env.S3_ACCESS_KEY).toBeTruthy()
    expect(env.S3_SECRET_KEY).toBeTruthy()
  })

  it('has all required SMTP fields', () => {
    expect(env.SMTP_HOST).toBeTruthy()
    expect(env.SMTP_PORT).toBeGreaterThan(0)
    expect(env.SMTP_USER).toBeTruthy()
    expect(env.SMTP_PASS).toBeTruthy()
    expect(env.SMTP_FROM).toContain('@')
  })
})

describe('convenience booleans', () => {
  it('isTest is true when NODE_ENV is test', () => {
    expect(isTest).toBe(true)
  })

  it('isProduction is false in test env', () => {
    expect(isProduction).toBe(false)
    expect(_isProd).toBe(false)
  })

  it('isDevelopment is false in test env', () => {
    expect(isDevelopment).toBe(false)
  })

  it('isStaging is false in test env', () => {
    expect(isStaging).toBe(false)
  })

  it('exactly one environment boolean is true', () => {
    const truths = [isProduction, isDevelopment, isStaging, isTest].filter(Boolean)
    expect(truths.length).toBe(1)
  })
})

describe('env.ts — error path (process.exit on invalid env)', () => {
  const originalEnv = { ...process.env }
  const originalExit = process.exit

  beforeEach(() => {
    // Mock process.exit to throw so we can catch it
    process.exit = vi.fn((code?: number) => {
      throw new Error(`process.exit called with ${code}`)
    }) as never
  })

  afterEach(() => {
    // Restore
    process.env = { ...originalEnv }
    process.exit = originalExit
    vi.restoreAllMocks()
  })

  it('calls process.exit(1) when DATABASE_URL is missing', async () => {
    // Clear the env cache by re-importing with fresh env
    vi.resetModules()

    // Remove DATABASE_URL
    const envWithoutDb = { ...originalEnv }
    delete envWithoutDb['DATABASE_URL']
    process.env = envWithoutDb

    // Re-import — this triggers loadEnv() again
    await expect(async () => {
      await import('../env')
    }).rejects.toThrow(/process.exit called with 1/)

    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('calls process.exit(1) when JWT_SECRET is too short', async () => {
    vi.resetModules()

    const envWithShortSecret = { ...originalEnv }
    envWithShortSecret['JWT_SECRET'] = 'short'
    process.env = envWithShortSecret

    await expect(async () => {
      await import('../env')
    }).rejects.toThrow(/process.exit called with 1/)

    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('calls process.exit(1) when NODE_ENV is invalid', async () => {
    vi.resetModules()

    const envWithBadNodeEnv = { ...originalEnv }
    envWithBadNodeEnv['NODE_ENV'] = 'qa'
    process.env = envWithBadNodeEnv

    await expect(async () => {
      await import('../env')
    }).rejects.toThrow(/process.exit called with 1/)

    expect(process.exit).toHaveBeenCalledWith(1)
  })

  it('calls process.exit(1) when REDIS_URL has wrong protocol', async () => {
    vi.resetModules()

    const envWithBadRedis = { ...originalEnv }
    envWithBadRedis['REDIS_URL'] = 'http://localhost:6379'
    process.env = envWithBadRedis

    await expect(async () => {
      await import('../env')
    }).rejects.toThrow(/process.exit called with 1/)

    expect(process.exit).toHaveBeenCalledWith(1)
  })
})

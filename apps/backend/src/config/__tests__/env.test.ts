/**
 * Unit tests for the environment configuration module.
 *
 * Per Phase 0 Architecture §22:
 *   - Foundation code coverage ≥90%
 *   - Every public function tested
 *   - Edge cases covered
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { _parseForTest, _getSchema, type Env } from '../env'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** A valid, complete env object — tests start from this and mutate. */
function validEnv(): Record<string, string | undefined> {
  return {
    NODE_ENV: 'test',
    PORT: '3030',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/suop',
    DATABASE_POOL_SIZE: '10',
    DATABASE_STATEMENT_TIMEOUT_MS: '30000',
    DATABASE_LOG_QUERIES: 'false',
    REDIS_URL: 'redis://localhost:6379',
    JWT_SECRET: 'a'.repeat(32),
    JWT_ISSUER: 'suop-erp',
    JWT_AUDIENCE: 'suop-frontend',
    JWT_ACCESS_TTL_MIN: '15',
    JWT_REFRESH_TTL_DAYS: '30',
    S3_ENDPOINT: 'http://localhost:9000',
    S3_BUCKET: 'suop',
    S3_ACCESS_KEY: 'suop',
    S3_SECRET_KEY: 'suop_password',
    S3_REGION: 'ap-south-1',
    S3_FORCE_PATH_STYLE: 'true',
    SMTP_HOST: 'smtp.sendgrid.net',
    SMTP_PORT: '587',
    SMTP_USER: 'apikey',
    SMTP_PASS: 'password',
    SMTP_FROM: 'no-reply@sudhamrit.com',
    SENTRY_DSN: '',
    LOG_LEVEL: 'info',
    FEATURE_NEW_RECALL_ENGINE: 'false',
    FEATURE_WEBSOCKET_NOTIFICATIONS: 'false',
    FEATURE_AI_PREDICTIVE_QUALITY: 'false',
  }
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('env schema — happy path', () => {
  it('parses a valid env object', () => {
    const result = _parseForTest(validEnv())
    expect(result.NODE_ENV).toBe('test')
    expect(result.PORT).toBe(3030)
    expect(result.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/suop')
  })

  it('applies defaults for optional fields', () => {
    const env = validEnv()
    delete env['JWT_ISSUER']
    delete env['JWT_AUDIENCE']
    delete env['SMTP_FROM']
    delete env['LOG_LEVEL']
    const result = _parseForTest(env)
    expect(result.JWT_ISSUER).toBe('suop-erp')
    expect(result.JWT_AUDIENCE).toBe('suop-frontend')
    expect(result.SMTP_FROM).toBe('no-reply@sudhamrit.com')
    expect(result.LOG_LEVEL).toBe('info')
  })

  it('coerces numeric strings to numbers', () => {
    const result = _parseForTest(validEnv())
    expect(typeof result.PORT).toBe('number')
    expect(typeof result.DATABASE_POOL_SIZE).toBe('number')
    expect(typeof result.JWT_ACCESS_TTL_MIN).toBe('number')
  })

  it('coerces boolean-like strings to booleans', () => {
    const env = validEnv()
    env['DATABASE_LOG_QUERIES'] = 'true'
    env['S3_FORCE_PATH_STYLE'] = 'yes'
    env['FEATURE_NEW_RECALL_ENGINE'] = '1'
    const result = _parseForTest(env)
    expect(result.DATABASE_LOG_QUERIES).toBe(true)
    expect(result.S3_FORCE_PATH_STYLE).toBe(true)
    expect(result.FEATURE_NEW_RECALL_ENGINE).toBe(true)
  })

  it('treats unknown boolean values as false', () => {
    const env = validEnv()
    env['DATABASE_LOG_QUERIES'] = 'false'
    env['S3_FORCE_PATH_STYLE'] = 'no'
    const result = _parseForTest(env)
    expect(result.DATABASE_LOG_QUERIES).toBe(false)
    expect(result.S3_FORCE_PATH_STYLE).toBe(false)
  })
})

describe('env schema — required fields', () => {
  it('rejects missing DATABASE_URL', () => {
    const env = validEnv()
    delete env['DATABASE_URL']
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects missing REDIS_URL', () => {
    const env = validEnv()
    delete env['REDIS_URL']
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects missing JWT_SECRET', () => {
    const env = validEnv()
    delete env['JWT_SECRET']
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects missing S3_ENDPOINT', () => {
    const env = validEnv()
    delete env['S3_ENDPOINT']
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects missing S3_BUCKET', () => {
    const env = validEnv()
    delete env['S3_BUCKET']
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects missing SMTP_HOST', () => {
    const env = validEnv()
    delete env['SMTP_HOST']
    expect(() => _parseForTest(env)).toThrow()
  })
})

describe('env schema — format validation', () => {
  it('rejects DATABASE_URL with wrong protocol', () => {
    const env = validEnv()
    env['DATABASE_URL'] = 'mysql://user:pass@localhost:3306/suop'
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects REDIS_URL with wrong protocol', () => {
    const env = validEnv()
    env['REDIS_URL'] = 'http://localhost:6379'
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects JWT_SECRET shorter than 32 chars', () => {
    const env = validEnv()
    env['JWT_SECRET'] = 'short'
    expect(() => _parseForTest(env)).toThrow()
  })

  it('accepts JWT_SECRET of exactly 32 chars', () => {
    const env = validEnv()
    env['JWT_SECRET'] = 'x'.repeat(32)
    expect(() => _parseForTest(env)).not.toThrow()
  })

  it('rejects invalid NODE_ENV', () => {
    const env = validEnv()
    env['NODE_ENV'] = 'qa'
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects PORT out of range (0)', () => {
    const env = validEnv()
    env['PORT'] = '0'
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects PORT out of range (65536)', () => {
    const env = validEnv()
    env['PORT'] = '65536'
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects non-integer PORT', () => {
    const env = validEnv()
    env['PORT'] = '3030.5'
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects invalid SMTP_FROM email', () => {
    const env = validEnv()
    env['SMTP_FROM'] = 'not-an-email'
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects invalid LOG_LEVEL', () => {
    const env = validEnv()
    env['LOG_LEVEL'] = 'verbose'
    expect(() => _parseForTest(env)).toThrow()
  })

  it('accepts empty SENTRY_DSN (optional)', () => {
    const env = validEnv()
    env['SENTRY_DSN'] = ''
    expect(() => _parseForTest(env)).not.toThrow()
  })

  it('accepts valid SENTRY_DSN', () => {
    const env = validEnv()
    env['SENTRY_DSN'] = 'https://abc@example.com/123'
    expect(() => _parseForTest(env)).not.toThrow()
  })

  it('rejects invalid SENTRY_DSN', () => {
    const env = validEnv()
    env['SENTRY_DSN'] = 'not-a-url'
    expect(() => _parseForTest(env)).toThrow()
  })
})

describe('env schema — range validation', () => {
  it('rejects DATABASE_POOL_SIZE of 0', () => {
    const env = validEnv()
    env['DATABASE_POOL_SIZE'] = '0'
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects DATABASE_POOL_SIZE > 100', () => {
    const env = validEnv()
    env['DATABASE_POOL_SIZE'] = '101'
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects JWT_ACCESS_TTL_MIN of 0', () => {
    const env = validEnv()
    env['JWT_ACCESS_TTL_MIN'] = '0'
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects JWT_ACCESS_TTL_MIN > 60', () => {
    const env = validEnv()
    env['JWT_ACCESS_TTL_MIN'] = '61'
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects JWT_REFRESH_TTL_DAYS of 0', () => {
    const env = validEnv()
    env['JWT_REFRESH_TTL_DAYS'] = '0'
    expect(() => _parseForTest(env)).toThrow()
  })

  it('rejects JWT_REFRESH_TTL_DAYS > 365', () => {
    const env = validEnv()
    env['JWT_REFRESH_TTL_DAYS'] = '366'
    expect(() => _parseForTest(env)).toThrow()
  })
})

describe('env schema — type contract', () => {
  it('returns a fully-typed Env object', () => {
    const result: Env = _parseForTest(validEnv())
    // Type-level assertions (compile-time only)
    const _port: number = result.PORT
    const _url: string = result.DATABASE_URL
    const _env: 'development' | 'staging' | 'production' | 'test' = result.NODE_ENV
    expect(_port).toBe(3030)
    expect(_url).toContain('postgresql://')
    expect(_env).toBe('test')
  })
})

describe('env schema — schema introspection', () => {
  it('exposes the zod schema via _getSchema', () => {
    const schema = _getSchema()
    expect(schema).toBeDefined()
    expect(typeof schema.safeParse).toBe('function')
  })
})

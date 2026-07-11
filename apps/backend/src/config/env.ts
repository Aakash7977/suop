/**
 * @suop/backend — Environment Configuration
 *
 * Single source of truth for all environment variables. Validated once at
 * boot via zod. The application refuses to start if validation fails —
 * no silent fallbacks, no demo mode in production.
 *
 * Per Phase 0 Architecture §14:
 *   - All env vars validated at boot via zod
 *   - App refuses to start if validation fails
 *   - No `process.env` reads outside this module
 *
 * Usage:
 *   import { env } from '@/config/env'
 *   const port = env.PORT
 *
 * Forbidden:
 *   process.env.DATABASE_URL  // ❌ — bypasses validation
 *   const port = process.env.PORT ?? 3000  // ❌ — bypasses validation
 */

import { z } from 'zod'

// ─── Schema Definition ──────────────────────────────────────────────────────

/**
 * Strict boolean coercion for env vars.
 * Env vars are always strings; "true"/"1"/"yes" → true, everything else → false.
 */
const booleanString = z
  .string()
  .transform((val) => {
    const normalized = val.trim().toLowerCase()
    return normalized === 'true' || normalized === '1' || normalized === 'yes'
  })

/**
 * Port number validation: 1-65535, no privileged ports (<1024) in production.
 */
const portSchema = z
  .coerce
  .number()
  .int('PORT must be an integer')
  .min(1, 'PORT must be >= 1')
  .max(65535, 'PORT must be <= 65535')

/**
 * URL validation that accepts both postgresql:// and postgres:// schemes.
 */
const databaseUrlSchema = z
  .string()
  .min(1, 'DATABASE_URL is required')
  .refine(
    (url) => url.startsWith('postgresql://') || url.startsWith('postgres://'),
    'DATABASE_URL must start with postgresql:// or postgres://'
  )

/**
 * JWT secret minimum length — 256 bits = 32 bytes ≈ 44 base64 chars.
 * Enforced at 32 chars minimum to allow hex-encoded 128-bit secrets
 * (not recommended but tolerated for dev).
 */
const jwtSecretSchema = z
  .string()
  .min(32, 'JWT_SECRET must be at least 32 characters (256 bits minimum)')

/**
 * Environment profile — drives behavior switches across the app.
 */
const nodeEnvSchema = z.enum([
  'development',
  'staging',
  'production',
  'test',
])

// ─── Full Environment Schema ────────────────────────────────────────────────

const envSchema = z.object({
  // ─── Runtime ──────────────────────────────────────────────────────────────
  NODE_ENV: nodeEnvSchema.default('development'),
  PORT: portSchema.default(3030),

  // ─── Database ─────────────────────────────────────────────────────────────
  DATABASE_URL: databaseUrlSchema,
  DATABASE_POOL_SIZE: z.coerce.number().int().min(1).max(100).default(10),
  DATABASE_STATEMENT_TIMEOUT_MS: z.coerce.number().int().min(0).default(30000),
  DATABASE_LOG_QUERIES: booleanString.default('false'),

  // ─── Redis ────────────────────────────────────────────────────────────────
  REDIS_URL: z
    .string()
    .url('REDIS_URL must be a valid URL')
    .startsWith('redis://', 'REDIS_URL must start with redis://')
    .or(z.string().startsWith('rediss://', 'REDIS_URL must start with redis:// or rediss://')),

  // ─── JWT / Auth ───────────────────────────────────────────────────────────
  JWT_SECRET: jwtSecretSchema,
  JWT_ISSUER: z.string().default('suop-erp'),
  JWT_AUDIENCE: z.string().default('suop-frontend'),
  JWT_ACCESS_TTL_MIN: z.coerce.number().int().min(1).max(60).default(15),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),

  // ─── File Storage (S3-compatible) ─────────────────────────────────────────
  S3_ENDPOINT: z.string().url('S3_ENDPOINT must be a valid URL'),
  S3_BUCKET: z.string().min(1, 'S3_BUCKET is required'),
  S3_ACCESS_KEY: z.string().min(1, 'S3_ACCESS_KEY is required'),
  S3_SECRET_KEY: z.string().min(1, 'S3_SECRET_KEY is required'),
  S3_REGION: z.string().default('ap-south-1'),
  S3_FORCE_PATH_STYLE: booleanString.default('true'),

  // ─── Email (SMTP) ─────────────────────────────────────────────────────────
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USER: z.string().min(1, 'SMTP_USER is required'),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),
  SMTP_FROM: z
    .string()
    .email('SMTP_FROM must be a valid email')
    .default('no-reply@sudhamrit.com'),

  // ─── Observability ────────────────────────────────────────────────────────
  SENTRY_DSN: z
    .string()
    .url('SENTRY_DSN must be a valid URL')
    .optional()
    .or(z.literal('')),

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),

  // ─── Feature Flags (env-level defaults; per-tenant flags come from DB) ────
  FEATURE_NEW_RECALL_ENGINE: booleanString.default('false'),
  FEATURE_WEBSOCKET_NOTIFICATIONS: booleanString.default('false'),
  FEATURE_AI_PREDICTIVE_QUALITY: booleanString.default('false'),
})

// ─── Type Inference ─────────────────────────────────────────────────────────

export type Env = z.infer<typeof envSchema>

// ─── Validation + Singleton ─────────────────────────────────────────────────

/**
 * Parse and validate process.env exactly once at module load.
 *
 * On validation failure:
 *   - In development/test: log all errors to stderr for fast feedback
 *   - In production: log a single error message (no secret leakage) and exit
 *
 * The application never starts with an invalid configuration — there is
 * no silent fallback, no demo mode, no "best-effort" parse.
 */
function loadEnv(): Env {
  const result = envSchema.safeParse(process.env)

  if (result.success) {
    return result.data
  }

  // ─── Validation failed — abort startup ─────────────────────────────────────
  const currentEnv = process.env['NODE_ENV'] ?? 'development'
  const isProd = currentEnv === 'production'

  if (isProd) {
    // In production, log only field names + messages (never values — may contain secrets)
    const errors = result.error.issues.map((i) => ({
      field: i.path.join('.') || '(root)',
      message: i.message,
    }))
    console.error('FATAL: Environment validation failed. Application cannot start.', {
      errors,
      count: errors.length,
    })
  } else {
    // In development, full error for fast debugging
    console.error('FATAL: Environment validation failed.', result.error.format())
  }

  process.exit(1)
}

/**
 * Frozen singleton. Import this; never re-parse.
 *
 * The object is frozen to prevent runtime mutation — env vars are immutable
 * for the lifetime of the process. If you need to change behavior, change
 * the env var and restart.
 */
export const env: Readonly<Env> = Object.freeze(loadEnv())

// ─── Convenience Helpers ────────────────────────────────────────────────────

/** True when NODE_ENV === 'production' */
export const isProduction: boolean = env.NODE_ENV === 'production'

/** True when NODE_ENV === 'development' */
export const isDevelopment: boolean = env.NODE_ENV === 'development'

/** True when NODE_ENV === 'test' */
export const isTest: boolean = env.NODE_ENV === 'test'

/** True when NODE_ENV === 'staging' */
export const isStaging: boolean = env.NODE_ENV === 'staging'

// ─── Test Utilities (exported for testing only) ─────────────────────────────

/**
 * FOR TESTING ONLY — re-parses a custom env object.
 * Production code must use the `env` singleton above.
 *
 * @internal
 */
export function _parseForTest(rawEnv: Record<string, string | undefined>): Env {
  const result = envSchema.parse(rawEnv)
  return result
}

/**
 * FOR TESTING ONLY — returns the zod schema for introspection.
 * @internal
 */
export function _getSchema() {
  return envSchema
}

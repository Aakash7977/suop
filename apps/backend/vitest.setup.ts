/**
 * Vitest global setup — runs before any test file imports.
 *
 * The env.ts module validates process.env at module load and calls
 * process.exit(1) on failure. In tests, process.env doesn't have the
 * real values, so we inject valid test values here.
 *
 * Individual tests that need to test env validation use the _parseForTest()
 * helper which bypasses the singleton.
 */

const TEST_ENV: Record<string, string | undefined> = {
  NODE_ENV: 'test',
  PORT: '3030',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/suop_test',
  DATABASE_POOL_SIZE: '5',
  DATABASE_STATEMENT_TIMEOUT_MS: '5000',
  DATABASE_LOG_QUERIES: 'false',
  REDIS_URL: 'redis://localhost:6379',
  JWT_SECRET: 'test-secret-at-least-32-characters-long-for-testing',
  JWT_ISSUER: 'suop-erp-test',
  JWT_AUDIENCE: 'suop-frontend-test',
  JWT_ACCESS_TTL_MIN: '15',
  JWT_REFRESH_TTL_DAYS: '30',
  S3_ENDPOINT: 'http://localhost:9000',
  S3_BUCKET: 'suop-test',
  S3_ACCESS_KEY: 'test-access-key',
  S3_SECRET_KEY: 'test-secret-key',
  S3_REGION: 'ap-south-1',
  S3_FORCE_PATH_STYLE: 'true',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '1025',
  SMTP_USER: 'test',
  SMTP_PASS: 'test',
  SMTP_FROM: 'test@sudhamrit.com',
  SENTRY_DSN: '',
  LOG_LEVEL: 'warn',
  FEATURE_NEW_RECALL_ENGINE: 'false',
  FEATURE_WEBSOCKET_NOTIFICATIONS: 'false',
  FEATURE_AI_PREDICTIVE_QUALITY: 'false',
}

// In tests, always force-set env vars for determinism.
// Bun auto-loads .env from parent directories (the root Next.js .env has
// a SQLite DATABASE_URL that would fail our postgres:// validation).
for (const [key, value] of Object.entries(TEST_ENV)) {
  if (value !== undefined) {
    process.env[key] = value
  }
}

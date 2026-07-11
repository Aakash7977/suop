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
  // RC1 Fix Pack 2: Security + Performance env vars
  CORS_ALLOWED_ORIGINS: '',
  MAX_BODY_BYTES: '1048576',
  MAX_UPLOAD_BYTES: '52428800',
  REQUEST_TIMEOUT_MS: '30000',
  CACHE_TTL_PERMISSIONS: '300',
  CACHE_TTL_CONFIG: '60',
  CACHE_TTL_MASTER_DATA: '600',
  CACHE_TTL_DASHBOARD: '30',
  CACHE_TTL_ANALYTICS: '300',
  JOB_WORKER_ENABLED: 'false',
  JOB_WORKER_POLL_MS: '1000',
  JOB_MAX_CONCURRENT: '10',
  OTEL_EXPORTER_OTLP_ENDPOINT: '',
  OTEL_SERVICE_NAME: 'suop-backend-test',
  OTEL_SERVICE_VERSION: '1.0.0-rc1-test',
}

// In tests, always force-set env vars for determinism.
// Bun auto-loads .env from parent directories (the root Next.js .env has
// a SQLite DATABASE_URL that would fail our postgres:// validation).
for (const [key, value] of Object.entries(TEST_ENV)) {
  if (value !== undefined) {
    process.env[key] = value
  }
}

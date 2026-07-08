/**
 * @suop/config — Enterprise Configuration Framework
 * Sprint 2: Epic 1
 *
 * No configuration should ever be hardcoded. Everything must come from
 * environment variables, validated by Zod schemas.
 */

import { z } from 'zod';

// ─── Environment Profiles ──────────────────────────────
export type EnvironmentProfile =
  | 'development'
  | 'testing'
  | 'uat'
  | 'staging'
  | 'production';

// ─── Configuration Schema (Zod) ────────────────────────
const ConfigSchema = z.object({
  // ─── Application ──────────────────────────────────
  app: z.object({
    name: z.string().default('SUOP'),
    version: z.string().default('1.0.0'),
    environment: z.enum(['development', 'testing', 'uat', 'staging', 'production']).default('development'),
    port: z.coerce.number().default(3030),
    host: z.string().default('0.0.0.0'),
    timezone: z.string().default('Asia/Kolkata'),
    locale: z.string().default('en-IN'),
  }),

  // ─── Database ─────────────────────────────────────
  database: z.object({
    url: z.string().url().or(z.string().min(1)),
    host: z.string().default('localhost'),
    port: z.coerce.number().default(5432),
    name: z.string().default('suop'),
    user: z.string().default('suop'),
    password: z.string().default('suop_password'),
    schema: z.string().default('public'),
    poolMin: z.coerce.number().default(2),
    poolMax: z.coerce.number().default(10),
    ssl: z.boolean().default(false),
    logQueries: z.boolean().default(false),
  }),

  // ─── Redis ────────────────────────────────────────
  redis: z.object({
    host: z.string().default('localhost'),
    port: z.coerce.number().default(6379),
    password: z.string().optional(),
    db: z.coerce.number().default(0),
    keyPrefix: z.string().default('suop:'),
    defaultTTL: z.coerce.number().default(300), // 5 minutes
  }),

  // ─── RabbitMQ ─────────────────────────────────────
  rabbitmq: z.object({
    host: z.string().default('localhost'),
    port: z.coerce.number().default(5672),
    user: z.string().default('suop'),
    password: z.string().default('suop_password'),
    vhost: z.string().default('/'),
    prefetchCount: z.coerce.number().default(10),
    retryAttempts: z.coerce.number().default(3),
    retryDelay: z.coerce.number().default(5000), // 5 seconds
  }),

  // ─── Object Storage (MinIO/S3) ────────────────────
  storage: z.object({
    endpoint: z.string().default('localhost'),
    port: z.coerce.number().default(9000),
    accessKey: z.string().default('suop'),
    secretKey: z.string().default('suop_password'),
    bucket: z.string().default('suop'),
    region: z.string().default('us-east-1'),
    useSSL: z.boolean().default(false),
  }),

  // ─── Search (OpenSearch) ──────────────────────────
  search: z.object({
    host: z.string().default('localhost'),
    port: z.coerce.number().default(9200),
    username: z.string().optional(),
    password: z.string().optional(),
    useSSL: z.boolean().default(false),
  }),

  // ─── JWT ──────────────────────────────────────────
  jwt: z.object({
    secret: z.string().min(32, 'JWT secret must be at least 32 characters'),
    accessExpiry: z.string().default('15m'),
    refreshExpiry: z.string().default('7d'),
    issuer: z.string().default('suop'),
    audience: z.string().default('suop-users'),
    algorithm: z.string().default('RS256'),
  }),

  // ─── Mail ─────────────────────────────────────────
  mail: z.object({
    host: z.string().default('smtp.gmail.com'),
    port: z.coerce.number().default(587),
    user: z.string().optional(),
    password: z.string().optional(),
    fromName: z.string().default('SUOP'),
    fromAddress: z.string().default('noreply@sudhastar.com'),
    secure: z.boolean().default(false),
  }),

  // ─── SMS ──────────────────────────────────────────
  sms: z.object({
    provider: z.string().default('twilio'),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    senderId: z.string().default('SUOP'),
  }),

  // ─── AI ───────────────────────────────────────────
  ai: z.object({
    openaiApiKey: z.string().optional(),
    azureOpenaiApiKey: z.string().optional(),
    azureOpenaiEndpoint: z.string().optional(),
    geminiApiKey: z.string().optional(),
    anthropicApiKey: z.string().optional(),
    defaultModel: z.string().default('gpt-4-turbo'),
    maxTokensPerRequest: z.coerce.number().default(4000),
    costLimitPerDayUSD: z.coerce.number().default(100),
  }),

  // ─── Monitoring ───────────────────────────────────
  monitoring: z.object({
    prometheusEnabled: z.boolean().default(true),
    prometheusPort: z.coerce.number().default(9090),
    grafanaUrl: z.string().default('http://localhost:3001'),
    sentryDsn: z.string().optional(),
  }),

  // ─── Logging ──────────────────────────────────────
  logging: z.object({
    level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    format: z.enum(['json', 'text']).default('json'),
    output: z.array(z.enum(['console', 'file', 'loki'])).default(['console']),
    lokiUrl: z.string().default('http://localhost:3100'),
    logFile: z.string().default('./logs/suop.log'),
    redactPII: z.boolean().default(true),
  }),

  // ─── CORS ─────────────────────────────────────────
  cors: z.object({
    origins: z.array(z.string()).default(['http://localhost:3000']),
    credentials: z.boolean().default(true),
  }),

  // ─── Rate Limiting ────────────────────────────────
  rateLimit: z.object({
    enabled: z.boolean().default(true),
    windowMs: z.coerce.number().default(60000), // 1 minute
    max: z.coerce.number().default(100), // 100 requests per window
  }),
});

// ─── Config Type ────────────────────────────────────────
export type SUOPConfig = z.infer<typeof ConfigSchema>;

// ─── Configuration Service ─────────────────────────────
class ConfigurationService {
  private config: SUOPConfig;
  private static instance: ConfigurationService;

  private constructor() {
    this.config = this.load();
  }

  static getInstance(): ConfigurationService {
    if (!ConfigurationService.instance) {
      ConfigurationService.instance = new ConfigurationService();
    }
    return ConfigurationService.instance;
  }

  private load(): SUOPConfig {
    try {
      const rawConfig = {
        app: {
          name: process.env.APP_NAME || 'SUOP',
          version: process.env.APP_VERSION || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          port: process.env.BACKEND_PORT || 3030,
          host: process.env.APP_HOST || '0.0.0.0',
          timezone: process.env.APP_TIMEZONE || 'Asia/Kolkata',
          locale: process.env.APP_LOCALE || 'en-IN',
        },
        database: {
          url: process.env.DATABASE_URL || 'postgresql://suop:suop_password@localhost:5432/suop?schema=public',
          host: process.env.DATABASE_HOST || 'localhost',
          port: process.env.DATABASE_PORT || 5432,
          name: process.env.DATABASE_NAME || 'suop',
          user: process.env.DATABASE_USER || 'suop',
          password: process.env.DATABASE_PASSWORD || 'suop_password',
          schema: process.env.DATABASE_SCHEMA || 'public',
          poolMin: process.env.DATABASE_POOL_MIN || 2,
          poolMax: process.env.DATABASE_POOL_MAX || 10,
          ssl: process.env.DATABASE_SSL === 'true',
          logQueries: process.env.DATABASE_LOG_QUERIES === 'true',
        },
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD,
          db: process.env.REDIS_DB || 0,
          keyPrefix: process.env.REDIS_KEY_PREFIX || 'suop:',
          defaultTTL: process.env.REDIS_DEFAULT_TTL || 300,
        },
        rabbitmq: {
          host: process.env.RABBITMQ_HOST || 'localhost',
          port: process.env.RABBITMQ_PORT || 5672,
          user: process.env.RABBITMQ_USER || 'suop',
          password: process.env.RABBITMQ_PASSWORD || 'suop_password',
          vhost: process.env.RABBITMQ_VHOST || '/',
          prefetchCount: process.env.RABBITMQ_PREFETCH || 10,
          retryAttempts: process.env.RABBITMQ_RETRY_ATTEMPTS || 3,
          retryDelay: process.env.RABBITMQ_RETRY_DELAY || 5000,
        },
        storage: {
          endpoint: process.env.MINIO_HOST || 'localhost',
          port: process.env.MINIO_PORT || 9000,
          accessKey: process.env.MINIO_ACCESS_KEY || 'suop',
          secretKey: process.env.MINIO_SECRET_KEY || 'suop_password',
          bucket: process.env.MINIO_BUCKET || 'suop',
          region: process.env.MINIO_REGION || 'us-east-1',
          useSSL: process.env.MINIO_USE_SSL === 'true',
        },
        search: {
          host: process.env.OPENSEARCH_HOST || 'localhost',
          port: process.env.OPENSEARCH_PORT || 9200,
          username: process.env.OPENSEARCH_USERNAME,
          password: process.env.OPENSEARCH_PASSWORD,
          useSSL: process.env.OPENSEARCH_USE_SSL === 'true',
        },
        jwt: {
          secret: process.env.JWT_SECRET || 'suop-dev-secret-change-in-production-minimum-32-chars',
          accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
          refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
          issuer: process.env.JWT_ISSUER || 'suop',
          audience: process.env.JWT_AUDIENCE || 'suop-users',
          algorithm: process.env.JWT_ALGORITHM || 'RS256',
        },
        mail: {
          host: process.env.MAIL_HOST || 'smtp.gmail.com',
          port: process.env.MAIL_PORT || 587,
          user: process.env.MAIL_USER,
          password: process.env.MAIL_PASSWORD,
          fromName: process.env.MAIL_FROM_NAME || 'SUOP',
          fromAddress: process.env.MAIL_FROM_ADDRESS || 'noreply@sudhastar.com',
          secure: process.env.MAIL_SECURE === 'true',
        },
        sms: {
          provider: process.env.SMS_PROVIDER || 'twilio',
          apiKey: process.env.SMS_API_KEY,
          apiSecret: process.env.SMS_API_SECRET,
          senderId: process.env.SMS_SENDER_ID || 'SUOP',
        },
        ai: {
          openaiApiKey: process.env.OPENAI_API_KEY,
          azureOpenaiApiKey: process.env.AZURE_OPENAI_API_KEY,
          azureOpenaiEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
          geminiApiKey: process.env.GEMINI_API_KEY,
          anthropicApiKey: process.env.ANTHROPIC_API_KEY,
          defaultModel: process.env.AI_DEFAULT_MODEL || 'gpt-4-turbo',
          maxTokensPerRequest: process.env.AI_MAX_TOKENS || 4000,
          costLimitPerDayUSD: process.env.AI_COST_LIMIT || 100,
        },
        monitoring: {
          prometheusEnabled: process.env.PROMETHEUS_ENABLED !== 'false',
          prometheusPort: process.env.PROMETHEUS_PORT || 9090,
          grafanaUrl: process.env.GRAFANA_URL || 'http://localhost:3001',
          sentryDsn: process.env.SENTRY_DSN,
        },
        logging: {
          level: process.env.LOG_LEVEL || 'info',
          format: process.env.LOG_FORMAT || 'json',
          output: (process.env.LOG_OUTPUT || 'console').split(','),
          lokiUrl: process.env.LOKI_URL || 'http://localhost:3100',
          logFile: process.env.LOG_FILE || './logs/suop.log',
          redactPII: process.env.LOG_REDACT_PII !== 'false',
        },
        cors: {
          origins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
          credentials: process.env.CORS_CREDENTIALS !== 'false',
        },
        rateLimit: {
          enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
          windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000,
          max: process.env.RATE_LIMIT_MAX || 100,
        },
      };

      const result = ConfigSchema.safeParse(rawConfig);

      if (!result.success) {
        console.error('❌ Configuration validation failed:');
        console.error(JSON.stringify(result.error.format(), null, 2));
        throw new Error('Invalid configuration. Check environment variables.');
      }

      return result.data;
    } catch (error) {
      console.error('❌ Failed to load configuration:', error);
      throw error;
    }
  }

  get(): SUOPConfig {
    return this.config;
  }

  getEnvironment(): EnvironmentProfile {
    return this.config.app.environment as EnvironmentProfile;
  }

  isProduction(): boolean {
    return this.config.app.environment === 'production';
  }

  isDevelopment(): boolean {
    return this.config.app.environment === 'development';
  }

  isTesting(): boolean {
    return this.config.app.environment === 'testing';
  }

  reload(): SUOPConfig {
    this.config = this.load();
    return this.config;
  }
}

// ─── Export Singleton ───────────────────────────────────
export const config = ConfigurationService.getInstance();
export const getConfig = () => config.get();
export const isProd = () => config.isProduction();
export const isDev = () => config.isDevelopment();
export const isTest = () => config.isTesting();

// ─── Configuration Categories ──────────────────────────
export const ConfigCategories = {
  APPLICATION: 'app',
  DATABASE: 'database',
  REDIS: 'redis',
  RABBITMQ: 'rabbitmq',
  STORAGE: 'storage',
  SEARCH: 'search',
  JWT: 'jwt',
  MAIL: 'mail',
  SMS: 'sms',
  AI: 'ai',
  MONITORING: 'monitoring',
  LOGGING: 'logging',
  CORS: 'cors',
  RATE_LIMIT: 'rateLimit',
} as const;

// ─── Environment Profiles ───────────────────────────────
export const EnvironmentProfiles = {
  DEVELOPMENT: 'development',
  TESTING: 'testing',
  UAT: 'uat',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;

// ─── Default Export ─────────────────────────────────────
export default config;

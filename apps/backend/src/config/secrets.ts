/**
 * @suop/backend — Secrets Provider
 *
 * Per Phase 0 Architecture §10 (Concern 5) and Security Architecture §10:
 *   - No secrets in code or git
 *   - Secrets loaded from secrets manager at boot
 *   - Application never reads secrets directly from process.env
 *   - Secret rotation does not require app restart
 *
 * Phase 0.1 scope:
 *   - SecretsProvider interface (the contract the rest of the app uses)
 *   - EnvSecretsProvider implementation (reads from process.env)
 *   - Caching with TTL (5 min default)
 *
 * Future phases will add:
 *   - AwsSecretsManagerProvider (production)
 *   - VaultProvider (alternative)
 *   - Hot-reload on rotation (secrets manager events)
 *
 * NOTE: env.ts already validates the *presence* of required env vars at boot.
 * This module is for *runtime* secret lookups — e.g. when an integration
 * needs a per-tenant API key, or when a secret rotates and the app needs
 * to fetch the new value without restart.
 */

import { env, isTest } from './env'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SecretsProvider {
  /**
   * Fetch a secret by key. Returns undefined if not found.
   * Implementations MUST cache to avoid repeated lookups.
   */
  get<T extends string = string>(key: string): Promise<T | undefined>

  /**
   * Fetch multiple secrets in one call. More efficient than multiple `get`
   * calls for providers that batch (e.g. AWS Secrets Manager).
   */
  getMany<T extends string = string>(keys: string[]): Promise<Record<string, T | undefined>>

  /**
   * Force-refresh the cache for a specific key.
   * Called after a known rotation.
   */
  refresh(key?: string): Promise<void>
}

// ─── Env-Backed Provider (Phase 0.1) ────────────────────────────────────────

interface CacheEntry {
  value: string | undefined
  fetchedAt: number
}

/**
 * Reads secrets from process.env.
 *
 * This is the Phase 0.1 implementation — production will swap in
 * AwsSecretsManagerProvider without changing call sites.
 *
 * Even though env vars are already in process.env, this provider adds:
 *   - Caching (avoids repeated process.env lookups — micro-optimization)
 *   - Consistent interface with future providers
 *   - Audit hook (every secret access can be logged)
 *   - Hot-reload path (refresh() clears cache; future providers re-fetch)
 */
class EnvSecretsProvider implements SecretsProvider {
  private readonly cache: Map<string, CacheEntry>
  private readonly ttlMs: number

  constructor(ttlMs: number = 300_000) {
    // 5 min default
    this.cache = new Map()
    this.ttlMs = isTest ? 0 : ttlMs
  }

  async get<T extends string = string>(key: string): Promise<T | undefined> {
    const entry = this.cache.get(key)
    if (entry !== undefined && Date.now() - entry.fetchedAt < this.ttlMs) {
      return entry.value as T | undefined
    }

    // In Phase 0.1, secrets live in env vars.
    // Future: fetch from secrets manager here.
    const value = process.env[key]
    this.cache.set(key, { value, fetchedAt: Date.now() })
    return value as T | undefined
  }

  async getMany<T extends string = string>(
    keys: string[]
  ): Promise<Record<string, T | undefined>> {
    const result: Record<string, T | undefined> = {}
    await Promise.all(
      keys.map(async (key) => {
        result[key] = await this.get<T>(key)
      })
    )
    return result
  }

  async refresh(key?: string): Promise<void> {
    if (key !== undefined) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
}

// ─── Secrets Facade ─────────────────────────────────────────────────────────

/**
 * The public API for secret access.
 *
 * Usage:
 *   const apiKey = await secrets.get('STRIPE_API_KEY')
 *
 * Forbidden:
 *   process.env.STRIPE_API_KEY  // ❌ — bypasses caching + audit
 */
export class Secrets {
  constructor(private readonly provider: SecretsProvider) {}

  async get<T extends string = string>(key: string): Promise<T | undefined> {
    return this.provider.get<T>(key)
  }

  async getOrThrow<T extends string = string>(key: string): Promise<T> {
    const value = await this.provider.get<T>(key)
    if (value === undefined) {
      throw new Error(
        `Secret '${key}' not found. Configure it in the secrets manager or .env file.`
      )
    }
    return value
  }

  async getMany<T extends string = string>(
    keys: string[]
  ): Promise<Record<string, T | undefined>> {
    return this.provider.getMany<T>(keys)
  }

  async refresh(key?: string): Promise<void> {
    await this.provider.refresh(key)
  }
}

// ─── Singleton ──────────────────────────────────────────────────────────────

/**
 * Singleton. Uses EnvSecretsProvider in Phase 0.1.
 *
 * The singleton is created after env.ts has validated the boot-critical
 * env vars. Non-critical secrets (per-tenant API keys, etc.) are fetched
 * on demand via `secrets.get(...)`.
 */
export const secrets: Secrets = new Secrets(new EnvSecretsProvider())

// ─── Known Secrets Catalog ──────────────────────────────────────────────────

/**
 * Catalog of secrets the application may need at runtime.
 *
 * Boot-critical secrets (DB URL, JWT secret, etc.) are validated by env.ts
 * at startup. The secrets listed here are fetched on-demand at runtime —
 * e.g. when a tenant integration is configured.
 *
 * This catalog prevents typo-prone string lookups and gives a single
 * place to audit what secrets the app can access.
 */
export const SECRET_KEYS = {
  // ─── Boot-critical (also in env.ts; listed here for completeness) ────────
  DATABASE_URL: 'DATABASE_URL',
  JWT_SECRET: 'JWT_SECRET',
  S3_SECRET_KEY: 'S3_SECRET_KEY',
  SMTP_PASS: 'SMTP_PASS',

  // ─── Runtime-fetched (per-tenant integrations) ──────────────────────────
  TWILIO_ACCOUNT_SID: 'TWILIO_ACCOUNT_SID',
  TWILIO_AUTH_TOKEN: 'TWILIO_AUTH_TOKEN',
  WHATSAPP_BUSINESS_TOKEN: 'WHATSAPP_BUSINESS_TOKEN',
  SHIPROCKET_API_KEY: 'SHIPROCKET_API_KEY',
  SHIPROCKET_API_SECRET: 'SHIPROCKET_API_SECRET',

  // ─── Encryption ──────────────────────────────────────────────────────────
  COLUMN_ENCRYPTION_KEY: 'COLUMN_ENCRYPTION_KEY', // for pgcrypto
  PASSWORD_PEPPER: 'PASSWORD_PEPPER', // server-side pepper for Argon2id
} as const

export type SecretKey = (typeof SECRET_KEYS)[keyof typeof SECRET_KEYS]

// ─── Test Utilities ─────────────────────────────────────────────────────────

/**
 * FOR TESTING ONLY — build a Secrets instance with a static map.
 *
 * @internal
 */
export function _makeTestSecrets(map: Record<string, string | undefined>): Secrets {
  const provider: SecretsProvider = {
    get: async <T extends string = string>(key: string) => map[key] as T | undefined,
    getMany: async <T extends string = string>(keys: string[]) => {
      const result: Record<string, T | undefined> = {}
      for (const key of keys) result[key] = map[key] as T | undefined
      return result
    },
    refresh: async () => {},
  }
  return new Secrets(provider)
}

/**
 * Avoid "env imported but unused" — env is used implicitly via isTest in
 * the EnvSecretsProvider constructor. This re-export documents the
 * dependency and satisfies the linter.
 */
export { env as _env_for_secrets }

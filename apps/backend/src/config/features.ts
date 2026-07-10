/**
 * @suop/backend — Feature Flags
 *
 * Per Phase 0 Architecture §14.2:
 *   - Feature flags stored in DB (per-tenant), cached in memory
 *   - Refreshable via admin API
 *   - Checked in code via `features.isEnabled(ctx.tenantId, 'FLAG_NAME')`
 *
 * Phase 0.1 scope: interface + env-backed implementation.
 *   - Flags read from env vars (global defaults)
 *   - In-memory cache (no DB yet — DB arrives in Phase 0.3)
 *   - Cache TTL: 60 seconds (configurable)
 *
 * Future phases will add:
 *   - DB-backed per-tenant flags (Phase 0.3+)
 *   - Admin API for runtime flag changes (Phase 1+)
 *   - Redis pub/sub for cross-instance cache invalidation (when scaling)
 */

import { env, isTest } from './env'

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * A feature flag value.
 *   - `true`  → flag is enabled for everyone
 *   - `false` → flag is disabled for everyone
 *   - string[] → flag is enabled only for listed tenant IDs (allowlist)
 */
export type FlagValue = boolean | string[]

export interface FeatureFlag {
  /** Stable identifier, e.g. 'NEW_RECALL_ENGINE' */
  name: string
  /** Human-readable description for admin UI */
  description: string
  /** Current resolved value */
  value: FlagValue
  /** When the flag was last updated (epoch ms) */
  updatedAt: number
  /** Who updated it (user ID, or 'system' for env-driven defaults) */
  updatedBy: string
}

export interface FeatureFlagProvider {
  /** Read a single flag. Returns undefined if flag does not exist. */
  get(name: string): Promise<FlagValue | undefined>
  /** Read all flags. */
  list(): Promise<Record<string, FlagValue>>
  /** Refresh the underlying cache. Called periodically. */
  refresh(): Promise<void>
}

// ─── Catalog of Known Flags ─────────────────────────────────────────────────

/**
 * All feature flags used in the codebase MUST be declared here.
 * This prevents typos (e.g. `features.isEnabled('NEW_RECALL_ENGIN')`)
 * and gives a single place to audit what flags exist.
 *
 * The catalog is also used to generate the admin UI's flag list.
 */
export const FLAG_CATALOG = {
  NEW_RECALL_ENGINE: {
    description:
      'Use the new recall engine that leverages batch genealogy for instant identification.',
    defaultValue: env.FEATURE_NEW_RECALL_ENGINE,
  },
  WEBSOCKET_NOTIFICATIONS: {
    description:
      'Push notifications to the frontend in real-time via WebSocket instead of polling.',
    defaultValue: env.FEATURE_WEBSOCKET_NOTIFICATIONS,
  },
  AI_PREDICTIVE_QUALITY: {
    description:
      'Enable AI-based predictive quality analysis on production batches.',
    defaultValue: env.FEATURE_AI_PREDICTIVE_QUALITY,
  },
} as const

export type FlagName = keyof typeof FLAG_CATALOG

// ─── Env-Backed Provider (Phase 0.1) ────────────────────────────────────────

/**
 * Reads flag values from env vars.
 *
 * This is the Phase 0.1 implementation — flags are global (not per-tenant)
 * and read once at boot. Changing a flag requires a restart.
 *
 * When Phase 0.3 lands the database, this will be replaced by a
 * DatabaseFlagProvider that reads from a `feature_flags` table, with
 * env values used only as the seed/default.
 */
class EnvFlagProvider implements FeatureFlagProvider {
  private readonly cache: Map<string, FlagValue>
  private lastRefreshedAt: number

  constructor() {
    this.cache = new Map()
    this.lastRefreshedAt = 0
    // Load immediately so first call is fast.
    void this.refresh()
  }

  async get(name: string): Promise<FlagValue | undefined> {
    await this.ensureFresh()
    return this.cache.get(name)
  }

  async list(): Promise<Record<string, FlagValue>> {
    await this.ensureFresh()
    const result: Record<string, FlagValue> = {}
    for (const [key, value] of this.cache.entries()) {
      result[key] = value
    }
    return result
  }

  async refresh(): Promise<void> {
    // In Phase 0.1, flags are read from env vars (already validated by env.ts).
    // Future: read from DB, fall back to env defaults.
    for (const [name, def] of Object.entries(FLAG_CATALOG)) {
      this.cache.set(name, def.defaultValue)
    }
    this.lastRefreshedAt = Date.now()
  }

  private async ensureFresh(): Promise<void> {
    const ttlMs = isTest ? 0 : 60_000 // 60s in prod, 0s in test (always fresh)
    if (Date.now() - this.lastRefreshedAt > ttlMs) {
      await this.refresh()
    }
  }
}

// ─── FeatureFlags Service ───────────────────────────────────────────────────

/**
 * The public API for feature flag checks.
 *
 * Usage:
 *   if (await features.isEnabled(ctx.tenantId, 'NEW_RECALL_ENGINE')) {
 *     // use new engine
 *   }
 *
 * The `tenantId` parameter is accepted even in Phase 0.1 (where flags are
 * global) so call sites don't need to change when DB-backed per-tenant
 * flags arrive.
 */
export class FeatureFlags {
  constructor(private readonly provider: FeatureFlagProvider) {}

  /**
   * Returns true if the flag is enabled for the given tenant.
   *
   * Resolution order:
   *   1. Flag value is `boolean` → return it
   *   2. Flag value is `string[]` (allowlist) → return tenantId in list
   *   3. Flag is unknown → return false (fail closed — never enable unknown flags)
   */
  async isEnabled(tenantId: string, name: FlagName | string): Promise<boolean> {
    const value = await this.provider.get(name)
    if (value === undefined) {
      // Unknown flag — fail closed.
      return false
    }
    if (typeof value === 'boolean') {
      return value
    }
    // Array — tenant allowlist
    return value.includes(tenantId)
  }

  /** Returns the raw flag value (boolean or tenant allowlist). */
  async getValue(name: FlagName | string): Promise<FlagValue | undefined> {
    return this.provider.get(name)
  }

  /** Returns all flags with metadata. Used by admin UI. */
  async list(): Promise<Record<string, FlagValue>> {
    return this.provider.list()
  }

  /** Forces a cache refresh. Called by admin API after flag updates. */
  async refresh(): Promise<void> {
    await this.provider.refresh()
  }
}

// ─── Singleton ──────────────────────────────────────────────────────────────

/**
 * Singleton instance. Uses EnvFlagProvider in Phase 0.1.
 *
 * Tests should construct their own FeatureFlags instance with a mock provider
 * rather than importing this singleton.
 */
export const features: FeatureFlags = new FeatureFlags(new EnvFlagProvider())

// ─── Test Utilities ─────────────────────────────────────────────────────────

/**
 * FOR TESTING ONLY — build a FeatureFlags with a static in-memory provider.
 *
 * Example:
 *   const ff = _makeTestFeatureFlags({ NEW_RECALL_ENGINE: true })
 *   expect(await ff.isEnabled('t1', 'NEW_RECALL_ENGINE')).toBe(true)
 *
 * @internal
 */
export function _makeTestFeatureFlags(
  flags: Record<string, FlagValue>
): FeatureFlags {
  const provider: FeatureFlagProvider = {
    get: async (name) => flags[name],
    list: async () => ({ ...flags }),
    refresh: async () => {},
  }
  return new FeatureFlags(provider)
}

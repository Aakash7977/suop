/**
 * @suop/backend — Configuration Framework (Phase 0.1)
 *
 * Public surface:
 *   - env: validated environment variables (singleton)
 *   - features: feature flag service
 *   - secrets: runtime secret provider
 *   - isProduction / isDevelopment / isStaging / isTest: convenience booleans
 *
 * Per Phase 0 Architecture §14:
 *   - All configuration sources prioritized: env vars > DB > defaults
 *   - App refuses to start on invalid configuration
 *   - No `process.env` reads outside this module
 */

// ─── Environment ────────────────────────────────────────────────────────────
export {
  env,
  isProduction,
  isDevelopment,
  isStaging,
  isTest,
  type Env,
  // Test utilities (exported but prefixed with _)
  _parseForTest,
  _getSchema,
} from './env'

// ─── Feature Flags ──────────────────────────────────────────────────────────
export {
  features,
  FeatureFlags,
  FLAG_CATALOG,
  type FlagName,
  type FlagValue,
  type FeatureFlag,
  type FeatureFlagProvider,
  _makeTestFeatureFlags,
} from './features'

// ─── Secrets ────────────────────────────────────────────────────────────────
export {
  secrets,
  Secrets,
  SECRET_KEYS,
  type SecretKey,
  type SecretsProvider,
  _makeTestSecrets,
} from './secrets'

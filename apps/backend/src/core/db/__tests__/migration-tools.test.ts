/**
 * Migration Tools Tests
 *
 * Tests for migration file loading, checksum computation, drift detection,
 * and migration guidance.
 */

import { describe, it, expect } from 'vitest'
import {
  loadMigrationFiles,
  detectDrift,
  getMigrationGuidance,
  getRollbackStrategy,
  type MigrationFile,
  type MigrationRecord,
} from '@/core/db/migration-tools'

describe('Migration Tools — File Loading', () => {
  it('loads migration files from disk', () => {
    const files = loadMigrationFiles()
    expect(files.length).toBeGreaterThanOrEqual(19)
  })

  it('each file has an id (numeric prefix)', () => {
    const files = loadMigrationFiles()
    for (const file of files) {
      expect(file.id).toMatch(/^\d+$/)
    }
  })

  it('each file has a name ending in .sql', () => {
    const files = loadMigrationFiles()
    for (const file of files) {
      expect(file.name).toMatch(/\.sql$/)
    }
  })

  it('each file has a non-empty SQL content', () => {
    const files = loadMigrationFiles()
    for (const file of files) {
      expect(file.sql.length).toBeGreaterThan(0)
    }
  })

  it('each file has a 64-char SHA-256 checksum', () => {
    const files = loadMigrationFiles()
    for (const file of files) {
      expect(file.checksum).toHaveLength(64)
      expect(file.checksum).toMatch(/^[0-9a-f]{64}$/)
    }
  })

  it('files are sorted by ID', () => {
    const files = loadMigrationFiles()
    for (let i = 1; i < files.length; i++) {
      expect(Number(files[i]!.id)).toBeGreaterThanOrEqual(Number(files[i - 1]!.id))
    }
  })

  it('each file has a size (bytes)', () => {
    const files = loadMigrationFiles()
    for (const file of files) {
      expect(file.size).toBeGreaterThan(0)
    }
  })
})

describe('Migration Tools — Drift Detection', () => {
  it('returns empty array when checksums match', () => {
    const file: MigrationFile = {
      id: '0001',
      name: '0001_init.sql',
      path: '/migrations/0001_init.sql',
      sql: 'CREATE TABLE foo;',
      checksum: 'abc123',
      size: 100,
    }
    const record: MigrationRecord = {
      id: '0001',
      name: '0001_init.sql',
      checksum: 'abc123',
      appliedAt: new Date(),
      durationMs: 500,
      success: true,
    }
    const drift = detectDrift([file], [record])
    expect(drift).toHaveLength(0)
  })

  it('detects drift when checksums differ', () => {
    const file: MigrationFile = {
      id: '0001',
      name: '0001_init.sql',
      path: '/migrations/0001_init.sql',
      sql: 'CREATE TABLE bar;',
      checksum: 'new-hash',
      size: 100,
    }
    const record: MigrationRecord = {
      id: '0001',
      name: '0001_init.sql',
      checksum: 'old-hash',
      appliedAt: new Date(),
      durationMs: 500,
      success: true,
    }
    const drift = detectDrift([file], [record])
    expect(drift).toHaveLength(1)
    expect(drift[0]!.id).toBe('0001')
  })

  it('returns empty array when no applied migrations', () => {
    const file: MigrationFile = {
      id: '0001',
      name: '0001_init.sql',
      path: '/migrations/0001_init.sql',
      sql: 'CREATE TABLE foo;',
      checksum: 'abc123',
      size: 100,
    }
    const drift = detectDrift([file], [])
    expect(drift).toHaveLength(0)
  })
})

describe('Migration Tools — Migration Guidance', () => {
  it('returns simple pattern for safe migrations', () => {
    const file: MigrationFile = {
      id: '0001',
      name: '0001_init.sql',
      path: '/migrations/0001_init.sql',
      sql: 'CREATE TABLE IF NOT EXISTS foo (id UUID PRIMARY KEY);',
      checksum: 'abc',
      size: 100,
    }
    const guidance = getMigrationGuidance(file)
    expect(guidance.pattern).toBe('simple')
    expect(guidance.steps.length).toBeGreaterThan(0)
  })

  it('returns expand_migrate_contract for DROP COLUMN', () => {
    const file: MigrationFile = {
      id: '0002',
      name: '0002_drop.sql',
      path: '/migrations/0002_drop.sql',
      sql: 'ALTER TABLE foo DROP COLUMN old_col;',
      checksum: 'abc',
      size: 100,
    }
    const guidance = getMigrationGuidance(file)
    expect(guidance.pattern).toBe('expand_migrate_contract')
  })

  it('returns expand_migrate_contract for DROP TABLE', () => {
    const file: MigrationFile = {
      id: '0003',
      name: '0003_drop_table.sql',
      path: '/migrations/0003_drop_table.sql',
      sql: 'DROP TABLE old_table;',
      checksum: 'abc',
      size: 100,
    }
    const guidance = getMigrationGuidance(file)
    expect(guidance.pattern).toBe('expand_migrate_contract')
  })

  it('returns expand_migrate_contract for RENAME COLUMN', () => {
    const file: MigrationFile = {
      id: '0004',
      name: '0004_rename.sql',
      path: '/migrations/0004_rename.sql',
      sql: 'ALTER TABLE foo RENAME COLUMN old_name TO new_name;',
      checksum: 'abc',
      size: 100,
    }
    const guidance = getMigrationGuidance(file)
    expect(guidance.pattern).toBe('expand_migrate_contract')
  })

  it('returns expand_contract for NOT NULL without DEFAULT', () => {
    const file: MigrationFile = {
      id: '0005',
      name: '0005_add_not_null.sql',
      path: '/migrations/0005_add_not_null.sql',
      sql: 'ALTER TABLE foo ADD COLUMN bar TEXT NOT NULL;',
      checksum: 'abc',
      size: 100,
    }
    const guidance = getMigrationGuidance(file)
    expect(guidance.pattern).toBe('expand_contract')
  })

  it('guidance always has steps array', () => {
    const file: MigrationFile = {
      id: '0001',
      name: '0001_init.sql',
      path: '/migrations/0001_init.sql',
      sql: 'SELECT 1;',
      checksum: 'abc',
      size: 100,
    }
    const guidance = getMigrationGuidance(file)
    expect(Array.isArray(guidance.steps)).toBe(true)
    expect(guidance.steps.length).toBeGreaterThan(0)
  })

  it('guidance has a description', () => {
    const file: MigrationFile = {
      id: '0001',
      name: '0001_init.sql',
      path: '/migrations/0001_init.sql',
      sql: 'SELECT 1;',
      checksum: 'abc',
      size: 100,
    }
    const guidance = getMigrationGuidance(file)
    expect(guidance.description).toBeTruthy()
  })
})

describe('Migration Tools — Rollback Strategy', () => {
  it('returns restore_backup strategy when no .down.sql file exists', () => {
    const file: MigrationFile = {
      id: '0001',
      name: '0001_init.sql',
      path: '/nonexistent/0001_init.sql',
      sql: 'SELECT 1;',
      checksum: 'abc',
      size: 100,
    }
    const strategy = getRollbackStrategy(file)
    expect(strategy.hasDownMigration).toBe(false)
    expect(strategy.strategy).toBe('restore_backup')
  })

  it('returns strategy description', () => {
    const file: MigrationFile = {
      id: '0001',
      name: '0001_init.sql',
      path: '/nonexistent/0001_init.sql',
      sql: 'SELECT 1;',
      checksum: 'abc',
      size: 100,
    }
    const strategy = getRollbackStrategy(file)
    expect(strategy.description).toBeTruthy()
  })

  it('returns migration ID', () => {
    const file: MigrationFile = {
      id: '0001',
      name: '0001_init.sql',
      path: '/nonexistent/0001_init.sql',
      sql: 'SELECT 1;',
      checksum: 'abc',
      size: 100,
    }
    const strategy = getRollbackStrategy(file)
    expect(strategy.migrationId).toBe('0001')
  })
})

describe('Migration Tools — Actual Migrations', () => {
  it('all 19 migrations are loadable', () => {
    const files = loadMigrationFiles()
    expect(files.length).toBe(19)
  })

  it('first migration is 0001_init.sql', () => {
    const files = loadMigrationFiles()
    expect(files[0]!.name).toBe('0001_init.sql')
  })

  it('last migration is 0019_bi_analytics.sql', () => {
    const files = loadMigrationFiles()
    expect(files[files.length - 1]!.name).toBe('0019_bi_analytics.sql')
  })

  it('all migrations have unique IDs', () => {
    const files = loadMigrationFiles()
    const ids = files.map((f) => f.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('all migrations have unique checksums', () => {
    const files = loadMigrationFiles()
    const checksums = files.map((f) => f.checksum)
    const uniqueChecksums = new Set(checksums)
    expect(uniqueChecksums.size).toBe(checksums.length)
  })

  it('all migrations use IF NOT EXISTS (idempotent)', () => {
    const files = loadMigrationFiles()
    for (const file of files) {
      // Check that CREATE TABLE statements use IF NOT EXISTS
      const hasCreateTable = /CREATE\s+TABLE/i.test(file.sql)
      const hasIfNotExists = /IF\s+NOT\s+EXISTS/i.test(file.sql)
      if (hasCreateTable) {
        expect(hasIfNotExists).toBe(true)
      }
    }
  })
})

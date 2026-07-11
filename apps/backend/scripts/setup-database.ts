/**
 * Task 1: Database Provisioning + Migration + Seed
 *
 * Uses PGlite (real PostgreSQL compiled to WASM) as the database.
 * PGlite IS PostgreSQL — same C source, same SQL syntax, same features
 * (UUID, JSONB, RLS, etc.). Production will use Supabase managed PostgreSQL.
 */

import { PGlite } from '@electric-sql/pglite'
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

const DB_DIR = join(process.cwd(), 'db')
const MIGRATION_FILE = join(process.cwd(), 'prisma', 'migrations', '0001_init.sql')
const TENANT_ID = '00000000-0000-0000-0000-000000000001'

async function main() {
  console.log('════════════════════════════════════════════════════════════')
  console.log('  TASK 1: Database Provisioning + Migration + Seed')
  console.log('════════════════════════════════════════════════════════════')
  console.log()

  console.log('▸ Initializing PGlite (PostgreSQL WASM)...')
  if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true })
  const db = new PGlite({ dataDir: DB_DIR })
  await db.waitReady
  console.log('  ✓ PGlite started successfully')
  console.log()

  console.log('▸ Migration status (before):')
  const tablesBefore = await db.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  )
  console.log(`  Tables before migration: ${tablesBefore.rows.length}`)
  console.log()

  console.log('▸ Applying migration: 0001_init.sql')
  const migrationSql = readFileSync(MIGRATION_FILE, 'utf-8')
  await db.exec(migrationSql)
  console.log('  ✓ Migration applied successfully')
  console.log()

  console.log('▸ Verifying foundation tables...')
  const tablesAfter = await db.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  )
  const expectedTables = [
    'audit_logs', 'background_jobs', 'event_outbox', 'feature_flags',
    'file_uploads', 'idempotency_keys', 'notification_outbox', 'refresh_tokens',
  ]
  const actualTables = tablesAfter.rows.map((r: { tablename: string }) => r.tablename)
  let allPresent = true
  for (const expected of expectedTables) {
    if (actualTables.includes(expected)) {
      console.log(`  ✓ ${expected}`)
    } else {
      console.log(`  ✗ ${expected} — MISSING`)
      allPresent = false
    }
  }
  console.log()

  console.log('▸ Verifying indexes...')
  const indexes = await db.query(
    `SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname`
  )
  console.log(`  ✓ ${indexes.rows.length} indexes created`)
  console.log()

  console.log('▸ Seeding default data...')
  for (const flag of [
    { name: 'NEW_RECALL_ENGINE', desc: 'Use the new recall engine that leverages batch genealogy for instant identification.' },
    { name: 'WEBSOCKET_NOTIFICATIONS', desc: 'Push notifications to the frontend in real-time via WebSocket instead of polling.' },
    { name: 'AI_PREDICTIVE_QUALITY', desc: 'Enable AI-based predictive quality analysis on production batches.' },
  ]) {
    await db.query(
      `INSERT INTO feature_flags (id, tenant_id, flag_name, value, description, updated_at, created_at)
       VALUES ($1, $2, $3, $4::jsonb, $5, NOW(), NOW())
       ON CONFLICT (tenant_id, flag_name) DO NOTHING`,
      [randomUUID(), TENANT_ID, flag.name, 'false', flag.desc]
    )
    console.log(`  ✓ Seeded feature flag: ${flag.name} = false`)
  }
  console.log()

  console.log('▸ Table row counts (after seed):')
  for (const table of expectedTables) {
    const count = await db.query(`SELECT COUNT(*) as cnt FROM ${table}`)
    console.log(`  ${table}: ${count.rows[0]!.cnt} rows`)
  }
  console.log()

  console.log('▸ Migration status:')
  console.log('  Migration ID: 0001_init')
  console.log('  Applied at: ' + new Date().toISOString())
  console.log('  Tables created: ' + expectedTables.length)
  console.log('  Indexes created: ' + indexes.rows.length)
  console.log('  Seed data: 3 feature flags')
  console.log()

  await db.close()
  console.log('▸ Database closed.')
  console.log()

  if (allPresent) {
    console.log('════════════════════════════════════════════════════════════')
    console.log('  TASK 1: PASSED ✅')
    console.log('════════════════════════════════════════════════════════════')
  } else {
    console.log('════════════════════════════════════════════════════════════')
    console.log('  TASK 1: FAILED ❌ — Some tables missing')
    console.log('════════════════════════════════════════════════════════════')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})

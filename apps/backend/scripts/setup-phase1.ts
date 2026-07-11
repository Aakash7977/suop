/**
 * Phase 1 Setup: Apply Organization migration + seed data
 */

import { PGlite } from '@electric-sql/pglite'
import { readFileSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

const DB_DIR = join(process.cwd(), 'db')
const MIGRATION_FILE_FOUNDATION = join(process.cwd(), 'prisma', 'migrations', '0001_init.sql')
const MIGRATION_FILE_ORG = join(process.cwd(), 'prisma', 'migrations', '0002_organization.sql')

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

async function main() {
  console.log('════════════════════════════════════════════════════════════')
  console.log('  PHASE 1: Organization Migration + Seed')
  console.log('════════════════════════════════════════════════════════════')
  console.log()

  const db = new PGlite({ dataDir: DB_DIR })
  await db.waitReady

  // Check current tables
  const before = await db.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`)
  console.log(`▸ Tables before: ${before.rows.length}`)

  // Apply foundation migration first (if not already applied)
  const tablesBeforeList = before.rows.map((r: { tablename: string }) => r.tablename)
  if (!tablesBeforeList.includes('audit_logs')) {
    console.log('▸ Applying foundation migration: 0001_init.sql')
    const foundationSql = readFileSync(MIGRATION_FILE_FOUNDATION, 'utf-8')
    await db.exec(foundationSql)
    console.log('  ✓ Foundation migration applied')
  } else {
    console.log('▸ Foundation migration already applied — skipping')
  }

  // Apply Organization migration
  console.log('▸ Applying migration: 0002_organization.sql')
  const migrationSql = readFileSync(MIGRATION_FILE_ORG, 'utf-8')
  await db.exec(migrationSql)
  console.log('  ✓ Migration applied')

  // Verify new tables
  const after = await db.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`)
  console.log(`▸ Tables after: ${after.rows.length}`)
  console.log()

  // Expected Organization tables
  const orgTables = [
    'tenants', 'companies', 'business_units', 'divisions', 'regions',
    'plants', 'warehouses', 'departments', 'cost_centers',
    'financial_years', 'working_calendars',
    'reference_timezones', 'reference_currencies', 'tax_configs',
  ]
  const actualTables = after.rows.map((r: { tablename: string }) => r.tablename)
  let allPresent = true
  for (const t of orgTables) {
    if (actualTables.includes(t)) {
      console.log(`  ✓ ${t}`)
    } else {
      console.log(`  ✗ ${t} MISSING`)
      allPresent = false
    }
  }
  console.log()

  // Seed reference data
  console.log('▸ Seeding reference data...')

  // Time zones
  const timezones = [
    { code: 'Asia/Kolkata', name: 'India Standard Time', offset: '+05:30', countries: ['IN'] },
    { code: 'UTC', name: 'Coordinated Universal Time', offset: '+00:00', countries: [] },
    { code: 'Asia/Dubai', name: 'Gulf Standard Time', offset: '+04:00', countries: ['AE'] },
    { code: 'America/New_York', name: 'Eastern Time', offset: '-05:00', countries: ['US'] },
    { code: 'Europe/London', name: 'Greenwich Mean Time', offset: '+00:00', countries: ['GB'] },
  ]
  for (const tz of timezones) {
    await db.query(
      `INSERT INTO reference_timezones (id, code, name, utc_offset, countries, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (code) DO NOTHING`,
      [randomUUID(), tz.code, tz.name, tz.offset, tz.countries.length > 0 ? tz.countries : null]
    )
  }
  console.log(`  ✓ Seeded ${timezones.length} time zones`)

  // Currencies
  const currencies = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
    { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
    { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
    { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2 },
  ]
  for (const c of currencies) {
    await db.query(
      `INSERT INTO reference_currencies (id, code, name, symbol, decimal_places, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW())
       ON CONFLICT (code) DO NOTHING`,
      [randomUUID(), c.code, c.name, c.symbol, c.decimals]
    )
  }
  console.log(`  ✓ Seeded ${currencies.length} currencies`)

  // Seed tenant (Sudhamrit)
  await db.query(
    `INSERT INTO tenants (id, name, legal_name, description, email, phone, website, default_timezone, default_currency, default_locale, status, version, created_at, updated_at)
     VALUES ($1, 'Sudhamrit Foods', 'Sudhamrit Foods Pvt Ltd', 'Sudhamrit Foods Private Limited — Indian sweets, namkeen, and snacks manufacturer',
       'info@sudhamrit.com', '+91-22-12345678', 'https://sudhamrit.com',
       'Asia/Kolkata', 'INR', 'en-IN', 'ACTIVE', 0, NOW(), NOW())
     ON CONFLICT (id) DO NOTHING`,
    [TENANT_ID]
  )
  console.log('  ✓ Seeded tenant: Sudhamrit Foods')

  // Seed default company
  await db.query(
    `INSERT INTO companies (id, tenant_id, code, name, legal_name, description, gstin, pan, cin, email, phone, website, address_line_1, city, state, country, postal_code, default_timezone, default_currency, status, version, created_at, updated_at)
     VALUES ($1, $2, 'SUDHAMRIT', 'Sudhamrit Foods', 'Sudhamrit Foods Pvt Ltd',
       'Parent company — manufacturing and distribution',
       '27AABCS1234M1Z5', 'AABCS1234M', 'U15490MH2020PTC123456',
       'info@sudhamrit.com', '+91-22-12345678', 'https://sudhamrit.com',
       '123 Andheri Industrial Estate', 'Mumbai', 'Maharashtra', 'India', '400069',
       'Asia/Kolkata', 'INR', 'ACTIVE', 0, NOW(), NOW())
     ON CONFLICT (tenant_id, code) DO NOTHING`,
    [randomUUID(), TENANT_ID]
  )
  console.log('  ✓ Seeded company: Sudhamrit Foods')

  // Seed financial year
  await db.query(
    `INSERT INTO financial_years (id, tenant_id, code, name, start_date, end_date, status, is_current, version, created_at, updated_at)
     VALUES ($1, $2, 'FY2026', 'Financial Year 2026-27', '2026-04-01', '2027-03-31', 'ACTIVE', true, 0, NOW(), NOW())
     ON CONFLICT (tenant_id, code) DO NOTHING`,
    [randomUUID(), TENANT_ID]
  )
  console.log('  ✓ Seeded financial year: FY2026 (2026-04-01 to 2027-03-31)')

  console.log()

  // Final verification
  console.log('▸ Table row counts (after seed):')
  for (const table of orgTables) {
    const count = await db.query(`SELECT COUNT(*) as cnt FROM ${table}`)
    console.log(`  ${table}: ${count.rows[0]!.cnt} rows`)
  }
  console.log()

  await db.close()

  if (allPresent) {
    console.log('════════════════════════════════════════════════════════════')
    console.log('  PHASE 1 SETUP: PASSED ✅')
    console.log('════════════════════════════════════════════════════════════')
  } else {
    console.log('════════════════════════════════════════════════════════════')
    console.log('  PHASE 1 SETUP: FAILED ❌')
    console.log('════════════════════════════════════════════════════════════')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})

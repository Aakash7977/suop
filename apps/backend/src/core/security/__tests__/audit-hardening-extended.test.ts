/**
 * Audit Hardening — Additional Tests
 *
 * Extended tests for hash chain properties and tamper detection scenarios.
 */

import { describe, it, expect } from 'vitest'
import {
  computeAuditHash,
  computeRootHash,
  type AuditChainEntry,
} from '@/core/security/audit-hardening'

describe('Audit Hardening — Hash Properties', () => {
  it('hash is always 64 characters (SHA-256)', () => {
    const hash = computeAuditHash({
      prevHash: null,
      timestamp: new Date(),
      payload: {},
    })
    expect(hash).toHaveLength(64)
  })

  it('hash contains only hex characters', () => {
    const hash = computeAuditHash({
      prevHash: null,
      timestamp: new Date(),
      payload: { action: 'CREATE' },
    })
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('hash is deterministic for same input', () => {
    const ts = new Date('2026-01-01')
    const payload = { action: 'CREATE', user: 'alice' }
    const h1 = computeAuditHash({ prevHash: null, timestamp: ts, payload })
    const h2 = computeAuditHash({ prevHash: null, timestamp: ts, payload })
    expect(h1).toBe(h2)
  })

  it('different payloads produce different hashes', () => {
    const ts = new Date()
    const h1 = computeAuditHash({ prevHash: null, timestamp: ts, payload: { a: 1 } })
    const h2 = computeAuditHash({ prevHash: null, timestamp: ts, payload: { a: 2 } })
    expect(h1).not.toBe(h2)
  })

  it('handles complex payloads', () => {
    const hash = computeAuditHash({
      prevHash: 'prev-hash-123',
      timestamp: new Date(),
      payload: {
        actor: { id: 'u1', name: 'Alice', role: 'admin' },
        action: 'UPDATE',
        entity: { type: 'User', id: '123' },
        changes: {
          before: { name: 'Old', email: 'old@test.com' },
          after: { name: 'New', email: 'new@test.com' },
        },
        metadata: {
          ip: '1.2.3.4',
          userAgent: 'Mozilla/5.0',
          correlationId: 'corr-123',
        },
      },
    })
    expect(hash).toHaveLength(64)
  })

  it('handles empty payload', () => {
    const hash = computeAuditHash({
      prevHash: null,
      timestamp: new Date(),
      payload: {},
    })
    expect(hash).toHaveLength(64)
  })

  it('handles null prevHash', () => {
    const hash = computeAuditHash({
      prevHash: null,
      timestamp: new Date(),
      payload: { action: 'CREATE' },
    })
    expect(hash).toHaveLength(64)
  })

  it('handles long prevHash', () => {
    const hash = computeAuditHash({
      prevHash: 'a'.repeat(64),
      timestamp: new Date(),
      payload: { action: 'UPDATE' },
    })
    expect(hash).toHaveLength(64)
  })
})

describe('Audit Hardening — Root Hash Properties', () => {
  it('returns empty string for empty list', () => {
    expect(computeRootHash([])).toBe('')
  })

  it('returns 64-char hash for single entry', () => {
    const entry: AuditChainEntry = {
      id: '1',
      timestamp: new Date(),
      prevHash: null,
      hash: 'abc123',
      payload: {},
    }
    const root = computeRootHash([entry])
    expect(root).toHaveLength(64)
  })

  it('produces different roots for different entry counts', () => {
    const entries1: AuditChainEntry[] = [{
      id: '1',
      timestamp: new Date(),
      prevHash: null,
      hash: 'h1',
      payload: {},
    }]
    const entries2: AuditChainEntry[] = [
      {
        id: '1',
        timestamp: new Date(),
        prevHash: null,
        hash: 'h1',
        payload: {},
      },
      {
        id: '2',
        timestamp: new Date(),
        prevHash: 'h1',
        hash: 'h2',
        payload: {},
      },
    ]
    expect(computeRootHash(entries1)).not.toBe(computeRootHash(entries2))
  })

  it('is order-dependent', () => {
    const e1: AuditChainEntry = {
      id: '1',
      timestamp: new Date(),
      prevHash: null,
      hash: 'aaa',
      payload: {},
    }
    const e2: AuditChainEntry = {
      id: '2',
      timestamp: new Date(),
      prevHash: 'aaa',
      hash: 'bbb',
      payload: {},
    }
    const root1 = computeRootHash([e1, e2])
    const root2 = computeRootHash([e2, e1])
    expect(root1).not.toBe(root2)
  })
})

describe('Audit Hardening — Chain Verification Scenarios', () => {
  it('builds a valid 5-entry chain', () => {
    const timestamps = [
      new Date('2026-01-01'),
      new Date('2026-01-02'),
      new Date('2026-01-03'),
      new Date('2026-01-04'),
      new Date('2026-01-05'),
    ]
    const payloads = [
      { action: 'CREATE', entityId: '1' },
      { action: 'UPDATE', entityId: '1' },
      { action: 'UPDATE', entityId: '1' },
      { action: 'UPDATE', entityId: '1' },
      { action: 'DELETE', entityId: '1' },
    ]

    let prevHash: string | null = null
    const hashes: string[] = []
    for (let i = 0; i < 5; i++) {
      const hash = computeAuditHash({
        prevHash,
        timestamp: timestamps[i]!,
        payload: payloads[i]!,
      })
      hashes.push(hash)
      prevHash = hash
    }

    // All hashes should be unique
    const uniqueHashes = new Set(hashes)
    expect(uniqueHashes.size).toBe(5)
  })

  it('detects modification of any entry in chain', () => {
    const ts1 = new Date('2026-01-01')
    const ts2 = new Date('2026-01-02')

    // Original chain
    const h1 = computeAuditHash({ prevHash: null, timestamp: ts1, payload: { action: 'CREATE' } })
    const h2 = computeAuditHash({ prevHash: h1, timestamp: ts2, payload: { action: 'UPDATE' } })

    // Tampered chain (modify first entry's payload)
    const h1Tampered = computeAuditHash({ prevHash: null, timestamp: ts1, payload: { action: 'DELETE' } })
    const h2Tampered = computeAuditHash({ prevHash: h1Tampered, timestamp: ts2, payload: { action: 'UPDATE' } })

    // The hashes should differ from the original
    expect(h1Tampered).not.toBe(h1)
    expect(h2Tampered).not.toBe(h2)
  })

  it('detects entry insertion', () => {
    const ts1 = new Date('2026-01-01')
    const ts2 = new Date('2026-01-02')
    const ts3 = new Date('2026-01-03')

    // Original chain: A → C
    const hA = computeAuditHash({ prevHash: null, timestamp: ts1, payload: { action: 'A' } })
    const hC = computeAuditHash({ prevHash: hA, timestamp: ts3, payload: { action: 'C' } })

    // Inserted chain: A → B → C
    const hB = computeAuditHash({ prevHash: hA, timestamp: ts2, payload: { action: 'B' } })
    const hCInserted = computeAuditHash({ prevHash: hB, timestamp: ts3, payload: { action: 'C' } })

    // The final hash should differ (chain broken)
    expect(hC).not.toBe(hCInserted)
  })

  it('detects entry deletion', () => {
    const ts1 = new Date('2026-01-01')
    const ts2 = new Date('2026-01-02')
    const ts3 = new Date('2026-01-03')

    // Original chain: A → B → C
    const hA = computeAuditHash({ prevHash: null, timestamp: ts1, payload: { action: 'A' } })
    const hB = computeAuditHash({ prevHash: hA, timestamp: ts2, payload: { action: 'B' } })
    const hC = computeAuditHash({ prevHash: hB, timestamp: ts3, payload: { action: 'C' } })

    // Deleted chain: A → C (B removed)
    const hCDeleted = computeAuditHash({ prevHash: hA, timestamp: ts3, payload: { action: 'C' } })

    expect(hC).not.toBe(hCDeleted)
  })

  it('detects reordering', () => {
    const ts1 = new Date('2026-01-01')
    const ts2 = new Date('2026-01-02')

    // Original: A → B
    const hA = computeAuditHash({ prevHash: null, timestamp: ts1, payload: { action: 'A' } })
    const hB = computeAuditHash({ prevHash: hA, timestamp: ts2, payload: { action: 'B' } })

    // Reordered: B → A (impossible in practice, but tests the hash dependency)
    const hBFirst = computeAuditHash({ prevHash: null, timestamp: ts2, payload: { action: 'B' } })
    const hAAfterB = computeAuditHash({ prevHash: hBFirst, timestamp: ts1, payload: { action: 'A' } })

    expect(hA).not.toBe(hAAfterB)
    expect(hB).not.toBe(hBFirst)
  })
})

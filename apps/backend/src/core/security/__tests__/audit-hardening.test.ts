/**
 * Audit Hardening Tests
 *
 * Tests for hash chain computation, chain verification,
 * root hash computation, and tamper detection.
 */

import { describe, it, expect } from 'vitest'
import {
  computeAuditHash,
  computeRootHash,
  type AuditChainEntry,
} from '@/core/security/audit-hardening'

describe('Audit Hardening — Hash Computation', () => {
  it('computes a deterministic SHA-256 hash', () => {
    const hash1 = computeAuditHash({
      prevHash: null,
      timestamp: new Date('2026-01-01T00:00:00Z'),
      payload: { action: 'CREATE', entityId: '123' },
    })
    const hash2 = computeAuditHash({
      prevHash: null,
      timestamp: new Date('2026-01-01T00:00:00Z'),
      payload: { action: 'CREATE', entityId: '123' },
    })
    expect(hash1).toBe(hash2)
    expect(hash1).toHaveLength(64) // SHA-256 hex
  })

  it('changes when prevHash changes', () => {
    const h1 = computeAuditHash({
      prevHash: null,
      timestamp: new Date('2026-01-01'),
      payload: { action: 'CREATE' },
    })
    const h2 = computeAuditHash({
      prevHash: 'abc123',
      timestamp: new Date('2026-01-01'),
      payload: { action: 'CREATE' },
    })
    expect(h1).not.toBe(h2)
  })

  it('changes when timestamp changes', () => {
    const h1 = computeAuditHash({
      prevHash: null,
      timestamp: new Date('2026-01-01'),
      payload: { action: 'CREATE' },
    })
    const h2 = computeAuditHash({
      prevHash: null,
      timestamp: new Date('2026-01-02'),
      payload: { action: 'CREATE' },
    })
    expect(h1).not.toBe(h2)
  })

  it('changes when payload changes', () => {
    const h1 = computeAuditHash({
      prevHash: null,
      timestamp: new Date('2026-01-01'),
      payload: { action: 'CREATE', entityId: '1' },
    })
    const h2 = computeAuditHash({
      prevHash: null,
      timestamp: new Date('2026-01-01'),
      payload: { action: 'CREATE', entityId: '2' },
    })
    expect(h1).not.toBe(h2)
  })

  it('handles null prevHash', () => {
    const hash = computeAuditHash({
      prevHash: null,
      timestamp: new Date(),
      payload: {},
    })
    expect(hash).toHaveLength(64)
  })

  it('handles complex nested payloads', () => {
    const hash = computeAuditHash({
      prevHash: 'prev-hash',
      timestamp: new Date(),
      payload: {
        actor: { id: 'u1', name: 'Alice' },
        action: 'UPDATE',
        changes: { before: { x: 1 }, after: { x: 2 } },
        metadata: { ip: '1.2.3.4', userAgent: 'Chrome' },
      },
    })
    expect(hash).toHaveLength(64)
  })
})

describe('Audit Hardening — Root Hash', () => {
  it('computes a root hash over multiple entries', () => {
    const entries: AuditChainEntry[] = [
      {
        id: '1',
        timestamp: new Date('2026-01-01'),
        prevHash: null,
        hash: 'hash1',
        payload: {},
      },
      {
        id: '2',
        timestamp: new Date('2026-01-02'),
        prevHash: 'hash1',
        hash: 'hash2',
        payload: {},
      },
    ]
    const root = computeRootHash(entries)
    expect(root).toHaveLength(64)
  })

  it('produces different root for different entries', () => {
    const entries1: AuditChainEntry[] = [
      {
        id: '1',
        timestamp: new Date(),
        prevHash: null,
        hash: 'aaa',
        payload: {},
      },
    ]
    const entries2: AuditChainEntry[] = [
      {
        id: '1',
        timestamp: new Date(),
        prevHash: null,
        hash: 'bbb',
        payload: {},
      },
    ]
    expect(computeRootHash(entries1)).not.toBe(computeRootHash(entries2))
  })

  it('produces empty string for empty entries', () => {
    const root = computeRootHash([])
    expect(root).toBe('')
  })

  it('is order-dependent (chain order matters)', () => {
    const e1: AuditChainEntry = {
      id: '1',
      timestamp: new Date(),
      prevHash: null,
      hash: 'h1',
      payload: {},
    }
    const e2: AuditChainEntry = {
      id: '2',
      timestamp: new Date(),
      prevHash: 'h1',
      hash: 'h2',
      payload: {},
    }
    const root1 = computeRootHash([e1, e2])
    const root2 = computeRootHash([e2, e1])
    expect(root1).not.toBe(root2)
  })
})

describe('Audit Hardening — Chain Properties', () => {
  it('builds a valid hash chain', () => {
    const ts1 = new Date('2026-01-01')
    const ts2 = new Date('2026-01-02')
    const ts3 = new Date('2026-01-03')

    const hash1 = computeAuditHash({
      prevHash: null,
      timestamp: ts1,
      payload: { action: 'CREATE' },
    })
    const hash2 = computeAuditHash({
      prevHash: hash1,
      timestamp: ts2,
      payload: { action: 'UPDATE' },
    })
    const hash3 = computeAuditHash({
      prevHash: hash2,
      timestamp: ts3,
      payload: { action: 'DELETE' },
    })

    // Verify the chain
    expect(hash1).not.toBe(hash2)
    expect(hash2).not.toBe(hash3)
    expect(hash1).not.toBe(hash3)

    // Each hash incorporates the previous
    const hash2Recomputed = computeAuditHash({
      prevHash: hash1,
      timestamp: ts2,
      payload: { action: 'UPDATE' },
    })
    expect(hash2Recomputed).toBe(hash2)
  })

  it('detects tampering (modified payload)', () => {
    const ts = new Date('2026-01-01')
    const originalHash = computeAuditHash({
      prevHash: null,
      timestamp: ts,
      payload: { action: 'CREATE', value: 100 },
    })
    const tamperedHash = computeAuditHash({
      prevHash: null,
      timestamp: ts,
      payload: { action: 'CREATE', value: 999 }, // Different value
    })
    expect(originalHash).not.toBe(tamperedHash)
  })

  it('detects tampering (modified prevHash)', () => {
    const ts = new Date('2026-01-01')
    const originalHash = computeAuditHash({
      prevHash: 'original-prev',
      timestamp: ts,
      payload: { action: 'CREATE' },
    })
    const tamperedHash = computeAuditHash({
      prevHash: 'tampered-prev',
      timestamp: ts,
      payload: { action: 'CREATE' },
    })
    expect(originalHash).not.toBe(tamperedHash)
  })

  it('detects tampering (modified timestamp)', () => {
    const originalHash = computeAuditHash({
      prevHash: null,
      timestamp: new Date('2026-01-01T10:00:00Z'),
      payload: { action: 'CREATE' },
    })
    const tamperedHash = computeAuditHash({
      prevHash: null,
      timestamp: new Date('2026-01-01T11:00:00Z'),
      payload: { action: 'CREATE' },
    })
    expect(originalHash).not.toBe(tamperedHash)
  })
})

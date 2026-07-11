/**
 * Security Monitoring Tests
 *
 * Tests for failed login detection, impossible travel detection,
 * privilege escalation recording, API abuse detection, and dashboard.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  recordSecurityEvent,
  recordFailedLogin,
  recordSuccessfulLogin,
  detectImpossibleTravel,
  recordPrivilegeChange,
  recordApiUsage,
  getSecurityDashboard,
  type SecurityEvent,
} from '@/core/security/security-monitoring'

describe('Security Monitoring — Event Recording', () => {
  it('records a security event without throwing', async () => {
    await expect(
      recordSecurityEvent({
        type: 'FAILED_LOGIN',
        severity: 'LOW',
        ipAddress: '1.2.3.4',
      })
    ).resolves.toBeUndefined()
  })

  it('records events of all types', async () => {
    const types: SecurityEvent['type'][] = [
      'FAILED_LOGIN',
      'ACCOUNT_LOCKED',
      'IMPOSSIBLE_TRAVEL',
      'API_ABUSE',
      'PRIVILEGE_ESCALATION',
      'SUSPICIOUS_ACTIVITY',
    ]
    for (const type of types) {
      await recordSecurityEvent({
        type,
        severity: 'MEDIUM',
        ipAddress: '1.2.3.4',
      })
    }
    // All should complete without throwing
  })
})

describe('Security Monitoring — Failed Login', () => {
  it('records a failed login attempt', async () => {
    await recordFailedLogin({
      userId: `fail-test-${Date.now()}`,
      tenantId: 't1',
      ipAddress: '1.2.3.4',
      userAgent: 'Chrome',
      email: 'test@example.com',
    })
    // Should not throw
  })

  it('records failed login without user ID (user enumeration)', async () => {
    await recordFailedLogin({
      ipAddress: '5.6.7.8',
      email: 'nonexistent@example.com',
    })
  })

  it('resets counters on successful login', async () => {
    const userId = `success-test-${Date.now()}`
    await recordFailedLogin({
      userId,
      tenantId: 't1',
      ipAddress: '1.2.3.4',
    })
    await recordSuccessfulLogin({
      userId,
      tenantId: 't1',
      ipAddress: '1.2.3.4',
    })
  })
})

describe('Security Monitoring — Impossible Travel', () => {
  it('returns false for first login (no baseline)', async () => {
    const userId = `travel-test-1-${Date.now()}`
    const result = await detectImpossibleTravel({
      userId,
      ipAddress: '1.2.3.4',
      timestamp: Date.now(),
    })
    expect(result).toBe(false)
  })

  it('returns false when same subnet within 1 hour', async () => {
    const userId = `travel-test-2-${Date.now()}`
    // First login
    await detectImpossibleTravel({
      userId,
      ipAddress: '1.2.3.4',
      timestamp: Date.now(),
    })
    // Second login from same /24 subnet immediately
    const result = await detectImpossibleTravel({
      userId,
      ipAddress: '1.2.3.50',
      timestamp: Date.now() + 1000,
    })
    expect(result).toBe(false)
  })

  it('returns true when different subnet within 1 hour', async () => {
    const userId = `travel-test-3-${Date.now()}`
    // First login from 1.x.x.x
    await detectImpossibleTravel({
      userId,
      ipAddress: '1.2.3.4',
      timestamp: Date.now(),
    })
    // Second login from 5.x.x.x immediately — impossible travel
    const result = await detectImpossibleTravel({
      userId,
      ipAddress: '5.6.7.8',
      timestamp: Date.now() + 60_000, // 1 min later
    })
    expect(result).toBe(true)
  })
})

describe('Security Monitoring — Privilege Escalation', () => {
  it('records a GRANT event', async () => {
    await recordPrivilegeChange({
      actorId: 'admin-1',
      targetUserId: 'user-1',
      tenantId: 't1',
      change: 'GRANT',
      role: 'quality_manager',
      ipAddress: '1.2.3.4',
    })
    // Should not throw
  })

  it('records a REVOKE event', async () => {
    await recordPrivilegeChange({
      actorId: 'admin-1',
      targetUserId: 'user-2',
      tenantId: 't1',
      change: 'REVOKE',
      permission: 'po:approve',
      ipAddress: '1.2.3.4',
    })
  })
})

describe('Security Monitoring — API Usage', () => {
  it('records successful API usage', async () => {
    await recordApiUsage({
      userId: 'u1',
      tenantId: 't1',
      ipAddress: '1.2.3.4',
      endpoint: '/api/v1/products',
      statusCode: 200,
      responseTimeMs: 50,
    })
  })

  it('records error API usage', async () => {
    await recordApiUsage({
      userId: 'u1',
      tenantId: 't1',
      ipAddress: '1.2.3.4',
      endpoint: '/api/v1/products',
      statusCode: 500,
      responseTimeMs: 5000,
    })
  })

  it('records 404 (endpoint scanning)', async () => {
    await recordApiUsage({
      ipAddress: '1.2.3.4',
      endpoint: '/api/v1/admin/secrets',
      statusCode: 404,
      responseTimeMs: 10,
    })
  })
})

describe('Security Monitoring — Dashboard', () => {
  it('returns a dashboard object', async () => {
    const dashboard = await getSecurityDashboard()
    expect(dashboard).toHaveProperty('failedLogins')
    expect(dashboard).toHaveProperty('lockedAccounts')
    expect(dashboard).toHaveProperty('impossibleTravelAlerts')
    expect(dashboard).toHaveProperty('apiAbuseAlerts')
    expect(dashboard).toHaveProperty('privilegeEscalations')
    expect(dashboard).toHaveProperty('recentEvents')
    expect(Array.isArray(dashboard.recentEvents)).toBe(true)
  })

  it('failedLogins has correct shape', async () => {
    const dashboard = await getSecurityDashboard()
    expect(dashboard.failedLogins).toHaveProperty('lastHour')
    expect(dashboard.failedLogins).toHaveProperty('lastDay')
    expect(dashboard.failedLogins).toHaveProperty('topIps')
    expect(dashboard.failedLogins).toHaveProperty('topUserIds')
    expect(typeof dashboard.failedLogins.lastHour).toBe('number')
    expect(Array.isArray(dashboard.failedLogins.topIps)).toBe(true)
  })
})

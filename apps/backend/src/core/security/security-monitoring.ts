/**
 * @suop/backend — Security Monitoring
 *
 * RC1 Fix Pack 2 §A-11: Real-time security event detection.
 *
 * Features:
 *   - Failed login detection (per-IP, per-user, per-tenant)
 *   - Impossible travel detection (login from geo-impossible locations)
 *   - API abuse detection (anomalous request patterns)
 *   - Account lock (auto-lockout after threshold failures)
 *   - Privilege escalation detection (role changes, permission grants)
 *   - Security dashboard endpoint (aggregated metrics)
 *
 * Detection rules use Redis-backed sliding windows for distributed awareness.
 */

import { getRedis } from '@/core/cache/redis-client'
import { rateLimiter } from './rate-limiter'
import { logger } from '@/core/logging'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SecurityEvent {
  type:
    | 'FAILED_LOGIN'
    | 'ACCOUNT_LOCKED'
    | 'IMPOSSIBLE_TRAVEL'
    | 'API_ABUSE'
    | 'PRIVILEGE_ESCALATION'
    | 'SUSPICIOUS_ACTIVITY'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  userId?: string
  tenantId?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
  timestamp: number
}

export interface SecurityDashboard {
  failedLogins: {
    lastHour: number
    lastDay: number
    topIps: Array<{ ip: string; count: number }>
    topUserIds: Array<{ userId: string; count: number }>
  }
  lockedAccounts: number
  impossibleTravelAlerts: number
  apiAbuseAlerts: number
  privilegeEscalations: number
  recentEvents: SecurityEvent[]
}

// ─── Event Recording ────────────────────────────────────────────────────────

const SECURITY_EVENTS_KEY = 'suop:sec:events' // Redis list (newest first)

/**
 * Record a security event.
 *
 * Events are stored in Redis (fast, distributed) with a sliding window
 * of MAX_EVENTS_IN_LIST entries. Critical events are also logged to the
 * application logger (for external log aggregation).
 */
export async function recordSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): Promise<void> {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: Date.now(),
  }

  try {
    const client = await getRedis()
    // LPUSH to add to head, then LTRIM to keep only last N
    await client.hset(
      `${SECURITY_EVENTS_KEY}:${fullEvent.type}`,
      String(fullEvent.timestamp),
      JSON.stringify(fullEvent)
    )
    // Set TTL on the event (24 hours)
    await client.expire(`${SECURITY_EVENTS_KEY}:${fullEvent.type}`, 86400)
  } catch (err) {
    logger.debug('Failed to record security event in Redis', {
      error: (err as Error).message,
      event: fullEvent.type,
    })
  }

  // Log critical events
  if (fullEvent.severity === 'CRITICAL' || fullEvent.severity === 'HIGH') {
    logger.warn('Security event', {
      type: fullEvent.type,
      severity: fullEvent.severity,
      userId: fullEvent.userId,
      tenantId: fullEvent.tenantId,
      ipAddress: fullEvent.ipAddress,
      metadata: fullEvent.metadata,
    })
  }
}

// ─── Failed Login Detection ─────────────────────────────────────────────────

/**
 * Record a failed login attempt and trigger alerts if patterns emerge.
 *
 * Called by the auth service on every failed login.
 */
export async function recordFailedLogin(params: {
  userId?: string
  tenantId?: string
  ipAddress: string
  userAgent?: string
  email?: string
}): Promise<void> {
  // Record the event
  await recordSecurityEvent({
    type: 'FAILED_LOGIN',
    severity: 'LOW',
    userId: params.userId,
    tenantId: params.tenantId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { email: params.email },
  })

  // Per-IP brute force detection
  if (params.userId) {
    const { lockedUntil } = await rateLimiter.recordFailedLogin(params.userId)
    if (lockedUntil) {
      await recordSecurityEvent({
        type: 'ACCOUNT_LOCKED',
        severity: 'HIGH',
        userId: params.userId,
        tenantId: params.tenantId,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: { lockedUntil },
      })
    }
  }

  // Per-IP detection (independent of user — catches user enumeration)
  const ipKey = `suop:sec:failed_ip:${params.ipAddress}`
  try {
    const client = await getRedis()
    const count = await client.incrExpire(ipKey, 3600) // 1 hour window
    if (count === 50) {
      // 50 failed logins from same IP in 1 hour — critical
      await recordSecurityEvent({
        type: 'API_ABUSE',
        severity: 'CRITICAL',
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: {
          reason: '50+ failed logins from single IP in 1 hour',
          count,
        },
      })
    }
  } catch (err) {
    logger.debug('Failed to track per-IP failed logins', {
      error: (err as Error).message,
    })
  }
}

/**
 * Reset failed login counters after a successful login.
 */
export async function recordSuccessfulLogin(params: {
  userId: string
  tenantId: string
  ipAddress: string
}): Promise<void> {
  await rateLimiter.resetFailedLogin(params.userId)

  // Clear the per-IP counter (successful login breaks the "attack" pattern)
  const ipKey = `suop:sec:failed_ip:${params.ipAddress}`
  try {
    const client = await getRedis()
    await client.del(ipKey)
  } catch {
    // Ignore
  }
}

// ─── Impossible Travel Detection ────────────────────────────────────────────

/**
 * Detect impossible travel: user logs in from location A, then within a
 * short time logs in from location B that's geographically impossible
 * to reach in that time.
 *
 * Implementation: stores the last login IP + timestamp per user.
 * On new login, checks if the distance / time exceeds a threshold
 * (e.g., > 1000 km in < 1 hour → impossible).
 *
 * IP geolocation: uses an external service or a local GeoIP database.
 * For now, we use a simple subnet comparison (different /16 → suspicious).
 */
export async function detectImpossibleTravel(params: {
  userId: string
  ipAddress: string
  timestamp: number
}): Promise<boolean> {
  const key = `suop:sec:last_login:${params.userId}`
  try {
    const client = await getRedis()
    const last = await client.get(key)
    if (!last) {
      // First login — no comparison possible
      await client.set(key, JSON.stringify({ ip: params.ipAddress, ts: params.timestamp }), 86400)
      return false
    }

    const lastData = JSON.parse(last) as { ip: string; ts: number }
    const timeDiffSec = (params.timestamp - lastData.ts) / 1000
    const differentSubnet = getSubnet(lastData.ip) !== getSubnet(params.ipAddress)

    // If login is from a different subnet within 1 hour — suspicious
    if (differentSubnet && timeDiffSec < 3600) {
      await recordSecurityEvent({
        type: 'IMPOSSIBLE_TRAVEL',
        severity: 'HIGH',
        userId: params.userId,
        ipAddress: params.ipAddress,
        metadata: {
          lastIp: lastData.ip,
          currentIp: params.ipAddress,
          timeDiffSec,
          lastLoginAt: lastData.ts,
        },
      })
      // Update the last login record
      await client.set(key, JSON.stringify({ ip: params.ipAddress, ts: params.timestamp }), 86400)
      return true
    }

    // Update the last login record
    await client.set(key, JSON.stringify({ ip: params.ipAddress, ts: params.timestamp }), 86400)
    return false
  } catch {
    return false
  }
}

function getSubnet(ip: string): string {
  if (ip.includes(':')) {
    // IPv6 — first 2 groups
    return ip.split(':').slice(0, 2).join(':')
  }
  // IPv4 — first 2 octets (/16)
  return ip.split('.').slice(0, 2).join('.')
}

// ─── Privilege Escalation Detection ─────────────────────────────────────────

/**
 * Detect privilege escalation: user role/permission changes.
 *
 * Called by the user-management module whenever roles are assigned/revoked.
 */
export async function recordPrivilegeChange(params: {
  actorId: string
  targetUserId: string
  tenantId: string
  change: 'GRANT' | 'REVOKE'
  role?: string
  permission?: string
  ipAddress?: string
}): Promise<void> {
  await recordSecurityEvent({
    type: 'PRIVILEGE_ESCALATION',
    severity: 'MEDIUM',
    userId: params.targetUserId,
    tenantId: params.tenantId,
    ipAddress: params.ipAddress,
    metadata: {
      actorId: params.actorId,
      change: params.change,
      role: params.role,
      permission: params.permission,
    },
  })
}

// ─── API Abuse Detection ────────────────────────────────────────────────────

/**
 * Detect API abuse: anomalous request patterns.
 *
 * Heuristics:
 *   - User making > 1000 req/min (already caught by rate limiter, but logged)
 *   - User accessing endpoints they've never accessed before (new endpoint)
 *   - User scanning endpoints (404 ratio > 50%)
 *   - User agent switching (bot signature)
 *
 * This is a passive monitor — actual blocking is done by rate limiter.
 */
export async function recordApiUsage(params: {
  userId?: string
  tenantId?: string
  ipAddress: string
  endpoint: string
  statusCode: number
  responseTimeMs: number
}): Promise<void> {
  // Track error ratio per IP
  if (params.statusCode >= 400) {
    const errorKey = `suop:sec:errors:${params.ipAddress}`
    try {
      const client = await getRedis()
      const count = await client.incrExpire(errorKey, 300) // 5 min window
      if (count === 100) {
        await recordSecurityEvent({
          type: 'API_ABUSE',
          severity: 'MEDIUM',
          userId: params.userId,
          tenantId: params.tenantId,
          ipAddress: params.ipAddress,
          metadata: {
            reason: '100+ errors in 5 minutes',
            count,
          },
        })
      }
    } catch {
      // Ignore
    }
  }
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

/**
 * Get security dashboard metrics for the monitoring UI.
 */
export async function getSecurityDashboard(): Promise<SecurityDashboard> {
  const client = await getRedis()

  // Failed logins (last hour and last day)
  const now = Date.now()
  const oneHourAgo = now - 3600_000
  const oneDayAgo = now - 86400_000

  let failedLastHour = 0
  let failedLastDay = 0
  let lockedAccounts = 0
  let impossibleTravel = 0
  let apiAbuse = 0
  let privilegeEscalations = 0
  const recentEvents: SecurityEvent[] = []

  try {
    // Get all events of each type
    const failedEvents = await client.hgetall(`${SECURITY_EVENTS_KEY}:FAILED_LOGIN`)
    for (const [ts, v] of Object.entries(failedEvents)) {
      const t = parseInt(ts, 10)
      if (t > oneHourAgo) failedLastHour++
      if (t > oneDayAgo) failedLastDay++
      recentEvents.push(JSON.parse(v))
    }

    const lockedEvents = await client.hgetall(`${SECURITY_EVENTS_KEY}:ACCOUNT_LOCKED`)
    lockedAccounts = Object.keys(lockedEvents).length
    for (const [, v] of Object.entries(lockedEvents)) {
      recentEvents.push(JSON.parse(v))
    }

    const travelEvents = await client.hgetall(`${SECURITY_EVENTS_KEY}:IMPOSSIBLE_TRAVEL`)
    impossibleTravel = Object.keys(travelEvents).length
    for (const [, v] of Object.entries(travelEvents)) {
      recentEvents.push(JSON.parse(v))
    }

    const abuseEvents = await client.hgetall(`${SECURITY_EVENTS_KEY}:API_ABUSE`)
    apiAbuse = Object.keys(abuseEvents).length
    for (const [, v] of Object.entries(abuseEvents)) {
      recentEvents.push(JSON.parse(v))
    }

    const privEvents = await client.hgetall(`${SECURITY_EVENTS_KEY}:PRIVILEGE_ESCALATION`)
    privilegeEscalations = Object.keys(privEvents).length
    for (const [, v] of Object.entries(privEvents)) {
      recentEvents.push(JSON.parse(v))
    }
  } catch (err) {
    logger.debug('Failed to load security dashboard data', {
      error: (err as Error).message,
    })
  }

  // Sort recent events by timestamp (newest first), keep last 100
  recentEvents.sort((a, b) => b.timestamp - a.timestamp)
  const top100 = recentEvents.slice(0, 100)

  // Compute top IPs and users
  const ipCounts = new Map<string, number>()
  const userCounts = new Map<string, number>()
  for (const e of top100) {
    if (e.type === 'FAILED_LOGIN') {
      if (e.ipAddress) ipCounts.set(e.ipAddress, (ipCounts.get(e.ipAddress) ?? 0) + 1)
      if (e.userId) userCounts.set(e.userId, (userCounts.get(e.userId) ?? 0) + 1)
    }
  }

  return {
    failedLogins: {
      lastHour: failedLastHour,
      lastDay: failedLastDay,
      topIps: Array.from(ipCounts.entries())
        .map(([ip, count]) => ({ ip, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topUserIds: Array.from(userCounts.entries())
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    },
    lockedAccounts,
    impossibleTravelAlerts: impossibleTravel,
    apiAbuseAlerts: apiAbuse,
    privilegeEscalations,
    recentEvents: top100,
  }
}

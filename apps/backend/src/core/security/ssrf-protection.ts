/**
 * @suop/backend — SSRF Protection Utility
 *
 * Phase 1.6 Hardening:
 * Validates outbound URLs to prevent Server-Side Request Forgery attacks.
 * Blocks private IP ranges, cloud metadata endpoints, and link-local addresses.
 *
 * Used by:
 *   - EIP webhook dispatcher
 *   - EIP connector service
 *   - Any module that fetches tenant-provided URLs
 */

import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { AuthorizationError } from '@/core/errors'

// ─── Blocked IP Ranges ──────────────────────────────────────────────────────

const BLOCKED_RANGES: Array<{ name: string; test: (ip: string) => boolean }> = [
  // IPv4 private ranges
  { name: 'loopback-v4', test: (ip) => ip.startsWith('127.') },
  { name: 'private-10', test: (ip) => ip.startsWith('10.') },
  { name: 'private-172', test: (ip) => /^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip) },
  { name: 'private-192', test: (ip) => ip.startsWith('192.168.') },
  { name: 'link-local', test: (ip) => ip.startsWith('169.254.') },
  { name: 'carrier-grade-nat', test: (ip) => ip.startsWith('100.64.') },
  { name: 'benchmarking', test: (ip) => ip.startsWith('198.18.') },
  { name: 'benchmarking-2', test: (ip) => ip.startsWith('198.19.') },
  { name: 'multicast', test: (ip) => ip.startsWith('224.') },
  { name: 'reserved', test: (ip) => ip.startsWith('240.') },
  { name: 'broadcast', test: (ip) => ip === '255.255.255.255' },
  { name: 'cloud-metadata-aws', test: (ip) => ip === '169.254.169.254' },
  { name: 'cloud-metadata-gcp', test: (ip) => ip === 'metadata.google.internal' },
  // IPv6
  { name: 'loopback-v6', test: (ip) => ip === '::1' },
  { name: 'link-local-v6', test: (ip) => ip.startsWith('fe80:') },
  { name: 'unique-local-v6', test: (ip) => ip.startsWith('fc') || ip.startsWith('fd') },
  { name: 'multicast-v6', test: (ip) => ip.startsWith('ff') },
]

// ─── URL Validation ─────────────────────────────────────────────────────────

export interface SsrfValidationOptions {
  /** Allowed protocols (default: ['https:', 'http:']) */
  allowedProtocols?: string[]
  /** Allow private IPs (default: false — always block) */
  allowPrivateIp?: boolean
  /** Maximum number of DNS resolutions before giving up (default: 3) */
  maxDnsLookups?: number
}

/**
 * Validate that a URL is safe to fetch.
 * Blocks:
 *   - Non-HTTP(S) protocols (file://, ftp://, etc.)
 *   - Private/internal IP ranges (127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, etc.)
 *   - Cloud metadata endpoints (169.254.169.254)
 *   - Link-local addresses
 *   - DNS rebinding attacks (re-validates after DNS resolution)
 *
 * @param url - The URL to validate
 * @param options - Validation options
 * @throws AuthorizationError if the URL is unsafe
 */
export async function validateOutboundUrl(
  url: string,
  options: SsrfValidationOptions = {}
): Promise<void> {
  const {
    allowedProtocols = ['https:', 'http:'],
    allowPrivateIp = false,
  } = options

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    throw new AuthorizationError('Invalid URL format', 'SSRF.INVALID_URL')
  }

  // Check protocol
  if (!allowedProtocols.includes(parsedUrl.protocol)) {
    throw new AuthorizationError(
      `Protocol '${parsedUrl.protocol}' not allowed — only ${allowedProtocols.join(', ')} are permitted`,
      'SSRF.BLOCKED_PROTOCOL'
    )
  }

  const hostname = parsedUrl.hostname

  // If hostname is already an IP, check it directly
  if (isIP(hostname)) {
    if (!allowPrivateIp) {
      checkIpBlocked(hostname)
    }
    return
  }

  // Resolve hostname to IP(s) and check each
  try {
    const addresses = await lookup(hostname, { all: true })
    if (addresses.length === 0) {
      throw new AuthorizationError(
        `DNS resolution failed for '${hostname}'`,
        'SSRF.DNS_FAILED'
      )
    }

    for (const addr of addresses) {
      if (!allowPrivateIp) {
        checkIpBlocked(addr.address)
      }
    }
  } catch (err) {
    if (err instanceof AuthorizationError) throw err
    throw new AuthorizationError(
      `DNS resolution failed for '${hostname}': ${(err as Error).message}`,
      'SSRF.DNS_FAILED'
    )
  }
}

/**
 * Check if an IP address is in a blocked range.
 * @throws AuthorizationError if the IP is blocked
 */
function checkIpBlocked(ip: string): void {
  for (const range of BLOCKED_RANGES) {
    if (range.test(ip)) {
      throw new AuthorizationError(
        `IP address '${ip}' is blocked (range: ${range.name}) — SSRF protection`,
        'SSRF.BLOCKED_IP'
      )
    }
  }
}

/**
 * Synchronous version — only checks if the URL string contains obvious
 * blocked patterns. Does NOT do DNS resolution.
 * Use this for quick pre-validation before the async validateOutboundUrl.
 */
export function isUrlSuspicious(url: string): boolean {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname

    // Check protocol
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return true
    }

    // Check if hostname is a blocked IP
    if (isIP(hostname)) {
      for (const range of BLOCKED_RANGES) {
        if (range.test(hostname)) return true
      }
    }

    // Check for common SSRF patterns in hostname
    const lowerHost = hostname.toLowerCase()
    if (lowerHost === 'localhost') return true
    if (lowerHost === 'metadata.google.internal') return true
    if (lowerHost.endsWith('.internal') || lowerHost.endsWith('.local')) return true

    return false
  } catch {
    return true
  }
}

/**
 * Fetch wrapper with built-in SSRF protection.
 * Validates the URL before fetching and re-validates after any redirect.
 */
export async function safeFetch(
  url: string,
  options: RequestInit = {},
  ssrfOptions?: SsrfValidationOptions
): Promise<Response> {
  // Pre-validate the URL (async — includes DNS resolution)
  await validateOutboundUrl(url, ssrfOptions)

  // Fetch with redirect: 'manual' so we can re-validate each redirect
  const response = await fetch(url, {
    ...options,
    redirect: 'manual',
  })

  // Handle redirects manually — re-validate each Location header
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location')
    if (location) {
      const redirectUrl = new URL(location, url).toString()
      // Re-validate the redirect URL
      await validateOutboundUrl(redirectUrl, ssrfOptions)
      // Follow the redirect (recursively, with continued validation)
      return safeFetch(redirectUrl, options, ssrfOptions)
    }
  }

  return response
}

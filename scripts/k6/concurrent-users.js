// ════════════════════════════════════════════════════════════════════════════
// SUOP ERP v1.0 — k6 Load Test: Concurrent User Testing
// ════════════════════════════════════════════════════════════════════════════
// Run: k6 run scripts/k6/concurrent-users.js
//
// Concurrent user test: simulate many users hitting different endpoints.
// Goal: verify the system handles concurrent access without race conditions.

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Counter } from 'k6/metrics'

const errorRate = new Rate('errors')
const authAttempts = new Counter('auth_attempts')

export const options = {
  scenarios: {
    concurrent_health: {
      executor: 'constant-vus',
      vus: 100,
      duration: '5m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<200', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3030'

export default function () {
  // Mix of endpoints to simulate real usage
  const r = Math.random()
  let endpoint
  if (r < 0.4) {
    endpoint = '/health'
  } else if (r < 0.7) {
    endpoint = '/live'
  } else if (r < 0.9) {
    endpoint = '/ready'
  } else {
    endpoint = '/api/v1/_internal/version'
  }

  const res = http.get(`${BASE_URL}${endpoint}`)

  const ok = check(res, {
    'status 2xx': (r) => r.status >= 200 && r.status < 300,
    'response has data': (r) => r.json('data') !== null,
  })

  errorRate.add(!ok)
  authAttempts.add(1)
  sleep(0.2) // 5 RPS per VU = 500 RPS total
}

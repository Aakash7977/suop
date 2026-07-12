// ════════════════════════════════════════════════════════════════════════════
// SUOP ERP v1.0 — k6 Load Test: Spike Testing
// ════════════════════════════════════════════════════════════════════════════
// Run: k6 run scripts/k6/spike-test.js
//
// Spike test: sudden, extreme increase in traffic.
// Goal: verify the system recovers gracefully from traffic spikes.

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('errors')

export const options = {
  stages: [
    { duration: '10s', target: 100 },    // Normal load
    { duration: '1m', target: 100 },     // Hold normal
    { duration: '10s', target: 2000 },   // SPIKE: 20x normal
    { duration: '1m', target: 2000 },    // Hold spike
    { duration: '10s', target: 100 },    // Drop back to normal
    { duration: '3m', target: 100 },     // Hold normal (recovery)
    { duration: '10s', target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(99)<2000'],
    http_req_failed: ['rate<0.10'],  // Allow up to 10% failure during spike
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3030'

export default function () {
  const res = http.get(`${BASE_URL}/health`)
  const ok = check(res, {
    'status 200 or 503': (r) => r.status === 200 || r.status === 503,
  })
  errorRate.add(!ok)
  sleep(0.05)
}

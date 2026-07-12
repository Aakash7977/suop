// ════════════════════════════════════════════════════════════════════════════
// SUOP ERP v1.0 — k6 Load Test: Endurance Testing
// ════════════════════════════════════════════════════════════════════════════
// Run: k6 run scripts/k6/endurance-test.js
//
// Endurance test: sustained moderate load for 1 hour.
// Goal: detect memory leaks, connection pool exhaustion, slow degradation.

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend, Counter } from 'k6/metrics'

const errorRate = new Rate('errors')
const latencyTrend = new Trend('latency_trend', true)
const requestCount = new Counter('request_count')

export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Ramp up
    { duration: '58m', target: 50 },   // Hold for 58 minutes
    { duration: '1m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3030'

export default function () {
  const endpoints = [
    '/health',
    '/live',
    '/ready',
    '/api/v1/_internal/version',
  ]

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)]
  const res = http.get(`${BASE_URL}${endpoint}`)

  latencyTrend.add(res.timings.duration)
  requestCount.add(1)

  const ok = check(res, {
    'status 2xx': (r) => r.status >= 200 && r.status < 300,
  })

  errorRate.add(!ok)
  sleep(1) // 1 RPS per VU = 50 RPS total
}

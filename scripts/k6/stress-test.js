// ════════════════════════════════════════════════════════════════════════════
// SUOP ERP v1.0 — k6 Load Test: Stress Testing
// ════════════════════════════════════════════════════════════════════════════
// Run: k6 run scripts/k6/stress-test.js
//
// Stress test: gradually increase load until the system breaks.
// Goal: find the maximum sustainable requests per second (RPS).

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const errorRate = new Rate('errors')
const apiLatency = new Trend('api_latency', true)

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Hold at 100 users
    { duration: '2m', target: 200 },  // Ramp up to 200 users
    { duration: '5m', target: 200 },  // Hold at 200 users
    { duration: '2m', target: 400 },  // Ramp up to 400 users
    { duration: '5m', target: 400 },  // Hold at 400 users
    { duration: '2m', target: 800 },  // Ramp up to 800 users (stress)
    { duration: '5m', target: 800 },  // Hold at 800 users (stress)
    { duration: '5m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    errors: ['rate<0.05'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3030'

export default function () {
  // Health check (lightweight)
  const healthRes = http.get(`${BASE_URL}/health`)
  apiLatency.add(healthRes.timings.duration)

  const ok = check(healthRes, {
    'health status 200': (r) => r.status === 200,
    'health has status field': (r) => r.json('data.status') === 'ok',
  })

  errorRate.add(!ok)

  sleep(0.1) // 10 RPS per VU
}

export function handleSummary(data) {
  return {
    'scripts/k6/results/stress-test-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  }
}

function textSummary(data, options) {
  return JSON.stringify(data.metrics, null, 2)
}

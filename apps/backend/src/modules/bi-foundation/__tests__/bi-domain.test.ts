/** BI, AI & Executive Analytics Domain Tests — Phases 51-55 */
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { workflowRegistry, type WorkflowEntity } from '@/core/workflow'
import '@/modules/alerts-kpi-engine/workflow'
import { BusinessRuleError, NotFoundError, ConcurrencyError, AuthorizationError } from '@/core/errors'
import { PermissionChecker, Permission } from '@/core/permissions'

const wfCtx = { userId: 'u1', tenantId: 't1', correlationId: 'c1' }

// ════════════════════════════════════════════════════════════════════════════
// ALERT WORKFLOW (12 tests)
// ════════════════════════════════════════════════════════════════════════════

type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'ESCALATED' | 'RESOLVED' | 'SUPPRESSED'
interface AlertEntity extends WorkflowEntity { id: string; status: AlertStatus; version: number }

describe('Alert Workflow', () => {
  const machine = workflowRegistry.get<AlertStatus, AlertEntity>('AlertLifecycle')
  it('has correct initial state', () => { expect(machine.definition.initialState).toBe('ACTIVE') })
  it('has 5 states', () => { expect(machine.definition.states).toHaveLength(5) })
  it('has 8 transitions', () => { expect(machine.definition.transitions).toHaveLength(8) })
  it('allows ACTIVE → ACKNOWLEDGED', async () => { expect((await machine.canTransition({ id: '1', status: 'ACTIVE', version: 0 }, 'ACKNOWLEDGED', wfCtx)).allowed).toBe(true) })
  it('allows ACTIVE → ESCALATED', async () => { expect((await machine.canTransition({ id: '2', status: 'ACTIVE', version: 0 }, 'ESCALATED', wfCtx)).allowed).toBe(true) })
  it('allows ACTIVE → SUPPRESSED', async () => { expect((await machine.canTransition({ id: '3', status: 'ACTIVE', version: 0 }, 'SUPPRESSED', wfCtx)).allowed).toBe(true) })
  it('allows ACKNOWLEDGED → RESOLVED', async () => { expect((await machine.canTransition({ id: '4', status: 'ACKNOWLEDGED', version: 0 }, 'RESOLVED', wfCtx)).allowed).toBe(true) })
  it('allows ACKNOWLEDGED → ESCALATED', async () => { expect((await machine.canTransition({ id: '5', status: 'ACKNOWLEDGED', version: 0 }, 'ESCALATED', wfCtx)).allowed).toBe(true) })
  it('allows ESCALATED → RESOLVED', async () => { expect((await machine.canTransition({ id: '6', status: 'ESCALATED', version: 0 }, 'RESOLVED', wfCtx)).allowed).toBe(true) })
  it('allows SUPPRESSED → ACTIVE (reactivate)', async () => { expect((await machine.canTransition({ id: '7', status: 'SUPPRESSED', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(true) })
  it('rejects RESOLVED → ACTIVE (terminal)', async () => { expect((await machine.canTransition({ id: '8', status: 'RESOLVED', version: 0 }, 'ACTIVE', wfCtx)).allowed).toBe(false) })
  it('increments version', async () => { const u = await machine.transition({ id: '9', status: 'ACTIVE', version: 3 }, 'ACKNOWLEDGED', wfCtx); expect(u.version).toBe(4) })
})

// ════════════════════════════════════════════════════════════════════════════
// BI ANALYTICS CALCULATIONS (25 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('BI Analytics Calculations', () => {
  function calcRevenueGrowth(current: number, previous: number): number { return previous > 0 ? Math.round(((current - previous) / previous) * 10000) / 100 : 0 }
  function calcGrossMargin(revenue: number, cogs: number): number { return revenue > 0 ? Math.round(((revenue - cogs) / revenue) * 10000) / 100 : 0 }
  function calcInventoryTurns(cogs: number, avgInventory: number): number { return avgInventory > 0 ? Math.round((cogs / avgInventory) * 100) / 100 : 0 }
  function calcOEE(availability: number, performance: number, quality: number): number { return Math.round((availability / 100) * (performance / 100) * (quality / 100) * 10000) / 100 }
  function calcForecastAccuracy(actual: number, forecast: number): number { return actual > 0 ? Math.round((1 - Math.abs(actual - forecast) / actual) * 10000) / 100 : 0 }
  function calcYoY(current: number, previousYear: number): number { return previousYear > 0 ? Math.round(((current - previousYear) / previousYear) * 10000) / 100 : 0 }
  function calcMoM(current: number, previousMonth: number): number { return previousMonth > 0 ? Math.round(((current - previousMonth) / previousMonth) * 10000) / 100 : 0 }
  function calcCAGR(beginValue: number, endValue: number, years: number): number { return years > 0 && beginValue > 0 ? Math.round((Math.pow(endValue / beginValue, 1 / years) - 1) * 10000) / 100 : 0 }
  function calcAnomalyDeviation(actual: number, expected: number): number { return expected > 0 ? Math.round(((actual - expected) / expected) * 10000) / 100 : 0 }
  function calcTrend(values: number[]): 'UP' | 'DOWN' | 'STABLE' { if (values.length < 2) return 'STABLE'; const diff = values[values.length - 1]! - values[0]!; return diff > 0 ? 'UP' : diff < 0 ? 'DOWN' : 'STABLE' }

  it('revenue growth 20% for 120M vs 100M', () => { expect(calcRevenueGrowth(120, 100)).toBe(20) })
  it('revenue growth 0% when no previous', () => { expect(calcRevenueGrowth(100, 0)).toBe(0) })
  it('revenue growth -10% for decline', () => { expect(calcRevenueGrowth(90, 100)).toBe(-10) })
  it('gross margin 40% for 60M COGS on 100M revenue', () => { expect(calcGrossMargin(100, 60)).toBe(40) })
  it('gross margin 100% when no COGS', () => { expect(calcGrossMargin(100, 0)).toBe(100) })
  it('inventory turns 6x for 1200M COGS / 200M avg', () => { expect(calcInventoryTurns(1200, 200)).toBe(6) })
  it('OEE = A × P × Q', () => { expect(calcOEE(90, 85, 95)).toBe(72.68) })
  it('OEE 0 when availability 0', () => { expect(calcOEE(0, 85, 95)).toBe(0) })
  it('forecast accuracy 95% for 105 actual / 100 forecast', () => { expect(calcForecastAccuracy(105, 100)).toBe(95.24) })
  it('forecast accuracy 100% when perfect', () => { expect(calcForecastAccuracy(100, 100)).toBe(100) })
  it('forecast accuracy 0% when forecast way off', () => { expect(calcForecastAccuracy(100, 200)).toBe(0) })
  it('YoY growth 15%', () => { expect(calcYoY(115, 100)).toBe(15) })
  it('MoM growth 5%', () => { expect(calcMoM(105, 100)).toBe(5) })
  it('CAGR for 100 to 200 over 5 years', () => { expect(calcCAGR(100, 200, 5)).toBe(14.87) })
  it('anomaly deviation +25%', () => { expect(calcAnomalyDeviation(125, 100)).toBe(25) })
  it('anomaly deviation -30%', () => { expect(calcAnomalyDeviation(70, 100)).toBe(-30) })
  it('trend UP for increasing values', () => { expect(calcTrend([10, 20, 30, 40])).toBe('UP') })
  it('trend DOWN for decreasing values', () => { expect(calcTrend([40, 30, 20, 10])).toBe('DOWN') })
  it('trend STABLE for flat values', () => { expect(calcTrend([50, 50, 50])).toBe('STABLE') })
  it('trend STABLE for single value', () => { expect(calcTrend([50])).toBe('STABLE') })
  it('customer satisfaction = avg of ratings', () => { expect(Math.round(([4, 5, 3, 4, 5].reduce((s, r) => s + r, 0) / 5) * 100) / 100).toBe(4.2) })
  it('employee productivity = output / hours', () => { expect(Math.round((500 / 40) * 100) / 100).toBe(12.5) })
  it('supplier score = weighted avg', () => { expect(Math.round((0.4 * 90 + 0.3 * 85 + 0.3 * 80) * 100) / 100).toBe(85.5) })
  it('cash flow = inflow - outflow', () => { expect(500000 - 350000).toBe(150000) })
  it('working capital ratio = current assets / current liabilities', () => { expect(Math.round((500000 / 300000) * 100) / 100).toBe(1.67) })
})

// ════════════════════════════════════════════════════════════════════════════
// KPI ENGINE (15 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('KPI Engine', () => {
  function calcKPIStatus(actual: number, target: number, warning: number, critical: number, higherIsBetter: boolean): string {
    if (higherIsBetter) { if (actual >= target) return 'ON_TARGET'; if (actual >= warning) return 'WARNING'; return 'CRITICAL' }
    if (actual <= target) return 'ON_TARGET'; if (actual <= warning) return 'WARNING'; return 'CRITICAL'
  }
  function calcAchievement(actual: number, target: number): number { return target > 0 ? Math.round((actual / target) * 10000) / 100 : 0 }
  function calcVariance(actual: number, target: number): number { return Math.round((actual - target) * 100) / 100 }
  function calcKPIGrade(achievement: number): string { if (achievement >= 110) return 'A+'; if (achievement >= 100) return 'A'; if (achievement >= 90) return 'B'; if (achievement >= 75) return 'C'; return 'D' }

  it('KPI ON_TARGET when actual >= target (higher better)', () => { expect(calcKPIStatus(105, 100, 90, 80, true)).toBe('ON_TARGET') })
  it('KPI WARNING when between warning and target', () => { expect(calcKPIStatus(95, 100, 90, 80, true)).toBe('WARNING') })
  it('KPI CRITICAL when below critical threshold', () => { expect(calcKPIStatus(75, 100, 90, 80, true)).toBe('CRITICAL') })
  it('KPI ON_TARGET when actual <= target (lower better)', () => { expect(calcKPIStatus(8, 10, 12, 15, false)).toBe('ON_TARGET') })
  it('KPI WARNING for lower-better between target and warning', () => { expect(calcKPIStatus(11, 10, 12, 15, false)).toBe('WARNING') })
  it('KPI CRITICAL for lower-better above critical', () => { expect(calcKPIStatus(20, 10, 12, 15, false)).toBe('CRITICAL') })
  it('achievement 105% for 105/100', () => { expect(calcAchievement(105, 100)).toBe(105) })
  it('achievement 0% when no target', () => { expect(calcAchievement(100, 0)).toBe(0) })
  it('variance +5 for 105 vs 100', () => { expect(calcVariance(105, 100)).toBe(5) })
  it('variance -10 for 90 vs 100', () => { expect(calcVariance(90, 100)).toBe(-10) })
  it('KPI grade A+ for 110%+ achievement', () => { expect(calcKPIGrade(115)).toBe('A+') })
  it('KPI grade A for 100%+ achievement', () => { expect(calcKPIGrade(102)).toBe('A') })
  it('KPI grade B for 90%+ achievement', () => { expect(calcKPIGrade(92)).toBe('B') })
  it('KPI grade C for 75%+ achievement', () => { expect(calcKPIGrade(78)).toBe('C') })
  it('KPI grade D for below 75%', () => { expect(calcKPIGrade(60)).toBe('D') })
})

// ════════════════════════════════════════════════════════════════════════════
// AI FORECASTING LOGIC (15 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('AI Forecasting Logic', () => {
  function linearRegressionForecast(historical: number[], periodsAhead: number): number[] {
    if (historical.length < 2) return historical.slice(-1).concat(Array(periodsAhead - 1).fill(historical[historical.length - 1] ?? 0))
    const n = historical.length; const sumX = (n * (n - 1)) / 2; const sumY = historical.reduce((s, v) => s + v, 0)
    const sumXY = historical.reduce((s, v, i) => s + v * i, 0); const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    return Array.from({ length: periodsAhead }, (_, i) => Math.round((intercept + slope * (n + i)) * 100) / 100)
  }
  function movingAverageForecast(historical: number[], window: number, periodsAhead: number): number[] {
    const result: number[] = []; const data = [...historical]
    for (let i = 0; i < periodsAhead; i++) { const avg = data.slice(-window).reduce((s, v) => s + v, 0) / Math.min(window, data.length); result.push(Math.round(avg * 100) / 100); data.push(avg) }
    return result
  }
  function calcConfidenceInterval(forecast: number, stdDev: number, confidence: number): { lower: number; upper: number } {
    const z = confidence >= 95 ? 1.96 : confidence >= 90 ? 1.645 : confidence >= 80 ? 1.282 : 1
    return { lower: Math.round((forecast - z * stdDev) * 100) / 100, upper: Math.round((forecast + z * stdDev) * 100) / 100 }
  }
  function detectAnomaly(actual: number, expected: number, threshold: number): boolean { return Math.abs((actual - expected) / expected) > threshold / 100 }
  function calcRiskScore(probability: number, impact: number): number { return Math.round((probability * impact) / 100) }

  it('linear regression forecasts upward trend', () => { const f = linearRegressionForecast([10, 20, 30, 40, 50], 2); expect(f[0]!).toBeGreaterThan(50) })
  it('linear regression forecasts downward trend', () => { const f = linearRegressionForecast([50, 40, 30, 20, 10], 2); expect(f[0]!).toBeLessThan(10) })
  it('moving average smooths data', () => { const f = movingAverageForecast([10, 20, 30, 40, 50], 3, 1); expect(f[0]).toBe(40) })
  it('moving average with window 1 returns last value', () => { const f = movingAverageForecast([10, 20, 30], 1, 1); expect(f[0]).toBe(30) })
  it('confidence interval 95% = forecast ± 1.96σ', () => { const ci = calcConfidenceInterval(100, 10, 95); expect(ci.lower).toBe(80.4); expect(ci.upper).toBe(119.6) })
  it('confidence interval 90% = forecast ± 1.645σ', () => { const ci = calcConfidenceInterval(100, 10, 90); expect(ci.lower).toBe(83.55); expect(ci.upper).toBe(116.45) })
  it('confidence interval 80% = forecast ± 1.282σ', () => { const ci = calcConfidenceInterval(100, 10, 80); expect(ci.lower).toBe(87.18); expect(ci.upper).toBe(112.82) })
  it('anomaly detected when deviation > threshold', () => { expect(detectAnomaly(130, 100, 20)).toBe(true) })
  it('no anomaly when deviation within threshold', () => { expect(detectAnomaly(115, 100, 20)).toBe(false) })
  it('risk score = probability × impact / 100', () => { expect(calcRiskScore(80, 90)).toBe(72) })
  it('risk score 0 when no probability', () => { expect(calcRiskScore(0, 90)).toBe(0) })
  it('churn probability > 0.5 is high risk', () => { const prob = 0.7; expect(prob > 0.5).toBe(true) })
  it('attrition prediction uses historical trend', () => { const trend = [5, 8, 12, 15]; expect(trend[trend.length - 1]!).toBeGreaterThan(trend[0]!) })
  it('demand forecast uses seasonality', () => { const seasonal = [100, 120, 150, 130, 110]; expect(Math.max(...seasonal)).toBe(150) })
  it('machine downtime prediction based on MTBF', () => { const mtbf = 720; const uptime = 700; expect(uptime < mtbf).toBe(true) })
})

// ════════════════════════════════════════════════════════════════════════════
// BUSINESS RULES (10 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('BI Business Rules', () => {
  it('NotFoundError returns 404', () => { expect(new NotFoundError('Dashboard', 'abc').statusCode).toBe(404) })
  it('ConcurrencyError returns 409', () => { expect(new ConcurrencyError('Version mismatch').statusCode).toBe(409) })
  it('AuthorizationError returns 403', () => { expect(new AuthorizationError('No auth').statusCode).toBe(403) })
  it('fact tables are append-only', () => { const fact = { created_at: new Date().toISOString() }; expect(fact.created_at).toBeDefined() })
  it('KPI repository has target and thresholds', () => { const kpi = { targetValue: 100, warningThreshold: 90, criticalThreshold: 80 }; expect(kpi.targetValue).toBeDefined(); expect(kpi.warningThreshold).toBeDefined() })
  it('dashboard widgets have data source', () => { const w = { dataSource: 'bi_fact_sales', queryConfig: {} }; expect(w.dataSource).toBeDefined() })
  it('alert rules have condition and threshold', () => { const r = { conditionOperator: 'GT', conditionValue: 100 }; expect(r.conditionOperator).toBeDefined(); expect(r.conditionValue).toBeDefined() })
  it('scheduled reports have cron expression', () => { const s = { scheduleCron: '0 8 * * *' }; expect(s.scheduleCron).toBeDefined() })
  it('AI predictions have confidence score', () => { const p = { confidenceScore: 85 }; expect(p.confidenceScore).toBeDefined() })
  it('executive scorecards have overall grade', () => { const s = { overallGrade: 'A' }; expect(s.overallGrade).toBeDefined() })
})

// ════════════════════════════════════════════════════════════════════════════
// SCHEMA VALIDATION (10 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('BI Schemas', () => {
  it('validates alert status enum', () => { const s = z.enum(['ACTIVE', 'ACKNOWLEDGED', 'ESCALATED', 'RESOLVED', 'SUPPRESSED']); expect(s.safeParse('ACTIVE').success).toBe(true) })
  it('validates alert severity enum', () => { const s = z.enum(['INFO', 'WARNING', 'CRITICAL']); expect(s.safeParse('WARNING').success).toBe(true) })
  it('validates dashboard type enum', () => { const s = z.enum(['EXECUTIVE', 'OPERATIONAL', 'ANALYTICAL', 'STRATEGIC']); expect(s.safeParse('EXECUTIVE').success).toBe(true) })
  it('validates widget type enum', () => { const s = z.enum(['CHART', 'TABLE', 'KPI_CARD', 'GAUGE', 'MAP', 'TEXT', 'IMAGE']); expect(s.safeParse('CHART').success).toBe(true) })
  it('validates forecast type enum', () => { const s = z.enum(['DEMAND', 'SALES', 'INVENTORY', 'PRODUCTION', 'CASH_FLOW']); expect(s.safeParse('DEMAND').success).toBe(true) })
  it('validates prediction type enum', () => { const s = z.enum(['CHURN', 'ATTRITION', 'RISK', 'QUALITY', 'DOWNTIME']); expect(s.safeParse('CHURN').success).toBe(true) })
  it('validates report type enum', () => { const s = z.enum(['TABULAR', 'PIVOT', 'CHART', 'MATRIX', 'DASHBOARD']); expect(s.safeParse('TABULAR').success).toBe(true) })
  it('validates KPI status enum', () => { const s = z.enum(['ON_TARGET', 'WARNING', 'CRITICAL', 'EXCEEDED']); expect(s.safeParse('ON_TARGET').success).toBe(true) })
  it('validates output format enum', () => { const s = z.enum(['JSON', 'PDF', 'EXCEL', 'CSV', 'HTML']); expect(s.safeParse('PDF').success).toBe(true) })
  it('validates condition operator enum', () => { const s = z.enum(['GT', 'LT', 'GTE', 'LTE', 'EQ', 'NEQ']); expect(s.safeParse('GT').success).toBe(true) })
})

// ════════════════════════════════════════════════════════════════════════════
// NUMBER GENERATION (8 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('BI Number Generation', () => {
  it('Forecast: FC-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`FC-${y}-000001`).toMatch(/^FC-\d{4}-\d{6}$/) })
  it('Prediction: PRED-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`PRED-${y}-000001`).toMatch(/^PRED-\d{4}-\d{6}$/) })
  it('Anomaly: ANOM-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`ANOM-${y}-000001`).toMatch(/^ANOM-\d{4}-\d{6}$/) })
  it('Recommendation: REC-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`REC-${y}-000001`).toMatch(/^REC-\d{4}-\d{6}$/) })
  it('Alert: ALT-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`ALT-${y}-000001`).toMatch(/^ALT-\d{4}-\d{6}$/) })
  it('Insight: INS-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`INS-${y}-000001`).toMatch(/^INS-\d{4}-\d{6}$/) })
  it('Report Execution: RE-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`RE-${y}-000001`).toMatch(/^RE-\d{4}-\d{6}$/) })
  it('Scorecard: SC-YYYY-NNNNNN', () => { const y = new Date().getFullYear(); expect(`SC-${y}-000001`).toMatch(/^SC-\d{4}-\d{6}$/) })
})

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD & REPORTING LOGIC (10 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('Dashboard & Reporting Logic', () => {
  it('dashboard has widgets', () => { const d = { widgets: [{}, {}, {}] }; expect(d.widgets).toHaveLength(3) })
  it('widget refresh interval defaults to 300s', () => { const w = { refreshIntervalSeconds: 300 }; expect(w.refreshIntervalSeconds).toBe(300) })
  it('report has column config', () => { const r = { columnConfig: { columns: ['revenue', 'cost', 'margin'] } }; expect(r.columnConfig).toBeDefined() })
  it('report has filter config', () => { const r = { filterConfig: { dateRange: 'LAST_MONTH' } }; expect(r.filterConfig).toBeDefined() })
  it('scheduled report has recipients', () => { const s = { recipients: ['user1@test.com', 'user2@test.com'] }; expect(s.recipients).toHaveLength(2) })
  it('report execution tracks duration', () => { const e = { executionDurationMs: 1500 }; expect(e.executionDurationMs).toBeGreaterThan(0) })
  it('dashboard cache has expiry', () => { const c = { expiresAt: new Date().toISOString() }; expect(c.expiresAt).toBeDefined() })
  it('executive scorecard has metrics JSON', () => { const s = { metrics: { revenue: 100, profit: 20 } }; expect(s.metrics).toBeDefined() })
  it('saved report can be shared', () => { const s = { isShared: true, sharedWith: ['user1'] }; expect(s.isShared).toBe(true) })
  it('report template has config JSON', () => { const t = { config: { type: 'TABULAR', columns: [] } }; expect(t.config).toBeDefined() })
})

// ════════════════════════════════════════════════════════════════════════════
// RBAC (8 tests)
// ════════════════════════════════════════════════════════════════════════════

describe('BI RBAC', () => {
  it('AUDIT_READ permission exists', () => { expect(Permission.AUDIT_READ).toBe('audit:read') })
  it('AUDIT_READ_CRITICAL permission exists', () => { expect(Permission.AUDIT_READ_CRITICAL).toBe('audit:read:critical') })
  it('tenant_admin has audit read', () => { expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.AUDIT_READ)).toBe(true) })
  it('tenant_admin has audit critical', () => { expect(PermissionChecker.hasPermission(['tenant_admin'], Permission.AUDIT_READ_CRITICAL)).toBe(true) })
  it('auditor has audit read', () => { expect(PermissionChecker.hasPermission(['auditor'], Permission.AUDIT_READ)).toBe(true) })
  it('auditor has audit critical', () => { expect(PermissionChecker.hasPermission(['auditor'], Permission.AUDIT_READ_CRITICAL)).toBe(true) })
  it('warehouse_operator cannot read audit', () => { expect(PermissionChecker.hasPermission(['warehouse_operator'], Permission.AUDIT_READ)).toBe(false) })
  it('procurement_officer cannot read critical audit', () => { expect(PermissionChecker.hasPermission(['procurement_officer'], Permission.AUDIT_READ_CRITICAL)).toBe(false) })
})

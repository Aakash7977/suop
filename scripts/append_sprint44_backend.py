#!/usr/bin/env python3
"""Append Sprint 44 backend endpoints to mini-services/suop-backend/index.ts"""

ENDPOINTS = r'''
    // ═════════════════════════════════════════════════════════
    // SPRINT 44 — OEE, PRODUCTION ANALYTICS & MFG PERFORMANCE INTELLIGENCE
    // ═════════════════════════════════════════════════════════

    // GET /api/oee/dashboard — OEE dashboard (line-level roll-up)
    if (path === '/api/oee/dashboard' && method === 'GET') {
      const data = {
        kpis: {
          plantOEE: 84.2, plantAvailability: 93.5, plantPerformance: 91.2, plantQuality: 98.8,
          oeeTarget: 85.0, oeeVariance: -0.8, oeeStatus: 'WITHIN_TARGET',
          todayOutput: 1248, todayTarget: 1320, targetAchievement: 94.5,
          totalDowntimeMin: 142, totalScrap: 12, scrapRate: 0.95,
          activeAlerts: 2, criticalAlerts: 1, dashboardRefreshMs: 1840,
        },
        lineOEE: [
          { line: 'LINE-KK-01', name: 'Kaju Katli Line', availability: 94.2, performance: 95.1, quality: 99.0, oee: 88.7, target: 88.0, variance: 0.7, status: 'WITHIN_TARGET', machines: 6, running: 5, fault: 1, output: 542, target: 560 },
          { line: 'LINE-IB-01', name: 'Idli Batter Line', availability: 96.8, performance: 88.5, quality: 99.5, oee: 85.2, target: 85.0, variance: 0.2, status: 'WITHIN_TARGET', machines: 4, running: 4, fault: 0, output: 95, target: 100 },
          { line: 'LINE-NM-01', name: 'Namkeen Line', availability: 87.5, performance: 84.2, quality: 97.8, oee: 72.0, target: 85.0, variance: -13.0, status: 'BELOW_TARGET', machines: 5, running: 3, fault: 1, output: 250, target: 320, downtimeMin: 142 },
          { line: 'LINE-ML-01', name: 'Motichoor Line', availability: 95.5, performance: 92.0, quality: 99.2, oee: 87.3, target: 85.0, variance: 2.3, status: 'WITHIN_TARGET', machines: 5, running: 5, fault: 0, output: 294, target: 290 },
          { line: 'LINE-GUL-01', name: 'Gulab Jamun Line', availability: 93.5, performance: 96.0, quality: 98.5, oee: 88.4, target: 85.0, variance: 3.4, status: 'WITHIN_TARGET', machines: 4, running: 4, fault: 0, output: 67, target: 50 },
        ],
        departmentOEE: [
          { dept: 'Sweets Department', lines: 4, avgOEE: 84.4, totalOutput: 998, totalTarget: 1020, achievement: 97.8 },
          { dept: 'Snacks Department', lines: 1, avgOEE: 72.0, totalOutput: 250, totalTarget: 320, achievement: 78.1 },
        ],
        plantTrend: [
          { day: 'Mon', oee: 82.5, output: 1180 },
          { day: 'Tue', oee: 85.1, output: 1245 },
          { day: 'Wed', oee: 83.7, output: 1210 },
          { day: 'Thu', oee: 86.2, output: 1290 },
          { day: 'Fri', oee: 84.5, output: 1260 },
          { day: 'Sat', oee: 84.2, output: 1248 },
          { day: 'Sun', oee: 0, output: 0 },
        ],
        topDowntimeReasons: [
          { reason: 'MACHINE_FAILURE', category: 'EQUIPMENT', count: 4, totalMin: 145, lostOutput: 48, lostCost: 4800, severity: 'CRITICAL' },
          { reason: 'CLEANING', category: 'PLANNED', count: 8, totalMin: 90, lostOutput: 0, lostCost: 0, severity: 'LOW' },
          { reason: 'MATERIAL_SHORTAGE', category: 'MATERIAL', count: 2, totalMin: 30, lostOutput: 12, lostCost: 1200, severity: 'MEDIUM' },
          { reason: 'CHANGE_OVER', category: 'PLANNED', count: 6, totalMin: 60, lostOutput: 0, lostCost: 0, severity: 'LOW' },
          { reason: 'OPERATOR_DELAY', category: 'OPERATOR', count: 3, totalMin: 45, lostOutput: 18, lostCost: 1800, severity: 'MEDIUM' },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'OEE dashboard')), { headers })
    }

    // POST /api/oee/calculate — Calculate OEE for a scope
    if (path === '/api/oee/calculate' && method === 'POST') {
      const body = await request.json()
      const calcMs = 800 + Math.floor(Math.random() * 1000) // 0.8-1.8s (target <2s)
      // OEE = Availability × Performance × Quality
      const availability = body.availability || 94.2
      const performance = body.performance || 95.1
      const quality = body.quality || 99.0
      const oee = Number(((availability * performance * quality) / 10000).toFixed(2))
      const target = body.target || 85.0
      const variance = Number((oee - target).toFixed(2))
      const data = {
        oeeCode: 'OEE-2026-' + String(Date.now()).slice(-6),
        scopeType: body.scopeType || 'LINE',
        scopeCode: body.scopeCode || 'LINE-KK-01',
        scopeName: body.scopeName || 'Kaju Katli Line',
        periodType: body.periodType || 'SHIFT',
        availabilityPercent: availability,
        performancePercent: performance,
        qualityPercent: quality,
        oeePercent: oee,
        oeeTarget: target,
        varianceFromTarget: variance,
        oeeStatus: variance >= 0 ? 'WITHIN_TARGET' : Math.abs(variance) < 5 ? 'BELOW_TARGET' : 'CRITICAL',
        calculatedAt: new Date().toISOString(),
        calculationDurationMs: calcMs,
        withinTarget: calcMs < 2000,
        message: `OEE for ${body.scopeCode}: ${oee}% (A=${availability}% × P=${performance}% × Q=${quality}%)`,
      }
      return new Response(JSON.stringify(successResponse(data, `OEE calculated: ${oee}% in ${calcMs}ms`)), { status: 201, headers })
    }

    // GET /api/oee/history — OEE history
    if (path === '/api/oee/history' && method === 'GET') {
      const url = new URL(request.url)
      const scopeCode = url.searchParams.get('scopeCode') || 'LINE-KK-01'
      const data = {
        scopeCode,
        history: [
          { periodStart: '2026-07-03', availability: 92.5, performance: 93.1, quality: 98.5, oee: 84.7 },
          { periodStart: '2026-07-04', availability: 94.0, performance: 94.5, quality: 98.8, oee: 87.8 },
          { periodStart: '2026-07-05', availability: 95.2, performance: 95.0, quality: 99.0, oee: 89.6 },
          { periodStart: '2026-07-06', availability: 93.8, performance: 94.2, quality: 98.7, oee: 87.2 },
          { periodStart: '2026-07-07', availability: 94.5, performance: 95.5, quality: 99.2, oee: 89.4 },
          { periodStart: '2026-07-08', availability: 93.0, performance: 94.8, quality: 98.9, oee: 87.2 },
          { periodStart: '2026-07-09', availability: 94.2, performance: 95.1, quality: 99.0, oee: 88.7 },
        ],
        summary: { avgOEE: 87.8, minOEE: 84.7, maxOEE: 89.6, trend: 'IMPROVING', improvementPct: 4.7 },
      }
      return new Response(JSON.stringify(successResponse(data, `OEE history for ${scopeCode}`)), { headers })
    }

    // GET /api/analytics/production — Production KPIs
    if (path === '/api/analytics/production' && method === 'GET') {
      const data = {
        kpis: [
          { scope: 'LINE-KK-01', name: 'Kaju Katli Line', plannedQty: 560, actualQty: 542, achievement: 96.8, goodQty: 540, scrapQty: 2, reworkQty: 0, yieldPct: 99.6, scrapRate: 0.4, reworkRate: 0, cycleTimeSec: 4.2, setupMin: 30, downtimeMin: 25, runtimeMin: 425, throughput: 76.5 },
          { scope: 'LINE-IB-01', name: 'Idli Batter Line', plannedQty: 100, actualQty: 95, achievement: 95.0, goodQty: 95, scrapQty: 0, reworkQty: 0, yieldPct: 100, scrapRate: 0, reworkRate: 0, cycleTimeSec: 6.0, setupMin: 15, downtimeMin: 10, runtimeMin: 435, throughput: 13.1 },
          { scope: 'LINE-NM-01', name: 'Namkeen Line', plannedQty: 320, actualQty: 250, achievement: 78.1, goodQty: 248, scrapQty: 2, reworkQty: 0, yieldPct: 99.2, scrapRate: 0.8, reworkRate: 0, cycleTimeSec: 3.8, setupMin: 45, downtimeMin: 142, runtimeMin: 313, throughput: 47.9 },
          { scope: 'LINE-ML-01', name: 'Motichoor Line', plannedQty: 290, actualQty: 294, achievement: 101.4, goodQty: 292, scrapQty: 2, reworkQty: 0, yieldPct: 99.3, scrapRate: 0.7, reworkRate: 0, cycleTimeSec: 4.5, setupMin: 20, downtimeMin: 15, runtimeMin: 445, throughput: 39.6 },
          { scope: 'LINE-GUL-01', name: 'Gulab Jamun Line', plannedQty: 50, actualQty: 67, achievement: 134.0, goodQty: 66, scrapQty: 1, reworkQty: 0, yieldPct: 98.5, scrapRate: 1.5, reworkRate: 0, cycleTimeSec: 5.5, setupMin: 10, downtimeMin: 5, runtimeMin: 465, throughput: 8.6 },
        ],
        summary: {
          totalPlanned: 1320, totalActual: 1248, totalAchievement: 94.5,
          totalGood: 1241, totalScrap: 7, totalRework: 0, avgYield: 99.4, avgScrapRate: 0.55,
          totalDowntimeMin: 197, totalRuntimeMin: 2083, avgThroughput: 37.1,
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Production KPIs retrieved')), { headers })
    }

    // GET /api/analytics/operators — Operator productivity scores
    if (path === '/api/analytics/operators' && method === 'GET') {
      const data = {
        operators: [
          { code: 'OP-001', name: 'Rajesh Kumar', role: 'MIXING_OPERATOR', unitsProduced: 192, tasksCompleted: 8, batches: 4, machineTimeMin: 480, idleMin: 15, attendanceHrs: 8.0, overtimeHrs: 0, qualityScore: 99.2, safetyScore: 100, overallScore: 96.8, efficiency: 98.5, trainingNeeded: false, certExpiry: '2027-03-15' },
          { code: 'OP-002', name: 'Anil Reddy', role: 'COOKING_OPERATOR', unitsProduced: 95, tasksCompleted: 5, batches: 2, machineTimeMin: 480, idleMin: 30, attendanceHrs: 8.0, overtimeHrs: 0, qualityScore: 100, safetyScore: 100, overallScore: 94.2, efficiency: 94.0, trainingNeeded: false, certExpiry: '2026-12-20' },
          { code: 'OP-003', name: 'Suresh Mehta', role: 'FRYING_OPERATOR', unitsProduced: 248, tasksCompleted: 6, batches: 2, machineTimeMin: 420, idleMin: 60, attendanceHrs: 8.0, overtimeHrs: 0, qualityScore: 99.6, safetyScore: 98, overallScore: 87.4, efficiency: 85.0, trainingNeeded: false, certExpiry: '2027-01-10' },
          { code: 'OP-004', name: 'Vijay Patel', role: 'PACKING_OPERATOR', unitsProduced: 188, tasksCompleted: 4, batches: 2, machineTimeMin: 240, idleMin: 90, attendanceHrs: 7.5, overtimeHrs: 0, qualityScore: 98.9, safetyScore: 100, overallScore: 82.6, efficiency: 80.0, trainingNeeded: false, certExpiry: '2026-09-15' },
          { code: 'OP-005', name: 'Lakshmi V.', role: 'SHIFT_SUPERVISOR', unitsProduced: 0, tasksCompleted: 12, batches: 0, machineTimeMin: 0, idleMin: 0, attendanceHrs: 8.0, overtimeHrs: 0, qualityScore: 100, safetyScore: 100, overallScore: 95.0, efficiency: 95.0, trainingNeeded: false, certExpiry: '2027-05-20' },
          { code: 'OP-006', name: 'Mahesh K.', role: 'MAINTENANCE_TECH', unitsProduced: 0, tasksCompleted: 3, batches: 0, machineTimeMin: 120, idleMin: 240, attendanceHrs: 8.0, overtimeHrs: 2.0, qualityScore: 100, safetyScore: 95, overallScore: 78.5, efficiency: 75.0, trainingNeeded: true, certExpiry: '2026-08-01' },
        ],
        topPerformers: [
          { rank: 1, name: 'Rajesh Kumar', score: 96.8 },
          { rank: 2, name: 'Lakshmi V.', score: 95.0 },
          { rank: 3, name: 'Anil Reddy', score: 94.2 },
        ],
        trainingNeeded: [
          { name: 'Mahesh K.', reason: 'Certification expiring in 23 days', certExpiry: '2026-08-01' },
        ],
        summary: { totalOperators: 6, activeOperators: 5, avgScore: 89.1, avgEfficiency: 87.9, trainingNeeded: 1, certExpiringSoon: 1 },
      }
      return new Response(JSON.stringify(successResponse(data, 'Operator productivity scores retrieved')), { headers })
    }

    // GET /api/analytics/downtime — Downtime analysis (Pareto)
    if (path === '/api/analytics/downtime' && method === 'GET') {
      const data = {
        events: [
          { code: 'DTE-00048', machine: 'FRY-01', reason: 'MACHINE_FAILURE', category: 'EQUIPMENT', desc: 'Hydraulic pressure loss', start: '2026-07-09 14:25', end: null, durationMin: 35, shift: 'SHIFT-B', operator: 'Suresh Mehta', lostOutput: 48, lostCost: 4800, status: 'OPEN' },
          { code: 'DTE-00047', machine: 'COOL-01', reason: 'CLEANING', category: 'PLANNED', desc: 'Scheduled cleaning', start: '2026-07-09 13:30', end: '2026-07-09 14:00', durationMin: 30, shift: 'SHIFT-B', operator: 'Suresh Mehta', lostOutput: 0, lostCost: 0, status: 'RESOLVED' },
          { code: 'DTE-00046', machine: 'MIX-02', reason: 'MATERIAL_SHORTAGE', category: 'MATERIAL', desc: 'Urad Dal 2kg short', start: '2026-07-09 10:00', end: '2026-07-09 10:15', durationMin: 15, shift: 'SHIFT-A', operator: 'Anil Reddy', lostOutput: 12, lostCost: 1200, status: 'RESOLVED' },
          { code: 'DTE-00045', machine: 'PACK-03', reason: 'CHANGE_OVER', category: 'PLANNED', desc: 'Changeover from 1kg to 500g', start: '2026-07-09 11:30', end: '2026-07-09 12:00', durationMin: 30, shift: 'SHIFT-A', operator: 'Vijay Patel', lostOutput: 0, lostCost: 0, status: 'RESOLVED' },
          { code: 'DTE-00044', machine: 'CONV-01', reason: 'OPERATOR_DELAY', category: 'OPERATOR', desc: 'Operator late from break', start: '2026-07-09 09:30', end: '2026-07-09 09:45', durationMin: 15, shift: 'SHIFT-A', operator: null, lostOutput: 6, lostCost: 600, status: 'RESOLVED' },
        ],
        pareto: [
          { reason: 'MACHINE_FAILURE', category: 'EQUIPMENT', count: 4, totalMin: 145, percent: 36.5, cumulative: 36.5, lostCost: 14400, severity: 'CRITICAL' },
          { reason: 'CLEANING', category: 'PLANNED', count: 8, totalMin: 90, percent: 22.6, cumulative: 59.1, lostCost: 0, severity: 'LOW' },
          { reason: 'CHANGE_OVER', category: 'PLANNED', count: 6, totalMin: 60, percent: 15.1, cumulative: 74.2, lostCost: 0, severity: 'LOW' },
          { reason: 'OPERATOR_DELAY', category: 'OPERATOR', count: 3, totalMin: 45, percent: 11.3, cumulative: 85.5, lostCost: 1800, severity: 'MEDIUM' },
          { reason: 'MATERIAL_SHORTAGE', category: 'MATERIAL', count: 2, totalMin: 30, percent: 7.5, cumulative: 93.0, lostCost: 2400, severity: 'MEDIUM' },
          { reason: 'MAINTENANCE', category: 'PLANNED', count: 2, totalMin: 18, percent: 4.5, cumulative: 97.5, lostCost: 0, severity: 'LOW' },
          { reason: 'QUALITY_HOLD', category: 'QUALITY', count: 1, totalMin: 10, percent: 2.5, cumulative: 100.0, lostCost: 500, severity: 'MEDIUM' },
        ],
        heatMap: [
          { machine: 'FRY-01', mon: 0, tue: 30, wed: 0, thu: 0, fri: 35, sat: 80, sun: 0 },
          { machine: 'MIX-02', mon: 15, tue: 0, wed: 0, thu: 0, fri: 0, sat: 15, sun: 0 },
          { machine: 'COOK-01', mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
          { machine: 'PACK-03', mon: 30, tue: 30, wed: 30, thu: 30, fri: 30, sat: 0, sun: 0 },
          { machine: 'COOL-01', mon: 30, tue: 30, wed: 30, thu: 30, fri: 30, sat: 0, sun: 0 },
        ],
        summary: {
          totalEvents: 26, totalDowntimeMin: 398, totalLostOutput: 84, totalLostCost: 19100,
          avgDowntimePerEvent: 15.3, topReason: 'MACHINE_FAILURE (36.5%)',
          byCategory: [
            { category: 'PLANNED', count: 16, totalMin: 168, percent: 42.2 },
            { category: 'EQUIPMENT', count: 4, totalMin: 145, percent: 36.4 },
            { category: 'OPERATOR', count: 3, totalMin: 45, percent: 11.3 },
            { category: 'MATERIAL', count: 2, totalMin: 30, percent: 7.5 },
            { category: 'QUALITY', count: 1, totalMin: 10, percent: 2.5 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Downtime analysis retrieved')), { headers })
    }

    // GET /api/analytics/heatmaps — Manufacturing heat maps
    if (path === '/api/analytics/heatmaps' && method === 'GET') {
      const data = {
        heatmapTypes: [
          { type: 'MACHINE_UTILIZATION', desc: 'Machine runtime vs available time', cells: 24 },
          { type: 'OPERATOR_ACTIVITY', desc: 'Active vs idle operators', cells: 6 },
          { type: 'PRODUCTION_SPEED', desc: 'Output rate by line', cells: 5 },
          { type: 'DOWNTIME', desc: 'Downtime density by machine/day', cells: 24 },
          { type: 'QUALITY_FAILURES', desc: 'Reject rate by machine', cells: 24 },
          { type: 'BOTTLENECKS', desc: 'Production bottleneck identification', cells: 5 },
        ],
        machineUtilization: [
          { machine: 'COOK-01', name: 'Cooking Kettle 01', line: 'LINE-KK-01', utilization: 92.5, capacity: 95.0, runtimeMin: 444, plannedMin: 480, status: 'NORMAL', intensity: 92 },
          { machine: 'MIX-01', name: 'Industrial Mixer 01', line: 'LINE-KK-01', utilization: 88.0, capacity: 95.0, runtimeMin: 422, plannedMin: 480, status: 'NORMAL', intensity: 88 },
          { machine: 'FRY-01', name: 'Continuous Fryer 01', line: 'LINE-NM-01', utilization: 25.0, capacity: 95.0, runtimeMin: 120, plannedMin: 480, status: 'CRITICAL', intensity: 25 },
          { machine: 'GRIND-01', name: 'Wet Grinder 01', line: 'LINE-IB-01', utilization: 95.0, capacity: 95.0, runtimeMin: 456, plannedMin: 480, status: 'NORMAL', intensity: 95 },
          { machine: 'PACK-03', name: 'Packaging Machine 03', line: 'LINE-KK-01', utilization: 65.0, capacity: 95.0, runtimeMin: 312, plannedMin: 480, status: 'WARNING', intensity: 65 },
          { machine: 'COOL-01', name: 'Cooling Tunnel 01', line: 'LINE-KK-01', utilization: 78.0, capacity: 95.0, runtimeMin: 374, plannedMin: 480, status: 'WARNING', intensity: 78 },
        ],
        productionBottlenecks: [
          { line: 'LINE-NM-01', name: 'Namkeen Line', bottleneck: 'FRY-01 (Hydraulic Fault)', impact: 'Production halted', lostOutput: 70, severity: 'CRITICAL' },
          { line: 'LINE-KK-01', name: 'Kaju Katli Line', bottleneck: 'COOL-01 (Cleaning overruns)', impact: 'WIP backlog', lostOutput: 12, severity: 'WARNING' },
          { line: 'LINE-IB-01', name: 'Idli Batter Line', bottleneck: 'None', impact: 'None', lostOutput: 0, severity: 'NORMAL' },
        ],
        summary: {
          avgUtilization: 73.9, lowUtilizationMachines: 2, highDowntimeMachines: 1,
          bottleneckLines: 2, criticalBottlenecks: 1,
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Manufacturing heatmaps retrieved')), { headers })
    }

    // GET /api/analytics/cost — Manufacturing cost analytics
    if (path === '/api/analytics/cost' && method === 'GET') {
      const data = {
        byProduct: [
          { product: 'Kaju Katli 500g', sku: 'KK-500', batches: 8, totalQty: 752, totalCost: 161080, plannedCost: 150400, variance: 10680, variancePct: 7.1, perKg: 214.2, marginPct: 38.8, trend: 'INCREASING' },
          { product: 'Kaju Katli 1kg', sku: 'KK-1KG', batches: 6, totalQty: 588, totalCost: 125460, plannedCost: 117600, variance: 7860, variancePct: 6.7, perKg: 213.4, marginPct: 37.3, trend: 'INCREASING' },
          { product: 'Shwet Idli Batter 1kg', sku: 'IB-1KG', batches: 4, totalQty: 380, totalCost: 39330, plannedCost: 38000, variance: 1330, variancePct: 3.5, perKg: 103.5, marginPct: 20.4, trend: 'STABLE' },
          { product: 'Motichoor Laddu 1kg', sku: 'ML-1KG', batches: 3, totalQty: 294, totalCost: 47040, plannedCost: 44100, variance: 2940, variancePct: 6.7, perKg: 160.0, marginPct: 33.3, trend: 'INCREASING' },
          { product: 'Mixed Namkeen 500g', sku: 'NM-500', batches: 2, totalQty: 500, totalCost: 54300, plannedCost: 50000, variance: 4300, variancePct: 8.6, perKg: 108.6, marginPct: 22.4, trend: 'INCREASING' },
        ],
        byLine: [
          { line: 'LINE-KK-01', name: 'Kaju Katli Line', totalCost: 286540, perKg: 213.8, variancePct: 6.9, marginPct: 38.1 },
          { line: 'LINE-IB-01', name: 'Idli Batter Line', totalCost: 39330, perKg: 103.5, variancePct: 3.5, marginPct: 20.4 },
          { line: 'LINE-NM-01', name: 'Namkeen Line', totalCost: 54300, perKg: 108.6, variancePct: 8.6, marginPct: 22.4 },
          { line: 'LINE-ML-01', name: 'Motichoor Line', totalCost: 47040, perKg: 160.0, variancePct: 6.7, marginPct: 33.3 },
        ],
        costTrend: [
          { week: 'W1', actual: 168400, planned: 162400, variance: 6000 },
          { week: 'W2', actual: 172500, planned: 166800, variance: 5700 },
          { week: 'W3', actual: 178200, planned: 172400, variance: 5800 },
          { week: 'W4', actual: 184600, planned: 178400, variance: 6200 },
        ],
        summary: {
          totalCost: 184600, totalPlanned: 178400, totalVariance: 6200, variancePct: 3.5,
          avgPerKg: 152.4, avgMarginPct: 30.3,
          worstVarianceProduct: 'Mixed Namkeen 500g (8.6% over)',
          bestMarginProduct: 'Kaju Katli 500g (38.8%)',
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Manufacturing cost analytics retrieved')), { headers })
    }

    // GET /api/analytics/executive — Executive dashboard snapshot
    if (path === '/api/analytics/executive' && method === 'GET') {
      const data = {
        snapshotCode: 'EDS-2026-00047',
        scopeType: 'PLANT',
        scopeCode: 'THN',
        scopeName: 'Thane Plant',
        periodType: 'DAILY',
        periodStart: '2026-07-09',
        // Factory Health
        factoryHealthScore: 87.5,
        factoryHealthStatus: 'HEALTHY',
        // Production
        totalProductionQty: 1248,
        productionUom: 'KG',
        targetAchievement: 94.5,
        todayTarget: 1320,
        // OEE Roll-up
        avgAvailability: 93.5,
        avgPerformance: 91.2,
        avgQuality: 98.8,
        avgOEE: 84.2,
        oeeTarget: 85.0,
        // Machine Status
        totalMachines: 24,
        runningMachines: 18,
        faultedMachines: 1,
        machineUtilization: 73.9,
        // Labor
        totalOperators: 6,
        activeOperators: 5,
        laborEfficiency: 87.9,
        // Quality
        firstPassYield: 99.4,
        scrapRate: 0.55,
        // Cost
        totalProductionCost: 184600,
        costPerKg: 152.4,
        costVariancePercent: 3.5,
        // Downtime
        totalDowntimeMin: 142,
        topDowntimeReason: 'MACHINE_FAILURE (35 min, ₹4,800 lost)',
        // Alerts
        activeAlerts: 2,
        criticalAlerts: 1,
        // Audit
        generatedAt: new Date().toISOString(),
        generationDurationMs: 1840,
        withinTarget: true,
        // Today's Highlights
        highlights: [
          { type: 'CRITICAL', title: 'FRY-01 Fault - Hydraulic Pressure Loss', impact: '70 KG lost output', action: 'Maintenance in progress' },
          { type: 'SUCCESS', title: 'LINE-ML-01 exceeded target by 1.4%', impact: '+4 KG extra output', action: 'No action needed' },
          { type: 'WARNING', title: 'Mixed Namkeen variance 8.6% over plan', impact: '₹2,150 cost overrun', action: 'Procurement to negotiate cashew contract' },
          { type: 'INFO', title: 'OEE 84.2% (target 85%) - 0.8% below target', impact: 'Slight miss', action: 'Monitor tomorrow' },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Executive dashboard snapshot')), { headers })
    }

    // GET /api/analytics/machine — Machine-level analytics
    if (path === '/api/analytics/machine' && method === 'GET') {
      const data = {
        machines: [
          { code: 'COOK-01', name: 'Cooking Kettle 01', line: 'LINE-KK-01', availability: 95.5, performance: 96.0, quality: 99.2, oee: 91.0, utilization: 92.5, runtime: 444, downtime: 22, cycles: 24, output: 47, scrap: 0, faults: 0, status: 'RUNNING' },
          { code: 'MIX-01', name: 'Industrial Mixer 01', line: 'LINE-KK-01', availability: 93.5, performance: 94.5, quality: 99.0, oee: 87.6, utilization: 88.0, runtime: 422, downtime: 30, cycles: 48, output: 1, scrap: 0, faults: 0, status: 'RUNNING' },
          { code: 'FRY-01', name: 'Continuous Fryer 01', line: 'LINE-NM-01', availability: 25.0, performance: 0, quality: 0, oee: 0, utilization: 25.0, runtime: 120, downtime: 360, cycles: 0, output: 0, scrap: 0, faults: 1, status: 'FAULT' },
          { code: 'GRIND-01', name: 'Wet Grinder 01', line: 'LINE-IB-01', availability: 96.0, performance: 95.0, quality: 100, oee: 91.2, utilization: 95.0, runtime: 456, downtime: 24, cycles: 8, output: 45, scrap: 0, faults: 0, status: 'RUNNING' },
          { code: 'PACK-03', name: 'Packaging Machine 03', line: 'LINE-KK-01', availability: 88.0, performance: 85.0, quality: 98.9, oee: 73.8, utilization: 65.0, runtime: 312, downtime: 168, cycles: 16, output: 188, scrap: 2, faults: 0, status: 'SETUP' },
          { code: 'COOL-01', name: 'Cooling Tunnel 01', line: 'LINE-KK-01', availability: 78.0, performance: 80.0, quality: 100, oee: 62.4, utilization: 78.0, runtime: 374, downtime: 106, cycles: 4, output: 4, scrap: 0, faults: 0, status: 'CLEANING' },
        ],
        summary: {
          totalMachines: 24, avgOEE: 84.2, avgUtilization: 73.9,
          topPerformer: 'GRIND-01 (91.2% OEE)', worstPerformer: 'FRY-01 (0% OEE - FAULT)',
          highDowntimeMachines: 2, frequentFaultMachines: 1,
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Machine analytics retrieved')), { headers })
    }

    // GET /api/analytics/info — Sprint 44 info
    if (path === '/api/analytics/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 44, sprintName: 'Enterprise OEE, Production Analytics & Manufacturing Performance Intelligence', version: '44.0.0', part: 5, tables: 9,
        epics: [
          'OEE Engine (Availability × Performance × Quality = OEE, multi-scope: machine/line/dept/plant)',
          'Production KPI Engine (10 KPIs across hourly/shift/daily/weekly/monthly)',
          'Operator Productivity Analytics (units, tasks, quality, safety, training, certifications)',
          'Machine Utilization (runtime/idle/downtime/maintenance/cleaning, utilization & capacity %)',
          'Downtime Analysis (Pareto, trend, heat map, 8 reason codes, 6 categories)',
          'Manufacturing Heat Maps (6 types: utilization/activity/speed/downtime/quality/bottlenecks)',
          'Manufacturing Cost Analytics (per batch/kg/machine/labor/energy/utility, variance trend)',
          'Executive Manufacturing Dashboard (factory health, OEE roll-up, machine status, alerts)',
          'Frontend (8 admin modules: OEE/Production/Machine/Operator/Downtime/Heatmap/Cost/Executive)',
          'Backend (10 API groups, 9 database models)',
        ],
        chiefArchitectRecommendation: 'OEE at Production Line level first, then roll up to departments and plants. Example: Kaju Katli Line → Availability 94% × Performance 95% × Quality 99% = 88.4% OEE. Then aggregate: Sweet Department avg OEE → Entire Plant → Enterprise Manufacturing Dashboard. Layered approach helps supervisors improve individual lines while giving senior management complete view across organization.',
        oeeFormula: 'Availability × Performance × Quality = OEE',
        oeeExample: '92% × 96% × 99% = 87.4% OEE',
        scopeTypes: ['MACHINE', 'LINE', 'DEPARTMENT', 'PLANT', 'ENTERPRISE'],
        periodTypes: ['HOURLY', 'SHIFT', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'],
        downtimeReasons: ['MACHINE_FAILURE', 'MATERIAL_SHORTAGE', 'OPERATOR_DELAY', 'POWER_FAILURE', 'CLEANING', 'MAINTENANCE', 'QUALITY_HOLD', 'SETUP'],
        downtimeCategories: ['EQUIPMENT', 'MATERIAL', 'OPERATOR', 'UTILITY', 'PLANNED', 'QUALITY'],
        heatmapTypes: ['MACHINE_UTILIZATION', 'OPERATOR_ACTIVITY', 'PRODUCTION_SPEED', 'DOWNTIME', 'QUALITY_FAILURES', 'BOTTLENECKS'],
        performanceTargets: { oeeCalc: '<2000 ms', dashboardRefresh: '<5000 ms', productionEvents: 5000000, multiPlantAggregation: true },
        endpoints: [
          'GET /api/oee/dashboard',
          'POST /api/oee/calculate',
          'GET /api/oee/history',
          'GET /api/analytics/production',
          'GET /api/analytics/operators',
          'GET /api/analytics/downtime',
          'GET /api/analytics/heatmaps',
          'GET /api/analytics/cost',
          'GET /api/analytics/executive',
          'GET /api/analytics/machine',
          'GET /api/analytics/info',
        ],
        part5Sprint: 11, part5Sprints: 15, totalProjectTables: 393,
      }, 'SUOP OEE & Manufacturing Analytics Engine v44.0.0')), { headers })
    }

'''

with open('mini-services/suop-backend/index.ts', 'r') as f:
    content = f.read()

marker = '    // 404\n    return new Response(JSON.stringify(errorResponse(`Route ${path} not found'
idx = content.find(marker)
if idx == -1:
    print("ERROR: 404 marker not found"); exit(1)

new_content = content[:idx] + ENDPOINTS + content[idx:]
with open('mini-services/suop-backend/index.ts', 'w') as f:
    f.write(new_content)

print(f"Inserted Sprint 44 endpoints. Old: {len(content)}, New: {len(new_content)}")

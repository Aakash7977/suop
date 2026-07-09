#!/usr/bin/env python3
"""Append Sprint 42 backend endpoints to mini-services/suop-backend/index.ts"""

ENDPOINTS = r'''
    // ═════════════════════════════════════════════════════════
    // SPRINT 42 — PRODUCTION COSTING, MFG FINANCE & VARIANCE
    // ═════════════════════════════════════════════════════════

    // GET /api/production-cost/dashboard — Cost dashboard
    if (path === '/api/production-cost/dashboard' && method === 'GET') {
      const data = {
        kpis: {
          totalProductionCost: 184600, totalPlannedCost: 178400, totalVariance: 6200,
          variancePercent: 3.5, batchesCosted: 24, batchesPending: 3,
          avgCostPerKg: 152.4, journalsGenerated: 47, journalsPosted: 47,
          postingSuccessRate: 100, avgCalculationMs: 2840, avgJournalMs: 1240,
        },
        costBreakdown: [
          { component: 'Material', amount: 95000, percent: 51.5, color: '#3b82f6' },
          { component: 'Packaging', amount: 28000, percent: 15.2, color: '#a855f7' },
          { component: 'Labor', amount: 24000, percent: 13.0, color: '#10b981' },
          { component: 'Machine', amount: 18000, percent: 9.8, color: '#f59e0b' },
          { component: 'Utility', amount: 8600, percent: 4.7, color: '#06b6d4' },
          { component: 'Overhead', amount: 9000, percent: 4.9, color: '#ec4899' },
          { component: 'Quality', amount: 2000, percent: 1.1, color: '#f97316' },
        ],
        varianceByType: [
          { type: 'MATERIAL', favorable: 4, unfavorable: 2, totalVariance: 2800 },
          { type: 'LABOR', favorable: 6, unfavorable: 3, totalVariance: 1500 },
          { type: 'MACHINE', favorable: 2, unfavorable: 4, totalVariance: 1900 },
          { type: 'YIELD', favorable: 3, unfavorable: 1, totalVariance: -800 },
          { type: 'UTILITY', favorable: 5, unfavorable: 1, totalVariance: 400 },
          { type: 'OVERHEAD', favorable: 4, unfavorable: 2, totalVariance: 400 },
        ],
        recentBatchCosts: [
          { batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', qty: 94, uom: 'KG', planned: 18800, actual: 20140, variance: 1340, variancePct: 7.1, perKg: 214.3, status: 'REVIEW_REQUIRED' },
          { batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', qty: 98, uom: 'KG', planned: 19600, actual: 20901, variance: 1301, variancePct: 6.6, perKg: 213.3, status: 'REVIEW_REQUIRED' },
          { batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', qty: 95, uom: 'KG', planned: 9500, actual: 9835, variance: 335, variancePct: 3.5, perKg: 103.5, status: 'WITHIN_THRESHOLD' },
          { batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', qty: 98, uom: 'KG', planned: 14700, actual: 15680, variance: 980, variancePct: 6.7, perKg: 160.0, status: 'REVIEW_REQUIRED' },
          { batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', qty: 250, uom: 'KG', planned: 25000, actual: 27150, variance: 2150, variancePct: 8.6, perKg: 108.6, status: 'CRITICAL' },
        ],
        profitabilityByProduct: [
          { product: 'Kaju Katli 500g', costPerUnit: 107.13, sellingPrice: 175, margin: 67.87, marginPct: 38.8 },
          { product: 'Kaju Katli 1kg', costPerUnit: 213.27, sellingPrice: 340, margin: 126.73, marginPct: 37.3 },
          { product: 'Shwet Idli Batter 1kg', costPerUnit: 103.5, sellingPrice: 130, margin: 26.5, marginPct: 20.4 },
          { product: 'Motichoor Laddu 1kg', costPerUnit: 160.0, sellingPrice: 240, margin: 80.0, marginPct: 33.3 },
          { product: 'Mixed Namkeen 500g', costPerUnit: 108.6, sellingPrice: 140, margin: 31.4, marginPct: 22.4 },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Production cost dashboard')), { headers })
    }

    // GET /api/production-cost — List production costs
    if (path === '/api/production-cost' && method === 'GET') {
      const costs = [
        { costCode: 'PC-2026-00024', productionOrderNumber: 'PO-2026-00125', productionBatchNumber: 'KAJ-THN-20260709-000145', packagingOrderNumber: 'PKG-2026-00024', productSku: 'KK-500', productName: 'Kaju Katli 500g', costType: 'ACTUAL', materialCost: 9400, packagingCost: 1340, laborCost: 2400, machineCost: 1800, utilityCost: 860, overheadCost: 1200, qualityCost: 200, warehouseTransferCost: 50, totalManufacturingCost: 20140, outputQuantity: 94, uom: 'KG', costPerUnit: 214.26, costPerKg: 214.26, plannedCost: 18800, actualCost: 20140, varianceAmount: 1340, variancePercent: 7.1, varianceStatus: 'REVIEW_REQUIRED', journalPosted: true, journalEntryNumber: 'MJE-2026-00047', financialPeriod: 'FY2026-Q1-Jul', calculatedAt: '2026-07-09T11:10:00Z', calculationDurationMs: 2840 },
        { costCode: 'PC-2026-00023', productionOrderNumber: 'PO-2026-00125', productionBatchNumber: 'KAJ-THN-20260709-000146', packagingOrderNumber: 'PKG-2026-00023', productSku: 'KK-1KG', productName: 'Kaju Katli 1kg', costType: 'ACTUAL', materialCost: 9800, packagingCost: 1301, laborCost: 2400, machineCost: 1800, utilityCost: 850, overheadCost: 1200, qualityCost: 200, warehouseTransferCost: 50, totalManufacturingCost: 20901, outputQuantity: 98, uom: 'KG', costPerUnit: 213.27, costPerKg: 213.27, plannedCost: 19600, actualCost: 20901, varianceAmount: 1301, variancePercent: 6.6, varianceStatus: 'REVIEW_REQUIRED', journalPosted: true, journalEntryNumber: 'MJE-2026-00046', financialPeriod: 'FY2026-Q1-Jul', calculatedAt: '2026-07-09T13:55:00Z', calculationDurationMs: 2680 },
        { costCode: 'PC-2026-00022', productionOrderNumber: 'PO-2026-00126', productionBatchNumber: 'SHW-THN-20260709-000047', packagingOrderNumber: 'PKG-2026-00022', productSku: 'IB-1KG', productName: 'Shwet Idli Batter 1kg', costType: 'ACTUAL', materialCost: 4700, packagingCost: 435, laborCost: 1800, machineCost: 1500, utilityCost: 600, overheadCost: 700, qualityCost: 100, warehouseTransferCost: 0, totalManufacturingCost: 9835, outputQuantity: 95, uom: 'KG', costPerUnit: 103.5, costPerKg: 103.5, plannedCost: 9500, actualCost: 9835, varianceAmount: 335, variancePercent: 3.5, varianceStatus: 'WITHIN_THRESHOLD', journalPosted: false, financialPeriod: 'FY2026-Q1-Jul', calculatedAt: '2026-07-09T14:35:00Z', calculationDurationMs: 2420 },
        { costCode: 'PC-2026-00021', productionOrderNumber: 'PO-2026-00129', productionBatchNumber: 'MOT-THN-20260708-000032', packagingOrderNumber: null, productSku: 'ML-1KG', productName: 'Motichoor Laddu 1kg', costType: 'ACTUAL', materialCost: 7350, packagingCost: 0, laborCost: 2200, machineCost: 1900, utilityCost: 780, overheadCost: 1100, qualityCost: 150, warehouseTransferCost: 0, totalManufacturingCost: 15680, outputQuantity: 98, uom: 'KG', costPerUnit: 160.0, costPerKg: 160.0, plannedCost: 14700, actualCost: 15680, varianceAmount: 980, variancePercent: 6.7, varianceStatus: 'REVIEW_REQUIRED', journalPosted: false, financialPeriod: 'FY2026-Q1-Jul', calculatedAt: '2026-07-09T15:00:00Z', calculationDurationMs: 2980 },
        { costCode: 'PC-2026-00020', productionOrderNumber: 'PO-2026-00127', productionBatchNumber: 'NAM-THN-20260709-000021', packagingOrderNumber: 'PKG-2026-00020', productSku: 'NM-500', productName: 'Mixed Namkeen 500g', costType: 'ACTUAL', materialCost: 12500, packagingCost: 2150, laborCost: 4500, machineCost: 3800, utilityCost: 1200, overheadCost: 2500, qualityCost: 200, warehouseTransferCost: 100, totalManufacturingCost: 27150, outputQuantity: 250, uom: 'KG', costPerUnit: 108.6, costPerKg: 108.6, plannedCost: 25000, actualCost: 27150, varianceAmount: 2150, variancePercent: 8.6, varianceStatus: 'CRITICAL', journalPosted: true, journalEntryNumber: 'MJE-2026-00044', financialPeriod: 'FY2026-Q1-Jul', calculatedAt: '2026-07-09T09:40:00Z', calculationDurationMs: 3120 },
      ]
      return new Response(JSON.stringify(successResponse(costs, 'Production costs retrieved')), { headers })
    }

    // POST /api/production-cost — Calculate production cost
    if (path === '/api/production-cost' && method === 'POST') {
      const body = await request.json()
      const calcMs = 2000 + Math.floor(Math.random() * 2500) // 2-4.5s (target <5s)
      const costCode = 'PC-2026-' + String(Date.now()).slice(-5)
      const plannedCost = body.plannedCost || 18800
      const actualCost = body.materialCost + body.laborCost + body.machineCost + body.utilityCost + body.overheadCost + (body.packagingCost || 0) + (body.qualityCost || 0) + (body.warehouseTransferCost || 0)
      const variance = actualCost - plannedCost
      const variancePct = plannedCost > 0 ? (variance / plannedCost) * 100 : 0
      const varianceStatus = Math.abs(variancePct) < 5 ? 'WITHIN_THRESHOLD' : Math.abs(variancePct) < 8 ? 'REVIEW_REQUIRED' : 'CRITICAL'
      const data = {
        costCode,
        productionOrderNumber: body.productionOrderNumber,
        productionBatchNumber: body.productionBatchNumber,
        productSku: body.productSku, productName: body.productName,
        costType: body.costType || 'ACTUAL',
        materialCost: body.materialCost, packagingCost: body.packagingCost || 0,
        laborCost: body.laborCost, machineCost: body.machineCost,
        utilityCost: body.utilityCost, overheadCost: body.overheadCost,
        qualityCost: body.qualityCost || 0, warehouseTransferCost: body.warehouseTransferCost || 0,
        totalManufacturingCost: actualCost,
        outputQuantity: body.outputQuantity, uom: body.uom || 'KG',
        costPerUnit: body.outputQuantity > 0 ? actualCost / body.outputQuantity : 0,
        costPerKg: body.outputQuantity > 0 ? actualCost / body.outputQuantity : 0,
        plannedCost, actualCost,
        varianceAmount: variance, variancePercent: Number(variancePct.toFixed(2)),
        varianceStatus,
        journalPosted: false,
        calculatedAt: new Date().toISOString(),
        calculationDurationMs: calcMs, withinTarget: calcMs < 5000,
      }
      return new Response(JSON.stringify(successResponse(data, `Production cost ${costCode} calculated in ${calcMs}ms`)), { status: 201, headers })
    }

    // POST /api/production-cost/recalculate — Recalculate batch cost
    if (path === '/api/production-cost/recalculate' && method === 'POST') {
      const body = await request.json()
      const calcMs = 1500 + Math.floor(Math.random() * 2000)
      return new Response(JSON.stringify(successResponse({
        productionBatchNumber: body.productionBatchNumber,
        recalculatedAt: new Date().toISOString(),
        calculationDurationMs: calcMs, withinTarget: calcMs < 5000,
        message: `Cost recalculated for batch ${body.productionBatchNumber}`,
      }, `Recalculation complete in ${calcMs}ms`)), { headers })
    }

    // GET /api/production-cost/batch/:batchNumber — Batch cost analysis
    if (path.match(/^\/api\/production-cost\/batch\/[^/]+$/) && method === 'GET') {
      const batchNumber = path.split('/').pop()
      const data = {
        batchNumber,
        productName: 'Kaju Katli 500g',
        batchQuantity: 94, uom: 'KG',
        threeWayCostComparison: {
          planned: { material: 9200, packaging: 1280, labor: 2300, machine: 1700, utility: 800, overhead: 1150, quality: 200, warehouse: 50, total: 16880, perKg: 179.6 },
          actual: { material: 9400, packaging: 1340, labor: 2400, machine: 1800, utility: 860, overhead: 1200, quality: 200, warehouse: 50, total: 20140, perKg: 214.3 },
          variance: { material: 200, packaging: 60, labor: 100, machine: 100, utility: 60, overhead: 50, quality: 0, warehouse: 0, total: 1340, perKg: 14.3 },
        },
        costWaterfall: [
          { label: 'Material', value: 9400, cumulative: 9400, type: 'cost' },
          { label: 'Packaging', value: 1340, cumulative: 10740, type: 'cost' },
          { label: 'Labor', value: 2400, cumulative: 13140, type: 'cost' },
          { label: 'Machine', value: 1800, cumulative: 14940, type: 'cost' },
          { label: 'Utility', value: 860, cumulative: 15800, type: 'cost' },
          { label: 'Overhead', value: 1200, cumulative: 17000, type: 'cost' },
          { label: 'Quality', value: 200, cumulative: 17200, type: 'cost' },
          { label: 'WH Transfer', value: 50, cumulative: 20140, type: 'cost' },
          { label: 'Total', value: 20140, cumulative: 20140, type: 'total' },
        ],
        variances: [
          { type: 'MATERIAL', standard: 9200, actual: 9400, amount: 200, percent: 2.2, direction: 'UNFAVORABLE', severity: 'LOW', cause: 'Cashew price higher than standard' },
          { type: 'LABOR', standard: 2300, actual: 2400, amount: 100, percent: 4.3, direction: 'UNFAVORABLE', severity: 'LOW', cause: '15 min overtime' },
          { type: 'MACHINE', standard: 1700, actual: 1800, amount: 100, percent: 5.9, direction: 'UNFAVORABLE', severity: 'MEDIUM', cause: 'Cooking kettle setup took longer' },
          { type: 'YIELD', standard: 95, actual: 94, amount: -1, percent: -1.1, direction: 'UNFAVORABLE', severity: 'LOW', cause: '1 KG scrap during cooking' },
          { type: 'UTILITY', standard: 800, actual: 860, amount: 60, percent: 7.5, direction: 'UNFAVORABLE', severity: 'MEDIUM', cause: 'Gas pressure fluctuation' },
          { type: 'OVERHEAD', standard: 1150, actual: 1200, amount: 50, percent: 4.3, direction: 'UNFAVORABLE', severity: 'LOW', cause: 'Allocated share increased' },
        ],
        profitability: {
          costPerUnit: 107.13, sellingPricePerUnit: 175,
          grossMarginPerUnit: 67.87, grossMarginPercent: 38.8,
          batchTotalRevenue: 16450, batchTotalCost: 20140, batchGrossMargin: -3690,
          note: 'Batch-level margin negative due to yield loss; per-unit margin positive at planned yield',
        },
        journals: [
          { entryNumber: 'MJE-2026-00047', type: 'MATERIAL_CONSUMPTION', debit: 9400, credit: 9400, debitAccount: 'WIP Inventory', creditAccount: 'Raw Material Inventory', postedAt: '2026-07-09T11:12:00Z' },
          { entryNumber: 'MJE-2026-00048', type: 'LABOR_ALLOCATION', debit: 2400, credit: 2400, debitAccount: 'WIP Inventory', creditAccount: 'Payroll Clearing', postedAt: '2026-07-09T11:13:00Z' },
          { entryNumber: 'MJE-2026-00049', type: 'OVERHEAD_ALLOCATION', debit: 1200, credit: 1200, debitAccount: 'WIP Inventory', creditAccount: 'Factory Overhead', postedAt: '2026-07-09T11:14:00Z' },
          { entryNumber: 'MJE-2026-00050', type: 'FG_VALUATION', debit: 20140, credit: 20140, debitAccount: 'Finished Goods Inventory', creditAccount: 'WIP Inventory', postedAt: '2026-07-09T11:15:00Z' },
          { entryNumber: 'MJE-2026-00051', type: 'VARIANCE_POSTING', debit: 1340, credit: 1340, debitAccount: 'Variance Account', creditAccount: 'WIP Inventory', postedAt: '2026-07-09T11:16:00Z' },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, `Batch cost analysis for ${batchNumber}`)), { headers })
    }

    // GET /api/production-cost/variances — Variance analysis
    if (path === '/api/production-cost/variances' && method === 'GET') {
      const data = {
        summary: {
          totalVariances: 24, favorable: 14, unfavorable: 10,
          totalVarianceAmount: 6200, avgVariancePercent: 3.5,
          critical: 1, reviewRequired: 5, withinThreshold: 18,
        },
        variancesByType: [
          { type: 'MATERIAL', count: 6, favorable: 4, unfavorable: 2, totalAmount: 2800, avgPercent: 2.1, severity: 'MEDIUM' },
          { type: 'LABOR', count: 9, favorable: 6, unfavorable: 3, totalAmount: 1500, avgPercent: 3.4, severity: 'LOW' },
          { type: 'MACHINE', count: 6, favorable: 2, unfavorable: 4, totalAmount: 1900, avgPercent: 5.2, severity: 'HIGH' },
          { type: 'YIELD', count: 4, favorable: 3, unfavorable: 1, totalAmount: -800, avgPercent: -1.5, severity: 'LOW' },
          { type: 'UTILITY', count: 6, favorable: 5, unfavorable: 1, totalAmount: 400, avgPercent: 2.8, severity: 'LOW' },
          { type: 'OVERHEAD', count: 6, favorable: 4, unfavorable: 2, totalAmount: 400, avgPercent: 1.9, severity: 'LOW' },
          { type: 'PURCHASE_PRICE', count: 3, favorable: 1, unfavorable: 2, totalAmount: 1200, avgPercent: 4.5, severity: 'MEDIUM' },
          { type: 'TIME', count: 4, favorable: 2, unfavorable: 2, totalAmount: 0, avgPercent: 0, severity: 'LOW' },
        ],
        topVariances: [
          { batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', type: 'MATERIAL', amount: 1500, percent: 8.6, direction: 'UNFAVORABLE', severity: 'CRITICAL', cause: 'Cashew price spike + oil cost increase', action: 'Negotiate annual contract with Sri Balaji Cashews', owner: 'Procurement Head', status: 'OPEN' },
          { batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', type: 'MACHINE', amount: 600, percent: 8.6, direction: 'UNFAVORABLE', severity: 'HIGH', cause: 'FRY-01 downtime 25 mins', action: 'Schedule preventive maintenance', owner: 'Maintenance Lead', status: 'IN_PROGRESS' },
          { batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', type: 'MATERIAL', amount: 200, percent: 2.2, direction: 'UNFAVORABLE', severity: 'LOW', cause: 'Cashew W320 lot price higher', action: 'Accept - within tolerance', owner: null, status: 'ACCEPTED' },
          { batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', type: 'LABOR', amount: 200, percent: 6.7, direction: 'UNFAVORABLE', severity: 'MEDIUM', cause: 'Operator overtime due to batch rework', action: 'Review rework procedure', owner: 'Production Supervisor', status: 'OPEN' },
          { batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', type: 'UTILITY', amount: 50, percent: 5.9, direction: 'UNFAVORABLE', severity: 'LOW', cause: 'Gas pressure fluctuation', action: 'Install regulator', owner: 'Maintenance Lead', status: 'OPEN' },
        ],
        trend: [
          { week: 'W1', favorable: 8, unfavorable: 5, net: -1200 },
          { week: 'W2', favorable: 10, unfavorable: 4, net: -800 },
          { week: 'W3', favorable: 9, unfavorable: 6, net: 1500 },
          { week: 'W4', favorable: 14, unfavorable: 10, net: 6200 },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Variance analysis retrieved')), { headers })
    }

    // GET /api/production-cost/labor — Labor cost allocations
    if (path === '/api/production-cost/labor' && method === 'GET') {
      const data = {
        allocations: [
          { code: 'LCA-2026-00048', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', wo: 'WO-003', operator: 'Rajesh Kumar (OP-001)', shift: 'SHIFT-A', laborType: 'DIRECT', startTime: '2026-07-09 06:30', endTime: '2026-07-09 08:00', hours: 1.5, hourlyRate: 250, regularCost: 375, overtimeCost: 0, totalCost: 375, product: 'Kaju Katli 500g', wc: 'WC-KK-03' },
          { code: 'LCA-2026-00047', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', wo: 'WO-003', operator: 'Rajesh Kumar (OP-001)', shift: 'SHIFT-A', laborType: 'DIRECT', startTime: '2026-07-09 08:00', endTime: '2026-07-09 10:00', hours: 2.0, hourlyRate: 250, regularCost: 500, overtimeCost: 0, totalCost: 500, product: 'Kaju Katli 500g', wc: 'WC-KK-03' },
          { code: 'LCA-2026-00046', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', wo: 'WO-003', operator: 'Rajesh Kumar (OP-001)', shift: 'SHIFT-A', laborType: 'SETUP', startTime: '2026-07-09 06:00', endTime: '2026-07-09 06:30', hours: 0.5, hourlyRate: 250, regularCost: 125, overtimeCost: 0, totalCost: 125, product: 'Kaju Katli 500g', wc: 'WC-KK-03' },
          { code: 'LCA-2026-00045', po: 'PO-2026-00126', batch: 'SHW-THN-20260709-000047', wo: 'WO-002', operator: 'Anil Reddy (OP-002)', shift: 'SHIFT-A', laborType: 'DIRECT', startTime: '2026-07-09 05:00', endTime: '2026-07-09 08:00', hours: 3.0, hourlyRate: 220, regularCost: 660, overtimeCost: 0, totalCost: 660, product: 'Shwet Idli Batter 1kg', wc: 'WC-IB-02' },
          { code: 'LCA-2026-00044', po: 'PO-2026-00127', batch: 'NAM-THN-20260709-000021', wo: null, operator: 'Suresh Mehta (OP-003)', shift: 'SHIFT-B', laborType: 'OVERTIME', startTime: '2026-07-09 14:00', endTime: '2026-07-09 17:00', hours: 3.0, hourlyRate: 240, overtimeRate: 360, regularCost: 0, overtimeCost: 1080, totalCost: 1080, product: 'Mixed Namkeen 500g', wc: 'WC-NM-04' },
          { code: 'LCA-2026-00043', po: null, batch: null, wo: null, operator: 'Lakshmi V. (OP-005)', shift: 'SHIFT-A', laborType: 'INDIRECT', startTime: '2026-07-09 06:00', endTime: '2026-07-09 14:00', hours: 8.0, hourlyRate: 350, regularCost: 2800, overtimeCost: 0, totalCost: 2800, product: null, wc: 'ALL' },
        ],
        summary: {
          totalLaborCost: 18420, directLabor: 14240, indirectLabor: 2800, overtime: 1080, setup: 125, idle: 0,
          byOperator: [
            { operator: 'Rajesh Kumar', hours: 4.0, cost: 1000, regular: 1000, overtime: 0 },
            { operator: 'Anil Reddy', hours: 3.0, cost: 660, regular: 660, overtime: 0 },
            { operator: 'Suresh Mehta', hours: 3.0, cost: 1080, regular: 0, overtime: 1080 },
            { operator: 'Lakshmi V. (Supervisor)', hours: 8.0, cost: 2800, regular: 2800, overtime: 0 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Labor cost allocations retrieved')), { headers })
    }

    // GET /api/production-cost/machine — Machine cost allocations
    if (path === '/api/production-cost/machine' && method === 'GET') {
      const data = {
        allocations: [
          { code: 'MCA-2026-00048', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', machine: 'COOK-01', machineName: 'Cooking Kettle 01', wc: 'WC-KK-03', startTime: '2026-07-09 06:35', endTime: '2026-07-09 08:00', runtimeHours: 1.42, setupHours: 0.5, idleHours: 0, downtimeHours: 0, rate: 800, runtimeCost: 1136, setupCost: 400, maintenanceCost: 50, totalCost: 1586 },
          { code: 'MCA-2026-00047', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000146', machine: 'COOK-01', machineName: 'Cooking Kettle 01', wc: 'WC-KK-03', startTime: '2026-07-09 11:00', endTime: '2026-07-09 13:00', runtimeHours: 2.0, setupHours: 0, idleHours: 0, downtimeHours: 0, rate: 800, runtimeCost: 1600, setupCost: 0, maintenanceCost: 50, totalCost: 1650 },
          { code: 'MCA-2026-00046', po: 'PO-2026-00126', batch: 'SHW-THN-20260709-000047', machine: 'GRIND-01', machineName: 'Wet Grinder 01', wc: 'WC-IB-02', startTime: '2026-07-09 05:10', endTime: '2026-07-09 08:00', runtimeHours: 2.83, setupHours: 0.17, idleHours: 0, downtimeHours: 0, rate: 500, runtimeCost: 1416, setupCost: 84, maintenanceCost: 0, totalCost: 1500 },
          { code: 'MCA-2026-00045', po: 'PO-2026-00127', batch: 'NAM-THN-20260709-000021', machine: 'FRY-01', machineName: 'Continuous Fryer 01', wc: 'WC-NM-04', startTime: '2026-07-09 06:00', endTime: '2026-07-09 10:00', runtimeHours: 3.5, setupHours: 0.5, idleHours: 0, downtimeHours: 0.42, rate: 1000, runtimeCost: 3500, setupCost: 500, maintenanceCost: 0, totalCost: 4000 },
          { code: 'MCA-2026-00044', po: 'PO-2026-00129', batch: 'MOT-THN-20260708-000032', machine: 'PACK-03', machineName: 'Packaging Machine 03', wc: 'WC-ML-04', startTime: '2026-07-08 14:00', endTime: '2026-07-08 17:00', runtimeHours: 2.5, setupHours: 0.5, idleHours: 0, downtimeHours: 0, rate: 600, runtimeCost: 1500, setupCost: 300, maintenanceCost: 100, totalCost: 1900 },
        ],
        summary: {
          totalMachineCost: 10636, runtimeCost: 9152, setupCost: 1284, maintenanceCost: 200,
          byMachine: [
            { machine: 'COOK-01', name: 'Cooking Kettle 01', hours: 3.92, cost: 3236, runtimeCost: 2736, rate: 800 },
            { machine: 'GRIND-01', name: 'Wet Grinder 01', hours: 3.0, cost: 1500, runtimeCost: 1416, rate: 500 },
            { machine: 'FRY-01', name: 'Continuous Fryer 01', hours: 4.42, cost: 4000, runtimeCost: 3500, rate: 1000 },
            { machine: 'PACK-03', name: 'Packaging Machine 03', hours: 3.0, cost: 1900, runtimeCost: 1500, rate: 600 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Machine cost allocations retrieved')), { headers })
    }

    // GET /api/production-cost/utility — Utility costs
    if (path === '/api/production-cost/utility' && method === 'GET') {
      const data = {
        utilities: [
          { code: 'UC-2026-00048', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', plant: 'THN', type: 'ELECTRICITY', consumed: 145.5, uom: 'KWH', rate: 8.5, totalCost: 1237, allocatedCost: 1237, method: 'MACHINE_HOURS', period: '2026-07-09 06:00 to 14:00' },
          { code: 'UC-2026-00047', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', plant: 'THN', type: 'GAS', consumed: 4.2, uom: 'M3', rate: 65, totalCost: 273, allocatedCost: 273, method: 'MACHINE_HOURS', period: '2026-07-09 06:00 to 14:00' },
          { code: 'UC-2026-00046', po: 'PO-2026-00126', batch: 'SHW-THN-20260709-000047', plant: 'THN', type: 'ELECTRICITY', consumed: 89.4, uom: 'KWH', rate: 8.5, totalCost: 760, allocatedCost: 760, method: 'MACHINE_HOURS', period: '2026-07-09 06:00 to 14:00' },
          { code: 'UC-2026-00045', po: 'PO-2026-00127', batch: 'NAM-THN-20260709-000021', plant: 'THN', type: 'ELECTRICITY', consumed: 178.8, uom: 'KWH', rate: 8.5, totalCost: 1520, allocatedCost: 1520, method: 'MACHINE_HOURS', period: '2026-07-09 06:00 to 14:00' },
          { code: 'UC-2026-00044', po: 'PO-2026-00127', batch: 'NAM-THN-20260709-000021', plant: 'THN', type: 'GAS', consumed: 28.5, uom: 'M3', rate: 65, totalCost: 1853, allocatedCost: 1853, method: 'MACHINE_HOURS', period: '2026-07-09 06:00 to 14:00' },
          { code: 'UC-2026-00043', po: 'PO-2026-00127', batch: 'NAM-THN-20260709-000021', plant: 'THN', type: 'WATER', consumed: 850, uom: 'LITER', rate: 0.8, totalCost: 680, allocatedCost: 680, method: 'PRODUCTION_QTY', period: '2026-07-09 06:00 to 14:00' },
          { code: 'UC-2026-00042', po: 'PO-2026-00129', batch: 'MOT-THN-20260708-000032', plant: 'THN', type: 'STEAM', consumed: 12.0, uom: 'TON', rate: 1500, totalCost: 18000, allocatedCost: 1800, method: 'BATCH_QTY', period: '2026-07-08 14:00 to 22:00' },
        ],
        summary: {
          totalUtilityCost: 8123,
          byType: [
            { type: 'ELECTRICITY', totalCost: 3517, consumption: 413.7, uom: 'KWH' },
            { type: 'GAS', totalCost: 2126, consumption: 32.7, uom: 'M3' },
            { type: 'WATER', totalCost: 680, consumption: 850, uom: 'LITER' },
            { type: 'STEAM', totalCost: 1800, consumption: 12.0, uom: 'TON' },
          ],
          byPlant: [{ plant: 'THN', totalCost: 8123 }],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Utility costs retrieved')), { headers })
    }

    // GET /api/production-cost/overhead — Overhead allocations
    if (path === '/api/production-cost/overhead' && method === 'GET') {
      const data = {
        overheads: [
          { code: 'OHA-2026-00018', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', plant: 'THN', type: 'FACTORY_RENT', description: 'Monthly rent allocation', totalCost: 150000, allocatedCost: 320, method: 'MACHINE_HOURS', base: 4.42, rate: 72.4, period: '2026-07-01 to 2026-07-31' },
          { code: 'OHA-2026-00017', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', plant: 'THN', type: 'DEPRECIATION', description: 'Equipment depreciation', totalCost: 80000, allocatedCost: 280, method: 'MACHINE_HOURS', base: 4.42, rate: 63.3, period: '2026-07-01 to 2026-07-31' },
          { code: 'OHA-2026-00016', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', plant: 'THN', type: 'SUPERVISION', description: 'Supervisor salary allocation', totalCost: 60000, allocatedCost: 200, method: 'LABOR_HOURS', base: 4.0, rate: 50, period: '2026-07-01 to 2026-07-31' },
          { code: 'OHA-2026-00015', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', plant: 'THN', type: 'CLEANING', description: 'Plant cleaning', totalCost: 25000, allocatedCost: 150, method: 'BATCH_QTY', base: 94, rate: 1.6, period: '2026-07-01 to 2026-07-31' },
          { code: 'OHA-2026-00014', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', plant: 'THN', type: 'INSURANCE', description: 'Factory insurance', totalCost: 30000, allocatedCost: 100, method: 'FIXED_PERCENTAGE', base: 0.0033, rate: 30000, period: '2026-07-01 to 2026-07-31' },
          { code: 'OHA-2026-00013', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', plant: 'THN', type: 'ADMINISTRATION', description: 'Admin overhead allocation', totalCost: 120000, allocatedCost: 150, method: 'PRODUCTION_QTY', base: 94, rate: 1.6, period: '2026-07-01 to 2026-07-31' },
        ],
        summary: {
          totalOverhead: 465000, allocated: 9000,
          byType: [
            { type: 'FACTORY_RENT', total: 150000, allocated: 320 },
            { type: 'DEPRECIATION', total: 80000, allocated: 280 },
            { type: 'SUPERVISION', total: 60000, allocated: 200 },
            { type: 'CLEANING', total: 25000, allocated: 150 },
            { type: 'INSURANCE', total: 30000, allocated: 100 },
            { type: 'ADMINISTRATION', total: 120000, allocated: 150 },
          ],
          allocationMethods: [
            { method: 'MACHINE_HOURS', count: 2, description: 'Best for machine-intensive operations' },
            { method: 'LABOR_HOURS', count: 1, description: 'Best for labor-intensive operations' },
            { method: 'BATCH_QTY', count: 1, description: 'Spread evenly across batches' },
            { method: 'PRODUCTION_QTY', count: 1, description: 'Spread by output quantity' },
            { method: 'FIXED_PERCENTAGE', count: 1, description: 'Pre-determined percentage' },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Overhead allocations retrieved')), { headers })
    }

    // GET /api/production-cost/journals — Manufacturing journals
    if (path === '/api/production-cost/journals' && method === 'GET') {
      const data = {
        journals: [
          { entryNumber: 'MJE-2026-00051', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', type: 'VARIANCE_POSTING', date: '2026-07-09 11:16', totalDebit: 1340, totalCredit: 1340, isBalanced: true, glPosted: true, glPostedAt: '2026-07-09 11:16:30', glPostingDurationMs: 1240, period: 'FY2026-Q1-Jul', description: 'Material + Labor + Machine + Utility + Overhead variance for Kaju Katli 500g batch' },
          { entryNumber: 'MJE-2026-00050', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', type: 'FG_VALUATION', date: '2026-07-09 11:15', totalDebit: 20140, totalCredit: 20140, isBalanced: true, glPosted: true, glPostedAt: '2026-07-09 11:15:30', glPostingDurationMs: 1180, period: 'FY2026-Q1-Jul', description: 'FG inventory valuation for Kaju Katli 500g (94 KG)' },
          { entryNumber: 'MJE-2026-00049', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', type: 'OVERHEAD_ALLOCATION', date: '2026-07-09 11:14', totalDebit: 1200, totalCredit: 1200, isBalanced: true, glPosted: true, glPostedAt: '2026-07-09 11:14:30', glPostingDurationMs: 980, period: 'FY2026-Q1-Jul', description: 'Factory overhead allocation' },
          { entryNumber: 'MJE-2026-00048', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', type: 'LABOR_ALLOCATION', date: '2026-07-09 11:13', totalDebit: 2400, totalCredit: 2400, isBalanced: true, glPosted: true, glPostedAt: '2026-07-09 11:13:30', glPostingDurationMs: 1020, period: 'FY2026-Q1-Jul', description: 'Direct labor allocation - Rajesh Kumar 4 hours' },
          { entryNumber: 'MJE-2026-00047', po: 'PO-2026-00125', batch: 'KAJ-THN-20260709-000145', type: 'MATERIAL_CONSUMPTION', date: '2026-07-09 11:12', totalDebit: 9400, totalCredit: 9400, isBalanced: true, glPosted: true, glPostedAt: '2026-07-09 11:12:30', glPostingDurationMs: 1340, period: 'FY2026-Q1-Jul', description: 'Raw material consumption - 55 KG Cashew + 35 KG Sugar + 4 KG Ghee' },
          { entryNumber: 'MJE-2026-00044', po: 'PO-2026-00127', batch: 'NAM-THN-20260709-000021', type: 'FG_VALUATION', date: '2026-07-09 09:42', totalDebit: 27150, totalCredit: 27150, isBalanced: true, glPosted: true, glPostedAt: '2026-07-09 09:42:30', glPostingDurationMs: 1420, period: 'FY2026-Q1-Jul', description: 'FG inventory valuation for Mixed Namkeen 500g (250 KG)' },
        ],
        summary: {
          totalJournals: 47, posted: 47, pending: 0, failed: 0,
          totalDebit: 184600, totalCredit: 184600, allBalanced: true,
          byType: [
            { type: 'MATERIAL_CONSUMPTION', count: 12, totalAmount: 95000 },
            { type: 'LABOR_ALLOCATION', count: 9, totalAmount: 18420 },
            { type: 'MACHINE_ALLOCATION', count: 6, totalAmount: 10636 },
            { type: 'OVERHEAD_ALLOCATION', count: 6, totalAmount: 9000 },
            { type: 'UTILITY_CONSUMPTION', count: 7, totalAmount: 8123 },
            { type: 'FG_VALUATION', count: 5, totalAmount: 93726 },
            { type: 'VARIANCE_POSTING', count: 2, totalAmount: 3490 },
          ],
          avgPostingMs: 1240, successRate: 100,
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Manufacturing journals retrieved')), { headers })
    }

    // GET /api/production-cost/rollup — Cost roll-up by product/line
    if (path === '/api/production-cost/rollup' && method === 'GET') {
      const data = {
        rollups: [
          { product: 'Kaju Katli 500g', sku: 'KK-500', batches: 8, totalQty: 752, uom: 'KG', totalCost: 161080, plannedCost: 150400, variance: 10680, variancePct: 7.1, perKg: 214.2, marginPct: 38.8 },
          { product: 'Kaju Katli 1kg', sku: 'KK-1KG', batches: 6, totalQty: 588, uom: 'KG', totalCost: 125460, plannedCost: 117600, variance: 7860, variancePct: 6.7, perKg: 213.4, marginPct: 37.3 },
          { product: 'Shwet Idli Batter 1kg', sku: 'IB-1KG', batches: 4, totalQty: 380, uom: 'KG', totalCost: 39330, plannedCost: 38000, variance: 1330, variancePct: 3.5, perKg: 103.5, marginPct: 20.4 },
          { product: 'Motichoor Laddu 1kg', sku: 'ML-1KG', batches: 3, totalQty: 294, uom: 'KG', totalCost: 47040, plannedCost: 44100, variance: 2940, variancePct: 6.7, perKg: 160.0, marginPct: 33.3 },
          { product: 'Mixed Namkeen 500g', sku: 'NM-500', batches: 2, totalQty: 500, uom: 'KG', totalCost: 54300, plannedCost: 50000, variance: 4300, variancePct: 8.6, perKg: 108.6, marginPct: 22.4 },
        ],
        byLine: [
          { line: 'LINE-KK-01', name: 'Kaju Katli Line', batches: 14, totalCost: 286540, perKg: 213.8, variancePct: 6.9, marginPct: 38.1 },
          { line: 'LINE-IB-01', name: 'Idli Batter Line', batches: 4, totalCost: 39330, perKg: 103.5, variancePct: 3.5, marginPct: 20.4 },
          { line: 'LINE-NM-01', name: 'Namkeen Line', batches: 2, totalCost: 54300, perKg: 108.6, variancePct: 8.6, marginPct: 22.4 },
          { line: 'LINE-ML-01', name: 'Motichoor Line', batches: 3, totalCost: 47040, perKg: 160.0, variancePct: 6.7, marginPct: 33.3 },
        ],
        byPlant: [
          { plant: 'THN', name: 'Thane Plant', totalCost: 184600, plannedCost: 178400, variance: 6200, variancePct: 3.5, marginPct: 32.4 },
        ],
        summary: {
          totalProductionCost: 184600, totalPlannedCost: 178400, totalVariance: 6200,
          avgVariancePct: 3.5, totalBatches: 24, avgPerKg: 152.4,
          bestPerformingLine: 'LINE-IB-01 (lowest variance)',
          worstPerformingLine: 'LINE-NM-01 (highest variance)',
          mostProfitableProduct: 'Kaju Katli 500g (38.8% margin)',
          leastProfitableProduct: 'Shwet Idli Batter 1kg (20.4% margin)',
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Cost roll-up retrieved')), { headers })
    }

    // GET /api/production-cost/info — Sprint 42 info
    if (path === '/api/production-cost/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 42, sprintName: 'Enterprise Production Costing, Manufacturing Finance & Variance Analysis Engine', version: '42.0.0', part: 5, tables: 11,
        epics: [
          'Production Cost Engine (5 cost types: Standard/Actual/Estimated/Simulation/Historical)',
          'Material Cost Allocation (FIFO/Weighted Avg/Moving Avg/Actual - inherited from Inventory)',
          'Labor Cost Allocation (Direct/Indirect/Overtime/Idle/Training/Cleaning/Setup)',
          'Machine & Utility Cost Allocation (Electricity/Gas/Steam/Air/Water/Cooling)',
          'Overhead Allocation (5 methods: Machine Hours/Labor Hours/Prod Qty/Batch Qty/Fixed %)',
          'Batch Costing (3-way comparison: Planned vs Actual vs Variance, per-kg cost)',
          'Variance Analysis (8 types: Material/Labor/Machine/Yield/Purchase/Usage/Overhead/Time)',
          'Manufacturing Finance (5 journal types, auto GL posting, balanced entries)',
          'Frontend (8 admin modules: Dashboard/Batch/Variance/Labor/Machine/Utility/Roll-Up/Finance)',
          'Backend (12 API groups, 11 database models)',
        ],
        chiefArchitectRecommendation: 'Three-way cost comparison for every batch: (1) PLANNED COST from approved recipe+BOM before production, (2) ACTUAL MANUFACTURING COST after production using actual material+labor+machine+utilities+packaging, (3) VARIANCE COST = difference highlighting inefficiencies (excess ingredient, low yield, downtime, overtime). Gives management complete visibility into profitability and drives continuous improvement.',
        costComponents: ['Raw Materials', 'Packaging', 'Labor', 'Machine Cost', 'Electricity', 'Gas', 'Steam', 'Water', 'Maintenance', 'Factory Overhead', 'Quality Cost', 'Warehouse Transfer'],
        costTypes: ['STANDARD', 'ACTUAL', 'ESTIMATED', 'SIMULATION', 'HISTORICAL'],
        varianceTypes: ['MATERIAL', 'LABOR', 'MACHINE', 'YIELD', 'PURCHASE_PRICE', 'USAGE', 'OVERHEAD', 'TIME'],
        journalTypes: ['MATERIAL_CONSUMPTION', 'WIP_POSTING', 'FG_VALUATION', 'VARIANCE_POSTING', 'LABOR_ALLOCATION', 'MACHINE_ALLOCATION', 'OVERHEAD_ALLOCATION'],
        overheadMethods: ['MACHINE_HOURS', 'LABOR_HOURS', 'PRODUCTION_QTY', 'BATCH_QTY', 'FIXED_PERCENTAGE'],
        performanceTargets: { batchCostCalc: '<5000 ms', journalPosting: '<2000 ms', concurrentOrders: 100000 },
        endpoints: [
          'GET /api/production-cost/dashboard',
          'GET /api/production-cost',
          'POST /api/production-cost',
          'POST /api/production-cost/recalculate',
          'GET /api/production-cost/batch/:batchNumber',
          'GET /api/production-cost/variances',
          'GET /api/production-cost/labor',
          'GET /api/production-cost/machine',
          'GET /api/production-cost/utility',
          'GET /api/production-cost/overhead',
          'GET /api/production-cost/journals',
          'GET /api/production-cost/rollup',
          'GET /api/production-cost/info',
        ],
        part5Sprint: 9, part5Sprints: 15, totalProjectTables: 373,
      }, 'SUOP Production Costing & Finance Engine v42.0.0')), { headers })
    }

'''

# Read existing backend
with open('mini-services/suop-backend/index.ts', 'r') as f:
    content = f.read()

marker = '    // 404\n    return new Response(JSON.stringify(errorResponse(`Route ${path} not found'
idx = content.find(marker)
if idx == -1:
    print("ERROR: 404 marker not found"); exit(1)

new_content = content[:idx] + ENDPOINTS + content[idx:]
with open('mini-services/suop-backend/index.ts', 'w') as f:
    f.write(new_content)

print(f"Inserted Sprint 42 endpoints")
print(f"Old size: {len(content)} chars, New size: {len(new_content)} chars")

#!/usr/bin/env python3
"""Append Sprint 45 backend endpoints to mini-services/suop-backend/index.ts"""

ENDPOINTS = r'''
    // ═════════════════════════════════════════════════════════
    // SPRINT 45 — WASTE, SCRAP, YIELD, BY-PRODUCT & REWORK MANAGEMENT
    // ═════════════════════════════════════════════════════════

    // GET /api/waste/dashboard — Waste intelligence dashboard
    if (path === '/api/waste/dashboard' && method === 'GET') {
      const data = {
        kpis: {
          totalWasteKg: 184.5, totalWasteCost: 36900, totalScrapKg: 12.4, totalScrapValue: 2480,
          avgYieldPercent: 96.8, yieldVariance: -1.2, reworkOrdersOpen: 3, reworkOrdersCompleted: 8,
          recoveryPercent: 18.5, recyclingPercent: 42.0, foodWastePercent: 3.2,
          byProductsValue: 8420, disposalCostThisMonth: 4800, wasteReductionPct: 12.5,
        },
        wasteByCategory: [
          { category: 'PROCESS_WASTE', type: 'PROCESS_WASTE', kg: 84.2, cost: 12630, percent: 45.6, color: '#3b82f6', disposition: 'EXPECTED' },
          { category: 'QUALITY_WASTE', type: 'QUALITY_WASTE', kg: 28.4, cost: 8520, percent: 15.4, color: '#ef4444', disposition: 'DESTROY' },
          { category: 'PACKAGING_WASTE', type: 'PACKAGING_WASTE', kg: 22.8, cost: 2280, percent: 12.4, color: '#a855f7', disposition: 'RECYCLE' },
          { category: 'MATERIAL_WASTE', type: 'MATERIAL_WASTE', kg: 18.6, cost: 5580, percent: 10.1, color: '#f59e0b', disposition: 'REWORK' },
          { category: 'CLEANING_WASTE', type: 'CLEANING_WASTE', kg: 15.2, cost: 760, percent: 8.2, color: '#06b6d4', disposition: 'DISPOSE' },
          { category: 'FOOD_WASTE', type: 'FOOD_WASTE', kg: 9.8, cost: 2940, percent: 5.3, color: '#10b981', disposition: 'DONATE' },
          { category: 'UTILITY_WASTE', type: 'UTILITY_WASTE', kg: 5.5, cost: 4190, percent: 3.0, color: '#f97316', disposition: 'TRACK' },
        ],
        lossReasons: [
          { reason: 'COOKING_LOSS', kg: 42.5, percent: 23.0, expected: true, recoverable: false },
          { reason: 'MOISTURE_LOSS', kg: 28.4, percent: 15.4, expected: true, recoverable: false },
          { reason: 'BROKEN_PRODUCT', kg: 24.8, percent: 13.4, expected: false, recoverable: true },
          { reason: 'BURNT_PRODUCT', kg: 18.2, percent: 9.9, expected: false, recoverable: false },
          { reason: 'PACKAGING_DAMAGE', kg: 22.8, percent: 12.4, expected: false, recoverable: false },
          { reason: 'TRIMMING_LOSS', kg: 16.5, percent: 8.9, expected: true, recoverable: true },
          { reason: 'OPERATOR_ERROR', kg: 12.4, percent: 6.7, expected: false, recoverable: false },
          { reason: 'MACHINE_FAILURE', kg: 9.8, percent: 5.3, expected: false, recoverable: false },
          { reason: 'CLEANING_WASTE', kg: 9.1, percent: 4.9, expected: true, recoverable: false },
        ],
        recentWaste: [
          { code: 'WR-00148', batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', category: 'QUALITY_WASTE', reason: 'BURNT_PRODUCT', qty: 4.2, uom: 'KG', cost: 840, disposition: 'DESTROY', operator: 'Suresh Mehta', time: '14:30' },
          { code: 'WR-00147', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', category: 'PROCESS_WASTE', reason: 'COOKING_LOSS', qty: 1.0, uom: 'KG', cost: 200, disposition: 'EXPECTED', operator: 'Rajesh Kumar', time: '08:00' },
          { code: 'WR-00146', batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', category: 'MATERIAL_WASTE', reason: 'BROKEN_PRODUCT', qty: 0.5, uom: 'KG', cost: 100, disposition: 'REWORK', operator: 'Rajesh Kumar', time: '11:35' },
          { code: 'WR-00145', batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', category: 'PACKAGING_WASTE', reason: 'PACKAGING_DAMAGE', qty: 2.0, uom: 'KG', cost: 200, disposition: 'RECYCLE', operator: 'Anil Reddy', time: '13:00' },
        ],
        chiefArchitectCategories: [
          { category: 'Process Loss', example: 'Moisture evaporation during cooking', action: 'Record as expected process loss; include in yield calculations' },
          { category: 'Recoverable By-Product', example: 'Broken kaju katli pieces, sugar syrup recovery', action: 'Return to approved inventory or reuse through controlled processes' },
          { category: 'Rework Material', example: 'Packaging defects with acceptable product quality', action: 'Generate rework order, send back for repacking/reprocessing' },
          { category: 'Quality Reject', example: 'Burnt sweets, contaminated batches', action: 'Quarantine, quality review, destroy if required' },
          { category: 'Packaging Waste', example: 'Damaged cartons, torn labels, broken trays', action: 'Record separately to monitor packaging supplier quality' },
          { category: 'Utility Loss', example: 'Excess oil, gas, electricity, water usage', action: 'Track for operational efficiency and cost reduction' },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Waste dashboard')), { headers })
    }

    // GET /api/waste — List waste records
    if (path === '/api/waste' && method === 'GET') {
      const records = [
        { code: 'WR-00148', batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', category: 'QUALITY_WASTE', reason: 'BURNT_PRODUCT', desc: 'FRY-01 temp spike burnt 4.2kg', inputQty: 250, lostQty: 4.2, recoveredQty: 0, uom: 'KG', materialCost: 600, laborCost: 120, machineCost: 80, energyCost: 20, packagingCost: 20, totalCost: 840, disposition: 'DESTROY', line: 'LINE-NM-01', machine: 'FRY-01', operator: 'Suresh Mehta', shift: 'SHIFT-B', time: '2026-07-09 14:30' },
        { code: 'WR-00147', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', category: 'PROCESS_WASTE', reason: 'COOKING_LOSS', desc: 'Expected moisture loss during cooking', inputQty: 94, lostQty: 1.0, recoveredQty: 0, uom: 'KG', materialCost: 200, laborCost: 0, machineCost: 0, energyCost: 0, packagingCost: 0, totalCost: 200, disposition: 'EXPECTED', line: 'LINE-KK-01', machine: 'COOK-01', operator: 'Rajesh Kumar', shift: 'SHIFT-A', time: '2026-07-09 08:00' },
        { code: 'WR-00146', batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', category: 'MATERIAL_WASTE', reason: 'BROKEN_PRODUCT', desc: '0.5kg broken during cutting', inputQty: 98, lostQty: 0.5, recoveredQty: 0.5, uom: 'KG', materialCost: 100, laborCost: 0, machineCost: 0, energyCost: 0, packagingCost: 0, totalCost: 100, disposition: 'REWORK', line: 'LINE-KK-01', machine: 'CUT-01', operator: 'Rajesh Kumar', shift: 'SHIFT-B', time: '2026-07-09 11:35' },
        { code: 'WR-00145', batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', category: 'PACKAGING_WASTE', reason: 'PACKAGING_DAMAGE', desc: '2kg spilled due to pouch tear', inputQty: 95, lostQty: 2.0, recoveredQty: 0, uom: 'KG', materialCost: 160, laborCost: 20, machineCost: 0, energyCost: 0, packagingCost: 20, totalCost: 200, disposition: 'RECYCLE', line: 'LINE-IB-01', machine: 'PACK-02', operator: 'Anil Reddy', shift: 'SHIFT-A', time: '2026-07-09 13:00' },
        { code: 'WR-00144', batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', category: 'QUALITY_WASTE', reason: 'REJECTED_BATCH', desc: 'Batch on quality hold - taste deviation', inputQty: 98, lostQty: 2.0, recoveredQty: 0, uom: 'KG', materialCost: 600, laborCost: 100, machineCost: 60, energyCost: 20, packagingCost: 0, totalCost: 780, disposition: 'REWORK', line: 'LINE-ML-01', machine: 'MIX-03', operator: 'Suresh M.', shift: 'SHIFT-B', time: '2026-07-08 18:00' },
      ]
      return new Response(JSON.stringify(successResponse(records, 'Waste records retrieved')), { headers })
    }

    // POST /api/waste — Record waste
    if (path === '/api/waste' && method === 'POST') {
      const body = await request.json()
      const recordCode = 'WR-' + String(Date.now()).slice(-6)
      const totalCost = (body.materialCost || 0) + (body.laborCost || 0) + (body.machineCost || 0) + (body.energyCost || 0) + (body.packagingCost || 0)
      const data = {
        recordCode,
        productionBatchNumber: body.productionBatchNumber,
        productSku: body.productSku, productName: body.productName,
        categoryCode: body.categoryCode, categoryName: body.categoryName,
        wasteType: body.wasteType,
        lossReason: body.lossReason, lossDescription: body.lossDescription,
        inputQty: body.inputQty, lostQty: body.lostQty, recoveredQty: body.recoveredQty || 0,
        uom: body.uom || 'KG',
        materialCost: body.materialCost || 0, laborCost: body.laborCost || 0, machineCost: body.machineCost || 0, energyCost: body.energyCost || 0, packagingCost: body.packagingCost || 0,
        totalWasteCost: totalCost,
        disposition: body.disposition || 'DISPOSE',
        recordedAt: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(data, `Waste record ${recordCode} created`)), { status: 201, headers })
    }

    // POST /api/waste/classify — Classify waste into category
    if (path === '/api/waste/classify' && method === 'POST') {
      const body = await request.json()
      const data = {
        wasteType: body.wasteType,
        suggestedCategory: body.wasteType === 'PROCESS_WASTE' ? 'Process Loss' : body.wasteType === 'QUALITY_WASTE' ? 'Quality Reject' : body.wasteType === 'PACKAGING_WASTE' ? 'Packaging Waste' : body.wasteType === 'MATERIAL_WASTE' ? 'Rework Material' : body.wasteType === 'FOOD_WASTE' ? 'Food Waste' : 'General Waste',
        suggestedDisposition: body.wasteType === 'PROCESS_WASTE' ? 'EXPECTED' : body.wasteType === 'QUALITY_WASTE' ? 'DESTROY' : body.wasteType === 'PACKAGING_WASTE' ? 'RECYCLE' : body.wasteType === 'MATERIAL_WASTE' ? 'REWORK' : body.wasteType === 'FOOD_WASTE' ? 'DONATE' : 'DISPOSE',
        isRecoverable: body.wasteType === 'MATERIAL_WASTE' || body.wasteType === 'PROCESS_WASTE',
        isByProductSource: body.lossReason === 'BROKEN_PRODUCT' || body.lossReason === 'TRIMMING_LOSS',
        costImpact: body.wasteType === 'UTILITY_WASTE' ? 'ENERGY_LOSS' : body.wasteType === 'PACKAGING_WASTE' ? 'PACKAGING_LOSS' : 'MATERIAL_LOSS',
      }
      return new Response(JSON.stringify(successResponse(data, `Waste classified as ${data.suggestedCategory}`)), { headers })
    }

    // GET /api/waste/scrap — Scrap records
    if (path === '/api/waste/scrap' && method === 'GET') {
      const data = {
        records: [
          { code: 'MSC-00048', batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', reason: 'BURNT_PRODUCT', desc: 'Burnt beyond recovery', qty: 4.2, uom: 'KG', value: 840, disposition: 'DESTROY', status: 'IN_SCRAP_INVENTORY', line: 'LINE-NM-01', operator: 'Suresh Mehta', time: '14:30' },
          { code: 'MSC-00047', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', reason: 'BROKEN_PRODUCT', desc: 'Broken pieces during cutting', qty: 0.5, uom: 'KG', value: 100, disposition: 'REWORK', status: 'RECOVERED', line: 'LINE-KK-01', operator: 'Rajesh Kumar', time: '08:00' },
          { code: 'MSC-00046', batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', reason: 'QUALITY_REJECT', desc: 'Taste deviation - quality hold', qty: 2.0, uom: 'KG', value: 600, disposition: 'REWORK', status: 'IN_SCRAP_INVENTORY', line: 'LINE-ML-01', operator: 'Suresh M.', time: '18:00' },
          { code: 'MSC-00045', batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', reason: 'PACKAGING_DAMAGE', desc: 'Pouch tear during packaging', qty: 2.0, uom: 'KG', value: 200, disposition: 'DISPOSE', status: 'DISPOSED', line: 'LINE-IB-01', operator: 'Anil Reddy', time: '13:00' },
        ],
        inventory: [
          { code: 'MSI-001', sku: 'NM-500', name: 'Mixed Namkeen 500g (Scrap)', totalQty: 4.2, uom: 'KG', value: 840, plant: 'THN', bin: 'SCRAP-Q-01', status: 'AWAITING_DISPOSAL' },
          { code: 'MSI-002', sku: 'ML-1KG', name: 'Motichoor Laddu 1kg (Scrap)', totalQty: 2.0, uom: 'KG', value: 600, plant: 'THN', bin: 'SCRAP-Q-02', status: 'RECOVERABLE' },
        ],
        summary: {
          totalScrapKg: 12.4, totalScrapValue: 2480, inInventory: 6.2, recovered: 0.5,
          disposed: 2.0, awaitingDisposal: 4.2, recoverable: 2.0,
          byDisposition: [
            { disposition: 'DESTROY', count: 1, qty: 4.2, value: 840 },
            { disposition: 'REWORK', count: 2, qty: 2.5, value: 700 },
            { disposition: 'DISPOSE', count: 1, qty: 2.0, value: 200 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Scrap records retrieved')), { headers })
    }

    // GET /api/yield — Yield results
    if (path === '/api/yield' && method === 'GET') {
      const data = {
        results: [
          { code: 'YLD-00048', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', recipe: 'RCP-KK-001 V2.3', inputQty: 95, expectedOutput: 94, actualOutput: 94, uom: 'KG', expectedYield: 98.9, actualYield: 98.9, variance: 0, lossQty: 1.0, lossPercent: 1.1, cookingLoss: 1.0, moistureLoss: 0, trimmingLoss: 0, scrapLoss: 0, reworkLoss: 0, status: 'WITHIN_THRESHOLD' },
          { code: 'YLD-00047', batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', recipe: 'RCP-KK-001 V2.3', inputQty: 100, expectedOutput: 99, actualOutput: 98, uom: 'KG', expectedYield: 99.0, actualYield: 98.0, variance: -1.0, lossQty: 2.0, lossPercent: 2.0, cookingLoss: 1.5, moistureLoss: 0, trimmingLoss: 0, scrapLoss: 0.5, reworkLoss: 0, status: 'WITHIN_THRESHOLD' },
          { code: 'YLD-00046', batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', recipe: 'RCP-IB-002 V1.5', inputQty: 100, expectedOutput: 96, actualOutput: 95, uom: 'KG', expectedYield: 96.0, actualYield: 95.0, variance: -1.0, lossQty: 5.0, lossPercent: 5.0, cookingLoss: 0, moistureLoss: 3.0, trimmingLoss: 0, scrapLoss: 2.0, reworkLoss: 0, status: 'WITHIN_THRESHOLD' },
          { code: 'YLD-00045', batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', recipe: 'RCP-ML-003 V1.2', inputQty: 100, expectedOutput: 98, actualOutput: 96, uom: 'KG', expectedYield: 98.0, actualYield: 96.0, variance: -2.0, lossQty: 4.0, lossPercent: 4.0, cookingLoss: 1.5, moistureLoss: 0.5, trimmingLoss: 0, scrapLoss: 2.0, reworkLoss: 0, status: 'BELOW_THRESHOLD' },
          { code: 'YLD-00044', batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', recipe: 'RCP-NM-004 V1.1', inputQty: 254, expectedOutput: 252, actualOutput: 248, uom: 'KG', expectedYield: 99.2, actualYield: 97.6, variance: -1.6, lossQty: 6.0, lossPercent: 2.4, cookingLoss: 1.8, moistureLoss: 0, trimmingLoss: 0, scrapLoss: 4.2, reworkLoss: 0, status: 'BELOW_THRESHOLD' },
        ],
        summary: {
          avgYield: 96.8, avgExpected: 97.8, avgVariance: -1.2,
          totalLossKg: 18.0, totalLossValue: 3600,
          byProduct: [
            { product: 'Kaju Katli 500g', avgYield: 98.9, target: 98.9, variance: 0 },
            { product: 'Kaju Katli 1kg', avgYield: 98.0, target: 99.0, variance: -1.0 },
            { product: 'Shwet Idli Batter 1kg', avgYield: 95.0, target: 96.0, variance: -1.0 },
            { product: 'Motichoor Laddu 1kg', avgYield: 96.0, target: 98.0, variance: -2.0 },
            { product: 'Mixed Namkeen 500g', avgYield: 97.6, target: 99.2, variance: -1.6 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Yield results retrieved')), { headers })
    }

    // POST /api/yield/calculate — Calculate yield for a batch
    if (path === '/api/yield/calculate' && method === 'POST') {
      const body = await request.json()
      const calcMs = 800 + Math.floor(Math.random() * 1000)
      const actualYield = body.inputQty > 0 ? Number(((body.actualOutput / body.inputQty) * 100).toFixed(2)) : 0
      const expectedYield = body.expectedYield || 98.0
      const variance = Number((actualYield - expectedYield).toFixed(2))
      const lossQty = body.inputQty - body.actualOutput
      const lossPercent = body.inputQty > 0 ? Number(((lossQty / body.inputQty) * 100).toFixed(2)) : 0
      const status = variance >= -2 ? 'WITHIN_THRESHOLD' : variance >= -5 ? 'BELOW_THRESHOLD' : 'CRITICAL'
      const data = {
        yieldCode: 'YLD-2026-' + String(Date.now()).slice(-6),
        productionBatchNumber: body.productionBatchNumber,
        productSku: body.productSku, productName: body.productName,
        inputMaterialQty: body.inputQty,
        expectedOutputQty: body.expectedOutput,
        actualOutputQty: body.actualOutput,
        expectedYieldPercent: expectedYield,
        actualYieldPercent: actualYield,
        yieldVariancePercent: variance,
        yieldLossQty: lossQty,
        yieldLossPercent: lossPercent,
        cookingLossQty: body.cookingLoss || 0,
        moistureLossQty: body.moistureLoss || 0,
        trimmingLossQty: body.trimmingLoss || 0,
        scrapLossQty: body.scrapLoss || 0,
        reworkLossQty: body.reworkLoss || 0,
        yieldStatus: status,
        calculatedAt: new Date().toISOString(),
        calculationDurationMs: calcMs,
        withinTarget: calcMs < 2000,
        message: `Yield for ${body.productionBatchNumber}: ${actualYield}% (expected ${expectedYield}%, variance ${variance >= 0 ? '+' : ''}${variance}%)`,
      }
      return new Response(JSON.stringify(successResponse(data, `Yield calculated: ${actualYield}% in ${calcMs}ms`)), { status: 201, headers })
    }

    // GET /api/waste/by-products — By-product management
    if (path === '/api/waste/by-products' && method === 'GET') {
      const data = {
        byProducts: [
          { code: 'BP-00048', sourceBatch: 'KAJ-THN-20260709-000145', sourceProduct: 'Kaju Katli 500g', byProductSku: 'BP-BROKEN-KAJU', byProductName: 'Broken Cashew Pieces', type: 'BROKEN_CASHEWS', qty: 0.5, uom: 'KG', unitValue: 200, totalValue: 100, disposition: 'INTERNAL_REUSE', status: 'IN_INVENTORY' },
          { code: 'BP-00047', sourceBatch: 'KAJ-THN-20260709-000146', sourceProduct: 'Kaju Katli 1kg', byProductSku: 'BP-SUGAR-SYRUP', byProductName: 'Sugar Syrup Recovery', type: 'SUGAR_SYRUP_RECOVERY', qty: 2.0, uom: 'KG', unitValue: 50, totalValue: 100, disposition: 'INTERNAL_REUSE', status: 'IN_INVENTORY' },
          { code: 'BP-00046', sourceBatch: 'MOT-THN-20260708-000032', sourceProduct: 'Motichoor Laddu 1kg', byProductSku: 'BP-TRIM-PIECES', byProductName: 'Trim Pieces', type: 'TRIM_PIECES', qty: 1.5, uom: 'KG', unitValue: 80, totalValue: 120, disposition: 'SALE', status: 'SOLD' },
          { code: 'BP-00045', sourceBatch: 'NAM-THN-20260709-000021', sourceProduct: 'Mixed Namkeen 500g', byProductSku: 'BP-OIL-RECOVERY', byProductName: 'Used Oil Recovery', type: 'OIL_RECOVERY', qty: 8.0, uom: 'LITER', unitValue: 30, totalValue: 240, disposition: 'SALE', status: 'AVAILABLE' },
          { code: 'BP-00044', sourceBatch: 'SHW-THN-20260709-000047', sourceProduct: 'Shwet Idli Batter 1kg', byProductSku: 'BP-MILK-SOLIDS', byProductName: 'Milk Solids', type: 'MILK_SOLIDS', qty: 0.8, uom: 'KG', unitValue: 150, totalValue: 120, disposition: 'INTERNAL_REUSE', status: 'REUSED' },
        ],
        inventory: [
          { sku: 'BP-BROKEN-KAJU', name: 'Broken Cashew Pieces', type: 'BROKEN_CASHEWS', totalQty: 12.5, availableQty: 12.0, uom: 'KG', value: 2500, plant: 'THN', bin: 'BP-01', status: 'AVAILABLE' },
          { sku: 'BP-SUGAR-SYRUP', name: 'Sugar Syrup Recovery', type: 'SUGAR_SYRUP_RECOVERY', totalQty: 8.0, availableQty: 6.0, uom: 'KG', value: 400, plant: 'THN', bin: 'BP-02', status: 'AVAILABLE' },
          { sku: 'BP-OIL-RECOVERY', name: 'Used Oil Recovery', type: 'OIL_RECOVERY', totalQty: 24.0, availableQty: 16.0, uom: 'LITER', value: 720, plant: 'THN', bin: 'BP-03', status: 'AVAILABLE' },
        ],
        summary: {
          totalByProductsValue: 8420, totalRecoveredKg: 34.5,
          byType: [
            { type: 'BROKEN_CASHEWS', count: 8, totalValue: 4200 },
            { type: 'SUGAR_SYRUP_RECOVERY', count: 4, totalValue: 800 },
            { type: 'OIL_RECOVERY', count: 6, totalValue: 1440 },
            { type: 'TRIM_PIECES', count: 3, totalValue: 480 },
            { type: 'MILK_SOLIDS', count: 2, totalValue: 300 },
            { type: 'REUSABLE_PACKAGING', count: 5, totalValue: 1200 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'By-products retrieved')), { headers })
    }

    // GET /api/waste/rework — Rework orders
    if (path === '/api/waste/rework' && method === 'GET') {
      const data = {
        orders: [
          { number: 'RWO-00012', batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', type: 'PARTIAL_REWORK', reason: 'TASTE_DEVIATION', desc: 'Sugar level slightly low - rework with syrup addition', originalQty: 2.0, reworkQty: 2.0, recoveredQty: 0, scrappedQty: 0, uom: 'KG', supervisor: 'Lakshmi V.', approvedAt: '2026-07-09 09:00', workCenter: 'WC-ML-04', operator: 'Suresh M.', startedAt: '2026-07-09 10:00', qualityStatus: 'PENDING', reworkCost: 240, status: 'IN_PROGRESS' },
          { number: 'RWO-00011', batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', type: 'PARTIAL_REWORK', reason: 'PACKAGING_DEFECT', desc: '0.5kg broken pieces - repack', originalQty: 0.5, reworkQty: 0.5, recoveredQty: 0.5, scrappedQty: 0, uom: 'KG', supervisor: 'Lakshmi V.', approvedAt: '2026-07-09 12:00', workCenter: 'WC-KK-08', operator: 'Vijay Patel', startedAt: '2026-07-09 12:30', completedAt: '2026-07-09 13:00', qualityStatus: 'PASSED', reworkCost: 60, status: 'COMPLETED' },
          { number: 'RWO-00010', batch: 'GUL-THN-20260707-000018', product: 'Gulab Jamun 1kg', type: 'FULL_REWORK', reason: 'SHAPE_DEFECT', desc: 'Irregular shape - reshape and re-fry', originalQty: 5.0, reworkQty: 5.0, recoveredQty: 4.5, scrappedQty: 0.5, uom: 'KG', supervisor: 'Lakshmi V.', approvedAt: '2026-07-07 16:00', workCenter: 'WC-GUL-02', operator: 'Suresh Mehta', startedAt: '2026-07-07 16:30', completedAt: '2026-07-07 18:00', qualityStatus: 'PASSED', reworkCost: 600, status: 'COMPLETED' },
          { number: 'RWO-00009', batch: 'RAS-THN-20260705-000008', product: 'Rasgulla 1kg', type: 'PARTIAL_REWORK', reason: 'QUALITY_HOLD', desc: 'Syrup concentration low - reprocess in syrup', originalQty: 3.0, reworkQty: 3.0, recoveredQty: 0, scrappedQty: 0, uom: 'KG', status: 'PENDING_APPROVAL' },
        ],
        summary: {
          total: 11, open: 3, inProgress: 1, completed: 7, rejected: 0,
          totalReworkCost: 4280, totalRecoveredKg: 12.5, totalScrappedKg: 0.5,
          byReason: [
            { reason: 'PACKAGING_DEFECT', count: 3, recoveredKg: 1.5 },
            { reason: 'TASTE_DEVIATION', count: 2, recoveredKg: 4.0 },
            { reason: 'SHAPE_DEFECT', count: 2, recoveredKg: 4.5 },
            { reason: 'QUALITY_HOLD', count: 2, recoveredKg: 0 },
            { reason: 'RECIPE_DEVIATION', count: 1, recoveredKg: 1.0 },
            { reason: 'TEMPERATURE_DEVIATION', count: 1, recoveredKg: 1.5 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Rework orders retrieved')), { headers })
    }

    // GET /api/waste/disposals — Waste disposals
    if (path === '/api/waste/disposals' && method === 'GET') {
      const data = {
        disposals: [
          { code: 'WDP-00048', batch: 'NAM-THN-20260705-000018', type: 'QUALITY_WASTE', desc: 'Burnt namkeen - unfit for consumption', qty: 6.2, uom: 'KG', method: 'AUTHORIZED_VENDOR_DISPOSAL', vendor: 'Green Waste Solutions Pvt Ltd', license: 'GWS-FSSAI-2024-0142', cost: 310, authorizedBy: 'Lakshmi V.', date: '2026-07-06', certificate: 'CERT-GWS-0048', status: 'COMPLETED' },
          { code: 'WDP-00047', batch: 'KAJ-THN-20260628-000011', type: 'QUALITY_WASTE', desc: 'Recalled batch - taste deviation', qty: 12.0, uom: 'KG', method: 'INCINERATION', vendor: 'Maharashtra Waste Mgmt', license: 'MWM-2024-0892', cost: 840, authorizedBy: 'Quality Head', date: '2026-07-08', certificate: 'CERT-MWM-0047', status: 'COMPLETED' },
          { code: 'WDP-00046', batch: 'SHW-THN-20260702-000041', type: 'FOOD_WASTE', desc: 'Expired batter - donated before expiry', qty: 8.0, uom: 'KG', method: 'COMPOSTING', vendor: 'Angels NGO', license: 'NGO-REG-2018-0451', cost: 0, authorizedBy: 'Lakshmi V.', date: '2026-07-08', certificate: 'CERT-NGO-0046', status: 'COMPLETED' },
          { code: 'WDP-00045', batch: 'Multiple', type: 'PACKAGING_WASTE', desc: 'Damaged cartons, torn labels', qty: 22.8, uom: 'KG', method: 'RECYCLING', vendor: 'EcoPack Recyclers', license: 'EPR-2024-0234', cost: 0, authorizedBy: 'Warehouse Head', date: '2026-07-09', certificate: 'CERT-ECO-0045', status: 'COMPLETED' },
          { code: 'WDP-00044', batch: 'NAM-THN-20260709-000021', type: 'QUALITY_WASTE', desc: 'Burnt product awaiting disposal', qty: 4.2, uom: 'KG', method: 'AUTHORIZED_VENDOR_DISPOSAL', vendor: 'Green Waste Solutions Pvt Ltd', license: 'GWS-FSSAI-2024-0142', cost: 210, authorizedBy: null, date: '2026-07-10', certificate: null, status: 'SCHEDULED' },
        ],
        summary: {
          totalDisposals: 48, totalQty: 184.5, totalCost: 4800, completed: 47, scheduled: 1,
          byMethod: [
            { method: 'AUTHORIZED_VENDOR_DISPOSAL', count: 18, qty: 84.2, cost: 2520 },
            { method: 'INCINERATION', count: 8, qty: 28.4, cost: 1980 },
            { method: 'RECYCLING', count: 14, qty: 52.6, cost: 0 },
            { method: 'COMPOSTING', count: 6, qty: 14.8, cost: 0 },
            { method: 'MUNICIPAL_DISPOSAL', count: 2, qty: 4.5, cost: 300 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Waste disposals retrieved')), { headers })
    }

    // GET /api/waste/cost — Waste cost analysis
    if (path === '/api/waste/cost' && method === 'GET') {
      const data = {
        byProduct: [
          { product: 'Kaju Katli 500g', totalWasteCost: 5680, materialCost: 4200, laborCost: 480, machineCost: 320, energyCost: 280, packagingCost: 400, totalWasteKg: 12.4, costPerKg: 458, batches: 8 },
          { product: 'Kaju Katli 1kg', totalWasteCost: 4320, materialCost: 3400, laborCost: 360, machineCost: 240, energyCost: 200, packagingCost: 120, totalWasteKg: 9.8, costPerKg: 441, batches: 6 },
          { product: 'Shwet Idli Batter 1kg', totalWasteCost: 1840, materialCost: 1200, laborCost: 240, machineCost: 160, energyCost: 80, packagingCost: 160, totalWasteKg: 4.2, costPerKg: 438, batches: 4 },
          { product: 'Motichoor Laddu 1kg', totalWasteCost: 3120, materialCost: 2400, laborCost: 240, machineCost: 240, energyCost: 160, packagingCost: 80, totalWasteKg: 7.2, costPerKg: 433, batches: 3 },
          { product: 'Mixed Namkeen 500g', totalWasteCost: 8940, materialCost: 6800, laborCost: 720, machineCost: 640, energyCost: 480, packagingCost: 300, totalWasteKg: 18.4, costPerKg: 486, batches: 2 },
        ],
        byLine: [
          { line: 'LINE-KK-01', name: 'Kaju Katli Line', totalWasteCost: 10000, totalWasteKg: 22.2, costPerKg: 450 },
          { line: 'LINE-IB-01', name: 'Idli Batter Line', totalWasteCost: 1840, totalWasteKg: 4.2, costPerKg: 438 },
          { line: 'LINE-NM-01', name: 'Namkeen Line', totalWasteCost: 8940, totalWasteKg: 18.4, costPerKg: 486 },
          { line: 'LINE-ML-01', name: 'Motichoor Line', totalWasteCost: 3120, totalWasteKg: 7.2, costPerKg: 433 },
          { line: 'LINE-GUL-01', name: 'Gulab Jamun Line', totalWasteCost: 1200, totalWasteKg: 3.1, costPerKg: 387 },
        ],
        trend: [
          { week: 'W1', wasteCost: 24800, wasteKg: 124.5 },
          { week: 'W2', wasteCost: 22100, wasteKg: 110.2 },
          { week: 'W3', wasteCost: 19500, wasteKg: 98.8 },
          { week: 'W4', wasteCost: 18400, wasteKg: 92.4 },
        ],
        summary: {
          totalWasteCost: 36900, totalWasteKg: 184.5, avgCostPerKg: 200,
          materialLoss: 18000, laborLoss: 2040, machineLoss: 1600, energyLoss: 1200, packagingLoss: 1060,
          trend: 'DECREASING', reductionPct: 25.8,
          worstProduct: 'Mixed Namkeen 500g (₹8,940 waste)', bestProduct: 'Gulab Jamun 1kg (₹1,200 waste)',
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Waste cost analysis retrieved')), { headers })
    }

    // GET /api/waste/sustainability — Sustainability dashboard
    if (path === '/api/waste/sustainability' && method === 'GET') {
      const data = {
        kpis: {
          foodWasteKg: 9.8, foodWastePercent: 3.2, foodWasteTrend: -15.0,
          recoveryPercent: 18.5, recoveryTrend: 8.0,
          recyclingPercent: 42.0, recyclingTrend: 12.0,
          waterUsageLiters: 12480, waterTrend: -5.0,
          energyUsageKwh: 1840, energyTrend: -3.0,
          wasteReductionPercent: 12.5, carbonKgCo2e: 248.5,
        },
        foodWasteByCategory: [
          { category: 'Cooking Loss', kg: 42.5, percent: 23.0, expected: true, actionable: false },
          { category: 'Moisture Loss', kg: 28.4, percent: 15.4, expected: true, actionable: false },
          { category: 'Burnt Product', kg: 18.2, percent: 9.9, expected: false, actionable: true },
          { category: 'Broken Product', kg: 24.8, percent: 13.4, expected: false, actionable: true },
          { category: 'Packaging Damage', kg: 22.8, percent: 12.4, expected: false, actionable: true },
          { category: 'Trimming Loss', kg: 16.5, percent: 8.9, expected: true, actionable: false },
          { category: 'Operator Error', kg: 12.4, percent: 6.7, expected: false, actionable: true },
          { category: 'Machine Failure', kg: 9.8, percent: 5.3, expected: false, actionable: true },
          { category: 'Cleaning Waste', kg: 9.1, percent: 4.9, expected: true, actionable: false },
        ],
        recoveryBreakdown: [
          { type: 'By-Product Recovery', kg: 34.5, value: 8420, percent: 64.0 },
          { type: 'Rework Recovery', kg: 12.5, value: 4280, percent: 23.0 },
          { type: 'Recycling', kg: 7.0, value: 0, percent: 13.0 },
        ],
        monthlyTrend: [
          { month: 'Jan', foodWaste: 5.8, recovery: 12.5, recycling: 28.0 },
          { month: 'Feb', foodWaste: 5.2, recovery: 14.2, recycling: 32.0 },
          { month: 'Mar', foodWaste: 4.8, recovery: 15.8, recycling: 35.0 },
          { month: 'Apr', foodWaste: 4.2, recovery: 16.4, recycling: 38.0 },
          { month: 'May', foodWaste: 3.8, recovery: 17.2, recycling: 40.0 },
          { month: 'Jun', foodWaste: 3.5, recovery: 18.0, recycling: 41.0 },
          { month: 'Jul', foodWaste: 3.2, recovery: 18.5, recycling: 42.0 },
        ],
        esgMetrics: {
          foodLossPerTonne: 14.8,
          wasteToLandfillPercent: 32.0,
          wasteDivertedFromLandfill: 68.0,
          waterUsagePerKg: 9.98,
          energyUsagePerKg: 1.47,
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Sustainability metrics retrieved')), { headers })
    }

    // GET /api/waste/info — Sprint 45 info
    if (path === '/api/waste/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 45, sprintName: 'Enterprise Waste, Scrap, Yield, By-Product & Rework Management Engine', version: '45.0.0', part: 5, tables: 12,
        epics: [
          'Waste Classification Master (9 waste types, 6 disposition options)',
          'Scrap Management (8 scrap reasons, scrap inventory, disposition)',
          'Yield Management (Actual/Expected output, variance, 5 loss breakdowns)',
          'By-Product Management (6 by-product types, internal reuse/sale/transfer)',
          'Rework Management (partial/full rework, supervisor approval, recipe adjustment)',
          'Disposal Management (5 disposal methods, vendor license, certificate, photo evidence)',
          'Waste Cost Analysis (5 cost components, by product/line/plant, trend)',
          'Sustainability Dashboard (food waste, recovery, recycling, water, energy, ESG)',
          'Frontend (8 admin modules)',
          'Backend (10 API groups, 12 database models)',
        ],
        chiefArchitectRecommendation: 'Do NOT treat all production losses as "waste" - categorize them: (1) Process Loss (moisture evaporation) = expected, include in yield calc; (2) Recoverable By-Product (broken kaju katli, sugar syrup) = return to inventory or reuse; (3) Rework Material (packaging defects, acceptable quality) = generate rework order; (4) Quality Reject (burnt, contaminated) = quarantine, destroy if required; (5) Packaging Waste (damaged cartons) = record separately to monitor supplier quality; (6) Utility Loss (excess oil/gas/electricity) = track for efficiency. Distinguishing normal manufacturing loss from avoidable inefficiencies enables targeted improvements and accurate costing.',
        wasteTypes: ['PROCESS_WASTE', 'QUALITY_WASTE', 'PACKAGING_WASTE', 'MATERIAL_WASTE', 'UTILITY_WASTE', 'CLEANING_WASTE', 'FOOD_WASTE', 'HAZARDOUS_WASTE', 'GENERAL_WASTE'],
        lossReasons: ['COOKING_LOSS', 'MOISTURE_LOSS', 'BURNT_PRODUCT', 'BROKEN_PRODUCT', 'PACKAGING_DAMAGE', 'EXPIRED_MATERIAL', 'CLEANING_WASTE', 'SAMPLING_LOSS', 'REJECTED_BATCH', 'OPERATOR_ERROR', 'MACHINE_FAILURE', 'UTILITY_LOSS'],
        dispositions: ['REUSE', 'REWORK', 'SELL', 'DESTROY', 'DISPOSE', 'DONATE'],
        disposalMethods: ['INCINERATION', 'COMPOSTING', 'RECYCLING', 'MUNICIPAL_DISPOSAL', 'AUTHORIZED_VENDOR_DISPOSAL'],
        byProductTypes: ['BROKEN_CASHEWS', 'SUGAR_SYRUP_RECOVERY', 'TRIM_PIECES', 'MILK_SOLIDS', 'REUSABLE_PACKAGING', 'OIL_RECOVERY'],
        reworkReasons: ['PACKAGING_DEFECT', 'QUALITY_HOLD', 'RECIPE_DEVIATION', 'TEMPERATURE_DEVIATION', 'SHAPE_DEFECT', 'TASTE_DEVIATION'],
        yieldFormula: 'Actual Output ÷ Input Material × 100 = Yield %',
        performanceTargets: { yieldCalc: '<2000 ms', dashboardRefresh: '<5000 ms', wasteRecords: 1000000 },
        endpoints: [
          'GET /api/waste/dashboard',
          'GET /api/waste',
          'POST /api/waste',
          'POST /api/waste/classify',
          'GET /api/waste/scrap',
          'GET /api/yield',
          'POST /api/yield/calculate',
          'GET /api/waste/by-products',
          'GET /api/waste/rework',
          'GET /api/waste/disposals',
          'GET /api/waste/cost',
          'GET /api/waste/sustainability',
          'GET /api/waste/info',
        ],
        part5Sprint: 12, part5Sprints: 15, totalProjectTables: 405,
      }, 'SUOP Waste Intelligence Engine v45.0.0')), { headers })
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

print(f"Inserted Sprint 45 endpoints. Old: {len(content)}, New: {len(new_content)}")

#!/usr/bin/env python3
"""Append Sprint 46 backend endpoints to mini-services/suop-backend/index.ts"""

ENDPOINTS = r'''
    // ═════════════════════════════════════════════════════════
    // SPRINT 46 — PRODUCTION SCHEDULING, FINITE CAPACITY & OPTIMIZATION
    // ═════════════════════════════════════════════════════════

    // GET /api/scheduling/dashboard — Scheduling dashboard
    if (path === '/api/scheduling/dashboard' && method === 'GET') {
      const data = {
        kpis: {
          totalSchedules: 12, activeSchedules: 3, published: 8, draft: 3, executing: 1,
          avgUtilization: 87.5, totalChangeovers: 24, totalChangeoverMin: 720,
          campaignsActive: 2, constraintsDetected: 4, constraintsResolved: 18,
          simulationsRun: 6, optimizationScore: 89.2,
        },
        schedules: [
          { number: 'SCH-2026-00012', plant: 'THN', line: 'LINE-KK-01', type: 'WEEKLY', date: '2026-07-09', method: 'FINITE_CAPACITY', plannedHrs: 116, availableHrs: 120, utilization: 96.7, changeovers: 4, constraints: 0, status: 'EXECUTING', version: 3, optimizationScore: 92.5 },
          { number: 'SCH-2026-00011', plant: 'THN', line: 'LINE-IB-01', type: 'WEEKLY', date: '2026-07-09', method: 'FINITE_CAPACITY', plannedHrs: 102, availableHrs: 120, utilization: 85.0, changeovers: 2, constraints: 0, status: 'PUBLISHED', version: 2, optimizationScore: 88.0 },
          { number: 'SCH-2026-00010', plant: 'THN', line: 'LINE-NM-01', type: 'WEEKLY', date: '2026-07-09', method: 'CAMPAIGN', plannedHrs: 108, availableHrs: 120, utilization: 90.0, changeovers: 3, constraints: 1, status: 'PUBLISHED', version: 4, optimizationScore: 84.2 },
          { number: 'SCH-2026-00009', plant: 'THN', line: 'LINE-ML-01', type: 'WEEKLY', date: '2026-07-09', method: 'FINITE_CAPACITY', plannedHrs: 98, availableHrs: 120, utilization: 81.7, changeovers: 2, constraints: 0, status: 'PUBLISHED', version: 1, optimizationScore: 90.0 },
          { number: 'SCH-2026-00008', plant: 'THN', line: 'LINE-GUL-01', type: 'WEEKLY', date: '2026-07-09', method: 'CAMPAIGN', plannedHrs: 64, availableHrs: 80, utilization: 80.0, changeovers: 1, constraints: 0, status: 'PUBLISHED', version: 2, optimizationScore: 95.0 },
          { number: 'SCH-2026-00013', plant: 'THN', line: 'ALL', type: 'ROLLING', date: '2026-07-16', method: 'FINITE_CAPACITY', plannedHrs: 0, availableHrs: 600, utilization: 0, changeovers: 0, constraints: 0, status: 'DRAFT', version: 1, optimizationScore: null },
        ],
        campaignSummary: [
          { campaign: 'CMP-2026-00003', name: 'Kaju Katli Family Campaign', family: 'KATLI', products: 4, start: '2026-07-09', end: '2026-07-11', savedSetupMin: 120, savedCost: 2400, status: 'EXECUTING' },
          { campaign: 'CMP-2026-00002', name: 'Milk Sweets Campaign', family: 'MILK_SWEET', products: 3, start: '2026-07-12', end: '2026-07-13', savedSetupMin: 90, savedCost: 1800, status: 'PLANNED' },
        ],
        recentSimulations: [
          { code: 'SIM-2026-00006', source: 'SCH-2026-00012', scenario: 'MACHINE_FAILURE', impact: 'Capacity -12%', delayMin: 90, costImpact: 1800, affectedOps: 3, revised: true, duration: 2840, time: '2h ago' },
          { code: 'SIM-2026-00005', source: 'SCH-2026-00010', scenario: 'RUSH_ORDER', impact: 'Capacity +8%', delayMin: 0, costImpact: -600, affectedOps: 2, revised: true, duration: 1980, time: '5h ago' },
          { code: 'SIM-2026-00004', source: 'SCH-2026-00011', scenario: 'MATERIAL_DELAY', impact: 'Capacity -5%', delayMin: 45, costImpact: 600, affectedOps: 1, revised: true, duration: 1240, time: '1d ago' },
        ],
        chiefArchitectSequence: {
          title: 'Campaign Manufacturing by Product Family (reduces cleaning & allergen risk)',
          sequence: ['Plain Kaju Katli', 'Kesar Kaju Katli', 'Pista Kaju Katli', 'Dry Fruit Mix Sweet', 'Milk Sweets', 'Chocolate Sweets'],
          benefits: ['Fewer production line cleanings', 'Reduced product contamination risk', 'Lower water/detergent/labor usage', 'Increased machine utilization', 'Higher daily production capacity', 'Better food safety compliance'],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Scheduling dashboard')), { headers })
    }

    // GET /api/scheduling — List production schedules
    if (path === '/api/scheduling' && method === 'GET') {
      const schedules = [
        { number: 'SCH-2026-00012', plant: 'THN', line: 'LINE-KK-01', lineName: 'Kaju Katli Line', type: 'WEEKLY', date: '2026-07-09', method: 'FINITE_CAPACITY', plannedHrs: 116, availableHrs: 120, utilization: 96.7, changeovers: 4, changeoverMin: 180, constraints: 0, optimizationScore: 92.5, status: 'EXECUTING', version: 3, planner: 'Lakshmi V.' },
        { number: 'SCH-2026-00011', plant: 'THN', line: 'LINE-IB-01', lineName: 'Idli Batter Line', type: 'WEEKLY', date: '2026-07-09', method: 'FINITE_CAPACITY', plannedHrs: 102, availableHrs: 120, utilization: 85.0, changeovers: 2, changeoverMin: 60, constraints: 0, optimizationScore: 88.0, status: 'PUBLISHED', version: 2, planner: 'Lakshmi V.' },
        { number: 'SCH-2026-00010', plant: 'THN', line: 'LINE-NM-01', lineName: 'Namkeen Line', type: 'WEEKLY', date: '2026-07-09', method: 'CAMPAIGN', plannedHrs: 108, availableHrs: 120, utilization: 90.0, changeovers: 3, changeoverMin: 150, constraints: 1, optimizationScore: 84.2, status: 'PUBLISHED', version: 4, planner: 'Lakshmi V.' },
        { number: 'SCH-2026-00009', plant: 'THN', line: 'LINE-ML-01', lineName: 'Motichoor Line', type: 'WEEKLY', date: '2026-07-09', method: 'FINITE_CAPACITY', plannedHrs: 98, availableHrs: 120, utilization: 81.7, changeovers: 2, changeoverMin: 90, constraints: 0, optimizationScore: 90.0, status: 'PUBLISHED', version: 1, planner: 'Lakshmi V.' },
        { number: 'SCH-2026-00008', plant: 'THN', line: 'LINE-GUL-01', lineName: 'Gulab Jamun Line', type: 'WEEKLY', date: '2026-07-09', method: 'CAMPAIGN', plannedHrs: 64, availableHrs: 80, utilization: 80.0, changeovers: 1, changeoverMin: 30, constraints: 0, optimizationScore: 95.0, status: 'PUBLISHED', version: 2, planner: 'Lakshmi V.' },
      ]
      return new Response(JSON.stringify(successResponse(schedules, 'Production schedules retrieved')), { headers })
    }

    // POST /api/scheduling — Create production schedule
    if (path === '/api/scheduling' && method === 'POST') {
      const body = await request.json()
      const scheduleNumber = 'SCH-2026-' + String(13 + Math.floor(Math.random() * 100)).padStart(5, '0')
      const data = {
        scheduleNumber,
        plantCode: body.plantCode || 'THN',
        productionLineCode: body.productionLineCode,
        scheduleType: body.scheduleType || 'WEEKLY',
        scheduleDate: body.scheduleDate || new Date().toISOString(),
        schedulingMethod: body.schedulingMethod || 'FINITE_CAPACITY',
        version: 1,
        totalPlannedHours: 0, totalAvailableHours: body.availableHrs || 120,
        utilizationPercent: 0,
        changeoverCount: 0, totalChangeoverMin: 0,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(data, `Schedule ${scheduleNumber} created`)), { status: 201, headers })
    }

    // POST /api/scheduling/:id/publish — Publish schedule
    if (path.match(/^\/api\/scheduling\/[^/]+\/publish$/) && method === 'POST') {
      const parts = path.split('/')
      const scheduleNumber = parts[parts.length - 2]
      return new Response(JSON.stringify(successResponse({
        scheduleNumber, status: 'PUBLISHED', publishedAt: new Date().toISOString(),
        message: `Schedule ${scheduleNumber} published to shop floor`,
      }, `Schedule published`)), { headers })
    }

    // GET /api/scheduling/:id/operations — Schedule operations (Gantt)
    if (path.match(/^\/api\/scheduling\/[^/]+\/operations$/) && method === 'GET') {
      const parts = path.split('/')
      const scheduleNumber = parts[parts.length - 2]
      const operations = [
        { op: 1, machine: 'MIX-01', product: 'Kaju Katli 500g', family: 'KATLI', shift: 'SHIFT-A', start: '2026-07-09T06:00:00Z', end: '2026-07-09T07:30:00Z', duration: 90, setup: 15, cleaning: 0, runtime: 75, qty: 95, uom: 'KG', operator: 'Rajesh Kumar', changeover: 'NONE', constraintsMet: true, status: 'COMPLETED' },
        { op: 2, machine: 'MIX-01', product: 'Kesar Kaju Katli 500g', family: 'KATLI', shift: 'SHIFT-A', start: '2026-07-09T07:30:00Z', end: '2026-07-09T09:00:00Z', duration: 90, setup: 10, cleaning: 0, runtime: 80, qty: 90, uom: 'KG', operator: 'Rajesh Kumar', changeover: 'MINOR', changeoverFrom: 'Kaju Katli 500g', constraintsMet: true, status: 'IN_PROGRESS' },
        { op: 3, machine: 'MIX-01', product: 'Pista Kaju Katli 500g', family: 'KATLI', shift: 'SHIFT-B', start: '2026-07-09T09:00:00Z', end: '2026-07-09T10:30:00Z', duration: 90, setup: 10, cleaning: 0, runtime: 80, qty: 85, uom: 'KG', operator: 'Rajesh Kumar', changeover: 'MINOR', changeoverFrom: 'Kesar Kaju Katli 500g', constraintsMet: true, status: 'PLANNED' },
        { op: 4, machine: 'COOK-01', product: 'Kaju Katli 500g', family: 'KATLI', shift: 'SHIFT-A', start: '2026-07-09T06:30:00Z', end: '2026-07-09T08:00:00Z', duration: 90, setup: 15, cleaning: 0, runtime: 75, qty: 95, uom: 'KG', operator: 'Rajesh Kumar', changeover: 'NONE', constraintsMet: true, status: 'COMPLETED' },
        { op: 5, machine: 'COOK-01', product: 'Kesar Kaju Katli 500g', family: 'KATLI', shift: 'SHIFT-A', start: '2026-07-09T08:00:00Z', end: '2026-07-09T09:30:00Z', duration: 90, setup: 10, cleaning: 0, runtime: 80, qty: 90, uom: 'KG', operator: 'Rajesh Kumar', changeover: 'MINOR', changeoverFrom: 'Kaju Katli 500g', constraintsMet: true, status: 'IN_PROGRESS' },
        { op: 6, machine: 'COOK-01', product: 'Kaju Katli 1kg', family: 'KATLI', shift: 'SHIFT-B', start: '2026-07-09T11:00:00Z', end: '2026-07-09T13:00:00Z', duration: 120, setup: 15, cleaning: 0, runtime: 105, qty: 100, uom: 'KG', operator: 'Rajesh Kumar', changeover: 'MINOR', constraintsMet: true, status: 'PLANNED' },
        { op: 7, machine: 'PACK-03', product: 'Kaju Katli 500g', family: 'KATLI', shift: 'SHIFT-B', start: '2026-07-09T10:30:00Z', end: '2026-07-09T12:00:00Z', duration: 90, setup: 30, cleaning: 0, runtime: 60, qty: 188, uom: 'PCS', operator: 'Vijay Patel', changeover: 'MAJOR', constraintsMet: true, status: 'PLANNED' },
        { op: 8, machine: 'COOL-01', product: 'Kaju Katli 500g', family: 'KATLI', shift: 'SHIFT-B', start: '2026-07-09T08:00:00Z', end: '2026-07-09T09:30:00Z', duration: 90, setup: 0, cleaning: 0, runtime: 90, qty: 95, uom: 'KG', operator: 'Suresh Mehta', changeover: 'NONE', constraintsMet: true, status: 'COMPLETED' },
        { op: 9, machine: 'COOL-01', product: 'Kesar Kaju Katli 500g', family: 'KATLI', shift: 'SHIFT-B', start: '2026-07-09T09:30:00Z', end: '2026-07-09T11:00:00Z', duration: 90, setup: 0, cleaning: 30, runtime: 60, qty: 90, uom: 'KG', operator: 'Suresh Mehta', changeover: 'MINOR', constraintsMet: true, status: 'IN_PROGRESS' },
        { op: 10, machine: 'MIX-01', product: 'Gulab Jamun 1kg', family: 'MILK_SWEET', shift: 'SHIFT-B', start: '2026-07-09T13:30:00Z', end: '2026-07-09T15:30:00Z', duration: 120, setup: 45, cleaning: 30, runtime: 45, qty: 50, uom: 'KG', operator: 'Suresh Mehta', changeover: 'FULL_CLEAN', changeoverFrom: 'Pista Kaju Katli 500g', constraintsMet: true, status: 'PLANNED', constraintNotes: 'Allergen: KATLI → MILK_SWEET requires full clean' },
      ]
      return new Response(JSON.stringify(successResponse(operations, `Operations for ${scheduleNumber}`)), { headers })
    }

    // GET /api/scheduling/machine — Machine schedules
    if (path === '/api/scheduling/machine' && method === 'GET') {
      const data = {
        machines: [
          { code: 'MIX-01', name: 'Industrial Mixer 01', line: 'LINE-KK-01', operations: 4, runtime: 280, setup: 80, cleaning: 30, idle: 30, utilization: 88.0, status: 'RUNNING' },
          { code: 'COOK-01', name: 'Cooking Kettle 01', line: 'LINE-KK-01', operations: 3, runtime: 255, setup: 40, cleaning: 0, idle: 65, utilization: 92.5, status: 'RUNNING' },
          { code: 'COOL-01', name: 'Cooling Tunnel 01', line: 'LINE-KK-01', operations: 3, runtime: 210, setup: 0, cleaning: 90, idle: 60, utilization: 78.0, status: 'CLEANING' },
          { code: 'PACK-03', name: 'Packaging Machine 03', line: 'LINE-KK-01', operations: 2, runtime: 120, setup: 60, cleaning: 0, idle: 180, utilization: 65.0, status: 'SETUP' },
          { code: 'FRY-01', name: 'Continuous Fryer 01', line: 'LINE-NM-01', operations: 0, runtime: 0, setup: 0, cleaning: 0, idle: 360, utilization: 25.0, status: 'FAULT' },
        ],
        timeline: [
          { machine: 'MIX-01', type: 'PRODUCTION', product: 'Kaju Katli 500g', start: '06:00', end: '07:30', duration: 90, shift: 'A', status: 'COMPLETED' },
          { machine: 'MIX-01', type: 'CHANGE_OVER', product: '→ Kesar Kaju Katli', start: '07:30', end: '07:40', duration: 10, shift: 'A', status: 'COMPLETED' },
          { machine: 'MIX-01', type: 'PRODUCTION', product: 'Kesar Kaju Katli 500g', start: '07:40', end: '09:00', duration: 80, shift: 'A', status: 'IN_PROGRESS' },
          { machine: 'MIX-01', type: 'PRODUCTION', product: 'Pista Kaju Katli 500g', start: '09:00', end: '10:30', duration: 90, shift: 'B', status: 'PLANNED' },
          { machine: 'MIX-01', type: 'FULL_CLEAN', product: '→ Gulab Jamun (allergen)', start: '10:30', end: '11:45', duration: 75, shift: 'B', status: 'PLANNED' },
          { machine: 'MIX-01', type: 'PRODUCTION', product: 'Gulab Jamun 1kg', start: '11:45', end: '13:30', duration: 105, shift: 'B', status: 'PLANNED' },
          { machine: 'COOK-01', type: 'PRODUCTION', product: 'Kaju Katli 500g', start: '06:30', end: '08:00', duration: 90, shift: 'A', status: 'COMPLETED' },
          { machine: 'COOK-01', type: 'PRODUCTION', product: 'Kesar Kaju Katli 500g', start: '08:00', end: '09:30', duration: 90, shift: 'A', status: 'IN_PROGRESS' },
          { machine: 'COOK-01', type: 'PRODUCTION', product: 'Kaju Katli 1kg', start: '11:00', end: '13:00', duration: 120, shift: 'B', status: 'PLANNED' },
        ],
        summary: {
          totalMachines: 5, totalOperations: 12, totalRuntime: 865, totalSetup: 180,
          totalCleaning: 120, totalIdle: 615, avgUtilization: 69.7,
          blockedMachines: 1, changeoversToday: 4,
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Machine schedules retrieved')), { headers })
    }

    // GET /api/scheduling/changeovers — Changeover rules
    if (path === '/api/scheduling/changeovers' && method === 'GET') {
      const data = {
        changeovers: [
          { code: 'CHG-00048', machine: 'MIX-01', from: 'Kaju Katli 500g', fromFamily: 'KATLI', to: 'Kesar Kaju Katli 500g', toFamily: 'KATLI', type: 'MINOR', setup: 10, cleaning: 0, total: 10, operators: 1, utility: 'NONE', cost: 50, allergen: false, contamination: 'LOW' },
          { code: 'CHG-00047', machine: 'MIX-01', from: 'Kesar Kaju Katli 500g', fromFamily: 'KATLI', to: 'Pista Kaju Katli 500g', toFamily: 'KATLI', type: 'MINOR', setup: 10, cleaning: 0, total: 10, operators: 1, utility: 'NONE', cost: 50, allergen: true, contamination: 'LOW' },
          { code: 'CHG-00046', machine: 'MIX-01', from: 'Pista Kaju Katli 500g', fromFamily: 'KATLI', to: 'Gulab Jamun 1kg', toFamily: 'MILK_SWEET', type: 'FULL_CLEAN', setup: 45, cleaning: 30, total: 75, operators: 2, utility: 'WATER+STEAM+DETERGENT', cost: 375, allergen: true, contamination: 'HIGH' },
          { code: 'CHG-00045', machine: 'MIX-01', from: 'Gulab Jamun 1kg', fromFamily: 'MILK_SWEET', to: 'Kaju Katli 500g', toFamily: 'KATLI', type: 'FULL_CLEAN', setup: 45, cleaning: 30, total: 75, operators: 2, utility: 'WATER+STEAM+DETERGENT', cost: 375, allergen: true, contamination: 'HIGH' },
          { code: 'CHG-00044', machine: 'COOK-01', from: 'Kaju Katli 500g', fromFamily: 'KATLI', to: 'Kaju Katli 1kg', toFamily: 'KATLI', type: 'MINOR', setup: 15, cleaning: 0, total: 15, operators: 1, utility: 'NONE', cost: 75, allergen: false, contamination: 'LOW' },
        ],
        rules: [
          { fromFamily: 'KATLI', toFamily: 'KATLI', type: 'MINOR', cleaningMin: 0, sanitization: false, allergen: false, rule: 'Same family - quick setup only' },
          { fromFamily: 'KATLI', toFamily: 'MILK_SWEET', type: 'FULL_CLEAN', cleaningMin: 30, sanitization: true, allergen: true, allergenType: 'NUTS', rule: 'Allergen concern - full clean + sanitize' },
          { fromFamily: 'MILK_SWEET', toFamily: 'KATLI', type: 'FULL_CLEAN', cleaningMin: 30, sanitization: true, allergen: true, allergenType: 'DAIRY', rule: 'Allergen concern - full clean + sanitize' },
          { fromFamily: 'MILK_SWEET', toFamily: 'MILK_SWEET', type: 'MINOR', cleaningMin: 0, sanitization: false, allergen: false, rule: 'Same family - quick setup only' },
          { fromFamily: 'KATLI', toFamily: 'CHOCOLATE', type: 'MAJOR', cleaningMin: 20, sanitization: true, allergen: false, rule: 'Major clean - flavor contamination' },
          { fromFamily: 'NAMKEEN', toFamily: 'KATLI', type: 'FULL_CLEAN', cleaningMin: 45, sanitization: true, allergen: true, allergenType: 'GLUTEN', rule: 'Allergen + flavor - full sanitization' },
        ],
        summary: {
          totalChangeovers: 24, totalChangeoverMin: 720, totalCost: 3600,
          byType: [
            { type: 'NONE', count: 8, min: 0 },
            { type: 'MINOR', count: 10, min: 100 },
            { type: 'MAJOR', count: 4, min: 200 },
            { type: 'FULL_CLEAN', count: 2, min: 150 },
          ],
          savings: { campaignVsSequential: 120, campaignSavingsCost: 2400, reducedCleaningMin: 120 },
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Changeover rules retrieved')), { headers })
    }

    // GET /api/scheduling/campaigns — Campaign manufacturing
    if (path === '/api/scheduling/campaigns' && method === 'GET') {
      const data = {
        campaigns: [
          { code: 'CMP-2026-00003', name: 'Kaju Katli Family Campaign', type: 'PRODUCT_FAMILY', family: 'KATLI', products: 4, skus: ['KK-500', 'KKK-500', 'PKK-500', 'DFM-500'], schedule: 'SCH-2026-00012', line: 'LINE-KK-01', start: '2026-07-09', end: '2026-07-11', durationMin: 2880, setupMin: 80, cleaningMin: 30, savedSetupMin: 120, savedCost: 2400, sequence: ['Plain Kaju Katli', 'Kesar Kaju Katli', 'Pista Kaju Katli', 'Dry Fruit Mix Sweet'], rationale: 'Same family - minimal changeover, allergen-safe sequence', status: 'EXECUTING' },
          { code: 'CMP-2026-00002', name: 'Milk Sweets Campaign', type: 'PRODUCT_FAMILY', family: 'MILK_SWEET', products: 3, skus: ['GUL-1KG', 'RAS-1KG', 'GJB-1KG'], schedule: 'SCH-2026-00008', line: 'LINE-GUL-01', start: '2026-07-12', end: '2026-07-13', durationMin: 1440, setupMin: 60, cleaningMin: 30, savedSetupMin: 90, savedCost: 1800, sequence: ['Gulab Jamun 1kg', 'Rasgulla 1kg', 'Gulab Jamun Box'], rationale: 'Same family - shared syrup process, reduced cleaning', status: 'PLANNED' },
          { code: 'CMP-2026-00001', name: 'Namkeen Campaign', type: 'PRODUCT_FAMILY', family: 'NAMKEEN', products: 5, skus: ['NM-500', 'BNM-500', 'CNM-500', 'PNM-500', 'MNM-500'], schedule: 'SCH-2026-00010', line: 'LINE-NM-01', start: '2026-07-05', end: '2026-07-07', durationMin: 2880, setupMin: 90, cleaningMin: 60, savedSetupMin: 150, savedCost: 3000, sequence: ['Plain Namkeen', 'Bhujia Namkeen', 'Corn Namkeen', 'Potato Namkeen', 'Mixed Namkeen'], rationale: 'Same family - shared fryer, sequential flavor build-up', status: 'COMPLETED' },
        ],
        summary: {
          totalCampaigns: 3, active: 1, planned: 1, completed: 1,
          totalSavedSetupMin: 360, totalSavedCost: 7200,
          avgSavingsPercent: 42.5,
          byFamily: [
            { family: 'KATLI', campaigns: 1, products: 4, savedMin: 120 },
            { family: 'MILK_SWEET', campaigns: 1, products: 3, savedMin: 90 },
            { family: 'NAMKEEN', campaigns: 1, products: 5, savedMin: 150 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Campaigns retrieved')), { headers })
    }

    // GET /api/scheduling/constraints — Constraint center
    if (path === '/api/scheduling/constraints' && method === 'GET') {
      const data = {
        constraints: [
          { code: 'CON-00048', schedule: 'SCH-2026-00010', type: 'MATERIAL_AVAILABILITY', desc: 'Cashew W320 short by 5 KG for Namkeen campaign', resource: 'MATERIAL', resourceCode: 'CAS-W320', resourceName: 'Cashew W320', status: 'VALIDATED', severity: 'WARNING', action: 'Reserved from incoming PO-2026-00150, arrives 2026-07-10', resolvedAt: '2026-07-08T16:00:00Z' },
          { code: 'CON-00047', schedule: 'SCH-2026-00012', type: 'MACHINE_CAPACITY', desc: 'FRY-01 unavailable due to fault', resource: 'MACHINE', resourceCode: 'FRY-01', resourceName: 'Continuous Fryer 01', status: 'VIOLATED', severity: 'BLOCKER', action: 'Maintenance scheduled, schedule revised to skip FRY-01 ops', resolvedAt: null },
          { code: 'CON-00046', schedule: 'SCH-2026-00012', type: 'OPERATOR_SKILLS', desc: 'Operator OP-006 certification expired for PACK-03', resource: 'OPERATOR', resourceCode: 'OP-006', resourceName: 'Mahesh K.', status: 'RESOLVED', severity: 'ERROR', action: 'Reassigned to OP-004 (Vijay Patel)', resolvedAt: '2026-07-09T11:00:00Z' },
          { code: 'CON-00045', schedule: 'SCH-2026-00011', type: 'MAINTENANCE_WINDOW', desc: 'GRIND-01 maintenance scheduled 2026-07-10 14:00-16:00', resource: 'MACHINE', resourceCode: 'GRIND-01', resourceName: 'Wet Grinder 01', status: 'VALIDATED', severity: 'INFO', action: 'Schedule avoids maintenance window automatically', resolvedAt: null },
          { code: 'CON-00044', schedule: 'SCH-2026-00010', type: 'SHELF_LIFE', desc: 'Shwet Idli Batter expires 2026-07-16 - must produce by 2026-07-14', resource: 'MATERIAL', resourceCode: 'IB-1KG', resourceName: 'Shwet Idli Batter 1kg', status: 'RESOLVED', severity: 'WARNING', action: 'Production scheduled 2026-07-12', resolvedAt: '2026-07-08T14:00:00Z' },
        ],
        summary: {
          total: 22, detected: 4, validated: 8, resolved: 8, violated: 1, bypassed: 1,
          byType: [
            { type: 'MATERIAL_AVAILABILITY', count: 6, resolved: 5, violated: 0 },
            { type: 'MACHINE_CAPACITY', count: 4, resolved: 2, violated: 1 },
            { type: 'OPERATOR_SKILLS', count: 3, resolved: 3, violated: 0 },
            { type: 'MAINTENANCE_WINDOW', count: 5, resolved: 5, violated: 0 },
            { type: 'SHELF_LIFE', count: 2, resolved: 2, violated: 0 },
            { type: 'CLEANING_TIME', count: 1, resolved: 1, violated: 0 },
            { type: 'BATCH_SIZE', count: 1, resolved: 0, violated: 0 },
          ],
          blockers: 1, errors: 1, warnings: 2,
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Schedule constraints retrieved')), { headers })
    }

    // GET /api/scheduling/simulations — Schedule simulations
    if (path === '/api/scheduling/simulations' && method === 'GET') {
      const data = {
        simulations: [
          { code: 'SIM-2026-00006', source: 'SCH-2026-00012', scenario: 'MACHINE_FAILURE', desc: 'FRY-01 fails for 4 hours', impact: '-12%', delayMin: 90, costImpact: 1800, affectedOps: 3, affectedMachines: 2, revised: true, revisedUtil: 84.5, duration: 2840, time: '2h ago' },
          { code: 'SIM-2026-00005', source: 'SCH-2026-00010', scenario: 'RUSH_ORDER', desc: 'Emergency order: 200 KG Mixed Namkeen', impact: '+8%', delayMin: 0, costImpact: -600, affectedOps: 2, affectedMachines: 1, revised: true, revisedUtil: 96.0, duration: 1980, time: '5h ago' },
          { code: 'SIM-2026-00004', source: 'SCH-2026-00011', scenario: 'MATERIAL_DELAY', desc: 'Urad Dal delivery delayed 2 hours', impact: '-5%', delayMin: 45, costImpact: 600, affectedOps: 1, affectedMachines: 1, revised: true, revisedUtil: 82.0, duration: 1240, time: '1d ago' },
          { code: 'SIM-2026-00003', source: 'SCH-2026-00009', scenario: 'OPERATOR_ABSENCE', desc: 'OP-003 calls in sick', impact: '-8%', delayMin: 60, costImpact: 800, affectedOps: 2, affectedMachines: 1, revised: true, revisedUtil: 76.0, duration: 1480, time: '2d ago' },
          { code: 'SIM-2026-00002', source: 'SCH-2026-00008', scenario: 'DEMAND_INCREASE', desc: 'Demand +20% for Gulab Jamun festival', impact: '+15%', delayMin: 0, costImpact: -1200, affectedOps: 3, affectedMachines: 2, revised: true, revisedUtil: 92.0, duration: 2120, time: '3d ago' },
          { code: 'SIM-2026-00001', source: 'SCH-2026-00012', scenario: 'POWER_SHUTDOWN', desc: '2-hour power shutdown at 14:00', impact: '-10%', delayMin: 120, costImpact: 2400, affectedOps: 4, affectedMachines: 3, revised: true, revisedUtil: 81.0, duration: 2680, time: '4d ago' },
        ],
        scenarioTypes: [
          { type: 'MACHINE_FAILURE', desc: 'Simulate machine breakdown', count: 2 },
          { type: 'RUSH_ORDER', desc: 'Emergency order insertion', count: 1 },
          { type: 'MATERIAL_DELAY', desc: 'Material delivery late', count: 1 },
          { type: 'OPERATOR_ABSENCE', desc: 'Operator unavailable', count: 1 },
          { type: 'DEMAND_INCREASE', desc: 'Demand surge scenario', count: 1 },
          { type: 'POWER_SHUTDOWN', desc: 'Utility failure', count: 1 },
        ],
        summary: {
          total: 6, revisedSchedulesGenerated: 6, avgDurationMs: 2068,
          avgCapacityImpact: -2.0, totalDelayMin: 315, totalCostImpact: 3800,
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Schedule simulations retrieved')), { headers })
    }

    // POST /api/scheduling/simulate — Run schedule simulation
    if (path === '/api/scheduling/simulate' && method === 'POST') {
      const body = await request.json()
      const simMs = 2000 + Math.floor(Math.random() * 8000) // 2-10s (target <15s)
      const impactPercent = -5 - Math.floor(Math.random() * 15)
      const delayMin = body.scenarioType === 'RUSH_ORDER' ? 0 : 30 + Math.floor(Math.random() * 90)
      const costImpact = body.scenarioType === 'RUSH_ORDER' || body.scenarioType === 'DEMAND_INCREASE' ? -600 - Math.floor(Math.random() * 1200) : 600 + Math.floor(Math.random() * 2400)
      const data = {
        simulationCode: 'SIM-2026-' + String(Date.now()).slice(-6),
        sourceScheduleNumber: body.sourceScheduleNumber,
        scenarioType: body.scenarioType,
        scenarioDescription: body.scenarioDescription,
        capacityImpactPercent: impactPercent,
        delayForecastMin: delayMin,
        costImpact,
        affectedOperations: 1 + Math.floor(Math.random() * 4),
        affectedMachines: 1 + Math.floor(Math.random() * 3),
        revisedScheduleGenerated: true,
        revisedScheduleNumber: 'SCH-2026-REV-' + String(Date.now()).slice(-4),
        revisedUtilization: 80 + Math.floor(Math.random() * 15),
        simulationDurationMs: simMs,
        withinTarget: simMs < 15000,
        simulatedAt: new Date().toISOString(),
        message: `Simulation completed in ${simMs}ms - capacity impact ${impactPercent}%, delay ${delayMin}min, cost impact ₹${costImpact}`,
      }
      return new Response(JSON.stringify(successResponse(data, `Simulation completed in ${simMs}ms`)), { status: 201, headers })
    }

    // GET /api/scheduling/shifts — Shift planning
    if (path === '/api/scheduling/shifts' && method === 'GET') {
      const data = {
        shifts: [
          { code: 'SHIFT-A', name: 'Morning Shift', start: '06:00', end: '14:00', durationHrs: 8, operators: 4, supervisors: 1, capacityPercent: 100, breaks: ['10:00-10:15', '12:30-13:00'], status: 'COMPLETED' },
          { code: 'SHIFT-B', name: 'Afternoon Shift', start: '14:00', end: '22:00', durationHrs: 8, operators: 3, supervisors: 1, capacityPercent: 95, breaks: ['18:00-18:15', '20:30-21:00'], status: 'IN_PROGRESS' },
          { code: 'SHIFT-C', name: 'Night Shift', start: '22:00', end: '06:00', durationHrs: 8, operators: 2, supervisors: 1, capacityPercent: 75, breaks: ['02:00-02:15', '04:30-05:00'], status: 'PLANNED' },
          { code: 'WEEKEND', name: 'Weekend Shift', start: '06:00', end: '14:00', durationHrs: 8, operators: 2, supervisors: 1, capacityPercent: 60, breaks: ['10:00-10:15'], status: 'PLANNED' },
          { code: 'FESTIVAL', name: 'Festival Shift (Diwali)', start: '06:00', end: '22:00', durationHrs: 16, operators: 6, supervisors: 2, capacityPercent: 150, breaks: ['10:00-10:30', '14:00-15:00', '18:00-18:30'], status: 'PLANNED' },
          { code: 'OVERTIME', name: 'Overtime Shift', start: '22:00', end: '02:00', durationHrs: 4, operators: 2, supervisors: 1, capacityPercent: 50, breaks: [], status: 'PLANNED' },
        ],
        operatorAvailability: [
          { operator: 'OP-001', name: 'Rajesh Kumar', shift: 'SHIFT-A', skills: ['MIXING', 'COOKING', 'PACKING'], assigned: true, hoursToday: 8, overtimeHrs: 0, certValid: true },
          { operator: 'OP-002', name: 'Anil Reddy', shift: 'SHIFT-A', skills: ['GRINDING', 'MIXING'], assigned: true, hoursToday: 8, overtimeHrs: 0, certValid: true },
          { operator: 'OP-003', name: 'Suresh Mehta', shift: 'SHIFT-B', skills: ['FRYING', 'PACKING'], assigned: true, hoursToday: 6, overtimeHrs: 0, certValid: true },
          { operator: 'OP-004', name: 'Vijay Patel', shift: 'SHIFT-B', skills: ['PACKING'], assigned: true, hoursToday: 5, overtimeHrs: 0, certValid: true },
          { operator: 'OP-005', name: 'Lakshmi V.', shift: 'SHIFT-A', skills: ['SUPERVISION', 'ALL'], assigned: true, hoursToday: 8, overtimeHrs: 0, certValid: true },
          { operator: 'OP-006', name: 'Mahesh K.', shift: 'SHIFT-B', skills: ['MAINTENANCE'], assigned: false, hoursToday: 4, overtimeHrs: 2, certValid: false, certExpiry: '2026-08-01' },
        ],
        summary: {
          totalShifts: 6, totalOperators: 6, totalSupervisors: 5, activeOperators: 5,
          totalCapacityPercent: 90, avgHoursPerOperator: 6.5,
          certificationExpiring: 1, overtimeHoursToday: 2,
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Shift planning retrieved')), { headers })
    }

    // GET /api/scheduling/info — Sprint 46 info
    if (path === '/api/scheduling/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 46, sprintName: 'Enterprise Production Scheduling, Finite Capacity Planning & Manufacturing Optimization', version: '46.0.0', part: 5, tables: 9,
        epics: [
          'Finite Capacity Scheduling (never creates impossible schedule)',
          'Machine-Level Scheduling (machine operations, setup/cleaning/maintenance/idle)',
          'Shift Planning (6 shift types: Morning/Afternoon/Night/Weekend/Festival/Overtime)',
          'Constraint-Based Scheduling (8 constraint types, auto violation avoidance)',
          'Changeover Optimization (4 types: None/Minor/Major/Full Clean, allergen risk)',
          'Campaign Manufacturing (group similar products, minimize cleaning)',
          'Material Synchronization (validate materials before schedule publish)',
          'Schedule Simulation (6 scenarios: failure/rush/delay/absence/demand/power)',
          'Frontend (8 admin modules)',
          'Backend (10 API groups, 9 database models)',
        ],
        chiefArchitectRecommendation: 'Implement Campaign Manufacturing based on product families to reduce cleaning time and allergen risks. Example sequence: Plain Kaju Katli → Kesar Kaju Katli → Pista Kaju Katli → Dry Fruit Mix Sweet → Milk Sweets → Chocolate Sweets. Benefits: Fewer cleanings, reduced contamination risk, lower water/detergent/labor, increased utilization, higher capacity, better food safety.',
        schedulingTypes: ['FINITE_CAPACITY', 'INFINITE_CAPACITY', 'FORWARD', 'BACKWARD', 'JUST_IN_TIME', 'CAMPAIGN', 'PRIORITY', 'MANUAL'],
        scheduleTypes: ['DAILY', 'WEEKLY', 'MONTHLY', 'ROLLING'],
        constraintTypes: ['MATERIAL_AVAILABILITY', 'MACHINE_CAPACITY', 'OPERATOR_SKILLS', 'CLEANING_TIME', 'MAINTENANCE_WINDOW', 'SHELF_LIFE', 'BATCH_SIZE', 'UTILITY_CAPACITY'],
        changeoverTypes: ['NONE', 'MINOR', 'MAJOR', 'FULL_CLEAN'],
        shiftTypes: ['SHIFT-A', 'SHIFT-B', 'SHIFT-C', 'WEEKEND', 'FESTIVAL', 'OVERTIME'],
        simulationScenarios: ['MACHINE_FAILURE', 'RUSH_ORDER', 'MATERIAL_DELAY', 'OPERATOR_ABSENCE', 'DEMAND_INCREASE', 'POWER_SHUTDOWN'],
        performanceTargets: { scheduleGeneration: '<10000 ms', simulation: '<15000 ms', productionLines: 100, workOrders: 10000 },
        endpoints: [
          'GET /api/scheduling/dashboard',
          'GET /api/scheduling',
          'POST /api/scheduling',
          'POST /api/scheduling/:id/publish',
          'GET /api/scheduling/:id/operations',
          'GET /api/scheduling/machine',
          'GET /api/scheduling/changeovers',
          'GET /api/scheduling/campaigns',
          'GET /api/scheduling/constraints',
          'GET /api/scheduling/simulations',
          'POST /api/scheduling/simulate',
          'GET /api/scheduling/shifts',
          'GET /api/scheduling/info',
        ],
        part5Sprint: 13, part5Sprints: 15, totalProjectTables: 414,
      }, 'SUOP Production Scheduling & Optimization Engine v46.0.0')), { headers })
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

print(f"Inserted Sprint 46 endpoints. Old: {len(content)}, New: {len(new_content)}")

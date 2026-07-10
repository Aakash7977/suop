#!/usr/bin/env python3
ENDPOINTS = r'''
    // ═════════════════════════════════════════════════════════
    // SPRINT 54 — HACCP, CCP MONITORING, FOOD SAFETY MANAGEMENT
    // ═════════════════════════════════════════════════════════

    // GET /api/food-safety/dashboard — Food Safety Dashboard
    if (path === '/api/food-safety/dashboard' && method === 'GET') {
      const data = {
        kpis: {
          haccpPlans: 4, activePlans: 3, hazardsIdentified: 24, criticalHazards: 6, ccpCount: 7, oprpCount: 8,
          ccpChecksToday: 124, ccpPassed: 122, ccpBreaches: 2, productionPaused: 0,
          empSamples: 48, empPending: 5, empPassed: 40, empFailed: 3,
          sanitationRecords: 24, sanitationVerified: 20, sanitationFailed: 1, sanitationPending: 3,
          allergenProducts: 15, allergenCrossContactIncidents: 0,
          foodDefensePlanActive: true, foodFraudAssessments: 12,
          foodSafetyAlerts: 2, criticalAlerts: 1,
        },
        haccpPlans: [
          { number: 'HACCP-2026-001', name: 'Kaju Katli Line HACCP', plant: 'THN', family: 'KATLI', version: 'v2.0', standard: 'HACCP', status: 'ACTIVE', hazards: 8, ccps: 3, oprps: 4, effective: '2026-01-15' },
          { number: 'HACCP-2026-002', name: 'Namkeen Line HACCP', plant: 'THN', family: 'NAMKEEN', version: 'v1.5', standard: 'HACCP', status: 'ACTIVE', hazards: 6, ccps: 2, oprps: 3, effective: '2026-03-01' },
          { number: 'HACCP-2026-003', name: 'Milk Sweets Line HACCP', plant: 'THN', family: 'MILK_SWEET', version: 'v1.2', standard: 'HACCP', status: 'ACTIVE', hazards: 7, ccps: 2, oprps: 1, effective: '2026-02-10' },
          { number: 'HACCP-2026-004', name: 'Idli Batter Line HACCP', plant: 'THN', family: 'ALL', version: 'v1.0', standard: 'HACCP', status: 'DRAFT', hazards: 3, ccps: 0, oprps: 0, effective: null },
        ],
        ccps: [
          { code: 'CCP-KK-01', name: 'Cooking Temperature', stage: 'COOKING', hazard: 'Biological - Salmonella', criticalMin: 108, criticalMax: 112, target: 110, unit: '°C', freq: 'CONTINUOUS', method: 'AUTOMATIC_SENSOR', status: 'ACTIVE', lastReading: 110, lastStatus: 'WITHIN_LIMIT', lastChecked: '08:00' },
          { code: 'CCP-KK-02', name: 'Metal Detection', stage: 'METAL_DETECTION', hazard: 'Physical - Foreign Material', criticalMin: null, criticalMax: null, target: 'PASS', unit: null, freq: 'EVERY_BATCH', method: 'INSTRUMENT_READING', status: 'ACTIVE', lastReading: 'PASS', lastStatus: 'WITHIN_LIMIT', lastChecked: '10:00' },
          { code: 'CCP-KK-03', name: 'Cooling Temperature', stage: 'COOLING', hazard: 'Biological - Bacterial Growth', criticalMin: 20, criticalMax: 30, target: 25, unit: '°C', freq: 'EVERY_BATCH', method: 'MANUAL_CHECK', status: 'ACTIVE', lastReading: 24, lastStatus: 'WITHIN_LIMIT', lastChecked: '09:30' },
          { code: 'CCP-NM-01', name: 'Frying Oil Temperature', stage: 'COOKING', hazard: 'Chemical - Acrylamide', criticalMin: 175, criticalMax: 185, target: 180, unit: '°C', freq: 'CONTINUOUS', method: 'AUTOMATIC_SENSOR', status: 'ACTIVE', lastReading: 182, lastStatus: 'WITHIN_LIMIT', lastChecked: '14:00' },
          { code: 'CCP-NM-02', name: 'Metal Detection (Namkeen)', stage: 'METAL_DETECTION', hazard: 'Physical - Foreign Material', criticalMin: null, criticalMax: null, target: 'PASS', unit: null, freq: 'EVERY_BATCH', method: 'INSTRUMENT_READING', status: 'ACTIVE', lastReading: 'FAIL', lastStatus: 'CRITICAL_BREACH', lastChecked: '14:30', breachAction: 'Production paused, batch on hold' },
          { code: 'CCP-ML-01', name: 'Sugar Syrup Temperature', stage: 'COOKING', hazard: 'Biological - Microbial', criticalMin: 105, criticalMax: 115, target: 110, unit: '°C', freq: 'EVERY_BATCH', method: 'MANUAL_CHECK', status: 'ACTIVE', lastReading: 110, lastStatus: 'WITHIN_LIMIT', lastChecked: '11:00' },
          { code: 'CCP-ALL-01', name: 'Packaging Seal Verification', stage: 'PACKING', hazard: 'Physical - Contamination', criticalMin: null, criticalMax: null, target: 'PASS', unit: null, freq: 'HOURLY', method: 'MANUAL_CHECK', status: 'ACTIVE', lastReading: 'PASS', lastStatus: 'WITHIN_LIMIT', lastChecked: '10:30' },
        ],
        empSamples: [
          { code: 'EMP-0048', type: 'SURFACE_SWAB', location: 'ZONE_1_HIGH_RISK', locDesc: 'Cooking kettle surface', scheduled: '2026-07-10', test: 'TPC', result: '<10 CFU/cm²', status: 'PASS', alertLevel: 'NONE' },
          { code: 'EMP-0047', type: 'DRAIN_SAMPLE', location: 'ZONE_2_MEDIUM_RISK', locDesc: 'Floor drain near mixing area', scheduled: '2026-07-10', test: 'LISTERIA', result: 'Not Detected', status: 'PASS', alertLevel: 'NONE' },
          { code: 'EMP-0046', type: 'HAND_SWAB', location: 'ZONE_1_HIGH_RISK', locDesc: 'Operator hands - Rajesh K.', scheduled: '2026-07-10', test: 'COLIFORM', result: '12 CFU/cm²', status: 'FAIL', alertLevel: 'ACTION', correctiveAction: 'Re-train operator on hand washing' },
          { code: 'EMP-0045', type: 'WATER_SAMPLE', location: 'ZONE_3_LOW_RISK', locDesc: 'Processing water tap', scheduled: '2026-07-09', test: 'TPC', result: '<100 CFU/ml', status: 'PASS', alertLevel: 'NONE' },
        ],
        sanitation: [
          { code: 'SAN-0048', type: 'PRE_PRODUCTION', area: 'LINE-KK-01', areaName: 'Kaju Katli Line', scheduled: '2026-07-10', chemical: 'Sodium Hypochlorite 200ppm', contactMin: 15, method: 'ATP_TEST', atpReading: 12, atpLimit: 30, result: 'PASS', verifiedBy: 'Lakshmi V.', status: 'VERIFIED' },
          { code: 'SAN-0047', type: 'BETWEEN_PRODUCT', area: 'LINE-NM-01', areaName: 'Namkeen Line', scheduled: '2026-07-09', chemical: 'Quaternary Ammonium 400ppm', contactMin: 10, method: 'ATP_TEST', atpReading: 45, atpLimit: 30, result: 'FAIL', verifiedBy: 'Suresh Mehta', status: 'FAILED', correctiveAction: 'Re-clean and retest' },
          { code: 'SAN-0046', type: 'END_OF_DAY', area: 'LINE-IB-01', areaName: 'Idli Batter Line', scheduled: '2026-07-09', chemical: 'Sodium Hypochlorite 200ppm', contactMin: 20, method: 'VISUAL', atpReading: null, atpLimit: null, result: 'PASS', verifiedBy: 'Anil Reddy', status: 'VERIFIED' },
        ],
        allergens: [
          { product: 'Kaju Katli 500g', sku: 'KK-500', milk: false, treeNuts: true, peanuts: false, sesame: false, soy: false, gluten: false, mustard: false, sulphites: false, dedicated: false, cleanValid: true, status: 'ACTIVE' },
          { product: 'Kesar Kaju Katli', sku: 'KKK-500', milk: false, treeNuts: true, peanuts: false, sesame: false, soy: false, gluten: false, mustard: false, sulphites: false, dedicated: false, cleanValid: true, status: 'ACTIVE' },
          { product: 'Gulab Jamun 1kg', sku: 'GUL-1KG', milk: true, treeNuts: false, peanuts: false, sesame: false, soy: false, gluten: true, mustard: false, sulphites: false, dedicated: false, cleanValid: true, status: 'ACTIVE' },
          { product: 'Mixed Namkeen 500g', sku: 'NM-500', milk: false, treeNuts: false, peanuts: false, sesame: false, soy: true, gluten: true, mustard: false, sulphites: false, dedicated: false, cleanValid: true, status: 'ACTIVE' },
        ],
        foodDefense: {
          planActive: true, facilitySecurity: true, restrictedAreas: true, visitorManagement: true, tamperDetection: true, intentionalContamination: true,
          fraudAssessments: 12, highRisk: 2, mediumRisk: 4, lowRisk: 6,
        },
        chiefArchitectRecommendation: 'Every CCP digitally monitored with configurable thresholds and automatic escalation. If any CCP exceeds critical limit: Production paused automatically → Batch placed on Quality Hold → Food safety incident created → Supervisors/Quality Managers receive immediate alerts → Production cannot resume until corrective actions completed and approved.',
      }
      return new Response(JSON.stringify(successResponse(data, 'Food Safety dashboard')), { headers })
    }

    // GET /api/food-safety/info — Sprint 54 info
    if (path === '/api/food-safety/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 54, sprintName: 'HACCP, CCP Monitoring, Food Safety Management & Environmental Monitoring', version: '54.0.0', part: 6, tables: 11,
        part6Sprint: 6, part6Sprints: 15, totalProjectTables: 491,
      }, 'SUOP Food Safety Engine v54.0.0')), { headers })
    }

'''

with open('mini-services/suop-backend/index.ts', 'r') as f:
    content = f.read()
marker = '    // 404\n    return new Response(JSON.stringify(errorResponse(`Route ${path} not found'
idx = content.find(marker)
new_content = content[:idx] + ENDPOINTS + content[idx:]
with open('mini-services/suop-backend/index.ts', 'w') as f:
    f.write(new_content)
print(f"Inserted Sprint 54 endpoints. Old: {len(content)}, New: {len(new_content)}")

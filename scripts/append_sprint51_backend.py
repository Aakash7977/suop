#!/usr/bin/env python3
"""Append Sprint 51 backend endpoints to mini-services/suop-backend/index.ts"""

ENDPOINTS = r'''
    // ═════════════════════════════════════════════════════════
    // SPRINT 51 — IN-PROCESS QUALITY CONTROL (IPQC) & REAL-TIME QUALITY
    // ═════════════════════════════════════════════════════════

    // GET /api/quality/ipqc/dashboard — IPQC Dashboard
    if (path === '/api/quality/ipqc/dashboard' && method === 'GET') {
      const data = {
        kpis: {
          totalIPQCInspections: 48, pending: 5, inProgress: 3, passed: 36, failed: 2, conditionalPass: 2, onHold: 3,
          totalCCPChecks: 124, ccpPassed: 122, ccpBreaches: 2, productionPaused: 0,
          activeQualityHolds: 3, batchQualityRecords: 24, releasedToday: 8,
          avgInspectionTimeMin: 12, checkpointsConfigured: 45, mandatoryCheckpoints: 28,
        },
        recentInspections: [
          { code: 'IPQC-00048', batch: 'KAJ-THN-20260709-000145', stage: 'COOKING', product: 'Kaju Katli 500g', inspector: 'Lakshmi V.', operator: 'Rajesh Kumar', machine: 'COOK-01', shift: 'SHIFT-A', checkpoints: 5, passed: 5, failed: 0, status: 'PASSED', result: 'PASS', time: '2026-07-09 08:00' },
          { code: 'IPQC-00047', batch: 'KAJ-THN-20260709-000145', stage: 'MIXING', product: 'Kaju Katli 500g', inspector: 'Lakshmi V.', operator: 'Rajesh Kumar', machine: 'MIX-01', shift: 'SHIFT-A', checkpoints: 4, passed: 4, failed: 0, status: 'PASSED', result: 'PASS', time: '2026-07-09 06:45' },
          { code: 'IPQC-00046', batch: 'KAJ-THN-20260709-000145', stage: 'RAW_MATERIAL_PREP', product: 'Kaju Katli 500g', inspector: 'Anil Reddy', operator: 'Rajesh Kumar', machine: null, shift: 'SHIFT-A', checkpoints: 3, passed: 3, failed: 0, status: 'PASSED', result: 'PASS', time: '2026-07-09 06:30' },
          { code: 'IPQC-00045', batch: 'NAM-THN-20260709-000021', stage: 'METAL_DETECTION', product: 'Mixed Namkeen 500g', inspector: 'Suresh Mehta', operator: 'Suresh Mehta', machine: 'MD-01', shift: 'SHIFT-B', checkpoints: 2, passed: 1, failed: 1, status: 'FAILED', result: 'FAIL', time: '2026-07-09 14:30', failReason: 'Metal detector failed - foreign particle detected in 2 samples' },
          { code: 'IPQC-00044', batch: 'SHW-THN-20260709-000047', stage: 'MIXING', product: 'Shwet Idli Batter 1kg', inspector: 'Anil Reddy', operator: 'Anil Reddy', machine: 'GRIND-01', shift: 'SHIFT-A', checkpoints: 4, passed: 3, failed: 1, status: 'CONDITIONAL_PASS', result: 'CONDITIONAL_PASS', time: '2026-07-09 07:00', conditionNotes: 'Grinding time 2.8h vs 3.0h target - approved with note to extend next batch' },
        ],
        ccpStatus: [
          { ccp: 'CCP-01 Cooking Temp', stage: 'COOKING', product: 'Kaju Katli', target: 110, min: 108, max: 112, unit: '°C', lastReading: 110, status: 'WITHIN_LIMIT', checkedAt: '08:00', checkedBy: 'Rajesh Kumar' },
          { ccp: 'CCP-02 Metal Detection', stage: 'METAL_DETECTION', product: 'All Products', target: 'PASS', min: null, max: null, unit: null, lastReading: 'PASS', status: 'WITHIN_LIMIT', checkedAt: '10:00', checkedBy: 'Suresh Mehta' },
          { ccp: 'CCP-03 Cooling Temp', stage: 'COOLING', product: 'Kaju Katli', target: 25, min: 20, max: 30, unit: '°C', lastReading: 24, status: 'WITHIN_LIMIT', checkedAt: '09:30', checkedBy: 'Rajesh Kumar' },
          { ccp: 'CCP-04 Frying Oil Temp', stage: 'COOKING', product: 'Mixed Namkeen', target: 180, min: 175, max: 185, unit: '°C', lastReading: 182, status: 'WITHIN_LIMIT', checkedAt: '14:00', checkedBy: 'Suresh Mehta' },
          { ccp: 'CCP-05 Packaging Seal', stage: 'PACKING', product: 'All Products', target: 'PASS', min: null, max: null, unit: null, lastReading: 'PASS', status: 'WITHIN_LIMIT', checkedAt: '10:30', checkedBy: 'Vijay Patel' },
          { ccp: 'CCP-06 Storage Temp', stage: 'COOLING', product: 'Cold Products', target: 4, min: 2, max: 8, unit: '°C', lastReading: 4, status: 'WITHIN_LIMIT', checkedAt: '12:00', checkedBy: 'System' },
        ],
        activeHolds: [
          { code: 'PQH-00003', batch: 'NAM-THN-20260709-000021', type: 'COMPLETE_HOLD', reason: 'CCP_BREACH', desc: 'Metal detection CCP failure - production halted', stage: 'METAL_DETECTION', severity: 'CRITICAL', status: 'ACTIVE', heldAt: '14:30' },
          { code: 'PQH-00002', batch: 'MOT-THN-20260708-000032', type: 'PARTIAL_HOLD', reason: 'QUALITY_FAILURE', desc: 'Sugar crystallization detected - 2kg portion held', stage: 'COOKING', severity: 'MAJOR', status: 'UNDER_REVIEW', heldAt: '18:00', reviewedBy: 'Lakshmi V.' },
          { code: 'PQH-00001', batch: 'SHW-THN-20260709-000047', type: 'PARTIAL_HOLD', reason: 'PARAMETER_DEVIATION', desc: 'Grinding time below target - 5kg portion held for retest', stage: 'MIXING', severity: 'MINOR', status: 'RELEASED', heldAt: '07:15', releasedAt: '07:45', releasedBy: 'Lakshmi V.' },
        ],
        batchQualityRecords: [
          { batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', inspections: 9, passed: 9, failed: 0, ccpChecks: 8, ccpPassed: 8, grade: 'A', status: 'RELEASED' },
          { batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', inspections: 8, passed: 8, failed: 0, ccpChecks: 7, ccpPassed: 7, grade: 'A', status: 'RELEASED' },
          { batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', inspections: 6, passed: 4, failed: 2, ccpChecks: 5, ccpPassed: 4, ccpBreaches: 1, grade: null, status: 'ON_HOLD' },
          { batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', inspections: 4, passed: 3, failed: 1, ccpChecks: 3, ccpPassed: 3, grade: 'B', status: 'IN_PROGRESS' },
        ],
        chiefArchitectRecommendation: 'Define mandatory IPQC checkpoints per product family. Example for Kaju Katli: Raw Material Verification → Cashew Paste Consistency → Cooking Temperature (CCP) → Brix/Sugar Concentration → Cooling Temperature → Sheet Thickness → Piece Weight → Silver Leaf Inspection → Metal Detection (CCP) → Packing Approval. Checkpoints ensure consistent quality, reduce batch failures, improve food safety, create complete digital quality history.',
      }
      return new Response(JSON.stringify(successResponse(data, 'IPQC dashboard')), { headers })
    }

    // GET /api/quality/ipqc/checkpoints — Quality checkpoints by stage
    if (path === '/api/quality/ipqc/checkpoints' && method === 'GET') {
      const checkpoints = [
        { code: 'CP-KK-RM-01', name: 'Raw Material Verification', stage: 'RAW_MATERIAL_PREP', family: 'KATLI', type: 'INGREDIENT_VERIFICATION', min: null, max: null, target: 'PASS', unit: null, severity: 'CRITICAL', mandatory: true, ccp: false, order: 1, status: 'ACTIVE' },
        { code: 'CP-KK-MIX-01', name: 'Cashew Paste Consistency', stage: 'MIXING', family: 'KATLI', type: 'TEXTURE', min: null, max: null, target: 'Smooth', unit: null, severity: 'MAJOR', mandatory: true, ccp: false, order: 2, status: 'ACTIVE' },
        { code: 'CP-KK-COOK-01', name: 'Cooking Temperature (CCP)', stage: 'COOKING', family: 'KATLI', type: 'TEMPERATURE', min: 108, max: 112, target: 110, unit: '°C', severity: 'CRITICAL', mandatory: true, ccp: true, order: 3, status: 'ACTIVE' },
        { code: 'CP-KK-COOK-02', name: 'Brix / Sugar Concentration', stage: 'COOKING', family: 'KATLI', type: 'MOISTURE', min: 68, max: 72, target: 70, unit: '%', severity: 'MAJOR', mandatory: true, ccp: false, order: 4, status: 'ACTIVE' },
        { code: 'CP-KK-COOL-01', name: 'Cooling Temperature', stage: 'COOLING', family: 'KATLI', type: 'TEMPERATURE', min: 20, max: 30, target: 25, unit: '°C', severity: 'MAJOR', mandatory: true, ccp: false, order: 5, status: 'ACTIVE' },
        { code: 'CP-KK-CUT-01', name: 'Sheet Thickness', stage: 'CUTTING', family: 'KATLI', type: 'DIMENSIONS', min: 4, max: 6, target: 5, unit: 'MM', severity: 'MAJOR', mandatory: true, ccp: false, order: 6, status: 'ACTIVE' },
        { code: 'CP-KK-CUT-02', name: 'Piece Weight', stage: 'CUTTING', family: 'KATLI', type: 'WEIGHT', min: 18, max: 22, target: 20, unit: 'G', severity: 'MAJOR', mandatory: true, ccp: false, order: 7, status: 'ACTIVE' },
        { code: 'CP-KK-CUT-03', name: 'Silver Leaf Inspection', stage: 'CUTTING', family: 'KATLI', type: 'VISUAL_QUALITY', min: null, max: null, target: 'PASS', unit: null, severity: 'MINOR', mandatory: false, ccp: false, order: 8, status: 'ACTIVE' },
        { code: 'CP-KK-MD-01', name: 'Metal Detection (CCP)', stage: 'METAL_DETECTION', family: 'ALL', type: 'METAL_DETECTION', min: null, max: null, target: 'PASS', unit: null, severity: 'CRITICAL', mandatory: true, ccp: true, order: 9, status: 'ACTIVE' },
        { code: 'CP-KK-PACK-01', name: 'Packing Approval', stage: 'PACKING', family: 'KATLI', type: 'VISUAL_QUALITY', min: null, max: null, target: 'PASS', unit: null, severity: 'MAJOR', mandatory: true, ccp: false, order: 10, status: 'ACTIVE' },
      ]
      return new Response(JSON.stringify(successResponse(checkpoints, 'Quality checkpoints retrieved')), { headers })
    }

    // GET /api/quality/ipqc/info — Sprint 51 info
    if (path === '/api/quality/ipqc/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 51, sprintName: 'In-Process Quality Control (IPQC), Process Validation & Real-Time Production Quality', version: '51.0.0', part: 6, tables: 11,
        epics: [
          'In-Process Inspection Engine (7 statuses, stage-wise, digital signature)',
          'Stage-wise Quality Checkpoints (10 checkpoint types, mandatory/CCP flags)',
          'Process Parameter Monitoring (9 parameter types, warning/critical limits, auto-alert)',
          'CCP Monitoring (6 CCPs, corrective actions, production pause on breach)',
          'Digital Quality Checklists (operator/supervisor/inspector, photo/sig/QR)',
          'Batch Quality Record (complete digital history, immutable, grade A/B/C/REJECT)',
          'Production Quality Hold (4 hold types, supervisor review, release/rework/reject)',
          'Real-Time Quality Alerts (7 alert types, 5 delivery channels, <2s)',
        ],
        chiefArchitectRecommendation: 'Mandatory IPQC checkpoints per product family. Example for Kaju Katli: RM Verification → Paste Consistency → Cooking Temp (CCP) → Brix → Cooling → Thickness → Weight → Silver Leaf → Metal Detection (CCP) → Packing. Ensures consistent quality, reduces batch failures, creates complete digital quality history.',
        productionStages: ['RAW_MATERIAL_PREP', 'MIXING', 'COOKING', 'ROASTING', 'COOLING', 'CUTTING', 'PACKING', 'METAL_DETECTION', 'FINISHED_BATCH'],
        inspectionStatuses: ['PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'CONDITIONAL_PASS', 'REWORK_REQUIRED', 'QUALITY_HOLD'],
        checkpointTypes: ['INGREDIENT_VERIFICATION', 'TEMPERATURE', 'COOKING_TIME', 'MOISTURE', 'COLOR', 'TASTE', 'TEXTURE', 'WEIGHT', 'DIMENSIONS', 'VISUAL_QUALITY'],
        parameterTypes: ['TEMPERATURE', 'PRESSURE', 'HUMIDITY', 'MIXING_SPEED', 'COOKING_TIME', 'COOLING_TIME', 'MACHINE_SPEED', 'OIL_TEMPERATURE', 'STEAM_PRESSURE'],
        holdTypes: ['PARTIAL_HOLD', 'COMPLETE_HOLD', 'LINE_HOLD', 'MACHINE_HOLD'],
        holdReasons: ['QUALITY_FAILURE', 'CCP_BREACH', 'PARAMETER_DEVIATION', 'OPERATOR_ERROR', 'MACHINE_FAULT', 'REPEATED_DEFECTS', 'MANUAL_HOLD'],
        endpoints: [
          'GET /api/quality/ipqc/dashboard',
          'GET /api/quality/ipqc/checkpoints',
          'GET /api/quality/ipqc/info',
        ],
        part6Sprint: 3, part6Sprints: 15, totalProjectTables: 465,
      }, 'SUOP IPQC Engine v51.0.0')), { headers })
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

print(f"Inserted Sprint 51 endpoints. Old: {len(content)}, New: {len(new_content)}")

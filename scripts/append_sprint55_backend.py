#!/usr/bin/env python3
ENDPOINTS = r'''
    // ═════════════════════════════════════════════════════════
    // SPRINT 55 — NCR, DEVIATION MANAGEMENT & QUALITY INCIDENT CONTROL
    // ═════════════════════════════════════════════════════════

    // GET /api/quality/ncr/dashboard — NCR & Incident Dashboard
    if (path === '/api/quality/ncr/dashboard' && method === 'GET') {
      const data = {
        kpis: {
          totalNCRs: 48, open: 8, investigating: 3, dispositionPending: 2, closed: 35,
          critical: 2, foodSafetyCritical: 1, major: 12, minor: 33,
          quarantinedBatches: 4, quarantinedValue: 84000,
          deviationsOpen: 5, deviationsApproved: 18, deviationsRejected: 2,
          avgClosureDays: 4.5, escalationsActive: 3,
        },
        ncrs: [
          { number: 'NCR-00048', source: 'FGQC', batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', type: 'METAL_DETECTION_FAILURE', desc: 'Metal detector CCP failure - foreign particle detected', severity: 'FOOD_SAFETY_CRITICAL', reportedBy: 'Suresh Mehta', reportedAt: '2026-07-09 14:30', quarantine: true, quarantinedQty: 250, status: 'INVESTIGATING', assignedTo: 'Lakshmi V.', escalation: 3, escalatedTo: 'Plant Head' },
          { number: 'NCR-00047', source: 'IPQC', batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', type: 'PROCESS_DEVIATION', desc: 'Sugar crystallization detected - texture deviation', severity: 'MAJOR', reportedBy: 'Lakshmi V.', reportedAt: '2026-07-08 18:00', quarantine: true, quarantinedQty: 2, status: 'DISPOSITION_PENDING', assignedTo: 'Lakshmi V.', escalation: 1, escalatedTo: 'Quality Manager' },
          { number: 'NCR-00046', source: 'CUSTOMER_COMPLAINT', batch: 'KAJ-THN-20260628-000011', product: 'Kaju Katli 500g', type: 'CUSTOMER_COMPLAINT', desc: 'Customer reported taste deviation in batch', severity: 'CRITICAL', reportedBy: 'Customer Care', reportedAt: '2026-07-08 11:00', quarantine: true, quarantinedQty: 96, status: 'INVESTIGATING', assignedTo: 'Quality Head', escalation: 3, escalatedTo: 'Plant Head' },
          { number: 'NCR-00045', source: 'IQC', batch: 'SPC-RED Chilli Powder', product: 'Chilli Powder', type: 'SPECIFICATION_DEVIATION', desc: 'Color significantly darker than spec - possible adulteration', severity: 'CRITICAL', reportedBy: 'Anil Reddy', reportedAt: '2026-07-09 14:00', quarantine: true, quarantinedQty: 50, status: 'CLOSED', disposition: 'RETURN_SUPPLIER', closedAt: '2026-07-09 16:00', closureNotes: 'Returned to supplier Goyal Food Spices' },
          { number: 'NCR-00044', source: 'PACKAGING', batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', type: 'PACKAGING_DEFECT', desc: '0.5kg broken pieces during cutting', severity: 'MINOR', reportedBy: 'Rajesh Kumar', reportedAt: '2026-07-09 11:35', quarantine: false, status: 'CLOSED', disposition: 'REWORK', closedAt: '2026-07-09 13:00', closureNotes: 'Repacked - quality passed' },
        ],
        deviations: [
          { code: 'DEV-00012', ncr: 'NCR-00047', type: 'PROCESS_DEVIATION', planned: 'Sugar 37%', actual: 'Sugar 35%', amount: '-2%', unit: '%', impact: 'Texture deviation - sugar crystallization', affectedQty: 2, decision: 'CONDITIONAL', status: 'APPROVED' },
          { code: 'DEV-00011', ncr: null, type: 'TEMPERATURE_DEVIATION', planned: '110°C', actual: '112°C', amount: '+2°C', unit: '°C', impact: 'Upper threshold - monitor', affectedQty: 94, decision: 'APPROVED', status: 'CLOSED' },
          { code: 'DEV-00010', ncr: 'NCR-00048', type: 'SPECIFICATION_DEVIATION', planned: 'Metal PASS', actual: 'Metal FAIL', amount: null, unit: null, impact: 'Foreign particle detected', affectedQty: 250, decision: null, status: 'OPEN' },
        ],
        quarantined: [
          { code: 'QRT-00004', ncr: 'NCR-00048', batch: 'NAM-THN-20260709-000021', item: 'Mixed Namkeen 500g', type: 'FINISHED_GOODS', qty: 250, uom: 'KG', warehouse: 'WH-THN-FG-01', bin: 'QRT-FG-01', locked: true, status: 'UNDER_INVESTIGATION' },
          { code: 'QRT-00003', ncr: 'NCR-00047', batch: 'MOT-THN-20260708-000032', item: 'Motichoor Laddu 1kg', type: 'FINISHED_GOODS', qty: 2, uom: 'KG', warehouse: 'WH-THN-FG-01', bin: 'QRT-FG-02', locked: true, status: 'DISPOSITION_PENDING' },
          { code: 'QRT-00002', ncr: 'NCR-00046', batch: 'KAJ-THN-20260628-000011', item: 'Kaju Katli 500g', type: 'FINISHED_GOODS', qty: 96, uom: 'PCS', warehouse: 'WH-THN-FG-01', bin: 'QRT-FG-03', locked: true, status: 'UNDER_INVESTIGATION' },
          { code: 'QRT-00001', ncr: 'NCR-00045', batch: 'SPC-RED', item: 'Chilli Powder', type: 'RAW_MATERIAL', qty: 50, uom: 'KG', warehouse: 'WH-THN-RM-01', bin: 'QRT-RM-01', locked: false, status: 'RELEASED', disposition: 'RETURN_SUPPLIER', releasedAt: '2026-07-09 16:00' },
        ],
        chiefArchitectRecommendation: 'Every critical NCR should automatically lock all related inventory using batch genealogy. Customer Complaint → Finished Goods Batch → Find Production Batch → Find Ingredient Batches → Lock Warehouse Inventory → Block Retail POS Sale → Block Restaurant Consumption → Notify Quality Team → Start Investigation. MES batch genealogy enables immediate identification of all affected materials.',
      }
      return new Response(JSON.stringify(successResponse(data, 'NCR & Incident dashboard')), { headers })
    }

    // GET /api/quality/ncr/info — Sprint 55 info
    if (path === '/api/quality/ncr/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 55, sprintName: 'Non-Conformance (NCR), Deviation Management & Quality Incident Control', version: '55.0.0', part: 6, tables: 6,
        part6Sprint: 7, part6Sprints: 15, totalProjectTables: 497,
      }, 'SUOP NCR & Incident Engine v55.0.0')), { headers })
    }

'''

with open('mini-services/suop-backend/index.ts', 'r') as f:
    content = f.read()
marker = '    // 404\n    return new Response(JSON.stringify(errorResponse(`Route ${path} not found'
idx = content.find(marker)
new_content = content[:idx] + ENDPOINTS + content[idx:]
with open('mini-services/suop-backend/index.ts', 'w') as f:
    f.write(new_content)
print(f"Inserted Sprint 55. Old: {len(content)}, New: {len(new_content)}")

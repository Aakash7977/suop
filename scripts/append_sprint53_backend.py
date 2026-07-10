#!/usr/bin/env python3
"""Append Sprint 53 LIMS backend endpoints"""

ENDPOINTS = r'''
    // ═════════════════════════════════════════════════════════
    // SPRINT 53 — LABORATORY INFORMATION MANAGEMENT SYSTEM (LIMS)
    // ═════════════════════════════════════════════════════════

    // GET /api/quality/lims/dashboard — LIMS Dashboard
    if (path === '/api/quality/lims/dashboard' && method === 'GET') {
      const data = {
        kpis: {
          totalSamples: 248, pending: 12, collected: 8, received: 5, testing: 3, validation: 2, approved: 215, rejected: 3,
          totalTests: 1240, pendingTests: 18, inProgress: 5, completed: 1210, overdue: 4, oos: 2,
          totalEquipment: 12, calibrationDue: 2, overdueCalibration: 1,
          inventoryItems: 48, lowStock: 4, expiringSoon: 2, expired: 1,
          worklistsOpen: 3, reportsGenerated: 215,
        },
        samples: [
          { number: 'LAB-00248', barcode: 'LAB202600248', type: 'FINISHED_GOODS', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', source: 'FGQC', requestedBy: 'Lakshmi V.', collectedBy: 'Anil Reddy', collectedAt: '2026-07-09 10:00', status: 'APPROVED', priority: 'NORMAL' },
          { number: 'LAB-00247', barcode: 'LAB202600247', type: 'RAW_MATERIAL', batch: 'CAS-THN-20260705-000018', product: 'Cashew W320', supplier: 'Sri Balaji Cashews', source: 'IQC', requestedBy: 'Anil Reddy', collectedBy: 'Anil Reddy', collectedAt: '2026-07-05 10:30', status: 'APPROVED', priority: 'HIGH' },
          { number: 'LAB-00246', barcode: 'LAB202600246', type: 'FINISHED_GOODS', batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', source: 'FGQC', requestedBy: 'Suresh Mehta', collectedBy: 'Suresh Mehta', collectedAt: '2026-07-09 14:30', status: 'TESTING', priority: 'URGENT' },
          { number: 'LAB-00245', barcode: 'LAB202600245', type: 'WATER', batch: null, product: 'Plant Water Sample', source: 'ROUTINE', requestedBy: 'Lakshmi V.', collectedBy: 'Anil Reddy', collectedAt: '2026-07-10 08:00', status: 'RECEIVED', priority: 'NORMAL' },
          { number: 'LAB-00244', barcode: 'LAB202600244', type: 'RETENTION', batch: 'KAJ-THN-20260628-000011', product: 'Kaju Katli 500g', source: 'RETENTION', requestedBy: 'System', collectedBy: 'System', collectedAt: '2026-06-28 12:00', status: 'ARCHIVED', priority: 'LOW', retentionExpiry: '2027-06-28' },
        ],
        worklists: [
          { code: 'WL-2026-003', date: '2026-07-10', assignedTo: 'Anil Reddy', totalTests: 12, pending: 4, inProgress: 2, completed: 6, overdue: 0, status: 'IN_PROGRESS' },
          { code: 'WL-2026-002', date: '2026-07-10', assignedTo: 'Suresh Mehta', totalTests: 8, pending: 3, inProgress: 1, completed: 3, overdue: 1, status: 'IN_PROGRESS' },
          { code: 'WL-2026-001', date: '2026-07-09', assignedTo: 'Anil Reddy', totalTests: 15, pending: 0, inProgress: 0, completed: 15, overdue: 0, status: 'COMPLETED' },
        ],
        equipment: [
          { code: 'LE-PH-01', name: 'pH Meter 01', type: 'PH_METER', lastCal: '2026-04-15', nextCal: '2026-07-15', calStatus: 'VALID', usageHrs: 1240, status: 'ACTIVE' },
          { code: 'LE-MOIST-01', name: 'Moisture Analyzer 01', type: 'MOISTURE_ANALYZER', lastCal: '2026-04-20', nextCal: '2026-07-20', calStatus: 'DUE', usageHrs: 890, status: 'ACTIVE' },
          { code: 'LE-BAL-01', name: 'Weighing Scale 01', type: 'WEIGHING_SCALE', lastCal: '2026-03-10', nextCal: '2026-06-10', calStatus: 'OVERDUE', usageHrs: 2150, status: 'ACTIVE' },
          { code: 'LE-BRIX-01', name: 'Brix Meter 01', type: 'BRIX_METER', lastCal: '2026-05-01', nextCal: '2026-08-01', calStatus: 'VALID', usageHrs: 560, status: 'ACTIVE' },
        ],
        inventory: [
          { code: 'LI-REAG-001', name: 'Sodium Hydroxide 0.1N', type: 'REAGENT', stock: 2.5, min: 1, max: 10, uom: 'L', expiry: '2026-12-15', lowStock: false, expiring: false, status: 'ACTIVE' },
          { code: 'LI-REAG-002', name: 'Agar Powder', type: 'REAGENT', stock: 0.3, min: 0.5, max: 5, uom: 'KG', expiry: '2026-09-20', lowStock: true, expiring: false, status: 'LOW_STOCK' },
          { code: 'LI-CONS-001', name: 'Petri Dishes 90mm', type: 'CONSUMABLE', stock: 480, min: 100, max: 1000, uom: 'PCS', expiry: null, lowStock: false, expiring: false, status: 'ACTIVE' },
          { code: 'LI-STD-001', name: 'pH Buffer 4.01', type: 'STANDARD', stock: 0.1, min: 0.2, max: 2, uom: 'L', expiry: '2026-07-15', lowStock: true, expiring: true, status: 'LOW_STOCK' },
        ],
        chiefArchitectRecommendation: 'Establish a Retention Sample Program within LIMS. Every production batch → FGQC Approved → Retention Sample Created → Barcode Generated → Storage Rack Assigned → Retention Period (6-12 months) → Available for complaint investigation or regulatory audit → Secure disposal after retention period.',
      }
      return new Response(JSON.stringify(successResponse(data, 'LIMS dashboard')), { headers })
    }

    // GET /api/quality/lims/info — Sprint 53 info
    if (path === '/api/quality/lims/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 53, sprintName: 'Laboratory Information Management System (LIMS), Sample Lifecycle & Test Management', version: '53.0.0', part: 6, tables: 7,
        part6Sprint: 5, part6Sprints: 15, totalProjectTables: 480,
      }, 'SUOP LIMS Engine v53.0.0')), { headers })
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

print(f"Inserted Sprint 53 endpoints. Old: {len(content)}, New: {len(new_content)}")

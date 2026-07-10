#!/usr/bin/env python3
"""Append Sprint 50 backend endpoints to mini-services/suop-backend/index.ts"""

ENDPOINTS = r'''
    // ═════════════════════════════════════════════════════════
    // SPRINT 50 — SUPPLIER QUALITY & INCOMING RAW MATERIAL INSPECTION
    // ═════════════════════════════════════════════════════════

    // GET /api/quality/suppliers — Supplier qualification dashboard
    if (path === '/api/quality/suppliers' && method === 'GET') {
      const data = {
        kpis: {
          totalSuppliers: 48, approved: 32, qualified: 8, pending: 5, conditional: 2, suspended: 1, blacklisted: 0,
          preferredSuppliers: 12, highRiskSuppliers: 3, auditsDue: 4, certificationsExpiring: 2,
          totalIncomingInspections: 24, pendingInspections: 3, passedToday: 18, failedToday: 2, conditionalToday: 1,
          qualityHoldItems: 5, ncrsOpen: 4, avgAcceptanceRate: 94.2,
        },
        suppliers: [
          { code: 'SUP-001', name: 'Sri Balaji Cashews', category: 'DRY_FRUITS', status: 'APPROVED', risk: 'LOW', preferred: true, auditFreq: 'ANNUAL', lastAudit: '2026-03-15', nextAudit: '2027-03-15', certifications: 3, products: 8, acceptanceRate: 98.5, rating: 'A_PLUS' },
          { code: 'SUP-002', name: 'EID Parry India Ltd', category: 'RAW_MATERIAL', status: 'APPROVED', risk: 'LOW', preferred: true, auditFreq: 'ANNUAL', lastAudit: '2026-02-20', nextAudit: '2027-02-20', certifications: 4, products: 5, acceptanceRate: 99.0, rating: 'A_PLUS' },
          { code: 'SUP-003', name: 'Amul Dairy', category: 'MILK_PRODUCTS', status: 'APPROVED', risk: 'LOW', preferred: true, auditFreq: 'SEMI_ANNUAL', lastAudit: '2026-04-10', nextAudit: '2026-10-10', certifications: 5, products: 12, acceptanceRate: 97.8, rating: 'A' },
          { code: 'SUP-004', name: 'Goyal Food Spices', category: 'SPICES', status: 'CONDITIONAL', risk: 'HIGH', preferred: false, auditFreq: 'QUARTERLY', lastAudit: '2026-05-20', nextAudit: '2026-08-20', certifications: 2, products: 6, acceptanceRate: 82.5, rating: 'C' },
          { code: 'SUP-005', name: 'Premium Packaging Co', category: 'PACKAGING', status: 'APPROVED', risk: 'MEDIUM', preferred: false, auditFreq: 'ANNUAL', lastAudit: '2026-01-15', nextAudit: '2027-01-15', certifications: 2, products: 15, acceptanceRate: 95.0, rating: 'A' },
          { code: 'SUP-006', name: 'Fortune Oils', category: 'OILS_GHEE', status: 'APPROVED', risk: 'LOW', preferred: true, auditFreq: 'ANNUAL', lastAudit: '2026-06-01', nextAudit: '2027-06-01', certifications: 3, products: 4, acceptanceRate: 96.5, rating: 'A' },
          { code: 'SUP-007', name: 'Local Spice Trader', category: 'SPICES', status: 'SUSPENDED', risk: 'CRITICAL', preferred: false, auditFreq: 'QUARTERLY', lastAudit: '2026-04-05', nextAudit: '2026-07-05', certifications: 1, products: 3, acceptanceRate: 65.0, rating: 'D' },
        ],
        chiefArchitectRecommendation: 'Three warehouse inventory statuses: Quality Hold (newly received, manufacturing NOT allowed), Approved (passed all checks, manufacturing ALLOWED), Rejected/Blocked (failed inspection, NOT allowed). Strict workflow ensures only approved ingredients enter production.',
      }
      return new Response(JSON.stringify(successResponse(data, 'Supplier quality dashboard')), { headers })
    }

    // GET /api/quality/incoming — Incoming inspection queue
    if (path === '/api/quality/incoming' && method === 'GET') {
      const inspections = [
        { code: 'IQC-00048', grn: 'GR-2026-00152', po: 'PO-2026-00150', supplier: 'Sri Balaji Cashews', supplierBatch: 'SBC-2026-0710', material: 'CAS-W320 Cashew W320', category: 'DRY_FRUITS', receivedQty: 500, sampledQty: 50, uom: 'KG', template: 'ITP-RAW-CASHEW', samplingPlan: 'SP-AQL-2.5', status: 'IN_INSPECTION', inspector: 'Anil Reddy', createdAt: '2026-07-10 09:30' },
        { code: 'IQC-00047', grn: 'GR-2026-00151', po: 'PO-2026-00149', supplier: 'EID Parry India Ltd', supplierBatch: 'EID-2026-0305', material: 'SUG-S30 Sugar S30', category: 'RAW_MATERIAL', receivedQty: 1000, sampledQty: 80, uom: 'KG', template: 'ITP-RAW-SUGAR', samplingPlan: 'SP-AQL-2.5', status: 'PASSED', result: 'PASS', decision: 'FULL_ACCEPTANCE', acceptedQty: 1000, rejectedQty: 0, inspector: 'Anil Reddy', inspectedAt: '2026-07-10 08:00', approvedBy: 'Lakshmi V.', approvedAt: '2026-07-10 08:30' },
        { code: 'IQC-00046', grn: 'GR-2026-00150', po: 'PO-2026-00148', supplier: 'Amul Dairy', supplierBatch: 'AMUL-2026-0790', material: 'GHE-COW Cow Ghee', category: 'MILK_PRODUCTS', receivedQty: 200, sampledQty: 20, uom: 'KG', template: 'ITP-RAW-GHEE', samplingPlan: 'SP-RANDOM', status: 'PASSED', result: 'PASS', decision: 'FULL_ACCEPTANCE', acceptedQty: 200, rejectedQty: 0, inspector: 'Suresh Mehta', inspectedAt: '2026-07-09 16:00', approvedBy: 'Lakshmi V.', approvedAt: '2026-07-09 16:30' },
        { code: 'IQC-00045', grn: 'GR-2026-00149', po: 'PO-2026-00147', supplier: 'Goyal Food Spices', supplierBatch: 'GFS-2026-0142', material: 'SPC-RED Chilli Powder', category: 'SPICES', receivedQty: 50, sampledQty: 15, uom: 'KG', template: 'ITP-RAW-SPICE', samplingPlan: 'SP-AQL-1.0', status: 'FAILED', result: 'FAIL', decision: 'FULL_REJECTION', acceptedQty: 0, rejectedQty: 50, inspector: 'Anil Reddy', inspectedAt: '2026-07-09 14:00', approvedBy: 'Lakshmi V.', approvedAt: '2026-07-09 14:30', ncrGenerated: true, ncrNumber: 'SNCR-2026-00042' },
        { code: 'IQC-00044', grn: 'GR-2026-00148', po: 'PO-2026-00146', supplier: 'Premium Packaging Co', supplierBatch: 'PPC-2026-0280', material: 'PKG-BOX-500 Boxes 500g', category: 'PACKAGING', receivedQty: 5000, sampledQty: 50, uom: 'PCS', template: 'ITP-PKG-BOX', samplingPlan: 'SP-AQL-2.5', status: 'CONDITIONAL', result: 'CONDITIONAL_PASS', decision: 'CONDITIONAL_ACCEPTANCE', acceptedQty: 4800, rejectedQty: 200, inspector: 'Suresh Mehta', inspectedAt: '2026-07-09 11:00', approvedBy: 'Lakshmi V.', approvedAt: '2026-07-09 11:30', conditionNotes: '200 boxes with minor print defect - accepted for internal use only' },
        { code: 'IQC-00043', grn: 'GR-2026-00147', po: 'PO-2026-00145', supplier: 'Fortune Oils', supplierBatch: 'FO-2026-0188', material: 'OIL-SUN Sunflower Oil', category: 'OILS_GHEE', receivedQty: 500, sampledQty: 50, uom: 'LITER', template: 'ITP-RAW-OIL', samplingPlan: 'SP-AQL-2.5', status: 'PENDING', inspector: null },
      ]
      return new Response(JSON.stringify(successResponse(inspections, 'Incoming inspections retrieved')), { headers })
    }

    // GET /api/quality/hold — Quality Hold inventory
    if (path === '/api/quality/hold' && method === 'GET') {
      const data = {
        items: [
          { code: 'QHI-00048', grn: 'GR-2026-00152', inspection: 'IQC-00048', material: 'CAS-W320 Cashew W320', supplier: 'Sri Balaji Cashews', supplierBatch: 'SBC-2026-0710', heldQty: 500, releasedQty: 0, rejectedQty: 0, uom: 'KG', warehouse: 'WH-THN-RM-01', bin: 'QH-RM-CAS-01', status: 'UNDER_INSPECTION', heldAt: '2026-07-10 09:35' },
          { code: 'QHI-00047', grn: 'GR-2026-00149', inspection: 'IQC-00045', material: 'SPC-RED Chilli Powder', supplier: 'Goyal Food Spices', supplierBatch: 'GFS-2026-0142', heldQty: 50, releasedQty: 0, rejectedQty: 50, uom: 'KG', warehouse: 'WH-THN-RM-01', bin: 'QH-REJECT-01', status: 'REJECTED', heldAt: '2026-07-09 14:05', releasedAt: '2026-07-09 14:35' },
          { code: 'QHI-00046', grn: 'GR-2026-00148', inspection: 'IQC-00044', material: 'PKG-BOX-500 Boxes 500g', supplier: 'Premium Packaging Co', supplierBatch: 'PPC-2026-0280', heldQty: 5000, releasedQty: 4800, rejectedQty: 200, uom: 'PCS', warehouse: 'WH-THN-PKG-01', bin: 'QH-PKG-01', status: 'CONDITIONAL_RELEASE', heldAt: '2026-07-09 11:05', releasedAt: '2026-07-09 11:35' },
          { code: 'QHI-00045', grn: 'GR-2026-00147', inspection: 'IQC-00043', material: 'OIL-SUN Sunflower Oil', supplier: 'Fortune Oils', supplierBatch: 'FO-2026-0188', heldQty: 500, releasedQty: 0, rejectedQty: 0, uom: 'LITER', warehouse: 'WH-THN-RM-01', bin: 'QH-RM-OIL-01', status: 'QUALITY_HOLD', heldAt: '2026-07-09 10:00' },
          { code: 'QHI-00044', grn: 'GR-2026-00146', inspection: 'IQC-00042', material: 'SUG-S30 Sugar S30', supplier: 'EID Parry India Ltd', supplierBatch: 'EID-2026-0304', heldQty: 500, releasedQty: 500, rejectedQty: 0, uom: 'KG', warehouse: 'WH-THN-RM-01', bin: 'RM-SUG-01', status: 'APPROVED', heldAt: '2026-07-08 14:00', releasedAt: '2026-07-08 16:00' },
        ],
        summary: {
          totalItems: 5, qualityHold: 2, underInspection: 1, approved: 1, rejected: 1, conditionalRelease: 1,
          totalHeldValue: 285000, releasedValue: 252000, rejectedValue: 12000,
          avgHoldTimeHrs: 4.5,
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Quality hold inventory')), { headers })
    }

    // GET /api/quality/ncr — Supplier NCRs
    if (path === '/api/quality/ncr' && method === 'GET') {
      const data = {
        ncrs: [
          { number: 'SNCR-2026-00042', inspection: 'IQC-00045', grn: 'GR-2026-00149', supplier: 'Goyal Food Spices', material: 'SPC-RED Chilli Powder', batch: 'GFS-2026-0142', type: 'QUALITY_FAILURE', defect: 'Color significantly darker than specification - possible adulteration', severity: 'CRITICAL', rootCause: 'Supplier process - inadequate color sorting at supplier facility', category: 'SUPPLIER_PROCESS', disposition: 'RETURN_TO_SUPPLIER', status: 'NOTIFIED', notifiedAt: '2026-07-09 15:00', responseAt: null, correctiveActions: 0 },
          { number: 'SNCR-2026-00041', inspection: 'IQC-00040', grn: 'GR-2026-00145', supplier: 'Goyal Food Spices', material: 'SPC-TURM Turmeric Powder', batch: 'GFS-2026-0138', type: 'SPECIFICATION_DEVIATION', defect: 'Moisture content 8.2% vs max 7% specification', severity: 'MAJOR', rootCause: 'Inadequate drying process at supplier', category: 'SUPPLIER_PROCESS', disposition: 'RETURN_TO_SUPPLIER', status: 'CLOSED', notifiedAt: '2026-06-28 10:00', responseAt: '2026-06-29 14:00', closedAt: '2026-07-05 16:00', correctiveActions: 2 },
          { number: 'SNCR-2026-00040', inspection: 'IQC-00036', grn: 'GR-2026-00140', supplier: 'Premium Packaging Co', material: 'PKG-LBL-500 Labels 500g', batch: 'PPC-2026-0270', type: 'MISLABELING', defect: 'Batch number printing illegible on 200 labels', severity: 'MINOR', rootCause: 'Printer calibration issue at supplier', category: 'SUPPLIER_PROCESS', disposition: 'CONDITIONAL_ACCEPTANCE', status: 'VERIFIED', notifiedAt: '2026-06-20 11:00', responseAt: '2026-06-21 09:00', closedAt: '2026-07-01 15:00', correctiveActions: 1 },
          { number: 'SNCR-2026-00039', inspection: 'IQC-00030', grn: 'GR-2026-00130', supplier: 'Local Spice Trader', material: 'SPC-BLACK Black Pepper', batch: 'LST-2026-0045', type: 'CONTAMINATION', defect: 'Foreign matter (small stones) detected in sample', severity: 'CRITICAL', rootCause: 'Inadequate cleaning/sorting at supplier', category: 'RAW_MATERIAL', disposition: 'SCRAP', status: 'CLOSED', notifiedAt: '2026-05-15 10:00', responseAt: '2026-05-16 12:00', closedAt: '2026-05-25 16:00', correctiveActions: 3, closureNotes: 'Supplier suspended due to repeated critical NCRs' },
        ],
        summary: {
          total: 4, open: 1, notified: 1, closed: 2, critical: 2, major: 1, minor: 1,
          byType: [
            { type: 'QUALITY_FAILURE', count: 1 },
            { type: 'SPECIFICATION_DEVIATION', count: 1 },
            { type: 'MISLABELING', count: 1 },
            { type: 'CONTAMINATION', count: 1 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Supplier NCRs retrieved')), { headers })
    }

    // GET /api/quality/vendor-scorecard — Vendor performance scorecards
    if (path === '/api/quality/vendor-scorecard' && method === 'GET') {
      const data = {
        scorecards: [
          { code: 'VSC-2026-Q2-001', supplier: 'SUP-001 Sri Balaji Cashews', category: 'DRY_FRUITS', period: 'Q2 2026 (Apr-Jun)', onTime: 96.5, quality: 98.5, acceptance: 98.5, rejection: 1.5, responseHrs: 4.0, complaintRate: 0.0, auditScore: 96.0, priceStability: 98.0, overall: 97.4, rating: 'A_PLUS', deliveries: 12, inspections: 12, ncrs: 0, acceptedQty: 5800, rejectedQty: 90 },
          { code: 'VSC-2026-Q2-002', supplier: 'SUP-002 EID Parry India Ltd', category: 'RAW_MATERIAL', period: 'Q2 2026 (Apr-Jun)', onTime: 98.0, quality: 99.0, acceptance: 99.0, rejection: 1.0, responseHrs: 2.5, complaintRate: 0.0, auditScore: 98.0, priceStability: 100, overall: 99.1, rating: 'A_PLUS', deliveries: 8, inspections: 8, ncrs: 0, acceptedQty: 8000, rejectedQty: 80 },
          { code: 'VSC-2026-Q2-003', supplier: 'SUP-003 Amul Dairy', category: 'MILK_PRODUCTS', period: 'Q2 2026 (Apr-Jun)', onTime: 94.0, quality: 97.8, acceptance: 97.8, rejection: 2.2, responseHrs: 6.0, complaintRate: 0.5, auditScore: 95.0, priceStability: 96.0, overall: 95.5, rating: 'A', deliveries: 15, inspections: 15, ncrs: 1, acceptedQty: 2400, rejectedQty: 54 },
          { code: 'VSC-2026-Q2-004', supplier: 'SUP-004 Goyal Food Spices', category: 'SPICES', period: 'Q2 2026 (Apr-Jun)', onTime: 82.0, quality: 82.5, acceptance: 82.5, rejection: 17.5, responseHrs: 24.0, complaintRate: 2.5, auditScore: 72.0, priceStability: 88.0, overall: 78.2, rating: 'C', deliveries: 6, inspections: 6, ncrs: 3, acceptedQty: 180, rejectedQty: 38 },
          { code: 'VSC-2026-Q2-005', supplier: 'SUP-005 Premium Packaging Co', category: 'PACKAGING', period: 'Q2 2026 (Apr-Jun)', onTime: 92.0, quality: 95.0, acceptance: 95.0, rejection: 5.0, responseHrs: 8.0, complaintRate: 0.0, auditScore: 90.0, priceStability: 94.0, overall: 93.0, rating: 'A', deliveries: 10, inspections: 10, ncrs: 1, acceptedQty: 48000, rejectedQty: 2500 },
          { code: 'VSC-2026-Q2-006', supplier: 'SUP-007 Local Spice Trader', category: 'SPICES', period: 'Q2 2026 (Apr-Jun)', onTime: 75.0, quality: 65.0, acceptance: 65.0, rejection: 35.0, responseHrs: 48.0, complaintRate: 5.0, auditScore: 45.0, priceStability: 80.0, overall: 58.2, rating: 'D', deliveries: 4, inspections: 4, ncrs: 2, acceptedQty: 65, rejectedQty: 35 },
        ],
        summary: {
          totalSuppliers: 6, aPlus: 2, a: 2, b: 0, c: 1, d: 1,
          avgOnTime: 89.6, avgQuality: 89.6, avgAcceptance: 89.6, avgOverall: 86.9,
          totalDeliveries: 55, totalInspections: 55, totalNCRs: 7, totalRejectedValue: 18000,
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Vendor scorecards retrieved')), { headers })
    }

    // GET /api/quality/incoming/info — Sprint 50 info
    if (path === '/api/quality/incoming/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 50, sprintName: 'Enterprise Supplier Quality Management & Incoming Raw Material Inspection', version: '50.0.0', part: 6, tables: 10,
        epics: [
          'Supplier Qualification (6 approval statuses, risk levels, audit frequency, preferred supplier)',
          'Incoming Material Inspection IQC (GRN → Inspection → Pass/Fail → Inventory Decision)',
          'Quality Hold Inventory (3 statuses: Quality Hold / Approved / Rejected - manufacturing gate)',
          'Sampling & Laboratory Testing (6 sampling types, 8 lab tests)',
          'Material Acceptance & Rejection (4 decisions: Full/Partial/Conditional/Rejection)',
          'Supplier NCR (8 NCR types, 3 severity levels, root cause, corrective actions)',
          'Vendor Performance Scorecard (8 metrics, 5 ratings A+/A/B/C/D)',
        ],
        chiefArchitectRecommendation: 'Three inventory statuses: Quality Hold (NOT allowed for manufacturing), Approved (ALLOWED), Rejected/Blocked (NOT allowed). Strict workflow ensures only approved ingredients enter production.',
        supplierCategories: ['RAW_MATERIAL', 'PACKAGING', 'SPICES', 'DRY_FRUITS', 'MILK_PRODUCTS', 'OILS_GHEE', 'CHEMICALS', 'CLEANING', 'LABELS', 'CONSUMABLES'],
        approvalStatuses: ['PENDING', 'QUALIFIED', 'APPROVED', 'CONDITIONAL', 'SUSPENDED', 'BLACKLISTED'],
        inspectionStatuses: ['PENDING', 'SAMPLING', 'IN_INSPECTION', 'PASSED', 'FAILED', 'CONDITIONAL', 'ON_HOLD'],
        inventoryStatuses: ['QUALITY_HOLD', 'UNDER_INSPECTION', 'APPROVED', 'REJECTED', 'CONDITIONAL_RELEASE', 'BLOCKED'],
        ncrTypes: ['QUALITY_FAILURE', 'PACKAGING_DAMAGE', 'SHORTAGE', 'DOCUMENTATION', 'MISLABELING', 'CONTAMINATION', 'EXPIRY', 'SPECIFICATION_DEVIATION'],
        decisions: ['FULL_ACCEPTANCE', 'PARTIAL_ACCEPTANCE', 'CONDITIONAL_ACCEPTANCE', 'FULL_REJECTION'],
        ratings: ['A_PLUS', 'A', 'B', 'C', 'D'],
        endpoints: [
          'GET /api/quality/suppliers',
          'GET /api/quality/incoming',
          'GET /api/quality/hold',
          'GET /api/quality/ncr',
          'GET /api/quality/vendor-scorecard',
          'GET /api/quality/incoming/info',
        ],
        part6Sprint: 2, part6Sprints: 15, totalProjectTables: 454,
      }, 'SUOP Supplier Quality & IQC Engine v50.0.0')), { headers })
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

print(f"Inserted Sprint 50 endpoints. Old: {len(content)}, New: {len(new_content)}")

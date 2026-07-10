#!/usr/bin/env python3
"""Append Sprint 52 backend endpoints to mini-services/suop-backend/index.ts"""

ENDPOINTS = r'''
    // ═════════════════════════════════════════════════════════
    // SPRINT 52 — FINISHED GOODS QUALITY CONTROL (FGQC) & BATCH RELEASE
    // ═════════════════════════════════════════════════════════

    // GET /api/quality/fgqc/dashboard — FGQC Dashboard
    if (path === '/api/quality/fgqc/dashboard' && method === 'GET') {
      const data = {
        kpis: {
          totalInspections: 28, pending: 4, inInspection: 2, passed: 18, failed: 2, conditional: 2, released: 16,
          batchReleases: 20, pendingRelease: 4, releasedToday: 8, blocked: 1,
          certificatesGenerated: 18, certificatesSigned: 16,
          shelfLifeValidations: 24, shelfLifeAlerts: 3,
          packagingCompliance: 24, compliant: 22, nonCompliant: 2,
        },
        inspections: [
          { code: 'FGQC-00028', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', qty: 94, uom: 'KG', mfgDate: '2026-07-09', expiry: '2026-10-07', template: 'ITP-FG-KK-500', checkpoints: 8, passed: 8, failed: 0, grade: 'A', inspector: 'Lakshmi V.', status: 'RELEASED', result: 'PASS' },
          { code: 'FGQC-00027', batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', qty: 98, uom: 'KG', mfgDate: '2026-07-09', expiry: '2026-10-07', template: 'ITP-FG-KK-1KG', checkpoints: 7, passed: 7, failed: 0, grade: 'A', inspector: 'Lakshmi V.', status: 'RELEASED', result: 'PASS' },
          { code: 'FGQC-00026', batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', qty: 95, uom: 'KG', mfgDate: '2026-07-09', expiry: '2026-07-16', template: 'ITP-FG-IB-1KG', checkpoints: 6, passed: 5, failed: 1, grade: 'B', inspector: 'Anil Reddy', status: 'CONDITIONAL_APPROVAL', result: 'CONDITIONAL_PASS', conditionNotes: 'Grinding time deviation - approved for 5-day shelf life only' },
          { code: 'FGQC-00025', batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', qty: 250, uom: 'KG', mfgDate: '2026-07-09', expiry: '2026-10-07', template: 'ITP-FG-NM-500', checkpoints: 7, passed: 5, failed: 2, grade: null, inspector: 'Suresh Mehta', status: 'FAILED', result: 'FAIL', failReason: 'Metal detection CCP failure + burn rate above spec' },
          { code: 'FGQC-00024', batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', qty: 98, uom: 'KG', mfgDate: '2026-07-08', expiry: '2026-08-07', template: 'ITP-FG-ML-1KG', checkpoints: 6, passed: 6, failed: 0, grade: 'A', inspector: 'Lakshmi V.', status: 'PASSED', result: 'PASS' },
        ],
        batchReleases: [
          { code: 'BREL-00020', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', qty: 94, type: 'FULL_RELEASE', releasedQty: 94, qualityApproved: true, qualityApprovedBy: 'Lakshmi V.', warehouseAuthorized: true, warehouseBy: 'Warehouse Head', status: 'RELEASED', inventoryStatus: 'AVAILABLE', wrNumber: 'WR-2026-0148' },
          { code: 'BREL-00019', batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', qty: 98, type: 'FULL_RELEASE', releasedQty: 98, qualityApproved: true, qualityApprovedBy: 'Lakshmi V.', warehouseAuthorized: true, warehouseBy: 'Warehouse Head', status: 'RELEASED', inventoryStatus: 'AVAILABLE', wrNumber: 'WR-2026-0147' },
          { code: 'BREL-00018', batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', qty: 95, type: 'CONDITIONAL_RELEASE', releasedQty: 85, restrictedQty: 10, qualityApproved: true, qualityApprovedBy: 'Lakshmi V.', warehouseAuthorized: true, warehouseBy: 'Warehouse Head', status: 'RELEASED', inventoryStatus: 'AVAILABLE', conditions: ['5-day shelf life only (not 7-day)', 'Internal consumption only - no retail'] },
          { code: 'BREL-00017', batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', qty: 250, type: 'BLOCKED_RELEASE', releasedQty: 0, qualityApproved: false, warehouseAuthorized: false, status: 'BLOCKED', inventoryStatus: 'QUALITY_HOLD', blockReason: 'Metal detection CCP failure + burn rate above spec' },
          { code: 'BREL-00016', batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', qty: 98, type: 'FULL_RELEASE', releasedQty: 98, qualityApproved: true, qualityApprovedBy: 'Lakshmi V.', warehouseAuthorized: false, status: 'QUALITY_APPROVED', inventoryStatus: 'APPROVED', pendingWarehouseAuth: true },
        ],
        certificates: [
          { code: 'QCERT-00018', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', type: 'BATCH_QUALITY_CERTIFICATE', grade: 'A', signed: true, signedBy: 'Lakshmi V.', signedAt: '2026-07-09 11:05', version: 'v1.0', status: 'PUBLISHED' },
          { code: 'QCERT-00017', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', type: 'INSPECTION_REPORT', grade: 'A', signed: true, signedBy: 'Lakshmi V.', signedAt: '2026-07-09 11:00', version: 'v1.0', status: 'PUBLISHED' },
          { code: 'QCERT-00016', batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', type: 'BATCH_QUALITY_CERTIFICATE', grade: 'A', signed: true, signedBy: 'Lakshmi V.', signedAt: '2026-07-09 13:50', version: 'v1.0', status: 'PUBLISHED' },
          { code: 'QCERT-00015', batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', type: 'BATCH_QUALITY_CERTIFICATE', grade: 'A', signed: false, signedBy: null, signedAt: null, version: 'v1.0', status: 'GENERATED' },
        ],
        shelfLifeAlerts: [
          { batch: 'SHW-THN-20260702-000041', product: 'Shwet Idli Batter 1kg', mfgDate: '2026-07-02', expiry: '2026-07-09', remaining: 0, alertLevel: 'EXPIRED', value: 1600 },
          { batch: 'DAH-THN-20260705-000022', product: 'Fresh Curd 1L', mfgDate: '2026-07-05', expiry: '2026-07-12', remaining: 3, alertLevel: 'CRITICAL', value: 1200 },
          { batch: 'PAN-THN-20260628-000018', product: 'Paneer 200g', mfgDate: '2026-06-28', expiry: '2026-07-12', remaining: 3, alertLevel: 'CRITICAL', value: 3375 },
        ],
        packagingCompliance: [
          { batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', box: true, label: true, barcode: true, qr: true, mrp: true, fssai: true, weight: true, ingredients: true, nutrition: true, allergen: true, mfgDate: true, expiryDate: true, overall: 'COMPLIANT', method: 'BARCODE_SCAN', checkedBy: 'Suresh Mehta' },
          { batch: 'NAM-THN-20260709-000021', product: 'Mixed Namkeen 500g', box: true, label: false, barcode: true, qr: true, mrp: true, fssai: true, weight: true, ingredients: true, nutrition: true, allergen: false, mfgDate: true, expiryDate: true, overall: 'NON_COMPLIANT', nonComplianceDetails: 'Label smudged on 12 units; Allergen declaration missing on 5 units', method: 'VISUAL', checkedBy: 'Suresh Mehta' },
        ],
        chiefArchitectRecommendation: 'Three-stage batch release: Quality Hold (inspection pending/failed - warehouse BLOCKED, POS NOT available), Conditional Release (approved with restrictions - warehouse RESTRICTED, POS CONFIGURABLE), Released (all checks passed - warehouse AVAILABLE, POS AVAILABLE). No product reaches customers without formal quality approval.',
      }
      return new Response(JSON.stringify(successResponse(data, 'FGQC dashboard')), { headers })
    }

    // GET /api/quality/fgqc/info — Sprint 52 info
    if (path === '/api/quality/fgqc/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 52, sprintName: 'Finished Goods Quality Control (FGQC), Batch Release & Quality Certification', version: '52.0.0', part: 6, tables: 8,
        epics: [
          'Finished Goods Inspection (7 statuses, 12 inspection parameters)',
          'Final Product Inspection (appearance, color, taste, texture, aroma, weight, packaging, barcode, seal)',
          'Shelf-Life Verification (mfg/expiry/best-before, storage conditions, label verification, alerts)',
          'Packaging Compliance (12 checks: box, label, barcode, QR, MRP, FSSAI, weight, ingredients, nutrition, allergen, dates)',
          'Batch Release Workflow (4 types: Full/Partial/Conditional/Blocked, digital signature, warehouse authorization)',
          'Quality Certification (6 types, PDF generation, digital signature, QR verification)',
          'Warehouse Release Authorization (inventory status update, dispatch allowed)',
          'Quality Dashboard (pending/released/rejected/conditional, trends, KPIs)',
        ],
        chiefArchitectRecommendation: 'Three-stage batch release: Quality Hold (BLOCKED), Conditional Release (RESTRICTED/CONFIGURABLE), Released (AVAILABLE). No product reaches customers without formal quality approval.',
        releaseTypes: ['FULL_RELEASE', 'PARTIAL_RELEASE', 'CONDITIONAL_RELEASE', 'BLOCKED_RELEASE'],
        certificateTypes: ['BATCH_QUALITY_CERTIFICATE', 'RELEASE_CERTIFICATE', 'INSPECTION_REPORT', 'INTERNAL_COA', 'PACKAGING_COMPLIANCE_REPORT', 'QUALITY_SUMMARY'],
        endpoints: [
          'GET /api/quality/fgqc/dashboard',
          'GET /api/quality/fgqc/info',
        ],
        part6Sprint: 4, part6Sprints: 15, totalProjectTables: 473,
      }, 'SUOP FGQC Engine v52.0.0')), { headers })
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

print(f"Inserted Sprint 52 endpoints. Old: {len(content)}, New: {len(new_content)}")

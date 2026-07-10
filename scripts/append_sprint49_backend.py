#!/usr/bin/env python3
"""Append Sprint 49 backend endpoints to mini-services/suop-backend/index.ts"""

ENDPOINTS = r'''
    // ═════════════════════════════════════════════════════════
    // SPRINT 49 — QUALITY FOUNDATION & QUALITY MASTER (PART 6 BEGINS)
    // ═════════════════════════════════════════════════════════

    // GET /api/quality/dashboard — Quality dashboard
    if (path === '/api/quality/dashboard' && method === 'GET') {
      const data = {
        kpis: {
          totalDepartments: 3, totalStandards: 8, activeStandards: 6, totalInspectionTypes: 11,
          totalTemplates: 24, activeTemplates: 20, totalSamplingPlans: 6, totalSpecifications: 18,
          activeSpecifications: 15, totalTestMethods: 14, totalEquipment: 12,
          calibrationDueCount: 2, upcomingAudits: 3, pendingApprovals: 4,
        },
        standards: [
          { code: 'FSSAI-2018', name: 'FSSAI 2018', type: 'FSSAI', version: 'v2.0', effective: '2025-11-15', expiry: '2028-11-14', status: 'ACTIVE' },
          { code: 'HACCP-REV7', name: 'HACCP Rev 7', type: 'HACCP', version: 'v1.0', effective: '2025-09-20', expiry: '2028-09-19', status: 'ACTIVE' },
          { code: 'ISO-22000', name: 'ISO 22000:2018', type: 'ISO_22000', version: 'v2018', effective: '2025-08-10', expiry: '2028-08-09', status: 'ACTIVE' },
          { code: 'BRCGS-I9', name: 'BRCGS Issue 9', type: 'BRCGS', version: 'v9.0', effective: '2025-12-05', expiry: '2026-12-04', status: 'ACTIVE' },
          { code: 'INT-KK-001', name: 'Internal Kaju Katli Spec', type: 'INTERNAL', version: 'v2.3', effective: '2026-01-15', expiry: null, status: 'ACTIVE' },
          { code: 'CUST-BB-001', name: 'Big Bazaar Customer Spec', type: 'CUSTOMER_SPEC', version: 'v1.1', effective: '2025-10-01', expiry: '2026-10-01', status: 'ACTIVE' },
          { code: 'EXP-APEDA', name: 'APEDA Export Standard', type: 'EXPORT', version: 'v2025', effective: '2025-10-30', expiry: '2027-10-29', status: 'ACTIVE' },
          { code: 'FDA-FSMA', name: 'FDA FSMA', type: 'FSSAI', version: 'v1.0', effective: null, expiry: null, status: 'DRAFT' },
        ],
        inspectionTypes: [
          { code: 'IT-VISUAL', name: 'Visual Inspection', category: 'VISUAL', method: 'QUALITATIVE', unit: null },
          { code: 'IT-WEIGHT', name: 'Weight Check', category: 'WEIGHT', method: 'QUANTITATIVE', unit: 'KG' },
          { code: 'IT-TEMP', name: 'Temperature', category: 'TEMPERATURE', method: 'QUANTITATIVE', unit: '°C' },
          { code: 'IT-MOISTURE', name: 'Moisture Content', category: 'MOISTURE', method: 'QUANTITATIVE', unit: '%' },
          { code: 'IT-TASTE', name: 'Taste Test', category: 'TASTE', method: 'QUALITATIVE', unit: null },
          { code: 'IT-COLOR', name: 'Color Check', category: 'COLOR', method: 'QUALITATIVE', unit: null },
          { code: 'IT-TEXTURE', name: 'Texture', category: 'TEXTURE', method: 'QUALITATIVE', unit: null },
          { code: 'IT-PACKAGING', name: 'Packaging Check', category: 'PACKAGING', method: 'QUALITATIVE', unit: null },
          { code: 'IT-METAL', name: 'Metal Detection', category: 'METAL_DETECTION', method: 'QUALITATIVE', unit: null },
          { code: 'IT-MICRO', name: 'Microbiological', category: 'MICROBIOLOGY', method: 'QUANTITATIVE', unit: 'CFU/g' },
          { code: 'IT-CHEMICAL', name: 'Chemical Analysis', category: 'CHEMICAL', method: 'QUANTITATIVE', unit: 'ppm' },
        ],
        samplingPlans: [
          { code: 'SP-FULL', name: '100% Inspection', type: 'FULL_INSPECTION', aql: null, sampleSize: null, acceptance: null, rejection: null },
          { code: 'SP-RANDOM', name: 'Random Sampling 10%', type: 'RANDOM_SAMPLING', aql: null, sampleSize: 10, acceptance: null, rejection: null },
          { code: 'SP-AQL-2.5', name: 'AQL 2.5 General', type: 'AQL_SAMPLING', aql: '2.5', sampleSize: 50, acceptance: 3, rejection: 4 },
          { code: 'SP-AQL-1.0', name: 'AQL 1.0 Critical', type: 'AQL_SAMPLING', aql: '1.0', sampleSize: 80, acceptance: 2, rejection: 3 },
          { code: 'SP-BATCH', name: 'Batch Sampling', type: 'BATCH_SAMPLING', aql: null, sampleSize: 5, acceptance: 0, rejection: 1 },
          { code: 'SP-RISK', name: 'Risk-Based Sampling', type: 'RISK_BASED', aql: null, sampleSize: 15, acceptance: 1, rejection: 2 },
        ],
        departments: [
          { code: 'QD-THN-01', name: 'Thane Quality Department', plant: 'THN', manager: 'Lakshmi V.', scope: 'ALL', lab: 'Central Lab', status: 'ACTIVE' },
          { code: 'QD-THN-02', name: 'Raw Material Lab', plant: 'THN', manager: 'Anil Reddy', scope: 'RAW_MATERIAL', lab: 'RM Lab', status: 'ACTIVE' },
          { code: 'QD-THN-03', name: 'Finished Goods Lab', plant: 'THN', manager: 'Suresh Mehta', scope: 'FINISHED_GOODS', lab: 'FG Lab', status: 'ACTIVE' },
        ],
        calendarUpcoming: [
          { code: 'QCAL-001', type: 'EQUIPMENT_CALIBRATION', title: 'Moisture Meter TE-01 calibration due', date: '2026-07-15', freq: 'QUARTERLY', assigned: 'Anil Reddy', status: 'SCHEDULED' },
          { code: 'QCAL-002', type: 'INTERNAL_AUDIT', title: 'BRCGS internal audit - Q2', date: '2026-07-20', freq: 'QUARTERLY', assigned: 'Lakshmi V.', status: 'SCHEDULED' },
          { code: 'QCAL-003', type: 'CERTIFICATION_RENEWAL', title: 'FSSAI license renewal', date: '2026-08-01', freq: 'ANNUAL', assigned: 'Lakshmi V.', status: 'SCHEDULED' },
          { code: 'QCAL-004', type: 'EQUIPMENT_CALIBRATION', title: 'Metal Detector calibration', date: '2026-07-12', freq: 'MONTHLY', assigned: 'Suresh Mehta', status: 'OVERDUE' },
        ],
        chiefArchitectRecommendation: 'Build a single centralized Quality Master reused across Procurement, Manufacturing, Packaging, Warehouse, and Customer Quality. Product → Approved Quality Specification → Incoming Inspection → In-Process Inspection → Finished Goods Inspection → Warehouse Inspection → Customer Complaint Investigation. One shared specification eliminates conflicting standards between departments.',
      }
      return new Response(JSON.stringify(successResponse(data, 'Quality foundation dashboard')), { headers })
    }

    // GET /api/quality/standards — List quality standards
    if (path === '/api/quality/standards' && method === 'GET') {
      const standards = [
        { code: 'FSSAI-2018', name: 'FSSAI 2018', type: 'FSSAI', version: 'v2.0', effective: '2025-11-15', expiry: '2028-11-14', approvedBy: 'Quality Head', approvedAt: '2025-11-10', status: 'ACTIVE' },
        { code: 'HACCP-REV7', name: 'HACCP Rev 7', type: 'HACCP', version: 'v1.0', effective: '2025-09-20', expiry: '2028-09-19', approvedBy: 'Quality Head', approvedAt: '2025-09-15', status: 'ACTIVE' },
        { code: 'ISO-22000', name: 'ISO 22000:2018', type: 'ISO_22000', version: 'v2018', effective: '2025-08-10', expiry: '2028-08-09', approvedBy: 'Quality Head', approvedAt: '2025-08-05', status: 'ACTIVE' },
        { code: 'BRCGS-I9', name: 'BRCGS Issue 9', type: 'BRCGS', version: 'v9.0', effective: '2025-12-05', expiry: '2026-12-04', approvedBy: 'Quality Head', approvedAt: '2025-12-01', status: 'ACTIVE' },
        { code: 'INT-KK-001', name: 'Internal Kaju Katli Spec', type: 'INTERNAL', version: 'v2.3', effective: '2026-01-15', expiry: null, approvedBy: 'Quality Head', approvedAt: '2026-01-10', status: 'ACTIVE' },
        { code: 'CUST-BB-001', name: 'Big Bazaar Customer Spec', type: 'CUSTOMER_SPEC', version: 'v1.1', effective: '2025-10-01', expiry: '2026-10-01', approvedBy: 'Sales Head', approvedAt: '2025-09-25', status: 'ACTIVE' },
        { code: 'EXP-APEDA', name: 'APEDA Export Standard', type: 'EXPORT', version: 'v2025', effective: '2025-10-30', expiry: '2027-10-29', approvedBy: 'Quality Head', approvedAt: '2025-10-25', status: 'ACTIVE' },
        { code: 'FDA-FSMA', name: 'FDA FSMA', type: 'FSSAI', version: 'v1.0', effective: null, expiry: null, approvedBy: null, approvedAt: null, status: 'DRAFT' },
      ]
      return new Response(JSON.stringify(successResponse(standards, 'Quality standards retrieved')), { headers })
    }

    // GET /api/quality/inspection-templates — List inspection templates
    if (path === '/api/quality/inspection-templates' && method === 'GET') {
      const templates = [
        { code: 'ITP-RAW-CASHEW', name: 'Cashew Raw Material Inspection', type: 'Visual + Moisture', scope: 'RAW_MATERIAL', product: 'Cashew W320', standard: 'FSSAI-2018', sampling: 'SP-AQL-2.5', parameters: 6, status: 'ACTIVE' },
        { code: 'ITP-RAW-SUGAR', name: 'Sugar Raw Material Inspection', type: 'Visual + Purity', scope: 'RAW_MATERIAL', product: 'Sugar S30', standard: 'FSSAI-2018', sampling: 'SP-AQL-2.5', parameters: 4, status: 'ACTIVE' },
        { code: 'ITP-RAW-GHEE', name: 'Ghee Raw Material Inspection', type: 'Visual + Taste + Moisture', scope: 'RAW_MATERIAL', product: 'Cow Ghee', standard: 'FSSAI-2018', sampling: 'SP-RANDOM', parameters: 5, status: 'ACTIVE' },
        { code: 'ITP-IPQC-COOK', name: 'Cooking Stage IPQC', type: 'Temperature + Visual', scope: 'IN_PROCESS', product: 'Kaju Katli', standard: 'INT-KK-001', sampling: 'SP-BATCH', parameters: 4, status: 'ACTIVE' },
        { code: 'ITP-IPQC-FRY', name: 'Frying Stage IPQC', type: 'Temperature + Color + Metal', scope: 'IN_PROCESS', product: 'Mixed Namkeen', standard: 'INT-NM-001', sampling: 'SP-BATCH', parameters: 5, status: 'ACTIVE' },
        { code: 'ITP-FG-KK-500', name: 'Kaju Katli 500g FG Inspection', type: 'Weight + Visual + Packaging + Taste', scope: 'FINISHED_GOODS', product: 'Kaju Katli 500g', standard: 'INT-KK-001', sampling: 'SP-AQL-2.5', parameters: 8, status: 'ACTIVE' },
        { code: 'ITP-FG-NM-500', name: 'Mixed Namkeen 500g FG Inspection', type: 'Weight + Metal + Visual + Packaging', scope: 'FINISHED_GOODS', product: 'Mixed Namkeen 500g', standard: 'INT-NM-001', sampling: 'SP-AQL-1.0', parameters: 7, status: 'ACTIVE' },
        { code: 'ITP-PKG-LABEL', name: 'Packaging Label Inspection', type: 'Visual + Barcode', scope: 'PACKAGING', product: 'All', standard: 'FSSAI-2018', sampling: 'SP-FULL', parameters: 5, status: 'ACTIVE' },
      ]
      return new Response(JSON.stringify(successResponse(templates, 'Inspection templates retrieved')), { headers })
    }

    // GET /api/quality/specifications — List quality specifications
    if (path === '/api/quality/specifications' && method === 'GET') {
      const specs = [
        { code: 'QS-KK-500-V1', name: 'Kaju Katli 500g Spec', product: 'KK-500', standard: 'INT-KK-001', version: 'v2.3', effective: '2026-01-15', approvedBy: 'Quality Head', status: 'ACTIVE', parameters: [{ name: 'Moisture', min: 5, max: 8, target: 6.5, unit: '%', severity: 'MAJOR' }, { name: 'Cashew Content', min: 55, max: 60, target: 58, unit: '%', severity: 'CRITICAL' }, { name: 'Sugar Content', min: 35, max: 40, target: 37, unit: '%', severity: 'MAJOR' }, { name: 'Net Weight', min: 495, max: 505, target: 500, unit: 'G', severity: 'CRITICAL' }] },
        { code: 'QS-KK-1KG-V1', name: 'Kaju Katli 1kg Spec', product: 'KK-1KG', standard: 'INT-KK-001', version: 'v2.3', effective: '2026-01-15', approvedBy: 'Quality Head', status: 'ACTIVE', parameters: [{ name: 'Moisture', min: 5, max: 8, target: 6.5, unit: '%', severity: 'MAJOR' }, { name: 'Net Weight', min: 995, max: 1005, target: 1000, unit: 'G', severity: 'CRITICAL' }] },
        { code: 'QS-IB-1KG-V1', name: 'Shwet Idli Batter 1kg Spec', product: 'IB-1KG', standard: 'INT-IB-001', version: 'v1.5', effective: '2026-02-01', approvedBy: 'Quality Head', status: 'ACTIVE', parameters: [{ name: 'pH', min: 4.0, max: 5.0, target: 4.5, unit: 'pH', severity: 'CRITICAL' }, { name: 'Moisture', min: 70, max: 80, target: 75, unit: '%', severity: 'MAJOR' }] },
        { code: 'QS-NM-500-V1', name: 'Mixed Namkeen 500g Spec', product: 'NM-500', standard: 'INT-NM-001', version: 'v1.1', effective: '2026-03-01', approvedBy: 'Quality Head', status: 'ACTIVE', parameters: [{ name: 'Moisture', min: 2, max: 4, target: 3, unit: '%', severity: 'MAJOR' }, { name: 'Oil FFA', min: 0, max: 0.5, target: 0.3, unit: '%', severity: 'CRITICAL' }, { name: 'Metal Detection', min: null, max: null, target: 'PASS', unit: null, severity: 'CRITICAL' }] },
      ]
      return new Response(JSON.stringify(successResponse(specs, 'Quality specifications retrieved')), { headers })
    }

    // GET /api/quality/sampling-plans — List sampling plans
    if (path === '/api/quality/sampling-plans' && method === 'GET') {
      const plans = [
        { code: 'SP-FULL', name: '100% Inspection', type: 'FULL_INSPECTION', aql: null, sampleSize: '100%', acceptance: null, rejection: 'Any defect', status: 'ACTIVE' },
        { code: 'SP-RANDOM', name: 'Random Sampling 10%', type: 'RANDOM_SAMPLING', aql: null, sampleSize: '10%', acceptance: null, rejection: null, status: 'ACTIVE' },
        { code: 'SP-AQL-2.5', name: 'AQL 2.5 General', type: 'AQL_SAMPLING', aql: '2.5', sampleSize: 50, acceptance: 3, rejection: 4, status: 'ACTIVE' },
        { code: 'SP-AQL-1.0', name: 'AQL 1.0 Critical', type: 'AQL_SAMPLING', aql: '1.0', sampleSize: 80, acceptance: 2, rejection: 3, status: 'ACTIVE' },
        { code: 'SP-BATCH', name: 'Batch Sampling', type: 'BATCH_SAMPLING', aql: null, sampleSize: 5, acceptance: 0, rejection: 1, status: 'ACTIVE' },
        { code: 'SP-RISK', name: 'Risk-Based Sampling', type: 'RISK_BASED', aql: null, sampleSize: 15, acceptance: 1, rejection: 2, status: 'ACTIVE' },
      ]
      return new Response(JSON.stringify(successResponse(plans, 'Sampling plans retrieved')), { headers })
    }

    // GET /api/quality/test-methods — List test methods and equipment
    if (path === '/api/quality/test-methods' && method === 'GET') {
      const data = {
        methods: [
          { code: 'TM-MOISTURE-OVEN', name: 'Moisture - Oven Drying Method', type: 'LABORATORY', duration: 120, standard: 'IS 4333.2', equipment: 2, status: 'ACTIVE' },
          { code: 'TM-WEIGHT-BALANCE', name: 'Weight - Electronic Balance', type: 'INSTRUMENT', duration: 5, standard: 'IS 1234', equipment: 3, status: 'ACTIVE' },
          { code: 'TM-TEMP-DIGITAL', name: 'Temperature - Digital Probe', type: 'DIGITAL', duration: 2, standard: null, equipment: 5, status: 'ACTIVE' },
          { code: 'TM-METAL-DETECTOR', name: 'Metal Detection', type: 'INSTRUMENT', duration: 1, standard: 'HACCP CCP', equipment: 2, status: 'ACTIVE' },
          { code: 'TM-MICRO-TPC', name: 'Total Plate Count', type: 'MICROBIOLOGICAL', duration: 2880, standard: 'IS 5402', equipment: 1, status: 'ACTIVE' },
          { code: 'TM-CHEM-FFA', name: 'Free Fatty Acid', type: 'CHEMICAL_ANALYSIS', duration: 60, standard: 'IS 548', equipment: 1, status: 'ACTIVE' },
          { code: 'TM-VISUAL', name: 'Visual Inspection', type: 'MANUAL', duration: 5, standard: null, equipment: 0, status: 'ACTIVE' },
          { code: 'TM-TASTE', name: 'Taste Test - Panel', type: 'MANUAL', duration: 15, standard: null, equipment: 0, status: 'ACTIVE' },
        ],
        equipment: [
          { code: 'TE-MM-01', name: 'Moisture Meter 01', type: 'MOISTURE_METER', method: 'TM-MOISTURE-OVEN', plant: 'THN', lastCal: '2026-04-15', nextCal: '2026-07-15', status: 'CALIBRATION_DUE' },
          { code: 'TE-BAL-01', name: 'Electronic Balance 01', type: 'BALANCE', method: 'TM-WEIGHT-BALANCE', plant: 'THN', lastCal: '2026-05-20', nextCal: '2026-08-20', status: 'ACTIVE' },
          { code: 'TE-TEMP-01', name: 'Digital Thermometer 01', type: 'THERMOMETER', method: 'TM-TEMP-DIGITAL', plant: 'THN', lastCal: '2026-06-01', nextCal: '2026-09-01', status: 'ACTIVE' },
          { code: 'TE-MD-01', name: 'Metal Detector 01', type: 'METAL_DETECTOR', method: 'TM-METAL-DETECTOR', plant: 'THN', lastCal: '2026-06-12', nextCal: '2026-07-12', status: 'CALIBRATION_DUE' },
          { code: 'TE-MICRO-01', name: 'Microscope 01', type: 'MICROSCOPE', method: 'TM-MICRO-TPC', plant: 'THN', lastCal: '2026-04-10', nextCal: '2026-07-10', status: 'ACTIVE' },
        ],
        summary: { totalMethods: 14, totalEquipment: 12, calibrationDue: 2, avgDuration: 385 },
      }
      return new Response(JSON.stringify(successResponse(data, 'Test methods & equipment')), { headers })
    }

    // GET /api/quality/calendar — Quality calendar
    if (path === '/api/quality/calendar' && method === 'GET') {
      const events = [
        { code: 'QCAL-004', type: 'EQUIPMENT_CALIBRATION', title: 'Metal Detector calibration', date: '2026-07-12', freq: 'MONTHLY', assigned: 'Suresh Mehta', status: 'OVERDUE' },
        { code: 'QCAL-001', type: 'EQUIPMENT_CALIBRATION', title: 'Moisture Meter TE-01 calibration due', date: '2026-07-15', freq: 'QUARTERLY', assigned: 'Anil Reddy', status: 'SCHEDULED' },
        { code: 'QCAL-002', type: 'INTERNAL_AUDIT', title: 'BRCGS internal audit - Q2', date: '2026-07-20', freq: 'QUARTERLY', assigned: 'Lakshmi V.', status: 'SCHEDULED' },
        { code: 'QCAL-005', type: 'ROUTINE_INSPECTION', title: 'Monthly GMP inspection', date: '2026-07-25', freq: 'MONTHLY', assigned: 'Lakshmi V.', status: 'SCHEDULED' },
        { code: 'QCAL-003', type: 'CERTIFICATION_RENEWAL', title: 'FSSAI license renewal', date: '2026-08-01', freq: 'ANNUAL', assigned: 'Lakshmi V.', status: 'SCHEDULED' },
        { code: 'QCAL-006', type: 'TRAINING', title: 'HACCP refresher training', date: '2026-08-05', freq: 'SEMI_ANNUAL', assigned: 'HR + Quality', status: 'SCHEDULED' },
        { code: 'QCAL-007', type: 'REGULATORY_INSPECTION', title: 'FSSAI routine inspection (expected)', date: '2026-08-15', freq: 'ANNUAL', assigned: 'Lakshmi V.', status: 'SCHEDULED' },
        { code: 'QCAL-008', type: 'EQUIPMENT_CALIBRATION', title: 'Balance calibration', date: '2026-08-20', freq: 'QUARTERLY', assigned: 'Anil Reddy', status: 'SCHEDULED' },
      ]
      return new Response(JSON.stringify(successResponse(events, 'Quality calendar')), { headers })
    }

    // GET /api/quality/departments — Quality departments
    if (path === '/api/quality/departments' && method === 'GET') {
      const depts = [
        { code: 'QD-THN-01', name: 'Thane Quality Department', plant: 'THN', manager: 'Lakshmi V.', scope: 'ALL', lab: 'Central Lab', status: 'ACTIVE' },
        { code: 'QD-THN-02', name: 'Raw Material Lab', plant: 'THN', manager: 'Anil Reddy', scope: 'RAW_MATERIAL', lab: 'RM Lab', status: 'ACTIVE' },
        { code: 'QD-THN-03', name: 'Finished Goods Lab', plant: 'THN', manager: 'Suresh Mehta', scope: 'FINISHED_GOODS', lab: 'FG Lab', status: 'ACTIVE' },
      ]
      return new Response(JSON.stringify(successResponse(depts, 'Quality departments')), { headers })
    }

    // GET /api/quality/info — Sprint 49 info
    if (path === '/api/quality/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 49, sprintName: 'Enterprise Quality Foundation & Quality Master Engine', version: '49.0.0', part: 6, tables: 14,
        partName: 'Enterprise Quality Management System (QMS)',
        epics: [
          'Quality Organization Master (departments, locations, roles with permissions)',
          'Quality Standards Master (FSSAI/ISO/HACCP/BRCGS/Internal/Customer/Export, version-controlled)',
          'Inspection Master (11 inspection types, templates, parameters with specs)',
          'Sampling Plans (6 types: Full/Random/AQL/Batch/Risk-Based/Customer-Specific)',
          'Quality Specifications (min/max/target/tolerance/critical, per product)',
          'Test Methods (7 types: Manual/Lab/Instrument/Digital/Rapid/Microbiological/Chemical)',
          'Quality Calendar (calibration, audits, inspections, certifications, training)',
          'Quality Configuration (pass/fail rules, auto-hold, approval levels, e-signatures)',
        ],
        chiefArchitectRecommendation: 'Single centralized Quality Master reused across Procurement, Manufacturing, Packaging, Warehouse, and Customer Quality. Product → Approved Quality Specification → Incoming → In-Process → FG → Warehouse → Customer Complaint. One shared specification eliminates conflicting standards.',
        standardTypes: ['FSSAI', 'ISO_22000', 'HACCP', 'BRCGS', 'INTERNAL', 'CUSTOMER_SPEC', 'EXPORT'],
        inspectionCategories: ['VISUAL', 'WEIGHT', 'TEMPERATURE', 'MOISTURE', 'TASTE', 'COLOR', 'TEXTURE', 'PACKAGING', 'METAL_DETECTION', 'MICROBIOLOGY', 'CHEMICAL'],
        samplingTypes: ['FULL_INSPECTION', 'RANDOM_SAMPLING', 'AQL_SAMPLING', 'BATCH_SAMPLING', 'RISK_BASED', 'CUSTOMER_SPECIFIC'],
        testMethodTypes: ['MANUAL', 'LABORATORY', 'INSTRUMENT', 'DIGITAL', 'RAPID_TEST', 'MICROBIOLOGICAL', 'CHEMICAL_ANALYSIS'],
        calendarEventTypes: ['EQUIPMENT_CALIBRATION', 'INTERNAL_AUDIT', 'ROUTINE_INSPECTION', 'CERTIFICATION_RENEWAL', 'TRAINING', 'REGULATORY_INSPECTION'],
        endpoints: [
          'GET /api/quality/dashboard',
          'GET /api/quality/departments',
          'GET /api/quality/standards',
          'GET /api/quality/inspection-templates',
          'GET /api/quality/specifications',
          'GET /api/quality/sampling-plans',
          'GET /api/quality/test-methods',
          'GET /api/quality/calendar',
          'GET /api/quality/info',
        ],
        part6Sprint: 1, part6Sprints: 15, totalProjectTables: 444,
      }, 'SUOP Quality Foundation Engine v49.0.0 — PART 6 BEGINS')), { headers })
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

print(f"Inserted Sprint 49 endpoints. Old: {len(content)}, New: {len(new_content)}")

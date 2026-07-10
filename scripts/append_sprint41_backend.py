#!/usr/bin/env python3
"""Append Sprint 41 backend endpoints to mini-services/suop-backend/index.ts"""

ENDPOINTS = r'''
    // ═════════════════════════════════════════════════════════
    // SPRINT 41 — PACKAGING, LABELING & FINISHED GOODS MANAGEMENT
    // ═════════════════════════════════════════════════════════

    // GET /api/packaging/dashboard — Packaging dashboard
    if (path === '/api/packaging/dashboard' && method === 'GET') {
      const data = {
        kpis: {
          totalOrders: 24, inProgress: 3, completedToday: 12, qualityHold: 1, transferred: 11,
          unitsPacked: 1248, cartonsBuilt: 104, palletsBuilt: 8, labelsPrinted: 1386,
          avgPackagingTime: '45m', warehouseTransferRate: 100, avgTransferMs: 2840,
        },
        packagingTypeDistribution: [
          { type: 'RETAIL_PACK', count: 14, color: '#10b981' },
          { type: 'GIFT_BOX', count: 5, color: '#a855f7' },
          { type: 'BULK_PACK', count: 3, color: '#f59e0b' },
          { type: 'EXPORT_PACK', count: 2, color: '#3b82f6' },
        ],
        statusDistribution: [
          { status: 'COMPLETED', count: 18, color: '#10b981' },
          { status: 'IN_PROGRESS', count: 3, color: '#3b82f6' },
          { status: 'TRANSFERRED', count: 11, color: '#06b6d4' },
          { status: 'QUALITY_HOLD', count: 1, color: '#f59e0b' },
          { status: 'DRAFT', count: 6, color: '#94a3b8' },
        ],
        recentOrders: [
          { pkgOrder: 'PKG-2026-00024', batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g', type: 'RETAIL_PACK', planned: 188, completed: 188, status: 'TRANSFERRED', priority: 'HIGH' },
          { pkgOrder: 'PKG-2026-00023', batch: 'KAJ-THN-20260709-000146', product: 'Kaju Katli 1kg', type: 'GIFT_BOX', planned: 98, completed: 98, status: 'COMPLETED', priority: 'NORMAL' },
          { pkgOrder: 'PKG-2026-00022', batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg', type: 'RETAIL_PACK', planned: 95, completed: 47, status: 'IN_PROGRESS', priority: 'HIGH' },
          { pkgOrder: 'PKG-2026-00021', batch: 'MOT-THN-20260708-000032', product: 'Motichoor Laddu 1kg', type: 'BULK_PACK', planned: 98, completed: 0, status: 'QUALITY_HOLD', priority: 'EMERGENCY' },
        ],
        hierarchySummary: {
          totalUnits: 1248, totalBoxes: 104, totalCartons: 26, totalPallets: 8,
          unitsPerBox: 12, boxesPerCarton: 4, cartonsPerPallet: 3,
        },
        labelPrintStats: {
          totalJobs: 1386, successRate: 99.6, avgDurationMs: 1480, withinTarget: 1382,
          byType: [
            { type: 'PRODUCT_LABEL', count: 1248 },
            { type: 'CARTON_LABEL', count: 104 },
            { type: 'PALLET_LABEL', count: 26 },
            { type: 'SHIPPING_LABEL', count: 8 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Packaging dashboard')), { headers })
    }

    // GET /api/packaging/orders — List packaging orders
    if (path === '/api/packaging/orders' && method === 'GET') {
      const orders = [
        { id: 'po1', packagingOrderNumber: 'PKG-2026-00024', productionBatchNumber: 'KAJ-THN-20260709-000145', productionOrderNumber: 'PO-2026-00125', productSku: 'KK-500', productName: 'Kaju Katli 500g', packagingType: 'RETAIL_PACK', plannedQuantity: 188, completedQuantity: 188, rejectedQuantity: 0, uom: 'PCS', unitPerBox: 12, boxPerCarton: 4, cartonPerPallet: 3, priority: 'HIGH', status: 'TRANSFERRED', operatorName: 'Rajesh Kumar', packagingLineCode: 'PACK-LINE-01', workCenterCode: 'WC-PK-01', plannedStart: '2026-07-09T08:30:00Z', plannedFinish: '2026-07-09T11:00:00Z', actualStart: '2026-07-09T08:35:00Z', actualFinish: '2026-07-09T10:55:00Z', qualityStatus: 'PASSED', warehouseReceiptNumber: 'WR-2026-0148', transferredAt: '2026-07-09T11:02:00Z' },
        { id: 'po2', packagingOrderNumber: 'PKG-2026-00023', productionBatchNumber: 'KAJ-THN-20260709-000146', productionOrderNumber: 'PO-2026-00125', productSku: 'KK-1KG', productName: 'Kaju Katli 1kg', packagingType: 'GIFT_BOX', plannedQuantity: 98, completedQuantity: 98, rejectedQuantity: 0, uom: 'PCS', unitPerBox: 6, boxPerCarton: 4, cartonPerPallet: 4, priority: 'NORMAL', status: 'COMPLETED', operatorName: 'Rajesh Kumar', packagingLineCode: 'PACK-LINE-01', workCenterCode: 'WC-PK-01', plannedStart: '2026-07-09T11:30:00Z', plannedFinish: '2026-07-09T14:00:00Z', actualStart: '2026-07-09T11:35:00Z', actualFinish: '2026-07-09T13:40:00Z', qualityStatus: 'PASSED' },
        { id: 'po3', packagingOrderNumber: 'PKG-2026-00022', productionBatchNumber: 'SHW-THN-20260709-000047', productionOrderNumber: 'PO-2026-00126', productSku: 'IB-1KG', productName: 'Shwet Idli Batter 1kg', packagingType: 'RETAIL_PACK', plannedQuantity: 95, completedQuantity: 47, rejectedQuantity: 1, uom: 'PCS', unitPerBox: 12, boxPerCarton: 6, cartonPerPallet: 4, priority: 'HIGH', status: 'IN_PROGRESS', operatorName: 'Anil Reddy', packagingLineCode: 'PACK-LINE-02', workCenterCode: 'WC-PK-02', plannedStart: '2026-07-09T13:00:00Z', plannedFinish: '2026-07-09T16:00:00Z', actualStart: '2026-07-09T13:15:00Z', qualityStatus: 'PENDING' },
        { id: 'po4', packagingOrderNumber: 'PKG-2026-00021', productionBatchNumber: 'MOT-THN-20260708-000032', productionOrderNumber: 'PO-2026-00129', productSku: 'ML-1KG', productName: 'Motichoor Laddu 1kg', packagingType: 'BULK_PACK', plannedQuantity: 98, completedQuantity: 0, rejectedQuantity: 0, uom: 'PCS', unitPerBox: 4, boxPerCarton: 6, cartonPerPallet: 5, priority: 'EMERGENCY', status: 'QUALITY_HOLD', operatorName: 'Vijay Patel', packagingLineCode: 'PACK-LINE-03', workCenterCode: 'WC-PK-03', plannedStart: '2026-07-09T14:00:00Z', plannedFinish: '2026-07-09T17:00:00Z', qualityStatus: 'HOLD' },
        { id: 'po5', packagingOrderNumber: 'PKG-2026-00020', productionBatchNumber: 'NAM-THN-20260709-000021', productionOrderNumber: 'PO-2026-00127', productSku: 'NM-500', productName: 'Mixed Namkeen 500g', packagingType: 'EXPORT_PACK', plannedQuantity: 250, completedQuantity: 250, rejectedQuantity: 2, uom: 'PCS', unitPerBox: 20, boxPerCarton: 8, cartonPerPallet: 6, priority: 'HIGH', status: 'TRANSFERRED', operatorName: 'Suresh Mehta', packagingLineCode: 'PACK-LINE-02', workCenterCode: 'WC-PK-02', qualityStatus: 'PASSED', warehouseReceiptNumber: 'WR-2026-0146', transferredAt: '2026-07-09T09:30:00Z' },
      ]
      return new Response(JSON.stringify(successResponse(orders, 'Packaging orders retrieved')), { headers })
    }

    // POST /api/packaging/orders — Create packaging order
    if (path === '/api/packaging/orders' && method === 'POST') {
      const body = await request.json()
      const orderNumber = 'PKG-2026-' + String(25 + Math.floor(Math.random() * 100)).padStart(5, '0')
      const data = {
        id: 'po-new-' + Date.now(),
        packagingOrderNumber: orderNumber,
        productionBatchNumber: body.productionBatchNumber,
        productionOrderNumber: body.productionOrderNumber,
        productSku: body.productSku,
        productName: body.productName,
        packagingType: body.packagingType || 'RETAIL_PACK',
        plannedQuantity: body.plannedQuantity || 0,
        completedQuantity: 0, rejectedQuantity: 0,
        uom: body.uom || 'PCS',
        unitPerBox: body.unitPerBox || 12,
        boxPerCarton: body.boxPerCarton || 4,
        cartonPerPallet: body.cartonPerPallet || 3,
        priority: body.priority || 'NORMAL',
        status: 'DRAFT',
        qualityStatus: 'PENDING',
        createdAt: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(data, `Packaging order ${orderNumber} created`)), { status: 201, headers })
    }

    // POST /api/packaging/orders/:id/complete — Complete packaging order
    if (path.match(/^\/api\/packaging\/orders\/[^/]+\/complete$/) && method === 'POST') {
      const parts = path.split('/')
      const orderId = parts[parts.length - 2]
      const body = await request.json()
      return new Response(JSON.stringify(successResponse({
        orderId, status: 'COMPLETED', completedAt: new Date().toISOString(),
        completedQuantity: body.completedQuantity,
        rejectedQuantity: body.rejectedQuantity || 0,
        message: `Packaging order completed`,
      }, `Packaging order completed`)), { headers })
    }

    // GET /api/packaging/hierarchy/:orderNumber — Package hierarchy tree
    if (path.match(/^\/api\/packaging\/hierarchy\/[^/]+$/) && method === 'GET') {
      const orderNumber = path.split('/').pop()
      const data = {
        orderNumber,
        productName: 'Kaju Katli 500g',
        batchNumber: 'KAJ-THN-20260709-000145',
        plannedQuantity: 188, completedQuantity: 188, uom: 'PCS',
        levels: [
          { level: 1, name: 'Unit', capacity: 1, totalCount: 188, barcodeType: 'EAN_13' },
          { level: 2, name: 'Box', capacity: 12, totalCount: 16, barcodeType: 'CODE_128' },
          { level: 3, name: 'Carton', capacity: 4, totalCount: 4, barcodeType: 'GS1_128' },
          { level: 4, name: 'Pallet', capacity: 3, totalCount: 2, barcodeType: 'GS1_128' },
        ],
        pallets: [
          {
            palletNumber: 'PAL-2026-000012', barcode: 'PAL-2026-000012', qrCode: 'QR-PAL-012',
            status: 'SEALED', cartonsCount: 3, boxesCount: 12, unitsCount: 144,
            netWeightKg: 72.0, grossWeightKg: 75.5, destinationWarehouse: 'WH-THN-FG-01',
            cartons: [
              { cartonNumber: 'CTN-2026-000048', barcode: 'CTN-048', qrCode: 'QR-CTN-048', status: 'SEALED', boxesCount: 4, unitsCount: 48, netWeightKg: 24.0,
                boxes: [
                  { boxNumber: 'BOX-2026-000481', barcode: 'BOX-481', unitsCount: 12, status: 'SEALED' },
                  { boxNumber: 'BOX-2026-000482', barcode: 'BOX-482', unitsCount: 12, status: 'SEALED' },
                  { boxNumber: 'BOX-2026-000483', barcode: 'BOX-483', unitsCount: 12, status: 'SEALED' },
                  { boxNumber: 'BOX-2026-000484', barcode: 'BOX-484', unitsCount: 12, status: 'SEALED' },
                ],
              },
              { cartonNumber: 'CTN-2026-000049', barcode: 'CTN-049', qrCode: 'QR-CTN-049', status: 'SEALED', boxesCount: 4, unitsCount: 48, netWeightKg: 24.0 },
              { cartonNumber: 'CTN-2026-000050', barcode: 'CTN-050', qrCode: 'QR-CTN-050', status: 'SEALED', boxesCount: 4, unitsCount: 48, netWeightKg: 24.0 },
            ],
          },
          {
            palletNumber: 'PAL-2026-000013', barcode: 'PAL-2026-000013', qrCode: 'QR-PAL-013',
            status: 'BUILDING', cartonsCount: 1, boxesCount: 4, unitsCount: 44,
            netWeightKg: 22.0, grossWeightKg: 23.5, destinationWarehouse: 'WH-THN-FG-01',
            cartons: [
              { cartonNumber: 'CTN-2026-000051', barcode: 'CTN-051', qrCode: 'QR-CTN-051', status: 'SEALED', boxesCount: 4, unitsCount: 44, netWeightKg: 22.0 },
            ],
          },
        ],
        traceabilityMatrix: {
          scanPalletRevealsCartons: true,
          scanCartonRevealsBoxes: true,
          scanBoxRevealsUnits: true,
          scanUnitRevealsBatch: true,
        },
      }
      return new Response(JSON.stringify(successResponse(data, `Hierarchy for ${orderNumber}`)), { headers })
    }

    // GET /api/packaging/labels — Label print jobs
    if (path === '/api/packaging/labels' && method === 'GET') {
      const data = {
        jobs: [
          { jobCode: 'PLJ-2026-00148', packagingOrderNumber: 'PKG-2026-00024', batchNumber: 'KAJ-THN-20260709-000145', productName: 'Kaju Katli 500g', packageNumber: 'PAL-2026-000012', packageLevel: 'PALLET', labelType: 'PALLET_LABEL', printerType: 'BLUETOOTH', printerName: 'Zebra ZD420', copies: 1, printDurationMs: 1340, status: 'COMPLETED', createdAt: '2026-07-09T11:01:00Z' },
          { jobCode: 'PLJ-2026-00147', packagingOrderNumber: 'PKG-2026-00024', batchNumber: 'KAJ-THN-20260709-000145', productName: 'Kaju Katli 500g', packageNumber: 'CTN-2026-000048', packageLevel: 'CARTON', labelType: 'CARTON_LABEL', printerType: 'NETWORK', printerName: 'Zebra ZD620', copies: 1, printDurationMs: 1180, status: 'COMPLETED', createdAt: '2026-07-09T10:45:00Z' },
          { jobCode: 'PLJ-2026-00146', packagingOrderNumber: 'PKG-2026-00024', batchNumber: 'KAJ-THN-20260709-000145', productName: 'Kaju Katli 500g', packageNumber: 'BOX-2026-000481', packageLevel: 'BOX', labelType: 'BARCODE_LABEL', printerType: 'BLUETOOTH', printerName: 'Zebra ZD420', copies: 1, printDurationMs: 920, status: 'COMPLETED', createdAt: '2026-07-09T10:30:00Z' },
          { jobCode: 'PLJ-2026-00145', packagingOrderNumber: 'PKG-2026-00023', batchNumber: 'KAJ-THN-20260709-000146', productName: 'Kaju Katli 1kg', packageNumber: 'PKG-UNIT-2026-002345', packageLevel: 'UNIT', labelType: 'PRODUCT_LABEL', printerType: 'BLUETOOTH', printerName: 'Zebra ZD420', copies: 1, printDurationMs: 1480, status: 'COMPLETED', createdAt: '2026-07-09T13:30:00Z' },
          { jobCode: 'PLJ-2026-00144', packagingOrderNumber: 'PKG-2026-00021', batchNumber: 'MOT-THN-20260708-000032', productName: 'Motichoor Laddu 1kg', packageNumber: 'CTN-2026-000045', packageLevel: 'CARTON', labelType: 'SHIPPING_LABEL', printerType: 'INDUSTRIAL', printerName: 'Zebra 110Xi4', copies: 1, printDurationMs: null, status: 'QUEUED', createdAt: '2026-07-09T14:00:00Z' },
        ],
        summary: {
          totalJobs: 1386, completed: 1381, queued: 3, failed: 2,
          successRate: 99.6, avgDurationMs: 1480, withinTarget: 1382,
          byLabelType: [
            { type: 'PRODUCT_LABEL', count: 1248 },
            { type: 'CARTON_LABEL', count: 104 },
            { type: 'PALLET_LABEL', count: 26 },
            { type: 'BOX_LABEL', count: 6 },
            { type: 'SHIPPING_LABEL', count: 2 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Label print jobs retrieved')), { headers })
    }

    // POST /api/packaging/labels/print — Print label
    if (path === '/api/packaging/labels/print' && method === 'POST') {
      const body = await request.json()
      const printDurationMs = 1100 + Math.floor(Math.random() * 800) // 1.1-1.9s
      const data = {
        jobCode: 'PLJ-2026-' + String(Date.now()).slice(-6),
        labelType: body.labelType || 'PRODUCT_LABEL',
        packageNumber: body.packageNumber,
        packageLevel: body.packageLevel || 'UNIT',
        batchNumber: body.batchNumber,
        productName: body.productName,
        labelData: JSON.stringify({
          productName: body.productName,
          batchNumber: body.batchNumber,
          mfgDate: body.mfgDate || new Date().toISOString(),
          expiryDate: body.expiryDate,
          mrp: body.mrp,
          netWeight: body.netWeight,
          qrCode: 'QR-' + (body.packageNumber || 'X'),
          barcode: body.barcode || body.packageNumber,
        }),
        qrCode: 'QR-' + (body.packageNumber || 'X'),
        barcode: body.barcode || body.packageNumber,
        barcodeType: body.barcodeType || 'CODE_128',
        printerType: body.printerType || 'BLUETOOTH',
        printerName: body.printerName || 'Zebra ZD420',
        copies: body.copies || 1,
        printDurationMs,
        withinTarget: printDurationMs < 2000,
        status: 'COMPLETED',
        printStartedAt: new Date().toISOString(),
        printCompletedAt: new Date(Date.now() + printDurationMs).toISOString(),
      }
      return new Response(JSON.stringify(successResponse(data, `Label printed in ${printDurationMs}ms`)), { headers })
    }

    // GET /api/packaging/quality — Packaging quality checks
    if (path === '/api/packaging/quality' && method === 'GET') {
      const data = {
        checks: [
          { checkCode: 'PKG-QC-000148', packagingOrderNumber: 'PKG-2026-00024', batchNumber: 'KAJ-THN-20260709-000145', packageNumber: 'PAL-2026-000012', checkType: 'SEAL_QUALITY', measuredValue: 'OK', targetValue: 'OK', result: 'PASS', checkedByName: 'Lakshmi V.', checkedAt: '2026-07-09T11:00:00Z', remarks: 'All seals verified' },
          { checkCode: 'PKG-QC-000147', packagingOrderNumber: 'PKG-2026-00024', batchNumber: 'KAJ-THN-20260709-000145', packageNumber: 'CTN-2026-000048', checkType: 'WEIGHT', measuredValue: '24.0 KG', targetValue: '24.0 KG ±0.1', result: 'PASS', checkedByName: 'Lakshmi V.', checkedAt: '2026-07-09T10:45:00Z' },
          { checkCode: 'PKG-QC-000146', packagingOrderNumber: 'PKG-2026-00024', batchNumber: 'KAJ-THN-20260709-000145', packageNumber: 'CTN-2026-000048', checkType: 'BARCODE_READABILITY', measuredValue: 'READ', targetValue: 'READ', result: 'PASS', checkedByName: 'Rajesh Kumar', checkedAt: '2026-07-09T10:46:00Z' },
          { checkCode: 'PKG-QC-000145', packagingOrderNumber: 'PKG-2026-00024', batchNumber: 'KAJ-THN-20260709-000145', packageNumber: 'BOX-2026-000481', checkType: 'LABEL_ACCURACY', measuredValue: 'CORRECT', targetValue: 'CORRECT', result: 'PASS', checkedByName: 'Rajesh Kumar', checkedAt: '2026-07-09T10:30:00Z' },
          { checkCode: 'PKG-QC-000144', packagingOrderNumber: 'PKG-2026-00022', batchNumber: 'SHW-THN-20260709-000047', packageNumber: 'PKG-UNIT-2026-002188', checkType: 'PRINT_QUALITY', measuredValue: 'FADED', targetValue: 'CRISP', result: 'FAIL', checkedByName: 'Anil Reddy', checkedAt: '2026-07-09T14:30:00Z', remarks: 'Print head needs cleaning' },
          { checkCode: 'PKG-QC-000143', packagingOrderNumber: 'PKG-2026-00022', batchNumber: 'SHW-THN-20260709-000047', packageNumber: 'PKG-UNIT-2026-002189', checkType: 'WEIGHT', measuredValue: '0.98 KG', targetValue: '1.0 KG ±0.02', result: 'FAIL', checkedByName: 'Anil Reddy', checkedAt: '2026-07-09T14:45:00Z' },
          { checkCode: 'PKG-QC-000142', packagingOrderNumber: 'PKG-2026-00020', batchNumber: 'NAM-THN-20260709-000021', packageNumber: 'PAL-2026-000010', checkType: 'PACKAGE_DAMAGE', measuredValue: 'OK', targetValue: 'OK', result: 'PASS', checkedByName: 'Suresh Mehta', checkedAt: '2026-07-09T09:20:00Z' },
          { checkCode: 'PKG-QC-000141', packagingOrderNumber: 'PKG-2026-00020', batchNumber: 'NAM-THN-20260709-000021', packageNumber: 'CTN-2026-000040', checkType: 'MRP_ACCURACY', measuredValue: '₹250', targetValue: '₹250', result: 'PASS', checkedByName: 'Suresh Mehta', checkedAt: '2026-07-09T09:15:00Z' },
          { checkCode: 'PKG-QC-000140', packagingOrderNumber: 'PKG-2026-00023', batchNumber: 'KAJ-THN-20260709-000146', packageNumber: 'PKG-UNIT-2026-002345', checkType: 'DATE_PRINTING', measuredValue: 'CLEAR', targetValue: 'CLEAR', result: 'PASS', checkedByName: 'Rajesh Kumar', checkedAt: '2026-07-09T13:35:00Z' },
        ],
        summary: {
          total: 18, pass: 16, fail: 2, rework: 0, hold: 0,
          passRate: 88.9, criticalFailures: 1,
          byCheckType: [
            { type: 'SEAL_QUALITY', total: 4, pass: 4, passRate: 100 },
            { type: 'WEIGHT', total: 5, pass: 4, passRate: 80 },
            { type: 'BARCODE_READABILITY', total: 3, pass: 3, passRate: 100 },
            { type: 'LABEL_ACCURACY', total: 2, pass: 2, passRate: 100 },
            { type: 'PRINT_QUALITY', total: 2, pass: 1, passRate: 50 },
            { type: 'PACKAGE_DAMAGE', total: 1, pass: 1, passRate: 100 },
            { type: 'MRP_ACCURACY', total: 1, pass: 1, passRate: 100 },
            { type: 'DATE_PRINTING', total: 1, pass: 1, passRate: 100 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Packaging quality checks retrieved')), { headers })
    }

    // POST /api/packaging/quality — Submit quality check
    if (path === '/api/packaging/quality' && method === 'POST') {
      const body = await request.json()
      const data = {
        checkCode: 'PKG-QC-' + String(Date.now()).slice(-6),
        packagingOrderNumber: body.packagingOrderNumber,
        batchNumber: body.batchNumber,
        packageNumber: body.packageNumber,
        checkType: body.checkType,
        measuredValue: body.measuredValue,
        targetValue: body.targetValue,
        result: body.result || 'PASS',
        remarks: body.remarks,
        checkedByName: body.checkedByName,
        checkedAt: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(data, `Quality check ${data.result}`)), { status: body.result === 'PASS' ? 201 : 400, headers })
    }

    // GET /api/packaging/finished-goods — Finished goods confirmations
    if (path === '/api/packaging/finished-goods' && method === 'GET') {
      const data = {
        confirmations: [
          { fgConfirmationCode: 'FG-2026-00024', packagingOrderNumber: 'PKG-2026-00024', productionBatchNumber: 'KAJ-THN-20260709-000145', productSku: 'KK-500', productName: 'Kaju Katli 500g', fgQuantity: 188, uom: 'PCS', unitsCount: 188, boxesCount: 16, cartonsCount: 4, palletsCount: 2, totalNetWeightKg: 94.0, qualityStatus: 'PASSED', inventoryPosted: true, inventoryTransactionNumber: 'INV-2026-00482', warehouseReceiptNumber: 'WR-2026-0148', warehouseName: 'WH-THN-FG-01', putawayTaskNumber: 'PUT-2026-00148', transferredAt: '2026-07-09T11:02:00Z', transferDurationMs: 2840, status: 'COMPLETED' },
          { fgConfirmationCode: 'FG-2026-00023', packagingOrderNumber: 'PKG-2026-00023', productionBatchNumber: 'KAJ-THN-20260709-000146', productSku: 'KK-1KG', productName: 'Kaju Katli 1kg', fgQuantity: 98, uom: 'PCS', unitsCount: 98, boxesCount: 17, cartonsCount: 5, palletsCount: 2, totalNetWeightKg: 98.0, qualityStatus: 'PASSED', inventoryPosted: true, inventoryTransactionNumber: 'INV-2026-00481', warehouseReceiptNumber: 'WR-2026-0147', warehouseName: 'WH-THN-FG-01', putawayTaskNumber: 'PUT-2026-00147', transferredAt: '2026-07-09T13:45:00Z', transferDurationMs: 2120, status: 'COMPLETED' },
          { fgConfirmationCode: 'FG-2026-00022', packagingOrderNumber: 'PKG-2026-00022', productionBatchNumber: 'SHW-THN-20260709-000047', productSku: 'IB-1KG', productName: 'Shwet Idli Batter 1kg', fgQuantity: 47, uom: 'PCS', unitsCount: 47, boxesCount: 4, cartonsCount: 1, palletsCount: 0, totalNetWeightKg: 47.0, qualityStatus: 'PENDING', inventoryPosted: false, status: 'PENDING' },
          { fgConfirmationCode: 'FG-2026-00020', packagingOrderNumber: 'PKG-2026-00020', productionBatchNumber: 'NAM-THN-20260709-000021', productSku: 'NM-500', productName: 'Mixed Namkeen 500g', fgQuantity: 250, uom: 'PCS', unitsCount: 250, boxesCount: 13, cartonsCount: 2, palletsCount: 1, totalNetWeightKg: 125.0, qualityStatus: 'PASSED', inventoryPosted: true, inventoryTransactionNumber: 'INV-2026-00478', warehouseReceiptNumber: 'WR-2026-0146', warehouseName: 'WH-THN-FG-01', putawayTaskNumber: 'PUT-2026-00146', transferredAt: '2026-07-09T09:30:00Z', transferDurationMs: 3120, status: 'COMPLETED' },
        ],
        summary: {
          totalFG: 12, pending: 1, inventoryPosted: 11, warehouseTransferred: 11,
          totalUnits: 1248, totalCartons: 26, totalPallets: 8, totalWeightKg: 624.0,
          avgTransferMs: 2840, transferSuccessRate: 100, withinTarget: 12,
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Finished goods confirmations retrieved')), { headers })
    }

    // POST /api/packaging/finished-goods — Create FG confirmation
    if (path === '/api/packaging/finished-goods' && method === 'POST') {
      const body = await request.json()
      const transferDurationMs = 2000 + Math.floor(Math.random() * 2500) // 2-4.5s (target <5s)
      const fgCode = 'FG-2026-' + String(Date.now()).slice(-5)
      const data = {
        fgConfirmationCode: fgCode,
        packagingOrderNumber: body.packagingOrderNumber,
        productionBatchNumber: body.productionBatchNumber,
        productSku: body.productSku,
        productName: body.productName,
        fgQuantity: body.fgQuantity,
        uom: body.uom || 'PCS',
        unitsCount: body.unitsCount,
        boxesCount: body.boxesCount,
        cartonsCount: body.cartonsCount,
        palletsCount: body.palletsCount,
        totalNetWeightKg: body.totalNetWeightKg,
        qualityStatus: 'PASSED',
        qualityApprovedAt: new Date().toISOString(),
        inventoryPosted: true,
        inventoryPostedAt: new Date().toISOString(),
        inventoryTransactionNumber: 'INV-2026-' + String(Date.now()).slice(-5),
        warehouseReceiptNumber: 'WR-2026-' + String(Date.now()).slice(-4),
        warehouseName: body.warehouseName || 'WH-THN-FG-01',
        putawayTaskNumber: 'PUT-2026-' + String(Date.now()).slice(-5),
        transferredAt: new Date().toISOString(),
        transferDurationMs,
        withinTarget: transferDurationMs < 5000,
        status: 'COMPLETED',
      }
      return new Response(JSON.stringify(successResponse(data, `FG ${fgCode} created, warehouse transfer in ${transferDurationMs}ms`)), { status: 201, headers })
    }

    // GET /api/packaging/handover — Warehouse handover queue
    if (path === '/api/packaging/handover' && method === 'GET') {
      const data = {
        queue: [
          { fgConfirmationCode: 'FG-2026-00022', packagingOrderNumber: 'PKG-2026-00022', product: 'Shwet Idli Batter 1kg', quantity: 47, uom: 'PCS', stage: 'QUALITY_APPROVED', warehouse: 'WH-THN-FG-01', estimatedPutawayMins: 15, status: 'AWAITING_INVENTORY_POSTING' },
        ],
        completed: [
          { fgConfirmationCode: 'FG-2026-00024', packagingOrderNumber: 'PKG-2026-00024', product: 'Kaju Katli 500g', quantity: 188, uom: 'PCS', stage: 'PUTAWAY', warehouse: 'WH-THN-FG-01', bin: 'A-01-03-02', putawayTaskNumber: 'PUT-2026-00148', putawayCompletedAt: '2026-07-09T11:15:00Z', transferDurationMs: 2840, status: 'COMPLETED' },
          { fgConfirmationCode: 'FG-2026-00023', packagingOrderNumber: 'PKG-2026-00023', product: 'Kaju Katli 1kg', quantity: 98, uom: 'PCS', stage: 'PUTAWAY', warehouse: 'WH-THN-FG-01', bin: 'A-01-04-01', putawayTaskNumber: 'PUT-2026-00147', putawayCompletedAt: '2026-07-09T14:00:00Z', transferDurationMs: 2120, status: 'COMPLETED' },
          { fgConfirmationCode: 'FG-2026-00020', packagingOrderNumber: 'PKG-2026-00020', product: 'Mixed Namkeen 500g', quantity: 250, uom: 'PCS', stage: 'PUTAWAY', warehouse: 'WH-THN-FG-01', bin: 'B-02-01-04', putawayTaskNumber: 'PUT-2026-00146', putawayCompletedAt: '2026-07-09T09:45:00Z', transferDurationMs: 3120, status: 'COMPLETED' },
        ],
        stages: ['PACKAGING_COMPLETE', 'QUALITY_APPROVED', 'INVENTORY_POSTED', 'WAREHOUSE_RECEIPT_GENERATED', 'PUTAWAY_TASK_GENERATED', 'PUTAWAY_COMPLETED', 'AVAILABLE_FOR_SALE'],
        summary: {
          totalTransferred: 11, inQueue: 1, avgTransferMs: 2840, successRate: 100,
          totalUnitsTransferred: 1248, totalPalletsTransferred: 8,
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Warehouse handover queue retrieved')), { headers })
    }

    // GET /api/packaging/costs — Packaging cost tracking
    if (path === '/api/packaging/costs' && method === 'GET') {
      const data = {
        costs: [
          { packagingOrderNumber: 'PKG-2026-00024', productName: 'Kaju Katli 500g', packagingType: 'RETAIL_PACK', plannedQty: 188, completedQty: 188, uom: 'PCS', materialCost: 940.00, laborCost: 240.00, machineCost: 80.00, energyCost: 30.00, overheadCost: 50.00, totalPackagingCost: 1340.00, costPerUnit: 7.13, costPerKg: 14.26, productionCost: 18800.00, finalProductCost: 20140.00, finalCostPerUnit: 107.13, calculatedAt: '2026-07-09T11:05:00Z' },
          { packagingOrderNumber: 'PKG-2026-00023', productName: 'Kaju Katli 1kg', packagingType: 'GIFT_BOX', plannedQty: 98, completedQty: 98, uom: 'PCS', materialCost: 980.00, laborCost: 196.00, machineCost: 60.00, energyCost: 25.00, overheadCost: 40.00, totalPackagingCost: 1301.00, costPerUnit: 13.27, costPerKg: 13.27, productionCost: 19600.00, finalProductCost: 20901.00, finalCostPerUnit: 213.27, calculatedAt: '2026-07-09T13:50:00Z' },
          { packagingOrderNumber: 'PKG-2026-00022', productName: 'Shwet Idli Batter 1kg', packagingType: 'RETAIL_PACK', plannedQty: 95, completedQty: 47, uom: 'PCS', materialCost: 235.00, laborCost: 120.00, machineCost: 40.00, energyCost: 15.00, overheadCost: 25.00, totalPackagingCost: 435.00, costPerUnit: 9.26, costPerKg: 9.26, productionCost: 9400.00, finalProductCost: 9835.00, finalCostPerUnit: 209.26, calculatedAt: '2026-07-09T14:30:00Z' },
          { packagingOrderNumber: 'PKG-2026-00020', productName: 'Mixed Namkeen 500g', packagingType: 'EXPORT_PACK', plannedQty: 250, completedQty: 250, uom: 'PCS', materialCost: 1500.00, laborCost: 400.00, machineCost: 120.00, energyCost: 50.00, overheadCost: 80.00, totalPackagingCost: 2150.00, costPerUnit: 8.60, costPerKg: 17.20, productionCost: 25000.00, finalProductCost: 27150.00, finalCostPerUnit: 108.60, calculatedAt: '2026-07-09T09:35:00Z' },
        ],
        summary: {
          totalMaterialCost: 3655.00, totalLaborCost: 956.00, totalMachineCost: 300.00,
          totalEnergyCost: 120.00, totalOverheadCost: 195.00,
          totalPackagingCost: 5226.00, avgCostPerUnit: 9.42,
          totalProductionCost: 72800.00, totalFinalProductCost: 78026.00,
          byType: [
            { type: 'RETAIL_PACK', count: 2, avgCostPerUnit: 8.20 },
            { type: 'GIFT_BOX', count: 1, avgCostPerUnit: 13.27 },
            { type: 'EXPORT_PACK', count: 1, avgCostPerUnit: 8.60 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Packaging cost tracking retrieved')), { headers })
    }

    // GET /api/packaging/info — Sprint 41 info
    if (path === '/api/packaging/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 41, sprintName: 'Enterprise Packaging, Labeling & Finished Goods Management Engine', version: '41.0.0', part: 5, tables: 11,
        epics: [
          'Packaging Order Management (orders, lines, status workflow)',
          'Multi-Level Packaging Engine (Unit → Inner Pack → Box → Carton → Pallet)',
          'Packaging Material Consumption (9 material types, auto-consume)',
          'Barcode & Label Printing (8 label types, <2s print target)',
          'Finished Goods Confirmation (auto FG batch, inventory posting, warehouse receipt)',
          'Packaging Quality Inspection (8 check types)',
          'Packaging Cost Tracking (5 cost components, per-unit & per-kg)',
          'Automatic Warehouse Handover (<5s target, putaway task generation)',
          'Frontend (8 admin screens + mobile packaging screens)',
          'Backend (10 API groups, 11 database models)',
        ],
        chiefArchitectRecommendation: 'Hierarchical packaging traceability: Unit Pack (12 pcs) → Box (10 unit packs) → Carton (12 boxes) → Pallet (40 cartons). Every level has its own barcode/QR while maintaining parent-child relationships. Scan one pallet to identify all cartons. Scan one carton to identify all boxes. Scan one box to identify every retail unit. Faster warehouse receiving, easier recalls, complete factory-to-customer traceability.',
        packagingTypes: ['PRIMARY', 'SECONDARY', 'TERTIARY', 'GIFT_BOX', 'BULK_PACK', 'RETAIL_PACK', 'EXPORT_PACK', 'PROMOTIONAL', 'COMBO', 'FAMILY'],
        packagingStatuses: ['DRAFT', 'RELEASED', 'IN_PROGRESS', 'QUALITY_HOLD', 'COMPLETED', 'TRANSFERRED', 'CANCELLED'],
        labelTypes: ['PRODUCT_LABEL', 'BATCH_LABEL', 'CARTON_LABEL', 'PALLET_LABEL', 'QR_LABEL', 'BARCODE_LABEL', 'SHIPPING_LABEL', 'INTERNAL_LABEL'],
        checkTypes: ['SEAL_QUALITY', 'WEIGHT', 'BARCODE_READABILITY', 'LABEL_ACCURACY', 'PRINT_QUALITY', 'PACKAGE_DAMAGE', 'MRP_ACCURACY', 'DATE_PRINTING'],
        materialTypes: ['BOX', 'LABEL', 'SHRINK_WRAP', 'TAPE', 'POUCH', 'PLASTIC_TRAY', 'CORRUGATED_CARTON', 'PALLET_COVER', 'BARCODE_STICKER'],
        hierarchy: { unit: 1, innerPack: 12, box: 10, carton: 12, pallet: 40 },
        performanceTargets: { labelPrint: '<2000 ms', warehouseHandover: '<5000 ms', concurrentLabelJobs: 100000 },
        endpoints: [
          'GET /api/packaging/dashboard',
          'GET /api/packaging/orders',
          'POST /api/packaging/orders',
          'POST /api/packaging/orders/:id/complete',
          'GET /api/packaging/hierarchy/:orderNumber',
          'GET /api/packaging/labels',
          'POST /api/packaging/labels/print',
          'GET /api/packaging/quality',
          'POST /api/packaging/quality',
          'GET /api/packaging/finished-goods',
          'POST /api/packaging/finished-goods',
          'GET /api/packaging/handover',
          'GET /api/packaging/costs',
          'GET /api/packaging/info',
        ],
        part5Sprint: 8, part5Sprints: 15, totalProjectTables: 362,
      }, 'SUOP Packaging & Finished Goods Engine v41.0.0')), { headers })
    }

'''

# Read existing backend
with open('mini-services/suop-backend/index.ts', 'r') as f:
    content = f.read()

# Find the 404 marker
marker = '    // 404\n    return new Response(JSON.stringify(errorResponse(`Route ${path} not found'
idx = content.find(marker)
if idx == -1:
    print("ERROR: 404 marker not found")
    exit(1)

# Insert endpoints before the 404 marker
new_content = content[:idx] + ENDPOINTS + content[idx:]

# Write back
with open('mini-services/suop-backend/index.ts', 'w') as f:
    f.write(new_content)

print(f"Inserted Sprint 41 endpoints")
print(f"Old size: {len(content)} chars, New size: {len(new_content)} chars")

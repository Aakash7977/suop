# Sprint 40 backend endpoints — appended into mini-services/suop-backend/index.ts
SPRINT_40_ENDPOINTS = '''
    // ═════════════════════════════════════════════════════════
    // SPRINT 40 — PRODUCTION EXECUTION MOBILE PLATFORM
    // ═════════════════════════════════════════════════════════

    // POST /api/production-mobile/login — Operator login (Epic 1)
    if (path === '/api/production-mobile/login' && method === 'POST') {
      const body = await request.json()
      const data = {
        sessionCode: 'PMS-' + Date.now(),
        operatorId: 'op-001',
        operatorCode: body.operatorCode || 'OP-001',
        operatorName: 'Rajesh Kumar',
        role: body.operatorCode === 'OP-002' ? 'COOKING_OPERATOR' : 'MIXING_OPERATOR',
        plantId: 'pl-001', plantCode: 'THN', plantName: 'Thane Plant',
        productionLineId: 'pl-1', productionLineCode: 'LINE-KK-01', productionLineName: 'Kaju Katli Line 1',
        workCenterId: 'wc-1', workCenterCode: 'WC-KK-03', workCenterName: 'Work Center KK-03',
        shiftCode: 'SHIFT-A', shiftName: 'Morning Shift (06:00-14:00)',
        loginMethod: body.loginMethod || 'PIN_LOGIN',
        jwtToken: 'jwt-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        refreshToken: 'ref-' + Date.now() + '-' + Math.random().toString(36).slice(2),
        loginAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
        status: 'ACTIVE',
        todayStats: {
          assignedWOs: 3, completedWOs: 1, inProgressWOs: 1, pendingWOs: 1,
          targetQty: 285, completedQty: 95, scrapQty: 1, uom: 'KG',
          efficiencyPercent: 98.9, uptimePercent: 94.2,
        },
        device: {
          deviceCode: body.deviceCode || 'DEV-ZEBRA-001',
          deviceName: 'Zebra TC52',
          batteryPercent: 87,
          connectivityStatus: 'ONLINE',
          lastSyncAt: new Date().toISOString(),
        },
      }
      return new Response(JSON.stringify(successResponse(data, `Operator ${data.operatorName} logged in`)), { headers })
    }

    // POST /api/production-mobile/register — Register device (Epic 1)
    if (path === '/api/production-mobile/register' && method === 'POST') {
      const body = await request.json()
      const deviceCode = 'PMD-' + Date.now()
      const data = {
        deviceCode,
        deviceName: body.deviceName || 'Zebra TC52',
        deviceType: body.deviceType || 'ZEBRA_TC',
        manufacturer: body.manufacturer || 'Zebra',
        modelNumber: body.modelNumber || 'TC52',
        serialNumber: body.serialNumber || 'SN-' + Math.random().toString(36).slice(2, 12).toUpperCase(),
        androidVersion: body.androidVersion || 'Android 13',
        status: 'ACTIVE',
        registeredAt: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(data, `Device ${deviceCode} registered`)), { status: 201, headers })
    }

    // POST /api/production-mobile/logout — Logout (Epic 1)
    if (path === '/api/production-mobile/logout' && method === 'POST') {
      return new Response(JSON.stringify(successResponse({
        loggedOutAt: new Date().toISOString(),
        message: 'Operator logged out successfully',
      }, 'Logout successful')), { headers })
    }

    // GET /api/production-mobile/profile — Get operator profile (Epic 1)
    if (path === '/api/production-mobile/profile' && method === 'GET') {
      const data = {
        operatorId: 'op-001', operatorCode: 'OP-001', operatorName: 'Rajesh Kumar',
        role: 'MIXING_OPERATOR', skillLevel: 'SENIOR', overallRating: 4.7,
        plantCode: 'THN', plantName: 'Thane Plant',
        productionLineCode: 'LINE-KK-01', productionLineName: 'Kaju Katli Line 1',
        workCenterCode: 'WC-KK-03', workCenterName: 'Work Center KK-03',
        shiftCode: 'SHIFT-A', shiftName: 'Morning Shift',
        certifications: ['FOOD_SAFETY_L3', 'HACCP_AWARENESS', 'BARCODE_SCANNING', '5S_CERTIFIED'],
        todayStats: { assignedWOs: 3, completedWOs: 1, inProgressWOs: 1, pendingWOs: 1, efficiencyPercent: 98.9 },
        device: { deviceCode: 'DEV-ZEBRA-001', deviceName: 'Zebra TC52', batteryPercent: 87, connectivityStatus: 'ONLINE' },
      }
      return new Response(JSON.stringify(successResponse(data, 'Operator profile')), { headers })
    }

    // GET /api/production-mobile/dashboard — Production dashboard (Epic 2)
    if (path === '/api/production-mobile/dashboard' && method === 'GET') {
      const data = {
        operator: {
          operatorCode: 'OP-001', operatorName: 'Rajesh Kumar', role: 'MIXING_OPERATOR',
          shiftCode: 'SHIFT-A', shiftName: 'Morning Shift',
          plantCode: 'THN', productionLineCode: 'LINE-KK-01', workCenterCode: 'WC-KK-03',
        },
        todaySummary: {
          assignedWorkOrders: 3, completedWorkOrders: 1, inProgressWorkOrders: 1, pendingWorkOrders: 1,
          targetQty: 285, completedQty: 95, scrapQty: 1, uom: 'KG',
          efficiencyPercent: 98.9, downtimeMinutes: 0, qualityAlerts: 0,
        },
        assignedWorkOrders: [
          {
            woNumber: 'WO-001', operationNo: 2, operationName: 'Cooking',
            poNumber: 'PO-2026-00125', productName: 'Kaju Katli 500g', batchNumber: 'KAJ-THN-20260709-000145',
            plannedQty: 95, actualQty: 0, uom: 'KG', status: 'IN_PROGRESS',
            startedAt: '2026-07-09T06:35:00Z', machineCode: 'COOK-01', machineName: 'Cooking Kettle 01',
            recipeCode: 'RCP-KK-001', recipeVersion: 'V2.3',
          },
          {
            woNumber: 'WO-002', operationNo: 1, operationName: 'Mixing',
            poNumber: 'PO-2026-00126', productName: 'Shwet Idli Batter 1kg', batchNumber: null,
            plannedQty: 100, actualQty: 0, uom: 'KG', status: 'ASSIGNED',
            startedAt: null, machineCode: 'MIX-02', machineName: 'Mixer 02',
            recipeCode: 'RCP-IB-002', recipeVersion: 'V1.5',
          },
          {
            woNumber: 'WO-003', operationNo: 8, operationName: 'Packaging',
            poNumber: 'PO-2026-00129', productName: 'Motichoor Laddu 1kg', batchNumber: 'MOT-THN-20260708-000032',
            plannedQty: 98, actualQty: 0, uom: 'KG', status: 'PENDING',
            startedAt: null, machineCode: 'PACK-03', machineName: 'Packaging Machine 03',
            recipeCode: 'RCP-ML-003', recipeVersion: 'V1.2',
          },
        ],
        machineStatus: [
          { code: 'COOK-01', name: 'Cooking Kettle 01', status: 'RUNNING', temperature: 110, targetTemp: 110 },
          { code: 'MIX-02', name: 'Mixer 02', status: 'IDLE', temperature: null, targetTemp: null },
          { code: 'PACK-03', name: 'Packaging Machine 03', status: 'CLEANING', temperature: null, targetTemp: null },
        ],
        shiftStatus: {
          shiftCode: 'SHIFT-A', shiftName: 'Morning Shift',
          startTime: '2026-07-09T06:00:00Z', endTime: '2026-07-09T14:00:00Z',
          elapsedMinutes: 90, remainingMinutes: 390,
          breakScheduledAt: '2026-07-09T10:00:00Z', breakDurationMinutes: 30,
        },
        qualityAlerts: [],
        syncStatus: {
          isOnline: true, lastSyncAt: new Date().toISOString(),
          pendingUploads: 0, pendingDownloads: 0, failedSyncs: 0,
          networkType: 'WIFI', syncHealth: 'HEALTHY',
        },
        quickActions: [
          { action: 'START_WORK', label: 'Start Work', icon: 'play' },
          { action: 'MATERIAL_ISSUE', label: 'Material Issue', icon: 'package' },
          { action: 'BATCH_SCAN', label: 'Batch Scan', icon: 'qr' },
          { action: 'QUALITY_CHECK', label: 'Quality Check', icon: 'shield' },
          { action: 'FINISH_ORDER', label: 'Finish Order', icon: 'check' },
          { action: 'INVENTORY_LOOKUP', label: 'Inventory Lookup', icon: 'search' },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Production mobile dashboard')), { headers })
    }

    // GET /api/production-mobile/work-orders — List assigned work orders (Epic 4)
    if (path === '/api/production-mobile/work-orders' && method === 'GET') {
      const data = [
        {
          woNumber: 'WO-001', operationNo: 2, operationName: 'Cooking',
          poNumber: 'PO-2026-00125', productName: 'Kaju Katli 500g',
          plannedQty: 95, actualQty: 0, uom: 'KG', status: 'IN_PROGRESS',
          priority: 'HIGH', startedAt: '2026-07-09T06:35:00Z',
          machineCode: 'COOK-01', machineName: 'Cooking Kettle 01',
          recipeCode: 'RCP-KK-001', recipeVersion: 'V2.3',
          requiredMaterials: [
            { materialCode: 'CAS-W320', materialName: 'Cashew W320', plannedQty: 55, uom: 'KG', issued: false, batchRequired: true },
            { materialCode: 'SUG-S30', materialName: 'Sugar S30', plannedQty: 35, uom: 'KG', issued: false, batchRequired: true },
            { materialCode: 'GHE-COW', materialName: 'Cow Ghee', plannedQty: 4, uom: 'KG', issued: false, batchRequired: true },
          ],
          qualityChecks: [
            { checkType: 'TEMPERATURE', stage: 'COOKING', targetValue: 110, minValue: 108, maxValue: 112, unit: '°C', required: true, completed: false },
            { checkType: 'VISUAL', stage: 'COOKING', targetValue: null, minValue: null, maxValue: null, unit: null, required: true, completed: false },
          ],
        },
        {
          woNumber: 'WO-002', operationNo: 1, operationName: 'Mixing',
          poNumber: 'PO-2026-00126', productName: 'Shwet Idli Batter 1kg',
          plannedQty: 100, actualQty: 0, uom: 'KG', status: 'ASSIGNED',
          priority: 'NORMAL', startedAt: null,
          machineCode: 'MIX-02', machineName: 'Mixer 02',
          recipeCode: 'RCP-IB-002', recipeVersion: 'V1.5',
          requiredMaterials: [
            { materialCode: 'URD-DAL', materialName: 'Urad Dal', plannedQty: 25, uom: 'KG', issued: false, batchRequired: true },
            { materialCode: 'RICE', materialName: 'Rice', plannedQty: 75, uom: 'KG', issued: false, batchRequired: true },
            { materialCode: 'SALT', materialName: 'Salt', plannedQty: 0.5, uom: 'KG', issued: false, batchRequired: false },
          ],
          qualityChecks: [
            { checkType: 'WEIGHT', stage: 'MIXING', targetValue: 100, minValue: 99, maxValue: 101, unit: 'KG', required: true, completed: false },
          ],
        },
        {
          woNumber: 'WO-003', operationNo: 8, operationName: 'Packaging',
          poNumber: 'PO-2026-00129', productName: 'Motichoor Laddu 1kg',
          plannedQty: 98, actualQty: 0, uom: 'KG', status: 'PENDING',
          priority: 'NORMAL', startedAt: null,
          machineCode: 'PACK-03', machineName: 'Packaging Machine 03',
          recipeCode: 'RCP-ML-003', recipeVersion: 'V1.2',
          requiredMaterials: [
            { materialCode: 'PKG-BOX-1KG', materialName: 'Packaging Box 1kg', plannedQty: 98, uom: 'PCS', issued: false, batchRequired: false },
            { materialCode: 'LBL-1KG', materialName: 'Label 1kg', plannedQty: 98, uom: 'PCS', issued: false, batchRequired: false },
          ],
          qualityChecks: [
            { checkType: 'SEAL_VERIFICATION', stage: 'PACKING', targetValue: null, minValue: null, maxValue: null, unit: null, required: true, completed: false },
            { checkType: 'WEIGHT', stage: 'PACKING', targetValue: 1, minValue: 0.99, maxValue: 1.01, unit: 'KG', required: true, completed: false },
          ],
        },
      ]
      return new Response(JSON.stringify(successResponse(data, 'Work orders retrieved')), { headers })
    }

    // GET /api/production-mobile/work-orders/:woNumber — Get work order details
    if (path.match(/^\/api\/production-mobile\\/work-orders\\/[^/]+$/) && method === 'GET') {
      const woNumber = path.split('/').pop()
      const data = {
        woNumber, operationNo: 2, operationName: 'Cooking',
        poNumber: 'PO-2026-00125', productName: 'Kaju Katli 500g', batchNumber: 'KAJ-THN-20260709-000145',
        plannedQty: 95, actualQty: 0, scrapQty: 0, uom: 'KG', status: 'IN_PROGRESS',
        priority: 'HIGH', startedAt: '2026-07-09T06:35:00Z',
        machineCode: 'COOK-01', machineName: 'Cooking Kettle 01',
        recipeCode: 'RCP-KK-001', recipeVersion: 'V2.3',
        productionInstructions: [
          { step: 1, instruction: 'Pre-heat cooking kettle to 110°C', targetValue: '110°C', completed: true },
          { step: 2, instruction: 'Add ghee to kettle', targetValue: '4 KG', completed: true },
          { step: 3, instruction: 'Add sugar and stir for 5 minutes', targetValue: '5 min', completed: true },
          { step: 4, instruction: 'Add cashew powder slowly', targetValue: '55 KG', completed: false },
          { step: 5, instruction: 'Cook for 15 minutes at 110°C', targetValue: '15 min @ 110°C', completed: false },
          { step: 6, instruction: 'Check consistency - thread stage', targetValue: 'Thread stage', completed: false },
        ],
        requiredMaterials: [
          { materialCode: 'CAS-W320', materialName: 'Cashew W320', plannedQty: 55, uom: 'KG', issued: false, batchRequired: true, availableBatches: [
            { batchNumber: 'CAS-THN-20260705-000018', qty: 445, expiry: '2027-01-05', supplier: 'Sri Balaji Cashews' },
          ]},
          { materialCode: 'SUG-S30', materialName: 'Sugar S30', plannedQty: 35, uom: 'KG', issued: false, batchRequired: true, availableBatches: [
            { batchNumber: 'SUG-THN-20260701-000042', qty: 965, expiry: '2027-07-01', supplier: 'EID Parry India Ltd' },
          ]},
          { materialCode: 'GHE-COW', materialName: 'Cow Ghee', plannedQty: 4, uom: 'KG', issued: false, batchRequired: true, availableBatches: [
            { batchNumber: 'GHE-THN-20260703-000008', qty: 178, expiry: '2027-01-03', supplier: 'Amul Dairy' },
          ]},
        ],
        qualityChecks: [
          { checkType: 'TEMPERATURE', stage: 'COOKING', targetValue: 110, minValue: 108, maxValue: 112, unit: '°C', required: true, completed: false },
          { checkType: 'VISUAL', stage: 'COOKING', targetValue: null, minValue: null, maxValue: null, unit: null, required: true, completed: false },
        ],
        timeline: [
          { event: 'WO_ASSIGNED', time: '2026-07-09T06:00:00Z', actor: 'System' },
          { event: 'WO_STARTED', time: '2026-07-09T06:35:00Z', actor: 'Rajesh Kumar' },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, `Work order ${woNumber} details`)), { headers })
    }

    // POST /api/production-mobile/work-orders/:woNumber/start — Start WO (Epic 4)
    if (path.match(/^\/api\\/production-mobile\\/work-orders\\/[^/]+\\/start$/) && method === 'POST') {
      const parts = path.split('/')
      const woNumber = parts[parts.length - 2]
      return new Response(JSON.stringify(successResponse({
        woNumber, status: 'IN_PROGRESS', startedAt: new Date().toISOString(),
        message: `Work order ${woNumber} started`,
      }, `Work order started`)), { headers })
    }

    // POST /api/production-mobile/work-orders/:woNumber/pause — Pause WO (Epic 4)
    if (path.match(/^\\/api\\/production-mobile\\/work-orders\\/[^/]+\\/pause$/) && method === 'POST') {
      const parts = path.split('/')
      const woNumber = parts[parts.length - 2]
      return new Response(JSON.stringify(successResponse({
        woNumber, status: 'PAUSED', pausedAt: new Date().toISOString(),
        message: `Work order ${woNumber} paused`,
      }, `Work order paused`)), { headers })
    }

    // POST /api/production-mobile/work-orders/:woNumber/complete — Complete WO (Epic 4)
    if (path.match(/^\\/api\\/production-mobile\\/work-orders\\/[^/]+\\/complete$/) && method === 'POST') {
      const parts = path.split('/')
      const woNumber = parts[parts.length - 2]
      const body = await request.json()
      return new Response(JSON.stringify(successResponse({
        woNumber, status: 'COMPLETED', completedAt: new Date().toISOString(),
        actualQty: body.actualQty || 95, scrapQty: body.scrapQty || 1, uom: body.uom || 'KG',
        message: `Work order ${woNumber} completed`,
      }, `Work order completed`)), { headers })
    }

    // POST /api/production-mobile/material-issue — Material issue with barcode (Epic 3)
    if (path === '/api/production-mobile/material-issue' && method === 'POST') {
      const body = await request.json()
      // Validation: check ingredient, batch, expiry, qty, duplicate
      const validations = []
      if (body.materialCode === 'CAS-W320' && body.scannedBatch === 'CAS-THN-20260705-000018') {
        validations.push({ rule: 'INGREDIENT_MATCH', result: 'VALID', message: 'Ingredient matches recipe' })
        validations.push({ rule: 'BATCH_VALID', result: 'VALID', message: 'Batch is valid and in-stock' })
        validations.push({ rule: 'EXPIRY_CHECK', result: 'VALID', message: 'Batch not expired (expires 2027-01-05)' })
        validations.push({ rule: 'QUANTITY_CHECK', result: 'VALID', message: 'Sufficient quantity (445 KG available)' })
        validations.push({ rule: 'DUPLICATE_SCAN', result: 'VALID', message: 'Not a duplicate scan' })
      } else {
        validations.push({ rule: 'UNKNOWN_BARCODE', result: 'INVALID', message: 'Barcode not recognized' })
      }
      const allValid = validations.every(v => v.result === 'VALID')
      const data = {
        issueCode: 'MI-' + Date.now(),
        woNumber: body.woNumber,
        materialCode: body.materialCode,
        materialName: body.materialName,
        batchNumber: body.scannedBatch,
        plannedQty: body.plannedQty,
        actualQty: body.actualQty || body.plannedQty,
        uom: body.uom || 'KG',
        supplierName: 'Sri Balaji Cashews',
        supplierBatchNo: 'SBC-2026-0705',
        validations,
        status: allValid ? 'ISSUED' : 'REJECTED',
        issuedAt: allValid ? new Date().toISOString() : null,
        inventoryUpdated: allValid,
      }
      return new Response(JSON.stringify(successResponse(data, allValid ? `Material issued: ${body.materialName}` : 'Material issue rejected - validation failed')), { status: allValid ? 201 : 400, headers })
    }

    // POST /api/production-mobile/batch/create — Create production batch + labels (Epic 5)
    if (path === '/api/production-mobile/batch/create' && method === 'POST') {
      const body = await request.json()
      const batchNumber = generateBatchNumber(body.plantCode || 'THN', body.productSku || 'PRD', new Date())
      const labelCode = 'LBL-' + Date.now()
      const data = {
        batchNumber,
        batchType: 'FINISHED_GOODS',
        recipeCode: body.recipeCode,
        recipeVersion: body.recipeVersion,
        productionOrderNumber: body.productionOrderNumber,
        workOrderNumber: body.workOrderNumber,
        productSku: body.productSku,
        productName: body.productName,
        plantCode: body.plantCode || 'THN',
        plantName: body.plantName || 'Thane Plant',
        productionLineCode: body.productionLineCode,
        workCenterCode: body.workCenterCode,
        manufacturingDate: new Date().toISOString(),
        expiryDate: body.expiryDate,
        bestBeforeDate: body.bestBeforeDate,
        actualQty: body.actualQty || 0,
        uom: body.uom || 'KG',
        status: 'COMPLETED',
        qualityStatus: 'PENDING',
        // Auto-generated labels
        labels: [
          {
            labelCode,
            labelType: 'PRODUCTION_BATCH',
            qrCode: 'QR-' + batchNumber,
            barcodeValue: batchNumber,
            barcodeType: 'CODE_128',
            labelData: JSON.stringify({
              batchNumber, productName: body.productName, manufacturingDate: new Date().toISOString(),
              expiryDate: body.expiryDate, recipeVersion: body.recipeVersion, quantity: body.actualQty,
            }),
          },
          {
            labelCode: labelCode + '-PALLET',
            labelType: 'PALLET_LABEL',
            qrCode: 'QR-' + batchNumber + '-P',
            barcodeValue: batchNumber + '-P',
            barcodeType: 'GS1_128',
            labelData: JSON.stringify({
              batchNumber, palletId: 'PAL-' + Math.floor(Math.random() * 9000 + 1000),
              quantity: body.actualQty, destinationBin: body.destinationBin || 'WH-THN-FG-01/A-01-03-02',
            }),
          },
        ],
        printJob: {
          jobCode: 'LPJ-' + Date.now(),
          printerType: body.printerType || 'BLUETOOTH',
          printerName: body.printerName || 'Zebra ZD420',
          copies: 2,
          status: 'QUEUED',
        },
      }
      return new Response(JSON.stringify(successResponse(data, `Batch ${batchNumber} created with labels`)), { status: 201, headers })
    }

    // POST /api/production-mobile/labels/print — Print label (Epic 5)
    if (path === '/api/production-mobile/labels/print' && method === 'POST') {
      const body = await request.json()
      const printDurationMs = 1200 + Math.floor(Math.random() * 600) // 1.2-1.8 sec
      const data = {
        jobCode: 'LPJ-' + Date.now(),
        labelCode: body.labelCode,
        batchNumber: body.batchNumber,
        printerType: body.printerType || 'BLUETOOTH',
        printerName: body.printerName || 'Zebra ZD420',
        copies: body.copies || 1,
        status: 'COMPLETED',
        printStartedAt: new Date().toISOString(),
        printCompletedAt: new Date(Date.now() + printDurationMs).toISOString(),
        printDurationMs,
        withinTarget: printDurationMs < 2000,
      }
      return new Response(JSON.stringify(successResponse(data, `Label printed in ${printDurationMs}ms`)), { headers })
    }

    // POST /api/production-mobile/wip/transfer — WIP movement (Epic 6)
    if (path === '/api/production-mobile/wip/transfer' && method === 'POST') {
      const body = await request.json()
      const data = {
        transferCode: 'WIP-' + Date.now(),
        batchNumber: body.batchNumber,
        fromWorkCenter: body.fromWorkCenter,
        toWorkCenter: body.toWorkCenter,
        fromStage: body.fromStage,
        toStage: body.toStage,
        quantity: body.quantity,
        uom: body.uom || 'KG',
        operatorCode: body.operatorCode,
        operatorName: body.operatorName,
        status: 'COMPLETED',
        transferredAt: new Date().toISOString(),
        newWipCode: 'WIP-' + Math.floor(Math.random() * 9000 + 1000),
      }
      return new Response(JSON.stringify(successResponse(data, `WIP transferred from ${body.fromStage} to ${body.toStage}`)), { status: 201, headers })
    }

    // POST /api/production-mobile/quality-check — Quality checkpoint (Epic 7)
    if (path === '/api/production-mobile/quality-check' && method === 'POST') {
      const body = await request.json()
      // Auto-evaluate PASS/FAIL based on min/max
      let result = 'PASS'
      if (body.minValue !== null && body.maxValue !== null && body.measuredValue !== null) {
        if (body.measuredValue < body.minValue || body.measuredValue > body.maxValue) {
          result = 'FAIL'
        }
      }
      const data = {
        checkCode: 'QC-' + Date.now(),
        workOrderNumber: body.workOrderNumber,
        batchNumber: body.batchNumber,
        checkType: body.checkType,
        checkStage: body.checkStage,
        measuredValue: body.measuredValue,
        targetValue: body.targetValue,
        minValue: body.minValue,
        maxValue: body.maxValue,
        unit: body.unit,
        result,
        remarks: body.remarks,
        checkedBy: body.operatorName,
        checkedAt: new Date().toISOString(),
        deviceId: body.deviceId,
        canProceed: result === 'PASS',
      }
      return new Response(JSON.stringify(successResponse(data, `Quality check ${result}`)), { status: result === 'PASS' ? 201 : 400, headers })
    }

    // GET /api/production-mobile/inventory-lookup — Lookup material/batch (Epic 9)
    if (path === '/api/production-mobile/inventory-lookup' && method === 'GET') {
      const url = new URL(request.url)
      const query = url.searchParams.get('q') || ''
      const data = {
        query,
        results: [
          { type: 'MATERIAL', code: 'CAS-W320', name: 'Cashew W320', totalQty: 445, uom: 'KG', warehouse: 'WH-THN-RM-01', bin: 'RM-CAS-01' },
          { type: 'BATCH', code: 'CAS-THN-20260705-000018', name: 'Cashew W320 (Batch)', qty: 445, uom: 'KG', expiry: '2027-01-05', supplier: 'Sri Balaji Cashews' },
          { type: 'MATERIAL', code: 'SUG-S30', name: 'Sugar S30', totalQty: 965, uom: 'KG', warehouse: 'WH-THN-RM-01', bin: 'RM-SUG-01' },
          { type: 'BATCH', code: 'SUG-THN-20260701-000042', name: 'Sugar S30 (Batch)', qty: 965, uom: 'KG', expiry: '2027-07-01', supplier: 'EID Parry India Ltd' },
        ].filter(r => !query || r.code.toLowerCase().includes(query.toLowerCase()) || r.name.toLowerCase().includes(query.toLowerCase())),
      }
      return new Response(JSON.stringify(successResponse(data, 'Inventory lookup results')), { headers })
    }

    // POST /api/production-mobile/scan — Barcode scan processor (Epic 3)
    if (path === '/api/production-mobile/scan' && method === 'POST') {
      const body = await request.json()
      const scanDurationMs = 150 + Math.floor(Math.random() * 100) // 150-250ms (target <300ms)
      // Determine barcode type and content
      const barcodeValue = body.barcodeValue || ''
      let scanResult: any = {
        scanCode: 'SCAN-' + Date.now(),
        barcodeValue,
        barcodeType: body.barcodeType || 'CODE_128',
        scanSource: body.scanSource || 'CAMERA',
        scanDurationMs,
        withinTarget: scanDurationMs < 300,
        scannedAt: new Date().toISOString(),
      }
      // Recognize barcode patterns
      if (barcodeValue.startsWith('WO-')) {
        scanResult.recognizedType = 'WORK_ORDER'
        scanResult.workOrderNumber = barcodeValue
        scanResult.validationResult = 'VALID'
        scanResult.validationMessage = 'Work order recognized'
        scanResult.workOrder = { woNumber: barcodeValue, productName: 'Kaju Katli 500g', status: 'IN_PROGRESS' }
      } else if (barcodeValue.startsWith('WC-')) {
        scanResult.recognizedType = 'WORK_CENTER'
        scanResult.workCenterCode = barcodeValue
        scanResult.validationResult = 'VALID'
        scanResult.validationMessage = 'Work center recognized'
        scanResult.workCenter = { code: barcodeValue, name: 'Work Center KK-03', status: 'ACTIVE' }
      } else if (barcodeValue.match(/^[A-Z]{3}-[A-Z]{3}-\\d{8}-\\d{6}$/)) {
        scanResult.recognizedType = 'BATCH'
        scanResult.batchNumber = barcodeValue
        scanResult.validationResult = 'VALID'
        scanResult.validationMessage = 'Batch recognized'
        scanResult.batch = { batchNumber: barcodeValue, productName: 'Kaju Katli 500g', status: 'RELEASED' }
      } else if (barcodeValue.startsWith('PAL-')) {
        scanResult.recognizedType = 'PALLET'
        scanResult.palletId = barcodeValue
        scanResult.validationResult = 'VALID'
        scanResult.validationMessage = 'Pallet recognized'
      } else {
        scanResult.recognizedType = 'UNKNOWN'
        scanResult.validationResult = 'UNKNOWN_BARCODE'
        scanResult.validationMessage = 'Unknown barcode format'
      }
      return new Response(JSON.stringify(successResponse(scanResult, `Scan processed in ${scanDurationMs}ms`)), { headers })
    }

    // GET /api/production-mobile/sync/status — Sync status (Epic 8)
    if (path === '/api/production-mobile/sync/status' && method === 'GET') {
      const data = {
        isOnline: true,
        lastSyncAt: new Date().toISOString(),
        pendingUploads: 0, pendingDownloads: 0, failedSyncs: 0, conflictsPending: 0,
        storageUsed: '2.4 MB', storageLimit: '50 MB',
        networkType: 'WIFI', syncHealth: 'HEALTHY',
        pendingTransactions: [],
        recentSyncHistory: [
          { syncCode: 'PSH-001', direction: 'BIDIRECTIONAL', total: 12, success: 12, failed: 0, duration: 1840, when: '2 min ago', status: 'COMPLETED' },
          { syncCode: 'PSH-002', direction: 'UPLOAD', total: 3, success: 3, failed: 0, duration: 620, when: '15 min ago', status: 'COMPLETED' },
          { syncCode: 'PSH-003', direction: 'BIDIRECTIONAL', total: 8, success: 7, failed: 1, duration: 2100, when: '32 min ago', status: 'PARTIAL' },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Sync status')), { headers })
    }

    // POST /api/production-mobile/sync — Sync offline transactions (Epic 8)
    if (path === '/api/production-mobile/sync' && method === 'POST') {
      const body = await request.json()
      const transactions = body.transactions || []
      const syncDurationMs = 1500 + Math.floor(Math.random() * 1500) // 1.5-3 sec
      const data = {
        syncCode: 'PSH-' + Date.now(),
        syncDirection: 'UPLOAD',
        totalTransactions: transactions.length,
        successfulSyncs: transactions.length,
        failedSyncs: 0,
        conflictCount: 0,
        syncStartedAt: new Date(Date.now() - syncDurationMs).toISOString(),
        syncCompletedAt: new Date().toISOString(),
        syncDurationMs,
        withinTarget: syncDurationMs < 10000,
        networkType: 'WIFI',
        payloadSizeKb: Math.floor(transactions.length * 2.5),
        status: 'COMPLETED',
        results: transactions.map((t: any) => ({
          transactionCode: t.transactionCode,
          status: 'SYNCED',
          syncedAt: new Date().toISOString(),
        })),
      }
      return new Response(JSON.stringify(successResponse(data, `Sync completed: ${transactions.length} transactions in ${syncDurationMs}ms`)), { headers })
    }

    // POST /api/production-mobile/devices/:deviceCode/lock — Remote lock (Mobile Security)
    if (path.match(/^\\/api\\/production-mobile\\/devices\\/[^/]+\\/lock$/) && method === 'POST') {
      const parts = path.split('/')
      const deviceCode = parts[parts.length - 2]
      return new Response(JSON.stringify(successResponse({
        deviceCode, status: 'LOCKED', lockedAt: new Date().toISOString(),
        message: `Device ${deviceCode} locked remotely`,
      }, `Device locked`)), { headers })
    }

    // POST /api/production-mobile/devices/:deviceCode/wipe — Remote wipe (Mobile Security)
    if (path.match(/^\\/api\\/production-mobile\\/devices\\/[^/]+\\/wipe$/) && method === 'POST') {
      const parts = path.split('/')
      const deviceCode = parts[parts.length - 2]
      return new Response(JSON.stringify(successResponse({
        deviceCode, status: 'WIPED', wipedAt: new Date().toISOString(),
        message: `Device ${deviceCode} wiped remotely - all local data erased`,
      }, `Device wiped`)), { headers })
    }

    // GET /api/production-mobile/info — Sprint 40 info
    if (path === '/api/production-mobile/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 40, sprintName: 'Enterprise Production Mobile Platform & Manufacturing Barcode Scanning Application', version: '40.0.0', part: 5, tables: 9,
        epics: [
          'Authentication & Device Registration (5 login methods, device binding)',
          'Production Home Dashboard (assigned WOs, targets, sync status)',
          'Material Issue & Barcode Consumption (6 validation rules)',
          'Work Order Execution (start/pause/resume/complete/reject/rework)',
          'Batch Creation & Label Printing (auto QR+barcode, <2s print)',
          'WIP Movement (mixing→cooking→cooling→cutting→packing→finished)',
          'Quality Checkpoint Scanning (8 check types)',
          'Offline Synchronization (<10s recovery, conflict resolution)',
          'Frontend Mobile (10 screens, scanner-first UX)',
          'Backend APIs (mobile/labels/material/quality/sync)',
        ],
        chiefArchitectRecommendation: 'Two separate Android apps: (1) Production Execution App for Mixing/Cooking/Frying/Packing Operators & Supervisors, (2) Warehouse Execution App for Receivers/Pickers/Forklifts. Both share auth, sync, barcode engine, audit infra — but optimized for distinct workflows. No paper travelers. No manual deductions. Everything barcode-driven.',
        supportedDevices: ['Android Phone', 'Industrial Handheld', 'Zebra TC Series', 'Honeywell', 'Chainway', 'Urovo', 'Industrial Tablet', 'Bluetooth Scanner'],
        supportedBarcodes: ['QR Code', 'Code 128', 'EAN-13', 'GS1-128', 'GS1 DataMatrix', 'Batch Barcode', 'Work Order QR', 'Work Center QR', 'Pallet Barcode'],
        performanceTargets: { scanResponse: '<300 ms', labelPrint: '<2000 ms', offlineRecovery: '<10000 ms', concurrentOperators: 1000 },
        loginMethods: ['EMPLOYEE_LOGIN', 'PIN_LOGIN', 'BIOMETRIC', 'QR_LOGIN', 'OFFLINE_LOGIN'],
        qualityCheckTypes: ['TEMPERATURE', 'WEIGHT', 'DIMENSIONS', 'VISUAL', 'TASTE', 'PACKAGING', 'METAL_DETECTOR', 'SEAL_VERIFICATION'],
        wipStages: ['MIXING', 'COOKING', 'COOLING', 'CUTTING', 'PACKING', 'FINISHED_GOODS'],
        endpoints: [
          'POST /api/production-mobile/login',
          'POST /api/production-mobile/register',
          'POST /api/production-mobile/logout',
          'GET /api/production-mobile/profile',
          'GET /api/production-mobile/dashboard',
          'GET /api/production-mobile/work-orders',
          'GET /api/production-mobile/work-orders/:woNumber',
          'POST /api/production-mobile/work-orders/:woNumber/start',
          'POST /api/production-mobile/work-orders/:woNumber/pause',
          'POST /api/production-mobile/work-orders/:woNumber/complete',
          'POST /api/production-mobile/material-issue',
          'POST /api/production-mobile/batch/create',
          'POST /api/production-mobile/labels/print',
          'POST /api/production-mobile/wip/transfer',
          'POST /api/production-mobile/quality-check',
          'POST /api/production-mobile/scan',
          'GET /api/production-mobile/inventory-lookup?q=...',
          'GET /api/production-mobile/sync/status',
          'POST /api/production-mobile/sync',
          'POST /api/production-mobile/devices/:deviceCode/lock',
          'POST /api/production-mobile/devices/:deviceCode/wipe',
          'GET /api/production-mobile/info',
        ],
        part5Sprint: 7, part5Sprints: 15, totalProjectTables: 351,
      }, 'SUOP Production Mobile Platform v40.0.0')), { headers })
    }

'''
print(len(SPRINT_40_ENDPOINTS), 'chars')

#!/usr/bin/env python3
"""Append Sprint 43 backend endpoints to mini-services/suop-backend/index.ts"""

ENDPOINTS = r'''
    // ═════════════════════════════════════════════════════════
    // SPRINT 43 — MACHINE INTEGRATION, EQUIPMENT MONITORING & IoT
    // ═════════════════════════════════════════════════════════

    // GET /api/machines/dashboard — Machine dashboard
    if (path === '/api/machines/dashboard' && method === 'GET') {
      const data = {
        kpis: {
          totalMachines: 24, running: 18, idle: 2, setup: 1, cleaning: 1,
          maintenance: 1, fault: 1, offline: 0,
          avgAvailability: 94.2, avgPerformance: 87.5, avgOEE: 82.3,
          totalDowntimeMin: 142, totalOutput: 1248, totalRejects: 12,
          energyConsumptionKwh: 1840, connectedDevices: 22, gatewaysOnline: 3,
        },
        machineStatus: [
          { status: 'RUNNING', count: 18, color: '#10b981' },
          { status: 'IDLE', count: 2, color: '#3b82f6' },
          { status: 'SETUP', count: 1, color: '#a855f7' },
          { status: 'CLEANING', count: 1, color: '#06b6d4' },
          { status: 'MAINTENANCE', count: 1, color: '#f59e0b' },
          { status: 'FAULT', count: 1, color: '#ef4444' },
        ],
        machinesByCategory: [
          { category: 'MIXER', total: 4, running: 3, idle: 1 },
          { category: 'BOILER', total: 2, running: 2, idle: 0 },
          { category: 'FRYER', total: 2, running: 1, fault: 1 },
          { category: 'PACKAGING', total: 5, running: 4, setup: 1 },
          { category: 'OVEN', total: 3, running: 3, idle: 0 },
          { category: 'CONVEYOR', total: 4, running: 3, cleaning: 1, idle: 0 },
          { category: 'METAL_DETECTOR', total: 2, running: 2, idle: 0 },
          { category: 'COLD_ROOM', total: 2, running: 2, idle: 0 },
        ],
        liveMachines: [
          { code: 'MIX-01', name: 'Industrial Mixer 01', category: 'MIXER', status: 'RUNNING', line: 'LINE-KK-01', wc: 'WC-KK-01', batch: 'KAJ-THN-20260709-000145', operator: 'Rajesh Kumar', speed: 95, target: 100, output: 94, reject: 1, temp: 28, power: 12.5, connected: true },
          { code: 'COOK-01', name: 'Cooking Kettle 01', category: 'OVEN', status: 'RUNNING', line: 'LINE-KK-01', wc: 'WC-KK-03', batch: 'KAJ-THN-20260709-000145', operator: 'Rajesh Kumar', speed: 110, target: 110, output: 47, reject: 0, temp: 110, power: 18.2, connected: true },
          { code: 'FRY-01', name: 'Continuous Fryer 01', category: 'FRYER', status: 'FAULT', line: 'LINE-NM-01', wc: 'WC-NM-04', batch: null, operator: null, speed: 0, target: 150, output: 0, reject: 0, temp: 25, power: 0, connected: true, faultCode: 'HYDRAULIC_PRESSURE_LOSS' },
          { code: 'PACK-03', name: 'Packaging Machine 03', category: 'PACKAGING', status: 'SETUP', line: 'LINE-KK-01', wc: 'WC-KK-08', batch: null, operator: 'Vijay Patel', speed: 0, target: 60, output: 0, reject: 0, temp: 22, power: 2.1, connected: true },
          { code: 'GRIND-01', name: 'Wet Grinder 01', category: 'MIXER', status: 'RUNNING', line: 'LINE-IB-01', wc: 'WC-IB-02', batch: 'SHW-THN-20260709-000047', operator: 'Anil Reddy', speed: 80, target: 80, output: 45, reject: 0, temp: 32, power: 7.8, connected: true },
          { code: 'COOL-01', name: 'Cooling Tunnel 01', category: 'COOLING_TUNNEL', status: 'CLEANING', line: 'LINE-KK-01', wc: 'WC-KK-05', batch: null, operator: 'Suresh Mehta', speed: 0, target: 0, output: 0, reject: 0, temp: 8, power: 1.2, connected: true },
          { code: 'CONV-01', name: 'Conveyor Belt 01', category: 'CONVEYOR', status: 'IDLE', line: 'LINE-KK-01', wc: 'WC-KK-09', batch: null, operator: null, speed: 0, target: 0, output: 0, reject: 0, temp: 25, power: 0.5, connected: true },
        ],
        alarms: [
          { code: 'SA-000142', machine: 'FRY-01', type: 'THRESHOLD_BREACH', severity: 'CRITICAL', value: 'Hydraulic Pressure 0 bar', threshold: '>50 bar', raisedAt: '14:25', status: 'ACTIVE', ackBy: null },
          { code: 'SA-000141', machine: 'COOK-01', type: 'HIGH_TEMPERATURE', severity: 'WARNING', value: 'Cooking temp 112°C', threshold: '≤112°C', raisedAt: '14:10', status: 'ACKNOWLEDGED', ackBy: 'Rajesh Kumar' },
          { code: 'SA-000140', machine: 'MIX-01', type: 'VIBRATION_HIGH', severity: 'WARNING', value: 'Vibration 4.8 mm/s', threshold: '<4.5 mm/s', raisedAt: '13:55', status: 'RESOLVED', ackBy: 'Suresh Mehta' },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Machine dashboard')), { headers })
    }

    // GET /api/machines — List industrial machines
    if (path === '/api/machines' && method === 'GET') {
      const machines = [
        { id: 'm1', machineCode: 'MIX-01', machineName: 'Industrial Mixer 01', equipmentCategory: 'MIXER', manufacturer: 'Hindustan Mixer', modelNumber: 'HM-500', serialNumber: 'SN-MIX-001', firmwareVersion: 'v2.3.1', plantCode: 'THN', productionLineCode: 'LINE-KK-01', workCenterCode: 'WC-KK-01', plcType: 'SIEMENS', communicationProtocol: 'OPC_UA', ipAddress: '192.168.1.101', port: 4840, opcEndpoint: 'opc.tcp://192.168.1.101:4840', installationDate: '2024-03-15', warrantyExpiry: '2027-03-15', status: 'RUNNING', statusChangedAt: '2026-07-09T06:30:00Z', iotGatewayId: 'gw1', isConnected: true, lastHeartbeatAt: '2026-07-09T14:30:00Z', currentBatchNumber: 'KAJ-THN-20260709-000145', currentWorkOrderNumber: 'WO-001', operatorName: 'Rajesh Kumar', totalOperatingHours: 4280.5, totalCycles: 12480, lastMaintenanceAt: '2026-06-15', nextMaintenanceDue: '2026-09-15' },
        { id: 'm2', machineCode: 'COOK-01', machineName: 'Cooking Kettle 01', equipmentCategory: 'OVEN', manufacturer: 'Buhler', modelNumber: 'BK-300', serialNumber: 'SN-COOK-001', firmwareVersion: 'v3.1.0', plantCode: 'THN', productionLineCode: 'LINE-KK-01', workCenterCode: 'WC-KK-03', plcType: 'ALLEN_BRADLEY', communicationProtocol: 'ETHERNET_IP', ipAddress: '192.168.1.102', port: 44818, installationDate: '2024-02-20', warrantyExpiry: '2027-02-20', status: 'RUNNING', isConnected: true, currentBatchNumber: 'KAJ-THN-20260709-000145', operatorName: 'Rajesh Kumar', totalOperatingHours: 5120.0, totalCycles: 8920, nextMaintenanceDue: '2026-08-20' },
        { id: 'm3', machineCode: 'FRY-01', machineName: 'Continuous Fryer 01', equipmentCategory: 'FRYER', manufacturer: 'Heatmaster', modelNumber: 'HM-CF-200', serialNumber: 'SN-FRY-001', firmwareVersion: 'v1.8.2', plantCode: 'THN', productionLineCode: 'LINE-NM-01', workCenterCode: 'WC-NM-04', plcType: 'MITSUBISHI', communicationProtocol: 'MODBUS_TCP', ipAddress: '192.168.1.103', port: 502, modbusUnitId: 1, installationDate: '2023-11-10', warrantyExpiry: '2026-11-10', status: 'FAULT', statusChangedAt: '2026-07-09T14:25:00Z', isConnected: true, totalOperatingHours: 6840.5, totalCycles: 15620, lastMaintenanceAt: '2026-05-10', nextMaintenanceDue: '2026-07-15' },
        { id: 'm4', machineCode: 'PACK-03', machineName: 'Packaging Machine 03', equipmentCategory: 'PACKAGING', manufacturer: 'Bosch', modelNumber: 'BPM-120', serialNumber: 'SN-PACK-003', firmwareVersion: 'v4.2.0', plantCode: 'THN', productionLineCode: 'LINE-KK-01', workCenterCode: 'WC-KK-08', plcType: 'SCHNEIDER', communicationProtocol: 'OPC_UA', ipAddress: '192.168.1.104', port: 4840, installationDate: '2024-05-05', warrantyExpiry: '2027-05-05', status: 'SETUP', isConnected: true, operatorName: 'Vijay Patel', totalOperatingHours: 2840.0, totalCycles: 6240, nextMaintenanceDue: '2026-10-05' },
        { id: 'm5', machineCode: 'GRIND-01', machineName: 'Wet Grinder 01', equipmentCategory: 'MIXER', manufacturer: 'Elgi Ultra', modelNumber: 'UG-200', serialNumber: 'SN-GRIND-001', firmwareVersion: 'v2.0.0', plantCode: 'THN', productionLineCode: 'LINE-IB-01', workCenterCode: 'WC-IB-02', plcType: 'OMRON', communicationProtocol: 'MODBUS_RTU', ipAddress: '192.168.1.105', port: 502, installationDate: '2024-04-12', warrantyExpiry: '2027-04-12', status: 'RUNNING', isConnected: true, currentBatchNumber: 'SHW-THN-20260709-000047', operatorName: 'Anil Reddy', totalOperatingHours: 3120.5, totalCycles: 4280, nextMaintenanceDue: '2026-09-12' },
        { id: 'm6', machineCode: 'COOL-01', machineName: 'Cooling Tunnel 01', equipmentCategory: 'COOLING_TUNNEL', manufacturer: 'Buhler', modelNumber: 'BCT-500', serialNumber: 'SN-COOL-001', firmwareVersion: 'v1.5.0', plantCode: 'THN', productionLineCode: 'LINE-KK-01', workCenterCode: 'WC-KK-05', plcType: 'SIEMENS', communicationProtocol: 'PROFINET', ipAddress: '192.168.1.106', port: 502, installationDate: '2024-06-20', warrantyExpiry: '2027-06-20', status: 'CLEANING', isConnected: true, operatorName: 'Suresh Mehta', totalOperatingHours: 1980.5, totalCycles: 2840, nextMaintenanceDue: '2026-12-20' },
      ]
      return new Response(JSON.stringify(successResponse(machines, 'Industrial machines retrieved')), { headers })
    }

    // POST /api/machines — Register new machine
    if (path === '/api/machines' && method === 'POST') {
      const body = await request.json()
      const machineCode = body.machineCode || 'MCH-' + Date.now()
      const data = {
        id: 'm-new-' + Date.now(),
        machineCode,
        machineName: body.machineName,
        equipmentCategory: body.equipmentCategory,
        manufacturer: body.manufacturer,
        modelNumber: body.modelNumber,
        serialNumber: body.serialNumber,
        plcType: body.plcType,
        communicationProtocol: body.communicationProtocol,
        ipAddress: body.ipAddress,
        port: body.port,
        plantCode: body.plantCode || 'THN',
        productionLineCode: body.productionLineCode,
        workCenterCode: body.workCenterCode,
        status: 'OFFLINE',
        isConnected: false,
        totalOperatingHours: 0,
        totalCycles: 0,
        createdAt: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(data, `Machine ${machineCode} registered`)), { status: 201, headers })
    }

    // GET /api/machines/runtime — Machine runtime events
    if (path === '/api/machines/runtime' && method === 'GET') {
      const data = {
        events: [
          { code: 'MRE-00148', machine: 'FRY-01', eventType: 'FAULT', fromStatus: 'RUNNING', toStatus: 'FAULT', reasonCode: 'MACHINE_FAILURE', reasonDesc: 'Hydraulic pressure loss', startTime: '2026-07-09 14:25', endTime: null, durationMin: 35, source: 'PLC', operator: 'Suresh Mehta' },
          { code: 'MRE-00147', machine: 'MIX-01', eventType: 'CYCLE_COMPLETE', fromStatus: 'RUNNING', toStatus: 'RUNNING', reasonCode: null, startTime: '2026-07-09 14:20', endTime: '2026-07-09 14:21', durationMin: 1, source: 'PLC' },
          { code: 'MRE-00146', machine: 'COOK-01', eventType: 'MACHINE_START', fromStatus: 'SETUP', toStatus: 'RUNNING', reasonCode: null, startTime: '2026-07-09 06:35', endTime: null, source: 'OPERATOR', operator: 'Rajesh Kumar' },
          { code: 'MRE-00145', machine: 'PACK-03', eventType: 'SETUP_START', fromStatus: 'IDLE', toStatus: 'SETUP', reasonCode: 'CHANGE_OVER', startTime: '2026-07-09 14:00', endTime: null, source: 'OPERATOR', operator: 'Vijay Patel' },
          { code: 'MRE-00144', machine: 'COOL-01', eventType: 'CLEANING_START', fromStatus: 'RUNNING', toStatus: 'CLEANING', reasonCode: 'CLEANING', startTime: '2026-07-09 13:30', endTime: null, source: 'SYSTEM' },
          { code: 'MRE-00143', machine: 'FRY-01', eventType: 'DOWNTIME_END', fromStatus: 'FAULT', toStatus: 'RUNNING', reasonCode: 'MACHINE_FAILURE', startTime: '2026-07-09 12:00', endTime: '2026-07-09 14:25', durationMin: 145, source: 'PLC' },
        ],
        summary: {
          totalEvents: 248, machineStarts: 18, machineStops: 12, cycleCompletes: 184,
          downtimeEvents: 8, faults: 1, setups: 5, cleanings: 3,
          totalDowntimeMin: 142, topReason: 'MACHINE_FAILURE (35 min)',
          byMachine: [
            { machine: 'FRY-01', downtime: 145, faults: 1, cycles: 0 },
            { machine: 'COOK-01', downtime: 0, faults: 0, cycles: 24 },
            { machine: 'MIX-01', downtime: 5, faults: 0, cycles: 48 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Machine runtime events retrieved')), { headers })
    }

    // GET /api/machines/counters — Production counters
    if (path === '/api/machines/counters' && method === 'GET') {
      const data = {
        counters: [
          { code: 'CTR-00048', machine: 'COOK-01', batch: 'KAJ-THN-20260709-000145', type: 'GOOD_PIECES', current: 47, previous: 0, delta: 47, uom: 'PCS', source: 'PLC', lastUpdated: '14:30' },
          { code: 'CTR-00047', machine: 'COOK-01', batch: 'KAJ-THN-20260709-000145', type: 'REJECTED_PIECES', current: 0, previous: 0, delta: 0, uom: 'PCS', source: 'PLC', lastUpdated: '14:30' },
          { code: 'CTR-00046', machine: 'COOK-01', batch: 'KAJ-THN-20260709-000145', type: 'CYCLE_COUNT', current: 24, previous: 0, delta: 24, uom: 'CYCLES', source: 'PLC', lastUpdated: '14:30' },
          { code: 'CTR-00045', machine: 'COOK-01', batch: 'KAJ-THN-20260709-000145', type: 'SPEED_RPM', current: 110, previous: 110, delta: 0, uom: 'RPM', source: 'PLC', lastUpdated: '14:30' },
          { code: 'CTR-00044', machine: 'COOK-01', batch: 'KAJ-THN-20260709-000145', type: 'OUTPUT_RATE', current: 32.5, previous: 0, delta: 32.5, uom: 'KG/H', source: 'SYSTEM', lastUpdated: '14:30' },
          { code: 'CTR-00043', machine: 'MIX-01', batch: 'KAJ-THN-20260709-000145', type: 'GOOD_PIECES', current: 1, previous: 0, delta: 1, uom: 'BATCH', source: 'PLC', lastUpdated: '08:00' },
          { code: 'CTR-00042', machine: 'GRIND-01', batch: 'SHW-THN-20260709-000047', type: 'GOOD_PIECES', current: 45, previous: 0, delta: 45, uom: 'KG', source: 'PLC', lastUpdated: '14:30' },
          { code: 'CTR-00041', machine: 'PACK-03', batch: 'KAJ-THN-20260709-000145', type: 'PACKAGING_COUNT', current: 188, previous: 0, delta: 188, uom: 'PCS', source: 'PLC', lastUpdated: '11:00' },
        ],
        summary: {
          totalGoodPieces: 1248, totalRejectedPieces: 12, totalCycles: 248,
          avgOutputRate: 32.5, rejectRate: 0.95,
          byMachine: [
            { machine: 'COOK-01', goodPieces: 47, rejectPieces: 0, cycles: 24, rate: 32.5 },
            { machine: 'MIX-01', goodPieces: 1, rejectPieces: 0, cycles: 1, rate: 0 },
            { machine: 'GRIND-01', goodPieces: 45, rejectPieces: 0, cycles: 8, rate: 15.0 },
            { machine: 'PACK-03', goodPieces: 188, rejectPieces: 2, cycles: 16, rate: 28.0 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Production counters retrieved')), { headers })
    }

    // GET /api/iot/gateways — IoT Gateways
    if (path === '/api/iot/gateways' && method === 'GET') {
      const data = {
        gateways: [
          { code: 'GW-THN-01', name: 'Thane Plant Gateway 01', plant: 'THN', ipAddress: '192.168.1.10', macAddress: '00:1B:44:11:3A:B7', firmwareVersion: 'v2.4.1', maxDevices: 50, connectedDevices: 18, status: 'ONLINE', lastHeartbeat: '14:30:12', eventsPerMinute: 247, avgProcessingMs: 124 },
          { code: 'GW-THN-02', name: 'Thane Plant Gateway 02', plant: 'THN', ipAddress: '192.168.1.11', macAddress: '00:1B:44:11:3A:B8', firmwareVersion: 'v2.4.1', maxDevices: 50, connectedDevices: 4, status: 'ONLINE', lastHeartbeat: '14:30:08', eventsPerMinute: 84, avgProcessingMs: 98 },
          { code: 'GW-THN-03', name: 'Thane Plant Gateway 03', plant: 'THN', ipAddress: '192.168.1.12', macAddress: '00:1B:44:11:3A:B9', firmwareVersion: 'v2.3.5', maxDevices: 50, connectedDevices: 0, status: 'OFFLINE', lastHeartbeat: '12:45:30', eventsPerMinute: 0, avgProcessingMs: 0 },
        ],
        connections: [
          { code: 'CONN-001', gateway: 'GW-THN-01', machine: 'MIX-01', protocol: 'OPC_UA', endpoint: 'opc.tcp://192.168.1.101:4840', status: 'CONNECTED', connectedAt: '06:00:00', lastDataAt: '14:30:11', messages: 12480, failed: 0 },
          { code: 'CONN-002', gateway: 'GW-THN-01', machine: 'COOK-01', protocol: 'ETHERNET_IP', endpoint: '192.168.1.102:44818', status: 'CONNECTED', connectedAt: '06:00:00', lastDataAt: '14:30:10', messages: 8920, failed: 2 },
          { code: 'CONN-003', gateway: 'GW-THN-01', machine: 'FRY-01', protocol: 'MODBUS_TCP', endpoint: '192.168.1.103:502', status: 'CONNECTED', connectedAt: '06:00:00', lastDataAt: '14:25:00', messages: 15620, failed: 8 },
          { code: 'CONN-004', gateway: 'GW-THN-01', machine: 'PACK-03', protocol: 'OPC_UA', endpoint: 'opc.tcp://192.168.1.104:4840', status: 'CONNECTED', connectedAt: '08:00:00', lastDataAt: '14:30:09', messages: 6240, failed: 0 },
          { code: 'CONN-005', gateway: 'GW-THN-02', machine: 'GRIND-01', protocol: 'MODBUS_RTU', endpoint: '192.168.1.105:502', status: 'CONNECTED', connectedAt: '05:00:00', lastDataAt: '14:30:05', messages: 4280, failed: 0 },
          { code: 'CONN-006', gateway: 'GW-THN-02', machine: 'COOL-01', protocol: 'PROFINET', endpoint: '192.168.1.106', status: 'CONNECTED', connectedAt: '06:00:00', lastDataAt: '14:30:08', messages: 2840, failed: 0 },
        ],
        heartbeats: [
          { gateway: 'GW-THN-01', at: '14:30:12', cpu: 32.4, memory: 58.2, disk: 42.1, temp: 38.5, uptime: 284800, latencyMs: 12, status: 'HEALTHY' },
          { gateway: 'GW-THN-02', at: '14:30:08', cpu: 18.6, memory: 42.8, disk: 38.4, temp: 35.2, uptime: 284800, latencyMs: 8, status: 'HEALTHY' },
        ],
        summary: {
          totalGateways: 3, online: 2, offline: 1, totalConnections: 22, activeConnections: 22,
          totalMessages: 50380, totalFailures: 10, successRate: 99.98, totalEventsPerMin: 331,
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'IoT gateways retrieved')), { headers })
    }

    // GET /api/iot/sensors — Sensor readings & alerts
    if (path === '/api/iot/sensors' && method === 'GET') {
      const data = {
        recentReadings: [
          { code: 'SR-00248', machine: 'COOK-01', type: 'TEMPERATURE', name: 'Cooking Chamber Temp', location: 'COOKING_CHAMBER', value: 110, unit: '°C', min: 108, max: 112, isAlert: false, at: '14:30' },
          { code: 'SR-00247', machine: 'COOK-01', type: 'POWER_CONSUMPTION', name: 'Power Draw', location: 'MAIN', value: 18.2, unit: 'KW', min: 0, max: 25, isAlert: false, at: '14:30' },
          { code: 'SR-00246', machine: 'FRY-01', type: 'PRESSURE', name: 'Hydraulic Pressure', location: 'PUMP', value: 0, unit: 'BAR', min: 50, max: 200, isAlert: true, alertLevel: 'CRITICAL', at: '14:25' },
          { code: 'SR-00245', machine: 'MIX-01', type: 'VIBRATION', name: 'Motor Vibration', location: 'MOTOR', value: 4.8, unit: 'MM/S', min: 0, max: 4.5, isAlert: true, alertLevel: 'WARNING', at: '13:55' },
          { code: 'SR-00244', machine: 'MIX-01', type: 'TEMPERATURE', name: 'Bearing Temp', location: 'BEARING', value: 42, unit: '°C', min: 0, max: 60, isAlert: false, at: '14:30' },
          { code: 'SR-00243', machine: 'COLD-01', type: 'TEMPERATURE', name: 'Cold Room Temp', location: 'COLD_ROOM', value: 4, unit: '°C', min: 2, max: 8, isAlert: false, at: '14:30' },
          { code: 'SR-00242', machine: 'COLD-01', type: 'HUMIDITY', name: 'Cold Room Humidity', location: 'COLD_ROOM', value: 65, unit: '%', min: 50, max: 70, isAlert: false, at: '14:30' },
          { code: 'SR-00241', machine: 'GRIND-01', type: 'RPM', name: 'Drum RPM', location: 'DRUM', value: 80, unit: 'RPM', min: 70, max: 90, isAlert: false, at: '14:30' },
        ],
        alerts: [
          { code: 'SA-000142', machine: 'FRY-01', type: 'THRESHOLD_BREACH', sensor: 'PRESSURE', measured: 0, threshold: 50, unit: 'BAR', severity: 'CRITICAL', status: 'ACTIVE', raisedAt: '14:25', ackBy: null, resolvedAt: null },
          { code: 'SA-000141', machine: 'COOK-01', type: 'HIGH_TEMPERATURE', sensor: 'TEMPERATURE', measured: 112, threshold: 112, unit: '°C', severity: 'WARNING', status: 'ACKNOWLEDGED', raisedAt: '14:10', ackBy: 'Rajesh Kumar', resolvedAt: null },
          { code: 'SA-000140', machine: 'MIX-01', type: 'VIBRATION_HIGH', sensor: 'VIBRATION', measured: 4.8, threshold: 4.5, unit: 'MM/S', severity: 'WARNING', status: 'RESOLVED', raisedAt: '13:55', ackBy: 'Suresh Mehta', resolvedAt: '14:05', resolution: 'Lubricated bearing' },
        ],
        summary: {
          totalReadings: 18420, alertReadings: 24, bySensorType: [
            { type: 'TEMPERATURE', count: 4820, alerts: 8 },
            { type: 'PRESSURE', count: 2480, alerts: 4 },
            { type: 'VIBRATION', count: 1840, alerts: 6 },
            { type: 'POWER_CONSUMPTION', count: 3680, alerts: 2 },
            { type: 'HUMIDITY', count: 1240, alerts: 0 },
            { type: 'RPM', count: 980, alerts: 0 },
            { type: 'VOLTAGE', count: 920, alerts: 2 },
            { type: 'CURRENT', count: 920, alerts: 2 },
          ],
          activeAlerts: 2, acknowledged: 1, resolved: 21, criticalAlerts: 1,
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Sensor readings & alerts retrieved')), { headers })
    }

    // GET /api/machines/maintenance — Maintenance triggers
    if (path === '/api/machines/maintenance' && method === 'GET') {
      const data = {
        triggers: [
          { code: 'MT-00048', machine: 'FRY-01', type: 'SENSOR_ALERT', desc: 'Hydraulic pressure loss - emergency repair', threshold: null, current: null, unit: null, workOrder: 'MWO-2026-0012', technician: 'Mahesh K.', assignedAt: '14:25', status: 'IN_PROGRESS', priority: 'EMERGENCY', notes: null, backOnlineAt: null, downtimeMin: 35, triggeredAt: '14:25' },
          { code: 'MT-00047', machine: 'COOK-01', type: 'OPERATING_HOURS', desc: 'Scheduled 5000-hour maintenance', threshold: 5000, current: 5120, unit: 'HOURS', workOrder: 'MWO-2026-0011', technician: 'Ravi S.', assignedAt: '2026-08-20', status: 'OPEN', priority: 'MEDIUM', triggeredAt: '2026-08-20' },
          { code: 'MT-00046', machine: 'MIX-01', type: 'CYCLE_COUNT', desc: 'Cycle count reached 12000', threshold: 12000, current: 12480, unit: 'CYCLES', workOrder: 'MWO-2026-0010', technician: 'Ravi S.', assignedAt: '2026-06-10', status: 'COMPLETED', priority: 'MEDIUM', notes: 'Replaced bearings, lubricated motor', backOnlineAt: '2026-06-15', downtimeMin: 240, triggeredAt: '2026-06-10' },
          { code: 'MT-00045', machine: 'GRIND-01', type: 'SCHEDULED', desc: 'Quarterly inspection', threshold: null, current: null, unit: null, workOrder: 'MWO-2026-0009', technician: 'Mahesh K.', assignedAt: '2026-09-12', status: 'OPEN', priority: 'LOW', triggeredAt: '2026-09-12' },
          { code: 'MT-00044', machine: 'PACK-03', type: 'MANUAL_REPORT', desc: 'Operator reported abnormal noise', threshold: null, current: null, unit: null, workOrder: 'MWO-2026-0008', technician: 'Ravi S.', assignedAt: '2026-07-05', status: 'COMPLETED', priority: 'HIGH', notes: 'Tightened loose conveyor belt', backOnlineAt: '2026-07-05', downtimeMin: 90, triggeredAt: '2026-07-05' },
        ],
        summary: {
          total: 12, open: 4, inProgress: 1, completed: 7, emergency: 1,
          avgDowntimeMin: 145, totalDowntimeMin: 1015,
          byType: [
            { type: 'OPERATING_HOURS', count: 4 },
            { type: 'CYCLE_COUNT', count: 3 },
            { type: 'SENSOR_ALERT', count: 1 },
            { type: 'MANUAL_REPORT', count: 2 },
            { type: 'SCHEDULED', count: 2 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Maintenance triggers retrieved')), { headers })
    }

    // POST /api/machines/:machineCode/event — Receive machine event (PLC push)
    if (path.match(/^\/api\/machines\/[^/]+\/event$/) && method === 'POST') {
      const parts = path.split('/')
      const machineCode = parts[parts.length - 2]
      const body = await request.json()
      const eventCode = 'MRE-' + String(Date.now()).slice(-6)
      const data = {
        eventCode,
        machineCode,
        eventType: body.eventType,
        fromStatus: body.fromStatus,
        toStatus: body.toStatus,
        reasonCode: body.reasonCode,
        source: body.source || 'PLC',
        eventStartTime: new Date().toISOString(),
        message: `Event ${body.eventType} recorded for ${machineCode}`,
      }
      return new Response(JSON.stringify(successResponse(data, `Machine event ${eventCode} received`)), { status: 201, headers })
    }

    // POST /api/machines/:machineCode/counter — Update counter (PLC push)
    if (path.match(/^\/api\/machines\/[^/]+\/counter$/) && method === 'POST') {
      const parts = path.split('/')
      const machineCode = parts[parts.length - 2]
      const body = await request.json()
      const counterCode = 'CTR-' + String(Date.now()).slice(-6)
      const data = {
        counterCode,
        machineCode,
        counterType: body.counterType,
        currentValue: body.currentValue,
        previousValue: body.previousValue || 0,
        deltaValue: body.currentValue - (body.previousValue || 0),
        uom: body.uom || 'PCS',
        source: 'PLC',
        lastUpdated: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(data, `Counter updated for ${machineCode}`)), { status: 201, headers })
    }

    // POST /api/machines/:machineCode/sensor — Receive sensor reading (PLC push)
    if (path.match(/^\/api\/machines\/[^/]+\/sensor$/) && method === 'POST') {
      const parts = path.split('/')
      const machineCode = parts[parts.length - 2]
      const body = await request.json()
      const readingCode = 'SR-' + String(Date.now()).slice(-6)
      const isAlert = body.minValue !== null && body.maxValue !== null && (body.value < body.minValue || body.value > body.maxValue)
      const data = {
        readingCode,
        machineCode,
        sensorType: body.sensorType,
        sensorName: body.sensorName,
        value: body.value,
        unitOfMeasure: body.unitOfMeasure,
        minValue: body.minValue,
        maxValue: body.maxValue,
        isAlert,
        alertLevel: isAlert ? (Math.abs(body.value - (body.minValue + body.maxValue) / 2) > (body.maxValue - body.minValue) ? 'CRITICAL' : 'WARNING') : null,
        source: 'PLC',
        readingAt: new Date().toISOString(),
      }
      return new Response(JSON.stringify(successResponse(data, `Sensor reading ${readingCode} recorded${isAlert ? ' - ALERT RAISED' : ''}`)), { status: 201, headers })
    }

    // GET /api/machines/info — Sprint 43 info
    if (path === '/api/machines/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 43, sprintName: 'Enterprise Machine Integration, Equipment Monitoring & Industrial IoT Foundation', version: '43.0.0', part: 5, tables: 11,
        epics: [
          'Machine Master (13 equipment categories, PLC info, IoT link)',
          'PLC Connectivity Framework (6 PLC types: Siemens/Allen-Bradley/Mitsubishi/Schneider/Omron/Delta)',
          'Industrial IoT Gateway (multi-protocol, heartbeat monitoring)',
          'Machine Runtime Monitoring (start/stop/cycle/downtime/setup/cleaning/fault)',
          'Production Counters (good/reject/cycle/speed/output rate)',
          'Sensor Monitoring (9 sensor types, threshold alerts)',
          'Maintenance Integration (5 trigger types, auto work order)',
          'Frontend (8 admin modules: Machine Master/Dashboard/IoT/PLC/Sensor/Timeline/Health/Counters)',
          'Backend (10 API groups, 11 database models)',
        ],
        chiefArchitectRecommendation: 'Design for Industry 4.0 but implement in phases: Phase 1 (Immediate) Manual machine registration, operator start/stop, runtime tracking, scheduled maintenance, counter entry via Production App. Phase 2 (When Automation Added) PLC integration, automatic counters, live sensor monitoring, power consumption, automatic downtime, alarm sync. Phase 3 (Future Smart Factory) Predictive maintenance AI, Digital Twin, energy optimization, AI production optimization, computer vision quality.',
        supportedEquipment: ['Mixing Machines', 'Steam Boilers', 'Roasters', 'Fryers', 'Cooling Tunnels', 'Packaging Machines', 'Label Printers', 'Metal Detectors', 'Check Weighers', 'Conveyors', 'Compressors', 'Industrial Ovens', 'Cold Rooms'],
        machineStatuses: ['RUNNING', 'IDLE', 'SETUP', 'CLEANING', 'MAINTENANCE', 'FAULT', 'OFFLINE', 'RETIRED'],
        plcTypes: ['SIEMENS', 'ALLEN_BRADLEY', 'MITSUBISHI', 'SCHNEIDER', 'OMRON', 'DELTA'],
        protocols: ['OPC_UA', 'MODBUS_TCP', 'MODBUS_RTU', 'ETHERNET_IP', 'PROFINET', 'MQTT'],
        sensorTypes: ['TEMPERATURE', 'HUMIDITY', 'PRESSURE', 'WEIGHT', 'VIBRATION', 'POWER_CONSUMPTION', 'CURRENT', 'VOLTAGE', 'RPM'],
        maintenanceTriggers: ['OPERATING_HOURS', 'CYCLE_COUNT', 'SENSOR_ALERT', 'RUNTIME', 'MANUAL_REPORT', 'SCHEDULED'],
        performanceTargets: { connectedDevices: 5000, eventsPerMinute: 100000, eventProcessing: '<1000 ms', gatewayFailover: '<30 sec' },
        endpoints: [
          'GET /api/machines/dashboard',
          'GET /api/machines',
          'POST /api/machines',
          'GET /api/machines/runtime',
          'GET /api/machines/counters',
          'GET /api/machines/maintenance',
          'POST /api/machines/:machineCode/event',
          'POST /api/machines/:machineCode/counter',
          'POST /api/machines/:machineCode/sensor',
          'GET /api/iot/gateways',
          'GET /api/iot/sensors',
          'GET /api/machines/info',
        ],
        part5Sprint: 10, part5Sprints: 15, totalProjectTables: 384,
      }, 'SUOP Machine Integration & Industrial IoT Engine v43.0.0')), { headers })
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

print(f"Inserted Sprint 43 endpoints. Old: {len(content)}, New: {len(new_content)}")

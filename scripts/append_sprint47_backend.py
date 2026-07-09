#!/usr/bin/env python3
"""Append Sprint 47 backend endpoints to mini-services/suop-backend/index.ts"""

ENDPOINTS = r'''
    // ═════════════════════════════════════════════════════════
    // SPRINT 47 — MANUFACTURING MISSION CONTROL & COMMAND CENTER
    // ═════════════════════════════════════════════════════════

    // GET /api/mission-control — Manufacturing Mission Control
    if (path === '/api/mission-control' && method === 'GET') {
      const data = {
        scope: { type: 'ENTERPRISE', code: 'ALL', name: 'Sudhamrit Foods - Enterprise' },
        snapshotAt: new Date().toISOString(),
        factoryHealth: { score: 87.5, status: 'HEALTHY' },
        production: { activeOrders: 5, runningMachines: 18, totalMachines: 24, faultedMachines: 1, activeOperators: 5, totalOperators: 6 },
        targets: { targetQty: 1320, actualQty: 1248, achievement: 94.5, uom: 'KG' },
        kpis: { avgOEE: 84.2, avgYield: 96.8, scrapRate: 0.55 },
        energy: { consumptionKwh: 1840 },
        alerts: { active: 2, critical: 1 },
        refreshDurationMs: 1840,
        plants: [
          { code: 'THN', name: 'Thane Plant', health: 87.5, status: 'HEALTHY', orders: 5, machines: '18/24', operators: '5/6', oee: 84.2, yield: 96.8, output: 1248, target: 1320, achievement: 94.5, alerts: 2, critical: 1 },
        ],
        widgets: [
          { name: 'Factory Health', value: '87.5', status: 'HEALTHY', icon: 'shield' },
          { name: 'Production Orders', value: '5 Active', status: 'GREEN', icon: 'factory' },
          { name: 'Running Machines', value: '18/24', status: 'YELLOW', icon: 'server' },
          { name: 'Operator Status', value: '5/6 Active', status: 'GREEN', icon: 'users' },
          { name: 'Production Target', value: '94.5%', status: 'GREEN', icon: 'target' },
          { name: 'OEE', value: '84.2%', status: 'YELLOW', icon: 'gauge' },
          { name: 'Quality', value: '99.4% FPY', status: 'GREEN', icon: 'check' },
          { name: 'Yield', value: '96.8%', status: 'GREEN', icon: 'percent' },
          { name: 'Energy', value: '1,840 kWh', status: 'YELLOW', icon: 'zap' },
          { name: 'Alerts', value: '2 (1 critical)', status: 'RED', icon: 'alert' },
        ],
        chiefArchitectRecommendation: 'Single Enterprise Operations Center: Live Production Orders, Target vs Actual, OEE by Line, Machine Health, Quality Alerts, Raw Material Availability, Packaging Status, Warehouse Transfer, Energy Consumption, Active Maintenance WOs. From one screen: identify bottlenecks, quality risks, maintenance issues, inventory shortages without switching modules.',
      }
      return new Response(JSON.stringify(successResponse(data, 'Manufacturing Mission Control')), { headers })
    }

    // GET /api/mission-control/control-tower — Enterprise Control Tower
    if (path === '/api/mission-control/control-tower' && method === 'GET') {
      const data = {
        enterprise: {
          name: 'Sudhamrit Foods', plants: 1, departments: 2, lines: 5, machines: 24,
          activeWorkOrders: 5, currentOutput: 1248, outputUom: 'KG', currentOEE: 84.2,
          runningMachines: 18, totalMachines: 24, activeOperators: 5, riskLevel: 'MEDIUM', status: 'YELLOW',
        },
        plants: [
          { code: 'THN', name: 'Thane Plant', departments: 2, lines: 5, machines: 24, activeWOs: 5, output: 1248, oee: 84.2, running: 18, total: 24, operators: 5, risk: 'MEDIUM', riskFactors: ['FRY-01 Fault', 'Namkeen variance 8.6%'], status: 'YELLOW' },
        ],
        departments: [
          { code: 'SWEETS', name: 'Sweets Department', lines: 4, activeWOs: 4, output: 998, oee: 86.3, running: 15, total: 19, risk: 'LOW', status: 'GREEN' },
          { code: 'SNACKS', name: 'Snacks Department', lines: 1, activeWOs: 1, output: 250, oee: 72.0, running: 3, total: 5, risk: 'HIGH', riskFactors: ['FRY-01 Fault - production halted'], status: 'RED' },
        ],
        lines: [
          { code: 'LINE-KK-01', name: 'Kaju Katli Line', machines: 6, activeWOs: 2, output: 542, oee: 88.7, running: 5, risk: 'LOW', status: 'GREEN' },
          { code: 'LINE-IB-01', name: 'Idli Batter Line', machines: 4, activeWOs: 1, output: 95, oee: 85.2, running: 4, risk: 'LOW', status: 'GREEN' },
          { code: 'LINE-NM-01', name: 'Namkeen Line', machines: 5, activeWOs: 1, output: 250, oee: 72.0, running: 3, risk: 'HIGH', status: 'RED' },
          { code: 'LINE-ML-01', name: 'Motichoor Line', machines: 5, activeWOs: 1, output: 294, oee: 87.3, running: 5, risk: 'LOW', status: 'GREEN' },
          { code: 'LINE-GUL-01', name: 'Gulab Jamun Line', machines: 4, activeWOs: 0, output: 67, oee: 88.4, running: 4, risk: 'LOW', status: 'GREEN' },
        ],
        viewModes: ['Enterprise View', 'Regional View', 'Plant View', 'Department View', 'Line View', 'TV Dashboard', 'Operations Center'],
      }
      return new Response(JSON.stringify(successResponse(data, 'Control Tower view')), { headers })
    }

    // GET /api/mission-control/digital-factory — Digital Factory Twin
    if (path === '/api/mission-control/digital-factory' && method === 'GET') {
      const data = {
        nodes: [
          { code: 'DFN-PLANT-THN', type: 'PLANT', name: 'Thane Plant', status: 'RUNNING', output: 1248, uom: 'KG', wip: 47, wipStage: 'COOKING', capacity: 84.2, color: 'GREEN', children: 2 },
          { code: 'DFN-DEPT-SWEETS', type: 'DEPARTMENT', name: 'Sweets Department', parent: 'DFN-PLANT-THN', status: 'RUNNING', output: 998, wip: 47, capacity: 86.3, color: 'GREEN', children: 4 },
          { code: 'DFN-DEPT-SNACKS', type: 'DEPARTMENT', name: 'Snacks Department', parent: 'DFN-PLANT-THN', status: 'DEGRADED', output: 250, wip: 0, capacity: 72.0, color: 'RED', children: 1 },
          { code: 'DFN-LINE-KK-01', type: 'LINE', name: 'Kaju Katli Line', parent: 'DFN-DEPT-SWEETS', status: 'RUNNING', output: 542, wip: 47, wipStage: 'COOKING', capacity: 88.7, color: 'GREEN', children: 6, batch: 'KAJ-THN-20260709-000145', product: 'Kaju Katli 500g' },
          { code: 'DFN-LINE-IB-01', type: 'LINE', name: 'Idli Batter Line', parent: 'DFN-DEPT-SWEETS', status: 'RUNNING', output: 95, wip: 45, wipStage: 'GRINDING', capacity: 85.2, color: 'GREEN', children: 4, batch: 'SHW-THN-20260709-000047', product: 'Shwet Idli Batter 1kg' },
          { code: 'DFN-LINE-NM-01', type: 'LINE', name: 'Namkeen Line', parent: 'DFN-DEPT-SNACKS', status: 'FAULT', output: 250, wip: 0, capacity: 72.0, color: 'RED', children: 5 },
          { code: 'DFN-LINE-ML-01', type: 'LINE', name: 'Motichoor Line', parent: 'DFN-DEPT-SWEETS', status: 'RUNNING', output: 294, wip: 0, capacity: 87.3, color: 'GREEN', children: 5 },
          { code: 'DFN-LINE-GUL-01', type: 'LINE', name: 'Gulab Jamun Line', parent: 'DFN-DEPT-SWEETS', status: 'RUNNING', output: 67, wip: 0, capacity: 88.4, color: 'GREEN', children: 4 },
          { code: 'DFN-MACH-MIX-01', type: 'MACHINE', name: 'Industrial Mixer 01', parent: 'DFN-LINE-KK-01', status: 'RUNNING', output: 94, capacity: 88.0, color: 'GREEN', operator: 'Rajesh Kumar', batch: 'KAJ-THN-20260709-000145' },
          { code: 'DFN-MACH-COOK-01', type: 'MACHINE', name: 'Cooking Kettle 01', parent: 'DFN-LINE-KK-01', status: 'RUNNING', output: 47, capacity: 92.5, color: 'GREEN', operator: 'Rajesh Kumar', batch: 'KAJ-THN-20260709-000145' },
          { code: 'DFN-MACH-FRY-01', type: 'MACHINE', name: 'Continuous Fryer 01', parent: 'DFN-LINE-NM-01', status: 'FAULT', output: 0, capacity: 0, color: 'RED', operator: null },
          { code: 'DFN-MACH-GRIND-01', type: 'MACHINE', name: 'Wet Grinder 01', parent: 'DFN-LINE-IB-01', status: 'RUNNING', output: 45, capacity: 95.0, color: 'GREEN', operator: 'Anil Reddy' },
          { code: 'DFN-MACH-PACK-03', type: 'MACHINE', name: 'Packaging Machine 03', parent: 'DFN-LINE-KK-01', status: 'SETUP', output: 0, capacity: 65.0, color: 'YELLOW', operator: 'Vijay Patel' },
          { code: 'DFN-MACH-COOL-01', type: 'MACHINE', name: 'Cooling Tunnel 01', parent: 'DFN-LINE-KK-01', status: 'CLEANING', output: 0, capacity: 78.0, color: 'BLUE', operator: 'Suresh Mehta' },
        ],
        tree: {
          name: 'Thane Plant', type: 'PLANT', status: 'RUNNING', color: 'GREEN',
          children: [
            { name: 'Sweets Dept', type: 'DEPARTMENT', status: 'RUNNING', color: 'GREEN', children: [
              { name: 'Kaju Katli Line', type: 'LINE', status: 'RUNNING', color: 'GREEN', batch: 'KAJ-THN-20260709-000145', children: [
                { name: 'MIX-01', type: 'MACHINE', status: 'RUNNING', color: 'GREEN' },
                { name: 'COOK-01', type: 'MACHINE', status: 'RUNNING', color: 'GREEN' },
                { name: 'COOL-01', type: 'MACHINE', status: 'CLEANING', color: 'BLUE' },
                { name: 'PACK-03', type: 'MACHINE', status: 'SETUP', color: 'YELLOW' },
              ]},
              { name: 'Idli Batter Line', type: 'LINE', status: 'RUNNING', color: 'GREEN', children: [
                { name: 'GRIND-01', type: 'MACHINE', status: 'RUNNING', color: 'GREEN' },
              ]},
              { name: 'Motichoor Line', type: 'LINE', status: 'RUNNING', color: 'GREEN' },
              { name: 'Gulab Jamun Line', type: 'LINE', status: 'RUNNING', color: 'GREEN' },
            ]},
            { name: 'Snacks Dept', type: 'DEPARTMENT', status: 'DEGRADED', color: 'RED', children: [
              { name: 'Namkeen Line', type: 'LINE', status: 'FAULT', color: 'RED', children: [
                { name: 'FRY-01', type: 'MACHINE', status: 'FAULT', color: 'RED' },
              ]},
            ]},
          ],
        },
        summary: { totalNodes: 14, running: 10, setup: 1, cleaning: 1, fault: 1, idle: 1, totalWip: 92, wipUom: 'KG' },
      }
      return new Response(JSON.stringify(successResponse(data, 'Digital Factory Twin')), { headers })
    }

    // GET /api/mission-control/alerts — Manufacturing Alert Center
    if (path === '/api/mission-control/alerts' && method === 'GET') {
      const data = {
        alerts: [
          { code: 'MAL-00048', plant: 'THN', line: 'LINE-NM-01', machine: 'FRY-01', type: 'MACHINE', category: 'EQUIPMENT', title: 'FRY-01 Hydraulic Pressure Loss', desc: 'Hydraulic pressure dropped to 0 bar - production halted', severity: 'CRITICAL', status: 'ACTIVE', ackBy: null, raisedAt: '14:25', escalation: 0, channels: 'DASHBOARD+MOBILE+SMS' },
          { code: 'MAL-00047', plant: 'THN', line: 'LINE-KK-01', machine: 'COOK-01', type: 'QUALITY', category: 'QUALITY', title: 'Cooking temp 112°C (target ≤112°C)', desc: 'Temperature at upper threshold - monitor closely', severity: 'WARNING', status: 'ACKNOWLEDGED', ackBy: 'Rajesh Kumar', raisedAt: '14:10', escalation: 0, channels: 'DASHBOARD+MOBILE' },
          { code: 'MAL-00046', plant: 'THN', line: 'LINE-KK-01', machine: 'MIX-01', type: 'MACHINE', category: 'EQUIPMENT', title: 'Motor vibration 4.8 mm/s (threshold <4.5)', desc: 'Bearing vibration above threshold', severity: 'WARNING', status: 'RESOLVED', ackBy: 'Suresh Mehta', raisedAt: '13:55', resolvedAt: '14:05', resolution: 'Lubricated bearing', channels: 'DASHBOARD' },
          { code: 'MAL-00045', plant: 'THN', line: 'LINE-NM-01', type: 'PRODUCTION_DELAY', category: 'PRODUCTION', title: 'Namkeen Line 22% below target', desc: 'FRY-01 fault causing production delay - 70 KG lost', severity: 'CRITICAL', status: 'ACTIVE', ackBy: null, raisedAt: '14:30', escalation: 1, escalatedTo: 'Plant Head', channels: 'DASHBOARD+MOBILE+EMAIL+TEAMS' },
          { code: 'MAL-00044', plant: 'THN', line: 'ALL', type: 'MATERIAL', category: 'MATERIAL', title: 'Cashew W320 stock low (5 days remaining)', desc: 'Current stock will last 5 days at current consumption rate', severity: 'WARNING', status: 'ACTIVE', ackBy: null, raisedAt: '10:00', escalation: 0, channels: 'DASHBOARD+EMAIL' },
        ],
        summary: {
          total: 5, active: 3, acknowledged: 1, resolved: 1, escalated: 1,
          critical: 2, warning: 3,
          byType: [
            { type: 'MACHINE', count: 2, active: 1 },
            { type: 'QUALITY', count: 1, active: 0 },
            { type: 'PRODUCTION_DELAY', count: 1, active: 1 },
            { type: 'MATERIAL', count: 1, active: 1 },
          ],
        },
        deliveryChannels: [
          { channel: 'Dashboard', active: true, alertsToday: 5 },
          { channel: 'Mobile App', active: true, alertsToday: 3 },
          { channel: 'Email', active: true, alertsToday: 2 },
          { channel: 'SMS', active: true, alertsToday: 1 },
          { channel: 'WhatsApp', active: false, alertsToday: 0 },
          { channel: 'Microsoft Teams', active: true, alertsToday: 1 },
          { channel: 'Slack', active: false, alertsToday: 0 },
        ],
      }
      return new Response(JSON.stringify(successResponse(data, 'Manufacturing alerts retrieved')), { headers })
    }

    // GET /api/mission-control/ai — AI Manufacturing Operations Center
    if (path === '/api/mission-control/ai' && method === 'GET') {
      const data = {
        recommendations: [
          { code: 'AIR-00012', engine: 'PRODUCTION_OPTIMIZER', type: 'REORDER_PRODUCTION', title: 'Reorder Namkeen after Kaju Katli campaign', desc: 'Schedule Namkeen Line after Kaju Katli campaign completes to share cleaning crew', rationale: 'Campaign ends 2026-07-11. Namkeen can start 2026-07-12 with shared cleaning team.', impact: '+8% throughput', confidence: 87.5, priority: 'HIGH', status: 'PENDING', line: 'LINE-NM-01' },
          { code: 'AIR-00011', engine: 'PREDICTIVE_MAINTENANCE', type: 'SCHEDULE_MAINTENANCE', title: 'Schedule FRY-01 hydraulic pump inspection', desc: 'Vibration pattern suggests hydraulic pump wear - predict failure within 7 days', rationale: 'Vibration data shows increasing amplitude at pump frequency. Historical pattern matches 3 prior failures.', impact: 'Prevent 4-hour unplanned downtime', confidence: 92.0, priority: 'CRITICAL', status: 'ACCEPTED', acceptedBy: 'Lakshmi V.', acceptedAt: '2026-07-09T14:00:00Z', machine: 'FRY-01' },
          { code: 'AIR-00010', engine: 'ENERGY_OPTIMIZER', type: 'OPTIMIZE_ENERGY', title: 'Shift COOK-01 preheating to off-peak hours', desc: 'Preheating cooking kettle during off-peak electricity (22:00-06:00) saves ₹180/day', rationale: 'Current preheat at 06:00 during peak rate. Off-peak rate is 40% lower.', impact: '₹180/day savings (₹4,320/month)', confidence: 95.0, priority: 'MEDIUM', status: 'PENDING', machine: 'COOK-01' },
          { code: 'AIR-00009', engine: 'ROOT_CAUSE_ANALYZER', type: 'REDUCE_WASTE', title: 'Namkeen burn rate correlates with FRY-01 temperature fluctuation', desc: 'AI detected 89% of burnt product occurs when FRY-01 temp varies >±3°C', rationale: 'Correlation analysis of 248 batches: burn rate 4.2% when temp varies >3°C vs 0.8% when stable.', impact: '-60% burn waste (₹2,520/month)', confidence: 89.0, priority: 'HIGH', status: 'ACCEPTED', acceptedBy: 'Quality Head', machine: 'FRY-01' },
          { code: 'AIR-00008', engine: 'PRODUCTION_OPTIMIZER', type: 'MOVE_OPERATORS', title: 'Move OP-004 to LINE-NM-01 during FRY-01 recovery', desc: 'Vijay Patel has packing skills needed for Namkeen repackaging during downtime', rationale: 'OP-004 currently idle on LINE-KK-01 (PACK-03 in setup). LINE-NM-01 needs repacking support.', impact: 'Recover 30 min lost time', confidence: 78.0, priority: 'MEDIUM', status: 'IMPLEMENTED', implementedAt: '2026-07-09T14:30:00Z', actualImpact: 'Recovered 25 min' },
        ],
        aiEngines: [
          { engine: 'PRODUCTION_OPTIMIZER', status: 'ACTIVE', recommendations: 2, accuracy: 84.2 },
          { engine: 'PREDICTIVE_QUALITY', status: 'ACTIVE', recommendations: 0, accuracy: 91.5 },
          { engine: 'PREDICTIVE_MAINTENANCE', status: 'ACTIVE', recommendations: 1, accuracy: 92.0 },
          { engine: 'ENERGY_OPTIMIZER', status: 'ACTIVE', recommendations: 1, accuracy: 95.0 },
          { engine: 'ROOT_CAUSE_ANALYZER', status: 'ACTIVE', recommendations: 1, accuracy: 89.0 },
        ],
        summary: {
          totalRecommendations: 5, pending: 2, accepted: 2, implemented: 1, rejected: 0,
          avgConfidence: 88.3, totalImpactValue: '₹7,200/month savings + 4h downtime prevented',
          byType: [
            { type: 'REORDER_PRODUCTION', count: 1 },
            { type: 'SCHEDULE_MAINTENANCE', count: 1 },
            { type: 'OPTIMIZE_ENERGY', count: 1 },
            { type: 'REDUCE_WASTE', count: 1 },
            { type: 'MOVE_OPERATORS', count: 1 },
          ],
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'AI recommendations retrieved')), { headers })
    }

    // GET /api/mission-control/factory-health — Factory Health & Business Continuity
    if (path === '/api/mission-control/factory-health' && method === 'GET') {
      const data = {
        systems: [
          { name: 'MES Core', category: 'APPLICATION', status: 'HEALTHY', score: 99.8, responseMs: 124, uptime: 99.98, lastIncident: '2026-06-15' },
          { name: 'API Gateway', category: 'APPLICATION', status: 'HEALTHY', score: 100, responseMs: 45, uptime: 100, lastIncident: null },
          { name: 'IoT Gateway', category: 'INFRASTRUCTURE', status: 'HEALTHY', score: 98.5, responseMs: 89, uptime: 99.5, lastIncident: '2026-07-01' },
          { name: 'Database', category: 'INFRASTRUCTURE', status: 'HEALTHY', score: 99.9, responseMs: 12, uptime: 99.99, lastIncident: '2026-05-20' },
          { name: 'Production App', category: 'APPLICATION', status: 'HEALTHY', score: 99.5, responseMs: 234, uptime: 99.8, lastIncident: '2026-06-28' },
          { name: 'Warehouse Integration', category: 'INTEGRATION', status: 'HEALTHY', score: 99.0, responseMs: 156, uptime: 99.5, lastIncident: '2026-06-10' },
          { name: 'Network', category: 'INFRASTRUCTURE', status: 'HEALTHY', score: 100, responseMs: 8, uptime: 100, lastIncident: null },
          { name: 'Power', category: 'UTILITY', status: 'HEALTHY', score: 99.5, responseMs: null, uptime: 99.95, lastIncident: '2026-04-15' },
          { name: 'Backup', category: 'INFRASTRUCTURE', status: 'HEALTHY', score: 100, responseMs: null, uptime: 100, lastIncident: null },
        ],
        incidents: [
          { code: 'BCE-00003', system: 'IoT Gateway', type: 'DEGRADATION', desc: 'Gateway GW-THN-03 offline - firmware update needed', severity: 'WARNING', status: 'INVESTIGATING', detectedAt: '2026-07-09T12:45:00Z', downtimeMin: 105, failover: false },
        ],
        recoveryChecklist: [
          { step: 1, action: 'Verify IoT Gateway GW-THN-03 connectivity', status: 'COMPLETED', completedAt: '12:50' },
          { step: 2, action: 'Check firmware version compatibility', status: 'COMPLETED', completedAt: '12:55' },
          { step: 3, action: 'Schedule firmware update during low-traffic window', status: 'IN_PROGRESS', completedAt: null },
          { step: 4, action: 'Failover connections to GW-THN-01', status: 'PENDING', completedAt: null },
          { step: 5, action: 'Verify all device connections restored', status: 'PENDING', completedAt: null },
        ],
        summary: {
          totalSystems: 9, healthy: 9, degraded: 0, down: 0,
          avgUptime: 99.8, avgResponseMs: 96,
          activeIncidents: 1, resolvedToday: 2, avgResolutionMin: 45,
          failoverTriggered: 0, businessImpact: 'LOW',
        },
      }
      return new Response(JSON.stringify(successResponse(data, 'Factory health & business continuity')), { headers })
    }

    // GET /api/mission-control/scorecard — Executive Scorecard
    if (path === '/api/mission-control/scorecard' && method === 'GET') {
      const data = {
        scorecard: {
          scope: 'ENTERPRISE', name: 'Sudhamrit Foods', period: 'DAILY', date: '2026-07-09',
          overallStatus: 'GREEN',
          kpis: [
            { name: 'Production Achievement', value: 94.5, target: 95, status: 'YELLOW', unit: '%' },
            { name: 'OEE', value: 84.2, target: 85, status: 'YELLOW', unit: '%' },
            { name: 'Yield', value: 96.8, target: 97, status: 'GREEN', unit: '%' },
            { name: 'Scrap Rate', value: 0.55, target: 1.0, status: 'GREEN', unit: '%' },
            { name: 'Rework Rate', value: 0.2, target: 0.5, status: 'GREEN', unit: '%' },
            { name: 'Machine Utilization', value: 73.9, target: 80, status: 'YELLOW', unit: '%' },
            { name: 'Schedule Adherence', value: 92.0, target: 95, status: 'YELLOW', unit: '%' },
            { name: 'Labor Productivity', value: 87.9, target: 85, status: 'GREEN', unit: 'units/hr' },
            { name: 'Energy Cost', value: 14720, target: 15000, status: 'GREEN', unit: '₹' },
            { name: 'Manufacturing Cost', value: 184600, target: 180000, status: 'RED', unit: '₹' },
            { name: 'On-Time Completion', value: 88.0, target: 90, status: 'YELLOW', unit: '%' },
          ],
          plantRanking: [
            { rank: 1, plant: 'Thane Plant', oee: 84.2, yield: 96.8, scrap: 0.55, cost: 184600, onTime: 88.0, status: 'GREEN' },
          ],
          departmentRanking: [
            { rank: 1, dept: 'Sweets Department', oee: 86.3, yield: 99.4, scrap: 0.4, onTime: 92.0, status: 'GREEN' },
            { rank: 2, dept: 'Snacks Department', oee: 72.0, yield: 97.6, scrap: 0.8, onTime: 78.1, status: 'RED' },
          ],
        },
        trafficLights: { green: 5, yellow: 5, red: 1, total: 11 },
      }
      return new Response(JSON.stringify(successResponse(data, 'Executive scorecard')), { headers })
    }

    // GET /api/mission-control/executive — Executive Manufacturing Dashboard
    if (path === '/api/mission-control/executive' && method === 'GET') {
      const data = {
        scope: 'ENTERPRISE', name: 'Sudhamrit Foods', period: 'DAILY', date: '2026-07-09',
        factoryHealth: { score: 87.5, status: 'HEALTHY' },
        production: { totalQty: 1248, targetQty: 1320, achievement: 94.5, uom: 'KG' },
        oee: { availability: 93.5, performance: 91.2, quality: 98.8, oee: 84.2, target: 85.0 },
        yield: { avg: 96.8, target: 97.0, variance: -0.2 },
        scrap: { rate: 0.55, target: 1.0, trend: 'DECREASING' },
        cost: { total: 184600, perKg: 152.4, variancePct: 3.5, target: 180000 },
        machineAvailability: { percent: 93.5, running: 18, total: 24, faulted: 1 },
        onTimeProduction: { percent: 88.0, target: 90.0, delayedOrders: 1 },
        energy: { consumptionKwh: 1840, cost: 14720, costPerKg: 11.8 },
        alerts: { active: 2, critical: 1, acknowledged: 1 },
        plants: [
          { name: 'Thane Plant', oee: 84.2, yield: 96.8, scrap: 0.55, cost: 184600, onTime: 88.0, health: 87.5, status: 'HEALTHY' },
        ],
        highlights: [
          { type: 'CRITICAL', title: 'FRY-01 Fault - Production halted on Namkeen Line', impact: '70 KG lost output, ₹1,800 cost', action: 'Maintenance in progress' },
          { type: 'SUCCESS', title: 'Labor productivity exceeds target by 2.9%', impact: '87.9 units/hr vs 85 target', action: 'No action needed' },
          { type: 'WARNING', title: 'Manufacturing cost ₹4,600 over target', impact: '₹184,600 vs ₹180,000 target (3.5% variance)', action: 'Namkeen variance driving overrun - review FRY-01' },
          { type: 'INFO', title: 'OEE 84.2% - 0.8% below 85% target', impact: 'Slight miss due to FRY-01 fault', action: 'Monitor tomorrow' },
        ],
        reports: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'],
      }
      return new Response(JSON.stringify(successResponse(data, 'Executive manufacturing dashboard')), { headers })
    }

    // GET /api/mission-control/info — Sprint 47 info
    if (path === '/api/mission-control/info' && method === 'GET') {
      return new Response(JSON.stringify(successResponse({
        sprint: 47, sprintName: 'Enterprise Manufacturing Mission Control, Digital Factory & Production Command Center', version: '47.0.0', part: 5, tables: 8,
        epics: [
          'Manufacturing Mission Control (10 widgets, real-time, multi-plant, role-based)',
          'Enterprise Control Tower (enterprise → plant → dept → line → machine drill-down)',
          'Digital Factory Twin (hierarchical node tree, live status, WIP, operators)',
          'AI Manufacturing Operations Center (5 AI engines, 8 recommendation types)',
          'Production Alert Engine (9 alert types, 7 delivery channels, escalation)',
          'Business Continuity Dashboard (9 systems, incident timeline, recovery checklist)',
          'Executive Manufacturing Dashboard (enterprise aggregation, plant ranking)',
          'Enterprise Scorecard (11 KPIs, traffic lights GREEN/YELLOW/RED)',
          'Frontend (8 admin modules)',
          'Backend (8 API groups, 8 database models)',
        ],
        chiefArchitectRecommendation: 'Single Enterprise Operations Center with: Live Production Orders, Target vs Actual, OEE by Line, Machine Health, Quality Alerts, Raw Material Availability, Packaging Status, Warehouse Transfer, Energy Consumption, Active Maintenance WOs. From one screen: identify bottlenecks, quality risks, maintenance issues, inventory shortages without switching modules.',
        alertTypes: ['CRITICAL', 'WARNING', 'QUALITY', 'MACHINE', 'MATERIAL', 'MAINTENANCE', 'SAFETY', 'ENERGY', 'PRODUCTION_DELAY'],
        deliveryChannels: ['DASHBOARD', 'MOBILE_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'TEAMS', 'SLACK'],
        aiEngines: ['PRODUCTION_OPTIMIZER', 'PREDICTIVE_QUALITY', 'PREDICTIVE_MAINTENANCE', 'ENERGY_OPTIMIZER', 'ROOT_CAUSE_ANALYZER'],
        recommendationTypes: ['START_ADDITIONAL_SHIFT', 'MOVE_OPERATORS', 'CHANGE_MACHINE', 'REORDER_PRODUCTION', 'INCREASE_CAPACITY', 'REDUCE_WASTE', 'SCHEDULE_MAINTENANCE', 'OPTIMIZE_ENERGY'],
        scorecardKPIs: ['Production Achievement %', 'OEE %', 'Yield %', 'Scrap %', 'Rework %', 'Machine Utilization %', 'Schedule Adherence %', 'Labor Productivity', 'Energy Cost', 'Manufacturing Cost', 'On-Time Completion'],
        performanceTargets: { dashboardRefresh: '<3000 ms', alertDelivery: '<5000 ms', productionLines: 100, plants: 20, machineEventsPerMin: 10000 },
        endpoints: [
          'GET /api/mission-control',
          'GET /api/mission-control/control-tower',
          'GET /api/mission-control/digital-factory',
          'GET /api/mission-control/alerts',
          'GET /api/mission-control/ai',
          'GET /api/mission-control/factory-health',
          'GET /api/mission-control/scorecard',
          'GET /api/mission-control/executive',
          'GET /api/mission-control/info',
        ],
        part5Sprint: 14, part5Sprints: 15, totalProjectTables: 422,
      }, 'SUOP Manufacturing Mission Control v47.0.0')), { headers })
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

print(f"Inserted Sprint 47 endpoints. Old: {len(content)}, New: {len(new_content)}")

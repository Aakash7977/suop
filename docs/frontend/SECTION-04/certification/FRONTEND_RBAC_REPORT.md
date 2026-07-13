# Frontend RBAC Report

## Modules Updated (22 of 38)
22 modules have hasPermission() gating on create/action buttons:
- inventory, goods-receipt, stock-issue, stock-transfer, adjustment
- reservation, cycle-count, batch-expiry, costing, putaway
- fulfillment, wave-planning, workforce, equipment, exception-center
- cross-dock-console, dock-schedule, truck-queue, gate-console
- equipment-master, breakdown-console, certification-center

## Modules Without Buttons to Gate (16)
16 modules have no create/action buttons (read-only dashboards):
- receiving, dispatch, mission-control, control-tower, sla-dashboard
- task-queue, workforce-analytics, yard-map, vehicle-tracker
- yard-control-tower, cross-dock-analytics, forklift-dashboard
- scanner-management, battery-dashboard, maintenance-planner, equipment-analytics

## Permission Strings Used
All new domain-specific permissions from the approved catalog:
- inventory:stockin, inventory:stockout, inventory:transfer, inventory:adjust
- grn:create, putaway:create, putaway:complete
- pick:complete, wave:create, shipment:create
- batch:create, costing:create, costing:approve
- hr:create, eam:create, eam:maintenance
- quality:inspect, receiving:create, yard:checkin

Score: 9.0/10 (up from 7.0)

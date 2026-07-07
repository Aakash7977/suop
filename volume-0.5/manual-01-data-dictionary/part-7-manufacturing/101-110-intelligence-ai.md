# Manual 1 · Part 7 · Section 6 · Entities 101-110 — Manufacturing Intelligence, KPIs & AI

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 7 — Manufacturing Domain |
| Section | 6 — Manufacturing Intelligence, KPIs & AI |
| Entities | 101–110 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 14 §14.11, Ch 15 §15.6, Ch 24 §24.7 |
| Last Updated | 2026-07-07 |

---

## Overview — Manufacturing Intelligence Architecture

Section 6 transforms the MES into a **Manufacturing Intelligence Platform** by adding analytics, AI recommendations, predictive capabilities, digital twin, and the Factory Mission Control.

```
PRODUCTION DATA (Sections 1-5)
  ↓ Aggregated into
MANUFACTURING KPI (101) + DASHBOARDS (102) + ALERTS (103)
  ↓ Analyzed by
AI RECOMMENDATIONS (104) + PREDICTIVE MFG (105) + SIMULATION (106)
  ↓ Visualized via
DIGITAL FACTORY TWIN (107) + SCORECARDS (108) + BENCHMARKS (109)
  ↓ Consumed by
FACTORY MISSION CONTROL (110)
```

### Architectural Decisions (Locked)

| Decision | Value |
|---|---|
| **Manufacturing Intelligence Layer** | AI consumes production data to generate recommendations |
| **Digital Factory Twin** | Schema-ready for 3D visualization (per Ch 24 §24.7) |
| **Manufacturing Simulation** | What-if analysis for recipes, machines, shifts |
| **Factory Mission Control** | Real-time operational control room (per Ch 15 enhancement) |
| **AI Recommendation Engine** | Autonomous suggestions for optimization |
| **Predictive Manufacturing** | Forecasting for demand, capacity, yield, maintenance |
| **Enterprise KPI Library** | Standardized metrics (OEE, FPY, OTIF, etc.) |
| **Benchmark Framework** | Cross-plant, cross-line, cross-operator comparison |
| **Smart Factory readiness** | Industry 4.0 architecture (IoT, PLC, SCADA, OPC-UA, MQTT) |

---

## Entity 101 — Manufacturing KPI

### 1. Business Purpose
Stores standardized manufacturing KPIs (OEE, Yield, Waste %, Downtime, FPY, etc.) as part of the Enterprise KPI Library (per Ch 15 §15.5).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `kpi_code` | VARCHAR(30) | Yes | — | Unique per company | KPI code (e.g., `MFG_OEE`) | Internal |
| `kpi_name` | VARCHAR(100) | Yes | — | — | Display name | Public |
| `kpi_category` | ENUM | Yes | — | OEE, YIELD, WASTE, DOWNTIME, EFFICIENCY, LABOR, MACHINE, ENERGY, QUALITY, COST | Category | Internal |
| `formula` | TEXT | Yes | — | — | Calculation formula | Internal |
| `unit_of_measure` | VARCHAR(20) | Yes | — | — | UOM (%, count, hours) | Internal |
| `target_value` | DECIMAL(18,4) | Yes | — | — | Target | Internal |
| `current_value` | DECIMAL(18,4) | No | NULL | — | Latest value | Internal |
| `previous_value` | DECIMAL(18,4) | No | NULL | — | Previous period | Internal |
| `trend_direction` | ENUM | No | NULL | IMPROVING, STABLE, DECLINING | Trend | Internal |
| `facility_id` | UUID | No | NULL | FK to `facilities` | Scope (NULL = company) | Internal |
| `production_line_id` | UUID | No | NULL | FK to `production_lines` | Scope | Internal |

---

## Entity 102 — Production Dashboard

### 1. Business Purpose
Configuration for the Production Dashboard widgets (Live Production, Running Orders, Delayed Orders, Machines Running/Idle, Material Shortage, Today's Yield/Waste/OEE).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `dashboard_name` | VARCHAR(100) | Yes | — | — | Display name | Public |
| `dashboard_type` | ENUM | Yes | `REAL_TIME` | REAL_TIME, PERIODIC | Type | Internal |
| `widget_configuration` | JSONB | Yes | `'{}'` | — | Widget layout + data sources | Internal |
| `refresh_interval_sec` | INTEGER | Yes | `30` | > 0 | Refresh rate | Internal |
| `target_audience` | ENUM | Yes | `SUPERVISOR` | OPERATOR, SUPERVISOR, MANAGER, EXECUTIVE | Audience | Internal |
| `is_mission_control_enabled` | BOOLEAN | Yes | `false` | — | Shows on Mission Control | Internal |

---

## Entity 103 — Manufacturing Alert

### 1. Business Purpose
Real-time manufacturing alerts (Low Yield, Machine Breakdown, Operator Delay, QC Failure, Material Shortage, Temperature Deviation, Recipe Mismatch, Utility Failure).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `alert_code` | VARCHAR(30) | Yes | — | Unique | Alert code | Internal |
| `alert_type` | ENUM | Yes | — | LOW_YIELD, MACHINE_BREAKDOWN, OPERATOR_DELAY, QC_FAILURE, MATERIAL_SHORTAGE, TEMP_DEVIATION, RECIPE_MISMATCH, UTILITY_FAILURE | Type (per Part 7) | Internal |
| `severity` | ENUM | Yes | `HIGH` | CRITICAL, HIGH, MEDIUM, LOW | Priority (per Part 7) | Internal |
| `source_entity_type` | VARCHAR(30) | Yes | — | — | Source (e.g., `MACHINE`, `EXECUTION`) | Internal |
| `source_entity_id` | UUID | Yes | — | — | Source ID | Internal |
| `message` | TEXT | Yes | — | — | Alert message | Internal |
| `action_required` | TEXT | No | NULL | — | Recommended action | Internal |
| `is_acknowledged` | BOOLEAN | Yes | `false` | — | Ack flag | Internal |
| `acknowledged_by` | UUID | No | NULL | FK to `user_accounts` | Who ack'd | Internal |
| `resolved_at` | TIMESTAMPTZ | No | NULL | — | Resolution time | Internal |

---

## Entity 104 — Manufacturing Recommendation

### 1. Business Purpose
AI-generated suggestions for optimization (Increase Batch Size, Reduce Mixing Time, Change Machine, Use Alternative Ingredient, Reschedule Production, Reduce Utility Consumption).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `recommendation_code` | VARCHAR(30) | Yes | — | Unique | Code | Internal |
| `recommendation_type` | ENUM | Yes | — | BATCH_SIZE, PROCESS_TIME, MACHINE_CHANGE, INGREDIENT_SUB, RESCHEDULE, UTILITY_REDUCTION | Type (per Part 7) | Internal |
| `description` | TEXT | Yes | — | — | Recommendation details | Internal |
| `expected_impact` | JSONB | No | NULL | — | `{ "yield_pct": +2, "cost_pct": -3 }` | Confidential |
| `confidence_score` | DECIMAL(5,2) | Yes | — | 0-100 | AI confidence | Internal |
| `ai_model_id` | UUID | No | NULL | FK to `ai_models` | Source model | Internal |
| `status` | ENUM | Yes | `PENDING` | PENDING, ACCEPTED, REJECTED, IMPLEMENTED | Status | Internal |

---

## Entity 105 — Predictive Manufacturing

### 1. Business Purpose
Predictive forecasting for Demand, Capacity, Yield, Maintenance, Labor, and Inventory.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `prediction_type` | ENUM | Yes | — | DEMAND_FORECAST, CAPACITY_FORECAST, YIELD_FORECAST, MAINTENANCE_FORECAST, LABOR_FORECAST, INVENTORY_FORECAST | Type (per Part 7) | Internal |
| `target_entity_id` | UUID | No | NULL | — | Product/Machine/Line ID | Internal |
| `prediction_date` | DATE | Yes | — | — | Date of prediction | Internal |
| `predicted_value` | DECIMAL(18,4) | Yes | — | — | Predicted value | Internal |
| `confidence_lower` | DECIMAL(18,4) | No | NULL | — | Lower bound | Internal |
| `confidence_upper` | DECIMAL(18,4) | No | NULL | — | Upper bound | Internal |
| `ai_model_id` | UUID | Yes | — | FK to `ai_models` | Model used | Internal |
| `accuracy_pct` | DECIMAL(5,2) | No | NULL | — | Model accuracy | Internal |

---

## Entity 106 — Manufacturing Simulation

### 1. Business Purpose
Digital production simulation (Recipe Changes, Machine Changes, Labor Changes, Shift Changes, Demand Changes, Utility Costs).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `simulation_name` | VARCHAR(200) | Yes | — | — | Name | Internal |
| `simulation_type` | ENUM | Yes | — | RECIPE_CHANGE, MACHINE_CHANGE, LABOR_CHANGE, SHIFT_CHANGE, DEMAND_CHANGE, UTILITY_COST | Type (per Part 7) | Internal |
| `input_parameters` | JSONB | Yes | `'{}'` | — | Scenario inputs | Internal |
| `output_results` | JSONB | No | NULL | — | Simulated outcomes | Internal |
| `simulated_at` | TIMESTAMPTZ | Yes | `NOW()` | — | Run timestamp | Internal |

---

## Entity 107 — Digital Factory Twin

### 1. Business Purpose
Digital representation of the physical factory (Plant, Work Centers, Machines, Production Lines, Warehouse, Utilities). Supports real-time visualization, capacity simulation, and future planning.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Physical plant | Internal |
| `twin_model_file_id` | UUID | Yes | — | FK to `file_attachments` | 3D/2D model file | Internal |
| `model_version` | VARCHAR(20) | Yes | — | — | Model version | Internal |
| `real_time_data_feed` | BOOLEAN | Yes | `true` | — | Live IoT data feed | Internal |
| `iot_endpoint` | VARCHAR(200) | No | NULL | — | MQTT/WebSocket endpoint | Internal |
| `last_synced_at` | TIMESTAMPTZ | No | NULL | — | Last IoT sync | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Entity 108 — Manufacturing Scorecard

### 1. Business Purpose
Comprehensive performance measurement (OEE, FPY, OTIF, Cost, Waste, Energy, Labor, Machine).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `scorecard_date` | DATE | Yes | — | — | Date | Internal |
| `entity_type` | ENUM | Yes | — | FACILITY, LINE, SHIFT, MACHINE, OPERATOR | Scorecard target | Internal |
| `entity_id` | UUID | Yes | — | — | Target ID | Internal |
| `oee_score` | DECIMAL(5,2) | Yes | — | 0-100 | OEE | Internal |
| `fpy_pct` | DECIMAL(5,2) | Yes | — | 0-100 | First Pass Yield | Internal |
| `otif_pct` | DECIMAL(5,2) | Yes | — | 0-100 | On-Time In-Full | Internal |
| `cost_variance_pct` | DECIMAL(5,2) | Yes | — | — | Cost variance | Confidential |
| `waste_pct` | DECIMAL(5,2) | Yes | — | 0-100 | Waste % | Internal |
| `energy_per_batch` | DECIMAL(18,4) | Yes | — | ≥ 0 | Energy usage | Internal |
| `overall_grade` | ENUM | Yes | — | A, B, C, D, F | Letter grade | Internal |

---

## Entity 109 — Manufacturing Benchmark

### 1. Business Purpose
Comparison framework (Plant vs Plant, Shift vs Shift, Line vs Line, Machine vs Machine, Recipe vs Recipe, Operator vs Operator).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `benchmark_name` | VARCHAR(200) | Yes | — | — | Name | Internal |
| `benchmark_type` | ENUM | Yes | — | PLANT_VS_PLANT, SHIFT_VS_SHIFT, LINE_VS_LINE, MACHINE_VS_MACHINE, RECIPE_VS_RECIPE, OPERATOR_VS_OPERATOR | Type (per Part 7) | Internal |
| `metric_code` | VARCHAR(30) | Yes | — | FK to `manufacturing_kpis` | Compared metric | Internal |
| `entity_ids` | UUID[] | Yes | — | — | Entities compared | Internal |
| `results` | JSONB | Yes | `'{}'` | — | Comparison results | Internal |
| `best_entity_id` | UUID | No | NULL | — | Top performer | Internal |

---

## Entity 110 — Factory Mission Control

### 1. Business Purpose
Enterprise control room display configuration. Displays Live Orders, Live Machines, Quality Status, Warehouse Status, Inventory, Alerts, AI Insights, KPIs. This is the manufacturing-specific extension of the Enterprise Mission Control Room (per Ch 15 enhancement).

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `control_room_name` | VARCHAR(100) | Yes | — | — | Display name | Public |
| `facility_id` | UUID | Yes | — | FK to `facilities` | Monitored plant | Internal |
| `view_configuration` | JSONB | Yes | `'{}'` | — | Widget layout for control room | Internal |
| `display_duration_sec` | INTEGER | Yes | `30` | > 0 | Rotation interval | Internal |
| `is_live` | BOOLEAN | Yes | `true` | — | Real-time data flag | Internal |
| `websocket_endpoint` | VARCHAR(200) | No | NULL | — | Live data endpoint | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |

---

## Part 7 Completion Summary

**Part 7 (Manufacturing Domain) is now COMPLETE** with 60 entities (051–110) across 6 sections.

### Key Achievements

1. **Complete Manufacturing Execution System (MES)** — From planning to execution to output
2. **Recipe & BOM Management** — Versioned, immutable, QA-approved (food safety)
3. **Full Genealogy & Traceability** — Supplier → PO → GRN → Batch → Recipe → FG → Customer
4. **Manufacturing Command Center** — Real-time operational visibility
5. **Industry 4.0 Ready** — IoT, PLC, SCADA, OPC-UA, MQTT, Vision Inspection, AGV
6. **Manufacturing Intelligence** — AI recommendations, predictive maintenance, digital twin
7. **Complete Production Accounting** — Every gram tracked (FG, SF, ByP, CoP, Waste, Scrap)
8. **OEE Integration** — Standard Availability × Performance × Quality
9. **Factory Mission Control** — Enterprise control room for manufacturing
10. **Recipe Simulation Engine** — Schema-ready for what-if analysis

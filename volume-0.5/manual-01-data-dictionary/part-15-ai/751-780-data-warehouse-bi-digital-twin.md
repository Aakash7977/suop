# Manual 1 · Part 15 · Sections 4-6 · Entities 751-780 — Data Warehouse, BI & Digital Twin

## Document Metadata

| Attribute | Value |
|---|---|
| Manual | 1 — Enterprise Data Dictionary |
| Part | 15 — Enterprise AI, Analytics & Mission Control Platform (EAMP) |
| Sections | 4 (Enterprise Data Warehouse, Data Lake & Analytics Platform), 5 (Business Intelligence, KPI Framework & Predictive Analytics), 6 (Digital Twin, Simulation & Enterprise Forecasting) |
| Entities | 751–780 |
| Version | 1.0.0 |
| Status | ACTIVE — LOCKED |
| Owner | Enterprise Architect |
| Source Authority | Volume 0 Ch 9 §9.10, Part 15 §4-6 |
| Last Updated | 2026-07-08 |
| Importance | **CRITICAL — Enterprise Intelligence Platform powering every dashboard, KPI, prediction, and executive decision** |

---

## Overview — Enterprise Intelligence Platform

Sections 4-6 build the **Enterprise Intelligence Platform** that powers every dashboard, KPI, prediction, and executive decision across SUOP.

```
DATA WAREHOUSE & LAKE (Sec 4: 751-760)
  ERP Modules → Event Bus → ETL/ELT → Data Lake → Data Warehouse → Analytics Cube → BI → AI
  ↑ Powers
BI & PREDICTIVE ANALYTICS (Sec 5: 761-770)
  Data Warehouse → KPI Engine → Analytics Engine → Dashboards → Mission Control → Executives
  ↑ Simulated via
DIGITAL TWIN & FORECASTING (Sec 6: 771-780)
  ERP Data + IoT → Simulation Engine → Digital Twin → Forecast → Decision → Execution
```

### 🏆 Architectural Lock: Enterprise Decision Intelligence Engine (Q194)

Per Chief Enterprise Architect recommendation, the **Enterprise Decision Intelligence Engine** is hereby locked as **Architectural Decision Q194** and **Foundation Service #55**. This engine sits **above** the BI and Forecasting layers, elevating SUOP from a reporting platform into an **Enterprise Decision Intelligence Platform**.

**Problem Solved**: Move leadership from reactive reporting to proactive, data-driven decision-making by combining analytics, forecasts, and simulations into actionable recommendations.

**Locked Architecture**:
```
Data Warehouse ─┐
BI Engine ──────┤
Forecast Engine ─┤
Simulation Engine ─┴──► Decision Intelligence Engine (FS-55, Q194)
                          │
                          ├─► Risk Analysis
                          ├─► Impact Analysis
                          ├─► Recommendations (with confidence scores)
                          ├─► Executive Decisions
                          └─► Mission Control
```

**Engine Responsibilities (Locked)**:
1. **Combine** historical analytics, live operational data, and AI forecasts
2. **Compare** multiple business scenarios before recommending actions
3. **Estimate** financial and operational impact for each recommendation
4. **Assign** confidence scores to predictions
5. **Feed** approved recommendations into workflows for execution
6. **Maintain** complete audit trail of AI-assisted decision making

**Architectural Benefits (Locked)**:
1. Elevates SUOP beyond reporting into **Enterprise Decision Intelligence Platform**
2. Leadership moves from **reactive** to **proactive** data-driven decision-making
3. Unified scenario comparison with quantified impact
4. AI-assisted recommendations with confidence and auditability
5. Closed loop: Decision → Workflow → Execution → Outcome tracking
6. Single source of truth for executive decisions

**Governance**: Owned by Platform Kernel team (per Q189/Q192). Business modules and executives call `DecisionIntelligenceEngine.recommend(context)` — they never manually correlate BI, forecasts, and simulations independently.

---

# SECTION 4: Enterprise Data Warehouse, Data Lake & Analytics Platform (Entities 751-760)

## Entity 751 — Data Lake

### 1. Business Purpose
Per Part 15 §4: Stores Raw ERP Data, IoT Data, Log Files, Images, Documents, Sensor Data. Centralized raw data storage.

### 2. Architectural Role
**Foundational data lake entity** — per Vol 0: "Operational databases are optimized for transactions. Analytics requires a separate platform." Data Lake stores raw, unstructured, and semi-structured data before transformation.

### 3. Business Rules
- Data types: STRUCTURED (ERP tables), SEMI_STRUCTURED (JSON, XML), UNSTRUCTURED (documents, images, logs), STREAMING (IoT, events)
- Storage tiers: HOT (frequently accessed), WARM (occasional), COLD (rarely accessed), ARCHIVE (long-term)
- Schema-on-read: data stored as-is; schema applied when read
- Append-only: raw data never modified (immutability principle)
- Retention: per data governance policy (typically 7+ years for compliance)
- Partitioning: by date, source, data type for query performance

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `data_lake_code` | VARCHAR(50) | Yes | — | Unique per company | Code | Internal |
| `data_lake_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `data_lake_description` | TEXT | No | NULL | — | Description | Internal |
| `storage_provider` | ENUM | Yes | `S3` | S3, AZURE_BLOB, GCP_STORAGE, MINIO, HDFS, LOCAL | Provider | Internal |
| `storage_endpoint` | VARCHAR(500) | Yes | — | — | Endpoint | Confidential |
| `storage_config_encrypted` | TEXT | Yes | — | — | Encrypted config | Restricted |
| `encryption_key_id` | UUID | Yes | — | FK to `security_keys` | Key | Restricted |
| `storage_tier_default` | ENUM | Yes | `HOT` | HOT, WARM, COLD, ARCHIVE | Default tier | Internal |
| `total_storage_used_gb` | DECIMAL(12,2) | Yes | `0` | ≥ 0 | Used | Internal |
| `storage_quota_gb` | DECIMAL(12,2) | Yes | `10000.00` | ≥ 1 | Quota | Confidential |
| `storage_utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Utilization | Internal |
| `storage_by_tier` | JSONB | Yes | `'{}'` | — | { HOT, WARM, COLD, ARCHIVE } | Internal |
| `storage_by_data_type` | JSONB | Yes | `'{}'` | — | By type | Internal |
| `storage_by_source` | JSONB | Yes | `'{}'` | — | By source | Internal |
| `total_objects_count` | BIGINT | Yes | `0` | ≥ 0 | Objects | Internal |
| `data_sources_ingested` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | ERP_DATA (per Part 15), IoT_DATA (per Part 15), LOG_FILES (per Part 15), IMAGES (per Part 15), DOCUMENTS (per Part 15), SENSOR_DATA (per Part 15), STREAMING_EVENTS, EXTERNAL_API, THIRD_PARTY | Sources | Internal |
| `ingestion_frequency` | ENUM | Yes | `REAL_TIME` | REAL_TIME, NEAR_REAL_TIME, HOURLY, DAILY, BATCH | Frequency | Internal |
| `ingestion_lag_seconds` | INTEGER | Yes | `0` | ≥ 0 | Lag | Internal |
| `last_ingestion_at` | TIMESTAMPTZ | No | NULL | — | Last | Internal |
| `data_formats_supported` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | PARQUET, AVRO, ORC, JSON, CSV, ORC, BINARY, CUSTOM | Formats | Internal |
| `compression_enabled` | BOOLEAN | Yes | `true` | — | Compressed | Internal |
| `compression_algorithm` | VARCHAR(20) | Yes | `SNAPPY` | SNAPPY, GZIP, LZ4, ZSTD, NONE | Algorithm | Internal |
| `encryption_at_rest` | BOOLEAN | Yes | `true` | — | Encrypted | Internal |
| `encryption_in_transit` | BOOLEAN | Yes | `true` | — | TLS | Internal |
| `versioning_enabled` | BOOLEAN | Yes | `true` | — | Object versioning | Internal |
| `lifecycle_policies` | JSONB | Yes | `'[]'` | — | Tier transition rules | Internal |
| `data_catalog_id` | UUID | No | NULL | FK to `metadata_catalog` (Entity 755) | Catalog | Internal |
| `governance_policy_id` | UUID | No | NULL | FK to `data_governance` (Entity 759) | Governance | Internal |
| `storage_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `USD` | — | Currency | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, MAINTENANCE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| ETL Pipeline (753) | One-to-Many | 1:N | Pipelines ingesting |
| Metadata Catalog (755) | One-to-One | 1:1 | Catalog |
| Data Governance (759) | Many-to-One | N:1 | Governance |
| Data Warehouse (752) | One-to-One | 1:1 | Downstream warehouse |

### 6. Indexes
- UNIQUE (`data_lake_code`)
- INDEX (`storage_provider`, `status`)
- INDEX (`storage_tier_default`)

### 7. Security Classification
**Confidential** — endpoint and config are **Restricted**.

### 8. Integration Points
- **Event Bus** (FS-49): Streaming ingestion
- **ETL Pipeline** (Entity 753): Batch ingestion
- **Data Warehouse** (Entity 752): Source for transformation
- **Metadata Catalog** (Entity 755): Metadata management
- **All Business Modules**: Data sources

### 9. Sample Data
```json
{
  "data_lake_code": "DL-SUOP-001", "data_lake_name": "SUOP Enterprise Data Lake",
  "storage_provider": "S3", "storage_tier_default": "HOT",
  "total_storage_used_gb": 4500.00, "storage_quota_gb": 10000.00,
  "storage_utilization_pct": 45.00,
  "storage_by_tier": { "HOT": 1500, "WARM": 2000, "COLD": 800, "ARCHIVE": 200 },
  "data_sources_ingested": ["ERP_DATA", "IOT_DATA", "LOG_FILES", "IMAGES", "DOCUMENTS", "SENSOR_DATA"],
  "ingestion_frequency": "NEAR_REAL_TIME", "ingestion_lag_seconds": 30,
  "data_formats_supported": ["PARQUET", "AVRO", "JSON", "CSV"],
  "compression_algorithm": "SNAPPY", "encryption_at_rest": true,
  "versioning_enabled": true, "status": "ACTIVE"
}
```

### 10. Audit Events
`DATA_LAKE_CREATED`, `DATA_LAKE_INGESTION_STARTED`, `DATA_LAKE_INGESTION_COMPLETED`, `DATA_LAKE_TIER_TRANSITION`, `DATA_LAKE_QUOTA_EXCEEDED`, `DATA_LAKE_LIFECYCLE_POLICY_EXECUTED`

---

## Entity 752 — Data Warehouse

### 1. Business Purpose
Per Part 15 §4: Stores Clean Data, Historical Data, Aggregated Data, Star Schemas. Enterprise data warehouse.

### 2. Architectural Role
OLAP warehouse entity — structured, cleaned, aggregated data for analytics. Per Vol 0 three-tier architecture (Journal → GL → Finance Cube pattern extended enterprise-wide).

### 3. Business Rules
- Schema types: STAR_SCHEMA (fact + dimensions), SNOWFLAKE (normalized dimensions), GALAXY (multiple fact tables), HYBRID
- Layers: STAGING (raw), ODS (operational data store), CORE (integrated), MARTS (subject-specific)
- Slowly Changing Dimensions (SCD): Type 1 (overwrite), Type 2 (history), Type 3 (limited history)
- Partitioning: by date for performance
- Materialized views: pre-aggregated for fast queries
- Incremental loading: delta loads for efficiency

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `warehouse_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `warehouse_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `warehouse_description` | TEXT | No | NULL | — | Description | Internal |
| `warehouse_type` | ENUM | Yes | `ENTERPRISE` | ENTERPRISE, DATA_MART, ODS, HYBRID | Type | Internal |
| `database_engine` | ENUM | Yes | `SNOWFLAKE` | SNOWFLAKE, BIGQUERY, REDSHIFT, DATABRICKS, POSTGRES, SQL_SERVER, ORACLE, CLICKHOUSE | Engine | Internal |
| `engine_version` | VARCHAR(20) | Yes | — | — | Version | Internal |
| `connection_endpoint` | VARCHAR(500) | Yes | — | — | Endpoint | Confidential |
| `connection_config_encrypted` | TEXT | Yes | — | — | Encrypted | Restricted |
| `encryption_key_id` | UUID | Yes | — | FK to `security_keys` | Key | Restricted |
| `schema_type` | ENUM | Yes | `STAR_SCHEMA` | STAR_SCHEMA, SNOWFLAKE, GALAXY, HYBRID (per Part 15) | Schema | Internal |
| `layers` | JSONB | Yes | `'[]'` | — | [{ layer, description, table_count }] | Internal |
| `total_tables_count` | INTEGER | Yes | `0` | ≥ 0 | Tables | Internal |
| `fact_tables_count` | INTEGER | Yes | `0` | ≥ 0 | Facts | Internal |
| `dimension_tables_count` | INTEGER | Yes | `0` | ≥ 0 | Dimensions | Internal |
| `materialized_views_count` | INTEGER | Yes | `0` | ≥ 0 | Mat views | Internal |
| `total_storage_used_gb` | DECIMAL(12,2) | Yes | `0` | ≥ 0 | Storage | Internal |
| `total_rows_count` | BIGINT | Yes | `0` | ≥ 0 | Rows | Internal |
| `historical_data_years` | INTEGER | Yes | `7` | ≥ 1 | History (per Part 15: "Historical Data") | Internal |
| `incremental_loading_enabled` | BOOLEAN | Yes | `true` | — | Incremental | Internal |
| `last_load_at` | TIMESTAMPTZ | No | NULL | — | Last load | Internal |
| `load_frequency` | ENUM | Yes | `HOURLY` | REAL_TIME, EVERY_5_MINUTES, HOURLY, DAILY, BATCH | Frequency | Internal |
| `load_lag_seconds` | INTEGER | Yes | `0` | ≥ 0 | Lag | Internal |
| `scd_strategy_default` | ENUM | Yes | `SCD_TYPE_2` | SCD_TYPE_1, SCD_TYPE_2, SCD_TYPE_3, SCD_TYPE_6 | SCD | Internal |
| `partitioning_strategy` | JSONB | Yes | `'{}'` | — | Partition config | Internal |
| `indexing_strategy` | JSONB | Yes | `'{}'` | — | Index config | Internal |
| `query_avg_latency_ms` | INTEGER | Yes | `0` | ≥ 0 | Avg latency | Internal |
| `queries_per_second` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | QPS | Internal |
| `concurrent_queries_max` | INTEGER | Yes | `50` | ≥ 1 | Max concurrent | Internal |
| `data_quality_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Quality | Internal |
| `encryption_at_rest` | BOOLEAN | Yes | `true` | — | Encrypted | Internal |
| `high_availability` | BOOLEAN | Yes | `true` | — | HA | Internal |
| `disaster_recovery_enabled` | BOOLEAN | Yes | `true` | — | DR | Internal |
| `backup_frequency_hours` | INTEGER | Yes | `24` | ≥ 1 | Backup | Internal |
| `backup_retention_days` | INTEGER | Yes | `30` | ≥ 1 | Retention | Internal |
| `storage_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `USD` | — | Currency | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, MAINTENANCE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Data Lake (751) | Many-to-One | N:1 | Source |
| ETL Pipeline (753) | One-to-Many | 1:N | Loading pipelines |
| Analytics Cube (756) | One-to-Many | 1:N | Cubes built on warehouse |
| Metadata Catalog (755) | One-to-One | 1:1 | Catalog |

### 6. Indexes
- UNIQUE (`warehouse_code`)
- INDEX (`warehouse_type`, `status`)
- INDEX (`database_engine`)

### 7. Security Classification
**Confidential** — connection config is **Restricted**.

### 8. Integration Points
- **ETL Pipeline** (Entity 753): Data loading
- **Analytics Cube** (Entity 756): Cube building
- **BI Platform** (Sec 5): Query source
- **All Dashboards**: Data source

### 9. Sample Data
```json
{
  "warehouse_code": "DWH-SUOP-001", "warehouse_name": "SUOP Enterprise Data Warehouse",
  "warehouse_type": "ENTERPRISE", "database_engine": "SNOWFLAKE",
  "schema_type": "STAR_SCHEMA",
  "layers": [
    { "layer": "STAGING", "table_count": 145 },
    { "layer": "ODS", "table_count": 120 },
    { "layer": "CORE", "table_count": 85 },
    { "layer": "MARTS", "table_count": 35 }
  ],
  "total_tables_count": 385, "fact_tables_count": 25, "dimension_tables_count": 60,
  "materialized_views_count": 45, "total_storage_used_gb": 1200.00,
  "historical_data_years": 7, "incremental_loading_enabled": true,
  "load_frequency": "HOURLY", "load_lag_seconds": 300,
  "scd_strategy_default": "SCD_TYPE_2", "data_quality_score": 96.50,
  "status": "ACTIVE"
}
```

### 10. Audit Events
`DATA_WAREHOUSE_CREATED`, `DATA_LOAD_STARTED`, `DATA_LOAD_COMPLETED`, `DATA_LOAD_FAILED`, `SCHEMA_CHANGED`, `MATERIALIZED_VIEW_REFRESHED`, `PARTITION_ADDED`, `DATA_WAREHOUSE_OPTIMIZED`

---

## Entity 753 — ETL Pipeline

### 1. Business Purpose
Per Part 15 §4: Supports Extract, Transform, Load, Validation, Incremental Sync. Data pipeline management.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `pipeline_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `pipeline_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `pipeline_description` | TEXT | No | NULL | — | Description | Internal |
| `pipeline_type` | ENUM | Yes | `ETL` | ETL (per Part 15), ELT, CDC, STREAMING, BATCH | Type | Internal |
| `source_type` | ENUM | Yes | — | DATABASE, DATA_LAKE, API, FILE, MESSAGE_QUEUE, STREAM, ERP_MODULE | Source | Internal |
| `source_config` | JSONB | Yes | `'{}'` | — | Source config | Confidential |
| `source_data_lake_id` | UUID | No | NULL | FK to `data_lake` (Entity 751) | Source lake | Internal |
| `target_type` | ENUM | Yes | — | DATA_WAREHOUSE, DATA_LAKE, DATABASE, FILE, API | Target | Internal |
| `target_config` | JSONB | Yes | `'{}'` | — | Target config | Confidential |
| `target_warehouse_id` | UUID | No | NULL | FK to `data_warehouse` (Entity 752) | Target warehouse | Internal |
| `transformation_steps` | JSONB | Yes | `'[]'` | — | Transform (per Part 15) steps | Confidential |
| `validation_rules` | JSONB | Yes | `'[]'` | — | Validation (per Part 15) | Confidential |
| `incremental_sync_enabled` | BOOLEAN | Yes | `true` | — | Incremental Sync (per Part 15) | Internal |
| `incremental_strategy` | ENUM | Yes | `TIMESTAMP_BASED` | TIMESTAMP_BASED, CDC, TRIGGER_BASED, VERSION_BASED, HYBRID | Strategy | Internal |
| `incremental_watermark` | JSONB | No | NULL | — | Watermark | Internal |
| `full_refresh_frequency` | ENUM | No | NULL | WEEKLY, MONTHLY, QUARTERLY, YEARLY, NEVER | Full refresh | Internal |
| `last_full_refresh_at` | TIMESTAMPTZ | No | NULL | — | Last full | Internal |
| `extract_method` | ENUM | Yes | `INCREMENTAL` | FULL, INCREMENTAL, CDC, STREAMING | Extract (per Part 15) | Internal |
| `load_method` | ENUM | Yes | `UPSERT` | INSERT, UPSERT, MERGE, TRUNCATE_AND_LOAD, APPEND | Load (per Part 15) | Internal |
| `schedule_type` | ENUM | Yes | `CRON` | CRON, EVENT_DRIVEN, CONTINUOUS, ON_DEMAND | Schedule | Internal |
| `cron_expression` | VARCHAR(100) | No | NULL | — | Cron | Internal |
| `last_run_at` | TIMESTAMPTZ | No | NULL | — | Last run | Internal |
| `last_run_status` | ENUM | No | NULL | SUCCESS, PARTIAL_SUCCESS, FAILED, RUNNING | Status | Internal |
| `last_run_duration_seconds` | INTEGER | No | NULL | ≥ 0 | Duration | Internal |
| `last_run_records_extracted` | BIGINT | No | NULL | ≥ 0 | Extracted | Internal |
| `last_run_records_loaded` | BIGINT | No | NULL | ≥ 0 | Loaded | Internal |
| `last_run_records_rejected` | BIGINT | No | NULL | ≥ 0 | Rejected | Internal |
| `total_runs_count` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `successful_runs_count` | BIGINT | Yes | `0` | ≥ 0 | Success | Internal |
| `failed_runs_count` | BIGINT | Yes | `0` | ≥ 0 | Failed | Internal |
| `success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Rate | Internal |
| `avg_duration_seconds` | INTEGER | Yes | `0` | ≥ 0 | Avg | Internal |
| `retry_policy_id` | UUID | No | NULL | FK to `retry_policy` (Entity 707) | Retry | Internal |
| `max_retries` | INTEGER | Yes | `3` | ≥ 0 | Max | Internal |
| `error_handling` | JSONB | Yes | `'{}'` | — | Error config | Confidential |
| `notification_on_failure` | BOOLEAN | Yes | `true` | — | Notify | Internal |
| `notification_recipients` | UUID[] | No | `ARRAY[]::UUID[]` | — | Recipients | Confidential |
| `lineage_id` | UUID | No | NULL | FK to `data_lineage` (Entity 754) | Lineage | Internal |
| `data_quality_check_enabled` | BOOLEAN | Yes | `true` | — | DQ check | Internal |
| `data_quality_engine_id` | UUID | No | NULL | FK to `data_quality_engine` (Entity 758) | DQ | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, PAUSED, ERROR | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 754 — Data Lineage

### 1. Business Purpose
Per Part 15 §4: Tracks Source, Transformation, Destination, Timestamp, Owner. Data lineage tracking.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `lineage_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `lineage_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `entity_type` | ENUM | Yes | — | TABLE, COLUMN, REPORT, DASHBOARD, KPI, PIPELINE, API, FILE | Type | Internal |
| `source_system` | VARCHAR(200) | Yes | — | — | Source (per Part 15) system | Internal |
| `source_entity` | VARCHAR(500) | Yes | — | — | Source entity (table/column) | Internal |
| `source_data_lake_id` | UUID | No | NULL | FK to `data_lake` | Source lake | Internal |
| `transformation_logic` | TEXT | No | NULL | — | Transformation (per Part 15) | Confidential |
| `transformation_steps` | JSONB | Yes | `'[]'` | — | Step-by-step | Confidential |
| `destination_system` | VARCHAR(200) | Yes | — | — | Destination (per Part 15) system | Internal |
| `destination_entity` | VARCHAR(500) | Yes | — | — | Destination entity | Internal |
| `destination_warehouse_id` | UUID | No | NULL | FK to `data_warehouse` | Target warehouse | Internal |
| `pipeline_id` | UUID | No | NULL | FK to `etl_pipeline` (Entity 753) | Pipeline | Internal |
| `owner_identity_id` | UUID | Yes | — | FK to `identity_master` | Owner (per Part 15) | Confidential |
| `owner_department_id` | UUID | No | NULL | FK to `departments` | Owner dept | Internal |
| `lineage_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Timestamp (per Part 15) | Internal |
| `upstream_lineage_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Upstream | Internal |
| `downstream_lineage_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | Downstream | Internal |
| `lineage_graph` | JSONB | Yes | `'{}'` | — | Full graph | Internal |
| `impact_analysis` | JSONB | No | NULL | — | Downstream impact | Confidential |
| `root_cause_analysis` | JSONB | No | NULL | — | Upstream root | Confidential |
| `last_modified_at` | TIMESTAMPTZ | Yes | `now()` | — | Modified | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 755 — Metadata Catalog

### 1. Business Purpose
Per Part 15 §4: Stores Tables, Columns, Business Definitions, Owners, Sensitivity. Enterprise metadata catalog.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `catalog_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `catalog_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `catalog_type` | ENUM | Yes | `TECHNICAL` | TECHNICAL, BUSINESS, OPERATIONAL, COMPOSITE | Type | Internal |
| `cataloged_assets` | JSONB | Yes | `'[]'` | — | Assets | Internal |
| `total_tables` | INTEGER | Yes | `0` | ≥ 0 | Tables (per Part 15) | Internal |
| `total_columns` | INTEGER | Yes | `0` | ≥ 0 | Columns (per Part 15) | Internal |
| `total_business_definitions` | INTEGER | Yes | `0` | ≥ 0 | Business Definitions (per Part 15) | Internal |
| `business_glossary` | JSONB | Yes | `'[]'` | — | [{ term, definition, owner }] | Confidential |
| `data_stewards` | JSONB | Yes | `'[]'` | — | [{ table, steward_id }] | Confidential |
| `owners` | JSONB | Yes | `'[]'` | — | Owners (per Part 15) — [{ table, owner_id, department_id }] | Confidential |
| `sensitivity_classifications` | JSONB | Yes | `'[]'` | — | Sensitivity (per Part 15) — [{ table, column, classification }] | Confidential |
| `data_classifications` | JSONB | Yes | `'{}'` | — | By classification | Confidential |
| `pii_fields_count` | INTEGER | Yes | `0` | ≥ 0 | PII | Confidential |
| `pci_fields_count` | INTEGER | Yes | `0` | ≥ 0 | PCI | Confidential |
| `phi_fields_count` | INTEGER | Yes | `0` | ≥ 0 | PHI | Confidential |
| `tags` | JSONB | Yes | `'[]'` | — | Tags | Internal |
| `custom_attributes` | JSONB | Yes | `'{}'` | — | Custom | Internal |
| `search_enabled` | BOOLEAN | Yes | `true` | — | Searchable | Internal |
| `api_access_enabled` | BOOLEAN | Yes | `true` | — | API access | Internal |
| `lineage_integration_enabled` | BOOLEAN | Yes | `true` | — | Lineage | Internal |
| `quality_integration_enabled` | BOOLEAN | Yes | `true` | — | Quality | Internal |
| `governance_integration_enabled` | BOOLEAN | Yes | `true` | — | Governance | Internal |
| `last_cataloged_at` | TIMESTAMPTZ | Yes | `now()` | — | Last | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 756 — Analytics Cube

### 1. Business Purpose
Per Part 15 §4: Supports Dimensions, Measures, Time Intelligence, Hierarchies, Drill Down. OLAP analytics cubes.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `cube_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `cube_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `cube_description` | TEXT | No | NULL | — | Description | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `cube_type` | ENUM | Yes | `OLAP` | OLAP, TABULAR, STAR_SCHEMA, SNOWFLAKE, HYBRID | Type | Internal |
| `data_source_warehouse_id` | UUID | Yes | — | FK to `data_warehouse` (Entity 752) | Source | Internal |
| `dimensions` | JSONB | Yes | `'[]'` | — | Dimensions (per Part 15) — [{ name, type, hierarchy, members, source_column }] | Internal |
| `measures` | JSONB | Yes | `'[]'` | — | Measures (per Part 15) — [{ name, type, aggregation, formula, source_column }] | Confidential |
| `time_intelligence` | JSONB | Yes | `'{}'` | — | Time Intelligence (per Part 15) — YTD, MTD, QTD, YoY, MoM | Internal |
| `hierarchies` | JSONB | Yes | `'[]'` | — | Hierarchies (per Part 15) — [{ name, levels }] | Internal |
| `drill_down_config` | JSONB | Yes | `'[]'` | — | Drill Down (per Part 15) — paths | Internal |
| `calculated_members` | JSONB | Yes | `'[]'` | — | Calculated | Confidential |
| `kpi_definitions` | JSONB | Yes | `'[]'` | — | KPIs | Confidential |
| `aggregations_precomputed` | JSONB | Yes | `'[]'` | — | Pre-aggregated | Internal |
| `partitions` | JSONB | Yes | `'[]'` | — | Partitions | Internal |
| `grain` | VARCHAR(100) | Yes | — | — | Grain | Internal |
| `time_granularity` | ENUM | Yes | `DAILY` | HOURLY, DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY | Time | Internal |
| `data_refresh_frequency` | ENUM | Yes | `HOURLY` | REAL_TIME, EVERY_5_MINUTES, HOURLY, DAILY | Refresh | Internal |
| `last_refresh_at` | TIMESTAMPTZ | No | NULL | — | Last | Internal |
| `last_refresh_duration_ms` | INTEGER | Yes | `0` | ≥ 0 | Duration | Internal |
| `total_records` | BIGINT | Yes | `0` | ≥ 0 | Records | Internal |
| `storage_size_gb` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Size | Internal |
| `query_avg_latency_ms` | INTEGER | Yes | `0` | ≥ 0 | Latency | Internal |
| `queries_per_second` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | QPS | Internal |
| `cache_enabled` | BOOLEAN | Yes | `true` | — | Cache | Internal |
| `cache_ttl_seconds` | INTEGER | Yes | `300` | ≥ 0 | TTL | Internal |
| `access_permissions` | JSONB | Yes | `'[]'` | — | Permissions | Confidential |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, REFRESHING | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 757 — Snapshot Engine

### 1. Business Purpose
Per Part 15 §4: Creates Daily, Weekly, Monthly, Yearly, Historical Snapshots. Point-in-time data snapshots.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `snapshot_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `snapshot_type` | ENUM | Yes | — | DAILY (per Part 15), WEEKLY (per Part 15), MONTHLY (per Part 15), YEARLY (per Part 15), HISTORICAL_SNAPSHOTS (per Part 15), ON_DEMAND | Type | Internal |
| `source_entity_type` | VARCHAR(100) | Yes | — | — | Source type | Internal |
| `source_entity_id` | UUID | Yes | — | — | Source ID | Internal |
| `source_table` | VARCHAR(200) | Yes | — | — | Table | Internal |
| `target_storage_location` | VARCHAR(500) | Yes | — | — | Storage | Confidential |
| `snapshot_timestamp` | TIMESTAMPTZ | Yes | `now()` | — | Snapshot time | Internal |
| `snapshot_period` | VARCHAR(50) | Yes | — | — | Period (e.g., 2026-07-08) | Internal |
| `records_captured` | BIGINT | Yes | `0` | ≥ 0 | Records | Internal |
| `storage_size_bytes` | BIGINT | Yes | `0` | ≥ 0 | Size | Internal |
| `checksum` | VARCHAR(64) | Yes | — | SHA-256 | Checksum | Internal |
| `compression_enabled` | BOOLEAN | Yes | `true` | — | Compressed | Internal |
| `compression_algorithm` | VARCHAR(20) | Yes | `SNAPPY` | — | Algorithm | Internal |
| `encryption_enabled` | BOOLEAN | Yes | `true` | — | Encrypted | Internal |
| `encryption_key_id` | UUID | No | NULL | FK to `security_keys` | Key | Restricted |
| `retention_until` | DATE | Yes | — | — | Retention | Internal |
| `schedule_id` | UUID | No | NULL | FK to `scheduler` (Entity 705) | Schedule | Internal |
| `created_by` | UUID | Yes | — | FK to `identity_master` | Creator | Confidential |
| `created_at` | TIMESTAMPTZ | Yes | `now()` | — | Creation | Internal |
| `restore_count` | INTEGER | Yes | `0` | ≥ 0 | Restores | Internal |
| `last_restored_at` | TIMESTAMPTZ | No | NULL | — | Last restore | Internal |
| `last_restored_by` | UUID | No | NULL | FK to `identity_master` | Restorer | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `COMPLETED` | PENDING, IN_PROGRESS, COMPLETED, FAILED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 758 — Data Quality Engine

### 1. Business Purpose
Per Part 15 §4: Measures Completeness, Accuracy, Consistency, Duplicates, Null Values. Data quality monitoring.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `dq_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `dq_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `source_warehouse_id` | UUID | No | NULL | FK to `data_warehouse` (Entity 752) | Warehouse | Internal |
| `source_table` | VARCHAR(200) | Yes | — | — | Table | Internal |
| `source_column` | VARCHAR(200) | No | NULL | — | Column | Internal |
| `quality_dimensions` | JSONB | Yes | `'[]'` | — | Quality dimensions | Internal |
| `completeness_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Completeness (per Part 15) | Internal |
| `completeness_rules` | JSONB | Yes | `'[]'` | — | Rules | Confidential |
| `accuracy_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Accuracy (per Part 15) | Internal |
| `accuracy_rules` | JSONB | Yes | `'[]'` | — | Rules | Confidential |
| `consistency_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Consistency (per Part 15) | Internal |
| `consistency_rules` | JSONB | Yes | `'[]'` | — | Rules | Confidential |
| `duplicates_count` | BIGINT | Yes | `0` | ≥ 0 | Duplicates (per Part 15) | Internal |
| `duplicates_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | % duplicates | Internal |
| `null_values_count` | BIGINT | Yes | `0` | ≥ 0 | Null Values (per Part 15) | Internal |
| `null_values_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | % nulls | Internal |
| `uniqueness_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Uniqueness | Internal |
| `validity_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Validity | Internal |
| `timeliness_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Timeliness | Internal |
| `overall_quality_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Overall | Internal |
| `quality_trend_30d` | JSONB | Yes | `'[]'` | — | Trend | Internal |
| `issues_identified` | JSONB | Yes | `'[]'` | — | Issues | Confidential |
| `issues_count` | INTEGER | Yes | `0` | ≥ 0 | Count | Internal |
| `critical_issues_count` | INTEGER | Yes | `0` | ≥ 0 | Critical | Confidential |
| `auto_resolution_enabled` | BOOLEAN | Yes | `false` | — | Auto-fix | Internal |
| `auto_resolutions_applied` | INTEGER | Yes | `0` | ≥ 0 | Applied | Internal |
| `notification_on_critical` | BOOLEAN | Yes | `true` | — | Notify | Internal |
| `notification_recipients` | UUID[] | No | `ARRAY[]::UUID[]` | — | Recipients | Confidential |
| `last_checked_at` | TIMESTAMPTZ | Yes | `now()` | — | Last check | Internal |
| `check_frequency` | ENUM | Yes | `HOURLY` | REAL_TIME, HOURLY, DAILY, ON_DEMAND | Frequency | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 759 — Data Governance

### 1. Business Purpose
Per Part 15 §4: Supports Ownership, Classification, Retention, Privacy, Compliance. Enterprise data governance.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `governance_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `governance_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `governance_description` | TEXT | No | NULL | — | Description | Internal |
| `governance_scope` | ENUM | Yes | `ENTERPRISE` | ENTERPRISE, COMPANY, DOMAIN, TABLE, COLUMN | Scope | Internal |
| `data_ownership` | JSONB | Yes | `'[]'` | — | Ownership (per Part 15) — [{ entity, owner_id, steward_id, custodian_id }] | Confidential |
| `data_classification` | JSONB | Yes | `'[]'` | — | Classification (per Part 15) — [{ entity, classification, sensitivity }] | Confidential |
| `retention_policies` | JSONB | Yes | `'[]'` | — | Retention (per Part 15) — [{ entity, retention_days, disposal_method }] | Internal |
| `privacy_rules` | JSONB | Yes | `'[]'` | — | Privacy (per Part 15) — [{ data_type, handling_rule, consent_required }] | Confidential |
| `compliance_regulations` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Compliance (per Part 15) — GDPR, SOX, FSSAI, etc. | Internal |
| `data_stewards` | JSONB | Yes | `'[]'` | — | Stewards | Confidential |
| `data_custodians` | JSONB | Yes | `'[]'` | — | Custodians | Confidential |
| `data_owners` | JSONB | Yes | `'[]'` | — | Owners | Confidential |
| `access_policies` | JSONB | Yes | `'[]'` | — | Access | Confidential |
| `masking_rules` | JSONB | Yes | `'[]'` | — | Data masking | Confidential |
| `encryption_requirements` | JSONB | Yes | `'{}'` | — | Encryption | Confidential |
| `audit_requirements` | JSONB | Yes | `'{}'` | — | Audit | Internal |
| `lineage_tracking_enabled` | BOOLEAN | Yes | `true` | — | Lineage | Internal |
| `quality_monitoring_enabled` | BOOLEAN | Yes | `true` | — | Quality | Internal |
| `metadata_management_enabled` | BOOLEAN | Yes | `true` | — | Metadata | Internal |
| `master_data_management_enabled` | BOOLEAN | Yes | `true` | — | MDM | Internal |
| `data_lifecycle_automated` | BOOLEAN | Yes | `true` | — | Lifecycle | Internal |
| `governance_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Score | Confidential |
| `governance_score_trend` | JSONB | Yes | `'[]'` | — | Trend | Confidential |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 760 — Analytics Operations Dashboard

### 1. Business Purpose
Per Part 15 §4: Displays Pipeline Health, Load Status, Latency, Data Quality, Warehouse Size. AI: Anomaly Detection, Data Quality Suggestions, Pipeline Optimization, Metadata Recommendation.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | `DAILY` | HOURLY, DAILY | Grain | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `pipeline_health_overall` | ENUM | Yes | `HEALTHY` | HEALTHY, DEGRADED, CRITICAL | Pipeline Health (per Part 15) | Internal |
| `pipeline_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Score | Internal |
| `active_pipelines_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `pipelines_succeeded_today` | INTEGER | Yes | `0` | ≥ 0 | Succeeded | Internal |
| `pipelines_failed_today` | INTEGER | Yes | `0` | ≥ 0 | Failed | Confidential |
| `pipelines_running_count` | INTEGER | Yes | `0` | ≥ 0 | Running | Internal |
| `pipeline_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Rate | Internal |
| `load_status_summary` | JSONB | Yes | `'{}'` | — | Load Status (per Part 15) | Internal |
| `records_loaded_today` | BIGINT | Yes | `0` | ≥ 0 | Records | Internal |
| `avg_load_duration_minutes` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Avg | Internal |
| `data_lag_seconds_avg` | INTEGER | Yes | `0` | ≥ 0 | Latency (per Part 15) avg | Internal |
| `real_time_lag_seconds` | INTEGER | Yes | `0` | ≥ 0 | Real-time lag | Internal |
| `near_real_time_lag_seconds` | INTEGER | Yes | `0` | ≥ 0 | Near RT | Internal |
| `batch_lag_hours` | DECIMAL(5,2) | Yes | `0` | ≥ 0 | Batch | Internal |
| `data_quality_score_avg` | DECIMAL(5,2) | Yes | `0` | 0-100 | Data Quality (per Part 15) avg | Internal |
| `data_quality_by_dimension` | JSONB | Yes | `'{}'` | — | By dimension | Internal |
| `critical_data_issues_count` | INTEGER | Yes | `0` | ≥ 0 | Critical | Confidential |
| `warehouse_size_gb` | DECIMAL(12,2) | Yes | `0` | ≥ 0 | Warehouse Size (per Part 15) | Internal |
| `warehouse_size_trend_30d` | JSONB | Yes | `'[]'` | — | Trend | Internal |
| `data_lake_size_gb` | DECIMAL(12,2) | Yes | `0` | ≥ 0 | Lake size | Internal |
| `total_storage_gb` | DECIMAL(12,2) | Yes | `0` | ≥ 0 | Total | Internal |
| `storage_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Cost | Confidential |
| `currency_code` | CHAR(3) | Yes | `USD` | — | Currency | Internal |
| `query_performance_avg_ms` | INTEGER | Yes | `0` | ≥ 0 | Query perf | Internal |
| `queries_per_second` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | QPS | Internal |
| `concurrent_queries` | INTEGER | Yes | `0` | ≥ 0 | Concurrent | Internal |
| `metadata_coverage_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Coverage | Internal |
| `lineage_coverage_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Lineage | Internal |
| `governance_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Governance | Confidential |
| `trend_7d` | JSONB | Yes | `'[]'` | — | 7-day | Internal |
| `trend_30d` | JSONB | Yes | `'[]'` | — | 30-day | Internal |
| `ai_anomaly_detection` | JSONB | No | NULL | — | AI: Anomaly Detection (per Part 15 AI) | Confidential |
| `ai_data_quality_suggestions` | JSONB | No | NULL | — | AI: Data Quality Suggestions (per Part 15 AI) | Confidential |
| `ai_pipeline_optimization` | JSONB | No | NULL | — | AI: Pipeline Optimization (per Part 15 AI) | Confidential |
| `ai_metadata_recommendation` | JSONB | No | NULL | — | AI: Metadata Recommendation (per Part 15 AI) | Confidential |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 5: Business Intelligence (BI), KPI Framework & Predictive Analytics (Entities 761-770)

## Entity 761 — KPI Library

### 1. Business Purpose
Per Part 15 §5: Stores KPI Name, Formula, Owner, Version, Frequency. Central KPI library — "One KPI. One Formula. One Source of Truth."

### 2. Architectural Role
Master entity — per Vol 0: "Every dashboard should calculate KPIs consistently across the enterprise." The single source of truth for all enterprise KPIs.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `kpi_code` | VARCHAR(50) | Yes | — | Unique enterprise-wide | Code | Internal |
| `kpi_name` | VARCHAR(200) | Yes | — | Min 3 | KPI Name (per Part 15) | Internal |
| `kpi_description` | TEXT | Yes | — | Min 20 | Description | Internal |
| `kpi_category` | ENUM | Yes | — | OPERATIONAL, FINANCIAL, MANUFACTURING, WAREHOUSE, RETAIL, RESTAURANT, HR, MAINTENANCE, QUALITY, COMPLIANCE, CUSTOMER, SUPPLIER, ESG, EXECUTIVE, OTHER | Category | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `kpi_type` | ENUM | Yes | `LEADING` | LEADING, LAGGING, OUTCOME, DRIVER, DIAGNOSTIC | Type | Internal |
| `formula` | TEXT | Yes | — | — | Formula (per Part 15) — DSL expression | Confidential |
| `formula_dsl` | TEXT | No | NULL | — | Structured DSL | Confidential |
| `data_source` | ENUM | Yes | `DATA_WAREHOUSE` | DATA_WAREHOUSE, ANALYTICS_CUBE, DATABASE, API, COMPUTED, MANUAL | Source | Internal |
| `data_source_config` | JSONB | Yes | `'{}'` | — | Source config | Confidential |
| `measurement_unit` | VARCHAR(20) | Yes | — | — | Unit | Internal |
| `data_type` | ENUM | Yes | `DECIMAL` | INTEGER, DECIMAL, PERCENTAGE, CURRENCY, RATIO, COUNT | Type | Internal |
| `dimensions_supported` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Time, Module, Branch, etc. | Internal |
| `granularity_supported` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Daily, Weekly, Monthly | Internal |
| `target_value` | DECIMAL(18,4) | No | NULL | — | Target | Internal |
| `target_direction` | ENUM | Yes | `HIGHER_BETTER` | HIGHER_BETTER, LOWER_BETTER, TARGET_VALUE | Direction | Internal |
| `benchmark_value` | DECIMAL(18,4) | No | NULL | — | Industry benchmark | Confidential |
| `benchmark_source` | VARCHAR(200) | No | NULL | — | Source | Internal |
| `owner_identity_id` | UUID | Yes | — | FK to `identity_master` | Owner (per Part 15) | Confidential |
| `owner_department_id` | UUID | No | NULL | FK to `departments` | Owner dept | Internal |
| `frequency` | ENUM | Yes | `MONTHLY` | REAL_TIME, HOURLY, DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY | Frequency (per Part 15) | Internal |
| `calculation_engine_id` | UUID | No | NULL | FK to `kpi_calculation_engine` (Entity 762) | Calc engine | Internal |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version (per Part 15) | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `kpi_library` (self) | Previous | Internal |
| `change_log` | JSONB | Yes | `'[]'` | — | Version history | Confidential |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `display_format` | VARCHAR(50) | Yes | `#,##,###.##` | — | Display | Internal |
| `color_coding_rules` | JSONB | No | NULL | — | Color thresholds | Internal |
| `alert_threshold_low` | DECIMAL(18,4) | No | NULL | — | Low | Internal |
| `alert_threshold_high` | DECIMAL(18,4) | No | NULL | — | High | Internal |
| `alert_recipients` | UUID[] | No | `ARRAY[]::UUID[]` | — | Recipients | Confidential |
| `applicable_levels` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | ENTERPRISE, COMPANY, BRANCH, DEPARTMENT, TEAM, INDIVIDUAL | Levels | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| KPI Calculation Engine (762) | One-to-One | 1:1 | Engine |
| Dashboard Widget (763) | One-to-Many | 1:N | Widgets using KPI |
| Self (761) | Self-reference | N:1 | Previous version |

### 6. Indexes
- UNIQUE (`kpi_code`)
- INDEX (`kpi_category`, `business_module`, `status`)
- INDEX (`is_latest_version`, `status`)
- INDEX (`frequency`, `status`)

### 7. Security Classification
**Confidential** — formulas are valuable IP.

### 8. Integration Points
- **KPI Calculation Engine** (Entity 762): Computation
- **Dashboard Widget** (Entity 763): Display
- **Decision Intelligence Engine** (FS-55, Q194): Decision input
- **All Business Modules**: KPI definitions

### 9. Sample Data
```json
{
  "kpi_code": "KPI-OEE-MFG", "kpi_name": "Overall Equipment Effectiveness",
  "kpi_category": "MANUFACTURING", "business_module": "MANUFACTURING",
  "kpi_type": "OUTCOME",
  "formula": "(Availability × Performance × Quality) × 100",
  "data_source": "ANALYTICS_CUBE", "measurement_unit": "%",
  "data_type": "PERCENTAGE",
  "dimensions_supported": ["TIME", "FACILITY", "LINE", "MACHINE"],
  "granularity_supported": ["HOURLY", "DAILY", "WEEKLY", "MONTHLY"],
  "target_value": 85.0000, "target_direction": "HIGHER_BETTER",
  "benchmark_value": 75.0000, "benchmark_source": "World Class OEE",
  "frequency": "DAILY", "version": "3.0", "is_latest_version": true,
  "display_format": "0.00%",
  "color_coding_rules": [
    { "min": 85, "color": "GREEN", "label": "World Class" },
    { "min": 60, "max": 85, "color": "YELLOW", "label": "Typical" },
    { "max": 60, "color": "RED", "label": "Low" }
  ],
  "status": "ACTIVE"
}
```

### 10. Audit Events
`KPI_CREATED`, `KPI_UPDATED`, `KPI_VERSION_PUBLISHED`, `KPI_APPROVED`, `KPI_DEPRECATED`, `KPI_FORMULA_CHANGED`

---

## Entity 762 — KPI Calculation Engine

### 1. Business Purpose
Per Part 15 §5: Supports Real-Time, 5-Minute, Hourly, Daily, Monthly. KPI calculation engine.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `engine_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `engine_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `engine_type` | ENUM | Yes | `STREAMING` | STREAMING, BATCH, HYBRID | Type | Internal |
| `calculation_frequencies_supported` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | REAL_TIME (per Part 15), EVERY_5_MINUTES (per Part 15), HOURLY (per Part 15), DAILY (per Part 15), MONTHLY (per Part 15), QUARTERLY, YEARLY | Frequencies | Internal |
| `kpis_managed_count` | INTEGER | Yes | `0` | ≥ 0 | KPIs | Internal |
| `calculation_engine` | ENUM | Yes | `CUSTOM` | CUSTOM, APACHE_SPARK, FLINK, KAFKA_STREAMS, PYTHON, SQL | Engine | Internal |
| `parallelism_level` | INTEGER | Yes | `4` | ≥ 1 | Parallel | Internal |
| `auto_scaling_enabled` | BOOLEAN | Yes | `true` | — | Auto-scale | Internal |
| `calculations_per_second` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | Throughput | Internal |
| `avg_calculation_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Avg time | Internal |
| `last_calculation_at` | TIMESTAMPTZ | No | NULL | — | Last | Internal |
| `total_calculations_today` | BIGINT | Yes | `0` | ≥ 0 | Today | Internal |
| `total_calculations_mtd` | BIGINT | Yes | `0` | ≥ 0 | MTD | Internal |
| `failed_calculations_today` | INTEGER | Yes | `0` | ≥ 0 | Failed | Confidential |
| `success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success | Internal |
| `cache_enabled` | BOOLEAN | Yes | `true` | — | Cache | Internal |
| `cache_ttl_seconds` | INTEGER | Yes | `300` | ≥ 0 | TTL | Internal |
| `cache_hit_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Hit rate | Internal |
| `alerting_enabled` | BOOLEAN | Yes | `true` | — | Alerts | Internal |
| `alert_threshold_breach_count` | INTEGER | Yes | `0` | ≥ 0 | Breaches | Internal |
| `alert_recipients` | UUID[] | No | `ARRAY[]::UUID[]` | — | Recipients | Confidential |
| `data_sources_connected` | JSONB | Yes | `'[]'` | — | Sources | Internal |
| `versioned_results_enabled` | BOOLEAN | Yes | `true` | — | Versioned | Internal |
| `results_retention_days` | INTEGER | Yes | `2555` | ≥ 30 | Retention (7 years) | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ERROR | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 763 — Dashboard Widget

### 1. Business Purpose
Per Part 15 §5: Supports Cards, Charts, Tables, Heat Maps, Maps, Gauges. Dashboard widget library.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `widget_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `widget_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `widget_description` | TEXT | No | NULL | — | Description | Internal |
| `widget_type` | ENUM | Yes | — | CARD (per Part 15), CHART (per Part 15), TABLE (per Part 15), HEAT_MAP (per Part 15), MAP (per Part 15), GAUGE (per Part 15), KPI_CARD, SPARKLINE, TREEMAP, SANKEY, FUNNEL, TIMELINE, CUSTOM | Type | Internal |
| `chart_subtypes` | TEXT[] | No | `ARRAY[]::TEXT[]` | BAR, LINE, PIE, DONUT, AREA, SCATTER, BUBBLE, RADAR, CANDLESTICK, COMBO | Subtypes | Internal |
| `data_source_type` | ENUM | Yes | `KPI` | KPI, ANALYTICS_CUBE, DATA_WAREHOUSE, API, COMPUTED, STATIC | Source | Internal |
| `data_source_id` | UUID | No | NULL | — | Source ID | Internal |
| `kpi_id` | UUID | No | NULL | FK to `kpi_library` (Entity 761) | KPI | Internal |
| `data_query` | TEXT | No | NULL | — | Query | Confidential |
| `data_transformations` | JSONB | No | NULL | — | Transform | Confidential |
| `display_config` | JSONB | Yes | `'{}'` | — | Display | Internal |
| `color_scheme` | JSONB | Yes | `'{}'` | — | Colors | Internal |
| `conditional_formatting` | JSONB | No | NULL | — | Conditional | Internal |
| `drill_down_config` | JSONB | No | NULL | — | Drill-down | Internal |
| `filters_available` | JSONB | Yes | `'[]'` | — | Filters | Internal |
| `sorting_config` | JSONB | Yes | `'[]'` | — | Sorting | Internal |
| `refresh_interval_seconds` | INTEGER | Yes | `300` | ≥ 30 | Refresh | Internal |
| `real_time_enabled` | BOOLEAN | Yes | `false` | — | Real-time | Internal |
| `mobile_rendering_config` | JSONB | Yes | `'{}'` | — | Mobile | Internal |
| `tablet_rendering_config` | JSONB | Yes | `'{}'` | — | Tablet | Internal |
| `accessibility_config` | JSONB | Yes | `'{}'` | — | Accessibility | Internal |
| `export_enabled` | BOOLEAN | Yes | `true` | — | Export | Internal |
| `screenshot_enabled` | BOOLEAN | Yes | `true` | — | Screenshot | Internal |
| `permissions_required` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Permissions | Confidential |
| `applicable_roles` | UUID[] | No | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `usage_count` | BIGINT | Yes | `0` | ≥ 0 | Used | Internal |
| `avg_load_time_ms` | INTEGER | Yes | `0` | ≥ 0 | Load time | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 764 — Dashboard Template

### 1. Business Purpose
Per Part 15 §5: Examples — CEO, COO, CFO, Warehouse, Manufacturing, Retail, Restaurant, HR, Maintenance. Pre-built dashboard templates.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `template_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `template_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `template_description` | TEXT | No | NULL | — | Description | Internal |
| `target_audience` | ENUM | Yes | — | CEO (per Part 15), COO (per Part 15), CFO (per Part 15), WAREHOUSE (per Part 15), MANUFACTURING (per Part 15), RETAIL (per Part 15), RESTAURANT (per Part 15), HR (per Part 15), MAINTENANCE (per Part 15), SALES, OPERATIONS, QUALITY, FINANCE, ALL | Audience | Internal |
| `business_module` | VARCHAR(50) | No | NULL | — | Module | Internal |
| `dashboard_purpose` | ENUM | Yes | `OPERATIONAL` | EXECUTIVE, OPERATIONAL, STRATEGIC, COMPLIANCE, ANALYTICAL | Purpose | Internal |
| `layout_config` | JSONB | Yes | `'{}'` | — | Layout grid | Internal |
| `widgets_config` | JSONB | Yes | `'[]'` | — | Widget configurations | Internal |
| `kpi_ids_included` | UUID[] | Yes | `ARRAY[]::UUID[]` | — | KPIs | Internal |
| `global_filters` | JSONB | Yes | `'[]'` | — | Filters | Confidential |
| `default_time_range` | VARCHAR(50) | Yes | `LAST_30_DAYS` | — | Time range | Internal |
| `color_theme` | VARCHAR(50) | Yes | `default` | — | Theme | Internal |
| `branding_config` | JSONB | Yes | `'{}'` | — | Branding | Internal |
| `mobile_layout_config` | JSONB | Yes | `'{}'` | — | Mobile | Internal |
| `tablet_layout_config` | JSONB | Yes | `'{}'` | — | Tablet | Internal |
| `refresh_interval_seconds` | INTEGER | Yes | `300` | ≥ 30 | Refresh | Internal |
| `real_time_enabled` | BOOLEAN | Yes | `false` | — | Real-time | Internal |
| `export_formats_supported` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | PDF, EXCEL, CSV, PNG | Export | Internal |
| `scheduled_delivery_enabled` | BOOLEAN | Yes | `true` | — | Schedule | Internal |
| `permissions_required` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | — | Permissions | Confidential |
| `applicable_roles` | UUID[] | No | `ARRAY[]::UUID[]` | — | Roles | Confidential |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `is_system_template` | BOOLEAN | Yes | `false` | — | System | Internal |
| `customizable` | BOOLEAN | Yes | `true` | — | Can customize | Internal |
| `instances_created_count` | BIGINT | Yes | `0` | ≥ 0 | Instances | Internal |
| `effective_from` | DATE | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | DRAFT, ACTIVE, INACTIVE, DEPRECATED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 765 — Report Scheduler

### 1. Business Purpose
Per Part 15 §5: Supports Daily, Weekly, Monthly, Quarterly, Email, PDF, Excel. Report scheduling and delivery.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `schedule_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `schedule_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `report_id` | UUID | Yes | — | FK to `report_master` (Entity 711) | Report | Internal |
| `dashboard_id` | UUID | No | NULL | FK to `dashboard_builder` (Entity 713) | Dashboard | Internal |
| `schedule_frequency` | ENUM | Yes | — | DAILY (per Part 15), WEEKLY (per Part 15), MONTHLY (per Part 15), QUARTERLY (per Part 15), YEARLY, CRON, ON_DEMAND | Frequency | Internal |
| `cron_expression` | VARCHAR(100) | No | NULL | — | Cron | Internal |
| `next_run_at` | TIMESTAMPTZ | Yes | — | — | Next | Internal |
| `last_run_at` | TIMESTAMPTZ | No | NULL | — | Last | Internal |
| `last_run_status` | ENUM | No | NULL | SUCCESS, FAILED, SKIPPED | Status | Internal |
| `delivery_method` | ENUM | Yes | `EMAIL` | EMAIL (per Part 15), WEBHOOK, API, FILE_DROP, IN_APP | Method | Internal |
| `delivery_formats` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | PDF (per Part 15), EXCEL (per Part 15), CSV, HTML, PNG | Formats | Internal |
| `recipients` | JSONB | Yes | `'[]'` | — | [{ identity_id, email, role_id }] | Confidential |
| `cc_recipients` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | CC | Confidential |
| `bcc_recipients` | TEXT[] | No | `ARRAY[]::TEXT[]` | — | BCC | Confidential |
| `email_subject` | VARCHAR(500) | No | NULL | — | Subject | Internal |
| `email_body` | TEXT | No | NULL | — | Body | Internal |
| `parameters` | JSONB | Yes | `'{}'` | — | Report parameters | Confidential |
| `filters` | JSONB | Yes | `'{}'` | — | Report filters | Confidential |
| `time_range` | VARCHAR(100) | Yes | `LAST_MONTH` | — | Time range | Internal |
| `timezone` | VARCHAR(50) | Yes | `Asia/Kolkata` | — | Timezone | Internal |
| `business_calendar_aware` | BOOLEAN | Yes | `true` | — | Calendar | Internal |
| `skip_on_holiday` | BOOLEAN | Yes | `false` | — | Skip | Internal |
| `conditional_delivery_enabled` | BOOLEAN | Yes | `false` | — | Conditional | Internal |
| `delivery_condition` | TEXT | No | NULL | — | Condition | Confidential |
| `retry_on_failure` | BOOLEAN | Yes | `true` | — | Retry | Internal |
| `max_retries` | INTEGER | Yes | `3` | ≥ 0 | Max | Internal |
| `notification_on_failure` | BOOLEAN | Yes | `true` | — | Notify | Internal |
| `total_runs_count` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `successful_runs_count` | BIGINT | Yes | `0` | ≥ 0 | Success | Internal |
| `failed_runs_count` | BIGINT | Yes | `0` | ≥ 0 | Failed | Internal |
| `created_by` | UUID | Yes | — | FK to `identity_master` | Creator | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, PAUSED, ERROR | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 766 — Predictive Analytics

### 1. Business Purpose
Per Part 15 §5: Forecasts Sales, Inventory, Demand, Cash Flow, Attrition, Maintenance, Production. Predictive analytics engine.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `prediction_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `prediction_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `prediction_category` | ENUM | Yes | — | SALES (per Part 15), INVENTORY (per Part 15), DEMAND (per Part 15), CASH_FLOW (per Part 15), ATTRITION (per Part 15), MAINTENANCE (per Part 15), PRODUCTION (per Part 15), REVENUE, QUALITY, CUSTOMER_BEHAVIOR, OTHER | Category | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `prediction_type` | ENUM | Yes | `FORECAST` | FORECAST, CLASSIFICATION, REGRESSION, ANOMALY_DETECTION, RECOMMENDATION, OPTIMIZATION | Type | Internal |
| `model_type` | ENUM | Yes | — | ARIMA, EXPONENTIAL_SMOOTHING, LINEAR_REGRESSION, RANDOM_FOREST, GRADIENT_BOOSTING, LSTM, TRANSFORMER, PROPHET, ENSEMBLE, HYBRID | Model | Internal |
| `model_id` | UUID | Yes | — | FK to `ml_model` | Model | Internal |
| `model_version` | VARCHAR(20) | Yes | — | — | Version | Internal |
| `prediction_horizon` | VARCHAR(50) | Yes | — | — | Horizon (e.g., 90D) | Internal |
| `prediction_frequency` | ENUM | Yes | `DAILY` | REAL_TIME, HOURLY, DAILY, WEEKLY, MONTHLY | Frequency | Internal |
| `target_entity_type` | VARCHAR(100) | Yes | — | — | Target entity | Internal |
| `target_entity_id` | UUID | No | NULL | — | Target ID | Internal |
| `features_used` | JSONB | Yes | `'[]'` | — | ML features | Confidential |
| `training_data_window_days` | INTEGER | Yes | `365` | ≥ 30 | Training window | Internal |
| `prediction_value` | DECIMAL(18,4) | Yes | `0` | — | Predicted | Confidential |
| `confidence_interval_lower` | DECIMAL(18,4) | No | NULL | — | Lower | Confidential |
| `confidence_interval_upper` | DECIMAL(18,4) | No | NULL | — | Upper | Confidential |
| `confidence_level_pct` | DECIMAL(5,2) | Yes | `95.00` | 80-99 | Confidence | Internal |
| `accuracy_historical_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Accuracy | Internal |
| `mape_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | MAPE | Internal |
| `rmse` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | RMSE | Internal |
| `prediction_date` | DATE | Yes | — | — | Prediction date | Internal |
| `target_date` | DATE | Yes | — | — | Target date | Internal |
| `scenario_type` | ENUM | Yes | `BASELINE` | BEST_CASE, BASELINE, WORST_CASE, CUSTOM | Scenario | Internal |
| `assumptions` | JSONB | Yes | `'[]'` | — | Assumptions | Confidential |
| `factors` | JSONB | Yes | `'[]'` | — | Contributing factors | Confidential |
| `recommendations` | JSONB | Yes | `'[]'` | — | Recommendations | Confidential |
| `outcome_actual` | DECIMAL(18,4) | No | NULL | — | Actual outcome | Confidential |
| `outcome_variance_pct` | DECIMAL(5,2) | No | NULL | — | Variance | Confidential |
| `outcome_recorded_at` | TIMESTAMPTZ | No | NULL | — | Outcome | Internal |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `current_status` | ENUM | Yes | `GENERATED` | GENERATING, GENERATED, VALIDATED, APPROVED, ARCHIVED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 767 — Trend Analysis

### 1. Business Purpose
Per Part 15 §5: Measures Growth, Decline, Seasonality, Moving Average, Variance. Trend analysis engine.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `trend_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `trend_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `metric_analyzed` | VARCHAR(200) | Yes | — | — | Metric | Internal |
| `kpi_id` | UUID | No | NULL | FK to `kpi_library` (Entity 761) | KPI | Internal |
| `analysis_period_start` | DATE | Yes | — | — | Period start | Internal |
| `analysis_period_end` | DATE | Yes | — | > start | Period end | Internal |
| `analysis_granularity` | ENUM | Yes | `DAILY` | HOURLY, DAILY, WEEKLY, MONTHLY, QUARTERLY | Granularity | Internal |
| `data_points_count` | INTEGER | Yes | `0` | ≥ 0 | Points | Internal |
| `trend_direction` | ENUM | Yes | — | GROWING (per Part 15), DECLINING (per Part 15), STABLE, VOLATILE | Direction | Internal |
| `growth_rate_pct` | DECIMAL(7,2) | Yes | `0` | — | Growth (per Part 15) | Confidential |
| `decline_rate_pct` | DECIMAL(7,2) | Yes | `0` | — | Decline (per Part 15) | Confidential |
| `compound_growth_rate_pct` | DECIMAL(7,2) | Yes | `0` | — | CAGR | Confidential |
| `seasonality_detected` | BOOLEAN | Yes | `false` | — | Seasonality (per Part 15) | Internal |
| `seasonality_pattern` | JSONB | No | NULL | — | Pattern | Internal |
| `seasonal_periods` | JSONB | No | NULL | — | Periods | Internal |
| `moving_average_periods` | INTEGER | Yes | `7` | ≥ 1 | Periods | Internal |
| `moving_average_values` | JSONB | Yes | `'[]'` | — | Moving Average (per Part 15) | Confidential |
| `exponential_moving_average` | JSONB | No | NULL | — | EMA | Confidential |
| `variance_pct` | DECIMAL(7,2) | Yes | `0` | — | Variance (per Part 15) | Confidential |
| `standard_deviation` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Std dev | Confidential |
| `coefficient_of_variation` | DECIMAL(7,4) | Yes | `0` | ≥ 0 | CV | Internal |
| `trend_line_equation` | VARCHAR(500) | No | NULL | — | Trend line | Internal |
| `r_squared` | DECIMAL(7,4) | Yes | `0` | 0-1 | R² | Internal |
| `anomalies_detected` | JSONB | Yes | `'[]'` | — | Anomalies | Confidential |
| `anomalies_count` | INTEGER | Yes | `0` | ≥ 0 | Count | Internal |
| `breakpoints_detected` | JSONB | Yes | `'[]'` | — | Breakpoints | Internal |
| `forecast_extension` | JSONB | No | NULL | — | Extended forecast | Confidential |
| `insights` | JSONB | Yes | `'[]'` | — | AI insights | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `analysis_date` | DATE | Yes | — | — | Analysis date | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 768 — Scenario Modeling

### 1. Business Purpose
Per Part 15 §5: Supports Best Case, Expected Case, Worst Case, Custom Simulation. Business scenario modeling.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `scenario_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `scenario_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `scenario_description` | TEXT | Yes | — | Min 20 | Description | Confidential |
| `scenario_type` | ENUM | Yes | — | BEST_CASE (per Part 15), EXPECTED_CASE (per Part 15), WORST_CASE (per Part 15), CUSTOM_SIMULATION (per Part 15) | Type | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `variables` | JSONB | Yes | `'[]'` | — | [{ name, base_value, scenario_value, change_pct }] | Confidential |
| `assumptions` | JSONB | Yes | `'[]'` | — | Assumptions | Confidential |
| `constraints` | JSONB | Yes | `'[]'` | — | Constraints | Confidential |
| `simulation_model_id` | UUID | No | NULL | FK to `simulation_engine` (Entity 772) | Simulation | Internal |
| `prediction_model_id` | UUID | No | NULL | FK to `predictive_analytics` (Entity 766) | Prediction | Internal |
| `base_case_values` | JSONB | Yes | `'{}'` | — | Base | Confidential |
| `scenario_values` | JSONB | Yes | `'{}'` | — | Scenario | Confidential |
| `impact_analysis` | JSONB | Yes | `'{}'` | — | Impact | Confidential |
| `financial_impact` | JSONB | Yes | `'{}'` | — | Financial | Confidential |
| `operational_impact` | JSONB | Yes | `'{}'` | — | Operational | Confidential |
| `risk_assessment` | JSONB | Yes | `'{}'` | — | Risk | Confidential |
| `probability_pct` | DECIMAL(5,2) | Yes | `50.00` | 0-100 | Probability | Confidential |
| `confidence_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Confidence | Internal |
| `recommendations` | JSONB | Yes | `'[]'` | — | Recommendations | Confidential |
| `comparison_with_base` | JSONB | Yes | `'{}'` | — | Comparison | Confidential |
| `comparison_with_other_scenarios` | JSONB | Yes | `'[]'` | — | Comparison | Confidential |
| `created_by` | UUID | Yes | — | FK to `identity_master` | Creator | Confidential |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `DRAFT` | DRAFT, SIMULATED, VALIDATED, APPROVED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 769 — Executive KPI Dashboard

### 1. Business Purpose
Per Part 15 §5: Displays Revenue, Profit, Inventory, OEE, Customer Satisfaction, Payroll, Maintenance. Executive-level KPI dashboard.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `period_year` | INTEGER | Yes | — | — | Year | Internal |
| `period_quarter` | ENUM | No | NULL | Q1, Q2, Q3, Q4 | Quarter | Internal |
| `revenue_summary` | JSONB | Yes | `'{}'` | — | Revenue (per Part 15) | Confidential |
| `revenue_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | MTD | Confidential |
| `revenue_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | YTD | Confidential |
| `revenue_growth_pct` | DECIMAL(5,2) | Yes | `0` | — | Growth | Confidential |
| `revenue_vs_budget_pct` | DECIMAL(5,2) | Yes | `0` | — | vs Budget | Confidential |
| `profit_summary` | JSONB | Yes | `'{}'` | — | Profit (per Part 15) | Confidential |
| `profit_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | MTD | Confidential |
| `profit_margin_pct` | DECIMAL(5,2) | Yes | `0` | — | Margin | Confidential |
| `ebitda_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | EBITDA | Confidential |
| `inventory_summary` | JSONB | Yes | `'{}'` | — | Inventory (per Part 15) | Confidential |
| `inventory_value` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Value | Confidential |
| `inventory_turnover_ratio` | DECIMAL(8,2) | Yes | `0` | ≥ 0 | Turnover | Confidential |
| `days_of_supply` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Days | Internal |
| `oee_summary` | JSONB | Yes | `'{}'` | — | OEE (per Part 15) | Confidential |
| `oee_avg_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | OEE | Confidential |
| `availability_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Availability | Internal |
| `performance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Performance | Internal |
| `quality_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Quality | Internal |
| `customer_satisfaction_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | CSAT (per Part 15) | Confidential |
| `customer_satisfaction_trend` | JSONB | Yes | `'[]'` | — | Trend | Confidential |
| `nps_score` | DECIMAL(5,2) | Yes | `0` | -100 to 100 | NPS | Confidential |
| `payroll_summary` | JSONB | Yes | `'{}'` | — | Payroll (per Part 15) | Confidential |
| `payroll_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | MTD | Confidential |
| `payroll_cost_pct_of_revenue` | DECIMAL(5,2) | Yes | `0` | 0-100 | % revenue | Confidential |
| `headcount_total` | INTEGER | Yes | `0` | ≥ 0 | Headcount | Internal |
| `maintenance_summary` | JSONB | Yes | `'{}'` | — | Maintenance (per Part 15) | Confidential |
| `asset_availability_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Availability | Internal |
| `mtbf_hours` | DECIMAL(10,2) | Yes | `0` | ≥ 0 | MTBF | Confidential |
| `mttr_hours` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | MTTR | Confidential |
| `maintenance_cost_mtd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | MTD | Confidential |
| `overall_business_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Overall | Confidential |
| `health_score_trend` | JSONB | Yes | `'[]'` | — | Trend | Confidential |
| `kpi_alerts_active` | JSONB | Yes | `'[]'` | — | Alerts | Confidential |
| `kpi_alerts_count` | INTEGER | Yes | `0` | ≥ 0 | Count | Internal |
| `strategic_initiatives_progress` | JSONB | Yes | `'[]'` | — | Initiatives | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `ai_insights` | JSONB | No | NULL | — | AI insights | Restricted |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, PRESENTED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 770 — BI Mission Dashboard

### 1. Business Purpose
Per Part 15 §5: Displays KPI Health, Forecast Accuracy, Data Freshness, Executive Alerts. AI: KPI Explanation, Forecast Recommendation, Anomaly Detection, Narrative Reporting, Decision Support.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | `DAILY` | HOURLY, DAILY | Grain | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `kpi_health_overall` | ENUM | Yes | `HEALTHY` | HEALTHY, DEGRADED, CRITICAL | KPI Health (per Part 15) | Internal |
| `kpi_health_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Score | Internal |
| `total_kpis_tracked` | INTEGER | Yes | `0` | ≥ 0 | Total | Internal |
| `kpis_on_target_count` | INTEGER | Yes | `0` | ≥ 0 | On target | Internal |
| `kpis_off_target_count` | INTEGER | Yes | `0` | ≥ 0 | Off target | Confidential |
| `kpis_critical_count` | INTEGER | Yes | `0` | ≥ 0 | Critical | Confidential |
| `kpis_by_status` | JSONB | Yes | `'{}'` | — | By status | Internal |
| `kpis_by_category` | JSONB | Yes | `'{}'` | — | By category | Internal |
| `forecast_accuracy_avg_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Forecast Accuracy (per Part 15) | Internal |
| `forecast_accuracy_by_model` | JSONB | Yes | `'{}'` | — | By model | Internal |
| `forecast_accuracy_trend` | JSONB | Yes | `'[]'` | — | Trend | Internal |
| `forecasts_active_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `forecasts_within_tolerance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Within tolerance | Internal |
| `data_freshness_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Data Freshness (per Part 15) | Internal |
| `data_freshness_by_source` | JSONB | Yes | `'{}'` | — | By source | Internal |
| `data_lag_seconds_avg` | INTEGER | Yes | `0` | ≥ 0 | Avg lag | Internal |
| `real_time_data_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Real-time | Internal |
| `executive_alerts_active_count` | INTEGER | Yes | `0` | ≥ 0 | Executive Alerts (per Part 15) | Restricted |
| `executive_alerts_list` | JSONB | Yes | `'[]'` | — | List | Restricted |
| `executive_alerts_by_severity` | JSONB | Yes | `'{}'` | — | By severity | Restricted |
| `dashboards_active_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `dashboards_viewed_today` | INTEGER | Yes | `0` | ≥ 0 | Viewed | Internal |
| `reports_generated_today` | INTEGER | Yes | `0` | ≥ 0 | Generated | Internal |
| `scheduled_reports_pending` | INTEGER | Yes | `0` | ≥ 0 | Pending | Internal |
| `bi_query_volume_today` | BIGINT | Yes | `0` | ≥ 0 | Queries | Internal |
| `bi_avg_query_response_ms` | INTEGER | Yes | `0` | ≥ 0 | Avg | Internal |
| `predictions_generated_today` | INTEGER | Yes | `0` | ≥ 0 | Predictions | Internal |
| `scenarios_modeled_today` | INTEGER | Yes | `0` | ≥ 0 | Scenarios | Internal |
| `trend_7d` | JSONB | Yes | `'[]'` | — | 7-day | Internal |
| `trend_30d` | JSONB | Yes | `'[]'` | — | 30-day | Internal |
| `ai_kpi_explanation` | JSONB | No | NULL | — | AI: KPI Explanation (per Part 15 AI) | Confidential |
| `ai_forecast_recommendation` | JSONB | No | NULL | — | AI: Forecast Recommendation (per Part 15 AI) | Confidential |
| `ai_anomaly_detection` | JSONB | No | NULL | — | AI: Anomaly Detection (per Part 15 AI) | Restricted |
| `ai_narrative_reporting` | JSONB | No | NULL | — | AI: Narrative Reporting (per Part 15 AI) | Confidential |
| `ai_decision_support` | JSONB | No | NULL | — | AI: Decision Support (per Part 15 AI) | Restricted |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# SECTION 6: Digital Twin, Simulation & Enterprise Forecasting (Entities 771-780)

## Entity 771 — Digital Twin Model

### 1. Business Purpose
Per Part 15 §6: Represents Factories, Warehouses, Retail Stores, Restaurants, Distribution Centers. Digital twin models of enterprise assets.

### 2. Architectural Role
Digital twin entity — per Vol 0: "The enterprise should simulate tomorrow before acting today." Each physical entity has a digital twin that mirrors its state in real-time.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `twin_model_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `twin_model_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `twin_model_description` | TEXT | No | NULL | — | Description | Internal |
| `physical_entity_type` | ENUM | Yes | — | FACTORIES (per Part 15), WAREHOUSES (per Part 15), RETAIL_STORES (per Part 15), RESTAURANTS (per Part 15), DISTRIBUTION_CENTERS (per Part 15), PRODUCTION_LINE, MACHINE, SUPPLY_CHAIN, LOGISTICS_NETWORK, FACILITY | Type | Internal |
| `physical_entity_id` | UUID | Yes | — | FK to `facilities` or `asset_master` | Physical | Internal |
| `physical_entity_code` | VARCHAR(100) | No | NULL | — | Display | Internal |
| `twin_type` | ENUM | Yes | `OPERATIONAL` | OPERATIONAL, PREDICTIVE, SIMULATION, COMPOSITE | Type | Internal |
| `model_3d_url` | VARCHAR(500) | No | NULL | — | 3D model URL | Internal |
| `model_3d_format` | ENUM | No | NULL | GLTF, OBJ, FBX, UNITY, UNREAL, CUSTOM | Format | Internal |
| `model_3d_version` | VARCHAR(20) | No | NULL | — | Version | Internal |
| `simulation_engine_id` | UUID | No | NULL | FK to `simulation_engine` (Entity 772) | Engine | Internal |
| `real_time_data_feed` | BOOLEAN | Yes | `true` | — | Real-time | Internal |
| `iot_data_sources` | JSONB | Yes | `'[]'` | — | IoT feeds | Internal |
| `iot_device_ids` | UUID[] | No | `ARRAY[]::UUID[]` | — | IoT devices | Internal |
| `live_parameters` | JSONB | Yes | `'[]'` | — | Live parameters | Confidential |
| `synchronized_at` | TIMESTAMPTZ | Yes | `now()` | — | Last sync | Internal |
| `sync_frequency_seconds` | INTEGER | Yes | `5` | ≥ 1 | Sync | Internal |
| `sync_lag_seconds` | INTEGER | Yes | `0` | ≥ 0 | Lag | Internal |
| `twin_state` | JSONB | Yes | `'{}'` | — | Current state | Confidential |
| `twin_health` | ENUM | Yes | `HEALTHY` | HEALTHY, DEGRADED, UNSYNCHRONIZED, OFFLINE | Health | Internal |
| `historical_states_retained_days` | INTEGER | Yes | `365` | ≥ 30 | History | Internal |
| `simulation_capabilities` | JSONB | Yes | `'[]'` | — | Capabilities | Internal |
| `maintenance_simulation_enabled` | BOOLEAN | Yes | `false` | — | Maintenance sim | Internal |
| `production_simulation_enabled` | BOOLEAN | Yes | `false` | — | Production sim | Internal |
| `capacity_simulation_enabled` | BOOLEAN | Yes | `false` | — | Capacity sim | Internal |
| `what_if_analysis_enabled` | BOOLEAN | Yes | `true` | — | What-if | Internal |
| `ar_vr_enabled` | BOOLEAN | Yes | `false` | — | AR/VR | Internal |
| `visualization_url` | VARCHAR(500) | No | NULL | — | Viz URL | Internal |
| `access_permissions` | JSONB | Yes | `'[]'` | — | Permissions | Confidential |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ERROR | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

### 5. Relationships
| Related Entity | Relationship | Cardinality | Description |
|---|---|---|---|
| Simulation Engine (772) | Many-to-One | N:1 | Engine |
| Forecast Engine (773) | One-to-Many | 1:N | Forecasts |
| What-If Analysis (774) | One-to-Many | 1:N | Scenarios |

### 6. Indexes
- UNIQUE (`twin_model_code`)
- INDEX (`physical_entity_type`, `physical_entity_id`)
- INDEX (`twin_health`)

### 7. Security Classification
**Confidential** — live parameters and state.

### 8. Integration Points
- **IoT Service**: Real-time data feed
- **Simulation Engine** (Entity 772): Simulation
- **Forecast Engine** (Entity 773): Prediction
- **Decision Intelligence Engine** (FS-55, Q194): Decision input

### 9. Sample Data
```json
{
  "twin_model_code": "DT-MUM-FACTORY-001", "twin_model_name": "Mumbai Factory Digital Twin",
  "physical_entity_type": "FACTORIES", "physical_entity_id": "fac-mum",
  "twin_type": "OPERATIONAL",
  "model_3d_url": "https://3d.suop.com/models/mum-factory-v3.glb",
  "model_3d_format": "GLTF", "model_3d_version": "3.0",
  "real_time_data_feed": true, "iot_data_sources": ["MES", "SCADA", "IoT"],
  "live_parameters": [
    { "name": "production_rate", "value": 450, "unit": "units/hr" },
    { "name": "oee", "value": 82.5, "unit": "%" },
    { "name": "temperature", "value": 24.5, "unit": "°C" }
  ],
  "sync_frequency_seconds": 5, "sync_lag_seconds": 3,
  "twin_health": "HEALTHY", "simulation_capabilities": ["PRODUCTION", "MAINTENANCE", "CAPACITY"],
  "status": "ACTIVE"
}
```

### 10. Audit Events
`DIGITAL_TWIN_CREATED`, `DIGITAL_TWIN_SYNCHRONIZED`, `DIGITAL_TWIN_DESYNCED`, `DIGITAL_TWIN_SIMULATION_STARTED`, `DIGITAL_TWIN_SIMULATION_COMPLETED`, `DIGITAL_TWIN_HEALTH_DEGRADED`

---

## Entity 772 — Simulation Engine

### 1. Business Purpose
Per Part 15 §6: Supports Production, Inventory, Supply Chain, Labor, Finance, Maintenance. Multi-domain simulation engine.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `engine_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `engine_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `engine_description` | TEXT | No | NULL | — | Description | Internal |
| `simulation_domains` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | PRODUCTION (per Part 15), INVENTORY (per Part 15), SUPPLY_CHAIN (per Part 15), LABOR (per Part 15), FINANCE (per Part 15), MAINTENANCE (per Part 15), DEMAND, CAPACITY, LOGISTICS | Domains | Internal |
| `simulation_engine_type` | ENUM | Yes | `DISCRETE_EVENT` | DISCRETE_EVENT, AGENT_BASED, SYSTEM_DYNAMICS, MONTE_CARLO, HYBRID | Type | Internal |
| `simulation_software` | ENUM | Yes | `CUSTOM` | CUSTOM, ANYLOGIC, FLEXSIM, ARENA, SIMUL8, PYTHON_SIMPY, CUSTOM | Software | Internal |
| `max_simulation_duration_hours` | DECIMAL(7,2) | Yes | `168` | ≥ 1 | Max duration | Internal |
| `max_entities_simulated` | INTEGER | Yes | `100000` | ≥ 1 | Max entities | Internal |
| `parallel_simulations_supported` | INTEGER | Yes | `10` | ≥ 1 | Parallel | Internal |
| `real_time_factor` | DECIMAL(10,4) | Yes | `1.0000` | > 0 | RTF (1.0 = real-time) | Internal |
| `simulation_accuracy_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Accuracy | Internal |
| `calibration_status` | ENUM | Yes | `CALIBRATED` | UNCALIBRATED, CALIBRATING, CALIBRATED, STALE | Calibration | Internal |
| `last_calibrated_at` | TIMESTAMPTZ | No | NULL | — | Last | Internal |
| `calibration_data_window_days` | INTEGER | Yes | `365` | ≥ 30 | Window | Internal |
| `total_simulations_run` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `simulations_today` | INTEGER | Yes | `0` | ≥ 0 | Today | Internal |
| `successful_simulations` | BIGINT | Yes | `0` | ≥ 0 | Success | Internal |
| `failed_simulations` | BIGINT | Yes | `0` | ≥ 0 | Failed | Internal |
| `success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Rate | Internal |
| `avg_simulation_duration_minutes` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Avg | Internal |
| `digital_twin_models_count` | INTEGER | Yes | `0` | ≥ 0 | Twins | Internal |
| `data_sources_integrated` | JSONB | Yes | `'[]'` | — | Sources | Internal |
| `ai_optimization_enabled` | BOOLEAN | Yes | `true` | — | AI | Internal |
| `ai_model_id` | UUID | No | NULL | FK to `ml_model` | AI model | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, CALIBRATING, ERROR | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 773 — Forecast Engine

### 1. Business Purpose
Per Part 15 §6: Forecasts Sales, Demand, Inventory, Revenue, Cash Flow, Workforce, Maintenance. Enterprise forecast engine.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `forecast_engine_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `forecast_engine_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `forecast_categories` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | SALES (per Part 15), DEMAND (per Part 15), INVENTORY (per Part 15), REVENUE (per Part 15), CASH_FLOW (per Part 15), WORKFORCE (per Part 15), MAINTENANCE (per Part 15), PRODUCTION, ENERGY, SUPPLY | Categories | Internal |
| `forecast_methods` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | ARIMA, EXPONENTIAL_SMOOTHING, PROPHET, LSTM, TRANSFORMER, ENSEMBLE, HYBRID, MONTE_CARLO | Methods | Internal |
| `max_forecast_horizon_days` | INTEGER | Yes | `365` | ≥ 1 | Max horizon | Internal |
| `forecast_frequency` | ENUM | Yes | `DAILY` | REAL_TIME, HOURLY, DAILY, WEEKLY, MONTHLY | Frequency | Internal |
| `models_managed_count` | INTEGER | Yes | `0` | ≥ 0 | Models | Internal |
| `forecasts_generated_total` | BIGINT | Yes | `0` | ≥ 0 | Total | Internal |
| `forecasts_today` | INTEGER | Yes | `0` | ≥ 0 | Today | Internal |
| `avg_forecast_accuracy_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Accuracy | Internal |
| `accuracy_by_category` | JSONB | Yes | `'{}'` | — | By category | Internal |
| `accuracy_by_horizon` | JSONB | Yes | `'{}'` | — | By horizon | Internal |
| `accuracy_trend_30d` | JSONB | Yes | `'[]'` | — | Trend | Internal |
| `auto_retrain_enabled` | BOOLEAN | Yes | `true` | — | Auto-retrain | Internal |
| `retrain_frequency_days` | INTEGER | Yes | `30` | ≥ 1 | Frequency | Internal |
| `last_retrain_at` | TIMESTAMPTZ | No | NULL | — | Last | Internal |
| `model_drift_detection_enabled` | BOOLEAN | Yes | `true` | — | Drift detection | Internal |
| `model_drift_detected` | BOOLEAN | Yes | `false` | — | Drift | Internal |
| `champion_challenger_enabled` | BOOLEAN | Yes | `true` | — | A/B | Internal |
| `data_sources` | JSONB | Yes | `'[]'` | — | Sources | Internal |
| `digital_twin_integration_enabled` | BOOLEAN | Yes | `true` | — | Twin | Internal |
| `simulation_integration_enabled` | BOOLEAN | Yes | `true` | — | Simulation | Internal |
| `decision_intelligence_integration_enabled` | BOOLEAN | Yes | `true` | — | Decision | Internal |
| `applicable_company_id` | UUID | No | NULL | FK to `companies` | NULL = all | Internal |
| `effective_from` | TIMESTAMPTZ | Yes | — | — | Effective | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, RETRAINING, ERROR | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 774 — What-If Analysis

### 1. Business Purpose
Per Part 15 §6: Examples — Increase production by 20%, Open new warehouse, Hire 50 workers, Increase prices, Launch new product. Scenario-based what-if analysis.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `analysis_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `analysis_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `analysis_description` | TEXT | Yes | — | Min 20 | Description | Confidential |
| `scenario_examples` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | INCREASE_PRODUCTION (per Part 15), OPEN_NEW_WAREHOUSE (per Part 15), HIRE_WORKERS (per Part 15), INCREASE_PRICES (per Part 15), LAUNCH_NEW_PRODUCT (per Part 15), CLOSE_STORE, EXPAND_TO_NEW_MARKET, CHANGE_SUPPLIER, AUTOMATE_PROCESS, OTHER | Examples | Internal |
| `digital_twin_model_id` | UUID | No | NULL | FK to `digital_twin_model` (Entity 771) | Twin | Internal |
| `simulation_engine_id` | UUID | Yes | — | FK to `simulation_engine` (Entity 772) | Engine | Internal |
| `variables_changed` | JSONB | Yes | `'[]'` | — | [{ name, base_value, new_value, change_pct, change_reason }] | Confidential |
| `assumptions` | JSONB | Yes | `'[]'` | — | Assumptions | Confidential |
| `constraints` | JSONB | Yes | `'[]'` | — | Constraints | Confidential |
| `time_horizon_days` | INTEGER | Yes | `90` | ≥ 1 | Horizon | Internal |
| `simulation_runs_count` | INTEGER | Yes | `100` | ≥ 1 | Monte Carlo runs | Internal |
| `base_case_result` | JSONB | Yes | `'{}'` | — | Base | Confidential |
| `what_if_result` | JSONB | Yes | `'{}'` | — | What-if | Confidential |
| `delta_analysis` | JSONB | Yes | `'{}'` | — | Difference | Confidential |
| `financial_impact` | JSONB | Yes | `'{}'` | — | Financial | Confidential |
| `operational_impact` | JSONB | Yes | `'{}'` | — | Operational | Confidential |
| `risk_assessment` | JSONB | Yes | `'{}'` | — | Risk | Confidential |
| `sensitivity_analysis` | JSONB | Yes | `'[]'` | — | Sensitivity | Confidential |
| `probability_distribution` | JSONB | Yes | `'{}'` | — | Distribution | Confidential |
| `confidence_intervals` | JSONB | Yes | `'{}'` | — | CIs | Confidential |
| `recommendations` | JSONB | Yes | `'[]'` | — | Recommendations | Confidential |
| `decision_required` | BOOLEAN | Yes | `true` | — | Decision needed | Internal |
| `decision_made` | ENUM | No | NULL | APPROVED, REJECTED, DEFERRED, PENDING | Decision | Internal |
| `decision_maker` | UUID | No | NULL | FK to `identity_master` | Decision maker | Confidential |
| `decision_at` | TIMESTAMPTZ | No | NULL | — | Time | Internal |
| `decision_rationale` | TEXT | No | NULL | — | Rationale | Confidential |
| `created_by` | UUID | Yes | — | FK to `identity_master` | Creator | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `current_status` | ENUM | Yes | `DRAFT` | DRAFT, SIMULATING, COMPLETED, VALIDATED, APPROVED, REJECTED, ARCHIVED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 775 — Capacity Planning

### 1. Business Purpose
Per Part 15 §6: Calculates Machine Capacity, Labor Capacity, Warehouse Capacity, Transportation Capacity. Enterprise capacity planning.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `capacity_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `capacity_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `capacity_type` | ENUM | Yes | — | MACHINE_CAPACITY (per Part 15), LABOR_CAPACITY (per Part 15), WAREHOUSE_CAPACITY (per Part 15), TRANSPORTATION_CAPACITY (per Part 15), PRODUCTION, ENERGY, IT | Type | Internal |
| `business_module` | VARCHAR(50) | Yes | — | — | Module | Internal |
| `applicable_entity_type` | VARCHAR(100) | Yes | — | — | Entity type | Internal |
| `applicable_entity_id` | UUID | Yes | — | — | Entity ID | Internal |
| `planning_period_start` | DATE | Yes | — | — | Period | Internal |
| `planning_period_end` | DATE | Yes | — | > start | End | Internal |
| `planning_horizon` | ENUM | Yes | `MONTHLY` | DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY | Horizon | Internal |
| `total_capacity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Total | Internal |
| `capacity_unit` | VARCHAR(20) | Yes | — | — | Unit | Internal |
| `allocated_capacity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Allocated | Internal |
| `available_capacity` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Available | Internal |
| `utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Utilization | Internal |
| `planned_utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Planned | Internal |
| `projected_utilization_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Projected | Internal |
| `bottlenecks_identified` | JSONB | Yes | `'[]'` | — | Bottlenecks | Confidential |
| `bottlenecks_count` | INTEGER | Yes | `0` | ≥ 0 | Count | Internal |
| `capacity_gaps` | JSONB | Yes | `'[]'` | — | Gaps | Confidential |
| `capacity_surplus` | JSONB | Yes | `'[]'` | — | Surplus | Internal |
| `expansion_recommendations` | JSONB | Yes | `'[]'` | — | Expansion | Confidential |
| `optimization_recommendations` | JSONB | Yes | `'[]'` | — | Optimization | Confidential |
| `forecasted_demand` | JSONB | Yes | `'{}'` | — | Demand | Confidential |
| `scenario_analysis` | JSONB | Yes | `'[]'` | — | Scenarios | Confidential |
| `financial_impact` | JSONB | Yes | `'{}'` | — | Financial | Confidential |
| `created_by` | UUID | Yes | — | FK to `identity_master` | Creator | Confidential |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `current_status` | ENUM | Yes | `DRAFT` | DRAFT, CALCULATED, VALIDATED, APPROVED, ARCHIVED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 776 — Risk Simulation

### 1. Business Purpose
Per Part 15 §6: Predicts Supplier Failure, Machine Failure, Demand Drop, Price Increase, Labor Shortage. Enterprise risk simulation.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `risk_sim_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `risk_sim_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `risk_categories` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | SUPPLIER_FAILURE (per Part 15), MACHINE_FAILURE (per Part 15), DEMAND_DROP (per Part 15), PRICE_INCREASE (per Part 15), LABOR_SHORTAGE (per Part 15), SUPPLY_CHAIN_DISRUPTION, CYBERSECURITY, REGULATORY, FINANCIAL, NATURAL_DISASTER, GEOPOLITICAL, OTHER | Categories | Internal |
| `simulation_method` | ENUM | Yes | `MONTE_CARLO` | MONTE_CARLO, SCENARIO_BASED, DECISION_TREE, BAYESIAN_NETWORK, STRESS_TEST, HYBRID | Method | Internal |
| `simulation_runs_count` | INTEGER | Yes | `10000` | ≥ 1 | Runs | Internal |
| `time_horizon_days` | INTEGER | Yes | `365` | ≥ 1 | Horizon | Internal |
| `risk_events_simulated` | JSONB | Yes | `'[]'` | — | Events | Confidential |
| `probability_distribution` | JSONB | Yes | `'{}'` | — | Distribution | Confidential |
| `var_95` | DECIMAL(18,4) | Yes | `0` | — | VaR 95% | Confidential |
| `var_99` | DECIMAL(18,4) | Yes | `0` | — | VaR 99% | Confidential |
| `expected_loss` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Expected | Confidential |
| `max_loss` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Max | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `risk_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Risk score | Confidential |
| `risk_level` | ENUM | Yes | `MEDIUM` | LOW, MEDIUM, HIGH, CRITICAL | Level | Confidential |
| `impact_assessment` | JSONB | Yes | `'{}'` | — | Impact | Confidential |
| `mitigation_strategies` | JSONB | Yes | `'[]'` | — | Mitigations | Confidential |
| `contingency_plans` | JSONB | Yes | `'[]'` | — | Contingency | Confidential |
| `risk_appetite` | JSONB | Yes | `'{}'` | — | Appetite | Confidential |
| `recommendations` | JSONB | Yes | `'[]'` | — | Recommendations | Confidential |
| `correlation_analysis` | JSONB | Yes | `'{}'` | — | Correlations | Confidential |
| `stress_test_results` | JSONB | Yes | `'[]'` | — | Stress tests | Confidential |
| `created_by` | UUID | Yes | — | FK to `identity_master` | Creator | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `current_status` | ENUM | Yes | `DRAFT` | DRAFT, SIMULATING, COMPLETED, VALIDATED, APPROVED, ARCHIVED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 777 — Optimization Engine

### 1. Business Purpose
Per Part 15 §6: Optimizes Production, Inventory, Transportation, Labor, Energy, Scheduling. Enterprise optimization engine.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `optimization_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `optimization_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `optimization_domains` | TEXT[] | Yes | `ARRAY[]::TEXT[]` | PRODUCTION (per Part 15), INVENTORY (per Part 15), TRANSPORTATION (per Part 15), LABOR (per Part 15), ENERGY (per Part 15), SCHEDULING (per Part 15), SUPPLY_CHAIN, PRICING, ROUTING | Domains | Internal |
| `optimization_type` | ENUM | Yes | `LINEAR_PROGRAMMING` | LINEAR_PROGRAMMING, INTEGER_PROGRAMMING, MIXED_INTEGER, NONLINEAR, CONSTRAINT_SATISFACTION, HEURISTIC, METAHEURISTIC, AI_BASED | Type | Internal |
| `solver_engine` | ENUM | Yes | `CUSTOM` | CPLEX, GUROBI, SCIP, OR_TOOLS, CUSTOM | Solver | Internal |
| `objective_function` | TEXT | Yes | — | — | Objective | Confidential |
| `decision_variables` | JSONB | Yes | `'[]'` | — | Variables | Confidential |
| `constraints` | JSONB | Yes | `'[]'` | — | Constraints | Confidential |
| `optimization_goal` | ENUM | Yes | `MAXIMIZE` | MAXIMIZE, MINIMIZE, OPTIMIZE | Goal | Internal |
| `current_solution` | JSONB | Yes | `'{}'` | — | Current | Confidential |
| `optimized_solution` | JSONB | Yes | `'{}'` | — | Optimized | Confidential |
| `improvement_pct` | DECIMAL(7,2) | Yes | `0` | — | Improvement | Confidential |
| `financial_benefit` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Benefit | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `solving_time_seconds` | DECIMAL(7,2) | Yes | `0` | ≥ 0 | Time | Internal |
| `solution_quality` | ENUM | Yes | `OPTIMAL` | OPTIMAL, NEAR_OPTIMAL, FEASIBLE, INFEASIBLE | Quality | Internal |
| `optimality_gap_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Gap | Internal |
| `recommendations` | JSONB | Yes | `'[]'` | — | Recommendations | Confidential |
| `implementation_plan` | JSONB | Yes | `'[]'` | — | Plan | Confidential |
| `created_by` | UUID | Yes | — | FK to `identity_master` | Creator | Confidential |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `current_status` | ENUM | Yes | `DRAFT` | DRAFT, OPTIMIZING, COMPLETED, VALIDATED, APPROVED, IMPLEMENTED, ARCHIVED | Status | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE | Logical status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 778 — Enterprise Forecast Register

### 1. Business Purpose
Per Part 15 §6: Stores Forecast, Confidence, Scenario, Version, Approval. Enterprise forecast register.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `register_code` | VARCHAR(50) | Yes | — | Unique | Code | Internal |
| `register_name` | VARCHAR(200) | Yes | — | Min 3 | Display name | Internal |
| `forecast_category` | ENUM | Yes | — | SALES, DEMAND, INVENTORY, REVENUE, CASH_FLOW, WORKFORCE, MAINTENANCE, PRODUCTION, ENERGY, SUPPLY | Category | Internal |
| `forecast_entity_type` | VARCHAR(100) | Yes | — | — | Entity type | Internal |
| `forecast_entity_id` | UUID | No | NULL | — | Entity ID | Internal |
| `forecast_value` | DECIMAL(18,4) | Yes | `0` | — | Forecast (per Part 15) | Confidential |
| `forecast_unit` | VARCHAR(20) | Yes | — | — | Unit | Internal |
| `confidence_score` | DECIMAL(5,2) | Yes | `0` | 0-100 | Confidence (per Part 15) | Internal |
| `confidence_interval_lower` | DECIMAL(18,4) | No | NULL | — | Lower | Confidential |
| `confidence_interval_upper` | DECIMAL(18,4) | No | NULL | — | Upper | Confidential |
| `scenario` | ENUM | Yes | `BASELINE` | BEST_CASE (per Part 15), BASELINE (per Part 15), WORST_CASE (per Part 15), CUSTOM | Scenario | Internal |
| `forecast_horizon_days` | INTEGER | Yes | `90` | ≥ 1 | Horizon | Internal |
| `forecast_target_date` | DATE | Yes | — | — | Target | Internal |
| `forecast_generated_date` | DATE | Yes | — | — | Generated | Internal |
| `model_used` | VARCHAR(100) | Yes | — | — | Model | Internal |
| `model_version` | VARCHAR(20) | Yes | — | — | Version | Internal |
| `features_used` | JSONB | Yes | `'[]'` | — | Features | Confidential |
| `assumptions` | JSONB | Yes | `'[]'` | — | Assumptions | Confidential |
| `version` | VARCHAR(20) | Yes | `1.0` | — | Version (per Part 15) | Internal |
| `is_latest_version` | BOOLEAN | Yes | `true` | — | Latest | Internal |
| `previous_version_id` | UUID | No | NULL | FK to `enterprise_forecast_register` (self) | Previous | Internal |
| `approval_status` | ENUM | Yes | `PENDING` | PENDING, APPROVED (per Part 15), REJECTED, ARCHIVED | Approval (per Part 15) | Internal |
| `approved_by` | UUID | No | NULL | FK to `identity_master` | Approver | Confidential |
| `approved_at` | TIMESTAMPTZ | No | NULL | — | Approval | Internal |
| `outcome_actual` | DECIMAL(18,4) | No | NULL | — | Actual | Confidential |
| `outcome_variance_pct` | DECIMAL(5,2) | No | NULL | — | Variance | Confidential |
| `outcome_recorded_at` | TIMESTAMPTZ | No | NULL | — | Outcome | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `status` | ENUM | Yes | `ACTIVE` | ACTIVE, INACTIVE, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 779 — Simulation Dashboard

### 1. Business Purpose
Per Part 15 §6: Displays Forecast Accuracy, Capacity, Risks, Scenarios, Recommendations. AI: Demand Forecasting, Inventory Optimization, Production Optimization, Cash Flow Prediction, Enterprise Simulation.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `snapshot_type` | ENUM | Yes | `DAILY` | HOURLY, DAILY | Grain | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `forecast_accuracy_avg_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Forecast Accuracy (per Part 15) | Internal |
| `forecast_accuracy_by_category` | JSONB | Yes | `'{}'` | — | By category | Internal |
| `forecast_accuracy_trend` | JSONB | Yes | `'[]'` | — | Trend | Internal |
| `active_forecasts_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `forecasts_within_tolerance_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Tolerance | Internal |
| `capacity_utilization_avg_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Capacity (per Part 15) | Internal |
| `capacity_utilization_by_type` | JSONB | Yes | `'{}'` | — | By type | Internal |
| `bottlenecks_active_count` | INTEGER | Yes | `0` | ≥ 0 | Bottlenecks | Confidential |
| `capacity_gaps_count` | INTEGER | Yes | `0` | ≥ 0 | Gaps | Confidential |
| `capacity_expansion_recommendations` | INTEGER | Yes | `0` | ≥ 0 | Expansion | Confidential |
| `active_risks_count` | INTEGER | Yes | `0` | ≥ 0 | Risks (per Part 15) | Restricted |
| `risks_by_level` | JSONB | Yes | `'{}'` | — | By level | Restricted |
| `critical_risks_count` | INTEGER | Yes | `0` | ≥ 0 | Critical | Restricted |
| `var_95_total` | DECIMAL(18,4) | Yes | `0` | — | VaR 95% | Confidential |
| `var_99_total` | DECIMAL(18,4) | Yes | `0` | — | VaR 99% | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `scenarios_active_count` | INTEGER | Yes | `0` | ≥ 0 | Scenarios (per Part 15) | Internal |
| `scenarios_by_type` | JSONB | Yes | `'{}'` | — | By type | Internal |
| `what_if_analyses_today` | INTEGER | Yes | `0` | ≥ 0 | Today | Internal |
| `digital_twins_active_count` | INTEGER | Yes | `0` | ≥ 0 | Twins | Internal |
| `digital_twins_healthy_count` | INTEGER | Yes | `0` | ≥ 0 | Healthy | Internal |
| `digital_twins_desynced_count` | INTEGER | Yes | `0` | ≥ 0 | Desynced | Confidential |
| `simulations_run_today` | INTEGER | Yes | `0` | ≥ 0 | Simulations | Internal |
| `simulations_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success | Internal |
| `optimization_active_count` | INTEGER | Yes | `0` | ≥ 0 | Optimizations | Internal |
| `financial_benefit_identified` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Benefit | Confidential |
| `financial_benefit_realized` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Realized | Confidential |
| `recommendations_active_count` | INTEGER | Yes | `0` | ≥ 0 | Recommendations (per Part 15) | Confidential |
| `recommendations_pending_approval` | INTEGER | Yes | `0` | ≥ 0 | Pending | Internal |
| `recommendations_approved_count` | INTEGER | Yes | `0` | ≥ 0 | Approved | Internal |
| `recommendations_rejected_count` | INTEGER | Yes | `0` | ≥ 0 | Rejected | Internal |
| `trend_7d` | JSONB | Yes | `'[]'` | — | 7-day | Internal |
| `trend_30d` | JSONB | Yes | `'[]'` | — | 30-day | Internal |
| `ai_demand_forecasting` | JSONB | No | NULL | — | AI: Demand Forecasting (per Part 15 AI) | Confidential |
| `ai_inventory_optimization` | JSONB | No | NULL | — | AI: Inventory Optimization (per Part 15 AI) | Confidential |
| `ai_production_optimization` | JSONB | No | NULL | — | AI: Production Optimization (per Part 15 AI) | Confidential |
| `ai_cash_flow_prediction` | JSONB | No | NULL | — | AI: Cash Flow Prediction (per Part 15 AI) | Confidential |
| `ai_enterprise_simulation` | JSONB | No | NULL | — | AI: Enterprise Simulation (per Part 15 AI) | Restricted |
| `ai_insights_generated_at` | TIMESTAMPTZ | No | NULL | — | AI refresh | Internal |
| `ai_model_version` | VARCHAR(20) | No | NULL | — | Model | Internal |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, STALE | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

## Entity 780 — Executive Simulation Center

### 1. Business Purpose
Per Part 15 §6: Displays Digital Twin, Enterprise Map, Forecast, Optimization, Decision Impact. C-suite simulation center.

### 4. Field Dictionary
| Field | Type | Required | Default | Validation | Description | Security Class |
|---|---|---|---|---|---|---|
| `id` | UUID v7 | Yes | auto | PK | Internal ID | |
| `snapshot_date` | DATE | Yes | — | — | Snapshot | Internal |
| `company_id` | UUID | Yes | — | FK to `companies` | Company | Internal |
| `period_year` | INTEGER | Yes | — | — | Year | Internal |
| `period_quarter` | ENUM | No | NULL | Q1, Q2, Q3, Q4 | Quarter | Internal |
| `digital_twin_overview` | JSONB | Yes | `'{}'` | — | Digital Twin (per Part 15) summary | Internal |
| `digital_twins_active_count` | INTEGER | Yes | `0` | ≥ 0 | Twins | Internal |
| `digital_twins_by_type` | JSONB | Yes | `'{}'` | — | By type | Internal |
| `digital_twin_synchronization_health` | DECIMAL(5,2) | Yes | `0` | 0-100 | Sync health | Internal |
| `enterprise_map_url` | VARCHAR(500) | No | NULL | — | Enterprise Map (per Part 15) URL | Internal |
| `enterprise_map_interactive` | BOOLEAN | Yes | `true` | — | Interactive | Internal |
| `enterprise_map_layers` | JSONB | Yes | `'[]'` | — | Layers | Internal |
| `forecast_summary` | JSONB | Yes | `'{}'` | — | Forecast (per Part 15) | Confidential |
| `forecast_accuracy_avg_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Accuracy | Internal |
| `forecasts_by_category` | JSONB | Yes | `'{}'` | — | By category | Confidential |
| `key_forecasts` | JSONB | Yes | `'[]'` | — | Key | Confidential |
| `optimization_summary` | JSONB | Yes | `'{}'` | — | Optimization (per Part 15) | Confidential |
| `optimization_active_count` | INTEGER | Yes | `0` | ≥ 0 | Active | Internal |
| `financial_benefit_identified_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Identified | Confidential |
| `financial_benefit_realized_ytd` | DECIMAL(18,4) | Yes | `0` | ≥ 0 | Realized | Confidential |
| `currency_code` | CHAR(3) | Yes | `INR` | — | Currency | Internal |
| `decision_impact_summary` | JSONB | Yes | `'{}'` | — | Decision Impact (per Part 15) | Confidential |
| `decisions_pending_count` | INTEGER | Yes | `0` | ≥ 0 | Pending | Internal |
| `decisions_made_today` | INTEGER | Yes | `0` | ≥ 0 | Today | Internal |
| `decisions_made_mtd` | INTEGER | Yes | `0` | ≥ 0 | MTD | Internal |
| `decision_success_rate_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Success | Internal |
| `scenario_comparisons` | JSONB | Yes | `'[]'` | — | Comparisons | Confidential |
| `active_scenarios_count` | INTEGER | Yes | `0` | ≥ 0 | Scenarios | Internal |
| `risk_assessment_overview` | JSONB | Yes | `'{}'` | — | Risk | Restricted |
| `risk_level_overall` | ENUM | Yes | `MEDIUM` | LOW, MEDIUM, HIGH, CRITICAL | Level | Restricted |
| `var_95` | DECIMAL(18,4) | Yes | `0` | — | VaR 95% | Confidential |
| `var_99` | DECIMAL(18,4) | Yes | `0` | — | VaR 99% | Confidential |
| `capacity_utilization_overview` | JSONB | Yes | `'{}'` | — | Capacity | Internal |
| `capacity_utilization_avg_pct` | DECIMAL(5,2) | Yes | `0` | 0-100 | Avg | Internal |
| `bottlenecks_count` | INTEGER | Yes | `0` | ≥ 0 | Bottlenecks | Confidential |
| `recommendations_pending_count` | INTEGER | Yes | `0` | ≥ 0 | Pending | Internal |
| `recommendations_with_impact` | JSONB | Yes | `'[]'` | — | With impact | Confidential |
| `strategic_initiatives_tracked` | JSONB | Yes | `'[]'` | — | Initiatives | Confidential |
| `ai_decision_intelligence` | JSONB | No | NULL | — | AI decision intelligence | Restricted |
| `executive_summary` | TEXT | Yes | — | Min 100 | Summary | Confidential |
| `status` | ENUM | Yes | `COMPLETED` | DRAFT, COMPLETED, PRESENTED, ARCHIVED | Status | Internal |
| Universal base fields | — | Yes | — | — | Standard | |

---

# Part 15 Batch 2 Completion Summary

**All 30 Data Warehouse, BI & Digital Twin entities are now defined** at full enterprise-grade depth.

## Architectural Decisions Locked (Part 15 Batch 2)

1. **Enterprise Decision Intelligence Engine (Q194, FS-55)** — NEW — Above BI and Forecasting layers
2. **Enterprise Data Lake** — Raw data storage (structured/semi/unstructured/streaming)
3. **Enterprise Data Warehouse** — Star/Snowflake schemas with SCD, partitioning, materialized views
4. **ETL/ELT Pipeline** — Incremental sync with CDC, validation, retry
5. **Data Lineage** — Source → Transformation → Destination tracking
6. **Metadata Catalog** — Tables, columns, business definitions, owners, sensitivity
7. **Analytics Cubes** — OLAP with dimensions, measures, time intelligence, hierarchies, drill-down
8. **Snapshot Engine** — Daily/Weekly/Monthly/Yearly point-in-time snapshots
9. **Data Quality Engine** — Completeness, accuracy, consistency, duplicates, null values
10. **Data Governance** — Ownership, classification, retention, privacy, compliance
11. **KPI Library** — "One KPI. One Formula. One Source of Truth." with version control
12. **KPI Calculation Engine** — Real-time/5-min/Hourly/Daily/Monthly computation
13. **Dashboard Widget** — Cards, Charts, Tables, Heat Maps, Maps, Gauges
14. **Dashboard Templates** — CEO, COO, CFO, Warehouse, Manufacturing, Retail, Restaurant, HR, Maintenance
15. **Report Scheduler** — Daily/Weekly/Monthly/Quarterly with Email/PDF/Excel delivery
16. **Predictive Analytics** — Sales, Inventory, Demand, Cash Flow, Attrition, Maintenance, Production
17. **Trend Analysis** — Growth, Decline, Seasonality, Moving Average, Variance
18. **Scenario Modeling** — Best/Expected/Worst Case with Custom Simulation
19. **Executive KPI Dashboard** — Revenue, Profit, Inventory, OEE, CSAT, Payroll, Maintenance
20. **BI Mission Dashboard** — KPI Health, Forecast Accuracy, Data Freshness, Executive Alerts
21. **Digital Twin Model** — Factories, Warehouses, Retail, Restaurants, Distribution Centers
22. **Simulation Engine** — Production, Inventory, Supply Chain, Labor, Finance, Maintenance
23. **Forecast Engine** — Sales, Demand, Inventory, Revenue, Cash Flow, Workforce, Maintenance
24. **What-If Analysis** — Production increase, New warehouse, Hiring, Price changes, New products
25. **Capacity Planning** — Machine, Labor, Warehouse, Transportation capacity
26. **Risk Simulation** — Supplier/Machine failure, Demand drop, Price increase, Labor shortage
27. **Optimization Engine** — Production, Inventory, Transportation, Labor, Energy, Scheduling
28. **Enterprise Forecast Register** — Versioned forecasts with confidence and approval
29. **AI Capabilities** — 14 AI capabilities across the three sections

## New Foundation Service Locked

### Enterprise Decision Intelligence Engine — Foundation Service #55

| Attribute | Value |
|---|---|
| Service ID | FS-55 |
| Architectural Decision | Q194 |
| Status | LOCKED |
| Owner | Enterprise Architect (Platform Kernel team) |
| Position | **ABOVE** BI Engine, Forecast Engine, Simulation Engine |
| Consumers | Executives and business modules via `DecisionIntelligenceEngine.recommend(context)` |
| Capabilities | Combine analytics + live data + AI forecasts, scenario comparison, impact estimation, confidence scoring, workflow execution, complete audit trail |
| Design Principle | Move from reactive reporting to proactive, data-driven decision-making |
| Elevation | SUOP elevated beyond reporting platform into **Enterprise Decision Intelligence Platform** |

## 14 AI Capabilities Locked (Batch 2)

| Section | AI Capabilities |
|---|---|
| Data Warehouse | Anomaly Detection, Data Quality Suggestions, Pipeline Optimization, Metadata Recommendation |
| BI | KPI Explanation, Forecast Recommendation, Anomaly Detection, Narrative Reporting, Decision Support |
| Digital Twin | Demand Forecasting, Inventory Optimization, Production Optimization, Cash Flow Prediction, Enterprise Simulation |

## Part 15 Progress Tracker

| Batch | Sections | Entities | Status |
|---|---|---|---|
| Batch 1 | 1-3 (AI Gateway, Knowledge, Copilot) | 721-750 | ✅ COMPLETE |
| **Batch 2** | **4-6 (Data Warehouse, BI, Digital Twin)** | **751-780** | **✅ COMPLETE (LOCKED)** |
| Batch 3 (Final) | 7-9 (AI Agents, Mission Control, Observability) | 781-810 | ⏳ PENDING |

## Cumulative Status

- **Manual 1 cumulative**: 785 entities (Parts 1-15 Batch 2)
- **Foundation Services**: 55 (FS-1 through FS-55) + Platform Kernel (Q189/Q192) as meta-architecture
- **Architectural Decisions**: 194 (Q1-Q194)

---

*End of Manual 1 Part 15 Sections 4-6. Next batch: Part 15 Batch 3 (Final) — Sections 7-9 (Enterprise Automation AI, Autonomous Workflows & AI Agents; Executive Mission Control, Command Center & Cross-Module Intelligence; Enterprise Observability, Platform Intelligence & Future AI Roadmap). This final batch will complete Part 15, Volume 0.5, and the entire enterprise architecture.*

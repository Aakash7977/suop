-- ════════════════════════════════════════════════════════════════════════════
-- SUOP ERP — Phases 51-55: Business Intelligence, AI & Executive Analytics
-- Migration 0019: BI & Analytics (5 phases, ~35 tables)
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 51: ENTERPRISE BI FOUNDATION (8 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "bi_fact_sales" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "date_id" DATE NOT NULL, "fiscal_year" TEXT, "period" TEXT,
    "company_id" UUID, "company_name" TEXT, "plant_id" UUID, "plant_name" TEXT,
    "customer_id" UUID, "customer_name" TEXT, "customer_group" TEXT,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT, "product_category" TEXT,
    "salesperson_id" UUID, "salesperson_name" TEXT,
    "so_number" TEXT, "invoice_number" TEXT,
    "quantity" DECIMAL(14,3) DEFAULT 0, "unit_price" DECIMAL(18,4) DEFAULT 0,
    "gross_amount" DECIMAL(18,2) DEFAULT 0, "discount_amount" DECIMAL(18,2) DEFAULT 0,
    "tax_amount" DECIMAL(18,2) DEFAULT 0, "net_amount" DECIMAL(18,2) DEFAULT 0,
    "cost_amount" DECIMAL(18,2) DEFAULT 0, "margin_amount" DECIMAL(18,2) DEFAULT 0,
    "margin_percent" DECIMAL(5,2) DEFAULT 0, "currency" TEXT DEFAULT 'INR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bi_fact_sales_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "bi_fact_procurement" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "date_id" DATE NOT NULL, "fiscal_year" TEXT, "period" TEXT,
    "company_id" UUID, "company_name" TEXT, "plant_id" UUID, "plant_name" TEXT,
    "supplier_id" UUID, "supplier_name" TEXT,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "po_number" TEXT, "grn_number" TEXT, "invoice_number" TEXT,
    "quantity" DECIMAL(14,3) DEFAULT 0, "unit_price" DECIMAL(18,4) DEFAULT 0,
    "gross_amount" DECIMAL(18,2) DEFAULT 0, "tax_amount" DECIMAL(18,2) DEFAULT 0,
    "net_amount" DECIMAL(18,2) DEFAULT 0, "currency" TEXT DEFAULT 'INR',
    "lead_time_days" INTEGER, "quality_rejected" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bi_fact_procurement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "bi_fact_production" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "date_id" DATE NOT NULL, "fiscal_year" TEXT, "period" TEXT,
    "plant_id" UUID, "plant_name" TEXT, "work_center_id" UUID, "work_center_code" TEXT,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "production_order_number" TEXT, "batch_number" TEXT,
    "planned_qty" DECIMAL(14,3) DEFAULT 0, "produced_qty" DECIMAL(14,3) DEFAULT 0,
    "rejected_qty" DECIMAL(14,3) DEFAULT 0, "scrap_qty" DECIMAL(14,3) DEFAULT 0,
    "yield_percent" DECIMAL(5,2) DEFAULT 0, "wastage_percent" DECIMAL(5,2) DEFAULT 0,
    "planned_cost" DECIMAL(18,2) DEFAULT 0, "actual_cost" DECIMAL(18,2) DEFAULT 0,
    "cost_variance" DECIMAL(18,2) DEFAULT 0, "runtime_hours" DECIMAL(8,2) DEFAULT 0,
    "downtime_hours" DECIMAL(8,2) DEFAULT 0, "oee" DECIMAL(5,2) DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bi_fact_production_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "bi_fact_inventory" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "date_id" DATE NOT NULL,
    "warehouse_id" UUID, "warehouse_name" TEXT,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "batch_number" TEXT, "expiry_date" DATE,
    "quantity" DECIMAL(14,3) DEFAULT 0, "uom_code" TEXT,
    "unit_cost" DECIMAL(18,4) DEFAULT 0, "total_value" DECIMAL(18,2) DEFAULT 0,
    "reserved_qty" DECIMAL(14,3) DEFAULT 0, "blocked_qty" DECIMAL(14,3) DEFAULT 0,
    "available_qty" DECIMAL(14,3) DEFAULT 0, "is_expired" BOOLEAN DEFAULT false,
    "currency" TEXT DEFAULT 'INR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bi_fact_inventory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "bi_fact_finance" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "date_id" DATE NOT NULL, "fiscal_year" TEXT, "period" TEXT,
    "account_id" UUID, "account_code" TEXT, "account_name" TEXT, "account_type" TEXT,
    "cost_center_id" UUID, "cost_center_code" TEXT,
    "debit_amount" DECIMAL(18,2) DEFAULT 0, "credit_amount" DECIMAL(18,2) DEFAULT 0,
    "balance" DECIMAL(18,2) DEFAULT 0, "currency" TEXT DEFAULT 'INR',
    "source_type" TEXT, "source_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bi_fact_finance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "bi_kpi_repository" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "kpi_code" TEXT NOT NULL, "kpi_name" TEXT NOT NULL,
    "kpi_category" TEXT NOT NULL, "kpi_type" TEXT DEFAULT 'PERCENTAGE',
    "calculation_formula" TEXT, "data_source" TEXT,
    "target_value" DECIMAL(18,4), "warning_threshold" DECIMAL(18,4), "critical_threshold" DECIMAL(18,4),
    "frequency" TEXT DEFAULT 'MONTHLY', "unit" TEXT,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bi_kpi_repository_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_bikpi_tenant_code" UNIQUE ("tenant_id", "kpi_code")
);

CREATE TABLE IF NOT EXISTS "bi_kpi_snapshots" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "kpi_id" UUID NOT NULL, "kpi_code" TEXT, "kpi_name" TEXT,
    "period" TEXT NOT NULL, "period_start" DATE, "period_end" DATE,
    "actual_value" DECIMAL(18,4) NOT NULL, "target_value" DECIMAL(18,4),
    "achievement_percent" DECIMAL(5,2) DEFAULT 0,
    "trend" TEXT DEFAULT 'STABLE', "trend_percent" DECIMAL(5,2) DEFAULT 0,
    "status" TEXT DEFAULT 'ON_TARGET',
    "dimension1" TEXT, "dimension2" TEXT, "dimension3" TEXT,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bi_kpi_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "bi_etl_jobs" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "job_code" TEXT NOT NULL, "job_name" TEXT NOT NULL,
    "source_type" TEXT NOT NULL, "source_query" TEXT,
    "target_table" TEXT NOT NULL,
    "schedule_cron" TEXT, "is_active" BOOLEAN DEFAULT true,
    "last_run_at" TIMESTAMP(3), "last_run_status" TEXT, "last_run_duration_ms" BIGINT,
    "records_processed" BIGINT DEFAULT 0, "records_inserted" BIGINT DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bi_etl_jobs_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_etl_tenant_code" UNIQUE ("tenant_id", "job_code")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 52: EXECUTIVE DASHBOARDS (4 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "dashboards" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "dashboard_code" TEXT NOT NULL, "dashboard_name" TEXT NOT NULL,
    "dashboard_type" TEXT NOT NULL DEFAULT 'EXECUTIVE',
    "target_role" TEXT, "is_default" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "layout_config" JSONB,
    "created_by" UUID, "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_dash_tenant_code" UNIQUE ("tenant_id", "dashboard_code")
);

CREATE TABLE IF NOT EXISTS "dashboard_widgets" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "dashboard_id" UUID NOT NULL, "widget_code" TEXT NOT NULL,
    "widget_name" TEXT NOT NULL, "widget_type" TEXT NOT NULL,
    "data_source" TEXT, "query_config" JSONB,
    "chart_config" JSONB, "grid_position" JSONB,
    "refresh_interval_seconds" INTEGER DEFAULT 300,
    "is_active" BOOLEAN DEFAULT true, "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dashboard_widgets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "dashboard_data_cache" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "widget_id" UUID NOT NULL, "cache_key" TEXT,
    "data" JSONB NOT NULL, "metadata" JSONB,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dashboard_data_cache_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "executive_scorecards" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "scorecard_code" TEXT NOT NULL, "scorecard_name" TEXT NOT NULL,
    "executive_role" TEXT NOT NULL,
    "period" TEXT NOT NULL, "period_start" DATE, "period_end" DATE,
    "overall_score" DECIMAL(5,2) DEFAULT 0, "overall_grade" TEXT,
    "metrics" JSONB,
    "status" TEXT DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "executive_scorecards_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_esc_tenant_code_period" UNIQUE ("tenant_id", "scorecard_code", "period")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 53: AI PREDICTION & FORECASTING (6 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "ai_forecasts" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "forecast_code" TEXT NOT NULL, "forecast_type" TEXT NOT NULL,
    "forecast_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "target_entity" TEXT, "target_id" UUID, "target_name" TEXT,
    "forecast_horizon" TEXT DEFAULT 'MONTHLY',
    "forecast_start_date" DATE, "forecast_end_date" DATE,
    "historical_data_points" INTEGER DEFAULT 0,
    "forecast_data" JSONB NOT NULL,
    "confidence_level" DECIMAL(5,2) DEFAULT 80,
    "accuracy_score" DECIMAL(5,2),
    "model_type" TEXT DEFAULT 'LINEAR_REGRESSION',
    "model_params" JSONB,
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "created_by" UUID, "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_forecasts_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_aif_tenant_code" UNIQUE ("tenant_id", "forecast_code")
);

CREATE TABLE IF NOT EXISTS "ai_predictions" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "prediction_code" TEXT NOT NULL, "prediction_type" TEXT NOT NULL,
    "prediction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "target_entity" TEXT, "target_id" UUID, "target_name" TEXT,
    "prediction_value" DECIMAL(18,4), "prediction_probability" DECIMAL(5,2),
    "prediction_label" TEXT, "confidence_score" DECIMAL(5,2) DEFAULT 80,
    "risk_level" TEXT DEFAULT 'LOW',
    "contributing_factors" JSONB, "recommendation" TEXT,
    "model_type" TEXT DEFAULT 'CLASSIFICATION',
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_predictions_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_aip_tenant_code" UNIQUE ("tenant_id", "prediction_code")
);

CREATE TABLE IF NOT EXISTS "ai_anomalies" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "anomaly_code" TEXT NOT NULL, "anomaly_type" TEXT NOT NULL,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entity_type" TEXT, "entity_id" UUID, "entity_name" TEXT,
    "metric_name" TEXT, "expected_value" DECIMAL(18,4), "actual_value" DECIMAL(18,4),
    "deviation_percent" DECIMAL(5,2), "deviation_direction" TEXT,
    "severity" TEXT DEFAULT 'WARNING',
    "description" TEXT, "root_cause_suggestion" TEXT,
    "is_resolved" BOOLEAN DEFAULT false, "resolved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DETECTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_anomalies_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_anom_tenant_code" UNIQUE ("tenant_id", "anomaly_code")
);

CREATE TABLE IF NOT EXISTS "ai_recommendations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "recommendation_code" TEXT NOT NULL, "recommendation_type" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "target_entity" TEXT, "target_id" UUID, "target_name" TEXT,
    "recommendation_text" TEXT NOT NULL,
    "expected_benefit" TEXT, "priority" TEXT DEFAULT 'MEDIUM',
    "confidence_score" DECIMAL(5,2) DEFAULT 70,
    "supporting_data" JSONB,
    "is_actioned" BOOLEAN DEFAULT false, "actioned_at" TIMESTAMP(3), "actioned_by" UUID,
    "action_taken" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_air_tenant_code" UNIQUE ("tenant_id", "recommendation_code")
);

CREATE TABLE IF NOT EXISTS "ai_models" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "model_code" TEXT NOT NULL, "model_name" TEXT NOT NULL,
    "model_type" TEXT NOT NULL, "model_category" TEXT NOT NULL,
    "version" TEXT DEFAULT '1.0',
    "training_data_range_start" DATE, "training_data_range_end" DATE,
    "accuracy_score" DECIMAL(5,2), "precision_score" DECIMAL(5,2),
    "is_active" BOOLEAN DEFAULT true,
    "last_trained_at" TIMESTAMP(3),
    "model_params" JSONB, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_models_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_aim_tenant_code" UNIQUE ("tenant_id", "model_code")
);

CREATE TABLE IF NOT EXISTS "ai_insights" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "insight_code" TEXT NOT NULL, "insight_type" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "insight_category" TEXT, "insight_title" TEXT NOT NULL,
    "insight_summary" TEXT NOT NULL, "insight_detail" TEXT,
    "data_points" JSONB, "confidence_score" DECIMAL(5,2) DEFAULT 70,
    "impact_level" TEXT DEFAULT 'MEDIUM',
    "related_entity_type" TEXT, "related_entity_id" UUID,
    "recommended_actions" TEXT,
    "is_read" BOOLEAN DEFAULT false, "read_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_insights_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_aii_tenant_code" UNIQUE ("tenant_id", "insight_code")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 54: REPORTING PLATFORM (5 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "reports" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "report_code" TEXT NOT NULL, "report_name" TEXT NOT NULL,
    "report_type" TEXT NOT NULL DEFAULT 'TABULAR',
    "report_category" TEXT NOT NULL,
    "data_source" TEXT, "query_config" JSONB,
    "column_config" JSONB, "filter_config" JSONB,
    "group_by" TEXT, "order_by" TEXT,
    "chart_config" JSONB,
    "is_scheduled" BOOLEAN DEFAULT false, "schedule_cron" TEXT,
    "is_published" BOOLEAN DEFAULT false,
    "created_by" UUID, "created_by_name" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "reports_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_rep_tenant_code" UNIQUE ("tenant_id", "report_code")
);

CREATE TABLE IF NOT EXISTS "report_templates" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "template_code" TEXT NOT NULL, "template_name" TEXT NOT NULL,
    "template_category" TEXT NOT NULL,
    "description" TEXT, "preview_image_url" TEXT,
    "config" JSONB NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "report_templates_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_rt_tenant_code" UNIQUE ("tenant_id", "template_code")
);

CREATE TABLE IF NOT EXISTS "report_executions" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "report_id" UUID, "report_code" TEXT, "report_name" TEXT,
    "execution_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parameters" JSONB,
    "row_count" INTEGER DEFAULT 0,
    "output_format" TEXT DEFAULT 'JSON',
    "output_url" TEXT, "output_size_bytes" BIGINT,
    "execution_duration_ms" BIGINT,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "error_message" TEXT,
    "executed_by" UUID, "executed_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_executions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "scheduled_reports" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "schedule_code" TEXT NOT NULL, "report_id" UUID NOT NULL, "report_code" TEXT,
    "schedule_name" TEXT NOT NULL,
    "schedule_cron" TEXT NOT NULL,
    "output_format" TEXT DEFAULT 'PDF',
    "recipients" TEXT[],
    "parameters" JSONB,
    "is_active" BOOLEAN DEFAULT true,
    "last_run_at" TIMESTAMP(3), "next_run_at" TIMESTAMP(3),
    "last_run_status" TEXT,
    "created_by" UUID, "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scheduled_reports_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_sr_tenant_code" UNIQUE ("tenant_id", "schedule_code")
);

CREATE TABLE IF NOT EXISTS "saved_reports" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "report_id" UUID, "report_code" TEXT,
    "saved_name" TEXT NOT NULL, "description" TEXT,
    "parameters" JSONB, "column_config" JSONB,
    "owner_id" UUID, "owner_name" TEXT,
    "is_shared" BOOLEAN DEFAULT false, "shared_with" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_reports_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 55: ALERTS, NOTIFICATIONS & KPI ENGINE (5 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "alert_rules" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "rule_code" TEXT NOT NULL, "rule_name" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL DEFAULT 'THRESHOLD',
    "entity_type" TEXT, "metric_name" TEXT,
    "condition_operator" TEXT NOT NULL, "condition_value" DECIMAL(18,4),
    "warning_threshold" DECIMAL(18,4), "critical_threshold" DECIMAL(18,4),
    "evaluation_frequency" TEXT DEFAULT 'HOURLY',
    "is_active" BOOLEAN DEFAULT true,
    "notification_channels" TEXT[],
    "escalation_rule_id" UUID,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "alert_rules_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_ar_tenant_code" UNIQUE ("tenant_id", "rule_code")
);

CREATE TABLE IF NOT EXISTS "alerts" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "alert_number" TEXT NOT NULL, "alert_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rule_id" UUID, "rule_code" TEXT, "rule_name" TEXT,
    "alert_type" TEXT NOT NULL, "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "entity_type" TEXT, "entity_id" UUID, "entity_name" TEXT,
    "metric_name" TEXT, "metric_value" DECIMAL(18,4),
    "threshold_value" DECIMAL(18,4), "condition_met" TEXT,
    "message" TEXT NOT NULL, "description" TEXT,
    "assigned_to" UUID, "assigned_to_name" TEXT,
    "acknowledged_by" UUID, "acknowledged_by_name" TEXT, "acknowledged_at" TIMESTAMP(3),
    "resolved_by" UUID, "resolved_by_name" TEXT, "resolved_at" TIMESTAMP(3),
    "resolution" TEXT,
    "escalation_level" INTEGER DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_alert_tenant_number" UNIQUE ("tenant_id", "alert_number")
);

CREATE TABLE IF NOT EXISTS "alert_escalations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "alert_id" UUID NOT NULL, "alert_number" TEXT,
    "escalation_level" INTEGER NOT NULL,
    "escalated_from" UUID, "escalated_from_name" TEXT,
    "escalated_to" UUID, "escalated_to_name" TEXT,
    "escalation_reason" TEXT NOT NULL,
    "escalated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "alert_escalations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "notification_digests" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "digest_type" TEXT NOT NULL, "digest_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipient_id" UUID, "recipient_name" TEXT,
    "period" TEXT,
    "summary" JSONB NOT NULL,
    "alert_count" INTEGER DEFAULT 0, "kpi_count" INTEGER DEFAULT 0,
    "insight_count" INTEGER DEFAULT 0, "recommendation_count" INTEGER DEFAULT 0,
    "is_sent" BOOLEAN DEFAULT false, "sent_at" TIMESTAMP(3),
    "email_subject" TEXT, "email_body" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notification_digests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "kpi_monitoring" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "kpi_id" UUID, "kpi_code" TEXT, "kpi_name" TEXT,
    "monitoring_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_value" DECIMAL(18,4) NOT NULL,
    "target_value" DECIMAL(18,4), "previous_value" DECIMAL(18,4),
    "variance_percent" DECIMAL(5,2) DEFAULT 0,
    "trend" TEXT DEFAULT 'STABLE',
    "status" TEXT DEFAULT 'ON_TARGET',
    "alert_triggered" BOOLEAN DEFAULT false, "alert_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "kpi_monitoring_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS "idx_bifs_tenant_date" ON "bi_fact_sales"("tenant_id", "date_id");
CREATE INDEX IF NOT EXISTS "idx_bifs_tenant_product" ON "bi_fact_sales"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_bifs_tenant_customer" ON "bi_fact_sales"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_bifp_tenant_date" ON "bi_fact_procurement"("tenant_id", "date_id");
CREATE INDEX IF NOT EXISTS "idx_bifp_tenant_supplier" ON "bi_fact_procurement"("tenant_id", "supplier_id");
CREATE INDEX IF NOT EXISTS "idx_bifprod_tenant_date" ON "bi_fact_production"("tenant_id", "date_id");
CREATE INDEX IF NOT EXISTS "idx_bifinv_tenant_date" ON "bi_fact_inventory"("tenant_id", "date_id");
CREATE INDEX IF NOT EXISTS "idx_biffin_tenant_date" ON "bi_fact_finance"("tenant_id", "date_id");
CREATE INDEX IF NOT EXISTS "idx_bikpi_tenant_active" ON "bi_kpi_repository"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_bikpis_tenant_period" ON "bi_kpi_snapshots"("tenant_id", "period");
CREATE INDEX IF NOT EXISTS "idx_etl_tenant_active" ON "bi_etl_jobs"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_dash_tenant_active" ON "dashboards"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_dw_dashboard" ON "dashboard_widgets"("dashboard_id");
CREATE INDEX IF NOT EXISTS "idx_ddc_widget" ON "dashboard_data_cache"("widget_id");
CREATE INDEX IF NOT EXISTS "idx_esc_tenant_period" ON "executive_scorecards"("tenant_id", "period");
CREATE INDEX IF NOT EXISTS "idx_aif_tenant_type" ON "ai_forecasts"("tenant_id", "forecast_type");
CREATE INDEX IF NOT EXISTS "idx_aip_tenant_type" ON "ai_predictions"("tenant_id", "prediction_type");
CREATE INDEX IF NOT EXISTS "idx_anom_tenant_status" ON "ai_anomalies"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_air_tenant_status" ON "ai_recommendations"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_aim_tenant_active" ON "ai_models"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_aii_tenant_status" ON "ai_insights"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_rep_tenant_category" ON "reports"("tenant_id", "report_category");
CREATE INDEX IF NOT EXISTS "idx_rt_tenant_active" ON "report_templates"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_re_tenant_date" ON "report_executions"("tenant_id", "execution_date");
CREATE INDEX IF NOT EXISTS "idx_schr_tenant_active" ON "scheduled_reports"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_savedr_tenant_owner" ON "saved_reports"("tenant_id", "owner_id");
CREATE INDEX IF NOT EXISTS "idx_arule_tenant_active" ON "alert_rules"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_alert_tenant_status" ON "alerts"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_alert_tenant_severity" ON "alerts"("tenant_id", "severity");
CREATE INDEX IF NOT EXISTS "idx_ae_alert" ON "alert_escalations"("alert_id");
CREATE INDEX IF NOT EXISTS "idx_nd_tenant_type" ON "notification_digests"("tenant_id", "digest_type");
CREATE INDEX IF NOT EXISTS "idx_km_tenant_date" ON "kpi_monitoring"("tenant_id", "monitoring_date");

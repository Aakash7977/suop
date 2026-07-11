-- ════════════════════════════════════════════════════════════════════════════
-- SUOP ERP — Phases 21-26: Enterprise Quality Management System (QMS) Domain
-- Migration 0014: QMS (6 phases, ~35 tables)
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 21: QUALITY FOUNDATION (8 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "quality_standards" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "standard_code" TEXT NOT NULL, "standard_name" TEXT NOT NULL,
    "standard_type" TEXT DEFAULT 'INTERNAL', "version" TEXT DEFAULT '1.0',
    "issuing_body" TEXT, "effective_date" DATE, "expiry_date" DATE,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "quality_standards_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_qs_tenant_code" UNIQUE ("tenant_id", "standard_code")
);

CREATE TABLE IF NOT EXISTS "inspection_types" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "type_code" TEXT NOT NULL, "type_name" TEXT NOT NULL,
    "inspection_category" TEXT NOT NULL DEFAULT 'IQC',
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "inspection_types_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_it_type_tenant_code" UNIQUE ("tenant_id", "type_code")
);

CREATE TABLE IF NOT EXISTS "quality_specifications" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "spec_code" TEXT NOT NULL, "spec_name" TEXT NOT NULL,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "spec_type" TEXT DEFAULT 'PRODUCT', "version" TEXT DEFAULT '1.0',
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "quality_specifications_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_qspec_tenant_code" UNIQUE ("tenant_id", "spec_code")
);

CREATE TABLE IF NOT EXISTS "test_methods" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "method_code" TEXT NOT NULL, "method_name" TEXT NOT NULL,
    "method_type" TEXT, "standard_reference" TEXT,
    "equipment_required" TEXT, "duration_hours" DECIMAL(8,2),
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "test_methods_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_tm_tenant_code" UNIQUE ("tenant_id", "method_code")
);

CREATE TABLE IF NOT EXISTS "test_parameters" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "spec_id" UUID, "method_id" UUID,
    "parameter_code" TEXT NOT NULL, "parameter_name" TEXT NOT NULL,
    "parameter_type" TEXT NOT NULL DEFAULT 'NUMERIC',
    "target_value" TEXT, "min_value" TEXT, "max_value" TEXT,
    "unit" TEXT, "tolerance_percent" DECIMAL(5,2),
    "is_mandatory" BOOLEAN DEFAULT true, "is_critical" BOOLEAN DEFAULT false,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "test_parameters_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "inspection_templates" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "template_code" TEXT NOT NULL, "template_name" TEXT NOT NULL,
    "inspection_type_id" UUID, "product_id" UUID, "product_category_id" UUID,
    "spec_id" UUID, "is_active" BOOLEAN DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "inspection_templates_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_qit_tenant_code" UNIQUE ("tenant_id", "template_code")
);

CREATE TABLE IF NOT EXISTS "inspection_template_items" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "template_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "parameter_id" UUID, "parameter_code" TEXT, "parameter_name" TEXT,
    "test_method_id" UUID, "test_method_code" TEXT,
    "specification" TEXT, "min_value" TEXT, "max_value" TEXT, "target_value" TEXT,
    "unit" TEXT, "is_mandatory" BOOLEAN DEFAULT true, "is_critical" BOOLEAN DEFAULT false,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inspection_template_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "quality_kpis" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "kpi_code" TEXT NOT NULL, "kpi_name" TEXT NOT NULL,
    "kpi_type" TEXT, "kpi_value" DECIMAL(14,4), "kpi_target" DECIMAL(14,4),
    "kpi_unit" TEXT, "period" TEXT, "period_start" DATE, "period_end" DATE,
    "trend" TEXT DEFAULT 'STABLE', "status" TEXT DEFAULT 'ON_TARGET',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quality_kpis_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_qkpi_tenant_code_period" UNIQUE ("tenant_id", "kpi_code", "period")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 22: NON-CONFORMANCE MANAGEMENT (5 tables — extends Phase 12 ncrs)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "ncr_root_causes" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "ncr_id" UUID NOT NULL,
    "root_cause_category" TEXT NOT NULL,
    "root_cause_description" TEXT NOT NULL,
    "analysis_method" TEXT DEFAULT '5WHY',
    "fishbone_category" TEXT,
    "identified_by" UUID, "identified_by_name" TEXT,
    "identified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_verified" BOOLEAN DEFAULT false,
    "verified_by" UUID, "verified_by_name" TEXT, "verified_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ncr_root_causes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ncr_containments" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "ncr_id" UUID NOT NULL,
    "containment_action" TEXT NOT NULL,
    "containment_type" TEXT NOT NULL DEFAULT 'IMMEDIATE',
    "affected_qty" DECIMAL(14,3), "affected_location" TEXT,
    "implemented_by" UUID, "implemented_by_name" TEXT,
    "implemented_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_effective" BOOLEAN DEFAULT false,
    "verified_by" UUID, "verified_by_name" TEXT, "verified_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ncr_containments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ncr_dispositions" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "ncr_id" UUID NOT NULL,
    "disposition_type" TEXT NOT NULL,
    "disposition_reason" TEXT NOT NULL,
    "disposition_qty" DECIMAL(14,3),
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "status" TEXT DEFAULT 'PENDING',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ncr_dispositions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "material_holds" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "hold_number" TEXT NOT NULL, "hold_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hold_type" TEXT NOT NULL DEFAULT 'NCR',
    "source_id" UUID, "source_type" TEXT, "source_number" TEXT,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "batch_id" UUID, "batch_number" TEXT, "lot_id" UUID, "lot_number" TEXT,
    "warehouse_id" UUID, "warehouse_name" TEXT,
    "held_qty" DECIMAL(14,3) NOT NULL, "uom_id" UUID, "uom_code" TEXT,
    "hold_reason" TEXT NOT NULL, "hold_location" TEXT,
    "held_by" UUID, "held_by_name" TEXT,
    "released_by" UUID, "released_by_name" TEXT, "released_at" TIMESTAMP(3),
    "release_reason" TEXT, "release_disposition" TEXT,
    "scrap_qty" DECIMAL(14,3) DEFAULT 0, "rework_qty" DECIMAL(14,3) DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "material_holds_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_mh_tenant_number" UNIQUE ("tenant_id", "hold_number")
);

CREATE TABLE IF NOT EXISTS "quality_costs" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "cost_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cost_category" TEXT NOT NULL,
    "cost_type" TEXT NOT NULL,
    "ncr_id" UUID, "capa_id" UUID,
    "product_id" UUID, "product_sku" TEXT,
    "amount" DECIMAL(14,2) NOT NULL, "currency" TEXT DEFAULT 'INR',
    "description" TEXT,
    "recorded_by" UUID, "recorded_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quality_costs_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 23: CAPA (4 tables — extends Phase 12 capa_records)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "capa_actions" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "capa_id" UUID NOT NULL,
    "action_type" TEXT NOT NULL,
    "action_description" TEXT NOT NULL,
    "action_owner" UUID, "action_owner_name" TEXT,
    "due_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT DEFAULT 'NORMAL',
    "escalation_level" INTEGER DEFAULT 0,
    "escalated_at" TIMESTAMP(3),
    "escalated_to" UUID, "escalated_to_name" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "capa_actions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "capa_verifications" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "capa_id" UUID NOT NULL,
    "verification_type" TEXT NOT NULL DEFAULT 'EFFECTIVENESS',
    "verification_method" TEXT,
    "verification_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT NOT NULL,
    "verified_by" UUID, "verified_by_name" TEXT,
    "evidence" TEXT, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "capa_verifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "capa_effectiveness_reviews" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "capa_id" UUID NOT NULL,
    "review_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "review_period_days" INTEGER DEFAULT 30,
    "effectiveness_rating" TEXT NOT NULL,
    "metrics_before" JSONB, "metrics_after" JSONB,
    "is_effective" BOOLEAN NOT NULL DEFAULT false,
    "reviewed_by" UUID, "reviewed_by_name" TEXT,
    "follow_up_required" BOOLEAN DEFAULT false,
    "follow_up_notes" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "capa_effectiveness_reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "capa_escalations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "capa_id" UUID NOT NULL, "action_id" UUID,
    "escalation_level" INTEGER NOT NULL,
    "escalated_from" UUID, "escalated_from_name" TEXT,
    "escalated_to" UUID, "escalated_to_name" TEXT,
    "escalation_reason" TEXT NOT NULL,
    "escalated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "capa_escalations_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 24: COA (5 tables — extends Phase 20 coa_records)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "coa_templates" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "template_code" TEXT NOT NULL, "template_name" TEXT NOT NULL,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "template_type" TEXT DEFAULT 'STANDARD',
    "header_text" TEXT, "footer_text" TEXT,
    "includes_microbiology" BOOLEAN DEFAULT true,
    "includes_chemical" BOOLEAN DEFAULT true,
    "includes_physical" BOOLEAN DEFAULT true,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "layout_config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "coa_templates_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_ct_tenant_code" UNIQUE ("tenant_id", "template_code")
);

CREATE TABLE IF NOT EXISTS "coa_template_items" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "template_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "test_category" TEXT NOT NULL,
    "parameter_name" TEXT NOT NULL, "specification" TEXT,
    "min_value" TEXT, "max_value" TEXT, "target_value" TEXT,
    "unit" TEXT, "test_method" TEXT,
    "is_mandatory" BOOLEAN DEFAULT true,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coa_template_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "coa_lab_results" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "coa_id" UUID, "fgqc_lot_id" UUID,
    "test_category" TEXT NOT NULL,
    "parameter_name" TEXT NOT NULL,
    "specification" TEXT, "actual_value" TEXT NOT NULL,
    "min_value" TEXT, "max_value" TEXT, "target_value" TEXT,
    "unit" TEXT, "result" TEXT NOT NULL DEFAULT 'PASS',
    "test_method" TEXT, "equipment" TEXT,
    "tested_by" UUID, "tested_by_name" TEXT, "tested_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coa_lab_results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "coa_approvals" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "coa_id" UUID NOT NULL,
    "approval_level" TEXT NOT NULL,
    "approver_id" UUID, "approver_name" TEXT, "approver_role" TEXT,
    "approval_status" TEXT NOT NULL DEFAULT 'PENDING',
    "approval_date" TIMESTAMP(3),
    "approval_notes" TEXT,
    "digital_signature" TEXT,
    "qr_verification_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coa_approvals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "coa_versions" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "coa_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "version_reason" TEXT NOT NULL,
    "previous_version_id" UUID,
    "snapshot" JSONB NOT NULL,
    "created_by" UUID, "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coa_versions_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 25: RECALL & TRACEABILITY (5 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "recalls" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "recall_number" TEXT NOT NULL, "recall_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recall_type" TEXT NOT NULL DEFAULT 'VOLUNTARY',
    "recall_class" TEXT NOT NULL DEFAULT 'CLASS_III',
    "recall_reason" TEXT NOT NULL,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "batch_id" UUID, "batch_number" TEXT,
    "production_batch_id" UUID, "production_batch_number" TEXT,
    "affected_qty" DECIMAL(14,3) DEFAULT 0,
    "affected_value" DECIMAL(14,2) DEFAULT 0,
    "initiated_by" UUID, "initiated_by_name" TEXT,
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'INITIATED',
    "priority" TEXT DEFAULT 'HIGH',
    "regulatory_notification" BOOLEAN DEFAULT false,
    "regulatory_notified_at" TIMESTAMP(3),
    "closure_notes" TEXT,
    "closed_by" UUID, "closed_by_name" TEXT, "closed_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "recalls_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_recall_tenant_number" UNIQUE ("tenant_id", "recall_number")
);

CREATE TABLE IF NOT EXISTS "recall_affected_items" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "recall_id" UUID NOT NULL,
    "item_type" TEXT NOT NULL,
    "batch_id" UUID, "batch_number" TEXT,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "quantity" DECIMAL(14,3), "uom_code" TEXT,
    "warehouse_id" UUID, "warehouse_name" TEXT,
    "location" TEXT,
    "status" TEXT DEFAULT 'IDENTIFIED',
    "recovered_qty" DECIMAL(14,3) DEFAULT 0,
    "destroyed_qty" DECIMAL(14,3) DEFAULT 0,
    "returned_qty" DECIMAL(14,3) DEFAULT 0,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recall_affected_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "recall_affected_customers" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "recall_id" UUID NOT NULL,
    "customer_id" UUID, "customer_name" TEXT,
    "customer_code" TEXT,
    "shipped_qty" DECIMAL(14,3) DEFAULT 0,
    "shipped_date" TIMESTAMP(3),
    "invoice_number" TEXT,
    "notified" BOOLEAN DEFAULT false,
    "notified_at" TIMESTAMP(3),
    "notified_by" UUID, "notified_by_name" TEXT,
    "response_received" BOOLEAN DEFAULT false,
    "response_date" TIMESTAMP(3),
    "returned_qty" DECIMAL(14,3) DEFAULT 0,
    "status" TEXT DEFAULT 'NOTIFIED',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recall_affected_customers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "recall_communications" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "recall_id" UUID NOT NULL,
    "communication_type" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'EMAIL',
    "recipient" TEXT, "recipient_name" TEXT,
    "subject" TEXT, "message" TEXT NOT NULL,
    "sent_by" UUID, "sent_by_name" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recall_communications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "recall_effectiveness" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "recall_id" UUID NOT NULL,
    "review_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_affected_qty" DECIMAL(14,3) NOT NULL,
    "total_recovered_qty" DECIMAL(14,3) DEFAULT 0,
    "recovery_percent" DECIMAL(5,2) DEFAULT 0,
    "total_affected_customers" INTEGER DEFAULT 0,
    "customers_notified" INTEGER DEFAULT 0,
    "customers_responded" INTEGER DEFAULT 0,
    "effectiveness_rating" TEXT,
    "is_effective" BOOLEAN DEFAULT false,
    "reviewed_by" UUID, "reviewed_by_name" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recall_effectiveness_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 26: SUPPLIER QUALITY (5 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "supplier_audits" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "audit_number" TEXT NOT NULL, "audit_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplier_id" UUID NOT NULL, "supplier_code" TEXT, "supplier_name" TEXT,
    "audit_type" TEXT NOT NULL DEFAULT 'SUPPLIER',
    "audit_scope" TEXT,
    "lead_auditor" UUID, "lead_auditor_name" TEXT,
    "audit_start_date" DATE, "audit_end_date" DATE,
    "overall_score" DECIMAL(5,2), "max_score" DECIMAL(5,2) DEFAULT 100,
    "audit_result" TEXT,
    "findings_count" INTEGER DEFAULT 0,
    "critical_findings" INTEGER DEFAULT 0,
    "major_findings" INTEGER DEFAULT 0,
    "minor_findings" INTEGER DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "report_url" TEXT,
    "remarks" TEXT, "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "supplier_audits_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_sa_tenant_number" UNIQUE ("tenant_id", "audit_number")
);

CREATE TABLE IF NOT EXISTS "supplier_scorecards" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL, "supplier_code" TEXT, "supplier_name" TEXT,
    "period" TEXT NOT NULL, "period_start" DATE, "period_end" DATE,
    "quality_rating" DECIMAL(5,2) DEFAULT 0,
    "delivery_rating" DECIMAL(5,2) DEFAULT 0,
    "price_rating" DECIMAL(5,2) DEFAULT 0,
    "service_rating" DECIMAL(5,2) DEFAULT 0,
    "overall_rating" DECIMAL(5,2) DEFAULT 0,
    "overall_grade" TEXT DEFAULT 'C',
    "iqc_pass_rate" DECIMAL(5,2) DEFAULT 0,
    "ncr_count" INTEGER DEFAULT 0,
    "on_time_delivery_pct" DECIMAL(5,2) DEFAULT 0,
    "defect_rate_ppm" INTEGER DEFAULT 0,
    "risk_level" TEXT DEFAULT 'MEDIUM',
    "trend" TEXT DEFAULT 'STABLE',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "supplier_scorecards_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_ss_tenant_supplier_period" UNIQUE ("tenant_id", "supplier_id", "period")
);

CREATE TABLE IF NOT EXISTS "supplier_complaints" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "complaint_number" TEXT NOT NULL, "complaint_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplier_id" UUID NOT NULL, "supplier_code" TEXT, "supplier_name" TEXT,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "batch_number" TEXT, "grn_number" TEXT,
    "complaint_type" TEXT NOT NULL,
    "severity" TEXT DEFAULT 'MAJOR',
    "description" TEXT NOT NULL,
    "ncr_id" UUID, "capa_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "raised_by" UUID, "raised_by_name" TEXT,
    "supplier_response" TEXT,
    "supplier_response_date" TIMESTAMP(3),
    "resolution" TEXT,
    "resolved_by" UUID, "resolved_by_name" TEXT, "resolved_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "supplier_complaints_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_scomp_tenant_number" UNIQUE ("tenant_id", "complaint_number")
);

CREATE TABLE IF NOT EXISTS "supplier_certifications" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL, "supplier_code" TEXT, "supplier_name" TEXT,
    "cert_type" TEXT NOT NULL,
    "cert_name" TEXT NOT NULL,
    "cert_number" TEXT,
    "issuing_body" TEXT,
    "issue_date" DATE, "expiry_date" DATE,
    "is_active" BOOLEAN DEFAULT true,
    "document_url" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "supplier_certifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "supplier_risk_assessments" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL, "supplier_code" TEXT, "supplier_name" TEXT,
    "assessment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "risk_category" TEXT NOT NULL,
    "risk_score" DECIMAL(5,2) NOT NULL,
    "risk_level" TEXT NOT NULL DEFAULT 'MEDIUM',
    "mitigation_plan" TEXT,
    "assessment_factors" JSONB,
    "assessed_by" UUID, "assessed_by_name" TEXT,
    "next_review_date" DATE,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "supplier_risk_assessments_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS "idx_qs_tenant_active" ON "quality_standards"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_qspec_tenant_product" ON "quality_specifications"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_tm_tenant_active" ON "test_methods"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_tp_spec" ON "test_parameters"("spec_id");
CREATE INDEX IF NOT EXISTS "idx_qit_tenant_active" ON "inspection_templates"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_qiti_template" ON "inspection_template_items"("template_id");
CREATE INDEX IF NOT EXISTS "idx_qkpi_tenant_period" ON "quality_kpis"("tenant_id", "period");
CREATE INDEX IF NOT EXISTS "idx_ncrrc_ncr" ON "ncr_root_causes"("ncr_id");
CREATE INDEX IF NOT EXISTS "idx_ncrc_ncr" ON "ncr_containments"("ncr_id");
CREATE INDEX IF NOT EXISTS "idx_ncrd_ncr" ON "ncr_dispositions"("ncr_id");
CREATE INDEX IF NOT EXISTS "idx_mh_tenant_status" ON "material_holds"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_mh_tenant_product" ON "material_holds"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_mh_tenant_batch" ON "material_holds"("tenant_id", "batch_id");
CREATE INDEX IF NOT EXISTS "idx_qc_tenant_date" ON "quality_costs"("tenant_id", "cost_date");
CREATE INDEX IF NOT EXISTS "idx_ca_capa" ON "capa_actions"("capa_id");
CREATE INDEX IF NOT EXISTS "idx_ca_tenant_status" ON "capa_actions"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_cv_capa" ON "capa_verifications"("capa_id");
CREATE INDEX IF NOT EXISTS "idx_cer_capa" ON "capa_effectiveness_reviews"("capa_id");
CREATE INDEX IF NOT EXISTS "idx_ce_capa" ON "capa_escalations"("capa_id");
CREATE INDEX IF NOT EXISTS "idx_ct_tenant_active" ON "coa_templates"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_cti_template" ON "coa_template_items"("template_id");
CREATE INDEX IF NOT EXISTS "idx_clr_coa" ON "coa_lab_results"("coa_id");
CREATE INDEX IF NOT EXISTS "idx_clr_lot" ON "coa_lab_results"("fgqc_lot_id");
CREATE INDEX IF NOT EXISTS "idx_ca_coa" ON "coa_approvals"("coa_id");
CREATE INDEX IF NOT EXISTS "idx_cv_coa" ON "coa_versions"("coa_id");
CREATE INDEX IF NOT EXISTS "idx_recall_tenant_status" ON "recalls"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_recall_tenant_product" ON "recalls"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_recall_tenant_batch" ON "recalls"("tenant_id", "batch_id");
CREATE INDEX IF NOT EXISTS "idx_rai_recall" ON "recall_affected_items"("recall_id");
CREATE INDEX IF NOT EXISTS "idx_rac_recall" ON "recall_affected_customers"("recall_id");
CREATE INDEX IF NOT EXISTS "idx_rcomm_recall" ON "recall_communications"("recall_id");
CREATE INDEX IF NOT EXISTS "idx_reff_recall" ON "recall_effectiveness"("recall_id");
CREATE INDEX IF NOT EXISTS "idx_sa_tenant_supplier" ON "supplier_audits"("tenant_id", "supplier_id");
CREATE INDEX IF NOT EXISTS "idx_sa_tenant_status" ON "supplier_audits"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_ss_tenant_supplier" ON "supplier_scorecards"("tenant_id", "supplier_id");
CREATE INDEX IF NOT EXISTS "idx_scomp_tenant_supplier" ON "supplier_complaints"("tenant_id", "supplier_id");
CREATE INDEX IF NOT EXISTS "idx_scomp_tenant_status" ON "supplier_complaints"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_scert_tenant_supplier" ON "supplier_certifications"("tenant_id", "supplier_id");
CREATE INDEX IF NOT EXISTS "idx_scert_tenant_expiry" ON "supplier_certifications"("tenant_id", "expiry_date");
CREATE INDEX IF NOT EXISTS "idx_sra_tenant_supplier" ON "supplier_risk_assessments"("tenant_id", "supplier_id");

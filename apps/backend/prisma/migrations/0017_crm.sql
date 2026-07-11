-- ════════════════════════════════════════════════════════════════════════════
-- SUOP ERP — Phases 39-44: Enterprise CRM & Customer Service Domain
-- Migration 0017: CRM (6 phases, ~40 tables)
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 39: CRM FOUNDATION (10 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "crm_activities" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "activity_type" TEXT NOT NULL, "activity_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" UUID, "customer_name" TEXT,
    "lead_id" UUID, "opportunity_id" UUID, "ticket_id" UUID,
    "subject" TEXT, "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "priority" TEXT DEFAULT 'NORMAL',
    "assigned_to" UUID, "assigned_to_name" TEXT,
    "due_date" TIMESTAMP(3), "completed_at" TIMESTAMP(3),
    "duration_minutes" INTEGER DEFAULT 0,
    "location" TEXT, "outcome" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "crm_activities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_calls" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "activity_id" UUID, "customer_id" UUID, "customer_name" TEXT,
    "call_type" TEXT NOT NULL DEFAULT 'OUTBOUND',
    "call_direction" TEXT DEFAULT 'OUTGOING',
    "phone_number" TEXT, "contact_name" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3), "duration_seconds" INTEGER DEFAULT 0,
    "call_purpose" TEXT, "call_outcome" TEXT,
    "recording_url" TEXT, "notes" TEXT,
    "follow_up_required" BOOLEAN DEFAULT false, "follow_up_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "crm_calls_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_meetings" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "activity_id" UUID, "customer_id" UUID, "customer_name" TEXT,
    "meeting_title" TEXT NOT NULL, "meeting_type" TEXT DEFAULT 'IN_PERSON',
    "scheduled_start" TIMESTAMP(3) NOT NULL, "scheduled_end" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3), "actual_end" TIMESTAMP(3),
    "location" TEXT, "meeting_url" TEXT,
    "attendees" TEXT[], "agenda" TEXT, "minutes" TEXT,
    "outcome" TEXT, "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID,
    CONSTRAINT "crm_meetings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_tasks" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "activity_id" UUID, "customer_id" UUID, "customer_name" TEXT,
    "task_title" TEXT NOT NULL, "task_description" TEXT,
    "task_type" TEXT, "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "assigned_to" UUID, "assigned_to_name" TEXT,
    "due_date" TIMESTAMP(3), "reminder_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3), "completed_by" UUID,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID,
    CONSTRAINT "crm_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_notes" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "customer_id" UUID, "lead_id" UUID, "opportunity_id" UUID, "ticket_id" UUID,
    "note_type" TEXT DEFAULT 'GENERAL',
    "note_title" TEXT, "note_content" TEXT NOT NULL,
    "is_pinned" BOOLEAN DEFAULT false, "is_private" BOOLEAN DEFAULT false,
    "created_by" UUID, "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "crm_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_reminders" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "customer_id" UUID, "activity_id" UUID, "task_id" UUID,
    "reminder_title" TEXT NOT NULL, "reminder_text" TEXT,
    "reminder_type" TEXT DEFAULT 'TASK',
    "reminder_date" TIMESTAMP(3) NOT NULL,
    "is_recurring" BOOLEAN DEFAULT false, "recurring_frequency" TEXT,
    "notification_sent" BOOLEAN DEFAULT false, "notification_sent_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "crm_reminders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_email_logs" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "customer_id" UUID, "lead_id" UUID, "ticket_id" UUID,
    "from_address" TEXT NOT NULL, "to_address" TEXT NOT NULL,
    "cc_address" TEXT, "bcc_address" TEXT,
    "subject" TEXT NOT NULL, "body" TEXT NOT NULL,
    "email_type" TEXT DEFAULT 'OUTBOUND',
    "template_id" UUID, "template_name" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(3), "opened_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3), "bounced_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "attachments" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "crm_email_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "customer_documents" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "document_type" TEXT NOT NULL, "document_name" TEXT NOT NULL,
    "file_name" TEXT, "file_url" TEXT, "file_size" BIGINT,
    "mime_type" TEXT, "category" TEXT,
    "expiry_date" DATE, "is_verified" BOOLEAN DEFAULT false,
    "verified_by" UUID, "verified_at" TIMESTAMP(3),
    "uploaded_by" UUID, "uploaded_by_name" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "customer_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "customer_interactions" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL, "customer_name" TEXT,
    "interaction_type" TEXT NOT NULL, "interaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" TEXT NOT NULL DEFAULT 'PORTAL',
    "subject" TEXT, "description" TEXT,
    "interaction_outcome" TEXT, "satisfaction_rating" INTEGER,
    "handled_by" UUID, "handled_by_name" TEXT,
    "reference_type" TEXT, "reference_id" UUID, "reference_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_interactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "customer_relationships" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "related_customer_id" UUID NOT NULL,
    "relationship_type" TEXT NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "customer_relationships_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 40: LEAD & OPPORTUNITY MANAGEMENT (8 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "leads" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "lead_number" TEXT NOT NULL, "lead_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lead_source" TEXT, "lead_type" TEXT DEFAULT 'NEW_BUSINESS',
    "customer_id" UUID, "customer_name" TEXT, "customer_code" TEXT,
    "contact_name" TEXT, "contact_email" TEXT, "contact_phone" TEXT,
    "company_name" TEXT, "designation" TEXT,
    "product_interest" TEXT, "estimated_value" DECIMAL(18,2) DEFAULT 0,
    "currency" TEXT DEFAULT 'INR',
    "assigned_to" UUID, "assigned_to_name" TEXT,
    "lead_score" INTEGER DEFAULT 0, "lead_grade" TEXT DEFAULT 'C',
    "next_follow_up_date" TIMESTAMP(3),
    "qualification_status" TEXT DEFAULT 'UNQUALIFIED',
    "qualification_notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "lost_reason" TEXT, "won_value" DECIMAL(18,2) DEFAULT 0,
    "converted_opportunity_id" UUID,
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "leads_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_lead_tenant_number" UNIQUE ("tenant_id", "lead_number")
);

CREATE TABLE IF NOT EXISTS "lead_activities" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "lead_id" UUID NOT NULL, "activity_type" TEXT NOT NULL,
    "activity_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT, "outcome" TEXT,
    "performed_by" UUID, "performed_by_name" TEXT,
    "next_action" TEXT, "next_action_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lead_activities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "opportunities" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "opportunity_number" TEXT NOT NULL, "opportunity_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lead_id" UUID, "lead_number" TEXT,
    "customer_id" UUID NOT NULL, "customer_name" TEXT, "customer_code" TEXT,
    "opportunity_name" TEXT NOT NULL, "description" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'PROSPECTING',
    "probability" INTEGER DEFAULT 10,
    "estimated_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "currency" TEXT DEFAULT 'INR',
    "expected_close_date" DATE,
    "assigned_to" UUID, "assigned_to_name" TEXT,
    "competitor_id" UUID, "competitor_name" TEXT,
    "win_reason" TEXT, "loss_reason" TEXT,
    "actual_value" DECIMAL(18,2) DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "converted_so_id" UUID, "converted_so_number" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_opp_tenant_number" UNIQUE ("tenant_id", "opportunity_number")
);

CREATE TABLE IF NOT EXISTS "opportunity_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "opportunity_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "quantity" DECIMAL(14,3) NOT NULL, "uom_code" TEXT,
    "unit_price" DECIMAL(18,4) NOT NULL, "discount_percent" DECIMAL(5,2) DEFAULT 0,
    "line_total" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "currency" TEXT DEFAULT 'INR', "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "opportunity_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "competitors" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "competitor_name" TEXT NOT NULL, "competitor_code" TEXT,
    "industry" TEXT, "website" TEXT, "description" TEXT,
    "strengths" TEXT, "weaknesses" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "competitors_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_comp_tenant_name" UNIQUE ("tenant_id", "competitor_name")
);

CREATE TABLE IF NOT EXISTS "sales_targets" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "target_type" TEXT NOT NULL, "period" TEXT NOT NULL,
    "period_start" DATE NOT NULL, "period_end" DATE NOT NULL,
    "assigned_to" UUID, "assigned_to_name" TEXT,
    "target_amount" DECIMAL(18,2) NOT NULL, "achieved_amount" DECIMAL(18,2) DEFAULT 0,
    "achievement_percent" DECIMAL(5,2) DEFAULT 0,
    "currency" TEXT DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sales_targets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sales_forecasts" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "forecast_period" TEXT NOT NULL, "period_start" DATE, "period_end" DATE,
    "forecast_type" TEXT DEFAULT 'REVENUE',
    "forecast_amount" DECIMAL(18,2) NOT NULL,
    "actual_amount" DECIMAL(18,2) DEFAULT 0,
    "variance_percent" DECIMAL(5,2) DEFAULT 0,
    "currency" TEXT DEFAULT 'INR',
    "created_by" UUID, "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sales_forecasts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "follow_up_schedules" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "lead_id" UUID, "opportunity_id" UUID, "customer_id" UUID,
    "follow_up_type" TEXT NOT NULL, "follow_up_date" TIMESTAMP(3) NOT NULL,
    "assigned_to" UUID, "assigned_to_name" TEXT,
    "description" TEXT, "is_completed" BOOLEAN DEFAULT false,
    "completed_at" TIMESTAMP(3), "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "follow_up_schedules_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 41: CUSTOMER SERVICE (6 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "support_tickets" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "ticket_number" TEXT NOT NULL, "ticket_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" UUID, "customer_name" TEXT,
    "contact_name" TEXT, "contact_email" TEXT, "contact_phone" TEXT,
    "category" TEXT NOT NULL, "subcategory" TEXT,
    "subject" TEXT NOT NULL, "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "sla_id" UUID, "sla_response_due" TIMESTAMP(3), "sla_resolution_due" TIMESTAMP(3),
    "first_response_at" TIMESTAMP(3), "resolved_at" TIMESTAMP(3),
    "assigned_to" UUID, "assigned_to_name" TEXT,
    "assigned_team" TEXT,
    "escalation_level" INTEGER DEFAULT 0, "escalated_to" UUID, "escalated_at" TIMESTAMP(3),
    "satisfaction_rating" INTEGER, "satisfaction_notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT, "resolution_code" TEXT,
    "so_id" UUID, "so_number" TEXT, "invoice_id" UUID, "invoice_number" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_st_tenant_number" UNIQUE ("tenant_id", "ticket_number")
);

CREATE TABLE IF NOT EXISTS "ticket_communications" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL, "ticket_number" TEXT,
    "communication_type" TEXT NOT NULL, "direction" TEXT NOT NULL DEFAULT 'OUTBOUND',
    "channel" TEXT DEFAULT 'PORTAL',
    "from_name" TEXT, "to_name" TEXT,
    "subject" TEXT, "message" TEXT NOT NULL,
    "is_internal" BOOLEAN DEFAULT false,
    "sent_by" UUID, "sent_by_name" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attachments" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ticket_communications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sla_configurations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "sla_code" TEXT NOT NULL, "sla_name" TEXT NOT NULL,
    "category" TEXT, "priority" TEXT NOT NULL,
    "response_time_minutes" INTEGER NOT NULL, "resolution_time_hours" INTEGER NOT NULL,
    "escalation_level_1_hours" INTEGER, "escalation_level_2_hours" INTEGER, "escalation_level_3_hours" INTEGER,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "sla_configurations_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_sla_tenant_code" UNIQUE ("tenant_id", "sla_code")
);

CREATE TABLE IF NOT EXISTS "ticket_escalations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL, "ticket_number" TEXT,
    "escalation_level" INTEGER NOT NULL,
    "escalated_from" UUID, "escalated_from_name" TEXT,
    "escalated_to" UUID, "escalated_to_name" TEXT,
    "escalation_reason" TEXT NOT NULL,
    "escalated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3), "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ticket_escalations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "knowledge_base_articles" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "article_code" TEXT NOT NULL, "title" TEXT NOT NULL,
    "category" TEXT NOT NULL, "subcategory" TEXT,
    "content" TEXT NOT NULL, "tags" TEXT[],
    "view_count" INTEGER DEFAULT 0, "helpful_count" INTEGER DEFAULT 0, "not_helpful_count" INTEGER DEFAULT 0,
    "is_published" BOOLEAN DEFAULT false, "published_at" TIMESTAMP(3),
    "author_id" UUID, "author_name" TEXT,
    "version" INTEGER DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "knowledge_base_articles_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_kb_tenant_code" UNIQUE ("tenant_id", "article_code")
);

CREATE TABLE IF NOT EXISTS "ticket_sla_tracking" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL, "ticket_number" TEXT,
    "sla_id" UUID, "sla_code" TEXT,
    "response_due" TIMESTAMP(3), "response_actual" TIMESTAMP(3),
    "resolution_due" TIMESTAMP(3), "resolution_actual" TIMESTAMP(3),
    "response_breached" BOOLEAN DEFAULT false, "resolution_breached" BOOLEAN DEFAULT false,
    "response_time_minutes" INTEGER, "resolution_time_hours" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ticket_sla_tracking_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 42: COMPLAINT MANAGEMENT (5 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "complaints" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "complaint_number" TEXT NOT NULL, "complaint_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" UUID NOT NULL, "customer_name" TEXT, "customer_code" TEXT,
    "complaint_type" TEXT NOT NULL, "complaint_category" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MAJOR',
    "subject" TEXT NOT NULL, "description" TEXT NOT NULL,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "batch_number" TEXT, "lot_number" TEXT,
    "so_id" UUID, "so_number" TEXT, "invoice_id" UUID, "invoice_number" TEXT,
    "delivery_id" UUID, "delivery_number" TEXT,
    "production_batch_id" UUID, "production_batch_number" TEXT,
    "coa_id" UUID, "coa_number" TEXT,
    "inspection_lot_id" UUID, "inspection_lot_number" TEXT,
    "ncr_id" UUID, "ncr_number" TEXT,
    "capa_id" UUID, "capa_number" TEXT,
    "root_cause" TEXT, "root_cause_category" TEXT,
    "resolution" TEXT, "resolution_code" TEXT,
    "replacement_approved" BOOLEAN DEFAULT false, "refund_amount" DECIMAL(18,2) DEFAULT 0,
    "satisfaction_rating" INTEGER, "satisfaction_notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "assigned_to" UUID, "assigned_to_name" TEXT,
    "resolved_at" TIMESTAMP(3), "closed_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_comp_tenant_number" UNIQUE ("tenant_id", "complaint_number")
);

CREATE TABLE IF NOT EXISTS "complaint_categories" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "category_code" TEXT NOT NULL, "category_name" TEXT NOT NULL,
    "parent_category_id" UUID, "complaint_type" TEXT NOT NULL,
    "default_severity" TEXT DEFAULT 'MAJOR',
    "default_sla_hours" INTEGER DEFAULT 48,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "complaint_categories_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_cc_tenant_code" UNIQUE ("tenant_id", "category_code")
);

CREATE TABLE IF NOT EXISTS "complaint_investigations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "complaint_id" UUID NOT NULL, "complaint_number" TEXT,
    "investigation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "investigator_id" UUID, "investigator_name" TEXT,
    "investigation_type" TEXT NOT NULL,
    "findings" TEXT, "root_cause" TEXT, "root_cause_category" TEXT,
    "corrective_action" TEXT, "preventive_action" TEXT,
    "ncr_created" BOOLEAN DEFAULT false, "ncr_id" UUID, "ncr_number" TEXT,
    "capa_created" BOOLEAN DEFAULT false, "capa_id" UUID, "capa_number" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "complaint_investigations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "complaint_resolutions" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "complaint_id" UUID NOT NULL, "complaint_number" TEXT,
    "resolution_type" TEXT NOT NULL,
    "resolution_description" TEXT NOT NULL,
    "replacement_so_id" UUID, "replacement_so_number" TEXT,
    "refund_amount" DECIMAL(18,2) DEFAULT 0,
    "credit_note_id" UUID, "credit_note_number" TEXT,
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "complaint_resolutions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "customer_satisfaction_surveys" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "survey_type" TEXT NOT NULL, "reference_type" TEXT, "reference_id" UUID, "reference_number" TEXT,
    "customer_id" UUID, "customer_name" TEXT,
    "overall_rating" INTEGER NOT NULL,
    "response_time_rating" INTEGER, "resolution_quality_rating" INTEGER,
    "communication_rating" INTEGER, "would_recommend" BOOLEAN,
    "feedback" TEXT, "improvement_suggestions" TEXT,
    "survey_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_satisfaction_surveys_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 43: AFTER SALES SERVICE (7 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "warranties" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "warranty_number" TEXT NOT NULL, "warranty_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" UUID NOT NULL, "customer_name" TEXT,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "batch_number" TEXT, "serial_number" TEXT,
    "so_id" UUID, "so_number" TEXT, "invoice_id" UUID, "invoice_number" TEXT,
    "delivery_id" UUID, "delivery_number" TEXT,
    "warranty_type" TEXT NOT NULL DEFAULT 'STANDARD',
    "warranty_start_date" DATE NOT NULL, "warranty_end_date" DATE NOT NULL,
    "warranty_period_months" INTEGER NOT NULL,
    "is_active" BOOLEAN DEFAULT true, "is_expired" BOOLEAN DEFAULT false,
    "terms_conditions" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "warranties_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_warr_tenant_number" UNIQUE ("tenant_id", "warranty_number")
);

CREATE TABLE IF NOT EXISTS "amc_contracts" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "amc_number" TEXT NOT NULL, "amc_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" UUID NOT NULL, "customer_name" TEXT,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "so_id" UUID, "so_number" TEXT,
    "amc_type" TEXT NOT NULL DEFAULT 'COMPREHENSIVE',
    "contract_start_date" DATE NOT NULL, "contract_end_date" DATE NOT NULL,
    "contract_value" DECIMAL(18,2) NOT NULL, "currency" TEXT DEFAULT 'INR',
    "visit_frequency" TEXT DEFAULT 'QUARTERLY',
    "covered_services" TEXT, "exclusions" TEXT,
    "is_active" BOOLEAN DEFAULT true, "is_expired" BOOLEAN DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "amc_contracts_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_amc_tenant_number" UNIQUE ("tenant_id", "amc_number")
);

CREATE TABLE IF NOT EXISTS "service_requests" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "request_number" TEXT NOT NULL, "request_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" UUID NOT NULL, "customer_name" TEXT,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "warranty_id" UUID, "warranty_number" TEXT,
    "amc_id" UUID, "amc_number" TEXT,
    "so_id" UUID, "so_number" TEXT,
    "service_type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "subject" TEXT NOT NULL, "description" TEXT,
    "problem_category" TEXT, "problem_description" TEXT,
    "assigned_technician_id" UUID, "assigned_technician_name" TEXT,
    "scheduled_date" TIMESTAMP(3), "completed_date" TIMESTAMP(3),
    "is_warranty_claim" BOOLEAN DEFAULT false,
    "is_chargeable" BOOLEAN DEFAULT false, "estimated_cost" DECIMAL(18,2) DEFAULT 0,
    "actual_cost" DECIMAL(18,2) DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "resolution" TEXT,
    "satisfaction_rating" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_sr_tenant_number" UNIQUE ("tenant_id", "request_number")
);

CREATE TABLE IF NOT EXISTS "service_visits" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "visit_number" TEXT NOT NULL, "visit_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "service_request_id" UUID NOT NULL, "request_number" TEXT,
    "customer_id" UUID, "customer_name" TEXT,
    "technician_id" UUID, "technician_name" TEXT,
    "scheduled_start" TIMESTAMP(3), "scheduled_end" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3), "actual_end" TIMESTAMP(3),
    "visit_type" TEXT DEFAULT 'ONSITE',
    "location" TEXT, "gps_latitude" DECIMAL(10,6), "gps_longitude" DECIMAL(10,6),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "service_visits_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_sv_tenant_number" UNIQUE ("tenant_id", "visit_number")
);

CREATE TABLE IF NOT EXISTS "service_reports" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "service_visit_id" UUID NOT NULL, "visit_number" TEXT,
    "service_request_id" UUID, "request_number" TEXT,
    "report_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technician_id" UUID, "technician_name" TEXT,
    "diagnosis" TEXT, "work_performed" TEXT,
    "parts_replaced" TEXT, "parts_cost" DECIMAL(18,2) DEFAULT 0,
    "labor_hours" DECIMAL(8,2) DEFAULT 0, "labor_cost" DECIMAL(18,2) DEFAULT 0,
    "total_cost" DECIMAL(18,2) DEFAULT 0,
    "is_resolved" BOOLEAN DEFAULT false,
    "resolution" TEXT, "recommendations" TEXT,
    "customer_signature" TEXT, "signature_image_url" TEXT,
    "customer_remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "service_reports_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "replacement_requests" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "replacement_number" TEXT NOT NULL, "request_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" UUID NOT NULL, "customer_name" TEXT,
    "original_product_id" UUID, "original_product_sku" TEXT,
    "replacement_product_id" UUID, "replacement_product_sku" TEXT,
    "warranty_id" UUID, "warranty_number" TEXT,
    "service_request_id" UUID, "request_number" TEXT,
    "reason" TEXT NOT NULL, "quantity" INTEGER DEFAULT 1,
    "is_approved" BOOLEAN DEFAULT false,
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "replacement_so_id" UUID, "replacement_so_number" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "replacement_requests_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_repl_req_tenant_number" UNIQUE ("tenant_id", "replacement_number")
);

CREATE TABLE IF NOT EXISTS "installations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "installation_number" TEXT NOT NULL, "installation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" UUID NOT NULL, "customer_name" TEXT,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "so_id" UUID, "so_number" TEXT, "delivery_id" UUID, "delivery_number" TEXT,
    "serial_number" TEXT, "batch_number" TEXT,
    "installation_type" TEXT DEFAULT 'NEW',
    "scheduled_date" TIMESTAMP(3), "completed_date" TIMESTAMP(3),
    "technician_id" UUID, "technician_name" TEXT,
    "location" TEXT, "site_details" TEXT,
    "installation_notes" TEXT, "commissioning_report" TEXT,
    "warranty_start_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "installations_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_inst_tenant_number" UNIQUE ("tenant_id", "installation_number")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 44: CUSTOMER PORTAL (4 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "portal_users" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL, "customer_name" TEXT,
    "user_id" UUID, "email" TEXT NOT NULL,
    "portal_role" TEXT DEFAULT 'CUSTOMER',
    "is_active" BOOLEAN DEFAULT true,
    "last_login_at" TIMESTAMP(3), "login_count" INTEGER DEFAULT 0,
    "preferences" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "portal_users_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_pu_tenant_email" UNIQUE ("tenant_id", "email")
);

CREATE TABLE IF NOT EXISTS "portal_notifications" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "portal_user_id" UUID NOT NULL, "customer_id" UUID,
    "notification_type" TEXT NOT NULL,
    "title" TEXT NOT NULL, "message" TEXT NOT NULL,
    "reference_type" TEXT, "reference_id" UUID, "reference_number" TEXT,
    "is_read" BOOLEAN DEFAULT false, "read_at" TIMESTAMP(3),
    "priority" TEXT DEFAULT 'NORMAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "portal_notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "portal_sessions" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "portal_user_id" UUID NOT NULL,
    "session_token" TEXT NOT NULL, "ip_address" TEXT,
    "user_agent" TEXT, "device_type" TEXT,
    "login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity_at" TIMESTAMP(3), "logout_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "portal_sessions_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_ps_tenant_token" UNIQUE ("tenant_id", "session_token")
);

CREATE TABLE IF NOT EXISTS "portal_activity_logs" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "portal_user_id" UUID, "customer_id" UUID,
    "activity_type" TEXT NOT NULL, "activity_description" TEXT,
    "ip_address" TEXT, "user_agent" TEXT,
    "reference_type" TEXT, "reference_id" UUID, "reference_number" TEXT,
    "activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "portal_activity_logs_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS "idx_crm_act_tenant_customer" ON "crm_activities"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_crm_calls_tenant_customer" ON "crm_calls"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_crm_meet_tenant_customer" ON "crm_meetings"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_crm_tasks_tenant_status" ON "crm_tasks"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_crm_notes_tenant_customer" ON "crm_notes"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_lead_tenant_status" ON "leads"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_lead_tenant_assigned" ON "leads"("tenant_id", "assigned_to");
CREATE INDEX IF NOT EXISTS "idx_opp_tenant_status" ON "opportunities"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_opp_tenant_stage" ON "opportunities"("tenant_id", "stage");
CREATE INDEX IF NOT EXISTS "idx_opp_tenant_customer" ON "opportunities"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_st_tenant_status" ON "support_tickets"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_st_tenant_priority" ON "support_tickets"("tenant_id", "priority");
CREATE INDEX IF NOT EXISTS "idx_st_tenant_customer" ON "support_tickets"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_tc_ticket" ON "ticket_communications"("ticket_id");
CREATE INDEX IF NOT EXISTS "idx_sla_tenant_active" ON "sla_configurations"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_te_ticket" ON "ticket_escalations"("ticket_id");
CREATE INDEX IF NOT EXISTS "idx_kb_tenant_published" ON "knowledge_base_articles"("tenant_id", "is_published");
CREATE INDEX IF NOT EXISTS "idx_comp_tenant_status" ON "complaints"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_comp_tenant_customer" ON "complaints"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_comp_tenant_product" ON "complaints"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_warr_tenant_customer" ON "warranties"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_warr_tenant_expiry" ON "warranties"("tenant_id", "warranty_end_date");
CREATE INDEX IF NOT EXISTS "idx_amc_tenant_customer" ON "amc_contracts"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_sr_tenant_status" ON "service_requests"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_sr_tenant_customer" ON "service_requests"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_sv_request" ON "service_visits"("service_request_id");
CREATE INDEX IF NOT EXISTS "idx_pu_tenant_customer" ON "portal_users"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_pn_tenant_user" ON "portal_notifications"("tenant_id", "portal_user_id");
CREATE INDEX IF NOT EXISTS "idx_ps_tenant_user" ON "portal_sessions"("tenant_id", "portal_user_id");

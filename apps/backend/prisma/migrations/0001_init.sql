-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_type" TEXT NOT NULL,
    "actor_id" UUID,
    "actor_name" TEXT,
    "actor_role" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "correlation_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "entity_code" TEXT,
    "before" JSONB,
    "after" JSONB,
    "diff" JSONB,
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_outbox" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "event_name" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "published_at" TIMESTAMP(3),
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "correlation_id" TEXT NOT NULL,
    "actor_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_outbox" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID,
    "recipient_email" TEXT,
    "recipient_phone" TEXT,
    "channel" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "template_id" TEXT,
    "templateData" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "correlation_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "device_fingerprint" TEXT,
    "device_name" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "revoked_reason" TEXT,
    "previous_token_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "request_hash" TEXT NOT NULL,
    "responseStatus" INTEGER NOT NULL,
    "response_body" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "flag_name" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updated_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_jobs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "job_name" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "scheduled_for" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "result" JSONB,
    "last_error" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "background_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_uploads" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "storage_driver" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "linked_entity_type" TEXT,
    "linked_entity_id" UUID,
    "uploaded_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "file_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_quotations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "quotation_number" TEXT NOT NULL,
    "rfq_id" UUID NOT NULL,
    "rfq_number" TEXT NOT NULL,
    "supplier_id" UUID NOT NULL,
    "supplier_code" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "quotation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validity_date" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "payment_terms" TEXT NOT NULL DEFAULT 'NET30',
    "delivery_terms" TEXT,
    "lead_time_days" INTEGER,
    "tax_percent" DECIMAL(5,2),
    "discount_percent" DECIMAL(5,2),
    "freight_amount" DECIMAL(14,2),
    "insurance_amount" DECIMAL(14,2),
    "warranty_terms" TEXT,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "grand_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "technical_score" DECIMAL(5,2),
    "commercial_score" DECIMAL(5,2),
    "overall_score" DECIMAL(5,2),
    "rank" INTEGER,
    "is_lowest_price" BOOLEAN NOT NULL DEFAULT false,
    "is_best_value" BOOLEAN NOT NULL DEFAULT false,
    "recommendation_notes" TEXT,
    "revision_no" INTEGER NOT NULL DEFAULT 0,
    "parent_quotation_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "rejection_reason" TEXT,
    "remarks" TEXT,
    "attachments" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "supplier_quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_quotation_lines" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "quotation_id" UUID NOT NULL,
    "line_no" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "rfq_line_id" UUID,
    "quoted_qty" DECIMAL(14,3) NOT NULL,
    "uom_id" UUID NOT NULL,
    "uom_code" TEXT NOT NULL,
    "unit_price" DECIMAL(14,4) NOT NULL,
    "line_total" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "moq" DECIMAL(14,3),
    "lead_time_days" INTEGER,
    "discount_percent" DECIMAL(5,2),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_quotation_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_audit_tenant_entity" ON "audit_logs"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_audit_tenant_action" ON "audit_logs"("tenant_id", "action");

-- CreateIndex
CREATE INDEX "idx_audit_tenant_severity" ON "audit_logs"("tenant_id", "severity");

-- CreateIndex
CREATE INDEX "idx_audit_correlation" ON "audit_logs"("correlation_id");

-- CreateIndex
CREATE INDEX "idx_audit_timestamp" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "idx_outbox_status_created" ON "event_outbox"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_outbox_tenant" ON "event_outbox"("tenant_id");

-- CreateIndex
CREATE INDEX "idx_notif_status_created" ON "notification_outbox"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_notif_tenant_user" ON "notification_outbox"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "idx_refresh_user" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "idx_refresh_token_hash" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "idx_refresh_expires" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "idx_idempotency_expires" ON "idempotency_keys"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_idempotency_tenant_key" ON "idempotency_keys"("tenant_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "uq_feature_flag_tenant_name" ON "feature_flags"("tenant_id", "flag_name");

-- CreateIndex
CREATE INDEX "idx_jobs_status_scheduled" ON "background_jobs"("status", "scheduled_for");

-- CreateIndex
CREATE INDEX "idx_jobs_tenant_name" ON "background_jobs"("tenant_id", "job_name");

-- CreateIndex
CREATE INDEX "idx_files_tenant_category" ON "file_uploads"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "idx_files_tenant_entity" ON "file_uploads"("tenant_id", "linked_entity_type", "linked_entity_id");

-- CreateIndex
CREATE INDEX "idx_quot_tenant_status" ON "supplier_quotations"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "idx_quot_tenant_rfq" ON "supplier_quotations"("tenant_id", "rfq_id");

-- CreateIndex
CREATE INDEX "idx_quot_tenant_supplier" ON "supplier_quotations"("tenant_id", "supplier_id");

-- CreateIndex
CREATE INDEX "idx_quot_tenant_rfq_status" ON "supplier_quotations"("tenant_id", "rfq_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_quot_tenant_number" ON "supplier_quotations"("tenant_id", "quotation_number");

-- CreateIndex
CREATE INDEX "idx_quot_line_tenant_quot" ON "supplier_quotation_lines"("tenant_id", "quotation_id");

-- CreateIndex
CREATE INDEX "idx_quot_line_tenant_product" ON "supplier_quotation_lines"("tenant_id", "product_id");

-- AddForeignKey
ALTER TABLE "supplier_quotation_lines" ADD CONSTRAINT "supplier_quotation_lines_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "supplier_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;


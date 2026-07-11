-- ════════════════════════════════════════════════════════════════
-- PHASE 1 — ORGANIZATION MODULE MIGRATION
-- ════════════════════════════════════════════════════════════════

-- CreateTable
CREATE TABLE IF NOT EXISTS "tenants" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "legal_name" TEXT,
    "description" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "logo_url" TEXT,
    "primary_color" TEXT,
    "default_timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "default_currency" TEXT NOT NULL DEFAULT 'INR',
    "default_locale" TEXT NOT NULL DEFAULT 'en-IN',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "companies" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legal_name" TEXT,
    "description" TEXT,
    "parent_id" UUID,
    "gstin" TEXT,
    "pan" TEXT,
    "cin" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "postal_code" TEXT,
    "default_timezone" TEXT,
    "default_currency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "business_units" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "business_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "divisions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "business_unit_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "regions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "division_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "state" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "plants" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "plant_type" TEXT NOT NULL DEFAULT 'MANUFACTURING',
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "postal_code" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "email" TEXT,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "plants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "warehouses" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "warehouse_type" TEXT NOT NULL DEFAULT 'DISTRIBUTION',
    "address_line_1" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "total_area_sqft" DECIMAL(14,2),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "departments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "company_id" UUID,
    "business_unit_id" UUID,
    "plant_id" UUID,
    "parent_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "cost_centers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "plant_id" UUID,
    "department_id" UUID,
    "cost_center_type" TEXT NOT NULL DEFAULT 'PRODUCTION',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "financial_years" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "financial_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "working_calendars" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plant_id" UUID,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "working_days" JSONB NOT NULL,
    "shifts" JSONB,
    "holidays" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "working_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "reference_timezones" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "utc_offset" TEXT NOT NULL,
    "countries" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reference_timezones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "reference_currencies" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimal_places" INTEGER NOT NULL DEFAULT 2,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reference_currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "tax_configs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "tax_type" TEXT NOT NULL,
    "tax_code" TEXT NOT NULL,
    "description" TEXT,
    "rate" DECIMAL(5,2) NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "hsn_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "tax_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audit_tenant_entity" ON "audit_logs"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audit_tenant_action" ON "audit_logs"("tenant_id", "action");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audit_tenant_severity" ON "audit_logs"("tenant_id", "severity");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audit_correlation" ON "audit_logs"("correlation_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audit_timestamp" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_outbox_status_created" ON "event_outbox"("status", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_outbox_tenant" ON "event_outbox"("tenant_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_notif_status_created" ON "notification_outbox"("status", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_notif_tenant_user" ON "notification_outbox"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_refresh_user" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_refresh_token_hash" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_refresh_expires" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_idempotency_expires" ON "idempotency_keys"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_idempotency_tenant_key" ON "idempotency_keys"("tenant_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_feature_flag_tenant_name" ON "feature_flags"("tenant_id", "flag_name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_jobs_status_scheduled" ON "background_jobs"("status", "scheduled_for");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_jobs_tenant_name" ON "background_jobs"("tenant_id", "job_name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_files_tenant_category" ON "file_uploads"("tenant_id", "category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_files_tenant_entity" ON "file_uploads"("tenant_id", "linked_entity_type", "linked_entity_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_tenant_status" ON "tenants"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_company_tenant_status" ON "companies"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_company_parent" ON "companies"("parent_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_company_gstin" ON "companies"("gstin");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_company_tenant_code" ON "companies"("tenant_id", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_bu_tenant_company_status" ON "business_units"("tenant_id", "company_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_bu_parent" ON "business_units"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_bu_tenant_company_code" ON "business_units"("tenant_id", "company_id", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_div_tenant_bu_status" ON "divisions"("tenant_id", "business_unit_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_div_parent" ON "divisions"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_div_tenant_bu_code" ON "divisions"("tenant_id", "business_unit_id", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_region_tenant_div_status" ON "regions"("tenant_id", "division_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_region_tenant_div_code" ON "regions"("tenant_id", "division_id", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_plant_tenant_region_status" ON "plants"("tenant_id", "region_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_plant_type" ON "plants"("plant_type");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_plant_tenant_region_code" ON "plants"("tenant_id", "region_id", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_wh_tenant_plant_status" ON "warehouses"("tenant_id", "plant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_wh_type" ON "warehouses"("warehouse_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_wh_default" ON "warehouses"("is_default");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_wh_tenant_plant_code" ON "warehouses"("tenant_id", "plant_id", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_dept_tenant_status" ON "departments"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_dept_plant" ON "departments"("plant_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_dept_parent" ON "departments"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_dept_tenant_code" ON "departments"("tenant_id", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_cc_tenant_status" ON "cost_centers"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_cc_plant" ON "cost_centers"("plant_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_cc_tenant_code" ON "cost_centers"("tenant_id", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_fy_tenant_status" ON "financial_years"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_fy_tenant_current" ON "financial_years"("tenant_id", "is_current");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_fy_tenant_dates" ON "financial_years"("tenant_id", "start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_fy_tenant_code" ON "financial_years"("tenant_id", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_wc_tenant_year" ON "working_calendars"("tenant_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_wc_tenant_plant_year" ON "working_calendars"("tenant_id", "plant_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "reference_timezones_code_key" ON "reference_timezones"("code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "reference_currencies_code_key" ON "reference_currencies"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_tax_tenant_type_status" ON "tax_configs"("tenant_id", "tax_type", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_tax_tenant_effective" ON "tax_configs"("tenant_id", "effective_from", "effective_to");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_tax_tenant_type_code" ON "tax_configs"("tenant_id", "tax_type", "tax_code");

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "companies" ADD CONSTRAINT "companies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "companies" ADD CONSTRAINT "companies_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "business_units" ADD CONSTRAINT "business_units_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "business_units" ADD CONSTRAINT "business_units_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "business_units" ADD CONSTRAINT "business_units_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "business_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "regions" ADD CONSTRAINT "regions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "regions" ADD CONSTRAINT "regions_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "plants" ADD CONSTRAINT "plants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "plants" ADD CONSTRAINT "plants_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "departments" ADD CONSTRAINT "departments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "departments" ADD CONSTRAINT "departments_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "business_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "departments" ADD CONSTRAINT "departments_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "departments" ADD CONSTRAINT "departments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "financial_years" ADD CONSTRAINT "financial_years_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "working_calendars" ADD CONSTRAINT "working_calendars_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "working_calendars" ADD CONSTRAINT "working_calendars_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;


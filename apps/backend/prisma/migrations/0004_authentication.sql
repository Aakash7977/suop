-- PHASE 2 — AUTHENTICATION & IDENTITY PLATFORM

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "password_hash" TEXT NOT NULL,
    "password_algorithm" TEXT NOT NULL DEFAULT 'ARGON2ID',
    "password_changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password_expires_at" TIMESTAMP(3),
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mfa_secret_encrypted" TEXT,
    "mfa_backup_codes_hash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'INVITED',
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "last_login_ip" TEXT,
    "last_login_user_agent" TEXT,
    "default_company_id" UUID,
    "default_plant_id" UUID,
    "department_id" UUID,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "designation" TEXT,
    "profile_image_url" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "locale" TEXT NOT NULL DEFAULT 'en-IN',
    "invited_by" UUID,
    "invited_at" TIMESTAMP(3),
    "activated_at" TIMESTAMP(3),
    "accepted_terms_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_roles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_name" TEXT NOT NULL,
    "assigned_by" UUID,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "login_history" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID,
    "email" TEXT NOT NULL,
    "login_method" TEXT NOT NULL DEFAULT 'PASSWORD',
    "success" BOOLEAN NOT NULL,
    "failure_reason" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "device_fingerprint" TEXT,
    "correlation_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "password_history" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "password_hash" TEXT NOT NULL,
    "password_algorithm" TEXT NOT NULL DEFAULT 'ARGON2ID',
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" UUID,

    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "device_registry" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "device_fingerprint" TEXT NOT NULL,
    "device_name" TEXT,
    "device_type" TEXT,
    "operating_system" TEXT,
    "browser" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "is_trusted" BOOLEAN NOT NULL DEFAULT false,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_invitations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "invited_by" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "roles" TEXT[],
    "default_company_id" UUID,
    "default_plant_id" UUID,
    "first_name" TEXT,
    "last_name" TEXT,
    "designation" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "accepted_by_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requested_by" UUID,
    "requested_ip" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_user_tenant_status" ON "users"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "users"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_user_status" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_user_tenant_email" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_user_tenant_username" ON "users"("tenant_id", "username");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_user_role_tenant_user" ON "user_roles"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_user_role_tenant_role" ON "user_roles"("tenant_id", "role_name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_user_role_tenant_user_role" ON "user_roles"("tenant_id", "user_id", "role_name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_login_tenant_user_time" ON "login_history"("tenant_id", "user_id", "timestamp");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_login_tenant_email_time" ON "login_history"("tenant_id", "email", "timestamp");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_login_success_time" ON "login_history"("success", "timestamp");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_pw_history_tenant_user_time" ON "password_history"("tenant_id", "user_id", "changed_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_device_tenant_user" ON "device_registry"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_device_tenant_user_fp" ON "device_registry"("tenant_id", "user_id", "device_fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_invitations_token_hash_key" ON "user_invitations"("token_hash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_invite_tenant_email" ON "user_invitations"("tenant_id", "email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_invite_tenant_status" ON "user_invitations"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_invite_token" ON "user_invitations"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_reset_tenant_user" ON "password_reset_tokens"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_reset_token" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_reset_expires" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "email_verification_tokens_token_hash_key" ON "email_verification_tokens"("token_hash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_email_verif_tenant_user" ON "email_verification_tokens"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_email_verif_token" ON "email_verification_tokens"("token_hash");

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

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

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "login_history" ADD CONSTRAINT "login_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "password_history" ADD CONSTRAINT "password_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "device_registry" ADD CONSTRAINT "device_registry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;


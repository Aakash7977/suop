-- PHASE 3 — USER MANAGEMENT & RBAC ADMINISTRATION

-- CreateTable
CREATE TABLE IF NOT EXISTS "roles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'CUSTOM',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "cloned_from_id" UUID,
    "parent_role_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "permissions" (
    "id" UUID NOT NULL,
    "module" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "permission_group" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "role_permissions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "assigned_by" UUID,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_assignments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "entity_name" TEXT,
    "role_id" UUID,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "assigned_by" UUID,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_by" UUID,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "approval_delegations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "delegator_id" UUID NOT NULL,
    "delegate_id" UUID NOT NULL,
    "approval_type" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" UUID,
    "max_amount" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "reason" TEXT,
    "created_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "revoked_by" UUID,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "approval_delegations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_preferences" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "pref_key" TEXT NOT NULL,
    "pref_value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_role_tenant_status" ON "roles"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_role_tenant_category" ON "roles"("tenant_id", "category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_role_parent" ON "roles"("parent_role_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_role_tenant_name" ON "roles"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_perm_module_feature" ON "permissions"("module", "feature");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_perm_group" ON "permissions"("permission_group");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_perm_active" ON "permissions"("is_active");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_role_perm_tenant_role" ON "role_permissions"("tenant_id", "role_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_role_perm_perm" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_role_perm_tenant_role_perm" ON "role_permissions"("tenant_id", "role_id", "permission_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_assignment_tenant_user" ON "user_assignments"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_assignment_tenant_entity" ON "user_assignments"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_assignment_tenant_status" ON "user_assignments"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_assignment_tenant_user_entity" ON "user_assignments"("tenant_id", "user_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_delegation_tenant_delegator" ON "approval_delegations"("tenant_id", "delegator_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_delegation_tenant_delegate" ON "approval_delegations"("tenant_id", "delegate_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_delegation_tenant_type_status" ON "approval_delegations"("tenant_id", "approval_type", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_delegation_dates" ON "approval_delegations"("effective_from", "effective_to");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_pref_tenant_user" ON "user_preferences"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_pref_tenant_user_key" ON "user_preferences"("tenant_id", "user_id", "pref_key");

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

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "roles" ADD CONSTRAINT "roles_parent_role_id_fkey" FOREIGN KEY ("parent_role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;


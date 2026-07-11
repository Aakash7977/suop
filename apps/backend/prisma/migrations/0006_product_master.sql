-- PHASE 4 — ENTERPRISE PRODUCT MASTER PLATFORM

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_categories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "level" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL DEFAULT '',
    "product_type" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_brands" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "manufacturer" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,

    CONSTRAINT "product_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_uoms" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "uom_type" TEXT NOT NULL DEFAULT 'WEIGHT',
    "decimals" INTEGER NOT NULL DEFAULT 3,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_base" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_uoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "uom_conversions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "from_uom_id" UUID NOT NULL,
    "to_uom_id" UUID NOT NULL,
    "factor" DECIMAL(18,6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uom_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "products" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "item_code" TEXT,
    "upi" TEXT,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "description" TEXT,
    "long_description" TEXT,
    "product_type" TEXT NOT NULL DEFAULT 'FINISHED_GOOD',
    "category_id" UUID,
    "brand_id" UUID,
    "base_uom_id" UUID NOT NULL,
    "alt_uom_id" UUID,
    "hsn_code" TEXT,
    "sac_code" TEXT,
    "gst_rate" DECIMAL(5,2),
    "weight" DECIMAL(14,3),
    "weight_uom" TEXT,
    "volume" DECIMAL(14,3),
    "volume_uom" TEXT,
    "length" DECIMAL(14,3),
    "width" DECIMAL(14,3),
    "height" DECIMAL(14,3),
    "dimension_uom" TEXT,
    "storage_condition" TEXT,
    "min_temp" DECIMAL(5,2),
    "max_temp" DECIMAL(5,2),
    "min_humidity" DECIMAL(5,2),
    "max_humidity" DECIMAL(5,2),
    "shelf_life_days" INTEGER,
    "batch_required" BOOLEAN NOT NULL DEFAULT false,
    "serial_required" BOOLEAN NOT NULL DEFAULT false,
    "expiry_tracking" BOOLEAN NOT NULL DEFAULT false,
    "fifo_strategy" TEXT NOT NULL DEFAULT 'FEFO',
    "inspection_required" BOOLEAN NOT NULL DEFAULT false,
    "inspection_template_id" TEXT,
    "default_warehouse_id" UUID,
    "default_storage_location" TEXT,
    "costing_method" TEXT NOT NULL DEFAULT 'WEIGHTED_AVG',
    "standard_cost" DECIMAL(14,2),
    "standard_cost_currency" TEXT NOT NULL DEFAULT 'INR',
    "last_purchase_cost" DECIMAL(14,2),
    "mrp" DECIMAL(14,2),
    "list_price" DECIMAL(14,2),
    "abc_class" TEXT,
    "xyz_class" TEXT,
    "fsn_class" TEXT,
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "procurement_type" TEXT NOT NULL DEFAULT 'MAKE',
    "lead_time_days" INTEGER,
    "min_order_qty" DECIMAL(14,3),
    "max_order_qty" DECIMAL(14,3),
    "reorder_level" DECIMAL(14,3),
    "reorder_qty" DECIMAL(14,3),
    "safety_stock" DECIMAL(14,3),
    "manufacturing_type" TEXT,
    "default_bom_id" UUID,
    "default_routing_id" UUID,
    "yield_percent" DECIMAL(5,2),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "image_url" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "product_barcodes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "barcode_type" TEXT NOT NULL DEFAULT 'EAN13',
    "barcodeValue" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_barcodes_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_cat_tenant_parent" ON "product_categories"("tenant_id", "parent_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_cat_tenant_type" ON "product_categories"("tenant_id", "product_type");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_cat_tenant_code" ON "product_categories"("tenant_id", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_brand_tenant_active" ON "product_brands"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_brand_tenant_code" ON "product_brands"("tenant_id", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_uom_tenant_type" ON "product_uoms"("tenant_id", "uom_type");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_uom_tenant_code" ON "product_uoms"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_uom_conv_tenant_from_to" ON "uom_conversions"("tenant_id", "from_uom_id", "to_uom_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_product_tenant_status" ON "products"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_product_tenant_type" ON "products"("tenant_id", "product_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_product_tenant_category" ON "products"("tenant_id", "category_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_product_tenant_brand" ON "products"("tenant_id", "brand_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_product_tenant_hsn" ON "products"("tenant_id", "hsn_code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_product_tenant_abc_xyz" ON "products"("tenant_id", "abc_class", "xyz_class");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_product_tenant_procurement" ON "products"("tenant_id", "procurement_type");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_product_tenant_sku" ON "products"("tenant_id", "sku");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_barcode_tenant_product" ON "product_barcodes"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_barcode_value" ON "product_barcodes"("barcodeValue");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_barcode_tenant_value" ON "product_barcodes"("tenant_id", "barcodeValue");

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

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "uom_conversions" ADD CONSTRAINT "uom_conversions_from_uom_id_fkey" FOREIGN KEY ("from_uom_id") REFERENCES "product_uoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "uom_conversions" ADD CONSTRAINT "uom_conversions_to_uom_id_fkey" FOREIGN KEY ("to_uom_id") REFERENCES "product_uoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "product_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "products" ADD CONSTRAINT "products_base_uom_id_fkey" FOREIGN KEY ("base_uom_id") REFERENCES "product_uoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "products" ADD CONSTRAINT "products_alt_uom_id_fkey" FOREIGN KEY ("alt_uom_id") REFERENCES "product_uoms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "product_barcodes" ADD CONSTRAINT "product_barcodes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;


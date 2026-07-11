-- PHASE 7 — PROCUREMENT FOUNDATION

-- CreateTable
CREATE TABLE IF NOT EXISTS "purchase_requisitions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "pr_number" TEXT NOT NULL,
    "company_id" UUID NOT NULL,
    "business_unit_id" UUID,
    "plant_id" UUID,
    "warehouse_id" UUID,
    "department_id" UUID,
    "requester_id" UUID NOT NULL,
    "requester_name" TEXT NOT NULL,
    "requester_dept" TEXT,
    "requisition_type" TEXT NOT NULL DEFAULT 'MANUAL',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "required_date" TIMESTAMP(3) NOT NULL,
    "expected_delivery_date" TIMESTAMP(3),
    "budget_id" UUID,
    "budget_amount" DECIMAL(14,2),
    "estimated_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "current_approver_id" UUID,
    "current_approver_name" TEXT,
    "approval_level" INTEGER NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "internal_notes" TEXT,
    "converted_to_rfq_at" TIMESTAMP(3),
    "converted_to_po_at" TIMESTAMP(3),
    "rfq_id" UUID,
    "po_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "rejection_reason" TEXT,
    "cancelled_reason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "purchase_requisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "purchase_requisition_lines" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "pr_id" UUID NOT NULL,
    "line_no" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "requested_qty" DECIMAL(14,3) NOT NULL,
    "uom_id" UUID NOT NULL,
    "uom_code" TEXT NOT NULL,
    "expected_price" DECIMAL(14,4),
    "expected_total" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "preferred_supplier_id" UUID,
    "preferred_supplier_code" TEXT,
    "required_date" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_requisition_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "purchase_requisition_approvals" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "pr_id" UUID NOT NULL,
    "approval_level" INTEGER NOT NULL,
    "approver_id" UUID NOT NULL,
    "approver_name" TEXT NOT NULL,
    "approver_role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "comments" TEXT,
    "approved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_requisition_approvals_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_supp_cat_tenant_active" ON "supplier_categories"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_supp_cat_tenant_code" ON "supplier_categories"("tenant_id", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_supplier_tenant_status" ON "suppliers"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_supplier_tenant_gstin" ON "suppliers"("tenant_id", "gstin");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_supplier_tenant_vendor_type" ON "suppliers"("tenant_id", "vendor_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_supplier_tenant_preferred" ON "suppliers"("tenant_id", "is_preferred");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_supplier_gstin" ON "suppliers"("gstin");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_supplier_tenant_vendor_code" ON "suppliers"("tenant_id", "vendor_code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_contact_tenant_supplier" ON "supplier_contacts"("tenant_id", "supplier_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_addr_tenant_supplier" ON "supplier_addresses"("tenant_id", "supplier_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_addr_tenant_type" ON "supplier_addresses"("tenant_id", "address_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_comp_tenant_supplier" ON "supplier_compliances"("tenant_id", "supplier_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_comp_tenant_type_status" ON "supplier_compliances"("tenant_id", "compliance_type", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_comp_expiry" ON "supplier_compliances"("expiry_date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_spm_tenant_supplier" ON "supplier_product_mappings"("tenant_id", "supplier_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_spm_tenant_product" ON "supplier_product_mappings"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_spm_tenant_product_preferred" ON "supplier_product_mappings"("tenant_id", "product_id", "is_preferred");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_spm_tenant_supplier_product" ON "supplier_product_mappings"("tenant_id", "supplier_id", "product_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_cust_grp_tenant_active" ON "customer_groups"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_cust_grp_tenant_code" ON "customer_groups"("tenant_id", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_customer_tenant_status" ON "customers"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_customer_tenant_type" ON "customers"("tenant_id", "customer_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_customer_tenant_gstin" ON "customers"("tenant_id", "gstin");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_customer_tenant_group" ON "customers"("tenant_id", "group_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_customer_tenant_credit_hold" ON "customers"("tenant_id", "credit_hold");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_customer_gstin" ON "customers"("gstin");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_customer_tenant_code" ON "customers"("tenant_id", "customer_code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_cust_contact_tenant_customer" ON "customer_contacts"("tenant_id", "customer_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_cust_addr_tenant_customer" ON "customer_addresses"("tenant_id", "customer_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_pr_tenant_status" ON "purchase_requisitions"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_pr_tenant_requester" ON "purchase_requisitions"("tenant_id", "requester_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_pr_tenant_priority" ON "purchase_requisitions"("tenant_id", "priority");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_pr_tenant_plant" ON "purchase_requisitions"("tenant_id", "plant_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_pr_tenant_dept" ON "purchase_requisitions"("tenant_id", "department_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_pr_required_date" ON "purchase_requisitions"("required_date");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "uq_pr_tenant_number" ON "purchase_requisitions"("tenant_id", "pr_number");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_prl_tenant_pr" ON "purchase_requisition_lines"("tenant_id", "pr_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_prl_tenant_product" ON "purchase_requisition_lines"("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_prl_tenant_supplier" ON "purchase_requisition_lines"("tenant_id", "preferred_supplier_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_pra_tenant_pr" ON "purchase_requisition_approvals"("tenant_id", "pr_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_pra_tenant_approver" ON "purchase_requisition_approvals"("tenant_id", "approver_id");

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

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "supplier_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "supplier_contacts" ADD CONSTRAINT "supplier_contacts_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "supplier_addresses" ADD CONSTRAINT "supplier_addresses_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "supplier_compliances" ADD CONSTRAINT "supplier_compliances_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "supplier_product_mappings" ADD CONSTRAINT "supplier_product_mappings_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "customers" ADD CONSTRAINT "customers_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "customer_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "customer_contacts" ADD CONSTRAINT "customer_contacts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "purchase_requisition_lines" ADD CONSTRAINT "purchase_requisition_lines_pr_id_fkey" FOREIGN KEY ("pr_id") REFERENCES "purchase_requisitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;

-- AddForeignKey
DO $$ BEGIN
ALTER TABLE "purchase_requisition_approvals" ADD CONSTRAINT "purchase_requisition_approvals_pr_id_fkey" FOREIGN KEY ("pr_id") REFERENCES "purchase_requisitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN
END $$;


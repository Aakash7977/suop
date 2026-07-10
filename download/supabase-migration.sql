-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "employee_code" TEXT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "mobile" TEXT,
    "mobile_verified" BOOLEAN NOT NULL DEFAULT false,
    "password_hash" TEXT NOT NULL,
    "password_algorithm" TEXT NOT NULL DEFAULT 'ARGON2ID',
    "password_changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password_expires_at" TIMESTAMP(3),
    "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mfa_secret" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en-IN',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "theme" TEXT NOT NULL DEFAULT 'LIGHT',
    "last_login_at" TIMESTAMP(3),
    "last_login_ip" TEXT,
    "login_count" INTEGER NOT NULL DEFAULT 0,
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "locked_until" TIMESTAMP(3),
    "lock_reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "auth_provider" TEXT NOT NULL DEFAULT 'LOCAL',
    "auth_provider_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "bio" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT,
    "nationality" TEXT,
    "marital_status" TEXT,
    "blood_group" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "emergency_contact_relation" TEXT,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postal_code" TEXT,
    "linkedin_url" TEXT,
    "twitter_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_devices" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "device_type" TEXT NOT NULL DEFAULT 'DESKTOP',
    "device_name" TEXT NOT NULL,
    "device_fingerprint" TEXT NOT NULL,
    "operating_system" TEXT,
    "os_version" TEXT,
    "browser_name" TEXT,
    "browser_version" TEXT,
    "app_version" TEXT,
    "user_agent" TEXT,
    "is_trusted" BOOLEAN NOT NULL DEFAULT false,
    "is_registered" BOOLEAN NOT NULL DEFAULT false,
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_ip" INET,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL,
    "session_id" VARCHAR(200) NOT NULL,
    "user_id" UUID NOT NULL,
    "device_id" UUID,
    "session_type" TEXT NOT NULL DEFAULT 'WEB',
    "client_ip" TEXT NOT NULL,
    "client_user_agent" TEXT NOT NULL,
    "geolocation" JSONB,
    "login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logout_at" TIMESTAMP(3),
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "refresh_token_hash" TEXT NOT NULL,
    "refresh_token_expires_at" TIMESTAMP(3) NOT NULL,
    "remember_me" BOOLEAN NOT NULL DEFAULT false,
    "mfa_verified" BOOLEAN NOT NULL DEFAULT false,
    "mfa_verified_at" TIMESTAMP(3),
    "risk_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_suspicious" BOOLEAN NOT NULL DEFAULT false,
    "revoked_at" TIMESTAMP(3),
    "revocation_reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_history" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "password_hash" TEXT NOT NULL,
    "password_algorithm" TEXT NOT NULL DEFAULT 'ARGON2ID',
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" UUID,
    "change_reason" TEXT,

    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "token_hash" VARCHAR(500) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "used_from_ip" INET,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requested_from_ip" INET NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "is_expired" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "token_hash" VARCHAR(500) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_to" TEXT NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "is_expired" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "event_id" TEXT NOT NULL,
    "business_module" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "action_category" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "actor_id" UUID,
    "actor_name" TEXT,
    "actor_type" TEXT NOT NULL DEFAULT 'USER',
    "action_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" INET,
    "user_agent" TEXT,
    "session_id" UUID,
    "correlation_id" UUID,
    "before_values" JSONB,
    "after_values" JSONB,
    "change_summary" TEXT,
    "business_context" JSONB NOT NULL DEFAULT '{}',
    "risk_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "record_hash" TEXT NOT NULL,
    "previous_hash" TEXT,
    "company_id" UUID,
    "retention_until" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECORDED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" UUID NOT NULL,
    "config_key" TEXT NOT NULL,
    "config_name" TEXT NOT NULL,
    "config_category" TEXT NOT NULL DEFAULT 'COMPANY_SETTINGS',
    "config_type" TEXT NOT NULL DEFAULT 'SETTING',
    "dataType" TEXT NOT NULL DEFAULT 'STRING',
    "default_value" TEXT NOT NULL,
    "current_value" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprises" (
    "id" UUID NOT NULL,
    "enterprise_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legal_name" TEXT,
    "gst_number" VARCHAR(15),
    "pan_number" VARCHAR(10),
    "country" CHAR(2) NOT NULL DEFAULT 'IN',
    "currency_code" CHAR(3) NOT NULL DEFAULT 'INR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "locale" TEXT NOT NULL DEFAULT 'en-IN',
    "logo_url" TEXT,
    "website" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "enterprises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_settings" (
    "id" UUID NOT NULL,
    "enterprise_id" UUID NOT NULL,
    "setting_key" TEXT NOT NULL,
    "setting_value" TEXT NOT NULL,
    "dataType" TEXT NOT NULL DEFAULT 'STRING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprise_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_contacts" (
    "id" UUID NOT NULL,
    "enterprise_id" UUID NOT NULL,
    "contact_name" TEXT NOT NULL,
    "contact_type" TEXT NOT NULL DEFAULT 'PRIMARY',
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "designation" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprise_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "enterprise_id" UUID NOT NULL,
    "company_code" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "legal_name" TEXT,
    "company_type" TEXT NOT NULL DEFAULT 'PRIVATE_LIMITED',
    "gstin" VARCHAR(15),
    "pan" VARCHAR(10),
    "cin" TEXT,
    "currency_code" CHAR(3) NOT NULL DEFAULT 'INR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "locale" TEXT NOT NULL DEFAULT 'en-IN',
    "fiscal_year_start" INTEGER NOT NULL DEFAULT 4,
    "fiscal_year_end" INTEGER NOT NULL DEFAULT 3,
    "website" TEXT,
    "logo_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_addresses" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "address_type" TEXT NOT NULL DEFAULT 'REGISTERED',
    "address_line_1" TEXT NOT NULL,
    "address_line_2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "postal_code" TEXT NOT NULL,
    "state_code" TEXT,
    "country_code" CHAR(2) NOT NULL DEFAULT 'IN',
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_tax_profiles" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "tax_type" TEXT NOT NULL,
    "tax_number" TEXT NOT NULL,
    "registration_date" TIMESTAMP(3),
    "jurisdiction" TEXT,
    "filing_frequency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_tax_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_bank_accounts" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "branch_name" TEXT,
    "ifsc_code" VARCHAR(11) NOT NULL,
    "account_type" TEXT NOT NULL DEFAULT 'CURRENT',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "upi_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_units" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "bu_code" TEXT NOT NULL,
    "bu_name" TEXT NOT NULL,
    "bu_type" TEXT NOT NULL DEFAULT 'MANUFACTURING',
    "description" TEXT,
    "head_user_id" UUID,
    "parent_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "business_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "divisions" (
    "id" UUID NOT NULL,
    "bu_id" UUID NOT NULL,
    "division_code" TEXT NOT NULL,
    "division_name" TEXT NOT NULL,
    "description" TEXT,
    "head_user_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "bu_id" UUID,
    "division_id" UUID,
    "branch_code" TEXT NOT NULL,
    "branch_name" TEXT NOT NULL,
    "branch_type" TEXT NOT NULL DEFAULT 'OFFICE',
    "branch_manager_id" UUID,
    "currency_code" CHAR(3) NOT NULL DEFAULT 'INR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "locale" TEXT NOT NULL DEFAULT 'en-IN',
    "tax_region_code" TEXT,
    "gstin" VARCHAR(15),
    "state_code" TEXT,
    "country_code" CHAR(2) NOT NULL DEFAULT 'IN',
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "is_operational" BOOLEAN NOT NULL DEFAULT true,
    "working_hours" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_addresses" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "address_type" TEXT NOT NULL DEFAULT 'OPERATIONAL',
    "address_line_1" TEXT NOT NULL,
    "address_line_2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "postal_code" TEXT NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_contacts" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "contact_name" TEXT NOT NULL,
    "contact_type" TEXT NOT NULL DEFAULT 'PRIMARY',
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "designation" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branch_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plants" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "plant_code" TEXT NOT NULL,
    "plant_name" TEXT NOT NULL,
    "plant_type" TEXT NOT NULL DEFAULT 'MANUFACTURING',
    "capacity_per_day" DECIMAL(15,3),
    "capacity_unit" TEXT,
    "shift_model" TEXT NOT NULL DEFAULT 'SINGLE',
    "working_days" TEXT[] DEFAULT ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI']::TEXT[],
    "calendar_id" UUID,
    "plant_manager_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "plants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_settings" (
    "id" UUID NOT NULL,
    "plant_id" UUID NOT NULL,
    "setting_key" TEXT NOT NULL,
    "setting_value" TEXT NOT NULL,
    "dataType" TEXT NOT NULL DEFAULT 'STRING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "plant_id" UUID,
    "warehouse_code" TEXT NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "warehouse_type" TEXT NOT NULL DEFAULT 'FINISHED_GOODS',
    "capacity_volume" DECIMAL(15,3),
    "capacity_weight" DECIMAL(15,3),
    "capacity_unit" TEXT,
    "temperature_zone" TEXT,
    "temperature_min" DECIMAL(5,2),
    "temperature_max" DECIMAL(5,2),
    "warehouse_manager_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_settings" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "setting_key" TEXT NOT NULL,
    "setting_value" TEXT NOT NULL,
    "dataType" TEXT NOT NULL DEFAULT 'STRING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID,
    "dept_code" TEXT NOT NULL,
    "dept_name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "head_user_id" UUID,
    "cost_center_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_heads" (
    "id" UUID NOT NULL,
    "dept_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'HEAD',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_heads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID,
    "cost_center_code" TEXT NOT NULL,
    "cost_center_name" TEXT NOT NULL,
    "cost_center_type" TEXT NOT NULL DEFAULT 'OPERATIONAL',
    "description" TEXT,
    "parent_id" UUID,
    "gl_account_code" TEXT,
    "budget_annual" DECIMAL(18,4),
    "currency_code" CHAR(3) NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_tree_nodes" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "entity_code" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "parent_id" UUID,
    "parent_type" TEXT,
    "hierarchy_level" INTEGER NOT NULL,
    "hierarchy_path" TEXT NOT NULL,
    "children_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_tree_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "role_code" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,
    "role_description" TEXT,
    "role_type" TEXT NOT NULL DEFAULT 'CUSTOM',
    "role_category" TEXT NOT NULL DEFAULT 'OTHER',
    "is_system_role" BOOLEAN NOT NULL DEFAULT false,
    "parent_role_id" UUID,
    "company_id" UUID,
    "access_level" TEXT NOT NULL DEFAULT 'BRANCH',
    "requires_mfa" BOOLEAN NOT NULL DEFAULT false,
    "max_session_minutes" INTEGER NOT NULL DEFAULT 480,
    "concurrent_sessions" INTEGER NOT NULL DEFAULT 3,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "permission_code" TEXT NOT NULL,
    "permission_name" TEXT NOT NULL,
    "permission_description" TEXT,
    "module" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "permission_group_id" UUID,
    "permission_type" TEXT NOT NULL DEFAULT 'ACTION',
    "is_dangerous" BOOLEAN NOT NULL DEFAULT false,
    "is_system_permission" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_groups" (
    "id" UUID NOT NULL,
    "group_code" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permission_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "granted_by" UUID,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_assignments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "company_id" UUID,
    "branch_id" UUID,
    "assigned_by" UUID,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_groups" (
    "id" UUID NOT NULL,
    "group_code" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "group_description" TEXT,
    "group_type" TEXT NOT NULL DEFAULT 'TEAM',
    "company_id" UUID,
    "branch_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "added_by" UUID,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_roles" (
    "id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" UUID NOT NULL,
    "menu_code" TEXT NOT NULL,
    "menu_label" TEXT NOT NULL,
    "menu_icon" TEXT,
    "menu_type" TEXT NOT NULL DEFAULT 'ITEM',
    "module_id" TEXT,
    "route" TEXT,
    "external_url" TEXT,
    "parent_menu_id" UUID,
    "display_order" INTEGER NOT NULL DEFAULT 100,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_pinnable" BOOLEAN NOT NULL DEFAULT true,
    "badge_type" TEXT,
    "badge_source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_permissions" (
    "id" UUID NOT NULL,
    "menu_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_levels" (
    "id" UUID NOT NULL,
    "level_code" TEXT NOT NULL,
    "level_name" TEXT NOT NULL,
    "company_id" UUID,
    "module" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "level_number" INTEGER NOT NULL,
    "role_name" TEXT NOT NULL,
    "min_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "max_amount" DECIMAL(18,4),
    "currency_code" CHAR(3) NOT NULL DEFAULT 'INR',
    "requires_dual_approval" BOOLEAN NOT NULL DEFAULT false,
    "sla_hours" INTEGER NOT NULL DEFAULT 48,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_limits" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "module" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "max_amount" DECIMAL(18,4) NOT NULL,
    "currency_code" CHAR(3) NOT NULL DEFAULT 'INR',
    "daily_limit" DECIMAL(18,4),
    "monthly_limit" DECIMAL(18,4),
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_policies" (
    "id" UUID NOT NULL,
    "policy_code" TEXT NOT NULL,
    "policy_name" TEXT NOT NULL,
    "policy_description" TEXT,
    "policy_type" TEXT NOT NULL,
    "company_id" UUID,
    "branch_id" UUID,
    "role_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "conditions" JSONB NOT NULL DEFAULT '{}',
    "action" TEXT NOT NULL DEFAULT 'DENY',
    "priority" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" UUID NOT NULL,
    "flag_key" TEXT NOT NULL,
    "flag_name" TEXT NOT NULL,
    "flag_description" TEXT,
    "flag_type" TEXT NOT NULL DEFAULT 'BOOLEAN',
    "default_state" TEXT NOT NULL DEFAULT 'DISABLED',
    "current_state" TEXT NOT NULL DEFAULT 'DISABLED',
    "rollout_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "kill_switch_enabled" BOOLEAN NOT NULL DEFAULT false,
    "kill_switch_reason" TEXT,
    "owner_user_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_assignments" (
    "id" UUID NOT NULL,
    "flag_id" UUID NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" UUID NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "conditions" JSONB DEFAULT '{}',
    "assigned_by" UUID,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" UUID NOT NULL,
    "category_code" TEXT NOT NULL,
    "category_name" TEXT NOT NULL,
    "parent_category_id" UUID,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 100,
    "level" INTEGER NOT NULL DEFAULT 1,
    "path" TEXT NOT NULL DEFAULT '/',
    "image_icon" TEXT,
    "is_leaf" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" UUID NOT NULL,
    "brand_code" TEXT NOT NULL,
    "brand_name" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "website" TEXT,
    "manufacturer" TEXT,
    "is_oem" BOOLEAN NOT NULL DEFAULT false,
    "is_private_label" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uoms" (
    "id" UUID NOT NULL,
    "uom_code" TEXT NOT NULL,
    "uom_name" TEXT NOT NULL,
    "uom_type" TEXT NOT NULL DEFAULT 'COUNT',
    "symbol" TEXT,
    "description" TEXT,
    "is_base_unit" BOOLEAN NOT NULL DEFAULT false,
    "decimal_places" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uom_conversions" (
    "id" UUID NOT NULL,
    "from_uom_id" UUID NOT NULL,
    "to_uom_id" UUID NOT NULL,
    "factor" DECIMAL(18,6) NOT NULL,
    "company_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uom_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "upi" TEXT NOT NULL,
    "product_code" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "description" TEXT,
    "product_type" TEXT NOT NULL DEFAULT 'FINISHED_GOODS',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "brand_id" UUID,
    "category_id" UUID,
    "default_uom_id" UUID NOT NULL,
    "hsn_code" VARCHAR(10),
    "tax_group_id" UUID,
    "barcode_type" TEXT NOT NULL DEFAULT 'EAN_13',
    "track_batch" BOOLEAN NOT NULL DEFAULT false,
    "track_serial" BOOLEAN NOT NULL DEFAULT false,
    "track_expiry" BOOLEAN NOT NULL DEFAULT false,
    "shelf_life_days" INTEGER,
    "is_manufactured" BOOLEAN NOT NULL DEFAULT false,
    "is_purchased" BOOLEAN NOT NULL DEFAULT false,
    "is_sold" BOOLEAN NOT NULL DEFAULT true,
    "is_stock_managed" BOOLEAN NOT NULL DEFAULT true,
    "is_kitchen_item" BOOLEAN NOT NULL DEFAULT false,
    "net_weight" DECIMAL(15,3),
    "gross_weight" DECIMAL(15,3),
    "weight_uom_id" UUID,
    "length" DECIMAL(15,3),
    "width" DECIMAL(15,3),
    "height" DECIMAL(15,3),
    "dimension_uom" TEXT DEFAULT 'CM',
    "default_cost_price" DECIMAL(18,4),
    "default_mrp" DECIMAL(18,4),
    "default_selling_price" DECIMAL(18,4),
    "currency_code" CHAR(3) NOT NULL DEFAULT 'INR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attributes" (
    "id" UUID NOT NULL,
    "attribute_code" TEXT NOT NULL,
    "attribute_name" TEXT NOT NULL,
    "attribute_type" TEXT NOT NULL DEFAULT 'TEXT',
    "dataType" TEXT NOT NULL DEFAULT 'STRING',
    "unit" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_variant_attribute" BOOLEAN NOT NULL DEFAULT false,
    "is_searchable" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 100,
    "allowed_values" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_values" (
    "id" UUID NOT NULL,
    "attribute_id" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "display_value" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attribute_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attributes" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "attribute_id" UUID NOT NULL,
    "attribute_value_id" UUID,
    "value_text" TEXT,
    "value_number" DECIMAL(18,6),
    "value_boolean" BOOLEAN,
    "value_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_code" TEXT NOT NULL,
    "variant_name" TEXT NOT NULL,
    "variant_sku" TEXT NOT NULL,
    "variant_barcode" TEXT,
    "variant_attributes" JSONB NOT NULL DEFAULT '{}',
    "cost_price" DECIMAL(18,4),
    "mrp" DECIMAL(18,4),
    "selling_price" DECIMAL(18,4),
    "currency_code" CHAR(3) NOT NULL DEFAULT 'INR',
    "net_weight" DECIMAL(15,3),
    "gross_weight" DECIMAL(15,3),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "image_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "image_type" TEXT NOT NULL DEFAULT 'GALLERY',
    "display_order" INTEGER NOT NULL DEFAULT 100,
    "alt_text" TEXT,
    "file_size_bytes" INTEGER,
    "width_px" INTEGER,
    "height_px" INTEGER,
    "mime_type" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" UUID,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_documents" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "document_name" TEXT NOT NULL,
    "document_type" TEXT NOT NULL DEFAULT 'SPECIFICATION',
    "file_url" TEXT NOT NULL,
    "file_size_bytes" INTEGER,
    "mime_type" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by" UUID,
    "verified_at" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" UUID,

    CONSTRAINT "product_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_families" (
    "id" UUID NOT NULL,
    "family_code" TEXT NOT NULL,
    "family_name" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_family_mappings" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_family_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_groups" (
    "id" UUID NOT NULL,
    "group_code" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "parent_group_id" UUID,
    "description" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "path" TEXT NOT NULL DEFAULT '/',
    "display_order" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_group_mappings" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_group_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_collections" (
    "id" UUID NOT NULL,
    "collection_code" TEXT NOT NULL,
    "collection_name" TEXT NOT NULL,
    "description" TEXT,
    "collection_type" TEXT NOT NULL DEFAULT 'MARKETING',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "image_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "product_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_collection_items" (
    "id" UUID NOT NULL,
    "collection_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 100,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_collection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_templates" (
    "id" UUID NOT NULL,
    "template_code" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "description" TEXT,
    "default_product_type" TEXT,
    "default_category_id" UUID,
    "default_brand_id" UUID,
    "default_uom_id" UUID,
    "default_tax_group_id" UUID,
    "default_hsn_code" TEXT,
    "default_shelf_life_days" INTEGER,
    "default_track_batch" BOOLEAN,
    "default_track_expiry" BOOLEAN,
    "default_barcode_type" TEXT,
    "default_attributes" JSONB NOT NULL DEFAULT '{}',
    "default_is_manufactured" BOOLEAN NOT NULL DEFAULT false,
    "default_is_purchased" BOOLEAN NOT NULL DEFAULT false,
    "default_is_sold" BOOLEAN NOT NULL DEFAULT true,
    "default_is_stock_managed" BOOLEAN NOT NULL DEFAULT true,
    "default_is_kitchen_item" BOOLEAN NOT NULL DEFAULT false,
    "default_specs" JSONB NOT NULL DEFAULT '{}',
    "default_compliance" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_specifications" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "ingredients" JSONB NOT NULL DEFAULT '[]',
    "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "energy_kcal" DECIMAL(8,2),
    "protein_g" DECIMAL(8,2),
    "fat_g" DECIMAL(8,2),
    "carbs_g" DECIMAL(8,2),
    "sugar_g" DECIMAL(8,2),
    "sodium_mg" DECIMAL(8,2),
    "shelf_life_days" INTEGER,
    "storage_conditions" TEXT,
    "storage_temp_min" DECIMAL(5,2),
    "storage_temp_max" DECIMAL(5,2),
    "manufacturing_notes" TEXT,
    "packaging_instructions" TEXT,
    "additional_specs" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_compliance" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "compliance_type" TEXT NOT NULL,
    "certificate_number" TEXT,
    "license_number" TEXT,
    "issuing_authority" TEXT,
    "issued_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "document_url" TEXT,
    "verified_by" UUID,
    "verified_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_compliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_translations" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "description" TEXT,
    "ingredients" TEXT,
    "instructions" TEXT,
    "warnings" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by" UUID,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_versions" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "change_type" TEXT NOT NULL,
    "change_summary" TEXT NOT NULL,
    "change_reason" TEXT,
    "snapshot" JSONB NOT NULL DEFAULT '{}',
    "edited_by" UUID NOT NULL,
    "edited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "rolled_back_from" INTEGER,

    CONSTRAINT "product_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_approval_requests" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "request_number" TEXT NOT NULL,
    "current_stage" TEXT NOT NULL DEFAULT 'DRAFT',
    "submitted_by" UUID NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "qa_reviewer_id" UUID,
    "qa_reviewed_at" TIMESTAMP(3),
    "qa_decision" TEXT,
    "qa_notes" TEXT,
    "compliance_reviewer_id" UUID,
    "compliance_reviewed_at" TIMESTAMP(3),
    "compliance_decision" TEXT,
    "compliance_notes" TEXT,
    "finance_reviewer_id" UUID,
    "finance_reviewed_at" TIMESTAMP(3),
    "finance_decision" TEXT,
    "finance_notes" TEXT,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "published_by" UUID,
    "published_at" TIMESTAMP(3),
    "rejected_by" UUID,
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "sla_due_at" TIMESTAMP(3) NOT NULL,
    "sla_breached" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_usage_matrix" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "use_in_manufacturing" BOOLEAN NOT NULL DEFAULT false,
    "use_in_warehouse" BOOLEAN NOT NULL DEFAULT false,
    "use_in_retail_pos" BOOLEAN NOT NULL DEFAULT false,
    "use_in_restaurant_pos" BOOLEAN NOT NULL DEFAULT false,
    "use_in_ecommerce" BOOLEAN NOT NULL DEFAULT false,
    "use_in_procurement" BOOLEAN NOT NULL DEFAULT false,
    "use_in_finance" BOOLEAN NOT NULL DEFAULT false,
    "manufacturing_role" TEXT,
    "warehouse_role" TEXT,
    "retail_role" TEXT,
    "restaurant_role" TEXT,
    "ecommerce_role" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_usage_matrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_lists" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "company_id" UUID,
    "branch_id" UUID,
    "warehouse_id" UUID,
    "customer_type_id" TEXT,
    "tax_mode" TEXT NOT NULL DEFAULT 'EXCLUSIVE',
    "rounding_rule" TEXT,
    "rounding_digits" INTEGER NOT NULL DEFAULT 2,
    "created_by_id" UUID,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_list_items" (
    "id" UUID NOT NULL,
    "price_list_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_variant_id" UUID,
    "uom_id" UUID,
    "base_price" DECIMAL(18,4) NOT NULL,
    "selling_price" DECIMAL(18,4) NOT NULL,
    "mrp" DECIMAL(18,4),
    "purchase_price" DECIMAL(18,4),
    "transfer_price" DECIMAL(18,4),
    "min_quantity" DECIMAL(18,4),
    "max_quantity" DECIMAL(18,4),
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_list_versions" (
    "id" UUID NOT NULL,
    "price_list_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "change_summary" TEXT,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_list_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_prices" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_variant_id" UUID,
    "uom_id" UUID,
    "company_id" UUID,
    "branch_id" UUID,
    "warehouse_id" UUID,
    "customer_id" UUID,
    "base_price" DECIMAL(18,4),
    "selling_price" DECIMAL(18,4),
    "mrp" DECIMAL(18,4),
    "purchase_price" DECIMAL(18,4),
    "transfer_price" DECIMAL(18,4),
    "average_cost" DECIMAL(18,4),
    "standard_cost" DECIMAL(18,4),
    "last_purchase_cost" DECIMAL(18,4),
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "source_price_list_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_groups" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "is_compound" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" UUID NOT NULL,
    "tax_group_id" UUID NOT NULL,
    "component_type" TEXT NOT NULL,
    "rate_percentage" DECIMAL(8,4) NOT NULL,
    "jurisdiction" TEXT,
    "state_code" TEXT,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_tax_mapping" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "tax_group_id" UUID NOT NULL,
    "hsn_code" TEXT,
    "sac_code" TEXT,
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_tax_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rules" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tax_group_id" UUID,
    "condition_type" TEXT NOT NULL,
    "condition_value" JSONB NOT NULL,
    "action_type" TEXT NOT NULL,
    "action_value" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_rules" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "discount_value" DECIMAL(18,4) NOT NULL,
    "discount_type" TEXT NOT NULL,
    "max_discount_amount" DECIMAL(18,4),
    "is_stackable" BOOLEAN NOT NULL DEFAULT false,
    "stack_priority" INTEGER NOT NULL DEFAULT 100,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_conditions" (
    "id" UUID NOT NULL,
    "discount_rule_id" UUID NOT NULL,
    "condition_field" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "condition_value" JSONB NOT NULL,
    "logical_op" TEXT NOT NULL DEFAULT 'AND',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discount_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_targets" (
    "id" UUID NOT NULL,
    "discount_rule_id" UUID NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discount_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "offer_type" TEXT NOT NULL,
    "offer_value" DECIMAL(18,4),
    "free_product_id" UUID,
    "free_quantity" DECIMAL(18,4),
    "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),
    "max_usage_count" INTEGER,
    "max_usage_per_customer" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_products" (
    "id" UUID NOT NULL,
    "promotion_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_variant_id" UUID,
    "min_quantity" DECIMAL(18,4),
    "max_quantity" DECIMAL(18,4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_conditions" (
    "id" UUID NOT NULL,
    "promotion_id" UUID NOT NULL,
    "condition_field" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "condition_value" JSONB NOT NULL,
    "logical_op" TEXT NOT NULL DEFAULT 'AND',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_profiles" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_variant_id" UUID,
    "costing_method" TEXT NOT NULL,
    "purchase_cost" DECIMAL(18,4),
    "average_cost" DECIMAL(18,4),
    "fifo_cost" DECIMAL(18,4),
    "weighted_average_cost" DECIMAL(18,4),
    "standard_cost" DECIMAL(18,4),
    "last_purchase_cost" DECIMAL(18,4),
    "landing_cost" DECIMAL(18,4),
    "overhead_cost" DECIMAL(18,4),
    "total_cost" DECIMAL(18,4),
    "company_id" UUID,
    "branch_id" UUID,
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "margin_rules" (
    "id" UUID NOT NULL,
    "product_id" UUID,
    "category_id" UUID,
    "brand_id" UUID,
    "min_margin_percent" DECIMAL(8,4),
    "max_margin_percent" DECIMAL(8,4),
    "target_margin_percent" DECIMAL(8,4),
    "markup_percent" DECIMAL(8,4),
    "markdown_percent" DECIMAL(8,4),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "margin_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "future_prices" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_variant_id" UUID,
    "price_list_id" UUID,
    "current_price" DECIMAL(18,4) NOT NULL,
    "future_price" DECIMAL(18,4) NOT NULL,
    "change_percent" DECIMAL(8,4),
    "effective_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "auto_activate" BOOLEAN NOT NULL DEFAULT true,
    "activated_at" TIMESTAMP(3),
    "rolled_back_at" TIMESTAMP(3),
    "rollback_reason" TEXT,
    "approval_request_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "future_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_approval_requests" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "entity_name" TEXT NOT NULL,
    "current_stage" TEXT NOT NULL DEFAULT 'DRAFT',
    "pricing_team_reviewer_id" UUID,
    "pricing_team_reviewed_at" TIMESTAMP(3),
    "pricing_team_decision" TEXT,
    "pricing_team_notes" TEXT,
    "finance_reviewer_id" UUID,
    "finance_reviewed_at" TIMESTAMP(3),
    "finance_decision" TEXT,
    "finance_notes" TEXT,
    "management_reviewer_id" UUID,
    "management_reviewed_at" TIMESTAMP(3),
    "management_decision" TEXT,
    "management_notes" TEXT,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "published_by" UUID,
    "published_at" TIMESTAMP(3),
    "rejected_by" UUID,
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "sla_due_at" TIMESTAMP(3) NOT NULL,
    "sla_breached" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commercial_rules" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rule_type" TEXT NOT NULL,
    "company_id" UUID,
    "branch_id" UUID,
    "product_id" UUID,
    "category_id" UUID,
    "brand_id" UUID,
    "customer_id" UUID,
    "customer_group_id" TEXT,
    "rule_value" JSONB NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_to" TIMESTAMP(3),
    "enforcement_mode" TEXT NOT NULL DEFAULT 'HARD_BLOCK',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commercial_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_resolution_logs" (
    "id" UUID NOT NULL,
    "request_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "product_id" UUID NOT NULL,
    "product_variant_id" UUID,
    "company_id" UUID,
    "branch_id" UUID,
    "customer_id" UUID,
    "uom_id" UUID,
    "quantity" DECIMAL(18,4) NOT NULL,
    "base_price" DECIMAL(18,4) NOT NULL,
    "list_price" DECIMAL(18,4) NOT NULL,
    "applied_discounts" JSONB NOT NULL DEFAULT '[]',
    "applied_promotions" JSONB NOT NULL DEFAULT '[]',
    "discount_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "promotion_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "taxable_amount" DECIMAL(18,4) NOT NULL,
    "tax_components" JSONB NOT NULL DEFAULT '[]',
    "tax_amount" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "final_price" DECIMAL(18,4) NOT NULL,
    "resolution_trace" JSONB NOT NULL,
    "source_price_list_id" UUID,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "response_time_ms" INTEGER NOT NULL,

    CONSTRAINT "price_resolution_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_partners" (
    "id" UUID NOT NULL,
    "partner_code" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "partner_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "gst_number" TEXT,
    "pan_number" TEXT,
    "msme_number" TEXT,
    "fssai_number" TEXT,
    "iec_code" TEXT,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "credit_limit" DECIMAL(18,2),
    "credit_days" INTEGER,
    "payment_terms_id" TEXT,
    "payment_mode" TEXT,
    "preferred_language" TEXT,
    "website" TEXT,
    "logo_url" TEXT,
    "risk_category" TEXT,
    "risk_score" DECIMAL(5,2),
    "parent_partner_id" UUID,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "business_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_partner_roles" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,

    CONSTRAINT "business_partner_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_partner_addresses" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "address_type" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "line_1" TEXT NOT NULL,
    "line_2" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "state" TEXT NOT NULL,
    "state_code" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "country_code" CHAR(2),
    "pincode" TEXT NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "contact_name" TEXT,
    "contact_phone" TEXT,
    "contact_email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_partner_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_partner_contacts" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "designation" TEXT,
    "department" TEXT,
    "email" TEXT,
    "mobile" TEXT,
    "office_phone" TEXT,
    "whatsapp" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "preferred_contact" TEXT,
    "linked_user_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_partner_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_partner_financial_profiles" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "credit_limit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "outstanding_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "available_credit" DECIMAL(18,2),
    "credit_days" INTEGER NOT NULL DEFAULT 0,
    "default_currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "payment_mode" TEXT NOT NULL DEFAULT 'CREDIT',
    "payment_terms" TEXT,
    "tax_category" TEXT,
    "risk_category" TEXT NOT NULL DEFAULT 'MEDIUM',
    "risk_score" DECIMAL(5,2),
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_business_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_partner_financial_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_partner_compliance" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "compliance_type" TEXT NOT NULL,
    "certificate_number" TEXT NOT NULL,
    "issuing_authority" TEXT,
    "issue_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "document_url" TEXT,
    "document_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by_id" UUID,
    "verified_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_partner_compliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_groups" (
    "id" UUID NOT NULL,
    "group_code" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "description" TEXT,
    "groupType" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "discount_percent" DECIMAL(5,2),
    "payment_terms_default" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_partner_group_memberships" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "group_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by_id" UUID,

    CONSTRAINT "business_partner_group_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_tags" (
    "id" UUID NOT NULL,
    "tag_name" TEXT NOT NULL,
    "tag_color" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_partner_bank_accounts" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "branch_name" TEXT,
    "ifsc_code" TEXT NOT NULL,
    "swift_code" TEXT,
    "iban" TEXT,
    "upi_id" TEXT,
    "account_type" TEXT NOT NULL DEFAULT 'SAVINGS',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "verified_by_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_partner_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_partner_relationships" (
    "id" UUID NOT NULL,
    "from_partner_id" UUID NOT NULL,
    "to_partner_id" UUID NOT NULL,
    "relationship_type" TEXT NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_to" TIMESTAMP(3),
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_partner_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_partner_scorecards" (
    "id" UUID NOT NULL,
    "partner_id" UUID NOT NULL,
    "period_year" INTEGER NOT NULL,
    "period_quarter" INTEGER,
    "on_time_delivery_rating" DECIMAL(5,2),
    "order_accuracy_rating" DECIMAL(5,2),
    "quality_rating" DECIMAL(5,2),
    "complaint_rate" DECIMAL(5,2),
    "payment_history_rating" DECIMAL(5,2),
    "response_time_rating" DECIMAL(5,2),
    "risk_score" DECIMAL(5,2),
    "overall_score" DECIMAL(5,2),
    "performance_grade" TEXT,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_order_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_complaints" INTEGER NOT NULL DEFAULT 0,
    "total_returns" INTEGER NOT NULL DEFAULT 0,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_partner_scorecards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barcode_types" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "format" TEXT,
    "length" INTEGER,
    "requires_checksum" BOOLEAN NOT NULL DEFAULT false,
    "is_gs1_standard" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barcode_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barcodes" (
    "id" UUID NOT NULL,
    "barcode" TEXT NOT NULL,
    "barcode_type_id" UUID NOT NULL,
    "product_id" UUID,
    "product_variant_id" UUID,
    "uom_id" UUID,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "effective_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3),
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barcodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barcode_assignments" (
    "id" UUID NOT NULL,
    "barcode_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "company_id" UUID,
    "branch_id" UUID,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by_id" UUID,

    CONSTRAINT "barcode_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_codes" (
    "id" UUID NOT NULL,
    "qrCode" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "qr_data" JSONB NOT NULL,
    "is_encrypted" BOOLEAN NOT NULL DEFAULT false,
    "encryption_method" TEXT,
    "effective_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3),
    "scan_count" INTEGER NOT NULL DEFAULT 0,
    "last_scanned_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" UUID NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "product_id" UUID NOT NULL,
    "product_variant_id" UUID,
    "manufacturing_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "best_before_date" TIMESTAMP(3),
    "quantity_produced" DECIMAL(18,4) NOT NULL,
    "quantity_remaining" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "uom_id" UUID,
    "manufacturing_order_id" TEXT,
    "warehouse_id" UUID,
    "branch_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "status_reason" TEXT,
    "quality_grade" TEXT,
    "inspected_by" UUID,
    "inspected_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots" (
    "id" UUID NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "batch_id" UUID,
    "product_id" UUID NOT NULL,
    "product_variant_id" UUID,
    "lot_type" TEXT NOT NULL,
    "supplier_id" UUID,
    "supplier_invoice_number" TEXT,
    "quantity_received" DECIMAL(18,4) NOT NULL,
    "quantity_remaining" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "uom_id" UUID,
    "received_date" TIMESTAMP(3),
    "manufacturing_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "qualityStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "inspection_notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serial_numbers" (
    "id" UUID NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "product_id" UUID NOT NULL,
    "product_variant_id" UUID,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "warranty_start" TIMESTAMP(3),
    "warranty_end" TIMESTAMP(3),
    "warrantyDays" INTEGER,
    "service_history" JSONB NOT NULL DEFAULT '[]',
    "last_service_date" TIMESTAMP(3),
    "next_service_date" TIMESTAMP(3),
    "current_location" TEXT,
    "current_branch_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "serial_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gs1_identifiers" (
    "id" UUID NOT NULL,
    "gs1_type" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "application_identifiers" JSONB,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "company_prefix" TEXT NOT NULL,
    "check_digit" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gs1_identifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "label_templates" (
    "id" UUID NOT NULL,
    "template_code" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "label_type" TEXT NOT NULL,
    "print_format" TEXT NOT NULL,
    "width_mm" DECIMAL(10,2) NOT NULL,
    "height_mm" DECIMAL(10,2) NOT NULL,
    "layout" JSONB NOT NULL,
    "fields" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "label_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "label_print_jobs" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "print_mode" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "printer_type" TEXT NOT NULL,
    "printer_name" TEXT NOT NULL,
    "copies_per_entity" INTEGER NOT NULL DEFAULT 1,
    "total_copies" INTEGER NOT NULL DEFAULT 0,
    "printed_copies" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "error_message" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "requested_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "label_print_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traceability_logs" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "entity_name" TEXT NOT NULL,
    "batch_id" UUID,
    "event_type" TEXT NOT NULL,
    "from_entity_type" TEXT,
    "from_entity_id" UUID,
    "from_entity_name" TEXT,
    "to_entity_type" TEXT,
    "to_entity_id" UUID,
    "to_entity_name" TEXT,
    "quantity" DECIMAL(18,4),
    "uom_id" UUID,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "warehouse_id" UUID,
    "branch_id" UUID,
    "partner_id" UUID,
    "partner_name" TEXT,
    "notes" TEXT,
    "event_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traceability_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_lifecycle" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "current_state" TEXT NOT NULL,
    "previous_state" TEXT,
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "activated_at" TIMESTAMP(3),
    "inactivated_at" TIMESTAMP(3),
    "discontinued_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "state_reason" TEXT,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_lifecycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_lifecycle_history" (
    "id" UUID NOT NULL,
    "lifecycle_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "from_state" TEXT NOT NULL,
    "to_state" TEXT NOT NULL,
    "changed_by_id" UUID,
    "changed_by_name" TEXT,
    "reason" TEXT,
    "comments" TEXT,
    "ip_address" TEXT,
    "approval_step_id" UUID,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_lifecycle_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_approval_workflows" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "workflow_type" TEXT NOT NULL,
    "is_parallel" BOOLEAN NOT NULL DEFAULT false,
    "current_stage" TEXT NOT NULL DEFAULT 'CREATOR',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sla_due_at" TIMESTAMP(3) NOT NULL,
    "sla_breached" BOOLEAN NOT NULL DEFAULT false,
    "initiated_by_id" UUID,
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_approval_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_approval_steps" (
    "id" UUID NOT NULL,
    "workflow_id" UUID NOT NULL,
    "step_order" INTEGER NOT NULL,
    "step_name" TEXT NOT NULL,
    "step_type" TEXT NOT NULL,
    "approver_id" UUID,
    "approver_role" TEXT,
    "decision" TEXT,
    "decision_comments" TEXT,
    "decided_at" TIMESTAMP(3),
    "condition_expression" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_approval_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_approval_logs" (
    "id" UUID NOT NULL,
    "workflow_id" UUID NOT NULL,
    "step_id" UUID,
    "action" TEXT NOT NULL,
    "step_name" TEXT NOT NULL,
    "actor_id" UUID,
    "actor_name" TEXT,
    "comments" TEXT,
    "ip_address" TEXT,
    "action_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_approval_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_jobs" (
    "id" UUID NOT NULL,
    "job_code" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "file_format" TEXT NOT NULL,
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "processed_rows" INTEGER NOT NULL DEFAULT 0,
    "success_rows" INTEGER NOT NULL DEFAULT 0,
    "error_rows" INTEGER NOT NULL DEFAULT 0,
    "duplicate_rows" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "is_rollbackable" BOOLEAN NOT NULL DEFAULT true,
    "rolled_back_at" TIMESTAMP(3),
    "rolled_back_by_id" UUID,
    "rollback_reason" TEXT,
    "validation_summary" JSONB,
    "initiated_by_id" UUID,
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_jobs" (
    "id" UUID NOT NULL,
    "job_code" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "filters" JSONB NOT NULL DEFAULT '{}',
    "file_format" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT,
    "file_size_bytes" INTEGER,
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "exported_rows" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "initiated_by_id" UUID,
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "export_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_errors" (
    "id" UUID NOT NULL,
    "import_job_id" UUID NOT NULL,
    "row_number" INTEGER NOT NULL,
    "column_name" TEXT,
    "error_type" TEXT NOT NULL,
    "error_message" TEXT NOT NULL,
    "error_value" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'ERROR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_errors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_rules" (
    "id" UUID NOT NULL,
    "rule_code" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "description" TEXT,
    "entity_type" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "rule_config" JSONB NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'ERROR',
    "enforcement_mode" TEXT NOT NULL DEFAULT 'BLOCK',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "validation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validation_results" (
    "id" UUID NOT NULL,
    "rule_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "entity_name" TEXT NOT NULL,
    "is_valid" BOOLEAN NOT NULL,
    "error_message" TEXT,
    "field_value" TEXT,
    "validation_batch" TEXT,
    "validated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validation_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "duplicate_candidates" (
    "id" UUID NOT NULL,
    "primary_entity_type" TEXT NOT NULL,
    "primary_entity_id" UUID NOT NULL,
    "primary_entity_name" TEXT NOT NULL,
    "duplicate_entity_type" TEXT NOT NULL,
    "duplicate_entity_id" UUID NOT NULL,
    "duplicate_entity_name" TEXT NOT NULL,
    "detection_rule" TEXT NOT NULL,
    "match_score" DECIMAL(5,2) NOT NULL,
    "matched_fields" JSONB NOT NULL DEFAULT '[]',
    "resolution_status" TEXT NOT NULL DEFAULT 'PENDING',
    "resolution_action" TEXT,
    "resolved_by_id" UUID,
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "duplicate_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merge_history" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "primary_entity_id" UUID NOT NULL,
    "merged_entity_id" UUID NOT NULL,
    "primary_entity_name" TEXT NOT NULL,
    "merged_entity_name" TEXT NOT NULL,
    "fields_merged" JSONB NOT NULL DEFAULT '[]',
    "references_moved" JSONB NOT NULL DEFAULT '[]',
    "duplicate_action" TEXT NOT NULL,
    "merged_by_id" UUID,
    "merged_by_name" TEXT,
    "merged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "notes" TEXT,

    CONSTRAINT "merge_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_data_audit" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "entity_name" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "module_name" TEXT NOT NULL,
    "before_value" JSONB,
    "after_value" JSONB,
    "changed_fields" JSONB NOT NULL DEFAULT '[]',
    "user_id" UUID,
    "user_name" TEXT,
    "user_role" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "reason" TEXT,
    "reference_type" TEXT,
    "reference_id" UUID,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "master_data_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_quality_metrics" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "metric_name" TEXT NOT NULL,
    "metric_value" DECIMAL(8,2) NOT NULL,
    "metric_unit" TEXT NOT NULL DEFAULT 'PERCENT',
    "quality_score" DECIMAL(5,2),
    "measured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period_date" TIMESTAMP(3) NOT NULL,
    "details" JSONB DEFAULT '{}',

    CONSTRAINT "data_quality_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_change_history" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "change_type" TEXT NOT NULL,
    "changed_fields" JSONB NOT NULL DEFAULT '[]',
    "before_snapshot" JSONB NOT NULL,
    "after_snapshot" JSONB NOT NULL,
    "edited_by_id" UUID,
    "edited_by_name" TEXT,
    "reason" TEXT,
    "approval_workflow_id" UUID,
    "is_rollbackable" BOOLEAN NOT NULL DEFAULT true,
    "rolled_back_to_version" INTEGER,
    "rolled_back_at" TIMESTAMP(3),
    "rolled_back_by_id" UUID,
    "rollback_reason" TEXT,
    "ip_address" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_change_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transaction_types" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "effect_type" TEXT NOT NULL,
    "affects_available" BOOLEAN NOT NULL DEFAULT true,
    "affects_reserved" BOOLEAN NOT NULL DEFAULT false,
    "affects_allocated" BOOLEAN NOT NULL DEFAULT false,
    "affects_damaged" BOOLEAN NOT NULL DEFAULT false,
    "affects_expired" BOOLEAN NOT NULL DEFAULT false,
    "affects_in_transit" BOOLEAN NOT NULL DEFAULT false,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "is_reversible" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transaction_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" UUID NOT NULL,
    "transaction_number" TEXT NOT NULL,
    "transaction_type_id" UUID NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "posting_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "company_id" UUID,
    "branch_id" UUID,
    "warehouse_id" UUID,
    "to_warehouse_id" UUID,
    "partner_id" UUID,
    "partner_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "reversal_of_transaction_id" UUID,
    "reversed_by_id" UUID,
    "reversed_at" TIMESTAMP(3),
    "reversal_reason" TEXT,
    "remarks" TEXT,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transaction_lines" (
    "id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "line_order" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "product_variant_id" UUID,
    "batch_id" UUID,
    "lot_id" UUID,
    "serial_number_id" UUID,
    "uom_id" UUID,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit_cost" DECIMAL(18,4),
    "total_cost" DECIMAL(18,4),
    "from_location_id" UUID,
    "to_location_id" UUID,
    "from_bin" TEXT,
    "to_bin" TEXT,
    "expiry_date" TIMESTAMP(3),
    "inventory_status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transaction_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_ledger" (
    "id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "transaction_number" TEXT NOT NULL,
    "transaction_type_id" UUID NOT NULL,
    "transaction_type_code" TEXT NOT NULL,
    "product_id" UUID NOT NULL,
    "product_variant_id" UUID,
    "batch_id" UUID,
    "lot_id" UUID,
    "serial_number_id" UUID,
    "uom_id" UUID,
    "company_id" UUID,
    "warehouse_id" UUID,
    "location_id" UUID,
    "bin" TEXT,
    "quantity_delta" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "available_delta" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "reserved_delta" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "allocated_delta" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "damaged_delta" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "expired_delta" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "in_transit_delta" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(18,4),
    "total_cost" DECIMAL(18,4),
    "posting_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "is_reversal" BOOLEAN NOT NULL DEFAULT false,
    "reversal_of_ledger_id" UUID,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_statuses" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT false,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "is_negative_allowed" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_balances" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_variant_id" UUID,
    "company_id" UUID,
    "branch_id" UUID,
    "warehouse_id" UUID,
    "location_id" UUID,
    "bin" TEXT,
    "batch_id" UUID,
    "lot_id" UUID,
    "serial_number_id" UUID,
    "uom_id" UUID,
    "expiry_date" TIMESTAMP(3),
    "available_quantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "reserved_quantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "allocated_quantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "damaged_quantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "expired_quantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "in_transit_quantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_quantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(18,4),
    "total_value" DECIMAL(18,4),
    "last_transaction_id" UUID,
    "last_transaction_date" TIMESTAMP(3),
    "last_reconciled_at" TIMESTAMP(3),
    "is_reconciled" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL,
    "transaction_id" UUID,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "movement_type" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "uom_id" UUID,
    "from_warehouse_id" UUID,
    "from_warehouse_name" TEXT,
    "from_location_id" UUID,
    "from_location_name" TEXT,
    "to_warehouse_id" UUID,
    "to_warehouse_name" TEXT,
    "to_location_id" UUID,
    "to_location_name" TEXT,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "partner_id" UUID,
    "partner_name" TEXT,
    "performed_by_id" UUID,
    "performed_by_name" TEXT,
    "reason" TEXT,
    "approved_by_id" UUID,
    "movement_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_journal" (
    "id" UUID NOT NULL,
    "journal_entry_number" TEXT NOT NULL,
    "transaction_id" UUID,
    "entry_type" TEXT NOT NULL,
    "product_id" UUID NOT NULL,
    "product_variant_id" UUID,
    "batch_id" UUID,
    "uom_id" UUID,
    "company_id" UUID,
    "warehouse_id" UUID,
    "location_id" UUID,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit_cost" DECIMAL(18,4),
    "total_value" DECIMAL(18,4),
    "inventory_account" TEXT NOT NULL,
    "offset_account" TEXT,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "posting_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "is_reversal" BOOLEAN NOT NULL DEFAULT false,
    "reversal_of_entry_id" UUID,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipts" (
    "id" UUID NOT NULL,
    "grn_number" TEXT NOT NULL,
    "receipt_date" TIMESTAMP(3) NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receipt_type" TEXT NOT NULL,
    "supplier_id" UUID,
    "supplier_name" TEXT,
    "partner_id" UUID,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "vehicle_number" TEXT,
    "driver_name" TEXT,
    "gate_entry_number" TEXT,
    "delivery_challan" TEXT,
    "company_id" UUID,
    "branch_id" UUID,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "receiving_dock_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "quality_hold_required" BOOLEAN NOT NULL DEFAULT false,
    "quality_status" TEXT,
    "quality_inspected_by_id" UUID,
    "quality_inspected_at" TIMESTAMP(3),
    "quality_notes" TEXT,
    "total_lines" INTEGER NOT NULL DEFAULT 0,
    "total_ordered_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_received_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_accepted_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_rejected_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "inventory_posted" BOOLEAN NOT NULL DEFAULT false,
    "inventory_transaction_id" UUID,
    "posted_at" TIMESTAMP(3),
    "putaway_completed" BOOLEAN NOT NULL DEFAULT false,
    "putaway_completed_at" TIMESTAMP(3),
    "remarks" TEXT,
    "received_by_id" UUID,
    "received_by_name" TEXT,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goods_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goods_receipt_lines" (
    "id" UUID NOT NULL,
    "goods_receipt_id" UUID NOT NULL,
    "line_order" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_variant_id" UUID,
    "uom_id" UUID,
    "uom_name" TEXT,
    "ordered_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "received_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "accepted_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "rejected_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "variance_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "variance_percent" DECIMAL(8,4),
    "batch_id" UUID,
    "batch_number" TEXT,
    "supplier_batch_no" TEXT,
    "manufacturing_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "best_before_date" TIMESTAMP(3),
    "barcode_scanned" TEXT,
    "barcode_type" TEXT,
    "unit_cost" DECIMAL(18,4),
    "total_cost" DECIMAL(18,4),
    "quality_status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "suggested_location_id" UUID,
    "suggested_bin" TEXT,
    "actual_location_id" UUID,
    "actual_bin" TEXT,
    "putaway_status" TEXT NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goods_receipt_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "putaway_rules" (
    "id" UUID NOT NULL,
    "rule_code" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "description" TEXT,
    "strategy" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "product_category_id" UUID,
    "product_type" TEXT,
    "warehouse_id" UUID,
    "target_zone_id" UUID,
    "target_zone_name" TEXT,
    "temperature_zone" TEXT,
    "check_capacity" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "putaway_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "putaway_tasks" (
    "id" UUID NOT NULL,
    "task_number" TEXT NOT NULL,
    "goods_receipt_id" UUID,
    "goods_receipt_line_id" UUID,
    "grn_number" TEXT,
    "putaway_rule_id" UUID,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "uom_id" UUID,
    "quantity" DECIMAL(18,4) NOT NULL,
    "from_warehouse_id" UUID,
    "from_location_id" UUID,
    "from_location_name" TEXT,
    "to_warehouse_id" UUID,
    "to_location_id" UUID,
    "to_location_name" TEXT,
    "to_bin" TEXT,
    "to_zone" TEXT,
    "assigned_to_id" UUID,
    "assigned_to_name" TEXT,
    "assigned_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "completed_by_id" UUID,
    "completed_by_name" TEXT,
    "inventory_posted" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "putaway_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_holds" (
    "id" UUID NOT NULL,
    "hold_number" TEXT NOT NULL,
    "goods_receipt_id" UUID,
    "goods_receipt_line_id" UUID,
    "grn_number" TEXT,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "quantity_held" DECIMAL(18,4) NOT NULL,
    "uom_id" UUID,
    "hold_reason" TEXT NOT NULL,
    "hold_notes" TEXT,
    "inspection_type" TEXT,
    "inspection_result" TEXT,
    "inspection_notes" TEXT,
    "inspected_by_id" UUID,
    "inspected_by_name" TEXT,
    "inspected_at" TIMESTAMP(3),
    "resolution_status" TEXT NOT NULL DEFAULT 'PENDING',
    "released_qty" DECIMAL(18,4),
    "rejected_qty" DECIMAL(18,4),
    "scrapped_qty" DECIMAL(18,4),
    "resolution_notes" TEXT,
    "resolved_by_id" UUID,
    "resolved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_holds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_issues" (
    "id" UUID NOT NULL,
    "issue_number" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issue_type" TEXT NOT NULL,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "company_id" UUID,
    "branch_id" UUID,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "requested_by_id" UUID,
    "requested_by_name" TEXT,
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "destination_type" TEXT,
    "destination_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "rejection_reason" TEXT,
    "total_lines" INTEGER NOT NULL DEFAULT 0,
    "total_requested_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_issued_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "inventory_posted" BOOLEAN NOT NULL DEFAULT false,
    "inventory_transaction_id" UUID,
    "posted_at" TIMESTAMP(3),
    "picking_required" BOOLEAN NOT NULL DEFAULT true,
    "picking_completed" BOOLEAN NOT NULL DEFAULT false,
    "picking_completed_at" TIMESTAMP(3),
    "remarks" TEXT,
    "issued_by_id" UUID,
    "issued_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_issue_lines" (
    "id" UUID NOT NULL,
    "stock_issue_id" UUID NOT NULL,
    "line_order" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_variant_id" UUID,
    "uom_id" UUID,
    "uom_name" TEXT,
    "batch_id" UUID,
    "batch_number" TEXT,
    "lot_id" UUID,
    "serial_number_id" UUID,
    "serial_number" TEXT,
    "requested_qty" DECIMAL(18,4) NOT NULL,
    "issued_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "storage_location_id" UUID,
    "storage_location_name" TEXT,
    "bin" TEXT,
    "barcode_scanned" TEXT,
    "barcode_verified" BOOLEAN NOT NULL DEFAULT false,
    "unit_cost" DECIMAL(18,4),
    "total_cost" DECIMAL(18,4),
    "picking_status" TEXT NOT NULL DEFAULT 'PENDING',
    "picked_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "reason" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_issue_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "picking_tasks" (
    "id" UUID NOT NULL,
    "task_number" TEXT NOT NULL,
    "stock_issue_id" UUID,
    "issue_number" TEXT,
    "picking_strategy" TEXT NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "zone" TEXT,
    "assigned_to_id" UUID,
    "assigned_to_name" TEXT,
    "assigned_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total_lines" INTEGER NOT NULL DEFAULT 0,
    "picked_lines" INTEGER NOT NULL DEFAULT 0,
    "total_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "picked_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "picking_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "picking_task_lines" (
    "id" UUID NOT NULL,
    "picking_task_id" UUID NOT NULL,
    "line_order" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "uom_id" UUID,
    "pick_location_id" UUID,
    "pick_location_name" TEXT,
    "pick_bin" TEXT,
    "pick_zone" TEXT,
    "required_qty" DECIMAL(18,4) NOT NULL,
    "picked_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "barcode_scanned" TEXT,
    "barcode_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "short_pick_reason" TEXT,
    "picked_at" TIMESTAMP(3),
    "picked_by_id" UUID,
    "picked_by_name" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "picking_task_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrap_records" (
    "id" UUID NOT NULL,
    "scrap_number" TEXT NOT NULL,
    "scrap_date" TIMESTAMP(3) NOT NULL,
    "scrap_type" TEXT NOT NULL,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "uom_id" UUID,
    "scrap_qty" DECIMAL(18,4) NOT NULL,
    "unit_cost" DECIMAL(18,4),
    "total_scrap_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "scrap_reason" TEXT NOT NULL,
    "scrap_reason_detail" TEXT,
    "disposal_method" TEXT,
    "disposal_date" TIMESTAMP(3),
    "disposal_witness_id" UUID,
    "disposal_witness_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "inventory_posted" BOOLEAN NOT NULL DEFAULT false,
    "inventory_transaction_id" UUID,
    "posted_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scrap_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "damage_records" (
    "id" UUID NOT NULL,
    "damage_number" TEXT NOT NULL,
    "damage_date" TIMESTAMP(3) NOT NULL,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "damage_type" TEXT NOT NULL,
    "damage_severity" TEXT NOT NULL,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "uom_id" UUID,
    "damaged_qty" DECIMAL(18,4) NOT NULL,
    "unit_cost" DECIMAL(18,4),
    "total_damage_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "insurance_claimable" BOOLEAN NOT NULL DEFAULT false,
    "insurance_claim_number" TEXT,
    "insurance_claim_amount" DECIMAL(18,2),
    "damage_reason" TEXT NOT NULL,
    "damage_description" TEXT,
    "disposition" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "status" TEXT NOT NULL DEFAULT 'REPORTED',
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "inventory_posted" BOOLEAN NOT NULL DEFAULT false,
    "inventory_transaction_id" UUID,
    "posted_at" TIMESTAMP(3),
    "remarks" TEXT,
    "reported_by_id" UUID,
    "reported_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "damage_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfers" (
    "id" UUID NOT NULL,
    "transfer_number" TEXT NOT NULL,
    "transfer_date" TIMESTAMP(3) NOT NULL,
    "transfer_type" TEXT NOT NULL,
    "source_company_id" UUID,
    "source_branch_id" UUID,
    "source_warehouse_id" UUID,
    "source_warehouse_name" TEXT,
    "dest_company_id" UUID,
    "dest_branch_id" UUID,
    "dest_warehouse_id" UUID,
    "dest_warehouse_name" TEXT,
    "vehicle_number" TEXT,
    "driver_name" TEXT,
    "carrier_id" UUID,
    "carrier_name" TEXT,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total_lines" INTEGER NOT NULL DEFAULT 0,
    "total_requested_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_dispatched_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_received_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "submitted_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "dispatched_at" TIMESTAMP(3),
    "dispatched_by_id" UUID,
    "in_transit_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "received_by_id" UUID,
    "completed_at" TIMESTAMP(3),
    "estimated_arrival" TIMESTAMP(3),
    "actual_arrival" TIMESTAMP(3),
    "remarks" TEXT,
    "requested_by_id" UUID,
    "requested_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfer_lines" (
    "id" UUID NOT NULL,
    "stock_transfer_id" UUID NOT NULL,
    "line_order" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_variant_id" UUID,
    "batch_id" UUID,
    "batch_number" TEXT,
    "lot_id" UUID,
    "serial_number_id" UUID,
    "uom_id" UUID,
    "uom_name" TEXT,
    "requested_qty" DECIMAL(18,4) NOT NULL,
    "dispatched_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "received_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "source_location_id" UUID,
    "source_location_name" TEXT,
    "source_bin" TEXT,
    "dest_location_id" UUID,
    "dest_location_name" TEXT,
    "dest_bin" TEXT,
    "unit_cost" DECIMAL(18,4),
    "total_cost" DECIMAL(18,4),
    "receipt_status" TEXT NOT NULL DEFAULT 'PENDING',
    "variance_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "variance_reason" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_transfer_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_in_transit" (
    "id" UUID NOT NULL,
    "stock_transfer_id" UUID,
    "transfer_number" TEXT,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "uom_id" UUID,
    "quantity" DECIMAL(18,4) NOT NULL,
    "source_warehouse_id" UUID,
    "source_warehouse_name" TEXT,
    "dest_warehouse_id" UUID,
    "dest_warehouse_name" TEXT,
    "vehicle_number" TEXT,
    "driver_name" TEXT,
    "carrier_name" TEXT,
    "dispatched_at" TIMESTAMP(3) NOT NULL,
    "estimated_arrival" TIMESTAMP(3),
    "actual_arrival" TIMESTAMP(3),
    "transit_status" TEXT NOT NULL DEFAULT 'IN_TRANSIT',
    "unit_cost" DECIMAL(18,4),
    "total_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_in_transit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bin_transfers" (
    "id" UUID NOT NULL,
    "bin_transfer_number" TEXT NOT NULL,
    "transfer_date" TIMESTAMP(3) NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "uom_id" UUID,
    "quantity" DECIMAL(18,4) NOT NULL,
    "from_zone" TEXT,
    "from_rack" TEXT,
    "from_bin" TEXT NOT NULL,
    "from_location_name" TEXT,
    "to_zone" TEXT,
    "to_rack" TEXT,
    "to_bin" TEXT NOT NULL,
    "to_location_name" TEXT,
    "transfer_reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),
    "completed_by_id" UUID,
    "completed_by_name" TEXT,
    "barcode_scanned" TEXT,
    "remarks" TEXT,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bin_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_adjustments" (
    "id" UUID NOT NULL,
    "adjustment_number" TEXT NOT NULL,
    "adjustment_date" TIMESTAMP(3) NOT NULL,
    "adjustment_type" TEXT NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "company_id" UUID,
    "branch_id" UUID,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "adjustment_reason_id" UUID,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total_lines" INTEGER NOT NULL DEFAULT 0,
    "total_adjustment_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_adjustment_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "submitted_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "posted_at" TIMESTAMP(3),
    "inventory_posted" BOOLEAN NOT NULL DEFAULT false,
    "inventory_transaction_id" UUID,
    "finance_posted" BOOLEAN NOT NULL DEFAULT false,
    "gl_entry_number" TEXT,
    "is_write_off" BOOLEAN NOT NULL DEFAULT false,
    "write_off_approved_by_id" UUID,
    "write_off_approved_at" TIMESTAMP(3),
    "photo_required" BOOLEAN NOT NULL DEFAULT false,
    "photo_attached" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "requested_by_id" UUID,
    "requested_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_adjustment_lines" (
    "id" UUID NOT NULL,
    "inventory_adjustment_id" UUID NOT NULL,
    "line_order" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "lot_id" UUID,
    "serial_number_id" UUID,
    "uom_id" UUID,
    "system_quantity" DECIMAL(18,4) NOT NULL,
    "physical_quantity" DECIMAL(18,4) NOT NULL,
    "difference_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "adjustment_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(18,4),
    "adjustment_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "location_id" UUID,
    "bin" TEXT,
    "root_cause_category" TEXT,
    "root_cause_detail" TEXT,
    "corrective_action" TEXT,
    "reason" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_adjustment_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adjustment_reasons" (
    "id" UUID NOT NULL,
    "reason_code" TEXT NOT NULL,
    "reason_name" TEXT NOT NULL,
    "description" TEXT,
    "effect_type" TEXT NOT NULL,
    "requires_photo" BOOLEAN NOT NULL DEFAULT false,
    "requires_approval" BOOLEAN NOT NULL DEFAULT true,
    "approval_level" TEXT NOT NULL DEFAULT 'SUPERVISOR',
    "is_write_off" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adjustment_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "damage_reports_s16" (
    "id" UUID NOT NULL,
    "damage_report_number" TEXT NOT NULL,
    "report_date" TIMESTAMP(3) NOT NULL,
    "damage_type" TEXT NOT NULL,
    "damage_severity" TEXT NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "uom_id" UUID,
    "damaged_qty" DECIMAL(18,4) NOT NULL,
    "unit_cost" DECIMAL(18,4),
    "total_damage_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "photo_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "photo_count" INTEGER NOT NULL DEFAULT 0,
    "disposition" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "status" TEXT NOT NULL DEFAULT 'REPORTED',
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "adjustment_id" UUID,
    "damage_description" TEXT,
    "remarks" TEXT,
    "reported_by_id" UUID,
    "reported_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "damage_reports_s16_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expiry_adjustments" (
    "id" UUID NOT NULL,
    "expiry_adjustment_number" TEXT NOT NULL,
    "adjustment_date" TIMESTAMP(3) NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "uom_id" UUID,
    "expired_qty" DECIMAL(18,4) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "manufacturing_date" TIMESTAMP(3),
    "unit_cost" DECIMAL(18,4),
    "total_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "disposition" TEXT NOT NULL DEFAULT 'PENDING',
    "disposal_date" TIMESTAMP(3),
    "disposal_witness_id" UUID,
    "disposal_witness_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "expiry_category" TEXT NOT NULL,
    "days_before_expiry" INTEGER,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expiry_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adjustment_root_causes" (
    "id" UUID NOT NULL,
    "adjustment_id" UUID,
    "adjustment_number" TEXT,
    "root_cause_category" TEXT NOT NULL,
    "root_cause_detail" TEXT NOT NULL,
    "affected_qty" DECIMAL(18,4) NOT NULL,
    "affected_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "corrective_action" TEXT,
    "preventive_action" TEXT,
    "action_owner" TEXT,
    "action_due_date" TIMESTAMP(3),
    "action_status" TEXT NOT NULL DEFAULT 'OPEN',
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence_count" INTEGER NOT NULL DEFAULT 0,
    "analyzed_by_id" UUID,
    "analyzed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adjustment_root_causes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_reservations" (
    "id" UUID NOT NULL,
    "reservation_number" TEXT NOT NULL,
    "reservation_date" TIMESTAMP(3) NOT NULL,
    "reservation_type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "priority_score" INTEGER NOT NULL DEFAULT 50,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "company_id" UUID,
    "branch_id" UUID,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "partner_id" UUID,
    "partner_name" TEXT,
    "expiry_date" TIMESTAMP(3),
    "auto_release_after" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "total_lines" INTEGER NOT NULL DEFAULT 0,
    "total_requested_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_reserved_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_allocated_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_issued_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "allocated_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),
    "released_by_id" UUID,
    "release_reason" TEXT,
    "remarks" TEXT,
    "requested_by_id" UUID,
    "requested_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_lines" (
    "id" UUID NOT NULL,
    "reservation_id" UUID NOT NULL,
    "line_order" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_variant_id" UUID,
    "batch_id" UUID,
    "batch_number" TEXT,
    "lot_id" UUID,
    "serial_number_id" UUID,
    "uom_id" UUID,
    "uom_name" TEXT,
    "requested_qty" DECIMAL(18,4) NOT NULL,
    "reserved_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "allocated_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "issued_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "allocation_status" TEXT NOT NULL DEFAULT 'PENDING',
    "allocation_strategy" TEXT,
    "allocated_location_id" UUID,
    "allocated_bin" TEXT,
    "short_supply_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "short_supply_reason" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation_rules" (
    "id" UUID NOT NULL,
    "rule_code" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "description" TEXT,
    "strategy" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "reservation_type" TEXT,
    "product_category_id" UUID,
    "product_type" TEXT,
    "warehouse_id" UUID,
    "batch_preference" TEXT,
    "exclude_expired" BOOLEAN NOT NULL DEFAULT true,
    "exclude_quarantine" BOOLEAN NOT NULL DEFAULT true,
    "exclude_blocked" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_snapshots" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "on_hand_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "reserved_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "allocated_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "in_transit_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "blocked_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "available_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "availability_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physical_inventories" (
    "id" UUID NOT NULL,
    "count_number" TEXT NOT NULL,
    "count_date" TIMESTAMP(3) NOT NULL,
    "count_type" TEXT NOT NULL,
    "count_method" TEXT NOT NULL DEFAULT 'BARCODE',
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "branch_id" UUID,
    "zone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total_lines" INTEGER NOT NULL DEFAULT 0,
    "counted_lines" INTEGER NOT NULL DEFAULT 0,
    "variance_lines" INTEGER NOT NULL DEFAULT 0,
    "total_system_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_counted_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_variance_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_variance_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "accuracy_percent" DECIMAL(5,2),
    "count_team_id" UUID,
    "count_team_name" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "posted_at" TIMESTAMP(3),
    "adjustment_id" UUID,
    "recount_required" BOOLEAN NOT NULL DEFAULT false,
    "recount_count" INTEGER NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "physical_inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physical_inventory_lines" (
    "id" UUID NOT NULL,
    "physical_inventory_id" UUID NOT NULL,
    "line_order" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "lot_id" UUID,
    "serial_number_id" UUID,
    "uom_id" UUID,
    "uom_name" TEXT,
    "location_id" UUID,
    "location_name" TEXT,
    "bin" TEXT,
    "zone" TEXT,
    "system_qty" DECIMAL(18,4) NOT NULL,
    "counted_qty" DECIMAL(18,4),
    "variance_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "approved_qty" DECIMAL(18,4),
    "unit_cost" DECIMAL(18,4),
    "variance_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "count_status" TEXT NOT NULL DEFAULT 'PENDING',
    "is_blind" BOOLEAN NOT NULL DEFAULT false,
    "barcode_scanned" TEXT,
    "recount_required" BOOLEAN NOT NULL DEFAULT false,
    "recount_count" INTEGER NOT NULL DEFAULT 0,
    "recount_by_id" UUID,
    "recount_by_name" TEXT,
    "recount_at" TIMESTAMP(3),
    "counted_by_id" UUID,
    "counted_by_name" TEXT,
    "counted_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "physical_inventory_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycle_count_plans" (
    "id" UUID NOT NULL,
    "plan_code" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "description" TEXT,
    "frequency" TEXT NOT NULL,
    "abc_class_a" TEXT NOT NULL DEFAULT 'MONTHLY',
    "abc_class_b" TEXT NOT NULL DEFAULT 'QUARTERLY',
    "abc_class_c" TEXT NOT NULL DEFAULT 'YEARLY',
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "variance_threshold" DECIMAL(8,2) NOT NULL DEFAULT 5,
    "auto_recount" BOOLEAN NOT NULL DEFAULT true,
    "blind_count" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "last_run_at" TIMESTAMP(3),
    "next_run_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cycle_count_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycle_count_schedules" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "schedule_date" TIMESTAMP(3) NOT NULL,
    "abc_class" TEXT,
    "zone" TEXT,
    "product_category_id" UUID,
    "item_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "assigned_team_id" UUID,
    "assigned_team_name" TEXT,
    "physical_inventory_id" UUID,
    "accuracy_percent" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cycle_count_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "count_teams" (
    "id" UUID NOT NULL,
    "team_code" TEXT NOT NULL,
    "team_name" TEXT NOT NULL,
    "leader_id" UUID,
    "leader_name" TEXT,
    "member_count" INTEGER NOT NULL DEFAULT 1,
    "assigned_zone" TEXT,
    "assigned_warehouse_id" UUID,
    "total_counts" INTEGER NOT NULL DEFAULT 0,
    "total_items_counted" INTEGER NOT NULL DEFAULT 0,
    "avg_accuracy" DECIMAL(5,2),
    "avg_count_time" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "count_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "count_variances" (
    "id" UUID NOT NULL,
    "physical_inventory_id" UUID,
    "count_number" TEXT,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "uom_id" UUID,
    "system_qty" DECIMAL(18,4) NOT NULL,
    "counted_qty" DECIMAL(18,4) NOT NULL,
    "variance_qty" DECIMAL(18,4) NOT NULL,
    "unit_cost" DECIMAL(18,4),
    "variance_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "variance_type" TEXT NOT NULL,
    "rootCause" TEXT,
    "root_cause_category" TEXT,
    "corrective_action" TEXT,
    "resolution_status" TEXT NOT NULL DEFAULT 'PENDING',
    "resolution_notes" TEXT,
    "resolved_by_id" UUID,
    "resolved_at" TIMESTAMP(3),
    "recount_required" BOOLEAN NOT NULL DEFAULT false,
    "recount_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "count_variances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_master" (
    "id" UUID NOT NULL,
    "batch_number" TEXT NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_type" TEXT NOT NULL,
    "supplier_batch_no" TEXT,
    "production_batch_no" TEXT,
    "production_order_id" TEXT,
    "supplier_id" UUID,
    "supplier_name" TEXT,
    "manufacturing_date" TIMESTAMP(3),
    "packing_date" TIMESTAMP(3),
    "best_before_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "batch_status" TEXT NOT NULL DEFAULT 'CREATED',
    "status_reason" TEXT,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "original_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "current_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "uom_id" UUID,
    "uom_name" TEXT,
    "unit_cost" DECIMAL(18,4),
    "total_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "fefo_priority" INTEGER NOT NULL DEFAULT 100,
    "storage_conditions" TEXT,
    "temperature_range" TEXT,
    "quality_grade" TEXT,
    "quality_status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_history" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "batch_number" TEXT NOT NULL,
    "from_status" TEXT NOT NULL,
    "to_status" TEXT NOT NULL,
    "changed_by_id" UUID,
    "changed_by_name" TEXT,
    "reason" TEXT,
    "comments" TEXT,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shelf_life_rules" (
    "id" UUID NOT NULL,
    "rule_code" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "product_id" UUID,
    "product_name" TEXT,
    "product_category_id" UUID,
    "product_type" TEXT,
    "shelf_life_days" INTEGER NOT NULL,
    "best_before_days" INTEGER NOT NULL,
    "storage_conditions" TEXT,
    "min_temperature" DECIMAL(5,2),
    "max_temperature" DECIMAL(5,2),
    "max_humidity" DECIMAL(5,2),
    "max_transit_days" INTEGER,
    "alert_30_days" BOOLEAN NOT NULL DEFAULT true,
    "alert_15_days" BOOLEAN NOT NULL DEFAULT true,
    "alert_7_days" BOOLEAN NOT NULL DEFAULT true,
    "alert_3_days" BOOLEAN NOT NULL DEFAULT true,
    "alert_today" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shelf_life_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expiry_alerts" (
    "id" UUID NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "manufacturing_date" TIMESTAMP(3),
    "alert_level" TEXT NOT NULL,
    "days_to_expiry" INTEGER NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "uom_name" TEXT,
    "unit_cost" DECIMAL(18,4),
    "total_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "action_taken" TEXT,
    "actioned_by_id" UUID,
    "actioned_at" TIMESTAMP(3),
    "email_sent" BOOLEAN NOT NULL DEFAULT false,
    "dashboard_shown" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expiry_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_recalls" (
    "id" UUID NOT NULL,
    "recall_number" TEXT NOT NULL,
    "recall_date" TIMESTAMP(3) NOT NULL,
    "recall_type" TEXT NOT NULL,
    "recall_reason" TEXT NOT NULL,
    "description" TEXT,
    "complaint_number" TEXT,
    "reported_by" TEXT,
    "product_id" UUID,
    "product_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'INITIATED',
    "total_batches_affected" INTEGER NOT NULL DEFAULT 0,
    "total_quantity_recalled" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_quantity_returned" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_customers_affected" INTEGER NOT NULL DEFAULT 0,
    "total_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notice_sent_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_recalls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recall_batches" (
    "id" UUID NOT NULL,
    "recall_id" UUID NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "quantity_produced" DECIMAL(18,4) NOT NULL,
    "quantity_in_stock" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "quantity_dispatched" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "quantity_returned" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "manufacturing_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'IDENTIFIED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recall_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_genealogy" (
    "id" UUID NOT NULL,
    "from_batch_id" UUID NOT NULL,
    "from_batch_number" TEXT NOT NULL,
    "from_product_id" UUID NOT NULL,
    "from_product_name" TEXT NOT NULL,
    "from_batch_type" TEXT NOT NULL,
    "to_batch_id" UUID NOT NULL,
    "to_batch_number" TEXT NOT NULL,
    "to_product_id" UUID NOT NULL,
    "to_product_name" TEXT NOT NULL,
    "to_batch_type" TEXT NOT NULL,
    "relationship_type" TEXT NOT NULL,
    "quantity_used" DECIMAL(18,4) NOT NULL,
    "uom_id" UUID,
    "production_order_id" TEXT,
    "production_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_genealogy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_cost_layers" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_variant_id" UUID,
    "batch_id" UUID,
    "batch_number" TEXT,
    "uom_id" UUID,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "costing_method" TEXT NOT NULL,
    "layer_number" INTEGER NOT NULL,
    "receipt_type" TEXT NOT NULL,
    "receipt_number" TEXT,
    "receipt_date" TIMESTAMP(3) NOT NULL,
    "original_qty" DECIMAL(18,4) NOT NULL,
    "consumed_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "remaining_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(18,4) NOT NULL,
    "total_original_value" DECIMAL(18,2) NOT NULL,
    "total_consumed_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_remaining_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "landed_unit_cost" DECIMAL(18,4),
    "has_landed_cost" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_cost_layers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_cost_history" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "costing_method" TEXT NOT NULL,
    "unit_cost" DECIMAL(18,4) NOT NULL,
    "total_qty" DECIMAL(18,4) NOT NULL,
    "total_value" DECIMAL(18,2) NOT NULL,
    "change_type" TEXT NOT NULL,
    "change_reference" TEXT,
    "change_date" TIMESTAMP(3) NOT NULL,
    "previous_unit_cost" DECIMAL(18,4),
    "previous_total_value" DECIMAL(18,2),
    "cost_variance" DECIMAL(18,4),
    "value_variance" DECIMAL(18,2),
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_cost_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landed_cost_documents" (
    "id" UUID NOT NULL,
    "document_number" TEXT NOT NULL,
    "document_date" TIMESTAMP(3) NOT NULL,
    "reference_type" TEXT NOT NULL,
    "reference_number" TEXT NOT NULL,
    "supplier_id" UUID,
    "supplier_name" TEXT,
    "product_cost" DECIMAL(18,2) NOT NULL,
    "total_landed_cost" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_allocated_cost" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_by_id" UUID,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landed_cost_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landed_cost_allocations" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "cost_component" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(18,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'INR',
    "allocation_method" TEXT NOT NULL,
    "allocation_percent" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "vendor_id" UUID,
    "vendor_name" TEXT,
    "vendor_invoice_no" TEXT,
    "is_allocated" BOOLEAN NOT NULL DEFAULT false,
    "allocated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landed_cost_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_revaluations" (
    "id" UUID NOT NULL,
    "revaluation_number" TEXT NOT NULL,
    "revaluation_date" TIMESTAMP(3) NOT NULL,
    "product_id" UUID,
    "product_name" TEXT,
    "product_category_id" UUID,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "revaluation_type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "old_unit_cost" DECIMAL(18,4) NOT NULL,
    "new_unit_cost" DECIMAL(18,4) NOT NULL,
    "cost_difference" DECIMAL(18,4) NOT NULL,
    "total_qty" DECIMAL(18,4) NOT NULL,
    "total_value_change" DECIMAL(18,2) NOT NULL,
    "gl_posting_number" TEXT,
    "gl_posted" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "posted_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_revaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_gl_postings" (
    "id" UUID NOT NULL,
    "posting_number" TEXT NOT NULL,
    "posting_date" TIMESTAMP(3) NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" UUID,
    "source_number" TEXT,
    "product_id" UUID,
    "product_name" TEXT,
    "warehouse_id" UUID,
    "entry_type" TEXT NOT NULL,
    "inventory_account" TEXT NOT NULL,
    "offset_account" TEXT NOT NULL,
    "quantity" DECIMAL(18,4),
    "unit_cost" DECIMAL(18,4),
    "amount" DECIMAL(18,2) NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'POSTED',
    "reversed_by" UUID,
    "reversed_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_gl_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_valuations" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "product_category_id" UUID,
    "costing_method" TEXT NOT NULL,
    "on_hand_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(18,4) NOT NULL,
    "total_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "abc_class" TEXT,
    "xyz_class" TEXT,
    "movement_category" TEXT,
    "days_in_stock" INTEGER,
    "ageing_category" TEXT,
    "valuation_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_valuations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_kpis" (
    "id" UUID NOT NULL,
    "kpi_code" TEXT NOT NULL,
    "kpi_name" TEXT NOT NULL,
    "description" TEXT,
    "kpi_value" DECIMAL(18,4) NOT NULL,
    "kpi_unit" TEXT NOT NULL DEFAULT 'PERCENT',
    "previous_value" DECIMAL(18,4),
    "trend_direction" TEXT,
    "trend_percent" DECIMAL(8,2),
    "target_value" DECIMAL(18,4),
    "is_on_target" BOOLEAN,
    "period_type" TEXT NOT NULL,
    "period_date" TIMESTAMP(3) NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "kpi_category" TEXT NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_ageing" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_category_id" UUID,
    "brand_id" UUID,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "qty_0_30" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "value_0_30" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "qty_31_60" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "value_31_60" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "qty_61_90" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "value_61_90" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "qty_91_180" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "value_91_180" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "qty_181_365" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "value_181_365" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "qty_365_plus" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "value_365_plus" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_value" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "avg_days_in_stock" INTEGER NOT NULL DEFAULT 0,
    "snapshot_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_ageing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_classifications" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "abc_class" TEXT NOT NULL,
    "abc_value_percent" DECIMAL(8,2) NOT NULL,
    "abc_cumulative_percent" DECIMAL(8,2) NOT NULL,
    "xyz_class" TEXT NOT NULL,
    "xyz_demand_variability" DECIMAL(8,2) NOT NULL,
    "fsn_class" TEXT NOT NULL,
    "fsn_days_since_last_movement" INTEGER NOT NULL,
    "fsn_transaction_count" INTEGER NOT NULL,
    "combined_class" TEXT NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "classification_date" TIMESTAMP(3) NOT NULL,
    "period_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reorder_rules" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "min_stock" DECIMAL(18,4) NOT NULL,
    "max_stock" DECIMAL(18,4) NOT NULL,
    "safety_stock" DECIMAL(18,4) NOT NULL,
    "reorder_point" DECIMAL(18,4) NOT NULL,
    "economic_order_qty" DECIMAL(18,4),
    "lead_time_days" INTEGER NOT NULL,
    "supplier_id" UUID,
    "supplier_name" TEXT,
    "avg_daily_consumption" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "avg_weekly_consumption" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "avg_monthly_consumption" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "current_stock" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "available_stock" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "in_transit_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "reorder_required" BOOLEAN NOT NULL DEFAULT false,
    "suggested_qty" DECIMAL(18,4),
    "days_of_supply" INTEGER,
    "urgency_level" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "last_calculated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reorder_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_control_snapshots" (
    "id" UUID NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL,
    "total_inventory_value" DECIMAL(18,2) NOT NULL,
    "total_products" INTEGER NOT NULL,
    "total_warehouses" INTEGER NOT NULL,
    "total_batches" INTEGER NOT NULL,
    "today_transactions" INTEGER NOT NULL,
    "today_receipts" INTEGER NOT NULL,
    "today_issues" INTEGER NOT NULL,
    "today_transfers" INTEGER NOT NULL,
    "today_adjustments" INTEGER NOT NULL,
    "pending_approvals" INTEGER NOT NULL,
    "pending_putaway" INTEGER NOT NULL,
    "pending_picking" INTEGER NOT NULL,
    "pending_receiving" INTEGER NOT NULL,
    "expired_stock" INTEGER NOT NULL,
    "near_expiry_stock" INTEGER NOT NULL,
    "blocked_batches" INTEGER NOT NULL,
    "quarantined_stock" INTEGER NOT NULL,
    "dead_stock_items" INTEGER NOT NULL,
    "stock_out_items" INTEGER NOT NULL,
    "reorder_required" INTEGER NOT NULL,
    "inventory_accuracy" DECIMAL(5,2) NOT NULL,
    "warehouse_utilization" DECIMAL(5,2) NOT NULL,
    "stock_availability" DECIMAL(5,2) NOT NULL,
    "order_fill_rate" DECIMAL(5,2) NOT NULL,
    "inventory_turnover" DECIMAL(8,2) NOT NULL,
    "active_recalls" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mission_control_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_reports" (
    "id" UUID NOT NULL,
    "report_code" TEXT NOT NULL,
    "report_name" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "description" TEXT,
    "parameters" JSONB NOT NULL DEFAULT '{}',
    "export_format" TEXT NOT NULL DEFAULT 'PDF',
    "file_url" TEXT,
    "file_size_bytes" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "generated_at" TIMESTAMP(3),
    "summary_data" JSONB,
    "requested_by_id" UUID,
    "requested_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "executive_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_master" (
    "id" UUID NOT NULL,
    "warehouse_code" TEXT NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "description" TEXT,
    "warehouse_type" TEXT NOT NULL,
    "company_id" UUID,
    "company_name" TEXT,
    "branch_id" UUID,
    "branch_name" TEXT,
    "manager_id" UUID,
    "manager_name" TEXT,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "pincode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "barcode_enabled" BOOLEAN NOT NULL DEFAULT true,
    "fifo_enabled" BOOLEAN NOT NULL DEFAULT false,
    "fefo_enabled" BOOLEAN NOT NULL DEFAULT true,
    "quality_inspection_required" BOOLEAN NOT NULL DEFAULT true,
    "default_picking_strategy" TEXT NOT NULL DEFAULT 'FEFO',
    "default_putaway_strategy" TEXT NOT NULL DEFAULT 'FEFO',
    "default_uom" TEXT,
    "total_volume_m3" DECIMAL(12,2),
    "total_weight_kg" DECIMAL(12,2),
    "total_pallet_positions" INTEGER,
    "total_bins" INTEGER,
    "operating_hours_start" TEXT NOT NULL DEFAULT '08:00',
    "operating_hours_end" TEXT NOT NULL DEFAULT '20:00',
    "working_days" TEXT NOT NULL DEFAULT 'MON,TUE,WED,THU,FRI,SAT',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "status_reason" TEXT,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_zones" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "zone_code" TEXT NOT NULL,
    "zone_name" TEXT NOT NULL,
    "description" TEXT,
    "zone_type" TEXT NOT NULL,
    "parent_zone_id" UUID,
    "display_order" INTEGER NOT NULL DEFAULT 100,
    "temperature_zone_id" UUID,
    "volume_m3" DECIMAL(12,2),
    "weight_capacity_kg" DECIMAL(12,2),
    "pallet_positions" INTEGER,
    "bin_count" INTEGER NOT NULL DEFAULT 0,
    "is_restricted" BOOLEAN NOT NULL DEFAULT false,
    "access_required" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temperature_zones" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "zone_code" TEXT NOT NULL,
    "zone_name" TEXT NOT NULL,
    "temp_zone_type" TEXT NOT NULL,
    "min_temperature" DECIMAL(5,2) NOT NULL,
    "max_temperature" DECIMAL(5,2) NOT NULL,
    "target_temperature" DECIMAL(5,2),
    "min_humidity" DECIMAL(5,2),
    "max_humidity" DECIMAL(5,2),
    "target_humidity" DECIMAL(5,2),
    "alert_threshold_min" DECIMAL(5,2) NOT NULL DEFAULT 2,
    "alert_threshold_max" DECIMAL(5,2) NOT NULL DEFAULT 2,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_reading" DECIMAL(5,2),
    "last_reading_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temperature_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temperature_logs" (
    "id" UUID NOT NULL,
    "temperature_zone_id" UUID NOT NULL,
    "temperature" DECIMAL(5,2) NOT NULL,
    "humidity" DECIMAL(5,2),
    "is_alert" BOOLEAN NOT NULL DEFAULT false,
    "alert_type" TEXT,
    "alert_message" TEXT,
    "sensor_id" TEXT,
    "sensor_location" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "temperature_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_capacity" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "zone_id" UUID,
    "total_volume" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "used_volume" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "available_volume" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "reserved_volume" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_weight" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "used_weight" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "available_weight" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_pallets" INTEGER NOT NULL DEFAULT 0,
    "used_pallets" INTEGER NOT NULL DEFAULT 0,
    "available_pallets" INTEGER NOT NULL DEFAULT 0,
    "total_bins" INTEGER NOT NULL DEFAULT 0,
    "used_bins" INTEGER NOT NULL DEFAULT 0,
    "available_bins" INTEGER NOT NULL DEFAULT 0,
    "utilization_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "snapshot_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_capacity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_calendar" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "calendar_date" TIMESTAMP(3) NOT NULL,
    "day_type" TEXT NOT NULL,
    "start_time" TEXT,
    "end_time" TEXT,
    "shift1_start" TEXT,
    "shift1_end" TEXT,
    "shift2_start" TEXT,
    "shift2_end" TEXT,
    "shift3_start" TEXT,
    "shift3_end" TEXT,
    "description" TEXT,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_access_rules" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "user_role" TEXT NOT NULL,
    "can_receive" BOOLEAN NOT NULL DEFAULT false,
    "can_putaway" BOOLEAN NOT NULL DEFAULT false,
    "can_pick" BOOLEAN NOT NULL DEFAULT false,
    "can_pack" BOOLEAN NOT NULL DEFAULT false,
    "can_dispatch" BOOLEAN NOT NULL DEFAULT false,
    "can_adjust" BOOLEAN NOT NULL DEFAULT false,
    "can_count" BOOLEAN NOT NULL DEFAULT false,
    "can_access_restricted" BOOLEAN NOT NULL DEFAULT false,
    "can_access_cold_storage" BOOLEAN NOT NULL DEFAULT false,
    "restricted_zone_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_access_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_rules" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "rule_code" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "description" TEXT,
    "rule_type" TEXT NOT NULL,
    "rule_value" TEXT NOT NULL,
    "rule_unit" TEXT,
    "enforcement_mode" TEXT NOT NULL DEFAULT 'WARN',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_aisles" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "zone_id" UUID,
    "aisle_code" TEXT NOT NULL,
    "aisle_name" TEXT NOT NULL,
    "description" TEXT,
    "length_m" DECIMAL(8,2),
    "width_m" DECIMAL(8,2),
    "traffic_direction" TEXT NOT NULL DEFAULT 'TWO_WAY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "display_order" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_aisles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_racks" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "zone_id" UUID,
    "aisle_id" UUID NOT NULL,
    "rack_code" TEXT NOT NULL,
    "rack_name" TEXT NOT NULL,
    "description" TEXT,
    "height_m" DECIMAL(8,2),
    "width_m" DECIMAL(8,2),
    "depth_m" DECIMAL(8,2),
    "max_weight_kg" DECIMAL(12,2),
    "shelf_count" INTEGER NOT NULL DEFAULT 1,
    "fire_zone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "display_order" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_racks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_shelves" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "rack_id" UUID NOT NULL,
    "shelf_code" TEXT NOT NULL,
    "shelf_name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "height_from_floor" DECIMAL(8,2),
    "max_weight_kg" DECIMAL(12,2),
    "max_volume_m3" DECIMAL(12,2),
    "picking_level" TEXT NOT NULL DEFAULT 'GROUND',
    "accessibility" TEXT NOT NULL DEFAULT 'EASY',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_shelves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_bins" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_code" TEXT NOT NULL,
    "zone_id" UUID,
    "zone_code" TEXT,
    "aisle_id" UUID,
    "aisle_code" TEXT,
    "rack_id" UUID,
    "rack_code" TEXT,
    "shelf_id" UUID,
    "shelf_code" TEXT,
    "bin_code" TEXT NOT NULL,
    "barcode" TEXT,
    "qr_code" TEXT,
    "max_weight_kg" DECIMAL(12,2),
    "max_volume_m3" DECIMAL(12,2),
    "current_weight_kg" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "current_volume_m3" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "utilization_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "temperature_zone" TEXT,
    "bin_type" TEXT NOT NULL DEFAULT 'STANDARD',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "status_reason" TEXT,
    "item_capacity" INTEGER NOT NULL DEFAULT 1,
    "current_item_types" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_bins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bin_capacity_logs" (
    "id" UUID NOT NULL,
    "bin_id" UUID NOT NULL,
    "bin_code" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "current_weight_kg" DECIMAL(12,2) NOT NULL,
    "current_volume_m3" DECIMAL(12,2) NOT NULL,
    "max_weight_kg" DECIMAL(12,2) NOT NULL,
    "max_volume_m3" DECIMAL(12,2) NOT NULL,
    "utilization_percent" DECIMAL(5,2) NOT NULL,
    "alert_type" TEXT,
    "alert_message" TEXT,
    "item_types" INTEGER NOT NULL DEFAULT 0,
    "total_quantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bin_capacity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advanced_shipping_notices" (
    "id" UUID NOT NULL,
    "asn_number" TEXT NOT NULL,
    "asn_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_arrival" TIMESTAMP(3) NOT NULL,
    "receiving_type" TEXT NOT NULL,
    "supplier_id" UUID,
    "supplier_name" TEXT,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "vehicle_number" TEXT,
    "driver_name" TEXT,
    "driver_phone" TEXT,
    "carrier_name" TEXT,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total_lines" INTEGER NOT NULL DEFAULT 0,
    "total_pallets" INTEGER,
    "total_cartons" INTEGER,
    "total_quantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_weight" DECIMAL(12,2),
    "total_volume" DECIMAL(12,2),
    "appointment_id" UUID,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advanced_shipping_notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asn_lines" (
    "id" UUID NOT NULL,
    "asn_id" UUID NOT NULL,
    "line_order" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_variant_id" UUID,
    "uom_id" UUID,
    "uom_name" TEXT,
    "expected_qty" DECIMAL(18,4) NOT NULL,
    "received_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "pallet_count" INTEGER,
    "carton_count" INTEGER,
    "batch_number" TEXT,
    "supplier_batch_no" TEXT,
    "manufacturing_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "barcode" TEXT,
    "line_status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asn_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receiving_appointments" (
    "id" UUID NOT NULL,
    "appointment_number" TEXT NOT NULL,
    "appointment_date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "dock_id" UUID,
    "dock_code" TEXT,
    "supplier_id" UUID,
    "supplier_name" TEXT,
    "vehicle_number" TEXT,
    "driver_name" TEXT,
    "driver_phone" TEXT,
    "asn_id" UUID,
    "asn_number" TEXT,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receiving_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gate_entries" (
    "id" UUID NOT NULL,
    "gate_pass_number" TEXT NOT NULL,
    "gate_date" TIMESTAMP(3) NOT NULL,
    "entry_type" TEXT NOT NULL,
    "vehicle_number" TEXT NOT NULL,
    "vehicle_type" TEXT,
    "driver_name" TEXT NOT NULL,
    "driver_license" TEXT,
    "driver_phone" TEXT,
    "security_officer_id" UUID,
    "security_officer_name" TEXT,
    "seal_number" TEXT,
    "seal_intact" BOOLEAN NOT NULL DEFAULT true,
    "arrival_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exit_time" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "photo_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ARRIVED',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loading_docks" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "dock_code" TEXT NOT NULL,
    "dock_name" TEXT NOT NULL,
    "dock_type" TEXT NOT NULL,
    "dock_door_number" TEXT,
    "max_vehicle_size" TEXT,
    "is_temperature_controlled" BOOLEAN NOT NULL DEFAULT false,
    "temperature_zone" TEXT,
    "has_forklift_access" BOOLEAN NOT NULL DEFAULT true,
    "has_pallet_jack" BOOLEAN NOT NULL DEFAULT true,
    "has_conveyor" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "current_vehicle_number" TEXT,
    "current_appointment_id" UUID,
    "total_operations" INTEGER NOT NULL DEFAULT 0,
    "avg_unload_time" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loading_docks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receiving_exceptions" (
    "id" UUID NOT NULL,
    "exception_number" TEXT NOT NULL,
    "exception_date" TIMESTAMP(3) NOT NULL,
    "asn_id" UUID,
    "asn_number" TEXT,
    "asn_line_id" UUID,
    "exception_type" TEXT NOT NULL,
    "description" TEXT,
    "product_id" UUID,
    "product_name" TEXT,
    "expected_qty" DECIMAL(18,4),
    "received_qty" DECIMAL(18,4),
    "difference_qty" DECIMAL(18,4),
    "photo_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resolution_status" TEXT NOT NULL DEFAULT 'PENDING',
    "resolution_action" TEXT,
    "resolution_notes" TEXT,
    "resolved_by_id" UUID,
    "resolved_by_name" TEXT,
    "resolved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "reported_by_id" UUID,
    "reported_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receiving_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_putaway_tasks" (
    "id" UUID NOT NULL,
    "task_number" TEXT NOT NULL,
    "task_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "putaway_type" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "source_zone_id" UUID,
    "source_zone_name" TEXT,
    "dest_zone_id" UUID,
    "dest_zone_name" TEXT,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "priority_score" INTEGER NOT NULL DEFAULT 50,
    "assigned_to_id" UUID,
    "assigned_to_name" TEXT,
    "assigned_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total_lines" INTEGER NOT NULL DEFAULT 0,
    "completed_lines" INTEGER NOT NULL DEFAULT 0,
    "total_pallets" INTEGER,
    "total_cartons" INTEGER,
    "total_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "completed_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "current_step" TEXT NOT NULL DEFAULT 'RECEIVING_AREA',
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wms_putaway_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_putaway_task_lines" (
    "id" UUID NOT NULL,
    "putaway_task_id" UUID NOT NULL,
    "line_order" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "lot_id" UUID,
    "serial_number_id" UUID,
    "uom_id" UUID,
    "uom_name" TEXT,
    "quantity" DECIMAL(18,4) NOT NULL,
    "pallet_count" INTEGER,
    "carton_count" INTEGER,
    "recommended_bin_id" UUID,
    "recommended_bin_code" TEXT,
    "recommendation_score" DECIMAL(5,2),
    "recommendation_reason" TEXT,
    "actual_bin_id" UUID,
    "actual_bin_code" TEXT,
    "is_manual_override" BOOLEAN NOT NULL DEFAULT false,
    "override_reason" TEXT,
    "override_approved_by_id" UUID,
    "barcode_scanned" TEXT,
    "bin_barcode_scanned" TEXT,
    "line_status" TEXT NOT NULL DEFAULT 'PENDING',
    "exception_type" TEXT,
    "exception_notes" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wms_putaway_task_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_putaway_rules" (
    "id" UUID NOT NULL,
    "rule_code" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "description" TEXT,
    "strategy" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "warehouse_id" UUID,
    "product_category_id" UUID,
    "product_type" TEXT,
    "temperature_zone" TEXT,
    "capacity_weight" INTEGER NOT NULL DEFAULT 30,
    "distance_weight" INTEGER NOT NULL DEFAULT 25,
    "compatibility_weight" INTEGER NOT NULL DEFAULT 20,
    "temperature_weight" INTEGER NOT NULL DEFAULT 15,
    "picking_efficiency_weight" INTEGER NOT NULL DEFAULT 10,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wms_putaway_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_pallets" (
    "id" UUID NOT NULL,
    "pallet_code" TEXT NOT NULL,
    "barcode" TEXT,
    "qr_code" TEXT,
    "pallet_type" TEXT NOT NULL DEFAULT 'STANDARD',
    "max_weight_kg" DECIMAL(12,2) NOT NULL DEFAULT 1000,
    "current_weight_kg" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "length_cm" DECIMAL(8,2),
    "width_cm" DECIMAL(8,2),
    "height_cm" DECIMAL(8,2),
    "product_count" INTEGER NOT NULL DEFAULT 0,
    "total_cartons" INTEGER NOT NULL DEFAULT 0,
    "total_units" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "warehouse_id" UUID,
    "current_bin_id" UUID,
    "current_bin_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "putaway_task_id" UUID,
    "receiving_task_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_pallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forklift_tasks" (
    "id" UUID NOT NULL,
    "task_number" TEXT NOT NULL,
    "task_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "task_type" TEXT NOT NULL,
    "putaway_task_id" UUID,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "pallet_id" UUID,
    "pallet_code" TEXT,
    "from_location" TEXT,
    "from_bin_code" TEXT,
    "to_location" TEXT,
    "to_bin_code" TEXT,
    "operator_id" UUID,
    "operator_name" TEXT,
    "forklift_id" UUID,
    "forklift_code" TEXT,
    "assigned_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "travel_distance_m" DECIMAL(8,2),
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forklift_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_picking_tasks" (
    "id" UUID NOT NULL,
    "picking_number" TEXT NOT NULL,
    "picking_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfillment_type" TEXT NOT NULL,
    "picking_strategy" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "wave_id" UUID,
    "wave_number" TEXT,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "partner_id" UUID,
    "partner_name" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "priority_score" INTEGER NOT NULL DEFAULT 50,
    "picker_id" UUID,
    "picker_name" TEXT,
    "assigned_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total_lines" INTEGER NOT NULL DEFAULT 0,
    "picked_lines" INTEGER NOT NULL DEFAULT 0,
    "total_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "picked_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "pick_route_id" UUID,
    "total_distance_m" DECIMAL(8,2),
    "estimated_time_min" INTEGER,
    "started_at" TIMESTAMP(3),
    "picked_at" TIMESTAMP(3),
    "packed_at" TIMESTAMP(3),
    "ready_to_ship_at" TIMESTAMP(3),
    "dispatched_at" TIMESTAMP(3),
    "pick_duration_min" INTEGER,
    "pack_duration_min" INTEGER,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wms_picking_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wms_picking_task_lines" (
    "id" UUID NOT NULL,
    "picking_task_id" UUID NOT NULL,
    "line_order" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "lot_id" UUID,
    "serial_number_id" UUID,
    "uom_id" UUID,
    "uom_name" TEXT,
    "bin_id" UUID,
    "bin_code" TEXT,
    "zone_code" TEXT,
    "aisle_code" TEXT,
    "required_qty" DECIMAL(18,4) NOT NULL,
    "picked_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "remaining_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "fefo_priority" INTEGER,
    "expiry_date" TIMESTAMP(3),
    "bin_barcode_scanned" TEXT,
    "product_barcode_scanned" TEXT,
    "batch_barcode_scanned" TEXT,
    "barcode_verified" BOOLEAN NOT NULL DEFAULT false,
    "pick_sequence" INTEGER NOT NULL DEFAULT 0,
    "line_status" TEXT NOT NULL DEFAULT 'PENDING',
    "short_pick_reason" TEXT,
    "exception_type" TEXT,
    "exception_notes" TEXT,
    "picked_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wms_picking_task_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packing_stations" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "station_code" TEXT NOT NULL,
    "station_name" TEXT NOT NULL,
    "station_type" TEXT NOT NULL DEFAULT 'STANDARD',
    "has_label_printer" BOOLEAN NOT NULL DEFAULT true,
    "has_scale" BOOLEAN NOT NULL DEFAULT true,
    "has_barcode_scanner" BOOLEAN NOT NULL DEFAULT true,
    "has_conveyor" BOOLEAN NOT NULL DEFAULT false,
    "max_concurrent_jobs" INTEGER NOT NULL DEFAULT 1,
    "current_jobs" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "total_jobs_completed" INTEGER NOT NULL DEFAULT 0,
    "avg_pack_time_min" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packing_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packing_jobs" (
    "id" UUID NOT NULL,
    "job_number" TEXT NOT NULL,
    "job_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "picking_task_id" UUID,
    "station_id" UUID,
    "station_code" TEXT,
    "packer_id" UUID,
    "packer_name" TEXT,
    "assigned_at" TIMESTAMP(3),
    "verification_required" BOOLEAN NOT NULL DEFAULT true,
    "verification_status" TEXT NOT NULL DEFAULT 'PENDING',
    "verification_notes" TEXT,
    "carton_count" INTEGER NOT NULL DEFAULT 1,
    "total_weight_kg" DECIMAL(12,2),
    "total_volume_m3" DECIMAL(12,2),
    "photo_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "label_printed" BOOLEAN NOT NULL DEFAULT false,
    "label_printed_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packing_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carton_types" (
    "id" UUID NOT NULL,
    "carton_code" TEXT NOT NULL,
    "carton_name" TEXT NOT NULL,
    "lengthCm" DECIMAL(8,2) NOT NULL,
    "widthCm" DECIMAL(8,2) NOT NULL,
    "heightCm" DECIMAL(8,2) NOT NULL,
    "volume_m3" DECIMAL(12,4) NOT NULL,
    "max_weight_kg" DECIMAL(12,2) NOT NULL,
    "empty_weight_kg" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "carton_category" TEXT NOT NULL DEFAULT 'STANDARD',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carton_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cartons" (
    "id" UUID NOT NULL,
    "carton_number" TEXT NOT NULL,
    "barcode" TEXT,
    "carton_type_id" UUID,
    "packing_job_id" UUID,
    "picking_task_id" UUID,
    "product_count" INTEGER NOT NULL DEFAULT 0,
    "total_units" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "weight_kg" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "label_printed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "sealed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cartons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_labels" (
    "id" UUID NOT NULL,
    "label_number" TEXT NOT NULL,
    "label_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label_type" TEXT NOT NULL,
    "packing_job_id" UUID,
    "carton_id" UUID,
    "picking_task_id" UUID,
    "partner_id" UUID,
    "partner_name" TEXT,
    "ship_to_name" TEXT,
    "ship_to_address" TEXT,
    "ship_to_city" TEXT,
    "ship_to_state" TEXT,
    "ship_to_pincode" TEXT,
    "carrier_name" TEXT,
    "tracking_number" TEXT,
    "content_summary" TEXT,
    "total_weight" DECIMAL(12,2),
    "total_cartons" INTEGER,
    "format" TEXT NOT NULL DEFAULT 'PDF',
    "printStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "printed_at" TIMESTAMP(3),
    "printed_by_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatch_orders" (
    "id" UUID NOT NULL,
    "dispatch_number" TEXT NOT NULL,
    "dispatch_date" TIMESTAMP(3) NOT NULL,
    "dispatch_type" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "partner_id" UUID,
    "partner_name" TEXT,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "vehicle_id" UUID,
    "vehicle_number" TEXT,
    "driver_name" TEXT,
    "driver_phone" TEXT,
    "carrier_name" TEXT,
    "route_id" UUID,
    "route_name" TEXT,
    "delivery_sequence" INTEGER,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_lines" INTEGER NOT NULL DEFAULT 0,
    "total_cartons" INTEGER NOT NULL DEFAULT 0,
    "total_pallets" INTEGER,
    "total_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_weight_kg" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_volume_m3" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "planned_dispatch_at" TIMESTAMP(3),
    "loading_started_at" TIMESTAMP(3),
    "loading_completed_at" TIMESTAMP(3),
    "sealed_at" TIMESTAMP(3),
    "gate_exit_at" TIMESTAMP(3),
    "dispatched_at" TIMESTAMP(3),
    "loading_duration_min" INTEGER,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispatch_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatch_order_lines" (
    "id" UUID NOT NULL,
    "dispatch_order_id" UUID NOT NULL,
    "line_order" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "uom_id" UUID,
    "uom_name" TEXT,
    "quantity" DECIMAL(18,4) NOT NULL,
    "carton_count" INTEGER,
    "pallet_count" INTEGER,
    "weight_kg" DECIMAL(12,2),
    "volume_m3" DECIMAL(12,2),
    "order_number" TEXT,
    "carton_numbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "barcodes_scanned" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "loading_verified" BOOLEAN NOT NULL DEFAULT false,
    "line_status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispatch_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatch_vehicles" (
    "id" UUID NOT NULL,
    "vehicle_number" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "max_weight_kg" DECIMAL(12,2) NOT NULL,
    "max_volume_m3" DECIMAL(12,2) NOT NULL,
    "pallet_capacity" INTEGER,
    "is_temperature_controlled" BOOLEAN NOT NULL DEFAULT false,
    "min_temp" DECIMAL(5,2),
    "max_temp" DECIMAL(5,2),
    "ownership_type" TEXT NOT NULL DEFAULT 'OWN_FLEET',
    "driver_name" TEXT,
    "driver_phone" TEXT,
    "driver_license" TEXT,
    "helper_name" TEXT,
    "has_gps" BOOLEAN NOT NULL DEFAULT false,
    "gps_device_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "total_trips" INTEGER NOT NULL DEFAULT 0,
    "avg_utilization" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispatch_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "load_plans" (
    "id" UUID NOT NULL,
    "dispatch_order_id" UUID NOT NULL,
    "vehicle_id" UUID,
    "vehicle_number" TEXT,
    "plan_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_weight_kg" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "max_weight_kg" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "weight_utilization" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "total_volume_m3" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "max_volume_m3" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "volume_utilization" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "pallet_positions" INTEGER NOT NULL DEFAULT 0,
    "max_pallet_positions" INTEGER NOT NULL DEFAULT 0,
    "loading_sequence" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "load_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_documents" (
    "id" UUID NOT NULL,
    "document_number" TEXT NOT NULL,
    "document_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "document_type" TEXT NOT NULL,
    "dispatch_order_id" UUID,
    "dispatch_number" TEXT,
    "partner_id" UUID,
    "partner_name" TEXT,
    "ship_to_address" TEXT,
    "file_url" TEXT,
    "file_size_bytes" INTEGER,
    "format" TEXT NOT NULL DEFAULT 'PDF',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "generated_at" TIMESTAMP(3),
    "printed_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_seals" (
    "id" UUID NOT NULL,
    "dispatch_order_id" UUID NOT NULL,
    "seal_number" TEXT NOT NULL,
    "seal_type" TEXT NOT NULL DEFAULT 'BOLT',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_by_id" UUID,
    "applied_by_name" TEXT,
    "verified_at" TIMESTAMP(3),
    "verified_by_id" UUID,
    "verified_by_name" TEXT,
    "broken_at" TIMESTAMP(3),
    "broken_by" TEXT,
    "broken_reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_seals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gate_exit_logs" (
    "id" UUID NOT NULL,
    "exit_number" TEXT NOT NULL,
    "exit_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dispatch_order_id" UUID NOT NULL,
    "dispatch_number" TEXT NOT NULL,
    "vehicle_number" TEXT NOT NULL,
    "driver_name" TEXT NOT NULL,
    "security_officer_id" UUID,
    "security_officer_name" TEXT,
    "seal_verified" BOOLEAN NOT NULL DEFAULT false,
    "documents_verified" BOOLEAN NOT NULL DEFAULT false,
    "vehicle_inspected" BOOLEAN NOT NULL DEFAULT false,
    "exit_time" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gate_exit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_waves" (
    "id" UUID NOT NULL,
    "wave_number" TEXT NOT NULL,
    "wave_type" TEXT NOT NULL,
    "strategy" TEXT NOT NULL DEFAULT 'FIFO',
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "zone_id" UUID,
    "zone_name" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "priority_score" INTEGER NOT NULL DEFAULT 50,
    "planned_start" TIMESTAMP(3) NOT NULL,
    "planned_finish" TIMESTAMP(3) NOT NULL,
    "actual_start" TIMESTAMP(3),
    "actual_finish" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "release_reason" TEXT,
    "total_orders" INTEGER NOT NULL DEFAULT 0,
    "total_lines" INTEGER NOT NULL DEFAULT 0,
    "total_tasks" INTEGER NOT NULL DEFAULT 0,
    "total_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_weight_kg" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "assigned_operator_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "required_equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "released_by_id" UUID,
    "released_by_name" TEXT,
    "released_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "optimization_score" INTEGER,
    "optimization_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_waves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wave_orders" (
    "id" UUID NOT NULL,
    "wave_id" UUID NOT NULL,
    "order_type" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "order_id" UUID,
    "partner_id" UUID,
    "partner_name" TEXT,
    "carrier_id" UUID,
    "carrier_name" TEXT,
    "route_id" UUID,
    "route_name" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "priority_score" INTEGER NOT NULL DEFAULT 50,
    "required_ship_date" TIMESTAMP(3),
    "promised_date" TIMESTAMP(3),
    "total_lines" INTEGER NOT NULL DEFAULT 0,
    "total_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "fully_allocated" BOOLEAN NOT NULL DEFAULT false,
    "partially_allocated" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "exception_flag" BOOLEAN NOT NULL DEFAULT false,
    "exception_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wave_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wave_status_history" (
    "id" UUID NOT NULL,
    "wave_id" UUID NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "changed_by_id" UUID,
    "changed_by_name" TEXT,
    "change_reason" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wave_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_tasks" (
    "id" UUID NOT NULL,
    "task_number" TEXT NOT NULL,
    "task_type" TEXT NOT NULL,
    "wave_id" UUID,
    "wave_number" TEXT,
    "source_type" TEXT,
    "source_id" UUID,
    "source_number" TEXT,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "zone_id" UUID,
    "zone_name" TEXT,
    "from_location_id" UUID,
    "from_location_code" TEXT,
    "to_location_id" UUID,
    "to_location_code" TEXT,
    "product_id" UUID,
    "product_sku" TEXT,
    "product_name" TEXT,
    "batch_id" UUID,
    "batch_number" TEXT,
    "planned_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "actual_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "uom" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "priority_score" INTEGER NOT NULL DEFAULT 50,
    "assigned_operator_id" UUID,
    "assigned_operator_name" TEXT,
    "assigned_equipment_id" UUID,
    "assigned_equipment_code" TEXT,
    "assignment_strategy" TEXT,
    "planned_start" TIMESTAMP(3),
    "planned_finish" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3),
    "actual_finish" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "sla_deadline" TIMESTAMP(3),
    "sla_violated" BOOLEAN NOT NULL DEFAULT false,
    "sla_violation_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "acceptance_time" TIMESTAMP(3),
    "from_scan_verified" BOOLEAN NOT NULL DEFAULT false,
    "to_scan_verified" BOOLEAN NOT NULL DEFAULT false,
    "product_scan_verified" BOOLEAN NOT NULL DEFAULT false,
    "qty_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "instructions" TEXT,
    "notes" TEXT,
    "exception_flag" BOOLEAN NOT NULL DEFAULT false,
    "exception_reason" TEXT,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_task_lines" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "line_no" INTEGER NOT NULL,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "expiry_date" TIMESTAMP(3),
    "planned_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "actual_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "short_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL,
    "from_location_id" UUID,
    "from_location_code" TEXT,
    "to_location_id" UUID,
    "to_location_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "scan_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_task_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_status_history" (
    "id" UUID NOT NULL,
    "task_id" UUID NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "changed_by_id" UUID,
    "changed_by_name" TEXT,
    "change_reason" TEXT,
    "location_lat" DECIMAL(10,7),
    "location_lng" DECIMAL(10,7),
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_shifts" (
    "id" UUID NOT NULL,
    "shift_code" TEXT NOT NULL,
    "shift_name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "break_start" TEXT,
    "break_end" TEXT,
    "working_days" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "shiftType" TEXT NOT NULL DEFAULT 'REGULAR',
    "grace_early_minutes" INTEGER NOT NULL DEFAULT 15,
    "grace_late_minutes" INTEGER NOT NULL DEFAULT 15,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_operators" (
    "id" UUID NOT NULL,
    "operator_code" TEXT NOT NULL,
    "user_id" UUID,
    "employee_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "photo_url" TEXT,
    "primary_shift_id" UUID,
    "home_warehouse_id" UUID,
    "home_warehouse_name" TEXT,
    "primary_zone_id" UUID,
    "primary_zone_name" TEXT,
    "skillLevel" TEXT NOT NULL DEFAULT 'BEGINNER',
    "overall_rating" INTEGER NOT NULL DEFAULT 50,
    "forklift_certified" BOOLEAN NOT NULL DEFAULT false,
    "reach_truck_certified" BOOLEAN NOT NULL DEFAULT false,
    "stacker_certified" BOOLEAN NOT NULL DEFAULT false,
    "scanner_certified" BOOLEAN NOT NULL DEFAULT true,
    "preferred_equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "last_seen_at" TIMESTAMP(3),
    "tasks_completed_today" INTEGER NOT NULL DEFAULT 0,
    "tasks_completed_week" INTEGER NOT NULL DEFAULT 0,
    "avg_task_duration_seconds" INTEGER,
    "accuracy_percent" DECIMAL(5,2),
    "utilization_percent" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_operators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_attendance" (
    "id" UUID NOT NULL,
    "operator_id" UUID NOT NULL,
    "operator_code" TEXT NOT NULL,
    "operator_name" TEXT NOT NULL,
    "shift_id" UUID,
    "shift_name" TEXT,
    "attendance_date" TIMESTAMP(3) NOT NULL,
    "check_in_time" TIMESTAMP(3),
    "check_out_time" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "late_minutes" INTEGER NOT NULL DEFAULT 0,
    "early_minutes" INTEGER NOT NULL DEFAULT 0,
    "overtime_minutes" INTEGER NOT NULL DEFAULT 0,
    "break1_start" TIMESTAMP(3),
    "break1_end" TIMESTAMP(3),
    "break2_start" TIMESTAMP(3),
    "break2_end" TIMESTAMP(3),
    "worked_hours" DECIMAL(5,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operator_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_skills" (
    "id" UUID NOT NULL,
    "operator_id" UUID NOT NULL,
    "skill_code" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'BEGINNER',
    "rating" INTEGER NOT NULL DEFAULT 50,
    "certified" BOOLEAN NOT NULL DEFAULT false,
    "certified_date" TIMESTAMP(3),
    "certifying_body" TEXT,
    "certificate_number" TEXT,
    "expiry_date" TIMESTAMP(3),
    "tasks_completed" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operator_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_workload" (
    "id" UUID NOT NULL,
    "operator_id" UUID NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "open_tasks" INTEGER NOT NULL DEFAULT 0,
    "in_progress_tasks" INTEGER NOT NULL DEFAULT 0,
    "completed_today" INTEGER NOT NULL DEFAULT 0,
    "failed_today" INTEGER NOT NULL DEFAULT 0,
    "estimated_remaining_minutes" INTEGER NOT NULL DEFAULT 0,
    "actual_worked_minutes" INTEGER NOT NULL DEFAULT 0,
    "idle_minutes" INTEGER NOT NULL DEFAULT 0,
    "utilization_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operator_workload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_equipment" (
    "id" UUID NOT NULL,
    "equipment_code" TEXT NOT NULL,
    "equipment_type" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "serial_number" TEXT,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "home_zone_id" UUID,
    "home_zone_name" TEXT,
    "battery_percent" INTEGER,
    "fuel_percent" INTEGER,
    "charging_status" TEXT,
    "last_maintenance_at" TIMESTAMP(3),
    "next_maintenance_at" TIMESTAMP(3),
    "maintenance_due_km" INTEGER,
    "total_operating_hours" DECIMAL(10,2),
    "total_tasks_done" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "current_operator_id" UUID,
    "current_operator_name" TEXT,
    "current_task_id" UUID,
    "current_location_code" TEXT,
    "required_certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_assignments" (
    "id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "equipment_code" TEXT NOT NULL,
    "equipment_type" TEXT NOT NULL,
    "operator_id" UUID,
    "operator_code" TEXT,
    "operator_name" TEXT,
    "task_id" UUID,
    "task_number" TEXT,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "assignment_reason" TEXT,
    "notes" TEXT,

    CONSTRAINT "equipment_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_sla" (
    "id" UUID NOT NULL,
    "sla_code" TEXT NOT NULL,
    "sla_name" TEXT NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "task_type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "target_minutes" INTEGER NOT NULL,
    "warning_minutes" INTEGER,
    "critical_minutes" INTEGER,
    "penalty_amount" DECIMAL(10,2),
    "penalty_currency" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_sla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sla_violations" (
    "id" UUID NOT NULL,
    "violation_number" TEXT NOT NULL,
    "sla_id" UUID,
    "sla_code" TEXT NOT NULL,
    "sla_name" TEXT NOT NULL,
    "task_id" UUID,
    "task_number" TEXT NOT NULL,
    "task_type" TEXT NOT NULL,
    "operator_id" UUID,
    "operator_name" TEXT,
    "planned_start" TIMESTAMP(3),
    "planned_finish" TIMESTAMP(3),
    "actual_finish" TIMESTAMP(3),
    "deadline_time" TIMESTAMP(3) NOT NULL,
    "violation_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "overrun_minutes" INTEGER NOT NULL DEFAULT 0,
    "penalty_applied" BOOLEAN NOT NULL DEFAULT false,
    "penalty_amount" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolved_by_id" UUID,
    "resolved_by_name" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "root_cause" TEXT,
    "preventive_action" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sla_violations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_exceptions" (
    "id" UUID NOT NULL,
    "exception_number" TEXT NOT NULL,
    "exception_type" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" UUID,
    "source_number" TEXT,
    "task_id" UUID,
    "task_number" TEXT,
    "wave_id" UUID,
    "wave_number" TEXT,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "zone_id" UUID,
    "zone_name" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "root_cause" TEXT,
    "reported_by_id" UUID,
    "reported_by_name" TEXT,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_to_id" UUID,
    "assigned_to_name" TEXT,
    "assigned_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolution_notes" TEXT,
    "resolved_by_id" UUID,
    "resolved_by_name" TEXT,
    "resolved_at" TIMESTAMP(3),
    "escalated_to_id" UUID,
    "escalated_to_name" TEXT,
    "escalated_at" TIMESTAMP(3),
    "escalation_level" INTEGER NOT NULL DEFAULT 0,
    "impactLevel" TEXT NOT NULL DEFAULT 'MINOR',
    "affected_tasks" INTEGER NOT NULL DEFAULT 0,
    "affected_orders" INTEGER NOT NULL DEFAULT 0,
    "estimated_delay_minutes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cross_dock_orders" (
    "id" UUID NOT NULL,
    "cross_dock_number" TEXT NOT NULL,
    "cross_dock_type" TEXT NOT NULL,
    "inbound_shipment_id" UUID,
    "inbound_shipment_number" TEXT,
    "asn_id" UUID,
    "asn_number" TEXT,
    "supplier_id" UUID,
    "supplier_name" TEXT,
    "outbound_order_type" TEXT NOT NULL,
    "outbound_order_number" TEXT NOT NULL,
    "outbound_order_id" UUID,
    "partner_id" UUID,
    "partner_name" TEXT,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "inbound_dock_id" UUID,
    "inbound_dock_code" TEXT,
    "outbound_dock_id" UUID,
    "outbound_dock_code" TEXT,
    "rule_id" UUID,
    "rule_code" TEXT,
    "rule_name" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "expected_inbound_at" TIMESTAMP(3),
    "actual_inbound_at" TIMESTAMP(3),
    "expected_outbound_at" TIMESTAMP(3),
    "actual_outbound_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "total_lines" INTEGER NOT NULL DEFAULT 0,
    "total_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "total_weight_kg" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "storage_avoided" BOOLEAN NOT NULL DEFAULT true,
    "handling_cost_saved" DECIMAL(10,2),
    "time_saved_minutes" INTEGER,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cross_dock_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cross_dock_tasks" (
    "id" UUID NOT NULL,
    "task_number" TEXT NOT NULL,
    "cross_dock_order_id" UUID NOT NULL,
    "cross_dock_number" TEXT NOT NULL,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "planned_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "actual_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL,
    "from_dock_code" TEXT NOT NULL,
    "to_dock_code" TEXT NOT NULL,
    "from_pallet_id" UUID,
    "to_pallet_id" UUID,
    "assigned_operator_id" UUID,
    "assigned_operator_name" TEXT,
    "assigned_equipment_id" UUID,
    "assigned_equipment_code" TEXT,
    "inbound_scan_verified" BOOLEAN NOT NULL DEFAULT false,
    "outbound_scan_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cross_dock_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yard_locations" (
    "id" UUID NOT NULL,
    "yard_code" TEXT NOT NULL,
    "yard_name" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "slot_number" TEXT,
    "row" TEXT,
    "column" TEXT,
    "capacity_vehicles" INTEGER NOT NULL DEFAULT 1,
    "occupied_vehicles" INTEGER NOT NULL DEFAULT 0,
    "slot_type" TEXT NOT NULL DEFAULT 'STANDARD',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yard_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yard_vehicles" (
    "id" UUID NOT NULL,
    "vehicle_number" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "ownership" TEXT NOT NULL DEFAULT 'THIRD_PARTY',
    "carrier_name" TEXT,
    "carrier_id" UUID,
    "driver_name" TEXT NOT NULL,
    "driver_phone" TEXT,
    "driver_license" TEXT,
    "helper_name" TEXT,
    "yard_location_id" UUID,
    "yard_location_code" TEXT,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "visit_purpose" TEXT NOT NULL,
    "asn_id" UUID,
    "asn_number" TEXT,
    "dispatch_order_id" UUID,
    "dispatch_number" TEXT,
    "arrival_time" TIMESTAMP(3),
    "expected_departure" TIMESTAMP(3),
    "actual_departure" TIMESTAMP(3),
    "waiting_minutes" INTEGER NOT NULL DEFAULT 0,
    "yard_minutes" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "assigned_dock_id" UUID,
    "assigned_dock_code" TEXT,
    "assigned_at" TIMESTAMP(3),
    "capacity_weight_kg" DECIMAL(10,2),
    "capacity_volume_m3" DECIMAL(10,2),
    "capacity_pallets" INTEGER,
    "is_refrigerated" BOOLEAN NOT NULL DEFAULT false,
    "temp_setpoint_c" DECIMAL(5,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yard_vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truck_queue" (
    "id" UUID NOT NULL,
    "queue_number" TEXT NOT NULL,
    "yard_vehicle_id" UUID NOT NULL,
    "vehicle_number" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "driver_name" TEXT NOT NULL,
    "queue_position" INTEGER NOT NULL,
    "queue_type" TEXT NOT NULL DEFAULT 'FIFO',
    "priority_score" INTEGER NOT NULL DEFAULT 50,
    "priority_reason" TEXT,
    "visit_purpose" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "enqueued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dequeued_at" TIMESTAMP(3),
    "waiting_minutes" INTEGER NOT NULL DEFAULT 0,
    "estimated_dock_time" TIMESTAMP(3),
    "assigned_dock_id" UUID,
    "assigned_dock_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "delay_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "truck_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "truck_queue_history" (
    "id" UUID NOT NULL,
    "yard_vehicle_id" UUID NOT NULL,
    "vehicle_number" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "from_position" INTEGER,
    "to_position" INTEGER,
    "from_priority" TEXT,
    "to_priority" TEXT,
    "change_reason" TEXT,
    "changed_by" TEXT,
    "event_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waiting_minutes" INTEGER,

    CONSTRAINT "truck_queue_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dock_doors" (
    "id" UUID NOT NULL,
    "dock_code" TEXT NOT NULL,
    "dock_name" TEXT NOT NULL,
    "dock_type" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "zone" TEXT,
    "max_vehicle_weight_kg" DECIMAL(10,2),
    "supports_cold_chain" BOOLEAN NOT NULL DEFAULT false,
    "supports_bulk" BOOLEAN NOT NULL DEFAULT false,
    "has_dock_leveler" BOOLEAN NOT NULL DEFAULT true,
    "has_dock_seal" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "current_vehicle_id" UUID,
    "current_vehicle_number" TEXT,
    "utilization_today" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "operations_today" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dock_doors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dock_schedule" (
    "id" UUID NOT NULL,
    "dock_door_id" UUID NOT NULL,
    "dock_code" TEXT NOT NULL,
    "schedule_date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "booking_type" TEXT NOT NULL,
    "booking_reference" TEXT,
    "vehicle_number" TEXT,
    "vehicle_type" TEXT,
    "carrier_name" TEXT,
    "driver_name" TEXT,
    "partner_id" UUID,
    "partner_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "actual_start_time" TIMESTAMP(3),
    "actual_end_time" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dock_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trailers" (
    "id" UUID NOT NULL,
    "trailer_number" TEXT NOT NULL,
    "container_number" TEXT,
    "seal_number" TEXT,
    "trailer_type" TEXT NOT NULL,
    "ownership" TEXT NOT NULL DEFAULT 'OWN_FLEET',
    "carrier_id" UUID,
    "carrier_name" TEXT,
    "capacity_weight_kg" DECIMAL(10,2) NOT NULL,
    "capacity_volume_m3" DECIMAL(10,2) NOT NULL,
    "capacity_pallets" INTEGER NOT NULL DEFAULT 0,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "current_location_code" TEXT,
    "assigned_dock_id" UUID,
    "assigned_dock_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "assigned_driver_name" TEXT,
    "assigned_driver_phone" TEXT,
    "last_inspection_at" TIMESTAMP(3),
    "last_inspection_by" TEXT,
    "inspection_result" TEXT,
    "inspection_notes" TEXT,
    "last_maintenance_at" TIMESTAMP(3),
    "next_maintenance_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trailers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trailer_movements" (
    "id" UUID NOT NULL,
    "trailer_id" UUID NOT NULL,
    "trailer_number" TEXT NOT NULL,
    "movement_type" TEXT NOT NULL,
    "from_location_code" TEXT,
    "to_location_code" TEXT,
    "from_dock_code" TEXT,
    "to_dock_code" TEXT,
    "vehicle_number" TEXT,
    "driver_name" TEXT,
    "performed_by" TEXT,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "trailer_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yard_gate_entries" (
    "id" UUID NOT NULL,
    "entry_number" TEXT NOT NULL,
    "yard_vehicle_id" UUID,
    "vehicle_number" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "driver_name" TEXT NOT NULL,
    "driver_phone" TEXT,
    "driver_license" TEXT,
    "visit_purpose" TEXT NOT NULL,
    "asn_number" TEXT,
    "dispatch_number" TEXT,
    "partner_name" TEXT,
    "carrier_name" TEXT,
    "gate_number" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "security_officer_id" UUID,
    "security_officer_name" TEXT,
    "gate_pass_number" TEXT NOT NULL,
    "pass_type" TEXT NOT NULL DEFAULT 'QR',
    "pass_qr_code" TEXT,
    "documents_verified" BOOLEAN NOT NULL DEFAULT false,
    "vehicle_inspected" BOOLEAN NOT NULL DEFAULT false,
    "seal_verified" BOOLEAN NOT NULL DEFAULT false,
    "photo_front_url" TEXT,
    "photo_back_url" TEXT,
    "photo_side_url" TEXT,
    "photo_seal_url" TEXT,
    "entry_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_exit_time" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ENTERED',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yard_gate_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yard_gate_exits" (
    "id" UUID NOT NULL,
    "exit_number" TEXT NOT NULL,
    "gate_entry_id" UUID NOT NULL,
    "entry_number" TEXT NOT NULL,
    "gate_pass_number" TEXT NOT NULL,
    "vehicle_number" TEXT NOT NULL,
    "driver_name" TEXT NOT NULL,
    "security_officer_id" UUID,
    "security_officer_name" TEXT,
    "seal_verified" BOOLEAN NOT NULL DEFAULT false,
    "documents_verified" BOOLEAN NOT NULL DEFAULT false,
    "vehicle_inspected" BOOLEAN NOT NULL DEFAULT false,
    "cargo_verified" BOOLEAN NOT NULL DEFAULT false,
    "photo_exit_url" TEXT,
    "photo_seal_url" TEXT,
    "exit_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "yard_duration_minutes" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'EXITED',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yard_gate_exits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_types" (
    "id" UUID NOT NULL,
    "type_code" TEXT NOT NULL,
    "type_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "manufacturer" TEXT,
    "default_model" TEXT,
    "power_source" TEXT,
    "load_capacity_kg" DECIMAL(10,2),
    "max_lift_height_mm" INTEGER,
    "expected_lifespan_years" INTEGER,
    "depreciation_years" INTEGER,
    "daily_inspection_req" BOOLEAN NOT NULL DEFAULT false,
    "weekly_inspection_req" BOOLEAN NOT NULL DEFAULT false,
    "monthly_service_req" BOOLEAN NOT NULL DEFAULT true,
    "quarterly_service_req" BOOLEAN NOT NULL DEFAULT true,
    "annual_overhaul_req" BOOLEAN NOT NULL DEFAULT true,
    "calibration_req" BOOLEAN NOT NULL DEFAULT false,
    "certification_req" BOOLEAN NOT NULL DEFAULT false,
    "required_certification" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_master" (
    "id" UUID NOT NULL,
    "equipment_code" TEXT NOT NULL,
    "equipment_name" TEXT NOT NULL,
    "type_id" UUID,
    "type_code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "serial_number" TEXT,
    "asset_tag_number" TEXT,
    "qr_code" TEXT,
    "purchase_date" TIMESTAMP(3),
    "purchase_cost" DECIMAL(12,2),
    "purchase_currency" TEXT DEFAULT 'INR',
    "supplier_name" TEXT,
    "warranty_expiry" TIMESTAMP(3),
    "is_under_warranty" BOOLEAN NOT NULL DEFAULT false,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "home_zone_id" UUID,
    "home_zone_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "current_operator_id" UUID,
    "current_operator_name" TEXT,
    "current_location_code" TEXT,
    "current_task_id" UUID,
    "total_operating_hours" DECIMAL(10,2),
    "total_tasks_completed" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" TIMESTAMP(3),
    "power_source" TEXT,
    "battery_percent" INTEGER,
    "fuel_percent" INTEGER,
    "last_maintenance_at" TIMESTAMP(3),
    "next_maintenance_at" TIMESTAMP(3),
    "maintenance_due_hours" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retired_at" TIMESTAMP(3),
    "retirement_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forklifts" (
    "id" UUID NOT NULL,
    "forklift_code" TEXT NOT NULL,
    "equipment_id" UUID NOT NULL,
    "forklift_type" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "load_capacity_kg" DECIMAL(10,2) NOT NULL,
    "max_lift_height_mm" INTEGER NOT NULL,
    "power_source" TEXT NOT NULL,
    "battery_id" UUID,
    "battery_percent" INTEGER,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "current_zone_name" TEXT,
    "current_operator_id" UUID,
    "current_operator_name" TEXT,
    "current_task_id" UUID,
    "current_task_number" TEXT,
    "total_operating_hours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "hours_since_service" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "last_service_at" TIMESTAMP(3),
    "next_service_at" TIMESTAMP(3),
    "next_service_hours" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forklifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forklift_assignments" (
    "id" UUID NOT NULL,
    "forklift_id" UUID NOT NULL,
    "forklift_code" TEXT NOT NULL,
    "operator_id" UUID,
    "operator_code" TEXT,
    "operator_name" TEXT,
    "task_id" UUID,
    "task_number" TEXT,
    "zone_name" TEXT,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "operating_hours" DECIMAL(5,2),
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "assignment_reason" TEXT,
    "condition_at_handover" TEXT,
    "handover_notes" TEXT,
    "notes" TEXT,

    CONSTRAINT "forklift_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobile_devices" (
    "id" UUID NOT NULL,
    "device_code" TEXT NOT NULL,
    "device_name" TEXT NOT NULL,
    "device_type" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "imei" TEXT,
    "mac_address" TEXT,
    "operating_system" TEXT NOT NULL,
    "os_version" TEXT,
    "app_name" TEXT,
    "app_version" TEXT,
    "app_last_sync_at" TIMESTAMP(3),
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "assigned_operator_id" UUID,
    "assigned_operator_name" TEXT,
    "assigned_at" TIMESTAMP(3),
    "battery_percent" INTEGER,
    "is_charging" BOOLEAN NOT NULL DEFAULT false,
    "connectivity_status" TEXT NOT NULL DEFAULT 'OFFLINE',
    "wifi_ssid" TEXT,
    "ip_address" TEXT,
    "last_heartbeat_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mobile_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barcode_scanners" (
    "id" UUID NOT NULL,
    "scanner_code" TEXT NOT NULL,
    "scanner_type" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serial_number" TEXT NOT NULL,
    "mobile_device_id" UUID,
    "supports_1d" BOOLEAN NOT NULL DEFAULT true,
    "supports_2d" BOOLEAN NOT NULL DEFAULT true,
    "supports_qr" BOOLEAN NOT NULL DEFAULT true,
    "supports_gs1" BOOLEAN NOT NULL DEFAULT false,
    "supports_rfid" BOOLEAN NOT NULL DEFAULT false,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "assigned_operator_id" UUID,
    "assigned_operator_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "last_scan_at" TIMESTAMP(3),
    "total_scans_today" INTEGER NOT NULL DEFAULT 0,
    "total_scans_lifetime" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barcode_scanners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battery_status" (
    "id" UUID NOT NULL,
    "battery_code" TEXT NOT NULL,
    "equipment_id" UUID,
    "equipment_code" TEXT NOT NULL,
    "equipment_type" TEXT NOT NULL,
    "battery_type" TEXT NOT NULL,
    "voltage" DECIMAL(6,2) NOT NULL,
    "capacity_ah" DECIMAL(8,2) NOT NULL,
    "manufacturer" TEXT,
    "serial_number" TEXT,
    "current_percent" INTEGER NOT NULL DEFAULT 100,
    "charging_status" TEXT NOT NULL DEFAULT 'NOT_CHARGING',
    "health_percent" INTEGER NOT NULL DEFAULT 100,
    "cycle_count" INTEGER NOT NULL DEFAULT 0,
    "max_cycles" INTEGER NOT NULL DEFAULT 1000,
    "charging_station_id" UUID,
    "charging_started_at" TIMESTAMP(3),
    "estimated_full_at" TIMESTAMP(3),
    "last_charged_at" TIMESTAMP(3),
    "replacement_due_at" TIMESTAMP(3),
    "replacement_recommended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battery_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charging_stations" (
    "id" UUID NOT NULL,
    "station_code" TEXT NOT NULL,
    "station_name" TEXT NOT NULL,
    "station_type" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "zone_name" TEXT,
    "location_code" TEXT,
    "total_bays" INTEGER NOT NULL DEFAULT 1,
    "occupied_bays" INTEGER NOT NULL DEFAULT 0,
    "voltage_output" DECIMAL(6,2),
    "max_current_a" DECIMAL(6,2),
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charging_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_plans" (
    "id" UUID NOT NULL,
    "plan_code" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "equipment_id" UUID,
    "equipment_code" TEXT,
    "type_id" UUID,
    "type_code" TEXT,
    "applies_to" TEXT NOT NULL,
    "frequency_type" TEXT NOT NULL,
    "frequency_interval" INTEGER NOT NULL DEFAULT 1,
    "frequency_unit" TEXT NOT NULL DEFAULT 'DAYS',
    "maintenance_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "checklist" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimated_duration_min" INTEGER NOT NULL DEFAULT 60,
    "assigned_technician_id" UUID,
    "assigned_technician_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_executed_at" TIMESTAMP(3),
    "next_execution_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_schedule" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "scheduled_start_time" TIMESTAMP(3) NOT NULL,
    "scheduled_end_time" TIMESTAMP(3) NOT NULL,
    "equipment_id" UUID NOT NULL,
    "equipment_code" TEXT NOT NULL,
    "technician_id" UUID,
    "technician_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "actual_start_time" TIMESTAMP(3),
    "actual_end_time" TIMESTAMP(3),
    "actual_duration_min" INTEGER,
    "result" TEXT,
    "findings" TEXT,
    "parts_replaced" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cost" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_tasks" (
    "id" UUID NOT NULL,
    "task_number" TEXT NOT NULL,
    "plan_id" UUID,
    "equipment_id" UUID NOT NULL,
    "equipment_code" TEXT NOT NULL,
    "task_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "checklist" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "completed_checklist" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technician_id" UUID,
    "technician_name" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "duration_min" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "result" TEXT,
    "findings" TEXT,
    "parts_replaced" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cost" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_breakdowns" (
    "id" UUID NOT NULL,
    "breakdown_number" TEXT NOT NULL,
    "equipment_id" UUID NOT NULL,
    "equipment_code" TEXT NOT NULL,
    "equipment_type" TEXT NOT NULL,
    "problem_category" TEXT NOT NULL,
    "problem_description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "reported_by_id" UUID,
    "reported_by_name" TEXT,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photo_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "technician_id" UUID,
    "technician_name" TEXT,
    "assigned_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "diagnosis" TEXT,
    "repair_action" TEXT,
    "parts_replaced" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "repair_cost" DECIMAL(10,2),
    "repair_started_at" TIMESTAMP(3),
    "repair_completed_at" TIMESTAMP(3),
    "tested_at" TIMESTAMP(3),
    "returned_to_service_at" TIMESTAMP(3),
    "downtime_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_breakdowns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_certifications" (
    "id" UUID NOT NULL,
    "certification_code" TEXT NOT NULL,
    "operator_id" UUID NOT NULL,
    "operator_code" TEXT NOT NULL,
    "operator_name" TEXT NOT NULL,
    "certification_type" TEXT NOT NULL,
    "certification_name" TEXT NOT NULL,
    "issued_by" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL,
    "certificate_number" TEXT,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "is_expired" BOOLEAN NOT NULL DEFAULT false,
    "is_expiring_soon" BOOLEAN NOT NULL DEFAULT false,
    "equipment_type_code" TEXT,
    "equipment_type_name" TEXT,
    "score_percent" DECIMAL(5,2),
    "max_score_percent" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "renewed_from" UUID,
    "renewal_required" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operator_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobile_device_sessions" (
    "id" UUID NOT NULL,
    "session_code" TEXT NOT NULL,
    "device_id" UUID NOT NULL,
    "device_code" TEXT NOT NULL,
    "imei" TEXT,
    "operator_id" UUID NOT NULL,
    "operator_code" TEXT NOT NULL,
    "operator_name" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "login_method" TEXT NOT NULL,
    "jwt_token" TEXT,
    "refresh_token" TEXT,
    "login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logout_at" TIMESTAMP(3),
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mobile_device_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "device_code" TEXT NOT NULL,
    "token_type" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "operator_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_transactions" (
    "id" UUID NOT NULL,
    "transaction_code" TEXT NOT NULL,
    "device_id" UUID NOT NULL,
    "device_code" TEXT NOT NULL,
    "operator_id" UUID NOT NULL,
    "operator_code" TEXT NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "task_id" UUID,
    "task_number" TEXT,
    "barcode_scanned" TEXT,
    "barcode_type" TEXT,
    "product_sku" TEXT,
    "batch_number" TEXT,
    "bin_code" TEXT,
    "qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "uom" TEXT,
    "payload" JSONB NOT NULL,
    "signature" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_SYNC',
    "offline_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_at" TIMESTAMP(3),
    "conflict_reason" TEXT,
    "conflict_resolution" TEXT,
    "resolved_by_id" UUID,
    "resolved_by_name" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offline_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_queue" (
    "id" UUID NOT NULL,
    "queue_code" TEXT NOT NULL,
    "offline_transaction_id" UUID,
    "transaction_code" TEXT,
    "device_id" UUID NOT NULL,
    "device_code" TEXT NOT NULL,
    "sync_type" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "last_attempt_at" TIMESTAMP(3),
    "next_attempt_at" TIMESTAMP(3),
    "last_error" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "enqueued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "sync_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_history" (
    "id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "device_code" TEXT NOT NULL,
    "sync_session_code" TEXT NOT NULL,
    "sync_direction" TEXT NOT NULL,
    "transactions_uploaded" INTEGER NOT NULL DEFAULT 0,
    "transactions_downloaded" INTEGER NOT NULL DEFAULT 0,
    "conflicts_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "network_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobile_notifications" (
    "id" UUID NOT NULL,
    "notification_code" TEXT NOT NULL,
    "operator_id" UUID NOT NULL,
    "operator_code" TEXT NOT NULL,
    "device_id" UUID,
    "notification_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "action_type" TEXT,
    "action_payload" JSONB,
    "delivery_channel" TEXT[],
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "dismissed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mobile_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_events" (
    "id" UUID NOT NULL,
    "scan_code" TEXT NOT NULL,
    "device_id" UUID NOT NULL,
    "device_code" TEXT NOT NULL,
    "operator_id" UUID,
    "operator_code" TEXT,
    "barcode_value" TEXT NOT NULL,
    "barcode_type" TEXT NOT NULL,
    "scan_source" TEXT NOT NULL,
    "task_type" TEXT,
    "task_id" UUID,
    "validation_result" TEXT NOT NULL,
    "validation_message" TEXT,
    "scan_duration_ms" INTEGER,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_kpi_snapshots" (
    "id" UUID NOT NULL,
    "snapshot_code" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "orders_processed" INTEGER NOT NULL DEFAULT 0,
    "lines_processed" INTEGER NOT NULL DEFAULT 0,
    "units_processed" INTEGER NOT NULL DEFAULT 0,
    "tasks_completed" INTEGER NOT NULL DEFAULT 0,
    "avg_receiving_time_min" DECIMAL(8,2),
    "avg_putaway_time_min" DECIMAL(8,2),
    "avg_picking_time_min" DECIMAL(8,2),
    "avg_packing_time_min" DECIMAL(8,2),
    "avg_dispatch_time_min" DECIMAL(8,2),
    "dock_to_stock_time_min" DECIMAL(8,2),
    "dock_utilization_pct" DECIMAL(5,2),
    "equipment_util_pct" DECIMAL(5,2),
    "capacity_util_pct" DECIMAL(5,2),
    "inventory_accuracy_pct" DECIMAL(5,2),
    "picking_accuracy_pct" DECIMAL(5,2),
    "putaway_accuracy_pct" DECIMAL(5,2),
    "task_completion_rate_pct" DECIMAL(5,2),
    "dispatch_on_time_pct" DECIMAL(5,2),
    "order_fulfillment_accuracy_pct" DECIMAL(5,2),
    "sla_compliance_pct" DECIMAL(5,2),
    "sla_violations" INTEGER NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(12,2),
    "cost_per_order" DECIMAL(10,2),
    "cost_per_unit" DECIMAL(10,2),
    "scorecard_score" INTEGER,
    "scorecard_grade" TEXT,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_kpi_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_productivity" (
    "id" UUID NOT NULL,
    "operator_id" UUID NOT NULL,
    "operator_code" TEXT NOT NULL,
    "operator_name" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "tasks_completed" INTEGER NOT NULL DEFAULT 0,
    "tasks_assigned" INTEGER NOT NULL DEFAULT 0,
    "task_completion_rate" DECIMAL(5,2),
    "avg_task_time_min" DECIMAL(8,2),
    "total_work_time_min" INTEGER NOT NULL DEFAULT 0,
    "idle_time_min" INTEGER NOT NULL DEFAULT 0,
    "travel_time_min" INTEGER NOT NULL DEFAULT 0,
    "travel_distance_m" DECIMAL(10,2),
    "picking_accuracy_pct" DECIMAL(5,2),
    "putaway_accuracy_pct" DECIMAL(5,2),
    "scan_accuracy_pct" DECIMAL(5,2),
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "scanner_usage_min" INTEGER NOT NULL DEFAULT 0,
    "forklift_usage_min" INTEGER NOT NULL DEFAULT 0,
    "total_scans" INTEGER NOT NULL DEFAULT 0,
    "hours_worked" DECIMAL(5,2),
    "overtime_hours" DECIMAL(5,2),
    "attendance_days" INTEGER NOT NULL DEFAULT 0,
    "late_days" INTEGER NOT NULL DEFAULT 0,
    "tasks_per_hour" DECIMAL(5,2),
    "units_per_hour" DECIMAL(8,2),
    "utilization_pct" DECIMAL(5,2),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operator_productivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_scores" (
    "id" UUID NOT NULL,
    "operator_id" UUID NOT NULL,
    "operator_code" TEXT NOT NULL,
    "operator_name" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "overall_score" INTEGER NOT NULL,
    "productivity_score" INTEGER NOT NULL,
    "accuracy_score" INTEGER NOT NULL,
    "attendance_score" INTEGER NOT NULL,
    "utilization_score" INTEGER NOT NULL,
    "warehouse_rank" INTEGER,
    "zone_rank" INTEGER,
    "grade" TEXT NOT NULL,
    "training_needed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendation" TEXT,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operator_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_cost_centers" (
    "id" UUID NOT NULL,
    "cost_center_code" TEXT NOT NULL,
    "cost_center_name" TEXT NOT NULL,
    "cost_type" TEXT NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "zone_id" UUID,
    "zone_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_costs" (
    "id" UUID NOT NULL,
    "cost_code" TEXT NOT NULL,
    "cost_center_id" UUID,
    "cost_center_code" TEXT NOT NULL,
    "cost_type" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "zone_id" UUID,
    "zone_name" TEXT,
    "period_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "allocation_type" TEXT,
    "allocation_basis" TEXT,
    "allocation_qty" DECIMAL(10,2),
    "cost_per_order" DECIMAL(10,2),
    "cost_per_unit" DECIMAL(10,2),
    "cost_per_task" DECIMAL(10,2),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_heatmaps" (
    "id" UUID NOT NULL,
    "heatmap_code" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "heatmap_type" TEXT NOT NULL,
    "zone_name" TEXT,
    "aisle_code" TEXT,
    "rack_code" TEXT,
    "bin_code" TEXT,
    "dock_code" TEXT,
    "intensity" INTEGER NOT NULL,
    "metric_value" DECIMAL(10,2),
    "metric_unit" TEXT,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_heatmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_bottlenecks" (
    "id" UUID NOT NULL,
    "bottleneck_code" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "bottleneck_type" TEXT NOT NULL,
    "zone_name" TEXT,
    "operator_id" UUID,
    "operator_name" TEXT,
    "equipment_code" TEXT,
    "dock_code" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "impact_score" INTEGER NOT NULL DEFAULT 50,
    "affected_tasks" INTEGER NOT NULL DEFAULT 0,
    "affected_orders" INTEGER NOT NULL DEFAULT 0,
    "estimated_delay_min" INTEGER NOT NULL DEFAULT 0,
    "root_cause" TEXT,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recommended_action" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_bottlenecks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_mission_control" (
    "id" UUID NOT NULL,
    "snapshot_code" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'ENTERPRISE',
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "overall_health_score" INTEGER NOT NULL,
    "operations_score" INTEGER NOT NULL,
    "inventory_score" INTEGER NOT NULL,
    "equipment_score" INTEGER NOT NULL,
    "workforce_score" INTEGER NOT NULL,
    "sla_score" INTEGER NOT NULL,
    "total_warehouses" INTEGER NOT NULL DEFAULT 0,
    "healthy_warehouses" INTEGER NOT NULL DEFAULT 0,
    "warning_warehouses" INTEGER NOT NULL DEFAULT 0,
    "critical_warehouses" INTEGER NOT NULL DEFAULT 0,
    "total_live_tasks" INTEGER NOT NULL DEFAULT 0,
    "total_active_operators" INTEGER NOT NULL DEFAULT 0,
    "total_equipment_active" INTEGER NOT NULL DEFAULT 0,
    "total_critical_alerts" INTEGER NOT NULL DEFAULT 0,
    "orders_today" INTEGER NOT NULL DEFAULT 0,
    "lines_today" INTEGER NOT NULL DEFAULT 0,
    "units_today" INTEGER NOT NULL DEFAULT 0,
    "enterprise_sla_pct" DECIMAL(5,2),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enterprise_mission_control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_status" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "warehouse_code" TEXT NOT NULL,
    "region" TEXT,
    "health_score" INTEGER NOT NULL,
    "health_grade" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPERATIONAL',
    "live_tasks" INTEGER NOT NULL DEFAULT 0,
    "active_operators" INTEGER NOT NULL DEFAULT 0,
    "equipment_active" INTEGER NOT NULL DEFAULT 0,
    "capacity_used_pct" INTEGER NOT NULL DEFAULT 0,
    "orders_today" INTEGER NOT NULL DEFAULT 0,
    "tasks_completed_today" INTEGER NOT NULL DEFAULT 0,
    "sla_compliance_pct" DECIMAL(5,2),
    "risk_score" INTEGER NOT NULL DEFAULT 0,
    "open_alerts" INTEGER NOT NULL DEFAULT 0,
    "critical_alerts" INTEGER NOT NULL DEFAULT 0,
    "bottlenecks" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_twin_snapshots" (
    "id" UUID NOT NULL,
    "snapshot_code" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT NOT NULL,
    "zone_count" INTEGER NOT NULL,
    "zones_json" JSONB NOT NULL,
    "total_bins" INTEGER NOT NULL,
    "occupied_bins" INTEGER NOT NULL,
    "empty_bins" INTEGER NOT NULL,
    "bins_json" JSONB NOT NULL,
    "operators_json" JSONB NOT NULL,
    "equipment_json" JSONB NOT NULL,
    "heatmap_json" JSONB NOT NULL,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "digital_twin_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_recommendations" (
    "id" UUID NOT NULL,
    "recommendation_code" TEXT NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'WAREHOUSE',
    "category" TEXT NOT NULL,
    "recommendation_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "risk_score" INTEGER NOT NULL DEFAULT 50,
    "confidence_pct" INTEGER NOT NULL DEFAULT 80,
    "impact_score" INTEGER NOT NULL DEFAULT 50,
    "recommended_action" TEXT NOT NULL,
    "action_payload" JSONB,
    "estimated_benefit" TEXT,
    "supporting_data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "accepted_by_id" UUID,
    "accepted_by_name" TEXT,
    "accepted_at" TIMESTAMP(3),
    "implemented_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictive_forecasts" (
    "id" UUID NOT NULL,
    "forecast_code" TEXT NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "prediction_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "predicted_at" TIMESTAMP(3) NOT NULL,
    "time_horizon" TEXT NOT NULL,
    "probability" INTEGER NOT NULL DEFAULT 50,
    "confidence_pct" INTEGER NOT NULL DEFAULT 70,
    "impact_score" INTEGER NOT NULL DEFAULT 50,
    "recommended_action" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "materialized_at" TIMESTAMP(3),
    "averted_at" TIMESTAMP(3),
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictive_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enterprise_alerts" (
    "id" UUID NOT NULL,
    "alert_code" TEXT NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'WAREHOUSE',
    "alert_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "source_system" TEXT NOT NULL,
    "source_entity" TEXT,
    "delivery_channels" TEXT[],
    "delivered_to" JSONB,
    "requires_ack" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_by_id" UUID,
    "acknowledged_by_name" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "escalation_level" INTEGER NOT NULL DEFAULT 0,
    "escalated_to" TEXT,
    "escalated_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution_notes" TEXT,
    "resolved_by_id" UUID,
    "resolved_by_name" TEXT,
    "resolved_at" TIMESTAMP(3),
    "raised_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enterprise_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recovery_incidents" (
    "id" UUID NOT NULL,
    "incident_code" TEXT NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "incident_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'HIGH',
    "affected_systems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "affected_warehouses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "affected_users" INTEGER NOT NULL DEFAULT 0,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged_at" TIMESTAMP(3),
    "recovery_started_at" TIMESTAMP(3),
    "recovered_at" TIMESTAMP(3),
    "downtime_minutes" INTEGER,
    "recovery_strategy" TEXT,
    "recovery_actions" JSONB,
    "recovery_checklist" JSONB,
    "business_impact" TEXT,
    "estimated_loss" DECIMAL(12,2),
    "root_cause" TEXT,
    "preventive_actions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lessons_learned" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DETECTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recovery_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_health_monitors" (
    "id" UUID NOT NULL,
    "system_name" TEXT NOT NULL,
    "system_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'HEALTHY',
    "health_score" INTEGER NOT NULL DEFAULT 100,
    "uptime_pct" DECIMAL(5,2),
    "response_time_ms" INTEGER,
    "error_rate_pct" DECIMAL(5,2),
    "cpu_usage_pct" DECIMAL(5,2),
    "memory_usage_pct" DECIMAL(5,2),
    "disk_usage_pct" DECIMAL(5,2),
    "last_checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_incident_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_health_monitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturing_plants" (
    "id" UUID NOT NULL,
    "plant_code" TEXT NOT NULL,
    "plant_name" TEXT NOT NULL,
    "plant_type" TEXT NOT NULL,
    "company_id" UUID,
    "company_name" TEXT,
    "branch_id" UUID,
    "branch_name" TEXT,
    "manager_id" UUID,
    "manager_name" TEXT,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "country" TEXT DEFAULT 'India',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "capacity_per_day_kg" DECIMAL(10,2),
    "capacity_per_day_units" INTEGER,
    "operating_hours_start" TEXT DEFAULT '06:00',
    "operating_hours_end" TEXT DEFAULT '22:00',
    "operating_days" TEXT[] DEFAULT ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']::TEXT[],
    "default_raw_material_warehouse_id" UUID,
    "default_raw_material_warehouse_name" TEXT,
    "default_finished_goods_warehouse_id" UUID,
    "default_finished_goods_warehouse_name" TEXT,
    "batch_number_format" TEXT DEFAULT 'BATCH-{YYYY}-{SEQ:0000}',
    "production_number_format" TEXT DEFAULT 'PROD-{YYYY}-{SEQ:0000}',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturing_plants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_departments" (
    "id" UUID NOT NULL,
    "department_code" TEXT NOT NULL,
    "department_name" TEXT NOT NULL,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "department_type" TEXT NOT NULL,
    "manager_id" UUID,
    "manager_name" TEXT,
    "capacity_per_day_kg" DECIMAL(10,2),
    "capacity_per_shift_kg" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_lines" (
    "id" UUID NOT NULL,
    "line_code" TEXT NOT NULL,
    "line_name" TEXT NOT NULL,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "department_id" UUID NOT NULL,
    "department_name" TEXT NOT NULL,
    "capacity_per_hour_kg" DECIMAL(10,2),
    "capacity_per_shift_kg" DECIMAL(10,2),
    "capacity_per_day_kg" DECIMAL(10,2),
    "hourly_output_target" INTEGER,
    "primary_product" TEXT,
    "supported_products" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentStatus" TEXT NOT NULL DEFAULT 'IDLE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_centers" (
    "id" UUID NOT NULL,
    "work_center_code" TEXT NOT NULL,
    "work_center_name" TEXT NOT NULL,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "department_id" UUID NOT NULL,
    "department_name" TEXT NOT NULL,
    "line_id" UUID NOT NULL,
    "line_name" TEXT NOT NULL,
    "work_center_type" TEXT NOT NULL,
    "sequence_no" INTEGER NOT NULL,
    "capacity_per_hour_kg" DECIMAL(10,2),
    "cycle_time_minutes" DECIMAL(8,2),
    "assigned_operators" INTEGER NOT NULL DEFAULT 1,
    "assigned_machines" INTEGER NOT NULL DEFAULT 0,
    "efficiency_target_pct" DECIMAL(5,2) DEFAULT 85,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentStatus" TEXT NOT NULL DEFAULT 'IDLE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_calendar" (
    "id" UUID NOT NULL,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "calendar_date" TIMESTAMP(3) NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "day_type" TEXT NOT NULL,
    "is_operating_day" BOOLEAN NOT NULL DEFAULT true,
    "operating_hours_start" TEXT,
    "operating_hours_end" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_shifts" (
    "id" UUID NOT NULL,
    "shift_code" TEXT NOT NULL,
    "shift_name" TEXT NOT NULL,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "break_start" TEXT,
    "break_end" TEXT,
    "working_days" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "shift_type" TEXT NOT NULL DEFAULT 'REGULAR',
    "grace_early_minutes" INTEGER NOT NULL DEFAULT 15,
    "grace_late_minutes" INTEGER NOT NULL DEFAULT 15,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_holidays" (
    "id" UUID NOT NULL,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "holiday_date" TIMESTAMP(3) NOT NULL,
    "holiday_name" TEXT NOT NULL,
    "holiday_type" TEXT NOT NULL DEFAULT 'PUBLIC',
    "is_full_day" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plant_holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_resources" (
    "id" UUID NOT NULL,
    "resource_code" TEXT NOT NULL,
    "resource_name" TEXT NOT NULL,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "equipment_id" UUID,
    "equipment_code" TEXT,
    "work_center_id" UUID,
    "work_center_code" TEXT,
    "capacity_per_hour" DECIMAL(10,2),
    "capacity_unit" TEXT DEFAULT 'KG',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plant_configurations" (
    "id" UUID NOT NULL,
    "plant_id" UUID NOT NULL,
    "default_production_start" TEXT DEFAULT '06:00',
    "require_shift_login" BOOLEAN NOT NULL DEFAULT true,
    "auto_end_shift_at" TEXT DEFAULT '22:00',
    "default_raw_material_warehouse_id" UUID,
    "default_finished_goods_warehouse_id" UUID,
    "batch_number_format" TEXT NOT NULL DEFAULT 'BATCH-{YYYY}-{SEQ:0000}',
    "batch_seq_counter" INTEGER NOT NULL DEFAULT 0,
    "production_number_format" TEXT NOT NULL DEFAULT 'PROD-{YYYY}-{SEQ:0000}',
    "production_seq_counter" INTEGER NOT NULL DEFAULT 0,
    "auto_quality_hold_on_new_batch" BOOLEAN NOT NULL DEFAULT true,
    "quality_hold_duration_hours" INTEGER NOT NULL DEFAULT 24,
    "require_supervisor_approval" BOOLEAN NOT NULL DEFAULT true,
    "require_batch_barcode" BOOLEAN NOT NULL DEFAULT true,
    "require_product_barcode" BOOLEAN NOT NULL DEFAULT true,
    "enforce_fifo" BOOLEAN NOT NULL DEFAULT true,
    "enforce_fefo" BOOLEAN NOT NULL DEFAULT true,
    "mandatory_batch" BOOLEAN NOT NULL DEFAULT true,
    "recipe_locking" BOOLEAN NOT NULL DEFAULT true,
    "digital_signoff" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plant_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" UUID NOT NULL,
    "recipe_code" TEXT NOT NULL,
    "recipe_name" TEXT NOT NULL,
    "product_id" UUID,
    "product_sku" TEXT,
    "product_name" TEXT,
    "product_type" TEXT NOT NULL,
    "plant_id" UUID,
    "plant_name" TEXT,
    "yield_quantity" DECIMAL(12,3) NOT NULL,
    "yield_uom" TEXT NOT NULL DEFAULT 'KG',
    "production_instructions" TEXT,
    "quality_checkpoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "packaging_instructions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "effective_from" TIMESTAMP(3),
    "effective_to" TIMESTAMP(3),
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_versions" (
    "id" UUID NOT NULL,
    "recipe_id" UUID NOT NULL,
    "recipe_code" TEXT NOT NULL,
    "major_version" INTEGER NOT NULL DEFAULT 1,
    "minor_version" INTEGER NOT NULL DEFAULT 0,
    "version_label" TEXT NOT NULL,
    "change_summary" TEXT,
    "change_reason" TEXT,
    "recipe_snapshot" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "effective_from" TIMESTAMP(3),
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipe_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formulas" (
    "id" UUID NOT NULL,
    "formula_code" TEXT NOT NULL,
    "formula_name" TEXT NOT NULL,
    "recipe_id" UUID NOT NULL,
    "recipe_code" TEXT NOT NULL,
    "recipe_version" TEXT NOT NULL,
    "formulaType" TEXT NOT NULL DEFAULT 'FIXED',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "formulas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formula_lines" (
    "id" UUID NOT NULL,
    "formula_id" UUID NOT NULL,
    "line_no" INTEGER NOT NULL,
    "ingredient_id" UUID,
    "ingredient_sku" TEXT NOT NULL,
    "ingredient_name" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "percentage" DECIMAL(5,2),
    "process_stage" TEXT NOT NULL,
    "loss_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formula_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_of_materials" (
    "id" UUID NOT NULL,
    "bom_code" TEXT NOT NULL,
    "recipe_id" UUID NOT NULL,
    "recipe_code" TEXT NOT NULL,
    "product_id" UUID,
    "product_sku" TEXT,
    "product_name" TEXT,
    "bomType" TEXT NOT NULL DEFAULT 'MANUFACTURING',
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bill_of_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bom_lines" (
    "id" UUID NOT NULL,
    "bom_id" UUID NOT NULL,
    "line_no" INTEGER NOT NULL,
    "component_id" UUID,
    "component_sku" TEXT NOT NULL,
    "component_name" TEXT NOT NULL,
    "componentType" TEXT NOT NULL DEFAULT 'RAW_MATERIAL',
    "quantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "scrap_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(10,2),
    "total_cost" DECIMAL(12,2),
    "has_alternate" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bom_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yield_rules" (
    "id" UUID NOT NULL,
    "recipe_id" UUID NOT NULL,
    "recipe_code" TEXT NOT NULL,
    "expected_yield_pct" DECIMAL(5,2) NOT NULL,
    "expected_loss_pct" DECIMAL(5,2) NOT NULL,
    "min_yield_pct" DECIMAL(5,2) NOT NULL DEFAULT 90,
    "max_yield_pct" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yield_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yield_history" (
    "id" UUID NOT NULL,
    "recipe_id" UUID NOT NULL,
    "recipe_code" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "production_order_id" UUID,
    "input_weight_kg" DECIMAL(12,3) NOT NULL,
    "output_weight_kg" DECIMAL(12,3) NOT NULL,
    "expected_yield_pct" DECIMAL(5,2) NOT NULL,
    "actual_yield_pct" DECIMAL(5,2) NOT NULL,
    "yield_variance_pct" DECIMAL(5,2) NOT NULL,
    "loss_weight_kg" DECIMAL(12,3) NOT NULL,
    "loss_reason" TEXT,
    "production_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yield_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alternate_ingredients" (
    "id" UUID NOT NULL,
    "primary_ingredient_id" UUID,
    "primary_ingredient_sku" TEXT NOT NULL,
    "primary_ingredient_name" TEXT NOT NULL,
    "alternate_ingredient_id" UUID,
    "alternate_ingredient_sku" TEXT NOT NULL,
    "alternate_ingredient_name" TEXT NOT NULL,
    "replacement_ratio" DECIMAL(8,4) NOT NULL DEFAULT 1,
    "quality_approval_req" BOOLEAN NOT NULL DEFAULT true,
    "quality_approved_by" TEXT,
    "quality_approved_at" TIMESTAMP(3),
    "cost_difference_pct" DECIMAL(5,2),
    "supplier_restrictions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alternate_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergens" (
    "id" UUID NOT NULL,
    "allergen_code" TEXT NOT NULL,
    "allergen_name" TEXT NOT NULL,
    "allergen_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'HIGH',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "allergens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_profiles" (
    "id" UUID NOT NULL,
    "recipe_id" UUID,
    "recipe_code" TEXT,
    "product_id" UUID,
    "product_sku" TEXT,
    "serving_size" DECIMAL(8,2) NOT NULL DEFAULT 100,
    "serving_uom" TEXT NOT NULL DEFAULT 'G',
    "calories" DECIMAL(8,2),
    "protein" DECIMAL(8,2),
    "fat" DECIMAL(8,2),
    "saturated_fat" DECIMAL(8,2),
    "carbohydrates" DECIMAL(8,2),
    "sugar" DECIMAL(8,2),
    "fiber" DECIMAL(8,2),
    "sodium" DECIMAL(8,2),
    "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_rollups" (
    "id" UUID NOT NULL,
    "rollup_code" TEXT NOT NULL,
    "recipe_id" UUID NOT NULL,
    "recipe_code" TEXT NOT NULL,
    "recipe_version" TEXT NOT NULL,
    "ingredient_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "packaging_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "processing_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "labor_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "overhead_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_manufacturing_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "cost_per_unit" DECIMAL(10,2) NOT NULL,
    "cost_per_kg" DECIMAL(10,2) NOT NULL,
    "costType" TEXT NOT NULL DEFAULT 'CURRENT',
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_rollups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_production_schedule" (
    "id" UUID NOT NULL,
    "schedule_number" TEXT NOT NULL,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "planner_id" UUID,
    "planner_name" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "total_products" INTEGER NOT NULL DEFAULT 0,
    "total_quantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "total_uom" TEXT NOT NULL DEFAULT 'KG',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_production_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mps_lines" (
    "id" UUID NOT NULL,
    "mps_id" UUID NOT NULL,
    "line_no" INTEGER NOT NULL,
    "product_id" UUID,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "recipe_id" UUID,
    "recipe_code" TEXT,
    "production_line_id" UUID,
    "production_line_code" TEXT,
    "planned_quantity" DECIMAL(14,3) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "planned_date" TIMESTAMP(3) NOT NULL,
    "planned_shift" TEXT,
    "demand_source" TEXT NOT NULL,
    "demand_quantity" DECIMAL(14,3) NOT NULL,
    "estimated_batches" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mps_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mrp_runs" (
    "id" UUID NOT NULL,
    "run_number" TEXT NOT NULL,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "mps_id" UUID,
    "mps_number" TEXT,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "runType" TEXT NOT NULL DEFAULT 'FULL',
    "run_by" TEXT,
    "run_started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "run_completed_at" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "total_materials" INTEGER NOT NULL DEFAULT 0,
    "total_shortages" INTEGER NOT NULL DEFAULT 0,
    "total_purchase_suggestions" INTEGER NOT NULL DEFAULT 0,
    "total_production_suggestions" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mrp_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mrp_results" (
    "id" UUID NOT NULL,
    "mrp_run_id" UUID NOT NULL,
    "material_id" UUID,
    "material_sku" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "materialType" TEXT NOT NULL DEFAULT 'RAW_MATERIAL',
    "gross_demand" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "available_inventory" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "reserved_inventory" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "safety_stock" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "net_requirement" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "suggestion_type" TEXT NOT NULL,
    "suggested_quantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "suggested_date" TIMESTAMP(3),
    "suggested_supplier_id" UUID,
    "suggested_supplier_name" TEXT,
    "lead_time_days" INTEGER,
    "is_shortage" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mrp_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_shortages" (
    "id" UUID NOT NULL,
    "mrp_run_id" UUID NOT NULL,
    "material_sku" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "material_type" TEXT NOT NULL,
    "required_quantity" DECIMAL(14,3) NOT NULL,
    "available_quantity" DECIMAL(14,3) NOT NULL,
    "shortage_quantity" DECIMAL(14,3) NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "affected_products" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "affected_orders" INTEGER NOT NULL DEFAULT 0,
    "resolution_type" TEXT,
    "resolutionStatus" TEXT NOT NULL DEFAULT 'OPEN',
    "resolved_by_id" UUID,
    "resolved_by_name" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "has_alternate" BOOLEAN NOT NULL DEFAULT false,
    "alternate_material_sku" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_shortages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_forecasts" (
    "id" UUID NOT NULL,
    "forecast_code" TEXT NOT NULL,
    "product_id" UUID,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "sales_order_demand" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "retail_pos_demand" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "restaurant_pos_demand" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "distributor_demand" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "export_demand" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "safety_stock_demand" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "total_demand" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "forecastMethod" TEXT NOT NULL DEFAULT 'MOVING_AVERAGE',
    "forecast_quantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "confidence_pct" INTEGER NOT NULL DEFAULT 70,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demand_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capacity_plans" (
    "id" UUID NOT NULL,
    "plan_code" TEXT NOT NULL,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "production_line_id" UUID,
    "production_line_code" TEXT,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "available_hours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "required_hours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "utilization_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "machine_hours_avail" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "machine_hours_req" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "operator_hours_avail" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "operator_hours_req" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'BALANCED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "capacity_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_recommendations" (
    "id" UUID NOT NULL,
    "recommendation_code" TEXT NOT NULL,
    "mrp_run_id" UUID,
    "material_sku" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "required_quantity" DECIMAL(14,3) NOT NULL,
    "available_quantity" DECIMAL(14,3) NOT NULL,
    "suggested_quantity" DECIMAL(14,3) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "suggested_supplier_id" UUID,
    "suggested_supplier_name" TEXT,
    "required_date" TIMESTAMP(3) NOT NULL,
    "lead_time_days" INTEGER NOT NULL DEFAULT 7,
    "suggested_order_date" TIMESTAMP(3) NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "estimated_unit_cost" DECIMAL(10,2),
    "estimated_total_cost" DECIMAL(12,2),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_plans" (
    "id" UUID NOT NULL,
    "plan_code" TEXT NOT NULL,
    "mps_id" UUID,
    "mps_number" TEXT,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "total_products" INTEGER NOT NULL DEFAULT 0,
    "total_batches" INTEGER NOT NULL DEFAULT 0,
    "total_quantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "morning_shifts" INTEGER NOT NULL DEFAULT 0,
    "afternoon_shifts" INTEGER NOT NULL DEFAULT 0,
    "night_shifts" INTEGER NOT NULL DEFAULT 0,
    "overtime_shifts" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "what_if_simulations" (
    "id" UUID NOT NULL,
    "simulation_code" TEXT NOT NULL,
    "simulation_name" TEXT NOT NULL,
    "scenario_type" TEXT NOT NULL,
    "scenario_params" JSONB NOT NULL,
    "base_mps_id" UUID,
    "material_impact" JSONB,
    "capacity_impact" JSONB,
    "cost_impact" JSONB,
    "shortage_impact" JSONB,
    "summary_text" TEXT,
    "recommendation_text" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "simulated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "what_if_simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_orders" (
    "id" UUID NOT NULL,
    "production_order_number" TEXT NOT NULL,
    "mps_id" UUID,
    "mps_number" TEXT,
    "production_plan_id" UUID,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "department_id" UUID,
    "department_name" TEXT,
    "production_line_id" UUID,
    "production_line_code" TEXT,
    "recipe_id" UUID NOT NULL,
    "recipe_code" TEXT NOT NULL,
    "recipe_version" TEXT NOT NULL,
    "product_id" UUID,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "productionType" TEXT NOT NULL DEFAULT 'BATCH_PRODUCTION',
    "batch_number" TEXT,
    "batch_size" DECIMAL(14,3) NOT NULL,
    "planned_quantity" DECIMAL(14,3) NOT NULL,
    "completed_quantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "planned_start" TIMESTAMP(3) NOT NULL,
    "planned_finish" TIMESTAMP(3) NOT NULL,
    "actual_start" TIMESTAMP(3),
    "actual_finish" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "materials_reserved" BOOLEAN NOT NULL DEFAULT false,
    "traveler_qr_code" TEXT,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" UUID NOT NULL,
    "work_order_number" TEXT NOT NULL,
    "production_order_id" UUID NOT NULL,
    "production_order_number" TEXT NOT NULL,
    "operation_no" INTEGER NOT NULL,
    "operation_name" TEXT NOT NULL,
    "work_center_id" UUID,
    "work_center_code" TEXT,
    "work_center_type" TEXT NOT NULL,
    "routing_step_id" UUID,
    "setup_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "run_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "cleanup_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "planned_start" TIMESTAMP(3),
    "planned_finish" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3),
    "actual_finish" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "assigned_operator_id" UUID,
    "assigned_operator_name" TEXT,
    "assigned_machine_id" UUID,
    "assigned_machine_code" TEXT,
    "quality_checkpoint" TEXT,
    "quality_result" TEXT,
    "quality_notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_routings" (
    "id" UUID NOT NULL,
    "routing_code" TEXT NOT NULL,
    "routing_name" TEXT NOT NULL,
    "recipe_id" UUID,
    "recipe_code" TEXT,
    "routingType" TEXT NOT NULL DEFAULT 'SEQUENTIAL',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_routings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routing_steps" (
    "id" UUID NOT NULL,
    "routing_id" UUID NOT NULL,
    "step_no" INTEGER NOT NULL,
    "operation_name" TEXT NOT NULL,
    "work_center_type" TEXT NOT NULL,
    "setup_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "run_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "cleanup_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "required_skill" TEXT,
    "quality_checkpoint" TEXT,
    "quality_target" TEXT,
    "parallel_with" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routing_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_floor_schedule" (
    "id" UUID NOT NULL,
    "schedule_code" TEXT NOT NULL,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "schedule_date" TIMESTAMP(3) NOT NULL,
    "shift" TEXT NOT NULL,
    "available_lines" INTEGER NOT NULL DEFAULT 0,
    "scheduled_lines" INTEGER NOT NULL DEFAULT 0,
    "available_operators" INTEGER NOT NULL DEFAULT 0,
    "scheduled_operators" INTEGER NOT NULL DEFAULT 0,
    "available_machines" INTEGER NOT NULL DEFAULT 0,
    "scheduled_machines" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_floor_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_slots" (
    "id" UUID NOT NULL,
    "schedule_id" UUID NOT NULL,
    "production_order_id" UUID,
    "production_order_number" TEXT,
    "work_order_id" UUID,
    "work_order_number" TEXT,
    "production_line_id" UUID,
    "production_line_code" TEXT,
    "operator_id" UUID,
    "operator_name" TEXT,
    "machine_id" UUID,
    "machine_code" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_assignments" (
    "id" UUID NOT NULL,
    "assignment_code" TEXT NOT NULL,
    "production_order_id" UUID,
    "production_order_number" TEXT,
    "work_order_id" UUID,
    "work_order_number" TEXT,
    "assignment_type" TEXT NOT NULL,
    "resource_id" UUID,
    "resource_code" TEXT NOT NULL,
    "resource_name" TEXT NOT NULL,
    "certified" BOOLEAN NOT NULL DEFAULT false,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_travelers" (
    "id" UUID NOT NULL,
    "traveler_code" TEXT NOT NULL,
    "production_order_id" UUID NOT NULL,
    "production_order_number" TEXT NOT NULL,
    "qr_code" TEXT NOT NULL,
    "recipe_snapshot" JSONB NOT NULL,
    "routing_snapshot" JSONB NOT NULL,
    "bom_snapshot" JSONB NOT NULL,
    "quality_checks" JSONB NOT NULL DEFAULT '[]',
    "time_logs" JSONB NOT NULL DEFAULT '[]',
    "batch_number" TEXT,
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_travelers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_progress_logs" (
    "id" UUID NOT NULL,
    "production_order_id" UUID NOT NULL,
    "production_order_number" TEXT NOT NULL,
    "work_order_id" UUID,
    "work_order_number" TEXT,
    "progress_type" TEXT NOT NULL,
    "completed_qty" DECIMAL(14,3),
    "scrap_qty" DECIMAL(14,3),
    "operator_id" UUID,
    "operator_name" TEXT,
    "notes" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_progress_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_order_execution" (
    "id" UUID NOT NULL,
    "execution_code" TEXT NOT NULL,
    "work_order_id" UUID NOT NULL,
    "work_order_number" TEXT NOT NULL,
    "production_order_id" UUID NOT NULL,
    "production_order_number" TEXT NOT NULL,
    "operator_id" UUID NOT NULL,
    "operator_code" TEXT NOT NULL,
    "operator_name" TEXT NOT NULL,
    "machine_id" UUID,
    "machine_code" TEXT,
    "work_center_code" TEXT NOT NULL,
    "scan_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "setup_duration_min" INTEGER,
    "run_duration_min" INTEGER,
    "cleanup_duration_min" INTEGER,
    "downtime_min" INTEGER NOT NULL DEFAULT 0,
    "input_qty" DECIMAL(14,3),
    "output_qty" DECIMAL(14,3),
    "scrap_qty" DECIMAL(14,3) DEFAULT 0,
    "quality_result" TEXT,
    "quality_notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCANNED',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_order_execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_logs" (
    "id" UUID NOT NULL,
    "execution_id" UUID NOT NULL,
    "log_type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "operator_id" UUID,
    "operator_name" TEXT,
    "log_data" JSONB,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "execution_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_consumption" (
    "id" UUID NOT NULL,
    "consumption_code" TEXT NOT NULL,
    "production_order_id" UUID NOT NULL,
    "production_order_number" TEXT NOT NULL,
    "work_order_id" UUID,
    "work_order_number" TEXT,
    "execution_id" UUID,
    "material_id" UUID,
    "material_sku" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "materialType" TEXT NOT NULL DEFAULT 'RAW_MATERIAL',
    "batch_id" UUID,
    "batch_number" TEXT,
    "barcode_scanned" TEXT,
    "barcode_type" TEXT,
    "planned_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "actual_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "validationResult" TEXT NOT NULL DEFAULT 'VALID',
    "validation_message" TEXT,
    "inventory_transaction_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'CONSUMED',
    "consumed_by_id" UUID,
    "consumed_by_name" TEXT,
    "consumed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_consumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_execution" (
    "id" UUID NOT NULL,
    "execution_code" TEXT NOT NULL,
    "machine_id" UUID NOT NULL,
    "machine_code" TEXT NOT NULL,
    "machine_name" TEXT NOT NULL,
    "production_order_id" UUID,
    "work_order_id" UUID,
    "work_order_number" TEXT,
    "operator_id" UUID,
    "operator_name" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "setup_duration_min" INTEGER,
    "production_duration_min" INTEGER,
    "cleaning_duration_min" INTEGER,
    "idle_duration_min" INTEGER NOT NULL DEFAULT 0,
    "downtime_min" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_events" (
    "id" UUID NOT NULL,
    "machine_execution_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operator_id" UUID,
    "operator_name" TEXT,
    "notes" TEXT,

    CONSTRAINT "machine_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_time_logs" (
    "id" UUID NOT NULL,
    "operator_id" UUID NOT NULL,
    "operator_code" TEXT NOT NULL,
    "operator_name" TEXT NOT NULL,
    "production_order_id" UUID,
    "work_order_id" UUID,
    "work_order_number" TEXT,
    "log_type" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operator_time_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_in_progress" (
    "id" UUID NOT NULL,
    "wip_code" TEXT NOT NULL,
    "production_order_id" UUID NOT NULL,
    "production_order_number" TEXT NOT NULL,
    "batch_number" TEXT,
    "product_id" UUID,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "current_stage" TEXT NOT NULL,
    "current_work_order_id" UUID,
    "input_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "current_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "scrap_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "location_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_in_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wip_movements" (
    "id" UUID NOT NULL,
    "wip_id" UUID NOT NULL,
    "from_stage" TEXT NOT NULL,
    "to_stage" TEXT NOT NULL,
    "qty" DECIMAL(14,3) NOT NULL,
    "scrap_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "operator_id" UUID,
    "operator_name" TEXT,
    "moved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "wip_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_exceptions" (
    "id" UUID NOT NULL,
    "exception_code" TEXT NOT NULL,
    "production_order_id" UUID,
    "production_order_number" TEXT,
    "work_order_id" UUID,
    "work_order_number" TEXT,
    "exception_type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reported_by_id" UUID,
    "reported_by_name" TEXT,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolution_notes" TEXT,
    "resolved_by_id" UUID,
    "resolved_by_name" TEXT,
    "resolved_at" TIMESTAMP(3),
    "downtime_minutes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "andon_boards" (
    "id" UUID NOT NULL,
    "andon_code" TEXT NOT NULL,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "production_line_id" UUID,
    "production_line_code" TEXT,
    "displayType" TEXT NOT NULL DEFAULT 'LINE',
    "status" TEXT NOT NULL DEFAULT 'GREEN',
    "active_orders" INTEGER NOT NULL DEFAULT 0,
    "completed_today" INTEGER NOT NULL DEFAULT 0,
    "delayed_orders" INTEGER NOT NULL DEFAULT 0,
    "target_output" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "actual_output" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "downtime_minutes" INTEGER NOT NULL DEFAULT 0,
    "quality_alerts" INTEGER NOT NULL DEFAULT 0,
    "safety_alerts" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "andon_boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_batches" (
    "id" UUID NOT NULL,
    "batch_number" TEXT NOT NULL,
    "batch_type" TEXT NOT NULL,
    "recipe_id" UUID,
    "recipe_code" TEXT,
    "recipe_version" TEXT,
    "production_order_id" UUID,
    "production_order_number" TEXT,
    "product_id" UUID,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "plant_id" UUID,
    "plant_code" TEXT,
    "plant_name" TEXT,
    "production_line_id" UUID,
    "production_line_code" TEXT,
    "work_center_id" UUID,
    "work_center_code" TEXT,
    "manufacturing_date" TIMESTAMP(3) NOT NULL,
    "packing_date" TIMESTAMP(3),
    "best_before_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "operator_id" UUID,
    "operator_name" TEXT,
    "shift_code" TEXT,
    "planned_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "actual_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "scrap_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "rework_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "status_reason" TEXT,
    "parent_batch_id" UUID,
    "parent_batch_number" TEXT,
    "storage_conditions" TEXT,
    "temperature_range" TEXT,
    "quality_grade" TEXT,
    "quality_status" TEXT NOT NULL DEFAULT 'PENDING',
    "is_recalled" BOOLEAN NOT NULL DEFAULT false,
    "recall_id" UUID,
    "qr_code" TEXT,
    "label_printed_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_batch_history" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "batch_number" TEXT NOT NULL,
    "from_status" TEXT NOT NULL,
    "to_status" TEXT NOT NULL,
    "changed_by_id" UUID,
    "changed_by_name" TEXT,
    "reason" TEXT,
    "comments" TEXT,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_batch_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_relationships" (
    "id" UUID NOT NULL,
    "parent_batch_id" UUID NOT NULL,
    "parent_batch_number" TEXT NOT NULL,
    "parent_batch_type" TEXT NOT NULL,
    "parent_product_id" UUID,
    "parent_product_name" TEXT,
    "child_batch_id" UUID NOT NULL,
    "child_batch_number" TEXT NOT NULL,
    "child_batch_type" TEXT NOT NULL,
    "child_product_id" UUID,
    "child_product_name" TEXT,
    "relationship_type" TEXT NOT NULL,
    "quantity_used" DECIMAL(18,4) NOT NULL,
    "quantity_ratio" DECIMAL(10,4),
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "production_order_id" UUID,
    "production_order_number" TEXT,
    "work_order_id" UUID,
    "work_order_number" TEXT,
    "work_center_code" TEXT,
    "operator_name" TEXT,
    "production_date" TIMESTAMP(3),
    "supplier_id" UUID,
    "supplier_name" TEXT,
    "purchase_order_number" TEXT,
    "goods_receipt_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_shelf_life" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "batch_number" TEXT NOT NULL,
    "manufacturing_date" TIMESTAMP(3) NOT NULL,
    "best_before_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "total_shelf_life_days" INTEGER NOT NULL,
    "elapsed_days" INTEGER NOT NULL,
    "remaining_days" INTEGER NOT NULL,
    "shelf_life_percent" DECIMAL(5,2) NOT NULL,
    "storage_conditions" TEXT,
    "required_temp_min" DECIMAL(5,2),
    "required_temp_max" DECIMAL(5,2),
    "actual_temp_min" DECIMAL(5,2),
    "actual_temp_max" DECIMAL(5,2),
    "temp_compliant" BOOLEAN NOT NULL DEFAULT true,
    "cold_chain_intact" BOOLEAN NOT NULL DEFAULT true,
    "alert_level" TEXT NOT NULL DEFAULT 'HEALTHY',
    "last_checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_shelf_life_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expiry_monitor" (
    "id" UUID NOT NULL,
    "monitor_code" TEXT NOT NULL,
    "plant_id" UUID,
    "plant_name" TEXT,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "total_batches" INTEGER NOT NULL DEFAULT 0,
    "healthy_batches" INTEGER NOT NULL DEFAULT 0,
    "near_expiry_batches" INTEGER NOT NULL DEFAULT 0,
    "critical_batches" INTEGER NOT NULL DEFAULT 0,
    "expired_batches" INTEGER NOT NULL DEFAULT 0,
    "short_life_batches" INTEGER NOT NULL DEFAULT 0,
    "cold_chain_breaks" INTEGER NOT NULL DEFAULT 0,
    "total_value_at_risk" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "fefo_picks" INTEGER NOT NULL DEFAULT 0,
    "discounted_lines" INTEGER NOT NULL DEFAULT 0,
    "donated_lines" INTEGER NOT NULL DEFAULT 0,
    "destroyed_lines" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expiry_monitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_split_merges" (
    "id" UUID NOT NULL,
    "operation_code" TEXT NOT NULL,
    "operation_type" TEXT NOT NULL,
    "source_batch_id" UUID,
    "source_batch_number" TEXT,
    "source_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "target_batch_id" UUID,
    "target_batch_number" TEXT,
    "target_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "source_batch_ids" TEXT,
    "input_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "output_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "loss_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "reason" TEXT,
    "reference_number" TEXT,
    "operator_id" UUID,
    "operator_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_split_merges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recall_actions" (
    "id" UUID NOT NULL,
    "recall_number" TEXT NOT NULL,
    "action_code" TEXT NOT NULL,
    "recall_type" TEXT NOT NULL,
    "recall_class" TEXT,
    "batch_id" UUID,
    "batch_number" TEXT NOT NULL,
    "product_id" UUID,
    "product_name" TEXT,
    "workflow_stage" TEXT NOT NULL,
    "qty_produced" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "qty_in_stock" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "qty_dispatched" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "qty_returned" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "qty_in_transit" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "qty_at_distributor" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "qty_at_retail" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "customers_notified" INTEGER NOT NULL DEFAULT 0,
    "distributors_notified" INTEGER NOT NULL DEFAULT 0,
    "regulatory_notified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "performed_by_id" UUID,
    "performed_by_name" TEXT,
    "notes" TEXT,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recall_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_audits" (
    "id" UUID NOT NULL,
    "audit_code" TEXT NOT NULL,
    "standard" TEXT NOT NULL,
    "standard_version" TEXT,
    "plant_id" UUID,
    "plant_name" TEXT,
    "audit_type" TEXT NOT NULL,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "conducted_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "auditor_name" TEXT,
    "auditor_org" TEXT,
    "total_findings" INTEGER NOT NULL DEFAULT 0,
    "critical_findings" INTEGER NOT NULL DEFAULT 0,
    "major_findings" INTEGER NOT NULL DEFAULT 0,
    "minor_findings" INTEGER NOT NULL DEFAULT 0,
    "observations" INTEGER NOT NULL DEFAULT 0,
    "score_percent" DECIMAL(5,2),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "batches_audited" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compliance_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traceability_searches" (
    "id" UUID NOT NULL,
    "search_code" TEXT NOT NULL,
    "search_type" TEXT NOT NULL,
    "search_term" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'BOTH',
    "execution_ms" INTEGER NOT NULL,
    "within_target" BOOLEAN NOT NULL DEFAULT true,
    "total_nodes_found" INTEGER NOT NULL DEFAULT 0,
    "total_batches_found" INTEGER NOT NULL DEFAULT 0,
    "total_suppliers_found" INTEGER NOT NULL DEFAULT 0,
    "total_customers_found" INTEGER NOT NULL DEFAULT 0,
    "total_shipments_found" INTEGER NOT NULL DEFAULT 0,
    "total_warehouses_found" INTEGER NOT NULL DEFAULT 0,
    "triggered_by" TEXT NOT NULL DEFAULT 'OPERATOR',
    "complaint_number" TEXT,
    "user_id" UUID,
    "user_name" TEXT,
    "result_snapshot" TEXT,
    "primary_batch_id" UUID,
    "searched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traceability_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_mobile_devices" (
    "id" UUID NOT NULL,
    "device_code" TEXT NOT NULL,
    "device_name" TEXT NOT NULL,
    "device_type" TEXT NOT NULL DEFAULT 'HANDHELD',
    "manufacturer" TEXT,
    "model_number" TEXT,
    "serial_number" TEXT,
    "android_version" TEXT,
    "assigned_operator_id" UUID,
    "assigned_operator_name" TEXT,
    "plant_id" UUID,
    "plant_code" TEXT,
    "production_line_id" UUID,
    "production_line_code" TEXT,
    "work_center_id" UUID,
    "work_center_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "battery_percent" INTEGER NOT NULL DEFAULT 100,
    "connectivity_status" TEXT NOT NULL DEFAULT 'ONLINE',
    "last_known_location" TEXT,
    "is_encrypted" BOOLEAN NOT NULL DEFAULT true,
    "remote_lock_requested" BOOLEAN NOT NULL DEFAULT false,
    "remote_wipe_requested" BOOLEAN NOT NULL DEFAULT false,
    "last_sync_at" TIMESTAMP(3),
    "pending_transactions" INTEGER NOT NULL DEFAULT 0,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_mobile_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_device_sessions" (
    "id" UUID NOT NULL,
    "session_code" TEXT NOT NULL,
    "device_id" UUID NOT NULL,
    "device_code" TEXT NOT NULL,
    "operator_id" UUID NOT NULL,
    "operator_code" TEXT NOT NULL,
    "operator_name" TEXT NOT NULL,
    "plant_id" UUID,
    "plant_code" TEXT,
    "production_line_id" UUID,
    "production_line_code" TEXT,
    "work_center_id" UUID,
    "work_center_code" TEXT,
    "shift_code" TEXT,
    "login_method" TEXT NOT NULL,
    "jwt_token" TEXT,
    "refresh_token" TEXT,
    "login_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logout_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_device_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_device_tokens" (
    "id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "device_code" TEXT NOT NULL,
    "token_type" TEXT NOT NULL,
    "token_value" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3),
    "unregistered_at" TIMESTAMP(3),

    CONSTRAINT "production_device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_labels" (
    "id" UUID NOT NULL,
    "label_code" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT NOT NULL,
    "product_id" UUID,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "label_type" TEXT NOT NULL,
    "qr_code" TEXT NOT NULL,
    "barcode_value" TEXT NOT NULL,
    "barcode_type" TEXT NOT NULL DEFAULT 'CODE_128',
    "label_data" TEXT NOT NULL,
    "manufacturing_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "best_before_date" TIMESTAMP(3),
    "quantity" DECIMAL(18,4) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "recipe_code" TEXT,
    "recipe_version" TEXT,
    "quality_grade" TEXT,
    "print_count" INTEGER NOT NULL DEFAULT 0,
    "last_printed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_label_print_jobs" (
    "id" UUID NOT NULL,
    "job_code" TEXT NOT NULL,
    "label_id" UUID NOT NULL,
    "label_code" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "printer_type" TEXT NOT NULL,
    "printer_name" TEXT NOT NULL,
    "printer_address" TEXT,
    "copies" INTEGER NOT NULL DEFAULT 1,
    "label_size" TEXT NOT NULL DEFAULT '4x6',
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "print_started_at" TIMESTAMP(3),
    "print_completed_at" TIMESTAMP(3),
    "print_duration_ms" INTEGER,
    "within_target" BOOLEAN NOT NULL DEFAULT true,
    "operator_id" UUID,
    "operator_name" TEXT,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_label_print_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_offline_queue" (
    "id" UUID NOT NULL,
    "transaction_code" TEXT NOT NULL,
    "device_id" UUID NOT NULL,
    "device_code" TEXT NOT NULL,
    "operator_id" UUID NOT NULL,
    "operator_code" TEXT NOT NULL,
    "operator_name" TEXT NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "work_order_id" UUID,
    "work_order_number" TEXT,
    "batch_id" UUID,
    "batch_number" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_SYNC',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "last_attempt_at" TIMESTAMP(3),
    "synced_at" TIMESTAMP(3),
    "conflict_reason" TEXT,
    "conflict_resolution" TEXT,
    "offline_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_offline_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_sync_history" (
    "id" UUID NOT NULL,
    "sync_code" TEXT NOT NULL,
    "device_id" UUID NOT NULL,
    "device_code" TEXT NOT NULL,
    "operator_id" UUID,
    "operator_code" TEXT,
    "sync_direction" TEXT NOT NULL,
    "total_transactions" INTEGER NOT NULL DEFAULT 0,
    "successful_syncs" INTEGER NOT NULL DEFAULT 0,
    "failed_syncs" INTEGER NOT NULL DEFAULT 0,
    "conflict_count" INTEGER NOT NULL DEFAULT 0,
    "sync_started_at" TIMESTAMP(3) NOT NULL,
    "sync_completed_at" TIMESTAMP(3),
    "sync_duration_ms" INTEGER,
    "within_target" BOOLEAN NOT NULL DEFAULT true,
    "network_type" TEXT,
    "payload_size_kb" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_sync_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_quality_checks" (
    "id" UUID NOT NULL,
    "check_code" TEXT NOT NULL,
    "work_order_id" UUID,
    "work_order_number" TEXT,
    "production_order_id" UUID,
    "production_order_number" TEXT,
    "batch_id" UUID,
    "batch_number" TEXT,
    "check_type" TEXT NOT NULL,
    "check_stage" TEXT NOT NULL,
    "measured_value" DECIMAL(10,3),
    "target_value" DECIMAL(10,3),
    "min_value" DECIMAL(10,3),
    "max_value" DECIMAL(10,3),
    "unit" TEXT,
    "result" TEXT NOT NULL DEFAULT 'PASS',
    "remarks" TEXT,
    "checked_by_id" UUID,
    "checked_by_name" TEXT,
    "device_id" UUID,
    "device_code" TEXT,
    "scanned_at" TIMESTAMP(3),
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_quality_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_orders" (
    "id" UUID NOT NULL,
    "packaging_order_number" TEXT NOT NULL,
    "production_batch_id" UUID,
    "production_batch_number" TEXT,
    "production_order_number" TEXT,
    "product_id" UUID,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "packaging_type" TEXT NOT NULL,
    "planned_quantity" DECIMAL(18,4) NOT NULL,
    "completed_quantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "rejected_quantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'PCS',
    "unit_per_box" INTEGER NOT NULL DEFAULT 12,
    "box_per_carton" INTEGER NOT NULL DEFAULT 10,
    "carton_per_pallet" INTEGER NOT NULL DEFAULT 40,
    "planned_start" TIMESTAMP(3),
    "planned_finish" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3),
    "actual_finish" TIMESTAMP(3),
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "status_reason" TEXT,
    "operator_id" UUID,
    "operator_name" TEXT,
    "packaging_line_code" TEXT,
    "work_center_code" TEXT,
    "quality_status" TEXT NOT NULL DEFAULT 'PENDING',
    "warehouse_transfer_id" UUID,
    "warehouse_receipt_number" TEXT,
    "transferred_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packaging_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_order_lines" (
    "id" UUID NOT NULL,
    "packaging_order_id" UUID NOT NULL,
    "packaging_order_number" TEXT NOT NULL,
    "material_type" TEXT NOT NULL,
    "material_code" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "planned_qty" DECIMAL(18,4) NOT NULL,
    "consumed_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "wastage_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'PCS',
    "unit_cost" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "material_batch_number" TEXT,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packaging_order_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_levels" (
    "id" UUID NOT NULL,
    "level_code" TEXT NOT NULL,
    "level_name" TEXT NOT NULL,
    "level_number" INTEGER NOT NULL,
    "child_per_parent" INTEGER NOT NULL,
    "length_cm" DECIMAL(8,2),
    "width_cm" DECIMAL(8,2),
    "height_cm" DECIMAL(8,2),
    "empty_weight_kg" DECIMAL(8,3),
    "barcode_type" TEXT NOT NULL DEFAULT 'CODE_128',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packaging_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_units" (
    "id" UUID NOT NULL,
    "package_id" TEXT NOT NULL,
    "level_number" INTEGER NOT NULL DEFAULT 1,
    "parent_package_id" UUID,
    "parent_package_number" TEXT,
    "packaging_order_id" UUID NOT NULL,
    "packaging_order_number" TEXT NOT NULL,
    "product_id" UUID,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL DEFAULT 1,
    "uom" TEXT NOT NULL DEFAULT 'PCS',
    "net_weight_kg" DECIMAL(10,3),
    "gross_weight_kg" DECIMAL(10,3),
    "barcode" TEXT NOT NULL,
    "qr_code" TEXT,
    "label_printed" BOOLEAN NOT NULL DEFAULT false,
    "label_printed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PACKED',
    "packed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_cartons" (
    "id" UUID NOT NULL,
    "carton_number" TEXT NOT NULL,
    "level_number" INTEGER NOT NULL DEFAULT 4,
    "parent_pallet_id" UUID,
    "parent_pallet_number" TEXT,
    "packaging_order_id" UUID NOT NULL,
    "packaging_order_number" TEXT NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "boxes_count" INTEGER NOT NULL DEFAULT 0,
    "units_count" INTEGER NOT NULL DEFAULT 0,
    "net_weight_kg" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "gross_weight_kg" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "length_cm" DECIMAL(8,2),
    "width_cm" DECIMAL(8,2),
    "height_cm" DECIMAL(8,2),
    "barcode" TEXT NOT NULL,
    "qr_code" TEXT,
    "label_printed" BOOLEAN NOT NULL DEFAULT false,
    "label_printed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "sealed_at" TIMESTAMP(3),
    "packed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packaging_cartons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_pallets" (
    "id" UUID NOT NULL,
    "pallet_number" TEXT NOT NULL,
    "level_number" INTEGER NOT NULL DEFAULT 5,
    "packaging_order_id" UUID NOT NULL,
    "packaging_order_number" TEXT NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "cartons_count" INTEGER NOT NULL DEFAULT 0,
    "boxes_count" INTEGER NOT NULL DEFAULT 0,
    "units_count" INTEGER NOT NULL DEFAULT 0,
    "net_weight_kg" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "gross_weight_kg" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "length_cm" DECIMAL(8,2),
    "width_cm" DECIMAL(8,2),
    "height_cm" DECIMAL(8,2),
    "destination_warehouse_id" UUID,
    "destination_warehouse_name" TEXT,
    "destination_bin_code" TEXT,
    "barcode" TEXT NOT NULL,
    "qr_code" TEXT,
    "label_printed" BOOLEAN NOT NULL DEFAULT false,
    "label_printed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'BUILDING',
    "sealed_at" TIMESTAMP(3),
    "packed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packaging_pallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_label_jobs" (
    "id" UUID NOT NULL,
    "job_code" TEXT NOT NULL,
    "packaging_order_id" UUID NOT NULL,
    "packaging_order_number" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "package_id" UUID,
    "package_number" TEXT NOT NULL,
    "package_level" TEXT NOT NULL,
    "label_type" TEXT NOT NULL,
    "label_data" TEXT NOT NULL,
    "qr_code" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "barcode_type" TEXT NOT NULL DEFAULT 'CODE_128',
    "printer_type" TEXT NOT NULL DEFAULT 'BLUETOOTH',
    "printer_name" TEXT,
    "copies" INTEGER NOT NULL DEFAULT 1,
    "print_duration_ms" INTEGER,
    "within_target" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "print_started_at" TIMESTAMP(3),
    "print_completed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packaging_label_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_quality_checks" (
    "id" UUID NOT NULL,
    "check_code" TEXT NOT NULL,
    "packaging_order_id" UUID NOT NULL,
    "packaging_order_number" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "package_id" UUID,
    "package_number" TEXT,
    "check_type" TEXT NOT NULL,
    "measured_value" TEXT,
    "target_value" TEXT,
    "result" TEXT NOT NULL DEFAULT 'PASS',
    "remarks" TEXT,
    "checked_by_id" UUID,
    "checked_by_name" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packaging_quality_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finished_goods_confirmations" (
    "id" UUID NOT NULL,
    "fg_confirmation_code" TEXT NOT NULL,
    "packaging_order_id" UUID,
    "packaging_order_number" TEXT,
    "production_batch_number" TEXT NOT NULL,
    "product_id" UUID,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "fg_quantity" DECIMAL(18,4) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'PCS',
    "units_count" INTEGER NOT NULL DEFAULT 0,
    "boxes_count" INTEGER NOT NULL DEFAULT 0,
    "cartons_count" INTEGER NOT NULL DEFAULT 0,
    "pallets_count" INTEGER NOT NULL DEFAULT 0,
    "total_net_weight_kg" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "quality_status" TEXT NOT NULL DEFAULT 'PASSED',
    "quality_approved_at" TIMESTAMP(3),
    "quality_approved_by" TEXT,
    "inventory_posted" BOOLEAN NOT NULL DEFAULT false,
    "inventory_posted_at" TIMESTAMP(3),
    "inventory_transaction_number" TEXT,
    "warehouse_receipt_number" TEXT,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "putaway_task_id" UUID,
    "putaway_task_number" TEXT,
    "transferred_at" TIMESTAMP(3),
    "transfer_duration_ms" INTEGER,
    "within_target" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "finished_goods_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_cost_summaries" (
    "id" UUID NOT NULL,
    "packaging_order_id" UUID NOT NULL,
    "packaging_order_number" TEXT NOT NULL,
    "material_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "labor_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "machine_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "energy_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "overhead_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_packaging_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cost_per_unit" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "cost_per_kg" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "production_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "final_product_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "final_cost_per_unit" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packaging_cost_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_costs" (
    "id" UUID NOT NULL,
    "cost_code" TEXT NOT NULL,
    "production_order_id" UUID,
    "production_order_number" TEXT,
    "production_batch_number" TEXT,
    "packaging_order_number" TEXT,
    "product_id" UUID,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "cost_type" TEXT NOT NULL,
    "material_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "packaging_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "labor_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "machine_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "utility_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "overhead_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "quality_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "warehouse_transfer_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_manufacturing_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "output_quantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "cost_per_unit" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "cost_per_kg" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "planned_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "actual_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "variance_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "variance_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "variance_status" TEXT NOT NULL DEFAULT 'WITHIN_THRESHOLD',
    "journal_posted" BOOLEAN NOT NULL DEFAULT false,
    "journal_entry_number" TEXT,
    "journal_posted_at" TIMESTAMP(3),
    "financial_period" TEXT,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recalculated_at" TIMESTAMP(3),
    "calculation_duration_ms" INTEGER,
    "within_target" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_elements" (
    "id" UUID NOT NULL,
    "production_cost_id" UUID NOT NULL,
    "cost_code" TEXT NOT NULL,
    "element_type" TEXT NOT NULL,
    "element_code" TEXT NOT NULL,
    "element_name" TEXT NOT NULL,
    "planned_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "actual_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "variance_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "variance_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "cost_driver" TEXT,
    "driver_quantity" DECIMAL(14,4),
    "rate_per_driver" DECIMAL(12,4),
    "source" TEXT NOT NULL DEFAULT 'CALCULATED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_elements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_transactions" (
    "id" UUID NOT NULL,
    "transaction_number" TEXT NOT NULL,
    "production_cost_id" UUID,
    "transaction_type" TEXT NOT NULL,
    "element_type" TEXT NOT NULL,
    "element_code" TEXT NOT NULL,
    "element_name" TEXT NOT NULL,
    "debit_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "credit_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "debit_account_code" TEXT,
    "credit_account_code" TEXT,
    "gl_posted" BOOLEAN NOT NULL DEFAULT false,
    "gl_posted_at" TIMESTAMP(3),
    "reference_type" TEXT,
    "reference_number" TEXT,
    "remarks" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labor_cost_allocations" (
    "id" UUID NOT NULL,
    "allocation_code" TEXT NOT NULL,
    "production_order_number" TEXT,
    "production_batch_number" TEXT,
    "work_order_number" TEXT,
    "operator_id" UUID,
    "operator_code" TEXT NOT NULL,
    "operator_name" TEXT NOT NULL,
    "shift_code" TEXT,
    "labor_type" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "hours_worked" DECIMAL(8,3) NOT NULL DEFAULT 0,
    "hourly_rate" DECIMAL(10,2) NOT NULL,
    "overtime_rate" DECIMAL(10,2),
    "regular_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "overtime_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "product_sku" TEXT,
    "product_name" TEXT,
    "work_center_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labor_cost_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_cost_allocations" (
    "id" UUID NOT NULL,
    "allocation_code" TEXT NOT NULL,
    "production_order_number" TEXT,
    "production_batch_number" TEXT,
    "work_order_number" TEXT,
    "machine_id" UUID,
    "machine_code" TEXT NOT NULL,
    "machine_name" TEXT NOT NULL,
    "work_center_code" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "runtime_hours" DECIMAL(8,3) NOT NULL DEFAULT 0,
    "setup_hours" DECIMAL(8,3) NOT NULL DEFAULT 0,
    "idle_hours" DECIMAL(8,3) NOT NULL DEFAULT 0,
    "downtime_hours" DECIMAL(8,3) NOT NULL DEFAULT 0,
    "machine_cost_rate" DECIMAL(10,2) NOT NULL,
    "runtime_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "setup_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "maintenance_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machine_cost_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utility_costs" (
    "id" UUID NOT NULL,
    "utility_code" TEXT NOT NULL,
    "production_order_number" TEXT,
    "production_batch_number" TEXT,
    "plant_code" TEXT NOT NULL,
    "utility_type" TEXT NOT NULL,
    "consumed_quantity" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "unit_of_measure" TEXT NOT NULL,
    "rate_per_unit" DECIMAL(10,4) NOT NULL,
    "total_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "allocation_method" TEXT NOT NULL DEFAULT 'MACHINE_HOURS',
    "allocated_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utility_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overhead_allocations" (
    "id" UUID NOT NULL,
    "allocation_code" TEXT NOT NULL,
    "production_order_number" TEXT,
    "production_batch_number" TEXT,
    "plant_code" TEXT NOT NULL,
    "overhead_type" TEXT NOT NULL,
    "description" TEXT,
    "total_overhead_cost" DECIMAL(14,2) NOT NULL,
    "allocated_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "allocation_method" TEXT NOT NULL,
    "allocation_base" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "allocation_rate" DECIMAL(12,6) NOT NULL DEFAULT 0,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "overhead_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_costs" (
    "id" UUID NOT NULL,
    "batch_cost_code" TEXT NOT NULL,
    "production_batch_number" TEXT NOT NULL,
    "production_order_number" TEXT,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_quantity" DECIMAL(18,4) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "material_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "packaging_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "labor_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "machine_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "utility_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "overhead_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "quality_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_batch_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cost_per_unit" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "cost_per_kg" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "planned_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "actual_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "variance_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "variance_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "variance_status" TEXT NOT NULL DEFAULT 'WITHIN_THRESHOLD',
    "selling_price_per_unit" DECIMAL(12,2),
    "gross_margin_per_unit" DECIMAL(12,2),
    "gross_margin_percent" DECIMAL(6,2),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculation_duration_ms" INTEGER,
    "within_target" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_variances" (
    "id" UUID NOT NULL,
    "batch_cost_id" UUID NOT NULL,
    "production_batch_number" TEXT NOT NULL,
    "variance_type" TEXT NOT NULL,
    "standard_cost" DECIMAL(14,2) NOT NULL,
    "actual_cost" DECIMAL(14,2) NOT NULL,
    "variance_amount" DECIMAL(14,2) NOT NULL,
    "variance_percent" DECIMAL(6,2) NOT NULL,
    "variance_direction" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'LOW',
    "root_cause_category" TEXT,
    "root_cause_description" TEXT,
    "corrective_action" TEXT,
    "action_owner" TEXT,
    "action_status" TEXT NOT NULL DEFAULT 'OPEN',
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_variances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturing_journals" (
    "id" UUID NOT NULL,
    "journal_entry_number" TEXT NOT NULL,
    "production_order_number" TEXT,
    "production_batch_number" TEXT,
    "packaging_order_number" TEXT,
    "journal_type" TEXT NOT NULL,
    "journal_date" TIMESTAMP(3) NOT NULL,
    "total_debit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_credit" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "is_balanced" BOOLEAN NOT NULL DEFAULT true,
    "gl_posted" BOOLEAN NOT NULL DEFAULT false,
    "gl_posted_at" TIMESTAMP(3),
    "gl_posting_duration_ms" INTEGER,
    "within_target" BOOLEAN NOT NULL DEFAULT true,
    "financial_period" TEXT NOT NULL,
    "description" TEXT,
    "reference_type" TEXT,
    "reference_number" TEXT,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manufacturing_journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturing_journal_lines" (
    "id" UUID NOT NULL,
    "journal_id" UUID NOT NULL,
    "line_no" INTEGER NOT NULL,
    "account_code" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_type" TEXT NOT NULL,
    "debit_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "credit_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cost_center_code" TEXT,
    "cost_center_name" TEXT,
    "line_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manufacturing_journal_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "industrial_machines" (
    "id" UUID NOT NULL,
    "machine_code" TEXT NOT NULL,
    "machine_name" TEXT NOT NULL,
    "equipment_category" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model_number" TEXT,
    "serial_number" TEXT,
    "firmware_version" TEXT,
    "plant_id" UUID,
    "plant_code" TEXT,
    "production_line_id" UUID,
    "production_line_code" TEXT,
    "work_center_id" UUID,
    "work_center_code" TEXT,
    "plc_type" TEXT,
    "communication_protocol" TEXT,
    "ip_address" TEXT,
    "port" INTEGER,
    "opc_endpoint" TEXT,
    "modbus_unit_id" INTEGER,
    "installation_date" TIMESTAMP(3),
    "warranty_expiry" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OFFLINE',
    "status_changed_at" TIMESTAMP(3),
    "iot_gateway_id" UUID,
    "is_connected" BOOLEAN NOT NULL DEFAULT false,
    "last_heartbeat_at" TIMESTAMP(3),
    "current_batch_number" TEXT,
    "current_work_order_number" TEXT,
    "operator_id" UUID,
    "operator_name" TEXT,
    "total_operating_hours" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "total_cycles" INTEGER NOT NULL DEFAULT 0,
    "last_maintenance_at" TIMESTAMP(3),
    "next_maintenance_due" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industrial_machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_models" (
    "id" UUID NOT NULL,
    "model_code" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "capacity_per_hour" DECIMAL(12,3),
    "capacity_uom" TEXT,
    "power_kw" DECIMAL(8,2),
    "voltage" TEXT,
    "recommended_maintenance_hours" INTEGER NOT NULL DEFAULT 500,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machine_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iot_gateways" (
    "id" UUID NOT NULL,
    "gateway_code" TEXT NOT NULL,
    "gateway_name" TEXT NOT NULL,
    "plant_id" UUID,
    "plant_code" TEXT NOT NULL,
    "plant_name" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "mac_address" TEXT,
    "firmware_version" TEXT,
    "max_devices" INTEGER NOT NULL DEFAULT 50,
    "connected_devices" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ONLINE',
    "last_heartbeat_at" TIMESTAMP(3),
    "events_per_minute" INTEGER NOT NULL DEFAULT 0,
    "avg_processing_ms" INTEGER NOT NULL DEFAULT 0,
    "installed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iot_gateways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iot_connections" (
    "id" UUID NOT NULL,
    "connection_code" TEXT NOT NULL,
    "gateway_id" UUID NOT NULL,
    "gateway_code" TEXT NOT NULL,
    "machine_id" UUID NOT NULL,
    "machine_code" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "authentication_token" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONNECTED',
    "connected_at" TIMESTAMP(3),
    "disconnected_at" TIMESTAMP(3),
    "last_data_received_at" TIMESTAMP(3),
    "messages_received" INTEGER NOT NULL DEFAULT 0,
    "messages_failed" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iot_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_heartbeats" (
    "id" UUID NOT NULL,
    "gateway_id" UUID NOT NULL,
    "gateway_code" TEXT NOT NULL,
    "heartbeat_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cpu_percent" DECIMAL(5,2),
    "memory_percent" DECIMAL(5,2),
    "disk_percent" DECIMAL(5,2),
    "temperature" DECIMAL(5,2),
    "uptime_seconds" INTEGER,
    "network_latency_ms" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'HEALTHY',

    CONSTRAINT "device_heartbeats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_runtime_events" (
    "id" UUID NOT NULL,
    "event_code" TEXT NOT NULL,
    "machine_id" UUID NOT NULL,
    "machine_code" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "reason_code" TEXT,
    "reason_description" TEXT,
    "event_start_time" TIMESTAMP(3) NOT NULL,
    "event_end_time" TIMESTAMP(3),
    "duration_minutes" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'PLC',
    "operator_id" UUID,
    "operator_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machine_runtime_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_counters" (
    "id" UUID NOT NULL,
    "counter_code" TEXT NOT NULL,
    "machine_id" UUID NOT NULL,
    "machine_code" TEXT NOT NULL,
    "production_batch_number" TEXT,
    "work_order_number" TEXT,
    "counter_type" TEXT NOT NULL,
    "current_value" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "previous_value" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "delta_value" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'PCS',
    "source" TEXT NOT NULL DEFAULT 'PLC',
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machine_counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counter_history" (
    "id" UUID NOT NULL,
    "counter_id" UUID NOT NULL,
    "recorded_value" DECIMAL(14,3) NOT NULL,
    "delta_value" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "counter_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_readings" (
    "id" UUID NOT NULL,
    "reading_code" TEXT NOT NULL,
    "machine_id" UUID NOT NULL,
    "machine_code" TEXT NOT NULL,
    "sensor_type" TEXT NOT NULL,
    "sensor_name" TEXT NOT NULL,
    "sensor_location" TEXT,
    "value" DECIMAL(12,3) NOT NULL,
    "unit_of_measure" TEXT NOT NULL,
    "min_value" DECIMAL(12,3),
    "max_value" DECIMAL(12,3),
    "is_alert" BOOLEAN NOT NULL DEFAULT false,
    "alert_level" TEXT,
    "source" TEXT NOT NULL DEFAULT 'PLC',
    "reading_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_alerts" (
    "id" UUID NOT NULL,
    "alert_code" TEXT NOT NULL,
    "machine_id" UUID NOT NULL,
    "machine_code" TEXT NOT NULL,
    "sensor_reading_id" UUID,
    "alert_type" TEXT NOT NULL,
    "sensor_type" TEXT NOT NULL,
    "measured_value" DECIMAL(12,3) NOT NULL,
    "threshold_value" DECIMAL(12,3),
    "unit_of_measure" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "acknowledged_by" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "notification_sent" BOOLEAN NOT NULL DEFAULT false,
    "raised_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_triggers" (
    "id" UUID NOT NULL,
    "trigger_code" TEXT NOT NULL,
    "machine_id" UUID NOT NULL,
    "machine_code" TEXT NOT NULL,
    "trigger_type" TEXT NOT NULL,
    "trigger_description" TEXT NOT NULL,
    "threshold_value" DECIMAL(14,3),
    "current_value" DECIMAL(14,3),
    "threshold_unit" TEXT,
    "maintenance_work_order_number" TEXT,
    "technician_id" UUID,
    "technician_name" TEXT,
    "assigned_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "repair_notes" TEXT,
    "machine_back_online_at" TIMESTAMP(3),
    "downtime_minutes" INTEGER,
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oee_results" (
    "id" UUID NOT NULL,
    "oee_code" TEXT NOT NULL,
    "scope_type" TEXT NOT NULL,
    "scope_id" UUID,
    "scope_code" TEXT NOT NULL,
    "scope_name" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "shift_code" TEXT,
    "planned_time_min" INTEGER NOT NULL,
    "downtime_min" INTEGER NOT NULL DEFAULT 0,
    "available_time_min" INTEGER NOT NULL,
    "availability_percent" DECIMAL(6,2) NOT NULL,
    "ideal_cycle_time_sec" DECIMAL(10,3),
    "total_cycles" INTEGER NOT NULL DEFAULT 0,
    "actual_output" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "theoretical_output" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "performance_percent" DECIMAL(6,2) NOT NULL,
    "good_pieces" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "rejected_pieces" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "reworked_pieces" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "quality_percent" DECIMAL(6,2) NOT NULL,
    "oee_percent" DECIMAL(6,2) NOT NULL,
    "oee_target" DECIMAL(6,2) NOT NULL DEFAULT 85.00,
    "variance_from_target" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "oee_status" TEXT NOT NULL DEFAULT 'WITHIN_TARGET',
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculation_duration_ms" INTEGER,
    "within_target" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oee_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oee_history" (
    "id" UUID NOT NULL,
    "scope_type" TEXT NOT NULL,
    "scope_code" TEXT NOT NULL,
    "scope_name" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "period_type" TEXT NOT NULL,
    "availability_percent" DECIMAL(6,2) NOT NULL,
    "performance_percent" DECIMAL(6,2) NOT NULL,
    "quality_percent" DECIMAL(6,2) NOT NULL,
    "oee_percent" DECIMAL(6,2) NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oee_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oee_targets" (
    "id" UUID NOT NULL,
    "target_code" TEXT NOT NULL,
    "scope_type" TEXT NOT NULL,
    "scope_code" TEXT NOT NULL,
    "scope_name" TEXT NOT NULL,
    "availability_target" DECIMAL(6,2) NOT NULL DEFAULT 95.00,
    "performance_target" DECIMAL(6,2) NOT NULL DEFAULT 95.00,
    "quality_target" DECIMAL(6,2) NOT NULL DEFAULT 99.00,
    "oee_target" DECIMAL(6,2) NOT NULL DEFAULT 85.00,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oee_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_kpis" (
    "id" UUID NOT NULL,
    "kpi_code" TEXT NOT NULL,
    "scope_type" TEXT NOT NULL,
    "scope_code" TEXT NOT NULL,
    "scope_name" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "planned_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "actual_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "target_achievement" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "good_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "scrap_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "rework_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "yield_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "scrap_rate" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "rework_rate" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "cycle_time_sec" DECIMAL(10,3),
    "setup_time_min" INTEGER NOT NULL DEFAULT 0,
    "downtime_min" INTEGER NOT NULL DEFAULT 0,
    "runtime_min" INTEGER NOT NULL DEFAULT 0,
    "throughput_per_hour" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_operator_scores" (
    "id" UUID NOT NULL,
    "score_code" TEXT NOT NULL,
    "operator_id" UUID NOT NULL,
    "operator_code" TEXT NOT NULL,
    "operator_name" TEXT NOT NULL,
    "role" TEXT,
    "period_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "units_produced" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "tasks_completed" INTEGER NOT NULL DEFAULT 0,
    "batches_completed" INTEGER NOT NULL DEFAULT 0,
    "machine_time_min" INTEGER NOT NULL DEFAULT 0,
    "idle_time_min" INTEGER NOT NULL DEFAULT 0,
    "attendance_hours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "overtime_hours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "quality_score" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "safety_score" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "overall_score" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "efficiency_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "training_needed" BOOLEAN NOT NULL DEFAULT false,
    "certification_expiry" TIMESTAMP(3),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_operator_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downtime_events" (
    "id" UUID NOT NULL,
    "event_code" TEXT NOT NULL,
    "machine_code" TEXT NOT NULL,
    "machine_name" TEXT NOT NULL,
    "production_line_code" TEXT,
    "production_batch_number" TEXT,
    "work_order_number" TEXT,
    "reason_code" TEXT NOT NULL,
    "reason_category" TEXT NOT NULL,
    "reason_description" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "duration_min" INTEGER,
    "shift_code" TEXT,
    "operator_id" UUID,
    "operator_name" TEXT,
    "lost_output_qty" DECIMAL(14,3),
    "lost_output_uom" TEXT,
    "estimated_cost" DECIMAL(14,2),
    "resolution_notes" TEXT,
    "resolved_by_id" UUID,
    "resolved_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "downtime_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downtime_reasons" (
    "id" UUID NOT NULL,
    "reason_code" TEXT NOT NULL,
    "reason_name" TEXT NOT NULL,
    "reason_category" TEXT NOT NULL,
    "description" TEXT,
    "is_planned" BOOLEAN NOT NULL DEFAULT false,
    "impact_severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "downtime_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturing_heatmaps" (
    "id" UUID NOT NULL,
    "heatmap_code" TEXT NOT NULL,
    "plant_code" TEXT NOT NULL,
    "production_line_code" TEXT,
    "heatmap_type" TEXT NOT NULL,
    "cell_type" TEXT NOT NULL,
    "cell_code" TEXT NOT NULL,
    "cell_name" TEXT NOT NULL,
    "intensity_percent" INTEGER NOT NULL,
    "metric_value" DECIMAL(10,2),
    "metric_unit" TEXT,
    "status_indicator" TEXT NOT NULL DEFAULT 'NORMAL',
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manufacturing_heatmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_dashboard_snapshots" (
    "id" UUID NOT NULL,
    "snapshot_code" TEXT NOT NULL,
    "scope_type" TEXT NOT NULL,
    "scope_code" TEXT NOT NULL,
    "scope_name" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "factory_health_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "factory_health_status" TEXT NOT NULL DEFAULT 'HEALTHY',
    "total_production_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "production_uom" TEXT NOT NULL DEFAULT 'KG',
    "target_achievement" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "avg_availability" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "avg_performance" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "avg_quality" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "avg_oee" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "total_machines" INTEGER NOT NULL DEFAULT 0,
    "running_machines" INTEGER NOT NULL DEFAULT 0,
    "faulted_machines" INTEGER NOT NULL DEFAULT 0,
    "total_operators" INTEGER NOT NULL DEFAULT 0,
    "active_operators" INTEGER NOT NULL DEFAULT 0,
    "labor_efficiency" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "first_pass_yield" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "scrap_rate" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "total_production_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cost_per_kg" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cost_variance_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "total_downtime_min" INTEGER NOT NULL DEFAULT 0,
    "top_downtime_reason" TEXT,
    "active_alerts" INTEGER NOT NULL DEFAULT 0,
    "critical_alerts" INTEGER NOT NULL DEFAULT 0,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generation_duration_ms" INTEGER,
    "within_target" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "executive_dashboard_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waste_categories" (
    "id" UUID NOT NULL,
    "category_code" TEXT NOT NULL,
    "category_name" TEXT NOT NULL,
    "waste_type" TEXT NOT NULL,
    "description" TEXT,
    "default_disposition" TEXT NOT NULL DEFAULT 'DISPOSE',
    "is_recoverable" BOOLEAN NOT NULL DEFAULT false,
    "is_by_product_source" BOOLEAN NOT NULL DEFAULT false,
    "cost_impact" TEXT NOT NULL DEFAULT 'MATERIAL_LOSS',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waste_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waste_records" (
    "id" UUID NOT NULL,
    "record_code" TEXT NOT NULL,
    "production_batch_number" TEXT,
    "production_order_number" TEXT,
    "work_order_number" TEXT,
    "packaging_order_number" TEXT,
    "product_id" UUID,
    "product_sku" TEXT,
    "product_name" TEXT,
    "category_id" UUID,
    "category_code" TEXT NOT NULL,
    "category_name" TEXT NOT NULL,
    "waste_type" TEXT NOT NULL,
    "loss_reason" TEXT NOT NULL,
    "loss_description" TEXT,
    "input_qty" DECIMAL(14,3),
    "lost_qty" DECIMAL(14,3) NOT NULL,
    "recovered_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "material_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "labor_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "machine_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "energy_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "packaging_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_waste_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "disposition" TEXT NOT NULL DEFAULT 'DISPOSE',
    "disposition_reason" TEXT,
    "plant_code" TEXT,
    "production_line_code" TEXT,
    "work_center_code" TEXT,
    "machine_code" TEXT,
    "operator_id" UUID,
    "operator_name" TEXT,
    "shift_code" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waste_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mfg_scrap_records" (
    "id" UUID NOT NULL,
    "scrap_code" TEXT NOT NULL,
    "production_batch_number" TEXT,
    "waste_record_id" UUID,
    "product_id" UUID,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "scrap_reason" TEXT NOT NULL,
    "scrap_description" TEXT,
    "scrap_qty" DECIMAL(14,3) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "scrap_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "disposition" TEXT NOT NULL DEFAULT 'DESTROY',
    "disposition_notes" TEXT,
    "plant_code" TEXT NOT NULL,
    "production_line_code" TEXT,
    "machine_code" TEXT,
    "operator_id" UUID,
    "operator_name" TEXT,
    "shift_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECORDED',
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mfg_scrap_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mfg_scrap_inventory" (
    "id" UUID NOT NULL,
    "inventory_code" TEXT NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "total_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "total_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "plant_code" TEXT NOT NULL,
    "warehouse_code" TEXT,
    "bin_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUARANTINE',
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mfg_scrap_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yield_results" (
    "id" UUID NOT NULL,
    "yield_code" TEXT NOT NULL,
    "production_batch_number" TEXT NOT NULL,
    "production_order_number" TEXT,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "recipe_code" TEXT,
    "recipe_version" TEXT,
    "input_material_qty" DECIMAL(14,3) NOT NULL,
    "expected_output_qty" DECIMAL(14,3) NOT NULL,
    "actual_output_qty" DECIMAL(14,3) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "expected_yield_percent" DECIMAL(6,2) NOT NULL,
    "actual_yield_percent" DECIMAL(6,2) NOT NULL,
    "yield_variance_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "yield_loss_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "yield_loss_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "cooking_loss_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "moisture_loss_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "trimming_loss_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "scrap_loss_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "rework_loss_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "yield_status" TEXT NOT NULL DEFAULT 'WITHIN_THRESHOLD',
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculation_duration_ms" INTEGER,
    "within_target" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yield_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yield_targets" (
    "id" UUID NOT NULL,
    "target_code" TEXT NOT NULL,
    "product_sku" TEXT,
    "product_name" TEXT,
    "recipe_code" TEXT,
    "recipe_version" TEXT,
    "expected_yield_percent" DECIMAL(6,2) NOT NULL,
    "minimum_yield_percent" DECIMAL(6,2) NOT NULL,
    "critical_yield_percent" DECIMAL(6,2) NOT NULL,
    "max_cooking_loss_percent" DECIMAL(6,2) NOT NULL DEFAULT 5,
    "max_moisture_loss_percent" DECIMAL(6,2) NOT NULL DEFAULT 3,
    "max_scrap_percent" DECIMAL(6,2) NOT NULL DEFAULT 2,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yield_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "by_products" (
    "id" UUID NOT NULL,
    "by_product_code" TEXT NOT NULL,
    "source_batch_number" TEXT NOT NULL,
    "source_product_sku" TEXT NOT NULL,
    "source_product_name" TEXT NOT NULL,
    "by_product_sku" TEXT NOT NULL,
    "by_product_name" TEXT NOT NULL,
    "by_product_type" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "unit_value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "disposition" TEXT NOT NULL DEFAULT 'INTERNAL_REUSE',
    "disposition_notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "by_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "by_product_inventory" (
    "id" UUID NOT NULL,
    "inventory_code" TEXT NOT NULL,
    "by_product_sku" TEXT NOT NULL,
    "by_product_name" TEXT NOT NULL,
    "by_product_type" TEXT NOT NULL,
    "total_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "available_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "total_value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "plant_code" TEXT NOT NULL,
    "warehouse_code" TEXT,
    "bin_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "by_product_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rework_orders" (
    "id" UUID NOT NULL,
    "rework_order_number" TEXT NOT NULL,
    "source_batch_number" TEXT NOT NULL,
    "source_production_order" TEXT,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "rework_type" TEXT NOT NULL,
    "rework_reason" TEXT NOT NULL,
    "rework_description" TEXT,
    "original_qty" DECIMAL(14,3) NOT NULL,
    "rework_qty" DECIMAL(14,3) NOT NULL,
    "recovered_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "scrapped_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "recipe_adjustment" TEXT,
    "adjusted_recipe_version" TEXT,
    "supervisor_id" UUID,
    "supervisor_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "approval_notes" TEXT,
    "work_center_code" TEXT,
    "operator_id" UUID,
    "operator_name" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "quality_check_status" TEXT NOT NULL DEFAULT 'PENDING',
    "quality_check_notes" TEXT,
    "rework_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rework_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rework_history" (
    "id" UUID NOT NULL,
    "rework_order_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "performed_by_id" UUID,
    "performed_by_name" TEXT,
    "notes" TEXT,
    "event_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rework_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waste_disposals" (
    "id" UUID NOT NULL,
    "disposal_code" TEXT NOT NULL,
    "waste_record_id" UUID,
    "scrap_record_id" UUID,
    "production_batch_number" TEXT,
    "waste_type" TEXT NOT NULL,
    "waste_description" TEXT NOT NULL,
    "disposal_qty" DECIMAL(14,3) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "disposal_method" TEXT NOT NULL,
    "disposal_vendor" TEXT,
    "vendor_license_number" TEXT,
    "disposal_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "authorized_by_id" UUID,
    "authorized_by_name" TEXT,
    "authorized_at" TIMESTAMP(3),
    "authorization_notes" TEXT,
    "certificate_number" TEXT,
    "certificate_url" TEXT,
    "photo_evidence_urls" TEXT,
    "disposal_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waste_disposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sustainability_metrics" (
    "id" UUID NOT NULL,
    "metric_code" TEXT NOT NULL,
    "plant_code" TEXT NOT NULL,
    "plant_name" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "total_food_waste_kg" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "food_waste_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "total_recovered_kg" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "recovery_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "total_recycled_kg" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "recycling_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "water_usage_liters" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "energy_usage_kwh" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "waste_reduction_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "carbon_footprint_kg_co2e" DECIMAL(14,3),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sustainability_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_schedules" (
    "id" UUID NOT NULL,
    "schedule_number" TEXT NOT NULL,
    "plant_code" TEXT NOT NULL,
    "plant_name" TEXT NOT NULL,
    "production_line_code" TEXT,
    "production_line_name" TEXT,
    "schedule_type" TEXT NOT NULL,
    "schedule_date" TIMESTAMP(3) NOT NULL,
    "schedule_start_date" TIMESTAMP(3) NOT NULL,
    "schedule_end_date" TIMESTAMP(3) NOT NULL,
    "planner_id" UUID,
    "planner_name" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parent_schedule_id" UUID,
    "scheduling_method" TEXT NOT NULL DEFAULT 'FINITE_CAPACITY',
    "total_planned_hours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_available_hours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "utilization_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "constraint_violations" INTEGER NOT NULL DEFAULT 0,
    "constraint_warnings" INTEGER NOT NULL DEFAULT 0,
    "optimization_score" DECIMAL(5,2),
    "changeover_count" INTEGER NOT NULL DEFAULT 0,
    "total_changeover_min" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "published_by_id" UUID,
    "published_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_operations" (
    "id" UUID NOT NULL,
    "schedule_id" UUID NOT NULL,
    "schedule_number" TEXT NOT NULL,
    "operation_no" INTEGER NOT NULL,
    "production_order_number" TEXT,
    "work_order_number" TEXT,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_family" TEXT,
    "machine_code" TEXT NOT NULL,
    "machine_name" TEXT NOT NULL,
    "work_center_code" TEXT,
    "shift_code" TEXT NOT NULL,
    "planned_start" TIMESTAMP(3) NOT NULL,
    "planned_end" TIMESTAMP(3) NOT NULL,
    "planned_duration_min" INTEGER NOT NULL,
    "setup_duration_min" INTEGER NOT NULL DEFAULT 0,
    "cleaning_duration_min" INTEGER NOT NULL DEFAULT 0,
    "runtime_duration_min" INTEGER NOT NULL DEFAULT 0,
    "planned_qty" DECIMAL(14,3) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "operator_id" UUID,
    "operator_name" TEXT,
    "changeover_type" TEXT,
    "changeover_from_product" TEXT,
    "constraints_met" BOOLEAN NOT NULL DEFAULT true,
    "constraint_notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_versions" (
    "id" UUID NOT NULL,
    "schedule_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "snapshot_data" TEXT NOT NULL,
    "change_reason" TEXT,
    "utilization_percent" DECIMAL(6,2) NOT NULL,
    "changeover_count" INTEGER NOT NULL,
    "optimization_score" DECIMAL(5,2),
    "created_by_id" UUID,
    "created_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_schedules" (
    "id" UUID NOT NULL,
    "machine_schedule_code" TEXT NOT NULL,
    "schedule_id" UUID,
    "schedule_number" TEXT,
    "machine_code" TEXT NOT NULL,
    "machine_name" TEXT NOT NULL,
    "work_center_code" TEXT,
    "production_line_code" TEXT,
    "operation_type" TEXT NOT NULL,
    "production_order_number" TEXT,
    "product_sku" TEXT,
    "product_name" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "duration_min" INTEGER,
    "shift_code" TEXT,
    "operator_id" UUID,
    "operator_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "changeovers" (
    "id" UUID NOT NULL,
    "changeover_code" TEXT NOT NULL,
    "machine_code" TEXT NOT NULL,
    "machine_name" TEXT NOT NULL,
    "production_line_code" TEXT,
    "from_product_sku" TEXT NOT NULL,
    "from_product_name" TEXT NOT NULL,
    "from_product_family" TEXT NOT NULL,
    "to_product_sku" TEXT NOT NULL,
    "to_product_name" TEXT NOT NULL,
    "to_product_family" TEXT NOT NULL,
    "changeover_type" TEXT NOT NULL,
    "setup_time_min" INTEGER NOT NULL DEFAULT 0,
    "cleaning_time_min" INTEGER NOT NULL DEFAULT 0,
    "total_changeover_min" INTEGER NOT NULL,
    "operators_required" INTEGER NOT NULL DEFAULT 1,
    "utility_usage" TEXT,
    "changeover_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "allergen_risk" BOOLEAN NOT NULL DEFAULT false,
    "contamination_risk" TEXT NOT NULL DEFAULT 'LOW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "changeovers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "changeover_rules" (
    "id" UUID NOT NULL,
    "rule_code" TEXT NOT NULL,
    "from_product_family" TEXT NOT NULL,
    "to_product_family" TEXT NOT NULL,
    "changeover_type" TEXT NOT NULL,
    "required_cleaning_time_min" INTEGER NOT NULL,
    "requires_sanitization" BOOLEAN NOT NULL DEFAULT false,
    "allergen_concern" BOOLEAN NOT NULL DEFAULT false,
    "allergen_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "changeover_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_campaigns" (
    "id" UUID NOT NULL,
    "campaign_code" TEXT NOT NULL,
    "campaign_name" TEXT NOT NULL,
    "campaign_type" TEXT NOT NULL,
    "product_family" TEXT NOT NULL,
    "product_count" INTEGER NOT NULL,
    "product_skus" TEXT NOT NULL,
    "schedule_id" UUID,
    "schedule_number" TEXT,
    "production_line_code" TEXT NOT NULL,
    "campaign_start" TIMESTAMP(3) NOT NULL,
    "campaign_end" TIMESTAMP(3) NOT NULL,
    "campaign_duration_min" INTEGER NOT NULL,
    "total_setup_min" INTEGER NOT NULL,
    "total_cleaning_min" INTEGER NOT NULL,
    "saved_setup_min" INTEGER NOT NULL DEFAULT 0,
    "saved_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sequence_order" TEXT NOT NULL,
    "sequence_rationale" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "production_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_constraints" (
    "id" UUID NOT NULL,
    "constraint_code" TEXT NOT NULL,
    "schedule_id" UUID,
    "schedule_number" TEXT,
    "operation_id" UUID,
    "constraint_type" TEXT NOT NULL,
    "constraint_description" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_code" TEXT NOT NULL,
    "resource_name" TEXT NOT NULL,
    "constraint_status" TEXT NOT NULL DEFAULT 'DETECTED',
    "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "resolution_action" TEXT,
    "resolved_at" TIMESTAMP(3),
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_constraints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_simulations" (
    "id" UUID NOT NULL,
    "simulation_code" TEXT NOT NULL,
    "source_schedule_id" UUID NOT NULL,
    "source_schedule_number" TEXT NOT NULL,
    "scenario_type" TEXT NOT NULL,
    "scenario_description" TEXT NOT NULL,
    "scenario_parameters" TEXT,
    "capacity_impact_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "delay_forecast_min" INTEGER NOT NULL DEFAULT 0,
    "cost_impact" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "affected_operations" INTEGER NOT NULL DEFAULT 0,
    "affected_machines" INTEGER NOT NULL DEFAULT 0,
    "revised_schedule_generated" BOOLEAN NOT NULL DEFAULT false,
    "revised_schedule_number" TEXT,
    "revised_utilization" DECIMAL(6,2),
    "simulation_duration_ms" INTEGER,
    "within_target" BOOLEAN NOT NULL DEFAULT true,
    "simulated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mfg_mission_control" (
    "id" UUID NOT NULL,
    "snapshot_code" TEXT NOT NULL,
    "scope_type" TEXT NOT NULL,
    "scope_code" TEXT NOT NULL,
    "scope_name" TEXT NOT NULL,
    "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "factory_health_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "factory_health_status" TEXT NOT NULL DEFAULT 'HEALTHY',
    "active_production_orders" INTEGER NOT NULL DEFAULT 0,
    "running_machines" INTEGER NOT NULL DEFAULT 0,
    "total_machines" INTEGER NOT NULL DEFAULT 0,
    "faulted_machines" INTEGER NOT NULL DEFAULT 0,
    "active_operators" INTEGER NOT NULL DEFAULT 0,
    "total_operators" INTEGER NOT NULL DEFAULT 0,
    "production_target_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "production_actual_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "target_achievement" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "avg_oee" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "avg_yield" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "scrap_rate" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "energy_consumption_kwh" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "active_alerts" INTEGER NOT NULL DEFAULT 0,
    "critical_alerts" INTEGER NOT NULL DEFAULT 0,
    "refresh_duration_ms" INTEGER,
    "within_target" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mfg_mission_control_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturing_alerts" (
    "id" UUID NOT NULL,
    "alert_code" TEXT NOT NULL,
    "plant_code" TEXT NOT NULL,
    "production_line_code" TEXT,
    "machine_code" TEXT,
    "alert_type" TEXT NOT NULL,
    "alert_category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "acknowledged_by_id" UUID,
    "acknowledged_by_name" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "escalation_level" INTEGER NOT NULL DEFAULT 0,
    "escalated_to" TEXT,
    "escalated_at" TIMESTAMP(3),
    "delivery_channels" TEXT NOT NULL DEFAULT 'DASHBOARD',
    "notification_sent" BOOLEAN NOT NULL DEFAULT false,
    "notification_sent_at" TIMESTAMP(3),
    "production_batch_number" TEXT,
    "work_order_number" TEXT,
    "raised_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturing_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mfg_ai_recommendations" (
    "id" UUID NOT NULL,
    "recommendation_code" TEXT NOT NULL,
    "ai_engine" TEXT NOT NULL,
    "recommendation_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rationale" TEXT,
    "expected_impact" TEXT,
    "confidence_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "plant_code" TEXT,
    "production_line_code" TEXT,
    "machine_code" TEXT,
    "action_status" TEXT NOT NULL DEFAULT 'PENDING',
    "accepted_by_id" UUID,
    "accepted_by_name" TEXT,
    "accepted_at" TIMESTAMP(3),
    "implemented_at" TIMESTAMP(3),
    "implementation_notes" TEXT,
    "actual_impact" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mfg_ai_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factory_health_checks" (
    "id" UUID NOT NULL,
    "check_code" TEXT NOT NULL,
    "system_name" TEXT NOT NULL,
    "system_category" TEXT NOT NULL,
    "health_status" TEXT NOT NULL DEFAULT 'HEALTHY',
    "health_score" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "response_time_ms" INTEGER,
    "uptime_percent" DECIMAL(6,2) NOT NULL DEFAULT 100,
    "last_incident_at" TIMESTAMP(3),
    "status_message" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "factory_health_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_continuity_events" (
    "id" UUID NOT NULL,
    "event_code" TEXT NOT NULL,
    "system_name" TEXT NOT NULL,
    "incident_type" TEXT NOT NULL,
    "incident_description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "downtime_minutes" INTEGER,
    "recovery_actions" TEXT,
    "failover_triggered" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_continuity_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "executive_scorecards" (
    "id" UUID NOT NULL,
    "scorecard_code" TEXT NOT NULL,
    "scope_type" TEXT NOT NULL,
    "scope_code" TEXT NOT NULL,
    "scope_name" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "production_achievement_pct" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "oee_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "yield_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "scrap_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "rework_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "machine_utilization_pct" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "schedule_adherence_pct" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "labor_productivity" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "energy_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "manufacturing_cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "on_time_completion_pct" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "overall_status" TEXT NOT NULL DEFAULT 'GREEN',
    "plant_rank" INTEGER,
    "department_rank" INTEGER,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "executive_scorecards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_tower_views" (
    "id" UUID NOT NULL,
    "view_code" TEXT NOT NULL,
    "view_type" TEXT NOT NULL,
    "scope_code" TEXT NOT NULL,
    "scope_name" TEXT NOT NULL,
    "parent_scope_code" TEXT,
    "child_count" INTEGER NOT NULL DEFAULT 0,
    "active_work_orders" INTEGER NOT NULL DEFAULT 0,
    "current_output" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "output_uom" TEXT NOT NULL DEFAULT 'KG',
    "current_oee" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "running_machines" INTEGER NOT NULL DEFAULT 0,
    "total_machines" INTEGER NOT NULL DEFAULT 0,
    "active_operators" INTEGER NOT NULL DEFAULT 0,
    "risk_level" TEXT NOT NULL DEFAULT 'LOW',
    "risk_factors" TEXT,
    "status_indicator" TEXT NOT NULL DEFAULT 'GREEN',
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "control_tower_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_factory_nodes" (
    "id" UUID NOT NULL,
    "node_code" TEXT NOT NULL,
    "node_type" TEXT NOT NULL,
    "node_name" TEXT NOT NULL,
    "parent_node_id" UUID,
    "parent_node_code" TEXT,
    "plant_code" TEXT NOT NULL,
    "production_line_code" TEXT,
    "work_center_code" TEXT,
    "machine_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "current_batch_number" TEXT,
    "current_product" TEXT,
    "current_output" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "output_uom" TEXT NOT NULL DEFAULT 'KG',
    "wip_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "wip_stage" TEXT,
    "assigned_operator_id" UUID,
    "assigned_operator_name" TEXT,
    "capacity_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "status_color" TEXT NOT NULL DEFAULT 'GRAY',
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "digital_factory_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_production_models" (
    "id" UUID NOT NULL,
    "model_code" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "model_type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "training_dataset_size" INTEGER NOT NULL DEFAULT 0,
    "training_records_count" INTEGER NOT NULL DEFAULT 0,
    "trained_at" TIMESTAMP(3),
    "accuracy_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "precision_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "recall_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "last_prediction_at" TIMESTAMP(3),
    "total_predictions" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_production_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_mfg_recommendations" (
    "id" UUID NOT NULL,
    "recommendation_code" TEXT NOT NULL,
    "model_id" UUID,
    "model_type" TEXT NOT NULL,
    "recommendation_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rationale" TEXT,
    "expected_impact" TEXT,
    "quantified_impact" DECIMAL(14,2),
    "impact_unit" TEXT,
    "confidence_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "plant_code" TEXT,
    "production_line_code" TEXT,
    "machine_code" TEXT,
    "product_sku" TEXT,
    "action_status" TEXT NOT NULL DEFAULT 'PENDING',
    "requires_approval" BOOLEAN NOT NULL DEFAULT true,
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "implemented_at" TIMESTAMP(3),
    "actual_impact" TEXT,
    "supporting_evidence" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_mfg_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_decision_history" (
    "id" UUID NOT NULL,
    "decision_code" TEXT NOT NULL,
    "recommendation_code" TEXT NOT NULL,
    "decision_type" TEXT NOT NULL,
    "decision_reason" TEXT,
    "decided_by_id" UUID,
    "decided_by_name" TEXT,
    "outcome_result" TEXT,
    "outcome_measured" TEXT,
    "learning_notes" TEXT,
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_decision_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictive_maintenance_results" (
    "id" UUID NOT NULL,
    "prediction_code" TEXT NOT NULL,
    "machine_code" TEXT NOT NULL,
    "machine_name" TEXT NOT NULL,
    "plant_code" TEXT NOT NULL,
    "production_line_code" TEXT,
    "failure_type" TEXT NOT NULL,
    "failure_probability" DECIMAL(5,2) NOT NULL,
    "predicted_failure_date" TIMESTAMP(3),
    "recommended_action_date" TIMESTAMP(3),
    "runtime_hours" DECIMAL(12,3) NOT NULL,
    "avg_temperature" DECIMAL(8,2),
    "avg_vibration" DECIMAL(8,2),
    "last_maintenance_at" TIMESTAMP(3),
    "machine_age_years" DECIMAL(5,2),
    "maintenance_type" TEXT NOT NULL DEFAULT 'PREVENTIVE',
    "recommended_action" TEXT NOT NULL,
    "estimated_downtime_min" INTEGER NOT NULL DEFAULT 0,
    "estimated_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "confidence_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "model_version" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "predicted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictive_maintenance_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictive_quality_results" (
    "id" UUID NOT NULL,
    "prediction_code" TEXT NOT NULL,
    "production_batch_number" TEXT,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "machine_code" TEXT,
    "operator_code" TEXT,
    "shift_code" TEXT,
    "prediction_type" TEXT NOT NULL,
    "risk_level" TEXT NOT NULL DEFAULT 'LOW',
    "failure_probability" DECIMAL(5,2) NOT NULL,
    "risk_factors" TEXT,
    "recommended_actions" TEXT,
    "confidence_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "model_version" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "actual_outcome" TEXT,
    "predicted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "predictive_quality_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_energy_optimizations" (
    "id" UUID NOT NULL,
    "optimization_code" TEXT NOT NULL,
    "plant_code" TEXT NOT NULL,
    "machine_code" TEXT,
    "production_line_code" TEXT,
    "energy_type" TEXT NOT NULL,
    "current_consumption" DECIMAL(14,3) NOT NULL,
    "optimized_consumption" DECIMAL(14,3) NOT NULL,
    "potential_saving" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "saving_percent" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "optimization_type" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "estimated_saving_rupees" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "confidence_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "implemented_at" TIMESTAMP(3),
    "actual_saving_rupees" DECIMAL(10,2),
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_energy_optimizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "root_cause_analyses" (
    "id" UUID NOT NULL,
    "analysis_code" TEXT NOT NULL,
    "incident_type" TEXT NOT NULL,
    "incident_description" TEXT NOT NULL,
    "incident_date" TIMESTAMP(3) NOT NULL,
    "production_batch_number" TEXT,
    "machine_code" TEXT,
    "product_sku" TEXT,
    "probable_root_cause" TEXT NOT NULL,
    "root_cause_category" TEXT NOT NULL,
    "confidence_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "supporting_evidence" TEXT NOT NULL,
    "correlated_factors" TEXT,
    "recommended_actions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "analyzed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "root_cause_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "continuous_improvements" (
    "id" UUID NOT NULL,
    "improvement_code" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_reference_code" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "improvement_type" TEXT NOT NULL,
    "before_metric" TEXT,
    "after_metric" TEXT,
    "improvement_percent" DECIMAL(6,2),
    "cost_saving_rupees" DECIMAL(10,2),
    "implemented_by_id" UUID,
    "implemented_by_name" TEXT,
    "implemented_at" TIMESTAMP(3),
    "learning_notes" TEXT,
    "best_practice_tag" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "continuous_improvements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_departments" (
    "id" UUID NOT NULL,
    "department_code" TEXT NOT NULL,
    "department_name" TEXT NOT NULL,
    "plant_id" UUID,
    "plant_code" TEXT NOT NULL,
    "plant_name" TEXT NOT NULL,
    "manager_id" UUID,
    "manager_name" TEXT,
    "default_lab_code" TEXT,
    "default_lab_name" TEXT,
    "inspection_scope" TEXT NOT NULL DEFAULT 'ALL',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_locations" (
    "id" UUID NOT NULL,
    "location_code" TEXT NOT NULL,
    "location_name" TEXT NOT NULL,
    "quality_department_id" UUID,
    "department_code" TEXT,
    "location_type" TEXT NOT NULL,
    "plant_code" TEXT NOT NULL,
    "capacity_per_day" INTEGER NOT NULL DEFAULT 100,
    "equipment_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_roles" (
    "id" UUID NOT NULL,
    "role_code" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,
    "can_approve_results" BOOLEAN NOT NULL DEFAULT false,
    "can_reject_batches" BOOLEAN NOT NULL DEFAULT false,
    "can_raise_ncr" BOOLEAN NOT NULL DEFAULT false,
    "can_approve_capa" BOOLEAN NOT NULL DEFAULT false,
    "can_sign_coa" BOOLEAN NOT NULL DEFAULT false,
    "can_calibrate_equipment" BOOLEAN NOT NULL DEFAULT false,
    "role_level" TEXT NOT NULL DEFAULT 'INSPECTOR',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_standards" (
    "id" UUID NOT NULL,
    "standard_code" TEXT NOT NULL,
    "standard_name" TEXT NOT NULL,
    "standard_type" TEXT NOT NULL,
    "current_version" TEXT NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "document_url" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_standards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_standard_versions" (
    "id" UUID NOT NULL,
    "standard_id" UUID NOT NULL,
    "standard_code" TEXT NOT NULL,
    "version_number" TEXT NOT NULL,
    "change_description" TEXT NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "superseded_at" TIMESTAMP(3),
    "superseded_by_version" TEXT,
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_standard_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_types" (
    "id" UUID NOT NULL,
    "type_code" TEXT NOT NULL,
    "type_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "measurement_type" TEXT NOT NULL DEFAULT 'QUALITATIVE',
    "unit_of_measure" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_templates" (
    "id" UUID NOT NULL,
    "template_code" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "inspection_type_id" UUID NOT NULL,
    "applicable_to" TEXT NOT NULL,
    "product_sku" TEXT,
    "product_name" TEXT,
    "quality_standard_id" UUID,
    "quality_standard_code" TEXT,
    "sampling_plan_id" UUID,
    "sampling_plan_code" TEXT,
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_parameters" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "parameter_name" TEXT NOT NULL,
    "parameter_code" TEXT NOT NULL,
    "min_value" DECIMAL(14,4),
    "max_value" DECIMAL(14,4),
    "target_value" DECIMAL(14,4),
    "tolerance" DECIMAL(10,4),
    "critical_limit" DECIMAL(14,4),
    "unit_of_measure" TEXT,
    "parameter_type" TEXT NOT NULL DEFAULT 'QUANTITATIVE',
    "test_method_id" UUID,
    "test_method_code" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MAJOR',
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sampling_plans" (
    "id" UUID NOT NULL,
    "plan_code" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "sampling_type" TEXT NOT NULL,
    "aql_level" TEXT,
    "sample_size_code" TEXT,
    "lot_size_min" INTEGER,
    "lot_size_max" INTEGER,
    "sample_size" INTEGER,
    "acceptance_number" INTEGER,
    "rejection_number" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sampling_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_specifications" (
    "id" UUID NOT NULL,
    "spec_code" TEXT NOT NULL,
    "spec_name" TEXT NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "quality_standard_id" UUID,
    "quality_standard_code" TEXT,
    "spec_data" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT 'v1.0',
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "effective_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_methods" (
    "id" UUID NOT NULL,
    "method_code" TEXT NOT NULL,
    "method_name" TEXT NOT NULL,
    "method_type" TEXT NOT NULL,
    "description" TEXT,
    "procedure_url" TEXT,
    "estimated_duration_min" INTEGER NOT NULL DEFAULT 30,
    "reference_standard" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_equipment" (
    "id" UUID NOT NULL,
    "equipment_code" TEXT NOT NULL,
    "equipment_name" TEXT NOT NULL,
    "test_method_id" UUID,
    "equipment_type" TEXT NOT NULL,
    "last_calibrated_at" TIMESTAMP(3),
    "next_calibration_due" TIMESTAMP(3),
    "calibration_frequency_days" INTEGER NOT NULL DEFAULT 90,
    "plant_code" TEXT NOT NULL,
    "location_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_calendar" (
    "id" UUID NOT NULL,
    "calendar_code" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_title" TEXT NOT NULL,
    "event_description" TEXT,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "scheduled_end_date" TIMESTAMP(3),
    "frequency" TEXT NOT NULL DEFAULT 'ONE_TIME',
    "equipment_code" TEXT,
    "standard_code" TEXT,
    "assigned_to_id" UUID,
    "assigned_to_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_qualifications" (
    "id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "supplier_code" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "supplier_category" TEXT NOT NULL,
    "approval_status" TEXT NOT NULL DEFAULT 'PENDING',
    "qualification_date" TIMESTAMP(3),
    "risk_level" TEXT NOT NULL DEFAULT 'MEDIUM',
    "audit_frequency" TEXT NOT NULL DEFAULT 'ANNUAL',
    "last_audit_date" TIMESTAMP(3),
    "next_audit_due" TIMESTAMP(3),
    "is_preferred_supplier" BOOLEAN NOT NULL DEFAULT false,
    "approved_products" TEXT,
    "quality_contact_name" TEXT,
    "quality_contact_phone" TEXT,
    "quality_contact_email" TEXT,
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_certifications" (
    "id" UUID NOT NULL,
    "supplier_qualification_id" UUID NOT NULL,
    "supplier_code" TEXT NOT NULL,
    "certification_type" TEXT NOT NULL,
    "certification_number" TEXT NOT NULL,
    "certification_body" TEXT,
    "issued_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "document_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_audits" (
    "id" UUID NOT NULL,
    "supplier_qualification_id" UUID NOT NULL,
    "supplier_code" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "audit_type" TEXT NOT NULL,
    "audit_date" TIMESTAMP(3) NOT NULL,
    "audit_scope" TEXT,
    "auditor_name" TEXT,
    "auditor_org" TEXT,
    "total_findings" INTEGER NOT NULL DEFAULT 0,
    "critical_findings" INTEGER NOT NULL DEFAULT 0,
    "major_findings" INTEGER NOT NULL DEFAULT 0,
    "minor_findings" INTEGER NOT NULL DEFAULT 0,
    "audit_score" DECIMAL(5,2),
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "audit_report_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incoming_inspections" (
    "id" UUID NOT NULL,
    "inspection_code" TEXT NOT NULL,
    "grn_number" TEXT NOT NULL,
    "purchase_order_number" TEXT,
    "supplier_code" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "supplier_batch_no" TEXT,
    "material_code" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "material_category" TEXT NOT NULL,
    "received_qty" DECIMAL(14,3) NOT NULL,
    "sampled_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "inspection_template_code" TEXT,
    "sampling_plan_code" TEXT,
    "inspection_type" TEXT NOT NULL DEFAULT 'ROUTINE',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "overall_result" TEXT,
    "result_summary" TEXT,
    "decision" TEXT,
    "accepted_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "rejected_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "inspector_id" UUID,
    "inspector_name" TEXT,
    "inspected_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incoming_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_samples" (
    "id" UUID NOT NULL,
    "inspection_id" UUID NOT NULL,
    "inspection_code" TEXT NOT NULL,
    "sample_number" INTEGER NOT NULL,
    "sample_code" TEXT NOT NULL,
    "sample_qty" DECIMAL(14,3) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "collected_by_id" UUID,
    "collected_by_name" TEXT,
    "collected_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'COLLECTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_results" (
    "id" UUID NOT NULL,
    "inspection_id" UUID NOT NULL,
    "sample_id" UUID,
    "parameter_name" TEXT NOT NULL,
    "parameter_code" TEXT NOT NULL,
    "min_value" DECIMAL(14,4),
    "max_value" DECIMAL(14,4),
    "target_value" DECIMAL(14,4),
    "unit_of_measure" TEXT,
    "measured_value" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'PASS',
    "severity" TEXT NOT NULL DEFAULT 'MAJOR',
    "test_method_code" TEXT,
    "test_method_name" TEXT,
    "equipment_code" TEXT,
    "notes" TEXT,
    "tested_by_id" UUID,
    "tested_by_name" TEXT,
    "tested_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_hold_inventory" (
    "id" UUID NOT NULL,
    "hold_code" TEXT NOT NULL,
    "grn_number" TEXT NOT NULL,
    "inspection_code" TEXT,
    "material_code" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "supplier_code" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "supplier_batch_no" TEXT,
    "held_qty" DECIMAL(14,3) NOT NULL,
    "released_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "rejected_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "warehouse_code" TEXT NOT NULL,
    "bin_code" TEXT NOT NULL,
    "inventory_status" TEXT NOT NULL DEFAULT 'QUALITY_HOLD',
    "held_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_hold_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_ncrs" (
    "id" UUID NOT NULL,
    "ncr_number" TEXT NOT NULL,
    "inspection_code" TEXT,
    "grn_number" TEXT,
    "supplier_code" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "material_code" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "supplier_batch_no" TEXT,
    "ncr_type" TEXT NOT NULL,
    "defect_description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MAJOR',
    "root_cause" TEXT,
    "root_cause_category" TEXT,
    "disposition" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "supplier_notified_at" TIMESTAMP(3),
    "supplier_response_at" TIMESTAMP(3),
    "supplier_response" TEXT,
    "closed_at" TIMESTAMP(3),
    "closure_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_ncrs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_corrective_actions" (
    "id" UUID NOT NULL,
    "ncr_id" UUID NOT NULL,
    "ncr_number" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "action_description" TEXT NOT NULL,
    "assigned_to" TEXT,
    "assigned_by" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "completed_date" TIMESTAMP(3),
    "verification_method" TEXT,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "verification_result" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_corrective_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_scorecards" (
    "id" UUID NOT NULL,
    "scorecard_code" TEXT NOT NULL,
    "supplier_code" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "supplier_category" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "on_time_delivery_pct" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "quality_pct" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "acceptance_pct" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "rejection_pct" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "response_time_hrs" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "complaint_rate" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "audit_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "price_stability_pct" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "overall_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "overall_rating" TEXT NOT NULL DEFAULT 'C',
    "total_deliveries" INTEGER NOT NULL DEFAULT 0,
    "total_inspections" INTEGER NOT NULL DEFAULT 0,
    "total_ncrs" INTEGER NOT NULL DEFAULT 0,
    "total_accepted_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "total_rejected_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_scorecards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ipqc_inspections" (
    "id" UUID NOT NULL,
    "inspection_code" TEXT NOT NULL,
    "production_order_number" TEXT,
    "work_order_number" TEXT,
    "production_batch_number" TEXT,
    "production_stage" TEXT NOT NULL,
    "operation_no" INTEGER,
    "machine_code" TEXT,
    "machine_name" TEXT,
    "work_center_code" TEXT,
    "production_line_code" TEXT,
    "product_sku" TEXT,
    "product_name" TEXT,
    "inspector_id" UUID,
    "inspector_name" TEXT,
    "operator_id" UUID,
    "operator_name" TEXT,
    "shift_code" TEXT,
    "inspection_template_code" TEXT,
    "checkpoint_count" INTEGER NOT NULL DEFAULT 0,
    "passed_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "overall_result" TEXT,
    "result_summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "digital_signature" TEXT,
    "inspected_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ipqc_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ipqc_results" (
    "id" UUID NOT NULL,
    "inspection_id" UUID NOT NULL,
    "inspection_code" TEXT NOT NULL,
    "checkpoint_code" TEXT NOT NULL,
    "checkpoint_name" TEXT NOT NULL,
    "parameter_name" TEXT NOT NULL,
    "parameter_code" TEXT NOT NULL,
    "min_value" DECIMAL(14,4),
    "max_value" DECIMAL(14,4),
    "target_value" DECIMAL(14,4),
    "unit_of_measure" TEXT,
    "measured_value" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'PASS',
    "severity" TEXT NOT NULL DEFAULT 'MAJOR',
    "is_ccp" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "photo_url" TEXT,
    "tested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ipqc_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_checkpoints" (
    "id" UUID NOT NULL,
    "checkpoint_code" TEXT NOT NULL,
    "checkpoint_name" TEXT NOT NULL,
    "production_stage" TEXT NOT NULL,
    "product_sku" TEXT,
    "product_name" TEXT,
    "product_family" TEXT,
    "checkpoint_type" TEXT NOT NULL,
    "min_value" DECIMAL(14,4),
    "max_value" DECIMAL(14,4),
    "target_value" DECIMAL(14,4),
    "unit_of_measure" TEXT,
    "tolerance" DECIMAL(10,4),
    "severity" TEXT NOT NULL DEFAULT 'MAJOR',
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "is_ccp" BOOLEAN NOT NULL DEFAULT false,
    "sequence_order" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_parameters" (
    "id" UUID NOT NULL,
    "parameter_code" TEXT NOT NULL,
    "parameter_name" TEXT NOT NULL,
    "machine_code" TEXT NOT NULL,
    "machine_name" TEXT NOT NULL,
    "parameter_type" TEXT NOT NULL,
    "min_value" DECIMAL(14,4) NOT NULL,
    "max_value" DECIMAL(14,4) NOT NULL,
    "target_value" DECIMAL(14,4) NOT NULL,
    "warning_min" DECIMAL(14,4),
    "warning_max" DECIMAL(14,4),
    "unit_of_measure" TEXT NOT NULL,
    "monitoring_frequency" TEXT NOT NULL DEFAULT 'CONTINUOUS',
    "is_critical" BOOLEAN NOT NULL DEFAULT false,
    "auto_alert_on_breach" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "process_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ccp_points" (
    "id" UUID NOT NULL,
    "ccp_code" TEXT NOT NULL,
    "ccp_name" TEXT NOT NULL,
    "production_stage" TEXT NOT NULL,
    "product_family" TEXT,
    "machine_code" TEXT,
    "critical_min" DECIMAL(14,4),
    "critical_max" DECIMAL(14,4),
    "target_value" DECIMAL(14,4) NOT NULL,
    "unit_of_measure" TEXT NOT NULL,
    "monitoring_method" TEXT NOT NULL,
    "monitoring_frequency" TEXT NOT NULL,
    "corrective_action" TEXT NOT NULL,
    "hazard_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ccp_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ccp_records" (
    "id" UUID NOT NULL,
    "ccp_id" UUID NOT NULL,
    "ccp_code" TEXT NOT NULL,
    "production_batch_number" TEXT,
    "production_order_number" TEXT,
    "work_order_number" TEXT,
    "measured_value" DECIMAL(14,4) NOT NULL,
    "unit_of_measure" TEXT NOT NULL,
    "ccp_status" TEXT NOT NULL DEFAULT 'WITHIN_LIMIT',
    "corrective_action_taken" TEXT,
    "corrective_action_by" TEXT,
    "corrective_action_at" TIMESTAMP(3),
    "production_paused" BOOLEAN NOT NULL DEFAULT false,
    "checked_by_id" UUID,
    "checked_by_name" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ccp_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_quality_records" (
    "id" UUID NOT NULL,
    "record_code" TEXT NOT NULL,
    "production_batch_number" TEXT NOT NULL,
    "production_order_number" TEXT,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "recipe_code" TEXT,
    "recipe_version" TEXT,
    "plant_code" TEXT NOT NULL,
    "production_line_code" TEXT,
    "machine_code" TEXT,
    "operator_name" TEXT,
    "inspector_name" TEXT,
    "shift_code" TEXT,
    "total_inspections" INTEGER NOT NULL DEFAULT 0,
    "passed_inspections" INTEGER NOT NULL DEFAULT 0,
    "failed_inspections" INTEGER NOT NULL DEFAULT 0,
    "total_checkpoints" INTEGER NOT NULL DEFAULT 0,
    "passed_checkpoints" INTEGER NOT NULL DEFAULT 0,
    "failed_checkpoints" INTEGER NOT NULL DEFAULT 0,
    "ccp_checks_total" INTEGER NOT NULL DEFAULT 0,
    "ccp_checks_passed" INTEGER NOT NULL DEFAULT 0,
    "ccp_breaches" INTEGER NOT NULL DEFAULT 0,
    "overall_quality_result" TEXT,
    "quality_grade" TEXT,
    "inspection_data" TEXT,
    "ccp_data" TEXT,
    "photo_urls" TEXT,
    "released_by_id" UUID,
    "released_by_name" TEXT,
    "released_at" TIMESTAMP(3),
    "release_notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_quality_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_quality_holds" (
    "id" UUID NOT NULL,
    "hold_code" TEXT NOT NULL,
    "production_batch_number" TEXT,
    "production_order_number" TEXT,
    "work_order_number" TEXT,
    "hold_type" TEXT NOT NULL,
    "hold_reason" TEXT NOT NULL,
    "hold_description" TEXT NOT NULL,
    "production_stage" TEXT,
    "machine_code" TEXT,
    "production_line_code" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MAJOR',
    "reviewed_by_id" UUID,
    "reviewed_by_name" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "review_decision" TEXT,
    "review_notes" TEXT,
    "released_by_id" UUID,
    "released_by_name" TEXT,
    "released_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "held_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_quality_holds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fgqc_inspections" (
    "id" UUID NOT NULL,
    "inspection_code" TEXT NOT NULL,
    "production_batch_number" TEXT NOT NULL,
    "production_order_number" TEXT,
    "packaging_order_number" TEXT,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_quantity" DECIMAL(14,3) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "manufacturing_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "best_before_date" TIMESTAMP(3),
    "sampling_plan_code" TEXT,
    "sample_size" DECIMAL(14,3),
    "inspection_template_code" TEXT,
    "checkpoint_count" INTEGER NOT NULL DEFAULT 0,
    "passed_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "overall_result" TEXT,
    "result_summary" TEXT,
    "quality_grade" TEXT,
    "inspector_id" UUID,
    "inspector_name" TEXT,
    "inspected_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "digital_signature" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fgqc_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fgqc_results" (
    "id" UUID NOT NULL,
    "inspection_id" UUID NOT NULL,
    "inspection_code" TEXT NOT NULL,
    "checkpoint_name" TEXT NOT NULL,
    "parameter_name" TEXT NOT NULL,
    "min_value" DECIMAL(14,4),
    "max_value" DECIMAL(14,4),
    "target_value" DECIMAL(14,4),
    "unit_of_measure" TEXT,
    "measured_value" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'PASS',
    "severity" TEXT NOT NULL DEFAULT 'MAJOR',
    "notes" TEXT,
    "photo_url" TEXT,
    "tested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fgqc_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shelf_life_validations" (
    "id" UUID NOT NULL,
    "validation_code" TEXT NOT NULL,
    "production_batch_number" TEXT NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "manufacturing_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "best_before_date" TIMESTAMP(3),
    "total_shelf_life_days" INTEGER NOT NULL,
    "remaining_shelf_life_days" INTEGER NOT NULL,
    "shelf_life_percent" DECIMAL(5,2) NOT NULL,
    "storage_conditions" TEXT,
    "storage_temp_min" DECIMAL(5,2),
    "storage_temp_max" DECIMAL(5,2),
    "actual_storage_temp" DECIMAL(5,2),
    "storage_compliant" BOOLEAN NOT NULL DEFAULT true,
    "label_mfg_date_match" BOOLEAN NOT NULL DEFAULT true,
    "label_expiry_date_match" BOOLEAN NOT NULL DEFAULT true,
    "label_batch_match" BOOLEAN NOT NULL DEFAULT true,
    "alert_level" TEXT NOT NULL DEFAULT 'HEALTHY',
    "status" TEXT NOT NULL DEFAULT 'VALIDATED',
    "validated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shelf_life_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stability_results" (
    "id" UUID NOT NULL,
    "validation_id" UUID NOT NULL,
    "test_interval" TEXT NOT NULL,
    "test_date" TIMESTAMP(3) NOT NULL,
    "appearance" TEXT,
    "color" TEXT,
    "taste" TEXT,
    "aroma" TEXT,
    "texture" TEXT,
    "microbiology_result" TEXT,
    "overall_result" TEXT NOT NULL DEFAULT 'PASS',
    "notes" TEXT,
    "tested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stability_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_releases" (
    "id" UUID NOT NULL,
    "release_code" TEXT NOT NULL,
    "production_batch_number" TEXT NOT NULL,
    "fgqc_inspection_code" TEXT,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_quantity" DECIMAL(14,3) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "release_type" TEXT NOT NULL,
    "released_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "restricted_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "release_conditions" TEXT,
    "quality_approved" BOOLEAN NOT NULL DEFAULT false,
    "quality_approved_by" TEXT,
    "quality_approved_at" TIMESTAMP(3),
    "warehouse_authorized" BOOLEAN NOT NULL DEFAULT false,
    "warehouse_authorized_by" TEXT,
    "warehouse_authorized_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "warehouse_receipt_number" TEXT,
    "inventory_status" TEXT NOT NULL DEFAULT 'QUALITY_HOLD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release_approvals" (
    "id" UUID NOT NULL,
    "batch_release_id" UUID NOT NULL,
    "release_code" TEXT NOT NULL,
    "approval_type" TEXT NOT NULL,
    "approval_decision" TEXT NOT NULL,
    "approver_id" UUID,
    "approver_name" TEXT NOT NULL,
    "approver_role" TEXT,
    "digital_signature" TEXT,
    "approval_notes" TEXT,
    "conditions" TEXT,
    "approved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "release_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_certificates" (
    "id" UUID NOT NULL,
    "certificate_code" TEXT NOT NULL,
    "production_batch_number" TEXT NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_release_code" TEXT,
    "fgqc_inspection_code" TEXT,
    "certificate_type" TEXT NOT NULL,
    "certificate_data" TEXT NOT NULL,
    "manufacturing_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "batch_quantity" DECIMAL(14,3) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "quality_grade" TEXT,
    "digital_signature" TEXT,
    "signed_by_id" UUID,
    "signed_by_name" TEXT,
    "signed_by_role" TEXT,
    "signed_at" TIMESTAMP(3),
    "pdf_url" TEXT,
    "qr_code" TEXT,
    "version" TEXT NOT NULL DEFAULT 'v1.0',
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_compliance_checks" (
    "id" UUID NOT NULL,
    "check_code" TEXT NOT NULL,
    "production_batch_number" TEXT,
    "fgqc_inspection_code" TEXT,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "correct_box" BOOLEAN NOT NULL DEFAULT true,
    "correct_label" BOOLEAN NOT NULL DEFAULT true,
    "barcode_readable" BOOLEAN NOT NULL DEFAULT true,
    "qr_code_readable" BOOLEAN NOT NULL DEFAULT true,
    "mrp_correct" BOOLEAN NOT NULL DEFAULT true,
    "fssai_number_present" BOOLEAN NOT NULL DEFAULT true,
    "net_weight_correct" BOOLEAN NOT NULL DEFAULT true,
    "ingredients_listed" BOOLEAN NOT NULL DEFAULT true,
    "nutrition_panel_present" BOOLEAN NOT NULL DEFAULT true,
    "allergen_declaration" BOOLEAN NOT NULL DEFAULT true,
    "mfg_date_correct" BOOLEAN NOT NULL DEFAULT true,
    "expiry_date_correct" BOOLEAN NOT NULL DEFAULT true,
    "overall_compliance" TEXT NOT NULL DEFAULT 'COMPLIANT',
    "non_compliance_details" TEXT,
    "verification_method" TEXT NOT NULL DEFAULT 'VISUAL',
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "checked_by_id" UUID,
    "checked_by_name" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "packaging_compliance_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_samples" (
    "id" UUID NOT NULL,
    "sample_number" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "sample_type" TEXT NOT NULL,
    "production_batch_number" TEXT,
    "product_sku" TEXT,
    "product_name" TEXT,
    "supplier_code" TEXT,
    "supplier_name" TEXT,
    "production_order_number" TEXT,
    "source_module" TEXT,
    "request_reference_code" TEXT,
    "requested_by_id" UUID,
    "requested_by_name" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "collected_by_id" UUID,
    "collected_by_name" TEXT,
    "collected_at" TIMESTAMP(3),
    "collection_location" TEXT,
    "received_at_lab_at" TIMESTAMP(3),
    "received_by" TEXT,
    "sample_qty" DECIMAL(14,3),
    "sample_uom" TEXT NOT NULL DEFAULT 'KG',
    "container_type" TEXT,
    "storage_condition" TEXT,
    "storage_rack_code" TEXT,
    "storage_position" TEXT,
    "retention_expiry_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_worklists" (
    "id" UUID NOT NULL,
    "worklist_code" TEXT NOT NULL,
    "worklist_date" TIMESTAMP(3) NOT NULL,
    "assigned_to_id" UUID,
    "assigned_to_name" TEXT,
    "total_tests" INTEGER NOT NULL DEFAULT 0,
    "pending_tests" INTEGER NOT NULL DEFAULT 0,
    "in_progress_tests" INTEGER NOT NULL DEFAULT 0,
    "completed_tests" INTEGER NOT NULL DEFAULT 0,
    "overdue_tests" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_worklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_tests" (
    "id" UUID NOT NULL,
    "test_code" TEXT NOT NULL,
    "sample_id" UUID NOT NULL,
    "sample_number" TEXT NOT NULL,
    "worklist_id" UUID,
    "test_category" TEXT NOT NULL,
    "test_type" TEXT NOT NULL,
    "test_method_name" TEXT,
    "spec_min" DECIMAL(14,4),
    "spec_max" DECIMAL(14,4),
    "spec_target" DECIMAL(14,4),
    "spec_unit" TEXT,
    "result_value" DECIMAL(14,4),
    "result_text" TEXT,
    "result_unit" TEXT,
    "result_status" TEXT NOT NULL DEFAULT 'PENDING',
    "equipment_code" TEXT,
    "equipment_name" TEXT,
    "technician_id" UUID,
    "technician_name" TEXT,
    "tested_at" TIMESTAMP(3),
    "validated_by_id" UUID,
    "validated_by_name" TEXT,
    "validated_at" TIMESTAMP(3),
    "validation_decision" TEXT,
    "electronic_signature" TEXT,
    "notes" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_equipment" (
    "id" UUID NOT NULL,
    "equipment_code" TEXT NOT NULL,
    "equipment_name" TEXT NOT NULL,
    "equipment_type" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model_number" TEXT,
    "serial_number" TEXT,
    "plant_code" TEXT NOT NULL,
    "lab_location" TEXT,
    "last_calibrated_at" TIMESTAMP(3),
    "next_calibration_due" TIMESTAMP(3),
    "calibration_freq_days" INTEGER NOT NULL DEFAULT 90,
    "calibration_status" TEXT NOT NULL DEFAULT 'VALID',
    "qualification_status" TEXT NOT NULL DEFAULT 'QUALIFIED',
    "total_usage_hours" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_inventory" (
    "id" UUID NOT NULL,
    "item_code" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "manufacturer" TEXT,
    "catalog_number" TEXT,
    "current_stock" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "min_stock" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "max_stock" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "uom" TEXT NOT NULL DEFAULT 'PCS',
    "batch_number" TEXT,
    "expiry_date" TIMESTAMP(3),
    "storage_location" TEXT,
    "storage_condition" TEXT,
    "is_low_stock" BOOLEAN NOT NULL DEFAULT false,
    "is_expiring_soon" BOOLEAN NOT NULL DEFAULT false,
    "is_expired" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_reports" (
    "id" UUID NOT NULL,
    "report_code" TEXT NOT NULL,
    "sample_number" TEXT NOT NULL,
    "sample_id" UUID,
    "production_batch_number" TEXT,
    "report_type" TEXT NOT NULL,
    "report_data" TEXT NOT NULL,
    "digital_signature" TEXT,
    "signed_by_id" UUID,
    "signed_by_name" TEXT,
    "signed_at" TIMESTAMP(3),
    "pdf_url" TEXT,
    "qr_code" TEXT,
    "version" TEXT NOT NULL DEFAULT 'v1.0',
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sample_tracking" (
    "id" UUID NOT NULL,
    "sample_number" TEXT NOT NULL,
    "tracking_event" TEXT NOT NULL,
    "location_from" TEXT,
    "location_to" TEXT,
    "performed_by_id" UUID,
    "performed_by_name" TEXT,
    "notes" TEXT,
    "event_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sample_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "haccp_plans" (
    "id" UUID NOT NULL,
    "plan_number" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "plant_code" TEXT NOT NULL,
    "plant_name" TEXT NOT NULL,
    "department_code" TEXT,
    "production_line_code" TEXT,
    "product_family" TEXT,
    "version" TEXT NOT NULL DEFAULT 'v1.0',
    "parent_plan_id" UUID,
    "standard_type" TEXT NOT NULL DEFAULT 'HACCP',
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "effective_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "haccp_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hazard_assessments" (
    "id" UUID NOT NULL,
    "haccp_plan_id" UUID NOT NULL,
    "hazard_code" TEXT NOT NULL,
    "hazard_type" TEXT NOT NULL,
    "hazard_name" TEXT NOT NULL,
    "hazard_description" TEXT NOT NULL,
    "source_stage" TEXT NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "severity" INTEGER NOT NULL,
    "risk_score" INTEGER NOT NULL,
    "risk_level" TEXT NOT NULL,
    "control_measure" TEXT,
    "is_ccp" BOOLEAN NOT NULL DEFAULT false,
    "is_oprp" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hazard_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "critical_control_points_v2" (
    "id" UUID NOT NULL,
    "haccp_plan_id" UUID NOT NULL,
    "ccp_code" TEXT NOT NULL,
    "ccp_name" TEXT NOT NULL,
    "production_stage" TEXT NOT NULL,
    "hazard_controlled" TEXT NOT NULL,
    "critical_min" DECIMAL(14,4),
    "critical_max" DECIMAL(14,4),
    "target_value" DECIMAL(14,4) NOT NULL,
    "tolerance" DECIMAL(10,4),
    "unit_of_measure" TEXT NOT NULL,
    "monitoring_method" TEXT NOT NULL,
    "monitoring_frequency" TEXT NOT NULL,
    "monitoring_by" TEXT NOT NULL,
    "corrective_action" TEXT NOT NULL,
    "records_required" BOOLEAN NOT NULL DEFAULT true,
    "verification_method" TEXT,
    "verification_freq" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "critical_control_points_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oprp_controls" (
    "id" UUID NOT NULL,
    "haccp_plan_id" UUID NOT NULL,
    "oprp_code" TEXT NOT NULL,
    "oprp_name" TEXT NOT NULL,
    "oprp_type" TEXT NOT NULL,
    "acceptable_limit" TEXT,
    "unit_of_measure" TEXT,
    "monitoring_frequency" TEXT NOT NULL,
    "monitoring_by" TEXT NOT NULL,
    "corrective_action" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oprp_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environmental_samples" (
    "id" UUID NOT NULL,
    "sample_code" TEXT NOT NULL,
    "sample_type" TEXT NOT NULL,
    "monitoring_location" TEXT NOT NULL,
    "location_code" TEXT,
    "location_description" TEXT,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "frequency" TEXT NOT NULL,
    "collected_by_id" UUID,
    "collected_by_name" TEXT,
    "collected_at" TIMESTAMP(3),
    "test_type" TEXT,
    "result_value" TEXT,
    "result_unit" TEXT,
    "result_status" TEXT NOT NULL DEFAULT 'PENDING',
    "alert_level" TEXT NOT NULL DEFAULT 'NONE',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "environmental_samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sanitation_records" (
    "id" UUID NOT NULL,
    "record_code" TEXT NOT NULL,
    "cleaning_type" TEXT NOT NULL,
    "area_code" TEXT NOT NULL,
    "area_name" TEXT NOT NULL,
    "equipment_code" TEXT,
    "equipment_name" TEXT,
    "production_line_code" TEXT,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "cleaned_by_id" UUID,
    "cleaned_by_name" TEXT,
    "cleaned_at" TIMESTAMP(3),
    "chemical_chemical" TEXT,
    "chemical_concentration" TEXT,
    "contact_time_min" INTEGER,
    "verification_method" TEXT,
    "verification_result" TEXT,
    "atp_reading" DECIMAL(10,2),
    "atp_pass_limit" DECIMAL(10,2),
    "micro_result" TEXT,
    "verified_by_id" UUID,
    "verified_by_name" TEXT,
    "verified_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sanitation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergen_matrix_entries" (
    "id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "contains_milk" BOOLEAN NOT NULL DEFAULT false,
    "contains_tree_nuts" BOOLEAN NOT NULL DEFAULT false,
    "contains_peanuts" BOOLEAN NOT NULL DEFAULT false,
    "contains_sesame" BOOLEAN NOT NULL DEFAULT false,
    "contains_soy" BOOLEAN NOT NULL DEFAULT false,
    "contains_gluten" BOOLEAN NOT NULL DEFAULT false,
    "contains_mustard" BOOLEAN NOT NULL DEFAULT false,
    "contains_sulphites" BOOLEAN NOT NULL DEFAULT false,
    "allergen_list" TEXT,
    "dedicated_equipment" BOOLEAN NOT NULL DEFAULT false,
    "cleaning_validation_required" BOOLEAN NOT NULL DEFAULT true,
    "sequencing_required" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allergen_matrix_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cross_contact_records" (
    "id" UUID NOT NULL,
    "record_code" TEXT NOT NULL,
    "production_batch_number" TEXT,
    "production_line_code" TEXT NOT NULL,
    "allergen_type" TEXT NOT NULL,
    "incident_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "corrective_action" TEXT,
    "resolved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cross_contact_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_defense_plans" (
    "id" UUID NOT NULL,
    "plan_code" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "plant_code" TEXT NOT NULL,
    "facility_security" BOOLEAN NOT NULL DEFAULT false,
    "restricted_areas" BOOLEAN NOT NULL DEFAULT false,
    "visitor_management" BOOLEAN NOT NULL DEFAULT false,
    "tamper_detection" BOOLEAN NOT NULL DEFAULT false,
    "intentional_contamination_prevention" BOOLEAN NOT NULL DEFAULT false,
    "approved_by_id" UUID,
    "approved_by_name" TEXT,
    "approved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_defense_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_fraud_assessments" (
    "id" UUID NOT NULL,
    "assessment_code" TEXT NOT NULL,
    "material_code" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "supplier_code" TEXT,
    "supplier_name" TEXT,
    "fraud_type" TEXT NOT NULL,
    "vulnerability_score" INTEGER NOT NULL DEFAULT 0,
    "mitigation_measures" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "assessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_fraud_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "non_conformance_reports" (
    "id" UUID NOT NULL,
    "ncr_number" TEXT NOT NULL,
    "source_module" TEXT NOT NULL,
    "source_reference_code" TEXT,
    "plant_code" TEXT NOT NULL,
    "department_code" TEXT,
    "production_line_code" TEXT,
    "product_sku" TEXT,
    "product_name" TEXT,
    "production_batch_number" TEXT,
    "material_code" TEXT,
    "material_name" TEXT,
    "incident_type" TEXT NOT NULL,
    "incident_description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MAJOR',
    "reported_by_id" UUID,
    "reported_by_name" TEXT,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_to_id" UUID,
    "assigned_to_name" TEXT,
    "quarantine_triggered" BOOLEAN NOT NULL DEFAULT false,
    "quarantined_qty" DECIMAL(14,3),
    "investigation_required" BOOLEAN NOT NULL DEFAULT true,
    "investigation_status" TEXT,
    "disposition" TEXT,
    "disposition_approved" BOOLEAN NOT NULL DEFAULT false,
    "disposition_approved_by" TEXT,
    "disposition_approved_at" TIMESTAMP(3),
    "escalation_level" INTEGER NOT NULL DEFAULT 0,
    "escalated_to" TEXT,
    "escalated_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "closed_by" TEXT,
    "closure_notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "non_conformance_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_deviations" (
    "id" UUID NOT NULL,
    "deviation_code" TEXT NOT NULL,
    "ncr_id" UUID,
    "deviation_type" TEXT NOT NULL,
    "planned_value" TEXT NOT NULL,
    "actual_value" TEXT NOT NULL,
    "deviation_amount" TEXT,
    "unit_of_measure" TEXT,
    "impact_assessment" TEXT,
    "affected_qty" DECIMAL(14,3),
    "review_decision" TEXT,
    "review_notes" TEXT,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "process_deviations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "root_cause_investigations" (
    "id" UUID NOT NULL,
    "investigation_code" TEXT NOT NULL,
    "ncr_id" UUID NOT NULL,
    "analysis_method" TEXT NOT NULL DEFAULT '5_WHYS',
    "why_1" TEXT,
    "why_2" TEXT,
    "why_3" TEXT,
    "why_4" TEXT,
    "why_5" TEXT,
    "immediate_cause" TEXT,
    "root_cause" TEXT,
    "contributing_factors" TEXT,
    "evidence_summary" TEXT,
    "attachment_urls" TEXT,
    "investigated_by" TEXT,
    "investigated_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "root_cause_investigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_risk_assessments" (
    "id" UUID NOT NULL,
    "assessment_code" TEXT NOT NULL,
    "ncr_id" UUID NOT NULL,
    "severity_score" INTEGER NOT NULL,
    "likelihood_score" INTEGER NOT NULL,
    "detectability_score" INTEGER NOT NULL,
    "rpn" INTEGER NOT NULL,
    "risk_level" TEXT NOT NULL,
    "mitigation_actions" TEXT,
    "residual_risk" TEXT,
    "assessed_by" TEXT,
    "assessed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quality_risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quarantine_inventory" (
    "id" UUID NOT NULL,
    "quarantine_code" TEXT NOT NULL,
    "ncr_number" TEXT,
    "production_batch_number" TEXT,
    "material_code" TEXT NOT NULL,
    "material_name" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "quarantined_qty" DECIMAL(14,3) NOT NULL,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "warehouse_code" TEXT NOT NULL,
    "quarantine_bin_code" TEXT NOT NULL,
    "is_locked" BOOLEAN NOT NULL DEFAULT true,
    "locked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locked_by" TEXT,
    "disposition" TEXT,
    "disposition_executed" BOOLEAN NOT NULL DEFAULT false,
    "disposition_executed_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),
    "released_by" TEXT,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quarantine_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escalation_events" (
    "id" UUID NOT NULL,
    "escalation_code" TEXT NOT NULL,
    "ncr_number" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "escalation_level" INTEGER NOT NULL,
    "escalated_to_role" TEXT NOT NULL,
    "escalated_to_name" TEXT,
    "delivery_channels" TEXT NOT NULL DEFAULT 'DASHBOARD',
    "notification_sent" BOOLEAN NOT NULL DEFAULT false,
    "notification_sent_at" TIMESTAMP(3),
    "acknowledged_by" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "escalated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escalation_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_id_key" ON "users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_code_key" ON "users"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_key" ON "users"("mobile");

-- CreateIndex
CREATE INDEX "idx_users_email_status" ON "users"("email", "status");

-- CreateIndex
CREATE INDEX "idx_users_username_status" ON "users"("username", "status");

-- CreateIndex
CREATE INDEX "idx_users_status_locked" ON "users"("status", "is_locked");

-- CreateIndex
CREATE INDEX "idx_users_auth_provider" ON "users"("auth_provider");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_device_fingerprint_key" ON "user_devices"("device_fingerprint");

-- CreateIndex
CREATE INDEX "idx_devices_user_trusted" ON "user_devices"("user_id", "is_trusted");

-- CreateIndex
CREATE INDEX "idx_devices_type" ON "user_devices"("device_type");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_session_id_key" ON "user_sessions"("session_id");

-- CreateIndex
CREATE INDEX "idx_sessions_user_status" ON "user_sessions"("user_id", "status");

-- CreateIndex
CREATE INDEX "idx_sessions_status_expires" ON "user_sessions"("status", "expires_at");

-- CreateIndex
CREATE INDEX "idx_sessions_session_id" ON "user_sessions"("session_id");

-- CreateIndex
CREATE INDEX "idx_pw_history_user_date" ON "password_history"("user_id", "changed_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "idx_reset_tokens_user_status" ON "password_reset_tokens"("user_id", "status");

-- CreateIndex
CREATE INDEX "idx_reset_tokens_hash_status" ON "password_reset_tokens"("token_hash", "status");

-- CreateIndex
CREATE INDEX "idx_reset_tokens_expires" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_hash_key" ON "email_verification_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "idx_email_tokens_user_status" ON "email_verification_tokens"("user_id", "status");

-- CreateIndex
CREATE INDEX "idx_email_tokens_hash_status" ON "email_verification_tokens"("token_hash", "status");

-- CreateIndex
CREATE UNIQUE INDEX "audit_logs_event_id_key" ON "audit_logs"("event_id");

-- CreateIndex
CREATE INDEX "idx_audit_entity_time" ON "audit_logs"("business_module", "entity_type", "entity_id", "action_timestamp");

-- CreateIndex
CREATE INDEX "idx_audit_actor_time" ON "audit_logs"("actor_id", "action_timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_config_key_key" ON "system_settings"("config_key");

-- CreateIndex
CREATE INDEX "idx_settings_key_status" ON "system_settings"("config_key", "status");

-- CreateIndex
CREATE UNIQUE INDEX "enterprises_enterprise_code_key" ON "enterprises"("enterprise_code");

-- CreateIndex
CREATE INDEX "idx_enterprise_status" ON "enterprises"("status");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_setting_unique" ON "enterprise_settings"("enterprise_id", "setting_key");

-- CreateIndex
CREATE INDEX "idx_ec_enterprise_type" ON "enterprise_contacts"("enterprise_id", "contact_type");

-- CreateIndex
CREATE UNIQUE INDEX "companies_company_code_key" ON "companies"("company_code");

-- CreateIndex
CREATE INDEX "idx_company_enterprise_status" ON "companies"("enterprise_id", "status");

-- CreateIndex
CREATE INDEX "idx_company_gstin" ON "companies"("gstin");

-- CreateIndex
CREATE INDEX "idx_ca_company_type" ON "company_addresses"("company_id", "address_type");

-- CreateIndex
CREATE INDEX "idx_ctp_company_type" ON "company_tax_profiles"("company_id", "tax_type");

-- CreateIndex
CREATE INDEX "idx_cba_company_status" ON "company_bank_accounts"("company_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "business_units_bu_code_key" ON "business_units"("bu_code");

-- CreateIndex
CREATE INDEX "idx_bu_company_status" ON "business_units"("company_id", "status");

-- CreateIndex
CREATE INDEX "idx_bu_type_status" ON "business_units"("bu_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "divisions_division_code_key" ON "divisions"("division_code");

-- CreateIndex
CREATE INDEX "idx_div_bu_status" ON "divisions"("bu_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "branches_branch_code_key" ON "branches"("branch_code");

-- CreateIndex
CREATE INDEX "idx_branch_company_status" ON "branches"("company_id", "status");

-- CreateIndex
CREATE INDEX "idx_branch_type_status" ON "branches"("branch_type", "status");

-- CreateIndex
CREATE INDEX "idx_branch_bu_status" ON "branches"("bu_id", "status");

-- CreateIndex
CREATE INDEX "idx_ba_branch_type" ON "branch_addresses"("branch_id", "address_type");

-- CreateIndex
CREATE INDEX "idx_bc_branch_type" ON "branch_contacts"("branch_id", "contact_type");

-- CreateIndex
CREATE UNIQUE INDEX "plants_plant_code_key" ON "plants"("plant_code");

-- CreateIndex
CREATE INDEX "idx_plant_branch_status" ON "plants"("branch_id", "status");

-- CreateIndex
CREATE INDEX "idx_plant_type_status" ON "plants"("plant_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "plant_setting_unique" ON "plant_settings"("plant_id", "setting_key");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_warehouse_code_key" ON "warehouses"("warehouse_code");

-- CreateIndex
CREATE INDEX "idx_wh_branch_status" ON "warehouses"("branch_id", "status");

-- CreateIndex
CREATE INDEX "idx_wh_type_status" ON "warehouses"("warehouse_type", "status");

-- CreateIndex
CREATE INDEX "idx_wh_plant_status" ON "warehouses"("plant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_setting_unique" ON "warehouse_settings"("warehouse_id", "setting_key");

-- CreateIndex
CREATE UNIQUE INDEX "departments_dept_code_key" ON "departments"("dept_code");

-- CreateIndex
CREATE INDEX "idx_dept_company_status" ON "departments"("company_id", "status");

-- CreateIndex
CREATE INDEX "idx_dept_branch_status" ON "departments"("branch_id", "status");

-- CreateIndex
CREATE INDEX "idx_dept_parent" ON "departments"("parent_id");

-- CreateIndex
CREATE INDEX "idx_dh_dept_status" ON "department_heads"("dept_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "dept_head_unique" ON "department_heads"("dept_id", "user_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_cost_center_code_key" ON "cost_centers"("cost_center_code");

-- CreateIndex
CREATE INDEX "idx_cc_company_status" ON "cost_centers"("company_id", "status");

-- CreateIndex
CREATE INDEX "idx_cc_branch_status" ON "cost_centers"("branch_id", "status");

-- CreateIndex
CREATE INDEX "idx_cc_type_status" ON "cost_centers"("cost_center_type", "status");

-- CreateIndex
CREATE INDEX "idx_otn_parent" ON "organization_tree_nodes"("parent_type", "parent_id");

-- CreateIndex
CREATE INDEX "idx_otn_level" ON "organization_tree_nodes"("hierarchy_level");

-- CreateIndex
CREATE INDEX "idx_otn_type_status" ON "organization_tree_nodes"("entity_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "org_tree_entity_unique" ON "organization_tree_nodes"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_code_key" ON "roles"("role_code");

-- CreateIndex
CREATE INDEX "idx_role_company_status" ON "roles"("company_id", "status");

-- CreateIndex
CREATE INDEX "idx_role_type_system" ON "roles"("role_type", "is_system_role");

-- CreateIndex
CREATE INDEX "idx_role_parent" ON "roles"("parent_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_permission_code_key" ON "permissions"("permission_code");

-- CreateIndex
CREATE INDEX "idx_perm_module_resource_action" ON "permissions"("module", "resource", "action");

-- CreateIndex
CREATE INDEX "idx_perm_type_status" ON "permissions"("permission_type", "status");

-- CreateIndex
CREATE INDEX "idx_perm_group" ON "permissions"("permission_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "permission_groups_group_code_key" ON "permission_groups"("group_code");

-- CreateIndex
CREATE INDEX "idx_pg_module_status" ON "permission_groups"("module", "status");

-- CreateIndex
CREATE INDEX "idx_rp_role" ON "role_permissions"("role_id");

-- CreateIndex
CREATE INDEX "idx_rp_permission" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_unique" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "idx_ra_user_status" ON "role_assignments"("user_id", "status");

-- CreateIndex
CREATE INDEX "idx_ra_role_status" ON "role_assignments"("role_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "role_assignment_unique" ON "role_assignments"("user_id", "role_id", "branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_groups_group_code_key" ON "user_groups"("group_code");

-- CreateIndex
CREATE INDEX "idx_ug_company_status" ON "user_groups"("company_id", "status");

-- CreateIndex
CREATE INDEX "idx_ug_type_status" ON "user_groups"("group_type", "status");

-- CreateIndex
CREATE INDEX "idx_gm_group_status" ON "group_members"("group_id", "status");

-- CreateIndex
CREATE INDEX "idx_gm_user_status" ON "group_members"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "group_member_unique" ON "group_members"("group_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_gr_group_status" ON "group_roles"("group_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "group_role_unique" ON "group_roles"("group_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "menus_menu_code_key" ON "menus"("menu_code");

-- CreateIndex
CREATE INDEX "idx_menu_parent_order" ON "menus"("parent_menu_id", "display_order");

-- CreateIndex
CREATE INDEX "idx_menu_module_status" ON "menus"("module_id", "status");

-- CreateIndex
CREATE INDEX "idx_menu_visible_status" ON "menus"("is_visible", "status");

-- CreateIndex
CREATE INDEX "idx_mp_menu" ON "menu_permissions"("menu_id");

-- CreateIndex
CREATE INDEX "idx_mp_permission" ON "menu_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "menu_permission_unique" ON "menu_permissions"("menu_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "approval_levels_level_code_key" ON "approval_levels"("level_code");

-- CreateIndex
CREATE INDEX "idx_al_company_module_doc" ON "approval_levels"("company_id", "module", "document_type");

-- CreateIndex
CREATE INDEX "idx_al_level_status" ON "approval_levels"("level_number", "status");

-- CreateIndex
CREATE INDEX "idx_appr_user_module_doc" ON "approval_limits"("user_id", "module", "document_type", "status");

-- CreateIndex
CREATE INDEX "idx_appr_company_status" ON "approval_limits"("company_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "security_policies_policy_code_key" ON "security_policies"("policy_code");

-- CreateIndex
CREATE INDEX "idx_sp_type_status" ON "security_policies"("policy_type", "status");

-- CreateIndex
CREATE INDEX "idx_sp_company_branch_status" ON "security_policies"("company_id", "branch_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_flag_key_key" ON "feature_flags"("flag_key");

-- CreateIndex
CREATE INDEX "idx_ff_state_status" ON "feature_flags"("current_state", "status");

-- CreateIndex
CREATE INDEX "idx_ff_kill_switch" ON "feature_flags"("kill_switch_enabled");

-- CreateIndex
CREATE INDEX "idx_fa_flag_status" ON "feature_assignments"("flag_id", "status");

-- CreateIndex
CREATE INDEX "idx_fa_target_status" ON "feature_assignments"("target_type", "target_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "feature_assignment_unique" ON "feature_assignments"("flag_id", "target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_category_code_key" ON "product_categories"("category_code");

-- CreateIndex
CREATE INDEX "idx_pc_parent_order" ON "product_categories"("parent_category_id", "display_order");

-- CreateIndex
CREATE INDEX "idx_pc_status_leaf" ON "product_categories"("status", "is_leaf");

-- CreateIndex
CREATE UNIQUE INDEX "brands_brand_code_key" ON "brands"("brand_code");

-- CreateIndex
CREATE INDEX "idx_brand_status" ON "brands"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uoms_uom_code_key" ON "uoms"("uom_code");

-- CreateIndex
CREATE INDEX "idx_uom_type_status" ON "uoms"("uom_type", "status");

-- CreateIndex
CREATE INDEX "idx_uc_from" ON "uom_conversions"("from_uom_id");

-- CreateIndex
CREATE INDEX "idx_uc_to" ON "uom_conversions"("to_uom_id");

-- CreateIndex
CREATE UNIQUE INDEX "uom_conversion_unique" ON "uom_conversions"("from_uom_id", "to_uom_id", "company_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_upi_key" ON "products"("upi");

-- CreateIndex
CREATE UNIQUE INDEX "products_product_code_key" ON "products"("product_code");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "idx_product_type_status" ON "products"("product_type", "status");

-- CreateIndex
CREATE INDEX "idx_product_brand_status" ON "products"("brand_id", "status");

-- CreateIndex
CREATE INDEX "idx_product_category_status" ON "products"("category_id", "status");

-- CreateIndex
CREATE INDEX "idx_product_sku_status" ON "products"("sku", "status");

-- CreateIndex
CREATE INDEX "idx_product_upi" ON "products"("upi");

-- CreateIndex
CREATE INDEX "idx_product_channels" ON "products"("is_manufactured", "is_purchased", "is_sold");

-- CreateIndex
CREATE UNIQUE INDEX "attributes_attribute_code_key" ON "attributes"("attribute_code");

-- CreateIndex
CREATE INDEX "idx_attr_variant_status" ON "attributes"("is_variant_attribute", "status");

-- CreateIndex
CREATE INDEX "idx_av_attr_status" ON "attribute_values"("attribute_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "attr_value_unique" ON "attribute_values"("attribute_id", "value");

-- CreateIndex
CREATE INDEX "idx_pa_product" ON "product_attributes"("product_id");

-- CreateIndex
CREATE INDEX "idx_pa_attribute" ON "product_attributes"("attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_attr_unique" ON "product_attributes"("product_id", "attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_variant_code_key" ON "product_variants"("variant_code");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_variant_sku_key" ON "product_variants"("variant_sku");

-- CreateIndex
CREATE INDEX "idx_pv_product_status" ON "product_variants"("product_id", "status");

-- CreateIndex
CREATE INDEX "idx_pv_sku" ON "product_variants"("variant_sku");

-- CreateIndex
CREATE INDEX "idx_pimg_product_type_order" ON "product_images"("product_id", "image_type", "display_order");

-- CreateIndex
CREATE INDEX "idx_pimg_variant" ON "product_images"("variant_id");

-- CreateIndex
CREATE INDEX "idx_pdoc_product_type" ON "product_documents"("product_id", "document_type");

-- CreateIndex
CREATE INDEX "idx_pdoc_type_verified" ON "product_documents"("document_type", "is_verified");

-- CreateIndex
CREATE UNIQUE INDEX "product_families_family_code_key" ON "product_families"("family_code");

-- CreateIndex
CREATE INDEX "idx_pf_status" ON "product_families"("status");

-- CreateIndex
CREATE INDEX "idx_pfm_family" ON "product_family_mappings"("family_id");

-- CreateIndex
CREATE INDEX "idx_pfm_product" ON "product_family_mappings"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "pfm_unique" ON "product_family_mappings"("product_id", "family_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_groups_group_code_key" ON "product_groups"("group_code");

-- CreateIndex
CREATE INDEX "idx_pg_parent_order" ON "product_groups"("parent_group_id", "display_order");

-- CreateIndex
CREATE INDEX "idx_pg_status" ON "product_groups"("status");

-- CreateIndex
CREATE INDEX "idx_pgm_group" ON "product_group_mappings"("group_id");

-- CreateIndex
CREATE INDEX "idx_pgm_product" ON "product_group_mappings"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "pgm_unique" ON "product_group_mappings"("product_id", "group_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_collections_collection_code_key" ON "product_collections"("collection_code");

-- CreateIndex
CREATE INDEX "idx_pcol_type_status" ON "product_collections"("collection_type", "status");

-- CreateIndex
CREATE INDEX "idx_pcol_dates" ON "product_collections"("status", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "idx_pci_collection_order" ON "product_collection_items"("collection_id", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "pci_unique" ON "product_collection_items"("collection_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_templates_template_code_key" ON "product_templates"("template_code");

-- CreateIndex
CREATE INDEX "idx_pt_status" ON "product_templates"("status");

-- CreateIndex
CREATE INDEX "idx_pspec_product" ON "product_specifications"("product_id");

-- CreateIndex
CREATE INDEX "idx_pcomp_product_type" ON "product_compliance"("product_id", "compliance_type");

-- CreateIndex
CREATE INDEX "idx_pcomp_type_status" ON "product_compliance"("compliance_type", "status");

-- CreateIndex
CREATE INDEX "idx_pcomp_expiry" ON "product_compliance"("expiry_date");

-- CreateIndex
CREATE INDEX "idx_pt_product" ON "product_translations"("product_id");

-- CreateIndex
CREATE INDEX "idx_pt_lang" ON "product_translations"("language_code");

-- CreateIndex
CREATE UNIQUE INDEX "pt_unique" ON "product_translations"("product_id", "language_code");

-- CreateIndex
CREATE INDEX "idx_pv_product_version" ON "product_versions"("product_id", "version_number");

-- CreateIndex
CREATE INDEX "idx_pv_product_current" ON "product_versions"("product_id", "is_current");

-- CreateIndex
CREATE INDEX "idx_pv_approval" ON "product_versions"("approvalStatus");

-- CreateIndex
CREATE UNIQUE INDEX "product_approval_requests_request_number_key" ON "product_approval_requests"("request_number");

-- CreateIndex
CREATE INDEX "idx_par_product_status" ON "product_approval_requests"("product_id", "status");

-- CreateIndex
CREATE INDEX "idx_par_stage_status" ON "product_approval_requests"("current_stage", "status");

-- CreateIndex
CREATE INDEX "idx_par_submitter" ON "product_approval_requests"("submitted_by", "status");

-- CreateIndex
CREATE INDEX "idx_par_sla" ON "product_approval_requests"("sla_due_at", "sla_breached");

-- CreateIndex
CREATE INDEX "idx_pum_product" ON "product_usage_matrix"("product_id");

-- CreateIndex
CREATE INDEX "idx_pum_mfg" ON "product_usage_matrix"("use_in_manufacturing");

-- CreateIndex
CREATE INDEX "idx_pum_retail" ON "product_usage_matrix"("use_in_retail_pos");

-- CreateIndex
CREATE INDEX "idx_pum_restaurant" ON "product_usage_matrix"("use_in_restaurant_pos");

-- CreateIndex
CREATE UNIQUE INDEX "price_lists_code_key" ON "price_lists"("code");

-- CreateIndex
CREATE INDEX "idx_pl_type_status" ON "price_lists"("type", "status");

-- CreateIndex
CREATE INDEX "idx_pl_scope" ON "price_lists"("company_id", "branch_id");

-- CreateIndex
CREATE INDEX "idx_pl_priority" ON "price_lists"("priority");

-- CreateIndex
CREATE INDEX "idx_pl_validity" ON "price_lists"("valid_from", "valid_to");

-- CreateIndex
CREATE INDEX "idx_pli_list_status" ON "price_list_items"("price_list_id", "status");

-- CreateIndex
CREATE INDEX "idx_pli_product_list" ON "price_list_items"("product_id", "price_list_id");

-- CreateIndex
CREATE INDEX "idx_pli_product_status" ON "price_list_items"("product_id", "status");

-- CreateIndex
CREATE INDEX "idx_pli_validity" ON "price_list_items"("valid_from", "valid_to");

-- CreateIndex
CREATE INDEX "idx_plv_list_version" ON "price_list_versions"("price_list_id", "version");

-- CreateIndex
CREATE INDEX "idx_pp_product_status" ON "product_prices"("product_id", "status");

-- CreateIndex
CREATE INDEX "idx_pp_scope" ON "product_prices"("company_id", "branch_id");

-- CreateIndex
CREATE INDEX "idx_pp_customer" ON "product_prices"("customer_id");

-- CreateIndex
CREATE INDEX "idx_pp_effective" ON "product_prices"("effective_from", "effective_to");

-- CreateIndex
CREATE UNIQUE INDEX "tax_groups_code_key" ON "tax_groups"("code");

-- CreateIndex
CREATE INDEX "idx_tg_type_status" ON "tax_groups"("type", "status");

-- CreateIndex
CREATE INDEX "idx_tr_group_status" ON "tax_rates"("tax_group_id", "status");

-- CreateIndex
CREATE INDEX "idx_tr_component" ON "tax_rates"("component_type");

-- CreateIndex
CREATE INDEX "idx_tr_effective" ON "tax_rates"("effective_from", "effective_to");

-- CreateIndex
CREATE INDEX "idx_ptm_product_status" ON "product_tax_mapping"("product_id", "status");

-- CreateIndex
CREATE INDEX "idx_ptm_group" ON "product_tax_mapping"("tax_group_id");

-- CreateIndex
CREATE INDEX "idx_ptm_hsn" ON "product_tax_mapping"("hsn_code");

-- CreateIndex
CREATE INDEX "idx_txr_condition" ON "tax_rules"("condition_type", "status");

-- CreateIndex
CREATE INDEX "idx_txr_priority" ON "tax_rules"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "discount_rules_code_key" ON "discount_rules"("code");

-- CreateIndex
CREATE INDEX "idx_dr_type_status" ON "discount_rules"("type", "status");

-- CreateIndex
CREATE INDEX "idx_dr_validity" ON "discount_rules"("valid_from", "valid_to");

-- CreateIndex
CREATE INDEX "idx_dc_rule" ON "discount_conditions"("discount_rule_id");

-- CreateIndex
CREATE INDEX "idx_dc_field" ON "discount_conditions"("condition_field");

-- CreateIndex
CREATE INDEX "idx_dt_rule" ON "discount_targets"("discount_rule_id");

-- CreateIndex
CREATE INDEX "idx_dt_target" ON "discount_targets"("target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "promotions_code_key" ON "promotions"("code");

-- CreateIndex
CREATE INDEX "idx_pr_type_status" ON "promotions"("type", "status");

-- CreateIndex
CREATE INDEX "idx_pr_validity" ON "promotions"("valid_from", "valid_to");

-- CreateIndex
CREATE INDEX "idx_pr_status_priority" ON "promotions"("status", "priority");

-- CreateIndex
CREATE INDEX "idx_pp_promo" ON "promotion_products"("promotion_id");

-- CreateIndex
CREATE INDEX "idx_pp_product" ON "promotion_products"("product_id");

-- CreateIndex
CREATE INDEX "idx_pc_promo" ON "promotion_conditions"("promotion_id");

-- CreateIndex
CREATE INDEX "idx_cp_product_status" ON "cost_profiles"("product_id", "status");

-- CreateIndex
CREATE INDEX "idx_cp_scope" ON "cost_profiles"("company_id", "branch_id");

-- CreateIndex
CREATE INDEX "idx_cp_effective" ON "cost_profiles"("effective_from");

-- CreateIndex
CREATE INDEX "idx_mr_product" ON "margin_rules"("product_id");

-- CreateIndex
CREATE INDEX "idx_mr_category_brand" ON "margin_rules"("category_id", "brand_id");

-- CreateIndex
CREATE INDEX "idx_fp_product_status" ON "future_prices"("product_id", "status");

-- CreateIndex
CREATE INDEX "idx_fp_effective" ON "future_prices"("effective_date");

-- CreateIndex
CREATE INDEX "idx_fp_status_effective" ON "future_prices"("status", "effective_date");

-- CreateIndex
CREATE INDEX "idx_par_price_entity" ON "price_approval_requests"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_par_price_stage" ON "price_approval_requests"("current_stage", "status");

-- CreateIndex
CREATE INDEX "idx_par_price_type_status" ON "price_approval_requests"("entity_type", "status");

-- CreateIndex
CREATE INDEX "idx_par_price_sla" ON "price_approval_requests"("sla_due_at", "sla_breached");

-- CreateIndex
CREATE INDEX "idx_par_price_status_stage" ON "price_approval_requests"("status", "current_stage");

-- CreateIndex
CREATE UNIQUE INDEX "commercial_rules_code_key" ON "commercial_rules"("code");

-- CreateIndex
CREATE INDEX "idx_cr_type_status" ON "commercial_rules"("rule_type", "status");

-- CreateIndex
CREATE INDEX "idx_cr_scope" ON "commercial_rules"("company_id", "branch_id");

-- CreateIndex
CREATE INDEX "idx_cr_product_customer" ON "commercial_rules"("product_id", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "price_resolution_logs_request_id_key" ON "price_resolution_logs"("request_id");

-- CreateIndex
CREATE INDEX "idx_prl_product_time" ON "price_resolution_logs"("product_id", "requested_at");

-- CreateIndex
CREATE INDEX "idx_prl_channel" ON "price_resolution_logs"("channel_id");

-- CreateIndex
CREATE INDEX "idx_prl_customer" ON "price_resolution_logs"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_partners_partner_code_key" ON "business_partners"("partner_code");

-- CreateIndex
CREATE INDEX "idx_bp_type_status" ON "business_partners"("partner_type", "status");

-- CreateIndex
CREATE INDEX "idx_bp_gst" ON "business_partners"("gst_number");

-- CreateIndex
CREATE INDEX "idx_bp_pan" ON "business_partners"("pan_number");

-- CreateIndex
CREATE INDEX "idx_bp_parent" ON "business_partners"("parent_partner_id");

-- CreateIndex
CREATE INDEX "idx_bp_status" ON "business_partners"("status");

-- CreateIndex
CREATE INDEX "idx_bpr_role_status" ON "business_partner_roles"("role", "status");

-- CreateIndex
CREATE INDEX "idx_bpr_partner" ON "business_partner_roles"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "bpr_unique_partner_role" ON "business_partner_roles"("partner_id", "role");

-- CreateIndex
CREATE INDEX "idx_bpa_partner_type" ON "business_partner_addresses"("partner_id", "address_type");

-- CreateIndex
CREATE INDEX "idx_bpa_city_state" ON "business_partner_addresses"("city", "state");

-- CreateIndex
CREATE INDEX "idx_bpa_pincode" ON "business_partner_addresses"("pincode");

-- CreateIndex
CREATE INDEX "idx_bpc_partner_status" ON "business_partner_contacts"("partner_id", "status");

-- CreateIndex
CREATE INDEX "idx_bpc_email" ON "business_partner_contacts"("email");

-- CreateIndex
CREATE INDEX "idx_bpc_mobile" ON "business_partner_contacts"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "business_partner_financial_profiles_partner_id_key" ON "business_partner_financial_profiles"("partner_id");

-- CreateIndex
CREATE INDEX "idx_bpfp_risk" ON "business_partner_financial_profiles"("risk_category");

-- CreateIndex
CREATE INDEX "idx_bpfp_payment_mode" ON "business_partner_financial_profiles"("payment_mode");

-- CreateIndex
CREATE INDEX "idx_bpcomp_partner_status" ON "business_partner_compliance"("partner_id", "status");

-- CreateIndex
CREATE INDEX "idx_bpcomp_type_status" ON "business_partner_compliance"("compliance_type", "status");

-- CreateIndex
CREATE INDEX "idx_bpcomp_expiry" ON "business_partner_compliance"("expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "bpcomp_unique" ON "business_partner_compliance"("partner_id", "compliance_type");

-- CreateIndex
CREATE UNIQUE INDEX "customer_groups_group_code_key" ON "customer_groups"("group_code");

-- CreateIndex
CREATE INDEX "idx_cg_type_status" ON "customer_groups"("groupType", "status");

-- CreateIndex
CREATE INDEX "idx_bpgm_group" ON "business_partner_group_memberships"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "bpgm_unique" ON "business_partner_group_memberships"("partner_id", "group_id");

-- CreateIndex
CREATE UNIQUE INDEX "partner_tags_tag_name_key" ON "partner_tags"("tag_name");

-- CreateIndex
CREATE INDEX "idx_bpba_partner_status" ON "business_partner_bank_accounts"("partner_id", "status");

-- CreateIndex
CREATE INDEX "idx_bpba_ifsc" ON "business_partner_bank_accounts"("ifsc_code");

-- CreateIndex
CREATE INDEX "idx_bprel_from" ON "business_partner_relationships"("from_partner_id");

-- CreateIndex
CREATE INDEX "idx_bprel_to" ON "business_partner_relationships"("to_partner_id");

-- CreateIndex
CREATE INDEX "idx_bprel_type" ON "business_partner_relationships"("relationship_type");

-- CreateIndex
CREATE UNIQUE INDEX "bprel_unique" ON "business_partner_relationships"("from_partner_id", "to_partner_id", "relationship_type");

-- CreateIndex
CREATE INDEX "idx_bps_partner_year" ON "business_partner_scorecards"("partner_id", "period_year");

-- CreateIndex
CREATE INDEX "idx_bps_score" ON "business_partner_scorecards"("overall_score");

-- CreateIndex
CREATE INDEX "idx_bps_grade" ON "business_partner_scorecards"("performance_grade");

-- CreateIndex
CREATE UNIQUE INDEX "bps_unique_period" ON "business_partner_scorecards"("partner_id", "period_year", "period_quarter");

-- CreateIndex
CREATE UNIQUE INDEX "barcode_types_code_key" ON "barcode_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "barcodes_barcode_key" ON "barcodes"("barcode");

-- CreateIndex
CREATE INDEX "idx_bc_product_primary" ON "barcodes"("product_id", "is_primary");

-- CreateIndex
CREATE INDEX "idx_bc_type" ON "barcodes"("barcode_type_id");

-- CreateIndex
CREATE INDEX "idx_bc_status" ON "barcodes"("status");

-- CreateIndex
CREATE INDEX "idx_bca_entity" ON "barcode_assignments"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_bca_barcode" ON "barcode_assignments"("barcode_id");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_qrCode_key" ON "qr_codes"("qrCode");

-- CreateIndex
CREATE INDEX "idx_qr_purpose_status" ON "qr_codes"("purpose", "status");

-- CreateIndex
CREATE INDEX "idx_qr_entity" ON "qr_codes"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_qr_expiry" ON "qr_codes"("expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "batches_batchNumber_key" ON "batches"("batchNumber");

-- CreateIndex
CREATE INDEX "idx_batch_product_status" ON "batches"("product_id", "status");

-- CreateIndex
CREATE INDEX "idx_batch_number" ON "batches"("batchNumber");

-- CreateIndex
CREATE INDEX "idx_batch_expiry" ON "batches"("expiry_date");

-- CreateIndex
CREATE INDEX "idx_batch_mfg" ON "batches"("manufacturing_date");

-- CreateIndex
CREATE INDEX "idx_batch_status" ON "batches"("status");

-- CreateIndex
CREATE UNIQUE INDEX "lots_lotNumber_key" ON "lots"("lotNumber");

-- CreateIndex
CREATE INDEX "idx_lot_batch" ON "lots"("batch_id");

-- CreateIndex
CREATE INDEX "idx_lot_product" ON "lots"("product_id");

-- CreateIndex
CREATE INDEX "idx_lot_type_status" ON "lots"("lot_type", "status");

-- CreateIndex
CREATE INDEX "idx_lot_supplier" ON "lots"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "serial_numbers_serialNumber_key" ON "serial_numbers"("serialNumber");

-- CreateIndex
CREATE INDEX "idx_sn_product_status" ON "serial_numbers"("product_id", "status");

-- CreateIndex
CREATE INDEX "idx_sn_serial" ON "serial_numbers"("serialNumber");

-- CreateIndex
CREATE INDEX "idx_sn_entity_type" ON "serial_numbers"("entity_type");

-- CreateIndex
CREATE INDEX "idx_sn_warranty_end" ON "serial_numbers"("warranty_end");

-- CreateIndex
CREATE UNIQUE INDEX "gs1_identifiers_identifier_key" ON "gs1_identifiers"("identifier");

-- CreateIndex
CREATE INDEX "idx_gs1_type_status" ON "gs1_identifiers"("gs1_type", "status");

-- CreateIndex
CREATE INDEX "idx_gs1_company" ON "gs1_identifiers"("company_prefix");

-- CreateIndex
CREATE INDEX "idx_gs1_entity" ON "gs1_identifiers"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "label_templates_template_code_key" ON "label_templates"("template_code");

-- CreateIndex
CREATE INDEX "idx_lt_type_status" ON "label_templates"("label_type", "status");

-- CreateIndex
CREATE INDEX "idx_lt_format" ON "label_templates"("print_format");

-- CreateIndex
CREATE INDEX "idx_lpj_template_status" ON "label_print_jobs"("template_id", "status");

-- CreateIndex
CREATE INDEX "idx_lpj_status_scheduled" ON "label_print_jobs"("status", "scheduled_at");

-- CreateIndex
CREATE INDEX "idx_lpj_printer" ON "label_print_jobs"("printer_name");

-- CreateIndex
CREATE INDEX "idx_tl_entity" ON "traceability_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_tl_batch" ON "traceability_logs"("batch_id");

-- CreateIndex
CREATE INDEX "idx_tl_event_type" ON "traceability_logs"("event_type");

-- CreateIndex
CREATE INDEX "idx_tl_event_date" ON "traceability_logs"("event_date");

-- CreateIndex
CREATE INDEX "idx_tl_partner" ON "traceability_logs"("partner_id");

-- CreateIndex
CREATE INDEX "idx_tl_reference" ON "traceability_logs"("reference_number");

-- CreateIndex
CREATE UNIQUE INDEX "product_lifecycle_product_id_key" ON "product_lifecycle"("product_id");

-- CreateIndex
CREATE INDEX "idx_plc_state" ON "product_lifecycle"("current_state");

-- CreateIndex
CREATE INDEX "idx_plh_product_time" ON "product_lifecycle_history"("product_id", "changed_at");

-- CreateIndex
CREATE INDEX "idx_plh_transition" ON "product_lifecycle_history"("from_state", "to_state");

-- CreateIndex
CREATE INDEX "idx_paw_product_status" ON "product_approval_workflows"("product_id", "status");

-- CreateIndex
CREATE INDEX "idx_paw_stage_status" ON "product_approval_workflows"("current_stage", "status");

-- CreateIndex
CREATE INDEX "idx_paw_sla" ON "product_approval_workflows"("sla_due_at", "sla_breached");

-- CreateIndex
CREATE INDEX "idx_pas_workflow_order" ON "product_approval_steps"("workflow_id", "step_order");

-- CreateIndex
CREATE INDEX "idx_pas_decision" ON "product_approval_steps"("decision");

-- CreateIndex
CREATE INDEX "idx_pal_workflow_time" ON "product_approval_logs"("workflow_id", "action_at");

-- CreateIndex
CREATE INDEX "idx_pal_action" ON "product_approval_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "import_jobs_job_code_key" ON "import_jobs"("job_code");

-- CreateIndex
CREATE INDEX "idx_ij_entity_status" ON "import_jobs"("entity_type", "status");

-- CreateIndex
CREATE INDEX "idx_ij_status_time" ON "import_jobs"("status", "initiated_at");

-- CreateIndex
CREATE UNIQUE INDEX "export_jobs_job_code_key" ON "export_jobs"("job_code");

-- CreateIndex
CREATE INDEX "idx_ej_entity_status" ON "export_jobs"("entity_type", "status");

-- CreateIndex
CREATE INDEX "idx_ej_status" ON "export_jobs"("status");

-- CreateIndex
CREATE INDEX "idx_ie_job_row" ON "import_errors"("import_job_id", "row_number");

-- CreateIndex
CREATE INDEX "idx_ie_type_severity" ON "import_errors"("error_type", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "validation_rules_rule_code_key" ON "validation_rules"("rule_code");

-- CreateIndex
CREATE INDEX "idx_vr_entity_field" ON "validation_rules"("entity_type", "field_name");

-- CreateIndex
CREATE INDEX "idx_vr_type_status" ON "validation_rules"("rule_type", "status");

-- CreateIndex
CREATE INDEX "idx_vres_entity_valid" ON "validation_results"("entity_type", "entity_id", "is_valid");

-- CreateIndex
CREATE INDEX "idx_vres_rule_valid" ON "validation_results"("rule_id", "is_valid");

-- CreateIndex
CREATE INDEX "idx_vres_batch" ON "validation_results"("validation_batch");

-- CreateIndex
CREATE INDEX "idx_dc_primary" ON "duplicate_candidates"("primary_entity_type", "primary_entity_id");

-- CreateIndex
CREATE INDEX "idx_dc_duplicate" ON "duplicate_candidates"("duplicate_entity_type", "duplicate_entity_id");

-- CreateIndex
CREATE INDEX "idx_dc_resolution" ON "duplicate_candidates"("resolution_status");

-- CreateIndex
CREATE INDEX "idx_dc_score" ON "duplicate_candidates"("match_score");

-- CreateIndex
CREATE INDEX "idx_mh_entity_primary" ON "merge_history"("entity_type", "primary_entity_id");

-- CreateIndex
CREATE INDEX "idx_mh_time" ON "merge_history"("merged_at");

-- CreateIndex
CREATE INDEX "idx_mda_entity_time" ON "master_data_audit"("entity_type", "entity_id", "changed_at");

-- CreateIndex
CREATE INDEX "idx_mda_action_module" ON "master_data_audit"("action", "module_name");

-- CreateIndex
CREATE INDEX "idx_mda_user_time" ON "master_data_audit"("user_id", "changed_at");

-- CreateIndex
CREATE INDEX "idx_mda_time" ON "master_data_audit"("changed_at");

-- CreateIndex
CREATE INDEX "idx_dqm_entity_metric_period" ON "data_quality_metrics"("entity_type", "metric_name", "period_date");

-- CreateIndex
CREATE INDEX "idx_dqm_score" ON "data_quality_metrics"("quality_score");

-- CreateIndex
CREATE INDEX "idx_dqm_period" ON "data_quality_metrics"("period_date");

-- CreateIndex
CREATE INDEX "idx_pch_product_version" ON "product_change_history"("product_id", "version");

-- CreateIndex
CREATE INDEX "idx_pch_product_time" ON "product_change_history"("product_id", "changed_at");

-- CreateIndex
CREATE INDEX "idx_pch_type" ON "product_change_history"("change_type");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_transaction_types_code_key" ON "inventory_transaction_types"("code");

-- CreateIndex
CREATE INDEX "idx_itt_effect_status" ON "inventory_transaction_types"("effect_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_transactions_transaction_number_key" ON "inventory_transactions"("transaction_number");

-- CreateIndex
CREATE INDEX "idx_it_type_status" ON "inventory_transactions"("transaction_type_id", "status");

-- CreateIndex
CREATE INDEX "idx_it_warehouse_date" ON "inventory_transactions"("warehouse_id", "transaction_date");

-- CreateIndex
CREATE INDEX "idx_it_reference" ON "inventory_transactions"("reference_type", "reference_number");

-- CreateIndex
CREATE INDEX "idx_it_status_date" ON "inventory_transactions"("status", "transaction_date");

-- CreateIndex
CREATE INDEX "idx_it_partner" ON "inventory_transactions"("partner_id");

-- CreateIndex
CREATE INDEX "idx_itl_transaction_order" ON "inventory_transaction_lines"("transaction_id", "line_order");

-- CreateIndex
CREATE INDEX "idx_itl_product_batch" ON "inventory_transaction_lines"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_itl_status" ON "inventory_transaction_lines"("inventory_status");

-- CreateIndex
CREATE INDEX "idx_sl_product_warehouse_date" ON "stock_ledger"("product_id", "warehouse_id", "posting_date");

-- CreateIndex
CREATE INDEX "idx_sl_transaction" ON "stock_ledger"("transaction_id");

-- CreateIndex
CREATE INDEX "idx_sl_batch" ON "stock_ledger"("batch_id");

-- CreateIndex
CREATE INDEX "idx_sl_posting_date" ON "stock_ledger"("posting_date");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_statuses_code_key" ON "inventory_statuses"("code");

-- CreateIndex
CREATE INDEX "idx_is_available_status" ON "inventory_statuses"("is_available", "status");

-- CreateIndex
CREATE INDEX "idx_sb_product_warehouse" ON "stock_balances"("product_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "idx_sb_warehouse_available" ON "stock_balances"("warehouse_id", "available_quantity");

-- CreateIndex
CREATE INDEX "idx_sb_batch_expiry" ON "stock_balances"("batch_id", "expiry_date");

-- CreateIndex
CREATE INDEX "idx_sb_product_batch" ON "stock_balances"("product_id", "batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "sb_unique_scope" ON "stock_balances"("product_id", "product_variant_id", "warehouse_id", "location_id", "bin", "batch_id", "lot_id", "serial_number_id");

-- CreateIndex
CREATE INDEX "idx_sm_product_date" ON "stock_movements"("product_id", "movement_date");

-- CreateIndex
CREATE INDEX "idx_sm_type" ON "stock_movements"("movement_type");

-- CreateIndex
CREATE INDEX "idx_sm_warehouses" ON "stock_movements"("from_warehouse_id", "to_warehouse_id");

-- CreateIndex
CREATE INDEX "idx_sm_batch" ON "stock_movements"("batch_id");

-- CreateIndex
CREATE INDEX "idx_sm_reference" ON "stock_movements"("reference_number");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_journal_journal_entry_number_key" ON "inventory_journal"("journal_entry_number");

-- CreateIndex
CREATE INDEX "idx_ij_product_warehouse_date" ON "inventory_journal"("product_id", "warehouse_id", "posting_date");

-- CreateIndex
CREATE INDEX "idx_ij_transaction" ON "inventory_journal"("transaction_id");

-- CreateIndex
CREATE INDEX "idx_ij_account_date" ON "inventory_journal"("inventory_account", "posting_date");

-- CreateIndex
CREATE INDEX "idx_ij_posting_date" ON "inventory_journal"("posting_date");

-- CreateIndex
CREATE UNIQUE INDEX "goods_receipts_grn_number_key" ON "goods_receipts"("grn_number");

-- CreateIndex
CREATE INDEX "idx_gr_type_status" ON "goods_receipts"("receipt_type", "status");

-- CreateIndex
CREATE INDEX "idx_gr_supplier_date" ON "goods_receipts"("supplier_id", "receipt_date");

-- CreateIndex
CREATE INDEX "idx_gr_warehouse_status" ON "goods_receipts"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_gr_reference" ON "goods_receipts"("reference_type", "reference_number");

-- CreateIndex
CREATE INDEX "idx_gr_date" ON "goods_receipts"("receipt_date");

-- CreateIndex
CREATE INDEX "idx_grl_gr_order" ON "goods_receipt_lines"("goods_receipt_id", "line_order");

-- CreateIndex
CREATE INDEX "idx_grl_product_batch" ON "goods_receipt_lines"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_grl_quality" ON "goods_receipt_lines"("quality_status");

-- CreateIndex
CREATE INDEX "idx_grl_putaway" ON "goods_receipt_lines"("putaway_status");

-- CreateIndex
CREATE UNIQUE INDEX "putaway_rules_rule_code_key" ON "putaway_rules"("rule_code");

-- CreateIndex
CREATE INDEX "idx_pr_strategy_status" ON "putaway_rules"("strategy", "status");

-- CreateIndex
CREATE INDEX "idx_pr_warehouse" ON "putaway_rules"("warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "putaway_tasks_task_number_key" ON "putaway_tasks"("task_number");

-- CreateIndex
CREATE INDEX "idx_pt_gr" ON "putaway_tasks"("goods_receipt_id");

-- CreateIndex
CREATE INDEX "idx_pt_status_assignee" ON "putaway_tasks"("status", "assigned_to_id");

-- CreateIndex
CREATE INDEX "idx_pt_target" ON "putaway_tasks"("to_warehouse_id", "to_bin");

-- CreateIndex
CREATE INDEX "idx_putaway_product" ON "putaway_tasks"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "quality_holds_hold_number_key" ON "quality_holds"("hold_number");

-- CreateIndex
CREATE INDEX "idx_qh_gr" ON "quality_holds"("goods_receipt_id");

-- CreateIndex
CREATE INDEX "idx_qh_status" ON "quality_holds"("status", "resolution_status");

-- CreateIndex
CREATE INDEX "idx_qh_product_batch" ON "quality_holds"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_qh_reason" ON "quality_holds"("hold_reason");

-- CreateIndex
CREATE UNIQUE INDEX "stock_issues_issue_number_key" ON "stock_issues"("issue_number");

-- CreateIndex
CREATE INDEX "idx_si_type_status" ON "stock_issues"("issue_type", "status");

-- CreateIndex
CREATE INDEX "idx_si_warehouse_date" ON "stock_issues"("warehouse_id", "issue_date");

-- CreateIndex
CREATE INDEX "idx_si_reference" ON "stock_issues"("reference_type", "reference_number");

-- CreateIndex
CREATE INDEX "idx_si_status_date" ON "stock_issues"("status", "issue_date");

-- CreateIndex
CREATE INDEX "idx_si_requester" ON "stock_issues"("requested_by_id");

-- CreateIndex
CREATE INDEX "idx_sil_si_order" ON "stock_issue_lines"("stock_issue_id", "line_order");

-- CreateIndex
CREATE INDEX "idx_sil_product_batch" ON "stock_issue_lines"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_sil_picking" ON "stock_issue_lines"("picking_status");

-- CreateIndex
CREATE UNIQUE INDEX "picking_tasks_task_number_key" ON "picking_tasks"("task_number");

-- CreateIndex
CREATE INDEX "idx_pickts_si" ON "picking_tasks"("stock_issue_id");

-- CreateIndex
CREATE INDEX "idx_pickts_status_assignee" ON "picking_tasks"("status", "assigned_to_id");

-- CreateIndex
CREATE INDEX "idx_pickts_warehouse_zone" ON "picking_tasks"("warehouse_id", "zone");

-- CreateIndex
CREATE INDEX "idx_ptl_pt_order" ON "picking_task_lines"("picking_task_id", "line_order");

-- CreateIndex
CREATE INDEX "idx_ptl_product_batch" ON "picking_task_lines"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_ptl_status" ON "picking_task_lines"("status");

-- CreateIndex
CREATE UNIQUE INDEX "scrap_records_scrap_number_key" ON "scrap_records"("scrap_number");

-- CreateIndex
CREATE INDEX "idx_sr_type_status" ON "scrap_records"("scrap_type", "status");

-- CreateIndex
CREATE INDEX "idx_sr_product_batch" ON "scrap_records"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_sr_warehouse_date" ON "scrap_records"("warehouse_id", "scrap_date");

-- CreateIndex
CREATE INDEX "idx_sr_status" ON "scrap_records"("status");

-- CreateIndex
CREATE UNIQUE INDEX "damage_records_damage_number_key" ON "damage_records"("damage_number");

-- CreateIndex
CREATE INDEX "idx_dmg_type_status" ON "damage_records"("damage_type", "status");

-- CreateIndex
CREATE INDEX "idx_dmg_product_batch" ON "damage_records"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_dmg_warehouse_date" ON "damage_records"("warehouse_id", "damage_date");

-- CreateIndex
CREATE INDEX "idx_dmg_severity" ON "damage_records"("damage_severity");

-- CreateIndex
CREATE INDEX "idx_dmg_status" ON "damage_records"("status");

-- CreateIndex
CREATE UNIQUE INDEX "stock_transfers_transfer_number_key" ON "stock_transfers"("transfer_number");

-- CreateIndex
CREATE INDEX "idx_st_type_status" ON "stock_transfers"("transfer_type", "status");

-- CreateIndex
CREATE INDEX "idx_st_route" ON "stock_transfers"("source_warehouse_id", "dest_warehouse_id");

-- CreateIndex
CREATE INDEX "idx_st_status_date" ON "stock_transfers"("status", "transfer_date");

-- CreateIndex
CREATE INDEX "idx_stl_st_order" ON "stock_transfer_lines"("stock_transfer_id", "line_order");

-- CreateIndex
CREATE INDEX "idx_stl_product_batch" ON "stock_transfer_lines"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_stl_receipt" ON "stock_transfer_lines"("receipt_status");

-- CreateIndex
CREATE INDEX "idx_iit_transfer" ON "inventory_in_transit"("stock_transfer_id");

-- CreateIndex
CREATE INDEX "idx_iit_status" ON "inventory_in_transit"("transit_status");

-- CreateIndex
CREATE INDEX "idx_iit_route" ON "inventory_in_transit"("source_warehouse_id", "dest_warehouse_id");

-- CreateIndex
CREATE INDEX "idx_iit_eta" ON "inventory_in_transit"("estimated_arrival");

-- CreateIndex
CREATE UNIQUE INDEX "bin_transfers_bin_transfer_number_key" ON "bin_transfers"("bin_transfer_number");

-- CreateIndex
CREATE INDEX "idx_bt_warehouse_status" ON "bin_transfers"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_bt_product_batch" ON "bin_transfers"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_bt_bins" ON "bin_transfers"("from_bin", "to_bin");

-- CreateIndex
CREATE INDEX "idx_bt_status" ON "bin_transfers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_adjustments_adjustment_number_key" ON "inventory_adjustments"("adjustment_number");

-- CreateIndex
CREATE INDEX "idx_ia_type_status" ON "inventory_adjustments"("adjustment_type", "status");

-- CreateIndex
CREATE INDEX "idx_ia_warehouse_date" ON "inventory_adjustments"("warehouse_id", "adjustment_date");

-- CreateIndex
CREATE INDEX "idx_ia_status_date" ON "inventory_adjustments"("status", "adjustment_date");

-- CreateIndex
CREATE INDEX "idx_ia_writeoff" ON "inventory_adjustments"("is_write_off");

-- CreateIndex
CREATE INDEX "idx_ial_ia_order" ON "inventory_adjustment_lines"("inventory_adjustment_id", "line_order");

-- CreateIndex
CREATE INDEX "idx_ial_product_batch" ON "inventory_adjustment_lines"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_ial_root_cause" ON "inventory_adjustment_lines"("root_cause_category");

-- CreateIndex
CREATE UNIQUE INDEX "adjustment_reasons_reason_code_key" ON "adjustment_reasons"("reason_code");

-- CreateIndex
CREATE INDEX "idx_ar_effect_status" ON "adjustment_reasons"("effect_type", "status");

-- CreateIndex
CREATE INDEX "idx_ar_approval" ON "adjustment_reasons"("requires_approval");

-- CreateIndex
CREATE UNIQUE INDEX "damage_reports_s16_damage_report_number_key" ON "damage_reports_s16"("damage_report_number");

-- CreateIndex
CREATE INDEX "idx_dr16_type_status" ON "damage_reports_s16"("damage_type", "status");

-- CreateIndex
CREATE INDEX "idx_dr16_product" ON "damage_reports_s16"("product_id");

-- CreateIndex
CREATE INDEX "idx_dr16_status" ON "damage_reports_s16"("status");

-- CreateIndex
CREATE INDEX "idx_dr16_severity" ON "damage_reports_s16"("damage_severity");

-- CreateIndex
CREATE UNIQUE INDEX "expiry_adjustments_expiry_adjustment_number_key" ON "expiry_adjustments"("expiry_adjustment_number");

-- CreateIndex
CREATE INDEX "idx_ea_category_status" ON "expiry_adjustments"("expiry_category", "status");

-- CreateIndex
CREATE INDEX "idx_ea_product_batch" ON "expiry_adjustments"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_ea_expiry_date" ON "expiry_adjustments"("expiry_date");

-- CreateIndex
CREATE INDEX "idx_ea_status" ON "expiry_adjustments"("status");

-- CreateIndex
CREATE INDEX "idx_arc_category" ON "adjustment_root_causes"("root_cause_category");

-- CreateIndex
CREATE INDEX "idx_arc_adjustment" ON "adjustment_root_causes"("adjustment_id");

-- CreateIndex
CREATE INDEX "idx_arc_action_status" ON "adjustment_root_causes"("action_status");

-- CreateIndex
CREATE INDEX "idx_arc_recurring" ON "adjustment_root_causes"("is_recurring");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_reservations_reservation_number_key" ON "inventory_reservations"("reservation_number");

-- CreateIndex
CREATE INDEX "idx_ir_type_status" ON "inventory_reservations"("reservation_type", "status");

-- CreateIndex
CREATE INDEX "idx_ir_priority_status" ON "inventory_reservations"("priority", "status");

-- CreateIndex
CREATE INDEX "idx_ir_warehouse_status" ON "inventory_reservations"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_ir_expiry" ON "inventory_reservations"("expiry_date");

-- CreateIndex
CREATE INDEX "idx_ir_status" ON "inventory_reservations"("status");

-- CreateIndex
CREATE INDEX "idx_rl_r_order" ON "reservation_lines"("reservation_id", "line_order");

-- CreateIndex
CREATE INDEX "idx_rl_product_batch" ON "reservation_lines"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_rl_allocation" ON "reservation_lines"("allocation_status");

-- CreateIndex
CREATE UNIQUE INDEX "allocation_rules_rule_code_key" ON "allocation_rules"("rule_code");

-- CreateIndex
CREATE INDEX "idx_alr_strategy_status" ON "allocation_rules"("strategy", "status");

-- CreateIndex
CREATE INDEX "idx_alr_reservation_type" ON "allocation_rules"("reservation_type");

-- CreateIndex
CREATE INDEX "idx_as_product_warehouse" ON "availability_snapshots"("product_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "idx_as_snapshot" ON "availability_snapshots"("snapshot_at");

-- CreateIndex
CREATE INDEX "idx_as_available" ON "availability_snapshots"("available_qty");

-- CreateIndex
CREATE UNIQUE INDEX "physical_inventories_count_number_key" ON "physical_inventories"("count_number");

-- CreateIndex
CREATE INDEX "idx_pi_type_status" ON "physical_inventories"("count_type", "status");

-- CreateIndex
CREATE INDEX "idx_pi_warehouse_date" ON "physical_inventories"("warehouse_id", "count_date");

-- CreateIndex
CREATE INDEX "idx_pi_status" ON "physical_inventories"("status");

-- CreateIndex
CREATE INDEX "idx_pil_pi_order" ON "physical_inventory_lines"("physical_inventory_id", "line_order");

-- CreateIndex
CREATE INDEX "idx_pil_product_batch" ON "physical_inventory_lines"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_pil_count_status" ON "physical_inventory_lines"("count_status");

-- CreateIndex
CREATE UNIQUE INDEX "cycle_count_plans_plan_code_key" ON "cycle_count_plans"("plan_code");

-- CreateIndex
CREATE INDEX "idx_ccp_freq_status" ON "cycle_count_plans"("frequency", "status");

-- CreateIndex
CREATE INDEX "idx_ccp_warehouse" ON "cycle_count_plans"("warehouse_id");

-- CreateIndex
CREATE INDEX "idx_ccp_next_run" ON "cycle_count_plans"("next_run_at");

-- CreateIndex
CREATE INDEX "idx_ccs_plan_date" ON "cycle_count_schedules"("plan_id", "schedule_date");

-- CreateIndex
CREATE INDEX "idx_ccs_status_date" ON "cycle_count_schedules"("status", "schedule_date");

-- CreateIndex
CREATE INDEX "idx_ccs_abc" ON "cycle_count_schedules"("abc_class");

-- CreateIndex
CREATE UNIQUE INDEX "count_teams_team_code_key" ON "count_teams"("team_code");

-- CreateIndex
CREATE INDEX "idx_ct_status" ON "count_teams"("status");

-- CreateIndex
CREATE INDEX "idx_ct_warehouse" ON "count_teams"("assigned_warehouse_id");

-- CreateIndex
CREATE INDEX "idx_cv_pi" ON "count_variances"("physical_inventory_id");

-- CreateIndex
CREATE INDEX "idx_cv_type" ON "count_variances"("variance_type");

-- CreateIndex
CREATE INDEX "idx_cv_resolution" ON "count_variances"("resolution_status");

-- CreateIndex
CREATE INDEX "idx_cv_product" ON "count_variances"("product_id");

-- CreateIndex
CREATE INDEX "idx_bm_product_status" ON "batch_master"("product_id", "batch_status");

-- CreateIndex
CREATE INDEX "idx_bm_status" ON "batch_master"("batch_status");

-- CreateIndex
CREATE INDEX "idx_bm_expiry" ON "batch_master"("expiry_date");

-- CreateIndex
CREATE INDEX "idx_bm_supplier" ON "batch_master"("supplier_id");

-- CreateIndex
CREATE INDEX "idx_bm_fefo" ON "batch_master"("fefo_priority");

-- CreateIndex
CREATE UNIQUE INDEX "bm_unique_batch_product" ON "batch_master"("batch_number", "product_id");

-- CreateIndex
CREATE INDEX "idx_bh_batch_time" ON "batch_history"("batch_id", "changed_at");

-- CreateIndex
CREATE INDEX "idx_bh_transition" ON "batch_history"("from_status", "to_status");

-- CreateIndex
CREATE UNIQUE INDEX "shelf_life_rules_rule_code_key" ON "shelf_life_rules"("rule_code");

-- CreateIndex
CREATE INDEX "idx_slr_product" ON "shelf_life_rules"("product_id");

-- CreateIndex
CREATE INDEX "idx_slr_category" ON "shelf_life_rules"("product_category_id");

-- CreateIndex
CREATE INDEX "idx_slr_status" ON "shelf_life_rules"("status");

-- CreateIndex
CREATE INDEX "idx_ea_level_status" ON "expiry_alerts"("alert_level", "status");

-- CreateIndex
CREATE INDEX "idx_ea_expiry" ON "expiry_alerts"("expiry_date");

-- CreateIndex
CREATE INDEX "idx_ea_product" ON "expiry_alerts"("product_id");

-- CreateIndex
CREATE INDEX "idx_ea_warehouse" ON "expiry_alerts"("warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_recalls_recall_number_key" ON "product_recalls"("recall_number");

-- CreateIndex
CREATE INDEX "idx_recl_type_status" ON "product_recalls"("recall_type", "status");

-- CreateIndex
CREATE INDEX "idx_recl_status" ON "product_recalls"("status");

-- CreateIndex
CREATE INDEX "idx_recl_product" ON "product_recalls"("product_id");

-- CreateIndex
CREATE INDEX "idx_rb_recall" ON "recall_batches"("recall_id");

-- CreateIndex
CREATE INDEX "idx_rb_batch" ON "recall_batches"("batch_id");

-- CreateIndex
CREATE INDEX "idx_rb_status" ON "recall_batches"("status");

-- CreateIndex
CREATE INDEX "idx_bg_from" ON "batch_genealogy"("from_batch_id");

-- CreateIndex
CREATE INDEX "idx_bg_to" ON "batch_genealogy"("to_batch_id");

-- CreateIndex
CREATE INDEX "idx_bg_relation" ON "batch_genealogy"("relationship_type");

-- CreateIndex
CREATE INDEX "idx_bg_production" ON "batch_genealogy"("production_order_id");

-- CreateIndex
CREATE INDEX "idx_icl_product_wh_status" ON "inventory_cost_layers"("product_id", "warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_icl_method_status" ON "inventory_cost_layers"("costing_method", "status");

-- CreateIndex
CREATE INDEX "idx_icl_receipt_date" ON "inventory_cost_layers"("receipt_date");

-- CreateIndex
CREATE INDEX "idx_icl_batch" ON "inventory_cost_layers"("batch_id");

-- CreateIndex
CREATE INDEX "idx_icl_status" ON "inventory_cost_layers"("status");

-- CreateIndex
CREATE INDEX "idx_ich_product_wh_date" ON "inventory_cost_history"("product_id", "warehouse_id", "change_date");

-- CreateIndex
CREATE INDEX "idx_ich_type" ON "inventory_cost_history"("change_type");

-- CreateIndex
CREATE INDEX "idx_ich_date" ON "inventory_cost_history"("change_date");

-- CreateIndex
CREATE UNIQUE INDEX "landed_cost_documents_document_number_key" ON "landed_cost_documents"("document_number");

-- CreateIndex
CREATE INDEX "idx_lcd_reference" ON "landed_cost_documents"("reference_type", "reference_number");

-- CreateIndex
CREATE INDEX "idx_lcd_status" ON "landed_cost_documents"("status");

-- CreateIndex
CREATE INDEX "idx_lcd_date" ON "landed_cost_documents"("document_date");

-- CreateIndex
CREATE INDEX "idx_lca_document" ON "landed_cost_allocations"("document_id");

-- CreateIndex
CREATE INDEX "idx_lca_component" ON "landed_cost_allocations"("cost_component");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_revaluations_revaluation_number_key" ON "inventory_revaluations"("revaluation_number");

-- CreateIndex
CREATE INDEX "idx_irv_type_status" ON "inventory_revaluations"("revaluation_type", "status");

-- CreateIndex
CREATE INDEX "idx_irv_product" ON "inventory_revaluations"("product_id");

-- CreateIndex
CREATE INDEX "idx_irv_status" ON "inventory_revaluations"("status");

-- CreateIndex
CREATE INDEX "idx_irv_date" ON "inventory_revaluations"("revaluation_date");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_gl_postings_posting_number_key" ON "inventory_gl_postings"("posting_number");

-- CreateIndex
CREATE INDEX "idx_igp_source" ON "inventory_gl_postings"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "idx_igp_date" ON "inventory_gl_postings"("posting_date");

-- CreateIndex
CREATE INDEX "idx_igp_account" ON "inventory_gl_postings"("inventory_account");

-- CreateIndex
CREATE INDEX "idx_igp_status" ON "inventory_gl_postings"("status");

-- CreateIndex
CREATE INDEX "idx_iv_product_wh" ON "inventory_valuations"("product_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "idx_iv_abc" ON "inventory_valuations"("abc_class");

-- CreateIndex
CREATE INDEX "idx_iv_movement" ON "inventory_valuations"("movement_category");

-- CreateIndex
CREATE INDEX "idx_iv_date" ON "inventory_valuations"("valuation_date");

-- CreateIndex
CREATE INDEX "idx_iv_ageing" ON "inventory_valuations"("ageing_category");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_kpis_kpi_code_key" ON "inventory_kpis"("kpi_code");

-- CreateIndex
CREATE INDEX "idx_ik_kpi_date" ON "inventory_kpis"("kpi_code", "period_date");

-- CreateIndex
CREATE INDEX "idx_ik_period_date" ON "inventory_kpis"("period_type", "period_date");

-- CreateIndex
CREATE INDEX "idx_ik_warehouse" ON "inventory_kpis"("warehouse_id");

-- CreateIndex
CREATE INDEX "idx_ik_category" ON "inventory_kpis"("kpi_category");

-- CreateIndex
CREATE INDEX "idx_iag_product_wh" ON "inventory_ageing"("product_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "idx_iag_wh_date" ON "inventory_ageing"("warehouse_id", "snapshot_date");

-- CreateIndex
CREATE INDEX "idx_iag_date" ON "inventory_ageing"("snapshot_date");

-- CreateIndex
CREATE INDEX "idx_icl2_product_wh" ON "inventory_classifications"("product_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "idx_icl2_abc" ON "inventory_classifications"("abc_class");

-- CreateIndex
CREATE INDEX "idx_icl2_xyz" ON "inventory_classifications"("xyz_class");

-- CreateIndex
CREATE INDEX "idx_icl2_fsn" ON "inventory_classifications"("fsn_class");

-- CreateIndex
CREATE INDEX "idx_icl2_combined" ON "inventory_classifications"("combined_class");

-- CreateIndex
CREATE INDEX "idx_icl2_date" ON "inventory_classifications"("classification_date");

-- CreateIndex
CREATE INDEX "idx_rr_product_wh" ON "reorder_rules"("product_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "idx_rr_reorder_urgency" ON "reorder_rules"("reorder_required", "urgency_level");

-- CreateIndex
CREATE INDEX "idx_rr_urgency" ON "reorder_rules"("urgency_level");

-- CreateIndex
CREATE INDEX "idx_rr_status" ON "reorder_rules"("status");

-- CreateIndex
CREATE INDEX "idx_mcs_date" ON "mission_control_snapshots"("snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "executive_reports_report_code_key" ON "executive_reports"("report_code");

-- CreateIndex
CREATE INDEX "idx_er_type_status" ON "executive_reports"("report_type", "status");

-- CreateIndex
CREATE INDEX "idx_er_status" ON "executive_reports"("status");

-- CreateIndex
CREATE INDEX "idx_er_date" ON "executive_reports"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_master_warehouse_code_key" ON "warehouse_master"("warehouse_code");

-- CreateIndex
CREATE INDEX "idx_wm_type_status" ON "warehouse_master"("warehouse_type", "status");

-- CreateIndex
CREATE INDEX "idx_wm_company_branch" ON "warehouse_master"("company_id", "branch_id");

-- CreateIndex
CREATE INDEX "idx_wm_status" ON "warehouse_master"("status");

-- CreateIndex
CREATE INDEX "idx_wz_wh_type" ON "warehouse_zones"("warehouse_id", "zone_type");

-- CreateIndex
CREATE INDEX "idx_wz_type_status" ON "warehouse_zones"("zone_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "wz_unique_wh_zone" ON "warehouse_zones"("warehouse_id", "zone_code");

-- CreateIndex
CREATE INDEX "idx_tz_wh_type" ON "temperature_zones"("warehouse_id", "temp_zone_type");

-- CreateIndex
CREATE INDEX "idx_tz_type_status" ON "temperature_zones"("temp_zone_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tz_unique_wh_zone" ON "temperature_zones"("warehouse_id", "zone_code");

-- CreateIndex
CREATE INDEX "idx_tl_zone_time" ON "temperature_logs"("temperature_zone_id", "recorded_at");

-- CreateIndex
CREATE INDEX "idx_tl_alert" ON "temperature_logs"("is_alert");

-- CreateIndex
CREATE INDEX "idx_wc_wh_date" ON "warehouse_capacity"("warehouse_id", "snapshot_date");

-- CreateIndex
CREATE INDEX "idx_wc_zone" ON "warehouse_capacity"("zone_id");

-- CreateIndex
CREATE INDEX "idx_wcal_wh_date" ON "warehouse_calendar"("warehouse_id", "calendar_date");

-- CreateIndex
CREATE INDEX "idx_war_wh_role" ON "warehouse_access_rules"("warehouse_id", "user_role");

-- CreateIndex
CREATE INDEX "idx_war_status" ON "warehouse_access_rules"("status");

-- CreateIndex
CREATE INDEX "idx_wr_wh_type" ON "warehouse_rules"("warehouse_id", "rule_type");

-- CreateIndex
CREATE INDEX "idx_wr_type_status" ON "warehouse_rules"("rule_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "wr_unique_wh_rule" ON "warehouse_rules"("warehouse_id", "rule_code");

-- CreateIndex
CREATE INDEX "idx_wa_wh_zone" ON "warehouse_aisles"("warehouse_id", "zone_id");

-- CreateIndex
CREATE INDEX "idx_wa_zone" ON "warehouse_aisles"("zone_id");

-- CreateIndex
CREATE INDEX "idx_wa_status" ON "warehouse_aisles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "wa_unique_wh_aisle" ON "warehouse_aisles"("warehouse_id", "aisle_code");

-- CreateIndex
CREATE INDEX "idx_wrk_wh_aisle" ON "warehouse_racks"("warehouse_id", "aisle_id");

-- CreateIndex
CREATE INDEX "idx_wrk_aisle" ON "warehouse_racks"("aisle_id");

-- CreateIndex
CREATE INDEX "idx_wrk_zone" ON "warehouse_racks"("zone_id");

-- CreateIndex
CREATE INDEX "idx_wrk_status" ON "warehouse_racks"("status");

-- CreateIndex
CREATE UNIQUE INDEX "wrk_unique_wh_rack" ON "warehouse_racks"("warehouse_id", "rack_code");

-- CreateIndex
CREATE INDEX "idx_wsh_wh_rack" ON "warehouse_shelves"("warehouse_id", "rack_id");

-- CreateIndex
CREATE INDEX "idx_wsh_rack" ON "warehouse_shelves"("rack_id");

-- CreateIndex
CREATE INDEX "idx_wsh_status" ON "warehouse_shelves"("status");

-- CreateIndex
CREATE UNIQUE INDEX "wsh_unique_wh_shelf" ON "warehouse_shelves"("warehouse_id", "shelf_code");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_bins_barcode_key" ON "warehouse_bins"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_bins_qr_code_key" ON "warehouse_bins"("qr_code");

-- CreateIndex
CREATE INDEX "idx_wb_wh_status" ON "warehouse_bins"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_wb_hierarchy" ON "warehouse_bins"("zone_id", "aisle_id", "rack_id", "shelf_id");

-- CreateIndex
CREATE INDEX "idx_wb_status" ON "warehouse_bins"("status");

-- CreateIndex
CREATE INDEX "idx_wb_type" ON "warehouse_bins"("bin_type");

-- CreateIndex
CREATE INDEX "idx_wb_temp" ON "warehouse_bins"("temperature_zone");

-- CreateIndex
CREATE INDEX "idx_wb_utilization" ON "warehouse_bins"("utilization_percent");

-- CreateIndex
CREATE UNIQUE INDEX "wb_unique_wh_bin" ON "warehouse_bins"("warehouse_id", "bin_code");

-- CreateIndex
CREATE INDEX "idx_bcl_bin_time" ON "bin_capacity_logs"("bin_id", "snapshot_at");

-- CreateIndex
CREATE INDEX "idx_bcl_alert" ON "bin_capacity_logs"("alert_type");

-- CreateIndex
CREATE INDEX "idx_bcl_wh_time" ON "bin_capacity_logs"("warehouse_id", "snapshot_at");

-- CreateIndex
CREATE UNIQUE INDEX "advanced_shipping_notices_asn_number_key" ON "advanced_shipping_notices"("asn_number");

-- CreateIndex
CREATE INDEX "idx_asn_type_status" ON "advanced_shipping_notices"("receiving_type", "status");

-- CreateIndex
CREATE INDEX "idx_asn_supplier_date" ON "advanced_shipping_notices"("supplier_id", "expected_arrival");

-- CreateIndex
CREATE INDEX "idx_asn_wh_status" ON "advanced_shipping_notices"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_asn_status_date" ON "advanced_shipping_notices"("status", "expected_arrival");

-- CreateIndex
CREATE INDEX "idx_asnl_asn_order" ON "asn_lines"("asn_id", "line_order");

-- CreateIndex
CREATE INDEX "idx_asnl_product" ON "asn_lines"("product_id");

-- CreateIndex
CREATE INDEX "idx_asnl_status" ON "asn_lines"("line_status");

-- CreateIndex
CREATE UNIQUE INDEX "receiving_appointments_appointment_number_key" ON "receiving_appointments"("appointment_number");

-- CreateIndex
CREATE INDEX "idx_ra_date_status" ON "receiving_appointments"("appointment_date", "status");

-- CreateIndex
CREATE INDEX "idx_ra_dock_date" ON "receiving_appointments"("dock_id", "appointment_date");

-- CreateIndex
CREATE INDEX "idx_ra_supplier" ON "receiving_appointments"("supplier_id");

-- CreateIndex
CREATE INDEX "idx_ra_status" ON "receiving_appointments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "gate_entries_gate_pass_number_key" ON "gate_entries"("gate_pass_number");

-- CreateIndex
CREATE INDEX "idx_ge_type_date" ON "gate_entries"("entry_type", "gate_date");

-- CreateIndex
CREATE INDEX "idx_ge_vehicle" ON "gate_entries"("vehicle_number");

-- CreateIndex
CREATE INDEX "idx_ge_status" ON "gate_entries"("status");

-- CreateIndex
CREATE INDEX "idx_ge_date" ON "gate_entries"("gate_date");

-- CreateIndex
CREATE INDEX "idx_ld_wh_status" ON "loading_docks"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_ld_type_status" ON "loading_docks"("dock_type", "status");

-- CreateIndex
CREATE INDEX "idx_ld_status" ON "loading_docks"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ld_unique_wh_dock" ON "loading_docks"("warehouse_id", "dock_code");

-- CreateIndex
CREATE UNIQUE INDEX "receiving_exceptions_exception_number_key" ON "receiving_exceptions"("exception_number");

-- CreateIndex
CREATE INDEX "idx_re_asn" ON "receiving_exceptions"("asn_id");

-- CreateIndex
CREATE INDEX "idx_re_type_resolution" ON "receiving_exceptions"("exception_type", "resolution_status");

-- CreateIndex
CREATE INDEX "idx_re_resolution" ON "receiving_exceptions"("resolution_status");

-- CreateIndex
CREATE INDEX "idx_re_status" ON "receiving_exceptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "wms_putaway_tasks_task_number_key" ON "wms_putaway_tasks"("task_number");

-- CreateIndex
CREATE INDEX "idx_wpt_type_status" ON "wms_putaway_tasks"("putaway_type", "status");

-- CreateIndex
CREATE INDEX "idx_wpt_wh_status" ON "wms_putaway_tasks"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_wpt_assignee_status" ON "wms_putaway_tasks"("assigned_to_id", "status");

-- CreateIndex
CREATE INDEX "idx_wpt_status_priority" ON "wms_putaway_tasks"("status", "priority");

-- CreateIndex
CREATE INDEX "idx_wptl_task_order" ON "wms_putaway_task_lines"("putaway_task_id", "line_order");

-- CreateIndex
CREATE INDEX "idx_wptl_product_batch" ON "wms_putaway_task_lines"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_wptl_status" ON "wms_putaway_task_lines"("line_status");

-- CreateIndex
CREATE UNIQUE INDEX "wms_putaway_rules_rule_code_key" ON "wms_putaway_rules"("rule_code");

-- CreateIndex
CREATE INDEX "idx_wpr_strategy_status" ON "wms_putaway_rules"("strategy", "status");

-- CreateIndex
CREATE INDEX "idx_wpr_warehouse" ON "wms_putaway_rules"("warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_pallets_pallet_code_key" ON "warehouse_pallets"("pallet_code");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_pallets_barcode_key" ON "warehouse_pallets"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_pallets_qr_code_key" ON "warehouse_pallets"("qr_code");

-- CreateIndex
CREATE INDEX "idx_wp_status" ON "warehouse_pallets"("status");

-- CreateIndex
CREATE INDEX "idx_wp_wh_status" ON "warehouse_pallets"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_wp_task" ON "warehouse_pallets"("putaway_task_id");

-- CreateIndex
CREATE UNIQUE INDEX "forklift_tasks_task_number_key" ON "forklift_tasks"("task_number");

-- CreateIndex
CREATE INDEX "idx_ft_type_status" ON "forklift_tasks"("task_type", "status");

-- CreateIndex
CREATE INDEX "idx_ft_operator_status" ON "forklift_tasks"("operator_id", "status");

-- CreateIndex
CREATE INDEX "idx_ft_status_priority" ON "forklift_tasks"("status", "priority");

-- CreateIndex
CREATE INDEX "idx_ft_putaway" ON "forklift_tasks"("putaway_task_id");

-- CreateIndex
CREATE UNIQUE INDEX "wms_picking_tasks_picking_number_key" ON "wms_picking_tasks"("picking_number");

-- CreateIndex
CREATE INDEX "idx_wfk_type_status" ON "wms_picking_tasks"("fulfillment_type", "status");

-- CreateIndex
CREATE INDEX "idx_wfk_wh_status" ON "wms_picking_tasks"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_wfk_picker_status" ON "wms_picking_tasks"("picker_id", "status");

-- CreateIndex
CREATE INDEX "idx_wfk_wave" ON "wms_picking_tasks"("wave_id");

-- CreateIndex
CREATE INDEX "idx_wfk_status_priority" ON "wms_picking_tasks"("status", "priority");

-- CreateIndex
CREATE INDEX "idx_wfkl_task_order" ON "wms_picking_task_lines"("picking_task_id", "line_order");

-- CreateIndex
CREATE INDEX "idx_wfkl_product_batch" ON "wms_picking_task_lines"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_wfkl_status" ON "wms_picking_task_lines"("line_status");

-- CreateIndex
CREATE INDEX "idx_wfkl_sequence" ON "wms_picking_task_lines"("pick_sequence");

-- CreateIndex
CREATE INDEX "idx_ps_wh_status" ON "packing_stations"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_ps_status" ON "packing_stations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ps_unique_wh_station" ON "packing_stations"("warehouse_id", "station_code");

-- CreateIndex
CREATE UNIQUE INDEX "packing_jobs_job_number_key" ON "packing_jobs"("job_number");

-- CreateIndex
CREATE UNIQUE INDEX "packing_jobs_picking_task_id_key" ON "packing_jobs"("picking_task_id");

-- CreateIndex
CREATE INDEX "idx_pj_picking" ON "packing_jobs"("picking_task_id");

-- CreateIndex
CREATE INDEX "idx_pj_station_status" ON "packing_jobs"("station_id", "status");

-- CreateIndex
CREATE INDEX "idx_pj_status" ON "packing_jobs"("status");

-- CreateIndex
CREATE INDEX "idx_pj_packer_status" ON "packing_jobs"("packer_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "carton_types_carton_code_key" ON "carton_types"("carton_code");

-- CreateIndex
CREATE INDEX "idx_ct_category_status" ON "carton_types"("carton_category", "status");

-- CreateIndex
CREATE UNIQUE INDEX "cartons_carton_number_key" ON "cartons"("carton_number");

-- CreateIndex
CREATE UNIQUE INDEX "cartons_barcode_key" ON "cartons"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "cartons_picking_task_id_key" ON "cartons"("picking_task_id");

-- CreateIndex
CREATE INDEX "idx_c_packing_job" ON "cartons"("packing_job_id");

-- CreateIndex
CREATE INDEX "idx_c_status" ON "cartons"("status");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_labels_label_number_key" ON "shipping_labels"("label_number");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_labels_picking_task_id_key" ON "shipping_labels"("picking_task_id");

-- CreateIndex
CREATE INDEX "idx_sl_type_status" ON "shipping_labels"("label_type", "status");

-- CreateIndex
CREATE INDEX "idx_sl_packing_job" ON "shipping_labels"("packing_job_id");

-- CreateIndex
CREATE INDEX "idx_sl_carrier" ON "shipping_labels"("carrier_name");

-- CreateIndex
CREATE INDEX "idx_sl_status" ON "shipping_labels"("status");

-- CreateIndex
CREATE UNIQUE INDEX "dispatch_orders_dispatch_number_key" ON "dispatch_orders"("dispatch_number");

-- CreateIndex
CREATE INDEX "idx_do_type_status" ON "dispatch_orders"("dispatch_type", "status");

-- CreateIndex
CREATE INDEX "idx_do_wh_status" ON "dispatch_orders"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_do_vehicle" ON "dispatch_orders"("vehicle_id");

-- CreateIndex
CREATE INDEX "idx_do_status_date" ON "dispatch_orders"("status", "dispatch_date");

-- CreateIndex
CREATE INDEX "idx_dol_do_order" ON "dispatch_order_lines"("dispatch_order_id", "line_order");

-- CreateIndex
CREATE INDEX "idx_dol_product_batch" ON "dispatch_order_lines"("product_id", "batch_id");

-- CreateIndex
CREATE INDEX "idx_dol_status" ON "dispatch_order_lines"("line_status");

-- CreateIndex
CREATE UNIQUE INDEX "dispatch_vehicles_vehicle_number_key" ON "dispatch_vehicles"("vehicle_number");

-- CreateIndex
CREATE INDEX "idx_dv_type_status" ON "dispatch_vehicles"("vehicle_type", "status");

-- CreateIndex
CREATE INDEX "idx_dv_ownership_status" ON "dispatch_vehicles"("ownership_type", "status");

-- CreateIndex
CREATE INDEX "idx_dv_status" ON "dispatch_vehicles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "load_plans_dispatch_order_id_key" ON "load_plans"("dispatch_order_id");

-- CreateIndex
CREATE INDEX "idx_lp_vehicle_status" ON "load_plans"("vehicle_id", "status");

-- CreateIndex
CREATE INDEX "idx_lp_status" ON "load_plans"("status");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_documents_document_number_key" ON "shipping_documents"("document_number");

-- CreateIndex
CREATE INDEX "idx_sd_type_status" ON "shipping_documents"("document_type", "status");

-- CreateIndex
CREATE INDEX "idx_sd_dispatch" ON "shipping_documents"("dispatch_order_id");

-- CreateIndex
CREATE INDEX "idx_sd_status" ON "shipping_documents"("status");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_seals_dispatch_order_id_key" ON "vehicle_seals"("dispatch_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_seals_seal_number_key" ON "vehicle_seals"("seal_number");

-- CreateIndex
CREATE INDEX "idx_vs_seal" ON "vehicle_seals"("seal_number");

-- CreateIndex
CREATE INDEX "idx_vs_status" ON "vehicle_seals"("status");

-- CreateIndex
CREATE UNIQUE INDEX "gate_exit_logs_exit_number_key" ON "gate_exit_logs"("exit_number");

-- CreateIndex
CREATE UNIQUE INDEX "gate_exit_logs_dispatch_order_id_key" ON "gate_exit_logs"("dispatch_order_id");

-- CreateIndex
CREATE INDEX "idx_gel_date_status" ON "gate_exit_logs"("exit_date", "status");

-- CreateIndex
CREATE INDEX "idx_gel_status" ON "gate_exit_logs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_waves_wave_number_key" ON "warehouse_waves"("wave_number");

-- CreateIndex
CREATE INDEX "idx_ww_wh_status" ON "warehouse_waves"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_ww_type_status" ON "warehouse_waves"("wave_type", "status");

-- CreateIndex
CREATE INDEX "idx_ww_planned_start" ON "warehouse_waves"("planned_start");

-- CreateIndex
CREATE INDEX "idx_ww_priority_status" ON "warehouse_waves"("priority", "status");

-- CreateIndex
CREATE INDEX "idx_wo_wave" ON "wave_orders"("wave_id");

-- CreateIndex
CREATE INDEX "idx_wo_order" ON "wave_orders"("order_number");

-- CreateIndex
CREATE INDEX "idx_wo_status" ON "wave_orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_wo_wave_order" ON "wave_orders"("wave_id", "order_number");

-- CreateIndex
CREATE INDEX "idx_wsh_wave_time" ON "wave_status_history"("wave_id", "changed_at");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_tasks_task_number_key" ON "warehouse_tasks"("task_number");

-- CreateIndex
CREATE INDEX "idx_wt_wh_status" ON "warehouse_tasks"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_wt_type_status" ON "warehouse_tasks"("task_type", "status");

-- CreateIndex
CREATE INDEX "idx_wt_op_status" ON "warehouse_tasks"("assigned_operator_id", "status");

-- CreateIndex
CREATE INDEX "idx_wt_priority_status" ON "warehouse_tasks"("priority", "status");

-- CreateIndex
CREATE INDEX "idx_wt_wave" ON "warehouse_tasks"("wave_id");

-- CreateIndex
CREATE INDEX "idx_wt_sla" ON "warehouse_tasks"("sla_deadline");

-- CreateIndex
CREATE INDEX "idx_wtl_task" ON "warehouse_task_lines"("task_id");

-- CreateIndex
CREATE INDEX "idx_wtl_product" ON "warehouse_task_lines"("product_id");

-- CreateIndex
CREATE INDEX "idx_tsh_task_time" ON "task_status_history"("task_id", "changed_at");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_shifts_shift_code_key" ON "warehouse_shifts"("shift_code");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_operators_operator_code_key" ON "warehouse_operators"("operator_code");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_operators_employee_id_key" ON "warehouse_operators"("employee_id");

-- CreateIndex
CREATE INDEX "idx_wo_wh" ON "warehouse_operators"("home_warehouse_id");

-- CreateIndex
CREATE INDEX "idx_wo_status_online" ON "warehouse_operators"("status", "is_online");

-- CreateIndex
CREATE INDEX "idx_wo_zone" ON "warehouse_operators"("primary_zone_id");

-- CreateIndex
CREATE INDEX "idx_oa_date_status" ON "operator_attendance"("attendance_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_oa_op_date" ON "operator_attendance"("operator_id", "attendance_date");

-- CreateIndex
CREATE INDEX "idx_os_skill_certified" ON "operator_skills"("skill_code", "certified");

-- CreateIndex
CREATE UNIQUE INDEX "uq_os_op_skill" ON "operator_skills"("operator_id", "skill_code");

-- CreateIndex
CREATE INDEX "idx_owl_op_date" ON "operator_workload"("operator_id", "snapshot_date");

-- CreateIndex
CREATE INDEX "idx_owl_status" ON "operator_workload"("status");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_equipment_equipment_code_key" ON "warehouse_equipment"("equipment_code");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_equipment_serial_number_key" ON "warehouse_equipment"("serial_number");

-- CreateIndex
CREATE INDEX "idx_we_wh_status" ON "warehouse_equipment"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_we_type_status" ON "warehouse_equipment"("equipment_type", "status");

-- CreateIndex
CREATE INDEX "idx_we_status" ON "warehouse_equipment"("status");

-- CreateIndex
CREATE INDEX "idx_ea_eq_status" ON "equipment_assignments"("equipment_id", "status");

-- CreateIndex
CREATE INDEX "idx_ea_op_status" ON "equipment_assignments"("operator_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_sla_sla_code_key" ON "warehouse_sla"("sla_code");

-- CreateIndex
CREATE INDEX "idx_ws_task_priority" ON "warehouse_sla"("task_type", "priority");

-- CreateIndex
CREATE INDEX "idx_ws_wh_active" ON "warehouse_sla"("warehouse_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "sla_violations_violation_number_key" ON "sla_violations"("violation_number");

-- CreateIndex
CREATE INDEX "idx_sv_status" ON "sla_violations"("status");

-- CreateIndex
CREATE INDEX "idx_sv_severity_status" ON "sla_violations"("severity", "status");

-- CreateIndex
CREATE INDEX "idx_sv_task" ON "sla_violations"("task_id");

-- CreateIndex
CREATE INDEX "idx_sv_time" ON "sla_violations"("violation_time");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_exceptions_exception_number_key" ON "warehouse_exceptions"("exception_number");

-- CreateIndex
CREATE INDEX "idx_wex_status_severity" ON "warehouse_exceptions"("status", "severity");

-- CreateIndex
CREATE INDEX "idx_wex_type_status" ON "warehouse_exceptions"("exception_type", "status");

-- CreateIndex
CREATE INDEX "idx_wex_wh_status" ON "warehouse_exceptions"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_wex_reported" ON "warehouse_exceptions"("reported_at");

-- CreateIndex
CREATE UNIQUE INDEX "cross_dock_orders_cross_dock_number_key" ON "cross_dock_orders"("cross_dock_number");

-- CreateIndex
CREATE INDEX "idx_cdo_wh_status" ON "cross_dock_orders"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_cdo_type_status" ON "cross_dock_orders"("cross_dock_type", "status");

-- CreateIndex
CREATE INDEX "idx_cdo_outbound" ON "cross_dock_orders"("outbound_order_number");

-- CreateIndex
CREATE INDEX "idx_cdo_status_priority" ON "cross_dock_orders"("status", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "cross_dock_tasks_task_number_key" ON "cross_dock_tasks"("task_number");

-- CreateIndex
CREATE INDEX "idx_cdt_cdo" ON "cross_dock_tasks"("cross_dock_order_id");

-- CreateIndex
CREATE INDEX "idx_cdt_status" ON "cross_dock_tasks"("status");

-- CreateIndex
CREATE INDEX "idx_cdt_op_status" ON "cross_dock_tasks"("assigned_operator_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "yard_locations_yard_code_key" ON "yard_locations"("yard_code");

-- CreateIndex
CREATE INDEX "idx_yl_wh_status" ON "yard_locations"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_yl_zone_status" ON "yard_locations"("zone", "status");

-- CreateIndex
CREATE INDEX "idx_yv_wh_status" ON "yard_vehicles"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_yv_status" ON "yard_vehicles"("status");

-- CreateIndex
CREATE INDEX "idx_yv_vehicle" ON "yard_vehicles"("vehicle_number");

-- CreateIndex
CREATE INDEX "idx_yv_asn" ON "yard_vehicles"("asn_id");

-- CreateIndex
CREATE INDEX "idx_yv_dispatch" ON "yard_vehicles"("dispatch_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "truck_queue_queue_number_key" ON "truck_queue"("queue_number");

-- CreateIndex
CREATE INDEX "idx_tq_wh_status" ON "truck_queue"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_tq_position" ON "truck_queue"("queue_position");

-- CreateIndex
CREATE INDEX "idx_tq_status_type" ON "truck_queue"("status", "queue_type");

-- CreateIndex
CREATE INDEX "idx_tqh_vehicle_time" ON "truck_queue_history"("yard_vehicle_id", "event_time");

-- CreateIndex
CREATE UNIQUE INDEX "dock_doors_dock_code_key" ON "dock_doors"("dock_code");

-- CreateIndex
CREATE INDEX "idx_dd_wh_status" ON "dock_doors"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_dd_type_status" ON "dock_doors"("dock_type", "status");

-- CreateIndex
CREATE INDEX "idx_ds_date_dock" ON "dock_schedule"("schedule_date", "dock_door_id");

-- CreateIndex
CREATE INDEX "idx_ds_status" ON "dock_schedule"("status");

-- CreateIndex
CREATE UNIQUE INDEX "uq_ds_dock_time" ON "dock_schedule"("dock_door_id", "start_time", "end_time");

-- CreateIndex
CREATE UNIQUE INDEX "trailers_trailer_number_key" ON "trailers"("trailer_number");

-- CreateIndex
CREATE UNIQUE INDEX "trailers_container_number_key" ON "trailers"("container_number");

-- CreateIndex
CREATE INDEX "idx_tr_status" ON "trailers"("status");

-- CreateIndex
CREATE INDEX "idx_tr_type_status" ON "trailers"("trailer_type", "status");

-- CreateIndex
CREATE INDEX "idx_tr_wh_status" ON "trailers"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_tm_trailer_time" ON "trailer_movements"("trailer_id", "performed_at");

-- CreateIndex
CREATE INDEX "idx_tm_type" ON "trailer_movements"("movement_type");

-- CreateIndex
CREATE UNIQUE INDEX "yard_gate_entries_entry_number_key" ON "yard_gate_entries"("entry_number");

-- CreateIndex
CREATE UNIQUE INDEX "yard_gate_entries_gate_pass_number_key" ON "yard_gate_entries"("gate_pass_number");

-- CreateIndex
CREATE INDEX "idx_yge_wh_time" ON "yard_gate_entries"("warehouse_id", "entry_time");

-- CreateIndex
CREATE INDEX "idx_yge_vehicle" ON "yard_gate_entries"("vehicle_number");

-- CreateIndex
CREATE INDEX "idx_yge_status" ON "yard_gate_entries"("status");

-- CreateIndex
CREATE UNIQUE INDEX "yard_gate_exits_exit_number_key" ON "yard_gate_exits"("exit_number");

-- CreateIndex
CREATE UNIQUE INDEX "yard_gate_exits_gate_entry_id_key" ON "yard_gate_exits"("gate_entry_id");

-- CreateIndex
CREATE INDEX "idx_ygex_time" ON "yard_gate_exits"("exit_time");

-- CreateIndex
CREATE INDEX "idx_ygex_status" ON "yard_gate_exits"("status");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_types_type_code_key" ON "equipment_types"("type_code");

-- CreateIndex
CREATE INDEX "idx_et_cat_active" ON "equipment_types"("category", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_master_equipment_code_key" ON "equipment_master"("equipment_code");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_master_serial_number_key" ON "equipment_master"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_master_asset_tag_number_key" ON "equipment_master"("asset_tag_number");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_master_qr_code_key" ON "equipment_master"("qr_code");

-- CreateIndex
CREATE INDEX "idx_em_wh_status" ON "equipment_master"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_em_cat_status" ON "equipment_master"("category", "status");

-- CreateIndex
CREATE INDEX "idx_em_status" ON "equipment_master"("status");

-- CreateIndex
CREATE INDEX "idx_em_type" ON "equipment_master"("type_code");

-- CreateIndex
CREATE UNIQUE INDEX "forklifts_forklift_code_key" ON "forklifts"("forklift_code");

-- CreateIndex
CREATE UNIQUE INDEX "forklifts_serial_number_key" ON "forklifts"("serial_number");

-- CreateIndex
CREATE INDEX "idx_fl_wh_status" ON "forklifts"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_fl_type_status" ON "forklifts"("forklift_type", "status");

-- CreateIndex
CREATE INDEX "idx_fl_status" ON "forklifts"("status");

-- CreateIndex
CREATE INDEX "idx_fa_fl_status" ON "forklift_assignments"("forklift_id", "status");

-- CreateIndex
CREATE INDEX "idx_fa_op_status" ON "forklift_assignments"("operator_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_devices_device_code_key" ON "mobile_devices"("device_code");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_devices_serial_number_key" ON "mobile_devices"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_devices_imei_key" ON "mobile_devices"("imei");

-- CreateIndex
CREATE INDEX "idx_md_wh_status" ON "mobile_devices"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_md_type_status" ON "mobile_devices"("device_type", "status");

-- CreateIndex
CREATE INDEX "idx_md_op" ON "mobile_devices"("assigned_operator_id");

-- CreateIndex
CREATE UNIQUE INDEX "barcode_scanners_scanner_code_key" ON "barcode_scanners"("scanner_code");

-- CreateIndex
CREATE UNIQUE INDEX "barcode_scanners_serial_number_key" ON "barcode_scanners"("serial_number");

-- CreateIndex
CREATE INDEX "idx_bs_wh_status" ON "barcode_scanners"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_bs_type_status" ON "barcode_scanners"("scanner_type", "status");

-- CreateIndex
CREATE INDEX "idx_bs_op" ON "barcode_scanners"("assigned_operator_id");

-- CreateIndex
CREATE UNIQUE INDEX "battery_status_battery_code_key" ON "battery_status"("battery_code");

-- CreateIndex
CREATE INDEX "idx_bat_equipment" ON "battery_status"("equipment_id");

-- CreateIndex
CREATE INDEX "idx_bat_charging" ON "battery_status"("charging_status");

-- CreateIndex
CREATE INDEX "idx_bat_health" ON "battery_status"("health_percent");

-- CreateIndex
CREATE UNIQUE INDEX "charging_stations_station_code_key" ON "charging_stations"("station_code");

-- CreateIndex
CREATE INDEX "idx_cs_wh_status" ON "charging_stations"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_cs_status" ON "charging_stations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_plans_plan_code_key" ON "maintenance_plans"("plan_code");

-- CreateIndex
CREATE INDEX "idx_mp_equipment" ON "maintenance_plans"("equipment_id");

-- CreateIndex
CREATE INDEX "idx_mp_next" ON "maintenance_plans"("next_execution_at");

-- CreateIndex
CREATE INDEX "idx_mp_active" ON "maintenance_plans"("is_active");

-- CreateIndex
CREATE INDEX "idx_ms_date_status" ON "maintenance_schedule"("scheduled_date", "status");

-- CreateIndex
CREATE INDEX "idx_ms_equipment" ON "maintenance_schedule"("equipment_id");

-- CreateIndex
CREATE INDEX "idx_ms_status" ON "maintenance_schedule"("status");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_tasks_task_number_key" ON "maintenance_tasks"("task_number");

-- CreateIndex
CREATE INDEX "idx_mt_equipment_status" ON "maintenance_tasks"("equipment_id", "status");

-- CreateIndex
CREATE INDEX "idx_mt_status" ON "maintenance_tasks"("status");

-- CreateIndex
CREATE INDEX "idx_mt_scheduled" ON "maintenance_tasks"("scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_breakdowns_breakdown_number_key" ON "equipment_breakdowns"("breakdown_number");

-- CreateIndex
CREATE INDEX "idx_eb_equipment_status" ON "equipment_breakdowns"("equipment_id", "status");

-- CreateIndex
CREATE INDEX "idx_eb_status_severity" ON "equipment_breakdowns"("status", "severity");

-- CreateIndex
CREATE INDEX "idx_eb_reported" ON "equipment_breakdowns"("reported_at");

-- CreateIndex
CREATE UNIQUE INDEX "operator_certifications_certification_code_key" ON "operator_certifications"("certification_code");

-- CreateIndex
CREATE INDEX "idx_oc_op_status" ON "operator_certifications"("operator_id", "status");

-- CreateIndex
CREATE INDEX "idx_oc_type_status" ON "operator_certifications"("certification_type", "status");

-- CreateIndex
CREATE INDEX "idx_oc_valid_until" ON "operator_certifications"("valid_until");

-- CreateIndex
CREATE UNIQUE INDEX "uq_oc_op_cert" ON "operator_certifications"("operator_id", "certification_type");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_device_sessions_session_code_key" ON "mobile_device_sessions"("session_code");

-- CreateIndex
CREATE INDEX "idx_mds_device_status" ON "mobile_device_sessions"("device_id", "status");

-- CreateIndex
CREATE INDEX "idx_mds_op_status" ON "mobile_device_sessions"("operator_id", "status");

-- CreateIndex
CREATE INDEX "idx_mds_expires" ON "mobile_device_sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "idx_dt_device_active" ON "device_tokens"("device_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_dt_operator" ON "device_tokens"("operator_id");

-- CreateIndex
CREATE UNIQUE INDEX "offline_transactions_transaction_code_key" ON "offline_transactions"("transaction_code");

-- CreateIndex
CREATE INDEX "idx_ot_device_status" ON "offline_transactions"("device_id", "status");

-- CreateIndex
CREATE INDEX "idx_ot_status" ON "offline_transactions"("status");

-- CreateIndex
CREATE INDEX "idx_ot_operator" ON "offline_transactions"("operator_id");

-- CreateIndex
CREATE INDEX "idx_ot_offline_time" ON "offline_transactions"("offline_created_at");

-- CreateIndex
CREATE UNIQUE INDEX "sync_queue_queue_code_key" ON "sync_queue"("queue_code");

-- CreateIndex
CREATE INDEX "idx_sq_device_status" ON "sync_queue"("device_id", "status");

-- CreateIndex
CREATE INDEX "idx_sq_status_priority" ON "sync_queue"("status", "priority");

-- CreateIndex
CREATE INDEX "idx_sq_next_attempt" ON "sync_queue"("next_attempt_at");

-- CreateIndex
CREATE INDEX "idx_sh_device_time" ON "sync_history"("device_id", "started_at");

-- CreateIndex
CREATE INDEX "idx_sh_status" ON "sync_history"("status");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_notifications_notification_code_key" ON "mobile_notifications"("notification_code");

-- CreateIndex
CREATE INDEX "idx_mn_op_status" ON "mobile_notifications"("operator_id", "status");

-- CreateIndex
CREATE INDEX "idx_mn_priority_status" ON "mobile_notifications"("priority", "status");

-- CreateIndex
CREATE INDEX "idx_mn_created" ON "mobile_notifications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "scan_events_scan_code_key" ON "scan_events"("scan_code");

-- CreateIndex
CREATE INDEX "idx_se_device_time" ON "scan_events"("device_id", "scanned_at");

-- CreateIndex
CREATE INDEX "idx_se_op_time" ON "scan_events"("operator_id", "scanned_at");

-- CreateIndex
CREATE INDEX "idx_se_validation" ON "scan_events"("validation_result");

-- CreateIndex
CREATE INDEX "idx_se_barcode" ON "scan_events"("barcode_value");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_kpi_snapshots_snapshot_code_key" ON "warehouse_kpi_snapshots"("snapshot_code");

-- CreateIndex
CREATE INDEX "idx_wks_wh_period" ON "warehouse_kpi_snapshots"("warehouse_id", "period_type", "period_start");

-- CreateIndex
CREATE INDEX "idx_wks_period" ON "warehouse_kpi_snapshots"("period_start");

-- CreateIndex
CREATE INDEX "idx_op_op_period" ON "operator_productivity"("operator_id", "period_type", "period_start");

-- CreateIndex
CREATE INDEX "idx_op_wh_period" ON "operator_productivity"("warehouse_id", "period_start");

-- CreateIndex
CREATE INDEX "idx_os_wh_score" ON "operator_scores"("warehouse_id", "overall_score");

-- CreateIndex
CREATE INDEX "idx_os_period" ON "operator_scores"("period_start");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_cost_centers_cost_center_code_key" ON "warehouse_cost_centers"("cost_center_code");

-- CreateIndex
CREATE INDEX "idx_wcc_wh_type" ON "warehouse_cost_centers"("warehouse_id", "cost_type");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_costs_cost_code_key" ON "warehouse_costs"("cost_code");

-- CreateIndex
CREATE INDEX "idx_wc_wh_type_period" ON "warehouse_costs"("warehouse_id", "cost_type", "period_start");

-- CreateIndex
CREATE INDEX "idx_wc_type_period" ON "warehouse_costs"("cost_type", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_heatmaps_heatmap_code_key" ON "warehouse_heatmaps"("heatmap_code");

-- CreateIndex
CREATE INDEX "idx_wh_hm_type_period" ON "warehouse_heatmaps"("warehouse_id", "heatmap_type", "period_start");

-- CreateIndex
CREATE INDEX "idx_wh_type_intensity" ON "warehouse_heatmaps"("heatmap_type", "intensity");

-- CreateIndex
CREATE UNIQUE INDEX "warehouse_bottlenecks_bottleneck_code_key" ON "warehouse_bottlenecks"("bottleneck_code");

-- CreateIndex
CREATE INDEX "idx_wb_wh_status_sev" ON "warehouse_bottlenecks"("warehouse_id", "status", "severity");

-- CreateIndex
CREATE INDEX "idx_wb_type_status" ON "warehouse_bottlenecks"("bottleneck_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_mission_control_snapshot_code_key" ON "enterprise_mission_control"("snapshot_code");

-- CreateIndex
CREATE INDEX "idx_emc_scope_time" ON "enterprise_mission_control"("scope", "calculated_at");

-- CreateIndex
CREATE INDEX "idx_emc_wh" ON "enterprise_mission_control"("warehouse_id");

-- CreateIndex
CREATE INDEX "idx_ws_status_health" ON "warehouse_status"("status", "health_score");

-- CreateIndex
CREATE INDEX "idx_ws_region" ON "warehouse_status"("region");

-- CreateIndex
CREATE UNIQUE INDEX "uq_ws_wh" ON "warehouse_status"("warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "digital_twin_snapshots_snapshot_code_key" ON "digital_twin_snapshots"("snapshot_code");

-- CreateIndex
CREATE INDEX "idx_dts_wh_time" ON "digital_twin_snapshots"("warehouse_id", "captured_at");

-- CreateIndex
CREATE UNIQUE INDEX "ai_recommendations_recommendation_code_key" ON "ai_recommendations"("recommendation_code");

-- CreateIndex
CREATE INDEX "idx_air_wh_status" ON "ai_recommendations"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_air_cat_status" ON "ai_recommendations"("category", "status");

-- CreateIndex
CREATE INDEX "idx_air_risk" ON "ai_recommendations"("risk_score");

-- CreateIndex
CREATE UNIQUE INDEX "predictive_forecasts_forecast_code_key" ON "predictive_forecasts"("forecast_code");

-- CreateIndex
CREATE INDEX "idx_pf_wh_status" ON "predictive_forecasts"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_pf_type_status" ON "predictive_forecasts"("prediction_type", "status");

-- CreateIndex
CREATE INDEX "idx_pf_predicted" ON "predictive_forecasts"("predicted_at");

-- CreateIndex
CREATE UNIQUE INDEX "enterprise_alerts_alert_code_key" ON "enterprise_alerts"("alert_code");

-- CreateIndex
CREATE INDEX "idx_ea_wh_status_sev" ON "enterprise_alerts"("warehouse_id", "status", "severity");

-- CreateIndex
CREATE INDEX "idx_ea_type_status" ON "enterprise_alerts"("alert_type", "status");

-- CreateIndex
CREATE INDEX "idx_ea_sev_status" ON "enterprise_alerts"("severity", "status");

-- CreateIndex
CREATE INDEX "idx_ea_raised" ON "enterprise_alerts"("raised_at");

-- CreateIndex
CREATE UNIQUE INDEX "recovery_incidents_incident_code_key" ON "recovery_incidents"("incident_code");

-- CreateIndex
CREATE INDEX "idx_ri_wh_status" ON "recovery_incidents"("warehouse_id", "status");

-- CreateIndex
CREATE INDEX "idx_ri_type_status" ON "recovery_incidents"("incident_type", "status");

-- CreateIndex
CREATE INDEX "idx_ri_sev_status" ON "recovery_incidents"("severity", "status");

-- CreateIndex
CREATE INDEX "idx_ri_detected" ON "recovery_incidents"("detected_at");

-- CreateIndex
CREATE INDEX "idx_shm_status" ON "system_health_monitors"("status");

-- CreateIndex
CREATE INDEX "idx_shm_health" ON "system_health_monitors"("health_score");

-- CreateIndex
CREATE UNIQUE INDEX "uq_shm_system" ON "system_health_monitors"("system_name");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturing_plants_plant_code_key" ON "manufacturing_plants"("plant_code");

-- CreateIndex
CREATE INDEX "idx_mp_type_status" ON "manufacturing_plants"("plant_type", "status");

-- CreateIndex
CREATE INDEX "idx_mp_branch" ON "manufacturing_plants"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "production_departments_department_code_key" ON "production_departments"("department_code");

-- CreateIndex
CREATE INDEX "idx_pd_plant_status" ON "production_departments"("plant_id", "status");

-- CreateIndex
CREATE INDEX "idx_pd_type" ON "production_departments"("department_type");

-- CreateIndex
CREATE UNIQUE INDEX "production_lines_line_code_key" ON "production_lines"("line_code");

-- CreateIndex
CREATE INDEX "idx_pl_plant_status" ON "production_lines"("plant_id", "status");

-- CreateIndex
CREATE INDEX "idx_pl_dept" ON "production_lines"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "work_centers_work_center_code_key" ON "work_centers"("work_center_code");

-- CreateIndex
CREATE INDEX "idx_wc_line_seq" ON "work_centers"("line_id", "sequence_no");

-- CreateIndex
CREATE INDEX "idx_wc_plant_status" ON "work_centers"("plant_id", "status");

-- CreateIndex
CREATE INDEX "idx_wc_type" ON "work_centers"("work_center_type");

-- CreateIndex
CREATE INDEX "idx_pc_plant_date" ON "production_calendar"("plant_id", "calendar_date");

-- CreateIndex
CREATE UNIQUE INDEX "uq_pc_plant_date" ON "production_calendar"("plant_id", "calendar_date");

-- CreateIndex
CREATE UNIQUE INDEX "production_shifts_shift_code_key" ON "production_shifts"("shift_code");

-- CreateIndex
CREATE INDEX "idx_ps_plant_active" ON "production_shifts"("plant_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_ph_plant_date" ON "plant_holidays"("plant_id", "holiday_date");

-- CreateIndex
CREATE UNIQUE INDEX "uq_ph_plant_date" ON "plant_holidays"("plant_id", "holiday_date");

-- CreateIndex
CREATE UNIQUE INDEX "production_resources_resource_code_key" ON "production_resources"("resource_code");

-- CreateIndex
CREATE INDEX "idx_pr_plant_type_status" ON "production_resources"("plant_id", "resource_type", "status");

-- CreateIndex
CREATE INDEX "idx_pr_workcenter" ON "production_resources"("work_center_id");

-- CreateIndex
CREATE UNIQUE INDEX "plant_configurations_plant_id_key" ON "plant_configurations"("plant_id");

-- CreateIndex
CREATE UNIQUE INDEX "recipes_recipe_code_key" ON "recipes"("recipe_code");

-- CreateIndex
CREATE INDEX "idx_rec_type_status" ON "recipes"("product_type", "status");

-- CreateIndex
CREATE INDEX "idx_rec_status" ON "recipes"("status");

-- CreateIndex
CREATE INDEX "idx_rv_recipe_time" ON "recipe_versions"("recipe_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "uq_rv_recipe_version" ON "recipe_versions"("recipe_id", "major_version", "minor_version");

-- CreateIndex
CREATE UNIQUE INDEX "formulas_formula_code_key" ON "formulas"("formula_code");

-- CreateIndex
CREATE INDEX "idx_fml_recipe" ON "formulas"("recipe_id");

-- CreateIndex
CREATE INDEX "idx_fl_formula_line" ON "formula_lines"("formula_id", "line_no");

-- CreateIndex
CREATE UNIQUE INDEX "bill_of_materials_bom_code_key" ON "bill_of_materials"("bom_code");

-- CreateIndex
CREATE INDEX "idx_bom_recipe" ON "bill_of_materials"("recipe_id");

-- CreateIndex
CREATE INDEX "idx_bom_type_status" ON "bill_of_materials"("bomType", "status");

-- CreateIndex
CREATE INDEX "idx_bl_bom_line" ON "bom_lines"("bom_id", "line_no");

-- CreateIndex
CREATE UNIQUE INDEX "uq_yr_recipe" ON "yield_rules"("recipe_id");

-- CreateIndex
CREATE INDEX "idx_yh_recipe_date" ON "yield_history"("recipe_id", "production_date");

-- CreateIndex
CREATE INDEX "idx_ai_primary_status" ON "alternate_ingredients"("primary_ingredient_sku", "status");

-- CreateIndex
CREATE UNIQUE INDEX "allergens_allergen_code_key" ON "allergens"("allergen_code");

-- CreateIndex
CREATE INDEX "idx_alg_type" ON "allergens"("allergen_type");

-- CreateIndex
CREATE INDEX "idx_np_recipe" ON "nutrition_profiles"("recipe_id");

-- CreateIndex
CREATE INDEX "idx_np_product" ON "nutrition_profiles"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "cost_rollups_rollup_code_key" ON "cost_rollups"("rollup_code");

-- CreateIndex
CREATE INDEX "idx_cr_recipe_type" ON "cost_rollups"("recipe_id", "costType");

-- CreateIndex
CREATE INDEX "idx_cr_calculated" ON "cost_rollups"("calculated_at");

-- CreateIndex
CREATE UNIQUE INDEX "master_production_schedule_schedule_number_key" ON "master_production_schedule"("schedule_number");

-- CreateIndex
CREATE INDEX "idx_mps_plant_period" ON "master_production_schedule"("plant_id", "period_type", "period_start");

-- CreateIndex
CREATE INDEX "idx_mps_status" ON "master_production_schedule"("status");

-- CreateIndex
CREATE INDEX "idx_mpsl_mps_line" ON "mps_lines"("mps_id", "line_no");

-- CreateIndex
CREATE INDEX "idx_mpsl_date" ON "mps_lines"("planned_date");

-- CreateIndex
CREATE UNIQUE INDEX "mrp_runs_run_number_key" ON "mrp_runs"("run_number");

-- CreateIndex
CREATE INDEX "idx_mrp_plant_period" ON "mrp_runs"("plant_id", "period_start");

-- CreateIndex
CREATE INDEX "idx_mrp_status" ON "mrp_runs"("status");

-- CreateIndex
CREATE INDEX "idx_mrr_run_material" ON "mrp_results"("mrp_run_id", "material_sku");

-- CreateIndex
CREATE INDEX "idx_mrr_shortage" ON "mrp_results"("is_shortage");

-- CreateIndex
CREATE INDEX "idx_ms_run_severity" ON "material_shortages"("mrp_run_id", "severity");

-- CreateIndex
CREATE INDEX "idx_ms_resolution" ON "material_shortages"("resolutionStatus");

-- CreateIndex
CREATE UNIQUE INDEX "demand_forecasts_forecast_code_key" ON "demand_forecasts"("forecast_code");

-- CreateIndex
CREATE INDEX "idx_df_product_period" ON "demand_forecasts"("product_sku", "period_start");

-- CreateIndex
CREATE INDEX "idx_df_period" ON "demand_forecasts"("period_start");

-- CreateIndex
CREATE UNIQUE INDEX "capacity_plans_plan_code_key" ON "capacity_plans"("plan_code");

-- CreateIndex
CREATE INDEX "idx_cp_plant_period" ON "capacity_plans"("plant_id", "period_start");

-- CreateIndex
CREATE INDEX "idx_cp_status" ON "capacity_plans"("status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_recommendations_recommendation_code_key" ON "purchase_recommendations"("recommendation_code");

-- CreateIndex
CREATE INDEX "idx_purrec_status_priority" ON "purchase_recommendations"("status", "priority");

-- CreateIndex
CREATE INDEX "idx_purrec_required_date" ON "purchase_recommendations"("required_date");

-- CreateIndex
CREATE UNIQUE INDEX "production_plans_plan_code_key" ON "production_plans"("plan_code");

-- CreateIndex
CREATE INDEX "idx_pp_plant_period" ON "production_plans"("plant_id", "period_start");

-- CreateIndex
CREATE INDEX "idx_pp_status" ON "production_plans"("status");

-- CreateIndex
CREATE UNIQUE INDEX "what_if_simulations_simulation_code_key" ON "what_if_simulations"("simulation_code");

-- CreateIndex
CREATE INDEX "idx_wis_type" ON "what_if_simulations"("scenario_type");

-- CreateIndex
CREATE INDEX "idx_wis_created" ON "what_if_simulations"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "production_orders_production_order_number_key" ON "production_orders"("production_order_number");

-- CreateIndex
CREATE INDEX "idx_po_plant_status" ON "production_orders"("plant_id", "status");

-- CreateIndex
CREATE INDEX "idx_po_line_start" ON "production_orders"("production_line_id", "planned_start");

-- CreateIndex
CREATE INDEX "idx_po_status_priority" ON "production_orders"("status", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_work_order_number_key" ON "work_orders"("work_order_number");

-- CreateIndex
CREATE INDEX "idx_wo_po_op" ON "work_orders"("production_order_id", "operation_no");

-- CreateIndex
CREATE INDEX "idx_wo_status_v2" ON "work_orders"("status");

-- CreateIndex
CREATE INDEX "idx_wo_op_status" ON "work_orders"("assigned_operator_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "production_routings_routing_code_key" ON "production_routings"("routing_code");

-- CreateIndex
CREATE INDEX "idx_rt_recipe" ON "production_routings"("recipe_id");

-- CreateIndex
CREATE INDEX "idx_rs_routing_step" ON "routing_steps"("routing_id", "step_no");

-- CreateIndex
CREATE UNIQUE INDEX "shop_floor_schedule_schedule_code_key" ON "shop_floor_schedule"("schedule_code");

-- CreateIndex
CREATE INDEX "idx_sfs_plant_date" ON "shop_floor_schedule"("plant_id", "schedule_date");

-- CreateIndex
CREATE INDEX "idx_ss_schedule_time" ON "schedule_slots"("schedule_id", "start_time");

-- CreateIndex
CREATE INDEX "idx_ss_line_time" ON "schedule_slots"("production_line_id", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "production_assignments_assignment_code_key" ON "production_assignments"("assignment_code");

-- CreateIndex
CREATE INDEX "idx_pa_po" ON "production_assignments"("production_order_id");

-- CreateIndex
CREATE INDEX "idx_pa_wo" ON "production_assignments"("work_order_id");

-- CreateIndex
CREATE INDEX "idx_pa_resource_status" ON "production_assignments"("resource_code", "status");

-- CreateIndex
CREATE UNIQUE INDEX "production_travelers_traveler_code_key" ON "production_travelers"("traveler_code");

-- CreateIndex
CREATE UNIQUE INDEX "production_travelers_production_order_id_key" ON "production_travelers"("production_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "production_travelers_qr_code_key" ON "production_travelers"("qr_code");

-- CreateIndex
CREATE INDEX "idx_pt_po" ON "production_travelers"("production_order_id");

-- CreateIndex
CREATE INDEX "idx_pt_qr" ON "production_travelers"("qr_code");

-- CreateIndex
CREATE INDEX "idx_ppl_po_time" ON "production_progress_logs"("production_order_id", "logged_at");

-- CreateIndex
CREATE INDEX "idx_ppl_type" ON "production_progress_logs"("progress_type");

-- CreateIndex
CREATE UNIQUE INDEX "work_order_execution_execution_code_key" ON "work_order_execution"("execution_code");

-- CreateIndex
CREATE INDEX "idx_woe_wo" ON "work_order_execution"("work_order_id");

-- CreateIndex
CREATE INDEX "idx_woe_op_status" ON "work_order_execution"("operator_id", "status");

-- CreateIndex
CREATE INDEX "idx_woe_status" ON "work_order_execution"("status");

-- CreateIndex
CREATE INDEX "idx_el_exec_time" ON "execution_logs"("execution_id", "logged_at");

-- CreateIndex
CREATE INDEX "idx_el_type" ON "execution_logs"("log_type");

-- CreateIndex
CREATE UNIQUE INDEX "material_consumption_consumption_code_key" ON "material_consumption"("consumption_code");

-- CreateIndex
CREATE INDEX "idx_mc_po" ON "material_consumption"("production_order_id");

-- CreateIndex
CREATE INDEX "idx_mc_wo" ON "material_consumption"("work_order_id");

-- CreateIndex
CREATE INDEX "idx_mc_material_batch" ON "material_consumption"("material_sku", "batch_number");

-- CreateIndex
CREATE INDEX "idx_mc_validation" ON "material_consumption"("validationResult");

-- CreateIndex
CREATE UNIQUE INDEX "machine_execution_execution_code_key" ON "machine_execution"("execution_code");

-- CreateIndex
CREATE INDEX "idx_me_machine_status" ON "machine_execution"("machine_id", "status");

-- CreateIndex
CREATE INDEX "idx_me_wo" ON "machine_execution"("work_order_id");

-- CreateIndex
CREATE INDEX "idx_mev_exec_time" ON "machine_events"("machine_execution_id", "event_time");

-- CreateIndex
CREATE INDEX "idx_otl_op_time" ON "operator_time_logs"("operator_id", "start_time");

-- CreateIndex
CREATE INDEX "idx_otl_type" ON "operator_time_logs"("log_type");

-- CreateIndex
CREATE UNIQUE INDEX "work_in_progress_wip_code_key" ON "work_in_progress"("wip_code");

-- CreateIndex
CREATE INDEX "idx_wip_po" ON "work_in_progress"("production_order_id");

-- CreateIndex
CREATE INDEX "idx_wip_status_stage" ON "work_in_progress"("status", "current_stage");

-- CreateIndex
CREATE INDEX "idx_wm_wip_time" ON "wip_movements"("wip_id", "moved_at");

-- CreateIndex
CREATE UNIQUE INDEX "production_exceptions_exception_code_key" ON "production_exceptions"("exception_code");

-- CreateIndex
CREATE INDEX "idx_pex_po_status" ON "production_exceptions"("production_order_id", "status");

-- CreateIndex
CREATE INDEX "idx_pex_type_sev" ON "production_exceptions"("exception_type", "severity");

-- CreateIndex
CREATE INDEX "idx_pex_status_sev" ON "production_exceptions"("status", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "andon_boards_andon_code_key" ON "andon_boards"("andon_code");

-- CreateIndex
CREATE INDEX "idx_ab_plant_status" ON "andon_boards"("plant_id", "status");

-- CreateIndex
CREATE INDEX "idx_ab_line" ON "andon_boards"("production_line_id");

-- CreateIndex
CREATE UNIQUE INDEX "production_batches_batch_number_key" ON "production_batches"("batch_number");

-- CreateIndex
CREATE INDEX "idx_pb_type_status" ON "production_batches"("batch_type", "status");

-- CreateIndex
CREATE INDEX "idx_pb_po" ON "production_batches"("production_order_id");

-- CreateIndex
CREATE INDEX "idx_pb_plant_date" ON "production_batches"("plant_id", "manufacturing_date");

-- CreateIndex
CREATE INDEX "idx_pb_expiry" ON "production_batches"("expiry_date");

-- CreateIndex
CREATE INDEX "idx_pb_recalled" ON "production_batches"("is_recalled");

-- CreateIndex
CREATE INDEX "idx_pb_product_status" ON "production_batches"("product_id", "status");

-- CreateIndex
CREATE INDEX "idx_pbh_batch_time" ON "production_batch_history"("batch_id", "changed_at");

-- CreateIndex
CREATE INDEX "idx_pbh_transition" ON "production_batch_history"("from_status", "to_status");

-- CreateIndex
CREATE INDEX "idx_br_parent" ON "batch_relationships"("parent_batch_id");

-- CreateIndex
CREATE INDEX "idx_br_child" ON "batch_relationships"("child_batch_id");

-- CreateIndex
CREATE INDEX "idx_br_relation" ON "batch_relationships"("relationship_type");

-- CreateIndex
CREATE INDEX "idx_br_po" ON "batch_relationships"("production_order_id");

-- CreateIndex
CREATE INDEX "idx_br_supplier" ON "batch_relationships"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "batch_shelf_life_batch_id_key" ON "batch_shelf_life"("batch_id");

-- CreateIndex
CREATE INDEX "idx_bsl_expiry" ON "batch_shelf_life"("expiry_date");

-- CreateIndex
CREATE INDEX "idx_bsl_alert" ON "batch_shelf_life"("alert_level");

-- CreateIndex
CREATE INDEX "idx_bsl_temp" ON "batch_shelf_life"("temp_compliant");

-- CreateIndex
CREATE UNIQUE INDEX "expiry_monitor_monitor_code_key" ON "expiry_monitor"("monitor_code");

-- CreateIndex
CREATE INDEX "idx_em_plant" ON "expiry_monitor"("plant_id");

-- CreateIndex
CREATE INDEX "idx_em_wh" ON "expiry_monitor"("warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "batch_split_merges_operation_code_key" ON "batch_split_merges"("operation_code");

-- CreateIndex
CREATE INDEX "idx_bsm_type_status" ON "batch_split_merges"("operation_type", "status");

-- CreateIndex
CREATE INDEX "idx_bsm_source" ON "batch_split_merges"("source_batch_id");

-- CreateIndex
CREATE INDEX "idx_bsm_target" ON "batch_split_merges"("target_batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "recall_actions_action_code_key" ON "recall_actions"("action_code");

-- CreateIndex
CREATE INDEX "idx_ra_recall" ON "recall_actions"("recall_number");

-- CreateIndex
CREATE INDEX "idx_ra_batch" ON "recall_actions"("batch_id");

-- CreateIndex
CREATE INDEX "idx_ra_stage_status" ON "recall_actions"("workflow_stage", "status");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_audits_audit_code_key" ON "compliance_audits"("audit_code");

-- CreateIndex
CREATE INDEX "idx_ca_std_status" ON "compliance_audits"("standard", "status");

-- CreateIndex
CREATE INDEX "idx_ca_plant_date" ON "compliance_audits"("plant_id", "scheduled_date");

-- CreateIndex
CREATE INDEX "idx_ca_type" ON "compliance_audits"("audit_type");

-- CreateIndex
CREATE UNIQUE INDEX "traceability_searches_search_code_key" ON "traceability_searches"("search_code");

-- CreateIndex
CREATE INDEX "idx_ts_type_dir" ON "traceability_searches"("search_type", "direction");

-- CreateIndex
CREATE INDEX "idx_ts_target" ON "traceability_searches"("within_target");

-- CreateIndex
CREATE INDEX "idx_ts_time" ON "traceability_searches"("searched_at");

-- CreateIndex
CREATE UNIQUE INDEX "production_mobile_devices_device_code_key" ON "production_mobile_devices"("device_code");

-- CreateIndex
CREATE UNIQUE INDEX "production_mobile_devices_serial_number_key" ON "production_mobile_devices"("serial_number");

-- CreateIndex
CREATE INDEX "idx_pmd_plant_status" ON "production_mobile_devices"("plant_id", "status");

-- CreateIndex
CREATE INDEX "idx_pmd_operator" ON "production_mobile_devices"("assigned_operator_id");

-- CreateIndex
CREATE INDEX "idx_pmd_status" ON "production_mobile_devices"("status");

-- CreateIndex
CREATE UNIQUE INDEX "production_device_sessions_session_code_key" ON "production_device_sessions"("session_code");

-- CreateIndex
CREATE INDEX "idx_pds_device_status" ON "production_device_sessions"("device_id", "status");

-- CreateIndex
CREATE INDEX "idx_pds_operator_status" ON "production_device_sessions"("operator_id", "status");

-- CreateIndex
CREATE INDEX "idx_pds_expires" ON "production_device_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "idx_pdt_device_active" ON "production_device_tokens"("device_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_pdt_token" ON "production_device_tokens"("token_value");

-- CreateIndex
CREATE UNIQUE INDEX "production_labels_label_code_key" ON "production_labels"("label_code");

-- CreateIndex
CREATE INDEX "idx_pl_batch" ON "production_labels"("batch_id");

-- CreateIndex
CREATE INDEX "idx_pl_type" ON "production_labels"("label_type");

-- CreateIndex
CREATE INDEX "idx_pl_sku" ON "production_labels"("product_sku");

-- CreateIndex
CREATE UNIQUE INDEX "production_label_print_jobs_job_code_key" ON "production_label_print_jobs"("job_code");

-- CreateIndex
CREATE INDEX "idx_plpj_status_time" ON "production_label_print_jobs"("status", "created_at");

-- CreateIndex
CREATE INDEX "idx_plpj_label" ON "production_label_print_jobs"("label_id");

-- CreateIndex
CREATE INDEX "idx_plpj_operator" ON "production_label_print_jobs"("operator_id");

-- CreateIndex
CREATE UNIQUE INDEX "production_offline_queue_transaction_code_key" ON "production_offline_queue"("transaction_code");

-- CreateIndex
CREATE INDEX "idx_poq_device_status" ON "production_offline_queue"("device_id", "status");

-- CreateIndex
CREATE INDEX "idx_poq_status_time" ON "production_offline_queue"("status", "offline_created_at");

-- CreateIndex
CREATE INDEX "idx_poq_operator" ON "production_offline_queue"("operator_id");

-- CreateIndex
CREATE INDEX "idx_poq_expires" ON "production_offline_queue"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "production_sync_history_sync_code_key" ON "production_sync_history"("sync_code");

-- CreateIndex
CREATE INDEX "idx_psh_device_time" ON "production_sync_history"("device_id", "sync_completed_at");

-- CreateIndex
CREATE INDEX "idx_psh_status" ON "production_sync_history"("status");

-- CreateIndex
CREATE INDEX "idx_psh_target" ON "production_sync_history"("within_target");

-- CreateIndex
CREATE UNIQUE INDEX "production_quality_checks_check_code_key" ON "production_quality_checks"("check_code");

-- CreateIndex
CREATE INDEX "idx_pqc_wo_stage" ON "production_quality_checks"("work_order_id", "check_stage");

-- CreateIndex
CREATE INDEX "idx_pqc_batch" ON "production_quality_checks"("batch_id");

-- CreateIndex
CREATE INDEX "idx_pqc_type_result" ON "production_quality_checks"("check_type", "result");

-- CreateIndex
CREATE INDEX "idx_pqc_time" ON "production_quality_checks"("checked_at");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_orders_packaging_order_number_key" ON "packaging_orders"("packaging_order_number");

-- CreateIndex
CREATE INDEX "idx_po41_status_priority" ON "packaging_orders"("status", "priority");

-- CreateIndex
CREATE INDEX "idx_po41_batch" ON "packaging_orders"("production_batch_id");

-- CreateIndex
CREATE INDEX "idx_po41_sku" ON "packaging_orders"("product_sku");

-- CreateIndex
CREATE INDEX "idx_po41_type" ON "packaging_orders"("packaging_type");

-- CreateIndex
CREATE INDEX "idx_po41_start" ON "packaging_orders"("planned_start");

-- CreateIndex
CREATE INDEX "idx_pol41_order" ON "packaging_order_lines"("packaging_order_id");

-- CreateIndex
CREATE INDEX "idx_pol41_material" ON "packaging_order_lines"("material_code");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_levels_level_code_key" ON "packaging_levels"("level_code");

-- CreateIndex
CREATE INDEX "idx_pl41_level_num" ON "packaging_levels"("level_number");

-- CreateIndex
CREATE UNIQUE INDEX "package_units_package_id_key" ON "package_units"("package_id");

-- CreateIndex
CREATE UNIQUE INDEX "package_units_barcode_key" ON "package_units"("barcode");

-- CreateIndex
CREATE INDEX "idx_pu41_order" ON "package_units"("packaging_order_id");

-- CreateIndex
CREATE INDEX "idx_pu41_parent" ON "package_units"("parent_package_id");

-- CreateIndex
CREATE INDEX "idx_pu41_batch" ON "package_units"("batch_number");

-- CreateIndex
CREATE INDEX "idx_pu41_barcode" ON "package_units"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_cartons_carton_number_key" ON "packaging_cartons"("carton_number");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_cartons_barcode_key" ON "packaging_cartons"("barcode");

-- CreateIndex
CREATE INDEX "idx_pc41_order" ON "packaging_cartons"("packaging_order_id");

-- CreateIndex
CREATE INDEX "idx_pc41_parent" ON "packaging_cartons"("parent_pallet_id");

-- CreateIndex
CREATE INDEX "idx_pc41_batch" ON "packaging_cartons"("batch_number");

-- CreateIndex
CREATE INDEX "idx_pc41_barcode" ON "packaging_cartons"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_pallets_pallet_number_key" ON "packaging_pallets"("pallet_number");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_pallets_barcode_key" ON "packaging_pallets"("barcode");

-- CreateIndex
CREATE INDEX "idx_pp41_order" ON "packaging_pallets"("packaging_order_id");

-- CreateIndex
CREATE INDEX "idx_pp41_batch" ON "packaging_pallets"("batch_number");

-- CreateIndex
CREATE INDEX "idx_pp41_barcode" ON "packaging_pallets"("barcode");

-- CreateIndex
CREATE INDEX "idx_pp41_dest_wh" ON "packaging_pallets"("destination_warehouse_id");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_label_jobs_job_code_key" ON "packaging_label_jobs"("job_code");

-- CreateIndex
CREATE INDEX "idx_plj41_order" ON "packaging_label_jobs"("packaging_order_id");

-- CreateIndex
CREATE INDEX "idx_plj41_type_status" ON "packaging_label_jobs"("label_type", "status");

-- CreateIndex
CREATE INDEX "idx_plj41_batch" ON "packaging_label_jobs"("batch_number");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_quality_checks_check_code_key" ON "packaging_quality_checks"("check_code");

-- CreateIndex
CREATE INDEX "idx_pqc41_order" ON "packaging_quality_checks"("packaging_order_id");

-- CreateIndex
CREATE INDEX "idx_pqc41_type_result" ON "packaging_quality_checks"("check_type", "result");

-- CreateIndex
CREATE INDEX "idx_pqc41_batch" ON "packaging_quality_checks"("batch_number");

-- CreateIndex
CREATE UNIQUE INDEX "finished_goods_confirmations_fg_confirmation_code_key" ON "finished_goods_confirmations"("fg_confirmation_code");

-- CreateIndex
CREATE INDEX "idx_fgc41_order" ON "finished_goods_confirmations"("packaging_order_id");

-- CreateIndex
CREATE INDEX "idx_fgc41_batch" ON "finished_goods_confirmations"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_fgc41_sku" ON "finished_goods_confirmations"("product_sku");

-- CreateIndex
CREATE INDEX "idx_fgc41_status" ON "finished_goods_confirmations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_cost_summaries_packaging_order_id_key" ON "packaging_cost_summaries"("packaging_order_id");

-- CreateIndex
CREATE INDEX "idx_pcs41_order" ON "packaging_cost_summaries"("packaging_order_number");

-- CreateIndex
CREATE UNIQUE INDEX "production_costs_cost_code_key" ON "production_costs"("cost_code");

-- CreateIndex
CREATE INDEX "idx_pc42_type" ON "production_costs"("cost_type");

-- CreateIndex
CREATE INDEX "idx_pc42_po" ON "production_costs"("production_order_number");

-- CreateIndex
CREATE INDEX "idx_pc42_sku" ON "production_costs"("product_sku");

-- CreateIndex
CREATE INDEX "idx_pc42_variance" ON "production_costs"("variance_status");

-- CreateIndex
CREATE INDEX "idx_pc42_journal" ON "production_costs"("journal_posted");

-- CreateIndex
CREATE INDEX "idx_ce42_pc" ON "cost_elements"("production_cost_id");

-- CreateIndex
CREATE INDEX "idx_ce42_type" ON "cost_elements"("element_type");

-- CreateIndex
CREATE UNIQUE INDEX "cost_transactions_transaction_number_key" ON "cost_transactions"("transaction_number");

-- CreateIndex
CREATE INDEX "idx_ct42_pc" ON "cost_transactions"("production_cost_id");

-- CreateIndex
CREATE INDEX "idx_ct42_type_date" ON "cost_transactions"("transaction_type", "transaction_date");

-- CreateIndex
CREATE INDEX "idx_ct42_gl" ON "cost_transactions"("gl_posted");

-- CreateIndex
CREATE UNIQUE INDEX "labor_cost_allocations_allocation_code_key" ON "labor_cost_allocations"("allocation_code");

-- CreateIndex
CREATE INDEX "idx_lca42_op_time" ON "labor_cost_allocations"("operator_id", "start_time");

-- CreateIndex
CREATE INDEX "idx_lca42_po" ON "labor_cost_allocations"("production_order_number");

-- CreateIndex
CREATE INDEX "idx_lca42_type" ON "labor_cost_allocations"("labor_type");

-- CreateIndex
CREATE UNIQUE INDEX "machine_cost_allocations_allocation_code_key" ON "machine_cost_allocations"("allocation_code");

-- CreateIndex
CREATE INDEX "idx_mca42_machine_time" ON "machine_cost_allocations"("machine_code", "start_time");

-- CreateIndex
CREATE INDEX "idx_mca42_po" ON "machine_cost_allocations"("production_order_number");

-- CreateIndex
CREATE UNIQUE INDEX "utility_costs_utility_code_key" ON "utility_costs"("utility_code");

-- CreateIndex
CREATE INDEX "idx_uc42_type_period" ON "utility_costs"("utility_type", "period_start");

-- CreateIndex
CREATE INDEX "idx_uc42_po" ON "utility_costs"("production_order_number");

-- CreateIndex
CREATE INDEX "idx_uc42_plant" ON "utility_costs"("plant_code");

-- CreateIndex
CREATE UNIQUE INDEX "overhead_allocations_allocation_code_key" ON "overhead_allocations"("allocation_code");

-- CreateIndex
CREATE INDEX "idx_oa42_type_period" ON "overhead_allocations"("overhead_type", "period_start");

-- CreateIndex
CREATE INDEX "idx_oa42_po" ON "overhead_allocations"("production_order_number");

-- CreateIndex
CREATE INDEX "idx_oa42_plant" ON "overhead_allocations"("plant_code");

-- CreateIndex
CREATE UNIQUE INDEX "batch_costs_batch_cost_code_key" ON "batch_costs"("batch_cost_code");

-- CreateIndex
CREATE UNIQUE INDEX "batch_costs_production_batch_number_key" ON "batch_costs"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_bc42_batch" ON "batch_costs"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_bc42_sku" ON "batch_costs"("product_sku");

-- CreateIndex
CREATE INDEX "idx_bc42_variance" ON "batch_costs"("variance_status");

-- CreateIndex
CREATE INDEX "idx_bv42_batch_cost" ON "batch_variances"("batch_cost_id");

-- CreateIndex
CREATE INDEX "idx_bv42_type_sev" ON "batch_variances"("variance_type", "severity");

-- CreateIndex
CREATE INDEX "idx_bv42_direction" ON "batch_variances"("variance_direction");

-- CreateIndex
CREATE INDEX "idx_bv42_action" ON "batch_variances"("action_status");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturing_journals_journal_entry_number_key" ON "manufacturing_journals"("journal_entry_number");

-- CreateIndex
CREATE INDEX "idx_mj42_type_date" ON "manufacturing_journals"("journal_type", "journal_date");

-- CreateIndex
CREATE INDEX "idx_mj42_batch" ON "manufacturing_journals"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_mj42_gl" ON "manufacturing_journals"("gl_posted");

-- CreateIndex
CREATE INDEX "idx_mj42_period" ON "manufacturing_journals"("financial_period");

-- CreateIndex
CREATE INDEX "idx_mjl42_journal" ON "manufacturing_journal_lines"("journal_id");

-- CreateIndex
CREATE INDEX "idx_mjl42_account" ON "manufacturing_journal_lines"("account_code");

-- CreateIndex
CREATE UNIQUE INDEX "industrial_machines_machine_code_key" ON "industrial_machines"("machine_code");

-- CreateIndex
CREATE INDEX "idx_im43_cat_status" ON "industrial_machines"("equipment_category", "status");

-- CreateIndex
CREATE INDEX "idx_im43_line" ON "industrial_machines"("production_line_id");

-- CreateIndex
CREATE INDEX "idx_im43_wc" ON "industrial_machines"("work_center_id");

-- CreateIndex
CREATE INDEX "idx_im43_status" ON "industrial_machines"("status");

-- CreateIndex
CREATE INDEX "idx_im43_connected" ON "industrial_machines"("is_connected");

-- CreateIndex
CREATE UNIQUE INDEX "machine_models_model_code_key" ON "machine_models"("model_code");

-- CreateIndex
CREATE INDEX "idx_mm43_make_cat" ON "machine_models"("manufacturer", "category");

-- CreateIndex
CREATE UNIQUE INDEX "iot_gateways_gateway_code_key" ON "iot_gateways"("gateway_code");

-- CreateIndex
CREATE INDEX "idx_iotgw43_plant_status" ON "iot_gateways"("plant_code", "status");

-- CreateIndex
CREATE INDEX "idx_iotgw43_status" ON "iot_gateways"("status");

-- CreateIndex
CREATE UNIQUE INDEX "iot_connections_connection_code_key" ON "iot_connections"("connection_code");

-- CreateIndex
CREATE INDEX "idx_iotc43_gw_status" ON "iot_connections"("gateway_id", "status");

-- CreateIndex
CREATE INDEX "idx_iotc43_machine" ON "iot_connections"("machine_id");

-- CreateIndex
CREATE INDEX "idx_iotc43_status" ON "iot_connections"("status");

-- CreateIndex
CREATE INDEX "idx_dh43_gw_time" ON "device_heartbeats"("gateway_id", "heartbeat_at");

-- CreateIndex
CREATE INDEX "idx_dh43_time" ON "device_heartbeats"("heartbeat_at");

-- CreateIndex
CREATE UNIQUE INDEX "machine_runtime_events_event_code_key" ON "machine_runtime_events"("event_code");

-- CreateIndex
CREATE INDEX "idx_mre43_machine_time" ON "machine_runtime_events"("machine_id", "event_start_time");

-- CreateIndex
CREATE INDEX "idx_mre43_type_time" ON "machine_runtime_events"("event_type", "event_start_time");

-- CreateIndex
CREATE INDEX "idx_mre43_reason" ON "machine_runtime_events"("reason_code");

-- CreateIndex
CREATE UNIQUE INDEX "machine_counters_counter_code_key" ON "machine_counters"("counter_code");

-- CreateIndex
CREATE INDEX "idx_mc43_machine_type" ON "machine_counters"("machine_id", "counter_type");

-- CreateIndex
CREATE INDEX "idx_mc43_batch" ON "machine_counters"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_mc43_time" ON "machine_counters"("last_updated");

-- CreateIndex
CREATE INDEX "idx_ch43_counter_time" ON "counter_history"("counter_id", "recorded_at");

-- CreateIndex
CREATE UNIQUE INDEX "sensor_readings_reading_code_key" ON "sensor_readings"("reading_code");

-- CreateIndex
CREATE INDEX "idx_sr43_machine_type_time" ON "sensor_readings"("machine_id", "sensor_type", "reading_at");

-- CreateIndex
CREATE INDEX "idx_sr43_type_alert" ON "sensor_readings"("sensor_type", "is_alert");

-- CreateIndex
CREATE INDEX "idx_sr43_time" ON "sensor_readings"("reading_at");

-- CreateIndex
CREATE UNIQUE INDEX "sensor_alerts_alert_code_key" ON "sensor_alerts"("alert_code");

-- CreateIndex
CREATE INDEX "idx_sa43_machine_status" ON "sensor_alerts"("machine_id", "status");

-- CreateIndex
CREATE INDEX "idx_sa43_type_sev" ON "sensor_alerts"("alert_type", "severity");

-- CreateIndex
CREATE INDEX "idx_sa43_status_sev" ON "sensor_alerts"("status", "severity");

-- CreateIndex
CREATE INDEX "idx_sa43_time" ON "sensor_alerts"("raised_at");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_triggers_trigger_code_key" ON "maintenance_triggers"("trigger_code");

-- CreateIndex
CREATE INDEX "idx_mt43_machine_status" ON "maintenance_triggers"("machine_id", "status");

-- CreateIndex
CREATE INDEX "idx_mt43_type_status" ON "maintenance_triggers"("trigger_type", "status");

-- CreateIndex
CREATE INDEX "idx_mt43_priority_status" ON "maintenance_triggers"("priority", "status");

-- CreateIndex
CREATE UNIQUE INDEX "oee_results_oee_code_key" ON "oee_results"("oee_code");

-- CreateIndex
CREATE INDEX "idx_oee44_scope_period" ON "oee_results"("scope_type", "scope_code", "period_start");

-- CreateIndex
CREATE INDEX "idx_oee44_period" ON "oee_results"("period_type", "period_start");

-- CreateIndex
CREATE INDEX "idx_oee44_status" ON "oee_results"("oee_status");

-- CreateIndex
CREATE INDEX "idx_oeeh44_scope_time" ON "oee_history"("scope_code", "period_start");

-- CreateIndex
CREATE INDEX "idx_oeeh44_period" ON "oee_history"("period_type");

-- CreateIndex
CREATE UNIQUE INDEX "oee_targets_target_code_key" ON "oee_targets"("target_code");

-- CreateIndex
CREATE INDEX "idx_oeet44_scope" ON "oee_targets"("scope_type", "scope_code");

-- CreateIndex
CREATE UNIQUE INDEX "production_kpis_kpi_code_key" ON "production_kpis"("kpi_code");

-- CreateIndex
CREATE INDEX "idx_pkpi44_scope_period" ON "production_kpis"("scope_type", "scope_code", "period_start");

-- CreateIndex
CREATE INDEX "idx_pkpi44_period" ON "production_kpis"("period_type", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "production_operator_scores_score_code_key" ON "production_operator_scores"("score_code");

-- CreateIndex
CREATE INDEX "idx_pos44_op_time" ON "production_operator_scores"("operator_id", "period_start");

-- CreateIndex
CREATE INDEX "idx_pos44_period" ON "production_operator_scores"("period_type", "period_start");

-- CreateIndex
CREATE INDEX "idx_pos44_score" ON "production_operator_scores"("overall_score");

-- CreateIndex
CREATE UNIQUE INDEX "downtime_events_event_code_key" ON "downtime_events"("event_code");

-- CreateIndex
CREATE INDEX "idx_dte44_machine_time" ON "downtime_events"("machine_code", "start_time");

-- CreateIndex
CREATE INDEX "idx_dte44_reason" ON "downtime_events"("reason_code");

-- CreateIndex
CREATE INDEX "idx_dte44_category" ON "downtime_events"("reason_category");

-- CreateIndex
CREATE INDEX "idx_dte44_time" ON "downtime_events"("start_time");

-- CreateIndex
CREATE UNIQUE INDEX "downtime_reasons_reason_code_key" ON "downtime_reasons"("reason_code");

-- CreateIndex
CREATE INDEX "idx_dr44_cat_status" ON "downtime_reasons"("reason_category", "status");

-- CreateIndex
CREATE INDEX "idx_dr44_severity" ON "downtime_reasons"("impact_severity");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturing_heatmaps_heatmap_code_key" ON "manufacturing_heatmaps"("heatmap_code");

-- CreateIndex
CREATE INDEX "idx_hm44_type_period" ON "manufacturing_heatmaps"("heatmap_type", "period_start");

-- CreateIndex
CREATE INDEX "idx_hm44_cell" ON "manufacturing_heatmaps"("cell_code");

-- CreateIndex
CREATE INDEX "idx_hm44_status" ON "manufacturing_heatmaps"("status_indicator");

-- CreateIndex
CREATE UNIQUE INDEX "executive_dashboard_snapshots_snapshot_code_key" ON "executive_dashboard_snapshots"("snapshot_code");

-- CreateIndex
CREATE INDEX "idx_eds44_scope_period" ON "executive_dashboard_snapshots"("scope_type", "scope_code", "period_start");

-- CreateIndex
CREATE INDEX "idx_eds44_period" ON "executive_dashboard_snapshots"("period_type", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "waste_categories_category_code_key" ON "waste_categories"("category_code");

-- CreateIndex
CREATE INDEX "idx_wc45_type_status" ON "waste_categories"("waste_type", "status");

-- CreateIndex
CREATE INDEX "idx_wc45_disposition" ON "waste_categories"("default_disposition");

-- CreateIndex
CREATE UNIQUE INDEX "waste_records_record_code_key" ON "waste_records"("record_code");

-- CreateIndex
CREATE INDEX "idx_wr45_batch" ON "waste_records"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_wr45_category" ON "waste_records"("category_code", "waste_type");

-- CreateIndex
CREATE INDEX "idx_wr45_reason" ON "waste_records"("loss_reason");

-- CreateIndex
CREATE INDEX "idx_wr45_disposition" ON "waste_records"("disposition");

-- CreateIndex
CREATE INDEX "idx_wr45_time" ON "waste_records"("recorded_at");

-- CreateIndex
CREATE UNIQUE INDEX "mfg_scrap_records_scrap_code_key" ON "mfg_scrap_records"("scrap_code");

-- CreateIndex
CREATE INDEX "idx_msr45_batch" ON "mfg_scrap_records"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_msr45_reason_status" ON "mfg_scrap_records"("scrap_reason", "status");

-- CreateIndex
CREATE INDEX "idx_msr45_disposition" ON "mfg_scrap_records"("disposition");

-- CreateIndex
CREATE UNIQUE INDEX "mfg_scrap_inventory_inventory_code_key" ON "mfg_scrap_inventory"("inventory_code");

-- CreateIndex
CREATE INDEX "idx_msi45_sku" ON "mfg_scrap_inventory"("product_sku");

-- CreateIndex
CREATE INDEX "idx_msi45_plant_status" ON "mfg_scrap_inventory"("plant_code", "status");

-- CreateIndex
CREATE UNIQUE INDEX "yield_results_yield_code_key" ON "yield_results"("yield_code");

-- CreateIndex
CREATE UNIQUE INDEX "yield_results_production_batch_number_key" ON "yield_results"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_yr45_batch" ON "yield_results"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_yr45_sku" ON "yield_results"("product_sku");

-- CreateIndex
CREATE INDEX "idx_yr45_status" ON "yield_results"("yield_status");

-- CreateIndex
CREATE UNIQUE INDEX "yield_targets_target_code_key" ON "yield_targets"("target_code");

-- CreateIndex
CREATE INDEX "idx_yt45_sku_status" ON "yield_targets"("product_sku", "status");

-- CreateIndex
CREATE UNIQUE INDEX "by_products_by_product_code_key" ON "by_products"("by_product_code");

-- CreateIndex
CREATE INDEX "idx_bp45_source_batch" ON "by_products"("source_batch_number");

-- CreateIndex
CREATE INDEX "idx_bp45_type_status" ON "by_products"("by_product_type", "status");

-- CreateIndex
CREATE INDEX "idx_bp45_disposition" ON "by_products"("disposition");

-- CreateIndex
CREATE UNIQUE INDEX "by_product_inventory_inventory_code_key" ON "by_product_inventory"("inventory_code");

-- CreateIndex
CREATE INDEX "idx_bpi45_sku" ON "by_product_inventory"("by_product_sku");

-- CreateIndex
CREATE INDEX "idx_bpi45_plant_status" ON "by_product_inventory"("plant_code", "status");

-- CreateIndex
CREATE UNIQUE INDEX "rework_orders_rework_order_number_key" ON "rework_orders"("rework_order_number");

-- CreateIndex
CREATE INDEX "idx_ro45_source_batch" ON "rework_orders"("source_batch_number");

-- CreateIndex
CREATE INDEX "idx_ro45_reason_status" ON "rework_orders"("rework_reason", "status");

-- CreateIndex
CREATE INDEX "idx_ro45_status" ON "rework_orders"("status");

-- CreateIndex
CREATE INDEX "idx_rh45_order_time" ON "rework_history"("rework_order_id", "event_time");

-- CreateIndex
CREATE UNIQUE INDEX "waste_disposals_disposal_code_key" ON "waste_disposals"("disposal_code");

-- CreateIndex
CREATE INDEX "idx_wd45_method_date" ON "waste_disposals"("disposal_method", "disposal_date");

-- CreateIndex
CREATE INDEX "idx_wd45_batch" ON "waste_disposals"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_wd45_status" ON "waste_disposals"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sustainability_metrics_metric_code_key" ON "sustainability_metrics"("metric_code");

-- CreateIndex
CREATE INDEX "idx_sm45_plant_period" ON "sustainability_metrics"("plant_code", "period_start");

-- CreateIndex
CREATE INDEX "idx_sm45_period" ON "sustainability_metrics"("period_type", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "production_schedules_schedule_number_key" ON "production_schedules"("schedule_number");

-- CreateIndex
CREATE INDEX "idx_ps46_plant_date" ON "production_schedules"("plant_code", "schedule_date");

-- CreateIndex
CREATE INDEX "idx_ps46_type_status" ON "production_schedules"("schedule_type", "status");

-- CreateIndex
CREATE INDEX "idx_ps46_status" ON "production_schedules"("status");

-- CreateIndex
CREATE INDEX "idx_so46_schedule_op" ON "schedule_operations"("schedule_id", "operation_no");

-- CreateIndex
CREATE INDEX "idx_so46_machine_time" ON "schedule_operations"("machine_code", "planned_start");

-- CreateIndex
CREATE INDEX "idx_so46_time" ON "schedule_operations"("planned_start");

-- CreateIndex
CREATE INDEX "idx_sv46_schedule_version" ON "schedule_versions"("schedule_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "machine_schedules_machine_schedule_code_key" ON "machine_schedules"("machine_schedule_code");

-- CreateIndex
CREATE INDEX "idx_msch46_machine_time" ON "machine_schedules"("machine_code", "start_time");

-- CreateIndex
CREATE INDEX "idx_msch46_schedule" ON "machine_schedules"("schedule_id");

-- CreateIndex
CREATE INDEX "idx_msch46_time" ON "machine_schedules"("start_time");

-- CreateIndex
CREATE UNIQUE INDEX "changeovers_changeover_code_key" ON "changeovers"("changeover_code");

-- CreateIndex
CREATE INDEX "idx_chg46_machine_products" ON "changeovers"("machine_code", "from_product_sku", "to_product_sku");

-- CreateIndex
CREATE INDEX "idx_chg46_type" ON "changeovers"("changeover_type");

-- CreateIndex
CREATE UNIQUE INDEX "changeover_rules_rule_code_key" ON "changeover_rules"("rule_code");

-- CreateIndex
CREATE INDEX "idx_cr46_families" ON "changeover_rules"("from_product_family", "to_product_family");

-- CreateIndex
CREATE UNIQUE INDEX "production_campaigns_campaign_code_key" ON "production_campaigns"("campaign_code");

-- CreateIndex
CREATE INDEX "idx_pc46_family_status" ON "production_campaigns"("product_family", "status");

-- CreateIndex
CREATE INDEX "idx_pc46_start" ON "production_campaigns"("campaign_start");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_constraints_constraint_code_key" ON "schedule_constraints"("constraint_code");

-- CreateIndex
CREATE INDEX "idx_sc46_schedule_status" ON "schedule_constraints"("schedule_id", "constraint_status");

-- CreateIndex
CREATE INDEX "idx_sc46_type_sev" ON "schedule_constraints"("constraint_type", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_simulations_simulation_code_key" ON "schedule_simulations"("simulation_code");

-- CreateIndex
CREATE INDEX "idx_sim46_source" ON "schedule_simulations"("source_schedule_id");

-- CreateIndex
CREATE INDEX "idx_sim46_scenario" ON "schedule_simulations"("scenario_type");

-- CreateIndex
CREATE UNIQUE INDEX "mfg_mission_control_snapshot_code_key" ON "mfg_mission_control"("snapshot_code");

-- CreateIndex
CREATE INDEX "idx_mmc47_scope_time" ON "mfg_mission_control"("scope_type", "scope_code", "snapshot_at");

-- CreateIndex
CREATE INDEX "idx_mmc47_health" ON "mfg_mission_control"("factory_health_status");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturing_alerts_alert_code_key" ON "manufacturing_alerts"("alert_code");

-- CreateIndex
CREATE INDEX "idx_mal47_plant_status_sev" ON "manufacturing_alerts"("plant_code", "status", "severity");

-- CreateIndex
CREATE INDEX "idx_mal47_type_sev" ON "manufacturing_alerts"("alert_type", "severity");

-- CreateIndex
CREATE INDEX "idx_mal47_status" ON "manufacturing_alerts"("status");

-- CreateIndex
CREATE INDEX "idx_mal47_time" ON "manufacturing_alerts"("raised_at");

-- CreateIndex
CREATE UNIQUE INDEX "mfg_ai_recommendations_recommendation_code_key" ON "mfg_ai_recommendations"("recommendation_code");

-- CreateIndex
CREATE INDEX "idx_air47_engine_status" ON "mfg_ai_recommendations"("ai_engine", "action_status");

-- CreateIndex
CREATE INDEX "idx_air47_type_priority" ON "mfg_ai_recommendations"("recommendation_type", "priority");

-- CreateIndex
CREATE INDEX "idx_air47_status" ON "mfg_ai_recommendations"("action_status");

-- CreateIndex
CREATE UNIQUE INDEX "factory_health_checks_check_code_key" ON "factory_health_checks"("check_code");

-- CreateIndex
CREATE INDEX "idx_fhc47_system_status" ON "factory_health_checks"("system_name", "health_status");

-- CreateIndex
CREATE INDEX "idx_fhc47_status" ON "factory_health_checks"("health_status");

-- CreateIndex
CREATE UNIQUE INDEX "business_continuity_events_event_code_key" ON "business_continuity_events"("event_code");

-- CreateIndex
CREATE INDEX "idx_bce47_system_status" ON "business_continuity_events"("system_name", "status");

-- CreateIndex
CREATE INDEX "idx_bce47_sev_status" ON "business_continuity_events"("severity", "status");

-- CreateIndex
CREATE INDEX "idx_bce47_time" ON "business_continuity_events"("detected_at");

-- CreateIndex
CREATE UNIQUE INDEX "executive_scorecards_scorecard_code_key" ON "executive_scorecards"("scorecard_code");

-- CreateIndex
CREATE INDEX "idx_esc47_scope_period" ON "executive_scorecards"("scope_type", "scope_code", "period_start");

-- CreateIndex
CREATE INDEX "idx_esc47_status" ON "executive_scorecards"("overall_status");

-- CreateIndex
CREATE INDEX "idx_esc47_period" ON "executive_scorecards"("period_type", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "control_tower_views_view_code_key" ON "control_tower_views"("view_code");

-- CreateIndex
CREATE INDEX "idx_ctv47_type_scope" ON "control_tower_views"("view_type", "scope_code");

-- CreateIndex
CREATE INDEX "idx_ctv47_status" ON "control_tower_views"("status_indicator");

-- CreateIndex
CREATE INDEX "idx_ctv47_risk" ON "control_tower_views"("risk_level");

-- CreateIndex
CREATE UNIQUE INDEX "digital_factory_nodes_node_code_key" ON "digital_factory_nodes"("node_code");

-- CreateIndex
CREATE INDEX "idx_dfn47_type_plant" ON "digital_factory_nodes"("node_type", "plant_code");

-- CreateIndex
CREATE INDEX "idx_dfn47_parent" ON "digital_factory_nodes"("parent_node_id");

-- CreateIndex
CREATE INDEX "idx_dfn47_status" ON "digital_factory_nodes"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ai_production_models_model_code_key" ON "ai_production_models"("model_code");

-- CreateIndex
CREATE INDEX "idx_aipm48_type_status" ON "ai_production_models"("model_type", "status");

-- CreateIndex
CREATE INDEX "idx_aipm48_status" ON "ai_production_models"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ai_mfg_recommendations_recommendation_code_key" ON "ai_mfg_recommendations"("recommendation_code");

-- CreateIndex
CREATE INDEX "idx_amr48_type_status" ON "ai_mfg_recommendations"("model_type", "action_status");

-- CreateIndex
CREATE INDEX "idx_amr48_type_priority" ON "ai_mfg_recommendations"("recommendation_type", "priority");

-- CreateIndex
CREATE INDEX "idx_amr48_status" ON "ai_mfg_recommendations"("action_status");

-- CreateIndex
CREATE UNIQUE INDEX "ai_decision_history_decision_code_key" ON "ai_decision_history"("decision_code");

-- CreateIndex
CREATE INDEX "idx_adh48_rec" ON "ai_decision_history"("recommendation_code");

-- CreateIndex
CREATE INDEX "idx_adh48_type" ON "ai_decision_history"("decision_type");

-- CreateIndex
CREATE UNIQUE INDEX "predictive_maintenance_results_prediction_code_key" ON "predictive_maintenance_results"("prediction_code");

-- CreateIndex
CREATE INDEX "idx_pmr48_machine_status" ON "predictive_maintenance_results"("machine_code", "status");

-- CreateIndex
CREATE INDEX "idx_pmr48_type_prob" ON "predictive_maintenance_results"("failure_type", "failure_probability");

-- CreateIndex
CREATE INDEX "idx_pmr48_status" ON "predictive_maintenance_results"("status");

-- CreateIndex
CREATE UNIQUE INDEX "predictive_quality_results_prediction_code_key" ON "predictive_quality_results"("prediction_code");

-- CreateIndex
CREATE INDEX "idx_pqr48_sku_risk" ON "predictive_quality_results"("product_sku", "risk_level");

-- CreateIndex
CREATE INDEX "idx_pqr48_type_status" ON "predictive_quality_results"("prediction_type", "status");

-- CreateIndex
CREATE INDEX "idx_pqr48_status" ON "predictive_quality_results"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ai_energy_optimizations_optimization_code_key" ON "ai_energy_optimizations"("optimization_code");

-- CreateIndex
CREATE INDEX "idx_aeo48_plant_type" ON "ai_energy_optimizations"("plant_code", "energy_type");

-- CreateIndex
CREATE INDEX "idx_aeo48_type_status" ON "ai_energy_optimizations"("optimization_type", "status");

-- CreateIndex
CREATE INDEX "idx_aeo48_status" ON "ai_energy_optimizations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "root_cause_analyses_analysis_code_key" ON "root_cause_analyses"("analysis_code");

-- CreateIndex
CREATE INDEX "idx_rca48_type_status" ON "root_cause_analyses"("incident_type", "status");

-- CreateIndex
CREATE INDEX "idx_rca48_category" ON "root_cause_analyses"("root_cause_category");

-- CreateIndex
CREATE INDEX "idx_rca48_status" ON "root_cause_analyses"("status");

-- CreateIndex
CREATE UNIQUE INDEX "continuous_improvements_improvement_code_key" ON "continuous_improvements"("improvement_code");

-- CreateIndex
CREATE INDEX "idx_cim48_source_status" ON "continuous_improvements"("source_type", "status");

-- CreateIndex
CREATE INDEX "idx_cim48_type" ON "continuous_improvements"("improvement_type");

-- CreateIndex
CREATE INDEX "idx_cim48_status" ON "continuous_improvements"("status");

-- CreateIndex
CREATE UNIQUE INDEX "quality_departments_department_code_key" ON "quality_departments"("department_code");

-- CreateIndex
CREATE INDEX "idx_qd49_plant_status" ON "quality_departments"("plant_code", "status");

-- CreateIndex
CREATE INDEX "idx_qd49_scope" ON "quality_departments"("inspection_scope");

-- CreateIndex
CREATE UNIQUE INDEX "quality_locations_location_code_key" ON "quality_locations"("location_code");

-- CreateIndex
CREATE INDEX "idx_ql49_plant_type" ON "quality_locations"("plant_code", "location_type");

-- CreateIndex
CREATE INDEX "idx_ql49_dept" ON "quality_locations"("department_code");

-- CreateIndex
CREATE UNIQUE INDEX "quality_roles_role_code_key" ON "quality_roles"("role_code");

-- CreateIndex
CREATE INDEX "idx_qr49_level_status" ON "quality_roles"("role_level", "status");

-- CreateIndex
CREATE UNIQUE INDEX "quality_standards_standard_code_key" ON "quality_standards"("standard_code");

-- CreateIndex
CREATE INDEX "idx_qs49_type_status" ON "quality_standards"("standard_type", "status");

-- CreateIndex
CREATE INDEX "idx_qs49_status" ON "quality_standards"("status");

-- CreateIndex
CREATE INDEX "idx_qsv49_std_version" ON "quality_standard_versions"("standard_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_types_type_code_key" ON "inspection_types"("type_code");

-- CreateIndex
CREATE INDEX "idx_it49_cat_status" ON "inspection_types"("category", "status");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_templates_template_code_key" ON "inspection_templates"("template_code");

-- CreateIndex
CREATE INDEX "idx_itp49_scope_status" ON "inspection_templates"("applicable_to", "status");

-- CreateIndex
CREATE INDEX "idx_itp49_sku" ON "inspection_templates"("product_sku");

-- CreateIndex
CREATE INDEX "idx_ip49_template" ON "inspection_parameters"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "sampling_plans_plan_code_key" ON "sampling_plans"("plan_code");

-- CreateIndex
CREATE INDEX "idx_sp49_type_status" ON "sampling_plans"("sampling_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "quality_specifications_spec_code_key" ON "quality_specifications"("spec_code");

-- CreateIndex
CREATE INDEX "idx_qspec49_sku_status" ON "quality_specifications"("product_sku", "status");

-- CreateIndex
CREATE INDEX "idx_qspec49_status" ON "quality_specifications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "test_methods_method_code_key" ON "test_methods"("method_code");

-- CreateIndex
CREATE INDEX "idx_tm49_type_status" ON "test_methods"("method_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "test_equipment_equipment_code_key" ON "test_equipment"("equipment_code");

-- CreateIndex
CREATE INDEX "idx_te49_plant_status" ON "test_equipment"("plant_code", "status");

-- CreateIndex
CREATE INDEX "idx_te49_calibration" ON "test_equipment"("next_calibration_due");

-- CreateIndex
CREATE UNIQUE INDEX "quality_calendar_calendar_code_key" ON "quality_calendar"("calendar_code");

-- CreateIndex
CREATE INDEX "idx_qcal49_date_status" ON "quality_calendar"("scheduled_date", "status");

-- CreateIndex
CREATE INDEX "idx_qcal49_type_status" ON "quality_calendar"("event_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_qualifications_supplier_code_key" ON "supplier_qualifications"("supplier_code");

-- CreateIndex
CREATE INDEX "idx_sq50_cat_status" ON "supplier_qualifications"("supplier_category", "approval_status");

-- CreateIndex
CREATE INDEX "idx_sq50_status_risk" ON "supplier_qualifications"("approval_status", "risk_level");

-- CreateIndex
CREATE INDEX "idx_sq50_preferred" ON "supplier_qualifications"("is_preferred_supplier");

-- CreateIndex
CREATE INDEX "idx_sc50_supplier_type" ON "supplier_certifications"("supplier_code", "certification_type");

-- CreateIndex
CREATE INDEX "idx_sc50_expiry" ON "supplier_certifications"("expiry_date");

-- CreateIndex
CREATE INDEX "idx_sa50_supplier_date" ON "supplier_audits"("supplier_code", "audit_date");

-- CreateIndex
CREATE INDEX "idx_sa50_status" ON "supplier_audits"("status");

-- CreateIndex
CREATE UNIQUE INDEX "incoming_inspections_inspection_code_key" ON "incoming_inspections"("inspection_code");

-- CreateIndex
CREATE INDEX "idx_ii50_grn" ON "incoming_inspections"("grn_number");

-- CreateIndex
CREATE INDEX "idx_ii50_supplier_status" ON "incoming_inspections"("supplier_code", "status");

-- CreateIndex
CREATE INDEX "idx_ii50_status" ON "incoming_inspections"("status");

-- CreateIndex
CREATE INDEX "idx_ii50_material" ON "incoming_inspections"("material_code");

-- CreateIndex
CREATE INDEX "idx_is50_inspection" ON "inspection_samples"("inspection_id");

-- CreateIndex
CREATE INDEX "idx_ires50_inspection" ON "inspection_results"("inspection_id");

-- CreateIndex
CREATE INDEX "idx_ires50_sample" ON "inspection_results"("sample_id");

-- CreateIndex
CREATE INDEX "idx_ires50_result" ON "inspection_results"("result");

-- CreateIndex
CREATE UNIQUE INDEX "quality_hold_inventory_hold_code_key" ON "quality_hold_inventory"("hold_code");

-- CreateIndex
CREATE INDEX "idx_qhi50_grn" ON "quality_hold_inventory"("grn_number");

-- CreateIndex
CREATE INDEX "idx_qhi50_supplier_status" ON "quality_hold_inventory"("supplier_code", "inventory_status");

-- CreateIndex
CREATE INDEX "idx_qhi50_status" ON "quality_hold_inventory"("inventory_status");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_ncrs_ncr_number_key" ON "supplier_ncrs"("ncr_number");

-- CreateIndex
CREATE INDEX "idx_sncr50_supplier_status" ON "supplier_ncrs"("supplier_code", "status");

-- CreateIndex
CREATE INDEX "idx_sncr50_sev_status" ON "supplier_ncrs"("severity", "status");

-- CreateIndex
CREATE INDEX "idx_sncr50_status" ON "supplier_ncrs"("status");

-- CreateIndex
CREATE INDEX "idx_sca50_ncr" ON "supplier_corrective_actions"("ncr_id");

-- CreateIndex
CREATE INDEX "idx_sca50_status" ON "supplier_corrective_actions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_scorecards_scorecard_code_key" ON "vendor_scorecards"("scorecard_code");

-- CreateIndex
CREATE INDEX "idx_vsc50_supplier_period" ON "vendor_scorecards"("supplier_code", "period_start");

-- CreateIndex
CREATE INDEX "idx_vsc50_rating" ON "vendor_scorecards"("overall_rating");

-- CreateIndex
CREATE UNIQUE INDEX "ipqc_inspections_inspection_code_key" ON "ipqc_inspections"("inspection_code");

-- CreateIndex
CREATE INDEX "idx_ipqc51_batch_stage" ON "ipqc_inspections"("production_batch_number", "production_stage");

-- CreateIndex
CREATE INDEX "idx_ipqc51_status" ON "ipqc_inspections"("status");

-- CreateIndex
CREATE INDEX "idx_ipqc51_po" ON "ipqc_inspections"("production_order_number");

-- CreateIndex
CREATE INDEX "idx_ipqcr51_inspection" ON "ipqc_results"("inspection_id");

-- CreateIndex
CREATE INDEX "idx_ipqcr51_result" ON "ipqc_results"("result");

-- CreateIndex
CREATE UNIQUE INDEX "quality_checkpoints_checkpoint_code_key" ON "quality_checkpoints"("checkpoint_code");

-- CreateIndex
CREATE INDEX "idx_cp51_stage_family" ON "quality_checkpoints"("production_stage", "product_family");

-- CreateIndex
CREATE INDEX "idx_cp51_ccp_mandatory" ON "quality_checkpoints"("is_ccp", "is_mandatory");

-- CreateIndex
CREATE INDEX "idx_cp51_sku" ON "quality_checkpoints"("product_sku");

-- CreateIndex
CREATE UNIQUE INDEX "process_parameters_parameter_code_key" ON "process_parameters"("parameter_code");

-- CreateIndex
CREATE INDEX "idx_pp51_machine_type" ON "process_parameters"("machine_code", "parameter_type");

-- CreateIndex
CREATE INDEX "idx_pp51_critical" ON "process_parameters"("is_critical");

-- CreateIndex
CREATE UNIQUE INDEX "ccp_points_ccp_code_key" ON "ccp_points"("ccp_code");

-- CreateIndex
CREATE INDEX "idx_ccp51_stage_status" ON "ccp_points"("production_stage", "status");

-- CreateIndex
CREATE INDEX "idx_ccp51_family" ON "ccp_points"("product_family");

-- CreateIndex
CREATE INDEX "idx_ccpr51_ccp_time" ON "ccp_records"("ccp_id", "checked_at");

-- CreateIndex
CREATE INDEX "idx_ccpr51_status" ON "ccp_records"("ccp_status");

-- CreateIndex
CREATE INDEX "idx_ccpr51_batch" ON "ccp_records"("production_batch_number");

-- CreateIndex
CREATE UNIQUE INDEX "batch_quality_records_record_code_key" ON "batch_quality_records"("record_code");

-- CreateIndex
CREATE UNIQUE INDEX "batch_quality_records_production_batch_number_key" ON "batch_quality_records"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_bqr51_batch" ON "batch_quality_records"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_bqr51_sku_status" ON "batch_quality_records"("product_sku", "status");

-- CreateIndex
CREATE INDEX "idx_bqr51_status" ON "batch_quality_records"("status");

-- CreateIndex
CREATE UNIQUE INDEX "production_quality_holds_hold_code_key" ON "production_quality_holds"("hold_code");

-- CreateIndex
CREATE INDEX "idx_pqh51_batch_status" ON "production_quality_holds"("production_batch_number", "status");

-- CreateIndex
CREATE INDEX "idx_pqh51_reason_sev" ON "production_quality_holds"("hold_reason", "severity");

-- CreateIndex
CREATE INDEX "idx_pqh51_status" ON "production_quality_holds"("status");

-- CreateIndex
CREATE UNIQUE INDEX "fgqc_inspections_inspection_code_key" ON "fgqc_inspections"("inspection_code");

-- CreateIndex
CREATE INDEX "idx_fgqc52_batch" ON "fgqc_inspections"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_fgqc52_status" ON "fgqc_inspections"("status");

-- CreateIndex
CREATE INDEX "idx_fgqc52_sku" ON "fgqc_inspections"("product_sku");

-- CreateIndex
CREATE INDEX "idx_fgqcr52_inspection" ON "fgqc_results"("inspection_id");

-- CreateIndex
CREATE INDEX "idx_fgqcr52_result" ON "fgqc_results"("result");

-- CreateIndex
CREATE UNIQUE INDEX "shelf_life_validations_validation_code_key" ON "shelf_life_validations"("validation_code");

-- CreateIndex
CREATE INDEX "idx_slv52_batch" ON "shelf_life_validations"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_slv52_alert" ON "shelf_life_validations"("alert_level");

-- CreateIndex
CREATE INDEX "idx_slv52_sku" ON "shelf_life_validations"("product_sku");

-- CreateIndex
CREATE INDEX "idx_sr52_validation" ON "stability_results"("validation_id");

-- CreateIndex
CREATE UNIQUE INDEX "batch_releases_release_code_key" ON "batch_releases"("release_code");

-- CreateIndex
CREATE UNIQUE INDEX "batch_releases_production_batch_number_key" ON "batch_releases"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_br52_batch" ON "batch_releases"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_br52_status" ON "batch_releases"("status");

-- CreateIndex
CREATE INDEX "idx_br52_sku" ON "batch_releases"("product_sku");

-- CreateIndex
CREATE INDEX "idx_ra52_release" ON "release_approvals"("batch_release_id");

-- CreateIndex
CREATE INDEX "idx_ra52_type_decision" ON "release_approvals"("approval_type", "approval_decision");

-- CreateIndex
CREATE UNIQUE INDEX "quality_certificates_certificate_code_key" ON "quality_certificates"("certificate_code");

-- CreateIndex
CREATE INDEX "idx_qcert52_batch" ON "quality_certificates"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_qcert52_type_status" ON "quality_certificates"("certificate_type", "status");

-- CreateIndex
CREATE INDEX "idx_qcert52_sku" ON "quality_certificates"("product_sku");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_compliance_checks_check_code_key" ON "packaging_compliance_checks"("check_code");

-- CreateIndex
CREATE INDEX "idx_pcc52_batch" ON "packaging_compliance_checks"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_pcc52_compliance" ON "packaging_compliance_checks"("overall_compliance");

-- CreateIndex
CREATE UNIQUE INDEX "lab_samples_sample_number_key" ON "lab_samples"("sample_number");

-- CreateIndex
CREATE UNIQUE INDEX "lab_samples_barcode_key" ON "lab_samples"("barcode");

-- CreateIndex
CREATE INDEX "idx_ls53_type_status" ON "lab_samples"("sample_type", "status");

-- CreateIndex
CREATE INDEX "idx_ls53_batch" ON "lab_samples"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_ls53_barcode" ON "lab_samples"("barcode");

-- CreateIndex
CREATE INDEX "idx_ls53_status_priority" ON "lab_samples"("status", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "lab_worklists_worklist_code_key" ON "lab_worklists"("worklist_code");

-- CreateIndex
CREATE INDEX "idx_lw53_date_status" ON "lab_worklists"("worklist_date", "status");

-- CreateIndex
CREATE INDEX "idx_lw53_assignee" ON "lab_worklists"("assigned_to_id");

-- CreateIndex
CREATE UNIQUE INDEX "lab_tests_test_code_key" ON "lab_tests"("test_code");

-- CreateIndex
CREATE INDEX "idx_lt53_sample" ON "lab_tests"("sample_id");

-- CreateIndex
CREATE INDEX "idx_lt53_worklist" ON "lab_tests"("worklist_id");

-- CreateIndex
CREATE INDEX "idx_lt53_cat_type" ON "lab_tests"("test_category", "test_type");

-- CreateIndex
CREATE INDEX "idx_lt53_status_priority" ON "lab_tests"("status", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "lab_equipment_equipment_code_key" ON "lab_equipment"("equipment_code");

-- CreateIndex
CREATE INDEX "idx_le53_plant_status" ON "lab_equipment"("plant_code", "status");

-- CreateIndex
CREATE INDEX "idx_le53_calibration" ON "lab_equipment"("calibration_status");

-- CreateIndex
CREATE UNIQUE INDEX "lab_inventory_item_code_key" ON "lab_inventory"("item_code");

-- CreateIndex
CREATE INDEX "idx_li53_type_status" ON "lab_inventory"("item_type", "status");

-- CreateIndex
CREATE INDEX "idx_li53_expiry" ON "lab_inventory"("expiry_date");

-- CreateIndex
CREATE INDEX "idx_li53_low_stock" ON "lab_inventory"("is_low_stock");

-- CreateIndex
CREATE UNIQUE INDEX "lab_reports_report_code_key" ON "lab_reports"("report_code");

-- CreateIndex
CREATE INDEX "idx_lrep53_sample" ON "lab_reports"("sample_number");

-- CreateIndex
CREATE INDEX "idx_lrep53_type_status" ON "lab_reports"("report_type", "status");

-- CreateIndex
CREATE INDEX "idx_st53_sample_time" ON "sample_tracking"("sample_number", "event_time");

-- CreateIndex
CREATE INDEX "idx_st53_event" ON "sample_tracking"("tracking_event");

-- CreateIndex
CREATE UNIQUE INDEX "haccp_plans_plan_number_key" ON "haccp_plans"("plan_number");

-- CreateIndex
CREATE INDEX "idx_hp54_plant_status" ON "haccp_plans"("plant_code", "status");

-- CreateIndex
CREATE INDEX "idx_hp54_family" ON "haccp_plans"("product_family");

-- CreateIndex
CREATE INDEX "idx_hp54_status" ON "haccp_plans"("status");

-- CreateIndex
CREATE INDEX "idx_ha54_plan" ON "hazard_assessments"("haccp_plan_id");

-- CreateIndex
CREATE INDEX "idx_ha54_type_risk" ON "hazard_assessments"("hazard_type", "risk_level");

-- CreateIndex
CREATE INDEX "idx_ha54_risk" ON "hazard_assessments"("risk_level");

-- CreateIndex
CREATE UNIQUE INDEX "critical_control_points_v2_ccp_code_key" ON "critical_control_points_v2"("ccp_code");

-- CreateIndex
CREATE INDEX "idx_ccpv2_54_plan" ON "critical_control_points_v2"("haccp_plan_id");

-- CreateIndex
CREATE INDEX "idx_ccpv2_54_stage" ON "critical_control_points_v2"("production_stage");

-- CreateIndex
CREATE UNIQUE INDEX "oprp_controls_oprp_code_key" ON "oprp_controls"("oprp_code");

-- CreateIndex
CREATE INDEX "idx_oprp54_plan" ON "oprp_controls"("haccp_plan_id");

-- CreateIndex
CREATE INDEX "idx_oprp54_type_status" ON "oprp_controls"("oprp_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "environmental_samples_sample_code_key" ON "environmental_samples"("sample_code");

-- CreateIndex
CREATE INDEX "idx_es54_type_status" ON "environmental_samples"("sample_type", "status");

-- CreateIndex
CREATE INDEX "idx_es54_loc_freq" ON "environmental_samples"("monitoring_location", "frequency");

-- CreateIndex
CREATE INDEX "idx_es54_date" ON "environmental_samples"("scheduled_date");

-- CreateIndex
CREATE UNIQUE INDEX "sanitation_records_record_code_key" ON "sanitation_records"("record_code");

-- CreateIndex
CREATE INDEX "idx_san54_type_status" ON "sanitation_records"("cleaning_type", "status");

-- CreateIndex
CREATE INDEX "idx_san54_date" ON "sanitation_records"("scheduled_date");

-- CreateIndex
CREATE INDEX "idx_san54_line" ON "sanitation_records"("production_line_code");

-- CreateIndex
CREATE INDEX "idx_am54_sku" ON "allergen_matrix_entries"("product_sku");

-- CreateIndex
CREATE INDEX "idx_am54_status" ON "allergen_matrix_entries"("status");

-- CreateIndex
CREATE UNIQUE INDEX "cross_contact_records_record_code_key" ON "cross_contact_records"("record_code");

-- CreateIndex
CREATE INDEX "idx_xcr54_line_status" ON "cross_contact_records"("production_line_code", "status");

-- CreateIndex
CREATE INDEX "idx_xcr54_allergen_sev" ON "cross_contact_records"("allergen_type", "severity");

-- CreateIndex
CREATE UNIQUE INDEX "food_defense_plans_plan_code_key" ON "food_defense_plans"("plan_code");

-- CreateIndex
CREATE INDEX "idx_fdp54_plant_status" ON "food_defense_plans"("plant_code", "status");

-- CreateIndex
CREATE UNIQUE INDEX "food_fraud_assessments_assessment_code_key" ON "food_fraud_assessments"("assessment_code");

-- CreateIndex
CREATE INDEX "idx_ffa54_material" ON "food_fraud_assessments"("material_code");

-- CreateIndex
CREATE INDEX "idx_ffa54_score" ON "food_fraud_assessments"("vulnerability_score");

-- CreateIndex
CREATE UNIQUE INDEX "non_conformance_reports_ncr_number_key" ON "non_conformance_reports"("ncr_number");

-- CreateIndex
CREATE INDEX "idx_ncr55_sev_status" ON "non_conformance_reports"("severity", "status");

-- CreateIndex
CREATE INDEX "idx_ncr55_source" ON "non_conformance_reports"("source_module");

-- CreateIndex
CREATE INDEX "idx_ncr55_batch" ON "non_conformance_reports"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_ncr55_status" ON "non_conformance_reports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "process_deviations_deviation_code_key" ON "process_deviations"("deviation_code");

-- CreateIndex
CREATE UNIQUE INDEX "process_deviations_ncr_id_key" ON "process_deviations"("ncr_id");

-- CreateIndex
CREATE INDEX "idx_pd55_type_status" ON "process_deviations"("deviation_type", "status");

-- CreateIndex
CREATE INDEX "idx_pd55_ncr" ON "process_deviations"("ncr_id");

-- CreateIndex
CREATE UNIQUE INDEX "root_cause_investigations_investigation_code_key" ON "root_cause_investigations"("investigation_code");

-- CreateIndex
CREATE UNIQUE INDEX "root_cause_investigations_ncr_id_key" ON "root_cause_investigations"("ncr_id");

-- CreateIndex
CREATE INDEX "idx_rci55_ncr" ON "root_cause_investigations"("ncr_id");

-- CreateIndex
CREATE INDEX "idx_rci55_status" ON "root_cause_investigations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "quality_risk_assessments_assessment_code_key" ON "quality_risk_assessments"("assessment_code");

-- CreateIndex
CREATE UNIQUE INDEX "quality_risk_assessments_ncr_id_key" ON "quality_risk_assessments"("ncr_id");

-- CreateIndex
CREATE INDEX "idx_qra55_ncr" ON "quality_risk_assessments"("ncr_id");

-- CreateIndex
CREATE INDEX "idx_qra55_risk" ON "quality_risk_assessments"("risk_level");

-- CreateIndex
CREATE UNIQUE INDEX "quarantine_inventory_quarantine_code_key" ON "quarantine_inventory"("quarantine_code");

-- CreateIndex
CREATE INDEX "idx_qi55_ncr" ON "quarantine_inventory"("ncr_number");

-- CreateIndex
CREATE INDEX "idx_qi55_batch" ON "quarantine_inventory"("production_batch_number");

-- CreateIndex
CREATE INDEX "idx_qi55_status" ON "quarantine_inventory"("status");

-- CreateIndex
CREATE UNIQUE INDEX "escalation_events_escalation_code_key" ON "escalation_events"("escalation_code");

-- CreateIndex
CREATE INDEX "idx_esc55_ncr" ON "escalation_events"("ncr_number");

-- CreateIndex
CREATE INDEX "idx_esc55_sev_status" ON "escalation_events"("severity", "status");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "user_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_history" ADD CONSTRAINT "password_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_settings" ADD CONSTRAINT "enterprise_settings_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enterprise_contacts" ADD CONSTRAINT "enterprise_contacts_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_enterprise_id_fkey" FOREIGN KEY ("enterprise_id") REFERENCES "enterprises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_addresses" ADD CONSTRAINT "company_addresses_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_tax_profiles" ADD CONSTRAINT "company_tax_profiles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_bank_accounts" ADD CONSTRAINT "company_bank_accounts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_units" ADD CONSTRAINT "business_units_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_units" ADD CONSTRAINT "business_units_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "business_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_bu_id_fkey" FOREIGN KEY ("bu_id") REFERENCES "business_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_bu_id_fkey" FOREIGN KEY ("bu_id") REFERENCES "business_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_addresses" ADD CONSTRAINT "branch_addresses_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_contacts" ADD CONSTRAINT "branch_contacts_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plants" ADD CONSTRAINT "plants_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_settings" ADD CONSTRAINT "plant_settings_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_settings" ADD CONSTRAINT "warehouse_settings_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_heads" ADD CONSTRAINT "department_heads_dept_id_fkey" FOREIGN KEY ("dept_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_parent_role_id_fkey" FOREIGN KEY ("parent_role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_permission_group_id_fkey" FOREIGN KEY ("permission_group_id") REFERENCES "permission_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_roles" ADD CONSTRAINT "group_roles_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "user_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_roles" ADD CONSTRAINT "group_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_parent_menu_id_fkey" FOREIGN KEY ("parent_menu_id") REFERENCES "menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_permissions" ADD CONSTRAINT "menu_permissions_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_permissions" ADD CONSTRAINT "menu_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_assignments" ADD CONSTRAINT "feature_assignments_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uom_conversions" ADD CONSTRAINT "uom_conversions_from_uom_id_fkey" FOREIGN KEY ("from_uom_id") REFERENCES "uoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uom_conversions" ADD CONSTRAINT "uom_conversions_to_uom_id_fkey" FOREIGN KEY ("to_uom_id") REFERENCES "uoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_default_uom_id_fkey" FOREIGN KEY ("default_uom_id") REFERENCES "uoms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_weight_uom_id_fkey" FOREIGN KEY ("weight_uom_id") REFERENCES "uoms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_documents" ADD CONSTRAINT "product_documents_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_family_mappings" ADD CONSTRAINT "product_family_mappings_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "product_families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_groups" ADD CONSTRAINT "product_groups_parent_group_id_fkey" FOREIGN KEY ("parent_group_id") REFERENCES "product_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_group_mappings" ADD CONSTRAINT "product_group_mappings_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "product_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_collection_items" ADD CONSTRAINT "product_collection_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "product_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_price_list_id_fkey" FOREIGN KEY ("price_list_id") REFERENCES "price_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_versions" ADD CONSTRAINT "price_list_versions_price_list_id_fkey" FOREIGN KEY ("price_list_id") REFERENCES "price_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_tax_group_id_fkey" FOREIGN KEY ("tax_group_id") REFERENCES "tax_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_tax_mapping" ADD CONSTRAINT "product_tax_mapping_tax_group_id_fkey" FOREIGN KEY ("tax_group_id") REFERENCES "tax_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_tax_group_id_fkey" FOREIGN KEY ("tax_group_id") REFERENCES "tax_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_conditions" ADD CONSTRAINT "discount_conditions_discount_rule_id_fkey" FOREIGN KEY ("discount_rule_id") REFERENCES "discount_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_targets" ADD CONSTRAINT "discount_targets_discount_rule_id_fkey" FOREIGN KEY ("discount_rule_id") REFERENCES "discount_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_products" ADD CONSTRAINT "promotion_products_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_conditions" ADD CONSTRAINT "promotion_conditions_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_partner_roles" ADD CONSTRAINT "business_partner_roles_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "business_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_partner_addresses" ADD CONSTRAINT "business_partner_addresses_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "business_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_partner_contacts" ADD CONSTRAINT "business_partner_contacts_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "business_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_partner_financial_profiles" ADD CONSTRAINT "business_partner_financial_profiles_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "business_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_partner_compliance" ADD CONSTRAINT "business_partner_compliance_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "business_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_partner_group_memberships" ADD CONSTRAINT "business_partner_group_memberships_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "business_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_partner_group_memberships" ADD CONSTRAINT "business_partner_group_memberships_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "customer_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_partner_bank_accounts" ADD CONSTRAINT "business_partner_bank_accounts_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "business_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_partner_relationships" ADD CONSTRAINT "business_partner_relationships_from_partner_id_fkey" FOREIGN KEY ("from_partner_id") REFERENCES "business_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_partner_relationships" ADD CONSTRAINT "business_partner_relationships_to_partner_id_fkey" FOREIGN KEY ("to_partner_id") REFERENCES "business_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_partner_scorecards" ADD CONSTRAINT "business_partner_scorecards_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "business_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barcodes" ADD CONSTRAINT "barcodes_barcode_type_id_fkey" FOREIGN KEY ("barcode_type_id") REFERENCES "barcode_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barcode_assignments" ADD CONSTRAINT "barcode_assignments_barcode_id_fkey" FOREIGN KEY ("barcode_id") REFERENCES "barcodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "label_print_jobs" ADD CONSTRAINT "label_print_jobs_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "label_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traceability_logs" ADD CONSTRAINT "traceability_logs_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_lifecycle_history" ADD CONSTRAINT "product_lifecycle_history_lifecycle_id_fkey" FOREIGN KEY ("lifecycle_id") REFERENCES "product_lifecycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_approval_steps" ADD CONSTRAINT "product_approval_steps_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "product_approval_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_approval_logs" ADD CONSTRAINT "product_approval_logs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "product_approval_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_errors" ADD CONSTRAINT "import_errors_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "import_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validation_results" ADD CONSTRAINT "validation_results_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "validation_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_transaction_type_id_fkey" FOREIGN KEY ("transaction_type_id") REFERENCES "inventory_transaction_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transaction_lines" ADD CONSTRAINT "inventory_transaction_lines_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "inventory_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "inventory_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_journal" ADD CONSTRAINT "inventory_journal_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "inventory_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goods_receipt_lines" ADD CONSTRAINT "goods_receipt_lines_goods_receipt_id_fkey" FOREIGN KEY ("goods_receipt_id") REFERENCES "goods_receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "putaway_tasks" ADD CONSTRAINT "putaway_tasks_goods_receipt_id_fkey" FOREIGN KEY ("goods_receipt_id") REFERENCES "goods_receipts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "putaway_tasks" ADD CONSTRAINT "putaway_tasks_putaway_rule_id_fkey" FOREIGN KEY ("putaway_rule_id") REFERENCES "putaway_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_holds" ADD CONSTRAINT "quality_holds_goods_receipt_id_fkey" FOREIGN KEY ("goods_receipt_id") REFERENCES "goods_receipts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_issue_lines" ADD CONSTRAINT "stock_issue_lines_stock_issue_id_fkey" FOREIGN KEY ("stock_issue_id") REFERENCES "stock_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "picking_tasks" ADD CONSTRAINT "picking_tasks_stock_issue_id_fkey" FOREIGN KEY ("stock_issue_id") REFERENCES "stock_issues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "picking_task_lines" ADD CONSTRAINT "picking_task_lines_picking_task_id_fkey" FOREIGN KEY ("picking_task_id") REFERENCES "picking_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfer_lines" ADD CONSTRAINT "stock_transfer_lines_stock_transfer_id_fkey" FOREIGN KEY ("stock_transfer_id") REFERENCES "stock_transfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_in_transit" ADD CONSTRAINT "inventory_in_transit_stock_transfer_id_fkey" FOREIGN KEY ("stock_transfer_id") REFERENCES "stock_transfers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_adjustment_lines" ADD CONSTRAINT "inventory_adjustment_lines_inventory_adjustment_id_fkey" FOREIGN KEY ("inventory_adjustment_id") REFERENCES "inventory_adjustments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_lines" ADD CONSTRAINT "reservation_lines_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "inventory_reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "physical_inventory_lines" ADD CONSTRAINT "physical_inventory_lines_physical_inventory_id_fkey" FOREIGN KEY ("physical_inventory_id") REFERENCES "physical_inventories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycle_count_schedules" ADD CONSTRAINT "cycle_count_schedules_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "cycle_count_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "count_variances" ADD CONSTRAINT "count_variances_physical_inventory_id_fkey" FOREIGN KEY ("physical_inventory_id") REFERENCES "physical_inventories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_history" ADD CONSTRAINT "batch_history_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expiry_alerts" ADD CONSTRAINT "expiry_alerts_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recall_batches" ADD CONSTRAINT "recall_batches_recall_id_fkey" FOREIGN KEY ("recall_id") REFERENCES "product_recalls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recall_batches" ADD CONSTRAINT "recall_batches_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_genealogy" ADD CONSTRAINT "batch_genealogy_from_batch_id_fkey" FOREIGN KEY ("from_batch_id") REFERENCES "batch_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_genealogy" ADD CONSTRAINT "batch_genealogy_to_batch_id_fkey" FOREIGN KEY ("to_batch_id") REFERENCES "batch_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landed_cost_allocations" ADD CONSTRAINT "landed_cost_allocations_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "landed_cost_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_zones" ADD CONSTRAINT "warehouse_zones_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temperature_zones" ADD CONSTRAINT "temperature_zones_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temperature_logs" ADD CONSTRAINT "temperature_logs_temperature_zone_id_fkey" FOREIGN KEY ("temperature_zone_id") REFERENCES "temperature_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_capacity" ADD CONSTRAINT "warehouse_capacity_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_calendar" ADD CONSTRAINT "warehouse_calendar_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_access_rules" ADD CONSTRAINT "warehouse_access_rules_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_rules" ADD CONSTRAINT "warehouse_rules_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouse_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advanced_shipping_notices" ADD CONSTRAINT "advanced_shipping_notices_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "receiving_appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asn_lines" ADD CONSTRAINT "asn_lines_asn_id_fkey" FOREIGN KEY ("asn_id") REFERENCES "advanced_shipping_notices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receiving_exceptions" ADD CONSTRAINT "receiving_exceptions_asn_id_fkey" FOREIGN KEY ("asn_id") REFERENCES "advanced_shipping_notices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_putaway_task_lines" ADD CONSTRAINT "wms_putaway_task_lines_putaway_task_id_fkey" FOREIGN KEY ("putaway_task_id") REFERENCES "wms_putaway_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wms_picking_task_lines" ADD CONSTRAINT "wms_picking_task_lines_picking_task_id_fkey" FOREIGN KEY ("picking_task_id") REFERENCES "wms_picking_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packing_jobs" ADD CONSTRAINT "packing_jobs_picking_task_id_fkey" FOREIGN KEY ("picking_task_id") REFERENCES "wms_picking_tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch_order_lines" ADD CONSTRAINT "dispatch_order_lines_dispatch_order_id_fkey" FOREIGN KEY ("dispatch_order_id") REFERENCES "dispatch_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "load_plans" ADD CONSTRAINT "load_plans_dispatch_order_id_fkey" FOREIGN KEY ("dispatch_order_id") REFERENCES "dispatch_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_documents" ADD CONSTRAINT "shipping_documents_dispatch_order_id_fkey" FOREIGN KEY ("dispatch_order_id") REFERENCES "dispatch_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_seals" ADD CONSTRAINT "vehicle_seals_dispatch_order_id_fkey" FOREIGN KEY ("dispatch_order_id") REFERENCES "dispatch_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_exit_logs" ADD CONSTRAINT "gate_exit_logs_dispatch_order_id_fkey" FOREIGN KEY ("dispatch_order_id") REFERENCES "dispatch_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wave_orders" ADD CONSTRAINT "wave_orders_wave_id_fkey" FOREIGN KEY ("wave_id") REFERENCES "warehouse_waves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wave_status_history" ADD CONSTRAINT "wave_status_history_wave_id_fkey" FOREIGN KEY ("wave_id") REFERENCES "warehouse_waves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_tasks" ADD CONSTRAINT "warehouse_tasks_wave_id_fkey" FOREIGN KEY ("wave_id") REFERENCES "warehouse_waves"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_task_lines" ADD CONSTRAINT "warehouse_task_lines_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "warehouse_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_status_history" ADD CONSTRAINT "task_status_history_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "warehouse_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_operators" ADD CONSTRAINT "warehouse_operators_primary_shift_id_fkey" FOREIGN KEY ("primary_shift_id") REFERENCES "warehouse_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_attendance" ADD CONSTRAINT "operator_attendance_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "warehouse_operators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_attendance" ADD CONSTRAINT "operator_attendance_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "warehouse_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_skills" ADD CONSTRAINT "operator_skills_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "warehouse_operators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_workload" ADD CONSTRAINT "operator_workload_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "warehouse_operators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_assignments" ADD CONSTRAINT "equipment_assignments_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "warehouse_equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_dock_tasks" ADD CONSTRAINT "cross_dock_tasks_cross_dock_order_id_fkey" FOREIGN KEY ("cross_dock_order_id") REFERENCES "cross_dock_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yard_vehicles" ADD CONSTRAINT "yard_vehicles_yard_location_id_fkey" FOREIGN KEY ("yard_location_id") REFERENCES "yard_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dock_schedule" ADD CONSTRAINT "dock_schedule_dock_door_id_fkey" FOREIGN KEY ("dock_door_id") REFERENCES "dock_doors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trailer_movements" ADD CONSTRAINT "trailer_movements_trailer_id_fkey" FOREIGN KEY ("trailer_id") REFERENCES "trailers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yard_gate_exits" ADD CONSTRAINT "yard_gate_exits_gate_entry_id_fkey" FOREIGN KEY ("gate_entry_id") REFERENCES "yard_gate_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_master" ADD CONSTRAINT "equipment_master_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "equipment_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forklift_assignments" ADD CONSTRAINT "forklift_assignments_forklift_id_fkey" FOREIGN KEY ("forklift_id") REFERENCES "forklifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_plans" ADD CONSTRAINT "maintenance_plans_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_schedule" ADD CONSTRAINT "maintenance_schedule_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "maintenance_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_tasks" ADD CONSTRAINT "maintenance_tasks_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "maintenance_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_breakdowns" ADD CONSTRAINT "equipment_breakdowns_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_costs" ADD CONSTRAINT "warehouse_costs_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "warehouse_cost_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_departments" ADD CONSTRAINT "production_departments_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "manufacturing_plants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_lines" ADD CONSTRAINT "production_lines_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "manufacturing_plants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_lines" ADD CONSTRAINT "production_lines_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "production_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_centers" ADD CONSTRAINT "work_centers_line_id_fkey" FOREIGN KEY ("line_id") REFERENCES "production_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_calendar" ADD CONSTRAINT "production_calendar_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "manufacturing_plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_shifts" ADD CONSTRAINT "production_shifts_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "manufacturing_plants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_holidays" ADD CONSTRAINT "plant_holidays_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "manufacturing_plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_resources" ADD CONSTRAINT "production_resources_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "manufacturing_plants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plant_configurations" ADD CONSTRAINT "plant_configurations_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "manufacturing_plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_versions" ADD CONSTRAINT "recipe_versions_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formulas" ADD CONSTRAINT "formulas_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formula_lines" ADD CONSTRAINT "formula_lines_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "formulas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_of_materials" ADD CONSTRAINT "bill_of_materials_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bom_lines" ADD CONSTRAINT "bom_lines_bom_id_fkey" FOREIGN KEY ("bom_id") REFERENCES "bill_of_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mps_lines" ADD CONSTRAINT "mps_lines_mps_id_fkey" FOREIGN KEY ("mps_id") REFERENCES "master_production_schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mrp_results" ADD CONSTRAINT "mrp_results_mrp_run_id_fkey" FOREIGN KEY ("mrp_run_id") REFERENCES "mrp_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_shortages" ADD CONSTRAINT "material_shortages_mrp_run_id_fkey" FOREIGN KEY ("mrp_run_id") REFERENCES "mrp_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_production_order_id_fkey" FOREIGN KEY ("production_order_id") REFERENCES "production_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routing_steps" ADD CONSTRAINT "routing_steps_routing_id_fkey" FOREIGN KEY ("routing_id") REFERENCES "production_routings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_slots" ADD CONSTRAINT "schedule_slots_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "shop_floor_schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_logs" ADD CONSTRAINT "execution_logs_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "work_order_execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_events" ADD CONSTRAINT "machine_events_machine_execution_id_fkey" FOREIGN KEY ("machine_execution_id") REFERENCES "machine_execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wip_movements" ADD CONSTRAINT "wip_movements_wip_id_fkey" FOREIGN KEY ("wip_id") REFERENCES "work_in_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_batch_history" ADD CONSTRAINT "production_batch_history_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "production_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_relationships" ADD CONSTRAINT "batch_relationships_parent_batch_id_fkey" FOREIGN KEY ("parent_batch_id") REFERENCES "production_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_relationships" ADD CONSTRAINT "batch_relationships_child_batch_id_fkey" FOREIGN KEY ("child_batch_id") REFERENCES "production_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_shelf_life" ADD CONSTRAINT "batch_shelf_life_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "production_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_split_merges" ADD CONSTRAINT "batch_split_merges_target_batch_id_fkey" FOREIGN KEY ("target_batch_id") REFERENCES "production_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recall_actions" ADD CONSTRAINT "recall_actions_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "production_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traceability_searches" ADD CONSTRAINT "traceability_searches_primary_batch_id_fkey" FOREIGN KEY ("primary_batch_id") REFERENCES "production_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_device_sessions" ADD CONSTRAINT "production_device_sessions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "production_mobile_devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_label_print_jobs" ADD CONSTRAINT "production_label_print_jobs_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "production_labels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging_order_lines" ADD CONSTRAINT "packaging_order_lines_packaging_order_id_fkey" FOREIGN KEY ("packaging_order_id") REFERENCES "packaging_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_units" ADD CONSTRAINT "package_units_packaging_order_id_fkey" FOREIGN KEY ("packaging_order_id") REFERENCES "packaging_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging_cartons" ADD CONSTRAINT "packaging_cartons_packaging_order_id_fkey" FOREIGN KEY ("packaging_order_id") REFERENCES "packaging_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging_pallets" ADD CONSTRAINT "packaging_pallets_packaging_order_id_fkey" FOREIGN KEY ("packaging_order_id") REFERENCES "packaging_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging_label_jobs" ADD CONSTRAINT "packaging_label_jobs_packaging_order_id_fkey" FOREIGN KEY ("packaging_order_id") REFERENCES "packaging_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging_quality_checks" ADD CONSTRAINT "packaging_quality_checks_packaging_order_id_fkey" FOREIGN KEY ("packaging_order_id") REFERENCES "packaging_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging_cost_summaries" ADD CONSTRAINT "packaging_cost_summaries_packaging_order_id_fkey" FOREIGN KEY ("packaging_order_id") REFERENCES "packaging_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_elements" ADD CONSTRAINT "cost_elements_production_cost_id_fkey" FOREIGN KEY ("production_cost_id") REFERENCES "production_costs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_transactions" ADD CONSTRAINT "cost_transactions_production_cost_id_fkey" FOREIGN KEY ("production_cost_id") REFERENCES "production_costs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_variances" ADD CONSTRAINT "batch_variances_batch_cost_id_fkey" FOREIGN KEY ("batch_cost_id") REFERENCES "batch_costs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturing_journal_lines" ADD CONSTRAINT "manufacturing_journal_lines_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "manufacturing_journals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iot_connections" ADD CONSTRAINT "iot_connections_gateway_id_fkey" FOREIGN KEY ("gateway_id") REFERENCES "iot_gateways"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_heartbeats" ADD CONSTRAINT "device_heartbeats_gateway_id_fkey" FOREIGN KEY ("gateway_id") REFERENCES "iot_gateways"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_runtime_events" ADD CONSTRAINT "machine_runtime_events_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "industrial_machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "machine_counters" ADD CONSTRAINT "machine_counters_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "industrial_machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_history" ADD CONSTRAINT "counter_history_counter_id_fkey" FOREIGN KEY ("counter_id") REFERENCES "machine_counters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "industrial_machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_alerts" ADD CONSTRAINT "sensor_alerts_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "industrial_machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_triggers" ADD CONSTRAINT "maintenance_triggers_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "industrial_machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_records" ADD CONSTRAINT "waste_records_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "waste_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rework_history" ADD CONSTRAINT "rework_history_rework_order_id_fkey" FOREIGN KEY ("rework_order_id") REFERENCES "rework_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_operations" ADD CONSTRAINT "schedule_operations_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "production_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_versions" ADD CONSTRAINT "schedule_versions_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "production_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_standard_versions" ADD CONSTRAINT "quality_standard_versions_standard_id_fkey" FOREIGN KEY ("standard_id") REFERENCES "quality_standards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_templates" ADD CONSTRAINT "inspection_templates_inspection_type_id_fkey" FOREIGN KEY ("inspection_type_id") REFERENCES "inspection_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_parameters" ADD CONSTRAINT "inspection_parameters_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "inspection_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_equipment" ADD CONSTRAINT "test_equipment_test_method_id_fkey" FOREIGN KEY ("test_method_id") REFERENCES "test_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_certifications" ADD CONSTRAINT "supplier_certifications_supplier_qualification_id_fkey" FOREIGN KEY ("supplier_qualification_id") REFERENCES "supplier_qualifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_audits" ADD CONSTRAINT "supplier_audits_supplier_qualification_id_fkey" FOREIGN KEY ("supplier_qualification_id") REFERENCES "supplier_qualifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_samples" ADD CONSTRAINT "inspection_samples_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "incoming_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_results" ADD CONSTRAINT "inspection_results_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "incoming_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_results" ADD CONSTRAINT "inspection_results_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "inspection_samples"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_corrective_actions" ADD CONSTRAINT "supplier_corrective_actions_ncr_id_fkey" FOREIGN KEY ("ncr_id") REFERENCES "supplier_ncrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ipqc_results" ADD CONSTRAINT "ipqc_results_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "ipqc_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ccp_records" ADD CONSTRAINT "ccp_records_ccp_id_fkey" FOREIGN KEY ("ccp_id") REFERENCES "ccp_points"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fgqc_results" ADD CONSTRAINT "fgqc_results_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "fgqc_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stability_results" ADD CONSTRAINT "stability_results_validation_id_fkey" FOREIGN KEY ("validation_id") REFERENCES "shelf_life_validations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_approvals" ADD CONSTRAINT "release_approvals_batch_release_id_fkey" FOREIGN KEY ("batch_release_id") REFERENCES "batch_releases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_tests" ADD CONSTRAINT "lab_tests_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "lab_samples"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hazard_assessments" ADD CONSTRAINT "hazard_assessments_haccp_plan_id_fkey" FOREIGN KEY ("haccp_plan_id") REFERENCES "haccp_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "critical_control_points_v2" ADD CONSTRAINT "critical_control_points_v2_haccp_plan_id_fkey" FOREIGN KEY ("haccp_plan_id") REFERENCES "haccp_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oprp_controls" ADD CONSTRAINT "oprp_controls_haccp_plan_id_fkey" FOREIGN KEY ("haccp_plan_id") REFERENCES "haccp_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "process_deviations" ADD CONSTRAINT "process_deviations_ncr_id_fkey" FOREIGN KEY ("ncr_id") REFERENCES "non_conformance_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "root_cause_investigations" ADD CONSTRAINT "root_cause_investigations_ncr_id_fkey" FOREIGN KEY ("ncr_id") REFERENCES "non_conformance_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_risk_assessments" ADD CONSTRAINT "quality_risk_assessments_ncr_id_fkey" FOREIGN KEY ("ncr_id") REFERENCES "non_conformance_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;


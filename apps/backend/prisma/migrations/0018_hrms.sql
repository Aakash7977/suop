-- ════════════════════════════════════════════════════════════════════════════
-- SUOP ERP — Phases 45-50: Enterprise HRMS & Payroll Domain
-- Migration 0018: HRMS (6 phases, ~45 tables)
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 45: EMPLOYEE MASTER (12 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "employees" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_code" TEXT NOT NULL, "employee_name" TEXT NOT NULL,
    "first_name" TEXT, "last_name" TEXT, "middle_name" TEXT,
    "date_of_birth" DATE, "gender" TEXT, "marital_status" TEXT,
    "blood_group" TEXT, "nationality" TEXT DEFAULT 'Indian',
    "personal_email" TEXT, "work_email" TEXT, "mobile_number" TEXT,
    "alternate_phone" TEXT, "emergency_contact_name" TEXT, "emergency_contact_phone" TEXT,
    "current_address" TEXT, "permanent_address" TEXT,
    "photo_url" TEXT,
    "department_id" UUID, "department_name" TEXT,
    "designation_id" UUID, "designation_name" TEXT,
    "reporting_manager_id" UUID, "reporting_manager_name" TEXT,
    "company_id" UUID, "company_name" TEXT,
    "plant_id" UUID, "plant_name" TEXT,
    "warehouse_id" UUID, "warehouse_name" TEXT,
    "employment_type" TEXT NOT NULL DEFAULT 'PERMANENT',
    "date_of_joining" DATE NOT NULL, "date_of_exit" DATE,
    "confirmation_date" DATE, "retirement_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "exit_type" TEXT, "exit_reason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "employees_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_emp_tenant_code" UNIQUE ("tenant_id", "employee_code")
);

CREATE TABLE IF NOT EXISTS "departments" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "dept_code" TEXT NOT NULL, "dept_name" TEXT NOT NULL,
    "parent_dept_id" UUID, "company_id" UUID, "company_name" TEXT,
    "plant_id" UUID, "plant_name" TEXT,
    "hod_id" UUID, "hod_name" TEXT,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "departments_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_dept_tenant_code" UNIQUE ("tenant_id", "dept_code")
);

CREATE TABLE IF NOT EXISTS "designations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "designation_code" TEXT NOT NULL, "designation_name" TEXT NOT NULL,
    "designation_level" INTEGER DEFAULT 1, "grade" TEXT,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "designations_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_desig_tenant_code" UNIQUE ("tenant_id", "designation_code")
);

CREATE TABLE IF NOT EXISTS "employee_documents" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "document_type" TEXT NOT NULL, "document_name" TEXT NOT NULL,
    "document_number" TEXT, "issue_date" DATE, "expiry_date" DATE,
    "file_url" TEXT, "file_size" BIGINT, "mime_type" TEXT,
    "is_verified" BOOLEAN DEFAULT false, "verified_by" UUID, "verified_at" TIMESTAMP(3),
    "uploaded_by" UUID, "uploaded_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "employee_employment_history" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "event_type" TEXT NOT NULL, "event_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "from_designation" TEXT, "to_designation" TEXT,
    "from_department" TEXT, "to_department" TEXT,
    "from_location" TEXT, "to_location" TEXT,
    "from_salary" DECIMAL(18,2), "to_salary" DECIMAL(18,2),
    "reason" TEXT, "approved_by" UUID, "approved_by_name" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_employment_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "employee_skills" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "skill_name" TEXT NOT NULL, "skill_level" TEXT DEFAULT 'INTERMEDIATE',
    "proficiency_rating" INTEGER DEFAULT 3,
    "certified" BOOLEAN DEFAULT false, "certification_name" TEXT,
    "certification_date" DATE, "expiry_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_skills_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "employee_qualifications" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "qualification_type" TEXT NOT NULL, "degree" TEXT, "specialization" TEXT,
    "institute" TEXT, "university" TEXT, "year_of_passing" INTEGER,
    "percentage" DECIMAL(5,2), "grade" TEXT,
    "is_verified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_qualifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "employee_experience" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "company_name" TEXT NOT NULL, "designation" TEXT,
    "from_date" DATE, "to_date" DATE, "duration_months" INTEGER,
    "last_drawn_salary" DECIMAL(18,2),
    "reason_for_leaving" TEXT, "description" TEXT,
    "is_verified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_experience_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "employee_emergency_contacts" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "contact_name" TEXT NOT NULL, "relationship" TEXT,
    "phone_number" TEXT NOT NULL, "alternate_phone" TEXT,
    "email" TEXT, "address" TEXT,
    "is_primary" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_emergency_contacts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "employee_identity" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "identity_type" TEXT NOT NULL, "identity_number" TEXT NOT NULL,
    "name_on_document" TEXT, "issue_date" DATE, "expiry_date" DATE,
    "issuing_authority" TEXT, "file_url" TEXT,
    "is_verified" BOOLEAN DEFAULT false, "verified_by" UUID, "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_identity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "employee_promotions" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "promotion_date" DATE NOT NULL,
    "from_designation_id" UUID, "from_designation" TEXT,
    "to_designation_id" UUID, "to_designation" TEXT,
    "from_grade" TEXT, "to_grade" TEXT,
    "from_salary" DECIMAL(18,2), "to_salary" DECIMAL(18,2),
    "increment_percent" DECIMAL(5,2),
    "promotion_reason" TEXT, "approved_by" UUID, "approved_by_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_promotions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "employee_transfers" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "transfer_date" DATE NOT NULL,
    "from_company_id" UUID, "from_company_name" TEXT,
    "to_company_id" UUID, "to_company_name" TEXT,
    "from_plant_id" UUID, "from_plant_name" TEXT,
    "to_plant_id" UUID, "to_plant_name" TEXT,
    "from_department_id" UUID, "from_department_name" TEXT,
    "to_department_id" UUID, "to_department_name" TEXT,
    "transfer_reason" TEXT, "approved_by" UUID, "approved_by_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_transfers_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 46: ATTENDANCE & SHIFT MANAGEMENT (8 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "attendance" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL, "employee_code" TEXT, "employee_name" TEXT,
    "attendance_date" DATE NOT NULL,
    "shift_id" UUID, "shift_code" TEXT,
    "check_in_time" TIMESTAMP(3), "check_out_time" TIMESTAMP(3),
    "check_in_method" TEXT, "check_out_method" TEXT,
    "check_in_location" TEXT, "check_out_location" TEXT,
    "check_in_gps_lat" DECIMAL(10,6), "check_in_gps_lng" DECIMAL(10,6),
    "check_out_gps_lat" DECIMAL(10,6), "check_out_gps_lng" DECIMAL(10,6),
    "worked_hours" DECIMAL(5,2) DEFAULT 0, "overtime_hours" DECIMAL(5,2) DEFAULT 0,
    "late_arrival_minutes" INTEGER DEFAULT 0, "early_exit_minutes" INTEGER DEFAULT 0,
    "break_duration_minutes" INTEGER DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ABSENT',
    "is_half_day" BOOLEAN DEFAULT false, "is_night_shift" BOOLEAN DEFAULT false,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_att_tenant_emp_date" UNIQUE ("tenant_id", "employee_id", "attendance_date")
);

CREATE TABLE IF NOT EXISTS "shifts" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "shift_code" TEXT NOT NULL, "shift_name" TEXT NOT NULL,
    "start_time" TIME NOT NULL, "end_time" TIME NOT NULL,
    "break_start_time" TIME, "break_end_time" TIME,
    "break_duration_minutes" INTEGER DEFAULT 30,
    "grace_late_minutes" INTEGER DEFAULT 15, "grace_early_exit_minutes" INTEGER DEFAULT 15,
    "is_night_shift" BOOLEAN DEFAULT false, "is_active" BOOLEAN DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_shift_tenant_code" UNIQUE ("tenant_id", "shift_code")
);

CREATE TABLE IF NOT EXISTS "rosters" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "roster_code" TEXT NOT NULL, "roster_name" TEXT NOT NULL,
    "roster_date" DATE NOT NULL,
    "plant_id" UUID, "plant_name" TEXT,
    "department_id" UUID, "department_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rosters_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_roster_tenant_code_date" UNIQUE ("tenant_id", "roster_code", "roster_date")
);

CREATE TABLE IF NOT EXISTS "roster_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "roster_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "employee_id" UUID NOT NULL, "employee_code" TEXT, "employee_name" TEXT,
    "shift_id" UUID, "shift_code" TEXT, "shift_name" TEXT,
    "roster_date" DATE NOT NULL,
    "is_weekly_off" BOOLEAN DEFAULT false, "is_holiday" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "roster_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "holidays" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "holiday_date" DATE NOT NULL, "holiday_name" TEXT NOT NULL,
    "holiday_type" TEXT DEFAULT 'NATIONAL',
    "is_restricted" BOOLEAN DEFAULT false,
    "plant_id" UUID, "plant_name" TEXT,
    "state" TEXT, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_hol_tenant_date" UNIQUE ("tenant_id", "holiday_date")
);

CREATE TABLE IF NOT EXISTS "weekly_offs" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "plant_id" UUID, "plant_name" TEXT,
    "department_id" UUID, "department_name" TEXT,
    "shift_id" UUID, "shift_code" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "weekly_offs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "overtime_requests" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "ot_number" TEXT NOT NULL, "ot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "ot_date_from" DATE, "ot_date_to" DATE,
    "ot_hours" DECIMAL(5,2) NOT NULL, "ot_rate" DECIMAL(10,2) DEFAULT 1.5,
    "ot_reason" TEXT NOT NULL,
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "overtime_requests_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_ot_tenant_number" UNIQUE ("tenant_id", "ot_number")
);

CREATE TABLE IF NOT EXISTS "timesheets" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "timesheet_date" DATE NOT NULL,
    "production_order_id" UUID, "production_order_number" TEXT,
    "work_center_id" UUID, "work_center_code" TEXT,
    "activity_type" TEXT, "activity_description" TEXT,
    "start_time" TIMESTAMP(3), "end_time" TIMESTAMP(3),
    "duration_hours" DECIMAL(5,2) NOT NULL,
    "is_billable" BOOLEAN DEFAULT true,
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "timesheets_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 47: LEAVE MANAGEMENT (6 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "leave_types" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "leave_code" TEXT NOT NULL, "leave_name" TEXT NOT NULL,
    "leave_category" TEXT NOT NULL DEFAULT 'PAID',
    "is_encashable" BOOLEAN DEFAULT false,
    "is_carry_forward" BOOLEAN DEFAULT false,
    "max_per_year" DECIMAL(5,1) DEFAULT 0,
    "max_carry_forward" DECIMAL(5,1) DEFAULT 0,
    "sandwich_rule_applicable" BOOLEAN DEFAULT false,
    "requires_document" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "leave_types_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_lt_tenant_code" UNIQUE ("tenant_id", "leave_code")
);

CREATE TABLE IF NOT EXISTS "leave_balances" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "leave_type_id" UUID NOT NULL, "leave_code" TEXT, "leave_name" TEXT,
    "fiscal_year" TEXT NOT NULL,
    "opening_balance" DECIMAL(5,1) DEFAULT 0,
    "accrued" DECIMAL(5,1) DEFAULT 0, "used" DECIMAL(5,1) DEFAULT 0,
    "available" DECIMAL(5,1) NOT NULL DEFAULT 0,
    "carry_forward" DECIMAL(5,1) DEFAULT 0, "encashed" DECIMAL(5,1) DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_lb_tenant_emp_type_year" UNIQUE ("tenant_id", "employee_id", "leave_type_id", "fiscal_year")
);

CREATE TABLE IF NOT EXISTS "leave_applications" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "leave_number" TEXT NOT NULL, "application_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employee_id" UUID NOT NULL, "employee_code" TEXT, "employee_name" TEXT,
    "leave_type_id" UUID, "leave_code" TEXT, "leave_name" TEXT,
    "from_date" DATE NOT NULL, "to_date" DATE NOT NULL,
    "from_session" TEXT DEFAULT 'FULL', "to_session" TEXT DEFAULT 'FULL',
    "total_days" DECIMAL(5,1) NOT NULL,
    "reason" TEXT NOT NULL, "address_during_leave" TEXT,
    "contact_number" TEXT,
    "document_url" TEXT,
    "reporting_manager_id" UUID, "reporting_manager_name" TEXT,
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "leave_applications_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_la_tenant_number" UNIQUE ("tenant_id", "leave_number")
);

CREATE TABLE IF NOT EXISTS "leave_encashments" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "encashment_number" TEXT NOT NULL, "encashment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "leave_type_id" UUID, "leave_code" TEXT,
    "encashed_days" DECIMAL(5,1) NOT NULL,
    "rate_per_day" DECIMAL(18,2) NOT NULL,
    "encashment_amount" DECIMAL(18,2) NOT NULL,
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "leave_encashments_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_le_tenant_number" UNIQUE ("tenant_id", "encashment_number")
);

CREATE TABLE IF NOT EXISTS "comp_offs" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "comp_off_number" TEXT NOT NULL, "earned_date" DATE NOT NULL,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "reason" TEXT NOT NULL, "earned_days" DECIMAL(5,1) DEFAULT 1,
    "expiry_date" DATE, "is_used" BOOLEAN DEFAULT false, "used_date" DATE,
    "status" TEXT NOT NULL DEFAULT 'EARNED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comp_offs_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_co_tenant_number" UNIQUE ("tenant_id", "comp_off_number")
);

CREATE TABLE IF NOT EXISTS "leave_holiday_integrations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "leave_application_id" UUID, "leave_number" TEXT,
    "holiday_id" UUID, "holiday_date" DATE, "holiday_name" TEXT,
    "weekly_off_day" TEXT,
    "sandwich_applied" BOOLEAN DEFAULT false,
    "sandwich_days_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "leave_holiday_integrations_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 48: PAYROLL & SALARY PROCESSING (10 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "salary_structures" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "structure_code" TEXT NOT NULL, "structure_name" TEXT NOT NULL,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "salary_structures_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_ss_tenant_code" UNIQUE ("tenant_id", "structure_code")
);

CREATE TABLE IF NOT EXISTS "salary_structure_components" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "structure_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "component_code" TEXT NOT NULL, "component_name" TEXT NOT NULL,
    "component_type" TEXT NOT NULL, "calculation_type" TEXT DEFAULT 'PERCENTAGE',
    "calculation_base" TEXT, "value" DECIMAL(10,2), "percentage" DECIMAL(5,2),
    "is_taxable" BOOLEAN DEFAULT true, "is_statutory" BOOLEAN DEFAULT false,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "salary_structure_components_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "employee_salary" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "structure_id" UUID, "structure_name" TEXT,
    "ctc" DECIMAL(18,2) NOT NULL, "gross_monthly" DECIMAL(18,2) NOT NULL,
    "basic" DECIMAL(18,2) NOT NULL, "hra" DECIMAL(18,2) DEFAULT 0,
    "allowances" DECIMAL(18,2) DEFAULT 0, "special_allowance" DECIMAL(18,2) DEFAULT 0,
    "pf_employee" DECIMAL(18,2) DEFAULT 0, "pf_employer" DECIMAL(18,2) DEFAULT 0,
    "esi_employee" DECIMAL(18,2) DEFAULT 0, "esi_employer" DECIMAL(18,2) DEFAULT 0,
    "professional_tax" DECIMAL(18,2) DEFAULT 0,
    "tds_monthly" DECIMAL(18,2) DEFAULT 0,
    "net_monthly" DECIMAL(18,2) NOT NULL,
    "effective_from" DATE NOT NULL, "effective_to" DATE,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_salary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "payroll_runs" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "payroll_number" TEXT NOT NULL, "payroll_month" INTEGER NOT NULL, "payroll_year" INTEGER NOT NULL,
    "payroll_period" TEXT NOT NULL,
    "company_id" UUID, "company_name" TEXT,
    "total_employees" INTEGER DEFAULT 0, "total_gross" DECIMAL(18,2) DEFAULT 0,
    "total_deductions" DECIMAL(18,2) DEFAULT 0, "total_net" DECIMAL(18,2) DEFAULT 0,
    "total_pf" DECIMAL(18,2) DEFAULT 0, "total_esi" DECIMAL(18,2) DEFAULT 0,
    "total_tds" DECIMAL(18,2) DEFAULT 0, "total_pt" DECIMAL(18,2) DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "processed_by" UUID, "processed_by_name" TEXT, "processed_at" TIMESTAMP(3),
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "locked_at" TIMESTAMP(3), "locked_by" UUID, "locked_by_name" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payroll_runs_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_pr_tenant_period" UNIQUE ("tenant_id", "payroll_period")
);

CREATE TABLE IF NOT EXISTS "payroll_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "payroll_run_id" UUID NOT NULL, "payroll_number" TEXT,
    "employee_id" UUID NOT NULL, "employee_code" TEXT, "employee_name" TEXT,
    "department_name" TEXT, "designation_name" TEXT,
    "present_days" DECIMAL(5,1) DEFAULT 0, "absent_days" DECIMAL(5,1) DEFAULT 0,
    "paid_days" DECIMAL(5,1) NOT NULL, "lop_days" DECIMAL(5,1) DEFAULT 0,
    "basic" DECIMAL(18,2) DEFAULT 0, "hra" DECIMAL(18,2) DEFAULT 0,
    "allowances" DECIMAL(18,2) DEFAULT 0, "overtime_amount" DECIMAL(18,2) DEFAULT 0,
    "bonus" DECIMAL(18,2) DEFAULT 0, "incentives" DECIMAL(18,2) DEFAULT 0,
    "arrears" DECIMAL(18,2) DEFAULT 0,
    "gross_earnings" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "pf_employee" DECIMAL(18,2) DEFAULT 0, "esi_employee" DECIMAL(18,2) DEFAULT 0,
    "professional_tax" DECIMAL(18,2) DEFAULT 0, "tds" DECIMAL(18,2) DEFAULT 0,
    "other_deductions" DECIMAL(18,2) DEFAULT 0,
    "total_deductions" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "net_pay" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "bank_account_number" TEXT, "bank_ifsc" TEXT, "bank_name" TEXT,
    "payslip_generated" BOOLEAN DEFAULT false, "payslip_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payroll_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "salary_revisions" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "revision_number" TEXT NOT NULL, "revision_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "revision_type" TEXT NOT NULL,
    "from_ctc" DECIMAL(18,2), "to_ctc" DECIMAL(18,2) NOT NULL,
    "from_basic" DECIMAL(18,2), "to_basic" DECIMAL(18,2),
    "increment_percent" DECIMAL(5,2),
    "effective_from" DATE NOT NULL,
    "reason" TEXT,
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "salary_revisions_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_srev_tenant_number" UNIQUE ("tenant_id", "revision_number")
);

CREATE TABLE IF NOT EXISTS "full_final_settlements" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "fnf_number" TEXT NOT NULL, "fnf_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "date_of_joining" DATE, "date_of_exit" DATE NOT NULL,
    "last_drawn_salary" DECIMAL(18,2), "last_working_day" DATE,
    "salary_payable" DECIMAL(18,2) DEFAULT 0,
    "leave_encashment" DECIMAL(18,2) DEFAULT 0,
    "gratuity" DECIMAL(18,2) DEFAULT 0,
    "bonus_payable" DECIMAL(18,2) DEFAULT 0,
    "notice_pay_recovery" DECIMAL(18,2) DEFAULT 0,
    "pf_withdrawal" DECIMAL(18,2) DEFAULT 0,
    "other_deductions" DECIMAL(18,2) DEFAULT 0,
    "total_payable" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_deductions" DECIMAL(18,2) DEFAULT 0,
    "net_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "full_final_settlements_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_fnf_tenant_number" UNIQUE ("tenant_id", "fnf_number")
);

CREATE TABLE IF NOT EXISTS "bank_advices" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "advice_number" TEXT NOT NULL, "advice_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payroll_run_id" UUID, "payroll_number" TEXT,
    "bank_name" TEXT, "bank_account_number" TEXT,
    "total_employees" INTEGER DEFAULT 0, "total_amount" DECIMAL(18,2) DEFAULT 0,
    "file_url" TEXT, "file_format" TEXT DEFAULT 'NEFT',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "generated_by" UUID, "generated_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bank_advices_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_ba_tenant_number" UNIQUE ("tenant_id", "advice_number")
);

CREATE TABLE IF NOT EXISTS "statutory_configs" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "config_type" TEXT NOT NULL, "config_name" TEXT NOT NULL,
    "employee_percent" DECIMAL(5,2) DEFAULT 0, "employer_percent" DECIMAL(5,2) DEFAULT 0,
    "ceiling_amount" DECIMAL(18,2), "min_amount" DECIMAL(18,2),
    "effective_from" DATE NOT NULL, "effective_to" DATE,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "statutory_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "payslips" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "payslip_number" TEXT NOT NULL, "payroll_run_id" UUID, "payroll_line_id" UUID,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "payroll_period" TEXT NOT NULL, "payroll_month" INTEGER, "payroll_year" INTEGER,
    "gross_earnings" DECIMAL(18,2) DEFAULT 0, "total_deductions" DECIMAL(18,2) DEFAULT 0,
    "net_pay" DECIMAL(18,2) DEFAULT 0,
    "payslip_url" TEXT, "payslip_html" TEXT,
    "is_emailed" BOOLEAN DEFAULT false, "emailed_at" TIMESTAMP(3),
    "is_locked" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_ps_tenant_number" UNIQUE ("tenant_id", "payslip_number")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 49: RECRUITMENT & ONBOARDING (5 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "job_requisitions" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "requisition_number" TEXT NOT NULL, "requisition_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "position_title" TEXT NOT NULL, "department_id" UUID, "department_name" TEXT,
    "designation_id" UUID, "designation_name" TEXT,
    "employment_type" TEXT DEFAULT 'PERMANENT',
    "number_of_positions" INTEGER NOT NULL DEFAULT 1,
    "job_description" TEXT, "required_skills" TEXT,
    "min_experience_years" INTEGER, "max_experience_years" INTEGER,
    "min_salary" DECIMAL(18,2), "max_salary" DECIMAL(18,2),
    "expected_joining_date" DATE,
    "priority" TEXT DEFAULT 'NORMAL',
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID,
    CONSTRAINT "job_requisitions_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_jr_tenant_number" UNIQUE ("tenant_id", "requisition_number")
);

CREATE TABLE IF NOT EXISTS "candidates" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "candidate_code" TEXT NOT NULL, "candidate_name" TEXT NOT NULL,
    "email" TEXT, "mobile" TEXT,
    "current_company" TEXT, "current_designation" TEXT,
    "total_experience_years" DECIMAL(5,1), "current_ctc" DECIMAL(18,2), "expected_ctc" DECIMAL(18,2),
    "skills" TEXT, "qualification" TEXT,
    "resume_url" TEXT,
    "source" TEXT, "requisition_id" UUID, "requisition_number" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "converted_employee_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_cand_tenant_code" UNIQUE ("tenant_id", "candidate_code")
);

CREATE TABLE IF NOT EXISTS "interviews" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "interview_number" TEXT NOT NULL, "interview_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidate_id" UUID NOT NULL, "candidate_name" TEXT,
    "requisition_id" UUID, "requisition_number" TEXT,
    "interview_round" TEXT NOT NULL, "interview_type" TEXT DEFAULT 'TECHNICAL',
    "scheduled_date" TIMESTAMP(3), "scheduled_end" TIMESTAMP(3),
    "interviewer_id" UUID, "interviewer_name" TEXT,
    "location" TEXT, "meeting_url" TEXT,
    "rating" INTEGER, "feedback" TEXT,
    "recommendation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_int_tenant_number" UNIQUE ("tenant_id", "interview_number")
);

CREATE TABLE IF NOT EXISTS "offer_letters" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "offer_number" TEXT NOT NULL, "offer_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidate_id" UUID NOT NULL, "candidate_name" TEXT,
    "requisition_id" UUID, "requisition_number" TEXT,
    "designation" TEXT, "department" TEXT,
    "offered_ctc" DECIMAL(18,2) NOT NULL, "offered_basic" DECIMAL(18,2),
    "joining_date" DATE NOT NULL,
    "employment_type" TEXT DEFAULT 'PERMANENT',
    "offer_terms" TEXT,
    "offer_url" TEXT,
    "candidate_accepted" BOOLEAN DEFAULT false, "accepted_at" TIMESTAMP(3),
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "offer_letters_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_ol_tenant_number" UNIQUE ("tenant_id", "offer_number")
);

CREATE TABLE IF NOT EXISTS "onboarding_tasks" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_id" UUID, "candidate_id" UUID, "employee_name" TEXT,
    "task_name" TEXT NOT NULL, "task_type" TEXT,
    "description" TEXT, "assigned_to" UUID, "assigned_to_name" TEXT,
    "due_date" DATE, "completed_date" DATE,
    "is_mandatory" BOOLEAN DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "onboarding_tasks_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 50: PERFORMANCE MANAGEMENT (5 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "performance_cycles" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "cycle_code" TEXT NOT NULL, "cycle_name" TEXT NOT NULL,
    "cycle_type" TEXT DEFAULT 'ANNUAL',
    "start_date" DATE NOT NULL, "end_date" DATE NOT NULL,
    "self_assessment_start" DATE, "self_assessment_end" DATE,
    "manager_review_start" DATE, "manager_review_end" DATE,
    "calibration_start" DATE, "calibration_end" DATE,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "performance_cycles_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_pc_tenant_code" UNIQUE ("tenant_id", "cycle_code")
);

CREATE TABLE IF NOT EXISTS "employee_goals" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL, "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "goal_title" TEXT NOT NULL, "goal_description" TEXT,
    "goal_type" TEXT DEFAULT 'PERFORMANCE', "kra" TEXT,
    "weight" DECIMAL(5,2) DEFAULT 100, "target_value" TEXT,
    "actual_value" TEXT, "achievement_percent" DECIMAL(5,2) DEFAULT 0,
    "self_rating" INTEGER, "manager_rating" INTEGER, "final_rating" INTEGER,
    "self_comments" TEXT, "manager_comments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_goals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "appraisals" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL, "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "reporting_manager_id" UUID, "reporting_manager_name" TEXT,
    "department_name" TEXT, "designation_name" TEXT,
    "overall_rating" INTEGER, "overall_grade" TEXT,
    "strengths" TEXT, "areas_for_improvement" TEXT,
    "promotion_recommended" BOOLEAN DEFAULT false, "promotion_details" TEXT,
    "increment_recommended" BOOLEAN DEFAULT false, "increment_percent" DECIMAL(5,2),
    "training_recommended" TEXT,
    "manager_comments" TEXT, "employee_comments" TEXT,
    "hr_comments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "appraisals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "feedback_360" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "cycle_id" UUID, "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "reviewer_id" UUID NOT NULL, "reviewer_name" TEXT,
    "reviewer_relationship" TEXT NOT NULL,
    "communication_rating" INTEGER, "technical_rating" INTEGER,
    "leadership_rating" INTEGER, "teamwork_rating" INTEGER,
    "initiative_rating" INTEGER, "overall_rating" INTEGER,
    "strengths" TEXT, "improvements" TEXT, "comments" TEXT,
    "is_anonymous" BOOLEAN DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feedback_360_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "training_recommendations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL, "employee_name" TEXT,
    "cycle_id" UUID, "appraisal_id" UUID,
    "training_name" TEXT NOT NULL, "training_type" TEXT,
    "training_category" TEXT, "priority" TEXT DEFAULT 'MEDIUM',
    "recommended_by" UUID, "recommended_by_name" TEXT,
    "expected_duration_hours" INTEGER, "expected_cost" DECIMAL(18,2),
    "status" TEXT NOT NULL DEFAULT 'RECOMMENDED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "training_recommendations_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS "idx_emp_tenant_status" ON "employees"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_emp_tenant_dept" ON "employees"("tenant_id", "department_id");
CREATE INDEX IF NOT EXISTS "idx_emp_tenant_plant" ON "employees"("tenant_id", "plant_id");
CREATE INDEX IF NOT EXISTS "idx_ed_emp" ON "employee_documents"("employee_id");
CREATE INDEX IF NOT EXISTS "idx_eh_emp" ON "employee_employment_history"("employee_id");
CREATE INDEX IF NOT EXISTS "idx_es_emp" ON "employee_skills"("employee_id");
CREATE INDEX IF NOT EXISTS "idx_eq_emp" ON "employee_qualifications"("employee_id");
CREATE INDEX IF NOT EXISTS "idx_att_tenant_emp_date" ON "attendance"("tenant_id", "employee_id", "attendance_date");
CREATE INDEX IF NOT EXISTS "idx_shift_tenant_active" ON "shifts"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_hol_tenant_date" ON "holidays"("tenant_id", "holiday_date");
CREATE INDEX IF NOT EXISTS "idx_ot_tenant_emp" ON "overtime_requests"("tenant_id", "employee_id");
CREATE INDEX IF NOT EXISTS "idx_ts_tenant_emp" ON "timesheets"("tenant_id", "employee_id");
CREATE INDEX IF NOT EXISTS "idx_lt_tenant_active" ON "leave_types"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_lb_tenant_emp" ON "leave_balances"("tenant_id", "employee_id");
CREATE INDEX IF NOT EXISTS "idx_la_tenant_status" ON "leave_applications"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_la_tenant_emp" ON "leave_applications"("tenant_id", "employee_id");
CREATE INDEX IF NOT EXISTS "idx_ss_tenant_active" ON "salary_structures"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_esal_tenant_emp" ON "employee_salary"("tenant_id", "employee_id");
CREATE INDEX IF NOT EXISTS "idx_pr_tenant_status" ON "payroll_runs"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_pl_payroll" ON "payroll_lines"("payroll_run_id");
CREATE INDEX IF NOT EXISTS "idx_pl_tenant_emp" ON "payroll_lines"("tenant_id", "employee_id");
CREATE INDEX IF NOT EXISTS "idx_srev_tenant_emp" ON "salary_revisions"("tenant_id", "employee_id");
CREATE INDEX IF NOT EXISTS "idx_fnf_tenant_emp" ON "full_final_settlements"("tenant_id", "employee_id");
CREATE INDEX IF NOT EXISTS "idx_ps_tenant_emp" ON "payslips"("tenant_id", "employee_id");
CREATE INDEX IF NOT EXISTS "idx_jr_tenant_status" ON "job_requisitions"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_cand_tenant_status" ON "candidates"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_int_tenant_status" ON "interviews"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_ol_tenant_status" ON "offer_letters"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_pc_tenant_status" ON "performance_cycles"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_eg_tenant_emp" ON "employee_goals"("tenant_id", "employee_id");
CREATE INDEX IF NOT EXISTS "idx_appr_tenant_emp" ON "appraisals"("tenant_id", "employee_id");
CREATE INDEX IF NOT EXISTS "idx_f360_tenant_emp" ON "feedback_360"("tenant_id", "employee_id");
CREATE INDEX IF NOT EXISTS "idx_tr_tenant_emp" ON "training_recommendations"("tenant_id", "employee_id");

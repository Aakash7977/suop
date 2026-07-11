-- ════════════════════════════════════════════════════════════════════════════
-- SUOP ERP — Phases 15-20: Manufacturing Execution System (MES) Domain
-- Migration 0013: MES (6 phases, ~40 tables)
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 15: MES FOUNDATION (8 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "work_centers" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "wc_code" TEXT NOT NULL, "wc_name" TEXT NOT NULL,
    "wc_type" TEXT DEFAULT 'PRODUCTION', "plant_id" UUID, "plant_name" TEXT,
    "department_id" UUID, "capacity_per_hour" DECIMAL(14,3) DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "work_centers_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_wc_tenant_code" UNIQUE ("tenant_id", "wc_code")
);

CREATE TABLE IF NOT EXISTS "production_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "line_code" TEXT NOT NULL, "line_name" TEXT NOT NULL,
    "work_center_id" UUID, "plant_id" UUID, "plant_name" TEXT,
    "capacity_per_shift" DECIMAL(14,3) DEFAULT 0, "is_active" BOOLEAN DEFAULT true,
    "description" TEXT, "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "production_lines_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_pl_tenant_code" UNIQUE ("tenant_id", "line_code")
);

CREATE TABLE IF NOT EXISTS "machines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "machine_code" TEXT NOT NULL, "machine_name" TEXT NOT NULL,
    "work_center_id" UUID, "production_line_id" UUID,
    "machine_type" TEXT, "manufacturer" TEXT, "model" TEXT, "serial_number" TEXT,
    "max_capacity" DECIMAL(14,3) DEFAULT 0, "current_status" TEXT DEFAULT 'IDLE',
    "is_active" BOOLEAN DEFAULT true, "installed_date" DATE,
    "description" TEXT, "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "machines_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_m_tenant_code" UNIQUE ("tenant_id", "machine_code")
);

CREATE TABLE IF NOT EXISTS "shifts" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "shift_code" TEXT NOT NULL, "shift_name" TEXT NOT NULL,
    "start_time" TIME NOT NULL, "end_time" TIME NOT NULL,
    "break_minutes" INTEGER DEFAULT 30, "is_active" BOOLEAN DEFAULT true,
    "description" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_shift_tenant_code" UNIQUE ("tenant_id", "shift_code")
);

CREATE TABLE IF NOT EXISTS "shift_calendars" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "calendar_date" DATE NOT NULL, "shift_id" UUID NOT NULL,
    "work_center_id" UUID, "production_line_id" UUID,
    "is_working_day" BOOLEAN DEFAULT true, "holiday_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shift_calendars_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_sc_tenant_date_shift_wc" UNIQUE ("tenant_id", "calendar_date", "shift_id", "work_center_id")
);

CREATE TABLE IF NOT EXISTS "machine_status_logs" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "machine_id" UUID NOT NULL, "machine_code" TEXT NOT NULL,
    "previous_status" TEXT, "new_status" TEXT NOT NULL,
    "status_change_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_minutes" INTEGER, "reason" TEXT, "operator_id" UUID, "operator_name" TEXT,
    "downtime_category" TEXT, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "machine_status_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "downtime_records" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "downtime_number" TEXT NOT NULL, "machine_id" UUID NOT NULL, "machine_code" TEXT,
    "production_order_id" UUID, "production_order_number" TEXT,
    "downtime_start" TIMESTAMP(3) NOT NULL, "downtime_end" TIMESTAMP(3),
    "duration_minutes" INTEGER, "downtime_type" TEXT NOT NULL,
    "downtime_category" TEXT, "reason" TEXT, "action_taken" TEXT,
    "reported_by" UUID, "reported_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "downtime_records_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_dt_tenant_number" UNIQUE ("tenant_id", "downtime_number")
);

CREATE TABLE IF NOT EXISTS "production_events" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL, "event_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "production_order_id" UUID, "production_order_number" TEXT,
    "machine_id" UUID, "machine_code" TEXT, "operator_id" UUID, "operator_name" TEXT,
    "event_data" JSONB, "severity" TEXT DEFAULT 'INFO',
    "description" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "production_events_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 16: RECIPE & BOM (7 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "recipes" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "recipe_code" TEXT NOT NULL, "recipe_name" TEXT NOT NULL,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0', "is_active" BOOLEAN DEFAULT true,
    "is_default" BOOLEAN DEFAULT false, "alternate_for_id" UUID,
    "yield_percent" DECIMAL(5,2) DEFAULT 100, "expected_loss_percent" DECIMAL(5,2) DEFAULT 0,
    "batch_size" DECIMAL(14,3) DEFAULT 0, "batch_uom_id" UUID, "batch_uom_code" TEXT,
    "production_time_hours" DECIMAL(8,2), "recipe_cost" DECIMAL(14,2) DEFAULT 0,
    "status" TEXT DEFAULT 'DRAFT', "approval_notes" TEXT,
    "description" TEXT, "version_no" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_recipe_tenant_code_version" UNIQUE ("tenant_id", "recipe_code", "version")
);

CREATE TABLE IF NOT EXISTS "recipe_items" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "recipe_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "item_type" TEXT NOT NULL DEFAULT 'RAW_MATERIAL',
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "uom_id" UUID, "uom_code" TEXT,
    "quantity" DECIMAL(14,4) NOT NULL, "scrap_percent" DECIMAL(5,2) DEFAULT 0,
    "is_critical" BOOLEAN DEFAULT false, "sort_order" INTEGER DEFAULT 0,
    "remarks" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recipe_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "recipe_byproducts" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "recipe_id" UUID NOT NULL,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "quantity" DECIMAL(14,4) NOT NULL, "uom_id" UUID, "uom_code" TEXT,
    "byproduct_type" TEXT DEFAULT 'BY_PRODUCT',
    "remarks" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recipe_byproducts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "bom_headers" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "bom_code" TEXT NOT NULL, "bom_name" TEXT NOT NULL,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "bom_type" TEXT DEFAULT 'STANDARD', "is_active" BOOLEAN DEFAULT true,
    "is_default" BOOLEAN DEFAULT false, "alternate_for_id" UUID,
    "status" TEXT DEFAULT 'DRAFT', "approval_notes" TEXT,
    "description" TEXT, "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    CONSTRAINT "bom_headers_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_bom_tenant_code" UNIQUE ("tenant_id", "bom_code")
);

CREATE TABLE IF NOT EXISTS "bom_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "bom_id" UUID NOT NULL, "parent_bom_line_id" UUID,
    "line_no" INTEGER NOT NULL, "level" INTEGER DEFAULT 1,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "uom_id" UUID, "uom_code" TEXT,
    "quantity" DECIMAL(14,4) NOT NULL, "scrap_percent" DECIMAL(5,2) DEFAULT 0,
    "is_phantom" BOOLEAN DEFAULT false, "is_critical" BOOLEAN DEFAULT false,
    "lead_time_offset_days" INTEGER DEFAULT 0,
    "remarks" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bom_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "bom_routings" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "routing_code" TEXT NOT NULL, "routing_name" TEXT NOT NULL,
    "product_id" UUID, "bom_id" UUID,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "bom_routings_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_rt_tenant_code" UNIQUE ("tenant_id", "routing_code")
);

CREATE TABLE IF NOT EXISTS "routing_operations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "routing_id" UUID NOT NULL, "operation_no" INTEGER NOT NULL,
    "operation_name" TEXT NOT NULL, "operation_description" TEXT,
    "work_center_id" UUID, "work_center_code" TEXT,
    "machine_id" UUID, "machine_code" TEXT,
    "setup_time_minutes" INTEGER DEFAULT 0, "run_time_minutes" DECIMAL(8,2) DEFAULT 0,
    "queue_time_minutes" INTEGER DEFAULT 0, "move_time_minutes" INTEGER DEFAULT 0,
    "labor_required" BOOLEAN DEFAULT true, "skill_level" TEXT,
    "is_outside_operation" BOOLEAN DEFAULT false, "outside_supplier_id" UUID,
    "remarks" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "routing_operations_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 17: PRODUCTION PLANNING (5 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "production_plans" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "plan_number" TEXT NOT NULL, "plan_name" TEXT NOT NULL,
    "plan_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plan_type" TEXT DEFAULT 'MPS', "plan_horizon" TEXT DEFAULT 'MONTHLY',
    "start_date" DATE NOT NULL, "end_date" DATE NOT NULL,
    "status" TEXT DEFAULT 'DRAFT', "approval_notes" TEXT,
    "description" TEXT, "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    CONSTRAINT "production_plans_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_pp_tenant_number" UNIQUE ("tenant_id", "plan_number")
);

CREATE TABLE IF NOT EXISTS "production_plan_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "planned_qty" DECIMAL(14,3) NOT NULL, "uom_id" UUID, "uom_code" TEXT,
    "planned_start_date" DATE, "planned_end_date" DATE,
    "work_center_id" UUID, "production_line_id" UUID,
    "recipe_id" UUID, "bom_id" UUID, "routing_id" UUID,
    "priority" TEXT DEFAULT 'NORMAL',
    "material_available" BOOLEAN DEFAULT false, "capacity_available" BOOLEAN DEFAULT false,
    "is_scheduled" BOOLEAN DEFAULT false, "production_order_id" UUID,
    "remarks" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "production_plan_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "production_schedules" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "schedule_number" TEXT NOT NULL, "schedule_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plan_id" UUID, "plan_line_id" UUID,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "scheduled_qty" DECIMAL(14,3) NOT NULL, "uom_id" UUID, "uom_code" TEXT,
    "work_center_id" UUID, "work_center_code" TEXT,
    "production_line_id" UUID, "machine_id" UUID,
    "shift_id" UUID, "scheduled_start" TIMESTAMP(3), "scheduled_end" TIMESTAMP(3),
    "scheduling_type" TEXT DEFAULT 'FINITE',
    "status" TEXT DEFAULT 'SCHEDULED',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "production_schedules_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_ps_tenant_number" UNIQUE ("tenant_id", "schedule_number")
);

CREATE TABLE IF NOT EXISTS "capacity_plans" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "work_center_id" UUID NOT NULL, "work_center_code" TEXT,
    "plan_date" DATE NOT NULL, "shift_id" UUID,
    "available_capacity_minutes" INTEGER NOT NULL DEFAULT 0,
    "allocated_capacity_minutes" INTEGER DEFAULT 0,
    "remaining_capacity_minutes" INTEGER DEFAULT 0,
    "utilization_percent" DECIMAL(5,2) DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "capacity_plans_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_cp_tenant_wc_date_shift" UNIQUE ("tenant_id", "work_center_id", "plan_date", "shift_id")
);

CREATE TABLE IF NOT EXISTS "material_reservations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "reservation_number" TEXT NOT NULL, "reservation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "production_order_id" UUID, "production_order_number" TEXT,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "warehouse_id" UUID, "batch_id" UUID, "lot_id" UUID,
    "reserved_qty" DECIMAL(14,3) NOT NULL, "uom_id" UUID, "uom_code" TEXT,
    "consumption_strategy" TEXT DEFAULT 'FEFO',
    "status" TEXT DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3), "released_at" TIMESTAMP(3),
    "reserved_by" UUID, "reserved_by_name" TEXT,
    "remarks" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "material_reservations_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_mr_tenant_number" UNIQUE ("tenant_id", "reservation_number")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 18: PRODUCTION ORDERS (7 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "production_orders" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "po_number" TEXT NOT NULL, "po_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "po_type" TEXT DEFAULT 'STANDARD',
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "planned_qty" DECIMAL(14,3) NOT NULL, "uom_id" UUID, "uom_code" TEXT,
    "recipe_id" UUID, "recipe_code" TEXT, "bom_id" UUID, "bom_code" TEXT,
    "routing_id" UUID, "routing_code" TEXT,
    "work_center_id" UUID, "work_center_code" TEXT,
    "production_line_id" UUID, "machine_id" UUID,
    "plant_id" UUID, "plant_name" TEXT,
    "planned_start" TIMESTAMP(3), "planned_end" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3), "actual_end" TIMESTAMP(3),
    "produced_qty" DECIMAL(14,3) DEFAULT 0, "rejected_qty" DECIMAL(14,3) DEFAULT 0,
    "scrap_qty" DECIMAL(14,3) DEFAULT 0, "rework_qty" DECIMAL(14,3) DEFAULT 0,
    "yield_percent" DECIMAL(5,2) DEFAULT 0, "wastage_percent" DECIMAL(5,2) DEFAULT 0,
    "planned_cost" DECIMAL(14,2) DEFAULT 0, "actual_cost" DECIMAL(14,2) DEFAULT 0,
    "cost_variance" DECIMAL(14,2) DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "priority" TEXT DEFAULT 'NORMAL',
    "rejection_reason" TEXT, "cancel_reason" TEXT,
    "remarks" TEXT, "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "production_orders_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_mpo_tenant_number" UNIQUE ("tenant_id", "po_number")
);

CREATE TABLE IF NOT EXISTS "production_order_operations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "production_order_id" UUID NOT NULL, "operation_no" INTEGER NOT NULL,
    "operation_name" TEXT NOT NULL, "operation_description" TEXT,
    "routing_operation_id" UUID,
    "work_center_id" UUID, "work_center_code" TEXT,
    "machine_id" UUID, "machine_code" TEXT,
    "setup_time_minutes" INTEGER DEFAULT 0, "run_time_minutes" DECIMAL(8,2) DEFAULT 0,
    "planned_start" TIMESTAMP(3), "planned_end" TIMESTAMP(3),
    "actual_start" TIMESTAMP(3), "actual_end" TIMESTAMP(3),
    "status" TEXT DEFAULT 'PENDING',
    "operator_id" UUID, "operator_name" TEXT,
    "produced_qty" DECIMAL(14,3) DEFAULT 0, "rejected_qty" DECIMAL(14,3) DEFAULT 0,
    "remarks" TEXT, "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "production_order_operations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "material_issues" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "issue_number" TEXT NOT NULL, "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "production_order_id" UUID NOT NULL, "production_order_number" TEXT,
    "operation_id" UUID,
    "warehouse_id" UUID, "warehouse_name" TEXT,
    "issued_by" UUID, "issued_by_name" TEXT,
    "status" TEXT DEFAULT 'COMPLETED',
    "remarks" TEXT, "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "material_issues_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_mi_tenant_number" UNIQUE ("tenant_id", "issue_number")
);

CREATE TABLE IF NOT EXISTS "material_issue_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "issue_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "uom_id" UUID, "uom_code" TEXT,
    "planned_qty" DECIMAL(14,3) DEFAULT 0, "issued_qty" DECIMAL(14,3) NOT NULL,
    "variance_qty" DECIMAL(14,3) DEFAULT 0, "variance_percent" DECIMAL(5,2) DEFAULT 0,
    "batch_id" UUID, "batch_number" TEXT, "lot_id" UUID, "lot_number" TEXT,
    "consumption_strategy" TEXT DEFAULT 'FEFO',
    "unit_cost" DECIMAL(14,4) DEFAULT 0, "line_total" DECIMAL(14,2) DEFAULT 0,
    "remarks" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "material_issue_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "production_confirmations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "confirmation_number" TEXT NOT NULL, "confirmation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "production_order_id" UUID NOT NULL, "production_order_number" TEXT,
    "operation_id" UUID,
    "confirmed_qty" DECIMAL(14,3) NOT NULL, "rejected_qty" DECIMAL(14,3) DEFAULT 0,
    "scrap_qty" DECIMAL(14,3) DEFAULT 0, "rework_qty" DECIMAL(14,3) DEFAULT 0,
    "uom_id" UUID, "uom_code" TEXT,
    "operator_id" UUID, "operator_name" TEXT,
    "shift_id" UUID, "machine_id" UUID, "machine_code" TEXT,
    "confirmation_type" TEXT DEFAULT 'PARTIAL', "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "production_confirmations_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_pc_tenant_number" UNIQUE ("tenant_id", "confirmation_number")
);

CREATE TABLE IF NOT EXISTS "scrap_records" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "scrap_number" TEXT NOT NULL, "scrap_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "production_order_id" UUID, "production_order_number" TEXT,
    "operation_id" UUID, "product_id" UUID, "product_sku" TEXT,
    "scrap_qty" DECIMAL(14,3) NOT NULL, "uom_id" UUID, "uom_code" TEXT,
    "scrap_reason" TEXT NOT NULL, "scrap_type" TEXT,
    "disposition" TEXT DEFAULT 'DISPOSE',
    "recorded_by" UUID, "recorded_by_name" TEXT,
    "remarks" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scrap_records_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_sr_tenant_number" UNIQUE ("tenant_id", "scrap_number")
);

CREATE TABLE IF NOT EXISTS "rework_records" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "rework_number" TEXT NOT NULL, "rework_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "production_order_id" UUID, "production_order_number" TEXT,
    "operation_id" UUID, "product_id" UUID, "product_sku" TEXT,
    "rework_qty" DECIMAL(14,3) NOT NULL, "uom_id" UUID, "uom_code" TEXT,
    "rework_reason" TEXT NOT NULL, "rework_type" TEXT,
    "rework_operation_id" UUID, "rework_cost" DECIMAL(14,2) DEFAULT 0,
    "status" TEXT DEFAULT 'PENDING',
    "recorded_by" UUID, "recorded_by_name" TEXT,
    "remarks" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rework_records_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_rw_tenant_number" UNIQUE ("tenant_id", "rework_number")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 19: BATCH MANUFACTURING & TRACEABILITY (5 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "production_batches" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "batch_number" TEXT NOT NULL,
    "production_order_id" UUID, "production_order_number" TEXT,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "parent_batch_id" UUID, "parent_batch_number" TEXT,
    "batch_type" TEXT DEFAULT 'PRODUCTION',
    "quantity" DECIMAL(14,3) NOT NULL, "uom_id" UUID, "uom_code" TEXT,
    "manufacture_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3),
    "shelf_life_days" INTEGER,
    "status" TEXT DEFAULT 'IN_PRODUCTION',
    "is_split" BOOLEAN DEFAULT false, "is_merged" BOOLEAN DEFAULT false,
    "split_from_id" UUID, "merged_from_ids" UUID[],
    "warehouse_id" UUID, "warehouse_name" TEXT,
    "remarks" TEXT, "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "production_batches_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_pb_tenant_number" UNIQUE ("tenant_id", "batch_number")
);

CREATE TABLE IF NOT EXISTS "batch_genealogy" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "child_batch_id" UUID NOT NULL, "child_batch_number" TEXT,
    "parent_batch_id" UUID, "parent_batch_number" TEXT,
    "parent_type" TEXT NOT NULL,
    "parent_product_id" UUID, "parent_product_sku" TEXT,
    "consumed_qty" DECIMAL(14,3), "uom_code" TEXT,
    "consumption_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "material_issue_id" UUID, "material_issue_number" TEXT,
    "is_immutable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "batch_genealogy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "batch_splits" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "split_number" TEXT NOT NULL, "split_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_batch_id" UUID NOT NULL, "source_batch_number" TEXT,
    "split_reason" TEXT NOT NULL,
    "total_qty" DECIMAL(14,3) NOT NULL,
    "child_batch_ids" UUID[],
    "split_count" INTEGER NOT NULL,
    "performed_by" UUID, "performed_by_name" TEXT,
    "remarks" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "batch_splits_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_bs_tenant_number" UNIQUE ("tenant_id", "split_number")
);

CREATE TABLE IF NOT EXISTS "batch_merges" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "merge_number" TEXT NOT NULL, "merge_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "target_batch_id" UUID NOT NULL, "target_batch_number" TEXT,
    "merge_reason" TEXT NOT NULL,
    "total_qty" DECIMAL(14,3) NOT NULL,
    "source_batch_ids" UUID[],
    "merge_count" INTEGER NOT NULL,
    "performed_by" UUID, "performed_by_name" TEXT,
    "remarks" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "batch_merges_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_bm_tenant_number" UNIQUE ("tenant_id", "merge_number")
);

CREATE TABLE IF NOT EXISTS "traceability_logs" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "trace_type" TEXT NOT NULL,
    "batch_id" UUID, "batch_number" TEXT,
    "product_id" UUID, "product_sku" TEXT,
    "direction" TEXT NOT NULL,
    "related_batch_id" UUID, "related_batch_number" TEXT,
    "related_product_id" UUID, "related_product_sku" TEXT,
    "related_type" TEXT,
    "quantity" DECIMAL(14,3), "uom_code" TEXT,
    "reference_type" TEXT, "reference_id" UUID, "reference_number" TEXT,
    "event_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "is_immutable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "traceability_logs_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 20: FINISHED GOODS QC (5 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "fgqc_inspection_lots" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "lot_number" TEXT NOT NULL, "lot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "production_batch_id" UUID, "production_batch_number" TEXT,
    "production_order_id" UUID, "production_order_number" TEXT,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "batch_quantity" DECIMAL(14,3) NOT NULL, "sample_size" INTEGER NOT NULL,
    "uom_id" UUID, "uom_code" TEXT,
    "inspection_plan_id" UUID, "inspection_plan_code" TEXT,
    "inspection_status" TEXT NOT NULL DEFAULT 'PENDING',
    "inspector_id" UUID, "inspector_name" TEXT,
    "inspection_started_at" TIMESTAMP(3), "inspection_completed_at" TIMESTAMP(3),
    "result" TEXT, "disposition" TEXT,
    "release_decision" TEXT, "release_notes" TEXT,
    "released_by" UUID, "released_by_name" TEXT, "released_at" TIMESTAMP(3),
    "reject_reason" TEXT,
    "coa_id" UUID, "coa_number" TEXT,
    "shelf_life_days" INTEGER, "expiry_date" TIMESTAMP(3),
    "remarks" TEXT, "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "fgqc_inspection_lots_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_fgqc_tenant_number" UNIQUE ("tenant_id", "lot_number")
);

CREATE TABLE IF NOT EXISTS "fgqc_test_results" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "inspection_lot_id" UUID NOT NULL,
    "test_category" TEXT NOT NULL,
    "test_code" TEXT, "test_name" TEXT NOT NULL,
    "test_type" TEXT,
    "specification" TEXT, "min_value" TEXT, "max_value" TEXT, "target_value" TEXT,
    "actual_value" TEXT NOT NULL, "unit" TEXT,
    "result" TEXT NOT NULL DEFAULT 'PASS',
    "method" TEXT, "equipment" TEXT,
    "tested_by" UUID, "tested_by_name" TEXT, "tested_at" TIMESTAMP(3),
    "remarks" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fgqc_test_results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "fgqc_holds" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "hold_number" TEXT NOT NULL, "hold_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspection_lot_id" UUID, "production_batch_id" UUID, "production_batch_number" TEXT,
    "product_id" UUID, "product_sku" TEXT,
    "held_qty" DECIMAL(14,3) NOT NULL,
    "hold_reason" TEXT NOT NULL, "hold_type" TEXT DEFAULT 'FGQC',
    "held_by" UUID, "held_by_name" TEXT,
    "released_by" UUID, "released_by_name" TEXT, "released_at" TIMESTAMP(3),
    "release_reason" TEXT, "disposition" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "fgqc_holds_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_fgh_tenant_number" UNIQUE ("tenant_id", "hold_number")
);

CREATE TABLE IF NOT EXISTS "coa_records" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "coa_number" TEXT NOT NULL, "coa_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspection_lot_id" UUID, "production_batch_id" UUID, "production_batch_number" TEXT,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "batch_number" TEXT, "manufacture_date" TIMESTAMP(3), "expiry_date" TIMESTAMP(3),
    "quantity" DECIMAL(14,3), "uom_code" TEXT,
    "customer_id" UUID, "customer_name" TEXT,
    "test_summary" JSONB, "overall_result" TEXT,
    "status" TEXT DEFAULT 'DRAFT',
    "prepared_by" UUID, "prepared_by_name" TEXT,
    "reviewed_by" UUID, "reviewed_by_name" TEXT, "reviewed_at" TIMESTAMP(3),
    "signed_by" UUID, "signed_by_name" TEXT, "signed_at" TIMESTAMP(3),
    "remarks" TEXT, "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "coa_records_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_coa_tenant_number" UNIQUE ("tenant_id", "coa_number")
);

CREATE TABLE IF NOT EXISTS "shelf_life_records" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "batch_id" UUID, "batch_number" TEXT,
    "production_batch_id" UUID, "production_batch_number" TEXT,
    "manufacture_date" TIMESTAMP(3), "original_expiry_date" TIMESTAMP(3),
    "adjusted_expiry_date" TIMESTAMP(3), "shelf_life_days" INTEGER,
    "adjustment_reason" TEXT,
    "adjusted_by" UUID, "adjusted_by_name" TEXT, "adjusted_at" TIMESTAMP(3),
    "remarks" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shelf_life_records_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS "idx_wc_tenant_active" ON "work_centers"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_m_tenant_status" ON "machines"("tenant_id", "current_status");
CREATE INDEX IF NOT EXISTS "idx_msl_tenant_machine" ON "machine_status_logs"("tenant_id", "machine_id");
CREATE INDEX IF NOT EXISTS "idx_dt_tenant_machine" ON "downtime_records"("tenant_id", "machine_id");
CREATE INDEX IF NOT EXISTS "idx_pe_tenant_po" ON "production_events"("tenant_id", "production_order_id");
CREATE INDEX IF NOT EXISTS "idx_recipe_tenant_product" ON "recipes"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_recipe_tenant_status" ON "recipes"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_ri_recipe" ON "recipe_items"("recipe_id");
CREATE INDEX IF NOT EXISTS "idx_bom_tenant_product" ON "bom_headers"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_bl_bom" ON "bom_lines"("bom_id");
CREATE INDEX IF NOT EXISTS "idx_bl_product" ON "bom_lines"("product_id");
CREATE INDEX IF NOT EXISTS "idx_ro_routing" ON "routing_operations"("routing_id");
CREATE INDEX IF NOT EXISTS "idx_pp_tenant_status" ON "production_plans"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_ppl_plan" ON "production_plan_lines"("plan_id");
CREATE INDEX IF NOT EXISTS "idx_ps_tenant_status" ON "production_schedules"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_cp_tenant_wc_date" ON "capacity_plans"("tenant_id", "work_center_id", "plan_date");
CREATE INDEX IF NOT EXISTS "idx_mr_tenant_po" ON "material_reservations"("tenant_id", "production_order_id");
CREATE INDEX IF NOT EXISTS "idx_mpo_tenant_status" ON "production_orders"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_mpo_tenant_product" ON "production_orders"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_mpo_tenant_date" ON "production_orders"("tenant_id", "po_date");
CREATE INDEX IF NOT EXISTS "idx_mpop_po" ON "production_order_operations"("production_order_id");
CREATE INDEX IF NOT EXISTS "idx_mi_tenant_po" ON "material_issues"("tenant_id", "production_order_id");
CREATE INDEX IF NOT EXISTS "idx_mil_issue" ON "material_issue_lines"("issue_id");
CREATE INDEX IF NOT EXISTS "idx_pc_tenant_po" ON "production_confirmations"("tenant_id", "production_order_id");
CREATE INDEX IF NOT EXISTS "idx_sr_tenant_po" ON "scrap_records"("tenant_id", "production_order_id");
CREATE INDEX IF NOT EXISTS "idx_rw_tenant_po" ON "rework_records"("tenant_id", "production_order_id");
CREATE INDEX IF NOT EXISTS "idx_pb_tenant_product" ON "production_batches"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_pb_tenant_status" ON "production_batches"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_pb_parent" ON "production_batches"("parent_batch_id");
CREATE INDEX IF NOT EXISTS "idx_bg_child" ON "batch_genealogy"("child_batch_id");
CREATE INDEX IF NOT EXISTS "idx_bg_parent" ON "batch_genealogy"("parent_batch_id");
CREATE INDEX IF NOT EXISTS "idx_tl_tenant_batch" ON "traceability_logs"("tenant_id", "batch_id");
CREATE INDEX IF NOT EXISTS "idx_fgqc_tenant_status" ON "fgqc_inspection_lots"("tenant_id", "inspection_status");
CREATE INDEX IF NOT EXISTS "idx_fgqc_batch" ON "fgqc_inspection_lots"("production_batch_id");
CREATE INDEX IF NOT EXISTS "idx_fgtr_lot" ON "fgqc_test_results"("inspection_lot_id");
CREATE INDEX IF NOT EXISTS "idx_fgh_tenant_status" ON "fgqc_holds"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_coa_tenant_product" ON "coa_records"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_coa_tenant_status" ON "coa_records"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_slr_tenant_product" ON "shelf_life_records"("tenant_id", "product_id");

-- ════════════════════════════════════════════════════════════════════════════
-- SUOP ERP — Phases 11-14: Warehouse & Inventory Domain
-- Migration 0012: GRN + IQC + Inventory + Warehouse
-- ════════════════════════════════════════════════════════════════════════════
-- 30 tables covering the complete procurement-to-inventory journey:
--   Phase 11: Goods Receipt (8 tables)
--   Phase 12: Incoming Quality Inspection (8 tables)
--   Phase 13: Inventory & Stock Ledger (7 tables)
--   Phase 14: Warehouse & Barcode (7 tables)
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 11: GOODS RECEIPT (GRN) — 8 tables
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "goods_receipts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "grn_number" TEXT NOT NULL,
    "grn_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "po_id" UUID,
    "po_number" TEXT,
    "supplier_id" UUID NOT NULL,
    "supplier_code" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "supplier_invoice_number" TEXT,
    "supplier_invoice_date" TIMESTAMP(3),
    "supplier_invoice_amount" DECIMAL(14,2),
    "delivery_challan_number" TEXT,
    "delivery_challan_date" TIMESTAMP(3),
    "company_id" UUID NOT NULL,
    "company_name" TEXT NOT NULL,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "received_by" UUID,
    "received_by_name" TEXT,
    "received_at" TIMESTAMP(3),
    "verified_by" UUID,
    "verified_by_name" TEXT,
    "verified_at" TIMESTAMP(3),
    "vehicle_number" TEXT,
    "transport_name" TEXT,
    "transport_lorry_no" TEXT,
    "transport_lr_number" TEXT,
    "transport_lr_date" TIMESTAMP(3),
    "transport_mode" TEXT DEFAULT 'ROAD',
    "eway_bill_number" TEXT,
    "eway_bill_date" TIMESTAMP(3),
    "total_qty" DECIMAL(14,3) DEFAULT 0,
    "total_accepted_qty" DECIMAL(14,3) DEFAULT 0,
    "total_rejected_qty" DECIMAL(14,3) DEFAULT 0,
    "total_damaged_qty" DECIMAL(14,3) DEFAULT 0,
    "total_short_qty" DECIMAL(14,3) DEFAULT 0,
    "total_over_qty" DECIMAL(14,3) DEFAULT 0,
    "is_partial" BOOLEAN DEFAULT false,
    "is_short_receipt" BOOLEAN DEFAULT false,
    "is_over_receipt" BOOLEAN DEFAULT false,
    "is_fully_received" BOOLEAN DEFAULT false,
    "po_balance_qty" DECIMAL(14,3) DEFAULT 0,
    "remarks" TEXT,
    "internal_notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "rejection_reason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    CONSTRAINT "goods_receipts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_grn_tenant_number" UNIQUE ("tenant_id", "grn_number")
);

CREATE TABLE IF NOT EXISTS "goods_receipt_lines" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "grn_id" UUID NOT NULL,
    "line_no" INTEGER NOT NULL,
    "po_line_id" UUID,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "uom_id" UUID NOT NULL,
    "uom_code" TEXT NOT NULL,
    "ordered_qty" DECIMAL(14,3) DEFAULT 0,
    "received_qty" DECIMAL(14,3) NOT NULL,
    "accepted_qty" DECIMAL(14,3) DEFAULT 0,
    "rejected_qty" DECIMAL(14,3) DEFAULT 0,
    "damaged_qty" DECIMAL(14,3) DEFAULT 0,
    "short_qty" DECIMAL(14,3) DEFAULT 0,
    "over_qty" DECIMAL(14,3) DEFAULT 0,
    "unit_price" DECIMAL(14,4) NOT NULL,
    "line_total" DECIMAL(14,2) DEFAULT 0,
    "batch_number" TEXT,
    "lot_number" TEXT,
    "manufacture_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "inspection_status" TEXT DEFAULT 'PENDING',
    "inspection_lot_id" UUID,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "goods_receipt_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "grn_attachments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "grn_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "file_url" TEXT NOT NULL,
    "category" TEXT DEFAULT 'GENERAL',
    "uploaded_by" UUID,
    "uploaded_by_name" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "grn_attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "grn_vehicle_details" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "grn_id" UUID NOT NULL,
    "vehicle_number" TEXT NOT NULL,
    "driver_name" TEXT,
    "driver_mobile" TEXT,
    "vehicle_type" TEXT,
    "container_number" TEXT,
    "seal_number" TEXT,
    "arrival_time" TIMESTAMP(3),
    "departure_time" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "grn_vehicle_details_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "grn_transport_details" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "grn_id" UUID NOT NULL,
    "transport_mode" TEXT NOT NULL DEFAULT 'ROAD',
    "transport_name" TEXT,
    "lorry_no" TEXT,
    "lr_number" TEXT NOT NULL,
    "lr_date" TIMESTAMP(3),
    "eway_bill_number" TEXT,
    "eway_bill_date" TIMESTAMP(3),
    "freight_amount" DECIMAL(14,2),
    "freight_paid_by" TEXT DEFAULT 'SUPPLIER',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "grn_transport_details_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "grn_delivery_challans" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "grn_id" UUID NOT NULL,
    "challan_number" TEXT NOT NULL,
    "challan_date" TIMESTAMP(3) NOT NULL,
    "challan_type" TEXT DEFAULT 'SUPPLIER',
    "total_qty" DECIMAL(14,3),
    "total_amount" DECIMAL(14,2),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "grn_delivery_challans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "grn_supplier_invoices" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "grn_id" UUID NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "invoice_amount" DECIMAL(14,2) NOT NULL,
    "tax_amount" DECIMAL(14,2),
    "total_amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT DEFAULT 'INR',
    "payment_due_date" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "grn_supplier_invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "grn_damage_records" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "grn_id" UUID NOT NULL,
    "grn_line_id" UUID,
    "product_id" UUID,
    "product_sku" TEXT,
    "damage_type" TEXT NOT NULL,
    "damaged_qty" DECIMAL(14,3) NOT NULL,
    "damage_reason" TEXT,
    "damage_severity" TEXT DEFAULT 'MINOR',
    "action_taken" TEXT,
    "recorded_by" UUID,
    "recorded_by_name" TEXT,
    "photo_url" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "grn_damage_records_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 12: INCOMING QUALITY INSPECTION (IQC) — 8 tables
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "inspection_plans" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plan_code" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "product_id" UUID,
    "product_category_id" UUID,
    "inspection_type" TEXT DEFAULT 'IQC',
    "sampling_plan_id" UUID,
    "aql_level" TEXT DEFAULT '2.5',
    "inspection_critical" TEXT DEFAULT 'NORMAL',
    "is_active" BOOLEAN DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "inspection_plans_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_iqp_tenant_code" UNIQUE ("tenant_id", "plan_code")
);

CREATE TABLE IF NOT EXISTS "sampling_plans" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plan_code" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "lot_size_min" INTEGER NOT NULL,
    "lot_size_max" INTEGER NOT NULL,
    "sample_size" INTEGER NOT NULL,
    "accept_number" INTEGER NOT NULL DEFAULT 0,
    "reject_number" INTEGER NOT NULL DEFAULT 1,
    "aql_level" TEXT DEFAULT '2.5',
    "inspection_level" TEXT DEFAULT 'II',
    "is_active" BOOLEAN DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "sampling_plans_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_sp_tenant_code" UNIQUE ("tenant_id", "plan_code")
);

CREATE TABLE IF NOT EXISTS "inspection_parameters" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "parameter_code" TEXT NOT NULL,
    "parameter_name" TEXT NOT NULL,
    "parameter_type" TEXT NOT NULL,
    "target_value" TEXT,
    "min_value" TEXT,
    "max_value" TEXT,
    "unit" TEXT,
    "is_mandatory" BOOLEAN DEFAULT true,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inspection_parameters_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "inspection_lots" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "lot_number" TEXT NOT NULL,
    "grn_id" UUID NOT NULL,
    "grn_line_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_number" TEXT,
    "lot_quantity" DECIMAL(14,3) NOT NULL,
    "sample_size" INTEGER NOT NULL,
    "plan_id" UUID,
    "plan_code" TEXT,
    "aql_level" TEXT,
    "inspection_status" TEXT NOT NULL DEFAULT 'PENDING',
    "inspection_type" TEXT DEFAULT 'IQC',
    "inspector_id" UUID,
    "inspector_name" TEXT,
    "inspection_started_at" TIMESTAMP(3),
    "inspection_completed_at" TIMESTAMP(3),
    "result" TEXT,
    "disposition" TEXT,
    "accept_qty" DECIMAL(14,3) DEFAULT 0,
    "reject_qty" DECIMAL(14,3) DEFAULT 0,
    "ncr_id" UUID,
    "remarks" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    CONSTRAINT "inspection_lots_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_iql_tenant_number" UNIQUE ("tenant_id", "lot_number")
);

CREATE TABLE IF NOT EXISTS "inspection_results" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "inspection_lot_id" UUID NOT NULL,
    "parameter_id" UUID,
    "parameter_code" TEXT,
    "parameter_name" TEXT,
    "expected_value" TEXT,
    "actual_value" TEXT NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'PASS',
    "remarks" TEXT,
    "recorded_by" UUID,
    "recorded_by_name" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inspection_results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "quality_holds" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "hold_number" TEXT NOT NULL,
    "hold_type" TEXT NOT NULL DEFAULT 'IQC',
    "source_id" UUID,
    "source_type" TEXT,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "batch_number" TEXT,
    "lot_number" TEXT,
    "held_qty" DECIMAL(14,3) NOT NULL,
    "hold_reason" TEXT NOT NULL,
    "hold_location" TEXT,
    "held_by" UUID,
    "held_by_name" TEXT,
    "held_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_by" UUID,
    "released_by_name" TEXT,
    "released_at" TIMESTAMP(3),
    "release_reason" TEXT,
    "disposition" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "quality_holds_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_qh_tenant_number" UNIQUE ("tenant_id", "hold_number")
);

CREATE TABLE IF NOT EXISTS "ncrs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "ncr_number" TEXT NOT NULL,
    "ncr_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ncr_type" TEXT DEFAULT 'IQC',
    "source_id" UUID,
    "source_type" TEXT,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_number" TEXT,
    "lot_number" TEXT,
    "supplier_id" UUID,
    "supplier_name" TEXT,
    "grn_id" UUID,
    "grn_number" TEXT,
    "non_conformance" TEXT NOT NULL,
    "non_conformance_type" TEXT,
    "severity" TEXT DEFAULT 'MAJOR',
    "defect_qty" DECIMAL(14,3) DEFAULT 0,
    "disposition" TEXT,
    "root_cause" TEXT,
    "capa_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "raised_by" UUID,
    "raised_by_name" TEXT,
    "closed_by" UUID,
    "closed_by_name" TEXT,
    "closed_at" TIMESTAMP(3),
    "closure_notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    CONSTRAINT "ncrs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_ncr_tenant_number" UNIQUE ("tenant_id", "ncr_number")
);

CREATE TABLE IF NOT EXISTS "capa_records" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "capa_number" TEXT NOT NULL,
    "capa_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ncr_id" UUID,
    "ncr_number" TEXT,
    "corrective_action" TEXT NOT NULL,
    "preventive_action" TEXT NOT NULL,
    "action_owner" UUID,
    "action_owner_name" TEXT,
    "target_date" TIMESTAMP(3),
    "completed_date" TIMESTAMP(3),
    "effectiveness" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    CONSTRAINT "capa_records_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_capa_tenant_number" UNIQUE ("tenant_id", "capa_number")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 13: INVENTORY & STOCK LEDGER — 7 tables
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "batches" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "batch_number" TEXT NOT NULL,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "manufacture_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "supplier_id" UUID,
    "supplier_name" TEXT,
    "grn_id" UUID,
    "grn_number" TEXT,
    "is_blocked" BOOLEAN DEFAULT false,
    "block_reason" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "batches_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_batch_tenant_number_product" UNIQUE ("tenant_id", "batch_number", "product_id")
);

CREATE TABLE IF NOT EXISTS "lots" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "lot_number" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "manufacture_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "supplier_id" UUID,
    "supplier_name" TEXT,
    "grn_id" UUID,
    "grn_number" TEXT,
    "is_blocked" BOOLEAN DEFAULT false,
    "block_reason" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "lots_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_lot_tenant_number_product" UNIQUE ("tenant_id", "lot_number", "product_id")
);

CREATE TABLE IF NOT EXISTS "inventory" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT,
    "bin_id" UUID,
    "bin_code" TEXT,
    "batch_id" UUID,
    "batch_number" TEXT,
    "lot_id" UUID,
    "lot_number" TEXT,
    "uom_id" UUID NOT NULL,
    "uom_code" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "reserved_qty" DECIMAL(14,3) DEFAULT 0,
    "blocked_qty" DECIMAL(14,3) DEFAULT 0,
    "available_qty" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "unit_cost" DECIMAL(14,4) DEFAULT 0,
    "moving_avg_cost" DECIMAL(14,4) DEFAULT 0,
    "total_value" DECIMAL(14,2) DEFAULT 0,
    "currency" TEXT DEFAULT 'INR',
    "manufacture_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "is_expired" BOOLEAN DEFAULT false,
    "is_blocked" BOOLEAN DEFAULT false,
    "block_reason" TEXT,
    "last_movement_at" TIMESTAMP(3),
    "last_movement_type" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_inv_tenant_product_wh_batch_lot_bin" UNIQUE (
        "tenant_id", "product_id", "warehouse_id", "batch_id", "lot_id", "bin_id"
    )
);

CREATE TABLE IF NOT EXISTS "inventory_transactions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "transaction_number" TEXT NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_type" TEXT NOT NULL,
    "movement_type" TEXT NOT NULL,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT,
    "bin_id" UUID,
    "bin_code" TEXT,
    "batch_id" UUID,
    "batch_number" TEXT,
    "lot_id" UUID,
    "lot_number" TEXT,
    "uom_id" UUID NOT NULL,
    "uom_code" TEXT NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unit_cost" DECIMAL(14,4) DEFAULT 0,
    "total_value" DECIMAL(14,2) DEFAULT 0,
    "currency" TEXT DEFAULT 'INR',
    "balance_after" DECIMAL(14,3) DEFAULT 0,
    "reference_type" TEXT,
    "reference_id" UUID,
    "reference_number" TEXT,
    "reason" TEXT,
    "remarks" TEXT,
    "performed_by" UUID,
    "performed_by_name" TEXT,
    "correlation_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_itxn_tenant_number" UNIQUE ("tenant_id", "transaction_number")
);

CREATE TABLE IF NOT EXISTS "inventory_ledger" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "entry_number" TEXT NOT NULL,
    "entry_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_id" UUID NOT NULL,
    "transaction_number" TEXT NOT NULL,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "lot_id" UUID,
    "lot_number" TEXT,
    "movement_type" TEXT NOT NULL,
    "in_qty" DECIMAL(14,3) DEFAULT 0,
    "out_qty" DECIMAL(14,3) DEFAULT 0,
    "balance_qty" DECIMAL(14,3) NOT NULL,
    "unit_cost" DECIMAL(14,4) DEFAULT 0,
    "total_value" DECIMAL(14,2) DEFAULT 0,
    "balance_value" DECIMAL(14,2) DEFAULT 0,
    "reference_type" TEXT,
    "reference_id" UUID,
    "reference_number" TEXT,
    "reason" TEXT,
    "performed_by" UUID,
    "performed_by_name" TEXT,
    "correlation_id" TEXT,
    "is_immutable" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_ledger_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_il_tenant_number" UNIQUE ("tenant_id", "entry_number")
);

CREATE TABLE IF NOT EXISTS "stock_reservations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "reservation_number" TEXT NOT NULL,
    "reservation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "batch_id" UUID,
    "lot_id" UUID,
    "reserved_qty" DECIMAL(14,3) NOT NULL,
    "uom_id" UUID NOT NULL,
    "uom_code" TEXT NOT NULL,
    "reservation_type" TEXT,
    "reference_type" TEXT,
    "reference_id" UUID,
    "reference_number" TEXT,
    "reserved_by" UUID,
    "reserved_by_name" TEXT,
    "reserved_for" TEXT,
    "expires_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "released_at" TIMESTAMP(3),
    "released_by" UUID,
    "released_reason" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "stock_reservations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_sr_tenant_number" UNIQUE ("tenant_id", "reservation_number")
);

CREATE TABLE IF NOT EXISTS "stock_blocks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "block_number" TEXT NOT NULL,
    "block_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "batch_id" UUID,
    "lot_id" UUID,
    "blocked_qty" DECIMAL(14,3) NOT NULL,
    "uom_id" UUID NOT NULL,
    "uom_code" TEXT NOT NULL,
    "block_type" TEXT,
    "block_reason" TEXT NOT NULL,
    "source_type" TEXT,
    "source_id" UUID,
    "source_number" TEXT,
    "blocked_by" UUID,
    "blocked_by_name" TEXT,
    "released_by" UUID,
    "released_by_name" TEXT,
    "released_at" TIMESTAMP(3),
    "release_reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "stock_blocks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_sb_tenant_number" UNIQUE ("tenant_id", "block_number")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 14: WAREHOUSE & BARCODE — 7 tables
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "warehouse_zones" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "zone_code" TEXT NOT NULL,
    "zone_name" TEXT NOT NULL,
    "zone_type" TEXT DEFAULT 'STORAGE',
    "capacity" DECIMAL(14,3) DEFAULT 0,
    "used_capacity" DECIMAL(14,3) DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "sort_order" INTEGER DEFAULT 0,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    CONSTRAINT "warehouse_zones_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_wz_tenant_wh_code" UNIQUE ("tenant_id", "warehouse_id", "zone_code")
);

CREATE TABLE IF NOT EXISTS "warehouse_aisles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "zone_id" UUID,
    "aisle_code" TEXT NOT NULL,
    "aisle_name" TEXT NOT NULL,
    "capacity" DECIMAL(14,3) DEFAULT 0,
    "used_capacity" DECIMAL(14,3) DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "sort_order" INTEGER DEFAULT 0,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    CONSTRAINT "warehouse_aisles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_wa_tenant_wh_code" UNIQUE ("tenant_id", "warehouse_id", "aisle_code")
);

CREATE TABLE IF NOT EXISTS "warehouse_racks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "zone_id" UUID,
    "aisle_id" UUID,
    "rack_code" TEXT NOT NULL,
    "rack_name" TEXT NOT NULL,
    "rack_type" TEXT DEFAULT 'STANDARD',
    "levels" INTEGER DEFAULT 1,
    "capacity_per_level" DECIMAL(14,3) DEFAULT 0,
    "capacity" DECIMAL(14,3) DEFAULT 0,
    "used_capacity" DECIMAL(14,3) DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "sort_order" INTEGER DEFAULT 0,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    CONSTRAINT "warehouse_racks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_wr_tenant_wh_code" UNIQUE ("tenant_id", "warehouse_id", "rack_code")
);

CREATE TABLE IF NOT EXISTS "warehouse_bins" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "zone_id" UUID,
    "aisle_id" UUID,
    "rack_id" UUID,
    "bin_code" TEXT NOT NULL,
    "bin_name" TEXT NOT NULL,
    "bin_type" TEXT DEFAULT 'STORAGE',
    "level" INTEGER DEFAULT 1,
    "position" TEXT,
    "capacity" DECIMAL(14,3) DEFAULT 0,
    "used_capacity" DECIMAL(14,3) DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "is_blocked" BOOLEAN DEFAULT false,
    "block_reason" TEXT,
    "sort_order" INTEGER DEFAULT 0,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    CONSTRAINT "warehouse_bins_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_wb_tenant_wh_code" UNIQUE ("tenant_id", "warehouse_id", "bin_code")
);

CREATE TABLE IF NOT EXISTS "putaway_tasks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "task_number" TEXT NOT NULL,
    "task_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grn_id" UUID,
    "grn_number" TEXT,
    "grn_line_id" UUID,
    "inspection_lot_id" UUID,
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "batch_id" UUID,
    "batch_number" TEXT,
    "lot_id" UUID,
    "lot_number" TEXT,
    "quantity" DECIMAL(14,3) NOT NULL,
    "uom_id" UUID NOT NULL,
    "uom_code" TEXT NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "warehouse_name" TEXT,
    "source_bin_id" UUID,
    "source_bin_code" TEXT,
    "target_bin_id" UUID,
    "target_bin_code" TEXT,
    "assigned_to" UUID,
    "assigned_to_name" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT DEFAULT 'NORMAL',
    "remarks" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    CONSTRAINT "putaway_tasks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_pt_tenant_number" UNIQUE ("tenant_id", "task_number")
);

CREATE TABLE IF NOT EXISTS "barcode_labels" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "barcode" TEXT NOT NULL,
    "barcode_type" TEXT NOT NULL DEFAULT 'CODE128',
    "label_type" TEXT NOT NULL,
    "product_id" UUID,
    "product_sku" TEXT,
    "product_name" TEXT,
    "batch_id" UUID,
    "batch_number" TEXT,
    "lot_id" UUID,
    "lot_number" TEXT,
    "warehouse_id" UUID,
    "bin_id" UUID,
    "bin_code" TEXT,
    "grn_id" UUID,
    "grn_number" TEXT,
    "quantity" DECIMAL(14,3),
    "uom_code" TEXT,
    "manufacture_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "gs1_gtin" TEXT,
    "gs1_batch" TEXT,
    "gs1_expiry" TEXT,
    "qr_data" TEXT,
    "print_count" INTEGER DEFAULT 0,
    "last_printed_at" TIMESTAMP(3),
    "is_printed" BOOLEAN DEFAULT false,
    "is_scanned" BOOLEAN DEFAULT false,
    "scanned_at" TIMESTAMP(3),
    "status" TEXT DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    CONSTRAINT "barcode_labels_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_bl_tenant_barcode" UNIQUE ("tenant_id", "barcode")
);

CREATE TABLE IF NOT EXISTS "scan_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "barcode" TEXT NOT NULL,
    "scan_type" TEXT NOT NULL,
    "scan_context" TEXT,
    "scanned_by" UUID,
    "scanned_by_name" TEXT,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device_id" TEXT,
    "location" TEXT,
    "result" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scan_logs_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════════════════════

-- GRN
CREATE INDEX IF NOT EXISTS "idx_grn_tenant_status" ON "goods_receipts"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_grn_tenant_supplier" ON "goods_receipts"("tenant_id", "supplier_id");
CREATE INDEX IF NOT EXISTS "idx_grn_tenant_po" ON "goods_receipts"("tenant_id", "po_id");
CREATE INDEX IF NOT EXISTS "idx_grn_tenant_date" ON "goods_receipts"("tenant_id", "grn_date");
CREATE INDEX IF NOT EXISTS "idx_grnl_grn" ON "goods_receipt_lines"("grn_id");
CREATE INDEX IF NOT EXISTS "idx_grnl_product" ON "goods_receipt_lines"("product_id");

-- IQC
CREATE INDEX IF NOT EXISTS "idx_iql_tenant_status" ON "inspection_lots"("tenant_id", "inspection_status");
CREATE INDEX IF NOT EXISTS "idx_iql_grn" ON "inspection_lots"("grn_id");
CREATE INDEX IF NOT EXISTS "idx_iql_product" ON "inspection_lots"("product_id");
CREATE INDEX IF NOT EXISTS "idx_iqr_lot" ON "inspection_results"("inspection_lot_id");
CREATE INDEX IF NOT EXISTS "idx_qh_tenant_status" ON "quality_holds"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_ncr_tenant_status" ON "ncrs"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_capa_tenant_status" ON "capa_records"("tenant_id", "status");

-- Inventory
CREATE INDEX IF NOT EXISTS "idx_inv_tenant_product_wh" ON "inventory"("tenant_id", "product_id", "warehouse_id");
CREATE INDEX IF NOT EXISTS "idx_inv_tenant_batch" ON "inventory"("tenant_id", "batch_id");
CREATE INDEX IF NOT EXISTS "idx_inv_tenant_lot" ON "inventory"("tenant_id", "lot_id");
CREATE INDEX IF NOT EXISTS "idx_inv_tenant_expiry" ON "inventory"("tenant_id", "expiry_date");
CREATE INDEX IF NOT EXISTS "idx_itxn_tenant_product" ON "inventory_transactions"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_itxn_tenant_date" ON "inventory_transactions"("tenant_id", "transaction_date");
CREATE INDEX IF NOT EXISTS "idx_il_tenant_product" ON "inventory_ledger"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_il_tenant_date" ON "inventory_ledger"("tenant_id", "entry_date");
CREATE INDEX IF NOT EXISTS "idx_batch_tenant_product" ON "batches"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_lot_tenant_product" ON "lots"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_sr_tenant_status" ON "stock_reservations"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_sb_tenant_status" ON "stock_blocks"("tenant_id", "status");

-- Warehouse
CREATE INDEX IF NOT EXISTS "idx_wz_tenant_wh" ON "warehouse_zones"("tenant_id", "warehouse_id");
CREATE INDEX IF NOT EXISTS "idx_wa_tenant_wh" ON "warehouse_aisles"("tenant_id", "warehouse_id");
CREATE INDEX IF NOT EXISTS "idx_wr_tenant_wh" ON "warehouse_racks"("tenant_id", "warehouse_id");
CREATE INDEX IF NOT EXISTS "idx_wb_tenant_wh" ON "warehouse_bins"("tenant_id", "warehouse_id");
CREATE INDEX IF NOT EXISTS "idx_pt_tenant_status" ON "putaway_tasks"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_bl_tenant_barcode" ON "barcode_labels"("tenant_id", "barcode");
CREATE INDEX IF NOT EXISTS "idx_bl_tenant_type" ON "barcode_labels"("tenant_id", "label_type");
CREATE INDEX IF NOT EXISTS "idx_sl_tenant_date" ON "scan_logs"("tenant_id", "scanned_at");

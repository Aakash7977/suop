-- ════════════════════════════════════════════════════════════════════════════
-- SUOP ERP — Phases 27-32: Enterprise Sales & Distribution Domain
-- Migration 0015: Sales (6 phases, ~40 tables)
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 27: SALES ORDER MANAGEMENT (6 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "sales_orders" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "so_number" TEXT NOT NULL, "so_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "so_type" TEXT NOT NULL DEFAULT 'STANDARD',
    "customer_id" UUID NOT NULL, "customer_code" TEXT NOT NULL, "customer_name" TEXT NOT NULL,
    "customer_gstin" TEXT, "customer_po_number" TEXT, "customer_po_date" DATE,
    "company_id" UUID NOT NULL, "company_name" TEXT NOT NULL,
    "plant_id" UUID, "plant_name" TEXT,
    "warehouse_id" UUID, "warehouse_name" TEXT,
    "salesperson_id" UUID, "salesperson_name" TEXT,
    "delivery_address" TEXT, "billing_address" TEXT,
    "expected_delivery_date" TIMESTAMP(3), "delivery_terms" TEXT,
    "payment_terms" TEXT NOT NULL DEFAULT 'NET30', "credit_days" INTEGER DEFAULT 30,
    "currency" TEXT NOT NULL DEFAULT 'INR', "exchange_rate" DECIMAL(14,6) DEFAULT 1,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0, "discount_amount" DECIMAL(14,2) DEFAULT 0,
    "tax_amount" DECIMAL(14,2) DEFAULT 0, "freight_amount" DECIMAL(14,2) DEFAULT 0,
    "other_charges" DECIMAL(14,2) DEFAULT 0, "round_off" DECIMAL(14,2) DEFAULT 0,
    "grand_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "credit_status" TEXT DEFAULT 'PENDING', "credit_approved_by" UUID, "credit_approved_at" TIMESTAMP(3),
    "credit_limit" DECIMAL(14,2), "credit_used" DECIMAL(14,2), "credit_available" DECIMAL(14,2),
    "is_on_hold" BOOLEAN DEFAULT false, "hold_reason" TEXT,
    "reserved_qty" DECIMAL(14,3) DEFAULT 0, "picked_qty" DECIMAL(14,3) DEFAULT 0,
    "packed_qty" DECIMAL(14,3) DEFAULT 0, "dispatched_qty" DECIMAL(14,3) DEFAULT 0,
    "delivered_qty" DECIMAL(14,3) DEFAULT 0, "invoiced_qty" DECIMAL(14,3) DEFAULT 0,
    "returned_qty" DECIMAL(14,3) DEFAULT 0,
    "is_backorder" BOOLEAN DEFAULT false, "is_partial" BOOLEAN DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "rejection_reason" TEXT, "cancel_reason" TEXT, "amendment_reason" TEXT,
    "revision_no" INTEGER DEFAULT 0, "parent_so_id" UUID,
    "remarks" TEXT, "internal_notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_so_tenant_number" UNIQUE ("tenant_id", "so_number")
);

CREATE TABLE IF NOT EXISTS "sales_order_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "so_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "product_id" UUID NOT NULL, "product_sku" TEXT NOT NULL, "product_name" TEXT NOT NULL,
    "uom_id" UUID NOT NULL, "uom_code" TEXT NOT NULL,
    "ordered_qty" DECIMAL(14,3) NOT NULL, "reserved_qty" DECIMAL(14,3) DEFAULT 0,
    "picked_qty" DECIMAL(14,3) DEFAULT 0, "packed_qty" DECIMAL(14,3) DEFAULT 0,
    "dispatched_qty" DECIMAL(14,3) DEFAULT 0, "delivered_qty" DECIMAL(14,3) DEFAULT 0,
    "invoiced_qty" DECIMAL(14,3) DEFAULT 0, "returned_qty" DECIMAL(14,3) DEFAULT 0,
    "unit_price" DECIMAL(14,4) NOT NULL, "base_price" DECIMAL(14,4),
    "discount_percent" DECIMAL(5,2) DEFAULT 0, "discount_amount" DECIMAL(14,2) DEFAULT 0,
    "tax_percent" DECIMAL(5,2) DEFAULT 0, "tax_amount" DECIMAL(14,2) DEFAULT 0,
    "line_total" DECIMAL(14,2) NOT NULL DEFAULT 0, "currency" TEXT DEFAULT 'INR',
    "batch_id" UUID, "batch_number" TEXT, "lot_id" UUID, "lot_number" TEXT,
    "expected_delivery_date" TIMESTAMP(3), "allocation_strategy" TEXT DEFAULT 'FEFO',
    "is_backorder" BOOLEAN DEFAULT false, "is_substituted" BOOLEAN DEFAULT false,
    "substituted_for_product_id" UUID, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sales_order_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sales_order_amendments" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "so_id" UUID NOT NULL, "amendment_no" INTEGER NOT NULL,
    "amendment_reason" TEXT NOT NULL, "previous_snapshot" JSONB NOT NULL,
    "new_snapshot" JSONB, "changed_fields" TEXT[],
    "amended_by" UUID, "amended_by_name" TEXT, "amended_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approval_required" BOOLEAN DEFAULT true, "approved_by" UUID, "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sales_order_amendments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sales_order_holds" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "so_id" UUID NOT NULL, "hold_type" TEXT NOT NULL,
    "hold_reason" TEXT NOT NULL, "held_by" UUID, "held_by_name" TEXT,
    "held_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_by" UUID, "released_by_name" TEXT, "released_at" TIMESTAMP(3),
    "release_reason" TEXT, "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sales_order_holds_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sales_order_approvals" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "so_id" UUID NOT NULL, "approval_level" TEXT NOT NULL,
    "approver_id" UUID, "approver_name" TEXT, "approver_role" TEXT,
    "approval_status" TEXT NOT NULL DEFAULT 'PENDING',
    "approval_date" TIMESTAMP(3), "approval_notes" TEXT, "rejection_reason" TEXT,
    "is_current" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sales_order_approvals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sales_order_history" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "so_id" UUID NOT NULL, "action" TEXT NOT NULL,
    "from_status" TEXT, "to_status" TEXT,
    "action_by" UUID, "action_by_name" TEXT, "action_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action_notes" TEXT, "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sales_order_history_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 28: PRICING & PROMOTION ENGINE (7 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "price_lists" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "list_code" TEXT NOT NULL, "list_name" TEXT NOT NULL,
    "list_type" TEXT NOT NULL DEFAULT 'STANDARD',
    "channel" TEXT, "currency" TEXT DEFAULT 'INR',
    "effective_from" DATE NOT NULL, "effective_to" DATE,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "price_lists_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_pl_tenant_code" UNIQUE ("tenant_id", "list_code")
);

CREATE TABLE IF NOT EXISTS "price_list_items" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "price_list_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "uom_id" UUID, "uom_code" TEXT,
    "list_price" DECIMAL(14,4) NOT NULL, "cost_price" DECIMAL(14,4),
    "min_price" DECIMAL(14,4), "max_price" DECIMAL(14,4),
    "discount_percent" DECIMAL(5,2) DEFAULT 0, "tax_percent" DECIMAL(5,2) DEFAULT 0,
    "min_order_qty" DECIMAL(14,3), "max_order_qty" DECIMAL(14,3),
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "price_list_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "customer_price_agreements" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "agreement_code" TEXT NOT NULL, "agreement_name" TEXT NOT NULL,
    "customer_id" UUID NOT NULL, "customer_code" TEXT, "customer_name" TEXT,
    "price_list_id" UUID, "agreement_type" TEXT DEFAULT 'CONTRACT',
    "effective_from" DATE NOT NULL, "effective_to" DATE,
    "discount_percent" DECIMAL(5,2) DEFAULT 0, "is_active" BOOLEAN DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "customer_price_agreements_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_cpa_tenant_code" UNIQUE ("tenant_id", "agreement_code")
);

CREATE TABLE IF NOT EXISTS "promotions" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "promo_code" TEXT NOT NULL, "promo_name" TEXT NOT NULL,
    "promo_type" TEXT NOT NULL, "scope" TEXT DEFAULT 'PRODUCT',
    "product_id" UUID, "product_category_id" UUID, "customer_id" UUID, "customer_group_id" UUID,
    "discount_type" TEXT NOT NULL, "discount_value" DECIMAL(14,4) NOT NULL,
    "min_qty" DECIMAL(14,3), "max_qty" DECIMAL(14,3),
    "min_order_value" DECIMAL(14,2), "max_discount_amount" DECIMAL(14,2),
    "buy_qty" DECIMAL(14,3), "get_qty" DECIMAL(14,3),
    "start_date" DATE NOT NULL, "end_date" DATE NOT NULL,
    "is_active" BOOLEAN DEFAULT true, "usage_limit" INTEGER, "usage_count" INTEGER DEFAULT 0,
    "description" TEXT, "terms_conditions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_promo_tenant_code" UNIQUE ("tenant_id", "promo_code")
);

CREATE TABLE IF NOT EXISTS "coupons" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "coupon_code" TEXT NOT NULL, "coupon_name" TEXT NOT NULL,
    "coupon_type" TEXT NOT NULL, "discount_type" TEXT NOT NULL,
    "discount_value" DECIMAL(14,4) NOT NULL, "min_order_value" DECIMAL(14,2),
    "max_discount_amount" DECIMAL(14,2),
    "start_date" DATE NOT NULL, "end_date" DATE NOT NULL,
    "usage_limit" INTEGER DEFAULT 1, "usage_count" INTEGER DEFAULT 0,
    "per_customer_limit" INTEGER DEFAULT 1,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_coupon_tenant_code" UNIQUE ("tenant_id", "coupon_code")
);

CREATE TABLE IF NOT EXISTS "coupon_redemptions" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "coupon_id" UUID NOT NULL, "coupon_code" TEXT NOT NULL,
    "so_id" UUID, "customer_id" UUID, "customer_name" TEXT,
    "discount_amount" DECIMAL(14,2) NOT NULL,
    "redeemed_by" UUID, "redeemed_by_name" TEXT, "redeemed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coupon_redemptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tax_configurations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "tax_code" TEXT NOT NULL, "tax_name" TEXT NOT NULL,
    "tax_type" TEXT NOT NULL, "tax_percent" DECIMAL(5,2) NOT NULL,
    "hsn_code" TEXT, "sac_code" TEXT,
    "is_reverse_charge" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "tax_configurations_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_tax_tenant_code" UNIQUE ("tenant_id", "tax_code")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 29: ORDER FULFILLMENT (5 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "inventory_allocations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "allocation_number" TEXT NOT NULL, "allocation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "so_id" UUID NOT NULL, "so_number" TEXT, "so_line_id" UUID,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "warehouse_id" UUID NOT NULL, "warehouse_name" TEXT,
    "batch_id" UUID, "batch_number" TEXT, "lot_id" UUID, "lot_number" TEXT,
    "uom_id" UUID, "uom_code" TEXT,
    "ordered_qty" DECIMAL(14,3) NOT NULL, "allocated_qty" DECIMAL(14,3) NOT NULL,
    "short_qty" DECIMAL(14,3) DEFAULT 0, "allocation_strategy" TEXT DEFAULT 'FEFO',
    "is_fully_allocated" BOOLEAN DEFAULT false, "is_partial" BOOLEAN DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ALLOCATED',
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "inventory_allocations_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_ia_tenant_number" UNIQUE ("tenant_id", "allocation_number")
);

CREATE TABLE IF NOT EXISTS "wave_plans" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "wave_number" TEXT NOT NULL, "wave_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "warehouse_id" UUID NOT NULL, "warehouse_name" TEXT,
    "wave_type" TEXT DEFAULT 'PICKING', "priority" TEXT DEFAULT 'NORMAL',
    "total_orders" INTEGER DEFAULT 0, "total_lines" INTEGER DEFAULT 0,
    "total_qty" DECIMAL(14,3) DEFAULT 0, "allocated_qty" DECIMAL(14,3) DEFAULT 0,
    "picked_qty" DECIMAL(14,3) DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "release_date" TIMESTAMP(3), "completion_date" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "wave_plans_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_wp_tenant_number" UNIQUE ("tenant_id", "wave_number")
);

CREATE TABLE IF NOT EXISTS "wave_plan_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "wave_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "so_id" UUID, "so_number" TEXT, "so_line_id" UUID,
    "allocation_id" UUID,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "uom_code" TEXT, "ordered_qty" DECIMAL(14,3) NOT NULL,
    "allocated_qty" DECIMAL(14,3) DEFAULT 0, "picked_qty" DECIMAL(14,3) DEFAULT 0,
    "batch_id" UUID, "batch_number" TEXT, "lot_id" UUID, "lot_number" TEXT,
    "bin_id" UUID, "bin_code" TEXT,
    "status" TEXT DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wave_plan_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "substitution_rules" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "original_product_id" UUID NOT NULL, "original_product_sku" TEXT,
    "substitute_product_id" UUID NOT NULL, "substitute_product_sku" TEXT,
    "priority" INTEGER DEFAULT 1, "is_active" BOOLEAN DEFAULT true,
    "effective_from" DATE, "effective_to" DATE,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "substitution_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "fulfillment_analytics" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "period" TEXT NOT NULL, "period_start" DATE, "period_end" DATE,
    "total_orders" INTEGER DEFAULT 0, "fulfilled_orders" INTEGER DEFAULT 0,
    "partial_orders" INTEGER DEFAULT 0, "backorder_orders" INTEGER DEFAULT 0,
    "order_fill_rate" DECIMAL(5,2) DEFAULT 0, "backorder_pct" DECIMAL(5,2) DEFAULT 0,
    "otif_pct" DECIMAL(5,2) DEFAULT 0, "perfect_order_pct" DECIMAL(5,2) DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fulfillment_analytics_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_fa_tenant_period" UNIQUE ("tenant_id", "period")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 30: PICK • PACK • DISPATCH (6 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "pick_lists" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "pick_number" TEXT NOT NULL, "pick_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wave_id" UUID, "wave_number" TEXT,
    "warehouse_id" UUID NOT NULL, "warehouse_name" TEXT,
    "picker_id" UUID, "picker_name" TEXT,
    "total_lines" INTEGER DEFAULT 0, "total_qty" DECIMAL(14,3) DEFAULT 0,
    "picked_qty" DECIMAL(14,3) DEFAULT 0, "short_qty" DECIMAL(14,3) DEFAULT 0,
    "pick_route" TEXT, "pick_strategy" TEXT DEFAULT 'FEFO',
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "started_at" TIMESTAMP(3), "completed_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "pick_lists_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_pick_tenant_number" UNIQUE ("tenant_id", "pick_number")
);

CREATE TABLE IF NOT EXISTS "pick_list_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "pick_list_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "so_id" UUID, "so_number" TEXT, "so_line_id" UUID,
    "wave_line_id" UUID, "allocation_id" UUID,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "uom_code" TEXT, "ordered_qty" DECIMAL(14,3) NOT NULL,
    "picked_qty" DECIMAL(14,3) DEFAULT 0, "short_qty" DECIMAL(14,3) DEFAULT 0,
    "batch_id" UUID, "batch_number" TEXT, "lot_id" UUID, "lot_number" TEXT,
    "bin_id" UUID, "bin_code" TEXT,
    "barcode_scanned" BOOLEAN DEFAULT false, "barcode_verified" TEXT,
    "status" TEXT DEFAULT 'PENDING',
    "picked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pick_list_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "packing_lists" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "packing_number" TEXT NOT NULL, "packing_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pick_list_id" UUID, "pick_number" TEXT,
    "warehouse_id" UUID NOT NULL, "warehouse_name" TEXT,
    "packer_id" UUID, "packer_name" TEXT,
    "total_lines" INTEGER DEFAULT 0, "total_qty" DECIMAL(14,3) DEFAULT 0,
    "packed_qty" DECIMAL(14,3) DEFAULT 0, "total_weight" DECIMAL(14,3),
    "total_volume" DECIMAL(14,3), "box_count" INTEGER DEFAULT 0,
    "packing_material_id" UUID, "packing_material_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "started_at" TIMESTAMP(3), "completed_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "packing_lists_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_pack_tenant_number" UNIQUE ("tenant_id", "packing_number")
);

CREATE TABLE IF NOT EXISTS "packing_list_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "packing_list_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "pick_line_id" UUID, "so_id" UUID, "so_number" TEXT,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "uom_code" TEXT, "picked_qty" DECIMAL(14,3) NOT NULL,
    "packed_qty" DECIMAL(14,3) DEFAULT 0, "qty_variance" DECIMAL(14,3) DEFAULT 0,
    "batch_id" UUID, "batch_number" TEXT, "lot_id" UUID, "lot_number" TEXT,
    "box_number" INTEGER, "weight" DECIMAL(14,3), "volume" DECIMAL(14,3),
    "barcode_verified" BOOLEAN DEFAULT false,
    "status" TEXT DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "packing_list_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "shipments" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "shipment_number" TEXT NOT NULL, "shipment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "packing_list_id" UUID, "packing_number" TEXT,
    "so_id" UUID, "so_number" TEXT,
    "warehouse_id" UUID NOT NULL, "warehouse_name" TEXT,
    "customer_id" UUID, "customer_name" TEXT,
    "ship_to_address" TEXT, "ship_to_city" TEXT, "ship_to_state" TEXT,
    "transporter_id" UUID, "transporter_name" TEXT,
    "vehicle_number" TEXT, "driver_name" TEXT, "driver_mobile" TEXT,
    "lr_number" TEXT, "lr_date" TIMESTAMP(3),
    "eway_bill_number" TEXT, "eway_bill_date" TIMESTAMP(3),
    "total_qty" DECIMAL(14,3) DEFAULT 0, "total_weight" DECIMAL(14,3),
    "total_volume" DECIMAL(14,3), "box_count" INTEGER DEFAULT 0,
    "freight_amount" DECIMAL(14,2), "freight_paid_by" TEXT DEFAULT 'CUSTOMER',
    "shipping_label_url" TEXT, "tracking_number" TEXT,
    "dispatched_by" UUID, "dispatched_by_name" TEXT, "dispatched_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_ship_tenant_number" UNIQUE ("tenant_id", "shipment_number")
);

CREATE TABLE IF NOT EXISTS "dispatch_plans" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "dispatch_number" TEXT NOT NULL, "dispatch_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "warehouse_id" UUID NOT NULL, "warehouse_name" TEXT,
    "total_shipments" INTEGER DEFAULT 0, "total_qty" DECIMAL(14,3) DEFAULT 0,
    "total_weight" DECIMAL(14,3), "vehicle_count" INTEGER DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "dispatch_plans_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_dp_tenant_number" UNIQUE ("tenant_id", "dispatch_number")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 31: DELIVERY MANAGEMENT (5 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "delivery_orders" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "delivery_number" TEXT NOT NULL, "delivery_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shipment_id" UUID NOT NULL, "shipment_number" TEXT,
    "so_id" UUID, "so_number" TEXT,
    "customer_id" UUID, "customer_name" TEXT,
    "delivery_address" TEXT, "delivery_city" TEXT, "delivery_state" TEXT,
    "delivery_pincode" TEXT, "delivery_contact" TEXT, "delivery_phone" TEXT,
    "scheduled_date" TIMESTAMP(3), "estimated_arrival" TIMESTAMP(3),
    "actual_arrival" TIMESTAMP(3), "departure_time" TIMESTAMP(3),
    "total_qty" DECIMAL(14,3) DEFAULT 0, "total_weight" DECIMAL(14,3),
    "driver_name" TEXT, "driver_mobile" TEXT, "vehicle_number" TEXT,
    "delivery_type" TEXT DEFAULT 'STANDARD',
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "delivery_orders_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_do_tenant_number" UNIQUE ("tenant_id", "delivery_number")
);

CREATE TABLE IF NOT EXISTS "proof_of_deliveries" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "delivery_order_id" UUID NOT NULL, "delivery_number" TEXT,
    "pod_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_by" TEXT, "received_by_name" TEXT, "received_by_designation" TEXT,
    "customer_signature" TEXT, "signature_image_url" TEXT,
    "gps_latitude" DECIMAL(10,6), "gps_longitude" DECIMAL(10,6),
    "gps_timestamp" TIMESTAMP(3),
    "delivery_photo_url" TEXT,
    "delivered_qty" DECIMAL(14,3) NOT NULL, "damaged_qty" DECIMAL(14,3) DEFAULT 0,
    "short_qty" DECIMAL(14,3) DEFAULT 0,
    "delivery_status" TEXT NOT NULL DEFAULT 'DELIVERED',
    "customer_remarks" TEXT, "driver_remarks" TEXT,
    "confirmed_by" UUID, "confirmed_by_name" TEXT, "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "proof_of_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "delivery_exceptions" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "delivery_order_id" UUID NOT NULL, "delivery_number" TEXT,
    "exception_type" TEXT NOT NULL, "exception_reason" TEXT NOT NULL,
    "exception_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rescheduled_date" TIMESTAMP(3), "reschedule_reason" TEXT,
    "reported_by" UUID, "reported_by_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT, "resolved_by" UUID, "resolved_by_name" TEXT, "resolved_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "delivery_exceptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "delivery_tracking" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "delivery_order_id" UUID NOT NULL, "delivery_number" TEXT,
    "tracking_status" TEXT NOT NULL, "tracking_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT, "gps_latitude" DECIMAL(10,6), "gps_longitude" DECIMAL(10,6),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "delivery_tracking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "delivery_analytics" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "period" TEXT NOT NULL, "period_start" DATE, "period_end" DATE,
    "total_deliveries" INTEGER DEFAULT 0, "successful_deliveries" INTEGER DEFAULT 0,
    "failed_deliveries" INTEGER DEFAULT 0, "rescheduled_deliveries" INTEGER DEFAULT 0,
    "on_time_deliveries" INTEGER DEFAULT 0,
    "delivery_success_rate" DECIMAL(5,2) DEFAULT 0, "on_time_rate" DECIMAL(5,2) DEFAULT 0,
    "avg_delivery_time_hours" DECIMAL(8,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "delivery_analytics_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_da_tenant_period" UNIQUE ("tenant_id", "period")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 32: CUSTOMER RETURNS (RMA) (6 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "rma_requests" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "rma_number" TEXT NOT NULL, "rma_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "so_id" UUID, "so_number" TEXT,
    "delivery_order_id" UUID, "delivery_number" TEXT,
    "customer_id" UUID NOT NULL, "customer_code" TEXT, "customer_name" TEXT,
    "return_type" TEXT NOT NULL DEFAULT 'DAMAGE',
    "return_reason" TEXT NOT NULL, "return_reason_detail" TEXT,
    "total_qty" DECIMAL(14,3) DEFAULT 0, "total_value" DECIMAL(14,2) DEFAULT 0,
    "currency" TEXT DEFAULT 'INR',
    "is_approved" BOOLEAN DEFAULT false, "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "approval_notes" TEXT, "rejection_reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "rma_requests_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_rma_tenant_number" UNIQUE ("tenant_id", "rma_number")
);

CREATE TABLE IF NOT EXISTS "rma_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "rma_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "so_line_id" UUID, "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "uom_id" UUID, "uom_code" TEXT,
    "shipped_qty" DECIMAL(14,3) DEFAULT 0, "returned_qty" DECIMAL(14,3) NOT NULL,
    "accepted_qty" DECIMAL(14,3) DEFAULT 0, "rejected_qty" DECIMAL(14,3) DEFAULT 0,
    "batch_id" UUID, "batch_number" TEXT, "lot_id" UUID, "lot_number" TEXT,
    "unit_price" DECIMAL(14,4) NOT NULL, "line_total" DECIMAL(14,2) DEFAULT 0,
    "return_reason" TEXT, "condition" TEXT DEFAULT 'GOOD',
    "disposition" TEXT, "inspection_status" TEXT DEFAULT 'PENDING',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rma_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "return_inspections" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "rma_id" UUID NOT NULL, "rma_number" TEXT,
    "rma_line_id" UUID,
    "inspection_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspector_id" UUID, "inspector_name" TEXT,
    "received_qty" DECIMAL(14,3) NOT NULL, "accepted_qty" DECIMAL(14,3) DEFAULT 0,
    "rejected_qty" DECIMAL(14,3) DEFAULT 0, "scrap_qty" DECIMAL(14,3) DEFAULT 0,
    "repair_qty" DECIMAL(14,3) DEFAULT 0,
    "inspection_result" TEXT, "disposition" TEXT,
    "quality_hold" BOOLEAN DEFAULT false, "hold_reason" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "return_inspections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "return_inventory_movements" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "rma_id" UUID NOT NULL, "rma_number" TEXT,
    "rma_line_id" UUID, "inspection_id" UUID,
    "product_id" UUID NOT NULL, "product_sku" TEXT,
    "warehouse_id" UUID NOT NULL, "warehouse_name" TEXT,
    "bin_id" UUID, "bin_code" TEXT,
    "batch_id" UUID, "batch_number" TEXT,
    "quantity" DECIMAL(14,3) NOT NULL, "uom_code" TEXT,
    "movement_type" TEXT NOT NULL, "destination" TEXT,
    "performed_by" UUID, "performed_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "return_inventory_movements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "replacements" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "replacement_number" TEXT NOT NULL, "replacement_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rma_id" UUID NOT NULL, "rma_number" TEXT,
    "customer_id" UUID, "customer_name" TEXT,
    "original_so_id" UUID, "original_so_number" TEXT,
    "replacement_so_id" UUID, "replacement_so_number" TEXT,
    "total_qty" DECIMAL(14,3) DEFAULT 0, "total_value" DECIMAL(14,2) DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "replacements_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_repl_tenant_number" UNIQUE ("tenant_id", "replacement_number")
);

CREATE TABLE IF NOT EXISTS "refund_records" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "refund_number" TEXT NOT NULL, "refund_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rma_id" UUID NOT NULL, "rma_number" TEXT,
    "customer_id" UUID, "customer_name" TEXT,
    "original_invoice_number" TEXT,
    "refund_amount" DECIMAL(14,2) NOT NULL, "currency" TEXT DEFAULT 'INR',
    "refund_type" TEXT NOT NULL, "refund_method" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "processed_by" UUID, "processed_by_name" TEXT, "processed_at" TIMESTAMP(3),
    "reference_number" TEXT, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "refund_records_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_ref_tenant_number" UNIQUE ("tenant_id", "refund_number")
);

-- ════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS "idx_so_tenant_status" ON "sales_orders"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_so_tenant_customer" ON "sales_orders"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_so_tenant_date" ON "sales_orders"("tenant_id", "so_date");
CREATE INDEX IF NOT EXISTS "idx_sol_so" ON "sales_order_lines"("so_id");
CREATE INDEX IF NOT EXISTS "idx_sol_product" ON "sales_order_lines"("product_id");
CREATE INDEX IF NOT EXISTS "idx_soa_so" ON "sales_order_amendments"("so_id");
CREATE INDEX IF NOT EXISTS "idx_soh_so" ON "sales_order_holds"("so_id");
CREATE INDEX IF NOT EXISTS "idx_soappr_so" ON "sales_order_approvals"("so_id");
CREATE INDEX IF NOT EXISTS "idx_sohist_so" ON "sales_order_history"("so_id");
CREATE INDEX IF NOT EXISTS "idx_pl_tenant_active" ON "price_lists"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_pli_list" ON "price_list_items"("price_list_id");
CREATE INDEX IF NOT EXISTS "idx_pli_product" ON "price_list_items"("product_id");
CREATE INDEX IF NOT EXISTS "idx_cpa_customer" ON "customer_price_agreements"("customer_id");
CREATE INDEX IF NOT EXISTS "idx_promo_tenant_active" ON "promotions"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_promo_dates" ON "promotions"("start_date", "end_date");
CREATE INDEX IF NOT EXISTS "idx_coupon_tenant_code" ON "coupons"("tenant_id", "coupon_code");
CREATE INDEX IF NOT EXISTS "idx_cr_coupon" ON "coupon_redemptions"("coupon_id");
CREATE INDEX IF NOT EXISTS "idx_tax_tenant_active" ON "tax_configurations"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_ia_tenant_so" ON "inventory_allocations"("tenant_id", "so_id");
CREATE INDEX IF NOT EXISTS "idx_ia_tenant_status" ON "inventory_allocations"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_wp_tenant_status" ON "wave_plans"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_wpl_wave" ON "wave_plan_lines"("wave_id");
CREATE INDEX IF NOT EXISTS "idx_pick_tenant_status" ON "pick_lists"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_pickl_pick" ON "pick_list_lines"("pick_list_id");
CREATE INDEX IF NOT EXISTS "idx_pack_tenant_status" ON "packing_lists"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_packl_pack" ON "packing_list_lines"("packing_list_id");
CREATE INDEX IF NOT EXISTS "idx_ship_tenant_status" ON "shipments"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_ship_so" ON "shipments"("so_id");
CREATE INDEX IF NOT EXISTS "idx_do_tenant_status" ON "delivery_orders"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_pod_delivery" ON "proof_of_deliveries"("delivery_order_id");
CREATE INDEX IF NOT EXISTS "idx_de_delivery" ON "delivery_exceptions"("delivery_order_id");
CREATE INDEX IF NOT EXISTS "idx_dt_delivery" ON "delivery_tracking"("delivery_order_id");
CREATE INDEX IF NOT EXISTS "idx_rma_tenant_status" ON "rma_requests"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_rma_customer" ON "rma_requests"("customer_id");
CREATE INDEX IF NOT EXISTS "idx_rmal_rma" ON "rma_lines"("rma_id");
CREATE INDEX IF NOT EXISTS "idx_ri_rma" ON "return_inspections"("rma_id");
CREATE INDEX IF NOT EXISTS "idx_rim_rma" ON "return_inventory_movements"("rma_id");
CREATE INDEX IF NOT EXISTS "idx_repl_rma" ON "replacements"("rma_id");
CREATE INDEX IF NOT EXISTS "idx_ref_rma" ON "refund_records"("rma_id");

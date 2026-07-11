-- ════════════════════════════════════════════════════════════════════════════
-- SUOP ERP — Phase 10: Purchase Order Management
-- Migration 0011: Purchase Orders
-- ════════════════════════════════════════════════════════════════════════════
-- 12 entities:
--   1. purchase_orders                 (header)
--   2. purchase_order_lines            (line items)
--   3. purchase_order_taxes            (tax breakdown)
--   4. purchase_order_charges          (freight, insurance, other charges)
--   5. purchase_order_attachments      (file attachments)
--   6. purchase_order_terms            (payment, delivery, special terms)
--   7. purchase_order_approvals        (multi-level approval trail)
--   8. purchase_order_revisions        (revision history with snapshots)
--   9. purchase_order_history          (status change log)
--  10. purchase_order_delivery_schedules (per-line delivery schedule)
--  11. purchase_order_milestones       (project milestones for service POs)
--  12. purchase_order_communications   (supplier communication log)
-- ════════════════════════════════════════════════════════════════════════════

-- ─── 1. Purchase Order Header ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "purchase_orders" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "po_number" TEXT NOT NULL,
    "po_type" TEXT NOT NULL DEFAULT 'STANDARD', -- STANDARD, BLANKET, CONTRACT, SERVICE, SUBCONTRACTING, EMERGENCY, CONSIGNMENT, CAPITAL
    "po_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revision_no" INTEGER NOT NULL DEFAULT 0,

    -- References
    "rfq_id" UUID,
    "rfq_number" TEXT,
    "quotation_id" UUID,
    "quotation_number" TEXT,
    "pr_id" UUID,
    "pr_number" TEXT,
    "supplier_id" UUID NOT NULL,
    "supplier_code" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "supplier_gstin" TEXT,

    -- Organization
    "company_id" UUID NOT NULL,
    "company_name" TEXT NOT NULL,
    "plant_id" UUID NOT NULL,
    "plant_name" TEXT NOT NULL,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "department_id" UUID,
    "cost_center_id" UUID,

    -- Buyer
    "buyer_id" UUID,
    "buyer_name" TEXT,

    -- Delivery
    "expected_delivery_date" TIMESTAMP(3),
    "delivery_terms" TEXT,
    "delivery_location" TEXT,
    "shipping_address" TEXT,
    "billing_address" TEXT,

    -- Financial
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "exchange_rate" DECIMAL(14,6) DEFAULT 1,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discount_percent" DECIMAL(5,2) DEFAULT 0,
    "discount_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "freight_amount" DECIMAL(14,2) DEFAULT 0,
    "insurance_amount" DECIMAL(14,2) DEFAULT 0,
    "other_charges" DECIMAL(14,2) DEFAULT 0,
    "round_off" DECIMAL(14,2) DEFAULT 0,
    "grand_total" DECIMAL(14,2) NOT NULL DEFAULT 0,

    -- Terms
    "payment_terms" TEXT NOT NULL DEFAULT 'NET30',
    "payment_terms_days" INTEGER DEFAULT 30,
    "credit_period_days" INTEGER DEFAULT 30,
    "advance_percent" DECIMAL(5,2) DEFAULT 0,
    "credit_days" INTEGER DEFAULT 30,

    -- Supplier acknowledgement
    "supplier_ack_status" TEXT, -- ACCEPTED, REJECTED, COUNTER_OFFER, DATE_CHANGE_REQUESTED, QTY_CHANGE_REQUESTED
    "supplier_ack_date" TIMESTAMP(3),
    "supplier_ack_notes" TEXT,
    "supplier_ack_counter_total" DECIMAL(14,2),

    -- Receipt tracking
    "received_qty" DECIMAL(14,3) DEFAULT 0,
    "received_amount" DECIMAL(14,2) DEFAULT 0,
    "pending_qty" DECIMAL(14,3) DEFAULT 0,
    "pending_amount" DECIMAL(14,2) DEFAULT 0,
    "is_partially_received" BOOLEAN NOT NULL DEFAULT false,
    "is_fully_received" BOOLEAN NOT NULL DEFAULT false,
    "last_receipt_date" TIMESTAMP(3),

    -- Validity
    "validity_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),

    -- Status
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "rejection_reason" TEXT,
    "cancel_reason" TEXT,
    "revision_reason" TEXT,
    "approval_notes" TEXT,

    -- Notes
    "remarks" TEXT,
    "internal_notes" TEXT,
    "supplier_notes" TEXT,

    -- Attachment count
    "attachment_count" INTEGER DEFAULT 0,

    -- Reserved columns
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "uq_po_tenant_number" UNIQUE ("tenant_id", "po_number")
);

-- ─── 2. Purchase Order Lines ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "purchase_order_lines" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "po_id" UUID NOT NULL,
    "line_no" INTEGER NOT NULL,

    -- Product
    "product_id" UUID NOT NULL,
    "product_sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_description" TEXT,
    "category_id" UUID,
    "category_name" TEXT,

    -- Quantity
    "uom_id" UUID NOT NULL,
    "uom_code" TEXT NOT NULL,
    "ordered_qty" DECIMAL(14,3) NOT NULL,
    "received_qty" DECIMAL(14,3) DEFAULT 0,
    "pending_qty" DECIMAL(14,3) DEFAULT 0,
    "rejected_qty" DECIMAL(14,3) DEFAULT 0,

    -- Pricing
    "unit_price" DECIMAL(14,4) NOT NULL,
    "base_price" DECIMAL(14,4),
    "discount_percent" DECIMAL(5,2) DEFAULT 0,
    "discount_amount" DECIMAL(14,2) DEFAULT 0,
    "tax_percent" DECIMAL(5,2) DEFAULT 0,
    "tax_amount" DECIMAL(14,2) DEFAULT 0,
    "line_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',

    -- Delivery
    "expected_delivery_date" TIMESTAMP(3),
    "lead_time_days" INTEGER,
    "delivery_location" TEXT,

    -- Constraints
    "min_order_qty" DECIMAL(14,3),
    "max_order_qty" DECIMAL(14,3),
    "moq_violated" BOOLEAN DEFAULT false,

    -- References
    "rfq_line_id" UUID,
    "quotation_line_id" UUID,
    "pr_line_id" UUID,

    -- Revision
    "is_revised" BOOLEAN DEFAULT false,
    "revision_notes" TEXT,

    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_lines_pkey" PRIMARY KEY ("id")
);

-- ─── 3. Purchase Order Taxes ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "purchase_order_taxes" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "po_id" UUID NOT NULL,
    "po_line_id" UUID,
    "tax_type" TEXT NOT NULL, -- GST, CGST, SGST, IGST, VAT, CESS, CUSTOM
    "tax_name" TEXT NOT NULL,
    "tax_percent" DECIMAL(5,2) NOT NULL,
    "taxable_amount" DECIMAL(14,2) NOT NULL,
    "tax_amount" DECIMAL(14,2) NOT NULL,
    "is_recoverable" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_taxes_pkey" PRIMARY KEY ("id")
);

-- ─── 4. Purchase Order Charges ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "purchase_order_charges" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "po_id" UUID NOT NULL,
    "charge_type" TEXT NOT NULL, -- FREIGHT, INSURANCE, PACKING, LOADING, UNLOADING, OTHER
    "charge_name" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "percent" DECIMAL(5,2),
    "is_taxable" BOOLEAN DEFAULT false,
    "tax_percent" DECIMAL(5,2) DEFAULT 0,
    "tax_amount" DECIMAL(14,2) DEFAULT 0,
    "gl_account" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_charges_pkey" PRIMARY KEY ("id")
);

-- ─── 5. Purchase Order Attachments ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "purchase_order_attachments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "po_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "file_url" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL', -- PO_DOC, QUOTATION, DRAWING, SPEC, OTHER
    "uploaded_by" UUID,
    "uploaded_by_name" TEXT,
    "is_signed" BOOLEAN DEFAULT false,
    "signed_by" UUID,
    "signed_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_attachments_pkey" PRIMARY KEY ("id")
);

-- ─── 6. Purchase Order Terms ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "purchase_order_terms" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "po_id" UUID NOT NULL,
    "term_type" TEXT NOT NULL, -- PAYMENT, DELIVERY, WARRANTY, PENALTY, QUALITY, OTHER
    "term_name" TEXT NOT NULL,
    "term_description" TEXT NOT NULL,
    "term_value" TEXT,
    "is_standard" BOOLEAN DEFAULT true,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_terms_pkey" PRIMARY KEY ("id")
);

-- ─── 7. Purchase Order Approvals ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "purchase_order_approvals" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "po_id" UUID NOT NULL,
    "approval_level" TEXT NOT NULL, -- DEPARTMENT, FINANCE, MANAGEMENT
    "approval_sequence" INTEGER NOT NULL DEFAULT 1,
    "approver_id" UUID,
    "approver_name" TEXT,
    "approver_role" TEXT,
    "approval_status" TEXT NOT NULL, -- PENDING, APPROVED, REJECTED, RETURNED
    "approval_date" TIMESTAMP(3),
    "approval_notes" TEXT,
    "rejection_reason" TEXT,
    "approved_amount" DECIMAL(14,2),
    "is_current" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_approvals_pkey" PRIMARY KEY ("id")
);

-- ─── 8. Purchase Order Revisions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "purchase_order_revisions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "po_id" UUID NOT NULL,
    "revision_no" INTEGER NOT NULL,
    "revision_reason" TEXT NOT NULL,
    "previous_snapshot" JSONB NOT NULL,
    "new_snapshot" JSONB,
    "changed_fields" TEXT[],
    "revised_by" UUID,
    "revised_by_name" TEXT,
    "revision_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approval_required" BOOLEAN DEFAULT true,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_revisions_pkey" PRIMARY KEY ("id")
);

-- ─── 9. Purchase Order History ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "purchase_order_history" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "po_id" UUID NOT NULL,
    "action" TEXT NOT NULL, -- CREATE, UPDATE, SUBMIT, APPROVE, REJECT, ISSUE, CANCEL, SUPPLIER_ACK, RECEIVE, CLOSE, REVISION
    "from_status" TEXT,
    "to_status" TEXT,
    "action_by" UUID,
    "action_by_name" TEXT,
    "action_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action_notes" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "correlation_id" TEXT,

    CONSTRAINT "purchase_order_history_pkey" PRIMARY KEY ("id")
);

-- ─── 10. Purchase Order Delivery Schedule ──────────────────────────────────
CREATE TABLE IF NOT EXISTS "purchase_order_delivery_schedules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "po_id" UUID NOT NULL,
    "po_line_id" UUID NOT NULL,
    "delivery_no" INTEGER NOT NULL DEFAULT 1,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "scheduled_qty" DECIMAL(14,3) NOT NULL,
    "received_qty" DECIMAL(14,3) DEFAULT 0,
    "warehouse_id" UUID,
    "warehouse_name" TEXT,
    "delivery_status" TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, PARTIAL, COMPLETED, DELAYED
    "actual_date" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_delivery_schedules_pkey" PRIMARY KEY ("id")
);

-- ─── 11. Purchase Order Milestones ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "purchase_order_milestones" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "po_id" UUID NOT NULL,
    "milestone_no" INTEGER NOT NULL,
    "milestone_name" TEXT NOT NULL,
    "milestone_description" TEXT,
    "milestone_date" TIMESTAMP(3),
    "milestone_amount" DECIMAL(14,2),
    "milestone_status" TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, DELAYED, CANCELLED
    "completed_date" TIMESTAMP(3),
    "completed_by" UUID,
    "completion_notes" TEXT,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_milestones_pkey" PRIMARY KEY ("id")
);

-- ─── 12. Purchase Order Communications ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS "purchase_order_communications" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "po_id" UUID NOT NULL,
    "direction" TEXT NOT NULL, -- INBOUND, OUTBOUND
    "channel" TEXT NOT NULL, -- EMAIL, PORTAL, PHONE, MEETING, OTHER
    "from_address" TEXT,
    "to_address" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "communication_type" TEXT, -- ACKNOWLEDGEMENT, REVISION_REQUEST, QUERY, RESPONSE, NOTIFICATION
    "is_important" BOOLEAN DEFAULT false,
    "sent_by" UUID,
    "sent_by_name" TEXT,
    "sent_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attachments" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_communications_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════════════════════

-- Purchase Orders
CREATE INDEX IF NOT EXISTS "idx_po_tenant_status" ON "purchase_orders"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_po_tenant_supplier" ON "purchase_orders"("tenant_id", "supplier_id");
CREATE INDEX IF NOT EXISTS "idx_po_tenant_plant" ON "purchase_orders"("tenant_id", "plant_id");
CREATE INDEX IF NOT EXISTS "idx_po_tenant_date" ON "purchase_orders"("tenant_id", "po_date");
CREATE INDEX IF NOT EXISTS "idx_po_tenant_type" ON "purchase_orders"("tenant_id", "po_type");
CREATE INDEX IF NOT EXISTS "idx_po_tenant_quotation" ON "purchase_orders"("tenant_id", "quotation_id");
CREATE INDEX IF NOT EXISTS "idx_po_tenant_rfq" ON "purchase_orders"("tenant_id", "rfq_id");
CREATE INDEX IF NOT EXISTS "idx_po_tenant_pr" ON "purchase_orders"("tenant_id", "pr_id");
CREATE INDEX IF NOT EXISTS "idx_po_tenant_expected_delivery" ON "purchase_orders"("tenant_id", "expected_delivery_date");
CREATE INDEX IF NOT EXISTS "idx_po_tenant_ack_status" ON "purchase_orders"("tenant_id", "supplier_ack_status");
CREATE INDEX IF NOT EXISTS "idx_po_deleted_at" ON "purchase_orders"("deleted_at");

-- Lines
CREATE INDEX IF NOT EXISTS "idx_pol_po" ON "purchase_order_lines"("po_id");
CREATE INDEX IF NOT EXISTS "idx_pol_product" ON "purchase_order_lines"("product_id");
CREATE INDEX IF NOT EXISTS "idx_pol_tenant_product" ON "purchase_order_lines"("tenant_id", "product_id");

-- Taxes
CREATE INDEX IF NOT EXISTS "idx_pot_po" ON "purchase_order_taxes"("po_id");
CREATE INDEX IF NOT EXISTS "idx_pot_po_line" ON "purchase_order_taxes"("po_line_id");

-- Charges
CREATE INDEX IF NOT EXISTS "idx_poc_po" ON "purchase_order_charges"("po_id");

-- Attachments
CREATE INDEX IF NOT EXISTS "idx_poa_po" ON "purchase_order_attachments"("po_id");

-- Terms
CREATE INDEX IF NOT EXISTS "idx_poterms_po" ON "purchase_order_terms"("po_id");

-- Approvals
CREATE INDEX IF NOT EXISTS "idx_poappr_po" ON "purchase_order_approvals"("po_id");
CREATE INDEX IF NOT EXISTS "idx_poappr_status" ON "purchase_order_approvals"("approval_status");

-- Revisions
CREATE INDEX IF NOT EXISTS "idx_porev_po" ON "purchase_order_revisions"("po_id");

-- History
CREATE INDEX IF NOT EXISTS "idx_pohist_po" ON "purchase_order_history"("po_id");
CREATE INDEX IF NOT EXISTS "idx_pohist_action" ON "purchase_order_history"("action");

-- Delivery Schedule
CREATE INDEX IF NOT EXISTS "idx_pods_po" ON "purchase_order_delivery_schedules"("po_id");
CREATE INDEX IF NOT EXISTS "idx_pods_po_line" ON "purchase_order_delivery_schedules"("po_line_id");
CREATE INDEX IF NOT EXISTS "idx_pods_scheduled_date" ON "purchase_order_delivery_schedules"("scheduled_date");

-- Milestones
CREATE INDEX IF NOT EXISTS "idx_pom_po" ON "purchase_order_milestones"("po_id");

-- Communications
CREATE INDEX IF NOT EXISTS "idx_pocom_po" ON "purchase_order_communications"("po_id");
CREATE INDEX IF NOT EXISTS "idx_pocom_sent_date" ON "purchase_order_communications"("sent_date");

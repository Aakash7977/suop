-- ════════════════════════════════════════════════════════════════════════════
-- SUOP ERP — Phases 33-38: Enterprise Finance & Costing Domain
-- Migration 0016: Finance (6 phases, ~45 tables)
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 33: FINANCIAL FOUNDATION (10 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "chart_of_accounts" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "account_code" TEXT NOT NULL, "account_name" TEXT NOT NULL,
    "account_type" TEXT NOT NULL, "account_subtype" TEXT,
    "parent_account_id" UUID, "level" INTEGER DEFAULT 1,
    "is_active" BOOLEAN DEFAULT true, "is_postable" BOOLEAN DEFAULT true,
    "opening_balance" DECIMAL(18,2) DEFAULT 0, "current_balance" DECIMAL(18,2) DEFAULT 0,
    "currency" TEXT DEFAULT 'INR', "cost_center_required" BOOLEAN DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_coa_tenant_code" UNIQUE ("tenant_id", "account_code")
);

CREATE TABLE IF NOT EXISTS "fiscal_years" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "fiscal_year" TEXT NOT NULL, "start_date" DATE NOT NULL, "end_date" DATE NOT NULL,
    "is_current" BOOLEAN DEFAULT false, "is_closed" BOOLEAN DEFAULT false,
    "closed_at" TIMESTAMP(3), "closed_by" UUID, "closed_by_name" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "fiscal_years_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_fy_tenant_year" UNIQUE ("tenant_id", "fiscal_year")
);

CREATE TABLE IF NOT EXISTS "fiscal_periods" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "fiscal_year_id" UUID NOT NULL, "fiscal_year" TEXT,
    "period_number" INTEGER NOT NULL, "period_name" TEXT NOT NULL,
    "start_date" DATE NOT NULL, "end_date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "is_adjustment_period" BOOLEAN DEFAULT false,
    "closed_at" TIMESTAMP(3), "closed_by" UUID, "closed_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fiscal_periods_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_fp_tenant_year_period" UNIQUE ("tenant_id", "fiscal_year", "period_number")
);

CREATE TABLE IF NOT EXISTS "cost_centers" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "cc_code" TEXT NOT NULL, "cc_name" TEXT NOT NULL,
    "parent_cc_id" UUID, "company_id" UUID, "company_name" TEXT,
    "plant_id" UUID, "plant_name" TEXT, "department_id" UUID,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_cc_tenant_code" UNIQUE ("tenant_id", "cc_code")
);

CREATE TABLE IF NOT EXISTS "profit_centers" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "pc_code" TEXT NOT NULL, "pc_name" TEXT NOT NULL,
    "parent_pc_id" UUID, "company_id" UUID, "company_name" TEXT,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "profit_centers_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_pc_tenant_code" UNIQUE ("tenant_id", "pc_code")
);

CREATE TABLE IF NOT EXISTS "currencies" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "currency_code" TEXT NOT NULL, "currency_name" TEXT NOT NULL,
    "symbol" TEXT, "decimal_places" INTEGER DEFAULT 2,
    "is_base_currency" BOOLEAN DEFAULT false, "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_curr_tenant_code" UNIQUE ("tenant_id", "currency_code")
);

CREATE TABLE IF NOT EXISTS "exchange_rates" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "from_currency" TEXT NOT NULL, "to_currency" TEXT NOT NULL,
    "rate" DECIMAL(18,8) NOT NULL, "rate_date" DATE NOT NULL,
    "rate_type" TEXT DEFAULT 'DAILY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_er_tenant_from_to_date" UNIQUE ("tenant_id", "from_currency", "to_currency", "rate_date")
);

CREATE TABLE IF NOT EXISTS "financial_dimensions" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "dimension_code" TEXT NOT NULL, "dimension_name" TEXT NOT NULL,
    "dimension_type" TEXT, "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
    CONSTRAINT "financial_dimensions_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_fd_tenant_code" UNIQUE ("tenant_id", "dimension_code")
);

CREATE TABLE IF NOT EXISTS "dimension_values" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "dimension_id" UUID NOT NULL, "dimension_code" TEXT,
    "value_code" TEXT NOT NULL, "value_name" TEXT NOT NULL,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dimension_values_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_dv_tenant_dim_value" UNIQUE ("tenant_id", "dimension_id", "value_code")
);

CREATE TABLE IF NOT EXISTS "journal_templates" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "template_code" TEXT NOT NULL, "template_name" TEXT NOT NULL,
    "template_type" TEXT, "is_recurring" BOOLEAN DEFAULT false,
    "recurring_frequency" TEXT, "description" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "journal_templates_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_jt_tenant_code" UNIQUE ("tenant_id", "template_code")
);

CREATE TABLE IF NOT EXISTS "journal_template_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "template_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "account_id" UUID, "account_code" TEXT, "account_name" TEXT,
    "debit_percent" DECIMAL(5,2) DEFAULT 0, "credit_percent" DECIMAL(5,2) DEFAULT 0,
    "cost_center_id" UUID, "cost_center_code" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "journal_template_lines_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 34: ACCOUNTS PAYABLE (7 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "supplier_invoices" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "invoice_number" TEXT NOT NULL, "invoice_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplier_id" UUID NOT NULL, "supplier_code" TEXT, "supplier_name" TEXT,
    "supplier_gstin" TEXT, "supplier_invoice_number" TEXT, "supplier_invoice_date" DATE,
    "po_id" UUID, "po_number" TEXT, "grn_id" UUID, "grn_number" TEXT,
    "company_id" UUID, "company_name" TEXT,
    "subtotal" DECIMAL(18,2) NOT NULL DEFAULT 0, "discount_amount" DECIMAL(18,2) DEFAULT 0,
    "taxable_amount" DECIMAL(18,2) DEFAULT 0, "cgst_amount" DECIMAL(18,2) DEFAULT 0,
    "sgst_amount" DECIMAL(18,2) DEFAULT 0, "igst_amount" DECIMAL(18,2) DEFAULT 0,
    "cess_amount" DECIMAL(18,2) DEFAULT 0, "other_charges" DECIMAL(18,2) DEFAULT 0,
    "round_off" DECIMAL(18,2) DEFAULT 0, "grand_total" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "currency" TEXT DEFAULT 'INR', "exchange_rate" DECIMAL(18,8) DEFAULT 1,
    "payment_terms" TEXT, "payment_due_date" DATE,
    "tds_amount" DECIMAL(18,2) DEFAULT 0, "tds_section" TEXT,
    "matched_status" TEXT DEFAULT 'UNMATCHED', "match_variance" DECIMAL(18,2) DEFAULT 0,
    "approval_status" TEXT DEFAULT 'PENDING',
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "posted_to_gl" BOOLEAN DEFAULT false, "gl_posted_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "rejection_reason" TEXT, "remarks" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "supplier_invoices_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_si_tenant_number" UNIQUE ("tenant_id", "invoice_number")
);

CREATE TABLE IF NOT EXISTS "supplier_invoice_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "po_line_id" UUID, "grn_line_id" UUID,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "hsn_code" TEXT, "uom_code" TEXT,
    "ordered_qty" DECIMAL(14,3) DEFAULT 0, "received_qty" DECIMAL(14,3) DEFAULT 0,
    "invoiced_qty" DECIMAL(14,3) NOT NULL, "unit_price" DECIMAL(18,4) NOT NULL,
    "line_amount" DECIMAL(18,2) NOT NULL DEFAULT 0, "discount_amount" DECIMAL(18,2) DEFAULT 0,
    "taxable_amount" DECIMAL(18,2) DEFAULT 0, "tax_percent" DECIMAL(5,2) DEFAULT 0,
    "cgst_percent" DECIMAL(5,2) DEFAULT 0, "cgst_amount" DECIMAL(18,2) DEFAULT 0,
    "sgst_percent" DECIMAL(5,2) DEFAULT 0, "sgst_amount" DECIMAL(18,2) DEFAULT 0,
    "igst_percent" DECIMAL(5,2) DEFAULT 0, "igst_amount" DECIMAL(18,2) DEFAULT 0,
    "line_total" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "match_status" TEXT DEFAULT 'UNMATCHED', "match_variance" DECIMAL(18,2) DEFAULT 0,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "supplier_invoice_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "payments" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "payment_number" TEXT NOT NULL, "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_type" TEXT NOT NULL DEFAULT 'SUPPLIER_PAYMENT',
    "supplier_id" UUID, "supplier_code" TEXT, "supplier_name" TEXT,
    "customer_id" UUID, "customer_code" TEXT, "customer_name" TEXT,
    "payment_method" TEXT NOT NULL, "payment_mode" TEXT,
    "bank_account_id" UUID, "bank_name" TEXT, "cheque_number" TEXT, "cheque_date" DATE,
    "utr_number" TEXT, "transaction_reference" TEXT,
    "payment_amount" DECIMAL(18,2) NOT NULL, "currency" TEXT DEFAULT 'INR',
    "tds_amount" DECIMAL(18,2) DEFAULT 0, "discount_amount" DECIMAL(18,2) DEFAULT 0,
    "net_amount" DECIMAL(18,2) NOT NULL,
    "payment_run_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "posted_to_gl" BOOLEAN DEFAULT false,
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_pay_tenant_number" UNIQUE ("tenant_id", "payment_number")
);

CREATE TABLE IF NOT EXISTS "payment_applications" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "payment_id" UUID NOT NULL, "payment_number" TEXT,
    "invoice_id" UUID, "invoice_number" TEXT, "invoice_type" TEXT,
    "applied_amount" DECIMAL(18,2) NOT NULL,
    "discount_amount" DECIMAL(18,2) DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_applications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "payment_runs" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "run_number" TEXT NOT NULL, "run_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_date" DATE NOT NULL, "bank_account_id" UUID, "bank_name" TEXT,
    "total_invoices" INTEGER DEFAULT 0, "total_amount" DECIMAL(18,2) DEFAULT 0,
    "total_payments" INTEGER DEFAULT 0, "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "approved_by" UUID, "approved_by_name" TEXT, "approved_at" TIMESTAMP(3),
    "executed_at" TIMESTAMP(3), "version" INTEGER NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "payment_runs_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_pr_tenant_number" UNIQUE ("tenant_id", "run_number")
);

CREATE TABLE IF NOT EXISTS "ap_credit_notes" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "credit_note_number" TEXT NOT NULL, "credit_note_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplier_id" UUID NOT NULL, "supplier_code" TEXT, "supplier_name" TEXT,
    "supplier_invoice_id" UUID, "supplier_invoice_number" TEXT,
    "credit_reason" TEXT NOT NULL, "credit_amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT DEFAULT 'INR', "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "posted_to_gl" BOOLEAN DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "ap_credit_notes_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_apcn_tenant_number" UNIQUE ("tenant_id", "credit_note_number")
);

CREATE TABLE IF NOT EXISTS "ap_aging" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "as_of_date" DATE NOT NULL,
    "supplier_id" UUID, "supplier_code" TEXT, "supplier_name" TEXT,
    "current_amount" DECIMAL(18,2) DEFAULT 0,
    "days_1_30" DECIMAL(18,2) DEFAULT 0,
    "days_31_60" DECIMAL(18,2) DEFAULT 0,
    "days_61_90" DECIMAL(18,2) DEFAULT 0,
    "days_91_180" DECIMAL(18,2) DEFAULT 0,
    "days_180_plus" DECIMAL(18,2) DEFAULT 0,
    "total_outstanding" DECIMAL(18,2) DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ap_aging_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 35: ACCOUNTS RECEIVABLE (6 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "customer_invoices" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "invoice_number" TEXT NOT NULL, "invoice_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" UUID NOT NULL, "customer_code" TEXT, "customer_name" TEXT,
    "customer_gstin" TEXT, "so_id" UUID, "so_number" TEXT,
    "delivery_id" UUID, "delivery_number" TEXT, "shipment_id" UUID, "shipment_number" TEXT,
    "company_id" UUID, "company_name" TEXT,
    "subtotal" DECIMAL(18,2) NOT NULL DEFAULT 0, "discount_amount" DECIMAL(18,2) DEFAULT 0,
    "taxable_amount" DECIMAL(18,2) DEFAULT 0, "cgst_amount" DECIMAL(18,2) DEFAULT 0,
    "sgst_amount" DECIMAL(18,2) DEFAULT 0, "igst_amount" DECIMAL(18,2) DEFAULT 0,
    "cess_amount" DECIMAL(18,2) DEFAULT 0, "other_charges" DECIMAL(18,2) DEFAULT 0,
    "round_off" DECIMAL(18,2) DEFAULT 0, "grand_total" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "currency" TEXT DEFAULT 'INR', "exchange_rate" DECIMAL(18,8) DEFAULT 1,
    "payment_terms" TEXT, "payment_due_date" DATE,
    "credit_limit" DECIMAL(18,2), "credit_used" DECIMAL(18,2), "credit_available" DECIMAL(18,2),
    "posted_to_gl" BOOLEAN DEFAULT false, "gl_posted_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "rejection_reason" TEXT, "remarks" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "customer_invoices_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_ci_tenant_number" UNIQUE ("tenant_id", "invoice_number")
);

CREATE TABLE IF NOT EXISTS "customer_invoice_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "so_line_id" UUID, "delivery_line_id" UUID,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "hsn_code" TEXT, "uom_code" TEXT,
    "shipped_qty" DECIMAL(14,3) DEFAULT 0, "invoiced_qty" DECIMAL(14,3) NOT NULL,
    "unit_price" DECIMAL(18,4) NOT NULL, "line_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(18,2) DEFAULT 0, "taxable_amount" DECIMAL(18,2) DEFAULT 0,
    "tax_percent" DECIMAL(5,2) DEFAULT 0, "cgst_amount" DECIMAL(18,2) DEFAULT 0,
    "sgst_amount" DECIMAL(18,2) DEFAULT 0, "igst_amount" DECIMAL(18,2) DEFAULT 0,
    "line_total" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "batch_number" TEXT, "lot_number" TEXT,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "customer_invoice_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "receipts" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "receipt_number" TEXT NOT NULL, "receipt_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" UUID, "customer_code" TEXT, "customer_name" TEXT,
    "receipt_method" TEXT NOT NULL, "receipt_mode" TEXT,
    "bank_account_id" UUID, "bank_name" TEXT,
    "transaction_reference" TEXT, "utr_number" TEXT,
    "receipt_amount" DECIMAL(18,2) NOT NULL, "currency" TEXT DEFAULT 'INR',
    "discount_amount" DECIMAL(18,2) DEFAULT 0, "net_amount" DECIMAL(18,2) NOT NULL,
    "posted_to_gl" BOOLEAN DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_rec_tenant_number" UNIQUE ("tenant_id", "receipt_number")
);

CREATE TABLE IF NOT EXISTS "receipt_applications" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "receipt_id" UUID NOT NULL, "receipt_number" TEXT,
    "invoice_id" UUID, "invoice_number" TEXT,
    "applied_amount" DECIMAL(18,2) NOT NULL,
    "discount_amount" DECIMAL(18,2) DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "receipt_applications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ar_credit_notes" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "credit_note_number" TEXT NOT NULL, "credit_note_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" UUID NOT NULL, "customer_code" TEXT, "customer_name" TEXT,
    "customer_invoice_id" UUID, "customer_invoice_number" TEXT,
    "credit_reason" TEXT NOT NULL, "credit_amount" DECIMAL(18,2) NOT NULL,
    "currency" TEXT DEFAULT 'INR', "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "posted_to_gl" BOOLEAN DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "ar_credit_notes_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_arcn_tenant_number" UNIQUE ("tenant_id", "credit_note_number")
);

CREATE TABLE IF NOT EXISTS "ar_aging" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "as_of_date" DATE NOT NULL,
    "customer_id" UUID, "customer_code" TEXT, "customer_name" TEXT,
    "current_amount" DECIMAL(18,2) DEFAULT 0,
    "days_1_30" DECIMAL(18,2) DEFAULT 0,
    "days_31_60" DECIMAL(18,2) DEFAULT 0,
    "days_61_90" DECIMAL(18,2) DEFAULT 0,
    "days_91_180" DECIMAL(18,2) DEFAULT 0,
    "days_180_plus" DECIMAL(18,2) DEFAULT 0,
    "total_outstanding" DECIMAL(18,2) DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ar_aging_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 36: PRODUCT COSTING (6 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "product_costs" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL, "product_sku" TEXT, "product_name" TEXT,
    "cost_type" TEXT NOT NULL DEFAULT 'STANDARD',
    "material_cost" DECIMAL(18,4) DEFAULT 0, "labor_cost" DECIMAL(18,4) DEFAULT 0,
    "machine_cost" DECIMAL(18,4) DEFAULT 0, "overhead_cost" DECIMAL(18,4) DEFAULT 0,
    "subcontract_cost" DECIMAL(18,4) DEFAULT 0, "freight_cost" DECIMAL(18,4) DEFAULT 0,
    "total_cost" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "currency" TEXT DEFAULT 'INR',
    "effective_from" DATE NOT NULL, "effective_to" DATE,
    "is_active" BOOLEAN DEFAULT true,
    "costing_method" TEXT DEFAULT 'STANDARD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "product_costs_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_pc_tenant_product_type_dates" UNIQUE ("tenant_id", "product_id", "cost_type", "effective_from")
);

CREATE TABLE IF NOT EXISTS "cost_rollups" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "rollup_number" TEXT NOT NULL, "rollup_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipe_id" UUID, "recipe_code" TEXT, "recipe_name" TEXT,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "batch_size" DECIMAL(14,3), "uom_code" TEXT,
    "material_cost" DECIMAL(18,4) DEFAULT 0, "labor_cost" DECIMAL(18,4) DEFAULT 0,
    "machine_cost" DECIMAL(18,4) DEFAULT 0, "overhead_cost" DECIMAL(18,4) DEFAULT 0,
    "total_cost" DECIMAL(18,4) NOT NULL DEFAULT 0, "unit_cost" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "currency" TEXT DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "cost_rollups_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_cr_tenant_number" UNIQUE ("tenant_id", "rollup_number")
);

CREATE TABLE IF NOT EXISTS "cost_rollup_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "rollup_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "cost_element" TEXT NOT NULL,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "quantity" DECIMAL(14,4), "uom_code" TEXT,
    "unit_cost" DECIMAL(18,4) DEFAULT 0, "total_cost" DECIMAL(18,4) DEFAULT 0,
    "cost_source" TEXT, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cost_rollup_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "cost_variances" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "variance_number" TEXT NOT NULL, "variance_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "production_order_id" UUID, "production_order_number" TEXT,
    "batch_id" UUID, "batch_number" TEXT,
    "variance_type" TEXT NOT NULL,
    "standard_cost" DECIMAL(18,4) NOT NULL, "actual_cost" DECIMAL(18,4) NOT NULL,
    "variance_amount" DECIMAL(18,4) NOT NULL, "variance_percent" DECIMAL(5,2) DEFAULT 0,
    "currency" TEXT DEFAULT 'INR',
    "posted_to_gl" BOOLEAN DEFAULT false,
    "analysis" TEXT, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cost_variances_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_cv_tenant_number" UNIQUE ("tenant_id", "variance_number")
);

CREATE TABLE IF NOT EXISTS "batch_costs" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL, "batch_number" TEXT,
    "production_order_id" UUID, "production_order_number" TEXT,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "quantity" DECIMAL(14,3), "uom_code" TEXT,
    "material_cost" DECIMAL(18,4) DEFAULT 0, "labor_cost" DECIMAL(18,4) DEFAULT 0,
    "machine_cost" DECIMAL(18,4) DEFAULT 0, "overhead_cost" DECIMAL(18,4) DEFAULT 0,
    "scrap_cost" DECIMAL(18,4) DEFAULT 0, "rework_cost" DECIMAL(18,4) DEFAULT 0,
    "total_cost" DECIMAL(18,4) NOT NULL DEFAULT 0, "unit_cost" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "currency" TEXT DEFAULT 'INR',
    "posted_to_gl" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "batch_costs_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_bc_tenant_batch" UNIQUE ("tenant_id", "batch_id")
);

CREATE TABLE IF NOT EXISTS "inventory_valuations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "valuation_date" DATE NOT NULL,
    "product_id" UUID, "product_sku" TEXT, "product_name" TEXT,
    "warehouse_id" UUID, "warehouse_name" TEXT,
    "quantity" DECIMAL(14,3) NOT NULL, "uom_code" TEXT,
    "unit_cost" DECIMAL(18,4) NOT NULL, "total_value" DECIMAL(18,2) NOT NULL,
    "valuation_method" TEXT DEFAULT 'MOVING_AVERAGE',
    "currency" TEXT DEFAULT 'INR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_valuations_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 37: GENERAL LEDGER (7 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "journal_entries" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "je_number" TEXT NOT NULL, "je_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fiscal_year" TEXT, "period_number" INTEGER,
    "je_type" TEXT, "source_type" TEXT, "source_id" UUID, "source_number" TEXT,
    "description" TEXT, "reference_number" TEXT,
    "total_debit" DECIMAL(18,2) NOT NULL DEFAULT 0, "total_credit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "is_balanced" BOOLEAN DEFAULT false, "is_posted" BOOLEAN DEFAULT false,
    "posted_at" TIMESTAMP(3), "posted_by" UUID, "posted_by_name" TEXT,
    "is_reversed" BOOLEAN DEFAULT false, "reversal_je_id" UUID,
    "is_recurring" BOOLEAN DEFAULT false, "recurring_frequency" TEXT,
    "is_immutable" BOOLEAN DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_je_tenant_number" UNIQUE ("tenant_id", "je_number")
);

CREATE TABLE IF NOT EXISTS "journal_entry_lines" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "je_id" UUID NOT NULL, "line_no" INTEGER NOT NULL,
    "account_id" UUID, "account_code" TEXT, "account_name" TEXT,
    "cost_center_id" UUID, "cost_center_code" TEXT,
    "profit_center_id" UUID, "profit_center_code" TEXT,
    "debit_amount" DECIMAL(18,2) DEFAULT 0, "credit_amount" DECIMAL(18,2) DEFAULT 0,
    "currency" TEXT DEFAULT 'INR', "exchange_rate" DECIMAL(18,8) DEFAULT 1,
    "description" TEXT, "reference_type" TEXT, "reference_id" UUID, "reference_number" TEXT,
    "is_immutable" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "journal_entry_lines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "gl_postings" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "posting_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "je_id" UUID, "je_number" TEXT, "je_line_id" UUID,
    "account_id" UUID, "account_code" TEXT,
    "fiscal_year" TEXT, "period_number" INTEGER,
    "debit_amount" DECIMAL(18,2) DEFAULT 0, "credit_amount" DECIMAL(18,2) DEFAULT 0,
    "balance" DECIMAL(18,2) DEFAULT 0,
    "source_type" TEXT, "source_id" UUID, "source_number" TEXT,
    "is_immutable" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gl_postings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "trial_balances" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "as_of_date" DATE NOT NULL, "fiscal_year" TEXT, "period_number" INTEGER,
    "account_id" UUID, "account_code" TEXT, "account_name" TEXT,
    "account_type" TEXT,
    "opening_balance" DECIMAL(18,2) DEFAULT 0,
    "total_debit" DECIMAL(18,2) DEFAULT 0, "total_credit" DECIMAL(18,2) DEFAULT 0,
    "closing_balance" DECIMAL(18,2) DEFAULT 0,
    "currency" TEXT DEFAULT 'INR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "trial_balances_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "financial_statements" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "statement_type" TEXT NOT NULL, "statement_date" DATE NOT NULL,
    "fiscal_year" TEXT, "period_number" INTEGER,
    "account_id" UUID, "account_code" TEXT, "account_name" TEXT,
    "account_type" TEXT, "line_item" TEXT,
    "amount" DECIMAL(18,2) DEFAULT 0, "currency" TEXT DEFAULT 'INR',
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "financial_statements_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "opening_balances" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "fiscal_year" TEXT NOT NULL,
    "account_id" UUID, "account_code" TEXT, "account_name" TEXT,
    "opening_debit" DECIMAL(18,2) DEFAULT 0, "opening_credit" DECIMAL(18,2) DEFAULT 0,
    "currency" TEXT DEFAULT 'INR',
    "is_posted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "opening_balances_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "period_closes" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "fiscal_year" TEXT NOT NULL, "period_number" INTEGER NOT NULL,
    "close_type" TEXT NOT NULL, "close_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "total_debit" DECIMAL(18,2) DEFAULT 0, "total_credit" DECIMAL(18,2) DEFAULT 0,
    "is_balanced" BOOLEAN DEFAULT false,
    "closed_by" UUID, "closed_by_name" TEXT, "closed_at" TIMESTAMP(3),
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "period_closes_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_pclose_tenant_year_period" UNIQUE ("tenant_id", "fiscal_year", "period_number")
);

-- ════════════════════════════════════════════════════════════════════════════
-- PHASE 38: GST / TAXATION (6 tables)
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "gst_configurations" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "hsn_code" TEXT NOT NULL, "hsn_description" TEXT,
    "sac_code" TEXT, "sac_description" TEXT,
    "product_id" UUID, "product_sku" TEXT,
    "supply_type" TEXT DEFAULT 'GOODS',
    "cgst_rate" DECIMAL(5,2) DEFAULT 0, "sgst_rate" DECIMAL(5,2) DEFAULT 0,
    "igst_rate" DECIMAL(5,2) DEFAULT 0, "cess_rate" DECIMAL(5,2) DEFAULT 0,
    "total_gst_rate" DECIMAL(5,2) DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "effective_from" DATE, "effective_to" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "gst_configurations_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_gstc_tenant_hsn" UNIQUE ("tenant_id", "hsn_code")
);

CREATE TABLE IF NOT EXISTS "tax_rules" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "rule_code" TEXT NOT NULL, "rule_name" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL, "transaction_type" TEXT,
    "from_state" TEXT, "to_state" TEXT,
    "is_interstate" BOOLEAN DEFAULT false,
    "cgst_rate" DECIMAL(5,2) DEFAULT 0, "sgst_rate" DECIMAL(5,2) DEFAULT 0,
    "igst_rate" DECIMAL(5,2) DEFAULT 0, "cess_rate" DECIMAL(5,2) DEFAULT 0,
    "is_reverse_charge" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true, "description" TEXT,
    "effective_from" DATE, "effective_to" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "tax_rules_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_tr_tenant_code" UNIQUE ("tenant_id", "rule_code")
);

CREATE TABLE IF NOT EXISTS "e_invoices" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "irn" TEXT, "ack_no" TEXT, "ack_date" TIMESTAMP(3),
    "invoice_id" UUID, "invoice_number" TEXT, "invoice_type" TEXT,
    "customer_gstin" TEXT, "supplier_gstin" TEXT,
    "invoice_value" DECIMAL(18,2), "taxable_value" DECIMAL(18,2),
    "cgst_amount" DECIMAL(18,2) DEFAULT 0, "sgst_amount" DECIMAL(18,2) DEFAULT 0,
    "igst_amount" DECIMAL(18,2) DEFAULT 0, "cess_amount" DECIMAL(18,2) DEFAULT 0,
    "total_tax" DECIMAL(18,2) DEFAULT 0,
    "qr_code" TEXT, "signed_invoice" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "cancelled_at" TIMESTAMP(3), "cancel_reason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "e_invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "e_way_bills" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "eway_bill_number" TEXT, "eway_bill_date" TIMESTAMP(3),
    "invoice_id" UUID, "invoice_number" TEXT, "invoice_type" TEXT,
    "shipment_id" UUID, "shipment_number" TEXT,
    "from_gstin" TEXT, "to_gstin" TEXT,
    "from_place" TEXT, "to_place" TEXT,
    "transport_mode" TEXT, "transport_distance" INTEGER,
    "transporter_id" TEXT, "transporter_name" TEXT,
    "vehicle_number" TEXT, "lr_number" TEXT,
    "supply_type" TEXT, "sub_supply_type" TEXT,
    "document_type" TEXT, "document_number" TEXT,
    "total_value" DECIMAL(18,2), "taxable_value" DECIMAL(18,2),
    "cgst_amount" DECIMAL(18,2) DEFAULT 0, "sgst_amount" DECIMAL(18,2) DEFAULT 0,
    "igst_amount" DECIMAL(18,2) DEFAULT 0, "cess_amount" DECIMAL(18,2) DEFAULT 0,
    "valid_until" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "cancelled_at" TIMESTAMP(3), "cancel_reason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "e_way_bills_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tax_returns" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "return_type" TEXT NOT NULL, "return_period" TEXT NOT NULL,
    "fiscal_year" TEXT, "return_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "output_tax_amount" DECIMAL(18,2) DEFAULT 0,
    "input_tax_amount" DECIMAL(18,2) DEFAULT 0,
    "net_tax_payable" DECIMAL(18,2) DEFAULT 0,
    "itc_claimed" DECIMAL(18,2) DEFAULT 0,
    "itc_reversed" DECIMAL(18,2) DEFAULT 0,
    "late_fee" DECIMAL(18,2) DEFAULT 0, "interest" DECIMAL(18,2) DEFAULT 0,
    "total_amount_payable" DECIMAL(18,2) DEFAULT 0,
    "is_filed" BOOLEAN DEFAULT false, "filed_date" TIMESTAMP(3),
    "filing_reference" TEXT, "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 0, "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3), "created_by" UUID, "updated_by" UUID,
    CONSTRAINT "tax_returns_pkey" PRIMARY KEY ("id"), CONSTRAINT "uq_tr_tenant_type_period" UNIQUE ("tenant_id", "return_type", "return_period")
);

CREATE TABLE IF NOT EXISTS "tax_registers" (
    "id" UUID NOT NULL, "tenant_id" UUID NOT NULL,
    "register_type" TEXT NOT NULL, "register_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "return_period" TEXT,
    "invoice_id" UUID, "invoice_number" TEXT, "invoice_type" TEXT,
    "invoice_date" TIMESTAMP(3), "party_gstin" TEXT, "party_name" TEXT,
    "supply_type" TEXT, "is_interstate" BOOLEAN DEFAULT false,
    "taxable_value" DECIMAL(18,2) DEFAULT 0,
    "cgst_amount" DECIMAL(18,2) DEFAULT 0, "sgst_amount" DECIMAL(18,2) DEFAULT 0,
    "igst_amount" DECIMAL(18,2) DEFAULT 0, "cess_amount" DECIMAL(18,2) DEFAULT 0,
    "total_tax" DECIMAL(18,2) DEFAULT 0, "invoice_value" DECIMAL(18,2) DEFAULT 0,
    "itc_eligible" BOOLEAN DEFAULT true, "itc_amount" DECIMAL(18,2) DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tax_registers_pkey" PRIMARY KEY ("id")
);

-- ════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS "idx_coa_tenant_type" ON "chart_of_accounts"("tenant_id", "account_type");
CREATE INDEX IF NOT EXISTS "idx_coa_tenant_active" ON "chart_of_accounts"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_fy_tenant_current" ON "fiscal_years"("tenant_id", "is_current");
CREATE INDEX IF NOT EXISTS "idx_fp_tenant_year" ON "fiscal_periods"("tenant_id", "fiscal_year");
CREATE INDEX IF NOT EXISTS "idx_fp_tenant_status" ON "fiscal_periods"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_cc_tenant_active" ON "cost_centers"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_si_tenant_supplier" ON "supplier_invoices"("tenant_id", "supplier_id");
CREATE INDEX IF NOT EXISTS "idx_si_tenant_status" ON "supplier_invoices"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_si_tenant_date" ON "supplier_invoices"("tenant_id", "invoice_date");
CREATE INDEX IF NOT EXISTS "idx_sil_invoice" ON "supplier_invoice_lines"("invoice_id");
CREATE INDEX IF NOT EXISTS "idx_pay_tenant_supplier" ON "payments"("tenant_id", "supplier_id");
CREATE INDEX IF NOT EXISTS "idx_pay_tenant_status" ON "payments"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_pa_payment" ON "payment_applications"("payment_id");
CREATE INDEX IF NOT EXISTS "idx_pr_tenant_status" ON "payment_runs"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_apcn_tenant_supplier" ON "ap_credit_notes"("tenant_id", "supplier_id");
CREATE INDEX IF NOT EXISTS "idx_ci_tenant_customer" ON "customer_invoices"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_ci_tenant_status" ON "customer_invoices"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_cil_invoice" ON "customer_invoice_lines"("invoice_id");
CREATE INDEX IF NOT EXISTS "idx_rec_tenant_customer" ON "receipts"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_rec_tenant_status" ON "receipts"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_ra_receipt" ON "receipt_applications"("receipt_id");
CREATE INDEX IF NOT EXISTS "idx_arcn_tenant_customer" ON "ar_credit_notes"("tenant_id", "customer_id");
CREATE INDEX IF NOT EXISTS "idx_pc_tenant_product" ON "product_costs"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_cr_tenant_product" ON "cost_rollups"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_crl_rollup" ON "cost_rollup_lines"("rollup_id");
CREATE INDEX IF NOT EXISTS "idx_cv_tenant_product" ON "cost_variances"("tenant_id", "product_id");
CREATE INDEX IF NOT EXISTS "idx_bc_tenant_batch" ON "batch_costs"("tenant_id", "batch_id");
CREATE INDEX IF NOT EXISTS "idx_iv_tenant_date" ON "inventory_valuations"("tenant_id", "valuation_date");
CREATE INDEX IF NOT EXISTS "idx_je_tenant_status" ON "journal_entries"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_je_tenant_date" ON "journal_entries"("tenant_id", "je_date");
CREATE INDEX IF NOT EXISTS "idx_jel_je" ON "journal_entry_lines"("je_id");
CREATE INDEX IF NOT EXISTS "idx_glp_tenant_account" ON "gl_postings"("tenant_id", "account_id");
CREATE INDEX IF NOT EXISTS "idx_glp_tenant_date" ON "gl_postings"("tenant_id", "posting_date");
CREATE INDEX IF NOT EXISTS "idx_tb_tenant_date" ON "trial_balances"("tenant_id", "as_of_date");
CREATE INDEX IF NOT EXISTS "idx_fs_tenant_type_date" ON "financial_statements"("tenant_id", "statement_type", "statement_date");
CREATE INDEX IF NOT EXISTS "idx_ob_tenant_year" ON "opening_balances"("tenant_id", "fiscal_year");
CREATE INDEX IF NOT EXISTS "idx_pclose_tenant_year_period" ON "period_closes"("tenant_id", "fiscal_year", "period_number");
CREATE INDEX IF NOT EXISTS "idx_gstc_tenant_hsn" ON "gst_configurations"("tenant_id", "hsn_code");
CREATE INDEX IF NOT EXISTS "idx_tr_tenant_active" ON "tax_rules"("tenant_id", "is_active");
CREATE INDEX IF NOT EXISTS "idx_einv_tenant_status" ON "e_invoices"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_ewb_tenant_status" ON "e_way_bills"("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "idx_tret_tenant_period" ON "tax_returns"("tenant_id", "return_period");
CREATE INDEX IF NOT EXISTS "idx_treg_tenant_type" ON "tax_registers"("tenant_id", "register_type");

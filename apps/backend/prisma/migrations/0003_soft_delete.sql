-- Phase 1 Completion: Add deleted_by columns for soft delete support
-- This migration adds deleted_by UUID columns to all Organization tables

ALTER TABLE companies ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE business_units ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE divisions ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE regions ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE cost_centers ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE financial_years ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE working_calendars ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE tax_configs ADD COLUMN IF NOT EXISTS deleted_by UUID;

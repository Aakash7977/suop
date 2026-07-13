#!/usr/bin/env python3
"""
Phase 1B: Update ALL backend route files to replace proxy permissions
with domain-specific permissions from the approved Enterprise Permission Catalog.

Replacements are based on the module's business domain:
- Finance modules (product-costing, general-ledger, gst-taxation, financial-foundation, AP, AR) → domain-specific FINANCE permissions
- Sales modules (sales-order, order-fulfillment, pick-pack-dispatch, delivery-management, pricing-engine, customer-returns) → domain-specific SALES permissions
- Manufacturing modules (batch-manufacturing, mes, recipe-bom, production-order) → domain-specific MANUFACTURING permissions
- HR modules (attendance-shift, performance-management, employee-master, leave-management, payroll-processing, recruitment-onboarding) → domain-specific HR permissions
- Warehouse module → domain-specific WAREHOUSE permissions
- BI modules (alerts-kpi-engine, bi-foundation, executive-dashboards, reporting-platform, ai-prediction) → domain-specific BI permissions
- CRM modules (crm-foundation, lead-opportunity, complaint-management, after-sales-service, customer-service) → domain-specific CRM permissions
- EIP module → system permissions
"""
import re
from pathlib import Path

BACKEND_ROOT = Path('/home/z/my-project/apps/backend/src/modules')

# Module → (READ_PERM, WRITE_PERM) mapping
# For stub-template modules that use READ_PERM/WRITE_PERM pattern
MODULE_PERMISSIONS = {
    # Finance modules
    'product-costing': ('Permission.COSTING_READ', 'Permission.COSTING_CREATE'),
    'general-ledger': ('Permission.GL_READ', 'Permission.GL_CREATE'),
    'gst-taxation': ('Permission.GST_READ', 'Permission.GST_CREATE'),
    'financial-foundation': ('Permission.FINANCE_READ', 'Permission.FINANCE_CREATE'),
    'accounts-payable': ('Permission.AP_READ', 'Permission.PAYMENT_CREATE'),
    'accounts-receivable': ('Permission.AR_READ', 'Permission.FINANCE_CREATE'),
    # HR modules
    'attendance-shift': ('Permission.ATTENDANCE_READ', 'Permission.ATTENDANCE_CREATE'),
    'performance-management': ('Permission.PERFORMANCE_READ', 'Permission.PERFORMANCE_CONFIGURE'),
    'employee-master': ('Permission.HR_READ', 'Permission.HR_CREATE'),
    'leave-management': ('Permission.LEAVE_READ', 'Permission.LEAVE_CREATE'),
    'payroll-processing': ('Permission.PAYROLL_READ', 'Permission.PAYROLL_APPROVE'),
    'recruitment-onboarding': ('Permission.HR_READ', 'Permission.HR_CREATE'),
    # BI modules
    'alerts-kpi-engine': ('Permission.ALERTS_READ', 'Permission.ALERTS_ADMIN'),
    'bi-foundation': ('Permission.BI_READ', 'Permission.BI_SETTINGS'),
    'executive-dashboards': ('Permission.BI_READ', 'Permission.BI_SETTINGS'),
    'reporting-platform': ('Permission.BI_READ', 'Permission.BI_TEMPLATES'),
    'ai-prediction': ('Permission.BI_READ', 'Permission.BI_SETTINGS'),
    # CRM modules
    'crm-foundation': ('Permission.CRM_READ', 'Permission.CRM_CREATE'),
    'lead-opportunity': ('Permission.LEAD_READ', 'Permission.CRM_CREATE'),
    'complaint-management': ('Permission.COMPLAINT_READ', 'Permission.COMPLAINT_CREATE'),
    'after-sales-service': ('Permission.SERVICE_READ', 'Permission.SERVICE_CREATE'),
    'customer-service': ('Permission.SERVICE_READ', 'Permission.SERVICE_CREATE'),
    # EIP
    'eip': ('Permission.BI_READ', 'Permission.SYSTEM_SETTINGS'),
}

# For modules that use inline requirePermission() (not READ_PERM/WRITE_PERM pattern)
# We need direct replacements
INLINE_REPLACEMENTS = {
    # Sales modules — replace CUSTOMER_* with domain-specific
    'sales-order': [
        ('Permission.CUSTOMER_READ', 'Permission.SO_READ'),
        ('Permission.CUSTOMER_UPDATE', 'Permission.SO_CREATE'),  # write operations use SO_CREATE
        ('Permission.CUSTOMER_CREATE', 'Permission.SO_CREATE'),
    ],
    'order-fulfillment': [
        ('Permission.CUSTOMER_READ', 'Permission.ALLOCATION_READ'),
        ('Permission.CUSTOMER_UPDATE', 'Permission.ALLOCATION_CREATE'),
        ('Permission.CUSTOMER_CREATE', 'Permission.ALLOCATION_CREATE'),
    ],
    'pick-pack-dispatch': [
        ('Permission.CUSTOMER_READ', 'Permission.PICK_READ'),
        ('Permission.CUSTOMER_UPDATE', 'Permission.PICK_CREATE'),
        ('Permission.CUSTOMER_CREATE', 'Permission.PICK_CREATE'),
    ],
    'delivery-management': [
        ('Permission.CUSTOMER_READ', 'Permission.DELIVERY_READ'),
        ('Permission.CUSTOMER_UPDATE', 'Permission.DELIVERY_CREATE'),
        ('Permission.CUSTOMER_CREATE', 'Permission.DELIVERY_CREATE'),
    ],
    'pricing-engine': [
        ('Permission.CUSTOMER_READ', 'Permission.PRICING_READ'),
        ('Permission.CUSTOMER_UPDATE', 'Permission.PRICING_CREATE'),
        ('Permission.CUSTOMER_CREATE', 'Permission.PRICING_CREATE'),
    ],
    # Manufacturing modules — replace PRODUCT_* with domain-specific
    'batch-manufacturing': [
        ('Permission.PRODUCT_READ', 'Permission.BATCH_READ'),
        ('Permission.PRODUCT_CREATE', 'Permission.BATCH_CREATE'),
        ('Permission.PRODUCT_UPDATE', 'Permission.BATCH_TRANSITION'),
    ],
    'mes': [
        ('Permission.PRODUCT_READ', 'Permission.MES_READ'),
        ('Permission.PRODUCT_CREATE', 'Permission.MES_READ'),  # MES creates are operational
        ('Permission.PRODUCT_UPDATE', 'Permission.MES_READ'),
    ],
    'recipe-bom': [
        ('Permission.PRODUCT_READ', 'Permission.RECIPE_READ'),
        ('Permission.PRODUCT_CREATE', 'Permission.RECIPE_CREATE'),
        ('Permission.PRODUCT_UPDATE', 'Permission.RECIPE_APPROVE'),
    ],
    # Warehouse — replace INVENTORY_* with WAREHOUSE_*
    'warehouse': [
        ('Permission.INVENTORY_READ', 'Permission.WAREHOUSE_READ'),
        ('Permission.INVENTORY_POST', 'Permission.WAREHOUSE_CREATE'),
    ],
    # Production order — replace INVENTORY_* with PRODUCTION_*
    'production-order': [
        ('Permission.INVENTORY_READ', 'Permission.PRODUCTION_READ'),
        ('Permission.INVENTORY_POST', 'Permission.PRODUCTION_CREATE'),
    ],
    # Quality — already fixed in Phase 0, but verify
    'quality-inspection': [
        ('Permission.IQC_INSPECT', 'Permission.QUALITY_INSPECT'),
        ('Permission.IQC_APPROVE', 'Permission.QUALITY_APPROVE'),
        ('Permission.NCR_CREATE', 'Permission.NCR_CREATE'),  # same name
        ('Permission.NCR_APPROVE', 'Permission.NCR_APPROVE'),  # same name
    ],
}

count = 0

# Process stub-template modules (READ_PERM/WRITE_PERM pattern)
for module_name, (read_perm, write_perm) in MODULE_PERMISSIONS.items():
    route_file = BACKEND_ROOT / module_name / 'routes' / 'index.ts'
    if not route_file.exists():
        print(f"  ✗ {module_name}: route file not found")
        continue
    
    content = route_file.read_text()
    original = content
    
    # Replace READ_PERM and WRITE_PERM assignments
    content = re.sub(
        r'const READ_PERM = Permission\.\w+',
        f'const READ_PERM = {read_perm}',
        content
    )
    content = re.sub(
        r'const WRITE_PERM = Permission\.\w+',
        f'const WRITE_PERM = {write_perm}',
        content
    )
    
    if content != original:
        route_file.write_text(content)
        count += 1
        print(f"  ✓ {module_name}: READ_PERM={read_perm}, WRITE_PERM={write_perm}")
    else:
        print(f"  ⊙ {module_name}: no changes needed")

# Process inline permission modules
for module_name, replacements in INLINE_REPLACEMENTS.items():
    route_file = BACKEND_ROOT / module_name / 'routes' / 'index.ts'
    if not route_file.exists():
        print(f"  ✗ {module_name}: route file not found")
        continue
    
    content = route_file.read_text()
    original = content
    
    for old_perm, new_perm in replacements:
        content = content.replace(old_perm, new_perm)
    
    if content != original:
        route_file.write_text(content)
        count += 1
        print(f"  ✓ {module_name}: inline permissions updated ({len(replacements)} replacements)")
    else:
        print(f"  ⊙ {module_name}: no changes needed")

print(f"\n✓ {count} route files updated")

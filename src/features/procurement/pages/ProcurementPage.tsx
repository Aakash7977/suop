'use client';

import { FeaturePage, type SubModule } from '@/features/shared';
import { ShoppingCart, FileText, PackageCheck, ClipboardList, Undo2 } from 'lucide-react';

const SUB_MODULES: SubModule[] = [
  { value: 'suppliers', label: 'Suppliers', icon: ShoppingCart, description: 'Supplier master, onboarding & scorecards.' },
  { value: 'rfq', label: 'RFQ', icon: FileText, description: 'Request-for-quotation lifecycle & bid comparison.' },
  { value: 'purchase-orders', label: 'Purchase Orders', icon: PackageCheck, description: 'PO creation, approval & release.' },
  { value: 'goods-receipt', label: 'Goods Receipt', icon: ClipboardList, description: 'Inbound receipts, inspection & putaway handover.' },
  { value: 'returns', label: 'Returns', icon: Undo2, description: 'Supplier returns, debit notes & reversals.' },
];

export function ProcurementPage() {
  return (
    <FeaturePage
      module="procurement"
      title="Procurement"
      description="Source-to-pay: suppliers, RFQs, purchase orders, receipts & returns."
      subModules={SUB_MODULES}
    />
  );
}

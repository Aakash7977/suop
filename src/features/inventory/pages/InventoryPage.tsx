'use client';

import { FeaturePage, type SubModule } from '@/features/shared';
import { Package, BookOpen, Layers, ClipboardCheck, RefreshCw, Scale } from 'lucide-react';

const SUB_MODULES: SubModule[] = [
  { value: 'inventory-master', label: 'Inventory Master', icon: Package, description: 'Item master, SKUs, attributes & UOM.' },
  { value: 'stock-ledger', label: 'Stock Ledger', icon: BookOpen, description: 'Real-time stock ledger across all warehouses.' },
  { value: 'reservations', label: 'Reservations', icon: Layers, description: 'Stock reservations & allocations.' },
  { value: 'cycle-counts', label: 'Cycle Counts', icon: ClipboardCheck, description: 'Cycle counting schedules & variance reconciliation.' },
  { value: 'adjustments', label: 'Adjustments', icon: RefreshCw, description: 'Stock adjustments with approval workflow.' },
  { value: 'valuation', label: 'Valuation', icon: Scale, description: 'Inventory valuation & costing snapshots.' },
];

export function InventoryPage() {
  return (
    <FeaturePage
      module="inventory"
      title="Inventory"
      description="Multi-warehouse inventory master, ledger, reservations & valuation."
      subModules={SUB_MODULES}
    />
  );
}

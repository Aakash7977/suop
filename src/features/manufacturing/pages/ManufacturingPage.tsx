'use client';

import { FeaturePage, type SubModule } from '@/features/shared';
import { FlaskConical, FileText, Factory, Boxes, Gauge, ClipboardList } from 'lucide-react';

const SUB_MODULES: SubModule[] = [
  { value: 'recipes', label: 'Recipes & BOM', icon: FlaskConical, description: 'Recipe/formula builder & multi-level BOM.' },
  { value: 'production-orders', label: 'Production Orders', icon: FileText, description: 'Production order lifecycle & approvals.' },
  { value: 'shop-floor', label: 'Shop Floor', icon: Factory, description: 'Work orders, routing & shop-floor execution.' },
  { value: 'batch-master', label: 'Batch Master', icon: Boxes, description: 'Batch manufacturing, genealogy & traceability.' },
  { value: 'oee', label: 'OEE', icon: Gauge, description: 'Overall equipment effectiveness analytics.' },
  { value: 'costing', label: 'Costing', icon: ClipboardList, description: 'Batch costing, variances & rollups.' },
];

export function ManufacturingPage() {
  return (
    <FeaturePage
      module="manufacturing"
      title="Manufacturing"
      description="Recipes, production orders, shop-floor execution, batches & costing."
      subModules={SUB_MODULES}
    />
  );
}

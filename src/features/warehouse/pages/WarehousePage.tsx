'use client';

import { FeaturePage, type SubModule } from '@/features/shared';
import { MapPin, ArrowDownToLine, Boxes, Package, PackageCheck, Truck } from 'lucide-react';

const SUB_MODULES: SubModule[] = [
  { value: 'locations', label: 'Locations', icon: MapPin, description: 'Warehouse location hierarchy & capacity.' },
  { value: 'receiving', label: 'Receiving', icon: ArrowDownToLine, description: 'Dock receiving & ASN management.' },
  { value: 'putaway', label: 'Putaway', icon: Boxes, description: 'Putaway strategies & task queue.' },
  { value: 'picking', label: 'Picking', icon: Package, description: 'Pick waves, batch & cluster picking.' },
  { value: 'packing', label: 'Packing', icon: PackageCheck, description: 'Packing stations & cartonization.' },
  { value: 'dispatch', label: 'Dispatch', icon: Truck, description: 'Outbound dispatch & carrier handover.' },
];

export function WarehousePage() {
  return (
    <FeaturePage
      module="warehouse"
      title="Warehouse (WMS)"
      description="Warehouse management: receiving, putaway, picking, packing & dispatch."
      subModules={SUB_MODULES}
    />
  );
}

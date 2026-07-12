'use client';

import { FeaturePage, type SubModule } from '@/features/shared';
import { Target, Handshake, Users, MessageSquare, Wrench } from 'lucide-react';

const SUB_MODULES: SubModule[] = [
  { value: 'leads', label: 'Leads', icon: Target, description: 'Lead capture, qualification & routing.' },
  { value: 'opportunities', label: 'Opportunities', icon: Handshake, description: 'Pipeline, quotes & win/loss.' },
  { value: 'customers', label: 'Customers', icon: Users, description: 'Customer master & 360° view.' },
  { value: 'complaints', label: 'Complaints', icon: MessageSquare, description: 'Customer complaints & ticketing.' },
  { value: 'after-sales', label: 'After-Sales', icon: Wrench, description: 'Service contracts, AMC & field service.' },
];

export function CrmPage() {
  return (
    <FeaturePage
      module="crm"
      title="CRM"
      description="Leads, opportunities, customer 360°, complaints & after-sales service."
      subModules={SUB_MODULES}
    />
  );
}

'use client';

import { FeaturePage, type SubModule } from '@/features/shared';
import { ShieldCheck, ScanLine, Eye, PackageCheck, FlaskConical, AlertTriangle } from 'lucide-react';

const SUB_MODULES: SubModule[] = [
  { value: 'qms', label: 'QMS', icon: ShieldCheck, description: 'Quality standards, specs & sampling plans.' },
  { value: 'iqc', label: 'IQC', icon: ScanLine, description: 'Incoming quality control & supplier holds.' },
  { value: 'ipqc', label: 'IPQC', icon: Eye, description: 'In-process quality control & CCP monitoring.' },
  { value: 'fqc', label: 'FQC', icon: PackageCheck, description: 'Finished-goods QC, release & certificates.' },
  { value: 'lims', label: 'LIMS', icon: FlaskConical, description: 'Laboratory information management.' },
  { value: 'capa', label: 'CAPA & NCR', icon: AlertTriangle, description: 'Corrective actions, non-conformance & recalls.' },
];

export function QualityPage() {
  return (
    <FeaturePage
      module="quality"
      title="Quality Management"
      description="QMS, IQC/IPQC/FQC, LIMS, CAPA & recall management."
      subModules={SUB_MODULES}
    />
  );
}

'use client';

import { FeaturePage, type SubModule } from '@/features/shared';
import { BarChart3, Activity, FileSpreadsheet, Database, Brain } from 'lucide-react';

const SUB_MODULES: SubModule[] = [
  { value: 'dashboards', label: 'BI Dashboards', icon: BarChart3, description: 'Executive & operational dashboards.' },
  { value: 'kpi-engine', label: 'KPI Engine', icon: Activity, description: 'KPI definitions, thresholds & alerts.' },
  { value: 'reports', label: 'Reports', icon: FileSpreadsheet, description: 'Scheduled & ad-hoc report builder.' },
  { value: 'data-warehouse', label: 'Data Warehouse', icon: Database, description: 'Star-schema warehouse & ETL jobs.' },
  { value: 'ai-insights', label: 'AI Insights', icon: Brain, description: 'Predictive analytics & anomaly detection.' },
];

export function AnalyticsPage() {
  return (
    <FeaturePage
      module="analytics"
      title="Analytics & BI"
      description="Dashboards, KPI engine, reporting, data warehouse & AI insights."
      subModules={SUB_MODULES}
    />
  );
}

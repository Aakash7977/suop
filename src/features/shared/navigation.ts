/**
 * SUOP ERP — Sidebar navigation configuration.
 *
 * `navItems` is grouped by category (the platform groups modules into logical
 * areas). `moduleGroups` maps each module key to the category label it belongs
 * to — used by the sidebar to render section headers.
 */
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse as WarehouseIcon,
  Factory,
  ShieldCheck,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { ModuleKey, NavItem } from './types';

/** The set of top-level categories rendered in the sidebar. */
export interface NavGroup {
  id: string;
  label: string;
  icon?: LucideIcon;
  module: ModuleKey;
  items: NavItem[];
}

/**
 * Top-level modules. Each entry maps directly to a feature module under
 * `src/features/<module>`. The sidebar renders these as primary navigation.
 */
export const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { key: 'procurement', label: 'Procurement', icon: ShoppingCart, module: 'procurement' },
  { key: 'inventory', label: 'Inventory', icon: Package, module: 'inventory' },
  { key: 'warehouse', label: 'Warehouse', icon: WarehouseIcon, module: 'warehouse' },
  { key: 'manufacturing', label: 'Manufacturing', icon: Factory, module: 'manufacturing' },
  { key: 'quality', label: 'Quality', icon: ShieldCheck, module: 'quality' },
  { key: 'finance', label: 'Finance', icon: DollarSign, module: 'finance' },
  { key: 'crm', label: 'CRM', icon: Users, module: 'crm' },
  { key: 'hr', label: 'Human Resources', icon: Users, module: 'hr' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, module: 'analytics' },
  { key: 'administration', label: 'Administration', icon: Settings, module: 'administration' },
];

/** Maps each module key to its display group label. */
export const moduleGroups: Record<ModuleKey, string> = {
  dashboard: 'Platform',
  platform: 'Platform',
  procurement: 'Operations',
  inventory: 'Operations',
  warehouse: 'Operations',
  manufacturing: 'Operations',
  quality: 'Operations',
  finance: 'Back Office',
  crm: 'Back Office',
  hr: 'Back Office',
  analytics: 'Intelligence',
  administration: 'System',
};

/** Module metadata (icon + label) — used by command palette & breadcrumbs. */
export const moduleMeta: Record<
  ModuleKey,
  { label: string; icon: LucideIcon }
> = {
  dashboard: { label: 'Dashboard', icon: LayoutDashboard },
  platform: { label: 'Platform', icon: LayoutDashboard },
  procurement: { label: 'Procurement', icon: ShoppingCart },
  inventory: { label: 'Inventory', icon: Package },
  warehouse: { label: 'Warehouse', icon: WarehouseIcon },
  manufacturing: { label: 'Manufacturing', icon: Factory },
  quality: { label: 'Quality', icon: ShieldCheck },
  finance: { label: 'Finance', icon: DollarSign },
  crm: { label: 'CRM', icon: Users },
  hr: { label: 'Human Resources', icon: Users },
  analytics: { label: 'Analytics', icon: BarChart3 },
  administration: { label: 'Administration', icon: Settings },
};

/**
 * Build the grouped navigation structure rendered by the sidebar.
 * Items are bucketed by their `moduleGroups` category.
 */
export function buildGroupedNav(): NavGroup[] {
  const order: string[] = [
    'Platform',
    'Operations',
    'Back Office',
    'Intelligence',
    'System',
  ];
  const buckets = new Map<string, NavItem[]>();
  for (const item of navItems) {
    const group = moduleGroups[item.module];
    if (!buckets.has(group)) buckets.set(group, []);
    buckets.get(group)!.push(item);
  }
  return order
    .filter((g) => buckets.has(g))
    .map((g) => ({
      id: g.toLowerCase().replace(/\s+/g, '-'),
      label: g,
      module: (buckets.get(g)![0]?.module ?? 'platform') as ModuleKey,
      items: buckets.get(g)!,
    }));
}

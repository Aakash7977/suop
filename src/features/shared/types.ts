/**
 * SUOP ERP — Shared domain types used across all feature modules.
 *
 * These types are intentionally lightweight and framework-agnostic so they can
 * be imported from both client and server components without pulling in React.
 */

/** All top-level module keys exposed by the SUOP admin shell. */
export type ModuleKey =
  | 'dashboard'
  | 'procurement'
  | 'inventory'
  | 'warehouse'
  | 'manufacturing'
  | 'quality'
  | 'finance'
  | 'crm'
  | 'hr'
  | 'analytics'
  | 'administration'
  | 'platform';

/** A single navigation entry rendered in the sidebar. */
export interface NavItem {
  /** Stable unique key — also used as the route identifier. */
  key: string;
  /** Human-readable label shown in the UI. */
  label: string;
  /** lucide-react icon component (resolved lazily by the sidebar). */
  icon?: React.ComponentType<{ className?: string }>;
  /** Module this item belongs to (used for grouping & routing). */
  module: ModuleKey;
  /** Optional badge count (e.g. pending approvals). */
  badge?: number;
  /** When true, the item is rendered as a group header rather than a link. */
  isGroup?: boolean;
}

/** A breadcrumb segment. */
export interface Breadcrumb {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/** Risk level for confirmation dialogs. */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** Workflow / document status values used across the platform. */
export type StatusKind =
  | 'DRAFT'
  | 'PENDING'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ON_HOLD'
  | 'ARCHIVED';

/** A command surfaced in the Cmd+K command palette. */
export interface Command {
  /** Unique id. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional short description / hint. */
  hint?: string;
  /** Optional grouping category. */
  group?: string;
  /** Optional lucide-react icon. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional keyboard shortcut hint (e.g. "⌘P"). */
  shortcut?: string;
  /** Optional keywords used for fuzzy search. */
  keywords?: string[];
  /** Module this command navigates to (if any). */
  module?: ModuleKey;
  /** Action invoked when the command is selected. */
  action?: () => void;
}

/** A notification surfaced in the notification center. */
export interface Notification {
  id: string;
  title: string;
  description?: string;
  /** ISO timestamp. */
  timestamp: string;
  /** Visual / semantic category. */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** Has the user acknowledged it? */
  read?: boolean;
  /** Optional module this notification relates to. */
  module?: ModuleKey;
}

/** A single entry in an activity feed / generic timeline. */
export interface TimelineEntry {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
  icon?: React.ComponentType<{ className?: string }>;
  status?: StatusKind;
}

/** A KPI metric displayed on a dashboard card. */
export interface KPIDefinition {
  id: string;
  label: string;
  value: string | number;
  /** Percentage delta vs. previous period (-100..1000). */
  delta?: number;
  unit?: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Optional sparkline data series. */
  trend?: number[];
}

/** Common page header descriptor. */
export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

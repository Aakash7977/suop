'use client';

/**
 * SUOP ERP — Admin shell entry point.
 *
 * This file is intentionally a thin routing/composition layer (<500 lines).
 * All real UI lives in:
 *   - `@/components/enterprise/*`  — the reusable design system
 *   - `@/features/*`              — feature module pages
 *
 * Responsibilities of this file:
 *   1. Gate on authentication (LoginScreen vs. the admin shell).
 *   2. Render the SidebarNavigation + header (search, command palette, notifications).
 *   3. Route the selected nav item to the matching feature-module page.
 */

import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  SidebarNavigation,
  CommandPalette,
  GlobalSearch,
  NotificationCenter,
} from '@/components/enterprise';
import { useAuthStore } from '@/stores/auth-store';
import { navItems } from '@/features/shared/navigation';
import type { Command, Notification } from '@/features/shared/types';

import { LoginScreen, DashboardPage } from '@/features/platform';
import { ProcurementPage } from '@/features/procurement';
import { InventoryPage } from '@/features/inventory';
import { WarehousePage } from '@/features/warehouse';
import { ManufacturingPage } from '@/features/manufacturing';
import { QualityPage } from '@/features/quality';
import { FinancePage } from '@/features/finance';
import { CrmPage } from '@/features/crm';
import { HrPage } from '@/features/hr';
import { AnalyticsPage } from '@/features/analytics';
import { AdministrationPage } from '@/features/administration';

import {
  Menu,
  PanelLeftClose,
  PanelLeft,
  Search as SearchIcon,
  Command as CommandIcon,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ─── Module registry ────────────────────────────────────────────────
// Maps a nav-item key to the feature-module page component to render.
const MODULE_REGISTRY: Record<string, () => ReactNode> = {
  dashboard: () => <DashboardPage />,
  procurement: () => <ProcurementPage />,
  inventory: () => <InventoryPage />,
  warehouse: () => <WarehousePage />,
  manufacturing: () => <ManufacturingPage />,
  quality: () => <QualityPage />,
  finance: () => <FinancePage />,
  crm: () => <CrmPage />,
  hr: () => <HrPage />,
  analytics: () => <AnalyticsPage />,
  administration: () => <AdministrationPage />,
};

const STORAGE_FAV = 'suop_nav_favorites';
const STORAGE_RECENT = 'suop_nav_recents';

// ─── App shell ──────────────────────────────────────────────────────
export default function Home() {
  const { isAuthenticated, isLoading, initialize, user, isDemoMode, logout } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    initialize().finally(() => mounted && setReady(true));
    return () => {
      mounted = false;
    };
  }, [initialize]);

  if (!ready || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm">Loading SUOP…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <AdminShell
    user={user}
    isDemoMode={isDemoMode}
    onLogout={() => logout()}
  />;
}

// ─── Admin shell (sidebar + header + routed content) ────────────────
interface AdminShellProps {
  user: { email: string } | null;
  isDemoMode: boolean;
  onLogout: () => void;
}

function AdminShell({ user, isDemoMode, onLogout }: AdminShellProps) {
  const [activeKey, setActiveKey] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [favorites, setFavorites] = useState<string[]>(() => loadArr(STORAGE_FAV));
  const [recents, setRecents] = useState<string[]>(() => loadArr(STORAGE_RECENT));

  const select = useCallback(
    (key: string) => {
      setActiveKey(key);
      setMobileOpen(false);
      setRecents((prev) => [key, ...prev.filter((k) => k !== key)].slice(0, 6));
    },
    [],
  );

  useEffect(() => {
    saveArr(STORAGE_FAV, favorites);
  }, [favorites]);
  useEffect(() => {
    saveArr(STORAGE_RECENT, recents);
  }, [recents]);

  const toggleFav = useCallback((key: string) => {
    setFavorites((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  // Cmd+K handled inside CommandPalette; Shift+Cmd+K → global search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const commands = useMemo<Command[]>(
    () => [
      ...navItems.map((item) => ({
        id: `nav-${item.key}`,
        label: item.label,
        hint: 'Navigate',
        group: 'Navigation',
        icon: item.icon,
        keywords: [item.module, 'go to', 'open'],
        action: () => select(item.key),
      })),
      {
        id: 'cmd-search',
        label: 'Open Global Search',
        group: 'Actions',
        icon: SearchIcon,
        shortcut: '⇧⌘K',
        action: () => setSearchOpen(true),
      },
      {
        id: 'cmd-logout',
        label: 'Sign out',
        group: 'Actions',
        icon: LogOut,
        action: onLogout,
      },
    ],
    [select, onLogout],
  );

  const renderPage = (): ReactNode =>
    MODULE_REGISTRY[activeKey]?.() ?? <DashboardPage />;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden md:block border-r">
          <SidebarNavigation
            activeKey={activeKey}
            onSelect={select}
            favorites={favorites}
            recents={recents}
            onToggleFavorite={toggleFav}
            collapsed={collapsed}
          />
        </div>

        {/* Mobile sidebar (drawer) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <div className="absolute left-0 top-0 h-full border-r bg-card">
              <SidebarNavigation
                activeKey={activeKey}
                onSelect={select}
                favorites={favorites}
                recents={recents}
                onToggleFavorite={toggleFav}
              />
            </div>
          </div>
        )}

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            onOpenMobile={() => setMobileOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            onOpenCommand={() => setCmdOpen(true)}
            isDemoMode={isDemoMode}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto max-w-7xl">{renderPage()}</div>
          </main>
          <Footer />
        </div>
      </div>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} commands={commands} />
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} commands={commands} />
    </div>
  );
}

// ─── Header ─────────────────────────────────────────────────────────
interface HeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
  onOpenSearch: () => void;
  onOpenCommand: () => void;
  isDemoMode: boolean;
}

function Header({
  collapsed,
  onToggleCollapse,
  onOpenMobile,
  onOpenSearch,
  onOpenCommand,
  isDemoMode,
}: HeaderProps) {
  const { user, logout } = useAuthStore();
  const notifications: Notification[] = [];
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'UO';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenMobile}
        aria-label="Open menu"
      >
        <Menu className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
      </Button>

      <Button
        variant="outline"
        className="ml-1 hidden h-8 gap-2 px-2 text-muted-foreground sm:flex"
        onClick={onOpenSearch}
      >
        <SearchIcon className="size-3.5" />
        <span className="text-xs">Search…</span>
        <kbd className="ml-2 rounded border bg-muted px-1 text-[10px]">⌘K</kbd>
      </Button>

      <div className="ml-auto flex items-center gap-1">
        {isDemoMode && (
          <Badge variant="secondary" className="mr-1 hidden sm:inline-flex">
            Demo
          </Badge>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenCommand}
          aria-label="Command palette"
        >
          <CommandIcon className="size-4" />
        </Button>
        <NotificationCenter notifications={notifications} />
        <Separator orientation="vertical" className="mx-1 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-1.5">
              <Avatar className="size-7">
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
              </Avatar>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate">{user?.email ?? 'Unknown'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="size-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="size-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => logout()}>
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="mt-auto border-t bg-card px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-muted-foreground">
        <span>SUOP ERP · v1.0 · Sudhastar Unified Operating Platform</span>
        <span className="hidden sm:inline">© {new Date().getFullYear()} Sudhastar</span>
      </div>
    </footer>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────
function loadArr(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveArr(key: string, value: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

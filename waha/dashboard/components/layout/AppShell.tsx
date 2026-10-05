"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  ChevronDown,
  ChevronRight,
  Inbox,
  KeyRound,
  Menu,
  MessageCircle,
  Send,
  Sun,
  Moon,
  Terminal,
  Users,
  Webhook,
  Zap,
  Smartphone,
  Settings,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessions } from "@/lib/hooks";
import { WAHASessionStatus } from "@/lib/types";
import { SearchModal } from "@/components/layout/SearchModal";
import { ShortcutsModal } from "@/components/layout/ShortcutsModal";
import { CreateSessionDialog } from "@/components/sessions/CreateSessionDialog";
import { useKeyboardShortcuts } from "@/lib/shortcuts";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { getSettings } from "@/lib/api";

type NavLabel =
  | "Dashboard"
  | "Sessions"
  | "Inbox"
  | "Send Message"
  | "Contacts"
  | "Webhooks"
  | "API Keys"
  | "Logs"
  | "Settings"
  | "API Docs";

const navItems: { label: NavLabel; icon: typeof Inbox; href: string; external?: boolean }[] = [
  { label: "Dashboard", icon: BarChart3, href: "/" },
  { label: "Sessions", icon: Smartphone, href: "/sessions" },
  { label: "Inbox", icon: Inbox, href: "/inbox" },
  { label: "Send Message", icon: Send, href: "/send" },
  { label: "Contacts", icon: Users, href: "/contacts" },
  { label: "Webhooks", icon: Webhook, href: "/webhooks" },
  { label: "API Keys", icon: KeyRound, href: "/settings" },
  { label: "Logs", icon: Terminal, href: "/logs" },
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "API Docs", icon: BookOpen, href: "#", external: true },
];

function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const [docsUrl, setDocsUrl] = useState("http://localhost:3000/");

  useEffect(() => {
    const settings = getSettings();
    setDocsUrl(`${settings.baseUrl}/`);
  }, []);

  const content = (
    <aside
      className={cn(
        "sidebar fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border transition-all duration-200",
        collapsed ? "w-[72px]" : "w-[248px]"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border px-4",
          collapsed ? "justify-center" : "gap-3"
        )}
      >
        <div className="brand-mark">
          <MessageCircle className="size-4" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-semibold tracking-tight">
              wa<span className="text-primary">hub</span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              API console
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex flex-1 flex-col gap-7 overflow-y-auto p-3">
        <div className="flex flex-col gap-1">
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Workspace
            </p>
          )}
          {navItems.map(({ label, icon: Icon, href, external }) => {
            const resolvedHref = label === "API Docs" ? docsUrl : href;

            if (external) {
              return (
                <a
                  key={label}
                  href={resolvedHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onMobileClose}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "nav-item",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </a>
              );
            }

            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={label}
                href={href}
                onClick={onMobileClose}
                title={collapsed ? label : undefined}
                className={cn(
                  "nav-item",
                  isActive && "nav-item-active",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
                {!collapsed && label === "Inbox" && (
                  <span className="ml-auto rounded-full bg-primary/15 px-1.5 text-[10px] text-primary">
                    •
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Usage widget */}
        {!collapsed && (
          <div className="rounded-xl border border-border bg-card/60 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Zap className="size-3.5 text-primary" />
              <span className="text-xs font-medium">WAHA Console</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              WhatsApp HTTP API dashboard connected to your backend.
            </p>
          </div>
        )}
      </div>

      {/* Collapse */}
      <div className="border-t border-border p-3">
        <button
          onClick={onToggle}
          className="nav-item w-full justify-center text-muted-foreground"
          title="Collapse sidebar"
        >
          <ChevronRight
            className={cn(
              "size-4 transition-transform",
              !collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span>Collapse sidebar</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block">{content}</div>

      {/* Mobile overlay + drawer */}
      <div
        className={cn(
          "mobile-sidebar-overlay md:hidden",
          mobileOpen && "mobile-sidebar-overlay-open"
        )}
        onClick={onMobileClose}
      />
      <div
        className={cn(
          "mobile-sidebar md:hidden",
          mobileOpen && "mobile-sidebar-open"
        )}
      >
        {content}
      </div>
    </>
  );
}

function Topbar({
  collapsed,
  onMenu,
  lightMode,
  onToggleTheme,
  onOpenSearch,
  onOpenShortcuts,
}: {
  collapsed: boolean;
  onMenu: () => void;
  lightMode: boolean;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onOpenShortcuts: () => void;
}) {
  const { data: sessions } = useSessions(true);
  const pathname = usePathname();
  const workingSession = sessions?.find(
    (s) => s.status === WAHASessionStatus.WORKING
  );

  // Breadcrumb
  const segments = pathname.split("/").filter(Boolean);
  const currentPage =
    segments.length > 0
      ? segments[segments.length - 1].charAt(0).toUpperCase() +
        segments[segments.length - 1].slice(1)
      : "Dashboard";

  return (
    <header
      className={cn(
        "topbar fixed left-0 right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur transition-all duration-200",
        collapsed ? "md:pl-[88px]" : "md:pl-[264px]"
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="icon-button md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </button>
        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
          <span>Workspace</span>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-medium">{currentPage}</span>
        </div>
        <div className="flex items-center gap-2 sm:hidden">
          <div className="brand-mark size-7">
            <MessageCircle className="size-3.5" />
          </div>
          <span className="font-semibold text-sm">
            wa<span className="text-primary">hub</span>
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Session switcher */}
        {workingSession ? (
          <button className="session-switcher">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_theme(colors.emerald.500/15%)]" />
            <span className="hidden sm:inline">{workingSession.name}</span>
            <span className="text-muted-foreground text-[10px]">
              {workingSession.me?.pushName || "Active"}
            </span>
            <ChevronDown className="size-3.5" />
          </button>
        ) : (
          <Link href="/sessions" className="session-switcher text-muted-foreground">
            <span className="size-2 rounded-full bg-muted-foreground" />
            <span className="hidden sm:inline text-xs">No active session</span>
            <ChevronDown className="size-3.5" />
          </Link>
        )}

        {/* Theme toggle */}
        <button
          className="icon-button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
        >
          {lightMode ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Avatar */}
        <div className="avatar avatar-teal hidden sm:flex text-[10px]">
          WH
        </div>
      </div>
    </header>
  );
}

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const router = useRouter();

  useKeyboardShortcuts([
    { key: "/", action: () => setIsSearchOpen(true), description: "Focus search modal" },
    { key: "?", action: () => setIsShortcutsOpen(true), description: "Show keyboard shortcuts" },
    { key: "n", action: () => setIsCreateSessionOpen(true), description: "Create session" },
    { key: "d", action: () => router.push("/"), description: "Go to Dashboard" },
    { key: "s", action: () => router.push("/sessions"), description: "Go to Sessions" },
    { key: "m", action: () => router.push("/send"), description: "Go to Send Message" },
    { key: "w", action: () => router.push("/webhooks"), description: "Go to Webhooks" },
    { key: "l", action: () => router.push("/logs"), description: "Go to Logs" },
    { key: ",", action: () => router.push("/settings"), description: "Go to Settings" },
  ]);

  return (
    <div className={cn("dashboard-root", lightMode ? "light-mode" : "dark")}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((p) => !p)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Topbar
        collapsed={collapsed}
        onMenu={() => setMobileOpen(true)}
        lightMode={lightMode}
        onToggleTheme={() => setLightMode((p) => !p)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      <main
        className={cn(
          "main-content",
          collapsed ? "md:pl-[72px]" : "md:pl-[248px]"
        )}
      >
        <div className="mx-auto max-w-[1480px] p-5 pt-24 sm:p-7 sm:pt-24 lg:p-9 lg:pt-24">
          {children}
        </div>
      </main>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenCreateSession={() => setIsCreateSessionOpen(true)}
      />
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
      <CreateSessionDialog
        open={isCreateSessionOpen}
        onOpenChange={setIsCreateSessionOpen}
      />
    </div>
  );
}

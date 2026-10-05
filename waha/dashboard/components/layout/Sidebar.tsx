"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Smartphone,
  MessageSquare,
  Webhook,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wifi,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/sessions", icon: Smartphone, label: "Sessions" },
  { href: "/send", icon: MessageSquare, label: "Send Message" },
  { href: "/webhooks", icon: Webhook, label: "Webhooks" },
  { href: "/logs", icon: FileText, label: "Activity Logs" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/80 transition-all duration-300">
      {/* Logo Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-200 dark:border-slate-800/80 min-h-[64px]">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20 shrink-0">
            <Wifi className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                WAHA
              </span>
              <span className="block text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 tracking-wider">
                Console API
              </span>
            </div>
          )}
        </Link>
        {mobileOpen && (
          <button
            onClick={onMobileClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation list */}
      <nav className="flex flex-col gap-1.5 p-3 flex-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 group relative",
                isActive
                  ? "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-300 border border-indigo-500/20 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              )}
            >
              <Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                )}
              />
              {!collapsed && <span className="truncate">{label}</span>}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse button for desktop */}
      <div className="hidden md:flex p-3 border-t border-slate-200 dark:border-slate-800/80">
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-semibold"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside
        className={cn(
          "hidden md:block relative h-screen transition-all duration-300 ease-in-out shrink-0 z-20",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
            onClick={onMobileClose}
          />
          <div className="relative w-64 h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

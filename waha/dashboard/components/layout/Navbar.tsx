"use client";

import { useState, useEffect } from "react";
import { Search, Sun, Moon, Laptop, Wifi, WifiOff, Menu, Keyboard } from "lucide-react";
import { useVersion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";
import { usePathname } from "next/navigation";
import Link from "next/link";


interface NavbarProps {
  title?: string;
  onOpenSearch?: () => void;
  onOpenShortcuts?: () => void;
  onToggleMobileSidebar?: () => void;
}

export function Navbar({
  title,
  onOpenSearch,
  onOpenShortcuts,
  onToggleMobileSidebar,
}: NavbarProps) {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { data: version, isError } = useVersion();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate breadcrumb items
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    ...pathSegments.map((segment, idx) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: "/" + pathSegments.slice(0, idx + 1).join("/"),
    })),
  ];

  return (
    <header className="glass-nav sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6">
      {/* Left: Mobile hamburger + Breadcrumbs / Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open Mobile Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-col">
          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.href} className="flex items-center gap-1.5">
                {idx > 0 && <span>/</span>}
                <Link
                  href={crumb.href}
                  className={cn(
                    "hover:text-indigo-500 transition-colors",
                    idx === breadcrumbs.length - 1
                      ? "font-semibold text-slate-900 dark:text-slate-200"
                      : "text-slate-400"
                  )}
                >
                  {crumb.label}
                </Link>
              </div>
            ))}
          </nav>
          {title && (
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 sm:hidden">
              {title}
            </h1>
          )}
        </div>
      </div>

      {/* Center: Search bar trigger */}
      <button
        onClick={onOpenSearch}
        className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs w-64"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search commands...</span>
        <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-mono font-semibold">
          /
        </kbd>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Shortcuts Icon */}
        <button
          onClick={onOpenShortcuts}
          className="hidden sm:flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
          title="Keyboard Shortcuts (?)"
          aria-label="Keyboard Shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </button>

        {/* Connection status */}
        {isError ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            <WifiOff className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Offline</span>
          </div>
        ) : version ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <Wifi className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Online</span>
          </div>
        ) : null}

        {/* System Alert Bell */}
        <NotificationBell />

        {/* Theme toggle */}
        <button
          onClick={() => setIsDark((p) => !p)}
          className="flex items-center justify-center w-8 h-8 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          aria-label="Toggle Theme"
          title={`Current Theme: ${isDark ? "dark" : "light"}`}
        >
          {!mounted ? (
            <Sun className="h-4 w-4 text-slate-400 opacity-50" />
          ) : isDark ? (
            <Moon className="h-4 w-4 text-primary" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500" />
          )}
        </button>
      </div>
    </header>
  );
}

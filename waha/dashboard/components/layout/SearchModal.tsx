"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Smartphone,
  MessageSquare,
  Webhook,
  FileText,
  BarChart3,
  Settings,
  PlusCircle,
  Key,
  X,
} from "lucide-react";
import { useSessions } from "@/lib/hooks";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateSession?: () => void;
}

export function SearchModal({
  isOpen,
  onClose,
  onOpenCreateSession,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { data: sessions } = useSessions(true);

  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  if (!isOpen) return null;

  const NAV_ITEMS = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard, category: "Pages" },
    { label: "Sessions", href: "/sessions", icon: Smartphone, category: "Pages" },
    { label: "Send Message", href: "/send", icon: MessageSquare, category: "Pages" },
    { label: "Webhooks Manager", href: "/webhooks", icon: Webhook, category: "Pages" },
    { label: "Activity Logs", href: "/logs", icon: FileText, category: "Pages" },
    { label: "Analytics", href: "/analytics", icon: BarChart3, category: "Pages" },
    { label: "Settings", href: "/settings", icon: Settings, category: "Pages" },
  ];

  const sessionItems = (sessions || []).map((s) => ({
    label: `Session: ${s.name} (${s.status})`,
    href: `/sessions`,
    icon: Smartphone,
    category: "Sessions",
  }));

  const actionItems = [
    {
      label: "Create New Session",
      action: () => {
        onClose();
        if (onOpenCreateSession) onOpenCreateSession();
      },
      icon: PlusCircle,
      category: "Actions",
    },
    {
      label: "Manage API Keys",
      href: "/settings",
      icon: Key,
      category: "Actions",
    },
  ];

  const allItems = [...NAV_ITEMS, ...sessionItems, ...actionItems];

  const filtered = allItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: (typeof allItems)[0]) => {
    onClose();
    if ("action" in item && item.action) {
      item.action();
    } else if ("href" in item && item.href) {
      router.push(item.href);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Input header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search pages, sessions, or actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && filtered.length > 0) {
                handleSelect(filtered[0]);
              }
            }}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching results found for &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-indigo-500">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigation Shortcuts</span>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              ESC
            </kbd>{" "}
            to close
          </div>
        </div>
      </div>
    </div>
  );
}

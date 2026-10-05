"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import {
  getStoredAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  clearAlerts,
} from "@/lib/store";
import { SystemAlert } from "@/lib/types";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  const loadAlerts = () => setAlerts(getStoredAlerts());

  useEffect(() => {
    loadAlerts();
    window.addEventListener("waha_alerts_updated", loadAlerts);
    return () => window.removeEventListener("waha_alerts_updated", loadAlerts);
  }, []);

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="glass-card absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                System Alerts
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {alerts.length > 0 && (
                <>
                  <button
                    onClick={() => {
                      markAllAlertsAsRead();
                      loadAlerts();
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-500"
                    title="Mark all as read"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      clearAlerts();
                      loadAlerts();
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500"
                    title="Clear all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {alerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent system alerts
              </div>
            ) : (
              alerts.map((a) => (
                <div
                  key={a.id}
                  onClick={() => {
                    markAlertAsRead(a.id);
                    loadAlerts();
                  }}
                  className={`p-3 text-left transition-colors cursor-pointer ${
                    a.read
                      ? "opacity-60 bg-transparent"
                      : "bg-indigo-500/5 dark:bg-indigo-500/10 font-medium"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {a.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(a.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                    {a.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

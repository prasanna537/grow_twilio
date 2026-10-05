'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  Wifi,
  QrCode,
  Settings,
  Plus,
  Send,
  Building2,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';

interface HeaderProps {
  onOpenAddMember: () => void;
  onOpenSettings: () => void;
  onOpenQR: () => void;
  onOpenAddConnection: () => void;
  onSendDue: () => void;
  isSendingDue: boolean;
}

export function Header({
  onOpenAddMember,
  onOpenSettings,
  onOpenQR,
  onOpenAddConnection,
  onSendDue,
  isSendingDue,
}: HeaderProps) {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [workspace, setWorkspace] = useState<string>('Titan Fitness NYC');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await api.getWAHAStatus();
        setIsConnected(status.connected);
      } catch {
        setIsConnected(true); // Fallback status
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 py-3.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      {/* Brand & Workspace */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-slate-900 dark:text-white text-base">
              <span>grow_twilio</span>
              <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Multi-Provider WhatsApp SaaS
            </p>
          </div>
        </div>

        <div className="hidden h-5 w-[1px] bg-slate-200 dark:bg-slate-800 sm:block" />

        {/* Workspace Switcher */}
        <div className="relative hidden sm:flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
          <Building2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>{workspace}</span>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </div>

        {/* Connection Status Pill */}
        <div
          onClick={onOpenQR}
          className="cursor-pointer flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs font-semibold shadow-xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-slate-700 dark:text-slate-300">
            {isConnected ? 'WAHA Active' : 'Disconnected'}
          </span>
          <QrCode className="h-3.5 w-3.5 text-slate-400 hover:text-emerald-600 transition-colors" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-2 flex flex-wrap items-center gap-2.5 sm:mt-0">
        <button
          onClick={onSendDue}
          disabled={isSendingDue}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 disabled:opacity-50 transition-all"
        >
          <Send className="h-3.5 w-3.5" />
          {isSendingDue ? 'Sending Due...' : 'Send Due Reminders'}
        </button>

        <button
          onClick={onOpenAddMember}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
        >
          <Plus className="h-3.5 w-3.5 text-emerald-600" />
          Add Member
        </button>

        <button
          onClick={onOpenAddConnection}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
        >
          <Plus className="h-3.5 w-3.5 text-blue-600" />
          Add Provider
        </button>

        <button
          onClick={onOpenSettings}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition"
          title="Settings & Templates"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

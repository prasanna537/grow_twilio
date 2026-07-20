'use client';

import React from 'react';
import { ConnectionItem, ProviderType } from '@/lib/providers/types';
import { Wifi, RefreshCw, QrCode, Server, Zap, Activity } from 'lucide-react';

interface ConnectionManagerProps {
  connections: ConnectionItem[];
  onOpenQR: () => void;
  onOpenAddConnection: () => void;
}

const PROVIDER_COLORS: Record<ProviderType, string> = {
  WAHA: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  EVOLUTION: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  META_CLOUD: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  TWILIO: 'bg-red-500/10 text-red-600 border-red-500/20',
  BAILEYS: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  CUSTOM: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
};

export function ConnectionManager({
  connections,
  onOpenQR,
  onOpenAddConnection,
}: ConnectionManagerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Provider Connections</h3>
          <p className="text-xs text-slate-500">Multi-provider WhatsApp engine gateway status</p>
        </div>
        <button
          onClick={onOpenAddConnection}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
        >
          + Add Provider
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {connections.map((conn) => (
          <div
            key={conn.id}
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${PROVIDER_COLORS[conn.providerType]}`}>
                  {conn.providerType}
                </span>
                {conn.isDefault && (
                  <span className="rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-1.5 py-0.5">
                    DEFAULT
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  {conn.status}
                </span>
              </div>
            </div>

            <div className="mt-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{conn.name}</h4>
              <p className="text-xs font-mono text-slate-500 mt-0.5">{conn.phoneNumber}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 text-xs text-slate-500">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Latency</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{conn.latencyMs}ms</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Sent Today</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{conn.messageCountToday} msgs</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                onClick={onOpenQR}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
              >
                <QrCode className="h-3.5 w-3.5" /> Show QR
              </button>
              <button
                onClick={() => alert(`Restarting ${conn.name}...`)}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Restart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

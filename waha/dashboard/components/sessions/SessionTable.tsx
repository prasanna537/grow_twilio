"use client";

import { useState } from "react";
import { SessionInfo, WAHASessionStatus } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SessionActions } from "./SessionActions";
import { QRModal } from "@/components/ui/QRModal";
import { Smartphone } from "lucide-react";

interface SessionTableProps {
  sessions: SessionInfo[];
}

export function SessionTable({ sessions }: SessionTableProps) {
  const [activeQRModalSession, setActiveQRModalSession] = useState<string | null>(null);

  return (
    <>
      <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-5 py-3.5">Session Name</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 hidden sm:table-cell">Account / Me</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Presence</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">Last Activity</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {sessions.map((session) => (
                <tr
                  key={session.name}
                  className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <Smartphone className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {session.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      status={session.status}
                      onClick={
                        session.status === WAHASessionStatus.SCAN_QR_CODE
                          ? () => setActiveQRModalSession(session.name)
                          : undefined
                      }
                    />
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell text-slate-600 dark:text-slate-300 font-medium">
                    {session.me?.pushName || session.me?.id ? (
                      <div>
                        <span>{session.me.pushName || "WhatsApp User"}</span>
                        {session.me.id && (
                          <span className="block text-[11px] text-slate-400 font-mono">
                            {session.me.id.split("@")[0]}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-slate-600 dark:text-slate-400 capitalize">
                    {session.presence || "Offline"}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-xs text-slate-500">
                    {session.timestamps?.activity
                      ? new Date(session.timestamps.activity).toLocaleString()
                      : "Never"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <SessionActions session={session} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeQRModalSession && (
        <QRModal
          sessionName={activeQRModalSession}
          isOpen={Boolean(activeQRModalSession)}
          onClose={() => setActiveQRModalSession(null)}
        />
      )}
    </>
  );
}

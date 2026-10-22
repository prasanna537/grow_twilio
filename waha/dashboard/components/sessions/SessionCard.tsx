"use client";

import { useState } from "react";
import { SessionInfo, WAHASessionStatus } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SessionActions } from "./SessionActions";
import { QRModal } from "@/components/ui/QRModal";
import { Smartphone, Activity, Clock, ShieldCheck, QrCode } from "lucide-react";

interface SessionCardProps {
  session: SessionInfo;
}

export function SessionCard({ session }: SessionCardProps) {
  const [showQRModal, setShowQRModal] = useState(false);

  const isScanQR = session.status === WAHASessionStatus.SCAN_QR_CODE;

  return (
    <>
      <div className="glass-card relative rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between space-y-4 group">
        {/* Top header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {session.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                {session.me?.pushName ? session.me.pushName : "No Account Linked"}
              </p>
            </div>
          </div>
          <StatusBadge
            status={session.status}
            onClick={isScanQR ? () => setShowQRModal(true) : undefined}
          />
        </div>

        {/* QR Inline Callout banner if SCAN_QR_CODE */}
        {isScanQR && (
          <button
            onClick={() => setShowQRModal(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all"
          >
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-amber-500" />
              <span>Scan QR Code to Link</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
              Open Scanner &rarr;
            </span>
          </button>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">
              {session.me?.id ? session.me.id.split("@")[0] : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Activity className="h-3.5 w-3.5 text-slate-400" />
            <span className="capitalize">{session.presence || "Offline"}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 col-span-2">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>
              Last active:{" "}
              {session.timestamps?.activity
                ? new Date(session.timestamps.activity).toLocaleTimeString()
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setShowQRModal(true)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View Details / QR
          </button>
          <SessionActions session={session} />
        </div>
      </div>

      <QRModal
        sessionName={session.name}
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </>
  );
}

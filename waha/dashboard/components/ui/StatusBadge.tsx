"use client";

import { WAHASessionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  WAHASessionStatus,
  { label: string; className: string; dotClassName: string }
> = {
  [WAHASessionStatus.WORKING]: {
    label: "Working",
    className:
      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
    dotClassName: "bg-emerald-500 pulse-active",
  },
  [WAHASessionStatus.STARTING]: {
    label: "Starting",
    className:
      "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30",
    dotClassName: "bg-blue-500 animate-pulse",
  },
  [WAHASessionStatus.SCAN_QR_CODE]: {
    label: "Scan QR",
    className:
      "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30",
    dotClassName: "bg-amber-500 animate-bounce",
  },
  [WAHASessionStatus.STOPPED]: {
    label: "Stopped",
    className:
      "bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30",
    dotClassName: "bg-slate-400 dark:bg-slate-500",
  },
  [WAHASessionStatus.FAILED]: {
    label: "Failed",
    className:
      "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30",
    dotClassName: "bg-rose-500 animate-ping",
  },
  [WAHASessionStatus.PASSKEY_REQUIRED]: {
    label: "Passkey Required",
    className:
      "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30",
    dotClassName: "bg-purple-500",
  },
  [WAHASessionStatus.PASSKEY_CONFIRMATION_REQUIRED]: {
    label: "Confirm Passkey",
    className:
      "bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-500/30",
    dotClassName: "bg-violet-500",
  },
  [WAHASessionStatus.LOGGED_OUT]: {
    label: "Logged Out",
    className:
      "bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30",
    dotClassName: "bg-slate-400",
  },
  [WAHASessionStatus.DISCONNECTED]: {
    label: "Disconnected",
    className:
      "bg-zinc-500/15 text-zinc-700 dark:text-zinc-400 border border-zinc-500/30",
    dotClassName: "bg-zinc-400",
  },
};

interface StatusBadgeProps {
  status: WAHASessionStatus;
  className?: string;
  onClick?: () => void;
}

export function StatusBadge({ status, className, onClick }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30",
    dotClassName: "bg-slate-400",
  };

  return (
    <span
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`Session status: ${config.label}`}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-xs transition-all",
        config.className,
        onClick && "cursor-pointer hover:opacity-80 active:scale-95",
        className
      )}
    >
      <span className={cn("w-2 h-2 rounded-full shrink-0", config.dotClassName)} />
      <span>{config.label}</span>
    </span>
  );
}

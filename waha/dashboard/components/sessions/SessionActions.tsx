"use client";

import {
  Play,
  Square,
  RefreshCw,
  LogOut,
  Trash2,
  QrCode,
  Loader2,
} from "lucide-react";
import { SessionInfo, WAHASessionStatus } from "@/lib/types";
import {
  useStartSession,
  useStopSession,
  useRestartSession,
  useLogoutSession,
} from "@/lib/hooks";
import { toast } from "sonner";
import { useState } from "react";
import { DeleteSessionDialog } from "./DeleteSessionDialog";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SessionActionsProps {
  session: SessionInfo;
}

export function SessionActions({ session }: SessionActionsProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);

  const startMut = useStartSession();
  const stopMut = useStopSession();
  const restartMut = useRestartSession();
  const logoutMut = useLogoutSession();

  const isWorking = session.status === WAHASessionStatus.WORKING;
  const isStopped = session.status === WAHASessionStatus.STOPPED;
  const isScanning = session.status === WAHASessionStatus.SCAN_QR_CODE;

  async function handle(
    fn: () => Promise<unknown>,
    successMsg: string
  ) {
    try {
      await fn();
      toast.success(successMsg);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Operation failed";
      toast.error(message);
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        {/* QR Code – only when scanning */}
        {isScanning && (
          <ActionButton
            icon={QrCode}
            label="View QR"
            onClick={() => router.push(`/sessions/${session.name}/qr`)}
            className="text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30"
          />
        )}

        {/* Start */}
        {(isStopped || session.status === WAHASessionStatus.FAILED) && (
          <ActionButton
            icon={Play}
            label="Start"
            loading={startMut.isPending}
            onClick={() =>
              handle(
                () => startMut.mutateAsync(session.name),
                `Session "${session.name}" started`
              )
            }
            className="text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30"
          />
        )}

        {/* Stop */}
        {!isStopped && (
          <ActionButton
            icon={Square}
            label="Stop"
            loading={stopMut.isPending}
            onClick={() =>
              handle(
                () => stopMut.mutateAsync(session.name),
                `Session "${session.name}" stopped`
              )
            }
            className="text-slate-400 hover:bg-slate-500/10 hover:border-slate-500/30"
          />
        )}

        {/* Restart */}
        {!isStopped && (
          <ActionButton
            icon={RefreshCw}
            label="Restart"
            loading={restartMut.isPending}
            onClick={() =>
              handle(
                () => restartMut.mutateAsync(session.name),
                `Session "${session.name}" restarted`
              )
            }
            className="text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30"
          />
        )}

        {/* Logout */}
        {isWorking && (
          <ActionButton
            icon={LogOut}
            label="Logout"
            loading={logoutMut.isPending}
            onClick={() =>
              handle(
                () => logoutMut.mutateAsync(session.name),
                `Session "${session.name}" logged out`
              )
            }
            className="text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30"
          />
        )}

        {/* Delete */}
        <ActionButton
          icon={Trash2}
          label="Delete"
          onClick={() => setShowDelete(true)}
          className="text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30"
        />
      </div>

      {showDelete && (
        <DeleteSessionDialog
          sessionName={session.name}
          onClose={() => setShowDelete(false)}
        />
      )}
    </>
  );
}

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  loading?: boolean;
  className?: string;
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  loading,
  className,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={label}
      className={cn(
        "flex items-center justify-center w-7 h-7 rounded-md border border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

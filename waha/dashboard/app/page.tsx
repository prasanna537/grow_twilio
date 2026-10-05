"use client";

import { useState } from "react";
import {
  Activity,
  CheckCheck,
  ListFilter,
  LoaderCircle,
  LogOut,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Smartphone,
  Square,
  X,
  ShieldCheck,
  Zap,
  Trash2,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  useSessions,
  useStartSession,
  useStopSession,
  useRestartSession,
  useLogoutSession,
  useCreateSession,
  useVersion,
  useDeleteSession,
} from "@/lib/hooks";
import { WAHASessionStatus, SessionInfo } from "@/lib/types";
import { CreateSessionDialog } from "@/components/sessions/CreateSessionDialog";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { StatCardSkeleton } from "@/components/ui/Skeleton";

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: WAHASessionStatus }) {
  const styles: Record<WAHASessionStatus, string> = {
    [WAHASessionStatus.WORKING]: "status-working",
    [WAHASessionStatus.STARTING]: "status-starting",
    [WAHASessionStatus.SCAN_QR_CODE]: "status-scanning",
    [WAHASessionStatus.PASSKEY_REQUIRED]: "status-scanning",
    [WAHASessionStatus.PASSKEY_CONFIRMATION_REQUIRED]: "status-scanning",
    [WAHASessionStatus.FAILED]: "status-failed",
    [WAHASessionStatus.STOPPED]: "status-stopped",
    [WAHASessionStatus.LOGGED_OUT]: "status-stopped",
    [WAHASessionStatus.DISCONNECTED]: "status-failed",
  };
  return (
    <span className={cn("status-badge", styles[status])}>
      <span className="size-1.5 rounded-full bg-current" />
      {status.replaceAll("_", " ")}
    </span>
  );
}

// ─── Metric Card ───────────────────────────────────────────────────────────────
function Metric({
  icon: Icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  trend: string;
  positive?: boolean;
}) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <span className="metric-icon">
          <Icon className="size-4" />
        </span>
        <span
          className={cn(
            "text-[11px]",
            positive ? "text-emerald-500" : "text-muted-foreground"
          )}
        >
          {trend}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// ─── Session Card ──────────────────────────────────────────────────────────────
const SESSION_COLORS = [
  "bg-emerald-600",
  "bg-indigo-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-violet-600",
  "bg-teal-600",
];

function SessionCard({ session, index }: { session: SessionInfo; index: number }) {
  const startSession = useStartSession();
  const stopSession = useStopSession();
  const restartSession = useRestartSession();
  const logoutSession = useLogoutSession();
  const deleteSession = useDeleteSession();
  const color = SESSION_COLORS[index % SESSION_COLORS.length];
  const isLoading =
    startSession.isPending ||
    stopSession.isPending ||
    restartSession.isPending ||
    logoutSession.isPending ||
    deleteSession.isPending;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete session "${session.name}"?`)) {
      deleteSession.mutate(session.name);
    }
  };

  const handleLogout = () => {
    if (confirm(`Are you sure you want to log out of session "${session.name}"? This will unlink the WhatsApp account.`)) {
      logoutSession.mutate(session.name);
    }
  };

  return (
    <div className="session-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("session-avatar", color)}>
            <Smartphone className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/sessions/${session.name}/qr`}
                className="font-medium text-sm hover:underline hover:text-primary transition-colors"
              >
                {session.name}
              </Link>
              <StatusBadge status={session.status} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {session.me?.pushName || session.me?.id || "Not linked"}
            </p>
          </div>
        </div>
        <button className="icon-button -mr-2 -mt-2">
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-4">
        <div>
          <p className="data-label">Status</p>
          <p className="mt-1 text-xs font-medium">{session.status}</p>
        </div>
        <div>
          <p className="data-label">Presence</p>
          <p className="mt-1 text-xs font-medium capitalize">
            {session.presence || "offline"}
          </p>
        </div>
      </div>

      {/* QR Banner if SCAN_QR_CODE or STARTING */}
      {(session.status === WAHASessionStatus.SCAN_QR_CODE || session.status === WAHASessionStatus.STARTING) && (
        <Link
          href={`/sessions/${session.name}/qr`}
          className="mt-4 flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/15 transition-all text-xs"
        >
          <div className="flex items-center gap-2">
            <QrCode className="size-4 animate-pulse" />
            <span className="font-semibold">
              {session.status === WAHASessionStatus.SCAN_QR_CODE
                ? "Scan QR Code to Link"
                : "Starting session... Open link screen"}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
            Open Scanner &rarr;
          </span>
        </Link>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {session.status === WAHASessionStatus.WORKING ? (
          <button
            className="soft-button"
            onClick={() => stopSession.mutate(session.name)}
            disabled={isLoading}
          >
            {stopSession.isPending ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <Square className="size-3.5" />
            )}
            Stop
          </button>
        ) : (
          <button
            className="soft-button"
            onClick={() => startSession.mutate(session.name)}
            disabled={isLoading}
          >
            {startSession.isPending ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            Start
          </button>
        )}
        <button
          className="soft-button"
          onClick={() => restartSession.mutate(session.name)}
          disabled={isLoading}
        >
          <RefreshCw className="size-3.5" />
          Restart
        </button>

        {/* Scan QR Button */}
        {(session.status === WAHASessionStatus.SCAN_QR_CODE || session.status === WAHASessionStatus.STARTING) && (
          <Link
            href={`/sessions/${session.name}/qr`}
            className="soft-button bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
          >
            <QrCode className="size-3.5" />
            Scan QR
          </Link>
        )}

        <button
          className="soft-button text-rose-500 hover:border-rose-500 hover:text-rose-500"
          onClick={handleDelete}
          disabled={isLoading}
        >
          {deleteSession.isPending ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
          Delete
        </button>
        <button
          className="soft-button ml-auto text-muted-foreground"
          onClick={handleLogout}
          disabled={isLoading}
        >
          <LogOut className="size-3.5" />
          Logout
        </button>
      </div>
    </div>
  );
}

// ─── Page Header ───────────────────────────────────────────────────────────────
function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const {
    data: sessions,
    isLoading,
    error,
    refetch,
  } = useSessions(true);
  const { data: version } = useVersion();
  const [showCreate, setShowCreate] = useState(false);

  const total = sessions?.length ?? 0;
  const connected =
    sessions?.filter((s) => s.status === WAHASessionStatus.WORKING).length ??
    0;
  const stopped =
    sessions?.filter((s) => s.status === WAHASessionStatus.STOPPED).length ??
    0;
  const failed =
    sessions?.filter((s) => s.status === WAHASessionStatus.FAILED).length ?? 0;

  return (
    <>
      <PageHeader
        title="Sessions"
        description="Manage your WhatsApp connections and API sessions."
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="primary-button"
          >
            <Plus className="size-4" />
            New session
          </button>
        }
      />

      {/* Metrics */}
      {isLoading ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorAlert
          message="Failed to connect to WAHA backend. Is the server running?"
          onRetry={refetch}
        />
      ) : (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={Activity}
            label="Total sessions"
            value={String(total)}
            trend={`${total} registered`}
          />
          <Metric
            icon={Smartphone}
            label="Active sessions"
            value={`${connected} / ${total}`}
            trend={
              total > 0
                ? `${Math.round((connected / total) * 100)}% online`
                : "0% online"
            }
            positive={connected > 0}
          />
          <Metric
            icon={CheckCheck}
            label="Stopped / Failed"
            value={`${stopped + failed}`}
            trend={failed > 0 ? `${failed} failed` : "All healthy"}
            positive={failed === 0}
          />
          <Metric
            icon={Zap}
            label="API version"
            value={version ? `v${version.version}` : "—"}
            trend={version?.tier || "WAHA"}
          />
        </div>
      )}

      {/* Sessions grid */}
      {!isLoading && !error && sessions && (
        <>
          <div className="section-label">
            <span>All sessions</span>
            <button className="text-button" onClick={() => refetch()}>
              <RefreshCw className="size-3.5" />
              Refresh
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="panel flex flex-col items-center justify-center gap-4 py-16">
              <div className="session-avatar bg-muted mx-auto">
                <Smartphone className="size-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">No sessions yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create a session to start sending WhatsApp messages.
                </p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="primary-button"
              >
                <Plus className="size-4" />
                Create session
              </button>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {sessions.map((session, i) => (
                <SessionCard key={session.name} session={session} index={i} />
              ))}
            </div>
          )}
        </>
      )}

      <CreateSessionDialog
        open={showCreate}
        onOpenChange={setShowCreate}
      />
    </>
  );
}

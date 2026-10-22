"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  ChevronRight,
  CircleHelp,
  Copy,
  Filter,
  ListFilter,
  LoaderCircle,
  MoreHorizontal,
  Paperclip,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Smartphone,
  Square,
  Play,
  LogOut,
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
  useDeleteSession,
} from "@/lib/hooks";
import { WAHASessionStatus, SessionInfo } from "@/lib/types";
import { CreateSessionDialog } from "@/components/sessions/CreateSessionDialog";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { StatCardSkeleton } from "@/components/ui/Skeleton";

const SESSION_COLORS = [
  "bg-emerald-600",
  "bg-indigo-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-violet-600",
  "bg-teal-600",
];

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

function SessionCard({ session, index }: { session: SessionInfo; index: number }) {
  const start = useStartSession();
  const stop = useStopSession();
  const restart = useRestartSession();
  const logout = useLogoutSession();
  const deleteSession = useDeleteSession();
  const color = SESSION_COLORS[index % SESSION_COLORS.length];
  const loading = start.isPending || stop.isPending || restart.isPending || logout.isPending || deleteSession.isPending;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete session "${session.name}"?`)) {
      deleteSession.mutate(session.name);
    }
  };

  const handleLogout = () => {
    if (confirm(`Are you sure you want to log out of session "${session.name}"? This will unlink the WhatsApp account.`)) {
      logout.mutate(session.name);
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
          <p className="mt-1 text-xs font-medium capitalize">{session.presence || "offline"}</p>
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
          <button className="soft-button" onClick={() => stop.mutate(session.name)} disabled={loading}>
            {stop.isPending ? <LoaderCircle className="size-3.5 animate-spin" /> : <Square className="size-3.5" />}
            Stop
          </button>
        ) : (
          <button className="soft-button" onClick={() => start.mutate(session.name)} disabled={loading}>
            {start.isPending ? <LoaderCircle className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            Start
          </button>
        )}
        <button className="soft-button" onClick={() => restart.mutate(session.name)} disabled={loading}>
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

        <button className="soft-button text-rose-500 hover:border-rose-500 hover:text-rose-500" onClick={handleDelete} disabled={loading}>
          {deleteSession.isPending ? <LoaderCircle className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
          Delete
        </button>
        <button className="soft-button ml-auto text-muted-foreground" onClick={handleLogout} disabled={loading}>
          <LogOut className="size-3.5" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default function SessionsPage() {
  const { data: sessions, isLoading, error, refetch, isFetching } = useSessions(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = (sessions || []).filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.me?.pushName && s.me.pushName.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Session Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sessions ? `${sessions.length} session${sessions.length !== 1 ? "s" : ""} configured` : "Manage your WhatsApp connections."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} disabled={isFetching} className="soft-button">
            <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
            Refresh
          </button>
          <button onClick={() => setShowCreate(true)} className="primary-button">
            <Plus className="size-4" />
            New session
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 panel p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="input-shell flex-1 max-w-sm">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sessions..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input w-44"
          >
            <option value="ALL">All statuses</option>
            <option value={WAHASessionStatus.WORKING}>Working</option>
            <option value={WAHASessionStatus.SCAN_QR_CODE}>Scan QR</option>
            <option value={WAHASessionStatus.STOPPED}>Stopped</option>
            <option value={WAHASessionStatus.FAILED}>Failed</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <ErrorAlert
          message="Failed to load sessions. Is the WAHA backend running?"
          onRetry={refetch}
        />
      ) : filtered.length === 0 ? (
        <div className="panel flex flex-col items-center justify-center gap-4 py-16">
          <div className="session-avatar bg-muted mx-auto">
            <Smartphone className="size-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">No sessions found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {search || statusFilter !== "ALL" ? "Try adjusting your filters." : "Create your first session to get started."}
            </p>
          </div>
          {!search && statusFilter === "ALL" && (
            <button onClick={() => setShowCreate(true)} className="primary-button">
              <Plus className="size-4" />
              Create session
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((s, i) => (
            <SessionCard key={s.name} session={s} index={i} />
          ))}
        </div>
      )}

      <CreateSessionDialog open={showCreate} onOpenChange={setShowCreate} />
    </>
  );
}

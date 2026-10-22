"use client";

import { useState, useEffect } from "react";
import {
  ArrowDownToLine,
  ChevronRight,
  Filter,
  Search,
  Trash2,
} from "lucide-react";
import { getStoredLogs, clearLogs } from "@/lib/store";
import { ActivityLogEntry } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const loadLogs = () => setLogs(getStoredLogs());

  useEffect(() => {
    loadLogs();
    window.addEventListener("waha_logs_updated", loadLogs);
    return () => window.removeEventListener("waha_logs_updated", loadLogs);
  }, []);

  const filtered = logs.filter((log) => {
    const matchSearch =
      log.title.toLowerCase().includes(search.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase())) ||
      (log.session && log.session.toLowerCase().includes(search.toLowerCase()));
    const matchCat = categoryFilter === "ALL" || log.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waha_logs_${Date.now()}.json`;
    a.click();
    toast.success("Logs exported!");
  };

  const handleClear = () => {
    clearLogs();
    loadLogs();
    toast.success("Logs cleared");
  };

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Logs & events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inspect API activity and session events in real time.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="soft-button" onClick={handleExport} disabled={logs.length === 0}>
            <ArrowDownToLine className="size-3.5" />
            Export
          </button>
          <button className="soft-button text-destructive" onClick={handleClear} disabled={logs.length === 0}>
            <Trash2 className="size-3.5" />
            Clear
          </button>
        </div>
      </div>

      <div className="panel">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
          <div className="input-shell flex-1">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, IDs, or payloads"
            />
          </div>
          <select
            className="form-input sm:w-44"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All event types</option>
            <option value="session">session</option>
            <option value="message">message</option>
            <option value="api">api</option>
            <option value="webhook">webhook</option>
            <option value="system">system</option>
          </select>
        </div>

        {/* Log rows */}
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <p>No log entries match your criteria.</p>
              <p className="mt-1 text-muted-foreground/60">Activity events will appear here automatically.</p>
            </div>
          ) : (
            filtered.map((log) => (
              <details key={log.id} className="group">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4">
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" />
                  <span className="log-dot" />
                  <span className="rounded bg-muted px-2 py-1 font-mono text-[10px] text-primary">
                    {log.category}
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {log.title}
                  </span>
                  {log.session && (
                    <span className="hidden text-[10px] text-muted-foreground/70 sm:inline">
                      [{log.session}]
                    </span>
                  )}
                  <span
                    className={cn(
                      "ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                      log.severity === "error" && "bg-rose-500/10 text-rose-500",
                      log.severity === "warn" && "bg-amber-500/10 text-amber-500",
                      log.severity === "success" && "bg-emerald-500/10 text-emerald-500",
                      log.severity === "info" && "bg-muted text-muted-foreground"
                    )}
                  >
                    {log.severity}
                  </span>
                  <time className="font-mono text-[10px] text-muted-foreground ml-2">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </time>
                </summary>
                <div className="ml-11 mr-4 mb-4 rounded-lg bg-muted/50 p-3 font-mono text-[11px] leading-5 text-muted-foreground">
                  <p><strong>Title:</strong> {log.title}</p>
                  {log.details && <p><strong>Details:</strong> {log.details}</p>}
                  {log.session && <p><strong>Session:</strong> {log.session}</p>}
                  <p><strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </details>
            ))
          )}
        </div>
      </div>
    </>
  );
}

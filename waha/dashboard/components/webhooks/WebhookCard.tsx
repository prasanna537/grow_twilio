"use client";

import { useState } from "react";
import { WebhookConfig } from "@/lib/types";
import { Webhook, Check, Send, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface WebhookCardProps {
  webhook: WebhookConfig;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function WebhookCard({ webhook, onEdit, onDelete }: WebhookCardProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "error" | null>(null);

  const handleTestWebhook = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Simulate client HTTP ping request to target URL
      await fetch(webhook.url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "webhook.test", timestamp: Date.now() }),
      });
      setTestResult("ok");
      toast.success("Webhook test payload pinged!");
    } catch {
      setTestResult("error");
      toast.error("Webhook test failed. Verify endpoint URL.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-4 hover:border-indigo-500/30 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
            <Webhook className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono truncate max-w-xs">
              {webhook.url}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Subscribed to {webhook.events.length} event types
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Edit Webhook"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Delete Webhook"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Subscribed events tags */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {webhook.events.map((ev) => (
          <span
            key={ev}
            className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-semibold"
          >
            {ev}
          </span>
        ))}
      </div>

      {/* Footer test button */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
        {testResult === "ok" ? (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" /> Ping OK
          </span>
        ) : (
          <span className="text-[11px] text-slate-400">Status: Active</span>
        )}

        <button
          type="button"
          onClick={handleTestWebhook}
          disabled={testing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-500/20 transition-all disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          {testing ? "Testing..." : "Test Webhook"}
        </button>
      </div>
    </div>
  );
}

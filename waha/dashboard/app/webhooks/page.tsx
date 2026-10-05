"use client";

import { useState, useEffect } from "react";
import {
  Check,
  ArrowDownToLine,
  MoreHorizontal,
  Plus,
  Webhook as WebhookIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getStoredWebhooks, saveStoredWebhooks } from "@/lib/store";
import { WebhookConfig } from "@/lib/types";
import { WebhookFormModal } from "@/components/webhooks/WebhookFormModal";
import { toast } from "sonner";

const WEBHOOK_EVENTS = ["message", "message.ack", "session.status", "group.join"];

function WebhookRow({
  webhook,
  onDelete,
  onTest,
}: {
  webhook: WebhookConfig;
  onDelete: () => void;
  onTest: () => void;
}) {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="webhook-icon">
            <WebhookIcon className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{webhook.url.split("/").pop() || "Webhook"}</p>
            <p className="mt-1 break-all text-xs text-muted-foreground">{webhook.url}</p>
          </div>
        </div>
        <button
          onClick={() => setEnabled((p) => !p)}
          className={cn("toggle", enabled && "toggle-on")}
          type="button"
          aria-label="Toggle webhook"
        >
          <span />
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(webhook.events.length > 0 ? webhook.events : WEBHOOK_EVENTS).map((event) => (
          <span key={event} className="event-chip">
            <Check className="size-3 text-primary" />
            {event}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <span className={cn("status-badge", enabled ? "status-working" : "status-stopped")}>
          <span className="size-1.5 rounded-full bg-current" />
          {enabled ? "ENABLED" : "DISABLED"}
        </span>
        <button className="text-button ml-auto" onClick={onTest}>
          Test webhook <ArrowDownToLine className="inline size-3.5" />
        </button>
        <button className="icon-button" onClick={onDelete}>
          <MoreHorizontal className="size-4" />
        </button>
      </div>
    </div>
  );
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadWebhooks = () => setWebhooks(getStoredWebhooks());

  useEffect(() => {
    loadWebhooks();
    window.addEventListener("waha_webhooks_updated", loadWebhooks);
    return () => window.removeEventListener("waha_webhooks_updated", loadWebhooks);
  }, []);

  const handleAdd = (w: WebhookConfig) => {
    saveStoredWebhooks([...webhooks, w]);
    loadWebhooks();
    toast.success("Webhook saved!");
  };

  const handleDelete = (url: string) => {
    saveStoredWebhooks(webhooks.filter((w) => w.url !== url));
    loadWebhooks();
    toast.success("Webhook removed");
  };

  const handleTest = (url: string) => {
    toast.info(`Test ping sent to ${url}`);
  };

  // Mock recent deliveries (in real scenario you'd poll backend)
  const recentDeliveries = [
    { event: "message", detail: "Incoming message received", time: "2s ago" },
    { event: "session.status", detail: "Session status changed", time: "12s ago" },
    { event: "message.ack", detail: "Message delivered", time: "28s ago" },
  ];

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Webhooks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Send real-time events to your application endpoints.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="primary-button">
          <Plus className="size-4" />
          Add webhook
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Webhooks list */}
        <div className="panel divide-y divide-border">
          {webhooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="webhook-icon w-12 h-12">
                <WebhookIcon className="size-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">No webhooks configured</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add a webhook URL to receive real-time events.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="primary-button">
                <Plus className="size-4" />
                Add webhook
              </button>
            </div>
          ) : (
            webhooks.map((wh) => (
              <WebhookRow
                key={wh.url}
                webhook={wh}
                onDelete={() => handleDelete(wh.url)}
                onTest={() => handleTest(wh.url)}
              />
            ))
          )}
        </div>

        {/* Recent delivery log */}
        <div className="panel">
          <div className="border-b border-border p-4">
            <p className="text-sm font-medium">Recent delivery</p>
            <p className="mt-1 text-xs text-muted-foreground">Live response log</p>
          </div>
          <div className="flex flex-col gap-4 p-4">
            {recentDeliveries.map((d) => (
              <div key={d.event + d.time} className="flex items-start gap-3">
                <div className="mt-1 size-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <div className="flex gap-2">
                    <span className="text-xs font-medium">{d.event}</span>
                    <span className="text-[10px] text-muted-foreground">{d.time}</span>
                  </div>
                  <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                    200 OK · {d.detail}
                  </p>
                </div>
              </div>
            ))}
            {webhooks.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No deliveries yet
              </p>
            )}
          </div>
        </div>
      </div>

      <WebhookFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAdd}
      />
    </>
  );
}

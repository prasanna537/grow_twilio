"use client";

import { ActivityLogEntry, SystemAlert, WAMessage, WebhookConfig } from "./types";

const LOGS_KEY = "waha_activity_logs";
const ALERTS_KEY = "waha_system_alerts";
const MESSAGES_KEY = "waha_sent_messages";
const WEBHOOKS_KEY = "waha_local_webhooks";

export function getStoredLogs(): ActivityLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addLogEntry(entry: Omit<ActivityLogEntry, "id" | "timestamp">): ActivityLogEntry {
  const logs = getStoredLogs();
  const newEntry: ActivityLogEntry = {
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };
  const updated = [newEntry, ...logs].slice(0, 500); // Keep last 500
  if (typeof window !== "undefined") {
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("waha_logs_updated"));
  }
  return newEntry;
}

export function clearLogs(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOGS_KEY);
    window.dispatchEvent(new Event("waha_logs_updated"));
  }
}

// ─── Alerts ─────────────────────────────────────────────────────────────────

export function getStoredAlerts(): SystemAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(ALERTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addAlert(alert: Omit<SystemAlert, "id" | "timestamp" | "read">): SystemAlert {
  const alerts = getStoredAlerts();
  const newAlert: SystemAlert = {
    ...alert,
    id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    read: false,
  };
  const updated = [newAlert, ...alerts].slice(0, 100);
  if (typeof window !== "undefined") {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("waha_alerts_updated"));
  }
  return newAlert;
}

export function markAlertAsRead(id: string): void {
  const alerts = getStoredAlerts().map((a) =>
    a.id === id ? { ...a, read: true } : a
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    window.dispatchEvent(new Event("waha_alerts_updated"));
  }
}

export function markAllAlertsAsRead(): void {
  const alerts = getStoredAlerts().map((a) => ({ ...a, read: true }));
  if (typeof window !== "undefined") {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
    window.dispatchEvent(new Event("waha_alerts_updated"));
  }
}

export function clearAlerts(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ALERTS_KEY);
    window.dispatchEvent(new Event("waha_alerts_updated"));
  }
}

// ─── Message History ──────────────────────────────────────────────────────────

export function getStoredMessageHistory(): WAMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSentMessage(msg: WAMessage): void {
  const history = getStoredMessageHistory();
  const updated = [msg, ...history].slice(0, 200);
  if (typeof window !== "undefined") {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("waha_messages_updated"));
  }
}

// ─── Webhooks local store ────────────────────────────────────────────────────

export function getStoredWebhooks(): WebhookConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(WEBHOOKS_KEY);
    return data
      ? JSON.parse(data)
      : [
          {
            url: "https://example.com/waha/webhook",
            events: ["message", "session.status"],
          },
        ];
  } catch {
    return [];
  }
}

export function saveStoredWebhooks(webhooks: WebhookConfig[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(WEBHOOKS_KEY, JSON.stringify(webhooks));
    window.dispatchEvent(new Event("waha_webhooks_updated"));
  }
}

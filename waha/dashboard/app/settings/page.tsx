"use client";

import { useState, useEffect } from "react";
import {
  Check,
  Code2,
  Copy,
  KeyRound,
  Loader2,
  Plus,
  Save,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  useApiKeys,
  useCreateApiKey,
  useDeleteApiKey,
} from "@/lib/hooks";
import { saveSettings, loadSettings, testConnection } from "@/lib/api";
import { WAHAEnvironment } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium">{label}</span>
      {children}
    </label>
  );
}

export default function SettingsPage() {
  const { data: apiKeys, isLoading: keysLoading } = useApiKeys();
  const createKey = useCreateApiKey();
  const deleteKey = useDeleteApiKey();

  const [revealed, setRevealed] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");

  // Connection settings
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");
  const [apiKey, setApiKey] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [versionInfo, setVersionInfo] = useState<WAHAEnvironment | null>(null);

  useEffect(() => {
    const settings = loadSettings();
    setBaseUrl(settings.baseUrl);
    setApiKey(settings.apiKey);
  }, []);

  const handleSave = () => {
    saveSettings({ baseUrl, apiKey });
    toast.success("Settings saved!");
  };

  const handleTest = async () => {
    saveSettings({ baseUrl, apiKey });
    setTestStatus("loading");
    try {
      const info = await testConnection();
      setVersionInfo(info);
      setTestStatus("ok");
      toast.success("Connected to WAHA backend!");
    } catch {
      setTestStatus("error");
      toast.error("Connection failed. Check Base URL and API key.");
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    try {
      await createKey.mutateAsync({ name: newKeyName });
      setNewKeyName("");
      toast.success("API key created!");
    } catch {
      toast.error("Failed to create API key");
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await deleteKey.mutateAsync(id);
      toast.success("API key deleted");
    } catch {
      toast.error("Failed to delete API key");
    }
  };

  const handleCopy = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API keys & settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control access to your API and configure workspace defaults.
          </p>
        </div>
        <button onClick={handleSave} className="primary-button">
          <Save className="size-4" />
          Save settings
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        {/* API Keys panel */}
        <div className="panel">
          <div className="border-b border-border p-4">
            <p className="text-sm font-medium">API keys</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Keys grant access to your connected sessions.
            </p>
          </div>

          {/* Create form */}
          <form onSubmit={handleCreateKey} className="flex gap-2 p-4 border-b border-border">
            <input
              type="text"
              className="form-input flex-1"
              placeholder="Key name (e.g. Zapier-Integration)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
            <button
              type="submit"
              className="primary-button"
              disabled={createKey.isPending || !newKeyName}
            >
              {createKey.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Generate
            </button>
          </form>

          <div className="divide-y divide-border">
            {keysLoading ? (
              <div className="p-4 text-xs text-muted-foreground text-center">Loading API keys...</div>
            ) : !apiKeys || apiKeys.length === 0 ? (
              <div className="p-8 text-center">
                <div className="key-icon mx-auto mb-3">
                  <KeyRound className="size-4" />
                </div>
                <p className="text-sm font-medium">No API keys found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create a key above to get started.
                </p>
              </div>
            ) : (
              apiKeys.map((key) => (
                <div key={key.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="key-icon">
                    <KeyRound className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{key.name}</p>
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                      {revealed === key.id && key.key ? key.key : "wh_••••••••••••••••"}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setRevealed(revealed === key.id ? null : key.id)}
                      className="icon-button"
                      title="Reveal key"
                    >
                      <Code2 className="size-4" />
                    </button>
                    {key.key && (
                      <button
                        onClick={() => handleCopy(key.key!, key.id)}
                        className="icon-button"
                        title="Copy key"
                      >
                        {copiedId === key.id ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="icon-button text-destructive"
                      title="Delete key"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* General settings panel */}
        <div className="panel">
          <div className="border-b border-border p-4">
            <p className="text-sm font-medium">Connection settings</p>
            <p className="mt-1 text-xs text-muted-foreground">
              WAHA backend endpoint configuration.
            </p>
          </div>
          <div className="flex flex-col gap-5 p-5">
            <Field label="WAHA Base URL">
              <div className="relative flex items-center">
                <input
                  className="form-input font-mono w-full pr-10"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:3000"
                />
                <button
                  type="button"
                  title="Copy WAHA Base URL"
                  onClick={() => {
                    navigator.clipboard.writeText(baseUrl);
                    setCopiedId("baseUrl");
                    toast.success("Copied to clipboard!");
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="absolute right-2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedId === "baseUrl" ? (
                    <Check className="size-4 text-primary" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            </Field>

            <Field label="API Key (X-Api-Key header)">
              <div className="relative flex items-center">
                <input
                  className="form-input font-mono w-full pr-10"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  title="Copy API Key"
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    setCopiedId("apiKey");
                    toast.success("Copied to clipboard!");
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="absolute right-2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedId === "apiKey" ? (
                    <Check className="size-4 text-primary" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>
            </Field>

            {testStatus === "ok" && versionInfo && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
                <div className="flex items-center gap-2 font-semibold text-primary mb-1">
                  <Wifi className="size-3.5" />
                  Connected to WAHA v{versionInfo.version}
                </div>
                <p className="text-muted-foreground">Engine: {versionInfo.engine} · Tier: {versionInfo.tier}</p>
              </div>
            )}

            {testStatus === "error" && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                <WifiOff className="size-3.5 shrink-0" />
                Connection failed. Check your Base URL and API key.
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                className="soft-button justify-center"
                onClick={handleTest}
                disabled={testStatus === "loading"}
              >
                {testStatus === "loading" ? <Loader2 className="size-3.5 animate-spin" /> : <Wifi className="size-3.5" />}
                Test connection
              </button>
              <button className="primary-button justify-center" onClick={handleSave}>
                <Save className="size-3.5" />
                Save settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

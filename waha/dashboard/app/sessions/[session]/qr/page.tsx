"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { useSession, usePairingCode } from "@/lib/hooks";
import { getQRImageUrl, fetchQRValue } from "@/lib/api";
import { WAHASessionStatus } from "@/lib/types";
import {
  QrCode,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Phone,
  Smartphone,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QRPageProps {
  params: Promise<{ session: string }>;
}

export default function QRPage({ params }: QRPageProps) {
  const { session: sessionName } = use(params);
  const { data: session, isLoading, error, refetch } = useSession(sessionName);

  const [activeTab, setActiveTab] = useState<"qr" | "pairing">("qr");
  const [qrTimestamp, setQrTimestamp] = useState(Date.now());
  const [countdown, setCountdown] = useState(20);
  const [qrRaw, setQrRaw] = useState<string | null>(null);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const pairingMutation = usePairingCode();

  const isScanning = session?.status === WAHASessionStatus.SCAN_QR_CODE;
  const isWorking = session?.status === WAHASessionStatus.WORKING;
  const isStarting = session?.status === WAHASessionStatus.STARTING;

  // Auto refresh timer
  useEffect(() => {
    if (!isScanning && !isStarting) return;

    if (isScanning) {
      fetchQRValue(sessionName).then(setQrRaw);
    }

    const timer = setInterval(() => {
      if (isScanning) {
        setCountdown((prev) => {
          if (prev <= 1) {
            setQrTimestamp(Date.now());
            fetchQRValue(sessionName).then(setQrRaw);
            refetch();
            return 20;
          }
          return prev - 1;
        });
      } else if (isStarting) {
        refetch();
      }
    }, isScanning ? 1000 : 3000);

    return () => clearInterval(timer);
  }, [isScanning, isStarting, sessionName, refetch]);

  const handleRequestPairingCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    try {
      const res = await pairingMutation.mutateAsync({
        session: sessionName,
        phoneNumber: phoneNumber.replace(/[^0-9]/g, ""),
      });
      setPairingCode(res.code);
      toast.success("Pairing code generated successfully!");
    } catch {
      toast.error("Failed to generate pairing code. Verify phone number.");
    }
  };

  const handleCopyCode = () => {
    if (!pairingCode) return;
    navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = `${getQRImageUrl(sessionName)}&_t=${qrTimestamp}`;

  return (
    <div>
      <Navbar title={`Auth Pairing — ${sessionName}`} />
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Link
          href="/sessions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sessions</span>
        </Link>        {isLoading ? (
          <PageLoader />
        ) : error ? (
          <ErrorAlert message="Failed to load session details" onRetry={refetch} />
        ) : !session ? (
          <ErrorAlert message={`Session "${sessionName}" not found`} />
        ) : (
          <div className="space-y-5">
            {/* Header info card */}
            <div className="panel p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {session.name}
                  </h2>
                  <div className="mt-1">
                    <StatusBadge status={session.status} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setQrTimestamp(Date.now());
                  setCountdown(20);
                  refetch();
                }}
                className="soft-button"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {/* If Working */}
            {isWorking ? (
              <div className="panel p-8 text-center space-y-4 bg-emerald-500/5 border border-emerald-500/20">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Session Connected & Working!
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    This WhatsApp instance is authorized and actively communicating with WAHA.
                  </p>
                </div>

                {session.me && (
                  <div className="w-full text-left rounded-lg bg-background p-4 border border-border space-y-2.5 text-xs max-w-md mx-auto">
                    <p className="font-bold text-muted-foreground uppercase tracking-wider text-[9px]">
                      Account Credentials
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Push Name:</span>
                      <span className="font-medium text-foreground">
                        {session.me.pushName || "WhatsApp Account"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-muted-foreground">Phone JID:</span>
                      <span className="text-primary font-semibold">
                        {session.me.id}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : isScanning ? (
              <div className="panel overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-border bg-muted/30 p-1">
                  <button
                    onClick={() => setActiveTab("qr")}
                    className={cn(
                      "flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all",
                      activeTab === "qr"
                        ? "bg-background text-primary shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <QrCode className="h-4 w-4" />
                    Scan QR Code
                  </button>
                  <button
                    onClick={() => setActiveTab("pairing")}
                    className={cn(
                      "flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all",
                      activeTab === "pairing"
                        ? "bg-background text-primary shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Phone className="h-4 w-4" />
                    Phone Pairing Code
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === "qr" ? (
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="p-4 bg-white rounded-xl shadow-[0_0_50px_-12px_theme(colors.primary.500/20%)] border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrUrl}
                          alt="QR Code"
                          className="w-60 h-60 object-contain rounded-lg"
                        />
                      </div>

                      <div className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-muted/40 border border-border text-xs">
                        <span className="text-muted-foreground">
                          Auto-refreshing in <strong className="text-primary font-semibold">{countdown}s</strong>
                        </span>
                        <button
                          onClick={() => {
                            setQrTimestamp(Date.now());
                            setCountdown(20);
                          }}
                          className="text-primary font-bold hover:underline"
                        >
                          Refresh Now
                        </button>
                      </div>

                      {qrRaw && (
                        <div className="w-full text-left space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="data-label">Raw QR Payload</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(qrRaw);
                                toast.success("Payload copied!");
                              }}
                              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              <Copy className="h-3 w-3" />
                              Copy
                            </button>
                          </div>
                          <code className="block p-3 rounded-lg bg-background border border-border text-[10px] text-muted-foreground font-mono break-all max-h-24 overflow-y-auto">
                            {qrRaw}
                          </code>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleRequestPairingCode} className="space-y-4">
                      <div>
                        <label className="block data-label mb-1.5">
                          Phone Number (with Country Code)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. +14155552671"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={pairingMutation.isPending || !phoneNumber}
                        className="primary-button w-full"
                      >
                        {pairingMutation.isPending ? "Generating Code..." : "Request 8-Digit Code"}
                      </button>

                      {pairingCode && (
                        <div className="p-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-500">
                            <ShieldCheck className="h-4 w-4" />
                            WhatsApp Pairing Code
                          </div>
                          <div className="text-3xl font-mono font-extrabold text-foreground tracking-widest">
                            {pairingCode}
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyCode}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-all"
                          >
                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copied ? "Copied" : "Copy to Clipboard"}
                          </button>
                        </div>
                      )}
                    </form>
                  )}
                </div>
              </div>
            ) : isStarting ? (
              <div className="panel p-8 text-center space-y-4 bg-primary/5 border border-primary/20">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Initializing WhatsApp Session...
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Starting the engine and launching the browser context. This may take a minute or two. The QR code will load automatically once ready.
                  </p>
                </div>
              </div>
            ) : (
              <div className="panel p-8 text-center space-y-3">
                <QrCode className="h-8 w-8 text-muted-foreground mx-auto" />
                <h3 className="text-base font-semibold text-foreground">
                  Authentication Unavailable
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Session status is currently <strong className="text-foreground">{session.status}</strong>. Start the session to generate pairing tokens.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

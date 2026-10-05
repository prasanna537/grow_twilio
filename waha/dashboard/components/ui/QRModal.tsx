"use client";

import { useState, useEffect } from "react";
import { X, RefreshCw, QrCode, Smartphone, Copy, Check, ShieldCheck } from "lucide-react";
import { getQRImageUrl, fetchQRValue } from "@/lib/api";
import { usePairingCode } from "@/lib/hooks";
import { toast } from "sonner";

interface QRModalProps {
  sessionName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function QRModal({ sessionName, isOpen, onClose }: QRModalProps) {
  const [activeTab, setActiveTab] = useState<"qr" | "pairing">("qr");
  const [qrRaw, setQrRaw] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(20);
  const [refreshKey, setRefreshKey] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pairingCodeResult, setPairingCodeResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const pairingMutation = usePairingCode();

  // Handle countdown refresh timer for QR code
  useEffect(() => {
    if (!isOpen || activeTab !== "qr") return;

    // Load initial QR raw
    fetchQRValue(sessionName).then(setQrRaw);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setRefreshKey((k) => k + 1);
          fetchQRValue(sessionName).then(setQrRaw);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, activeTab, sessionName, refreshKey]);

  if (!isOpen) return null;

  const handleManualRefresh = () => {
    setCountdown(20);
    setRefreshKey((k) => k + 1);
    fetchQRValue(sessionName).then(setQrRaw);
  };

  const handleRequestPairingCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    try {
      const res = await pairingMutation.mutateAsync({
        session: sessionName,
        phoneNumber: phoneNumber.replace(/[^0-9]/g, ""),
      });
      setPairingCodeResult(res.code);
      toast.success("Pairing code generated!");
    } catch {
      toast.error("Failed to request pairing code. Check phone number.");
    }
  };

  const handleCopyPairingCode = () => {
    if (!pairingCodeResult) return;
    navigator.clipboard.writeText(pairingCodeResult);
    setCopied(true);
    toast.success("Copied code to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const qrImageUrl = `${getQRImageUrl(sessionName)}&t=${refreshKey}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <QrCode className="h-5 w-5 text-indigo-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Pair Session: {sessionName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Link your WhatsApp account to WAHA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-1">
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "qr"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" />
            QR Code Scan
          </button>
          <button
            onClick={() => setActiveTab("pairing")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === "pairing"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Phone Pairing Code
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "qr" ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              {/* Image Frame */}
              <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                {/* eslint-disable-next-html-element-suppression */}
                <img
                  src={qrImageUrl}
                  alt="WhatsApp QR Code"
                  className="w-56 h-56 object-contain rounded-lg"
                />
              </div>

              {/* Live Countdown Progress */}
              <div className="flex items-center justify-between w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                  <span>Auto-refreshing in {countdown}s</span>
                </div>
                <button
                  onClick={handleManualRefresh}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Refresh Now
                </button>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p>1. Open WhatsApp on your phone</p>
                <p>2. Tap Menu or Settings &gt; Linked Devices &gt; Link a Device</p>
                <p>3. Point your camera at this QR code</p>
              </div>

              {qrRaw && (
                <div className="w-full text-left">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Raw QR Value
                  </p>
                  <code className="block p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-mono break-all max-h-16 overflow-y-auto">
                    {qrRaw}
                  </code>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleRequestPairingCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Phone Number (International Format)
                </label>
                <input
                  type="text"
                  placeholder="+14155552671"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Enter phone number registered with WhatsApp without spaces
                </p>
              </div>

              <button
                type="submit"
                disabled={pairingMutation.isPending || !phoneNumber}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
              >
                {pairingMutation.isPending ? "Generating Code..." : "Get Pairing Code"}
              </button>

              {pairingCodeResult && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                    Enter Code in WhatsApp
                  </div>
                  <div className="text-2xl font-mono font-extrabold tracking-widest text-slate-900 dark:text-slate-50">
                    {pairingCodeResult}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPairingCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-all"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy Code"}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

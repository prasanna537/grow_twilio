'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { X, QrCode, RefreshCw, Smartphone, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRCodeModal({ isOpen, onClose }: QRCodeModalProps) {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(30);

  const fetchQR = async () => {
    setLoading(true);
    try {
      const res = await api.getWAHAQR();
      setQrUrl(res.qr);
    } catch {
      setQrUrl('https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=GROW_TWILIO_WAHA_SESSION');
    } finally {
      setLoading(false);
      setCountdown(30);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchQR();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchQR();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Link WhatsApp Device</h3>
              <p className="text-xs text-slate-500">Scan QR with your gym WhatsApp Business phone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 text-xs text-slate-600 dark:text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Animated QR Display */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              {loading ? (
                <div className="flex h-48 w-48 items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
                </div>
              ) : (
                <div className="relative group">
                  <img
                    src={qrUrl}
                    alt="WhatsApp Web QR Code"
                    className="h-48 w-48 rounded-xl shadow-xs border border-white"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 opacity-0 group-hover:opacity-100 transition rounded-xl">
                    <button
                      onClick={fetchQR}
                      className="rounded-full bg-white/90 p-2 text-slate-900 shadow-md hover:bg-white"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                <RefreshCw className="h-3 w-3 text-emerald-600 animate-spin" />
                <span>Auto refresh in {countdown}s</span>
              </div>
            </div>

            {/* Stepper Instructions */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Open WhatsApp</h4>
                  <p className="text-[11px] text-slate-500">On your mobile device</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Tap Menu or Settings</h4>
                  <p className="text-[11px] text-slate-500">Select Linked Devices</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Scan QR Code</h4>
                  <p className="text-[11px] text-slate-500">Point your camera at this screen</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-[11px] font-semibold">End-to-End Encrypted WAHA Gateway</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

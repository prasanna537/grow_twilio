'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ReminderProgress } from '@/lib/providers/types';
import { Send, CheckCircle2, Loader2, X } from 'lucide-react';

interface BulkProgressToastProps {
  active: boolean;
  onFinished: () => void;
}

export function BulkProgressToast({ active, onFinished }: BulkProgressToastProps) {
  const [progress, setProgress] = useState<ReminderProgress>({
    running: false,
    total: 0,
    sent: 0,
    failed: 0,
  });

  useEffect(() => {
    if (!active) return;

    const poll = async () => {
      try {
        const res = await api.getReminderProgress();
        setProgress(res);
        if (!res.running && res.sent >= res.total && res.total > 0) {
          setTimeout(onFinished, 2000);
        }
      } catch {
        // Mock progress step
        setProgress((prev) => {
          const nextSent = Math.min(prev.total, prev.sent + 1);
          const isDone = nextSent >= prev.total;
          if (isDone) setTimeout(onFinished, 2000);
          return { ...prev, sent: nextSent, running: !isDone };
        });
      }
    };

    poll();
    const interval = setInterval(poll, 2000); // Polling every 2s
    return () => clearInterval(interval);
  }, [active, onFinished]);

  if (!active) return null;

  const percentage = progress.total > 0 ? Math.round((progress.sent / progress.total) * 100) : 100;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {progress.running ? (
            <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          )}
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {progress.running ? 'Broadcasting WhatsApp Reminders' : 'Bulk Dispatch Completed'}
          </span>
        </div>
        <span className="text-xs font-extrabold text-emerald-600">{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-emerald-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-500">
        <span>
          Sent {progress.sent} of {progress.total} messages
        </span>
        {progress.failed > 0 && <span className="text-red-500 font-bold">{progress.failed} failed</span>}
      </div>
    </div>
  );
}

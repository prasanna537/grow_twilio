"use client";

import { X, Keyboard } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const SHORTCUTS = [
    { key: "/", description: "Focus global command search" },
    { key: "n", description: "Create new session" },
    { key: "?", description: "Show keyboard shortcuts" },
    { key: "d", description: "Go to Dashboard" },
    { key: "s", description: "Go to Sessions" },
    { key: "m", description: "Go to Send Message" },
    { key: "w", description: "Go to Webhooks Manager" },
    { key: "l", description: "Go to Activity Logs" },
    { key: "a", description: "Go to Analytics" },
    { key: ",", description: "Go to Settings" },
    { key: "Esc", description: "Close modal / unfocus" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card relative w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Keyboard className="h-5 w-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {SHORTCUTS.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              <span className="text-xs text-slate-600 dark:text-slate-300">
                {s.description}
              </span>
              <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-mono text-xs shadow-xs font-semibold">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

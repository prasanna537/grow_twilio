'use client';

import React, { useEffect, useState } from 'react';
import { Settings as SettingsType } from '@/lib/providers/types';
import {
  X,
  Save,
  MessageSquare,
  Clock,
  Zap,
  QrCode,
  Tag,
  ToggleLeft,
  ToggleRight,
  Info,
} from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsType;
  onSave: (newSettings: SettingsType) => void;
  onOpenQR: () => void;
}

export function SettingsDrawer({
  isOpen,
  onClose,
  settings,
  onSave,
  onOpenQR,
}: SettingsDrawerProps) {
  const [template, setTemplate] = useState(settings.messageTemplate);
  const [daysBefore, setDaysBefore] = useState(settings.reminderDaysBefore);
  const [sendDelay, setSendDelay] = useState(settings.sendDelaySeconds);
  const [autoSend, setAutoSend] = useState(settings.autoSendEnabled);
  const [autoSendTime, setAutoSendTime] = useState(settings.autoSendTime);

  useEffect(() => {
    setTemplate(settings.messageTemplate);
    setDaysBefore(settings.reminderDaysBefore);
    setSendDelay(settings.sendDelaySeconds);
    setAutoSend(settings.autoSendEnabled);
    setAutoSendTime(settings.autoSendTime);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const insertTag = (tag: string) => {
    setTemplate((prev) => `${prev} ${tag}`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      messageTemplate: template,
      reminderDaysBefore: Number(daysBefore),
      sendDelaySeconds: Number(sendDelay),
      autoSendEnabled: autoSend,
      autoSendTime: autoSendTime,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-lg h-full border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in slide-in-from-right duration-250 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-white">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">WhatsApp & Automation Settings</h3>
              <p className="text-xs text-slate-500">Configure reminder rules, templates, and schedule</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-medium">
          {/* Template Configuration */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="uppercase text-[10px] font-bold text-slate-500">
                WhatsApp Message Template
              </label>
              <span className="text-[10px] text-slate-400">Insert Placeholders</span>
            </div>

            {/* Placeholder Quick Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => insertTag('{{name}}')}
                className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 transition"
              >
                <Tag className="h-3 w-3" /> {'{{name}}'}
              </button>
              <button
                type="button"
                onClick={() => insertTag('{{plan}}')}
                className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 transition"
              >
                <Tag className="h-3 w-3" /> {'{{plan}}'}
              </button>
              <button
                type="button"
                onClick={() => insertTag('{{date}}')}
                className="flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-[11px] font-bold text-purple-700 hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300 transition"
              >
                <Tag className="h-3 w-3" /> {'{{date}}'}
              </button>
            </div>

            <textarea
              rows={4}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono font-medium text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white leading-relaxed"
            />
            <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
              <Info className="h-3 w-3 text-slate-400" /> WhatsApp dynamic fields will automatically replace when sending.
            </p>
          </div>

          {/* Threshold & Delays */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">
                Reminder Threshold (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={daysBefore}
                onChange={(e) => setDaysBefore(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Days prior to renewal date</span>
            </div>

            <div>
              <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">
                Send Delay (Seconds)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={sendDelay}
                onChange={(e) => setSendDelay(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Delay between WhatsApp messages</span>
            </div>
          </div>

          {/* Daily Auto-Send Toggle */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Daily Auto-Send Automation
                </span>
                <span className="text-[11px] text-slate-500">Automatically broadcast to all due members</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoSend(!autoSend)}
                className="text-emerald-600 focus:outline-none"
              >
                {autoSend ? (
                  <ToggleRight className="h-7 w-7 text-emerald-600" />
                ) : (
                  <ToggleLeft className="h-7 w-7 text-slate-400" />
                )}
              </button>
            </div>

            {autoSend && (
              <div className="mt-3 border-t border-slate-200/60 pt-3 dark:border-slate-800">
                <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">
                  Scheduled Execution Time (Daily)
                </label>
                <input
                  type="time"
                  value={autoSendTime}
                  onChange={(e) => setAutoSendTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Link / Re-link WhatsApp */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  WhatsApp Connection QR Code
                </span>
                <span className="text-[11px] text-slate-500">Link or refresh WAHA session</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenQR();
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 transition"
              >
                <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                View QR
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
            >
              <Save className="h-4 w-4" /> Save WhatsApp Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

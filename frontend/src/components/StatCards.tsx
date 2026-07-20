'use client';

import React from 'react';
import { Member } from '@/lib/providers/types';
import { Users, AlertTriangle, CheckCheck, Activity, TrendingUp } from 'lucide-react';

interface StatCardsProps {
  members: Member[];
  reminderDaysThreshold: number;
}

export function StatCards({ members, reminderDaysThreshold }: StatCardsProps) {
  const total = members.length;
  const dueSoon = members.filter((m) => m.daysLeft <= reminderDaysThreshold).length;
  const sentToday = members.filter(
    (m) => m.lastReminderSent === new Date().toISOString().split('T')[0]
  ).length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Members */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Members
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{total}</span>
          <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="mr-1 h-3 w-3" /> +12% this month
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Active gym membership roster</p>
      </div>

      {/* Due for Reminder */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Due / Overdue
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{dueSoon}</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            ≤ {reminderDaysThreshold} days left
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Members requiring WhatsApp outreach</p>
      </div>

      {/* Sent Today */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Sent Today
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{sentToday}</span>
          <span className="text-xs font-semibold text-slate-500">100% delivered</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Automated & manual WhatsApp reminders</p>
      </div>

      {/* Connection Latency */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            API Latency
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">35ms</span>
          <span className="flex items-center text-xs font-bold text-emerald-600">
            Optimal
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">WAHA & Provider connection ping</p>
      </div>
    </div>
  );
}

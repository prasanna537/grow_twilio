'use client';

import React, { useState } from 'react';
import { Member } from '@/lib/providers/types';
import {
  Search,
  Send,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  UserCheck,
} from 'lucide-react';

interface RosterTableProps {
  members: Member[];
  reminderDaysThreshold: number;
  onSendSingle: (id: string, name: string) => void;
  onEdit: (member: Member) => void;
  onDelete: (id: string, name: string) => void;
  sendingId: string | null;
}

export function RosterTable({
  members,
  reminderDaysThreshold,
  onSendSingle,
  onEdit,
  onDelete,
  sendingId,
}: RosterTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'due' | 'overdue' | 'sent'>('all');

  // Sort by soonest renewal first
  const sortedMembers = [...members].sort(
    (a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()
  );

  // Filter based on search query and tab
  const filteredMembers = sortedMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.planName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'due') return m.daysLeft >= 0 && m.daysLeft <= reminderDaysThreshold;
    if (activeTab === 'overdue') return m.daysLeft < 0;
    if (activeTab === 'sent') return Boolean(m.lastReminderSent);

    return true;
  });

  const getDaysLeftBadge = (daysLeft: number) => {
    if (daysLeft < 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-950/80 dark:text-red-300">
          <AlertCircle className="h-3 w-3" />
          {Math.abs(daysLeft)} {Math.abs(daysLeft) === 1 ? 'day' : 'days'} overdue
        </span>
      );
    }
    if (daysLeft <= reminderDaysThreshold) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
          <Clock className="h-3 w-3" />
          {daysLeft === 0 ? 'Expires Today' : `${daysLeft} days left`}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
        {daysLeft} days left
      </span>
    );
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800/80">
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search member, phone, plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 transition"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/60">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            All ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('due')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'due'
                ? 'bg-white text-amber-700 shadow-xs dark:bg-slate-900 dark:text-amber-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Due Soon
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'overdue'
                ? 'bg-white text-red-700 shadow-xs dark:bg-slate-900 dark:text-red-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'sent'
                ? 'bg-white text-emerald-700 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Sent Today
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-950/50 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="py-3.5 pl-6 pr-4">Member Name</th>
              <th className="py-3.5 px-4">Gym Plan</th>
              <th className="py-3.5 px-4">WhatsApp Phone</th>
              <th className="py-3.5 px-4">Renewal Date</th>
              <th className="py-3.5 px-4">Days Status</th>
              <th className="py-3.5 px-4">Last Reminder</th>
              <th className="py-3.5 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-200">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No gym members found matching your search or filters.
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {member.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-300">
                    {member.planName}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {member.phone}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{member.renewalDate}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">{getDaysLeftBadge(member.daysLeft)}</td>
                  <td className="py-4 px-4 text-slate-500">
                    {member.lastReminderSent ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3 w-3" /> {member.lastReminderSent}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not sent yet</span>
                    )}
                  </td>
                  <td className="py-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSendSingle(member.id, member.name)}
                        disabled={sendingId === member.id}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition"
                        title="Send WhatsApp Reminder Now"
                      >
                        <Send className="h-3 w-3" />
                        {sendingId === member.id ? 'Sending...' : 'Send'}
                      </button>

                      <button
                        onClick={() => onEdit(member)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/60 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition"
                        title="Edit Member"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => onDelete(member.id, member.name)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 transition"
                        title="Delete Member"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

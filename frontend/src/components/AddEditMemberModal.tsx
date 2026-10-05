'use client';

import React, { useEffect, useState } from 'react';
import { Member } from '@/lib/providers/types';
import { X, UserPlus, Save, Calendar, Phone, Dumbbell, User } from 'lucide-react';

interface AddEditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Member, 'id' | 'daysLeft'>, editId?: string) => void;
  editingMember?: Member | null;
}

export function AddEditMemberModal({
  isOpen,
  onClose,
  onSave,
  editingMember,
}: AddEditMemberModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [planName, setPlanName] = useState('Gold Annual Gym Pass');
  const [renewalDate, setRenewalDate] = useState('');

  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name);
      setPhone(editingMember.phone);
      setPlanName(editingMember.planName);
      setRenewalDate(editingMember.renewalDate);
    } else {
      setName('');
      setPhone('');
      setPlanName('Gold Annual Gym Pass');
      // Default to 7 days from today
      const defaultDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      setRenewalDate(defaultDate);
    }
  }, [editingMember, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !renewalDate) return;
    onSave({ name, phone, planName, renewalDate }, editingMember?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingMember ? 'Edit Gym Member' : 'Add New Gym Member'}
              </h3>
              <p className="text-xs text-slate-500">Configure member details and renewal target</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium">
          <div>
            <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">
              Member Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Marcus Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">
              WhatsApp Phone Number (with Country Code)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="+1 (555) 234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">
              Gym Membership Plan
            </label>
            <div className="relative">
              <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="Gold Annual Gym Pass">Gold Annual Gym Pass</option>
                <option value="Monthly CrossFit Pass">Monthly CrossFit Pass</option>
                <option value="VIP Personal Training 6M">VIP Personal Training 6M</option>
                <option value="Standard Fitness Monthly">Standard Fitness Monthly</option>
                <option value="Weekend Warrior Pass">Weekend Warrior Pass</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block uppercase text-[10px] font-bold text-slate-500 mb-1">
              Renewal Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="date"
                required
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
            >
              <Save className="h-3.5 w-3.5" />
              {editingMember ? 'Save Changes' : 'Create Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

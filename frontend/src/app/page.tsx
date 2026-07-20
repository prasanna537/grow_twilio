'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Member, Settings, ConnectionItem } from '@/lib/providers/types';
import { Header } from '@/components/Header';
import { StatCards } from '@/components/StatCards';
import { ConnectionManager } from '@/components/ConnectionManager';
import { RosterTable } from '@/components/RosterTable';
import { AddEditMemberModal } from '@/components/AddEditMemberModal';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { QRCodeModal } from '@/components/QRCodeModal';
import { AddConnectionModal } from '@/components/AddConnectionModal';
import { BulkProgressToast } from '@/components/BulkProgressToast';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [settings, setSettings] = useState<Settings>({
    messageTemplate: 'Hi {{name}}, your {{plan}} expires on {{date}}. Reply RENEW to extend!',
    reminderDaysBefore: 3,
    sendDelaySeconds: 5,
    autoSendEnabled: true,
    autoSendTime: '09:00',
  });
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  
  // Modals & Drawers state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isAddConnectionOpen, setIsAddConnectionOpen] = useState(false);

  // Sending actions state
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);

  // Load initial data
  const loadData = async () => {
    try {
      const [membersData, settingsData, connectionsData] = await Promise.all([
        api.getMembers(),
        api.getSettings(),
        api.getConnections(),
      ]);
      setMembers(membersData);
      setSettings(settingsData);
      setConnections(connectionsData);
    } catch {
      toast.error('Failed to load initial data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Single reminder send handler
  const handleSendSingle = async (id: string, name: string) => {
    setSendingId(id);
    try {
      await api.sendReminderNow(id);
      toast.success(`WhatsApp reminder sent to ${name}!`);
      // Update local member state optimistically
      setMembers((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, lastReminderSent: new Date().toISOString().split('T')[0] } : m
        )
      );
    } catch {
      toast.error(`Failed to send WhatsApp reminder to ${name}`);
    } finally {
      setSendingId(null);
    }
  };

  // Bulk due reminders send handler
  const handleSendDueReminders = async () => {
    try {
      setIsBulkSending(true);
      const res = await api.sendDueReminders();
      toast.info(`Started sending reminders to ${res.count} members!`);
    } catch {
      toast.error('Failed to initiate bulk send');
      setIsBulkSending(false);
    }
  };

  // Save member handler
  const handleSaveMember = async (
    data: Omit<Member, 'id' | 'daysLeft'>,
    editId?: string
  ) => {
    if (editId) {
      const updated = await api.updateMember(editId, data);
      setMembers((prev) => prev.map((m) => (m.id === editId ? updated : m)));
      toast.success(`Updated ${data.name}'s gym membership`);
    } else {
      const created = await api.addMember(data);
      setMembers((prev) => [created, ...prev]);
      toast.success(`Added ${data.name} to roster`);
    }
    setEditingMember(null);
  };

  // Delete member handler
  const handleDeleteMember = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the gym roster?`)) {
      await api.deleteMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success(`Removed ${name} from roster`);
    }
  };

  // Save settings handler
  const handleSaveSettings = async (newSettings: Settings) => {
    const updated = await api.updateSettings(newSettings);
    setSettings(updated);
    toast.success('WhatsApp automation settings saved');
  };

  // Add connection handler
  const handleAddConnection = async (conn: Partial<ConnectionItem>) => {
    const created = await api.addConnection(conn);
    setConnections((prev) => [...prev, created]);
    toast.success(`Connected provider ${created.name}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans">
      {/* Top Header Navigation */}
      <Header
        onOpenAddMember={() => {
          setEditingMember(null);
          setIsAddMemberOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenQR={() => setIsQROpen(true)}
        onOpenAddConnection={() => setIsAddConnectionOpen(true)}
        onSendDue={handleSendDueReminders}
        isSendingDue={isBulkSending}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Stat Cards Section */}
        <StatCards
          members={members}
          reminderDaysThreshold={settings.reminderDaysBefore}
        />

        {/* Multi-Provider Connections Overview */}
        <ConnectionManager
          connections={connections}
          onOpenQR={() => setIsQROpen(true)}
          onOpenAddConnection={() => setIsAddConnectionOpen(true)}
        />

        {/* Members Roster Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Gym Membership Roster
              </h2>
              <p className="text-xs text-slate-500">
                Sorted by soonest renewal date. Color-coded by urgency threshold.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingMember(null);
                setIsAddMemberOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              + Add Member
            </button>
          </div>

          <RosterTable
            members={members}
            reminderDaysThreshold={settings.reminderDaysBefore}
            onSendSingle={handleSendSingle}
            onEdit={(m) => {
              setEditingMember(m);
              setIsAddMemberOpen(true);
            }}
            onDelete={handleDeleteMember}
            sendingId={sendingId}
          />
        </div>
      </main>

      {/* Modals & Drawers */}
      <AddEditMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => {
          setIsAddMemberOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        editingMember={editingMember}
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onOpenQR={() => setIsQROpen(true)}
      />

      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
      />

      <AddConnectionModal
        isOpen={isAddConnectionOpen}
        onClose={() => setIsAddConnectionOpen(false)}
        onAddConnection={handleAddConnection}
      />

      <BulkProgressToast
        active={isBulkSending}
        onFinished={() => {
          setIsBulkSending(false);
          toast.success('All due WhatsApp reminders have been dispatched!');
        }}
      />
    </div>
  );
}

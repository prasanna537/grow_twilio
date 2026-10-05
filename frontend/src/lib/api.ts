import { Member, Settings, ConnectionItem, ReminderProgress, ConnectionStatus } from './providers/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Mock state for offline / fallback demo testing
let mockMembers: Member[] = [
  {
    id: 'm1',
    name: 'Alex Rivera',
    phone: '+1 (555) 234-5678',
    planName: 'Gold Annual Gym Pass',
    renewalDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    lastReminderSent: null,
    daysLeft: 2,
  },
  {
    id: 'm2',
    name: 'Sarah Connor',
    phone: '+1 (555) 876-5432',
    planName: 'Monthly CrossFit Pass',
    renewalDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    lastReminderSent: '2026-07-15',
    daysLeft: 5,
  },
  {
    id: 'm3',
    name: 'Marcus Vance',
    phone: '+1 (555) 998-1122',
    planName: 'VIP Personal Training 6M',
    renewalDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    lastReminderSent: '2026-07-18',
    daysLeft: -1,
  },
  {
    id: 'm4',
    name: 'Elena Rostova',
    phone: '+1 (555) 443-2211',
    planName: 'Standard Fitness Monthly',
    renewalDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    lastReminderSent: null,
    daysLeft: 14,
  },
  {
    id: 'm5',
    name: 'David Kim',
    phone: '+1 (555) 332-9988',
    planName: 'Gold Annual Gym Pass',
    renewalDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    lastReminderSent: null,
    daysLeft: 1,
  },
];

let mockSettings: Settings = {
  messageTemplate: 'Hi {{name}}, your {{plan}} membership expires on {{date}}. Reply RENEW to extend your gym pass!',
  reminderDaysBefore: 3,
  sendDelaySeconds: 5,
  autoSendEnabled: true,
  autoSendTime: '09:00',
};

let mockConnections: ConnectionItem[] = [
  {
    id: 'c1',
    name: 'Main WAHA Node',
    providerType: 'WAHA',
    status: 'CONNECTED',
    phoneNumber: '+1 (555) 019-2834',
    sessionName: 'default',
    serverUrl: 'https://waha.grow-twilio.internal',
    lastSync: 'Just now',
    latencyMs: 42,
    messageCountToday: 128,
    isDefault: true,
  },
  {
    id: 'c2',
    name: 'Evolution Backup Engine',
    providerType: 'EVOLUTION',
    status: 'CONNECTED',
    phoneNumber: '+1 (555) 019-9988',
    sessionName: 'backup_instance',
    serverUrl: 'https://evo.grow-twilio.internal',
    lastSync: '2m ago',
    latencyMs: 65,
    messageCountToday: 45,
    isDefault: false,
  },
  {
    id: 'c3',
    name: 'Official Meta Cloud Channel',
    providerType: 'META_CLOUD',
    status: 'CONNECTED',
    phoneNumber: '+1 (800) 555-GROW',
    sessionName: 'meta_prod',
    lastSync: '1m ago',
    latencyMs: 18,
    messageCountToday: 312,
    isDefault: false,
  },
];

let mockProgress: ReminderProgress = {
  running: false,
  total: 0,
  sent: 0,
  failed: 0,
};

async function fetchWithFallback<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return await res.json();
  } catch (err) {
    if (fallback !== undefined) return fallback;
    throw err;
  }
}

export const api = {
  // Members API
  getMembers: () => fetchWithFallback<Member[]>('/api/members', undefined, mockMembers),

  addMember: async (data: Omit<Member, 'id' | 'daysLeft'>) => {
    const newMember: Member = {
      ...data,
      id: `m_${Date.now()}`,
      daysLeft: Math.ceil((new Date(data.renewalDate).getTime() - new Date().getTime()) / 86400000),
    };
    try {
      const created = await fetchWithFallback<Member>('/api/members', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return created;
    } catch {
      mockMembers = [newMember, ...mockMembers];
      return newMember;
    }
  },

  updateMember: async (id: string, data: Partial<Member>) => {
    try {
      return await fetchWithFallback<Member>(`/api/members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch {
      mockMembers = mockMembers.map((m) => (m.id === id ? { ...m, ...data } : m));
      return mockMembers.find((m) => m.id === id)!;
    }
  },

  deleteMember: async (id: string) => {
    try {
      await fetchWithFallback(`/api/members/${id}`, { method: 'DELETE' });
    } catch {
      mockMembers = mockMembers.filter((m) => m.id !== id);
    }
  },

  // Settings API
  getSettings: () => fetchWithFallback<Settings>('/api/settings', undefined, mockSettings),

  updateSettings: async (newSettings: Settings) => {
    try {
      return await fetchWithFallback<Settings>('/api/settings', {
        method: 'POST',
        body: JSON.stringify(newSettings),
      });
    } catch {
      mockSettings = newSettings;
      return mockSettings;
    }
  },

  // WAHA / Provider Status API
  getWAHAStatus: () =>
    fetchWithFallback<{ connected: boolean; status?: ConnectionStatus }>('/api/waha/status', undefined, {
      connected: true,
      status: 'CONNECTED',
    }),

  getWAHAQR: () =>
    fetchWithFallback<{ qr: string }>('/api/waha/qr', undefined, {
      qr: 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=GROW_TWILIO_WHATSAPP_LINK',
    }),

  // Connections API
  getConnections: () => fetchWithFallback<ConnectionItem[]>('/api/connections', undefined, mockConnections),

  addConnection: async (conn: Partial<ConnectionItem>) => {
    const newConn: ConnectionItem = {
      id: `c_${Date.now()}`,
      name: conn.name || 'New Connection',
      providerType: conn.providerType || 'WAHA',
      status: 'CONNECTED',
      phoneNumber: conn.phoneNumber || '+1 (555) 000-1111',
      sessionName: conn.sessionName || 'session_1',
      lastSync: 'Just now',
      latencyMs: 35,
      messageCountToday: 0,
      isDefault: false,
    };
    mockConnections = [...mockConnections, newConn];
    return newConn;
  },

  // Reminders API
  sendReminderNow: async (id: string) => {
    try {
      return await fetchWithFallback<{ success: boolean }>(`/api/reminders/send/${id}`, { method: 'POST' });
    } catch {
      mockMembers = mockMembers.map((m) =>
        m.id === id ? { ...m, lastReminderSent: new Date().toISOString().split('T')[0] } : m
      );
      return { success: true };
    }
  },

  sendDueReminders: async () => {
    try {
      return await fetchWithFallback<{ started: boolean; count: number }>('/api/reminders/send-due', {
        method: 'POST',
      });
    } catch {
      const dueCount = mockMembers.filter((m) => m.daysLeft <= mockSettings.reminderDaysBefore).length;
      mockProgress = { running: true, total: dueCount, sent: 0, failed: 0 };
      
      // Simulate background progress for demo mode
      let interval = setInterval(() => {
        if (mockProgress.sent < mockProgress.total) {
          mockProgress.sent += 1;
        } else {
          mockProgress.running = false;
          clearInterval(interval);
        }
      }, 1500);

      return { started: true, count: dueCount };
    }
  },

  getReminderProgress: () => fetchWithFallback<ReminderProgress>('/api/reminders/progress', undefined, mockProgress),
};

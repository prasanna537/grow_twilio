export type ProviderType =
  | 'WAHA'
  | 'EVOLUTION'
  | 'BAILEYS'
  | 'META_CLOUD'
  | 'TWILIO'
  | 'CUSTOM';

export type ConnectionStatus =
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'WAITING_QR'
  | 'STARTING'
  | 'FAILED'
  | 'RESTARTING';

export interface WhatsAppConfig {
  baseUrl?: string;
  apiKey?: string;
  sessionName?: string;
  accountSid?: string;
  authToken?: string;
  accessToken?: string;
  phoneNumberId?: string;
}

export interface ConnectionHealth {
  status: ConnectionStatus;
  phoneNumber?: string;
  profileName?: string;
  uptimeSeconds: number;
  latencyMs: number;
  lastSyncAt: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  planName: string;
  renewalDate: string;
  lastReminderSent?: string | null;
  daysLeft: number;
}

export interface Settings {
  messageTemplate: string;
  reminderDaysBefore: number;
  sendDelaySeconds: number;
  autoSendEnabled: boolean;
  autoSendTime: string;
}

export interface ConnectionItem {
  id: string;
  name: string;
  providerType: ProviderType;
  status: ConnectionStatus;
  phoneNumber: string;
  sessionName: string;
  serverUrl?: string;
  lastSync: string;
  latencyMs: number;
  messageCountToday: number;
  isDefault: boolean;
}

export interface ReminderProgress {
  running: boolean;
  total: number;
  sent: number;
  failed: number;
}

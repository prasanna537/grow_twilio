// Types mirroring WAHA backend DTOs (src/structures/)
// Do NOT import from the backend — these are frontend-only type definitions

export enum WAHASessionStatus {
  STOPPED = "STOPPED",
  STARTING = "STARTING",
  SCAN_QR_CODE = "SCAN_QR_CODE",
  PASSKEY_REQUIRED = "PASSKEY_REQUIRED",
  PASSKEY_CONFIRMATION_REQUIRED = "PASSKEY_CONFIRMATION_REQUIRED",
  WORKING = "WORKING",
  FAILED = "FAILED",
  LOGGED_OUT = "LOGGED_OUT",
  DISCONNECTED = "DISCONNECTED",
}

export enum WAHAPresenceStatus {
  OFFLINE = "offline",
  ONLINE = "online",
  TYPING = "typing",
  RECORDING = "recording",
  PAUSED = "paused",
}

export interface WAHAEnvironment {
  version: string;
  engine: string;
  tier: string; // "CORE" | "PLUS"
  browser: string | null;
  platform: string;
  worker: { id: string | null };
}

export interface ServerStatusResponse {
  startTimestamp: number;
  uptime: number;
  worker: { id: string | null };
}

export interface MeInfo {
  id: string;
  lid?: string;
  jid?: string;
  pushName: string;
}

export interface WebhookConfig {
  url: string;
  events: string[];
  hmac?: string;
  customHeaders?: Record<string, string>;
}

export interface SessionConfig {
  webhooks?: WebhookConfig[];
  metadata?: Record<string, string>;
  proxy?: { server: string; username?: string; password?: string };
  debug?: boolean;
}

export interface SessionDTO {
  name: string;
  status: WAHASessionStatus;
  config?: SessionConfig;
}

export interface SessionInfo extends SessionDTO {
  me?: MeInfo;
  assignedWorker?: string;
  presence: WAHAPresenceStatus.ONLINE | WAHAPresenceStatus.OFFLINE | null;
  timestamps: { activity: number | null };
  apps?: unknown[];
}

export interface SessionCreateRequest {
  name?: string;
  config?: SessionConfig;
  start?: boolean;
}

// ─── File Types ───────────────────────────────────────────────────────────────

export interface RemoteFile {
  mimetype: string;
  filename?: string;
  url: string;
}

export interface BinaryFile {
  mimetype: string;
  filename?: string;
  data: string; // base64
}

export type WAHAFile = RemoteFile | BinaryFile;

// ─── Messaging Requests ───────────────────────────────────────────────────────

export interface SendTextRequest {
  session: string;
  chatId: string;
  text: string;
  linkPreview?: boolean;
  linkPreviewHighQuality?: boolean;
  reply_to?: string;
}

export interface SendMediaRequest {
  session: string;
  chatId: string;
  file: WAHAFile;
  caption?: string;
  reply_to?: string;
}

export interface SendVoiceRequest {
  session: string;
  chatId: string;
  file: WAHAFile;
  reply_to?: string;
  convert?: boolean;
}

export interface SendVideoRequest {
  session: string;
  chatId: string;
  file: WAHAFile;
  caption?: string;
  asNote?: boolean;
  convert?: boolean;
  reply_to?: string;
}

export interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  image?: { url: string };
}

export interface SendLinkCustomPreviewRequest {
  session: string;
  chatId: string;
  text: string;
  preview: LinkPreviewData;
  linkPreviewHighQuality?: boolean;
  reply_to?: string;
}

// Buttons – deprecated in WEBJS but still accepted
export interface Button {
  type: "reply" | "url" | "call" | "copy";
  text: string;
  id?: string;
  url?: string;
  phoneNumber?: string;
  copyCode?: string;
}

export interface SendButtonsRequest {
  session: string;
  chatId: string;
  header?: string;
  body?: string;
  footer?: string;
  buttons: Button[];
}

// List message
export interface ListRow {
  title: string;
  rowId: string;
  description?: string;
}

export interface ListSection {
  title: string;
  rows: ListRow[];
}

export interface SendListMessage {
  title: string;
  description?: string;
  footer?: string;
  button: string;
  sections: ListSection[];
}

export interface SendListRequest {
  session: string;
  chatId: string;
  message: SendListMessage;
  reply_to?: string;
}

// Forward
export interface SendForwardRequest {
  session: string;
  chatId: string;
  messageId: string;
}

// Seen
export interface SendSeenRequest {
  session: string;
  chatId: string;
  messageId?: string;
  messageIds?: string[];
  participant?: string;
}

// Typing
export interface ChatActionRequest {
  session: string;
  chatId: string;
}

export interface SendPollRequest {
  session: string;
  chatId: string;
  poll: {
    name: string;
    options: string[];
    multipleAnswers?: boolean;
  };
}

export interface SendLocationRequest {
  session: string;
  chatId: string;
  latitude: number;
  longitude: number;
  title?: string;
  address?: string;
}

// ─── Responses ────────────────────────────────────────────────────────────────

export interface WAMessage {
  id: string;
  timestamp: number;
  from: string;
  to: string;
  body: string;
  fromMe: boolean;
  hasMedia: boolean;
  ack?: number;
  ackName?: string;
  source?: string;
  participant?: string;
  author?: string;
  mediaUrl?: string;
}

export interface TypingResult {
  result: boolean;
}

// ─── Auth / Pairing ───────────────────────────────────────────────────────────

export interface RequestCodeRequest {
  phoneNumber: string;
  method?: "sms" | "voice";
}

export interface RequestCodeResponse {
  code: string;
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

export interface ApiKeyDTO {
  id: string;
  name: string;
  key?: string;
  createdAt: string;
  scopes?: string[];
}

export interface ApiKeyRequest {
  name: string;
  scopes?: string[];
}

// ─── Settings & Activity Logs ──────────────────────────────────────────────────

export interface ApiSettings {
  baseUrl: string;
  apiKey: string;
}

export type LogSeverity = "info" | "warn" | "error" | "success";

export interface ActivityLogEntry {
  id: string;
  timestamp: number;
  severity: LogSeverity;
  category: "session" | "api" | "message" | "system" | "webhook";
  title: string;
  details?: string;
  session?: string;
}

export interface SystemAlert {
  id: string;
  timestamp: number;
  title: string;
  message: string;
  type: "warning" | "error" | "info";
  read: boolean;
  sessionName?: string;
}

export interface ChatSummary {
  id: string;
  name: string;
  picture?: string;
  unreadCount?: number;
  lastMessage?: WAMessage;
}

// ─── Error Handling ───────────────────────────────────────────────────────────

export interface WAHAErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

import axios, { AxiosInstance, AxiosError } from "axios";
import {
  WAHAEnvironment,
  ServerStatusResponse,
  SessionInfo,
  SessionDTO,
  SessionCreateRequest,
  SendTextRequest,
  SendMediaRequest,
  SendVoiceRequest,
  SendVideoRequest,
  SendLinkCustomPreviewRequest,
  SendButtonsRequest,
  SendListRequest,
  SendForwardRequest,
  SendSeenRequest,
  ChatActionRequest,
  SendPollRequest,
  SendLocationRequest,
  WAMessage,
  TypingResult,
  ApiSettings,
  ApiKeyDTO,
  ApiKeyRequest,
  RequestCodeRequest,
  RequestCodeResponse,
  ChatSummary,
  WAHAErrorResponse,
} from "./types";

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_WAHA_BASE_URL || "";
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_WAHA_API_KEY || "";

export function getSettings(): ApiSettings {
  if (typeof window === "undefined") {
    return {
      baseUrl:
        process.env.WAHA_BASE_URL ||
        process.env.NEXT_PUBLIC_WAHA_BASE_URL ||
        "http://localhost:3010",
      apiKey:
        process.env.WAHA_API_KEY ||
        process.env.NEXT_PUBLIC_WAHA_API_KEY ||
        "",
    };
  }

  const storedBaseUrl = localStorage.getItem("waha_base_url");
  const storedApiKey = localStorage.getItem("waha_api_key");

  return {
    // If a custom URL is stored in localStorage, use it. Otherwise use relative "" to route through Next.js proxy
    baseUrl: storedBaseUrl !== null ? storedBaseUrl : DEFAULT_BASE_URL,
    apiKey: storedApiKey !== null ? storedApiKey : DEFAULT_API_KEY,
  };
}

function createAxiosInstance(): AxiosInstance {
  const { baseUrl, apiKey } = getSettings();
  const instance = axios.create({
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "X-Api-Key": apiKey } : {}),
    },
    timeout: 30000,
  });
  return instance;
}

function client(): AxiosInstance {
  return createAxiosInstance();
}

/**
 * Extracts a human-readable error message from an Axios error.
 * Handles WAHA's NestJS error response format.
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as WAHAErrorResponse | undefined;
    if (data) {
      // NestJS validation errors come as arrays
      if (Array.isArray(data.message)) {
        return data.message.join("; ");
      }
      if (typeof data.message === "string" && data.message) {
        return data.message;
      }
      if (data.error) {
        return `${data.error} (HTTP ${error.response?.status})`;
      }
    }
    // Network / timeout
    if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
      return "Cannot connect to WAHA backend. Is it running at the configured URL?";
    }
    if (error.code === "ECONNABORTED") {
      return "Request timed out. The operation may still be processing.";
    }
    if (error.response?.status === 401) {
      return "Unauthorized. Check your API key in Settings.";
    }
    if (error.response?.status === 403) {
      return "Forbidden. Your API key may not have permission for this action.";
    }
    if (error.response?.status === 404) {
      return "Session not found. Make sure the session exists and is started.";
    }
    if (error.response?.status === 409) {
      return "Session is not ready (not in WORKING state). Please connect WhatsApp first.";
    }
    if (error.response?.status === 422) {
      return "Invalid request data. Check the fields and try again.";
    }
    if (error.response?.status === 500) {
      return "Backend error (500). Check the WAHA server logs.";
    }
    return error.message || "Unknown error";
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Normalize a WhatsApp Chat ID.
 * - Accepts bare phone numbers: "919876543210" → "919876543210@c.us"
 * - Leaves already-suffixed IDs as-is: "919876543210@c.us" → "919876543210@c.us"
 * - Throws if the input contains forbidden characters or is obviously invalid.
 */
export function normalizeChatId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Chat ID cannot be empty.");

  // Already has @suffix — accept as-is
  if (trimmed.includes("@")) return trimmed;

  // Strip any non-digit prefix characters users might accidentally add
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.length < 7) {
    throw new Error(
      `"${input}" is not a valid WhatsApp number. Enter a full international number like 919876543210.`
    );
  }
  return `${digitsOnly}@c.us`;
}

/**
 * Validate that a string is a valid WhatsApp Chat ID or can be normalized to one.
 * Returns null if valid, or an error string if invalid.
 */
export function validateChatId(input: string): string | null {
  try {
    normalizeChatId(input);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

// ─── Server ───────────────────────────────────────────────────────────────────

export async function fetchVersion(): Promise<WAHAEnvironment> {
  const res = await client().get<WAHAEnvironment>("/api/server/version");
  return res.data;
}

export async function fetchServerStatus(): Promise<ServerStatusResponse> {
  const res = await client().get<ServerStatusResponse>("/api/server/status");
  return res.data;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function fetchSessions(all = true): Promise<SessionInfo[]> {
  const res = await client().get<SessionInfo[]>("/api/sessions", {
    params: { all: all },
  });
  return res.data;
}

export async function fetchSession(name: string): Promise<SessionInfo> {
  const res = await client().get<SessionInfo>(`/api/sessions/${name}`);
  return res.data;
}

export async function createSession(
  request: SessionCreateRequest
): Promise<SessionDTO> {
  const res = await client().post<SessionDTO>("/api/sessions", request);
  return res.data;
}

export async function deleteSession(name: string): Promise<void> {
  await client().delete(`/api/sessions/${name}`);
}

export async function startSession(name: string): Promise<SessionDTO> {
  const res = await client().post<SessionDTO>(`/api/sessions/${name}/start`);
  return res.data;
}

export async function stopSession(name: string): Promise<SessionDTO> {
  const res = await client().post<SessionDTO>(`/api/sessions/${name}/stop`);
  return res.data;
}

export async function restartSession(name: string): Promise<SessionDTO> {
  const res = await client().post<SessionDTO>(`/api/sessions/${name}/restart`);
  return res.data;
}

export async function logoutSession(name: string): Promise<SessionDTO> {
  const res = await client().post<SessionDTO>(`/api/sessions/${name}/logout`);
  return res.data;
}

// ─── Auth / QR / Pairing ──────────────────────────────────────────────────────

export function getQRImageUrl(session: string): string {
  const { baseUrl, apiKey } = getSettings();
  const url = new URL(`/api/${session}/auth/qr`, baseUrl);
  url.searchParams.set("format", "image");
  if (apiKey) {
    url.searchParams.set("x-api-key", apiKey);
  }
  return url.toString();
}

export async function fetchQRValue(session: string): Promise<string | null> {
  try {
    const res = await client().get<{ value: string }>(
      `/api/${session}/auth/qr`,
      { params: { format: "raw" } }
    );
    return res.data.value;
  } catch {
    return null;
  }
}

export async function requestPairingCode(
  session: string,
  phoneNumber: string
): Promise<RequestCodeResponse> {
  const res = await client().post<RequestCodeResponse>(
    `/api/${session}/auth/request-code`,
    { phoneNumber } as RequestCodeRequest
  );
  return res.data;
}

// ─── Text Messaging ───────────────────────────────────────────────────────────

export async function sendText(request: SendTextRequest): Promise<WAMessage> {
  const res = await client().post<WAMessage>("/api/sendText", {
    ...request,
    chatId: normalizeChatId(request.chatId),
  });
  return res.data;
}

// ─── Media Messaging ──────────────────────────────────────────────────────────

export async function sendImage(request: SendMediaRequest): Promise<WAMessage> {
  const res = await client().post<WAMessage>("/api/sendImage", {
    ...request,
    chatId: normalizeChatId(request.chatId),
  });
  return res.data;
}

export async function sendVideo(request: SendVideoRequest): Promise<WAMessage> {
  const res = await client().post<WAMessage>("/api/sendVideo", {
    ...request,
    chatId: normalizeChatId(request.chatId),
  });
  return res.data;
}

export async function sendFile(request: SendMediaRequest): Promise<WAMessage> {
  const res = await client().post<WAMessage>("/api/sendFile", {
    ...request,
    chatId: normalizeChatId(request.chatId),
  });
  return res.data;
}

export async function sendVoice(request: SendVoiceRequest): Promise<WAMessage> {
  const res = await client().post<WAMessage>("/api/sendVoice", {
    ...request,
    chatId: normalizeChatId(request.chatId),
  });
  return res.data;
}

// ─── Link Preview ─────────────────────────────────────────────────────────────

export async function sendLinkCustomPreview(
  request: SendLinkCustomPreviewRequest
): Promise<WAMessage> {
  const res = await client().post<WAMessage>("/api/send/link-custom-preview", {
    ...request,
    chatId: normalizeChatId(request.chatId),
  });
  return res.data;
}

// ─── Interactive Messages ─────────────────────────────────────────────────────

/**
 * sendButtons — marked deprecated in WAHA v2026.7.1 WEBJS engine.
 * The endpoint still exists but may not work on newer WhatsApp versions.
 */
export async function sendButtons(
  request: SendButtonsRequest
): Promise<WAMessage> {
  const res = await client().post<WAMessage>("/api/sendButtons", {
    ...request,
    chatId: normalizeChatId(request.chatId),
  });
  return res.data;
}

export async function sendList(request: SendListRequest): Promise<WAMessage> {
  const res = await client().post<WAMessage>("/api/sendList", {
    ...request,
    chatId: normalizeChatId(request.chatId),
  });
  return res.data;
}

export async function sendPoll(request: SendPollRequest): Promise<WAMessage> {
  const res = await client().post<WAMessage>("/api/sendPoll", {
    ...request,
    chatId: normalizeChatId(request.chatId),
  });
  return res.data;
}

// ─── Message Actions ──────────────────────────────────────────────────────────

export async function sendForwardMessage(
  request: SendForwardRequest
): Promise<WAMessage> {
  const res = await client().post<WAMessage>("/api/forwardMessage", {
    ...request,
    chatId: normalizeChatId(request.chatId),
  });
  return res.data;
}

export async function sendSeen(request: SendSeenRequest): Promise<unknown> {
  const res = await client().post<unknown>("/api/sendSeen", {
    ...request,
    chatId: normalizeChatId(request.chatId),
  });
  return res.data;
}

export async function startTyping(
  request: ChatActionRequest
): Promise<TypingResult> {
  const res = await client().post<TypingResult>("/api/startTyping", {
    ...request,
    chatId: normalizeChatId(request.chatId),
  });
  return res.data;
}

export async function stopTyping(
  request: ChatActionRequest
): Promise<TypingResult> {
  const res = await client().post<TypingResult>("/api/stopTyping", {
    ...request,
    chatId: normalizeChatId(request.chatId),
  });
  return res.data;
}

export async function sendLocation(
  request: SendLocationRequest
): Promise<WAMessage> {
  const res = await client().post<WAMessage>("/api/sendLocation", {
    ...request,
    chatId: normalizeChatId(request.chatId),
  });
  return res.data;
}

// ─── Chats & Messages ─────────────────────────────────────────────────────────

export async function fetchChats(session: string): Promise<ChatSummary[]> {
  const res = await client().get<ChatSummary[]>(`/api/${session}/chats`);
  return res.data;
}

export async function fetchChatMessages(
  session: string,
  chatId: string
): Promise<WAMessage[]> {
  const res = await client().get<WAMessage[]>(
    `/api/${session}/chats/${chatId}/messages`
  );
  return res.data;
}

// ─── API Keys Management ──────────────────────────────────────────────────────

export async function fetchApiKeys(): Promise<ApiKeyDTO[]> {
  const res = await client().get<ApiKeyDTO[]>("/api/keys");
  return res.data;
}

export async function createApiKey(request: ApiKeyRequest): Promise<ApiKeyDTO> {
  const res = await client().post<ApiKeyDTO>("/api/keys", request);
  return res.data;
}

export async function updateApiKey(
  id: string,
  request: ApiKeyRequest
): Promise<ApiKeyDTO> {
  const res = await client().put<ApiKeyDTO>(`/api/keys/${id}`, request);
  return res.data;
}

export async function deleteApiKey(id: string): Promise<void> {
  await client().delete(`/api/keys/${id}`);
}

// ─── Settings & Verification ─────────────────────────────────────────────────

export function saveSettings(settings: ApiSettings): void {
  localStorage.setItem("waha_base_url", settings.baseUrl);
  localStorage.setItem("waha_api_key", settings.apiKey);
}

export function loadSettings(): ApiSettings {
  return getSettings();
}

export async function testConnection(): Promise<WAHAEnvironment> {
  return fetchVersion();
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchVersion,
  fetchServerStatus,
  fetchSessions,
  fetchSession,
  createSession,
  deleteSession,
  startSession,
  stopSession,
  restartSession,
  logoutSession,
  sendText,
  sendImage,
  sendVideo,
  sendFile,
  sendVoice,
  sendLinkCustomPreview,
  sendButtons,
  sendList,
  sendForwardMessage,
  sendSeen,
  startTyping,
  stopTyping,
  sendPoll,
  sendLocation,
  fetchApiKeys,
  createApiKey,
  deleteApiKey,
  requestPairingCode,
  fetchChats,
} from "@/lib/api";
import {
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
  ApiKeyRequest,
} from "@/lib/types";
import { addLogEntry, saveSentMessage } from "@/lib/store";

// ─── Server ───────────────────────────────────────────────────────────────────

export function useVersion() {
  return useQuery({
    queryKey: ["version"],
    queryFn: fetchVersion,
    staleTime: 60_000,
  });
}

export function useServerStatus() {
  return useQuery({
    queryKey: ["serverStatus"],
    queryFn: fetchServerStatus,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export function useSessions(all = true) {
  return useQuery({
    queryKey: ["sessions", all],
    queryFn: () => fetchSessions(all),
    refetchInterval: 5_000,
  });
}

export function useSession(name: string) {
  return useQuery({
    queryKey: ["session", name],
    queryFn: () => fetchSession(name),
    refetchInterval: 5_000,
    enabled: Boolean(name),
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: SessionCreateRequest) => {
      const res = await createSession(req);
      addLogEntry({
        severity: "info",
        category: "session",
        title: `Session created: ${req.name || res.name}`,
        session: req.name || res.name,
      });
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      await deleteSession(name);
      addLogEntry({
        severity: "warn",
        category: "session",
        title: `Session deleted: ${name}`,
        session: name,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await startSession(name);
      addLogEntry({
        severity: "info",
        category: "session",
        title: `Session started: ${name}`,
        session: name,
      });
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useStopSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await stopSession(name);
      addLogEntry({
        severity: "warn",
        category: "session",
        title: `Session stopped: ${name}`,
        session: name,
      });
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useRestartSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await restartSession(name);
      addLogEntry({
        severity: "info",
        category: "session",
        title: `Session restarted: ${name}`,
        session: name,
      });
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useLogoutSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await logoutSession(name);
      addLogEntry({
        severity: "warn",
        category: "session",
        title: `Session logged out: ${name}`,
        session: name,
      });
      return res;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function usePairingCode() {
  return useMutation({
    mutationFn: ({ session, phoneNumber }: { session: string; phoneNumber: string }) =>
      requestPairingCode(session, phoneNumber),
  });
}

// ─── Messaging ────────────────────────────────────────────────────────────────

export function useSendText() {
  return useMutation({
    mutationFn: async (req: SendTextRequest) => {
      const res = await sendText(req);
      saveSentMessage(res);
      addLogEntry({
        severity: "success",
        category: "message",
        title: `Text sent to ${req.chatId}`,
        details: req.text,
        session: req.session,
      });
      return res;
    },
  });
}

export function useSendImage() {
  return useMutation({
    mutationFn: async (req: SendMediaRequest) => {
      const res = await sendImage(req);
      saveSentMessage(res);
      addLogEntry({
        severity: "success",
        category: "message",
        title: `Image sent to ${req.chatId}`,
        session: req.session,
      });
      return res;
    },
  });
}

export function useSendVideo() {
  return useMutation({
    mutationFn: async (req: SendVideoRequest) => {
      const res = await sendVideo(req);
      saveSentMessage(res);
      addLogEntry({
        severity: "success",
        category: "message",
        title: `Video sent to ${req.chatId}`,
        session: req.session,
      });
      return res;
    },
  });
}

export function useSendFile() {
  return useMutation({
    mutationFn: async (req: SendMediaRequest) => {
      const res = await sendFile(req);
      saveSentMessage(res);
      addLogEntry({
        severity: "success",
        category: "message",
        title: `File sent to ${req.chatId}`,
        session: req.session,
      });
      return res;
    },
  });
}

export function useSendVoice() {
  return useMutation({
    mutationFn: async (req: SendVoiceRequest) => {
      const res = await sendVoice(req);
      saveSentMessage(res);
      addLogEntry({
        severity: "success",
        category: "message",
        title: `Voice message sent to ${req.chatId}`,
        session: req.session,
      });
      return res;
    },
  });
}

export function useSendLinkCustomPreview() {
  return useMutation({
    mutationFn: async (req: SendLinkCustomPreviewRequest) => {
      const res = await sendLinkCustomPreview(req);
      saveSentMessage(res);
      addLogEntry({
        severity: "success",
        category: "message",
        title: `Link preview sent to ${req.chatId}`,
        details: req.preview.url,
        session: req.session,
      });
      return res;
    },
  });
}

export function useSendButtons() {
  return useMutation({
    mutationFn: async (req: SendButtonsRequest) => {
      const res = await sendButtons(req);
      saveSentMessage(res);
      addLogEntry({
        severity: "success",
        category: "message",
        title: `Buttons message sent to ${req.chatId}`,
        session: req.session,
      });
      return res;
    },
  });
}

export function useSendList() {
  return useMutation({
    mutationFn: async (req: SendListRequest) => {
      const res = await sendList(req);
      saveSentMessage(res);
      addLogEntry({
        severity: "success",
        category: "message",
        title: `List message sent to ${req.chatId}`,
        session: req.session,
      });
      return res;
    },
  });
}

export function useSendForwardMessage() {
  return useMutation({
    mutationFn: async (req: SendForwardRequest) => {
      const res = await sendForwardMessage(req);
      saveSentMessage(res);
      addLogEntry({
        severity: "success",
        category: "message",
        title: `Message forwarded to ${req.chatId}`,
        details: `Message ID: ${req.messageId}`,
        session: req.session,
      });
      return res;
    },
  });
}

export function useSendSeen() {
  return useMutation({
    mutationFn: async (req: SendSeenRequest) => {
      const res = await sendSeen(req);
      addLogEntry({
        severity: "success",
        category: "message",
        title: `Marked seen for ${req.chatId}`,
        session: req.session,
      });
      return res;
    },
  });
}

export function useStartTyping() {
  return useMutation({
    mutationFn: async (req: ChatActionRequest) => {
      const res = await startTyping(req);
      addLogEntry({
        severity: "info",
        category: "message",
        title: `Started typing in ${req.chatId}`,
        session: req.session,
      });
      return res;
    },
  });
}

export function useStopTyping() {
  return useMutation({
    mutationFn: async (req: ChatActionRequest) => {
      const res = await stopTyping(req);
      addLogEntry({
        severity: "info",
        category: "message",
        title: `Stopped typing in ${req.chatId}`,
        session: req.session,
      });
      return res;
    },
  });
}

export function useSendPoll() {
  return useMutation({
    mutationFn: async (req: SendPollRequest) => {
      const res = await sendPoll(req);
      saveSentMessage(res);
      addLogEntry({
        severity: "success",
        category: "message",
        title: `Poll sent to ${req.chatId}`,
        details: req.poll.name,
        session: req.session,
      });
      return res;
    },
  });
}

export function useSendLocation() {
  return useMutation({
    mutationFn: async (req: SendLocationRequest) => {
      const res = await sendLocation(req);
      saveSentMessage(res);
      addLogEntry({
        severity: "success",
        category: "message",
        title: `Location sent to ${req.chatId}`,
        details: `${req.latitude}, ${req.longitude}`,
        session: req.session,
      });
      return res;
    },
  });
}

export function useChats(session: string) {
  return useQuery({
    queryKey: ["chats", session],
    queryFn: () => fetchChats(session),
    enabled: Boolean(session),
  });
}

// ─── API Keys Management ──────────────────────────────────────────────────────

export function useApiKeys() {
  return useQuery({
    queryKey: ["apiKeys"],
    queryFn: fetchApiKeys,
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: ApiKeyRequest) => {
      const key = await createApiKey(req);
      addLogEntry({
        severity: "info",
        category: "api",
        title: `API Key created: ${req.name}`,
      });
      return key;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["apiKeys"] }),
  });
}

export function useDeleteApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteApiKey(id);
      addLogEntry({
        severity: "warn",
        category: "api",
        title: `API Key deleted`,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["apiKeys"] }),
  });
}

"use client";

import { useState } from "react";
import {
  Archive,
  CheckCheck,
  CircleHelp,
  MoreHorizontal,
  Paperclip,
  Phone,
  Search,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessions, useChats } from "@/lib/hooks";
import { WAHASessionStatus, ChatSummary } from "@/lib/types";

function Conversation({
  chat,
  message,
  setMessage,
}: {
  chat: ChatSummary | null;
  message: string;
  setMessage: (v: string) => void;
}) {
  if (!chat) {
    return (
      <div className="conversation flex items-center justify-center text-muted-foreground text-sm">
        Select a conversation
      </div>
    );
  }

  const initials = chat.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="conversation">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="avatar avatar-teal">{initials}</div>
          <div>
            <p className="text-sm font-medium">{chat.name}</p>
            <p className="text-[11px] text-primary">active</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="icon-button">
            <Phone className="size-4" />
          </button>
          <button className="icon-button">
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>

      <div className="conversation-bg flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex max-w-lg flex-col gap-3">
          <div className="mx-auto rounded-full bg-muted px-3 py-1 text-[10px] text-muted-foreground">
            Today
          </div>
          {chat.lastMessage && (
            <div
              className={cn(
                "message",
                chat.lastMessage.fromMe ? "sent" : "received"
              )}
            >
              {chat.lastMessage.body}
              <span className="message-time">
                {new Date(chat.lastMessage.timestamp * 1000).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {chat.lastMessage.fromMe && (
                  <CheckCheck className="ml-1 inline size-3 text-primary" />
                )}
              </span>
            </div>
          )}
          {!chat.lastMessage && (
            <p className="text-center text-xs text-muted-foreground">No messages yet</p>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <button className="icon-button">
            <Paperclip className="size-4" />
          </button>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") setMessage(""); }}
            placeholder="Type a message"
            className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button className="icon-button">
            <CircleHelp className="size-4" />
          </button>
          <button
            className="send-button"
            onClick={() => setMessage("")}
            aria-label="Send message"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const { data: sessions } = useSessions(true);
  const workingSessions = sessions?.filter((s) => s.status === WAHASessionStatus.WORKING) ?? [];
  const [selectedSession, setSelectedSession] = useState<string>("");
  const activeSessionName = selectedSession || workingSessions[0]?.name || "";
  const { data: chats, isLoading } = useChats(activeSessionName);
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const visibleChats = (chats || []).filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const avatarColors = [
    "avatar-teal", "bg-indigo-700", "avatar-orange", "bg-violet-700", "bg-rose-700",
  ];

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep up with conversations across your connected sessions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {workingSessions.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="session-select" className="text-xs text-muted-foreground whitespace-nowrap">
                Session:
              </label>
              <select
                id="session-select"
                value={activeSessionName}
                onChange={(e) => { setSelectedSession(e.target.value); setSelected(0); }}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                {workingSessions.map((s) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
          <button className="soft-button">
            <Archive className="size-3.5" />
            Archived
          </button>
        </div>
      </div>

      <div className="inbox-shell">
        <div className="chat-list">
          <div className="border-b border-border p-3">
            <div className="input-shell">
              <Search className="size-4 text-muted-foreground" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-xs text-center text-muted-foreground">Loading chats...</div>
            ) : !activeSessionName ? (
              <div className="p-6 text-center text-xs text-muted-foreground">Connect a session to view chats</div>
            ) : visibleChats.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">No conversations yet</div>
            ) : (
              visibleChats.map((chat, idx) => (
                <button key={chat.id} onClick={() => setSelected(idx)} className={cn("chat-row", selected === idx && "chat-row-active")}>
                  <div className={cn("avatar", avatarColors[idx % avatarColors.length])}>{initials(chat.name)}</div>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{chat.name}</p>
                      {chat.lastMessage && (
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {new Date(chat.lastMessage.timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-muted-foreground">{chat.lastMessage?.body || "No messages yet"}</p>
                      {(chat.unreadCount ?? 0) > 0 && <span className="unread-badge">{chat.unreadCount}</span>}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
        <Conversation chat={visibleChats[selected] ?? null} message={message} setMessage={setMessage} />
      </div>
    </>
  );
}

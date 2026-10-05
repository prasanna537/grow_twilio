"use client";

import { useState, useEffect } from "react";
import { getStoredMessageHistory } from "@/lib/store";
import { WAMessage } from "@/lib/types";
import { Send, CheckCheck, Clock } from "lucide-react";

export function MessageHistory() {
  const [messages, setMessages] = useState<WAMessage[]>([]);

  const loadMessages = () => setMessages(getStoredMessageHistory());

  useEffect(() => {
    loadMessages();
    window.addEventListener("waha_messages_updated", loadMessages);
    return () => window.removeEventListener("waha_messages_updated", loadMessages);
  }, []);

  return (
    <div className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-3">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Send className="h-4 w-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Sent Message History
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {messages.length} sent
        </span>
      </div>

      <div className="p-4 max-h-80 overflow-y-auto space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60">
        {messages.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No messages sent yet in this session.
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={msg.id || idx} className="pt-3 first:pt-0 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {msg.to.replace("@c.us", "").replace("@g.us", "")}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(msg.timestamp * 1000).toLocaleTimeString()}</span>
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                </div>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-sans line-clamp-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                {msg.body || (msg.hasMedia ? "[Media attachment]" : "[Message payload]")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

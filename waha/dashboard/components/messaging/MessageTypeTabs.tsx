"use client";

import { FileText, Image as ImageIcon, Vote, MapPin } from "lucide-react";

export type MessageType = "text" | "media" | "poll" | "location";

interface MessageTypeTabsProps {
  activeTab: MessageType;
  onChange: (tab: MessageType) => void;
}

export function MessageTypeTabs({ activeTab, onChange }: MessageTypeTabsProps) {
  const tabs = [
    { id: "text" as MessageType, label: "Text", icon: FileText },
    { id: "media" as MessageType, label: "Media / File", icon: ImageIcon },
    { id: "poll" as MessageType, label: "Poll", icon: Vote },
    { id: "location" as MessageType, label: "Location", icon: MapPin },
  ];

  return (
    <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              isActive
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  ChevronRight,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessions, useChats } from "@/lib/hooks";
import { WAHASessionStatus } from "@/lib/types";

type Tab = "Contacts" | "Groups";

export default function ContactsPage() {
  const [tab, setTab] = useState<Tab>("Contacts");
  const [search, setSearch] = useState("");
  const { data: sessions } = useSessions(true);
  const workingSession = sessions?.find((s) => s.status === WAHASessionStatus.WORKING);
  const { data: chats } = useChats(workingSession?.name || "");

  // Separate individual chats vs group chats
  const contacts = (chats || []).filter((c) => !c.id.endsWith("@g.us"));
  const groups = (chats || []).filter((c) => c.id.endsWith("@g.us"));

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const avatarColors = [
    "avatar-teal", "bg-indigo-700", "avatar-orange", "bg-violet-700",
    "bg-rose-700", "bg-sky-700",
  ];

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts & groups</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and manage contacts synced from your WhatsApp sessions.
          </p>
        </div>
        {!workingSession && (
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-muted-foreground" />
            Connect a session to load contacts
          </span>
        )}
      </div>

      <div className="panel">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => setTab("Contacts")}
              className={cn("tab-button", tab === "Contacts" && "tab-button-active")}
            >
              Contacts <span className="tab-count">{filteredContacts.length}</span>
            </button>
            <button
              onClick={() => setTab("Groups")}
              className={cn("tab-button", tab === "Groups" && "tab-button-active")}
            >
              Groups <span className="tab-count">{filteredGroups.length}</span>
            </button>
          </div>
          <div className="flex gap-2">
            <div className="input-shell max-w-52">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${tab.toLowerCase()}`}
              />
            </div>
            <button className="icon-button">
              <Filter className="size-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {tab === "Contacts" ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>ID / Phone</th>
                  <th>Unread</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-xs text-muted-foreground">
                      {workingSession
                        ? "No contacts found."
                        : "Connect a session to load contacts."}
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact, i) => (
                    <tr key={contact.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={cn("avatar", avatarColors[i % avatarColors.length])}>
                            {initials(contact.name)}
                          </div>
                          <span className="font-medium">{contact.name}</span>
                        </div>
                      </td>
                      <td className="text-muted-foreground font-mono text-[10px]">{contact.id}</td>
                      <td>
                        {(contact.unreadCount ?? 0) > 0 && (
                          <span className="unread-badge">{contact.unreadCount}</span>
                        )}
                      </td>
                      <td>
                        <button className="icon-button ml-auto">
                          <MoreHorizontal className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Group ID</th>
                  <th>Unread</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-xs text-muted-foreground">
                      {workingSession ? "No groups found." : "Connect a session to load groups."}
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((group) => (
                    <tr key={group.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar avatar-orange">
                            <Users className="size-4" />
                          </div>
                          <span className="font-medium">{group.name}</span>
                        </div>
                      </td>
                      <td className="text-muted-foreground font-mono text-[10px] truncate max-w-xs">{group.id}</td>
                      <td>
                        {(group.unreadCount ?? 0) > 0 && (
                          <span className="unread-badge">{group.unreadCount}</span>
                        )}
                      </td>
                      <td>
                        <button className="soft-button ml-auto">
                          Manage <ChevronRight className="size-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

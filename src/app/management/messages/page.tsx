"use client";

import {
  Search,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Building2,
  Users,
  Calendar,
  FolderOpen,
} from "lucide-react";

const conversations = [
  {
    id: 1,
    name: "Riverside Office Complex",
    last: "Updated structural drawings.",
    time: "2m",
    unread: 3,
    online: true,
  },
  {
    id: 2,
    name: "Villa Aurora",
    last: "Waiting for client approval.",
    time: "18m",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "Carlos Mendes",
    last: "Can we schedule a meeting?",
    time: "1h",
    unread: 1,
    online: true,
  },
];

const messages = [
  {
    id: 1,
    sender: "Maria",
    time: "09:15",
    mine: false,
    text: "I've uploaded the revised floor plans.",
  },
  {
    id: 2,
    sender: "You",
    time: "09:22",
    mine: true,
    text: "Great. I'll review them this morning.",
  },
  {
    id: 3,
    sender: "Maria",
    time: "09:27",
    mine: false,
    text: "Please pay special attention to the structural grid changes.",
  },
];

export default function CommunicationPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-slate-900">
      {/* Sidebar */}
      <aside className="hidden w-80 shrink-0 flex-col border-r border-slate-200 lg:flex">
        <div className="border-b border-slate-200 p-5">
          <h1 className="text-xl font-semibold tracking-tight">Messages</h1>

          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((chat) => (
            <button
              key={chat.id}
              className={`flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${
                chat.id === 1 ? "bg-slate-100" : ""
              }`}
            >
              <div className="relative shrink-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900">
                  <Building2 className="h-5 w-5 text-white" />
                </div>

                {chat.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                )}
              </div>

              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-medium text-slate-900">
                    {chat.name}
                  </h3>
                  <span className="shrink-0 text-xs text-slate-400">
                    {chat.time}
                  </span>
                </div>

                <p className="truncate text-sm text-slate-500">
                  {chat.last}
                </p>
              </div>

              {chat.unread > 0 && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs text-white">
                  {chat.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Chat */}
      <main className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Riverside Office Complex
            </h2>
            <p className="text-sm text-slate-500">8 project members</p>
          </div>

          <div className="flex gap-2">
            <button className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100">
              <Phone size={17} />
            </button>
            <button className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100">
              <Video size={17} />
            </button>
            <button className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100">
              <MoreVertical size={17} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50 p-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.mine ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-md rounded-2xl px-4 py-3 ${
                  message.mine
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-900"
                }`}
              >
                {!message.mine && (
                  <p className="mb-1 text-xs font-semibold text-slate-500">
                    {message.sender}
                  </p>
                )}

                <p className="text-sm leading-relaxed">{message.text}</p>

                <p
                  className={`mt-2 text-right text-xs ${
                    message.mine ? "text-slate-400" : "text-slate-400"
                  }`}
                >
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="border-t border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <button className="shrink-0 rounded-lg border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-100">
              <Paperclip size={17} />
            </button>

            <input
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              placeholder="Write a message..."
            />

            <button className="shrink-0 rounded-lg bg-slate-900 p-3 text-white transition hover:bg-slate-800 active:bg-slate-950">
              <Send size={17} />
            </button>
          </div>
        </div>
      </main>

      {/* Project Info */}
      <aside className="hidden w-80 shrink-0 flex-col border-l border-slate-200 xl:flex">
        <div className="border-b border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900">
            Project Information
          </h2>
        </div>

        <div className="space-y-6 p-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Building2 className="text-slate-600" size={16} />
            </div>
            <div>
              <p className="font-medium text-slate-900">Status</p>
              <p className="text-slate-500">Construction</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Calendar className="text-slate-600" size={16} />
            </div>
            <div>
              <p className="font-medium text-slate-900">Deadline</p>
              <p className="text-slate-500">12 October 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Users className="text-slate-600" size={16} />
            </div>
            <div>
              <p className="font-medium text-slate-900">Team</p>
              <p className="text-slate-500">8 Members</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <FolderOpen className="text-slate-600" size={16} />
            </div>
            <div>
              <p className="font-medium text-slate-900">Recent Files</p>
              <p className="text-slate-500">FloorPlan_V5.pdf</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
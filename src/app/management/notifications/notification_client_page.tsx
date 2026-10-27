"use client";

import {
  Bell,
  CalendarClock,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  FolderKanban,
  MessageSquare,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/notification";

type NotificationType =
  | "revision"
  | "deadline"
  | "approval"
  | "document"
  | "task"
  | "project"
  | "message"
  | "mention"
  | "system";

type Notification = {
  id: number | string;
  type: NotificationType;
  title: string;
  project: string;
  description: string;
  time: string;
  unread: boolean;
  created_at?: string;
  action_url?: string | null;
};

const filters = [
  { label: "Todas", value: "all" },
  { label: "Não lidas", value: "unread" },
  { label: "Revisões", value: "revision" },
  { label: "Aprovações", value: "approval" },
  { label: "Documentos", value: "document" },
  { label: "Prazos", value: "deadline" },
] as const;

type FilterValue = (typeof filters)[number]["value"];

const typeConfig: Record<
  NotificationType,
  {
    icon: typeof FileText;
    iconClass: string;
    iconBackground: string;
    label: string;
  }
> = {
  revision: { icon: FileText, iconClass: "text-red-600", iconBackground: "bg-red-50", label: "Revisão" },
  deadline: { icon: CalendarClock, iconClass: "text-orange-600", iconBackground: "bg-orange-50", label: "Prazo" },
  approval: { icon: CheckCircle2, iconClass: "text-emerald-600", iconBackground: "bg-emerald-50", label: "Aprovação" },
  document: { icon: FileText, iconClass: "text-blue-600", iconBackground: "bg-blue-50", label: "Documento" },
  task: { icon: ClipboardCheck, iconClass: "text-violet-600", iconBackground: "bg-violet-50", label: "Tarefa" },
  project: { icon: FolderKanban, iconClass: "text-cyan-600", iconBackground: "bg-cyan-50", label: "Projecto" },
  message: { icon: MessageSquare, iconClass: "text-indigo-600", iconBackground: "bg-indigo-50", label: "Mensagem" },
  mention: { icon: UserRound, iconClass: "text-pink-600", iconBackground: "bg-pink-50", label: "Menção" },
  system: { icon: Bell, iconClass: "text-slate-600", iconBackground: "bg-slate-100", label: "Sistema" },
};

const emptyStates: Record<FilterValue, { title: string; description: string }> = {
  all: {
    title: "Tudo está tranquilo",
    description: "Quando houver actividade nos seus projectos, as notificações aparecerão aqui.",
  },
  unread: { title: "Está tudo actualizado", description: "Não tem notificações por ler." },
  revision: { title: "Sem revisões", description: "Não existem notificações de revisão neste momento." },
  approval: { title: "Sem aprovações", description: "Não existem aprovações para mostrar." },
  document: { title: "Sem documentos", description: "Não existem novas notificações de documentos." },
  deadline: { title: "Sem prazos próximos", description: "Não existem notificações de prazos." },
};

const GROUP_ORDER = ["Hoje", "Ontem", "Mais antigas", "Sem data"];

function getGroup(createdAt?: string) {
  if (!createdAt) return "Sem data";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Sem data";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";
  return "Mais antigas";
}

const focusRing =
  "outline-none focus-visible:ring-4 focus-visible:ring-[#BD9655]/30";

interface Props {
  notifications: Notification[];
}

export default function NotificationClientPage({
  notifications: initialNotifications,
}: Props) {
  const router = useRouter();

  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [showOnlyRecent, setShowOnlyRecent] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  const todayCount = useMemo(
    () => notifications.filter((n) => getGroup(n.created_at) === "Hoje").length,
    [notifications]
  );

  const projectCount = useMemo(
    () => new Set(notifications.map((n) => n.project).filter(Boolean)).size,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (activeFilter === "unread") {
      result = result.filter((n) => n.unread);
    } else if (activeFilter !== "all") {
      result = result.filter((n) => n.type === activeFilter);
    }

    if (showOnlyRecent) {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
      result = result.filter(
        (n) => !n.created_at || new Date(n.created_at).getTime() >= cutoff
      );
    }

    return result;
  }, [notifications, activeFilter, showOnlyRecent]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};

    filteredNotifications.forEach((n) => {
      const group = getGroup(n.created_at);
      (groups[group] ??= []).push(n);
    });

    return GROUP_ORDER.filter((g) => groups[g]).map(
      (g) => [g, groups[g]] as const
    );
  }, [filteredNotifications]);

  // Optimistic update; restores the previous state if saving fails.
  const markAllAsRead = async () => {
    const previous = notifications;

    setNotifications((current) => current.map((n) => ({ ...n, unread: false })));

    const result = await markAllNotificationsReadAction();
    if (!result.success) setNotifications(previous);
  };

  const markAsRead = async (id: number | string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target?.unread) return;

    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );

    const result = await markNotificationReadAction(String(id));

    if (!result.success) {
      setNotifications((current) =>
        current.map((n) => (n.id === id ? { ...n, unread: true } : n))
      );
    }
  };

  const handleView = async (notification: Notification) => {
    await markAsRead(notification.id);

    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  const clearFilters = () => {
    setActiveFilter("all");
    setShowOnlyRecent(false);
  };

  const hasActiveFilters = activeFilter !== "all" || showOnlyRecent;

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:py-12">
        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-[#002950] sm:text-3xl">
                Notificações
              </h1>

              {unreadCount > 0 && (
                <span className="rounded-full bg-[#002950] px-2.5 py-1 text-xs font-medium text-white">
                  {unreadCount} por ler
                </span>
              )}
            </div>

            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Acompanhe as actualizações e a actividade dos seus projectos.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className={`inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#BD9655] hover:text-[#002950] disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
          >
            <CheckCheck className="h-4 w-4" />
            Marcar tudo como lido
          </button>
        </header>

        {/* Summary */}
        <dl className="grid grid-cols-3 divide-x divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SummaryItem label="Por ler" value={unreadCount} highlight={unreadCount > 0} />
          <SummaryItem label="Hoje" value={todayCount} />
          <SummaryItem label="Projectos" value={projectCount} />
        </dl>

        {/* Filters */}
        <section className="space-y-3" aria-label="Filtros">
          <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {filters.map((filter) => {
              const active = activeFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${focusRing} ${
                    active
                      ? "border-[#002950] bg-[#002950] text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                  }`}
                >
                  {filter.label}
                  {filter.value === "unread" && unreadCount > 0 && (
                    <span className={`ml-1.5 text-xs ${active ? "text-[#E7C98D]" : "text-slate-400"}`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}

            <span className="mx-1 hidden h-5 w-px shrink-0 bg-slate-200 sm:block" />

            <button
              type="button"
              aria-pressed={showOnlyRecent}
              onClick={() => setShowOnlyRecent((c) => !c)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${focusRing} ${
                showOnlyRecent
                  ? "border-[#BD9655] bg-[#BD9655]/10 text-[#002950]"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <CalendarClock className="h-4 w-4" />
              Últimos 7 dias
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-sm text-slate-500 hover:text-slate-900 ${focusRing}`}
              >
                <X className="h-4 w-4" />
                Limpar
              </button>
            )}
          </div>

          <p className="text-xs text-slate-400" aria-live="polite">
            {filteredNotifications.length}{" "}
            {filteredNotifications.length === 1 ? "notificação" : "notificações"}
          </p>
        </section>

        {/* List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-8">
            {groupedNotifications.map(([group, items]) => (
              <section key={group} className="space-y-3">
                <h2 className="px-1 text-sm font-semibold text-slate-500">
                  {group}
                </h2>

                <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {items.map((notification) => {
                    const config = typeConfig[notification.type] ?? typeConfig.system;
                    const Icon = config.icon;

                    return (
                      <li
                        key={notification.id}
                        className={`group flex items-stretch transition-colors ${
                          notification.unread ? "bg-[#BD9655]/[0.05]" : "bg-white"
                        } hover:bg-slate-50`}
                      >
                        <button
                          type="button"
                          onClick={() => handleView(notification)}
                          className={`flex min-w-0 flex-1 items-start gap-4 p-4 text-left sm:p-5 ${focusRing} focus-visible:ring-inset`}
                        >
                          <span
                            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.iconBackground}`}
                          >
                            <Icon className={`h-5 w-5 ${config.iconClass}`} />
                            {notification.unread && (
                              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#BD9655]">
                                <span className="sr-only">Não lida</span>
                              </span>
                            )}
                          </span>

                          <span className="min-w-0 flex-1 space-y-1.5">
                            <span
                              className={`block text-sm leading-5 ${
                                notification.unread
                                  ? "font-semibold text-slate-900"
                                  : "font-medium text-slate-700"
                              }`}
                            >
                              {notification.title}
                            </span>

                            <span className="block text-sm leading-6 text-slate-600">
                              {notification.description}
                            </span>

                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-500">
                                {config.label}
                              </span>
                              {notification.project && <span>{notification.project}</span>}
                              <span aria-hidden>·</span>
                              <span>{notification.time}</span>
                            </span>
                          </span>
                        </button>

                        <div className="flex shrink-0 items-center gap-1 pr-3 sm:pr-4">
                          {notification.unread && (
                            <button
                              type="button"
                              aria-label="Marcar notificação como lida"
                              title="Marcar como lida"
                              onClick={() => markAsRead(notification.id)}
                              className={`rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#002950] ${focusRing}`}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <ChevronRight
                            aria-hidden
                            className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#BD9655]"
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Bell className="h-6 w-6 text-slate-400" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-[#002950]">
              {emptyStates[activeFilter].title}
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {emptyStates[activeFilter].description}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className={`mt-6 rounded-xl bg-[#002950] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#003b70] ${focusRing}`}
              >
                Ver todas as notificações
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-1 px-4 py-4 sm:px-6 sm:py-5">
      <dt className="flex items-center gap-2 text-sm text-slate-500">
        {label}
        {highlight && <span className="h-2 w-2 rounded-full bg-[#BD9655]" />}
      </dt>
      <dd className="text-2xl font-semibold tracking-tight text-[#002950] sm:text-3xl">
        {value}
      </dd>
    </div>
  );
}
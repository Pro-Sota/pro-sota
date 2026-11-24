
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
  { label: "Tarefas", value: "task" },
  { label: "Projectos", value: "project" },
  { label: "Mensagens", value: "message" },
  { label: "Menções", value: "mention" },
  { label: "Sistema", value: "system" },
] as const;

type FilterValue = (typeof filters)[number]["value"];

const typeConfig: Record<
  NotificationType,
  {
    icon: typeof FileText;
    label: string;
  }
> = {
  revision: { icon: FileText, label: "Revisão" },
  deadline: { icon: CalendarClock, label: "Prazo" },
  approval: { icon: CheckCircle2, label: "Aprovação" },
  document: { icon: FileText, label: "Documento" },
  task: { icon: ClipboardCheck, label: "Tarefa" },
  project: { icon: FolderKanban, label: "Projecto" },
  message: { icon: MessageSquare, label: "Mensagem" },
  mention: { icon: UserRound, label: "Menção" },
  system: { icon: Bell, label: "Sistema" },
};

const emptyStates: Record<
  FilterValue,
  { title: string; description: string }
> = {
  all: {
    title: "Tudo está tranquilo",
    description:
      "Quando houver actividade nos seus projectos, as notificações aparecerão aqui.",
  },
  unread: {
    title: "Está tudo actualizado",
    description: "Não tem notificações por ler.",
  },
  revision: {
    title: "Sem revisões",
    description: "Não existem notificações de revisão neste momento.",
  },
  approval: {
    title: "Sem aprovações",
    description: "Não existem aprovações para mostrar.",
  },
  document: {
    title: "Sem documentos",
    description: "Não existem novas notificações de documentos.",
  },
  deadline: {
    title: "Sem prazos próximos",
    description: "Não existem notificações de prazos.",
  },
  task: {
    title: "Sem notificações de tarefas",
    description: "Não existem actualizações de tarefas para mostrar.",
  },
  project: {
    title: "Sem notificações de projectos",
    description: "Não existem actualizações de projectos para mostrar.",
  },
  message: {
    title: "Sem mensagens novas",
    description: "Não existem notificações de mensagens para mostrar.",
  },
  mention: {
    title: "Sem menções",
    description: "Não existem notificações de menções para mostrar.",
  },
  system: {
    title: "Sem notificações do sistema",
    description: "Não existem notificações do sistema para mostrar.",
  },
};

const GROUP_ORDER = ["Hoje", "Ontem", "Mais antigas", "Sem data"];

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2";

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

function isSafeInternalUrl(url?: string | null): boolean {
  if (!url || !url.startsWith("/") || url.startsWith("//")) {
    return false;
  }

  return true;
}

interface Props {
  notifications: Notification[];
}

export default function NotificationClientPage({
  notifications: initialNotifications,
}: Props) {
  const router = useRouter();

  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const [activeFilter, setActiveFilter] =
    useState<FilterValue>("all");

  const [showOnlyRecent, setShowOnlyRecent] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(
    new Set()
  );

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications]
  );

  const todayCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          getGroup(notification.created_at) === "Hoje"
      ).length,
    [notifications]
  );

  const projectCount = useMemo(
    () =>
      new Set(
        notifications
          .map((notification) => notification.project)
          .filter(Boolean)
      ).size,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (activeFilter === "unread") {
      result = result.filter((notification) => notification.unread);
    } else if (activeFilter !== "all") {
      result = result.filter(
        (notification) => notification.type === activeFilter
      );
    }

    if (showOnlyRecent) {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

      result = result.filter((notification) => {
        if (!notification.created_at) return false;

        const date = new Date(notification.created_at).getTime();

        return !Number.isNaN(date) && date >= cutoff;
      });
    }

    return result;
  }, [notifications, activeFilter, showOnlyRecent]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};

    filteredNotifications.forEach((notification) => {
      const group = getGroup(notification.created_at);
      (groups[group] ??= []).push(notification);
    });

    return GROUP_ORDER.filter((group) => groups[group]).map(
      (group) => [group, groups[group]] as const
    );
  }, [filteredNotifications]);

  const markAsRead = async (
    id: number | string
  ): Promise<boolean> => {
    const key = String(id);

    const target = notifications.find(
      (notification) => String(notification.id) === key
    );

    if (!target || !target.unread) return true;
    if (pendingIds.has(key) || markingAll) return false;

    setPendingIds((current) => new Set(current).add(key));

    setNotifications((current) =>
      current.map((notification) =>
        String(notification.id) === key
          ? { ...notification, unread: false }
          : notification
      )
    );

    try {
      const result = await markNotificationReadAction(key);

      if (!result.success) {
        setNotifications((current) =>
          current.map((notification) =>
            String(notification.id) === key
              ? { ...notification, unread: true }
              : notification
          )
        );

        return false;
      }

      window.dispatchEvent(new Event("unread-counts:refresh"));

      return true;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);

      setNotifications((current) =>
        current.map((notification) =>
          String(notification.id) === key
            ? { ...notification, unread: true }
            : notification
        )
      );

      return false;
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(key);
        return next;
      });
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return;

    const previous = notifications;

    setMarkingAll(true);

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );

    try {
      const result = await markAllNotificationsReadAction();

      if (!result.success) {
        setNotifications(previous);
        return;
      }

      window.dispatchEvent(new Event("unread-counts:refresh"));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      setNotifications(previous);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleView = async (notification: Notification) => {
    const success = await markAsRead(notification.id);

    if (!success) return;

    if (isSafeInternalUrl(notification.action_url)) {
      router.push(notification.action_url!);
    }
  };

  const clearFilters = () => {
    setActiveFilter("all");
    setShowOnlyRecent(false);
  };

  const hasActiveFilters =
    activeFilter !== "all" || showOnlyRecent;

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:py-12">
        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                Notificações
              </h1>

              {unreadCount > 0 && (
                <span className="rounded-full bg-black px-2.5 py-1 text-xs font-medium text-white">
                  {unreadCount} por ler
                </span>
              )}
            </div>

            <p className="max-w-xl text-sm leading-6 text-gray-500">
              Acompanhe as actualizações e a actividade dos seus projectos.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || markingAll}
            className={`inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
          >
            <CheckCheck className="h-4 w-4" />
            {markingAll ? "A actualizar..." : "Marcar tudo como lido"}
          </button>
        </header>

        {/* Summary */}
        <dl className="grid grid-cols-3 divide-x divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <SummaryItem
            label="Por ler"
            value={unreadCount}
            highlight={unreadCount > 0}
          />
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
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${focusRing} ${active
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-black"
                    }`}
                >
                  {filter.label}

                  {filter.value === "unread" && unreadCount > 0 && (
                    <span
                      className={`ml-1.5 text-xs ${active ? "text-gray-300" : "text-gray-400"
                        }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}

            <span className="mx-1 hidden h-5 w-px shrink-0 bg-gray-200 sm:block" />

            <button
              type="button"
              aria-pressed={showOnlyRecent}
              onClick={() => setShowOnlyRecent((current) => !current)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${focusRing} ${showOnlyRecent
                ? "border-gray-500 bg-gray-100 text-black"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                }`}
            >
              <CalendarClock className="h-4 w-4" />
              Últimos 7 dias
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-sm text-gray-500 hover:text-black ${focusRing}`}
              >
                <X className="h-4 w-4" />
                Limpar
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400" aria-live="polite">
            {filteredNotifications.length}{" "}
            {filteredNotifications.length === 1
              ? "notificação"
              : "notificações"}
          </p>
        </section>

        {/* Notification list */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-8">
            {groupedNotifications.map(([group, items]) => (
              <section key={group} className="space-y-3">
                <h2 className="px-1 text-sm font-semibold text-gray-500">
                  {group}
                </h2>

                <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {items.map((notification) => {
                    const config =
                      typeConfig[notification.type] ?? typeConfig.system;

                    const Icon = config.icon;
                    const isPending = pendingIds.has(
                      String(notification.id)
                    );

                    return (
                      <li
                        key={notification.id}
                        className={`group flex items-stretch transition-colors ${notification.unread
                          ? "bg-gray-50"
                          : "bg-white"
                          } hover:bg-gray-50`}
                      >
                        <button
                          type="button"
                          onClick={() => handleView(notification)}
                          disabled={isPending || markingAll}
                          className={`flex min-w-0 flex-1 items-start gap-4 p-4 text-left disabled:cursor-wait sm:p-5 ${focusRing} focus-visible:ring-inset`}
                        >
                          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <Icon className="h-5 w-5 text-gray-700" />

                            {notification.unread && (
                              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-black">
                                <span className="sr-only">Não lida</span>
                              </span>
                            )}
                          </span>

                          <span className="min-w-0 flex-1 space-y-1.5">
                            <span
                              className={`block text-sm leading-5 ${notification.unread
                                ? "font-semibold text-black"
                                : "font-medium text-gray-700"
                                }`}
                            >
                              {notification.title}
                            </span>

                            <span className="block text-sm leading-6 text-gray-600">
                              {notification.description}
                            </span>

                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">
                                {config.label}
                              </span>

                              {notification.project && (
                                <span>{notification.project}</span>
                              )}

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
                              disabled={isPending || markingAll}
                              className={`rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-black disabled:cursor-wait disabled:opacity-50 ${focusRing}`}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}

                          <ChevronRight
                            aria-hidden
                            className="h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-600"
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
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100">
              <Bell className="h-6 w-6 text-gray-500" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-black">
              {emptyStates[activeFilter].title}
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              {emptyStates[activeFilter].description}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className={`mt-6 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 ${focusRing}`}
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
      <dt className="flex items-center gap-2 text-sm text-gray-500">
        {label}

        {highlight && (
          <span className="h-2 w-2 rounded-full bg-black" />
        )}
      </dt>

      <dd className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
        {value}
      </dd>
    </div>
  );
}

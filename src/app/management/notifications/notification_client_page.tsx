
"use client";

import {
  AlertTriangle,
  Bell,
  CalendarClock,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  FileText,
  FolderKanban,
  Mail,
  MessageSquare,
  MoreHorizontal,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
    borderClass: string;
    label: string;
  }
> = {
  revision: {
    icon: FileText,
    iconClass: "text-red-600",
    iconBackground: "bg-red-50",
    borderClass: "border-l-red-500",
    label: "Revisão",
  },
  deadline: {
    icon: CalendarClock,
    iconClass: "text-orange-600",
    iconBackground: "bg-orange-50",
    borderClass: "border-l-orange-500",
    label: "Prazo",
  },
  approval: {
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    iconBackground: "bg-emerald-50",
    borderClass: "border-l-emerald-500",
    label: "Aprovação",
  },
  document: {
    icon: FileText,
    iconClass: "text-blue-600",
    iconBackground: "bg-blue-50",
    borderClass: "border-l-blue-500",
    label: "Documento",
  },
  task: {
    icon: ClipboardCheck,
    iconClass: "text-violet-600",
    iconBackground: "bg-violet-50",
    borderClass: "border-l-violet-500",
    label: "Tarefa",
  },
  project: {
    icon: FolderKanban,
    iconClass: "text-cyan-600",
    iconBackground: "bg-cyan-50",
    borderClass: "border-l-cyan-500",
    label: "Projecto",
  },
  message: {
    icon: MessageSquare,
    iconClass: "text-indigo-600",
    iconBackground: "bg-indigo-50",
    borderClass: "border-l-indigo-500",
    label: "Mensagem",
  },
  mention: {
    icon: UserRound,
    iconClass: "text-pink-600",
    iconBackground: "bg-pink-50",
    borderClass: "border-l-pink-500",
    label: "Menção",
  },
  system: {
    icon: Bell,
    iconClass: "text-slate-600",
    iconBackground: "bg-slate-100",
    borderClass: "border-l-slate-400",
    label: "Sistema",
  },
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
};

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

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  const todayCount = useMemo(() => {
    if (!notifications.length) return 0;

    const today = new Date().toDateString();

    return notifications.filter((notification) => {
      if (!notification.created_at) return false;

      return (
        new Date(notification.created_at).toDateString() === today
      );
    }).length;
  }, [notifications]);

  const projectCount = useMemo(() => {
    return new Set(
      notifications
        .map((notification) => notification.project)
        .filter(Boolean)
    ).size;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    if (activeFilter === "unread") {
      result = result.filter((n) => n.unread);
    } else if (activeFilter !== "all") {
      result = result.filter((n) => n.type === activeFilter);
    }

    if (showOnlyRecent) {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

      result = result.filter((n) => {
        if (!n.created_at) return true;

        return new Date(n.created_at).getTime() >= cutoff;
      });
    }

    return result;
  }, [notifications, activeFilter, showOnlyRecent]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};

    filteredNotifications.forEach((notification) => {
      let group = "Actividade";

      if (notification.created_at) {
        const date = new Date(notification.created_at);
        const today = new Date();

        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
          group = "Hoje";
        } else if (date.toDateString() === yesterday.toDateString()) {
          group = "Ontem";
        } else {
          group = "Mais antigas";
        }
      }

      if (!groups[group]) groups[group] = [];

      groups[group].push(notification);
    });

    return groups;
  }, [filteredNotifications]);

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );

    // TODO: Persist in Supabase.
  };

  const markAsRead = (id: number | string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );

    // TODO: Persist in Supabase.
  };

  const handleView = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.action_url) {
      router.push(notification.action_url);
      return;
    }

    router.push(`/notifications/${notification.id}`);
  };

  const clearFilters = () => {
    setActiveFilter("all");
    setShowOnlyRecent(false);
  };

  const hasActiveFilters =
    activeFilter !== "all" || showOnlyRecent;

  return (
    <div className="min-h-screen bg-[#F7F7F5] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
              <Bell className="h-4 w-4" />
              <span>Centro de actividade</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-[#002950] sm:text-4xl">
                Notificações
              </h1>

              {unreadCount > 0 && (
                <span className="rounded-full bg-[#002950] px-3 py-1 text-xs font-semibold text-white">
                  {unreadCount} por ler
                </span>
              )}
            </div>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Acompanhe as actualizações e actividades dos seus projectos.
            </p>
          </div>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-[#BD9655] hover:text-[#002950] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar tudo como lido
          </button>
        </header>

        {/* Summary */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard
            icon={<Bell className="h-5 w-5" />}
            label="Por ler"
            value={unreadCount}
            description="Requerem a sua atenção"
            highlight={unreadCount > 0}
          />

          <SummaryCard
            icon={<CalendarClock className="h-5 w-5" />}
            label="Hoje"
            value={todayCount}
            description="Actividade registada hoje"
          />

          <SummaryCard
            icon={<FolderKanban className="h-5 w-5" />}
            label="Projectos"
            value={projectCount}
            description="Com actividade recente"
          />
        </div>

        {/* Filters */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
              {filters.map((filter) => {
                const active = activeFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-[#002950] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {filter.label}

                    {filter.value === "unread" && unreadCount > 0 && (
                      <span
                        className={`ml-1.5 text-xs ${
                          active ? "text-[#E7C98D]" : "text-slate-400"
                        }`}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowOnlyRecent((current) => !current)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  showOnlyRecent
                    ? "border-[#BD9655] bg-[#BD9655]/10 text-[#002950]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <CalendarClock className="h-4 w-4" />
                Últimos 7 dias
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-slate-500 hover:text-slate-900"
                >
                  <X className="h-4 w-4" />
                  Limpar
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Actividade recente
            </h2>

            <span className="text-xs text-slate-400">
              {filteredNotifications.length} notificações
            </span>
          </div>
        </section>

        {/* Notification List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-7">
            {Object.entries(groupedNotifications).map(
              ([group, groupNotifications]) => (
                <section key={group} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {group}
                    </h3>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <div className="space-y-2">
                    {groupNotifications.map((notification) => {
                      const config = typeConfig[notification.type];
                      const Icon = config.icon;

                      return (
                        <article
                          key={notification.id}
                          className={`group relative overflow-hidden rounded-xl border border-slate-200 border-l-4 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md ${config.borderClass} ${
                            notification.unread
                              ? "bg-white"
                              : "opacity-90"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleView(notification)}
                            className="flex w-full items-start gap-3 p-4 text-left sm:gap-4 sm:p-5"
                          >
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${config.iconBackground}`}
                            >
                              <Icon
                                className={`h-5 w-5 ${config.iconClass}`}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4
                                  className={`text-sm leading-5 ${
                                    notification.unread
                                      ? "font-semibold text-slate-900"
                                      : "font-medium text-slate-700"
                                  }`}
                                >
                                  {notification.title}
                                </h4>

                                {notification.unread && (
                                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#BD9655]" />
                                )}
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                <span>{config.label}</span>
                                <span>•</span>
                                <span>{notification.project}</span>
                              </div>

                              <p className="mt-2 text-sm leading-5 text-slate-600">
                                {notification.description}
                              </p>

                              <p className="mt-3 text-xs text-slate-400">
                                {notification.time}
                              </p>
                            </div>

                            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#BD9655]" />
                          </button>

                          {notification.unread && (
                            <button
                              type="button"
                              aria-label="Marcar notificação como lida"
                              onClick={() => markAsRead(notification.id)}
                              className="absolute bottom-3 right-10 hidden rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[#002950] sm:block"
                              title="Marcar como lida"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              )
            )}
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
                className="mt-5 rounded-lg bg-[#002950] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#003b70]"
              >
                Ver todas as notificações
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-center gap-2 pb-4 text-xs text-slate-400">
            <CheckCheck className="h-4 w-4" />
            Está a ver todas as notificações disponíveis
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  description,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            highlight ? "bg-[#BD9655]/15 text-[#002950]" : "bg-slate-100 text-slate-500"
          }`}
        >
          {icon}
        </div>

        {highlight && (
          <span className="h-2 w-2 rounded-full bg-[#BD9655]" />
        )}
      </div>

      <p className="mt-4 text-sm text-slate-500">{label}</p>

      <p className="mt-1 text-3xl font-semibold tracking-tight text-[#002950]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
  );
}
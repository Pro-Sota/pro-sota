

"use client";

import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
} from "lucide-react";
import { JSX, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/app/components/loader";

type NotificationType =
  | "revision"
  | "deadline"
  | "approval"
  | "document";

type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  project: string;
  description: string;
  time: string;
  unread: boolean;
};

const filters = [
  { label: "Todos", value: "all" },
  { label: "Não lidas", value: "unread" },
  { label: "Revisões", value: "revision" },
  { label: "Aprovações", value: "approval" },
  { label: "Documentos", value: "document" },
  { label: "Prazos", value: "deadline" },
] as const;

type FilterValue = (typeof filters)[number]["value"];

const typeColors: Record<NotificationType, string> = {
  revision: "border-l-red-500",
  deadline: "border-l-orange-500",
  approval: "border-l-green-500",
  document: "border-l-blue-500",
};

const icons: Record<NotificationType, JSX.Element> = {
  revision: <FileText className="h-5 w-5 text-slate-600" />,
  deadline: <Clock3 className="h-5 w-5 text-slate-600" />,
  approval: <CheckCircle2 className="h-5 w-5 text-slate-600" />,
  document: <FileText className="h-5 w-5 text-slate-600" />,
};

const emptyStates: Record<
  FilterValue,
  {
    title: string;
    description: string;
  }
> = {
  all: {
    title: "Sem notificações",
    description:
      "Quando existir atividade nos seus projetos, as notificações aparecerão aqui.",
  },
  unread: {
    title: "Nenhuma notificação por ler",
    description: "Está tudo atualizado.",
  },
  revision: {
    title: "Sem revisões",
    description: "Não existem revisões pendentes.",
  },
  approval: {
    title: "Sem aprovações",
    description: "Não existem aprovações para mostrar.",
  },
  document: {
    title: "Sem documentos",
    description: "Não existem novos documentos.",
  },
  deadline: {
    title: "Sem prazos",
    description: "Não existem prazos próximos.",
  },
};

interface props  {
    notifications: Notification[]
}

export default function NotificationClientPage({notifications}:props) {
  const router = useRouter(); 

  // Replace with your API data later
  const [loading, setLoading] = useState(true);

  const [activeFilter, setActiveFilter] =
    useState<FilterValue>("all");

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case "all":
        return notifications;

      case "unread":
        return notifications.filter((n) => n.unread);

      case "revision":
        return notifications.filter((n) => n.type === "revision");

      case "approval":
        return notifications.filter((n) => n.type === "approval");

      case "document":
        return notifications.filter((n) => n.type === "document");

      case "deadline":
        return notifications.filter((n) => n.type === "deadline");

      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  const markAllAsRead = () => {
   
  };

  const markAsRead = (id: number) => {
    
  };

  const handleView = (notification: Notification) => {
    // Update this route according to your app
    router.push(`/notifications/${notification.id}`);
  };


  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return (<Loader />);

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-3">
            <Bell className="h-7 w-7 text-slate-700" />

            <h1 className="text-3xl font-medium text-slate-900">
              Notificações
            </h1>
          </div>

          <p className="text-slate-600">
            Mantenha-se atualizado com a atividade do projeto.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  activeFilter === filter.value
                    ? "bg-slate-800 text-white"
                    : "text-slate-700 hover:bg-slate-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <button
            onClick={markAllAsRead}
            disabled={!notifications.some((n) => n.unread)}
            className="flex w-fit items-center gap-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            Marcar tudo como lido
          </button>
        </div>

        {/* Notification List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border border-slate-200 border-l-4 bg-white p-5 transition hover:shadow-md ${
                  typeColors[notification.type]
                }`}
              >
                <div className="flex gap-4">
                  <div className="mt-1 shrink-0">
                    {icons[notification.type]}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-medium text-slate-900">
                        {notification.title}
                      </h3>

                      {notification.unread && (
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                      )}
                    </div>

                    <p className="mb-2 text-sm text-slate-600">
                      {notification.project}
                    </p>

                    <p className="mb-3 text-slate-700">
                      {notification.description}
                    </p>

                    <p className="text-xs text-slate-500">
                      {notification.time}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => handleView(notification)}
                      className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
                    >
                      Ver
                    </button>

                    <button
                      onClick={() => markAsRead(notification.id)}
                      disabled={!notification.unread}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Lido
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white py-16 text-center">
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-slate-400" />

            <h2 className="text-lg font-medium text-slate-900">
              {emptyStates[activeFilter].title}
            </h2>

            <p className="mt-2 text-slate-600">
              {emptyStates[activeFilter].description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
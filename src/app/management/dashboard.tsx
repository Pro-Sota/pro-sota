"use client";

import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  FileText,
  Inbox,
  Plus,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import CreateMeetingModal from "../components/create_meeting_modal";
import { Database } from "../lib/supabase/models";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Activity = Database["public"]["Tables"]["activity_logs"]["Row"];

interface DashboardData {
  currentUser: Profile | null;
  projects: Project[];
  documents: Document[];
  tasks: Task[];
  deadlines: Task[];
  activities: Activity[];
}

interface DashboardProps {
  data: DashboardData;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center py-8 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>

      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

      <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
        {description}
      </p>

      {action && (
        <button
          type="button"
          onClick={() => router.push(action.href)}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-900 transition-colors hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default function Dashboard({ data }: DashboardProps) {
  const router = useRouter();
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  const currentUser = data.currentUser;
  const projects = data.projects ?? [];
  const tasks = data.tasks ?? [];
  const deadlines = data.deadlines ?? [];
  const activities = data.activities ?? [];
  const documents = data.documents ?? [];

  const completedTasks = tasks.filter(
    (task) =>
      task.status === "Concluído" ||
      task.status === "completed" ||
      task.status === "done",
  ).length;

  const openTasks = Math.max(tasks.length - completedTasks, 0);

  const firstName =
    currentUser?.first_name?.trim() ||
    currentUser?.email?.split("@")[0]?.trim() ||
    "utilizador";

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Bom dia";
    }

    if (hour >= 12 && hour < 18) {
      return "Boa tarde";
    }

    return "Boa noite";
  };

  /*
   * Quick actions are for actions the user can perform.
   * Stats below are for understanding the user's current workload.
   */
  const quickActions = [
    {
      label: "Nova tarefa",
      icon: Plus,
      href: "/management/tasks/create",
      variant: "primary" as const,
    },
    {
      label: "Carregar documento",
      icon: Upload,
      href: "/management/documents/upload",
      variant: "secondary" as const,
    },
    {
      label: "Agendar reunião",
      icon: CalendarPlus,
      href: "",
      variant: "secondary" as const,
    },
    {
      label: "Ver calendário",
      icon: CalendarDays,
      href: "/management/calendar",
      variant: "secondary" as const,
    },
  ];

  /*
   * Stats are intentionally different from the quick actions.
   * They provide a summary rather than another set of navigation shortcuts.
   */
  const stats = [
    {
      title: "Projectos activos",
      value: projects.length,
      icon: Briefcase,
      href: "/management/projects",
    },
    {
      title: "Tarefas em aberto",
      value: openTasks,
      icon: ClipboardList,
      href: "/management/tasks",
    },
    {
      title: "Prazos próximos",
      value: deadlines.length,
      icon: CalendarDays,
      href: "/management/tasks",
    },
    {
      title: "Documentos recentes",
      value: documents.length,
      icon: FileText,
      href: "/management/documents",
    },
  ];

  function handleProjectClick(projectId: string) {
    router.push(`/management/projects/${projectId}`);
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
          <header className="border-b border-gray-200 pb-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                {getGreeting()}, {firstName}
              </h1>

              <p className="max-w-2xl text-sm leading-6 text-gray-600">
                Aqui está uma visão geral do seu trabalho no gabinete de
                arquitetura.
              </p>
            </div>
          </header>

          {/* Quick Actions */}
          <section>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    if (action.label === "Agendar reunião") {
                      setIsMeetingModalOpen(true);
                      return;
                    }

                    router.push(action.href);
                  }}
                  className={`group flex min-h-[92px] cursor-pointer flex-col items-start justify-between rounded-lg px-4 py-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 sm:min-h-[104px] sm:px-5 sm:py-5 ${action.variant === "primary"
                      ? "bg-[#BD9655] text-[#002950] hover:bg-[#C8A66E]"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
                    }`}
                >
                  <action.icon className="h-5 w-5" />

                  <span className="text-xs font-medium sm:text-sm">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Statistics */}
          <section>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {stats.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-4 text-left transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 sm:p-5 lg:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-5 text-gray-600 sm:text-sm">
                        {item.title}
                      </p>

                      <p className="mt-2 text-2xl font-bold text-[#002950] sm:mt-3 sm:text-3xl">
                        {item.value}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-gray-200 sm:h-10 sm:w-10">
                      <item.icon className="h-4 w-4 text-[#002950] sm:h-5 sm:w-5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Main Dashboard Grid */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
            {/* Projects */}
            <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6 sm:py-5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    Projectos Activos
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    {projects.length > 6
                      ? `A mostrar 6 de ${projects.length} projectos`
                      : "Projectos em que participa actualmente"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/management/projects")}
                  className="shrink-0 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                >
                  Ver todos
                </button>
              </div>

              <div className="p-4 sm:p-6">
                {projects.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="Nenhum projecto activo"
                    description="Os projectos em que participa aparecerão aqui."
                    action={{
                      label: "Ver projectos",
                      href: "/management/projects",
                    }}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] border-separate border-spacing-0 text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border-b border-gray-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                            Projecto
                          </th>

                          <th className="border-b border-gray-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                            Estado
                          </th>

                          <th className="border-b border-gray-200 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                            Progresso
                          </th>

                          <th className="border-b border-gray-200 px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                            Prazo
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {projects.slice(0, 6).map((project) => {
                          const progress = 0;

                          const statusConfig = {
                            active: {
                              label: "Em curso",
                              className: "bg-green-50 text-green-700",
                              dot: "bg-green-500",
                            },
                            "on track": {
                              label: "Em curso",
                              className: "bg-green-50 text-green-700",
                              dot: "bg-green-500",
                            },
                            "at risk": {
                              label: "Em risco",
                              className: "bg-orange-50 text-orange-700",
                              dot: "bg-orange-500",
                            },
                            delayed: {
                              label: "Atrasado",
                              className: "bg-red-50 text-red-700",
                              dot: "bg-red-500",
                            },
                          };

                          const config =
                            statusConfig[
                            project.status?.toLowerCase() as keyof typeof statusConfig
                            ] ?? {
                              label: project.status || "Sem estado",
                              className: "bg-gray-100 text-gray-700",
                              dot: "bg-gray-400",
                            };

                          return (
                            <tr
                              key={project.project_id}
                              onClick={() =>
                                handleProjectClick(project.project_id)
                              }
                              className="group cursor-pointer transition-colors hover:bg-gray-50"
                            >
                              <td className="border-b border-gray-100 px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                    <Building2 className="h-4 w-4" />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-gray-900">
                                      {project.title}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-gray-500">
                                      {project.project_code}
                                      {project.location &&
                                        ` · ${project.location}`}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="border-b border-gray-100 px-4 py-4">
                                <span
                                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                                  />
                                  {config.label}
                                </span>
                              </td>

                              <td className="border-b border-gray-100 px-4 py-4">
                                <div className="w-32">
                                  <div className="mb-1.5 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-900">
                                      {progress}%
                                    </span>
                                  </div>

                                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                      className="h-full rounded-full bg-gray-900 transition-all"
                                      style={{
                                        width: `${Math.min(
                                          Math.max(progress, 0),
                                          100,
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>

                              <td className="border-b border-gray-100 px-4 py-4 text-right">
                                <span className="whitespace-nowrap text-sm font-medium text-gray-700">
                                  {project.end_date
                                    ? new Date(
                                      project.end_date,
                                    ).toLocaleDateString("pt-PT", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                    : "—"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* Deadlines */}
            <section className="min-w-0 rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-5 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      Próximos Prazos
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Tarefas com datas próximas
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/management/tasks")}
                    className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Ver
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {deadlines.length === 0 ? (
                  <EmptyState
                    icon={CalendarDays}
                    title="Sem prazos agendados"
                    description="Os prazos aparecerão aqui à medida que forem atribuídos."
                  />
                ) : (
                  <div className="space-y-1">
                    {deadlines.slice(0, 6).map((item) => (
                      <button
                        type="button"
                        key={item.task_id}
                        onClick={() =>
                          item.project_id
                            ? router.push(
                              `/management/projects/${item.project_id}/tasks`,
                            )
                            : router.push("/management/tasks")
                        }
                        className="flex w-full gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <CalendarDays className="h-4 w-4 text-gray-500" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {item.title}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {item.project_id || "Sem projecto"}
                          </p>

                          <p className="mt-1 text-xs font-medium text-gray-400">
                            {item.due_date
                              ? new Date(item.due_date).toLocaleDateString(
                                "pt-PT",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                              : "Sem data"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Activity + Documents */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentActivitiesSection activities={activities} />
            <RecentDocumentsSection documents={documents} />
          </div>
        </div>
      </div>

      <CreateMeetingModal
        open={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
      />
    </div>
  );
}

function RecentActivitiesSection({
  activities,
}: {
  activities: Activity[];
}) {
  const router = useRouter();

  return (
    <section className="min-w-0 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6 sm:py-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Actividades Recentes
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Actividade recente no sistema
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/management/activity")}
          className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          Ver todas
        </button>
      </div>

      <div className="p-5 sm:p-6">
        {activities.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Sem actividade"
            description="A actividade da equipa aparecerá aqui."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.slice(0, 6).map((activity) => {
              const initials = activity.user_id
                ? activity.user_id.substring(0, 2).toUpperCase()
                : "?";

              return (
                <div
                  key={activity.activity_id}
                  className="flex gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-5 text-gray-900">
                      {activity.description}
                    </p>

                    {activity.project_id && (
                      <p className="mt-1 truncate text-xs text-gray-500">
                        {activity.project_id}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-gray-400">
                      {activity.created_at
                        ? new Date(activity.created_at).toLocaleDateString(
                          "pt-PT",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                        : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function RecentDocumentsSection({
  documents,
}: {
  documents: Document[];
}) {
  const router = useRouter();

  return (
    <section className="min-w-0 rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Documentos Recentes
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Documentos adicionados recentemente
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/management/documents")}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Ver todos
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {documents.length === 0 ? (
          <EmptyState
            icon={Upload}
            title="Sem documentos"
            description="Os documentos aparecerão aqui após o envio."
            action={{
              label: "Carregar",
              href: "/management/documents/upload",
            }}
          />
        ) : (
          <div className="space-y-1">
            {documents.slice(0, 6).map((doc) => (
              <button
                type="button"
                key={doc.document_id}
                onClick={() => {
                  if (doc.project_id) {
                    router.push(
                      `/management/projects/${doc.project_id}/documents`,
                    );
                  } else {
                    router.push("/management/documents");
                  }
                }}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-gray-200">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {doc.name || doc.file_path}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {doc.project_id || "Sem projecto"}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {doc.created_at
                      ? new Date(doc.created_at).toLocaleDateString("pt-PT", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                      : ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

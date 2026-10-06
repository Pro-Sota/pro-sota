"use client";

import {
  Briefcase,
  Users,
  Building2,
  ClipboardList,
  CalendarDays,
  Plus,
  UserPlus,
  Upload,
  CalendarPlus,
  Inbox,
  ArrowRight,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Database } from "../lib/supabase/models";
import CreateMeetingModal from "../components/create_meeting_modal";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type Client = Database["public"]["Tables"]["clients"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Activity = Database["public"]["Tables"]["activity_logs"]["Row"];

export type TeamWorkload = {
  user_id: string;
  name: string;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  estimated_hours: number;
  actual_hours: number;
  hours_remaining: number;
  workload_percentage: number;
};

export interface AdminDashboardData {
  currentUser: Profile | null;
  users: Profile[];
  projects: Project[];
  clients: Client[];
  documents: Document[];
  tasks: Task[];
  deadlines: Task[];
  activities: Activity[];
  teamWorkload: TeamWorkload[];
}

interface DashboardProps {
  data: AdminDashboardData;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>

      <h3 className="text-center text-sm font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-1 max-w-xs text-center text-sm text-gray-500">
        {description}
      </p>

      {action && (
        <button
          type="button"
          onClick={() => router.push(action.href)}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-900 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

const getProjectStatus = (status: string | null) => {
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

  return (
    statusConfig[status?.toLowerCase() as keyof typeof statusConfig] ?? {
      label: status || "Sem estado",
      className: "bg-gray-100 text-gray-700",
      dot: "bg-gray-400",
    }
  );
};

const formatDate = (
  value: string | null,
  includeYear = true,
) => {
  if (!value) return null;

  return new Date(value).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  });
};

export default function AdminDashboard({
  data,
}: DashboardProps) {
  const router = useRouter();

  const [isMeetingModalOpen, setIsMeetingModalOpen] =
    useState(false);

  const {
    currentUser,
    users,
    projects,
    clients,
    documents,
    tasks,
    deadlines,
    activities,
    teamWorkload,
  } = data;

  const stats = [
    {
      title: "Projectos Activos",
      value: projects.length,
      icon: Briefcase,
      href: "/management/projects",
    },
    {
      title: "Clientes",
      value: clients.length,
      icon: Building2,
      href: "/management/clients",
    },
    {
      title: "Membros da Equipa",
      value: users.length,
      icon: Users,
      href: "/management/team",
    },
    {
      title: "Tarefas Pendentes",
      value: tasks.filter(
        (task) =>
          task.status !== "completed" &&
          task.status !== "Concluído",
      ).length,
      icon: ClipboardList,
      href: "/management/tasks",
    },
  ];

  const quickActions = [
    {
      label: "Novo projecto",
      icon: Plus,
      href: "/management/projects/create-project",
      variant: "primary" as const,
    },
    {
      label: "Adicionar Cliente",
      icon: UserPlus,
      href: "/management/clients/create-client",
      variant: "secondary" as const,
    },
    {
      label: "Adicionar colaborador",
      icon: UserPlus,
      href: "/management/team/create-member",
      variant: "secondary" as const,
    },
    {
      label: "Agendar Reunião",
      icon: CalendarPlus,
      href: "",
      variant: "secondary" as const,
    },
  ];

  function handleProjectClick(projectId: string) {
    router.push(`/management/projects/${projectId}`);
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="min-w-0 space-y-8 sm:space-y-10">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Olá, {currentUser?.first_name || "Administrador"}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Bem-vindo de volta. Aqui está uma visão geral
              da actividade do gabinete.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  if (action.label === "Agendar Reunião") {
                    setIsMeetingModalOpen(true);
                    return;
                  }

                  router.push(action.href);
                }}
                className={`group flex min-h-[82px] cursor-pointer flex-col items-start justify-between gap-3 rounded-lg px-4 py-3.5 text-left text-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 sm:min-h-[96px] sm:px-5 sm:py-4 ${
                  action.variant === "primary"
                    ? "bg-[#BD9655] text-[#002950] hover:bg-[#C8A66E] active:bg-gray-950"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                }`}
              >
                <action.icon className="h-4 w-4 shrink-0" />

                <span className="text-xs sm:text-sm">
                  {action.label}
                </span>
              </button>
            ))}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {stats.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => router.push(item.href)}
                className="group min-w-0 cursor-pointer rounded-lg border border-gray-200 bg-white p-4 text-left transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-gray-600 sm:text-sm">
                      {item.title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#002950] sm:mt-4 sm:text-4xl">
                      {item.value}
                    </p>
                  </div>

                  <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-gray-200 sm:flex sm:h-12 sm:w-12">
                    <item.icon className="h-5 w-5 text-[#002950] sm:h-6 sm:w-6" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Projects + Deadlines */}
          <div className="grid min-w-0 gap-6 lg:grid-cols-3">
            {/* Projects */}
            <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white lg:col-span-2">
              <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-gray-900">
                    Projectos Activos
                  </h2>

                  <p className="mt-1 truncate text-xs text-gray-500">
                    {projects.length > 6
                      ? `A mostrar 6 de ${projects.length} projectos`
                      : "Projectos em que participa actualmente"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/management/projects")
                  }
                  className="shrink-0 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
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
                  <>
                    {/* Mobile */}
                    <div className="space-y-2 md:hidden">
                      {projects.slice(0, 6).map((project) => {
                        const progress = 0;
                        const config = getProjectStatus(
                          project.status,
                        );

                        return (
                          <button
                            key={project.project_id}
                            type="button"
                            onClick={() =>
                              handleProjectClick(
                                project.project_id,
                              )
                            }
                            className="group w-full rounded-lg border border-gray-100 p-4 text-left transition-colors hover:border-gray-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                <Building2 className="h-4 w-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                  {project.title}
                                </p>

                                <p className="mt-0.5 truncate text-xs text-gray-500">
                                  {project.project_code}
                                  {project.location &&
                                    ` · ${project.location}`}
                                </p>
                              </div>

                              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <span
                                className={`inline-flex min-w-0 items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`}
                                />
                                <span className="truncate">
                                  {config.label}
                                </span>
                              </span>

                              <span className="shrink-0 text-xs font-medium text-gray-500">
                                {formatDate(
                                  project.end_date,
                                ) || "Sem prazo"}
                              </span>
                            </div>

                            <div className="mt-4">
                              <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                                  Progresso
                                </span>

                                <span className="text-xs font-semibold text-gray-700">
                                  {progress}%
                                </span>
                              </div>

                              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
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
                          </button>
                        );
                      })}
                    </div>

                    {/* Desktop / Tablet */}
                    <div className="hidden md:block">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] border-separate border-spacing-0 text-sm">
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
                              const config = getProjectStatus(
                                project.status,
                              );

                              return (
                                <tr
                                  key={project.project_id}
                                  onClick={() =>
                                    handleProjectClick(
                                      project.project_id,
                                    )
                                  }
                                  className="group cursor-pointer transition-colors hover:bg-gray-50"
                                >
                                  <td className="max-w-[300px] border-b border-gray-100 px-4 py-4">
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
                                              Math.max(
                                                progress,
                                                0,
                                              ),
                                              100,
                                            )}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </td>

                                  <td className="border-b border-gray-100 px-4 py-4 text-right">
                                    <span className="whitespace-nowrap text-sm font-medium text-gray-700">
                                      {formatDate(
                                        project.end_date,
                                      ) || "—"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Deadlines */}
            <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-5 py-4 sm:px-6 sm:py-6">
                <h2 className="text-base font-semibold text-gray-900">
                  Próximos Prazos
                </h2>
              </div>

              <div className="px-4 py-6 sm:px-6 sm:py-8">
                {deadlines.length === 0 ? (
                  <EmptyState
                    icon={CalendarDays}
                    title="Sem prazos agendados"
                    description="Os prazos aparecerão aqui à medida que forem atribuídos."
                  />
                ) : (
                  <div className="space-y-2 sm:space-y-4">
                    {deadlines.map((item) => (
                      <div
                        key={item.task_id}
                        className="flex gap-3 rounded-md p-3 transition-colors hover:bg-gray-50"
                      >
                        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {item.title}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {item.project_id || "Sem projecto"}
                          </p>

                          <p className="mt-1 text-xs font-medium text-gray-400">
                            {formatDate(item.due_date) ||
                              "Sem data"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Bottom Grid */}
          <div className="grid min-w-0 gap-6 lg:grid-cols-3">
            <RecentActivitiesSection
              activities={activities}
            />

            <TeamWorkloadSection
              teamWorkload={teamWorkload}
            />

            <RecentDocumentsSection
              documents={documents}
            />
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
    <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate text-base font-semibold text-gray-900">
            Actividades Recentes
          </h2>

          <button
            type="button"
            onClick={() =>
              router.push("/management/activity")
            }
            className="shrink-0 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Ver todas
          </button>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6">
        {activities.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Sem actividade"
            description="A actividade da equipa aparecerá aqui."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.slice(0, 8).map((activity) => {
              const initials = activity.user_id
                ? activity.user_id
                    .substring(0, 2)
                    .toUpperCase()
                : "?";

              return (
                <div
                  key={activity.activity_id}
                  className="group flex min-w-0 gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm leading-5 text-gray-900">
                      {activity.description}
                    </p>

                    {activity.project_id && (
                      <p className="mt-1 truncate text-xs text-gray-500">
                        {activity.project_id}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-gray-400">
                      {activity.created_at
                        ? new Date(
                            activity.created_at,
                          ).toLocaleDateString(
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

function TeamWorkloadSection({
  teamWorkload,
}: {
  teamWorkload: TeamWorkload[];
}) {
  const router = useRouter();

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate text-base font-semibold text-gray-900">
            Carga da Equipa
          </h2>

          <button
            type="button"
            onClick={() =>
              router.push("/management/team")
            }
            className="shrink-0 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Ver equipa
          </button>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6">
        {teamWorkload.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sem dados da equipa"
            description="A distribuição de trabalho aparecerá aqui."
          />
        ) : (
          <div className="space-y-5">
            {teamWorkload.slice(0, 8).map((member) => (
              <div key={member.user_id} className="min-w-0">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                      {member.name
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {member.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {member.total_tasks}{" "}
                        {member.total_tasks === 1
                          ? "tarefa"
                          : "tarefas"}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-gray-900">
                    {member.workload_percentage}%
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gray-900 transition-all"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          member.workload_percentage,
                          0,
                        ),
                        100,
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-gray-400">
                  <span>
                    {member.completed_tasks} concluídas
                  </span>

                  <span>
                    {member.pending_tasks} pendentes
                  </span>
                </div>
              </div>
            ))}
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
    <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate text-base font-semibold text-gray-900">
            Documentos Recentes
          </h2>

          <button
            type="button"
            onClick={() =>
              router.push("/management/documents")
            }
            className="shrink-0 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Ver todos
          </button>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6 sm:py-8">
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
          <div className="space-y-2 sm:space-y-4">
            {documents.slice(0, 8).map((doc) => (
              <div
                key={doc.document_id}
                className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-md p-3 transition-colors hover:bg-gray-50"
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
                      ? new Date(
                          doc.created_at,
                        ).toLocaleDateString(
                          "pt-PT",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
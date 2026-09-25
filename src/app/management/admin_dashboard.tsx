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

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className: string }>;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Icon className="h-7 w-7 text-gray-400" />
      </div>

      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

      <p className="mt-1 max-w-xs text-sm text-gray-500 text-center">
        {description}
      </p>

      {action && (
        <button
          onClick={() => router.push(action.href)}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type Client = Database["public"]["Tables"]["clients"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Activity = Database["public"]["Tables"]["activity_logs"]["Row"];

interface DashboardData {
  currentUser: Profile;
  users: Profile[];
  projects: Project[];
  clients: Client[];
  documents: Document[];
  tasks: Task[];
  deadlines: Task[];
  activities: Activity[];
}

interface DashboardProps {
  data: DashboardData;
}

export default function AdminDashboard({ data }: DashboardProps) {
  const router = useRouter();
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  const projects = data.projects;
  const clients = data.clients;
  const tasks = data.tasks;
  const deadlines = data.deadlines;
  const activities = data.activities;
  const documents = data.documents;

  const teamSize = data.users.length ?? 0;
  const activeProjects = data.projects;

  const stats = [
    {
      title: "Projectos Activos",
      value: activeProjects.length,
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
      value: teamSize,
      icon: Users,
      href: "/management/team",
    },
    {
      title: "Tarefas Pendentes",
      value: tasks.length,
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

  function handleProjClick(projectId: string) {
    router.push(`/management/projects/${projectId}`);
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="space-y-8 sm:space-y-10">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              Ola, {data.currentUser.first_name}
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Bem-vindo de volta. Aqui está uma visão geral do seu gabinete de
              arquitetura.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  if (action.label === "Agendar Reunião") {
                    setIsMeetingModalOpen(true);
                    return;
                  }

                  router.push(action.href);
                }}
                className={`group cursor-pointer flex flex-col items-start gap-2 rounded-lg px-4 py-3.5 text-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 ${action.variant === "primary"
                  ? "bg-[#BD9655] text-[#002950] font-medium hover:bg-[#C8A66E] active:bg-gray-950"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100"
                  }`}
              >
                <action.icon className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Statistics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <button
                key={item.title}
                onClick={() => router.push(item.href)}
                className="group cursor-pointer rounded-lg border border-gray-200 bg-white p-5 sm:p-6 transition-all duration-200 hover:border-gray-300 hover:shadow-md hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 text-left"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      {item.title}
                    </p>

                    <p className="mt-3 sm:mt-4 text-3xl sm:text-4xl font-bold text-[#002950]">
                      {item.value}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#002950]" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Projects */}
            <section className="lg:col-span-2 rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-6 py-4 sm:py-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">
                    Projectos Activos
                  </h2>
                  <button
                    onClick={() => router.push("/management/projects")}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                  >
                    Ver todos
                  </button>
                </div>
              </div>

              <div className="px-6 py-8">
                {projects.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="Nenhum projecto activo"
                    description="Comece criando um novo projecto para acompanhar o trabalho da equipa."
                    action={{
                      label: "Novo Projecto",
                      href: "/management/projects/create-project",
                    }}
                  />
                ) : (
                  <div className="overflow-x-auto h-[400px]">
                    <table className="min-w-[700px] w-full border-separate border-spacing-0 text-sm">
                      <thead className="sticky">
                        <tr className="bg-gray-50">
                          <th className="border-b border-gray-200 px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                            Projecto
                          </th>

                          <th className="border-b border-gray-200 px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                            Status
                          </th>

                          <th className="border-b border-gray-200 px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                            Progresso
                          </th>

                          <th className="border-b border-gray-200 px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                            Prazo
                          </th>
                        </tr>
                      </thead>

                      <tbody className="overflow-y-auto">
                        {projects.map((proj) => {
                          // Replace these with your actual project fields
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

                          const config = statusConfig[
                            proj.status?.toLowerCase() as keyof typeof statusConfig
                          ] ?? {
                            label: proj.status,
                            className: "bg-gray-100 text-gray-700",
                            dot: "bg-gray-400",
                          };

                          return (
                            <tr
                              key={proj.project_id}
                              onClick={() => handleProjClick(proj.project_id)}
                              className="group cursor-pointer transition-colors hover:bg-gray-50 "
                            >
                              {/* Project */}
                              <td className="border-b border-gray-100 px-5 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                                    <Building2 className="h-5 w-5" />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-gray-900">
                                      {proj.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                      {proj.project_code}
                                      {proj.location && ` · ${proj.location}`}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="border-b border-gray-100 px-5 py-5">
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                                  />
                                  {config.label}
                                </span>
                              </td>

                              {/* Progress */}
                              <td className="border-b border-gray-100 px-5 py-5">
                                <div className="w-40">
                                  <div className="mb-2 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-900">
                                      {progress}%
                                    </span>
                                  </div>

                                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                      className="h-full rounded-full bg-gray-900 transition-all"
                                      style={{
                                        width: `${Math.min(Math.max(progress, 0), 100)}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* Deadline */}
                              <td className="border-b border-gray-100 px-5 py-5 text-right">
                                <div className="mt-1 font-medium text-gray-700">
                                  {proj.end_date
                                    ? new Date(
                                      proj.end_date,
                                    ).toLocaleDateString("pt-PT", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                    : "—"}
                                </div>
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
            <section className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-6 py-4 sm:py-6">
                <h2 className="text-base font-semibold text-gray-900">
                  Próximos Prazos
                </h2>
              </div>

              <div className="px-6 py-8">
                {deadlines.length === 0 ? (
                  <EmptyState
                    icon={CalendarDays}
                    title="Sem prazos agendados"
                    description="Os prazos aparecerão aqui à medida que forem atribuídos."
                  />
                ) : (
                  <div className="space-y-4">
                    {deadlines.map((item) => (
                      <div
                        key={item.task_id}
                        className="flex gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <CalendarDays className="mt-0.5 h-4 w-4 text-gray-400 flex-shrink-0" />

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {item.title}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {item.project_id || "Sem projecto"}
                          </p>

                          <p className="mt-1 text-xs font-medium text-gray-400">
                            {item.due_date
                              ? new Date(item.due_date).toLocaleDateString("pt-PT", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                              : "Sem data"}
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
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Activity */}
            <RecentActivitiesSection activities={activities} />

            {/* Workload */}
            <TeamWorkloadSection tasks={tasks} />

            {/* Documents */}
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

function RecentActivitiesSection({ activities }: { activities: Activity[] }) {
  const router = useRouter();

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Actividades Recentes
          </h2>

          <button
            onClick={() => router.push("/management/activity")}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Ver todas
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {activities.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Sem actividade"
            description="A actividade da equipa aparecerá aqui."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => {
              // Extract initials from user_id or use default
              const initials = activity.user_id
                ? activity.user_id.substring(0, 2).toUpperCase()
                : "?";

              return (
                <div
                  key={activity.activity_id}
                  className="group flex gap-3 py-4 first:pt-0 last:pb-0"
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
                        ? new Date(activity.created_at).toLocaleDateString("pt-PT", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
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

function TeamWorkloadSection({ tasks }: { tasks: Task[] }) {
  const router = useRouter();

  // Group tasks by assignee to calculate workload
  const groupedByAssignee = tasks.reduce(
    (acc, task) => {
      const assigneeId = task.assigned_to || "unassigned";
      if (!acc[assigneeId]) {
        acc[assigneeId] = {
          assignee_id: assigneeId,
          name: "Não atribuído",
          tasks: [],
        };
      }
      acc[assigneeId].tasks.push(task);
      return acc;
    },
    {} as Record<
      string,
      { assignee_id: string; name: string; tasks: Task[] }
    >,
  );

  const workloadData = Object.values(groupedByAssignee).map((group) => {
    const total = group.tasks.length;
    const completed = group.tasks.filter(
      (t) => t.status === "Concluído" || t.status === "completed",
    ).length;
    const pending = total - completed;
    const workloadPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      assignee_id: group.assignee_id,
      name: group.name,
      total_tasks: total,
      completed_tasks: completed,
      pending_tasks: pending,
      workload_percentage: workloadPercentage,
    };
  });

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Carga da Equipa
          </h2>

          <button
            onClick={() => router.push("/management/team")}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Ver equipa
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {workloadData.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sem dados da equipa"
            description="A distribuição de trabalho aparecerá aqui."
          />
        ) : (
          <div className="space-y-5">
            {workloadData.map((member) => (
              <div key={member.assignee_id}>
                {/* Member information */}
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
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
                        {member.total_tasks === 1 ? "tarefa" : "tarefas"}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-gray-900">
                    {member.workload_percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gray-900 transition-all"
                    style={{
                      width: `${Math.min(
                        Math.max(member.workload_percentage, 0),
                        100,
                      )}%`,
                    }}
                  />
                </div>

                {/* Task status */}
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>{member.completed_tasks} concluídas</span>

                  <span>{member.pending_tasks} pendentes</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RecentDocumentsSection({ documents }: { documents: Document[] }) {
  const router = useRouter();

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-4 sm:py-6">
        <h2 className="text-base font-semibold text-gray-900">
          Documentos Recentes
        </h2>
      </div>

      <div className="px-6 py-8">
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
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.document_id}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {doc.name || doc.file_path}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
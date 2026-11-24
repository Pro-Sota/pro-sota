
"use client";

import {
  ArrowRight,
  Briefcase,
  Building2,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Inbox,
  Plus,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import CreateMeetingModal from "./calendar/components/create_meeting_modal";
import UploadDocument from "./projects/[projectId]/(details)/documents/components/upload_document";

import { Database } from "../lib/supabase/models";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];
type Document = Database["public"]["Tables"]["documents"]["Row"];
type Task = Database["public"]["Tables"]["tasks"]["Row"];
type Activity = Database["public"]["Tables"]["activity_logs"]["Row"];

interface DashboardData {
  currentUser: Profile | null;
  users: Profile[];
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
    <div className="flex min-h-[160px] flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>

      <h3 className="text-sm font-normal text-gray-900">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
        {description}
      </p>

      {action && (
        <button
          type="button"
          onClick={() => router.push(action.href)}
          className="mt-4 inline-flex items-center gap-2 text-sm text-[#002950] transition-colors hover:text-[#BD9655] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function getProjectStatus(status: string | null) {
  const statusConfig: Record<
    string,
    { label: string; className: string; dot: string }
  > = {
    active: {
      label: "Em curso",
      className: "bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    },
    "on track": {
      label: "Em curso",
      className: "bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    },
    "at risk": {
      label: "Em risco",
      className: "bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    },
    delayed: {
      label: "Atrasado",
      className: "bg-red-50 text-red-700",
      dot: "bg-red-500",
    },
    completed: {
      label: "Concluído",
      className: "bg-gray-100 text-gray-600",
      dot: "bg-gray-400",
    },
  };

  return (
    statusConfig[status?.toLowerCase() ?? ""] ?? {
      label: status || "Sem estado",
      className: "bg-gray-100 text-gray-600",
      dot: "bg-gray-400",
    }
  );
}

function isTaskCompleted(task: Task) {
  const status = task.status?.toLowerCase();

  return (
    status === "concluído" ||
    status === "concluido" ||
    status === "completed" ||
    status === "done"
  );
}

function formatDate(value: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(task: Task) {
  if (!task.due_date || isTaskCompleted(task)) return false;

  const dueDate = new Date(task.due_date);
  if (Number.isNaN(dueDate.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}

function SectionHeader({
  title,
  description,
  href,
  actionLabel = "Ver todos",
}: {
  title: string;
  description?: string;
  href?: string;
  actionLabel?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 sm:px-6">
      <div className="min-w-0">
        <h2 className="text-base font-normal text-[#002950]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs leading-5 text-gray-500">
            {description}
          </p>
        )}
      </div>

      {href && (
        <button
          type="button"
          onClick={() => router.push(href)}
          className="shrink-0 text-sm text-gray-500 transition-colors hover:text-[#BD9655] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default function Dashboard({ data }: DashboardProps) {
  const router = useRouter();

  const [isMeetingModalOpen, setIsMeetingModalOpen] =
    useState(false);

  const [isUploadModalOpen, setIsUploadModalOpen] =
    useState(false);

  const currentUser = data.currentUser;
  const projects = data.projects ?? [];
  const tasks = data.tasks ?? [];
  const deadlines = data.deadlines ?? [];
  const activities = data.activities ?? [];
  const documents = data.documents ?? [];

  const completedTasks = tasks.filter(isTaskCompleted);
  const openTasks = tasks.filter((task) => !isTaskCompleted(task));
  const overdueTasks = openTasks.filter(isOverdue);

  const firstName =
    currentUser?.first_name?.trim() ||
    currentUser?.email?.split("@")[0]?.trim() ||
    "utilizador";

  const hour = new Date().getHours();

  const greeting =
    hour >= 5 && hour < 12
      ? "Bom dia"
      : hour >= 12 && hour < 18
        ? "Boa tarde"
        : "Boa noite";

  const stats = [
    {
      title: "Os meus projectos",
      value: projects.length,
      icon: Briefcase,
      href: "/management/projects",
    },
    {
      title: "Tarefas em aberto",
      value: openTasks.length,
      icon: ClipboardList,
      href: "/management/tasks",
    },
    {
      title: "Tarefas em atraso",
      value: overdueTasks.length,
      icon: Clock,
      href: "/management/tasks",
    },
    {
      title: "Documentos recentes",
      value: documents.length,
      icon: FileText,
      href: "/management/documents",
    },
  ];

  const quickActions = [
    {
      label: "Nova tarefa",
      icon: Plus,
      onClick: () => router.push("/management/tasks"),
      primary: true,
    },
    {
      label: "Carregar documento",
      icon: Upload,
      onClick: () => setIsUploadModalOpen(true),
      primary: false,
    },
    {
      label: "Agendar reunião",
      icon: CalendarPlus,
      onClick: () => setIsMeetingModalOpen(true),
      primary: false,
    },
    {
      label: "Ver calendário",
      icon: CalendarDays,
      onClick: () => router.push("/management/calendar"),
      primary: false,
    },
  ];

  function handleProjectClick(projectId: string) {
    router.push(`/management/projects/${projectId}`);
  }

  function handleTaskClick(task: Task) {
    if (task.project_id) {
      router.push(
        `/management/projects/${task.project_id}/tasks`,
      );
      return;
    }

    router.push("/management/tasks");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F7F5]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="min-w-0 space-y-7">

          {/* Header */}
          <header className="border-b border-gray-200 pb-6">
            <div className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.16em] text-[#BD9655]">
                Espaço de trabalho pessoal
              </p>

              <h1 className="text-2xl font-normal tracking-tight text-[#002950] sm:text-3xl">
                {greeting}, {firstName}
              </h1>

              <p className="max-w-2xl text-sm leading-6 text-gray-500">
                Acompanhe as suas tarefas, projectos e compromissos.
              </p>
            </div>
          </header>

          {/* Quick actions */}
          <section>
            <div className="mb-3">
              <h2 className="text-sm font-normal text-[#002950]">
                Acesso rápido
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className={`group flex min-h-[82px] flex-col items-start justify-between rounded-lg px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2 sm:min-h-[92px] sm:px-5 ${
                    action.primary
                      ? "bg-[#002950] text-white hover:bg-[#003B70]"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-[#BD9655]/50 hover:bg-gray-50"
                  }`}
                >
                  <action.icon
                    className={`h-5 w-5 ${
                      action.primary
                        ? "text-[#BD9655]"
                        : "text-[#002950]"
                    }`}
                  />

                  <span className="text-xs sm:text-sm">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Personal overview */}
          <section>
            <div className="mb-3">
              <h2 className="text-sm font-normal text-[#002950]">
                Visão geral
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Resumo da sua actividade actual.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="group min-w-0 rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:border-[#BD9655]/50 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 text-xs leading-5 text-gray-500 sm:text-sm">
                      {item.title}
                    </p>

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#BD9655]/10 text-[#BD9655]">
                      <item.icon className="h-4 w-4" />
                    </span>
                  </div>

                  <p className="mt-3 text-2xl font-normal tabular-nums text-[#002950] sm:text-3xl">
                    {item.value}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Personal work */}
          <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <SectionHeader
              title="O meu trabalho"
              description="Tarefas que estão sob a sua responsabilidade."
              href="/management/tasks"
            />

            <div className="grid divide-y divide-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">
                      Em aberto
                    </p>
                    <p className="mt-1 text-2xl font-normal tabular-nums text-[#002950]">
                      {openTasks.length}
                    </p>
                  </div>

                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#002950]/5 text-[#002950]">
                    <ClipboardList className="h-4 w-4" />
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">
                      Concluídas
                    </p>
                    <p className="mt-1 text-2xl font-normal tabular-nums text-[#002950]">
                      {completedTasks.length}
                    </p>
                  </div>

                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">
                      Em atraso
                    </p>
                    <p className="mt-1 text-2xl font-normal tabular-nums text-[#002950]">
                      {overdueTasks.length}
                    </p>
                  </div>

                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <Clock className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-normal text-[#002950]">
                  Tarefas por acompanhar
                </h3>

                <span className="text-xs text-gray-400">
                  {openTasks.length} pendentes
                </span>
              </div>

              {openTasks.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Está tudo em dia"
                  description="Não tem tarefas pendentes neste momento."
                />
              ) : (
                <div className="divide-y divide-gray-100">
                  {openTasks.slice(0, 5).map((task) => {
                    const overdue = isOverdue(task);

                    return (
                      <button
                        key={task.task_id}
                        type="button"
                        onClick={() => handleTaskClick(task)}
                        className="group flex w-full min-w-0 items-center gap-3 rounded-md px-2 py-3 text-left transition-colors hover:bg-gray-50"
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            overdue
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {overdue ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <ClipboardList className="h-4 w-4" />
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-gray-800">
                            {task.title}
                          </span>

                          <span className="mt-1 block truncate text-xs text-gray-400">
                            {task.project_id || "Tarefa independente"}
                          </span>
                        </span>

                        <span className="hidden shrink-0 text-right sm:block">
                          <span
                            className={`block text-xs ${
                              overdue
                                ? "text-amber-700"
                                : "text-gray-500"
                            }`}
                          >
                            {overdue ? "Em atraso" : "Prazo"}
                          </span>

                          <span className="mt-1 block text-xs text-gray-400">
                            {formatDate(task.due_date) || "Sem data"}
                          </span>
                        </span>

                        <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#BD9655]" />
                      </button>
                    );
                  })}
                </div>
              )}

              {openTasks.length > 5 && (
                <button
                  type="button"
                  onClick={() => router.push("/management/tasks")}
                  className="mt-3 text-sm text-[#002950] transition-colors hover:text-[#BD9655]"
                >
                  Ver todas as tarefas
                  <ArrowRight className="ml-1 inline h-4 w-4" />
                </button>
              )}
            </div>
          </section>

          {/* Projects and deadlines */}
          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">

            {/* My projects */}
            <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <SectionHeader
                title="Os meus projectos"
                description="Projectos em que participa actualmente."
                href="/management/projects"
              />

              <div className="p-4 sm:p-5">
                {projects.length === 0 ? (
                  <EmptyState
                    icon={Briefcase}
                    title="Ainda não participa em projectos"
                    description="Os projectos que lhe forem atribuídos aparecerão aqui."
                  />
                ) : (
                  <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
                    {projects.map((project) => {
                      const config = getProjectStatus(project.status);

                      return (
                        <button
                          key={project.project_id}
                          type="button"
                          onClick={() =>
                            handleProjectClick(project.project_id)
                          }
                          className="group w-full rounded-lg border border-gray-100 p-4 text-left transition-colors hover:border-[#BD9655]/40 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                        >
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#002950]/5 text-[#002950]">
                              <Building2 className="h-4 w-4" />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm text-gray-800">
                                {project.title}
                              </span>

                              <span className="mt-1 block truncate text-xs text-gray-400">
                                {project.project_code || "Projecto"}
                                {project.address_line_1 &&
                                  ` · ${project.address_line_1}`}
                              </span>
                            </span>

                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#BD9655]" />
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs ${config.className}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                              />
                              {config.label}
                            </span>

                            <span className="text-xs text-gray-400">
                              {formatDate(project.end_date) ||
                                "Sem prazo definido"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Deadlines */}
            <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
              <SectionHeader
                title="Próximos prazos"
                description="Datas que deve acompanhar."
                href="/management/tasks"
              />

              <div className="p-4 sm:p-5">
                {deadlines.length === 0 ? (
                  <EmptyState
                    icon={CalendarDays}
                    title="Sem prazos próximos"
                    description="Os seus próximos prazos aparecerão aqui."
                  />
                ) : (
                  <div className="max-h-[430px] space-y-1 overflow-y-auto pr-1">
                    {deadlines.map((task) => (
                      <button
                        key={task.task_id}
                        type="button"
                        onClick={() => handleTaskClick(task)}
                        className="group flex w-full min-w-0 gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#BD9655]/10 text-[#BD9655]">
                          <CalendarDays className="h-4 w-4" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-gray-800">
                            {task.title}
                          </span>

                          <span className="mt-1 block truncate text-xs text-gray-400">
                            {task.project_id || "Tarefa independente"}
                          </span>

                          <span className="mt-2 block text-xs text-gray-500">
                            {formatDate(task.due_date) || "Sem data"}
                          </span>
                        </span>

                        <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#BD9655]" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Activity and documents */}
          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <RecentActivitiesSection activities={activities} />
            <RecentDocumentsSection documents={documents} />
          </div>
        </div>
      </div>

      {/* Upload document */}
      {isUploadModalOpen && (
        <UploadDocument
          projects={projects.map((project) => ({
            project_id: project.project_id,
            project_name: project.title,
          }))}
          open={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}

      {/* Meeting */}
      <CreateMeetingModal
        open={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        participants={data.users}
        clients={[]}
        suppliers={[]}
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
      <SectionHeader
        title="A minha actividade"
        description="Registo das suas actividades recentes."
        href="/management/activity"
        actionLabel="Ver todas"
      />

      <div className="p-4 sm:p-5">
        {activities.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Sem actividade recente"
            description="As suas actividades aparecerão aqui."
          />
        ) : (
          <div className="max-h-[360px] divide-y divide-gray-100 overflow-y-auto pr-1">
            {activities.map((activity) => (
              <div
                key={activity.activity_id}
                className="flex min-w-0 gap-3 py-4 first:pt-0 last:pb-0"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#002950]/5 text-xs text-[#002950]">
                  <Clock className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm leading-5 text-gray-800">
                    {activity.description}
                  </p>

                  {activity.project_id && (
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/management/projects/${activity.project_id}`,
                        )
                      }
                      className="mt-1 truncate text-left text-xs text-gray-500 transition-colors hover:text-[#BD9655]"
                    >
                      {activity.project_id}
                    </button>
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
      <SectionHeader
        title="Documentos recentes"
        description="Documentos disponíveis no seu espaço de trabalho."
        href="/management/documents"
      />

      <div className="p-4 sm:p-5">
        {documents.length === 0 ? (
          <EmptyState
            icon={Upload}
            title="Sem documentos recentes"
            description="Os documentos disponíveis aparecerão aqui."
            action={{
              label: "Ver documentos",
              href: "/management/documents",
            }}
          />
        ) : (
          <div className="max-h-[360px] space-y-1 overflow-y-auto pr-1">
            {documents.map((doc) => (
              <button
                key={doc.document_id}
                type="button"
                onClick={() => {
                  if (doc.project_id) {
                    router.push(
                      `/management/projects/${doc.project_id}/documents`,
                    );
                  } else {
                    router.push("/management/documents");
                  }
                }}
                className="group flex w-full min-w-0 items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#002950]/5 text-[#002950]">
                  <FileText className="h-5 w-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-gray-800">
                    {doc.name || doc.file_path}
                  </span>

                  <span className="mt-1 block truncate text-xs text-gray-400">
                    {doc.project_id || "Documento geral"}
                  </span>

                  <span className="mt-1 block text-xs text-gray-400">
                    {doc.created_at
                      ? new Date(doc.created_at).toLocaleDateString(
                          "pt-PT",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : ""}
                  </span>
                </span>

                <ArrowRight className="hidden h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#BD9655] sm:block" />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

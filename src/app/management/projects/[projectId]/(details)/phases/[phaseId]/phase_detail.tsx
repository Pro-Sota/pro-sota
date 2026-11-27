
"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock3,
  Edit2,
  Flag,
  Layers3,
  ListTodo,
} from "lucide-react";

import { ProgressBar } from "../ProgressBar";
import { Database } from "@/app/lib/supabase/models";

type Phase = Database["public"]["Tables"]["project_phases"]["Row"];
type PhaseStage = Database["public"]["Tables"]["phase_stages"]["Row"];

type PhaseTask = {
  task_id: string;
  phase_id: string;
  stage_id: string | null;
  title: string;
  description: string | null;
  start_date: string | null;
  due_date: string | null;
  review_status: string | null;
  completed: boolean;
  position: number | null;
};

export type PhaseMilestone = {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  date?: string | null;
  completed_at?: string | null;
  stage_id?: string | null;
};

type Project = {
  project_id: string;
  title: string;
  project_code: string | null;
};

type Props = {
  phase: Phase;
  project: Project;
  stages?: PhaseStage[];
  tasks?: PhaseTask[];
  milestones?: PhaseMilestone[];
};

/* -------------------------------------------------------------------------- */
/* Status configuration                                                      */
/* -------------------------------------------------------------------------- */

const PHASE_STATUS: Record<
  string,
  { label: string; className: string }
> = {
  not_started: {
    label: "Por iniciar",
    className: "border-gray-200 bg-gray-50 text-gray-600",
  },
  in_progress: {
    label: "Em curso",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  completed: {
    label: "Concluída",
    className: "border-green-200 bg-green-50 text-green-700",
  },
};

const TASK_STATUS: Record<
  string,
  { label: string; className: string }
> = {
  not_submitted: {
    label: "Não submetida",
    className: "border-gray-200 bg-gray-50 text-gray-600",
  },
  in_review: {
    label: "Em revisão",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  changes_requested: {
    label: "Alterações solicitadas",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  approved: {
    label: "Aprovada",
    className: "border-green-200 bg-green-50 text-green-700",
  },
};

const MILESTONE_STATUS: Record<
  string,
  { label: string; className: string }
> = {
  upcoming: {
    label: "Próximo",
    className: "border-gray-200 bg-gray-50 text-gray-600",
  },
  in_progress: {
    label: "Em curso",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  completed: {
    label: "Concluído",
    className: "border-green-200 bg-green-50 text-green-700",
  },
  missed: {
    label: "Não alcançado",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  cancelled: {
    label: "Cancelado",
    className: "border-gray-200 bg-gray-50 text-gray-500",
  },
};

/* -------------------------------------------------------------------------- */
/* Date helpers                                                               */
/* -------------------------------------------------------------------------- */

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const date = new Date(
    value.includes("T") ? value : `${value}T12:00:00`
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string | null | undefined): string {
  const date = parseDate(value);

  if (!date) return "—";

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function differenceInDays(
  start: string | null | undefined,
  end: string | null | undefined
): number | null {
  if (!start || !end) return null;

  const startDate = parseDate(start);
  const endDate = parseDate(end);

  if (!startDate || !endDate) return null;

  const startUtc = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );

  const endUtc = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );

  return Math.max(
    0,
    Math.round((endUtc - startUtc) / 86400000)
  );
}

function getTodayDate(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getScheduleStatus(phase: Phase) {
  const today = getTodayDate();

  const plannedEnd = phase.planned_end;
  const actualEnd = phase.actual_end;

  if (phase.status === "completed") {
    if (plannedEnd && actualEnd && actualEnd > plannedEnd) {
      const daysLate = differenceInDays(plannedEnd, actualEnd);

      return {
        label: "Concluída com atraso",
        detail:
          daysLate === 1
            ? "1 dia de atraso"
            : `${daysLate ?? 0} dias de atraso`,
        className: "border-red-200 bg-red-50 text-red-700",
      };
    }

    return {
      label: "Concluída no prazo",
      detail: "Dentro do planeamento",
      className: "border-green-200 bg-green-50 text-green-700",
    };
  }

  if (phase.status === "not_started") {
    if (phase.planned_start && phase.planned_start < today) {
      const daysLate = differenceInDays(phase.planned_start, today);

      return {
        label: "Início em atraso",
        detail:
          daysLate === 1
            ? "1 dia desde a data prevista"
            : `${daysLate ?? 0} dias desde a data prevista`,
        className: "border-red-200 bg-red-50 text-red-700",
      };
    }

    return {
      label: "Dentro do prazo",
      detail: "A aguardar início",
      className: "border-gray-200 bg-gray-50 text-gray-600",
    };
  }

  if (
    phase.status === "in_progress" &&
    plannedEnd &&
    today > plannedEnd
  ) {
    const daysLate = differenceInDays(plannedEnd, today);

    return {
      label: "Em atraso",
      detail:
        daysLate === 1
          ? "1 dia de atraso"
          : `${daysLate ?? 0} dias de atraso`,
      className: "border-red-200 bg-red-50 text-red-700",
    };
  }

  return {
    label: "Dentro do prazo",
    detail: "De acordo com o planeamento",
    className: "border-green-200 bg-green-50 text-green-700",
  };
}

/* -------------------------------------------------------------------------- */
/* Progress                                                                   */
/* -------------------------------------------------------------------------- */

function getApprovedProgress(tasks: PhaseTask[]): number {
  if (tasks.length === 0) return 0;

  const approvedTasks = tasks.filter(
    (task) => task.review_status === "approved"
  ).length;

  return Math.round((approvedTasks / tasks.length) * 100);
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function PhaseDetailPage({
  phase,
  stages = [],
  tasks = [],
  milestones = [],
  project,
}: Props) {
  const router = useRouter();

  const phaseStatus =
    PHASE_STATUS[phase.status] ?? PHASE_STATUS.not_started;

  const progress = getApprovedProgress(tasks);
  const scheduleStatus = getScheduleStatus(phase);

  const plannedDuration = differenceInDays(
    phase.planned_start,
    phase.planned_end
  );

  const elapsedDuration = phase.actual_start
    ? differenceInDays(
        phase.actual_start,
        phase.actual_end ?? getTodayDate()
      )
    : null;

  const orderedStages = [...stages].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  const unassignedTasks = tasks
    .filter((task) => !task.stage_id)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const unassignedMilestones = milestones.filter(
    (milestone) => !milestone.stage_id
  );

  const completedTasks = tasks.filter(
    (task) => task.review_status === "approved"
  ).length;

  const completedMilestones = milestones.filter(
    (milestone) =>
      milestone.status === "completed" ||
      Boolean(milestone.completed_at)
  ).length;

  return (
    <div className="min-h-full">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex w-fit items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar às fases
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/management/projects/${project.project_id}/phases/${phase.phase_id}/edit`
              )
            }
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            <Edit2 className="h-4 w-4" />
            Editar fase
          </button>
        </div>

        {/* Phase overview */}

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gradient-to-r from-[#F8F5EF] to-white px-5 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    {phase.name}
                  </h1>

                  <StatusBadge
                    label={phaseStatus.label}
                    className={phaseStatus.className}
                  />
                </div>

                {phase.description && (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                    {phase.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
                    <span>
                      {formatDate(phase.planned_start)}
                      <span className="mx-2 text-gray-300">—</span>
                      {formatDate(phase.planned_end)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Layers3 className="h-4 w-4 shrink-0 text-gray-400" />
                    <span>
                      {stages.length} {stages.length === 1 ? "etapa" : "etapas"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 sm:min-w-32 sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Progresso geral
                </p>

                <p className="mt-1 font-mono text-4xl font-bold tabular-nums text-gray-900">
                  {progress}%
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {completedTasks} de {tasks.length} tarefas aprovadas
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 sm:px-8">
            <ProgressBar percent={progress} />
          </div>
        </section>

        {/* Schedule */}

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-[#BD9655]" />

              <div>
                <h2 className="font-semibold text-gray-900">
                  Planeamento e execução
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Datas previstas e reais da fase.
                </p>
              </div>
            </div>

            <StatusBadge
              label={scheduleStatus.label}
              className={scheduleStatus.className}
            />
          </div>

          <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div className="space-y-4 p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Planeamento
              </h3>

              <DateRow
                label="Início previsto"
                value={formatDate(phase.planned_start)}
              />

              <DateRow
                label="Conclusão prevista"
                value={formatDate(phase.planned_end)}
              />

              <DateRow
                label="Duração prevista"
                value={formatDuration(plannedDuration)}
              />
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Execução
              </h3>

              <DateRow
                label="Início real"
                value={formatDate(phase.actual_start)}
              />

              <DateRow
                label="Conclusão real"
                value={formatDate(phase.actual_end)}
              />

              <DateRow
                label={phase.actual_end ? "Duração real" : "Duração decorrida"}
                value={formatDuration(elapsedDuration)}
              />
            </div>
          </div>
        </section>

        {/* Stages */}

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-[#BD9655]" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Etapas da fase
                </h2>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Acompanhe as tarefas e os marcos de cada etapa.
              </p>
            </div>

            <p className="text-sm text-gray-500">
              {stages.length} {stages.length === 1 ? "etapa" : "etapas"}
            </p>
          </div>

          {orderedStages.length > 0 ? (
            <div className="space-y-4">
              {orderedStages.map((stage, index) => {
                const stageTasks = tasks
                  .filter((task) => task.stage_id === stage.stage_id)
                  .sort(
                    (a, b) => (a.position ?? 0) - (b.position ?? 0)
                  );

                const stageMilestones = milestones.filter(
                  (milestone) => milestone.stage_id === stage.stage_id
                );

                const stageProgress = getApprovedProgress(stageTasks);

                const approvedStageTasks = stageTasks.filter(
                  (task) => task.review_status === "approved"
                ).length;

                return (
                  <article
                    key={stage.stage_id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                  >
                    <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F5EF] text-sm font-semibold text-[#8B6A2F]">
                            {index + 1}
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900">
                              {stage.name}
                            </h3>

                            {stage.description && (
                              <p className="mt-1 text-sm leading-5 text-gray-500">
                                {stage.description}
                              </p>
                            )}

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                              <span>
                                {stageTasks.length}{" "}
                                {stageTasks.length === 1 ? "tarefa" : "tarefas"}
                              </span>
                              <span>
                                {stageMilestones.length}{" "}
                                {stageMilestones.length === 1 ? "marco" : "marcos"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 sm:min-w-24 sm:text-right">
                          <p className="font-mono text-2xl font-bold tabular-nums text-gray-900">
                            {stageProgress}%
                          </p>
                          <p className="text-xs text-gray-500">
                            {approvedStageTasks}/{stageTasks.length} aprovadas
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <ProgressBar percent={stageProgress} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 divide-y divide-gray-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                      {/* Stage tasks */}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                          <ListTodo className="h-4 w-4 text-gray-400" />
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                            Tarefas
                          </h4>
                          <span className="text-xs text-gray-400">
                            ({stageTasks.length})
                          </span>
                        </div>

                        {stageTasks.length > 0 ? (
                          <div className="divide-y divide-gray-100">
                            {stageTasks.map((task) => (
                              <TaskRow key={task.task_id} task={task} />
                            ))}
                          </div>
                        ) : (
                          <EmptyMessage>
                            Ainda não existem tarefas nesta etapa.
                          </EmptyMessage>
                        )}
                      </div>

                      {/* Stage milestones */}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                          <Flag className="h-4 w-4 text-[#BD9655]" />
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                            Marcos
                          </h4>
                          <span className="text-xs text-gray-400">
                            ({stageMilestones.length})
                          </span>
                        </div>

                        {stageMilestones.length > 0 ? (
                          <div className="divide-y divide-gray-100">
                            {stageMilestones.map((milestone) => (
                              <MilestoneRow
                                key={milestone.id}
                                milestone={milestone}
                              />
                            ))}
                          </div>
                        ) : (
                          <EmptyMessage>
                            Ainda não existem marcos nesta etapa.
                          </EmptyMessage>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
              <Layers3 className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-700">
                Ainda não existem etapas
              </p>
              <p className="mt-1 text-sm text-gray-500">
                As etapas desta fase serão apresentadas aqui.
              </p>
            </div>
          )}
        </section>

        {/* Unassigned tasks and milestones */}

        {(unassignedTasks.length > 0 ||
          unassignedMilestones.length > 0) && (
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
              <h2 className="font-semibold text-gray-900">
                Elementos sem etapa associada
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Tarefas e marcos directamente associados à fase.
              </p>
            </div>

            <div className="grid grid-cols-1 divide-y divide-gray-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
              {unassignedTasks.length > 0 && (
                <div className="min-w-0">
                  <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                    <ListTodo className="h-4 w-4 text-gray-400" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Tarefas
                    </h3>
                    <span className="text-xs text-gray-400">
                      ({unassignedTasks.length})
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {unassignedTasks.map((task) => (
                      <TaskRow key={task.task_id} task={task} />
                    ))}
                  </div>
                </div>
              )}

              {unassignedMilestones.length > 0 && (
                <div className="min-w-0">
                  <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                    <Flag className="h-4 w-4 text-[#BD9655]" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Marcos
                    </h3>
                    <span className="text-xs text-gray-400">
                      ({unassignedMilestones.length})
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {unassignedMilestones.map((milestone) => (
                      <MilestoneRow
                        key={milestone.id}
                        milestone={milestone}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Phase information */}

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-gray-900">
              Informação da fase
            </h2>
          </div>

          <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <InfoRow
              label="Criada em"
              value={formatDateTime(phase.created_at)}
            />
            <InfoRow
              label="Última actualização"
              value={formatDateTime(phase.updated_at)}
            />
            <InfoRow
              label="Tarefas aprovadas"
              value={`${completedTasks} de ${tasks.length}`}
            />
            <InfoRow
              label="Marcos alcançados"
              value={`${completedMilestones} de ${milestones.length}`}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable components                                                        */
/* -------------------------------------------------------------------------- */

function StatusBadge({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}

function TaskRow({ task }: { task: PhaseTask }) {
  const status =
    TASK_STATUS[task.review_status ?? "not_submitted"] ??
    TASK_STATUS.not_submitted;

  const isApproved = task.review_status === "approved";

  return (
    <div className="flex items-start justify-between gap-3 px-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        {isApproved ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
        ) : (
          <ListTodo className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
        )}

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {task.title}
          </p>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
              {task.description}
            </p>
          )}

          {task.due_date && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              Prazo: {formatDate(task.due_date)}
            </p>
          )}
        </div>
      </div>

      <StatusBadge
        label={status.label}
        className={status.className}
      />
    </div>
  );
}

function MilestoneRow({
  milestone,
}: {
  milestone: PhaseMilestone;
}) {
  const normalizedStatus =
    milestone.completed_at ? "completed" : milestone.status ?? "upcoming";

  const status =
    MILESTONE_STATUS[normalizedStatus] ??
    MILESTONE_STATUS.upcoming;

  const isCompleted = normalizedStatus === "completed";

  return (
    <div className="flex items-start justify-between gap-3 px-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <Flag
          className={`mt-0.5 h-4 w-4 shrink-0 ${
            isCompleted ? "text-green-600" : "text-[#BD9655]"
          }`}
        />

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {milestone.title}
          </p>

          {milestone.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
              {milestone.description}
            </p>
          )}

          {milestone.date && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(milestone.date)}
            </p>
          )}
        </div>
      </div>

      <StatusBadge
        label={status.label}
        className={status.className}
      />
    </div>
  );
}

function DateRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-7 text-center">
      <p className="text-sm text-gray-400">{children}</p>
    </div>
  );
}

function formatDuration(days: number | null): string {
  if (days === null) return "—";

  return `${days} ${days === 1 ? "dia" : "dias"}`;
}

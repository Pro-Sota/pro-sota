"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock3,
  Edit2,
  Flag,
  PackageCheck,
  Timer,
  Trash2,
} from "lucide-react";

import { ProgressBar } from "../ProgressBar";
import { Database } from "@/app/lib/supabase/models";

type Phase =
  Database["public"]["Tables"]["project_phases"]["Row"];

/* -------------------------------------------------------------------------- */
/* Related data                                                               */
/* -------------------------------------------------------------------------- */

export type PhaseMilestone = {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  date?: string | null;
  completed_at?: string | null;
};

export type PhaseDeliverable = {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  due_date?: string | null;
  progress?: number | null;
};

type Project = {
  project_id: string;
  title: string;
  project_code: string | null;
};

/* -------------------------------------------------------------------------- */
/* Props                                                                      */
/* -------------------------------------------------------------------------- */

type Props = {
  phase: Phase;
  project: Project;
  milestones?: PhaseMilestone[];
  deliverables?: PhaseDeliverable[];
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG = {
  not_started: {
    label: "Por iniciar",
    className: "bg-gray-50 text-gray-600 border-gray-200",
  },
  in_progress: {
    label: "Em curso",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  completed: {
    label: "Concluída",
    className: "bg-green-50 text-green-700 border-green-200",
  },
} as const;

const RELATED_STATUS_LABELS: Record<string, string> = {
  not_started: "Por iniciar",
  upcoming: "Próximo",
  in_progress: "Em curso",
  completed: "Concluído",
  missed: "Em falta",
  on_hold: "Em espera",
  cancelled: "Cancelado",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function parseDate(value: string | null) {
  if (!value) return null;

  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string | null) {
  const date = parseDate(value);

  if (!date) return "—";

  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string | null) {
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
  start: string | null,
  end: string | null
) {
  const startDate = parseDate(start);
  const endDate = parseDate(end);

  if (!startDate || !endDate) return null;

  const difference =
    endDate.getTime() - startDate.getTime();

  return Math.max(
    0,
    Math.round(difference / (1000 * 60 * 60 * 24))
  );
}

function differenceFromToday(start: string | null) {
  const startDate = parseDate(start);

  if (!startDate) return null;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const difference =
    today.getTime() - startDate.getTime();

  return Math.max(
    0,
    Math.round(difference / (1000 * 60 * 60 * 24))
  );
}

function getScheduleStatus(phase: Phase) {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const plannedEnd = parseDate(phase.planned_end);
  const actualEnd = parseDate(phase.actual_end);

  if (phase.status === "completed") {
    if (
      plannedEnd &&
      actualEnd &&
      actualEnd.getTime() > plannedEnd.getTime()
    ) {
      const daysLate = differenceInDays(
        phase.planned_end,
        phase.actual_end
      );

      return {
        label: "Concluída com atraso",
        detail:
          daysLate === 1
            ? "1 dia de atraso"
            : `${daysLate ?? 0} dias de atraso`,
        className:
          "bg-red-50 text-red-700 border-red-200",
      };
    }

    return {
      label: "Concluída no prazo",
      detail: "Dentro do planeamento",
      className:
        "bg-green-50 text-green-700 border-green-200",
    };
  }

  if (phase.status === "not_started") {
    const plannedStart = parseDate(phase.planned_start);

    if (
      plannedStart &&
      plannedStart.getTime() < today.getTime()
    ) {
      return {
        label: "Início em atraso",
        detail: "A fase ainda não foi iniciada",
        className:
          "bg-red-50 text-red-700 border-red-200",
      };
    }

    return {
      label: "Dentro do prazo",
      detail: "A aguardar início",
      className:
        "bg-gray-50 text-gray-600 border-gray-200",
    };
  }

  if (
    phase.status === "in_progress" &&
    plannedEnd &&
    today.getTime() > plannedEnd.getTime()
  ) {
    const daysLate = differenceInDays(
      phase.planned_end,
      new Date().toISOString().split("T")[0]
    );

    return {
      label: "Em atraso",
      detail:
        daysLate === 1
          ? "1 dia de atraso"
          : `${daysLate ?? 0} dias de atraso`,
      className:
        "bg-red-50 text-red-700 border-red-200",
    };
  }

  return {
    label: "Dentro do prazo",
    detail: "De acordo com o planeamento",
    className:
      "bg-green-50 text-green-700 border-green-200",
  };
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function PhaseDetailPage({
  phase,
  milestones = [],
  deliverables = [],
  project,
}: Props) {
  const router = useRouter();

  const status =
    STATUS_CONFIG[
    phase.status as keyof typeof STATUS_CONFIG
    ] ?? STATUS_CONFIG.not_started;

  const progress = Math.min(
    100,
    Math.max(0, Number(phase.progress ?? 0))
  );

  const scheduleStatus = useMemo(
    () => getScheduleStatus(phase),
    [phase]
  );

  const plannedDuration = useMemo(
    () =>
      differenceInDays(
        phase.planned_start,
        phase.planned_end
      ),
    [phase.planned_start, phase.planned_end]
  );

  const elapsedDuration = useMemo(() => {
    if (!phase.actual_start) return null;

    if (phase.actual_end) {
      return differenceInDays(
        phase.actual_start,
        phase.actual_end
      );
    }

    return differenceFromToday(phase.actual_start);
  }, [phase.actual_start, phase.actual_end]);

  const completedMilestones = milestones.filter(
    (milestone) =>
      milestone.status === "completed" ||
      Boolean(milestone.completed_at)
  ).length;

  const completedDeliverables = deliverables.filter(
    (deliverable) =>
      deliverable.status === "completed"
  ).length;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex w-fit cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/management/projects/${project.project_id}/phases/${phase.phase_id}/edit`
                )
              }
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </button>

            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Phase Overview                                                   */}
        {/* ---------------------------------------------------------------- */}

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b bg-gradient-to-r from-[#F8F5EF] to-white px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {phase.name}
                  </h1>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                {phase.description && (
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                    {phase.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />

                    <span>
                      Previsto:{" "}
                      <span className="font-medium text-gray-700">
                        {formatDate(phase.planned_start)}
                      </span>{" "}
                      até{" "}
                      <span className="font-medium text-gray-700">
                        {formatDate(phase.planned_end)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 sm:text-right">
                <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                  Progresso
                </p>

                <p className="font-mono text-4xl font-bold tabular-nums text-gray-900">
                  {progress}%
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Barra de progresso
                </label>

                <span className="font-mono text-sm font-semibold text-gray-900">
                  {progress}%
                </span>
              </div>

              <ProgressBar percent={progress} />
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Schedule Health                                                  */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-[#BD9655]" />

              <div>
                <h2 className="font-semibold text-gray-900">
                  Estado do prazo
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Comparação entre o planeamento e a execução.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {scheduleStatus.label}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {scheduleStatus.detail}
                </p>
              </div>

              <span
                className={`w-fit rounded-full border px-3 py-1.5 text-xs font-medium ${scheduleStatus.className}`}
              >
                {scheduleStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Schedule                                                         */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-6">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Planeamento e execução
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-900">
                  Planeamento
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Datas previstas para a fase.
                </p>
              </div>

              <div className="space-y-4">
                <DateRow
                  label="Início previsto"
                  value={formatDate(phase.planned_start)}
                />

                <DateRow
                  label="Conclusão prevista"
                  value={formatDate(phase.planned_end)}
                />

                <div className="border-t border-gray-100 pt-4">
                  <DateRow
                    label="Duração prevista"
                    value={
                      plannedDuration === null
                        ? "—"
                        : `${plannedDuration} ${plannedDuration === 1
                          ? "dia"
                          : "dias"
                        }`
                    }
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-900">
                  Execução
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Datas reais da execução da fase.
                </p>
              </div>

              <div className="space-y-4">
                <DateRow
                  label="Início real"
                  value={formatDate(phase.actual_start)}
                />

                <DateRow
                  label="Conclusão real"
                  value={formatDate(phase.actual_end)}
                />

                <div className="border-t border-gray-100 pt-4">
                  <DateRow
                    label={
                      phase.actual_end
                        ? "Duração real"
                        : "Duração decorrida"
                    }
                    value={
                      elapsedDuration === null
                        ? "—"
                        : `${elapsedDuration} ${elapsedDuration === 1
                          ? "dia"
                          : "dias"
                        }`
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Phase Contents                                                   */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-8">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Conteúdo da fase
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Elementos associados à execução desta fase.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <RelatedSection
              icon={<Flag className="h-5 w-5" />}
              title="Marcos"
              description="Pontos de controlo importantes da fase."
              count={milestones.length}
              completed={completedMilestones}
              emptyMessage="Ainda não existem marcos nesta fase."
            >
              {milestones.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {milestones.map((milestone) => (
                    <RelatedItem
                      key={milestone.id}
                      title={milestone.title}
                      status={milestone.status}
                      date={milestone.date}
                    />
                  ))}
                </div>
              )}
            </RelatedSection>

            <RelatedSection
              icon={<PackageCheck className="h-5 w-5" />}
              title="Entregas"
              description="Resultados e entregáveis previstos."
              count={deliverables.length}
              completed={completedDeliverables}
              emptyMessage="Ainda não existem entregas nesta fase."
            >
              {deliverables.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {deliverables.map((deliverable) => (
                    <RelatedItem
                      key={deliverable.id}
                      title={deliverable.title}
                      status={deliverable.status}
                      date={deliverable.due_date}
                    />
                  ))}
                </div>
              )}
            </RelatedSection>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Performance Metrics                                              */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-8">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Desempenho
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard
              icon={<Timer className="h-5 w-5" />}
              label="Duração prevista"
              value={
                plannedDuration === null
                  ? "—"
                  : `${plannedDuration} dias`
              }
            />

            <MetricCard
              icon={<Clock3 className="h-5 w-5" />}
              label={
                phase.actual_end
                  ? "Duração real"
                  : "Duração decorrida"
              }
              value={
                elapsedDuration === null
                  ? "—"
                  : `${elapsedDuration} dias`
              }
            />

            <MetricCard
              icon={<Calendar className="h-5 w-5" />}
              label="Ordem da fase"
              value={
                phase.sort_order === null
                  ? "—"
                  : String(phase.sort_order)
              }
            />
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Additional Information                                           */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-6">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Informações da fase
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <InfoRow
                label="Estado"
                value={status.label}
              />

              <InfoRow
                label="Progresso"
                value={`${progress}%`}
              />

              <InfoRow
                label="Criada em"
                value={formatDateTime(phase.created_at)}
              />

              <InfoRow
                label="Última actualização"
                value={formatDateTime(phase.updated_at)}
              />
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Project Context                                                  */}
        {/* ---------------------------------------------------------------- */}

        <div className="mt-6">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Contexto
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <InfoRow
              label="Projecto"
              value={project.title}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Related Section                                                            */
/* -------------------------------------------------------------------------- */

function RelatedSection({
  icon,
  title,
  description,
  count,
  completed,
  emptyMessage,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  completed?: number;
  emptyMessage: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F5EF] text-[#BD9655]">
              {icon}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                {description}
              </p>
            </div>
          </div>

          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            {count}
          </span>
        </div>

        {completed !== undefined && count > 0 && (
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Concluídos
            </span>

            <span className="font-medium text-gray-700">
              {completed} de {count}
            </span>
          </div>
        )}
      </div>

      {count > 0 ? (
        children
      ) : (
        <div className="flex min-h-28 items-center justify-center px-5 py-6 text-center">
          <p className="max-w-xs text-sm text-gray-400">
            {emptyMessage}
          </p>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Related Item                                                               */
/* -------------------------------------------------------------------------- */

function RelatedItem({
  title,
  status,
  date,
}: {
  title: string;
  status?: string | null;
  date?: string | null;
}) {
  const normalizedStatus = status?.toLowerCase();

  const isCompleted =
    normalizedStatus === "completed" ||
    normalizedStatus === "complete";

  const statusLabel = normalizedStatus
    ? RELATED_STATUS_LABELS[normalizedStatus] ?? status
    : null;

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">
          {title}
        </p>

        {date && (
          <p className="mt-1 text-xs text-gray-400">
            {formatDate(date)}
          </p>
        )}
      </div>

      {statusLabel && (
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${isCompleted
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-gray-200 bg-gray-50 text-gray-600"
            }`}
        >
          {statusLabel}
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Date Row                                                                   */
/* -------------------------------------------------------------------------- */

function DateRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Metric Card                                                                */
/* -------------------------------------------------------------------------- */

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8F5EF] text-[#BD9655]">
        {icon}
      </div>

      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-gray-900">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Info Row                                                                   */
/* -------------------------------------------------------------------------- */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
}
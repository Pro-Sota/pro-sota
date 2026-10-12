
"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Database } from "@/app/lib/supabase/models";

import { PhaseTimeline } from "./PhaseTimeline";
import { Metric } from "./Metric";
import { StatusPill } from "./StatusPill";
import { EmptyState } from "./EmptyState";
import { ProgressBar } from "./ProgressBar";
import AddPhaseModal from "./create_phase_modal";
import { StepModal } from "./step_modal";
import { DeliverableModal } from "./deliverable_modal";
import { Eye, ListPlus, FilePlus2, Plus } from "lucide-react";

import type {
  GanttPhase,
  GanttStep,
  GanttDeliverable,
  GanttMilestone,
} from "@/app/components/gant_chart/gantt";

import GanttChart from "@/app/components/gant_chart/gantt";


type Phase = Database["public"]["Tables"]["project_phases"]["Row"];
type Step = Database["public"]["Tables"]["phase_steps"]["Row"];
type Deliverable = Database["public"]["Tables"]["deliverables"]["Row"];

type StatusValue =
  | "Completed"
  | "Current"
  | "Upcoming"
  | "In Review"
  | "Pending";

type StatusItem = {
  id: string;
  name: string;
  status: StatusValue;
};




interface Props {
  phases: Phase[];
  steps: Step[];
  deliverables: Deliverable[];
  ganttMilestones: GanttMilestone[];
}


const STATUS: Record<
  StatusValue,
  { label: string; color: string }
> = {
  Completed: {
    label: "Concluída",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  Current: {
    label: "Em curso",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  Upcoming: {
    label: "Por iniciar",
    color: "bg-gray-50 text-gray-500 border-gray-200",
  },
  Pending: {
    label: "Pendente",
    color: "bg-gray-100 text-gray-600 border-gray-200",
  },
  "In Review": {
    label: "Em revisão",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

const PHASE_STATUS_LABELS: Record<string, string> = {
  not_started: "Por iniciar",
  in_progress: "Em curso",
  completed: "Concluída",
};

const DELIVERABLE_STATUS: Record<string, StatusValue> = {
  not_started: "Upcoming",
  in_progress: "Current",
  completed: "Completed",
  on_hold: "Pending",
  cancelled: "Pending",
};

const STEP_STATUS: Record<string, StatusValue> = {
  not_started: "Upcoming",
  in_progress: "Current",
  completed: "Completed",
};

function clampProgress(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(value)) return 0;

  return Math.round(Math.min(100, Math.max(0, value)));
}

/**
 * Completed phases always count as 100%.
 *
 * When a phase has steps, progress is derived from their actual statuses.
 * When no steps exist, the stored phase progress is used as a fallback.
 */
function getPhaseProgress(phase: Phase, phaseSteps: Step[]): number {
  if (phase.status === "completed") return 100;

  if (phaseSteps.length === 0) {
    return clampProgress(phase.progress);
  }

  const completedSteps = phaseSteps.filter(
    (step) => step.status === "completed",
  ).length;

  return Math.round((completedSteps / phaseSteps.length) * 100);
}

function getPhaseStatusLabel(phase: Phase): string {
  return PHASE_STATUS_LABELS[phase.status] ?? phase.status;
}

function getStepStatus(status: string): StatusValue {
  return STEP_STATUS[status] ?? "Pending";
}

function getDeliverableStatus(status: string): StatusValue {
  return DELIVERABLE_STATUS[status] ?? "Pending";
}

export default function PhasesPageInner({
  phases,
  steps,
  deliverables,
  ganttMilestones,
}: Props) {
  const router = useRouter();
  const params = useParams();

  const projectId = params.projectId as string;

  // Keep the remaining state and component logic.


  const [isAddPhaseOpen, setIsAddPhaseOpen] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>();
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [isDeliverableModalOpen, setIsDeliverableModalOpen] =
    useState(false);

  const sortedPhases = useMemo(
    () =>
      [...phases].sort((a, b) => {
        const orderDifference =
          (a.sort_order ?? 0) - (b.sort_order ?? 0);

        if (orderDifference !== 0) return orderDifference;

        const nameDifference = a.name.localeCompare(b.name);

        if (nameDifference !== 0) return nameDifference;

        return a.phase_id.localeCompare(b.phase_id);
      }),
    [phases],
  );

  const stepsByPhase = useMemo(() => {
    const result = new Map<string, Step[]>();

    for (const step of steps) {
      const existing = result.get(step.phase_id) ?? [];
      existing.push(step);
      result.set(step.phase_id, existing);
    }

    return result;
  }, [steps]);

  const progressByPhase = useMemo(() => {
    const result = new Map<string, number>();

    for (const phase of sortedPhases) {
      result.set(
        phase.phase_id,
        getPhaseProgress(
          phase,
          stepsByPhase.get(phase.phase_id) ?? [],
        ),
      );
    }

    return result;
  }, [sortedPhases, stepsByPhase]);

  /**
   * The active phase is strictly a phase marked in_progress.
   * A not-started phase is not incorrectly presented as in progress.
   */
  const activePhase = useMemo(
    () =>
      sortedPhases.find(
        (phase) => phase.status === "in_progress",
      ),
    [sortedPhases],
  );

  const nextPhase = useMemo(
    () =>
      sortedPhases.find(
        (phase) => phase.status === "not_started",
      ),
    [sortedPhases],
  );

  /**
   * Preserve the user's selection across refreshes.
   * If that phase no longer exists, fall back to a useful phase.
   */
  const selectedPhase = useMemo(
    () =>
      sortedPhases.find(
        (phase) => phase.phase_id === selectedPhaseId,
      ) ??
      activePhase ??
      nextPhase ??
      sortedPhases[0],
    [sortedPhases, selectedPhaseId, activePhase, nextPhase],
  );

  const overallProgress = useMemo(() => {
    if (sortedPhases.length === 0) return 0;

    const totalProgress = sortedPhases.reduce(
      (sum, phase) =>
        sum + (progressByPhase.get(phase.phase_id) ?? 0),
      0,
    );

    return Math.round(totalProgress / sortedPhases.length);
  }, [sortedPhases, progressByPhase]);

  const scopedSteps = useMemo(
    () =>
      selectedPhase
        ? (stepsByPhase.get(selectedPhase.phase_id) ?? [])
        : [],
    [stepsByPhase, selectedPhase],
  );

  const scopedDeliverables = useMemo(
    () =>
      selectedPhase
        ? deliverables.filter(
          (item) => item.phase_id === selectedPhase.phase_id,
        )
        : [],
    [deliverables, selectedPhase],
  );


  const chartPhases = useMemo<GanttPhase[]>(
    () =>
      sortedPhases.map((phase) => ({
        id: phase.phase_id,
        name: phase.name,
        sortOrder: phase.sort_order,
        progress: progressByPhase.get(phase.phase_id) ?? 0,
      })),
    [sortedPhases, progressByPhase],
  );

  const chartSteps = useMemo<GanttStep[]>(
    () =>
      steps.map((step) => ({
        id: step.step_id,
        name: step.name,
        phaseId: step.phase_id,
        startDate: step.planned_start,
        endDate: step.planned_end,
        progress:
          step.status === "completed"
            ? 100
            : clampProgress(step.progress),
        sortOrder: step.sort_order,
      })),
    [steps],
  );

  const chartDeliverables = useMemo<GanttDeliverable[]>(
    () =>
      deliverables.map((item) => ({
        id: item.id,
        name: item.title,
        phaseId: item.phase_id,
        startDate: null,
        endDate: null,
        progress:
          item.status === "completed"
            ? 100
            : item.status === "in_progress"
              ? 50
              : 0,
      })),
    [deliverables],
  );

  const handleSelectPhase = useCallback((phaseId: string) => {
    setSelectedPhaseId(phaseId);
  }, []);

  const handleViewDetails = useCallback(() => {
    if (!selectedPhase?.phase_id) return;

    router.push(
      `/management/projects/${projectId}/phases/${selectedPhase.phase_id}`,
    );
  }, [router, projectId, selectedPhase]);

  const handleAddStep = useCallback(() => {
    if (!selectedPhase?.phase_id) return;

    setIsStepModalOpen(true);
  }, [selectedPhase]);

  const handleAddDeliverable = useCallback(() => {
    if (!selectedPhase?.phase_id) return;

    setIsDeliverableModalOpen(true);
  }, [selectedPhase]);

  const handleStepSaved = useCallback(() => {
    setIsStepModalOpen(false);
    router.refresh();
  }, [router]);

  const handleDeliverableSaved = useCallback(() => {
    setIsDeliverableModalOpen(false);
    router.refresh();
  }, [router]);

  const nextSortOrder = useMemo(
    () =>
      sortedPhases.reduce(
        (max, phase) =>
          Math.max(max, phase.sort_order ?? 0),
        0,
      ) + 1,
    [sortedPhases],
  );

  const displayedPhase = activePhase ?? nextPhase;
  const displayedPhaseProgress = displayedPhase
    ? (progressByPhase.get(displayedPhase.phase_id) ?? 0)
    : 0;

  const displayedPhaseTitle = activePhase
    ? "Fase em curso"
    : nextPhase
      ? "Próxima fase"
      : "Fase actual";

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="space-y-8 sm:space-y-10">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                  Fases
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                  Metodologia do projecto · {phases.length}{" "}
                  {phases.length === 1
                    ? "fase definida"
                    : "fases definidas"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleViewDetails}
                  disabled={!selectedPhase}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                >
                  <Eye size={16} aria-hidden="true" />
                  Ver detalhes
                </button>

                <button
                  type="button"
                  onClick={handleAddStep}
                  disabled={!selectedPhase}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                >
                  <ListPlus size={16} aria-hidden="true" />
                  Adicionar etapa
                </button>

                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  disabled={!selectedPhase}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                >
                  <FilePlus2 size={16} aria-hidden="true" />
                  Adicionar entregável
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddPhaseOpen(true)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#BD9655] px-4 py-2 text-sm font-semibold text-[#002950] transition-colors hover:bg-[#BD9655]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                >
                  <Plus size={16} aria-hidden="true" />
                  Adicionar fase
                </button>
              </div>

            </div>
          </div>

          {/* Project Progress */}
          <section
            aria-labelledby="project-progress-heading"
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div className="border-b border-gray-200 px-6 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                    {displayedPhaseTitle}
                  </p>

                  <h2
                    id="project-progress-heading"
                    className="text-xl font-semibold text-gray-900 sm:text-2xl"
                  >
                    {displayedPhase?.name ??
                      (phases.length === 0
                        ? "Sem fases definidas"
                        : "Todas as fases concluídas")}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {displayedPhase
                      ? getPhaseStatusLabel(displayedPhase)
                      : phases.length === 0
                        ? "Adicione uma fase para começar a organizar o projecto."
                        : "Não existe nenhuma fase activa ou por iniciar."}
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                    Progresso geral
                  </p>

                  <p className="font-mono text-3xl font-bold tabular-nums text-gray-900 sm:text-4xl">
                    {overallProgress}%
                  </p>
                </div>
              </div>
            </div>

            {displayedPhase && (
              <div className="px-6 py-6 sm:px-8 sm:py-8">
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Progresso da fase
                    </label>

                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {displayedPhaseProgress}%
                    </span>
                  </div>

                  <ProgressBar percent={displayedPhaseProgress} />
                </div>
              </div>
            )}
          </section>


          {/* Project Gantt */}
          <section
            aria-labelledby="project-gantt-heading"
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <div className="border-b border-gray-200 px-6 py-5 sm:px-8 sm:py-6">
              <h2
                id="project-gantt-heading"
                className="text-lg font-semibold text-gray-900"
              >
                Cronograma do projecto
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Visualize as fases, as tarefas agendadas e os marcos do projecto.
              </p>
            </div>

            <div className="p-4 sm:p-6">

              <GanttChart
                phases={chartPhases}
                steps={chartSteps}
                deliverables={chartDeliverables}
              />

            </div>
          </section>

          {/* Phase Timeline */}
          <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-5 sm:px-8 sm:py-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Mapa de evolução
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Seleccione uma fase para consultar as etapas e os
                entregáveis associados.
              </p>
            </div>

            <div className="px-6 py-6 sm:px-8 sm:py-8">
              {sortedPhases.length > 0 ? (
                <PhaseTimeline
                  phases={sortedPhases}
                  selectedPhaseId={selectedPhase?.phase_id}
                  onSelectPhaseAction={handleSelectPhase}
                />
              ) : (
                <EmptyState message="Ainda não existem fases definidas para este projecto. Adicione a primeira fase para começar." />
              )}
            </div>
          </section>

          {/* Project Metrics */}
          <section aria-label="Métricas do projecto">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Métricas do projecto
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <Metric
                title="Entregáveis"
                value={String(deliverables.length)}
              />

              <Metric
                title="Etapas"
                value={String(steps.length)}
              />

              <Metric
                title="Fases"
                value={String(phases.length)}
              />

              <Metric
                title="Concluídas"
                value={String(
                  phases.filter(
                    (phase) => phase.status === "completed",
                  ).length,
                )}
              />
            </div>
          </section>

          {/* Selected Phase */}
          <section>
            <div className="mb-4 border-b border-gray-200 pb-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Fase seleccionada
                </p>

                <p className="text-sm font-medium text-gray-900">
                  {selectedPhase?.name ?? "Nenhuma fase seleccionada"}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Deliverables */}
              <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-6 py-4 sm:py-5">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Entregáveis
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Entregáveis associados à fase seleccionada
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    disabled={!selectedPhase}
                    className="inline-flex shrink-0 cursor-pointer items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                  >
                    + Adicionar
                  </button>
                </div>

                <div className="px-6 py-5 sm:py-6">
                  {scopedDeliverables.length > 0 ? (
                    <StatusList
                      items={scopedDeliverables.map((item) => ({
                        id: item.id,
                        name: item.title,
                        status: getDeliverableStatus(item.status),
                      }))}
                    />
                  ) : (
                    <EmptyState
                      message={
                        selectedPhase
                          ? "Esta fase ainda não tem entregáveis. Adicione um para acompanhar as entregas previstas."
                          : "Seleccione uma fase para consultar os seus entregáveis."
                      }
                    />
                  )}
                </div>
              </section>

              {/* Steps */}
              <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-6 py-4 sm:py-5">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Etapas
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Etapas de execução da fase seleccionada
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddStep}
                    disabled={!selectedPhase}
                    className="inline-flex shrink-0 cursor-pointer items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                  >
                    + Adicionar
                  </button>
                </div>

                <div className="px-6 py-5 sm:py-6">
                  {scopedSteps.length > 0 ? (
                    <StatusList
                      items={scopedSteps.map((item) => ({
                        id: item.step_id,
                        name: item.name,
                        status: getStepStatus(item.status),
                      }))}
                    />
                  ) : (
                    <EmptyState
                      message={
                        selectedPhase
                          ? "Esta fase ainda não tem etapas. Adicione a primeira para organizar a execução."
                          : "Seleccione uma fase para consultar as suas etapas."
                      }
                    />
                  )}
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>

      {/* Add Phase */}
      {isAddPhaseOpen && (
        <AddPhaseModal
          projectId={projectId}
          nextSortOrder={nextSortOrder}
          onClose={() => setIsAddPhaseOpen(false)}
        />
      )}

      {/* Add Step */}
      {isStepModalOpen && selectedPhase && (
        <StepModal
          projectId={projectId}
          phaseId={selectedPhase.phase_id}
          onClose={() => setIsStepModalOpen(false)}
          onSaved={handleStepSaved}
        />
      )}

      {/* Add Deliverable */}
      {isDeliverableModalOpen && selectedPhase && (
        <DeliverableModal
          projectId={projectId}
          phaseId={selectedPhase.phase_id}
          onClose={() => setIsDeliverableModalOpen(false)}
          onSaved={handleDeliverableSaved}
        />
      )}
    </div>
  );
}

function StatusList({ items }: { items: StatusItem[] }) {
  return (
    <div className="divide-y divide-gray-100">
      {items.map((item) => {
        const config = STATUS[item.status];

        return (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 py-3"
          >
            <span className="min-w-0 flex-1 text-sm text-gray-700">
              {item.name}
            </span>

            <div className="shrink-0">
              <StatusPill
                label={config.label}
                color={config.color}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

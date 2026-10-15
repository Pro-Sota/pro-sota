
"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Database } from "@/app/lib/supabase/models";

import { PhaseTimeline } from "./PhaseTimeline";
import { Metric } from "./Metric";
import { StatusPill } from "./StatusPill";
import { EmptyState } from "./EmptyState";
import { ProgressBar } from "./ProgressBar";
import AddPhaseModal from "./create_phase_modal";
import { StageModal } from "./stage_modal";
import { DeliverableModal } from "./deliverable_modal";

import {
  Eye,
  ListPlus,
  FilePlus2,
  Plus,
  Pencil,
} from "lucide-react";

import type {
  GanttPhase,
  GanttDeliverable,
  GanttStep,
} from "@/app/components/gant_chart/gantt";

import GanttChart from "@/app/components/gant_chart/gantt";

type Phase = Database["public"]["Tables"]["project_phases"]["Row"];
type Stage = Database["public"]["Tables"]["phase_stages"]["Row"];
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
  Stages: Stage[];
  deliverables: Deliverable[];
}

const STATUS: Record<StatusValue, { label: string; color: string }> = {
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

const STAGE_STATUS: Record<string, StatusValue> = {
  not_started: "Upcoming",
  in_progress: "Current",
  completed: "Completed",
};

function clampProgress(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(value)) return 0;
  return Math.round(Math.min(100, Math.max(0, value)));
}

function getStageProgress(stage: Stage): number {
  return stage.status === "completed"
    ? 100
    : clampProgress(stage.progress);
}

function getPhaseProgress(phase: Phase, phaseStages: Stage[]): number {
  if (phase.status === "completed") return 100;

  if (phaseStages.length === 0) {
    return clampProgress(phase.progress);
  }

  const total = phaseStages.reduce(
    (sum, stage) => sum + getStageProgress(stage),
    0,
  );

  return Math.round(total / phaseStages.length);
}

function getPhaseStatusLabel(phase: Phase): string {
  return PHASE_STATUS_LABELS[phase.status] ?? phase.status;
}

function getStageStatus(status: string): StatusValue {
  return STAGE_STATUS[status] ?? "Pending";
}

function getDeliverableStatus(status: string): StatusValue {
  return DELIVERABLE_STATUS[status] ?? "Pending";
}

export default function PhasesPageInner({
  phases,
  Stages,
  deliverables,
}: Props) {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [isAddPhaseOpen, setIsAddPhaseOpen] = useState(false);

  const [selectedPhaseId, setSelectedPhaseId] = useState<string>();

  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);

  const [isDeliverableModalOpen, setIsDeliverableModalOpen] =
    useState(false);

  const [editingDeliverable, setEditingDeliverable] =
    useState<Deliverable | null>(null);

  const sortedPhases = useMemo(
    () =>
      [...phases].sort(
        (a, b) =>
          (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
          a.name.localeCompare(b.name, "pt") ||
          a.phase_id.localeCompare(b.phase_id),
      ),
    [phases],
  );

  const stagesByPhase = useMemo(() => {
    const result = new Map<string, Stage[]>();

    for (const stage of Stages) {
      const existing = result.get(stage.phase_id) ?? [];
      existing.push(stage);
      result.set(stage.phase_id, existing);
    }

    for (const phaseStages of result.values()) {
      phaseStages.sort(
        (a, b) =>
          (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
          a.name.localeCompare(b.name, "pt") ||
          a.stage_id.localeCompare(b.stage_id),
      );
    }

    return result;
  }, [Stages]);

  const progressByPhase = useMemo(() => {
    const result = new Map<string, number>();

    for (const phase of sortedPhases) {
      result.set(
        phase.phase_id,
        getPhaseProgress(
          phase,
          stagesByPhase.get(phase.phase_id) ?? [],
        ),
      );
    }

    return result;
  }, [sortedPhases, stagesByPhase]);

  const activePhase = useMemo(
    () => sortedPhases.find((phase) => phase.status === "in_progress"),
    [sortedPhases],
  );

  const nextPhase = useMemo(
    () => sortedPhases.find((phase) => phase.status === "not_started"),
    [sortedPhases],
  );

  const allPhasesCompleted =
    sortedPhases.length > 0 &&
    sortedPhases.every((phase) => phase.status === "completed");

  const lastCompletedPhase = useMemo(
    () =>
      [...sortedPhases]
        .reverse()
        .find((phase) => phase.status === "completed"),
    [sortedPhases],
  );

  const selectedPhase = useMemo(
    () =>
      sortedPhases.find(
        (phase) => phase.phase_id === selectedPhaseId,
      ) ??
      activePhase ??
      nextPhase ??
      lastCompletedPhase ??
      sortedPhases[0],
    [
      sortedPhases,
      selectedPhaseId,
      activePhase,
      nextPhase,
      lastCompletedPhase,
    ],
  );

  const overallProgress = useMemo(() => {
    if (sortedPhases.length === 0) return 0;
    if (allPhasesCompleted) return 100;

    const total = sortedPhases.reduce(
      (sum, phase) =>
        sum + (progressByPhase.get(phase.phase_id) ?? 0),
      0,
    );

    return Math.round(total / sortedPhases.length);
  }, [sortedPhases, progressByPhase, allPhasesCompleted]);

  const scopedStages = useMemo(
    () =>
      selectedPhase
        ? stagesByPhase.get(selectedPhase.phase_id) ?? []
        : [],
    [stagesByPhase, selectedPhase],
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

  const chartStages = useMemo<GanttStep[]>(
    () =>
      Stages.map((stage) => ({
        id: stage.stage_id,
        name: stage.name,
        phaseId: stage.phase_id,
        startDate: stage.planned_start,
        endDate: stage.planned_end,
        progress: getStageProgress(stage),
        sortOrder: stage.sort_order,
      })),
    [Stages],
  );

  const chartDeliverables = useMemo<GanttDeliverable[]>(
    () =>
      deliverables.map((item) => ({
        id: item.id,
        name: item.title,
        phaseId: item.phase_id,
        startDate: item.start_date,
        endDate: item.due_date,
        progress: clampProgress(item.progress),
      })),
    [deliverables],
  );

  const handleSelectPhase = useCallback((phaseId: string) => {
    setSelectedPhaseId(phaseId);
  }, []);

  const handleViewDetails = useCallback(() => {
    if (!selectedPhase) return;

    router.push(
      `/management/projects/${projectId}/phases/${selectedPhase.phase_id}`,
    );
  }, [router, projectId, selectedPhase]);

  const handleAddStage = useCallback(() => {
    if (!selectedPhase) return;

    setEditingStage(null);
    setIsStageModalOpen(true);
  }, [selectedPhase]);

  const handleEditStage = useCallback(
    (stageId: string) => {
      const stage = scopedStages.find(
        (item) => item.stage_id === stageId,
      );

      if (!stage) return;

      setEditingStage(stage);
      setIsStageModalOpen(true);
    },
    [scopedStages],
  );

  const handleCloseStageModal = useCallback(() => {
    setIsStageModalOpen(false);
    setEditingStage(null);
  }, []);

  const handleAddDeliverable = useCallback(() => {
    if (!selectedPhase) return;

    setEditingDeliverable(null);
    setIsDeliverableModalOpen(true);
  }, [selectedPhase]);

  const handleEditDeliverable = useCallback(
    (deliverableId: string) => {
      const deliverable = scopedDeliverables.find(
        (item) => item.id === deliverableId,
      );

      if (!deliverable) return;

      setEditingDeliverable(deliverable);
      setIsDeliverableModalOpen(true);
    },
    [scopedDeliverables],
  );

  const handleCloseDeliverableModal = useCallback(() => {
    setIsDeliverableModalOpen(false);
    setEditingDeliverable(null);
  }, []);

  const handleStageSaved = useCallback(() => {
    setIsStageModalOpen(false);
    setEditingStage(null);
    router.refresh();
  }, [router]);

  const handleDeliverableSaved = useCallback(() => {
    setIsDeliverableModalOpen(false);
    setEditingDeliverable(null);
    router.refresh();
  }, [router]);

  const nextSortOrder = useMemo(
    () =>
      sortedPhases.reduce(
        (max, phase) => Math.max(max, phase.sort_order ?? 0),
        0,
      ) + 1,
    [sortedPhases],
  );

  const displayedPhase = activePhase ?? nextPhase ?? lastCompletedPhase;

  const displayedPhaseProgress = displayedPhase
    ? progressByPhase.get(displayedPhase.phase_id) ?? 0
    : 0;

  const displayedPhaseTitle = allPhasesCompleted
    ? "Projecto concluído"
    : activePhase
      ? "Fase em curso"
      : nextPhase
        ? "Próxima fase"
        : "Fase actual";

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="space-y-8 sm:space-y-10">
          <header className="border-b border-gray-200 pb-6">
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
                  onClick={handleAddStage}
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
          </header>

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
                    {allPhasesCompleted
                      ? "Todas as fases concluídas"
                      : displayedPhase?.name ??
                        (phases.length === 0
                          ? "Sem fases definidas"
                          : "Sem fases activas ou por iniciar")}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {allPhasesCompleted
                      ? "O projecto tem todas as fases concluídas."
                      : displayedPhase
                        ? getPhaseStatusLabel(displayedPhase)
                        : "Adicione uma fase para começar a organizar o projecto."}
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
                    <span className="text-sm font-medium text-gray-700">
                      Progresso da fase
                    </span>
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {displayedPhaseProgress}%
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-label={`Progresso da fase ${displayedPhase.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={displayedPhaseProgress}
                  >
                    <ProgressBar percent={displayedPhaseProgress} />
                  </div>
                </div>
              </div>
            )}
          </section>

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
                Visualize as fases, as etapas agendadas e os marcos do projecto.
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <GanttChart
                phases={chartPhases}
                steps={chartStages}
                deliverables={chartDeliverables}
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-5 sm:px-8 sm:py-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Mapa de evolução
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Seleccione uma fase para consultar as etapas e os entregáveis associados.
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
              <Metric title="Etapas" value={String(Stages.length)} />
              <Metric title="Fases" value={String(phases.length)} />
              <Metric
                title="Concluídas"
                value={String(
                  phases.filter((phase) => phase.status === "completed")
                    .length,
                )}
              />
            </div>
          </section>

          <section aria-labelledby="selected-phase-heading">
            <div className="mb-4 border-b border-gray-200 pb-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <p
                  id="selected-phase-heading"
                  className="text-xs font-semibold uppercase tracking-widest text-gray-500"
                >
                  Fase seleccionada
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedPhase?.name ?? "Nenhuma fase seleccionada"}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
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
                    className="inline-flex min-h-8 shrink-0 items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
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
                      onEdit={handleEditDeliverable}
                      editLabel="Editar entregável"
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

              <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-6 py-4 sm:py-5">
                  <div>
                    <h3 className="font-semibold text-gray-900">Etapas</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Etapas de execução da fase seleccionada
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddStage}
                    disabled={!selectedPhase}
                    className="inline-flex min-h-8 shrink-0 items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                  >
                    + Adicionar
                  </button>
                </div>

                <div className="px-6 py-5 sm:py-6">
                  {scopedStages.length > 0 ? (
                    <StatusList
                      items={scopedStages.map((item) => ({
                        id: item.stage_id,
                        name: item.name,
                        status: getStageStatus(item.status),
                      }))}
                      onEdit={handleEditStage}
                      editLabel="Editar etapa"
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

      {isAddPhaseOpen && (
        <AddPhaseModal
          projectId={projectId}
          nextSortOrder={nextSortOrder}
          onClose={() => setIsAddPhaseOpen(false)}
        />
      )}

      {isStageModalOpen && selectedPhase && (
        <StageModal
          projectId={projectId}
          phaseId={editingStage?.phase_id ?? selectedPhase.phase_id}
          stage={editingStage as Stage | null}
          onClose={handleCloseStageModal}
          onSaved={handleStageSaved}
        />
      )}

      {isDeliverableModalOpen &&
        (editingDeliverable || selectedPhase) && (
          <DeliverableModal
          projectId={projectId}
          phaseId={editingDeliverable?.phase_id ??
            selectedPhase!.phase_id}
          deliverable={editingDeliverable}
          onClose={handleCloseDeliverableModal}
          onSaved={handleDeliverableSaved} stages={[]}          />
        )}
    </div>
  );
}

function StatusList({
  items,
  onEdit,
  editLabel = "Editar",
}: {
  items: StatusItem[];
  onEdit?: (id: string) => void;
  editLabel?: string;
}) {
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

            <div className="flex shrink-0 items-center gap-2">
              <StatusPill
                label={config.label}
                color={config.color}
              />

              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(item.id)}
                  aria-label={`${editLabel} ${item.name}`}
                  title={editLabel}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#002950] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                >
                  <Pencil size={15} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

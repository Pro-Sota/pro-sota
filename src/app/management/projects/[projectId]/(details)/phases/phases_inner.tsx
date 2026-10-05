"use client";

import { useMemo, useState } from "react";
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

type Phase = Database["public"]["Tables"]["project_phases"]["Row"];
type Step = Database["public"]["Tables"]["phase_steps"]["Row"];
type Deliverable = Database["public"]["Tables"]["deliverables"]["Row"];

type PhaseStatus = Phase["status"];

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

const STATUS = {
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
} as const;

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

interface Props {
  phases: Phase[];
  steps: Step[];
  deliverables: Deliverable[];
}

export default function PhasesPageInner({
  phases,
  steps,
  deliverables,
}: Props) {
  const router = useRouter();
  const params = useParams();

  const projectId = params.projectId as string;

  const [isAddPhaseOpen, setIsAddPhaseOpen] = useState(false);

  const [selectedPhaseId, setSelectedPhaseId] = useState<
    string | undefined
  >(undefined);

  const [isStepModalOpen, setIsStepModalOpen] = useState(false);

  const [isDeliverableModalOpen, setIsDeliverableModalOpen] =
    useState(false);

  const sortedPhases = useMemo(
    () =>
      [...phases].sort(
        (a, b) =>
          (a.sort_order ?? 0) - (b.sort_order ?? 0)
      ),
    [phases]
  );

  const currentPhase = useMemo(
    () =>
      sortedPhases.find(
        (phase) => phase.status === "in_progress"
      ) ??
      sortedPhases.find(
        (phase) => phase.status === "not_started"
      ) ??
      sortedPhases.find(
        (phase) => phase.status === "completed"
      ) ??
      sortedPhases[0],
    [sortedPhases]
  );

  const selectedPhase = useMemo(
    () =>
      sortedPhases.find(
        (phase) => phase.phase_id === selectedPhaseId
      ) ?? currentPhase,
    [sortedPhases, selectedPhaseId, currentPhase]
  );

  const overallProgress = useMemo(
    () => computeOverallProgress(sortedPhases),
    [sortedPhases]
  );

  const scopedDeliverables = useMemo(
    () =>
      deliverables.filter(
        (item) =>
          item.phase_id === selectedPhase?.phase_id
      ),
    [deliverables, selectedPhase?.phase_id]
  );

  const scopedSteps = useMemo(
    () =>
      steps.filter(
        (item) =>
          item.phase_id === selectedPhase?.phase_id
      ),
    [steps, selectedPhase?.phase_id]
  );

  const handleAddPhase = () => {
    setIsAddPhaseOpen(true);
  };

  const handleViewDetails = () => {
    if (!selectedPhase?.phase_id) return;

    router.push(
      `/management/projects/${projectId}/phases/${selectedPhase.phase_id}`
    );
  };

  function handleSelectPhase(phaseId: string) {
    setSelectedPhaseId(phaseId);
  }

  const handleAddStep = () => {
    if (!selectedPhase?.phase_id) return;

    setIsStepModalOpen(true);
  };

  const handleAddDeliverable = () => {
    if (!selectedPhase?.phase_id) return;

    setIsDeliverableModalOpen(true);
  };

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

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleAddStep}
                  disabled={!selectedPhase}
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                >
                  Adicionar etapa
                </button>

                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  disabled={!selectedPhase}
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#BD9655] px-4 py-2.5 text-sm font-medium text-[#002950] transition-colors hover:bg-[#BD9655]/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                >
                  Adicionar entregável
                </button>

                <button
                  type="button"
                  onClick={handleAddPhase}
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-[#BD9655] px-4 py-2.5 text-sm font-medium text-[#002950] transition-colors hover:bg-[#BD9655]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                >
                  Adicionar fase
                </button>

                <button
                  type="button"
                  onClick={handleViewDetails}
                  disabled={!selectedPhase}
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                >
                  Ver detalhes
                </button>
              </div>
            </div>
          </div>

          {/* Current Phase */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-5 sm:px-8 sm:py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                    {currentPhase?.name ?? "Sem fase actual"}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {currentPhase
                      ? (PHASE_STATUS_LABELS[
                          currentPhase.status
                        ] ?? currentPhase.status)
                      : "Ainda não existem fases definidas"}
                  </p>
                </div>

                <div className="flex items-baseline gap-6 sm:text-right">
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
                      Progresso Geral
                    </p>

                    <p className="font-mono text-3xl font-bold tabular-nums text-gray-900 sm:text-4xl">
                      {overallProgress}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {currentPhase && (
              <div className="px-6 py-6 sm:px-8 sm:py-8">
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Conclusão da fase actual
                    </label>

                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {currentPhase.progress ?? 0}%
                    </span>
                  </div>

                  <ProgressBar
                    percent={currentPhase.progress ?? 0}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-5 sm:px-8 sm:py-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Mapa de evolução
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Clique numa fase para ver os detalhes e
                entregas associadas
              </p>
            </div>

            <div className="px-6 py-6 sm:px-8 sm:py-8">
              {sortedPhases.length > 0 ? (
                <PhaseTimeline
                  phases={sortedPhases}
                  selectedPhaseId={
                    selectedPhase?.phase_id
                  }
                  onSelectPhaseAction={
                    handleSelectPhase
                  }
                />
              ) : (
                <EmptyState message="Ainda não existem fases definidas para este projecto." />
              )}
            </div>
          </div>

          {/* Project Metrics */}
          <div>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Métricas do projecto
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <Metric
                title="Entregas"
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
                    (phase) =>
                      phase.status === "completed"
                  ).length
                )}
              />
            </div>
          </div>

          {/* Selected Phase */}
          <div>
            <div className="mb-4 border-b border-gray-200 pb-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Fase seleccionada
                </p>

                <p className="text-sm font-medium text-gray-900">
                  {selectedPhase?.name ?? "—"}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Deliverables */}
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 sm:py-5">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Entregas
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Entregáveis associados à fase
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDeliverable}
                    disabled={!selectedPhase}
                    className="inline-flex cursor-pointer items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    + Adicionar
                  </button>
                </div>

                <div className="px-6 py-5 sm:py-6">
                  {scopedDeliverables.length > 0 ? (
                    <StatusList
                      items={scopedDeliverables.map(
                        (item) => ({
                          id: item.id,
                          name: item.title,
                          status:
                            DELIVERABLE_STATUS[
                              item.status
                            ] ?? "Pending",
                        })
                      )}
                    />
                  ) : (
                    <EmptyState message="Sem entregas associadas a esta fase." />
                  )}
                </div>
              </div>

              {/* Steps */}
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 sm:py-5">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Etapas
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Etapas de execução da fase
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddStep}
                    disabled={!selectedPhase}
                    className="inline-flex cursor-pointer items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                        status:
                          STEP_STATUS[item.status] ??
                          "Pending",
                      }))}
                    />
                  ) : (
                    <EmptyState message="Sem etapas associadas a esta fase." />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Phase */}
      {isAddPhaseOpen && (
        <AddPhaseModal
          projectId={projectId}
          nextSortOrder={sortedPhases.length + 1}
          onClose={() => setIsAddPhaseOpen(false)}
        />
      )}

      {/* Add Step */}
      {isStepModalOpen && selectedPhase?.phase_id && (
        <StepModal
          projectId={projectId}
          phaseId={selectedPhase.phase_id}
          onClose={() => setIsStepModalOpen(false)}
          onSaved={() => {
            setIsStepModalOpen(false);
            router.refresh();
          }}
        />
      )}

      {/* Add Deliverable */}
      {isDeliverableModalOpen &&
        selectedPhase?.phase_id && (
          <DeliverableModal
            projectId={projectId}
            phaseId={selectedPhase.phase_id}
            onClose={() =>
              setIsDeliverableModalOpen(false)
            }
            onSaved={() => {
              setIsDeliverableModalOpen(false);
              router.refresh();
            }}
          />
        )}
    </div>
  );
}

function computeOverallProgress(phases: Phase[]) {
  if (!phases.length) return 0;

  const total = phases.reduce((sum, phase) => {
    if (phase.status === "completed") {
      return sum + 100;
    }

    if (phase.status === "in_progress") {
      return sum + (phase.progress ?? 0);
    }

    return sum;
  }, 0);

  return Math.round(total / phases.length);
}

function StatusList({
  items,
}: {
  items: StatusItem[];
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
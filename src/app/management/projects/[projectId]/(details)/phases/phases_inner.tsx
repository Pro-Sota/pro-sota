"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Eye,
  FilePlus2,
  ListPlus,
  Pencil,
  Plus,
} from "lucide-react";

import { PhaseTimeline } from "./PhaseTimeline";
import { StatusPill } from "./StatusPill";
import { EmptyState } from "./EmptyState";
import { ProgressBar } from "./ProgressBar";

import AddPhaseModal from "./create_phase_modal";
import { StageModal } from "./stage_modal";
import { DeliverableModal } from "./deliverable_modal";

import GanttChart from "@/app/components/gant_chart/gantt";

import type {
  GanttPhase,
  GanttStep,
  GanttDeliverable,
} from "@/app/components/gant_chart/gantt";

import type { Database } from "../../../../../../../models";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Phase = Database["public"]["Tables"]["project_phases"]["Row"];
type Stage = Database["public"]["Tables"]["phase_stages"]["Row"];

type Task = Database["public"]["Tables"]["tasks"]["Row"] & {
  stage_id: string | null;
};

type Props = {
  phases: Phase[];
  stages: Stage[];
  tasks: Task[];
};

type Tab = "workspace" | "gantt";

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

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

const STATUS = {
  Completed: {
    label: "Concluída",
    color: "border-green-200 bg-green-50 text-green-700",
  },
  Current: {
    label: "Em curso",
    color: "border-amber-200 bg-amber-50 text-amber-700",
  },
  Upcoming: {
    label: "Por iniciar",
    color: "border-gray-200 bg-gray-50 text-gray-600",
  },
  "In Review": {
    label: "Em revisão",
    color: "border-blue-200 bg-blue-50 text-blue-700",
  },
  Pending: {
    label: "Alterações solicitadas",
    color: "border-gray-200 bg-gray-100 text-gray-600",
  },
} as const;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2";

const SECONDARY_BUTTON =
  `inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-[#002950] ${FOCUS_RING}`;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function average(values: number[]) {
  if (!values.length) return 0;

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

function getTaskProgress(task: Task) {
  return task.review_status === "approved" ? 100 : 0;
}

function getStageProgress(stage: Stage) {
  return stage.status === "completed"
    ? 100
    : clamp(stage.progress ?? 0);
}

function getPhaseProgress(tasks: Task[]) {
  return average(tasks.map(getTaskProgress));
}

function getPhaseStatusLabel(phase: Phase): StatusValue {
  if (phase.status === "completed") return "Completed";
  if (phase.status === "in_progress") return "Current";
  return "Upcoming";
}

function getStageStatus(stage: Stage): StatusValue {
  if (stage.status === "completed") return "Completed";
  if (stage.status === "in_progress") return "Current";
  return "Upcoming";
}

function getTaskStatus(task: Task): StatusValue {
  if (task.review_status === "approved") return "Completed";
  if (task.review_status === "in_review") return "In Review";
  if (task.review_status === "changes_requested") return "Pending";
  return "Upcoming";
}

/* -------------------------------------------------------------------------- */
/* Status list                                                                 */
/* -------------------------------------------------------------------------- */

function StatusList({
  items,
  onEdit,
  editLabel = "Editar",
}: {
  items: StatusItem[];
  onEdit?: (id: string) => void;
  editLabel?: string;
}) {
  if (!items.length) {
    return <EmptyState message="Sem registos." />;
  }

  return (
    <div className="divide-y divide-gray-100">
      {items.map((item) => {
        const config = STATUS[item.status];

        return (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
          >
            <span className="min-w-0 flex-1 break-words text-sm font-medium leading-6 text-gray-700">
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
                  className={`rounded-md p-2 text-gray-500 hover:text-[#002950] ${FOCUS_RING}`}
                >
                  <Pencil size={15} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function PhasesPageInner({
  phases,
  stages,
  tasks,
}: Props) {
  const router = useRouter();
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [tab, setTab] = useState<Tab>("workspace");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(
    null,
  );

  const [isAddPhaseOpen, setIsAddPhaseOpen] = useState(false);

  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Sorted data                                                               */
  /* ------------------------------------------------------------------------ */

  const sortedPhases = useMemo(
    () =>
      [...phases].sort(
        (a, b) =>
          (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
          a.name.localeCompare(b.name) ||
          a.phase_id.localeCompare(b.phase_id),
      ),
    [phases],
  );

  const sortedStages = useMemo(
    () =>
      [...stages].sort(
        (a, b) =>
          (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
          a.stage_id.localeCompare(b.stage_id),
      ),
    [stages],
  );

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort(
        (a, b) =>
          (a.position ?? 0) - (b.position ?? 0) ||
          a.title.localeCompare(b.title) ||
          a.task_id.localeCompare(b.task_id),
      ),
    [tasks],
  );

  const stagesByPhase = useMemo(() => {
    const map = new Map<string, Stage[]>();

    for (const stage of sortedStages) {
      const items = map.get(stage.phase_id) ?? [];
      items.push(stage);
      map.set(stage.phase_id, items);
    }

    return map;
  }, [sortedStages]);

  const tasksByPhase = useMemo(() => {
    const map = new Map<string, Task[]>();

    for (const task of sortedTasks) {
      if (!task.phase_id) continue;

      const items = map.get(task.phase_id) ?? [];
      items.push(task);
      map.set(task.phase_id, items);
    }

    return map;
  }, [sortedTasks]);

  const selectedPhase =
    sortedPhases.find((phase) => phase.phase_id === selectedPhaseId) ??
    sortedPhases.find((phase) => phase.status === "in_progress") ??
    sortedPhases.find((phase) => phase.status === "not_started") ??
    sortedPhases[0] ??
    null;

  const scopedStages = selectedPhase
    ? (stagesByPhase.get(selectedPhase.phase_id) ?? [])
    : [];

  const scopedTasks = selectedPhase
    ? (tasksByPhase.get(selectedPhase.phase_id) ?? [])
    : [];

  const approvedCount = sortedTasks.filter(
    (task) => task.review_status === "approved",
  ).length;

  const overallProgress = getPhaseProgress(sortedTasks);
  const phaseProgress = getPhaseProgress(scopedTasks);

  const nextSortOrder =
    sortedPhases.reduce(
      (max, phase) => Math.max(max, phase.sort_order ?? 0),
      0,
    ) + 1;

  /* ------------------------------------------------------------------------ */
  /* Gantt data                                                                */
  /* ------------------------------------------------------------------------ */

  const ganttPhases: GanttPhase[] = useMemo(
    () =>
      sortedPhases.map((phase) => ({
        id: phase.phase_id,
        name: phase.name,
        sortOrder: phase.sort_order ?? 0,
        progress: getPhaseProgress(
          tasksByPhase.get(phase.phase_id) ?? [],
        ),
      })),
    [sortedPhases, tasksByPhase],
  );

  const ganttSteps: GanttStep[] = useMemo(
    () =>
      sortedStages.map((stage) => ({
        id: stage.stage_id,
        name: stage.name,
        phaseId: stage.phase_id,
        startDate: stage.planned_start_date,
        endDate: stage.planned_end_date,
        progress: getStageProgress(stage),
        sortOrder: stage.sort_order ?? 0,
      })),
    [sortedStages],
  );

  const ganttDeliverables: GanttDeliverable[] = useMemo(
    () =>
      sortedTasks
        .filter((task) => task.phase_id)
        .map((task) => ({
          id: task.task_id,
          name: task.title,
          phaseId: task.phase_id!,
          startDate: task.start_date,
          endDate: task.due_date,
          progress: getTaskProgress(task),
        })),
    [sortedTasks],
  );

  /* ------------------------------------------------------------------------ */
  /* Actions                                                                   */
  /* ------------------------------------------------------------------------ */

  function closeStageModal() {
    setIsStageModalOpen(false);
    setEditingStage(null);
  }

  function closeTaskModal() {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  }

  function openStage(stage: Stage | null = null) {
    setEditingStage(stage);
    setIsStageModalOpen(true);
  }

  function openTask(task: Task | null = null) {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }

  function refreshAfterSave() {
    router.refresh();
  }

  const phaseStatus = selectedPhase
    ? STATUS[getPhaseStatusLabel(selectedPhase)]
    : null;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-[#002950]">
            Fases do projecto
          </h2>

          <p className="mt-1 text-sm leading-6 text-gray-600">
            Acompanhe o progresso e organize o trabalho por fase.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddPhaseOpen(true)}
          className={`inline-flex items-center gap-2 rounded-lg bg-[#002950] px-4 py-2.5 text-sm font-medium text-white ${FOCUS_RING}`}
        >
          <Plus size={17} />
          Nova fase
        </button>
      </header>

      {/* Overall project progress */}
      <section className="rounded-2xl border border-[#002950]/15 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Progresso geral do projecto
            </p>

            <p className="mt-2 text-3xl font-semibold tabular-nums text-[#002950]">
              {overallProgress}%
            </p>
          </div>

          <p className="text-sm text-gray-600">
            {approvedCount} de {sortedTasks.length} tarefas aprovadas
          </p>
        </div>

        <div className="mt-5">
          <ProgressBar percent={overallProgress} />
        </div>
      </section>

      {/* View navigation */}
      <nav
        aria-label="Visualização do projecto"
        className="flex gap-2 overflow-x-auto border-b border-gray-200"
      >
        {(
          [
            ["workspace", "Fases e tarefas"],
            ["gantt", "Cronograma"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            aria-pressed={tab === value}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium ${FOCUS_RING} ${
              tab === value
                ? "border-[#002950] text-[#002950]"
                : "border-transparent text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "gantt" ? (
        <section className="min-w-0 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          {sortedPhases.length ? (
            <GanttChart
              phases={ganttPhases}
              steps={ganttSteps}
              deliverables={ganttDeliverables}
            />
          ) : (
            <EmptyState message="Crie uma fase para visualizar o cronograma." />
          )}
        </section>
      ) : (
        <>
          {/* Phase selection */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-4 text-sm font-semibold text-[#002950]">
              Seleccionar fase
            </h3>

            {sortedPhases.length ? (
              <PhaseTimeline
                phases={sortedPhases}
                selectedPhaseId={selectedPhase?.phase_id ?? null}
                onSelectPhaseAction={setSelectedPhaseId}
              />
            ) : (
              <EmptyState message="Nenhuma fase criada." />
            )}
          </section>

          {/* Selected phase */}
          {selectedPhase && (
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 bg-[#F7F7F5] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
                      Fase seleccionada
                    </p>

                    <h3 className="mt-2 break-words text-lg font-semibold text-[#002950]">
                      {selectedPhase.name}
                    </h3>

                    {phaseStatus && (
                      <div className="mt-3">
                        <StatusPill
                          label={phaseStatus.label}
                          color={phaseStatus.color}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/management/projects/${projectId}/phases/${selectedPhase.phase_id}`,
                      )
                    }
                    className={SECONDARY_BUTTON}
                  >
                    <Eye size={16} />
                    Detalhes
                  </button>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="text-gray-600">
                      Progresso da fase
                    </span>

                    <span className="font-semibold tabular-nums text-[#002950]">
                      {phaseProgress}%
                    </span>
                  </div>

                  <ProgressBar percent={phaseProgress} />
                </div>
              </div>

              {/* Stages and tasks */}
              <div className="grid grid-cols-1 gap-8 p-5 sm:p-6 lg:grid-cols-2 lg:gap-10">
                <div className="min-w-0">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h4 className="font-semibold text-[#002950]">
                      Etapas ({scopedStages.length})
                    </h4>

                    <button
                      type="button"
                      onClick={() => openStage()}
                      className={SECONDARY_BUTTON}
                    >
                      <ListPlus size={16} />
                      Etapa
                    </button>
                  </div>

                  <StatusList
                    items={scopedStages.map((stage) => ({
                      id: stage.stage_id,
                      name: stage.name,
                      status: getStageStatus(stage),
                    }))}
                    onEdit={(id) => {
                      const stage = scopedStages.find(
                        (item) => item.stage_id === id,
                      );

                      if (stage) openStage(stage);
                    }}
                    editLabel="Editar etapa"
                  />
                </div>

                <div className="min-w-0 border-t border-gray-200 pt-8 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h4 className="font-semibold text-[#002950]">
                      Tarefas ({scopedTasks.length})
                    </h4>

                    <button
                      type="button"
                      onClick={() => openTask()}
                      className={SECONDARY_BUTTON}
                    >
                      <FilePlus2 size={16} />
                      Tarefa
                    </button>
                  </div>

                  <StatusList
                    items={scopedTasks.map((task) => ({
                      id: task.task_id,
                      name: task.title,
                      status: getTaskStatus(task),
                    }))}
                    onEdit={(id) => {
                      const task = scopedTasks.find(
                        (item) => item.task_id === id,
                      );

                      if (task) openTask(task);
                    }}
                    editLabel="Editar tarefa"
                  />
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* Modals */}
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
          phaseId={selectedPhase.phase_id}
          stage={editingStage}
          onClose={closeStageModal}
          onSaved={refreshAfterSave}
        />
      )}

      {isTaskModalOpen && selectedPhase && (
        <DeliverableModal
          projectId={projectId}
          phaseId={selectedPhase.phase_id}
          task={editingTask}
          stages={scopedStages}
          onClose={closeTaskModal}
          onSaved={refreshAfterSave}
        />
      )}
    </div>
  );
}
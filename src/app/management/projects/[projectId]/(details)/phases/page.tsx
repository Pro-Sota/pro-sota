"use client";

import { useMemo, useState } from "react";
import { Phase } from "./types";
import { PhaseTimeline } from "./PhaseTimeline";
import { Metric } from "./Metric";
import { StatusPill } from "./StatusPill";
import { EmptyState } from "./EmptyState";
import { ProgressBar } from "./ProgressBar";
import { Card } from "./Card";

type StatusValue =
  | "Completed"
  | "Current"
  | "Upcoming"
  | "In Review"
  | "Pending";

type StatusItem = {
  name: string;
  status: StatusValue;
  phaseName: string;
};

const STATUS_LABELS_PT: Record<StatusValue, string> = {
  Completed: "Concluída",
  Current: "Em curso",
  Upcoming: "Por iniciar",
  "In Review": "Em revisão",
  Pending: "Pendente",
};

function statusLabel(status: string): string {
  return STATUS_LABELS_PT[status as StatusValue] ?? status;
}

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
    color: "bg-slate-50 text-slate-500 border-slate-200",
  },
  Pending: {
    label: "Pendente",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
  "In Review": {
    label: "Em revisão",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
} as const;


const phases: Phase[] = [
  {
    name: "Comercial e Adjudicação",
    status: "Current",
    progress: 0,
    dates: "",
  },
  {
    name: "Briefing e Programa de Necessidades",
    status: "Upcoming",
    progress: 0,
    dates: "",
  },
  {
    name: "Estudo Funcional (Método Pro Sota)",
    status: "Upcoming",
    progress: 0,
    dates: "",
  },
  {
    name: "Estudo Prévio / Conceito Arquitectónico",
    status: "Upcoming",
    progress: 0,
    dates: "",
  },
  {
    name: "Anteprojecto / Licenciamento",
    status: "Upcoming",
    progress: 0,
    dates: "",
  },
  {
    name: "Projecto de Execução",
    status: "Upcoming",
    progress: 0,
    dates: "",
  },
  {
    name: "Assistência Técnica à Obra",
    status: "Upcoming",
    progress: 0,
    dates: "",
  },
];

export default function PhasesPage() {
  // Each item now belongs to a phase, so the lists can be scoped instead
  // of floating unattached to the process they belong to.
  const deliverables: StatusItem[] = [];

  const milestones: StatusItem[] = [];

  const currentIndex = Math.max(
    0, phases.findIndex((p) => p.status === "Current"),
  );
  const currentPhase = phases[currentIndex] as Phase | undefined;
  const overallProgress = computeOverallProgress(phases);

  // Clicking a phase in the timeline scopes the deliverables/milestones
  // below to that phase, defaulting to whichever phase is Current.
  const [selectedPhaseName, setSelectedPhaseName] = useState<
    string | undefined
  >(currentPhase?.name);
  const selectedPhase =
    phases.find((p) => p.name === selectedPhaseName) ?? currentPhase;

  const scopedDeliverables = useMemo(
    () => deliverables.filter((d) => d.phaseName === selectedPhase?.name),
    [selectedPhase],
  );
  const scopedMilestones = useMemo(
    () => milestones.filter((m) => m.phaseName === selectedPhase?.name),
    [selectedPhase],
  );

  function computeOverallProgress(phases: Phase[]) {
    if (!phases.length) return 0;

    const total = phases.reduce((sum, phase) => {
      if (phase.status === "Completed") return sum + 100;
      if (phase.status === "Current") return sum + phase.progress;
      return sum;
    }, 0);

    return Math.round(total / phases.length);
  }

  const config = STATUS[status as keyof typeof STATUS];

  return (
    <div className="p-8 md:p-8 space-y-6 text-slate-700 min-h-screen">
      {/* Header — primary action matches a fixed methodology: drill into
                the selected phase, rather than adding an arbitrary new one. */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fases</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Metodologia do projecto, {phases.length} fases
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={!selectedPhase}
            className="text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5"
          >
            Editar Fase
          </button>
          <button
            disabled={!selectedPhase}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 transition-colors text-white text-sm font-medium px-4 py-2.5 rounded-lg"
          >
            Ver detalhes da fase
          </button>
        </div>
      </div>

      {/* Progress — merged: overall % as a corner stat, current phase
                as the main content, instead of two cards repeating the same fact. */}
      <Card>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {currentPhase?.name ?? "Sem fase actual"}
            </h2>
            <p className="text-slate-500 text-sm font-mono mt-1">
              {currentPhase?.dates || "Datas a definir"}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
              {overallProgress}%
            </span>
            <p className="text-xs text-slate-400 mt-0.5">progresso geral</p>
          </div>
        </div>

        {currentPhase && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Conclusão da fase actual</span>
              <span className="font-mono font-medium text-slate-900">
                {currentPhase.progress}%
              </span>
            </div>
            <ProgressBar percent={currentPhase.progress} />
          </div>
        )}
      </Card>

      {/* Timeline — horizontal on larger screens, stacked on mobile so
                long phase names don't collide. Clicking a phase scopes the
                lists below. */}
      <Card className="p-6 md:p-8">
        <h2 className="font-semibold text-slate-900 mb-8 md:mb-10">
          Mapa de evolução
        </h2>
        {phases.length > 0 ? (
          <PhaseTimeline
            phases={phases}
            selectedPhaseName={selectedPhase?.name}
            onSelectPhase={setSelectedPhaseName}
          />
        ) : (
          <EmptyState message="Ainda não existem fases definidas para este projecto." />
        )}
      </Card>

      {/* Metrics — explicitly scoped, so it's clear these are project
                totals and not tied to whichever phase is selected above. */}
      <div>
        <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">
          Total do projecto
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric title="Documentos" value="0" />
          <Metric title="Tarefas" value="0" />
          <Metric title="Comentários" value="0" />
          <Metric title="Equipa" value="0" />
        </div>
      </div>

      {/* Deliverables + Milestones — now scoped to the selected phase,
                so it's clear which stage each item belongs to. */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Entregas</h3>
            <span className="text-xs text-slate-400">
              {selectedPhase?.name ?? "—"}
            </span>
          </div>
          {scopedDeliverables.length > 0 ? (
            <StatusList items={scopedDeliverables} />
          ) : (
            <EmptyState message="Sem entregas associadas a esta fase." />
          )}
        </Card>

        <Card>
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Etapas</h3>
            <span className="text-xs text-slate-400">
              {selectedPhase?.name ?? "—"}
            </span>
          </div>
          {scopedMilestones.length > 0 ? (
            <StatusList items={scopedMilestones} />
          ) : (
            <EmptyState message="Sem etapas associadas a esta fase." />
          )}
        </Card>
      </div>
    </div>
  );
}

function StatusList({ items }: { items: StatusItem[] }) {
  return (
    <div className="divide-y divide-slate-100">
      {items.map((item) => (
        <div
          key={item.name}
          className="flex justify-between items-center gap-3 py-3"
        >
          <span className="text-slate-700 text-sm">{item.name}</span>
          <StatusPill label={item.name} color={STATUS[item.status].color} />
        </div>
      ))}
    </div>
  );
}

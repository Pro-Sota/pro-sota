"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { PhaseTimeline } from "./PhaseTimeline";
import { Metric } from "./Metric";
import { StatusPill } from "./StatusPill";
import { EmptyState } from "./EmptyState";
import { ProgressBar } from "./ProgressBar";
import Loader from "@/app/components/loader";
import { Database } from "@/app/lib/supabase/models";

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

type Phase = Database["public"]["Tables"]["project_phases"]["Row"];

interface props {
    phases: Phase[];
}

export default function PhasesPageInner({ phases }: props) {

    const router = useRouter();
    const params = useParams();
    const projectId = params.projectId as string;


    const sortedPhases = useMemo(
        () =>
            [...phases].sort(
                (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
            ),
        [phases]
    );

  

    const deliverables: StatusItem[] = [];
    const milestones: StatusItem[] = [];

    const currentIndex = Math.max(
        0,
        phases.findIndex((p) => p.sort_order === 1)
    );
  const currentPhase =
        sortedPhases.find((phase) => phase.status === "in_progress") ??
        sortedPhases.find((phase) => phase.status === "not_started") ??
        sortedPhases[sortedPhases.length - 1];

    const overallProgress = computeOverallProgress(sortedPhases);

    const [selectedPhaseName, setSelectedPhaseName] = useState<
        string | undefined
    >(currentPhase?.name);
    const selectedPhase =
        phases.find((p) => p.name === selectedPhaseName) ?? currentPhase;

    const scopedDeliverables = useMemo(
        () => deliverables.filter((d) => d.phaseName === selectedPhase?.name),
        [selectedPhase]
    );
    const scopedMilestones = useMemo(
        () => milestones.filter((m) => m.phaseName === selectedPhase?.name),
        [selectedPhase]
    );

    function computeOverallProgress(phases: Phase[]) {
        if (!phases.length) return 0;
        const total = phases.reduce((sum, phase) => {
            if (phase.status === "Completed") return sum + 100;
            if (phase.status === "Current") return sum + (phase.progress ?? 0);
            return sum;
        }, 0);
        return Math.round(total / phases.length);
    }

    const handleViewDetails = () => {
        if (selectedPhase?.phase_id) {
            router.push(
                `/management/projects/${projectId}/phases/${selectedPhase.phase_id}`
            );
        }
    };

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                <div className="space-y-8 sm:space-y-10">
                    {/* Header */}
                    <div className="border-b border-gray-200 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
                                    Fases
                                </h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Metodologia do projecto · {phases.length} fases definidas
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleViewDetails}
                                    disabled={!selectedPhase}
                                    className="cursor-pointer font-medium inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg bg-[#BD9655] text-[#002950] hover:bg-[#BD9655]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                                >
                                    Add a phase
                                </button>
                                <button
                                    onClick={handleViewDetails}
                                    disabled={!selectedPhase}
                                    className="cursor-pointer font-medium inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg bg-[#BD9655] text-[#002950] hover:bg-[#BD9655]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                                >
                                    Ver detalhes da fase
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Current Phase Hero Card */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="border-b border-gray-200 px-6 sm:px-8 py-5 sm:py-6">
                            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                                        {currentPhase?.name ?? "Sem fase actual"}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-2 font-mono">
                                        {"Datas a definir"}
                                    </p>
                                </div>

                                <div className="flex items-baseline gap-6 sm:text-right">
                                    <div className="flex-1 sm:flex-none">
                                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                                            Progresso Geral
                                        </p>
                                        <p className="text-3xl sm:text-4xl font-bold text-gray-900 font-mono tabular-nums">
                                            {overallProgress}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {currentPhase && (
                            <div className="px-6 sm:px-8 py-6 sm:py-8">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-baseline">
                                        <label className="text-sm font-medium text-gray-700">
                                            Conclusão da fase actual
                                        </label>
                                        <span className="text-sm font-mono font-semibold text-gray-900">
                                            {currentPhase.progress}%
                                        </span>
                                    </div>
                                    <ProgressBar percent={currentPhase.progress ?? 0} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                        <div className="border-b border-gray-200 px-6 sm:px-8 py-5 sm:py-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Mapa de evolução
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Clique numa fase para ver os detalhes e entregas associadas
                            </p>
                        </div>

                        <div className="px-6 sm:px-8 py-6 sm:py-8">
                            {phases.length > 0 ? (
                                <PhaseTimeline
                                    phases={sortedPhases}
                                    selectedPhaseId={selectedPhase?.phase_id}
                                    onSelectPhaseAction={setSelectedPhaseName}
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
                            <Metric title="Documentos" value="0" />
                            <Metric title="Tarefas" value="0" />
                            <Metric title="Comentários" value="0" />
                            <Metric title="Equipa" value="0" />
                        </div>
                    </div>

                    {/* Deliverables & Milestones - Scoped to Selected Phase */}
                    <div>
                        <div className="mb-4 pb-3 border-b border-gray-200">
                            <div className="flex items-baseline justify-between gap-2">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                    Fase Selecionada
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                    {selectedPhase?.name ?? "—"}
                                </p>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Deliverables */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                <div className="border-b border-gray-200 px-6 py-4 sm:py-5">
                                    <h3 className="font-semibold text-gray-900">Entregas</h3>
                                </div>

                                <div className="px-6 py-5 sm:py-6">
                                    {scopedDeliverables.length > 0 ? (
                                        <StatusList items={scopedDeliverables} />
                                    ) : (
                                        <EmptyState message="Sem entregas associadas a esta fase." />
                                    )}
                                </div>
                            </div>

                            {/* Milestones */}
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                <div className="border-b border-gray-200 px-6 py-4 sm:py-5">
                                    <h3 className="font-semibold text-gray-900">Etapas</h3>
                                </div>

                                <div className="px-6 py-5 sm:py-6">
                                    {scopedMilestones.length > 0 ? (
                                        <StatusList items={scopedMilestones} />
                                    ) : (
                                        <EmptyState message="Sem etapas associadas a esta fase." />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}

function StatusList({ items }: { items: StatusItem[] }) {
    return (
        <div className="divide-y divide-gray-100">
            {items.map((item, idx) => (
                <div
                    key={item.name}
                    className={`flex justify-between items-center gap-3 py-3 ${idx === 0 ? "" : ""
                        }`}
                >
                    <span className="text-sm text-gray-700 flex-1 min-w-0">
                        {item.name}
                    </span>
                    <div className="flex-shrink-0">
                        <StatusPill label={item.name} color={STATUS[item.status].color} />
                    </div>
                </div>
            ))}
        </div>
    );
}
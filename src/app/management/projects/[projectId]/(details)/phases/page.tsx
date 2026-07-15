"use client";

import { useMemo, useState } from "react";
import { Phase } from "./types";

type StatusValue = "Completed" | "Current" | "Upcoming" | "In Review" | "Pending";

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
    return STATUS_LABELS_PT[status as StatusValue] ?? status
}

export default function PhasesPage({

}: {
   
}) {

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
        }
    ]

    // Each item now belongs to a phase, so the lists can be scoped instead
    // of floating unattached to the process they belong to.
    const deliverables: StatusItem[] = [
        { name: "Construction drawings", status: "Upcoming", phaseName: "Projecto de Execução" },
        { name: "Structural coordination", status: "Upcoming", phaseName: "Projecto de Execução" },
        { name: "MEP coordination", status: "Upcoming", phaseName: "Projecto de Execução" }
    ]

    const milestones: StatusItem[] = [
        { name: "Client Concept Approval", status: "Upcoming", phaseName: "Estudo Prévio / Conceito Arquitectónico" },
        { name: "Design Development Complete", status: "Upcoming", phaseName: "Anteprojecto / Licenciamento" },
        { name: "Authority Submission", status: "Upcoming", phaseName: "Anteprojecto / Licenciamento" },
        { name: "Tender Package Complete", status: "Upcoming", phaseName: "Projecto de Execução" }
    ]

    const currentIndex = Math.max(0, phases.findIndex(p => p.status === "Current"))
    const currentPhase = phases[currentIndex] as Phase | undefined
    const overallProgress = computeOverallProgress(phases)

    // Clicking a phase in the timeline scopes the deliverables/milestones
    // below to that phase, defaulting to whichever phase is Current.
    const [selectedPhaseName, setSelectedPhaseName] = useState<string | undefined>(currentPhase?.name)
    const selectedPhase = phases.find(p => p.name === selectedPhaseName) ?? currentPhase

    const scopedDeliverables = useMemo(
        () => deliverables.filter(d => d.phaseName === selectedPhase?.name),
        [selectedPhase]
    )
    const scopedMilestones = useMemo(
        () => milestones.filter(m => m.phaseName === selectedPhase?.name),
        [selectedPhase]
    )

    return (
        <div className="p-6 md:p-8 space-y-6 text-slate-700 bg-slate-50 min-h-screen">

            {/* Header — primary action matches a fixed methodology: drill into
                the selected phase, rather than adding an arbitrary new one. */}
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Fases
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Metodologia do projecto, {phases.length} fases
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium px-4 py-2.5 rounded-lg border border-slate-200"
                    >
                        + Nova Fase
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
                            <span className="font-mono font-medium text-slate-900">{currentPhase.progress}%</span>
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
                {phases.length > 0
                    ? (
                        <PhaseTimeline
                            phases={phases}
                            selectedPhaseName={selectedPhase?.name}
                            onSelectPhase={setSelectedPhaseName}
                        />
                    )
                    : <EmptyState message="Ainda não existem fases definidas para este projecto." />}
            </Card>

            {/* Metrics — explicitly scoped, so it's clear these are project
                totals and not tied to whichever phase is selected above. */}
            <div>
                <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Total do projecto</p>
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
                        <h3 className="font-semibold text-slate-900">
                            Entregas
                        </h3>
                        <span className="text-xs text-slate-400">{selectedPhase?.name ?? "—"}</span>
                    </div>
                    {scopedDeliverables.length > 0
                        ? <StatusList items={scopedDeliverables} />
                        : <EmptyState message="Sem entregas associadas a esta fase." />}
                </Card>

                <Card>
                    <div className="flex items-baseline justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">
                            Etapas
                        </h3>
                        <span className="text-xs text-slate-400">{selectedPhase?.name ?? "—"}</span>
                    </div>
                    {scopedMilestones.length > 0
                        ? <StatusList items={scopedMilestones} />
                        : <EmptyState message="Sem etapas associadas a esta fase." />}
                </Card>
            </div>

        </div>
    )
}

/* ---------- Derived data ---------- */

function computeOverallProgress(phases: Phase[]): number {
    if (phases.length === 0) return 0
    const completedCount = phases.filter(p => p.status === "Completed").length
    const currentIndex = phases.findIndex(p => p.status === "Current")
    const currentPartial = currentIndex >= 0 ? phases[currentIndex].progress / 100 : 0
    const stepsFilled = completedCount + currentPartial
    if (phases.length === 1) return Math.round(stepsFilled * 100)
    return Math.round((stepsFilled / (phases.length - 1)) * 100)
}

/* ---------- Shared pieces ---------- */

function Card({
    children,
    className = "",
}: {
    children: React.ReactNode,
    className?: string,
}) {
    return (
        <div className={`bg-white rounded-xl border border-slate-200 p-6 ${className}`}>
            {children}
        </div>
    )
}

function ProgressBar({ percent }: { percent: number }) {
    const clamped = Math.min(100, Math.max(0, percent))
    return (
        <div
            className="h-2.5 bg-slate-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={clamped}
            aria-valuemin={0}
            aria-valuemax={100}
        >
            <div
                className="h-full bg-yellow-600 rounded-full transition-all"
                style={{ width: `${clamped}%` }}
            />
        </div>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <p className="text-sm text-slate-400">{message}</p>
    )
}

function statusColors(status: string) {
    switch (status) {
        case "Completed":
            return "bg-green-50 text-green-700 border-green-200"
        case "Current":
        case "In Progress":
            return "bg-blue-50 text-blue-700 border-blue-200"
        case "In Review":
            return "bg-amber-50 text-amber-700 border-amber-200"
        case "Pending":
            return "bg-slate-100 text-slate-600 border-slate-200"
        case "Upcoming":
        default:
            return "bg-slate-50 text-slate-500 border-slate-200"
    }
}

function StatusPill({ status }: { status: string }) {
    return (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border h-fit whitespace-nowrap ${statusColors(status)}`}>
            {statusLabel(status)}
        </span>
    )
}

function StatusList({ items }: { items: StatusItem[] }) {
    return (
        <div className="divide-y divide-slate-100">
            {items.map(item => (
                <div key={item.name} className="flex justify-between items-center gap-3 py-3">
                    <span className="text-slate-700 text-sm">{item.name}</span>
                    <StatusPill status={item.status} />
                </div>
            ))}
        </div>
    )
}

function Metric({
    title,
    value,
}: {
    title: string,
    value: string,
}) {
    return (
        <div className="rounded-lg p-4 border bg-white border-slate-200">
            <p className="text-xs text-slate-500">{title}</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{value}</p>
        </div>
    )
}

function PhaseTimeline({
    phases,
    selectedPhaseName,
    onSelectPhase,
}: {
    phases: Phase[],
    selectedPhaseName?: string,
    onSelectPhase?: (name: string) => void,
}) {
    const completedCount = phases.filter(p => p.status === "Completed").length
    const currentIndex = phases.findIndex(p => p.status === "Current")
    const currentPartial = currentIndex >= 0 ? phases[currentIndex].progress / 100 : 0
    const stepsFilled = completedCount + currentPartial
    const fillPercent = phases.length > 1
        ? (stepsFilled / (phases.length - 1)) * 100
        : (stepsFilled > 0 ? 100 : 0)

    return (
        <div className="relative">
            {/* Track — desktop only, a vertical stacked list on mobile has no need for it */}
            <div className="hidden md:block absolute top-5 left-5 right-5 h-1 bg-slate-100 rounded-full" />
            <div
                className="hidden md:block absolute top-5 left-5 h-1 bg-amber-600 rounded-full transition-all"
                style={{ width: `calc(${Math.min(fillPercent, 100)}% - ${(Math.min(fillPercent, 100) / 100) * 40}px)` }}
            />

            <div className="relative flex flex-col md:flex-row items-stretch md:items-start justify-between gap-4 md:gap-0">
                {phases.map((phase, index) => {
                    const isSelected = phase.name === selectedPhaseName
                    return (
                        <button
                            key={phase.name}
                            onClick={() => onSelectPhase?.(phase.name)}
                            title={phase.name}
                            className={`
                                flex md:flex-1 flex-row md:flex-col items-center md:text-center
                                gap-3 md:gap-0 px-1 py-2 md:py-0 text-left md:text-center rounded-lg
                                transition-colors
                                ${isSelected ? "bg-amber-50 md:bg-transparent" : "hover:bg-slate-50 md:hover:bg-transparent"}
                            `}
                        >
                            <div
                                className={`
                                    relative shrink-0 mx-0 md:mx-auto w-10 h-10 rounded-full flex items-center justify-center
                                    text-sm font-bold z-10 border-2
                                    ${phase.status === "Completed"
                                        ? "bg-green-600 border-green-600 text-white"
                                        : phase.status === "Current"
                                            ? "bg-white border-amber-600 text-amber-600"
                                            : "bg-white border-slate-200 text-slate-400"}
                                    ${isSelected ? "ring-2 ring-amber-300 ring-offset-2" : ""}
                                `}
                            >
                                {phase.status === "Completed" ? "✓" : index + 1}
                            </div>
                            <div className="md:mt-3">
                                <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 md:line-clamp-2">
                                    {phase.name}
                                </h3>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">
                                    {phase.dates || "Datas a definir"}
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
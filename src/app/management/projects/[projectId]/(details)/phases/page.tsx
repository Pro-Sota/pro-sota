import { Phase } from "./types";

export default function PhasesPage() {

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

    const deliverables = [
        { name: "Construction drawings", status: "Upcoming" },
        { name: "Structural coordination", status: "Upcoming" },
        { name: "MEP coordination", status: "Upcoming" }
    ]

    const milestones = [
        { name: "Client Concept Approval", status: "Upcoming" },
        { name: "Design Development Complete", status: "Upcoming" },
        { name: "Authority Submission", status: "Upcoming" },
        { name: "Tender Package Complete", status: "Upcoming" }
    ]

    // Overall progress derived from phase list, same basis as before (68%)
    const overallProgress = 0

    const currentPhase = 0;

    return (
        <div className="p-6 md:p-8 space-y-6 text-slate-700 bg-slate-50 min-h-screen">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Fases
                    </h1>
                </div>

                <button className="bg-slate-900 hover:bg-slate-800 transition-colors text-white text-sm font-medium px-4 py-2.5 rounded-lg">
                    + Nova Fase
                </button>
            </div>

            {/* Overall Progress */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-baseline mb-3">
                    <h2 className="font-semibold text-slate-900">
                        Progresso geral
                    </h2>
                    <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                        {overallProgress}%
                    </span>
                </div>

                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-yellow-600 rounded-full transition-all"
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>

                <div className="mt-4 text-sm text-slate-500">
                    Fase actual
                    <span className="ml-2 font-medium text-slate-900">
                        {phases[currentPhase].name}
                    </span>
                </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
                <h2 className="font-semibold text-slate-900 mb-10">
                    Mapa de evolução
                </h2>
                <PhaseTimeline phases={phases} />
            </div>

            {/* Current Phase — header + progress on their own, so this card has one job */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {phases[currentPhase].name}
                        </h2>
                        <p className="text-slate-500 text-sm font-mono mt-1">
                            {phases[currentPhase].dates}
                        </p>
                    </div>
                    <StatusPill status="In Progress" />
                </div>

                <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600">Conclusão da fase</span>
                        <span className="font-mono font-medium text-slate-900"> {phases[currentPhase].progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-yellow-600 rounded-full"
                            style={{ width: `${phases[currentPhase].progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Metrics — own row, more breathing room, no longer squeezed under a list */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Metric title="Documentos" value="0" />
                <Metric title="Tarefas" value="0" />
                <Metric title="Comentários" value="0" accent />
                <Metric title="Equipa" value="0" />
            </div>

            {/* Deliverables + Milestones — matched two-column pair on desktop */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">
                        Entregas
                    </h3>
                    <StatusList items={deliverables} />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">
                        Etapas
                    </h3>
                    <StatusList items={milestones} />
                </div>
            </div>

        </div>
    )
}

/* ---------- Shared pieces ---------- */

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
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border h-fit ${statusColors(status)}`}>
            {status}
        </span>
    )
}

function StatusList({ items }: { items: { name: string, status: string }[] }) {
    return (
        <div className="divide-y divide-slate-100">
            {items.map(item => (
                <div key={item.name} className="flex justify-between items-center py-3">
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
    accent = false
}: {
    title: string,
    value: string,
    accent?: boolean
}) {
    return (
        <div className={`rounded-lg p-4 border ${accent ? "bg-amber-50 border-amber-100" : "bg-white border-slate-200"}`}>
            <p className="text-xs text-slate-500">{title}</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{value}</p>
        </div>
    )
}

function PhaseTimeline({
    phases
}: {
    phases: Phase[]
}) {
    // Overall fraction of the line to fill: completed phases + partial current phase
    const completedCount = phases.filter(p => p.status === "Completed").length
    const currentIndex = phases.findIndex(p => p.status === "Current")
    const currentPartial = currentIndex >= 0 ? phases[currentIndex].progress / 100 : 0
    const stepsFilled = completedCount + currentPartial
    const fillPercent = (stepsFilled / (phases.length - 1)) * 100

    return (
        <div className="relative">
            {/* Track */}
            <div className="absolute top-5 left-5 right-5 h-1 bg-slate-100 rounded-full" />
            <div
                className="absolute top-5 left-5 h-1 bg-amber-600 rounded-full transition-all"
                style={{ width: `calc(${Math.min(fillPercent, 100)}% - ${(Math.min(fillPercent, 100) / 100) * 40}px)` }}
            />

            <div className="relative flex items-start justify-between">
                {phases.map((phase, index) => (
                    <div key={phase.name} className="flex-1 text-center px-1">
                        <div
                            className={`
                                relative mx-auto w-10 h-10 rounded-full flex items-center justify-center
                                text-sm font-bold z-10 border-2
                                ${phase.status === "Completed"
                                    ? "bg-green-600 border-green-600 text-white"
                                    : phase.status === "Current"
                                        ? "bg-white border-amber-600 text-amber-600"
                                        : "bg-white border-slate-200 text-slate-400"}
                            `}
                        >
                            {phase.status === "Completed" ? "✓" : index + 1}
                        </div>
                        <h3 className="mt-3 text-sm font-semibold text-slate-900">
                            {phase.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {phase.dates}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
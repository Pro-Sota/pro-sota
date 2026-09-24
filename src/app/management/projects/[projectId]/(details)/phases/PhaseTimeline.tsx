"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Database } from "@/app/lib/supabase/models";

type Phase = Database["public"]["Tables"]["project_phases"]["Row"];

type Props = {
  phases: Phase[];
  selectedPhaseId?: string;
  onSelectPhaseAction?: (phaseId: string) => void;
};

const STATUS_STYLES = {
  completed: {
    circle: "bg-green-600 border-green-600 text-white",
  },
  in_progress: {
    circle: "bg-white border-[#BD9655] text-[#BD9655]",
  },
  not_started: {
    circle: "bg-white border-slate-200 text-slate-400",
  },
} as const;

export function PhaseTimeline({
  phases,
  selectedPhaseId,
  onSelectPhaseAction,
}: Props) {
  const router = useRouter();

  const sortedPhases = [...phases].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  const completedCount = sortedPhases.filter(
    (phase) => phase.status === "completed"
  ).length;

  const currentPhase = sortedPhases.find(
    (phase) => phase.status === "in_progress"
  );

  const currentIndex = currentPhase
    ? sortedPhases.findIndex(
        (phase) => phase.phase_id === currentPhase.phase_id
      )
    : -1;

  const currentProgress = currentPhase?.progress ?? 0;

  const fillPercent =
    sortedPhases.length <= 1
      ? completedCount > 0 || currentProgress > 0
        ? 100
        : 0
      : Math.min(
          100,
          ((completedCount + currentProgress / 100) /
            (sortedPhases.length - 1)) *
            100
        );

  if (!sortedPhases.length) {
    return null;
  }

  return (
    <div className="relative">
      {/* Desktop track */}
      <div className="hidden md:block absolute top-5 left-5 right-5 h-1 bg-slate-100 rounded-full" />

      <div
        className="hidden md:block absolute top-5 left-5 h-1 bg-[#BD9655] rounded-full transition-all duration-500"
        style={{
          width: `calc(${Math.min(fillPercent, 100)}% - ${
            (Math.min(fillPercent, 100) / 100) * 40
          }px)`,
        }}
      />

      <div className="relative flex flex-col md:flex-row items-stretch md:items-start justify-between gap-4 md:gap-0">
        {sortedPhases.map((phase, index) => {
          const isSelected = phase.phase_id === selectedPhaseId;

          const styles =
            STATUS_STYLES[phase.status as keyof typeof STATUS_STYLES] ??
            STATUS_STYLES.not_started;

          return (
            <button
              key={phase.phase_id}
              type="button"
              onClick={() => {
                onSelectPhaseAction?.(phase.phase_id);
              }}
              onDoubleClick={() => {
                router.push(
                  `/management/projects/${phase.project_id}/phases/${phase.phase_id}`
                );
              }}
              title={`${phase.name} — duplo clique para abrir`}
              className={`
                cursor-pointer
                flex md:flex-1 flex-row md:flex-col items-center
                md:text-center gap-3 md:gap-0 px-2 py-3 md:py-0
                text-left md:text-center rounded-lg
                transition-colors
                ${
                  isSelected
                    ? "bg-amber-50 md:bg-transparent"
                    : "hover:bg-slate-50 md:hover:bg-transparent"
                }
              `}
            >
              <div
                className={`
                  relative shrink-0 mx-0 md:mx-auto
                  w-10 h-10 rounded-full flex items-center
                  justify-center text-sm font-bold z-10 border-2
                  ${styles.circle}
                  ${
                    isSelected
                      ? "ring-2 ring-[#BD9655] ring-offset-2"
                      : ""
                  }
                `}
              >
                {phase.status === "completed" ? (
                  <Check className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>

              <div className="md:mt-3 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                  {phase.name}
                </h3>

                <p className="text-xs text-slate-400 font-mono mt-1">
                  {phase.planned_end ?? "Datas a definir"}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {phase.progress ?? 0}%
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
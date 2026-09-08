"use client";

import { Database } from "@/app/lib/supabase/models";
import {useRouter} from "next/navigation";

type Phase = Database["public"]["Tables"]["phases"]["Row"];



export function PhaseTimeline({
  phases, selectedPhaseName, onSelectPhaseAction,
}: {
  phases: Phase[];
  selectedPhaseName?: string;
  onSelectPhaseAction?: (name: string) => void;
}) {

  const router = useRouter();
  const completedCount = phases.filter((p) => p.status === "Completed").length;
  const currentIndex = phases.findIndex((p) => p.status === "Current");
  const currentPartial = currentIndex >= 0 ? (phases[currentIndex].progress ?? 0) / 100 : 0;
  const stepsFilled = completedCount + currentPartial;
  const fillPercent = phases.length > 1
    ? (stepsFilled / (phases.length - 1)) * 100
    : stepsFilled > 0
      ? 100
      : 0;

  return (
    <div className="relative">
      {/* Track — desktop only, a vertical stacked list on mobile has no need for it */}
      <div className="hidden md:block absolute top-5 left-5 right-5 h-1 bg-slate-100 rounded-full" />
      <div
        className="hidden md:block absolute top-5 left-5 h-1 bg-amber-600 rounded-full transition-all"
        style={{
          width: `calc(${Math.min(fillPercent, 100)}% - ${(Math.min(fillPercent, 100) / 100) * 40}px)`,
        }} />

      <div className="relative flex flex-col md:flex-row items-stretch md:items-start justify-between gap-4 md:gap-0">
        {phases.map((phase, index) => {
          const isSelected = phase.name === selectedPhaseName;
          return (
            <button
              key={phase.name}
              onClick={() => onSelectPhaseAction?.(phase.name)}
              onDoubleClick={() => router.push(`/management/projects/${phase.project_id}/phases/${phase.phase_id}`)}
              title={phase.name}
              className={` cursor-pointer
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
                  {phase.planned_end || "Datas a definir"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

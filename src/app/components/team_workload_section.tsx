import { useRouter } from "next/navigation";
import EmptyState from "./empty_state_cards";
import { Users, Clock } from "lucide-react";
import { TeamWorkload } from "@/services/dashboard";

interface TeamWorkloadSectionProps {
  workload: TeamWorkload[];
}

function TeamWorkloadSection({ workload }: TeamWorkloadSectionProps) {
  const router = useRouter();

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Carga da Equipa
          </h2>

          <button
            onClick={() => router.push("/management/team")}
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Ver equipa
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {workload.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Sem dados da equipa"
            description="A distribuição de trabalho aparecerá aqui."
          />
        ) : (
          <div className="space-y-6">
            {workload.map((member) => (
              <div key={member.user_id}>
                {/* Member information */}
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-semibold text-blue-700">
                      {member.name
                        .split(" ")
                        .map((name:string) => name[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {member.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {member.total_tasks}{" "}
                        {member.total_tasks === 1 ? "tarefa" : "tarefas"}
                        {member.hours_remaining > 0 && (
                          <>
                            {" "}
                            • {member.hours_remaining}h restantes
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-gray-900">
                    {member.workload_percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gray-800 to-gray-900 transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        Math.max(member.workload_percentage, 0),
                        100,
                      )}%`,
                    }}
                  />
                </div>

                {/* Hours and task status */}
                <div className="flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-gray-700">
                        {member.actual_hours}h
                      </span>
                      <span className="text-gray-400">/</span>
                      <span>{member.estimated_hours}h estimado</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">
                      {member.completed_tasks} concluída
                      {member.completed_tasks !== 1 ? "s" : ""}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">
                      {member.pending_tasks} pendente
                      {member.pending_tasks !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Overwork indicator */}
                {member.actual_hours > member.estimated_hours && (
                  <div className="mt-2 flex items-center gap-1.5 rounded bg-orange-50 px-2 py-1 text-xs text-orange-700">
                    <Clock className="h-3 w-3" />
                    <span>
                      Excedeu por{" "}
                      {Math.round(
                        (member.actual_hours - member.estimated_hours) * 10,
                      ) / 10}
                      h
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default TeamWorkloadSection;
import { formatDate } from "@/app/lib/library";
import { Database } from "@/app/lib/supabase/models";
import { Briefcase, ArrowUpRight } from "lucide-react";

type Project = Database["public"]["Tables"]["projects"]["Row"];

const STATUS_STYLES: Record<string, string> = {
    "Em andamento": "bg-blue-50 text-blue-700 border-blue-100",
    "Concluído": "bg-green-50 text-green-700 border-green-100",
    "Pendente": "bg-orange-50 text-orange-700 border-orange-100",
    "Cancelado": "bg-red-50 text-red-700 border-red-100",
};

export default function ProjectCard({
    project,
}: {
    project: Project;
}) {
    const statusStyle =
        "bg-slate-100 text-slate-700 border-slate-200";

    return (
        <article className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg sm:p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition-colors duration-300 group-hover:bg-slate-900 sm:h-12 sm:w-12">
                    <Briefcase
                        size={20}
                        strokeWidth={2}
                        className="text-slate-700 transition-colors duration-300 group-hover:text-white"
                    />
                </div>

                <span
                    className={`max-w-[140px] truncate rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle}`}
                >
                    {project.status}
                </span>
            </div>

            {/* Body */}
            <div className="mt-5 flex-1 space-y-3">
                <div>
                    <h3
                        title={project.title}
                        className="line-clamp-1 text-base font-semibold text-gray-900 sm:text-lg"
                    >
                        {project.title}
                    </h3>

                    {project.description ? (
                        <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-gray-500">
                            {project.description}
                        </p>
                    ) : (
                        <p className="mt-2 min-h-[40px] text-sm text-gray-400">
                            Sem descrição disponível.
                        </p>
                    )}
                </div>

                <div className="border-t border-gray-100 pt-3">
                    <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-gray-500">
                            Prazo
                        </span>

                        <span
                            className={
                                project.end_date
                                    ? "font-medium text-gray-800"
                                    : "text-gray-400"
                            }
                        >
                            {project.end_date
                                ? formatDate(
                                      project.end_date.toLocaleString()
                                  )
                                : "Sem prazo"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-4 border-t border-gray-100 pt-4">
                <button
                    type="button"
                    aria-label={`Ver projecto ${project.title}`}
                    className="group/button flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
                >
                    <span>Ver projecto</span>

                    <ArrowUpRight
                        size={15}
                        strokeWidth={2.25}
                        className="transition-transform duration-200 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
                    />
                </button>
            </div>
        </article>
    );
}
import { formatDate } from "@/app/lib/library";
import { Database } from "@/app/lib/supabase/models";
import { Briefcase } from "lucide-react";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export default function ProjectCard({ project }: { project: Project }) {

    return (

        <article
            key={project.project_id}
            className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 transition-colors group-hover:bg-slate-900">
                    <Briefcase
                        size={18}
                        className="text-slate-700 transition-colors group-hover:text-white sm:size-20"
                    />
                </div>

                <span className="max-w-[120px] truncate rounded-full border bg-slate-800 px-3 py-1 text-xs font-semibold text-white">
                    {project.status}
                </span>
            </div>

            {/* Body */}
            <div className="mt-5 flex-1 space-y-3">
                <div>
                    <h3 className="line-clamp-1 text-base sm:text-lg font-semibold text-gray-900">
                        {project.title}
                    </h3>

                    {project.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                            {project.description}
                        </p>
                    )}
                </div>

                <div className="border-t border-gray-100 pt-3">
                    <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-gray-500">
                            Prazo
                        </span>

                        <span className="font-medium text-gray-800">
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
                    className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.98]"
                >
                    Ver projecto
                </button>
            </div>
        </article>
    )
}
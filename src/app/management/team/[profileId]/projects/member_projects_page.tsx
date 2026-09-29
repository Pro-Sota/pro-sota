"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    FolderKanban,
    MapPin,
    ExternalLink,
} from "lucide-react";

import type { Database } from "@/app/lib/supabase/models";
import type { TeamProject } from "@/services/team_project";

type Profile =
    Database["public"]["Tables"]["profiles"]["Row"];

type Props = {
    member: Profile;
    projects: TeamProject[];
};

const getFullName = (
    firstName?: string | null,
    lastName?: string | null
) => {
    return (
        [firstName, lastName]
            .filter(Boolean)
            .join(" ")
            .trim() || "Sem nome"
    );
};

export default function MemberProjectsPage({
    member,
    projects,
}: Props) {
    const router = useRouter();

    const name = getFullName(
        member.first_name,
        member.last_name
    );

    return (
        <div className="min-h-screen p-6 md:p-10">
            <div className="mx-auto max-w-6xl space-y-6">
                <button
                    type="button"
                    onClick={() =>
                        router.push(
                            `/management/team/${member.profile_id}`
                        )
                    }
                    className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <ArrowLeft size={16} />
                    Voltar ao perfil
                </button>

                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Projectos de {name}
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Projectos onde o colaborador
                        está actualmente integrado.
                    </p>
                </div>

                {projects.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-20 text-center">
                        <FolderKanban className="mx-auto h-10 w-10 text-slate-300" />

                        <h2 className="mt-4 font-semibold text-slate-900">
                            Nenhum projecto
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            Este colaborador ainda não
                            está associado a nenhum
                            projecto.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {projects.map(
                            (project) => (
                                <Link
                                    key={
                                        project.project_id
                                    }
                                    href={`/management/projects/${project.project_id}`}
                                    className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-slate-400">
                                                {
                                                    project.project_code
                                                }
                                            </p>

                                            <h2 className="mt-1 font-semibold text-slate-900">
                                                {
                                                    project.name
                                                }
                                            </h2>
                                        </div>

                                        <ExternalLink
                                            size={
                                                16
                                            }
                                            className="text-slate-300 transition group-hover:text-slate-600"
                                        />
                                    </div>

                                    <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                        {project.municipality && (
                                            <span className="flex items-center gap-1.5">
                                                <MapPin
                                                    size={
                                                        13
                                                    }
                                                />

                                                {
                                                    project.municipality
                                                }
                                            </span>
                                        )}

                                        {project.status && (
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1">
                                                {
                                                    project.status
                                                }
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
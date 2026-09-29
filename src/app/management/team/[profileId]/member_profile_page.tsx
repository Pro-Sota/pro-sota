import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeft,
    Mail,
    Phone,
    Briefcase,
    Building2,
    FolderKanban,
    Pencil,
    UserRound,
    ExternalLink,
} from "lucide-react";

import type { TeamMemberProfile } from "@/services/team_profile";

type Props = {
    member: TeamMemberProfile;
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

const getInitials = (
    firstName?: string | null,
    lastName?: string | null
) => {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
};

const getStatusLabel = (
    status?: string | null
) => {
    switch (status) {
        case "Active":
            return "Activo";

        case "Inactive":
            return "Inactivo";

        case "Pending":
            return "Pendente";

        case "Suspended":
            return "Suspenso";

        default:
            return "Sem estado";
    }
};

const getStatusClasses = (
    status?: string | null
) => {
    switch (status) {
        case "Active":
            return "bg-emerald-50 text-emerald-700";

        case "Inactive":
            return "bg-slate-100 text-slate-600";

        case "Pending":
            return "bg-amber-50 text-amber-700";

        case "Suspended":
            return "bg-red-50 text-red-700";

        default:
            return "bg-slate-100 text-slate-500";
    }
};

export default function MemberProfilePage({
    member,
}: Props) {
    const name = getFullName(
        member.first_name,
        member.last_name
    );

    const initials = getInitials(
        member.first_name,
        member.last_name
    );

    const projects = Array.from(
        new Map(
            member.projects.map((project) => [
                project.project_id,
                project,
            ])
        ).values()
    );

    const visibleProjects = projects.slice(0, 5);

    return (
        <div className="min-h-screen p-6 md:p-10">
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                        href="/management/team"
                        className="flex w-fit items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                    >
                        <ArrowLeft size={16} />
                        Voltar à equipa
                    </Link>

                    <Link
                        href={`/management/team/${member.profile_id}/edit`}
                        className="flex w-fit items-center gap-2 rounded-lg bg-[#002950] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#002950]/90"
                    >
                        <Pencil size={15} />
                        Editar colaborador
                    </Link>
                </div>

                {/* Profile */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 bg-slate-50/70 p-6 md:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            {member.profile_picture ? (
                                <Image
                                    src={member.profile_picture}
                                    alt={name}
                                    width={80}
                                    height={80}
                                    className="h-20 w-20 shrink-0 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#002950] text-xl font-semibold text-white">
                                    {initials || "?"}
                                </div>
                            )}

                            <div className="min-w-0">
                                <h1 className="text-2xl font-semibold text-slate-900">
                                    {name}
                                </h1>

                                <p className="mt-1 text-sm text-slate-500">
                                    {member.job_title ||
                                        "Função não definida"}
                                </p>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                        {member.department ||
                                            "Departamento não definido"}
                                    </span>

                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                            member.status
                                        )}`}
                                    >
                                        {getStatusLabel(
                                            member.status
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2">
                        <InfoItem
                            icon={Mail}
                            label="Email"
                            value={
                                member.email ||
                                "Não definido"
                            }
                        />

                        <InfoItem
                            icon={Phone}
                            label="Telefone"
                            value={
                                member.phone_number ||
                                "Não definido"
                            }
                        />

                        <InfoItem
                            icon={Briefcase}
                            label="Função"
                            value={
                                member.job_title ||
                                "Não definida"
                            }
                        />

                        <InfoItem
                            icon={Building2}
                            label="Departamento"
                            value={
                                member.department ||
                                "Não definido"
                            }
                        />
                    </div>
                </section>

                {/* Summary */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <SummaryCard
                        icon={FolderKanban}
                        label="Projectos"
                        value={projects.length}
                    />

                    <SummaryCard
                        icon={UserRound}
                        label="Estado"
                        value={getStatusLabel(
                            member.status
                        )}
                    />
                </div>

                {/* Projects */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 p-5">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Projectos
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Projectos onde este colaborador
                                está integrado.
                            </p>
                        </div>

                        {projects.length > 0 && (
                            <Link
                                href={`/management/team/${member.profile_id}/projects`}
                                className="text-sm font-medium text-[#002950] transition hover:underline"
                            >
                                Ver todos
                            </Link>
                        )}
                    </div>

                    {projects.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <FolderKanban
                                className="mx-auto h-8 w-8 text-slate-300"
                                strokeWidth={1.5}
                            />

                            <p className="mt-3 text-sm font-medium text-slate-700">
                                Nenhum projecto
                            </p>

                            <p className="mt-1 text-sm text-slate-400">
                                Este colaborador ainda não
                                está associado a projectos.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {visibleProjects.map(
                                (project) => (
                                    <Link
                                        key={
                                            project.project_id
                                        }
                                        href={`/management/projects/${project.project_id}`}
                                        className="group flex items-center justify-between gap-4 p-5 transition hover:bg-slate-50"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-slate-900">
                                                {
                                                    project.title
                                                }
                                            </p>

                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <span className="text-xs text-slate-400">
                                                    {
                                                        project.project_code
                                                    }
                                                </span>

                                                {project.status && (
                                                    <>
                                                        <span className="text-slate-300">
                                                            •
                                                        </span>

                                                        <span className="text-xs text-slate-500">
                                                            {
                                                                project.status
                                                            }
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <ExternalLink
                                            size={15}
                                            className="shrink-0 text-slate-300 transition group-hover:text-slate-600"
                                        />
                                    </Link>
                                )
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function InfoItem({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Mail;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3 border-b border-slate-100 p-5 md:[&:nth-child(odd)]:border-r">
            <Icon
                size={17}
                className="mt-0.5 shrink-0 text-slate-400"
            />

            <div className="min-w-0">
                <p className="text-xs text-slate-400">
                    {label}
                </p>

                <p className="mt-1 truncate text-sm font-medium text-slate-800">
                    {value}
                </p>
            </div>
        </div>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof FolderKanban;
    label: string;
    value: string | number;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">
                        {label}
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                        {value}
                    </p>
                </div>

                <Icon
                    size={21}
                    strokeWidth={1.7}
                    className="text-slate-400"
                />
            </div>
        </div>
    );
}
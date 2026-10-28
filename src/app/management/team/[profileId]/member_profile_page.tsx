
import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowUpRight,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    CircleUserRound,
    ExternalLink,
    FolderKanban,
    Mail,
    Pencil,
    Phone,
    ShieldCheck,
    Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { TeamMemberProfile } from "@/services/team_profile";

type Props = {
    member: TeamMemberProfile;
};

const getFullName = (
    firstName?: string | null,
    lastName?: string | null
) =>
    [firstName, lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || "Sem nome";

const getInitials = (
    firstName?: string | null,
    lastName?: string | null
) =>
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() ||
    "?";

const getStatusLabel = (status?: string | null) => {
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

const getStatusStyle = (status?: string | null) => {
    switch (status) {
        case "Active":
            return "bg-emerald-50 text-emerald-700 ring-emerald-600/15";
        case "Inactive":
            return "bg-slate-100 text-slate-600 ring-slate-500/15";
        case "Pending":
            return "bg-amber-50 text-amber-700 ring-amber-600/15";
        case "Suspended":
            return "bg-red-50 text-red-700 ring-red-600/15";
        default:
            return "bg-slate-100 text-slate-500 ring-slate-500/10";
    }
};

const getProjectStatusStyle = (status?: string | null) => {
    switch (status?.toLowerCase()) {
        case "concluído":
        case "concluido":
        case "completed":
            return "bg-emerald-50 text-emerald-700";
        case "em curso":
        case "in progress":
            return "bg-blue-50 text-blue-700";
        case "em pausa":
        case "paused":
            return "bg-amber-50 text-amber-700";
        case "em observação":
        case "em observacao":
            return "bg-orange-50 text-orange-700";
        default:
            return "bg-slate-100 text-slate-600";
    }
};

export default function MemberProfilePage({ member }: Props) {
    const name = getFullName(member.first_name, member.last_name);
    const initials = getInitials(member.first_name, member.last_name);

    const projects = Array.from(
        new Map(
            (member.projects ?? []).map((project) => [
                project.project_id,
                project,
            ])
        ).values()
    );

    const visibleProjects = projects.slice(0, 5);
    const permissionsUrl = `/management/team/${member.profile_id}/permissions`;
    const editUrl = `/management/team/${member.profile_id}/edit`;

    return (
        <main className="min-h-screen bg-[#F7F7F5] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/management/team"
                        className="inline-flex items-center gap-2 rounded-lg py-2 text-sm font-medium text-slate-500 transition hover:text-[#002950]"
                    >
                        <ArrowLeft size={16} />
                        Equipa
                    </Link>

                    <span className="text-xs font-medium text-slate-400">
                        Perfil do colaborador
                    </span>
                </div>

                {/* Profile header */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="h-1.5 bg-[#BD9655]" />

                    <div className="p-5 sm:p-7 lg:p-8">
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                                {/* Avatar */}
                                <div className="relative h-24 w-24 shrink-0">
                                    {member.profile_picture?.trim() ? (
                                        <Image
                                            src={member.profile_picture}
                                            alt={`Fotografia de ${name}`}
                                            width={96}
                                            height={96}
                                            className="h-24 w-24 rounded-2xl object-cover ring-1 ring-slate-200"
                                        />
                                    ) : (
                                        <div
                                            aria-label={`Iniciais de ${name}`}
                                            className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#002950] text-2xl font-semibold tracking-wide text-white"
                                        >
                                            {initials}
                                        </div>
                                    )}

                                    {member.status === "Active" && (
                                        <span
                                            className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-emerald-500"
                                            title="Colaborador activo"
                                        >
                                            <CheckCircle2
                                                size={13}
                                                className="text-white"
                                            />
                                        </span>
                                    )}
                                </div>

                                {/* Identity */}
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#BD9655]">
                                            Colaborador
                                        </span>

                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusStyle(member.status)}`}
                                        >
                                            {getStatusLabel(member.status)}
                                        </span>
                                    </div>

                                    <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight text-[#002950] sm:text-3xl">
                                        {name}
                                    </h1>

                                    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                                        <BriefcaseBusiness size={15} />
                                        {member.job_title || "Função não definida"}
                                        <span className="text-slate-300">/</span>
                                        <Building2 size={15} />
                                        {member.department || "Departamento não definido"}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 sm:flex-row xl:shrink-0">
                                <Link
                                    href={permissionsUrl}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#002950]/30 hover:bg-slate-50"
                                >
                                    <ShieldCheck size={16} />
                                    Permissões
                                </Link>

                                <Link
                                    href={editUrl}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#002950] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#003967] focus:outline-none focus:ring-2 focus:ring-[#002950]/30 focus:ring-offset-2"
                                >
                                    <Pencil size={15} />
                                    Editar colaborador
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Overview */}
                <section>
                    <div className="mb-3">
                        <h2 className="text-sm font-semibold text-slate-800">
                            Resumo
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                        <SummaryCard
                            icon={FolderKanban}
                            label="Projectos associados"
                            value={projects.length}
                            description={
                                projects.length === 1
                                    ? "Projecto na equipa"
                                    : "Projectos na equipa"
                            }
                        />

                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm sm:min-w-56">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                                <CircleUserRound
                                    size={17}
                                    className="text-slate-500"
                                />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-slate-500">
                                    Estado da conta
                                </p>

                                <span
                                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusStyle(member.status)}`}
                                >
                                    {getStatusLabel(member.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Details */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-[#002950]">
                            <Users size={19} />
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Informação profissional
                            </h2>
                            <p className="mt-0.5 text-sm text-slate-500">
                                Dados de contacto e integração na empresa.
                            </p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2">
                        <InfoItem
                            icon={Mail}
                            label="Email"
                            value={member.email || "Não definido"}
                            href={
                                member.email
                                    ? `mailto:${member.email}`
                                    : undefined
                            }
                        />

                        <InfoItem
                            icon={Phone}
                            label="Telefone"
                            value={member.phone_number || "Não definido"}
                            href={
                                member.phone_number
                                    ? `tel:${member.phone_number}`
                                    : undefined
                            }
                        />

                        <InfoItem
                            icon={BriefcaseBusiness}
                            label="Função"
                            value={member.job_title || "Não definida"}
                        />

                        <InfoItem
                            icon={Building2}
                            label="Departamento"
                            value={member.department || "Não definido"}
                        />
                    </div>
                </section>

                {/* Projects */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-[#002950]">
                                <FolderKanban size={19} />
                            </div>

                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Projectos associados
                                </h2>
                                <p className="mt-0.5 text-sm text-slate-500">
                                    Projectos em que {member.first_name || "este colaborador"} participa.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pl-[52px] sm:pl-0">
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold tabular-nums text-slate-600">
                                {projects.length} {projects.length === 1 ? "projecto" : "projectos"}
                            </span>

                            {projects.length > 5 && (
                                <Link
                                    href={`/management/team/${member.profile_id}/projects`}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-[#002950] hover:underline"
                                >
                                    Ver todos
                                    <ArrowUpRight size={15} />
                                </Link>
                            )}
                        </div>
                    </div>

                    {projects.length === 0 ? (
                        <div className="px-6 py-14 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                                <FolderKanban size={25} strokeWidth={1.5} />
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-slate-800">
                                Sem projectos associados
                            </h3>

                            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                                Os projectos em que este colaborador estiver
                                integrado serão apresentados aqui.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {visibleProjects.map((project) => (
                                <Link
                                    key={project.project_id}
                                    href={`/management/projects/${project.project_id}`}
                                    className="group flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50/80 sm:px-6"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-[#002950] transition group-hover:border-[#002950]/15 group-hover:bg-white">
                                        <FolderKanban size={19} strokeWidth={1.7} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-800 transition group-hover:text-[#002950]">
                                            {project.title || "Projecto sem título"}
                                        </p>

                                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                            {project.project_code && (
                                                <span className="text-xs text-slate-400">
                                                    {project.project_code}
                                                </span>
                                            )}

                                            {project.status && (
                                                <span
                                                    className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${getProjectStatusStyle(project.status)}`}
                                                >
                                                    {project.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <ExternalLink
                                        size={16}
                                        className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#002950]"
                                    />
                                </Link>
                            ))}
                        </div>
                    )}

                    {projects.length > 0 && projects.length <= 5 && (
                        <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
                            <p className="text-xs text-slate-400">
                                A apresentar {projects.length} de {projects.length} projectos associados.
                            </p>
                        </div>
                    )}

                    {projects.length > 5 && (
                        <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
                            <p className="text-xs text-slate-400">
                                A apresentar 5 de {projects.length} projectos associados.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

function InfoItem({
    icon: Icon,
    label,
    value,
    href,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
    href?: string;
}) {
    const content = (
        <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition group-hover:bg-[#002950]/5 group-hover:text-[#002950]">
                <Icon size={17} strokeWidth={1.7} />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-400">
                    {label}
                </p>

                <p className="mt-1 break-words text-sm font-medium text-slate-800">
                    {value}
                </p>
            </div>

            {href && (
                <ArrowUpRight
                    size={15}
                    className="mt-1 shrink-0 text-slate-300 transition group-hover:text-[#002950]"
                />
            )}
        </>
    );

    return (
        <div className="border-b border-slate-100 p-4 last:border-b-0 sm:p-5 [&:nth-child(odd)]:sm:border-r">
            {href ? (
                <a
                    href={href}
                    className="group flex min-w-0 items-start gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#002950]/30"
                >
                    {content}
                </a>
            ) : (
                <div className="flex min-w-0 items-start gap-3">
                    {content}
                </div>
            )}
        </div>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
    description,
}: {
    icon: LucideIcon;
    label: string;
    value: string | number;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-slate-300 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                        {label}
                    </p>

                    <p className="mt-2 break-words text-2xl font-semibold tracking-tight text-[#002950]">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        {description}
                    </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#002950]/5 text-[#002950]">
                    <Icon size={21} strokeWidth={1.7} />
                </div>
            </div>
        </div>
    );
}

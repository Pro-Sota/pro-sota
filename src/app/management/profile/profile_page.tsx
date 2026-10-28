
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Database } from "@/app/lib/supabase/models";
import {
    Calendar,
    CheckCircle2,
    CircleHelp,
    FolderOpen,
    Mail,
    Pencil,
    Phone,
    BriefcaseBusiness,
    ArrowRight,
} from "lucide-react";

import ProjectCard from "./components/project_card";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];

type Props = {
    profile: Profile;
    projects: Project[];
};

const MAX_VISIBLE_PROJECTS = 6;

function formatDate(dateString: string | null): string {
    if (!dateString) return "—";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("pt-PT", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Africa/Luanda",
    }).format(date);
}

function normalizeStatus(status: string | null | undefined): string {
    return (status ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

function isCompleted(status: string | null | undefined): boolean {
    return ["concluido", "concluida", "completed", "complete"].includes(
        normalizeStatus(status),
    );
}

function isArchived(project: Project): boolean {
    return (
        "archived_at" in project &&
        Boolean(project.archived_at)
    );
}

export default function ProfileClient({
    profile,
    projects,
}: Props) {
    const [imageFailed, setImageFailed] = useState(false);

    const fullName = [
        profile.first_name?.trim(),
        profile.last_name?.trim(),
    ]
        .filter(Boolean)
        .join(" ");

    const initials =
        fullName
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "—";

    // Derive project metrics from the projects provided by the server.
    const uniqueProjects = Array.from(
        new Map(
            projects.map((project) => [
                project.project_id,
                project,
            ]),
        ).values(),
    );

    const visibleProjects = uniqueProjects.slice(
        0,
        MAX_VISIBLE_PROJECTS,
    );

    const activeProjects = uniqueProjects.filter(
        (project) =>
            !isArchived(project) &&
            !isCompleted(project.status),
    ).length;

    const completedProjects = uniqueProjects.filter(
        (project) =>
            !isArchived(project) &&
            isCompleted(project.status),
    ).length;

    const stats = [
        {
            title: "Projectos Activos",
            value: activeProjects,
            icon: FolderOpen,
            description: "Projectos não concluídos",
        },
        {
            title: "Concluídos",
            value: completedProjects,
            icon: CheckCircle2,
            description: "Projectos finalizados",
        },
        {
            title: "Comentários pendentes",
            value: "—" as const,
            icon: CircleHelp,
            description: "Dados não disponibilizados",
        },
        {
            title: "Experiência",
            value: "—" as const,
            icon: BriefcaseBusiness,
            description: "Anos de experiência profissional",
        },
    ];

    const info = [
        {
            icon: Mail,
            label: "Email",
            value: profile.email?.trim() || "—",
        },
        {
            icon: Phone,
            label: "Telefone",
            value: profile.phone_number?.trim() || "—",
        },
        {
            icon: Calendar,
            label: "Data de Adesão",
            value: formatDate(profile.created_at),
        },
    ];

    // Support an optional profile_picture column without requiring
    // it to be present in the generated Supabase type.
    const profilePicture =
        "profile_picture" in profile &&
        typeof profile.profile_picture === "string"
            ? profile.profile_picture.trim()
            : "";

    const showProfilePicture =
        Boolean(profilePicture) && !imageFailed;

    return (
        <main className="min-h-screen p-4 sm:p-6 md:p-10">
            <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
                {/* Profile header */}
                <section
                    aria-labelledby="profile-heading"
                    className="rounded-3xl bg-white p-5 shadow-sm sm:p-8"
                >
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                            <div
                                className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#BD9655] text-2xl font-semibold text-[#002950] sm:h-24 sm:w-24 sm:text-3xl"
                                aria-label={`Foto de ${fullName || "utilizador"}`}
                            >
                                {showProfilePicture ? (
                                    <Image
                                        src={profilePicture}
                                        alt={`Foto de perfil de ${fullName || "utilizador"}`}
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                        onError={() => setImageFailed(true)}
                                    />
                                ) : (
                                    <span aria-hidden="true">
                                        {initials}
                                    </span>
                                )}
                            </div>

                            <div className="min-w-0">
                                <h1
                                    id="profile-heading"
                                    className="break-words text-2xl font-medium text-[#002950] sm:text-3xl md:text-4xl"
                                >
                                    {fullName || "Utilizador"}
                                </h1>

                                <p className="mt-2 break-words text-sm text-gray-500">
                                    {profile.department || "Departamento não definido"}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Membro desde {formatDate(profile.created_at)}
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/management/profile/edit"
                            aria-label="Editar perfil"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#BD9655] px-5 py-3 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                        >
                            <Pencil size={16} aria-hidden="true" />
                            Editar perfil
                        </Link>
                    </div>
                </section>

                {/* Statistics */}
                <section
                    aria-label="Estatísticas do perfil"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {stats.map((item) => {
                        const Icon = item.icon;

                        return (
                            <article
                                key={item.title}
                                className="rounded-2xl bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                        {item.title}
                                    </p>

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#BD9655]/15 text-[#002950]">
                                        <Icon
                                            size={18}
                                            aria-hidden="true"
                                        />
                                    </div>
                                </div>

                                <p className="mt-4 text-3xl font-semibold tabular-nums text-[#002950] sm:text-4xl">
                                    {item.value}
                                </p>

                                <p className="mt-2 text-xs text-gray-400">
                                    {item.description}
                                </p>
                            </article>
                        );
                    })}
                </section>

                {/* Personal information and projects */}
                <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
                    {/* Personal information */}
                    <section
                        aria-labelledby="personal-information-heading"
                        className="min-w-0 rounded-3xl bg-white p-5 sm:p-7 xl:col-span-1"
                    >
                        <h2
                            id="personal-information-heading"
                            className="mb-7 text-xl font-medium text-[#002950]"
                        >
                            Informação pessoal
                        </h2>

                        <div className="grid gap-6">
                            {info.map(({ icon: Icon, label, value }) => (
                                <div
                                    key={label}
                                    className="flex min-w-0 items-start gap-4"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200">
                                        <Icon
                                            size={18}
                                            className="text-gray-600"
                                            aria-hidden="true"
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                            {label}
                                        </p>

                                        <p className="mt-1 break-words text-sm font-medium text-gray-900">
                                            {value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Assigned projects */}
                    <section
                        aria-labelledby="assigned-projects-heading"
                        className="min-w-0 rounded-3xl bg-white p-5 sm:p-7 xl:col-span-2"
                    >
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 sm:mb-8">
                            <div>
                                <h2
                                    id="assigned-projects-heading"
                                    className="text-xl font-medium text-[#002950]"
                                >
                                    Projectos atribuídos
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {uniqueProjects.length}{" "}
                                    {uniqueProjects.length === 1
                                        ? "projecto"
                                        : "projectos"}
                                </p>
                            </div>

                            <Link
                                href="/management/projects"
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:border-[#BD9655] hover:text-[#002950] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950] focus-visible:ring-offset-2"
                            >
                                Ver todos
                                <ArrowRight
                                    size={15}
                                    aria-hidden="true"
                                />
                            </Link>
                        </div>

                        {visibleProjects.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {visibleProjects.map((project) => (
                                        <ProjectCard
                                            key={project.project_id}
                                            project={project}
                                        />
                                    ))}
                                </div>

                                {uniqueProjects.length >
                                    MAX_VISIBLE_PROJECTS && (
                                    <div className="mt-6 border-t border-gray-100 pt-4 text-center">
                                        <Link
                                            href="/management/projects"
                                            className="text-sm font-medium text-[#002950] underline decoration-[#BD9655] underline-offset-4 hover:text-[#BD9655] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]"
                                        >
                                            Ver os restantes{" "}
                                            {uniqueProjects.length -
                                                MAX_VISIBLE_PROJECTS}{" "}
                                            projectos
                                        </Link>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                    <FolderOpen
                                        size={26}
                                        className="text-gray-400"
                                        aria-hidden="true"
                                    />
                                </div>

                                <h3 className="text-lg font-medium text-gray-900">
                                    Sem projectos atribuídos
                                </h3>

                                <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                                    Ainda não existem projectos associados
                                    ao seu perfil. Os projectos atribuídos
                                    aparecerão aqui.
                                </p>

                                <Link
                                    href="/management/projects"
                                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#002950] underline decoration-[#BD9655] underline-offset-4 hover:text-[#BD9655] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002950]"
                                >
                                    Consultar projectos
                                    <ArrowRight
                                        size={15}
                                        aria-hidden="true"
                                    />
                                </Link>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

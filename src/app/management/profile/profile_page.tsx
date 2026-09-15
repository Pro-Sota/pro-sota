"use client";

import ProjectCard from "./components/project_card";
import { Database } from "@/app/lib/supabase/models";
import {
    Calendar,
    FolderOpen,
    Mail,
    Pencil,
    Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];

type Props = {
    profile: Profile;
    projects: Project[];
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";

    return new Date(dateString).toLocaleDateString("pt-PT", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export default function ProfileClient({
    profile,
    projects,
}: Props) {
    const router = useRouter();

    const fullName =
        `${profile.first_name || ""} ${profile.last_name || ""}`
            .trim();

    const initials = fullName
        .split(" ")
        .filter(Boolean)
        .map((name) => name[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const stats = [
        { title: "Projectos Activos", value: 0 },
        { title: "Concluído", value: 0 },
        { title: "Comentário pendentes", value: 0 },
        { title: "Experiência", value: 0 },
    ];

    const info = [
        {
            icon: Mail,
            label: "Email",
            value: profile.email || "—",
        },
        {
            icon: Phone,
            label: "Telefone",
            value: profile.phone_number || "—",
        },
        {
            icon: Calendar,
            label: "Data de Adesão",
            value: formatDate(profile.created_at),
        },
    ];

    return (
        <div className="min-h-screen p-6 md:p-10">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <section className="rounded-3xl bg-white p-8 shadow-sm">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#BD9655] text-3xl font-semibold text-[#002950]">
                                {initials || "—"}
                            </div>

                            <div>
                                <h1 className="mt-2 text-[#002950] text-4xl font-medium">
                                    {fullName || "Utilizador"}
                                </h1>

                                <p className="mt-1 text-sm text-gray-400">
                                    {profile.department || "—"}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                router.push("/management/profile/edit")
                            }
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#BD9655] px-6 py-3 text-sm font-medium text-[#002950] transition hover:bg-[#BD9655]/90"
                        >
                            <Pencil size={16} />
                            Editar perfil
                        </button>
                    </div>
                </section>

                {/* Stats */}
                <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-2xl bg-white p-6 shadow-xs transition hover:-translate-y-1"
                        >
                            <p className="text-xs uppercase tracking-widest text-gray-500">
                                {item.title}
                            </p>

                            <h3 className="mt-4 text-4xl font-serif">
                                {item.value}
                            </h3>
                        </div>
                    ))}
                </section>

                <div className="grid gap-6 xl:grid-cols-3">
                    {/* Information */}
                    <section className="rounded-3xl bg-white p-7 xl:col-span-1">
                        <h2 className="mb-8 text-xl font-serif">
                            Informação pessoal
                        </h2>

                        <div className="grid gap-6">
                            {info.map(
                                ({
                                    icon: Icon,
                                    label,
                                    value,
                                }) => (
                                    <div
                                        key={label}
                                        className="flex gap-4"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300">
                                            <Icon
                                                size={18}
                                                className="text-gray-700"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-gray-400">
                                                {label}
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-gray-900">
                                                {value}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </section>

                    {/* Projects */}
                    <section className="rounded-3xl bg-white p-7 xl:col-span-2">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-xl font-serif">
                                Projectos atribuídos
                            </h2>

                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/management/projects"
                                    )
                                }
                                className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:border-gray-400"
                            >
                                Ver todos
                            </button>
                        </div>

                        {projects.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                                {projects.map((project) => (
                                    <ProjectCard
                                        key={project.project_id}
                                        project={project}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                    <FolderOpen
                                        size={24}
                                        className="text-gray-400"
                                    />
                                </div>

                                <h3 className="text-lg font-medium text-gray-900">
                                    Sem projectos atribuídos
                                </h3>

                                <p className="mt-2 max-w-xs text-sm text-gray-500">
                                    Nenhum projecto foi atribuído
                                    ainda. Os projectos aparecerão aqui
                                    quando forem adicionados.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
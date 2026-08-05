"use client";

import ProjectCard from "./components/project_card";
import { Database } from "@/app/lib/supabase/models";
import { Calendar, FolderOpen, Mail, Pencil, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Project = Database["public"]["Tables"]["projects"]["Row"];

type Props = {
    profile: Profile;
    projects: Project[];
};

const tokens = {
    ink: "#F1F5F9",       // slate-100 — primary text
    paper: "#0F172A",      // slate-900 — page bg
    card: "#1E293B",       // slate-800 — card bg
    cardAlt: "#243244",    // between slate-800/700 — nested tiles
    slate700: "#334155",   // slate-700 — button + borders
    slate600: "#475569",   // slate-600 — hover borders
    stone: "#94A3B8",       // slate-400 — secondary text
    line: "#334155",        // slate-700 — hairlines
    bronze: "#C98A4B",      // warm accent, kept for icons/highlights
    bronzeBg: "#3A2E20",    // dark tint for icon chips
    olive: "#8FBF6B",
    oliveBg: "#26361F",
    amber: "#E0B84B",
    amberBg: "#3A2F14",
    rust: "#E0925C",
    rustBg: "#3A2313",
};

const statusStyles = {
    Completed: { bg: tokens.oliveBg, text: tokens.olive },
    Planning: { bg: tokens.amberBg, text: tokens.amber },
    "In Progress": { bg: tokens.rustBg, text: tokens.rust },
} as const;

type ProjectStatus = keyof typeof statusStyles;

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
    const [user, setUser] = useState(profile);
    const [userProjects, setUserProjects] = useState(projects);

    const router = useRouter();

    const stats = [
        { title: "Projectos Activos", value: 0 },
        { title: "Concluído", value: 0 },
        { title: "Comentário pendentes", value: 0 },
        { title: "Experiência", value: 0 },
    ];

    const info = [
        { icon: Mail, label: "Email", value: user.email || "—" },
        { icon: Phone, label: "Telefone", value: user.phone_number || "—" },
        { icon: Calendar, label: "Data de Adesão", value: formatDate(user.created_at || "") || "—" },
    ];

    return (
        <div className="min-h-screen p-6 md:p-10 bg-gray-50">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <section className="rounded-3xl p-8 shadow-sm bg-white">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-24 w-24 items-center justify-center rounded-2xl text-3xl font-semibold bg-gray-900 text-slate-200 font-serif">
                                {(`${user.first_name || ""} ${user.last_name || ""}`)
                                    .split(" ")
                                    .filter(Boolean)
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()}
                            </div>
                            <div>
                                <h1 className="mt-2 text-4xl font-medium font-serif">
                                    {user.first_name} {user.last_name}
                                </h1>
                                <p className="mt-1 text-sm text-gray-400">
                                    {user.department || "—"}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push("/management/profile/edit")}
                            className="cursor-pointer flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm text-slate-200 font-medium bg-gray-900 transition hover:opacity-90"
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
                            className="rounded-2xl p-6 transition hover:-translate-y-1 bg-white shadow-xs"
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
                    <section className="rounded-3xl p-7 xl:col-span-1 bg-white">
                        <h2 className="mb-8 text-xl font-serif">
                            Informação pessoal
                        </h2>

                        <div className="grid gap-6">
                            {info.map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300">
                                        <Icon size={18} className="text-gray-700" />
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-gray-400">
                                            {label}
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Projects */}
                    <section className="rounded-3xl p-7 xl:col-span-2 bg-white">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-xl font-serif">
                                Projectos atribuídos
                            </h2>

                            <button className="rounded-lg px-4 py-2 text-sm transition bg-white text-gray-700 border border-gray-300 cursor-pointer hover:border-gray-400">
                                Ver todos
                            </button>
                        </div>

                        {userProjects.length > 0 ? (
                            <div
                                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
                            >
                                {userProjects.map((project) => {
                                    const s =
                                        statusStyles[project.status as ProjectStatus] || {
                                            bg: tokens.slate700,
                                            text: tokens.slate700,
                                        };

                                    return (
                                       <ProjectCard key={project.project_id} project={project} />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                    <FolderOpen size={24} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    Sem projectos atribuídos
                                </h3>
                                <p className="mt-2 text-sm text-gray-500 max-w-xs">
                                    Nenhum projecto foi atribuído ainda. Os projectos aparecerão aqui quando forem adicionados.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );

}
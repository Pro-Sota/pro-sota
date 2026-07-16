"use client";

import { useState } from "react";
import Image from "next/image";
import { UserPlus, Settings} from "lucide-react";
import { useRouter } from "next/navigation";

type Role =
    | "project-manager"
    | "coordenador"
    | "architect"
    | "engineer"
    | "partner"

type Status = "disponível" | "ocupado" | "ausente";

type Profile = {
    id: string;
    name: string;
    image: string;
    role: Role;
    status: Status;
    tasks: unknown[];
};

type TeamCardProps = {
    profile: Profile;
    onViewProfile: (profile: Profile) => void;
};

const roleLabels: Record<Role, string> = {
    "project-manager": "Gestor do projecto",
    coordenador: "Coordenador",
    architect: "Arquitecto",
    engineer: "Engenheiro",
    partner:"Parceiros"
};

const statusStyles: Record<Status, { dot: string; label: string }> = {
    "disponível": { dot: "bg-emerald-500", label: "Disponível" },
    "ocupado": { dot: "bg-amber-500", label: "Ocupado" },
    "ausente": { dot: "bg-gray-400", label: "Ausente" },
};

export default function Team() {
    const [manageRolesOpen, setManageRolesOpen] = useState(false);
    const router = useRouter();

    const members: Profile[] = [
        {
            id: "1",
            name: "João Silva",
            image: "/images/profile.png",
            role: "project-manager",
            status: "disponível",
            tasks: []
        },
        {
            id: "2",
            name: "Maria Santos",
            image: "/images/profile.png",
            role: "architect",
            status: "ocupado",
            tasks: []
        },
        {
            id: "3",
            name: "Pedro Santos",
            image: "/images/profile.png",
            role: "engineer",
            status: "disponível",
            tasks: []
        },
        {
            id: "4",
            name: "Weza Sofia",
            image: "/images/profile.png",
            role: "architect",
            status: "ausente",
            tasks: []
        },
        {
            id: "5",
            name: "Lurdes Daniela",
            image: "/images/profile.png",
            role: "architect",
            status: "disponível",
            tasks: []
        },
    ];

    const sections: { title: string; role: Role }[] = [
        {
            title: "Gestor do projecto",
            role: "project-manager",
        },
        {
            title: "Coordenador",
            role: "coordenador",
        },

        {
            title: "Arquitectos",
            role: "architect",
        },
        {
            title: "Engenheiros",
            role: "engineer",
        },
        {
            title: "Parceiros",
            role: "partner",
        },
    ];

    const maxTasks = Math.max(1, ...members.map((m) => m.tasks.length));

    const handleViewProfile = (profile: Profile) => {
        router.push(`/management/team/profile/${profile.id}`)
    };

    return (
        <div className="h-full mx-auto max-w-7xl px-6 my-8 pb-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-800">Equipa</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setManageRolesOpen((open) => !open)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer"
                    >
                        <Settings size={18} />
                        Gerir funções
                    </button>
                    
                    <button
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer"
                    >
                        <UserPlus size={18} />
                        Adicionar membro
                    </button>
                </div>
            </div>

            {manageRolesOpen && (
                <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-800">Gerir funções</h2>
                        <button
                            onClick={() => setManageRolesOpen(false)}
                            className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            Fechar
                        </button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {sections.map((section) => {
                            const count = members.filter((m) => m.role === section.role).length;
                            return (
                                <div
                                    key={section.role}
                                    className="flex items-center justify-between py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{section.title}</p>
                                        <p className="text-xs text-gray-400">{count} membro{count !== 1 ? "s" : ""}</p>
                                    </div>
                                    <button className="text-sm text-slate-600 hover:text-slate-800 font-medium cursor-pointer">
                                        Editar
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {sections.map((section) => {
                const sectionMembers = members.filter(
                    (member) => member.role === section.role
                );

                return (
                    <div key={section.role} className="mb-10">
                        <div className="flex items-baseline justify-between border-b border-gray-100 pb-2">
                            <h2 className="font-semibold text-gray-800">{section.title}</h2>
                            <span className="text-xs text-gray-400">{sectionMembers.length}</span>
                        </div>

                        {sectionMembers.length === 0 ? (
                            <p className="mt-4 text-sm text-gray-400">
                                Nenhum membro nesta equipa.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
                                {sectionMembers.map((member) => (
                                    <TeamCard
                                        key={member.id}
                                        profile={member}
                                        onViewProfile={handleViewProfile}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })
            }

            <div className="mb-8 text-gray-700">
                <h2 className="font-semibold text-gray-800 border-b border-gray-100 pb-2 mb-4">
                    Actividades recentes
                </h2>

                <div className="rounded-lg border border-dashed border-gray-200 p-6 mb-8text-center text-sm text-gray-400">
                    Nenhuma actividade recente.
                </div>
            </div>
        </div>
    );
}

function TeamCard({ profile, onViewProfile }: TeamCardProps) {
    const status = statusStyles[profile.status];

    return (
        <div className="h-full flex flex-col justify-between w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                    <Image
                        src={profile.image}
                        alt={profile.name}
                        width={72}
                        height={72}
                        className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <span
                        className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${status.dot}`}
                        title={status.label}
                    />
                </div>
                <div className="flex flex-col min-w-0">
                    <h3 className="font-medium text-gray-800 text-base truncate">
                        {profile.name}
                    </h3>
                    <p className="text-sm text-gray-500">{roleLabels[profile.role]}</p>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {profile.tasks.length} tarefas
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                        </span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => onViewProfile(profile)}
                className="mt-4 w-full rounded-lg border border-gray-200 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-800 cursor-pointer"
            >
                Ver perfil
            </button>
        </div>
    );
}
"use client";

import Image from "next/image";
import { Role, Status, TeamCardProps} from "./types";

 function getInitials(
    firstName?: string | null,
    lastName?: string | null
) {
    return `${firstName?.trim().charAt(0) ?? ""}${lastName?.trim().charAt(0) ?? ""}`.toUpperCase();
}


const statusStyles: Record<Status, { dot: string; label: string; bg: string }> = {
    disponível: {
        dot: "bg-emerald-500",
        label: "Disponível",
        bg: "bg-emerald-50",
    },
    ocupado: {
        dot: "bg-amber-500",
        label: "Ocupado",
        bg: "bg-amber-50",
    },
    ausente: {
        dot: "bg-gray-400",
        label: "Ausente",
        bg: "bg-gray-50",
    },
};

const roleLabels: Record<Role, string> = {
    "project-manager": "Gestor do projecto",
    coordenador: "Coordenador",
    architect: "Arquitecto",
    engineer: "Engenheiro",
    partner: "Parceiros",
};  

export default function TeamCard({
    member,
    onViewProfile,
    onRemoveMember,
    roleColor = "from-slate-600 to-slate-400",
}: TeamCardProps & {
    onRemoveMember?: (profileId: string | number) => void;
}) {

    const status = statusStyles[member.status];

    return (
        <div className="group relative h-full w-full overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
            {/* Gradient Background Accent */}
            <div
                className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-r ${roleColor} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-10`}
            />

            <div className="relative z-10 flex h-full flex-col justify-between p-5">
                <div className="flex items-start gap-4">
                    {/* Profile image */}
                    <div className="relative shrink-0">
                        {member.avatar_url ? (
                            <Image
                                src={member.avatar_url}
                                alt={`${member.first_name} ${member.last_name}`}
                                width={72}
                                height={72}
                                className="h-16 w-16 rounded-full border-2 border-gray-200 object-cover transition group-hover:border-gray-300"
                            />
                        ) : (
                            <div
                                className={`flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 bg-gradient-to-br ${roleColor} text-lg font-semibold text-white transition group-hover:border-gray-300`}
                                aria-label={`${member.first_name} ${member.last_name}`}
                            >
                                {getInitials(member.first_name, member.last_name)}
                            </div>
                        )}

                    </div>


                    {/* Profile information */}
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold text-gray-900">
                            {member.first_name} {member.last_name}
                        </h3>

                        <p className="mt-0.5 text-sm text-gray-600">
                            {roleLabels[member.role]}
                        </p>

                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                            <span
                                className={`inline-flex w-fit items-center rounded-full px-2 py-1 text-xs font-medium text-gray-700`}
                            >

                                {member.tasks.length} tarefas
                            </span>


                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="mt-5 flex gap-2">
                    <button
                        type="button"
                        onClick={() => onViewProfile(member)}
                        className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-50 py-2 text-sm font-medium text-gray-700 transition hover:from-gray-100 hover:to-gray-100 hover:border-gray-300"
                    >
                        Ver perfil
                    </button>
                    {onRemoveMember && (
                        <button
                            type="button"
                            onClick={() => onRemoveMember(member.profile_id)}
                            className="cursor-pointer rounded-lg border border-red-200 bg-gradient-to-r from-red-50 to-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:from-red-100 hover:to-red-100 hover:border-red-300"
                            aria-label={`Remover ${member.first_name} ${member.last_name} do projecto`}
                            title="Remover do projecto"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
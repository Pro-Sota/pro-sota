"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import type { Role, Status, TeamCardProps } from "./types";

type Props = TeamCardProps & {
    onRemoveMember?: (profileId: string | number) => void;
};

const STATUS_STYLES: Record<
    Status,
    {
        dot: string;
        label: string;
        bg: string;
    }
> = {
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

const ROLE_LABELS: Record<Role, string> = {
    "Project Manager": "Gestor do projecto",
    Coordinator: "Coordenador",
    Architect: "Arquitecto",
    Engineer: "Engenheiro",
    Partner: "Parceiro",
};

function getInitials(
    firstName?: string | null,
    lastName?: string | null,
) {
    const firstInitial = firstName?.trim().charAt(0) ?? "";
    const lastInitial = lastName?.trim().charAt(0) ?? "";

    return `${firstInitial}${lastInitial}`.toUpperCase();
}

function getMemberName(
    firstName?: string | null,
    lastName?: string | null,
) {
    return [firstName, lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
}

export default function TeamCard({
    member,
    onViewProfile,
    onRemoveMember,
    roleColor = "from-slate-600 to-slate-400",
}: Props) {
    const { projectId } = useParams<{ projectId: string }>();

    const memberName = getMemberName(
        member.first_name,
        member.last_name,
    );

    const roleLabel = ROLE_LABELS[member.role];
    const status = STATUS_STYLES[member.status];

    const permissionsHref =
        `/management/projects/${projectId}/team/${member.profile_id}/permissions`;

    return (
        <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-xl">
            {/* Decorative role accent */}
            <div
                aria-hidden="true"
                className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-r ${roleColor} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-10`}
            />

            <div className="relative z-10 flex h-full flex-col p-5">
                {/* Member information */}
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        {member.avatar_url ? (
                            <Image
                                src={member.avatar_url}
                                alt={memberName}
                                width={64}
                                height={64}
                                className="h-16 w-16 rounded-full border-2 border-gray-200 object-cover transition-colors group-hover:border-gray-300"
                            />
                        ) : (
                            <div
                                className={`flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 bg-gradient-to-br ${roleColor} text-lg font-semibold text-white transition-colors group-hover:border-gray-300`}
                                aria-label={memberName}
                            >
                                {getInitials(
                                    member.first_name,
                                    member.last_name,
                                )}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold text-gray-900">
                            {memberName}
                        </h3>

                        <p className="mt-0.5 text-sm text-gray-600">
                            {roleLabel}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {/* Status */}
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-gray-700 ${status.bg}`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                />
                                {status.label}
                            </span>

                            {/* Tasks */}
                            <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                                {member.tasks.length}{" "}
                                {member.tasks.length === 1
                                    ? "tarefa"
                                    : "tarefas"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-5">
                    <div className="flex items-center gap-2">
                        <Link
                            href={permissionsHref}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#DCDCD6] bg-white px-3 py-2 text-sm font-medium text-[#002950] transition hover:border-[#BD9655] hover:text-[#BD9655]"
                        >
                            <ShieldCheck size={16} strokeWidth={1.8} />
                            Permissões
                        </Link>

                        {onRemoveMember && (
                            <button
                                type="button"
                                onClick={() => onRemoveMember(member.profile_id)}
                                className="inline-flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:border-red-300 hover:bg-red-100"
                                aria-label={`Remover ${memberName} do projecto`}
                                title="Remover do projecto"
                            >
                                <span aria-hidden="true">×</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}
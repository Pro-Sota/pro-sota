"use client";

import { useState } from "react";
import { X } from "lucide-react";

import type { Database } from "@/app/lib/supabase/models";
import CustomSelect from "@/app/components/custom_select";
import { addProjectTeamMemberAction } from "@/actions/project_team";
import {
    roles,
    roleTranslations,
} from "./types";
import type { Role } from "./types";

type Profile =
    Database["public"]["Tables"]["profiles"]["Row"];

type AddMemberModalProps = {
    projectId: string;
    members: Profile[];
    onClose: () => void;
    onMemberAdded?: () => void;
};

export default function AddMemberModal({
    projectId,
    members,
    onClose,
    onMemberAdded,
}: AddMemberModalProps) {
    const [selectedMemberId, setSelectedMemberId] =
        useState("");

    const [role, setRole] =
        useState<Role>("Architect");

    const [isAdding, setIsAdding] =
        useState(false);

    const [error, setError] =
        useState("");

    const availableProfiles = members.reduce(
        (acc, member) => {
            if (
                !acc.some(
                    (existingMember) =>
                        existingMember.profile_id ===
                        member.profile_id,
                )
            ) {
                acc.push(member);
            }

            return acc;
        },
        [] as Profile[],
    );

    const handleAddMember = async () => {
        if (
            !projectId ||
            !selectedMemberId ||
            isAdding
        ) {
            return;
        }

        setError("");
        setIsAdding(true);

        try {
            const result =
                await addProjectTeamMemberAction(
                    projectId,
                    selectedMemberId,
                    role,
                );

            if (!result.success) {
                setError(
                    result.error ??
                        "Não foi possível adicionar o membro.",
                );

                return;
            }

            onMemberAdded?.();
            onClose();
        } catch (error) {
            console.error(
                "Error adding project member:",
                error,
            );

            setError(
                "Ocorreu um erro ao adicionar o membro.",
            );
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-member-title"
        >
            <button
                type="button"
                aria-label="Fechar modal"
                onClick={onClose}
                className="absolute inset-0 cursor-default bg-black/20"
            />

            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-6 py-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2
                                id="add-member-title"
                                className="text-lg font-bold text-gray-900"
                            >
                                Adicionar membro
                            </h2>

                            <p className="mt-1.5 text-sm text-gray-600">
                                Expanda a sua equipa com novos
                                colaboradores.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Fechar"
                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="space-y-5 px-6 py-6">
                    <div>
                        <label
                            htmlFor="team-member"
                            className="block text-sm font-semibold text-gray-900"
                        >
                            Membro
                        </label>

                        <p className="mt-1 text-xs text-gray-500">
                            Seleccione o utilizador que pretende
                            adicionar.
                        </p>

                        <CustomSelect
                            id="team-member"
                            value={selectedMemberId}
                            onChange={(event) =>
                                setSelectedMemberId(
                                    event.target.value,
                                )
                            }
                            disabled={isAdding}
                            className="mt-3 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <option value="">
                                Seleccionar membro
                            </option>

                            {availableProfiles.map(
                                (member) => (
                                    <option
                                        key={
                                            member.profile_id
                                        }
                                        value={
                                            member.profile_id
                                        }
                                    >
                                        {[
                                            member.first_name,
                                            member.last_name,
                                        ]
                                            .filter(Boolean)
                                            .join(" ") ||
                                            member.email ||
                                            "Utilizador"}
                                    </option>
                                ),
                            )}
                        </CustomSelect>
                    </div>

                    <div>
                        <label
                            htmlFor="member-role"
                            className="block text-sm font-semibold text-gray-900"
                        >
                            Função
                        </label>

                        <CustomSelect
                            id="member-role"
                            value={role}
                            onChange={(event) =>
                                setRole(
                                    event.target.value as Role,
                                )
                            }
                            disabled={isAdding}
                            className="mt-3 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {roles.map((roleOption) => (
                                <option
                                    key={roleOption}
                                    value={roleOption}
                                >
                                    {
                                        roleTranslations[
                                            roleOption
                                        ]
                                    }
                                </option>
                            ))}
                        </CustomSelect>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isAdding}
                        className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={handleAddMember}
                        disabled={
                            !selectedMemberId ||
                            !projectId ||
                            isAdding
                        }
                        className="cursor-pointer rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:from-slate-700 hover:to-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isAdding
                            ? "A adicionar..."
                            : "Adicionar membro"}
                    </button>
                </div>
            </div>
        </div>
    );
}
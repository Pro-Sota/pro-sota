"use client";

import { useState } from "react";
import { Database } from "../../../../../../../models";
import { X } from "lucide-react";
import { Role, Status } from "./types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type AddMemberModalProps = {
    members: Profile[];
    onClose: () => void;
};

const roleLabels: Record<Role, string> = {
    "project-manager": "Gestor do projecto",
    coordenador: "Coordenador",
    architect: "Arquitecto",
    engineer: "Engenheiro",
    partner: "Parceiros",
};

export default function AddMemberModal({ members, onClose }: AddMemberModalProps) {
    const [selectedMemberId, setSelectedMemberId] = useState("");
    const [role, setRole] = useState<Role>("architect");
    const [status, setStatus] = useState<Status>("disponível");

    const handleAddMember = async () => {
        if (!selectedMemberId) return;

        const newMember = {
            profile_id: selectedMemberId,
            role,
            status,
        };

        console.log("Adding member:", newMember);
        // TODO: Call your API to insert into project_members
        onClose();
    };

    // Get unique profiles (to avoid duplicates if member is already in project)
    const availableProfiles = members.reduce(
        (acc, member) => {
            if (!acc.some((m) => m.profile_id === member.profile_id)) {
                acc.push(member);
            }
            return acc;
        },
        [] as Profile[],
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-member-title"
        >
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Fechar modal"
                onClick={onClose}
                className="absolute inset-0 cursor-default bg-black/20"
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
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
                                Expanda sua equipa com novos colaboradores.
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

                {/* Content */}
                <div className="space-y-5 px-6 py-6">
                    {/* Member */}
                    <div>
                        <label
                            htmlFor="team-member"
                            className="block text-sm font-semibold text-gray-900"
                        >
                            Membro
                        </label>

                        <p className="mt-1 text-xs text-gray-500">
                            Seleccione o utilizador que pretende adicionar.
                        </p>

                        <select
                            id="team-member"
                            value={selectedMemberId}
                            onChange={(event) => setSelectedMemberId(event.target.value)}
                            className="mt-3 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        >
                            <option value="">Seleccionar membro</option>

                            {availableProfiles.map((member) => (
                                <option key={member.profile_id} value={member.profile_id}>
                                    {member.first_name} {member.last_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Role */}
                    <div>
                        <label
                            htmlFor="member-role"
                            className="block text-sm font-semibold text-gray-900"
                        >
                            Função
                        </label>

                        <select
                            id="member-role"
                            value={role}
                            onChange={(event) => setRole(event.target.value as Role)}
                            className="mt-3 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        >
                            <option value="architect">Arquitecto</option>
                            <option value="engineer">Engenheiro</option>
                            <option value="partner">Parceiro</option>
                            <option value="coordenador">Coordenador</option>
                            <option value="project-manager">Gestor do projecto</option>
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={handleAddMember}
                        disabled={!selectedMemberId}
                        className="cursor-pointer rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:from-slate-700 hover:to-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Adicionar membro
                    </button>
                </div>
            </div>
        </div>
    );
}

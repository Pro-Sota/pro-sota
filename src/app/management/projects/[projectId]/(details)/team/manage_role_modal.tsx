"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Database } from "@/app/lib/supabase/models";
import CustomSelect from "@/app/components/custom_select";
import { TeamMember } from "./types";
import { updateProjectMemberRole } from "@/services/projects";
import { useParams } from "next/navigation";
import { assignProjectRole } from "@/services/project_team";

type Role =
    | "project-manager"
    | "coordenador"
    | "architect"
    | "engineer"
    | "partner";



type ManageRolesModalProps = {
    members: TeamMember[];
    onClose: () => void;
};



export default function ManageRolesModal({ members, onClose }: ManageRolesModalProps) {

    const params = useParams();

    const projectId = params.projectId as string;

    const [saving, setSaving] = useState(false);

    const currentManager = members.find(
        (member) => member.role === "Project Manager"
    );

    const currentCoordinator = members.find(
        (member) => member.role === "Coordinator"
    );

    const [managerId, setManagerId] = useState(
        currentManager?.profile_id ?? ""
    );

    const [coordinatorId, setCoordinatorId] = useState(
        currentCoordinator?.profile_id ?? ""
    );

    useEffect(() => {
        setManagerId(currentManager?.profile_id ?? "");
        setCoordinatorId(currentCoordinator?.profile_id ?? "");
    }, [currentManager?.profile_id, currentCoordinator?.profile_id]);

    const uniqueMembers = Array.from(
        new Map(
            members.map((member) => [member.profile_id, member])
        ).values()
    );

    const handleSave = async () => {
        setSaving(true);
        console.log("New manager:", managerId);
        console.log("New coordinator:", coordinatorId);

        await assignProjectRole(projectId, managerId, "Project Manager");
        await assignProjectRole(projectId, coordinatorId, "Coordinator");

        onClose();
    };


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="manage-responsibilities-title"
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
                                id="manage-responsibilities-title"
                                className="text-lg font-bold text-gray-900"
                            >
                                Gerir responsáveis
                            </h2>

                            <p className="mt-1.5 text-sm text-gray-600">
                                Defina o gestor e o coordenador da equipa.
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
                <div className="space-y-6 px-6 py-6">
                    {/* Manager */}
                    <div>
                        <label
                            htmlFor="project-manager"
                            className="block text-sm font-semibold text-gray-900"
                        >
                            Gestor do projecto
                        </label>

                        <p className="mt-1 text-xs text-gray-500">
                            Responsável pela gestão geral da equipa.
                        </p>

                        <CustomSelect
                            id="project-manager"
                            value={managerId}
                            onChange={(event) => setManagerId(event.target.value)}
                            className="mt-3 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        >
                            <option value="">Seleccionar gestor</option>

                            {uniqueMembers.map((member) => (
                                <option
                                    key={member.profile_id}
                                    value={member.profile_id}
                                >
                                    {member.first_name} {member.last_name}
                                </option>
                            ))}
                        </CustomSelect>
                    </div>

                    {/* Coordinator */}
                    <div>
                        <label
                            htmlFor="coordinator"
                            className="block text-sm font-semibold text-gray-900"
                        >
                            Coordenador
                        </label>

                        <p className="mt-1 text-xs text-gray-500">
                            Responsável pela coordenação da equipa.
                        </p>

                        <select
                            id="coordinator"
                            value={coordinatorId}
                            onChange={(event) => setCoordinatorId(event.target.value)}
                            className="mt-3 w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        >
                            <option value="">Seleccionar coordenador</option>

                            {uniqueMembers.map((member) => (
                                <option
                                    key={member.profile_id}
                                    value={member.profile_id}
                                >
                                    {member.first_name} {member.last_name}
                                </option>
                            ))}
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
                        onClick={handleSave}
                        disabled={saving}
                        className="cursor-pointer rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:from-slate-700 hover:to-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? "A guardar..." : "Guardar alterações"}
                    </button>
                </div>
            </div>
        </div>
    );
}
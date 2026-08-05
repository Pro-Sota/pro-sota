"use client";

import { Building2, Calendar, Users, FolderOpen } from "lucide-react";
import { LABELS } from "./chat_labels";
import InfoCard from "./info_card";
import EmptyProjectInfo from "./empty_project_state";

interface props {
    selectedChatId: string
}

export default function ProjectSideBar({ selectedChatId }: props) {

    return (

        <aside className="hidden w-80 shrink-0 flex-col border-l border-slate-200 xl:flex bg-white">
            {/* Header */}
            <div className="border-b border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900">{LABELS.projectInfo}</h2>
            </div>

            {/* Content */}
            {selectedChatId ? (
                <div className="space-y-4 overflow-y-auto flex-1 p-6">
                    <InfoCard
                        icon={<Building2 size={16} />}
                        label={LABELS.status}
                        value={LABELS.construction}
                    />

                    <InfoCard
                        icon={<Calendar size={16} />}
                        label={LABELS.deadline}
                        value="12 de outubro de 2026"
                    />

                    <InfoCard
                        icon={<Users size={16} />}
                        label={LABELS.team}
                        value={`8 ${LABELS.members}`}
                    />

                    <InfoCard
                        icon={<FolderOpen size={16} />}
                        label={LABELS.recentFiles}
                        value="FloorPlan_V5.pdf"
                    />

                    {/* Divider */}
                    <div className="h-px bg-slate-200 my-4" />

                    {/* Team Members Section */}
                    <div>
                        <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                            Membros da Equipa
                        </h3>
                        <div className="space-y-2">
                            {[
                                { name: "João Silva", role: "Arquiteto" },
                                { name: "Maria Santos", role: "Engenheiro" },
                            ].map((member, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-xs font-semibold text-white">
                                        {member.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">
                                            {member.name}
                                        </p>
                                        <p className="text-xs text-slate-500">{member.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            ) : (
                <EmptyProjectInfo />
            )}
        </aside>

    )
}
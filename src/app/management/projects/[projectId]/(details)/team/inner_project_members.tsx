"use client";

import { useEffect, useState } from "react";
import { UserPlus, Settings, Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

import { Database } from "@/app/lib/supabase/models";
import CustomSelect from "@/app/components/custom_select";
import ManageRolesModal from "./manage_role_modal";
import TeamCard from "./team_card";
import AddMemberModal from "./add_member_modal";
import { Role, TeamMember } from "./types";
import { removeTeamMember } from "@/services/project_team";
import { createClient } from "@/app/lib/supabase/client";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface TeamProps {
    projectId: string;
    projectMembers: TeamMember[];
    team: Profile[];
}

/**
 * Converts role values returned from the service into
 * the canonical role values used by the UI sections.
 *
 * The service returns kebab-case roles like:
 * "project-manager", "coordenador", "architect", "engineer", "partner"
 *
 * This function normalizes them to UI display format:
 * "Project Manager", "Coordinator", "Architect", "Engineer", "Partner"
 */
const normalizeRole = (role: string): Role => {
    // Replace underscores and hyphens with spaces, then lowercase
    const normalized = role.trim().toLowerCase().replace(/[_-]/g, " ");

    switch (normalized) {
        case "project manager":
        case "gestor do projecto":
        case "gestor projeto":
            return "Project Manager";

        case "coordinator":
        case "coordenador":
            return "Coordinator";

        case "architect":
        case "architecto":
        case "arquiteto":
            return "Architect";

        case "engineer":
        case "engenheiro":
            return "Engineer";

        case "partner":
        case "parceiro":
            return "Partner";

        default:
            return "Engineer"; // safe default
    }
};

export default function Team({
    projectId,
    projectMembers,
    team,
}: TeamProps) {
    const [manageRolesOpen, setManageRolesOpen] = useState(false);
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState<Role | "all">("all");

    const [memberToRemove, setMemberToRemove] = useState<string | null>(
        null,
    );
    const [isRemoving, setIsRemoving] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel(`project-team-${projectId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "project_members",
                    filter: `project_id=eq.${projectId}`,
                },
                () => {
                    console.log(
                        "Project team changed. Refreshing...",
                    );

                    router.refresh();
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [projectId, router]);

    /**
     * These values must match what normalizeRole returns.
     */
    const sections: { title: string; role: Role }[] = [
        {
            title: "Gestor do projecto",
            role: "Project Manager",
        },
        {
            title: "Coordenador",
            role: "Coordinator",
        },
        {
            title: "Arquitectos",
            role: "Architect",
        },
        {
            title: "Engenheiros",
            role: "Engineer",
        },
        {
            title: "Parceiros",
            role: "Partner",
        },
    ];

    const roleColors: Record<Role, string> = {
        "Project Manager": "from-purple-500 to-purple-600",
        Coordinator: "from-blue-500 to-blue-600",
        Architect: "from-emerald-500 to-emerald-600",
        Engineer: "from-orange-500 to-orange-600",
        Partner: "from-pink-500 to-pink-600",
    };

    /**
     * View member profile.
     */
    const handleViewProfile = (member: TeamMember) => {
        router.push(
            `/management/team/profile/${member.profile_id}`,
        );
    };

    /**
     * Open the remove confirmation dialog.
     */
    const handleRemoveMember = (user_project_id: string) => {
        setMemberToRemove(user_project_id);
    };

    /**
     * Remove the confirmed member.
     */
    const confirmRemoveMember = async () => {
        if (!memberToRemove || isRemoving) {
            return;
        }

        setIsRemoving(true);

        try {
            const success = await removeTeamMember(memberToRemove);

            if (!success) {
                console.error(
                    "Failed to remove team member.",
                );
                return;
            }

            setMemberToRemove(null);

            router.refresh();
        } catch (error) {
            console.error(
                "Error removing team member:",
                error,
            );
        } finally {
            setIsRemoving(false);
        }
    };

    /**
     * Normalize members before filtering.
     *
     * Converts service roles (kebab-case) to UI roles (title-case):
     * "project-manager" -> "Project Manager"
     * "coordenador" -> "Coordinator"
     * "engineer" -> "Engineer"
     */
    const normalizedMembers: TeamMember[] = projectMembers.map(
        (member) => ({
            ...member,
            role: normalizeRole(member.role) as Role,
        }),
    );

    /**
     * Filter members by search and selected role.
     */
    const filteredMembers = normalizedMembers.filter(
        (member) => {
            const fullName =
                `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim();

            const matchesSearch = fullName
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            const matchesRole =
                selectedRole === "all" ||
                member.role === selectedRole;

            return matchesSearch && matchesRole;
        },
    );

    /**
     * Prevent background scrolling when a modal is open.
     */
    useEffect(() => {
        const modalOpen =
            manageRolesOpen ||
            addMemberOpen ||
            memberToRemove !== null;

        if (modalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [
        manageRolesOpen,
        addMemberOpen,
        memberToRemove,
    ]);

    return (
        <>
            <div className="mx-auto my-8 h-full max-w-7xl px-6 pb-12">
                {/* Header */}
                <div className="mb-10 space-y-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Equipa
                            </h1>

                            <p className="mt-2 text-sm text-gray-600">
                                Gerencie e colabore com sua equipe
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            {/* Manage team */}
                            <button
                                type="button"
                                onClick={() =>
                                    setManageRolesOpen(true)
                                }
                                className="group inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                            >
                                <Settings
                                    size={18}
                                    className="transition group-hover:rotate-180"
                                />

                                Gerir responsáveis
                            </button>

                            {/* Add member */}
                            <button
                                type="button"
                                onClick={() =>
                                    setAddMemberOpen(true)
                                }
                                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:from-slate-700 hover:to-slate-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                            >
                                <UserPlus size={18} />

                                Adicionar membro
                            </button>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    {projectMembers.length > 0 && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    placeholder="Procurar membro..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder-gray-500 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                                />
                            </div>

                            {/* Role Filter */}
                            <CustomSelect
                                value={selectedRole}
                                onChange={(e) =>
                                    setSelectedRole(
                                        e.target.value as
                                        | Role
                                        | "all",
                                    )
                                }
                                className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                            >
                                <option value="all">
                                    Todas as funções
                                </option>

                                {sections.map((section) => (
                                    <option
                                        key={section.role}
                                        value={section.role}
                                    >
                                        {section.title}
                                    </option>
                                ))}
                            </CustomSelect>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                {projectMembers.length === 0 ? (
                    <EmptyState
                        setAddMemberOpen={setAddMemberOpen}
                    />
                ) : filteredMembers.length === 0 ? (
                    /* No Results */
                    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white px-8 py-12 text-center">
                        <Filter
                            size={32}
                            className="mx-auto mb-4 text-gray-400"
                        />

                        <h3 className="text-lg font-semibold text-gray-900">
                            Nenhum membro encontrado
                        </h3>

                        <p className="mt-2 text-sm text-gray-600">
                            Tente ajustar seus filtros ou termos
                            de busca.
                        </p>

                        {(searchQuery ||
                            selectedRole !== "all") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSelectedRole("all");
                                    }}
                                    className="mt-4 cursor-pointer text-sm font-medium text-slate-600 hover:text-slate-800"
                                >
                                    Limpar filtros
                                </button>
                            )}
                    </div>
                ) : (
                    /* Team Sections */
                    <div className="space-y-10">
                        {sections.map((section) => {
                            const sectionMembers =
                                filteredMembers.filter(
                                    (member) =>
                                        member.role ===
                                        section.role,
                                );

                            if (sectionMembers.length === 0) {
                                return null;
                            }

                            return (
                                <div
                                    key={section.role}
                                    className="animate-in fade-in duration-500"
                                >
                                    {/* Section Header */}
                                    <div className="mb-6 flex items-baseline justify-between">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                {section.title}
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {
                                                    sectionMembers.length
                                                }{" "}
                                                {sectionMembers.length ===
                                                    1
                                                    ? "membro"
                                                    : "membros"}
                                            </p>
                                        </div>

                                        <div
                                            className={`h-2 w-12 rounded-full bg-gradient-to-r ${roleColors[section.role]}`}
                                        />
                                    </div>

                                    {/* Members Grid */}
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {sectionMembers.map(
                                            (
                                                member,
                                                index,
                                            ) => (
                                                <div
                                                    key={
                                                        member.project_members_id
                                                    }
                                                    className="animate-in fade-in duration-500"
                                                    style={{
                                                        animationDelay: `${index * 50}ms`,
                                                    }}
                                                >
                                                    <TeamCard
                                                        member={
                                                            member
                                                        }
                                                        onViewProfile={
                                                            handleViewProfile
                                                        }
                                                        roleColor={
                                                            roleColors[
                                                            section
                                                                .role
                                                            ]
                                                        }
                                                        onRemoveMember={() =>
                                                            handleRemoveMember(
                                                                member.project_members_id,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Recent Activity */}
                {projectMembers.length > 0 && (
                    <div className="mt-16">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Actividades recentes
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Acompanhe o que sua equipe está
                                fazendo
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 text-center">
                            <div className="mb-3 flex justify-center">
                                <div className="rounded-full bg-white p-3">
                                    <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                                </div>
                            </div>

                            <p className="text-sm text-gray-600">
                                Nenhuma actividade recente no
                                momento.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Manage Roles Modal */}
            {manageRolesOpen && (
                <ManageRolesModal
                    members={projectMembers}
                    onClose={() => setManageRolesOpen(false)}
                />
            )}

            {/* Add Member Modal */}
            {addMemberOpen && (
                <AddMemberModal
                    members={team}
                    onClose={() => setAddMemberOpen(false)}
                    onMemberAdded={() => {
                        router.refresh();
                    }}
                />
            )}

            {/* Remove Member Confirmation */}
            {memberToRemove && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
                    onClick={() => {
                        if (!isRemoving) {
                            setMemberToRemove(null);
                        }
                    }}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Remover membro
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Tem a certeza de que deseja
                                remover este membro do projecto?
                            </p>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Esta ação irá remover o membro da
                                equima deste projecto.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
                            <button
                                type="button"
                                disabled={isRemoving}
                                onClick={() =>
                                    setMemberToRemove(null)
                                }
                                className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                disabled={isRemoving}
                                onClick={confirmRemoveMember}
                                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isRemoving
                                    ? "A remover..."
                                    : "Remover membro"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function EmptyState({
    setAddMemberOpen,
}: {
    setAddMemberOpen: (open: boolean) => void;
}) {
    return (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 px-8 py-16 text-center">
            <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-gradient-to-br from-slate-100 to-slate-50 p-4">
                    <UserPlus
                        size={32}
                        className="text-slate-400"
                    />
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
                Sua equipa está vazia
            </h3>

            <p className="mt-2 text-sm text-gray-600">
                Comece adicionando membros à sua equipa.
            </p>

            <button
                type="button"
                onClick={() => setAddMemberOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
                <UserPlus size={16} />

                Adicionar primeiro membro
            </button>
        </div>
    );
}
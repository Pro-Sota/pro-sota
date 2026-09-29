import "server-only";

import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

export type Role =
    | "project-manager"
    | "coordenador"
    | "architect"
    | "engineer"
    | "partner";

export type Status =
    | "disponível"
    | "ocupado"
    | "ausente";

export type TeamMember = {
    project_members_id: string;
    profile_id: string;
    role_id: number;
    role: Role;
    role_name: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
    status: Status;
    tasks: unknown[];
};

type ProjectMemberRow = {
    project_members_id: string;
    profile_id: string;
    project_id: string;
    role_id: number;
};

type ProfileRow = {
    profile_id: string;
    first_name: string | null;
    last_name: string | null;
    picture: string | null;
};

type ProjectRoleRow = {
    role_id: number;
    name: string;
};

function normalizeRoleName(name: string): Role {
    const normalized = name
        .trim()
        .toLowerCase()
        .replace(/[_\s]+/g, "-");

    const roleMap: Record<string, Role> = {
        "project-manager": "project-manager",
        projectmanager: "project-manager",
        "gestor-do-projecto": "project-manager",
        "gestor-do-projeto": "project-manager",
        "gestor-projeto": "project-manager",

        coordenador: "coordenador",
        coordinator: "coordenador",

        architect: "architect",
        architecto: "architect",
        arquiteto: "architect",

        engineer: "engineer",
        engenheiro: "engineer",

        partner: "partner",
        parceiro: "partner",
    };

    return roleMap[normalized] ?? "engineer";
}

function isUniqueRole(role: Role): boolean {
    return (
        role === "project-manager" ||
        role === "coordenador"
    );
}

export async function getProjectMembers(
    projectId: string,
): Promise<TeamMember[]> {
    if (!projectId) {
        throw new Error("Project ID is required.");
    }

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const {
        data: memberRows,
        error: membersError,
    } = await supabase
        .from("project_members")
        .select(`
            project_members_id,
            profile_id,
            project_id,
            role_id
        `)
        .eq("project_id", projectId);

    if (membersError) {
        console.error(
            "Supabase error fetching project_members:",
            membersError,
        );

        throw new Error(
            membersError.message ||
                "Failed to fetch project members.",
        );
    }

    if (!memberRows || memberRows.length === 0) {
        return [];
    }

    const members =
        memberRows as ProjectMemberRow[];

    const profileIds = [
        ...new Set(
            members
                .map((member) => member.profile_id)
                .filter(Boolean),
        ),
    ];

    const roleIds = [
        ...new Set(
            members
                .map((member) => member.role_id)
                .filter(
                    (
                        roleId,
                    ): roleId is number =>
                        roleId !== null &&
                        roleId !== undefined,
                ),
        ),
    ];

    const [
        { data: profileRows, error: profilesError },
        { data: roleRows, error: rolesError },
    ] = await Promise.all([
        supabase
            .from("profiles")
            .select(`
                profile_id,
                first_name,
                last_name,
                picture
            `)
            .in("profile_id", profileIds),

        supabase
            .from("project_roles")
            .select(`
                role_id,
                name
            `)
            .in("role_id", roleIds),
    ]);

    if (profilesError) {
        console.error(
            "Supabase error fetching project member profiles:",
            profilesError,
        );

        throw new Error(
            profilesError.message ||
                "Failed to fetch member profiles.",
        );
    }

    if (rolesError) {
        console.error(
            "Supabase error fetching project roles:",
            rolesError,
        );

        throw new Error(
            rolesError.message ||
                "Failed to fetch project roles.",
        );
    }

    const profiles =
        (profileRows ?? []) as ProfileRow[];

    const roles =
        (roleRows ?? []) as ProjectRoleRow[];

    const profileMap = new Map(
        profiles.map((profile) => [
            profile.profile_id,
            profile,
        ]),
    );

    const roleMap = new Map(
        roles.map((role) => [
            role.role_id,
            role,
        ]),
    );

    return members.flatMap(
        (member): TeamMember[] => {
            const profile =
                profileMap.get(
                    member.profile_id,
                );

            const projectRole =
                roleMap.get(member.role_id);

            if (!profile) {
                return [];
            }

            const roleName =
                projectRole?.name ?? "Engineer";

            return [
                {
                    project_members_id:
                        member.project_members_id,

                    profile_id:
                        member.profile_id,

                    role_id:
                        member.role_id,

                    role:
                        normalizeRoleName(
                            roleName,
                        ),

                    role_name:
                        roleName,

                    first_name:
                        profile.first_name?.trim() ??
                        "",

                    last_name:
                        profile.last_name?.trim() ??
                        "",

                    avatar_url:
                        profile.picture ?? "",

                    /*
                     * This is currently UI-only.
                     * There is no status column being
                     * read from project_members here.
                     */
                    status: "ausente",

                    tasks: [],
                },
            ];
        },
    );
}

async function getRoleByName(
    supabase: Awaited<
        ReturnType<typeof createClient>
    >,
    roleName: string,
) {
    const {
        data,
        error,
    } = await supabase
        .from("project_roles")
        .select("role_id, name")
        .eq("name", roleName)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function addTeamMember(
    projectId: string,
    profileId: string,
    roleName: string,
): Promise<{
    success: boolean;
    error?: string;
}> {
    if (
        !projectId ||
        !profileId ||
        !roleName
    ) {
        return {
            success: false,
            error: "Missing required parameters.",
        };
    }

    try {
        const cookieStore = await cookies();
        const supabase =
            await createClient(cookieStore);

        const roleData =
            await getRoleByName(
                supabase,
                roleName,
            );

        if (!roleData) {
            return {
                success: false,
                error: `Project role not found: ${roleName}`,
            };
        }

        const {
            data: existingMember,
            error: existingError,
        } = await supabase
            .from("project_members")
            .select("project_members_id")
            .eq("project_id", projectId)
            .eq("profile_id", profileId)
            .eq("role_id", roleData.role_id)
            .maybeSingle();

        if (existingError) {
            return {
                success: false,
                error: existingError.message,
            };
        }

        if (existingMember) {
            return {
                success: false,
                error:
                    "This member already has this role in the project.",
            };
        }

        const normalizedRole =
            normalizeRoleName(
                roleData.name,
            );

        /*
         * A project can only have one Project Manager
         * and one Coordinator.
         */
        if (isUniqueRole(normalizedRole)) {
            const {
                error: deleteError,
            } = await supabase
                .from("project_members")
                .delete()
                .eq("project_id", projectId)
                .eq(
                    "role_id",
                    roleData.role_id,
                )
                .neq(
                    "profile_id",
                    profileId,
                );

            if (deleteError) {
                return {
                    success: false,
                    error: deleteError.message,
                };
            }
        }

        const {
            error: insertError,
        } = await supabase
            .from("project_members")
            .insert({
                project_id: projectId,
                profile_id: profileId,
                role_id: roleData.role_id,
            });

        if (insertError) {
            return {
                success: false,
                error: insertError.message,
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error(
            "addTeamMember error:",
            error,
        );

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to add team member.",
        };
    }
}

export async function assignProjectRole(
    projectId: string,
    profileId: string,
    roleName: string,
): Promise<boolean> {
    if (
        !projectId ||
        !profileId ||
        !roleName
    ) {
        return false;
    }

    try {
        const cookieStore = await cookies();
        const supabase =
            await createClient(cookieStore);

        const roleData =
            await getRoleByName(
                supabase,
                roleName,
            );

        if (!roleData) {
            return false;
        }

        const normalizedRole =
            normalizeRoleName(
                roleData.name,
            );

        const {
            data: existingRole,
            error: existingError,
        } = await supabase
            .from("project_members")
            .select("project_members_id")
            .eq("project_id", projectId)
            .eq("profile_id", profileId)
            .eq(
                "role_id",
                roleData.role_id,
            )
            .maybeSingle();

        if (existingError) {
            return false;
        }

        if (existingRole) {
            return true;
        }

        if (isUniqueRole(normalizedRole)) {
            const {
                error: deleteError,
            } = await supabase
                .from("project_members")
                .delete()
                .eq("project_id", projectId)
                .eq(
                    "role_id",
                    roleData.role_id,
                )
                .neq(
                    "profile_id",
                    profileId,
                );

            if (deleteError) {
                return false;
            }
        }

        const {
            error: insertError,
        } = await supabase
            .from("project_members")
            .insert({
                project_id: projectId,
                profile_id: profileId,
                role_id: roleData.role_id,
            });

        return !insertError;
    } catch (error) {
        console.error(
            "assignProjectRole error:",
            error,
        );

        return false;
    }
}

/*
 * IMPORTANT:
 *
 * updateTeamMemberStatus previously attempted:
 *
 * .update({ status })
 *
 * on project_members.
 *
 * If project_members does not contain a status column,
 * this must NOT write to the table.
 *
 * Keep this function only as a UI-compatible action
 * until a real status field/table exists.
 */
export async function updateTeamMemberStatus(
    _userProjectId: string,
    _status: Status,
): Promise<boolean> {
    return true;
}

export async function removeTeamMember(
    userProjectId: string,
): Promise<boolean> {
    if (!userProjectId) {
        return false;
    }

    try {
        const cookieStore = await cookies();
        const supabase =
            await createClient(cookieStore);

        const { error } =
            await supabase
                .from("project_members")
                .delete()
                .eq(
                    "project_members_id",
                    userProjectId,
                );

        if (error) {
            console.error(
                "removeTeamMember error:",
                error,
            );

            return false;
        }

        return true;
    } catch (error) {
        console.error(
            "removeTeamMember error:",
            error,
        );

        return false;
    }
}
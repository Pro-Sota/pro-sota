import "server-only";

import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

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
};

type ProjectRoleRow = {
    role_id: number;
    name: string;
};

export function normalizeRoleName(name: string): Role {
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

export function isUniqueRole(role: Role): boolean {
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
    const supabase = await createClient(await cookies());

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
        profileIds.length > 0
            ? supabase
                  .from("profiles")
                  .select(`
                      profile_id,
                      first_name,
                      last_name
                  `)
                  .in("profile_id", profileIds)
            : Promise.resolve({
                  data: [],
                  error: null,
              }),

        roleIds.length > 0
            ? supabase
                  .from("project_roles")
                  .select(`
                      role_id,
                      name
                  `)
                  .in("role_id", roleIds)
            : Promise.resolve({
                  data: [],
                  error: null,
              }),
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

                    avatar_url: "",

                    status: "ausente",

                    tasks: [],
                },
            ];
        },
    );
}

export async function getRoleByName(
    roleName: string,
) {
    const supabase = await createClient(await cookies());

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
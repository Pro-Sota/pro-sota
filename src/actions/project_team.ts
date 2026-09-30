"use server";

import { createClient } from "@/app/lib/supabase/server";

import {
    isUniqueRole,
    normalizeRoleName,
    type Status,
} from "@//services/project_team";

import { cookies } from "next/headers";

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
        const supabase = await createClient(await cookies());

        const {
            data: roleData,
            error: roleError,
        } = await supabase
            .from("project_roles")
            .select("role_id, name")
            .eq("name", roleName)
            .maybeSingle();

        if (roleError) {
            return {
                success: false,
                error: roleError.message,
            };
        }

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
         * Only one Project Manager and one
         * Coordinator can exist per project.
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

export async function removeProjectTeamMemberAction(
    projectMembersId: string,
): Promise<{
    success: boolean;
    error?: string;
}> {
    if (!projectMembersId) {
        return {
            success: false,
            error: "Project member ID is required.",
        };
    }

    try {
        const supabase = await createClient(await cookies());

        const { error } = await supabase
            .from("project_members")
            .delete()
            .eq(
                "project_members_id",
                projectMembersId,
            );

        if (error) {
            console.error(
                "removeProjectTeamMemberAction error:",
                error,
            );

            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error(
            "removeProjectTeamMemberAction error:",
            error,
        );

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to remove project team member.",
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
        const supabase = await createClient(await cookies());

        const {
            data: roleData,
            error: roleError,
        } = await supabase
            .from("project_roles")
            .select("role_id, name")
            .eq("name", roleName)
            .maybeSingle();

        if (roleError || !roleData) {
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

export async function updateTeamMemberStatus(
    _userProjectId: string,
    _status: Status,
): Promise<boolean> {
    /*
     * project_members currently has no status column.
     * Do not attempt to update it.
     */
    return true;
}

export async function removeTeamMember(
    userProjectId: string,
): Promise<boolean> {
    if (!userProjectId) {
        return false;
    }

    try {
        const supabase = await createClient(await cookies());

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
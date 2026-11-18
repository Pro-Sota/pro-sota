
"use server";

import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

import type { Status } from "@/services/project_team";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type ActionResult = {
    success: boolean;
    error?: string;
};

type ProjectRole = {
    role_id: number;
    name: string;
    is_unique: boolean;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

async function getProjectRole(
    roleName: string,
): Promise<{
    role: ProjectRole | null;
    error?: string;
}> {
    const supabase = await createClient(await cookies());

    const { data, error } = await supabase
        .from("project_roles")
        .select("role_id, name, is_unique")
        .eq("name", roleName)
        .maybeSingle();

    if (error) {
        return {
            role: null,
            error: error.message,
        };
    }

    if (!data) {
        return {
            role: null,
            error: `Project role not found: ${roleName}`,
        };
    }

    return {
        role: data as ProjectRole,
    };
}

/* -------------------------------------------------------------------------- */
/* Add Team Member                                                            */
/* -------------------------------------------------------------------------- */

export async function addTeamMember(
    projectId: string,
    profileId: string,
    roleName: string,
): Promise<ActionResult> {
    if (!projectId || !profileId || !roleName) {
        return {
            success: false,
            error: "Missing required parameters.",
        };
    }

    try {
        const supabase = await createClient(await cookies());

        const {
            role,
            error: roleError,
        } = await getProjectRole(roleName);

        if (roleError || !role) {
            return {
                success: false,
                error: roleError ?? "Project role not found.",
            };
        }

        // Prevent duplicate assignments.
        const { data: existingMember, error: existingError } =
            await supabase
                .from("project_members")
                .select("project_members_id")
                .eq("project_id", projectId)
                .eq("profile_id", profileId)
                .eq("role_id", role.role_id)
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
                error: "This member already has this role in the project.",
            };
        }

        // Only roles marked is_unique can have one member per project.
        if (role.is_unique) {
            const {
                data: deletedMembers,
                error: deleteError,
            } = await supabase
                .from("project_members")
                .delete()
                .eq("project_id", projectId)
                .eq("role_id", role.role_id)
                .neq("profile_id", profileId)
                .select("project_members_id");

            if (deleteError) {
                return {
                    success: false,
                    error: deleteError.message,
                };
            }

            // Detect rows that were not deleted due to RLS.
            const { data: remainingMember, error: checkError } =
                await supabase
                    .from("project_members")
                    .select("project_members_id")
                    .eq("project_id", projectId)
                    .eq("role_id", role.role_id)
                    .neq("profile_id", profileId)
                    .limit(1)
                    .maybeSingle();

            if (checkError) {
                return {
                    success: false,
                    error: checkError.message,
                };
            }

            if (remainingMember) {
                return {
                    success: false,
                    error: "Unable to replace the existing member. Check your project permissions.",
                };
            }
        }

        const { error: insertError } = await supabase
            .from("project_members")
            .insert({
                project_id: projectId,
                profile_id: profileId,
                role_id: role.role_id,
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
        console.error("addTeamMember error:", error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to add team member.",
        };
    }
}

/* -------------------------------------------------------------------------- */
/* Remove Project Team Member                                                 */
/* -------------------------------------------------------------------------- */

export async function removeProjectTeamMemberAction(
    projectMembersId: string,
): Promise<ActionResult> {
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
            .eq("project_members_id", projectMembersId);

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

/* -------------------------------------------------------------------------- */
/* Assign Project Role                                                        */
/* -------------------------------------------------------------------------- */

export async function assignProjectRole(
    projectId: string,
    profileId: string,
    roleName: string,
): Promise<boolean> {
    if (!projectId || !profileId || !roleName) {
        return false;
    }

    try {
        const supabase = await createClient(await cookies());

        const {
            role,
            error: roleError,
        } = await getProjectRole(roleName);

        if (roleError || !role) {
            console.error("assignProjectRole:", roleError);
            return false;
        }

        const {
            data: existingRole,
            error: existingError,
        } = await supabase
            .from("project_members")
            .select("project_members_id")
            .eq("project_id", projectId)
            .eq("profile_id", profileId)
            .eq("role_id", role.role_id)
            .maybeSingle();

        if (existingError) {
            console.error(existingError.message);
            return false;
        }

        if (existingRole) {
            return true;
        }

        if (role.is_unique) {
            const { error: deleteError } = await supabase
                .from("project_members")
                .delete()
                .eq("project_id", projectId)
                .eq("role_id", role.role_id)
                .neq("profile_id", profileId);

            if (deleteError) {
                console.error(deleteError.message);
                return false;
            }

            const { data: remaining, error: checkError } =
                await supabase
                    .from("project_members")
                    .select("project_members_id")
                    .eq("project_id", projectId)
                    .eq("role_id", role.role_id)
                    .neq("profile_id", profileId)
                    .limit(1)
                    .maybeSingle();

            if (checkError || remaining) {
                console.error(
                    checkError?.message ??
                    "Unable to replace existing project role.",
                );

                return false;
            }
        }

        const { error: insertError } = await supabase
            .from("project_members")
            .insert({
                project_id: projectId,
                profile_id: profileId,
                role_id: role.role_id,
            });

        if (insertError) {
            console.error(
                "assignProjectRole insert error:",
                insertError.message,
            );

            return false;
        }

        return true;
    } catch (error) {
        console.error("assignProjectRole error:", error);
        return false;
    }
}

/* -------------------------------------------------------------------------- */
/* Team Member Status                                                         */
/* -------------------------------------------------------------------------- */

export async function updateTeamMemberStatus(
    _userProjectId: string,
    _status: Status,
): Promise<boolean> {
    // project_members currently has no status column.
    return true;
}

/* -------------------------------------------------------------------------- */
/* Remove Team Member                                                         */
/* -------------------------------------------------------------------------- */

export async function removeTeamMember(
    userProjectId: string,
): Promise<boolean> {
    if (!userProjectId) {
        return false;
    }

    try {
        const supabase = await createClient(await cookies());

        const { error } = await supabase
            .from("project_members")
            .delete()
            .eq("project_members_id", userProjectId);

        if (error) {
            console.error("removeTeamMember error:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("removeTeamMember error:", error);
        return false;
    }
}

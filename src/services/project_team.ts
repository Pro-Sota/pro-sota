import { createClient } from "@/app/lib/supabase/client";

type Role =
    | "project-manager"
    | "coordenador"
    | "architect"
    | "engineer"
    | "partner";

type Status = "disponível" | "ocupado" | "ausente";

type TeamMember = {
    project_members_id: string;
    profile_id: string;
    role: Role;
    first_name: string;
    last_name: string;
    avatar_url: string;
    status: Status;
    tasks: unknown[];
};

type ProjectMemberRow = {
    project_members_id: string;
    roles: {
        role_id: string;
        name: string;
    } | null;
    profiles: {
        profile_id: string;
        first_name: string;
        last_name: string;
    } | null;
};

/**
 * Fetch all project members with full details
 * This is useful for dashboard, profile pages, etc.
 */
export async function getProjectMembers(project_id: string): Promise<TeamMember[]> {
    const supabase = createClient();
    try {
        const { data, error } = await supabase
            .from("project_members")
            .select(
                `
                project_members_id,
                roles (role_id, name),
                profiles (
                    profile_id,
                    first_name,
                    last_name
                )
            `,
            )
            .eq("project_id", project_id) as { data: ProjectMemberRow[] | null; error: any };

        if (error) {
            console.error("Supabase error fetching project members:", error);
            throw new Error(error.message);
        }

        if (!data) {
            return [];
        }

        // Transform the nested data to match TeamMember type
        const teamMembers = data.map((pm) => {
            const roleName = pm.roles?.name?.toLowerCase() || "";
            const normalizedRole = normalizeRoleName(roleName);

            return {
                project_members_id: pm.project_members_id,
                profile_id: pm.profiles?.profile_id || "",
                role: normalizedRole,
                first_name: pm.profiles?.first_name || "",
                last_name: pm.profiles?.last_name || "",
                avatar_url: "", // avatar_url not available in current schema
                status: "ausente" as Status, // default status - add column to project_members if needed
                tasks: [],
            };
        }).filter((member) => member.first_name);

        console.log("Project members data:", teamMembers);
        return teamMembers;
    } catch (error) {
        console.error("Error fetching project members:", error);
        throw error;
    }
}

/**
 * Fetch all team members for a specific project
 * Used in the Team component for project management
 * @deprecated Use getProjectMembers instead for consistency
 */

/**
 * Normalize role name from database to your Role type
 * Handles various formats: "Project Manager", "project-manager", "PROJECT_MANAGER", etc.
 */
function normalizeRoleName(name: string): Role {
    const normalized = name.toLowerCase().replace(/[_\s]/g, "-");

    const roleMap: Record<string, Role> = {
        "project-manager": "project-manager",
        "gestor-do-projecto": "project-manager",
        "gestor-projeto": "project-manager",
        "coordenador": "coordenador",
        "coordinator": "coordenador",
        "architect": "architect",
        "architecto": "architect",
        "arquiteto": "architect",
        "engineer": "engineer",
        "engenheiro": "engineer",
        "partner": "partner",
        "parceiro": "partner",
    };

    return roleMap[normalized] || "engineer";
}

/**
 * Check if a role is unique per project (only one person can have it)
 */
function isUniqueRole(normalizedRole: Role): boolean {
    return normalizedRole === "project-manager" || normalizedRole === "coordenador";
}

/**
 * Add a member to a project
 */
export async function addTeamMember(
    projectId: string,
    profileId: string,
    roleName: string,
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    try {
        // Validate inputs
        if (!projectId || !profileId || !roleName) {
            return { success: false, error: "Missing required parameters" };
        }

        const { data: roleData, error: roleError } = await supabase
            .from("roles")
            .select("role_id")
            .eq("name", roleName)
            .single();

        if (roleError || !roleData) {
            return { success: false, error: `Role not found: ${roleName}` };
        }

        const { error: insertError } = await supabase.from("project_members").insert({
            profile_id: profileId,
            project_id: projectId,
            role_id: roleData.role_id,
        });

        if (insertError) {
            return { success: false, error: insertError.message };
        }

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Unexpected error: ${message}` };
    }
}

/**
 * Update a member's role in a project
 */
export async function assignProjectRole(
    projectId: string,
    profileId: string,
    roleName: string,
): Promise<boolean> {
    const supabase = createClient();

    try {
        // Validate inputs
        if (!projectId) {
            console.error("assignProjectRole: projectId is empty");
            return false;
        }

        if (!profileId) {
            console.error("assignProjectRole: profileId is empty");
            return false;
        }

        if (!roleName) {
            console.error("assignProjectRole: roleName is empty");
            return false;
        }

        // Find role
        const { data: roleData, error: roleError } = await supabase
            .from("roles")
            .select("role_id, name")
            .eq("name", roleName)
            .single();

        if (roleError) {
            console.error("Error finding role:", {
                message: roleError.message,
                details: roleError.details,
                hint: roleError.hint,
                code: roleError.code,
            });
            return false;
        }

        if (!roleData?.role_id) {
            console.error("Role not found:", roleName);
            return false;
        }

        const roleId = roleData.role_id;
        const normalizedRole = normalizeRoleName(roleName.toLowerCase());

        console.log("Assigning project role:", {
            projectId,
            profileId,
            roleName,
            roleId,
        });

        // Check whether this user already has this role.
        // A user can have multiple roles in the same project.
        const { data: existingRoles, error: existingError } = await supabase
            .from("project_members")
            .select("project_members_id")
            .eq("project_id", projectId)
            .eq("profile_id", profileId)
            .eq("role_id", roleId);

        if (existingError) {
            console.error("Error checking existing role:", {
                message: existingError.message,
                details: existingError.details,
                hint: existingError.hint,
                code: existingError.code,
            });
            return false;
        }

        // The user already has this role. Nothing needs to be changed.
        if (existingRoles && existingRoles.length > 0) {
            console.log("User already has this role:", {
                profileId,
                roleName,
            });
            return true;
        }

        // Project Manager and Coordinator are unique project responsibilities.
        // Before assigning either one, remove that SAME role from whoever currently has it.
        // We do NOT remove any other roles from the user.
        if (isUniqueRole(normalizedRole)) {
            const { error: deleteError } = await supabase
                .from("project_members")
                .delete()
                .eq("project_id", projectId)
                .eq("role_id", roleId)
                .neq("profile_id", profileId);

            if (deleteError) {
                console.error("Error removing previous project responsibility:", {
                    message: deleteError.message,
                    details: deleteError.details,
                    hint: deleteError.hint,
                    code: deleteError.code,
                });
                return false;
            }
        }

        // Add the new role
        const { error: insertError } = await supabase.from("project_members").insert({
            project_id: projectId,
            profile_id: profileId,
            role_id: roleId,
        });

        if (insertError) {
            console.error("Error assigning project role:", {
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                code: insertError.code,
            });
            return false;
        }

        console.log("Project role assigned successfully:", {
            projectId,
            profileId,
            roleName,
        });

        return true;
    } catch (error) {
        console.error("Unexpected error assigning project role:", error);
        return false;
    }
}

/**
 * Update a member's status in a project
 * @note Requires 'status' column in project_members table
 * Add with: ALTER TABLE project_members ADD COLUMN status VARCHAR(20) DEFAULT 'ausente';
 */
export async function updateTeamMemberStatus(
    userProjectId: string,
    status: Status,
): Promise<boolean> {
    const supabase = createClient();

    try {
        if (!userProjectId) {
            console.error("updateTeamMemberStatus: userProjectId is empty");
            return false;
        }

        if (!status) {
            console.error("updateTeamMemberStatus: status is empty");
            return false;
        }

        const { error } = await supabase
            .from("project_members")
            .update({ status })
            .eq("project_members_id", userProjectId);

        if (error) {
            console.error("Error updating team member status:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            });
            return false;
        }

        return true;
    } catch (error) {
        console.error("Unexpected error updating team member status:", error);
        return false;
    }
}

/**
 * Remove a member from a project
 */
export async function removeTeamMember(userProjectId: string): Promise<boolean> {
    const supabase = createClient();

    try {
        if (!userProjectId) {
            console.error("removeTeamMember: userProjectId is empty");
            return false;
        }

        const { error } = await supabase
            .from("project_members")
            .delete()
            .eq("project_members_id", userProjectId);

        if (error) {
            console.error("Error removing team member:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
            });
            return false;
        }

        return true;

    } catch (error) {
        console.error("Unexpected error removing team member:", error);
        return false;
    }
}
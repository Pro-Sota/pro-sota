import { createClient } from "@/app/lib/supabase/client";

type Role =
    | "project-manager"
    | "coordenador"
    | "architect"
    | "engineer"
    | "partner";

type Status = "disponível" | "ocupado" | "ausente";

type TeamMember = {
    user_project_id: string;
    profile_id: string;
    role: Role;
    first_name: string;
    last_name: string;
    avatar_url: string;
    status: Status;
    tasks: unknown[];
};

/**
 * Fetch all projects where a user is a member
 * This is useful for dashboard, profile pages, etc.
 */
export async function getProjectMembers(project_id: string) {

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
            .eq("project_id", project_id);

        if (error) {
            console.error("Supabase error fetching project members:", error);
            throw new Error(error.message);
        }

        console.log("Project members data:", data);

        return data;
    } catch (error) {
        console.error("Error fetching project members:", error);
        throw error;
    }
}

/**
 * Fetch all team members for a specific project
 * Used in the Team component for project management
 */

export async function fetchProjectTeamMembers(
    projectId: string,
): Promise<TeamMember[]> {
    const supabase = createClient();

    try {
        const { data: projectMembers, error } = await supabase
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
            .eq("project_id", projectId);

        if (error) {
            console.error("Error fetching team members:", {
                code: error?.code,
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
            });
            return [];
        }

        // Transform the nested data to match TeamMember type
        const teamMembers: TeamMember[] = projectMembers
            ?.map((pm: any) => {
                // Normalize role name to your Role type
                const roleName = pm.roles?.name?.toLowerCase();
                const normalizedRole = normalizeRoleName(roleName);

                return {
                    user_project_id: pm.project_members_id,
                    profile_id: pm.profiles?.profile_id || "",
                    role: normalizedRole,
                    first_name: pm.profiles?.first_name || "",
                    last_name: pm.profiles?.last_name || "",
                    avatar_url: pm.profiles?.avatar_url || "",
                    status: (pm.status as Status) || "",
                    tasks: [], // TODO: Fetch actual tasks if needed
                };
            })
            .filter((member) => member.first_name) || [];

        console.log("Fetched team members:", teamMembers);
        return teamMembers ?? [];
    } catch (error) {
        console.error("Unexpected error fetching team members:", error);
        return [];
    }
}

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

    return roleMap[normalized] || "engineer";
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
        return { success: false, error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` };
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
        // Find role
        const { data: roleData, error: roleError } = await supabase
            .from("roles")
            .select("role_id")
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

        if (!roleData) {
            console.error("Role not found:", roleName);
            return false;
        }

        // Check whether this user already has this role
        const { data: existingRole, error: existingError } = await supabase
            .from("project_members")
            .select("project_members_id")
            .eq("project_id", projectId)
            .eq("profile_id", profileId)
            .eq("role_id", roleData.role_id)
            .maybeSingle();

        if (existingError) {
            console.error("Error checking existing role:", {
                message: existingError.message,
                details: existingError.details,
                hint: existingError.hint,
                code: existingError.code,
            });

            return false;
        }

        // Already has the role
        if (existingRole) {
            return true;
        }

        const { error: deleteError } = await supabase
            .from("project_members")
            .delete()
            .eq("project_id", projectId)
            .eq("role_id", roleData.role_id);

        if (deleteError) {
            console.error(
                "Error removing existing project responsibility:",
                JSON.stringify(deleteError, null, 2)
            );
            return false;
        }

        // Add role
        const { error: insertError } = await supabase
            .from("project_members")
            .insert({
                project_id: projectId,
                profile_id: profileId,
                role_id: roleData.role_id,
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
        return true;
    } catch (error) {
        console.error("Unexpected error assigning project role:", error);
        return false;
    }
}

/**
 * Update a member's status in a project
 */

export async function updateTeamMemberStatus(
    userProjectId: string,
    status: Status,
): Promise<boolean> {

    const supabase = createClient();

    try {
        const { error } = await supabase
            .from("project_members")
            .update({ status })
            .eq("user_project_id", userProjectId);

        if (error) {
            console.error("Error updating team member status:", error);
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

export async function removeTeamMember(userProjectId: string,): Promise<boolean> {
    const supabase = createClient();
    try {
        const { error } = await supabase.from("project_members")
            .delete()
            .eq("project_members_id", userProjectId);

        if (error) {
            console.error("Error removing team member");
            console.error("Code:", error.code); console.error("Message:", error.message);
            console.error("Details:", error.details);
            console.error("Hint:", error.hint);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Unexpected error removing team member:", error);
        return false;
    }
}
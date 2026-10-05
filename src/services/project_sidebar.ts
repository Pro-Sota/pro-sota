import { createClient } from "@/app/lib/supabase/client";
import { Database } from "@/app/lib/supabase/models";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type ProjectMember = {
  profile_id: string;
  project_id: string;
  role_id: number | null;
};

type ProjectRole = {
  role_id: number;
  name: string;
};

export type ProjectSidebarData = {
  project: Project;

  members: Array<{
    profile: Profile;
    role: string | null;
  }>;

  recentFile: {
    name: string;
  } | null;
};

export async function getProjectSidebarData(
  projectId: string
): Promise<ProjectSidebarData | null> {
  const supabase = createClient();

  /* ------------------------------------------------------------------------ */
  /* Project                                                                  */
  /* ------------------------------------------------------------------------ */

  const {
    data: project,
    error: projectError,
  } = await supabase
    .from("projects")
    .select("*")
    .eq("project_id", projectId)
    .single();

  if (projectError || !project) {
    console.error("Failed to fetch project:", {
      projectId,
      error: projectError
        ? {
            message: projectError.message,
            details: projectError.details,
            hint: projectError.hint,
            code: projectError.code,
          }
        : null,
    });

    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* Project members                                                          */
  /* ------------------------------------------------------------------------ */

  const {
    data: rawMembers,
    error: membersError,
  } = await supabase
    .from("project_members")
    .select("profile_id, project_id, role_id")
    .eq("project_id", projectId);

  if (membersError) {
    console.error("Failed to fetch project members:", {
      projectId,
      error: {
        message: membersError.message,
        details: membersError.details,
        hint: membersError.hint,
        code: membersError.code,
      },
    });

    return {
      project,
      members: [],
      recentFile: null,
    };
  }

  const members = (rawMembers ?? []) as unknown as ProjectMember[];

  /* ------------------------------------------------------------------------ */
  /* Profiles                                                                 */
  /* ------------------------------------------------------------------------ */

  const profileIds = Array.from(
    new Set(
      members
        .map((member) => member.profile_id)
        .filter(Boolean)
    )
  );

  let profiles: Profile[] = [];

  if (profileIds.length > 0) {
    const {
      data: profileRows,
      error: profilesError,
    } = await supabase
      .from("profiles")
      .select("*")
      .in("profile_id", profileIds);

    if (profilesError) {
      console.error("Failed to fetch project member profiles:", {
        projectId,
        error: {
          message: profilesError.message,
          details: profilesError.details,
          hint: profilesError.hint,
          code: profilesError.code,
        },
      });
    } else {
      profiles = (profileRows ?? []) as Profile[];
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Project roles                                                            */
  /* ------------------------------------------------------------------------ */

  const roleIds = Array.from(
    new Set(
      members
        .map((member) => member.role_id)
        .filter(
          (roleId): roleId is number =>
            typeof roleId === "number"
        )
    )
  );

  let projectRoles: ProjectRole[] = [];

  if (roleIds.length > 0) {
    const {
      data: roleRows,
      error: rolesError,
    } = await supabase
      .from("project_roles")
      .select("role_id, name")
      .in("role_id", roleIds);

    if (rolesError) {
      console.error("Failed to fetch project roles:", {
        projectId,
        error: {
          message: rolesError.message,
          details: rolesError.details,
          hint: rolesError.hint,
          code: rolesError.code,
        },
      });
    } else {
      projectRoles = (roleRows ?? []) as ProjectRole[];
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Lookup maps                                                              */
  /* ------------------------------------------------------------------------ */

  const profilesById = new Map(
    profiles.map((profile) => [
      profile.profile_id,
      profile,
    ])
  );

  const rolesById = new Map(
    projectRoles.map((role) => [
      role.role_id,
      role.name,
    ])
  );

  /* ------------------------------------------------------------------------ */
  /* Group project memberships by profile                                     */
  /* ------------------------------------------------------------------------ */

  const membersByProfile = new Map<
    string,
    {
      profile: Profile;
      roles: string[];
    }
  >();

  for (const member of members) {
    const profile = profilesById.get(member.profile_id);

    if (!profile) {
      continue;
    }

    const existing = membersByProfile.get(member.profile_id);

    const roleName =
      member.role_id !== null
        ? rolesById.get(member.role_id) ?? null
        : null;

    if (existing) {
      if (
        roleName &&
        !existing.roles.includes(roleName)
      ) {
        existing.roles.push(roleName);
      }

      continue;
    }

    membersByProfile.set(member.profile_id, {
      profile,
      roles: roleName ? [roleName] : [],
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Build sidebar members                                                    */
  /* ------------------------------------------------------------------------ */

  const sidebarMembers = Array.from(
    membersByProfile.values()
  ).map(({ profile, roles }) => ({
    profile,

    role:
      roles.length > 0
        ? roles.join(" • ")
        : null,
  }));

  /* ------------------------------------------------------------------------ */
  /* Recent file                                                              */
  /* ------------------------------------------------------------------------ */

  const {
    data: recentFile,
    error: fileError,
  } = await supabase
    .from("documents")
    .select("name")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fileError) {
    console.error("Failed to fetch recent project file:", {
      projectId,
      error: {
        message: fileError.message,
        details: fileError.details,
        hint: fileError.hint,
        code: fileError.code,
      },
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Return                                                                  */
  /* ------------------------------------------------------------------------ */

  return {
    project,

    members: sidebarMembers,

    recentFile: recentFile
      ? {
          name: recentFile.name,
        }
      : null,
  };
}
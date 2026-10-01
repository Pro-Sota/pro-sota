import { Permission } from "@/app/lib/permissions";
import { createClient } from "@/app/lib/supabase/server";
import ProjectPermissions from "@/app/management/projects/permission/project_permission";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    projectId: string;
    memberId: string;
  }>;
};

export default async function ProjectPermissionsPage({
  params,
}: PageProps) {
  const { projectId, memberId } = await params;

  const supabase = createClient(await cookies());

  /*
   * ---------------------------------------------------------
   * PROJECT
   * ---------------------------------------------------------
   */

  const {
    data: project,
    error: projectError,
  } = await supabase
    .from("projects")
    .select("project_id, project_code")
    .eq("project_id", projectId)
    .single();

  if (projectError) {
    console.error("PROJECT ERROR:", projectError);

    throw new Error(
      `Não foi possível carregar o projecto: ${projectError.message}`,
    );
  }

  if (!project) {
    notFound();
  }

  /*
   * ---------------------------------------------------------
   * PROJECT MEMBER
   * ---------------------------------------------------------
   */

  const {
    data: memberRows,
    error: memberError,
  } = await supabase
    .from("project_members")
    .select(`
      project_members_id,
      profile_id,
      project_id,
      role_id
    `)
    .eq("project_id", projectId)
    .eq("profile_id", memberId)
    .order("project_members_id", {
      ascending: true,
    });

  if (memberError) {
    console.error("PROJECT MEMBER ERROR:", memberError);

    throw new Error(
      `Não foi possível carregar o membro do projecto: ${memberError.message}`,
    );
  }

  if (!memberRows || memberRows.length === 0) {
    notFound();
  }

  const member = memberRows[0];

  /*
   * ---------------------------------------------------------
   * PROFILE
   * ---------------------------------------------------------
   */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      profile_id,
      first_name,
      last_name,
      email
    `)
    .eq("profile_id", member.profile_id)
    .single();

  if (profileError) {
    console.error("PROFILE ERROR:", profileError);

    throw new Error(
      `Não foi possível carregar o perfil: ${profileError.message}`,
    );
  }

  if (!profile) {
    notFound();
  }

  /*
   * ---------------------------------------------------------
   * PROJECT ROLES
   * ---------------------------------------------------------
   */

  const roleIds = Array.from(
    new Set(
      memberRows
        .map((row) => row.role_id)
        .filter(
          (roleId): roleId is number =>
            roleId !== null && roleId !== undefined,
        ),
    ),
  );

  let projectRole = "Membro";

  if (roleIds.length > 0) {
    const {
      data: projectRoles,
      error: projectRolesError,
    } = await supabase
      .from("project_roles")
      .select("role_id, name")
      .in("role_id", roleIds);

    if (projectRolesError) {
      console.error(
        "PROJECT ROLES ERROR:",
        projectRolesError,
      );

      throw new Error(
        `Não foi possível carregar as funções do projecto: ${projectRolesError.message}`,
      );
    }

    const roleNames =
      projectRoles
        ?.map((role) => role.name)
        .filter(Boolean) ?? [];

    if (roleNames.length > 0) {
      projectRole = roleNames.join(" / ");
    }
  }

  /*
   * ---------------------------------------------------------
   * PROJECT PERMISSIONS
   * ---------------------------------------------------------
   */

  const {
    data: permissionRows,
    error: permissionsError,
  } = await supabase
    .from("project_permissions")
    .select("permission_id")
    .eq("project_id", projectId)
    .eq("profile_id", member.profile_id);

  if (permissionsError) {
    console.error(
      "PROJECT PERMISSIONS ERROR:",
      permissionsError,
    );

    throw new Error(
      `Não foi possível carregar as permissões do projecto: ${permissionsError.message}`,
    );
  }

  /*
   * ---------------------------------------------------------
   * PERMISSION DEFINITIONS
   * ---------------------------------------------------------
   */

  const permissionIds = Array.from(
    new Set(
      permissionRows
        ?.map((row) => row.permission_id)
        .filter(
          (permissionId): permissionId is number =>
            permissionId !== null &&
            permissionId !== undefined,
        ) ?? [],
    ),
  );

  let initialPermissions: Permission[] = [];

  if (permissionIds.length > 0) {
    const {
      data: permissions,
      error: permissionDefinitionsError,
    } = await supabase
      .from("permissions")
      .select("permission_id, key")
      .in("permission_id", permissionIds);

    if (permissionDefinitionsError) {
      console.error(
        "PERMISSION DEFINITIONS ERROR:",
        permissionDefinitionsError,
      );

      throw new Error(
        `Não foi possível carregar as definições das permissões: ${permissionDefinitionsError.message}`,
      );
    }

    initialPermissions =
      permissions
        ?.map((permission) => permission.key)
        .filter(
          (key): key is Permission =>
            Boolean(key),
        ) ?? [];
  }

  /*
   * ---------------------------------------------------------
   * MEMBER DISPLAY DATA
   * ---------------------------------------------------------
   */

  const memberName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  const memberInitials = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase();

  /*
   * ---------------------------------------------------------
   * PAGE
   * ---------------------------------------------------------
   */

  return (
    <div className="min-h-full bg-[#F7F7F5]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <Link
          href={`/management/projects/${projectId}/team`}
          className="group mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#002950]"
        >
          <ArrowLeft
            size={16}
            strokeWidth={1.8}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Voltar à equipa
        </Link>

        {/* Permissions */}
        <div className="overflow-hidden rounded-2xl border border-[#E5E5DF] bg-white shadow-sm">
          <ProjectPermissions
            projectId={projectId}
            projectName={project.project_code}
            member={{
              profileId: profile.profile_id,
              firstName: profile.first_name,
              lastName: profile.last_name,
              email: profile.email,
              projectRole,
            }}
            initialPermissions={initialPermissions}
          />
        </div>
      </div>
    </div>
  );
}
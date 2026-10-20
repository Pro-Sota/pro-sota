import { redirect } from "next/navigation";

import { createClient } from "@/app/lib/supabase/server";
import PermissionsClient from "./permissions_client";
import { getPermissionsPageData } from "@/services/permissions";
import { saveMemberPermissions } from "@/actions/permissions";
import { cookies } from "next/headers";
import { requireUser } from "@/app/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function PermissionsPage() {

  const {user, userRole} = await requireUser();

  if (userRole?.toLowerCase() !== "admin") {
    redirect("/management");
  }

  const data = await getPermissionsPageData();

  return (
    <PermissionsClient
      members={data.members as Parameters<typeof PermissionsClient>[0]["members"]}
      permissions={data.permissions}
      roleDefaults={data.roleDefaults}
      initialOverrides={data.initialOverrides}
      onSave={saveMemberPermissions}
    />
  );
}
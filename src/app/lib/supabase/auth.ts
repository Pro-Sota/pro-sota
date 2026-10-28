import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Database } from "@/app/lib/supabase/models";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type Role = {
  role_id: number;
  name: string | null;
};

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return user;
}

export async function requireUser(profileId?: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // Fetch the complete profile being edited.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("profile_id", profileId ?? user.id)
    .maybeSingle<Profile>();

  if (profileError) {
    console.error("Error loading profile:", profileError);
  }

  if (!profile) {
    redirect("/management");
  }

  // Fetch the role matching this profile's role_id.
  let role: Role | null = null;

  if (profile.role_id !== null) {
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("role_id, name")
      .eq("role_id", profile.role_id)
      .maybeSingle();

    if (roleError) {
      console.error("Error loading profile role:", roleError);
    }

    role = roleData;
  }

  // Only allow users to view their own profile unless they are admins.
  const { data: currentProfile, error: currentProfileError } =
    await supabase
      .from("profiles")
      .select("role_id")
      .eq("profile_id", user.id)
      .maybeSingle();

  if (currentProfileError || !currentProfile) {
    redirect("/management");
  }

  const isAdmin = currentProfile.role_id === 1;

  if (profile.profile_id !== user.id && !isAdmin) {
    redirect("/management");
  }

  return {
    user,
    profile,
    role,
    userRole: role?.name ?? null,
    userDepartment: profile.department ?? null,
    isAdmin,
  };
}
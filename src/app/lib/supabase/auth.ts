import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type Role = {
  role_id: number;
  name: string | null;
};

type ProfileWithRole = {
  profile_id: string;
  role_id: number | null;
  roles: Role | Role[] | null;
  department: string | null;
};

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(`
      profile_id,
      department,
      role_id,
      roles (
        role_id,
        name
      )
    `)
    .eq("profile_id", user.id)
    .maybeSingle<ProfileWithRole>();

  if (profileError) {
    console.error("Error loading authenticated user profile:", {
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
      code: profileError.code,
    });
  }

  if (!profile) {
    console.warn("No profile found for authenticated user:", user.id);
  }

  if (profile && !profile.role_id) {
    console.warn("Profile has no role_id:", user.id);
  }

  const roles = profile?.roles;

  const userRole = Array.isArray(roles)
    ? roles[0]?.name ?? null
    : roles?.name ?? null;

  const userDepartment = profile?.department;

  console.log("Authenticated user:", user.id);
  console.log("Profile role_id:", profile?.role_id);
  console.log("Resolved role:", userRole);
  console.log("Resolved department:", userDepartment);


  return {
    user,
    profile,
    userRole,
    userDepartment
  };
}
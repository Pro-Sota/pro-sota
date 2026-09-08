import { Database } from "@/app/lib/supabase/models";
import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getProfile() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;

    if (!user) {
      throw new Error("No authenticated user");
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    if (error) throw error;

    return data as Profile | null;

  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
}


export async function getAllUsers() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("profiles")
      .select("*");

    if (error) {
      throw new Error(error.message);
    }
    return data ?? [];
}


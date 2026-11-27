import { Database } from "@/app/lib/supabase/models";
import { createClient } from "@/app/lib/supabase/server";
import { cookies } from "next/headers";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getProfile() {
  try {
    const supabase = createClient();;

    const {
      data: { user },
      error: userError,
    } = await (await supabase).auth.getUser();

    if (userError) throw userError;

    if (!user) {
      throw new Error("No authenticated user");
    }
    const { data, error } = await (await supabase)
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
    const supabase = createClient();

    const { data, error } = await (await supabase)
      .from("profiles")
      .select("*");

    if (error) {
      throw new Error(error.message);
    }
    return data ?? [];
}

export async function getSession() {
  try {
    const supabase = createClient();

    const {
      data: { session },
      error,
    } = await (await supabase).auth.getSession();

    if (error) throw error;

    return {session};
  } catch (error) {
    console.error("Get session error:", error);
    throw error;
  }
}

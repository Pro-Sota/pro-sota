import { createClient } from "@/app/lib/supabase/client";

export async function signIn(email: string, password: string) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
}


export async function signUp(
  email: string,
  password: string
) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}


export async function updateUserProfile(
  metadata: Record<string, unknown>
) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
}

export async function signOut() {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) throw error;

    return user;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error;
  }
}

export async function getSession() {
  try {
    const supabase = createClient();

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    return session;
  } catch (error) {
    console.error("Get session error:", error);
    throw error;
  }
}

export async function resetPassword(email: string) {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) throw error;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
}

export async function updatePassword(password: string) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Update password error:", error);
    throw error;
  }
}

export async function deleteAccount() {
  try {
    const supabase = createClient();

    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      throw new Error("No authenticated user");
    }

    // Call your backend/API route here
  } catch (error) {
    console.error("Delete account error:", error);
    throw error;
  }
}

export async function isAuthenticated() {
  try {
    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    return !!session;
  } catch (error) {
    console.error("Auth check error:", error);
    throw error;
  }
}

import { AuthChangeEvent, Session } from "@supabase/supabase-js";

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const supabase = createClient();

  return supabase.auth.onAuthStateChange(callback);
}



export async function getProfileById(profileId: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("profile_id", profileId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
}

export async function createProfile(
  profile: Record<string, unknown>
) {
  try {
    const supabase = createClient();

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
      .insert({
        id: user.id,
        email: user.email,
        ...profile,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Create profile error:", error);
    throw error;
  }
}
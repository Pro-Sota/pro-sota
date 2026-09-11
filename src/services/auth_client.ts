import { createClient } from "@/app/lib/supabase/client";
import {
  AuthChangeEvent,
  Session,
} from "@supabase/supabase-js";

export async function signIn(
  email: string,
  password: string
) {
  try {
    const supabase = createClient();

    const { data, error } =
      await supabase.auth.signInWithPassword({
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

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) throw error;

    if (!data.user) {
      throw new Error(
        "O utilizador não foi criado."
      );
    }

    return data;
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}

export async function createProfileForUser(
  userId: string,
  profile: {
    first_name: string;
    last_name: string;
    email?: string | null;
    phone_number?: string | null;
    dob?: string | null;
    nationality?: string | null;
    profile_picture?: string | null;
    department?: string | null;
    job_title?: string | null;
    bio?: string | null;
  }
) {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        profile_id: userId,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email ?? null,
        phone_number: profile.phone_number || null,
        dob: profile.dob || null,
        nationality: profile.nationality || null,
        profile_picture:
          profile.profile_picture || null,
        department: profile.department || null,
        job_title: profile.job_title || null,
        bio: profile.bio || null,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "Create profile database error:",
        error
      );
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Create profile error:", error);
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
      throw new Error(
        "Nenhum utilizador autenticado."
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        profile_id: user.id,
        email: user.email ?? null,
        ...profile,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "Create profile database error:",
        error
      );
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Create profile error:", error);
    throw error;
  }
}

export async function uploadProfilePicture(
  file: File,
  profileId: string
) {
  try {
    const supabase = createClient();

    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      "jpg";

    const filePath = `${profileId}/profile.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

    if (uploadError) {
      console.error(
        "Profile picture upload error:",
        uploadError
      );
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error(
      "Upload profile picture error:",
      error
    );
    throw error;
  }
}

export async function updateProfile(
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
      throw new Error(
        "Nenhum utilizador autenticado."
      );
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("profile_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
}

export async function updateUserProfile(
  metadata: Record<string, unknown>
) {
  try {
    const supabase = createClient();

    const { data, error } =
      await supabase.auth.updateUser({
        data: metadata,
      });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Update user profile error:", error);
    throw error;
  }
}

export async function signOut() {
  try {
    const supabase = createClient();

    const { error } =
      await supabase.auth.signOut();

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
    console.error(
      "Get current user error:",
      error
    );
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

export async function resetPassword(
  email: string
) {
  try {
    const supabase = createClient();

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email
      );

    if (error) throw error;
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );
    throw error;
  }
}

export async function updatePassword(
  password: string
) {
  try {
    const supabase = createClient();

    const { data, error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(
      "Update password error:",
      error
    );
    throw error;
  }
}

export async function deleteAccount() {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error(
        "Nenhum utilizador autenticado."
      );
    }

    throw new Error(
      "A eliminação de uma conta Auth requer uma operação administrativa no servidor."
    );
  } catch (error) {
    console.error(
      "Delete account error:",
      error
    );
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
    console.error(
      "Auth check error:",
      error
    );
    throw error;
  }
}

export function onAuthStateChange(
  callback: (
    event: AuthChangeEvent,
    session: Session | null
  ) => void
) {
  const supabase = createClient();

  return supabase.auth.onAuthStateChange(
    callback
  );
}

export async function getProfileById(
  profileId: string
) {
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
    console.error(
      "Get profile error:",
      error
    );
    throw error;
  }
}

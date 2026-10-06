import { cookies } from "next/headers";

import { createClient } from "@/app/lib/supabase/server";

import type { TaskMember } from "../types";

function mapMember(row: any): TaskMember {
  const profile = row.profiles;

  return {
    profileId: row.profile_id,
    firstName: profile?.first_name ?? "",
    lastName: profile?.last_name ?? "",
  };
}

async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

/* -------------------------------------------------------------------------- */
/* GET                                                                        */
/* -------------------------------------------------------------------------- */

export async function getTaskMembers(
  taskId: string,
): Promise<TaskMember[]> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("task_members")
    .select(
      `
        profile_id,
        profiles (
          profile_id,
          first_name,
          last_name,
          profile_picture
        )
      `,
    )
    .eq("task_id", taskId);

  if (error) {
    throw new Error(
      `Failed to load task members: ${error.message}`,
    );
  }

  return (data ?? []).map(mapMember);
}

/* -------------------------------------------------------------------------- */
/* ADD                                                                        */
/* -------------------------------------------------------------------------- */

export async function addTaskMember(
  taskId: string,
  profileId: string,
): Promise<TaskMember[]> {
  const supabase = await getSupabase();

  const normalizedProfileId = profileId.trim();

  if (!normalizedProfileId) {
    throw new Error("O colaborador é obrigatório.");
  }

  /*
   * Check first so the UI/service does not depend on a database
   * duplicate-key error for normal operation.
   */
  const { data: existingMember, error: existingError } =
    await supabase
      .from("task_members")
      .select("task_id")
      .eq("task_id", taskId)
      .eq("profile_id", normalizedProfileId)
      .maybeSingle();

  if (existingError) {
    throw new Error(
      `Failed to check task member: ${existingError.message}`,
    );
  }

  if (!existingMember) {
    const { error } = await supabase
      .from("task_members")
      .insert({
        task_id: taskId,
        profile_id: normalizedProfileId,
      });

    if (error) {
      throw new Error(
        `Failed to add task member: ${error.message}`,
      );
    }
  }

  return getTaskMembers(taskId);
}

/* -------------------------------------------------------------------------- */
/* REMOVE                                                                     */
/* -------------------------------------------------------------------------- */

export async function removeTaskMember(
  taskId: string,
  profileId: string,
): Promise<TaskMember[]> {
  const supabase = await getSupabase();

  const { error } = await supabase
    .from("task_members")
    .delete()
    .eq("task_id", taskId)
    .eq("profile_id", profileId);

  if (error) {
    throw new Error(
      `Failed to remove task member: ${error.message}`,
    );
  }

  return getTaskMembers(taskId);
}

/* -------------------------------------------------------------------------- */
/* REPLACE                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Replaces the complete assignment list for a task.
 *
 * This is useful for the TaskModal because the user can add/remove
 * multiple members before clicking "Guardar".
 */
export async function replaceTaskMembers(
  taskId: string,
  profileIds: string[],
): Promise<TaskMember[]> {
  const supabase = await getSupabase();

  const uniqueProfileIds = [
    ...new Set(
      profileIds
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];

  /*
   * Delete current assignments first.
   */
  const { error: deleteError } = await supabase
    .from("task_members")
    .delete()
    .eq("task_id", taskId);

  if (deleteError) {
    throw new Error(
      `Failed to clear task members: ${deleteError.message}`,
    );
  }

  /*
   * No members selected is valid.
   */
  if (uniqueProfileIds.length === 0) {
    return [];
  }

  const { error: insertError } = await supabase
    .from("task_members")
    .insert(
      uniqueProfileIds.map((profileId) => ({
        task_id: taskId,
        profile_id: profileId,
      })),
    );

  if (insertError) {
    throw new Error(
      `Failed to replace task members: ${insertError.message}`,
    );
  }

  return getTaskMembers(taskId);
}
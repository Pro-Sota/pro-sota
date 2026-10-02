import { createClient } from '@/app/lib/supabase/server';
import type { TaskMember } from '../types';
import { cookies } from 'next/headers';

function mapMember(row: any): TaskMember {
  const profile = row.profiles;
  return {
    profileId: row.profile_id,
    firstName: profile?.first_name ?? '',
    lastName: profile?.last_name ?? '',
    picture: profile?.profile_picture ?? null,
  };
}

async function getSupabase() {
    const cookieStore = await cookies();
    return createClient(cookieStore);
}

export async function getTaskMembers(taskId: string) {
    const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('task_members')
    .select(`profile_id, profiles (profile_id, first_name, last_name, profile_picture)`)
    .eq('task_id', taskId);

  if (error) throw new Error(`Failed to load task members: ${error.message}`);
  return (data ?? []).map(mapMember);
}

export async function addTaskMember(taskId: string, profileId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('task_members').insert({ task_id: taskId, profile_id: profileId });
  if (error) throw new Error(`Failed to add task member: ${error.message}`);
  return getTaskMembers(taskId);
}

export async function removeTaskMember(taskId: string, profileId: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('task_members').delete().eq('task_id', taskId).eq('profile_id', profileId);
  if (error) throw new Error(`Failed to remove task member: ${error.message}`);
  return getTaskMembers(taskId);
}

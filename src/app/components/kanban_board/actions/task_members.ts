'use server';

import { addTaskMember, getTaskMembers, removeTaskMember } from '../services/task_members';

export async function getTaskMembersAction(taskId: string) {
  return getTaskMembers(taskId);
}

export async function addTaskMemberAction(taskId: string, profileId: string) {
  return addTaskMember(taskId, profileId);
}

export async function removeTaskMemberAction(taskId: string, profileId: string) {
  return removeTaskMember(taskId, profileId);
}

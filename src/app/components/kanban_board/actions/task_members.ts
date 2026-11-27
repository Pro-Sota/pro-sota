"use server";

import {
  addTaskMember,
  getTaskMembers,
  removeTaskMember,
} from "../services/task_members";

export async function getTaskMembersAction(taskId: string) {
  return await getTaskMembers(taskId);
}

export async function addTaskMemberAction(
  taskId: string,
  profileId: string,
) {
  return await addTaskMember(taskId, profileId);
}

export async function removeTaskMemberAction(
  taskId: string,
  profileId: string,
) {
  return await removeTaskMember(taskId, profileId);
}